// Code-drawn animated scenes for `kind: "scene"` sections (1080 x 1140 canvas under the word-synced header).
// Every scene gets t (s since section start), d (section length) and cue(word) = local time that word is spoken.
// Library v1 = an AI/RAG explainer set: pdfSwarm, chatFail, ingest, embed, vectorDb, retrieve, generate, chatAnswer.
import React from "react";
import { random, spring, staticFile } from "remotion";
import { Icon } from "./icon";

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
const Stamp: React.FC<{ x: number; y: number; text: string; color: string; k: number; rot?: number; size?: number }> = ({ x, y, text, color, k, rot = -8, size = 64 }) => {
  const s = 1 + (1 - k) * 1.4;
  return <g transform={`translate(${x},${y}) rotate(${rot}) scale(${s})`} opacity={cl(k * 1.6)}>
    <rect x={-text.length * size * 0.33 - 30} y={-size * 0.85} width={text.length * size * 0.66 + 60} height={size * 1.4} rx={14} fill="none" stroke={color} strokeWidth={8} />
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

export const SCENES: Record<string, React.FC<SceneProps>> = { pdfSwarm, pdfCrash, chatFail, ingest, embed, vectorDb, retrieve, generate, chatAnswer , liedStamp, leaveChat, retrainQ, threePlaces, notSynced, syncPipeline, conflict, versionFilter, proofChat, takeaway, handbookCliff };
