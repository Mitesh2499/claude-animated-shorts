// v2 character rig: anatomical proportions + forward kinematics + draped clothing, flat-cel with ink.
// Local units = head heights (H). Local +x = the direction the figure faces; mirrored by `facing`.
// Angles: degrees, ABSOLUTE, measured from straight down; + rotates toward the facing direction (forward), 180 = straight up.
import React, { useId } from "react";

export type XY = [number, number];
const R = Math.PI / 180;
const dir = (a: number): XY => [Math.sin(a * R), Math.cos(a * R)];
const add = (a: XY, b: XY): XY => [a[0] + b[0], a[1] + b[1]];
const sub = (a: XY, b: XY): XY => [a[0] - b[0], a[1] - b[1]];
const mul = (a: XY, k: number): XY => [a[0] * k, a[1] * k];
const lerp = (a: XY, b: XY, t: number): XY => [a[0] + (b[0] - a[0]) * t, a[1] + (b[1] - a[1]) * t];
const len = (a: XY) => Math.hypot(a[0], a[1]);
const norm = (a: XY): XY => { const l = len(a) || 1; return [a[0] / l, a[1] / l]; };
const rot = (p: XY, a: number, o: XY = [0, 0]): XY => {
  const c = Math.cos(a * R), s = Math.sin(a * R), x = p[0] - o[0], y = p[1] - o[1];
  return [o[0] + x * c - y * s, o[1] + x * s + y * c];
};
const f = (n: number) => n.toFixed(4);
const P = (p: XY) => `${f(p[0])},${f(p[1])}`;

/** Smooth path through points (Catmull-Rom -> cubic Bezier). */
export const curve = (pts: XY[], closed = false) => {
  const n = pts.length; const g = (i: number) => (closed ? pts[(i + n) % n] : pts[Math.max(0, Math.min(n - 1, i))]);
  let d = `M${P(pts[0])}`;
  const segs = closed ? n : n - 1;
  for (let i = 0; i < segs; i++) {
    const p0 = g(i - 1), p1 = g(i), p2 = g(i + 1), p3 = g(i + 2);
    const c1 = add(p1, mul(sub(p2, p0), 1 / 6)), c2 = sub(p2, mul(sub(p3, p1), 1 / 6));
    d += ` C${P(c1)} ${P(c2)} ${P(p2)}`;
  }
  return closed ? d + "Z" : d;
};
const lerpPts = (a: XY[], b: XY[], t: number) => a.map((p, i) => lerp(p, b[i], t));

/** Tapered tube along a centerline with half-widths -> closed outline path with rounded caps. */
export const tube = (c: XY[], w: number[]) => {
  const n = c.length, L: XY[] = [], Rr: XY[] = [];
  for (let i = 0; i < n; i++) {
    const t = norm(sub(c[Math.min(i + 1, n - 1)], c[Math.max(i - 1, 0)]));
    const nr: XY = [-t[1], t[0]];
    L.push(add(c[i], mul(nr, w[i]))); Rr.push(sub(c[i], mul(nr, w[i])));
  }
  const t0 = norm(sub(c[1], c[0])), t1 = norm(sub(c[n - 1], c[n - 2]));
  const k = 1.33;
  let d = curve(L).replace(/^M/, "M");
  d += ` C${P(add(L[n - 1], mul(t1, w[n - 1] * k)))} ${P(add(Rr[n - 1], mul(t1, w[n - 1] * k)))} ${P(Rr[n - 1])}`;
  const back = curve([...Rr].reverse()).replace(/^M[^C]*/, "");
  d += back;
  d += ` C${P(sub(Rr[0], mul(t0, w[0] * k)))} ${P(sub(L[0], mul(t0, w[0] * k)))} ${P(L[0])}Z`;
  return d;
};
/** Sample a limb segment A->B with a width profile (array of [t, halfWidth]). Slight bow for muscle curve. */
const seg = (a: XY, b: XY, prof: [number, number][], bow = 0): [XY[], number[]] => {
  const nr: XY = norm([-(b[1] - a[1]), b[0] - a[0]]);
  return [prof.map(([t]) => add(lerp(a, b, t), mul(nr, Math.sin(t * Math.PI) * bow))), prof.map(([, w]) => w)];
};

export const INK = "#22170f";
export type Part = { d: string; fill: string; own?: boolean; shade?: string; shadeD?: string; op?: number; noInk?: boolean };
/** Ink layer: outlines of merged parts first, then fills, so touching parts read as one silhouette. */
const Layer: React.FC<{ parts: Part[]; lw: number }> = ({ parts, lw }) => (
  <g strokeLinejoin="round" strokeLinecap="round">
    {parts.filter((p) => !p.own && !p.noInk).map((p, i) => <path key={"o" + i} d={p.d} fill={INK} stroke={INK} strokeWidth={lw * 2} />)}
    {parts.map((p, i) => (
      <g key={i} opacity={p.op ?? 1}>
        {p.own && !p.noInk ? <path d={p.d} fill={INK} stroke={INK} strokeWidth={lw * 2} /> : null}
        <path d={p.d} fill={p.fill} />
        {p.shadeD ? <path d={p.shadeD} fill={p.shade} /> : null}
      </g>
    ))}
  </g>
);
/** Shade strip along one side of a tube (cel shadow side = local -x/back or +y). */
const shadeTube = (c: XY[], w: number[], side = 1, k = 0.45) => {
  const n = c.length, cc: XY[] = [], ww: number[] = [];
  for (let i = 0; i < n; i++) {
    const t = norm(sub(c[Math.min(i + 1, n - 1)], c[Math.max(i - 1, 0)]));
    const nr: XY = [-t[1] * side, t[0] * side];
    cc.push(add(c[i], mul(nr, w[i] * (1 - k)))); ww.push(w[i] * k);
  }
  return tube(cc, ww);
};

// ------------------------------------------------------------------------------------------------ hands
export type HandPose = "relax" | "open" | "bless" | "grip" | "cup" | "point" | "rest" | "pinch";
const CURL: Record<HandPose, number[]> = {
  relax: [0.35, 0.42, 0.48, 0.55, 0.3], open: [0.05, 0.03, 0.05, 0.08, 0.05], bless: [0.02, 0, 0.03, 0.06, 0.15],
  grip: [0.95, 1, 1, 1, 0.75], cup: [0.3, 0.32, 0.34, 0.38, 0.25], point: [0, 0.95, 1, 1, 0.6], rest: [0.5, 0.55, 0.6, 0.65, 0.35], pinch: [0.6, 0.7, 0.8, 0.85, 0.6],
};
/** Hand in H units drawn at wrist, pointing along `a` (abs angle). thumb: +1 thumb on forward side. back: show back of hand. */
export const handParts = (wrist: XY, a: number, pose: HandPose, thumb: 1 | -1, skin: string, shade: string, sc = 1): Part[] => {
  const curl = CURL[pose];
  const fw = dir(a), side: XY = [-fw[1] * thumb, fw[0] * thumb];   // side points toward the thumb
  const at = (u: number, v: number): XY => add(wrist, add(mul(fw, u * sc), mul(side, v * sc)));
  const palm: XY[] = [at(0, -0.17), at(0.18, -0.2), at(0.4, -0.18), at(0.44, 0.0), at(0.4, 0.17), at(0.2, 0.2), at(0.02, 0.15)];
  const parts: Part[] = [{ d: curve(palm, true), fill: skin }];
  const fingers: [number, number][] = [[0.12, 0.36], [0.04, 0.41], [-0.04, 0.38], [-0.12, 0.3]]; // [v offset, length]
  const spread = pose === "open" || pose === "bless" ? 9 : 3;
  const fparts: Part[] = [];
  fingers.forEach(([v, L], i) => {
    const base = at(0.42 - Math.abs(v) * 0.25, v);
    let ang = a + (i - 1.5) * -spread * thumb, p = base; const c: XY[] = [p]; const segL = [0.45, 0.3, 0.25];
    for (let j = 0; j < 3; j++) {
      ang = ang - curl[i] * 58 * thumb;            // fingers curl toward the thumb side (side view of a closing hand)
      p = add(p, mul(dir(ang), L * segL[j] * sc)); c.push(p);
    }
    const w = [0.056, 0.052, 0.047, 0.041].map((x) => x * sc);
    fparts.unshift({ d: tube(c, w), fill: skin, own: true });
  });
  parts.push(...fparts);
  // thumb from the palm side near the wrist
  const tb = at(0.13, 0.17);
  let ta = a - 35 * thumb; const tc: XY[] = [tb]; let tp = tb;   // thumb points out to the thumb side...
  for (let j = 0; j < 2; j++) { ta = ta + curl[4] * 55 * thumb; tp = add(tp, mul(dir(ta), 0.17 * sc)); tc.push(tp); }   // ...and folds back across the palm
  parts.push({ d: tube([tb, lerp(tb, tc[1], 0.5), tc[1], tc[2]], [0.09, 0.08, 0.068, 0.058].map((x) => x * sc)), fill: skin, own: true });
  parts.push({ d: curve([at(0.05, -0.17), at(0.3, -0.19), at(0.4, -0.14)]), fill: "none", noInk: true });
  return parts.map((p, i) => (i === 0 ? { ...p, shade, shadeD: curve([at(0.02, -0.16), at(0.2, -0.2), at(0.4, -0.18), at(0.42, -0.06), at(0.2, -0.08), at(0.04, -0.06)], true) } : p));
};

// ------------------------------------------------------------------------------------------------ feet
const footPath = (ankle: XY, a: number, toesBent = false) => {
  // foot along `a` (90 = forward flat). Local: u forward, v down.
  const fw = dir(a), dn: XY = [-fw[1] * -1, fw[0] * -1];
  const at = (u: number, v: number): XY => add(ankle, add(mul(fw, u), mul([fw[1] * -1 * -1, -fw[0]] as XY, -v)));
  void dn;
  const pts: XY[] = toesBent
    ? [at(-0.2, -0.1), at(-0.26, 0.12), at(0.05, 0.2), at(0.55, 0.16), at(0.7, 0.24), at(0.86, 0.22), at(0.84, 0.08), at(0.5, -0.02), at(0.12, -0.14)]
    : [at(-0.18, -0.12), at(-0.25, 0.1), at(-0.12, 0.2), at(0.45, 0.2), at(0.82, 0.18), at(0.9, 0.1), at(0.8, 0.02), at(0.45, -0.04), at(0.14, -0.14)];
  return curve(pts, true);
};

// ------------------------------------------------------------------------------------------------ head
export type Mouth = "neutral" | "sad" | "open" | "o" | "smile" | "smileOpen" | "talk2";
export type Face = { yaw?: number; tilt?: number; open?: number; look?: XY; brow?: number; mouth?: Mouth; tear?: number; blink?: boolean };
export type Look = "kartik" | "elder" | "krishna";
type Style = { skin: string; shade: string; lip: string; hair: string; iris: string };
export const STYLES: Record<Look, Style> = {
  kartik: { skin: "#c08457", shade: "#9a6238", lip: "#8e4a3a", hair: "#17110e", iris: "#3a2416" },
  elder: { skin: "#a9714a", shade: "#86542f", lip: "#7d4434", hair: "#e9e3d6", iris: "#2e2014" },
  krishna: { skin: "#4f86c6", shade: "#335f9a", lip: "#9b3d55", hair: "#0f0f18", iris: "#1a1220" },
};
// head outlines: same point count front (F) and 3/4-right (Q); y: crown -0.56 .. chin 0.46
const HEAD_F: XY[] = [[0, -0.56], [0.25, -0.5], [0.37, -0.28], [0.385, -0.05], [0.36, 0.13], [0.3, 0.29], [0.17, 0.42], [0, 0.465], [-0.17, 0.42], [-0.3, 0.29], [-0.36, 0.13], [-0.385, -0.05], [-0.37, -0.28], [-0.25, -0.5]];
const HEAD_Q: XY[] = [[-0.04, -0.56], [0.25, -0.47], [0.36, -0.22], [0.375, 0.0], [0.34, 0.16], [0.28, 0.31], [0.17, 0.43], [0.04, 0.46], [-0.12, 0.38], [-0.26, 0.24], [-0.36, 0.06], [-0.43, -0.12], [-0.42, -0.34], [-0.3, -0.5]];

export const Head: React.FC<{ look: Look; face: Face; lw: number; c: XY; scale?: number; children?: React.ReactNode; behind?: React.ReactNode }> = ({ look, face, lw, c, scale = 1 }) => {
  const st = STYLES[look]; const id = useId().replace(/:/g, "");
  const y = face.yaw ?? 1, tilt = face.tilt ?? 0, open = face.blink ? 0 : face.open ?? 1, lk = face.look ?? [0.3, 0], brow = face.brow ?? 0;
  const L = (a: XY, b: XY): XY => lerp(a, b, y);
  const outline = curve(lerpPts(HEAD_F, HEAD_Q, y), true);
  const eyeN = L([-0.165, -0.06], [0.02, -0.07]), eyeF = L([0.165, -0.06], [0.26, -0.075]);
  const ewN = L([0.085, 0], [0.085, 0])[0], ewF = L([0.085, 0], [0.055, 0])[0];
  const nose: XY[] = [L([0.0, -0.1], [0.27, -0.12]), L([0.03, 0.08], [0.4, 0.07]), L([0.0, 0.13], [0.39, 0.12]), L([-0.05, 0.12], [0.31, 0.13])];
  const mouthC = L([0, 0.255], [0.19, 0.255]), mwN = L([0.105, 0], [0.11, 0])[0], mwF = L([0.105, 0], [0.065, 0])[0];
  const ear = L([-0.385, 0.0], [-0.19, 0.01]);
  const s = lw;
  const eye = (cx: XY, w: number, near: boolean) => {
    const h = 0.05 * Math.max(0.05, open);
    const inner: XY = [cx[0] - w * (near ? 1 : 1), cx[1] + 0.006], outer: XY = [cx[0] + w, cx[1] - 0.004];
    const top = `M${P(inner)} Q${P([cx[0], cx[1] - h * 2.1])} ${P(outer)}`;
    const shape = `${top} Q${P([cx[0], cx[1] + 0.052 * Math.max(open, 0.2) * 1.4])} ${P(inner)}Z`;
    const ir: XY = [cx[0] + lk[0] * w * 0.45, cx[1] + lk[1] * 0.02];
    if (open < 0.12) return <path d={`M${P(inner)} Q${P([cx[0], cx[1] + 0.03])} ${P(outer)}`} fill="none" stroke={INK} strokeWidth={s * 1.3} />;
    return (
      <g>
        <clipPath id={`${id}e${near ? 1 : 0}`}><path d={shape} /></clipPath>
        <path d={shape} fill="#f8f3ea" />
        <g clipPath={`url(#${id}e${near ? 1 : 0})`}>
          <circle cx={ir[0]} cy={ir[1]} r={0.04} fill={st.iris} />
          <circle cx={ir[0]} cy={ir[1]} r={0.019} fill="#080503" />
          <circle cx={ir[0] + 0.012} cy={ir[1] - 0.014} r={0.009} fill="#fff" />
          <path d={top + ` L${P(outer)} L${P([outer[0], outer[1] - 0.1])} L${P([inner[0], inner[1] - 0.1])}Z`} fill={st.shade} opacity={0.25} />
        </g>
        <path d={top} fill="none" stroke={INK} strokeWidth={s * 1.6} />
        <path d={`M${P([inner[0] + w * 0.3, cx[1] + 0.045])} Q${P([cx[0], cx[1] + 0.06])} ${P([outer[0] - w * 0.15, cx[1] + 0.035])}`} fill="none" stroke={INK} strokeWidth={s * 0.6} opacity={0.6} />
        <path d={`M${P([inner[0] + w * 0.1, cx[1] - h * 2.1 - 0.025])} Q${P([cx[0], cx[1] - h * 2.4 - 0.04])} ${P([outer[0] - w * 0.1, cx[1] - h * 1.5 - 0.03])}`} fill="none" stroke={st.shade} strokeWidth={s * 0.7} opacity={0.8} />
      </g>
    );
  };
  const browP = (cx: XY, w: number, sideSign: number) => {
    const inn: XY = [cx[0] - w * sideSign * 0.9, cx[1] - 0.11 - brow * 0.035], out: XY = [cx[0] + w * sideSign * 1.1, cx[1] - 0.1 + brow * 0.012];
    const mid = lerp(inn, out, 0.5);
    return <path d={`M${P(inn)} Q${P([mid[0], mid[1] - 0.03])} ${P(out)}`} fill="none" stroke={look === "elder" ? "#d8d2c4" : INK} strokeWidth={s * (look === "elder" ? 3 : 2.4)} strokeLinecap="round" />;
  };
  const mouth = () => {
    const m = face.mouth ?? "neutral", a: XY = [mouthC[0] - mwN, mouthC[1]], b: XY = [mouthC[0] + mwF, mouthC[1] - 0.005];
    const lip = st.lip;
    switch (m) {
      case "sad": return <path d={`M${P([a[0], a[1] + 0.02])} Q${P([mouthC[0], mouthC[1] - 0.025])} ${P([b[0], b[1] + 0.02])}`} fill="none" stroke={INK} strokeWidth={s * 1.2} />;
      case "smile": return <g><path d={`M${P([a[0], a[1] - 0.015])} Q${P([mouthC[0], mouthC[1] + 0.035])} ${P([b[0], b[1] - 0.015])}`} fill="none" stroke={INK} strokeWidth={s * 1.2} /><path d={`M${P([mouthC[0] - 0.04, mouthC[1] + 0.05])} Q${P([mouthC[0], mouthC[1] + 0.065])} ${P([mouthC[0] + 0.03, mouthC[1] + 0.05])}`} fill="none" stroke={st.shade} strokeWidth={s} /></g>;
      case "open": case "talk2": case "o": case "smileOpen": {
        const hh = m === "o" ? 0.055 : m === "talk2" ? 0.03 : m === "smileOpen" ? 0.04 : 0.045;
        const ww = m === "o" ? 0.5 : 1;
        const aa: XY = lerp(mouthC, a, ww), bb: XY = lerp(mouthC, b, ww);
        const upY = m === "smileOpen" ? -0.012 : 0;
        const d = `M${P([aa[0], aa[1] + upY])} Q${P([mouthC[0], mouthC[1] - hh * 0.35])} ${P([bb[0], bb[1] + upY])} Q${P([mouthC[0], mouthC[1] + hh * 2])} ${P([aa[0], aa[1] + upY])}Z`;
        return <g><path d={d} fill="#4a1a1c" stroke={INK} strokeWidth={s * 1.1} />{m === "smileOpen" ? <path d={`M${P([aa[0] + 0.01, aa[1] + upY])} Q${P([mouthC[0], mouthC[1] - hh * 0.3])} ${P([bb[0] - 0.01, bb[1] + upY])} L${P([bb[0] - 0.015, bb[1] + 0.012])} Q${P([mouthC[0], mouthC[1] + 0.02])} ${P([aa[0] + 0.015, aa[1] + 0.012])}Z`} fill="#f4efe6" /> : <ellipse cx={mouthC[0]} cy={mouthC[1] + hh * 0.9} rx={(mwN + mwF) * 0.3 * ww} ry={hh * 0.45} fill="#b4515a" />}</g>;
      }
      default: return <g><path d={`M${P(a)} Q${P([mouthC[0], mouthC[1] + 0.012])} ${P(b)}`} fill="none" stroke={INK} strokeWidth={s * 1.2} /><path d={`M${P([mouthC[0] - 0.035, mouthC[1] + 0.045])} Q${P([mouthC[0], mouthC[1] + 0.06])} ${P([mouthC[0] + 0.03, mouthC[1] + 0.045])}`} fill="none" stroke={lip} strokeWidth={s * 1.4} opacity={0.6} /></g>;
    }
  };
  const shadeClip = `${id}h`;
  return (
    <g transform={`translate(${f(c[0])},${f(c[1])}) rotate(${tilt}) scale(${scale})`}>
      {look === "krishna" ? <KrishnaHairBack s={s} y={y} /> : null}
      {/* ear */}
      <g>
        <ellipse cx={ear[0]} cy={ear[1]} rx={0.065} ry={0.11} fill={st.skin} stroke={INK} strokeWidth={s * 2} />
        <path d={`M${P([ear[0] - 0.02, ear[1] - 0.06])} Q${P([ear[0] + 0.035, ear[1]])} ${P([ear[0] - 0.01, ear[1] + 0.06])}`} fill="none" stroke={st.shade} strokeWidth={s * 1.2} />
        {look === "krishna" ? <g><circle cx={ear[0]} cy={ear[1] + 0.16} r={0.055} fill="#f2c230" stroke={INK} strokeWidth={s} /><circle cx={ear[0]} cy={ear[1] + 0.16} r={0.022} fill="#c4271f" /></g> : null}
      </g>
      <clipPath id={shadeClip}><path d={outline} /></clipPath>
      <path d={outline} fill={INK} stroke={INK} strokeWidth={s * 2} />
      <path d={outline} fill={st.skin} />
      <g clipPath={`url(#${shadeClip})`}>
        {/* cel shadow: far side of the face + under the jaw (light from front-left) */}
        <path d={curve([L([-0.26, -0.6], [-0.16, -0.6]), L([-0.34, -0.3], [-0.26, -0.3]), L([-0.33, 0.05], [-0.28, 0.02]), L([-0.26, 0.34], [-0.16, 0.3]), L([-0.6, 0.6], [-0.6, 0.6]), L([-0.6, -0.6], [-0.6, -0.6])], true)} fill={st.shade} opacity={0.42} />
        <path d={curve([[-0.3, 0.3], [0, 0.47], [0.3, 0.3], [0.4, 0.6], [-0.4, 0.6]], true)} fill={st.shade} opacity={0.3} />
        <ellipse cx={L([-0.2, 0.08], [0.0, 0.1])[0]} cy={0.12} rx={0.06} ry={0.035} fill="#e07a5f" opacity={look === "krishna" ? 0 : 0.18} />
        <path d={curve([nose[0], nose[1], nose[2], [nose[3][0] - 0.05, nose[3][1] + 0.03], [nose[0][0] - 0.04, nose[0][1] + 0.1]], true)} fill={st.shade} opacity={0.28 * y} />
      </g>
      {/* nose */}
      <path d={`M${P(nose[0])} L${P(nose[1])} Q${P([nose[1][0] + 0.01, nose[2][1]])} ${P(nose[2])} Q${P([nose[2][0] - 0.03, nose[2][1] + 0.015])} ${P(nose[3])}`} fill="none" stroke={INK} strokeWidth={s * 1.1} opacity={0.9} />
      {eye(eyeN, ewN, true)}{eye(eyeF, ewF, false)}
      {browP(eyeN, ewN, -1)}{browP(eyeF, ewF, 1)}
      {look === "elder" ? <ElderBeard s={s} y={y} L={L} /> : null}
      {mouth()}
      {look === "kartik" ? <path d={`M${P([eyeN[0] - 0.06, eyeN[1] + 0.07])} Q${P([eyeN[0], eyeN[1] + 0.09])} ${P([eyeN[0] + 0.06, eyeN[1] + 0.07])}`} fill="none" stroke={st.shade} strokeWidth={s} /> : null}
      {face.tear ? <path d={`M${f(eyeN[0] - 0.02)},${f(eyeN[1] + 0.06 + face.tear * 0.35)} q-0.022,-0.04 0,-0.075 q0.022,0.035 0,0.075z`} fill="#cfefff" stroke={INK} strokeWidth={s * 0.8} opacity={Math.min(1, face.tear * 4)} /> : null}
      {face.tear ? <path d={`M${f(eyeN[0] - 0.02)},${f(eyeN[1] + 0.05)} L${f(eyeN[0] - 0.02)},${f(eyeN[1] + 0.05 + face.tear * 0.3)}`} stroke="#cfefff" strokeWidth={s * 1.2} opacity={0.6} /> : null}
      {look === "kartik" ? <KartikHair s={s} y={y} /> : null}
      {look === "elder" ? <Pagdi s={s} y={y} /> : null}
      {look === "krishna" ? <KrishnaCrown s={s} y={y} L={L} /> : null}
    </g>
  );
};

const KartikHair: React.FC<{ s: number; y: number }> = ({ s, y }) => {
  const F: XY[] = [[-0.39, -0.08], [-0.42, -0.36], [-0.27, -0.56], [0, -0.64], [0.27, -0.56], [0.42, -0.36], [0.39, -0.1], [0.35, -0.27], [0.28, -0.33], [0.2, -0.27], [0.1, -0.35], [0.0, -0.29], [-0.1, -0.36], [-0.2, -0.28], [-0.28, -0.34], [-0.35, -0.26]];
  const Q: XY[] = [[-0.16, -0.02], [-0.46, -0.2], [-0.42, -0.5], [-0.1, -0.66], [0.22, -0.6], [0.39, -0.4], [0.37, -0.28], [0.32, -0.33], [0.26, -0.27], [0.19, -0.36], [0.11, -0.28], [0.03, -0.36], [-0.04, -0.27], [-0.09, -0.33], [-0.12, -0.2], [-0.13, -0.08]];
  const pts = lerpPts(F, Q, y);
  const d = curve(pts.slice(0, 7)) + pts.slice(7).map((p) => ` L${P(p)}`).join("") + "Z";
  return <g><path d={d} fill="#17110e" stroke={INK} strokeWidth={s * 2} strokeLinejoin="round" />
    <path d={curve([lerp([-0.2, -0.55], [-0.3, -0.5], y), lerp([0, -0.6], [0, -0.6], y), lerp([0.2, -0.52], [0.25, -0.5], y)])} fill="none" stroke="#3b302c" strokeWidth={s * 1.4} />
    <path d={curve([lerp([-0.3, -0.4], [-0.38, -0.3], y), lerp([-0.2, -0.47], [-0.2, -0.46], y), lerp([-0.05, -0.47], [0.05, -0.48], y)])} fill="none" stroke="#3b302c" strokeWidth={s * 1.2} /></g>;
};
const Pagdi: React.FC<{ s: number; y: number }> = ({ s, y }) => {
  const F: XY[] = [[-0.42, -0.2], [-0.47, -0.48], [-0.3, -0.72], [0, -0.78], [0.3, -0.72], [0.47, -0.48], [0.42, -0.2], [0, -0.3]];
  const Q: XY[] = [[-0.46, -0.08], [-0.52, -0.42], [-0.3, -0.72], [0.05, -0.8], [0.32, -0.66], [0.43, -0.42], [0.39, -0.24], [0.0, -0.28]];
  const p = lerpPts(F, Q, y);
  return <g><path d={curve(p.slice(0, 7)) + ` Q${P(p[7])} ${P(p[0])}Z`} fill="#ebe2cc" stroke={INK} strokeWidth={s * 2} strokeLinejoin="round" />
    {[0.15, 0.32, 0.5].map((k, i) => <path key={i} d={curve([lerp(p[0], p[1], k + 0.2), lerp(p[2], p[3], k), lerp(p[4], p[5], k + 0.1)])} fill="none" stroke="#bdb196" strokeWidth={s * 1.3} />)}
    <path d={curve([lerp(p[3], p[4], 0.3), lerp(p[4], p[5], 0.4), lerp(p[5], p[6], 0.8)])} fill="none" stroke="#a99c80" strokeWidth={s * 3} opacity={0.6} /></g>;
};
const ElderBeard: React.FC<{ s: number; y: number; L: (a: XY, b: XY) => XY }> = ({ s, L }) => {
  const pts: XY[] = [L([-0.36, 0.02], [-0.14, 0.04]), L([-0.33, 0.26], [-0.2, 0.26]), L([-0.2, 0.52], [-0.08, 0.5]), L([0, 0.66], [0.1, 0.66]), L([0.2, 0.52], [0.27, 0.5]), L([0.33, 0.26], [0.36, 0.26]), L([0.36, 0.02], [0.37, 0.08]), L([0.18, 0.22], [0.31, 0.2]), L([0, 0.2], [0.2, 0.21]), L([-0.18, 0.22], [0.05, 0.22])];
  const m: XY[] = [L([-0.15, 0.22], [0.08, 0.22]), L([0, 0.16], [0.24, 0.165]), L([0.15, 0.22], [0.36, 0.2]), L([0, 0.205], [0.22, 0.205])];
  return <g>
    <path d={curve(pts, true)} fill="#e9e3d6" stroke={INK} strokeWidth={s * 2} strokeLinejoin="round" />
    {[0.25, 0.45, 0.65].map((k, i) => <path key={i} d={curve([lerp(pts[1], pts[5], k), lerp(pts[2], pts[4], k), pts[3]])} fill="none" stroke="#b9b1a1" strokeWidth={s * 1.1} />)}
    <path d={curve(m, true)} fill="#ddd6c7" stroke={INK} strokeWidth={s * 1.4} />
  </g>;
};
const KrishnaHairBack: React.FC<{ s: number; y: number }> = ({ s, y }) => {
  const pts: XY[] = [lerp([-0.4, -0.3], [-0.44, -0.3], y), lerp([-0.52, 0.2], [-0.58, 0.2], y), lerp([-0.62, 0.8], [-0.72, 0.85], y), lerp([-0.5, 1.25], [-0.62, 1.3], y), lerp([0, 1.0], [-0.25, 1.1], y), lerp([0.5, 1.25], [0.15, 1.15], y), lerp([0.62, 0.8], [0.3, 0.7], y), lerp([0.52, 0.2], [0.3, 0.3], y), lerp([0.4, -0.3], [0.35, -0.3], y)];
  return <g><path d={curve(pts, true)} fill="#0f0f18" stroke={INK} strokeWidth={s * 2} strokeLinejoin="round" />
    {[0.3, 0.55, 0.8].map((k, i) => <path key={i} d={curve([lerp(pts[1], pts[7], k), lerp(pts[2], pts[6], k), lerp(pts[3], pts[5], k)])} fill="none" stroke="#2a2a3a" strokeWidth={s * 1.2} />)}</g>;
};
const KrishnaCrown: React.FC<{ s: number; y: number; L: (a: XY, b: XY) => XY }> = ({ s, y, L }) => {
  const band: XY[] = [L([-0.4, -0.27], [-0.42, -0.26]), L([0, -0.34], [0.12, -0.33]), L([0.4, -0.27], [0.36, -0.28]), L([0.4, -0.4], [0.36, -0.41]), L([0, -0.47], [0.1, -0.47]), L([-0.4, -0.4], [-0.43, -0.4])];
  const crown: XY[] = [L([-0.36, -0.42], [-0.38, -0.42]), L([-0.3, -0.72], [-0.26, -0.72]), L([0, -0.98], [0.02, -0.98]), L([0.3, -0.72], [0.26, -0.7]), L([0.36, -0.42], [0.33, -0.43]), L([0, -0.47], [0.05, -0.47])];
  const fx = L([-0.12, -0.9], [-0.18, -0.9]);
  return <g>
    {/* hair fringe under the crown */}
    <path d={curve([L([-0.38, -0.05], [-0.15, -0.05]), L([-0.4, -0.3], [-0.35, -0.3]), L([0, -0.38], [0.1, -0.37]), L([0.4, -0.3], [0.36, -0.29]), L([0.38, -0.05], [0.37, -0.12]), L([0.25, -0.26], [0.26, -0.25]), L([0, -0.28], [0.1, -0.28]), L([-0.25, -0.26], [-0.1, -0.25])], true)} fill="#0f0f18" stroke={INK} strokeWidth={s * 2} />
    <g transform={`translate(${f(fx[0])},${f(fx[1])}) rotate(-16)`}>
      <path d="M0,0 C-0.02,-0.25 -0.01,-0.5 0.02,-0.75" fill="none" stroke="#2c6b3a" strokeWidth={s * 2.2} />
      <path d="M0.02,-0.25 C-0.2,-0.38 -0.18,-0.78 0.02,-0.92 C0.22,-0.78 0.24,-0.38 0.02,-0.25Z" fill="#2f9460" stroke={INK} strokeWidth={s * 1.6} />
      {Array.from({ length: 9 }).map((_, i) => <path key={i} d={`M0.02,${-0.3 - i * 0.065} l${-0.15 + (i % 2) * 0.3},${-0.02}`} stroke="#5cc27f" strokeWidth={s * 0.8} />)}
      <ellipse cx={0.02} cy={-0.6} rx={0.085} ry={0.12} fill="#1f56b8" stroke={INK} strokeWidth={s} />
      <ellipse cx={0.02} cy={-0.6} rx={0.045} ry={0.07} fill="#29b0b8" />
      <ellipse cx={0.02} cy={-0.59} rx={0.018} ry={0.03} fill="#0b2148" />
    </g>
    <path d={curve(crown, true)} fill="#f2c230" stroke={INK} strokeWidth={s * 2} strokeLinejoin="round" />
    <path d={curve([lerp(crown[0], crown[5], 0.5), lerp(crown[1], crown[2], 0.5), crown[2], lerp(crown[2], crown[3], 0.5)])} fill="none" stroke="#c08f10" strokeWidth={s * 1.4} />
    <path d={curve(band, true)} fill="#e6a91a" stroke={INK} strokeWidth={s * 1.8} />
    {[0.2, 0.5, 0.8].map((k, i) => { const p = lerp(band[5], band[3], k); return <circle key={i} cx={p[0]} cy={p[1] + 0.065} r={0.03} fill={i === 1 ? "#c4271f" : "#2f9460"} stroke={INK} strokeWidth={s * 0.8} />; })}
    {(() => { const p = lerp(crown[2], crown[5], 0.45); return <circle cx={p[0]} cy={p[1]} r={0.055} fill="#c4271f" stroke={INK} strokeWidth={s} />; })()}
    {/* tilak: urdhva pundra */}
    {(() => { const c = L([0, -0.2], [0.16, -0.2]); return <g><path d={`M${f(c[0] - 0.035)},${f(c[1] - 0.06)} L${f(c[0] - 0.02)},${f(c[1] + 0.06)} M${f(c[0] + 0.035)},${f(c[1] - 0.06)} L${f(c[0] + 0.02)},${f(c[1] + 0.06)}`} stroke="#f4efe0" strokeWidth={s * 1.6} strokeLinecap="round" /><path d={`M${f(c[0])},${f(c[1] - 0.04)} L${f(c[0])},${f(c[1] + 0.05)}`} stroke="#c4271f" strokeWidth={s * 1.4} strokeLinecap="round" /></g>; })()}
  </g>;
};

// ------------------------------------------------------------------------------------------------ figure
export type Limb3 = [number, number, number];
export type Pose = {
  lean?: number; neck?: number; yaw?: number; drop?: number;
  armN: Limb3; armF: Limb3; legN: Limb3; legF: Limb3;
  handN?: HandPose; handF?: HandPose; toesN?: boolean; toesF?: boolean;
};
type Outfit = "kartik" | "elder" | "krishna";
const PAL = {
  kurta: "#d9d2c0", kurtaS: "#b7ad97", pajama: "#efe9dc", pajamaS: "#cdc4b1",
  ekurta: "#e9e2d0", ekurtaS: "#c7bea8", shawl: "#7a6a5a", shawlS: "#5c4f43", dhotiW: "#f1ead9", dhotiWS: "#cfc5b1",
  pit: "#f2b51c", pitS: "#c98b0c", sash: "#a3122e", sashS: "#7a0c22", gold: "#f3c437", goldS: "#bf8d16", stole: "#d8344a",
};

export type FigureProps = {
  x: number; y: number; H: number; facing?: 1 | -1; who: Outfit; pose: Pose; face: Face; lw?: number;
  lota?: { tilt: number }; flute?: boolean; garland?: boolean; stick?: boolean; sway?: number; stole?: boolean;
};
/** Origin (x,y) = pelvis (hip joint level). */
export const Figure: React.FC<FigureProps> = ({ x, y, H, facing = 1, who, pose, face, lw = 4.2, lota, flute, garland, stick, sway = 0, stole = true }) => {
  const s = lw / H;
  const st = STYLES[who];
  const yaw = pose.yaw ?? 1, lean = pose.lean ?? 0;
  const T = (p: XY) => rot(p, lean, [0, 0]);
  const TF: XY[] = [[-0.24, -2.45], [-0.95, -2.27], [-0.82, -1.85], [-0.6, -0.9], [-0.7, -0.15], [-0.25, 0.32], [0.25, 0.32], [0.7, -0.15], [0.6, -0.9], [0.82, -1.85], [0.95, -2.2], [0.24, -2.45]];
  const TQ: XY[] = [[-0.25, -2.45], [-0.78, -2.26], [-0.7, -1.85], [-0.5, -0.92], [-0.64, -0.15], [-0.22, 0.32], [0.24, 0.32], [0.56, -0.15], [0.48, -0.9], [0.66, -1.5], [0.62, -2.18], [0.2, -2.45]];
  const torsoPts = lerpPts(TF, TQ, yaw).map(T);
  const shN = T(lerp([-0.78, -2.1], [-0.6, -2.08], yaw)), shF = T(lerp([0.78, -2.1], [0.5, -2.12], yaw));
  const neckB = T([lerp([0, 0], [-0.02, 0], yaw)[0], -2.42]);
  const headC = add(neckB, rot([0.0, -0.76], lean * 0.3 + (pose.neck ?? 0)));
  const hipN: XY = lerp([-0.36, 0], [-0.3, 0.02], yaw), hipF: XY = lerp([0.36, 0], [0.26, -0.02], yaw);
  const limb = (o: XY, a: Limb3, l1: number, l2: number) => { const j1 = add(o, mul(dir(a[0]), l1)); const j2 = add(j1, mul(dir(a[1]), l2)); return [o, j1, j2] as XY[]; };
  const aN = limb(shN, pose.armN, 1.42, 1.22), aF = limb(shF, pose.armF, 1.42, 1.22);
  const lN = limb(hipN, pose.legN, 1.95, 1.85), lF = limb(hipF, pose.legF, 1.95, 1.85);

  const skin = st.skin, skS = st.shade;
  const arm = (j: XY[], sleeve: { c: string; s: string; to: number; w: number } | null, bulk = 1): Part[] => {
    const [c1, w1] = seg(j[0], j[1], [[0, 0.21 * bulk], [0.25, 0.215 * bulk], [0.6, 0.18 * bulk], [1, 0.145 * bulk]], 0.03);
    const [c2, w2] = seg(j[1], j[2], [[0, 0.145 * bulk], [0.3, 0.16 * bulk], [0.75, 0.12 * bulk], [1, 0.1 * bulk]], 0.02);
    const out: Part[] = [{ d: tube(c1, w1), fill: skin, shade: skS, shadeD: shadeTube(c1, w1, 1) }, { d: tube(c2, w2), fill: skin, shade: skS, shadeD: shadeTube(c2, w2, 1) }];
    if (sleeve) {
      const end = sleeve.to <= 1 ? lerp(j[0], j[1], sleeve.to) : lerp(j[1], j[2], sleeve.to - 1);
      const mid = sleeve.to <= 1 ? lerp(j[0], j[1], sleeve.to * 0.5) : j[1];
      const cs = sleeve.to <= 1 ? [j[0], mid, end] : [j[0], lerp(j[0], j[1], 0.5), j[1], end];
      const ws = sleeve.to <= 1 ? [0.27, 0.27, 0.25].map((k) => k * sleeve.w) : [0.27, 0.26, 0.24, 0.22].map((k) => k * sleeve.w);
      out.push({ d: tube(cs, ws), fill: sleeve.c, own: true, shade: sleeve.s, shadeD: shadeTube(cs, ws, 1, 0.4) });
    }
    return out;
  };
  const leg = (j: XY[], footA: number, toes: boolean, cloth: { c: string; s: string; w: number; ankle?: boolean } | null, bare = true): Part[] => {
    const [c1, w1] = seg(j[0], j[1], [[0, 0.36], [0.3, 0.34], [0.7, 0.27], [1, 0.21]], 0.04);
    const [c2, w2] = seg(j[1], j[2], [[0, 0.21], [0.25, 0.23], [0.6, 0.17], [1, 0.12]], -0.03);
    const out: Part[] = [];
    if (bare || !cloth) out.push({ d: tube(c1, w1), fill: skin }, { d: tube(c2, w2), fill: skin, shade: skS, shadeD: shadeTube(c2, w2, 1) });
    out.push({ d: footPath(j[2], footA, toes), fill: skin, shade: skS, own: !!cloth });
    if (cloth) {
      const k = cloth.w;
      const cc: XY[] = [j[0], lerp(j[0], j[1], 0.5), j[1], lerp(j[1], j[2], 0.5), lerp(j[1], j[2], cloth.ankle ? 0.97 : 0.88)];
      const ww = [0.42 * k, 0.4 * k, 0.32 * k, 0.3 * k, 0.27 * k];
      out.push({ d: tube(cc, ww), fill: cloth.c, own: true, shade: cloth.s, shadeD: shadeTube(cc, ww, 1, 0.38) });
    }
    return out;
  };
  const handF = handParts(aF[2], pose.armF[2], pose.handF ?? "relax", 1, skin, skS, 1);
  const handN = handParts(aN[2], pose.armN[2], pose.handN ?? "relax", -1, skin, skS, 1);
  const neck: Part = { d: tube([neckB, add(neckB, rot([0, -0.3], lean * 0.5)), add(headC, [0, 0.3])], [0.2, 0.18, 0.17]), fill: skin, shade: skS, shadeD: shadeTube([neckB, add(headC, [0, 0.3])], [0.19, 0.17], 1, 0.5) };

  // ---------------- outfit pieces
  const torso = curve(torsoPts, true);
  let backLayer: Part[] = [], bodyLayer: Part[] = [], frontLeg: Part[] = [], skirt: Part[] = [], frontArm: Part[] = [], extras: React.ReactNode = null, behind: React.ReactNode = null;
  const footA = (l: Limb3) => l[2];
  if (who === "kartik") {
    const sl = { c: PAL.kurta, s: PAL.kurtaS, to: 0.92, w: 0.86 };
    backLayer = [...arm(aF, sl), ...handF, ...leg(lF, footA(pose.legF), !!pose.toesF, { c: PAL.pajama, s: PAL.pajamaS, w: 1 })];
    bodyLayer = [neck, { d: torso, fill: PAL.kurta, shade: PAL.kurtaS, shadeD: curve([torsoPts[0], torsoPts[1], torsoPts[2], torsoPts[3], torsoPts[4], lerp(torsoPts[4], torsoPts[5], 0.5), lerp(torsoPts[3], torsoPts[8], 0.25), lerp(torsoPts[2], torsoPts[9], 0.2)], true).replace(/^/, "") }];
    frontLeg = leg(lN, footA(pose.legN), !!pose.toesN, { c: PAL.pajama, s: PAL.pajamaS, w: 1 });
    // kurta skirt: hip -> just above the knees, drapes down with gravity
    const kN = lerp(lN[0], lN[1], 0.58), kF = lerp(lF[0], lF[1], 0.58);
    const hemN = add(kN, [-0.1, 0.12]), hemF = add(kF, [0.08, 0.12]);
    skirt = [{ d: curve([torsoPts[3], torsoPts[4], hemN, lerp(hemN, hemF, 0.5), hemF, torsoPts[7], torsoPts[8]], true), fill: PAL.kurta, own: true, shade: PAL.kurtaS, shadeD: curve([torsoPts[3], torsoPts[4], hemN, lerp(hemN, hemF, 0.3), lerp(torsoPts[4], torsoPts[7], 0.3)], true) }];
    frontArm = [...arm(aN, sl), ...handN];
    extras = <g fill="none" stroke={INK} strokeWidth={s * 1.1} opacity={0.7} strokeLinecap="round">
      <path d={curve([add(neckB, [0.02, 0.02]), add(neckB, [0.06, 0.5])])} />
      {[0.35, 0.5].map((k, i) => <circle key={i} cx={add(neckB, [0.06, k])[0]} cy={add(neckB, [0.06, k])[1]} r={0.025} fill={INK} />)}
      <path d={curve([lerp(torsoPts[3], torsoPts[8], 0.3), lerp(lerp(torsoPts[4], torsoPts[7], 0.3), lerp(hemN, hemF, 0.35), 0.7)])} opacity={0.5} />
      <path d={curve([lerp(torsoPts[3], torsoPts[8], 0.65), lerp(lerp(torsoPts[4], torsoPts[7], 0.65), lerp(hemN, hemF, 0.7), 0.7)])} opacity={0.5} />
    </g>;
  } else if (who === "elder") {
    backLayer = [...arm(aF, { c: PAL.ekurta, s: PAL.ekurtaS, to: 1.75, w: 1.05 }), ...handF, ...leg(lF, footA(pose.legF), false, { c: PAL.dhotiW, s: PAL.dhotiWS, w: 1.15 })];
    bodyLayer = [neck, { d: torso, fill: PAL.ekurta, shade: PAL.ekurtaS }];
    frontLeg = leg(lN, footA(pose.legN), false, { c: PAL.dhotiW, s: PAL.dhotiWS, w: 1.15 });
    const kN = lerp(lN[0], lN[1], 0.75), kF = lerp(lF[0], lF[1], 0.75);
    skirt = [{ d: curve([torsoPts[3], torsoPts[4], add(kN, [-0.2, 0.3]), add(kF, [0.2, 0.28]), torsoPts[7], torsoPts[8]], true), fill: PAL.ekurta, own: true, shade: PAL.ekurtaS }];
    // shawl: drapes over both shoulders, open at the front, hangs to mid-thigh
    const sh = [add(torsoPts[0], [-0.05, -0.05]), add(torsoPts[1], [-0.15, 0.0]), add(torsoPts[2], [-0.2, 0.2]), add(torsoPts[3], [-0.25, 0.4]), add(torsoPts[4], [-0.2, 0.7]), lerp(torsoPts[4], torsoPts[5], 0.4), lerp(torsoPts[3], torsoPts[8], 0.28), lerp(torsoPts[1], torsoPts[10], 0.32), add(neckB, [-0.02, 0.15])] as XY[];
    const sh2 = [add(neckB, [0.15, 0.1]), lerp(torsoPts[2], torsoPts[9], 0.62), lerp(torsoPts[3], torsoPts[8], 0.72), lerp(torsoPts[5], torsoPts[6], 0.9), add(torsoPts[7], [0.25, 0.6]), add(torsoPts[8], [0.2, 0.2]), add(torsoPts[10], [0.12, 0]), add(torsoPts[11], [0.05, -0.05])] as XY[];
    frontArm = [{ d: curve(sh2, true), fill: PAL.shawl, own: true, shade: PAL.shawlS }, { d: curve(sh, true), fill: PAL.shawl, own: true, shade: PAL.shawlS, shadeD: curve([sh[0], sh[1], sh[2], sh[3], sh[4], lerp(sh[4], sh[5], 0.5), lerp(sh[2], sh[6], 0.4)], true) }, ...arm(aN, { c: PAL.shawl, s: PAL.shawlS, to: 1.5, w: 1.2 }), ...handN];
    if (stick) extras = <path d={`M${P(add(aN[2], [0.05, -1.4]))} L${P(add(aN[2], [0.15, 3.2]))}`} stroke={INK} strokeWidth={s * 2 + 0.12} />;
  } else {
    // Krishna: bare blue torso, pitambar (yellow silk dhoti) with pleats, crimson waist sash, stole, gold ornaments, vaijayanti mala
    backLayer = [...arm(aF, null, 1.05), ...handF, ...leg(lF, footA(pose.legF), false, { c: PAL.pit, s: PAL.pitS, w: 0.98, ankle: true }, true)];
    bodyLayer = [neck, { d: torso, fill: skin, shade: skS, shadeD: curve([torsoPts[0], torsoPts[1], torsoPts[2], torsoPts[3], torsoPts[4], lerp(torsoPts[4], torsoPts[5], 0.6), lerp(torsoPts[3], torsoPts[8], 0.2), lerp(torsoPts[2], torsoPts[9], 0.18)], true) }];
    frontLeg = leg(lN, footA(pose.legN), false, { c: PAL.pit, s: PAL.pitS, w: 0.98, ankle: true }, true);
    const waistN = torsoPts[3], waistF = torsoPts[8];
    const pleatTop = lerp(waistN, waistF, 0.55), pleatBot = add(lerp(lN[2], lF[2], 0.5), [0.05 + sway * 0.02, -0.2]);
    skirt = [
      { d: curve([lerp(waistN, waistF, -0.05), torsoPts[4], lerp(torsoPts[4], lN[1], 0.35), lerp(torsoPts[7], lF[1], 0.35), torsoPts[7], lerp(waistN, waistF, 1.05)], true), fill: PAL.pit, own: true, shade: PAL.pitS },
      { d: curve([add(pleatTop, [-0.1, 0]), add(pleatTop, [0.1, 0]), add(pleatBot, [0.18, 0]), add(pleatBot, [-0.12, 0.02])], true), fill: "#f7c63c", own: true, shade: PAL.pitS },
      { d: curve([add(waistN, [-0.06, -0.12]), add(lerp(waistN, waistF, 0.5), [0, -0.04]), add(waistF, [0.06, -0.12]), add(waistF, [0.06, 0.12]), add(lerp(waistN, waistF, 0.5), [0, 0.2]), add(waistN, [-0.06, 0.12])], true), fill: PAL.sash, own: true, shade: PAL.sashS },
      { d: curve([add(waistN, [0.02, 0.1]), add(waistN, [-0.12 - sway * 0.04, 0.7]), add(waistN, [-0.05 - sway * 0.05, 1.05]), add(waistN, [0.1, 0.65])], true), fill: PAL.sash, own: true, shade: PAL.sashS },
    ];
    frontArm = [...arm(aN, null, 1.05), ...handN];
    const pleats = Array.from({ length: 4 }).map((_, i) => curve([add(pleatTop, [-0.08 + i * 0.055, 0.02]), add(lerp(pleatTop, pleatBot, 0.5), [-0.1 + i * 0.09, 0]), add(pleatBot, [-0.14 + i * 0.12, 0])]));
    const jewel = (p: XY, r: number) => <circle cx={p[0]} cy={p[1]} r={r} fill={PAL.gold} stroke={INK} strokeWidth={s} />;
    const necklace = curve([add(torsoPts[0], [0.05, 0.12]), add(lerp(torsoPts[0], torsoPts[11], 0.5), [0, 0.42]), add(torsoPts[11], [-0.05, 0.12])]);
    const mala: XY[] = [add(torsoPts[0], [0.0, 0.1]), add(lerp(torsoPts[2], torsoPts[3], 0.5), [0.2, 0]), add(lerp(torsoPts[4], lN[1], 0.45), [0.25, 0]), add(lerp(lN[1], lF[1], 0.5), [0.05, -0.25]), add(lerp(torsoPts[7], lF[1], 0.45), [-0.15, 0]), add(lerp(torsoPts[9], torsoPts[8], 0.5), [-0.2, 0]), add(torsoPts[11], [0, 0.1])];
    const malaPath = curve(mala);
    extras = <g>
      {pleats.map((d, i) => <path key={i} d={d} fill="none" stroke={PAL.pitS} strokeWidth={s * 1.4} />)}
      <path d={curve([lerp(torsoPts[5], lN[1], 0.4), lerp(lN[1], lN[2], 0.2)])} fill="none" stroke={PAL.pitS} strokeWidth={s * 1.3} />
      <path d={curve([lerp(torsoPts[6], lF[1], 0.4), lerp(lF[1], lF[2], 0.2)])} fill="none" stroke={PAL.pitS} strokeWidth={s * 1.3} />
      <path d={necklace} fill="none" stroke={INK} strokeWidth={s * 2 + 0.07} /><path d={necklace} fill="none" stroke={PAL.gold} strokeWidth={0.07} />
      {jewel(add(lerp(torsoPts[0], torsoPts[11], 0.5), [0, 0.42]), 0.06)}
      {garland ? <g><path d={malaPath} fill="none" stroke="#2f7d3c" strokeWidth={0.05} />
        {Array.from({ length: 22 }).map((_, i) => { const t = i / 21; const k = Math.floor(t * (mala.length - 1)); const p = lerp(mala[k], mala[Math.min(k + 1, mala.length - 1)], t * (mala.length - 1) - k); return <circle key={i} cx={p[0]} cy={p[1]} r={0.055} fill={["#f6a21a", "#d9344f", "#fdf2d0"][i % 3]} stroke={INK} strokeWidth={s * 0.9} />; })}</g> : null}
      {[aN, aF].map((j, i) => { const p = lerp(j[0], j[1], 0.35); const q = lerp(j[1], j[2], 0.88); return <g key={i}><path d={tube([add(p, [-0.17, 0]), add(p, [0.17, 0])], [0.06, 0.06])} fill={PAL.gold} stroke={INK} strokeWidth={s} /><path d={tube([add(q, [-0.12, 0]), add(q, [0.12, 0])], [0.045, 0.045])} fill={PAL.gold} stroke={INK} strokeWidth={s} /></g>; })}
      {[lN[2], lF[2]].map((p, i) => <path key={i} d={tube([add(p, [-0.15, -0.06]), add(p, [0.15, -0.06])], [0.04, 0.04])} fill={PAL.gold} stroke={INK} strokeWidth={s} />)}
    </g>;
    if (stole) behind = <path d={curve([add(shF, [0.1, 0]), add(aF[1], [0.4, 0.3 + sway * 0.04]), add(aF[1], [0.6, 1.3 + sway * 0.05]), add(aF[1], [0.3, 1.0]), add(shF, [0.1, 0.4])], true)} fill={PAL.stole} stroke={INK} strokeWidth={s * 2} />;
  }

  // props held in the hand
  let prop: React.ReactNode = null;
  if (lota) {
    const w = aF[2], a = pose.armF[2];
    const c = add(w, mul(dir(a), 0.3));
    prop = <g transform={`translate(${f(c[0])},${f(c[1])}) rotate(${lota.tilt})`}>
      <path d="M-0.3,-0.25 L0.3,-0.25 C0.42,-0.05 0.44,0.25 0.28,0.38 C0.12,0.48 -0.12,0.48 -0.28,0.38 C-0.44,0.25 -0.42,-0.05 -0.3,-0.25Z" fill="#c6ccd2" stroke={INK} strokeWidth={s * 2} />
      <path d="M-0.34,-0.25 L0.34,-0.25 L0.3,-0.36 L-0.3,-0.36Z" fill="#9ea7b0" stroke={INK} strokeWidth={s * 2} />
      <path d="M0.12,-0.2 C0.3,0.0 0.3,0.3 0.15,0.42" fill="none" stroke="#8a949d" strokeWidth={0.06} opacity={0.6} />
      <path d="M-0.2,-0.15 C-0.3,0.05 -0.28,0.2 -0.2,0.3" fill="none" stroke="#fff" strokeWidth={0.04} opacity={0.6} />
    </g>;
  }
  if (flute) {
    const w = aF[2];
    prop = <g><path d={`M${P(add(w, [-0.9, -0.35]))} L${P(add(w, [0.85, 0.3]))}`} stroke={INK} strokeWidth={0.13} strokeLinecap="round" />
      <path d={`M${P(add(w, [-0.9, -0.35]))} L${P(add(w, [0.85, 0.3]))}`} stroke="#d9a453" strokeWidth={0.08} strokeLinecap="round" />
      {[0.2, 0.32, 0.44, 0.56].map((k, i) => { const p = lerp(add(w, [-0.9, -0.35]), add(w, [0.85, 0.3]), k); return <circle key={i} cx={p[0]} cy={p[1]} r={0.017} fill={INK} />; })}
      <path d={`M${P(lerp(add(w, [-0.9, -0.35]), add(w, [0.85, 0.3]), 0.08))} l0.01,0.25`} stroke="#c4271f" strokeWidth={0.03} /></g>;
  }

  return (
    <g transform={`translate(${x},${y}) scale(${facing * H},${H})`}>
      {behind}
      {who === "krishna" ? null : null}
      <Layer parts={backLayer} lw={s} />
      {lota ? prop : null}
      <Layer parts={who === "kartik" ? [...bodyLayer] : bodyLayer} lw={s} />
      <Layer parts={frontLeg} lw={s} />
      <Layer parts={skirt} lw={s} />
      {extras}
      <Head look={who} face={{ yaw, ...face }} lw={s} c={headC} scale={who === "krishna" ? 1.17 : 1.1} />
      <Layer parts={frontArm} lw={s} />
      {flute ? prop : null}
    </g>
  );
};

/** Big stand-alone hand for inserts (dig, cup). */
export const BigHand: React.FC<{ x: number; y: number; H: number; a: number; pose: HandPose; thumb?: 1 | -1; skin?: string; shade?: string; forearm?: number; lw?: number; sleeve?: string }> = ({ x, y, H, a, pose, thumb = 1, skin = STYLES.kartik.skin, shade = STYLES.kartik.shade, forearm = 1.4, lw = 6, sleeve }) => {
  const s = lw / H; const back = add([0, 0], mul(dir(a), -forearm));
  const [c, w] = seg(back, [0, 0], [[0, 0.17], [0.5, 0.15], [1, 0.11]], 0.02);
  const parts: Part[] = [{ d: tube(c, w), fill: skin, shade, shadeD: shadeTube(c, w, 1) }, ...handParts([0, 0], a, pose, thumb, skin, shade)];
  return <g transform={`translate(${x},${y}) scale(${H})`}>
    <Layer parts={parts} lw={s} />
    {sleeve ? <path d={tube([back, lerp(back, [0, 0], 0.35)], [0.24, 0.23])} fill={sleeve} stroke={INK} strokeWidth={s * 2} /> : null}
  </g>;
};

/** World-space joints of a Figure (same FK as Figure): wrists, hand tips, head centre. */
export const jointsOf = (p: Pick<FigureProps, "x" | "y" | "H" | "facing" | "pose">) => {
  const { x, y, H, pose } = p; const fc = p.facing ?? 1; const yaw = pose.yaw ?? 1, lean = pose.lean ?? 0;
  const T = (q: XY) => rot(q, lean, [0, 0]);
  const shN = T(lerp([-0.78, -2.1], [-0.6, -2.08], yaw)), shF = T(lerp([0.78, -2.1], [0.5, -2.12], yaw));
  const neckB = T([lerp([0, 0], [-0.02, 0], yaw)[0], -2.42]);
  const headC = add(neckB, rot([0.0, -0.76], lean * 0.3 + (pose.neck ?? 0)));
  const limb = (o: XY, a: Limb3) => { const j1 = add(o, mul(dir(a[0]), 1.42)); const j2 = add(j1, mul(dir(a[1]), 1.22)); return [j1, j2, add(j2, mul(dir(a[2]), 0.3))]; };
  const W = (q: XY): XY => [x + fc * H * q[0], y + H * q[1]];
  const aF = limb(shF, pose.armF), aN = limb(shN, pose.armN);
  return { wristF: W(aF[1]), wristN: W(aN[1]), handF: W(aF[2]), handN: W(aN[2]), head: W(headC), elbowN: W(aN[0]) };
};

/** 2-bone IK: absolute [upper, fore] angles so the wrist of arm `arm` reaches world point `target`. bend: +1 / -1 picks the elbow side. */
export const reach = (p: Pick<FigureProps, "x" | "y" | "H" | "facing" | "pose">, arm: "F" | "N", target: XY, bend = 1): [number, number] => {
  const fc = p.facing ?? 1; const yaw = p.pose.yaw ?? 1, lean = p.pose.lean ?? 0;
  const sh = rot(arm === "F" ? lerp([0.78, -2.1], [0.5, -2.12], yaw) : lerp([-0.78, -2.1], [-0.6, -2.08], yaw), lean, [0, 0]);
  const t: XY = [(target[0] - p.x) / (fc * p.H), (target[1] - p.y) / p.H];
  const d = sub(t, sh), l1 = 1.42, l2 = 1.22; const dist = Math.min(len(d), l1 + l2 - 1e-3);
  const th = Math.atan2(d[0], d[1]) / R;
  const al = Math.acos(Math.max(-1, Math.min(1, (l1 * l1 + dist * dist - l2 * l2) / (2 * l1 * dist)))) / R;
  const up = th + al * bend; const e = add(sh, mul(dir(up), l1)); const fd = sub(t, e);
  return [up, Math.atan2(fd[0], fd[1]) / R];
};
