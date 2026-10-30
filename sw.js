/* Service worker : rend l'app utilisable sans réseau.
 *
 * Stratégie « cache d'abord » sur les fichiers de l'app. Pour publier une
 * modification, il suffit de changer VERSION ci-dessous : l'ancien cache est
 * effacé et les fichiers sont retéléchargés.
 */

const VERSION = 'mediator-2';

const FICHIERS = [
  '.',
  'index.html',
  'styles.css',
  'app.js',
  'icone.svg',
  'manifest.webmanifest',
  'data/morceaux.json',
  'lib/store.js',
  'lib/ui.js',
  'lib/accords.js',
  'lib/diagramme.js',
  'lib/transposition.js',
  'ecrans/morceaux.js',
  'ecrans/fiche.js',
  'ecrans/modejeu.js',
  'ecrans/accord.js',
  'ecrans/tableau.js',
  'ecrans/formulaire.js',
  'ecrans/guitare.js',
];

self.addEventListener('install', (e) => {
  e.waitUntil(
    caches.open(VERSION).then((c) => c.addAll(FICHIERS)).then(() => self.skipWaiting())
  );
});

self.addEventListener('activate', (e) => {
  e.waitUntil(
    caches
      .keys()
      .then((cles) => Promise.all(cles.filter((c) => c !== VERSION).map((c) => caches.delete(c))))
      .then(() => self.clients.claim())
  );
});

self.addEventListener('fetch', (e) => {
  if (e.request.method !== 'GET') return;
  e.respondWith(
    caches.match(e.request).then(
      (enCache) =>
        enCache ||
        fetch(e.request).then((reponse) => {
          // On garde une copie des fichiers de l'app, pas des appels extérieurs.
          if (reponse.ok && new URL(e.request.url).origin === location.origin) {
            const copie = reponse.clone();
            caches.open(VERSION).then((c) => c.put(e.request, copie));
          }
          return reponse;
        })
    )
  );
});
