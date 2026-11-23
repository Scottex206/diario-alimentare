
const MESI = ["gennaio", "febbraio", "marzo", "aprile", "maggio", "giugno", "luglio", "agosto", "settembre", "ottobre", "novembre", "dicembre"],
  GS = ["domenica", "lunedì", "martedì", "mercoledì", "giovedì", "venerdì", "sabato"];
const F = [
  ["colazione", "Colazione"],
  ["spuntino", "Spuntino"],
  ["pranzo", "Pranzo"],
  ["merenda", "Merenda"],
  ["cena", "Cena"],
  ["allenamento", "Allenamento"],
  ["peso", "Peso (kg)"],
  ["nota", "Note"],
];
const KM = ["colazione", "spuntino", "pranzo", "merenda", "cena"];
let S = { g: {}, p: { peso: "", grasso: "", bmr: "", lean: "", altezza: "", eta: "", att: 1.4, obj: "", def: 400 } },
  col = null,
  tab = "home",
  sel = null;
const $ = (s) => document.querySelector(s),
  p2 = (n) => String(n).padStart(2, "0"),
  dk = (d) => d.getFullYear() + "-" + p2(d.getMonth() + 1) + "-" + p2(d.getDate()),
  pd = (k) => new Date(k + "T12:00:00"),
  esc = (s) => String(s ?? "").replace(/[&<>"']/g, (c) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" })[c]),
  num = (s) => {
    const m = String(s ?? "").match(/-?\d+(?:[.,]\d+)?/);
    return m ? parseFloat(m[0].replace(",", ".")) : null;
  },
  fmt = (n) => Math.round(n).toLocaleString("it-IT"),
  fmtD = (n, d = 1) => (+n).toLocaleString("it-IT", { maximumFractionDigits: d, minimumFractionDigits: 0 }),
  cl = (v, a, b) => Math.max(a, Math.min(b, v)),
  dl = (k) => k.slice(8) + "/" + k.slice(5, 7);
// numero che si anima contando da 0 (vedi animateView)
const cu = (v, d = 0) => `<span class="cu" data-v="${v}" data-d="${d}">${fmtD(v, d)}</span>`;
const lbl = (k) => {
  const d = pd(k);
  return GS[d.getDay()] + " " + d.getDate() + " " + MESI[d.getMonth()];
};

/* ---------- salvataggio ---------- */
async function saveMonths() {
  try {
    localStorage.setItem("dA", JSON.stringify(S));
  } catch (e) {
    alert("Memoria del telefono piena: non riesco a salvare. Esporta un backup dalle impostazioni.");
  }
}
const saveP = saveMonths;
// piano alimentare e foto di sfondo arrivano dal file di backup e stanno in un archivio a parte
let EX = {};
try { EX = JSON.parse(localStorage.getItem("dA_extra")) || {}; } catch (e) {}
function saveEx() {
  try {
    localStorage.setItem("dA_extra", JSON.stringify(EX));
  } catch (e) {
    alert("Il piano o le foto sono troppo grandi per la memoria del browser.");
  }
}
function init() {
  try {
    const l = JSON.parse(localStorage.getItem("dA"));
    if (l) {
      Object.assign(S.g, l.g || {});
      Object.assign(S.p, l.p || {});
    }
  } catch (e) {}
  if (!Array.isArray(S.p.storia)) S.p.storia = [];
  sel = dk(new Date());
  applyBg();
  render();
}
document.querySelectorAll("nav button").forEach(
  (b) =>
    (b.onclick = () => {
      tab = b.dataset.t;
      render();
      scrollTo(0, 0);
    }),
);
function render() {
  document.querySelectorAll("nav button").forEach((b) => {
    b.classList.toggle("on", b.dataset.t === tab);
    b.setAttribute("aria-current", b.dataset.t === tab ? "page" : "false");
  });
  $("#m").onclick = null;
  $("#m").innerHTML = tab === "home" ? home() : tab === "note" ? note() : tab === "graf" ? graf() : piano();
  animateView();
  if (tab === "note") bindNote();
  if (tab === "graf") bindGraf();
}
window.go = (k) => {
  sel = k;
  tab = "note";
  render();
  scrollTo(0, 0);
};

/* ---------- animazioni (anime.js) ---------- */
const AN = window.anime;
const animOn = () => !!AN && S.p.anim !== false && !matchMedia("(prefers-reduced-motion: reduce)").matches;
function countUps(root, delay = 0) {
  root.querySelectorAll(".cu").forEach((el, i) => {
    const to = parseFloat(el.dataset.v), d = +el.dataset.d || 0, o = { v: 0 };
    if (!isFinite(to)) return;
    el.textContent = fmtD(0, d);
    AN.animate(o, { v: to, duration: 1100, delay: delay + i * 40, ease: "outExpo", onUpdate: () => (el.textContent = fmtD(o.v, d)), onComplete: () => (el.textContent = fmtD(to, d)) });
  });
}
function growBars(root, delay = 0) {
  const g = root.querySelectorAll(".ba"), lab = root.querySelectorAll(".ch text:not(.ax)");
  if (g.length) AN.animate(g, { scaleY: [0, 1], duration: 900, delay: AN.stagger(g.length > 20 ? 18 : 55, { start: delay }), ease: "outElastic(1, .75)" });
  if (lab.length) AN.animate(lab, { opacity: [0, 1], duration: 400, delay: AN.stagger(30, { start: delay + 450 }) });
}
function drawLines(root, delay = 0) {
  root.querySelectorAll(".ln-a").forEach((ln) => AN.animate(AN.svg.createDrawable(ln), { draw: ["0 0", "0 1"], duration: 1400, delay, ease: "inOutQuad" }));
  const dots = root.querySelectorAll(".dot-a");
  if (dots.length) AN.animate(dots, { scale: [0, 1], duration: 500, delay: AN.stagger(1300 / Math.max(1, dots.length), { start: delay + 100 }), ease: "outBack(2)" });
}
function fillBars(root, delay = 0) {
  root.querySelectorAll(".bar i, .bbar i").forEach((el, i) => {
    const w = el.style.width;
    if (!w) return AN.animate(el, { opacity: [0, 1], duration: 500, delay: delay + 300 });
    AN.animate(el, { width: ["0%", w], duration: 1100, delay: delay + i * 80, ease: "outExpo" });
  });
}
function animateView() {
  if (!animOn()) return;
  const m = $("#m"), blocks = [...m.children];
  AN.animate(blocks, { opacity: [0, 1], translateY: [22, 0], duration: 650, delay: AN.stagger(70), ease: "outCubic" });
  // anello delle calorie che si riempie
  m.querySelectorAll(".rp").forEach((c) => {
    const L = parseFloat(c.dataset.l);
    AN.animate(c, { strokeDasharray: [`0 314.16`, `${L} 314.16`], duration: 1400, delay: 200, ease: "outExpo" });
  });
  countUps(m, 150);
  growBars(m, 250);
  drawLines(m, 300);
  fillBars(m, 250);
  const fig = m.querySelector(".bfig img");
  if (fig) AN.animate(fig, { opacity: [0, 1], scale: [0.85, 1], translateY: [14, 0], duration: 900, delay: 250, ease: "outBack(1.4)" });
  const sq = m.querySelectorAll(".sq");
  if (sq.length) AN.animate(sq, { opacity: [0, (el) => (el.classList.contains("on") ? 1 : 0.75)], translateY: [26, 0], duration: 700, delay: AN.stagger(90, { start: 500 }), ease: "outBack(1.2)" });
  const mr = m.querySelectorAll(".oggi .mr");
  if (mr.length) AN.animate(mr, { opacity: [0, 1], translateX: [-14, 0], duration: 500, delay: AN.stagger(60, { start: 250 }), ease: "outCubic" });
}

/* ---------- importa da Samsung Health ----------
   Legge lo ZIP di "Scarica dati personali" (o i CSV sciolti): allenamenti e pesate (anche quelle della bilancia Feelfit). */
// codici ufficiali Samsung Health → attività del diario
const SH_T = {
  1001: "Camminata", 1002: "Corsa", 11007: "Bici", 13001: "Trekking", 13004: "Bici", 14001: "Nuoto",
  15001: "Altro cardio", 15002: "Palestra (pesi)", 15003: "Cyclette", 15004: "Altro cardio", 15005: "Tapis roulant", 15006: "Ellittica",
  10001: "Stretching", 10007: "Circuito / funzionale", 10002: "Altro cardio", 0: "Altro cardio",
};
const shType = (c) => SH_T[c] ?? (c >= 10003 && c <= 10027 ? "Muscolare a corpo libero" : "Altro cardio");
let SH = null; // dati letti dal file, in attesa di conferma
function csvRows(txt) {
  // CSV di Samsung: 1ª riga descrizione, 2ª intestazione; gestisce virgolette
  const out = [];
  let row = [], f = "", q = false;
  for (let i = 0; i < txt.length; i++) {
    const ch = txt[i];
    if (q) {
      if (ch === '"') { if (txt[i + 1] === '"') { f += '"'; i++; } else q = false; }
      else f += ch;
    } else if (ch === '"') q = true;
    else if (ch === ",") { row.push(f); f = ""; }
    else if (ch === "\n" || ch === "\r") {
      if (ch === "\r" && txt[i + 1] === "\n") i++;
      row.push(f); f = ""; out.push(row); row = [];
    } else f += ch;
  }
  if (f || row.length) { row.push(f); out.push(row); }
  return out;
}
function csvObjects(txt) {
  const R = csvRows(txt.replace(/^﻿/, ""));
  if (R.length < 2) return [];
  const H = R[1].map((h) => h.trim().replace(/^com\.samsung\.health\.(exercise|weight)\./, ""));
  return R.slice(2).filter((r) => r.length > 3).map((r) => Object.fromEntries(H.map((h, i) => [h, r[i] ?? ""])));
}
// orario Samsung (UTC) + fuso della registrazione → giorno locale
function shDay(st, off) {
  const m = String(off || "").match(/UTC([+-])(\d\d)(\d\d)/), t = Date.parse(String(st).replace(" ", "T") + "Z");
  if (isNaN(t)) return null;
  const ms = m ? (m[1] === "-" ? -1 : 1) * (+m[2] * 60 + +m[3]) * 60000 : 0;
  return new Date(t + ms).toISOString().slice(0, 10);
}
async function shRead(files) {
  let ex = null, wt = null;
  for (const f of files) {
    if (/\.zip$/i.test(f.name)) {
      const buf = new Uint8Array(await f.arrayBuffer());
      const z = fflate.unzipSync(buf, { filter: (x) => /com\.samsung\.shealth\.exercise\.\d+\.csv$|com\.samsung\.health\.weight\.\d+\.csv$/.test(x.name) });
      for (const [n, d] of Object.entries(z)) {
        const t = fflate.strFromU8(d);
        if (/exercise/.test(n)) ex = t;
        else wt = t;
      }
    } else if (/exercise\.\d+\.csv$/i.test(f.name)) ex = await f.text();
    else if (/weight\.\d+\.csv$/i.test(f.name)) wt = await f.text();
  }
  const A = (ex ? csvObjects(ex) : [])
    .map((r) => {
      const d = shDay(r.start_time, r.time_offset), min = num(r.duration) / 60000, km = num(r.distance) ? num(r.distance) / 1000 : 0;
      return d && min >= 1 ? { d, id: r.datauuid, code: +r.exercise_type || 0, auto: num(r.source_type) !== 1, st: r.start_time, min: Math.round(min), km: Math.round(km * 100) / 100, kcal: Math.round(num(r.calorie) || 0), app: r.pkg_name } : null;
    })
    .filter(Boolean);
  const W = (wt ? csvObjects(wt) : [])
    .map((r) => ({ d: shDay(r.start_time, r.time_offset), t: r.start_time, peso: num(r.weight), gf: num(r.body_fat), h: num(r.height), app: r.pkg_name }))
    .filter((r) => r.d && r.peso);
  return { A, W };
}
// cosa verrebbe importato con le opzioni scelte
function shPlan() {
  const o = SH.o, A = SH.A.filter((a) => a.d >= o.from && a.d <= o.to && (!a.auto ? o.man : o.auto && a.min >= o.amin));
  const have = new Set(Object.values(S.g).flatMap((d) => (Array.isArray(d.att) ? d.att.map((r) => r.id).filter(Boolean) : [])));
  const byDay = {};
  A.filter((a) => !have.has(a.id)).forEach((a) => (byDay[a.d] ??= []).push(a));
  let skip = 0;
  Object.keys(byDay).forEach((k) => {
    const d = S.g[k] || {}, manual = d.allenamento && !(Array.isArray(d.att) && d.att.length);
    if (manual && o.mode === "keep") { skip++; delete byDay[k]; }
  });
  // una pesata per giorno: la prima della giornata
  const W = {};
  if (o.w) SH.W.filter((w) => w.d >= o.from && w.d <= o.to).sort((a, b) => a.t.localeCompare(b.t)).forEach((w) => (W[w.d] ??= w));
  const nA = Object.values(byDay).reduce((s, x) => s + x.length, 0);
  return { byDay, W, nA, nD: Object.keys(byDay).length, skip, nW: Object.keys(W).length };
}
function shInfo() {
  const P = shPlan();
  return `Verranno aggiunti <b>${P.nA} allenamenti</b> in ${P.nD} giorni${P.skip ? ` (${P.skip} giorni saltati perché l’allenamento l’hai già scritto tu)` : ""} e <b>${P.nW} pesate</b>${P.nW ? " con grasso corporeo" : ""}.`;
}
function shHtml() {
  const A = SH.A, W = SH.W, man = A.filter((a) => !a.auto).length, au = A.length - man, fw = W.filter((w) => /feelfit|qingniu/i.test(w.app)).length;
  const o = SH.o;
  return `<div class="sh-in" role="dialog" aria-modal="true" aria-labelledby="sh2-t">
<div class="sh-hd"><h3 id="sh2-t">Importa da Samsung Health</h3><button class="x" id="sh2x" aria-label="Chiudi"><svg viewBox="0 0 24 24" aria-hidden="true"><path d="M6 6l12 12M18 6L6 18" stroke="currentColor" stroke-width="2.2" stroke-linecap="round"/></svg></button></div>
<p class="mu">Nel file: <b>${A.length} allenamenti</b> (${man} avviati da te, ${au} rilevati in automatico) e <b>${W.length} pesate</b>${fw ? `, di cui ${fw} dalla bilancia Feelfit` : ""}.</p>
<div class="lb">Da quando importare</div>
<p class="mu" style="margin-top:0">Tutto quello che nel file è precedente a questa data viene ignorato, così i giorni che hai scritto a mano non vengono mai toccati.</p>
<label for="sh_a">Ignora i dati prima del</label><input type="date" id="sh_a" value="${o.from}">
<div class="lb">Allenamenti</div>
<label class="sw"><input type="checkbox" id="sh_m"${o.man ? " checked" : ""}><span>Quelli avviati da te (corsa, palestra, trekking…)</span></label>
<label class="sw"><input type="checkbox" id="sh_au"${o.auto ? " checked" : ""}><span>Anche camminate e giri in bici rilevati in automatico</span></label>
<label for="sh_am">…solo se durano almeno (minuti)</label><input id="sh_am" inputmode="numeric" value="${o.amin}">
<label for="sh_md">Nei giorni dove l’allenamento l’hai già scritto a mano</label>
<select id="sh_md"><option value="keep"${o.mode === "keep" ? " selected" : ""}>Lascia il mio, non importare</option><option value="add"${o.mode === "add" ? " selected" : ""}>Aggiungi quelli di Samsung al mio</option></select>
<div class="lb">Peso e composizione</div>
<label class="sw"><input type="checkbox" id="sh_w"${o.w ? " checked" : ""}><span>Pesate con grasso corporeo (diventano misurazioni del corpo)</span></label>
<label class="sw"><input type="checkbox" id="sh_wd"${o.wd ? " checked" : ""}><span>Scrivi il peso nei giorni del diario che non ce l’hanno</span></label>
<p class="mu" id="sh_i" role="status">${shInfo()}</p>
<button class="b" id="sh_go">Importa</button> <span class="mu" id="sh_o" role="status"></span>
<p class="mu">Puoi ripetere l’importazione quando vuoi: gli allenamenti già importati non vengono duplicati.</p>
<button class="lnk dz" id="sh_un">Rimuovi tutto quello che è stato importato da Samsung Health</button></div>`;
}
window.openSH = async (files) => {
  const o = $("#shs");
  o.innerHTML = `<div class="sh-in"><p>Sto leggendo il file di Samsung Health…</p></div>`;
  o.hidden = false;
  document.body.style.overflow = "hidden";
  try {
    const r = await shRead(files);
    if (!r.A.length && !r.W.length) throw new Error("vuoto");
    const ks = Object.keys(S.g).sort();
    if (!S.p.shDa) { S.p.shDa = dk(new Date()); saveP(); }
    SH = { ...r, o: { from: S.p.shDa, to: "9999-12-31", man: true, auto: false, amin: 20, mode: "keep", w: true, wd: true } };
  } catch (e) {
    o.innerHTML = `<div class="sh-in"><div class="sh-hd"><h3>Importa da Samsung Health</h3><button class="x" id="sh2x" aria-label="Chiudi">✕</button></div><p>Non trovo allenamenti o pesate in questo file. Scegli lo ZIP di “Scarica dati personali” di Samsung Health, oppure i file che contengono “exercise” e “weight”.</p></div>`;
    $("#sh2x").onclick = () => { o.hidden = true; document.body.style.overflow = ""; };
    return;
  }
  o.innerHTML = shHtml();
  const close = () => { o.hidden = true; document.body.style.overflow = ""; };
  $("#sh2x").onclick = close;
  o.onclick = (e) => { if (e.target === o) close(); };
  const upd = () => {
    const x = SH.o;
    if ($("#sh_a").value && $("#sh_a").value !== x.from) { x.from = $("#sh_a").value; S.p.shDa = x.from; saveP(); }
    x.man = $("#sh_m").checked; x.auto = $("#sh_au").checked; x.amin = num($("#sh_am").value) || 0;
    x.mode = $("#sh_md").value; x.w = $("#sh_w").checked; x.wd = $("#sh_wd").checked;
    $("#sh_i").innerHTML = shInfo();
    $("#sh_o").textContent = "";
  };
  o.querySelectorAll("input,select").forEach((el) => (el.onchange = el.oninput = upd));
  $("#sh_un").onclick = async () => {
    if (!confirm("Togliere dal diario gli allenamenti, le misurazioni e i pesi importati da Samsung Health? Quelli scritti a mano restano.")) return;
    let n = 0;
    for (const [k, d0] of Object.entries(S.g)) {
      const d = { ...d0 };
      if (Array.isArray(d.att) && d.att.some((r) => r.src === "sh")) {
        d.att = d.att.filter((r) => r.src !== "sh");
        n++;
        const note = d.alln || "";
        d.allenamento = [d.att.map(trText).join(" + "), note].filter(Boolean).join("; ");
        if (!d.att.length) { delete d.att; delete d.alln; }
        if (!d.allenamento) delete d.allenamento;
      }
      if (d.pesoSrc === "sh") { delete d.peso; delete d.pesoSrc; }
      if (Object.keys(d).length) S.g[k] = d; else delete S.g[k];
    }
    S.p.storia = (S.p.storia || []).filter((x) => x.src !== "sh");
    await saveMonths(); await saveP();
    BC.i = null; render();
    $("#sh_o").textContent = `Rimosso: allenamenti importati da ${n} giorni e le misurazioni di Samsung.`;
    $("#sh_i").innerHTML = shInfo();
  };
  $("#sh_go").onclick = async () => {
    upd();
    const P = shPlan(), ms = new Set();
    for (const [k, list] of Object.entries(P.byDay)) {
      const d = { ...(S.g[k] || {}) }, old = Array.isArray(d.att) ? d.att : [], manual = d.allenamento && !old.length;
      const rows = list.sort((a, b) => a.st.localeCompare(b.st)).map((a) => ({ t: shType(a.code), min: a.min, ...(a.km ? { km: a.km } : {}), ...(a.kcal ? { kcal: a.kcal } : {}), id: a.id, src: "sh" }));
      let note = old.length ? d.alln || "" : "";
      if (manual && SH.o.mode === "add") note = d.allenamento;
      d.att = [...(manual && SH.o.mode === "replace" ? [] : old), ...rows];
      if (note) d.alln = note; else delete d.alln;
      d.allenamento = [d.att.map(trText).join(" + "), note].filter(Boolean).join("; ");
      S.g[k] = d;
      ms.add(k.slice(0, 7));
    }
    let nW = 0;
    if (SH.o.w) {
      const H = (S.p.storia = Array.isArray(S.p.storia) ? S.p.storia : []);
      for (const [k, w] of Object.entries(P.W)) {
        if (w.gf) {
          // la vecchia misurazione senza data coincide con una pesata di Samsung? la sostituisce
          const und = H.findIndex((x) => !x.d && num(x.peso) === w.peso && num(x.grasso) === w.gf);
          if (und >= 0) H.splice(und, 1);
          const e = { d: k, peso: String(w.peso), grasso: String(w.gf), lean: "", src: "sh" }, i = H.findIndex((x) => x.d === k);
          if (i >= 0) { if (H[i].src === "sh") H[i] = e; } else H.push(e);
          nW++;
        }
        if (SH.o.wd && !(S.g[k] && S.g[k].peso)) { S.g[k] = { ...(S.g[k] || {}), peso: String(w.peso), pesoSrc: "sh" }; ms.add(k.slice(0, 7)); }
      }
      // profilo: ultima misurazione e altezza
      const last = hist().slice(-1)[0];
      if (last && last.d) { S.p.peso = last.peso; S.p.grasso = last.grasso; }
      const hh = SH.W.map((w) => w.h).filter(Boolean).slice(-1)[0];
      if (hh && !num(S.p.altezza)) S.p.altezza = String(hh);
    }
    await saveMonths([...ms]);
    await saveP();
    BC.i = null; TR.ref = null; HW.ref = null;
    $("#sh_o").textContent = `Fatto: ${P.nA} allenamenti in ${P.nD} giorni e ${nW} misurazioni del corpo importati.`;
    $("#sh_i").innerHTML = shInfo();
    render();
  };
};

const OCR_SRC = { lib: "ocr/tesseract.min.js", worker: "ocr/worker.min.js", core: "ocr/", lang: "ocr/" };
/* ---------- lettura della schermata di Feelfit (OCR nel browser) ---------- */
const OCR = OCR_SRC; // percorsi della libreria di riconoscimento del testo
// [chiave, etichetta nella schermata, nome nel diario, unità, min, max, decimali]
const FFL = [
  ["peso", /^peso$/i, "Peso", "kg", 30, 250, 1],
  ["grasso", /grasso\s+corp/i, "Grasso corporeo", "%", 3, 60, 1],
  ["bmi", /^bmi$/i, "BMI", "", 10, 70, 1],
  ["scheletrico", /muscolo\s+schel/i, "Muscolo scheletrico", "%", 15, 70, 1],
  ["lean", /massa\s+musc/i, "Massa muscolare", "kg", 15, 130, 1],
  ["proteine", /proteine/i, "Proteine", "%", 5, 30, 1],
  ["bmr", /^bmr/i, "Metabolismo basale", "kcal", 800, 4000, 0],
  ["viscerale", /grasso\s+addom/i, "Grasso addominale", "", 1, 40, 0],
  ["acqua", /idrata/i, "Idratazione", "%", 30, 80, 1],
  ["ossa", /massa\s+ossea/i, "Massa ossea", "kg", 1, 8, 2],
  ["eta", /et.\s*metab/i, "Età metabolica", "anni", 10, 100, 0],
];
let FF = null;
function loadScript(src) {
  return new Promise((ok, ko) => {
    if (window.Tesseract) return ok();
    const s = document.createElement("script");
    s.src = src;
    s.onload = ok;
    s.onerror = () => ko(new Error("non riesco a caricare il lettore (serve internet la prima volta)"));
    document.head.appendChild(s);
  });
}
const ffNum = (s) => {
  const m = String(s || "").replace(/\s/g, "").match(/\d+(?:[.,]\d+)?/);
  return m ? parseFloat(m[0].replace(",", ".")) : null;
};
async function ffRead(file, say) {
  say("Preparo il lettore…");
  await loadScript(OCR.lib);
  const w = await Tesseract.createWorker("ita", 1, { workerPath: OCR.worker, corePath: OCR.core, langPath: OCR.lang, gzip: true });
  try {
    say("Leggo la schermata…");
    const r = await w.recognize(file, {}, { blocks: true });
    const lines = r.data.blocks.flatMap((b) => b.paragraphs.flatMap((p) => p.lines));
    const W = r.data.blocks.reduce((m, b) => Math.max(m, b.bbox.x1), 0);
    const dm = r.data.text.match(/(\d{1,2})[\/.-](\d{1,2})[\/.-](20\d\d)/);
    const out = { d: dm ? `${dm[3]}-${p2(dm[2])}-${p2(dm[1])}` : "", v: {}, raw: {} };
    // seconda lettura mirata: il numero sta subito sopra la sua etichetta
    await w.setParameters({ tessedit_char_whitelist: "0123456789.,%kgcal", tessedit_pageseg_mode: "7" });
    for (const [k, rx, , , lo, hi] of FFL) {
      const i = lines.findIndex((l) => rx.test(l.text.trim()));
      if (i < 0) continue;
      const lb = lines[i].bbox, h = Math.max(12, lb.y1 - lb.y0);
      const rect = { left: Math.max(0, lb.x0 - 6), top: Math.max(0, lb.y0 - Math.round(h * 3.4)), width: Math.round(W * 0.33), height: Math.round(h * 3) };
      const v = await w.recognize(file, { rectangle: rect });
      let n = ffNum(v.data.text);
      // se la lettura mirata non convince, provo con la riga sopra della prima lettura
      if (n == null || n < lo || n > hi) {
        const prev = lines.slice(Math.max(0, i - 3), i).reverse().map((l) => ffNum(l.text)).find((x) => x != null && x >= lo && x <= hi);
        n = prev ?? n;
      }
      out.raw[k] = v.data.text.trim();
      if (n != null) out.v[k] = n;
    }
    return out;
  } finally {
    await w.terminate();
  }
}
function ffForm() {
  const v = FF.v, h = (num(S.p.altezza) || 175) / 100, ex = hist().find((x) => x.d === FF.d);
  const warn = [];
  FFL.forEach(([k, , n, , lo, hi]) => {
    if (v[k] == null) warn.push(`${n}: non letto`);
    else if (v[k] < lo || v[k] > hi) warn.push(`${n}: ${fmtD(v[k], 2)} sembra strano`);
  });
  if (v.peso && v.bmi && Math.abs(v.peso / h / h - v.bmi) > 1.2 && num(S.p.altezza)) warn.push("Il BMI non torna con peso e altezza: controlla il peso");
  return `<div class="sh-in" role="dialog" aria-modal="true" aria-labelledby="ff-t">
<div class="sh-hd"><h3 id="ff-t">Schermata Feelfit</h3><button class="x" id="ffx" aria-label="Chiudi"><svg viewBox="0 0 24 24" aria-hidden="true"><path d="M6 6l12 12M18 6L6 18" stroke="currentColor" stroke-width="2.2" stroke-linecap="round"/></svg></button></div>
<div class="ffw"><img src="${FF.url}" alt="La schermata caricata"><div><p class="mu" style="margin-top:0">Controlla i valori letti: puoi correggerli prima di salvare.</p>
<label for="ff_d">Data della misurazione</label><input type="date" id="ff_d" value="${FF.d}"></div></div>
${warn.length ? `<p class="ffwarn">${warn.map(esc).join("<br>")}</p>` : `<p class="ffok">Tutti i valori sono stati letti.</p>`}
<div class="g2">${FFL.map(([k, , n, u]) => `<div><label for="ff_${k}">${n}${u ? ` (${u})` : ""}</label><input id="ff_${k}" inputmode="decimal" value="${v[k] != null ? String(v[k]).replace(".", ",") : ""}"></div>`).join("")}</div>
${ex && ex.src !== "feelfit" ? `<p class="ffwarn">Per il ${lbl(FF.d)} c’è già una misurazione inserita a mano: salvando la sostituisci.</p>` : ""}
<button class="b" id="ff_s">${ex && ex.src !== "feelfit" ? "Sostituisci la misurazione" : "Salva misurazione"}</button> <span class="mu" id="ff_o" role="status"></span></div>`;
}
window.openFF = async (file) => {
  const o = $("#ffs");
  o.innerHTML = `<div class="sh-in"><div class="sh-hd"><h3>Schermata Feelfit</h3><button class="x" id="ffx" aria-label="Chiudi">✕</button></div><p id="ff_p" role="status">Preparo il lettore…</p></div>`;
  o.hidden = false;
  document.body.style.overflow = "hidden";
  const close = () => { o.hidden = true; document.body.style.overflow = ""; if (FF && FF.url) URL.revokeObjectURL(FF.url); };
  $("#ffx").onclick = close;
  try {
    const r = await ffRead(file, (t) => $("#ff_p") && ($("#ff_p").textContent = t));
    FF = { ...r, url: URL.createObjectURL(file) };
  } catch (e) {
    $("#ff_p").textContent = "Non sono riuscito a leggere la schermata: " + e.message + ".";
    return;
  }
  o.innerHTML = ffForm();
  $("#ffx").onclick = close;
  o.onclick = (e) => { if (e.target === o) close(); };
  $("#ff_d").onchange = (e) => { FF.d = e.target.value; o.innerHTML = ffForm(); openFFbind(close); };
  openFFbind(close);
};
function openFFbind(close) {
  $("#ffx").onclick = close;
  $("#ff_d").onchange = (e) => { FFL.forEach(([k]) => (FF.v[k] = num($("#ff_" + k).value) ?? undefined)); FF.d = e.target.value; $("#ffs").innerHTML = ffForm(); openFFbind(close); };
  $("#ff_s").onclick = async () => {
    const d = $("#ff_d").value;
    if (!d) return ($("#ff_o").textContent = "Manca la data");
    const v = Object.fromEntries(FFL.map(([k]) => [k, num($("#ff_" + k).value)]));
    if (!v.peso || !v.grasso) return ($("#ff_o").textContent = "Servono almeno peso e grasso corporeo");
    const e = { d, src: "feelfit", ...Object.fromEntries(Object.entries(v).filter(([, x]) => x != null).map(([k, x]) => [k, String(x)])) };
    const H = (S.p.storia = Array.isArray(S.p.storia) ? S.p.storia : []), i = H.findIndex((x) => x.d === d);
    const und = H.findIndex((x) => !x.d && num(x.peso) === v.peso && num(x.grasso) === v.grasso);
    if (und >= 0) H.splice(und, 1);
    const j = H.findIndex((x) => x.d === d);
    if (j >= 0) H[j] = e; else H.push(e);
    // profilo e diario: ultima misurazione; il peso del giorno solo se manca
    const last = hist().slice(-1)[0];
    if (last && last.d === d) {
      S.p.peso = e.peso; S.p.grasso = e.grasso;
      if (e.lean) S.p.lean = e.lean;
      if (e.bmr) S.p.bmr = e.bmr;
    }
    if (!(S.g[d] && S.g[d].peso)) S.g[d] = { ...(S.g[d] || {}), peso: e.peso };
    await saveMonths([d.slice(0, 7)]);
    await saveP();
    BC.i = null;
    render();
    $("#ff_o").textContent = "Misurazione salvata.";
  };
}

/* ---------- impostazioni / temi ---------- */
const GEAR = '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M12.22 2h-.44a2 2 0 0 0-2 2v.18a2 2 0 0 1-1 1.73l-.43.25a2 2 0 0 1-2 0l-.15-.08a2 2 0 0 0-2.73.73l-.22.38a2 2 0 0 0 .73 2.73l.15.1a2 2 0 0 1 1 1.72v.51a2 2 0 0 1-1 1.74l-.15.09a2 2 0 0 0-.73 2.73l.22.38a2 2 0 0 0 2.73.73l.15-.08a2 2 0 0 1 2 0l.43.25a2 2 0 0 1 1 1.73V20a2 2 0 0 0 2 2h.44a2 2 0 0 0 2-2v-.18a2 2 0 0 1 1-1.73l.43-.25a2 2 0 0 1 2 0l.15.08a2 2 0 0 0 2.73-.73l.22-.39a2 2 0 0 0-.73-2.73l-.15-.08a2 2 0 0 1-1-1.74v-.5a2 2 0 0 1 1-1.74l.15-.09a2 2 0 0 0 .73-2.73l-.22-.38a2 2 0 0 0-2.73-.73l-.15.08a2 2 0 0 1-2 0l-.43-.25a2 2 0 0 1-1-1.73V4a2 2 0 0 0-2-2z"/><circle cx="12" cy="12" r="3"/></svg>';
function saveTheme() {
  try { localStorage.setItem("dA_tema", JSON.stringify(TH)); } catch (e) {}
  S.p.tema = { ...TH };
  saveP();
}
function setHtml() {
  const T = THEMES[TH.t];
  return `<div class="sh-in" role="dialog" aria-modal="true" aria-labelledby="sh-t">
<div class="sh-hd"><h3 id="sh-t">Impostazioni</h3><button class="x" id="shx" aria-label="Chiudi"><svg viewBox="0 0 24 24" aria-hidden="true"><path d="M6 6l12 12M18 6L6 18" stroke="currentColor" stroke-width="2.2" stroke-linecap="round"/></svg></button></div>
<div class="lb">I tuoi dati</div>
<p class="mu" style="margin-top:0">${Object.keys(S.g).length ? `Sul telefono ci sono <b>${Object.keys(S.g).length} giorni</b> di diario.` : "L’app è vuota: importa il file con i tuoi dati."} Restano solo su questo dispositivo: esporta un backup ogni tanto.</p>
<div class="dbt"><button class="b" id="imb">Importa dati</button><input type="file" id="imf" accept=".json,application/json" hidden><button class="b g" id="exf">Esporta backup</button></div>
<p class="mu" id="imo" role="status"></p>
<button class="lnk dz" id="clr">Cancella tutti i dati da questo telefono</button>
<p class="mu ver">Versione dell’app: 23 novembre 2026 (v4)</p>
<div class="lb">Tema</div>
<div class="thg">${Object.entries(THEMES)
    .map(([k, t]) => {
      const p0 = Object.values(t.pal)[0], v = { ...t.base, ...p0.v };
      return `<button class="th${k === TH.t ? " on" : ""}" data-th="${k}" aria-pressed="${k === TH.t}"><span class="pv" style="background:${v.bg};color:${v.tx}"><span class="pv-c" style="background:${v.cd};border-radius:${v.rs};${k === "pop" ? "border:2px solid " + v.ink + ";box-shadow:2px 2px 0 " + v.ink : ""}"><b style="font-family:${v.fh}">Aa</b><i style="background:${v.ac}"></i><i style="background:${v.ac2}"></i></span></span><span class="tn">${t.n}</span><span class="td">${t.d}</span></button>`;
    })
    .join("")}</div>
<div class="lb">Palette di colori · ${T.n}</div>
<div class="plg">${Object.entries(T.pal)
    .map(([k, P]) => {
      const v = { ...T.base, ...P.v };
      return `<button class="pl${k === TH.p ? " on" : ""}" data-pl="${k}" aria-pressed="${k === TH.p}"><span class="dots">${[v.bg, v.cd, v.ac, v.ac2].map((c) => `<i style="background:${c}"></i>`).join("")}</span><span>${P.n}${P.dark ? " · scuro" : ""}</span></button>`;
    })
    .join("")}</div>
${EX.sfondi?.length ? `<label class="sw"><input type="checkbox" id="fto"${TH.foto ? " checked" : ""}><span>Foto di sfondo dietro le schede</span></label>` : ""}
<div class="lb">Collegamenti</div>
<div class="dbt"><button class="b g" id="shb">Importa da Samsung Health</button><button class="b g" id="ffb">Leggi schermata Feelfit</button></div><input type="file" id="shf" accept=".zip,.csv,application/zip,text/csv" multiple hidden><input type="file" id="fff" accept="image/*" hidden>
<p class="mu" style="margin-top:6px">Samsung Health: Impostazioni → Scarica dati personali, poi scegli qui lo ZIP. Feelfit: condividi la schermata della misurazione come immagine e sceglila qui; il lettore compila tutti i valori, anche massa ossea ed età metabolica.</p>
<label class="sw"><input type="checkbox" id="anm"${S.p.anim !== false ? " checked" : ""}><span>Animazioni</span></label>
<p class="mu">La scelta viene salvata su questo dispositivo e nel tuo profilo.</p></div>`;
}
function applyBg() {
  const r = document.documentElement, b = EX.sfondi || [];
  window.__hasBg = b.length > 0;
  r.classList.toggle("foto", !!(TH.foto && b.length));
  r.style.setProperty("--bgi1", b[0] ? `url("${b[0]}")` : "none");
  r.style.setProperty("--bgi2", b[1] || b[0] ? `url("${b[1] || b[0]}")` : "none");
}
window.openSet = openSet;
function openSet() {
  const o = $("#set");
  o.innerHTML = setHtml();
  const first = o.hidden;
  o.hidden = false;
  document.body.style.overflow = "hidden";
  if (first && animOn()) AN.animate(o.querySelectorAll(".th, .pl"), { opacity: [0, 1], scale: [0.92, 1], duration: 450, delay: AN.stagger(35, { start: 120 }), ease: "outBack(1.5)" });
  const close = () => {
    o.hidden = true;
    document.body.style.overflow = "";
    $("#gear").focus();
  };
  $("#shx").onclick = close;
  o.onclick = (e) => {
    if (e.target === o) close();
  };
  o.querySelectorAll("[data-th]").forEach(
    (b) =>
      (b.onclick = () => {
        TH.t = b.dataset.th;
        TH.p = null;
        applyTheme();
        saveTheme();
        const sc = o.querySelector(".sh-in").scrollTop;
        openSet();
        o.querySelector(".sh-in").scrollTop = sc;
      }),
  );
  o.querySelectorAll("[data-pl]").forEach(
    (b) =>
      (b.onclick = () => {
        TH.p = b.dataset.pl;
        applyTheme();
        saveTheme();
        o.querySelectorAll("[data-pl]").forEach((x) => {
          x.classList.toggle("on", x === b);
          x.setAttribute("aria-pressed", x === b);
        });
      }),
  );
  $("#anm").onchange = (e) => {
    S.p.anim = e.target.checked;
    saveP();
    render();
  };
  $("#shb").onclick = () => $("#shf").click();
  $("#ffb").onclick = () => $("#fff").click();
  $("#fff").onchange = (e) => {
    const f = e.target.files[0];
    e.target.value = "";
    if (!f) return;
    $("#set").hidden = true;
    openFF(f);
  };
  $("#shf").onchange = (e) => {
    const f = [...e.target.files];
    e.target.value = "";
    if (!f.length) return;
    $("#set").hidden = true;
    openSH(f);
  };
  if ($("#fto"))
    $("#fto").onchange = (e) => {
      TH.foto = e.target.checked;
      applyTheme();
      applyBg();
      saveTheme();
    };
  $("#imb").onclick = () => $("#imf").click();
  $("#imf").onchange = async (e) => {
    const f = e.target.files[0];
    if (!f) return;
    try {
      const d = JSON.parse(await f.text());
      if (!d || d.app !== "diario-alimentare" || typeof d.g !== "object") throw new Error("formato");
      const n = Object.keys(d.g).length;
      if (Object.keys(S.g).length && !confirm(`Il file contiene ${n} giorni. Vuoi sostituire i dati che hai ora su questo telefono?`)) return;
      S.g = d.g;
      S.p = { ...S.p, ...(d.p || {}) };
      if (!Array.isArray(S.p.storia)) S.p.storia = [];
      EX = d.extra || {};
      if (d.p && d.p.tema) { Object.assign(TH, d.p.tema); applyTheme(); }
      await saveMonths();
      saveEx();
      applyBg();
      BC.i = null; CW.ref = null; TR.ref = null; HW.ref = null;
      render();
      openSet();
      $("#imo").textContent = `Importati ${n} giorni${EX.piano ? ", il piano alimentare" : ""}${S.p.storia.length ? " e le misurazioni del corpo" : ""}.`;
    } catch (err) {
      $("#imo").textContent = "Questo file non sembra un backup del diario.";
    }
    e.target.value = "";
  };
  $("#exf").onclick = () => {
    const d = { app: "diario-alimentare", v: 1, creato: dk(new Date()), g: S.g, p: S.p, extra: EX };
    const url = URL.createObjectURL(new Blob([JSON.stringify(d)], { type: "application/json" }));
    const a = document.createElement("a");
    a.href = url;
    a.download = "diario-backup-" + dk(new Date()) + ".json";
    document.body.appendChild(a);
    a.click();
    a.remove();
    setTimeout(() => URL.revokeObjectURL(url), 2000);
    $("#imo").textContent = "Backup scaricato.";
  };
  $("#clr").onclick = () => {
    if (!confirm("Cancellare diario, dati del corpo e piano da questo telefono? Se non hai un backup non si possono recuperare.")) return;
    localStorage.removeItem("dA");
    localStorage.removeItem("dA_extra");
    S.g = {};
    S.p = { peso: "", grasso: "", bmr: "", lean: "", altezza: "", eta: "", att: 1.4, obj: "", def: 400, storia: [] };
    EX = {};
    TH.foto = false;
    applyTheme();
    applyBg();
    render();
    openSet();
    $("#imo").textContent = "Dati cancellati.";
  };
}
$("#gear").innerHTML = GEAR;
$("#gear").onclick = openSet;
document.addEventListener("keydown", (e) => {
  if (e.key === "Escape" && !$("#set").hidden) $("#shx").click();
  if (e.key === "Escape" && !$("#pdfs").hidden) $("#pxx").click();
  if (e.key === "Escape" && !$("#shs").hidden && $("#sh2x")) $("#sh2x").click();
  if (e.key === "Escape" && !$("#ffs").hidden && $("#ffx")) $("#ffx").click();
});

/* ---------- stima calorie ----------
   [espressione, kcal per 100 g, grammi di default (dosi del piano), grammi per pezzo, proteina?] */
const FD = [
  [/\blatte\b/, 46, 250],
  [/cereali|fiocchi d.avena|\bavena\b|muesli/, 380, 45],
  [/banan/, 90, 120, 120],
  [/fett[ae] biscottat[ae]/, 410, 24, 8],
  [/\bpane\b|panin[oi]|toast|bruschett/, 270, 65, 30],
  [/pancake/, 220, 120, 40],
  [/marmellata|confettura|miele/, 250, 20],
  [/nocciolata|nutella|cioccolat/, 540, 20],
  [/yogurt|hipro/, 90, 150],
  [/gnocchi/, 150, 180],
  [/lasagn|pasta al forno/, 160, 300],
  [/casoncelli|ravioli|tortellini|agnolotti/, 260, 150],
  [/pasta|tagliatelle|spaghetti|penne|fusilli|maccheroni/, 350, 80],
  [/\briso\b|risotto|farro|\borzo\b|cous ?cous|quinoa/, 350, 75],
  [/polenta/, 85, 160],
  [/gallett[ae]\b/, 380, 30, 8],
  [/crackers|taralli|grissin|wasa/, 430, 30, 25],
  [/croccantelle|sfoglie|triangolini|barrett/, 450, 30, 25],
  [/pizza/, 250, 300],
  [/piadin|focaccia|\bwrap\b/, 290, 90],
  [/carne salata/, 140, 80, 0, 1],
  [/hamburger|polpett|bistecc|manzo|\bcarne\b|spezzatino|costin|spiedin|salsicc|wurstel|cotechino|vitello|cervo|involtin|tartare|tagliata|brasato|grigliata|cap[uù]\b|fritto misto|cotolett[ae]\b/, 220, 160, 0, 1],
  [/pollo|tacchino|faraona/, 130, 160, 0, 1],
  [/\btonno\b|sgombro in scatola/, 150, 80, 0, 1],
  [/sgombro|salmone|merluzzo|orata|trota|branzino|pesce|gamberett|sushi|scoglio|alici|platessa|sogliola/, 120, 180, 0, 1],
  [/\buov|frittata/, 143, 110, 55, 1],
  [/mozzarell/, 250, 125, 20, 1],
  [/fontina|scamorza|formagg|stracchino|provola|emmental/, 360, 40],
  [/grana|parmigiano/, 390, 10],
  [/ricotta/, 150, 120, 0, 1],
  [/prosciutto|speck|bresaola|pancetta|mortadella|porchetta|guanciale|\bcrudo\b|\bcotto\b|salame/, 200, 60, 0, 1],
  [/patatine/, 310, 150],
  [/patat|pur[eè]/, 80, 200],
  [/\bmais\b/, 90, 80],
  [/fagioli|ceci|lenticchie|piselli|legumi/, 110, 150, 0, 1],
  [/olive/, 145, 30],
  [/zucchin|insalat|pomodor|melanzan|peperon|spinaci|carot|funghi|carciof|verdur|crauto|erbe|cornetti|minestr|verza|finocch|cavol|broccol|rucola|lattuga|porr[oi]|asparag|zucca/, 25, 200],
  [/pesto/, 450, 20],
  [/rag[uù]/, 150, 80],
  [/sugo|\bcrema\b/, 90, 80],
  [/brioche|crostata|\btort[ae]\b|tiramis|biscott|\bcornetto\b|merendin|pasticcin|panettone|pandoro|\bdolce\b/, 400, 60, 9],
  [/aranc|mandarin|pompelm|prugn|albicocc|ananas|\bmel[ae]\b|\bper[ae]\b|\bpesc[ah]e?\b|kiwi|clementin/, 45, 150],
  [/melone|anguria/, 32, 250],
  [/\buva\b|mango|cachi|fichi/, 70, 150],
  [/\bfrutta\b/, 50, 150],
  [/uvetta/, 300, 15],
  [/^(?:amatriciana|carbonara|gricia|cacio e pepe)/, 560, 80],
  [/(?<!^)(?:amatriciana|carbonara|gricia)/, 170, 100],
  [/fragol|mirtill|lampon|frutti di bosco/, 40, 150, 15],
  [/gelato|ghiacciolo/, 170, 70],
  [/cappuccino/, 60, 150],
  [/caff[eè] zuccherat|caff[eè] con zucchero/, 400, 5],
  [/limoncello|amaro|grappa/, 250, 40],
  [/\bvino\b/, 85, 150],
  [/birra/, 43, 330],
  [/spritz/, 125, 200],
];
// grammi per singolo pezzo, quando scrivi un numero di pezzi
const UNIT = [
  [/mandarin|clementin/, 60], [/albicocc/, 40], [/kiwi/, 80], [/costin/, 90], [/spiedin/, 90], [/salsicc/, 100],
  [/polpett/, 30], [/wurstel/, 50], [/hamburger/, 150], [/bistecc/, 170], [/mozzarellin/, 20], [/fragol/, 15],
];
const NW = { un: 1, uno: 1, una: 1, due: 2, tre: 3, quattro: 4, cinque: 5, sei: 6 };
// parole dei cibi conosciuti: servono a correggere gli errori di battitura ("pata" → "pasta")
const VOC = "pasta riso pane pollo tacchino tonno banana latte yogurt cereali gallette crackers patate insalata pomodori zucchine uova frittata mozzarella ricotta grana prosciutto bresaola speck polenta gnocchi pizza piadina hamburger bistecca manzo carne merluzzo salmone orata pesce fagioli ceci lenticchie piselli marmellata confettura biscotti brioche cappuccino mandarini arancia mela pera fragole mirtilli melanzane peperoni spinaci funghi carote minestrone lasagne farro pesto ragù sugo gelato olive fontina wurstel salsiccia costine spiedini cotoletta polpette focaccia toast pancakes miele nutella cioccolato uva kiwi pesca melone anguria ananas albicocche cornetto torta crostata tiramisù patatine verdure broccoli finocchi verza zucca asparagi sgombro trota branzino gamberetti sushi quinoa cous orzo avena muesli scamorza formaggio parmigiano mortadella salame pancetta guanciale caffè zuccherato fiocchi tagliatelle spaghetti penne fusilli casoncelli ravioli tortellini crauto cavolfiore rucola lattuga legumi frutta grigliata tartare tagliata spezzatino involtini vitello maccheroni".split(" ");
const STOP = new Set("fesa filetto petto coscia magnesio potassio integratore integratori vitamina vitamine acqua tisana camomilla occhio pasto pasti sgarro libero alla allo alle agli della dello delle degli dalla nella sulla come fatto fatta fatte fatti cotto cotta cotte cotti forno padella friggitrice aria olio aceto sale pepe piccolo piccola piccoli piccole grande grandi mezzo mezza mezze porzione porzioni dose dosi fetta fette fettina pezzo pezzi pacchetto cucchiaio cucchiaino cucchiai pizzico poco poca senza bianco bianca bianchi rosso rossa rossi verde verdi greco greca integrale integrali secco secchi fresco fresca bollito bollita bollite bolliti lesso lessi lesse arrosto vapore piastra griglia scatola sgocciolato naturale magro magra light zero misto mista amici casa lavoro baita compleanno pranzo cena colazione spuntino merenda dopo prima anche solo tutto tutta quello quella questo questa sono stato stata erano avevo dovevo finirlo saltata saltato digiuno fame sazio sazia ottimo buono buona normale normali alcuni qualche altro altra altri".split(" "));
function lev(a, b) {
  if (Math.abs(a.length - b.length) > 2) return 9;
  const d = Array.from({ length: a.length + 1 }, (_, i) => [i]);
  for (let j = 1; j <= b.length; j++) d[0][j] = j;
  for (let i = 1; i <= a.length; i++)
    for (let j = 1; j <= b.length; j++) d[i][j] = Math.min(d[i - 1][j] + 1, d[i][j - 1] + 1, d[i - 1][j - 1] + (a[i - 1] === b[j - 1] ? 0 : 1));
  return d[a.length][b.length];
}
const myFoods = () => (Array.isArray(S.p.cibi) ? S.p.cibi : []).filter((c) => c && c.n && num(c.k) != null);
const escRx = (s) => s.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
// controlla le parole non riconosciute: corregge i refusi vicini a un cibo noto, segnala le altre
function fixWords(s) {
  const fixes = [], unknown = [], mine = myFoods().map((c) => c.n.toLowerCase());
  const out = s.replace(/[a-zàèéìòù]+/g, (w) => {
    if (w.length < 4 || STOP.has(w) || VOC.includes(w) || mine.some((n) => n.split(" ").includes(w))) return w;
    if (FD.some((e) => e[0].test(w))) return w;
    const tol = w.length <= 5 ? 1 : 2;
    let best = null, bd = 9;
    for (const v of [...VOC, ...mine]) {
      const dd = lev(w, v);
      if (dd < bd) { bd = dd; best = v; }
    }
    if (best && bd <= tol) { fixes.push([w, best]); return best; }
    unknown.push(w);
    return w;
  });
  return { s: out, fixes, unknown };
}
function kcal(txt) {
  const items = [];
  if (!txt) return { t: 0, i: items, fx: [], u: [] };
  const hasO = /\bolio\b/i.test(txt);
  const fw = fixWords(txt.toLowerCase().replace(/\([^)]*\)/g, " "));
  const MY = myFoods().map((c) => [new RegExp("\\b" + escRx(c.n.toLowerCase())), num(c.k), num(c.g) || 100, 0, 0, 1]);
  const ALL = [...MY, ...FD];
  fw.s.split(/,| con | e |\+| più |;/).forEach((seg0) => {
    const seg = seg0.trim();
    if (!seg) return;
    let ms = [];
    ALL.forEach((e) => {
      const m = seg.match(e[0]);
      if (m) ms.push({ i: m.index, l: m[0].length, e, w: m[0] });
    });
    ms.sort((a, b) => a.i - b.i || b.l - a.l);
    ms = ms.filter((m, j) => !ms.some((o, q) => q !== j && o.i <= m.i && o.i + o.l >= m.i + m.l && (o.l > m.l || q < j)));
    ms = ms.filter((m, j) => j === 0 || !/(?:\bdi|\bd'|\bai)\s*$/.test(seg.slice(0, m.i)));
    if (!ms.length) return;
    for (const g of seg.matchAll(/(\d+(?:[.,]\d+)?)\s*(?:g|gr|grammi|ml)\b/g)) {
      const gi = g.index;
      let best = null, bd = 1e9;
      ms.forEach((m) => {
        const d = gi < m.i ? m.i - gi : gi - (m.i + m.l);
        if (m.g == null && d < bd) { bd = d; best = m; }
      });
      if (best) best.g = parseFloat(g[1].replace(",", "."));
    }
    const cm = seg.match(/^(\d+|un[oa]?|due|tre|quattro|cinque|sei)\s+/),
      n = cm ? (NW[cm[1]] ?? +cm[1]) : 0,
      half = /\bmezz[ao]\b|\bmet[aà]\b/.test(seg);
    ms.forEach((m, j) => {
      const [, k, dg, u0, prot, mine] = m.e;
      let g = m.g, auto = g == null;
      if (auto) {
        g = dg;
        if (j === 0 && n > 0 && n <= 20) {
          const u = (UNIT.find((x) => x[0].test(seg.slice(m.i, m.i + 16))) || [])[1] || u0 || dg;
          g = u * n;
          auto = false;
        }
        if (j === 0 && half) g *= 0.5;
      }
      items.push({ s: seg, w: m.w, g, k: (k * g) / 100, prot: !!prot, auto, mine: !!mine });
    });
  });
  // piano: "due fonti proteiche nello stesso pasto? dimezza le dosi" (solo dove non hai scritto i grammi)
  const pr = items.filter((x) => x.prot);
  if (pr.length >= 2) pr.forEach((x) => { if (x.auto) { x.g /= 2; x.k /= 2; x.half = 1; } });
  if (hasO) items.push({ s: "olio", w: "olio di condimento", g: 10, k: 90 });
  items.forEach((x) => (x.k = Math.round(x.k)));
  return { t: items.reduce((a, b) => a + b.k, 0), i: items, fx: fw.fixes, u: fw.unknown };
}
function tdee() {
  const P = S.p, w = num(P.peso) || 0, gf = num(P.grasso);
  let bmr = num(P.bmr), src = "valore inserito";
  if (!bmr && w && gf) {
    bmr = 370 + 21.6 * w * (1 - gf / 100);
    src = "formula di Katch-McArdle (massa magra)";
  }
  if (!bmr && num(P.altezza) && num(P.eta) && w) {
    bmr = 10 * w + 6.25 * num(P.altezza) - 5 * num(P.eta) + 5;
    src = "formula di Mifflin-St Jeor";
  }
  return { bmr: bmr || 0, src, t: Math.round((bmr || 0) * (num(P.att) || 1.4)) };
}
const target = () => {
  const t = tdee().t;
  return t ? Math.max(0, t - (num(S.p.def) || 0)) : 0;
};
const dayK = (k) => (S.g[k] ? KM.reduce((a, m) => a + kcal(S.g[k][m]).t, 0) : 0);
function wkKey(k) {
  const d = pd(k);
  d.setDate(d.getDate() - ((d.getDay() + 6) % 7));
  return dk(d);
}
// minuti di allenamento divisi in cardio e muscolare.
// Ogni pezzo separato da "+" o ";" prende il tipo dalle sue parole; se non ne ha, quello dell'intera frase.
const RX_MUS = /muscolar|stretching|pesi|forza|palestra|panca|squat|addominal|funzional|crossfit|calisthenic|circuito|corpo libero|trx|kettlebell|pilates|yoga/i;
const RX_CAR = /corsa|\brun|bici|cyclette|spinning|ellittica|tapis|camminat|passeggiat|nuoto|nuotat|vogatore|cardio|trekking|escursion|bikepark|sci\b|salto|corda|hiit|calcio|tennis|padel|basket/i;
function trainStats(s) {
  const t = String(s || "");
  const mins = (x) =>
    [...x.matchAll(/(\d+(?:[.,]\d+)?)\s*(?:min|minuti|['′])/gi)].reduce((a, m) => a + parseFloat(m[1].replace(",", ".")), 0) +
    [...x.matchAll(/(\d+(?:[.,]\d+)?)\s*(?:h|ore|ora)\b/gi)].reduce((a, m) => a + 60 * parseFloat(m[1].replace(",", ".")), 0);
  const all = RX_CAR.test(t.replace(/palestra/gi, "")) ? "c" : RX_MUS.test(t) ? "m" : "c";
  let c = 0, m = 0;
  t.split(/\+|;|\bpoi\b/i).forEach((p) => {
    const v = mins(p);
    if (!v) return;
    const pc = RX_CAR.test(p), pm = RX_MUS.test(p.replace(/palestra/gi, ""));
    const ty = pm && !pc ? "m" : pc ? "c" : /palestra/i.test(p) ? "m" : all;
    if (ty === "m") m += v;
    else c += v;
  });
  const km = [...t.matchAll(/(\d+(?:[.,]\d+)?)\s*km/gi)].reduce((a, x) => a + parseFloat(x[1].replace(",", ".")), 0);
  const kc = [...t.matchAll(/(\d+(?:[.,]\d+)?)\s*kcal/gi)].reduce((a, x) => a + parseFloat(x[1].replace(",", ".")), 0);
  return { mn: c + m, c, m, km, kc };
}
const dayTr = (k) => (S.g[k] && S.g[k].allenamento ? trainStats(S.g[k].allenamento) : { mn: 0, c: 0, m: 0, km: 0, kc: 0 });
// barre impilate: cardio in basso, muscolare sopra
function stackBars(D, R, o) {
  const { H, top, mx, X, bw, lab } = o, Y = (v) => top + H - (v / mx) * H;
  return D.map((k, i) => {
    const r = R[i], x = X(i), hc = (r.c / mx) * H, hm = (r.m / mx) * H, rr = Math.min(5, bw / 3);
    let s = `<g class="ba" style="transform-origin:0 ${top + H}px">`;
    if (hc) s += `<rect x="${x.toFixed(1)}" y="${(top + H - hc).toFixed(1)}" width="${bw.toFixed(1)}" height="${hc.toFixed(1)}" rx="${hm ? 0 : rr}" style="fill:var(--tc)"/>`;
    if (hm) s += `<rect x="${x.toFixed(1)}" y="${(top + H - hc - hm).toFixed(1)}" width="${bw.toFixed(1)}" height="${hm.toFixed(1)}" rx="${hc ? 0 : rr}" style="fill:var(--tm)"/>`;
    s += "</g>";
    if (lab && r.mn) s += `<text x="${(x + bw / 2).toFixed(1)}" y="${(Y(r.mn) - 4).toFixed(1)}" text-anchor="middle" font-size="9.5" font-weight="700">${Math.round(r.mn)}′</text>`;
    return s;
  }).join("");
}
const trLeg = (c, m) => `<div class="lg2 tl"><span><i style="background:var(--tc)"></i>Cardio${c != null ? ` <b>${Math.round(c)}′</b>` : ""}</span><span><i style="background:var(--tm)"></i>Muscolare${m != null ? ` <b>${Math.round(m)}′</b>` : ""}</span></div>`;

// home: minuti della settimana
let HW = { ref: null };
window.hwS = (n) => {
  HW.ref = shiftP(HW.ref || dk(new Date()), "sett", n);
  render();
};
function weekHome(td) {
  const ref = HW.ref || td, s = pd(wkKey(ref)), D = [];
  for (let i = 0; i < 7; i++) {
    const d = new Date(s);
    d.setDate(s.getDate() + i);
    D.push(dk(d));
  }
  const R = D.map(dayTr), tc = R.reduce((a, r) => a + r.c, 0), tmu = R.reduce((a, r) => a + r.m, 0), sess = R.filter((r) => r.mn).length,
    mx = Math.max(60, ...R.map((r) => r.mn)) * 1.15, H = 112, top = 14, cur = wkKey(ref) === wkKey(td);
  const bars = stackBars(D, R, { H, top, mx, X: (i) => 8 + i * 47, bw: 36, lab: true }),
    base = D.map((k, i) => (R[i].mn ? "" : `<rect x="${8 + i * 47}" y="${top + H - 4}" width="36" height="4" rx="2" style="fill:var(--tr)"/>`)).join(""),
    days = D.map((k, i) => `<text x="${8 + i * 47 + 18}" y="${top + H + 15}" text-anchor="middle" class="ax"${k === td ? ' style="fill:var(--tx);font-weight:700"' : ""}>${GS[pd(k).getDay()].slice(0, 3)}</text>`).join("");
  const pc = Math.min(1, tc / 150);
  return `<section class="c wkh"><div class="wkh-h"><h3>Allenamento ${cur ? "di questa settimana" : "della settimana"}</h3><span class="wkt"><b>${cu(Math.round(tc + tmu))}′</b> totali</span></div>${navB(wlab(wkKey(ref)), "hwS")}${trLeg(tc, tmu)}${svg(340, H + top + 24, base + bars + days, "Minuti di allenamento per giorno, cardio e muscolare")}<div class="goal"><div class="gl"><span>Cardio verso i 150′ consigliati</span><b>${cu(Math.round(tc))}′ / 150′</b></div><div class="bar on"><i style="width:${(pc * 100).toFixed(0)}%;background:var(--tc)"></i></div><div class="gl"><span>Sedute</span><b>${sess}</b></div>${R.some((r) => r.kc) ? `<div class="gl"><span>Kcal bruciate (dove le hai segnate)</span><b>${fmt(R.reduce((a, r) => a + r.kc, 0))}</b></div>` : ""}</div></section>`;
}

// grafici: dettaglio settimana / mese
function trainC() {
  TR.ref = TR.ref || lastK((d) => d.allenamento);
  const mese = TR.m === "mese", D = [];
  let s;
  if (mese) {
    s = pd(TR.ref.slice(0, 7) + "-01");
    const n = new Date(s.getFullYear(), s.getMonth() + 1, 0).getDate();
    for (let i = 0; i < n; i++) {
      const d = new Date(s);
      d.setDate(1 + i);
      D.push(dk(d));
    }
  } else {
    s = pd(wkKey(TR.ref));
    for (let i = 0; i < 7; i++) {
      const d = new Date(s);
      d.setDate(s.getDate() + i);
      D.push(dk(d));
    }
  }
  const R = D.map(dayTr), mx = Math.max(30, ...R.map((r) => r.mn)) * 1.15, H = 120, top = 12,
    gap = mese ? 312 / D.length : 46, bw = mese ? gap - 2.5 : 34,
    sess = R.filter((r) => r.mn || r.km).length, tc = R.reduce((a, r) => a + r.c, 0), tmu = R.reduce((a, r) => a + r.m, 0), tk = R.reduce((a, r) => a + r.km, 0);
  const lab = D.map((k, i) => (mese ? (i % 5 === 0 ? `<text x="${(14 + i * gap).toFixed(1)}" y="${top + H + 15}" class="ax">${i + 1}</text>` : "") : `<text x="${14 + i * gap + 17}" y="${top + H + 15}" text-anchor="middle" class="ax">${GS[pd(k).getDay()].slice(0, 3)}</text>`)).join("");
  return `<div class="c"><h3>Allenamenti per giorno</h3><div class="tg"><button class="b ${mese ? "g" : ""}" onclick="trM('sett')" aria-pressed="${!mese}">Settimana</button><button class="b ${mese ? "" : "g"}" onclick="trM('mese')" aria-pressed="${mese}">Mese</button></div>${navB(mese ? MESI[s.getMonth()] + " " + s.getFullYear() : wlab(wkKey(TR.ref)), "trS")}${trLeg()}${
    sess ? svg(340, H + top + 24, stackBars(D, R, { H, top, mx, X: (i) => 14 + i * gap, bw, lab: !mese }) + lab, "Minuti di allenamento per giorno") : '<div class="mu">Nessun allenamento in questo periodo.</div>'
  }<div class="st2 s4"><div><b>${cu(sess)}</b>sedute</div><div><b>${cu(Math.round(tc))}′</b>cardio</div><div><b>${cu(Math.round(tmu))}′</b>muscolare</div><div><b>${cu(tk, 1)}</b>km</div></div></div>`;
}

// grafici: andamento nel tempo, settimana per settimana
function trendC() {
  const ks = Object.keys(S.g).sort().filter((k) => S.g[k].allenamento);
  if (!ks.length) return `<div class="c"><h3>Andamento allenamenti</h3><div class="mu">Nessun allenamento registrato.</div></div>`;
  const wk = {};
  ks.forEach((k) => {
    const q = wkKey(k), r = trainStats(S.g[k].allenamento);
    wk[q] ??= { c: 0, m: 0, mn: 0, n: 0 };
    wk[q].c += r.c; wk[q].m += r.m; wk[q].mn += r.mn; wk[q].n += r.mn ? 1 : 0;
  });
  const Q = [], now = wkKey(dk(new Date())), end = now > wkKey(ks[ks.length - 1]) ? now : wkKey(ks[ks.length - 1]);
  for (let q = wkKey(ks[0]); q <= end; q = shiftP(q, "sett", 1)) Q.push(q);
  const R = Q.map((q) => wk[q] || { c: 0, m: 0, mn: 0, n: 0 }),
    mav = Q.map((q, i) => { const a = R.slice(Math.max(0, i - 3), i + 1); return a.reduce((s, z) => s + z.mn, 0) / a.length; }),
    mx = Math.max(160, ...R.map((r) => r.mn)) * 1.1, H = 150, top = 12, L = 34, W = 340 - L - 6, gap = W / Q.length, bw = Math.max(2, gap - (Q.length > 30 ? 1.5 : 3)),
    X = (i) => L + i * gap, Y = (v) => top + H - (v / mx) * H;
  const grid = [0, 150, Math.round(mx / 1.1 / 10) * 10].filter((v, i, a) => a.indexOf(v) === i).map((v) => `<line x1="${L}" x2="334" y1="${Y(v).toFixed(1)}" y2="${Y(v).toFixed(1)}" style="stroke:${v === 150 ? "var(--tg)" : "var(--bd)"}" stroke-width="${v === 150 ? 1.5 : 1}"${v === 150 ? ' stroke-dasharray="5 4"' : ""}/><text x="${L - 5}" y="${(Y(v) + 3).toFixed(1)}" text-anchor="end" class="ax"${v === 150 ? ' style="fill:var(--tg)"' : ""}>${v}′</text>`).join("");
  const ln = `<path d="${mav.map((v, i) => (i ? "L" : "M") + (X(i) + bw / 2).toFixed(1) + " " + Y(v).toFixed(1)).join("")}" fill="none" style="stroke:var(--tx)" stroke-width="2" stroke-linejoin="round" stroke-linecap="round" opacity=".85" class="ln-a"/>`;
  const mid = Math.floor((Q.length - 1) / 2), xl = `<text x="${L}" y="${top + H + 15}" class="ax">${dl(Q[0])}</text>${Q.length > 2 ? `<text x="${(X(mid) + bw / 2).toFixed(1)}" y="${top + H + 15}" text-anchor="middle" class="ax">${dl(Q[mid])}</text>` : ""}<text x="334" y="${top + H + 15}" text-anchor="end" class="ax">${dl(Q[Q.length - 1])}</text>`;
  const last4 = R.slice(-4), a4 = (f) => last4.reduce((s, z) => s + z[f], 0) / last4.length, tot = R.reduce((s, z) => s + z.mn, 0);
  return `<div class="c"><h3>Andamento allenamenti</h3>${trLeg()}<div class="lg2 tl"><span><i class="ln"></i>Media delle ultime 4 settimane</span></div>${svg(340, H + top + 24, grid + stackBars(Q, R, { H, top, mx, X, bw, lab: false }) + ln + xl, "Minuti di allenamento per settimana nel tempo")}<div class="st2 s4"><div><b>${Math.round(a4("c"))}′</b>cardio a sett.</div><div><b>${Math.round(a4("m"))}′</b>muscolare a sett.</div><div><b>${fmtD(last4.reduce((s, z) => s + z.n, 0) / last4.length)}</b>sedute a sett.</div><div><b>${fmtD(tot / 60, 0)} h</b>in totale</div></div><div class="mu">Ogni barra è una settimana (le medie sono sulle ultime 4). La linea tratteggiata sono i 150′ a settimana di attività aerobica consigliati dal piano, insieme ad almeno 2 sedute di rinforzo muscolare.</div></div>`;
}

/* ---------- diario ---------- */
function dayBody(k, ed = true, ex = []) {
  const d = S.g[k];
  return (
    '<div class="ml">' +
    F.filter((f) => d[f[0]] && !ex.includes(f[0]))
      .map((f) => {
        const kc = KM.includes(f[0]) ? kcal(d[f[0]]).t : 0,
          lab = f[1].replace(" (kg)", ""),
          v = esc(d[f[0]]) + (f[0] === "peso" && !/kg/i.test(d.peso) ? " kg" : "");
        return `<div class="mr" data-i="${lab[0]}" style="--mc:var(--m-${f[0]});--mp:var(--p-${f[0]})"><i>${lab}</i><span>${v}</span><em>${kc ? fmt(kc) : ""}</em></div>`;
      })
      .join("") +
    "</div>" +
    (ed ? `<button class="b g" onclick="go('${k}')">Modifica</button>` : "")
  );
}
function dayHtml(k) {
  const d = S.g[k], t = dayK(k);
  return `<details class="day"><summary><span class="dn">${lbl(k)}</span><span class="dm">${[d.peso ? esc(d.peso) + " kg" : "", d.allenamento ? "allenamento" : "", t ? fmt(t) + " kcal" : ""].filter(Boolean).join(" · ")}</span></summary>${dayBody(k)}</details>`;
}
function home() {
  const ks = Object.keys(S.g).sort(),
    td = dk(new Date()),
    W = ks.filter((k) => num(S.g[k].peso)),
    lw = W.length ? num(S.g[W[W.length - 1]].peso) : null,
    fw = W.length ? num(S.g[W[0]].peso) : null,
    w0 = wkKey(td),
    T = target();
  let mn = 0;
  ks.forEach((k) => {
    if (k >= w0 && k <= td && S.g[k].allenamento) mn += trainStats(S.g[k].allenamento).mn;
  });
  const tk = dayK(td),
    pc = T > 0 ? Math.min(1, tk / T) : 0,
    C = 314.16,
    rest =
      T > 0
        ? tk <= T
          ? `<span>Restano</span> <b>${cu(T - tk)} kcal</b> <span>obiettivo ${fmt(T)} · stima</span>`
          : `<span>Oltre l’obiettivo di</span> <b>${fmt(tk - T)} kcal</b> <span>obiettivo ${fmt(T)} · stima</span>`
        : `<span>Stima dei pasti di oggi.</span> <span>Compila “I miei dati” in Grafici per avere un obiettivo.</span>`;
  let h = `<section class="hero">
<div class="hd">${lbl(td)}</div>
<div class="hb2">
<svg class="ring" viewBox="0 0 120 120" role="img" aria-label="${fmt(tk)} kcal${T ? " di " + fmt(T) : ""}"><circle cx="60" cy="60" r="50" fill="none" style="stroke:var(--tr)" stroke-width="11"/>${pc > 0 ? `<circle cx="60" cy="60" r="50" fill="none" style="stroke:var(--ac)" stroke-width="11" stroke-linecap="round" stroke-dasharray="${(pc * C).toFixed(1)} ${C}" transform="rotate(-90 60 60)" class="rp" data-l="${(pc * C).toFixed(1)}"/>` : ""}<text x="60" y="64" text-anchor="middle" class="rn"><tspan class="cu" data-v="${tk}">${fmt(tk)}</tspan></text><text x="60" y="81" text-anchor="middle" class="rl">${T ? "di " + fmt(T) + " kcal" : "kcal"}</text></svg>
<div class="big"><span>Assunte oggi</span><b>${cu(tk)}</b><em>${T ? "/ " + fmt(T) + " kcal" : "kcal"}</em></div>
<div class="hx"><p class="q">Cosa hai mangiato oggi?</p><p class="rest">${rest}</p></div>
</div>
<div class="bar" role="img" aria-label="${Math.round(pc * 100)}% dell’obiettivo"><i style="width:${(pc * 100).toFixed(0)}%"></i></div>
<button class="b cta" onclick="go('${td}')">${S.g[td] ? "Modifica la giornata" : "+ Aggiungi un pasto"}</button>
</section>
<div class="st3"><div><b>${cu(ks.length)}</b><span>giorni registrati</span></div><div><b>${lw != null ? cu(lw, 1) : "–"}</b><span>kg ultimo peso${fw && lw && W.length > 1 ? ` (${lw - fw > 0 ? "+" : ""}${fmtD(lw - fw)})` : ""}</span></div><div><b>${cu(Math.round(mn))}′</b><span>allenamento questa settimana</span></div></div>`;
  const dT = S.g[td] || {};
  if (dT.allenamento) {
    const ts = trainStats(dT.allenamento);
    h += `<section class="trc"><div><span>Allenamento di oggi</span><b>${esc(dT.allenamento)}</b></div>${ts.km || ts.mn || ts.kc ? `<div class="trn">${ts.km ? `<b>${cu(ts.km, 1)} km</b>` : ""}${ts.mn ? `<em>${cu(Math.round(ts.mn))} min</em>` : ""}${ts.kc ? `<em>${fmt(ts.kc)} kcal</em>` : ""}</div>` : ""}</section>`;
  }
  if (F.some((f) => f[0] !== "allenamento" && dT[f[0]])) h += `<section class="c oggi"><h3>Oggi</h3>${dayBody(td, false, ["allenamento"])}</section>`;
  h += weekHome(td);
  if (!ks.length) return `<div class="c wel"><h3>Benvenuto nel tuo diario</h3><p>Per ritrovare i tuoi dati tocca l’ingranaggio in alto e poi <b>Importa dati</b>, scegliendo il file del backup.</p><p class="mu">Oppure inizia da zero: aggiungi i pasti di oggi e compila “I miei dati” in Grafici.</p><button class="b" onclick="openSet()">Importa dati</button></div>` + h;
  const ys = {};
  ks.forEach((k) => {
    const [y, m] = k.split("-");
    ((ys[y] ??= {})[m] ??= []).push(k);
  });
  const pdfB = `<div class="pdfb"><button class="b" onclick="openPdf()"><svg viewBox="0 0 24 24" aria-hidden="true"><path d="M14 3H7a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h10a2 2 0 0 0 2-2V8z M14 3v5h5 M12 11v6 M9 14l3 3 3-3" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/></svg>Esporta PDF</button><span class="mu">Scegli i giorni e il formato da inviare alla nutrizionista</span></div>`;
  return (
    h +
    Object.keys(ys)
      .sort()
      .reverse()
      .map(
        (y) =>
          `<div class="c arc"><details><summary>${y} <span class="mu">${Object.values(ys[y]).flat().length} giorni</span></summary>${Object.keys(ys[y])
            .sort()
            .reverse()
            .map((m) => `<details><summary>${MESI[m - 1]} <span class="mu">${ys[y][m].length}</span></summary>${ys[y][m].slice().reverse().map(dayHtml).join("")}</details>`)
            .join("")}</details></div>`,
      )
      .join("") +
    pdfB
  );
}

/* ---------- annotazioni ---------- */
// cibi pronti con le dosi del piano, per ogni pasto
const PRE = {
  colazione: [
    ["Colazione", ["250 ml di latte", "45g di cereali", "65g di pane", "20g di marmellata", "3 fette biscottate", "pancakes", "yogurt greco", "cappuccino", "caffè"]],
    ["Frutta", ["banana", "mela", "arancia", "mandarini", "fragole", "mirtilli"]],
  ],
  spuntino: [
    ["Spuntino", ["yogurt greco", "30g di gallette", "30g di sfoglie", "crackers", "20g di marmellata"]],
    ["Frutta", ["banana", "mandarini", "mela", "arancia", "uva", "fragole", "mirtilli", "kiwi"]],
  ],
  pranzo: [
    ["Carboidrati", ["80g di pasta", "80g di pasta integrale", "75g di riso", "75g di farro", "180g di gnocchi", "160g di polenta", "200g di patate", "65g di pane"]],
    ["Proteine", ["160g di pollo", "160g di tacchino", "160g di carne di manzo", "hamburger", "180g di pesce", "80g di tonno", "2 uova", "150g di legumi", "125g di mozzarella", "120g di ricotta", "60g di prosciutto cotto", "80g di bresaola"]],
    ["Condimenti", ["al pesto", "al ragù", "al pomodoro", "10g di grana"]],
    ["Verdura", ["insalata", "pomodori", "zucchine", "verdure in padella", "crauto rosso", "(olio, aceto, sale)"]],
    ["Altro", ["caffè zuccherato", "caffè"]],
  ],
  cena: [
    ["Carboidrati", ["60g di pane", "30g di gallette", "200g di patate", "50g di pasta", "50g di riso", "160g di polenta", "piadina"]],
    ["Proteine", ["170g di pollo", "170g di tacchino", "170g di carne di manzo", "hamburger", "200g di pesce", "80g di tonno", "2 uova", "150g di legumi", "125g di mozzarella", "60g di prosciutto cotto", "80g di bresaola"]],
    ["Verdura", ["insalata", "pomodori", "zucchine", "verdure in padella", "crauto rosso", "(olio, aceto, sale)"]],
  ],
};
PRE.merenda = PRE.spuntino;
// i pasti che scrivi più spesso, presi dal tuo diario
function frequent(slot) {
  const slots = slot === "spuntino" || slot === "merenda" ? ["spuntino", "merenda"] : [slot], cnt = {}, last = {};
  Object.keys(S.g).sort().forEach((k) =>
    slots.forEach((s) => {
      const v = (S.g[k] || {})[s];
      if (!v) return;
      const key = v.trim().toLowerCase().replace(/\s+/g, " ");
      cnt[key] = (cnt[key] || 0) + 1;
      last[key] = v.trim();
    }),
  );
  return Object.keys(cnt).filter((k) => cnt[k] >= 2).sort((a, b) => cnt[b] - cnt[a]).slice(0, 12).map((k) => last[k]);
}
function preSel(slot) {
  const fr = frequent(slot), op = (v, t) => `<option value="${esc(v)}">${esc(t || v)}</option>`;
  return `<select class="pre" data-for="${slot}" aria-label="Scegli dai pasti e cibi frequenti"><option value="">＋ Frequenti</option>${
    fr.length ? `<optgroup label="I tuoi ${slot === "spuntino" || slot === "merenda" ? "spuntini" : "pasti"} più frequenti">${fr.map((v) => op("P|" + v, v)).join("")}</optgroup>` : ""
  }${(PRE[slot] || []).map(([g, xs]) => `<optgroup label="${g} (dosi del piano)">${xs.map((v) => op("C|" + v, v)).join("")}</optgroup>`).join("")}${
    myFoods().length ? `<optgroup label="I miei alimenti">${myFoods().map((c) => op("C|" + c.n, c.n)).join("")}</optgroup>` : ""
  }</select>`;
}
// anteprima della stima sotto ogni pasto
function kPrev(txt) {
  if (!txt || !txt.trim()) return "";
  const r = kcal(txt);
  let s = `<b>≈ ${fmt(r.t)} kcal</b>`;
  if (r.i.length) s += ` · ${r.i.map((x) => esc(x.w) + (x.g ? " " + fmtD(x.g, 0) + "g" : "") + (x.half ? " (½)" : "")).join(", ")}`;
  if (r.fx.length) s += `<span class="kfx">Corretto: ${r.fx.map(([a, b]) => `“${esc(a)}” → ${esc(b)}`).join(", ")}</span>`;
  if (r.u.length) s += `<span class="kun">Non riconosciuto: ${[...new Set(r.u)].map((w) => `<button type="button" class="lnk" data-addfood="${esc(w)}">${esc(w)}</button>`).join(", ")} · tocca per aggiungerlo ai tuoi alimenti</span>`;
  return s;
}
// tipi di allenamento: il nome finisce nel testo e decide se è cardio o muscolare
const TRT = [
  ["Cardio", ["Corsa", "Camminata", "Trekking", "Bici", "Cyclette", "Spinning", "Ellittica", "Tapis roulant", "Nuoto", "Calcio", "Padel / tennis", "Altro cardio"]],
  ["Muscolare", ["Palestra (pesi)", "Muscolare a corpo libero", "Circuito / funzionale", "Stretching", "Yoga / pilates", "Altro muscolare"]],
];
const trRow = (r = {}) =>
  `<div class="trr" data-id="${esc(r.id || "")}" data-src="${esc(r.src || "")}"><div class="trr-t"><label>Attività<select class="tr-t"><option value="">Scegli…</option>${r.t && !TRT.some(([, xs]) => xs.includes(r.t)) ? `<option selected>${esc(r.t)}</option>` : ""}${TRT.map(([g, xs]) => `<optgroup label="${g}">${xs.map((x) => `<option${r.t === x ? " selected" : ""}>${x}</option>`).join("")}</optgroup>`).join("")}</select></label><button type="button" class="x trx" aria-label="Rimuovi attività"><svg viewBox="0 0 24 24" aria-hidden="true"><path d="M6 6l12 12M18 6L6 18" stroke="currentColor" stroke-width="2.2" stroke-linecap="round"/></svg></button></div><div class="trr-n"><label>Minuti<input class="tr-m" inputmode="numeric" value="${esc(r.min ?? "")}" placeholder="es. 45"></label><label>Km <i>facoltativo</i><input class="tr-km" inputmode="decimal" value="${esc(r.km ?? "")}" placeholder="—"></label><label>Kcal <i>se le hai</i><input class="tr-c" inputmode="numeric" value="${esc(r.kcal ?? "")}" placeholder="—"></label></div></div>`;
const trText = (r) => `${r.t}${r.km ? " " + r.km + " km," : ""} ${r.min} minuti${r.kcal ? ", " + r.kcal + " kcal" : ""}`;
function note() {
  const d = S.g[sel] || {}, att = Array.isArray(d.att) ? d.att : [], legacy = att.length ? d.alln || "" : d.allenamento || "";
  const field = (f) => {
    const [k, t] = f;
    if (k === "allenamento")
      return `<fieldset class="trw"><legend>Allenamento</legend><div id="trs">${(att.length ? att : [{}]).map(trRow).join("")}</div><button type="button" class="b g" id="tra">+ Aggiungi attività</button><label for="f_alln">Note sull’allenamento <i>facoltativo</i></label><textarea id="f_alln" placeholder="es. esercizi fatti, sensazioni…">${esc(legacy)}</textarea></fieldset>`;
    if (k === "peso") return `<label for="f_peso">${t}</label><input id="f_peso" inputmode="decimal" value="${esc(d.peso)}">`;
    if (k === "nota") return `<label for="f_nota">${t}</label><textarea id="f_nota">${esc(d.nota)}</textarea>`;
    return `<div class="mf"><div class="mf-h"><label for="f_${k}">${t}</label>${preSel(k)}</div><textarea id="f_${k}" data-meal="${k}">${esc(d[k])}</textarea><div class="kp" id="kp_${k}" aria-live="polite">${kPrev(d[k])}</div></div>`;
  };
  return `<div class="c"><h3>${S.g[sel] ? "Modifica la giornata" : "Nuova giornata"}</h3><label for="dt">Data</label><input type="date" id="dt" value="${sel}"><div class="mu" id="dl">${lbl(sel)}</div>${F.map(field).join("")}<button class="b" id="sv">Salva</button><button class="b g" id="dl2">Elimina giorno</button> <span class="mu" id="ok" role="status"></span></div>
<div class="c" id="myf"><h3>I miei alimenti</h3><div class="mu">Cibi che la stima non conosce: scrivi le calorie dall’etichetta e vengono usati in tutti i pasti.</div>${myFoodList()}<div class="g3"><label>Nome<input id="nf_n" placeholder="es. avocado"></label><label>Kcal per 100 g<input id="nf_k" inputmode="decimal" placeholder="es. 160"></label><label>Porzione (g)<input id="nf_g" inputmode="decimal" placeholder="es. 100"></label></div><button class="b g" id="nf_s">Aggiungi alimento</button> <span class="mu" id="nf_o" role="status"></span></div>
<div class="c"><h3>Importa dalle note</h3><div class="mu">Incolla il testo nel formato che usi già (“12 ottobre:” poi Colazione:, Spuntino:, Pranzo:, Cena:, Allenamento:, Peso:). I giorni già presenti vengono aggiornati.</div><label for="iy">Anno delle date</label><input id="iy" inputmode="numeric" value="${new Date().getFullYear()}"><label for="it">Testo</label><textarea id="it" style="min-height:140px" placeholder="9 settembre:&#10;Colazione: latte con cereali&#10;…"></textarea><button class="b" id="im">Importa</button> <span class="mu" id="io" role="status"></span></div>`;
}
const myFoodList = () =>
  myFoods().length
    ? `<div class="mfl">${myFoods().map((c, i) => `<div class="f"><b>${esc(c.n)}</b><span>${fmtD(num(c.k))} kcal/100 g · porzione ${fmtD(num(c.g) || 100, 0)} g <button type="button" class="lnk" data-delfood="${i}">rimuovi</button></span></div>`).join("")}</div>`
    : "";
function bindNote() {
  $("#dt").onchange = (e) => {
    if (e.target.value) {
      sel = e.target.value;
      render();
    }
  };
  // menu a tendina: un pasto intero sostituisce il testo vuoto, un cibo si aggiunge in fondo
  document.querySelectorAll("select.pre").forEach(
    (s) =>
      (s.onchange = () => {
        const v = s.value;
        if (!v) return;
        const ta = $("#f_" + s.dataset.for), [kind, txt] = [v.slice(0, 1), v.slice(2)], cur = ta.value.trim();
        if (kind === "P" || !cur) ta.value = kind === "P" && cur ? cur + ", " + txt : txt;
        else ta.value = cur + (txt.startsWith("(") ? " " : ", ") + txt;
        s.value = "";
        ta.dispatchEvent(new Event("input"));
        ta.focus();
      }),
  );
  document.querySelectorAll("textarea[data-meal]").forEach((ta) => (ta.oninput = () => ($("#kp_" + ta.dataset.meal).innerHTML = kPrev(ta.value))));
  $("#m").onclick = (e) => {
    const a = e.target.closest("[data-addfood]"), dl = e.target.closest("[data-delfood]"), x = e.target.closest(".trx");
    if (a) {
      $("#nf_n").value = a.dataset.addfood;
      $("#myf").scrollIntoView({ behavior: "smooth", block: "center" });
      setTimeout(() => $("#nf_k").focus(), 300);
    }
    if (dl) {
      S.p.cibi.splice(+dl.dataset.delfood, 1);
      saveP();
      keepNote();
    }
    if (x) {
      const rows = document.querySelectorAll("#trs .trr");
      if (rows.length > 1) x.closest(".trr").remove();
      else x.closest(".trr").outerHTML = trRow();
    }
  };
  $("#tra").onclick = () => {
    $("#trs").insertAdjacentHTML("beforeend", trRow());
    $("#trs .trr:last-child .tr-t").focus();
  };
  $("#nf_s").onclick = async () => {
    const n = $("#nf_n").value.trim().toLowerCase(), k = num($("#nf_k").value), g = num($("#nf_g").value) || 100;
    if (!n || k == null) {
      $("#nf_o").textContent = "Scrivi nome e kcal per 100 g";
      return;
    }
    S.p.cibi = myFoods().filter((c) => c.n.toLowerCase() !== n);
    S.p.cibi.push({ n, k, g });
    await saveP();
    keepNote();
    $("#nf_o").textContent = "Aggiunto: ora “" + n + "” viene contato";
  };
  $("#sv").onclick = async () => {
    const o = {};
    F.forEach((f) => {
      if (f[0] === "allenamento") return;
      const v = $("#f_" + f[0]).value.trim();
      if (v) o[f[0]] = v;
    });
    const att = [...document.querySelectorAll("#trs .trr")]
      .map((r) => ({ t: r.querySelector(".tr-t").value, min: num(r.querySelector(".tr-m").value), km: num(r.querySelector(".tr-km").value), kcal: num(r.querySelector(".tr-c").value), id: r.dataset.id || undefined, src: r.dataset.src || undefined }))
      .filter((r) => r.t && (r.min || r.km || r.kcal))
      .map((r) => Object.fromEntries(Object.entries(r).filter(([, v]) => v != null && v !== "")));
    const note = $("#f_alln").value.trim(), txt = [att.map(trText).join(" + "), note].filter(Boolean).join("; ");
    if (att.length) o.att = att;
    if (att.length && note) o.alln = note;
    if (txt) o.allenamento = txt;
    if (Object.keys(o).length) S.g[sel] = o;
    else delete S.g[sel];
    await saveMonths([sel.slice(0, 7)]);
    $("#ok").textContent = "Salvato";
  };
  $("#dl2").onclick = async () => {
    if (!confirm("Eliminare questo giorno?")) return;
    delete S.g[sel];
    await saveMonths([sel.slice(0, 7)]);
    render();
  };
  $("#im").onclick = async () => {
    const r = parse($("#it").value, parseInt($("#iy").value) || new Date().getFullYear()),
      ks = Object.keys(r);
    ks.forEach((k) => (S.g[k] = { ...S.g[k], ...r[k] }));
    await saveMonths([...new Set(ks.map((k) => k.slice(0, 7)))]);
    $("#io").textContent = ks.length + " giorni importati";
  };
}
// aggiorna la lista dei miei alimenti e le stime senza perdere quello che stai scrivendo
function keepNote() {
  $("#myf .mfl")?.remove();
  $("#myf .mu").insertAdjacentHTML("afterend", myFoodList());
  document.querySelectorAll("textarea[data-meal]").forEach((ta) => ($("#kp_" + ta.dataset.meal).innerHTML = kPrev(ta.value)));
  document.querySelectorAll("select.pre").forEach((s) => (s.outerHTML = preSel(s.dataset.for)));
  bindNote();
}
function parse(t, y) {
  const out = {};
  let k = null, pr = false;
  const mm = Object.fromEntries(MESI.map((m, i) => [m, i + 1]));
  for (const raw of t.split("\n")) {
    const l = raw.trim();
    if (!l) continue;
    const h = l.match(/^(?:[a-zà-ù]+\s+)?(\d{1,2})\s+([a-zà-ù]+)\s*:?$/i);
    if (h && mm[h[2].toLowerCase()]) {
      k = y + "-" + p2(mm[h[2].toLowerCase()]) + "-" + p2(h[1]);
      out[k] = {};
      pr = false;
      continue;
    }
    if (!k || /^(totale|da migliorare)/i.test(l)) continue;
    const d = out[k],
      m = l.match(/^([A-Za-zÀ-ù ]+?)\s*:\s*(.*)$/),
      n = (m ? m[1] : "").toLowerCase().trim(),
      v = m ? m[2].trim() : "";
    if (/^peso/i.test(l)) {
      const x = [...l.matchAll(/\d{2,3}(?:[.,]\d+)?/g)].map((a) => parseFloat(a[0].replace(",", "."))).filter((a) => a >= 40).pop();
      if (x) d.peso = String(x);
      continue;
    }
    if (m && n === "colazione") {
      if (v) d.colazione = v;
    } else if (m && n === "pranzo") {
      pr = true;
      if (v) d.pranzo = v;
    } else if (m && n === "cena") {
      if (v) d.cena = v;
    } else if (m && (n === "spuntino" || n === "merenda")) {
      if (v) d[pr ? "merenda" : "spuntino"] = v;
    } else if (m && /^(allenamento|attivit)/.test(n)) {
      if (v) d.allenamento = v;
    } else d.nota = (d.nota ? d.nota + " " : "") + l.replace(/^sensazioni:\s*/i, "");
  }
  return out;
}

/* ---------- grafici ---------- */
function svg(w, h, body, lab) {
  return `<svg class="ch" viewBox="0 0 ${w} ${h}" font-size="10" fill="currentColor"${lab ? ` role="img" aria-label="${esc(lab)}"` : ""}>${body}</svg>`;
}
function line(vals, labs, col2, o = {}) {
  if (vals.length < 2) return '<div class="mu">Servono almeno 2 misurazioni.</div>';
  const w = 340, h = 170,
    hasT = o.tg != null && !isNaN(o.tg) && o.tg > 0,
    all = hasT ? [...vals, o.tg] : vals,
    mn0 = Math.min(...all), mx0 = Math.max(...all),
    pad = (mx0 - mn0) * 0.08 || 1, mn = mn0 - pad, mx = mx0 + pad,
    X = (i) => 40 + (i * (w - 50)) / (vals.length - 1),
    Y = (v) => h - 22 - ((v - mn) / (mx - mn)) * (h - 36);
  const dec = o.dec ?? 1;
  let b = [mn0, (mn0 + mx0) / 2, mx0]
    .map((v) => `<line x1="40" x2="${w - 10}" y1="${Y(v).toFixed(1)}" y2="${Y(v).toFixed(1)}" style="stroke:var(--bd)" stroke-width="1"/><text x="34" y="${(Y(v) + 3).toFixed(1)}" text-anchor="end" class="ax">${fmtD(v, dec)}</text>`)
    .join("");
  if (hasT) b += `<line x1="40" x2="${w - 10}" y1="${Y(o.tg).toFixed(1)}" y2="${Y(o.tg).toFixed(1)}" style="stroke:var(--tg)" stroke-width="1.5" stroke-dasharray="5 4"/><text x="${w - 10}" y="${(Y(o.tg) - 4).toFixed(1)}" text-anchor="end" class="ax" style="fill:var(--tg)">${esc(o.tl || "obiettivo")}</text>`;
  b += `<path d="${vals.map((v, i) => (i ? "L" : "M") + X(i).toFixed(1) + " " + Y(v).toFixed(1)).join("")}" fill="none" style="stroke:${col2}" stroke-width="2.5" stroke-linejoin="round" stroke-linecap="round" class="ln-a"/>`;
  if (vals.length <= 40) b += vals.map((v, i) => `<circle cx="${X(i).toFixed(1)}" cy="${Y(v).toFixed(1)}" r="3" style="fill:${col2}" class="dot-a"/>`).join("");
  const mid = Math.floor((vals.length - 1) / 2);
  b += `<text x="40" y="${h - 4}" class="ax">${labs[0]}</text>${vals.length > 2 ? `<text x="${X(mid).toFixed(1)}" y="${h - 4}" text-anchor="middle" class="ax">${labs[mid]}</text>` : ""}<text x="${w - 10}" y="${h - 4}" text-anchor="end" class="ax">${labs[labs.length - 1]}</text>`;
  return svg(w, h, b, o.lab);
}
function wlab(s) {
  const a = pd(s), b = new Date(a);
  b.setDate(a.getDate() + 6);
  return a.getDate() + (a.getMonth() !== b.getMonth() ? " " + MESI[a.getMonth()].slice(0, 3) : "") + " – " + b.getDate() + " " + MESI[b.getMonth()].slice(0, 3) + " " + b.getFullYear();
}
const lastK = (f) => {
  const a = Object.keys(S.g).sort().filter((k) => f(S.g[k]));
  return a.length ? a[a.length - 1] : dk(new Date());
};
const shiftP = (r, m, n) => {
  const d = pd(r);
  if (m === "mese") d.setMonth(d.getMonth() + n, 1);
  else d.setDate(d.getDate() + 7 * n);
  return dk(d);
};
const navB = (l, fn, id = "") =>
  `<div class="pn"><button class="b g" onclick="${fn}(-1)" aria-label="Precedente">◀</button><span${id ? ` id="${id}"` : ""}>${l}</span><button class="b g" onclick="${fn}(1)" aria-label="Successivo">▶</button></div>`;
let TR = { m: "sett", ref: null }, CW = { ref: null }, BC = { i: null };
window.trS = (n) => { TR.ref = shiftP(TR.ref, TR.m, n); render(); };
window.trM = (m) => { TR.m = m; render(); };
window.cwS = (n) => { CW.ref = shiftP(CW.ref, "sett", n); render(); };

function calW() {
  CW.ref = CW.ref || lastK((d) => KM.some((m) => d[m]));
  const s = pd(wkKey(CW.ref)), D = [];
  for (let i = 0; i < 7; i++) {
    const d = new Date(s);
    d.setDate(s.getDate() + i);
    const k = dk(d), r = S.g[k] || {};
    D.push([k, KM.map((m) => kcal(r[m]).t)]);
  }
  const tot = D.map((x) => x[1].reduce((a, b) => a + b, 0)),
    T = target(),
    mx = Math.max(T, ...tot, 1) * 1.1,
    H = 140, top = 14,
    any = tot.some((x) => x),
    days = tot.filter((x) => x),
    avg = days.length ? days.reduce((a, b) => a + b, 0) / days.length : 0,
    Y = (v) => top + H - (v / mx) * H;
  return `<div class="c"><h3>Calorie assunte per giorno</h3>${navB(wlab(wkKey(CW.ref)), "cwS")}${
    any
      ? svg(
          340,
          H + top + 24,
          D.map((x, i) => {
            let y = top + H;
            const X = 12 + i * 46;
            return (
              `<g class="ba" style="transform-origin:0 ${top + H}px">` +
              x[1]
                .map((v, j) => {
                  if (!v) return "";
                  const hh = (v / mx) * H;
                  y -= hh;
                  return `<rect x="${X}" y="${y.toFixed(1)}" width="34" height="${hh.toFixed(1)}" style="fill:var(--m-${KM[j]})"/>`;
                })
                .join("") +
              "</g>" +
              `<text x="${X + 17}" y="${top + H + 15}" text-anchor="middle" class="ax">${GS[pd(x[0]).getDay()].slice(0, 3)}</text>` +
              (tot[i] ? `<text x="${X + 17}" y="${(Y(tot[i]) - 4).toFixed(1)}" text-anchor="middle" font-size="9.5" font-weight="700">${fmt(tot[i])}</text>` : "")
            );
          }).join("") +
            (T > 0 ? `<line x1="4" x2="336" y1="${Y(T).toFixed(1)}" y2="${Y(T).toFixed(1)}" style="stroke:var(--tg)" stroke-width="1.5" stroke-dasharray="5 4"/>` : ""),
          "Calorie stimate per giorno della settimana",
        )
      : '<div class="mu">Nessun pasto registrato in questa settimana.</div>'
  }<div class="lg2">${KM.map((m) => `<span><i style="background:var(--m-${m})"></i>${m}</span>`).join("")}</div><div class="mu">Stima dai pasti scritti. ${any ? `Media dei giorni compilati: <b>${fmt(avg)} kcal</b>. ` : ""}${T > 0 ? "La linea tratteggiata è il tuo obiettivo per dimagrire (" + fmt(T) + " kcal)." : ""}</div></div>`;
}
function weightC() {
  const ks = Object.keys(S.g).sort(),
    W = ks.filter((k) => num(S.g[k].peso)).map((k) => [k, num(S.g[k].peso)]),
    ob = num(S.p.obj),
    lw = W.length ? W[W.length - 1][1] : null;
  return `<div class="c"><h3>Peso nel tempo</h3>${line(W.map((a) => a[1]), W.map((a) => dl(a[0])), "var(--ac)", { tg: ob, tl: "obiettivo " + (ob ? fmtD(ob) : ""), lab: "Andamento del peso" })}<div class="mu">${
    W.length ? `Ultimo: <b>${fmtD(lw)} kg</b>` + (W.length > 1 ? ` · dal primo: ${lw - W[0][1] > 0 ? "+" : ""}${fmtD(lw - W[0][1])} kg` : "") + (ob ? ` · obiettivo ${fmtD(ob)} kg` + (lw > ob ? ` (mancano ${fmtD(lw - ob)} kg)` : " raggiunto") : "") : "Scrivi il peso nelle annotazioni per vedere il grafico."
  }</div></div>`;
}
function calDayC() {
  const ks = Object.keys(S.g).sort(), k0 = S.g[sel] ? sel : ks[ks.length - 1] || sel, d = S.g[k0], T = tdee().t, O = target();
  let body = '<div class="mu">Nessun dato per questo giorno.</div>';
  if (d) {
    let tot = 0, h = "";
    F.filter((f) => KM.includes(f[0]) && d[f[0]]).forEach(([x, n]) => {
      const r = kcal(d[x]);
      tot += r.t;
      h += `<details class="kd"><summary><b>${n}</b><span class="kc">${fmt(r.t)} kcal</span></summary><div class="ki">${
        r.i.length ? r.i.map((it) => `<div><span>${esc(it.w)}${it.g ? " · " + fmtD(it.g, 0) + " g" : ""}</span><span>${fmt(it.k)}</span></div>`).join("") : '<div><span class="mu">nessun alimento riconosciuto</span></div>'
      }</div></details>`;
    });
    const bk = trainStats(d.allenamento).kc;
    body = h + `<div class="f tot"><b>Totale</b><span class="kc">${fmt(tot)} kcal</span></div>` + (bk ? `<div class="f"><b>Bruciate con l’allenamento</b><span class="kc">${fmt(bk)} kcal</span></div>` : "") + (T ? `<div class="mu">Fabbisogno ${fmt(T)} kcal → ${tot > T ? "+" : ""}${fmt(tot - T)} · obiettivo per dimagrire ${fmt(O)} kcal → ${tot > O ? "+" : ""}${fmt(tot - O)}</div>` : "");
  }
  return `<div class="c"><h3>Calorie del giorno (stima)</h3><label for="cd">Giorno</label><input type="date" id="cd" value="${k0}">${body}<div class="mu" style="margin-top:8px">Tocca un pasto per vedere come è stata fatta la stima. Si basa su porzioni medie e sui grammi o i pezzi che scrivi (es. “4 gallette”, “150g di pollo”).</div></div>`;
}

/* ---------- composizione corporea ---------- */
const hist = () => (S.p.storia || []).filter((x) => num(x.peso) && num(x.grasso)).slice().sort((a, b) => (a.d || "").localeCompare(b.d || ""));
function comp(x) {
  const p = num(x.peso), gf = num(x.grasso), fat = (p * gf) / 100, lean = p - fat, m0 = num(x.lean), os = num(x.ossa);
  const mus = m0 && m0 < lean ? m0 : os && os < lean ? lean - os : lean * 0.95;
  return { p, gf, fat, lean, mus, bone: os && os < lean ? os : Math.max(0, lean - mus), boneM: !!(os && os < lean), est: !(m0 && m0 < lean) && !(os && os < lean), x };
}
// figure della composizione corporea: una immagine per fascia di BMI
const FIG = { normale: "img/figura-normale.webp", sovrappeso: "img/figura-sovrappeso.webp", obesita: "img/figura-obesita.webp", grave: "img/figura-grave.webp", estrema: "img/figura-estrema.webp" };
const BMIC = [
  { k: "normale", n: "Normopeso", r: "< 25", max: 25, c: "#7CC243", t: "#13250A" },
  { k: "sovrappeso", n: "Sovrappeso", r: "25–29,9", max: 30, c: "#F2C230", t: "#2B2003" },
  { k: "obesita", n: "Obesità", r: "30–39,9", max: 40, c: "#F08A24", t: "#2E1602" },
  { k: "grave", n: "Obesità grave", r: "40–44,9", max: 45, c: "#C9481A", t: "#FFFFFF" },
  { k: "estrema", n: "Obesità estrema", r: "≥ 45", max: Infinity, c: "#B3263A", t: "#FFFFFF" },
];
const hM = () => (num(S.p.altezza) || 175) / 100;
const bmiOf = (p) => p / hM() / hM();
const bmiCat = (b) => BMIC.findIndex((x) => b < x.max);
const catName = (b) => (b < 18.5 ? "Sottopeso" : BMIC[bmiCat(b)].n);
function bodyFig(c) {
  const b = bmiOf(c.p), k = BMIC[bmiCat(b)];
  return `<figure class="bfig"><img id="bfi" src="${FIG[k.k]}" alt="Figura della fascia ${catName(b).toLowerCase()}"><figcaption id="bfc"><b style="background:${k.c};color:${k.t}">${catName(b)}</b><span>BMI ${cu(b, 1)}</span></figcaption></figure>`;
}
function bodySeq(c) {
  const ci = bmiCat(bmiOf(c.p)), ob = num(S.p.obj), oi = ob ? bmiCat(bmiOf(ob)) : -1;
  return `<div class="seq">${BMIC.map(
    (k, i) =>
      `<div class="sq${i === ci ? " on" : ""}"${i === ci ? ' aria-current="true"' : ""}>${i === ci ? '<span class="tag">tu</span>' : i === oi ? '<span class="tag ob">obiettivo</span>' : ""}<img src="${FIG[k.k]}" alt="" loading="lazy"><b style="background:${k.c};color:${k.t}">${k.n.replace("Obesità ", "Obesità<br>").replace("Normopeso", "Normo&shy;peso").replace("Sovrappeso", "Sovrap&shy;peso")}</b><em>${k.r}</em></div>`,
  ).join("")}</div>`;
}
function dlt(v, good) {
  if (v == null || Math.abs(v) < 0.05) return "";
  const ok = good === "up" ? v > 0 : v < 0;
  return ` <small class="${ok ? "gd" : "bad"}">${v > 0 ? "+" : ""}${fmtD(v)}</small>`;
}
function bodyLeg(c, p) {
  return `<div class="bl-r"><i style="background:var(--ft);border-color:var(--fte)"></i><div><span>Massa grassa</span><b>${cu(c.fat, 1)} kg${dlt(p && c.fat - p.fat, "dn")}</b><em>${fmtD(c.gf)}% del peso</em></div></div>
<div class="bl-r"><i style="background:var(--ms);border-color:var(--mso)"></i><div><span>Massa muscolare${c.est ? " (stima)" : ""}</span><b>${cu(c.mus, 1)} kg${dlt(p && c.mus - p.mus, "up")}</b><em>${fmtD((c.mus / c.p) * 100)}% del peso</em></div></div>
<div class="bl-r"><i style="background:var(--bn);border-color:var(--bno)"></i><div><span>${c.boneM ? "Massa ossea" : "Ossa e resto"}</span><b>${cu(c.bone, 1)} kg</b><em>${c.boneM ? "massa ossea misurata" : "stima per differenza"}</em></div></div>
<div class="bl-r tot"><div><span>Peso</span><b>${cu(c.p, 1)} kg${dlt(p && c.p - p.p, "dn")}</b></div></div>`;
}
function ffExtra(c) {
  const x = c.x || {}, it = [["scheletrico", "Muscolo scheletrico", "%"], ["acqua", "Idratazione", "%"], ["proteine", "Proteine", "%"], ["viscerale", "Grasso addominale", ""], ["bmr", "Metabolismo basale", " kcal"], ["eta", "Età metabolica", " anni"]].filter(([k]) => num(x[k]) != null);
  return it.length ? `<div class="ffx">${it.map(([k, n, u]) => `<div><span>${n}</span><b>${fmtD(num(x[k]), 1)}${u}</b></div>`).join("")}</div>` : "";
}
function bbar(c) {
  const a = (c.fat / c.p) * 100, b = (c.mus / c.p) * 100;
  return `<i style="width:${a.toFixed(1)}%;background:var(--ft)"></i><i style="width:${b.toFixed(1)}%;background:var(--ms)"></i><i style="flex:1;background:var(--bn)"></i>`;
}
function bodyNote(c) {
  const b = bmiOf(c.p), ob = num(S.p.obj);
  return `Il tuo BMI è <b>${fmtD(b)}</b> (${catName(b).toLowerCase()})${num(S.p.altezza) ? "" : ", calcolato con 175 cm perché l’altezza non è inserita"}${ob ? `. Al peso obiettivo di ${fmtD(ob)} kg sarebbe ${fmtD(bmiOf(ob))} (${catName(bmiOf(ob)).toLowerCase()})` : ""}. La figura cambia quando passi a un’altra fascia.`;
}
function bodyC() {
  const H = hist();
  if (!H.length) return `<div class="c"><h3>Composizione corporea</h3><div class="mu">Inserisci peso, grasso corporeo % e massa muscolare in “I miei dati” qui sotto per vedere la tua figura.</div></div>`;
  if (BC.i == null || BC.i >= H.length) BC.i = H.length - 1;
  const x = H[BC.i], c = comp(x), p = BC.i > 0 ? comp(H[BC.i - 1]) : null, dname = x.d ? lbl(x.d) + " " + x.d.slice(0, 4) : "Misurazione iniziale";
  return `<div class="c body"><h3>Composizione corporea</h3>${
    H.length > 1
      ? `<div class="pn"><button class="b g" id="bcp" onclick="bcS(-1)" aria-label="Misurazione precedente"${BC.i ? "" : " disabled"}>◀</button><span id="bcd">${dname}</span><button class="b g" id="bcn" onclick="bcS(1)" aria-label="Misurazione successiva"${BC.i < H.length - 1 ? "" : " disabled"}>▶</button></div>`
      : `<div class="pn one"><span>${dname}</span></div>`
  }<div class="bc">${bodyFig(c)}<div class="bl" id="bcl">${bodyLeg(c, p)}</div></div><div class="bbar" id="bcb" aria-hidden="true">${bbar(c)}</div><div id="bcx">${ffExtra(c)}</div><div class="mu" id="bcm">${bodyNote(c)} Ogni volta che salvi i dati si aggiunge una misurazione, e con le frecce le confronti.</div><h4 class="sqh">Le fasce</h4><div id="bcs">${bodySeq(c)}</div></div>`;
}
window.bcS = (n) => {
  const H = hist();
  BC.i = cl(BC.i + n, 0, H.length - 1);
  const x = H[BC.i], c = comp(x), p = BC.i > 0 ? comp(H[BC.i - 1]) : null, b = bmiOf(c.p), k = BMIC[bmiCat(b)], img = $("#bfi");
  if (img.getAttribute("src") !== FIG[k.k]) {
    img.style.opacity = 0;
    setTimeout(() => {
      img.src = FIG[k.k];
      img.style.opacity = 1;
    }, 250);
  }
  img.alt = "Figura della fascia " + catName(b).toLowerCase();
  $("#bfc").innerHTML = `<b style="background:${k.c};color:${k.t}">${catName(b)}</b><span>BMI ${fmtD(b)}</span>`;
  $("#bcl").innerHTML = bodyLeg(c, p);
  $("#bcb").innerHTML = bbar(c);
  $("#bcx").innerHTML = ffExtra(c);
  $("#bcs").innerHTML = bodySeq(c);
  if (animOn()) { countUps($("#bcl")); countUps($("#bfc")); fillBars($("#bcb").parentNode); }
  $("#bcm").innerHTML = bodyNote(c) + " Ogni volta che salvi i dati si aggiunge una misurazione, e con le frecce le confronti.";
  $("#bcd").textContent = x.d ? lbl(x.d) + " " + x.d.slice(0, 4) : "Misurazione iniziale";
  $("#bcp").disabled = BC.i === 0;
  $("#bcn").disabled = BC.i === H.length - 1;
};
function profC() {
  const P = S.p, T = tdee(), w = num(P.peso), gf = num(P.grasso), hcm = num(P.altezza),
    pf = (id, t, v) => `<div><label for="p_${id}">${t}</label><input id="p_${id}" data-p="${id}" inputmode="decimal" value="${esc(v)}"></div>`;
  return `<div class="c"><h3>I miei dati e fabbisogno</h3><div class="g2">${pf("peso", "Peso (kg)", P.peso)}${pf("grasso", "Grasso corporeo %", P.grasso)}${pf("lean", "Massa muscolare (kg)", P.lean)}${pf("bmr", "Metabolismo basale (kcal)", P.bmr)}${pf("altezza", "Altezza (cm)", P.altezza)}${pf("eta", "Età", P.eta)}${pf("att", "Attività (1,2–1,9)", P.att)}${pf("obj", "Peso obiettivo (kg)", P.obj)}${pf("def", "Deficit giornaliero (kcal)", P.def)}<div><label for="p_d">Data misurazione</label><input type="date" id="p_d" value="${dk(new Date())}"></div></div><button class="b" id="sp">Salva dati</button> <span class="mu" id="po" role="status"></span>
<div class="f" style="margin-top:12px"><b>Basale</b><span>${fmt(T.bmr)} kcal</span></div><div class="mu" style="margin:-2px 0 4px">${T.bmr ? "Da " + T.src : "Inserisci il basale, oppure peso e grasso %, oppure altezza ed età."}</div>
<div class="f"><b>Fabbisogno</b><span>${fmt(T.t)} kcal/giorno</span></div><div class="f"><b>Per dimagrire</b><span>${fmt(target())} kcal/giorno</span></div>${
    w && gf ? `<div class="f"><b>Massa grassa</b><span>${fmtD((w * gf) / 100)} kg</span></div><div class="f"><b>Massa magra</b><span>${fmtD(w * (1 - gf / 100))} kg</span></div>` : ""
  }${w && hcm ? `<div class="f"><b>BMI</b><span>${fmtD(w / (hcm / 100) ** 2)}</span></div>` : ""}<div class="mu" style="margin-top:8px">Fabbisogno = basale × attività. Se l’attività la scrivi già alta (es. 1,5–1,6) non sommare a parte le calorie degli allenamenti.</div></div>`;
}
function graf() {
  return bodyC() + trendC() + weightC() + trainC() + calW() + calDayC() + profC();
}
function bindGraf() {
  $("#cd").onchange = (e) => {
    if (e.target.value) {
      sel = e.target.value;
      render();
    }
  };
  $("#sp").onclick = async () => {
    document.querySelectorAll("[data-p]").forEach((i) => (S.p[i.dataset.p] = i.value.trim()));
    if (num(S.p.peso) && num(S.p.grasso)) {
      const d = $("#p_d").value || dk(new Date()), H = (S.p.storia = S.p.storia || []), e = { d, peso: S.p.peso, grasso: S.p.grasso, lean: S.p.lean }, i = H.findIndex((x) => x.d === d);
      if (i >= 0) H[i] = e;
      else H.push(e);
      BC.i = null;
    }
    await saveP();
    render();
    $("#po").textContent = "Dati salvati";
  };
}

/* ---------- esporta PDF per la nutrizionista ---------- */
const PDFL = [
  { k: "tabella", n: "Tabella", d: "Una riga per giorno con tutti i pasti affiancati. Foglio orizzontale, il più compatto." },
  { k: "schede", n: "Giorno per giorno", d: "Ogni giorno in un riquadro, pasti uno sotto l’altro. Foglio verticale, il più leggibile." },
  { k: "riepilogo", n: "Riepilogo + tabella", d: "Prima pagina con medie, peso, allenamenti e composizione corporea; poi la tabella dei giorni." },
];
let PX = { from: null, to: null, lay: "tabella", tr: true, note: true, kc: false, vuoti: true, blob: null, name: "" };
const addD = (k, n) => {
  const d = pd(k);
  d.setDate(d.getDate() + n);
  return dk(d);
};
function rangeDays(a, b) {
  const out = [];
  if (!a || !b || a > b) return out;
  for (let k = a; k <= b && out.length < 400; k = addD(k, 1)) out.push(k);
  return out;
}
const hasMeal = (d) => d && (KM.some((m) => d[m]) || d.allenamento || d.peso || d.nota);
function pdfInfo() {
  const D = rangeDays(PX.from, PX.to), n = D.filter((k) => hasMeal(S.g[k])).length;
  if (!D.length) return "Scegli un periodo valido (la data di inizio deve venire prima della fine).";
  return `${D.length} giorni nel periodo, <b>${n} compilati</b>${D.length - n ? ` · ${D.length - n} vuoti` : ""}.`;
}
function pdfHtml() {
  const td = dk(new Date());
  const q = [
    ["7", "Ultimi 7 giorni", addD(td, -6), td],
    ["14", "Ultimi 14 giorni", addD(td, -13), td],
    ["m", "Questo mese", td.slice(0, 8) + "01", td],
    ["mp", "Mese scorso", (() => { const d = pd(td.slice(0, 8) + "01"); d.setMonth(d.getMonth() - 1); return dk(d); })(), addD(td.slice(0, 8) + "01", -1)],
  ];
  return `<div class="sh-in" role="dialog" aria-modal="true" aria-labelledby="px-t">
<div class="sh-hd"><h3 id="px-t">Esporta PDF</h3><button class="x" id="pxx" aria-label="Chiudi"><svg viewBox="0 0 24 24" aria-hidden="true"><path d="M6 6l12 12M18 6L6 18" stroke="currentColor" stroke-width="2.2" stroke-linecap="round"/></svg></button></div>
<div class="lb">Periodo</div>
<div class="chips">${q.map(([id, t, a, b]) => `<button class="chip${PX.from === a && PX.to === b ? " on" : ""}" data-a="${a}" data-b="${b}">${t}</button>`).join("")}</div>
<div class="g2"><div><label for="px_a">Dal</label><input type="date" id="px_a" value="${PX.from}"></div><div><label for="px_b">Al</label><input type="date" id="px_b" value="${PX.to}"></div></div>
<p class="mu" id="px_i">${pdfInfo()}</p>
<div class="lb">Formato</div>
<div class="lays" role="radiogroup" aria-label="Formato del PDF">${PDFL.map(
    (l) => `<label class="lay${PX.lay === l.k ? " on" : ""}"><input type="radio" name="px_l" value="${l.k}"${PX.lay === l.k ? " checked" : ""}><span class="lpv lpv-${l.k}" aria-hidden="true"><i></i><i></i><i></i><i></i></span><span><b>${l.n}</b><em>${l.d}</em></span></label>`,
  ).join("")}</div>
<div class="lb">Cosa includere</div>
<label class="sw"><input type="checkbox" id="px_tr"${PX.tr ? " checked" : ""}><span>Allenamenti</span></label>
<label class="sw"><input type="checkbox" id="px_no"${PX.note ? " checked" : ""}><span>Peso e note</span></label>
<label class="sw"><input type="checkbox" id="px_vu"${PX.vuoti ? " checked" : ""}><span>Anche i giorni non compilati</span></label>
<label for="px_n">Nome sul documento <i>facoltativo</i></label><input id="px_n" value="${esc(S.p.nome || "")}" placeholder="es. Mario Rossi">
<button class="b" id="px_go">Crea PDF</button>
<div id="px_r" role="status"></div></div>`;
}
window.openPdf = () => {
  if (!PX.from) {
    PX.to = dk(new Date());
    PX.from = addD(PX.to, -6);
  }
  PX.blob = null;
  const o = $("#pdfs");
  o.innerHTML = pdfHtml();
  o.hidden = false;
  document.body.style.overflow = "hidden";
  const close = () => {
    o.hidden = true;
    document.body.style.overflow = "";
  };
  $("#pxx").onclick = close;
  o.onclick = (e) => {
    if (e.target === o) close();
  };
  const upd = () => {
    $("#px_i").innerHTML = pdfInfo();
    o.querySelectorAll(".chip").forEach((c) => c.classList.toggle("on", c.dataset.a === PX.from && c.dataset.b === PX.to));
    $("#px_r").innerHTML = "";
  };
  o.querySelectorAll(".chip").forEach(
    (c) =>
      (c.onclick = () => {
        PX.from = c.dataset.a;
        PX.to = c.dataset.b;
        $("#px_a").value = PX.from;
        $("#px_b").value = PX.to;
        upd();
      }),
  );
  $("#px_a").onchange = (e) => { PX.from = e.target.value; upd(); };
  $("#px_b").onchange = (e) => { PX.to = e.target.value; upd(); };
  o.querySelectorAll("input[name=px_l]").forEach(
    (r) =>
      (r.onchange = () => {
        PX.lay = r.value;
        o.querySelectorAll(".lay").forEach((l) => l.classList.toggle("on", l.contains(r)));
        $("#px_r").innerHTML = "";
      }),
  );
  [["px_tr", "tr"], ["px_no", "note"], ["px_vu", "vuoti"]].forEach(([id, k]) => ($("#" + id).onchange = (e) => { PX[k] = e.target.checked; $("#px_r").innerHTML = ""; }));
  $("#px_go").onclick = async () => {
    const D = rangeDays(PX.from, PX.to);
    if (!D.length) return ($("#px_r").innerHTML = '<p class="mu">Scegli un periodo valido.</p>');
    const nome = $("#px_n").value.trim();
    if (nome !== (S.p.nome || "")) { S.p.nome = nome; saveP(); }
    try {
      const doc = await makePdf(D, nome);
      PX.name = `diario-alimentare_${PX.from}_${PX.to}.pdf`;
      PX.blob = doc.output("blob");
      const pages = doc.getNumberOfPages();
      const canShare = navigator.canShare && navigator.canShare({ files: [new File([PX.blob], PX.name, { type: "application/pdf" })] });
      $("#px_r").innerHTML = `<div class="pxok"><b>PDF pronto</b><span>${PX.name} · ${pages} ${pages === 1 ? "pagina" : "pagine"}</span><div class="dbt"><button class="b" id="px_dl">Scarica</button>${canShare ? '<button class="b g" id="px_sh">Invia…</button>' : ""}<button class="b g" id="px_op">Apri</button></div></div>`;
      $("#px_dl").onclick = () => {
        const url = URL.createObjectURL(PX.blob), a = document.createElement("a");
        a.href = url;
        a.download = PX.name;
        document.body.appendChild(a);
        a.click();
        a.remove();
        setTimeout(() => URL.revokeObjectURL(url), 4000);
      };
      $("#px_op").onclick = () => window.open(URL.createObjectURL(PX.blob), "_blank");
      if (canShare) $("#px_sh").onclick = () => navigator.share({ files: [new File([PX.blob], PX.name, { type: "application/pdf" })], title: "Diario alimentare" }).catch(() => {});
    } catch (err) {
      $("#px_r").innerHTML = `<p class="mu">Non sono riuscito a creare il PDF (${esc(err.message)}).</p>`;
    }
  };
};

// testo compatibile con i font standard del PDF (alfabeto latino)
const pt = (s) =>
  String(s ?? "")
    .replace(/[’‘]/g, "'").replace(/[“”]/g, '"').replace(/[–—]/g, "-").replace(/…/g, "...").replace(/[′]/g, "'").replace(/→/g, "->").replace(/≈/g, "~").replace(/\s+/g, " ")
    .replace(/[^\x00-\xFF]/g, "").trim();
const hexRgb = (h) => {
  const m = String(h).trim().match(/^#?([0-9a-f]{6})$/i);
  return m ? [0, 2, 4].map((i) => parseInt(m[1].slice(i, i + 2), 16)) : [31, 42, 68];
};
const lum = ([r, g, b]) => (0.299 * r + 0.587 * g + 0.114 * b) / 255;
const dShort = (k) => GS[pd(k).getDay()].slice(0, 3) + " " + k.slice(8) + "/" + k.slice(5, 7);
const dLong = (k) => lbl(k) + " " + k.slice(0, 4);
// le figure della composizione corporea convertite in PNG per il PDF
const figPng = (src) =>
  new Promise((res) => {
    const im = new Image();
    im.onload = () => {
      const c = document.createElement("canvas");
      c.width = im.naturalWidth;
      c.height = im.naturalHeight;
      c.getContext("2d").drawImage(im, 0, 0);
      res({ d: c.toDataURL("image/png"), w: im.naturalWidth, h: im.naturalHeight });
    };
    im.onerror = () => res(null);
    im.src = src;
  });
async function makePdf(D0, nome) {
  const figs = {};
  if (PX.lay === "riepilogo") for (const k of Object.keys(FIG)) figs[k] = await figPng(FIG[k]);
  PX.kc = false; // le calorie restano solo nell'app, mai nel PDF
  const { jsPDF } = window.jspdf;
  const D = PX.vuoti ? D0 : D0.filter((k) => hasMeal(S.g[k]));
  const css = getComputedStyle(document.documentElement), AC = hexRgb(css.getPropertyValue("--ac")), INK = [31, 42, 68], MUT = [100, 106, 120], LINE = [215, 210, 200];
  const acTxt = lum(AC) > 0.6 ? INK : [255, 255, 255];
  const land = PX.lay === "tabella";
  const doc = new jsPDF({ orientation: land ? "landscape" : "portrait", unit: "mm", format: "a4" });
  const periodo = `dal ${pt(dLong(PX.from))} al ${pt(dLong(PX.to))}`;
  const done = new Set();
  const header = () => {
    const pg = doc.internal.getCurrentPageInfo().pageNumber;
    if (done.has(pg)) return;
    done.add(pg);
    const W = doc.internal.pageSize.getWidth();
    doc.setFillColor(...AC);
    doc.rect(0, 0, W, 3, "F");
    doc.setFont("helvetica", "bold");
    doc.setFontSize(13);
    doc.setTextColor(...INK);
    doc.text("Diario alimentare" + (nome ? " - " + pt(nome) : ""), 12, 12);
    doc.setFont("helvetica", "normal");
    doc.setFontSize(9);
    doc.setTextColor(...MUT);
    doc.text(periodo, W - 12, 12, { align: "right" });
    doc.setDrawColor(...LINE);
    doc.line(12, 15, W - 12, 15);
  };
  const footer = () => {
    const n = doc.getNumberOfPages();
    for (let i = 1; i <= n; i++) {
      doc.setPage(i);
      const W = doc.internal.pageSize.getWidth(), H = doc.internal.pageSize.getHeight();
      doc.setFontSize(8);
      doc.setTextColor(...MUT);
      doc.text(`Pagina ${i} di ${n}`, W - 12, H - 7, { align: "right" });
      doc.text("Creato il " + pt(dLong(dk(new Date()))) + (PX.kc ? " - calorie stimate dai pasti scritti, valori indicativi" : ""), 12, H - 7);
    }
  };
  const base = { theme: "grid", margin: { top: 20, left: 12, right: 12, bottom: 14 }, styles: { font: "helvetica", fontSize: 8.5, cellPadding: 1.8, textColor: INK, lineColor: LINE, lineWidth: 0.2, valign: "top", overflow: "linebreak" }, headStyles: { fillColor: AC, textColor: acTxt, fontStyle: "bold" }, didDrawPage: header };
  const meals = F.filter((f) => KM.includes(f[0]));
  const trOf = (d) => (d && d.allenamento ? pt(d.allenamento.replace(/,?\s*~?\d+(?:[.,]\d+)?\s*kcal\b/gi, "")) : "");
  // tabella: una riga per giorno
  const table = (startY) => {
    const head = ["Giorno", ...meals.map((f) => f[1])];
    if (PX.tr) head.push("Allenamento");
    if (PX.note) head.push("Peso");
    if (PX.kc) head.push("Kcal stim.");
    const body = [];
    D.forEach((k) => {
      const d = S.g[k] || {};
      if (!hasMeal(d)) {
        body.push([{ content: dShort(k), styles: { fontStyle: "bold" } }, { content: "non compilato", colSpan: head.length - 1, styles: { textColor: MUT, fontStyle: "italic" } }]);
        return;
      }
      const row = [{ content: dShort(k), styles: { fontStyle: "bold" } }, ...meals.map((f) => pt(d[f[0]]) || "-")];
      if (PX.tr) row.push(trOf(d) || "-");
      if (PX.note) row.push(d.peso ? pt(d.peso) + (/kg/i.test(d.peso) ? "" : " kg") : "");
      if (PX.kc) row.push({ content: fmt(dayK(k)), styles: { halign: "right" } });
      body.push(row);
      if (PX.note && d.nota) body.push([{ content: "", styles: { lineWidth: 0 } }, { content: "Note: " + pt(d.nota), colSpan: head.length - 1, styles: { fontStyle: "italic", textColor: MUT } }]);
    });
    const cs = { 0: { cellWidth: 19 } };
    if (PX.note) cs[head.indexOf("Peso")] = { cellWidth: 15 };
    if (PX.kc) cs[head.indexOf("Kcal stim.")] = { cellWidth: 16 };
    doc.autoTable({ ...base, startY, head: [head], body, columnStyles: cs, styles: { ...base.styles, fontSize: land ? 8 : 7.2 }, rowPageBreak: "avoid" });
  };
  if (PX.lay === "tabella") table(20);
  else if (PX.lay === "schede") {
    let y = 20;
    D.forEach((k) => {
      const d = S.g[k] || {}, filled = hasMeal(d);
      const right = [PX.note && d.peso ? "Peso " + pt(d.peso) + (/kg/i.test(d.peso) ? "" : " kg") : "", PX.kc && filled ? "~" + fmt(dayK(k)) + " kcal" : ""].filter(Boolean).join("   ");
      const body = [];
      if (!filled) body.push([{ content: "-", styles: { textColor: MUT } }, { content: "Giorno non compilato", styles: { textColor: MUT, fontStyle: "italic" } }]);
      else {
        meals.forEach((f) => body.push([{ content: f[1], styles: { fontStyle: "bold", textColor: MUT } }, (pt(d[f[0]]) || "-") + (PX.kc && d[f[0]] ? `   (~${fmt(kcal(d[f[0]]).t)} kcal)` : "")]));
        if (PX.tr && d.allenamento) body.push([{ content: "Allenamento", styles: { fontStyle: "bold", textColor: MUT } }, trOf(d)]);
        if (PX.note && d.nota) body.push([{ content: "Note", styles: { fontStyle: "bold", textColor: MUT } }, { content: pt(d.nota), styles: { fontStyle: "italic" } }]);
      }
      if (y > doc.internal.pageSize.getHeight() - 45) { doc.addPage(); y = 20; }
      doc.autoTable({
        ...base, theme: "plain", startY: y, rowPageBreak: "avoid",
        head: [[{ content: pt(dLong(k)).replace(/^./, (c) => c.toUpperCase()) + (right ? "      " + right : ""), colSpan: 2, styles: { halign: "left" } }]],
        body, columnStyles: { 0: { cellWidth: 28 } }, styles: { ...base.styles, fontSize: 9.5, cellPadding: 1.6 }, bodyStyles: { lineWidth: { bottom: 0.15 }, lineColor: LINE },
      });
      y = doc.lastAutoTable.finalY + 5;
    });
  } else {
    // riepilogo: numeri in alto, poi i tre grafici (allenamenti, composizione corporea, peso)
    const W = doc.internal.pageSize.getWidth(), X0 = 12, CW = W - 24;
    let y = 24;
    const filled = D0.filter((k) => hasMeal(S.g[k])), Wt = D0.filter((k) => num((S.g[k] || {}).peso)).map((k) => [k, num(S.g[k].peso)]);
    const R = D0.map(dayTr), sess = R.filter((r) => r.mn).length, sum = (f) => R.reduce((a, r) => a + r[f], 0), nW = D0.length / 7;
    const H2 = hist().filter((x) => !x.d || x.d <= PX.to), last = H2.length ? H2[H2.length - 1] : null, prev = H2.length > 1 ? H2[H2.length - 2] : null;
    const AC2 = hexRgb(css.getPropertyValue("--ac2"));
    doc.setFont("helvetica", "bold"); doc.setFontSize(16); doc.setTextColor(...INK);
    doc.text("Riepilogo del periodo", X0, y);
    doc.setFont("helvetica", "normal"); doc.setFontSize(10); doc.setTextColor(...MUT);
    doc.text(`${D0.length} giorni, ${filled.length} compilati`, X0, y + 6);
    y += 10;
    const rows = [["Giorni compilati", `${filled.length} su ${D0.length}`]];
    if (Wt.length) rows.push(["Peso", Wt.length > 1 ? `${fmtD(Wt[0][1])} kg  ->  ${fmtD(Wt[Wt.length - 1][1])} kg   (${Wt[Wt.length - 1][1] - Wt[0][1] > 0 ? "+" : ""}${fmtD(Wt[Wt.length - 1][1] - Wt[0][1])} kg)` : `${fmtD(Wt[0][1])} kg`]);
    if (PX.tr && !sess) rows.push(["Allenamenti", "nessuno segnato nel periodo"]);
    if (PX.tr && sess) {
      rows.push(["Allenamenti", `${sess} sedute (circa ${fmtD(sess / nW)} a settimana)${sum("km") ? ` · ${fmtD(sum("km"))} km` : ""}`]);
      rows.push(["Cardio / muscolare", `${fmt(sum("c"))}' / ${fmt(sum("m"))}'  (a settimana circa ${fmt(sum("c") / nW)}' / ${fmt(sum("m") / nW)}')`]);
    }
    doc.autoTable({ ...base, theme: "plain", startY: y, body: rows, columnStyles: { 0: { cellWidth: 44, fontStyle: "bold", textColor: MUT } }, styles: { ...base.styles, fontSize: 9.5, cellPadding: 1.6 }, bodyStyles: { lineWidth: { bottom: 0.15 }, lineColor: LINE } });
    y = doc.lastAutoTable.finalY + 9;
    const title = (t, yy, right) => {
      doc.setFont("helvetica", "bold"); doc.setFontSize(10.5); doc.setTextColor(...INK);
      doc.text(t, X0, yy);
      if (right) { doc.setFont("helvetica", "normal"); doc.setFontSize(8); doc.setTextColor(...MUT); doc.text(right, X0 + CW, yy, { align: "right" }); }
    };
    const empty = (t, yy, h) => {
      doc.setDrawColor(...LINE); doc.setLineWidth(0.2); doc.setLineDashPattern([1, 1], 0); doc.rect(X0, yy, CW, h); doc.setLineDashPattern([], 0);
      doc.setFont("helvetica", "italic"); doc.setFontSize(9); doc.setTextColor(...MUT); doc.text(t, X0 + CW / 2, yy + h / 2 + 1, { align: "center" });
    };
    const axisDates = (yy, x0, w) => {
      doc.setFont("helvetica", "normal"); doc.setFontSize(7.5); doc.setTextColor(...MUT);
      doc.text(dShort(D0[0]), x0, yy); doc.text(dShort(D0[Math.floor((D0.length - 1) / 2)]), x0 + w / 2, yy, { align: "center" }); doc.text(dShort(D0[D0.length - 1]), x0 + w, yy, { align: "right" });
    };
    // griglia semitrasparente: linee orizzontali con il valore, verticali sui lunedì (o su ogni giorno se il periodo è breve)
    const nice = (range, n = 4) => {
      const raw = range / n, p10 = Math.pow(10, Math.floor(Math.log10(raw)));
      return [1, 2, 2.5, 5, 10].map((m) => m * p10).find((s) => s >= raw) || 10 * p10;
    };
    const grid = (x0, w, yTop, h, lo, hi, step, Yf, Xf, lab) => {
      doc.setGState(new doc.GState({ opacity: 0.3 }));
      doc.setDrawColor(175, 182, 195);
      doc.setLineWidth(0.12);
      for (let v = Math.ceil(lo / step) * step; v <= hi + 1e-9; v += step) doc.line(x0, Yf(v), x0 + w, Yf(v));
      const daily = D0.length <= 16;
      D0.forEach((k, i) => { if (daily || pd(k).getDay() === 1) doc.line(Xf(i), yTop, Xf(i), yTop + h); });
      doc.setGState(new doc.GState({ opacity: 1 }));
      doc.setFont("helvetica", "normal"); doc.setFontSize(7); doc.setTextColor(...MUT);
      for (let v = Math.ceil(lo / step) * step; v <= hi + 1e-9; v += step) doc.text(lab(v), x0 - 1.5, Yf(v) + 1, { align: "right" });
      let lastX = -99;
      D0.forEach((k, i) => {
        if (!(daily || pd(k).getDay() === 1)) return;
        const x = Xf(i);
        if (x - lastX < 11) return;
        doc.text(daily ? dShort(k).slice(4, 6) : k.slice(8) + "/" + k.slice(5, 7), x, yTop + h + 3.8, { align: "center" });
        lastX = x;
      });
      if (!daily) doc.text("lunedì", x0 + w, yTop + h + 3.8, { align: "right" });
    };
    // 1) allenamenti per giorno
    if (PX.tr) {
      const h = 34;
      title("Allenamenti (minuti al giorno)", y, "");
      if (sess) {
        const lg = [[AC, `cardio ${fmt(sum("c"))}'`], [AC2, `muscolare ${fmt(sum("m"))}'`]];
        doc.setFont("helvetica", "normal"); doc.setFontSize(8);
        let lx = X0 + CW;
        lg.slice().reverse().forEach(([col, t]) => {
          lx -= doc.getTextWidth(t);
          doc.setTextColor(...MUT); doc.text(t, lx, y);
          lx -= 4.2; doc.setFillColor(...col); doc.rect(lx, y - 2.6, 2.8, 2.8, "F");
          lx -= 6;
        });
      }
      y += 4;
      if (!sess) empty("Nessun allenamento segnato nel periodo", y, h);
      else {
        const top = Math.max(30, ...R.map((r) => r.mn)), st = nice(top, 5), mx = Math.ceil(top / st) * st, x0 = X0 + 9, w = CW - 9, bw = w / D0.length, Y = (v) => y + h - (v / mx) * h;
        grid(x0, w, y, h, 0, mx, st, Y, (i) => x0 + i * bw + bw / 2, (v) => v + "'");
        R.forEach((r, i) => {
          const x = x0 + i * bw + bw * 0.15, wb = bw * 0.7, hc = (r.c / mx) * h, hm = (r.m / mx) * h;
          if (hc) { doc.setFillColor(...AC); doc.rect(x, y + h - hc, wb, hc, "F"); }
          if (hm) { doc.setFillColor(...AC2); doc.rect(x, y + h - hc - hm, wb, hm, "F"); }
        });
      }
      y += h + 12;
    }
    // 2) composizione corporea, con la figura della fascia
    title("Composizione corporea", y, last ? (last.d ? "misurazione del " + dShort(last.d) + " " + last.d.slice(0, 4) : "dati del profilo, misurazione senza data") : "");
    y += 4;
    if (!last) { empty("Nessuna misurazione inserita", y, 30); y += 42; }
    else {
      const c = comp(last), b = bmiOf(c.p), cat = BMIC[bmiCat(b)], img = figs[cat.k], fh = 52;
      let tx = X0;
      if (img) { const fw = (fh * img.w) / img.h; doc.addImage(img.d, "PNG", X0 + 4, y, fw, fh); tx = X0 + fw + 14; }
      const CAT = hexRgb(cat.c), cn = pt(catName(b));
      doc.setFont("helvetica", "bold"); doc.setFontSize(9);
      const tw = doc.getTextWidth(cn) + 8;
      doc.setFillColor(...CAT); doc.roundedRect(tx, y + 1, tw, 6, 2, 2, "F");
      doc.setTextColor(...(lum(CAT) > 0.6 ? INK : [255, 255, 255]));
      doc.text(cn, tx + 4, y + 5.2);
      doc.setFont("helvetica", "normal"); doc.setTextColor(...MUT);
      doc.text(`BMI ${fmtD(b)}${num(S.p.altezza) ? "" : " (con altezza 175 cm)"}   ·   peso ${fmtD(c.p)} kg`, tx + tw + 4, y + 5.2);
      const bw = X0 + CW - tx, by = y + 13, parts = [[c.fat, "--ft", "Massa grassa", `${fmtD(c.fat)} kg  (${fmtD(c.gf)}%)`, prev && c.fat - comp(prev).fat], [c.mus, "--ms", "Massa muscolare", `${fmtD(c.mus)} kg  (${fmtD((c.mus / c.p) * 100)}%)`, prev && c.mus - comp(prev).mus], [c.bone, "--bn", "Ossa e resto", `${fmtD(c.bone)} kg`, null]];
      let bx = tx;
      parts.forEach(([v, cv]) => { const ww = (v / c.p) * bw; doc.setFillColor(...hexRgb(css.getPropertyValue(cv))); doc.rect(bx, by, ww, 6, "F"); bx += ww; });
      doc.setDrawColor(...LINE); doc.setLineWidth(0.2); doc.rect(tx, by, bw, 6);
      parts.forEach(([v, cv, n, val, dd], i) => {
        const yy = by + 13 + i * 8;
        doc.setFillColor(...hexRgb(css.getPropertyValue(cv))); doc.setDrawColor(...LINE); doc.rect(tx, yy - 3, 3.2, 3.2, "FD");
        doc.setFont("helvetica", "bold"); doc.setFontSize(9); doc.setTextColor(...INK); doc.text(n, tx + 6, yy);
        doc.setFont("helvetica", "normal"); doc.text(val, tx + 46, yy);
        if (dd != null && Math.abs(dd) >= 0.05) { doc.setTextColor(...MUT); doc.text(`${dd > 0 ? "+" : ""}${fmtD(dd)} kg dalla misurazione precedente`, tx + 88, yy); }
      });
      const xe = [["scheletrico", "Muscolo scheletrico", "%"], ["acqua", "Idratazione", "%"], ["viscerale", "Grasso addominale", ""], ["eta", "Eta metabolica", ""]].filter(([k]) => num(last[k]) != null).map(([k, n, u]) => `${n} ${fmtD(num(last[k]))}${u}`);
      if (xe.length) { doc.setFont("helvetica", "normal"); doc.setFontSize(8.5); doc.setTextColor(...MUT); doc.text(xe.join("   ·   "), tx, by + 13 + 3 * 8 + 1); }
      y += fh + 10;
    }
    // 3) peso nel periodo
    title("Peso nel periodo (kg)", y, Wt.length ? `${Wt.length} ${Wt.length === 1 ? "misurazione" : "misurazioni"}` : "");
    y += 4;
    const hp = 34;
    if (!Wt.length) empty("Nessun peso segnato nel periodo", y, hp);
    else {
      const v = Wt.map((a) => a[1]), ob = num(S.p.obj), lo = Math.min(...v), hi = Math.max(...v), st = nice(Math.max(1, hi - lo + 1), 4), mn = Math.floor((lo - 0.3) / st) * st, mx = Math.ceil((hi + 0.3) / st) * st;
      const x0 = X0 + 11, w = CW - 11, Xi = (i) => x0 + (i / Math.max(1, D0.length - 1)) * w, X = (k) => Xi(D0.indexOf(k)), Y = (val) => y + hp - ((val - mn) / (mx - mn)) * hp;
      grid(x0, w, y, hp, mn, mx, st, Y, Xi, (val) => fmtD(val));
      if (ob && ob >= mn && ob <= mx) { doc.setDrawColor(...hexRgb(css.getPropertyValue("--tg"))); doc.setLineDashPattern([1.5, 1.2], 0); doc.line(x0, Y(ob), x0 + w, Y(ob)); doc.setLineDashPattern([], 0); doc.text("obiettivo " + fmtD(ob), x0 + w, Y(ob) - 1.2, { align: "right" }); }
      doc.setDrawColor(...AC); doc.setLineWidth(0.7);
      for (let i = 1; i < Wt.length; i++) doc.line(X(Wt[i - 1][0]), Y(Wt[i - 1][1]), X(Wt[i][0]), Y(Wt[i][1]));
      doc.setFillColor(...AC);
      Wt.forEach(([k, val]) => doc.circle(X(k), Y(val), 0.9, "F"));
      doc.setFontSize(7.5); doc.setTextColor(...INK);
      doc.text(fmtD(Wt[0][1]), X(Wt[0][0]), Y(Wt[0][1]) - 2, { align: "center" });
      if (Wt.length > 1) doc.text(fmtD(Wt[Wt.length - 1][1]), X(Wt[Wt.length - 1][0]), Y(Wt[Wt.length - 1][1]) - 2, { align: "center" });
    }
    doc.addPage("a4", "landscape");
    table(20);
  }
  footer();
  return doc;
}

/* ---------- piano ---------- */

/* ---------- piano ---------- */

/* ---------- piano ---------- */

/* ---------- piano ---------- */
function piano() {
  const P = EX.piano;
  if (!P || !(P.pagine?.length || P.sezioni?.length))
    return `<div class="c"><h3>Il mio piano alimentare</h3><div class="mu">Nessun piano caricato. Puoi importarlo dal file di backup: tocca l’ingranaggio in alto e poi “Importa dati”.</div><button class="b" onclick="openSet()">Apri impostazioni</button></div>`;
  return (
    `<div class="c ph"><h3>Il mio piano alimentare</h3>${P.info ? `<div class="mu">${esc(P.info)}</div>` : ""}</div>` +
    (P.pagine?.length ? `<div class="c"><details><summary>Il piano completo <span class="mu">tocca una pagina per ingrandirla</span></summary>${P.pagine.map((s, i) => (/^data:image\//.test(s) ? `<div class="pg"><img src="${s}" alt="Pagina ${i + 1} del piano alimentare" onclick="this.classList.toggle('z')"></div>` : "")).join("")}</details></div>` : "") +
    (P.sezioni || []).map((x) => `<div class="c"><details><summary>${esc(x[0])}</summary><div class="sm2">${clean(x[1])}</div></details></div>`).join("")
  );
}
// il testo del piano può contenere solo una formattazione semplice
function clean(html) {
  const t = document.createElement("template");
  t.innerHTML = String(html || "");
  t.content.querySelectorAll("*").forEach((el) => {
    if (!["UL", "OL", "LI", "B", "I", "STRONG", "EM", "BR", "P", "DIV", "SPAN"].includes(el.tagName)) el.replaceWith(document.createTextNode(el.textContent));
    else [...el.attributes].forEach((at) => (at.name !== "class" ? el.removeAttribute(at.name) : 0));
  });
  return t.innerHTML;
}

init();
