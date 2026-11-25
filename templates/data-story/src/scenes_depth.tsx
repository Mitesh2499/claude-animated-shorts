// "2.5D" data scenes (skill: data-story-reel, learned from the Rajasthan Royals "anatomy of a Boss Baby innings" reel in Raw/).
// Flat 2D layout + objects that suddenly have real depth: shaded spheres (cricket balls) with seams and contact shadows,
// extruded bars, keycap tiles - all projected through a tiny perspective camera (proj) in plain SVG, so it renders fast in
// Remotion with no WebGL. The camera moves (orbit drift, top-down -> side swing, dive-in), which is what sells the 3D.
// Every scene is DATA-DRIVEN from its script.json section `data`, same contract as scenes_data.tsx (canvas 1080 x 600).
import React from "react";
import { random, staticFile } from "remotion";
import SCRIPT from "../script.json";
import POSTERS from "./posters.json";
import { Defs, Stamp, sp, ease, cl, fmt, B } from "./scenes";
import type { SceneProps } from "./scenes";

const CW = 1080, CH = 600;
type DP = SceneProps & { data?: any };
const SC = SCRIPT as any; const TH = (SC.theme ?? {}) as Record<string, string>;
const FONT = "Inter, 'Noto Sans Devanagari', 'Nirmala UI', 'Segoe UI', sans-serif", MONO = "'JetBrains Mono','Cascadia Code',Consolas,monospace";
const INK = TH.ink ?? "#141B4D", MUTE = "#8A90A6", TRACK = TH.track ?? "#E4DED8", ACC = SC.accent ?? "#E0157A";
const NAMED: Record<string, string> = { red: "#E5252A", green: "#16A34A", amber: "#F59E0B", blue: TH.blue ?? "#2546C9", cyan: "#06B6D4", violet: "#8B5CF6", slate: "#334155",
  saffron: "#FF9933", navy: INK, ink: INK, accent: ACC, pink: ACC, chalk: "#EEEAE4", white: "#FFFFFF", grey: MUTE, mute: MUTE };
export const col = (c?: string) => (c ? NAMED[c] ?? c : NAMED.blue);
/** cue: a display word of the section ("103", "Vaibhav"), "word#2" = its 2nd occurrence, or seconds as a number */
const cueAt = (cue: SceneProps["cue"], w: any, dflt: number) => { if (w === undefined || w === null) return dflt; if (typeof w === "number") return w;
  const m = String(w).match(/^(.*)#(\d+)$/); return m ? cue(m[1], Number(m[2])) : cue(String(w)); };
const dec = (v: number) => (Math.abs(v % 1) > 1e-9 ? (Math.abs((v * 10) % 1) > 1e-9 ? 2 : 1) : 0);
const lerp = (a: number, b: number, k: number) => a + (b - a) * k;
const rgb = (c: string) => { let h = col(c).replace("#", ""); if (h.length === 3) h = h.split("").map((x) => x + x).join(""); const n = parseInt(h, 16); return [(n >> 16) & 255, (n >> 8) & 255, n & 255]; };
export const mixc = (a: string, b: string, k: number) => { const A = rgb(a), Z = rgb(b); return "#" + A.map((v, i) => Math.round(v + (Z[i] - v) * k).toString(16).padStart(2, "0")).join(""); };
const Svg: React.FC<{ children: React.ReactNode }> = ({ children }) => <svg width={CW} height={CH} style={{ overflow: "visible" }}><Defs />{children}</svg>;
const Mono: React.FC<{ x: number; y: number; t: string; c?: string; s?: number; a?: "start" | "middle" | "end"; o?: number }> = ({ x, y, t, c = col("blue"), s = 20, a = "start", o = 1 }) =>
  <text x={x} y={y} textAnchor={a} fontFamily={MONO} fontWeight={600} fontSize={s} letterSpacing={s * 0.12} fill={c} opacity={o}>{t.toUpperCase()}</text>;

// ------------------------------------------------------------------ the camera
// World: x right, y up, z toward the viewer; floor = y 0. yaw > 0 shows the right faces, pitch > 0 looks down onto the tops.
export type Cam = { yaw: number; pitch: number; dist: number; target?: [number, number, number] };
export type P2 = { x: number; y: number; s: number; z: number };
const RAD = Math.PI / 180;
export const proj = (p: [number, number, number], c: Cam): P2 => {
  const T = c.target ?? [0, 0, 0]; let x = p[0] - T[0], y = p[1] - T[1], z = p[2] - T[2];
  const cy = Math.cos(c.yaw * RAD), sy = Math.sin(c.yaw * RAD); [x, z] = [x * cy - z * sy, x * sy + z * cy];
  const cp = Math.cos(c.pitch * RAD), spn = Math.sin(c.pitch * RAD); [y, z] = [y * cp - z * spn, y * spn + z * cp];
  const s = c.dist / Math.max(0.3, c.dist - z); return { x: x * s, y: -y * s, s, z };
};
/** Fit: a screen transform (scale K + offset) that puts a set of projected points inside a box. Compute it ONCE from the
 *  final pose so the layout never jitters while the camera moves. */
export const fit = (pts: { x: number; y: number; r?: number }[], box: [number, number, number, number]) => {
  const xs = pts.flatMap((p) => [p.x - (p.r ?? 0), p.x + (p.r ?? 0)]), ys = pts.flatMap((p) => [p.y - (p.r ?? 0), p.y + (p.r ?? 0)]);
  const [x0, x1, y0, y1] = [Math.min(...xs), Math.max(...xs), Math.min(...ys), Math.max(...ys)];
  const K = Math.min((box[2] - box[0]) / Math.max(1e-6, x1 - x0), (box[3] - box[1]) / Math.max(1e-6, y1 - y0));
  return { K, ox: (box[0] + box[2]) / 2 - ((x0 + x1) / 2) * K, oy: (box[1] + box[3]) / 2 - ((y0 + y1) / 2) * K };
};
type Fit = ReturnType<typeof fit>;
const S2 = (p: P2, F: Fit) => ({ x: F.ox + p.x * F.K, y: F.oy + p.y * F.K });

/** Gradients for shaded spheres + soft contact shadow. Put <BallDefs colors=[...]/> once per svg. */
const gid = (c: string) => "bl" + col(c).replace(/[^0-9a-z]/gi, "");
export const BallDefs: React.FC<{ colors: string[] }> = ({ colors }) => <defs>
  {[...new Set(colors.map(col))].map((c) => <radialGradient key={c} id={gid(c)} cx="0.5" cy="0.5" r="0.55" fx="0.34" fy="0.28">
    <stop offset="0" stopColor={mixc(c, "#ffffff", 0.75)} /><stop offset="0.22" stopColor={mixc(c, "#ffffff", 0.22)} />
    <stop offset="0.7" stopColor={c} /><stop offset="1" stopColor={mixc(c, "#000000", 0.38)} /></radialGradient>)}
  <radialGradient id="blshadow"><stop offset="0" stopColor="#3a2f28" stopOpacity="0.32" /><stop offset="0.6" stopColor="#3a2f28" stopOpacity="0.12" /><stop offset="1" stopColor="#3a2f28" stopOpacity="0" /></radialGradient>
</defs>;
/** One cricket ball: shaded sphere + seam (rotated per ball) . */
export const Ball: React.FC<{ x: number; y: number; r: number; c: string; seam?: string; rot?: number; o?: number }> = ({ x, y, r, c, seam, rot = 0, o = 1 }) => {
  const cc = col(c); const light = rgb(cc).reduce((a, b) => a + b, 0) > 600;
  return <g opacity={o}><circle cx={x} cy={y} r={r} fill={`url(#${gid(cc)})`} />
    <path transform={`translate(${x},${y}) rotate(${rot})`} d={`M${-0.3 * r},${-0.95 * r} C${0.32 * r},${-0.42 * r} ${0.32 * r},${0.42 * r} ${-0.3 * r},${0.95 * r}`}
      fill="none" stroke={seam ?? (light ? "#7C86C4" : mixc(cc, "#ffffff", 0.8))} strokeWidth={Math.max(1, r * 0.075)} strokeLinecap="round" opacity={0.9} /></g>;
};
/** Extruded box with visible faces only (back-face culling by winding), shaded top / front / sides, optional label on the front face. */
export const Box: React.FC<{ cam: Cam; F: Fit; x: number; z: number; w: number; d: number; h: number; y0?: number; c: string; label?: string; ink?: string; fs?: number; round?: number; o?: number }> =
  ({ cam, F, x, z, w, d, h, y0 = 0, c, label, ink = "#fff", fs = 0.55, round = 0, o = 1 }) => {
  const [a0, a1, b0, b1, c0, c1] = [x - w / 2, x + w / 2, y0, y0 + Math.max(0.001, h), z - d / 2, z + d / 2];
  const cc = col(c);
  const faces: { n: string; p: [number, number, number][]; f: string }[] = [
    { n: "top", p: [[a0, b1, c0], [a1, b1, c0], [a1, b1, c1], [a0, b1, c1]], f: mixc(cc, "#ffffff", 0.28) },
    { n: "front", p: [[a0, b1, c1], [a1, b1, c1], [a1, b0, c1], [a0, b0, c1]], f: cc },
    { n: "right", p: [[a1, b1, c1], [a1, b1, c0], [a1, b0, c0], [a1, b0, c1]], f: mixc(cc, "#000000", 0.28) },
    { n: "left", p: [[a0, b1, c0], [a0, b1, c1], [a0, b0, c1], [a0, b0, c0]], f: mixc(cc, "#000000", 0.28) },
    { n: "back", p: [[a1, b1, c0], [a0, b1, c0], [a0, b0, c0], [a1, b0, c0]], f: mixc(cc, "#000000", 0.2) },
  ];
  const out: React.ReactNode[] = [];
  for (const fc of faces) {
    const q = fc.p.map((p) => S2(proj(p, cam), F));
    let area = 0; for (let i = 0; i < 4; i++) { const u = q[i], v = q[(i + 1) % 4]; area += u.x * v.y - v.x * u.y; }
    if (area <= 0.5) continue;
    out.push(<polygon key={fc.n} points={q.map((p) => `${p.x},${p.y}`).join(" ")} fill={fc.f} stroke={fc.f} strokeWidth={round} strokeLinejoin="round" />);
    if (fc.n === "front" && label) {
      const W = w * 100, H = h * 100, [p0, p1, , p3] = q;   // affine map of the face: local (0..W, 0..H) -> screen
      out.push(<g key="lbl" transform={`matrix(${(p1.x - p0.x) / W},${(p1.y - p0.y) / W},${(p3.x - p0.x) / H},${(p3.y - p0.y) / H},${p0.x},${p0.y})`}>
        <text x={W / 2} y={H / 2 + fs * 100 * 0.36} textAnchor="middle" fontFamily={FONT} fontWeight={900} fontSize={fs * 100} fill={ink}>{label}</text></g>);
    }
  }
  return <g opacity={o}>{out}</g>;
};
/** Soft floor shadow of a box (light from the upper right). */
const BoxShadow: React.FC<{ cam: Cam; F: Fit; x: number; z: number; w: number; d: number; h: number; o?: number }> = ({ cam, F, x, z, w, d, h, o = 1 }) => {
  const L = Math.min(h, 6) * 0.55; const pts: [number, number, number][] = [[x - w / 2, 0, z + d / 2], [x + w / 2, 0, z + d / 2], [x + w / 2 - L, 0, z - d / 2 - L * 0.4], [x - w / 2 - L, 0, z - d / 2 - L * 0.4]];
  const q = pts.map((p) => S2(proj(p, cam), F));
  return <polygon points={q.map((p) => `${p.x},${p.y}`).join(" ")} fill="#3a2f28" opacity={0.1 * o} />;
};

// ------------------------------------------------------------------ 1. ballGrid: unit visualisation with 3D balls
// data: { groups:[{ n, cols?, color?, label?, unit?, cue?, span? }], flip?:{ n, color, cue, group? }, split?:{ cue, a, b },
//         rope?:{ cue, label? }, dive?: true, pitch?, yaw? }
// Balls rain in one by one (counter ticks with them), then `flip` recolours the first n (e.g. sixes), `split` shows the share bar
// (computed from n / total, never typed), `rope` lassos the grid, `dive` flies the camera into the balls before the cut.
const ballGrid: React.FC<DP> = ({ t, d, cue, data: D }) => {
  const G = D.groups as any[]; const hasSplit = !!D.split; const bottom = hasSplit ? 448 : 592; const bandH = bottom / G.length;
  const yaw0 = D.yaw ?? -8, pitch0 = D.pitch ?? 50;
  const Td = D.dive ? d - 0.8 : 1e9, dv = D.dive ? ease((t - Td) / 0.8) : 0;
  const cam: Cam = { yaw: yaw0 + Math.sin(t * 0.45) * 4 + dv * 10, pitch: lerp(pitch0, 22, dv), dist: 70 };
  const fg = D.flip ? (D.flip.group ?? G.length - 1) : -1, Tf = D.flip ? cueAt(cue, D.flip.cue, 2) - 0.1 : 1e9;
  const colors = [...G.map((g) => g.color ?? "chalk"), D.flip?.color ?? "accent"];
  const layers = G.map((g, gi) => {
    const n = g.n, cols = g.cols ?? Math.ceil(Math.sqrt(n * 2.4)), rows = Math.ceil(n / cols), spc = 2.3, spz = Math.max(2.3, 1.95 / Math.sin(Math.max(20, pitch0) * RAD));
    const pos = Array.from({ length: n }, (_, i) => [((i % cols) - (cols - 1) / 2) * spc, (Math.floor(i / cols) - (rows - 1) / 2) * spz] as [number, number]);
    const head = g.label || g.unit !== undefined || g.count !== false ? 64 : 8;
    const F = fit(pos.map(([x, z]) => { const p = proj([x, 1, z], { yaw: yaw0, pitch: pitch0, dist: 70 }); return { x: p.x, y: p.y, r: p.s * 1.15 }; }),
      [65, gi * bandH + head, 1015, (gi + 1) * bandH - 6]);
    const T0 = cueAt(cue, g.cue, 0.3 + gi * 1.2) - 0.1, stg = Math.min(0.045, (g.span ?? 1.6) / n);
    const landed = pos.filter((_, i) => t >= T0 + i * stg).length;
    const balls = pos.map(([x, z], i) => {
      const Ti = T0 + i * stg; if (t < Ti - 0.28) return null;
      const k = sp(t, Ti - 0.28, 9, 210); let y = 1 + Math.max(0, (1 - k) * 9);
      let c = g.color ?? "chalk";
      if (gi === fg && i < D.flip.n) { const Tc = Tf + i * Math.min(0.04, 1.2 / D.flip.n); if (t >= Tc) { c = D.flip.color ?? "accent"; y += Math.sin(cl((t - Tc) / 0.3) * Math.PI) * 0.9; } }
      const p = proj([x, y, z], cam), sh = proj([x, 0, z], cam);
      return { p, sh, c, i, o: cl((t - Ti + 0.28) * 6) };
    }).filter(Boolean) as any[];
    balls.sort((a, b) => a.p.z - b.p.z);
    return { g, gi, F, balls, landed, pos, cols, rows, spc, spz, T0 };
  });
  // the dive zooms around the centre of the last group
  const lz = layers[layers.length - 1]; const zc = S2(proj([0, 1, 0], cam), lz.F); const zs = 1 + dv * dv * 3.2;
  const Tr = D.rope ? cueAt(cue, D.rope.cue, 3) - 0.1 : 1e9, Ts = D.split ? cueAt(cue, D.split.cue, 2.5) - 0.1 : 1e9;
  return <Svg><BallDefs colors={colors} />
    <g transform={`translate(${zc.x},${zc.y}) scale(${zs}) translate(${-zc.x},${-zc.y})`}>
      {layers.map(({ g, gi, F, balls, landed, cols, rows, spc, spz, T0 }) => <g key={gi}>
        {g.label ? <Mono x={65} y={gi * bandH + 18} t={g.label} c={col(g.color === "chalk" || !g.color ? "blue" : g.color)} s={17} o={cl((t - T0 + 0.3) * 4)} /> : null}
        {g.count !== false ? <text x={65} y={gi * bandH + 58} fontFamily={FONT} fontWeight={900} fontSize={48} fill={g.color && g.color !== "chalk" ? col(g.color) : INK} opacity={cl((t - T0 + 0.3) * 4)}>
          {landed}<tspan fontSize={26} fontWeight={700} dx={8}>{g.unit ?? "balls"}</tspan></text> : null}
        {balls.map((b: any) => { const q = S2(b.sh, F); return <ellipse key={"s" + b.i} cx={q.x + b.sh.s * F.K * 0.35} cy={q.y} rx={b.sh.s * F.K * 1.25} ry={b.sh.s * F.K * 0.75} fill="url(#blshadow)" opacity={b.o} />; })}
        {balls.map((b: any) => { const q = S2(b.p, F); return <Ball key={b.i} x={q.x} y={q.y} r={b.p.s * F.K} c={b.c} rot={-20 + random(`seam${gi}-${b.i}`) * 50} o={b.o} />; })}
        {D.rope && gi === layers.length - 1 && t > Tr ? (() => {
          const a = (cols * spc) / 2 + 1.3, bz = (rows * spz) / 2 + 1.3; const P: string[] = [];
          for (let j = 0; j <= 96; j++) { const th = (j / 96) * Math.PI * 2, cx = Math.cos(th), sz = Math.sin(th);
            const q = S2(proj([a * Math.sign(cx) * Math.pow(Math.abs(cx), 0.25), 0.2, bz * Math.sign(sz) * Math.pow(Math.abs(sz), 0.25)], cam), F); P.push(`${q.x},${q.y}`); }
          const k = ease((t - Tr) / 0.9); const br = S2(proj([a, 0.2, bz], cam), F);
          return <g><polyline points={P.join(" ")} fill="none" stroke={INK} strokeWidth={7} strokeLinejoin="round" pathLength={1} strokeDasharray={1} strokeDashoffset={1 - k} />
            {D.rope.label ? <Mono x={Math.min(1010, br.x)} y={br.y + 30} t={D.rope.label} c={INK} s={15} a="end" o={cl((t - Tr - 0.7) * 3)} /> : null}</g>;
        })() : null}
      </g>)}
    </g>
    {hasSplit && t > Ts ? (() => {
      const g = G[fg >= 0 ? fg : G.length - 1], fr = (D.flip?.n ?? 0) / g.n, k = ease((t - Ts) / 0.9), o = cl((t - Ts) * 4) * (1 - dv);
      const pa = fmt(fr * 100 * k, 1), pb = fmt((1 - fr) * 100, 1);
      return <g opacity={o}><rect x={65} y={474} width={950} height={44} rx={22} fill={TRACK} />
        <rect x={65} y={474} width={950 * fr * k} height={44} rx={22} fill={col(D.flip?.color ?? "accent")} />
        <text x={65} y={576} fontFamily={FONT} fontWeight={900} fontSize={50} fill={col(D.flip?.color ?? "accent")}>{pa}%<tspan dx={12} fontFamily={MONO} fontSize={18} fontWeight={600}>{(D.split.a ?? "").toUpperCase()}</tspan></text>
        <text x={1015} y={576} textAnchor="end" fontFamily={FONT} fontWeight={900} fontSize={50} fill={MUTE} opacity={cl((t - Ts - 0.6) * 4)}><tspan dx={-12} fontFamily={MONO} fontSize={18} fontWeight={600}>{(D.split.b ?? "").toUpperCase()} </tspan>{pb}%</text></g>;
    })() : null}
  </Svg>;
};

// ------------------------------------------------------------------ 2. bars3d: extruded bars, camera swings from top-down to side
// data: { items:[{ label, v, color, cue }], max?, unit?, big?:{ v, suffix?, text, cue, color? }, pitch?, yaw? }
// Before the first cue the bars are flat coloured tiles seen from above; on cue they rise while the camera drops to a low
// side angle (the reference's "sudden 3D" moment). Counters on the left count with their bars.
const bars3d: React.FC<DP> = ({ t, cue, data: D }) => {
  const it = D.items as any[], n = it.length, mx = D.max ?? Math.max(...it.map((x) => x.v)), Hm = 7, w = 2.5, gap = 0.8;
  const Ti = it.map((x, i) => cueAt(cue, x.cue, 0.4 + i * 0.9) - 0.15), T0 = Ti[0];
  const pf = D.pitch ?? 12, yf = D.yaw ?? -30, k0 = ease((t - T0 + 0.2) / 1.3);
  const cam: Cam = { yaw: lerp(yf - 30, yf, k0) + Math.sin(t * 0.4) * 3, pitch: lerp(84, pf, k0), dist: 60, target: [0, Hm * 0.4, 0] };
  const xs = it.map((_, i) => (i - (n - 1) / 2) * (w + gap));
  const finalCam: Cam = { yaw: yf, pitch: pf, dist: 60, target: [0, Hm * 0.4, 0] };
  const corners = xs.flatMap((x, i) => { const h = (Hm * it[i].v) / mx; return [[x - w / 2, 0, -w / 2], [x + w / 2, 0, w / 2], [x - w / 2, h, w / 2], [x + w / 2, h, -w / 2], [x - w / 2, 0, w / 2], [x + w / 2, h, w / 2]] as [number, number, number][]; });
  const F = fit(corners.map((p) => proj(p, finalCam)), [440, 18, 1010, D.big ? 418 : 588]);
  const order = xs.map((x, i) => ({ i, z: proj([x, 0, 0], cam).z })).sort((a, b) => a.z - b.z);
  const Tb = D.big ? cueAt(cue, D.big.cue, 3) - 0.1 : 1e9; const rowH = Math.min(128, (D.big ? 410 : 580) / n);
  return <Svg>
    {order.map(({ i }) => { const h = Math.max(0.04, ((Hm * it[i].v) / mx) * ease((t - Ti[i]) / 1.0)); return <BoxShadow key={"s" + i} cam={cam} F={F} x={xs[i]} z={0} w={w} d={w} h={h} />; })}
    {order.map(({ i }) => { const h = Math.max(0.04, ((Hm * it[i].v) / mx) * ease((t - Ti[i]) / 1.0)); return <Box key={i} cam={cam} F={F} x={xs[i]} z={0} w={w} d={w} h={h} c={it[i].color ?? "accent"} o={cl((t + 0.4) * 3)} />; })}
    {it.map((x, i) => { const on = t > Ti[i]; const v = x.v * ease((t - Ti[i]) / 1.0); const y = 8 + i * rowH;
      return <g key={i} opacity={on ? 1 : 0} transform={`translate(0,${(1 - sp(t, Ti[i])) * 20})`}>
        <text x={65} y={y + rowH * 0.56} fontFamily={FONT} fontWeight={900} fontSize={Math.min(76, rowH * 0.62)} fill={col(x.color ?? "accent")}>{D.unit ?? ""}{fmt(v, dec(x.v))}</text>
        <text x={68} y={y + rowH * 0.56 + 30} fontFamily={FONT} fontWeight={700} fontSize={24} fill={INK}>{x.label}</text></g>; })}
    {D.big && t > Tb ? <g opacity={cl((t - Tb) * 4)} transform={`translate(0,${(1 - sp(t, Tb)) * 26})`}>
      <text x={65} y={512} fontFamily={FONT} fontWeight={900} fontSize={96} fill={col(D.big.color ?? "accent")}>{fmt(D.big.v * ease((t - Tb) / 0.9), dec(D.big.v))}{D.big.suffix ?? ""}</text>
      <text x={68} y={556} fontFamily={FONT} fontWeight={700} fontSize={28} fill={INK}>{D.big.text}</text></g> : null}
  </Svg>;
};

// ------------------------------------------------------------------ 3. tiles3d: keycap word assembly (+ optional dictionary card)
// data: { tiles:[{ t, color?, ink?, cue, note? }], merge?:{ t, color?, ink?, cue, note? }, card?:{ cue, head, tag?, def, strike?, strikeCue?, altLabel?, alt?, altCue? } }
// Each tile drops onto the table at its cue (spring + shadow); `merge` slams them into one word tile; `card` explains the word.
const tiles3d: React.FC<DP> = ({ t, cue, data: D }) => {
  const T = D.tiles as any[], gap = 0.32, H = 2.1, dp = 1.4; const wd = (s: string) => 1.15 + 0.62 * s.length;
  const tot = T.reduce((a, x) => a + wd(x.t), 0) + gap * (T.length - 1); let acc = -tot / 2;
  const xs = T.map((x) => { const c = acc + wd(x.t) / 2; acc += wd(x.t) + gap; return c; });
  const top = D.card ? 20 : 130, hgt = D.card ? 170 : 260;
  const cam: Cam = { yaw: -16 + Math.sin(t * 0.5) * 3, pitch: 16, dist: 40 };
  const mw = D.merge ? wd(D.merge.t) * 1.1 : 0, spanW = Math.max(tot, mw);
  const F = fit([[-spanW / 2, 0, dp / 2], [spanW / 2, H, -dp / 2], [-spanW / 2, H, dp / 2], [spanW / 2, 0, dp / 2]].map((p) => proj(p as any, { ...cam, yaw: -16 })), [90, top, 990, top + hgt]);
  const Tm = D.merge ? cueAt(cue, D.merge.cue, 1e9) - 0.12 : 1e9, km = ease((t - Tm) / 0.3), kM = sp(t, Tm + 0.22, 8, 220);
  const Ti = T.map((x, i) => cueAt(cue, x.cue, 0.3 + i * 0.8) - 0.12);
  const lastNote = T.map((x, i) => (x.note && t > Ti[i] + 0.25 ? i : -1)).filter((i) => i >= 0).pop() ?? -1;
  return <Svg>
    {T.map((x, i) => { if (t < Ti[i] || km >= 1) return null; const k = sp(t, Ti[i], 9, 200); const y0 = Math.max(0, (1 - k) * 7);
      const X = lerp(xs[i], 0, km);
      return <g key={i}><BoxShadow cam={cam} F={F} x={X} z={0} w={wd(x.t)} d={dp} h={H * 0.5} o={cl(k)} />
        <Box cam={cam} F={F} x={X} z={0} w={wd(x.t)} d={dp} h={H} y0={y0} c={x.color ?? "chalk"} label={x.t} ink={col(x.ink ?? (x.color && x.color !== "chalk" ? "white" : "navy"))} fs={0.95} round={10} o={1 - km} /></g>; })}
    {lastNote >= 0 && km <= 0 ? (() => { const q = S2(proj([xs[lastNote] - wd(T[lastNote].t) / 2, 0, dp / 2], cam), F); return <Mono x={q.x} y={q.y + 34} t={"↑ " + T[lastNote].note} c={INK} s={18} />; })() : null}
    {D.merge && t > Tm + 0.22 ? <g>
      <BoxShadow cam={cam} F={F} x={0} z={0} w={mw} d={dp} h={H * 0.5} />
      <Box cam={cam} F={F} x={0} z={0} w={mw * (0.6 + 0.4 * kM)} d={dp} h={H} y0={Math.max(0, (1 - kM) * 2)} c={D.merge.color ?? "accent"} label={D.merge.t} ink={col(D.merge.ink ?? "white")} fs={0.95} round={10} />
      {D.merge.note ? (() => { const q = S2(proj([0, 0, dp / 2], cam), F); return <Mono x={q.x} y={q.y + 40} t={D.merge.note} c={MUTE} s={17} a="middle" o={cl((t - Tm - 0.6) * 3)} />; })() : null}
    </g> : null}
    {D.card ? (() => { const c = D.card, Tc = cueAt(cue, c.cue, 1.5) - 0.1; if (t < Tc) return null; const k = sp(t, Tc, 13, 170);
      const Tst = cueAt(cue, c.strikeCue, 1e9), Ta = cueAt(cue, c.altCue, 1e9) - 0.1, ks = ease((t - Tst) / 0.35);
      const dw = (s: string, f: number) => s.length * f * 0.52; const defA = c.strike ? c.def.slice(0, c.def.lastIndexOf(c.strike)) : c.def;
      return <g transform={`translate(0,${(1 - k) * 60})`} opacity={cl(k * 1.5) * (1 - km * 0)}>
        <rect x={65} y={230} width={950} height={362} rx={26} fill="#fff" stroke="#E7E1DA" strokeWidth={3} filter="url(#shadow)" />
        <text x={105} y={312} fontFamily={FONT} fontWeight={900} fontSize={60} fill={INK}>{c.head}</text>
        {c.tag ? <Mono x={107} y={350} t={c.tag} c={MUTE} s={17} /> : null}
        <text x={105} y={410} fontFamily={FONT} fontWeight={800} fontSize={42} fill={INK}>{defA}<tspan dx={12} fill={t > Tst ? MUTE : INK}>{c.strike ?? ""}</tspan></text>
        {c.strike && t > Tst ? <line x1={117 + dw(defA, 42)} x2={117 + dw(defA, 42) + dw(c.strike, 42) * ks} y1={396} y2={396} stroke={col("accent")} strokeWidth={6} strokeLinecap="round" /> : null}
        {c.alt && t > Ta ? <g opacity={cl((t - Ta) * 4)}><Mono x={107} y={466} t={c.altLabel ?? "in this case:"} c={col("accent")} s={17} />
          <text x={105} y={530} fontFamily={FONT} fontWeight={900} fontSize={Math.min(56, 860 / (c.alt.length * 0.52))} fill={col("accent")} transform={`translate(0,${(1 - sp(t, Ta)) * 18})`}>{c.alt}</text></g> : null}
      </g>; })() : null}
  </Svg>;
};

// ------------------------------------------------------------------ 4. rewind: the outcome counts back to zero ("Let's rewind")
// data: { from, to?, cue?, dur?, label? }
const rewind: React.FC<DP> = ({ t, cue, data: D }) => {
  const T0 = cueAt(cue, D.cue, 0.1), dur = D.dur ?? 1.1, k = ease((t - T0) / dur), v = Math.round(lerp(D.from, D.to ?? 0, k));
  const jit = t > T0 && k < 1 ? Math.sin(t * 90) * 6 : 0, done = k >= 1;
  return <Svg>
    {[0.5, 0.25].map((o, j) => t > T0 && !done ? <text key={j} x={540 + (j + 1) * 34} y={330} textAnchor="middle" fontFamily={FONT} fontWeight={900} fontSize={230} fill={MUTE} opacity={o * 0.35}>{v}</text> : null)}
    <text x={540 + jit} y={330} textAnchor="middle" fontFamily={FONT} fontWeight={900} fontSize={230} fill={done ? mixc(MUTE, "#ffffff", 0.45) : MUTE} letterSpacing={-6}>{v}</text>
    <g transform={`translate(${430},${400})`} opacity={done ? 0.5 : 0.6 + 0.4 * Math.abs(Math.sin(t * 7))}>
      <path d="M-34,0 L0,-22 L0,22 Z M-70,0 L-36,-22 L-36,22 Z" transform="translate(70,0)" fill={col("accent")} />
      <Mono x={90} y={10} t={D.label ?? "rewind"} c={col("accent")} s={30} /></g>
  </Svg>;
};

// ------------------------------------------------------------------ 5. progress: "12.5 overs of 50" pips + layered target bar
// data: { pips?:{ v, total, label, cue }, track:{ total, label?, cue? }, segs:[{ v, color, cue, text? }] }
// Segments are drawn on one track in order (e.g. blue "needed 245" then pink "scored 204"); the big number shows the latest.
const progress: React.FC<DP> = ({ t, cue, data: D }) => {
  const P = D.pips, Tp = P ? cueAt(cue, P.cue, 0.2) - 0.1 : 0, kp = ease((t - Tp) / 1.0);
  const Tt = cueAt(cue, D.track.cue, 1) - 0.1, segs = (D.segs ?? []) as any[]; const Ts = segs.map((s, i) => cueAt(cue, s.cue, 1.5 + i) - 0.1);
  const cur = Ts.map((x, i) => (t > x ? i : -1)).filter((i) => i >= 0).pop() ?? -1; const tw = 950;
  return <Svg>
    {P ? <g opacity={cl((t - Tp) * 4)}>
      <text x={65} y={52} fontFamily={FONT} fontWeight={900} fontSize={46} fill={INK}>{fmt(P.v * kp, dec(P.v))} {P.label}<tspan fill={MUTE} fontWeight={700}> of {P.total}</tspan></text>
      {Array.from({ length: P.total }, (_, i) => { const pw = tw / P.total; const f = cl(P.v * kp - i);
        return <g key={i}><rect x={65 + i * pw} y={78} width={pw - 4} height={26} rx={4} fill={TRACK} />
          {f > 0 ? <rect x={65 + i * pw} y={78} width={(pw - 4) * f} height={26} rx={4} fill={col("accent")} /> : null}</g>; })}
    </g> : null}
    {t > Tt ? <g opacity={cl((t - Tt) * 4)}>
      <Mono x={65} y={196} t={D.track.label ?? `target: ${D.track.total}`} c={col("blue")} s={18} />
      <rect x={65} y={214} width={tw} height={64} rx={14} fill={TRACK} />
      {segs.map((s, i) => t > Ts[i] ? <rect key={i} x={65} y={214} width={tw * (s.v / D.track.total) * ease((t - Ts[i]) / 0.9)} height={64} rx={14} fill={col(s.color)} /> : null)}
      {cur >= 0 ? <g transform={`translate(0,${(1 - sp(t, Ts[cur])) * 20})`}>
        <text x={65} y={398} fontFamily={FONT} fontWeight={900} fontSize={120} fill={col(segs[cur].color)}>{fmt(segs[cur].v * ease((t - Ts[cur]) / 0.9))}
          <tspan fontSize={44} fill={MUTE} fontWeight={700} dx={14}>of {D.track.total}</tspan></text>
        {segs[cur].text ? <Mono x={68} y={446} t={segs[cur].text} c={INK} s={20} /> : null}</g> : null}
    </g> : null}
  </Svg>;
};

// ------------------------------------------------------------------ 6. phaseRows: thin labelled rate bars + threshold line + stat boxes
// data: { rows:[{ label, sub?, v, display?, color?, cue }], max, ref?:{ v, label, cue? }, boxes?:[{ label, v, unit?, cue, color? }] }
const phaseRows: React.FC<DP> = ({ t, cue, data: D }) => {
  const R = D.rows as any[], hasB = !!D.boxes?.length, rh = Math.min(96, (hasB ? 430 : 570) / R.length), X = (v: number) => 65 + (v / D.max) * 950;
  const Tr = D.ref ? cueAt(cue, D.ref.cue, R.length * 0.5 + 1) - 0.1 : 1e9;
  return <Svg>
    {R.map((r, i) => { const T0 = cueAt(cue, r.cue, 0.2 + i * 0.45) - 0.1; if (t < T0) return null; const k = ease((t - T0) / 0.8), y = 10 + i * rh, c = col(r.color ?? (i ? "accent" : "blue"));
      return <g key={i} opacity={cl((t - T0) * 5)}>
        <text x={65} y={y + 34} fontFamily={FONT} fontWeight={900} fontSize={32} fill={INK}>{r.label}{r.sub ? <tspan fontFamily={MONO} fontSize={16} fontWeight={600} fill={MUTE} dx={14}>{r.sub}</tspan> : null}</text>
        <text x={1015} y={y + 34} textAnchor="end" fontFamily={FONT} fontWeight={900} fontSize={30} fill={c}>{r.display ? r.display.replace(/[\d.,]+/, (m: string) => fmt(Number(m.replace(/,/g, "")) * k, (m.split(".")[1] ?? "").length)) : fmt(r.v * k, dec(r.v))}</text>
        <rect x={65} y={y + 48} width={950} height={14} rx={7} fill={TRACK} /><rect x={65} y={y + 48} width={950 * (r.v / D.max) * k} height={14} rx={7} fill={c} /></g>; })}
    {D.ref && t > Tr ? <g opacity={cl((t - Tr) * 4)}>
      <line x1={X(D.ref.v)} x2={X(D.ref.v)} y1={0} y2={10 + R.length * rh * ease((t - Tr) / 0.5)} stroke={INK} strokeWidth={3} strokeDasharray="8 7" />
      <Mono x={X(D.ref.v)} y={22 + R.length * rh} t={D.ref.label} c={INK} s={16} a="middle" /></g> : null}
    {(D.boxes ?? []).map((b: any, i: number) => { const T0 = cueAt(cue, b.cue, 2 + i) - 0.1; if (t < T0) return null; const k = sp(t, T0, 12, 190), x = 65 + i * 485, c = col(b.color ?? (i ? "accent" : "navy"));
      return <g key={i} transform={`translate(${x},${470 + (1 - k) * 40})`} opacity={cl(k * 1.5)}>
        <rect width={465} height={118} rx={20} fill="#fff" stroke={i ? c : "#E7E1DA"} strokeWidth={3} filter="url(#shadow)" />
        <Mono x={26} y={34} t={b.label} c={i ? c : MUTE} s={16} />
        <text x={26} y={96} fontFamily={FONT} fontWeight={900} fontSize={56} fill={c}>{fmt(b.v * ease((t - T0) / 0.7))}<tspan fontSize={24} fontWeight={700} dx={8}>{b.unit ?? ""}</tspan></text></g>; })}
  </Svg>;
};

// ------------------------------------------------------------------ 7. recordStack: "?" placeholders that flip into the same name (repetition gag)
// data: { rows:[{ label, name, v, unit?, qCue?, cue, img? }], footer?:{ t, cue } }
const Avatar: React.FC<{ x: number; y: number; r: number; img?: string; name: string }> = ({ x, y, r, img, name }) => {
  const file = img ? (POSTERS as Record<string, string>)[img.toLowerCase()] : undefined; const id = `av-${Math.round(x)}-${Math.round(y)}`;
  return <g><defs><clipPath id={id}><circle cx={x} cy={y} r={r} /></clipPath></defs><circle cx={x} cy={y} r={r} fill={col("blue")} />
    {file ? <image href={staticFile(`brand/cards/${file}`)} x={x - r} y={y - r} width={2 * r} height={2 * r} clipPath={`url(#${id})`} preserveAspectRatio="xMidYMid slice" />
      : <text x={x} y={y + r * 0.36} textAnchor="middle" fontFamily={FONT} fontWeight={900} fontSize={r} fill="#fff">{name.slice(0, 1)}</text>}</g>;
};
const recordStack: React.FC<DP> = ({ t, cue, data: D }) => {
  const R = D.rows as any[], rh = Math.min(104, (D.footer ? 540 : 590) / R.length);
  return <Svg>
    {R.map((r, i) => { const Tq = cueAt(cue, r.qCue ?? r.label?.split(" ").pop(), 0.2 + i) - 0.15, Tn = cueAt(cue, r.cue, Tq + 0.8) - 0.1; if (t < Tq) return null;
      const y = i * rh, h = rh - 14, flip = t > Tn ? Math.abs(Math.cos(Math.min(1, (t - Tn) / 0.3) * Math.PI)) : 1, filled = t > Tn + 0.15, ka = sp(t, Tq, 13, 200);
      return <g key={i} transform={`translate(0,${y + (1 - ka) * 30})`} opacity={cl(ka * 1.5)}><g transform={`translate(0,${h / 2}) scale(1,${Math.max(0.05, flip)}) translate(0,${-h / 2})`}>
        <rect x={65} y={0} width={950} height={h} rx={16} fill="#fff" stroke={filled ? col("blue") : "#E7E1DA"} strokeWidth={filled ? 3 : 2} strokeDasharray={filled ? undefined : "8 6"} />
        {filled ? <Avatar x={65 + h / 2 + 6} y={h / 2} r={h * 0.36} img={r.img} name={r.name} /> : <g><circle cx={65 + h / 2 + 6} cy={h / 2} r={h * 0.36} fill={TRACK} /><text x={65 + h / 2 + 6} y={h / 2 + h * 0.14} textAnchor="middle" fontFamily={FONT} fontWeight={900} fontSize={h * 0.4} fill={MUTE}>?</text></g>}
        <Mono x={65 + h + 24} y={h * 0.36} t={r.label} c={MUTE} s={15} />
        {filled ? <text x={65 + h + 22} y={h * 0.78} fontFamily={FONT} fontWeight={900} fontSize={h * 0.36} fill={INK}>{r.name}</text> : null}
        {filled ? <text x={990} y={h * 0.62} textAnchor="end" fontFamily={FONT} fontWeight={900} fontSize={h * 0.46} fill={col("accent")}>{fmt(r.v)}</text> : null}
        {filled && r.unit ? <Mono x={990} y={h * 0.86} t={r.unit} c={MUTE} s={13} a="end" /> : null}</g></g>; })}
    {D.footer && t > cueAt(cue, D.footer.cue, 1e9) ? <Mono x={65} y={590} t={D.footer.t} c={col("accent")} s={17} o={cl((t - cueAt(cue, D.footer.cue, 0)) * 3)} /> : null}
  </Svg>;
};

// ------------------------------------------------------------------ 8. stampQA: rhetorical question -> deadpan stamp ("NO." / "ALSO NO.")
// data: { rows:[{ q, cue?, a, aCue, color? }] }
const stampQA: React.FC<DP> = ({ t, cue, data: D }) => {
  const R = D.rows as any[], rh = 600 / R.length; const last = Math.max(...R.map((r) => cueAt(cue, r.aCue, 1e9)));
  const shake = t > last ? Math.sin((t - last) * 60) * 10 * Math.exp(-(t - last) * 5) : 0;
  return <Svg><g transform={`translate(${shake},0)`}>{R.map((r, i) => { const Tq = cueAt(cue, r.cue, 0.1 + i * 1.5) - 0.1, Ta = cueAt(cue, r.aCue, Tq + 1) - 0.05; if (t < Tq) return null; const y = i * rh;
    return <g key={i}><text x={65} y={y + 64} fontFamily={FONT} fontWeight={900} fontSize={Math.min(60, 1700 / r.q.length)} fill={INK} opacity={cl((t - Tq) * 4)}>{r.q}</text>
      {t > Ta ? <Stamp x={1015 - r.a.length * 32} y={y + 175} text={r.a} color={col(r.color ?? "accent")} k={sp(t, Ta, 9, 240)} rot={-6 + i * 3} size={76} /> : null}</g>; })}</g></Svg>;
};

// ------------------------------------------------------------------ 9. strikeList: old numbers struck through + big stamp ("IRRELEVANT.")
// data: { rows:[{ label, v }], strikeCue, stamp?:{ text, cue, color? } }
const strikeList: React.FC<DP> = ({ t, cue, data: D }) => {
  const R = D.rows as any[], rh = Math.min(92, 560 / R.length), Ts = cueAt(cue, D.strikeCue, 1e9) - 0.1, Tk = D.stamp ? cueAt(cue, D.stamp.cue, 1e9) - 0.05 : 1e9;
  return <Svg>{R.map((r, i) => { const T0 = 0.15 + i * 0.18, k = sp(t, T0, 13, 200), y = i * rh, ks = ease((t - Ts - i * 0.12) / 0.3);
    return <g key={i} opacity={cl(k * 1.5) * (t > Ts ? 0.75 : 1)} transform={`translate(${(1 - k) * 40},${y})`}>
      <rect x={65} y={0} width={950} height={rh - 16} rx={14} fill="#fff" stroke="#E7E1DA" strokeWidth={2} />
      <Mono x={95} y={(rh - 16) / 2 + 7} t={r.label} c={MUTE} s={19} />
      <text x={985} y={(rh - 16) / 2 + 12} textAnchor="end" fontFamily={FONT} fontWeight={900} fontSize={34} fill={t > Ts ? col("accent") : INK}>{r.v}</text>
      {ks > 0 ? <line x1={80} x2={80 + 920 * ks} y1={(rh - 16) / 2} y2={(rh - 16) / 2} stroke={col("accent")} strokeWidth={4} /> : null}</g>; })}
    {t > Tk ? <Stamp x={540} y={R.length * rh * 0.55} text={D.stamp.text} color={col(D.stamp.color ?? "accent")} k={sp(t, Tk, 9, 240)} rot={-7} size={96} /> : null}
  </Svg>;
};

// ------------------------------------------------------------------ 10. verifyCard: fake-UI punchline (captcha that fails)
// data: { title?, check?, status, cue?, fail, failCue }
const verifyCard: React.FC<DP> = ({ t, cue, data: D }) => {
  const T0 = cueAt(cue, D.cue, 0.2) - 0.1, Tf = cueAt(cue, D.failCue, 1e9) - 0.05, k = sp(t, T0, 13, 180), bad = t > Tf;
  const sh = bad ? Math.sin((t - Tf) * 55) * 12 * Math.exp(-(t - Tf) * 5) : 0; const red = "#E5252A";
  return <Svg><g transform={`translate(${110 + sh},${110 + (1 - k) * 50})`} opacity={cl(k * 1.5)}>
    <rect width={860} height={360} rx={26} fill="#fff" stroke={bad ? red : "#E7E1DA"} strokeWidth={bad ? 4 : 2} filter="url(#shadow)" />
    <text x={40} y={66} fontFamily={FONT} fontWeight={900} fontSize={38} fill={INK}>{D.title ?? "Human verification"}</text>
    <path transform="translate(790,38)" d="M14,0 L28,6 L28,18 C28,28 20,34 14,36 C8,34 0,28 0,18 L0,6 Z" fill="none" stroke={MUTE} strokeWidth={3} />
    <rect x={40} y={100} width={780} height={92} rx={14} fill="#FAF8F6" stroke="#E7E1DA" strokeWidth={2} />
    <rect x={66} y={126} width={40} height={40} rx={8} fill="#fff" stroke={MUTE} strokeWidth={3} />
    <text x={130} y={158} fontFamily={FONT} fontWeight={700} fontSize={32} fill={INK}>{D.check ?? "I'm not a robot"}</text>
    {t > T0 + 0.6 ? <g opacity={cl((t - T0 - 0.6) * 3)}>
      <g transform={`translate(${60},${250}) rotate(${bad ? 0 : t * 360})`}>{[0, 1, 2, 3, 4, 5].map((j) => <circle key={j} cx={Math.cos(j) * 12} cy={Math.sin(j) * 12} r={3} fill={MUTE} opacity={0.3 + j * 0.12} />)}</g>
      <text x={90} y={260} fontFamily={FONT} fontWeight={600} fontSize={26} fill={MUTE}>{D.status}</text></g> : null}
    {bad ? <text x={430} y={322} textAnchor="middle" fontFamily={FONT} fontWeight={900} fontSize={32} fill={red} opacity={cl((t - Tf) * 5)}>{D.fail}</text> : null}
  </g></Svg>;
};

export const DEPTH_SCENES: Record<string, React.FC<DP>> = { ballGrid, bars3d, tiles3d, rewind, progress, phaseRows, recordStack, stampQA, strikeList, verifyCard };
