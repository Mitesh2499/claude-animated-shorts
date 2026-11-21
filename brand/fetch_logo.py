# Fetch a public brand/tool logo from simple-icons (CC0 SVGs) into tool-logos/<slug>.svg, optionally recoloured.
# usage: python -I fetch_logo.py <slug> [#hex] [--white]     e.g. python -I fetch_logo.py anthropic "#cc6e5a"
# Find slugs at https://simpleicons.org . If it is not there, try the product's official press kit; otherwise ask the user to upload.
import sys, os, re, urllib.request
slug = sys.argv[1].lower(); colour = next((a for a in sys.argv[2:] if a.startswith('#')), None)
out = os.path.join(os.path.dirname(os.path.abspath(__file__)), 'tool-logos', f'{slug}.svg')
for url in (f'https://cdn.jsdelivr.net/npm/simple-icons@13.21.0/icons/{slug}.svg', f'https://unpkg.com/simple-icons@13.21.0/icons/{slug}.svg'):
    try:
        svg = urllib.request.urlopen(urllib.request.Request(url, headers={'User-Agent': 'logo-fetch'}), timeout=20).read().decode('utf-8')
        break
    except Exception as e:
        print('miss', url, type(e).__name__); svg = None
if not svg: raise SystemExit(f'NOT FOUND: {slug} - ask the user to upload it to brand/tool-logos/')
fill = '#ffffff' if '--white' in sys.argv else colour
if fill: svg = re.sub(r'<svg ', f'<svg fill="{fill}" ', svg, count=1)
open(out, 'w', encoding='utf-8').write(svg); print('saved', out)
