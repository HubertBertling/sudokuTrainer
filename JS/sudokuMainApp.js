// ==========================================================================
// Service Worker
// ==========================================================================

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
                alert('Dateityp nicht unterstützt!');
            }
        });
    }
} else {
    alert('Dieser Browser unterstützt den Zugriff auf lokale Dateien nicht');
}

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

// ==========================================================================
// Share sudokuTrainer URL
// ==========================================================================

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

// Launch and initialize the app
function startMainApp() {
    sudoApp = new SudokuMainApp();
    sudoApp.init();
}
//==========================================================

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
    init() {
        /* Loop through all dropdown buttons to toggle between hiding and showing 
        its dropdown content - This allows the user to have multiple dropdowns 
        without any conflict */
        // var dropdown = document.getElementsByClassName("dropdown-btn");
        /*
        let caretDownImg = document.getElementById('caret-down-img');
        let noCaretImg = document.getElementById('no-caret-img');
        var i;
        noCaretImg.style.display = "block";
        caretDownImg.style.display = "none";
        
       var i;
        for (i = 0; i < dropdown.length; i++) {
            dropdown[i].addEventListener("click", function () {
                this.classList.toggle("active");
                var dropdownContent = this.nextElementSibling;
                if (dropdownContent.style.display === "block") {
                    // noCaretImg.style.display = "block";
                    // caretDownImg.style.display = "none";
                    dropdownContent.style.display = "none";
                } else {
                    dropdownContent.style.display = "block";
                    // noCaretImg.style.display = "none";
                    // caretDownImg.style.display = "block";
                }
            });
        }
            */
    }
    openNav() {
        document.getElementById("mySidenav").style.width = "250px";
    }
    closeNav() {
        // let dropdown = document.getElementById("dropdown-btn-new");
        // let dropdownContent = document.getElementById("dropdown-container-btn-new");
        // if (dropdownContent.style.display === "block") {
        //    dropdown.click();
        // }
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
            sudoApp.myClockedRunner.stop('cancelled');
            sudoApp.mySyncRunner.stop('cancelled');

            sudoApp.mySolver.cleanUpAndDeleteCurrentSearch();
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
        this.myConfirmOperation = undefined;
        this.thisPointer = undefined;
        // Mit der Erzeugung des Wrappers werden 
        // auch der Eventhandler OK und Abbrechen gesetzt
        this.okNode.addEventListener('click', () => {
            sudoApp.myInfoDialog.close();
            sudoApp.myInfoDialog.myConfirmOperation.call(this.thisPointer);
            // sudoApp.mySolver.notify();  15.01.25 FB Prüfentaste
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
            ['countSolutions', 'desc'],
            ['date', 'desc']
        ]);
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

        this.init
        console.log('------>  initDB vor: ------back23');
        await this.importBackRunPuzzle(back23, 'Backtrack_23', 'lqwgzcback23g2ak');
        console.log('------>  initDB nach: -------back23');
        await this.importBackRunPuzzle(back10, 'Backtrack_10', 'lqgwgzcback9hpfg2ak');
        console.log('------>  initDB nach: -------back10');
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
            currentPuzzleRecord.name = 'Geteilt (' + new Date().toLocaleString('de-DE') + ')';
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
            sudoApp.mySolverView.hidePuzzleSolutionInfo();
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
        let pz = this.myPuzzleDB.getSelectedPuzzle();
        let pzName = pz.name;
        /* sudoApp.myConfirmDlg.open(sudoApp.myPuzzleDBController,
            sudoApp.myPuzzleDBController.delete,
            "Puzzle löschen",
            'Soll das Puzzle \"' + pzName + '\" endgültig gelöscht werden?');
            */
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
        ) {
            // Die Unlösbarkeit wird nur angezeigt und geprüft,
            // wenn der Automat läuft oder in der Definitionsphase.
            this.displayUnsolvability();
        }
        this.displaySelection();
        this.displayAutoSelection();
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
            && sudoApp.mySolver.myCurrentSearch.myStepper.indexSelected !== -1) {
            let selectedCell = grid.sudoCells[sudoApp.mySolver.myCurrentSearch.myStepper.indexSelected];
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
                && sudoApp.mySolver.myCurrentSearch.myStepper.indexSelected > -1)) {

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
            && sudoApp.mySolver.myCurrentSearch.myStepper.indexSelected > -1) {
            let candidate = Array.from(tmpCandidates)[0]
            let candidateNode = document.createElement('div');
            candidateNode.setAttribute('data-value', candidate);
            candidateNode.classList.add('single');
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
            && sudoApp.mySolver.myCurrentSearch.myStepper.indexSelected > -1) {

            let candidate = Array.from(tmpCandidates)[0]
            let candidateNode = document.createElement('div');
            candidateNode.setAttribute('data-value', candidate);
            candidateNode.innerHTML = candidate;
            candidateNode.classList.add('single');
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
            && sudoApp.mySolver.myCurrentSearch.myStepper.indexSelected > -1) {
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
        if (this.myCell.myGrid.mySolver.myCurrentSearch.myStepper.indexSelected !==
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

        let progressBlock = document.getElementById("progress-block");
        let stepCountBox = document.getElementById("step-count-box");
        let autoModeRadioBtns = document.getElementById("autoMode-radio-btns");
        if (this.getMyModel().isSearching()) {
            let mySearch = this.getMyModel().myCurrentSearch;
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
            stepCountBox.style.display = "none";
            autoModeRadioBtns.style.display = "none";
            progressBlock.style.gridTemplateColumns = "1fr";
        }
        this.displayProgress();
        this.displayEvalType(this.getMyModel().getActualEvalType());
        this.displayBreakpoints(sudoApp.myClockedRunner.myBreakpoints);
        this.displayUndoRedo();
        this.displayPuzzleIOTechniqueBtns();
        this.setSolvingButtons();
        sudoApp.mySolver.myGrid.getMyView().displayNameAndDifficulty();
    }

    displayPuzzleSolutionInfo() {
        let puzzle = this.getMyModel().myCurrentPuzzle;
        if (puzzle !== undefined) {
            if (puzzle.getNumberOfSolutions() == 0) {
                this.showPuzzleSolutionInfo('Keine Lösung!');
            } else {
                if (puzzle.getNumberOfSolutions() == 1) {
                    this.showPuzzleSolutionInfo('1 Lösung');
                } else {
                    this.showPuzzleSolutionInfo(puzzle.getNumberOfSolutions() + ' Lösungen');
                }
            }
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
        let btnTip = document.getElementById('btn-tip');
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

        btnTip.style.display = 'none';
        btnRun.style.display = 'none';

    }

    setSolvingButtons() {
        let btnReset = document.getElementById('btn-reset')
        let btnShowWrongNumbers = document.getElementById('btn-showWrongNumbers');
        let btnTip = document.getElementById('btn-tip');
        let btnRun = document.getElementById('btn-run');

        btnReset.style.gridColumnStart = 1;
        btnReset.style.gridColumnEnd = 2;
        btnReset.style.gridRowStart = 4;
        btnReset.style.gridRowEnd = 4;

        btnShowWrongNumbers.style.gridColumnStart = 2;
        btnShowWrongNumbers.style.gridColumnEnd = 3;
        btnShowWrongNumbers.style.gridRowStart = 4;
        btnShowWrongNumbers.style.gridRowEnd = 4;

        // btnTip.style.display = 'grid';
        btnTip.style.gridColumnStart = 3;
        btnTip.style.gridColumnEnd = 4;
        btnTip.style.gridRowStart = 4;
        btnTip.style.gridRowEnd = 4;

        btnRun.style.gridColumnStart = 4;
        btnRun.style.gridColumnEnd = 6;
        btnRun.style.gridRowStart = 4;
        btnRun.style.gridRowEnd = 4;

        btnTip.style.display = 'grid';
        btnRun.style.display = 'grid';
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
                '&nbsp <b>Zurück:</b> &nbsp' + countBackwards;
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

//==========================================================
startMainApp();
