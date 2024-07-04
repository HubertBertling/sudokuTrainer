let sudoApp;
let VERSION = 31;

// ==========================================
// Basic classes
// ==========================================
class Randomizer {
    static getRandomIntInclusive(min, max) {
        min = Math.ceil(min);
        max = Math.floor(max);
        return Math.floor(Math.random() * (max - min + 1)) + min;
    }
    static getRandomNumbers(numberOfrandoms, min, max) {
        let randoms = [];
        let currentRandom = 0;
        while (randoms.length < numberOfrandoms) {
            currentRandom = Randomizer.getRandomIntInclusive(min, max);
            if (currentRandom < max && !randoms.includes(currentRandom)) {
                randoms.push(currentRandom);
            }
        }
        return randoms;
    }
}
class MatheSet extends Set {
    // The mathematical set without repetitions.
    // Used intensively for the calculation of inadmissible
    // candidates in the Sudoku matrix.
    constructor(arr) {
        super(arr);
    }
    logSet() {
        console.log('       ====  Set: ');
        this.forEach(elem => {
            console.log('                     ' + elem);
        })
    }
    isSuperset(subset) {
        for (var elem of subset) {
            if (!this.has(elem)) {
                return false;
            }
        }
        return true;
    }

    isSubset(superset) {
        for (var elem of this) {
            if (!superset.has(elem)) {
                return false;
            }
        }
        return true;
    }

    union(setB) {
        var _union = new MatheSet(this);
        for (var elem of setB) {
            _union.add(elem);
        }
        return _union;
    }
    difference(setB) {
        var _difference = new MatheSet(this);
        for (var elem of setB) {
            _difference.delete(elem);
        }
        return _difference;
    }

    intersection(setB) {
        var _intersection = new MatheSet();
        for (var elem of setB) {
            if (this.has(elem)) {
                _intersection.add(elem);
            }
        }
        return _intersection;
    }
    equals(setB) {
        if (this.size !== setB.size) {
            return false
        } else {
            for (var a of this) if (!setB.has(a)) return false;
            return true;
        }
    }
}
class MVC_View {
    constructor(model) {
        this.myModel = model;
        this.myNode = null;
    }

    getMyModel() {
        return this.myModel;
    }
    setMyNode(node) {
        this.myNode = node;
    }
    getMyNode() {
        return this.myNode;
    }

}
class MVC_Model {
    constructor() {
        this.myObservers = [];
        // Dies ist eine Sondersituation. In dieser Anwendung
        // besitzt jedes Model eine View.
        this.myView = null;
        this.parentModel = null;
    }
    attach(view) {
        // Die View kann ein Beobachter des Models sein.
        // Aber nicht in jedem Fall.
        // Im Puzzle-Generator sind die Views abgeschaltet,
        // sie sind nicht als Beobachter eingetragen.
        this.myObservers.push(view);
    }
    detach(view) {
        this.myObservers.forEach(observer => {
            if (observer == view) {
                let myIndex = this.myObservers.indexOf(view);
                if (myIndex !== -1) {
                    this.myObservers.splice(myIndex, 1);
                }
            }
        });
    }

    setMyView(view) {
        this.myView = view;
    }
    getMyView() {
        return this.myView;
    }

    notify() {
        // Die eigene View anzeigen
        // console.log('notify()-calls: ' + this.notifyCalls++);
        this.myObservers.forEach(observer => {
            observer.upDate();
        });
    }

    notifyAspect(aspect, aspectValue) {
        // Die eigene View anzeigen
        this.myObservers.forEach(observer => {
            observer.upDateAspect(aspect, aspectValue);
        });
    }
}
// ==========================================
// Navigation and Dialogs 
// ==========================================
class ProgressBar {
    constructor() {
        this.elemPlay = document.getElementById("myBarPlay");
        this.elemDef = document.getElementById("myBarDef");
        this.elemUnset = document.getElementById("total-bar-value");
    }
    init() {
        this.elemPlay.style.width = "10%"
        this.elemDef.style.width = "10%"
    }
    setValue(defCount, totalCount) {
        let playCount = totalCount - defCount;
        let defCountProzent = Math.floor(defCount / 81 * 100);
        let playCountProzent = Math.floor(totalCount / 81 * 100);

        this.elemDef.style.width = defCountProzent + "%";
        this.elemPlay.style.width = playCountProzent + "%";
        if (defCount < 10) {
            this.elemDef.innerHTML = '';
        } else {
            this.elemDef.innerHTML = defCount;
        }
        if (playCount < 2) {
            this.elemPlay.innerHTML = '';
            this.elemPlay.style.paddingRight = "0px"

        } else {
            this.elemPlay.innerHTML = playCount;
            this.elemPlay.style.paddingRight = "5px"
        }
        this.elemUnset.innerHTML = 81 - totalCount;
    }
}
class NavigationBar {
    constructor() {
    }

    init() {
        /* Loop through all dropdown buttons to toggle between hiding and showing 
        its dropdown content - This allows the user to have multiple dropdowns 
        without any conflict */
        var dropdown = document.getElementsByClassName("dropdown-btn");
        let caretDownImg = document.getElementById('caret-down-img');
        let noCaretImg = document.getElementById('no-caret-img');
        var i;
        noCaretImg.style.display = "block";
        caretDownImg.style.display = "none";

        for (i = 0; i < dropdown.length; i++) {
            dropdown[i].addEventListener("click", function () {
                this.classList.toggle("active");
                var dropdownContent = this.nextElementSibling;
                if (dropdownContent.style.display === "block") {
                    noCaretImg.style.display = "block";
                    caretDownImg.style.display = "none";
                    dropdownContent.style.display = "none";
                } else {
                    dropdownContent.style.display = "block";
                    noCaretImg.style.display = "none";
                    caretDownImg.style.display = "block";
                }
            });
        }
    }
    openNav() {
        document.getElementById("mySidenav").style.width = "250px";
    }
    closeNav() {
        let dropdown = document.getElementById("dropdown-btn-new");
        let dropdownContent = document.getElementById("dropdown-container-btn-new");
        if (dropdownContent.style.display === "block") {
            dropdown.click();
        }
        document.getElementById("mySidenav").style.width = "0";
    }
}
class PuzzleDBDialog {
    constructor() {
        this.myOpen = false;
        this.myPuzzleDBDialogNode = document.getElementById("db-puzzle-dialog")
    }

    open() {
        this.myOpen = true;
        this.myPuzzleDBDialogNode.showModal();
        this.myPuzzleDBView = new SudokuPuzzleDBView(sudoApp.myPuzzleDB);
        sudoApp.myPuzzleDB.attach(this.myPuzzleDBView);
    }

    close() {
        if (this.myOpen) {
            this.myPuzzleDBDialogNode.close();
            this.myOpen = false;
            sudoApp.myPuzzleDB.detach(this.myPuzzleDBView);
        }
    }
}
class ConfirmDialog {
    constructor() {
        this.myOpen = false;
        this.myConfirmDlgNode = document.getElementById("confirm-dlg");
        this.myHeader = document.getElementById("confirm-dlg-header");
        this.myTextNode = document.getElementById("confirm-dlg-body");
        this.okNode = document.getElementById("btn-confirm-ok");
        this.cancelNode = document.getElementById("btn-confirm-cancel");
        this.myRequestOperation = undefined;
        this.thisPointer = undefined;
        // Mit der Erzeugung des Wrappers werden 
        // auch der Eventhandler OK und Abbrechen gesetzt
        this.okNode.addEventListener('click', () => {
            sudoApp.myConfirmDlg.close();
            sudoApp.myConfirmDlg.myRequestOperation.call(this.thisPointer);
            sudoApp.mySolver.notify();
        });
        this.cancelNode.addEventListener('click', () => {
            sudoApp.myConfirmDlg.close();
        });
    }

    open(thisPointer, rqOp, header, question) {
        this.myOpen = true;
        this.thisPointer = thisPointer;
        this.myRequestOperation = rqOp;
        this.myHeader.innerText = header;
        this.myTextNode.innerText = question;
        this.myConfirmDlgNode.showModal();
    }

    close() {
        if (this.myOpen) {
            this.myConfirmDlgNode.close();
            this.myOpen = false;
        }
    }
}
class PuzzleSaveRenameDialog {
    constructor() {
        this.okHandler = undefined;
        this.cancelHandler = undefined,
            this.myOpen = false;
        this.myContentSaveDlgNode = document.getElementById("contentSaveDlg")
        this.myPuzzleNameNode = document.getElementById("puzzle-name");
        this.okNode = document.getElementById("btn-saveStorageOK");
        this.cancelNode = document.getElementById("btn-saveStorageCancel");
    }
    open(ok, cancel, currentRecord) {
        this.okHandler = ok;
        this.okNode.addEventListener('click', ok);
        this.cancelHandler = cancel;
        this.cancelNode.addEventListener('click', cancel);
        this.myPuzzleNameNode.value = currentRecord.name;
        this.myId = currentRecord.id;
        this.myOpen = true;
        this.myContentSaveDlgNode.showModal();
    }

    close() {
        if (this.myOpen) {
            this.okNode.removeEventListener('click', this.okHandler);
            this.cancelNode.removeEventListener('click', this.cancelHandler);
            this.myContentSaveDlgNode.close();
            this.myOpen = false;
        }
    }

    getPuzzleName() {
        return this.myPuzzleNameNode.value;
    }
}
class TrackerDialog {
    constructor() {
        this.btnContainer = document.getElementById("mobile-btn-container");
        this.trackerNrOfSolutions = document.getElementById("number-of-solutions");
        this.trackerDlgNode = document.getElementById("trackerDlg");
        this.trackerImage = document.getElementById("trackerImg");
        this.backtrackOptions = document.getElementById("backtrack-options");
        this.btnContinueNode = document.getElementById("btn-backtrack-continue");
        this.btnStepNode = document.getElementById("btn-backtrack-step");
        this.btnBreakpointSettingNode = document.getElementById("btn-breakpoint-settings");
        this.btnAllNode = document.getElementById("btn-backtrack-all");
        this.btnStopNode = document.getElementById("btn-backtrack-stop");
        this.btnFastStepNode = document.getElementById("btn-backtrack-fast-step");
        this.btnFastNode = document.getElementById("btn-backtrack-fast");
        this.trackerDlgNode.close();
        this.myOpen = false;
        this.btnContainer.style.visibility = "visible";

        this.btnContinueNode.addEventListener('click', () => {
            sudoApp.mySolverController.trackerDlgStepSequencePressed();
        });
        this.btnStepNode.addEventListener('click', () => {
            sudoApp.mySolverController.trackerDlgStepPressed();
        });
        this.btnBreakpointSettingNode.addEventListener('click', () => {
            sudoApp.mySolverController.btnBreakPointSettingsPressed();
        });
        this.btnStopNode.addEventListener('click', () => {
            sudoApp.mySolverController.trackerDlgStopPressed();
        });
        this.btnFastStepNode.addEventListener('click', () => {
            sudoApp.mySolverController.trackerDlgFastStepPressed();
        });
        this.btnFastNode.addEventListener('click', () => {
            sudoApp.mySolverController.trackerDlgFastPressed();
        });
    }
    open() {
        this.btnContainer.style.visibility = "hidden";
        this.reSetNumberOfSolutions();
        sudoApp.mySolver.notify();
        this.myOpen = true;
        this.trackerDlgNode.show();
    }
    isOpen() {
        return this.myOpen;
    }
    close() {
        if (this.myOpen) {
            sudoApp.myClockedSearchStepLoop.stop('cancelled');
            sudoApp.mySynchronousSearchStepLoop.stop('cancelled');
            sudoApp.myClockedSolutionLoop.stop('cancelled');

            sudoApp.mySolver.deleteSearch();
            this.reSetNumberOfSolutions();
            this.trackerDlgNode.close();
            this.btnContainer.style.visibility = "visible";
            this.myOpen = false;
        }
    }
    setNumberOfSolutions(nr) {
        this.solutionNumber = nr;
        this.trackerNrOfSolutions.innerHTML = this.solutionNumber;
    }
    reSetNumberOfSolutions() {
        this.solutionNumber = 0;
        this.trackerNrOfSolutions.innerHTML = this.solutionNumber;
    }
    getNumberOfSolutions() {
        return this.solutionNumber;
    }
}
class InfoDialog {
    constructor() {
        this.dlgNode = document.getElementById("infoDlg");
        this.infoDlgHeaderNode = document.getElementById("infoDlgHeader");
        this.iconNode = document.getElementById("infoIcon");
        this.infoDlgBodyNode = document.getElementById("infoDlgBody");
        this.okNode = document.getElementById("infoDlg-OK-Btn");
        this.dlgNode.close();
        this.myOpen = false;
        this.okNode.addEventListener('click', () => {
            sudoApp.mySolverController.infoDlgOKPressed();
        });
    }
    open(headerText, infoModus, bodyText) {
        this.infoDlgHeaderNode.innerHTML = headerText;
        if (infoModus == 'solutionDiscovered') {
            this.iconNode.src = "images/glueckwunsch.jpg";
        } else if (infoModus == 'positiv') {
            this.iconNode.src = "images/ok.png";
        } else if (infoModus == 'negativ') {
            this.iconNode.src = "images/fail.png";
        } else if (infoModus == 'info') {
            this.iconNode.src = "images/info.png";
        }
        this.infoDlgBodyNode.innerHTML = bodyText;
        this.myOpen = true;
        this.dlgNode.showModal();
    }
    isOpen() {
        return this.myOpen;
    }

    close() {
        if (this.myOpen) {
            this.dlgNode.close();
            this.myOpen = false;
            this.iconNode.src = "";
        }
    }
}
class SettingsDialog {
    constructor() {
        this.dlgNode = document.getElementById("settings-dlg");
        this.closeNode = document.getElementById("settings-dlg-close-btn");

        this.topicEvalType = document.getElementById("pc-eval");
        this.topicPlayMode = document.getElementById("play-mode");
        this.topicBreakpoints = document.getElementById("breakpoint-settings");
        this.topicIOTechnique = document.getElementById("io-technique");
        this.myOpen = false;
        this.closeNode.addEventListener('click', () => {
            sudoApp.mySolverController.settingsClosePressed();
        });
    }
    open() {
        this.topicEvalType.style.display = 'block';
        this.topicPlayMode.style.display = 'block';
        this.topicBreakpoints.style.display = 'block';;
        this.topicIOTechnique.style.display = 'block';;

        this.myOpen = true;
        this.dlgNode.showModal();
    }
    openTopicBreakpoints() {
        this.topicEvalType.style.display = 'none';
        this.topicPlayMode.style.display = 'none';
        this.topicBreakpoints.style.display = 'block';
        this.topicIOTechnique.style.display = 'none';

        this.myOpen = true;
        this.dlgNode.showModal();
    }
    close() {
        if (this.myOpen) {
            this.dlgNode.close();
            this.myOpen = false;
        }
    }
}
// ==========================================
// Automation
// ==========================================
class SynchronousRunner {
    // The synchronous runner is a parametric runner that is used to find solutions efficiently.
    // Parameter is the step that is called in the runner's loop. It has two fixed breakpoints, 
    // namely 'solutionDiscovered' and 'searchCompleted'.
    constructor() {
        this.stopped = true;
        this.myStoppingBreakpoint = undefined;
    }

    start(thisPointer, step) {
        if (!this.isRunning()) {
            this.stopped = false;
            this.myStoppingBreakpoint = undefined;
            while (!this.stopped) {
                // this runner calls the step, given in the parameter'step', in a loop
                step.call(thisPointer);
            };
        }
    }

    isRunning() {
        return this.stopped == false;
    }

    breakpointPassed(bp) {
        switch (bp) {
            case 'solutionDiscovered':
            case 'searchCompleted': {
                this.stop(bp);
                break;
            }
            case 'contradiction':
            case 'multipleOption':
            case 'single':
            case 'hiddenSingle': {
                // Ignore these breakpoints
                break;
            }
            default: {
                throw new Error('Unexpected breakpoint: ' + bp);
            }
        }
    }
    stop(bp) {
        this.stopped = true;
        this.myStoppingBreakpoint = bp;
    }

    getMyStoppingBreakpoint() {
        return this.myStoppingBreakpoint;
    }
}
class ClockedRunner {
    constructor() {
        this.timer = false;
    }

    start(thisPointer, step) {
        if (!this.isRunning()) {
            this.myStoppingBreakpoint = undefined;
            this.timer = window.setInterval(() => {
                step.call(thisPointer);
            }, 75);
        }
    }

    isRunning() {
        // Der timer ist ungleich false, wenn er läuft.
        return this.timer !== false;
    }

    stop(bp) {
        if (this.isRunning()) {
            // Die automatische Ausführung
            window.clearInterval(this.timer);
            this.timer = false;
        }
        this.stopped = true;
        this.myStoppingBreakpoint = bp;
    }

    getMyStoppingBreakpoint() {
        return this.myStoppingBreakpoint;
    }
}

class ClockedSearchStepLoop extends ClockedRunner {
    // Clocked search step loop with breakpoints 
    // that can be switched on and off.
    // It can be used to monitor the step by step solution search run in detail.
    constructor() {
        super();
        this.myBreakpoints = {
            contradiction: true,
            multipleOption: true,
            single: true,
            hiddenSingle: true,
            solutionDiscovered: true,
        }
    }
    start() {
        if (sudoApp instanceof SudokuMainApp) {
            super.start(sudoApp.mySolver,
                sudoApp.mySolver.performSearchStep);
        }
    }
    setBreakpoints(bps) {
        this.myBreakpoints.contradiction = bps.contradiction;
        this.myBreakpoints.multipleOption = bps.multipleOption;
        this.myBreakpoints.single = bps.single;
        this.myBreakpoints.hiddenSingle = bps.hiddenSingle;
        this.myBreakpoints.solutionDiscovered = bps.solutionDiscovered;
    }
    getBreakpoints() {
        return this.myBreakpoints;
    }

    breakpointPassed(bp) {
        switch (bp) {
            case 'solutionDiscovered': {
                if (this.myBreakpoints.solutionDiscovered) {
                    this.stop(bp);
                }
                break;
            }
            case 'searchCompleted': {
                this.stop(bp);
                break;
            }
            case 'contradiction': {
                if (this.myBreakpoints.contradiction) {
                    this.stop(bp);
                }
                break;
            }
            case 'multipleOption': {
                if (this.myBreakpoints.multipleOption) {
                    this.stop(bp);
                }
                break;
            }
            case 'single': {
                if (this.myBreakpoints.single) {
                    this.stop(bp);
                }
                break;
            }
            case 'hiddenSingle': {
                if (this.myBreakpoints.hiddenSingle) {
                    this.stop(bp);
                }
                break;
            }
            default: {
                throw new Error('Unexpected breakpoint: ' + bp);
            }
        }
    }
}
class SynchronousSearchStepLoop extends SynchronousRunner {
    // The SynchronousSearchStepLoop is a search step loop with two fixed breakpoints, 
    // namely 'solutionDiscovered' and 'searchCompleted'. It is used 
    // for efficient solution search and not for solution observation. 
    constructor() {
        super();
    }
    start() {
        if (sudoApp instanceof SudokuMainApp) {
            super.start(sudoApp.mySolver.mySearch,
                sudoApp.mySolver.mySearch.performStep);
        } else if (sudoApp instanceof SudokuGeneratorApp) {
            super.start(sudoApp.myGenerator,
                sudoApp.myGenerator.performSearchStep);
        } else if (sudoApp instanceof SudokuFastSolverApp) {
            super.start(sudoApp.myFastSolver,
                sudoApp.myFastSolver.performSearchStep);
        }
    }
}

class ClockedSolutionLoop extends ClockedRunner {
    // Clocked solution loop with two breakpoints, 
    // namely 'solutionDiscovered' and 'searchCompleted'.
    // The step parameter in this loop is performSolutionStep, i.e. 
    // a step, that discovers the (next) solution in one step. 
    constructor() {
        super();
    }
    start() {
        sudoApp.mySolverView.startLoaderAnimation('Lösungen ...');
        if (sudoApp instanceof SudokuMainApp) {
            super.start(sudoApp.mySolver,
                sudoApp.mySolver.performSolutionStep);
        }
    }
    stop(bp) {
        super.stop(bp);
        sudoApp.mySolver.notify();
        sudoApp.mySolverView.stopLoaderAnimation();
    }

    breakpointPassed(bp) {
        switch (bp) {
            case 'solutionDiscovered': {
                break;
            }
            case 'searchCompleted': {
                this.stop(bp);
                break;
            }
            case 'contradiction':
            case 'multipleOption':
            case 'single':
            case 'hiddenSingle': {
                break;
            }
            default: {
                throw new Error('Unexpected breakpoint: ' + bp);
            }
        }
    }

}

class Search {
    // A search represents a the traverse through the Sudoku search tree.
    // 'performStep()' is the basic traversal step.
    // On the way through the tree there occur steps which discover a solution
    // of the given puzzle. Finally the end of the tree will be reached. The search
    // is completed.
    constructor(puzzle, solver, grid) {
        this.myPuzzle = puzzle;
        this.mySolver = solver;
        this.myGrid = grid;
        this.myStepper = new StepperOnGrid(this, this.myGrid);
        this.myGrid.clearAutoExecCellInfos();
        this.myGrid.deselect();
        this.myStepper.init();
        // 
        this.myNumberOfSolutions = 0;
    }
    isCompleted() {
        return this.myStepper.myResult.processResult == 'searchCompleted';
    }
    getNumberOfSteps() {
        return this.myStepper.goneSteps;
    }
    incrementNumberOfSolutions() {
        this.myNumberOfSolutions++;
    }
    getNumberOfSolutions() {
        return this.myNumberOfSolutions;
    }

    performStep() {
        // The last step result is undefined or 'inProgress'
        // make the grid selection equal to the stepper selection
        if (this.myStepper.indexSelected !== this.myGrid.indexSelected
            && this.myStepper.indexSelected !== -1) {
            this.myGrid.select(this.myStepper.indexSelected);
        }
        // perform the next automated step
        let searchStepResult = undefined;
        searchStepResult = this.myStepper.autoStep().processResult;
        if (searchStepResult == 'solutionDiscovered') {
            this.incrementNumberOfSolutions();
            if (sudoApp instanceof SudokuMainApp) {
                let nr = this.getNumberOfSolutions();
                sudoApp.myTrackerDialog.setNumberOfSolutions(nr);
                sudoApp.breakpointPassed('solutionDiscovered');
            }
            // Prepare the search for further solutions in the next steps
            // by changing the stepper direction to 'backward'.
            this.myStepper.setAutoDirection('backward');
        } else if (searchStepResult == 'searchCompleted') {
            this.myGrid.backTracks = this.countBackwards;
            sudoApp.breakpointPassed('searchCompleted');
            this.publishSearchIsCompleted(this.getNumberOfSolutions());
        }
    }

    publishSearchIsCompleted(nrSol) {
        this.mySolver.myPuzzle.setSearchIsCompleted(nrSol);
        if (sudoApp instanceof SudokuMainApp) {
            if (nrSol == 0) {
                sudoApp.myInfoDialog.open('Lösungssuche', 'info', 'Das Puzzle hat keine Lösung!');
            } else {
                sudoApp.myInfoDialog.open('Lösungssuche', 'info', 'Keine weitere Lösung gefunden!<br><br>Suche abgeschlossen.');
            }
            sudoApp.mySolver.notify();
        }
    }

    cleanUp() {
        this.myGrid.clearAutoExecCellInfos();
        this.myStepper = undefined;
    }
}


class StepperOnGrid {
    // A temporary stepper for automatic execution is created for the Sudoku matrix.
    // Each new automatic execution takes place with a new stepper.
    // The stepper performs elementary forward or backward steps.
    // A forward step is a pair of actions (select cell, set number),
    // a backward step is a pair (select cell, reset set number)

    constructor(parent, suGrid) {
        this.mySolver = parent;
        this.lastNumberSet = '0';
        this.indexSelected = -1;
        this.myResult = undefined;
        this.numberOfSolutions = 0;
        this.myGrid = suGrid;
        this.myBackTracker;
        this.goneSteps = 0;
        this.maxSelectionDifficulty = 'Leicht';
        this.countBackwards = 0;
        this.autoDirection = 'forward';
        this.init();
    }

    init() {
        this.lastNumberSet = '0';
        this.myResult = undefined;
        // this.numberOfSolutions = 0;
        // this.goneSteps = 0;
        this.countBackwards = 0;

        this.autoDirection = 'forward';
        this.maxSelectionDifficulty = 'Leicht';
        // Der Stepper hat immer einen aktuellen BackTracker
        this.myBackTracker = new BackTracker();
    }

    // =============================================================
    // Getter
    // =============================================================
    /* getGoneSteps() {
         return this.goneSteps;
     }
 */
    getAutoDirection() {
        return this.autoDirection;
    }

    // =============================================================
    // Setter
    // =============================================================

    setAutoDirection(direction) {
        this.autoDirection = direction;
    }

    // =============================================================
    // Other methods
    // =============================================================


    select(index) {
        this.indexSelected = index;
        this.myGrid.select(index);
    }

    autoStep() {
        // Returns one of: {'solutionDiscovered', 'searchCompleted', 'inProgress'}
        if (this.autoDirection == 'forward') {
            return this.stepForward();
        }
        else if (this.autoDirection == 'backward') {
            return this.stepBackward();
        }
    }

    stepForward() {
        let currentStep = this.myBackTracker.getCurrentStep();
        if (this.indexSelected == -1) {

            // Assumptions:
            // a) No next cell has yet been selected for number setting.
            // b) No matching number to be set has yet been saved in the current realStep
            // Target state:
            // a) The next cell for number setting is selected.
            // b) The number to be set is saved in the new, current realStep

            // ====================================================================================
            // Action: Select the next cell
            // ====================================================================================
            // Action Case 1: The BackTracker is on a real optionStep (not the root), 
            // i.e. the next selection is the next option of this step.
            if (currentStep instanceof BackTrackOptionStep &&
                currentStep.getCellIndex() !== -1) {
                // Lege einen neuen Step an mit der Nummer der nächsten Option
                let realStep = this.myBackTracker.getNextBackTrackRealStep();
                // Select the cell of the optionStep whose index is also saved in the new realStep
                this.select(realStep.getCellIndex());
                let autoStepResult = {
                    processResult: 'inProgress',
                    action: undefined
                }
                sudoApp.breakpointPassed('multipleOption');
                return autoStepResult;
            }
            // ====================================================================================
            // Action Case 2: Determine the next cell
            let tmpSelection = this.autoSelect();
            if (tmpSelection.index == -1) {
                // There is no more selection until the grid is completely filled.
                // I.e. the Sudoku has been successfully solved
                let autoStepResult = {
                    processResult: 'solutionDiscovered',
                    action: undefined
                }
                sudoApp.breakpointPassed('solutionDiscovered');
                return autoStepResult;
            } else {
                // ================================================================================
                // The determined selection is set
                this.select(tmpSelection.index);
                // ================================================================================
                // Now a number must be determined for this selection.
                // Result will be: realStep with number
                let tmpValue = '0';
                if (tmpSelection.options.length == 1) { tmpValue = tmpSelection.options[0]; }
                if (tmpSelection.necessaryOnes.length == 1) { tmpValue = tmpSelection.necessaryOnes[0]; }
                if (!(tmpValue == '0')) {
                    // The selection has a unique number. I.e. it continues uniquely.
                    // Create a new realStep with the unique number
                    this.myBackTracker.addBackTrackRealStep(tmpSelection.index, tmpValue);
                    let autoStepResult = {
                        processResult: 'inProgress',
                        action: undefined
                    }
                    return autoStepResult;
                } else {
                    // =============================================================================
                    // The selection does not have a unique number. I.e. it continues with several options.
                    this.myBackTracker.addBackTrackOptionStep(tmpSelection.index, tmpSelection.options.slice());
                    // The first option of the optionStep is selected immediately
                    // New realStep with the first option number

                    let realStep = this.myBackTracker.getNextBackTrackRealStep();
                    let autoStepResult = {
                        processResult: 'inProgress',
                        action: undefined
                    }
                    return autoStepResult;
                }
            }
        } else {
            // Assumptions:
            // a) The next cell for number setting is selected.
            // b) The number to be set is stored in the current realStep
            // Action:
            // Set the unique number
            let tmpAction = this.atCurrentSelectionSetAutoNumber(currentStep);
            // If a hidden single has been set in this cell, 
            // switch the evaluation mode back to 'No evaluation'.
            this.myGrid.unsetStepLazy();
            this.lastNumberSet = currentStep.getValue();
            this.goneSteps++;
            // If the numbering leads to insolvability
            // the solver must go back
            if (this.myGrid.isUnsolvable()) {
                this.setAutoDirection('backward');
                this.countBackwards++;
                let autoStepResult = {
                    processResult: 'inProgress',
                    action: tmpAction
                }
                sudoApp.breakpointPassed('contradiction');
                return autoStepResult;
            } else if (this.myGrid.isFinished()) {
                let autoStepResult = {
                    processResult: 'solutionDiscovered',
                    action: tmpAction
                }
                sudoApp.breakpointPassed('solutionDiscovered');
                return autoStepResult;
            } else {
                let autoStepResult = {
                    processResult: 'inProgress',
                    action: tmpAction
                }
                return autoStepResult;
            }
        }
    }

    atCurrentSelectionSetAutoNumber(step) {
        this.myGrid.atCurrentSelectionSetAutoNumber(step);
        let tmpAction = {
            operation: 'setNr',
            cellIndex: step.myCellIndex,
            cellValue: step.myCellValue
        }
        this.deselect();
        return tmpAction;
    }

    deleteSelected(phase) {
        this.myGrid.deleteSelected(phase);
        this.myGrid.unsetStepLazy();
        this.deselect();
    }

    deselect() {
        this.myGrid.deselect();
        this.indexSelected = -1;
    }

    stepBackward() {
        // If the last number set leads to the unsolvability of the Sudoku, 
        // the solver must go backwards.
        let autoStepResult = {
            processResult: 'inProgress',
            action: undefined
        }
        let currentStep = this.myBackTracker.getCurrentStep();
        if (currentStep instanceof BackTrackOptionStep) {
            if (currentStep.getCellIndex() == -1) {
                // There is no more option in the root optionStep
                // End of game, no solution
                autoStepResult.processResult = 'searchCompleted';
                return autoStepResult;
            }
            if (currentStep.isCompleted()) {
                // The optionStep has been completely processed
                // Therefore, the predecessor of this optionStep becomes the new current step
                this.myBackTracker.previousStep();
                return this.stepBackward();
            } else {
                // There are options that have not yet been tried
                // Switch search direction!!!
                this.setAutoDirection('forward');
                return this.stepForward();
            }
        } else if (currentStep instanceof BackTrackRealStep) {
            if (this.indexSelected !== currentStep.getCellIndex()) {
                // Case 1: No cell or an incorrectly selected cell
                this.select(currentStep.getCellIndex());
                // The cell of the current step is selected in the matrix
                autoStepResult.processResult = 'inProgress';
                return autoStepResult;
            }
            // Case 2: 
            // Start state
            // a) The cell of the current step is selected in the matrix
            // b) The selected cell has not yet been deleted
            if (this.myGrid.sudoCells[currentStep.getCellIndex()].getValue() !== '0') {
                this.goneSteps++;
                this.deleteSelected('play');
                // Determine the new current step after deleting the cell
                let prevStep = this.myBackTracker.previousStep();
                autoStepResult.processResult = 'inProgress';
                return autoStepResult;
            }
        }
    }


    calculateMinSelectionFrom(selectionList) {
        // Berechnet die nächste Selektion
        // Nicht eindeutig;        
        // In der Regel sind das Zellen mit 2 Optionsnummern.
        let maxSelection = selectionList[0];
        let maxIndex = maxSelection.index;
        let maxWeight = this.myGrid.sudoCells[maxIndex].countMyInfluencersWeight();
        // Kontexte mit einem größeren Entscheidungsgrad, also mit weniger zulässigen Nummern, zählen mehr.
        for (let i = 1; i < selectionList.length; i++) {
            let currentSelection = selectionList[i];
            let currentIndex = currentSelection.index;
            let currentWeight = this.myGrid.sudoCells[currentIndex].countMyInfluencersWeight();
            if (currentWeight > maxWeight) {
                maxSelection = currentSelection;
                maxIndex = currentIndex;
                maxWeight = currentWeight;
            }
        }
        return maxSelection;
    }

    calculateNeccesarySelectionFrom(selectionList) {
        // Berechnet Selektion von Zellen, die eine notwendige Nummer enthalten.
        let currentIndex = -1;
        let currentNr = '0';
        let minIndex = -1;
        let min = '10';

        let emptySelection = {
            index: -1,
            options: [],
            necessaryOnes: [],
            level_0_singles: []
        }

        for (let i = 0; i < selectionList.length; i++) {
            if (selectionList[i].necessaryOnes.length > 0) {
                // Die zuletzt gesetzte notwendige Nummer noch einmal
                if (selectionList[i].necessaryOnes[0] == this.lastNumberSet) {
                    return selectionList[i];
                } else {
                    currentNr = selectionList[i].necessaryOnes[0];
                    currentIndex = i;
                    //Mit der kleinsten Nummer beginnen
                    if (parseInt(currentNr) < parseInt(min)) {
                        min = currentNr;
                        minIndex = currentIndex;
                    }
                }
            }
        }
        if (min !== '10') {
            return selectionList[minIndex];
        }
        else {
            // Falls es keine Zellen mit notwendigen Nummern gibt
            return emptySelection;
        }
    }

    calculateLevel_0_SinglesSelectionFrom(selectionList) {
        // Berechnet Selektion von Zellen, die ein level_0_single enthalten.
        for (let i = 0; i < selectionList.length; i++) {
            if (selectionList[i].level_0_singles.length > 0) {
                return selectionList[i];
            }
        }
        // Falls es keine Zellen mit dieser Eigenschaft gibt
        let emptySelection = {
            index: -1,
            options: [],
            //indirectNecessaryOnes: [],
            necessaryOnes: [],
            level_0_singles: []
        }
        return emptySelection;
    }

    calculateOneOptionSelectionFrom(selectionList) {
        // Berechnet Selektion von Zellen, die genau eine zulässige Nummer enthalten.
        for (let i = 0; i < selectionList.length; i++) {
            if (selectionList[i].necessaryOnes.length == 0 &&
                selectionList[i].options.length == 1) {
                return selectionList[i];
            }
        }
        // Falls es keine Zellen mit diese Eigenschaft gibt
        let emptySelection = {
            index: -1,
            options: [],
            // indirectNecessaryOnes: [],
            necessaryOnes: [],
            level_0_singles: []
        }
        return emptySelection;
    }

    getOptionalSelections() {
        let selectionList = [];
        for (let i = 0; i < 81; i++) {
            if (this.myGrid.sudoCells[i].getValue() == '0') {
                let selection = {
                    index: i,
                    options: Array.from(this.myGrid.sudoCells[i].getTotalCandidates()),
                    //       indirectNecessaryOnes: Array.from(this.myGrid.sudoCells[i].getIndirectNecessarys()),
                    necessaryOnes: Array.from(this.myGrid.sudoCells[i].getNecessarys()),
                    level_0_singles: Array.from(this.myGrid.sudoCells[i].getSingles())
                }
                selectionList.push(selection);
            }
        }
        // Wenn alle Zellen gesetzt sind, ist diese Liste leer
        return selectionList;
    }


    autoSelect() {
        let optionList = this.getOptionalSelections();
        if (optionList.length == 0) {
            let emptySelection = {
                index: -1,
                options: [],
                necessaryOnes: [],
                level_0_singles: []
            }
            return emptySelection;
        }
        // maxSelectionDifficulty one of 
        // {'Leicht','Mittel','Schwer','Backtracking'}.
        // Hint: do not confuse puzzle difficulty with maxSelectionDifficulty.
        // The puzzle level has two more values:'Sehr leicht' and 'Extrem schwer'.
        let tmpNeccessary = this.calculateNeccesarySelectionFrom(optionList);
        if (tmpNeccessary.index !== -1) {
            return tmpNeccessary;
        }
        // Bestimmt die nächste Zelle mit single
        let tmpLevel_0_single = this.calculateLevel_0_SinglesSelectionFrom(optionList);
        if (tmpLevel_0_single.index !== -1) {
            switch (this.maxSelectionDifficulty) {
                case 'Leicht': {
                    this.maxSelectionDifficulty = 'Mittel';
                    break;
                }
                default: {
                    // Schwierigkeitsgrad bleibt unverändert.
                }
            }
            return tmpLevel_0_single;
        }

        // Bestimmt die nächste Zelle mit hidden single, d.h.
        // unter Verwendung von indirekt unzulässigen Nummern
        let oneOption = this.calculateOneOptionSelectionFrom(optionList);
        if (oneOption.index !== -1) {
            switch (this.maxSelectionDifficulty) {
                case 'Leicht':
                case 'Mittel': {
                    this.maxSelectionDifficulty = 'Schwer';
                    break;
                }
                default: {
                    // Schwierigkeitsgrad bleibt unverändert.
                }
            }
            return oneOption;
        }

        let tmpMin = this.calculateMinSelectionFrom(optionList);
        // Falls es keine notwendigen Nummern gibt:
        // Bestimme eine nächste Zelle mit minimaler Anzahl zulässiger Nummern
        // Diese Zelle ist nicht eindeutig
        // Diese Zelle kann eine mit der vollen Optionsmenge sein
        switch (this.maxSelectionDifficulty) {
            case 'Leicht':
            case 'Mittel':
            case 'Schwer': {
                this.maxSelectionDifficulty = 'Backtracking';
                break;
            }
            default: {
                // Schwierigkeitsgrad bleibt unverändert.
            }
        }
        return tmpMin;
    }

    deadlockReached() {
        return this.myGrid.isUnsolvable();
    }
}
class BackTracker {
    // The Backtracker implements a backtrack accounting. 
    // The Backtracker documents the steps performed by the stepper, so that
    // they can be undone if necessary.
    // Steps have to be undone if the last completed step of the
    // Stepper has revealed a contradiction for the puzzle. Then the stepper must
    // backtrack until it reaches an option step,
    // where he had an option on the first visit. Now it starts another attempt with another
    // option of the option step.

    // The Backtracker generates an execution tree of option steps, which contains for each option of 
    // the option step an option path. The option path consists of a sequence
    // of real steps that document a number setting.


    constructor() {
        // The Backtracker stores the current step of the backtracking process.
        // Initially, the current step is a pseudo option step, which is also
        // the root of the backtracking tree.
        // The specifics of the root option step:
        // 1. the root option step is not in a path of another option step.
        // 2. the root option step does not point to a cell of the Sudoku matrix.
        // 3. the option list does not contain a valid number.

        this.currentStep = new BackTrackOptionStep(null, -1, ['0']);
        this.maxDepth = 0;
    }

    getCurrentStep() {
        return this.currentStep;
    }
    getCurrentSearchDepth() {
        let tmpDepth = this.currentStep.getDepth();
        if (tmpDepth > this.maxDepth) {
            this.maxDepth = tmpDepth;
        }
        return tmpDepth;
    }
    getMaxSearchDepth() {
        return this.maxDepth;
    }
    isOnBackTrackOptionStep() {
        this.currentStep instanceof BackTrackOptionStep;
    }
    addBackTrackOptionStep(cellIndex, optionList) {
        this.currentStep = this.currentStep.addBackTrackOptionStep(cellIndex, optionList);
        return this.currentStep;
    }
    addBackTrackRealStep(cellIndex, cellValue) {
        this.currentStep = this.currentStep.addBackTrackRealStep(cellIndex, cellValue);
        return this.currentStep;
    }
    getNextBackTrackRealStep() {
        this.currentStep = this.currentStep.getNextBackTrackRealStep();
        return this.currentStep;
    }
    previousStep() {
        this.currentStep = this.currentStep.previousStep();
        return this.currentStep;
    }
}

class BackTrackOptionStep {
    constructor(ownerPath, cellIndex, optionList) {
        // Der Optionstep befindet sich in einem Optionpath
        this.myOwnerPath = ownerPath;
        // Der BackTrackOptionStep zeigt auf eine Grid-Zelle
        this.myCellIndex = cellIndex;
        // Der BackTrackOptionStep speichert die Optionsnummern des Schrittes
        this.myOptionList = optionList.slice();
        // Die Optionsliste wird mittels pop-Operationen abgearbeitet.
        // Damit dennoch die normale (FIFO) Reihenfolge der Bearbeitung realisiert wird,
        // wird die Liste umgedreht.
        this.myNextOptions = optionList.slice().reverse();

        // Der OptonStep hat für jede Option einen eigenen BackTrackOptionPath
        if (optionList.length == 1) {
            // Dann kann es nur einen Pfad geben, und dieser wird sofort angelegt.
            // Nur der Optionsschritt an der Wurzel hat nur eine Option, eine Pseudo-Option.
            // Später gibt es keine einelementigen Optionslisten.
            // Denn eine Option wählen muss man erst, wenn mindestens 2 Optionen zur Auswahl stehen.
            this.myOwnerPath = new BackTrackOptionPath(optionList[0], this)
        }
    }
    getCell() {
        return sudoApp.mySolver.myGrid.sudoCells[this.myCellIndex];
    }
    isOpen(nr) {
        // Die Nummer nr ist offen, wenn sie noch nicht probiert wurde,
        // d.h. sie befindet sich noch in der NextOption-Liste
        for (let i = 0; i < this.myNextOptions.length; i++) {
            if (this.myNextOptions[i] == nr) {
                return true;
            }
        }
        return false;
    }
    options() {
        // Die Optionen des Option-Steps
        let tmpOptionList = [];
        this.myOptionList.forEach(optionNr => {
            let tmpOption = {
                value: optionNr,
                open: this.isOpen(optionNr)
            }
            tmpOptionList.push(tmpOption);
        });
        return tmpOptionList;
    }

    addBackTrackRealStep(cellIndex, cellValue) {

        return this.myOwnerPath.addBackTrackRealStep(cellIndex, cellValue);
    }
    addBackTrackOptionStep(cellIndex, optionList) {
        return this.myOwnerPath.addBackTrackOptionStep(cellIndex, optionList);
    }
    getNextBackTrackRealStep() {
        let nextOption = this.myNextOptions.pop();
        let nextPath = new BackTrackOptionPath(nextOption, this);
        return nextPath.addBackTrackRealStep(this.myCellIndex, nextOption);
    }
    previousStep() {
        return this.myOwnerPath.previousFromBackTrackOptionStep();
    }
    isCompleted() {
        return this.myNextOptions.length == 0;
    }
    getDepth() {
        if (this.myCellIndex == -1) {
            return 0;
        } else {
            return this.myOwnerPath.getDepth() + 1;
        }
    }
    isFinished() {
        // Der BackTrackOptionStep ist beendet, wenn alle seine Pfade beendet sind
        for (let i = 0; i < this.myBackTrackOptionPaths.length; i++) {
            if (!this.myBackTrackOptionPaths[i].isFinished()) {
                return false;
            }
        }
        return true;
    }
    getCellIndex() {
        return this.myCellIndex;
    }
    getOwnerPath() {
        return this.myOwnerPath;
    }
}
class BackTrackRealStep {
    constructor(ownerPath, stepIndex, cellIndex, cellValue) {
        // Der Realstep befindet sich in einem Optionpath
        this.myOwnerPath = ownerPath;
        // Der Step zeigt auf Sudokuzelle
        this.myStepsIndex = stepIndex;
        this.myCellIndex = cellIndex;
        // Der Step kennt den Inhalt der Sudoku-Zelle
        this.myCellValue = cellValue;
    }
    addBackTrackRealStep(cellIndex, cellValue) {
        return this.myOwnerPath.addBackTrackRealStep(cellIndex, cellValue);
    }
    addBackTrackOptionStep(cellIndex, optionList) {
        return this.myOwnerPath.addBackTrackOptionStep(cellIndex, optionList);
    }
    previousStep() {
        return this.myOwnerPath.previousFromBackTrackRealStep(this.myStepsIndex);
    }
    getValue() {
        return this.myCellValue;
    }
    getCellIndex() {
        return this.myCellIndex;
    }
    getPathIndex() {
        return this.myStepsIndex;
    }
    getOwnerPath() {
        return this.myOwnerPath;
    }
    getDepth() {
        return this.myOwnerPath.getDepth();
    }
    options() {
        return this.myOwnerPath.options(this.myStepsIndex);
    }
}
class BackTrackOptionPath {
    // Ein BackTrackOptionPath besteht im Kern aus zwei Elmenten:
    // 1. Die Nummer (Option), für die der Pfad gemacht wird.
    // 2. aus einer Sequenz von BackTrackRealSteps
    // 3. Der letzte Schritt ist ein OptonStep, wenn nicht vorher
    // ein Erfolg oder Unlösbarkeit eingetreten ist.
    constructor(value, ownerStep) {
        // Nie nummeer, für die dieser path entsteht
        this.myValue = value;
        //Die Schrittsequenz bestehend ausschließlich aus realsteps
        this.myBackTrackRealSteps = [];
        //Weitere Hilfsattribute
        this.myLastBackTrackOptionStep; // Der Abschluss dies Pfades
        this.myOwnerStep = ownerStep; // Der Optionstep, der diesen Pfad besitzt
    }
    options(currentIndex) {
        let tmpOptions = [];
        if (currentIndex > 0) {
            // Nur eine Option mitten im Pfad
            let tmpOption = {
                value: this.myBackTrackRealSteps[currentIndex].getValue(),
                open: false
            }
            tmpOptions.push(tmpOption);
        } else {
            // Der erste Schritt im Pfad
            if (this.myValue == '0') {
                // Der Wurzelpfad
                let tmpOption = {
                    value: this.myBackTrackRealSteps[currentIndex].getValue(),
                    open: false
                }
                tmpOptions.push(tmpOption);
            } else {
                tmpOptions = this.myOwnerStep.options();
            }
        }
        return tmpOptions;
    }
    getDepth() {
        if (this.myValue == '0') {
            // Ich bin der Rootpath
            return 0;
        } else {
            return this.myOwnerStep.getDepth();
        }
    }
    isFinished() {
        return (!(this.myLastBackTrackOptionStep == null));
    }

    addBackTrackRealStep(cellIndex, cellValue) {
        // Der neue Realstep wird in diesem Path angelegt
        let realStep = new BackTrackRealStep(this, this.myBackTrackRealSteps.length, cellIndex, cellValue);
        this.myBackTrackRealSteps.push(realStep);
        return realStep;
    }

    addBackTrackOptionStep(cellIndex, optionList) {
        // Der neue Optionstep wird in diesem Path angelegt
        this.myLastBackTrackOptionStep = new BackTrackOptionStep(this, cellIndex, optionList);
        // Damit ist dieser Pfad beendet. Es kann nur in seinen Subpfaden weitergehen
        return this.myLastBackTrackOptionStep;
    }

    getValue() {
        return this.myValue;
    }

    previousFromBackTrackRealStep(currentIndex) {
        // Rückwärts vom BackTrackRealStep
        if (currentIndex == 0) {
            return this.myOwnerStep;
        } else {
            // der vorige step liegt in diesem Path
            return this.myBackTrackRealSteps[currentIndex - 1];
        }
    }
    previousFromBackTrackOptionStep() {
        // Rückwärts vom BackTrackOptionStep
        // Es kann vorkommen, dass die realStep Sequenz leer ist
        if (this.myBackTrackRealSteps.length == 0) {
            return this.myOwnerStep;
        } else
            return this.myBackTrackRealSteps[this.myBackTrackRealSteps.length - 1];
    }
}
// ==========================================
// Puzzles and PuzzleDB
// ==========================================
class NewPuzzleStore {
    // This is a store of new puzzles. For each difficulty it stores
    // 2 puzzles in advance, such that a request for a new puzzle
    // can be served without delay. 
    // During the initiation of the solver the puzzles in the store 
    // are generated by web-workers in the background.
    constructor() {
        this.verySimplePuzzles = [];
        this.simplePuzzles = [];
        this.mediumPuzzles = [];
        this.heavyPuzzles = [];
    }
    init() {
        this.fillNewPuzzleStore();
        this.fillVerySimple();
    }

    async fillNewPuzzleStore() {
        if (this.isNotFilled()) {
            let puzzleRecord = await sudoApp.mySolver.generateNewPuzzle();
            this.pushPuzzle(puzzleRecord);
            this.fillNewPuzzleStore();
        }
    }

    async fillVerySimple() {
        if (this.verySimplePuzzles.length < 2) {
            let simplePuzzleRecord = await sudoApp.myNewPuzzleStore.popPuzzle('Leicht');
            // A simple puzzle can be made into a very simple puzzle 
            // by adding solved cells. The number of 7 added cells is arbitrary, but pragmatic.
            let verySimplePuzzleRecord
                = sudoApp.mySolver.simplifyPuzzleByNrOfCells(7, simplePuzzleRecord);
            this.verySimplePuzzles.push(verySimplePuzzleRecord);
            console.log('-------> push: Sehr leicht: #' + this.verySimplePuzzles.length);
            this.fillVerySimple();
        }
    }

    isNotFilled() {
        return this.simplePuzzles.length < 2
            || this.mediumPuzzles.length < 2
            || this.heavyPuzzles.length < 2;
    }

    pushPuzzle(puzzleRecord) {
        switch (puzzleRecord.preRunRecord.level) {
            case 'Leicht': {
                if (this.simplePuzzles.length < 2) {
                    this.simplePuzzles.push(puzzleRecord);
                    console.log('-------> push: Leicht: #' + this.simplePuzzles.length);
                } else {
                    console.log('push: Leicht: verfallen');
                };
                break;
            }
            case 'Mittel': {
                if (this.mediumPuzzles.length < 2) {
                    this.mediumPuzzles.push(puzzleRecord);
                    console.log('-------> push: Mittel: #' + this.mediumPuzzles.length);
                } else {
                    console.log('push: Mittel: verfallen');
                };
                break;
            }
            case 'Schwer': {
                if (this.heavyPuzzles.length < 2) {
                    this.heavyPuzzles.push(puzzleRecord);
                    console.log('-------> push: Schwer: #' + this.heavyPuzzles.length)
                } else {
                    console.log('push: Schwer: verfallen');
                };
                break;
            }
            case 'Backtracking': {
                // In very rare cases, the generator also generates a non-fair puzzle, 
                // i.e. a puzzle that cannot be solved with the logical criteria, 
                // implemented in this solver. It requires backtracking. Since we only 
                // want to generate fair puzzles, we can simply ignore this case.
                break;
            }
            default: {
                throw new Error('Unexpected difficulty: ' + puzzleRecord.preRunRecord.level);
            }
        }
    }

    async popPuzzle(difficulty) {
        let pz = undefined;
        switch (difficulty) {
            case 'Sehr leicht': {
                pz = this.verySimplePuzzles.pop();
                if (pz == undefined) {
                    this.fillVerySimple();
                }
                break;
            }
            case 'Leicht': {
                pz = this.simplePuzzles.pop();
                break;
            }
            case 'Mittel': {
                pz = this.mediumPuzzles.pop();
                break;
            }
            case 'Schwer': {
                pz = this.heavyPuzzles.pop();
                break;
            }
            default: {
                throw new Error('Unexpected difficulty: ' + difficulty);
            }
        }
        if (pz == undefined) {
            await this.fillNewPuzzleStore();
            pz = this.popPuzzle(difficulty);
        }
        return pz;
    }
}
class SudokuPuzzleDB extends MVC_Model {
    constructor() {
        super();
        // 
        this.sorted = new Map([
            ['name', 'desc'],
            ['status-given', 'desc'],
            ['status-solved', 'desc'],
            ['status-open', 'desc'],
            ['steps-lazy', 'desc'],
            ['steps-strict', 'desc'],
            ['level', 'desc'],
            ['backTracks', 'desc'],
            ['date', 'desc']
        ]);
    }

    upDateVersion_2() {
        let str_puzzleMap = localStorage.getItem("localSudokuDB");
        let puzzleMap = new Map(JSON.parse(str_puzzleMap));
        puzzleMap.forEach((puzzleRecord, key) => {
            puzzleRecord.id = key;
        });
    }

    async init() {
        this.upDateVersion_2();
        let str_puzzleMap = localStorage.getItem("localSudokuDB");
        let puzzleMap = new Map(JSON.parse(str_puzzleMap));
        if (puzzleMap.size > 0) {
            this.selectedIndex = puzzleMap.size - 1;
        } else {
            await this.initDB();
            let puzzleMap = new Map(JSON.parse(str_puzzleMap));
            if (puzzleMap.size > 0) {
                this.selectedIndex = puzzleMap.size - 1;
            }
        }
    }

    async userInit() {
        sudoApp.myPuzzleDBView.startLoaderAnimation('DB initialisieren');
        await this.initDB();
        sudoApp.myPuzzleDBView.stopLoaderAnimation();
    }

    async initDB() {
        // delete the current DB
        localStorage.removeItem("localSudokuDB");
        // Create a new empty DB
        let puzzleMap = new Map();
        let update_str_puzzleMap = JSON.stringify(Array.from(puzzleMap.entries()));
        localStorage.setItem("localSudokuDB", update_str_puzzleMap);

        // Example puzzle with 23 back tracks
        const back23 = ["0", "3", "0", "0", "1", "0", "0", "0", "9",
            "0", "0", "6", "0", "0", "0", "5", "0", "0",
            "1", "0", "0", "0", "0", "0", "0", "4", "0",
            "4", "0", "0", "0", "0", "3", "2", "0", "0",
            "0", "9", "0", "0", "7", "0", "0", "0", "8",
            "0", "0", "5", "6", "0", "0", "0", "0", "0",
            "8", "0", "0", "0", "0", "2", "0", "0", "3",
            "0", "0", "0", "0", "9", "0", "0", "7", "0",
            "0", "0", "0", "4", "0", "0", "1", "0", "0"];

        const back10 = ["1", "4", "0", "0", "0", "6", "8", "0", "0",
            "0", "0", "0", "0", "5", "0", "0", "0", "2",
            "0", "0", "0", "0", "9", "4", "0", "6", "0",
            "0", "0", "4", "0", "0", "0", "0", "0", "0",
            "0", "0", "0", "0", "0", "8", "0", "3", "6",
            "7", "5", "0", "0", "0", "1", "9", "0", "0",
            "0", "0", "0", "3", "0", "0", "0", "1", "0",
            "0", "9", "0", "0", "0", "0", "0", "0", "5",
            "8", "0", "0", "0", "0", "0", "7", "0", "0"];

        await this.importBackRunPuzzle(back23, 'Backtrack_23', 'lqwgzcback23g2ak');
        await this.importBackRunPuzzle(back10, 'Backtrack_10', 'lqgwgzcback9hpfg2ak');
        sudoApp.mySolver.init();
        sudoApp.mySolver.notify()
        this.notify();
    }

    getSize() {
        let str_puzzleMap = localStorage.getItem("localSudokuDB");
        let puzzleMap = new Map(JSON.parse(str_puzzleMap));
        return puzzleMap.size;
    }

    sort(col) {
        // Hole den Speicher als ein Objekt
        let str_puzzleMap = localStorage.getItem("localSudokuDB");
        let puzzleMap = new Map(JSON.parse(str_puzzleMap));
        let selectedKey = this.selectedKey();
        switch (col) {
            case 'name': {
                let nameSorted = this.sorted.get('name');
                if (nameSorted == '' || nameSorted == 'desc') {
                    this.sorted.set('name', 'asc');
                    puzzleMap = new Map([...puzzleMap].sort((a, b) => (a[1].name > b[1].name ? 1 : -1)));
                } else {
                    this.sorted.set('name', 'desc');
                    puzzleMap = new Map([...puzzleMap].sort((a, b) => (a[1].name > b[1].name ? -1 : 1)));
                }
                break;
            }
            case 'defCount': {
                let defCountSorted = this.sorted.get('defCount');
                if (defCountSorted == '' || defCountSorted == 'desc') {
                    this.sorted.set('defCount', 'asc');
                    puzzleMap = new Map([...puzzleMap].sort((a, b) => a[1].preRunRecord.defCount - b[1].preRunRecord.defCount));
                } else {
                    this.sorted.set('defCount', 'desc');
                    puzzleMap = new Map([...puzzleMap].sort((a, b) => b[1].preRunRecord.defCount - a[1].preRunRecord.defCount));
                }
                break;
            }
            case 'status-given': {
                let statusSorted = this.sorted.get('status-given');
                if (statusSorted == '' || statusSorted == 'desc') {
                    this.sorted.set('status-given', 'asc');
                    puzzleMap = new Map([...puzzleMap].sort((a, b) => a[1].statusGiven - b[1].statusGiven));
                } else {
                    this.sorted.set('status-given', 'desc');
                    puzzleMap = new Map([...puzzleMap].sort((a, b) => b[1].statusGiven - a[1].statusGiven));
                }
                break;
            }

            case 'status-solved': {
                let statusSorted = this.sorted.get('status-solved');
                if (statusSorted == '' || statusSorted == 'desc') {
                    this.sorted.set('status-solved', 'asc');
                    puzzleMap = new Map([...puzzleMap].sort((a, b) => a[1].statusSolved - b[1].statusSolved));
                } else {
                    this.sorted.set('status-solved', 'desc');
                    puzzleMap = new Map([...puzzleMap].sort((a, b) => b[1].statusSolved - a[1].statusSolved));
                }
                break;
            }

            case 'status-open': {
                let statusSorted = this.sorted.get('status-open');
                if (statusSorted == '' || statusSorted == 'desc') {
                    this.sorted.set('status-open', 'asc');
                    puzzleMap = new Map([...puzzleMap].sort((a, b) => a[1].statusOpen - b[1].statusOpen));
                } else {
                    this.sorted.set('status-open', 'desc');
                    puzzleMap = new Map([...puzzleMap].sort((a, b) => b[1].statusOpen - a[1].statusOpen));
                }
                break;
            }

            case 'steps-lazy': {
                let stepsSorted = this.sorted.get('steps-lazy');
                if (stepsSorted == '' || stepsSorted == 'desc') {
                    this.sorted.set('steps-lazy', 'asc');
                    puzzleMap = new Map([...puzzleMap].sort((a, b) => a[1].stepsLazy - b[1].stepsLazy));
                } else {
                    this.sorted.set('steps-lazy', 'desc');
                    puzzleMap = new Map([...puzzleMap].sort((a, b) => b[1].stepsLazy - a[1].stepsLazy));
                }
                break;
            }
            case 'steps-strict': {
                let stepsSorted = this.sorted.get('steps-strict');
                if (stepsSorted == '' || stepsSorted == 'desc') {
                    this.sorted.set('steps-strict', 'asc');
                    puzzleMap = new Map([...puzzleMap].sort((a, b) => a[1].stepsStrict - b[1].stepsStrict));
                } else {
                    this.sorted.set('steps-strict', 'desc');
                    puzzleMap = new Map([...puzzleMap].sort((a, b) => b[1].stepsStrict - a[1].stepsStrict));
                }
                break;
            }
            case 'level': {
                let levelSorted = this.sorted.get('level');
                if (levelSorted == '' || levelSorted == 'desc') {
                    this.sorted.set('level', 'asc');
                    puzzleMap = new Map([...puzzleMap].sort((a, b) => (a[1].preRunRecord.level > b[1].preRunRecord.level ? 1 : -1)));
                } else {
                    this.sorted.set('level', 'desc');
                    puzzleMap = new Map([...puzzleMap].sort((a, b) => (a[1].preRunRecord.level > b[1].preRunRecord.level ? -1 : 1)));
                }
                break;
            }
            case 'backTracks': {
                let backTracksSorted = this.sorted.get('backTracks');
                if (backTracksSorted == '' || backTracksSorted == 'desc') {
                    this.sorted.set('backTracks', 'asc');
                    puzzleMap = new Map([...puzzleMap].sort((a, b) => a[1].preRunRecord.backTracks - b[1].preRunRecord.backTracks));
                } else {
                    this.sorted.set('backTracks', 'desc');
                    puzzleMap = new Map([...puzzleMap].sort((a, b) => b[1].preRunRecord.backTracks - a[1].preRunRecord.backTracks));
                }
                break;
            }
            case 'date': {
                let dateSorted = this.sorted.get('date');
                if (dateSorted == '' || dateSorted == 'desc') {
                    this.sorted.set('date', 'asc');
                    puzzleMap = new Map([...puzzleMap].sort((a, b) => (new Date(a[1].date) > new Date(b[1].date) ? 1 : -1)));
                } else {
                    this.sorted.set('date', 'desc');
                    puzzleMap = new Map([...puzzleMap].sort((a, b) => (new Date(a[1].date) > new Date(b[1].date) ? -1 : 1)));
                }
                break;
            }
            default: {
                // Kann nicht vorkommen
                throw new Error('Unexpected column name: ' + col);
            }
        }
        // Kreiere die JSON-Version des Speicherobjektes
        // und speichere sie.
        let update_str_puzzleMap = JSON.stringify(Array.from(puzzleMap.entries()));
        localStorage.setItem("localSudokuDB", update_str_puzzleMap);
        this.selectedIndex = this.getIndex(selectedKey);
        this.notify();
    }

    mergePlayedPuzzle(puzzleRecord) {
        let storedPuzzleRecord = sudoApp.myPuzzleDB.getPuzzleRecord(puzzleRecord.id);
        //Stored puzzles save their creation date
        puzzleRecord.date = storedPuzzleRecord.date;
        this.savePuzzle(puzzleRecord);
        this.notify();
    }

    savePuzzle(puzzleRecord) {
        // Hole den Speicher als ein Objekt
        let str_puzzleMap = localStorage.getItem("localSudokuDB");
        let puzzleMap = new Map(JSON.parse(str_puzzleMap));
        // Füge das Puzzle in das Speicherobjekt ein
        puzzleMap.set(puzzleRecord.id, puzzleRecord);
        // Kreiere die JSON-Version des Speicherobjektes
        // und speichere sie.
        let update_str_puzzleMap = JSON.stringify(Array.from(puzzleMap.entries()));
        localStorage.setItem("localSudokuDB", update_str_puzzleMap);
        this.selectedIndex = this.getIndex(puzzleRecord.id);
        this.notify();
    }

    async importBackRunPuzzle(pa, pzName, puzzleId) {
        let str_puzzleMap = localStorage.getItem("localSudokuDB");
        let puzzleMap = new Map(JSON.parse(str_puzzleMap));
        if (!puzzleMap.has(puzzleId)) {
            sudoApp.mySolver.myGrid.loadSimplePuzzleArray(pa);
            sudoApp.mySolver.myPuzzle.myRecord = await sudoApp.mySolver.setNewPuzzleRecord();
            let currentPuzzleRecord = sudoApp.mySolver.myPuzzle.myRecord;
            currentPuzzleRecord.id = puzzleId;
            currentPuzzleRecord.name = pzName;
            this.savePuzzle(currentPuzzleRecord);
        }
        sudoApp.mySolver.init();
    }

    async addPuzzlePreRunData(puzzleId) {
        let preRecord = await sudoApp.mySolver.calculatedPreRunRecord();

        let str_puzzleMap = localStorage.getItem("localSudokuDB");
        let puzzleMap = new Map(JSON.parse(str_puzzleMap));
        // Füge das Puzzle in das Speicherobjekt ein
        let puzzleRecord = puzzleMap.get(puzzleId);
        puzzleRecord.preRunRecord = preRecord;
        puzzleMap.set(puzzleId, puzzleRecord);
        // Kreiere die JSON-Version des Speicherobjektes
        // und speichere sie.
        let update_str_puzzleMap = JSON.stringify(Array.from(puzzleMap.entries()));
        localStorage.setItem("localSudokuDB", update_str_puzzleMap);
    }

    getPuzzleRecord(uid) {
        let str_puzzleMap = localStorage.getItem("localSudokuDB");
        let puzzleMap = new Map(JSON.parse(str_puzzleMap));
        return puzzleMap.get(uid);
    }
    getIndex(uid) {
        let str_puzzleMap = localStorage.getItem("localSudokuDB");
        let puzzleMap = new Map(JSON.parse(str_puzzleMap));
        let i = 0;
        for (const [key, value] of puzzleMap) {
            if (key == uid) {
                return i;
            } else {
                i++;
            }
        }
        // Uid existiert nicht
        return -1;
    }

    deleteSelected() {
        // Get the database as an object
        let str_puzzleMap = localStorage.getItem("localSudokuDB");
        let puzzleMap = new Map(JSON.parse(str_puzzleMap));
        let key = Array.from(puzzleMap.keys())[this.selectedIndex];
        if (this.selectedIndex > 0) {
            this.selectedIndex--;
        }
        puzzleMap.delete(key);
        let update_str_puzzleMap = JSON.stringify(Array.from(puzzleMap.entries()));
        localStorage.setItem("localSudokuDB", update_str_puzzleMap);
        //Clear loaded puzzle, if loaded puzzle is deleted
        sudoApp.mySolver.clearLoadedPuzzle(key);
        this.notify();
    }

    selectedPZ() {
        // return selected puzzle
        let str_puzzleMap = localStorage.getItem("localSudokuDB");
        let puzzleMap = new Map(JSON.parse(str_puzzleMap));
        let key = Array.from(puzzleMap.keys())[this.selectedIndex];
        let puzzleRecord = puzzleMap.get(key);
        return puzzleRecord;
    }

    selectedKey() {
        //return selected key
        let str_puzzleMap = localStorage.getItem("localSudokuDB");
        let puzzleMap = new Map(JSON.parse(str_puzzleMap));
        let key = Array.from(puzzleMap.keys())[this.selectedIndex];
        return key;
    }

    selectNextPZ() {
        let size = this.getSize();
        if (size > 0) {
            if (this.selectedIndex < (size - 1)) {
                this.selectedIndex++;
            }
        } else {
            this.selectedIndex = -1;
        }
        this.notify();
    }

    selectPreviousPZ() {
        let size = this.getSize();
        if (size > 0) {
            if (this.selectedIndex > 0) {
                this.selectedIndex--;
            }
        } else {
            this.selectedIndex = -1;
        }
        this.notify();
    }
    getSelectedPuzzle() {
        let selectedPZ = this.selectedPZ();
        return selectedPZ;
    }

    getSelectedUid() {
        let str_puzzleMap = localStorage.getItem("localSudokuDB");
        let puzzleMap = new Map(JSON.parse(str_puzzleMap));
        let key = Array.from(puzzleMap.keys())[this.selectedIndex];
        return key;
    }

    has(uid) {
        let str_puzzleMap = localStorage.getItem("localSudokuDB");
        let puzzleMap = new Map(JSON.parse(str_puzzleMap));
        return puzzleMap.has(uid);
    }
    downloadPuzzleDb() {
        let str_puzzleMap = localStorage.getItem("localSudokuDB");
        var blob1 = new Blob([str_puzzleMap], { type: "text/plain;charset=utf-8" });

        //Check the Browser.
        var isIE = false || !!document.documentMode;
        if (isIE) {
            window.navigator.msSaveBlob(blob1, 'downloadedPuzzleDB.text');
        } else {
            var url = window.URL || window.webkitURL;
            var link = url.createObjectURL(blob1);
            var a = document.createElement("a");
            a.download = 'downloadedPuzzleDB.text';
            a.href = link;
            document.body.appendChild(a);
            a.click();
            document.body.removeChild(a);
        }
    }

    downloadPuzzle() {
        let str_puzzleMap = localStorage.getItem("localSudokuDB");
        let puzzleMap = new Map(JSON.parse(str_puzzleMap));
        // puzzleMap anlegen, die nur das selektierte Element enthält.
        let newPuzzleMap = new Map();
        if (puzzleMap.size > 0) {
            let selectedKey = this.getSelectedUid();
            let selectedPuzzle = this.getSelectedPuzzle();
            newPuzzleMap.set(selectedKey, selectedPuzzle);
            let str_newPuzzleMap = JSON.stringify(Array.from(newPuzzleMap.entries()));

            var blob1 = new Blob([str_newPuzzleMap], { type: "text/plain;charset=utf-8" });

            //Check the Browser.
            var isIE = false || !!document.documentMode;
            if (isIE) {
                window.navigator.msSaveBlob(blob1, 'downloadedPuzzle.text');
            } else {
                var url = window.URL || window.webkitURL;
                var link = url.createObjectURL(blob1);
                var a = document.createElement("a");
                a.download = 'downloadedPuzzle.text';
                a.href = link;
                document.body.appendChild(a);
                a.click();
                document.body.removeChild(a);
            }
        }
    }

    upLoadPuzzle(strFilePuzzleMap) {
        let filePuzzleMap = new Map(JSON.parse(strFilePuzzleMap));

        let str_puzzleMap = localStorage.getItem("localSudokuDB");
        let puzzleMap = new Map(JSON.parse(str_puzzleMap));

        let upLoadedKeys = [];
        filePuzzleMap.forEach((value, key) => {
            // console.log('key: ' + key + ', value: ' + value);
            //  if (!puzzleMap.has(key)) {
            puzzleMap.set(key, value);
            upLoadedKeys.push(key);
            //  }
        })
        // Kreiere die JSON-Version des Speicherobjektes
        // und speichere sie.
        let update_str_puzzleMap = JSON.stringify(Array.from(puzzleMap.entries()));
        localStorage.setItem("localSudokuDB", update_str_puzzleMap);

        if (upLoadedKeys.length == 1) {
            this.selectedIndex = this.getIndex(upLoadedKeys.pop());
            sudoApp.myPuzzleDBController.loadBtnPressed();
        } else {
            sudoApp.mySolverController.openDBLinkPressed();
        }
    }

    getCurrentPuzzleFile() {
        let currentPuzzleRecord = sudoApp.mySolver.myPuzzle.myRecord;
        if (!sudoApp.myPuzzleDB.has(currentPuzzleRecord.id)) {
            // The current puzzle is not yet an element in the database.
            // Save the current puzzle with a new name in the database
            currentPuzzleRecord.name = 'Geteilt (' + new Date().toLocaleString('de-DE') + ')';
            sudoApp.myPuzzleDB.savePuzzle(currentPuzzleRecord);
        } else {
            // The current puzzle is element in the database.
            sudoApp.myPuzzleDB.mergePlayedPuzzle(currentPuzzleRecord);
        }
        // The saved and shared puzzle becomes the new current puzzle
        // let tmpPuzzleID = sudoApp.myPuzzleDB.getSelectedUid();
        let puzzleRecord = sudoApp.myPuzzleDB.getSelectedPuzzle();
        sudoApp.mySolver.loadPuzzle(puzzleRecord);
        sudoApp.mySolver.notify();

        let str_puzzleMap = localStorage.getItem("localSudokuDB");
        let puzzleMap = new Map(JSON.parse(str_puzzleMap));
        // puzzleMap anlegen, die nur das selektierte Element enthält.
        let newPuzzleMap = new Map();
        if (puzzleMap.size > 0) {
            // let selectedKey = sudoApp.myPuzzleDB.getSelectedUid();
            let selectedPuzzleRecord = sudoApp.myPuzzleDB.getSelectedPuzzle();
            newPuzzleMap.set(selectedPuzzleRecord.id, selectedPuzzleRecord);
            let str_newPuzzleMap = JSON.stringify(Array.from(newPuzzleMap.entries()));
            let blob1 = new Blob([str_newPuzzleMap], { type: "text/plain;charset=utf-8" });
            let file = new File([blob1], 'sharedPuzzle.text', { type: "text/plain" });
            return file;
        } else {
            return undefined;
        }
    }
}
class SudokuPuzzleDBView extends MVC_View {
    constructor(sudokuDB) {
        super(sudokuDB);
        this.myDB = sudokuDB;
    }
    upDate() {
        this.displayPuzzleDB();
    }

    displayPuzzleDB() {
        let str_puzzleMap = localStorage.getItem("localSudokuDB");
        let puzzleMap = new Map(JSON.parse(str_puzzleMap));
        let tbNode = document.getElementById('db-puzzle-tbody');
        while (tbNode.childElementCount > 0) {
            tbNode.removeChild(tbNode.lastChild);
        }
        let selectedTr = undefined;
        if (puzzleMap.size > 0) {

            let i = 0;
            for (let [key, pzRecord] of puzzleMap) {
                let tr = document.createElement('tr');
                tr.setAttribute("onclick", "sudoApp.myPuzzleDBController.setSelected(this)");
                tr.setAttribute("ondblclick", "sudoApp.myPuzzleDBController.loadBtnPressed()");
                tr.setAttribute("style", "cursor:pointer");
                tr.classList.add('item')
                if (i == this.myDB.selectedIndex) {
                    tr.classList.add('selected');
                    selectedTr = tr;
                }
                i++;

                let td_Nr = document.createElement('td');
                td_Nr.innerText = i;
                tr.appendChild(td_Nr);

                let td_name = document.createElement('td');
                td_name.innerText = pzRecord.name;
                tr.appendChild(td_name);

                let td_status_given = document.createElement('td');
                if (pzRecord.statusGiven == undefined) {
                    td_status_given.innerText = -1;
                } else {
                    td_status_given.innerText = pzRecord.statusGiven;
                }
                tr.appendChild(td_status_given);


                let td_status_solved = document.createElement('td');
                if (pzRecord.statusSolved == undefined) {
                    td_status_solved.innerText = -1;
                } else {
                    td_status_solved.innerText = pzRecord.statusSolved;
                }
                tr.appendChild(td_status_solved);

                let td_status_open = document.createElement('td');
                if (pzRecord.statusOpen == undefined) {
                    td_status_open.innerText = -1;
                } else {
                    td_status_open.innerText = pzRecord.statusOpen;
                }
                tr.appendChild(td_status_open);


                let td_level = document.createElement('td');
                td_level.innerText = pzRecord.preRunRecord.level;
                tr.appendChild(td_level);

                let td_backTracks = document.createElement('td');
                td_backTracks.innerText = pzRecord.preRunRecord.backTracks;
                tr.appendChild(td_backTracks);

                let td_date = document.createElement('td');
                td_date.innerText = (new Date(pzRecord.date)).toLocaleDateString();
                tr.appendChild(td_date);

                tbNode.appendChild(tr);
            }
            if (selectedTr !== undefined) {
                selectedTr.scrollIntoView({ block: "end" });
            }
        }
    }

    startLoaderAnimation(info) {
        // Der sich drehende Loader wird angezeigt
        let slNode = document.getElementById("loader-db-info");
        slNode.innerText = info;
        document.getElementById("loader-db").style.display = "block";
    }
    stopLoaderAnimation() {
        document.getElementById("loader-db").style.display = "none";
    }
}
class SudokuPuzzleDBController {
    constructor(puzzleDb) {
        // Der Save-Dialog
        this.myPuzzleDB = puzzleDb;
        //Click-Event für die Spaltenköpfe
        document.getElementById('col-name').addEventListener('click', () => {
            this.myPuzzleDB.sort('name');
        });
        document.getElementById('col-status-given').addEventListener('click', () => {
            this.myPuzzleDB.sort('status-given');
        });

        document.getElementById('col-status-solved').addEventListener('click', () => {
            this.myPuzzleDB.sort('status-solved');
        });

        document.getElementById('col-status-open').addEventListener('click', () => {
            this.myPuzzleDB.sort('status-open');
        });

        document.getElementById('col-level').addEventListener('click', () => {
            this.myPuzzleDB.sort('level');
        });
        document.getElementById('col-backTracks').addEventListener('click', () => {
            this.myPuzzleDB.sort('backTracks');
        });
        document.getElementById('col-date').addEventListener('click', () => {
            this.myPuzzleDB.sort('date');
        });

        document.getElementById('pz-btn-load').addEventListener('click', () => {
            this.loadBtnPressed();
        });
        // Click-Event for save button desktop

        document.getElementById('pz-btn-rename').addEventListener('click', () => {
            this.renameBtnPressed();
        });

        document.getElementById('pz-btn-previous').addEventListener('click', () => {
            this.previousBtnPressed();
        });
        document.getElementById('pz-btn-next').addEventListener('click', () => {
            this.nextBtnPressed();
        });
        document.getElementById('pz-btn-delete').addEventListener('click', () => {
            this.deleteBtnPressed();
        });
        document.getElementById('db-pz-btn-init').addEventListener('click', () => {
            this.initDBBtnPressed();
        });
        document.getElementById('db-puzzle-btn-print').addEventListener('click', () => {
            this.puzzleDBPrintBtnPressed();
        });

        document.getElementById('db-puzzle-btn-download-db').addEventListener('click', () => {
            this.puzzleDbDownloadBtnPressed();
        });
        document.getElementById('db-puzzle-btn-download-pz').addEventListener('click', () => {
            this.puzzleDownloadBtnPressed();
        });


        document.getElementById('pz-btn-ok').addEventListener('click', () => {
            this.closeBtnPressed();
        });
        document.getElementById('db-close-btn').addEventListener('click', () => {
            this.closeBtnPressed();
        });

    }

    // ===============================================================
    // DB-Event handler
    // ===============================================================

    importPuzzles() {
        // File handling via the DOM <input> Element
        // Called by button "Import Puzzle(s)"
        let input = document.getElementById('asText');
        input.value = "";
        // button pressed triggers input change
        input.click();
    }


    setSelected(trNode) {
        this.myPuzzleDB.selectedIndex = trNode.cells[0].innerText - 1;
        this.myPuzzleDB.notify();
    }

    renameBtnPressed() {
        let selectedPuzzleRecord = sudoApp.myPuzzleDB.getSelectedPuzzle();
        let selectedKey = sudoApp.myPuzzleDB.selectedKey();
        selectedPuzzleRecord.id = selectedKey;
        sudoApp.myPuzzleSaveRenameDlg.open(
            this.renamePuzzleDlgOKPressed,
            this.renamePuzzleDlgCancelPressed,
            selectedPuzzleRecord);
    }

    loadBtnPressed() {
        if (this.myPuzzleDB.getSize() > 0) {
            let puzzleRecord = this.myPuzzleDB.getSelectedPuzzle();
            sudoApp.myPuzzleDBDialog.close();
            sudoApp.myTrackerDialog.close();
            sudoApp.mySolver.init();
            sudoApp.mySolver.loadPuzzle(puzzleRecord);
            sudoApp.mySolverController.myUndoActionStack = [];
            sudoApp.mySolverController.myRedoActionStack = [];
            sudoApp.mySolver.notify();
            // Zoom in the loaded puzzle
            sudoApp.mySolver.notifyAspect('puzzleLoading', undefined);
        }
    }

    renamePuzzleDlgOKPressed() {
        sudoApp.myPuzzleSaveRenameDlg.close();
        let uid = sudoApp.myPuzzleSaveRenameDlg.myId;
        let name = sudoApp.myPuzzleSaveRenameDlg.getPuzzleName();
        let selectedDBPuzzle = sudoApp.myPuzzleDB.getPuzzleRecord(uid);
        selectedDBPuzzle.name = name;
        sudoApp.myPuzzleDB.savePuzzle(selectedDBPuzzle);
        sudoApp.myPuzzleDB.notify()
        if (sudoApp.mySolver.getLoadedPuzzleUID() == uid) {
            sudoApp.mySolver.setLoadedPuzzleName(name);
            sudoApp.mySolver.notify();
        }
    }

    renamePuzzleDlgCancelPressed() {
        sudoApp.myPuzzleSaveRenameDlg.close();
    }

    nextBtnPressed() {
        if (this.myPuzzleDB.getSize() > 0) {
            this.myPuzzleDB.selectNextPZ();
        }
    }
    previousBtnPressed() {
        if (this.myPuzzleDB.getSize() > 0) {
            // Select previous Puzzle
            this.myPuzzleDB.selectPreviousPZ();
        }
    }

    deleteBtnPressed() {
        let pz = this.myPuzzleDB.getSelectedPuzzle();
        let pzName = pz.name;
        sudoApp.myConfirmDlg.open(sudoApp.myPuzzleDBController,
            sudoApp.myPuzzleDBController.delete,
            "Puzzle löschen",
            'Soll das Puzzle \"' + pzName + '\" endgültig gelöscht werden?');
    }
    initDBBtnPressed() {
        sudoApp.myConfirmDlg.open(sudoApp.myPuzzleDB,
            sudoApp.myPuzzleDB.userInit,
            "Puzzle DB löschen und initialisieren",
            'Soll die Puzzle DB endgültig gelöscht und neu initialisiert werden?');
    }

    delete() {
        if (sudoApp.myPuzzleDB.getSize() > 0) {
            let selectedId = sudoApp.myPuzzleDB.selectedKey();
            let loadedPzUid = sudoApp.mySolver.getLoadedPuzzleUID();
            if (loadedPzUid == selectedId) {
                sudoApp.mySolver.init();
                sudoApp.mySolver.notify();
            }
            sudoApp.myPuzzleDB.deleteSelected();
            this.nextBtnPressed();
            sudoApp.myPuzzleDB.notify();
        }
    }

    printSelectedPuzzle() {
        // Button on the solver view
        let myPrintView = new SudokuPrintView();
        myPrintView.print();
    }


    puzzleDBPrintBtnPressed() {
        // Button on the puzzle DB view
        this.printSelectedPuzzle();
    }

    puzzleDbDownloadBtnPressed() {
        // Button on the puzzle DB view
        this.myPuzzleDB.downloadPuzzleDb();
    }

    puzzleDownloadBtnPressed() {
        // Button on the puzzle DB view
        this.myPuzzleDB.downloadPuzzle();
    }

    puzzleDbUploadBtnPressed() {
        // Button on the puzzle DB view
        chooseAFile();
    }


    closeBtnPressed() {
        sudoApp.myPuzzleDBDialog.close();
    }
}
class SudokuPrintView extends MVC_View {
    constructor() {
        super();
    }

    clearPuzzleHeader() {
        let nrElem = document.getElementById('print-pz-id-row');
        nrElem.innerHTML = "";
    }

    clearPrintTable() {
        let myPrintTable = document.getElementById('print-pz-table');
        while (myPrintTable.firstChild) {
            myPrintTable.removeChild(myPrintTable.lastChild);
        }
    }

    loadHeader() {
        let puzzleIdentityRow = document.getElementById('print-pz-id-row');
        let name = sudoApp.myPuzzleDB.getSelectedPuzzle().name;
        let level = sudoApp.myPuzzleDB.getSelectedPuzzle().preRunRecord.level;
        puzzleIdentityRow.innerHTML =
            '<b>Puzzle-Name:</b> &nbsp' + name + '; &nbsp'
            + '<b>Schwierigkeitsgrad:</b> &nbsp' + level + ';';
    }

    loadPrintTable() {
        if (sudoApp.myPuzzleDB.getSize() > 0) {
            let table = document.getElementById('print-pz-table');
            let tableArray = sudoApp.myPuzzleDB.getSelectedPuzzle().puzzle;
            let k = 0;
            for (let row = 0; row < 9; row++) {
                for (let col = 0; col < 9; col++) {
                    let cellField = document.createElement('div')
                    cellField.classList.add('print-cell-field');
                    if (tableArray[k].cellValue == '0') {
                        let currentText = document.createTextNode('');
                        cellField.appendChild(currentText);
                    } else {
                        let currentText = document.createTextNode(tableArray[k].cellValue);
                        cellField.appendChild(currentText);
                        if (tableArray[k].cellPhase == 'define') {
                            cellField.style.color = 'blue';
                            cellField.style.fontWeight = 'bold';
                        } else {
                            cellField.style.color = 'grey';
                        }
                    }
                    cellField.style.border = "1px solid darkgrey";
                    if (row === 2 || row === 5) {
                        cellField.style.borderBottom = "2px solid black";
                    }
                    if (col === 2 || col === 5) {
                        cellField.style.borderRight = "2px solid black";
                    }
                    table.appendChild(cellField);
                    k++;
                }
            }
        }
    }

    print() {
        this.clearPuzzleHeader()
        this.clearPrintTable();
        this.loadHeader();
        this.loadPrintTable();
        window.print();
    }
}
class PreRunRecord {
    constructor() { };
    static nullPreRunRecord() {
        return {
            level: 'Keine Angabe',
            backTracks: 0,
            solvedPuzzle: []
        }
    }
}
class PuzzleRecord {
    constructor() { };
    static nullPuzzleRecord() {
        return {
            id: '',
            name: '-',
            statusGiven: 0,
            statusSolved: 0,
            statusOpen: 0,
            date: '',
            puzzle: [],
            preRunRecord: PreRunRecord.nullPreRunRecord()
        }
    }
}
class Puzzle {
    constructor(record) {
        this.myRecord = record;
        this.myNumberOfSolutions = 0;
        this.mySearchIsCompleted = false;
    }
    getNumberOfSolutions() {
        return this.myNumberOfSolutions;
    }
    getSearchIsCompleted() {
        return this.mySearchIsCompleted;
    }
    setSearchIsCompleted(nrSol) {
        this.myNumberOfSolutions = nrSol;
        this.mySearchIsCompleted = true;
    }
    set(nrSol, completed) {
        this.myNumberOfSolutions = nrSol;
        this.mySearchIsCompleted = completed;
    }
    reset() {
        this.myNumberOfSolutions = 0;
        this.mySearchIsCompleted = false;
    }
    isInitial() {
        return this.myNumberOfSolutions == 0
            && !this.mySearchIsCompleted;

    }
}
// ==========================================
// Grid related classes 
// ==========================================
class SudokuGroupView extends MVC_View {
    constructor(group) {
        super(group);
    }
    getMyGroup() {
        return this.myModel;
    }
    displayUnsolvability() {
        // Analog die Widerspruchserkennung durch zwei gleiche notwendige Nummern in der Gruppe.
        let intNecessary = this.getMyGroup().withConflictingNecessaryNumbers();
        if (intNecessary > 0) {
            this.displayError();
            sudoApp.mySolver.getMyView().displayReasonUnsolvability('In der Gruppe zwei gleiche notwendige Nummern: ' + intNecessary);
            return true;
        }
        // Die Widersprüchlichkeit des Puzzles steht schon fest, wenn in einer Gruppe, also einem Block, 
        // einer Reihe oder einer Spalte an verschiedenen Stellen das gleiche Single auftritt.
        let intSingle = this.getMyGroup().withConflictingSingles();
        if (intSingle > 0) {

            this.displayError();
            sudoApp.mySolver.getMyView().displayReasonUnsolvability('In der Gruppe zwei gleiche Singles: ' + intSingle);
            return true;
        }
        // Widerspruchserkennung durch eine fehlende Nummer in der Gruppe.
        let missingNumbers = this.getMyGroup().withMissingNumber();
        if (missingNumbers.size > 0) {
            this.displayError();
            const [missingNr] = missingNumbers;
            sudoApp.mySolver.getMyView().displayReasonUnsolvability('In der Gruppe fehlt die Nummer: ' + missingNr);
            return true;
        }
        return false;
    }
}
class SudokuGroup extends MVC_Model {
    // Abstrakte Klasse, deren konkrete Instanzen
    // ein Block, eine Spalte oder Reihe der Tabelle sind
    constructor(suTable) {
        super();
        // Die Collection kennt ihre Tabelle
        this.myGrid = suTable;
        this.myCells = [];
        // In jedem Block, jeder Spalte und Reihe müssen alle Zahlen 1..9 einmal vorkommen.
        // Für eine konkreten Block, eine Spalte oder Reihe sind MissingNumbers Zahlen,
        // die nicht in ihr vorkommen.
        this.myPairInfos = [];
    }

    clear() {
        this.clearEvaluations();
    }

    clearEvaluations() {
        this.myPairInfos = [];
    }


    isUnsolvable() {
        // Wenn es eine Gruppe mit Conflicting Singles gibt, ist das Sudoku unlösbar.
        // Wenn es eine Gruppe gibt, in der nicht mehr alle Nummern vorkommen.
        // Wenn es eine Gruppe gibt, in der dieselbe Nummer mehrmals notwendig ist.
        return (
            this.withConflictingSingles() > 0 ||
            this.withConflictingNecessaryNumbers() > 0 ||
            this.withMissingNumber().size > 0);
    }

    withConflictingNecessaryNumbers() {
        let numberCounts = [0, 0, 0, 0, 0, 0, 0, 0, 0];
        let found = false;
        let intNecessary = -1;
        for (let i = 0; i < 9; i++) {
            if (this.myCells[i].getValue() == '0') {
                // Wir betrachten nur offene Zellen
                let necessarys = this.myCells[i].getNecessarys();
                if (necessarys.size == 1) {
                    necessarys.forEach(nr => {
                        intNecessary = parseInt(nr);
                        numberCounts[intNecessary - 1]++;
                        if (numberCounts[intNecessary - 1] > 1) {
                            found = true;
                        };
                    });
                }
            }
            // Wenn wir den ersten Konflikt gefunden haben, können wir die Suche
            // abbrechen. 
            if (found) return intNecessary;
        }
        return -1;
    }

    withMissingNumber() {
        let myNumbers = new MatheSet();
        this.myCells.forEach(cell => {
            if (cell.getValue() == '0') {
                // myNumbers = myNumbers.union(cell.getTotalCandidates());
                myNumbers = myNumbers.union(cell.getCandidates());
            } else {
                myNumbers.add(cell.getValue());
            }
        })
        let missingNumbers = new MatheSet(['1', '2', '3', '4', '5', '6', '7', '8', '9']).difference(myNumbers);
        return (missingNumbers);
    }
    getTotalCandidates() {
        let myNumbers = new MatheSet();
        this.myCells.forEach(cell => {
            if (cell.getValue() == '0') {
                myNumbers = myNumbers.union(cell.getTotalCandidates());
            }
        })
        return myNumbers;
    }

    calculateHiddenPairs() {
        // Berechnet Subpaare in der Gruppe. Dies sind
        // Zellen, die mindestens 2 Nummern enthalten und
        // zwei Zellen enthalten das gleiche Paar-Subset und
        // alle anderen Zellen enthalten keine der Paarnummern.

        // Idee: Zähle für jede Nummer 1 .. 9 die Häufigkeit ihres Auftretens
        // numberCounts[0] = Häufigkeit der 1, bzw. die Indices der Auftreten der 1
        // numberCounts[1] = Häufigkeit der 2, bzw. die Indices der Auftreten der 2
        // usw.

        this.numberCounts = [];
        this.twinPosition = [];
        this.hiddenPairs = [];
        for (let i = 0; i < 9; i++) {
            // Für die 9 Nummern jeweils eine leere Indices-Liste
            this.numberCounts.push([]);
            // Für jede Position in der Gruppe eine leere twin-nummernliste
            this.twinPosition.push([]);
        }
        // Iteriere über die Gruppe
        for (let i = 0; i < 9; i++) {
            if (this.myCells[i].getValue() == '0') {
                // let permNumbers = this.myCells[i].getCandidates();
                let permNumbers = this.myCells[i].getTotalCandidates();
                permNumbers.forEach(nr => {
                    let iNr = parseInt(nr);
                    // Für jede Nummer die Indices ihres Auftretens speichern
                    this.numberCounts[iNr - 1].push(i);
                })
            }
        }
        // NumberCounts auswerten auf Paare
        // Bestimme Nummern, die genau 2 mal vorkommen
        // Iteriere über die Nummern
        for (let i = 0; i < 9; i++) {
            if (this.numberCounts[i].length == 2) {
                // Eine Nummer, für die es 2 Indices gibt, 
                // d.h. in der collection gibt es sie 2-mal.
                // In twinPosition für jede twin-Nummer die beiden Positionen speichern.
                this.twinPosition[this.numberCounts[i][0]].push(i + 1);
                this.twinPosition[this.numberCounts[i][1]].push(i + 1);
            }
        }
        // Ein Subpaar liegt dann vor, wenn 
        // an einer twinPosition exakt 2 Nummern vorliegen und
        // die gleichen zwei Nummern an einer zweiten Postion ein weiteres mal vorliegen.
        // Rückgabe: Nummernpaare mit jeweils 2 Positionen. Gegebenenfalls leer

        // Es können mehrere Paare vorhanden sein
        let tmpSubPairs = [];
        for (let i = 0; i < 9; i++) {
            if (this.twinPosition[i].length == 2) {
                // An dieser Position liegen zwei twin-nummern vor
                // Checke alle begonnenen Paare
                let hiddenPairFound = false;
                for (let k = 0; k < tmpSubPairs.length; k++) {
                    let tmpSubPair = tmpSubPairs[k];
                    if (tmpSubPair.nr1 == this.twinPosition[i][0].toString() &&
                        tmpSubPair.nr2 == this.twinPosition[i][1].toString()) {
                        // Übereinstimmung  mit einem begonnenen Paar
                        tmpSubPair.pos2 = i;
                        // Das Paar ist vollständig
                        this.hiddenPairs.push(tmpSubPair);
                        hiddenPairFound = true;
                        // tmpSubPairs = [];
                    }
                }
                if (!hiddenPairFound) {
                    // Keine Übereinstimmung mit einem begonnenen Paar
                    // Ein neues Paar wird begonnen.
                    let tmpSubPair = {
                        nr1: this.twinPosition[i][0].toString(),
                        nr2: this.twinPosition[i][1].toString(),
                        pos1: i,
                        pos2: -1
                    }
                    tmpSubPairs.push(tmpSubPair);
                }
            }
        }

    }



    calculateEqualPairs() {
        // Zellen, die exakt ein Paar enthalten und
        // zwei Zellen enthalten das gleiche Paar
        this.myPairInfos = [];
        // Iteriere über die Gruppe
        for (let i = 0; i < 9; i++) {
            if (this.myCells[i].getValue() == '0') {
                let tmpCandidates = this.myCells[i].getTotalCandidates()
                if (tmpCandidates.size == 2) {
                    // Infos zum Paar speichern
                    let currentPair = new MatheSet(tmpCandidates);
                    // Prüfen, ob das Paar schon in der PaarInfoliste ist
                    if (this.myPairInfos.length == 0) {
                        let pairInfo = {
                            pairInfoIndex: i,
                            pairIndices: [this.myCells[i].getIndex()],
                            pairSet: tmpCandidates
                        }
                        this.myPairInfos.push(pairInfo);
                    } else {
                        let j = 0;
                        let pairInfoStored = false;
                        while (j < this.myPairInfos.length && !pairInfoStored) {
                            if (currentPair.equals(this.myPairInfos[j].pairSet)) {
                                // Das Paar existiert schon in der Infoliste
                                this.myPairInfos[j].pairIndices.push(this.myCells[i].getIndex());
                                pairInfoStored = true;
                            } else {
                                if (j == this.myPairInfos.length - 1) {
                                    // Das Paar ist nicht vorhanden und wird jetzt eingefügt
                                    let pairInfo = {
                                        pairInfoIndex: i,
                                        pairIndices: [this.myCells[i].getIndex()],
                                        pairSet: tmpCandidates
                                    }
                                    this.myPairInfos.push(pairInfo);
                                    pairInfoStored = true;
                                }
                            }
                            j++;
                        }
                    }
                }
            }
        }
    }

    derive_inAdmissiblesFromHiddenPairs() {
        this.calculateHiddenPairs();
        let inAdmissiblesAdded = false;
        for (let k = 0; k < this.hiddenPairs.length; k++) {
            let hiddenPair = this.hiddenPairs[k];
            // Erste Paar-Zelle bereinigen
            let cell1 = this.myCells[hiddenPair.pos1];
            let tmpCandidates1 = cell1.getTotalCandidates();
            let newInAdmissibles1 = tmpCandidates1.difference(new MatheSet([hiddenPair.nr1, hiddenPair.nr2]));

            if (newInAdmissibles1.size > 0) {
                let oldInAdmissibles = new MatheSet(cell1.inAdmissibleCandidates);
                cell1.inAdmissibleCandidates =
                    cell1.inAdmissibleCandidates.union(newInAdmissibles1);
                let localAdded = !oldInAdmissibles.equals(cell1.inAdmissibleCandidates);
                if (localAdded) {
                    newInAdmissibles1.forEach(inAdNr => {
                        let inAdmissibleSubPairInfo = {
                            collection: this,
                            subPairCell1: this.myCells[hiddenPair.pos1],
                            subPairCell2: this.myCells[hiddenPair.pos2]
                        }
                        cell1.inAdmissibleCandidatesFromHiddenPairs.set(inAdNr, inAdmissibleSubPairInfo);
                    })
                    inAdmissiblesAdded = true;
                }
            }

            // Zweite Paar-Zelle bereinigen
            let cell2 = this.myCells[hiddenPair.pos2];
            let tmpCandidates2 = cell2.getTotalCandidates();
            let newInAdmissibles2 = tmpCandidates2.difference(new MatheSet([hiddenPair.nr1, hiddenPair.nr2]));

            if (newInAdmissibles2.size > 0) {
                let oldInAdmissibles = new MatheSet(cell2.inAdmissibleCandidates);
                cell2.inAdmissibleCandidates =
                    cell2.inAdmissibleCandidates.union(newInAdmissibles2);
                let localAdded = !oldInAdmissibles.equals(cell2.inAdmissibleCandidates);
                if (localAdded) {
                    newInAdmissibles2.forEach(inAdNr => {
                        let inAdmissibleSubPairInfo = {
                            collection: this,
                            subPairCell1: this.myCells[hiddenPair.pos1],
                            subPairCell2: this.myCells[hiddenPair.pos2]
                        }
                        cell2.inAdmissibleCandidatesFromHiddenPairs.set(inAdNr, inAdmissibleSubPairInfo);
                    })
                    inAdmissiblesAdded = true;
                }
            }
        }
        return inAdmissiblesAdded;
    }

    derive_inAdmissiblesFromNecessarys(necessaryCell, necessaryNr) {
        let inAdmissiblesAdded = false;
        this.myCells.forEach(cell => {
            if (cell.getValue() == '0' && cell !== necessaryCell) {
                let oldInAdmissibles = new MatheSet(cell.inAdmissibleCandidates);
                if (cell.getCandidates().has(necessaryNr)) {
                    // Nur zulässige können neu unzulässig werden.
                    cell.inAdmissibleCandidates =
                        cell.inAdmissibleCandidates.add(necessaryNr);
                    let localAdded = !oldInAdmissibles.equals(cell.inAdmissibleCandidates);
                    if (localAdded) {
                        // Die Liste der indirekt unzulässigen verursacht von necessarys wird gesetzt
                        cell.inAdmissibleCandidatesFromNecessarys.add(necessaryNr);
                        inAdmissiblesAdded = true;
                    }
                }
            }
        })
        return inAdmissiblesAdded;
    }

    derive_inAdmissiblesFromNakedPairs() {
        this.calculateEqualPairs();
        let inAdmissiblesAdded = false;
        for (let i = 0; i < this.myPairInfos.length; i++) {
            if (this.myPairInfos[i].pairIndices.length == 2) {
                // Ein Paar, das zweimal in der Gruppe vorkommt
                let pair = this.myPairInfos[i].pairSet;
                // Prüfe, ob Nummern dieses Paar in den admissibles der Gruppe vorkommen
                for (let j = 0; j < 9; j++) {
                    if (this.myCells[j].getValue() == '0') {
                        if (this.myCells[j].getIndex() !== this.myPairInfos[i].pairIndices[0] &&
                            this.myCells[j].getIndex() !== this.myPairInfos[i].pairIndices[1]) {
                            // Zelle der Gruppe, die nicht Paar-Zelle ist
                            let tmpCandidates = this.myCells[j].getTotalCandidates();
                            let tmpIntersection = tmpCandidates.intersection(pair);
                            let oldInAdmissibles = new MatheSet(this.myCells[j].inAdmissibleCandidates);
                            this.myCells[j].inAdmissibleCandidates =
                                this.myCells[j].inAdmissibleCandidates.union(tmpIntersection);

                            let localAdded = !oldInAdmissibles.equals(this.myCells[j].inAdmissibleCandidates);
                            inAdmissiblesAdded = inAdmissiblesAdded || localAdded;
                            if (localAdded) {
                                let newInAdmissibles =
                                    this.myCells[j].inAdmissibleCandidates.difference(oldInAdmissibles);
                                newInAdmissibles.forEach(inAdNr => {
                                    let inAdmissiblePairInfo = {
                                        collection: this,
                                        pairCell1: this.myGrid.sudoCells[this.myPairInfos[i].pairIndices[0]],
                                        pairCell2: this.myGrid.sudoCells[this.myPairInfos[i].pairIndices[1]]
                                    }

                                    this.myCells[j].inAdmissibleCandidatesFromPairs.set(inAdNr, inAdmissiblePairInfo);
                                })
                            }
                        }
                    }
                }
            }
        }
        return inAdmissiblesAdded;
    }

    calculateNecessarys() {
        // Notwendige Nummern sind zulässige Nummern einer Zelle,
        // die in der Block, Reihe oder Spalte der Zelle genau einmal vorkommen.
        let inAdmissiblesAdded = false;
        for (let i = 1; i < 10; i++) {
            // let cellIndex = this.occursOnceInTotalAdmissibles(i);
            let cellIndex = this.occursOnce(i);
            // Wenn die Nummer i genau einmal in der Gruppe vorkommt
            // trage sie ein in der Necessary-liste der Zelle
            if (cellIndex !== -1) {
                if (!this.myCells[cellIndex].myNecessarys.has(i.toString())) {
                    this.myCells[cellIndex].addNecessary(i.toString(), this);
                    let necessaryCell = this.myCells[cellIndex];
                    if (this instanceof SudokuBlock) {
                        let tmpRow = necessaryCell.myRow;
                        let tmpCol = necessaryCell.myCol;
                        inAdmissiblesAdded = inAdmissiblesAdded || tmpRow.derive_inAdmissiblesFromNecessarys(necessaryCell, i.toString());
                        inAdmissiblesAdded = inAdmissiblesAdded || tmpCol.derive_inAdmissiblesFromNecessarys(necessaryCell, i.toString());
                    } else if (this instanceof SudokuRow) {
                        let tmpBlock = necessaryCell.myBlock;
                        let tmpCol = necessaryCell.myCol;
                        inAdmissiblesAdded = inAdmissiblesAdded || tmpBlock.derive_inAdmissiblesFromNecessarys(necessaryCell, i.toString());
                        inAdmissiblesAdded = inAdmissiblesAdded || tmpCol.derive_inAdmissiblesFromNecessarys(necessaryCell, i.toString());
                    } else if (this instanceof SudokuCol) {
                        let tmpRow = necessaryCell.myRow;
                        let tmpBlock = necessaryCell.myBlock;
                        inAdmissiblesAdded = inAdmissiblesAdded || tmpRow.derive_inAdmissiblesFromNecessarys(necessaryCell, i.toString());
                        inAdmissiblesAdded = inAdmissiblesAdded || tmpBlock.derive_inAdmissiblesFromNecessarys(necessaryCell, i.toString());
                    }
                }
            }
        }
        return inAdmissiblesAdded;
    }

    occursOnce(permNr) {
        // Berechne, ob die Zahl permNr in möglichen Zahlen aller Zellen 
        // der Gruppe genau einmal vorkommt
        // Rücgabe: der Index der Zelle, die das einmalige Auftreten enthält
        // -1, falls die Nummer gar nicht auftaucht oder mehrmals
        let countOccurrences = 0;
        let lastCellNr = -1;

        // Iteriere über alle Zellen der Gruppe
        for (let i = 0; i < 9; i++) {
            if (this.myCells[i].getValue() == '0') {
                if (this.myCells[i].getCandidates().has(permNr.toString())) {
                    countOccurrences++;
                    lastCellNr = i;
                }
            }
        }
        if (countOccurrences == 1) {
            return lastCellNr;
        } else {
            return -1;
        }
    }

    occursOnceInTotalAdmissibles(permNr) {
        // Berechne, ob die Zahl permNr in den total zulässigen Zahlen aller Zellen 
        // der Gruppe genau einmal vorkommt
        // Rücgabe: der Index der Zelle, die das einmalige Auftreten enthält
        // -1, falls die Nummer gar nicht auftaucht oder mehrmals
        let countOccurrences = 0;
        let lastCellNr = -1;

        // Iteriere über alle Zellen der Gruppe
        for (let i = 0; i < 9; i++) {
            if (this.myCells[i].getValue() == '0') {
                if (this.myCells[i].getTotalCandidates().has(permNr.toString())) {
                    countOccurrences++;
                    lastCellNr = i;
                }
            }
        }
        if (countOccurrences == 1) {
            return lastCellNr;
        } else {
            return -1;
        }
    }

    withConflictingSingles() {
        // Singles sind Zellen, die nur noch exakt eine zulässige Nummer haben.
        // Conflicting singles sind zwei oder mehr singles in einer Gruppe, 
        // die dieselbe eine zulässige Nummer haben. Sie fordern ja, dass dieselbe Nummer zweimal
        // in der Gruppe vorkommen soll. Mit anderen Worten: 
        // Wenn es eine Gruppe mit Conflicting Singles gibt, ist das Sudoku unlösbar.

        // Idee: Zähle für jede Nummer 1 .. 9 die Häufigkeit ihres Auftretens
        // numberCounts[0] = Häufigkeit der 1, 
        // numberCounts[1] = Häufigkeit der 2, 
        // usw.
        let numberCounts = [0, 0, 0, 0, 0, 0, 0, 0, 0];
        let found = false;
        let intSingle = -1;
        for (let i = 0; i < 9; i++) {
            if (this.myCells[i].getValue() == '0') {
                // Wir betrachten nur offene Zellen
                // Denn, wenn eine der Konfliktzellen geschlossen wäre, würde
                // die noch offene Zelle ohne zulässige Nummer sein. Eine offene Zelle
                // ohne zulässige Nummer fangen wir schon an anderer Stelle ab.
                // let permNumbers = this.myCells[i].getTotalCandidates();
                let permNumbers = this.myCells[i].getCandidates();
                if (permNumbers.size == 1) {
                    permNumbers.forEach(nr => {
                        intSingle = parseInt(nr);
                        numberCounts[intSingle - 1]++;
                        if (numberCounts[intSingle - 1] > 1) {
                            found = true;
                        };
                    });
                }
            }
            // Wenn wir den ersten Konflikt gefunden haben, können wir die Suche
            // abbrechen. 
            if (found) return intSingle;
        }
        return -1;
    }

    withPairConflict() {
        // Pairs sind Zellen, die nur noch exakt zwei zulässige Nummern haben.
        // Ein Pair-Konflikt liegt vor, wenn eine Nummer aus einem Paar 
        // außerhalb des Paares einzeln oder als Paar ein weiteres mal vorkommt.
        this.calculateEqualPairs();
        let found = false;
        for (let i = 0; i < this.myPairInfos.length; i++) {
            if (this.myPairInfos[i].pairIndices.length > 2) {
                // Ein Paar, das dreimal oder mehr in der Gruppe vorkommt
                return true;
            } else if (this.myPairInfos[i].pairIndices.length == 2) {
                let pairSet = this.myPairInfos[i].pairSet;
                this.myCells.forEach(cell => {
                    if (cell.getValue() == '0'
                        && cell.getIndex() !== this.myPairInfos[i].pairIndices[0]
                        && cell.getIndex() !== this.myPairInfos[i].pairIndices[1]) {
                        let numbers = cell.getTotalCandidates();
                        if (numbers.size == 1) {
                            if (pairSet.isSuperset(numbers)) {
                                // Eine Single-Nummer, die Paar-Nummer ist
                                // Widerspruch
                                return true;
                            }
                        }
                    }
                })
            }

        }
        return false;
    }

}
class SudokuBlockView extends SudokuGroupView {
    constructor(block) {
        super(block);

    }
    upDate() {
        let block = this.getMyModel();
        let grid = block.myGrid;
        let gridView = grid.getMyView();
        let gridNode = gridView.getMyNode();

        // Neuer Blockknoten
        let blockNode = document.createElement("div");
        blockNode.setAttribute("class", "sudoku-block");
        // Knoten in dieser View speichern
        this.setMyNode(blockNode);
        //Neuen Blockknoten in den Baum einhängen
        gridNode.appendChild(blockNode);
        // Die Zellen des Blocks anzeigen
        block.myCells.forEach(cell => {
            // Jede Zelle des Blocks anzeigen.
            let cellView = cell.getMyView();
            cellView.upDate();
        })
    }

    upDateNumbers() {
        let block = this.getMyModel();
        let grid = block.myGrid;
        let gridView = grid.getMyView();
        let gridNode = gridView.getMyNode();

        // Neuer Blockknoten
        let blockNode = document.createElement("div");
        blockNode.setAttribute("class", "sudoku-block");
        // Knoten in dieser View speichern
        this.setMyNode(blockNode);
        //Neuen Blockknoten in den Baum einhängen
        gridNode.appendChild(blockNode);
        // Die Zellen des Blocks anzeigen
        block.myCells.forEach(cell => {
            // Jede Zelle des Blocks anzeigen.
            let cellView = cell.getMyView();
            cellView.upDateNumber();
        })

    }

    getMyBlock() {
        return super.getMyModel();
    }

    displayUnsolvability() {
        let tmp = super.displayUnsolvability();
        if (sudoApp.mySolver.getActualEvalType() == 'lazy-invisible') {
            if (tmp) {
                // Inhalte der Gruppe dennoch anzeigen
                this.getMyBlock().myCells.forEach(sudoCell => {
                    if (sudoCell.getValue() == '0') {
                        sudoCell.myView.displayCandidatesInDetail(sudoCell.getCandidates());
                        sudoCell.myView.displayNecessary(sudoCell.myNecessarys);
                    }
                })
            }
        }
        return tmp;
    }

    displayError() {
        this.getMyBlock().myCells.forEach(sudoCell => {
            sudoCell.myView.displayColError();
        })
    }

}
class BlockVector {
    constructor(block, vNr) {
        this.myBlock = block;
        this.myVectorNr = vNr;
        this.myCells = [];
        this.cv1 = undefined;
        this.cv2 = undefined;
        switch (vNr) {
            case 0: {
                let row = 0;
                for (let col = 0; col < 3; col++) {
                    this.myCells.push(this.myBlock.getBlockCellAt(row, col));
                }
                break;
            }
            case 1: {
                let row = 1;
                for (let col = 0; col < 3; col++) {
                    this.myCells.push(this.myBlock.getBlockCellAt(row, col));
                }
                break;
            }
            case 2: {
                let row = 2;
                for (let col = 0; col < 3; col++) {
                    this.myCells.push(this.myBlock.getBlockCellAt(row, col));
                }
                break;
            }
            case 3: {
                let col = 0;
                for (let row = 0; row < 3; row++) {
                    this.myCells.push(this.myBlock.getBlockCellAt(row, col));
                }
                break;
            }
            case 4: {
                let col = 1;
                for (let row = 0; row < 3; row++) {
                    this.myCells.push(this.myBlock.getBlockCellAt(row, col));
                }
                break;
            }
            case 5: {
                let col = 2;
                for (let row = 0; row < 3; row++) {
                    this.myCells.push(this.myBlock.getBlockCellAt(row, col));
                }
                break;
            }
            default: { };
        }
    }

    //Testen
    logVector() {
        this.myCells.forEach(cell => {
            console.log('    Zelle:')
            cell.logCell();
        })
    }

    addComplementVectors(v1, v2) {
        this.cv1 = v1;
        this.cv2 = v2;
    }

    getCandidates() {
        let tmpCandidates = new MatheSet();
        this.myCells.forEach(cell => {
            tmpCandidates = tmpCandidates.union(cell.getTotalCandidates());
        })
        return tmpCandidates;
    }

    getPointingNrCandidates() {
        let numberCount = [0, 0, 0, 0, 0, 0, 0, 0, 0];
        let tmpPointingNrs = new MatheSet();
        let intSingle = -1;
        this.myCells.forEach(cell => {
            if (cell.getValue() == '0') {
                let tmpCandidates = cell.getTotalCandidates();
                tmpCandidates.forEach(nr => {
                    intSingle = parseInt(nr);
                    numberCount[intSingle - 1]++;
                });
            }
        })
        for (let i = 0; i < 9; i++) {
            if (numberCount[i] > 1) {
                tmpPointingNrs.add((i + 1).toString());
            }
        }
        return tmpPointingNrs;
    }

    getPointingNrs() {
        let pointingNrs = new MatheSet();
        // Nummern, die mindestens 2 mal auftauchen
        let pointingCandidates = this.getPointingNrCandidates();
        let complement = this.cv1.getCandidates().union(this.cv2.getCandidates());
        pointingCandidates.forEach(candidate => {
            if (!complement.has(candidate)) {
                // Nummer nur im Pointing Vektor, 
                // Nicht in den beiden anderen Vektoren des Blocks
                pointingNrs.add(candidate);
            }
        })
        return pointingNrs;
    }

}
class SudokuBlock extends SudokuGroup {
    constructor(suTable, blockIndex) {
        // Der Block kennt seine Tabelle und seinen Index
        super(suTable);
        this.myIndex = blockIndex;
        this.myOrigin = {
            row: -1,
            col: -1
        }
        this.myRowVectors = [];
        this.myColVectors = [];
        this.setBlockOrigin(blockIndex);
    }

    addBlockVectors() {
        // 3 Reihen des Blocks
        this.myRowVectors.push(new BlockVector(this, 0));
        this.myRowVectors.push(new BlockVector(this, 1));
        this.myRowVectors.push(new BlockVector(this, 2));
        this.myRowVectors[0].addComplementVectors(this.myRowVectors[1], this.myRowVectors[2]);
        this.myRowVectors[1].addComplementVectors(this.myRowVectors[0], this.myRowVectors[2]);
        this.myRowVectors[2].addComplementVectors(this.myRowVectors[0], this.myRowVectors[1]);

        // 3 Spalten des Blocks
        this.myColVectors.push(new BlockVector(this, 3));
        this.myColVectors.push(new BlockVector(this, 4));
        this.myColVectors.push(new BlockVector(this, 5));
        this.myColVectors[0].addComplementVectors(this.myColVectors[1], this.myColVectors[2]);
        this.myColVectors[1].addComplementVectors(this.myColVectors[0], this.myColVectors[2]);
        this.myColVectors[2].addComplementVectors(this.myColVectors[0], this.myColVectors[1]);
    }

    getBlockCellAt(row, col) {
        return this.myGrid.getCellAt(this.myOrigin.row + row, this.myOrigin.col + col);
    }

    getMatrixRowFromBlockRow(blockRow) {
        return this.myOrigin.row + blockRow;
    }
    getMatrixColFromBlockCol(blockCol) {
        return this.myOrigin.col + blockCol;
    }

    isBlockRow(matrixRow) {
        let blockRow = matrixRow - this.myOrigin.row;
        return (blockRow >= 0 && blockRow < 3);
    }

    isBlockCol(matrixCol) {
        let blockCol = matrixCol - this.myOrigin.col;
        return (blockCol >= 0 && blockCol < 3);
    }

    setBlockOrigin() {
        switch (this.myIndex) {
            case 0: {
                this.myOrigin.row = 0;
                this.myOrigin.col = 0;
                break;
            }
            case 1: {
                this.myOrigin.row = 0;
                this.myOrigin.col = 3;
                break;
            }
            case 2: {
                this.myOrigin.row = 0;
                this.myOrigin.col = 6;
                break;
            }
            case 3: {
                this.myOrigin.row = 3;
                this.myOrigin.col = 0;
                break;
            }
            case 4: {
                this.myOrigin.row = 3;
                this.myOrigin.col = 3;
                break;
            }
            case 5: {
                this.myOrigin.row = 3;
                this.myOrigin.col = 6;
                break;
            }
            case 6: {
                this.myOrigin.row = 6;
                this.myOrigin.col = 0;
                break;
            }
            case 7: {
                this.myOrigin.row = 6;
                this.myOrigin.col = 3;
                break;
            }
            case 8: {
                this.myOrigin.row = 6;
                this.myOrigin.col = 6;
            }
            default: { }
        }
    }

    clearEvaluations() {
        super.clearEvaluations();
        this.myCells.forEach(sudoCell => {
            sudoCell.clearEvaluations();
        })
    }

    clear() {
        super.clear();
        this.myCells.forEach(sudoCell => {
            sudoCell.clear();
        })
    }

    addCell(sudoCell) {
        this.myCells.push(sudoCell);
        sudoCell.setBlock(this);
    }
}
class SudokuRowView extends SudokuGroupView {
    constructor(row) {
        super(row);
    }
    getMyRow() {
        return super.getMyModel();
    }

    displayUnsolvability() {
        let tmp = super.displayUnsolvability();
        if (sudoApp.mySolver.getActualEvalType() == 'lazy-invisible') {
            if (tmp) {
                // Inhalte der Gruppe dennoch anzeigen
                this.getMyRow().myCells.forEach(sudoCell => {
                    if (sudoCell.getValue() == '0') {
                        sudoCell.myView.displayCandidatesInDetail(sudoCell.getCandidates());
                        sudoCell.myView.displayNecessary(sudoCell.myNecessarys);
                    }
                })
            }
        }
        return tmp;
    }

    displayError() {
        this.getMyRow().myCells.forEach(sudoCell => {
            sudoCell.myView.displayRowError();
        })
    }
}
class SudokuRow extends SudokuGroup {
    constructor(suGrid, index) {
        super(suGrid);
        this.myIndex = index;
    }

    addCell(sudoCell) {
        this.myCells.push(sudoCell);
        sudoCell.setRow(this);
    }
}
class SudokuColView extends SudokuGroupView {
    constructor(col) {
        super(col);
    }

    displayUnsolvability() {
        let tmp = super.displayUnsolvability();
        if (sudoApp.mySolver.getActualEvalType() == 'lazy-invisible') {
            if (tmp) {
                // Inhalte der Gruppe dennoch anzeigen
                this.getMyCol().myCells.forEach(sudoCell => {
                    if (sudoCell.getValue() == '0') {
                        sudoCell.myView.displayCandidatesInDetail(sudoCell.getCandidates());
                        sudoCell.myView.displayNecessary(sudoCell.myNecessarys);
                    }
                })
            }
        }
        return tmp;
    }

    getMyCol() {
        return super.getMyModel();
    }


    displayError() {
        this.getMyCol().myCells.forEach(sudoCell => {
            sudoCell.myView.displayColError();
        })
    }
}
class SudokuCol extends SudokuGroup {
    constructor(suGrid, index) {
        super(suGrid);
        this.myIndex = index;
    }
    addCell(sudoCell) {
        this.myCells.push(sudoCell);
        sudoCell.setCol(this);
    }

}
class SudokuGridView extends MVC_View {
    constructor(suGrid) {
        super(suGrid);
        this.myGrid = suGrid;
        this.domExplainer = document.getElementById("grid-plus-explainer");
    }
    upDate() {
        // Das bisherige DOM-Modell löschen
        let old_Node = document.getElementById("main-sudoku-grid");
        // Das neue DOM-Modell erzeugen
        let new_Node = document.createElement('div');
        new_Node.setAttribute('id', 'main-sudoku-grid');
        new_Node.classList.add('main-sudoku-grid');
        this.domExplainer.replaceChild(new_Node, old_Node);
        this.setMyNode(new_Node);

        // Die 9 Blöcke anzeigen
        // let grid = this.getMyModel();
        let grid = this.myGrid;
        if (sudoApp.mySolver.getActualEvalType() == 'lazy-invisible') {
            // Gesetzte Nummern anzeigen
            grid.sudoBlocks.forEach(sudoBlock => {
                // Jeden Block anzeigen.
                let tmpBlockView = sudoBlock.getMyView();
                tmpBlockView.upDateNumbers();
            });
            if (sudoApp.mySolver.isSearching()) {

                if (!grid.isFinished()) {
                    let necessaryCandidateExists = false;
                    let singleCandidateExists = false;
                    let hiddenSingleCandidateExists = false;

                    // Jetzt nur noch über die Zellen iterieren
                    grid.sudoCells.forEach(cell => {
                        if (cell.getValue() == '0') {
                            let cellView = cell.getMyView();
                            if (!necessaryCandidateExists) {
                                if (cellView.upDateNecessary()) {
                                    necessaryCandidateExists = true;
                                    return true;
                                }
                            }
                        }
                    });

                    // If there is no necessary number the first single number will be displayed
                    if (!necessaryCandidateExists) {
                        grid.sudoCells.forEach(cell => {
                            if (cell.getValue() == '0') {
                                let cellView = cell.getMyView();
                                if (cellView.upDateSingle()) {
                                    singleCandidateExists = true;
                                    return true;
                                }
                            }
                        });
                    }

                    // If there is no necessary and no single number the first hidden single number will be displayed       
                    if (!necessaryCandidateExists && !singleCandidateExists) {
                        grid.sudoCells.forEach(cell => {
                            // Jede Zelle des Blocks anzeigen.
                            if (cell.getValue() == '0') {
                                let cellView = cell.getMyView();
                                if (cellView.upDateHiddenSingle()) {
                                    hiddenSingleCandidateExists = true;
                                    return true;
                                }
                            }
                        });
                    }

                    if (!necessaryCandidateExists
                        && !singleCandidateExists
                        && !hiddenSingleCandidateExists) {
                        grid.sudoCells.forEach(cell => {
                            if (cell.getValue() == '0') {
                                let cellView = cell.getMyView();
                                cellView.upDateMultipleOptions();
                                return true;
                            }
                        });
                    }
                }
            }
        } else {
            grid.sudoBlocks.forEach(sudoBlock => {
                // Jeden Block anzeigen.
                let tmpBlockView = sudoBlock.getMyView();
                tmpBlockView.upDate();
                // Dem Block seine View geben
            });
        }

        if (sudoApp.mySolver.isSearching()) {
            new_Node.style.border = "3px dashed white";
        } else {
            new_Node.style.border = "3px solid grey";
        }

        // Unlösbarkeit anzeigen.
        if (sudoApp.mySolver.isSearching()
            || sudoApp.mySolver.getGamePhase() == 'define'
            || (sudoApp.mySolver.isCurrentlyBeingChecked()
                // && sudoApp.mySolver.myPuzzle.myRecord.preRunRecord.level == 'Extrem schwer'
            )) {
            // Die Unlösbarkeit wird nur angezeigt und geprüft,
            // wenn der Automat läuft oder in der Definitionsphase.
            this.displayUnsolvability();
        }
        this.displayWrongNumbers();
        this.displaySelection();
        this.displayAutoSelection();
    }

    displayNameAndDifficulty() {
        let evalNode = document.getElementById("loaded-evaluations");
        evalNode.innerHTML =
            '<span class="pz-name"><b>Puzzle:</b> &nbsp' + sudoApp.mySolver.myPuzzle.myRecord.name + '</span>' +
            '<span class="pz-level"><b>Level:</b> &nbsp' + sudoApp.mySolver.myPuzzle.myRecord.preRunRecord.level + '</span>'
    }

    displaySelection() {
        let grid = this.getMyModel();
        if (grid.indexSelected == -1) {
            grid.sudoCells.forEach(cell => {
                let cellView = cell.getMyView();
                cellView.unsetSelectStatus();
            })
        } else {
            let selectedCell = grid.sudoCells[grid.indexSelected];
            let selectedCellView = selectedCell.getMyView();
            selectedCellView.unsetSelectStatus();
            selectedCellView.setSelectStatus();
        }
    }

    displayAutoSelection() {
        let grid = this.getMyModel();
        if (sudoApp.mySolver.isSearching()
            && sudoApp.mySolver.mySearch.myStepper.indexSelected !== -1) {
            let selectedCell = grid.sudoCells[sudoApp.mySolver.mySearch.myStepper.indexSelected];
            let selectedCellView = selectedCell.getMyView();
            selectedCellView.unsetAutoSelectStatus();
            selectedCellView.setAutoSelectStatus();
        } else {
            grid.sudoCells.forEach(cell => {
                let cellView = cell.getMyView();
                cellView.unsetAutoSelectStatus();
            })
        }
    }

    displayUnsolvability() {
        let myGrid = this.getMyModel();
        // Show only one contradiction.
        // In fact, a contradictory Sudoku has many contradictions at the same time.
        for (let i = 0; i < 81; i++) {
            if (myGrid.sudoCells[i].getMyView().displayUnsolvability()) return;
        }
        for (let i = 0; i < 9; i++) {
            if (myGrid.sudoBlocks[i].getMyView().displayUnsolvability()) return;
        }
        for (let i = 0; i < 9; i++) {
            if (myGrid.sudoRows[i].getMyView().displayUnsolvability()) return;
        }
        for (let i = 0; i < 9; i++) {
            if (myGrid.sudoCols[i].getMyView().displayUnsolvability()) return;
        }
    }
    displayWrongNumbers() {
        let myGrid = this.getMyModel();
        for (let i = 0; i < 81; i++) {
            if (myGrid.sudoCells[i].getMyView().displayWrongNumber());
        }
    }

}
class SudokuGrid extends MVC_Model {
    // Speichert die Sudokuzellen in der Wrapper-Version
    constructor(solver) {
        super();
        // parent
        this.mySolver = solver;
        // the grid content
        this.sudoCells = [];
        this.sudoBlocks = [];
        this.sudoRows = [];
        this.sudoCols = [];
        // Aktuell selektierte Zelle
        this.indexSelected = -1;
        // In der selektierten Zelle die Indices der selektierten
        // zulässigen Nummer
        this.candidateIndexSelected = -1;
        // Im aktuellen Lösungsschritt wird das grid
        // im lazy mode angezeigt. Dies ist dann nützlich, wenn der
        // Solver einen hidden single step durchführt und erklärt
        this.stepLazy = false;
    }

    init() {
        this.indexSelected = -1;
        this.candidateIndexSelected = -1;
        // Erzeuge die interne Tabelle
        this.createSudoGrid();
        this.evaluateMatrix();
    }

    setStepLazy() {
        this.stepLazy = true;
        sudoApp.mySolver.setActualEvalType('lazy');
    }
    unsetStepLazy() {
        if (this.stepLazy) {
            this.stepLazy = false;
            sudoApp.mySolver.setActualEvalType('lazy-invisible');
        }
    }
    loadPuzzle(puzzleRecordToLoad) {
        // Populate Grid 
        for (let i = 0; i < 81; i++) {
            let tmpCellValue = puzzleRecordToLoad.puzzle[i].cellValue;
            let tmpCellPhase = 'define';
            if (tmpCellValue == undefined) {
                // Altes Format lesen
                tmpCellValue = puzzleRecordToLoad.puzzle[i];
            } else {
                tmpCellPhase = puzzleRecordToLoad.puzzle[i].cellPhase;
            }
            this.sudoCells[i].manualSetValue(tmpCellValue, tmpCellPhase);
        }
        this.evaluateMatrix();
    }


    // ========================================================
    // Setter
    // ========================================================
    setSolvedToGiven() {
        // Vom Generator verwendete Funktion
        // Alle gelöste Zellen werden in Givens umgewandelt
        this.initCurrentSelection();
        for (let i = 0; i < 81; i++) {
            if (this.sudoCells[i].getValue() !== '0') {
                if (this.sudoCells[i].getPhase() == 'play') {
                    this.sudoCells[i].clearAutoExecInfo();
                    this.sudoCells[i].setPhase('define');
                }
            }
        }
        this.evaluateMatrix();
    }

    setAdMissibleIndexSelected(nr) {
        this.candidateIndexSelected = nr;
    }

    // ========================================================
    // Getter
    // ========================================================

    getCellAt(row, col) {
        return this.sudoCells[9 * row + col];
    }

    puzzleSolved() {
        for (let i = 0; i < 81; i++) {
            if (this.sudoCells[i].getValue() == '0') {
                return false;
            }
        }
        return true;
    }
    numberOfNonEmptyCells() {
        let tmp = 0;
        for (let i = 0; i < 81; i++) {
            if (this.sudoCells[i].getValue() !== '0') {
                tmp++;
            }
        }
        return tmp;
    }
    numberOfGivens() {
        let tmp = 0;
        for (let i = 0; i < 81; i++) {
            if (this.sudoCells[i].getValue() !== '0') {
                if (this.sudoCells[i].getPhase() == 'define') {
                    tmp++;
                }
            }
        }
        return tmp;
    }

    numberOfSolvedCells() {
        let tmp = 0;
        for (let i = 0; i < 81; i++) {
            if (this.sudoCells[i].getValue() !== '0') {
                if (this.sudoCells[i].getPhase() == 'play') {
                    tmp++;
                }
            }
        }
        return tmp;
    }

    isInitial() {
        return (this.numberOfSolvedCells() == 0);
    }

    numberOfOpenCells() {
        return 81 - this.numberOfGivens()
            - this.numberOfSolvedCells();
    }

    getPuzzleStr() {
        let tmpPuzzle = [];
        for (let i = 0; i < 81; i++) {
            tmpPuzzle[i] = {
                cellValue: this.sudoCells[i].getValue(),
                cellPhase: this.sudoCells[i].getPhase()
            }
        }
        return JSON.stringify(tmpPuzzle);
    }

    setPuzzleStr(strPuzzle) {
        let tmpPuzzle = JSON.parse(strPuzzle);
        for (let i = 0; i < 81; i++) {
            this.sudoCells[i].setValue(tmpPuzzle[i].cellValue);
            this.sudoCells[i].setPhase(tmpPuzzle[i].cellPhase);
        }
    }


    isUnsolvable() {
        for (let i = 0; i < 81; i++) {
            if (this.sudoCells[i].isUnsolvable()) {
                return true;
            }
        }
        for (let i = 0; i < 9; i++) {
            if (this.sudoBlocks[i].isUnsolvable()) {
                return true;
            }
        }
        for (let i = 0; i < 9; i++) {
            if (this.sudoRows[i].isUnsolvable()) {
                return true;
            }
        }
        for (let i = 0; i < 9; i++) {
            if (this.sudoCols[i].isUnsolvable()) {
                return true;
            }
        }
        return false;
    }
    isFinished() {
        for (let i = 0; i < 81; i++) {
            if (this.sudoCells[i].getValue() == '0') return false;
        }
        return true;
    }
    // ========================================================
    // Other methods
    // ========================================================
    evaluateMatrix() {
        if (this.mySolver.currentEvalType == 'lazy-invisible') this.evaluateGridLazy();
        if (this.mySolver.currentEvalType == 'lazy') this.evaluateGridLazy();
        if (this.mySolver.currentEvalType == 'strict-plus' || this.mySolver.currentEvalType == 'strict-minus') this.evaluateGridStrict();
    }

    clearAutoExecCellInfos() {
        for (let i = 0; i < 81; i++) {
            this.sudoCells[i].clearAutoExecInfo();
        }
    }

    reset() {
        // Alle in der Phase 'play' gesetzten Zahlen werden gelöscht
        // Die Zellen der Aufgabenstellung bleiben erhalten
        // Schritt 1: Die aktuelle Selektion wird zurückgesetzt
        this.initCurrentSelection();
        // Schritt 2: Die aktuellen Zellinhalte werden gelöscht
        for (let i = 0; i < 81; i++) {
            if (this.sudoCells[i].getValue() !== '0') {
                if (this.sudoCells[i].getPhase() == 'play') {
                    this.sudoCells[i].clear();
                }
            }
        }
        this.deselect();
        this.evaluateMatrix();
    }


    takeBackGivenCells() {
        // Function used by the puzzle generator
        // Deletes solved cells as long as the grid 
        // retains a unique solution.
        let randomCellOrder = Randomizer.getRandomNumbers(81, 0, 81);
        for (let i = 0; i < 81; i++) {
            let k = randomCellOrder[i];
            if (this.sudoCells[k].getValue() !== '0') {
                // Select cell with set number
                this.select(k);
                // Make a note of the set number so that you can restore it if necessary
                let tmpNr = this.sudoCells[k].getValue();
                // delete number in cell
                this.deleteSelected('define');
                // Evaluate the remaining matrix strictly.
                this.evaluateGridStrict();

                if (this.sudoCells[k].getNecessarys().size == 1) {
                    // Deleting the cell is ok because the deleted cell 
                    // has a unique candidate. 
                } else if (this.sudoCells[k].getTotalCandidates().size == 1) {
                    // Deleting the cell is ok because the deleted cell 
                    // has a unique candidate. 
                } else {
                    // The deleted cell does not have a unique candidate to be selected
                    // The deletion is therefore cancelled.
                    this.select(k);
                    this.sudoCells[k].manualSetValue(tmpNr, 'define');
                }
            }
        }
    }

    canTakenBackGivenCells() {
        // 
        let randomCellOrder = Randomizer.getRandomNumbers(81, 0, 81);
        for (let i = 0; i < 81; i++) {
            let k = randomCellOrder[i];
            if (this.sudoCells[k].getValue() !== '0') {
                // Select cell with set number
                this.select(k);
                // Make a note of the set number so that you can restore it if necessary
                let tmpNr = this.sudoCells[k].getValue();
                // delete number in cell
                this.deleteSelected('define');
                // Evaluate the remaining matrix strictly.
                this.evaluateGridStrict();

                if (this.sudoCells[k].getNecessarys().size == 1) {
                    // Deleting the cell is ok because the deleted cell 
                    // has a unique given. 
                    return true;
                } else if (this.sudoCells[k].getTotalCandidates().size == 1) {
                    // Deleting the cell is ok because the deleted cell 
                    // has a unique given.
                    return true;
                } else {
                    // The deleted cell does not have a unique number to be selected
                    // The deletion is therefore cancelled.
                    this.select(k);
                    this.sudoCells[k].manualSetValue(tmpNr, 'define');
                }
            }
        } return false;
    }



    getPuzzleArray() {
        let tmpPuzzleArray = [];
        for (let i = 0; i < 81; i++) {
            tmpPuzzleArray.push({
                cellPhase: this.sudoCells[i].getPhase(),
                cellValue: this.sudoCells[i].getValue()
            })
        }
        return tmpPuzzleArray;
    }

    getSimplePuzzleArray() {
        let tmpPuzzleArray = [];
        for (let i = 0; i < 81; i++) {
            tmpPuzzleArray.push(this.sudoCells[i].getValue());
        }
        return tmpPuzzleArray;
    }

    loadPuzzleArray(pa) {
        for (let i = 0; i < 81; i++) {
            let tmpCellValue = pa[i].cellValue;
            let tmpCellPhase = pa[i].cellPhase;
            this.sudoCells[i].manualSetValue(tmpCellValue, tmpCellPhase);
        }
    }

    loadPuzzleArrayGivens(pa) {
        for (let i = 0; i < 81; i++) {
            let tmpCellValue = pa[i].cellValue;
            let tmpCellPhase = pa[i].cellPhase;
            if (tmpCellPhase == 'define') {
                this.sudoCells[i].manualSetValue(tmpCellValue, tmpCellPhase);
            } else {
                this.sudoCells[i].manualSetValue('0', '');
            }
        }
    }

    loadSimplePuzzleArray(pa) {
        for (let i = 0; i < 81; i++) {
            if (pa[i] == '0') {
                this.sudoCells[i].manualSetValue(pa[i], '');
            } else {
                this.sudoCells[i].manualSetValue(pa[i], 'define');
            }
        }
    }


    createSudoGrid() {
        // Eine lokale Hilfsfunktion
        function calcIndex(row, col) {
            if (row == 0 && col == 0) {
                return 0;
            } else if (row == 0 && col == 1) {
                return 1;
            } else if (row == 0 && col == 2) {
                return 2;
            } else if (row == 1 && col == 0) {
                return 3;
            } else if (row == 1 && col == 1) {
                return 4;
            } else if (row == 1 && col == 2) {
                return 5;
            } else if (row == 2 && col == 0) {
                return 6;
            } else if (row == 2 && col == 1) {
                return 7;
            } else if (row == 2 && col == 2) {
                return 8;
            }
        }
        this.sudoCells = [];
        this.sudoBlocks = [];
        this.sudoRows = [];
        this.sudoCols = [];

        // Die 9 Blöcke anlegen
        for (let i = 0; i < 9; i++) {
            let block = new SudokuBlock(this, i);
            let blockView = new SudokuBlockView(block);

            block.setMyView(blockView);
            this.sudoBlocks.push(block);
        }
        // Die 81 Zellen anlegen und in ihren jeweiligen Block einfügen
        for (let i = 0; i < 81; i++) {
            let row = Math.floor(i / 9);
            let col = i % 9;
            let blockRow = Math.floor(row / 3);
            let blockCol = Math.floor(col / 3);
            let tmpBlockIndex = calcIndex(blockRow, blockCol);

            let cell = new SudokuCell(this, i);
            cell.setBlock(this.sudoBlocks[tmpBlockIndex]);
            let cellView = new SudokuCellView(cell);
            cell.setMyView(cellView);
            this.sudoCells.push(cell);
            this.sudoBlocks[tmpBlockIndex].addCell(cell);
        }
        // Influencers in den Zellen setzen
        // Das geschieht nur einmal bei der Initialisierung
        for (let i = 0; i < 81; i++) {
            this.sudoCells[i].setInfluencers(this.influencersOfCell(i));
        }
        // Setze die Row-Col-Vektoren
        // Laufindex über dem Cell-Vektor
        let currentIndex = 0;
        // Die Col-Vektoren werden angelegt, zunächst leer
        for (let i = 0; i < 9; i++) {
            let col = new SudokuCol(this, i);
            let colView = new SudokuColView(col);
            col.setMyView(colView);
            this.sudoCols.push(col);
        }
        for (let i = 0; i < 9; i++) {
            // Ein Row-Vektor wird angelegt
            let row = new SudokuRow(this, i);
            let rowView = new SudokuRowView(row);
            row.setMyView(rowView);
            for (let j = 0; j < 9; j++) {
                let currentCell = this.sudoCells[currentIndex];
                // Die aktuelle Zelle wird der aktuellen Reihe hinzugefügt
                row.addCell(currentCell);
                // Die aktuelle Zelle wird dem Spaltenvektor j hinzugefügt
                this.sudoCols[j].addCell(currentCell);
                currentIndex++;
            }
            this.sudoRows.push(row);
        }
        // Row- und Col-Vektoren in den Blöcken anlegen
        for (let i = 0; i < 9; i++) {
            this.sudoBlocks[i].addBlockVectors();
        }

    }

    initCurrentSelection() {
        this.deselect();
    }

    deselect() {
        if (this.isCellSelected()) {
            // Lösche die Selektionsinformation der Tabelle
            this.selectedCell().unsetSelected();
            this.indexSelected = -1;
            this.candidateIndexSelected = -1;
        }
    }

    setCurrentSelection(index) {
        let cell = this.sudoCells[index];
        cell.setSelected();
        this.indexSelected = index;
    }

    isCellSelected() {
        return this.indexSelected !== -1;
    }

    selectedCell() {
        if (this.indexSelected > -1) {
            return this.sudoCells[this.indexSelected];
        } else {
            return undefined;
        }
    }

    atCurrentSelectionSetNumber(btnNumber, currentPhase) {
        // Setze Nummer in einer Zelle
        if ( // Das geht nur, wenn eine Zelle selektiert ist
            this.isCellSelected()) {
            let cell = this.selectedCell();
            if (// Wenn die Zelle leer ist, kein Problem
                (this.selectedCell().getValue() == '0') ||
                // Wenn die Zelle gefüllt ist, kann nur im gleichen Modus
                // eine Neusetzung erfolgen
                (this.selectedCell().getPhase() == currentPhase)) {
                this.selectedCell().unsetWrong();
                this.selectedCell().manualSetValue(btnNumber, currentPhase);
                this.deselect();
                this.evaluateMatrix();
            }
        }
    }

    atCurrentSelectionSetAutoNumber(currentStep) {
        // Setze Nummer in einer Zelle
        if ( // Das geht nur, wenn eine Zelle selektiert ist
            this.isCellSelected()) {
            if (// Wenn die Zelle leer ist, kein Problem
                (this.selectedCell().getValue() == '0') ||
                // Wenn die Zelle geüllt ist, kann nur im gleichen Modus
                // eine Neusetzung erfolgen
                (this.selectedCell().getPhase() == 'play')
            ) {
                this.selectedCell().unsetWrong();
                this.selectedCell().autoSetValue(currentStep);
                this.deselect();
                this.evaluateMatrix();
            }
        }
    }

    deleteSelected(currentPhase) {
        // Lösche die selektierte Zelle
        if (this.isCellSelected()) {
            // Das Löschen kann nur im gleichen Modus
            // eine Neusetzung erfolgen
            if (this.selectedCell().getPhase() == currentPhase) {
                this.selectedCell().clear();
                this.deselect();
                this.evaluateMatrix();
            }
        }
    }


    evaluateGridLazy() {
        // Calculate the grid only so far, 
        // that the next step can be done unambiguously
        this.clearEvaluations();
        this.calculateInAdmissibles();
        let inAdmissiblesAdded = true;
        while (inAdmissiblesAdded && !this.isUnsolvable()) {
            if (this.calculateNecessarys()) return true;
            if (this.calculateSingles()) return true;
            inAdmissiblesAdded = false;
            // inAdmissiblesFromNecessarys can no longer exist, 
            // because the necessarys are consumed in the first part of the loop
            // derive_inAdmissiblesFromSingles can no longer exist,
            // for the same reason.
            if (this.derive_inAdmissiblesFromNakedPairs()) {
                inAdmissiblesAdded = true;
            } else if (this.derive_inAdmissiblesFromIntersection()) {
                inAdmissiblesAdded = true;
            } else if (this.derive_inAdmissiblesFromPointingPairs()) {
                inAdmissiblesAdded = true;
            } else if (this.derive_inAdmissiblesFromHiddenPairs()) {
                inAdmissiblesAdded = true;
            }
        }
    }

    evaluateGridStrict() {
        this.clearEvaluations();
        this.calculateInAdmissibles();
        this.calculateNecessarys();
        let inAdmissiblesAdded = true;
        let c1 = false;
        let c2 = false;
        let c3 = false;
        let c4 = false;
        let c5 = false;
        while (inAdmissiblesAdded && !this.isUnsolvable()) {
            c4 = this.derive_inAdmissiblesFromSingles();
            c1 = this.derive_inAdmissiblesFromHiddenPairs();
            c2 = this.derive_inAdmissiblesFromNakedPairs();
            c3 = this.derive_inAdmissiblesFromIntersection();
            c5 = this.derive_inAdmissiblesFromPointingPairs();
            inAdmissiblesAdded = c1 || c2 || c3 || c4 || c5;
        }
    }

    clearEvaluations() {
        // Iteriere über die Blöcke
        for (let i = 0; i < 9; i++) {
            let tmpBlock = this.sudoBlocks[i];
            tmpBlock.clearEvaluations();
        }
        // Iteriere über die Reihen
        for (let i = 0; i < 9; i++) {
            let tmpRow = this.sudoRows[i];
            tmpRow.clearEvaluations();
        }
        // Iteriere über die Spalten
        for (let i = 0; i < 9; i++) {
            let tmpCol = this.sudoCols[i];
            tmpCol.clearEvaluations();
        }
    }

    calculateSingles() {
        // All singles, regardless wether real or hidden singles
        let added = false;
        for (let i = 0; i < 81; i++) {
            if (this.sudoCells[i].getValue() == '0') {
                if (this.sudoCells[i].getTotalCandidates().size == 1) {
                    return true;
                }
            }
        }
        return added;
    }

    derive_inAdmissiblesFromSingles() {
        let inAdmissiblesAdded = false;
        for (let i = 0; i < 81; i++) {
            if (this.sudoCells[i].getValue() == '0') {
                let singlesInContext = new MatheSet();
                this.sudoCells[i].myInfluencers.forEach(cell => {
                    if (cell.getValue() == '0') {
                        singlesInContext = singlesInContext.union(cell.getTotalSingles());
                    }
                })
                let oldInAdmissibles = new MatheSet(this.sudoCells[i].inAdmissibleCandidates);
                let mySingle = this.sudoCells[i].getTotalSingles();
                if (mySingle.size == 1 && singlesInContext.isSuperset(mySingle)) {
                    // This is the situation: The same single twice in a block, column or row.
                    // So an unsolvable Puzzle.
                    // Further calculation is useless, because the unsolvability
                    // can already be determined at the group level.
                    // The unsolvability is also easier for the user to understand at the group level.
                } else {
                    // Only admissible ones can become inadmissible.
                    let tmpCandidates = this.sudoCells[i].getCandidates();
                    let inAdmissiblesFromSingles = tmpCandidates.intersection(singlesInContext);
                    // The inadmissible candidates are reset
                    this.sudoCells[i].inAdmissibleCandidates =
                        this.sudoCells[i].inAdmissibleCandidates.union(inAdmissiblesFromSingles);

                    let localAdded = !oldInAdmissibles.equals(this.sudoCells[i].inAdmissibleCandidates);
                    inAdmissiblesAdded = inAdmissiblesAdded || localAdded;
                    if (localAdded) {
                        let newInAdmissibles =
                            this.sudoCells[i].inAdmissibleCandidates.difference(oldInAdmissibles);
                        this.sudoCells[i].inAdmissibleCandidatesFromSingles = newInAdmissibles;
                    }
                }
            }
        }
        return inAdmissiblesAdded;
    }

    derive_inAdmissiblesFromNakedPairs() {
        let c1 = false;
        let c2 = false;
        let c3 = false;
        // Iteriere über die Blockn
        for (let i = 0; i < 9; i++) {
            let tmpBlock = this.sudoBlocks[i];
            c1 = c1 || tmpBlock.derive_inAdmissiblesFromNakedPairs();
        }
        // Iteriere über die Reihen
        for (let i = 0; i < 9; i++) {
            let tmpRow = this.sudoRows[i];
            c2 = c2 || tmpRow.derive_inAdmissiblesFromNakedPairs();
        }
        // Iteriere über die Spalten
        for (let i = 0; i < 9; i++) {
            let tmpCol = this.sudoCols[i];
            c3 = c3 || tmpCol.derive_inAdmissiblesFromNakedPairs();
        }
        let inAdmissiblesAdded = c1 || c2 || c3;
        return inAdmissiblesAdded;
    }

    derive_inAdmissiblesFromHiddenPairs() {
        let c1 = false;
        let c2 = false;
        let c3 = false;
        // Iteriere über die Blockn
        for (let i = 0; i < 9; i++) {
            let tmpBlock = this.sudoBlocks[i];
            c1 = c1 || tmpBlock.derive_inAdmissiblesFromHiddenPairs();
        }
        // Iteriere über die Reihen
        for (let i = 0; i < 9; i++) {
            let tmpRow = this.sudoRows[i];
            c2 = c2 || tmpRow.derive_inAdmissiblesFromHiddenPairs();
        }
        // Iteriere über die Spalten
        for (let i = 0; i < 9; i++) {
            let tmpCol = this.sudoCols[i];
            c3 = c3 || tmpCol.derive_inAdmissiblesFromHiddenPairs();
        }
        let inAdmissiblesAdded = c1 || c2 || c3;
        return inAdmissiblesAdded;
    }

    // Funktionen für die Überschneidungstechnik

    cellIntersectionInRowEliminate(tmpBlock, row, strongRow, strongNumbers) {
        // Eliminiere die strongNumbers in row des Blocks tmpBlock
        let inAdmissiblesAdded = false;

        // Iteriere über die 3 Zellen der Blockreihe
        for (let col = 0; col < 3; col++) {
            let tmpCell = tmpBlock.getBlockCellAt(row, col);

            if (tmpCell.getValue() == '0') {
                let oldInAdmissibles = new MatheSet(tmpCell.inAdmissibleCandidates);
                let tmpCandidates = tmpCell.getTotalCandidates();
                let inAdmissiblesFromIntersection = tmpCandidates.intersection(strongNumbers);

                if (inAdmissiblesFromIntersection.size > 0) {
                    tmpCell.inAdmissibleCandidates =
                        tmpCell.inAdmissibleCandidates.union(inAdmissiblesFromIntersection);
                    let localAdded = !oldInAdmissibles.equals(tmpCell.inAdmissibleCandidates);
                    inAdmissiblesAdded = inAdmissiblesAdded || localAdded;
                    if (localAdded) {
                        let newInAdmissibles =
                            tmpCell.inAdmissibleCandidates.difference(oldInAdmissibles);
                        // Die Liste der indirekt unzulässigen verursacht von overlap wird gesetzt
                        tmpCell.inAdmissibleCandidatesFromIntersection = newInAdmissibles;
                        newInAdmissibles.forEach(inAdNr => {
                            let overlapInfo = {
                                block: tmpBlock,
                                rowCol: strongRow
                            }
                            tmpCell.inAdmissibleCandidatesFromIntersectionInfo.set(inAdNr, overlapInfo);
                        })
                    }
                }
            }
        }
        return inAdmissiblesAdded;
    }

    cellIntersectionInColEliminate(tmpBlock, col, strongCol, strongNumbers) {
        // Eliminiere die strongNumbers in col des Blocks tmpBlock
        let inAdmissiblesAdded = false;

        // Iteriere über die 3 Zellen der Blockspalte
        for (let row = 0; row < 3; row++) {
            let tmpCell = tmpBlock.getBlockCellAt(row, col);

            if (tmpCell.getValue() == '0') {
                let oldInAdmissibles = new MatheSet(tmpCell.inAdmissibleCandidates);
                let tmpCandidates = tmpCell.getTotalCandidates();
                let inAdmissiblesFromIntersection = tmpCandidates.intersection(strongNumbers);

                if (inAdmissiblesFromIntersection.size > 0) {

                    tmpCell.inAdmissibleCandidates =
                        tmpCell.inAdmissibleCandidates.union(inAdmissiblesFromIntersection);
                    let localAdded = !oldInAdmissibles.equals(tmpCell.inAdmissibleCandidates);
                    inAdmissiblesAdded = inAdmissiblesAdded || localAdded;
                    if (localAdded) {
                        let newInAdmissibles =
                            tmpCell.inAdmissibleCandidates.difference(oldInAdmissibles);
                        tmpCell.inAdmissibleCandidatesFromIntersection = newInAdmissibles;

                        newInAdmissibles.forEach(inAdNr => {
                            let overlapInfo = {
                                block: tmpBlock,
                                rowCol: strongCol
                            }
                            tmpCell.inAdmissibleCandidatesFromIntersectionInfo.set(inAdNr, overlapInfo);
                        })
                    }
                }
            }
        }
        return inAdmissiblesAdded;
    }


    derive_inAdmissiblesFromPointingPairs() {
        let tmpBlock = null;
        let inAdmissiblesAdded = false;

        // Iteriere über die 9 Blöcke der Matrix
        for (let i = 0; i < 9; i++) {
            tmpBlock = this.sudoBlocks[i];

            // Iteriere über die Reihenvektoren
            for (let row = 0; row < 3; row++) {
                let pointingNrs = tmpBlock.myRowVectors[row].getPointingNrs();
                pointingNrs.forEach(pointingNr => {
                    let newInAdmissiblesAdded = this.eliminatePointingNrInGridRow(pointingNr, tmpBlock.myRowVectors[row], tmpBlock.myOrigin.row + row);
                    inAdmissiblesAdded = inAdmissiblesAdded || newInAdmissiblesAdded;
                })
            }

            // Iteriere über die Spaltenvektoren
            for (let col = 0; col < 3; col++) {
                let pointingNrs = tmpBlock.myColVectors[col].getPointingNrs();
                pointingNrs.forEach(pointingNr => {
                    let newInAdmissiblesAdded = this.eliminatePointingNrInGridCol(pointingNr, tmpBlock.myColVectors[col], tmpBlock.myOrigin.col + col);
                    inAdmissiblesAdded = inAdmissiblesAdded || newInAdmissiblesAdded;
                })
            }
        }
        return inAdmissiblesAdded;
    }

    eliminatePointingNrInGridRow(pointingNr, pointingVector, rowIndex) {
        // Eliminiere pointingNr in row mit Index rowIndex
        let inAdmissiblesAdded = false;
        let block = pointingVector.myBlock;
        let blockOriginCol = block.myOrigin.col;

        // Iteriere über die Zellen der Reihe
        for (let col = 0; col < 9; col++) {
            if (col < blockOriginCol || col > (blockOriginCol + 2)) {
                // col nicht im Pointing Vector
                let tmpCell = this.getCellAt(rowIndex, col);
                if (tmpCell.getValue() == '0') {
                    // Die Zelle ist ungesetzt
                    let oldInAdmissibles = new MatheSet(tmpCell.inAdmissibleCandidates);
                    let tmpCandidates = tmpCell.getTotalCandidates();

                    if (tmpCandidates.has(pointingNr)) {
                        tmpCell.inAdmissibleCandidates.add(pointingNr);

                        let localAdded = !oldInAdmissibles.equals(tmpCell.inAdmissibleCandidates);
                        inAdmissiblesAdded = inAdmissiblesAdded || localAdded;

                        if (localAdded) {
                            tmpCell.inAdmissibleCandidatesFromPointingPairs.add(pointingNr);
                            let pointingPairInfo = {
                                pNr: pointingNr,
                                pVector: pointingVector,
                                rowCol: this.sudoRows[rowIndex]
                            }
                            tmpCell.inAdmissibleCandidatesFromPointingPairsInfo.set(pointingNr, pointingPairInfo);
                        }
                    }
                }
            }
        }
        return inAdmissiblesAdded;
    }


    eliminatePointingNrInGridCol(pointingNr, pointingVector, colIndex) {
        // Eliminiere pointingNr in coö mit Index colIndex
        let inAdmissiblesAdded = false;
        let block = pointingVector.myBlock;
        let blockOriginRow = block.myOrigin.row;

        // Iteriere über die Zellen der Spalte
        for (let row = 0; row < 9; row++) {
            if (row < blockOriginRow || row > (blockOriginRow + 2)) {
                // row nicht im Pointing Vector
                let tmpCell = this.getCellAt(row, colIndex);

                if (tmpCell.getValue() == '0') {
                    // Die Zelle ist ungesetzt
                    let oldInAdmissibles = new MatheSet(tmpCell.inAdmissibleCandidates);
                    let tmpCandidates = tmpCell.getTotalCandidates();

                    if (tmpCandidates.has(pointingNr)) {
                        tmpCell.inAdmissibleCandidates.add(pointingNr);

                        let localAdded = !oldInAdmissibles.equals(tmpCell.inAdmissibleCandidates);
                        inAdmissiblesAdded = inAdmissiblesAdded || localAdded;

                        if (localAdded) {
                            tmpCell.inAdmissibleCandidatesFromPointingPairs.add(pointingNr);
                            let pointingPairInfo = {
                                pNr: pointingNr,
                                pVector: pointingVector,
                                rowCol: this.sudoCols[colIndex]
                            }
                            tmpCell.inAdmissibleCandidatesFromPointingPairsInfo.set(pointingNr, pointingPairInfo);
                        }
                    }
                }
            }
        }
        return inAdmissiblesAdded;
    }

    derive_inAdmissiblesFromIntersection() {
        let tmpBlock = null;
        let tmpRow = null;
        let tmpCol = null;
        let inAdmissiblesAdded = false;

        // Iterate over the 9 blocks of the matrix
        for (let i = 0; i < 9; i++) {
            tmpBlock = this.sudoBlocks[i];

            // Iterate over the 3 rows of the block
            for (let row = 0; row < 3; row++) {
                let matrixRow = tmpBlock.getMatrixRowFromBlockRow(row);
                let numbersInRowOutsideBlock = new MatheSet();
                let numbersInRowInsideBlock = new MatheSet();
                let strongNumbersInRowInsideBlock = new MatheSet();
                tmpRow = this.sudoRows[matrixRow];

                // Iterate over the cells in the row
                for (let col = 0; col < 9; col++) {
                    if (tmpRow.myCells[col].getValue() == '0') {
                        if (tmpBlock.isBlockCol(col)) {
                            numbersInRowInsideBlock = numbersInRowInsideBlock.union(tmpRow.myCells[col].getTotalCandidates());
                        } else {
                            numbersInRowOutsideBlock = numbersInRowOutsideBlock.union(tmpRow.myCells[col].getTotalCandidates());
                        }
                    }
                    // The strict numbers only occur in the block, not outside the block
                    strongNumbersInRowInsideBlock = numbersInRowInsideBlock.difference(numbersInRowOutsideBlock);
                }
                // Reduce the block cells by the strict numbers
                if (strongNumbersInRowInsideBlock.size > 0) {
                    // Set the strict numbers inadmissible in 2 rows of the block
                    let row1 = 0;
                    let row2 = 0;
                    switch (row) {
                        case 0: {
                            row1 = 1;
                            row2 = 2;
                            break;
                        }
                        case 1: {
                            row1 = 0;
                            row2 = 2;
                            break;
                        }
                        case 2: {
                            row1 = 0;
                            row2 = 1;
                        }
                    }
                    let newInAdmissiblesAdded1 = this.cellIntersectionInRowEliminate(tmpBlock, row1, tmpRow, strongNumbersInRowInsideBlock);
                    inAdmissiblesAdded = inAdmissiblesAdded || newInAdmissiblesAdded1;

                    let newInAdmissiblesAdded2 = this.cellIntersectionInRowEliminate(tmpBlock, row2, tmpRow, strongNumbersInRowInsideBlock);
                    inAdmissiblesAdded = inAdmissiblesAdded || newInAdmissiblesAdded2;
                }
            }
            // Iteriere über die Spalten des Blocks
            for (let col = 0; col < 3; col++) {
                let matrixCol = tmpBlock.getMatrixColFromBlockCol(col);
                let numbersInColOutsideBlock = new MatheSet();
                let numbersInColInsideBlock = new MatheSet();
                let strongNumbersInColInsideBlock = new MatheSet();
                tmpCol = this.sudoCols[matrixCol];

                // Iteriere über die Zellen der Spalte
                for (let row = 0; row < 9; row++) {
                    if (tmpCol.myCells[row].getValue() == '0') {
                        if (tmpBlock.isBlockRow(row)) {
                            numbersInColInsideBlock = numbersInColInsideBlock.union(tmpCol.myCells[row].getTotalCandidates());
                        } else {
                            numbersInColOutsideBlock = numbersInColOutsideBlock.union(tmpCol.myCells[row].getTotalCandidates());
                        }
                    }
                    strongNumbersInColInsideBlock = numbersInColInsideBlock.difference(numbersInColOutsideBlock);
                }
                // Die Blockzellen um die strengen Nummern reduzieren
                if (strongNumbersInColInsideBlock.size > 0) {
                    // In 2 Spalten der Block die strong NUmmern inadmissible setzen
                    let col1 = 0;
                    let col2 = 0;
                    //
                    switch (col) {
                        case 0: {
                            col1 = 1;
                            col2 = 2;
                            break;
                        }
                        case 1: {
                            col1 = 0;
                            col2 = 2;
                            break;
                        }
                        case 2: {
                            col1 = 0;
                            col2 = 1;
                        }
                    }
                    // col1 bereinigen            
                    let newInAdmissiblesAdded1 = this.cellIntersectionInColEliminate(tmpBlock, col1, tmpCol, strongNumbersInColInsideBlock);
                    inAdmissiblesAdded = inAdmissiblesAdded || newInAdmissiblesAdded1;

                    let newInAdmissiblesAdded2 = this.cellIntersectionInColEliminate(tmpBlock, col2, tmpCol, strongNumbersInColInsideBlock);
                    inAdmissiblesAdded = inAdmissiblesAdded || newInAdmissiblesAdded2;
                }
            }
        }
        return inAdmissiblesAdded;
    }


    calculateInAdmissibles() {
        for (let i = 0; i < 81; i++) {
            let tmpCell = this.sudoCells[i];
            tmpCell.calculateInAdmissibles();
            tmpCell.candidatesEvaluated = true;
        }
    }

    calculateNecessarys() {
        // Iteriere über die Blöcke
        for (let i = 0; i < 9; i++) {
            let tmpBlock = this.sudoBlocks[i];
            tmpBlock.calculateNecessarys();
        }
        // Iteriere über die Reihen
        for (let i = 0; i < 9; i++) {
            let tmpRow = this.sudoRows[i];
            tmpRow.calculateNecessarys();
        }
        // Iteriere über die Spalten
        for (let i = 0; i < 9; i++) {
            let tmpCol = this.sudoCols[i];
            tmpCol.calculateNecessarys();
        }
    }

    select(index) {
        // Selektiere in der Tabelle eine Zelle
        // Parameter:
        //      cell: Wrapper der Zelle
        //      index: index der Zelle
        let sudoCell = this.sudoCells[index];
        let oldIndex = this.indexSelected;

        if (oldIndex == index) {
            // Die selektierte Zelle bleibt unverändert
            // Setze die nächste Subselektion
            let candidateIndexSelected = sudoCell.nextCandidateIndex();
            if (candidateIndexSelected == -1) {
                // Die Gesamtselektion besitzt keine weitere Subselektion
                // Die Gesamtselektion wird deselektiert.
                this.deselect();
            } else {
                this.setAdMissibleIndexSelected(candidateIndexSelected);
            }
        } else {
            this.deselect();
            // Neue Gesamtselektion
            this.setCurrentSelection(index);
        }
    }

    influencersOfCell(index) {
        // Each cell implicitly has a set of cells that influence it.
        // The set of these cells is calculated here.
        const grid_size = 9;
        const box_size = 3;

        let indexSet = new MatheSet();
        let tmpInfluencers = [];

        let row = Math.floor(index / grid_size);
        let col = index % grid_size;

        let box_start_row = row - row % 3;
        let box_start_col = col - col % 3;

        for (let i = 0; i < box_size; i++) {
            for (let j = 0; j < box_size; j++) {
                let tmpIndex = 9 * (box_start_row + i) + (box_start_col + j);
                if (index !== tmpIndex) {
                    indexSet.add(tmpIndex);
                }
            }
        }

        let step = 9;
        while (index - step >= 0) {
            indexSet.add(index - step);
            step += 9;
        }

        step = 9;
        while (index + step < 81) {
            indexSet.add(index + step);
            step += 9;
        }

        step = 1;
        while (index - step >= 9 * row) {
            indexSet.add(index - step);
            step += 1;
        }

        step = 1;
        while (index + step < 9 * row + 9) {
            indexSet.add(index + step);
            step += 1;
        }
        indexSet.forEach(i => {
            tmpInfluencers.push(this.sudoCells[i]);
        })
        return tmpInfluencers;
    }

    isMatrixWithNecessary() {
        for (let i = 0; i < 81; i++) {
            if (this.sudoCells[i].getNecessarys().size == 1) {
                return true;
            }
        }
        return false;
    }

    isMatrixWithSingleOrNecessary() {
        for (let i = 0; i < 81; i++) {
            if (this.sudoCells[i].getNecessarys().size == 1
                || this.sudoCells[i].getCandidates().size == 1) {
                return true;
            }
        }
        return false;
    }

    isMatrixWithHiddenSingleOrSingleOrNecessary() {
        for (let i = 0; i < 81; i++) {
            if (this.sudoCells[i].getNecessarys().size == 1
                || this.sudoCells[i].getTotalCandidates().size == 1) {
                return true;
            }
        }
        return false;
    }

}
class SudokuCellView extends MVC_View {
    constructor(cell) {
        super(cell);
        this.myCell = cell;
    }

    upDate() {
        let tmpCellNode = document.createElement("div");
        tmpCellNode.setAttribute("class", "sudoku-grid-cell");
        this.setMyNode(tmpCellNode);
        // Neue Zelle in ihren Block einhängen
        let myCell = this.getMyModel();
        let myBlock = myCell.myBlock;
        let myBlockView = myBlock.getMyView();
        let myBlockNode = myBlockView.getMyNode();

        myBlockNode.appendChild(tmpCellNode);
        tmpCellNode.addEventListener('click', () => {
            sudoApp.mySolverController.sudokuCellPressed(myCell.getMyIndex());
        });
        this.upDateCellContent();
    }

    upDateCellContent() {
        let cell = this.getMyModel();
        if (cell.myValue == '0') {
            // The cell is not yet set
            if (cell.candidatesEvaluated) {
                this.displayCandidates();
                this.displayNecessary(cell.myNecessarys);
                this.displayInAdmissibleCandidates(cell.inAdmissibleCandidates, cell.myNecessarys);
            } else {
                // Display empty cell
                this.myNode.classList.add('nested');
            }
        } else {
            // The cell is assigned a number
            this.displayGamePhase(cell.myGamePhase);
            this.displayMainValueNode(cell.myValue);
        }
    }

    upDateNumber() {
        let tmpCellNode = document.createElement("div");
        tmpCellNode.setAttribute("class", "sudoku-grid-cell");
        this.setMyNode(tmpCellNode);
        // Neue Zelle in ihren Block einhängen
        let myCell = this.getMyModel();
        let myBlock = myCell.myBlock;
        let myBlockView = myBlock.getMyView();
        let myBlockNode = myBlockView.getMyNode();

        myBlockNode.appendChild(tmpCellNode);
        tmpCellNode.addEventListener('click', () => {
            sudoApp.mySolverController.sudokuCellPressed(myCell.getMyIndex());
        });

        if (myCell.myValue == '0') {
            // Leere Zelle anzeigen
            this.myNode.classList.add('nested');
        } else {
            // Die Zelle ist mit einer Nummer belegt
            // Setze die Klassifizierung in der DOM-Zelle
            this.displayGamePhase(myCell.myGamePhase);
            this.displayMainValueNode(myCell.myValue);
        }
    }

    upDateNecessary() {
        // Gebe notwendige Nummer aus oder leere Zelle
        let myCell = this.getMyModel();
        if (myCell.myNecessarys.size > 1 ||
            (myCell.myNecessarys.size == 1
                && myCell.isSelected
                && sudoApp.mySolver.mySearch.myStepper.indexSelected > -1)) {

            myCell.myNecessarys.forEach(necessaryNr => {
                let candidateNode = document.createElement('div');
                candidateNode.setAttribute('data-value', necessaryNr);
                candidateNode.innerHTML = necessaryNr;
                if (sudoApp.mySolver.getActualEvalType() == 'lazy-invisible') {
                    candidateNode.classList.add('neccessary-big');
                } else {
                    candidateNode.classList.add('neccessary');
                }
                this.getMyNode().appendChild(candidateNode);
            })
            return true;
        } else {
            // Leere Zelle anzeigen
            return false;
        }
    }

    upDateSingle() {
        let myCell = this.getMyModel();

        // Gebe Single Nummer aus oder leere Zelle
        let tmpCandidates = myCell.getCandidates();
        if (tmpCandidates.size == 1
            && myCell.isSelected
            && sudoApp.mySolver.mySearch.myStepper.indexSelected > -1) {
            let candidate = Array.from(tmpCandidates)[0]
            let candidateNode = document.createElement('div');
            candidateNode.setAttribute('data-value', candidate);
            candidateNode.innerHTML = candidate;
            this.getMyNode().appendChild(candidateNode);
            return true;
        } else {
            return false;
        }
    }

    upDateHiddenSingle() {
        let myCell = this.getMyModel();

        // Gebe Single Nummer aus oder leere Zelle
        this.getMyNode().classList.add('nested');
        let tmpCandidates = myCell.getTotalCandidates();
        if (tmpCandidates.size == 1
            && myCell.isSelected
            && sudoApp.mySolver.mySearch.myStepper.indexSelected > -1) {

            let candidate = Array.from(tmpCandidates)[0]
            let candidateNode = document.createElement('div');
            candidateNode.setAttribute('data-value', candidate);
            candidateNode.innerHTML = candidate;
            this.getMyNode().appendChild(candidateNode);

            let redAdmissibles = myCell.getCandidates().difference(tmpCandidates);
            redAdmissibles.forEach(redAdmissible => {
                let candidateNode = document.createElement('div');
                candidateNode.setAttribute('data-value', redAdmissible);
                candidateNode.innerHTML = redAdmissible;
                candidateNode.classList.add('inAdmissible');
                this.getMyNode().appendChild(candidateNode);
            });
            //To understand the hidden single of this cell, 
            //we switch to lazy mode for this step.
            sudoApp.mySolver.setStepLazy();
            return true;
        } else {
            return false;
        }
    }

    upDateMultipleOptions() {
        let myCell = this.getMyModel();
        // Eine selektierte Zelle mit Optionen
        this.getMyNode().classList.add('nested');
        // Die Optionen sind zulässige Kandidaten
        let tmpCandidates = myCell.getTotalCandidates();
        // Es gibt mindestens 2 Kandidaten, sprich Optionen
        if (tmpCandidates.size > 1
            && myCell.isSelected
            && sudoApp.mySolver.mySearch.myStepper.indexSelected > -1) {
            this.displayCandidatesInDetail(tmpCandidates);
            return true;
        } else {
            return false;
        }
    }

    displayCandidates() {
        let cell = this.getMyModel();
        let inAdmissiblesVisible = (sudoApp.mySolver.getActualEvalType() == 'lazy' || sudoApp.mySolver.getActualEvalType() == 'strict-plus');
        if (inAdmissiblesVisible) {
            this.displayCandidatesInDetail(cell.getCandidates());
        } else {
            // Angezeigte inAdmissibles sind zunächst einmal Zulässige
            // und dürfen jetzt nicht mehr angezeigt werden
            this.displayCandidatesInDetail(cell.getTotalCandidates());
        }
    }

    displayCandidatesInDetail(admissibles) {
        this.myNode.classList.add('nested');
        // Übertrage die berechneten Möglchen in das DOM
        admissibles.forEach(e => {
            let candidateNode = document.createElement('div');
            candidateNode.setAttribute('data-value', e);
            candidateNode.innerHTML = e;
            this.getMyNode().appendChild(candidateNode);
        });
    }


    displayCandidatesInDetailV2(tmpCandidates, allOptions, openOptions) {
        this.myNode.classList.add('nested');
        // Übertrage die berechneten Möglchen in das DOM
        tmpCandidates.forEach(nr => {
            let candidateNode = document.createElement('div');
            candidateNode.setAttribute('data-value', nr);
            candidateNode.innerHTML = nr;
            if (allOptions.has(nr)
                && !openOptions.has(nr)) {
                candidateNode.style = "text-decoration: underline";
            }
            this.getMyNode().appendChild(candidateNode);
        });
    }

    displayNecessary(myNecessarys) {
        let candidateNodes = this.myNode.children;
        for (let i = 0; i < candidateNodes.length; i++) {
            if (myNecessarys.has(candidateNodes[i].getAttribute('data-value'))) {
                candidateNodes[i].classList.add('neccessary');
            }
        }
    }

    displayInAdmissibleCandidates(inAdmissibleCandidates, myNecessarys) {
        let candidateNodes = this.myNode.children;
        for (let i = 0; i < candidateNodes.length; i++) {
            if (inAdmissibleCandidates.has(candidateNodes[i].getAttribute('data-value'))) {
                // In der Menge der unzulässigen Nummern gibt es die Knotennummer
                if (!myNecessarys.has(candidateNodes[i].getAttribute('data-value'))) {
                    // Die Knotennummer wird als unzulässig markiert, aber
                    // nur, wenn die Nummer nicht gleichzeitig notwendig ist.
                    // Diese widersprüchliche Situation wird schon an anderer Stelle
                    // aufgefangen.
                    candidateNodes[i].classList.add('inAdmissible');
                }
            }
        }
    }

    displayGamePhase(gamePhase) {
        if (gamePhase == 'define') {
            this.myNode.classList.add('define');
            this.myNode.classList.remove('play');
        } else {
            this.myNode.classList.add('play');
            this.myNode.classList.remove('define');
        }
    }

    displayMainValueNode(value) {
        this.myNode.setAttribute('data-value', value);
        this.myNode.innerHTML = value;
    }


    displayCellError() {
        this.myNode.classList.add('err');
    }

    displayRowError() {
        this.myNode.classList.add('row-err');
    }

    displayColError() {
        this.myNode.classList.add('col-err');
    }

    setSelected() {
        this.myNode.classList.add('selected');
    }

    unsetSelected() {
        this.myNode.classList.remove('selected');
    }

    setAutoSelected() {
        this.myNode.classList.add('auto-selected');
    }
    unsetAutoSelected() {
        this.myNode.classList.remove('auto-selected');
    }

    setBorderSelected() {
        if (this.myCell.myGrid.mySolver.mySearch.myStepper.indexSelected !==
            this.myCell.myIndex) {
            this.myNode.classList.add('hover');
        }
    }
    setBorderRedSelected() {
        this.myNode.classList.add('hover-red');
    }

    setBorderGreenSelected() {
        this.myNode.classList.add('hover-green');
    }
    setBorderWhiteSelected() {
        this.myNode.classList.add('hover-white');
    }
    setBorderBlackSelected() {
        this.myNode.classList.add('hover-black');
    }


    unsetBorderSelected() {
        this.myNode.classList.remove('hover');
        this.myNode.classList.remove('hover-red');
        this.myNode.classList.remove('hover-green');
        this.myNode.classList.remove('hover-white');
        this.myNode.classList.remove('hover-black');
    }

    setAutoSelectStatus() {
        // Die Zelle als automatisch selektiert markieren
        this.setAutoSelected();
        let currentStep = sudoApp.mySolver.mySearch.myStepper.myBackTracker.currentStep;
        let tmpStep = undefined;
        let allOptions = undefined;
        let openOptions = undefined;

        if (currentStep instanceof BackTrackOptionStep) {
            tmpStep = currentStep;
        } else {
            tmpStep = currentStep.previousStep();
        }
        allOptions = new MatheSet(tmpStep.myOptionList)
        openOptions = new MatheSet(tmpStep.myNextOptions);

        let cell = this.getMyModel();
        if (cell.myValue == '0' && this.myNode.children.length == 0) {
            // Die Zelle ist noch nicht gesetzt
            this.displayCandidates();
            this.displayNecessary(cell.myNecessarys);
            this.displayInAdmissibleCandidates(cell.inAdmissibleCandidates, cell.myNecessarys);
        }

        for (let candidate of this.myNode.children) {
            if (allOptions.has(candidate.getAttribute('data-value'))
                && !openOptions.has(candidate.getAttribute('data-value'))
                && currentStep.myCellValue !== candidate.getAttribute('data-value')) {
                candidate.style = "text-decoration: underline";
            }
        }
    }

    unsetAutoSelectStatus() {
        this.unsetAutoSelected();
        if (sudoApp.mySolver.getActualEvalType() == 'lazy-invisible') {
            while (this.myNode.firstChild) {
                this.myNode.removeChild(this.myNode.lastChild);
            }
        } else {
            for (let candidate of this.myNode.children) {
                candidate.style = "text-decoration: ";
            }
        }
    }

    displayTasks() {
        let tmpCell = this.getMyModel();

        if (tmpCell.myNecessarys.size > 0) {
            let collection = tmpCell.myNecessaryGroups.get(Array.from(tmpCell.myNecessarys)[0]);
            collection.myCells.forEach(e => {
                if (e !== tmpCell) {
                    if (e.getValue() == '0') {
                        e.myView.setBorderGreenSelected();
                        e.myInfluencers.forEach(cell => {
                            if (cell.getValue() == Array.from(tmpCell.myNecessarys)[0]) {
                                cell.myView.setBorderWhiteSelected();
                            }
                        });
                    }
                }
            });
            sudoApp.mySolver.myView.displayTechnique('Notwendige ' + Array.from(tmpCell.myNecessarys)[0] +
                ' in dieser Gruppe setzen.');
            return;
        }
        if (tmpCell.getCandidates().size == 1) {
            sudoApp.mySolver.myView.displayTechnique('Single ' + Array.from(tmpCell.getCandidates())[0] + ' in dieser Zelle setzen.');

            if (tmpCell.getCandidates().size == 1) {
                let single = Array.from(tmpCell.getCandidates())[0];
                let numberSet = new MatheSet(['1', '2', '3', '4', '5', '6', '7', '8', '9']);
                numberSet.forEach(nr => {
                    if (nr !== single) {
                        let coveredNrs = new MatheSet();
                        tmpCell.myInfluencers.forEach(cell => {
                            if (cell.getValue() == nr) {
                                if (!coveredNrs.has(nr)) {
                                    cell.myView.setBorderWhiteSelected();
                                    coveredNrs.add(nr);
                                }
                            }
                        })
                    }
                })
            }
            if (sudoApp.mySolver.getAutoDirection() == 'forward') {
                sudoApp.breakpointPassed('single');
            }
            return;
        }
        if (tmpCell.getTotalCandidates().size == 1) {
            sudoApp.mySolver.myView.displayTechnique('Hidden Single ' + Array.from(tmpCell.getTotalCandidates())[0] + ' in dieser Zelle setzen.');
            if (sudoApp.mySolver.getAutoDirection() == 'forward') {
                sudoApp.breakpointPassed('hiddenSingle');
            }
            return;
        }
        if (tmpCell.getTotalCandidates().size > 1) {
            sudoApp.mySolver.myView.displayTechnique('Aus mehreren Kandidaten eine Nummer setzen.');
            if (sudoApp.mySolver.getAutoDirection() == 'forward') {
                sudoApp.breakpointPassed('multipleOption');
            }
        }
        return;
    }

    displayReasons() {
        let tmpCell = this.getMyModel();
        let adMissibleNrSelected = tmpCell.getAdMissibleNrSelected();

        if (tmpCell.myNecessarys.size > 0) {
            if (adMissibleNrSelected == Array.from(tmpCell.myNecessarys)[0]) {
                let collection = tmpCell.myNecessaryGroups.get(Array.from(tmpCell.myNecessarys)[0]);
                collection.myCells.forEach(e => {
                    if (e !== tmpCell) {
                        if (e.getValue() == '0') {
                            e.myView.setBorderGreenSelected()
                            e.myInfluencers.forEach(cell => {
                                if (cell.getValue() == Array.from(tmpCell.myNecessarys)[0]) {
                                    cell.myView.setBorderWhiteSelected();
                                }
                            });
                        }
                    }
                });
                sudoApp.mySolver.myView.displayTechnique('Notwendige ' + Array.from(tmpCell.myNecessarys)[0] +
                    ' in dieser Gruppe setzen.');
                return;
            }
        }

        if (tmpCell.inAdmissibleCandidates.size > 0 &&
            tmpCell.inAdmissibleCandidatesFromNecessarys.size > 0) {
            if (tmpCell.inAdmissibleCandidatesFromNecessarys.has(adMissibleNrSelected)) {
                // Wenn die selektierte Zelle eine rote Nummer enthält, die durch eine notwendige
                // Nummer verursacht ist, wird dies angezeigt.
                let necessaryCell = undefined;
                // Bestimme die Zelle der notwendigen Nummer
                tmpCell.myInfluencers.forEach(cell => {
                    if (cell.getNecessarys().has(adMissibleNrSelected)) {
                        necessaryCell = cell;
                    }
                })
                // Bestimme die gemeinsame Gruppe der Zelle mit der roten Nummer
                // und der Zelle mit der notwendigen Nummer
                let tmpGroup = undefined;
                if (tmpCell.myBlock == necessaryCell.myBlock) {
                    tmpGroup = tmpCell.myBlock;
                } else if (tmpCell.myRow == necessaryCell.myRow) {
                    tmpGroup = tmpCell.myRow;
                } else if (tmpCell.myCol == necessaryCell.myCol) {
                    tmpGroup = tmpCell.myCol;
                }
                // Gebe die Gruppe aus
                tmpGroup.myCells.forEach(cell => {
                    cell.myView.setBorderSelected();
                    if (cell.getNecessarys().has(adMissibleNrSelected)) {
                        cell.myView.setBorderRedSelected();
                    }
                })
                sudoApp.mySolver.myView.displayTechnique(adMissibleNrSelected
                    + ' unzulässig wegen notwendiger Nummer: '
                    + adMissibleNrSelected);
                return;
            }
        }
        if (tmpCell.inAdmissibleCandidates.size > 0 &&
            tmpCell.inAdmissibleCandidatesFromPairs.size > 0) {
            if (tmpCell.inAdmissibleCandidatesFromPairs.has(adMissibleNrSelected)) {
                // Wenn für die selektierte Zelle kritische Paare gespeichert sind,
                // dann gibt es in der Zelle indirekt unzulässige Nummern, die durch sie
                // verursacht werden.
                // Die Block, Spalte oder Zeile des Paares wird markiert.
                let pairArray = [];
                let pairInfo = tmpCell.inAdmissibleCandidatesFromPairs.get(adMissibleNrSelected);
                pairInfo.collection.myCells.forEach(cell => {
                    if (cell !== tmpCell) {
                        cell.myView.setBorderSelected();
                    }
                });
                pairInfo.pairCell1.myView.setBorderRedSelected();
                pairInfo.pairCell2.myView.setBorderRedSelected();
                pairArray = Array.from(pairInfo.pairCell1.getTotalCandidates());
                sudoApp.mySolver.myView.displayTechnique(
                    adMissibleNrSelected
                    + ' unzulässig wegen "Nacktem Paar" {'
                    + pairArray[0]
                    + ', '
                    + pairArray[1] + '}');
                return;
            }
        }

        if (tmpCell.inAdmissibleCandidates.size > 0 &&
            tmpCell.inAdmissibleCandidatesFromIntersection.size > 0) {

            let info = tmpCell.inAdmissibleCandidatesFromIntersectionInfo.get(adMissibleNrSelected);
            info.block.myCells.forEach(cell => {
                cell.myView.setBorderSelected();
            });
            info.rowCol.myCells.forEach(cell => {
                cell.myView.setBorderSelected();
            });

            sudoApp.mySolver.myView.displayTechnique(adMissibleNrSelected + ' unzulässig wegen Überschneidung');
            return;
        }

        if (tmpCell.inAdmissibleCandidates.size > 0 &&
            tmpCell.inAdmissibleCandidatesFromPointingPairs.size > 0) {

            let info = tmpCell.inAdmissibleCandidatesFromPointingPairsInfo.get(adMissibleNrSelected);
            info.rowCol.myCells.forEach(cell => {
                cell.myView.setBorderSelected();
            });
            info.pVector.myCells.forEach(cell => {
                if (cell.getValue() == '0' && cell.getTotalCandidates().has(adMissibleNrSelected)) {
                    cell.myView.unsetSelected();
                    cell.myView.setBorderRedSelected();
                }
            })
            sudoApp.mySolver.myView.displayTechnique(adMissibleNrSelected
                + ' unzulässig wegen Pointing Pair');
            return;
        }

        if (tmpCell.inAdmissibleCandidates.size > 0 &&
            tmpCell.inAdmissibleCandidatesFromHiddenPairs.size > 0) {
            if (tmpCell.inAdmissibleCandidatesFromHiddenPairs.has(adMissibleNrSelected)) {
                // Für ein Subpaar muss nicht jede einzelne Nummer geprüft werden.
                // 
                let pairArray = [];
                const [pairInfo] = tmpCell.inAdmissibleCandidatesFromHiddenPairs.values();
                pairInfo.collection.myCells.forEach(cell => {
                    if (cell == pairInfo.subPairCell1 || cell == pairInfo.subPairCell2) {
                        cell.myView.setBorderRedSelected();
                        if (pairArray.length == 0) {
                            pairArray = Array.from(cell.getTotalCandidates());
                        }
                    } else {
                        cell.myView.setBorderSelected();
                    }
                });
                sudoApp.mySolver.myView.displayTechnique(
                    adMissibleNrSelected
                    + ' unzulässig wegen "Verstecktem Paar" {'
                    + pairArray[0]
                    + ', '
                    + pairArray[1] + '}');
                return;
            }
        }
    };

    setSelectStatus() {
        let tmpCell = this.getMyModel();
        this.setSelected();
        if (sudoApp.mySolver.isSearching()
            && sudoApp.mySolver.getAutoDirection() == 'forward') {
            if (tmpCell.candidateIndexSelected == -1) {
                // Nach dem ersten Click auf die Zelle ist noch 
                // kein Kandidat in der Zelle selektiert.
                // Der Anwender bekommt einen Hinweis, was er jetzt tun soll.
                this.displayTasks();
            } else {
                // Durch erneutes Clicken auf die bereits selektierte Zelle
                // selektiert der Solver der Reihe nach unzulässige Kandidaten
                // in der Zelle. Für jeden unzulässigen Kandidaten zeigt die
                // Anwendung den Grund der Unzulässigkeit an.
                this.displayReasons();
            }
        }
    }

    unsetSelectStatus() {
        this.unsetSelected();
        this.unsetBorderSelected();
        sudoApp.mySolver.myView.displayTechnique('');
    }

    unsetAutoSelectStatus() {
        this.unsetAutoSelected();
    }

    displayWrongNumber() {
        let cell = this.getMyModel();
        if (cell.isWrong()) {
            this.myNode.classList.add('wrong');
        }
    }
    displayUnsolvability() {
        let cell = this.getMyModel();
        let mySolverView = sudoApp.mySolver.getMyView();
        // 1) The basic contradiction of the Sudoku is defined below. With this alone, the solver
        // would successfully solve the puzzles by backtracking. However, many more cells
        // would have to be set before an existing contradiction with this criterion would be uncovered.
        // All other criteria merely serve to uncover contradictions earlier.
        if (cell.getValue() !== '0' && cell.myDirectInAdmissibles().has(cell.getValue())) {
            cell.myInfluencers.forEach(influencerCell => {
                if (influencerCell.getValue() == cell.getValue()) {
                    influencerCell.myView.displayCellError();
                }
            })
            this.displayCellError();
            mySolverView.displayReasonUnsolvability('Die Nummer ' + cell.getValue() + ' ist bereits einmal gesetzt.');
            return true;
        }
        // 2) The unsolvability is already recognized if there is no longer any admissible candidate at all. 
        // any more.
        if (sudoApp.mySolver.getActualEvalType() == 'lazy-invisible' || sudoApp.mySolver.getActualEvalType() == 'lazy') {
            // if (cell.getValue() == '0' && cell.getTotalCandidates().size == 0) { 
            if (cell.getValue() == '0' && cell.getCandidates().size == 0) {
                this.displayCellError();
                mySolverView.displayReasonUnsolvability('Überhaupt keine zulässige Nummer.');
                return true;
            }
        } else if (sudoApp.mySolver.getActualEvalType() == 'strict-plus' || sudoApp.mySolver.getActualEvalType() == 'strict-minus') {
            if (cell.getValue() == '0' && cell.getTotalCandidates().size == 0) {
                this.displayCellError();
                mySolverView.displayReasonUnsolvability('Überhaupt keine zulässige Nummer.');
                return true;
            }
        }
        // 3) The inconsistency is also already established if two different required numbers are to be set in a cell at the same time.
        if (cell.getValue() == '0' && cell.myNecessarys.size > 1) {
            this.displayCellError();
            mySolverView.displayReasonUnsolvability('Gleichzeitig verschiedene notwendige Nummern.');
            return true;
        }

        mySolverView.displayReasonUnsolvability('');
        return false;
    }
}
class SudokuCell extends MVC_Model {
    constructor(grid, index) {
        super();
        // Die Zelle kennt ihre Tabelle und ihren Index
        this.myGrid = grid;
        this.myIndex = index;
        // Die Zelle kennt ihre DOM-Version
        // Mit der Erzeugung des Wrappers wird
        // auch der Eventhandler der Zelle gesetzt
        // Speichert die Phase, die beim Setzen einer Nummer
        // in der Zelle aktuell war.
        this.myBlock;
        this.myRow;
        this.myCol;
        // Speichert ein für alle mal bei der Initialisierung
        // die beeinflussenden Zellen dieser Zelle
        this.myInfluencers = [];
        // Die gesetzte Nummer dieser Zelle. 
        // Die Nummer '0' bedeutet ungesetzte Nummer.
        this.myValue = '0';
        // 'define' or 'play'
        this.myGamePhase = '';
        // cell with wrong number 
        this.wrong = false;
        // The actual candidates of this cell
        this.myOptions = [];
        this.myAutoStepNumber = -1;

        this.isSelected = false;
        this.candidateIndexSelected = -1;
        // 'manual' oder 'auto'
        this.myValueType = 'manual';

        // Speichert die aktuell unzulässigen Zahlen für diese Zelle
        this.inAdmissibles = new MatheSet();
        this.inAdmissibleCandidates = new MatheSet();

        this.inAdmissibleCandidatesFromPairs = new Map();
        this.inAdmissibleCandidatesFromHiddenPairs = new Map();
        this.inAdmissibleCandidatesFromIntersection = new MatheSet();
        this.inAdmissibleCandidatesFromIntersectionInfo = new Map();

        this.inAdmissibleCandidatesFromPointingPairs = new MatheSet();
        this.inAdmissibleCandidatesFromPointingPairsInfo = new Map();

        this.inAdmissibleCandidatesFromNecessarys = new MatheSet();
        this.inAdmissibleCandidatesFromSingles = new MatheSet();

        // Außer bei widerspruchsvollen Sudokus einelementig
        this.myNecessarys = new MatheSet();
        this.myNecessaryGroups = new Map();
    }

    // ===================================================================
    // Getter
    // ===================================================================
    isWrong() {
        return this.wrong;
    }
    setWrong() {
        this.wrong = true;
    }
    unsetWrong() {
        this.wrong = false;
    }

    getMyIndex() {
        return this.myIndex;
    }
    getIsSelected() {
        return this.isSelected;
    }
    getAdMissibleNrSelected() {
        let candidateIArray = Array.from(this.getCandidates());
        return candidateIArray[this.candidateIndexSelected];
    }

    setAdMissibleIndexSelected(nr) {
        this.candidateIndexSelected = nr;
    }


    getTotalInAdmissibles() {
        // Remember: inAdmissibles are the non-candidates of a cell.
        // The set of totalInAdmissibles is the union of inAdmissibles and the inAdmissibleCandidates.
        let totalInAdmissibles = this.inAdmissibles.union(this.inAdmissibleCandidates);
        // In contradictory Puzzles, necessary numbers can be inadmissible at the same time.
        // For pragmatic reasons, we do not include such numbers in inAdmissibles.
        // Then they are also displayed if the display of inAdmissibles is switched off.
        // Semantically, this is not a problem, as it is well known that anything can be inferred in contradictory sets. 
        return totalInAdmissibles.difference(this.getNecessarys());
    }

    getCandidates() {
        // Candidates are the numbers that are not (directly) inadmissible.
        return new MatheSet(['1', '2', '3', '4', '5', '6', '7', '8', '9']).difference(
            this.inAdmissibles);
    }

    getTotalCandidates() {
        // Total candidates are the numbers that are not inadmissible, not even indirectly.
        if (this.getValue() == '0') {
            return new MatheSet(['1', '2', '3', '4', '5', '6', '7', '8', '9']).difference(
                this.getTotalInAdmissibles());
        } else {
            return new MatheSet();
        }
    }

    getNecessarys() {
        return new MatheSet(this.myNecessarys);
    }

    getTotalSingles() {
        let singles = this.getTotalCandidates();
        if (singles.size == 1) {
            return singles;
        } else {
            return new MatheSet();
        }
    }
    getSingles() {
        let singles = this.getCandidates();
        if (singles.size == 1) {
            return singles;
        } else {
            return new MatheSet();
        }
    }

    getPhase() {
        return this.myGamePhase;
    }

    getValue() {
        return this.myValue;
    }

    getIndex() {
        return this.myIndex;
    }

    // ===================================================================
    // Setter
    // ===================================================================
    setInfluencers(influencers) {
        this.myInfluencers = influencers;
    }
    setBlock(block) {
        this.myBlock = block;
    }
    setRow(row) {
        this.myRow = row;
    }
    setCol(col) {
        this.myCol = col;
    }

    setSelected() {
        this.isSelected = true;
        this.candidateIndexSelected = -1;
    }

    unsetSelected() {
        this.isSelected = false;
    }

    manualSetValue(nr, gamePhase) {
        this.myValue = nr;
        this.myValueType = 'manual';
        this.myGamePhase = gamePhase;
        this.myAutoStepNumber = this.myGrid.numberOfNonEmptyCells() - this.myGrid.numberOfGivens();
    }

    autoSetValue(currentStep) {
        let nr = currentStep.getValue();
        this.myValue = nr;
        this.myValueType = 'auto';
        this.myGamePhase = 'play';
        this.myAutoStepNumber = this.myGrid.numberOfNonEmptyCells() - this.myGrid.numberOfGivens();
        this.myOptions = currentStep.options();
    }

    setPhase(phase) {
        this.myGamePhase = phase;
    }
    nextCandidateIndex() {

        let maxIndex = this.getCandidates().size;
        let candidateIArray = Array.from(this.getCandidates());
        let necessaryNr = -1;
        let necessaryIndex = -1;

        if (this.myNecessarys.size > 0) {
            necessaryNr = Array.from(this.myNecessarys)[0];
            necessaryIndex = candidateIArray.indexOf(necessaryNr);
            this.candidateIndexSelected = necessaryIndex;
            return necessaryIndex;
        }

        let nextIndex = this.candidateIndexSelected + 1;
        let nextCandidate = '-1';
        let found = false;

        while (nextIndex < maxIndex && !found) {
            nextCandidate = candidateIArray[nextIndex];
            //Subindex is display relevant if the candidate is red.
            if (this.isInAdmissibleCandidate(nextCandidate)) {
                found = true;
            } else {
                nextIndex++;
            }
        }

        if (found) {
            this.candidateIndexSelected = nextIndex;
            return nextIndex;
        } else {
            // Für einen erneuten Durchlauf zurücksetzen
            this.candidateIndexSelected = -1;
            return -1;
        }
    }

    isInAdmissibleCandidate(candidate) {
        let relevant = this.inAdmissibleCandidates.has(candidate);
        return relevant;
    }

    // ===================================================================
    // Methods
    // ===================================================================
    clear() {
        // Lösche Inhalt der Zelle
        this.myValue = '0';
        this.myValueType = 'manual';
        this.myGamePhase = '';
        this.wrong = false;
        this.clearEvaluations();
    }

    clearEvaluations() {
        // 
        this.candidatesEvaluated = false;
        // Speichert die aktuell unzulässigen Zahlen für diese Zelle
        this.inAdmissibles = new MatheSet();
        this.inAdmissibleCandidates = new MatheSet();

        this.inAdmissibleCandidatesFromPairs = new Map();
        this.inAdmissibleCandidatesFromHiddenPairs = new Map();
        this.inAdmissibleCandidatesFromIntersection = new MatheSet();
        this.inAdmissibleCandidatesFromIntersectionInfo = new Map();
        this.inAdmissibleCandidatesFromPointingPairs = new MatheSet();
        this.inAdmissibleCandidatesFromPointingPairsInfo = new Map();

        this.inAdmissibleCandidatesFromNecessarys = new MatheSet();
        this.inAdmissibleCandidatesFromSingles = new MatheSet();

        // Außer bei widerspruchsvollen Sudokus einelementig
        this.myNecessarys = new MatheSet();
        this.myNecessaryGroups = new Map();

        // Außer bei widerspruchsvollen Sudokus einelementig
    }

    calculateInAdmissibles() {
        // Level 0 unzulässige Nummern sind direkt unzulässige Nummern.
        // Sie werden in der Zelle nicht mehr angezeigt
        this.inAdmissibles = this.myDirectInAdmissibles();
        return this.inAdmissibles;
    }

    myDirectInAdmissibles() {
        // Direkt unzulässige Nummern dieser Zelle sind Nummern,
        // die an anderer Stelle in der Block, Zeile oder Spalte dieser Zelle
        // gesetzt sind.
        let tmpInAdmissibles = new MatheSet();
        this.myInfluencers.forEach(influenceCell => {
            if (influenceCell.getValue() !== '0') {
                // Die Einflusszelle ist gesetzt
                tmpInAdmissibles.add(influenceCell.getValue());
            }
        })
        return tmpInAdmissibles;
    }

    clearAutoExecInfo() {
        this.myValueType = 'manual';
        this.myAutoStepNumber = 0;
        this.myOptions = [];
    }

    countMyCandidates() {
        return this.getCandidates().size;
    }

    countMyOpenInfluencers() {
        let tmpCount = 0;
        this.myInfluencers.forEach(influencer => {
            if (influencer.getValue() == '0') {
                tmpCount++;
            }
        });
        return tmpCount;
    }

    countMyInfluencersWeight() {
        // Idee: Kontexte mit einem größeren Endscheidungsgrad zählen mehr,
        // weil durch sie die Entscheidungen schneller vorangetrieben werden.
        let tmpWeight = 0;
        let summand = 0;
        let tmpCandidates = this.getTotalCandidates();
        if (tmpCandidates.size == 2) {
            tmpWeight = 300;
        }
        // Den Kontext der Zelle betrachten
        this.myInfluencers.forEach(influencer => {
            if (influencer.getValue() == '0') {
                // Paare, die vollständig in Influenz-Zellen enthalten sind
                // werden bevorzugt
                let influenceCandidates = influencer.getTotalCandidates();
                summand = 0;
                if (tmpCandidates.size == 2) {
                    if (influenceCandidates.equals(tmpCandidates)) {
                        // Mehrfachauftreten von Paaren bekommt die höchste Bewertung
                        summand = 300;
                    } else {
                        let interSecSize = influenceCandidates.intersection(tmpCandidates).size;
                        if (interSecSize > 0) {
                            // Das aktuelle Paar mit Schnitt in den Influenz-Zellen
                            summand = 27 + interSecSize;
                        }
                    }
                } else {
                    let interSecSize = influenceCandidates.intersection(tmpCandidates).size;
                    // Die aktuelle Zelle mit Schnitt in den Influenz-Zellen
                    if (interSecSize > 0) {
                        summand = Math.floor(9 / interSecSize) + interSecSize;
                    } else {
                        summand = 1;
                    }
                }
                tmpWeight = tmpWeight + summand;
            }
        });
        return tmpWeight;
    }

    countMyInfluencersAdmissibles() {
        let tmpCount = 0;
        this.myInfluencers.forEach(influencer => {
            if (influencer.getValue() == '0') {
                tmpCount = tmpCount + influencer.countMyCandidates();
            }
        });
        return tmpCount;
    }


    addNecessary(nr, nineCellCollection) {
        this.myNecessarys.add(nr);
        this.myNecessaryGroups.set(nr, nineCellCollection);
    }

    isUnsolvable() {
        // If this function returns ‘true’, then the cell is unsolvable in the puzzle context. 
        // If it returns ‘false’, this does not mean that it is solvable. 
        // Non-unsolvability does not imply solvability.
        if (this.myGrid.mySolver.currentEvalType == 'lazy-invisible' || this.myGrid.mySolver.currentEvalType == 'lazy')
            return (
                // 1) The number has already been set once.
                (this.getValue() !== '0' && this.myDirectInAdmissibles().has(this.getValue())) ||
                // 2) No more admissible candidates at all
                (this.getValue() == '0' && this.getCandidates().size == 0) ||
                // 3) Different numbers required at the same time
                (this.getValue() == '0' && this.myNecessarys.size > 1));

        else if (this.myGrid.mySolver.currentEvalType == 'strict-plus' || this.myGrid.mySolver.currentEvalType == 'strict-minus')
            return (
                // 1) The number has already been set once.
                (this.getValue() !== '0' && this.myDirectInAdmissibles().has(this.getValue())) ||
                // 2) No more totally admissible candidates at all. Please note: 
                //    A totally admissible candidate is also an admissible candidate, 
                //    but not vice versa: an admissible candidate can be totally inadmissible.
                (this.getValue() == '0' && this.getTotalCandidates().size == 0) ||
                // 3) Different numbers required at the same time
                (this.getValue() == '0' && this.myNecessarys.size > 1));
    }
}

// ==========================================
// Solver types 
// ==========================================
class SudokuSolver extends MVC_Model {
    constructor(app) {
        super(app);
        // Die Matrix des Sudoku-Solver
        // Die Matrix des Sudoku-Calculators
        this.myGrid = new SudokuGrid(this);
        // this.myGridView = new SudokuGridView(this.myGrid);
        this.myGrid.setMyView(this.myGridView);
        // The solver has a puzzle record right from the start.
        this.myPuzzle = undefined;
        // this.mySearcher = undefined;
        this.mySearch = undefined;
        // the solver has two phases, 'play' or 'define'.
        this.currentPhase = 'define';
        // The solver knows the following evaluation methods
        // 'lazy', 'lazy-invisible', 'strict-plus', 'strict-minus' 
        this.currentEvalType = 'lazy-invisible';
        // There are two play-modes 'manual-solving' and 'automated-solving'.
        this.playType = 'automated-solving';
        // the user has asked the app to check his current manual solution
        // the solution is currently being checked
        this.isCurrentlyBChecked = false;
    }

    newPuzzle() {
        this.myPuzzle = new Puzzle(PuzzleRecord.nullPuzzleRecord());
        this.setGamePhase('define');
    }

    init() {
        this.myGrid.init();
        this.newPuzzle();
        this.isCurrentlyBChecked = false;
    }

    async setNewPuzzleRecord() {
        let puzzleRecord = PuzzleRecord.nullPuzzleRecord();
        puzzleRecord.id = Date.now().toString(36) + Math.random().toString(36).substr(2);
        puzzleRecord.date = (new Date()).toJSON();
        // Once and for all compute the preRunRecord
        puzzleRecord.puzzle = this.myGrid.getPuzzleArray();
        puzzleRecord.statusGiven = this.myGrid.numberOfGivens();
        let preRun = await this.calculatedPreRunRecord(puzzleRecord.puzzle);
        puzzleRecord.preRunRecord = preRun;
        return puzzleRecord;
    }

    deleteSearch() {
        if (this.mySearch !== undefined) {
            this.mySearch.cleanUp();
            this.mySearch = undefined;
        }
    }
    createSearch() {
        this.mySearch = new Search(this.myPuzzle,
            this,
            this.myGrid);
    }

    performSearchStep() {
        this.mySearch.performStep();
        if (sudoApp instanceof SudokuMainApp) {
            this.notify();
        }
    }

    performSolutionStep() {
        sudoApp.mySynchronousSearchStepLoop.start();
    }

    isSearching() {
        return this.mySearch !== undefined;
    }

    setPlayType(pt) {
        switch (pt) {
            case 'manual-solving':
            case 'training': {
                this.playType = 'manual-solving';
                break;
            }
            case 'automated-solving':
            case 'automatic-solving':
            case 'solving':
            case 'solving-trace': {
                this.playType = 'automated-solving';
                break;
            }

            default: {
                throw new Error('Unknown playType: ' + pt);
            }
        }
        this.notifyAspect('playType', pt);
    }

    getPlayType() {
        return this.playType;
    }

    isInitial() {
        return this.myPuzzle.isInitial() && this.myGrid.isInitial();
    }

    getAutoDirection() {
        return this.mySearch.myStepper.autoDirection;
    }

    setStepLazy() {
        this.myGrid.setStepLazy();
    }
    unsetStepLazy() {
        this.myGrid.unsetStepLazy();
    }

    indexSelected() {
        return this.myGrid.indexSelected;
    }

    // =================================================
    // Other Methods
    // =================================================
    loadPuzzle(puzzleRecord) {
        this.myPuzzle = new Puzzle(puzzleRecord);
        this.myGrid.loadPuzzle(puzzleRecord);
        this.mySearch = undefined;
        /* this.mySearcher = new PuzzleSolutionSearcher(this.myPuzzle,
            this,
            this.myGrid); */
        this.currentPhase = 'play';
    }


    maxSelectionDifficulty() {
        return this.mySearch.myStepper.maxSelectionDifficulty;
    }
    countBackwards() {
        return this.mySearch.myStepper.countBackwards;
    }

    atCurrentSelectionSetNumber(number) {
        /* if (this.myStepper.indexSelected !== -1 && this.indexSelected() !== this.myStepper.indexSelected) {
            // Eine manuelle Nummernsetzung bei laufender automatischer Ausführung
            // führt zum Abbruch der automatischen Ausführung, weil der Backtrack-Stack
            // inkonsistent wird.
            this.stopBackTrackingSearch();
        } */
        this.myGrid.atCurrentSelectionSetNumber(number, this.currentPhase, false);
    }
    deleteSelected() {
        this.myGrid.deleteSelected(this.currentPhase);
        this.deselect();
    }

    select(index) {
        this.myGrid.select(index);
    }
    deselect() {
        this.myGrid.deselect();
    }

    setActualEvalType(value) {
        this.currentEvalType = value;
        this.myGrid.evaluateMatrix();
        // this.notify();
    }

    setAutoDirection(direction) {
        this.mySearch.myStepper.setAutoDirection(direction);
    }

    // =================================================
    // Getter
    // =================================================

    getMyGrid() {
        return this.myGrid;
    }
    getMyStepper() {
        return this.mySearch.myStepper;
    }

    getGamePhase() {
        return this.currentPhase;
    }

    getActualEvalType() {
        return this.currentEvalType;
    }
    // =================================================
    // Setter
    // =================================================

    setGamePhase(gamePhase) {
        if (this.currentPhase !== gamePhase) {
            this.currentPhase = gamePhase;
        }
    }
    async generateNewPuzzle() {
        let webworkerGenerator = new Worker("./JS/generatorWorker.js");
        let myPzGen = () => new Promise(function (myResolve, myReject) {
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
                name: 'generate',
                value: ''
            }
            let str_request = JSON.stringify(request);
            webworkerGenerator.postMessage(str_request, [channel.port2]);
        });
        let str_response = await myPzGen();
        let response = JSON.parse(str_response);
        let generatedPuzzleRecord = response.value;
        return generatedPuzzleRecord;
    }

    setLoadedPuzzleName(name) {
        this.myPuzzle.myRecord.name = name;
    }
    getLoadedPuzzleUID() {
        return this.myPuzzle.myRecord.id;
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
        return puzzleRecord;
    }

    grid2puzzle() {
        // load current matrix into the record
        this.myPuzzle.myRecord.statusSolved = 0;
        this.myPuzzle.myRecord.puzzle = [];
        for (let i = 0; i < 81; i++) {
            this.myPuzzle.myRecord.puzzle.push({
                cellValue: this.myGrid.sudoCells[i].getValue(),
                cellPhase: this.myGrid.sudoCells[i].getPhase()
            });
            if (this.myGrid.sudoCells[i].getValue() !== '0'
                && this.myGrid.sudoCells[i].getPhase() == 'play') {
                this.myPuzzle.myRecord.statusSolved++;
            }
            this.myPuzzle.myRecord.statusOpen = 81
                - this.myPuzzle.myRecord.statusGiven
                - this.myPuzzle.myRecord.statusSolved;
        };
    }

    async calculatedPreRunRecord(puzzleArray) {
        let webworkerFastSolver = new Worker("./JS/fastSolverWorker.js");
        let myPrRunCalc = () => new Promise(function (myResolve, myReject) {
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
                name: 'preRun',
                value: puzzleArray
            }
            let str_request = JSON.stringify(request);
            webworkerFastSolver.postMessage(str_request, [channel.port2]);
        });
        let str_response = await myPrRunCalc();
        let response = JSON.parse(str_response);
        let calcPreRunRecord = response.value;
        return calcPreRunRecord;
    }


    notifyAspect(aspect, aspectValue) {
        super.notifyAspect(aspect, aspectValue);
    }

    isCurrentlyBeingChecked() {
        return this.isCurrentlyBChecked;
    }

    setPuzzleIOtechnique(pt) {
        this.puzzleIOtechnique = pt;
        this.notifyAspect('puzzleIOTechnique');
    }

    getPuzzleIOtechnique() {
        return this.puzzleIOtechnique;
    }

    clearLoadedPuzzle(key) {
        if (this.myPuzzle.myRecord.id == key) {
            this.myGrid.init();
        }
    }

    async generateNewVerySimplePuzzle() {
        let webworkerGenerator = new Worker("./JS/generatorWorker.js");
        let myPzGen = () => new Promise((myResolve, myReject) => {
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
                name: 'generateVerySimple',
                value: ''
            }
            let str_request = JSON.stringify(request);
            webworkerGenerator.postMessage(str_request, [channel.port2]);
        });
        let str_response = await myPzGen();
        let response = JSON.parse(str_response);
        let generatedPuzzle = response.value;
        return generatedPuzzle;
    }

    tryStartBacktracking() {
        if (!this.isSearching()) {
            if (this.myPuzzle.myRecord.preRunRecord.level == 'Sehr schwer'
                || this.myPuzzle.myRecord.preRunRecord.level == 'Extrem schwer'
                || this.myPuzzle.myRecord.preRunRecord.level == 'Unlösbar') {
                if (this.isInitial()) {
                    // The back-tracker can only guarantee one or more correct solutions 
                    // for very difficult or extremely difficult puzzles if it is started 
                    // on the initial puzzle. 
                    this.mySearch = new Search(this.myPuzzle,
                        this,
                        this.myGrid);
                } else {
                    sudoApp.myConfirmDlg.open(sudoApp.mySolverController,
                        sudoApp.mySolverController.resetConfirmed,
                        "Puzzle zurücksetzen?",
                        "Wenn sehr schwere, extrem schwere oder unlösbare Puzzles beim Start des Solvers bereits partiell gelöst sind, kann der Solver keine korrekten Antworten über mögliche Lösungen garantieren. Empfehlung: Puzzle vor dem Start zurücksetzen. \n\nJetzt zurücksetzen?");
                }
            } else {
                // Fair puzzle partially solved 
                // The back-tracker can be started for fair puzzles, 
                // even if they have already been partially solved.
                // Any partial solution derived with the back-tracker is correct,
                // because fair puzzles have a unique solution, i.e. no backtracking takes place.
                this.myPuzzle.reset();
                this.mySearch = new Search(this.myPuzzle,
                    this,
                    this.myGrid);
            }
        }
    }

    succeeds() {
        // In general, non-unsolvability of a puzzle does not imply the solvability of the puzzle. 
        // However, the implication applies to completely filled puzzles.
        return this.myGrid.isFinished() && !this.myGrid.isUnsolvable();
    }

    reset() {
        this.myPuzzle.reset();
        this.myGrid.reset();
    }
}

class SudokuSolverView extends MVC_View {
    constructor(solver) {
        super(solver);
        this.myGridView = new SudokuGridView(solver.myGrid);
        solver.myGrid.setMyView(this.myGridView);
        this.progressBar = new ProgressBar();
        this.displayTechnique('');
        this.displayReasonUnsolvability('');
    }

    upDate() {
        // Den kompletten Solver neu anzeigen
        this.displayTechnique('');
        this.displayReasonUnsolvability('');

        this.myGridView.upDate();
        this.displayGamePhase();
        this.displayLoadedBenchmark(this.getMyModel().myPuzzle.myRecord.preRunRecord.level,
            this.getMyModel().myPuzzle.myRecord.preRunRecord.backTracks);

        let progressBlock = document.getElementById("progress-block");
        let stepCountBox = document.getElementById("step-count-box");
        let autoModeRadioBtns = document.getElementById("autoMode-radio-btns");
        if (this.getMyModel().isSearching()) {
            let mySearch = this.getMyModel().mySearch;
            // let myStepper = this.getMyModel().mySearch.myStepper;
            progressBlock.style.gridTemplateColumns = "1fr 0.2fr 1fr";
            stepCountBox.style.display = "flex";
            autoModeRadioBtns.style.display = "flex";
            // this.displayGoneSteps(myStepper.getGoneSteps());
            this.displayGoneSteps(mySearch.getNumberOfSteps());
            let tmpLevel = this.getMyModel().myPuzzle.myRecord.preRunRecord.level;
            if (tmpLevel == 'Sehr schwer') {
                this.displayBackwardCount(mySearch.myStepper.countBackwards);
            } else {
                this.displayBackwardCount('none');
            }
            this.displayAutoDirection(mySearch.myStepper.getAutoDirection());
        } else {
            stepCountBox.style.display = "none";
            autoModeRadioBtns.style.display = "none";
            progressBlock.style.gridTemplateColumns = "1fr";
        }
        this.displayProgress();
        this.displayEvalType(this.getMyModel().getActualEvalType());
        this.displayPlayPlayType(this.getMyModel().getPlayType());
        this.displayBreakpoints(sudoApp.myClockedSearchStepLoop.myBreakpoints);
        this.displayUndoRedo();
        this.displayPuzzleIOTechniqueBtns();
        sudoApp.mySolver.myGrid.getMyView().displayNameAndDifficulty();
        this.displaySearchCompleted();
    }

    // ???
    displaySearchCompleted() {
        let puzzle = this.getMyModel().myPuzzle;
        if (puzzle.getSearchIsCompleted()) {
            if (puzzle.getNumberOfSolutions() == 0) {
                this.showPuzzleSolutionInfo('Keine Lösung!');
            } else {
                if (puzzle.getNumberOfSolutions() == 1) {
                    this.showPuzzleSolutionInfo('1 Lösung');
                } else {
                    this.showPuzzleSolutionInfo(puzzle.getNumberOfSolutions() + ' Lösungen');
                }
            }
        } else {
            this.hidePuzzleSolutionInfo();
        }
    }

    upDateAspect(aspect, aspectValue) {
        switch (aspect) {
            case 'puzzleGenerator': {
                switch (aspectValue.op) {
                    case 'started': {
                        this.startLoaderAnimation(aspectValue.rl);
                        break;
                    }
                    case 'finished': {
                        this.stopLoaderAnimation();
                        break;
                    }
                    default: {
                        throw new Error('Unknown aspectValue.op: ' + aspectValue.op);
                    }
                }
                break;
            }
            case 'playType': {
                switch (aspectValue) {
                    case 'manual-solving':
                    case 'training': {
                        this.setTrainingButtons();
                        break;
                    }
                    case 'automatic-solving':
                    case 'automated-solving':
                    case 'solving':
                    case 'solving-trace': {
                        this.setSolvingButtons();
                        break;
                    }
                    default: {
                        throw new Error('Unknown aspectValue playType ' + aspectValue);
                    }
                }
                break;
            }
            case 'puzzleIOTechnique': {
                this.displayPuzzleIOTechniqueBtns();
                break;
            }
            case 'puzzleLoading': {
                // Zoom-in-effect of newly loaded puzzle
                let mainGrid = document.getElementById('main-sudoku-grid');
                mainGrid.classList.add('mainLoading');
                // A remove of this class happens implicitly
                // when the grid as a whole is regenerated
                // without setting this class
                break;
            }
            default: {
                throw new Error('Unknown aspect: ' + aspect);
            }
        }
    }

    setTrainingButtons() {
        let btnReset = document.getElementById('btn-reset')
        let btnRun = document.getElementById('btn-run');
        let btnShowWrongNumbers = document.getElementById('btn-showWrongNumbers');

        btnReset.style.gridColumnStart = 1;
        btnReset.style.gridColumnEnd = 2;
        btnReset.style.gridRowStart = 4;
        btnReset.style.gridRowEnd = 4;

        btnShowWrongNumbers.style.gridColumnStart = 2;
        btnShowWrongNumbers.style.gridColumnEnd = 6;
        btnShowWrongNumbers.style.gridRowStart = 4;
        btnShowWrongNumbers.style.gridRowEnd = 4;

        btnRun.style.display = 'none';


    }

    setSolvingButtons() {
        let btnReset = document.getElementById('btn-reset')
        let btnShowWrongNumbers = document.getElementById('btn-showWrongNumbers');
        let btnRun = document.getElementById('btn-run');

        btnReset.style.gridColumnStart = 1;
        btnReset.style.gridColumnEnd = 2;
        btnReset.style.gridRowStart = 4;
        btnReset.style.gridRowEnd = 4;

        btnShowWrongNumbers.style.gridColumnStart = 2;
        btnShowWrongNumbers.style.gridColumnEnd = 3;
        btnShowWrongNumbers.style.gridRowStart = 4;
        btnShowWrongNumbers.style.gridRowEnd = 4;

        btnRun.style.display = 'grid';
        btnRun.style.gridColumnStart = 3;
        btnRun.style.gridColumnEnd = 6;
        btnRun.style.gridRowStart = 4;
        btnRun.style.gridRowEnd = 4;
    }

    displayUndoRedo() {
        let undoBtn = document.getElementById('btn-undo');
        let redoBtn = document.getElementById('btn-redo');
        if (sudoApp.mySolverController.myUndoActionStack.length > 0) {
            undoBtn.classList.remove('btn-undo-off');
        } else {
            undoBtn.classList.add('btn-undo-off');
        }

        if (sudoApp.mySolverController.myRedoActionStack.length > 0) {
            redoBtn.classList.remove('btn-redo-off');
        } else {
            redoBtn.classList.add('btn-redo-off');
        }
    }

    displayGamePhase() {
        let gamePhase = this.getMyModel().getGamePhase();
        if (gamePhase == 'play') {
            this.btns = document.querySelectorAll('.btn-define');
            this.btns.forEach(btn => {
                btn.classList.remove('pressed');
            });
            this.btns = document.querySelectorAll('.btn-play');
            this.btns.forEach(btn => {
                btn.classList.add('pressed');
            });
        } else if (gamePhase == 'define') {
            this.btns = document.querySelectorAll('.btn-define');
            this.btns.forEach(btn => {
                btn.classList.add('pressed');
            });
            this.btns = document.querySelectorAll('.btn-play');
            this.btns.forEach(btn => {
                btn.classList.remove('pressed');
            });
        }
    }

    displayGoneSteps(goneSteps) {
        let goneStepsNode = document.getElementById("step-count");
        goneStepsNode.innerHTML = '<b>Schritte:</b> &nbsp' + goneSteps;
    }

    displayAutoDirection(autoDirection) {
        let forwardNode = document.getElementById("radio-forward");
        let backwardNode = document.getElementById("radio-backward");
        if (autoDirection == 'forward') {
            forwardNode.classList.add('checked');
            backwardNode.classList.remove('checked');
        } else {
            forwardNode.classList.remove('checked');
            backwardNode.classList.add('checked');
        }
    }

    displayEvalType(et) {
        let noEvalNode = document.getElementById('pc-no-eval');
        let lazyNode = document.getElementById('pc-lazy');
        let strictPlusNode = document.getElementById('pc-strict-plus');
        let strictMinusNode = document.getElementById('pc-strict-minus');

        switch (et) {
            case 'lazy-invisible': {
                noEvalNode.checked = true;
                break;
            }
            case 'lazy': {
                lazyNode.checked = true;
                break;
            }
            case 'strict-plus': {
                strictPlusNode.checked = true;
                break;
            }
            case 'strict-minus': {
                strictMinusNode.checked = true;
                break;
            }
            default: {
                throw new Error('Unknown eval type: ' + et);
            }
        }
    }

    displayBreakpoints(breakpoints) {
        let singleNode = document.getElementById('breakpoint-single');
        let hiddenSingleNode = document.getElementById('breakpoint-hidden-single');
        let multipleNode = document.getElementById('breakpoint-multiple-candidates');
        let contradictionNode = document.getElementById('breakpoint-contradiction');
        let solutionNode = document.getElementById('breakpoint-solution');
        singleNode.checked = breakpoints.single;
        hiddenSingleNode.checked = breakpoints.hiddenSingle;
        multipleNode.checked = breakpoints.multipleOption;
        contradictionNode.checked = breakpoints.contradiction;
        solutionNode.checked = breakpoints.solutionDiscovered;
    }

    displayPlayPlayType(pt) {
        let manualSolvingNode = document.getElementById('manual-solving');
        let automaticSolvingNode = document.getElementById('automated-solving');
        switch (pt) {
            case 'manual-solving':
            case 'training': {
                manualSolvingNode.checked = true;
                automaticSolvingNode.checked = false;
                break;
            }
            case 'automated-solving':
            case 'solving':
            case 'solving-trace': {
                automaticSolvingNode.checked = true;
                manualSolvingNode.checked = false;
                break;
            }
            default: {
                throw new Error('Unknown play-mode: ' + pt);
            }
        }
    }
    displayPuzzleIOTechniqueBtns() {
        let shareBtn = document.getElementById('share-button');
        let appNameHeader = document.getElementById('app-name-header');
        let initDBButton = document.getElementById('db-pz-btn-init');
        let downloadDBButton = document.getElementById('db-puzzle-btn-download-db');
        let downloadPzButton = document.getElementById('db-puzzle-btn-download-pz');
        let uploadButton = document.getElementById('db-puzzle-btn-upload');
        let pIOcheckbox = document.getElementById('puzzle-io');


        if (this.getMyModel().getPuzzleIOtechnique()) {
            pIOcheckbox.checked = true;
            shareBtn.style.display = 'block';
            // appNameHeader.style.gridTemplateColumns = '0.1fr 0.1fr 1.7fr 0.1fr';
            initDBButton.style.display = 'block';
            downloadDBButton.style.display = 'block';
            downloadPzButton.style.display = 'block';
            uploadButton.style.display = 'block';
        } else {
            pIOcheckbox.checked = false;
            shareBtn.style.display = 'none';
            // appNameHeader.style.gridTemplateColumns = '0.1fr 1.8fr 0.1fr';
            initDBButton.style.display = 'none';
            downloadDBButton.style.display = 'none';
            downloadPzButton.style.display = 'none';
            uploadButton.style.display = 'none';
        }
    }

    displayProgress() {
        let myGrid = this.getMyModel().myGrid;
        let countDef = myGrid.numberOfGivens();
        let countTotal = myGrid.numberOfNonEmptyCells();
        this.progressBar.setValue(countDef, countTotal);
    }

    displayReasonUnsolvability(reason) {
        let reasonNode = document.getElementById("reasonUnsolvability");
        let evalNode = document.getElementById("technique");
        if (reason == '') {
            reasonNode.style.display = "none";
            evalNode.style.display = "block";
        } else {
            reasonNode.style.display = "block";
            evalNode.style.display = "none";
            reasonNode.innerHTML =
                '<b>Widerspruch:</b> &nbsp' + reason;
        }
    }

    displayTechnique(tech) {
        let myGrid = this.getMyModel().getMyGrid();
        let evalNode = document.getElementById("technique");
        if (this.getMyModel().getActualEvalType() == 'lazy') {
            if (tech.includes('Single') ||
                tech.includes('Aus mehreren') ||
                tech.includes('Notwendig')) {
                evalNode.style.color = 'black';
            } else {
                evalNode.style.color = 'Crimson';
            }
            evalNode.innerHTML = tech;
        } else if (this.getMyModel().getActualEvalType() == 'lazy-invisible') {
            evalNode.style.color = 'darkgreen';
            evalNode.innerHTML = tech;
        }
    }

    displayLoadedBenchmark(levelOfDifficulty, countBackwards) {
        let evalNode = document.getElementById("loaded-evaluations");
        if (countBackwards == 0) {
            evalNode.innerHTML =
                '<b>Schwierigkeitsgrad:</b> &nbsp' + levelOfDifficulty + '; &nbsp'
        } else {
            evalNode.innerHTML =
                '<b>Schwierigkeitsgrad:</b> &nbsp' + levelOfDifficulty + '; &nbsp'
                + '<b>Rückwärtsläufe:</b> &nbsp' + countBackwards;
        }
    }

    displayBackwardCount(countBackwards) {
        let evalNode = document.getElementById("backward-count");
        if (countBackwards == 'none') {
            evalNode.innerHTML = '';
        } else {
            evalNode.innerHTML =
                '&nbsp <b>Rückwärts:</b> &nbsp' + countBackwards;
        }
    }

    showPuzzleSolutionInfo(info) {
        let pzInfo = document.getElementById("puzzle-info");
        pzInfo.innerText = info;
        pzInfo.style.display = "block";
    }

    hidePuzzleSolutionInfo() {
        let pzInfo = document.getElementById("puzzle-info");
        pzInfo.style.display = "none";
    }

    startLoaderAnimation(requestedLevel) {
        // Der sich drehende Loader wird angezeigt
        let slNode = document.getElementById("search-level");
        slNode.innerText = requestedLevel;
        document.getElementById("loader").style.display = "block";
    }
    stopLoaderAnimation() {
        document.getElementById("loader").style.display = "none";
    }

    displayPuzzle(uid, name) {
        if (uid == '') uid = ' - ';
        if (name == '') name = ' - ';
        let statusLineNode = document.getElementById('status-line');
        statusLineNode.innerHTML =
            '<b>Puzzle-Name:</b> &nbsp' + name;
    }

}

class SudokuSolverController {
    constructor(solver) {
        // The solver model
        this.mySolver = solver;
        this.initUndoActionStack();

        // =============================================================
        // The events of the solver are set
        // =============================================================

        // Set click event for the number buttons
        this.number_inputs = document.querySelectorAll('.mobile-number');
        this.number_inputs.forEach((e, index) => {
            e.addEventListener('click', () => {
                let btnNumber = this.number_inputs[index].value.toString();
                this.handleNumberPressed(btnNumber);
            })
        });

        //Click-Events for both delete buttons, desktop and mobile
        this.btns = document.querySelectorAll('.btn-delete-cell');
        this.btns.forEach(btn => {
            btn.addEventListener('click', () => {
                this.handleDeletePressed();
            })
        });
        // Events of keys on the keyboard
        window.addEventListener("keydown", (event) => {
            switch (event.key) {
                case "1":
                case "2":
                case "3":
                case "4":
                case "5":
                case "6":
                case "7":
                case "8":
                case "9":
                    this.handleKeyNumberPressed(event);
                    break;
                case "Delete":
                case "Backspace":
                    this.handleDeleteKeyPressed(event);
                    break;
                default:
                    return;
            }
        });

        // Click-Events for both define buttons, desktop and mobile
        this.btns = document.querySelectorAll('.btn-define');
        this.btns.forEach(btn => {
            btn.addEventListener('click', () => {
                this.defineBtnPressed();
            })
        });

        // Click-Events for both play buttons, desktop and mobile
        this.btns = document.querySelectorAll('.btn-play');
        this.btns.forEach(btn => {
            btn.addEventListener('click', () => {
                this.playBtnPressed();
            })
        });

        // Click-Events for both run buttons, desktop and mobile
        this.btns = document.querySelectorAll('.btn-run');
        this.btns.forEach(btn => {
            btn.addEventListener('click', () => {
                this.startBtnPressed();
            })
        });

        // Click-Events for both pause buttons, desktop and mobile
        this.btns = document.querySelectorAll('.btn-save');
        this.btns.forEach(btn => {
            btn.addEventListener('click', () => {
                this.saveBtnPressed();
            })
        });

        // Click-Events for both init buttons, desktop and mobile
        this.btns = document.querySelectorAll('.btn-undo');
        this.btns.forEach(btn => {
            btn.addEventListener('click', () => {
                this.undoBtnPressed();
            })
        });
        this.btns = document.querySelectorAll('.btn-redo');
        this.btns.forEach(btn => {
            btn.addEventListener('click', () => {
                this.redoBtnPressed();
            })
        });

        this.btns = document.querySelectorAll('.help-button');
        this.btns.forEach(btn => {
            btn.addEventListener('click', () => {
                sudoApp.helpFunktion();
            })
        });

        // Click-Events for both showWrongNumbers buttons, desktop and mobile
        this.btns = document.querySelectorAll('.btn-showWrongNumbers');
        this.btns.forEach(btn => {
            btn.addEventListener('click', () => {
                this.showWrongNumbersBtnPressed();
            })
        });

        this.btns = document.querySelectorAll('.btn-reset');
        this.btns.forEach(btn => {
            btn.addEventListener('click', () => {
                this.resetLinkPressed();
            })
        });


        // Radio button eval type: No-evaluation, Lazy, Strikt+ oder Strikt-
        let mobileRadioEvalNodes = document.querySelectorAll('.radio-eval-type');
        mobileRadioEvalNodes.forEach(radioNode => {
            radioNode.addEventListener('click', () => {
                let appSetting = undefined;
                let str_appSetting = localStorage.getItem("sudokuAppSetting");
                //The item appSetting exists already
                appSetting = JSON.parse(str_appSetting);
                appSetting.evalType = radioNode.getAttribute('data');
                this.mySolver.setActualEvalType(radioNode.getAttribute('data'));
                str_appSetting = JSON.stringify(appSetting);
                localStorage.setItem("sudokuAppSetting", str_appSetting);
            })
        });

        let mobileRadioPMNodes = document.querySelectorAll('.play-type');
        mobileRadioPMNodes.forEach(radioNode => {
            radioNode.addEventListener('click', () => {
                let appSetting = undefined;
                let str_appSetting = localStorage.getItem("sudokuAppSetting");
                //The item appSetting exists already
                appSetting = JSON.parse(str_appSetting);

                appSetting.playMode = radioNode.getAttribute('data');
                this.mySolver.setPlayType(radioNode.getAttribute('data'));
                str_appSetting = JSON.stringify(appSetting);
                localStorage.setItem("sudokuAppSetting", str_appSetting);
            })
        });

        let checkBoxContradiction = document.getElementById('breakpoint-contradiction');
        checkBoxContradiction.addEventListener('click', () => {
            let appSetting = undefined;
            let str_appSetting = localStorage.getItem("sudokuAppSetting");
            //The item appSetting exists already
            appSetting = JSON.parse(str_appSetting);
            appSetting.breakpoints.contradiction = checkBoxContradiction.checked;
            sudoApp.myClockedSearchStepLoop.getBreakpoints().contradiction = checkBoxContradiction.checked;
            str_appSetting = JSON.stringify(appSetting);
            localStorage.setItem("sudokuAppSetting", str_appSetting);
        })

        let checkBoxMC = document.getElementById('breakpoint-multiple-candidates');
        checkBoxMC.addEventListener('click', () => {
            let appSetting = undefined;
            let str_appSetting = localStorage.getItem("sudokuAppSetting");
            //The item appSetting exists already
            appSetting = JSON.parse(str_appSetting);
            appSetting.breakpoints.multipleOption = checkBoxMC.checked;
            sudoApp.myClockedSearchStepLoop.getBreakpoints().multipleOption = checkBoxMC.checked;
            str_appSetting = JSON.stringify(appSetting);
            localStorage.setItem("sudokuAppSetting", str_appSetting);
        })

        let checkBoxSingle = document.getElementById('breakpoint-single');
        checkBoxSingle.addEventListener('click', () => {
            let appSetting = undefined;
            let str_appSetting = localStorage.getItem("sudokuAppSetting");
            //The item appSetting exists already
            appSetting = JSON.parse(str_appSetting);
            appSetting.breakpoints.single = checkBoxSingle.checked;
            sudoApp.myClockedSearchStepLoop.getBreakpoints().single = checkBoxSingle.checked;
            str_appSetting = JSON.stringify(appSetting);
            localStorage.setItem("sudokuAppSetting", str_appSetting);
        })

        let checkBoxHiddenSingle = document.getElementById('breakpoint-hidden-single');
        checkBoxHiddenSingle.addEventListener('click', () => {
            let appSetting = undefined;
            let str_appSetting = localStorage.getItem("sudokuAppSetting");
            //The item appSetting exists already
            appSetting = JSON.parse(str_appSetting);
            appSetting.breakpoints.hiddenSingle = checkBoxHiddenSingle.checked;
            sudoApp.myClockedSearchStepLoop.getBreakpoints().hiddenSingle = checkBoxHiddenSingle.checked;
            str_appSetting = JSON.stringify(appSetting);
            localStorage.setItem("sudokuAppSetting", str_appSetting);
        })

        let checkboxSolution = document.getElementById('breakpoint-solution');
        checkboxSolution.addEventListener('click', () => {
            let appSetting = undefined;
            let str_appSetting = localStorage.getItem("sudokuAppSetting");
            //The item appSetting exists already
            appSetting = JSON.parse(str_appSetting);
            appSetting.breakpoints.solutionDiscovered = checkboxSolution.checked;
            sudoApp.myClockedSearchStepLoop.getBreakpoints().solutionDiscovered = checkboxSolution.checked;
            str_appSetting = JSON.stringify(appSetting);
            localStorage.setItem("sudokuAppSetting", str_appSetting);
        })

    }

    // ===============================================================
    // Solver event handler
    // ===============================================================

    handleKeyNumberPressed(event) {
        switch (event.target.tagName) {
            case 'INPUT': {
                // In dialogs with input fields, entries can be made in the field using keys on the keyboard
                // (instead of using buttons on the GUI). In our case, two events are generated: 
                // (1) the keydown event for the input field and (2) the keydown event for the global body element. 
                // The latter is semantically the same as the corresponding button event. 
                // Only numeric keys and the delete key are used. Key-downs of other keys are ignored.I.e. 
                // no event handler is declared.
                // If the current context is an input field, the simultaneous propagation to the cell of a Sudoku puzzle 
                // must be switched off, as the solver cannot react to this.
                event.stopPropagation();
                break;
            }
            case 'BODY': {
                this.handleNumberPressed(event.key);
                break;
            }
            default: {
                throw new Error('Unexpected keypad event target: ' + event.target.tagName);
            }
        }
    }

    handleNumberPressed(nr) {
        if (this.mySolver.isSearching()) {
            // Number button pressed during automatic execution
            sudoApp.myInfoDialog.open("Nummer setzen", "negativ",
                "Während der Solver-Ausführung kann manuell keine Zelle gesetzt oder gelöscht werden.");
        } else {
            let action = {
                operation: 'setNr',
                cellIndex: this.mySolver.myGrid.indexSelected,
                cellValue: nr
            }
            if (action.cellIndex > -1) {
                this.mySolver.atCurrentSelectionSetNumber(nr);
                this.myUndoActionStack.push(action);
                this.mySolver.notify();
                if (this.mySolver.succeeds()) {
                    sudoApp.myInfoDialog.open("Herzlichen Glückwunsch!", 'solutionDiscovered', "Das Puzzle ist gelöst.");
                }
                this.mySolver.myGrid.unsetStepLazy();
            }
        }
    }

    handleDeleteKeyPressed(event) {
        switch (event.target.tagName) {
            case 'INPUT': {
                // In dialogs with input fields, entries can be made in the field using keys on the keyboard
                // (instead of using buttons on the GUI). In our case, two events are generated: 
                // (1) the keydown event for the input field and (2) the keydown event for the global body element. 
                // The latter is semantically the same as the corresponding button event. 
                // Only numeric keys and the delete key are used. Keydowns of other keys are ignored, i.e. 
                // no event handler is declared.
                // If the current context is an input field, the simultaneous propagation to the cell of a Sudoku cell 
                // must be switched off, as the solver cannot react to this.
                event.stopPropagation();
                break;
            }
            case 'BODY': {
                // This event is generated when a number is to be deleted in a Sudoku cell.
                this.handleDeletePressed();
                break;
            }
            default: {
                // 'BUTTON'
                // throw new Error('Unexpected keypad event target: ' + event.target.tagName);
            }
        }
    }

    handleDeletePressed() {
        if (this.mySolver.isSearching()) {
            // Number button pressed during automatic execution
            sudoApp.myInfoDialog.open("Nummer löschen", "negativ",
                "Während der Solver-Ausführung kann manuell keine Zelle gesetzt oder gelöscht werden.");
        } else {
            let action = {
                operation: 'delete',
                cellIndex: this.mySolver.myGrid.indexSelected,
                cellValue: undefined
            }
            if (action.cellIndex > -1) {
                action.cellValue = this.mySolver.myGrid.sudoCells[this.mySolver.myGrid.indexSelected].getValue();
                this.myUndoActionStack.push(action);
            }
            this.mySolver.deleteSelected();
            this.mySolver.notify();
        }
    }
    sudokuCellPressed(index) {
        this.mySolver.select(index);
        this.mySolver.notify();
    }

    initUndoActionStack() {
        this.myUndoActionStack = [];
        this.myRedoActionStack = [];
    }

    defineBtnPressed() {
        // ??? Without a defined set of givens, there is no puzzle.
        this.mySolver.newPuzzle();
        this.initUndoActionStack();
        this.mySolver.notify();
    }

    async playBtnPressed() {
        // Switching to the play phase means that the definition of the puzzle 
        // has been finished.
        // After switching to the play phase, the puzzles meta-data 
        // are calculated in the background and are stored in a new puzzle record.
        // This includes the solution of the new puzzle. The latter allows, the user to have 
        // his current number settings checked. There is a call button for this check.
        if (this.mySolver.getGamePhase() == 'play') {
            // The solver is already in the game phase 'play'.
            // In this case we recompute the puzzle meta data 
            // but do not create a new puzzle.
            let previousPuzzleRecord = this.mySolver.myPuzzle.myRecord;
            this.mySolver.myPuzzle.myRecord = await this.mySolver.setNewPuzzleRecord();
            // Retain the identity of the previous record
            this.mySolver.myPuzzle.myRecord.id = previousPuzzleRecord.id;
            this.mySolver.myPuzzle.myRecord.name = previousPuzzleRecord.name;
            this.mySolver.myPuzzle.myRecord.date = previousPuzzleRecord.date;
        } else {
            this.mySolver.myPuzzle.myRecord = await this.mySolver.setNewPuzzleRecord();
            this.mySolver.setGamePhase('play');
            this.initUndoActionStack();
        }
        this.mySolver.notify();
    }

    startBtnPressed() {
        this.initUndoActionStack();
        if (this.mySolver.getGamePhase() == 'define') {
            this.playBtnPressed();
        }
        if (sudoApp.mySolver.myGrid.isUnsolvable()) {
            this.mySolver.isCurrentlyBChecked = true;
            sudoApp.mySolver.notify();
            this.mySolver.isCurrentlyBChecked = false;
            let level = sudoApp.mySolver.myPuzzle.myRecord.preRunRecord.level;
            sudoApp.myInfoDialog.open('Start Solver', 'negativ', 'Schwierigkeitsgrad: ' + level +
                '. <br><br> Der aktuelle Puzzle-Status zeigt einen Widerspruch.');
        } else {
            this.mySolver.tryStartBacktracking();
            if (this.mySolver.isSearching()) {
                sudoApp.myTrackerDialog.open();
            }
        }
    }

    initLinkPressed() {
        // navigation bar init pressed
        sudoApp.myTrackerDialog.close();
        sudoApp.myNavBar.closeNav();
        this.initUndoActionStack();
        this.mySolver.init();
        this.mySolver.notify();
        // Zoom in the new initiated grid
        sudoApp.mySolver.notifyAspect('puzzleLoading', undefined);
    }

    resetLinkPressed() {
        sudoApp.myNavBar.closeNav();
        if (sudoApp.mySolver.getGamePhase() == 'define') {
            sudoApp.myInfoDialog.open("Puzzle zurücksetzen", "negativ",
                "Das Puzzle ist noch in der Definition. Daher kann es nicht zurückgesetzt werden.");
        } else if (sudoApp.mySolver.isSearching()) {
            sudoApp.myInfoDialog.open("Puzzle zurücksetzen", "negativ",
                "bei laufendem Solver kann die Puzzle-Lösung nicht zurückgesetzt werden.");
        } else {
            this.resetConfirmed();
        }
    }

    resetConfirmed() {
        let puzzle = this.mySolver.myPuzzle;
        let action = {
            operation: 'reset',
            pzSolutions: puzzle.myNumberOfSolutions,
            pzCompleted: puzzle.mySearchIsCompleted,
            pzArray: this.mySolver.myGrid.getPuzzleArray()
        }
        this.myUndoActionStack.push(action);
        this.mySolver.reset();
        this.mySolver.notify();
    }

    undoBtnPressed() {
        if (this.myUndoActionStack.length > 0) {
            let action = this.myUndoActionStack.pop();
            this.undo(action);
            this.myRedoActionStack.push(action);
            this.mySolver.notify();
        }
    }

    redoBtnPressed() {
        if (this.myRedoActionStack.length > 0) {
            let action = this.myRedoActionStack.pop();
            this.redo(action);
            this.myUndoActionStack.push(action);
            this.mySolver.notify();
        }
    }
    undo(action) {
        switch (action.operation) {
            case 'reset': {
                sudoApp.mySolver.myPuzzle.set(
                    action.pzSolutions,
                    action.pzCompleted
                );
                sudoApp.mySolver.myGrid.loadPuzzleArray(action.pzArray);
                sudoApp.mySolver.myGrid.evaluateMatrix();
                break;
            }
            case 'setNr': {
                // Delete set number
                this.mySolver.myGrid.indexSelected = action.cellIndex;
                this.mySolver.deleteSelected();
                break;
            }
            case 'delete': {
                // Set the deleted number again
                this.mySolver.myGrid.indexSelected = action.cellIndex;
                this.mySolver.atCurrentSelectionSetNumber(action.cellValue);
                break;
            }
            default: {
                throw new Error('Unknown undo-redo-action: ' + action.operation);
            }
        }
    }

    redo(action) {
        // this.mySolver.stopBackTrackingSearch();
        switch (action.operation) {
            case 'reset': {
                this.resetLinkPressed();
                break;
            }
            case 'setNr': {
                // Set the number again
                this.mySolver.myGrid.indexSelected = action.cellIndex;
                this.mySolver.atCurrentSelectionSetNumber(action.cellValue);
                break;
            }
            case 'delete': {
                // Delete the number again
                this.mySolver.myGrid.indexSelected = action.cellIndex;
                this.mySolver.deleteSelected();
                break;
            }
            default: {
                throw new Error('Unknown undo-redo-action: ' + action.operation);
            }
        }
    }

    sleep(milliseconds) {
        return new Promise(resolve => setTimeout(resolve, milliseconds));
    }

    async generateLinkPressed(level) {
        sudoApp.myNavBar.closeNav();
        sudoApp.myTrackerDialog.close();
        // Now we are waiting for the store to be filled.
        // The rotating loader icon is started.
        let aspectValue = {
            op: 'started',
            rl: level
        }
        sudoApp.mySolver.notifyAspect('puzzleGenerator', aspectValue);
        let puzzleRecord = await sudoApp.myNewPuzzleStore.popPuzzle(level);
        // We got the desired puzzle and do not longer wait
        // for new puzzles in the store.
        // The rotating loader icon is stopped.
        aspectValue = {
            op: 'finished',
            rl: level
        }
        sudoApp.mySolver.notifyAspect('puzzleGenerator', aspectValue);
        //The puzzle taken from the store (pop) is loaded into the solver
        sudoApp.mySolver.loadPuzzle(puzzleRecord);
        // Puzzles generated into the store are in solved state.
        // So the loaded puzzle must be reset.
        sudoApp.mySolver.reset();
        sudoApp.mySolver.notify();
        sudoApp.mySolver.notifyAspect('puzzleLoading', undefined);
        // After getting a puzzle from store the store needs to be filled up.
        sudoApp.myNewPuzzleStore.fillNewPuzzleStore();
    }

    async saveBtnPressed() {
        if (sudoApp.mySolver.getGamePhase() == 'define') {
            sudoApp.myInfoDialog.open("Puzzle speichern", "negativ",
                "Das Puzzle ist noch in der Definition. Daher kann es nicht gespeichert werden.");
        } else {
            // transfer grid state into the puzzle record
            this.mySolver.grid2puzzle();

            if (!sudoApp.myPuzzleDB.has(this.mySolver.getLoadedPuzzleUID())) {
                // The loaded puzzle is not yet element in the database.
                // Save loaded puzzle with new name in the database
                // A default name is defined
                let newPuzzleName = 'PZ (' + new Date().toLocaleString('de-DE') + ')';
                // the current puzzle gets this name
                this.mySolver.setLoadedPuzzleName(newPuzzleName);
                // The user is asked for a name
                sudoApp.myPuzzleSaveRenameDlg.open(
                    sudoApp.mySolverController.savePuzzleDlgOKPressed,
                    sudoApp.mySolverController.savePuzzleDlgCancelPressed,
                    this.mySolver.myPuzzle.myRecord);
            } else {
                // The current puzzle is already element in the database
                // So only the actual puzzle state needs to be saved
                let puzzle = this.mySolver.myPuzzle.myRecord;
                let storedPuzzle = sudoApp.myPuzzleDB.getPuzzleRecord(puzzle.id);
                puzzle.date = storedPuzzle.date;
                sudoApp.myPuzzleDB.savePuzzle(puzzle);
                sudoApp.myPuzzleDB.notify();
                sudoApp.myInfoDialog.open('Spielstand gespeichert', "positiv",
                    'Puzzle: \"' + this.mySolver.myPuzzle.myRecord.name + '\"');
            }
        }
    }

    openDBLinkPressed() {
        sudoApp.myPuzzleDBDialog.open();
        sudoApp.myPuzzleDB.notify();
        sudoApp.myNavBar.closeNav();
    }

    openSettingsDlgPressed() {
        sudoApp.mySettingsDialog.open();
        sudoApp.mySolver.notify();
        sudoApp.myNavBar.closeNav();
    }

    btnBreakPointSettingsPressed() {
        sudoApp.mySettingsDialog.openTopicBreakpoints();
        sudoApp.mySolver.notify();
    }

    printLinkPressed() {
        sudoApp.myNavBar.closeNav();
        if (sudoApp.mySolver.getGamePhase() == 'define') {
            sudoApp.myInfoDialog.open("Puzzle drucken", "negativ",
                "Das Puzzle ist noch in der Definition. Daher kann es nicht gedruckt werden.");
        } else {
            // this.mySolver.stopBackTrackingSearch();
            sudoApp.myTrackerDialog.close();
            if (!sudoApp.myPuzzleDB.has(this.mySolver.myPuzzle.myRecord.id)) {
                // The current puzzle is not yet an element in the database.
                // Save the current puzzle with a new name in the database.
                let newName = 'Druck (' + new Date().toLocaleString('de-DE') + ')';
                this.mySolver.myPuzzle.myRecord.name = newName;
                sudoApp.myPuzzleDB.savePuzzle(this.mySolver.myPuzzle.myRecord);
            }
            // The current puzzle is element in the database.
            // Before printing save the current state.
            let storedPuzzle = sudoApp.myPuzzleDB.getPuzzleRecord(this.mySolver.myPuzzle.myRecord.id);
            this.mySolver.grid2puzzle();
            this.mySolver.myPuzzle.myRecord.date = storedPuzzle.date;
            sudoApp.myPuzzleDB.savePuzzle(this.mySolver.myPuzzle.myRecord);
            // Print the saved puzzle
            sudoApp.myPuzzleDBController.printSelectedPuzzle();
            // The saved and printed puzzle becomes the new current puzzle
            let puzzleRecord = sudoApp.myPuzzleDB.getSelectedPuzzle();
            sudoApp.mySolver.loadPuzzle(puzzleRecord);
            sudoApp.mySolver.notify();
        }
    }

    showWrongNumbersBtnPressed() {
        // Flags incorrectly set numbers and checks for contradiction.
        // The property set below indicates that this check operation is in progress. 
        // It has the effect that the display of the current puzzle includes 
        // the display of its possible unfulfillability. 
        // Normally, the unfulfillability is not displayed.
        this.mySolver.isCurrentlyBChecked = true;
        let level = sudoApp.mySolver.myPuzzle.myRecord.preRunRecord.level;
        if (level == 'Unlösbar') {
            if (sudoApp.mySolver.myGrid.isUnsolvable()) {
                sudoApp.mySolver.notify();
                let level = sudoApp.mySolver.myPuzzle.myRecord.preRunRecord.level;
                sudoApp.myInfoDialog.open('Start Solver', 'negativ', 'Schwierigkeitsgrad: ' + level +
                    '. <br><br> Der aktuelle Puzzle-Status zeigt einen Widerspruch.');
            } else {
                sudoApp.myInfoDialog.open('Prüfergebnis', 'info', 'Schwierigkeitsgrad: ' + level +
                    '. <br><br> Der aktuelle Puzzle-Status zeigt noch keinen Widerspruch. Im weiteren Verlauf der Lösungssuche mit dem automatischen Solver wird ein Widerspruch aufgedeckt werden, der dazu führt, dass das Puzzle unlösbar ist.');
            }
        } else if (level == 'Extrem schwer') {
            sudoApp.myInfoDialog.open('Prüfergebnis', 'info', 'Schwierigkeitsgrad: ' + level +
                '. <br><br> Mit dem Solver können die Anzahl der Lösungen sowie die Lösungen selbst hergeleitet werden.');
        } else {
            // Level is fair or 'Sehr schwer', i.e. has a unique solution
            let wrongCellSet = false;
            let solvedPuzzle = sudoApp.mySolver.myPuzzle.myRecord.preRunRecord.solvedPuzzle;
            for (let i = 0; i < 81; i++) {
                let currentCellValue = sudoApp.mySolver.myGrid.sudoCells[i].getValue();
                let currentCellPhase = sudoApp.mySolver.myGrid.sudoCells[i].getPhase();
                if (currentCellValue !== '0' &&
                    currentCellPhase !== 'define' &&
                    currentCellValue !== solvedPuzzle[i].cellValue) {
                    // Mark cell wrong
                    sudoApp.mySolver.myGrid.sudoCells[i].setWrong();
                    wrongCellSet = true;
                }
            }
            sudoApp.mySolver.notify();
            if (wrongCellSet) {
                sudoApp.myInfoDialog.open("Prüfergebnis", "negativ", "Es gibt falsche Lösungsnummern, siehe rot umrandete Zellen!");
            } else {
                sudoApp.myInfoDialog.open('Prüfergebnis', 'positiv', 'Bisher sind alle Lösungsnummern korrekt!');
            }
        }
        // this check operation is finished
        this.mySolver.isCurrentlyBChecked = false;
    }

    trackerDlgStepSequencePressed() {
        if (sudoApp.myClockedSearchStepLoop.isRunning() ||
            sudoApp.mySynchronousSearchStepLoop.isRunning() ||
            sudoApp.myClockedSolutionLoop.isRunning()) {
            sudoApp.myClockedSearchStepLoop.stop('cancelled');
            sudoApp.mySynchronousSearchStepLoop.stop('cancelled');
            sudoApp.myClockedSolutionLoop.stop('cancelled');
        } else {
            sudoApp.myClockedSearchStepLoop.start();
        }
    }

    trackerDlgStepPressed() {
        if (sudoApp.myClockedSearchStepLoop.isRunning() ||
            sudoApp.mySynchronousSearchStepLoop.isRunning() ||
            sudoApp.myClockedSolutionLoop.isRunning()) {
            sudoApp.myClockedSearchStepLoop.stop('cancelled');
            sudoApp.mySynchronousSearchStepLoop.stop('cancelled');
            sudoApp.myClockedSolutionLoop.stop('cancelled');
        } else {
            sudoApp.mySolver.performSearchStep();
        }
    }

    trackerDlgFastStepPressed() {
        sudoApp.mySolverView.startLoaderAnimation('Nächste Lösung');
        setTimeout(this.trackerDlgFastStep, 1000);
    }

    trackerDlgFastStep() {
        if (sudoApp.myClockedSearchStepLoop.isRunning() ||
            sudoApp.mySynchronousSearchStepLoop.isRunning() ||
            sudoApp.myClockedSolutionLoop.isRunning()) {
            sudoApp.myClockedSearchStepLoop.stop('cancelled');
            sudoApp.mySynchronousSearchStepLoop.stop('cancelled');
            sudoApp.myClockedSolutionLoop.stop('cancelled');
        } else {
            sudoApp.mySolver.performSolutionStep();
            sudoApp.mySolver.notify();
            sudoApp.mySolverView.stopLoaderAnimation();
        }
    }


    trackerDlgFastPressed() {
        //sudoApp.mySolverView.startLoaderAnimation('Lösungen ...');
        this.trackerDlgFast();
    }
    trackerDlgFast() {
        if (sudoApp.myClockedSearchStepLoop.isRunning() ||
            sudoApp.mySynchronousSearchStepLoop.isRunning() ||
            sudoApp.myClockedSolutionLoop.isRunning()) {
            sudoApp.myClockedSearchStepLoop.stop('cancelled');
            sudoApp.mySynchronousSearchStepLoop.stop('cancelled');
            sudoApp.myClockedSolutionLoop.stop('cancelled');
        } else {
            sudoApp.myClockedSolutionLoop.start();
        }
    }


    trackerDlgStopPressed() {
        sudoApp.myClockedSearchStepLoop.stop('cancelled');
        sudoApp.mySynchronousSearchStepLoop.stop('cancelled');
        sudoApp.myClockedSolutionLoop.stop('cancelled');
        sudoApp.mySolver.deleteSearch();
        sudoApp.myTrackerDialog.close();
        sudoApp.mySolver.notify();
    }


    infoDlgOKPressed() {
        sudoApp.myInfoDialog.close();
    }
    settingsClosePressed() {
        sudoApp.mySettingsDialog.close();
    }
    puzzleIOcheckboxOnchange() {
        let pIOcheckbox = document.getElementById('puzzle-io');
        let appSetting = undefined;
        let str_appSetting = localStorage.getItem("sudokuAppSetting");
        appSetting = JSON.parse(str_appSetting);
        appSetting.puzzleIOtechnique = pIOcheckbox.checked.toString();
        sudoApp.mySolver.setPuzzleIOtechnique(pIOcheckbox.checked);
        str_appSetting = JSON.stringify(appSetting);
        localStorage.setItem("sudokuAppSetting", str_appSetting);
    }

    savePuzzleDlgOKPressed() {
        sudoApp.myPuzzleSaveRenameDlg.close();
        let currentPuzzle = sudoApp.mySolver.myPuzzle.myRecord;
        currentPuzzle.name = sudoApp.myPuzzleSaveRenameDlg.getPuzzleName();
        sudoApp.myPuzzleDB.savePuzzle(currentPuzzle);
        sudoApp.myPuzzleDB.notify()
        sudoApp.mySolver.loadPuzzle(sudoApp.myPuzzleDB.getSelectedPuzzle());
        sudoApp.mySolver.notify();
    }

    savePuzzleDlgCancelPressed() {
        sudoApp.myPuzzleSaveRenameDlg.close();
    }
}
class SudokuGenerator extends SudokuSolver {
    // The generator only extends the SudokuSolver
    // by one method, the generation method.
    constructor(app) {
        super(app);
        //this.init();
    }

    init() {
        super.init();
        this.setActualEvalType('strict-plus');
        this.setPlayType('automated-solving');
    }

    generatePuzzle() {
        this.init();
        // Set a random number in a random cell
        let randomCellIndex = Randomizer.getRandomIntInclusive(0, 80);
        this.myGrid.select(randomCellIndex);

        let randomCellContent = Randomizer.getRandomIntInclusive(1, 9).toString();
        this.atCurrentSelectionSetNumber(randomCellContent);

        // Solve this puzzle with a non-timed
        // automatic execution
        this.createSearch();
        sudoApp.mySynchronousSearchStepLoop.start();
        // Turn the dissolved cells into Givens
        this.setSolvedToGiven();
        // Set the puzzle to define mode
        this.setGamePhase('define')
        // Delete numbers in the solution
        // as long as the remaining puzzle remains backtrack-free.
        this.takeBackGivenCells();
        // Solve the generated puzzle to determine its level of difficulty.
        this.deleteSearch();
        this.createSearch();
        sudoApp.mySynchronousSearchStepLoop.start();
    }

    grid2puzzleRecord() {
        let puzzleRecord = PuzzleRecord.nullPuzzleRecord();
        // A new puzzle with a unique id and its creation date
        puzzleRecord.id = Date.now().toString(36) + Math.random().toString(36).substr(2);
        puzzleRecord.date = (new Date()).toJSON();

        // the solved puzzle infos will be transferred 
        // from grid into the solved puzzle array.
        for (let i = 0; i < 81; i++) {
            puzzleRecord.preRunRecord.solvedPuzzle.push({
                cellValue: this.myGrid.sudoCells[i].getValue(),
                cellPhase: this.myGrid.sudoCells[i].getPhase()
            })
            if (this.myGrid.sudoCells[i].getPhase() == 'define') {
                puzzleRecord.statusGiven++;
            }
        }
        puzzleRecord.preRunRecord.level = this.maxSelectionDifficulty();
        puzzleRecord.preRunRecord.backTracks = this.countBackwards();

        // The solved puzzle is reset
        this.reset();
        // The reset puzzle is transferred to the puzzle data structure.
        // This puzzle is the intended new puzzle.
        puzzleRecord.statusSolved = 0;
        for (let i = 0; i < 81; i++) {
            puzzleRecord.puzzle.push({
                cellValue: this.myGrid.sudoCells[i].getValue(),
                cellPhase: this.myGrid.sudoCells[i].getPhase()
            });
            if (this.myGrid.sudoCells[i].getPhase() == 'play') {
                puzzleRecord.statusSolved++;
            }
        };
        puzzleRecord.statusOpen = 81
            - puzzleRecord.statusGiven
            - puzzleRecord.statusSolved;

        return puzzleRecord;
    }

    takeBackGivenCells() {
        this.myGrid.takeBackGivenCells();
    }
    setSolvedToGiven() {
        this.myGrid.setSolvedToGiven();
    }
}
class SudokuFastSolver extends SudokuSolver {
    // The FastSolver only extends the StepByStepSolver
    // by one method, the computePuzzlePreRunData method.
    constructor(app) {
        super(app);
        this.init();
    }

    init() {
        super.init();
        this.setActualEvalType('strict-plus');
        this.setPlayType('automated-solving');
        this.createSearch();
    }

    computePuzzlePreRunData(puzzleArray) {
        // Load the puzzle into the solver.
        this.loadPuzzleArrayGivens(puzzleArray);

        // Let the loop search for a solution of the puzzle
        sudoApp.mySynchronousSearchStepLoop.start();
        let stoppingBreakpoint = sudoApp.mySynchronousSearchStepLoop.getMyStoppingBreakpoint();
        if (stoppingBreakpoint == 'solutionDiscovered') {
            // Store solution data into the preRunRecord
            let preRunRecord = this.grid2preRunRecord();
            switch (preRunRecord.level) {
                case 'Leicht': {
                    // check if 'Very easy';
                    // For an easy puzzle in the strict sense, there is no longer a given cell 
                    // that could be cancelled, so that the cancelled cell would retain a unique solution.
                    // We define an easy puzzle that has removable cells as 'Very easy'.
                    this.reset();
                    // Set the puzzle to define mode
                    this.setGamePhase('define')
                    // Check whether there is a removable given cell.
                    if (this.myGrid.canTakenBackGivenCells()) {
                        preRunRecord.level = 'Sehr leicht';
                    }
                    break;
                }
                case 'Mittel': break;
                case 'Schwer': break;
                case 'Backtracking': {
                    // If the calculated level of difficulty is "Backtracking", 
                    // check whether there are other solutions. In this case the
                    // puzzle has more than one solution, i.e. no unique solution.
                    // Then the puzzle is either "Very difficult" or "Extremely difficult".

                    sudoApp.mySynchronousSearchStepLoop.start();
                    let stoppingBreakpoint = sudoApp.mySynchronousSearchStepLoop.getMyStoppingBreakpoint();
                    if (stoppingBreakpoint == 'solutionDiscovered') {
                        // There is a second solution. Therefore ...
                        preRunRecord.level = 'Extrem schwer';
                    } else {
                        // stoppingBreakpoint == 'searchCompleted'
                        // i.e. puzzle with only one solution
                        preRunRecord.level = 'Sehr schwer';
                    };
                    break;
                }
                default: {
                    throw new Error('Fast Solver with unknown difficulty level: ' + preRunRecord.level);
                }
            }
            return preRunRecord;
        } else if (stoppingBreakpoint == 'searchCompleted') {
            let preRunRecord = PreRunRecord.nullPreRunRecord();
            preRunRecord.level = 'Unlösbar';
            return preRunRecord;
        }
    }

    grid2preRunRecord() {
        let preRunRecord = PreRunRecord.nullPreRunRecord();
        for (let i = 0; i < 81; i++) {
            preRunRecord.solvedPuzzle.push({
                cellValue: this.myGrid.sudoCells[i].getValue(),
                cellPhase: this.myGrid.sudoCells[i].getPhase()
            });
        };
        preRunRecord.level = this.maxSelectionDifficulty();
        preRunRecord.backTracks = this.countBackwards();
        return preRunRecord;
    }

    maxSelectionDifficulty() {
        return this.mySearch.myStepper.maxSelectionDifficulty;
    }
    countBackwards() {
        return this.mySearch.myStepper.countBackwards;
    }

    loadPuzzleArrayGivens(puzzleArray) {
        this.myGrid.loadPuzzleArrayGivens(puzzleArray);
        this.myGrid.evaluateMatrix();
    }
}
// ==========================================
// Apps 
// ==========================================
class SudokuMainApp {
    constructor() {
        // ==============================================================
        // Components of the app
        // ==============================================================
        // 1. The solver component
        this.mySolver = new SudokuSolver(this);
        this.mySolverView = new SudokuSolverView(this.mySolver);
        this.mySolverController = new SudokuSolverController(this.mySolver);
        // A true MVC pattern exists only for the solver. 
        // The other model and view classes are only subcomponents of the solver classes. 
        // They do not realize any own observer relationship.
        this.mySolver.attach(this.mySolverView);
        this.mySolver.setMyView(this.mySolverView);

        // 2. The database component
        this.myPuzzleDB = new SudokuPuzzleDB();
        this.myPuzzleDBView = new SudokuPuzzleDBView(this.myPuzzleDB);
        this.myPuzzleDBController = new SudokuPuzzleDBController(this.myPuzzleDB);
        this.myPuzzleDB.init();
        // 3. The PuzzleStore, which is filled with three puzzles 
        // for each difficulty level when the app is launched. 
        // When a new puzzle is requested, it is taken from the store 
        // and the store is replenished in the background.
        this.myNewPuzzleStore = new NewPuzzleStore();

        // The navigation bar
        this.myNavBar = new NavigationBar();

        // Used dialogs
        this.myTrackerDialog = new TrackerDialog();
        this.myInfoDialog = new InfoDialog();
        this.mySettingsDialog = new SettingsDialog();
        this.myPuzzleSaveRenameDlg = new PuzzleSaveRenameDialog();
        this.myConfirmDlg = new ConfirmDialog();
        this.myPuzzleDBDialog = new PuzzleDBDialog();

        // Loops
        this.myClockedSearchStepLoop = new ClockedSearchStepLoop();
        this.mySynchronousSearchStepLoop = new SynchronousSearchStepLoop();
        this.myClockedSolutionLoop = new ClockedSolutionLoop();
    }
    getMySolver() {
        return this.mySolver;
    }

    init() {
        // load the app settings
        let appSetting = undefined;
        let tmpBreakpoints = {
            contradiction: true,
            multipleOption: true,
            single: true,
            hiddenSingle: true
        };
        let str_appSetting = localStorage.getItem("sudokuAppSetting");
        if (str_appSetting == null) {
            // appSetting does not exist in localStorage
            appSetting = {
                evalType: 'lazy-invisible',
                playMode: 'automated-solving',
                puzzleIOtechnique: false.toString(),
                breakpoints: tmpBreakpoints
            }
            str_appSetting = JSON.stringify(appSetting);
            localStorage.setItem("sudokuAppSetting", str_appSetting);
        } else {
            // appSetting exists already
            appSetting = JSON.parse(str_appSetting);
            if (appSetting.breakpoints == undefined) {
                appSetting.breakpoints = tmpBreakpoints;
                str_appSetting = JSON.stringify(appSetting);
                localStorage.setItem("sudokuAppSetting", str_appSetting);
            }
        }
        this.mySolver.init();
        this.mySolver.setActualEvalType(appSetting.evalType);
        this.mySolver.setPlayType(appSetting.playMode);
        this.mySolver.setPuzzleIOtechnique(Boolean(appSetting.puzzleIOtechnique));
        this.mySolver.notify();

        this.myClockedSearchStepLoop.setBreakpoints(appSetting.breakpoints);

        this.myPuzzleDB.init();

        this.myNewPuzzleStore.init();
        this.myNavBar.init();
        this.displayAppVersion();
    }

    breakpointPassed(bp) {
        this.myClockedSearchStepLoop.breakpointPassed(bp);
        this.mySynchronousSearchStepLoop.breakpointPassed(bp);
        this.myClockedSolutionLoop.breakpointPassed(bp);
    }

    displayAppVersion() {
        let versionNode = document.getElementById('appVersion');
        versionNode.innerHTML =
            '<b>AppVersion:</b> &nbsp' + VERSION;
    }

    helpFunktion() {
        window.open('./help.html');
    }
}
class SudokuGeneratorApp {
    constructor() {
        // The two components of the Sudoku worker app are the generator 
        // and the synchronous search step loop.
        this.myGenerator = new SudokuGenerator(this);
        this.mySynchronousSearchStepLoop = new SynchronousSearchStepLoop();
    }

    breakpointPassed(bp) {
        this.mySynchronousSearchStepLoop.breakpointPassed(bp);
    }

    getMySolver() {
        return this.myGenerator;
    }

    init() {
        this.myGenerator.init();
    }
}
class SudokuFastSolverApp {
    constructor() {
        this.myFastSolver = new SudokuFastSolver(this);
        this.mySynchronousSearchStepLoop = new SynchronousSearchStepLoop();
    }

    breakpointPassed(bp) {
        this.mySynchronousSearchStepLoop.breakpointPassed(bp);
    }

    getMySolver() {
        return this.myFastSolver;
    }

    init() {
        this.myFastSolver.init();
    }
}
// ==========================================
// Basic functions
// ==========================================
function startMainApp() {
    sudoApp = new SudokuMainApp();
    sudoApp.init();
}
function startGeneratorApp() {
    //A worker app is assigned to the variable "sudoApp".
    sudoApp = new SudokuGeneratorApp();
    sudoApp.init();
}
function startFastSolverApp() {
    //A worker app is assigned to the variable "sudoApp".
    sudoApp = new SudokuFastSolverApp();
    sudoApp.init();
}