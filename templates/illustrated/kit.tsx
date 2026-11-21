// Illustrated parallax short: reusable pieces. Remotion 4 + React. No 3D, no extra deps.
// Every function is driven by the *local* frame of the surrounding <Sequence>.
import React from "react";
import { AbsoluteFill, Img, interpolate, random, staticFile, useCurrentFrame } from "remotion";

export const W = 1080;
export const H = 1920;
export const FPS = 30;

/** Stepped time: a new "drawing" every `hold` frames (3 = 10 fps, the reference look). */
export const useStep = (hold = 3) => {
  const f = useCurrentFrame();
  return Math.floor(f / hold) * hold;
};

/** Push-in camera on a flat painting. pct = zoom gain per second (3.2 for opening holds, 1-1.6 hero).
 *  ox/oy = transform origin in % (put it on the subject, not the centre). step = camera moves in steps like the reference. */
export const Cam: React.FC<{
  pct?: number; ox?: number; oy?: number; drift?: [number, number]; roll?: number; step?: number;
  blur?: number; children: React.ReactNode;
}> = ({ pct = 2.4, ox = 50, oy = 60, drift = [-0.6, -1.0], roll = 0, step = 2, blur = 0, children }) => {
  const f = useStep(step);
  const t = f / FPS;
  const s = 1 + (pct / 100) * t;
  return (
    <AbsoluteFill style={{ overflow: "hidden" }}>
      <AbsoluteFill
        style={{
          transformOrigin: `${ox}% ${oy}%`,
          transform: `translate(${drift[0] * t}%, ${drift[1] * t}%) rotate(${roll * t}deg) scale(${s})`,
          filter: blur ? `blur(${blur}px)` : undefined,
        }}
      >
        {children}
      </AbsoluteFill>
    </AbsoluteFill>
  );
};

/** A painted layer (PNG with alpha, in public/). x,y,w in px on the 1080x1920 canvas. rot about its own pivot (deg). */
export const Layer: React.FC<{
  src: string; x?: number; y?: number; w?: number; rot?: number; pivot?: [number, number];
  scale?: number; opacity?: number; flip?: boolean; style?: React.CSSProperties;
}> = ({ src, x = 0, y = 0, w = W, rot = 0, pivot = [50, 50], scale = 1, opacity = 1, flip = false, style }) => (
  <Img
    src={src.startsWith("http") ? src : staticFile(src)}
    style={{
      position: "absolute", left: x, top: y, width: w, opacity,
      transformOrigin: `${pivot[0]}% ${pivot[1]}%`,
      transform: `rotate(${rot}deg) scale(${flip ? -scale : scale}, ${scale})`,
      ...style,
    }}
  />
);

/** Float / breathe: sin bob, amplitude in px, period in s. Hero sprites use amp~28, period 3. */
export const bob = (frame: number, amp = 28, period = 3) => Math.sin((frame / FPS / period) * Math.PI * 2) * amp;

/** Reveal of N duplicated limbs, staggered (multi-arm god). Returns 0..1 per index. */
export const stagger = (frame: number, i: number, start = 0, gap = 10, dur = 14) =>
  interpolate(frame, [start + i * gap, start + i * gap + dur], [0, 1], { extrapolateLeft: "clamp", extrapolateRight: "clamp" });

/** 4-point white impact starburst, 2-3 frames. Place at the contact point. */
export const Starburst: React.FC<{ x: number; y: number; at: number; size?: number; len?: number }> = ({ x, y, at, size = 220, len = 3 }) => {
  const f = useCurrentFrame() - at;
  if (f < 0 || f >= len) return null;
  const k = 1 - f / len;
  const s = size * (0.6 + 0.6 * (1 - k));
  const d = `M0,-${s} L${s * 0.12},-${s * 0.12} L${s},0 L${s * 0.12},${s * 0.12} L0,${s} L-${s * 0.12},${s * 0.12} L-${s},0 L-${s * 0.12},-${s * 0.12} Z`;
  return (
    <svg width={W} height={H} style={{ position: "absolute", left: 0, top: 0, pointerEvents: "none" }}>
      <g transform={`translate(${x},${y}) rotate(${f * 12})`} opacity={k}>
        <path d={d} fill="#fff" stroke="#fff" strokeWidth={2} />
      </g>
    </svg>
  );
};

/** Ghost smear: render the moving limb 2-3 times with lagging offsets and fading opacity. children is a render fn. */
export const Smear: React.FC<{ n?: number; lag?: number; render: (lagFrames: number, opacity: number) => React.ReactNode }> = ({ n = 3, lag = 2, render }) => (
  <>{Array.from({ length: n }).map((_, i) => <React.Fragment key={i}>{render((n - i) * lag, 0.18 + 0.12 * i)}</React.Fragment>)}</>
);

/** Debris (rice grains, sparks): ballistic arcs, seeded so renders are deterministic. */
export const Debris: React.FC<{ x: number; y: number; at: number; count?: number; color?: string; g?: number }> = ({ x, y, at, count = 10, color = "#f5f5ee", g = 2.2 }) => {
  const f = useCurrentFrame() - at;
  if (f < 0 || f > 40) return null;
  return (
    <svg width={W} height={H} style={{ position: "absolute", left: 0, top: 0, pointerEvents: "none" }}>
      {Array.from({ length: count }).map((_, i) => {
        const vx = (random(`vx${i}`) - 0.5) * 36, vy = -10 - random(`vy${i}`) * 26;
        const px = x + vx * f, py = y + vy * f + 0.5 * g * f * f;
        return <ellipse key={i} cx={px} cy={Math.min(py, y + 60)} rx={9} ry={5} fill={color} stroke="#2b2b2b" strokeWidth={2} transform={`rotate(${i * 40 + f * 18} ${px} ${py})`} />;
      })}
    </svg>
  );
};

/** Black bars (cinema slit) for the eye reveal. open 0..1 (1 = full screen). */
export const Letterbox: React.FC<{ open?: number; slit?: number }> = ({ open = 0, slit = 0.28 }) => {
  const bar = ((1 - slit) / 2) * (1 - open) * 100;
  return (
    <>
      <div style={{ position: "absolute", left: 0, right: 0, top: 0, height: `${bar}%`, background: "#000" }} />
      <div style={{ position: "absolute", left: 0, right: 0, bottom: 0, height: `${bar}%`, background: "#000" }} />
    </>
  );
};

/** Dip to black: opacity ramps in the first / last frames of a shot. */
export const Dip: React.FC<{ dur: number; inF?: number; outF?: number }> = ({ dur, inF = 0, outF = 0 }) => {
  const f = useCurrentFrame();
  const a = Math.max(inF ? 1 - f / inF : 0, outF ? 1 - (dur - f) / outF : 0);
  return <AbsoluteFill style={{ background: "#000", opacity: Math.min(1, Math.max(0, a)) }} />;
};

/** White flash on a punch word / hit. */
export const Flash: React.FC<{ at: number; len?: number; color?: string }> = ({ at, len = 4, color = "#fff" }) => {
  const f = useCurrentFrame() - at;
  if (f < 0 || f >= len) return null;
  return <AbsoluteFill style={{ background: color, opacity: 1 - f / len }} />;
};

/** Flip shake that decays (sign flips every frame). Wrap a shot, or just call shakeOffset. */
export const shakeOffset = (frame: number, at: number, amp = 18, decay = 7) => {
  const f = frame - at;
  if (f < 0 || f > decay) return [0, 0] as const;
  const k = (1 - f / decay) * amp * (f % 2 ? -1 : 1);
  return [k, k * 0.6] as const;
};

/** Continuous jitter for horror/boil lines: new random offset every `hold` frames. */
export const jitter = (frame: number, hold = 3, amp = 6, seed = "j") => {
  const s = Math.floor(frame / hold);
  return [(random(seed + "x" + s) - 0.5) * 2 * amp, (random(seed + "y" + s) - 0.5) * 2 * amp] as const;
};

/** Soft vignette + optional colour wash for mood (warm street / teal divine). */
export const Mood: React.FC<{ vignette?: number; wash?: string; washOpacity?: number }> = ({ vignette = 0.25, wash, washOpacity = 0.12 }) => (
  <>
    {wash ? <AbsoluteFill style={{ background: wash, opacity: washOpacity, mixBlendMode: "multiply" }} /> : null}
    <AbsoluteFill style={{ background: `radial-gradient(ellipse at 50% 55%, rgba(0,0,0,0) 55%, rgba(0,0,0,${vignette}) 100%)` }} />
  </>
);

/** Soft radial god-glow behind a hero. */
export const Glow: React.FC<{ x: number; y: number; r: number; color?: string; pulse?: number }> = ({ x, y, r, color = "#e8faed", pulse = 0.06 }) => {
  const f = useCurrentFrame();
  const k = 1 + Math.sin(f / FPS * 2) * pulse;
  return <div style={{ position: "absolute", left: x - r * k, top: y - r * k, width: r * 2 * k, height: r * 2 * k, borderRadius: "50%", background: `radial-gradient(circle, ${color} 0%, rgba(255,255,255,0) 68%)` }} />;
};

/** Own-channel mark (optional, tiny, low opacity). Never reuse someone else's tag. */
export const Mark: React.FC<{ text: string }> = ({ text }) => (
  <div style={{ position: "absolute", left: 28, bottom: 36, color: "#fff", opacity: 0.35, font: "italic 30px 'Segoe Script', cursive" }}>{text}</div>
);

/** Optional title card in the same hand-lettered spirit. User rule is "no captions", so use ONLY if asked. */
export const Title: React.FC<{ text: string; sub?: string; dur: number }> = ({ text, sub, dur }) => {
  const f = useCurrentFrame();
  const a = interpolate(f, [0, 8, dur - 8, dur], [0, 1, 1, 0], { extrapolateLeft: "clamp", extrapolateRight: "clamp" });
  const y = interpolate(f, [0, 12], [30, 0], { extrapolateRight: "clamp" });
  return (
    <AbsoluteFill style={{ justifyContent: "center", alignItems: "center", opacity: a, transform: `translateY(${y}px)` }}>
      <div style={{ font: "900 120px 'Impact', 'Arial Black', sans-serif", color: "#ffe14d", textAlign: "center", lineHeight: 1.0, letterSpacing: 2,
        WebkitTextStroke: "8px #1a1410", paintOrder: "stroke fill", textShadow: "0 10px 0 #1a1410", padding: "0 60px" }}>{text}</div>
      {sub ? <div style={{ marginTop: 28, font: "700 46px 'Arial Black', sans-serif", color: "#fff", letterSpacing: 6, textShadow: "0 4px 0 #1a1410" }}>{sub}</div> : null}
    </AbsoluteFill>
  );
};
