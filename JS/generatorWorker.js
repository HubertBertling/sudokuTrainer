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
        this.myNewPuzzleGenerator.generatePz();
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
    }

    simplifyPuzzleByNrOfCells(nr, puzzleRecord) {
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
                // let preRec = sudoApp.mySolver.calculatedPreRunRecord(extremePZ.puzzle);
                let preRec = sudoApp.mySolver.computePuzzlePreRunData(extremePZ.puzzle);
                if (preRec.level == 'Extrem schwer') {
                    extremePZ.preRunRecord.level = 'Extrem schwer';
                    extremePZ.preRunRecord.backTracks = '-';
                    return extremePZ;
                }
            }
        }
    }

    start() {
        this.generatePz();
    }

    generatePz() {
        let puzzleRecord = sudoApp.mySolver.generatePuzzle();
        if (puzzleRecord.preRunRecord.level == 'Leicht') {
            this.send2Main(puzzleRecord);

            // A simple puzzle can be made into a very simple puzzle 
            // by adding solved cells. The number of 7 added cells is arbitrary, but pragmatic.
            let verySimplePuzzleRecord
                = this.simplifyPuzzleByNrOfCells(7, puzzleRecord);
            verySimplePuzzleRecord.id = Date.now().toString(36) + Math.random().toString(36).substr(2);
            this.send2Main(verySimplePuzzleRecord);

            // A simple puzzle can be made to extremeVeryHeavy by deleting one given
            let extremeHeavyPuzzleRecord = this.deleteOnePuzzleCell(puzzleRecord);
            extremeHeavyPuzzleRecord.id = Date.now().toString(36) + Math.random().toString(36).substr(2);
            this.send2Main(extremeHeavyPuzzleRecord);

        } else if (puzzleRecord.preRunRecord.level !== 'Unlösbar'
            && puzzleRecord.preRunRecord.level !== 'Keine Angabe') {
            this.send2Main(puzzleRecord);
        }
    }

    async send2Main(puzzleRecord) {
        //  let webworkerFastSolver = new Worker("./JS/fastSolverWorker.js");
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
            // Post request
            let request = {
                name: 'puzzleGenerated',
                value: puzzleRecord
            }
            let str_request = JSON.stringify(request);
            self.postMessage(str_request, [channel.port2]);
        });
        //?????
        let str_response = await sendToMain();
        let response = JSON.parse(str_response);
        if (response.name == 'stopGeneration') {
            self.close();
        } else {
            this.generatePz();
        }
    }
}

// Launch and initialize the worker app
function startGeneratorApp() {
    //A worker app is assigned to the variable "sudoApp".
    sudoApp = new SudokuGeneratorApp();
    sudoApp.init();
}

startGeneratorApp();
