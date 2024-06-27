if (window.File && window.FileReader
    && window.FileList && window.Blob) {
    // Dateiverarbeitung 
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

// file handling

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



// Launch and initialize the app
startMainApp();