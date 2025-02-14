// The Web Worker imports the common code
importScripts('./sudokuCommon.js');

// The Web Worker is assigned a message handler.

class SudokuGeneratorApp {
    constructor() {
        // ==============================================================
        // Components of the app
        // ==============================================================
        // 1. The solver component
        this.mySolver = new SudokuSolver(this);
        // 2. The synchronous search step loop.
        this.mySyncRunner = new SynchronousRunner();
        // 3. The PuzzleGenerator
        this.myNewPuzzleGenerator = new NewPuzzleGenerator();
    }

    init() {
        this.mySolver.myGrid.init();
        this.mySolver.setActualEvalType('strict-plus');
        this.mySolver.setPlayType('automated-solving');
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
        this.simpleSend1 = null;
        this.verySimpleSend2 = null;
        this.extremeSimpleSend3 = null;
    }

    deriveVerySimplePuzzle(puzzleRecord) {
        // 
        let localGrid = new SudokuGrid(sudoApp.mySolver);
        localGrid.init();
        localGrid.loadPuzzleArray(puzzleRecord.preRunRecord.solvedPuzzle);
        // set solved to given
        for (let i = 0; i < 81; i++) {
            if (localGrid.sudoCells[i].getValue() !== '0') {
                if (localGrid.sudoCells[i].getPhase() == 'play') {
                    localGrid.sudoCells[i].setPhase('define');
                }
            }
        }

        for (let i = 0; i < 81; i++) {
            if (localGrid.sudoCells[i].getValue() !== '0') {
                if (localGrid.sudoCells[i].myBlock.isComplete()
                    || localGrid.sudoCells[i].myRow.isComplete()
                    || localGrid.sudoCells[i].myCol.isComplete()) {
                    // clear cell
                    localGrid.sudoCells[i].clear();

                    puzzleRecord.puzzle[i] = {
                        cellValue: '0',
                        cellPhase: 'play'
                    }
                    puzzleRecord.preRunRecord.solvedPuzzle[i] = {
                        // cellValue: unchanged
                        cellPhase: 'play'
                    }

                } else {
                    puzzleRecord.puzzle[i] = {
                        // cellValue: unchanged
                        cellPhase: 'define'
                    } 
                    puzzleRecord.preRunRecord.solvedPuzzle[i] = {
                        // cellValue: unchanged
                        cellPhase: 'define'
                    }
                }
            }
        }
        puzzleRecord.statusGiven = localGrid.numberOfGivens();
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

    async start() {
        let commandFromMain = 'proceedGeneration';
        while (commandFromMain == 'proceedGeneration'
            || commandFromMain == undefined
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
        if (this.simpleSend1 == null) {
            let puzzleRecord = sudoApp.mySolver.generatePuzzle();
            if (puzzleRecord.preRunRecord.level == 'Leicht') {
                this.simpleSend1 = JSON.parse(JSON.stringify(puzzleRecord));
                let command = await this.send2Main(this.simpleSend1);
                return command;
            } else if (puzzleRecord.preRunRecord.level !== 'Unlösbar'
                && puzzleRecord.preRunRecord.level !== 'Keine Angabe') {
                let command = await this.send2Main(puzzleRecord);
                return command;
            }
        }

        if (this.simpleSend1 != null && this.verySimpleSend2 == null) {
            // A simple puzzle can be made into a very simple puzzle 
            // by adding solved cells. The number of 7 added cells is arbitrary, but pragmatic.
            this.verySimpleSend2 = this.deriveVerySimplePuzzle(this.simpleSend1);
            this.verySimpleSend2.id = Date.now().toString(36) + Math.random().toString(36).substr(2);
            let command = await this.send2Main(this.verySimpleSend2);
            return command;
        }

        if (this.simpleSend1 != null && this.verySimpleSend2 != null) {
            // A simple puzzle can be made to extremeVeryHeavy by deleting one given
            this.extremeHeavySend3 = this.deleteOnePuzzleCell(this.simpleSend1);
            this.extremeHeavySend3.id = Date.now().toString(36) + Math.random().toString(36).substr(2);
            this.simpleSend1 = null;
            this.verySimpleSend2 = null;
            this.extremeSimpleSend3 = null;
            let command = await this.send2Main(this.extremeHeavySend3);
            return command;
        }
    }

    async send2Main(puzzleRecord) {
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
                name: 'puzzleGenerated',
                value: puzzleRecord
            }
            let str_request = JSON.stringify(request);
            self.postMessage(str_request, [channel.port2]);
        });
        //Receive main command 'proceedGeneration' or 'stopGeneration'
        let str_response = await sendToMain();
        let response = JSON.parse(str_response);
        return response.name;
    }
}

// Launch and initialize the worker app
function startGeneratorApp() {
    //A worker app is assigned to the variable "sudoApp".
    sudoApp = new SudokuGeneratorApp();
    sudoApp.init();
}

startGeneratorApp();
