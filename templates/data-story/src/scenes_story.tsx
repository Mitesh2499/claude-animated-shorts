// Story / explainer scenes for data-story-reel (lore recaps, "previously on", history explainers) - built for the
// "Before Doomsday" Wanda reel (2026-11-25) on top of the 2.5D toolkit. Same contract as scenes_data.tsx: data-driven,
// canvas 1080 x 600 in the Instagram safe band, cues = display words of the section ("word#2" = 2nd occurrence).
// Images: the user's files only (project images/ or brand/cards/, mapped through posters.json). A missing image renders
// a designed placeholder that names its slot, so the edit can be reviewed before the images arrive.
import React from "react";
import { Img, random, staticFile } from "remotion";
import SCRIPT from "../script.json";
import POSTERS from "./posters.json";
import IMGSTATS from "./imgstats.json";
import { sp, ease, cl } from "./scenes";
import type { SceneProps } from "./scenes";
import { Box, BoxShadow, proj, fit, col, mixc } from "./scenes_depth";
import type { Cam } from "./scenes_depth";

const CW = 1080, CH = 600;
type DP = SceneProps & { data?: any };
const SC = SCRIPT as any; const TH = (SC.theme ?? {}) as Record<string, string>;
const FONT = "Inter, 'Noto Sans Devanagari', 'Nirmala UI', 'Segoe UI', sans-serif", MONO = "'JetBrains Mono','Cascadia Code',Consolas,monospace";
const INK = TH.ink ?? "#141B4D", MUTE = "#8A90A6";
const lerp = (a: number, b: number, k: number) => a + (b - a) * k;
const cueAt = (cue: SceneProps["cue"], w: any, dflt: number) => { if (w === undefined || w === null) return dflt; if (typeof w === "number") return w;
  const m = String(w).match(/^(.*)#(\d+)$/); return m ? cue(m[1], Number(m[2])) : cue(String(w)); };
const imgFile = (stem?: string) => (stem ? (POSTERS as Record<string, string>)[stem.toLowerCase()] : undefined);

// ------------------------------------------------------------------ viewfinder overlay (REC dot, timecode, corner brackets)
type Mode = "light" | "dark" | "scrim" | "halo";
const STATS = IMGSTATS as unknown as Record<string, Record<string, { mode: Mode }>>;
/** Viewfinder overlay. Each element's colour comes from the contrast check of the photo underneath (scripts/img_contrast.py):
 *  text: light = white, dark = navy ink, scrim = white on a dark pill (>= 4.5:1); brackets: light / dark / halo (white + dark outline, >= 3:1). */
export const Rec: React.FC<{ t: number; w: number; h: number; label?: string; img?: string; rec?: Mode; tc?: Mode; br?: Mode }> = ({ t, w, h, label = "REC", img, rec, tc, br }) => {
  const st = img ? STATS[img.toLowerCase()] : undefined;
  const mR: Mode = rec ?? st?.rec?.mode ?? "light", mT: Mode = tc ?? st?.tc?.mode ?? "light", mB: Mode = br ?? st?.corners?.mode ?? "light";
  const tcol = (m: Mode) => (m === "dark" ? INK : "#fff"), L = 46, f = Math.floor(t * 30), code = `00:00:${String(Math.floor(t) % 60).padStart(2, "0")}:${String(f % 30).padStart(2, "0")}`;
  const bc = mB === "dark" ? INK : "#fff";
  const br_ = (x: number, y: number, sx: number, sy: number) => { const d = `M${x},${y + sy * L} L${x},${y} L${x + sx * L},${y}`;
    return <g key={`${x}${y}`}>{mB === "halo" ? <path d={d} fill="none" stroke="rgba(11,18,32,0.75)" strokeWidth={11} strokeLinecap="round" /> : null}
      <path d={d} fill="none" stroke={bc} strokeWidth={5} strokeLinecap="round" /></g>; };
  const tw = label.length * 19 + 52, cw = 170;
  return <svg width={w} height={h} style={{ position: "absolute", left: 0, top: 0 }}>
    {br_(26, 26, 1, 1)}{br_(w - 26, 26, -1, 1)}{br_(26, h - 26, 1, -1)}{br_(w - 26, h - 26, -1, -1)}
    {mR === "scrim" ? <rect x={44} y={46} width={tw} height={40} rx={10} fill="rgba(11,18,32,0.72)" /> : null}
    <circle cx={62} cy={66} r={11} fill="#E5252A" opacity={Math.floor(t * 2) % 2 ? 0.35 : 1} />
    <text x={84} y={75} fontFamily={MONO} fontWeight={700} fontSize={26} fill={tcol(mR)} letterSpacing={3}>{label}</text>
    {w >= 500 ? <g>{mT === "scrim" ? <rect x={w - 52 - cw - 12} y={46} width={cw + 24} height={40} rx={10} fill="rgba(11,18,32,0.72)" /> : null}
      <text x={w - 52} y={75} textAnchor="end" fontFamily={MONO} fontWeight={600} fontSize={22} fill={tcol(mT)} letterSpacing={2}>{code}</text></g> : null}
  </svg>;
};

// ------------------------------------------------------------------ 1. photo: the story beat (Ken Burns print card with real depth)
// data: { rec?: bool | "label", shots:[{ img, cue?, caption?, kb?: in|out|left|right, desat?: cue, freeze?: cue, dust?: cue,
//          fallback?:{ title, sub?, color? } }] }
// The card floats in 3D (slow rotateY/rotateX drift + perspective), shots switch on cue with a zoom-through flash,
// `freeze` stops the Ken Burns with a white flash + FREEZE tag, `desat` drains colour (guilt / memory), `dust` dissolves the
// shot into particles (the Snap). Missing image -> designed placeholder that shows the slot name.
const photo: React.FC<DP> = ({ t, d, cue, data: D }) => {
  const shots = D.shots as any[]; const Ts = shots.map((s, i) => (i === 0 ? 0 : cueAt(cue, s.cue, (i * d) / shots.length) - 0.12));
  let cur = 0; Ts.forEach((x, i) => { if (t >= x) cur = i; });
  const s = shots[cur], ts = t - Ts[cur], span = (cur < shots.length - 1 ? Ts[cur + 1] : d) - Ts[cur];
  const kin = cur === 0 ? sp(t, 0, 14, 160) : ease(ts / 0.3);
  const Tfz = s.freeze ? cueAt(cue, s.freeze, 1e9) - 0.05 : 1e9, frozen = t > Tfz;
  const kb = Math.min(1, (frozen ? Tfz - Ts[cur] : ts) / Math.max(2, span));
  const KB: Record<string, number[]> = { in: [1.05, 1.2, 0, 0], out: [1.22, 1.06, 0, 0], left: [1.15, 1.15, 34, -34], right: [1.15, 1.15, -34, 34] };
  const [s0, s1, x0, x1] = KB[s.kb ?? (cur % 2 ? "left" : "in")];
  const desat = s.desat ? cl((t - cueAt(cue, s.desat, 1e9)) / 0.7) : 0;
  const Td = s.dust ? cueAt(cue, s.dust, 1e9) : 1e9, kd = cl((t - Td) / 1.9);
  const file = imgFile(s.img), fb = s.fallback ?? {}, fc = col(fb.color ?? "accent");
  const shake = frozen ? Math.sin((t - Tfz) * 70) * 7 * Math.exp(-(t - Tfz) * 9) : 0;
  const flash = Math.max(cur > 0 ? 1 - ts / 0.16 : 0, frozen ? 1 - (t - Tfz) / 0.22 : 0);
  const edge = 100 - kd * 135; // dust sweep boundary (% of width), right -> left
  return <div style={{ position: "absolute", left: 0, top: 0, width: CW, height: CH, perspective: 1600 }}>
    <div style={{ position: "absolute", left: 65 + shake, top: 34, width: 950, height: 550, borderRadius: 26, overflow: "hidden", background: "#0B1220",
      boxShadow: "0 30px 60px rgba(20,27,77,0.28), 0 8px 18px rgba(20,27,77,0.18)",
      transform: `rotateY(${Math.sin(t * 0.45) * 5}deg) rotateX(${3 + Math.cos(t * 0.38) * 1.5}deg) scale(${0.9 + 0.1 * kin})`,
      filter: kin < 0.98 ? `blur(${(1 - kin) * 9}px)` : undefined,
      WebkitMaskImage: kd > 0 ? `linear-gradient(100deg, #000 ${edge}%, transparent ${edge + 22}%)` : undefined, maskImage: kd > 0 ? `linear-gradient(100deg, #000 ${edge}%, transparent ${edge + 22}%)` : undefined }}>
      {file ? <Img src={staticFile(`brand/cards/${file}`)} style={{ width: "100%", height: "100%", objectFit: "cover", objectPosition: s.pos ?? "50% 35%",
        transform: `scale(${lerp(s0, s1, kb)}) translateX(${lerp(x0, x1, kb)}px)`, filter: `grayscale(${desat}) contrast(${1 + 0.18 * desat}) brightness(${1 - 0.12 * desat})` }} />
        : <div style={{ width: "100%", height: "100%", position: "relative", background: `radial-gradient(ellipse 80% 70% at 30% 30%, ${mixc(fc, "#ffffff", 0.18)}, ${mixc(fc, "#000000", 0.55)} 70%, #07070A)`,
          filter: `grayscale(${desat})`, transform: `scale(${lerp(s0, s1, kb) * 0.95 + 0.05})` }}>
          <div style={{ position: "absolute", left: 60, right: 60, top: 150, paddingLeft: 30, fontFamily: FONT, fontWeight: 900, fontSize: 70, lineHeight: 1.02, color: "#fff", letterSpacing: -1.5 }}>{fb.title ?? s.img}</div>
          {fb.sub ? <div style={{ position: "absolute", left: 62, right: 60, top: 330, paddingLeft: 30, fontFamily: FONT, fontWeight: 700, fontSize: 30, color: "rgba(255,255,255,0.78)" }}>{fb.sub}</div> : null}
          <div style={{ position: "absolute", right: 40, top: 100, fontFamily: MONO, fontWeight: 600, fontSize: 18, letterSpacing: 3, color: "rgba(255,255,255,0.55)" }}>{`IMAGE SLOT: ${s.img}`.toUpperCase()}</div>
        </div>}
      {D.rec ? <Rec t={t} w={950} h={550} label={typeof D.rec === "string" ? D.rec : "REC"} img={file ? s.img : undefined} /> : null}
      {frozen && !kd ? <div style={{ position: "absolute", left: "50%", top: 44, transform: "translateX(-50%)", fontFamily: MONO, fontWeight: 700, fontSize: 24, letterSpacing: 5, color: "#fff", background: "rgba(11,18,32,0.65)", padding: "6px 16px", borderRadius: 8 }}>❚❚ FREEZE</div> : null}
      {s.caption ? <div style={{ position: "absolute", left: 34, bottom: 30, fontFamily: MONO, fontWeight: 600, fontSize: 21, letterSpacing: 3, color: "#fff", background: "rgba(11,18,32,0.72)", padding: "8px 16px", borderRadius: 10, opacity: cl((ts - 0.3) * 3) }}>{s.caption.toUpperCase()}</div> : null}
      {flash > 0 ? <div style={{ position: "absolute", inset: 0, background: "#fff", opacity: flash }} /> : null}
    </div>
    {kd > 0 ? Array.from({ length: 90 }, (_, j) => { const r1 = random(`dust${j}`), r2 = random(`dusty${j}`), r3 = random(`dusts${j}`);
      const born = Td + r1 * 1.7, a = t - born; if (a < 0 || a > 1.5) return null;
      const x = 65 + 950 * (1 - r1 * 1.25) + a * (90 + r3 * 140), y = 34 + r2 * 550 - a * (60 + r3 * 90) + Math.sin(a * 6 + j) * 6, z = 4 + r3 * 8;
      return <div key={j} style={{ position: "absolute", left: x, top: y, width: z, height: z, background: j % 3 ? "#4A3426" : "#8C5A3C", opacity: (1 - a / 1.5) * 0.9, transform: `rotate(${a * 200 + j * 20}deg)` }} />; }) : null}
  </div>;
};

// ------------------------------------------------------------------ 2. chain: 3D keycap equation / cause chain, stacked vertically
// data: { items:[{ t, cue, color?, ink? }], ops?: ["+", "=", ...] | op: "↓", strike?:{ i, cue }, question?: bool }
// "HYDRA ↓ SECRET NETWORK ↓ WORLD DOMINATION", "VIBRANIUM + J.A.R.V.I.S. + MIND STONE = VISION". The last tile is the
// result (accent colour) unless it has its own colour. Each tile drops onto the table at its cue.
const chain: React.FC<DP> = ({ t, cue, data: D }) => {
  const it = D.items as any[], n = it.length, ops: string[] = D.ops ?? Array(n - 1).fill(D.op ?? "↓");
  const rowH = CH / n, gapH = n > 3 ? 34 : 44, H = 2, dp = 1.2, wd = (s: string) => 1.3 + 0.56 * s.length;
  const cam: Cam = { yaw: -13 + Math.sin(t * 0.5) * 3, pitch: 13, dist: 40 }, cam0: Cam = { yaw: -13, pitch: 13, dist: 40 };
  const corners = (w: number) => [[-w / 2, 0, dp / 2], [w / 2, H, -dp / 2], [-w / 2, H, dp / 2], [w / 2, 0, dp / 2], [w / 2, H, dp / 2]].map((p) => proj(p as any, cam0));
  const K = Math.min(...it.map((x) => fit(corners(wd(x.t)), [65, 0, 1015, rowH - gapH]).K));
  const Ti = it.map((x, i) => cueAt(cue, x.cue, 0.2 + i * 0.7) - 0.12);
  const Tst = D.strike ? cueAt(cue, D.strike.cue, 1e9) - 0.05 : 1e9;
  return <svg width={CW} height={CH} style={{ overflow: "visible" }}>
    {it.map((x, i) => { if (t < Ti[i]) return null; const w = wd(x.t), pts = corners(w);
      const xs = pts.map((p) => p.x), ys = pts.map((p) => p.y); const cx = (Math.min(...xs) + Math.max(...xs)) / 2, cy = (Math.min(...ys) + Math.max(...ys)) / 2;
      const F = { K, ox: 540 - cx * K, oy: i * rowH + (rowH - gapH) / 2 - cy * K };
      const k = sp(t, Ti[i], 9, 200), last = i === n - 1 && D.result !== false; const c = x.color ?? (last ? "accent" : "chalk");
      const struck = D.strike?.i === i && t > Tst;
      return <g key={i}>
        {i > 0 ? <text x={540} y={i * rowH - gapH / 2 + 14} textAnchor="middle" fontFamily={FONT} fontWeight={900} fontSize={gapH * 0.95} fill={MUTE} opacity={cl((t - Ti[i]) * 5)}>{ops[i - 1]}</text> : null}
        <BoxShadow cam={cam} F={F} x={0} z={0} w={w} d={dp} h={H * 0.5} o={cl(k)} />
        <Box cam={cam} F={F} x={0} z={0} w={w} d={dp} h={H} y0={Math.max(0, (1 - k) * 6)} c={c} label={x.t} ink={col(x.ink ?? (c === "chalk" ? "navy" : "white"))} fs={0.92} round={10} o={struck ? 0.45 : 1} />
        {struck ? (() => { const p0 = proj([-w / 2 - 0.3, H * 0.55, dp / 2], cam), p1 = proj([w / 2 + 0.3, H * 0.55, dp / 2], cam); const ks = ease((t - Tst) / 0.3);
          return <line x1={F.ox + p0.x * K} y1={F.oy + p0.y * K} x2={F.ox + lerp(p0.x, p1.x, ks) * K} y2={F.oy + lerp(p0.y, p1.y, ks) * K} stroke={col("accent")} strokeWidth={9} strokeLinecap="round" />; })() : null}
      </g>; })}
  </svg>;
};

// ------------------------------------------------------------------ 3. explainer: "MCU 101" side-note (presenter stand-in)
// data: { label?: "MCU 101", term, termCue?, lines:[{ t, cue, c? }], avatar?: "brand/logos/logo.png", video?: never }
// A recording viewfinder with the brand avatar punches in; the term pops in accent; the definition builds line by line.
// If the user records a presenter clip later, swap the avatar for it.
const explainer: React.FC<DP> = ({ t, cue, data: D }) => {
  const k = sp(t, 0, 12, 170), Tt = cueAt(cue, D.termCue, 0.15) - 0.1, kt = sp(t, Tt, 9, 220);
  const av = D.avatar ?? SC.brandLogo;
  return <div style={{ position: "absolute", left: 0, top: 0, width: CW, height: CH, fontFamily: FONT }}>
    <div style={{ position: "absolute", left: 65, top: 40, width: 330, height: 420, borderRadius: 26, overflow: "hidden", background: "#0B1220",
      transform: `scale(${0.8 + 0.2 * k}) rotate(${(1 - k) * -4}deg)`, boxShadow: "0 26px 50px rgba(20,27,77,0.3)" }}>
      <div style={{ position: "absolute", left: 55, top: 95, width: 220, height: 220, borderRadius: 110, overflow: "hidden", background: col("accent"), transform: `scale(${1 + 0.04 * Math.sin(t * 3)})` }}>
        {av ? <Img src={staticFile(av)} style={{ width: "100%", height: "100%", objectFit: "cover" }} /> : null}</div>
      <div style={{ position: "absolute", left: 0, right: 0, bottom: 34, textAlign: "center", fontFamily: MONO, fontWeight: 700, fontSize: 22, letterSpacing: 3, color: "#fff" }}>{SC.brand ?? ""}</div>
      <Rec t={t} w={330} h={420} label="LIVE" rec="light" br="light" />
    </div>
    <div style={{ position: "absolute", left: 65, top: 486, width: 330, textAlign: "center" }}>
      <span style={{ background: col("accent"), color: "#fff", fontFamily: MONO, fontWeight: 700, fontSize: 26, letterSpacing: 4, padding: "8px 20px", borderRadius: 10 }}>{D.label ?? "MCU 101"}</span></div>
    <div style={{ position: "absolute", left: 440, right: 65, top: 30 }}>
      {t > Tt ? <div style={{ fontWeight: 900, fontSize: D.term.length > 10 ? 70 : 92, lineHeight: 1, letterSpacing: -2, color: col("accent"), transform: `scale(${0.6 + 0.4 * kt})`, transformOrigin: "0 50%", opacity: cl(kt * 2) }}>{D.term}</div> : null}
      {(D.lines ?? []).map((l: any, i: number) => { const T = cueAt(cue, l.cue, 0.8 + i * 0.8) - 0.1; if (t < T) return null; const kl = sp(t, T, 13, 190);
        return <div key={i} style={{ marginTop: 22, fontWeight: 800, fontSize: 40, lineHeight: 1.15, color: l.c ? col(l.c) : INK, opacity: cl(kl * 1.6), transform: `translateY(${(1 - kl) * 24}px)` }}>{l.t}</div>; })}
    </div>
  </div>;
};

// ------------------------------------------------------------------ 4. endCard: cliffhanger / "PART 2" title on black
// data: { kicker?: "PART 2", title, cue?, sub? }
const endCard: React.FC<DP> = ({ t, cue, data: D }) => {
  const T = cueAt(cue, D.cue, 0.2) - 0.1, k = ease((t - T) / 1.2), kf = ease(t / 0.6);
  return <div style={{ position: "absolute", left: 65, top: 16, width: 950, height: 566, borderRadius: 26, overflow: "hidden", fontFamily: FONT,
    background: `radial-gradient(ellipse 70% 60% at 50% 55%, ${mixc(col("accent"), "#000000", 0.55)}, #050507 75%)`, opacity: kf }}>
    {t > T ? <div style={{ position: "absolute", left: 0, right: 0, top: 140, textAlign: "center" }}>
      <div style={{ fontFamily: MONO, fontWeight: 700, fontSize: 34, letterSpacing: 4 + (1 - k) * 30, color: col("accent"), opacity: k }}>{D.kicker ?? "PART 2"}</div>
      <div style={{ marginTop: 22, fontWeight: 900, fontSize: 70, lineHeight: 1.02, letterSpacing: -1.5, color: "#fff", opacity: cl((t - T - 0.3) * 2), transform: `scale(${1.15 - 0.15 * ease((t - T - 0.3) / 1.2)})`, textShadow: `0 0 40px ${col("accent")}` }}>{D.title}</div>
      {D.sub ? <div style={{ marginTop: 26, fontFamily: MONO, fontWeight: 600, fontSize: 22, letterSpacing: 3, color: "rgba(255,255,255,0.6)", opacity: cl((t - T - 1.2) * 2) }}>{D.sub.toUpperCase()}</div> : null}
    </div> : null}
  </div>;
};

export const STORY_SCENES: Record<string, React.FC<DP>> = { photo, chain, explainer, endCard };
