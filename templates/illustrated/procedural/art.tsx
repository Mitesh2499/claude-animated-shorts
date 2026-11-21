// Procedural flat-cel art (SVG) in the "illustrated parallax" style: ink outline, 2-tone shading, hard-edged shadows.
// All coordinates are px on the 1080x1920 canvas unless a component says it uses local units.
import React from "react";
import { random } from "remotion";

export const INK = "#2a1c19";
export const SW = 7;
type XY = [number, number];

/** Limb with ink outline: polyline of points, width w. */
export const Limb: React.FC<{ pts: XY[]; w: number; c: string; hand?: boolean; handC?: string; shade?: string }> = ({ pts, w, c, hand, handC, shade }) => {
  const d = pts.map((p, i) => `${i ? "L" : "M"}${p[0]},${p[1]}`).join(" ");
  const last = pts[pts.length - 1];
  return (
    <g strokeLinecap="round" strokeLinejoin="round" fill="none">
      <path d={d} stroke={INK} strokeWidth={w + SW * 2} />
      <path d={d} stroke={c} strokeWidth={w} />
      {shade ? <path d={d} stroke={shade} strokeWidth={w * 0.28} opacity={0.5} transform="translate(5,6)" /> : null}
      {hand ? <circle cx={last[0]} cy={last[1]} r={w * 0.62} fill={handC ?? c} stroke={INK} strokeWidth={SW} /> : null}
    </g>
  );
};

export type Mouth = "closed" | "open" | "smile" | "sad" | "o" | "grin";
export type Eyes = "open" | "closed" | "half" | "wide";
export type HeadP = {
  x: number; y: number; s?: number; rot?: number; skin: string; shade: string;
  hair?: "short" | "bald" | "krishna" | "turban"; hairC?: string; beard?: boolean; tilak?: boolean;
  eyes?: Eyes; look?: XY; brow?: number; mouth?: Mouth; tear?: number; flip?: boolean; blush?: boolean;
};

/** Head ~200 px wide at s=1. */
export const Head: React.FC<HeadP> = ({
  x, y, s = 1, rot = 0, skin, shade, hair = "short", hairC = "#1c1620", beard, tilak, eyes = "open", look = [0, 0], brow = 0, mouth = "closed", tear = 0, flip, blush,
}) => {
  const face = "M-100,-10 C-100,-92 -56,-122 0,-122 C56,-122 100,-92 100,-10 C100,72 56,120 0,124 C-56,120 -100,72 -100,-10 Z";
  const inner = -48 - brow * 14, outer = -48 + brow * 6;
  const eye = (sx: number) => {
    const ex = sx * 42;
    if (eyes === "closed") return <path d={`M${ex - 24},-2 Q${ex},${12} ${ex + 24},-2`} fill="none" stroke={INK} strokeWidth={6} strokeLinecap="round" />;
    const ry = eyes === "half" ? 11 : eyes === "wide" ? 27 : 20;
    return (
      <g>
        <ellipse cx={ex} cy={-4} rx={eyes === "wide" ? 28 : 25} ry={ry} fill="#fffdf6" stroke={INK} strokeWidth={5} />
        <circle cx={ex + look[0] * 9} cy={-4 + look[1] * Math.min(8, ry - 8)} r={eyes === "wide" ? 8 : 10.5} fill="#1b1210" />
        <circle cx={ex + look[0] * 9 + 3} cy={-8 + look[1] * Math.min(8, ry - 8)} r={3} fill="#fff" />
        {eyes === "half" ? <path d={`M${ex - 26},-6 Q${ex},-18 ${ex + 26},-6`} fill={skin} stroke={INK} strokeWidth={5} /> : null}
      </g>
    );
  };
  const brows = (sx: number) => (
    <path d={`M${sx * (sx > 0 ? 62 : 62) - (sx > 0 ? 0 : 0)},${outer} L${sx * 18},${inner}`} stroke={INK} strokeWidth={9} strokeLinecap="round" fill="none" />
  );
  const mouthEl = {
    closed: <path d="M-24,66 Q0,72 24,66" fill="none" stroke={INK} strokeWidth={6} strokeLinecap="round" />,
    smile: <path d="M-32,58 Q0,92 32,58" fill="none" stroke={INK} strokeWidth={6} strokeLinecap="round" />,
    sad: <path d="M-26,74 Q0,52 26,74" fill="none" stroke={INK} strokeWidth={6} strokeLinecap="round" />,
    open: <g><ellipse cx={0} cy={68} rx={17} ry={13} fill="#6b2230" stroke={INK} strokeWidth={5} /><ellipse cx={0} cy={74} rx={9} ry={5} fill="#c4566a" /></g>,
    o: <ellipse cx={0} cy={68} rx={10} ry={13} fill="#6b2230" stroke={INK} strokeWidth={5} />,
    grin: <g><path d="M-34,56 Q0,98 34,56 Z" fill="#fffdf6" stroke={INK} strokeWidth={5} strokeLinejoin="round" /></g>,
  }[mouth];
  return (
    <g transform={`translate(${x},${y}) rotate(${rot}) scale(${flip ? -s : s},${s})`}>
      {hair === "krishna" ? <path d="M-118,-30 C-140,-150 -80,-190 0,-190 C80,-190 140,-150 118,-30 C140,60 130,170 100,230 C60,160 70,60 60,-30 L-60,-30 C-70,60 -60,160 -100,230 C-130,170 -140,60 -118,-30 Z" fill={hairC} stroke={INK} strokeWidth={SW} strokeLinejoin="round" /> : null}
      <ellipse cx={-101} cy={4} rx={16} ry={26} fill={skin} stroke={INK} strokeWidth={SW} />
      <ellipse cx={101} cy={4} rx={16} ry={26} fill={skin} stroke={INK} strokeWidth={SW} />
      <path d={face} fill={skin} stroke={INK} strokeWidth={SW} strokeLinejoin="round" />
      <path d="M32,-118 C84,-100 102,-52 100,-6 C100,72 58,118 0,124 C40,92 62,42 58,-20 C56,-70 48,-100 32,-118Z" fill={shade} opacity={0.55} />
      {blush ? <ellipse cx={-62} cy={38} rx={22} ry={12} fill="#e0705a" opacity={0.35} /> : null}
      {beard ? <g><path d="M-98,28 C-94,112 -46,152 0,164 C46,152 94,112 98,28 C72,72 40,84 0,82 C-40,84 -72,72 -98,28Z" fill="#f4efe4" stroke={INK} strokeWidth={SW} strokeLinejoin="round" /><path d="M-40,52 Q0,38 40,52 Q0,66 -40,52Z" fill="#f4efe4" stroke={INK} strokeWidth={5} /></g> : null}
      {eye(-1)}{eye(1)}
      {brows(-1)}{brows(1)}
      <path d="M0,10 Q12,36 -2,40" fill="none" stroke={INK} strokeWidth={5} strokeLinecap="round" />
      {mouth === "smile" || mouth === "grin" ? null : null}
      <g transform={beard ? "translate(0,10)" : undefined}>{mouthEl}</g>
      {tear > 0 ? <g><path d={`M-58,${14 + tear * 80} q-9,-16 0,-34 q9,18 0,34z`} fill="#bfe6ff" stroke={INK} strokeWidth={3} opacity={Math.min(1, tear * 3)} /></g> : null}
      {tilak ? <path d="M-14,-96 L-4,-60 M14,-96 L4,-60" stroke="#c4271f" strokeWidth={9} strokeLinecap="round" /> : null}
      {hair === "short" ? <g><path d="M-106,-18 C-126,-130 -58,-170 4,-168 C74,-168 128,-120 106,-18 C98,-72 66,-100 14,-96 C-44,-100 -90,-74 -106,-18 Z" fill={hairC} stroke={INK} strokeWidth={SW} strokeLinejoin="round" /><path d="M-60,-100 C-40,-130 0,-140 30,-120" fill="none" stroke="#3a3040" strokeWidth={6} strokeLinecap="round" /></g> : null}
      {hair === "turban" ? <g><path d="M-112,-24 C-126,-140 -56,-186 2,-184 C66,-184 132,-140 112,-24 C84,-76 -84,-76 -112,-24 Z" fill="#b9ad9b" stroke={INK} strokeWidth={SW} strokeLinejoin="round" /><path d="M-90,-70 C-30,-110 40,-108 90,-70 M-84,-100 C-30,-138 40,-136 82,-100" fill="none" stroke="#8d8272" strokeWidth={6} /></g> : null}
      {hair === "krishna" ? <g>
        <path d="M-108,-26 C-122,-140 -60,-168 0,-168 C60,-168 122,-140 108,-26 C84,-78 -84,-78 -108,-26Z" fill={hairC} stroke={INK} strokeWidth={SW} strokeLinejoin="round" />
        <path d="M-112,-72 Q0,-110 112,-72 L110,-96 Q0,-134 -110,-96 Z" fill="#f2c230" stroke={INK} strokeWidth={6} strokeLinejoin="round" />
        <g transform="translate(22,-150) rotate(14)">
          <path d="M0,0 C-6,-60 -8,-120 0,-190" fill="none" stroke="#2c6b3a" strokeWidth={7} strokeLinecap="round" />
          <path d="M0,-70 C-62,-110 -50,-210 0,-250 C50,-210 62,-110 0,-70Z" fill="#2f9460" stroke={INK} strokeWidth={6} />
          <ellipse cx={0} cy={-150} rx={26} ry={36} fill="#1f56b8" stroke={INK} strokeWidth={5} />
          <ellipse cx={0} cy={-150} rx={12} ry={20} fill="#29b0b8" />
          <ellipse cx={0} cy={-148} rx={5} ry={9} fill="#f2c230" />
        </g>
      </g> : null}
    </g>
  );
};

// ---------------------------------------------------------------- bodies (local origin: ground under hips; +x = facing right)
const KURTA = "#7d8da3", KURTA_S = "#5f6f87", PANTS = "#5a4840", PANTS_S = "#43342f";
export const SKIN_K = "#c68a5c", SKIN_KS = "#a56d46";

export const KartikBody: React.FC<{ head: Omit<HeadP, "x" | "y" | "skin" | "shade">; lotaTilt?: number; lean?: number; armUp?: boolean; arm?: "pour" | "rest" | "hug" | "cup" }> = ({ head, lotaTilt = 0, lean = 6, arm = "pour" }) => (
  <g>
    <path d="M-175,0 C-178,-110 -112,-196 -58,-206 L112,-206 C176,-196 196,-116 186,0 Z" fill={PANTS} stroke={INK} strokeWidth={SW} strokeLinejoin="round" />
    <path d="M60,-200 C150,-190 186,-120 182,-10 L120,0 C130,-90 100,-150 60,-200Z" fill={PANTS_S} opacity={0.6} />
    <ellipse cx={-120} cy={-12} rx={58} ry={20} fill={SKIN_K} stroke={INK} strokeWidth={SW} />
    <g transform={`rotate(${lean} 0 -200)`}>
      <path d="M-98,-196 C-122,-330 -100,-430 -52,-470 L76,-470 C122,-430 132,-330 108,-196 Z" fill={KURTA} stroke={INK} strokeWidth={SW} strokeLinejoin="round" />
      <path d="M40,-466 C100,-420 118,-320 104,-200 L60,-200 C72,-300 62,-400 40,-466Z" fill={KURTA_S} opacity={0.7} />
      <path d="M-20,-470 L8,-430 L36,-470" fill="none" stroke={INK} strokeWidth={6} strokeLinejoin="round" />
      <rect x={-24} y={-520} width={52} height={64} rx={14} fill={SKIN_K} stroke={INK} strokeWidth={SW} />
      {/* rest arm */}
      {arm === "cup" ? null : <Limb pts={[[-70, -440], [-130, -320], [-60, -230]]} w={42} c={SKIN_K} hand shade={SKIN_KS} />}
      {arm === "pour" ? <>
        <Limb pts={[[66, -444], [170, -380], [250, -440]]} w={42} c={SKIN_K} hand shade={SKIN_KS} />
        <path d={`M62,-450 L120,-420 L90,-340 L52,-380Z`} fill={KURTA} stroke={INK} strokeWidth={SW} strokeLinejoin="round" />
        <g transform={`translate(292,-452) rotate(${lotaTilt})`}>
          <path d="M-46,-34 L46,-34 L56,40 C50,64 -50,64 -56,40Z" fill="#c9d1d8" stroke={INK} strokeWidth={SW} strokeLinejoin="round" />
          <path d="M-46,-34 L-30,-52 L30,-52 L46,-34Z" fill="#aab4bd" stroke={INK} strokeWidth={SW} strokeLinejoin="round" />
          <path d="M14,-34 L36,60 C22,64 8,60 4,40Z" fill="#9aa5ae" opacity={0.6} />
        </g></> : null}
      {arm === "rest" ? <Limb pts={[[66, -444], [140, -330], [80, -230]]} w={42} c={SKIN_K} hand shade={SKIN_KS} /> : null}
      <Head x={10} y={-600} s={1} {...head} skin={SKIN_K} shade={SKIN_KS} />
    </g>
  </g>
);

export const OldMan: React.FC<{ head: Omit<HeadP, "x" | "y" | "skin" | "shade"> }> = ({ head }) => (
  <g>
    <ellipse cx={0} cy={-8} rx={230} ry={36} fill="#8a8c92" stroke={INK} strokeWidth={SW} />
    <path d="M-210,-6 C-220,-190 -140,-390 0,-410 C140,-390 220,-190 210,-6 Z" fill="#9a9ca4" stroke={INK} strokeWidth={SW} strokeLinejoin="round" />
    <path d="M60,-400 C170,-370 212,-190 208,-8 L120,-6 C140,-180 110,-320 60,-400Z" fill="#767881" opacity={0.7} />
    <path d="M-90,-410 C-60,-300 -50,-200 -70,-10" fill="none" stroke="#767881" strokeWidth={6} />
    <path d="M-60,-120 Q0,-150 70,-120 L84,-40 Q0,-20 -74,-40Z" fill="#c0553c" stroke={INK} strokeWidth={SW} strokeLinejoin="round" />
    <Limb pts={[[-70, -250], [-110, -130], [-30, -100]]} w={36} c="#c79468" hand shade="#a67649" />
    <Limb pts={[[70, -250], [110, -130], [30, -100]]} w={36} c="#c79468" hand shade="#a67649" />
    <Head x={0} y={-500} s={1} {...head} skin="#c99a6c" shade="#a67649" hair="turban" beard />
  </g>
);

const BLUE = "#4aa3df", BLUE_S = "#2f7fb8", GOLD = "#f0bd22", GOLD_S = "#c08f10", CRIM = "#b3173a";
/** Krishna: origin at belly. Head at y=-330. kneel => legs folded dome. */
export const Krishna: React.FC<{ head: Omit<HeadP, "x" | "y" | "skin" | "shade">; sway?: number; kneel?: boolean; bless?: boolean; flute?: boolean }> = ({ head, sway = 0, kneel, bless = true, flute = true }) => (
  <g>
    {/* sash tail */}
    <path d={`M60,10 C140,${30 + sway} 200,${70 - sway} 250,${130 + sway * 2} C190,${96} 130,${80} 70,56Z`} fill={CRIM} stroke={INK} strokeWidth={SW} strokeLinejoin="round" />
    {kneel ? (
      <path d="M-190,380 C-210,200 -150,40 -110,8 L110,8 C150,40 210,200 190,380 Z" fill={GOLD} stroke={INK} strokeWidth={SW} strokeLinejoin="round" />
    ) : (
      <g>
        <path d="M-120,8 C-170,120 -150,300 -120,392 L-26,392 C-30,260 -20,120 0,60 C20,120 30,260 26,392 L120,392 C150,300 170,120 120,8Z" fill={GOLD} stroke={INK} strokeWidth={SW} strokeLinejoin="round" />
        <path d="M0,60 C20,120 30,260 26,392 L120,392 C150,300 170,120 120,8 L60,8Z" fill={GOLD_S} opacity={0.5} />
        <ellipse cx={-72} cy={410} rx={42} ry={16} fill={BLUE} stroke={INK} strokeWidth={SW} />
        <ellipse cx={72} cy={410} rx={42} ry={16} fill={BLUE} stroke={INK} strokeWidth={SW} />
        <ellipse cx={-72} cy={388} rx={44} ry={9} fill={GOLD} stroke={INK} strokeWidth={5} />
        <ellipse cx={72} cy={388} rx={44} ry={9} fill={GOLD} stroke={INK} strokeWidth={5} />
      </g>
    )}
    <path d="M-124,-244 C-156,-120 -116,-10 -104,12 L104,12 C116,-10 156,-120 124,-244 Z" fill={BLUE} stroke={INK} strokeWidth={SW} strokeLinejoin="round" />
    <path d="M50,-240 C120,-200 140,-100 106,10 L60,10 C84,-90 70,-190 50,-240Z" fill={BLUE_S} opacity={0.7} />
    <path d="M-60,-150 Q0,-120 60,-150 M-30,-100 Q0,-88 30,-100" fill="none" stroke={BLUE_S} strokeWidth={6} strokeLinecap="round" />
    <path d="M-104,-12 L104,-12 L108,22 L-108,22Z" fill={CRIM} stroke={INK} strokeWidth={SW} strokeLinejoin="round" />
    <path d="M-86,-250 C-60,-200 60,-200 86,-250" fill="none" stroke={GOLD} strokeWidth={13} strokeLinecap="round" />
    <path d="M-86,-250 C-60,-200 60,-200 86,-250" fill="none" stroke={INK} strokeWidth={3} />
    <circle cx={0} cy={-206} r={14} fill="#e6322c" stroke={INK} strokeWidth={4} />
    <rect x={-26} y={-300} width={52} height={64} rx={14} fill={BLUE} stroke={INK} strokeWidth={SW} />
    {/* arms */}
    {bless ? <Limb pts={[[-112, -226], [-220, -170], [-236, -300]]} w={44} c={BLUE} hand shade={BLUE_S} /> : <Limb pts={[[-112, -226], [-170, -120], [-110, -30]]} w={44} c={BLUE} hand shade={BLUE_S} />}
    {flute ? <g>
      <Limb pts={[[112, -226], [196, -126], [110, -62]]} w={44} c={BLUE} hand shade={BLUE_S} />
      <path d="M-30,-40 L230,-120" stroke={INK} strokeWidth={24} strokeLinecap="round" />
      <path d="M-30,-40 L230,-120" stroke="#e7b85a" strokeWidth={14} strokeLinecap="round" />
      <circle cx={70} cy={-70} r={5} fill={INK} /><circle cx={110} cy={-82} r={5} fill={INK} /><circle cx={150} cy={-95} r={5} fill={INK} />
    </g> : <Limb pts={[[112, -226], [150, -110], [90, -30]]} w={44} c={BLUE} hand shade={BLUE_S} />}
    {[-1, 1].map((sx) => <path key={sx} d={`M${sx * 112},-196 l${sx * 4},50`} stroke={GOLD} strokeWidth={22} strokeLinecap="round" />)}
    <Head x={0} y={-330} s={1} {...head} skin={BLUE} shade={BLUE_S} hair="krishna" hairC="#1c1c24" tilak={false} />
  </g>
);

// ---------------------------------------------------------------- props
export const Pot: React.FC<{ x: number; y: number; s?: number; wet?: number; sprout?: number }> = ({ x, y, s = 1, wet = 0, sprout = 0 }) => (
  <g transform={`translate(${x},${y}) scale(${s})`}>
    <ellipse cx={0} cy={140} rx={150} ry={22} fill="#000" opacity={0.18} />
    <path d="M-120,-20 L120,-20 L96,130 C90,150 -90,150 -96,130Z" fill="#b8613a" stroke={INK} strokeWidth={SW} strokeLinejoin="round" />
    <path d="M40,-20 L120,-20 L96,130 C92,146 60,150 40,150Z" fill="#8f4528" opacity={0.7} />
    <rect x={-136} y={-52} width={272} height={44} rx={14} fill="#c26b42" stroke={INK} strokeWidth={SW} />
    <rect x={40} y={-52} width={96} height={44} rx={14} fill="#8f4528" opacity={0.55} />
    <ellipse cx={0} cy={-40} rx={112} ry={18} fill={wet > 0 ? "#3a2418" : "#6b4630"} stroke={INK} strokeWidth={5} />
    {wet > 0 ? <ellipse cx={-10} cy={-42} rx={70} ry={9} fill="#2a190f" /> : null}
    {sprout > 0 ? <g transform={`translate(0,-48) scale(${sprout})`}><path d="M0,0 C0,-40 4,-70 2,-100" fill="none" stroke="#2f8c4a" strokeWidth={10} strokeLinecap="round" />
      <path d="M2,-96 C-50,-110 -64,-80 -46,-60 C-20,-62 0,-80 2,-96Z" fill="#53c46a" stroke={INK} strokeWidth={5} />
      <path d="M2,-96 C54,-116 70,-82 50,-62 C24,-64 4,-80 2,-96Z" fill="#6fd47e" stroke={INK} strokeWidth={5} /></g> : null}
  </g>
);

export const Tally: React.FC<{ x: number; y: number; n: number }> = ({ x, y, n }) => {
  const groups = Math.ceil(n / 5);
  return (
    <g stroke="#f7f1e2" strokeWidth={5} strokeLinecap="round" opacity={0.88}>
      {Array.from({ length: groups }).map((_, g) => {
        const gx = x + (g % 6) * 58, gy = y + Math.floor(g / 6) * 74;
        const cnt = Math.min(5, n - g * 5);
        return <g key={g}>{Array.from({ length: Math.min(4, cnt) }).map((__, i) => <line key={i} x1={gx + i * 9} y1={gy} x2={gx + i * 9 + (random(`t${g}${i}`) - 0.5) * 3} y2={gy + 52} />)}{cnt === 5 ? <line x1={gx - 6} y1={gy + 38} x2={gx + 42} y2={gy + 10} /> : null}</g>;
      })}
    </g>
  );
};

export const Feather: React.FC<{ x: number; y: number; s?: number; rot?: number }> = ({ x, y, s = 1, rot = 0 }) => (
  <g transform={`translate(${x},${y}) rotate(${rot}) scale(${s})`}>
    <path d="M0,0 C-8,-80 -8,-170 0,-260" fill="none" stroke="#2c6b3a" strokeWidth={8} strokeLinecap="round" />
    <path d="M0,-90 C-80,-140 -64,-280 0,-330 C64,-280 80,-140 0,-90Z" fill="#2f9460" stroke={INK} strokeWidth={6} />
    <ellipse cx={0} cy={-200} rx={34} ry={48} fill="#1f56b8" stroke={INK} strokeWidth={5} />
    <ellipse cx={0} cy={-200} rx={16} ry={27} fill="#29b0b8" />
    <ellipse cx={0} cy={-196} rx={6} ry={12} fill="#f2c230" />
  </g>
);

export const Grain: React.FC<{ w: number; h: number; n: number; colors: string[]; seed: string; r?: [number, number] }> = ({ w, h, n, colors, seed, r = [2, 7] }) => (
  <g>{Array.from({ length: n }).map((_, i) => <circle key={i} cx={random(seed + "x" + i) * w} cy={random(seed + "y" + i) * h} r={r[0] + random(seed + "r" + i) * (r[1] - r[0])} fill={colors[i % colors.length]} opacity={0.35 + random(seed + "o" + i) * 0.4} />)}</g>
);

// ---------------------------------------------------------------- backgrounds
export const CourtBg: React.FC<{ light?: number; tally?: number; dawn?: number }> = ({ light = 0.35, tally = 90, dawn = 0 }) => {
  const sky0 = dawn ? "#f9d38a" : "#8fa5ba", sky1 = dawn ? "#fff0c4" : "#f1d2ac";
  return (
    <g>
      <defs>
        <linearGradient id="sk" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stopColor={sky0} /><stop offset="1" stopColor={sky1} /></linearGradient>
        <linearGradient id="wl" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stopColor={dawn ? "#f0cf94" : "#d6bd98"} /><stop offset="1" stopColor={dawn ? "#d9ac6c" : "#b99c76"} /></linearGradient>
      </defs>
      <rect width={1080} height={1920} fill="url(#sk)" />
      <path d="M0,330 L1080,300 L1080,360 L0,380Z" fill="#7a5d46" stroke={INK} strokeWidth={SW} />
      <rect y={372} width={1080} height={900} fill="url(#wl)" stroke={INK} strokeWidth={SW} />
      <Grain w={1080} h={900} n={70} colors={["#c3a57a", "#e3caa0"]} seed="wallg" r={[6, 22]} />
      <path d={`M0,372 L${620 + light * 200},372 L${300 + light * 200},1270 L0,1270Z`} fill="#fff1c2" opacity={0.2 + light * 0.2} />
      <Tally x={92} y={520} n={tally} />
      <g>
        <rect x={790} y={510} width={250} height={770} fill="#2a1a14" stroke={INK} strokeWidth={SW} />
        <rect x={776} y={496} width={278} height={36} fill="#6b4328" stroke={INK} strokeWidth={SW} />
        <rect x={776} y={496} width={30} height={790} fill="#6b4328" stroke={INK} strokeWidth={SW} />
        <rect x={1024} y={496} width={30} height={790} fill="#6b4328" stroke={INK} strokeWidth={SW} />
        <path d="M800,1280 C860,1180 960,1090 1040,1050 L1040,1280Z" fill="#e8d9b8" opacity={dawn ? 0.5 : 0.18} />
        <circle cx={930} cy={900} r={26} fill="#f6c453" opacity={0.85} />
      </g>
      <path d="M0,1270 L1080,1270 L1080,1920 L0,1920Z" fill="#a39684" stroke={INK} strokeWidth={SW} />
      <path d="M0,1270 L1080,1270 L1080,1292 L0,1292Z" fill="#7d7262" />
      {[-0.3, 0.1, 0.5, 0.9, 1.3].map((k, i) => <path key={i} d={`M${540 + (k - 0.5) * 1800},1292 L${540 + (k - 0.5) * 520},1920`} stroke="#7a6e5e" strokeWidth={5} fill="none" />)}
      {[1400, 1520, 1680].map((y) => <line key={y} x1={0} y1={y} x2={1080} y2={y} stroke="#7a6e5e" strokeWidth={5} />)}
      <ellipse cx={540} cy={1620} rx={620} ry={200} fill="#000" opacity={0.08} />
    </g>
  );
};

export const SkyBg: React.FC = () => (
  <g>
    <defs><linearGradient id="sky2" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stopColor="#b4c4d6" /><stop offset="0.6" stopColor="#f3dcc0" /><stop offset="1" stopColor="#f7c898" /></linearGradient></defs>
    <rect width={1080} height={1920} fill="url(#sky2)" />
    <path d="M0,1500 L120,1420 L190,1470 L300,1380 L420,1450 L560,1400 L700,1470 L860,1390 L1080,1460 L1080,1920 L0,1920Z" fill="#8c8497" opacity={0.7} />
    <ellipse cx={780} cy={420} rx={170} ry={44} fill="#fff" opacity={0.55} />
    <ellipse cx={300} cy={620} rx={230} ry={50} fill="#fff" opacity={0.4} />
  </g>
);

export const HeroBg: React.FC<{ t: number }> = ({ t }) => (
  <g>
    <defs>
      <linearGradient id="hb" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stopColor="#d9fbf3" /><stop offset="0.38" stopColor="#62b8c2" /><stop offset="1" stopColor="#0e3f43" /></linearGradient>
    </defs>
    <rect width={1080} height={1920} fill="url(#hb)" />
    {Array.from({ length: 14 }).map((_, i) => {
      const x = (random("cx" + i) * 1400 - 160 + t * (8 + (i % 3) * 5)) % 1400 - 160, y = 1000 + random("cy" + i) * 900 - t * 6;
      const sc = 0.8 + random("cs" + i) * 1.2;
      return <g key={i} transform={`translate(${x},${y}) scale(${sc})`} opacity={0.75}>
        <ellipse cx={0} cy={0} rx={190} ry={60} fill={i % 2 ? "#1f6f78" : "#2d8890"} /><ellipse cx={-90} cy={-26} rx={110} ry={56} fill={i % 2 ? "#1f6f78" : "#2d8890"} /><ellipse cx={90} cy={-30} rx={120} ry={60} fill={i % 2 ? "#2d8890" : "#3a9aa1"} />
        <path d="M-190,10 C-120,48 120,48 190,10" fill="none" stroke="#0e3f43" strokeWidth={6} opacity={0.4} /></g>;
    })}
  </g>
);

export const Halo: React.FC<{ x: number; y: number; r: number; rot: number; op?: number }> = ({ x, y, r, rot, op = 1 }) => (
  <g transform={`translate(${x},${y}) rotate(${rot})`} opacity={op} fill="none" stroke="#e8a90c" strokeLinecap="round">
    <circle r={r} fill="#fff0a8" fillOpacity={0.32} strokeWidth={14} /><circle r={r * 0.86} strokeWidth={6} /><circle r={r * 0.66} strokeWidth={6} opacity={0.9} />
    {Array.from({ length: 12 }).map((_, i) => <path key={i} transform={`rotate(${i * 30})`} d={`M0,${-r * 0.66} L${r * 0.1},${-r * 0.86} L0,${-r} L${-r * 0.1},${-r * 0.86}Z`} strokeWidth={4} fill="#f6cf4a" opacity={0.35} />)}
    <path d={`M0,${-r * 0.66} L${r * 0.57},${r * 0.33} L${-r * 0.57},${r * 0.33}Z`} strokeWidth={4} />
    <path d={`M0,${r * 0.66} L${r * 0.57},${-r * 0.33} L${-r * 0.57},${-r * 0.33}Z`} strokeWidth={4} />
  </g>
);

export const SoilMacro: React.FC<{ tone?: "brown" | "teal" | "gold"; seed?: string }> = ({ tone = "brown", seed = "sm" }) => {
  const [a, b, c] = tone === "teal" ? ["#0a1d1f", "#12373a", "#1d5a5e"] : tone === "gold" ? ["#6a4528", "#8c5d36", "#b98350"] : ["#3a2416", "#5a3b2a", "#7c533a"];
  return (
    <g>
      <defs><linearGradient id={"so" + tone} x1="0" y1="0" x2="0" y2="1"><stop offset="0" stopColor={b} /><stop offset="1" stopColor={a} /></linearGradient></defs>
      <rect width={1080} height={1920} fill={`url(#so${tone})`} />
      <Grain w={1080} h={1920} n={260} colors={[a, b, c, c]} seed={seed} r={[4, 20]} />
    </g>
  );
};
