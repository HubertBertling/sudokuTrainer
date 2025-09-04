function startMainApp() {
    startSudokuServiceWorker();
    startSudokuFileReader();
    startSudokuFileHandlingAPI();
    setAppURLShareBtnEventHandler();
    setPuzzleShareBtnEventHandler();
    sudoApp = new SudokuMainApp();
    sudoApp.init();
}

function startSudokuServiceWorker() {
    if (navigator.serviceWorker) {
        // declaring scope manually
        navigator.serviceWorker.register("sw.js", { scope: "/sudokuTrainer/" }).then(
            (registration) => {
                console.log("Service worker registration succeeded:", registration);
            },
            (error) => {
                console.error(`Service worker registration failed: ${error}`);
            },
        );
    } else {
        console.error("Service workers are not supported.");
    }
}

function startSudokuFileReader() {
    // ==========================================================================
    // File handling via the DOM <input> Element
    // ==========================================================================
    if (window.File && window.FileReader
        && window.FileList && window.Blob) {
        // File handling via the DOM <input> Element
        window.onload = function () {
            const input = document.getElementById('asText');
            input.addEventListener('change', function (e) {
                const file = asText.files[0];
                const textType = /text.*/;
                if (file.type.match(textType)) {
                    const reader = new FileReader();
                    reader.onload = function (e) {
                        let strFilePuzzleMap = reader.result;
                        sudoApp.myPuzzleDB.upLoadPuzzle(strFilePuzzleMap);
                    }
                    reader.readAsText(file);
                } else {
                    // alert('Dateityp nicht unterstützt!');
                    console.log('Dateityp nicht unterstützt!');
                }
            });
        }
    } else {
        // alert('Dieser Browser unterstützt den Zugriff auf lokale Dateien nicht');
        console.log('Dieser Browser unterstützt den Zugriff auf lokale Dateien nicht');
    }
}

function startSudokuFileHandlingAPI() {
    // ==========================================================================
    // FILE HANDLING API
    // The File Handling API enables the web app 'sudokuTrainer' to register 
    // its ability to handle file type 'text' with the operating system. This enables
    // the file manager of the OS or other operating system flows to use 'sudokuTrainer'
    // web app to open the file, just like with a native app.
    // ==========================================================================
    if ('launchQueue' in window) {
        console.log('File Handling API is supported!');

        launchQueue.setConsumer(launchParams => {
            handleFiles(launchParams.files);
        });
    } else {
        console.error('File Handling API is not supported!');
    }
}

async function handleFiles(files) {
    for (const file of files) {
        const blob = await file.getFile();
        blob.handle = file;
        let strFilePuzzleMap = await blob.text();
        sudoApp.myPuzzleDB.upLoadPuzzle(strFilePuzzleMap);
    }
}

// ==========================================================================
// WEB SHARE API
//
// The Web Share API invokes the native share mechanism of the device 
// and allows users to share text, URLs or files.
// This app is itself also a share target which means content can also 
// be shared to it. When sharing content, this app will be listed as an app 
// to share to.
// ==========================================================================

function setAppURLShareBtnEventHandler() {
    // Share sudokuTrainer URL
    let btn = document.getElementById('share-app-btn');
    const resultPara = document.querySelector(".result");
    if (navigator.share && navigator.canShare) {
        // Web Share API ist Verfügbar!
        btn.addEventListener("click", async () => {

            if (navigator.canShare) {
                navigator.share(
                    {
                        title: "Sudoku-Trainer",
                        text: "Üben und Lösen von Puzzles mit der Sudoku-Trainer-App",
                        url: "https://hubertbertling.github.io/sudokuTrainer",
                    }
                )
                    .then(() => resultPara.textContent = "Sudoku-Trainer shared successfully")
                    .catch((error) => resultPara.textContent = 'Sharing failed:' + error);
            } else {
                resultPara.textContent = `Your system doesn't support sharing.`;
            }
        });
    } else {
        resultPara.textContent = `Web Share API not supported.`;
    }
    console.log(resultPara.textContent);
}

function setPuzzleShareBtnEventHandler() {
    // ==========================================================================
    // Share SudokuTrainer File
    // ==========================================================================
    let shareButton = document.getElementById('share-button');
    if (navigator.share && navigator.canShare) {
        // Web Share API ist Verfügbar!
        shareButton.addEventListener("click", async () => {
            if (sudoApp.mySolver.getGamePhase() == 'define') {
                sudoApp.myInfoDialog.open("Puzzle teilen", "negativ",
                    "Das Puzzle ist noch in der Definition. Daher kann es noch nicht geteilt werden.");
            } else {
                let file = sudoApp.myPuzzleDB.getCurrentPuzzleFile();
                if (navigator.canShare && navigator.canShare({ files: [file] })) {
                    navigator.share({
                        files: [file],
                        title: 'Puzzle teilen',
                        text: 'Puzzle',
                    })
                        .then(() => console.log('Share was successful.'))
                        .catch((error) => console.log('Sharing failed', error));
                } else {
                    console.log(`Your system doesn't support sharing files.`);
                }
            }
        });
    } else {
        console.log(`Web Share API not supported.`);
    }
}

// ==========================================
// Navigation and Dialogs 
// ==========================================
class NewPuzzlesBar {
    constructor() {
        this.verySimple = document.getElementById("very-simple");
        this.simple = document.getElementById("simple");
        this.medium = document.getElementById("medium");
        this.heavy = document.getElementById("heavy");
        this.veryHeavy = document.getElementById("very-heavy");
        this.extremeHeavy = document.getElementById("extreme-heavy");

    }
    init() {
        this.verySimple.style.width = "10%"
        this.simple.style.width = "10%"
        this.medium.style.width = "10%"
        this.heavy.style.width = "10%"
        this.veryHeavy.style.width = "10%"
        this.extremeHeavy.style.width = "10%"
    }

    setValue(level, puzzleCount) {
        let adaptedPuzzleCount = 0;
        let totalCount = 10;
        let puzzleCountProzent = 0;

        if (puzzleCount == 0) {
            adaptedPuzzleCount = 1;
            puzzleCountProzent = Math.floor(adaptedPuzzleCount / (totalCount) * 100);

        } else if (puzzleCount > 0 && puzzleCount < 11) {
            adaptedPuzzleCount = puzzleCount;
            puzzleCountProzent = Math.floor(adaptedPuzzleCount / (totalCount) * 100);

        } else if (puzzleCount > 10) {
            adaptedPuzzleCount = 10;
            puzzleCountProzent = Math.floor(10 / (totalCount) * 100);
        }

        switch (level) {
            case 'Sehr leicht': {
                this.verySimple.style.width = puzzleCountProzent + "%";
                this.verySimple.innerHTML = puzzleCount;
                this.verySimple.style.paddingRight = "6px";
                if (puzzleCount == 0) {
                    this.verySimple.style.backgroundColor = 'var(--error-cell-bg-color)';
                    this.verySimple.style.color = 'var(--error-cell-color)';
                } else {
                    this.verySimple.style.backgroundColor = 'var(--defined-cell-bg-color)';
                    this.verySimple.style.color = 'var(--defined-cell-color)';
                }
                break;
            }
            case 'Leicht': {
                this.simple.style.width = puzzleCountProzent + "%";
                this.simple.innerHTML = puzzleCount;
                this.simple.style.paddingRight = "6px";
                if (puzzleCount == 0) {
                    this.simple.style.backgroundColor = 'var(--error-cell-bg-color)';
                    this.simple.style.color = 'var(--error-cell-color)';
                } else {
                    this.simple.style.backgroundColor = 'var(--defined-cell-bg-color)';
                    this.simple.style.color = 'var(--defined-cell-color)';
                }
                break;
            }
            case 'Mittel': {
                this.medium.style.width = puzzleCountProzent + "%";
                this.medium.innerHTML = puzzleCount;
                this.medium.style.paddingRight = "6px";
                if (puzzleCount == 0) {
                    this.medium.style.backgroundColor = 'var(--error-cell-bg-color)';
                    this.medium.style.color = 'var(--error-cell-color)';
                } else {
                    this.medium.style.backgroundColor = 'var(--defined-cell-bg-color)';
                    this.medium.style.color = 'var(--defined-cell-color)';
                }
                break;
            }
            case 'Schwer': {
                this.heavy.style.width = puzzleCountProzent + "%";
                this.heavy.innerHTML = puzzleCount;
                this.heavy.style.paddingRight = "6px";
                if (puzzleCount == 0) {
                    this.heavy.style.backgroundColor = 'var(--error-cell-bg-color)';
                    this.heavy.style.color = 'var(--error-cell-color)';
                } else {
                    this.heavy.style.backgroundColor = 'var(--defined-cell-bg-color)';
                    this.heavy.style.color = 'var(--defined-cell-color)';
                }
                break;
            }
            case 'Sehr schwer': {
                this.veryHeavy.style.width = puzzleCountProzent + "%";
                this.veryHeavy.innerHTML = puzzleCount;
                this.veryHeavy.style.paddingRight = "6px";
                if (puzzleCount == 0) {
                    this.veryHeavy.style.backgroundColor = 'var(--error-cell-bg-color)';
                    this.veryHeavy.style.color = 'var(--error-cell-color)';
                } else {
                    this.veryHeavy.style.backgroundColor = 'var(--defined-cell-bg-color)';
                    this.veryHeavy.style.color = 'var(--defined-cell-color)';
                }
                break;
            }
            case 'Extrem schwer': {
                this.extremeHeavy.style.width = puzzleCountProzent + "%";
                this.extremeHeavy.innerHTML = puzzleCount;
                this.extremeHeavy.style.paddingRight = "6px";
                if (puzzleCount == 0) {
                    this.extremeHeavy.style.backgroundColor = 'var(--error-cell-bg-color)';
                    this.extremeHeavy.style.color = 'var(--error-cell-color)';
                } else {
                    this.extremeHeavy.style.backgroundColor = 'var(--defined-cell-bg-color)';
                    this.extremeHeavy.style.color = 'var(--defined-cell-color)';
                }
                break;
            }
            default: {
                throw new Error('Unexpected difficulty: '
                    + level);
            }

        }
    }
    upDate() {
        this.setValue('Sehr leicht', sudoApp.myNewPuzzleBuffer.myVerySimplePuzzles.length);
        this.setValue('Leicht', sudoApp.myNewPuzzleBuffer.mySimplePuzzles.length);
        this.setValue('Mittel', sudoApp.myNewPuzzleBuffer.myMediumPuzzles.length);
        this.setValue('Schwer', sudoApp.myNewPuzzleBuffer.myHeavyPuzzles.length);
        this.setValue('Sehr schwer', sudoApp.myNewPuzzleBuffer.myVeryHeavyPuzzles.length);
        this.setValue('Extrem schwer', sudoApp.myNewPuzzleBuffer.myExtremeHeavyPuzzles.length);
    }
}


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

    openNav() {
        document.getElementById("mySidenav").style.width = "250px";
    }
    closeNav() {
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
        }
    }
}

class NewPuzzleDlg {
    constructor(sudoApp) {
        this.myOpen = false;
        this.myNewPuzzzeDlgNode = document.getElementById("new-puzzle-dlg");
        this.myHeader = document.getElementById("new-puzzle-header");
        this.myNewPuzzlesBar = new NewPuzzlesBar();
        this.okNode = document.getElementById("btn-new-puzzle-ok");
        this.cancelNode = document.getElementById("btn-new-puzzle-cancel");

        this.myOkayOperation = sudoApp.mySolverController.newPuzzleOkay;
        this.myCancelOperation = sudoApp.mySolverController.newPuzzleCancelled;
        this.thisPointer = sudoApp.mySolverController;

        this.myLoader = document.getElementById("loader-new-puzzle");

        // Mit der Erzeugung des Wrappers werden 
        // auch der Eventhandler OK und Abbrechen gesetzt
        this.okNode.addEventListener('click', () => {
            sudoApp.myNewPuzzleDlg.close();
            sudoApp.myNewPuzzleDlg.myOkayOperation.call(this.thisPointer);
            sudoApp.mySolver.notify();
        });
        this.cancelNode.addEventListener('click', () => {
            sudoApp.myNewPuzzleDlg.close();
            sudoApp.myNewPuzzleDlg.myCancelOperation.call(this.thisPointer);
            sudoApp.mySolver.notify();
        });
    }
    open() {
        this.myOpen = true;
        this.upDate();
        this.myNewPuzzzeDlgNode.showModal();
    }
    upDate() {
        if (this.myOpen) {
            this.myNewPuzzlesBar.upDate();
            if (sudoApp.myNewPuzzleBuffer.webworkerGeneratorStopRequested) {
                this.stopLoaderAnimation();
            } else {
                this.startLoaderAnimation();
            }
        }
    }
    close() {
        if (this.myOpen) {
            this.myNewPuzzzeDlgNode.close();
            this.myOpen = false;
        }
    }

    startLoaderAnimation() {
        // Der sich drehende Loader wird angezeigt
        //   let slNode = document.getElementById("loader-db-info");
        //   slNode.innerText = info;
        document.getElementById("loader-new-puzzle").style.display = "block";
    }
    stopLoaderAnimation() {
        document.getElementById("loader-new-puzzle").style.display = "none";
    }
}

class ConfirmDialog {
    constructor() {
        this.myOpen = false;
        this.myConfirmDlgNode = document.getElementById("confirm-dlg");
        this.myHeader = document.getElementById("confirm-dlg-header");
        this.myTextBody = document.getElementById("confirm-dlg-body");
        this.okNode = document.getElementById("btn-confirm-ok");
        this.cancelNode = document.getElementById("btn-confirm-cancel");
        this.myConfirmOperation = undefined;
        this.myRejectOperation = undefined;
        this.thisPointer = undefined;
        // Mit der Erzeugung des Wrappers werden 
        // auch der Eventhandler OK und Abbrechen gesetzt
        this.okNode.addEventListener('click', () => {
            sudoApp.myConfirmDlg.close();
            sudoApp.myConfirmDlg.myConfirmOperation.call(this.thisPointer);
            sudoApp.mySolver.notify();
        });
        this.cancelNode.addEventListener('click', () => {
            sudoApp.myConfirmDlg.close();
            sudoApp.myConfirmDlg.myRejectOperation.call(this.thisPointer);
            sudoApp.mySolver.notify();
        });
    }

    open(thisPointer, confirmOp, rejectOp, header, question) {
        this.myOpen = true;
        this.thisPointer = thisPointer;
        this.myConfirmOperation = confirmOp;
        this.myRejectOperation = rejectOp;
        this.myHeader.innerText = header;
        this.myTextBody.innerText = question;
        this.myConfirmDlgNode.showModal();
    }

    close() {
        if (this.myOpen) {
            this.myConfirmDlgNode.close();
            this.myOpen = false;
        }
    }
}


class CopyFeedbackDialog {
    constructor() {
        this.myCopyFeedbackDlgNode = document.getElementById("copyFeedback-dlg");
    }

    open() {
        this.myCopyFeedbackDlgNode.showModal();
        setTimeout(() => {
            this.myCopyFeedbackDlgNode.close();
        }, 1000);
    }
}

class PuzzleSaveRenameDialog {
    constructor() {
        this.okHandler = undefined;
        this.cancelHandler = undefined,
            this.myOpen = false;
        this.myContentSaveDlgNode = document.getElementById("contentSaveDlg")
        this.myCurrentPuzzleNameNode = document.getElementById("puzzle-name");
        this.okNode = document.getElementById("btn-saveStorageOK");
        this.cancelNode = document.getElementById("btn-saveStorageCancel");
    }
    open(ok, cancel, currentRecord) {
        this.okHandler = ok;
        this.okNode.addEventListener('click', ok);
        this.cancelHandler = cancel;
        this.cancelNode.addEventListener('click', cancel);
        this.myCurrentPuzzleNameNode.value = currentRecord.name;
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
        return this.myCurrentPuzzleNameNode.value;
    }
}

class TrackerDialog {
    constructor() {
        this.manualBtnBlock = document.getElementById("manual-btn-block");
        // this.manualBtnBlock.style.visibility = "hidden";
        // this.automaticBtnBlock = document.getElementById("automatic-btn-block");
        // this.trackerDlgSolution = document.getElementById("tracker-dlg-solution");
        //,this.trackerNrOfSolutions = document.getElementById("number-of-solutions");
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
        // this.automaticBtnBlock.style.visibility = "visible";

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
            sudoApp.mySolverController.trackerDlgCountSolutionsPressed();
        });
    }
    open() {
        this.manualBtnBlock.style.visibility = "hidden";
        // this.automaticBtnBlock.style.display = "grid";
        this.myOpen = false;
        sudoApp.mySolverView.reSetNumberOfSolutions();
        sudoApp.mySolver.notify();
        this.myOpen = true;
        this.trackerDlgNode.show();
    }
    isOpen() {
        return this.myOpen;
    }
    close() {
        if (this.myOpen) {
            sudoApp.myClockedRunner.stop('cancelled');
            sudoApp.mySyncRunner.stop('cancelled');

            sudoApp.mySolver.cleanUpAndDeleteCurrentSearch();
            this.trackerDlgNode.close();
            this.manualBtnBlock.style.visibility = "visible";
            // this.automaticBtnBlock.style.visibility = "hidden";
            this.myOpen = false;
        }
    }
}

class InfoDialog {
    constructor() {
        this.dlgNode = document.getElementById("infoDlg");
        this.infoDlgHeaderNode = document.getElementById("infoDlgHeader");
        this.iconNode = document.getElementById("infoIcon");
        this.infoDlgBodyNode = document.getElementById("infoDlgBody");
        this.okNode = document.getElementById("infoDlg-OK-Btn");
        this.myConfirmOperation = undefined;
        this.thisPointer = undefined;
        // Mit der Erzeugung des Wrappers werden 
        // auch der Eventhandler OK und Abbrechen gesetzt
        this.okNode.addEventListener('click', () => {
            sudoApp.myInfoDialog.close();
            sudoApp.myInfoDialog.myConfirmOperation.call(this.thisPointer);
        });
    }

    open(headerText, infoModus, bodyText, thisPointer, confirmOp) {
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
        this.thisPointer = thisPointer;
        this.myConfirmOperation = confirmOp;
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

        this.topicEvalType = document.getElementById("pc-eval");
        this.topicBreakpoints = document.getElementById("breakpoint-settings");

        this.okNode = document.getElementById("btn-settings-dlg-ok");
        this.cancelNode = document.getElementById("btn-settings-dlg-cancel");

        this.breakpointsOnly = false;

        // Mit der Erzeugung des Wrappers werden 
        // auch der Eventhandler OK und Abbrechen gesetzt
        this.okNode.addEventListener('click', () => {

            if (this.breakpointsOnly) {
                // The breakpoint settings dialog is a subset 
                // of the overall settings dialog
                let mySettings = sudoApp.getMySettings();
                mySettings.breakpoints.contradiction =
                    document.getElementById('breakpoint-contradiction').checked;
                mySettings.breakpoints.multipleOption =
                    document.getElementById('breakpoint-multiple-candidates').checked;
                mySettings.breakpoints.single =
                    document.getElementById('breakpoint-single').checked;
                mySettings.breakpoints.hiddenSingle =
                    document.getElementById('breakpoint-hidden-single').checked;
                mySettings.breakpoints.solutionDiscovered =
                    document.getElementById('breakpoint-solution').checked;

                sudoApp.setMySettings(mySettings);
                sudoApp.mySolver.notify();
                sudoApp.mySettingsDialog.close();
            } else {
                let mySettings = sudoApp.getMySettings();

                let radioEvalNodes = document.querySelectorAll('.radio-eval-type');
                radioEvalNodes.forEach(radioNode => {
                    if (radioNode.checked) {
                        mySettings.evalType = radioNode.getAttribute('value');
                    }
                });

                mySettings.breakpoints.contradiction =
                    document.getElementById('breakpoint-contradiction').checked;
                mySettings.breakpoints.multipleOption =
                    document.getElementById('breakpoint-multiple-candidates').checked;
                mySettings.breakpoints.single =
                    document.getElementById('breakpoint-single').checked;
                mySettings.breakpoints.hiddenSingle =
                    document.getElementById('breakpoint-hidden-single').checked;
                mySettings.breakpoints.solutionDiscovered =
                    document.getElementById('breakpoint-solution').checked;

                sudoApp.setMySettings(mySettings);
                sudoApp.activateAppSettings();
                sudoApp.mySolver.notify();
                sudoApp.mySettingsDialog.close();
            }
        });

        this.cancelNode.addEventListener('click', () => {
            sudoApp.mySettingsDialog.close();
        });
    }
    open() {
        this.breakpointsOnly = false;
        let mySettings = sudoApp.getMySettings();
        // current eval-type 
        let radioEvalNodes = document.querySelectorAll('.radio-eval-type');
        radioEvalNodes.forEach(radioNode => {
            if (radioNode.getAttribute('value') == mySettings.evalType) {
                radioNode.checked = true;
            }
        });

        document.getElementById('breakpoint-contradiction').checked =
            mySettings.breakpoints.contradiction;
        document.getElementById('breakpoint-multiple-candidates').checked =
            mySettings.breakpoints.multipleOption;
        document.getElementById('breakpoint-single').checked =
            mySettings.breakpoints.single;
        document.getElementById('breakpoint-hidden-single').checked =
            mySettings.breakpoints.hiddenSingle;
        document.getElementById('breakpoint-solution').checked =
            mySettings.breakpoints.solutionDiscovered;

        this.topicEvalType.style.display = 'block';
        this.topicBreakpoints.style.display = 'block';

        this.myOpen = true;
        this.dlgNode.showModal();
    }
    openTopicBreakpoints() {
        this.breakpointsOnly = true;
        let mySettings = sudoApp.getMySettings();
        document.getElementById('breakpoint-contradiction').checked =
            mySettings.breakpoints.contradiction;
        document.getElementById('breakpoint-multiple-candidates').checked =
            mySettings.breakpoints.multipleOption;
        document.getElementById('breakpoint-single').checked =
            mySettings.breakpoints.single;
        document.getElementById('breakpoint-hidden-single').checked =
            mySettings.breakpoints.hiddenSingle;
        document.getElementById('breakpoint-solution').checked =
            mySettings.breakpoints.solutionDiscovered;

        this.topicEvalType.style.display = 'none';
        this.topicBreakpoints.style.display = 'block';

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
// PuzzleDB
// ==========================================

class SudokuPuzzleDB {
    constructor() {
        this.myDBViews = [];
        this.sorted = new Map([
            ['name', 'desc'],
            ['status-given', 'desc'],
            ['status-solved', 'desc'],
            ['status-open', 'desc'],
            ['steps-lazy', 'desc'],
            ['steps-strict', 'desc'],
            ['level', 'desc'],
            ['backTracks', 'desc'],
            ['countSolutions', 'desc'],
            ['date', 'desc']
        ]);
    }


    attach(dbView) {
        this.myDBViews.push(dbView);
    }

    notify() {
        this.myDBViews.forEach(view => {
            view.upDate();
        });
    }

    upDateVersion_2() {
        let str_puzzleMap = localStorage.getItem("localSudokuDB");
        let puzzleMap = new Map(JSON.parse(str_puzzleMap));
        puzzleMap.forEach((puzzleRecord, key) => {
            puzzleRecord.id = key;
            if (puzzleRecord.preRunRecord.countSolutions == undefined) {
                if (puzzleRecord.preRunRecord.level == 'Sehr leicht'
                    || puzzleRecord.preRunRecord.level == 'Leicht'
                    || puzzleRecord.preRunRecord.level == 'Mittel'
                    || puzzleRecord.preRunRecord.level == 'Schwer'
                    || puzzleRecord.preRunRecord.level == 'Sehr schwer') {
                    puzzleRecord.preRunRecord.countSolutions = 1;
                } else {
                    puzzleRecord.preRunRecord.countSolutions = -1;
                }
            }
        });
        // Kreiere die JSON-Version des Speicherobjektes
        // und speichere sie.
        let update_str_puzzleMap = JSON.stringify(Array.from(puzzleMap.entries()));
        localStorage.setItem("localSudokuDB", update_str_puzzleMap);
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
            case 'countSolutions': {
                let countSolutionsSorted = this.sorted.get('countSolutions');
                if (countSolutionsSorted == '' || countSolutionsSorted == 'desc') {
                    this.sorted.set('countSolutions', 'asc');
                    puzzleMap = new Map([...puzzleMap].sort((a, b) => a[1].preRunRecord.countSolutions - b[1].preRunRecord.countSolutions));
                } else {
                    this.sorted.set('countSolutions', 'desc');
                    puzzleMap = new Map([...puzzleMap].sort((a, b) => b[1].preRunRecord.countSolutions - a[1].preRunRecord.countSolutions));
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
            sudoApp.mySolver.setCurrentPuzzle(PuzzleRecord.nullPuzzleRecord());

            sudoApp.mySolver.myCurrentPuzzle.myRecord = await sudoApp.mySolver.calculatePuzzleRecord();
            let currentPuzzleRecord = sudoApp.mySolver.myCurrentPuzzle.myRecord;
            currentPuzzleRecord.id = puzzleId;
            currentPuzzleRecord.name = pzName;
            this.savePuzzle(currentPuzzleRecord);
            console.log('*************   importBackRunPuzzle OK  ****************');
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
            puzzleMap.set(key, value);
            upLoadedKeys.push(key);
        })
        // Kreiere die JSON-Version des Speicherobjektes
        // und speichere sie.
        let update_str_puzzleMap = JSON.stringify(Array.from(puzzleMap.entries()));
        localStorage.setItem("localSudokuDB", update_str_puzzleMap);

        this.upDateVersion_2();

        if (upLoadedKeys.length == 1) {
            this.selectedIndex = this.getIndex(upLoadedKeys.pop());
            sudoApp.myPuzzleDBController.loadBtnPressed();
        } else {
            sudoApp.mySolverController.openDBLinkPressed();
        }
    }

    getCurrentPuzzleFile() {
        let currentPuzzleRecord = sudoApp.mySolver.myCurrentPuzzle.myRecord;
        if (!sudoApp.myPuzzleDB.has(currentPuzzleRecord.id)) {
            // The current puzzle is not yet an element in the database.
            // Save the current puzzle with a new name in the database
            currentPuzzleRecord.name = 'Geteilt';
            sudoApp.myPuzzleDB.savePuzzle(currentPuzzleRecord);
        } else {
            // The current puzzle is element in the database.
            sudoApp.myPuzzleDB.mergePlayedPuzzle(currentPuzzleRecord);
        }
        // The saved and shared puzzle becomes the new current puzzle
        // let tmpPuzzleID = sudoApp.myPuzzleDB.getSelectedUid();
        let puzzleRecord = sudoApp.myPuzzleDB.getSelectedPuzzle();
        sudoApp.mySolver.loadPuzzleRecord(puzzleRecord);
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

class SudokuPuzzleDBView {
    constructor(sudokuDB) {
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

                let td_countSolutions = document.createElement('td');
                td_countSolutions.innerText = pzRecord.preRunRecord.countSolutions;
                tr.appendChild(td_countSolutions);

                let td_date = document.createElement('td');
                td_date.innerText = (new Date(pzRecord.date)).toLocaleDateString();
                tr.appendChild(td_date);

                tbNode.appendChild(tr);
            }
            if (selectedTr !== undefined) {
                selectedTr.scrollIntoView({ block: "center" });
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
        document.getElementById('col-countSolutions').addEventListener('click', () => {
            this.myPuzzleDB.sort('countSolutions');
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

        document.getElementById('db-puzzle-btn-upload').addEventListener('click', () => {
            this.puzzleUploadBtnPressed();
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
        sudoApp.myCurrentPuzzleSaveRenameDlg.open(
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
            sudoApp.mySolver.loadPuzzleRecord(puzzleRecord);
            sudoApp.mySolverController.myUndoActionStack = [];
            sudoApp.mySolverController.myRedoActionStack = [];

            sudoApp.mySolver.notify();
            // Zoom in the loaded puzzle
            sudoApp.mySolver.notifyAspect('puzzleLoading', undefined);
        }
    }

    renamePuzzleDlgOKPressed() {
        sudoApp.myCurrentPuzzleSaveRenameDlg.close();
        let uid = sudoApp.myCurrentPuzzleSaveRenameDlg.myId;
        let name = sudoApp.myCurrentPuzzleSaveRenameDlg.getPuzzleName();
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
        sudoApp.myCurrentPuzzleSaveRenameDlg.close();
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
        sudoApp.myPuzzleDBController.delete();
    }
    initDBBtnPressed() {
        sudoApp.myConfirmDlg.open(sudoApp.myPuzzleDB,
            sudoApp.myPuzzleDB.userInit,
            () => { },
            "Puzzle DB löschen und initialisieren",
            "Soll die Puzzle DB endgültig gelöscht und neu initialisiert werden?");
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

    puzzleUploadBtnPressed() {
        // Button on the puzzle DB view
        this.importPuzzles();
    }


    closeBtnPressed() {
        sudoApp.myPuzzleDBDialog.close();
    }
}

class SudokuPrintView {
    constructor() {
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
        let date = sudoApp.myPuzzleDB.getSelectedPuzzle().date;
        let level = sudoApp.myPuzzleDB.getSelectedPuzzle().preRunRecord.level;
        puzzleIdentityRow.innerHTML =
            '<b>Puzzle-Name:</b> &nbsp' + name + ', &nbsp' + new Date(date).toLocaleDateString() + '; &nbsp'
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

// ==========================================
// Grid related classes 
// ==========================================
class SudokuGroupView {
    constructor(group, index) {
        // group is the model of this view
        this.myIndex = index;
        this.myGroup = group;
        this.myCellViews = undefined;
        // this.hsDependent_inAdmissiblesDisplayed = false;
    }

    getMyGroup() {
        return this.myGroup;
    }

    setCellViews(tmpCellViews) {
        this.myCellViews = tmpCellViews;
    }

    getMyCellViews() {
        return this.myCellViews;
    }

    getMyIndex() {
        return this.myIndex;
    }

    displayUnsolvability() {
        // Analog die Widerspruchserkennung durch zwei gleiche notwendige Nummern in der Gruppe.
        let intNecessary = this.getMyGroup().withConflictingNecessaryNumbers();
        if (intNecessary > 0) {
            this.displayError();
            sudoApp.mySolverView.displayReasonUnsolvability('In der Gruppe zwei gleiche notwendige Nummern: ' + intNecessary);
            return true;
        }
        // Die Widersprüchlichkeit des Puzzles steht schon fest, wenn in einer Gruppe, also einem Block, 
        // einer Reihe oder einer Spalte an verschiedenen Stellen das gleiche Single auftritt.
        let intSingle = this.getMyGroup().withConflictingSingles();
        if (intSingle > 0) {

            this.displayError();
            sudoApp.mySolverView.displayReasonUnsolvability('In der Gruppe zwei gleiche Singles: ' + intSingle);
            return true;
        }
        // Widerspruchserkennung durch eine fehlende Nummer in der Gruppe.
        let missingNumbers = this.getMyGroup().withMissingNumber();
        if (missingNumbers.size > 0) {
            this.displayError();
            const [missingNr] = missingNumbers;
            sudoApp.mySolverView.displayReasonUnsolvability('In der Gruppe fehlt die Nummer: ' + missingNr);
            return true;
        }
        return false;
    }
}

class SudokuBlockView extends SudokuGroupView {
    constructor(block, blockIndex) {
        super(block, blockIndex);
        let tmpCellViews = [];
        for (let i = 0; i < 9; i++) {
            tmpCellViews.push(sudoApp.mySolverView.myGridView.sudoCellViews[
                IndexCalculator.getCellIndexBlock(blockIndex, i)]);
        }
        this.setCellViews(tmpCellViews);
    }

    getMyBlock() {
        return this.getMyGroup();
    }

    upDate() {
        let gridNode = sudoApp.mySolverView.myGridView.myNode;
        // New DOM-block
        let blockNode = document.createElement("div");
        blockNode.setAttribute("class", "sudoku-block");
        // Store the new DOM-Block in this view
        this.myNode = blockNode;
        //Add the new DOM block to the Dom-grid
        gridNode.appendChild(blockNode);
        this.upDateMyCellViews();
    }

    upDateMyCellViews() {
        this.myCellViews.forEach(cellView => {
            cellView.upDate();
        })
    }

    displayUnsolvability() {
        let tmp = super.displayUnsolvability();
        if (sudoApp.mySolver.getActualEvalType() == 'lazy-invisible') {
            if (tmp) {
                // Inhalte der Gruppe dennoch anzeigen
                this.getMyBlock().getMyCells().forEach(sudoCell => {
                    if (sudoCell.getValue() == '0') {
                        sudoApp.mySolverView.myGridView.sudoCellViews[sudoCell.myIndex].displayCandidatesInDetail(sudoCell.getCandidates());
                        sudoApp.mySolverView.myGridView.sudoCellViews[sudoCell.myIndex].displayNecessary(sudoCell.myNecessarys);
                    }
                })
            }
        }
        return tmp;
    }
    displayNecessaryCandidate() {
        this.myCellNode.classList.add('necessary');
    }
    displayError() {
        this.getMyBlock().getMyCells().forEach(sudoCell => {
            sudoApp.mySolverView.myGridView.sudoCellViews[sudoCell.myIndex].displayColError();
        })
    }

}

class SudokuRowView extends SudokuGroupView {
    constructor(row, rowIndex) {
        super(row, rowIndex);
        let tmpCellViews = [];
        for (let i = 0; i < 9; i++) {
            tmpCellViews.push(sudoApp.mySolverView.myGridView.sudoCellViews[
                IndexCalculator.getCellIndexRow(rowIndex, i)]);
        }
        this.setCellViews(tmpCellViews);
    }

    getMyRow() {
        return this.getMyGroup();
    }

    displayUnsolvability() {
        let tmp = super.displayUnsolvability();
        if (sudoApp.mySolver.getActualEvalType() == 'lazy-invisible') {
            if (tmp) {
                // Inhalte der Gruppe dennoch anzeigen
                this.getMyRow().getMyCells().forEach(sudoCell => {
                    if (sudoCell.getValue() == '0') {
                        sudoApp.mySolverView.myGridView.sudoCellViews[sudoCell.myIndex].displayCandidatesInDetail(sudoCell.getCandidates());
                        sudoApp.mySolverView.myGridView.sudoCellViews[sudoCell.myIndex].displayNecessary(sudoCell.myNecessarys);
                    }
                })
            }
        }
        return tmp;
    }

    displayError() {
        this.getMyRow().getMyCells().forEach(sudoCell => {
            sudoApp.mySolverView.myGridView.sudoCellViews[sudoCell.myIndex].displayRowError();
        })
    }
}

class SudokuColView extends SudokuGroupView {
    constructor(col, colIndex) {
        super(col, colIndex);
        let tmpCellViews = [];
        for (let i = 0; i < 9; i++) {
            tmpCellViews.push(sudoApp.mySolverView.myGridView.sudoCellViews[
                IndexCalculator.getCellIndexCol(colIndex, i)]);
        }
        this.setCellViews(tmpCellViews);
    }

    getMyCol() {
        return this.getMyGroup();
    }

    displayUnsolvability() {
        let tmp = super.displayUnsolvability();
        if (sudoApp.mySolver.getActualEvalType() == 'lazy-invisible') {
            if (tmp) {
                // Inhalte der Gruppe dennoch anzeigen
                this.getMyCol().getMyCells().forEach(sudoCell => {
                    if (sudoCell.getValue() == '0') {
                        sudoApp.mySolverView.myGridView.sudoCellViews[sudoCell.myIndex].displayCandidatesInDetail(sudoCell.getCandidates());
                        sudoApp.mySolverView.myGridView.sudoCellViews[sudoCell.myIndex].displayNecessary(sudoCell.myNecessarys);
                    }
                })
            }
        }
        return tmp;
    }

    displayError() {
        this.getMyCol().getMyCells().forEach(sudoCell => {
            sudoApp.mySolverView.myGridView.sudoCellViews[sudoCell.myIndex].displayColError();
        })
    }
}

class SudokuGridView {
    constructor(grid) {
        this.myGrid = grid;
        this.myNode = undefined;
        this.gridArea = document.getElementById("grid-area");
        this.sudoCellViews = [];
        this.sudoBlockViews = [];
        this.sudoRowViews = [];
        this.sudoColViews = [];
    }

    upDate() {
        // Based on the familiar MVC pattern (Model View Controller),  
        // the view of the grid is completely rebuilt after a change to the grid.

        // The view of the grid consists of the view classes for all elements of the grid
        // and the DOM for the grid. The view classes build the DOM model
        // for the grid.

        // All view elements of the grid view are deleted
        this.sudoCellViews = [];
        this.sudoBlockViews = [];
        this.sudoRowViews = [];
        this.sudoColViews = [];

        // The new cell views are created.
        // Each cell view gets a link to its cell
        for (let i = 0; i < 81; i++) {
            let tmpCell = sudoApp.mySolver.myGrid.sudoCells[i];
            let cellView = new SudokuCellView(tmpCell, i);
            this.sudoCellViews.push(cellView);
        }

        // The new block views are created.
        for (let i = 0; i < 9; i++) {
            let tmpBlock = sudoApp.mySolver.myGrid.sudoBlocks[i];
            let tmpBlockView = new SudokuBlockView(tmpBlock, i);
            this.sudoBlockViews.push(tmpBlockView);
        }

        // Analog
        for (let i = 0; i < 9; i++) {
            let tmpRow = sudoApp.mySolver.myGrid.sudoRows[i];
            let tmpRowView = new SudokuRowView(tmpRow, i);
            this.sudoRowViews.push(tmpRowView);
        }

        // Analog
        for (let i = 0; i < 9; i++) {
            let tmpCol = sudoApp.mySolver.myGrid.sudoCols[i];
            let tmpColView = new SudokuColView(tmpCol, i);
            this.sudoColViews.push(tmpColView);
        }

        // Replace the previous DOM-grid by a new DOM-Grid
        let old_Node = document.getElementById("main-sudoku-grid");
        // Create the new DOM-grid
        let new_Node = document.createElement('div');
        new_Node.setAttribute('id', 'main-sudoku-grid');
        new_Node.classList.add('main-sudoku-grid');
        this.gridArea.replaceChild(new_Node, old_Node);
        this.myNode = new_Node;

        // Add 9 new DOM blocks to the DOM-grid
        this.sudoBlockViews.forEach(sudoBlockView => {
            sudoBlockView.upDate();
        });


        if (sudoApp.mySolver.getActualEvalType() == 'strict-plus' ||
            sudoApp.mySolver.getActualEvalType() == 'strict-minus') {
            this.sudoCellViews.forEach(sudoCellView => {
                sudoCellView.classifyCandidateNodesInAdmissible();
            });
        } else {
            this.sudoCellViews.forEach(sudoCellView => {
                sudoCellView.classifyCandidateNodesDependantInAdmissible();
            });
        }

        if (sudoApp.mySolver.isSearching()) {
            if (sudoApp.mySolver.myCurrentSearch.isTipSearch) {
                new_Node.style.border = "6px solid var(--manual-solver)";
            } else {
                new_Node.style.border = "6px solid var(--automatic-solver)";
            }
            if (sudoApp.mySolver.getActualEvalType() == 'lazy-invisible') {
                // Candidates are not displayed in the matrix
                // except for the cell of the next step
                this.displayCandidateInvisibleMatrix();
            }
        } else {
            new_Node.style.border = "6px solid var(--manual-solver)";
        }

        // Unlösbarkeit anzeigen.
        if (sudoApp.mySolver.isSearching()
            || sudoApp.mySolver.getGamePhase() == 'define') {
            // The unsolvability is only displayed and checked,
            // when the automatic search is running or in the definition phase.
            this.displayUnsolvability();
        }
        this.displaySelection();
        this.displayAutoSelection();
    }

    displayCandidateInvisibleMatrix() {
        // Candidates are not displayed in the matrix
        // except for the next step cell
        if (!this.myGrid.isFinished()) {
            let necessaryCandidateExists = false;
            let singleCandidateExists = false;
            let hiddenSingleCandidateExists = false;

            // Jetzt nur noch über die Zellen iterieren
            this.sudoCellViews.forEach(cellView => {
                if (cellView.myCell.getValue() == '0') {
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
                this.sudoCellViews.forEach(cellView => {
                    if (cellView.myCell.getValue() == '0') {
                        if (cellView.upDateSingle()) {
                            singleCandidateExists = true;
                            return true;
                        }
                    }
                });
            }

            // If there is no necessary and no single number the first hidden single number will be displayed       
            if (!necessaryCandidateExists && !singleCandidateExists) {
                this.sudoCellViews.forEach(cellView => {
                    if (cellView.myCell.getValue() == '0') {
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
                this.sudoCellViews.forEach(cellView => {
                    if (cellView.myCell.getValue() == '0') {
                        cellView.upDateMultipleOptions();
                        return true;
                    }
                });
            }
        }
    }

    displayNameAndDifficulty() {
        let currentPuzzle = sudoApp.mySolver.myCurrentPuzzle;
        let evalNode = document.getElementById("loaded-evaluations");

        if (currentPuzzle == undefined) {
            evalNode.innerHTML =
                '<span class="pz-name"><b>Puzzle:</b> &nbsp' + '-' + '</span>' +
                '<span class="pz-level"><b>Level:</b> &nbsp' + 'Keine Angabe' + '</span>'
        } else {
            evalNode.innerHTML =
                '<span class="pz-name"><b>Puzzle:</b> &nbsp' + currentPuzzle.myRecord.name + ', &nbsp' + new Date(currentPuzzle.myRecord.date).toLocaleDateString() + '</span>' +
                '<span class="pz-level"><b>Level:</b> &nbsp' + currentPuzzle.myRecord.preRunRecord.level + '</span>'
        }
    }

    displayHint() {


    }

    displaySelection() {
        if (this.myGrid.indexSelected == -1) {
            this.sudoCellViews.forEach(cellView => {
                cellView.unsetSelectStatus();
            })
        } else {
            let selectedCellView = this.sudoCellViews[this.myGrid.indexSelected];
            selectedCellView.unsetSelectStatus();
            selectedCellView.setSelectStatus();
        }
    }

    displayAutoSelection() {
        if (sudoApp.mySolver.isSearching()
            && sudoApp.mySolver.myCurrentSearch.myStepper.indexSelected !== -1) {
            let selectedCellView = this.sudoCellViews[sudoApp.mySolver.myCurrentSearch.myStepper.indexSelected];
            selectedCellView.unsetAutoSelectStatus();
            selectedCellView.setAutoSelectStatus();
        } else {
            this.sudoCellViews.forEach(cellView => {
                cellView.unsetAutoSelectStatus();
            })
        }
    }

    displayUnsolvability() {
        if (sudoApp.mySolver.getGamePhase() == 'define') {
            for (let i = 0; i < 81; i++) {
                if (this.sudoCellViews[i].displayBasicUnsolvability()) return;
            }
        } else {
            // Show only one contradiction.
            // In fact, a contradictory Sudoku has many contradictions at the same time.
            for (let i = 0; i < 81; i++) {
                if (this.sudoCellViews[i].displayUnsolvability()) return;
            }
            for (let i = 0; i < 9; i++) {
                if (this.sudoBlockViews[i].displayUnsolvability()) return;
            }
            for (let i = 0; i < 9; i++) {
                if (this.sudoRowViews[i].displayUnsolvability()) return;
            }
            for (let i = 0; i < 9; i++) {
                if (this.sudoColViews[i].displayUnsolvability()) return;
            }
        }
    }
    displayWrongNumbers() {
        for (let i = 0; i < 81; i++) {
            if (this.sudoCellViews[i].displayWrongNumber());
        }
    }

    displayAllInAdmissibleCandidates() {
        for (let i = 0; i < 81; i++) {
            this.sudoCellViews[i].displayAllInAdmissibleCandidates();
        }
    }

}

class SudokuCellView {
    constructor(cell, index) {
        this.myIndex = index;
        this.myCell = cell;
        this.myRelPositionNode = undefined;
        this.myCellNode = undefined;
        this.myOverlayNode = undefined;
    }

    upDate() {
        this.upDateDOMCell();
        if (sudoApp.mySolver.getActualEvalType() == 'lazy-invisible') {
            // Display numbers but not candidates
            this.upDateCellContentWithoutCandidates();
        } else {
            // Display numbers including candidates for unset cells
            this.upDateCellContentIncludingCandidates();
        }
    }

    upDateCellContentIncludingCandidates() {
        if (this.myCell.myValue == '0') {
            // The cell is not yet set
            if (this.myCell.candidatesEvaluated) {
                this.displayCandidates();
                this.displayNecessary(this.myCell.myNecessarys);
            } else {
                // Display empty cell
                this.myCellNode.classList.add('empty');
            }
        } else {
            // The cell is assigned a number
            this.displayGamePhase(this.myCell.myGamePhase);
            this.displayMainValueNode(this.myCell.myValue);
        }
    }


    upDateDOMCell() {
        // Add a new DOM-cell to its DOM-block
        // and set its value found in the grid-cell
        let cellIndex = this.myIndex;
        this.myRelPositionNode = document.createElement("div");
        this.myRelPositionNode.style.position = "relative";

        this.myOverlayNode = document.createElement("div");
        this.myOverlayNode.classList.add("overlay");
        this.myOverlayNode.style.display = "none";

        this.myCellNode = document.createElement("div");
        this.myCellNode.setAttribute("class", "sudoku-grid-cell");

        this.myRelPositionNode.appendChild(this.myOverlayNode);
        this.myRelPositionNode.appendChild(this.myCellNode);

        // Add the new DOM-cell to to its the DOM-block
        let myBlockIndex = IndexCalculator.blockIndex(cellIndex);
        let myBlockView = sudoApp.mySolverView.myGridView.sudoBlockViews[myBlockIndex];
        let myBlockNode = myBlockView.myNode;
        myBlockNode.appendChild(this.myRelPositionNode);

        // Add the cell-event-handler to the new DOM-cell
        this.myCellNode.addEventListener('click', () => {
            sudoApp.mySolverController.sudokuCellPressed(cellIndex);
        });
    }

    upDateCellContentWithoutCandidates() {
        // Set the value in the new DOM-cell
        if (this.myCell.myValue == '0') {
            // Display empty cell
            this.myCellNode.classList.add('empty');
        } else {
            // Set phase and value of the new DOM-cell
            this.displayGamePhase(this.myCell.myGamePhase);
            this.displayMainValueNode(this.myCell.myValue);
        }
    }

    upDateNecessary() {
        // Gebe notwendige Nummer aus oder leere Zelle
        if (this.myCell.myNecessarys.size > 1 ||
            (this.myCell.myNecessarys.size == 1
                && this.myCell.isSelected
                && sudoApp.mySolver.myCurrentSearch.myStepper.indexSelected > -1)) {

            this.myCell.myNecessarys.forEach(necessaryNr => {
                let candidateNode = document.createElement('div');
                candidateNode.setAttribute('data-value', necessaryNr);
                candidateNode.innerHTML = necessaryNr;

                if (sudoApp.mySolver.getActualEvalType() == 'lazy-invisible') {
                    candidateNode.classList.add('necessary-big');
                } else {
                    candidateNode.classList.add('necessary');
                }
                this.myCellNode.appendChild(candidateNode);
            })
            return true;
        } else {
            // Leere Zelle anzeigen
            return false;
        }
    }

    upDateSingle() {
        // Gebe Single Nummer aus oder leere Zelle
        let tmpCandidates = this.myCell.getCandidates();
        if (tmpCandidates.size == 1
            && this.myCell.isSelected
            && sudoApp.mySolver.myCurrentSearch.myStepper.indexSelected > -1) {
            let candidate = Array.from(tmpCandidates)[0]
            let candidateNode = document.createElement('div');
            candidateNode.setAttribute('data-value', candidate);
            candidateNode.classList.add('single');
            candidateNode.innerHTML = candidate;
            this.myCellNode.appendChild(candidateNode);
            return true;
        } else {
            return false;
        }
    }

    upDateHiddenSingle() {
        // Gebe Single Nummer aus oder leere Zelle
        this.myCellNode.classList.add('nested');
        let tmpCandidates = this.myCell.getTotalCandidates();
        if (tmpCandidates.size == 1
            && this.myCell.isSelected
            && sudoApp.mySolver.myCurrentSearch.myStepper.indexSelected > -1) {

            let candidate = Array.from(tmpCandidates)[0]
            let candidateNode = document.createElement('div');
            candidateNode.setAttribute('data-value', candidate);
            candidateNode.innerHTML = candidate;
            candidateNode.classList.add('hidden-single');
            this.myCellNode.classList.add('candidates-big');
            this.myCellNode.appendChild(candidateNode);

            let redAdmissibles = this.myCell.getCandidates().difference(tmpCandidates);
            redAdmissibles.forEach(redAdmissible => {
                let candidateNode = document.createElement('div');
                candidateNode.setAttribute('data-value', redAdmissible);

                candidateNode.innerHTML = redAdmissible;
                candidateNode.classList.add('inAdmissible');
                this.myCellNode.appendChild(candidateNode);
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
        // Eine selektierte Zelle mit Optionen
        this.myCellNode.classList.add('nested');
        // Die Optionen sind zulässige Kandidaten
        let tmpCandidates = this.myCell.getTotalCandidates();
        // Es gibt mindestens 2 Kandidaten, sprich Optionen
        if (tmpCandidates.size > 1
            && this.myCell.isSelected
            && sudoApp.mySolver.myCurrentSearch.myStepper.indexSelected > -1) {
            this.displayCandidatesInDetail(tmpCandidates);
            return true;
        } else {
            return false;
        }
    }

    displayCandidates() {
        let inAdmissiblesVisible = (sudoApp.mySolver.getActualEvalType() == 'lazy' || sudoApp.mySolver.getActualEvalType() == 'strict-plus');
        if (inAdmissiblesVisible) {
            this.displayCandidatesInDetail(this.myCell.getCandidates());
        } else {
            // Angezeigte inAdmissibles sind zunächst einmal Zulässige
            // und dürfen jetzt nicht mehr angezeigt werden
            this.displayCandidatesInDetail(this.myCell.getTotalCandidates());
        }
    }

    displayCandidatesInDetail(admissibles) {
        // this.myCellNode.classList.add('nested');
        this.myCellNode.classList.add('candidates');
        // Übertrage die berechneten Möglchen in das DOM
        admissibles.forEach(e => {
            let candidateNode = document.createElement('div');
            candidateNode.classList.add('candidate');
            candidateNode.setAttribute('data-value', e);
            candidateNode.innerHTML = e;
            this.myCellNode.appendChild(candidateNode);
        });
    }

    displayNecessary(myNecessarys) {
        let candidateNodes = this.myCellNode.children;
        for (let i = 0; i < candidateNodes.length; i++) {
            if (myNecessarys.has(candidateNodes[i].getAttribute('data-value'))) {
                candidateNodes[i].classList.add('neccessary');
            }
        }
    }

    classifyCandidateNodesInAdmissible() {
        let inAdmissibleCandidates = this.myCell.inAdmissibleCandidates;
        let myNecessarys = this.myCell.myNecessarys;
        let candidateNodes = this.myCellNode.children;
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
    classifyCandidateNodesDependantInAdmissible() {
        // let dependant_inAdmissibleCandidates = this.myCell.hsDependent_inAdmissibles;
        let myNecessarys = this.myCell.myNecessarys;
        let candidateNodes = this.myCellNode.children;
        for (let i = 0; i < candidateNodes.length; i++) {
            if (this.myCell.hsDependent_inAdmissibles.has(candidateNodes[i].getAttribute('data-value'))) {
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
            this.myCellNode.classList.add('given');
            this.myCellNode.classList.remove('solved');
        } else {
            this.myCellNode.classList.add('solved');
            this.myCellNode.classList.remove('given');
        }
    }

    displayMainValueNode(value) {
        // this.myCellNode.setAttribute('data-value', value);
        this.myCellNode.innerHTML = value;
    }


    displayCellError() {
        this.myCellNode.classList.add('err');
    }

    displayRowError() {
        this.myCellNode.classList.add('row-err');
    }

    displayColError() {
        this.myCellNode.classList.add('col-err');
    }

    setSelected() {
        this.myCellNode.classList.add('selected');
    }

    unsetSelected() {
        this.myCellNode.classList.remove('selected');
    }

    setAutoSelected() {
        this.myCellNode.classList.add('auto-selected');
    }
    unsetAutoSelected() {
        this.myCellNode.classList.remove('auto-selected');
    }

    setBorderSelected() {
        if (sudoApp.mySolver.myCurrentSearch.myStepper.indexSelected !==
            this.myIndex) {
            this.myCellNode.classList.add('hover');
        }
    }
    setBorderRedSelected() {
        this.myCellNode.classList.add('hover-red');
    }

    setOverlay() {
        this.myOverlayNode.style.display = "block";
    }
    unsetOverlay() {
        this.myOverlayNode.style.display = "none";
    }

    setBorderGreenSelected() {
        // this.myCellNode.classList.add('hover-green');
        this.myOverlayNode.style.display = "block";
    }
    setBorderWhiteSelected() {
        this.myCellNode.classList.add('hover-white');
    }
    setBorderBlackSelected() {
        this.myCellNode.classList.add('hover-black');
    }


    unsetBorderSelected() {
        this.myCellNode.classList.remove('hover');
        this.myCellNode.classList.remove('hover-red');
        this.myCellNode.classList.remove('hover-green');
        this.myCellNode.classList.remove('hover-white');
        this.myCellNode.classList.remove('hover-black');
    }

    setAutoSelectStatus() {
        // Die Zelle als automatisch selektiert markieren
        this.setAutoSelected();
        let currentStep = sudoApp.mySolver.myCurrentSearch.myStepper.myBackTracker.currentStep;
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

        if (this.myCell.myValue == '0' && this.myCellNode.children.length == 0) {
            // Die Zelle ist noch nicht gesetzt
            this.displayCandidates();
            this.displayNecessary(this.myCell.myNecessarys);
            this.displayInAdmissibleCandidates(this.myCell.inAdmissibleCandidates, cell.myNecessarys);
        }

        for (let candidate of this.myCellNode.children) {
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
            while (this.myCellNode.firstChild) {
                this.myCellNode.removeChild(this.myCellNode.lastChild);
            }
        } else {
            for (let candidate of this.myCellNode.children) {
                candidate.style = "text-decoration: ";
            }
        }
    }

    displayTasks() {
        if (this.myCell.myNecessarys.size > 0) {
            let collection = this.myCell.myNecessaryGroups.get(Array.from(this.myCell.myNecessarys)[0]);
            collection.myCells.forEach(e => {
                if (e !== this.myCell) {
                    if (e.getValue() == '0') {
                        //e.myView.setBorderGreenSelected();
                        sudoApp.mySolverView.myGridView.sudoCellViews[e.myIndex].setBorderGreenSelected();
                        e.myInfluencers.forEach(cell => {
                            if (cell.getValue() == Array.from(this.myCell.myNecessarys)[0]) {
                                //cell.myView.setBorderWhiteSelected();
                                sudoApp.mySolverView.myGridView.sudoCellViews[cell.myIndex].setBorderWhiteSelected();
                            }
                        });
                    }
                }
            });
            sudoApp.mySolverView.displayTechnique('Notwendige ' + Array.from(this.myCell.myNecessarys)[0] +
                ' in dieser Gruppe setzen.');
            return;
        }
        if (this.myCell.getCandidates().size == 1) {
            sudoApp.mySolverView.displayTechnique('Single ' + Array.from(this.myCell.getCandidates())[0] + ' in dieser Zelle setzen.');

            if (this.myCell.getCandidates().size == 1) {
                let single = Array.from(this.myCell.getCandidates())[0];
                let numberSet = new MatheSet(['1', '2', '3', '4', '5', '6', '7', '8', '9']);
                numberSet.forEach(nr => {
                    if (nr !== single) {
                        let coveredNrs = new MatheSet();
                        this.myCell.myInfluencers.forEach(cell => {
                            if (cell.getValue() == nr) {
                                if (!coveredNrs.has(nr)) {
                                    sudoApp.mySolverView.myGridView.sudoCellViews[cell.myIndex].setBorderWhiteSelected();
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
        if (this.myCell.getTotalCandidates().size == 1) {
            sudoApp.mySolverView.displayTechnique('Hidden Single ' + Array.from(this.myCell.getTotalCandidates())[0] + ' in dieser Zelle setzen.');
            if (sudoApp.mySolver.getAutoDirection() == 'forward') {
                sudoApp.breakpointPassed('hiddenSingle');
            }
            return;
        }
        if (this.myCell.getTotalCandidates().size > 1) {
            sudoApp.mySolverView.displayTechnique('Aus mehreren Kandidaten eine Nummer setzen.');
            if (sudoApp.mySolver.getAutoDirection() == 'forward') {
                sudoApp.breakpointPassed('multipleOption');
            }
        }
        return;
    }

    displayReasons() {
        let adMissibleNrSelected = this.myCell.getAdMissibleNrSelected();

        if (this.myCell.myNecessarys.size > 0) {
            if (adMissibleNrSelected == Array.from(this.myCell.myNecessarys)[0]) {
                let collection = this.myCell.myNecessaryGroups.get(Array.from(this.myCell.myNecessarys)[0]);
                this.myBlockView.displayNecessaryCandidate();
                collection.myCells.forEach(e => {
                    if (e !== this.myCell) {
                        if (e.getValue() == '0') {
                            e.myView.setBorderGreenSelected();
                            e.myView.setOverlay();
                            e.myInfluencers.forEach(cell => {
                                if (cell.getValue() == Array.from(this.myCell.myNecessarys)[0]) {
                                    sudoApp.mySolverView.myGridView.sudoCellViews[cell.myIndex].setBorderWhiteSelected();
                                }
                            });
                        }
                    }
                });
                sudoApp.mySolverView.displayTechnique('Notwendige ' + Array.from(this.myCell.myNecessarys)[0] +
                    ' in dieser Gruppe setzen.');
                return;
            }
        }

        if (this.myCell.inAdmissibleCandidates.size > 0 &&
            this.myCell.inAdmissibleCandidatesFromPairs.size > 0) {
            if (this.myCell.inAdmissibleCandidatesFromPairs.has(adMissibleNrSelected)) {
                // Wenn für die selektierte Zelle kritische Paare gespeichert sind,
                // dann gibt es in der Zelle indirekt unzulässige Nummern, die durch sie
                // verursacht werden.
                // Die Block, Spalte oder Zeile des Paares wird markiert.
                let pairArray = [];
                let pairInfo = this.myCell.inAdmissibleCandidatesFromPairs.get(adMissibleNrSelected);
                pairInfo.collection.myCells.forEach(cell => {
                    if (cell !== this.myCell) {
                        sudoApp.mySolverView.myGridView.sudoCellViews[cell.myIndex].setBorderSelected();
                    }
                });
                sudoApp.mySolverView.myGridView.sudoCellViews[pairInfo.pairCell1.myIndex].setBorderRedSelected();
                sudoApp.mySolverView.myGridView.sudoCellViews[pairInfo.pairCell2.myIndex].setBorderRedSelected();

                pairArray = Array.from(pairInfo.pairCell1.getTotalCandidates());
                sudoApp.mySolverView.displayTechnique(
                    adMissibleNrSelected
                    + ' eliminierbar wegen "Nacktem Paar" {'
                    + pairArray[0]
                    + ', '
                    + pairArray[1] + '}');
                return;
            }
        }

        if (this.myCell.inAdmissibleCandidates.size > 0 &&
            this.myCell.inAdmissibleCandidatesFromIntersection.size > 0) {

            let info = this.myCell.inAdmissibleCandidatesFromIntersectionInfo.get(adMissibleNrSelected);
            // In case of several inadmissible candidates, the currently selected candidate may
            // not match the currently analysed criterion. In this case, info is undefined.
            if (info !== undefined) {
                info.block.getMyCells().forEach(cell => {
                    sudoApp.mySolverView.myGridView.sudoCellViews[cell.myIndex].setBorderSelected();
                });
                if (info.row !== undefined) {
                    info.row.getMyCells().forEach(cell => {
                        sudoApp.mySolverView.myGridView.sudoCellViews[cell.myIndex].setBorderSelected();
                    });
                }
                if (info.col !== undefined) {
                    info.col.getMyCells().forEach(cell => {
                        sudoApp.mySolverView.myGridView.sudoCellViews[cell.myIndex].setBorderSelected();
                    });
                }

                sudoApp.mySolverView.displayTechnique(adMissibleNrSelected + ' eliminierbar wegen Überschneidung');
                return;
            }
        }

        if (this.myCell.inAdmissibleCandidates.size > 0 &&
            this.myCell.inAdmissibleCandidatesFromPointingPairs.size > 0) {

            let info = this.myCell.inAdmissibleCandidatesFromPointingPairsInfo.get(adMissibleNrSelected);
            // In case of several inadmissible candidates, the currently selected candidate may
            // not match the currently analysed criterion. In this case, info is undefined.
            if (info !== undefined) {
                if (info.row !== undefined) {
                    info.row.getMyCells().forEach(cell => {
                        sudoApp.mySolverView.myGridView.sudoCellViews[cell.myIndex].setBorderSelected();
                    });
                }
                if (info.col !== undefined) {
                    info.col.getMyCells().forEach(cell => {
                        sudoApp.mySolverView.myGridView.sudoCellViews[cell.myIndex].setBorderSelected();
                    });
                }
                info.pVector.myCells.forEach(cell => {
                    if (cell.getValue() == '0' && cell.getTotalCandidates().has(adMissibleNrSelected)) {
                        sudoApp.mySolverView.myGridView.sudoCellViews[cell.myIndex].unsetSelected();
                        sudoApp.mySolverView.myGridView.sudoCellViews[cell.myIndex].setBorderRedSelected();
                    }
                })
                sudoApp.mySolverView.displayTechnique(adMissibleNrSelected
                    + ' eliminierbar wegen Zeiger-Paar');
                return;
            }
        }

        if (this.myCell.inAdmissibleCandidates.size > 0 &&
            this.myCell.inAdmissibleCandidatesFromHiddenPairs.size > 0) {
            if (this.myCell.inAdmissibleCandidatesFromHiddenPairs.has(adMissibleNrSelected)) {
                // Für ein Subpaar muss nicht jede einzelne Nummer geprüft werden.
                // 
                let pairArray = [];
                const [pairInfo] = this.myCell.inAdmissibleCandidatesFromHiddenPairs.values();
                pairInfo.collection.myCells.forEach(cell => {
                    if (cell == pairInfo.subPairCell1 || cell == pairInfo.subPairCell2) {
                        sudoApp.mySolverView.myGridView.sudoCellViews[cell.myIndex].setBorderRedSelected();
                        if (pairArray.length == 0) {
                            pairArray = Array.from(cell.getTotalCandidates());
                        }
                    } else {
                        sudoApp.mySolverView.myGridView.sudoCellViews[cell.myIndex].setBorderSelected();
                    }
                });
                sudoApp.mySolverView.displayTechnique(
                    adMissibleNrSelected
                    + ' eliminierbar wegen "Verstecktem Paar" {'
                    + pairArray[0]
                    + ', '
                    + pairArray[1] + '}');
                return;
            }
        }
    };

    setSelectStatus() {
        this.setSelected();
        if (sudoApp.mySolver.isSearching()
            && sudoApp.mySolver.getAutoDirection() == 'forward') {
            if (this.myCell.candidateIndexSelected == -1) {
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
        sudoApp.mySolverView.displayTechnique('');
    }

    unsetAutoSelectStatus() {
        this.unsetAutoSelected();
    }

    displayWrongNumber() {
        if (this.myCell.isWrong()) {
            this.myCellNode.classList.add('wrong');
        }
    }

    displayBasicUnsolvability() {
        let mySolverView = sudoApp.mySolverView;
        // 1) The basic contradiction of the Sudoku is defined below. With this alone, the solver
        // would successfully solve the puzzles by backtracking. However, many more cells
        // would have to be set before an existing contradiction with this criterion would be uncovered.
        // All other criteria merely serve to uncover contradictions earlier.
        if (this.myCell.getValue() !== '0' && this.myCell.myDirectInAdmissibles().has(this.myCell.getValue())) {
            this.myCell.myInfluencers.forEach(influencerCell => {
                if (influencerCell.getValue() == this.myCell.getValue()) {
                    sudoApp.mySolverView.myGridView.sudoCellViews[influencerCell.myIndex].displayCellError();
                }
            })
            this.displayCellError();
            mySolverView.displayReasonUnsolvability('Die Nummer ' + this.myCell.getValue() + ' ist bereits einmal gesetzt.');
            return true;
        }
        mySolverView.displayReasonUnsolvability('');
    }

    displayUnsolvability() {
        this.displayBasicUnsolvability();
        let mySolverView = sudoApp.mySolverView;
        // 1) The basic contradiction of the Sudoku is defined below. With this alone, the solver
        // would successfully solve the puzzles by backtracking. However, many more cells
        // would have to be set before an existing contradiction with this criterion would be uncovered.
        // All other criteria merely serve to uncover contradictions earlier.
        if (this.myCell.getValue() !== '0' && this.myCell.myDirectInAdmissibles().has(this.myCell.getValue())) {
            this.myCell.myInfluencers.forEach(influencerCell => {
                if (influencerCell.getValue() == this.myCell.getValue()) {
                    sudoApp.mySolverView.myGridView.sudoCellViews[influencerCell.myIndex].displayCellError();
                }
            })
            this.displayCellError();
            mySolverView.displayReasonUnsolvability('Die Nummer ' + this.myCell.getValue() + ' ist bereits einmal gesetzt.');
            return true;
        }
        // 2) The unsolvability is already recognized if there is no longer any admissible candidate at all. 
        // any more.
        if (sudoApp.mySolver.getActualEvalType() == 'lazy-invisible' || sudoApp.mySolver.getActualEvalType() == 'lazy') {
            if (this.myCell.getValue() == '0' && this.myCell.getCandidates().size == 0) {
                this.displayCellError();
                mySolverView.displayReasonUnsolvability('Überhaupt keine zulässige Nummer.');
                return true;
            }
        } else if (sudoApp.mySolver.getActualEvalType() == 'strict-plus' || sudoApp.mySolver.getActualEvalType() == 'strict-minus') {
            if (this.myCell.getValue() == '0' && this.myCell.getTotalCandidates().size == 0) {
                this.displayCellError();
                mySolverView.displayReasonUnsolvability('Überhaupt keine zulässige Nummer.');
                return true;
            }
        }
        // 3) The inconsistency is also already established if two different required numbers are to be set in a cell at the same time.
        if (this.myCell.getValue() == '0' && this.myCell.myNecessarys.size > 1) {
            this.displayCellError();
            mySolverView.displayReasonUnsolvability('Gleichzeitig verschiedene notwendige Nummern.');
            return true;
        }

        mySolverView.displayReasonUnsolvability('');
        return false;
    }
}

class SudokuSolverView {
    constructor(solver) {
        this.mySolver = solver;
        this.myGridView = new SudokuGridView(solver.myGrid);

        this.solutionNumber = undefined;

        this.solutionFieldNode = document.getElementById("nr-of-solutions-field");
        this.nrOfSolutionsNode = document.getElementById("number-of-solutions");

        this.progressBar = new ProgressBar();
    }

    init() {
        this.myGridView.upDate();
    }

    upDate() {
        // Redisplay the complete solver
        // Display puzzle name and difficulty 
        sudoApp.mySolverView.myGridView.displayNameAndDifficulty();

        this.myGridView.upDate();
        // Indication that the puzzle cannot be solved, if this is the case
        this.displayProgress();
        // Display status applicability of the undo/redo buttons
        this.displayUndoRedo();
        this.displayGamePhase();
        if (this.mySolver.isSearching()) {
            if (this.mySolver.myCurrentSearch.getNumberOfSolutions() > 0 ) {
                this.setNumberOfSolutions(this.mySolver.myCurrentSearch.getNumberOfSolutions());
            }
        } else {
            this.reSetNumberOfSolutions();
        }
    }
    setNumberOfSolutions(nr) {
        this.solutionNumber = nr;
        this.nrOfSolutionsNode.innerHTML =
            '&nbsp' + this.solutionNumber;
        this.solutionFieldNode.style.backgroundColor =
            'var(--played-cell-bg-color)';
    }
    reSetNumberOfSolutions() {
        this.solutionNumber = 0;
        this.nrOfSolutionsNode.innerHTML = '&nbsp' + this.solutionNumber;
        this.solutionFieldNode.style.backgroundColor =
            'var(--nested-cell-bg-color)';
    }
    getNumberOfSolutions() {
        return this.solutionNumber;
    }



    displayProgress() {
        let progressBlock = document.getElementById("progress-block");
        let stepCountBox = document.getElementById("step-count-box");
        let autoModeRadioBtns = document.getElementById("autoMode-radio-btns");
        if (this.mySolver.isSearching()) {
            let mySearch = this.mySolver.myCurrentSearch;
            // let myStepper = this.getMyModel().myCurrentSearch.myStepper;
            progressBlock.style.gridTemplateColumns = "1fr 0.2fr 1fr";
            stepCountBox.style.display = "flex";
            autoModeRadioBtns.style.display = "flex";
            // this.displayGoneSteps(myStepper.getGoneSteps());
            this.displayGoneSteps(mySearch.getNumberOfSteps());
            let tmpLevel = sudoApp.mySolver.myCurrentPuzzle.myRecord.preRunRecord.level;
            if (tmpLevel == 'Sehr schwer') {
                this.displayBackwardCount(mySearch.myStepper.countBackwards);
            } else {
                this.displayBackwardCount('none');
            }
            this.displayAutoDirection(mySearch.myStepper.getAutoDirection());
        } else {
            // In case of no active automatic search 
            // the step count field is not dislayed
            stepCountBox.style.display = "none";
            autoModeRadioBtns.style.display = "none";
            progressBlock.style.gridTemplateColumns = "1fr";
        }
        this.displayProgressBar();
    }

    upDateAspect(aspect, aspectValue) {
        switch (aspect) {
            case 'solutionDiscovered': {
                if (sudoApp.mySolver.myCurrentSearch.trackerDlgUserCall == 'trackerDlgStepSequencePressed'
                    && sudoApp.getMySettings().breakpoints.solutionDiscovered
                ) {
                    let header = 'Laufende Lösung: ' + aspectValue;
                    let infoString = sudoApp.mySolver.getSolutionInfo();
                    sudoApp.myInfoDialog.open(
                        header,
                        'info',
                        infoString,
                        this,
                        () => { }
                    );
                }
                break;
            }
            case 'nrOfSolutions': {
                sudoApp.mySolverView.setNumberOfSolutions(aspectValue);
                break;
            }
            case 'searchIsCompleted': {
                sudoApp.mySolverView.upDate();
                // This is not the prerun calculation. 
                // Have a look at method "computeBasicPreRunRecord()". 
                // Therefore, the following step replaces
                // --> sudoApp.mySolver.searchInfos2PuzzleRecord();
                // by
                // -->  sudoApp.mySolver.numberOfSolutions2PuzzleRecord();
                // Only the number of solutions must be transferred from search
                // to the puzzle record.
                sudoApp.mySolver.numberOfSolutions2PuzzleRecord();
                this.publishSearchIsCompleted(aspectValue);
                break;
            }
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

    publishSearchIsCompleted(nrSol) {
        if (nrSol == 0) {
            sudoApp.myInfoDialog.open('Lösungssuche', 'info', 'Das Puzzle hat keine Lösung!<br>Suche abgeschlossen.', this, () => { });
        } else {

            /*
            if (nrSol == 1) {
                sudoApp.mySolverView.showPuzzleSolutionInfo(nrSol + ' Lösung');
            } else {
                sudoApp.mySolverView.showPuzzleSolutionInfo(nrSol + ' Lösungen');
            }
            */
            sudoApp.myInfoDialog.open('Lösungssuche', 'info', 'Keine weitere Lösung!<br>Suche abgeschlossen.', this, () => { });
        }
    }

    displayUndoRedo() {
        let undoBtn = document.getElementById('btn-undo');
        let redoBtn = document.getElementById('btn-redo');
        if (sudoApp.mySolverController.myUndoActionStack.length > 0) {
            undoBtn.classList.add('btn-undo-off');
        } else {
            undoBtn.classList.remove('btn-undo-off');
        }

        if (sudoApp.mySolverController.myRedoActionStack.length > 0) {
            redoBtn.classList.add('btn-redo-off');
        } else {
            redoBtn.classList.remove('btn-redo-off');
        }
    }

    displayGamePhase() {
        // Show the current game phase on the two buttons 
        // 'define' and 'play' by displaying the respective button 
        // in the pressed status
        let gamePhase = this.mySolver.getGamePhase();
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

    displayPuzzleIOTechniqueBtns() {
        let shareBtn = document.getElementById('share-button');
        let initDBButton = document.getElementById('db-pz-btn-init');
        let downloadDBButton = document.getElementById('db-puzzle-btn-download-db');
        let downloadPzButton = document.getElementById('db-puzzle-btn-download-pz');
        let uploadButton = document.getElementById('db-puzzle-btn-upload');

        shareBtn.style.display = 'block';
        initDBButton.style.display = 'block';
        downloadDBButton.style.display = 'block';
        downloadPzButton.style.display = 'block';
        uploadButton.style.display = 'block';
    }

    displayProgressBar() {
        let myGrid = this.mySolver.myGrid;
        let countDef = myGrid.numberOfGivens();
        let countTotal = myGrid.numberOfNonEmptyCells();
        this.progressBar.setValue(countDef, countTotal);
    }

    displayReasonUnsolvability(reason) {
        let reasonNode = document.getElementById("reasonUnsolvability");
        let evalNode = document.getElementById("technique-row");
        if (reason == '') {
            reasonNode.style.display = "none";
            evalNode.style.display = "flex";
        } else {
            reasonNode.style.display = "block";
            evalNode.style.display = "none";
            reasonNode.innerHTML =
                '<b>Widerspruch:</b> &nbsp' + reason;
        }
    }

    displayTechnique(tech) {
        let evalNode = document.getElementById("technique");
        if (this.mySolver.getActualEvalType() == 'lazy') {
            if (tech.includes('Single') ||
                tech.includes('Aus mehreren') ||
                tech.includes('Notwendig')) {
                evalNode.style.color = 'black';
            } else {
                evalNode.style.color = 'Crimson';
            }
            evalNode.innerHTML = tech;
        } else if (this.mySolver.getActualEvalType() == 'lazy-invisible') {
            evalNode.style.color = 'darkgreen';
            evalNode.innerHTML = tech;
        }
        let tippOkBtn = document.getElementById("tipp-accept-btn");
        if (sudoApp.mySolver.isSearching()) {
            if (sudoApp.mySolver.myCurrentSearch.isTipSearch) {
                tippOkBtn.style.display = "flex";
            } else {
                tippOkBtn.style.display = "none";
            }
        } else {
            tippOkBtn.style.display = "none";
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
                + '<b>Error-RL:</b> &nbsp' + countBackwards;
        }
    }

    displayBackwardCount(countBackwards) {
        let evalNode = document.getElementById("backward-count");
        if (countBackwards == 'none') {
            evalNode.innerHTML = '';
        } else {
            evalNode.innerHTML =
                '&nbsp <b>Error-RL:</b> &nbsp' + countBackwards;
        }
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

        this.myCurrentTrackerBtnPressed = undefined;

        // =============================================================
        // The events of the solver are set
        // =============================================================

        // Set click event for the number buttons
        this.number_inputs = document.querySelectorAll('.number-btn');
        this.number_inputs.forEach((e, index) => {
            e.addEventListener('click', () => {
                let btnNumber = this.number_inputs[index].value.toString();
                this.handleNumberPressed(btnNumber);
                this.number_inputs[index].blur();
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
                case "9": {
                    this.handleKeyNumberPressed(event);
                    break;
                }
                case "Delete":
                case "Backspace": {
                    this.handleDeleteKeyPressed(event);
                    break;
                }
                case "ArrowUp":
                case "ArrowDown":
                case "ArrowLeft":
                case "ArrowRight": {
                    this.handleArrowKeyPressed(event);
                    break;
                }
                default:
            }
        });

        document.addEventListener('keydown', function (event) {
            if (event.ctrlKey && (event.key === 'v' || event.key === 'V')) {
                sudoApp.mySolverController.pasteLinkPressed();
            }
        });

        document.addEventListener('keydown', function (event) {
            if (event.ctrlKey && (event.key === 'c' || event.key === 'C')) {
                sudoApp.mySolverController.copyLinkPressed();
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
                this.resetBtnPressed();
            })
        });

        let resetButton = document.getElementById('search-reset-btn');
        resetButton.addEventListener('click', () => {
            this.searchResetBtnPressed();
        });


        this.btns = document.querySelectorAll('.btn-tip');
        this.btns.forEach(btn => {
            btn.addEventListener('click', () => {
                this.tipPressed();
            })
        });

        let tippOkBtn = document.getElementById("tipp-accept-btn");
        tippOkBtn.addEventListener('click', () => {
            this.tippOkBtnPressed();
        });
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
                let tmpIndex = sudoApp.mySolver.myGrid.indexSelected;
                this.clickNrBtn(event.key);
                sudoApp.mySolver.myGrid.setCurrentSelection(tmpIndex);
                sudoApp.mySolver.notify();
                break;
            }
            default: {
                throw new Error('Unexpected keypad event target: ' + event.target.tagName);
            }
        }
    }

    clickNrBtn(nr) {
        let nrBtns = document.querySelectorAll("number-btn");
        nrBtns.forEach(btn => {
            if (btn.innerHTML == nr) {
                btn.click();
            }
        });
    }

    clickDeleteBtn() {
        let delBtns = document.getElementsByClassName("btn-delete-cell")
        delBtns[0].click();
    }



    handleNumberPressed(nr) {
        if (!this.mySolver.isSearching()) {
            // Prevent setting a number when a tip is shown.
            let action = {
                operation: 'setNr',
                cellIndex: this.mySolver.myGrid.indexSelected,
                cellValue: nr
            }
            if (action.cellIndex > -1) {
                this.mySolver.atCurrentSelectionSetNumber(nr);
                this.myUndoActionStack.push(action);
                if (this.mySolver.succeeds()) {
                    sudoApp.myInfoDialog.open("Herzlichen Glückwunsch!", 'solutionDiscovered', "Du hast das Puzzle erfolgreich gelöst!",
                        this, () => { }
                    );
                }
                if (this.mySolver.isSearching()) {
                    this.mySolver.cleanUpAndDeleteCurrentSearch();
                    this.mySolver.notify();
                }
                this.mySolver.myGrid.unsetStepLazy();
                this.mySolver.deselect();
                this.mySolver.notify();
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
                let tmpIndex = sudoApp.mySolver.myGrid.indexSelected;
                this.clickDeleteBtn();
                sudoApp.mySolver.myGrid.setCurrentSelection(tmpIndex);
                sudoApp.mySolver.notify();
                break;
            }
            default: {
                // 'BUTTON'
                // throw new Error('Unexpected keypad event target: ' + event.target.tagName);
            }
        }
    }

    handleArrowKeyPressed(event) {
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
                this.handleArrowPressed(event);
                break;
            }
            default: {
                // 'BUTTON'
                // throw new Error('Unexpected keypad event target: ' + event.target.tagName);
            }
        }
    }


    handleArrowPressed(event) {
        let newIndex = -1;
        if (sudoApp.mySolver.myGrid.indexSelected > -1) {
            switch (event.key) {
                case "ArrowUp": {
                    newIndex = sudoApp.mySolver.myGrid.upIndex(sudoApp.mySolver.myGrid.indexSelected);
                    break;
                }
                case "ArrowDown": {
                    newIndex = sudoApp.mySolver.myGrid.downIndex(sudoApp.mySolver.myGrid.indexSelected);
                    break;
                }
                case "ArrowLeft": {
                    newIndex = sudoApp.mySolver.myGrid.leftIndex(sudoApp.mySolver.myGrid.indexSelected);
                    break;
                }
                case "ArrowRight": {
                    newIndex = sudoApp.mySolver.myGrid.rightIndex(sudoApp.mySolver.myGrid.indexSelected);
                    break;
                }
                default:
            }
        } else {
            newIndex = 0;
        }
        sudoApp.mySolver.myGrid.setCurrentSelection(newIndex);
        sudoApp.mySolver.notify();
    }

    handleDeletePressed() {
        if (this.mySolver.isSearching()) {
            // Number button pressed during automatic execution
            sudoApp.myInfoDialog.open("Nummer löschen", "negativ",
                "Während der Solver-Ausführung kann manuell keine Zelle gelöscht werden.", this, () => { });
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
        this.mySolver.cleanUpAndDeleteCurrentSearch();
        this.mySolver.unsetStepLazy();
        this.mySolver.unsetCurrentPuzzle();
        this.mySolver.myGrid.setSolvedToGiven();
        this.mySolver.setGamePhase('define');
        this.mySolver.notify();
    }

    async playBtnPressed() {
        // Switching to the play phase means that the definition of the puzzle 
        // has been finished.
        // After switching to the play phase, the puzzles meta-data 
        // are calculated in the background and are stored in a new puzzle record.
        // This includes the solution of the new puzzle. The latter allows, the user to have 
        // his current number settings checked. There is a call button for this check.

        // Delete last search
        this.mySolver.cleanUpAndDeleteCurrentSearch();
        if (this.mySolver.getMyCurrentPuzzle() !== undefined) {
            // The solver is already in the game phase 'play'.
            // In this case we recompute the puzzle's meta data 
            // but do not create a new puzzle.
            let previousPuzzle = new Puzzle(this.mySolver.myCurrentPuzzle.myRecord);
            let puzzleRecord = await this.mySolver.calculatePuzzleRecord();
            this.mySolver.setCurrentPuzzle(puzzleRecord);
            // Retain the identity of the previous record
            this.mySolver.myCurrentPuzzle.setIdentity(previousPuzzle.getIdentity());
        } else {
            this.mySolver.setGamePhase('play');
            // this.initUndoActionStack();
            this.mySolver.notify();
            let puzzleRecord = await this.mySolver.calculatePuzzleRecord();
            this.mySolver.setCurrentPuzzle(puzzleRecord);
        }
        this.mySolver.notify();
    }

    async startBtnPressed() {
        if (this.mySolver.isSearching()) {
            // The previous action was pressing the tip button
            // This is due to the fact that the start button is 
            // displayed and pressed while the solver is in search mode.
            // The start button press makes the previous tip press undone
            this.mySolver.cleanUpAndDeleteCurrentSearch();
            this.mySolver.unsetStepLazy();
            sudoApp.mySolverView.displayReasonUnsolvability('');
            this.mySolver.notify();
        } else {
            this.initUndoActionStack();
            if (this.mySolver.getGamePhase() == 'define') {
                // Switching to the play phase means that the definition of the puzzle 
                // has been finished.
                // After switching to the play phase, the puzzle's meta-data 
                // are calculated in the background and are stored in a new puzzle record.
                await this.playBtnPressed();
            }
            this.mySolver.tryStartAutomaticSearch();
            if (this.mySolver.isSearching()) {
                sudoApp.mySolver.myGrid.evaluateMatrix();
                sudoApp.myTrackerDialog.open();
            }
        }
    }

    initLinkPressed() {
        // navigation bar init pressed
        sudoApp.myClockedRunner.stop('cancelled');
        sudoApp.myTrackerDialog.close();
        sudoApp.myNavBar.closeNav();

        let puzzleRec;
        if (this.mySolver.myCurrentPuzzle == undefined) {
            puzzleRec = undefined;
        } else {
            puzzleRec = this.mySolver.myCurrentPuzzle.myRecord;
        }
        let action = {
            operation: 'init',
            pzRecord: puzzleRec,
            pzArray: this.mySolver.myGrid.getPuzzleArray()
        }
        this.myUndoActionStack.push(action);


        this.mySolver.reInit();
        this.mySolver.notify();
        // Zoom in the new initiated grid
        this.mySolver.notifyAspect('puzzleLoading', undefined);
    }

    tippOkBtnPressed() {
        let action = this.trackerDlgStepPressed();
        if (action !== undefined) {
            if (action.operation == 'setNr') {
                this.myUndoActionStack.push(action);
            }
        }
        this.trackerDlgStopPressed();
    }

    searchResetBtnPressed() {
        this.trackerDlgStopPressed();
        this.resetBtnPressed();
        this.startBtnPressed();
    }
    resetBtnPressed() {
        sudoApp.myNavBar.closeNav();

        if (sudoApp.mySolver.getGamePhase() == 'define') {
            sudoApp.myInfoDialog.open("Puzzle zurücksetzen", "negativ",
                "Das Puzzle ist noch in der Definition. Daher kann es nicht zurückgesetzt werden.", this, () => { });
        } else {

            this.mySolver.unsetStepLazy();
            sudoApp.mySolverView.displayReasonUnsolvability('');

            let tmpIndex = sudoApp.mySolver.myGrid.indexSelected;
            this.resetOperation();
            if (tmpIndex !== -1) {
                sudoApp.mySolver.myGrid.setCurrentSelection(tmpIndex);
            }
            sudoApp.mySolver.notify();
            let resetBtn = document.getElementById('btn-reset');
            resetBtn.blur();
            let gridPlusExplainer = document.getElementById('grid-plus-explainer');
            gridPlusExplainer.focus({ focusVisible: false });
        }
    }

    tipPressed() {
        if (this.mySolver.isSearching()) {
            // The previous action was pressing the tip button.
            // This is due to the fact that the tip button is 
            // displayed and pressed while the solver is in search mode.
            // The newly tip button press makes the previous press undone
            this.mySolver.cleanUpAndDeleteCurrentSearch();
            this.mySolver.unsetStepLazy();
            sudoApp.mySolverView.displayReasonUnsolvability('');
            this.mySolver.notify();
        } else {
            if (sudoApp.mySolver.getGamePhase() == 'define') {
                sudoApp.myInfoDialog.open("Tipp", "negativ",
                    "Das Puzzle ist noch in der Definition.<br> Für unfertige Puzzles kann kein Tipp gegeben werden.", this, () => { });
            } else if (sudoApp.mySolver.myCurrentPuzzle.getLevel() == 'Extrem schwer') {
                sudoApp.myInfoDialog.open("Tipp", "negativ",
                    "Für extrem schwere Puzzles kann kein Tipp gegeben werden.", this, () => { });
            } else {
                this.mySolver.myCurrentSearch = new Search();
                if (sudoApp.mySolver.myGrid.isUnsolvable()) {
                    this.mySolver.myCurrentSearch.myStepper.setAutoDirection('backward');
                };
                this.mySolver.myCurrentSearch.isTipSearch = true;
                // Select the next cell
                this.mySolver.performSearchStep();
                this.mySolver.notify();
            }
        }
        let tippBtn = document.getElementById('btn-tip');
        tippBtn.blur();
        let gridPlusExplainer = document.getElementById('grid-plus-explainer');
        gridPlusExplainer.focus({ focusVisible: false });
    }


    newPuzzleOkay() {
        var ele = document.getElementsByName('level');
        for (let i = 0; i < ele.length; i++) {
            if (ele[i].checked) {
                let puzzleRecord = sudoApp.myNewPuzzleBuffer.getPuzzle(ele[i].value)
                this.mySolver.myGrid.deselect();
                this.mySolver.loadPuzzleRecord(puzzleRecord);
                sudoApp.mySolver.notify();
                // let gridPlusExplainer = document.getElementById('grid-plus-explainer');
                // gridPlusExplainer.focus();       
            }
        }
    }
    newPuzzleCancelled() {
        // Nothing to do
    }

    resetOperation() {
        let puzzleRec = this.mySolver.myCurrentPuzzle.myRecord;
        let action = {
            operation: 'reset',
            pzRecord: puzzleRec,
            pzArray: this.mySolver.myGrid.getPuzzleArray()
        }
        this.myUndoActionStack.push(action);
        this.mySolver.reset();
        this.mySolver.notify();
    }

    resetConfirmed() {
        this.resetOperation();
        this.mySolver.myCurrentSearch = new Search();
        sudoApp.mySolver.myGrid.evaluateMatrix();
        sudoApp.myTrackerDialog.open();
    }

    resetRejected() {
        this.mySolver.myCurrentSearch = new Search();
        sudoApp.myTrackerDialog.open();
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
            case 'init':
            case 'paste':
            case 'reset':
            case 'define': {
                this.mySolver.setCurrentPuzzle(action.pzRecord);
                sudoApp.mySolver.myGrid.loadPuzzleArray(action.pzArray);
                this.mySolver.setGamePhase('play');
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

    async redo(action) {
        switch (action.operation) {
            case 'paste': {
                await this.pasteLinkPressed();
                break;
            }
            case 'init': {
                this.initLinkPressed();
                break;
            }
            case 'reset': {
                this.resetBtnPressed();
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



    generateLinkPressed(level) {
        function onRequestResponse(puzzleRecord) {
            // We got the desired puzzle and do not longer wait
            // for new puzzles in the store.
            // The rotating loader icon is stopped.
            aspectValue = {
                op: 'finished',
                rl: ''
            }
            sudoApp.mySolver.notifyAspect('puzzleGenerator', aspectValue);
            //The puzzle taken from the store is loaded into the solver
            sudoApp.mySolver.loadPuzzleRecord(puzzleRecord);
            // Puzzles generated into the store are in solved state.
            // So the loaded puzzle must be reset.
            sudoApp.mySolver.reset();
            sudoApp.mySolver.notify();
            sudoApp.mySolver.notifyAspect('puzzleLoading', undefined);
        }

        // Initialze
        sudoApp.myClockedRunner.stop('cancelled');
        sudoApp.myTrackerDialog.close();

        sudoApp.mySolver.reInit();

        sudoApp.myNavBar.closeNav();
        // Now we are waiting for the buffer to be filled.
        // The rotating loader icon is started.
        let aspectValue = {
            op: 'started',
            rl: level
        }
        sudoApp.mySolver.notifyAspect('puzzleGenerator', aspectValue);
        let puzzleRecord = sudoApp.myNewPuzzleBuffer.getPuzzle(level);
        if (puzzleRecord !== undefined) {
            onRequestResponse(puzzleRecord);
        } else {
            // the requested puzzle not yet available
            // Save the request to prioritize it after generating 
            // a new puzzle. Normally, new puzzles are saved in the puzzle buffer.

            switch (level) {
                case 'Sehr leicht': {
                    sudoApp.myNewPuzzleBuffer.myVerySimplePuzzleRequests.push(new PuzzleRequest(
                        sudoApp.myNewPuzzleBuffer,
                        level,
                        onRequestResponse
                    ))
                    break;
                }
                case 'Leicht': {
                    sudoApp.myNewPuzzleBuffer.mySimplePuzzleRequests.push(new PuzzleRequest(
                        sudoApp.myNewPuzzleBuffer,
                        level,
                        onRequestResponse
                    ))
                    break;
                }
                case 'Mittel': {
                    sudoApp.myNewPuzzleBuffer.myMediumPuzzleRequests.push(new PuzzleRequest(
                        sudoApp.myNewPuzzleBuffer,
                        level,
                        onRequestResponse
                    ))
                    break;
                }
                case 'Schwer': {
                    sudoApp.myNewPuzzleBuffer.myHeavyPuzzleRequests.push(new PuzzleRequest(
                        sudoApp.myNewPuzzleBuffer,
                        level,
                        onRequestResponse
                    ))
                    break;
                }
                case 'Sehr schwer': {

                    sudoApp.myNewPuzzleBuffer.myVeryHeavyPuzzleRequests.push(new PuzzleRequest(
                        sudoApp.myNewPuzzleBuffer,
                        level,
                        onRequestResponse
                    ))
                    break;
                }
                case 'Extrem schwer': {
                    sudoApp.myNewPuzzleBuffer.myExtremeHeavyPuzzleRequests.push(new PuzzleRequest(
                        sudoApp.myNewPuzzleBuffer,
                        level,
                        onRequestResponse
                    ))
                    break;
                }
                default: {
                    throw new Error('Unexpected difficulty: '
                        + puzzleRecord.preRunRecord.level);
                }
            }


        }
    }

    async saveBtnPressed() {
        if (sudoApp.mySolver.getGamePhase() == 'define') {
            sudoApp.myInfoDialog.open("Puzzle speichern", "negativ",
                "Das Puzzle ist noch in der Definition. Daher kann es nicht gespeichert werden.", this, () => { });
        } else {
            // transfer grid state into the puzzle record
            // this.mySolver.grid2puzzle();
            this.mySolver.grid2puzzleRecord(this.mySolver.myCurrentPuzzle.myRecord);

            if (!sudoApp.myPuzzleDB.has(this.mySolver.getLoadedPuzzleUID())) {
                // The loaded puzzle is not yet element in the database.
                // Save loaded puzzle with new name in the database
                // A default name is defined
                let newPuzzleName = 'PZ';
                // the current puzzle gets this name
                this.mySolver.setLoadedPuzzleName(newPuzzleName);
                // The user is asked for a name
                sudoApp.myCurrentPuzzleSaveRenameDlg.open(
                    sudoApp.mySolverController.savePuzzleDlgOKPressed,
                    sudoApp.mySolverController.savePuzzleDlgCancelPressed,
                    this.mySolver.myCurrentPuzzle.myRecord);
            } else {
                // The current puzzle is already element in the database
                // So only the actual puzzle state needs to be saved
                let puzzle = this.mySolver.myCurrentPuzzle.myRecord;
                let storedPuzzle = sudoApp.myPuzzleDB.getPuzzleRecord(puzzle.id);
                puzzle.date = storedPuzzle.date;
                sudoApp.myPuzzleDB.savePuzzle(puzzle);
                sudoApp.myPuzzleDB.notify();
                sudoApp.myInfoDialog.open('Spielstand gespeichert', "positiv",
                    'Puzzle: \"' + this.mySolver.myCurrentPuzzle.myRecord.name + '\"', this, () => { });
            }
        }
    }

    openDBLinkPressed() {
        sudoApp.myPuzzleDBDialog.open();
        sudoApp.myPuzzleDB.notify();
        sudoApp.myNavBar.closeNav();
    }

    openSettingsDlgPressed() {
        if (sudoApp.myClockedRunner.isRunning()) {
            sudoApp.myClockedRunner.stop('cancelled');
            sudoApp.mySolverView.stopLoaderAnimation();
        }
        sudoApp.mySettingsDialog.open();
        sudoApp.myNavBar.closeNav();
    }

    btnBreakPointSettingsPressed() {
        if (sudoApp.myClockedRunner.isRunning()) {
            sudoApp.myClockedRunner.stop('cancelled');
            sudoApp.mySolverView.stopLoaderAnimation();
        }
        sudoApp.mySettingsDialog.openTopicBreakpoints();
    }

    newLinkPressed() {
        sudoApp.myNavBar.closeNav();
        sudoApp.myTrackerDialog.close();
        sudoApp.myNewPuzzleDlg.open(
            "Neues Puzzle",
            "Wähle Schwierigkeitsgrad des neuen Puzzles");
    }

    async copyLinkPressed() {
        sudoApp.myNavBar.closeNav();
        try {
            if (navigator?.clipboard?.writeText) {
                await navigator.clipboard.writeText(sudoApp.mySolver.myGrid.getPuzzleString());
                sudoApp.myCopyFeedbackDialog.open();
            }
        } catch (err) {
            console.error(err);
        }
    }

    async copyMatrixLinkPressed() {
        sudoApp.myNavBar.closeNav();
        try {
            if (navigator?.clipboard?.writeText) {
                await navigator.clipboard.writeText(sudoApp.mySolver.myGrid.getReadablePuzzleString());
                sudoApp.myCopyFeedbackDialog.open();
            }
        } catch (err) {
            console.error(err);
        }
    }
    async pasteLinkPressed() {

        sudoApp.myNavBar.closeNav();

        let puzzleRec;
        if (this.mySolver.myCurrentPuzzle == undefined) {
            puzzleRec = undefined;
        } else {
            puzzleRec = this.mySolver.myCurrentPuzzle.myRecord;
        }
        let action = {
            operation: 'paste',
            pzRecord: puzzleRec,
            pzArray: this.mySolver.myGrid.getPuzzleArray()
        }
        this.myUndoActionStack.push(action);

        try {
            let text0 = await navigator.clipboard.readText();
            // Delete ---- horizontal border lines
            let text1 = text0.replace(/^--.-*\r?\n?/gm, "");
            // Delete carriage return and newlines
            let text2 = text1.replace(/(\r\n|\n|\r)/gm, "");
            // normalize empty cell representations to '0'
            let text3 = text2.replaceAll('.', '0');
            let text4 = text3.replaceAll('X', '0');
            let text5 = text4.replaceAll('x', '0');
            let text6 = text5.replaceAll('_', '0');
            let text7 = text6.replaceAll('*', '0');
            // Delete vertical border lines
            let text = text7.replaceAll('|', '');

            // text should now consist of digits only
            let numberRegex = /^\d+$/;
            if (numberRegex.test(text) && text.length == 81) {
                sudoApp.mySolver.myGrid.loadPuzzleString(text);
                sudoApp.mySolver.myGrid.evaluateMatrix();
                this.defineBtnPressed();
                this.playBtnPressed();
            } else {
                sudoApp.myInfoDialog.open("Clipboard Puzzle einfügen", 'negativ',
                    "Kein gültiges Puzzle im Clipboard.",
                    this, () => { }
                );
            }
        } catch (error) {
            console.log('Failed to read clipboard puzzle');
        }

        this.mySolver.notify();
        // Zoom in the new initiated grid
        this.mySolver.notifyAspect('puzzleLoading', undefined);

    }

    printLinkPressed() {
        sudoApp.myNavBar.closeNav();
        if (sudoApp.mySolver.getGamePhase() == 'define') {
            sudoApp.myInfoDialog.open("Puzzle drucken", "negativ",
                "Das Puzzle ist noch in der Definition. Daher kann es nicht gedruckt werden.", this, () => { });
        } else {
            // this.mySolver.stopBackTrackingSearch();
            sudoApp.myTrackerDialog.close();
            if (!sudoApp.myPuzzleDB.has(this.mySolver.myCurrentPuzzle.myRecord.id)) {
                // The current puzzle is not yet an element in the database.
                // Save the current puzzle with a new name in the database.
                let newName = 'Druck';
                this.mySolver.myCurrentPuzzle.myRecord.name = newName;
                sudoApp.myPuzzleDB.savePuzzle(this.mySolver.myCurrentPuzzle.myRecord);
            }
            // The current puzzle is element in the database.
            // Before printing save the current state.
            let storedPuzzle = sudoApp.myPuzzleDB.getPuzzleRecord(this.mySolver.myCurrentPuzzle.myRecord.id);
            // this.mySolver.grid2puzzle();
            this.mySolver.grid2puzzleRecord(this.mySolver.myCurrentPuzzle.myRecord);
            this.mySolver.myCurrentPuzzle.myRecord.date = storedPuzzle.date;
            sudoApp.myPuzzleDB.savePuzzle(this.mySolver.myCurrentPuzzle.myRecord);
            // Print the saved puzzle
            sudoApp.myPuzzleDBController.printSelectedPuzzle();
            // The saved and printed puzzle becomes the new current puzzle
            let puzzleRecord = sudoApp.myPuzzleDB.getSelectedPuzzle();
            sudoApp.mySolver.loadPuzzleRecord(puzzleRecord);
            sudoApp.mySolver.notify();
        }
    }

    showWrongNumbersBtnPressed() {
        // Flags incorrectly set numbers and checks for contradiction.
        // The property set below indicates that this check operation is in progress. 
        // It has the effect that the display of the current puzzle includes 
        // the display of its possible unfulfillability. 
        // Normally, the unfulfillability is not displayed.

        function setFocusBack() {
            let wrongNumbersBtn = document.getElementById('btn-showWrongNumbers');
            wrongNumbersBtn.blur();
            let gridPlusExplainer = document.getElementById('grid-plus-explainer');
            gridPlusExplainer.focus({ focusVisible: false });
        }

        if (sudoApp.mySolver.getGamePhase() == 'define') {
            sudoApp.myInfoDialog.open("Prüfen", "negativ",
                "Das Puzzle ist noch in der Definition.<br> Für unfertige Puzzles gibt es keine sinnvollen Prüfungen.",
                this, setFocusBack
            );
        } else {

            let level = sudoApp.mySolver.myCurrentPuzzle.myRecord.preRunRecord.level;
            if (level == 'Unlösbar') {
                if (sudoApp.mySolver.myGrid.isUnsolvable()) {
                    sudoApp.mySolver.notify();
                    let level = sudoApp.mySolver.myCurrentPuzzle.myRecord.preRunRecord.level;
                    sudoApp.myInfoDialog.open('Starte Suche', 'negativ', 'Schwierigkeitsgrad: ' + level +
                        '. <br><br> Das aktuelle Puzzle ist unlösbar. Starte die Suche, um den Widerspruch anzuzeigen.',
                        this, setFocusBack
                    );
                } else {
                    sudoApp.myInfoDialog.open('Prüfergebnis', 'info', 'Schwierigkeitsgrad: ' + level +
                        '. <br><br> Der aktuelle Puzzle-Status zeigt noch keinen Widerspruch.<br> Im weiteren Verlauf der automatischen Lösungssuche wird ein expliziter Widerspruch aufgedeckt werden.',
                        this, setFocusBack);
                }
            } else if (level == 'Extrem schwer') {
                sudoApp.myInfoDialog.open('Prüfergebnis', 'info', 'Schwierigkeitsgrad: ' + level +
                    '. Das Puzzle hat mehrere Lösungen. <br><br> Mit dem Solver können die Anzahl der Lösungen sowie die Lösungen selbst hergeleitet werden.',
                    this, setFocusBack
                );
            } else {
                // Level is fair or 'Sehr schwer', i.e. has a unique solution
                let wrongCellSet = false;
                let solvedPuzzle = sudoApp.mySolver.myCurrentPuzzle.myRecord.preRunRecord.solvedPuzzle;
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
                    sudoApp.mySolverView.myGridView.displayWrongNumbers();
                    sudoApp.myInfoDialog.open("Prüfergebnis", "negativ", "Es gibt falsche Lösungsnummern, siehe rot umrandete Zellen!",
                        this, setFocusBack
                    );
                } else {
                    sudoApp.myInfoDialog.open('Prüfergebnis', 'positiv', 'Bisher sind alle Lösungsnummern korrekt!', this, setFocusBack);
                }
            }
        }
    }

    // ===============================================================================================
    // Solver buttons
    // ===============================================================================================

    // Button Nächster Suchschritt
    trackerDlgStepPressed() {
        sudoApp.mySolver.myCurrentSearch.trackerDlgUserCall = 'trackerDlgStepPressed';
        let action = undefined;
        // Nächster Suchschritt
        if (sudoApp.myClockedRunner.isRunning()) {
            sudoApp.myClockedRunner.stop('cancelled');
            sudoApp.mySolverView.stopLoaderAnimation();
            sudoApp.mySolver.notify();
        } else {
            if (sudoApp.mySolver.myCurrentSearch.isCompleted()) {
                // Not able to start
                sudoApp.mySolver.notifyAspect('searchIsCompleted',
                    sudoApp.mySolver.myCurrentSearch.getNumberOfSolutions());
            } else {
                action = sudoApp.mySolver.performSearchStep();
                sudoApp.mySolver.notify();

            }
        }
        return action;
    }

    // Button Suchlauf mit Haltepunkten
    trackerDlgStepSequencePressed() {
        // Suchlauf mit Haltepunkten
        sudoApp.mySolver.myCurrentSearch.trackerDlgUserCall = 'trackerDlgStepSequencePressed';
        if (sudoApp.myClockedRunner.isRunning()) {
            sudoApp.myClockedRunner.stop('cancelled');
            sudoApp.mySolverView.stopLoaderAnimation();
            sudoApp.mySolver.notify();

        } else {
            if (sudoApp.mySolver.myCurrentSearch.isCompleted()) {
                // Not able to start
                sudoApp.mySolver.notifyAspect('searchIsCompleted', sudoApp.mySolver.myCurrentSearch.getNumberOfSolutions());
            } else {
                // Repeat the execution of the step 'performSearchStep()'
                // until the next active BreakPoint is reached.
                sudoApp.myClockedRunner.setBreakpoints(sudoApp.getMySettings().breakpoints);
                sudoApp.myClockedRunner.start(sudoApp.mySolver,
                    () => {
                        sudoApp.mySolver.performSearchStep();
                        sudoApp.mySolver.notify();
                    },
                    75);

            }
        }
    }

    // Button Weitere Lösung anzeigen
    trackerDlgFastStepPressed() {
        sudoApp.mySolver.myCurrentSearch.trackerDlgUserCall = 'trackerDlgFastStepPressed';
        // Weitere Lösung
        if (sudoApp.myClockedRunner.isRunning()) {
            sudoApp.myClockedRunner.stop('cancelled');
            sudoApp.mySolverView.stopLoaderAnimation();
            sudoApp.mySolver.notify();
        } else {
            if (sudoApp.mySolver.myCurrentSearch.isCompleted()) {
                // Not able to start
                sudoApp.mySolver.notifyAspect('searchIsCompleted', sudoApp.mySolver.myCurrentSearch.getNumberOfSolutions());
            } else {
                sudoApp.mySolverView.startLoaderAnimation('Weitere Lösung');
                setTimeout(() => {
                    this.trackerDlgFastStep();
                    sudoApp.mySolverView.stopLoaderAnimation();
                }, 1000);
            }
            sudoApp.mySolver.notify();
        }
    }

    trackerDlgFastStep() {
        // Called by trackerDlgFastStepPressed()
        if (sudoApp.myClockedRunner.isRunning()) {
            sudoApp.myClockedRunner.stop('cancelled');
            sudoApp.mySolverView.stopLoaderAnimation();
            sudoApp.mySolver.notify();
        }
        let stoppingBP = sudoApp.mySolver.performSolutionStep();
        sudoApp.mySolver.notify();

        if (stoppingBP == 'solutionDiscovered') {
            let header = 'Laufende Lösung: ' + sudoApp.mySolver.myCurrentSearch.myNumberOfSolutions;
            let infoString = sudoApp.mySolver.getSolutionInfo();
            sudoApp.myInfoDialog.open(
                header,
                'info',
                infoString,
                this,
                () => { }
            );
        }

    }


    trackerDlgCountSolutionsPressed() {
        // Button Lösungen zählen ...
        sudoApp.mySolver.myCurrentSearch.trackerDlgUserCall = 'trackerDlgCountSolutionsPressed';

        if (sudoApp.myClockedRunner.isRunning()) {
            sudoApp.myClockedRunner.stop('cancelled');
            sudoApp.mySolverView.stopLoaderAnimation();
            sudoApp.mySolver.notify();
            let header = 'Laufende Lösung: ' + sudoApp.mySolver.myCurrentSearch.myNumberOfSolutions;
            let infoString = sudoApp.mySolver.getSolutionInfo();
            sudoApp.myInfoDialog.open(
                header,
                'info',
                infoString,
                this,
                () => { }
            );

        } else {
            if (sudoApp.mySolver.myCurrentSearch.isCompleted()) {
                // Not able to start
                sudoApp.mySolver.notifyAspect('searchIsCompleted', sudoApp.mySolver.myCurrentSearch.getNumberOfSolutions());
            } else {
                // Repeat the execution of the step 'performSolutionStep()'
                // until the 'searchCompleted'-BreakPoint is reached.
                let breakPts = {
                    contradiction: false,
                    multipleOption: false,
                    single: false,
                    hiddenSingle: false,
                    solutionDiscovered: false
                }
                sudoApp.myClockedRunner.setBreakpoints(breakPts);
                sudoApp.mySolverView.startLoaderAnimation('Lösungen zählen ...');
                sudoApp.myClockedRunner.start(sudoApp.mySolver,
                    () => {
                        let bp = sudoApp.mySolver.performSolutionStep();
                        if (bp == 'searchCompleted') {
                            sudoApp.mySolverView.stopLoaderAnimation();
                        }
                    }, 0);

            }
        }
    }

    // Button Schließen
    trackerDlgStopPressed() {
        sudoApp.mySolverView.stopLoaderAnimation();
        sudoApp.myClockedRunner.stop('cancelled');
        sudoApp.myTrackerDialog.close();
        this.mySolver.cleanUpAndDeleteCurrentSearch();
        this.mySolver.unsetStepLazy();
        this.mySolver.deselect();
        sudoApp.mySolverView.displayReasonUnsolvability('');
        this.mySolver.notify();
    }

    // ====================================================================================

    infoDlgOKPressed() {
        sudoApp.myInfoDialog.close();
    }

    puzzleIOcheckboxOnchange() {
        let pIOcheckbox = document.getElementById('puzzle-io');
        let appSetting = undefined;
        let str_appSetting = localStorage.getItem("sudokuAppSetting");
        appSetting = JSON.parse(str_appSetting);
        str_appSetting = JSON.stringify(appSetting);
        localStorage.setItem("sudokuAppSetting", str_appSetting);
    }

    savePuzzleDlgOKPressed() {
        sudoApp.myCurrentPuzzleSaveRenameDlg.close();
        let currentPuzzle = sudoApp.mySolver.myCurrentPuzzle.myRecord;
        currentPuzzle.name = sudoApp.myCurrentPuzzleSaveRenameDlg.getPuzzleName();
        sudoApp.myPuzzleDB.savePuzzle(currentPuzzle);
        sudoApp.myPuzzleDB.notify()
        sudoApp.mySolver.loadPuzzleRecord(sudoApp.myPuzzleDB.getSelectedPuzzle());
        sudoApp.mySolver.notify();
    }

    savePuzzleDlgCancelPressed() {
        sudoApp.myCurrentPuzzleSaveRenameDlg.close();
    }
}

// ==========================================
// Apps 
// ==========================================

// Launch and initialize the app

startMainApp();
