// Service worker: l'app funziona anche senza rete e prende da sola gli aggiornamenti.
// Quando si pubblica una nuova versione basta cambiare VERSIONE.
// I file del lettore (cartella ocr) non sono precaricati: si salvano la prima volta che leggi una schermata Feelfit.
const VERSIONE = "diario-v3";
const FILE = [
  "./", "index.html", "manifest.webmanifest", "css/style.css", "js/theme.js", "js/app.js", "js/jspdf.umd.min.js", "js/jspdf.plugin.autotable.min.js", "js/anime.umd.min.js", "js/fflate.min.js",
  "icons/icon-192.png", "icons/icon-512.png", "icons/apple-touch-icon.png",
  "img/figura-normale.webp", "img/figura-sovrappeso.webp", "img/figura-obesita.webp", "img/figura-grave.webp", "img/figura-estrema.webp",
];
self.addEventListener("install", (e) => {
  e.waitUntil(caches.open(VERSIONE).then((c) => c.addAll(FILE)).then(() => self.skipWaiting()));
});
self.addEventListener("activate", (e) => {
  e.waitUntil(
    caches.keys().then((ks) => Promise.all(ks.filter((k) => k !== VERSIONE && k !== "diario-font" && k !== "diario-ocr").map((k) => caches.delete(k)))).then(() => self.clients.claim()),
  );
});
self.addEventListener("fetch", (e) => {
  const req = e.request;
  if (req.method !== "GET") return;
  const url = new URL(req.url);
  // font di Google: dalla cache se ci sono, altrimenti li scarica e li conserva
  if (url.hostname === "fonts.googleapis.com" || url.hostname === "fonts.gstatic.com") {
    e.respondWith(
      caches.open("diario-font").then((c) =>
        c.match(req).then((hit) => hit || fetch(req).then((r) => (c.put(req, r.clone()), r)).catch(() => hit)),
      ),
    );
    return;
  }
  if (url.origin !== location.origin) return;
  if (url.pathname.includes("/ocr/")) {
    e.respondWith(caches.open("diario-ocr").then((c) => c.match(req).then((hit) => hit || fetch(req).then((r) => { if (r.ok) c.put(req, r.clone()); return r; }))));
    return;
  }
  // file dell'app: prima dalla rete (così arrivano gli aggiornamenti), se non c'è rete dalla cache
  e.respondWith(
    fetch(req)
      .then((r) => {
        if (r.ok) {
          const copia = r.clone();
          caches.open(VERSIONE).then((c) => c.put(req, copia));
        }
        return r;
      })
      .catch(() => caches.match(req, { ignoreSearch: true }).then((hit) => hit || caches.match("index.html"))),
  );
});
