// The Web Worker imports the common code
importScripts('./sudokuCommon.js');

// The Web Worker is assigned a message handler.
self.addEventListener("message", (event) => {
    let request = JSON.parse(event.data);
    if (request.name == 'preRun') {
        try {
            // If the request is "preRun", the Web Worker computes the meta data
            // of the puzzle, given in the request
            sudoApp.mySolver.setCurrentPuzzle(PuzzleRecord.nullPuzzleRecord())
            let preRunRecord = sudoApp.mySolver.computePuzzlePreRunData(request.value);
            // obtained through a preliminary run
            // Notice: the solutionRecord contains the solved puzzle
            let response = {
                name: 'preRun',
                value: preRunRecord
            }
            let str_response = JSON.stringify(response);
            // The serialized puzzle is sent as a message to Main
            // respond on the received port
            event.ports[0].postMessage({ result: str_response });
            event.ports[0].close();
        } catch (e) {
            event.ports[0].postMessage({ error: e });
        }
        self.close();
    }
}, false);
class SudokuFastSolverApp {
    constructor() {
        // ==============================================================
        // Components of the app
        // ==============================================================
        this.mySolver = new SudokuSolver(this);
        this.mySyncRunner = new SynchronousRunner();
    }

    init() {
        this.mySolver.init();
        // The fastest evaluation method is 'strict-plus'.
        this.mySolver.setActualEvalType('lazy');
    }

    breakpointPassed(bp) {
        this.mySyncRunner.breakpointPassed(bp);
    }

    getMySolver() {
        return this.mySolver;
    }
}

// Launch and initialize the worker app
function startFastSolverApp() {
    //A worker app is assigned to the variable "sudoApp".
    sudoApp = new SudokuFastSolverApp();
    sudoApp.init();
}

startFastSolverApp();
