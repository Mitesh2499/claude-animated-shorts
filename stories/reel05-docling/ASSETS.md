# Reel 05 (Episode 04) — assets, sources, illustrative data

Video: `Reel05_Ep04_Docling_PDF_Structure.mp4` · 1080x1920 · 69.7 s · project `c:\Projects\reel05-docling`

## Icons / logos
- UI icons: theSVG (MIT) — bot, calendar, hash, search, scan, gearbox, file-text, scissors, database, circle-check, circle-x, sparkles, badge-check, triangle-alert, pdf-file.
- Brand: `pdf` (theSVG), `python` (theSVG, CC0) on the code card.
- Docling logo: not on theSVG or simple-icons, so a code-drawn "DOCLING" wordmark + gear icon is used. Drop an official logo into `brand/tool-logos/docling.svg` to swap it in.
- All pages, tables, scans and chat UIs are code-drawn (no third-party screenshots).

## Facts used (Docling docs)
- `DocumentConverter` -> structured `DoclingDocument` (not a plain string); export to Markdown/JSON.
- PDF pipeline: layout analysis (title, text, table, picture, header/footer = furniture), reading order, OCR for scanned pages, TableFormer table structure.
- Provenance: items keep page number + bounding box.
- Code shown: `DocumentConverter()`, `.convert(path).document`, `.export_to_markdown()`; `pip install docling`.
- Docling is the conversion layer, not an embedding model or vector DB.

## Illustrative (made up for the story)
1,470 / "1,500 days", 147 people, the #general post and reaction counts, HR "Quick chat?" invite, 31 vs 21 carry-forward, the smudged scan, the leave table (Full-time 24/12, Part-time 12/6), page numbers, the 500-character chunk split and "Part-time: 24 days".

## Changes vs SCRIPT.md v2
- "Extracting words is not understanding a document" removed (length); several lines shortened; voice +18 %.
- "And TableFormer..." -> "Then TableFormer..." (TTS service refused the original line).
- "Practical AI engineering." shown silently on the follow card.
