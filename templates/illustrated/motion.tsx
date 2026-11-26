// Shared motion library for every Remotion template in this repo (canonical copy: templates/_shared/motion.tsx;
// each template keeps a copy in its src/ so a project folder stays self-contained - re-copy after editing).
//
// Where the numbers come from (2026-11-25 upgrade, see templates/_shared/MOTION.md):
//  - motionmaxxing (github.com/Tejashmakwana/motionmaxxing, Apache-2.0): ~4,300 moves measured frame by frame in 53
//    professional motion pieces -> the 12 eases below (fitted to its "% done at 10/25/50/75 % of the time" tables),
//    median move 10 f, entries 12 f, opacity 6 f, exits accelerate, overshoot rare and late, arrival from oversize.
//  - LottieFiles motion-design-skill (MIT): enter = decelerate, exit = accelerate, enter 30-50 % longer than exit,
//    stagger budget < 0.5 s, never linear for spatial moves, three motion layers (primary / secondary / ambient).
//  - cinetic (github.com/Leonxlnx/cinetic, MIT): everything a pure function of the frame, seeded randomness, zooms in
//    log space, no overshoot on type, one spring class per film, blur as a declared policy, grain/finish at one level.
//  - remotion-dev/skills: shutter motion blur (@remotion/motion-blur CameraMotionBlur, shutter 180, 6-8 samples).
// Everything here is deterministic (no Math.random / Date.now): renders are reproducible frame by frame.
import React from "react";
import { AbsoluteFill, random, useCurrentFrame } from "remotion";
import { CameraMotionBlur } from "@remotion/motion-blur";

export const FPS = 30;
export const f2s = (frames: number) => frames / FPS;
export const cl01 = (x: number) => Math.max(0, Math.min(1, x));
export const lerp = (a: number, b: number, k: number) => a + (b - a) * k;
/** zoom / scale in log space so a 1 -> 4x move feels even (cinetic, motionmaxxing R6.13) */
export const logLerp = (a: number, b: number, k: number) => a * Math.pow(b / a, k);

export type Ease = (x: number) => number;
const expoOut = (k: number): Ease => (x) => (1 - Math.exp(-k * cl01(x))) / (1 - Math.exp(-k));
/** smooth curve through measured samples (cubic Hermite, finite-difference tangents) - for the overshooting eases */
const table = (pts: [number, number][]): Ease => (x) => {
  const t = cl01(x); let i = 0; while (i < pts.length - 2 && t > pts[i + 1][0]) i++;
  const [x0, y0] = pts[i], [x1, y1] = pts[i + 1];
  const m = (j: number) => (j <= 0 ? (pts[1][1] - pts[0][1]) / (pts[1][0] - pts[0][0]) : j >= pts.length - 1 ? (pts[j][1] - pts[j - 1][1]) / (pts[j][0] - pts[j - 1][0]) : (pts[j + 1][1] - pts[j - 1][1]) / (pts[j + 1][0] - pts[j - 1][0]));
  const h = x1 - x0, s = (t - x0) / h, s2 = s * s, s3 = s2 * s;
  return (2 * s3 - 3 * s2 + 1) * y0 + (s3 - 2 * s2 + s) * h * m(i) + (-2 * s3 + 3 * s2) * y1 + (s3 - s2) * h * m(i + 1);
};

/** The 12 measured eases (motionmaxxing references/motion.md section 2). Frames are medians @30 fps. */
export const E = {
  /** linear: fades (4-7 f), drift, camera creep, counters, ambient. Never for a spatial entry. 9 f */
  cruise: ((x) => cl01(x)) as Ease,
  /** all-purpose medium land (sine.out-ish). 10 f */
  glide: ((x) => 1 - Math.pow(1 - cl01(x), 1.7)) as Ease,
  /** S-curve: opacity/blur/colour ramps, counters off a handle. 9 f */
  softInOut: ((x) => { const t = cl01(x); return t < 0.5 ? 0.5 * Math.pow(2 * t, 1.56) : 1 - 0.5 * Math.pow(2 - 2 * t, 1.56); }) as Ease,
  /** the entry workhorse: text rises, panels slide, scale-ins (30/59/85/95). 12 f */
  softLand: expoOut(3.4),
  /** accelerate from rest: exits, blur-outs, fade-out starts, slow push into a cut. 9 f */
  gentleIn: ((x) => Math.pow(cl01(x), 2.07)) as Ease,
  /** fast snap + soft tail (54 % done at 10 % of the time): hero entries, CTA, oversize arrivals. 11 f */
  snapSettle: expoOut(7.5),
  /** big fast moves; whip entries land with it. 8-13 f */
  whip: ((x) => 1 - Math.pow(1 - cl01(x), 2.5)) as Ease,
  /** the leaving curve: scale exits, pans off-frame, peak speed at t ~0.9. 13 f */
  accelExit: ((x) => Math.pow(cl01(x), 2.6)) as Ease,
  /** exit that ends in a hard cut at full speed. 17 f */
  crashOut: ((x) => Math.pow(cl01(x), 4)) as Ease,
  /** the late lean past the mark: peak 1.08 at t 0.72. Use at most once per beat. 15 f */
  popOver: table([[0, 0], [0.1, 0.1], [0.25, 0.46], [0.5, 0.96], [0.72, 1.08], [0.86, 1.035], [1, 1]]),
  /** slam: touches the mark at once, passes it (1.18 at t 0.27), relaxes back. 10 f */
  crashIn: table([[0, 0], [0.1, 0.91], [0.27, 1.18], [0.5, 1.1], [0.75, 1.03], [0.9, 1.005], [1, 1]]),
  /** the big overshoot (1.48 at t 0.62): ONE physical reward per film at most. 22 f */
  bounceHard: table([[0, 0], [0.1, 0.13], [0.25, 0.62], [0.5, 1.38], [0.62, 1.48], [0.75, 1.39], [0.9, 1.08], [1, 1]]),
};
/** measured default durations in seconds (frames @30: entry 12, opacity 6, blur 7, exit 13, scale-exit 10, word 12-15) */
export const DUR = { entry: f2s(12), opacity: f2s(6), blur: f2s(7), exit: f2s(13), scaleExit: f2s(10), word: f2s(7), cta: f2s(6), snap: f2s(11), whip: f2s(8) };

/** progress of a move that starts at t0 and lasts dur seconds */
export const prog = (t: number, t0: number, dur: number, ease: Ease = E.softLand) => ease(cl01((t - t0) / Math.max(1e-6, dur)));

export type Look = { on: boolean; k: number; scale: number; blur: number; opacity: number; dx: number; dy: number };
/** ARRIVAL (motionmaxxing R1.6, R3.6): two or more decaying channels, never opacity alone; identity objects come DOWN
 *  from oversize (1.3-1.5x, logos up to 3.5x), never grow from zero; opacity is only a 4-6 f helper. */
export const arrive = (t: number, t0: number, o: { dur?: number; from?: number; blur?: number; dx?: number; dy?: number; ease?: Ease; fade?: number; floor?: number } = {}): Look => {
  const on = t >= t0, k = prog(t, t0, o.dur ?? DUR.entry, o.ease ?? E.snapSettle), kf = prog(t, t0, o.fade ?? DUR.opacity, E.cruise);
  return { on, k, scale: logLerp(o.from ?? 1.3, 1, k), blur: (o.blur ?? 8) * (1 - k), opacity: on ? lerp(o.floor ?? 0.25, 1, kf) : 0, dx: (o.dx ?? 0) * (1 - k), dy: (o.dy ?? 0) * (1 - k) };
};
/** EXIT (R1.5, R3.4): accelerate and leave at peak speed; exits ~3-4 f shorter than entries */
export const leave = (t: number, t1: number, o: { dur?: number; to?: number; blur?: number; dx?: number; dy?: number; ease?: Ease } = {}): Look => {
  const dur = o.dur ?? DUR.exit, k = prog(t, t1 - dur, dur, o.ease ?? E.accelExit);
  return { on: t < t1, k, scale: logLerp(1, o.to ?? 1, k), blur: (o.blur ?? 0) * k, opacity: 1, dx: (o.dx ?? 0) * k, dy: (o.dy ?? 0) * k };
};
/** a Look as CSS (transform order: translate, then scale about the element's transform-origin) */
export const lookCss = (l: Look, extra = ""): React.CSSProperties => ({
  opacity: l.opacity, transform: `translate(${l.dx.toFixed(2)}px, ${l.dy.toFixed(2)}px) scale(${l.scale.toFixed(4)}) ${extra}`.trim(),
  filter: l.blur > 0.25 ? `blur(${l.blur.toFixed(2)}px)` : undefined,
});
/** directional smear length for a move of `pxPerFrame` (R4.2: ~0.5-1x of the frame displacement, capped) */
export const smear = (pxPerFrame: number, cap = 30) => Math.min(cap, Math.abs(pxPerFrame) * 0.6);

/** seeded 0..1 random (deterministic per seed) */
export const rnd = (seed: string | number) => random(String(seed));
/** onsets for siblings: uneven 1-3 f gaps (R1.8), total kept under ~0.5 s; words use 2-5 f, voice-led 8-12 f */
export const staggerAt = (i: number, seed: string, minF = 1, maxF = 3) => { let s = 0; for (let j = 0; j < i; j++) s += minF + Math.round(rnd(`${seed}:${j}`) * (maxF - minF)); return f2s(s); };
/** NO DEAD FRAME (R1.12, R6.14): linear creep for holds, never a bob. ~1-2 px/f drift + 0.5-1 % scale creep per second.
 *  Direction is seeded per element/section so neighbouring shots don't all slide the same way. */
export const drift = (t: number, seed: string, o: { pxPerSec?: number; scalePerSec?: number; maxScale?: number } = {}) => {
  const a = rnd(seed) * Math.PI * 2, v = o.pxPerSec ?? 30;
  return { x: Math.cos(a) * v * t, y: Math.sin(a) * v * t * 0.6, s: Math.min(o.maxScale ?? 1.08, 1 + (o.scalePerSec ?? 0.012) * t) };
};
/** camera reveal snap (R6.3): one-frame jump to `ratio` of the start scale, then a 0.3-0.6 s decelerating tail */
export const snapTail = (t: number, t0: number, from = 1.45, ratio = 0.62, tail = 0.45) => {
  if (t < t0) return from; const afterSnap = from * ratio; return logLerp(afterSnap, 1, prog(t, t0 + f2s(1), tail, E.softLand));
};

// ------------------------------------------------------------------ finish layers (one level for the whole film)
/** Film grain: deterministic per frame (seeded feTurbulence), overlay-blended. amount 0.02-0.05 (motionmaxxing --grain 0.03). */
export const Grain: React.FC<{ amount?: number; blend?: React.CSSProperties["mixBlendMode"] }> = ({ amount = 0.035, blend = "overlay" }) => {
  const f = useCurrentFrame(); if (amount <= 0) return null;
  return <AbsoluteFill style={{ pointerEvents: "none", mixBlendMode: blend, opacity: Math.min(1, amount * 9) }}>
    <svg width="100%" height="100%"><filter id={`grain${f}`}><feTurbulence type="fractalNoise" baseFrequency="0.85" numOctaves={2} seed={(f * 7919) % 9973} stitchTiles="stitch" /><feColorMatrix type="saturate" values="0" /></filter>
      <rect width="100%" height="100%" filter={`url(#grain${f})`} /></svg>
  </AbsoluteFill>;
};
/** Vignette: light falls off toward the frame edge (a ground is a surface, not a swatch). strength 0.1-0.3 */
export const Vignette: React.FC<{ strength?: number; color?: string }> = ({ strength = 0.16, color = "20,27,77" }) => strength > 0
  ? <AbsoluteFill style={{ pointerEvents: "none", background: `radial-gradient(ellipse 85% 70% at 50% 45%, rgba(${color},0) 55%, rgba(${color},${strength}) 100%)` }} /> : null;
/** Light leak (remotion-dev/skills light-leaks, re-implemented for Remotion 4.0.250 without WebGL): warm light blooms in
 *  over the cut and retracts. progress 0..1 (peak at 0.5); seed changes the shape; hue in degrees (0 = amber/orange). */
export const LightLeak: React.FC<{ progress: number; seed?: number; hue?: number; strength?: number }> = ({ progress, seed = 0, hue = 0, strength = 0.85 }) => {
  if (progress <= 0 || progress >= 1) return null;
  const k = Math.sin(Math.PI * cl01(progress)), r = (n: number) => rnd(`leak${seed}:${n}`);
  const blobs = [0, 1, 2].map((i) => ({ x: lerp(-10, 110, r(i)) + (progress - 0.5) * lerp(-40, 40, r(i + 9)), y: lerp(5, 95, r(i + 3)), w: lerp(45, 90, r(i + 6)), a: [0.9, 0.6, 0.45][i] }));
  const cols = [`hsla(${28 + hue},100%,62%,`, `hsla(${8 + hue},100%,55%,`, `hsla(${48 + hue},100%,70%,`];
  return <AbsoluteFill style={{ pointerEvents: "none", mixBlendMode: "screen", opacity: strength * k,
    background: blobs.map((b, i) => `radial-gradient(ellipse ${b.w}% ${b.w * 0.8}% at ${b.x}% ${b.y}%, ${cols[i]}${b.a}), ${cols[i]}0) 70%)`).join(", ") }} />;
};
/** Shutter motion blur (R4.8 / remotion-dev motion-blur.md): averages sub-frames across a 180-degree shutter so every
 *  moving thing blurs by its own speed. Costly (x samples), so switch it on only where things move fast (transitions,
 *  whips, dives). Never wrap <Audio> in it, and do not add per-element smear inside an active window (double blur). */
export const ShutterBlur: React.FC<{ active: boolean; samples?: number; shutterAngle?: number; children: React.ReactNode }> = ({ active, samples = 6, shutterAngle = 180, children }) =>
  active ? <CameraMotionBlur samples={samples} shutterAngle={shutterAngle}>{children}</CameraMotionBlur> : <>{children}</>;
