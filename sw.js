
// Change this to your repository name
var GHPATH = 'https://hubertbertling.github.io/sudokuTrainer';
// var GHPATH = 'http://localhost:8080/sudokuTrainer';

// Choose a different app prefix name
var APP_PREFIX = 'sudo_';

// The version of the cache. Every time you change any of the files
// you need to change this version (version_01, version_02…). 
// If you don't change the version, the service worker will give your
// users the old files!
var VERSION = 'version_19';

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
  `${GHPATH}/images/caret-down.png`,
  `${GHPATH}/images/download.png`,
  `${GHPATH}/images/downloadDB.png`,
  `${GHPATH}/images/drucker.png`,
  `${GHPATH}/images/fail.png`,
  `${GHPATH}/images/glueckwunsch.jpg`,
  `${GHPATH}/images/import.png`,
  `${GHPATH}/images/info.png`,
  `${GHPATH}/images/lupe.png`,
  `${GHPATH}/images/no-caret.png`,
  `${GHPATH}/images/ok.png`,
  `${GHPATH}/images/pfeilrueckwaerts.png`,
  `${GHPATH}/images/pfeilvorwaerts.png`,
  `${GHPATH}/images/play-96.png`,
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
  `${GHPATH}/images/step.png`,
  `${GHPATH}/images/stop-96.png`,
  `${GHPATH}/images/sudoku.png`,
  `${GHPATH}/images/times200.png`,
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