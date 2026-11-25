// Safe-zone scenes: drawn on a 1080 x 600 canvas placed at y 470-1070 of the 1080x1920 frame (24-56 % height),
// content kept inside x 65..1015 (6 % side margins). Headline (15-24 %) and 2-line subtitles (56-65 %) are drawn by Listicle.tsx.
// Rules: one idea per scene, big numbers (48-96 px), every beat on its spoken word (cue), nothing critical near the right edge.
import React from "react";
import { Icon } from "./icon";
import { Defs, Stamp, Poster, Pill, sp, ease, cl, fmt, MV, HF, FONT, B, countUp, GREEN } from "./scenes";
import type { MovieId, SceneProps } from "./scenes";

export const CW = 1080, CH = 600;
const RED = "#E5252A";
const Src: React.FC<{ extra?: string }> = ({ extra }) => (
  <text x={CW / 2} y={CH - 6} textAnchor="middle" fontFamily={HF} fontWeight={600} fontSize={19} fill="#94a3b8">स्रोत: Sacnilk · 22 Nov 2026 · अनुमानित आंकड़े{extra ? ` · ${extra}` : ""}</text>
);
const Svg: React.FC<{ children: React.ReactNode }> = ({ children }) => <svg width={CW} height={CH} style={{ overflow: "visible" }}><Defs />{children}</svg>;

// 1. Hook: Ramayana centre, rivals either side; "#1 overseas" badge, then worldwide ranks + STILL BEHIND?
const raceHook: React.FC<SceneProps> = ({ t, cue }) => {
  const Ta = cue("आगे") - 0.15, Tp = cue("पीछे") - 0.15;
  const kc = sp(t, 0.05, 12, 140), kl = sp(t, 0.3), kr = sp(t, 0.45), ko = sp(t, Ta, 10, 200), ks = sp(t, Tp, 9, 240);
  const shake = t > Tp ? Math.sin((t - Tp) * 55) * 12 * Math.exp(-(t - Tp) * 4) : 0;
  const ranks: [MovieId, number, number][] = [["bb2", 2, 220], ["ram", 3, 540], ["dh2", 1, 860]];
  return <Svg><g transform={`translate(${shake},0)`}>
    <Poster m="bb2" x={95} y={95 + Math.sin(t * 1.5) * 5} w={250} h={355} k={kl} />
    <Poster m="dh2" x={735} y={95 + Math.cos(t * 1.5) * 5} w={250} h={355} k={kr} />
    <Poster m="ram" x={380} y={30} w={320} h={455} k={kc} ring={t > Ta && t < Tp ? GREEN : undefined} />
    {t > Ta ? <g transform={`translate(540,58) scale(${ko})`}><rect x={-170} y={-32} width={340} height={64} rx={32} fill={GREEN} filter="url(#shadow)" />
      <Icon name="globe" x={-155} y={-22} size={44} color="#fff" rot={t * 40} /><text x={22} y={12} textAnchor="middle" fontFamily={HF} fontWeight={900} fontSize={30} fill="#fff">विदेश में #1</text></g> : null}
    {t > Tp ? ranks.map(([m, n, x], i) => { const k = sp(t, Tp + 0.15 + i * 0.12, 10, 220);
      return <g key={m} transform={`translate(${x},540) scale(${k})`}><circle r={48} fill={m === "ram" ? RED : B.navy} filter="url(#shadow)" />
        <text y={17} textAnchor="middle" fontFamily={FONT} fontWeight={900} fontSize={46} fill="#fff">#{n}</text></g>; }) : null}
    {t > Tp ? <Stamp x={540} y={270} text="STILL BEHIND?" color={RED} k={ks} rot={-8} size={56} /> : null}
  </g></Svg>;
};

// 2. Worldwide leaderboard (zero-based bars), numbers count up on their words
const worldBoard: React.FC<SceneProps> = ({ t, cue }) => {
  const rows: [MovieId, number, string][] = [["dh2", 1813.39, "1813"], ["bb2", 1788.06, "1788"], ["ram", 1693.5, "1693"]];
  return <Svg>
    {rows.map(([m, v, w], i) => { const at = cue(w) - 0.3; const g = ease((t - at) / 0.9); const y = 12 + i * 186; const bw = (v / 1900) * 640 * g; const on = t > at;
      return <g key={m} opacity={on ? 1 : 0.22}>
        <Poster m={m} x={65} y={y} w={118} h={168} k={on ? sp(t, at) : 1} ring={m === "ram" && on ? "#F59E0B" : undefined} />
        <text x={215} y={y + 46} fontFamily={HF} fontWeight={900} fontSize={34} fill={B.ink}>#{i + 1}  {MV[m].hi}</text>
        <rect x={215} y={y + 68} width={640} height={88} rx={18} fill="#e2e8f0" />
        <rect x={215} y={y + 68} width={Math.max(0, bw)} height={88} rx={18} fill={MV[m].c} />
        <text x={Math.max(470, 215 + bw - 18)} y={y + 130} textAnchor="end" fontFamily={FONT} fontWeight={900} fontSize={56} fill="#fff">₹{fmt(countUp(t, at, v, 0.9))}</text>
      </g>; })}
    <text x={1015} y={40} textAnchor="end" fontFamily={HF} fontWeight={700} fontSize={22} fill={B.grey}>₹ करोड़ · ग्रॉस</text>
    <Src />
  </Svg>;
};

// 3. Zoomed ruler 1,650-1,850 with red gap brackets counting up
const gapZoom: React.FC<SceneProps> = ({ t, cue }) => {
  const T95 = cue("95") - 0.2, T120 = cue("120") - 0.2;
  const X = (v: number) => 65 + ((v - 1650) / 200) * 950, ry = 270;
  const kr = sp(t, 0.05);
  const marks: [MovieId, number][] = [["ram", 1693.5], ["bb2", 1788.06], ["dh2", 1813.39]];
  const gaps: [number, number, number, number, string][] = [[T95, 1788.06, 94.56, 345, "बाहुबली 2 से"], [T120, 1813.39, 119.89, 460, "धुरंधर 2 से"]];
  return <Svg>
    <Pill x={65} y={0} text="ज़ूम: ₹1,650 – 1,850 करोड़" color={B.slate} icon="search" k={kr} size={22} />
    <g opacity={kr}><line x1={65} x2={1015} y1={ry} y2={ry} stroke={B.ink} strokeWidth={5} />
      {[1650, 1700, 1750, 1800, 1850].map((v) => <g key={v}><line x1={X(v)} x2={X(v)} y1={ry - 12} y2={ry + 12} stroke={B.ink} strokeWidth={4} />
        <text x={Math.min(990, Math.max(90, X(v)))} y={ry + 42} textAnchor="middle" fontFamily={FONT} fontWeight={700} fontSize={22} fill={B.grey}>{fmt(v)}</text></g>)}</g>
    {marks.map(([m, v], i) => { const k = sp(t, 0.2 + i * 0.15, 12, 180); const x = X(v);
      return <g key={m}><line x1={x} x2={x} y1={ry} y2={200} stroke={MV[m].c} strokeWidth={4} opacity={k} />
        <circle cx={x} cy={ry} r={13} fill={MV[m].c} stroke="#fff" strokeWidth={4} opacity={k} />
        <Poster m={m} x={x - 48} y={60} w={96} h={136} k={k} /></g>; })}
    {gaps.map(([T, v, d, y, n], i) => { if (t < T) return null; const g = ease((t - T) / 0.7); const x0 = X(1693.5), x1 = x0 + (X(v) - x0) * g;
      return <g key={i}>
        <path d={`M${x0},${y - 30} L${x0},${y} L${x1},${y} L${x1},${y - 30}`} fill="none" stroke={RED} strokeWidth={7} strokeLinejoin="round" />
        <g transform={`translate(${x0 - 20},${y + 12})`}><rect width={560} height={84} rx={22} fill="#fff5f5" stroke={RED} strokeWidth={3} />
          <text x={22} y={58} fontFamily={HF} fontWeight={900} fontSize={44} fill={RED}>−₹{fmt(countUp(t, T, d, 0.7), 2)} Cr</text>
          <text x={540} y={56} textAnchor="end" fontFamily={HF} fontWeight={700} fontSize={24} fill={B.grey}>{n}</text></g>
      </g>; })}
  </Svg>;
};

// shared: three vertical bars with posters under the base line
const VBars: React.FC<{ t: number; items: { m: MovieId; v: number; at: number }[]; max: number; win?: MovieId }> = ({ t, items, max, win }) => {
  const base = 400, top = 120, cw = 220, gap = 95, x0 = (CW - (3 * cw + 2 * gap)) / 2;
  return <g>
    <line x1={65} x2={1015} y1={base} y2={base} stroke={B.ink} strokeWidth={4} />
    {items.map((it, i) => { const x = x0 + i * (cw + gap); const g = ease((t - it.at) / 0.8); const h = ((base - top) * it.v / max) * g; const on = t > it.at;
      return <g key={it.m}>
        {on ? <rect x={x + 25} y={base - h} width={cw - 50} height={h} rx={14} fill={MV[it.m].c} /> : null}
        {win === it.m && g > 0.9 ? <rect x={x + 17} y={base - h - 8} width={cw - 34} height={h + 8} rx={18} fill="none" stroke={GREEN} strokeWidth={7} opacity={0.6 + 0.4 * Math.sin(t * 8)} /> : null}
        {on ? <text x={x + cw / 2} y={base - h - 18} textAnchor="middle" fontFamily={FONT} fontWeight={900} fontSize={52} fill={B.ink}>₹{fmt(countUp(t, it.at, it.v, 0.8))}</text> : null}
        <Poster m={it.m} x={x + cw / 2 - 52} y={base + 16} w={104} h={148} k={sp(t, it.at - 0.2)} dim={on ? 0 : 0.4} />
      </g>; })}
  </g>;
};

// 4. India net: Ramayana lowest
const indiaNet: React.FC<SceneProps> = ({ t, cue }) => {
  const items = [{ m: "ram" as MovieId, v: 942.75, at: cue("943") - 0.2 }, { m: "bb2" as MovieId, v: 1030.42, at: cue("1030") - 0.2 }, { m: "dh2" as MovieId, v: 1149.3, at: cue("1149") - 0.2 }];
  return <Svg>
    <Pill x={65} y={0} text="इंडिया नेट · ₹ करोड़" color="#FF9933" icon="chart-column" k={sp(t, 0.05)} size={22} />
    <VBars t={t} items={items} max={1250} />
    <Src />
  </Svg>;
};

// 5. Overseas: order flips, Ramayana #1
const overseasFlip: React.FC<SceneProps> = ({ t, cue }) => {
  const Tu = cue("उलटी") - 0.2;
  const items = [{ m: "ram" as MovieId, v: 567, at: cue("567") - 0.2 }, { m: "dh2" as MovieId, v: 438, at: cue("438") - 0.2 }, { m: "bb2" as MovieId, v: 371.16, at: cue("371") - 0.2 }];
  const kg = sp(t, Tu, 11, 150), mv = ease((t - items[0].at + 0.3) / 0.5);
  const x0 = (CW - (3 * 220 + 2 * 95)) / 2;
  return <Svg>
    <Pill x={65} y={0} text="ओवरसीज़ ग्रॉस · ₹ करोड़" color={GREEN} icon="globe" k={sp(t, 0.05)} size={22} />
    <VBars t={t} items={items} max={650} win="ram" />
    {t > Tu && mv < 1 ? <g transform={`translate(${540},${260}) scale(${kg * (1 - mv * 0.8)})`} opacity={1 - mv}><circle r={150} fill={GREEN} opacity={0.15} /><Icon name="globe" x={-125} y={-125} size={250} color={GREEN} rot={t * 50} /></g> : null}
    {t > items[0].at + 0.8 ? <g transform={`translate(${x0 + 110},${-6}) scale(${sp(t, items[0].at + 0.8, 9, 220)})`}><Icon name="trophy" x={-30} y={-6} size={60} color="#F59E0B" /></g> : null}
    <Src />
  </Svg>;
};

// 6. Weekly trend: W1 -> W2 (-47 %), W3 only 3 days
const weekTrend: React.FC<SceneProps> = ({ t, cue }) => {
  const T1 = cue("565") - 0.2, T2 = cue("299") - 0.2, Tp = cue("47%") - 0.15;
  const data: [string, string, number, number][] = [["हफ्ता 1", "8 दिन", 564.6, T1], ["हफ्ता 2", "7 दिन", 299.15, T2], ["हफ्ता 3", "सिर्फ 3 दिन", 79, T2 + 0.7]];
  const base = 450, top = 130, max = 600, cw = 210, gap = 110, x0 = (CW - (3 * cw + 2 * gap)) / 2;
  const Y = (v: number) => base - (base - top) * v / max;
  const ka = ease((t - Tp) / 0.5), kb = sp(t, Tp + 0.3, 9, 220);
  return <Svg>
    <Pill x={65} y={0} text="रामायण · इंडिया नेट · हफ्तेवार" color="#F59E0B" icon="chart-column" k={sp(t, 0.05)} size={22} />
    <line x1={65} x2={1015} y1={base} y2={base} stroke={B.ink} strokeWidth={4} />
    {data.map(([n, dd, v, at], i) => { const g = ease((t - at) / 0.7); const x = x0 + i * (cw + gap); const h = (base - Y(v)) * g;
      return <g key={i} opacity={t > at - 0.05 ? 1 : 0.2}>
        <rect x={x} y={base - h} width={cw} height={h} rx={14} fill={i === 2 ? "#fcd34d" : "#F59E0B"} />
        {i === 2 ? <rect x={x} y={base - h} width={cw} height={h} rx={14} fill="none" stroke="#b45309" strokeWidth={3} strokeDasharray="10 8" /> : null}
        {t > at ? <text x={x + cw / 2} y={base - h - 16} textAnchor="middle" fontFamily={FONT} fontWeight={900} fontSize={48} fill={B.ink}>₹{fmt(countUp(t, at, v, 0.7), v % 1 ? 2 : 0)}</text> : null}
        <text x={x + cw / 2} y={base + 44} textAnchor="middle" fontFamily={HF} fontWeight={900} fontSize={32} fill={B.ink}>{n}</text>
        <text x={x + cw / 2} y={base + 80} textAnchor="middle" fontFamily={HF} fontWeight={700} fontSize={24} fill={i === 2 ? "#b45309" : B.grey}>{dd}</text>
      </g>; })}
    {t > Tp ? <g>
      <path d={`M${x0 + cw / 2},${Y(564.6) - 70} Q${x0 + cw + gap / 2},${Y(564.6) - 120} ${x0 + cw + gap + cw / 2},${Y(299.15) - 75}`} pathLength={1} fill="none" stroke={RED} strokeWidth={8} strokeDasharray={`${ka} 1`} strokeLinecap="round" />
      <g transform={`translate(${x0 + 2 * (cw + gap) + cw / 2},${Y(299.15) - 40}) scale(${kb})`}><rect x={-110} y={-46} width={220} height={92} rx={46} fill={RED} filter="url(#shadow)" />
        <text y={20} textAnchor="middle" fontFamily={FONT} fontWeight={900} fontSize={54} fill="#fff">−47%</text></g>
    </g> : null}
    <Src />
  </Svg>;
};

// 7. Third weekend line chart with last Sunday's 75 as a ghost line
const weekendLine: React.FC<SceneProps> = ({ t, cue }) => {
  const TF = cue("1575") - 0.2, TS = cue("3560") - 0.2, TP = cue("पिछला") - 0.1;
  const pts: [string, number, number][] = [["शुक्र · D16", 15.75, TF], ["शनि · D17", 27.65, (TF + TS) / 2 + 0.2], ["रवि · D18", 35.6, TS]];
  const L = 130, R = 1000, T = 70, Bm = 480, max = 80;
  const X = (i: number) => L + 90 + i * ((R - L - 180) / 2), Y = (v: number) => Bm - (Bm - T) * v / max;
  const shown = pts.filter((p) => t > p[2]); const d = shown.map((p, i) => `${i ? "L" : "M"}${X(i)},${Y(p[1])}`).join(" ");
  const kg = ease((t - TP) / 0.4);
  return <Svg>
    <Pill x={65} y={0} text="तीसरा वीकेंड · रोज़ का इंडिया नेट" color={GREEN} icon="trending-up" k={sp(t, 0.05)} size={22} />
    <rect x={65} y={52} width={950} height={500} rx={24} fill="#fff" filter="url(#shadow)" />
    {[0, 20, 40, 60, 80].map((v) => <g key={v}><line x1={L} x2={R} y1={Y(v)} y2={Y(v)} stroke="#e2e8f0" strokeWidth={2} />
      <text x={L - 12} y={Y(v) + 8} textAnchor="end" fontFamily={FONT} fontWeight={700} fontSize={22} fill="#94a3b8">{v}</text></g>)}
    {kg > 0 ? <g opacity={kg}><line x1={L} x2={L + (R - L) * kg} y1={Y(75)} y2={Y(75)} stroke={RED} strokeWidth={5} strokeDasharray="14 10" />
      <rect x={R - 400} y={Y(75) + 10} width={390} height={44} rx={22} fill="#fff5f5" stroke={RED} strokeWidth={2} />
      <text x={R - 205} y={Y(75) + 41} textAnchor="middle" fontFamily={HF} fontWeight={800} fontSize={24} fill={RED}>पिछला रविवार · ₹75 Cr</text></g> : null}
    {shown.length > 1 ? <path d={d} fill="none" stroke={GREEN} strokeWidth={9} strokeLinecap="round" strokeLinejoin="round" /> : null}
    {pts.map(([n, v, at], i) => { const k = sp(t, at, 10, 220); return <g key={i}>
      <text x={X(i)} y={Bm + 40} textAnchor="middle" fontFamily={HF} fontWeight={800} fontSize={26} fill={B.ink}>{n}</text>
      {t > at ? <g transform={`translate(${X(i)},${Y(v)}) scale(${k})`}><circle r={20} fill={GREEN} stroke="#fff" strokeWidth={6} />
        <text y={-34} textAnchor="middle" fontFamily={FONT} fontWeight={900} fontSize={i === 1 ? 28 : 44} fill={i === 1 ? B.grey : B.ink}>{i === 1 ? "≈₹27.65" : `₹${fmt(v, 2)}`}</text></g> : null}
    </g>; })}
    <Src extra="शनि = 79 − शुक्र − रवि" />
  </Svg>;
};

// 8. Scenario bars from today's 1,693.5 crossing the rivals' lines toward 2,000 (zoomed scale)
const scenarioBars: React.FC<SceneProps> = ({ t, cue }) => {
  const Tm = cue("मॉडल") - 0.2;
  const sc: [string, number, number][] = [["कंज़र्वेटिव", 1790, cue("1790") - 0.2], ["बेस केस", 1870, cue("1870") - 0.2], ["स्ट्रॉन्ग होल्ड", 1974, cue("1974") - 0.2]];
  const base = 520, top = 40, lo = 1600, hi = 2050; const Y = (v: number) => base - (base - top) * (v - lo) / (hi - lo);
  const lines: [string, number, string][] = [["₹2,000", 2000, "#F59E0B"], ["धुरंधर 2 · 1,813", 1813.39, MV.dh2.c], ["बाहुबली 2 · 1,788", 1788.06, MV.bb2.c]];
  const cx = [480, 690, 900], bw = 140;
  return <Svg>
    <rect x={65} y={10} width={950} height={545} rx={24} fill="#fff" filter="url(#shadow)" />
    {lines.map(([n, v, c], i) => { const k = ease((t - Tm - i * 0.15) / 0.4); return <g key={i} opacity={k}>
      <line x1={85} x2={85 + 915 * k} y1={Y(v)} y2={Y(v)} stroke={c} strokeWidth={4} strokeDasharray={i === 0 ? "16 10" : "6 8"} />
      <text x={90} y={Y(v) + (i === 2 ? 30 : -10)} fontFamily={HF} fontWeight={800} fontSize={24} fill={c}>{n}</text></g>; })}
    <line x1={85} x2={1000} y1={Y(1693.5)} y2={Y(1693.5)} stroke={B.slate} strokeWidth={3} />
    <text x={90} y={Y(1693.5) + 30} fontFamily={HF} fontWeight={800} fontSize={24} fill={B.slate}>आज · 1,693.5</text>
    {sc.map(([n, v, at], i) => { const g = ease((t - at) / 0.8); const yv = Y(1693.5) - (Y(1693.5) - Y(v)) * g; const x = cx[i] - bw / 2;
      return <g key={i} opacity={t > at - 0.1 ? 1 : 0.25}>
        <rect x={x} y={Y(1693.5)} width={bw} height={base - Y(1693.5)} fill="#F59E0B" />
        <rect x={x} y={yv} width={bw} height={Y(1693.5) - yv} fill={i === 2 ? GREEN : "#fbbf24"} />
        {t > at ? <text x={cx[i]} y={yv - 14} textAnchor="middle" fontFamily={FONT} fontWeight={900} fontSize={38} fill={B.ink}>₹{fmt(1693.5 + (v - 1693.5) * g)}</text> : null}
        <text x={cx[i]} y={base - 14} textAnchor="middle" fontFamily={HF} fontWeight={800} fontSize={22} fill="#fff">{n}</text>
      </g>; })}
    <Src extra="सीनेरियो हमारे अनुमान, ट्रेड प्रेडिक्शन नहीं" />
  </Svg>;
};

// 9. ₹2,000 Cr gauge
const twoKGauge: React.FC<SceneProps> = ({ t, cue }) => {
  const T2 = cue("2000") - 0.2, Th = cue("होल्ड") - 0.2;
  const cx = 540, cy = 300, r = 230, a0 = Math.PI * 0.8, a1 = Math.PI * 2.2;
  const arc = (f: number) => { const a = a0 + (a1 - a0) * f; return `M${cx + r * Math.cos(a0)},${cy + r * Math.sin(a0)} A${r},${r} 0 ${a - a0 > Math.PI ? 1 : 0} 1 ${cx + r * Math.cos(a)},${cy + r * Math.sin(a)}`; };
  const f1 = (1693.5 / 2000) * ease((t - T2) / 1.0), f2 = 1693.5 / 2000 + ((1974 - 1693.5) / 2000) * ease((t - Th) / 0.8);
  return <Svg>
    <path d={arc(1)} fill="none" stroke="#e2e8f0" strokeWidth={44} strokeLinecap="round" />
    {t > Th ? <path d={arc(f2)} fill="none" stroke={GREEN} strokeWidth={44} strokeLinecap="round" opacity={0.45} /> : null}
    {f1 > 0.001 ? <path d={arc(f1)} fill="none" stroke="#F59E0B" strokeWidth={44} strokeLinecap="round" /> : null}
    <text x={cx} y={cy - 10} textAnchor="middle" fontFamily={FONT} fontWeight={900} fontSize={84} fill={B.ink}>₹{fmt(2000 * f1, 1)}</text>
    <text x={cx} y={cy + 40} textAnchor="middle" fontFamily={HF} fontWeight={800} fontSize={30} fill={B.grey}>/ ₹2,000 करोड़</text>
    {t > T2 + 0.9 ? <g transform={`translate(${cx},${cy + 150}) scale(${sp(t, T2 + 0.9)})`}><rect x={-240} y={-38} width={480} height={76} rx={38} fill="#fff5f5" stroke={RED} strokeWidth={3} />
      <text y={12} textAnchor="middle" fontFamily={HF} fontWeight={900} fontSize={32} fill={RED}>₹306.5 करोड़ और चाहिए</text></g> : null}
    {t > Th ? <g opacity={ease((t - Th - 0.6) / 0.3)} transform="translate(-120,0)"><Pill x={540} y={530} text="स्ट्रॉन्ग होल्ड → ≈ ₹1,974" color={GREEN} icon="trending-up" size={24} /></g> : null}
  </Svg>;
};

// 10. Prediction poll (no fake results)
const predictPoll: React.FC<SceneProps> = ({ t, cue }) => {
  const opts: [string, number][] = [["₹1,800 Cr", cue("1800") - 0.2], ["₹1,900 Cr", cue("1900") - 0.2], ["₹2,000+ Cr", cue("2000") - 0.2]];
  const Tc = cue("कमेंट") - 0.2;
  const hover = Math.min(2, Math.max(0, Math.floor((t - opts[0][1]) / 0.6)));
  return <Svg>
    <rect x={65} y={5} width={950} height={585} rx={36} fill="#fff" filter="url(#shadow)" />
    <Poster m="ram" img="ramayana ram" x={95} y={28} w={104} h={148} k={sp(t, 0.05)} />
    <text x={230} y={92} fontFamily={HF} fontWeight={900} fontSize={46} fill={B.ink}>रामायण कहां रुकेगी?</text>
    <text x={230} y={136} fontFamily={FONT} fontWeight={800} fontSize={24} fill={B.grey} letterSpacing={2}>WHERE WILL IT FINISH?</text>
    {opts.map(([s, at], i) => { const k = sp(t, at, 11, 190); const on = t > opts[0][1] && hover === i && t < Tc + 0.6;
      return <g key={i} transform={`translate(520,${240 + i * 112}) scale(${k * (on ? 1.04 : 1)})`}>
        <rect x={-380} y={-46} width={760} height={92} rx={46} fill={on ? "#FEF3C7" : "#f8fafc"} stroke={i === 2 ? GREEN : "#F59E0B"} strokeWidth={on ? 6 : 4} />
        <circle cx={-320} cy={0} r={24} fill="none" stroke={B.grey} strokeWidth={4} />{on ? <circle cx={-320} cy={0} r={13} fill="#F59E0B" /> : null}
        <text x={-270} y={18} fontFamily={FONT} fontWeight={900} fontSize={52} fill={B.ink}>{s}</text></g>; })}
    {t > opts[0][1] && t < Tc + 0.6 ? <path transform={`translate(${760 + Math.sin(t * 3) * 8},${246 + hover * 112})`} d="M0,0 L0,52 L13,40 L23,62 L32,58 L22,36 L40,36 Z" fill="#fff" stroke={B.ink} strokeWidth={4} strokeLinejoin="round" /> : null}
    {t > Tc ? <g transform={`translate(520,${548 + Math.sin(t * 6) * 4}) scale(${sp(t, Tc, 10, 200)})`}><rect x={-200} y={-30} width={400} height={60} rx={30} fill={B.blue} />
      <Icon name="message-square" x={-180} y={-20} size={40} color="#fff" /><text x={24} y={11} textAnchor="middle" fontFamily={HF} fontWeight={900} fontSize={30} fill="#fff">कमेंट करें 👇</text></g> : null}
  </Svg>;
};

export const SAFE_SCENES: Record<string, React.FC<SceneProps>> = { raceHook, worldBoard, gapZoom, indiaNet, overseasFlip, weekTrend, weekendLine, scenarioBars, twoKGauge, predictPoll };
void cl;
