// v2: same story, timing and soundtrack as v1, characters rebuilt on the anatomical rig (rig.tsx).
import React from "react";
import { AbsoluteFill, Audio, Sequence, interpolate, staticFile, useCurrentFrame } from "remotion";
import TL from "../timeline.json";
import { Cam, Dip, Flash, Glow, Mood, bob, useStep } from "../kit";
import { CourtBg, Feather, Grain, Halo, HeroBg, Pot, SkyBg, SoilMacro } from "../art";
import { BigHand, Figure, FigureProps, INK, Mouth, STYLES, jointsOf, reach } from "./rig";

const W = 1080, H = 1920, FPS = 30;
const shot = (id: string) => TL.shots.find((s) => s.id === id)!;
const talking = (who: string, t: number) => TL.voice.some((v) => v.who === who && t >= v.t0 - 0.05 && t <= v.t1);
const flap = (f: number): Mouth => (["open", "talk2", "o", "open", "neutral", "talk2"] as Mouth[])[Math.floor(f / 3) % 6];
const blink = (f: number, seed = 0) => (f + seed) % 117 < 4;
const svg = (children: React.ReactNode, style?: React.CSSProperties) => (
  <svg width={W} height={H} viewBox={`0 0 ${W} ${H}`} style={{ position: "absolute", left: 0, top: 0, ...style }}>{children}</svg>
);
const FONT = "'Nirmala UI','Noto Sans Devanagari','Mangal',sans-serif";
const useShot = (id: string) => { const f = useStep(3); const s = shot(id); return { f, t: f / FPS, T: s.t0 + f / FPS }; };
const ground = (cx: number, cy: number, rx: number, ry = 26, op = 0.22) => <ellipse cx={cx} cy={cy} rx={rx} ry={ry} fill="#000" opacity={op} />;

// ------------------------------------------------------------------ 1 court: kneeling, pouring
const Court: React.FC = () => {
  const { f, t, T } = useShot("court");
  const br = Math.sin(f / 10) * 1.2;
  const tilt = 40 + Math.sin(f / 8) * 3;
  const fig: FigureProps = {
    x: 300, y: 1660 - 2.2 * 150, H: 150, who: "kartik", facing: 1,
    pose: { lean: 12 + br, yaw: 0.8, neck: 12, armF: [64, 92, 112], armN: [18, 62, 72], legN: [-5, -88, 0], legF: [82, 2, 90], handF: "grip", handN: "rest", toesN: true },
    face: { open: blink(f) ? 0 : 0.55, look: [0.7, 0.7], brow: 0.85, mouth: talking("k", T) ? flap(f) : "sad", tear: t > 1.2 ? ((t - 1.2) % 2.4) / 2.4 : 0 },
    lota: { tilt },
  };
  const j = jointsOf(fig);
  const lc: [number, number] = [j.handF[0], j.handF[1]];
  const sp: [number, number] = [lc[0] + Math.cos((tilt - 50) * Math.PI / 180) * 0.42 * 150, lc[1] + Math.sin((tilt - 50) * Math.PI / 180) * 0.42 * 150];
  const potX = 760, potY = 1660 - 150 * 1.15, rimY = potY - 40 * 1.15;
  const off = -f * 9;
  return (
    <Cam pct={3.2} ox={42} oy={60} drift={[-0.5, -0.9]}>
      {svg(<>
        <CourtBg light={0.35} tally={90} />
        {ground(380, 1665, 330)}
        {ground(potX, 1665, 170, 22)}
        <Figure {...fig} />
        <Pot x={potX} y={potY} s={1.15} wet={1} />
        <g fill="none" strokeLinecap="round">
          <path d={`M${sp[0]},${sp[1]} C${sp[0] + 18},${sp[1] + 60} ${potX - 30},${rimY - 120} ${potX - 25},${rimY}`} stroke="#a9dcf7" strokeWidth={12} strokeDasharray="30 12" strokeDashoffset={off} />
          <path d={`M${sp[0] + 2},${sp[1]} C${sp[0] + 20},${sp[1] + 60} ${potX - 28},${rimY - 120} ${potX - 23},${rimY}`} stroke="#fff" strokeWidth={3.5} strokeDasharray="18 26" strokeDashoffset={off} opacity={0.8} />
        </g>
        <Mood vignette={0.28} wash="#9fb0c4" washOpacity={0.12} />
      </>)}
    </Cam>
  );
};

// ------------------------------------------------------------------ 2 sky: face up, plea
const Sky: React.FC = () => {
  const { f, t, T } = useShot("sky");
  return (
    <Cam pct={4} ox={50} oy={42} drift={[0, -0.8]}>
      {svg(<>
        <SkyBg />
        <Figure x={470} y={2300} H={400} who="kartik" facing={1}
          pose={{ lean: -4, yaw: 0.45, neck: -16, armF: [8, 4, 0], armN: [-6, -4, 0], legN: [0, 0, 90], legF: [0, 0, 90] }}
          face={{ open: blink(f, 30) ? 0 : 0.75, look: [0.25, -1], brow: 1, mouth: talking("k", T) ? flap(f) : "sad", tear: (t % 1.5) / 1.5, tilt: -12 }} lw={7} />
        <Mood vignette={0.25} />
      </>)}
    </Cam>
  );
};

// ------------------------------------------------------------------ 3 dig: one index finger presses into dry soil
const Finger: React.FC<{ push: number }> = ({ push }) => {
  const sk = STYLES.kartik.skin, sh = STYLES.kartik.shade;
  return (
    <g transform={`translate(${-push * 0.5},${push})`} strokeLinejoin="round" strokeLinecap="round">
      {/* curled middle finger + knuckles behind */}
      <path d="M760,-40 C780,120 760,330 700,470 C680,520 620,520 610,470 C640,330 640,160 600,-40Z" fill={sk} stroke={INK} strokeWidth={8} />
      <path d="M700,470 C690,500 650,505 630,480" fill="none" stroke={sh} strokeWidth={6} />
      {/* index finger, long and tapered, nail visible, creases at the joints */}
      <path d="M560,-40 C600,200 580,520 520,820 C500,930 470,1080 450,1200 C440,1260 380,1262 372,1205 C380,1080 400,930 410,820 C440,560 440,260 410,-40Z" fill={sk} stroke={INK} strokeWidth={8} />
      <path d="M500,-40 C530,240 520,560 470,860 C455,960 440,1080 432,1190" fill="none" stroke={sh} strokeWidth={34} opacity={0.45} />
      <path d="M412,1150 C420,1110 455,1105 462,1150 L452,1196 C440,1215 418,1212 410,1194Z" fill="#e8c4a2" stroke={INK} strokeWidth={5} />
      <path d="M430,770 C455,780 480,780 505,768 M440,540 C468,552 500,552 528,540" fill="none" stroke={sh} strokeWidth={6} />
      <path d="M437,790 C460,800 480,798 500,790" fill="none" stroke={INK} strokeWidth={4} opacity={0.6} />
    </g>
  );
};
const Dig: React.FC = () => {
  const { f, t } = useShot("dig");
  const push = Math.min(1, t / 0.8) * 30 - (t > 1.3 ? (t - 1.3) * 120 : 0);
  return (
    <Cam pct={3} ox={45} oy={55}>
      {svg(<>
        <SoilMacro tone="brown" seed="dig" />
        <path d="M-40,0 L1120,0 L1120,330 C800,250 280,250 -40,330Z" fill="#b8613a" stroke={INK} strokeWidth={7} />
        <rect x={-40} y={230} width={1160} height={100} fill="#c26b42" stroke={INK} strokeWidth={7} />
        <path d="M-40,330 C280,290 800,290 1120,330 L1120,420 C800,380 280,380 -40,420Z" fill="#241408" opacity={0.55} />
        <Finger push={push} />
        {/* soil lip in front of the buried fingertips */}
        <path d={`M120,${1330} C300,${1260} 520,${1250} 760,${1300} C900,${1330} 1000,${1380} 1120,1400 L1120,1920 L-40,1920 L-40,1400Z`} fill="#5a3b2a" stroke={INK} strokeWidth={6} />
        <Grain w={1080} h={1920} n={60} colors={["#3a2416", "#7c533a"]} seed="dlip" r={[3, 9]} />
        {Array.from({ length: 12 }).map((_, i) => { const p = (f / 2 + i * 7) % 40; return <circle key={i} cx={460 + Math.sin(i * 5) * 120} cy={1270 + p * 6} r={5 + (i % 3) * 2} fill="#6f4a33" opacity={1 - p / 40} />; })}
        <Mood vignette={0.4} />
      </>)}
    </Cam>
  );
};

// ------------------------------------------------------------------ 4 seed (unchanged idea, kept from v1)
const Seed: React.FC = () => {
  const { f, t } = useShot("seed");
  const len = Math.min(1, 0.32 + t * 0.2);
  const glow = 0.55 + Math.sin(f / 6) * 0.15;
  return (
    <Cam pct={4.5} ox={50} oy={55}>
      {svg(<>
        <defs>
          <radialGradient id="rg2"><stop offset="0" stopColor="#d8fff0" stopOpacity={glow} /><stop offset="1" stopColor="#d8fff0" stopOpacity={0} /></radialGradient>
          <filter id="gl2"><feGaussianBlur stdDeviation="9" /></filter>
        </defs>
        <SoilMacro tone="teal" seed="seed" />
        <circle cx={540} cy={1180} r={520} fill="url(#rg2)" />
        {[
          { d: "M520,1100 C540,1180 470,1250 500,1330 C520,1390 470,1450 490,1520", w: 9 },
          { d: "M500,1330 C440,1340 400,1380 380,1440", w: 5 },
          { d: "M492,1240 C560,1250 610,1290 630,1350", w: 5 },
          { d: "M488,1450 C530,1470 560,1510 566,1560", w: 4 },
        ].map((r, i) => {
          const l = Math.max(0, Math.min(1, (len - 0.2) / 0.6 - (i ? 0.2 + i * 0.08 : 0)));
          return <g key={i}>
            <path pathLength={1} d={r.d} fill="none" stroke="#bff7e0" strokeWidth={r.w * 3} strokeDasharray={`${l} 1`} filter="url(#gl2)" opacity={0.7} />
            <path pathLength={1} d={r.d} fill="none" stroke="#f7fff9" strokeWidth={r.w} strokeLinecap="round" strokeDasharray={`${l} 1`} />
          </g>;
        })}
        <g transform="translate(520,1010) rotate(-10)">
          <path d="M0,-86 C58,-70 66,0 36,58 C22,84 8,96 0,100 C-8,96 -22,84 -36,58 C-66,0 -58,-70 0,-86Z" fill="#e2b968" stroke={INK} strokeWidth={7} strokeLinejoin="round" />
          <path d="M22,-76 C56,-40 50,30 22,80 C46,30 40,-40 22,-76Z" fill="#b98f45" opacity={0.7} />
          <path d="M-28,-50 C-42,-18 -38,16 -24,40" fill="none" stroke="#f7e3a4" strokeWidth={8} strokeLinecap="round" opacity={0.85} />
        </g>
        {Array.from({ length: 22 }).map((_, i) => <circle key={i} cx={(i * 211 + f * 1.5) % 1080} cy={(i * 331 + f * 2.4) % 1920} r={3 + (i % 4)} fill="#a8f0d8" opacity={0.25} />)}
        <Mood vignette={0.5} />
      </>)}
    </Cam>
  );
};

// ------------------------------------------------------------------ 5 stranger two-shot
const Step: React.FC = () => (
  <g>
    <path d="M660,1430 L1100,1430 L1100,1560 L660,1560Z" fill="#b5a68f" stroke={INK} strokeWidth={7} />
    <path d="M660,1430 L1100,1430 L1100,1452 L660,1452Z" fill="#d2c4ab" />
    <path d="M760,1470 l40,-8 M900,1500 l50,6" stroke="#8d7f69" strokeWidth={4} />
  </g>
);
const elderOnStep = (f: number, T: number, x: number, y: number, Hh: number, extra?: Partial<FigureProps>): FigureProps => ({
  x, y, H: Hh, who: "elder", facing: -1, stick: true,
  pose: { lean: 8, yaw: 0.72, neck: 6, armF: [28, 72, 88], armN: [14, 58, 80], legN: [84, 3, 90], legF: [80, -2, 90], handF: "rest", handN: "rest" },
  face: { open: blink(f, 50) ? 0 : 0.8, look: [0.6, 0.5], brow: 0.1, mouth: talking("s", T) ? flap(f) : "smile" },
  ...extra,
});
const Stranger: React.FC = () => {
  const { f, t, T } = useShot("stranger");
  const appear = interpolate(t, [0.5, 0.9], [0, 1], { extrapolateLeft: "clamp", extrapolateRight: "clamp" });
  const featherY = interpolate(t, [0, 1.6], [-200, 1580], { extrapolateRight: "clamp" });
  return (
    <Cam pct={1.6} ox={50} oy={62} drift={[0.3, -0.7]}>
      {svg(<>
        <CourtBg light={0.45} tally={90} />
        <Step />
        {ground(300, 1712, 230)}
        <Pot x={560} y={1712 - 150 * 0.72} s={0.72} wet={1} />
        <Figure x={280} y={1712 - 0.58 * 118} H={118} who="kartik" facing={1}
          pose={{ lean: 6, yaw: 0.8, neck: 4, armF: [22, 70, 88], armN: [14, 62, 82], legN: [80, -92, -88], legF: [78, -94, -88], handF: "rest", handN: "rest" }}
          face={{ open: blink(f) ? 0 : 1, look: [1, -0.2], brow: 0.45, mouth: talking("k", T) ? flap(f) : "o" }} />
        <g opacity={appear}>
          {ground(860, 1712, 150, 20)}
          <Figure {...elderOnStep(f, T, 880, 1430 - 0.12 * 118, 118)} />
        </g>
        {t < 1.8 ? <Feather x={640} y={featherY} s={0.3} rot={-30 + Math.sin(f / 5) * 20} /> : null}
        <Mood vignette={0.25} />
      </>)}
      <Dip dur={shot("stranger").dur} inF={9} />
    </Cam>
  );
};

// ------------------------------------------------------------------ 6 close-ups: elder speaks, Kartik reacts
const Smile: React.FC = () => {
  const { f, t, T } = useShot("smile");
  const blur: React.CSSProperties = { filter: "blur(12px)" };
  if (t < 3.05) {
    return (
      <Cam pct={2.2} ox={50} oy={40}>
        {svg(<CourtBg dawn={1} light={0.8} tally={90} />, blur)}
        {svg(<>
          <Figure {...elderOnStep(f, T, 640, 2350, 360, { lw: 6.5 })} face={{ open: blink(f, 50) ? 0 : 0.8, look: [0.2, 0.6], brow: 0, mouth: talking("s", T) ? flap(f) : "smile" }} />
          <Mood vignette={0.3} wash="#ffd9a0" washOpacity={0.12} />
        </>)}
      </Cam>
    );
  }
  return (
    <Cam pct={2.8} ox={50} oy={42} drift={[0, -0.6]}>
      {svg(<CourtBg dawn={1} light={0.6} tally={90} />, blur)}
      {svg(<>
        <Figure x={470} y={2330} H={380} who="kartik" facing={1} lw={6.5}
          pose={{ lean: 2, yaw: 0.55, neck: 4, armF: [10, 6, 0], armN: [-6, -4, 0], legN: [0, 0, 90], legF: [0, 0, 90] }}
          face={{ open: blink(f) ? 0 : 1, look: [0.8, 0], brow: 0.55, mouth: talking("k", T) ? flap(f) : "o", tilt: 4 }} />
        <Mood vignette={0.3} />
      </>)}
    </Cam>
  );
};

// ------------------------------------------------------------------ 7 reveal
const Hero: React.FC = () => {
  const { f, t, T } = useShot("hero");
  const sc = interpolate(t, [0.1, 1.1], [0.45, 1], { extrapolateLeft: "clamp", extrapolateRight: "clamp" });
  const by = bob(f, 22, 3.2);
  return (
    <Cam pct={1.4} ox={50} oy={36} drift={[0, -0.5]}>
      {svg(<>
        <HeroBg t={t} />
        <Halo x={545} y={505 + by} r={300 * sc} rot={t * 6} op={sc} />
        <Glow x={545} y={505} r={540} color="#f1fff8" pulse={0.05} />
        <Figure x={530} y={1010 + by} H={150} who="krishna" facing={1} garland flute lw={4.6} sway={Math.sin(f / 8) * 3}
          pose={{ lean: -2, yaw: 0.22, neck: -4, armN: [-42, -168, 178], armF: [16, 62, 96], legN: [-3, 1, 90], legF: [6, -3, 92], handN: "bless", handF: "grip" }}
          face={{ open: blink(f, 70) ? 0 : 0.62, look: [0, 0.4], brow: -0.1, mouth: talking("g", T) ? flap(f) : "smile" }} />
        {Array.from({ length: 18 }).map((_, i) => { const y = 1900 - ((f * (3 + (i % 4)) + i * 150) % 2000); const x = (i * 197 + Math.sin(f / 12 + i) * 40) % 1080; return <ellipse key={i} cx={x} cy={y} rx={9} ry={5} fill={i % 2 ? "#ffb21e" : "#ff7a1a"} opacity={0.8} transform={`rotate(${f * 4 + i * 30} ${x} ${y})`} />; })}
        <Mood vignette={0.2} />
      </>)}
      <Flash at={0} len={5} />
    </Cam>
  );
};

// ------------------------------------------------------------------ 8 tears: Krishna kneels, hand on his head; Kartik with folded hands
const Tears: React.FC = () => {
  const { f, t, T } = useShot("tears");
  const reachK = interpolate(t, [0.3, 1.5], [0, 1], { extrapolateLeft: "clamp", extrapolateRight: "clamp" });
  const kart: FigureProps = {
    x: 330, y: 1735 - 0.58 * 132, H: 132, who: "kartik", facing: 1, lw: 4.4,
    pose: { lean: 4, yaw: 0.78, neck: -8, armF: [28, 150, 168], armN: [22, 152, 170], legN: [80, -92, -88], legF: [78, -94, -88], handF: "open", handN: "open" },
    face: { open: blink(f) ? 0 : 0.85, look: [0.9, -0.5], brow: 0.75, mouth: t < 1 ? "sad" : t < 3.4 ? "smileOpen" : "smile", tear: (t * 0.8) % 1, tilt: -6 },
  };
  const kh = jointsOf(kart).head;
  const kp: FigureProps = {
    x: 800, y: 1735 - 2.2 * 132, H: 132, who: "krishna", facing: -1, lw: 4.4, garland: true, stole: false, sway: Math.sin(f / 9) * 2,
    pose: { lean: 12, yaw: 0.7, neck: 12, armN: [32, 78, 95], armF: [40, 80, 100], legN: [-5, -88, 0], legF: [82, 2, 90], handN: "rest", handF: "open", toesN: true },
    face: { open: blink(f, 20) ? 0 : 0.6, look: [0.8, 0.4], brow: 0, mouth: talking("g", T) ? flap(f) : "smile", tilt: 4 },
  };
  const target: [number, number] = [kh[0] + 0.62 * 132, kh[1] - 0.6 * 132];
  const rest: [number, number] = [kp.x - 1.6 * 132, kp.y - 0.4 * 132];
  const goal: [number, number] = [rest[0] + (target[0] - rest[0]) * reachK, rest[1] + (target[1] - rest[1]) * reachK];
  const [u, fo] = reach(kp, "F", goal, -1);
  kp.pose = { ...kp.pose, armF: [u, fo, 100 - 25 * reachK] };
  return (
    <Cam pct={1.1} ox={40} oy={50} drift={[0.3, -0.4]}>
      {svg(<>
        <CourtBg dawn={1} light={0.9} tally={90} />
        {ground(540, 1735, 460)}
        <Pot x={545} y={1735 - 150 * 0.6} s={0.6} wet={1} />
        <Figure {...kart} />
        <Figure {...kp} />
        <Mood vignette={0.25} wash="#ffd48a" washOpacity={0.15} />
      </>)}
    </Cam>
  );
};

// ------------------------------------------------------------------ 9 sprout + closing line
const Sprout: React.FC = () => {
  const { f, t, T } = useShot("sprout");
  const grow = interpolate(t, [0.7, 2.4], [0, 1], { extrapolateLeft: "clamp", extrapolateRight: "clamp" });
  const text = interpolate(T, [39.9, 40.5], [0, 1], { extrapolateLeft: "clamp", extrapolateRight: "clamp" });
  return (
    <Cam pct={1.6} ox={58} oy={60} drift={[-0.4, -0.5]}>
      {svg(<>
        <defs><linearGradient id="dw2" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stopColor="#ffe3a1" /><stop offset="0.55" stopColor="#ffc87a" /><stop offset="1" stopColor="#f08f55" /></linearGradient></defs>
        <rect width={W} height={H} fill="url(#dw2)" />
        <Glow x={700} y={900} r={620} color="#fff6d2" pulse={0.06} />
        {[0, 1, 2, 3, 4].map((i) => <path key={i} d={`M660,-50 L740,-50 L${200 + i * 170},1500 L${120 + i * 170},1500Z`} fill="#fff4cc" opacity={0.09} />)}
        <path d="M0,1280 C260,1240 760,1240 1080,1280 L1080,1920 L0,1920Z" fill="#8c5d36" stroke={INK} strokeWidth={7} />
        <Grain w={1080} h={1920} n={120} colors={["#6a4528", "#b98350"]} seed="spg" r={[4, 16]} />
        <Feather x={300} y={1330} s={1.35} rot={-72} />
        <g transform="translate(700,1290)">
          <path d={`M0,0 C0,${-70 * grow} 10,${-150 * grow} 4,${-250 * grow}`} fill="none" stroke={INK} strokeWidth={26} strokeLinecap="round" />
          <path d={`M0,0 C0,${-70 * grow} 10,${-150 * grow} 4,${-250 * grow}`} fill="none" stroke="#2f8c4a" strokeWidth={16} strokeLinecap="round" />
          <g transform={`translate(4,${-250 * grow}) scale(${grow * 2.3})`}>
            <path d="M0,0 C-70,-26 -92,18 -64,48 C-30,40 -2,22 0,0Z" fill="#53c46a" stroke={INK} strokeWidth={5} />
            <path d="M0,0 C74,-34 96,14 66,46 C30,38 4,20 0,0Z" fill="#74d681" stroke={INK} strokeWidth={5} />
          </g>
        </g>
        {/* a single tear falls and lands beside the sprout */}
        {(() => { const k = interpolate(t, [1.2, 1.9], [0, 1], { extrapolateLeft: "clamp", extrapolateRight: "clamp" }); const y = -60 + k * 1340; return k < 1 ? <path d={`M640,${y} q-22,40 0,62 q22,-22 0,-62z`} fill="#cfefff" stroke={INK} strokeWidth={4} /> : <g opacity={Math.max(0, 1 - (t - 1.9) * 1.5)}><ellipse cx={640} cy={1288} rx={46} ry={9} fill="none" stroke="#cfefff" strokeWidth={4} /><ellipse cx={640} cy={1288} rx={24} ry={5} fill="#3d2415" opacity={0.6} /></g>; })()}
        {Array.from({ length: 20 }).map((_, i) => { const y = 1500 - ((f * (1 + (i % 3)) + i * 90) % 1500); return <circle key={i} cx={(i * 173 + 60) % 1080} cy={y} r={4 + (i % 3) * 2} fill="#fff4b8" opacity={0.7} />; })}
        <Mood vignette={0.3} />
        <g opacity={text} fontFamily={FONT} fontWeight={800} fontSize={62} textAnchor="middle" fill="#fff6dc" stroke={INK} strokeWidth={10} style={{ paintOrder: "stroke" }}>
          <text x={540} y={1720}>हर अंधेरा तोड़ने नहीं आता...</text>
          <text x={540} y={1810}>कभी-कभी जड़ें देने आता है।</text>
        </g>
      </>)}
      <Flash at={0} len={8} color="#fff1c0" />
    </Cam>
  );
};

const End: React.FC = () => {
  const f = useCurrentFrame();
  const a = interpolate(f, [8, 22, 56, 70], [0, 1, 1, 0], { extrapolateLeft: "clamp", extrapolateRight: "clamp" });
  return (
    <AbsoluteFill style={{ background: "#000" }}>
      {svg(<g opacity={a}>
        <Feather x={540} y={1000} s={0.55} rot={0} />
        <text x={540} y={1130} textAnchor="middle" fontFamily={FONT} fontWeight={800} fontSize={80} fill="#f6cf4a">जय श्रीकृष्ण</text>
      </g>)}
    </AbsoluteFill>
  );
};

const SCENES: Record<string, React.FC> = { court: Court, sky: Sky, dig: Dig, seed: Seed, stranger: Stranger, smile: Smile, hero: Hero, tears: Tears, sprout: Sprout, black: End };
void STYLES;
export const ShortV2: React.FC = () => (
  <AbsoluteFill style={{ background: "#000" }}>
    {TL.shots.map((s) => { const C = SCENES[s.id]; return <Sequence key={s.id} from={s.from_} durationInFrames={s.dur}><C /></Sequence>; })}
    <Audio src={staticFile("audio/mix.wav")} />
  </AbsoluteFill>
);
