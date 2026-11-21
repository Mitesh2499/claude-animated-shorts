---
name: phonics-song-short
description: Make a ~25-30 s vertical kids' ALPHABET / PHONICS SONG short ("A is for apple, B is for banana ...") in the bright toddler-channel style - glossy inflated 3D plastic letters in rainbow order with kawaii faces, cute toy objects, a flat sky with puffy clouds, a word label in the letter's colour, and picture changes locked to the sung beat (push-in on the letter name, hard cut + spring pop on the object word). Video AND audio are generated: procedural SVG letters/toys in Remotion, an original 76 BPM ukulele kids-pop backing and a child TTS vocal tuned to the melody, all on one beat grid. Learned from "ABC Phonics Song for Kids (A-H)" in Raw/. Use when the user asks for an ABC / alphabet / phonics / nursery-rhyme / kids learning song video, "like the ABC video", "letters A to H", the next part of the alphabet series, or says "use the phonics skill". Not for story shorts (use illustrated-parallax-short or cartoon-3d-short).
---

# Phonics song short (Remotion + synthesized song)

Style source: `references/phonics/STYLE_BIBLE_PHONICS.md` (measured timings, curves, palette, sound) and `references/phonics/sheets/`.
Template (complete, proven project): `templates/phonics/` - copy it, edit `song.json`, run 4 commands.
The reference in `Raw/` is someone else's channel content: study only. Never reuse its images, melody or recording.

## The format in one breath
8 letters per Short (A-H, I-P, Q-X, Y-Z + recap = a 4-part series). One sung line "X is for Y" = one bar at 76 BPM
(3.16 s) = two cards: LETTER card on beats 1-2, OBJECT card + word label on beats 3-4. 2-beat hook grid first
(thumbnail: first 3 letters + objects), 2-beat tail last, so 8 letters = 28.4 s and the Short loops cleanly.

## The 8 rules (from the measurements)
1. **Holds are dead still.** No idle bob, no camera move. All energy is in the transitions landing on the beat.
2. **Push lands ON the letter name.** Both full-frame cards (sky included) slide left over 11 frames, ease-in-out,
   starting 0.18 s before the downbeat. The very first push (hook -> A) also swings with a ~28 deg yaw.
3. **Hard cut + pop ON the object word.** Scale per frame `0.25, 1.16, 1.22, 1.10, 0.96, 0.93, 0.98, 1.01, 1.02, 1`.
4. **Label fades in** over 13 frames from the pop frame: ALL CAPS, heavy rounded font, the LETTER's colour, white outline, at 16 % of the height.
5. **Rainbow order** (`RAINBOW` in timing.ts): red, orange, yellow, green, cyan, blue, navy, purple, repeat.
   Letter colour = label colour.
6. **Inflated plastic, not flat.** Heavy rounded glyph (Fredoka 700 + fattening stroke), 16 darker depth copies down-right,
   SVG lighting filter (`puffXL/L/M/S`) for the glossy pillow shading.
7. **Every letter has a kawaii face** (oval eyes + catch-light, blush, smile; open grin on every 4th). Placement is
   automatic (`fitFace`): the biggest face whose eyes and mouth land on solid body, never in a hole.
8. **Bright sky, never dark:** flat `#84d8f8`, puffy clouds bands top and bottom; luma 165-195.

## Pipeline (proven 2026-11-21, `c:\Projects\phonics-song`, A-H, 28.4 s)
1. **Plan the 8 items.** Words a toddler knows, one clear object each, easy to draw. Avoid words whose sound
   misleads (e.g. "Giraffe" for G is fine for letter-name songs, bad for phonics sound songs). Check with the user
   only if the theme is unclear; otherwise just pick (part N of the series = next 8 letters).
2. **New project:** copy `templates/phonics/` to `c:\Projects\<name>`; link node_modules from a project that has
   Remotion 4.0.250 (`cmd //c "mklink /J node_modules ..\jab-bhagwan\node_modules"`), or `npm i remotion@4.0.250 @remotion/cli@4.0.250 @remotion/bundler@4.0.250 @remotion/renderer@4.0.250 react react-dom`.
3. **Edit `song.json`:** `items: [{letter, word, toy, image?, color?, say?}]`, `bpm` (76), `introBeats` 2, `tailBeats` 2,
   `voice` (en-US-AnaNeural; en-GB-MaisieNeural for British), optional `voiceRate`/`voicePitch`.
4. **Toys:** `src/toys.tsx` has apple, banana, cat, dog, elephant, fish, guitar, hat. For a new word either
   (a) draw a toy component there (flat shapes in a 600x600 box centred on 300,300; body parts in `<P>` = puff filter,
   eyes/details on top unfiltered; big head, short body, facing camera), or (b) put a transparent PNG in
   `public/objects/` and set `"image": "objects/x.png"` (an image model gives the closest match to the reference's
   3D toy renders; prompt: "cute glossy 3D vinyl toy <object>, kawaii, soft studio light, centred, isolated on
   transparent background"). Unknown toy without image = the word as text (visible placeholder, fix it).
5. **Vocals:** `py -3.10 audio/gen_vocals.py` -> one TTS line per letter, "B, is for banana!", saved with edge-tts
   word boundaries (`vocals/line{i}.mp3/.json`). The service sometimes fails: the script retries.
6. **Song:** `py -3.10 audio/song.py` -> `audio/mix.wav` + `cues.json`. It cuts each line at the boundaries into
   letter / "is for" / word, tape-tunes each piece (max +-4 st) toward the melody note, puts them on beats 1 / 2 / 3,
   and synthesizes the band on the same grid: uke strums (C-F-G-C per 4 lines), bass, kick 1+3, clap 2+4, 8th shaker,
   glock doubling the melody, intro arpeggio, tail ring, swish SFX on each push and a bubble pop on each object.
   Master -14 LUFS integrated, <= -1.5 dBTP.
7. **Stills:** `node scripts/stills.mjs out/s/p_ 10,47,75,96,98,120 0.4` (hook, mid-push, letter, pop frames, object).
   Letter i is on screen at frame `round((1.58 + 3.158*i + 1.0)*30)`, object i at `round((3.158*(i+1) + 0.6)*30)`.
   Check: face on body (not in a hole), counters of B/D/O/P/R open, toy fills ~70 % width, label readable.
8. **Render + mux:** `node scripts/render.mjs out/video.mp4`, then
   `ffmpeg -i out/video.mp4 -i audio/mix.wav -map 0:v:0 -map 1:a:0 -c:v copy -c:a aac -b:a 192k -shortest out/<name>.mp4`
   (ffmpeg = `node_modules/@remotion/compositor-win32-x64-msvc/ffmpeg.exe`).
9. **QA:** transcribe the mix with Whisper (no prompt) - every line must read "X is for Y". If a letter is misheard,
   set `say` (e.g. `"say": "Zee"`) and regenerate that line. Verify duration = `TOTAL` frames / 30.
10. **Deliver** the mp4 and save memory.

## Measured pitfalls (fixed in the template, keep them fixed)
- Isolated syllables from TTS are bad ("A!" -> "hey", "Hat!" loses its t, phonetic "Ay" -> "I"): always synthesize the
  whole line and cut at word boundaries. Plain letters read best; `say` only for the rare misread.
- The fattening stroke closes counters if > ~0.05 em (B, G turn into blobs): `FAT = 0.042`.
- Face fit must not be cached before the font loads (fallback-font mask): guarded by `document.fonts.check`.
- Tape tuning changes length too: keep shifts <= 4 semitones; the melody is chosen near the child voice's own range.
- Light-blue toys vanish into the sky: give them a darker blue (`#5eb2e6` elephant) or an outline.
- Words longer than ~1.3 s at 76 BPM (3+ syllables, e.g. "Xylophone") overrun beat 4: song.py prints a warning;
  raise `voiceRate` or lower `bpm` to 70.

## Variants
- **Next parts:** I-P, Q-X, Y-Z (+ A-Z recap). Same `song.json`, next items; colours continue the rainbow via index.
- **Numbers / colours / shapes:** any glyph works as `letter` (digits, lower case); the lyric pattern is
  "`<say or letter>`, is for `<word>`" - change the f-string in `gen_vocals.py` (keep "is for <word>" as the last
  three words or update the slicing in `load_clip`).
- **Hindi / Marathi alphabet:** set an hi-IN / mr-IN voice and a Devanagari font with a bold weight; the face fit and
  the rest work unchanged. Test fitFace on conjunct glyphs in stills.

## Software
Remotion 4.0.250 (no three.js needed), Python 3.10 with numpy, scipy, edge-tts (present). Fredoka font (OFL) ships in
`templates/phonics/public/fonts/`. Whisper QA: `py -3.10 -m venv` + `pip install faster-whisper` (model "small", CPU int8).
