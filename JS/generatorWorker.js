// The Web Worker imports the common code
importScripts('./sudokuCommon.js');

// The Web Worker is assigned a message handler.

class SudokuGeneratorApp {
    constructor() {
        // ==============================================================
        // Components of the app
        // ==============================================================
        this.mySolver = new SudokuSolver(this);
        this.mySyncRunner = new SynchronousRunner();
        this.myNewPuzzleGenerator = new NewPuzzleGenerator();
    }

    init() {
        this.mySolver.init();
        // The fastest evaluation method is 'strict-plus'.
        this.mySolver.setActualEvalType('strict-plus');
    }

    startPuzzleGenerator() {
        this.myNewPuzzleGenerator.start();
    }


    breakpointPassed(bp) {
        this.mySyncRunner.breakpointPassed(bp);
    }

    getMySolver() {
        return this.mySolver;
    }
}

class NewPuzzleGenerator {
    constructor() {
        this.myPuzzleRecordBuffer = [];

    }

    simplifyPuzzleByNrOfCells(nr, puzzleRecord) {
        // Idea: Turn a simple puzzle into a very simple one by adding 
        // nr Givens to the current puzzle. The givens can be obtained 
        // from the cells of the entered solution.
        let randomCellOrder = Randomizer.getRandomNumbers(81, 0, 81);
        let nrSolved = 0;
        for (let i = 0; i < 81; i++) {
            let k = randomCellOrder[i];
            if (nrSolved < nr && puzzleRecord.puzzle[k].cellValue == '0') {
                puzzleRecord.puzzle[k].cellValue =
                    puzzleRecord.preRunRecord.solvedPuzzle[k].cellValue;
                puzzleRecord.puzzle[k].cellPhase = 'define';
                puzzleRecord.preRunRecord.solvedPuzzle[k].cellPhase = 'define';
                nrSolved++;
            }
        }
        puzzleRecord.statusGiven = puzzleRecord.statusGiven + nr;
        puzzleRecord.preRunRecord.level = 'Sehr leicht';
        puzzleRecord.preRunRecord.backTracks = 0;
        return puzzleRecord;
    }

    deleteOnePuzzleCell(puzzleRecord) {
        let extremePZ = JSON.parse(JSON.stringify(puzzleRecord));
        let randomCellOrder = Randomizer.getRandomNumbers(81, 0, 81);
        for (let i = 0; i < 81; i++) {
            let k = randomCellOrder[i];
            if (extremePZ.puzzle[k].cellValue !== '0') {
                extremePZ.puzzle[k].cellValue = '0';
                let preRec = sudoApp.mySolver.computePuzzlePreRunData(extremePZ.puzzle);
                if (preRec.level == 'Extrem schwer') {
                    extremePZ.preRunRecord.level = 'Extrem schwer';
                    extremePZ.preRunRecord.backTracks = '-';
                    return extremePZ;
                }
            }
        }
    }
    changedSolvedCell2given(puzzleRecord) {
        let unsolvablePZ = JSON.parse(JSON.stringify(puzzleRecord));
        let randomCellOrder = Randomizer.getRandomNumbers(81, 0, 81);
        for (let i = 0; i < 81; i++) {
            let k = randomCellOrder[i];
            if (unsolvablePZ.puzzle[k].cellValue == '0') {
                let changedValue = Number.parseInt(unsolvablePZ.preRunRecord.solvedPuzzle[k].cellValue) + 1;
                if (changedValue > 9) {
                    changedValue = 1;
                }
                unsolvablePZ.puzzle[k].cellValue = changedValue.toString();
                unsolvablePZ.puzzle[k].cellPhase = 'define';
                let preRec = sudoApp.mySolver.computePuzzlePreRunData(unsolvablePZ.puzzle);
                unsolvablePZ.preRunRecord.level = 'Unlösbar';
                unsolvablePZ.preRunRecord.backTracks = '-';
                return unsolvablePZ;
            }
        }
    }

    async start() {
        let commandFromMain = {
            name: 'proceedGeneration',
            value: [0, 0, 0, 0, 0, 0, 0]
        }
        while (true) {
            let command = await this.generatePz(commandFromMain);
            if (command.name == 'stopGeneration') {
                console.log('---> generatorWorker <--- has been stopped.')
                self.close();
            } else if (command.name == 'proceedGeneration') {
                commandFromMain = command;
            }
        }
    }

    async generatePz(previousCommand) {
        let [main_unsolvablePuzzles,
            main_verySimplePuzzles,
            main_simplePuzzles,
            main_mediumPuzzles,
            main_heavyPuzzles,
            main_veryHeavyPuzzles,
            main_extremeHeavyPuzzles] = previousCommand.value;

        // If the local buffer of generated puzzles is empty, generate a new puzzle.
        if (this.myPuzzleRecordBuffer.length < 2) {
            // Generate the next puzzle while waiting for the cammand from main.
            this.myPuzzleRecordBuffer.push(sudoApp.mySolver.generatePuzzle());
            // console.log('PUSH: ' + this.myPuzzleRecordBuffer.length);

        }

        let newCommand = {
            name: 'proceedGeneration',
            value: [0, 0, 0, 0, 0, 0, 0]
        }
        // Take the first puzzle record from the local buffer and send it to main.
        let puzzleRecord = this.myPuzzleRecordBuffer.shift();
        // console.log('SHIFT: ' + this.myPuzzleRecordBuffer.length);
        // console.log('Puzzle: ' + puzzleRecord.preRunRecord.level);

        let simplePuzzleRecord = undefined;
        if (puzzleRecord.preRunRecord.level == 'Leicht') {
            simplePuzzleRecord = JSON.parse(JSON.stringify(puzzleRecord));
            simplePuzzleRecord.id = Date.now().toString(36) + Math.random().toString(36).substr(2);
            if (main_simplePuzzles < 1) {
                newCommand = await this.send2Main(simplePuzzleRecord);
            }
            if (main_verySimplePuzzles < 1) {
                // A simple puzzle can be made into a very simple puzzle 
                // by adding solved cells. The number of 7 added cells is arbitrary, but pragmatic.
                let verySimplePuzzleRecord = this.simplifyPuzzleByNrOfCells(7, simplePuzzleRecord);
                verySimplePuzzleRecord.id = Date.now().toString(36) + Math.random().toString(36).substr(2);
                newCommand = await this.send2Main(verySimplePuzzleRecord);
            }
            if (main_extremeHeavyPuzzles < 1) {
                // A simple puzzle can be made to extremeHeavy by deleting one given
                let extremeHeavyRecord = this.deleteOnePuzzleCell(simplePuzzleRecord);
                extremeHeavyRecord.id = Date.now().toString(36) + Math.random().toString(36).substr(2);
                newCommand = await this.send2Main(extremeHeavyRecord);
            }
        } else if (puzzleRecord.preRunRecord.level == 'Sehr schwer') {
            // Case very heavy puzzle generated
            let veryHeavyRecord = JSON.parse(JSON.stringify(puzzleRecord));
            veryHeavyRecord.id = Date.now().toString(36) + Math.random().toString(36).substr(2);
            // A very heavy puzzle can be made into a unsolvable puzzle 
            // by adding a changed solved cell to the givens.
            let unsolvableRecord = this.changedSolvedCell2given(veryHeavyRecord);
            unsolvableRecord.id = Date.now().toString(36) + Math.random().toString(36).substr(2);

            if (main_veryHeavyPuzzles < 1) {
                newCommand = await this.send2Main(veryHeavyRecord);
            }
            if (main_unsolvablePuzzles < 1) {
                newCommand = await this.send2Main(unsolvableRecord);
            }
        }
        else if (puzzleRecord.preRunRecord.level == 'Mittel') {
            // Case medium puzzle generated
            let mediumPuzzleRecord = JSON.parse(JSON.stringify(puzzleRecord));
            mediumPuzzleRecord.id = Date.now().toString(36) + Math.random().toString(36).substr(2);
            if (main_mediumPuzzles < 1) {
                newCommand = await this.send2Main(mediumPuzzleRecord);
            }
        } else if (puzzleRecord.preRunRecord.level == 'Schwer') {
            // Case heavy puzzle generated
            let heavyPuzzleRecord = JSON.parse(JSON.stringify(puzzleRecord));
            heavyPuzzleRecord.id = Date.now().toString(36) + Math.random().toString(36).substr(2);
            if (main_heavyPuzzles < 1) {
                newCommand = await this.send2Main(heavyPuzzleRecord);
            }
        }
        return newCommand;
    }

    async send2Main(puzzleRecord) {
        if (puzzleRecord !== undefined) {
            let sendToMain = () => new Promise(function (myResolve, myReject) {
                const channel = new MessageChannel();
                channel.port1.onmessage = ({ data }) => {
                    channel.port1.close();
                    if (data.error) {
                        myReject(data.error);
                    } else {
                        myResolve(data.result);
                    }
                };
                // Post the newly generated puzzle to main
                let request = {
                    name: '',
                    value: puzzleRecord
                }

                switch (puzzleRecord.preRunRecord.level) {
                    case 'Unlösbar': {
                        request.name = 'puzzleGenerated_Unlösbar';
                        break;
                    }
                    case 'Sehr leicht': {
                        request.name = 'puzzleGenerated_Sehr_leicht';
                        break;
                    }
                    case 'Leicht': {
                        request.name = 'puzzleGenerated_Leicht';
                        break;
                    }
                    case 'Mittel': {
                        request.name = 'puzzleGenerated_Mittel';
                        break;
                    }
                    case 'Schwer': {
                        request.name = 'puzzleGenerated_Schwer';
                        break;
                    }
                    case 'Sehr schwer': {
                        request.name = 'puzzleGenerated_Sehr_schwer';
                        break;
                    }
                    case 'Extrem schwer': {
                        request.name = 'puzzleGenerated_Extrem_schwer';
                        break;
                    }
                    case 'Keine Angabe': {
                        request.name = 'puzzleGenerated_Keine_Angabe';
                        break;
                    }
                    default: {
                        throw new Error('Unexpected difficulty: '
                            + puzzleRecord.preRunRecord.level);
                    }
                }

                let str_request = JSON.stringify(request);
                self.postMessage(str_request, [channel.port2]);
                // console.log('Request ' + request.name);
            });
            //Receive main command 'proceedGeneration' or 'stopGeneration'
            let str_commandFromMain = await sendToMain();
            let commandFromMain = JSON.parse(str_commandFromMain);
            return commandFromMain;
        } else {
            throw new Error('puzzleRecord: ' + puzzleRecord);
        }
    }
}

// Launch and initialize the worker app
function startGeneratorApp() {
    //A worker app is assigned to the variable "sudoApp".
    sudoApp = new SudokuGeneratorApp();
    sudoApp.init();
    sudoApp.startPuzzleGenerator();
}

startGeneratorApp();
