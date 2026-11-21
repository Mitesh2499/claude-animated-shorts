---
name: illustrated-parallax-short
description: Make a 30-45 s vertical 2D illustrated story short ("painted cartoon cards with a push-in camera", stepped 10 fps drawn motion, cut-out limbs, starburst impacts, letterbox eye reveal, warm-vs-teal mood palettes, hard cuts, music-led, no narration needed) in Remotion. Learned from a devotional karma short (Krishna). Use when the user wants a story/moral/mythology/karma short in a flat illustrated or anime-ish 2D style, "like the Krishna video", "like the Raw video", or says "use the illustrated short skill". For the 3D-town look use cartoon-3d-short instead.
---

# Illustrated parallax short (2D art + Remotion)

Style source: `references/illustrated/STYLE_BIBLE_ILLUSTRATED.md` (measured numbers, shot table, palettes) and `references/illustrated/sheets/`.
Template: `templates/illustrated/` (`kit.tsx` components, `story.ts` shot plan, `Short.tsx` example, `ASSETS.md` layer list).
Audio: reuse `templates/audio/` (dsp, instruments, sfx_gen, music, mix) for synthesized SFX and score, or drop in a licensed track.
The reference file in `Raw/` is private study material with the creator's watermark. Never publish it, never copy its drawings, story beats verbatim, or its tag.

## What the style IS (the 8 rules)
1. **Painting + camera, not 3D.** Flat cel art, thin dark line, 1-2 tone shading, hard-edged shadow shapes. The camera slowly pushes in on every hold (`Cam pct` 1-3.2 %/s, origin on the subject, drift up-left about 1 % of width). No handheld float.
2. **Hard cuts.** Only two soft moves: dip-to-dark before the reveal (0.4 s) and the final cut to black. Average shot 3.8 s, one 8 s hero hold, one 1.3 s extreme close-up insert.
3. **Stepped drawn motion.** New pose every 3 frames at 30 fps (10 fps). `useStep(3)`. Smooth only the camera (steps of 2).
4. **Cut-out puppets.** One body layer + separate arm/hair/cloth/eye/mouth layers rotated about joints. Duplicate the arm to multiply (staggered `stagger()`).
5. **Impact grammar.** Contact -> white 4-point `Starburst` (3 f) + `Smear` ghost copies + object squash + `Debris` arcs, then a hard cut to an extreme close-up of the landing, then back.
6. **Light as story.** Warm yellow wall + diagonal hard sun shadow = harsh world; teal storm + white sun glow = divine; pale blown-out sky = arrogant villain; black = judgement. One warm/cold pair per beat. Accent crimson + gold only on the divine figure.
7. **Face discipline.** Do not show the offender's face during the crime (legs/hands only). Reveal face only at the punishment. Victim keeps a quiet held close-up with tears.
8. **Silence is a tool.** First 16 s ambient bed at -31 dB RMS (street, footsteps), then the score enters at the reveal cut with a +11 dB jump, hits on contact only, decays over the final black (3.8 s).

## Story formula (40 s, 0 words needed)
cruelty (0-9 s) -> witness: weeping close-up (9-13 s) -> eyes open, letterbox (13-16 s) -> offender smug beat (16-18 s) -> divine reveal with multiplying arms + halo (18-26 s) -> two-shot, justice enters from the side, back to camera (26-32 s) -> punishment, face breaks, shake hold (32-36 s) -> black + audio tail (36-40 s).
Adapt for any moral tale (greed, bullying, pride): unfair act, silent witness, power appears, consequence, black. Keep violence stylised (no gore needed; the reference's "face breaks" can be a comic-horror face swap). Keep religious figures respectful: no mockery of the deity.

## Pipeline
1. **Pick the moral + 7 pictures.** Write the shot table in `story.ts` (id, seconds, note). One idea and one change per shot.
2. **Art layers** (see `templates/illustrated/ASSETS.md`): 1080x1920 PNG with alpha, 25-40 layers for the whole short. Make them with an image model or an illustrator (ask the user which they have), consistent style prompt = the palette block in the style bible. Remove backgrounds, name files as in ASSETS.md.
3. **Sound.** Event table from `story.ts` -> `templates/audio/` (kick thud, bowl clang, rice, swell, choir/drone, final decay). Standard mix: music +3 dB, SFX -6 dB, voice unchanged. Optional voice (edge-tts) only if the user wants narration.
4. **Build** by copying `templates/illustrated/*` into `src/videos/<name>/` of a Remotion project (Remotion 4, no three.js needed). Register the composition at 1080x1920, 30 fps, `durationInFrames=TOTAL`.
5. **Stills** at 0.5 scale on the key frames (first, impact, reveal, end). Compare against `references/illustrated/sheets/key_frames.jpg`: luma per shot, wall yellow vs teal split.
6. **Render:** `npx remotion render src/index.ts Illustrated out/<name>.mp4 --codec h264 --crf 16`; mux the audio with `-map 0:v:0 -map 1:a:0`. Verify duration, black tail, no frozen frame >12 f other than intentional holds.
7. **Deliver** the mp4, save memory.

## User rules (inherited)
- No captions, English only, jokes are real facts, music +3 dB / SFX -6 dB, save after every step, "just do it" once the script is approved.
- Title: the reference has NONE (first frame is the scene). `Title` in kit.tsx exists for when the user asks, as a 1.2 s hand-lettered pop (yellow Impact with thick dark stroke, 8 frame fade). Our own channel tag (`Mark`) at 35 % opacity bottom-left is optional.

## Software
Needed: Node + Remotion (already used in `c:\Projects\bitter-fruit`), Python 3.10 with numpy/opencv/pillow (present). ffmpeg ships inside `@remotion/compositor-win32-x64-msvc` (minimal build: no fps/scale/ebur128 filters, so do frame analysis with OpenCV).
Missing and worth installing for art: a background remover (rembg) or an image-generation source for the layers.

## No artist? Code-drawn characters on the anatomical RIG (v2, the default)
Proven on "जब भगवान ने जवाब दिया..." (`c:\Projects\jab-bhagwan`, comp `JabBhagwanV2`, 2026-11-21). v1 (`templates/illustrated/procedural/art.tsx`, bean heads + sausage limbs) was rejected by the user: "does not feel human: posture, head, hands, legs and attire are not accurate, same for the god". NEVER use the v1 bodies for people again; use `templates/illustrated/rig/rig.tsx` (example scenes: `rig/ShortV2_example.tsx`, result: `references/illustrated/sheets/v2_rig_result.jpg`).

### What the rig does
- `Figure` = skeleton + forward kinematics in head-height units (H). Origin = pelvis. Angles are ABSOLUTE degrees from straight down, + = toward the facing side, 180 = up. `pose = { lean, neck, yaw (0 front .. 1 three-quarter), armN/armF [upper, fore, hand], legN/legF [thigh, shin, foot], handN/handF, toesN }`. N = near (screen side behind the facing direction, drawn in front), F = far (drawn behind the torso).
- `reach(fig, "F", worldPoint, bend)` = 2-bone IK for touching things (hand on a head, on a pot); `jointsOf(fig)` gives world wrists/head for props, water streams, eyelines.
- Layering: far arm+leg -> torso -> near leg -> garment skirt -> head -> near arm. Each layer draws all outlines first, then fills, so limbs merge into one silhouette; garments, hands and fingers carry their own outline so hems and finger gaps show.
- `Head`: front/3-quarter blend by yaw (same point count, lerped), jaw + chin + cheekbone contour, protruding nose in 3/4, almond eyes with iris/pupil/highlight clipped to the lids, lid openness, brows (sad/neutral/stern), 7 mouths, tears, ears, cel shadow kept on ONE side (lerping a left and right shadow crosses the face = "mask" band).
- Hands: palm + 4 three-segment fingers + 2-segment thumb with curl presets (`relax, open, bless, grip, cup, point, rest, pinch`). Good at body scale. At insert scale (hand fills the frame) draw a dedicated shape instead (`Finger` in the example) or hide fingertips in soil/water/props; never show a rig hand larger than ~300 px.

### Human-ness rules (check every shot)
1. **Proportion**: adults 7.5-8 H (legs 3.8 H, torso 2.45 H, upper arm 1.42 H, forearm 1.22 H, hand 0.75 H, shoulders 1.6-1.9 H wide). Head drawn at 1.1x (1.17x for a youthful deity) so faces read on phones. Neck visible 0.25-0.3 H, never a pillar.
2. **Posture carries weight**: kneel on one knee (back shin flat, toes bent, front foot planted), sit on heels (feet flat BEHIND, never poking down), sit on a step (thighs level, shins vertical), stand with a slight lean or tribhanga for the deity. Lean 4-12 deg toward what they care about; neck tilts to the eyeline.
3. **Contact**: hands touch what they act on (IK): the lota handle, knees, the other person's head, palms together in pranam. Floating hands = fake.
4. **Eyelines**: every face looks at something specific (`look` + head tilt). Sad = lids 0.5-0.6 + inner brows up; wonder = lids 1 + o-mouth; divine calm = lids 0.6, faint smile.
5. **Attire is real Indian clothing, drawn as cloth**: worn cotton kurta (placket + buttons, side seams, hem at mid-thigh, sleeves to the elbow) over loose pajama; elder = kurta + dhoti + grey wool shawl over both shoulders + pagdi + lathi + white beard; hems follow gravity, folds at joints.
6. **Deity iconography (Krishna)**: blue skin (#4f86c6, shade #335f9a), gold mukut with a peacock feather, urdhva-pundra tilak, makara kundala earrings, long black hair over the shoulders, yellow pitambar dhoti with a pleated front panel, crimson waist sash, gold necklace + armlets + bracelets + anklets, vaijayanti mala to the knees, bansuri in one hand, abhaya (blessing) mudra with the other, serene half-lidded eyes and a faint smile, halo behind the head. Kneeling deity is allowed when it shows compassion (hand on the devotee's head). Never comic, never angry, never mocking.
7. **Silhouette test**: fill a still black; each character must still read as a person doing the action.
8. **Ink**: 4-4.5 px at body scale, 6.5-8 px in close-ups (`lw`), all ink #22170f.

### Workflow
- Build poses on a `RigTest` composition first (3 characters + a big head + hands on one still), fix anatomy there, THEN place them in scenes.
- Stills sheet after every change (`COMP=<id> node scripts/stills.mjs out/x/f_ frames 0.4` + a contact sheet); compare against the checklist above before rendering.
- Keep each version: new composition id per version (`JabBhagwan` v1, `JabBhagwanV2` v2), same timeline/audio, output `out/v<N>_<title>.mp4`.

### Audio/voice pipeline (unchanged from v1)
- Pipeline used: `gen_voice.py` (edge-tts hi-IN-MadhurNeural, per-line rate and pitch; the service randomly returns NoAudioReceived: retry, then drop pitch / leading "...") -> ffmpeg to wav -> `prep_voice.py` trims silence -> `timeline_build.py` writes `src/timeline.json` (shot starts + voice starts) -> `mix.py` synthesises ambience, tanpura, bansuri, choir pad, bells, SFX and ducks music under the voice -> Remotion render (`scripts/render.mjs`, silent) -> mux with `-map 0:v:0 -map 1:a:0`.
- Voice speed: Hindi edge-tts speaks ~2.3 words/s even at +12 %, so a 84-word script runs ~37 s of speech: budget 45-50 s, not 38.
- Weak spots to upgrade when an artist/model is available: stiff cut-out bodies, simple faces, sausage hands. The camera, cuts, light states, sound arc and timing already match the style bible.
