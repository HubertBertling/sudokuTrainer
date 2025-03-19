let sudoApp;
let VERSION = 793;

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
class IndexCalculator {
    /*
        0	1	2	3	4	5	6	7	8
        9	10	11	12	13	14	15	16	17
        18	19	20	21	22	23	24	25	26
        27	28	29	30	31	32	33	34	35
        36	37	38	39	40	41	42	43	44
        45	46	47	48	49	50	51	52	53
        54	55	56	57	58	59	60	61	62
        63	64	65	66	67	68	69	70	71
        72	73	74	75	76	77	78	79	80
     */

    static getCellIndexRow(row, i) {
        return row * 9 + i;
    }

    static getCellIndexCol(col, i) {
        return col + 9 * i;
    }

    static getCellIndexBlock(block, i) {
        let rows = (Math.floor(block / 3) * 3 + Math.floor(i / 3)) * 9;
        let partialRows = (block % 3) * 3;
        let cellIndex = rows + partialRows + (i % 3);
        return cellIndex;
    }

    static calcBlockIndex(row, col) {
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
    static rowIndex(cellIndex) {
        return Math.floor(cellIndex / 9);
    }
    static colIndex(cellIndex) {
        return cellIndex % 9;
    }
    static blockRow(cellIndex) {
        return Math.floor(this.rowIndex(cellIndex) / 3);
    }
    static blockCol(cellIndex) {
        return Math.floor(this.colIndex(cellIndex) / 3);
    }
    static blockIndex(cellIndex) {
        return this.calcBlockIndex(this.blockRow(cellIndex), this.blockCol(cellIndex));
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
        // Breakpoints
        this.myBreakpoints = {
            contradiction: false,
            multipleOption: false,
            single: false,
            hiddenSingle: false,
            solutionDiscovered: true
        }
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
                // Ignore these breakpoints in a SynchronousRunner
                // Its task is the fast solution of a puzzle.
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
        // Breakpoints
        this.myBreakpoints = BreakpointsRecord.nullBreakpointsRecord();
    }

    start(thisPointer, step) {
        if (!this.isRunning()) {
            this.myStoppingBreakpoint = undefined;
            this.timer = window.setInterval(() => {
                step.call(thisPointer);
            }, 75);
        }
    }
    setBreakpoints(bps) {
        this.myBreakpoints.contradiction = bps.contradiction;
        this.myBreakpoints.multipleOption = bps.multipleOption;
        this.myBreakpoints.single = bps.single;
        this.myBreakpoints.hiddenSingle = bps.hiddenSingle;
        this.myBreakpoints.solutionDiscovered = bps.solutionDiscovered;
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

class Search {
    // A search represents a the traverse through the Sudoku search tree.
    // 'performStep()' is the basic traversal step.
    // On the way through the tree there occur steps which discover a solution
    // of the given puzzle. Finally the end of the tree will be reached. The search
    // is completed.
    constructor() {
        this.isTippSearch = false;
        this.myStepper = new StepperOnGrid();
        sudoApp.mySolver.myGrid.clearAutoExecCellInfos();
        sudoApp.mySolver.myGrid.deselect();
        this.myStepper.init();
        // 
        this.myFirstSolution = [];
        this.myNumberOfSolutions = 0;
        this.isCompletedNow = false;
    }
    isCompleted() {
        return this.isCompletedNow;
    }

    setCompleted() {
        this.isCompletedNow = true;
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
    getSolution() {
        return this.myFirstSolution;
    }
    getBackTracks() {
        if (this.getLevel() == 'Sehr schwer') {
            return this.myStepper.countBackwards;
        } else {
            return '-';
        }
    }

    getLevel() {
        if (this.isCompleted() && this.getNumberOfSolutions() == 0) {
            return 'Unlösbar';
        } else if (this.isCompleted() && this.getNumberOfSolutions() > 1) {
            return 'Extrem schwer';
        } else if (this.isCompleted()
            && this.myStepper.maxSelectionDifficulty == 'Leicht'
            && sudoApp.mySolver.myGrid.canTakeBackGivenCells()) {
            return 'Sehr leicht';
        } else {
            return this.myStepper.maxSelectionDifficulty;
        }
    }

    performStep() {
        // The previous step result is undefined or 'inProgress'
        // Make the grid selection equal to the stepper selection
        if (this.myStepper.indexSelected !== sudoApp.mySolver.myGrid.indexSelected
            && this.myStepper.indexSelected !== -1) {
            sudoApp.mySolver.myGrid.select(this.myStepper.indexSelected);
        }
        // perform the next automated step
        this.searchStepResult = this.myStepper.autoStep().processResult;
        if (this.searchStepResult == 'solutionDiscovered') {
            this.incrementNumberOfSolutions();
            if (this.getNumberOfSolutions() == 1) {
                // Fair puuzles have exact one solution.
                // This is the first solution in the search.
                this.myFirstSolution = sudoApp.mySolver.getSolutionFromGrid();
            }
            let nr = this.getNumberOfSolutions();
            sudoApp.mySolver.notifyAspect('nrOfSolutions', nr);
            sudoApp.breakpointPassed('solutionDiscovered');
            // Prepare the search for further solutions in the next steps
            // by changing the stepper direction to 'backward'.
            this.myStepper.setAutoDirection('backward');
        } else if (this.searchStepResult == 'searchCompleted') {
            sudoApp.mySolver.myGrid.backTracks = this.countBackwards;
            sudoApp.breakpointPassed('searchCompleted');
            this.setCompleted();
            sudoApp.mySolver.myGrid.deselect();
            sudoApp.mySolver.notifyAspect('searchIsCompleted',
                this.getNumberOfSolutions());
        }
    }

    cleanUp() {
        sudoApp.mySolver.myGrid.clearAutoExecCellInfos();
        this.myStepper = undefined;
    }
}

class StepperOnGrid {
    // A temporary stepper for automatic execution is created for the Sudoku matrix.
    // Each new automatic execution takes place with a new stepper.
    // The stepper performs elementary forward or backward steps.
    // A forward step is a pair of actions (select cell, set number),
    // a backward step is a pair (select cell, reset set number)

    constructor() {
        this.lastNumberSet = '0';
        this.indexSelected = -1;
        this.numberOfSolutions = 0;
        this.myBackTracker;
        this.goneSteps = 0;
        this.maxSelectionDifficulty = 'Leicht';
        this.countBackwards = 0;
        this.autoDirection = 'forward';
        this.init();
    }

    init() {
        this.lastNumberSet = '0';
        this.countBackwards = 0;
        this.autoDirection = 'forward';
        this.maxSelectionDifficulty = 'Leicht';
        // The stepper always owns an actual backTracker
        this.myBackTracker = new BackTracker();
    }

    getAutoDirection() {
        return this.autoDirection;
    }

    setAutoDirection(direction) {
        this.autoDirection = direction;
    }

    // =============================================================
    // Other methods
    // =============================================================

    select(index) {
        this.indexSelected = index;
        sudoApp.mySolver.myGrid.select(index);
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
                // Create a new step with the number of the next option
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
            sudoApp.mySolver.myGrid.unsetStepLazy();
            this.lastNumberSet = currentStep.getValue();
            this.goneSteps++;
            // If the numbering leads to insolvability
            // the solver must go back
            if (sudoApp.mySolver.myGrid.isUnsolvable()) {
                this.setAutoDirection('backward');
                this.countBackwards++;
                let autoStepResult = {
                    processResult: 'inProgress',
                    action: tmpAction
                }
                sudoApp.breakpointPassed('contradiction');
                return autoStepResult;
            } else if (sudoApp.mySolver.myGrid.isFinished()) {
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
        sudoApp.mySolver.myGrid.atCurrentSelectionSetAutoNumber(step);
        let tmpAction = {
            operation: 'setNr',
            cellIndex: step.myCellIndex,
            cellValue: step.myCellValue
        }
        this.deselect();
        return tmpAction;
    }

    deleteSelected(phase) {
        sudoApp.mySolver.myGrid.deleteSelected(phase);
        sudoApp.mySolver.myGrid.unsetStepLazy();
        this.deselect();
    }

    deselect() {
        sudoApp.mySolver.myGrid.deselect();
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
            if (sudoApp.mySolver.myGrid.sudoCells[currentStep.getCellIndex()].getValue() !== '0') {
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
        // Calculates the next selection. Not unique;        
        // These are usually cells with 2 option numbers.
        let maxSelection = selectionList[0];
        let maxIndex = maxSelection.index;
        let maxWeight = sudoApp.mySolver.myGrid.sudoCells[maxIndex].countMyInfluencersWeight();
        // Contexts with a greater degree of decision, 
        // i.e. with fewer permissible numbers, count more.
        for (let i = 1; i < selectionList.length; i++) {
            let currentSelection = selectionList[i];
            let currentIndex = currentSelection.index;
            let currentWeight = sudoApp.mySolver.myGrid.sudoCells[currentIndex].countMyInfluencersWeight();
            if (currentWeight > maxWeight) {
                maxSelection = currentSelection;
                maxIndex = currentIndex;
                maxWeight = currentWeight;
            }
        }
        return maxSelection;
    }

    calculateNeccesarySelectionFrom(selectionList) {
        // Calculates selection of cells that contain a required number.
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
            // If there are no cells with required numbers
            return emptySelection;
        }
    }

    calculateLevel_0_SinglesSelectionFrom(selectionList) {
        // Calculates selection of cells that contain a level_0_single.
        for (let i = 0; i < selectionList.length; i++) {
            if (selectionList[i].level_0_singles.length > 0) {
                return selectionList[i];
            }
        }
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
        // Calculates selection of cells that contain exactly one number.
        for (let i = 0; i < selectionList.length; i++) {
            if (selectionList[i].necessaryOnes.length == 0 &&
                selectionList[i].options.length == 1) {
                return selectionList[i];
            }
        }
        let emptySelection = {
            index: -1,
            options: [],
            necessaryOnes: [],
            level_0_singles: []
        }
        return emptySelection;
    }

    getOptionalSelections() {
        let selectionList = [];
        for (let i = 0; i < 81; i++) {
            if (sudoApp.mySolver.myGrid.sudoCells[i].getValue() == '0') {
                let selection = {
                    index: i,
                    options: Array.from(sudoApp.mySolver.myGrid.sudoCells[i].getTotalCandidates()),
                    necessaryOnes: Array.from(sudoApp.mySolver.myGrid.sudoCells[i].getNecessarys()),
                    level_0_singles: Array.from(sudoApp.mySolver.myGrid.sudoCells[i].getSingles())
                }
                selectionList.push(selection);
            }
        }
        // If all cells are set, this list is empty
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
        // {'Leicht','Mittel','Schwer','Sehr schwer'}.
        // Hint: do not confuse puzzle level with maxSelectionDifficulty.
        // The puzzle level has two more values:'Sehr leicht' and 'Extrem schwer'.
        let tmpNeccessary = this.calculateNeccesarySelectionFrom(optionList);
        if (tmpNeccessary.index !== -1) {
            return tmpNeccessary;
        }
        // Determines the next cell with single
        let tmpLevel_0_single = this.calculateLevel_0_SinglesSelectionFrom(optionList);
        if (tmpLevel_0_single.index !== -1) {
            switch (this.maxSelectionDifficulty) {
                case 'Leicht': {
                    this.maxSelectionDifficulty = 'Mittel';
                    break;
                }
                default: {
                    // Difficulty level remains unchanged.
                }
            }
            return tmpLevel_0_single;
        }

        // Determines the next cell with hidden single, i.e.
        // using indirectly invalid numbers
        let oneOption = this.calculateOneOptionSelectionFrom(optionList);
        if (oneOption.index !== -1) {
            switch (this.maxSelectionDifficulty) {
                case 'Leicht':
                case 'Mittel': {
                    this.maxSelectionDifficulty = 'Schwer';
                    break;
                }
                default: {
                    // Difficulty level remains unchanged.
                }
            }
            return oneOption;
        }

        let tmpMin = this.calculateMinSelectionFrom(optionList);
        // If there are no required numbers:
        // Determine a next cell with minimum number of allowed numbers
        // This cell is not unique
        // This cell can be one with the full option set
        switch (this.maxSelectionDifficulty) {
            case 'Leicht':
            case 'Mittel':
            case 'Schwer': {
                this.maxSelectionDifficulty = 'Sehr schwer';
                break;
            }
            default: {
                // Difficulty level remains unchanged.
            }
        }
        return tmpMin;
    }

    deadlockReached() {
        return sudoApp.mySolver.myGrid.isUnsolvable();
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
        // The option step is located in an option path
        this.myOwnerPath = ownerPath;
        // The BackTrackOptionStep points to a grid cell
        this.myCellIndex = cellIndex;
        // The BackTrackOptionStep saves the option numbers of the step
        this.myOptionList = optionList.slice();
        // The option list is processed using pop operations.
        // So that the normal (FIFO) sequence of processing is still realised,
        // the list is reversed.
        this.myNextOptions = optionList.slice().reverse();
        // The OptonStep has a separate BackTrackOptionPath for each option
        if (optionList.length == 1) {
            // Then there can only be one path, and this is created immediately.
            // Only the option step at the root has only one option, a pseudo-option.
            // Later, there are no single-element option lists.
            // Because you only have to select an option if there are at least 2 options to choose from.
            this.myOwnerPath = new BackTrackOptionPath(optionList[0], this)
        }
    }
    getCell() {
        return sudoApp.mySolver.myGrid.sudoCells[this.myCellIndex];
    }
    isOpen(nr) {
        // The number nr is open if it has not yet been tried,
        // i.e. it is still in the NextOption list
        for (let i = 0; i < this.myNextOptions.length; i++) {
            if (this.myNextOptions[i] == nr) {
                return true;
            }
        }
        return false;
    }
    options() {
        // The options of the option step
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
        // The BackTrackOptionStep is finished when all its paths are finished
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
        // The real step is located in an option path
        this.myOwnerPath = ownerPath;
        // The step points to sudoku cell
        this.myStepsIndex = stepIndex;
        this.myCellIndex = cellIndex;
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
    // A BackTrackOptionPath essentially consists of two elements:
    // 1. the number (option) for which the path is made.
    // 2. a sequence of BackTrackRealSteps
    // 3. the last step is an OptonStep, if not previously defined
    // a success or unsolvability has not occurred before.
    constructor(value, ownerStep) {
        // The number for which this path is created
        this.myValue = value;
        // The step sequence consisting exclusively of real steps
        this.myBackTrackRealSteps = [];
        //Other auxiliary attributes
        this.myLastBackTrackOptionStep; // The end of this path
        this.myOwnerStep = ownerStep; // The option step that owns this path
    }
    options(currentIndex) {
        let tmpOptions = [];
        if (currentIndex > 0) {
            // Only one option in the middle of the path
            let tmpOption = {
                value: this.myBackTrackRealSteps[currentIndex].getValue(),
                open: false
            }
            tmpOptions.push(tmpOption);
        } else {
            // The first step in the path
            if (this.myValue == '0') {
                // The root path
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
            // I am the root path
            return 0;
        } else {
            return this.myOwnerStep.getDepth();
        }
    }
    isFinished() {
        return (!(this.myLastBackTrackOptionStep == null));
    }

    addBackTrackRealStep(cellIndex, cellValue) {
        // The new real step is created in this path
        let realStep = new BackTrackRealStep(this, this.myBackTrackRealSteps.length, cellIndex, cellValue);
        this.myBackTrackRealSteps.push(realStep);
        return realStep;
    }

    addBackTrackOptionStep(cellIndex, optionList) {
        // The new option step is created in this path
        this.myLastBackTrackOptionStep = new BackTrackOptionStep(this, cellIndex, optionList);
        // This concludes this path. It can only continue in its sub-paths
        return this.myLastBackTrackOptionStep;
    }

    getValue() {
        return this.myValue;
    }

    previousFromBackTrackRealStep(currentIndex) {
        // Backwards from BackTrackRealStep
        if (currentIndex == 0) {
            return this.myOwnerStep;
        } else {
            // the previous step is in this path
            return this.myBackTrackRealSteps[currentIndex - 1];
        }
    }
    previousFromBackTrackOptionStep() {
        // Backwards from BackTrackOptionStep
        // It can happen that the realStep sequence is empty
        if (this.myBackTrackRealSteps.length == 0) {
            return this.myOwnerStep;
        } else
            return this.myBackTrackRealSteps[this.myBackTrackRealSteps.length - 1];
    }
}

class PreRunRecord {
    constructor() { };
    static nullPreRunRecord() {
        return {
            level: 'Keine Angabe',
            backTracks: 0,
            countSolutions: 0,
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
    // Puzzle is an object-wrapper for PuzzleRecords
    constructor(puzzleRecord) {
        this.myRecord = puzzleRecord;
    }

    setIdentity(identity) {
        this.myRecord.id = identity.id;
        this.myRecord.name = identity.name;
        this.myRecord.date = identity.date;
    }
    getIdentity() {
        return {
            id: this.myRecord.id,
            name: this.myRecord.name,
            date: this.myRecord.date
        }
    }

    setSolution(solution) {
        this.myRecord.preRunRecord.solvedPuzzle = solution;
    }
    getSolution() {
        return this.myRecord.preRunRecord.solvedPuzzle;
    }
    setBacktracks(nr) {
        this.myRecord.preRunRecord.backTracks = nr;
    }

    getBacktracks() {
        return this.myRecord.preRunRecord.backTracks;
    }

    setLevel(level) {
        this.myRecord.preRunRecord.level = level;
    }
    getLevel() {
        return this.myRecord.preRunRecord.level;
    }
    getPreRunRecord() {
        return JSON.parse(JSON.stringify(this.myRecord.preRunRecord));
    }
    getNumberOfSolutions() {
        return this.myRecord.preRunRecord.countSolutions;
    }
    setNumberOfSolutions(nr) {
        this.myRecord.preRunRecord.countSolutions = nr;
    }
}
// ==========================================
// Grid related classes 
// ==========================================

class SudokuGroup {
    // Abstract class whose concrete instances are
    // are a block, column or row of the table
    constructor(cells) {
        this.myCells = cells;
        this.myPairInfos = [];
    }

    getMyCells() {
        return this.myCells;
    }

    clear() {
        this.clearEvaluations();
    }

    clearEvaluations() {
        this.myPairInfos = [];
    }


    isUnsolvable() {
        // If there is a group with Conflicting Singles, the Sudoku is unsolvable.
        // If there is a group in which not all numbers appear.
        // If there is a group in which the same number is required several times.
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
                // We only consider open cells
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
            // Once we have found the first conflict, we can cancel the search.
      if (found) return intNecessary;
        }
        return -1;
    }

    withMissingNumber() {
        let myNumbers = new MatheSet();
        this.myCells.forEach(cell => {
            if (cell.getValue() == '0') {
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
        // Calculates sub-pairs in the group. These are
        // cells that contain at least 2 numbers and
        // two cells contain the same pair subset and
        // all other cells do not contain any of the pair numbers.

        // Idea: Count the frequency of occurrence for each number 1 .. 9
        // numberCounts[0] = frequency of 1, or the indices of the occurrences of 1
        // numberCounts[1] = frequency of 2, or the indices of the occurrence of 2
        // etc.

        this.numberCounts = [];
        this.twinPosition = [];
        this.hiddenPairs = [];
        for (let i = 0; i < 9; i++) {
            // An empty index list for each of the 9 numbers
            this.numberCounts.push([]);
            // An empty twin number list for each position in the group
            this.twinPosition.push([]);
        }
        // Iterate over the group
        for (let i = 0; i < 9; i++) {
            if (this.myCells[i].getValue() == '0') {
                let permNumbers = this.myCells[i].getTotalCandidates();
                permNumbers.forEach(nr => {
                    let iNr = parseInt(nr);
                    // Save the indices of their occurrence for each number
                    this.numberCounts[iNr - 1].push(i);
                })
            }
        }
        // Evaluate NumberCounts for pairs
        // Determine numbers that occur exactly 2 times
        // Iterate over the numbers
        for (let i = 0; i < 9; i++) {
            if (this.numberCounts[i].length == 2) {
                // A number for which there are 2 indices,
                // i.e. it exists twice in the collection.
                // Store the two positions for each twin number in twinPosition.
                this.twinPosition[this.numberCounts[i][0]].push(i + 1);
                this.twinPosition[this.numberCounts[i][1]].push(i + 1);
            }
        }
        // A sub-pair exists if
        // there are exactly 2 numbers at a twin position and
        // the same two numbers are present a second time at a second position.
        // Return: Number pairs with 2 positions each. Empty if necessary

        // There can be several pairs
        let tmpSubPairs = [];
        for (let i = 0; i < 9; i++) {
            if (this.twinPosition[i].length == 2) {
                // There are two twin numbers at this position
                // Check all started pairs
                let hiddenPairFound = false;
                for (let k = 0; k < tmpSubPairs.length; k++) {
                    let tmpSubPair = tmpSubPairs[k];
                    if (tmpSubPair.nr1 == this.twinPosition[i][0].toString() &&
                        tmpSubPair.nr2 == this.twinPosition[i][1].toString()) {
                        // Match with a started pair
                        tmpSubPair.pos2 = i;
                        // The pair is complete
                        this.hiddenPairs.push(tmpSubPair);
                        hiddenPairFound = true;
                    }
                }
                if (!hiddenPairFound) {
                    // No match with a started pair
                    // A new pair is started.
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
        // cells that contain exactly one pair and
        // two cells contain the same pair
        this.myPairInfos = [];
        // Iterate over the group
        for (let i = 0; i < 9; i++) {
            if (this.myCells[i].getValue() == '0') {
                let tmpCandidates = this.myCells[i].getTotalCandidates()
                if (tmpCandidates.size == 2) {
                    // Save info about the pair
                    let currentPair = new MatheSet(tmpCandidates);
                    // Check whether the pair is already in the pair info list
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
                                // The pair already exists in the info list
                                this.myPairInfos[j].pairIndices.push(this.myCells[i].getIndex());
                                pairInfoStored = true;
                            } else {
                                if (j == this.myPairInfos.length - 1) {
                                    // The pair does not exist and is now inserted
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
            // Clean up first pair cell
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

            // Clean up second pair cell
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
                    // Only admissible ones can become inadmissible.
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
                                        pairCell1: sudoApp.mySolver.myGrid.sudoCells[this.myPairInfos[i].pairIndices[0]],
                                        pairCell2: sudoApp.mySolver.myGrid.sudoCells[this.myPairInfos[i].pairIndices[1]]
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
                        // let tmpRow = necessaryCell.myRow;
                        // let tmpCol = necessaryCell.myCol;
                        let tmpRow = sudoApp.mySolver.myGrid.sudoRows[IndexCalculator.rowIndex(necessaryCell.myIndex)];
                        let tmpCol = sudoApp.mySolver.myGrid.sudoCols[IndexCalculator.colIndex(necessaryCell.myIndex)];
                        inAdmissiblesAdded = inAdmissiblesAdded || tmpRow.derive_inAdmissiblesFromNecessarys(necessaryCell, i.toString());
                        inAdmissiblesAdded = inAdmissiblesAdded || tmpCol.derive_inAdmissiblesFromNecessarys(necessaryCell, i.toString());
                    } else if (this instanceof SudokuRow) {
                        // let tmpBlock = necessaryCell.myBlock;
                        // let tmpCol = necessaryCell.myCol;
                        let tmpBlock = sudoApp.mySolver.myGrid.sudoBlocks[IndexCalculator.blockIndex(necessaryCell.myIndex)];
                        let tmpCol = sudoApp.mySolver.myGrid.sudoCols[IndexCalculator.colIndex(necessaryCell.myIndex)];
                        inAdmissiblesAdded = inAdmissiblesAdded || tmpBlock.derive_inAdmissiblesFromNecessarys(necessaryCell, i.toString());
                        inAdmissiblesAdded = inAdmissiblesAdded || tmpCol.derive_inAdmissiblesFromNecessarys(necessaryCell, i.toString());
                    } else if (this instanceof SudokuCol) {
                        // let tmpRow = necessaryCell.myRow;
                        // let tmpBlock = necessaryCell.myBlock;
                        let tmpRow = sudoApp.mySolver.myGrid.sudoRows[IndexCalculator.rowIndex(necessaryCell.myIndex)];
                        let tmpBlock = sudoApp.mySolver.myGrid.sudoBlocks[IndexCalculator.blockIndex(necessaryCell.myIndex)];
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
    constructor(blockIndex) {
        let tmpCells = [];
        for (let i = 0; i < 9; i++) {
            tmpCells.push(sudoApp.mySolver.myGrid.sudoCells[IndexCalculator.getCellIndexBlock(blockIndex, i)]);
        }
        super(tmpCells);
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
        return sudoApp.mySolver.myGrid.getCellAt(this.myOrigin.row + row, this.myOrigin.col + col);
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
class SudokuRow extends SudokuGroup {
    constructor(rowIndex) {
        let myCells = [];
        for (let i = 0; i < 9; i++) {
            myCells.push(sudoApp.mySolver.myGrid.sudoCells[IndexCalculator.getCellIndexRow(rowIndex, i)]);
        }
        super(myCells);
        this.myIndex = rowIndex;
    }
}

class SudokuCol extends SudokuGroup {
    constructor(colIndex) {
        let myCells = [];
        for (let i = 0; i < 9; i++) {
            myCells.push(sudoApp.mySolver.myGrid.sudoCells[IndexCalculator.getCellIndexCol(colIndex, i)]);
        }
        super(myCells);
        this.myColIndex = colIndex;
    }
}

class SudokuGrid {
    // Speichert die Sudokuzellen in der Wrapper-Version
    constructor() {
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
        // im lazy mode angezeigt. Siehe Tipp-Taste.
        this.stepLazy = false;
    }

    init() {
        this.sudoCells = [];
        this.sudoBlocks = [];
        this.sudoRows = [];
        this.sudoCols = [];

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

    logGrid(comment) {
        //Für den Test
        let k = 0;
        console.log(comment);
        let tmp = 0;
        let mes = '';
        for (let i = 0; i < 9; i++) {
            k = i * 9;
            mes = '';
            tmp = this.sudoCells[k + 0].getValue();
            if (tmp == 0) {
                mes = mes + ' _';
            } else {
                mes = mes + ' ' + tmp;
            }
            tmp = this.sudoCells[k + 1].getValue();
            if (tmp == 0) {
                mes = mes + ' _';
            } else {
                mes = mes + ' ' + tmp;
            }
            tmp = this.sudoCells[k + 2].getValue();
            if (tmp == 0) {
                mes = mes + ' _';
            } else {
                mes = mes + ' ' + tmp;
            }
            tmp = this.sudoCells[k + 3].getValue();
            if (tmp == 0) {
                mes = mes + ' _';
            } else {
                mes = mes + ' ' + tmp;
            }
            tmp = this.sudoCells[k + 4].getValue();
            if (tmp == 0) {
                mes = mes + ' _';
            } else {
                mes = mes + ' ' + tmp;
            }
            tmp = this.sudoCells[k + 5].getValue();
            if (tmp == 0) {
                mes = mes + ' _';
            } else {
                mes = mes + ' ' + tmp;
            }
            tmp = this.sudoCells[k + 6].getValue();
            if (tmp == 0) {
                mes = mes + ' _';
            } else {
                mes = mes + ' ' + tmp;
            }
            tmp = this.sudoCells[k + 7].getValue();
            if (tmp == 0) {
                mes = mes + ' _';
            } else {
                mes = mes + ' ' + tmp;
            }
            tmp = this.sudoCells[k + 8].getValue();
            if (tmp == 0) {
                mes = mes + ' _';
            } else {
                mes = mes + ' ' + tmp;
            }
            console.log(mes);
        }
        console.log('\n');
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

    /*
    puzzleSolved() {
        for (let i = 0; i < 81; i++) {
            if (this.sudoCells[i].getValue() == '0') {
                return false;
            }
        }
        return true;
    }
        */

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

    isNotPartiallySolved() {
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
        if (sudoApp.mySolver.currentEvalType == 'lazy-invisible') this.evaluateGridLazy();
        if (sudoApp.mySolver.currentEvalType == 'lazy') this.evaluateGridLazy();
        if (sudoApp.mySolver.currentEvalType == 'strict-plus'
            || sudoApp.mySolver.currentEvalType == 'strict-minus') this.evaluateGridStrict();
    }

    clearAutoExecCellInfos() {
        for (let i = 0; i < 81; i++) {
            this.sudoCells[i].clearAutoExecInfo();
        }
    }

    reset() {
        // All numbers set in the 'play' phase are deleted
        // The given cells are retained
        // Step 1: The current selection is reset
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
                // this.logGrid(i + ': grid before takeBACK cell');
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
                } else if (this.sudoCells[k].getTotalCandidates().size > 1) {
                    // Deleting the cell is ok because the deleted cell 
                    // has a unique candidate. 

                    let options = this.sudoCells[k].getTotalCandidates();
                    options.delete(tmpNr);
                    // const [alternativeOption] = options;

                    if (options.size > 0 && this.unsolvableAll(options, k)) {
                        // Deleting the cell is ok because all alternative option
                        // are contradictory. 
                    } else {
                        // undo the alternative options
                        this.select(k);
                        this.sudoCells[k].manualSetValue(tmpNr, 'define');
                    }
                } else {
                    // The deleted cell does not have a unique candidate to be selected
                    // The deletion is therefore cancelled.
                    this.select(k);
                    this.sudoCells[k].manualSetValue(tmpNr, 'define');
                }
            }
        }
        // this.evaluateGridStrict();
    }

    unsolvableAll(options, k) {
        for (const alternativeOption of options) {
            this.select(k);
            this.sudoCells[k].manualSetValue(alternativeOption, 'define');
            this.evaluateGridStrict();
            if (this.isUnsolvable()) {

                // Die aktuelle Option ist unlösbar
                // Nothing to do
                this.select(k);
                this.deleteSelected('define');
            } else {
                // Die aktuelle Option ist lösbar. Das bedeutet, 
                // dass in der Optionenmenge keine eindeutige
                // Selektion möglich ist.
                this.select(k);
                this.deleteSelected('define');
                return false;
            }
        }
        this.select(k);
        this.deleteSelected('define');
        return true;
    }

    canTakeBackGivenCells() {
        // A non-minimal simple puzzle is called very simple.
        // This means that if there is a cell whose solution 
        // remains unique when deleted, then the puzzle is very simple.
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
                    this.select(k);
                    this.sudoCells[k].manualSetValue(tmpNr, 'define');
                    return true;
                }
                else if (this.sudoCells[k].getTotalCandidates().size == 1) {
                    // Deleting the cell is ok because the deleted cell 
                    // has a unique given.
                    this.select(k);
                    this.sudoCells[k].manualSetValue(tmpNr, 'define');
                    return true;
                } else {
                    // The deleted cell does not have a provable 
                    // unique number to be selected. Please note:
                    // This means that it cannot be ruled out that the deleted cell 
                    // has a unique solution after all. However, we cannot prove this 
                    // with the implemented criteria. We treat this case 
                    // as if the deleted cell did not have a unique solution.
                    // The deletion is therefore cancelled.
                    this.select(k);
                    this.sudoCells[k].manualSetValue(tmpNr, 'define');
                }
            }
        }
        return false;
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
        // Loading puzzle from puzzle array, 
        // possibly already partially solved
        for (let i = 0; i < 81; i++) {
            let tmpCellValue = pa[i].cellValue;
            let tmpCellPhase = pa[i].cellPhase;
            this.sudoCells[i].manualSetValue(tmpCellValue, tmpCellPhase);
        }
    }

    loadPuzzleArrayGivens(pa) {
        // Loading puzzle from puzzle array, the definition only
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
        // Loading puzzle from simple puzzle array.
        // A simple puzzle array does not distinguish 
        // between given and solved cells
        for (let i = 0; i < 81; i++) {
            if (pa[i] == '0') {
                this.sudoCells[i].manualSetValue(pa[i], '');
            } else {
                this.sudoCells[i].manualSetValue(pa[i], 'define');
            }
        }
    }

    loadPuzzleRecord(puzzleRecordToLoad) {
        //  Loading puzzle from puzzle record
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
    }
    upIndex(index) {
        if (index < 9) { return index; } else { return (index - 9); }
    }
    downIndex(index) {
        if (index > 71) { return index } else { return (index + 9) };
    }
    leftIndex(index) {
        if ((index % 9) > 0) { return index - 1; } else { return index; }
    }
    rightIndex(index) {
        if ((index + 1) % 9 == 0) { return index } else { return (index + 1) };
    }



    createSudoGrid() {
        // Die 81 Zellen anlegen
        for (let i = 0; i < 81; i++) {
            let cell = new SudokuCell(i);
            this.sudoCells.push(cell);
        }
        // Die 9 Blöcke anlegen
        for (let i = 0; i < 9; i++) {
            let block = new SudokuBlock(i);
            this.sudoBlocks.push(block);
        }
        // Setze die Row-Col-Vektoren
        for (let i = 0; i < 9; i++) {
            let col = new SudokuCol(i);
            this.sudoCols.push(col);
        }
        for (let i = 0; i < 9; i++) {
            let row = new SudokuRow(i);
            this.sudoRows.push(row);
        }
        // Row- und Col-Vektoren in den Blöcken anlegen
        for (let i = 0; i < 9; i++) {
            this.sudoBlocks[i].addBlockVectors();
        }
        // Influencers in den Zellen setzen
        // Das geschieht nur einmal bei der Initialisierung
        for (let i = 0; i < 81; i++) {
            this.sudoCells[i].setInfluencers(this.influencersOfCell(i));
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

        // Iterate over the 3 cells of the block column
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

        // Iterate over the 9 blocks of the matrix
        for (let i = 0; i < 9; i++) {
            tmpBlock = this.sudoBlocks[i];

            // Iterate over the row vectors
            for (let row = 0; row < 3; row++) {
                let pointingNrs = tmpBlock.myRowVectors[row].getPointingNrs();
                pointingNrs.forEach(pointingNr => {
                    let newInAdmissiblesAdded = this.eliminatePointingNrInGridRow(pointingNr, tmpBlock.myRowVectors[row], tmpBlock.myOrigin.row + row);
                    inAdmissiblesAdded = inAdmissiblesAdded || newInAdmissiblesAdded;
                })
            }

            // Iterate over the column vectors
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

        // Iterate over the cells in the row
        for (let col = 0; col < 9; col++) {
            if (col < blockOriginCol || col > (blockOriginCol + 2)) {
                // col nicht im Pointing Vector
                let tmpCell = this.getCellAt(rowIndex, col);
                if (tmpCell.getValue() == '0') {
                    // The cell is unset
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

        // Iterate over the cells in the column
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

class SudokuCell {
    constructor(index) {
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
        this.myAutoStepNumber = sudoApp.mySolver.myGrid.numberOfNonEmptyCells() - sudoApp.mySolver.myGrid.numberOfGivens();
    }

    autoSetValue(currentStep) {
        let nr = currentStep.getValue();
        this.myValue = nr;
        this.myValueType = 'auto';
        this.myGamePhase = 'play';
        this.myAutoStepNumber = sudoApp.mySolver.myGrid.numberOfNonEmptyCells() - sudoApp.mySolver.myGrid.numberOfGivens();
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
        if (sudoApp.mySolver.currentEvalType == 'lazy-invisible'
            || sudoApp.mySolver.currentEvalType == 'lazy')
            return (
                // 1) The number has already been set once.
                (this.getValue() !== '0' && this.myDirectInAdmissibles().has(this.getValue())) ||
                // 2) No more admissible candidates at all
                (this.getValue() == '0' && this.getCandidates().size == 0) ||
                // 3) Different numbers required at the same time
                (this.getValue() == '0' && this.myNecessarys.size > 1));

        else if (sudoApp.mySolver.currentEvalType == 'strict-plus'
            || sudoApp.mySolver.currentEvalType == 'strict-minus')
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

class NewPuzzleBuffer {
    // This is a store of new puzzles. For each difficulty it stores
    // 2 puzzles in advance, such that a request for a new puzzle
    // can be served without delay. 
    // During the initiation of the solver the puzzles in the store 
    // are generated by web-workers in the background.
    constructor() {
        this.myVerySimplePuzzles = [];
        this.mySimplePuzzles = [];
        this.myMediumPuzzles = [];
        this.myHeavyPuzzles = [];
        this.myVeryHeavyPuzzles = [];
        this.myExtremeHeavyPuzzles = [];

        this.webworkerGenerator_1 = null;
        this.webworkerGenerator_2 = null;
        this.webworkerGenerator_3 = null;
        this.webworkerGenerator_4 = null;
        this.webworkerGenerator_5 = null;
        this.webworkerGenerator_6 = null;

        this.webworkerGeneratorStopRequested = false;
    }

    init() {
        // this.myPuzzleRequests = [];

        this.myVerySimplePuzzles = [];
        this.mySimplePuzzles = [];
        this.myMediumPuzzles = [];
        this.myHeavyPuzzles = [];
        this.myVeryHeavyPuzzles = [];
        this.myExtremeHeavyPuzzles = [];

        this.webworkerGeneratorStopRequested = false;
        this.startWebworkerGenerator();
    }

    logPuzzleStore(head) {
        let logActive = true;
        if (logActive) {
            //console.log('this.webworkerGeneratorStopRequested == ' + this.webworkerGeneratorStopRequested);
            console.log('=========== ' + head + ' =============');
            console.log('myVerySimplePuzzles__: ' + this.myVerySimplePuzzles.length);
            console.log('mySimplePuzzles______: ' + this.mySimplePuzzles.length);
            console.log('myMediumPuzzles______: ' + this.myMediumPuzzles.length);
            console.log('myHeavyPuzzles_______: ' + this.myHeavyPuzzles.length);
            console.log('myVeryHeavyPuzzles___: ' + this.myVeryHeavyPuzzles.length);
            console.log('myExtremeHeavyPuzzles: ' + this.myExtremeHeavyPuzzles.length);
        }
    }


    getPuzzle(level) {
        let puzzleRecord = undefined;
        switch (level) {
            case 'Sehr leicht': {
                if (this.myVerySimplePuzzles.length > 0) {
                    puzzleRecord = this.myVerySimplePuzzles.pop();
                }
                break;
            }
            case 'Leicht': {
                if (this.mySimplePuzzles.length > 0) {
                    puzzleRecord = this.mySimplePuzzles.pop();
                }
                break;
            }
            case 'Mittel': {
                if (this.myMediumPuzzles.length > 0) {
                    puzzleRecord = this.myMediumPuzzles.pop();
                }
                break;
            }
            case 'Schwer': {
                if (this.myHeavyPuzzles.length > 0) {
                    puzzleRecord = this.myHeavyPuzzles.pop();
                }
                break;
            }
            case 'Sehr schwer': {
                if (this.myVeryHeavyPuzzles.length > 0) {
                    puzzleRecord = this.myVeryHeavyPuzzles.pop();
                }
                break;
            }
            case 'Extrem schwer': {
                if (this.myExtremeHeavyPuzzles.length > 0) {
                    puzzleRecord = this.myExtremeHeavyPuzzles.pop();
                }
                break;
            }
            default: {
                throw new Error('Unexpected difficulty: '
                    + level);
            }
        };
        if (this.needsToBeFilledup()) {
            if (sudoApp.myNewPuzzleBuffer.webworkerGeneratorStopRequested) {
                // If StopRequested the generators are going to be stopped 
                // or are already stopped.
                // if they are not stopped no additional workers should be started.
                this.startWebworkerGenerator();
            }
        }
        // this.logPuzzleStore('pop')
        return puzzleRecord;
    }


    isFilled() {
        return (
            this.myExtremeHeavyPuzzles.length > 0
            && this.myVerySimplePuzzles.length > 0
            && this.mySimplePuzzles.length > 0
            && this.myMediumPuzzles.length > 0
            && this.myHeavyPuzzles.length > 0
            && this.myVeryHeavyPuzzles.length > 0
        );
    }

    needsToBeFilledup() {
        return (
            this.myExtremeHeavyPuzzles.length < 1
            || this.myVerySimplePuzzles.length < 1
            || this.mySimplePuzzles.length < 1
            || this.myMediumPuzzles.length < 1
            || this.myHeavyPuzzles.length < 1
            || this.myVeryHeavyPuzzles.length < 1
        );
    }

    onPuzzleGenerated(event) {
        // The puzzle generator worker has sent new puzzle
        let request = JSON.parse(event.data);
        if (request.name == 'puzzleGenerated') {
            try {
                let puzzleRecord = request.value;
                // console.log('--- push ---level---(vorher)    ' + puzzleRecord.preRunRecord.level);
                switch (puzzleRecord.preRunRecord.level) {
                    case 'Sehr leicht': {
                        sudoApp.myNewPuzzleBuffer.myVerySimplePuzzles.push(puzzleRecord);
                        if (sudoApp.myNewPuzzleDlg.myOpen) {
                            sudoApp.myNewPuzzleDlg.upDate();
                        }
                        break;
                    }
                    case 'Leicht': {
                        sudoApp.myNewPuzzleBuffer.mySimplePuzzles.push(puzzleRecord);
                        if (sudoApp.myNewPuzzleDlg.myOpen) {
                            sudoApp.myNewPuzzleDlg.upDate();
                        }
                        break;
                    }
                    case 'Mittel': {
                        sudoApp.myNewPuzzleBuffer.myMediumPuzzles.push(puzzleRecord);
                        if (sudoApp.myNewPuzzleDlg.myOpen) {
                            sudoApp.myNewPuzzleDlg.upDate();
                        }

                        break;
                    }
                    case 'Schwer': {
                        sudoApp.myNewPuzzleBuffer.myHeavyPuzzles.push(puzzleRecord);
                        if (sudoApp.myNewPuzzleDlg.myOpen) {
                            sudoApp.myNewPuzzleDlg.upDate();
                        }

                        break;
                    }
                    case 'Sehr schwer': {
                        sudoApp.myNewPuzzleBuffer.myVeryHeavyPuzzles.push(puzzleRecord);
                        if (sudoApp.myNewPuzzleDlg.myOpen) {
                            sudoApp.myNewPuzzleDlg.upDate();
                        }

                        break;
                    }
                    case 'Extrem schwer': {
                        sudoApp.myNewPuzzleBuffer.myExtremeHeavyPuzzles.push(puzzleRecord);
                        if (sudoApp.myNewPuzzleDlg.myOpen) {
                            sudoApp.myNewPuzzleDlg.upDate();
                        }
                        break;
                    }
                    default: {
                        throw new Error('Unexpected difficulty: '
                            + puzzleRecord.preRunRecord.level);
                    }
                }
                // sudoApp.myNewPuzzleBuffer.logPuzzleStore('--- ' + puzzleRecord.preRunRecord.level + ' ---');
                // console.log('--- push ---level---    ' + puzzleRecord.preRunRecord.level);
                let response = undefined;
                if (sudoApp.myNewPuzzleBuffer.isFilled()) {
                    sudoApp.myNewPuzzleBuffer.webworkerGeneratorStopRequested = true;
                }
                //Trailing messages may not take back the first stop message
                if (sudoApp.myNewPuzzleBuffer.webworkerGeneratorStopRequested) {
                    response = {
                        name: 'stopGeneration',
                        value: ''
                    }
                } else {
                    response = {
                        name: 'proceedGeneration',
                        value: ''
                    }
                }
                if (response == undefined) { console.log('-----> onPuzzleGenerated response == undefined') };
                let str_response = JSON.stringify(response);
                // The serialized puzzle is sent as a message to Main
                // respond on the received port
                event.ports[0].postMessage({ result: str_response });
                event.ports[0].close();
            } catch (event) {
                event.ports[0].postMessage({ error: e });
            }
        }
    }

    startWebworkerGenerator() {
        this.webworkerGenerator_1 = new Worker("./JS/generatorWorker.js");
        console.log('-----> generatorWorker ==> 1 <== neu gestartet.')
        this.webworkerGenerator_1.addEventListener(
            "message",
            this.onPuzzleGenerated,
            false);

        this.webworkerGenerator_2 = new Worker("./JS/generatorWorker.js");
        console.log('-----> generatorWorker ==> 2 <== neu gestartet.')
        this.webworkerGenerator_2.addEventListener(
            "message",
            this.onPuzzleGenerated,
            false);

        this.webworkerGenerator_3 = new Worker("./JS/generatorWorker.js");
        console.log('-----> generatorWorker ==> 3 <== neu gestartet.')
        this.webworkerGenerator_3.addEventListener(
            "message",
            this.onPuzzleGenerated,
            false);
        /*
    this.webworkerGenerator_4 = new Worker("./JS/generatorWorker.js");
    console.log('-----> generatorWorker ==> 4 <== neu gestartet.')
    this.webworkerGenerator_4.addEventListener(
        "message",
        this.onPuzzleGenerated,
        false);

    this.webworkerGenerator_5 = new Worker("./JS/generatorWorker.js");
    console.log('-----> generatorWorker ==> 5 <== neu gestartet.')
    this.webworkerGenerator_5.addEventListener(
        "message",
        this.onPuzzleGenerated,
        false);

    this.webworkerGenerator_6 = new Worker("./JS/generatorWorker.js");
    console.log('-----> generatorWorker ==> 6 <== neu gestartet.')
    this.webworkerGenerator_6.addEventListener(
        "message",
        this.onPuzzleGenerated,
        false);
        */
        sudoApp.myNewPuzzleBuffer.webworkerGeneratorStopRequested = false;

    }

}
// ==========================================
// Solver types 
// ==========================================
class SudokuSolver {
    // The solver is the most important object in this app. 
    // Basically, the solver has three sub-objects:
    //  1) Grid
    //  2) Puzzle
    //  3) Search
    // Initially, only the grid exists. No puzzle has been defined yet 
    // and therefore there can be no solution search for the puzzle.
    constructor() {
        // The 9 x 9 grid. This is the place where 
        // the solution to the puzzle is calculated 
        // by logical reasoning and/or backtracking.
        this.myGrid = new SudokuGrid();
        // There are 3 different app types. In the main app the solver gets attached
        // a solver view. The fast solver app and the generator app do not have a view
        // for their solvers.
        this.mySolverViews = [];
        // A current puzzle is assigned to the grid in the solver. 
        // It stores meta information about the puzzle to be solved.
        // When switching from the Define phase to the Play phase, 
        // a new puzzle is created.
        this.myCurrentPuzzle = undefined;
        // The solver supports the automatic solution search. 
        // A new search is created when the automatic solution search is started.
        // The current status of the search is saved in the search object.
        this.myCurrentSearch = undefined;
        // the solver has two phases, 'play' or 'define'.
        this.currentPhase = 'define';
        // The solver knows the following evaluation methods
        // 'lazy', 'lazy-invisible', 'strict-plus', 'strict-minus' 
        this.currentEvalType = 'lazy-invisible';
    }


    init() {
        this.myGrid.init();
    }

    reInit() {
        this.myGrid.init();
        this.unsetCurrentPuzzle();
        this.cleanUpAndDeleteCurrentSearch();
        this.setGamePhase('define');
    }

    attach(solverView) {
        this.mySolverViews.push(solverView);
    }

    notify() {
        this.mySolverViews.forEach(view => {
            view.upDate();
        });
    }

    notifyAspect(aspect, aspectValue) {
        // Die eigene View anzeigen
        this.mySolverViews.forEach(view => {
            view.upDateAspect(aspect, aspectValue);
        });
    }

    unsetCurrentPuzzle() {
        this.myCurrentPuzzle = undefined;
    }

    setCurrentPuzzle(puzzleRecord) {
        this.myCurrentPuzzle = new Puzzle(puzzleRecord);
    }

    generatePuzzle() {
        // start with the empty grid.
        this.myGrid.init();
        this.setGamePhase('play')

        // Set a random number in a random cell
        let randomCellIndex = Randomizer.getRandomIntInclusive(0, 80);
        this.myGrid.select(randomCellIndex);
        let randomCellContent = Randomizer.getRandomIntInclusive(1, 9).toString();
        this.atCurrentSelectionSetNumber(randomCellContent);

        // Solve this puzzle 
        this.setCurrentSearchNew();
        sudoApp.mySyncRunner.start(sudoApp.mySolver,
            sudoApp.mySolver.performSearchStep);
        let stoppingBreakpoint = sudoApp.mySyncRunner.getMyStoppingBreakpoint();
        if (stoppingBreakpoint == 'solutionDiscovered') {
            // Turn the solved cells into Givens
            this.setSolvedToGiven();
            // Set the puzzle to define mode
            this.setGamePhase('define')
            // Delete numbers in the solution
            // as long as the remaining puzzle remains backtrack-free.
            this.takeBackGivenCells();
            // Save the generated puzzle temporarily
            let puzzleArray = this.myGrid.getPuzzleArray();
            // Determination of the level of difficulty of the generated puzzle 
            // by the automatic solution.

            // 1) Initialize the current puzzle
            this.setGamePhase('play');
            sudoApp.mySolver.setCurrentPuzzle(PuzzleRecord.nullPuzzleRecord())
            // 2) Initialize the current search.
            this.setCurrentSearchNew();
            // 3) solve the puzzle and return metadata results in a preRunRecord
            let preRecGen = this.computePreRunRecord();
            // 4) Compose a complete PuzzleRecord and return it
            let puzzleRecord = PuzzleRecord.nullPuzzleRecord();
            puzzleRecord.id = Date.now().toString(36) + Math.random().toString(36).substr(2);
            puzzleRecord.date = (new Date()).toJSON();
            // Once and for all compute the preRunRecord
            puzzleRecord.puzzle = puzzleArray;
            puzzleRecord.statusGiven = this.myGrid.numberOfGivens();
            puzzleRecord.preRunRecord = preRecGen;
            return puzzleRecord;
        } else {
            throw new Error('Unexpected breakpoint during generation: ' + stoppingBreakpoint)
        }
    }

    // =================================================


    // =================================================
    //            Compute puzzle preRun data
    // =================================================
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

    computePuzzlePreRunData(puzzleArray) {
        // The function of the fastSolverWorker
        // PreRunData for the puzzle given in the parameter puzzleArray

        // Load the puzzle given in the parameter into the grid. 
        // The puzzle may already be partially solved. 
        // Only givens are loaded.
        this.loadPuzzleArrayGivens(puzzleArray);
        this.setGamePhase('Play');
        // 1) Initialize the current puzzle
        sudoApp.mySolver.setCurrentPuzzle(PuzzleRecord.nullPuzzleRecord())
        // 2) Initialize the current search.
        // this.cleanUpAndDeleteCurrentSearch();
        this.setCurrentSearchNew();
        // 3) solve the puzzle and return metadata results in a preRunRecord
        let preRecFast = this.computePreRunRecord();
        return preRecFast;
    }

    logGrid(comment) {
        this.myGrid.logGrid(comment);
    }

    // =================================================

    computePreRunRecord() {
        let preRunRecord = this.computeBasicPreRunRecord();
        if (preRunRecord.level == 'Leicht' && this.canTakeBackGivenCells()) {
            // A non-minimal simple puzzle is called very simple.
            preRunRecord.level = 'Sehr leicht';
        }
        return preRunRecord;
    }

    computeBasicPreRunRecord() {
        // Returns the preRunRecord for the implicit puzzle in the grid,
        // still without 'very easy' level determination

        sudoApp.mySyncRunner.start(sudoApp.mySolver,
            sudoApp.mySolver.performSearchStep);
        let stoppingBreakpoint = sudoApp.mySyncRunner.getMyStoppingBreakpoint();
        if (stoppingBreakpoint == 'solutionDiscovered') {
            // First solution discovered
            // After the first solution proceed
            sudoApp.mySyncRunner.start(sudoApp.mySolver,
                sudoApp.mySolver.performSearchStep);
            stoppingBreakpoint = sudoApp.mySyncRunner.getMyStoppingBreakpoint();
            // This results in another solution or
            // the end of the search has been reached.       
        } else {
            this.myCurrentPuzzle.myRecord.preRunRecord.level = 'Unlösbar';
            this.myCurrentSearch.setCompleted();
        }
        if (stoppingBreakpoint == 'solutionDiscovered') {
            // A second solution was found
            // More than one solution is the key property 
            // of extremely difficult puzzles
            this.myCurrentPuzzle.myRecord.preRunRecord.level = 'Extrem schwer';
        } else if (stoppingBreakpoint == 'searchCompleted') {
            // All properties of the implicit puzzle in the grid
            // are now known and are summarized in the preRunRecord.
            this.myCurrentSearch.setCompleted();
            this.searchInfos2PuzzleRecord();
        } else {
            throw new Error('Unexpected breakpoint in computeBasicPreRunRecord():  2. call:' + stoppingBreakpoint)
        }

        let preRunRecord = this.myCurrentPuzzle.getPreRunRecord();
        return preRunRecord;
    }

    getSolutionFromGrid() {
        let solution = [];
        for (let i = 0; i < 81; i++) {
            solution.push({
                cellValue: this.myGrid.sudoCells[i].getValue(),
                cellPhase: this.myGrid.sudoCells[i].getPhase()
            });
        };
        return solution;
    }

    async calculatePuzzleRecord() {
        let puzzleRecord = PuzzleRecord.nullPuzzleRecord();
        puzzleRecord.id = Date.now().toString(36) + Math.random().toString(36).substr(2);
        puzzleRecord.date = (new Date()).toJSON();
        // Once and for all compute the preRunRecord
        puzzleRecord.puzzle = this.myGrid.getPuzzleArray();
        puzzleRecord.statusGiven = this.myGrid.numberOfGivens();
        puzzleRecord.preRunRecord = await this.calculatedPreRunRecord(puzzleRecord.puzzle);
        return puzzleRecord;
    }

    cleanUpAndDeleteCurrentSearch() {
        if (this.myCurrentSearch !== undefined) {
            this.myCurrentSearch.cleanUp();
            this.myCurrentSearch = undefined;
        }
    }
    setCurrentSearchNew() {
        this.myCurrentSearch = new Search();
    }
    performSearchStep() {
        this.myCurrentSearch.performStep();
    }

    searchInfos2PuzzleRecord() {
        let search = this.myCurrentSearch;
        let puzzle = this.myCurrentPuzzle;
        puzzle.setSolution(search.getSolution());
        puzzle.setNumberOfSolutions(search.getNumberOfSolutions());
        puzzle.setBacktracks(search.getBackTracks());
        puzzle.setLevel(search.getLevel());
    }

    numberOfSolutions2PuzzleRecord() {
        let search = this.myCurrentSearch;
        let puzzle = this.myCurrentPuzzle;
        puzzle.setNumberOfSolutions(search.getNumberOfSolutions());
    }




    performSolutionStep() {
        // Repeat the execution of the step 'performSearchStep()'
        // until the next active BreakPoint is reached.
        sudoApp.mySyncRunner.start(sudoApp.mySolver,
            sudoApp.mySolver.performSearchStep);
        let stoppingBreakpoint = sudoApp.mySyncRunner.getMyStoppingBreakpoint();
        return stoppingBreakpoint;

    }

    isSearching() {
        return this.myCurrentSearch !== undefined;
    }

    isTippSearching() {
        return this.isSearching() && this.myCurrentSearch.isTippSearch;
    }

    isNotPartiallySolved() {
        return this.myGrid.isNotPartiallySolved();
    }

    getAutoDirection() {
        return this.myCurrentSearch.myStepper.autoDirection;
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
    loadPuzzleRecord(puzzleRecord) {
        this.myCurrentSearch = undefined;
        // Load puzzleRecord into the solvers grid
        this.myGrid.loadPuzzleRecord(puzzleRecord);
        this.myGrid.evaluateMatrix();
        // Load puzzleRecord into the solvers current puzzle
        this.setCurrentPuzzle(JSON.parse(JSON.stringify(puzzleRecord)));
        this.setGamePhase('play');
    }

    loadPuzzleArrayGivens(puzzleArray) {
        // Called from FastSolver
        // Loading puzzle from puzzleArray into the grid
        this.myGrid.loadPuzzleArrayGivens(puzzleArray);
        this.myGrid.evaluateMatrix();
        // 
        let puzzleRecord = PuzzleRecord.nullPuzzleRecord();
        //this.grid2puzzleRecord(puzzleRecord);
        puzzleRecord.puzzle = puzzleArray;
        this.setCurrentPuzzle(puzzleRecord);
    }

    countBackwards() {
        return this.myCurrentSearch.myStepper.countBackwards;
    }

    atCurrentSelectionSetNumber(number) {
        this.myGrid.atCurrentSelectionSetNumber(number, this.currentPhase);
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
    }

    setAutoDirection(direction) {
        this.myCurrentSearch.myStepper.setAutoDirection(direction);
    }

    // =================================================
    // Getter
    // =================================================

    getMyGrid() {
        return this.myGrid;
    }
    getMyCurrentPuzzle() {
        if (this.currentPhase == 'play') {
            return this.myCurrentPuzzle;
        } else {
            return undefined;
        }
    }
    getMyStepper() {
        return this.myCurrentSearch.myStepper;
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

    setLoadedPuzzleName(name) {
        this.myCurrentPuzzle.myRecord.name = name;
    }
    getLoadedPuzzleUID() {
        if (this.currentPhase == 'play') {
            return this.myCurrentPuzzle.myRecord.id;
        } else {
            // in the definition phase there is no current puzzle
            return -1;
        }
    }

    takeBackGivenCells() {
        this.myGrid.takeBackGivenCells();
    }

    canTakeBackGivenCells() {
        return this.myGrid.canTakeBackGivenCells();
    }

    grid2puzzleRecord(puzzleRecord) {
        // load current matrix into the record
        puzzleRecord.statusSolved = 0;
        puzzleRecord.statusGiven = 0;
        puzzleRecord.puzzle = [];
        for (let i = 0; i < 81; i++) {
            puzzleRecord.puzzle.push({
                cellValue: this.myGrid.sudoCells[i].getValue(),
                cellPhase: this.myGrid.sudoCells[i].getPhase()
            });
            if (this.myGrid.sudoCells[i].getValue() !== '0') {
                if (this.myGrid.sudoCells[i].getPhase() == 'play') {
                    puzzleRecord.statusSolved++;
                }
                if (this.myGrid.sudoCells[i].getPhase() == 'define') {
                    puzzleRecord.statusGiven++;
                }
            }
        }
        puzzleRecord.statusOpen = 81
            - puzzleRecord.statusGiven
            - puzzleRecord.statusSolved;
    }

    setSolvedToGiven() {
        this.myGrid.setSolvedToGiven();
    }

    clearLoadedPuzzle(key) {
        // In the definition phase there is no current puzzle
        if (this.currentPhase == 'play') {
            if (this.myCurrentPuzzle.myRecord.id == key) {
                this.myGrid.init();
            }
        }
    }

    tryStartAutomaticSearch() {
        // The automatic solver cannot guarantee correct statements 
        // about the existence and number of solutions, about the level of difficulty
        // for puzzles that have already been partially solved.

        if (this.isNotPartiallySolved()) {
            this.myCurrentSearch = new Search();
        } else {
            sudoApp.myConfirmDlg.open(sudoApp.mySolverController,
                sudoApp.mySolverController.resetConfirmed,
                sudoApp.mySolverController.resetRejected,
                "Puzzle zurücksetzen?",
                "Wenn Puzzles beim Start des Solvers bereits partiell gelöst sind, kann der Solver die Vollständigkeit berechneter Lösungen nicht garantieren. Empfehlung: Puzzle vor dem Start zurücksetzen. \n\nJetzt zurücksetzen?");
        }
    }

    tryStartAutomaticSearchStep() {
        this.myCurrentSearch = new Search();
    }

    succeeds() {
        // In general, non-unsolvability of a puzzle does not imply the solvability of the puzzle. 
        // However, the implication applies to completely filled puzzles.
        return this.myGrid.isFinished() && !this.myGrid.isUnsolvable();
    }

    reset() {
        this.cleanUpAndDeleteCurrentSearch();
        this.myGrid.reset();
    }
}

class AppSettingsRecord {
    constructor() {
        this.evalTypeType = new MatheSet(['lazy-invisible',
            'lazy',
            'strict-plus',
            'strict-minus']);
    };
    static nullAppSettingsRecord() {
        return {
            evalType: 'lazy-invisible',
            breakpoints: BreakpointsRecord.nullBreakpointsRecord(),
        }
    }
}

class BreakpointsRecord {
    constructor() { }
    static nullBreakpointsRecord() {
        return {
            contradiction: true,
            multipleOption: true,
            single: true,
            hiddenSingle: true,
            solutionDiscovered: true
        }
    }
}

