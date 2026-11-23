# Reel 04 (Episode 03) — "The chatbot I built just lied to me."  (script v2)

Skill: `kinetic-listicle-short` (scene sections) · 1080x1920 · ~55 s · voice en-US-AndrewNeural +8 % · @MiteshJourney brand · follow-only CTA
First-person story (Mitesh built the company chatbot) · spoken "rag" as one word (UI shows RAG) · every spoken word on screen at its timestamp · stage labels so it works muted.

**Arc:** personal shock (0–12 s) → "do I retrain the AI?" → the real reason (three places) → the fix (sync + versioning) → proof → cliffhanger into Episode 4.

## Narration + scenes

| # | ~time | Voice-over (exact) | On-screen header (emphasis) | Animated scene |
|---|---|---|---|---|
| 1 · SHOCK | 0–2.5 s | "The chatbot I built just lied to me." | The chatbot **I built** / **just lied to me.** (red bar) | Black-to-light snap. Close-up of the bot icon, a red "⚠ WRONG ANSWER" stamp slams on with a glitch shake. |
| 2 · STORY | 2.5–12 s | "I asked it how many leave days I get. It said eighteen. Eighteen? HR changed it to twenty-four yesterday... and I uploaded the new PDF myself!" | I asked how many leave days I get. / It said **18.** / **18?** / HR changed it to **24** yesterday / and I uploaded the new PDF **myself!** | Chat: "How many leave days do I get? 🏖️" → typing → "You get **18 days** per year." Freeze-frame zoom on "18". Then `HR_Policy_v2.pdf` "24 days · effective Dec 1" slams in beside it with my upload ✓ "uploaded by Mitesh · yesterday 6:42 pm". Red ✕ flashes between 18 and 24. |
| 3 · QUESTION | 12–14 s | "So... do I need to retrain the AI?" | So... do I need to **retrain the AI?** (italic) | A big brain icon with a "RETRAIN?" tag and a spinning gear wobbles. |
| 4 · THREE PLACES | 14–22 s | "No. Your AI keeps three separate things. Its brain: the model weights. Its library: the vector index. And the pages on its desk: the context." | **No.** / three separate things / brain · **library** · desk | Three cards light up on their words: 🧠 **Model weights**, 🗄 **Vector index**, 📄 **Context**. The brain card gets a lock: "a PDF never changes this". |
| 5 · WHY STALE | 22–26 s | "Uploading a PDF doesn't update the library. Search still finds the old chunks." | Uploading a PDF / **doesn't update the library.** | `storage/` folder receives v2 ✓; the arrow to the index breaks: **NOT SYNCED**. The "18 days" chunk still glows; a search ray picks it. |
| 6 · SYNC | 26–32 s | "You have to sync it: detect the change, extract, chunk, embed with the same model, and update the index." | You have to **sync** it: / detect · extract · chunk · embed · update | **SYNC PIPELINE** conveyor, a step ticks per word; Embed labelled "same embedding model · not retrained". New "24 days" chunks drop into the index. |
| 7 · THE TRAP | 32–36 s | "But if the old chunks stay, search returns both. Eighteen and twenty-four." | But if the old chunks stay, / search returns **both.** / **18** vs **24** | Results panel: CHUNK v1 "18 days" vs CHUNK v2 "24 days", lightning between them, the LLM flickers "?" — **CONFLICT**. |
| 8 · FIX | 36–40 s | "So store a version and a date with every chunk, and filter to the current one." | Store a **version** and a **date** / filter to the **current** one | Metadata types itself: `{ "version": 2, "effective_from": "2026-12-01", "is_current": true }`; the filter sends v1 to **ARCHIVE** and passes v2 ✓. |
| 9 · PROOF | 40–44 s | "Same question. Same model. Twenty-four days, with the new source." | Same question. Same model. / **24 days** | Chat: "How many leave days do I get?" → "**24 days** per year, from December 1." Chip `HR_Policy_v2.pdf · page 3`, badge "model weights unchanged ✓". Chime. |
| 10 · TAKEAWAY | 44–46 s | "rag updates knowledge, not the model." | **RAG** updates knowledge, / **not the model.** (bar) | Brain card stays locked; library card glows green "updated". |
| 11 · CLIFFHANGER | 46–56 s | "Fixed. Then I uploaded our full HR handbook. Tables, scanned pages... and it answered with a number that isn't anywhere in the PDF. How? Episode four. Follow Mitesh Journey." | **Fixed.** / Then I uploaded our full HR handbook. / Tables, scanned pages... / a number that **isn't anywhere in the PDF.** (red) / *How?* **Episode 4** / Follow **@MiteshJourney** | A thick handbook PDF drops in (200 pages, tables, a crooked scanned page). The chat answers "**31 days**" — the search through the PDF comes back "0 matches for 31" with a red glitch. Hard cut to the dark "EPISODE 04 · COMING NEXT" card with a broken table icon, then the follow card. |

~165 words → about 55 s.

## Why this hook works
- **Personal + stakes in the first 2 s:** "The chatbot *I built* just lied to me" (self-blame, curiosity, mild outrage).
- **A number everyone understands:** leave days (18 vs 24), with the twist that I uploaded the fix myself, which is the exact misconception the episode corrects.
- **Open loop at the end:** a new, worse bug (a number that isn't in the PDF) that only Episode 4 explains (table/scan extraction), so viewers follow to find out.

## New scene components (scenes.tsx)
`liedStamp`, `leaveChat`, `retrainQ`, `threePlaces`, `notSynced`, `syncPipeline`, `conflict`, `versionFilter`, `chatAnswer` (new text), `takeaway`, `handbookCliff`. theSVG icons: bot, circle-user, brain-circuit, database, file-text, file-search, scissors, badge-check, circle-x, lock, folder, refresh, filter, archive, table + brand `pdf`.

## SFX
Glitch hit + bass drop on "lied", typing ticks, error buzz on "eighteen", paper slam on the v2 PDF, tick per pipeline step, whoosh on the index update, glitch on "both", chime on 24 days, riser + hard stop on "How?", whoosh into the Episode 4 card.

## Facts
- RAG retrieves from an external index and supplies it as grounding context (Microsoft Learn, RAG and indexes).
- Changed files must be re-extracted, re-chunked, re-embedded and upserted; obsolete chunks need explicit deletion or versioning (Microsoft Learn, incremental indexing / updating chunks).
- Re-indexing does not retrain the embedding model or change the LLM's weights.
- Episode 4 teaser: bad extraction of tables and scanned pages can produce wrong values (e.g. merged table cells); the "31 days" is an illustrative example.
- Illustrative data: 18 → 24 days, Dec 1, page 3, upload time, file names.

## Caption (draft)
The chatbot I built told me I get 18 leave days. HR changed it to 24 — and I had uploaded the new PDF myself. 😳
Do you retrain the AI? No. Model weights ≠ vector index ≠ context. Sync the index, remove stale chunks, filter by version.
Then the HR handbook broke it again… Episode 4 next. Follow @MiteshJourney.
#RAG #AIEngineering #LLM #VectorDatabase #Chatbot #GenAI #MiteshJourney
