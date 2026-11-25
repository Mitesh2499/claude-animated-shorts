// X (Twitter) data-card builder: xcarousel.json -> computed stats -> HTML cards -> PNG (headless Chrome)
// + data checks + layout QA + thread.md (tweets <= 280 chars, <= 4 images each, alt text per image).
// usage: node templates/x-carousel/build.mjs <storyDir> [--only 2,3] [--no-shot] [--hd]
import fs from "node:fs"; import path from "node:path"; import os from "node:os";
import { spawnSync } from "node:child_process"; import { pathToFileURL, fileURLToPath } from "node:url";

const TPL = path.dirname(fileURLToPath(import.meta.url)), REPO = path.resolve(TPL, "../..");
const FONTS = path.join(REPO, "templates/carousel/fonts/fonts.css");
const args = process.argv.slice(2);
const STORY = path.resolve(args.find((a) => !a.startsWith("--") && !/^\d+(,\d+)*$/.test(a)) || ".");
const HD = args.includes("--hd"), NOSHOT = args.includes("--no-shot");
const oi = args.indexOf("--only"); const ONLY = oi >= 0 ? args[oi + 1].split(",").map(Number) : null;
const CHROME = process.env.CHROME || ["C:/Program Files/Google/Chrome/Application/chrome.exe", "C:/Program Files (x86)/Google/Chrome/Application/chrome.exe", "/usr/bin/google-chrome", "/Applications/Google Chrome.app/Contents/MacOS/Google Chrome"].find((p) => fs.existsSync(p));
const X = JSON.parse(fs.readFileSync(path.join(STORY, "xcarousel.json"), "utf8"));
const PROFILE = JSON.parse(fs.readFileSync(path.join(REPO, "brand/profile.json"), "utf8"));
const OUT = path.join(STORY, "out"), HTML = path.join(OUT, "html"); fs.mkdirSync(HTML, { recursive: true });
const TEAMS = X.teams || {};
const problems = [];

// ---------- text helpers ----------
const esc = (s) => String(s ?? "").replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;");
const md = (s) => esc(s).replace(/==(.+?)==/g, '<mark class="hl">$1</mark>').replace(/\*\*(.+?)\*\*/g, "<b>$1</b>").replace(/\*(.+?)\*/g, '<em class="ac">$1</em>').replace(/\n/g, "<br>");
const fileUrl = (p) => { if (!p) return ""; const hit = [path.resolve(STORY, p), path.resolve(REPO, p), path.resolve(REPO, "brand/cards", p)].find((c) => fs.existsSync(c)); if (!hit) problems.push(`image not found: ${p}`); return hit ? pathToFileURL(hit).href : ""; };
const team = (id) => TEAMS[id] || { name: id || "", code: (id || "").toUpperCase(), color: "#2563EB", ink: "#fff" };
const initials = (n) => String(n || "?").split(/\s+/).filter(Boolean).map((w) => w[0]).slice(0, 2).join("").toUpperCase();

// ---------- DERIVE: every number that can be computed is computed (no hand arithmetic on cards) ----------
const ballsOf = (o) => { const [a, b = "0"] = String(o).split("."); return +a * 6 + +b; };
const oversOf = (balls) => `${Math.floor(balls / 6)}${balls % 6 ? "." + (balls % 6) : ""}`;
const f2 = (v) => (Math.round(v * 100) / 100).toFixed(2);
const D = {
  bowl: (b) => { const bl = ballsOf(b.o); return { ...b, balls: bl, econ: bl ? f2((b.r / bl) * 6) : "-", fig: `${b.w}-${b.r}`, line: `${b.o}-${b.m ?? 0}-${b.r}-${b.w}` }; },
  bat: (b) => { const br = 4 * (b.f4 || 0) + 6 * (b.f6 || 0); return { ...b, sr: b.b ? (Math.round((b.r / b.b) * 1000) / 10).toFixed(1) : "-", bRuns: br, bPct: b.r ? Math.round((100 * br) / b.r) : 0, fig: `${b.r}${b.no ? "*" : ""}` }; },
  // chase ledger: start {runs, wkts, balls} + steps [{label, runs, wkts, balls}] -> needed / balls left / required rate after each step
  chase: (c) => {
    let runs = c.start.runs, wk = c.start.wkts, used = c.start.balls; const total = c.balls || 120;
    const row = (label, extra = {}) => { const need = c.target - runs, left = total - used; return { label, runs, wk, need, left, rrr: left > 0 && need > 0 ? f2((need / left) * 6) : "-", ...extra }; };
    const rows = [row(c.start.label || `After ${oversOf(used)} ov`, { start: true })];
    for (const s of c.steps) { runs += s.runs; wk += s.wkts || 0; used += s.balls; rows.push(row(s.label, { got: s.runs, wkts: s.wkts || 0, by: s.by, hi: s.hi })); }
    const margin = c.target - 1 - runs; // runs short of a tie+1
    if (c.final != null && c.final !== runs) problems.push(`chase: computed ${runs} but final says ${c.final}`);
    return { rows, final: runs, wk, result: runs >= c.target ? `Chased with ${total - used} balls left` : `Fell ${c.target - runs} short · lost by ${margin}` };
  },
  rpo: (p) => ({ ...p, rpo: f2((p.runs / ballsOf(p.overs)) * 6) }),
};
// generic data checks: {what, expect, sum:[...]} or {what, expect, eq}
for (const c of X.checks || []) {
  const got = c.sum ? c.sum.reduce((a, b) => a + b, 0) : c.eq;
  if (got !== c.expect) problems.push(`check failed: ${c.what}: got ${got}, expected ${c.expect}`);
}
// colour tone for a value. tone: {good, bad, lowIsGood}
function tone(v, t) {
  if (!t || v === "-" || v == null) return "var(--ac)"; const x = parseFloat(v);
  const good = t.lowIsGood ? x <= t.good : x >= t.good, bad = t.lowIsGood ? x >= t.bad : x <= t.bad;
  return good ? "var(--good)" : bad ? "var(--bad)" : "var(--mid)";
}
const MARK = '<svg class="mark" viewBox="0 0 24 24"><rect x="2" y="13" width="5" height="9" rx="1.5"/><rect x="9.5" y="8" width="5" height="14" rx="1.5"/><rect x="17" y="2" width="5" height="20" rx="1.5"/></svg>';
const badge = (v, label, color) => `<div class="badge" style="--t:${color}">${MARK}<span class="bv">${esc(v)}</span>${label ? `<span class="bl">${esc(label)}</span>` : ""}</div>`;
const avatar = (p, tm) => p.avatar ? `<img class="ava" src="${fileUrl(p.avatar)}">` : p.photo && !p.title ? `<img class="ava" src="${fileUrl(p.photo)}">` : `<span class="ava" style="background:${tm.color};color:${tm.ink || "#fff"}">${esc(initials(p.name || p.title))}</span>`;
const chip = (c) => `<span class="chip ${c.dark ? "dk" : ""}">${md(c.t ?? c)}</span>`;
const ballChip = (b) => { const s = String(b); const cls = s === "." || s === "0" ? "dot" : /^W/i.test(s) ? "wk" : s === "4" ? "four" : s === "6" ? "six" : /^(wd|nb|lb|b)/.test(s) ? "ex" : "run"; return `<i class="ball ${cls}">${s === "0" ? "·" : s === "." ? "·" : esc(s)}</i>`; };

// ---------- layouts ----------
const panel = (s, inner) => { const tm = team(s.team); return `<section class="panel ${s.photo ? "has-photo" : ""} hero-${s.layout}" style="--tc:${tm.color};--ti:${tm.ink || "#fff"}">${s.hero ? `<div class="hero">${esc(s.hero)}</div>` : ""}${s.photo ? `<img class="photo" src="${fileUrl(s.photo)}">` : ""}${inner}</section>`; };
const statRow = (cells) => `<div class="srow">${cells.map(([v, l, c]) => `<div><b style="${c ? "color:" + c : ""}">${esc(v)}</b><span>${esc(l)}</span></div>`).join("")}</div>`;
const L = {
  cover: (s) => panel(s, `${s.kicker ? `<div class="pk">${md(s.kicker)}</div>` : ""}<h1 class="ttl xl">${md(s.title)}</h1>${s.sub ? `<p class="psub">${md(s.sub)}</p>` : ""}
    ${s.facts ? `<div class="facts">${s.facts.map((f) => `<div class="fact"><b>${esc(f.v)}</b><span>${md(f.l)}</span></div>`).join("")}</div>` : ""}`),
  ledger: (s) => { const c = D.chase(s.chase); return `${head(s)}<div class="card ledger"><div class="lg lh"><span>Phase</span><span>Runs</span><span>Wkts</span><span>Need</span><span>Balls</span><span>Req RR</span></div>
    ${c.rows.map((r) => `<div class="lg ${r.start ? "st" : ""} ${r.hi ? "hi" : ""}"><span class="lab">${md(r.label)}${r.by ? `<small>${md(r.by)}</small>` : ""}</span><span>${r.start ? `<b>${r.runs}/${r.wk}</b>` : `<b class="got">+${r.got}</b>`}</span><span>${r.start ? "" : r.wkts ? `<b class="wkt">${r.wkts}</b>` : "0"}</span><span><b>${r.need > 0 ? r.need : "-"}</b></span><span>${r.left}</span><span class="rr" style="color:${tone(r.rrr, s.tone)}">${r.rrr}</span></div>`).join("")}
    <div class="lres">${glyph("flag")} ${md(s.resultText || c.result)} <b>${c.final}/${c.wk}</b></div></div>${foot(s)}`; },
  split: (s) => { const ps = s.phases.map(D.rpo); const mx = Math.max(...ps.map((p) => +p.rpo)); return `${head(s)}<div class="card split">${ps.map((p) => `<div class="sp"><div class="spl">${md(p.label)}<small>${p.runs} runs · ${p.overs} ov</small></div><div class="spt"><i style="width:${(100 * p.rpo / mx).toFixed(1)}%;background:${p.color || "var(--ac)"}"></i></div><div class="spv" style="color:${p.color || "var(--ac)"}">${p.rpo}<small>per over</small></div></div>`).join("")}</div>${foot(s)}`; },
  leaderboard: (s) => { let rows = s.rows.map((r) => (r.bowl ? { ...r, ...D.bowl(r.bowl), kind: "bowl" } : r.bat ? { ...r, ...D.bat(r.bat), kind: "bat" } : r));
    if (s.sort) rows.sort((a, b) => (s.sortAsc ? 1 : -1) * (parseFloat(b[s.sort]) - parseFloat(a[s.sort])) * -1);
    return `${head(s)}<div class="card board"><div class="bh"><span>Player · figures</span><span>${esc(s.metricLabel || "")}</span></div>${rows.map((r) => `<div class="br ${r.hi ? "hi" : ""}">${avatar(r, team(r.team))}<div class="bn"><b>${md(r.name)}</b><span>${r.kind === "bowl" ? `${r.line}` : r.kind === "bat" ? `${r.fig} (${r.b})` : md(r.figures || "")}${r.note ? ` · ${md(r.note)}` : ""}</span></div>${badge(r[s.metric] ?? r.value, "", tone(r[s.metric] ?? r.value, s.tone))}</div>`).join("")}</div>${foot(s)}`; },
  player: (s) => { const tm = team(s.team); const p = s.bowl ? D.bowl(s.bowl) : null, b = s.bat ? D.bat(s.bat) : null;
    const main = s.badge || (p ? { v: p.econ, l: "econ", tone: { good: 7, bad: 10, lowIsGood: true } } : { v: b.sr, l: "strike rate", tone: { good: 150, bad: 110 } });
    const cells = [];
    if (b) cells.push(statRow([[b.fig, "runs"], [b.b, "balls"], [b.f4 || 0, "4s"], [b.f6 || 0, "6s"], [b.sr, "SR"]]));
    if (p) cells.push(statRow([[p.w, "wkts"], [p.r, "runs"], [p.o, "overs"], [p.econ, "econ"], ...(p.dots != null ? [[p.dots, "dots"]] : [])]));
    return `<div class="chips">${(s.chips || X.chips || []).map(chip).join("")}</div>` + panel({ ...s, hero: s.hero ?? (b ? b.fig : p.fig) }, `<div class="pk">${md(s.kicker || "")}</div><h1 class="ttl pn">${md(s.title || s.name)}</h1>
    <div class="glass"><div class="gh">${avatar(s, tm)}<div class="gn"><b>${md(s.short || s.name)}</b><span>${md(s.role || tm.name)}</span></div>${badge(main.v, main.l, tone(main.v, main.tone))}</div>
    ${s.highlights ? `<ul class="hlts">${s.highlights.map((h) => `<li>${md(h)}</li>`).join("")}</ul>` : ""}
    ${s.bat ? `<div class="gsec">Batting</div>${cells.shift()}` : ""}${s.bowl ? `<div class="gsec">Bowling</div>${cells.shift()}` : ""}
    ${b && s.boundaryBar !== false ? `<div class="bbar"><div class="bbt"><i style="width:${b.bPct}%"></i></div><span><b>${b.bPct}%</b> of his runs in boundaries (${b.bRuns} of ${b.r})</span></div>` : ""}
    ${s.overs ? `<div class="overs">${s.overs.map((o) => `<div class="ov"><div class="balls">${o.balls.map(ballChip).join("")}</div><span>${md(o.label)}</span></div>`).join("")}</div>` : ""}
    ${s.phases ? `<div class="phs">${s.phases.map((ph) => `<div class="ph"><span>${md(ph.label)}</span><b>${md(ph.v)}</b>${ph.sub ? `<small>${md(ph.sub)}</small>` : ""}</div>`).join("")}</div>` : ""}
    ${s.form ? `<div class="gsec">${md(s.formLabel || "Recent form")}</div><div class="form">${s.form.map((f) => `<div class="fm ${f.today ? "today" : ""}">${badge(f.v, "", tone(f.v, s.formTone || main.tone))}<span>${md(f.l)}</span></div>`).join("")}</div>` : ""}
    ${s.result ? `<div class="res">${md(s.result)}</div>` : ""}</div>`) + (s.source ? `<div class="src in">${md(s.source)}</div>` : ""); },
  bars: (s) => { const mx = s.max ?? Math.max(...s.rows.map((r) => r.v)); return `${head(s)}<div class="card rows">${s.rows.map((r) => `<div class="rw ${r.hi ? "hi" : ""}"><span class="rl">${md(r.label)}</span><span class="rn">${md(r.name || "")}</span><div class="rt"><i style="width:${(100 * r.v / mx).toFixed(1)}%;${r.color ? "background:" + r.color : ""}"></i></div><b class="rv">${esc(r.display ?? r.v)}</b></div>`).join("")}</div>${foot(s)}`; },
  end: (s) => `<div class="endc"><div class="eb">${MARK}<b>${esc(s.big || "")}</b></div><p class="ebl">${md(s.bigLabel || "")}</p>${head(s)}<ul class="eul">${(s.points || []).map((p) => `<li>${md(p)}</li>`).join("")}</ul>
    <div class="ecta"><img class="eav" src="${fileUrl(PROFILE.brandLogo || "brand/logos/logo.png")}"><div><b>@${esc(PROFILE.handle)}</b><span>${md(s.followLine || "")}</span></div><span class="fbtn">Follow</span></div>${s.question ? `<div class="eq">${md(s.question)}</div>` : ""}</div>`,
};
const head = (s) => `${s.chips !== false ? `<div class="chips">${(s.chips || X.chips || []).map(chip).join("")}</div>` : ""}${s.kicker ? `<div class="kick">${md(s.kicker)}</div>` : ""}<h2 class="ttl">${md(s.title)}</h2>${s.sub ? `<p class="sub">${md(s.sub)}</p>` : ""}`;
const foot = (s) => `${s.takeaway ? `<div class="take">${md(s.takeaway)}</div>` : ""}${s.source ? `<div class="src">${md(s.source)}</div>` : ""}`;
const glyph = (n) => ({ flag: '<svg class="gly" viewBox="0 0 24 24"><path d="M5 21V4m0 0h11l-2 4 2 4H5"/></svg>' }[n] || "");

// ---------- page ----------
const n = X.slides.length;
const FIT_JS = `(async()=>{try{await document.fonts.ready}catch(e){}
await Promise.all([...document.images].map(im=>im.complete?0:new Promise(r=>{im.onload=im.onerror=r})));
const S=document.querySelector('.slide'),M=document.querySelector('.ct');let k=1;const over=()=>M.scrollHeight>M.clientHeight+1||M.scrollWidth>M.clientWidth+1;
if(S.dataset.grow){while(!over()&&k<1.25){k+=0.02;S.style.setProperty('--k',k.toFixed(2))}if(over()){k-=0.02;S.style.setProperty('--k',k.toFixed(2))}}
while(over()&&k>0.74){k-=0.02;S.style.setProperty('--k',k.toFixed(2))}
document.querySelectorAll('.ttl').forEach(t=>{let tk=1;while(t.scrollWidth>t.clientWidth+1&&tk>0.6){tk-=0.03;t.style.setProperty('--tk',tk.toFixed(2))}});
const q={k:+k.toFixed(2),errors:[],warns:[]};if(over())q.errors.push('overflow at k='+k.toFixed(2)+' - cut rows/words');
let minF=99,words=0;const W=S.clientWidth,H=S.clientHeight;const w=document.createTreeWalker(M,NodeFilter.SHOW_TEXT);
while(w.nextNode()){const tn=w.currentNode,tx=tn.textContent.trim();if(!tx)continue;const el=tn.parentElement;if(el.closest('.hero'))continue;const fs=parseFloat(getComputedStyle(el).fontSize);minF=Math.min(minF,fs);words+=tx.split(/\\s+/).length;
const r=el.getBoundingClientRect();if(r.width&&(r.left<30||r.right>W-30||r.bottom>H-60))q.errors.push('outside safe margins: "'+tx.slice(0,40)+'"')}
if(minF<21.5)q.warns.push('smallest text '+Math.round(minF)+'px (X shows cards ~50% size: keep >= 22px)');
if(k<0.84)q.warns.push('shrunk to '+Math.round(k*100)+'% - dense');
document.querySelectorAll('img').forEach(im=>{if(!im.naturalWidth)q.errors.push('image failed')});
q.minFont=Math.round(minF);q.words=words;document.getElementById('qa').textContent='QA'+JSON.stringify(q)+'QA'})();`;
function page(s, i) {
  const vars = [X.accent && `--ac:${X.accent}`].filter(Boolean).join(";");
  return `<!doctype html><html><head><meta charset="utf-8"><link rel="stylesheet" href="${pathToFileURL(FONTS).href}"><link rel="stylesheet" href="${pathToFileURL(path.join(TPL, "x.css")).href}"></head>
<body><div data-grow="${["ledger","split","leaderboard","bars","end","player"].includes(s.layout) ? 1 : ""}" class="slide L-${s.layout} ${X.theme === "dark" ? "dark" : ""}" style="${vars}">
<header class="hd"><img class="logo" src="${fileUrl(PROFILE.brandLogo || "brand/logos/logo.png")}"><div class="wm"><b>${esc(PROFILE.handle)}</b><span>${esc(X.desk || "Data desk")}</span></div><div class="series">${md(s.series || X.series || "")}</div></header>
<main class="ct">${(L[s.layout] || (() => `<h2>Unknown layout ${esc(s.layout)}</h2>`))(s)}</main>
<footer class="ft"><span>@${esc(PROFILE.handle)}</span><span class="pg">${i + 1}/${n}</span><span>${md(s.credit || X.credit || "")}</span></footer>
</div><pre id="qa"></pre><script>${FIT_JS}</script></body></html>`;
}

// ---------- render ----------
const prof = path.join(os.tmpdir(), "carousel-chrome-profile");
const chrome = (extra, url) => spawnSync(CHROME, ["--headless=new", "--disable-gpu", "--hide-scrollbars", "--no-first-run", "--allow-file-access-from-files", `--user-data-dir=${prof}`, "--virtual-time-budget=6000", "--run-all-compositor-stages-before-draw", ...extra, url], { encoding: "utf8", maxBuffer: 64 << 20 }).stdout || "";
const pngSize = (f) => { const b = fs.readFileSync(f); return [b.readUInt32BE(16), b.readUInt32BE(20)]; };
if (!CHROME) { console.error("Chrome not found - set CHROME"); process.exit(1); }
const report = [];
X.slides.forEach((s, i) => {
  if (ONLY && !ONLY.includes(i + 1)) return;
  const id = String(i + 1).padStart(2, "0"), hf = path.join(HTML, `${id}.html`);
  let html; try { html = page(s, i); } catch (e) { problems.push(`slide ${i + 1}: ${e.message}`); return; }
  fs.writeFileSync(hf, html); const url = pathToFileURL(hf).href;
  const m = chrome(["--dump-dom", "--window-size=1080,1350"], url).match(/QA(\{.*?\})QA/s);
  const q = m ? JSON.parse(m[1].replace(/&quot;/g, '"').replace(/&amp;/g, "&").replace(/&lt;/g, "<").replace(/&gt;/g, ">")) : { errors: ["QA did not run"], warns: [] };
  if (!NOSHOT) {
    const png = path.join(OUT, `${id}_${s.layout}.png`);
    for (const f of fs.readdirSync(OUT)) if (f.startsWith(id + "_") && f.endsWith(".png")) fs.unlinkSync(path.join(OUT, f));
    chrome([`--screenshot=${png}`, "--window-size=1080,1350", `--force-device-scale-factor=${HD ? 4 / 3 : 1}`], url);
    if (!fs.existsSync(png)) q.errors.push("screenshot failed"); else { const [w, h] = pngSize(png); if (w !== (HD ? 1440 : 1080) || h !== (HD ? 1800 : 1350)) q.errors.push(`size ${w}x${h}`); }
  }
  report.push({ slide: i + 1, layout: s.layout, ...q });
  console.log(`${id} ${s.layout.padEnd(11)} k=${q.k} min=${q.minFont}px words=${q.words}${q.errors.length ? "  ERROR " + q.errors.join("; ") : ""}${q.warns.length ? "  warn " + q.warns.join("; ") : ""}`);
});
if (!NOSHOT) {
  const pngs = fs.readdirSync(OUT).filter((f) => /^\d\d_.*\.png$/.test(f)).sort(), cols = 4, tw = 400, th = 500, g = 16;
  const sheet = path.join(HTML, "overview.html");
  fs.writeFileSync(sheet, `<!doctype html><body style="margin:0;background:#94A3B8;display:grid;grid-template-columns:repeat(${cols},${tw}px);gap:${g}px;padding:${g}px">${pngs.map((f) => `<img src="${pathToFileURL(path.join(OUT, f)).href}" style="width:${tw}px;height:${th}px;border-radius:10px">`).join("")}</body>`);
  chrome([`--screenshot=${path.join(OUT, "overview.png")}`, `--window-size=${cols * (tw + g) + g},${Math.ceil(pngs.length / cols) * (th + g) + g}`], pathToFileURL(sheet).href);
}

// ---------- thread package (X rules: 280 chars/post for standard accounts, max 4 images/post, alt <= 1000 chars) ----------
const T = X.thread || [];
const tlen = (t) => [...t.replace(/https?:\/\/\S+/g, "x".repeat(23))].length;
const used = T.flatMap((t) => t.images || []);
T.forEach((t, k) => { if (tlen(t.text) > 280) problems.push(`post ${k + 1} is ${tlen(t.text)} chars (> 280)`); if ((t.images || []).length > 4) problems.push(`post ${k + 1} has ${(t.images || []).length} images (max 4)`); });
X.slides.forEach((s, i) => { if (!s.alt) problems.push(`slide ${i + 1} missing alt`); else if (s.alt.length > 1000) problems.push(`slide ${i + 1} alt > 1000 chars`); if (T.length && !used.includes(i + 1)) problems.push(`slide ${i + 1} not attached to any post`); });
const files = fs.readdirSync(OUT).filter((f) => /^\d\d_.*\.png$/.test(f)).sort();
const md2 = [`# ${X.title} - X thread`, "", ...T.flatMap((t, k) => [`## Post ${k + 1}${k ? " (reply)" : ""}  ·  ${tlen(t.text)}/280`, "", t.text, "", ...(t.images || []).map((im) => `- image ${im}: \`${files[im - 1] || "?"}\`, alt: ${X.slides[im - 1]?.alt || "-"}`), ""]),
  "## Sources", "", ...(X.sources || []).map((s) => `- ${s}`), ""].join("\n");
fs.writeFileSync(path.join(OUT, "thread.md"), md2);
fs.writeFileSync(path.join(OUT, "qa.json"), JSON.stringify({ problems, slides: report }, null, 1));
for (const p of problems) console.log("DATA/THREAD ERROR", p);
const bad = report.filter((r) => r.errors.length).length + problems.length;
console.log(bad ? `\nQA: ${bad} problem(s)` : `\nQA: all ${report.length} cards + data checks + thread pass`, "->", OUT);
