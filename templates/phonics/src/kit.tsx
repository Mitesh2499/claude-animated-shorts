// Visual kit for the phonics song: inflated-plastic letters with kawaii faces, sky with puffy clouds, word label,
// pop spring and push transition. Everything is SVG so it renders the same in every frame (no image model needed).
import React, { useEffect, useState } from "react";
import { continueRender, delayRender, staticFile } from "remotion";
import { W, H } from "./timing";

// ---------------------------------------------------------------- font
export const FONT = "Fredoka";
export const useFont = () => {
  const [handle] = useState(() => delayRender("font"));
  useEffect(() => {
    const ff = new FontFace(FONT, `url(${staticFile("fonts/Fredoka.ttf")})`, { weight: "300 700" });
    ff.load().then((f) => { (document.fonts as any).add(f); return document.fonts.ready; }).then(() => continueRender(handle))
      .catch((e) => { console.error(e); continueRender(handle); });
  }, [handle]);
};

// ---------------------------------------------------------------- colour helpers
const hex = (c: string) => [1, 3, 5].map((k) => parseInt(c.slice(k, k + 2), 16));
const toHex = (v: number[]) => "#" + v.map((x) => Math.max(0, Math.min(255, Math.round(x))).toString(16).padStart(2, "0")).join("");
export const mix = (a: string, b: string, t: number) => { const A = hex(a), B = hex(b); return toHex(A.map((x, k) => x + (B[k] - x) * t)); };
export const darker = (c: string, t = 0.3) => mix(c, "#1a0f2e", t);
export const lighter = (c: string, t = 0.35) => mix(c, "#ffffff", t);

// ---------------------------------------------------------------- the "inflated plastic" look
// SourceAlpha is blurred into a height field, lit by a diffuse + specular light from the upper left, multiplied over
// the flat colour: big soft rounded edges, a glossy highlight on the upper-left shoulder, darker lower-right rim.
// r = blur radius (roundness), s = surface height. Large toys use puffL, small parts puffS.
const PUFFS: Record<string, { r: number; s: number; spec: number }> = {
  puffXL: { r: 34, s: 9, spec: 0.75 }, puffL: { r: 22, s: 7, spec: 0.7 }, puffM: { r: 12, s: 5, spec: 0.6 }, puffS: { r: 6, s: 3, spec: 0.5 },
};
export const PuffDefs: React.FC = () => (
  <svg width={0} height={0} style={{ position: "absolute" }}>
    <defs>
      {Object.entries(PUFFS).map(([id, p]) => (
        <filter key={id} id={id} x="-15%" y="-15%" width="130%" height="130%" colorInterpolationFilters="sRGB">
          <feGaussianBlur in="SourceAlpha" stdDeviation={p.r} result="hgt" />
          <feDiffuseLighting in="hgt" surfaceScale={p.s} diffuseConstant={1.18} lightingColor="#ffffff" result="dif">
            <feDistantLight azimuth={225} elevation={58} />
          </feDiffuseLighting>
          <feComposite in="dif" in2="SourceAlpha" operator="in" result="difIn" />
          <feBlend in="SourceGraphic" in2="difIn" mode="multiply" result="shade" />
          <feSpecularLighting in="hgt" surfaceScale={p.s} specularConstant={p.spec} specularExponent={26} lightingColor="#ffffff" result="spc">
            <feDistantLight azimuth={225} elevation={42} />
          </feSpecularLighting>
          <feComposite in="spc" in2="SourceAlpha" operator="in" result="spcIn" />
          <feComposite in="shade" in2="spcIn" operator="arithmetic" k1={0} k2={1} k3={0.85} k4={0} />
        </filter>
      ))}
      <filter id="cloudSoft" x="-10%" y="-10%" width="120%" height="120%"><feGaussianBlur stdDeviation={1.2} /></filter>
      <filter id="blush" x="-50%" y="-50%" width="200%" height="200%"><feGaussianBlur stdDeviation={9} /></filter>
      <filter id="labelShadow" x="-10%" y="-30%" width="120%" height="160%"><feDropShadow dx={0} dy={5} stdDeviation={5} floodColor="#1b3a5a" floodOpacity={0.25} /></filter>
    </defs>
  </svg>
);

// ---------------------------------------------------------------- sky
// Measured: flat sky blue #84d8f8 (60 % of all pixels), white puffy clouds in a band at the top and the bottom,
// a few small ones between. The sky is part of every card, so a push moves it too (clouds shift = motion cue).
export const SKY = "#84d8f8";
const rnd = (s: number) => { const x = Math.sin(s * 127.1 + 311.7) * 43758.5453; return x - Math.floor(x); };
const Cloud: React.FC<{ x: number; y: number; s: number }> = ({ x, y, s }) => (
  <g transform={`translate(${x} ${y}) scale(${s})`} filter="url(#puffM)">
    <ellipse cx={0} cy={18} rx={120} ry={34} fill="#f4fbfb" />
    <circle cx={-62} cy={4} r={42} fill="#f4fbfb" /><circle cx={-8} cy={-18} r={58} fill="#f7fdfc" />
    <circle cx={54} cy={-2} r={44} fill="#f4fbfb" /><circle cx={92} cy={16} r={28} fill="#f0f8f8" />
  </g>
);
export const Sky: React.FC<{ seed: number }> = ({ seed }) => {
  const k = (seed % 3) * 70 - 70; // each card's clouds sit a little differently so the push reads as movement
  const clouds = [
    [150, 70, 1.5], [620, 30, 1.7], [1020, 130, 1.3], [380, 250, 0.85], [820, 290, 0.75],
    [140, 1560, 0.9], [560, 1640, 1.4], [980, 1560, 1.0], [260, 1830, 1.8], [800, 1860, 1.7], [1100, 1750, 0.9],
    [60, 1330, 0.55], [1020, 1390, 0.6],
  ];
  return (
    <svg width={W} height={H} style={{ position: "absolute", inset: 0 }}>
      <rect width={W} height={H} fill={SKY} />
      {clouds.map(([x, y, s], i) => <Cloud key={i} x={((x + k + rnd(seed * 13 + i) * 60 + 1240) % 1240) - 80} y={y + rnd(seed + i) * 30} s={s} />)}
    </svg>
  );
};

// ---------------------------------------------------------------- kawaii face (measured from the reference letters)
// dark-brown oval eyes with one white catch-light, soft pink-red blush below-outside, small smile or open grin.
export type Mouth = "smile" | "grin" | "open";
export const Face: React.FC<{ x: number; y: number; s?: number; mouth?: Mouth; eye?: string }> = ({ x, y, s = 1, mouth = "smile", eye = "#2b1710" }) => (
  <g transform={`translate(${x} ${y}) scale(${s})`}>
    <ellipse cx={-92} cy={42} rx={34} ry={22} fill="#ff4f5e" opacity={0.6} filter="url(#blush)" />
    <ellipse cx={92} cy={42} rx={34} ry={22} fill="#ff4f5e" opacity={0.6} filter="url(#blush)" />
    {[-62, 62].map((ex) => (
      <g key={ex}>
        <ellipse cx={ex} cy={-6} rx={19} ry={25} fill={eye} />
        <circle cx={ex - 6} cy={-15} r={7.5} fill="#fff" />
      </g>
    ))}
    {mouth === "smile" && <path d="M -36 30 Q 0 66 36 30" fill="none" stroke={eye} strokeWidth={9} strokeLinecap="round" />}
    {mouth !== "smile" && (
      <g>
        <path d={mouth === "grin" ? "M -40 26 Q 0 30 40 26 Q 34 74 0 76 Q -34 74 -40 26 Z" : "M -30 26 Q 0 22 30 26 Q 30 70 0 72 Q -30 70 -30 26 Z"} fill="#7a1420" stroke={eye} strokeWidth={6} strokeLinejoin="round" />
        <ellipse cx={0} cy={62} rx={20} ry={10} fill="#ff6b7a" />
      </g>
    )}
  </g>
);

// ---------------------------------------------------------------- puffy 3D letter
// Measured: letter fills ~72 % of the width and ~42 % of the height, centred at 54 % of the height.
// Depth = 16 stacked darker copies offset down-right (the reference letters show their side to the lower right).
// Face placement is automatic: the glyph is drawn into a small canvas and we search for the BIGGEST face whose eyes
// and mouth all land on solid letter body (never in a counter/hole), nearest to the lower centre of the glyph.
// Works for any letter, digit or lower-case glyph. Cached per glyph.
const FAT = 0.042;           // extra outline (fraction of font size) so the letters are as chubby as the reference
const CAP = 0.35;            // Fredoka cap height ~0.70 em: baseline = cy + 0.35 em centres the capital on cy
const faceCache = new Map<string, { dx: number; dy: number; s: number }>();
const FACE_PTS: [number, number][] = [];
for (const ex of [-62, 62]) for (let a = 0; a < 8; a++) FACE_PTS.push([ex + 20 * Math.cos(a * Math.PI / 4), -6 + 24 * Math.sin(a * Math.PI / 4)]);
for (let x = -32; x <= 32; x += 16) FACE_PTS.push([x, 42]);
FACE_PTS.push([0, -6], [0, 30]);
export const fitFace = (ch: string): { dx: number; dy: number; s: number } => {
  const hit = faceCache.get(ch);
  if (hit) return hit;
  const S = 300, K = S / 1150, cw = 400, chh = 400; // work at 1150 px font size, sampled at 26 %
  const cv = document.createElement("canvas"); cv.width = cw; cv.height = chh;
  const g = cv.getContext("2d")!;
  g.font = `700 ${S}px ${FONT}`; g.textAlign = "center"; g.lineJoin = "round"; g.lineWidth = 2 * FAT * S;
  g.fillStyle = g.strokeStyle = "#000"; g.fillText(ch, cw / 2, chh / 2 + CAP * S); g.strokeText(ch, cw / 2, chh / 2 + CAP * S);
  const a = g.getImageData(0, 0, cw, chh).data;
  const inside = (x: number, y: number) => { const X = Math.round(x), Y = Math.round(y); return X >= 0 && Y >= 0 && X < cw && Y < chh && a[(Y * cw + X) * 4 + 3] > 200; };
  // glyph centre of mass
  let sx = 0, sy = 0, n = 0;
  for (let y = 0; y < chh; y += 2) for (let x = 0; x < cw; x += 2) if (inside(x, y)) { sx += x; sy += y; n++; }
  const gx = n ? sx / n : cw / 2, gy = n ? sy / n : chh / 2;
  let best = { dx: 0, dy: 0, s: 0.9 };
  outer: for (let s = 2.4; s >= 0.7; s -= 0.1) {
    let found: { d: number; x: number; y: number } | null = null;
    for (let y = 0; y < chh; y += 3) for (let x = 0; x < cw; x += 3) {
      if (!FACE_PTS.every(([px, py]) => inside(x + px * s * K, y + py * s * K))) continue;
      const d = Math.hypot(x - gx, (y - (gy + 0.06 * S)) * 1.3);
      if (!found || d < found.d) found = { d, x, y };
    }
    if (found) { best = { dx: (found.x - cw / 2) / K, dy: (found.y - chh / 2) / K, s }; break outer; }
  }
  if (document.fonts.check(`700 100px ${FONT}`)) faceCache.set(ch, best); // never cache a fallback-font fit
  return best;
};

export const Letter: React.FC<{ ch: string; color: string; cx?: number; cy?: number; size?: number; mouth?: Mouth; face?: boolean }> = ({
  ch, color, cx = W / 2, cy = H * 0.54, size = 1000, mouth = "smile", face = true,
}) => {
  const base = cy + size * CAP;
  const fs = size / 1150;
  const depth = Array.from({ length: 16 }, (_, k) => 16 - k);
  const t = (dx: number, dy: number, sw: string) => (
    <text x={cx + dx} y={base + dy} textAnchor="middle" fontFamily={FONT} fontWeight={700} fontSize={size}
      stroke={sw} strokeWidth={2 * FAT * size} strokeLinejoin="round">{ch}</text>
  );
  const fc = face ? fitFace(ch) : null;
  const dk = darker(color, 0.38);
  return (
    <g>
      <g fill={dk} filter="url(#puffL)">{depth.map((k) => <g key={k}>{t(k * 1.5 * fs, k * 1.8 * fs, dk)}</g>)}</g>
      <g fill={color} filter="url(#puffXL)">{t(0, 0, color)}</g>
      {fc && <Face x={cx + fc.dx * fs} y={cy + fc.dy * fs} s={fs * fc.s} mouth={mouth} />}
    </g>
  );
};

// ---------------------------------------------------------------- word label
// Measured: rounded heavy caps in the letter's colour, white outline, sits at 13 % of the height, fades in over
// 13 frames starting on the pop frame.
export const Label: React.FC<{ text: string; color: string; opacity: number; y?: number; size?: number }> = ({ text, color, opacity, y = H * 0.16, size = 150 }) => (
  <g opacity={opacity} filter="url(#labelShadow)">
    <text x={W / 2} y={y} textAnchor="middle" fontFamily={FONT} fontWeight={700} fontSize={size} letterSpacing={2}
      fill={color} stroke="#ffffff" strokeWidth={16} strokeLinejoin="round" paintOrder="stroke">{text.toUpperCase()}</text>
  </g>
);

// ---------------------------------------------------------------- motion curves (measured frame by frame)
// Pop: hard cut to a small object that overshoots, rings once, and settles in 9 frames.
const POP = [0.25, 1.16, 1.22, 1.1, 0.96, 0.93, 0.98, 1.01, 1.02, 1.0];
export const popScale = (ageF: number) => {
  if (ageF <= 0) return POP[0];
  if (ageF >= POP.length - 1) return 1;
  const k = Math.floor(ageF), u = ageF - k;
  return POP[k] + (POP[k + 1] - POP[k]) * u;
};
export const labelOpacity = (ageF: number) => Math.max(0, Math.min(1, ageF / 13));
export const easeInOut = (p: number) => (p < 0.5 ? 4 * p * p * p : 1 - Math.pow(-2 * p + 2, 3) / 2);
