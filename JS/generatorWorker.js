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

    /*
    Start: generieren 
               senden generieren warten 

     Stopp: stop 
     Continue: senden-generieren-warten
     */

    async start() {
        let commandFromMain = undefined;
        while (commandFromMain == 'proceedGeneration'
            || commandFromMain == undefined // The first time, there is no command from main, but the generator should start anyway.
        ) {
            commandFromMain = await this.generatePz();
        }
        if (commandFromMain == 'stopGeneration') {
            console.log('---> generatorWorker <--- has been stopped.')
            self.close();
        } else {
            console.log('GENERATOR: Unexpected Command from main: ' + commandFromMain);
        }
    }

    async generatePz() {
        if (this.myPuzzleRecordBuffer.length == 0) {
            // Generate the next puzzle while waiting for the cammand from main.
            this.myPuzzleRecordBuffer.push(sudoApp.mySolver.generatePuzzle());
        }
        let puzzleRecord = this.myPuzzleRecordBuffer.shift();
        let command = undefined;

        if (puzzleRecord.preRunRecord.level == 'Leicht') {
            // Case simple puzzle generated

            let simplePuzzleRecord = JSON.parse(JSON.stringify(puzzleRecord));
            simplePuzzleRecord.id = Date.now().toString(36) + Math.random().toString(36).substr(2);
            let commandPromiseSimplePuzzle = this.send2Main(simplePuzzleRecord);

            // A simple puzzle can be made into a very simple puzzle 
            // by adding solved cells. The number of 7 added cells is arbitrary, but pragmatic.
            let verySimplePuzzleRecord = this.simplifyPuzzleByNrOfCells(7, simplePuzzleRecord);
            verySimplePuzzleRecord.id = Date.now().toString(36) + Math.random().toString(36).substr(2);
            let commandPromiseVerySimplePuzzle = this.send2Main(verySimplePuzzleRecord);

            // A simple puzzle can be made to extremeHeavy by deleting one given
            let extremeHeavyRecord = this.deleteOnePuzzleCell(simplePuzzleRecord);
            extremeHeavyRecord.id = Date.now().toString(36) + Math.random().toString(36).substr(2);
            let commandPromiseExtremeHeavyRecord = this.send2Main(extremeHeavyRecord);

            // Generate the next puzzle while waiting for the cammand from main.
            this.myPuzzleRecordBuffer.push(sudoApp.mySolver.generatePuzzle());
            command = await commandPromiseSimplePuzzle;
            command = await commandPromiseVerySimplePuzzle;
            command = await commandPromiseExtremeHeavyRecord;

        } else if (puzzleRecord.preRunRecord.level == 'Sehr schwer') {
            // Case very heavy puzzle generated
            let veryHeavyRecord = JSON.parse(JSON.stringify(puzzleRecord));
            // A very heavy puzzle can be made into a unsolvable puzzle 
            // by adding a changed solved cell to the givens.
            let unsolvableRecord = this.changedSolvedCell2given(veryHeavyRecord);
            unsolvableRecord.id = Date.now().toString(36) + Math.random().toString(36).substr(2);

            let commandPromiseVeryHeavyRecord = this.send2Main(veryHeavyRecord);
            let commandPromiseUnsolvableRecord = this.send2Main(unsolvableRecord);
            // Generate the next puzzle while waiting for the cammand from main.

            command = await commandPromiseVeryHeavyRecord;
            command = await commandPromiseUnsolvableRecord;
        }
        else if (puzzleRecord.preRunRecord.level !== 'Unlösbar'
            && puzzleRecord.preRunRecord.level !== 'Keine Angabe') {
            // The normal case
            let normalPuzzleRecord = JSON.parse(JSON.stringify(puzzleRecord));
            let commandPromiseNormalPuzzleRecord = this.send2Main(normalPuzzleRecord);

            // Generate the next puzzle while waiting for the cammand from main.
            this.myPuzzleRecordBuffer.push(sudoApp.mySolver.generatePuzzle());
            command = await commandPromiseNormalPuzzleRecord;
        }
        return command;
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
            });
            //Receive main command 'proceedGeneration' or 'stopGeneration'
            let str_response = await sendToMain();
            let response = JSON.parse(str_response);
            return response.name;
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
