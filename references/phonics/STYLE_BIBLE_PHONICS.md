# Style bible: "phonics song short" (study of the Raw/ ABC Phonics Song A-H, 2026-11-21)

Private study only. The file in `Raw/` is someone else's channel content: never upload it, never reuse its images,
melody or recording. We keep the FORMAT, TIMING and TECHNIQUE; our letters, toys, melody, band and voice are our own.
Sheets: `sheets/sheet0-2.jpg` (every 0.5 s), `transitions_pop_push.jpg` + `transitions_hook_end.jpg` (every frame
around each transition), `push_detail.jpg`, `hook_push_detail.jpg`, `audio_spectrogram.png` (red lines = cuts).

## Format (measured)
- 720x1280 vertical (we render 1080x1920), 30 fps, 26.37 s, AAC 44.1 kHz stereo 128 kb/s.
- Teaches 8 letters (A-H) in one short = "part 1" of a series (I-P, Q-X, Y-Z + recap follow). It ends abruptly
  on the last word, so the Short loops straight back into the hook grid.
- No narrator, no intro title, no outro, no CTA, no watermark. The only text is the object word.

## Structure: one sung line = one bar = two cards
Lyrics (Whisper, word-timed): "A is for apple. B is for banana. C is for cat. D is for dog. E is for elephant.
F is for fish. G is for guitar. H is for hat."

| t (s) | card | what happens |
|---|---|---|
| 0.00-1.20 | HOOK grid | 3 rows: letter left, its object right (A apple / B banana / C cat). Letters alone on frames 0-1, objects appear hard on frame 2. This is also the thumbnail. |
| 1.20-1.60 | push (with yaw) | grid slides out left, the big A swings in from the right with a perspective tilt (only this first push tilts). |
| 1.60-3.10 | LETTER A | "A ... is for" sung over it. Completely still. |
| 3.10 | hard cut + POP | object pops in on the object WORD; word label fades in. |
| 3.10-4.43 | OBJECT apple + "APPLE" | still. |
| 4.43-4.80 | push | next letter pushes the object out to the left, landing ON the next letter name. |
| ... | repeat | B 4.8, banana 6.23, C 7.9, cat 9.47, D 11.4, dog 12.4, E 14.4, elephant 16.4, F 17.9, fish 19.5, G 21.0, guitar 22.5, H 24.2, hat 25.63, end 26.37 |

Line period = 3.16 s = 4 beats at 76 BPM. Letter name on beat 1, "is for" on beat 2-2.5, object word on beat 3,
held through beat 4. Picture: letter card for beats 1-2, object card for beats 3-4.

## Motion (measured frame by frame; nothing else moves)
- **Holds are 100 % static.** Frame difference is exactly 0 between transitions: no bob, no breathing, no camera.
  All the energy comes from the cuts landing on the beat. (Our template keeps this; do not add idle wobble.)
- **Pop (letter -> object):** hard cut, then object scale per frame
  `0.25, 1.16, 1.22, 1.10, 0.96, 0.93, 0.98, 1.01, 1.02, 1.00` (overshoot 22 %, one undershoot 7 %, settled in 9 frames = 0.3 s).
- **Label fade:** opacity 0 -> 1 linearly over 13 frames (0.43 s) starting on the pop frame. No slide, no scale.
- **Push (object -> next letter):** both full-frame cards (sky included) translate left together over 10-11 frames,
  ease-in-out. Starts ~0.17 s before the letter's downbeat, so the letter is centred as it is sung.
- **Hook push:** same push plus a perspective yaw (~25-30 deg) on the incoming and outgoing cards.

## Look (measured)
- Sky blue `#84d8f8` = 60 % of all pixels; white puffy clouds `#dfeeeb` (14 %) in a band at the top and a band at the
  bottom, a few small ones between. Same sky on every card; clouds sit differently per card so the push reads.
- Luma 165-195 (bright), saturation 112-159. Never dark, never a gradient sky.
- **Letters:** glossy inflated 3D plastic (like vinyl toys / balloon letters), heavy rounded font, side depth shown to
  the lower right, soft specular on the upper-left shoulder. Colours follow the rainbow in order:
  A red `#cb211b`, B orange `#d8621c`, C yellow `#efad2d`, D green `#8dc641`, E cyan `#40bae2`, F blue `#1545a0`,
  G navy, H purple `#60289d` (ROYGBIV, then repeat).
- **Kawaii face on every letter:** two dark-brown oval eyes with a white catch-light, pink-red blush below-outside,
  small arc smile (open laughing mouth on some letters: D, H). The face sits on solid letter body, never in a hole.
- **Size and placement:** letter ~72 % of the frame width, ~42 % of the height, centred at 54 % of the height.
  Objects the same box (60-80 % width).
- **Objects:** cute 3D toy renders in the same glossy plastic, chibi animals with big heads, sitting, facing camera.
- **Word label:** ALL CAPS, heavy rounded sans, in the LETTER's colour, thin white outline + soft shadow, centred at
  ~13-16 % of the height, cap height ~4 % of the frame height.

## Sound (measured)
- 76 BPM (beat 0.789 s), key C major (chroma C 1.0, G 0.84, A 0.70, E 0.67).
- Overall RMS -17.2 dB, peak 0.78 (about -14 LUFS). Vocal sits on top; the band is light (bass + soft percussion),
  the spectrogram is dominated by the sung harmonics (fundamental 250-500 Hz: child/female voice C4-C5).
- The first 1.6 s (hook grid) is music only. The vocal is sung (sustained vowels with vibrato), not spoken.
- Quiet gaps between lines are short (-37 dB at 20.0-20.6 s before "G"). No SFX layer is audible; the cuts are
  carried by the vocal onsets.

## What makes it work (the rules we copy)
1. One idea per card, one card per half-bar. A toddler always knows what to look at.
2. Picture changes ONLY on sung beats: letter name -> push lands; object word -> pop.
3. The object word is written in the letter's colour, so colour = letter = word.
4. Rainbow order across the alphabet gives the series a recognisable look.
5. Faces make letters characters. Toys, not photos.
6. 8 letters per Short, ends mid-song so it loops; the series covers A-Z in 4 parts.
