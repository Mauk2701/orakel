// Service Worker: sorgt dafür, dass die App auch ohne Internet startet.
// Mit Internet holt er immer die neueste Version, ohne Internet nimmt er die gespeicherte Kopie.

const CACHE = "orakel-v1";
const DATEIEN = ["./", "./index.html", "./fragen.js", "./manifest.webmanifest", "./icon-192.png", "./icon-512.png", "./apple-touch-icon.png"];

self.addEventListener("install", (e) => {
  e.waitUntil(caches.open(CACHE).then((c) => c.addAll(DATEIEN)));
  self.skipWaiting();
});

self.addEventListener("activate", (e) => {
  // Nur eigene alte Speicher löschen, nicht die von anderen Apps auf derselben Adresse
  e.waitUntil(
    caches.keys().then((namen) =>
      Promise.all(namen.filter((n) => n.startsWith("orakel-") && n !== CACHE).map((n) => caches.delete(n)))
    )
  );
  self.clients.claim();
});

self.addEventListener("fetch", (e) => {
  if (e.request.method !== "GET") return;
  e.respondWith(
    fetch(e.request)
      .then((antwort) => {
        const kopie = antwort.clone();
        caches.open(CACHE).then((c) => c.put(e.request, kopie));
        return antwort;
      })
      .catch(() => caches.match(e.request, { ignoreSearch: true }).then((r) => r || caches.match("./index.html")))
  );
});
