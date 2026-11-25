---
name: x-data-carousel
description: Research, compute and render a DATA-HEAVY X (Twitter) image thread - dense 1080x1350 stat cards in the sports-analytics style learned from Raw/XCarousel (team-colour hero panel, frosted player card with tone-coloured badge, highlights, stat rows, ball-by-ball chips, phase boxes, form strip, chase ledger, run-rate split, leaderboard, over-by-over bars, end card) in @MiteshJourney branding. Numbers are COMPUTED from raw inputs (economy, strike rate, boundary %, required rate, run rates) and reconciled by data checks that fail the build. Outputs PNG cards, thread.md (posts <= 280 chars, <= 4 images each, alt text) and QA. Proven on the 2024 T20 World Cup final death overs (2026-11-25). Use for cricket/sports match breakdowns, player cards, stats threads, "X carousel", "Twitter thread with cards", "like the willow metrics cards", or any table-heavy data post (box office, benchmarks, markets) for X. For Instagram carousels use instagram-carousel; for videos use data-story-reel.
---

# X data carousel (data → computed cards → thread)

Template: `templates/x-carousel/` (`build.mjs` = derive + checks + render + QA + thread, `x.css` = card system). Fonts are shared from `templates/carousel/fonts/fonts.css`.
Proof: `stories/x01-t20wc-final-death-overs/` (xcarousel.json, out/*.png, out/thread.md, PLAN.md).
What the references taught us: `references/design-dna.md`. Brand: `brand/profile.json` (@MiteshJourney, Electric Blue), logo `brand/logos/logo.png`.
Sibling skill: `instagram-carousel` (same render engine idea; IG is airy and one idea per slide, X is dense and table-first).

## 0. Intake (ask only what you can't infer)
- Match/event or dataset + date. Which teams/players/entities. User-owned photos? (`brand/cards/`; never download player photos or team logos: initials avatars + team colours are the default).
- Angle: duel, death overs, team watch, player form, over-by-over, season leaderboard.

## 1. Data first (this skill's whole point)
1. Collect raw numbers from primary sources: the official scorecard (ESPNcricinfo/ICC/BCCI, or Wikipedia's match page via the `web-fetch` agent; cricinfo often blocks fetches). Record every source in `sources[]`.
2. Enter RAW values only (runs, balls, 4s, 6s; overs-maidens-runs-wickets; per-phase runs; chase start + steps). Let the builder compute economy, SR, boundary %, need / balls left / required rate and run rates. Never type derived numbers by hand.
3. Add `checks[]` that reconcile the story with the scorecard: innings total = sum of phases; bowlers' runs + byes + leg-byes = total; wickets = fall-of-wickets count. The build prints `DATA/THREAD ERROR` and you must fix it before delivering.
4. If a split isn't published (e.g. runs in over 17 vs 18), **group it** ("Overs 17–18") and say so in `source`. Never interpolate. Derive bowlers of specific overs only from fall-of-wickets + dismissal type (e.g. "c Pant b Pandya at 16.1" ⇒ Pandya bowled the 17th).
5. Ratings: only show a 0-10 rating if it comes from a stated, consistent method (put it in PLAN.md and a card). Otherwise badge a real stat (econ, SR, wickets) with a `tone`.

## 2. Thread design (X rules)
- **Max 4 images per post**; 280 chars for standard accounts (URLs count 23); alt text ≤ 1000 chars per image; 0-2 hashtags. The builder enforces all of these.
- Post 1 = cover + the 3 strongest data cards (the hook must survive X's cropped preview: headline and number in the top half). Post 2 = player cards + end card. Post 3 = data sources + method (it builds trust and gets replies from stat nerds).
- Hook patterns: "30 off 30. They got 22." / "His 2 overs: 13 runs. Everyone else: 14 an over." / "X, Y, Z: three spells decided it". Every number gets a comparator (vs match rate, vs teammates, vs last 5).
- End with ONE reply prompt ("Best death over you've watched? Reply with the match.").

## 3. xcarousel.json
Top: `title, series, desk, credit (footer right), chips[] (strings or {t, dark}), teams{id:{name,code,color,ink}}, theme?: "dark", accent?, checks[], slides[], thread[{text, images[]}], sources[]`.
Every slide: `layout, alt (required), source?, takeaway?, chips? (false hides)`. Mini-markup: `*accent*`, `==box==`, `**bold**`, `\n`.

| layout | use | data |
|---|---|---|
| `cover` | team-colour hook panel | `team, hero (giant bg number), kicker, title, sub, facts[{v,l}] (3), photo?` |
| `ledger` | chase/target equation, recomputed per phase | `chase{target, balls, final, start{runs,wkts,balls,label}, steps[{label,by?,runs,wkts,balls,hi?}]}, resultText?, tone` |
| `split` | rate before/after a moment | `phases[{label, runs, overs, color}]` → runs per over |
| `leaderboard` | ranked rows with badges | `rows[{name, team, bowl{o,m,r,w} or bat{r,b,f4,f6} or value, note, hi}], metric (econ/sr/…), metricLabel, sort, sortAsc, tone` |
| `player` | frosted player card | `team, title, short, role, bat{r,b,f4,f6,no?} and/or bowl{o,m,r,w,dots?}, badge?{v,l,tone}, highlights[], overs?[{label, balls:[".","1","4","W","wd"]}], phases?[{label,v,sub}], form?[{v,l,today}], formLabel, result, photo?` |
| `bars` | over-by-over or any ranked rows | `rows[{label, name, v, display?, hi?, color?}], max?` |
| `end` | brand close | `big, bigLabel, title, points[3], followLine, question` |
`tone: {good, bad, lowIsGood}` colours a value green/amber/red (economy: lowIsGood; SR/wickets: high is good).

## 4. Build + QA
```
node templates/x-carousel/build.mjs stories/<folder>            # cards + checks + thread.md
node templates/x-carousel/build.mjs stories/<folder> --only 2,5 # iterate
node templates/x-carousel/build.mjs stories/<folder> --hd       # 1440x1800
```
Outputs `out/NN_<layout>.png`, `out/overview.png`, `out/thread.md`, `out/qa.json`.
Auto-fit shrinks dense cards (min k 0.74) and grows sparse ledger/split/leaderboard/player/end cards up to 1.25×. QA: overflow, margins, broken images, text < 22 px (X shows cards at about half size), data checks, thread limits.
Then LOOK at `overview.png` and every card at full size. Fix dead space, orphan words and collisions; the hero watermark must not fight the name.

## Gotchas
- `--only` rewrites qa.json/thread.md for those slides; full build before delivery.
- The overs field is a string: `"3.4"` = 3 overs 4 balls (economy uses balls).
- Ball tokens: `.`/`0` dot, digits runs, `4`/`6` boundaries, `W…` wicket, `wd`/`nb`/`lb1`/`b1` extras.
- Team colours: pick from the kit/flag, don't use club logos. Credit any user photo in `source`.
- Long names: use `short` for the card header ("H Klaasen") and the full name in the panel title.
