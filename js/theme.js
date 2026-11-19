
/* ===== Temi e palette ===== */
const MK = ["colazione", "spuntino", "pranzo", "merenda", "cena", "allenamento", "peso", "nota"];
const LIGHT_BODY = { ms: "#E0533F", mso: "#A3291D", md: "#9E2A1E", ft: "#FFD54A", fte: "#E39A12", bn: "#F4EFE3", bno: "#8C806B", bnd: "#5B4F3E", gd: "#15803D", bad: "#B91C1C" };
const DARK_BODY = { ms: "#E0533F", mso: "#A3291D", md: "#9E2A1E", ft: "#FFD54A", fte: "#E39A12", bn: "#F4EFE3", bno: "#8C806B", bnd: "#5B4F3E", gd: "#4ADE80", bad: "#F87171" };
const THEMES = {
  quaderno: {
    n: "Quaderno", d: "Carta a righe e scrittura a mano",
    base: { f: "Inter,system-ui,sans-serif", fh: "Fraunces,Georgia,serif", fn: "Fraunces,Georgia,serif", fl: "Caveat,cursive", r: "4px", rs: "4px",
      m: ["#B97A06", "#3F7D5A", "#D9472B", "#B8336A", "#2B59C3", "#2F6B4F", "#6B4FA0", "#7A7A7A"],
      p: ["#F8E3A8", "#CFE5D6", "#F6C9BD", "#F2C6D8", "#C9D6F2", "#CFE5D6", "#DDD2EE", "#E6E6E6"], ...LIGHT_BODY },
    pal: {
      pomodoro: { n: "Pomodoro", v: { bg: "#FBF7EE", cd: "#FFFDF8", tx: "#1F2A44", mu: "#5E6372", bd: "#E3D9C4", ac: "#D9472B", ac2: "#2F6B4F", btn: "#1F2A44", on: "#FBF7EE", tr: "#EFE7D6", hb: "#FBF7EE", ht: "#1F2A44", tg: "#D9472B" } },
      inchiostro: { n: "Inchiostro blu", v: { bg: "#F6F4EF", cd: "#FFFFFF", tx: "#1B2A4A", mu: "#586178", bd: "#DCDDE3", ac: "#2B59C3", ac2: "#C2410C", btn: "#1B2A4A", on: "#FFFFFF", tr: "#E5E8F1", hb: "#F6F4EF", ht: "#1B2A4A", tg: "#C2410C" } },
      salvia: { n: "Salvia", v: { bg: "#F3F5EE", cd: "#FCFDF9", tx: "#24362B", mu: "#5B6B60", bd: "#D6DECF", ac: "#3F7D5A", ac2: "#B4532A", btn: "#24362B", on: "#FCFDF9", tr: "#E2E9DC", hb: "#F3F5EE", ht: "#24362B", tg: "#B4532A" } },
      lavagna: { n: "Lavagna", dark: 1, v: { bg: "#23272A", cd: "#2C3135", tx: "#EDEBE4", mu: "#A9ADA8", bd: "#424A50", ac: "#F2B880", ac2: "#9AD1B0", btn: "#EDEBE4", on: "#23272A", tr: "#3A4146", hb: "#23272A", ht: "#EDEBE4", tg: "#F2B880",
        m: ["#F2CC6B", "#9AD1B0", "#F2A07B", "#E99AC0", "#9DB8F0", "#9AD1B0", "#C4B0EB", "#B5B5B5"], ...DARK_BODY } },
    },
  },
  pulito: {
    n: "Pulito", d: "Essenziale, stile app del telefono",
    base: { f: "Inter,system-ui,sans-serif", fh: "Inter,system-ui,sans-serif", fn: "Inter,system-ui,sans-serif", fl: "Inter,system-ui,sans-serif", r: "22px", rs: "14px",
      m: ["#E8A317", "#D6589B", "#F06B2D", "#8B5CF6", "#3466C2", "#0EA5A4", "#7C3AED", "#9AA1AB"],
      p: ["#FDF1D6", "#FBE3EF", "#FDE6DA", "#EDE6FD", "#E1E9F7", "#D9F2F1", "#ECE4FB", "#EEF0F3"], ...LIGHT_BODY },
    pal: {
      verde: { n: "Verde", v: { bg: "#F4F5F7", cd: "#FFFFFF", tx: "#111418", mu: "#5F6670", bd: "#ECEEF2", ac: "#16804A", ac2: "#E8A317", btn: "#16804A", on: "#FFFFFF", tr: "#E7F3EC", hb: "#F4F5F7", ht: "#111418", tg: "#8A919B", seg: "#E6E8EC" } },
      blu: { n: "Blu", v: { bg: "#F4F6FA", cd: "#FFFFFF", tx: "#0F172A", mu: "#5B6576", bd: "#E8ECF3", ac: "#2563EB", ac2: "#F59E0B", btn: "#2563EB", on: "#FFFFFF", tr: "#E3ECFD", hb: "#F4F6FA", ht: "#0F172A", tg: "#8A93A3", seg: "#E4E8EF" } },
      viola: { n: "Viola", v: { bg: "#F6F5FA", cd: "#FFFFFF", tx: "#17132B", mu: "#615C73", bd: "#ECEAF3", ac: "#7C3AED", ac2: "#F472B6", btn: "#7C3AED", on: "#FFFFFF", tr: "#EFE7FD", hb: "#F6F5FA", ht: "#17132B", tg: "#8E899E", seg: "#E7E4F0" } },
      corallo: { n: "Corallo", v: { bg: "#FAF5F3", cd: "#FFFFFF", tx: "#231815", mu: "#6B5F5B", bd: "#F1E7E3", ac: "#D9482B", ac2: "#0E9F8E", btn: "#D9482B", on: "#FFFFFF", tr: "#FCE4DD", hb: "#FAF5F3", ht: "#231815", tg: "#9A8E8A", seg: "#EFE6E2" } },
      notte: { n: "Notte", dark: 1, v: { bg: "#000000", cd: "#1C1C1E", tx: "#F5F5F7", mu: "#A1A1A6", bd: "#2C2C2E", ac: "#30D158", ac2: "#FFD60A", btn: "#30D158", on: "#000000", tr: "#173D22", hb: "#000000", ht: "#F5F5F7", tg: "#8E8E93", seg: "#1C1C1E",
        m: ["#FFD60A", "#FF6FAE", "#FF9F0A", "#BF5AF2", "#64A8FF", "#40E0D0", "#BF5AF2", "#8E8E93"], p: ["#3A3212", "#3A1F2C", "#3D2A12", "#2F1F3D", "#1B2A40", "#173634", "#2F1F3D", "#2C2C2E"], ...DARK_BODY } },
    },
  },
  notturno: {
    n: "Notturno sportivo", d: "Scuro, numeri grandi, da allenamento",
    base: { f: "'Space Grotesk',system-ui,sans-serif", fh: "'Space Grotesk',system-ui,sans-serif", fn: "'JetBrains Mono',ui-monospace,monospace", fl: "'Space Grotesk',system-ui,sans-serif", r: "18px", rs: "14px",
      m: ["#FBBF24", "#F472B6", "#FF8A3D", "#A78BFA", "#22D3EE", "#C6F432", "#A78BFA", "#8A8F80"],
      p: ["#3A3214", "#3A1F30", "#3D2614", "#2C2440", "#123A40", "#2F3A12", "#2C2440", "#26291F"], ...DARK_BODY },
    pal: {
      lime: { n: "Lime", dark: 1, v: { bg: "#0D0E0B", cd: "#181A14", tx: "#F2F4EC", mu: "#9EA393", bd: "#2A2D23", ac: "#C6F432", ac2: "#FF8A3D", btn: "#C6F432", on: "#0D0E0B", tr: "#2A2D23", hb: "#0D0E0B", ht: "#F2F4EC", tg: "#FF8A3D" } },
      ciano: { n: "Ciano e rosa", dark: 1, v: { bg: "#0A0E14", cd: "#121A24", tx: "#EEF3F8", mu: "#93A1B3", bd: "#1F2A38", ac: "#22D3EE", ac2: "#F472B6", btn: "#22D3EE", on: "#0A0E14", tr: "#1A2A38", hb: "#0A0E14", ht: "#EEF3F8", tg: "#F472B6" } },
      ambra: { n: "Ambra", dark: 1, v: { bg: "#100D08", cd: "#1B1610", tx: "#F6F0E6", mu: "#A89F8E", bd: "#2D251A", ac: "#FBBF24", ac2: "#F87171", btn: "#FBBF24", on: "#100D08", tr: "#2D251A", hb: "#100D08", ht: "#F6F0E6", tg: "#F87171" } },
      rosso: { n: "Rosso corsa", dark: 1, v: { bg: "#0E0B0B", cd: "#1A1414", tx: "#F6EEEE", mu: "#A69494", bd: "#2E2222", ac: "#FF5A4E", ac2: "#FFD166", btn: "#FF5A4E", on: "#0E0B0B", tr: "#2E2222", hb: "#0E0B0B", ht: "#F6EEEE", tg: "#FFD166" } },
      giorno: { n: "Giorno", v: { bg: "#F1F2EC", cd: "#FFFFFF", tx: "#0D0E0B", mu: "#575C4F", bd: "#DCDFD3", ac: "#4D7C0F", ac2: "#C2410C", btn: "#0D0E0B", on: "#F1F2EC", tr: "#E2E6D6", hb: "#F1F2EC", ht: "#0D0E0B", tg: "#C2410C",
        m: ["#B7791F", "#BE3D7E", "#C2410C", "#6D4BC9", "#0E7490", "#4D7C0F", "#6D4BC9", "#7A7F70"], p: ["#F7E7BF", "#F6D5E6", "#F8DACA", "#E3DAF7", "#CFE8EE", "#E1EDCB", "#E3DAF7", "#E9EBE3"], ...LIGHT_BODY } },
    },
  },
  pop: {
    n: "Pop", d: "Bordi neri, colori pastello, allegro",
    base: { f: "'Bricolage Grotesque',system-ui,sans-serif", fh: "'Bricolage Grotesque',system-ui,sans-serif", fn: "'Bricolage Grotesque',system-ui,sans-serif", fl: "'Bricolage Grotesque',system-ui,sans-serif", r: "18px", rs: "12px",
      m: ["#E0A800", "#E0607E", "#3D8FD6", "#F0782E", "#8B6FE0", "#2FA36B", "#B57EDC", "#8A8A8A"], ...LIGHT_BODY },
    pal: {
      classico: { n: "Classico", v: { bg: "#FFF1D6", cd: "#FFFFFF", tx: "#1B1B1B", mu: "#4A4A4A", bd: "#1B1B1B", ink: "#1B1B1B", ac: "#7FD3A8", ac2: "#FFD84D", btn: "#FFFFFF", on: "#1B1B1B", tr: "#FFFFFF", hb: "#FFF1D6", ht: "#1B1B1B", tg: "#E0436B",
        p: ["#FFD84D", "#FFB3C7", "#9CD3FF", "#FFB680", "#C9B6FF", "#7FD3A8", "#E0C3FC", "#EDEDED"] } },
      caramella: { n: "Caramella", v: { bg: "#FFE6EF", cd: "#FFFFFF", tx: "#1B1B1B", mu: "#4A4A4A", bd: "#1B1B1B", ink: "#1B1B1B", ac: "#FF9EC4", ac2: "#A0E7E5", btn: "#FFFFFF", on: "#1B1B1B", tr: "#FFFFFF", hb: "#FFE6EF", ht: "#1B1B1B", tg: "#7B3FE4",
        p: ["#FFE08A", "#FFC6DD", "#A0E7E5", "#FFC9A8", "#D7C4FF", "#B4F0C8", "#F3C4FB", "#EDEDED"] } },
      tropicale: { n: "Tropicale", v: { bg: "#E3FBF1", cd: "#FFFFFF", tx: "#1B1B1B", mu: "#4A4A4A", bd: "#1B1B1B", ink: "#1B1B1B", ac: "#FFB347", ac2: "#4DD4AC", btn: "#FFFFFF", on: "#1B1B1B", tr: "#FFFFFF", hb: "#E3FBF1", ht: "#1B1B1B", tg: "#E0436B",
        p: ["#FFE066", "#FF9F9F", "#7BDFF2", "#FFC48C", "#B5A8FF", "#9EF0C6", "#F2B5F5", "#EDEDED"] } },
      notte: { n: "Pop notte", dark: 1, v: { bg: "#17171A", cd: "#26262B", tx: "#F5F5F5", mu: "#C9C9CF", bd: "#F5F5F5", ink: "#F5F5F5", ac: "#7FD3A8", ac2: "#FFD84D", btn: "#26262B", on: "#F5F5F5", tr: "#3A3A40", hb: "#17171A", ht: "#F5F5F5", tg: "#FF7A9A",
        p: ["#FFD84D", "#FFB3C7", "#9CD3FF", "#FFB680", "#C9B6FF", "#7FD3A8", "#E0C3FC", "#DADADA"], m: ["#FFD84D", "#FFB3C7", "#9CD3FF", "#FFB680", "#C9B6FF", "#7FD3A8", "#E0C3FC", "#AAAAAA"], ...DARK_BODY } },
    },
  },
  mediterraneo: {
    n: "Mediterraneo", d: "Terracotta, oliva e crema, caldo ed elegante",
    base: { f: "'Work Sans',system-ui,sans-serif", fh: "'DM Serif Display',Georgia,serif", fn: "'DM Serif Display',Georgia,serif", fl: "'Work Sans',system-ui,sans-serif", r: "20px", rs: "14px",
      m: ["#D2A03A", "#C97B5C", "#8A9A4E", "#B5532F", "#4F7A93", "#5E6B3A", "#8A6BB0", "#8C8070"],
      p: ["#F2D28B", "#EBB9A4", "#C5CC9E", "#E8C3B0", "#B9CCD6", "#C5CC9E", "#D7C6E6", "#E2D8C8"], ...LIGHT_BODY },
    pal: {
      terracotta: { n: "Terracotta", v: { bg: "#F4EBDD", cd: "#FBF4E8", tx: "#2B2620", mu: "#6E5F50", bd: "#E6D6BE", ac: "#A6472A", ac2: "#5E6B3A", btn: "#A6472A", on: "#FBF4E8", tr: "#EADCC6", hb: "#A6472A", ht: "#FBF4E8", tg: "#A6472A" } },
      amalfi: { n: "Amalfi", v: { bg: "#FBF6E3", cd: "#FFFDF5", tx: "#1D2B40", mu: "#5B6475", bd: "#EBE2C3", ac: "#1F4E8C", ac2: "#8F6B00", btn: "#1F4E8C", on: "#FFFDF5", tr: "#EFE6C8", hb: "#1F4E8C", ht: "#FFFDF5", tg: "#D1495B",
        p: ["#F5DC6A", "#F3C3B5", "#CFE0A8", "#F7CFA0", "#B8CCE8", "#CFE0A8", "#D9CCEA", "#E6E0CC"] } },
      mare: { n: "Mare", v: { bg: "#EAF2F1", cd: "#F9FCFB", tx: "#1E2A2E", mu: "#546468", bd: "#D0E0DD", ac: "#1F6F8B", ac2: "#C9733F", btn: "#1F6F8B", on: "#F9FCFB", tr: "#D8E7E4", hb: "#1F6F8B", ht: "#F9FCFB", tg: "#C9733F",
        p: ["#F1D79A", "#F0C2AE", "#BFDCC8", "#F2C9A6", "#A9D2DE", "#BFDCC8", "#D3CBE8", "#DCE6E4"] } },
      provenza: { n: "Provenza", v: { bg: "#F1EDF3", cd: "#FBF9FC", tx: "#2A2530", mu: "#645C6E", bd: "#E0D8E6", ac: "#6B5B95", ac2: "#6F7F3A", btn: "#6B5B95", on: "#FBF9FC", tr: "#E6DFEB", hb: "#6B5B95", ht: "#FBF9FC", tg: "#B5532F",
        p: ["#EFD9A0", "#EBC1C9", "#CBD3A8", "#EFCDB6", "#C2CBE4", "#CBD3A8", "#D8C8EC", "#E3DDE8"] } },
      sera: { n: "Sera", dark: 1, v: { bg: "#1E1914", cd: "#2A231C", tx: "#F3E9DA", mu: "#BFAE98", bd: "#3E342A", ac: "#D9774F", ac2: "#A3B06E", btn: "#D9774F", on: "#1E1914", tr: "#3E342A", hb: "#2A231C", ht: "#F3E9DA", tg: "#E9B85C",
        m: ["#E9B85C", "#E0977A", "#A3B06E", "#D9774F", "#7FA6BD", "#A3B06E", "#B79BD6", "#9C8E7E"], p: ["#4A3B1E", "#4A2E24", "#353B22", "#4A2A1E", "#22323B", "#353B22", "#342A40", "#3A3128"], ...DARK_BODY } },
    },
  },
};
let TH = { t: "quaderno", p: "pomodoro", foto: false };
try { Object.assign(TH, JSON.parse(localStorage.getItem("dA_tema")) || {}); } catch (e) {}
function applyTheme() {
  if (!THEMES[TH.t]) TH.t = "quaderno";
  const T = THEMES[TH.t];
  if (!T.pal[TH.p]) TH.p = Object.keys(T.pal)[0];
  const P = T.pal[TH.p], v = { ...T.base, ...P.v }, r = document.documentElement;
  r.dataset.skin = TH.t;
  r.dataset.pal = TH.p;
  r.toggleAttribute("data-dark", !!P.dark);
  r.classList.toggle("foto", !!TH.foto && !!window.__hasBg);
  for (const [k, x] of Object.entries(v)) {
    if (k === "m" || k === "p") x.forEach((c, i) => r.style.setProperty(`--${k}-${MK[i]}`, c));
    else r.style.setProperty("--" + k, x);
  }
  const mt = document.querySelector('meta[name="theme-color"]');
  if (mt) mt.content = v.hb;
}
applyTheme();

