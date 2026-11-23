# Reel 05 (Episode 04) — "My chatbot just gave away 1,500 days of free leave."  (script v2 — new hook)

Skill: `kinetic-listicle-short` (scene sections) · 1080x1920 · ~60 s · voice en-US-AndrewNeural +14 % · @MiteshJourney brand · follow-only CTA
First-person story (continues Episode 03's cliffhanger: the "31" that isn't in the PDF) · spoken "rag" as one word (UI shows RAG) · "Docling" said "DOCK-ling" · every spoken word on screen at its timestamp · stage labels so it works muted.

**Arc:** shock (0–4 s) → mystery solved: where "31" came from → the bigger damage (columns + table) → the lesson: words ≠ structure → Docling's pipeline, stage by stage → 3 lines of Python → proof → where it sits in RAG → cliffhanger into Episode 5 (chunking).

**Centrepiece transformation:** PDF → Docling → structured document. Every stage is a visible transformation of the SAME page of `Employee_Handbook.pdf`, never a generic spinning icon.

## Narration + scenes

| # | ~time | Voice-over (exact) | On-screen header (emphasis) | Animated scene |
|---|---|---|---|---|
| 1 · SHOCK | 0–3 s | "My chatbot just gave away fifteen hundred days of free leave." | My chatbot just gave away / **1,500 days** of free leave. (red bar) | Black-to-light snap. A big counter slams up 0 → **1,470** days (cash-register ticks), the bot icon beside it glitches, a red **⚠** flashes on the last tick. |
| 2 · STAKES | 3–9 s | "It told a hundred and forty-seven people they can carry forward thirty-one days. The handbook says twenty-one. And HR wants to know why." | 147 people · **31 days** / The handbook says **21.** / HR wants to know **why.** | Company #general channel: bot post "Carry-forward: up to **31 days** 🎉", "Seen by 147", reactions pile up. On "twenty-one" a red ✕ strikes 31 and the handbook line "21 days" slides in. On "why" an HR calendar invite drops in: "**Quick chat?** · today 4:00 pm" (the personal gut-punch). |
| 2b · MYSTERY | 9–11 s | "Thirty-one isn't even in the PDF." | **31** isn't even in the PDF. | `Employee_Handbook.pdf` search bar: "31" → **0 matches**. A red "?" pulses over the bot. |
| 3 · REVEAL | 9–15 s | "It came from page three. A scanned page. No text, just pixels. My parser guessed, and read a smudged two as a three." | page 3 · **scanned** / no text, **just pixels.** / smudged **2 → 3** | Zoom into the crooked scanned page (signature + stamp). Pixel grid appears over "21"; the "2" smears and flips to "3". Red ring around it. |
| 4 · MORE DAMAGE | 15–22 s | "And that wasn't all. Two columns got mixed together. The leave table lost its rows." | Two columns **mixed.** / The table **lost its rows.** | Split: page 1's two columns, with the reading path zig-zagging L1 → R1 → L2 → R2 (red arrows). Page 2's table explodes into a flat dump: "Full-time Part-time / 24 days 12 days / 12 days 6 days". A "?" connects "Full-time" to two numbers. |
| 5 · LESSON | 22–25 s | "Extracting words is not understanding a document." | Extracting **words** ≠ understanding **structure** | Words fly off the page into a loose pile; the page's skeleton (boxes) stays behind, empty. |
| 6 · DOCLING | 25–28 s | "So I switched to Docling. It rebuilds the structure first." | So I switched to **Docling.** / It rebuilds **the structure** first. | The same PDF slides into a **DOCLING** processor card (brand logo if available, else `file-cog` icon). |
| 7 · LAYOUT | 28–31 s | "Layout: it boxes every title, paragraph, table and picture." | **Layout:** title · paragraph · table · picture | Coloured bounding boxes snap onto page 1 on their words: TITLE (violet), PARAGRAPH (blue), TABLE (amber), PICTURE (cyan), FOOTER (grey, dimmed = "furniture"). |
| 8 · READING ORDER | 31–34 s | "Reading order: the left column, then the right." | **Reading order:** left, *then* right | The zig-zag arrows from scene 4 straighten; blocks physically reorder into L1 → L2 → R1 → R2. Green ✓. |
| 9 · OCR | 34–38 s | "O-C-R on the scanned page, so the pixels become real text: twenty-one." | **OCR** on the scan → **21** ✓ | A scan beam sweeps page 3; word boxes light up word by word; "21" lifts off as editable text in green, with a `page 3 · box` tag. |
| 10 · TABLE | 38–42 s | "And TableFormer rebuilds rows and columns, so twenty-four belongs to full-time again." | **TableFormer:** rows + columns / **24** → Full-time | The flat dump from scene 4 flies back: grid lines draw, cells snap into place, header row highlights, then the row "Full-time · 24 · 12" glows and morphs into a Markdown row `| Full-time | 24 days | 12 days |`. |
| 11 · DOCUMENT | 42–46 s | "The result isn't a string. It's a DoclingDocument: sections, tables, pictures, and the page each one came from." | Not a string. / a **DoclingDocument** | The page dissolves into a tree: `DoclingDocument → Title / Section → Text / TableItem / PictureItem`, each node with a small `prov: p.2 [bbox]` chip. |
| 12 · CODE | 46–50 s | "Three lines of Python." | **Three lines** of Python. | Terminal card types: `converter = DocumentConverter()` / `doc = converter.convert("Employee_Handbook.pdf").document` / `doc.export_to_markdown()`, then a Markdown preview with the clean table scrolls in. |
| 13 · PROOF + FIT | 50–54 s | "Same question. Twenty-one days, page three. Docling isn't your vector database. It's the step before chunking." | **21 days** · page 3 ✓ / the step **before chunking** | Bot reply "Carry-forward: up to **21 days**" with chip `Employee_Handbook.pdf · page 3`. Then a 5-box rail: PDF → **DOCLING** (lit) → Chunking → Embeddings + Vector DB → RAG chatbot. |
| 14 · CLIFFHANGER | 54–62 s | "So I chunked it into five-hundred-character pieces... and the leave table got cut in half. Now it says part-timers get twenty-four days. Why? Episode five." | I chunked it into **500-character** pieces... / the table got **cut in half.** (red) / part-timers get **24 days?** / *Why?* **Episode 5** | Scissors slice the clean table between the header row and the Part-time row; the two halves drift apart. Bot: "Part-time: **24 days**" — red glitch. Hard cut to dark "EPISODE 05 · COMING NEXT — chunking that doesn't break tables". |
| 15 · FOLLOW | 62–65 s | "Follow Mitesh Journey for episode five." | Follow **@MiteshJourney** / for Episode 5. / LEARN. BUILD. AUTOMATE. | Standard follow card. |

~200 words → about 66 s at +14 %. If a tighter cut is wanted: drop scene 5 (−3 s) and shorten scene 11 to "It's a DoclingDocument, with the page each piece came from." (−2 s).

## Why this hook works
- **A shocking, concrete number in the first 3 s:** "fifteen hundred days of free leave" is absurd enough to stop the scroll and needs no context (147 people × 10 extra days = 1,470).
- **Escalating personal stakes:** Ep 03 was "it lied to *me*"; now it lied to 147 colleagues in public and HR sent *me* a meeting invite. Cringe + "what happens to him?" keeps people watching.
- **Mystery before the answer:** "31 isn't even in the PDF" re-opens Ep 03's loop, then pays it off at ~11 s ("page three, a scanned page").
- **One concrete visual mistake (2 → 3)** makes "PDFs are pixels, not text" obvious without jargon.
- **Open loop at the end:** the fix (Docling) creates the next problem (naive chunking splits the table), which is exactly the next stage of the pipeline → Episode 5.

## New scene components (scenes.tsx)
`slackShock`, `zeroMatches` (reuse handbook search from `handbookCliff`), `scanSmudge`, `brokenExtract` (columns zig-zag + table dump), `wordsVsStructure`, `doclingIntake`, `layoutBoxes`, `readingOrder`, `ocrBeam`, `tableFormer`, `doclingTree`, `codeTerminal` (existing terminal card), `proofRail`, `chunkCliff`.
theSVG UI icons: bot, message-square, file-text, file-search, scan-line, scan-text, table, table-2, columns-2, layout-template, list-tree, braces, file-code, scissors, badge-check, circle-x, database, workflow. Brand: `python`; Docling logo → check theSVG/simple-icons; if missing, ask the user before using any logo file (else use `file-cog` + the word "Docling").

## SFX
Glitch + boom on "thirty-one", reaction pops rising in pitch, error buzz on "0 matches", pixel crunch on "smudged", paper tear on "lost its rows", one soft pop per layout box, slide-whoosh on reading order, scan hum on OCR, cell-snap ticks on TableFormer, keyboard ticks on code, chime on "twenty-one days", scissor snip + glitch on "cut in half", riser + hard stop on "Why?", boom on "Episode five".

## Facts (keep the on-screen claims inside these)
- Docling's `DocumentConverter` picks a format backend + pipeline and returns a structured `DoclingDocument`, not a plain string (Docling docs: Architecture, DoclingDocument).
- The PDF pipeline does layout analysis (titles, text, tables, pictures, page headers/footers), reading-order reconstruction, optional OCR and TableFormer table-structure recognition (accurate / fast modes) (Docling docs: Advanced options, OCR).
- OCR engines include EasyOCR, RapidOCR, Tesseract and others; engine + language choice matter. OCR can still misread — provenance (page number + bounding box) lets you trace and check every value.
- `DoclingDocument` keeps body vs furniture (headers/footers), groups/sections, text/table/picture items and provenance.
- Quickstart: `DocumentConverter().convert(path).document.export_to_markdown()`; explicit options: `PdfPipelineOptions(do_ocr=True, do_table_structure=True)` via `PdfFormatOption`.
- Docling is the conversion/understanding layer — not an embedding model or vector DB. Picture descriptions need separately enabled enrichment (not claimed in the reel).
- Illustrative data: the 1,500-days / 147-people figures, the HR invite, the 31/21 carry-forward, the smudged scan, the #general post and reaction counts, the leave table values (Full-time 24/12, Part-time 12/6), page numbers, the 500-character chunking failure.
- Wording guard: say "My parser guessed" (a crude OCR fallback), not "PDF text extraction invents numbers" — plain extraction on a scan usually returns *nothing*; the invented number comes from a careless OCR fallback.

## Caption (draft)
My chatbot gave away ~1,500 days of free leave. 147 people were told they could carry forward 31 days. The handbook says 21. HR sent me a "quick chat?" invite. 😬
The culprit: a scanned page, a mixed-up two-column layout and a table that lost its rows. Plain text extraction gets words, not structure.
Docling rebuilds it: layout → reading order → OCR → TableFormer → DoclingDocument (with page provenance).
Then chunking broke the table again… Episode 5 next. Follow @MiteshJourney.
#RAG #Docling #AIEngineering #LLM #DocumentAI #OCR #MiteshJourney
