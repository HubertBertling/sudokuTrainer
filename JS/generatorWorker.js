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
        let simplifiedPuzzle = structuredClone(puzzleRecord);
        let randomCellOrder = Randomizer.getRandomNumbers(81, 0, 81);
        let nrSolved = 0;
        for (let i = 0; i < 81; i++) {
            let k = randomCellOrder[i];
            if (nrSolved < nr && simplifiedPuzzle.puzzle[k].cellValue == '0') {
                simplifiedPuzzle.puzzle[k].cellValue =
                    puzzleRecord.preRunRecord.solvedPuzzle[k].cellValue;
                simplifiedPuzzle.puzzle[k].cellPhase = 'define';
                simplifiedPuzzle.preRunRecord.solvedPuzzle[k].cellPhase = 'define';
                nrSolved++;
            }
        }
        simplifiedPuzzle.statusGiven = puzzleRecord.statusGiven + nr;
        simplifiedPuzzle.preRunRecord.level = 'Sehr leicht';
        simplifiedPuzzle.preRunRecord.backTracks = 0;
        return simplifiedPuzzle;
    }

    deleteOnePuzzleCell(puzzleRecord) {
        let extremePZ = structuredClone(puzzleRecord);
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
        // Idea: Turn a solved puzzle into an unsolvable one 
        // by changing one solved cell of the solution to a different value 
        // and making it a given. The changed cell is selected randomly 
        // from the cells of the entered solution.

        // puzzleRecord is a solved puzzle. 
        let unsolvablePZ = structuredClone(puzzleRecord);
        let randomCellOrder = Randomizer.getRandomNumbers(81, 0, 81);
        for (let i = 0; i < 81; i++) {
            let k = randomCellOrder[i];
            let solvedCell = puzzleRecord.preRunRecord.solvedPuzzle[k];
            if (solvedCell.cellPhase == 'play' && solvedCell.cellValue !== '0') {
                // Change the current cell value to a different value 
                // and make it a given.
                let changedValue = Number.parseInt(solvedCell.cellValue) + 1;
                if (changedValue > 9) {
                    changedValue = 1;
                }
                let tmpCellValue = unsolvablePZ.puzzle[k].cellValue;
                let tmpCellPhase = unsolvablePZ.puzzle[k].cellPhase;
                let tmpPreRec = unsolvablePZ.preRunRecord;

                unsolvablePZ.puzzle[k].cellValue = changedValue.toString();
                unsolvablePZ.puzzle[k].cellPhase = 'define';
                let preRec = sudoApp.mySolver.computePuzzlePreRunData(unsolvablePZ.puzzle);
                unsolvablePZ.preRunRecord = preRec;
                if (preRec.level == 'Widerspruchsvoll') {
                    // ignore this puzzle because it is not really unsolvable, 
                    // but just contradictious.
                    unsolvablePZ.puzzle[k].cellValue = tmpCellValue;
                    unsolvablePZ.puzzle[k].cellPhase = tmpCellPhase;
                    unsolvablePZ.preRunRecord = tmpPreRec;
                } else if (preRec.level == 'Unlösbar') {
                    return unsolvablePZ;
                } else {
                    throw new Error('Unexpected level: ' + preRec.level);
                }
            }
        }
        return unsolvablePZ;
    }

    async start() {
        let commandFromMain = {
            name: 'proceedGeneration',
            value: [0, 0, 0, 0, 0, 0, 0]
        }
        while (true) {
            let command = await this.generatePz(commandFromMain);
            if (command.name == 'proceedGeneration') {
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

        let puzzleSentToMain = false;
        // If the local buffer of generated puzzles is empty, generate a new puzzle.
        if (this.myPuzzleRecordBuffer.length < 2) {
            // Generate the next puzzle while waiting for the cammand from main.
            let pzRecord = sudoApp.mySolver.generatePuzzle();
            if (pzRecord.preRunRecord.level == 'Leicht'
                || pzRecord.preRunRecord.level == 'Mittel'
                || pzRecord.preRunRecord.level == 'Schwer'
                || pzRecord.preRunRecord.level == 'Sehr schwer'
            )
                // Only these difficulty levels are generated from scratch. 
                // The others are created by modifying these basic difficulty levels.
                this.myPuzzleRecordBuffer.push(pzRecord);
            else {
                throw new Error('Unexpected puzzle pushed into record buffer. Level: ' + pzRecord.preRunRecord.level);
            }
        }

        // Take the first puzzle record from the local buffer and send it to main.
        let puzzleRecordFromBuffer = undefined;
        if (this.myPuzzleRecordBuffer.length > 0) {
            puzzleRecordFromBuffer = this.myPuzzleRecordBuffer.shift();
        } else {
            throw new Error('Unexpected empty puzzle record buffer.');
        }
        let generatedPuzzleRecord = structuredClone(puzzleRecordFromBuffer);
        generatedPuzzleRecord.id = Date.now().toString(36) + Math.random().toString(36).substr(2);

        switch (generatedPuzzleRecord.preRunRecord.level) {
            case 'Leicht': {
                let verySimplePuzzleRecord = this.simplifyPuzzleByNrOfCells(7, generatedPuzzleRecord);
                verySimplePuzzleRecord.id = Date.now().toString(36) + Math.random().toString(36).substr(2);

                // A simple puzzle can be made to extremeHeavy by deleting one given
                let extremeHeavyRecord = this.deleteOnePuzzleCell(generatedPuzzleRecord);
                extremeHeavyRecord.id = Date.now().toString(36) + Math.random().toString(36).substr(2);

                if (main_simplePuzzles < 1
                    || main_verySimplePuzzles < 1
                    || main_extremeHeavyPuzzles < 1
                ) {
                    let simplePuzzleCommand = await this.send2Main(generatedPuzzleRecord);
                    let verySimpleCommand = await this.send2Main(verySimplePuzzleRecord);
                    let extremeHeavyCommand = await this.send2Main(extremeHeavyRecord);

                    if (simplePuzzleCommand.name == 'stopGeneration'
                        || verySimpleCommand.name == 'stopGeneration'
                        || extremeHeavyCommand.name == 'stopGeneration'
                    ) {
                        console.log('---> generatorWorker <--- has been stopped.')
                        self.close();
                    } else {
                        puzzleSentToMain = true;
                        let commandFromMain = structuredClone(previousCommand);
                        commandFromMain.name = 'proceedGeneration';
                        return commandFromMain;
                    };
                }
                break;
            }
            case 'Mittel': {
                // A puzzle can be made into a unsolvable puzzle 
                // by adding a changed solved cell to the givens.
                let unsolvableRecord = this.changedSolvedCell2given(generatedPuzzleRecord);
                unsolvableRecord.id = Date.now().toString(36) + Math.random().toString(36).substr(2);
                if (main_mediumPuzzles < 1
                    || main_unsolvablePuzzles < 1
                ) {
                    let mediumPuzzleCommand = await this.send2Main(generatedPuzzleRecord);
                    let unsolvablePuzzleCommand = await this.send2Main(unsolvableRecord);

                    if (mediumPuzzleCommand.name == 'stopGeneration'
                        || unsolvablePuzzleCommand.name == 'stopGeneration'
                    ) {
                        console.log('---> generatorWorker <--- has been stopped.')
                        self.close();
                    }
                    else {
                        puzzleSentToMain = true;
                        let commandFromMain = structuredClone(previousCommand);
                        commandFromMain.name = 'proceedGeneration';
                        return commandFromMain;
                    };
                }
                break;
            }
            case 'Schwer': {
                if (main_heavyPuzzles < 1) {
                    // Schweres Puzzle senden
                    let newCommand = await this.send2Main(generatedPuzzleRecord);
                    if (newCommand.name == 'stopGeneration') {
                        console.log('---> generatorWorker <--- has been stopped.')
                        self.close();
                    } else {
                        puzzleSentToMain = true;
                        return newCommand
                    };
                }
                break;
            }
            case 'Sehr schwer': {
                if (main_veryHeavyPuzzles < 1) {
                    // Sehr schweres Puzzle senden
                    let newCommand = await this.send2Main(generatedPuzzleRecord);
                    if (newCommand.name == 'stopGeneration') {
                        console.log('---> generatorWorker <--- has been stopped.')
                        self.close();
                    } else {
                        puzzleSentToMain = true;
                        return newCommand
                    };
                }
                break;
            }
            default: {
                throw new Error('Unexpected level from puzzleRecordFromBuffer: '
                    + puzzleRecordFromBuffer.preRunRecord.level);
            }
        }
        let commandFromMain = structuredClone(previousCommand);
        commandFromMain.name = 'proceedGeneration';
        return commandFromMain;
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
                    case 'Widerspruchsvoll':
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
