# Brand kit (drop your files here; every video skill reads this folder)

| folder / file | put here | used for |
|---|---|---|
| `profile.json` | your handle, name, colours, default CTA | watermark, follow card, CTA lines |
| `logos/` | YOUR personal/brand logo files: `logo.png` (square, transparent, >= 512 px), optional `logo-dark.png`, `wordmark.png`, `avatar.jpg` | follow card, watermark |
| `icons/` | theSVG UI icons (MIT) fetched with `python -I fetch_icon.py ui <slug> [look]`; recoloured in videos | scenes, cards, badges |
| `tool-logos/` | logos of products/tools shown in a video (`<slug>.svg` or `.png`). Public ones are fetched automatically; private/company ones you upload | badge pills |
| `covers/` | lead-magnet covers (ebook, checklist) as PNG/JPG | comment-keyword CTA mockup |
| `cards/` | your screen recordings (`.mp4`) and screenshots (`.png`) | item cards |

Rules: only files you own or are allowed to use. Personal branding is never downloaded from the internet: you upload it here.
Fetch a public tool logo: `python -I fetch_logo.py <slug> [hex colour]` (simple-icons, CC0) -> `tool-logos/<slug>.svg`.

Icons: `python -I fetch_icon.py search <words>` (theSVG UI + brand icons), `ui <slug> [look]`, `brand <slug> [variant]`.
