// The phonics song short. Card grammar (measured from the reference):
//   hook grid (first 3 letters + objects) -> [push] letter card (beats 1-2) -> [hard cut + pop] object card with
//   word label (beats 3-4) -> [push] next letter ... Holds are completely still: all motion lives in transitions.
import React from "react";
import { AbsoluteFill, Img, staticFile, useCurrentFrame } from "remotion";
import { FPS, W, H, ITEMS, PUSH_F, colorOf, popT, pushT, INTRO } from "./timing";
import { Sky, PuffDefs, Letter, Label, popScale, labelOpacity, easeInOut, useFont, FONT, Mouth } from "./kit";
import { TOYS } from "./toys";

const MOUTHS: Mouth[] = ["smile", "smile", "smile", "grin", "smile", "smile", "smile", "grin"];
const mouthOf = (i: number) => MOUTHS[i % MOUTHS.length];

// object drawn in its 600x600 box, scaled to the measured size (~70 % of width), centred at 54 % height
const Toy: React.FC<{ i: number; cx: number; cy: number; size: number; scale?: number }> = ({ i, cx, cy, size, scale = 1 }) => {
  const it = ITEMS[i];
  const k = (size / 600) * scale;
  if (it.image) {
    const s = size * scale;
    return <foreignObject x={cx - s / 2} y={cy - s / 2} width={s} height={s}><Img src={staticFile(it.image)} style={{ width: "100%", height: "100%", objectFit: "contain" }} /></foreignObject>;
  }
  const C = TOYS[it.toy];
  if (!C) return <text x={cx} y={cy + 60} textAnchor="middle" fontFamily={FONT} fontSize={160 * scale} fill="#333">{it.word}</text>;
  return <g transform={`translate(${cx - 300 * k} ${cy - 300 * k}) scale(${k})`}><C /></g>;
};

type Card = { kind: "hook" } | { kind: "letter"; i: number } | { kind: "object"; i: number; age: number };

const CardView: React.FC<{ c: Card }> = ({ c }) => {
  const seed = c.kind === "hook" ? 0 : c.kind === "letter" ? c.i * 2 + 1 : c.i * 2 + 2;
  return (
    <AbsoluteFill>
      <Sky seed={seed} />
      <svg width={W} height={H} style={{ position: "absolute", inset: 0 }}>
        {c.kind === "hook" && <Hook />}
        {c.kind === "letter" && <Letter ch={ITEMS[c.i].letter} color={colorOf(c.i)} mouth={mouthOf(c.i)} />}
        {c.kind === "object" && (
          <>
            <Toy i={c.i} cx={W / 2} cy={H * 0.54} size={W * 1.12} scale={popScale(c.age)} />
            <Label text={ITEMS[c.i].word} color={colorOf(c.i)} opacity={labelOpacity(c.age)} />
          </>
        )}
      </svg>
    </AbsoluteFill>
  );
};

// Hook / thumbnail card: 3 rows, letter left + its object right. Measured: letters only on frame 0-1, objects
// appear (hard) on frame 2 and the grid holds until the first push.
const Hook: React.FC = () => {
  const f = useCurrentFrame();
  const rows = ITEMS.slice(0, 3);
  return (
    <g>
      {rows.map((it, i) => {
        const cy = H * (0.19 + i * 0.31);
        return (
          <g key={i}>
            <Letter ch={it.letter} color={colorOf(i)} cx={W * 0.28} cy={cy} size={500} mouth="smile" />
            {f >= 2 && <Toy i={i} cx={W * 0.72} cy={cy} size={W * 0.55} />}
          </g>
        );
      })}
    </g>
  );
};

// which card(s) are on screen at time t
const cardsAt = (t: number): { a: Card; b?: Card; p?: number; tilt?: boolean } => {
  if (t < pushT(0)) return { a: { kind: "hook" } };
  let i = 0;
  while (i + 1 < ITEMS.length && t >= pushT(i + 1)) i++;
  const p = (t - pushT(i)) / (PUSH_F / FPS);
  const prev: Card = i === 0 ? { kind: "hook" } : { kind: "object", i: i - 1, age: 99 };
  if (p < 1) return { a: prev, b: { kind: "letter", i }, p: easeInOut(Math.max(0, p)), tilt: i === 0 };
  if (t < popT(i)) return { a: { kind: "letter", i } };
  return { a: { kind: "object", i, age: (t - popT(i)) * FPS } };
};

export const PhonicsSong: React.FC = () => {
  useFont();
  const f = useCurrentFrame();
  const { a, b, p = 0, tilt } = cardsAt(f / FPS);
  return (
    <AbsoluteFill style={{ background: "#84d8f8", overflow: "hidden", perspective: 1800 }}>
      <PuffDefs />
      {!b && <CardView c={a} />}
      {b && (
        <>
          {/* push: both cards slide left together; the very first push (hook -> A) also swings in with a yaw */}
          <AbsoluteFill style={{ transform: `translateX(${-W * p}px)${tilt ? ` rotateY(${-28 * p}deg)` : ""}`, transformOrigin: "right center" }}><CardView c={a} /></AbsoluteFill>
          <AbsoluteFill style={{ transform: `translateX(${W * (1 - p)}px)${tilt ? ` rotateY(${28 * (1 - p)}deg)` : ""}`, transformOrigin: "left center" }}><CardView c={b} /></AbsoluteFill>
        </>
      )}
    </AbsoluteFill>
  );
};
export { INTRO };
