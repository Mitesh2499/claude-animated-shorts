// Layout preview WITHOUT a voice: fake word timings (default 2.5 words/s) -> src/timeline.json + a silent public/audio/mix.wav.
// usage: node scripts/dry_timeline.mjs [wordsPerSecond]   then   node scripts/stills.mjs out/dry_ <frames>
// Must count words exactly like sectionLines() in Listicle.tsx (blocks for scene/follow sections; item fields for items).
import fs from "node:fs";
const S = JSON.parse(fs.readFileSync("script.json", "utf8")); const WPS = Number(process.argv[2] || 2.5), GAP = 0.25;
const words = (t) => t.split(/\s+/).filter(Boolean);
const lines = (s) => {
  if (s.kind !== "item") return (s.blocks ?? []);
  const out = []; if (s.ordinal) out.push([{ t: s.ordinal }]); if (s.badge) out.push([{ t: s.badge.name }]);
  (s.head ?? []).forEach((l) => out.push(l)); (s.sub ?? []).forEach((l) => out.push(l));
  (s.bullets ?? []).forEach((b) => out.push([typeof b === "string" ? { t: b } : b])); if (s.tag) out.push([{ t: s.tag }]); return out;
};
let t = 0; const secs = [];
for (const s of S.sections) {
  const n = lines(s).flatMap((l) => l.flatMap((sp) => words(sp.t))).length; const ws = Array.from({ length: n }, (_, i) => +(t + 0.15 + i / WPS).toFixed(3));
  const dur = Math.max(n / WPS + 0.8, s.minDur ?? 0, 2); secs.push({ kind: s.kind, t0: +t.toFixed(3), t1: +(t + dur + GAP).toFixed(3), words: ws }); t += dur + GAP;
}
const total = +(t + 0.6).toFixed(3); secs[secs.length - 1].t1 = total;
fs.writeFileSync("src/timeline.json", JSON.stringify({ total, sections: secs }, null, 1));
const SR = 16000, N = Math.ceil(total * SR), buf = Buffer.alloc(44 + N * 2); // silent mono 16-bit wav
buf.write("RIFF", 0); buf.writeUInt32LE(36 + N * 2, 4); buf.write("WAVEfmt ", 8); buf.writeUInt32LE(16, 16); buf.writeUInt16LE(1, 20); buf.writeUInt16LE(1, 22);
buf.writeUInt32LE(SR, 24); buf.writeUInt32LE(SR * 2, 28); buf.writeUInt16LE(2, 32); buf.writeUInt16LE(16, 34); buf.write("data", 36); buf.writeUInt32LE(N * 2, 40);
fs.mkdirSync("public/audio", { recursive: true }); fs.writeFileSync("public/audio/mix.wav", buf);
secs.forEach((s, i) => console.log(`section ${i} ${s.t0.toFixed(2)}-${s.t1.toFixed(2)}  frames ${Math.round(s.t0 * 30)}-${Math.round(s.t1 * 30)}`));
console.log("total", total, "s");
