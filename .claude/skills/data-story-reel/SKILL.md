---
name: data-story-reel
description: Make a 45-70 s vertical DATA-STORY / STATS ANALYSIS reel (box-office race, sales/market share, sports or creator stats, "X is ahead here but behind there - why?") in Hindi or English, laid out for Instagram's safe zones - short headline at 15-24 %, poster/chart visual at 24-56 %, rolling 2-line karaoke subtitles at 56-65 %, nothing important in the top 14 % or bottom 35 %. Scenes are data-driven (poster face-off, leaderboard, zoomed gap ruler, vertical bars, period trend with drop arrow, line chart with ghost reference, scenario bars, target gauge, prediction poll, big number) plus "2.5D" scenes learned from the Rajasthan Royals innings reel (3D cricket-ball unit grids with camera dive, extruded 3D bars with a top-down-to-side camera swing, keycap word tiles, rewind counter, scorecard progress, phase rows, record stack, deadpan stamps, strike-through, fake-UI punchline), section kickers and flash/zoom/dive/whip transitions, so a new reel needs only numbers + script in script.json. Proven on the Ramayana vs Baahubali 2 vs Dhurandhar 2 box-office reel (2026-11-23); 2.5D scenes proven in c:/Projects/reel10-depth-lab (2026-11-25). Use when the user gives numbers/tables and asks for an analysis reel, a sports-innings / player-record breakdown ("like the RR / Vaibhav reel"), a box-office / collection / comparison video, "make it a data reel", "like the Ramayana reel", or charts + posters with voice-over. For tool/tips listicles use kinetic-listicle-short; for stories use illustrated-parallax-short / cartoon-3d-short.
---

# Data-story reel (safe-zone layout, data-driven charts, Remotion)

Template: `templates/data-story/` (`script.example.json` = the full Ramayana reel, `src/scenes_data.tsx` = the 10 data scenes, `src/Listicle.tsx` = safe-zone layout + karaoke, `build.py` = voice/timeline/mix/posters).
Proven: `stories/reel08-gta6-vs-endgame/` (Kokoro voice, versus/overtake/catch/split/balance, 56 s) and `stories/reel06-ramayana-boxoffice/` (v3 built only from script.json with this template; project `c:\Projects\reel07-ramayana-datastory`).
Shares the brand kit, voice pipeline, icons (theSVG) and QA with `kinetic-listicle-short` - read its Gotchas too.
**Before writing a script, read `references/rr-anatomy-lessons.md`** (scripting devices + editing grammar + the 3D-in-2D trick, learned from the best-edited reel in Raw/). 2.5D scenes: `src/scenes_depth.tsx`; full demo of every new scene: `script.depth.example.json`.

## 0. Voice: Kokoro hm_omega (DEFAULT, user's pick 2026-11-25)
- The user judged edge-tts robotic; after an A/B of free voices (c:\Projectsoice-lab, COMPARE_*.wav) they picked **Kokoro-82M `hm_omega`** (Apache-2.0, local). Measured closest to natural reels: rhythm nPVI 46 vs refs 46-56 (edge Madhur at +25 % = 30), best Whisper intelligibility.
- script.json: `"engine": "kokoro", "kokoroVoice": "hm_omega", "kokoroSpeed": 1.0, "whisperLang": "hi"`. build.py batches every section into `C:/Projects/voice-lab/kokoro_tts.py` (venv `C:/Projects/voice-lab/.venv`), which synthesises on CPU (~0.6x realtime) and gets word timings by running faster-whisper on the result and aligning character-by-character to our words (so karaoke stays word-accurate). Unchanged sections are cached.
- NEVER speed the voice up to hit a length: speed-ups made edge voices robotic. Cut words instead. Kokoro Hindi speaks ~2.2 words/s -> ~110 spoken words for 50 s.
- Write `say` in Devanagari only (Kokoro's Hindi G2P mangles Latin): "GTA 6" -> "जी टी ए सिक्स", "$3.79 बिलियन" -> "तीन पॉइंट सात नौ बिलियन डॉलर".
- Cue words: matching strips matras/anusvara, so very short words ("हाँ" -> "ह") match the wrong token; cue on a distinctive word ("रिकॉर्ड") or a number.
- If voice-lab is missing: create the venv, `pip install kokoro faster-whisper soundfile` (+ torch); Kokoro runs on CPU (GPU path hits a cuDNN conflict here).

## 1. The storyline (what makes a data reel watchable)
A data reel is an argument, not a news bulletin. Shape every reel as:
1. **Contradiction hook (<= 4 s)** - a real tension from the data: "X is #1 overseas... so why is it behind worldwide?" First-person or direct question; the visual shows the rivals and the surprising badge/rank/stamp.
2. **The scoreboard** - the headline metric for all contenders (leaderboard), then **animate the gap**, not just the totals (gap ruler with counting brackets).
3. **The twist** - split the metric (domestic vs overseas, week 1 vs week 2, channel A vs B) so the contradiction is explained.
4. **The trend** - what is happening now (period bars with a % drop, then a recent recovery line WITH context, e.g. last week's ghost line).
5. **The projection** - 2-3 labelled scenarios from a stated model, crossing the rivals' benchmark lines; a target gauge for the round number everyone talks about.
6. **The question** - prediction poll ("1,800 / 1,900 / 2,000+? Comment"), then follow. Viewers answering = comments.
One fact on screen per beat. Never five numbers at once.

**Script devices that make it watchable** (details + examples in `references/rr-anatomy-lessons.md`):
- **Borrowed-anxiety cold open:** a feed-wide topic, then pivot ("Worried AI will take your job? Imagine being a bowler.").
- **Name / word assembly gag** → `tiles3d`.
- **Deadpan rhetorical Q&A** ("No." / "Also no.") → `stampQA`.
- **Outcome first, then "Let's rewind"** → `progress` → `rewind`.
- **Translate every number into everyday meaning** ("more likely to go for six than not", "96 % without running", "almost half the time").
- **One dry understatement per big number** ("on paper: not ideal", "the rope was decorative"). No hype words.
- **A repetition run with a broken last beat** ("…Also Vaibhav.") → `recordStack`.
- **One meta joke near the end.**
- **A callback ending** that answers the first line.
- **Lines of 4-9 words**, with a short pause before each punchline and a visual hit on it.

## 2. Screen layout: Instagram safe zones (mandatory)
| Zone (1080x1920) | y px | % | Content |
|---|---|---|---|
| Top UI | 0-270 | 0-14 % | nothing important |
| Headline | 285-465 | 15-24 % | section `title`: 3-6 words, 90 px, one accent colour, optional small second line (`"s":"small"`) |
| Visual | 470-1070 | 24-56 % | data scene on a 1080x600 canvas, content inside x 65-1015 |
| Subtitles | 1076-1240 | 56-65 % | karaoke voice-over, max 2 rolling lines (current + previous), 52-78 px (user asked for bigger text), right margin 120 px; each block line <= ~22 characters so it never wraps |
| Bottom UI | 1248-1920 | 65-100 % | only the small watermark |
`"layout": "safe"` in script.json turns this on. Attention order: visual interruption -> headline -> evidence -> explanation (voice/subs) -> CTA question. Headline 70-90 px, key numbers 48-190 px, subtitles 44-58 px. Write `blocks` as short subtitle lines (~30 characters, one idea).

## 3. Step 0: intake (ask before building, one AskUserQuestion round)
- **Data + source + cutoff date**: use ONE consistent dataset; put `"source": "Source: X · date · estimates"` in script.json (drawn on every chart). Check the user's arithmetic (gaps, sums, % drops, scenario maths) and say what you corrected; never invent numbers; derived values are labelled "≈" with the formula in `srcExtra`.
- **Posters / logos / photos**: never download studio posters or third-party artwork; ask the user to drop them into `brand/cards/` (any file name; build.py copies them to `_p_<name>` and writes `src/posters.json`). Each `entities.<id>.poster` names the file stem (lower-case). Missing posters fall back to a drawn title card in the entity colour.
- **Language + voice**: Hindi male `hi-IN-MadhurNeural` (+25 %, ~2.4 words/s) or English `en-US-AndrewNeural` (+14-18 %). Captions in the same script (Devanagari via Noto Sans Devanagari).
- **CTA**: prediction poll + follow (default), poll only, or follow only. No fake poll results, no promised resources.
- Handle/logo come from `brand/profile.json` (already set: @MiteshJourney).

## 4. script.json (data-driven)
Top level: `layout: "safe"`, `voice`, `rate`, `source`, `entities: { id: { name, en, color, dark, poster } }`, `sections[]`.
Section: `{ kind: "scene", scene: <name>, title: [spans], data: {...}, blocks: [[spans]], sfx: [...], minDur? }`; final `{ kind: "follow" }`.
Spans: `{ t, s?: small|big|bar, c?: colour, say? }`. **Numbers are said as words in `say`** ("₹1,813 करोड़" -> "अठारह सौ तेरह करोड़", "Baahubali 2" -> "बाहुबली टू"); the screen keeps digits. Cues are display words; numbers match without ₹/commas ("1813", "47%").

Scenes (`src/scenes_data.tsx`, all read `data`):
| scene | use | data |
|---|---|---|
| `posterFaceoff` | hook: centre poster vs two rivals, badge, ranks, stamp | `center, sides[2], badge{text,icon,color,cue}, stamp{text,cue}, ranks[{id,n}], centerImg?` |
| `bigNumber` | "numbers first" hook / single stat | `v, unit, suffix, cue, caption, color` |
| `leaderboard` | ranked horizontal bars, count-up on cue | `rows[{id,v,cue}], max, unit, highlight, note` |
| `gapRuler` | zoomed axis (labelled) + red gap brackets | `lo, hi, step, zoomLabel, from{id,v}, marks[{id,v}], gaps[{v,d,cue,label}], unit, suffix` |
| `vbars` | split metric (India net, overseas...) with posters under bars | `items[{id,v,cue}], max, unit, label, labelColor, labelIcon, win?, trophy?, intro{cue,icon,color}?` |
| `trendBars` | periods + % drop arrow; partial period dashed | `items[{name,sub,v,cue?,partial?}], max, unit, label, drop{from,to,text,cue}` |
| `lineChart` | daily trend + ghost reference line | `points[{name,v,cue?,approx?}], max, ticks, unit, label, ghost{v,text,cue}, srcExtra` |
| `scenarios` | projection bars from "now" crossing benchmark lines (zoomed) | `now, nowLabel, lo, hi, lines[{text,v,id?|color,below?}], bars[{name,v,cue,color?}], introCue, srcExtra` |
| `gauge` | progress to a round target + "still needed" | `now, target, cue, unit, ofText, needText, alt{v,cue,text}` |
| `versus` | two posters + VS + stamp (hook / face-off) | `left, right, vsCue, stamp{text,cue}` |
| `overtake` | bar B races past bar A + % badge | `a{id,v,label}, b{id,v,label,cue}, unit, suffix, max, diff{text,cue}` |
| `catchFreeze` | grey freeze + WAIT! stamp (the twist) | `stamp, sub, cue, left, right` |
| `splitCompare` | two columns of like-vs-unlike facts on cue | `left{id,head}, right{id,head}, rows[{l,r,cue}]` |
| `balance` | see-saw tips then levels with ? (verdict) | `left{text,color}, right{text,color}, tipCue, levelCue` |
| `poll` | prediction question, options pop on cue, cursor hover, comment button | `poster{id,img}?, question, sub?, options[{t,cue,color?}], commentCue, button` |
**2.5D scenes** (`src/scenes_depth.tsx`: plain-SVG perspective camera, shaded spheres/boxes, no WebGL). Cues accept `"word#2"` for the 2nd occurrence.
| scene | use | data |
|---|---|---|
| `ballGrid` | unit visualisation: one 3D ball per item drops in (counter ticks), subset recolours, share bar, rope lasso, dive | `groups[{n,cols?,color?,label?,unit?,count?,cue,span?}], flip{n,color,cue,group?}, split{cue,a,b}, rope{cue,label}, pitch?, yaw?` (≤ ~110 balls per group; 2 groups = record vs new) |
| `bars3d` | composition of a total as extruded 3D bars; flat tiles seen from above swing to a side view on cue; counters left | `items[{label,v,color,cue}], max?, unit?, big{v,suffix,text,cue}` |
| `tiles3d` | keycap word tiles drop in, merge into one word; optional dictionary card with strike + "in this case" | `tiles[{t,color?,ink?,cue,note?}], merge{t,color,cue,note}, card{cue,head,tag,def,strike,strikeCue,altLabel,alt,altCue}` |
| `rewind` | outcome counts back to 0 with ◀◀ REWIND (time-travel bridge) | `from, to?, cue, dur?` + sfx `rewind` |
| `progress` | "12.5 overs of 50" pip strip + layered target track (needed vs scored) | `pips{v,total,label,cue}, track{total,label,cue}, segs[{v,color,cue,text}]` |
| `phaseRows` | thin rate bars per phase + dashed threshold + stat boxes | `rows[{label,sub,v,display,color,cue}], max, ref{v,label,cue}, boxes[{label,v,unit,cue}]` |
| `recordStack` | "?" placeholders flip into the same name (repetition gag) | `rows[{label,qCue,name,v,unit,cue,img?}], footer{t,cue}` (`img` = stem in brand/cards) |
| `stampQA` | rhetorical questions answered by slammed stamps | `rows[{q,cue,a,aCue,color?}]` + sfx `slam` |
| `strikeList` | old benchmarks struck through + big stamp ("IRRELEVANT.") | `rows[{label,v}], strikeCue, stamp{text,cue}` |
| `verifyCard` | fake-UI punchline (captcha that fails) | `title?, check?, status, cue, fail, failCue` + sfx `error` |

**Section extras:**
- `"kicker": "balls faced"` shows a mono `// BALLS FACED` label above a left-aligned 68 px headline. Keep a kicker headline to 2 lines of ≤ 24 characters.
- `"enter"`: `flash` (accent flood for 0.28 s on a topic change), `zoom` (zoom-through from blur), `drop` or `whip`.
- `"exit"`: `dive` (the camera flies into the 3D objects and ends on an accent flash; `ballGrid` is built for it), `zoom` or `whip`.
- Use at most one transition per act boundary, and leave the rest as plain cuts.

**Paper theme** (the RR look in our brand): `"accent": "<one hero colour>", "theme": {"bg": "#F2EEE9", "paper": "1", "ink": "#141B4D", "blue": "#2546C9"}`. Use one hero colour for "their" numbers, blue for benchmarks and context, and grey for "everything else".
**SFX** (per section `sfx`): `clack` (ball/tile drops: `{"word":"103","type":"clack","n":18,"every":0.1,"gain":0.4}`), `slam` (stamps), `rewind`, `error`, plus the older pop/tick/whoosh/chime/glitch/boom/riser.
**3D rules:**
- Only physical things get depth (balls, bars, tiles). Text and cards stay flat.
- Every number shown as units must be the real count.
- Share bars are computed from `flip.n / group.n`, never typed.

**Story / lore scenes** (`src/scenes_story.tsx`) are for recap and explainer reels ("Before Doomsday", history, "previously on"). Proof: `C:\Projects\Reel\11-wanda-before-doomsday` (2026-11-25, `make_script.py` generates its script.json).
| scene | use | data |
|---|---|---|
| `photo` | story beat: a print card floating in 3D with Ken Burns; shots switch on cue with a zoom-through flash | `rec?: true or "REPLAY"` (viewfinder), `shots[{img, cue?, caption?, kb: in, out, left or right, freeze?: cue, desat?: cue, dust?: cue, pos?, fallback{title,sub,color}}]` |
| `chain` | 3D keycap tiles stacked vertically: cause chain or equation | `items[{t,cue,color?,ink?}], op: "↓"` or `ops: ["+","+","="]`, `result?: false`, `strike?{i,cue}` |
| `explainer` | "MCU 101 / quick definition" aside: a LIVE viewfinder with the brand avatar, the term pops in, the definition builds line by line | `label?, term, termCue?, lines[{t,cue,c?}], avatar?` (pair it with `"kokoroVoice": "hm_psi"` so the aside sounds like a second person) |
| `endCard` | cliffhanger / "PART 2" title on black | `kicker, title, cue, sub?` |

Photo effects:
- `freeze` stops the Ken Burns with a white flash and a FREEZE tag.
- `desat` drains the colour (loss, guilt).
- `dust` dissolves the shot into particles (the snap or death beat).

**Images:**
- Use only the user's own files. Put them in `<project>/images/` (copied to the cards on build) or in `brand/cards/`, and name them with the slot stem.
- Never download film stills or clips from the brief's links, even when the brief lists them.
- A missing image shows a designed placeholder that names its slot. Ship `images/README.md` (slot → shot → the user's reference) plus `rebuild.cmd`, so the user can drop files in and rebuild with the voice cached.

**Text on photos is checked for contrast automatically.** `build.py` runs `scripts/img_contrast.py`, which does the following:
- **Measures** each image as the card actually shows it (cover crop) in every overlay region: REC label, timecode, corner brackets, caption area and centre. It uses WCAG luminance at the 15th and 85th percentiles, then writes `src/imgstats.json` and `out/contrast_report.md`.
- **Text** (4.5:1) is white, navy ink, or white on a dark pill.
- **Graphics** (3:1) are white, ink, or white with a dark halo.

The `Rec` overlay reads these modes per element. Caption pills and the FREEZE tag always sit on dark pills (6:1 or better in the worst case). Stamps on photos get a solid plate (`Stamp bg`). After adding images, LOOK at full-res stills of the brightest frames before rendering.

**Story audio:**
- `"music": "dark"` gives a cinematic D-minor pad with a sub pulse.
- `"mute": true` on a section drops the music out for the silent gut-punch beat; `"mute": "fade"` fades it out on the ending.
- Per-section `"kokoroVoice"` switches the voice (Hindi voices: `hm_omega` narrator, `hm_psi` second male, `hf_alpha` female).
- SFX: `heartbeat`, `shutter` (freeze), `beep` (REC / aside start).

**Length:** Kokoro Hindi speaks 2.5-2.7 words/s. A brief's "1:50" with about 550 spoken words is really about 3:40. Count `say` words / 2.6 before building. Instagram caps Reels at 3:00, so trim the voice to match the subtitles first, and use at most `kokoroSpeed` 1.08.

**Subtitles** auto-fit: lines longer than about 28 characters shrink (to at least 72 %) instead of wrapping onto a 3rd line. Still aim for 20-28 characters.

Colours accept names (red, green, amber, blue, cyan, violet, slate, saffron, navy, accent, chalk, grey) or hex. New chart type -> add a data-driven component to `scenes_data.tsx` (or `scenes_depth.tsx` for 3D objects, reusing `proj`/`fit`/`Ball`/`Box`) and register it.

## 5. Honesty rules for data
- Same metric compared with same metric (net vs net, gross vs gross); say which ("इंडिया नेट", "ग्रॉस").
- Zero-based bars for totals; zoomed axes only with a visible "zoom: lo-hi" label.
- Partial periods labelled ("Week 3 · only 3 days", Week 1 = 8 days).
- Recoveries shown with context (previous period's ghost line).
- Projections = "our scenarios, not trade predictions", model stated in `_source`; round consistently with the table.
- Source line on every chart; mention in the reply that figures were not independently verified unless you checked them.

## 6. Pipeline
1. Intake (above) -> write `script.json` from `script.example.json` (show the user the voice-over first unless they said "just build").
2. `mkdir c:\Projects\<name>`, copy `templates/data-story/*`, junction `node_modules` -> `C:\Projects\bitter-fruit\node_modules`.
3. `python -I build.py` (voice per section with WordBoundary timings, `src/timeline.json`, `public/audio/mix.wav`, posters). Loop it up to 3x - edge-tts can drop a request. Check total length: target 55-70 s; Hindi runs long - shorten lines before raising the rate past +25 %.
   **Layout preview before any voice:** `node scripts/dry_timeline.mjs 2.4` writes fake word timings + a silent mix, so you can check stills and rough-cut the 2.5D scenes in minutes, then run build.py for the real voice.
4. `npx tsc --noEmit -p .`, then stills at each section end with red guide lines at 14 % and 65 % (all headline/number/subtitle pixels between them).
5. Render silent -> mux (`-map 0:v:0 -map 1:a:0`) -> QA on the final MP4: 0 black frames, motion metric (0.4 s windows, start-vs-end mean diff > 1.0) >= 90 % (safe-mode canvas push-in 7 %, origin 50 % 92 % so the canvas grows upward and never covers the subtitles, gives ~94 %), audio about -13 to -15 dB, peak <= 0.95.
6. Deliver mp4 + cover still (hook end frame) + script.json + SCRIPT.md to `stories/<name>/`; keep older versions as `v1_`, `v2_`.
