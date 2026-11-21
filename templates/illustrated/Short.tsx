// Example composition: "cruelty -> witness -> divine reveal -> karmic punishment -> black" (the proven 7-shot formula).
// Copy to src/videos/<name>/, replace the PNG names (see ASSETS.md), register in Root.tsx:
//   <Composition id="Illustrated" component={Short} durationInFrames={TOTAL} fps={30} width={1080} height={1920} />
import React from "react";
import { AbsoluteFill, Audio, Sequence, staticFile, useCurrentFrame } from "remotion";
import { Cam, Dip, Debris, Flash, Glow, Layer, Letterbox, Mood, Starburst, bob, jitter, shakeOffset, stagger, useStep } from "./kit";
import { SHOTS, TOTAL } from "./story";
export { TOTAL };

const Shot1: React.FC = () => {
  const f = useStep(3); // drawn on threes
  const [dx] = shakeOffset(useCurrentFrame(), 70, 14);
  return (
    <Cam pct={3.2} ox={45} oy={62}>
      <AbsoluteFill style={{ transform: `translateX(${dx}px)` }}>
        <Layer src="s1/wall.png" />
        <Layer src="s1/woman.png" x={-20} y={760} w={760} />
        <Layer src="s1/child.png" x={560} y={900} w={420} rot={Math.sin(f / 4) * 1.2} />
        <Layer src="s1/bowl.png" x={300} y={1330} w={300} opacity={f >= 70 ? 0 : 1} />
        {/* foreground legs: enter from the left, cut off by the frame, face never shown */}
        <Layer src="s1/legs_a.png" x={-700 + Math.min(f, 60) * 22} y={200} w={600} />
        <Starburst x={560} y={1400} at={70} />
        <Mood vignette={0.2} wash="#f3c63a" washOpacity={0.08} />
      </AbsoluteFill>
    </Cam>
  );
};

const Hero: React.FC = () => {
  const f = useCurrentFrame();
  const arms = [0, 1, 2, 3]; // pairs
  return (
    <Cam pct={1.4} ox={50} oy={40}>
      <AbsoluteFill style={{ background: "linear-gradient(#e8faed,#60b1bd 40%,#0e3f43)" }} />
      <Layer src="hero/clouds.png" y={-f * 0.6} />
      <Glow x={540} y={460} r={420} />
      <div style={{ position: "absolute", inset: 0, transform: `translateY(${bob(f)}px)` }}>
        <Layer src="hero/halo.png" x={170} y={170} w={740} scale={0.4 + 0.6 * stagger(f, 0, 90, 0, 36)} opacity={stagger(f, 0, 90, 0, 36)} />
        <Layer src="hero/body.png" x={140} y={330} w={800} />
        {arms.map((i) => (
          <Layer key={i} src="hero/arm.png" x={140} y={560} w={800} pivot={[50, 20]}
            rot={(i % 2 ? 1 : -1) * (10 + i * 9) * stagger(f, i, 0, 22, 16)} opacity={stagger(f, i, 0, 22, 10)} />
        ))}
      </div>
      <Mood vignette={0.18} />
    </Cam>
  );
};

const Punish: React.FC = () => {
  const f = useCurrentFrame();
  const [jx, jy] = jitter(f, 3, 7);
  const broken = f > 40;
  return (
    <Cam pct={0.3} ox={30} oy={40} blur={0}>
      <Layer src="s6/street_blur.png" />
      <div style={{ transform: broken ? `translate(${jx}px,${jy}px)` : undefined }}>
        <Layer src="s6/man_body.png" />
        <Layer src={broken ? "s6/man_face_broken.png" : "s6/man_face_grin.png"} />
      </div>
      <Layer src="s6/god_back.png" x={380} />
      <Layer src="s6/god_arm_choke.png" x={0} />
      <Mood vignette={0.2} />
    </Cam>
  );
};

export const Short: React.FC = () => (
  <AbsoluteFill style={{ background: "#000" }}>
    {SHOTS.map((s) => (
      <Sequence key={s.id} from={s.from} durationInFrames={s.dur}>
        {s.id === "wide" || s.id === "wide2" ? <Shot1 /> : null}
        {s.id === "eyes" ? (<><AbsoluteFill style={{ background: "#050505" }} /><Layer src="eyes/eyes.png" y={760} /><Letterbox slit={0.28} /><Dip dur={s.dur} inF={12} /></>) : null}
        {s.id === "hero" ? <Hero /> : null}
        {s.id === "punish" ? <Punish /> : null}
        {s.id === "bowl" ? <Cam pct={2}><Layer src="insert/bowl_floor.png" /><Debris x={540} y={1250} at={6} /></Cam> : null}
        {s.flashAt != null ? <Flash at={s.flashAt} /> : null}
      </Sequence>
    ))}
    {/* black tail: the score decays over black */}
    <Audio src={staticFile("audio/mix.wav")} />
  </AbsoluteFill>
);
