// Instagram carousel builder: carousel.json -> HTML slides -> PNG (headless Chrome), QA report, post.md.
// usage (from anywhere):  node templates/carousel/build.mjs <storyDir> [--hd] [--only 3,5] [--no-shot]
//   --hd       export 1440x1800 (same 4:5, sharper text) instead of 1080x1350
//   --only     re-render only these slide numbers (1-based)
//   --no-shot  write HTML + QA only (fast layout iteration)
// Env: CHROME=path/to/chrome.exe
import fs from "node:fs"; import path from "node:path"; import os from "node:os";
import { spawnSync } from "node:child_process"; import { pathToFileURL, fileURLToPath } from "node:url";

const TPL = path.dirname(fileURLToPath(import.meta.url));
const REPO = path.resolve(TPL, "../..");
const args = process.argv.slice(2);
const STORY = path.resolve(args.find((a) => !a.startsWith("--") && !/^\d+(,\d+)*$/.test(a)) || ".");
const HD = args.includes("--hd"), NOSHOT = args.includes("--no-shot");
const onlyIx = args.indexOf("--only"); const ONLY = onlyIx >= 0 ? args[onlyIx + 1].split(",").map(Number) : null;
const CHROME = process.env.CHROME || ["C:/Program Files/Google/Chrome/Application/chrome.exe", "C:/Program Files (x86)/Google/Chrome/Application/chrome.exe", "/usr/bin/google-chrome", "/Applications/Google Chrome.app/Contents/MacOS/Google Chrome"].find((p) => fs.existsSync(p));
const C = JSON.parse(fs.readFileSync(path.join(STORY, "carousel.json"), "utf8"));
const PROFILE = fs.existsSync(path.join(REPO, "brand/profile.json")) ? JSON.parse(fs.readFileSync(path.join(REPO, "brand/profile.json"), "utf8")) : {};
const OUT = path.join(STORY, "out"), HTML = path.join(OUT, "html"); fs.mkdirSync(HTML, { recursive: true });

// ---------- helpers ----------
const esc = (s) => String(s ?? "").replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;");
// mini markup: *accent*  ==highlight box==  **bold**  __marker underline__  ~~struck~~  \n = line break
const md = (s) => esc(s)
  .replace(/==(.+?)==/g, '<mark class="hl"><span>$1</span></mark>')
  .replace(/\*\*(.+?)\*\*/g, "<b>$1</b>")
  .replace(/\*(.+?)\*/g, '<em class="ac">$1</em>')
  .replace(/__(.+?)__/g, '<span class="mk">$1</span>')
  .replace(/~~(.+?)~~/g, "<s>$1</s>")
  .replace(/\n/g, "<br>");
const fileUrl = (p) => {
  if (!p) return "";
  if (/^(https?:|data:)/.test(p)) return p;
  const cands = [path.resolve(STORY, p), path.resolve(REPO, p), path.resolve(REPO, "brand/cards", p)];
  const hit = cands.find((c) => fs.existsSync(c));
  if (!hit) { warnGlobal.push(`image not found: ${p}`); return ""; }
  return pathToFileURL(hit).href;
};
const warnGlobal = [];
const iconCache = {};
const icon = (name, cls = "ic") => {
  if (!name) return "";
  if (!(name in iconCache)) {
    const f = [`brand/icons/${name}.duotone.svg`, `brand/icons/${name}.svg`, `brand/icons/${name}`].map((p) => path.join(REPO, p)).find((p) => fs.existsSync(p));
    if (!f) warnGlobal.push(`icon missing: ${name} (python -I brand/fetch_icon.py ui ${name})`);
    iconCache[name] = f ? fs.readFileSync(f, "utf8").replace(/<\?xml[^>]*>/, "").replace(/width="[^"]*"\s*height="[^"]*"/, "") : "";
  }
  return `<span class="${cls}">${iconCache[name] || '<svg viewBox="0 0 24 24"><circle cx="12" cy="12" r="6" fill="currentColor"/></svg>'}</span>`;
};
const G = { // tiny built-in glyphs (stroke icons) for UI chrome
  heart: '<svg viewBox="0 0 24 24"><path d="M12 20s-7-4.4-7-10a4 4 0 0 1 7-2.6A4 4 0 0 1 19 10c0 5.6-7 10-7 10z"/></svg>',
  save: '<svg viewBox="0 0 24 24"><path d="M6 3h12v18l-6-4.5L6 21z"/></svg>',
  share: '<svg viewBox="0 0 24 24"><path d="M21 3 10 14M21 3l-7 18-4-7-7-4z"/></svg>',
  comment: '<svg viewBox="0 0 24 24"><path d="M21 12a8 8 0 0 1-11.6 7.1L4 20l1-4.6A8 8 0 1 1 21 12z"/></svg>',
  arrow: '<svg viewBox="0 0 24 24"><path d="M4 12h15M13 6l6 6-6 6"/></svg>',
  check: '<svg viewBox="0 0 24 24"><path d="M5 12.5l4.5 4.5L19 7.5"/></svg>',
  cross: '<svg viewBox="0 0 24 24"><path d="M6 6l12 12M18 6 6 18"/></svg>',
};
const glyph = (n, cls = "gl") => `<span class="${cls}">${G[n]}</span>`;
const cell = (v) => {
  const s = String(v ?? "");
  if (/^(yes|y|✓|true)$/i.test(s)) return `<span class="yes">${G.check}</span>`;
  if (/^(no|n|✗|false)$/i.test(s)) return `<span class="no">${G.cross}</span>`;
  return md(s);
};
const col = (c) => ({ accent: "var(--ac)", accent2: "var(--ac2)", amber: "var(--amber)", good: "var(--good)", bad: "var(--bad)", mute: "var(--barmute)", ink: "var(--ink)", violet: "var(--violet)" }[c] || c || "var(--ac)");
const fmt = (v, d) => d ?? String(v);

// ---------- visuals ----------
function rings(items) {
  return `<div class="rings">${items.map((it) => {
    const r = 120, L = 2 * Math.PI * r, f = Math.max(0, Math.min(100, it.v)) / 100;
    return `<div class="ring"><svg viewBox="0 0 300 300"><circle cx="150" cy="150" r="${r}" class="trk"/><circle cx="150" cy="150" r="${r}" class="val" style="stroke:${col(it.color)}" stroke-dasharray="${L * f} ${L}" transform="rotate(-90 150 150)"/></svg>
      <div class="rv" style="color:${col(it.color)}"><span>${esc(fmt(it.v, it.display))}<small>${esc(it.unit ?? "%")}</small></span></div><div class="rl">${md(it.label)}</div></div>`;
  }).join("")}</div>`;
}
function visual(v) {
  if (!v) return "";
  if (v.type === "rings") return rings(v.items);
  if (v.type === "bigstat") return `<div class="bigstat"><div class="bs-v" style="color:${col(v.color)}">${esc(v.v)}</div><div class="bs-l">${md(v.label || "")}</div></div>`;
  if (v.type === "vs") return `<div class="vs"><div class="vs-a" style="--c:${col(v.a.color)}">${v.a.icon ? icon(v.a.icon, "vsic") : ""}<b>${md(v.a.label)}</b></div><div class="vs-x">VS</div><div class="vs-b" style="--c:${col(v.b.color || "accent2")}">${v.b.icon ? icon(v.b.icon, "vsic") : ""}<b>${md(v.b.label)}</b></div></div>`;
  if (v.type === "icons") return `<div class="icrow">${v.items.map((n) => icon(n, "bigic")).join("")}</div>`;
  if (v.type === "image") return `<div class="imgcard"><img src="${fileUrl(v.src)}" style="object-position:${v.pos || "50% 30%"}"></div>`;
  return "";
}
function chartBars(s) {
  const max = s.max ?? Math.max(...s.items.map((i) => i.v));
  return `<div class="bars">${s.items.map((it) => `<div class="bar ${it.hi ? "hi" : ""}"><div class="bl">${md(it.label)}</div>
    <div class="bt"><div class="bf" style="width:${(100 * it.v / max).toFixed(1)}%;background:${col(it.color || (it.hi ? "accent" : "mute"))}"></div><span class="bv">${esc(fmt(it.v, it.display))}${esc(s.unit ?? "")}</span></div>
    ${it.note ? `<div class="bn">${md(it.note)}</div>` : ""}</div>`).join("")}</div>`;
}
function chartColumns(s) {
  const W = 912, H = s.height || 520, top = 70;
  const vals = s.items.map((i) => i.v), hi = Math.max(0, ...vals), lo = Math.min(0, ...vals), bot = lo < 0 ? 78 : 20;
  const sy = (H - top - bot) / (hi - lo || 1), y0 = top + hi * sy;
  const n = s.items.length, slot = W / n, bw = Math.min(190, slot * 0.58);
  let g = `<line x1="0" x2="${W}" y1="${y0}" y2="${y0}" class="axis"/>`;
  s.items.forEach((it, i) => {
    const x = i * slot + (slot - bw) / 2, h = Math.abs(it.v) * sy, y = it.v >= 0 ? y0 - h : y0;
    const c = col(it.color || (it.v < 0 ? "bad" : "accent"));
    g += `<rect x="${x}" y="${y}" width="${bw}" height="${Math.max(h, 3)}" rx="14" fill="${c}" ${it.dashed ? 'fill-opacity=".25" stroke="' + c + '" stroke-width="4" stroke-dasharray="14 10"' : ""}/>`;
    const ty = it.v >= 0 ? y - 18 : y + h + 58;
    g += `<text x="${x + bw / 2}" y="${ty}" text-anchor="middle" class="cv" fill="${c}">${esc(fmt(it.v, it.display))}${esc(s.unit ?? "")}</text>`;
  });
  return `<div class="cols"><svg viewBox="0 0 ${W} ${H}" width="${W}" height="${H}">${g}</svg>
    <div class="clabels">${s.items.map((it) => `<div style="width:${100 / n}%">${md(it.label)}${it.sub ? `<small>${md(it.sub)}</small>` : ""}</div>`).join("")}</div></div>`;
}

// ---------- layouts (each returns the inner HTML of <main>) ----------
const head = (s, big) => `${s.kicker ? `<div class="kick">${md(s.kicker)}</div>` : ""}<h2 class="ttl ${big ? "xl" : ""}">${md(s.title)}</h2>${s.sub ? `<p class="sub">${md(s.sub)}</p>` : ""}`;
const tail = (s) => `${s.takeaway ? `<div class="take"><b>${esc(s.takeawayLabel || "Key takeaway")}</b><span>${md(s.takeaway)}</span></div>` : ""}${s.note ? `<p class="note">${md(s.note)}</p>` : ""}`;
const L = {
  cover: (s) => `${s.kicker ? `<div class="kick pill">${md(s.kicker)}</div>` : ""}<h1 class="ttl xxl">${md(s.title)}</h1>${s.sub ? `<p class="sub lg">${md(s.sub)}</p>` : ""}
    <div class="vis">${visual(s.visual)}</div>`,
  statement: (s) => `${head(s, true)}<div class="vis">${visual(s.visual)}</div>${tail(s)}`,
  bars: (s) => `${head(s)}<div class="vis">${chartBars(s)}</div>${tail(s)}`,
  columns: (s) => `${head(s)}<div class="vis">${chartColumns(s)}</div>${tail(s)}`,
  stat: (s) => `${head(s)}<div class="statwrap"><div class="statbox" style="--c:${col(s.color)}"><span class="sv">${esc(s.value)}</span>${s.unit ? `<span class="su">${md(s.unit)}</span>` : ""}</div>
    <div class="slab">${md(s.label || "")}</div></div>${s.extra ? `<div class="minis">${s.extra.map((e) => `<div class="mini"><span class="mv" style="color:${col(e.color)}">${esc(e.v)}</span><span class="ml">${md(e.label)}</span></div>`).join("")}</div>` : ""}${tail(s)}`,
  points: (s) => `${head(s)}<div class="pts">${s.items.map((it) => `<div class="pt">${icon(it.icon, "tile")}<div class="ptx">${it.title ? `<b>${md(it.title)}</b>` : ""}${it.text ? `<span>${md(it.text)}</span>` : ""}</div></div>`).join("")}</div>${tail(s)}`,
  numbered: (s) => `${head(s)}<div class="nums">${s.items.map((it, i) => `<div class="num"><span class="nn">${it.n ?? i + 1}</span><div class="ptx">${it.title ? `<b>${md(it.title)}</b>` : ""}${it.text ? `<span>${md(it.text)}</span>` : ""}</div></div>`).join("")}</div>${tail(s)}`,
  checklist: (s) => `${head(s)}<div class="chk">${s.items.map((it) => `<div class="ck">${glyph("check", "box")}<div class="ptx">${typeof it === "string" ? `<b>${md(it)}</b>` : `<b>${md(it.title)}</b>${it.text ? `<span>${md(it.text)}</span>` : ""}`}</div></div>`).join("")}</div>${tail(s)}`,
  compare: (s) => `${head(s)}<div class="cmp">${[s.a, s.b].map((c, k) => `<div class="cc" style="--c:${col(c.color || (k ? "accent2" : "accent"))}">${c.icon ? icon(c.icon, "ccic") : ""}<h3>${md(c.title)}</h3><ul>${c.items.map((x) => `<li>${md(x)}</li>`).join("")}</ul></div>`).join("")}</div>${tail(s)}`,
  table: (s) => `${head(s)}<table class="tbl"><thead><tr>${s.columns.map((c) => `<th>${md(c)}</th>`).join("")}</tr></thead><tbody>${s.rows.map((r) => `<tr>${r.map((c, i) => i ? `<td>${cell(c)}</td>` : `<td class="rh">${md(c)}</td>`).join("")}</tr>`).join("")}</tbody></table>${tail(s)}`,
  code: (s) => `${head(s)}${s.blocks.map((b) => `${b.label ? `<div class="clab">${md(b.label)}</div>` : ""}<div class="code"><div class="dots"><i></i><i></i><i></i><span>${esc(b.file || "")}</span></div><pre>${hl(b.code)}</pre></div>`).join("")}${tail(s)}`,
  mythfact: (s) => `${head(s)}<div class="mf"><div class="myth"><span class="tag">${glyph("cross")} ${esc(s.mythLabel || "Myth")}</span><p>${md(s.myth)}</p></div><div class="fact"><span class="tag">${glyph("check")} ${esc(s.factLabel || "Fact")}</span><p>${md(s.fact)}</p></div></div>${tail(s)}`,
  timeline: (s) => `${head(s)}<div class="tl">${s.items.map((it) => `<div class="te ${it.hi ? "hi" : ""}"><span class="td">${md(it.when)}</span><span class="tt">${md(it.text)}</span></div>`).join("")}</div>${tail(s)}`,
  quote: (s) => `${s.kicker ? `<div class="kick">${md(s.kicker)}</div>` : ""}<div class="qt"><span class="qm">“</span><p>${md(s.quote)}</p>${s.by ? `<cite>${md(s.by)}</cite>` : ""}</div>${tail(s)}`,
  cta: (s) => `${head(s, true)}${s.recap ? `<div class="recap">${s.recap.map((r) => `<div class="rc">${glyph("check", "rcg")}<span>${md(r)}</span></div>`).join("")}</div>` : ""}
    <div class="nudges">${(s.nudges || ["comment", "save", "share"]).map((n) => `<div class="ng">${glyph(n === "save" ? "save" : n === "share" ? "share" : n === "like" ? "heart" : "comment", "ngi")}<span>${esc({ comment: "Comment", save: "Save", share: "Share", like: "Like" }[n] || n)}</span></div>`).join("")}</div>
    <div class="follow">${logoImg("flogo")}<div class="ftx"><b>Follow @${esc(PROFILE.handle || C.handle || "")}</b><span>${md(s.followLine || C.followLine || "")}</span></div><span class="fbtn">Follow</span></div>`,
};
function hl(code) { // one-pass tokenizer for code cards: comments, strings, keywords
  const re = /(\/\/[^\n]*|#[^\n]*)|("[^"\n]*"|'[^'\n]*')|\b(const|let|var|function|return|import|from|export|def|class|if|else|for|while|await|async|new|try|catch)\b/g;
  let out = "", last = 0, m;
  while ((m = re.exec(code))) { out += esc(code.slice(last, m.index)) + `<i class="${m[1] ? "c" : m[2] ? "s" : "k"}">${esc(m[0])}</i>`; last = re.lastIndex; }
  return out + esc(code.slice(last));
}
const logoSrc = C.logo || PROFILE.brandLogo || "brand/logos/logo.png";
function logoImg(cls) { const u = fileUrl(logoSrc); return u ? `<img class="${cls}" src="${u}">` : `<span class="${cls} lph">${esc((PROFILE.name || "M")[0])}</span>`; }

// ---------- page ----------
const GROW = ["points", "numbered", "checklist", "compare", "table", "timeline", "quote", "mythfact", "code"];
const n = C.slides.length;
function page(s, i) {
  const theme = s.theme || C.theme || "notebook";
  const img = s.image ? `<div class="bgimg fit-${s.image.fit || "bleed"}"><img src="${fileUrl(s.image.src)}" style="object-position:${s.image.pos || "50% 30%"}"></div>` : "";
  const last = i === n - 1;
  const vars = [C.accent && `--ac:${C.accent}`, C.accent2 && `--ac2:${C.accent2}`, s.accent && `--ac:${s.accent}`].filter(Boolean).join(";");
  return `<!doctype html><html><head><meta charset="utf-8"><link rel="stylesheet" href="${pathToFileURL(path.join(TPL, "fonts/fonts.css")).href}"><link rel="stylesheet" href="${pathToFileURL(path.join(TPL, "slide.css")).href}"></head>
<body><div data-grow="${s.grow ?? GROW.includes(s.layout) ? 1 : ""}" class="slide theme-${theme} L-${s.layout} ${s.image ? "has-img img-" + (s.image.fit || "bleed") : ""} ${C.lang === "hi" ? "lang-hi" : ""}" style="${vars}">
${img}
<header class="hd">${logoImg("av")}<div class="who"><b>${esc(PROFILE.name || C.name || "")}</b><span>@${esc(PROFILE.handle || C.handle || "")}</span></div>${C.series ? `<div class="series">${md(C.series)}</div>` : ""}</header>
<main class="ct">${(L[s.layout] || (() => `<h2 class="ttl">Unknown layout ${esc(s.layout)}</h2>`))(s)}</main>
${s.source ? `<div class="src">${md(s.source)}</div>` : ""}
<footer class="ft"><div class="pg"><b>${String(i + 1).padStart(2, "0")}</b>/${String(n).padStart(2, "0")}</div><div class="prog"><i style="width:${(100 * (i + 1) / n).toFixed(1)}%"></i></div>
${s.save ? `<div class="savehint">${glyph("save", "gl")} Save this</div>` : ""}${i === 0 && s.swipe !== false ? `<div class="swipebig">${esc(s.swipeText || "Swipe")} ${glyph("arrow")}</div>` : !last ? `<div class="swipe">${glyph("arrow")}</div>` : ""}</footer>
</div><pre id="qa"></pre><script>${FIT_JS}</script></body></html>`;
}

// auto-fit + QA, runs inside Chrome. Shrinks --k (all main text scales with it) until <main> fits;
// shrinks long title lines; then writes a JSON QA report into #qa (read back via --dump-dom).
const FIT_JS = `
(async () => {
  try { await document.fonts.ready; } catch (e) {}
  await Promise.all([...document.images].map(im => im.complete ? 0 : new Promise(r => { im.onload = im.onerror = r; })));
  const S = document.querySelector('.slide'), M = document.querySelector('.ct');
  let k = 1; const over = () => M.scrollHeight > M.clientHeight + 1 || M.scrollWidth > M.clientWidth + 1;
  if (S.dataset.grow) { while (!over() && k < 1.22) { k += 0.02; S.style.setProperty('--k', k.toFixed(2)); } }
  while (over() && k > 0.72) { k -= 0.02; S.style.setProperty('--k', k.toFixed(2)); }
  document.querySelectorAll('.ttl').forEach(t => { let tk = 1; while (t.scrollWidth > t.clientWidth + 1 && tk > 0.6) { tk -= 0.03; t.style.setProperty('--tk', tk.toFixed(2)); } });
  const q = { k: +k.toFixed(2), errors: [], warns: [] };
  if (over()) q.errors.push('content overflows the safe area even at k=' + k.toFixed(2) + ' - cut words or split the slide');
  const W = S.clientWidth, H = S.clientHeight;
  let minF = 99, words = 0;
  const walker = document.createTreeWalker(M, NodeFilter.SHOW_TEXT);
  while (walker.nextNode()) { const tn = walker.currentNode; const tx = tn.textContent.trim(); if (!tx) continue;
    const el = tn.parentElement; if (el.closest('svg')) { words += tx.split(/\\s+/).length; continue; }
    const fs = parseFloat(getComputedStyle(el).fontSize); minF = Math.min(minF, fs); words += tx.split(/\\s+/).length;
    const r = el.getBoundingClientRect(); if (r.width && (r.left < 40 || r.right > W - 40 || r.bottom > H - 70)) q.errors.push('text outside safe margins: "' + tx.slice(0, 40) + '"'); }
  if (minF < 23.5) q.warns.push('smallest text ' + minF.toFixed(0) + 'px (< 24px is hard to read on a phone)');
  if (words > 75) q.warns.push(words + ' words on one slide (aim <= 60)');
  if (k < 0.86) q.warns.push('text shrunk to ' + Math.round(k * 100) + '% to fit - slide is dense');
  document.querySelectorAll('img').forEach(im => { if (!im.naturalWidth) q.errors.push('image failed: ' + im.src.slice(-60)); });
  q.minFont = Math.round(minF); q.words = words;
  document.getElementById('qa').textContent = 'QA' + JSON.stringify(q) + 'QA';
})();`;

// ---------- chrome ----------
const prof = path.join(os.tmpdir(), "carousel-chrome-profile");
function chrome(extra, url) {
  const r = spawnSync(CHROME, ["--headless=new", "--disable-gpu", "--hide-scrollbars", "--no-first-run", "--allow-file-access-from-files", `--user-data-dir=${prof}`, "--virtual-time-budget=6000", "--run-all-compositor-stages-before-draw", ...extra, url], { encoding: "utf8", maxBuffer: 64 << 20 });
  return r.stdout || "";
}
function pngSize(f) { const b = fs.readFileSync(f); return [b.readUInt32BE(16), b.readUInt32BE(20)]; }

// ---------- run ----------
if (!CHROME) { console.error("Chrome not found - set CHROME=path"); process.exit(1); }
const report = [];
C.slides.forEach((s, i) => {
  if (ONLY && !ONLY.includes(i + 1)) return;
  const id = String(i + 1).padStart(2, "0"), hf = path.join(HTML, `${id}.html`);
  fs.writeFileSync(hf, page(s, i));
  const url = pathToFileURL(hf).href;
  const dom = chrome(["--dump-dom", "--window-size=1080,1350"], url);
  const m = dom.match(/QA(\{.*?\})QA/s); const q = m ? JSON.parse(m[1].replace(/&quot;/g, '"').replace(/&amp;/g, "&").replace(/&lt;/g, "<").replace(/&gt;/g, ">")) : { errors: ["QA script did not run"], warns: [] };
  if (!NOSHOT) {
    const png = path.join(OUT, `${id}_${s.layout}.png`);
    for (const f of fs.readdirSync(OUT)) if (f.startsWith(id + "_") && f.endsWith(".png")) fs.unlinkSync(path.join(OUT, f));
    chrome([`--screenshot=${png}`, "--window-size=1080,1350", `--force-device-scale-factor=${HD ? 4 / 3 : 1}`], url);
    if (!fs.existsSync(png)) q.errors.push("screenshot failed"); else { const [w, h] = pngSize(png); const want = HD ? [1440, 1800] : [1080, 1350]; if (w !== want[0] || h !== want[1]) q.errors.push(`size ${w}x${h}, expected ${want.join("x")}`); }
  }
  report.push({ slide: i + 1, layout: s.layout, ...q });
  console.log(`${id} ${s.layout.padEnd(10)} k=${q.k} min=${q.minFont}px words=${q.words}${q.errors.length ? "  ERROR " + q.errors.join("; ") : ""}${q.warns.length ? "  warn " + q.warns.join("; ") : ""}`);
});
for (const w of [...new Set(warnGlobal)]) console.log("warn", w);

// contact sheet (all slides) for a quick visual review
if (!NOSHOT) {
  const pngs = fs.readdirSync(OUT).filter((f) => /^\d\d_.*\.png$/.test(f)).sort();
  const cols = Math.min(4, pngs.length), rows = Math.ceil(pngs.length / cols), tw = 400, th = 500, gap = 16;
  const sheet = path.join(HTML, "overview.html");
  fs.writeFileSync(sheet, `<!doctype html><body style="margin:0;background:#CBD5E1;display:grid;grid-template-columns:repeat(${cols},${tw}px);gap:${gap}px;padding:${gap}px">${pngs.map((f) => `<img src="${pathToFileURL(path.join(OUT, f)).href}" style="width:${tw}px;height:${th}px;border-radius:8px">`).join("")}</body>`);
  chrome([`--screenshot=${path.join(OUT, "overview.png")}`, `--window-size=${cols * (tw + gap) + gap},${rows * (th + gap) + gap}`], pathToFileURL(sheet).href);
}

// post package: caption, SEO, hashtags, alt text
const P = C.post || {};
const post = [`# ${C.title || "Carousel"} - publishing package`, "",
  "## Caption", "", P.caption || "(write post.caption in carousel.json)", "",
  P.hashtags ? `${P.hashtags.map((h) => (h.startsWith("#") ? h : "#" + h)).join(" ")}\n` : "",
  "## SEO keywords", "", P.keywords ? `- Primary: **${P.keywords.primary}**\n- Secondary: ${(P.keywords.secondary || []).join(", ")}\n- Search phrases / long-tail: ${(P.keywords.longtail || []).join("; ")}` : "-", "",
  "## Alt text (paste per slide: Advanced settings -> Write alt text)", "",
  ...C.slides.map((s, i) => `${i + 1}. ${s.alt || "(missing alt text)"}`), "",
  "## Sources", "", ...(C.sources || []).map((s) => `- ${s}`), "",
  P.firstComment ? `## First comment\n\n${P.firstComment}\n` : "",
].join("\n");
fs.writeFileSync(path.join(OUT, "post.md"), post);
fs.writeFileSync(path.join(OUT, "qa.json"), JSON.stringify(report, null, 1));
const bad = report.filter((r) => r.errors.length);
console.log(bad.length ? `\nQA: ${bad.length} slide(s) with errors` : `\nQA: all ${report.length} slides pass`, "->", OUT);
const missingAlt = C.slides.filter((s) => !s.alt).length; if (missingAlt) console.log(`warn ${missingAlt} slide(s) missing alt text`);
