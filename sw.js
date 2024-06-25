
// Change this to your repository name
var GHPATH = 'https://hubertbertling.github.io/sudokuTrainer';
// var GHPATH = 'http://localhost:8080/sudokuTrainer';

// Choose a different app prefix name
var APP_PREFIX = 'sudo_';

// The version of the cache. Every time you change any of the files
// you need to change this version (version_01, version_02…). 
// If you don't change the version, the service worker will give your
// users the old files!
var VERSION = 'version_527';

// The files to make available for offline use. make sure to add 
// others to this list
var URLS = [
  `${GHPATH}/`,
  `${GHPATH}/CSS/widescreen.css`,
  `${GHPATH}/CSS/smallscreenNew.css`,
  `${GHPATH}/CSS/print.css`,
  `${GHPATH}/index.html`,
  `${GHPATH}/manifest.json`,
  `${GHPATH}/help.html`,
  `${GHPATH}/JS/sudokuMainApp.js`,
  `${GHPATH}/JS/fastSolverWorker.js`,
  `${GHPATH}/JS/generatorWorker.js`,
  `${GHPATH}/JS/sudokuCommon.js`,
  `${GHPATH}/images/aktionDateien.png`,
  `${GHPATH}/images/AppView.png`,
  `${GHPATH}/images/AppView2.png`,
  `${GHPATH}/images/AppView3.png`,
  `${GHPATH}/images/Architektur.png`,
  `${GHPATH}/images/autoSelectted.png`,
  `${GHPATH}/images/caret-down.png`,
  `${GHPATH}/images/closeSolver.png`,
  `${GHPATH}/images/conflct.png`,
  `${GHPATH}/images/define.png`,
  `${GHPATH}/images/definedCell.png`,
  `${GHPATH}/images/direkterSingle.png`,
  `${GHPATH}/images/download.png`,
  `${GHPATH}/images/downloadDB.png`,
  `${GHPATH}/images/drucker.png`,
  `${GHPATH}/images/einstellungKandidatenAuswertung.png`,
  `${GHPATH}/images/einstellungSpielmodus.png`,
  `${GHPATH}/images/exampleStep1.png`,
  `${GHPATH}/images/exampleStep2.png`,
  `${GHPATH}/images/exampleStep285_1.png`,
  `${GHPATH}/images/exampleStep285_2.png`,
  `${GHPATH}/images/exampleStep285_3.png`,
  `${GHPATH}/images/exampleStep285_4.png`,
  `${GHPATH}/images/exampleStep30.png`,
  `${GHPATH}/images/exampleStep410.png`,
  `${GHPATH}/images/exampleStep60.png`,
  `${GHPATH}/images/exampleStep65.png`,
  `${GHPATH}/images/exampleStep66.png`,
  `${GHPATH}/images/fail.png`,
  `${GHPATH}/images/glueckwunsch.jpg`,
  `${GHPATH}/images/haltePunkteTaste.png`,
  `${GHPATH}/images/hiddenpair.png`,
  `${GHPATH}/images/import.png`,
  `${GHPATH}/images/indirect.png`,
  `${GHPATH}/images/indirekterSingle.png`,
  `${GHPATH}/images/indirektWegenPairing.png`,
  `${GHPATH}/images/indirektwgnotwendig.png`,
  `${GHPATH}/images/info.png`,
  `${GHPATH}/images/initialsieren.png`,
  `${GHPATH}/images/install.png`,
  `${GHPATH}/images/installEdge.png`,
  `${GHPATH}/images/lazynotwendig.png`,
  `${GHPATH}/images/lupe.png`,
  `${GHPATH}/images/manualSelected.png`,
  `${GHPATH}/images/menuEinstellung.png`,
  `${GHPATH}/images/naechsterSchritt.png`,
  `${GHPATH}/images/neccessary.png`,
  `${GHPATH}/images/nextSolution.png`,
  `${GHPATH}/images/no-caret.png`,
  `${GHPATH}/images/nochoice.png`,
  `${GHPATH}/images/nochoice2.png`,
  `${GHPATH}/images/ok.png`,
  `${GHPATH}/images/optionCell.png`,
  `${GHPATH}/images/pfeilrueckwaerts.png`,
  `${GHPATH}/images/pfeilvorwaerts.png`,
  `${GHPATH}/images/play.png`,
  `${GHPATH}/images/play-96.png`,
  `${GHPATH}/images/playedCell.png`,
  `${GHPATH}/images/pointingPair.png`,
  `${GHPATH}/images/pruefungfehler.png`,
  `${GHPATH}/images/PuzzleDB.png`,
  `${GHPATH}/images/questionMark.png`,
  `${GHPATH}/images/redo.png`,
  `${GHPATH}/images/rename.png`,
  `${GHPATH}/images/reset.png`,
  `${GHPATH}/images/s1024.png`,
  `${GHPATH}/images/s256.png`,
  `${GHPATH}/images/s512.png`,
  `${GHPATH}/images/save.png`,
  `${GHPATH}/images/schrittSequenz.png`,
  `${GHPATH}/images/screenshot-282x563.jpg`,
  `${GHPATH}/images/screenshot-527x434.jpg`,
  `${GHPATH}/images/share.png`,
  `${GHPATH}/images/shareButton.png`,
  `${GHPATH}/images/solution.png`,
  `${GHPATH}/images/solutionsequence.png`,
  `${GHPATH}/images/solutionSequenceBtn.png`,
  `${GHPATH}/images/step.png`,
  `${GHPATH}/images/stepsequence.png`,
  `${GHPATH}/images/stop-96.png`,
  `${GHPATH}/images/strictplus.png`,
  `${GHPATH}/images/striktminus.png`,
  `${GHPATH}/images/sudoku.png`,
  `${GHPATH}/images/tastenauswahlAutomatik.png`,
  `${GHPATH}/images/TastenauswahlManuell.png`,
  `${GHPATH}/images/teilenURLApp.png`,
  `${GHPATH}/images/teilenURLApp2.png`,
  `${GHPATH}/images/times200.png`,
  `${GHPATH}/images/twoNeccessary.png`,
  `${GHPATH}/images/ueberschneidung.png`,
  `${GHPATH}/images/undo.png`,
  `${GHPATH}/images/upload.png`,
  `${GHPATH}/images/zahnrad.png`
]

const CACHE_NAME = APP_PREFIX + VERSION

self.addEventListener('fetch', function (event) {

  /*
    const url = new URL(event.request.url);
    if (event.request.method === 'POST' && url.pathname === '/' && url.searchParams.has('share-target')) {
        event.respondWith(Response.redirect('/?receiving-file-share=1'));
        console.log('Responding with /?receiving-file-share=1');
        event.waitUntil(async function () {
            const client = await self.clients.get(event.resultingClientId);
            const data = await event.request.formData();
            const files = data.get('file');
            client.postMessage({ files });
        }());
        return;
    }
    */
  // ...
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


/*
self.addEventListener('fetch', event => {
    const url = new URL(event.request.url);

    if (event.request.method === 'POST' && url.pathname === '/store-code-snippet') {
        event.respondWith((async () => {
            const data = await event.request.formData();

            const filename = data.get('title');
            const file = data.get('textFile');

            const reader = new FileReader();
            reader.onload = function(e) {
                const textContent = e.target.result;

                // Do something with the textContent here.

            };
            reader.readAsText(file);

            return Response.redirect('/snippet-stored-success', 303);
        })());
    }
});

//service-worker.js:
https://mconverter.eu/blog/web_share_target_api/

self.addEventListener('fetch', (event) => {
  const url = new URL(event.request.url);
  if (event.request.method === 'POST' && url.pathname === '/' && url.searchParams.has('share-target')) {
      event.respondWith(Response.redirect('/?receiving-file-share=1'));

      event.waitUntil(async function () {
          const client = await self.clients.get(event.resultingClientId);
          const data = await event.request.formData();
          const files = data.get('file');
          client.postMessage({ files });
      }());
      return;
  }

 // ...

});
*/