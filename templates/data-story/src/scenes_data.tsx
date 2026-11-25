// Data-story scenes (skill: data-story-reel). Every scene is DATA-DRIVEN: it reads `data` from its script.json section and
// `entities` / `source` from the top of script.json, so a new stats reel needs a script, not new code.
// Canvas 1080 x 600 placed at y 470-1070 of the 1080x1920 frame (Instagram safe band); content inside x 65..1015.
// Cue strings are display words of the section ("1813", "आगे", "47%"); numbers match without ₹ or commas.
import React from "react";
import { random, staticFile } from "remotion";
import { Icon } from "./icon";
import SCRIPT from "../script.json";
import POSTERS from "./posters.json";
import { Defs, Stamp, sp, ease, cl, fmt, B } from "./scenes";
import type { SceneProps } from "./scenes";

export const CW = 1080, CH = 600;
type DP = SceneProps & { data?: any };
type Ent = { name: string; en?: string; color: string; dark?: string; poster?: string };
const SC = SCRIPT as any;
const ENT: Record<string, Ent> = SC.entities ?? {};
const FONT = "Inter, 'Noto Sans Devanagari', 'Nirmala UI', 'Segoe UI', sans-serif";
const RED = "#E5252A", GREEN = "#16A34A", AMBER = "#F59E0B";
const col = (c?: string) => (c && ({ red: RED, green: GREEN, amber: AMBER, blue: "#2563EB", cyan: "#06B6D4", violet: "#8B5CF6", slate: "#334155", saffron: "#FF9933" } as Record<string, string>)[c]) ?? c ?? "#2563EB";
const cueAt = (cue: SceneProps["cue"], w: any, dflt: number) => (w === undefined || w === null ? dflt : typeof w === "number" ? w : cue(String(w)));
const dec = (v: number) => (Math.abs(v % 1) > 1e-9 ? 2 : 0);
const cnt = (t: number, at: number, v: number, dur = 0.8) => v * ease((t - at) / dur);

/** Poster card for an entity: drawn title card always, the user's poster image on top when it exists (brand/cards). */
export const EPoster: React.FC<{ id: string; x: number; y: number; w: number; h: number; k?: number; dim?: number; ring?: string; img?: string }> = ({ id, x, y, w, h, k = 1, dim = 0, ring, img }) => {
  const e = ENT[id] ?? { name: id, color: "#64748b" }; const P = POSTERS as Record<string, string>;
  const file = P[(img ?? e.poster ?? id).toLowerCase()]; const cid = `ep-${id}-${Math.round(w)}-${Math.round(h)}`; const r = Math.min(w, h) * 0.08;
  return <g transform={`translate(${x + w / 2},${y + h / 2}) scale(${k}) translate(${-w / 2},${-h / 2})`} opacity={cl(k * 1.6)}>
    <defs><clipPath id={cid}><rect width={w} height={h} rx={r} /></clipPath>
      <linearGradient id={`${cid}g`} x1="0" y1="0" x2="0" y2="1"><stop offset="0" stopColor={e.dark ?? "#1e293b"} /><stop offset="1" stopColor="#0B1220" /></linearGradient></defs>
    <rect width={w} height={h} rx={r} fill={`url(#${cid}g)`} filter="url(#shadow)" />
    <g clipPath={`url(#${cid})`}>
      <circle cx={w / 2} cy={h * 0.36} r={w * 0.42} fill={e.color} opacity={0.22} /><circle cx={w / 2} cy={h * 0.36} r={w * 0.26} fill={e.color} opacity={0.35} />
      <text x={w / 2} y={h * 0.74} textAnchor="middle" fontFamily={FONT} fontWeight={900} fontSize={w * 0.16} fill="#fff">{e.name}</text>
      {e.en ? <text x={w / 2} y={h * 0.86} textAnchor="middle" fontFamily={FONT} fontWeight={800} fontSize={w * 0.07} fill={e.color} letterSpacing={2}>{e.en}</text> : null}
      {file ? <image href={staticFile(`brand/cards/${file}`)} width={w} height={h} preserveAspectRatio="xMidYMid slice" /> : null}
      {dim > 0 ? <rect width={w} height={h} fill="#0B1220" opacity={dim * 0.6} /> : null}
    </g>
    <rect width={w} height={h} rx={r} fill="none" stroke={ring ?? e.color} strokeWidth={ring ? 8 : 4} />
  </g>;
};
const Pill: React.FC<{ x: number; y: number; text: string; color: string; k?: number; size?: number; icon?: string; dark?: boolean }> = ({ x, y, text, color, k = 1, size = 22, icon, dark = true }) => {
  const w = text.length * size * 0.6 + (icon ? size * 1.6 : 0) + 40;
  return <g transform={`translate(${x},${y}) scale(${k})`} opacity={cl(k * 1.5)}>
    <rect width={w} height={size * 1.8} rx={size * 0.9} fill={dark ? color : "#fff"} stroke={color} strokeWidth={3} />
    {icon ? <Icon name={icon} x={16} y={size * 0.3} size={size * 1.2} color={dark ? "#fff" : color} /> : null}
    <text x={(icon ? size * 1.6 : 0) + 20} y={size * 1.24} fontFamily={FONT} fontWeight={800} fontSize={size} fill={dark ? "#fff" : color}>{text}</text>
  </g>;
};
const Src: React.FC<{ extra?: string; hide?: boolean }> = ({ extra, hide }) => hide || !SC.source ? null : (
  <text x={CW / 2} y={CH - 6} textAnchor="middle" fontFamily={FONT} fontWeight={600} fontSize={19} fill="#94a3b8">{SC.source}{extra ? ` · ${extra}` : ""}</text>
);
const Svg: React.FC<{ children: React.ReactNode }> = ({ children }) => <svg width={CW} height={CH} style={{ overflow: "visible" }}><Defs />{children}</svg>;
const Label: React.FC<{ d: any; t: number }> = ({ d, t }) => d?.label ? <Pill x={65} y={0} text={d.label} color={col(d.labelColor)} icon={d.labelIcon} k={sp(t, 0.05)} /> : null;

// ------------------------------------------------------------------ 1. posterFaceoff (hook)
// data: { center, sides:[id,id], badge?:{text, icon?, color?, cue}, stamp?:{text, cue, color?}, ranks?:[{id, n}] (shown at stamp cue), centerImg? }
const posterFaceoff: React.FC<DP> = ({ t, cue, data: d }) => {
  const Tb = d.badge ? cueAt(cue, d.badge.cue, 1) - 0.15 : 1e9, Ts = d.stamp ? cueAt(cue, d.stamp.cue, 2) - 0.15 : 1e9;
  const kc = sp(t, 0.05, 12, 140), kl = sp(t, 0.3), kr = sp(t, 0.45), ko = sp(t, Tb, 10, 200), ks = sp(t, Ts, 9, 240);
  const shake = t > Ts ? Math.sin((t - Ts) * 55) * 12 * Math.exp(-(t - Ts) * 4) : 0;
  const xs: Record<string, number> = { [d.sides?.[0]]: 220, [d.center]: 540, [d.sides?.[1]]: 860 };
  const bc = col(d.badge?.color ?? "green");
  return <Svg><g transform={`translate(${shake},0)`}>
    {d.sides?.[0] ? <EPoster id={d.sides[0]} x={95} y={95 + Math.sin(t * 1.5) * 5} w={250} h={355} k={kl} /> : null}
    {d.sides?.[1] ? <EPoster id={d.sides[1]} x={735} y={95 + Math.cos(t * 1.5) * 5} w={250} h={355} k={kr} /> : null}
    <EPoster id={d.center} img={d.centerImg} x={380} y={30} w={320} h={455} k={kc} ring={t > Tb && t < Ts ? bc : undefined} />
    {t > Tb ? <g transform={`translate(540,58) scale(${ko})`}><rect x={-170} y={-32} width={340} height={64} rx={32} fill={bc} filter="url(#shadow)" />
      {d.badge.icon ? <Icon name={d.badge.icon} x={-155} y={-22} size={44} color="#fff" rot={t * 40} /> : null}
      <text x={22} y={12} textAnchor="middle" fontFamily={FONT} fontWeight={900} fontSize={30} fill="#fff">{d.badge.text}</text></g> : null}
    {t > Ts ? (d.ranks ?? []).map((r: any, i: number) => { const k = sp(t, Ts + 0.15 + i * 0.12, 10, 220);
      return <g key={r.id} transform={`translate(${xs[r.id] ?? 540},540) scale(${k})`}><circle r={48} fill={r.id === d.center ? RED : B.navy} filter="url(#shadow)" />
        <text y={17} textAnchor="middle" fontFamily={FONT} fontWeight={900} fontSize={46} fill="#fff">#{r.n}</text></g>; }) : null}
    {t > Ts ? <Stamp x={540} y={270} text={d.stamp.text} color={col(d.stamp.color ?? "red")} k={ks} rot={-8} size={56} /> : null}
  </g></Svg>;
};

// ------------------------------------------------------------------ 2. leaderboard (horizontal, zero-based)
// data: { rows:[{id, v, cue}], max, unit?, highlight? }
const leaderboard: React.FC<DP> = ({ t, cue, data: d }) => {
  const n = d.rows.length, rh = Math.min(186, 560 / n), pw = rh * 0.63;
  return <Svg>
    {d.rows.map((r: any, i: number) => { const at = cueAt(cue, r.cue, 0.3 + i * 0.6) - 0.3; const g = ease((t - at) / 0.9); const y = 12 + i * rh; const bw = (r.v / d.max) * 640 * g; const on = t > at; const e = ENT[r.id];
      return <g key={r.id} opacity={on ? 1 : 0.22}>
        <EPoster id={r.id} x={65} y={y} w={pw} h={rh - 18} k={on ? sp(t, at) : 1} ring={d.highlight === r.id && on ? AMBER : undefined} />
        <text x={215} y={y + 46} fontFamily={FONT} fontWeight={900} fontSize={34} fill={B.ink}>#{i + 1}  {e?.name ?? r.id}</text>
        <rect x={215} y={y + 68} width={640} height={rh - 98} rx={18} fill="#e2e8f0" />
        <rect x={215} y={y + 68} width={Math.max(0, bw)} height={rh - 98} rx={18} fill={e?.color ?? "#2563EB"} />
        <text x={Math.max(470, 215 + bw - 18)} y={y + 68 + (rh - 98) / 2 + 20} textAnchor="end" fontFamily={FONT} fontWeight={900} fontSize={56} fill="#fff">{d.unit ?? ""}{fmt(cnt(t, at, r.v, 0.9))}</text>
      </g>; })}
    {d.note ? <text x={1015} y={40} textAnchor="end" fontFamily={FONT} fontWeight={700} fontSize={22} fill={B.grey}>{d.note}</text> : null}
    <Src />
  </Svg>;
};

// ------------------------------------------------------------------ 3. gapRuler (zoomed axis, labelled)
// data: { lo, hi, step, from:{id, v}, marks:[{id, v}], gaps:[{v, d, cue, label}], zoomLabel, unit }
const gapRuler: React.FC<DP> = ({ t, cue, data: d }) => {
  const X = (v: number) => 65 + ((v - d.lo) / (d.hi - d.lo)) * 950, ry = 270, kr = sp(t, 0.05);
  const ticks: number[] = []; for (let v = d.lo; v <= d.hi + 1e-6; v += d.step) ticks.push(v);
  return <Svg>
    <Pill x={65} y={0} text={d.zoomLabel} color={B.slate} icon="search" k={kr} />
    <g opacity={kr}><line x1={65} x2={1015} y1={ry} y2={ry} stroke={B.ink} strokeWidth={5} />
      {ticks.map((v) => <g key={v}><line x1={X(v)} x2={X(v)} y1={ry - 12} y2={ry + 12} stroke={B.ink} strokeWidth={4} />
        <text x={Math.min(990, Math.max(90, X(v)))} y={ry + 42} textAnchor="middle" fontFamily={FONT} fontWeight={700} fontSize={22} fill={B.grey}>{fmt(v)}</text></g>)}</g>
    {d.marks.map((m: any, i: number) => { const k = sp(t, 0.2 + i * 0.15, 12, 180); const x = X(m.v); const c = ENT[m.id]?.color ?? "#64748b";
      return <g key={m.id}><line x1={x} x2={x} y1={ry} y2={200} stroke={c} strokeWidth={4} opacity={k} />
        <circle cx={x} cy={ry} r={13} fill={c} stroke="#fff" strokeWidth={4} opacity={k} />
        <EPoster id={m.id} x={x - 48} y={60} w={96} h={136} k={k} /></g>; })}
    {d.gaps.map((gp: any, i: number) => { const T = cueAt(cue, gp.cue, 1 + i) - 0.2; if (t < T) return null; const g = ease((t - T) / 0.7);
      const x0 = X(d.from.v), x1 = x0 + (X(gp.v) - x0) * g, y = 345 + i * 115;
      return <g key={i}>
        <path d={`M${x0},${y - 30} L${x0},${y} L${x1},${y} L${x1},${y - 30}`} fill="none" stroke={RED} strokeWidth={7} strokeLinejoin="round" />
        <g transform={`translate(${Math.min(x0 - 20, 1015 - 560)},${y + 12})`}><rect width={560} height={84} rx={22} fill="#fff5f5" stroke={RED} strokeWidth={3} />
          <text x={22} y={58} fontFamily={FONT} fontWeight={900} fontSize={44} fill={RED}>−{d.unit ?? ""}{fmt(cnt(t, T, gp.d, 0.7), dec(gp.d))}{d.suffix ?? ""}</text>
          <text x={540} y={56} textAnchor="end" fontFamily={FONT} fontWeight={700} fontSize={24} fill={B.grey}>{gp.label}</text></g>
      </g>; })}
  </Svg>;
};

// ------------------------------------------------------------------ 4. vbars (vertical, zero-based, posters under the base)
// data: { items:[{id, v, cue}], max, unit?, label, labelColor?, labelIcon?, win?, intro?:{cue, icon, color}, trophy? }
const vbars: React.FC<DP> = ({ t, cue, data: d }) => {
  const n = d.items.length, base = 400, top = 120, cw = Math.min(220, 860 / n), gap = (950 - n * cw) / Math.max(1, n + 1), x0 = 65 + gap;
  const at0 = cueAt(cue, d.items[0].cue, 0.5) - 0.2; const Ti = d.intro ? cueAt(cue, d.intro.cue, 0.3) - 0.2 : 1e9;
  const kg = sp(t, Ti, 11, 150), mv = ease((t - at0 + 0.3) / 0.5);
  return <Svg>
    <Label d={d} t={t} />
    <line x1={65} x2={1015} y1={base} y2={base} stroke={B.ink} strokeWidth={4} />
    {d.items.map((it: any, i: number) => { const at = cueAt(cue, it.cue, 0.5 + i * 0.6) - 0.2; const x = x0 + i * (cw + gap); const g = ease((t - at) / 0.8); const h = ((base - top) * it.v / d.max) * g; const on = t > at; const c = ENT[it.id]?.color ?? col(it.color);
      return <g key={it.id ?? i}>
        {on ? <rect x={x + 25} y={base - h} width={cw - 50} height={h} rx={14} fill={c} /> : null}
        {on && g > 0.95 ? <rect x={x + 25} y={base - h + ((t * 0.9 + i * 0.37) % 1) * h - 20} width={cw - 50} height={40} fill="#fff" opacity={0.22} /> : null}
        {d.win === it.id && g > 0.9 ? <rect x={x + 17} y={base - h - 8} width={cw - 34} height={h + 8} rx={18} fill="none" stroke={GREEN} strokeWidth={7} opacity={0.6 + 0.4 * Math.sin(t * 8)} /> : null}
        {on ? <text x={x + cw / 2} y={base - h - 18} textAnchor="middle" fontFamily={FONT} fontWeight={900} fontSize={52} fill={B.ink}>{d.unit ?? ""}{fmt(cnt(t, at, it.v, 0.8), d.decimals ?? 0)}</text> : null}
        {ENT[it.id] ? <EPoster id={it.id} x={x + cw / 2 - 52} y={base + 16} w={104} h={148} k={sp(t, Math.min(at - 0.2, 0.1 + i * 0.12))} dim={on ? 0 : 0.5} ring={on ? undefined : "#cbd5e1"} />
          : <text x={x + cw / 2} y={base + 44} textAnchor="middle" fontFamily={FONT} fontWeight={900} fontSize={30} fill={B.ink}>{it.name}</text>}
        {d.trophy && d.win === it.id && t > at + 0.8 ? <g transform={`translate(${x + cw + 6},${base - h - 40}) scale(${sp(t, at + 0.8, 9, 220)})`}><Icon name="trophy" x={-30} y={-30} size={60} color={AMBER} /></g> : null}
      </g>; })}
    {t > Ti && mv < 1 ? <g transform={`translate(540,260) scale(${kg * (1 - mv * 0.8)})`} opacity={1 - mv}><circle r={150} fill={col(d.intro.color)} opacity={0.15} /><Icon name={d.intro.icon} x={-125} y={-125} size={250} color={col(d.intro.color)} rot={t * 50} /></g> : null}
    <Src />
  </Svg>;
};

// ------------------------------------------------------------------ 5. trendBars (period bars + drop arrow)
// data: { items:[{name, sub, v, cue, partial?}], max, unit?, label, drop?:{from, to, text, cue} }
const trendBars: React.FC<DP> = ({ t, cue, data: d }) => {
  const n = d.items.length, base = 450, top = 130, cw = Math.min(210, 800 / n), gap = (950 - n * cw) / (n + 1), x0 = 65 + gap;
  const Y = (v: number) => base - (base - top) * v / d.max; const Tp = d.drop ? cueAt(cue, d.drop.cue, 2) - 0.15 : 1e9;
  const ka = ease((t - Tp) / 0.5), kb = sp(t, Tp + 0.3, 9, 220);
  const ats = d.items.map((it: any, i: number) => cueAt(cue, it.cue, 0.4 + i * 0.7) - 0.2);
  return <Svg>
    <Label d={d} t={t} />
    <line x1={65} x2={1015} y1={base} y2={base} stroke={B.ink} strokeWidth={4} />
    {d.items.map((it: any, i: number) => { const at = ats[i]; const g = ease((t - at) / 0.7); const x = x0 + i * (cw + gap); const h = (base - Y(it.v)) * g; const c = col(it.color ?? d.color ?? "amber");
      return <g key={i} opacity={t > at - 0.05 ? 1 : 0.2}>
        <rect x={x} y={base - h} width={cw} height={h} rx={14} fill={c} opacity={it.partial ? 0.55 : 1} />
        {it.partial ? <rect x={x} y={base - h} width={cw} height={h} rx={14} fill="none" stroke="#b45309" strokeWidth={3} strokeDasharray="10 8" /> : null}
        {t > at ? <text x={x + cw / 2} y={base - h - 16} textAnchor="middle" fontFamily={FONT} fontWeight={900} fontSize={48} fill={B.ink}>{d.unit ?? ""}{fmt(cnt(t, at, it.v, 0.7), dec(it.v))}</text> : null}
        <text x={x + cw / 2} y={base + 44} textAnchor="middle" fontFamily={FONT} fontWeight={900} fontSize={32} fill={B.ink}>{it.name}</text>
        {it.sub ? <text x={x + cw / 2} y={base + 80} textAnchor="middle" fontFamily={FONT} fontWeight={700} fontSize={24} fill={it.partial ? "#b45309" : B.grey}>{it.sub}</text> : null}
      </g>; })}
    {d.drop && t > Tp ? (() => { const a = d.drop.from, b = d.drop.to; const xa = x0 + a * (cw + gap) + cw / 2, xb = x0 + b * (cw + gap) + cw / 2;
      return <g><path d={`M${xa},${Y(d.items[a].v) - 70} Q${(xa + xb) / 2},${Y(d.items[a].v) - 120} ${xb},${Y(d.items[b].v) - 75}`} pathLength={1} fill="none" stroke={RED} strokeWidth={8} strokeDasharray={`${ka} 1`} strokeLinecap="round" />
        <g transform={`translate(${Math.min(900, xb + cw + gap / 2)},${Y(d.items[b].v) - 40}) scale(${kb})`}><rect x={-110} y={-46} width={220} height={92} rx={46} fill={RED} filter="url(#shadow)" />
          <text y={20} textAnchor="middle" fontFamily={FONT} fontWeight={900} fontSize={54} fill="#fff">{d.drop.text}</text></g></g>; })() : null}
    <Src />
  </Svg>;
};

// ------------------------------------------------------------------ 6. lineChart (few points + optional ghost reference line)
// data: { points:[{name, v, cue?, approx?}], max, ticks:[...], unit?, label, ghost?:{v, text, cue}, srcExtra? }
const lineChart: React.FC<DP> = ({ t, cue, data: d }) => {
  const L = 130, R = 1000, T = 70, Bm = 480, n = d.points.length;
  const X = (i: number) => L + 90 + i * ((R - L - 180) / Math.max(1, n - 1)), Y = (v: number) => Bm - (Bm - T) * v / d.max;
  const ats: number[] = d.points.map((p: any) => (p.cue !== undefined ? cueAt(cue, p.cue, 0.5) - 0.2 : NaN));
  for (let i = 0; i < n; i++) if (isNaN(ats[i])) { const a = ats[i - 1] ?? 0.3, b = ats.slice(i + 1).find((x) => !isNaN(x)) ?? a + 1; ats[i] = (a + b) / 2 + 0.1; }
  const shown = d.points.map((p: any, i: number) => ({ p, i })).filter(({ i }: any) => t > ats[i]);
  const path = shown.map(({ p, i }: any, j: number) => `${j ? "L" : "M"}${X(i)},${Y(p.v)}`).join(" ");
  const Tg = d.ghost ? cueAt(cue, d.ghost.cue, 3) - 0.1 : 1e9; const kg = ease((t - Tg) / 0.4); const lc = col(d.color ?? "green");
  return <Svg>
    <Label d={d} t={t} />
    <rect x={65} y={52} width={950} height={500} rx={24} fill="#fff" filter="url(#shadow)" />
    {(d.ticks ?? []).map((v: number) => <g key={v}><line x1={L} x2={R} y1={Y(v)} y2={Y(v)} stroke="#e2e8f0" strokeWidth={2} />
      <text x={L - 12} y={Y(v) + 8} textAnchor="end" fontFamily={FONT} fontWeight={700} fontSize={22} fill="#94a3b8">{v}</text></g>)}
    {d.ghost && kg > 0 ? <g opacity={kg}><line x1={L} x2={L + (R - L) * kg} y1={Y(d.ghost.v)} y2={Y(d.ghost.v)} stroke={RED} strokeWidth={5} strokeDasharray="14 10" />
      <rect x={R - 400} y={Y(d.ghost.v) + 10} width={390} height={44} rx={22} fill="#fff5f5" stroke={RED} strokeWidth={2} />
      <text x={R - 205} y={Y(d.ghost.v) + 41} textAnchor="middle" fontFamily={FONT} fontWeight={800} fontSize={24} fill={RED}>{d.ghost.text}</text></g> : null}
    {shown.length > 1 ? <path d={path} fill="none" stroke={lc} strokeWidth={9} strokeLinecap="round" strokeLinejoin="round" /> : null}
    {d.points.map((p: any, i: number) => { const k = sp(t, ats[i], 10, 220); return <g key={i}>
      <text x={X(i)} y={Bm + 40} textAnchor="middle" fontFamily={FONT} fontWeight={800} fontSize={26} fill={B.ink}>{p.name}</text>
      {t > ats[i] ? <g transform={`translate(${X(i)},${Y(p.v)}) scale(${k})`}><circle r={20} fill={lc} stroke="#fff" strokeWidth={6} />
        <text y={-34} textAnchor="middle" fontFamily={FONT} fontWeight={900} fontSize={p.approx ? 28 : 44} fill={p.approx ? B.grey : B.ink}>{p.approx ? "≈" : ""}{d.unit ?? ""}{fmt(p.v, dec(p.v))}</text></g> : null}
    </g>; })}
    <Src extra={d.srcExtra} />
  </Svg>;
};

// ------------------------------------------------------------------ 7. scenarios (zoomed bars from "now" crossing benchmark lines)
// data: { now, nowLabel, lo, hi, lines:[{text, v, color}], bars:[{name, v, cue, color?}], introCue, unit?, srcExtra }
const scenarios: React.FC<DP> = ({ t, cue, data: d }) => {
  const Tm = cueAt(cue, d.introCue, 0.2) - 0.2; const base = 520, top = 40; const Y = (v: number) => base - (base - top) * (v - d.lo) / (d.hi - d.lo);
  const n = d.bars.length, bw = 140, cx = d.bars.map((_: any, i: number) => 480 + i * ((900 - 480) / Math.max(1, n - 1)));
  return <Svg>
    <rect x={65} y={10} width={950} height={545} rx={24} fill="#fff" filter="url(#shadow)" />
    {d.lines.map((l: any, i: number) => { const k = ease((t - Tm - i * 0.15) / 0.4); const c = ENT[l.id]?.color ?? col(l.color); return <g key={i} opacity={k}>
      <line x1={85} x2={85 + 915 * k} y1={Y(l.v)} y2={Y(l.v)} stroke={c} strokeWidth={4} strokeDasharray={l.dash ?? (i === 0 ? "16 10" : "6 8")} />
      <text x={90} y={Y(l.v) + (l.below ? 30 : -10)} fontFamily={FONT} fontWeight={800} fontSize={24} fill={c}>{l.text}</text></g>; })}
    <line x1={85} x2={1000} y1={Y(d.now)} y2={Y(d.now)} stroke={B.slate} strokeWidth={3} />
    <text x={90} y={Y(d.now) + 30} fontFamily={FONT} fontWeight={800} fontSize={24} fill={B.slate}>{d.nowLabel}</text>
    {d.bars.map((b: any, i: number) => { const at = cueAt(cue, b.cue, 1 + i) - 0.2; const g = ease((t - at) / 0.8); const yv = Y(d.now) - (Y(d.now) - Y(b.v)) * g; const x = cx[i] - bw / 2;
      return <g key={i} opacity={t > at - 0.1 ? 1 : 0.25}>
        <rect x={x} y={Y(d.now)} width={bw} height={base - Y(d.now)} fill={AMBER} />
        <rect x={x} y={yv} width={bw} height={Y(d.now) - yv} fill={col(b.color ?? "#fbbf24")} />
        {t > at ? <text x={cx[i]} y={yv - 14} textAnchor="middle" fontFamily={FONT} fontWeight={900} fontSize={38} fill={B.ink}>{d.unit ?? ""}{fmt(d.now + (b.v - d.now) * g)}</text> : null}
        <text x={cx[i]} y={base - 14} textAnchor="middle" fontFamily={FONT} fontWeight={800} fontSize={22} fill="#fff">{b.name}</text>
      </g>; })}
    <Src extra={d.srcExtra} />
  </Svg>;
};

// ------------------------------------------------------------------ 8. gauge (progress to a target)
// data: { now, target, cue, unit, ofText, needText, alt?:{v, cue, text} }
const gauge: React.FC<DP> = ({ t, cue, data: d }) => {
  const T2 = cueAt(cue, d.cue, 0.3) - 0.2, Th = d.alt ? cueAt(cue, d.alt.cue, 2) - 0.2 : 1e9;
  const cx = 540, cy = 300, r = 230, a0 = Math.PI * 0.8, a1 = Math.PI * 2.2;
  const arc = (f: number) => { const a = a0 + (a1 - a0) * f; return `M${cx + r * Math.cos(a0)},${cy + r * Math.sin(a0)} A${r},${r} 0 ${a - a0 > Math.PI ? 1 : 0} 1 ${cx + r * Math.cos(a)},${cy + r * Math.sin(a)}`; };
  const f1 = (d.now / d.target) * ease((t - Math.min(T2, 0.4)) / 1.0), f2 = d.alt ? d.now / d.target + ((d.alt.v - d.now) / d.target) * ease((t - Th) / 0.8) : 0;
  return <Svg>
    <path d={arc(1)} fill="none" stroke="#e2e8f0" strokeWidth={44} strokeLinecap="round" />
    {t > Th ? <path d={arc(f2)} fill="none" stroke={GREEN} strokeWidth={44} strokeLinecap="round" opacity={0.45} /> : null}
    <path d={arc(1)} fill="none" stroke={AMBER} strokeWidth={58} strokeLinecap="round" opacity={0.08 + 0.08 * Math.sin(t * 5)} />
    {f1 > 0.001 ? <path d={arc(f1)} fill="none" stroke={AMBER} strokeWidth={44} strokeLinecap="round" /> : null}
    {f1 > 0.001 ? <path d={arc(f1)} fill="none" stroke="#fff" strokeWidth={10} strokeLinecap="round" strokeDasharray="30 90" strokeDashoffset={-t * 120} opacity={0.6} /> : null}
    <text x={cx} y={cy - 10} textAnchor="middle" fontFamily={FONT} fontWeight={900} fontSize={84} fill={B.ink}>{d.unit ?? ""}{fmt(d.target * f1, dec(d.now))}</text>
    <text x={cx} y={cy + 40} textAnchor="middle" fontFamily={FONT} fontWeight={800} fontSize={30} fill={B.grey}>{d.ofText}</text>
    {t > T2 + 0.9 ? <g transform={`translate(${cx},${cy + 150}) scale(${sp(t, T2 + 0.9)})`}><rect x={-240} y={-38} width={480} height={76} rx={38} fill="#fff5f5" stroke={RED} strokeWidth={3} />
      <text y={12} textAnchor="middle" fontFamily={FONT} fontWeight={900} fontSize={32} fill={RED}>{d.needText}</text></g> : null}
    {d.alt && t > Th ? <g opacity={ease((t - Th - 0.6) / 0.3)}><Pill x={420} y={530} text={d.alt.text} color={GREEN} icon="trending-up" size={24} /></g> : null}
  </Svg>;
};

// ------------------------------------------------------------------ 9. poll (question + options, NO fake results)
// data: { poster?:{id, img}, question, sub?, options:[{t, cue, color?}], commentCue, button }
const poll: React.FC<DP> = ({ t, cue, data: d }) => {
  const ats: number[] = d.options.map((o: any, i: number) => cueAt(cue, o.cue, 0.4 + i * 0.5) - 0.2); const Tc = cueAt(cue, d.commentCue, 3) - 0.2;
  const hover = Math.min(d.options.length - 1, Math.max(0, Math.floor((t - ats[0]) / 0.6)));
  return <Svg>
    <rect x={65} y={5} width={950} height={585} rx={36} fill="#fff" filter="url(#shadow)" />
    {d.poster ? <EPoster id={d.poster.id} img={d.poster.img} x={95} y={28} w={104} h={148} k={sp(t, 0.05)} /> : null}
    <text x={d.poster ? 230 : 110} y={92} fontFamily={FONT} fontWeight={900} fontSize={46} fill={B.ink}>{d.question}</text>
    {d.sub ? <text x={d.poster ? 230 : 110} y={136} fontFamily={FONT} fontWeight={800} fontSize={24} fill={B.grey} letterSpacing={2}>{d.sub}</text> : null}
    {d.options.map((o: any, i: number) => { const k = sp(t, ats[i], 11, 190); const on = t > ats[0] && hover === i && t < Tc + 0.6;
      return <g key={i} transform={`translate(520,${240 + i * 112}) scale(${k * (on ? 1.04 : 1)})`}>
        <rect x={-380} y={-46} width={760} height={92} rx={46} fill={on ? "#FEF3C7" : "#f8fafc"} stroke={col(o.color ?? "amber")} strokeWidth={on ? 6 : 4} />
        <circle cx={-320} cy={0} r={24} fill="none" stroke={B.grey} strokeWidth={4} />{on ? <circle cx={-320} cy={0} r={13} fill={AMBER} /> : null}
        <text x={-270} y={18} fontFamily={FONT} fontWeight={900} fontSize={52} fill={B.ink}>{o.t}</text></g>; })}
    {t > ats[0] && t < Tc + 0.6 ? <path transform={`translate(${760 + Math.sin(t * 3) * 8},${246 + hover * 112})`} d="M0,0 L0,52 L13,40 L23,62 L32,58 L22,36 L40,36 Z" fill="#fff" stroke={B.ink} strokeWidth={4} strokeLinejoin="round" /> : null}
    {t > Tc ? <g transform={`translate(520,${548 + Math.sin(t * 6) * 4}) scale(${sp(t, Tc, 10, 200)})`}><rect x={-200} y={-30} width={400} height={60} rx={30} fill="#2563EB" />
      <Icon name="message-square" x={-180} y={-20} size={40} color="#fff" /><text x={24} y={11} textAnchor="middle" fontFamily={FONT} fontWeight={900} fontSize={30} fill="#fff">{d.button}</text></g> : null}
  </Svg>;
};

// ------------------------------------------------------------------ 10. bigNumber (one huge stat, counts up; good for hooks / "numbers first")
// data: { v, unit?, suffix?, cue, caption, color?, sparks?, poster? (entity id shown faintly behind) }
const bigNumber: React.FC<DP> = ({ t, cue, data: d }) => {
  const T = cueAt(cue, d.cue, 0.4) - 0.3; const k = sp(t, 0.05, 12, 150); const c = col(d.color ?? "amber");
  return <Svg>
    {d.poster ? <g opacity={0.28 * k}><EPoster id={d.poster} x={330} y={-10 - t * 6} w={420} h={600} /><rect x={300} y={-20} width={480} height={640} fill="#f1f1f1" opacity={0.35} /></g> : null}
    {(d.sparks ?? true) ? Array.from({ length: 14 }).map((_, i) => { const a = (i / 14) * Math.PI * 2 + t * 0.4, rr = 230 + random(`bn${i}`) * 60; return <circle key={i} cx={540 + Math.cos(a) * rr * 1.6} cy={270 + Math.sin(a) * rr * 0.8} r={6 + random(`bs${i}`) * 8} fill={c} opacity={0.35} />; }) : null}
    <g transform={`translate(540,290) scale(${k})`}>
      <text textAnchor="middle" y={40} fontFamily={FONT} fontWeight={900} fontSize={190} fill={c}>{d.unit ?? ""}{fmt(cnt(t, T, d.v, 1.0), dec(d.v))}{d.suffix ?? ""}</text>
      <text textAnchor="middle" y={120} fontFamily={FONT} fontWeight={800} fontSize={40} fill={B.grey}>{d.caption}</text>
    </g>
    <Src />
  </Svg>;
};


// ------------------------------------------------------------------ 11. versus (two posters, VS, optional stamp)
// data: { left, right, stamp?:{text, cue, color?}, vsCue? }
const versus: React.FC<DP> = ({ t, cue, data: d }) => {
  const kl = sp(t, 0.05, 11, 150), kr = sp(t, 0.25, 11, 150), kv = sp(t, cueAt(cue, d.vsCue, 0.5), 8, 220);
  const Ts = d.stamp ? cueAt(cue, d.stamp.cue, 2) - 0.15 : 1e9, ks = sp(t, Ts, 9, 240);
  const shake = t > Ts ? Math.sin((t - Ts) * 55) * 12 * Math.exp(-(t - Ts) * 4) : 0;
  return <Svg><g transform={`translate(${shake},0)`}>
    <g transform={`translate(${(1 - kl) * -300},0) rotate(-4 285 280)`}><EPoster id={d.left} x={95} y={40} w={360} h={500} k={1} /></g>
    <g transform={`translate(${(1 - kr) * 300},0) rotate(4 795 280)`}><EPoster id={d.right} x={625} y={40} w={360} h={500} k={1} /></g>
    <g transform={`translate(540,290) scale(${kv})`}><circle r={78} fill="#0B1220" stroke="#fff" strokeWidth={8} filter="url(#shadow)" />
      <text y={26} textAnchor="middle" fontFamily={FONT} fontWeight={900} fontSize={72} fill="#F59E0B" fontStyle="italic">VS</text></g>
    {t > Ts ? <Stamp x={540} y={500} text={d.stamp.text} color={col(d.stamp.color ?? "red")} k={ks} rot={-7} size={64} /> : null}
  </g></Svg>;
};

// ------------------------------------------------------------------ 12. overtake (bar B races past bar A, % badge)
// data: { a:{id, v, label}, b:{id, v, label, cue}, unit, suffix, max, diff:{text, cue} }
const overtake: React.FC<DP> = ({ t, cue, data: d }) => {
  const Tb = cueAt(cue, d.b.cue, 1) - 0.3, Td = cueAt(cue, d.diff.cue, 2) - 0.2;
  const ga = ease((t - 0.1) / 0.7), gb = ease((t - Tb) / 1.1); const W = 600;
  const rows = [{ ...d.a, g: ga, at: 0.1, y: 40, dur: 0.7 }, { ...d.b, g: gb, at: Tb, y: 300, dur: 1.1 }];
  const lead = gb * d.b.v > d.a.v;
  return <Svg>
    {rows.map((r: any, i: number) => { const bw = (r.v / d.max) * W * r.g; const on = t > r.at; const c = ENT[r.id]?.color ?? "#2563EB";
      return <g key={i} opacity={on ? 1 : 0.25}>
        <EPoster id={r.id} x={65} y={r.y} w={150} h={213} k={on ? sp(t, r.at) : 1} ring={i === 1 && lead ? GREEN : undefined} />
        <text x={250} y={r.y + 50} fontFamily={FONT} fontWeight={900} fontSize={34} fill={B.ink}>{ENT[r.id]?.name ?? r.id}</text>
        <text x={250} y={r.y + 86} fontFamily={FONT} fontWeight={700} fontSize={24} fill={B.grey}>{r.label}</text>
        <rect x={250} y={r.y + 104} width={W} height={92} rx={20} fill="#e2e8f0" />
        <rect x={250} y={r.y + 104} width={Math.max(0, bw)} height={92} rx={20} fill={c} />
        <text x={Math.max(520, 250 + bw - 18)} y={r.y + 168} textAnchor="end" fontFamily={FONT} fontWeight={900} fontSize={58} fill="#fff">{d.unit}{(r.v * ease((t - r.at) / r.dur)).toFixed(2)}{d.suffix}</text>
      </g>; })}
    <line x1={250 + (d.a.v / d.max) * W} x2={250 + (d.a.v / d.max) * W} y1={140} y2={410} stroke={ENT[d.a.id]?.color ?? "#64748b"} strokeWidth={4} strokeDasharray="8 8" opacity={ga} />
    {t > Td ? <g transform={`translate(880,${520}) scale(${sp(t, Td, 9, 230)})`}><rect x={-120} y={-48} width={240} height={96} rx={48} fill={GREEN} filter="url(#shadow)" />
      <text y={20} textAnchor="middle" fontFamily={FONT} fontWeight={900} fontSize={54} fill="#fff">{d.diff.text}</text></g> : null}
    <Src />
  </Svg>;
};

// ------------------------------------------------------------------ 13. catchFreeze (grey freeze-frame + "WAIT!" stamp)
// data: { stamp, sub?, cue?, left?, right? }
const catchFreeze: React.FC<DP> = ({ t, cue, data: d }) => {
  const T = cueAt(cue, d.cue, 0.15) - 0.1; const ks = sp(t, T, 8, 260); const flash = Math.max(0, 1 - (t - T) / 0.25);
  return <Svg>
    <g style={{ filter: "grayscale(1)" }} opacity={0.55}>
      {d.left ? <EPoster id={d.left} x={120} y={60} w={300} h={420} /> : null}{d.right ? <EPoster id={d.right} x={660} y={60} w={300} h={420} /> : null}
    </g>
    <rect x={65} y={0} width={950} height={590} fill="#fff" opacity={t > T ? flash * 0.9 : 0} />
    {t > T ? <Stamp x={540} y={260} text={d.stamp} color={RED} k={ks} rot={-6} size={92} /> : null}
    {t > T && d.sub ? <g opacity={ease((t - T - 0.35) / 0.3)}><rect x={190} y={390} width={700} height={84} rx={42} fill="#0B1220" />
      <text x={540} y={445} textAnchor="middle" fontFamily={FONT} fontWeight={900} fontSize={40} fill="#fff">{d.sub}</text></g> : null}
  </Svg>;
};

// ------------------------------------------------------------------ 14. splitCompare (two columns of facts that appear on cue)
// data: { left:{id, head}, right:{id, head}, rows:[{l, r, cue}] }
const splitCompare: React.FC<DP> = ({ t, cue, data: d }) => {
  const cols = [{ ...d.left, x: 65 }, { ...d.right, x: 552 }]; const w = 463;
  return <Svg>
    {cols.map((c: any, i: number) => { const cc = ENT[c.id]?.color ?? "#2563EB"; const k = sp(t, 0.05 + i * 0.15);
      return <g key={i} opacity={cl(k * 1.5)}>
        <rect x={c.x} y={10} width={w} height={575} rx={28} fill="#fff" stroke={cc} strokeWidth={4} filter="url(#shadow)" />
        <EPoster id={c.id} x={c.x + 20} y={28} w={86} h={122} />
        <text x={c.x + 124} y={82} fontFamily={FONT} fontWeight={900} fontSize={36} fill={cc}>{c.head}</text>
        <text x={c.x + 124} y={124} fontFamily={FONT} fontWeight={800} fontSize={26} fill={B.grey}>{ENT[c.id]?.name}</text>
      </g>; })}
    {d.rows.map((r: any, i: number) => { const at = cueAt(cue, r.cue, 0.6 + i * 0.8) - 0.15; if (t < at) return null; const k = ease((t - at) / 0.35); const y = 175 + i * 102;
      return <g key={i} opacity={k} transform={`translate(0,${(1 - k) * 20})`}>
        {[r.l, r.r].map((s: string, j: number) => <g key={j}><rect x={cols[j].x + 18} y={y} width={w - 36} height={86} rx={18} fill={j ? "#ecfdf5" : "#eff6ff"} />
          <text x={cols[j].x + w / 2} y={y + 56} textAnchor="middle" fontFamily={FONT} fontWeight={800} fontSize={32} fill={B.ink}>{s}</text></g>)}
      </g>; })}
    <Src />
  </Svg>;
};

// ------------------------------------------------------------------ 15. balance (see-saw tips to one side, then levels with "?")
// data: { left:{text, color}, right:{text, color}, tipCue, levelCue, center? }
const balance: React.FC<DP> = ({ t, cue, data: d }) => {
  const Tt = cueAt(cue, d.tipCue, 0.8), Tl = cueAt(cue, d.levelCue, 2.5);
  const ang = 12 * ease((t - Tt) / 0.6) * (1 - ease((t - Tl) / 0.8)) + Math.sin(t * 2) * 1.2;
  const kq = sp(t, Tl + 0.4, 9, 220);
  const pans: [any, number][] = [[d.left, 260], [d.right, 820]];
  return <Svg>
    <polygon points="540,330 470,470 610,470" fill="#0B1220" />
    <g transform={`rotate(${ang} 540 330)`}>
      <rect x={140} y={318} width={800} height={24} rx={12} fill="#334155" />
      {pans.map(([s, x], i) => <g key={i} transform={`rotate(${-ang} ${x} 318)`}>
        <rect x={x - 170} y={170} width={340} height={140} rx={30} fill={col(s.color)} filter="url(#shadow)" />
        <text x={x} y={258} textAnchor="middle" fontFamily={FONT} fontWeight={900} fontSize={Math.min(54, 560 / Math.max(1, [...s.text].length))} fill="#fff">{s.text}</text></g>)}
    </g>
    {t > Tl + 0.4 ? <g transform={`translate(540,110) scale(${kq})`}><circle r={70} fill="#F59E0B" filter="url(#shadow)" /><text y={30} textAnchor="middle" fontFamily={FONT} fontWeight={900} fontSize={96} fill="#fff">?</text></g> : null}
    {d.center ? <text x={540} y={545} textAnchor="middle" fontFamily={FONT} fontWeight={800} fontSize={32} fill={B.grey}>{d.center}</text> : null}
  </Svg>;
};

export const DATA_SCENES: Record<string, React.FC<DP>> = { posterFaceoff, leaderboard, gapRuler, vbars, trendBars, lineChart, scenarios, gauge, poll, bigNumber, versus, overtake, catchFreeze, splitCompare, balance };
