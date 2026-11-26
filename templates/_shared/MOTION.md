# Motion, finish, sound and assets: the shared craft reference (all skills)

Added 2026-11-25. It distils these sources:

- [motionmaxxing](https://github.com/Tejashmakwana/motionmaxxing) (Apache-2.0): about 4,300 moves measured frame by frame in 53 professional pieces.
- [LottieFiles motion-design-skill](https://github.com/LottieFiles/motion-design-skill) (MIT).
- [cinetic](https://github.com/Leonxlnx/cinetic) (MIT).
- [remotion-dev/skills](https://github.com/remotion-dev/skills).
- [reanimate](https://github.com/NiazMorshed2007/reanimate) (MIT): its method for reverse-engineering a reference.
- [librosa](https://github.com/librosa/librosa) and [WhisperX](https://github.com/m-bain/whisperX): audio analysis and alignment.
- Asset libraries: theSVG, Motive, AssetPolish, SketchValley, Sveegees, IconKing, Pulsar, LottieFiles, Lottieflow, SVG Repo and Openverse.

The rules are in our own words, and the numbers are the measured medians.

## The code

| File (canonical in `templates/_shared/`, a copy in each template) | What it gives you |
|---|---|
| `motion.tsx` | `E.*` (the 12 measured eases), `DUR`, `prog`, `arrive`, `leave`, `lookCss`, `drift`, `snapTail`, `staggerAt`, `logLerp`, `smear`, `rnd`; finish layers `Grain`, `Vignette`, `LightLeak`, `ShutterBlur` |
| `assets.tsx` | `<Asset>`, `<AnimatedSvg>`, `<SvgIcon>`, Lottie and GIF players: frame-exact, see "Assets" |
| `audio_master.py` | `master()` (−14 LUFS, true peak ≤ −1.5 dBTP, look-ahead limiter), `lufs()`, `true_peak()` (matches pyloudnorm to 0.05 LU) |
| `reel_qa.py` | QA of the final MP4: gates, cut list, motion band, LUFS/true peak, sound hits against cuts, `sheet.jpg` |
| `probe_reference.py` | A reference video turned into a motion spec: cuts and their kind (flood colour, flash, whip), shot lengths, camera pan and zoom per shot, nearest ease, sound hits, filmstrips |

Projects get the files by copying the template. After you improve a shared file, copy it into the template's `src/` or `scripts/` (the header of each file says so).

## Motion rules (measured)

1. **Durations @30 fps.**
   - Median move: 10 f.
   - Entry translate or scale: 12 f.
   - Opacity: 6 f.
   - Blur: 7 f.
   - Exit translate: 13 f; scale exit: 10 f.
   - CTA moves: 6 f.
   - Whips: 8 f.
   - Never put 20-30 f ease-outs on everything: that's slower than every professional in the sample.
2. **Landing decelerates, leaving accelerates.**
   - Entries use `snapSettle` (54 % of the travel in the first 10 % of the time) or `softLand`.
   - Exits use `accelExit` or `crashOut`, and end at peak speed on the cut.
   - Never linear for a spatial move. Linear (`cruise`) is only for fades, drift, counters and camera creep.
3. **Arrive from oversize; never grow from zero.**
   - Identity objects (headline, card, avatar, logo, icon) come down from 1.12-1.5× with a blur 8-10 → 0 px focus pull.
   - Logos can arrive from up to 3.5×.
   - Spend scale once per film; endings get smaller.
4. **Never opacity alone.** Every entry uses two or more decaying channels (offset, scale, blur). Opacity is only a 4-6 f helper. Hard-cut on for system events.
5. **Overshoot is rare, late and small.**
   - `popOver` (1.08 at t = 0.72) at most once per beat.
   - One visible spring per film (`bounceHard`).
   - No springs or overshoot on type.
   - Physical bodies (keycaps, tiles) fall with gravity (`gentleIn`) and slam; they don't wobble.
6. **Stagger.** Siblings arrive 1-3 f apart with uneven gaps (`staggerAt`), and each move runs about 2× the gap so the tails overlap. Whole words go 2-5 f apart, 8-12 f when the voice leads them. Keep the total under 0.5 s.
7. **No dead frame.**
   - A hold keeps one living thing: a linear `drift` of about 1 px/f, a 0.5-1 %/s scale creep, a counter or a caret.
   - A designed breath of 0.6-1.5 s before a payoff is good.
   - Never use a sine bob (floating reads as cheap).
   - End hold ≤ 1.4 s.
8. **Camera.**
   - A reveal is a one-frame snap (ratio 0.56-0.77) followed by a 0.3-0.6 s `softLand` tail (`snapTail`). Never one global ease-out zoom.
   - Push ×1.25 for a 6 f punch, ×1.4 for 12-18 f, ×1.5 for 20-45 f.
   - Zooms run in log space (`logLerp`).
9. **One blur grammar per film.**
   - Shutter blur (`ShutterBlur`, @remotion/motion-blur, 180°, 6 samples) is active only inside fast windows (transitions, whips, dives).
   - Inside an active window there is no per-element smear (that would blur twice).
   - Blur is also a focus tool: type resolves from 8-12 px.
10. **Words and voice.**
    - On-screen words land 0-2 f before they are heard (start 4 f early, `softLand` 7 f).
    - The white flash is reserved for meaning (FREEZE / camera shutter), not used as the default shot change.
11. **Finish (one level for the whole film).**
    - Grain 0.03 (seeded per frame).
    - Vignette 0.05 on light grounds; up to 0.15-0.2 on dark grounds.
    - Light leaks only on flash cuts.
    - A ground is a surface, not a flat swatch.
    - Set it in `script.json` with `"finish": {...}`; `false` turns it off.

## Sound rules

- **Master:** −14 LUFS integrated, true peak ≤ −1.5 dBTP (Instagram, Shorts and TikTok play at about −14). `build.py` masters automatically; `"loudness": false` turns it off.
- **Silence before the hit.** Drop the music (`mute`) on the gut-punch beat.
- **1-3 hand-placed hero hits per reel.** Each hit lands within one frame of its picture event. `reel_qa.py` reports `cuts_with_sound_hit`.
- **WhisperX (optional, not installed).** Forced alignment against the exact `say` text would tighten word timings further. It's worth installing (Hindi align model about 1.2 GB) if a reel shows words landing late. faster-whisper word timestamps are the default today.
- **librosa (installed in the voice-lab venv).** Use it for beat and onset analysis of a user-supplied music track, to cut transitions on beats: `librosa.beat.beat_track`, `librosa.onset.onset_detect`.

## QA (do it on every final; quote the numbers)

`py -I scripts/reel_qa.py out/<final>.mp4 --expect <s>` writes `out/qa/qa.md`, `qa.json` and `sheet.jpg`.

**Hard gates:**
- decodes and moves;
- length matches the plan and stays ≤ 180 s;
- 0 black frames;
- ≤ 3 blank frames in a row;
- −14 ± 1 LUFS;
- true peak ≤ −1.0 dBTP;
- audio runs to the end.

**Notes** (not gates): a still run longer than 1.5 s; an end hold longer than 1.4 s.

**Questions, not gates:**
- Mean motion: human-made films have a median of 6.8 (IQR 4.4-9.8) at full res. Above about 10, does it breathe anywhere? Below about 3, does it exist?
- Cuts per minute.

Then **look** at `sheet.jpg` and describe every tile in one sentence before you call the reel done. Never certify a reel you haven't looked at.

## Learning from a reference video (reanimate method)

`py -I templates/_shared/probe_reference.py Raw/<video>.mp4` writes `probe.md`, `probe.json`, `sheet.jpg` and `strips/`.

1. Read the numbers.
2. Look at every strip.
3. Write the lessons with numbers into the skill's `references/` (shot lengths, cut kinds and colours, move durations, nearest ease, sound-hit offsets).

Example (RR "Boss Baby" reel):
- 15 cuts in 135 s.
- Every scene change is a two-to-three-step **colour flood** (#e10e7a pink / #1d41d3 blue, 2-8 f per step) rather than a cut.
- Zooms are crashOut / accelExit dives.

## Assets: icons and animated graphics

**Static icons and logos: theSVG first** ([thesvg.org](https://thesvg.org), MIT):
- `python -I brand/fetch_icon.py search <words>`
- `python -I brand/fetch_icon.py ui <slug> [look]` (UI icon, `currentColor`, so it recolours)
- `python -I brand/fetch_icon.py brand <slug>` (official brand mark)
- Fallbacks: `fetch_logo.py` (simple-icons), then the official press kit, then ask the user.
- Animate them yourself with `<Asset src=... mode="draw|arrive|stagger">`:
  - draw-on strokes (pathLength), with fills after;
  - arrive from 1.45×;
  - staggered parts.

**Animated assets:** `python -I brand/fetch_anim.py sources | search <words> | motive <slug> | assetpolish <pack>/<name> | sketchvalley <slug> | lottie <url> | url <url> --license ... | credits`

| Library | Format | Licence | Credit |
|---|---|---|---|
| Motive (freeicon.dev) | animated SVG, 310 icons | CC0 | no |
| AssetPolish | animated SVG icons + stickers (338) | CC0 | no |
| SketchValley Motion | CSS-animated illustrations | free commercial | no |
| Sveegees | animated SVG icons | free commercial | no |
| IconKing | SVG/PNG free; animations mostly paid AI | check each | check |
| Pulsar Icons | animated SVG | free **with attribution** | **yes** |
| LottieFiles / Lottieflow | Lottie JSON / dotLottie | Lottie Simple License; check each | check |
| SVG Repo | SVG (some animated) | per icon | per icon |
| Openverse | CC images + audio | per item | per item |
| awesome-motion-graphics, Animora | resource list / browser animation editor (export MP4/PNG sequence) | per item | per item |

Rules:
- Every download is logged in `brand/animated/CREDITS.json`.
- Put the credit lines from `fetch_anim.py credits` in the caption or description when any asset needs one.
- The fetcher refuses SVGs that contain scripts.
- Render only through `assets.tsx`, never with a raw `<img>` of an animated SVG (wall-clock animation jitters in renders).
- In data-story reels, add assets per section: `"stickers": [{"src": "brand/animated/motive/check-circle-draw.svg", "at": "word", "x": 820, "y": 40, "w": 180}]`.
- `build.py` copies `brand/` to `public/brand/`.
- **Carousels (static PNG):** use theSVG icons as before. Animated assets render their first frame only, so don't rely on them there.
- **Licence over looks:** never use a GIF or Lottie with an unclear licence in a published reel.
