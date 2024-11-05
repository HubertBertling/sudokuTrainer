
// Change this to your repository name
var GHPATH = 'https://hubertbertling.github.io/sudokuTrainer';
// var GHPATH = 'http://localhost:8080/sudokuTrainer';

// Choose a different app prefix name
var APP_PREFIX = 'sudo_';

// The version of the cache. Every time you change any of the files
// you need to change this version (version_01, version_02…). 
// If you don't change the version, the service worker will give your
// users the old files!
var VERSION = 'version_723';

// The files to make available for offline use. make sure to add 
// others to this list
var URLS = [
  `${GHPATH}/`,
  `${GHPATH}/CSS/smallscreenNew.css`,
  `${GHPATH}/CSS/print.css`,
  `${GHPATH}/index.html`,
  `${GHPATH}/manifest.json`,
  `${GHPATH}/help.html`,
  `${GHPATH}/JS/sudokuMainApp.js`,
  `${GHPATH}/JS/fastSolverWorker.js`,
  `${GHPATH}/JS/generatorWorker.js`,
  `${GHPATH}/JS/sudokuCommon.js`,
  `${GHPATH}/images/caret-down.png`,
  `${GHPATH}/images/download.png`,
  `${GHPATH}/images/drucker.png`,
  `${GHPATH}/images/fail.png`,
  `${GHPATH}/images/glueckwunsch.jpg`,
  `${GHPATH}/images/import.png`,
  `${GHPATH}/images/info.png`,
  `${GHPATH}/images/lupe.png`,
  `${GHPATH}/images/menuEinstellung.png`,
  `${GHPATH}/images/no-caret.png`,
  `${GHPATH}/images/ok.png`,
  `${GHPATH}/images/pfeilrueckwaerts.png`,
  `${GHPATH}/images/pfeilvorwaerts.png`,
  `${GHPATH}/images/play-96.png`,
  `${GHPATH}/images/questionMark.png`,
  `${GHPATH}/images/redo.png`,
  `${GHPATH}/images/rename.png`,
  `${GHPATH}/images/reset.png`,
  `${GHPATH}/images/s256.png`,
  `${GHPATH}/images/s512.png`,
  `${GHPATH}/images/s1024.png`,
  `${GHPATH}/images/save.png`,
  `${GHPATH}/images/screenshotHandy.png`,
  `${GHPATH}/images/screenshot-527x434.png`,
  `${GHPATH}/images/share.png`,
  `${GHPATH}/images/solution.png`,
  `${GHPATH}/images/solutionsequence.png`,
  `${GHPATH}/images/step.png`,
  `${GHPATH}/images/stepsequence.png`,
  `${GHPATH}/images/stop-96.png`,
  `${GHPATH}/images/sudoku.png`,
  `${GHPATH}/images/times200.png`,
  `${GHPATH}/images/undo.png`,
  `${GHPATH}/images/upload.png`,
  `${GHPATH}/images/zahnrad.png`,
  `${GHPATH}/imagesHelp/aktionDateien.png`,
  `${GHPATH}/imagesHelp/AppView.png`,
  `${GHPATH}/imagesHelp/AppView2.png`,
  `${GHPATH}/imagesHelp/AppView3.png`,
  `${GHPATH}/imagesHelp/Architektur.png`,
  `${GHPATH}/imagesHelp/autoSelectted.png`,
  `${GHPATH}/imagesHelp/closeSolver.png`,
  `${GHPATH}/imagesHelp/conflct.png`,
  `${GHPATH}/imagesHelp/define.png`,
  `${GHPATH}/imagesHelp/definedCell.png`,
  `${GHPATH}/imagesHelp/direkterSingle.png`,
  `${GHPATH}/imagesHelp/downloadDB.png`,
  `${GHPATH}/imagesHelp/einstellungHaltepunkte.png`,
  `${GHPATH}/imagesHelp/einstellungKandidatenAuswertung.png`,
  `${GHPATH}/imagesHelp/einstellungSpielmodus.png`,
  `${GHPATH}/imagesHelp/exampleStep1.png`,
  `${GHPATH}/imagesHelp/exampleStep2.png`,
  `${GHPATH}/imagesHelp/exampleStep30.png`,
  `${GHPATH}/imagesHelp/exampleStep60.png`,
  `${GHPATH}/imagesHelp/exampleStep65.png`,
  `${GHPATH}/imagesHelp/exampleStep66.png`,
  `${GHPATH}/imagesHelp/exampleStep285_1.png`,
  `${GHPATH}/imagesHelp/exampleStep285_2.png`,
  `${GHPATH}/imagesHelp/exampleStep285_3.png`,
  `${GHPATH}/imagesHelp/exampleStep285_4.png`,
  `${GHPATH}/imagesHelp/exampleStep410.png`,
  `${GHPATH}/imagesHelp/haltePunkteTaste.png`,
  `${GHPATH}/imagesHelp/hiddenpair.png`,
  `${GHPATH}/imagesHelp/indirect.png`,
  `${GHPATH}/imagesHelp/indirekterSingle.png`,
  `${GHPATH}/imagesHelp/indirektWegenPairing.png`,
  `${GHPATH}/imagesHelp/indirektwgnotwendig.png`,
  `${GHPATH}/imagesHelp/initialsieren.png`,
  `${GHPATH}/imagesHelp/install.png`,
  `${GHPATH}/imagesHelp/install2.png`,
  `${GHPATH}/imagesHelp/lazynotwendig.png`,
  `${GHPATH}/imagesHelp/manualSelected.png`,
  `${GHPATH}/imagesHelp/menuEinstellung.png`,
  `${GHPATH}/imagesHelp/naechsterSchritt.png`,
  `${GHPATH}/imagesHelp/neccessary.png`,
  `${GHPATH}/imagesHelp/nextSolution.png`,
  `${GHPATH}/imagesHelp/nochoice.png`,
  `${GHPATH}/imagesHelp/nochoice2.png`,
  `${GHPATH}/imagesHelp/optionCell.png`,
  `${GHPATH}/imagesHelp/play.png`,
  `${GHPATH}/imagesHelp/playedCell.png`,
  `${GHPATH}/imagesHelp/pointingPair.png`,
  `${GHPATH}/imagesHelp/pruefungfehler.png`,
  `${GHPATH}/imagesHelp/PuzzleDB.png`,
  `${GHPATH}/imagesHelp/schrittSequenz.png`,
  `${GHPATH}/imagesHelp/shareButton.png`,
  `${GHPATH}/imagesHelp/single.png`,
  `${GHPATH}/imagesHelp/solutionSequenceBtn.png`,
  `${GHPATH}/imagesHelp/strictplus.png`,
  `${GHPATH}/imagesHelp/striktminus.png`,
  `${GHPATH}/imagesHelp/tastenauswahlAutomatik.png`,
  `${GHPATH}/imagesHelp/TastenauswahlManuell.png`,
  `${GHPATH}/imagesHelp/teilenURLApp.png`,
  `${GHPATH}/imagesHelp/teilenURLApp2.png`,
  `${GHPATH}/imagesHelp/twoNeccessary.png`,
  `${GHPATH}/imagesHelp/ueberschneidung.png`
]

const CACHE_NAME = APP_PREFIX + VERSION

self.addEventListener('fetch', function (event) {
  console.log('Fetch request : ' + event.request.url);
  event.respondWith(
    caches.match(event.request).then(function (request) {
      if (request) {
        console.log('Responding with cache : ' + event.request.url);
        return request
      } else {
        console.log('File is not cached, fetching : ' + event.request.url);
        return fetch(event.request)
      }
    })
  )
})
/*
// Entwurf, der noch nicht funktionierte.
// Nur Chrome unterstützt !!!
// Also nicht sehr interessant
self.addEventListener('fetch', event => {
  const url = new URL(event.request.url);

  if (event.request.method == 'POST' && url.pathname == '/sudokoTrainer/') {
    event.respondWith((async () => {
      const data = await event.request.formData();

      const filename = data.get('title');
      const file = data.get('puzzleFile');

      const reader = new FileReader();
      console.log('sudokuTrainer as share target recognized step 1.');
      reader.onload = function (e) {
        const textContent = e.target.result;
        // Do something with the textContent here.
        // let strFilePuzzleMap = reader.result;
        let strFilePuzzleMap = textContent;
        sudoApp.myPuzzleDB.upLoadPuzzle(strFilePuzzleMap);
        console.log('sudokuTrainer as share target recognized step 2');
      };
      reader.readAsText(file);
      console.log('sudokuTrainer as share target recognized step 3.');
      return Response.redirect('/sudokuTrainer/', 303);
    })());
  }
});
*/

self.addEventListener('install', function (e) {
  e.waitUntil(
    caches.open(CACHE_NAME).then(function (cache) {
      console.log('Installing cache : ' + CACHE_NAME);
      return cache.addAll(URLS)
    })
  )
})

self.addEventListener('activate', function (e) {
  e.waitUntil(
    caches.keys().then(function (keyList) {
      var cacheWhitelist = keyList.filter(function (key) {
        return key.indexOf(APP_PREFIX)
      })
      cacheWhitelist.push(CACHE_NAME);
      return Promise.all(keyList.map(function (key, i) {
        if (cacheWhitelist.indexOf(key) === -1) {
          console.log('Deleting cache : ' + keyList[i]);
          return caches.delete(keyList[i])
        }
      }))
    })
  )
})