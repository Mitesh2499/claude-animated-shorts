---
name: kinetic-listicle-short
description: Make a 30-60 s vertical kinetic-typography LISTICLE or animated EXPLAINER short (theSVG icons, code-drawn animated scenes such as the RAG pipeline) ("N tools/tips/commands every X needs right now") in the clean light-grey tech-creator style - every spoken word appears on screen as it is spoken (karaoke reveal), bold key phrases, black highlight bars, a name badge pill per item, a floating screen-recording/terminal card, sparkle bullets, a recap that flatters the viewer and a comment-keyword / follow CTA. Voice generated with edge-tts WORD timestamps, rendered in Remotion. Learned from "5 MCP servers every Claude Code user needs right now" in Raw/. Use when the user asks for a tech tips / tools / AI / productivity listicle reel, "like the MCP video", a text-animation explainer, or says "use the listicle skill". Not for story/character videos (use illustrated-parallax-short or cartoon-3d-short).
---

# Kinetic listicle short (typography + screen cards, Remotion)

Study: `references/kinetic-listicle/ANALYSIS.md` (script recovered, timeline, measured design system, why it works) + `references/kinetic-listicle/sheets/`.
Template: `templates/kinetic-listicle/` (`src/Listicle.tsx`, `build.py`, `script.example.json`, `scripts/stills.mjs|render.mjs`).
Proven demo: `stories/kinetic-demo/demo_3_claude_code_commands.mp4` (34 s, built from `script.example.json`, project `c:\Projects\kinetic-demo`).
The reference's brand, watermark, logo, ebook and lines are theirs: never copy them. Our own handle/brand goes in `brand`.

## The format (rules)
1. **Hook in <= 4 s** = qualifier + number + urgency: "If you use [X], these are the [N] [things] you need right now." Pattern-interrupt visual in the first 1.5 s (real result card + accent bursts).
2. **Every item has the same 4 beats**: ordinal ("First is", big) -> badge pill with the NAME slides in -> header (small lead-in + **bold key phrase**) over a real screen card -> sub-line + 2-4 sparkle bullets of concrete benefits ("no switching tabs", "no copy pasting"). 8-11 s per item.
3. **Captions = the voice-over, word for word**, each word appears at its spoken time (light grey -> dark in ~0.25 s, small rise, de-blur). One idea per line; size hierarchy small/regular -> **big bold** key phrase -> **huge** numbers -> *italic* audience name -> black **bar** for the sting.
4. **Show proof**: a screen recording / screenshot / terminal card under every claim (`card.kind: video | image | terminal`). Terminal cards are code-drawn and type themselves out.
5. **Recap flatters** ("You just found N tools that most [audience] don't even know exist"), then **one** CTA: comment-keyword lead magnet (only if the user really has the resource) or follow. Never promise a resource that does not exist.
6. **Facts must be true.** Every tool/command/feature claim is checked (docs or the user's own machine) before voicing. Prefer things the user actually uses.
7. Length: 3 items ~35 s, 5 items ~55-60 s (the reference's 78 s is too long). Speech ~3 words/s, near-zero pauses.
8. Rule from the user: English unless asked; standard mix (music under voice, SFX light).

## Step 0: Intake - ASK before writing the script or building anything
Read `brand/profile.json` and list `brand/logos/`, `brand/tool-logos/`, `brand/covers/`, `brand/cards/` first (shared brand kit at `C:\Projects\claude-animated-shorts\brand\`, see its README). Then ask ONLY what is still missing, in one AskUserQuestion round (max 4 questions; topic first if not given):
1. **Handle / brand name** shown in the watermark and follow card (e.g. `@yourname`). Never ship `@yourhandle` placeholders in a real video. Save the answer to `profile.json`.
2. **Personal logo / avatar**: "Do you have a logo or profile picture to use? Put it in `brand/logos/` (logo.png, square, transparent) or say 'use initials'." Personal branding is NEVER downloaded from the internet; the user uploads it.
3. **CTA**: follow only / comment-keyword lead magnet (then: the keyword, what exactly they will send, and a cover image in `brand/covers/`) / none. Never invent a resource the user does not have.
4. **Proof footage**: "Do you have screen recordings or screenshots for each item? Put them in `brand/cards/` (name them 1.mp4, 2.png ...), otherwise I will use code-drawn terminal/mock cards."
Also confirm when relevant: language/voice (male/female, accent), length (3 items ~35 s / 5 items ~60 s), accent colour.
Do not start `build.py` until handle + logo decision + CTA are known. Save every answer to `brand/profile.json` so the next video does not ask again (only re-confirm in one line).

### Icons: theSVG first (https://thesvg.org, MIT)
- **Primary source for ALL icons is theSVG**, via `python -I brand/fetch_icon.py`:
  - `search <words>` lists matching UI icons (1,100+) and brand logos (7,900+, incl. AWS/Azure/GCP/Kubernetes, with licence per icon).
  - `ui <slug> [look]` -> `brand/icons/<slug>.<look>.svg`. Looks: outline, duotone (default), fill, glass, glass-outline, offset, depth. Use ONE look per video so size/weight stay consistent.
  - `brand <slug> [variant]` -> `brand/tool-logos/<slug>.svg` (official colours; variants default/color/mono/light/dark/wordmark).
- UI icons draw with `currentColor`: `build.py` inlines every `brand/icons/*.svg` into `src/icons.json`, and `<Icon name="bot" color="#2563EB" size={64} />` (src/icon.tsx) recolours them to the brand palette. Use them in scenes, cards and badges instead of hand-drawn glyphs.
- Useful proven slugs: UI `bot circle-user database search file-search file-text brain-circuit scissors sparkles badge-check circle-x external-link layers link cpu quote message-square send arrow-right pdf-file`; brand `pdf` (the red PDF file icon), `openai`, `anthropic`, `claude`, `github`, `python`, `postgresql`, `pinecone`.
- Show a company's logo (e.g. OpenAI) only when that company's product is actually being demonstrated; otherwise use the generic `bot` icon.

### Logos: fetch public ones, ask for private ones
- For every product/tool named in a badge, try theSVG first (`fetch_icon.py brand <slug>`), then simple-icons: `python -I brand/fetch_logo.py <slug> [#hex|--white]` (CC0, saved to `brand/tool-logos/<slug>.svg`). Use `--white` for the coloured badge tile, a grey/dark colour for the watermark (white disappears on #f1f1f1).
- Not on theSVG/simple-icons -> the product's official press/brand kit page (download only official assets, keep the file name `<slug>.png`).
- Still not found, or it is a personal/company/internal brand -> STOP and ask the user to drop it into `brand/tool-logos/` (or `brand/logos/` for their own). Until then use the letter/glyph tile (`badge.glyph`).
- Third-party logos are only used to identify the product being discussed (nominative use). Never alter them beyond recolouring for contrast, never imply endorsement.
- `build.py` copies `brand/` to `public/brand/` and refuses to run if a referenced logo/cover is missing (prints the list).

### script.json brand fields
`brand` (watermark text), `brandLogo` (follow card, e.g. `brand/logos/logo.png`), `watermarkLogo` (small, beside the handle), per item `badge.logo` (e.g. `brand/tool-logos/perplexity.svg`), CTA `cover` (`brand/covers/<file>.png`), cards `card.src` (`brand/cards/1.mp4`).

### script.json features (added for Reel 01, 2026-11-21)
- `theme` {bg, ink, bar, sparkle, blue, cyan, amber, violet} - brand palette (take it from `brand/profile.json` notes); span `c: "blue"|"cyan"|"amber"|"violet"|<hex>` colours a key word (or a bar's background).
- `ordinalSay`: show "01" while the voice says "First,"; badge `say: "slash init."`.
- Span `say: ""` = shown silently right after the last spoken word; item `tag` = a silent tagline bar after the bullets (the user's on-screen taglines like "UNDO AND RECOVER."). build.py keeps the section on screen >= 1 s after it.
- Bullets may be objects `{t, say}` so a short bullet can carry the full spoken phrase ("conventions" said "and conventions it discovers.").
- Recap `chips: ["/init", ...]` pops a row of pills above the recap text.
- Card kinds: `terminal` (lines starting `+ `/`- ` get green/red diff rows, `❯` = selected menu row in blue), `context` (code-drawn /context usage grid), `image`, `video`.
- Proven: `stories/reel01-claude-commands/Reel01_5_Claude_Code_Commands.mp4` (53.4 s, project `c:\Projects\reel01-claude-commands`).

### Scene sections: animated explainers (added for Reel 03, 2026-11-22)
For concept/process explainers (not "N tools" lists) use `{"kind": "scene", "scene": "<name>", "blocks": [...], "sfx": [...], "minDur": s}`:
- Word-synced header (the spoken lines, top 3-24 %) + a code-drawn animation on a 1080x1140 canvas (from y 470) from `src/scenes.tsx`.
- Scenes receive `t` (s since section start), `d` (length) and `cue("word")` = when that word is spoken, so every visual beat lands on its word (counter hits 500 on "500", the bot fails on "fails", 5 dots light on "closest").
- Library v1 (AI/RAG): `pdfCrash` (hook: 500 PDFs flood in + counter, the bot swallows them, crashes: red X, error dialog "context window exceeded", PDFs spill; cues 500/chatbot/crashed/window), `pdfSwarm` (500 PDF icons flood + counter + confused bot), `chatFail` (chat UI, failed answer, training-data checklist), `ingest` (PDF pile -> Extract text -> scissors -> chunk cards, "1 · INGESTION · RUNS ONCE"), `embed` (chunks -> embedding model -> vectors -> particles cluster by meaning), `vectorDb` (cylinder fills, chunk counter, topic tags), `retrieve` ("2 · QUERY TIME", question -> query vector -> radar search over a dot grid -> top-5 cards with scores), `generate` (5 chunks -> prompt -> LLM -> streamed grounded answer, "model weights unchanged", "500 PDFs never sent"), `chatAnswer` (polished chat, citation chip, cursor click, cited PDF page with highlight).
- Library v2 (story episode, Reel 04): `liedStamp` (shock stamp + glitch), `leaveChat` (personal chat with a wrong number + the uploaded PDF), `retrainQ`, `threePlaces` (weights / index / context cards, lock on the brain), `notSynced` (storage vs index, NOT SYNCED, search hits the old chunk), `syncPipeline` (5 steps tick on their words), `conflict` (old vs new chunk -> LLM CONFLICT), `versionFilter` (metadata JSON types itself, funnel, archive), `proofChat`, `takeaway`, `handbookCliff` (FIXED badge -> handbook -> wrong number -> "0 matches" -> EPISODE 04 card). Helpers: `Stamp`, `Glitch`, `PdfCard`, `Card3`.
- Library v3 (document structure / Docling, Reel 05): `leaveCounter` (big counter hook + stamp), `channelPost` (#general bot post, Seen by N, strike-through, HR calendar invite), `zeroMatches` (PDF search -> 0 matches), `scanSmudge` (scanned page, pixel grid, magnifier 2 -> 3), `brokenExtract` (column zig-zag + table collapsing into a flat dump), `wordsVsStructure`, `doclingIntake` (converter card with 4 stage chips), `layoutBoxes` (TITLE/PARAGRAPH/TABLE/PICTURE/FOOTER boxes on cue), `readingOrder` (red zig-zag -> green order), `ocrBeam` (scan beam, word boxes, recognised text), `tableFormer` (grid lines draw, cells snap, Markdown row), `doclingTree` (string -> DoclingDocument tree + prov chips), `codeCard` (typed Python + Markdown output), `proofRail` (cited answer + 5-step RAG rail), `chunkCliff` (500-char split mid-row -> wrong answer -> EPISODE card). Helpers: `ScanPage`, `ColPage`, `Chip`, `BotSmall`. Proven: `stories/reel05-docling/` (69.7 s).
- Episodes: open with a first-person shock line in <= 3 s ("The chatbot I built just lied to me."), tell it as a personal story, end with an unresolved new problem + "Episode N" card (open loop), then follow.
- Every scene sits in a slow push-in + drift (SceneSection), so holds never freeze; check the change-window metric (>= 90 %).
- Sound types: pop, tick, whoosh, chime, error, glitch, boom, riser.
- New scenes: add a component to `scenes.tsx` + register it in `SCENES`. Rules: something moves or appears every 0.3-0.5 s; label stages so it reads muted; brand palette only; icons via `<Icon>`; shapes code-drawn when more reliable than images.
- `sfx`: `{"word": "500", "type": "pop"}` or `{"t": 0.4, "type": "tick", "n": 10, "every": 0.16, "gain": 0.3}`; types `pop | tick | whoosh | chime | error`. `minDur` keeps a scene on screen long enough for its animation.
- Proven: `stories/reel03-rag-500-pdfs/Reel03_500_PDFs_to_Chatbot_RAG.mp4` (45.1 s, project `c:\Projects\reel03-rag-500-pdfs`, script.json + ASSETS.md beside it).

### Final QA routine (run on the muxed MP4, not on stills)
1. Contact sheets every 0.5 s of the final file (`out/qa/sheet*.jpg`) - read every tile: overflow, clipped text, overlaps, empty frames.
2. Black frames = 0, longest frozen run < ~1.5 s, share of 0.4 s windows with visible change >= 90 %.
3. Audio: per-section RMS within +-1.5 dB (target about -15 dB), voice 8-12 dB above the bed, peak <= 0.95.
4. Sync: on-screen word times come from the TTS engine's own WordBoundary offsets for the same audio, so they are locked by construction; spot-check 2-3 words per section in stills against the timeline.
5. Facts: re-read the narration against the `_source` note; label illustrative data (company, numbers, scores) as examples in ASSETS.md.
Be explicit with the user that this is frame + signal analysis, not literal viewing/listening.

## Design tokens (measured; in Listicle.tsx `C` + `SIZE`)
- Background #f1f1f1, ink #1d1d1d, secondary #525252, unrevealed/fresh words #bdbab8, accent #cc6e5a (hook bursts/badge tile), watermark #c6c6c6 bold at 85.5 % height.
- Inter (Google Fonts, loaded with delayRender) 500/700/800 + 700 italic. Sizes at 1080 wide: small 44, reg 50, big 72/800, huge 124/800, italic 62/700, bar 56/700 white on #111.
- Zones: header 4.5-15 %, card 20-50 % (860x560, radius 22, soft double shadow, 3D tilt that settles, slow float), sub + bullets 52-80 %, keep the bottom 12 % free (platform UI).
- Motion: springs for card/badge/logo entries, hard cuts between sections, a whoosh on every cut, pop on every badge, tick on every bullet (build.py), soft pluck bed at 96 bpm ducked under the voice.

## Pipeline
0. **Intake** (Step 0 above): brand kit read, missing questions asked, logos fetched or requested, answers saved to `brand/profile.json`.
1. **Pick the topic and items** (true, useful, specific). Write `script.json` (copy `script.example.json`):
   - `sections[]` kinds: `hook` (blocks + card), `item` (ordinal, badge {name, say?, color, glyph|logo}, head, card, sub, bullets), `recap` (blocks), `cta` (blocks, keyword in the first lines, optional `cover` image), `follow` (blocks).
   - A line is a list of spans `{t, s?: small|reg|big|huge|italic|bar, say?}`; use `say` when the display differs from speech ("/init" -> "slash init", "CLAUDE.md" -> "Claude dot M D").
   - Show the user the script text first ("just do it" once approved).
2. **Project**: copy `templates/kinetic-listicle/*` to `c:\Projects\<name>`, `script.json` beside `build.py`, junction `node_modules` to `c:\Projects\bitter-fruit\node_modules` (`mklink /J`), copy tsconfig/remotion.config from an existing project. Put real recordings/screenshots in `public/cards/` and point `card.src` at them.
3. **Voice + timing + mix**: `python -I build.py` -> `audio/voice/sNN.mp3`, `src/timeline.json` (section t0/t1 + spoken time of every displayed word), `public/audio/mix.wav`. Voice `en-US-AndrewNeural` +10 % (others: Brian, Christopher, Guy). edge-tts must be called with `boundary="WordBoundary"` (v7 defaults to sentences); the build retries NoAudioReceived.
4. **Stills**: `node scripts/stills.mjs out/s/f_ 30,95,140,... 0.4` -> contact sheet -> check: no text over the card, nothing wraps awkwardly, badge readable, terminal text legible, watermark clear of content.
5. **Render**: `node scripts/render.mjs out/silent.mp4` then mux `ffmpeg -i out/silent.mp4 -i public/audio/mix.wav -map 0:v:0 -map 1:a:0 -c:v copy -c:a aac -b:a 192k -shortest out/<name>.mp4` (Remotion's ffmpeg: `bitter-fruit/node_modules/@remotion/compositor-win32-x64-msvc/ffmpeg.exe`).
6. **Deliver** the mp4 + script.json to `stories/<name>/`, keep earlier versions (`v1_`, `v2_` ...), save memory.

## Pronunciation (user rule)
- On screen acronyms stay as written; the voice says them the way the creator says them. `brand/profile.json` -> `"pronounce": {"RAG": "rag"}` (also per script `pronounce`). build.py applies it to every span without an explicit `say`. RAG is said "rag" (one word), never R-A-G. Ask the user when a new acronym appears (MCP = M-C-P, LLM = L-L-M, SQL?).
- Verify with the TTS boundaries: one word = one WordBoundary ("rag" 0.32 s), spelled = one per letter.

## Gotchas
- Length budget: count words BEFORE voicing. Reel 05's 200-word script voiced at 79.8 s at +14 %; cut to ~180 words at +18 % -> 69.7 s. Aim <= 170 words for ~60 s.
- edge-tts sometimes refuses one specific sentence (NoAudioReceived on every retry, e.g. "And TableFormer rebuilds..."): rephrase the first word ("Then ...") or remove a comma; test single lines with a small script first.
- Motion metric: compare each 0.4 s window's first and last frame (mean abs diff > 1.0 at 270x480). Frame-to-frame diffs under-count slow push-in/drift (Reel 05: 70 % frame metric vs 97 % window metric).
- Pacing: Andrew +8 % reads ~2.7 words/s, +14 % ~2.9 words/s; budget ~165 words = ~60-64 s. Section tails are short unless the section has silent (say "") lines.
- edge-tts can stall forever on a dead socket: build.py wraps each request in `asyncio.wait_for(..., 45)` and retries; run long builds with `timeout 600`.
- `sectionLines()` in Listicle.tsx and `lines()` in build.py must list tokens in the same order (ordinal, badge, head, sub, bullets / blocks). Change both or timing drifts.
- Never call hooks inside `.map` branches (TextLine computes `now` once at the top).
- Text width: a `huge` span longer than ~12 characters wraps; split it ("3" huge + "commands" big) or use big.
- Remotion bundles copy `public/` to TEMP: render with TEMP/TMP set to `C:/Users/mithi/AppData/Local/Temp/remotion-tmp` (the scripts do it).
- Windows paths inside Python source: use forward slashes (`C:/Projects/...`). A patch once turned `\b` in `...shorts\brand` into a backspace and the brand copy silently failed.
