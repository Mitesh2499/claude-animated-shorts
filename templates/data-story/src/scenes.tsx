// Code-drawn animated scenes for `kind: "scene"` sections (1080 x 1140 canvas under the word-synced header).
// Every scene gets t (s since section start), d (section length) and cue(word) = local time that word is spoken.
// Library v1 = an AI/RAG explainer set: pdfSwarm, chatFail, ingest, embed, vectorDb, retrieve, generate, chatAnswer.
import React from "react";
import { random, spring, staticFile } from "remotion";
import { Icon } from "./icon";
import POSTERS from "./posters.json";

export type SceneProps = { t: number; d: number; cue: (word: string, nth?: number) => number };
export const SW = 1080, SH = 1140;
const B = { navy: "#0B1220", blue: "#2563EB", cyan: "#06B6D4", amber: "#F59E0B", violet: "#8B5CF6", white: "#F8FAFC", red: "#E5252A", green: "#16A34A", ink: "#0f172a", grey: "#64748b", line: "#e2e8f0", slate: "#334155" };
const FONT = "Inter, 'Segoe UI', Arial, sans-serif", MONO = "'Cascadia Code', Consolas, monospace";
const cl = (x: number) => Math.max(0, Math.min(1, x));
const ease = (x: number) => 1 - Math.pow(1 - cl(x), 3);
const sp = (t: number, at: number, damping = 13, stiffness = 160) => spring({ frame: Math.max(0, (t - at) * 30), fps: 30, config: { damping, stiffness } });
const PDF = () => staticFile("brand/tool-logos/pdf.svg");

const Defs: React.FC = () => (
  <defs>
    <filter id="shadow" x="-20%" y="-20%" width="140%" height="160%"><feDropShadow dx="0" dy="14" stdDeviation="16" floodColor="#0f172a" floodOpacity="0.16" /></filter>
    <filter id="glow" x="-50%" y="-50%" width="200%" height="200%"><feGaussianBlur stdDeviation="8" /></filter>
    <linearGradient id="gBlue" x1="0" y1="0" x2="1" y2="1"><stop offset="0" stopColor="#3b82f6" /><stop offset="1" stopColor="#1d4ed8" /></linearGradient>
    <linearGradient id="gCyl" x1="0" y1="0" x2="1" y2="0"><stop offset="0" stopColor="#1e3a8a" /><stop offset="0.45" stopColor="#2563EB" /><stop offset="0.7" stopColor="#3b82f6" /><stop offset="1" stopColor="#1e3a8a" /></linearGradient>
  </defs>
);
const Stage: React.FC<{ n: string; text: string; color: string; t: number }> = ({ n, text, color, t }) => {
  const k = sp(t, 0.05);
  return <g transform={`translate(${40 - (1 - k) * 300},6)`}>
    <rect width={text.length * 15.5 + 96} height={56} rx={28} fill={color} />
    <circle cx={30} cy={28} r={18} fill="#fff" /><text x={30} y={37} textAnchor="middle" fontFamily={FONT} fontWeight={800} fontSize={24} fill={color}>{n}</text>
    <text x={62} y={38} fontFamily={FONT} fontWeight={800} fontSize={26} fill="#fff" letterSpacing={1}>{text}</text>
  </g>;
};
const Bubble: React.FC<{ x: number; y: number; w: number; h: number; fill: string; stroke?: string; children?: React.ReactNode; k?: number; ox?: number }> = ({ x, y, w, h, fill, stroke, children, k = 1, ox }) => (
  <g transform={`translate(${x + (ox ?? 0) * w},${y + h}) scale(${k}) translate(${-(ox ?? 0) * w},${-h})`} opacity={cl(k * 1.5)}>
    <rect width={w} height={h} rx={30} fill={fill} stroke={stroke} strokeWidth={stroke ? 3 : 0} filter="url(#shadow)" />{children}
  </g>
);
const ChunkCard: React.FC<{ x: number; y: number; w?: number; h?: number; color?: string; label?: string; k?: number; op?: number; seed?: number }> = ({ x, y, w = 300, h = 120, color = B.cyan, label, k = 1, op = 1, seed = 0 }) => (
  <g transform={`translate(${x + w / 2},${y + h / 2}) scale(${k}) translate(${-w / 2},${-h / 2})`} opacity={op}>
    <rect width={w} height={h} rx={16} fill="#fff" stroke={color} strokeWidth={3} filter="url(#shadow)" />
    <rect width={10} height={h} rx={5} fill={color} />
    {label ? <text x={26} y={34} fontFamily={MONO} fontSize={22} fontWeight={700} fill={color}>{label}</text> : null}
    {[0, 1, 2].map((i) => <rect key={i} x={26} y={(label ? 50 : 26) + i * 22} width={(w - 60) * (0.55 + random(`cw${seed}${i}`) * 0.45)} height={11} rx={5.5} fill="#cbd5e1" />)}
  </g>
);
const BotDisc: React.FC<{ x: number; y: number; r: number; rot?: number; k?: number }> = ({ x, y, r, rot = 0, k = 1 }) => (
  <g transform={`translate(${x},${y}) scale(${k}) rotate(${rot})`}>
    <circle r={r * 1.18} fill={B.blue} opacity={0.12} /><circle r={r} fill="url(#gBlue)" filter="url(#shadow)" />
    <Icon name="bot" x={-r * 0.62} y={-r * 0.66} size={r * 1.24} color="#fff" />
  </g>
);
const ChatHeader: React.FC<{ x: number; y: number; w: number }> = ({ x, y, w }) => (
  <g>
    <circle cx={x + 70} cy={y + 62} r={36} fill="url(#gBlue)" /><Icon name="bot" x={x + 44} y={y + 36} size={52} color="#fff" />
    <text x={x + 125} y={y + 56} fontFamily={FONT} fontWeight={800} fontSize={36} fill={B.ink}>Company Assistant</text>
    <circle cx={x + 133} cy={y + 88} r={7} fill={B.green} /><text x={x + 148} y={y + 96} fontFamily={FONT} fontSize={24} fill={B.grey}>online</text>
    <line x1={x} x2={x + w} y1={y + 124} y2={y + 124} stroke={B.line} strokeWidth={2} />
  </g>
);
const Q1 = "What's our hotel limit for", Q2 = "business travel?";

// 1. 500 PDFs flood the screen, counter to 500, a confused chatbot
export const pdfSwarm: React.FC<SceneProps> = ({ t, cue }) => {
  const T500 = Math.max(0.8, cue("500")), Tbot = cue("chatbot");
  const N = 500, cols = 25, cw = 41.6, ch = 47;
  let arrived = 0;
  const icons = Array.from({ length: N }).map((_, i) => {
    const a = 0.05 + Math.pow(i / N, 0.9) * (T500 + 1.5);   // the flood keeps coming for ~2 s after "500"
    const p = ease((t - a) / 0.5); if (t < a) return null;
    if (p > 0.6) arrived++;
    const gx = 20 + (i % cols) * cw, gy = 4 + Math.floor(i / cols) * ch;
    const ang = random(`a${i}`) * Math.PI * 2, sx = 540 + Math.cos(ang) * 950, sy = 560 + Math.sin(ang) * 1150;
    const x = sx + (gx - sx) * p, y = sy + (gy - sy) * p, r = (1 - p) * (random(`r${i}`) - 0.5) * 300;
    return <image key={i} href={PDF()} x={x} y={y} width={32} height={39} transform={`rotate(${r} ${x + 16} ${y + 20})`} />;
  });
  const dim = 0.6 * ease((t - Tbot + 0.25) / 0.4);
  const kc = sp(t, 0.15), kb = sp(t, Tbot - 0.15, 11, 140);
  const up = ease((t - Tbot + 0.2) / 0.5);
  return <svg width={SW} height={SH}><Defs />
    {icons}
    <rect width={SW} height={SH} fill="#f1f1f1" opacity={dim} />
    <g transform={`translate(540,${430 - up * 260}) scale(${kc * (1 - up * 0.25)})`}>
      <rect x={-230} y={-110} width={460} height={220} rx={36} fill="#fff" filter="url(#shadow)" />
      <image href={PDF()} x={-200} y={-62} width={100} height={124} />
      <text x={70} y={30} textAnchor="middle" fontFamily={FONT} fontWeight={800} fontSize={124} fill={B.red}>{Math.min(500, arrived)}</text>
      <text x={70} y={82} textAnchor="middle" fontFamily={FONT} fontWeight={700} fontSize={30} fill={B.grey}>company PDFs</text>
    </g>
    {t > Tbot - 0.2 ? <g>
      <BotDisc x={540} y={760} r={150} k={kb} rot={Math.sin(t * 5) * 9 * kb} />
      {["?", "?", "?"].map((q, i) => { const k = sp(t, Tbot + 0.15 + i * 0.18, 9, 200); return <text key={i} x={[700, 760, 650][i]} y={[600, 690, 560][i] + Math.sin(t * 4 + i) * 10} fontFamily={FONT} fontWeight={900} fontSize={[90, 64, 54][i] * k} fill={B.amber}>{q}</text>; })}
    </g> : null}
  </svg>;
};

// 2. The chatbot is asked about a private document and fails; training data never included the PDFs
export const chatFail: React.FC<SceneProps> = ({ t, cue }) => {
  const Tf = cue("fails") - 0.15, Ttr = cue("trained") - 0.1;
  const ku = sp(t, 0.1), kr = sp(t, Tf), shake = t > Tf ? Math.sin((t - Tf) * 42) * 14 * Math.exp(-(t - Tf) * 5) : 0;
  const typing = t > 0.75 && t < Tf;
  const rows: [string, boolean][] = [["Public web pages", true], ["Books & articles", true], ["Open-source code", true], ["Your 500 company PDFs", false]];
  return <svg width={SW} height={SH}><Defs />
    <rect x={50} y={10} width={980} height={700} rx={40} fill="#fff" filter="url(#shadow)" />
    <ChatHeader x={50} y={10} w={980} />
    <Bubble x={300} y={170} w={600} h={124} fill={B.blue} k={ku} ox={1}>
      <text x={34} y={52} fontFamily={FONT} fontSize={32} fontWeight={600} fill="#fff">{Q1}</text>
      <text x={34} y={96} fontFamily={FONT} fontSize={32} fontWeight={600} fill="#fff">{Q2}</text>
    </Bubble>
    <Icon name="circle-user" x={918} y={196} size={78} color={B.navy} opacity={ku} />
    <circle cx={110} cy={384} r={30} fill="url(#gBlue)" /><Icon name="bot" x={88} y={362} size={44} color="#fff" />
    {typing ? <g><rect x={160} y={340} width={150} height={84} rx={30} fill="#eef2f7" />{[0, 1, 2].map((i) => <circle key={i} cx={200 + i * 36} cy={382 - Math.max(0, Math.sin(t * 9 - i)) * 10} r={10} fill="#94a3b8" />)}</g> : null}
    {t > Tf ? <g transform={`translate(${shake},0)`}>
      <Bubble x={160} y={330} w={760} h={140} fill="#fff5f5" stroke={B.red} k={kr}>
        <Icon name="circle-x" x={26} y={38} size={62} color={B.red} />
        <text x={110} y={62} fontFamily={FONT} fontSize={32} fontWeight={600} fill={B.ink}>I don't have access to your</text>
        <text x={110} y={106} fontFamily={FONT} fontSize={32} fontWeight={600} fill={B.ink}>company's documents.</text>
      </Bubble>
      <g opacity={ease((t - Tf - 0.35) / 0.3)}><rect x={160} y={500} width={230} height={56} rx={28} fill={B.red} /><text x={275} y={538} textAnchor="middle" fontFamily={FONT} fontWeight={800} fontSize={28} fill="#fff">NO ANSWER</text></g>
    </g> : null}
    {t > Ttr ? <g opacity={ease((t - Ttr) / 0.3)} transform={`translate(0,${(1 - ease((t - Ttr) / 0.4)) * 60})`}>
      <rect x={50} y={750} width={980} height={380} rx={40} fill="#fff" filter="url(#shadow)" />
      <text x={100} y={818} fontFamily={FONT} fontWeight={800} fontSize={34} fill={B.ink}>What the model was trained on</text>
      {rows.map(([s, ok], i) => { const k = ease((t - Ttr - 0.2 - i * 0.22) / 0.25); return <g key={i} opacity={k} transform={`translate(${(1 - k) * 40},0)`}>
        <Icon name={ok ? "badge-check" : "circle-x"} x={100} y={846 + i * 66} size={48} color={ok ? B.green : B.red} />
        <text x={168} y={882 + i * 66} fontFamily={FONT} fontWeight={ok ? 600 : 800} fontSize={32} fill={ok ? B.ink : B.red} textDecoration={ok ? undefined : "line-through"}>{s}</text>
      </g>; })}
    </g> : null}
  </svg>;
};

// 3. Ingestion: PDFs -> extractor -> text -> cut into chunks
export const ingest: React.FC<SceneProps> = ({ t, cue }) => {
  const Tx = cue("extract") - 0.1, Tt = cue("text"), Ts = cue("split");
  const lines = ["Travel Policy 2025 - Section 4", "Hotels: up to $150 per night for", "business travel, booked via the", "company travel portal. Meals are", "reimbursed with itemised receipts."];
  const fly = Array.from({ length: 10 }).map((_, i) => { const a = 0.4 + i * 0.16; const p = ease((t - a) / 0.5); if (t < a || p >= 1) return null;
    return <image key={i} href={PDF()} x={500 + (random(`fx${i}`) - 0.5) * 300 * (1 - p)} y={110 + p * 230} width={70 * (1 - p * 0.6)} height={86 * (1 - p * 0.6)} opacity={1 - p * 0.7} />; });
  const scx = -120 + ease((t - Ts) / 0.55) * 1320;
  const fadeLines = 1 - ease((t - Ts - 0.25) / 0.35);
  const glow = 0.5 + Math.sin(t * 8) * 0.5;
  return <svg width={SW} height={SH}><Defs />
    <Stage n="1" text="INGESTION · RUNS ONCE" color={B.cyan} t={t} />
    {[-24, -14, -5, 4, 12, 22].map((r, i) => <image key={i} href={PDF()} x={430 + i * 24} y={84 + Math.abs(r) * 0.6} width={86} height={106} transform={`rotate(${r} ${473 + i * 24} 190)`} />)}
    <text x={720} y={170} fontFamily={FONT} fontWeight={800} fontSize={46} fill={B.red}>×500</text>
    {fly}
    <g transform={`translate(0,${(1 - sp(t, Tx - 0.3)) * 40})`}>
      <rect x={260} y={300} width={560} height={120} rx={32} fill={B.navy} filter="url(#shadow)" />
      <rect x={260} y={300} width={560} height={120} rx={32} fill="none" stroke={B.cyan} strokeWidth={4} opacity={t > Tx ? glow : 0.3} />
      <Icon name="file-search" x={292} y={326} size={68} color={B.cyan} />
      <text x={385} y={378} fontFamily={FONT} fontWeight={800} fontSize={40} fill="#fff">Extract text</text>
    </g>
    <g opacity={fadeLines}>{lines.map((s, i) => { const k = ease((t - Tt - i * 0.14) / 0.3); return <text key={i} x={170} y={490 + i * 46 + (1 - k) * -30} opacity={k} fontFamily={MONO} fontSize={30} fill={B.slate}>{s}</text>; })}</g>
    {t > Ts - 0.1 && t < Ts + 0.7 ? <g><line x1={0} x2={scx} y1={605} y2={605} stroke={B.cyan} strokeWidth={4} strokeDasharray="14 10" /><Icon name="scissors" x={scx - 40} y={565} size={80} color={B.cyan} rot={-90} /></g> : null}
    {Array.from({ length: 9 }).map((_, i) => { const k = sp(t, Ts + 0.3 + i * 0.09, 12, 180); return t > Ts + 0.25 ? <ChunkCard key={i} x={45 + (i % 3) * 335} y={700 + Math.floor(i / 3) * 145} w={315} h={125} label={`chunk ${String(i + 1).padStart(2, "0")}`} k={k} seed={i} /> : null; })}
  </svg>;
};

// 4. Embeddings: chunks -> embedding model -> vectors -> particles cluster by meaning
export const embed: React.FC<SceneProps> = ({ t, cue }) => {
  const Tm = cue("model") - 0.2, Tv = cue("vector") - 0.1, Tmean = cue("meaning");
  const vecs = ["[ 0.12, -0.48, 0.91, … ]", "[ 0.87, 0.05, -0.33, … ]", "[ -0.41, 0.66, 0.18, … ]"];
  const clusters = [{ x: 270, y: 760, c: B.violet, n: "HR" }, { x: 790, y: 720, c: B.amber, n: "Finance" }, { x: 560, y: 1000, c: B.cyan, n: "Travel" }];
  const conv = ease((t - (Tmean - 0.7)) / 1.0);
  const pts = Array.from({ length: 66 }).map((_, i) => { const cI = i % 3, cc = clusters[cI];
    const sx = 80 + random(`px${i}`) * 920, sy = 560 + random(`py${i}`) * 540, tx = cc.x + (random(`ox${i}`) - 0.5) * 230, ty = cc.y + (random(`oy${i}`) - 0.5) * 150;
    return { x: sx + (tx - sx) * conv + Math.sin(t * 2 + i) * 6 * (1 - conv), y: sy + (ty - sy) * conv + Math.cos(t * 2.3 + i) * 6 * (1 - conv), c: cc.c, cI }; });
  const kp = ease((t - 0.2) / 0.5);
  return <svg width={SW} height={SH}><Defs />
    {[0, 1, 2].map((i) => <ChunkCard key={i} x={30} y={20 + i * 150} w={320} h={120} label={`chunk ${String(i + 1).padStart(2, "0")}`} k={sp(t, 0.05 + i * 0.1)} seed={i + 3} />)}
    <g transform={`translate(540,215) scale(${sp(t, Tm)})`}>
      <rect x={-150} y={-120} width={300} height={240} rx={36} fill={B.navy} filter="url(#shadow)" />
      <Icon name="brain-circuit" x={-62} y={-98} size={124} color={B.cyan} />
      <text y={72} textAnchor="middle" fontFamily={FONT} fontWeight={800} fontSize={30} fill="#fff">Embedding</text>
      <text y={106} textAnchor="middle" fontFamily={FONT} fontWeight={800} fontSize={30} fill="#fff">model</text>
    </g>
    {[0, 1, 2].map((i) => { const k = ease((t - Tm - 0.1 - i * 0.12) / 0.35); return <path key={i} d={`M350,${80 + i * 150} C380,${80 + i * 150} 360,215 390,215`} stroke={B.cyan} strokeWidth={4} fill="none" strokeDasharray="8 8" opacity={k} />; })}
    {vecs.map((v, i) => { const k = ease((t - Tv - i * 0.16) / 0.35); return <g key={i} opacity={k} transform={`translate(${(1 - k) * -120},0)`}>
      <path d={`M690,215 C710,215 700,${80 + i * 150} 724,${80 + i * 150}`} stroke={B.cyan} strokeWidth={4} fill="none" />
      <rect x={724} y={40 + i * 150} width={336} height={80} rx={20} fill={B.navy} /><text x={892} y={92 + i * 150} textAnchor="middle" fontFamily={MONO} fontSize={25} fontWeight={700} fill={B.cyan}>{v}</text>
    </g>; })}
    <g opacity={kp}>
      <rect x={30} y={470} width={1020} height={660} rx={36} fill={B.navy} />
      {Array.from({ length: 9 }).map((_, i) => <line key={i} x1={30 + i * 127} x2={30 + i * 127} y1={470} y2={1130} stroke="#1e293b" strokeWidth={2} />)}
      {Array.from({ length: 5 }).map((_, i) => <line key={i} x1={30} x2={1050} y1={470 + i * 132} y2={470 + i * 132} stroke="#1e293b" strokeWidth={2} />)}
      <text x={66} y={522} fontFamily={FONT} fontWeight={700} fontSize={26} fill="#94a3b8">Embedding space · similar meaning = close together</text>
      {conv > 0.6 ? pts.map((p, i) => { const q = pts[(i + 3) % pts.length]; return q.cI === p.cI ? <line key={i} x1={p.x} y1={p.y} x2={q.x} y2={q.y} stroke={p.c} strokeWidth={2} opacity={(conv - 0.6) * 1.6} /> : null; }) : null}
      {pts.map((p, i) => <circle key={i} cx={p.x} cy={p.y} r={9} fill={p.c} />)}
      {clusters.map((c, i) => <g key={i} opacity={ease((conv - 0.75) * 4)}><rect x={c.x - 80} y={c.y - 120} width={160} height={46} rx={23} fill={c.c} /><text x={c.x} y={c.y - 88} textAnchor="middle" fontFamily={FONT} fontWeight={800} fontSize={26} fill="#fff">{c.n}</text></g>)}
    </g>
  </svg>;
};

// 5. Vector database cylinder filling with thousands of chunks
export const vectorDb: React.FC<SceneProps> = ({ t, cue }) => {
  const Tc = cue("thousands"), cx = 540, top = 230, h = 560, rx = 330, ry = 84;
  const count = Math.round(12480 * ease((t - 0.2) / Math.max(0.6, Tc + 0.6)));
  const fall = Array.from({ length: 90 }).map((_, i) => { const s = (i / 90) * 2.8 + 0.1; const y = -40 + (t - s) * 950; if (t < s || y > top) return null;
    const x = cx + (random(`fx${i}`) - 0.5) * 600 * (1 - (y + 40) / (top + 40) * 0.55);
    return <rect key={i} x={x - 14} y={y} width={28} height={20} rx={5} fill={i % 3 ? B.cyan : "#fff"} stroke={B.blue} strokeWidth={2} />; });
  const fill = ease((t - 0.3) / 2.4);
  const tags = ["HR", "Finance", "Travel", "Legal", "IT", "Sales"];
  return <svg width={SW} height={SH}><Defs />
    <g transform={`translate(0,${(1 - sp(t, 0)) * 80})`}>
      <path d={`M${cx - rx},${top} L${cx - rx},${top + h} A${rx},${ry} 0 0 0 ${cx + rx},${top + h} L${cx + rx},${top} Z`} fill="url(#gCyl)" filter="url(#shadow)" />
      {[0.33, 0.66].map((k, i) => <path key={i} d={`M${cx - rx},${top + h * k} A${rx},${ry} 0 0 0 ${cx + rx},${top + h * k}`} stroke="#93c5fd" strokeWidth={4} fill="none" opacity={0.7} />)}
      {Array.from({ length: 9 * 22 }).map((_, i) => { const r = Math.floor(i / 22), c = i % 22; const yy = top + h - 40 - r * 56; const shown = (r + 1) / 9 <= fill + 0.05;
        return shown ? <rect key={i} x={cx - rx + 40 + c * 27} y={yy} width={16} height={10} rx={3} fill={(i * 7) % 5 ? "#bfdbfe" : B.cyan} opacity={0.75} /> : null; })}
      <ellipse cx={cx} cy={top} rx={rx} ry={ry} fill="#60a5fa" />
      <ellipse cx={cx} cy={top} rx={rx - 26} ry={ry - 18} fill="#1e3a8a" />
      <ellipse cx={cx} cy={top} rx={rx - 26} ry={ry - 18} fill={B.cyan} opacity={0.25 + Math.sin(t * 6) * 0.15} />
    </g>
    {fall}
    {tags.map((s, i) => { const k = sp(t, 0.5 + i * 0.16); const L = i % 2 === 0; const x = L ? 40 : 880, y = 300 + Math.floor(i / 2) * 170 + Math.sin(t * 2 + i) * 8;
      return <g key={i} transform={`translate(${x + 80},${y}) scale(${k}) translate(-80,0)`}><rect width={160} height={56} rx={28} fill="#fff" stroke={B.blue} strokeWidth={3} filter="url(#shadow)" /><text x={80} y={38} textAnchor="middle" fontFamily={FONT} fontWeight={800} fontSize={26} fill={B.blue}>{s}</text></g>; })}
    <g transform={`translate(540,960) scale(${sp(t, 0.3)})`}>
      <Icon name="database" x={-300} y={-58} size={84} color={B.blue} />
      <text x={40} y={10} textAnchor="middle" fontFamily={FONT} fontWeight={800} fontSize={100} fill={B.ink}>{count.toLocaleString("en-US")}</text>
      <text x={40} y={66} textAnchor="middle" fontFamily={FONT} fontWeight={700} fontSize={32} fill={B.grey}>chunks indexed in the vector database</text>
    </g>
  </svg>;
};

// 6. Query time: question -> query vector -> search the index -> only 5 closest chunks
export const retrieve: React.FC<SceneProps> = ({ t, cue }) => {
  const Te = cue("embedded") - 0.1, Tc = cue("closest") - 0.25;
  const cols = 38, rows = 16, gx = 70, gy = 420, s = 25.5;
  const qx = 540, qy = 640;
  const picks = [[18, 8], [20, 9], [17, 10], [21, 7], [19, 11]].map(([c, r]) => c + r * cols);
  const scores = ["0.91", "0.88", "0.86", "0.84", "0.81"];
  const kq = ease((t - Te) / 0.4), drop = ease((t - Te - 0.7) / 0.5);
  const ring = t > Te + 1.1 ? ((t - Te - 1.1) % 1.1) / 1.1 : -1;
  const hit = ease((t - Tc) / 0.3);
  return <svg width={SW} height={SH}><Defs />
    <Stage n="2" text="QUERY TIME · EVERY QUESTION" color={B.violet} t={t} />
    <Icon name="circle-user" x={36} y={98} size={96} color={B.navy} opacity={sp(t, 0.1)} />
    <Bubble x={150} y={88} w={880} h={120} fill="#fff" k={sp(t, 0.15)}>
      <text x={32} y={52} fontFamily={FONT} fontSize={32} fontWeight={700} fill={B.ink}>{Q1}</text>
      <text x={32} y={94} fontFamily={FONT} fontSize={32} fontWeight={700} fill={B.ink}>{Q2}</text>
    </Bubble>
    <g opacity={kq * (1 - drop * 0.9)} transform={`translate(0,${(1 - kq) * -40 + drop * 260})`}>
      <rect x={200} y={240} width={680} height={78} rx={22} fill={B.violet} filter="url(#shadow)" />
      <text x={540} y={292} textAnchor="middle" fontFamily={MONO} fontWeight={700} fontSize={28} fill="#fff">query → [ 0.33, -0.12, 0.87, … ]</text>
    </g>
    <rect x={40} y={360} width={1000} height={520} rx={36} fill={B.navy} />
    <text x={78} y={406} fontFamily={FONT} fontWeight={700} fontSize={26} fill="#94a3b8">Vector database · 12,480 chunks</text>
    {Array.from({ length: cols * rows }).map((_, i) => { const c = i % cols, r = Math.floor(i / cols); const isPick = picks.includes(i);
      return <circle key={i} cx={gx + c * s} cy={gy + 22 + r * s * 1.1} r={isPick ? 5 + hit * 6 : 5} fill={isPick && hit > 0 ? B.violet : "#475569"} opacity={isPick ? 1 : 1 - hit * 0.65} />; })}
    {drop > 0 ? <g><circle cx={qx} cy={qy} r={14} fill={B.violet} /><circle cx={qx} cy={qy} r={30} fill={B.violet} opacity={0.35} filter="url(#glow)" /></g> : null}
    {ring >= 0 && hit < 1 ? <circle cx={qx} cy={qy} r={40 + ring * 420} fill="none" stroke={B.violet} strokeWidth={4} opacity={1 - ring} /> : null}
    {t > Te + 1.1 && hit < 1 ? <Icon name="search" x={qx - 60 + Math.cos(t * 5) * 240} y={qy - 60 + Math.sin(t * 5) * 120} size={90} color="#fff" /> : null}
    {hit > 0 ? picks.map((p, i) => { const c = p % cols, r = Math.floor(p / cols); const x = gx + c * s, y = gy + 22 + r * s * 1.1;
      return <g key={i}><line x1={qx} y1={qy} x2={x} y2={y} stroke={B.violet} strokeWidth={4} opacity={hit} /><circle cx={x} cy={y} r={20} fill="none" stroke={B.violet} strokeWidth={3} opacity={hit * (0.5 + Math.sin(t * 8 + i) * 0.5)} /></g>; }) : null}
    {picks.map((p, i) => { const k = ease((t - Tc - 0.45 - i * 0.1) / 0.45); if (k <= 0) return null; const c = p % cols, r = Math.floor(p / cols);
      const sx = gx + c * s - 90, sy = gy + r * s * 1.1, tx = 30 + i * 207, ty = 920; const x = sx + (tx - sx) * k, y = sy + (ty - sy) * k;
      return <ChunkCard key={i} x={x} y={y} w={190} h={170} color={B.violet} label={`#${i + 1} ${scores[i]}`} k={0.6 + 0.4 * k} seed={i + 20} />; })}
  </svg>;
};

// 7. Generation: the 5 chunks + question go into the prompt -> LLM -> grounded answer; no retraining, never all 500 PDFs
export const generate: React.FC<SceneProps> = ({ t, cue }) => {
  const Tp = cue("prompt") - 0.3, Ta = cue("answers") - 0.1, Tr = cue("retraining") - 0.1, Tn = cue("never") - 0.1;
  const node = { x: 720, y: 330 };
  const ans = "Hotels are covered up to $150 per night on business trips.";
  const shown = Math.floor(Math.max(0, t - Ta) * 42);
  const wrap = (s: string) => { const out: string[] = []; let cur = ""; s.split(" ").forEach((w) => { if ((cur + " " + w).trim().length > 30) { out.push(cur.trim()); cur = w; } else cur += " " + w; }); out.push(cur.trim()); return out; };
  const pulse = t > Tp + 0.6 ? 1 + Math.sin(t * 9) * 0.04 : 1;
  let budget = shown;
  return <svg width={SW} height={SH}><Defs />
    {[0, 1, 2, 3, 4].map((i) => <ChunkCard key={i} x={30} y={30 + i * 126} w={300} h={104} color={B.violet} label={`#${i + 1}`} k={sp(t, i * 0.07)} seed={i + 20} />)}
    {[0, 1, 2, 3, 4].map((i) => { const k = ease((t - Tp - i * 0.1) / 0.4); const d = `M330,${82 + i * 126} C470,${82 + i * 126} 470,${node.y} ${node.x - 150},${node.y}`;
      return <g key={i}><path d={d} pathLength={1} stroke={B.violet} strokeWidth={5} fill="none" strokeDasharray={`${k} 1`} />
        {k >= 1 ? <path d={d} pathLength={1} stroke="#fff" strokeWidth={5} fill="none" strokeDasharray="0.04 0.22" strokeDashoffset={-t * 0.8} /> : null}</g>; })}
    <g opacity={ease((t - Tp) / 0.3)}><rect x={500} y={60} width={440} height={58} rx={29} fill="#fff" stroke={B.violet} strokeWidth={3} /><text x={720} y={99} textAnchor="middle" fontFamily={FONT} fontWeight={800} fontSize={26} fill={B.violet}>prompt = question + 5 chunks</text></g>
    <g transform={`translate(${node.x},${node.y}) scale(${sp(t, 0.1) * pulse})`}>
      <circle r={185} fill={B.blue} opacity={0.1} /><circle r={150} fill="url(#gBlue)" filter="url(#shadow)" />
      <Icon name="sparkles" x={-62} y={-92} size={124} color="#fff" />
      <text y={80} textAnchor="middle" fontFamily={FONT} fontWeight={900} fontSize={48} fill="#fff">LLM</text>
    </g>
    {t > Ta ? <g>
      <path d={`M${node.x},${node.y + 150} L${node.x},560`} stroke={B.blue} strokeWidth={5} strokeDasharray="10 8" />
      <Bubble x={360} y={560} w={680} h={230} fill="#fff" k={sp(t, Ta)}>
        <Icon name="sparkles" x={28} y={22} size={44} color={B.blue} /><text x={84} y={56} fontFamily={FONT} fontWeight={800} fontSize={28} fill={B.blue}>Grounded answer</text>
        {wrap(ans).map((ln, i) => { const s = ln.slice(0, Math.max(0, budget)); budget -= ln.length + 1; return <text key={i} x={30} y={112 + i * 44} fontFamily={FONT} fontWeight={600} fontSize={32} fill={B.ink}>{s}</text>; })}
      </Bubble>
    </g> : null}
    {t > Tr ? <g transform={`translate(30,${840 + (1 - sp(t, Tr)) * 60})`} opacity={ease((t - Tr) / 0.25)}>
      <rect width={490} height={110} rx={28} fill="#fff" filter="url(#shadow)" />
      <Icon name="badge-check" x={26} y={26} size={58} color={B.green} />
      <text x={100} y={50} fontFamily={FONT} fontWeight={800} fontSize={30} fill={B.ink}>Model weights</text><text x={100} y={88} fontFamily={FONT} fontWeight={600} fontSize={28} fill={B.green}>unchanged</text>
    </g> : null}
    {t > Tn ? <g transform={`translate(550,${840 + (1 - sp(t, Tn)) * 60})`} opacity={ease((t - Tn) / 0.25)}>
      <rect width={500} height={110} rx={28} fill="#fff" filter="url(#shadow)" />
      {[0, 1, 2].map((i) => <image key={i} href={PDF()} x={24 + i * 22} y={22} width={54} height={66} />)}
      <Icon name="circle-x" x={60} y={30} size={60} color={B.red} />
      <text x={150} y={50} fontFamily={FONT} fontWeight={800} fontSize={30} fill={B.ink}>500 PDFs</text><text x={150} y={88} fontFamily={FONT} fontWeight={600} fontSize={28} fill={B.red}>never sent to the model</text>
    </g> : null}
  </svg>;
};

// 8. Final chat answer with a clickable source citation and the cited page
export const chatAnswer: React.FC<SceneProps> = ({ t, cue }) => {
  const lines = ["Business-travel hotels are covered", "up to $150 per night, booked through", "the company travel portal."];
  const Tc = Math.max(1.6, cue("source") - 0.2);
  let budget = Math.floor(Math.max(0, t - 0.35) * 60);
  const cur = ease((t - Tc - 0.25) / 0.7), click = t > Tc + 0.95 ? ease((t - Tc - 0.95) / 0.25) : 0;
  const cx0 = 940, cy0 = 1080, cx1 = 560, cy1 = 700;
  const px = cx0 + (cx1 - cx0) * cur, py = cy0 + (cy1 - cy0) * cur;
  const press = click > 0 && click < 1 ? 0.96 : 1;
  const kp = sp(t, Tc + 1.15);
  return <svg width={SW} height={SH}><Defs />
    <rect x={40} y={10} width={1000} height={1110} rx={44} fill="#fff" filter="url(#shadow)" />
    <ChatHeader x={40} y={10} w={1000} />
    <Bubble x={290} y={160} w={630} h={120} fill={B.blue} k={sp(t, 0.05)} ox={1}>
      <text x={34} y={52} fontFamily={FONT} fontSize={32} fontWeight={600} fill="#fff">{Q1}</text><text x={34} y={96} fontFamily={FONT} fontSize={32} fontWeight={600} fill="#fff">{Q2}</text>
    </Bubble>
    <Icon name="circle-user" x={934} y={182} size={76} color={B.navy} />
    <circle cx={100} cy={350} r={32} fill="url(#gBlue)" /><Icon name="bot" x={77} y={327} size={46} color="#fff" />
    <Bubble x={150} y={310} w={850} h={190} fill="#f1f5f9" k={sp(t, 0.25)}>
      {lines.map((ln, i) => { const s = ln.slice(0, Math.max(0, budget)); budget -= ln.length; return <text key={i} x={34} y={58 + i * 46} fontFamily={FONT} fontSize={32} fontWeight={600} fill={B.ink}>{s}</text>; })}
    </Bubble>
    <g transform={`translate(150,${530}) scale(${sp(t, Tc - 0.3) * press})`} opacity={cl((t - Tc + 0.3) * 4)}>
      <rect width={700} height={96} rx={26} fill="#eff6ff" stroke={B.blue} strokeWidth={3} />
      <image href={PDF()} x={22} y={16} width={52} height={64} />
      <text x={92} y={60} fontFamily={FONT} fontWeight={800} fontSize={30} fill={B.blue} textDecoration="underline">Travel-Policy-2025.pdf · page 4</text>
      <Icon name="external-link" x={640} y={28} size={40} color={B.blue} />
    </g>
    <g opacity={ease((t - Tc - 0.3) / 0.3)}><Icon name="badge-check" x={150} y={650} size={46} color={B.green} /><text x={208} y={684} fontFamily={FONT} fontWeight={700} fontSize={28} fill={B.green}>Answer verified against the source</text></g>
    {click > 0 ? <circle cx={cx1} cy={cy1 - 120} r={20 + click * 70} fill="none" stroke={B.blue} strokeWidth={4} opacity={1 - click} /> : null}
    {t > Tc + 1.1 ? <g transform={`translate(520,${740 + (1 - kp) * 300})`} opacity={cl(kp * 2)}>
      <rect width={480} height={360} rx={18} fill="#fff" stroke="#cbd5e1" strokeWidth={3} filter="url(#shadow)" />
      <rect width={480} height={52} rx={18} fill="#f1f5f9" /><image href={PDF()} x={16} y={9} width={28} height={35} /><text x={56} y={35} fontFamily={FONT} fontWeight={700} fontSize={22} fill={B.slate}>Travel-Policy-2025.pdf · p.4</text>
      {[0, 1, 2, 3, 4, 5].map((i) => <rect key={i} x={30} y={84 + i * 40} width={i === 2 ? 420 : 300 + random(`pg${i}`) * 120} height={14} rx={7} fill="#cbd5e1" />)}
      <rect x={22} y={150} width={436} height={82} rx={10} fill="#fde68a" opacity={0.85} />
      <text x={36} y={188} fontFamily={FONT} fontWeight={800} fontSize={24} fill={B.ink}>4.2 Hotels: up to $150 per night,</text>
      <text x={36} y={220} fontFamily={FONT} fontWeight={800} fontSize={24} fill={B.ink}>booked via the travel portal.</text>
    </g> : null}
    {cur > 0 ? <path transform={`translate(${px},${py - 120}) scale(${click > 0 && click < 1 ? 0.88 : 1})`} d="M0,0 L0,58 L15,44 L26,70 L36,66 L25,40 L45,40 Z" fill="#fff" stroke={B.ink} strokeWidth={4} strokeLinejoin="round" /> : null}
  </svg>;
};


// 1b. Hook "I uploaded 500 PDFs to my chatbot... and it crashed": swarm + counter, the bot swallows the PDFs, crash, error dialog, PDFs spill
export const pdfCrash: React.FC<SceneProps> = ({ t, cue }) => {
  const T500 = Math.max(0.6, cue("500")), Tbot = cue("chatbot"), Tc = cue("crashed") - 0.12, Tw = cue("window");
  const N = 500, cols = 25, cw = 41.6, ch = 47, bx = 540, by = 700;
  let arrived = 0;
  const icons = Array.from({ length: N }).map((_, i) => {
    const a = 0.05 + Math.pow(i / N, 0.9) * (T500 + 1.1);
    if (t < a) return null;
    const p = ease((t - a) / 0.45); if (p > 0.6) arrived++;
    const gx = 20 + (i % cols) * cw, gy = 4 + Math.floor(i / cols) * ch;
    const ang = random(`a${i}`) * Math.PI * 2, sx = 540 + Math.cos(ang) * 950, sy = 560 + Math.sin(ang) * 1150;
    let x = sx + (gx - sx) * p, y = sy + (gy - sy) * p, sc = 1, r = (1 - p) * (random(`r${i}`) - 0.5) * 300, op = 1;
    // sucked into the bot after it appears (staggered), then spat out and falling after the crash
    const suck = ease((t - (Tbot + 0.1 + random(`s${i}`) * (Tc - Tbot - 0.35))) / 0.4);
    if (suck > 0) { x += (bx - 16 - x) * suck; y += (by - 20 - y) * suck; sc = 1 - suck * 0.7; op = 1 - suck * 0.8; }
    if (t > Tc) { const k = t - Tc, vx = (random(`vx${i}`) - 0.5) * 1400, vy = -300 - random(`vy${i}`) * 900;
      x = bx - 16 + vx * k; y = by - 20 + vy * k + 0.5 * 2600 * k * k; sc = 0.9; op = 1; r = k * (random(`rr${i}`) - 0.5) * 900; }
    return <image key={i} href={PDF()} x={x} y={y} width={32 * sc} height={39 * sc} opacity={op} transform={`rotate(${r} ${x + 16} ${y + 20})`} />;
  });
  const kc = sp(t, 0.15), up = ease((t - Tbot + 0.2) / 0.5);
  const kb = sp(t, Tbot - 0.15, 11, 140), crash = t > Tc ? 1 : 0;
  const shake = crash ? Math.sin((t - Tc) * 55) * 22 * Math.exp(-(t - Tc) * 3.5) : Math.sin(t * 30) * 3 * ease((t - Tbot - 0.3) / 0.5);
  const swell = 1 + ease((t - Tbot - 0.2) / Math.max(0.3, Tc - Tbot - 0.2)) * 0.18 * (1 - crash);
  const ke = sp(t, Tc + 0.15, 12, 170);
  return <svg width={SW} height={SH}><Defs />
    <rect width={SW} height={SH} fill="#f1f1f1" opacity={0.55 * ease((t - Tbot + 0.25) / 0.4)} />
    {icons}
    <g transform={`translate(540,${430 - up * 300}) scale(${kc * (1 - up * 0.3)})`}>
      <rect x={-230} y={-110} width={460} height={220} rx={36} fill="#fff" filter="url(#shadow)" />
      <image href={PDF()} x={-200} y={-62} width={100} height={124} />
      <text x={70} y={30} textAnchor="middle" fontFamily={FONT} fontWeight={800} fontSize={124} fill={B.red}>{Math.min(500, arrived)}</text>
      <text x={70} y={82} textAnchor="middle" fontFamily={FONT} fontWeight={700} fontSize={30} fill={B.grey}>company PDFs</text>
    </g>
    {t > Tbot - 0.2 ? <g transform={`translate(${shake},0)`}>
      <g transform={`translate(${bx},${by}) scale(${kb * swell})`}>
        <circle r={180} fill={crash ? B.red : B.blue} opacity={0.14} />
        <circle r={150} fill={crash ? B.red : "url(#gBlue)"} filter="url(#shadow)" />
        <Icon name={crash ? "circle-x" : "bot"} x={-93} y={-98} size={186} color="#fff" />
      </g>
      {crash ? Array.from({ length: 10 }).map((_, i) => { const a = (i / 10) * Math.PI * 2, k = ease((t - Tc) / 0.35);
        return <line key={i} x1={bx + Math.cos(a) * 170} y1={by + Math.sin(a) * 170} x2={bx + Math.cos(a) * (170 + 110 * k)} y2={by + Math.sin(a) * (170 + 110 * k)} stroke={B.amber} strokeWidth={10} strokeLinecap="round" opacity={1 - ease((t - Tc - 0.3) / 0.4)} />; }) : null}
    </g> : null}
    {crash ? <g transform={`translate(540,${360}) scale(${ke})`}>
      <rect x={-440} y={-120} width={880} height={240} rx={30} fill="#fff" stroke={B.red} strokeWidth={4} filter="url(#shadow)" />
      <rect x={-440} y={-120} width={880} height={70} rx={30} fill={B.red} /><rect x={-440} y={-80} width={880} height={30} fill={B.red} />
      <Icon name="circle-x" x={-410} y={-110} size={50} color="#fff" />
      <text x={-345} y={-72} fontFamily={FONT} fontWeight={800} fontSize={32} fill="#fff">Error · request failed</text>
      <text x={-400} y={10} fontFamily={MONO} fontWeight={700} fontSize={32} fill={B.ink}>Input too large:</text>
      <text x={-400} y={60} fontFamily={MONO} fontWeight={700} fontSize={32} fill={t > Tw - 0.2 ? B.red : B.ink}>context window exceeded</text>
    </g> : null}
  </svg>;
};


// ============================================================== Library v2: "stale knowledge" episode (Reel 04)
const GREEN = "#16A34A";
/** bg: solid plate behind the stamp - use it whenever the stamp sits on a photo (keeps the text >= 4.5:1) */
const Stamp: React.FC<{ x: number; y: number; text: string; color: string; k: number; rot?: number; size?: number; bg?: string }> = ({ x, y, text, color, k, rot = -8, size = 64, bg }) => {
  const s = 1 + (1 - k) * 1.4;
  return <g transform={`translate(${x},${y}) rotate(${rot}) scale(${s})`} opacity={cl(k * 1.6)}>
    <rect x={-text.length * size * 0.33 - 30} y={-size * 0.85} width={text.length * size * 0.66 + 60} height={size * 1.4} rx={14} fill={bg ?? "none"} stroke={color} strokeWidth={8} />
    <text textAnchor="middle" y={size * 0.32} fontFamily={FONT} fontWeight={900} fontSize={size} fill={color} letterSpacing={3}>{text}</text>
  </g>;
};
const Glitch: React.FC<{ t: number; at: number; children: React.ReactNode }> = ({ t, at, children }) => {
  const g = t > at && t < at + 0.45 ? 1 : 0; const j = Math.floor(t * 30);
  const dx = g ? (random(`gx${j}`) - 0.5) * 30 : 0, dy = g ? (random(`gy${j}`) - 0.5) * 12 : 0;
  return <g>{g ? <g opacity={0.5} transform={`translate(${dx + 10},${dy})`} style={{ filter: "hue-rotate(140deg)" }}>{children}</g> : null}<g transform={`translate(${-dx},${-dy})`}>{children}</g></g>;
};
const PdfCard: React.FC<{ x: number; y: number; w: number; name: string; l1: string; l2?: string; foot?: string; color?: string; k?: number; dim?: number }> = ({ x, y, w, name, l1, l2, foot, color = B.ink, k = 1, dim = 0 }) => (
  <g transform={`translate(${x + w / 2},${y}) scale(${k}) translate(${-w / 2},0)`} opacity={cl(k * 1.5) * (1 - dim * 0.6)}>
    <rect width={w} height={foot ? 210 : 170} rx={26} fill="#fff" filter="url(#shadow)" />
    <image href={PDF()} x={24} y={26} width={86} height={106} />
    <text x={130} y={64} fontFamily={MONO} fontWeight={700} fontSize={28} fill={B.slate}>{name}</text>
    <text x={130} y={112} fontFamily={FONT} fontWeight={800} fontSize={36} fill={color}>{l1}</text>
    {l2 ? <text x={130} y={150} fontFamily={FONT} fontWeight={600} fontSize={26} fill={B.grey}>{l2}</text> : null}
    {foot ? <g><Icon name="circle-check" x={128} y={166} size={34} color={GREEN} /><text x={172} y={192} fontFamily={FONT} fontWeight={700} fontSize={24} fill={GREEN}>{foot}</text></g> : null}
  </g>
);
const Card3: React.FC<{ y: number; icon: string; color: string; title: string; sub: string; on: number; lock?: number; glow?: number; status?: string }> = ({ y, icon, color, title, sub, on, lock = 0, glow = 0, status }) => (
  <g transform={`translate(0,${(1 - on) * 40})`} opacity={0.35 + 0.65 * on}>
    <rect x={40} y={y} width={1000} height={300} rx={36} fill="#fff" stroke={on > 0.5 ? color : "#e2e8f0"} strokeWidth={on > 0.5 ? 5 : 3} filter="url(#shadow)" />
    {glow > 0 ? <rect x={40} y={y} width={1000} height={300} rx={36} fill={GREEN} opacity={0.12 * glow} /> : null}
    <circle cx={180} cy={y + 150} r={100} fill={color} opacity={0.12} /><Icon name={icon} x={110} y={y + 80} size={140} color={color} />
    <text x={320} y={y + 130} fontFamily={FONT} fontWeight={900} fontSize={54} fill={B.ink}>{title}</text>
    <text x={320} y={y + 190} fontFamily={FONT} fontWeight={600} fontSize={32} fill={B.grey}>{sub}</text>
    {lock > 0 ? <g opacity={lock} transform={`translate(860,${y + 30})`}><circle cx={60} cy={60} r={62} fill={B.navy} /><Icon name="lock" x={18} y={16} size={84} color="#fff" /></g> : null}
    {status ? <g opacity={on}><rect x={320} y={y + 218} width={status.length * 15 + 40} height={50} rx={25} fill={lock ? B.navy : GREEN} /><text x={340} y={y + 252} fontFamily={FONT} fontWeight={800} fontSize={26} fill="#fff">{status}</text></g> : null}
  </g>
);

// 1. "The chatbot I built just lied to me."
export const liedStamp: React.FC<SceneProps> = ({ t, cue }) => {
  const Tl = cue("lied") - 0.1; const kb = sp(t, 0.02, 12, 120), ks = sp(t, Tl, 9, 260);
  const shake = t > Tl ? Math.sin((t - Tl) * 60) * 18 * Math.exp(-(t - Tl) * 4) : 0;
  return <svg width={SW} height={SH}><Defs />
    <g transform={`translate(${shake},0)`}>
      <Glitch t={t} at={Tl}><BotDisc x={540} y={470} r={260} k={kb} /></Glitch>
      {t > Tl ? <Stamp x={540} y={520} text="WRONG ANSWER" color={B.red} k={ks} rot={-10} size={84} /> : null}
    </g>
    {t > Tl ? <g opacity={ease((t - Tl - 0.3) / 0.3)}><Icon name="triangle-alert" x={470} y={860} size={140} color={B.red} /></g> : null}
  </svg>;
};

// 2. Personal story: asked leave days -> "18" -> I uploaded the 24-day PDF myself
export const leaveChat: React.FC<SceneProps> = ({ t, cue }) => {
  const Ta = cue("said") - 0.1, T18b = cue("18", 2), T24 = cue("24"), Tme = cue("myself") - 0.1;
  const typing = t > 0.6 && t < Ta; const ka = sp(t, Ta);
  const zoom = t > T18b - 0.1 && t < T24 ? 1 + 0.1 * ease((t - T18b + 0.1) / 0.25) : 1;
  return <svg width={SW} height={SH}><Defs />
    <g transform={`translate(500,360) scale(${zoom}) translate(-500,-360)`}>
      <rect x={50} y={10} width={980} height={620} rx={40} fill="#fff" filter="url(#shadow)" />
      <ChatHeader x={50} y={10} w={980} />
      <Bubble x={280} y={165} w={640} h={90} fill={B.blue} k={sp(t, 0.1)} ox={1}>
        <text x={32} y={58} fontFamily={FONT} fontSize={34} fontWeight={600} fill="#fff">How many leave days do I get?</text>
      </Bubble>
      <Icon name="circle-user" x={930} y={172} size={78} color={B.navy} />
      <circle cx={110} cy={330} r={30} fill="url(#gBlue)" /><Icon name="bot" x={88} y={308} size={44} color="#fff" />
      {typing ? <g><rect x={160} y={290} width={150} height={84} rx={30} fill="#eef2f7" />{[0, 1, 2].map((i) => <circle key={i} cx={200 + i * 36} cy={332 - Math.max(0, Math.sin(t * 9 - i)) * 10} r={10} fill="#94a3b8" />)}</g> : null}
      {t > Ta ? <Bubble x={160} y={285} w={700} h={130} fill="#f1f5f9" k={ka}>
        <text x={34} y={82} fontFamily={FONT} fontSize={38} fontWeight={600} fill={B.ink}>You get <tspan fontWeight={900} fontSize={64} fill={B.red}>18 days</tspan> per year.</text>
      </Bubble> : null}
    </g>
    {t > T24 - 0.1 ? <PdfCard x={50} y={700} w={980} name="HR_Policy_v2.pdf" l1="Annual leave: 24 days" l2="New policy · effective Dec 1" foot="uploaded by Mitesh · yesterday 6:42 pm" color={B.blue} k={sp(t, T24 - 0.1, 10, 220)} /> : null}
    {t > Tme ? <g transform={`translate(890,640) scale(${sp(t, Tme, 9, 240)})`}><circle r={62} fill={B.red} /><Icon name="circle-x" x={-50} y={-50} size={100} color="#fff" /></g> : null}
  </svg>;
};

// 3. "So... do I need to retrain the AI?"
export const retrainQ: React.FC<SceneProps> = ({ t }) => {
  const k = sp(t, 0.05, 11, 150);
  return <svg width={SW} height={SH}><Defs />
    <g transform={`translate(540,500) scale(${k}) rotate(${Math.sin(t * 5) * 4})`}>
      <circle r={300} fill={B.violet} opacity={0.1} /><circle r={250} fill={B.navy} filter="url(#shadow)" />
      <Icon name="brain-circuit" x={-150} y={-160} size={300} color={B.violet} />
      <g transform={`translate(170,-170) rotate(${t * 140})`}><Icon name="refresh-cw" x={-55} y={-55} size={110} color={B.amber} /></g>
    </g>
    <g transform={`translate(540,880) scale(${sp(t, 0.35, 10, 200)})`}>
      <rect x={-200} y={-55} width={400} height={110} rx={55} fill={B.amber} /><text y={22} textAnchor="middle" fontFamily={FONT} fontWeight={900} fontSize={60} fill="#fff">RETRAIN?</text>
    </g>
  </svg>;
};

// 4. Three separate places: brain (weights) / library (index) / desk (context)
export const threePlaces: React.FC<SceneProps> = ({ t, cue }) => {
  const Tb = cue("brain") - 0.15, Tl = cue("library") - 0.15, Td = cue("desk") - 0.15;
  return <svg width={SW} height={SH}><Defs />
    <Card3 y={20} icon="brain-circuit" color={B.violet} title="Model weights" sub="the brain · learned in training" on={ease((t - Tb) / 0.3)} lock={ease((t - Td - 0.6) / 0.3)} status={t > Td + 0.6 ? "a PDF never changes this" : undefined} />
    <Card3 y={380} icon="database" color={B.blue} title="Vector index" sub="the library · your documents" on={ease((t - Tl) / 0.3)} />
    <Card3 y={740} icon="file-text" color={B.cyan} title="Context" sub="the pages on the desk · per question" on={ease((t - Td) / 0.3)} />
  </svg>;
};

// 5. Uploading a PDF doesn't update the library: storage has v2, index still serves v1
export const notSynced: React.FC<SceneProps> = ({ t, cue }) => {
  const Tu = 0.1, Tb = cue("update") - 0.1, To = cue("old") - 0.2;
  const drop = ease((t - Tu) / 0.5);
  return <svg width={SW} height={SH}><Defs />
    <g transform={`translate(40,60)`}>
      <rect width={440} height={460} rx={36} fill="#fff" filter="url(#shadow)" />
      <Icon name="folder" x={30} y={26} size={70} color={B.amber} /><text x={118} y={74} fontFamily={MONO} fontWeight={700} fontSize={32} fill={B.ink}>storage/</text>
      <image href={PDF()} x={150} y={130 + (1 - drop) * -300} width={140} height={172} opacity={drop} />
      <text x={220} y={350} textAnchor="middle" fontFamily={MONO} fontWeight={700} fontSize={26} fill={B.blue}>HR_Policy_v2.pdf</text>
      {drop >= 1 ? <g><Icon name="circle-check" x={170} y={372} size={44} color={GREEN} /><text x={222} y={404} fontFamily={FONT} fontWeight={800} fontSize={26} fill={GREEN}>saved</text></g> : null}
    </g>
    <g transform={`translate(600,60)`}>
      <rect width={440} height={460} rx={36} fill={B.navy} filter="url(#shadow)" />
      <Icon name="database" x={30} y={26} size={70} color={B.cyan} /><text x={118} y={74} fontFamily={FONT} fontWeight={800} fontSize={32} fill="#fff">Vector index</text>
      {["Annual leave: 18 days", "Sick leave policy", "Holiday calendar"].map((s, i) => { const hot = i === 0 && t > To;
        return <g key={i}><rect x={28} y={120 + i * 105} width={384} height={86} rx={18} fill={hot ? B.amber : "#1e293b"} stroke={hot ? "#fff" : "#334155"} strokeWidth={3} />
          <text x={48} y={152 + i * 105} fontFamily={MONO} fontSize={20} fontWeight={700} fill={hot ? B.navy : "#94a3b8"}>{i === 0 ? "v1 · OLD" : "chunk"}</text>
          <text x={48} y={186 + i * 105} fontFamily={FONT} fontSize={26} fontWeight={800} fill={hot ? B.navy : "#e2e8f0"}>{s}</text></g>; })}
    </g>
    <path d="M480,290 L600,290" stroke={t > Tb ? B.red : B.grey} strokeWidth={6} strokeDasharray="14 12" />
    {t > Tb ? <g transform={`translate(540,290) scale(${sp(t, Tb, 9, 240)})`}><circle r={44} fill={B.red} /><Icon name="circle-x" x={-34} y={-34} size={68} color="#fff" /></g> : null}
    {t > Tb ? <g transform={`translate(540,640) scale(${sp(t, Tb + 0.15)})`}><rect x={-230} y={-50} width={460} height={100} rx={50} fill={B.red} /><text y={18} textAnchor="middle" fontFamily={FONT} fontWeight={900} fontSize={50} fill="#fff">NOT SYNCED</text></g> : null}
    {t > To ? <g opacity={ease((t - To) / 0.3)}>
      <g transform="translate(540,830)"><rect x={-360} y={-60} width={720} height={120} rx={30} fill="#fff" filter="url(#shadow)" /><Icon name="search" x={-330} y={-38} size={76} color={B.violet} />
        <text x={-235} y={-6} fontFamily={FONT} fontWeight={800} fontSize={30} fill={B.ink}>search: leave days</text><text x={-235} y={34} fontFamily={FONT} fontWeight={700} fontSize={28} fill={B.amber}>→ found "18 days" (old)</text></g>
      <path d="M720,770 C760,700 780,620 800,560" stroke={B.amber} strokeWidth={6} fill="none" strokeDasharray="10 8" />
    </g> : null}
  </svg>;
};

// 6. Sync pipeline: detect -> extract -> chunk -> embed (same model) -> update index
export const syncPipeline: React.FC<SceneProps> = ({ t, cue }) => {
  const steps = [["detect", "file-search", "Detect the change", "HR_Policy_v2.pdf modified"], ["extract", "file-text", "Extract text", "text + tables + headings"], ["chunk", "scissors", "Chunk", "split into passages"], ["embed", "brain-circuit", "Embed", "same embedding model · not retrained"], ["update", "database", "Update the index", "upsert new chunks"]] as const;
  return <svg width={SW} height={SH}><Defs />
    <Stage n="↻" text="SYNC PIPELINE" color={B.cyan} t={t} />
    <line x1={130} x2={130} y1={150} y2={150 + 4 * 190} stroke="#cbd5e1" strokeWidth={6} />
    {steps.map(([w, icon, title, sub], i) => { const at = cue(w) - 0.12, k = ease((t - at) / 0.3), done = t > at + 0.35;
      return <g key={i} transform={`translate(${(1 - k) * 60},0)`} opacity={0.3 + 0.7 * k}>
        <rect x={40} y={90 + i * 190} width={1000} height={160} rx={30} fill="#fff" stroke={k > 0.5 ? B.cyan : "#e2e8f0"} strokeWidth={4} filter="url(#shadow)" />
        <circle cx={130} cy={170 + i * 190} r={58} fill={k > 0.5 ? B.cyan : "#e2e8f0"} /><Icon name={icon} x={92} y={132 + i * 190} size={76} color="#fff" />
        <text x={220} y={160 + i * 190} fontFamily={FONT} fontWeight={900} fontSize={44} fill={B.ink}>{title}</text>
        <text x={220} y={206 + i * 190} fontFamily={FONT} fontWeight={600} fontSize={28} fill={i === 3 ? B.violet : B.grey}>{sub}</text>
        {done ? <g transform={`translate(960,${170 + i * 190}) scale(${sp(t, at + 0.35, 10, 220)})`}><circle r={36} fill={GREEN} /><Icon name="circle-check" x={-28} y={-28} size={56} color="#fff" /></g> : null}
      </g>; })}
  </svg>;
};

// 7. The trap: old + new chunks both retrieved -> conflicting evidence
export const conflict: React.FC<SceneProps> = ({ t, cue }) => {
  const Tb = cue("both") - 0.15; const k1 = sp(t, 0.1), k2 = sp(t, Tb), fl = t > Tb + 0.4;
  const jit = fl ? Math.sin(t * 50) * 6 : 0;
  return <svg width={SW} height={SH}><Defs />
    <text x={540} y={50} textAnchor="middle" fontFamily={FONT} fontWeight={800} fontSize={30} fill={B.grey}>Retrieved results for "leave days"</text>
    <g transform={`translate(40,90) scale(${k1})`}><rect width={470} height={300} rx={30} fill="#fff" stroke={B.amber} strokeWidth={5} filter="url(#shadow)" />
      <text x={30} y={56} fontFamily={MONO} fontWeight={700} fontSize={24} fill={B.amber}>CHUNK 1 · OLD POLICY</text><text x={30} y={150} fontFamily={FONT} fontWeight={900} fontSize={64} fill={B.ink}>18 days</text>
      <image href={PDF()} x={30} y={190} width={58} height={72} /><text x={100} y={236} fontFamily={MONO} fontWeight={700} fontSize={24} fill={B.grey}>HR_Policy_v1.pdf</text></g>
    {t > Tb ? <g transform={`translate(570,90) scale(${k2})`}><rect width={470} height={300} rx={30} fill="#fff" stroke={GREEN} strokeWidth={5} filter="url(#shadow)" />
      <text x={30} y={56} fontFamily={MONO} fontWeight={700} fontSize={24} fill={GREEN}>CHUNK 2 · NEW POLICY</text><text x={30} y={150} fontFamily={FONT} fontWeight={900} fontSize={64} fill={B.ink}>24 days</text>
      <image href={PDF()} x={30} y={190} width={58} height={72} /><text x={100} y={236} fontFamily={MONO} fontWeight={700} fontSize={24} fill={B.grey}>HR_Policy_v2.pdf</text></g> : null}
    {fl ? <path d="M555,120 L515,240 L560,240 L515,370" stroke={B.amber} strokeWidth={12} fill="none" strokeLinejoin="round" opacity={0.6 + Math.sin(t * 30) * 0.4} /> : null}
    {t > Tb ? <g>{[0, 1].map((i) => <path key={i} d={`M${i ? 805 : 275},390 C${i ? 805 : 275},520 540,520 540,600`} stroke={i ? GREEN : B.amber} strokeWidth={6} fill="none" strokeDasharray="12 10" strokeDashoffset={-t * 60} />)}</g> : null}
    <g transform={`translate(${540 + jit},760) scale(${sp(t, 0.2)})`}>
      <circle r={160} fill={fl ? B.red : B.blue} opacity={0.12} /><circle r={130} fill={fl ? B.red : "url(#gBlue)"} filter="url(#shadow)" />
      <Icon name="sparkles" x={-62} y={-80} size={124} color="#fff" /><text y={82} textAnchor="middle" fontFamily={FONT} fontWeight={900} fontSize={40} fill="#fff">LLM</text>
      {fl ? <text x={150} y={-90} fontFamily={FONT} fontWeight={900} fontSize={110} fill={B.amber}>?</text> : null}
    </g>
    {fl ? <Stamp x={540} y={1030} text="CONFLICT" color={B.red} k={sp(t, Tb + 0.4, 9, 260)} rot={-4} size={72} /> : null}
  </svg>;
};

// 8. Fix: version + effective date metadata, filter to the current version, archive the old one
export const versionFilter: React.FC<SceneProps> = ({ t, cue }) => {
  const Tf = cue("filter") - 0.15, Tc = cue("current") - 0.1;
  const json = ['{', '  "document_id": "HR-POLICY",', '  "version": 2,', '  "effective_from": "2026-12-01",', '  "is_current": true', '}'];
  let budget = Math.floor(Math.max(0, t - 0.05) * 70);
  const p1 = ease((t - Tc) / 0.7), p2 = ease((t - Tc - 0.1) / 0.7);
  return <svg width={SW} height={SH}><Defs />
    <rect x={40} y={10} width={1000} height={360} rx={30} fill={B.navy} filter="url(#shadow)" />
    {json.map((l, i) => { const s = l.slice(0, Math.max(0, budget)); budget -= l.length + 2; const hot = i >= 2 && i <= 4;
      return <text key={i} x={80} y={70 + i * 52} fontFamily={MONO} fontWeight={700} fontSize={34} fill={hot ? B.cyan : "#e2e8f0"} style={{ whiteSpace: "pre" }}>{s}</text>; })}
    <g opacity={ease((t - Tf) / 0.3)}>
      <path d="M300,440 L780,440 L600,640 L600,760 L480,800 L480,640 Z" fill="#fff" stroke={B.blue} strokeWidth={6} strokeLinejoin="round" filter="url(#shadow)" />
      <Icon name="funnel" x={490} y={470} size={100} color={B.blue} />
      <text x={540} y={420} textAnchor="middle" fontFamily={MONO} fontWeight={700} fontSize={28} fill={B.blue}>is_current = true</text>
    </g>
    <g transform={`translate(${130 - p1 * 50},${470 + p1 * 420})`} opacity={t > Tf ? 1 : 0}>
      <rect width={250} height={110} rx={22} fill="#fff" stroke={B.grey} strokeWidth={3} opacity={1 - p1 * 0.4} />
      <text x={20} y={46} fontFamily={MONO} fontWeight={700} fontSize={24} fill={B.grey}>v1 · 18 days</text><text x={20} y={86} fontFamily={FONT} fontWeight={800} fontSize={24} fill={B.grey}>{p1 > 0.9 ? "archived · history" : "superseded"}</text>
    </g>
    {p1 > 0.9 ? <g transform="translate(110,1010)"><Icon name="archive" x={0} y={0} size={70} color={B.grey} /><text x={84} y={48} fontFamily={FONT} fontWeight={800} fontSize={28} fill={B.grey}>ARCHIVE</text></g> : null}
    <g transform={`translate(${700 - p2 * 285},${470 + p2 * 380})`} opacity={t > Tf ? 1 : 0}>
      <rect width={250} height={110} rx={22} fill="#fff" stroke={GREEN} strokeWidth={4} filter="url(#shadow)" />
      <text x={20} y={46} fontFamily={MONO} fontWeight={700} fontSize={24} fill={GREEN}>v2 · 24 days</text><text x={20} y={86} fontFamily={FONT} fontWeight={800} fontSize={24} fill={GREEN}>current ✓</text>
    </g>
  </svg>;
};

// 9. Proof: same question, same model -> 24 days with the new source
export const proofChat: React.FC<SceneProps> = ({ t }) => {
  const ka = sp(t, 0.5), kc = sp(t, 1.4), kb = sp(t, 1.9);
  return <svg width={SW} height={SH}><Defs />
    <rect x={50} y={10} width={980} height={820} rx={40} fill="#fff" filter="url(#shadow)" />
    <ChatHeader x={50} y={10} w={980} />
    <Bubble x={280} y={165} w={640} h={90} fill={B.blue} k={sp(t, 0.05)} ox={1}><text x={32} y={58} fontFamily={FONT} fontSize={34} fontWeight={600} fill="#fff">How many leave days do I get?</text></Bubble>
    <Icon name="circle-user" x={930} y={172} size={78} color={B.navy} />
    <circle cx={110} cy={330} r={30} fill="url(#gBlue)" /><Icon name="bot" x={88} y={308} size={44} color="#fff" />
    <Bubble x={160} y={285} w={800} h={150} fill="#ecfdf5" stroke={GREEN} k={ka}>
      <text x={34} y={90} fontFamily={FONT} fontSize={38} fontWeight={600} fill={B.ink}>You get <tspan fontWeight={900} fontSize={64} fill={GREEN}>24 days</tspan> from Dec 1.</text>
    </Bubble>
    <g transform={`translate(160,470) scale(${kc})`} opacity={cl(kc * 1.5)}>
      <rect width={620} height={92} rx={26} fill="#eff6ff" stroke={B.blue} strokeWidth={3} /><image href={PDF()} x={20} y={14} width={52} height={64} />
      <text x={90} y={58} fontFamily={FONT} fontWeight={800} fontSize={30} fill={B.blue} textDecoration="underline">HR_Policy_v2.pdf · page 3</text>
      <Icon name="external-link" x={565} y={26} size={40} color={B.blue} />
    </g>
    <g transform={`translate(540,940) scale(${kb})`}><rect x={-380} y={-60} width={760} height={120} rx={60} fill={B.navy} /><Icon name="lock" x={-350} y={-38} size={76} color="#fff" />
      <text x={30} y={14} textAnchor="middle" fontFamily={FONT} fontWeight={800} fontSize={36} fill="#fff">model weights unchanged ✓</text></g>
  </svg>;
};

// 10. Takeaway: RAG updates knowledge, not the model
export const takeaway: React.FC<SceneProps> = ({ t, cue }) => {
  const Tk = cue("knowledge") - 0.2;
  return <svg width={SW} height={SH}><Defs />
    <Card3 y={120} icon="brain-circuit" color={B.violet} title="Model weights" sub="same model as before" on={1} lock={1} status="unchanged" />
    <Card3 y={520} icon="database" color={B.blue} title="Vector index" sub="v2 chunks · v1 archived" on={1} glow={ease((t - Tk) / 0.4)} status={t > Tk ? "updated ✓" : undefined} />
  </svg>;
};

// 11. Cliffhanger: the HR handbook (tables, scans) -> an answer with a number that isn't in the PDF -> Episode 4
export const handbookCliff: React.FC<SceneProps> = ({ t, cue }) => {
  const Th = cue("handbook") - 0.3, Ta = cue("answered") - 0.1, Tn = cue("isn't") - 0.1, Te = cue("Episode") - 0.2;
  const kh = sp(t, Th, 11, 160), ka = sp(t, Ta), kn = sp(t, Tn, 10, 220), dark = ease((t - Te) / 0.35);
  const kf = sp(t, 0.02, 10, 200), ff = 1 - ease((t - Th + 0.2) / 0.3);
  return <svg width={SW} height={SH}><Defs />
    {ff > 0 ? <g transform={`translate(540,420) scale(${kf})`} opacity={ff}><circle r={190} fill={GREEN} opacity={0.15} /><circle r={150} fill={GREEN} /><Icon name="circle-check" x={-110} y={-110} size={220} color="#fff" />
      <text y={260} textAnchor="middle" fontFamily={FONT} fontWeight={900} fontSize={64} fill={GREEN}>24 DAYS · FIXED</text></g> : null}
    <g transform={`translate(540,230) scale(${kh}) rotate(${-4 + Math.sin(t * 2) * 1})`}>
      {[3, 2, 1, 0].map((i) => <rect key={i} x={-300 + i * 12} y={-190 + i * 12} width={600} height={380} rx={14} fill={i ? "#e2e8f0" : "#fff"} stroke="#cbd5e1" strokeWidth={3} />)}
      <image href={PDF()} x={-270} y={-160} width={80} height={98} />
      <text x={-170} y={-108} fontFamily={MONO} fontWeight={700} fontSize={28} fill={B.ink}>HR_Handbook_2026.pdf</text>
      <text x={-170} y={-70} fontFamily={FONT} fontWeight={700} fontSize={24} fill={B.grey}>214 pages · tables · scans</text>
      {[0, 1, 2, 3].map((r) => [0, 1, 2].map((c) => <rect key={`${r}${c}`} x={-260 + c * 170} y={-20 + r * 44} width={160} height={36} fill={r ? "#fff" : B.blue} stroke="#94a3b8" strokeWidth={2} />))}
      <g transform="translate(160,40) rotate(9)"><rect x={-60} y={-80} width={150} height={190} fill="#d6d3cd" stroke="#a8a29e" strokeWidth={3} />{[0, 1, 2, 3, 4].map((i) => <rect key={i} x={-45} y={-60 + i * 30} width={110 - (i % 2) * 30} height={10} fill="#78716c" opacity={0.6} />)}<text x={15} y={100} textAnchor="middle" fontFamily={MONO} fontSize={18} fill="#57534e">scan.jpg</text></g>
    </g>
    {t > Ta ? <Bubble x={160} y={520} w={760} h={130} fill="#fff5f5" stroke={B.red} k={ka}>
      <text x={34} y={84} fontFamily={FONT} fontSize={38} fontWeight={600} fill={B.ink}>You get <tspan fontWeight={900} fontSize={64} fill={B.red}>31 days</tspan> per year.</text>
    </Bubble> : null}
    {t > Ta ? <g><circle cx={110} cy={570} r={30} fill="url(#gBlue)" /><Icon name="bot" x={88} y={548} size={44} color="#fff" /></g> : null}
    {t > Tn ? <Glitch t={t} at={Tn}><g transform={`translate(540,790) scale(${kn})`}>
      <rect x={-400} y={-70} width={800} height={140} rx={30} fill="#fff" stroke={B.red} strokeWidth={4} filter="url(#shadow)" />
      <Icon name="search" x={-370} y={-42} size={84} color={B.red} />
      <text x={-260} y={-8} fontFamily={MONO} fontWeight={700} fontSize={32} fill={B.ink}>find in PDF: "31"</text>
      <text x={-260} y={40} fontFamily={FONT} fontWeight={900} fontSize={36} fill={B.red}>0 matches</text>
    </g></Glitch> : null}
    {dark > 0 ? <g opacity={dark}>
      <rect width={SW} height={SH} fill={B.navy} />
      <g transform={`translate(540,470) scale(${sp(t, Te + 0.15, 10, 160)})`}>
        <Icon name="spreadsheet" x={-120} y={-260} size={240} color={B.amber} />
        <text y={110} textAnchor="middle" fontFamily={FONT} fontWeight={900} fontSize={96} fill="#fff">EPISODE 04</text>
        <text y={180} textAnchor="middle" fontFamily={FONT} fontWeight={800} fontSize={40} fill={B.amber} letterSpacing={6}>COMING NEXT</text>
        <text y={260} textAnchor="middle" fontFamily={FONT} fontWeight={600} fontSize={34} fill="#94a3b8">where did "31" come from?</text>
      </g>
    </g> : null}
  </svg>;
};


// ============================================================== Library v3: "Docling / document structure" episode (Reel 05)
const RED = "#E5252A";
const TBL = [["Employee", "Annual", "Sick"], ["Full-time", "24 days", "12 days"], ["Part-time", "12 days", "6 days"]];
const paper = "#ebe5d8";
// A scanned page: beige, tilted, speckled, grey text rows, the key line "Carry-forward: max 21 days", signature + stamp
const ScanPage: React.FC<{ x: number; y: number; w: number; h: number; rot?: number; digit?: string; digitColor?: string; boxes?: number; showKey?: boolean }> = ({ x, y, w, h, rot = 2.5, digit = "21", digitColor = "#3f3a35", boxes = 0, showKey = true }) => {
  const rows = [0.16, 0.22, 0.28, 0.34, 0.52, 0.58, 0.64];
  return <g transform={`translate(${x + w / 2},${y + h / 2}) rotate(${rot}) translate(${-w / 2},${-h / 2})`}>
    <rect width={w} height={h} fill={paper} stroke="#b9b1a1" strokeWidth={3} filter="url(#shadow)" />
    {Array.from({ length: 70 }).map((_, i) => <circle key={i} cx={random(`sx${i}`) * w} cy={random(`sy${i}`) * h} r={0.8 + random(`sr${i}`) * 1.8} fill="#8d8473" opacity={0.35} />)}
    <rect x={w * 0.08} y={h * 0.06} width={w * 0.5} height={h * 0.035} fill="#57534e" opacity={0.75} />
    {rows.map((r, i) => { const ww = w * (0.62 + random(`rw${i}`) * 0.26); const on = boxes > i / rows.length;
      return <g key={i}><rect x={w * 0.08} y={h * r} width={ww} height={h * 0.022} fill="#6b6459" opacity={0.6} />
        {on ? <rect x={w * 0.08 - 6} y={h * r - 6} width={ww + 12} height={h * 0.022 + 12} fill="none" stroke={B.cyan} strokeWidth={3} /> : null}</g>; })}
    {showKey ? <g>
      <text x={w * 0.08} y={h * 0.455} fontFamily="'Courier New', monospace" fontWeight={700} fontSize={w * 0.06} fill="#3f3a35">Carry-forward: max</text>
      <text x={w * 0.08 + w * 0.06 * 11.2} y={h * 0.455} fontFamily="'Courier New', monospace" fontWeight={700} fontSize={w * 0.06} fill={digitColor}>{digit}</text>
      <text x={w * 0.08 + w * 0.06 * 12.6} y={h * 0.455} fontFamily="'Courier New', monospace" fontWeight={700} fontSize={w * 0.06} fill="#3f3a35">days</text>
      {boxes > 0.45 ? <rect x={w * 0.08 - 6} y={h * 0.455 - w * 0.06} width={w * 0.06 * 15.2} height={w * 0.06 * 1.3} fill="none" stroke={B.cyan} strokeWidth={3} /> : null}
    </g> : null}
    <path d={`M${w * 0.1},${h * 0.84} c${w * 0.05},-${h * 0.06} ${w * 0.08},${h * 0.05} ${w * 0.13},-${h * 0.01} s${w * 0.06},${h * 0.03} ${w * 0.12},-${h * 0.02}`} stroke="#1e3a8a" strokeWidth={4} fill="none" opacity={0.75} />
    <circle cx={w * 0.76} cy={h * 0.82} r={w * 0.11} fill="none" stroke="#b91c1c" strokeWidth={5} opacity={0.55} />
    <text x={w * 0.76} y={h * 0.83} textAnchor="middle" fontFamily={FONT} fontWeight={800} fontSize={w * 0.035} fill="#b91c1c" opacity={0.6}>HR · APPROVED</text>
  </g>;
};
// A clean digital page with two columns, a picture and a footer (page 1)
const ColPage: React.FC<{ x: number; y: number; w: number; h: number; tbl?: boolean }> = ({ x, y, w, h, tbl = false }) => {
  const cw = w * 0.4;
  return <g transform={`translate(${x},${y})`}>
    <rect width={w} height={h} rx={12} fill="#fff" stroke="#cbd5e1" strokeWidth={3} filter="url(#shadow)" />
    <text x={w * 0.07} y={h * 0.09} fontFamily={FONT} fontWeight={900} fontSize={w * 0.055} fill={B.ink}>Employee Leave Policy</text>
    {[0, 1, 2, 3, 4, 5].map((i) => <rect key={`l${i}`} x={w * 0.07} y={h * (0.16 + i * 0.055)} width={cw * (i === 5 ? 0.6 : 1)} height={h * 0.022} rx={4} fill="#94a3b8" />)}
    {[0, 1, 2].map((i) => <rect key={`r${i}`} x={w * 0.53} y={h * (0.16 + i * 0.055)} width={cw * (i === 2 ? 0.7 : 1)} height={h * 0.022} rx={4} fill="#94a3b8" />)}
    <rect x={w * 0.53} y={h * 0.33} width={cw} height={h * 0.16} rx={8} fill="#dbeafe" />
    <path d={`M${w * 0.55},${h * 0.47} l${cw * 0.25},-${h * 0.09} l${cw * 0.2},${h * 0.06} l${cw * 0.18},-${h * 0.04} l${cw * 0.3},${h * 0.07} Z`} fill="#93c5fd" />
    <circle cx={w * 0.53 + cw * 0.8} cy={h * 0.37} r={h * 0.02} fill={B.amber} />
    {tbl ? [0, 1, 2].map((r) => [0, 1, 2].map((c) => <rect key={`t${r}${c}`} x={w * 0.07 + c * w * 0.287} y={h * (0.56 + r * 0.07)} width={w * 0.287} height={h * 0.07} fill={r === 0 ? "#e2e8f0" : "#fff"} stroke="#94a3b8" strokeWidth={2} />)) : null}
    {tbl ? [0, 1, 2].map((r) => [0, 1, 2].map((c) => <text key={`x${r}${c}`} x={w * 0.09 + c * w * 0.287} y={h * (0.605 + r * 0.07)} fontFamily={FONT} fontWeight={r === 0 ? 800 : 600} fontSize={w * 0.032} fill={B.ink}>{TBL[r][c]}</text>)) : null}
    <line x1={w * 0.07} x2={w * 0.93} y1={h * 0.92} y2={h * 0.92} stroke="#e2e8f0" strokeWidth={2} />
    <text x={w * 0.07} y={h * 0.96} fontFamily={FONT} fontSize={w * 0.026} fill={B.grey}>ACME HR · Confidential</text>
    <text x={w * 0.93} y={h * 0.96} textAnchor="end" fontFamily={FONT} fontSize={w * 0.026} fill={B.grey}>page 1</text>
  </g>;
};
const Chip: React.FC<{ x: number; y: number; text: string; color: string; k?: number; size?: number; dark?: boolean }> = ({ x, y, text, color, k = 1, size = 26, dark = true }) => (
  <g transform={`translate(${x},${y}) scale(${k})`} opacity={cl(k * 1.5)}>
    <rect width={text.length * size * 0.62 + 36} height={size * 1.8} rx={size * 0.9} fill={dark ? color : "#fff"} stroke={color} strokeWidth={3} />
    <text x={18} y={size * 1.25} fontFamily={FONT} fontWeight={800} fontSize={size} fill={dark ? "#fff" : color}>{text}</text>
  </g>
);
const BotSmall: React.FC<{ x: number; y: number; r?: number }> = ({ x, y, r = 32 }) => <g><circle cx={x} cy={y} r={r} fill="url(#gBlue)" /><Icon name="bot" x={x - r * 0.72} y={y - r * 0.72} size={r * 1.44} color="#fff" /></g>;

// 1. Hook: counter of free leave days given away
export const leaveCounter: React.FC<SceneProps> = ({ t, cue }) => {
  const Tl = Math.max(1.0, cue("leave") - 0.1);
  const v = Math.round(1470 * ease(t / Tl));
  const kc = sp(t, 0.02, 12, 150), kb = sp(t, 0.15), ks = sp(t, Tl, 9, 260);
  const shake = t > Tl ? Math.sin((t - Tl) * 60) * 16 * Math.exp(-(t - Tl) * 4) : 0;
  const parts = Array.from({ length: 26 }).map((_, i) => { const a = 0.1 + i * (Tl / 26); const p = (t - a) / 0.6; if (p < 0 || p > 1) return null;
    const sx = 540 + (random(`px${i}`) - 0.5) * 120, sy = 800, tx = 540 + (random(`tx${i}`) - 0.5) * 600, ty = 290;
    return <Icon key={i} name="calendar" x={sx + (tx - sx) * ease(p) - 28} y={sy + (ty - sy) * ease(p) - 28 - Math.sin(p * Math.PI) * 120} size={56} color={i % 2 ? B.amber : B.blue} opacity={1 - p * 0.8} />; });
  return <svg width={SW} height={SH}><Defs />
    <g transform={`translate(${shake},0)`}>
      {parts}
      <g transform={`translate(540,300) scale(${kc})`}>
        <rect x={-430} y={-200} width={860} height={400} rx={44} fill={B.navy} filter="url(#shadow)" />
        <text y={60} textAnchor="middle" fontFamily={FONT} fontWeight={900} fontSize={230} fill={t > Tl ? RED : "#fff"}>{v.toLocaleString("en-US")}</text>
        <text y={140} textAnchor="middle" fontFamily={FONT} fontWeight={700} fontSize={40} fill="#94a3b8" letterSpacing={2}>DAYS OF LEAVE GIVEN AWAY</text>
      </g>
      <Glitch t={t} at={Tl}><BotDisc x={540} y={820} r={150} k={kb} rot={Math.sin(t * 6) * 6} /></Glitch>
      {t > Tl ? <Stamp x={540} y={830} text="NOT APPROVED" color={RED} k={ks} rot={-9} size={70} /> : null}
    </g>
  </svg>;
};

// 2. The bot's post in #general, seen by 147, struck out by the handbook (21), then the HR invite
export const channelPost: React.FC<SceneProps> = ({ t, cue }) => {
  const T147 = cue("147"), T31 = cue("31"), T21 = cue("21") - 0.1, Tw = cue("why") - 0.15;
  const kp = sp(t, 0.1), seen = Math.round(147 * ease((t - T147 + 0.2) / 0.9)), likes = Math.round(96 * ease((t - T147) / 1.6));
  const strike = ease((t - T21) / 0.3), kh = sp(t, T21 + 0.1), ki = sp(t, Tw, 11, 170);
  const hl = t > T31 - 0.1 && t < T21 ? 0.5 + 0.5 * Math.sin(t * 12) : 0;
  return <svg width={SW} height={SH}><Defs />
    <g transform={`translate(0,${(1 - kp) * 60})`} opacity={cl(kp * 1.5)}>
      <rect x={40} y={10} width={1000} height={560} rx={36} fill="#fff" filter="url(#shadow)" />
      <rect x={40} y={10} width={1000} height={90} rx={36} fill="#f8fafc" /><rect x={40} y={70} width={1000} height={30} fill="#f8fafc" />
      <Icon name="hash" x={72} y={30} size={48} color={B.slate} /><text x={128} y={70} fontFamily={FONT} fontWeight={900} fontSize={38} fill={B.ink}>general</text>
      <text x={1004} y={68} textAnchor="end" fontFamily={FONT} fontWeight={700} fontSize={28} fill={B.grey}>147 members</text>
      <BotSmall x={110} y={165} r={42} />
      <text x={170} y={158} fontFamily={FONT} fontWeight={900} fontSize={32} fill={B.ink}>Company Assistant</text>
      <rect x={470} y={130} width={70} height={34} rx={8} fill="#e2e8f0" /><text x={505} y={155} textAnchor="middle" fontFamily={FONT} fontWeight={800} fontSize={20} fill={B.slate}>BOT</text>
      <text x={558} y={158} fontFamily={FONT} fontSize={26} fill={B.grey}>9:12 AM</text>
      <text x={170} y={220} fontFamily={FONT} fontWeight={600} fontSize={36} fill={B.ink}>Good news! You can carry forward</text>
      <text x={170} y={280} fontFamily={FONT} fontWeight={600} fontSize={36} fill={B.ink}>up to <tspan fontWeight={900} fontSize={52} fill={RED}>31 days</tspan> of leave.</text>
      {hl > 0 ? <rect x={258} y={232} width={220} height={66} rx={10} fill={B.amber} opacity={0.25 * hl} /> : null}
      {strike > 0 ? <line x1={262} x2={262 + 210 * strike} y1={266} y2={266} stroke={RED} strokeWidth={9} strokeLinecap="round" /> : null}
      {[["party", 0], ["fire", 1], ["clap", 2]].map(([, i]) => { const n = Math.max(0, likes - (i as number) * 30); const k = sp(t, T147 + (i as number) * 0.2);
        return <g key={i as number} transform={`translate(${170 + (i as number) * 170},330) scale(${k})`}><rect width={150} height={60} rx={30} fill="#eff6ff" stroke={B.blue} strokeWidth={2} />
          <Icon name={["sparkles", "badge-check", "circle-check"][i as number]} x={14} y={10} size={40} color={[B.amber, B.blue, GREEN][i as number]} />
          <text x={66} y={42} fontFamily={FONT} fontWeight={800} fontSize={28} fill={B.blue}>{n}</text></g>; })}
      <g opacity={ease((t - T147 + 0.3) / 0.3)}><Icon name="circle-check" x={170} y={430} size={40} color={B.blue} /><text x={222} y={462} fontFamily={FONT} fontWeight={800} fontSize={30} fill={B.blue}>Seen by {seen}</text></g>
      <rect x={170} y={500} width={600} height={14} rx={7} fill="#f1f5f9" />
    </g>
    {t > T21 ? <g transform={`translate(${(1 - kh) * 600},0)`} opacity={cl(kh * 1.5)}>
      <rect x={40} y={600} width={1000} height={150} rx={30} fill="#ecfdf5" stroke={GREEN} strokeWidth={4} filter="url(#shadow)" />
      <image href={PDF()} x={66} y={622} width={86} height={106} />
      <text x={174} y={662} fontFamily={MONO} fontWeight={700} fontSize={28} fill={B.slate}>Employee_Handbook.pdf</text>
      <text x={174} y={716} fontFamily={FONT} fontWeight={700} fontSize={36} fill={B.ink}>Carry-forward: max <tspan fontWeight={900} fill={GREEN}>21 days</tspan></text>
    </g> : null}
    {t > Tw ? <g transform={`translate(540,${790 + 150 - (1 - ki) * 300}) rotate(${(1 - ki) * -6})`} opacity={cl(ki * 1.5)}>
      <rect x={-460} y={-150} width={920} height={300} rx={34} fill="#fff" stroke={B.amber} strokeWidth={5} filter="url(#shadow)" />
      <rect x={-460} y={-150} width={18} height={300} rx={9} fill={B.amber} />
      <Icon name="calendar" x={-410} y={-110} size={110} color={B.amber} />
      <text x={-270} y={-60} fontFamily={FONT} fontWeight={700} fontSize={28} fill={B.grey}>Invitation from HR</text>
      <text x={-270} y={0} fontFamily={FONT} fontWeight={900} fontSize={54} fill={B.ink}>Quick chat?</text>
      <text x={-270} y={50} fontFamily={FONT} fontWeight={700} fontSize={30} fill={B.slate}>Today · 4:00 PM · with Mitesh</text>
      <rect x={-270} y={78} width={180} height={52} rx={26} fill={B.blue} /><text x={-180} y={113} textAnchor="middle" fontFamily={FONT} fontWeight={800} fontSize={26} fill="#fff">Accept</text>
      <rect x={-70} y={78} width={180} height={52} rx={26} fill="#fff" stroke="#cbd5e1" strokeWidth={3} /><text x={20} y={113} textAnchor="middle" fontFamily={FONT} fontWeight={800} fontSize={26} fill={B.slate}>Decline</text>
    </g> : null}
  </svg>;
};

// 3. Search the PDF for "31": 0 matches
export const zeroMatches: React.FC<SceneProps> = ({ t, cue }) => {
  const Tp = cue("PDF") - 0.1; const typed = "31".slice(0, Math.floor(Math.max(0, t - 0.25) * 8));
  const kr = sp(t, Tp, 10, 220);
  return <svg width={SW} height={SH}><Defs />
    <rect x={40} y={10} width={1000} height={1040} rx={36} fill="#fff" filter="url(#shadow)" />
    <image href={PDF()} x={72} y={34} width={56} height={70} /><text x={146} y={82} fontFamily={MONO} fontWeight={700} fontSize={32} fill={B.ink}>Employee_Handbook.pdf</text>
    <rect x={72} y={130} width={936} height={90} rx={45} fill="#f1f5f9" stroke={t > Tp ? RED : B.blue} strokeWidth={4} />
    <Icon name="search" x={100} y={148} size={54} color={t > Tp ? RED : B.blue} />
    <text x={176} y={192} fontFamily={MONO} fontWeight={700} fontSize={44} fill={B.ink}>{typed}{Math.floor(t * 2.5) % 2 && t < Tp ? "|" : ""}</text>
    {t > Tp ? <g transform={`translate(1000,175) scale(${kr})`}><text textAnchor="end" y={14} fontFamily={FONT} fontWeight={900} fontSize={40} fill={RED}>0 matches</text></g> : null}
    {[0, 1, 2].map((i) => { const k = sp(t, 0.1 + i * 0.12); const x = 80 + i * 320;
      return <g key={i} transform={`translate(${x},${280 + (1 - k) * 80})`} opacity={cl(k * 1.5)}>
        {i < 2 ? <ColPage x={0} y={0} w={280} h={380} tbl={i === 1} /> : <ScanPage x={0} y={0} w={280} h={380} rot={3} showKey={false} />}
        <text x={140} y={430} textAnchor="middle" fontFamily={FONT} fontWeight={800} fontSize={28} fill={B.grey}>page {i + 1}</text>
        {t > Tp ? <rect x={-6} y={-6} width={292} height={392} rx={14} fill={RED} opacity={0.08 + 0.06 * Math.sin(t * 8 + i)} /> : null}
      </g>; })}
    <BotSmall x={540} y={900} r={90} />
    {t > Tp ? ["?", "?", "?"].map((q, i) => { const k = sp(t, Tp + 0.15 + i * 0.15, 9, 200); return <text key={i} x={[650, 700, 610][i]} y={[830, 900, 790][i] + Math.sin(t * 4 + i) * 8} fontFamily={FONT} fontWeight={900} fontSize={[90, 64, 54][i] * k} fill={B.amber}>{q}</text>; }) : null}
  </svg>;
};

// 4. Page 3 is a scan: pixels, a smudged 2 read as a 3
export const scanSmudge: React.FC<SceneProps> = ({ t, cue }) => {
  const T3p = cue("three"), Ts = cue("scanned") - 0.2, Tp = cue("pixels") - 0.1, Tg = cue("guessed") - 0.2, T2 = cue("2") - 0.1, T3 = cue("3.") - 0.1;
  const zoom = ease((t - Ts) / 0.6);
  const px = 100 + (1 - zoom) * 560, py = 20 + (1 - zoom) * 30, pw = 300 + zoom * 580, ph = 400 + zoom * 380;
  const kp = ease((t - Tp) / 0.3), km = sp(t, T2 - 0.2, 12, 170), flip = ease((t - T3) / 0.25);
  return <svg width={SW} height={SH}><Defs />
    {zoom < 0.98 ? [0, 1].map((i) => <g key={i} opacity={1 - zoom}><ColPage x={60 + i * 330} y={60} w={280} h={380} tbl={i === 1} /></g>) : null}
    <g opacity={t > T3p - 0.3 ? 1 : 0.4}><ScanPage x={px} y={py} w={pw} h={ph} rot={3 * (1 - zoom * 0.3)} digit="21" /></g>
    {zoom < 0.5 && t > T3p - 0.3 ? <rect x={px - 10} y={py - 10} width={pw + 20} height={ph + 20} rx={16} fill="none" stroke={B.blue} strokeWidth={6} opacity={0.6 + 0.4 * Math.sin(t * 9)} /> : null}
    {kp > 0 ? <g opacity={kp * 0.85}>{Array.from({ length: 18 * 13 }).map((_, i) => { const c = i % 18, r = Math.floor(i / 18); const s = pw / 18;
      return <rect key={i} x={px + c * s} y={py + r * s} width={s - 2} height={s - 2} fill={random(`pp${i}`) > 0.55 ? "#a8a29e" : "#d6d3d1"} opacity={0.25 + random(`po${i}`) * 0.25 * (0.5 + 0.5 * Math.sin(t * 6 + i))} />; })}</g> : null}
    {kp > 0 ? <Chip x={px + 20} y={py + ph + 30} text="image only · no text layer" color={B.slate} k={sp(t, Tp + 0.1)} /> : null}
    {t > Tg ? <g transform={`translate(540,880) scale(${km})`}>
      <circle r={200} fill="#fff" stroke={B.ink} strokeWidth={10} filter="url(#shadow)" />
      <line x1={140} y1={140} x2={250} y2={250} stroke={B.ink} strokeWidth={26} strokeLinecap="round" />
      {Array.from({ length: 100 }).map((_, i) => { const c = i % 10, r = Math.floor(i / 10); return <rect key={i} x={-150 + c * 30} y={-150 + r * 30} width={28} height={28} fill="#e7e2d8" opacity={0.5} />; })}
      <text x={-10} y={70} textAnchor="end" fontFamily="'Courier New', monospace" fontWeight={900} fontSize={230} fill={flip > 0 ? RED : "#3f3a35"} opacity={1} style={{ filter: "blur(3px)" }}>{flip > 0.5 ? "3" : "2"}</text>
      <text x={0} y={70} fontFamily="'Courier New', monospace" fontWeight={900} fontSize={230} fill="#3f3a35" style={{ filter: "blur(2px)" }}>1</text>
      {flip > 0 ? <circle cx={-75} cy={-10} r={110 + (1 - flip) * 60} fill="none" stroke={RED} strokeWidth={8} opacity={flip} /> : null}
    </g> : null}
    {flip > 0 ? <g opacity={flip}><Chip x={640} y={1040} text="parser read: 31" color={RED} k={sp(t, T3 + 0.1)} size={30} /></g> : null}
  </svg>;
};

// 5. Plain extraction damage: columns zig-zag, the table collapses into a flat dump
export const brokenExtract: React.FC<SceneProps> = ({ t, cue }) => {
  const Tc = cue("columns") - 0.2, Tm = cue("mixed") - 0.1, Tt = cue("table") - 0.2, Tr = cue("rows") - 0.1;
  const zig = ease((t - Tc) / 0.9);
  const blocks = [["L1", 60, 80], ["R1", 290, 80], ["L2", 60, 200], ["R2", 290, 200], ["L3", 60, 320], ["R3", 290, 320]] as [string, number, number][];
  const pts = blocks.map(([, x, y]) => [x + 90, y + 40]);
  const path = "M" + pts.map((p) => p.join(",")).join(" L");
  const mixed = ["L1 R1 L2 R2 L3 R3", "Eligibility applies Leave may be", "to all staff after carried forward up", "90 days. Requests to the limit in"];
  const kd = ease((t - Tr) / 0.4);
  const cells = TBL.flatMap((row, r) => row.map((s, c) => ({ s, r, c })));
  const dump = ["Employee Annual Sick", "Full-time Part-time", "24 days 12 days", "12 days 6 days"];
  return <svg width={SW} height={SH}><Defs />
    <g transform={`translate(40,${10 + (1 - sp(t, 0.05)) * 60})`}>
      <rect width={520} height={460} rx={24} fill="#fff" stroke="#cbd5e1" strokeWidth={3} filter="url(#shadow)" />
      <text x={30} y={50} fontFamily={FONT} fontWeight={800} fontSize={28} fill={B.grey}>page 1 · two columns</text>
      {blocks.map(([n, x, y], i) => <g key={i}><rect x={x} y={y} width={180} height={80} rx={10} fill={n[0] === "L" ? "#dbeafe" : "#ede9fe"} />
        <text x={x + 90} y={y + 52} textAnchor="middle" fontFamily={FONT} fontWeight={900} fontSize={34} fill={n[0] === "L" ? B.blue : B.violet}>{n}</text></g>)}
      {zig > 0 ? <path d={path} pathLength={1} fill="none" stroke={RED} strokeWidth={8} strokeDasharray={`${zig} 1`} strokeLinecap="round" strokeLinejoin="round" /> : null}
    </g>
    {t > Tm ? <g transform={`translate(590,${10 + (1 - sp(t, Tm)) * 60})`} opacity={ease((t - Tm) / 0.3)}>
      <rect width={450} height={460} rx={24} fill={B.navy} />
      <text x={26} y={50} fontFamily={FONT} fontWeight={800} fontSize={26} fill="#94a3b8">plain text output</text>
      {mixed.map((s, i) => <text key={i} x={26} y={110 + i * 56} fontFamily={MONO} fontWeight={700} fontSize={i ? 22 : 30} fill={i ? "#e2e8f0" : RED}>{s}</text>)}
      <Icon name="triangle-alert" x={26} y={360} size={60} color={RED} /><text x={100} y={402} fontFamily={FONT} fontWeight={800} fontSize={28} fill={RED}>order scrambled</text>
    </g> : null}
    {t > Tt ? <g transform={`translate(0,${(1 - sp(t, Tt)) * 80})`} opacity={cl(sp(t, Tt) * 1.5)}>
      <rect x={40} y={520} width={1000} height={600} rx={30} fill="#fff" filter="url(#shadow)" />
      <text x={76} y={575} fontFamily={FONT} fontWeight={800} fontSize={28} fill={B.grey}>page 2 · leave table</text>
      {cells.map(({ s, r, c }, i) => { const gx = 80 + c * 310, gy = 610 + r * 78; const dr = Math.floor(i / 3) === 0 ? 0 : 0;
        const di = [0, 0, 0, 1, 2, 2, 1, 3, 3][i], dj = [0, 1, 2, 0, 0, 1, 1, 0, 1][i];
        const tx = 80 + dj * (i < 3 ? 200 : 210) + dr, ty = 900 + di * 50;
        const x = gx + (tx - gx) * kd + Math.sin(i * 3) * 30 * Math.sin(kd * Math.PI), y = gy + (ty - gy) * kd;
        return <g key={i}>{kd < 0.3 ? <rect x={gx - 10} y={gy - 44} width={300} height={70} fill={r ? "#fff" : "#e2e8f0"} stroke="#94a3b8" strokeWidth={2} opacity={1 - kd * 3} /> : null}
          <text x={x} y={y} fontFamily={kd > 0.5 ? MONO : FONT} fontWeight={r ? 600 : 800} fontSize={kd > 0.5 ? 30 : 32} fill={B.ink}>{s}</text></g>; })}
      {kd >= 1 ? <g opacity={ease((t - Tr - 0.5) / 0.3)}>
        <rect x={60} y={850} width={960} height={250} rx={18} fill="none" stroke={RED} strokeWidth={3} strokeDasharray="10 8" />
        <text x={1000} y={890} textAnchor="end" fontFamily={FONT} fontWeight={900} fontSize={30} fill={RED}>Full-time = 24 or 12 ?</text>
      </g> : null}
      {kd > 0 && kd < 1 ? null : null}
      <text x={76} y={1080} fontFamily={FONT} fontWeight={600} fontSize={1} fill="#fff">{dump.length}</text>
    </g> : null}
  </svg>;
};

// 6. Words are not structure: the words fly off, the layout skeleton stays
export const wordsVsStructure: React.FC<SceneProps> = ({ t, cue }) => {
  const Tw = cue("words") - 0.1, Tu = cue("understanding") - 0.1;
  const fly = ease((t - Tw) / 0.8), glow = ease((t - Tu) / 0.4);
  const boxes = [[140, 60, 800, 90, "TITLE", B.violet], [140, 190, 380, 360, "TEXT", B.blue], [560, 190, 380, 160, "TEXT", B.blue], [560, 390, 380, 160, "PICTURE", B.cyan], [140, 590, 800, 260, "TABLE", B.amber]] as [number, number, number, number, string, string][];
  return <svg width={SW} height={SH}><Defs />
    <rect x={100} y={20} width={880} height={870} rx={20} fill="#fff" filter="url(#shadow)" />
    {boxes.map(([x, y, w, h, n, c], i) => <g key={i}>
      <rect x={x} y={y} width={w} height={h} rx={10} fill={glow > 0 ? c : "none"} fillOpacity={0.1 * glow} stroke={glow > 0 ? c : "#cbd5e1"} strokeWidth={glow > 0 ? 5 : 3} strokeDasharray={glow > 0 ? undefined : "12 10"} />
      {glow > 0 ? <Chip x={x + 10} y={y + 10} text={n} color={c} k={sp(t, Tu + i * 0.08)} size={22} /> : null}
    </g>)}
    {Array.from({ length: 48 }).map((_, i) => { const b = boxes[i % 5]; const sx = b[0] + 30 + (i * 53) % Math.max(60, b[2] - 120), sy = b[1] + 40 + ((i * 37) % Math.max(30, b[3] - 60));
      const tx = 120 + random(`hx${i}`) * 840, ty = 940 + random(`hy${i}`) * 170;
      const p = ease((t - Tw - random(`hd${i}`) * 0.4) / 0.7);
      return <rect key={i} x={sx + (tx - sx) * p} y={sy + (ty - sy) * p - Math.sin(p * Math.PI) * 140} width={70 + (i % 4) * 18} height={18} rx={9} fill={B.slate} opacity={0.75} transform={`rotate(${p * (random(`hr${i}`) - 0.5) * 60} ${sx + (tx - sx) * p} ${sy + (ty - sy) * p})`} />; })}
    {fly > 0.6 ? <g opacity={ease((fly - 0.6) * 3)}><Chip x={60} y={1060} text="words" color={B.slate} size={28} /></g> : null}
  </svg>;
};

// 7. Docling intake: the handbook slides into the DOCLING converter
export const doclingIntake: React.FC<SceneProps> = ({ t, cue }) => {
  const Td = cue("Docling") - 0.25, Ts = cue("structure") - 0.2;
  const kd = sp(t, Td, 12, 150), slide = ease((t - Td - 0.2) / 0.8);
  const stages = [["Layout", B.violet], ["Reading order", B.blue], ["OCR", B.cyan], ["Tables", B.amber]];
  const on = (i: number) => ease((t - Ts - 0.1 - i * 0.18) / 0.25);
  return <svg width={SW} height={SH}><Defs />
    <g transform={`translate(${120 + slide * 300},${40 + slide * 200}) scale(${1 - slide * 0.6})`} opacity={1 - ease((slide - 0.85) * 6)}>
      {[2, 1, 0].map((i) => <g key={i} transform={`translate(${i * 24},${i * 24})`}>{i === 2 ? <ScanPage x={0} y={0} w={300} h={400} rot={2} showKey={false} /> : <ColPage x={0} y={0} w={300} h={400} tbl={i === 1} />}</g>)}
      <text x={20} y={490} fontFamily={MONO} fontWeight={700} fontSize={30} fill={B.ink}>Employee_Handbook.pdf</text>
    </g>
    <g transform={`translate(540,640) scale(${kd})`}>
      <rect x={-440} y={-230} width={880} height={460} rx={50} fill={B.navy} filter="url(#shadow)" />
      <rect x={-440} y={-230} width={880} height={460} rx={50} fill="none" stroke={B.cyan} strokeWidth={5} opacity={0.4 + 0.4 * Math.sin(t * 6)} />
      <Icon name="gearbox" x={-400} y={-200} size={120} color={B.cyan} rot={t * 60} />
      <text x={-250} y={-125} fontFamily={FONT} fontWeight={900} fontSize={86} fill="#fff" letterSpacing={4}>DOCLING</text>
      <text x={-250} y={-80} fontFamily={FONT} fontWeight={600} fontSize={28} fill="#94a3b8">PDF → structured document</text>
      {stages.map(([s, c], i) => { const k = on(i); const x = -400 + (i % 2) * 410, y = -20 + Math.floor(i / 2) * 110;
        return <g key={i}><rect x={x} y={y} width={390} height={90} rx={20} fill={k > 0 ? c : "#1e293b"} opacity={0.35 + 0.65 * k} />
          <text x={x + 195} y={y + 58} textAnchor="middle" fontFamily={FONT} fontWeight={800} fontSize={34} fill="#fff">{s}</text></g>; })}
    </g>
    {slide > 0.6 ? Array.from({ length: 6 }).map((_, i) => { const p = ((t * 0.9 + i / 6) % 1); return <rect key={i} x={560 + p * 380 - 20} y={400 + Math.sin(p * 6 + i) * 6} width={40} height={14} rx={7} fill={B.cyan} opacity={(1 - p) * 0.8} />; }) : null}
  </svg>;
};

// 8. Layout detection: coloured boxes snap onto the page on their words
export const layoutBoxes: React.FC<SceneProps> = ({ t, cue }) => {
  const Tt = cue("title") - 0.1, Tp = cue("paragraph") - 0.1, Tb = cue("table") - 0.1, Tq = cue("picture") - 0.1;
  const X = 110, Y = 20, W = 860, H = 1100;
  const box = (at: number, x: number, y: number, w: number, h: number, c: string, n: string, key: string, dash = false) => { const k = sp(t, at, 11, 200); if (t < at) return null;
    const s = 1 + (1 - k) * 0.25; return <g key={key} transform={`translate(${X + x + w / 2},${Y + y + h / 2}) scale(${s}) translate(${-w / 2},${-h / 2})`} opacity={cl(k * 1.4)}>
      <rect width={w} height={h} rx={8} fill={c} fillOpacity={0.1} stroke={c} strokeWidth={5} strokeDasharray={dash ? "14 10" : undefined} />
      <rect x={0} y={-36} width={n.length * 17 + 30} height={36} rx={6} fill={c} /><text x={15} y={-10} fontFamily={FONT} fontWeight={800} fontSize={24} fill="#fff">{n}</text></g>; };
  return <svg width={SW} height={SH}><Defs />
    <ColPage x={X} y={Y} w={W} h={H} tbl />
    {box(Tt, 40, 40, 780, 85, B.violet, "TITLE", "a")}
    {box(Tp, 45, 160, 370, 330, B.blue, "PARAGRAPH", "b")}
    {box(Tp + 0.15, 447, 160, 370, 140, B.blue, "PARAGRAPH", "c")}
    {box(Tb, 45, 600, 760, 250, B.amber, "TABLE", "d")}
    {box(Tq, 447, 350, 370, 200, B.cyan, "PICTURE", "e")}
    {box(Tq + 0.45, 45, 1000, 770, 75, "#94a3b8", "FOOTER · furniture", "f", true)}
  </svg>;
};

// 9. Reading order: zig-zag (wrong) -> left column then right (right)
export const readingOrder: React.FC<SceneProps> = ({ t, cue }) => {
  const Tl = cue("left") - 0.2, Tr = cue("right") - 0.1;
  const fix = ease((t - Tl) / 0.8);
  const B4 = [["L1", 80, 120, B.blue], ["L2", 80, 300, B.blue], ["R1", 560, 120, B.violet], ["R2", 560, 300, B.violet]] as [string, number, number, string][];
  const wrong = [0, 2, 1, 3], right = [0, 1, 2, 3];
  const ctr = (i: number) => [B4[i][1] + 220, B4[i][2] + 70];
  const order = (o: number[]) => "M" + o.map((i) => ctr(i).join(",")).join(" L");
  const zz = ease((t - 0.15) / 0.8);
  return <svg width={SW} height={SH}><Defs />
    <rect x={40} y={20} width={1000} height={520} rx={26} fill="#fff" filter="url(#shadow)" />
    <line x1={540} x2={540} y1={100} y2={500} stroke="#cbd5e1" strokeWidth={3} strokeDasharray="8 8" />
    {B4.map(([n, x, y, c], i) => <g key={i}><rect x={x} y={y} width={440} height={140} rx={16} fill={c} fillOpacity={0.12} stroke={c} strokeWidth={4} />
      <text x={x + 30} y={y + 88} fontFamily={FONT} fontWeight={900} fontSize={52} fill={c}>{n}</text>
      {[0, 1, 2].map((j) => <rect key={j} x={x + 140} y={y + 36 + j * 28} width={250 - j * 40} height={14} rx={7} fill={c} opacity={0.4} />)}
      <circle cx={x + 410} cy={y + 30} r={26} fill={fix > 0.5 ? GREEN : RED} /><text x={x + 410} y={y + 40} textAnchor="middle" fontFamily={FONT} fontWeight={900} fontSize={28} fill="#fff">{(fix > 0.5 ? right : wrong).indexOf(i) + 1}</text>
    </g>)}
    <path d={order(wrong)} pathLength={1} fill="none" stroke={RED} strokeWidth={8} strokeDasharray={`${zz} 1`} opacity={1 - fix} strokeLinecap="round" />
    {fix > 0 ? <path d={order(right)} pathLength={1} fill="none" stroke={GREEN} strokeWidth={8} strokeDasharray={`${fix} 1`} strokeLinecap="round" /> : null}
    {[0, 1, 2, 3].map((k) => { const iw = wrong[k], ir = right[k]; const x0 = 70 + k * 245; const yW = 640, yR = 900;
      const idx = fix > 0 ? ir : iw; const n = B4[idx][0], c = B4[idx][3]; const kk = sp(t, 0.3 + k * 0.12);
      const y = fix > 0 ? yW + (yR - yW) * ease((t - Tl - k * 0.1) / 0.5) : yW;
      return <g key={k} transform={`translate(${x0},${y}) scale(${kk})`}><rect width={200} height={110} rx={20} fill={c} /><text x={100} y={74} textAnchor="middle" fontFamily={FONT} fontWeight={900} fontSize={48} fill="#fff">{n}</text>
        {k < 3 ? <text x={222} y={72} textAnchor="middle" fontFamily={FONT} fontWeight={900} fontSize={40} fill={B.grey}>→</text> : null}</g>; })}
    <g opacity={1 - fix}><Chip x={70} y={780} text="naive order ✕" color={RED} size={28} /></g>
    {t > Tr ? <Chip x={70} y={1040} text="reading order restored ✓" color={GREEN} k={sp(t, Tr)} size={30} /> : null}
  </svg>;
};

// 10. OCR: a beam scans page 3, word boxes light up, "21" lifts off as real text
export const ocrBeam: React.FC<SceneProps> = ({ t, cue }) => {
  const Ts = cue("scanned") - 0.4, Tx = cue("text") - 0.1, T21 = cue("21") - 0.15;
  const scan = ease((t - Ts) / Math.max(0.8, Tx - Ts + 0.2));
  const X = 190, Y = 20, W = 700, H = 760;
  const beamY = Y + scan * H, k21 = sp(t, T21, 11, 170);
  const out = ["Carry-forward: max 21 days", "HR · APPROVED · signed"];
  return <svg width={SW} height={SH}><Defs />
    <ScanPage x={X} y={Y} w={W} h={H} rot={1.5} boxes={scan} />
    {scan > 0 && scan < 1 ? <g><rect x={X - 40} y={beamY - 6} width={W + 80} height={12} rx={6} fill={B.cyan} /><rect x={X - 40} y={beamY - 40} width={W + 80} height={80} fill={B.cyan} opacity={0.18} filter="url(#glow)" /></g> : null}
    <Chip x={X} y={Y + H + 30} text="OCR · pixels → characters" color={B.cyan} k={sp(t, 0.1)} size={28} />
    {t > Tx ? <g transform={`translate(0,${(1 - sp(t, Tx)) * 80})`} opacity={ease((t - Tx) / 0.3)}>
      <rect x={60} y={880} width={960} height={240} rx={26} fill={B.navy} />
      <Icon name="file-text" x={90} y={906} size={56} color={B.cyan} /><text x={162} y={946} fontFamily={FONT} fontWeight={800} fontSize={28} fill="#94a3b8">recognised text · editable</text>
      {out.map((s, i) => <text key={i} x={92} y={1010 + i * 56} fontFamily={MONO} fontWeight={700} fontSize={i ? 28 : 36} fill={i ? "#cbd5e1" : "#fff"}>{s.slice(0, Math.floor(Math.max(0, t - Tx - i * 0.3) * 50))}</text>)}
    </g> : null}
    {t > T21 ? <g transform={`translate(860,${560 - k21 * 80}) scale(${k21})`}>
      <circle r={120} fill={GREEN} filter="url(#shadow)" /><text y={42} textAnchor="middle" fontFamily={FONT} fontWeight={900} fontSize={120} fill="#fff">21</text>
      <g transform="translate(-100,140)"><rect width={200} height={48} rx={24} fill="#fff" stroke={GREEN} strokeWidth={3} /><text x={100} y={33} textAnchor="middle" fontFamily={FONT} fontWeight={800} fontSize={22} fill={GREEN}>page 3 · bbox ✓</text></g>
    </g> : null}
  </svg>;
};

// 11. TableFormer: flat dump -> grid lines -> cells snap -> Full-time row -> Markdown row
export const tableFormer: React.FC<SceneProps> = ({ t, cue }) => {
  const Tr = cue("rows") - 0.15, Tc = cue("columns") - 0.15, Tf = cue("full-time") - 0.15;
  const gh = ease((t - Tr) / 0.5), gv = ease((t - Tc) / 0.5), snap = ease((t - Tc - 0.3) / 0.6), kf = ease((t - Tf) / 0.35);
  const GX = 90, GY = 230, CW = 300, RH = 110;
  const dumpPos = [[0, 0], [1, 0], [2, 0], [0, 1], [0, 2], [1, 2], [1, 1], [2, 2], [3, 2]];
  return <svg width={SW} height={SH}><Defs />
    <Chip x={40} y={10} text="TableFormer · table structure" color={B.amber} k={sp(t, 0.05)} size={30} />
    <rect x={40} y={170} width={1000} height={470} rx={30} fill="#fff" filter="url(#shadow)" />
    {[0, 1, 2, 3].map((r) => <line key={`h${r}`} x1={GX} x2={GX + 3 * CW * gh} y1={GY + r * RH + 30} y2={GY + r * RH + 30} stroke={B.amber} strokeWidth={4} />)}
    {[0, 1, 2, 3].map((c) => <line key={`v${c}`} x1={GX + c * CW} x2={GX + c * CW} y1={GY + 30} y2={GY + 30 + 3 * RH * gv} stroke={B.amber} strokeWidth={4} />)}
    {snap > 0.5 ? <rect x={GX} y={GY + 30} width={3 * CW} height={RH} fill={B.blue} opacity={0.15 * snap} /> : null}
    {kf > 0 ? <rect x={GX} y={GY + 30 + RH} width={3 * CW} height={RH} fill={GREEN} opacity={0.18 * kf + 0.05 * Math.sin(t * 8)} /> : null}
    {TBL.flatMap((row, r) => row.map((s, c) => { const i = r * 3 + c; const [dc, dr] = dumpPos[i];
      const sx = 80 + dc * 230 + Math.sin(t * 2 + i) * 4, sy = 270 + dr * 60 + (r ? 120 : 0);
      const tx = GX + c * CW + 24, ty = GY + 30 + r * RH + 70; const p = ease((t - Tc - 0.3 - i * 0.05) / 0.5);
      return <text key={i} x={sx + (tx - sx) * p} y={sy + (ty - sy) * p} fontFamily={p > 0.5 ? FONT : MONO} fontWeight={r === 0 ? 900 : 700} fontSize={p > 0.5 ? 40 : 34} fill={r === 0 && p > 0.5 ? B.blue : B.ink}>{s}</text>; }))}
    {t > Tf ? <g transform={`translate(0,${(1 - sp(t, Tf + 0.1)) * 80})`} opacity={ease((t - Tf - 0.1) / 0.3)}>
      <rect x={40} y={690} width={1000} height={200} rx={26} fill={B.navy} />
      <text x={76} y={742} fontFamily={FONT} fontWeight={800} fontSize={26} fill="#94a3b8">Markdown</text>
      <text x={76} y={820} fontFamily={MONO} fontWeight={700} fontSize={36} fill="#fff">| Full-time | <tspan fill={B.cyan}>24 days</tspan> | 12 days |</text>
      <rect x={40} y={920} width={1000} height={200} rx={26} fill="#fff" stroke={GREEN} strokeWidth={4} filter="url(#shadow)" />
      <Icon name="circle-check" x={76} y={960} size={60} color={GREEN} />
      <text x={160} y={1000} fontFamily={MONO} fontWeight={700} fontSize={30} fill={B.ink}>Employee: Full-time</text>
      <text x={160} y={1050} fontFamily={MONO} fontWeight={700} fontSize={30} fill={B.ink}>Annual leave: <tspan fill={GREEN}>24</tspan> · Sick: 12</text>
    </g> : null}
  </svg>;
};

// 12. Not a string: a DoclingDocument tree with provenance chips
export const doclingTree: React.FC<SceneProps> = ({ t, cue }) => {
  const Ts = cue("string") - 0.1, Td = cue("DoclingDocument") - 0.2, Tsec = cue("sections") - 0.1, Ttab = cue("tables") - 0.1, Tpic = cue("pictures") - 0.1, Tpg = cue("page") - 0.1;
  const ribbon = "Employee Leave Policy Eligibility applies Leave may be Full-time Part-time 24 days 12 days 12 days 6 days Carry-forward max 31 days ";
  const gone = ease((t - Td) / 0.4);
  const nodes = [
    { y: 380, n: "SectionHeader", s: "Leave policy", c: B.violet, at: Tsec, p: "p.1" },
    { y: 520, n: "TextItem × 12", s: "paragraphs, in order", c: B.blue, at: Tsec + 0.2, p: "p.1" },
    { y: 660, n: "TableItem", s: "3 × 3 · rows + columns", c: B.amber, at: Ttab, p: "p.2" },
    { y: 800, n: "PictureItem", s: "figure", c: B.cyan, at: Tpic, p: "p.1" },
    { y: 940, n: "TextItem (OCR)", s: "Carry-forward: max 21", c: GREEN, at: Tpic + 0.3, p: "p.3" },
  ];
  const kr = sp(t, Td, 12, 160);
  return <svg width={SW} height={SH}><Defs />
    {gone < 1 ? <g opacity={1 - gone}>
      <rect x={20} y={120} width={1040} height={100} rx={20} fill={B.navy} />
      <text x={60 - ((t * 260) % 900)} y={185} fontFamily={MONO} fontWeight={700} fontSize={34} fill="#e2e8f0">{ribbon + ribbon}</text>
      <rect x={20} y={240} width={160} height={50} rx={10} fill={B.slate} /><text x={100} y={274} textAnchor="middle" fontFamily={MONO} fontWeight={700} fontSize={26} fill="#fff">str</text>
      {t > Ts ? <g transform={`translate(540,170) scale(${sp(t, Ts, 9, 220)})`}><Icon name="circle-x" x={-90} y={-90} size={180} color={RED} /></g> : null}
    </g> : null}
    {t > Td ? <g transform={`translate(540,120) scale(${kr})`}><rect x={-330} y={-70} width={660} height={140} rx={34} fill={B.blue} filter="url(#shadow)" />
      <Icon name="file-text" x={-300} y={-42} size={84} color="#fff" /><text x={40} y={20} textAnchor="middle" fontFamily={MONO} fontWeight={800} fontSize={44} fill="#fff">DoclingDocument</text></g> : null}
    {t > Td ? <line x1={140} x2={140} y1={190} y2={190 + (940 + 60 - 190) * ease((t - Td - 0.1) / 0.6)} stroke={B.blue} strokeWidth={6} /> : null}
    {nodes.map((nd, i) => { const k = sp(t, nd.at, 12, 180); if (t < nd.at) return null; const kp = sp(t, Tpg + i * 0.1, 10, 220);
      return <g key={i} transform={`translate(${(1 - k) * 200},0)`} opacity={cl(k * 1.5)}>
        <line x1={140} x2={200} y1={nd.y + 60} y2={nd.y + 60} stroke={B.blue} strokeWidth={6} />
        <rect x={200} y={nd.y} width={600} height={120} rx={24} fill="#fff" stroke={nd.c} strokeWidth={4} filter="url(#shadow)" />
        <rect x={200} y={nd.y} width={16} height={120} rx={8} fill={nd.c} />
        <text x={240} y={nd.y + 52} fontFamily={MONO} fontWeight={800} fontSize={32} fill={nd.c}>{nd.n}</text>
        <text x={240} y={nd.y + 94} fontFamily={FONT} fontWeight={600} fontSize={26} fill={B.grey}>{nd.s}</text>
        {t > Tpg + i * 0.1 ? <g transform={`translate(830,${nd.y + 30}) scale(${kp})`}><rect width={210} height={60} rx={30} fill={B.cyan} /><text x={105} y={40} textAnchor="middle" fontFamily={MONO} fontWeight={800} fontSize={26} fill="#fff">prov {nd.p}</text></g> : null}
      </g>; })}
  </svg>;
};

// 13. Three lines of Python + Markdown output
export const codeCard: React.FC<SceneProps> = ({ t }) => {
  const L = [
    ["from docling.document_converter import DocumentConverter", "#94a3b8", 0],
    ["", "", 0],
    ["converter = DocumentConverter()", "#fff", 1],
    ['doc = converter.convert("Employee_Handbook.pdf").document', "#fff", 2],
    ["print(doc.export_to_markdown())", "#fff", 3],
  ] as [string, string, number][];
  let budget = Math.floor(Math.max(0, t - 0.25) * 70);
  const md = ["## Leave entitlement", "| Employee | Annual | Sick |", "|---|---|---|", "| Full-time | 24 days | 12 days |", "| Part-time | 12 days | 6 days |"];
  const Tm = 2.5;
  return <svg width={SW} height={SH}><Defs />
    <g transform={`translate(0,${(1 - sp(t, 0)) * 60})`}>
      <rect x={30} y={10} width={1020} height={560} rx={28} fill={B.navy} filter="url(#shadow)" />
      {[0, 1, 2].map((i) => <circle key={i} cx={78 + i * 40} cy={56} r={13} fill={["#ef4444", "#f59e0b", "#22c55e"][i]} />)}
      <text x={210} y={66} fontFamily={MONO} fontWeight={700} fontSize={26} fill="#94a3b8">convert.py</text>
      <image href={staticFile("brand/tool-logos/python.svg")} x={960} y={28} width={60} height={60} />
      {L.map(([s, c, n], i) => { const shown = s.slice(0, Math.max(0, budget)); budget -= s.length; const y = 150 + i * 80;
        return <g key={i}>{n ? <g opacity={shown.length ? 1 : 0}><circle cx={70} cy={y - 10} r={22} fill={B.blue} /><text x={70} y={y - 1} textAnchor="middle" fontFamily={FONT} fontWeight={900} fontSize={26} fill="#fff">{n}</text></g> : null}
          <text x={108} y={y} fontFamily={MONO} fontWeight={700} fontSize={i === 3 ? 23 : 25} fill={c}>{shown}</text></g>; })}
      <text x={108} y={540} fontFamily={MONO} fontSize={22} fill="#64748b">$ pip install docling</text>
    </g>
    {t > Tm ? <g transform={`translate(0,${(1 - sp(t, Tm)) * 80})`} opacity={ease((t - Tm) / 0.3)}>
      <rect x={30} y={610} width={1020} height={500} rx={28} fill="#fff" stroke={B.blue} strokeWidth={4} filter="url(#shadow)" />
      <Icon name="file-text" x={60} y={636} size={52} color={B.blue} /><text x={128} y={674} fontFamily={MONO} fontWeight={700} fontSize={28} fill={B.blue}>employee_handbook.md</text>
      {md.map((s, i) => <text key={i} x={70} y={760 + i * 66} opacity={ease((t - Tm - 0.2 - i * 0.12) / 0.2)} fontFamily={MONO} fontWeight={i === 0 ? 800 : 700} fontSize={i === 0 ? 34 : 32} fill={i === 3 ? GREEN : B.ink}>{s}</text>)}
    </g> : null}
  </svg>;
};

// 14. Proof (21 days, page 3) + where Docling sits in the RAG pipeline
export const proofRail: React.FC<SceneProps> = ({ t, cue }) => {
  const T21 = cue("21") - 0.15, Tv = cue("vector") - 0.15, Tc = cue("chunking") - 0.2;
  const rows = [["pdf-file", "Original PDF", "text · tables · columns · scans", B.slate], ["gearbox", "DOCLING", "layout · order · OCR · tables", B.cyan], ["scissors", "Chunking", "next episode", B.amber], ["database", "Embeddings + vector DB", "searchable knowledge", B.blue], ["bot", "RAG chatbot", "retrieve + answer", B.violet]] as [string, string, string, string][];
  const kr = ease((t - Tv) / 0.3);
  return <svg width={SW} height={SH}><Defs />
    <g transform={`translate(0,${-kr * 0})`}>
      <rect x={40} y={10} width={1000} height={420} rx={34} fill="#fff" filter="url(#shadow)" />
      <Bubble x={240} y={40} w={760} h={90} fill={B.blue} k={sp(t, 0.05)} ox={1}><text x={30} y={58} fontFamily={FONT} fontSize={32} fontWeight={600} fill="#fff">How many leave days can I carry forward?</text></Bubble>
      <BotSmall x={100} y={210} r={36} />
      <Bubble x={160} y={160} w={820} h={120} fill="#ecfdf5" stroke={GREEN} k={sp(t, Math.max(0.3, T21 - 0.2))}>
        <text x={32} y={80} fontFamily={FONT} fontSize={38} fontWeight={600} fill={B.ink}>Up to <tspan fontWeight={900} fontSize={58} fill={GREEN}>21 days</tspan> into next year.</text>
      </Bubble>
      <g transform={`translate(160,305) scale(${sp(t, T21 + 0.3)})`}><rect width={640} height={90} rx={26} fill="#eff6ff" stroke={B.blue} strokeWidth={3} /><image href={PDF()} x={20} y={13} width={52} height={64} />
        <text x={90} y={58} fontFamily={FONT} fontWeight={800} fontSize={30} fill={B.blue} textDecoration="underline">Employee_Handbook.pdf · page 3</text></g>
    </g>
    {rows.map(([ic, n, s, c], i) => { const k = sp(t, Tv + i * 0.12, 12, 170); if (t < Tv) return null; const y = 470 + i * 134; const hot = i === 1 || (i === 2 && t > Tc);
      return <g key={i} transform={`translate(${(1 - k) * -300},0)`} opacity={cl(k * 1.5)}>
        <rect x={100} y={y} width={880} height={108} rx={26} fill={i === 1 ? B.navy : "#fff"} stroke={hot ? c : "#e2e8f0"} strokeWidth={hot ? 5 : 3} filter="url(#shadow)" />
        {i === 2 && t > Tc ? <rect x={100} y={y} width={880} height={108} rx={26} fill={B.amber} opacity={0.12 + 0.1 * Math.sin(t * 9)} /> : null}
        <Icon name={ic} x={128} y={y + 18} size={72} color={c} />
        <text x={228} y={y + 52} fontFamily={FONT} fontWeight={900} fontSize={36} fill={i === 1 ? "#fff" : B.ink}>{n}</text>
        <text x={228} y={y + 88} fontFamily={FONT} fontWeight={600} fontSize={26} fill={i === 1 ? "#94a3b8" : B.grey}>{s}</text>
        {i < 4 ? <text x={540} y={y + 132} textAnchor="middle" fontFamily={FONT} fontWeight={900} fontSize={30} fill="#94a3b8">↓</text> : null}
      </g>; })}
    {t > Tv + 0.6 && t < Tc + 0.2 ? <g opacity={ease((t - Tv - 0.6) / 0.3)}><Chip x={740} y={902} text="≠ Docling" color={RED} size={26} /></g> : null}
  </svg>;
};

// 15. Cliffhanger: 500-character chunks cut the table mid-row -> "Part-timers get 24 days" -> Episode 05
export const chunkCliff: React.FC<SceneProps> = ({ t, cue }) => {
  const Tc = cue("chunked") - 0.2, Tcut = cue("cut") - 0.25, T24 = cue("24") - 0.15, Te = cue("Episode") - 0.2;
  const scx = -120 + ease((t - Tcut) / 0.5) * 1320, split = ease((t - Tcut - 0.4) / 0.5);
  const dark = ease((t - Te) / 0.35), kb = sp(t, T24);
  const up = -split * 30, dn = split * 70;
  const T = (x: number, y: number, s: string, c: string = B.ink, w = 700) => <text x={x} y={y} fontFamily={MONO} fontWeight={w} fontSize={32} fill={c}>{s}</text>;
  const mv = ease((t - Tcut - 0.5) / 0.5);   // "24 days | 12 days |" travels from the end of the Full-time row to the top of chunk 2
  return <svg width={SW} height={SH}><Defs />
    <g transform={`translate(0,${(1 - sp(t, 0.05)) * 60})`}>
      <rect x={40} y={20 + up} width={1000} height={split > 0 ? 300 : 470} rx={26} fill="#fff" stroke={split > 0 ? B.blue : "#e2e8f0"} strokeWidth={4} filter="url(#shadow)" />
      {split > 0 ? <rect x={40} y={360 + dn} width={1000} height={190} rx={26} fill="#fff5f5" stroke={RED} strokeWidth={4} filter="url(#shadow)" /> : null}
      {T(70, 120 + up, "## Leave entitlement", B.ink, 800)}
      {T(70, 190 + up, "| Employee | Annual | Sick |")}
      {T(70, 260 + up, "| Full-time |")}
      {T(330 + (70 - 330) * mv, 260 + up + (450 + dn - 260 - up) * mv, "24 days | 12 days |", mv > 0.5 ? RED : B.ink)}
      {T(70, (split > 0 ? 515 + dn : 330), "| Part-time | 12 days | 6 days |")}
      {t > Tc ? <g opacity={ease((t - Tc - 0.2) / 0.3)}><Chip x={780} y={40 + up} text="chunk 1" color={B.blue} size={24} /></g> : null}
      {split > 0.3 ? <Chip x={700} y={380 + dn} text="chunk 2 · no header" color={RED} size={24} /> : null}
      {t > Tc && split === 0 ? <line x1={40} x2={1040} y1={292} y2={292} stroke={B.amber} strokeWidth={4} strokeDasharray="14 10" opacity={ease((t - Tc - 0.3) / 0.3) * (0.6 + 0.4 * Math.sin(t * 8))} /> : null}
      {t > Tc && split === 0 ? <g opacity={ease((t - Tc - 0.3) / 0.3)}><text x={1010} y={282} textAnchor="end" fontFamily={FONT} fontWeight={800} fontSize={24} fill={B.amber}>500 chars</text></g> : null}
      {t > Tcut - 0.05 && t < Tcut + 0.6 ? <Icon name="scissors" x={scx - 50} y={242} size={100} color={B.amber} rot={-90} /> : null}
    </g>
    {t > T24 ? <Glitch t={t} at={T24}><g>
      <BotSmall x={110} y={760} r={40} />
      <Bubble x={170} y={700} w={820} h={130} fill="#fff5f5" stroke={RED} k={kb}>
        <text x={32} y={84} fontFamily={FONT} fontSize={38} fontWeight={600} fill={B.ink}>Part-time: <tspan fontWeight={900} fontSize={60} fill={RED}>24 days</tspan> per year.</text>
      </Bubble>
      <g opacity={ease((t - T24 - 0.4) / 0.3)}><Chip x={170} y={880} text="handbook says: 12 days" color={GREEN} size={28} dark={false} /></g>
    </g></Glitch> : null}
    {dark > 0 ? <g opacity={dark}>
      <rect x={-200} y={-600} width={SW + 400} height={SH + 1200} fill={B.navy} />
      <g transform={`translate(540,470) scale(${sp(t, Te + 0.15, 10, 160)})`}>
        <Icon name="scissors" x={-120} y={-270} size={240} color={B.amber} />
        <text y={110} textAnchor="middle" fontFamily={FONT} fontWeight={900} fontSize={96} fill="#fff">EPISODE 05</text>
        <text y={180} textAnchor="middle" fontFamily={FONT} fontWeight={800} fontSize={40} fill={B.amber} letterSpacing={6}>COMING NEXT</text>
        <text y={260} textAnchor="middle" fontFamily={FONT} fontWeight={600} fontSize={34} fill="#94a3b8">chunking that doesn't break tables</text>
      </g>
    </g> : null}
  </svg>;
};


// ============================================================== Library v4: box-office data story (Reel 06, Hindi)
const HF = "Inter, 'Noto Sans Devanagari', 'Nirmala UI', sans-serif";
type MovieId = "ram" | "bb2" | "dh2";
const MV: Record<MovieId, { hi: string; en: string; c: string; dark: string; img: string }> = {
  ram: { hi: "रामायण", en: "RAMAYANA", c: "#F59E0B", dark: "#7c2d12", img: "ramayana" },
  bb2: { hi: "बाहुबली 2", en: "BAAHUBALI 2", c: "#8B5CF6", dark: "#2e1065", img: "baahubali2" },
  dh2: { hi: "धुरंधर 2", en: "DHURANDHAR 2", c: "#E5252A", dark: "#450a0a", img: "dhurandhar2" },
};
const fmt = (n: number, d = 0) => n.toLocaleString("en-IN", { minimumFractionDigits: d, maximumFractionDigits: d });
// Poster: a drawn title card (always) with the user's poster image on top when brand/cards/<img>.jpg exists
const Poster: React.FC<{ m: MovieId; x: number; y: number; w: number; h: number; k?: number; dim?: number; ring?: string; img?: string }> = ({ m, x, y, w, h, k = 1, dim = 0, ring, img }) => {
  const v = MV[m]; const file = (POSTERS as Record<string, string>)[(img ?? v.img).toLowerCase()] ?? (POSTERS as Record<string, string>)[v.img]; const id = `pc-${m}-${Math.round(w)}-${Math.round(h)}`; const r = Math.min(w, h) * 0.08;
  return <g transform={`translate(${x + w / 2},${y + h / 2}) scale(${k}) translate(${-w / 2},${-h / 2})`} opacity={cl(k * 1.6)}>
    <defs><clipPath id={id}><rect width={w} height={h} rx={r} /></clipPath>
      <linearGradient id={`${id}g`} x1="0" y1="0" x2="0" y2="1"><stop offset="0" stopColor={v.dark} /><stop offset="1" stopColor="#0B1220" /></linearGradient></defs>
    <rect width={w} height={h} rx={r} fill={`url(#${id}g)`} filter="url(#shadow)" />
    <g clipPath={`url(#${id})`}>
      <circle cx={w * 0.5} cy={h * 0.36} r={w * 0.42} fill={v.c} opacity={0.22} />
      <circle cx={w * 0.5} cy={h * 0.36} r={w * 0.26} fill={v.c} opacity={0.35} />
      <text x={w / 2} y={h * 0.74} textAnchor="middle" fontFamily={HF} fontWeight={900} fontSize={w * 0.17} fill="#fff">{v.hi}</text>
      <text x={w / 2} y={h * 0.86} textAnchor="middle" fontFamily={FONT} fontWeight={800} fontSize={w * 0.075} fill={v.c} letterSpacing={2}>{v.en}</text>
      {file ? <image href={staticFile(`brand/cards/${file}`)} width={w} height={h} preserveAspectRatio="xMidYMid slice" /> : null}
      {dim > 0 ? <rect width={w} height={h} fill="#0B1220" opacity={dim * 0.6} /> : null}
    </g>
    <rect width={w} height={h} rx={r} fill="none" stroke={ring ?? v.c} strokeWidth={ring ? 8 : 4} />
  </g>;
};
const SrcTag: React.FC<{ y?: number; extra?: string }> = ({ y = SH - 18, extra }) => (
  <text x={SW / 2} y={y} textAnchor="middle" fontFamily={HF} fontWeight={600} fontSize={22} fill="#94a3b8">स्रोत: Sacnilk · 22 Nov 2026 · अनुमानित आंकड़े{extra ? ` · ${extra}` : ""}</text>
);
const Pill: React.FC<{ x: number; y: number; text: string; color: string; k?: number; size?: number; icon?: string; dark?: boolean }> = ({ x, y, text, color, k = 1, size = 28, icon, dark = true }) => {
  const w = text.length * size * 0.6 + (icon ? size * 1.6 : 0) + 40;
  return <g transform={`translate(${x},${y}) scale(${k})`} opacity={cl(k * 1.5)}>
    <rect width={w} height={size * 1.8} rx={size * 0.9} fill={dark ? color : "#fff"} stroke={color} strokeWidth={3} />
    {icon ? <Icon name={icon} x={16} y={size * 0.3} size={size * 1.2} color={dark ? "#fff" : color} /> : null}
    <text x={(icon ? size * 1.6 : 0) + 20} y={size * 1.24} fontFamily={HF} fontWeight={800} fontSize={size} fill={dark ? "#fff" : color}>{text}</text>
  </g>;
};
const countUp = (t: number, at: number, v: number, dur = 0.8) => v * ease((t - at) / dur);

// 1. Hook: Ramayana centre, rivals either side; overseas #1 badge, then "still behind?" with worldwide ranks
export const raceHook: React.FC<SceneProps> = ({ t, cue }) => {
  const Ta = cue("आगे") - 0.15, Tp = cue("पीछे") - 0.15;
  const kc = sp(t, 0.05, 12, 140), kl = sp(t, 0.35), kr = sp(t, 0.5), ko = sp(t, Ta, 10, 200), ks = sp(t, Tp, 9, 240);
  const shake = t > Tp ? Math.sin((t - Tp) * 55) * 14 * Math.exp(-(t - Tp) * 4) : 0;
  const ranks: [MovieId, number, number][] = [["dh2", 1, 885], ["bb2", 2, 195], ["ram", 3, 540]];
  return <svg width={SW} height={SH}><Defs />
    <g transform={`translate(${shake},0)`}>
      <Poster m="bb2" x={30} y={210 + Math.sin(t * 1.5) * 6} w={300} h={430} k={kl} dim={t > Tp ? 0 : 0.3} />
      <Poster m="dh2" x={750} y={210 + Math.cos(t * 1.5) * 6} w={300} h={430} k={kr} dim={t > Tp ? 0 : 0.3} />
      <Poster m="ram" x={330} y={110} w={420} h={600} k={kc} ring={t > Ta && t < Tp ? "#16A34A" : undefined} />
      {t > Ta ? <g transform={`translate(540,${80}) scale(${ko})`}><rect x={-230} y={-40} width={460} height={80} rx={40} fill="#16A34A" filter="url(#shadow)" />
        <Icon name="globe" x={-210} y={-26} size={52} color="#fff" rot={t * 40} /><text x={30} y={14} textAnchor="middle" fontFamily={HF} fontWeight={900} fontSize={34} fill="#fff">विदेश में #1</text></g> : null}
      {t > Tp ? ranks.map(([m, n, x], i) => { const k = sp(t, Tp + 0.15 + i * 0.15, 10, 220);
        return <g key={m} transform={`translate(${x},790) scale(${k})`}><circle r={70} fill={m === "ram" ? "#E5252A" : B.navy} filter="url(#shadow)" />
          <text y={22} textAnchor="middle" fontFamily={FONT} fontWeight={900} fontSize={64} fill="#fff">#{n}</text></g>; }) : null}
      {t > Tp ? <g opacity={ease((t - Tp - 0.5) / 0.3)}><text x={540} y={920} textAnchor="middle" fontFamily={HF} fontWeight={800} fontSize={32} fill={B.grey}>वर्ल्डवाइड रैंक · 18 दिन बाद</text></g> : null}
      {t > Tp ? <Stamp x={540} y={420} text="STILL BEHIND?" color="#E5252A" k={ks} rot={-8} size={66} /> : null}
    </g>
    <SrcTag />
  </svg>;
};

// 2. Worldwide leaderboard: three horizontal bars (zero-based), numbers count up on their words
export const worldBoard: React.FC<SceneProps> = ({ t, cue }) => {
  const rows: [MovieId, number, string][] = [["dh2", 1813.39, "1813"], ["bb2", 1788.06, "1788"], ["ram", 1693.5, "1693"]];
  return <svg width={SW} height={SH}><Defs />
    <Pill x={40} y={10} text="वर्ल्डवाइड ग्रॉस · ₹ करोड़" color={B.blue} icon="globe" k={sp(t, 0.05)} />
    {rows.map(([m, v, w], i) => { const at = cue(w) - 0.3; const k = sp(t, at, 12, 170); const g = ease((t - at) / 0.9); const y = 130 + i * 320; const bw = (v / 1900) * 700 * g;
      const hot = m === "ram" && t > at;
      return <g key={m} opacity={t > at ? 1 : 0.25}>
        <Poster m={m} x={40} y={y} w={190} h={270} k={t > at ? k : 1} ring={hot ? "#F59E0B" : undefined} />
        <rect x={260} y={y + 90} width={700} height={100} rx={20} fill="#e2e8f0" />
        <rect x={260} y={y + 90} width={Math.max(0, bw)} height={100} rx={20} fill={MV[m].c} />
        <text x={280} y={y + 70} fontFamily={HF} fontWeight={900} fontSize={38} fill={B.ink}>#{i + 1}  {MV[m].hi}</text>
        <text x={Math.max(560, 260 + bw - 20)} y={y + 158} textAnchor="end" fontFamily={FONT} fontWeight={900} fontSize={52} fill="#fff">₹{fmt(countUp(t, at, v, 0.9))}</text>
      </g>; })}
    <SrcTag />
  </svg>;
};

// 3. Zoomed ruler 1,650-1,850: red gap brackets count up to 94.56 and 119.89
export const gapZoom: React.FC<SceneProps> = ({ t, cue }) => {
  const T95 = cue("95") - 0.2, T120 = cue("120") - 0.2;
  const X = (v: number) => 90 + ((v - 1650) / 200) * 900, ry = 560;
  const kr = sp(t, 0.05), g1 = ease((t - T95) / 0.7), g2 = ease((t - T120) / 0.7);
  const marks: [MovieId, number, number][] = [["ram", 1693.5, 1], ["bb2", 1788.06, -1], ["dh2", 1813.39, 1]];
  return <svg width={SW} height={SH}><Defs />
    <Pill x={40} y={10} text="ज़ूम: ₹1,650 – 1,850 करोड़" color={B.slate} icon="search" k={kr} />
    <g opacity={kr}>
      <line x1={60} x2={1020} y1={ry} y2={ry} stroke={B.ink} strokeWidth={6} />
      {[1650, 1700, 1750, 1800, 1850].map((v) => <g key={v}><line x1={X(v)} x2={X(v)} y1={ry - 16} y2={ry + 16} stroke={B.ink} strokeWidth={4} />
        <text x={X(v)} y={ry + 56} textAnchor="middle" fontFamily={FONT} fontWeight={700} fontSize={26} fill={B.grey}>{fmt(v)}</text></g>)}
    </g>
    {marks.map(([m, v, side], i) => { const k = sp(t, 0.2 + i * 0.15, 12, 180); const x = X(v); const py = side > 0 ? ry - 360 : ry - 360;
      const px = m === "bb2" ? x - 220 : m === "dh2" ? x - 40 : x - 75;
      return <g key={m}><line x1={x} x2={x} y1={ry} y2={py + 220} stroke={MV[m].c} strokeWidth={5} opacity={k} />
        <circle cx={x} cy={ry} r={16} fill={MV[m].c} stroke="#fff" strokeWidth={4} opacity={k} />
        <Poster m={m} x={px} y={py} w={150} h={215} k={k} /></g>; })}
    {[[T95, g1, 1788.06, 94.56, 680, "बाहुबली 2"], [T120, g2, 1813.39, 119.89, 900, "धुरंधर 2"]].map(([T, g, v, d, y, n], i) => (t as number) > (T as number) ? <g key={i}>
      <path d={`M${X(1693.5)},${(y as number) - 40} L${X(1693.5)},${y} L${X(1693.5) + (X(v as number) - X(1693.5)) * (g as number)},${y} L${X(1693.5) + (X(v as number) - X(1693.5)) * (g as number)},${(y as number) - 40}`} fill="none" stroke="#E5252A" strokeWidth={8} strokeLinejoin="round" />
      <g transform={`translate(${X(1693.5)},${(y as number) + 20})`}><rect width={560} height={100} rx={24} fill="#fff5f5" stroke="#E5252A" strokeWidth={3} />
        <text x={24} y={66} fontFamily={HF} fontWeight={900} fontSize={46} fill="#E5252A">−₹{fmt(countUp(t, T as number, d as number, 0.7), 2)} Cr</text>
        <text x={540} y={64} textAnchor="end" fontFamily={HF} fontWeight={700} fontSize={26} fill={B.grey}>{n} से</text></g>
    </g> : null)}
    <SrcTag />
  </svg>;
};

// shared vertical bar chart (zero-based or zoomed)
const VBars: React.FC<{ t: number; items: { m: MovieId; v: number; at: number; label?: string }[]; max: number; base?: number; top?: number; unit?: string; win?: MovieId; winColor?: string }> = ({ t, items, max, base = 760, top = 190, win, winColor = "#16A34A" }) => {
  const cw = 260, gap = 70, x0 = (SW - (items.length * cw + (items.length - 1) * gap)) / 2;
  return <g>
    <line x1={40} x2={1040} y1={base} y2={base} stroke={B.ink} strokeWidth={4} />
    {items.map((it, i) => { const x = x0 + i * (cw + gap); const g = ease((t - it.at) / 0.8); const h = ((base - top) * it.v / max) * g; const k = sp(t, it.at - 0.2);
      const isWin = win === it.m && g > 0.9;
      return <g key={it.m}>
        <rect x={x + 30} y={base - h} width={cw - 60} height={h} rx={16} fill={MV[it.m].c} opacity={t > it.at ? 1 : 0} />
        {isWin ? <rect x={x + 22} y={base - h - 8} width={cw - 44} height={h + 8} rx={20} fill="none" stroke={winColor} strokeWidth={8} opacity={0.6 + 0.4 * Math.sin(t * 8)} /> : null}
        {t > it.at ? <text x={x + cw / 2} y={base - h - 24} textAnchor="middle" fontFamily={FONT} fontWeight={900} fontSize={48} fill={B.ink}>₹{fmt(countUp(t, it.at, it.v, 0.8))}</text> : null}
        <Poster m={it.m} x={x + 45} y={base + 24} w={cw - 90} h={(cw - 90) * 1.42} k={k} />
        {it.label ? <text x={x + cw / 2} y={base - 30} textAnchor="middle" fontFamily={HF} fontWeight={800} fontSize={26} fill="#fff" opacity={g}>{it.label}</text> : null}
      </g>; })}
  </g>;
};

// 4. India net: Ramayana lowest of the three
export const indiaNet: React.FC<SceneProps> = ({ t, cue }) => {
  const items = [{ m: "ram" as MovieId, v: 942.75, at: cue("943") - 0.2 }, { m: "bb2" as MovieId, v: 1030.42, at: cue("1030") - 0.2 }, { m: "dh2" as MovieId, v: 1149.3, at: cue("1149") - 0.2 }];
  const Tl = items[2].at + 0.8;
  return <svg width={SW} height={SH}><Defs />
    <Pill x={40} y={10} text="इंडिया नेट · ₹ करोड़" color="#FF9933" icon="chart-column" k={sp(t, 0.05)} />
    <VBars t={t} items={items} max={1250} />
    {t > Tl ? <g transform={`translate(40,${110})`} opacity={ease((t - Tl) / 0.3)}><rect width={420} height={70} rx={35} fill="#fff5f5" stroke="#E5252A" strokeWidth={3} />
      <Icon name="trending-down" x={20} y={11} size={48} color="#E5252A" /><text x={84} y={47} fontFamily={HF} fontWeight={900} fontSize={30} fill="#E5252A">भारत में सबसे पीछे</text></g> : null}
    <SrcTag />
  </svg>;
};

// 5. Overseas: the order flips, Ramayana #1
export const overseasFlip: React.FC<SceneProps> = ({ t, cue }) => {
  const Tu = cue("उलटी") - 0.2;
  const items = [{ m: "ram" as MovieId, v: 567, at: cue("567") - 0.2 }, { m: "dh2" as MovieId, v: 438, at: cue("438") - 0.2 }, { m: "bb2" as MovieId, v: 371.16, at: cue("371") - 0.2 }];
  const kg = sp(t, Tu, 11, 150), mv = ease((t - items[0].at + 0.3) / 0.5);
  return <svg width={SW} height={SH}><Defs />
    <Pill x={40} y={10} text="ओवरसीज़ ग्रॉस · ₹ करोड़" color="#16A34A" icon="globe" k={sp(t, 0.05)} />
    <VBars t={t} items={items} max={650} win="ram" />
    {t > Tu && mv < 1 ? <g transform={`translate(${540 + mv * 380},${420 - mv * 300}) scale(${kg * (1 - mv * 0.7)})`} opacity={1 - mv}><circle r={200} fill="#16A34A" opacity={0.15} /><Icon name="globe" x={-170} y={-170} size={340} color="#16A34A" rot={t * 50} /></g> : null}
    {t > items[0].at + 0.8 ? <g transform={`translate(${255},${150}) scale(${sp(t, items[0].at + 0.8, 9, 220)})`}><Icon name="trophy" x={-48} y={-60} size={96} color="#F59E0B" /></g> : null}
    <SrcTag />
  </svg>;
};

// 6. Weekly trend: W1 -> W2 (-47%), W3 = 3 days only
export const weekTrend: React.FC<SceneProps> = ({ t, cue }) => {
  const T1 = cue("565") - 0.2, T2 = cue("299") - 0.2, Tp = cue("47%") - 0.15;
  const data: [string, string, number, number][] = [["हफ्ता 1", "8 दिन", 564.6, T1], ["हफ्ता 2", "7 दिन", 299.15, T2], ["हफ्ता 3", "सिर्फ 3 दिन", 79, T2 + 0.7]];
  const base = 900, top = 220, max = 620, cw = 250, x0 = 80;
  const Y = (v: number) => base - (base - top) * v / max;
  const ka = ease((t - Tp) / 0.5), kb = sp(t, Tp + 0.3, 9, 220);
  return <svg width={SW} height={SH}><Defs />
    <Pill x={40} y={10} text="रामायण · इंडिया नेट · हफ्तेवार" color="#F59E0B" icon="chart-column" k={sp(t, 0.05)} />
    <line x1={40} x2={1040} y1={base} y2={base} stroke={B.ink} strokeWidth={4} />
    {data.map(([n, d, v, at], i) => { const g = ease((t - at) / 0.7); const x = x0 + i * (cw + 90); const h = (base - Y(v)) * g;
      return <g key={i} opacity={t > at - 0.05 ? 1 : 0.2}>
        <rect x={x} y={base - h} width={cw} height={h} rx={16} fill={i === 2 ? "#fcd34d" : "#F59E0B"} />
        {i === 2 ? <rect x={x} y={base - h} width={cw} height={h} rx={16} fill="none" stroke="#b45309" strokeWidth={3} strokeDasharray="10 8" /> : null}
        {t > at ? <text x={x + cw / 2} y={base - h - 22} textAnchor="middle" fontFamily={FONT} fontWeight={900} fontSize={50} fill={B.ink}>₹{fmt(countUp(t, at, v, 0.7), v % 1 ? 2 : 0)}</text> : null}
        <text x={x + cw / 2} y={base + 54} textAnchor="middle" fontFamily={HF} fontWeight={900} fontSize={36} fill={B.ink}>{n}</text>
        <text x={x + cw / 2} y={base + 96} textAnchor="middle" fontFamily={HF} fontWeight={700} fontSize={28} fill={i === 2 ? "#b45309" : B.grey}>{d}</text>
      </g>; })}
    {t > Tp ? <g>
      <path d={`M${x0 + cw / 2},${Y(564.6) - 90} Q${x0 + cw + 60},${Y(564.6) - 160} ${x0 + cw + 90 + cw / 2},${Y(299.15) - 100}`} pathLength={1} fill="none" stroke="#E5252A" strokeWidth={9} strokeDasharray={`${ka} 1`} strokeLinecap="round" />
      <g transform={`translate(${x0 + 2 * cw + 230},${Y(299.15) - 150}) scale(${kb})`}><rect x={-120} y={-50} width={240} height={100} rx={50} fill="#E5252A" filter="url(#shadow)" />
        <text y={20} textAnchor="middle" fontFamily={FONT} fontWeight={900} fontSize={56} fill="#fff">−47%</text></g>
    </g> : null}
    <SrcTag />
  </svg>;
};

// 7. Third weekend: Fri -> Sat -> Sun rising line, with last Sunday's 75 as a ghost line
export const weekendLine: React.FC<SceneProps> = ({ t, cue }) => {
  const TF = cue("1575") - 0.2, TS = cue("3560") - 0.2, TP = cue("पिछला") - 0.1;
  const pts: [string, number, number][] = [["शुक्र · D16", 15.75, TF], ["शनि · D17", 27.65, (TF + TS) / 2 + 0.2], ["रवि · D18", 35.6, TS]];
  const L = 150, R = 960, T = 140, Bm = 880, max = 80;
  const X = (i: number) => L + 80 + i * ((R - L - 160) / 2), Y = (v: number) => Bm - (Bm - T) * v / max;
  const shown = pts.filter((p) => t > p[2]);
  const d = shown.map((p, i) => `${i ? "L" : "M"}${X(i)},${Y(p[1])}`).join(" ");
  const kg = ease((t - TP) / 0.4);
  return <svg width={SW} height={SH}><Defs />
    <Pill x={40} y={10} text="तीसरा वीकेंड · रोज़ का इंडिया नेट" color="#16A34A" icon="trending-up" k={sp(t, 0.05)} />
    <rect x={L - 20} y={T - 30} width={R - L + 60} height={Bm - T + 60} rx={30} fill="#fff" filter="url(#shadow)" />
    {[0, 20, 40, 60, 80].map((v) => <g key={v}><line x1={L + 20} x2={R} y1={Y(v)} y2={Y(v)} stroke="#e2e8f0" strokeWidth={2} />
      <text x={L + 10} y={Y(v) + 9} textAnchor="end" fontFamily={FONT} fontWeight={700} fontSize={24} fill="#94a3b8">{v}</text></g>)}
    {kg > 0 ? <g opacity={kg}><line x1={L + 20} x2={L + 20 + (R - L - 20) * kg} y1={Y(75)} y2={Y(75)} stroke="#E5252A" strokeWidth={5} strokeDasharray="14 10" />
      <rect x={R - 430} y={Y(75) - 64} width={430} height={50} rx={25} fill="#fff5f5" stroke="#E5252A" strokeWidth={2} />
      <text x={R - 215} y={Y(75) - 30} textAnchor="middle" fontFamily={HF} fontWeight={800} fontSize={26} fill="#E5252A">पिछला रविवार · ₹75 Cr</text></g> : null}
    {shown.length > 1 ? <path d={d} fill="none" stroke="#16A34A" strokeWidth={10} strokeLinecap="round" strokeLinejoin="round" /> : null}
    {pts.map(([n, v, at], i) => { const k = sp(t, at, 10, 220); return <g key={i}>
      <text x={X(i)} y={Bm + 40} textAnchor="middle" fontFamily={HF} fontWeight={800} fontSize={28} fill={B.ink}>{n}</text>
      {t > at ? <g transform={`translate(${X(i)},${Y(v)}) scale(${k})`}><circle r={22} fill="#16A34A" stroke="#fff" strokeWidth={6} />
        <text y={-40} textAnchor="middle" fontFamily={FONT} fontWeight={900} fontSize={i === 1 ? 30 : 42} fill={i === 1 ? B.grey : B.ink}>{i === 1 ? "≈₹27.65" : `₹${fmt(v, 2)}`}</text></g> : null}
    </g>; })}
    <SrcTag extra="शनि = 79 − शुक्र − रवि" />
  </svg>;
};

// 8. Scenarios: zoomed bars from today's 1,693.5 up to each scenario, crossing the rivals' lines
export const scenarioBars: React.FC<SceneProps> = ({ t, cue }) => {
  const Tm = cue("मॉडल") - 0.2;
  const sc: [string, number, number][] = [["कंज़र्वेटिव", 1790, cue("1790") - 0.2], ["बेस केस", 1870, cue("1870") - 0.2], ["स्ट्रॉन्ग होल्ड", 1974, cue("1974") - 0.2]];
  const base = 960, top = 150, lo = 1600, hi = 2050; const Y = (v: number) => base - (base - top) * (v - lo) / (hi - lo);
  const lines: [string, number, string][] = [["2,000", 2000, "#F59E0B"], ["धुरंधर 2 · 1,813", 1813.39, MV.dh2.c], ["बाहुबली 2 · 1,788", 1788.06, MV.bb2.c]];
  const cx = [470, 680, 890], bw = 150;
  return <svg width={SW} height={SH}><Defs />
    <Pill x={40} y={10} text="अनुमान · वर्ल्डवाइड लाइफटाइम · ज़ूम स्केल" color={B.blue} icon="chart-column" k={sp(t, 0.05)} />
    <rect x={30} y={100} width={1020} height={900} rx={30} fill="#fff" filter="url(#shadow)" />
    {lines.map(([n, v, c], i) => { const k = ease((t - Tm - i * 0.15) / 0.4); return <g key={i} opacity={k}>
      <line x1={60} x2={60 + 960 * k} y1={Y(v)} y2={Y(v)} stroke={c} strokeWidth={4} strokeDasharray={i === 0 ? "16 10" : "6 8"} />
      <text x={70} y={Y(v) + (i === 2 ? 34 : -12)} fontFamily={HF} fontWeight={800} fontSize={26} fill={c}>{n}</text></g>; })}
    <line x1={60} x2={1020} y1={Y(1693.5)} y2={Y(1693.5)} stroke={B.slate} strokeWidth={3} />
    <text x={70} y={Y(1693.5) + 34} fontFamily={HF} fontWeight={800} fontSize={26} fill={B.slate}>आज · 1,693.5</text>
    {sc.map(([n, v, at], i) => { const g = ease((t - at) / 0.8); const yv = Y(1693.5) - (Y(1693.5) - Y(v)) * g; const x = cx[i] - bw / 2;
      return <g key={i} opacity={t > at - 0.1 ? 1 : 0.25}>
        <rect x={x} y={Y(1693.5)} width={bw} height={base - Y(1693.5)} fill="#F59E0B" opacity={0.9} />
        <rect x={x} y={yv} width={bw} height={Y(1693.5) - yv} fill={i === 2 ? "#16A34A" : "#fbbf24"} />
        <rect x={x} y={yv} width={bw} height={Y(1693.5) - yv} fill="none" stroke="#fff" strokeWidth={3} strokeDasharray="8 6" />
        {t > at ? <text x={cx[i]} y={yv - 20} textAnchor="middle" fontFamily={FONT} fontWeight={900} fontSize={40} fill={B.ink}>₹{fmt(1693.5 + (v - 1693.5) * g)}</text> : null}
        <text x={cx[i]} y={base + 2 - 14} textAnchor="middle" fontFamily={HF} fontWeight={800} fontSize={24} fill="#fff">{n}</text>
      </g>; })}
    <SrcTag y={SH - 60} />
    <text x={SW / 2} y={SH - 22} textAnchor="middle" fontFamily={HF} fontWeight={700} fontSize={22} fill="#94a3b8">सीनेरियो हमारे अपने अनुमान हैं, ट्रेड प्रेडिक्शन नहीं</text>
  </svg>;
};

// 9. ₹2,000 Cr gauge: 1,693.5 filled, strong-hold scenario reaches 1,974 (dashed), 306.5 still needed
export const twoKGauge: React.FC<SceneProps> = ({ t, cue }) => {
  const T2 = cue("2000") - 0.2, Th = cue("होल्ड") - 0.2;
  const cx = 540, cy = 520, r = 330, a0 = Math.PI * 0.8, a1 = Math.PI * 2.2;
  const arc = (f: number) => { const a = a0 + (a1 - a0) * f; return `M${cx + r * Math.cos(a0)},${cy + r * Math.sin(a0)} A${r},${r} 0 ${a - a0 > Math.PI ? 1 : 0} 1 ${cx + r * Math.cos(a)},${cy + r * Math.sin(a)}`; };
  const f1 = (1693.5 / 2000) * ease((t - T2) / 1.0), f2 = 1693.5 / 2000 + ((1974 - 1693.5) / 2000) * ease((t - Th) / 0.8);
  return <svg width={SW} height={SH}><Defs />
    <g transform={`translate(0,${(1 - sp(t, 0.05)) * 60})`}>
      <path d={arc(1)} fill="none" stroke="#e2e8f0" strokeWidth={60} strokeLinecap="round" />
      {t > Th ? <path d={arc(f2)} fill="none" stroke="#16A34A" strokeWidth={60} strokeLinecap="round" opacity={0.45} /> : null}
      {f1 > 0.001 ? <path d={arc(f1)} fill="none" stroke="#F59E0B" strokeWidth={60} strokeLinecap="round" /> : null}
      <text x={cx} y={cy - 40} textAnchor="middle" fontFamily={FONT} fontWeight={900} fontSize={110} fill={B.ink}>₹{fmt(2000 * f1, 1)}</text>
      <text x={cx} y={cy + 20} textAnchor="middle" fontFamily={HF} fontWeight={800} fontSize={36} fill={B.grey}>/ ₹2,000 करोड़</text>
      {t > T2 + 0.9 ? <g transform={`translate(${cx},${cy + 110}) scale(${sp(t, T2 + 0.9)})`}><rect x={-280} y={-46} width={560} height={92} rx={46} fill="#fff5f5" stroke="#E5252A" strokeWidth={3} />
        <text y={14} textAnchor="middle" fontFamily={HF} fontWeight={900} fontSize={38} fill="#E5252A">₹306.5 करोड़ और चाहिए</text></g> : null}
      {t > Th ? <g opacity={ease((t - Th - 0.6) / 0.3)}><Pill x={250} y={950} text="स्ट्रॉन्ग होल्ड → ≈ ₹1,974" color="#16A34A" icon="trending-up" /></g> : null}
    </g>
    <SrcTag />
  </svg>;
};

// 10. Prediction poll (no fake results): three option cards, a cursor hovers, comment prompt
export const predictPoll: React.FC<SceneProps> = ({ t, cue }) => {
  const opts: [string, number][] = [["₹1,800 Cr", cue("1800") - 0.2], ["₹1,900 Cr", cue("1900") - 0.2], ["₹2,000+ Cr", cue("2000") - 0.2]];
  const Tc = cue("कमेंट") - 0.2;
  const hover = Math.min(2, Math.max(0, Math.floor((t - opts[0][1]) / 0.6))) ;
  const cy = 330 + hover * 190;
  return <svg width={SW} height={SH}><Defs />
    <rect x={40} y={10} width={1000} height={1010} rx={40} fill="#fff" filter="url(#shadow)" />
    <Poster m="ram" img="ramayana ram" x={80} y={50} w={150} h={213} k={sp(t, 0.05)} />
    <text x={270} y={130} fontFamily={HF} fontWeight={900} fontSize={54} fill={B.ink}>रामायण कहां रुकेगी?</text>
    <text x={270} y={190} fontFamily={FONT} fontWeight={800} fontSize={30} fill={B.grey} letterSpacing={2}>WHERE WILL IT FINISH?</text>
    {opts.map(([s, at], i) => { const k = sp(t, at, 11, 190); const on = t > opts[0][1] && hover === i && t < Tc + 0.5;
      return <g key={i} transform={`translate(540,${330 + i * 190}) scale(${k * (on ? 1.04 : 1)})`}>
        <rect x={-420} y={-70} width={840} height={140} rx={70} fill={on ? "#FEF3C7" : "#f8fafc"} stroke={i === 2 ? "#16A34A" : "#F59E0B"} strokeWidth={on ? 7 : 4} />
        <circle cx={-340} cy={0} r={30} fill="none" stroke={B.grey} strokeWidth={4} />{on ? <circle cx={-340} cy={0} r={16} fill="#F59E0B" /> : null}
        <text x={-280} y={22} fontFamily={FONT} fontWeight={900} fontSize={64} fill={B.ink}>{s}</text></g>; })}
    {t > opts[0][1] && t < Tc + 0.5 ? <path transform={`translate(${830 + Math.sin(t * 3) * 10},${cy + 10})`} d="M0,0 L0,58 L15,44 L26,70 L36,66 L25,40 L45,40 Z" fill="#fff" stroke={B.ink} strokeWidth={4} strokeLinejoin="round" /> : null}
    {t > Tc ? <g transform={`translate(540,${920 + Math.sin(t * 6) * 8}) scale(${sp(t, Tc, 10, 200)})`}><rect x={-330} y={-56} width={660} height={112} rx={56} fill={B.blue} filter="url(#shadow)" />
      <Icon name="message-square" x={-300} y={-34} size={68} color="#fff" /><text x={40} y={18} textAnchor="middle" fontFamily={HF} fontWeight={900} fontSize={46} fill="#fff">कमेंट करें 👇</text></g> : null}
  </svg>;
};

export const SCENES: Record<string, React.FC<SceneProps>> = { pdfSwarm, pdfCrash, chatFail, ingest, embed, vectorDb, retrieve, generate, chatAnswer , liedStamp, leaveChat, retrainQ, threePlaces, notSynced, syncPipeline, conflict, versionFilter, proofChat, takeaway, handbookCliff, leaveCounter, channelPost, zeroMatches, scanSmudge, brokenExtract, wordsVsStructure, doclingIntake, layoutBoxes, readingOrder, ocrBeam, tableFormer, doclingTree, codeCard, proofRail, chunkCliff, raceHook, worldBoard, gapZoom, indiaNet, overseasFlip, weekTrend, weekendLine, scenarioBars, twoKGauge, predictPoll };

// shared helpers for scenes_safe.tsx
export { Defs, Stamp, Glitch, Poster, Pill, sp, ease, cl, fmt, MV, HF, FONT, MONO, B, countUp, GREEN };
export type { MovieId };
