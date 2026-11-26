// Icons + animated assets in Remotion, frame-exact (canonical copy: templates/_shared/assets.tsx; templates keep a copy in src/).
// Sources and licences: brand/fetch_icon.py (theSVG static icons/logos) and brand/fetch_anim.py (Motive, AssetPolish,
// SketchValley, LottieFiles/Lottieflow, IconKing, Pulsar, Sveegees, SVG Repo, Openverse) -> brand/animated/CREDITS.json.
//
// Why this file exists: animated SVGs (CSS @keyframes / SMIL), Lottie and GIF play on the browser's wall clock. Remotion
// renders frames out of order on several tabs, so wall-clock animation jitters or freezes. Here every animation is PAUSED
// and SEEKED to the video time of the current frame -> identical output on every render.
//
//   <Asset src="brand/animated/motive/check-circle-draw.svg" from={1.2} w={220} />           animated SVG, starts at 1.2 s
//   <Asset src="brand/icons/rocket.duotone.svg" mode="draw" color="#D11F3A" w={200} />       static icon, drawn on by us
//   <Asset src="brand/animated/lottie/confetti.json" from={3} w={500} loop={false} />         Lottie
//   <Asset src="brand/animated/x.gif" w={300} />  <Asset src="clip.mp4" w={600} />            GIF / video
// `from` = seconds (relative to the parent Sequence / section), `speed` = playback rate, `dur` = hide after N s.
import React, { useLayoutEffect, useRef, useState } from "react";
import { Img, OffthreadVideo, Sequence, continueRender, delayRender, staticFile, useCurrentFrame, useVideoConfig } from "remotion";
import { Lottie, type LottieAnimationData } from "@remotion/lottie";
import { Gif } from "@remotion/gif";
import { E, arrive, prog, staggerAt, f2s, cl01 } from "./motion";

const textCache = new Map<string, string>();
const jsonCache = new Map<string, LottieAnimationData>();
/** load a text asset once (delayRender keeps the frame from rendering until it is there) */
const useText = (src: string) => {
  const [txt, setTxt] = useState<string | null>(textCache.get(src) ?? null);
  const [h] = useState(() => (textCache.has(src) ? null : delayRender(`asset ${src}`)));
  React.useEffect(() => {
    if (txt !== null) { if (h !== null) continueRender(h); return; }
    fetch(staticFile(src)).then((r) => r.text()).then((t) => { textCache.set(src, t); setTxt(t); if (h !== null) continueRender(h); })
      .catch(() => { setTxt(""); if (h !== null) continueRender(h); });
  }, [src]);
  return txt;
};
const sanitize = (svg: string) => svg.replace(/<script[\s\S]*?<\/script>/gi, "").replace(/\son[a-z]+\s*=\s*"[^"]*"/gi, "").replace(/<\?xml[^>]*>/, "");
const isAnimated = (svg: string) => /@keyframes|<animate|<set\b/.test(svg);

/** Animated SVG (CSS @keyframes or SMIL), seeked to time t every frame. Recolour stroke/fill with `color` when the SVG uses currentColor. */
export const AnimatedSvg: React.FC<{ src: string; t: number; speed?: number; w: number; h?: number; color?: string; style?: React.CSSProperties }> = ({ src, t, speed = 1, w, h, color, style }) => {
  const txt = useText(src); const ref = useRef<HTMLDivElement>(null);
  useLayoutEffect(() => {
    const el = ref.current; if (!el) return; const ms = Math.max(0, t) * 1000 * speed;
    el.querySelectorAll("svg").forEach((svg: any) => { if (svg.pauseAnimations) { svg.pauseAnimations(); svg.setCurrentTime(ms / 1000); } });
    (el as any).getAnimations?.({ subtree: true }).forEach((a: Animation) => { a.pause(); a.currentTime = ms; });
  });
  if (!txt) return null;
  return <div ref={ref} style={{ width: w, height: h ?? w, color, lineHeight: 0, ...style }}
    dangerouslySetInnerHTML={{ __html: sanitize(txt).replace(/<svg\b([^>]*)>/, (m, a) => `<svg${a.replace(/\s(width|height)="[^"]*"/g, "")} width="100%" height="100%">`) }} />;
};

/** A STATIC icon (theSVG, SVG Repo ...) animated by us, measured motion only:
 *  draw    - every stroke draws on (pathLength trick), parts on uneven 1-3 f stagger, fills fade in after their stroke
 *  arrive  - the whole icon comes DOWN from 1.45x with a focus pull (snapSettle) - never grows from zero
 *  stagger - each part arrives from 1.3x about its own centre, 1-3 f apart (a wave under 0.5 s reads as one gesture) */
export const SvgIcon: React.FC<{ src: string; t: number; mode?: "draw" | "arrive" | "stagger"; dur?: number; w: number; h?: number; color?: string; style?: React.CSSProperties }> = ({ src, t, mode = "draw", dur = 0.7, w, h, color, style }) => {
  const txt = useText(src); const ref = useRef<HTMLDivElement>(null);
  useLayoutEffect(() => {
    const el = ref.current; if (!el || mode === "arrive") return;
    const parts = Array.from(el.querySelectorAll("path,line,polyline,polygon,circle,ellipse,rect")) as SVGGraphicsElement[];
    parts.forEach((p, i) => {
      const t0 = staggerAt(i, src, 1, 3), s = p.style as any;
      if (mode === "draw") {
        p.setAttribute("pathLength", "1"); const k = prog(t, t0, dur, E.softInOut);
        s.strokeDasharray = "1 1"; s.strokeDashoffset = String(1 - k);
        const hasFill = (getComputedStyle(p).fill ?? "none") !== "none"; s.fillOpacity = hasFill ? String(prog(t, t0 + dur * 0.6, f2s(8), E.glide)) : "";
        s.opacity = t >= t0 ? "1" : "0";
      } else {
        const a = arrive(t, t0, { from: 1.3, blur: 0, dur: f2s(12), ease: E.snapSettle });
        s.transformBox = "fill-box"; s.transformOrigin = "50% 50%"; s.transform = `scale(${a.scale})`; s.opacity = String(a.opacity);
      }
    });
  });
  if (!txt) return null;
  const a = mode === "arrive" ? arrive(t, 0, { from: 1.45, blur: 8, dur: f2s(14), ease: E.snapSettle }) : null;
  return <div ref={ref} style={{ width: w, height: h ?? w, color, lineHeight: 0, ...(a ? { transform: `scale(${a.scale})`, opacity: a.opacity, filter: a.blur > 0.25 ? `blur(${a.blur}px)` : undefined } : {}), ...style }}
    dangerouslySetInnerHTML={{ __html: sanitize(txt).replace(/<svg\b([^>]*)>/, (m, at) => `<svg${at.replace(/\s(width|height)="[^"]*"/g, "")} width="100%" height="100%">`) }} />;
};

const LottieInner: React.FC<{ src: string; speed: number; loop: boolean; w: number; h?: number }> = ({ src, speed, loop, w, h }) => {
  const [data, setData] = useState<LottieAnimationData | null>(jsonCache.get(src) ?? null);
  const [hd] = useState(() => (jsonCache.has(src) ? null : delayRender(`lottie ${src}`)));
  React.useEffect(() => { if (data) { if (hd !== null) continueRender(hd); return; }
    fetch(staticFile(src)).then((r) => r.json()).then((j) => { jsonCache.set(src, j); setData(j); if (hd !== null) continueRender(hd); }).catch(() => { if (hd !== null) continueRender(hd); }); }, [src]);
  if (!data) return null;
  return <div style={{ width: w, height: h ?? w }}><Lottie animationData={data} loop={loop} playbackRate={speed} style={{ width: "100%", height: "100%" }} /></div>;
};

/** One entry point: picks the right player from the file type. Positioned absolutely when x/y are given. */
export const Asset: React.FC<{ src: string; from?: number; dur?: number; speed?: number; loop?: boolean; mode?: "draw" | "arrive" | "stagger" | "auto";
  w: number; h?: number; x?: number; y?: number; color?: string; style?: React.CSSProperties }> = ({ src, from = 0, dur, speed = 1, loop = true, mode = "auto", w, h, x, y, color, style }) => {
  const { fps } = useVideoConfig(); const f = useCurrentFrame(); const t = f / fps - from;
  if (t < 0 || (dur !== undefined && t > dur)) return null;
  const ext = src.split("?")[0].split(".").pop()!.toLowerCase();
  const pos: React.CSSProperties = x !== undefined || y !== undefined ? { position: "absolute", left: x ?? 0, top: y ?? 0 } : {};
  let el: React.ReactNode = null;
  if (ext === "svg") el = <SvgSwitch src={src} t={t} speed={speed} mode={mode} w={w} h={h} color={color} />;
  else if (ext === "json" || ext === "lottie") el = <Sequence from={Math.round(from * fps)} layout="none"><LottieInner src={src} speed={speed} loop={loop} w={w} h={h} /></Sequence>;
  else if (ext === "gif") el = <Sequence from={Math.round(from * fps)} layout="none"><Gif src={staticFile(src)} width={w} height={h ?? w} fit="contain" playbackRate={speed} loopBehavior={loop ? "loop" : "pause-after-finish"} /></Sequence>;
  else if (["mp4", "webm", "mov"].includes(ext)) el = <Sequence from={Math.round(from * fps)} layout="none"><OffthreadVideo src={staticFile(src)} muted playbackRate={speed} style={{ width: w, height: h ?? "auto" }} /></Sequence>;
  else { const a = arrive(t, 0, { from: 1.2, blur: 8 }); el = <Img src={staticFile(src)} style={{ width: w, height: h ?? "auto", transform: `scale(${a.scale})`, opacity: a.opacity, filter: a.blur > 0.25 ? `blur(${a.blur}px)` : undefined }} />; }
  return <div style={{ ...pos, ...style }}>{el}</div>;
};
const SvgSwitch: React.FC<{ src: string; t: number; speed: number; mode: string; w: number; h?: number; color?: string }> = ({ src, t, speed, mode, w, h, color }) => {
  const txt = useText(src);
  if (txt === null) return null;
  if (mode === "auto" && isAnimated(txt)) {
    // animated asset: arrive (scale down from 1.25x + focus) while its own animation plays
    const a = arrive(t, 0, { from: 1.25, blur: 6, dur: f2s(12) });
    return <div style={{ transform: `scale(${a.scale})`, opacity: a.opacity, filter: a.blur > 0.25 ? `blur(${a.blur}px)` : undefined }}><AnimatedSvg src={src} t={t} speed={speed} w={w} h={h} color={color} /></div>;
  }
  return <SvgIcon src={src} t={t} mode={mode === "auto" ? "draw" : (mode as any)} w={w} h={h} color={color} />;
};
export { cl01 };
