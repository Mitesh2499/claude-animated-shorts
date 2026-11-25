// Kinetic-typography listicle short (1080x1920 @ 30 fps). Data: ../script.json (what to say/show) + ./timeline.json (built by build.py:
// section times + the spoken time of every displayed word). Every word appears when it is spoken.
import React, { useEffect, useState } from "react";
import { AbsoluteFill, Audio, Img, OffthreadVideo, continueRender, delayRender, interpolate, spring, staticFile, useCurrentFrame, useVideoConfig } from "remotion";
import SCRIPT from "../script.json";
import TL from "./timeline.json";
import { SCENES, SW, SH } from "./scenes";
import { SAFE_SCENES, CW, CH } from "./scenes_safe";
import { DATA_SCENES } from "./scenes_data";
import { DEPTH_SCENES } from "./scenes_depth";
import { STORY_SCENES } from "./scenes_story";
import { E, DUR, prog, arrive, lookCss, drift, logLerp, f2s, Grain, Vignette, LightLeak, ShutterBlur } from "./motion";

export const W = 1080, H = 1920, FPS = 30;
export const TOTAL = Math.ceil(TL.total * FPS);

// ------------------------------------------------------------------ design tokens (measured from the reference)
const TH = ((SCRIPT as any).theme ?? {}) as Record<string, string>;
const C = { bg: TH.bg ?? "#f1f1f1", ink: TH.ink ?? "#1d1d1d", grey: "#525252", ghost: "#bdbab8", accent: (SCRIPT as any).accent ?? "#cc6e5a", mark: TH.mark ?? "#c6c6c6", bar: TH.bar ?? "#111111" };
/** span colour names -> hex (theme can override): blue/cyan/amber/violet/accent */
const COL: Record<string, string> = { blue: TH.blue ?? "#2563EB", cyan: TH.cyan ?? "#06B6D4", amber: TH.amber ?? "#F59E0B", violet: TH.violet ?? "#8B5CF6", accent: (SCRIPT as any).accent ?? "#cc6e5a" };
const FONT = "'Inter','Noto Sans Devanagari','Nirmala UI','Segoe UI',Arial,sans-serif";
/** say: what the voice says instead of t ("" = shown silently right after the previous spoken word); c: colour name */
type Span = { t: string; s?: "small" | "reg" | "big" | "huge" | "italic" | "bar"; say?: string; c?: string };
type Line = Span[];
type Card = { kind: "image" | "video" | "terminal" | "context"; src?: string; lines?: string[]; title?: string };
type Section = {
  kind: "hook" | "item" | "recap" | "cta" | "follow" | "scene"; blocks?: Line[]; ordinal?: string; scene?: string; minDur?: number;
  badge?: { name: string; say?: string; color?: string; glyph?: string; logo?: string }; head?: Line[]; card?: Card; sub?: Line[]; bullets?: (string | Span)[];
  ordinalSay?: string; tag?: string; chips?: string[]; keyword?: string; cover?: string; title?: Span[]; data?: any;
  /** mono "// LABEL" above the headline; enter: flash|zoom|drop|whip; exit: dive|whip|zoom; flash: colour of the enter flash */
  kicker?: string; enter?: "flash" | "zoom" | "drop" | "whip"; exit?: "dive" | "whip" | "zoom"; flash?: string;
};
// brandLogo / watermarkLogo: paths under public/ (build.py copies brand/ -> public/brand/), e.g. "brand/logos/logo.png"
const S = SCRIPT as unknown as { brand: string; brandLogo?: string; watermarkLogo?: string; sections: Section[] };
const SIZE: Record<string, React.CSSProperties> = {
  small: { fontSize: 44, fontWeight: 500 }, reg: { fontSize: 50, fontWeight: 500 }, big: { fontSize: 72, fontWeight: 800, letterSpacing: -1 },
  huge: { fontSize: 124, fontWeight: 800, letterSpacing: -3, lineHeight: 1 }, italic: { fontSize: 62, fontWeight: 700, fontStyle: "italic" },
  bar: { fontSize: 56, fontWeight: 700, color: "#fff" },
};

// ------------------------------------------------------------------ Instagram safe-zone layout ("layout": "safe" in script.json)
// 1080x1920: top 0-270 (14 %) and bottom 1248+ (35 %) are covered by Reels UI; 65 px side margins; lower-right = action buttons.
// headline 285-465 (15-24 %) -> visual canvas 470-1070 (24-56 %) -> rolling 2-line subtitles 1082-1240 (56-65 %).
export const SAFE = (SCRIPT as any).layout === "safe";
export const ZONE = { top: 270, bottom: 1248, side: 65, head: [285, 465], canvas: [470, 1070], subs: [1082, 1240] } as const;
/** film finish (script.json "finish", one level for the whole film): shutter motion blur inside fast transition windows,
 *  deterministic grain, vignette, light leaks on flash cuts. "finish": false switches everything off. */
const FIN_RAW = (SCRIPT as any).finish;
export const FINISH = FIN_RAW === false ? { motionBlur: false, samples: 0, grain: 0, vignette: 0, leaks: false }
  : { motionBlur: true, samples: 6, grain: 0.03, vignette: 0.05, leaks: true, ...(FIN_RAW ?? {}) } as { motionBlur: boolean; samples: number; grain: number; vignette: number; leaks: boolean };
const SUB_SIZE: Record<string, React.CSSProperties> = {
  small: { fontSize: 52, fontWeight: 600 }, reg: { fontSize: 54, fontWeight: 600 }, big: { fontSize: 68, fontWeight: 800 },
  huge: { fontSize: 78, fontWeight: 900 }, italic: { fontSize: 58, fontWeight: 700, fontStyle: "italic" }, bar: { fontSize: 58, fontWeight: 800, color: "#fff" },
};

// ------------------------------------------------------------------ token bookkeeping: must match build.py `tokens()` order
/** subtitle auto-fit: lines longer than ~28 characters shrink (down to 72 %) instead of wrapping onto a 3rd line */
const fitSizes = (line: Line): Record<string, React.CSSProperties> => { const n = line.map((x) => x.t).join(" ").length; const k = Math.max(0.72, Math.min(1, 28 / Math.max(1, n)));
  return k >= 1 ? SUB_SIZE : Object.fromEntries(Object.entries(SUB_SIZE).map(([key, v]) => [key, { ...v, fontSize: Math.round(Number(v.fontSize) * k) }])); };
const ease01 = (x: number) => { const c = Math.max(0, Math.min(1, x)); return 1 - Math.pow(1 - c, 3); };
const words = (t: string) => t.split(/\s+/).filter(Boolean);
export const sectionLines = (s: Section): { group: string; line: Line }[] => {
  const out: { group: string; line: Line }[] = [];
  if (s.kind === "item") {
    if (s.ordinal) out.push({ group: "ordinal", line: [{ t: s.ordinal, s: "huge", say: s.ordinalSay }] });
    if (s.badge) out.push({ group: "badge", line: [{ t: s.badge.name }] });
    (s.head ?? []).forEach((l) => out.push({ group: "head", line: l }));
    (s.sub ?? []).forEach((l) => out.push({ group: "sub", line: l }));
    (s.bullets ?? []).forEach((b) => out.push({ group: "bullet", line: [typeof b === "string" ? { t: b, s: "small" } : { s: "small", ...b }] }));
    if (s.tag) out.push({ group: "tag", line: [{ t: s.tag, s: "bar", say: "" }] });
  } else (s.blocks ?? []).forEach((l) => out.push({ group: "block", line: l }));
  return out;
};
/** start index of every line's first token inside the section's token list */
const lineStarts = (s: Section) => { let k = 0; return sectionLines(s).map(({ line }) => { const st = k; k += line.reduce((n, sp) => n + words(sp.t).length, 0); return st; }); };

// ------------------------------------------------------------------ primitives
const useNow = () => useCurrentFrame() / FPS;
// word motion (motionmaxxing type/sound-sync): the word starts 4 f before it is spoken and lands (softLand, 7 f) 0-2 f
// before it is heard - text that trails the voice feels late, text far ahead spoils the line.
const WORD_LEAD = f2s(4);
const Word: React.FC<{ w: string; at: number; style?: React.CSSProperties }> = ({ w, at, style }) => {
  const now = useNow();
  const k = prog(now, at - WORD_LEAD, DUR.word, E.softLand);
  const shown = now >= at - WORD_LEAD;
  return (
    <span style={{
      display: "inline-block", marginRight: "0.26em", opacity: shown ? 0.35 + 0.65 * k : 0,
      color: k < 1 ? mix(C.ghost, (style?.color as string) ?? C.ink, k) : (style?.color as string) ?? C.ink,
      transform: `translateY(${(1 - k) * 10}px)`, filter: k < 1 ? `blur(${(1 - k) * 3}px)` : undefined, ...style,
    }}>{w}</span>
  );
};
const mix = (a: string, b: string, k: number) => {
  const p = (h: string) => [1, 3, 5].map((i) => parseInt(h.slice(i, i + 2), 16));
  const A = p(a), B = p(b); return `rgb(${A.map((v, i) => Math.round(v + (B[i] - v) * k)).join(",")})`;
};
const TextLine: React.FC<{ line: Line; times: number[]; start: number; align?: "center" | "left"; sizes?: Record<string, React.CSSProperties> }> = ({ line, times, start, align = "center", sizes = SIZE }) => {
  const now = useNow();
  let k = start;
  return (
    <div style={{ textAlign: align, lineHeight: 1.12, margin: "4px 0" }}>
      {line.map((sp, i) => {
        const ws = words(sp.t); const st = sizes[sp.s ?? "small"];
        const el = ws.map((w, j) => <Word key={j} w={w} at={times[k + j] ?? 1e9} style={{ ...st, color: sp.s === "bar" ? "#fff" : sp.c ? COL[sp.c] ?? sp.c : st.color }} />);
        k += ws.length;
        if (sp.s === "bar") {
          const on = now >= (times[k - ws.length] ?? 1e9) - 0.02;
          return <span key={i} style={{ display: "inline-block", background: on ? (sp.c ? COL[sp.c] ?? sp.c : C.bar) : "transparent", padding: "4px 18px 8px", margin: "10px 0", borderRadius: 6 }}>{el}</span>;
        }
        return <span key={i}>{el}</span>;
      })}
    </div>
  );
};
const Sparkle: React.FC<{ size?: number }> = ({ size = 40 }) => (
  <svg width={size} height={size} viewBox="-10 -10 20 20" style={{ flex: "none", marginRight: 26, marginTop: 6 }}>
    <path d="M0,-10 C1,-2 2,-1 10,0 C2,1 1,2 0,10 C-1,2 -2,1 -10,0 C-2,-1 -1,-2 0,-10Z" fill={TH.sparkle ?? C.ink} />
  </svg>
);
const Asterisk: React.FC<{ r: number; color: string; petals?: number; rot?: number }> = ({ r, color, petals = 10, rot = 0 }) => (
  <svg width={r * 2} height={r * 2} viewBox={`${-r} ${-r} ${r * 2} ${r * 2}`} style={{ overflow: "visible" }}>
    <g transform={`rotate(${rot})`}>{Array.from({ length: petals }).map((_, i) => <rect key={i} x={-r * 0.09} y={-r} width={r * 0.18} height={r} rx={r * 0.09} fill={color} transform={`rotate(${(i * 360) / petals})`} />)}</g>
  </svg>
);
const Grid: React.FC<{ op?: number }> = ({ op = 0.5 }) => (
  <AbsoluteFill style={{ opacity: op, backgroundImage: "radial-gradient(#cfcfcf 2px, transparent 2px)", backgroundSize: "54px 54px" }} />
);
const Watermark: React.FC = () => (
  <div style={{ position: "absolute", left: 0, right: 0, top: SAFE ? 1262 : H * 0.855, display: "flex", justifyContent: "center", alignItems: "center", gap: 14, fontFamily: FONT, fontWeight: 700, fontSize: SAFE ? 30 : 40, color: C.mark }}>
    {S.watermarkLogo ? <Img src={staticFile(S.watermarkLogo)} style={{ height: 44, opacity: 0.45 }} /> : null}{S.brand}
  </div>
);

// ------------------------------------------------------------------ card (screen recording / screenshot / code-drawn terminal)
const CardView: React.FC<{ card: Card; t0: number; w?: number; h?: number; tilt?: number }> = ({ card, t0, w = 860, h = 560, tilt = 6 }) => {
  const f = useCurrentFrame(); const { fps } = useVideoConfig();
  const lf = Math.max(0, f - t0 * fps);
  const k = spring({ frame: lf, fps, config: { damping: 16, stiffness: 120 } });
  const drift = lf / fps;
  const inner = card.kind === "image" && card.src ? <Img src={staticFile(card.src)} style={{ width: "100%", height: "100%", objectFit: "cover" }} />
    : card.kind === "video" && card.src ? <OffthreadVideo src={staticFile(card.src)} muted style={{ width: "100%", height: "100%", objectFit: "cover" }} />
    : card.kind === "context" ? <ContextGrid t0={t0} title={card.title} />
    : <Terminal lines={card.lines ?? []} title={card.title} t0={t0} />;
  return (
    <div style={{ perspective: 1800, display: "flex", justifyContent: "center" }}>
      <div style={{
        width: w, height: h, borderRadius: 22, overflow: "hidden", background: "#fff",
        boxShadow: "0 30px 60px rgba(0,0,0,0.22), 0 8px 18px rgba(0,0,0,0.12)", border: "2px solid #ffffff",
        transform: `translateY(${(1 - k) * 120}px) scale(${0.92 + 0.08 * k + drift * 0.006}) rotateX(${tilt * (1 - k * 0.4)}deg) rotateY(${-tilt * 0.6 + Math.sin(drift * 0.8) * 1.2}deg)`,
        opacity: k,
      }}>{inner}</div>
    </div>
  );
};
const Terminal: React.FC<{ lines: string[]; title?: string; t0: number }> = ({ lines, title, t0 }) => {
  const now = useNow(); const el = Math.max(0, now - t0 - 0.3);
  let budget = el * 55; // characters per second typed
  return (
    <div style={{ width: "100%", height: "100%", background: "#1b1b1d", fontFamily: "'Cascadia Code','Consolas',monospace", color: "#e7e5e2", fontSize: 38, padding: 0 }}>
      <div style={{ height: 54, background: "#2a2a2d", display: "flex", alignItems: "center", padding: "0 22px", gap: 12 }}>
        {["#ff5f57", "#febc2e", "#28c840"].map((c) => <div key={c} style={{ width: 18, height: 18, borderRadius: 9, background: c }} />)}
        <div style={{ marginLeft: 18, color: "#9b9893", fontSize: 24 }}>{title ?? "terminal"}</div>
      </div>
      <div style={{ padding: "26px 30px", lineHeight: 1.45 }}>
        {lines.map((l, i) => {
          const show = l.slice(0, Math.max(0, Math.floor(budget))); budget -= l.length + 6;
          const isCmd = l.startsWith(">") || l.startsWith("$");
          const add = l.startsWith("+ "), del = l.startsWith("- "), sel = l.trimStart().startsWith("❯");
          return <div key={i} style={{ color: isCmd ? "#f0b48c" : l.startsWith("✓") ? "#7fd48a" : add ? "#a6f0b4" : del ? "#ffb0b0" : sel ? "#7fb4ff" : "#d8d5d0", background: add ? "rgba(46,160,67,0.28)" : del ? "rgba(248,81,73,0.25)" : sel ? "rgba(37,99,235,0.25)" : undefined, whiteSpace: "pre", margin: "0 -30px", padding: "0 30px" }}>{show}{show.length < l.length && show.length > 0 ? <span style={{ background: "#e7e5e2" }}>&nbsp;</span> : null}</div>;
        })}
      </div>
    </div>
  );
};

// ------------------------------------------------------------------ badge pill
const Badge: React.FC<{ b: NonNullable<Section["badge"]>; at: number; times: number[]; start: number }> = ({ b, at, times, start }) => {
  const f = useCurrentFrame(); const { fps } = useVideoConfig();
  const k = spring({ frame: Math.max(0, f - at * fps), fps, config: { damping: 14, stiffness: 140 } });
  if (f < at * fps - 1) return null;
  return (
    <div style={{ display: "flex", justifyContent: "center", transform: `translateX(${(1 - k) * 700}px)` }}>
      <div style={{ display: "flex", alignItems: "center", gap: 22, background: "#fff", borderRadius: 18, padding: "16px 30px 16px 16px", boxShadow: "0 18px 40px rgba(0,0,0,0.18)", border: "2px solid #e3e3e3" }}>
        <div style={{ width: 96, height: 96, borderRadius: 18, background: b.color ?? "#111", display: "flex", alignItems: "center", justifyContent: "center", color: "#fff", fontWeight: 800, fontSize: 56, fontFamily: FONT }}>
          {b.logo ? <Img src={staticFile(b.logo)} style={{ width: 54, height: 54 }} /> : b.glyph ?? b.name[0]}
        </div>
        <div style={{ fontFamily: FONT, fontWeight: 800, fontSize: 62, color: C.ink, letterSpacing: 0.5 }}>
          {words(b.name).map((w, i) => <Word key={i} w={w} at={Math.min(times[start + i] ?? at, at + 0.05)} style={{ fontWeight: 800 }} />)}
        </div>
      </div>
    </div>
  );
};

// ------------------------------------------------------------------ sections
const Item: React.FC<{ s: Section; times: number[]; t0: number }> = ({ s, times, t0 }) => {
  const now = useNow(); const L = sectionLines(s), st = lineStarts(s);
  const idx = (g: string) => L.map((x, i) => (x.group === g ? i : -1)).filter((i) => i >= 0);
  const headI = idx("head"), subI = idx("sub"), bulI = idx("bullet");
  const bodyAt = headI.length ? times[st[headI[0]]] - 0.05 : t0 + 1.6;
  if (now < bodyAt) {
    const oi = idx("ordinal")[0], bi = idx("badge")[0];
    return (
      <AbsoluteFill style={{ justifyContent: "center", alignItems: "center", fontFamily: FONT }}>
        <div style={{ marginTop: -120 }}>
          {oi != null ? <TextLine line={L[oi].line} times={times} start={st[oi]} /> : null}
          <div style={{ height: 30 }} />
          {bi != null && s.badge ? <Badge b={s.badge} at={times[st[bi]] - 0.1} times={times} start={st[bi]} /> : null}
        </div>
      </AbsoluteFill>
    );
  }
  return (
    <AbsoluteFill style={{ fontFamily: FONT }}>
      <div style={{ position: "absolute", top: H * 0.045, left: 60, right: 60 }}>{headI.map((i) => <TextLine key={i} line={L[i].line} times={times} start={st[i]} />)}</div>
      <div style={{ position: "absolute", top: H * 0.2, left: 0, right: 0 }}>{s.card ? <CardView card={s.card} t0={bodyAt} /> : null}</div>
      <div style={{ position: "absolute", top: H * 0.52, left: 60, right: 60 }}>
        {subI.map((i) => <TextLine key={i} line={L[i].line} times={times} start={st[i]} />)}
        <div style={{ height: 26 }} />
        {bulI.map((i) => {
          const on = now >= times[st[i]] - 0.02;
          return <div key={i} style={{ display: "flex", alignItems: "flex-start", marginLeft: 40, opacity: on ? 1 : 0, marginBottom: 14 }}><Sparkle /><div style={{ flex: 1 }}><TextLine line={L[i].line} times={times} start={st[i]} align="left" /></div></div>;
        })}
        {idx("tag").map((i) => <div key={i} style={{ marginTop: 22 }}><TextLine line={L[i].line} times={times} start={st[i]} /></div>)}
      </div>
    </AbsoluteFill>
  );
};
const Hook: React.FC<{ s: Section; times: number[]; t0: number }> = ({ s, times, t0 }) => {
  const f = useCurrentFrame(); const now = f / FPS; const L = sectionLines(s), st = lineStarts(s);
  const pop = (d: number) => spring({ frame: Math.max(0, f - (t0 + d) * FPS), fps: FPS, config: { damping: 12, stiffness: 160 } });
  return (
    <AbsoluteFill style={{ fontFamily: FONT }}>
      <Grid />
      {[[-80, -60, 260, 0], [760, -90, 230, 0.1], [-120, 1500, 280, 0.2], [800, 1460, 300, 0.15]].map(([x, y, r, d], i) => (
        <div key={i} style={{ position: "absolute", left: x, top: y, transform: `scale(${pop(d)}) rotate(${now * 20 * (i % 2 ? 1 : -1)}deg)` }}><Asterisk r={r} color={C.accent} petals={9} /></div>
      ))}
      {[[830, 650], [20, 1460]].map(([x, y], i) => (
        <div key={i} style={{ position: "absolute", left: x, top: y + Math.sin(now * 2 + i) * 12, width: 230, height: 230, borderRadius: 115, background: "#f7f7f7", boxShadow: "0 24px 50px rgba(0,0,0,0.18)", display: "flex", alignItems: "center", justifyContent: "center", transform: `scale(${pop(0.25 + i * 0.1)})` }}>
          <Asterisk r={70} color={C.accent} petals={12} rot={now * 30} />
        </div>
      ))}
      {s.card ? <div style={{ position: "absolute", top: H * 0.5, left: 0, right: 0 }}><CardView card={s.card} t0={t0} w={800} h={420} tilt={4} /></div> : null}
      <div style={{ position: "absolute", top: H * 0.165, left: 90, right: 90 }}>{L.map((x, i) => <TextLine key={i} line={x.line} times={times} start={st[i]} />)}</div>
    </AbsoluteFill>
  );
};
const Center: React.FC<{ s: Section; times: number[]; t0: number; top?: number }> = ({ s, times, t0, top = 0.3 }) => {
  const L = sectionLines(s), st = lineStarts(s); const f = useCurrentFrame();
  return <AbsoluteFill style={{ fontFamily: FONT }}>
    {s.chips ? <div style={{ position: "absolute", top: H * 0.07, left: 50, right: 50, display: "flex", flexWrap: "wrap", justifyContent: "center", gap: 18 }}>
      {s.chips.map((c, i) => { const k = spring({ frame: Math.max(0, f - (t0 + 0.1 + i * 0.12) * FPS), fps: FPS, config: { damping: 12, stiffness: 170 } });
        return <div key={i} style={{ transform: `scale(${k})`, background: "#fff", borderRadius: 16, padding: "14px 26px", boxShadow: "0 12px 28px rgba(0,0,0,0.14)", border: "2px solid #e3e3e3", fontFamily: "'Cascadia Code','Consolas',monospace", fontWeight: 700, fontSize: 46, color: COL.blue }}>{c}</div>; })}
    </div> : null}
    <div style={{ position: "absolute", top: H * top, left: 60, right: 60 }}>{L.map((x, i) => <TextLine key={i} line={x.line} times={times} start={st[i]} />)}</div>
  </AbsoluteFill>;
};
/** /context-style usage grid: coloured squares fill in by category, legend beside (code-drawn proof card). */
const ContextGrid: React.FC<{ t0: number; title?: string }> = ({ t0, title }) => {
  const now = useNow(); const el = Math.max(0, now - t0 - 0.2);
  const cats = [["System prompt", "#8a8f98", 8], ["System tools", "#8B5CF6", 14], ["MCP tools", "#06B6D4", 18], ["Memory files", "#F59E0B", 6], ["Messages", "#2563EB", 26], ["Free space", "#3a3d44", 28]] as [string, string, number][];
  const cells: string[] = []; cats.forEach(([, c, n]) => { for (let i = 0; i < n; i++) cells.push(c); });
  const shown = Math.floor(el * 70);
  return (
    <div style={{ width: "100%", height: "100%", background: "#1b1b1d", fontFamily: "'Cascadia Code','Consolas',monospace", color: "#d8d5d0" }}>
      <div style={{ height: 54, background: "#2a2a2d", display: "flex", alignItems: "center", padding: "0 22px", gap: 12 }}>
        {["#ff5f57", "#febc2e", "#28c840"].map((c) => <div key={c} style={{ width: 18, height: 18, borderRadius: 9, background: c }} />)}
        <div style={{ marginLeft: 18, color: "#9b9893", fontSize: 24 }}>{title ?? "claude"}</div>
      </div>
      <div style={{ display: "flex", padding: "24px 30px", gap: 34 }}>
        <div style={{ display: "grid", gridTemplateColumns: "repeat(10, 32px)", gap: 7 }}>
          {cells.map((c, i) => <div key={i} style={{ width: 32, height: 32, borderRadius: 6, background: i < shown ? c : "#26272b" }} />)}
        </div>
        <div style={{ fontSize: 25, lineHeight: 1.75 }}>
          <div style={{ color: "#f0b48c", marginBottom: 6 }}>&gt; /context</div>
          {cats.map(([n, c, k], i) => <div key={n} style={{ opacity: el > 0.3 + i * 0.25 ? 1 : 0 }}><span style={{ color: c }}>■</span> {n} <span style={{ color: "#8a8f98" }}>{k}%</span></div>)}
        </div>
      </div>
    </div>
  );
};
/** Word-synced header on top + a code-drawn animated scene (scenes.tsx) that can cue on spoken words. */
const norm = (w: string) => w.toLowerCase().replace(/[^\p{L}\p{N}%$]+/gu, "");
const SceneSection: React.FC<{ s: Section; times: number[]; t0: number; t1: number }> = ({ s, times, t0, t1 }) => {
  const now = useNow(); const L = sectionLines(s), st = lineStarts(s);
  const toks = L.flatMap(({ line }) => line.flatMap((sp) => words(sp.t)));
  const cue = (w: string, nth = 1) => { let n = 0; const q = norm(w); for (let i = 0; i < toks.length; i++) if (norm(toks[i]).includes(q) && ++n === nth) return (times[i] ?? t0) - t0; return 0.5; };
  const Scene = SCENES[s.scene ?? ""];
  if (SAFE) {
    // headline (static, pops in) -> visual canvas -> rolling 2-line karaoke subtitles
    const lineT = st.map((i) => times[i] ?? 1e9); let cur = 0; lineT.forEach((x, i) => { if (now >= x - 0.05) cur = i; });
    const from = Math.max(0, cur - 1);
    const DS = s.data ? DATA_SCENES[s.scene ?? ""] ?? DEPTH_SCENES[s.scene ?? ""] ?? STORY_SCENES[s.scene ?? ""] : undefined; const SS = SAFE_SCENES[s.scene ?? ""];
    // headline: arrives DOWN from oversize with a focus pull (no spring - no overshoot on type), 1 f after the cut
    const hl = arrive(now, t0 + f2s(1), { from: 1.14, blur: 9, dy: 26, dur: f2s(14), ease: E.snapSettle });
    // section transitions learned from the RR reel (colour flash cut, zoom-through, drop-in, whip; exits dive / whip / zoom),
    // timed with the measured eases: entries snapSettle/whip (most travel in the first 4 f), exits accelExit (leave at peak speed).
    const lt = now - t0, rt = t1 - now;
    const ke = s.enter ? prog(lt, 0, s.enter === "flash" ? f2s(8) : s.enter === "whip" ? f2s(9) : f2s(13), s.enter === "whip" ? E.whip : E.snapSettle) : 1;
    const kx = s.exit ? prog(-rt, -(s.exit === "dive" ? 0.45 : f2s(10)), s.exit === "dive" ? 0.45 : f2s(10), E.accelExit) : 0;
    const enterT = s.enter === "zoom" ? `scale(${logLerp(1.9, 1, ke)})` : s.enter === "drop" ? `translateY(${-(1 - ke) * 420}px)` : s.enter === "whip" ? `translateX(${(1 - ke) * 1100}px)` : "";
    const exitT = s.exit === "whip" ? `translateX(${-kx * 1100}px)` : s.exit === "zoom" ? `scale(${logLerp(1, 3.5, kx)})` : "";
    // blur is a focus pull on zooms; on whips the shutter blur (FINISH.motionBlur) does it, so no per-element smear then
    const blur = (s.enter === "zoom" ? (1 - ke) * 14 : 0) + (s.exit === "zoom" ? kx * 14 : 0) + (!FINISH.motionBlur ? (s.enter === "whip" ? (1 - ke) * 14 : 0) + (s.exit === "whip" ? kx * 14 : 0) : 0);
    const fl = s.enter === "flash" ? 1 - ke : s.exit === "dive" ? Math.max(0, (kx - 0.75) * 4) : 0;
    const cv = drift(lt, `canvas${t0.toFixed(2)}`, { pxPerSec: 7, scalePerSec: 0 }), creep = 1 + 0.06 * Math.min(1, lt / Math.max(1, t1 - t0));
    return (
      <AbsoluteFill style={{ fontFamily: FONT }}>
       <AbsoluteFill style={{ transform: `${enterT} ${exitT}`, filter: blur > 0.3 ? `blur(${blur}px)` : undefined, opacity: s.enter === "zoom" ? Math.min(1, ke * 2) : 1 }}>
        {s.kicker ? <div style={{ position: "absolute", top: ZONE.top - 2, left: ZONE.side, fontFamily: "'JetBrains Mono','Cascadia Code',Consolas,monospace", fontWeight: 600, fontSize: 30, letterSpacing: 3, color: COL.blue, opacity: Math.min(1, lt * 4) }}>{"// " + s.kicker.toUpperCase()}</div> : null}
        {s.title ? <div style={{ position: "absolute", top: ZONE.head[0] + (s.kicker ? 22 : 0), height: ZONE.head[1] - ZONE.head[0] - (s.kicker ? 22 : 0), left: ZONE.side, right: ZONE.side, display: "flex", alignItems: "center", justifyContent: s.kicker ? "flex-start" : "center", textAlign: s.kicker ? "left" : "center" }}>
          <div style={{ ...lookCss(hl), transformOrigin: s.kicker ? "0% 50%" : "50% 50%", fontSize: s.kicker ? 68 : 90, fontWeight: 900, lineHeight: s.kicker ? 1.04 : 1.1, letterSpacing: -1, color: C.ink }}>
            {s.title.map((sp, i) => <span key={i} style={{ color: sp.c ? COL[sp.c] ?? sp.c : C.ink, fontSize: sp.s === "small" || sp.s === "reg" ? 48 : sp.s === "huge" ? 108 : undefined, fontWeight: sp.s === "small" || sp.s === "reg" ? 700 : undefined, marginRight: "0.25em", display: sp.s === "small" || sp.s === "reg" ? "block" : "inline" }}>{sp.t}</span>)}
          </div></div> : null}
        <div style={{ position: "absolute", top: ZONE.canvas[0], left: 0, width: CW, height: CH,
          /* no dead frame: linear camera creep (seeded direction) + slow push, never a bob; grows upward so the canvas bottom stays off the subtitles */
          transform: `scale(${creep}) translate(${cv.x.toFixed(2)}px, ${cv.y.toFixed(2)}px)`, transformOrigin: "50% 92%" }}>
          {DS ? <DS t={now - t0} d={t1 - t0} cue={cue} data={s.exit === "dive" ? { dive: true, ...s.data } : s.data} /> : SS ? <SS t={now - t0} d={t1 - t0} cue={cue} /> : Scene ? <div style={{ transform: `scale(${CH / SH})`, transformOrigin: "50% 0", width: SW, height: SH }}><Scene t={now - t0} d={t1 - t0} cue={cue} /></div> : null}
        </div>
        <div style={{ position: "absolute", top: ZONE.subs[0] - 6, height: ZONE.subs[1] - ZONE.subs[0] + 6, left: 70, right: 120, display: "flex", flexDirection: "column", justifyContent: "center" }}>
          {L.slice(from, cur + 1).map((x, j) => <TextLine key={from + j} line={x.line} times={times} start={st[from + j]} sizes={fitSizes(x.line)} />)}
        </div>
       </AbsoluteFill>
        {fl > 0.01 ? <AbsoluteFill style={{ background: s.flash ? COL[s.flash] ?? s.flash : COL.accent, opacity: fl }} /> : null}
        {FINISH.leaks && s.enter === "flash" ? <LightLeak progress={lt / 0.75} seed={Math.round(t0 * 10)} strength={0.55} /> : null}
      </AbsoluteFill>
    );
  }
  return (
    <AbsoluteFill style={{ fontFamily: FONT }}>
      <div style={{ position: "absolute", top: H * 0.03, left: 50, right: 50 }}>{L.map((x, i) => <TextLine key={i} line={x.line} times={times} start={st[i]} />)}</div>
      <div style={{ position: "absolute", top: 470, left: 0, width: SW, height: SH,
        /* slow push-in + drift so holds never freeze (target: visible change in >= 90 % of 0.4 s windows) */
        transform: `scale(${1 + 0.05 * Math.min(1, (now - t0) / Math.max(1, t1 - t0))}) translate(${Math.sin((now - t0) * 0.9) * 6}px, ${Math.cos((now - t0) * 0.7) * 5}px)`, transformOrigin: "50% 45%" }}>{Scene ? <Scene t={now - t0} d={t1 - t0} cue={cue} /> : null}</div>
    </AbsoluteFill>
  );
};
const Cta: React.FC<{ s: Section; times: number[]; t0: number }> = ({ s, times, t0 }) => {
  const f = useCurrentFrame(); const now = f / FPS; const L = sectionLines(s), st = lineStarts(s);
  const k = spring({ frame: Math.max(0, f - t0 * FPS), fps: FPS, config: { damping: 14 } });
  return (
    <AbsoluteFill style={{ fontFamily: FONT }}>
      <Grid op={0.4} />
      <div style={{ position: "absolute", top: SAFE ? ZONE.head[0] : H * 0.07, left: 40, right: 40 }}>{L.slice(0, 2).map((x, i) => <TextLine key={i} line={x.line} times={times} start={st[i]} />)}</div>
      {s.cover ? <div style={{ position: "absolute", top: H * 0.27, left: 0, right: 0, display: "flex", justifyContent: "center", perspective: 1600 }}>
        <Img src={staticFile(s.cover)} style={{ width: 560, borderRadius: 10, boxShadow: "30px 40px 70px rgba(0,0,0,0.3)", transform: `rotateY(${-22 + Math.sin(now) * 6}deg) rotateZ(-8deg) scale(${0.8 + 0.2 * k})` }} />
      </div> : null}
      <div style={{ position: "absolute", top: H * (s.cover ? 0.62 : 0.4), left: 40, right: 40 }}>{L.slice(2).map((x, i) => <TextLine key={i} line={x.line} times={times} start={st[i + 2]} />)}</div>
    </AbsoluteFill>
  );
};
const Follow: React.FC<{ s: Section; times: number[]; t0: number }> = ({ s, times, t0 }) => {
  const f = useCurrentFrame(); const L = sectionLines(s), st = lineStarts(s);
  // the avatar arrives DOWN from 1.5x (snapSettle, the film's sign-off), never grows from zero; then a slow creep
  const av = arrive(f / FPS, t0 + 0.2, { from: 1.5, blur: 10, dur: f2s(18), ease: E.snapSettle }); const k = av.scale * (1 + 0.012 * Math.max(0, f / FPS - t0 - 0.8));
  const half = Math.ceil(L.length / 2);
  return (
    <AbsoluteFill style={{ fontFamily: FONT }}>
      <Grid op={0.45} />
      <div style={{ position: "absolute", top: SAFE ? ZONE.head[0] : H * 0.06, left: 40, right: 40 }}>{L.slice(0, half).map((x, i) => <TextLine key={i} line={x.line} times={times} start={st[i]} />)}</div>
      <div style={{ position: "absolute", top: SAFE ? 500 : H * 0.3, left: 0, right: 0, display: "flex", justifyContent: "center" }}>
        <div style={{ width: SAFE ? 320 : 380, height: SAFE ? 320 : 380, borderRadius: 190, background: "#111", color: "#fff", display: "flex", alignItems: "center", justifyContent: "center", fontWeight: 800, fontSize: 200, transform: `scale(${k})`, opacity: av.opacity, filter: av.blur > 0.25 ? `blur(${av.blur}px)` : undefined, boxShadow: "0 40px 80px rgba(0,0,0,0.25)", overflow: "hidden" }}>
          {S.brandLogo ? <Img src={staticFile(S.brandLogo)} style={{ width: "100%", height: "100%", objectFit: "cover" }} /> : S.brand.replace(/^@/, "")[0]?.toUpperCase()}
        </div>
      </div>
      <div style={{ position: "absolute", top: SAFE ? 860 : H * 0.58, left: 40, right: SAFE ? 100 : 40 }}>{L.slice(half).map((x, i) => <TextLine key={i} line={x.line} times={times} start={st[i + half]} />)}</div>
    </AbsoluteFill>
  );
};

// ------------------------------------------------------------------ root
const useInter = () => {
  const [h] = useState(() => delayRender("font"));
  useEffect(() => {
    const l = document.createElement("link"); l.rel = "stylesheet";
    l.href = "https://fonts.googleapis.com/css2?family=Inter:ital,wght@0,400;0,500;0,700;0,800;1,700&family=Noto+Sans+Devanagari:wght@500;700;800;900&display=block";
    document.head.appendChild(l);
    const done = () => continueRender(h);
    l.onload = () => Promise.all([...["500", "700", "800"].map((w) => (document as any).fonts.load(`${w} 40px Inter`)), ...["500", "700", "800", "900"].map((w) => (document as any).fonts.load(`${w} 40px 'Noto Sans Devanagari'`, "रामायण करोड़"))]).then(done, done);
    l.onerror = done; setTimeout(done, 8000);
  }, [h]);
};
/** is `now` inside a fast transition window of section i? (shutter blur costs x samples, so only there) */
const fastWindow = (i: number, now: number) => {
  const s = S.sections[i], tl = TL.sections[i]; if (!s || !tl) return false;
  const inE = s.enter && s.enter !== "flash" && now - tl.t0 < f2s(s.enter === "whip" ? 9 : 13);
  const inX = s.exit && tl.t1 - now < (s.exit === "dive" ? 0.45 : f2s(10));
  return Boolean(inE || inX);
};
export const Listicle: React.FC = () => {
  useInter();
  const now = useNow();
  const i = TL.sections.findIndex((x) => now >= x.t0 && now < x.t1);
  const s = S.sections[i]; const tl = TL.sections[i];
  return (
    <AbsoluteFill style={{ background: C.bg }}>
      <ShutterBlur active={FINISH.motionBlur && fastWindow(i, now)} samples={FINISH.samples}>
        <AbsoluteFill style={{ background: C.bg }}>
          {TH.paper ? <AbsoluteFill style={{ backgroundImage: "radial-gradient(ellipse 70% 45% at 50% 40%, rgba(255,255,255,0.85), rgba(255,255,255,0) 70%), linear-gradient(rgba(20,27,77,0.035) 2px, transparent 2px), linear-gradient(90deg, rgba(20,27,77,0.035) 2px, transparent 2px)", backgroundSize: "100% 100%, 60px 60px, 60px 60px" }} /> : null}
          {s && tl ? (s.kind === "item" ? <Item s={s} times={tl.words} t0={tl.t0} /> : s.kind === "hook" ? <Hook s={s} times={tl.words} t0={tl.t0} />
            : s.kind === "scene" ? <SceneSection s={s} times={tl.words} t0={tl.t0} t1={tl.t1} />
            : s.kind === "cta" ? <Cta s={s} times={tl.words} t0={tl.t0} /> : s.kind === "follow" ? <Follow s={s} times={tl.words} t0={tl.t0} /> : <Center s={s} times={tl.words} t0={tl.t0} />) : null}
        </AbsoluteFill>
      </ShutterBlur>
      <Vignette strength={FINISH.vignette} />
      <Grain amount={FINISH.grain} />
      <Watermark />
      <Audio src={staticFile("audio/mix.wav")} />
    </AbsoluteFill>
  );
};
