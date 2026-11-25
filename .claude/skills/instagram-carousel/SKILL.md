---
name: instagram-carousel
description: Research, write and render a scroll-stopping Instagram CAROUSEL (7-10 static 1080x1350 slides) in the premium creator style learned from Raw/Carousel - dev-educator grid slides, news-explainer highlight slides, editorial big-stat slides - with real charts (bars, columns, rings), tables, code cards, myth/fact, checklists, and a follow/CTA slide, plus a publishing package (caption, SEO keywords, 3-5 hashtags, alt text per slide, sources). Slides are data-driven HTML rendered to PNG by headless Chrome with auto-fit text and layout QA. Proven on "The AI Trust Gap" (2026-11-25). Use when the user asks for a carousel, swipe post, Instagram/LinkedIn slides, "like the Raw/Carousel images", an infographic series, turning a reel/topic/data into a carousel, or gives the master carousel prompt. For videos use the reel skills instead.
---

# Instagram carousel (strategy → research → slides → publishing package)

Template: `templates/carousel/` (`build.mjs` renderer + QA, `slide.css` themes/layouts, `fonts/fonts.css` embedded Google Fonts).
Proof: `stories/carousel01-ai-trust-gap/` (carousel.json, PLAN.md, out/*.png, out/post.md). All layouts/themes: `stories/carousel00-theme-demo/`.
What the references taught us: `references/design-dna.md` (read it before designing a new look).
Brand: `brand/profile.json` (@MiteshJourney, Electric Blue #2563EB, Follow-only CTA, never promise resources that don't exist), logo `brand/logos/logo.png`, icons `brand/icons/` (+ `python -I brand/fetch_icon.py ui <slug>`).

## 0. Intake (one AskUserQuestion round, only for what you can't infer)
- Topic / angle, and any data, links or images the user already has.
- Goal: followers / shares / saves / comments / brand enquiries (one primary goal).
- Language (English default; Hindi works: `"lang": "hi"`, Noto Sans Devanagari is embedded).
- Theme: `notebook` (tech/education, default), `explainer` (news/trend/lifestyle), `editorial` (stats/records/finance, with a photo), `midnight` (brand dark). Mixing per slide is allowed, but keep ONE theme per post for series recognition.
If the user gave just a topic, don't ask: pick the goal from the topic and go.

## 1. Research (never skip for factual posts)
- WebSearch standard mode, parallel queries: the primary source (survey/report/paper/official), 1-2 reputable outlets, and the counter-view or caveat.
- Record every number with source + date in a table in `PLAN.md`. Cross-check numbers that differ between outlets and use the primary source's wording; say on the slide what the number measures ("use or plan to use").
- Never invent stats, quotes or sources. Label estimates (≈), projections and opinions ("Why it matters", "Fair caveat"). Small studies get a caveat slide or line.
- Don't claim things for the creator ("habits I use") unless the user said so.
- Images: only the user's own or licensed files (`brand/cards/`, `brand/logos/`). Never download third-party photos/artwork. Without a photo, use the code-drawn visuals (rings, charts, vs cards, icons). They usually beat stock images for data posts.

## 2. Strategy (write it in PLAN.md: research table, 5 hooks + chosen one, audience, objective, arc, business angle)
- 5 hooks → choose the most specific, TRUE contradiction or number. Patterns: "X% do A. Only Y% B." / "They felt faster. They were slower." / "Not wrong code. Almost-right code." / a triplet ("Fastest 100. Fastest 200. Most sixes."). Ban "Everything you need to know", "Did you know?", "5 amazing tips".
- Cover must work as a 3:4 grid thumbnail for a stranger: who + what + number, ≤ 12 words in the title.
- Arc (flex 7-10 slides): Hook → Context/scoreboard → Evidence → Deeper insight/trend → Surprise → Fair caveat → Payoff (save-worthy checklist/table) → CTA (question + follow).
- Engagement per slide: one SHARE moment (the contradiction), one SAVE slide (checklist/table, `"save": true` shows "Save this"), one COMMENT question with fixed answers ("Comment FASTER, SLOWER or SAME"), follow card with a value line. Only one primary CTA.

## 3. carousel.json (story folder `stories/carouselNN-<slug>/`)
Top: `title, theme, series (pill top-right), followLine, accent?, accent2?, lang?, slides[], post{caption, hashtags[3-5], keywords{primary, secondary[], longtail[]}, firstComment}, sources[]`.
Every slide: `layout, title, sub?, kicker?, takeaway?, takeawayLabel?, note?, source?, save?, theme?, image?{src, fit: bleed|right|full, pos}, alt` (alt is REQUIRED: describe the visual + every number).
Text mini-markup: `*accent*`, `==highlight box==`, `**bold**`, `__marker__`, `~~struck~~`, `\n` line break.

| layout | use | fields |
|---|---|---|
| `cover` | hook slide; Swipe pill goes in the footer | `kicker, title, sub, visual?` visual = `rings{items[{v,label,color}]}`, `bigstat{v,label,color}`, `vs{a{label,icon,color},b}`, `icons{items[]}`, `image{src}` |
| `statement` | big claim + visual | `title, visual` |
| `bars` | horizontal ranking/percentages | `items[{label,v,display?,color?,hi?,note?}], max, unit` |
| `columns` | 2-5 columns, supports negatives (−19%) | `items[{label,sub?,v,display?,color?,dashed?}], unit, height` |
| `stat` | one giant number (editorial record style) | `value, unit?, color, label, extra[{v,label,color}]` |
| `points` | 3-4 icon rows (explainer style) | `items[{icon,title,text}]` |
| `numbered` | ranked/numbered list | `items[{title,text,n?}]` |
| `checklist` | save-worthy habits/steps | `items[{title,text}]`, set `save: true` |
| `compare` | A vs B cards | `a{title,icon,color,items[]}, b{…}` |
| `table` | feature matrix; `yes`/`no` become ✓/✗ | `columns[], rows[[…]]` (≤ 4 columns, ≤ 6 rows) |
| `code` | code cards (dark, mac dots, highlighted) | `blocks[{label,file,code}]` (≤ 8 lines) |
| `mythfact` | myth vs fact | `myth, fact, mythLabel?, factLabel?` |
| `timeline` | dated events | `items[{when,text,hi?}]` |
| `quote` | quote card | `quote, by, kicker?` |
| `cta` | last slide: question + recap + nudges + follow card | `title, sub, recap[], nudges[comment,save,share,like]` |
| `tiles` | 2-4 giant stat rows (career numbers) | `items[{v,label,sub,color}]` |
| `board` | compact leaderboard with colour code chips (team purses, rankings), sorted by v | `rows[{code,name,v,display?,meta?,color,ink?,hi?}], colLabels[2], total?` (`total` is checked against the row sum) |

Themes: `notebook`, `explainer`, `editorial`, `midnight`, and **`arena`** (sports/news stat posts: navy stadium-light background, Anton display type for titles and big numbers only, `accent` = money/hero colour). For sports posts, set `accent`/`accent2` from the hero photo's kit colours. Proof: `stories/carousel02-stokes-ipl2027-auction/`.
Image fits: `bleed`, `right`, `full`, and **`cutout`** (transparent PNG player cut-out, bottom-right, text keeps the left 58 %). Trim the alpha bounding box first.
Photos of real people: use the user's own files, or Wikimedia Commons public-domain/CC images with the credit in `source`. Check the user's photo for signs of editing (wrong kit, era, stars or sponsors) and flag it. Never generate a likeness. League and team logos are trademarks and not in the theSVG registry, so use colour code chips unless the user supplies the logos.
Colours: `accent, accent2, amber, good, bad, mute, violet, ink` or any hex. Icons: file stems in `brand/icons/` (`folder, layers, refresh-cw, bot, sparkles, lock, trophy, trending-up, trending-down, triangle-alert, chart-column, brain-circuit, database, globe, search, …`).

## 4. Build + QA
```
node templates/carousel/build.mjs stories/<folder>            # all slides, 1080x1350 PNG (~3.5 s/slide)
node templates/carousel/build.mjs stories/<folder> --only 3,5 # iterate on some slides
node templates/carousel/build.mjs stories/<folder> --hd       # 1440x1800 export (same 4:5, sharper)
node templates/carousel/build.mjs stories/<folder> --no-shot  # layout QA + post.md only
```
Outputs in `<folder>/out/`: `NN_<layout>.png`, `overview.png` (contact sheet), `qa.json`, `post.md` (caption, hashtags, SEO, alt text, sources), `html/` (debug).
The renderer auto-fits: text scales with `--k` (shrinks to 0.72 when dense; grows to 1.22 for sparse list/table/quote slides). QA fails a slide on overflow, text outside the margins, or a broken image, and warns on text < 24 px, > 75 words, or heavy shrinking.
Then LOOK: Read `out/overview.png`, then every slide that matters at full size (at least the cover, chart slides and CTA). Fix collisions, orphan words, dead space and weak hierarchy, then rebuild. Don't deliver on the QA pass alone.

## 5. Writing rules (mobile-first)
- Titles: 2-8 words, one claim, accent on 1-3 words. Body ≤ 12 words per line item; ≤ 60 words per slide.
- One number per slide gets the spotlight; every chart has units, a labelled baseline, and a `source` line.
- Never fake social proof: no verified tick, no invented poll results, no "link in bio" resources that don't exist.
- Caption: line 1 = hook + primary keyword; 2-3 short paragraphs with secondary keywords naturally; point to the save slide; end with ONE question. Hashtags 3-5, relevant only.
- Deliver: slides in order (separate PNGs), `post.md`, and a short summary of hooks/strategy (PLAN.md). Publishing is the user's job: never post for them.

## Gotchas
- Chrome blocks file:// fonts → fonts are base64-inlined in `fonts/fonts.css` (re-run `node templates/carousel/fetch_fonts.mjs` to add families). Chrome path: env `CHROME` or the default Windows install.
- `--only` rewrites qa.json and post.md for those slides only; do a full build before delivery.
- Long unbreakable words in titles shrink the title (`--tk`) instead of overflowing; prefer manual `\n` breaks so words don't get orphaned.
- `image.fit: bleed` reserves the bottom 46 % for the photo (footer turns white). `right` keeps text in the left 56 %. Use photos the user owns.
- Hindi: set `"lang": "hi"`. Line-height is raised automatically; keep titles shorter (Devanagari is wider).
- **White is the user's feed default** (2026-11-25): all posts use light backgrounds. For sports use `"theme": "arena light"`; use dark `arena`/`midnight` only when asked. On white, kit colours such as CSK yellow are fills under dark text, never text (check contrast: text ≥ 4.5:1, bars/graphics ≥ 3:1). Proof: `stories/carousel03-stokes-ipl2027-auction-white/`.
