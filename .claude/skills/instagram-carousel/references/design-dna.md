# Design DNA learned from Raw/Carousel (35 reference slides, 2026-11-25)

Three reference families. We learn the principles, not the artwork, logos or exact compositions.

## A. "Dev educator" grid series (14 slides, 1440x1800, coding handle)
- Light off-white canvas with a faint square grid (notebook paper), so even text-heavy slides look "designed".
- Header on every slide: round logo avatar + handle + one-line credential. Footer: like/save/share glyphs, page number "03", swipe pill "››››".
- Headline: geometric heavy sans (Poppins-like), 1-2 lines, ONE word in the accent colour (purple). Sub-headline one sentence in grey.
- Cover: huge 2-3 word title in navy + a 3D illustrated object (robot, VS hands). The last slide repeats a hero photo with a lavender follow card and a "Follow" button.
- Body modules: code cards (dark, mac dots, line numbers), feature tables (Feature | A | B), numbered lists with a yellow vertical bar, two-column "which should you choose" cards, "Key takeaway:" bold lead-ins.
- Weak spots we improve: body text ~22-26 px at 1080 (too small), 80-120 words on some slides, tables with 5 columns, no sources, slide order relies on the page number only.

## B. "News explainer" (NDTV-style, 6 slides, 1080x1350)
- White canvas, bold grotesk headline (40-60 px at 1080), with the key phrase inside a slanted magenta highlight box; a left vertical gradient bar (pink to violet) marks the title.
- Rows: rounded light-blue icon tile → thin vertical divider → 2-line bold statement. 3-4 rows per slide, separated by hairlines.
- Bottom 35-45 % is a full-bleed lifestyle photo fading in from white, so the text sits on clean white above it.
- Cover: 3-line headline with two highlighted words, a "HINT:" line in the accent colour, and a magenta "Swipe →" pill.
- Brand bug top or bottom right.

## C. "Editorial stats" (sports/finance, 6 slides)
- Serif display headline (Georgia/DM Serif-like), black plus one magenta line; short blue rules (≈80 px) separate blocks.
- One giant stat per slide ("28 sixes", "52 balls") in a magenta box or magenta serif; "Previous record: …" context in small serif below.
- The athlete or person is a cut-out on the right, fading into the white background on the left, where the text sits.
- Cover: "Fastest 100. Fastest 200. Most sixes." rhythm (triplet), then one-sentence context, then "Swipe →".
- Finance variant: a photo with a green "30%+" and an arrow line; the name inside a green highlight box.

## Shared virality mechanics
1. A cover that works without context: who + what + number, readable as a 3:4 grid thumbnail.
2. One idea per slide; the slide title is itself a claim ("He also beat his own record").
3. A strong accent used on 1-3 words only. Everything else is ink or grey.
4. Consistent chrome (header, footer, page number) = a recognisable series across posts.
5. The last slide = follow card + value proposition. The save-worthy slide (table, checklist) sits near the end.

## Our original system (what the template implements)
| Token | Value |
|---|---|
| Canvas | 1080x1350 (4:5); `--hd` → 1440x1800 like the refs |
| Safe area | 84 px side padding; content 150 px → 1200 px; header 44-116; footer 1252-1310 |
| Fonts | Sora 800 headlines (notebook/explainer/midnight), Fraunces 800-900 (editorial), Inter 500-700 body, JetBrains Mono code, Noto Sans Devanagari for Hindi |
| Sizes | cover title 112, slide title 74, statement 92, sub 34, body 30-38, labels ≥ 24 (QA fails below 23.5) |
| Brand colours | Electric Blue #2563EB accent, Cyan #06B6D4 accent2, Amber #F59E0B highlight, Rose #E11D48 bad, Green #16A34A good, Navy #0B1220 dark bg, paper #F7F8FB |
| Themes | `notebook` (A, grid paper), `explainer` (B, white + slanted highlight + gradient bar), `editorial` (C, serif + rules + photo fade), `midnight` (brand dark navy) |
| Upgrades over refs | real charts (bars, columns with negatives, rings), progress bar + page count, source line on every data slide, "Save this" nudge only on save-worthy slides, recap + comment prompt on CTA, auto-fit text, QA for overflow/min size/word count, alt text + caption package generated |
