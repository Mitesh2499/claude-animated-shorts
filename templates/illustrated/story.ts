// Shot plan in 30 fps frames. Edit this first; everything else follows it.
// Rule: hard cuts only; one idea and one visible change per shot; dip-to-black only before the reveal and at the end.
export type Shot = { id: string; from: number; dur: number; flashAt?: number; note: string };

const s = (sec: number) => Math.round(sec * 30);

// Reference timing (40 s): 3.3 / 3.0 / 1.3 / 3.7 / 2.9 / 1.9 / 7.9 / 5 / 5 / 3.8
const plan: [string, number, string, number?][] = [
  ["wide", 6.3, "locked wide, push 3.2 %/s, legs walk through, kick at 6.3 s -> starburst"],
  ["bowl", 1.3, "extreme close insert: bowl lands, rice scatters, darker palette"],
  ["wide2", 3.7, "back to wide: victim weeps, push 2.4 %/s"],
  ["eyes", 2.9, "dip to dark, letterbox slit, eyes glow"],
  ["villain", 1.9, "bright pale bg, arrogant medium shot, ends on hard cut"],
  ["hero", 7.9, "divine reveal: arms multiply, halo scales, music jumps +11 dB", 0],
  ["twoshot", 5.0, "villain left third, god enters right, grabs throat"],
  ["punish", 5.0, "face breaks, jitter, tiny shake hold"],
  ["black", 3.8, "black; audio tail"],
];

let t = 0;
export const SHOTS: Shot[] = plan.map(([id, sec, note, flashAt]) => {
  const sh = { id, from: t, dur: s(sec), flashAt, note };
  t += s(sec);
  return sh;
});
export const TOTAL = t;
