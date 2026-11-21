# Style bible: "illustrated parallax short" (study of Raw/ Krishna short, 2026-11-21)

Private study only (the file in `Raw/` is someone else's work with a visible creator watermark).
Never upload it, never copy its drawings, script or watermark. We keep the TECHNIQUE, not the art.
Sheets: `sheets/sheet0-2.jpg` (every 0.5 s), `sheets/key_frames.jpg`.

## Format (measured)
- 1080x1920 vertical, 40.5 s, 60 fps container, AAC 44.1 kHz stereo. Drawn motion is stepped (see Motion).
- No title card, no captions, no intro or outro. The first frame is already the scene. Story is told only through pictures, music and sfx (no narration audible in the sampled spectrum; the track is ambient/low until 16 s and loud music after 18.5 s).
- The only text is a small hand-written creator watermark, low opacity, bottom-left. (We never add one that copies someone else's. Our optional mark is our own channel tag.)

## Story shape (7 shots, ~6 cuts in 40 s)
| t (s) | shot | what happens |
|---|---|---|
| 0-3.3 | S1 locked wide, vertical frame | Sad beggar woman + crying child sit by a wall. Passer-by seen only as LEGS entering from the left (face never shown, saves animation). |
| 3.3-6.3 | S1 cont. | Second passer-by, carried bag swings through frame. Slow push-in 3 %/s. |
| 6.3-7.6 | S1 cont. | Green-shirt man's leg kicks the bowl: white 4-point starburst on contact, translucent "ghost" smear of the leg for 2-3 steps. |
| 8.0-9.6 | S2 extreme close insert | Bowl lands, rice grains scatter, wall drops to darker yellow (mood dip). Hard cut in, hard cut out, 1.3 s. |
| 9.7-13.4 | S1 again | Woman weeps (tears), push-in 2.4 %/s, held. |
| 13.5-16.4 | S3 letterbox eyes | Dip to dark, black bars (about 2.3:1 slit), eyes of the god open and glow cyan-white: reveal beat. |
| 16.5-18.4 | S4 villain medium | Man smoking with sunglasses, bright pale background, 1.9 s, ends on a hard cut at 18.37 s (frame diff 67, the loudest cut). |
| 18.5-26.4 | S5 Vishwaroop hero | God floating over teal storm clouds, sun glow behind, arms multiply 2 -> 4 -> 6 -> 8 (staggered 19-23 s), yellow mandala halo scales in 22-24 s. Slow push 1-1.6 %/s. Music jumps 11 dB here. |
| 26.5-31.5 | S6 two-shot | Man again, then the god enters from the right (back to camera), blue hand grabs his throat, man grins -> gritted teeth. |
| 32-36.6 | S6 punishment | Man's face breaks into bloodshot horror (fangs, red streaks), jittering spiky outline on shirt, hold with tiny shake. |
| 36.7-40.5 | black | Hard cut to black; audio decays over the black (tail 3.8 s). |
Formula: **cruelty -> witness (silent close-up) -> divine reveal -> karmic punishment -> black.**

## Camera and videography (measured with feature tracking)
- It is a PUSH-IN CAMERA ON A FLAT PAINTING. No true 3D, no handheld.
  - Slow push on holds: +3.2 %/s (S1 opening), +2.4 %/s (weeping), +1.65 %/s then +0.94 %/s on the hero, ~0 %/s on the final shake hold.
  - Slight drift opposite to the zoom centre (about 1 % of width up-left) so the push is off-centre.
  - S4 and S6 do a small pull-back/roll (-3.6 %/s, 9-22 deg total roll on the entrance).
- Cuts: hard cuts only, no dissolve except the dip-to-dark before the eye shot (0.5 s) and the final cut to black. Scene-change score 15-20 for in-scene cuts, 67 for the hero cut, 147 for the black.
- Framing: characters sit low-centre with headroom of about 25 %; foreground interruptions (legs, bag) cut off at the frame edge; subject at thirds when two characters (man left 1/3, god right 1/3, back to camera = over-the-shoulder).
- Lens language: background blurred with a soft gaussian (bokeh) in S4/S6 so the street looks out of focus; S1/S5 are sharp. Foreground wide-angle feel from large legs.
- Shot lengths: 3.3, 3.0, 1.3, 3.7, 2.9, 1.9, 7.9, 5, 5, 3.8 s. Average ~3.8 s, one 8 s hero hold.

## Animation (the cheap tricks that read as expensive)
- **Stepped drawn motion, ~10-15 fps.** Pixel changes land every 3-7 frames of the 60 fps stream (diff spikes 2-12 between flat 0.0 frames). Build with `hold={3..6}` on 30 fps (one new pose every 3 frames = 10 fps).
- **Cut-out limbs.** Body is one flat layer; arms, hair, cloth, eyes are separate layers rotated about joints. The multi-arm god is the same arm sprite duplicated with staggered delays.
- **Impact language:** white 4-point starburst (2-3 frames), translucent smear/ghost copy of the moving limb, object squash on landing, debris grains (rice) tossed in arcs, camera cuts to extreme close-up for the landing.
- **Emotion language:** tears as small drops added to a held face, mouth swap (smile -> gritted -> scream) every few steps, horror = swap to a second pre-drawn "broken" face layer plus jittery spike outline.
- **Light as story:** warm yellow wall + diagonal hard-edged sun shadow = harsh street; teal + white halo = divine; pale overexposed sky = villain's arrogance; black = judgement.
- **Cheap parallax:** hero sprite on top of clouds layer that scrolls up slowly while the sprite floats with a sin() bob (about 1.5 % of height, 3 s period).

## Look (measured)
- Flat cel colour, thin black or dark-tone linework, 1-2 shade levels per colour, hard shadow shapes (not soft gradients) on characters; painterly textured backgrounds in the hero shot only.
- Luma (0-255): S1 136, insert 126, eye shot 28, villain 184, hero 139, two-shot 154. 5th/95th percentile 33-60 / 150-253: never crushed, highlights clip in white skies.
- Mean saturation (0-255): S1 121, insert 186 (peak), hero 144, villain 81-106.
- Palettes (k-means, % of pixels):
  - Street: wall `#f8dd61` / shadow `#bc9b09`, ground `#a99b81`, ink `#3a3233`, bowl teal `#478f7e`, skin `#83573d`.
  - Insert: `#be9b05` 53 %, `#444333`, `#77570f`.
  - Divine: deep teal `#0e3f43` / `#367d86`, glow `#90ecef` / `#e8faed`, god's dhoti gold `#c8b21b`, sash crimson `#7f0d28`.
  - Two-shot: pale sky `#f4f6ec`, ink `#303026`, shirt `#aceca3`, trousers `#5b8272`, god's skin blue `#56aeea`, gold bands, crimson `#8a162f`.
- Rule: one warm/cold pair per beat (yellow vs teal), accent crimson + gold only on the divine figure.

## Sound (measured)
- 0-16 s: ambient bed only, RMS about -31 dB, spectral centroid 3 kHz (street hiss, footsteps, bowl clatter).
- 16.5 s: first low swell, 18.5 s: full score enters, RMS -14 dB, centroid 1.2-1.8 kHz (choir/drone/low drums), +11 dB step at the hero cut.
- Hits on contact (kick, grab) as short wide spikes; silence between them. Final 3.8 s: score decays over black.

## Reading for our own scripts
- Hook inside 1 s: an unfair act in the first frame, with a sad reaction already visible.
- Do not show the villain's face during the crime (legs only); show the face only when he is about to be punished. Saves art and raises the payoff.
- Keep 7 distinct images per 40 s; every shot has one idea and one change in the picture.
