// Procedural "vinyl toy" objects. Each toy is drawn in a 600x600 box centred on (300,300): flat colour shapes,
// body parts through the puff filter (soft 3D plastic), small features (eyes, holes, strings) on top, unfiltered.
// Add a toy: write a component here and register it in TOYS. Or put a PNG in public/ and set "image" in song.json.
import React from "react";
import { Face } from "./kit";

const P: React.FC<{ f?: string; children: React.ReactNode }> = ({ f = "puffL", children }) => <g filter={`url(#${f})`}>{children}</g>;
const Eye: React.FC<{ x: number; y: number; r?: number }> = ({ x, y, r = 1 }) => (
  <g><ellipse cx={x} cy={y} rx={15 * r} ry={19 * r} fill="#2b1710" /><circle cx={x - 5 * r} cy={y - 7 * r} r={5.5 * r} fill="#fff" /></g>
);
const Blush: React.FC<{ x: number; y: number }> = ({ x, y }) => <ellipse cx={x} cy={y} rx={24} ry={14} fill="#ff6a6a" opacity={0.45} filter="url(#blush)" />;

const Apple = () => (
  <g>
    <P><path d="M300 205 C 385 150 525 180 525 335 C 525 470 425 545 362 532 C 332 526 316 516 300 516 C 284 516 268 526 238 532 C 175 545 75 470 75 335 C 75 180 215 150 300 205 Z" fill="#e11d1d" /></P>
    <P f="puffS"><path d="M300 212 C 298 170 290 140 272 108" fill="none" stroke="#6e3a1b" strokeWidth={24} strokeLinecap="round" /></P>
    <P f="puffM"><path d="M312 150 C 340 85 420 70 470 88 C 445 150 375 175 312 150 Z" fill="#5db536" /></P>
    <path d="M325 145 C 370 120 410 105 455 95" fill="none" stroke="#3f8d22" strokeWidth={5} strokeLinecap="round" opacity={0.7} />
  </g>
);
const Banana = () => (
  <g transform="rotate(-8 300 300)">
    <P><path d="M80 350 C 170 500 440 500 510 260 C 518 230 526 212 520 196 C 500 186 482 200 470 228 C 420 340 280 360 125 290 C 90 276 62 318 80 350 Z" fill="#f6c515" /></P>
    <path d="M130 330 C 250 400 400 380 470 270" fill="none" stroke="#e2a90c" strokeWidth={8} strokeLinecap="round" opacity={0.5} />
    <P f="puffS"><path d="M498 222 L 512 160 L 540 166 L 528 226 Z" fill="#7a5a1c" /></P>
    <circle cx={100} cy={348} r={10} fill="#5a3d14" />
  </g>
);
const Cat = () => (
  <g>
    <P><path d="M420 470 C 520 470 540 380 500 340" fill="none" stroke="#ec8a22" strokeWidth={44} strokeLinecap="round" /></P>
    <P><ellipse cx={300} cy={455} rx={150} ry={115} fill="#f08c24" /></P>
    <P f="puffM"><ellipse cx={240} cy={548} rx={46} ry={30} fill="#f39a35" /><ellipse cx={360} cy={548} rx={46} ry={30} fill="#f39a35" /></P>
    <P><path d="M165 205 L 175 70 L 270 145 Z M 435 205 L 425 70 L 330 145 Z" fill="#ef8822" strokeLinejoin="round" stroke="#ef8822" strokeWidth={30} /></P>
    <path d="M190 170 L 195 105 L 245 145 Z M 410 170 L 405 105 L 355 145 Z" fill="#f6a3a0" stroke="#f6a3a0" strokeWidth={14} strokeLinejoin="round" />
    <P><ellipse cx={300} cy={260} rx={168} ry={140} fill="#f29028" /></P>
    <P f="puffM"><ellipse cx={300} cy={318} rx={62} ry={42} fill="#f8d9a8" /></P>
    <Eye x={238} y={258} /><Eye x={362} y={258} />
    <path d="M288 300 L 312 300 L 300 314 Z" fill="#e9707a" stroke="#e9707a" strokeWidth={8} strokeLinejoin="round" />
    <path d="M300 314 Q 288 334 274 326 M300 314 Q 312 334 326 326" fill="none" stroke="#6a3416" strokeWidth={5} strokeLinecap="round" />
    {[[-1, 300], [-1, 318], [1, 300], [1, 318]].map(([d, y], i) => <path key={i} d={`M${300 + d * 75} ${y} L ${300 + d * 150} ${y + (y - 309) * 1.6}`} stroke="#6a3416" strokeWidth={4} strokeLinecap="round" />)}
    <Blush x={200} y={300} /><Blush x={400} y={300} />
  </g>
);
const Dog = () => (
  <g>
    <P><path d="M430 470 C 500 450 510 400 490 370" fill="none" stroke="#c98a45" strokeWidth={36} strokeLinecap="round" /></P>
    <P><ellipse cx={300} cy={460} rx={140} ry={110} fill="#d79a55" /></P>
    <P f="puffM"><ellipse cx={242} cy={550} rx={44} ry={28} fill="#e0a865" /><ellipse cx={358} cy={550} rx={44} ry={28} fill="#e0a865" /></P>
    <P><ellipse cx={300} cy={255} rx={160} ry={140} fill="#dda05b" /></P>
    <P><ellipse cx={155} cy={260} rx={52} ry={105} fill="#b8743a" transform="rotate(18 155 260)" /><ellipse cx={445} cy={260} rx={52} ry={105} fill="#b8743a" transform="rotate(-18 445 260)" /></P>
    <P f="puffM"><ellipse cx={300} cy={320} rx={78} ry={55} fill="#f1cf9c" /></P>
    <Eye x={243} y={245} /><Eye x={357} y={245} />
    <P f="puffS"><ellipse cx={300} cy={296} rx={30} ry={22} fill="#3a2015" /></P>
    <path d="M300 318 L 300 334 M 270 336 Q 300 360 330 336" fill="none" stroke="#5a2f17" strokeWidth={6} strokeLinecap="round" />
    <Blush x={215} y={300} /><Blush x={385} y={300} />
  </g>
);
const Elephant = () => (
  <g>
    <P><ellipse cx={300} cy={430} rx={165} ry={120} fill="#5eb2e6" /></P>
    <P f="puffM">{[200, 260, 340, 400].map((x) => <rect key={x} x={x - 32} y={470} width={64} height={95} rx={30} fill="#58abe0" />)}</P>
    <P><ellipse cx={150} cy={250} rx={100} ry={120} fill="#4d9fd8" /><ellipse cx={450} cy={250} rx={100} ry={120} fill="#4d9fd8" /></P>
    <ellipse cx={160} cy={255} rx={58} ry={78} fill="#8cc8ee" opacity={0.6} /><ellipse cx={440} cy={255} rx={58} ry={78} fill="#8cc8ee" opacity={0.6} />
    <P><ellipse cx={300} cy={250} rx={140} ry={128} fill="#66b8ea" /></P>
    <P><path d="M300 300 C 300 380 300 420 340 450 C 360 465 390 455 385 430" fill="none" stroke="#62b4e8" strokeWidth={58} strokeLinecap="round" /></P>
    <Eye x={248} y={240} /><Eye x={352} y={240} />
    <Blush x={220} y={290} /><Blush x={380} y={290} />
  </g>
);
const Fish = () => (
  <g>
    <P><path d="M430 300 L 560 200 C 575 260 575 340 560 400 Z" fill="#f2801a" strokeLinejoin="round" stroke="#f2801a" strokeWidth={30} /></P>
    <P f="puffM"><path d="M230 200 C 260 120 360 120 380 205 Z" fill="#f2801a" /></P>
    <P><ellipse cx={280} cy={300} rx={185} ry={128} fill="#f7941d" /></P>
    <P f="puffM"><path d="M265 330 C 300 300 350 310 360 350 C 320 380 280 370 265 330 Z" fill="#f2801a" /></P>
    {[0, 1, 2].map((k) => <path key={k} d={`M${330 + k * 40} 250 q 18 50 0 100`} fill="none" stroke="#e46d0e" strokeWidth={7} strokeLinecap="round" opacity={0.6} />)}
    <Eye x={170} y={275} r={1.15} />
    <path d="M125 330 Q 150 352 180 340" fill="none" stroke="#5a2a0e" strokeWidth={7} strokeLinecap="round" />
  </g>
);
const Guitar = () => (
  <g transform="rotate(40 300 300)">
    <P f="puffM"><rect x={272} y={-10} width={56} height={300} rx={16} fill="#9a5426" /></P>
    <P f="puffM"><rect x={258} y={-70} width={84} height={95} rx={24} fill="#8a4a20" /></P>
    {[-45, -15, 15].map((y) => <g key={y}><circle cx={248} cy={y} r={13} fill="#c97a3a" /><circle cx={352} cy={y} r={13} fill="#c97a3a" /></g>)}
    <P><path d="M300 190 C 380 190 405 255 385 300 C 372 330 380 345 400 380 C 450 470 390 590 300 590 C 210 590 150 470 200 380 C 220 345 228 330 215 300 C 195 255 220 190 300 190 Z" fill="#f0862a" /></P>
    <circle cx={300} cy={375} r={46} fill="#5a2a12" />
    <P f="puffS"><rect x={250} y={480} width={100} height={26} rx={10} fill="#7a3d18" /></P>
    {[-18, -6, 6, 18].map((x) => <line key={x} x1={300 + x} y1={-40} x2={300 + x} y2={490} stroke="#f3d9b0" strokeWidth={3} opacity={0.9} />)}
  </g>
);
const Hat = () => (
  <g>
    <P><ellipse cx={300} cy={410} rx={250} ry={78} fill="#f2a81c" /></P>
    <P><path d="M175 410 C 170 300 210 205 300 205 C 390 205 430 300 425 410 Z" fill="#f6b922" /></P>
    <P f="puffM"><path d="M178 355 C 250 375 350 375 422 355 L 425 405 C 350 422 250 422 175 405 Z" fill="#f07a1a" /></P>
  </g>
);

export const TOYS: Record<string, React.FC> = { apple: Apple, banana: Banana, cat: Cat, dog: Dog, elephant: Elephant, fish: Fish, guitar: Guitar, hat: Hat };
export { Face };
