# theSVG (https://thesvg.org, MIT) icon fetcher for every video skill.
#   python -I fetch_icon.py search <words>            search brand icons (7,900+) and UI icons (1,100+)
#   python -I fetch_icon.py ui <slug> [look]          UI icon -> icons/<slug>.<look>.svg   (looks: outline duotone fill glass glass-outline offset depth; default duotone)
#   python -I fetch_icon.py brand <slug> [variant]    brand logo -> tool-logos/<slug>.svg (variants: default color mono light dark wordmark ...)
# UI icons use currentColor, so the renderer recolours them to the brand palette. Brand logos keep their official colours.
# Fallbacks: fetch_logo.py (simple-icons), then the product's official press kit, then ask the user to upload.
import json, os, sys, urllib.request
sys.stdout.reconfigure(encoding='utf-8', errors='replace')
HERE = os.path.dirname(os.path.abspath(__file__)); CACHE = os.path.join(HERE, '.cache'); os.makedirs(CACHE, exist_ok=True)
UA = {'User-Agent': 'Mozilla/5.0 (video-skill icon fetch)'}
def get(url):
    return urllib.request.urlopen(urllib.request.Request(url, headers=UA), timeout=30).read()
def manifest(name, url):
    p = os.path.join(CACHE, name)
    if not os.path.exists(p): open(p, 'wb').write(get(url))
    return json.load(open(p, encoding='utf-8'))
def save(data, folder, fname):
    d = os.path.join(HERE, folder); os.makedirs(d, exist_ok=True); p = os.path.join(d, fname)
    open(p, 'wb').write(data); print('saved', p); return p

cmd = sys.argv[1] if len(sys.argv) > 1 else 'help'
if cmd == 'search':
    q = ' '.join(sys.argv[2:]).lower()
    ui = manifest('ui-icons.json', 'https://cdn.jsdelivr.net/gh/glincker/thesvg@main/src/data/ui-icons.json')
    hits = [i for i in ui['icons'] if q in i['slug'] or any(q in t for t in i.get('tags', []))]
    print('UI icons:', ', '.join(i['slug'] for i in hits[:30]) or '-')
    reg = manifest('registry.json', 'https://thesvg.org/api/registry.json')
    hits = [i for i in reg['icons'] if q in i['slug'] or q in i['title'].lower() or any(q in a.lower() for a in i.get('aliases', []))]
    for i in hits[:20]: print(f"brand: {i['slug']:28s} {i['title'][:30]:30s} variants={','.join(i['variants'])} license={i.get('license')}")
elif cmd == 'ui':
    slug = sys.argv[2]; look = sys.argv[3] if len(sys.argv) > 3 else 'duotone'
    save(get(f'https://thesvg.org/ui/{slug}/{look}.svg'), 'icons', f'{slug}.{look}.svg')
elif cmd == 'brand':
    slug = sys.argv[2]; var = sys.argv[3] if len(sys.argv) > 3 else 'default'
    for url in (f'https://thesvg.org/icons/{slug}/{var}.svg', f'https://cdn.jsdelivr.net/gh/glincker/thesvg@main/public/icons/{slug}/{var}.svg'):
        try: save(get(url), 'tool-logos', f'{slug}.svg' if var == 'default' else f'{slug}.{var}.svg'); break
        except Exception as e: print('miss', url, type(e).__name__)
    else: raise SystemExit(f'NOT FOUND: {slug}/{var} - try `search`, fetch_logo.py, the official press kit, or ask the user to upload it')
else:
    print(__doc__ if __doc__ else open(__file__, encoding='utf-8').read().split('import')[0])
