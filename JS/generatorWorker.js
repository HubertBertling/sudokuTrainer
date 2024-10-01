// The Web Worker imports the common code
importScripts('./sudokuCommon.js');

// The Web Worker is assigned a message handler.

self.addEventListener("message", (event) => {
    let request = JSON.parse(event.data);
    if (request.name == "generate") {
        try {
            // If the message is "generate", the Web Worker generates a new puzzle
            let puzzleRecord = sudoApp.myGenerator.generatePuzzle();
            let response = {
                name: 'generated',
                value: puzzleRecord
            }
            let str_response = JSON.stringify(response);
            // The serialized puzzle is sent as a message to Main
            // respond on the received port
            event.ports[0].postMessage({ result: str_response });
            event.ports[0].close();
        } catch (e) {
            event.ports[0].postMessage({ error: e });
        }
    }
}, false);

// Launch and initialize the worker app
startGeneratorApp();
