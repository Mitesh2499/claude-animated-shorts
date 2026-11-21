---
name: kinetic-listicle-short
description: Make a 30-60 s vertical kinetic-typography LISTICLE short ("N tools/tips/commands every X needs right now") in the clean light-grey tech-creator style - every spoken word appears on screen as it is spoken (karaoke reveal), bold key phrases, black highlight bars, a name badge pill per item, a floating screen-recording/terminal card, sparkle bullets, a recap that flatters the viewer and a comment-keyword / follow CTA. Voice generated with edge-tts WORD timestamps, rendered in Remotion. Learned from "5 MCP servers every Claude Code user needs right now" in Raw/. Use when the user asks for a tech tips / tools / AI / productivity listicle reel, "like the MCP video", a text-animation explainer, or says "use the listicle skill". Not for story/character videos (use illustrated-parallax-short or cartoon-3d-short).
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

### Logos: fetch public ones, ask for private ones
- For every product/tool named in a badge, try a public logo first: `python -I brand/fetch_logo.py <slug> [#hex|--white]` (simple-icons, CC0, saved to `brand/tool-logos/<slug>.svg`). Use `--white` for the coloured badge tile, a grey/dark colour for the watermark (white disappears on #f1f1f1).
- Not on simple-icons -> the product's official press/brand kit page (download only official assets, keep the file name `<slug>.png`).
- Still not found, or it is a personal/company/internal brand -> STOP and ask the user to drop it into `brand/tool-logos/` (or `brand/logos/` for their own). Until then use the letter/glyph tile (`badge.glyph`).
- Third-party logos are only used to identify the product being discussed (nominative use). Never alter them beyond recolouring for contrast, never imply endorsement.
- `build.py` copies `brand/` to `public/brand/` and refuses to run if a referenced logo/cover is missing (prints the list).

### script.json brand fields
`brand` (watermark text), `brandLogo` (follow card, e.g. `brand/logos/logo.png`), `watermarkLogo` (small, beside the handle), per item `badge.logo` (e.g. `brand/tool-logos/perplexity.svg`), CTA `cover` (`brand/covers/<file>.png`), cards `card.src` (`brand/cards/1.mp4`).

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

## Gotchas
- `sectionLines()` in Listicle.tsx and `lines()` in build.py must list tokens in the same order (ordinal, badge, head, sub, bullets / blocks). Change both or timing drifts.
- Never call hooks inside `.map` branches (TextLine computes `now` once at the top).
- Text width: a `huge` span longer than ~12 characters wraps; split it ("3" huge + "commands" big) or use big.
- Remotion bundles copy `public/` to TEMP: render with TEMP/TMP set to `C:/Users/mithi/AppData/Local/Temp/remotion-tmp` (the scripts do it).
