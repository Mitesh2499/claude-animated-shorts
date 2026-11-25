---
name: data-story-reel
description: Make a 45-70 s vertical DATA-STORY / STATS ANALYSIS reel (box-office race, sales/market share, sports or creator stats, "X is ahead here but behind there - why?") in Hindi or English, laid out for Instagram's safe zones - short headline at 15-24 %, poster/chart visual at 24-56 %, rolling 2-line karaoke subtitles at 56-65 %, nothing important in the top 14 % or bottom 35 %. Scenes are data-driven (poster face-off, leaderboard, zoomed gap ruler, vertical bars, period trend with drop arrow, line chart with ghost reference, scenario bars, target gauge, prediction poll, big number) so a new reel needs only numbers + script in script.json. Proven on the Ramayana vs Baahubali 2 vs Dhurandhar 2 box-office reel (2026-11-23). Use when the user gives numbers/tables and asks for an analysis reel, a box-office / collection / comparison video, "make it a data reel", "like the Ramayana reel", or charts + posters with voice-over. For tool/tips listicles use kinetic-listicle-short; for stories use illustrated-parallax-short / cartoon-3d-short.
---

# Data-story reel (safe-zone layout, data-driven charts, Remotion)

Template: `templates/data-story/` (`script.example.json` = the full Ramayana reel, `src/scenes_data.tsx` = the 10 data scenes, `src/Listicle.tsx` = safe-zone layout + karaoke, `build.py` = voice/timeline/mix/posters).
Proven: `stories/reel06-ramayana-boxoffice/` (v3 built only from script.json with this template; project `c:\Projects\reel07-ramayana-datastory`).
Shares the brand kit, voice pipeline, icons (theSVG) and QA with `kinetic-listicle-short` - read its Gotchas too.

## 1. The storyline (what makes a data reel watchable)
A data reel is an argument, not a news bulletin. Shape every reel as:
1. **Contradiction hook (<= 4 s)** - a real tension from the data: "X is #1 overseas... so why is it behind worldwide?" First-person or direct question; the visual shows the rivals and the surprising badge/rank/stamp.
2. **The scoreboard** - the headline metric for all contenders (leaderboard), then **animate the gap**, not just the totals (gap ruler with counting brackets).
3. **The twist** - split the metric (domestic vs overseas, week 1 vs week 2, channel A vs B) so the contradiction is explained.
4. **The trend** - what is happening now (period bars with a % drop, then a recent recovery line WITH context, e.g. last week's ghost line).
5. **The projection** - 2-3 labelled scenarios from a stated model, crossing the rivals' benchmark lines; a target gauge for the round number everyone talks about.
6. **The question** - prediction poll ("1,800 / 1,900 / 2,000+? Comment"), then follow. Viewers answering = comments.
One fact on screen per beat. Never five numbers at once.

## 2. Screen layout: Instagram safe zones (mandatory)
| Zone (1080x1920) | y px | % | Content |
|---|---|---|---|
| Top UI | 0-270 | 0-14 % | nothing important |
| Headline | 285-465 | 15-24 % | section `title`: 4-8 words, 78 px, one accent colour, optional small second line (`"s":"small"`) |
| Visual | 470-1070 | 24-56 % | data scene on a 1080x600 canvas, content inside x 65-1015 |
| Subtitles | 1082-1240 | 56-65 % | karaoke voice-over, max 2 rolling lines (current + previous), right margin 130 px (action buttons) |
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
| `poll` | prediction question, options pop on cue, cursor hover, comment button | `poster{id,img}?, question, sub?, options[{t,cue,color?}], commentCue, button` |
Colours accept names (red, green, amber, blue, cyan, violet, slate, saffron) or hex. New chart type -> add a data-driven component to `scenes_data.tsx` and register it in `DATA_SCENES`.

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
4. `npx tsc --noEmit -p .`, then stills at each section end with red guide lines at 14 % and 65 % (all headline/number/subtitle pixels between them).
5. Render silent -> mux (`-map 0:v:0 -map 1:a:0`) -> QA on the final MP4: 0 black frames, motion metric (0.4 s windows, start-vs-end mean diff > 1.0) >= 90 % (safe-mode canvas push-in 7 % gives ~95 %), audio about -13 to -15 dB, peak <= 0.95.
6. Deliver mp4 + cover still (hook end frame) + script.json + SCRIPT.md to `stories/<name>/`; keep older versions as `v1_`, `v2_`.
