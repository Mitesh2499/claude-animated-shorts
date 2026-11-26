# Animated-asset fetcher for every video/carousel skill (2026-11-25). Static icons/logos stay in fetch_icon.py (theSVG).
# Every download is logged with source, page, licence and whether the caption must credit it: brand/animated/CREDITS.json.
#
#   python -I fetch_anim.py sources                         list the libraries, formats and licences
#   python -I fetch_anim.py search <words>                  search Motive + AssetPolish + SketchValley at once
#   python -I fetch_anim.py motive <slug>                   Motive (freeicon.dev) animated SVG icon, CC0      -> animated/motive/<slug>.svg
#   python -I fetch_anim.py assetpolish <pack>/<name>       AssetPolish animated icon / sticker, CC0          -> animated/assetpolish/<name>.svg
#   python -I fetch_anim.py sketchvalley <slug>             SketchValley Motion animated illustration (free commercial, no attribution)
#   python -I fetch_anim.py lottie <json-or-.lottie-url> [name] [--page URL]   LottieFiles / Lottieflow Lottie JSON -> animated/lottie/<name>.json
#   python -I fetch_anim.py url <direct-url> --source X --license "..." [--attribution "text"] [--page URL] [name]
#                                                           anything else (IconKing, Pulsar, Sveegees, SVG Repo, Openverse ...)
#   python -I fetch_anim.py credits                         the attribution lines a caption must carry
#
# Render them with src/assets.tsx: <AnimatedSvg> (CSS/SMIL animation seeked to the video frame - deterministic),
# <LottieAsset>, <GifAsset>, and <SvgIcon> to animate a STATIC theSVG icon ourselves (draw-on / arrive / stagger).
import json, os, re, sys, urllib.request, zipfile, io, datetime
sys.stdout.reconfigure(encoding='utf-8', errors='replace')
HERE = os.path.dirname(os.path.abspath(__file__)); OUT = os.path.join(HERE, 'animated'); CACHE = os.path.join(HERE, '.cache'); os.makedirs(CACHE, exist_ok=True)
UA = {'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/130.0 Safari/537.36'}

SOURCES = [  # name, formats, licence, attribution needed, how
    ('theSVG (thesvg.org)', 'static SVG brand logos (7,900+) + UI icons (1,100+)', 'MIT / per-brand trademark', 'no', 'fetch_icon.py search|ui|brand; animate with <SvgIcon>'),
    ('Motive (freeicon.dev)', 'animated SVG + GIF, 310 icons', 'CC0-1.0', 'no', 'fetch_anim.py motive <slug>'),
    ('AssetPolish', 'animated SVG icons (219) + stickers (119)', 'CC0', 'no', 'fetch_anim.py assetpolish <pack>/<name>'),
    ('SketchValley Motion', 'CSS-animated SVG illustrations', 'free commercial, no attribution', 'no', 'fetch_anim.py sketchvalley <slug>'),
    ('Sveegees', 'animated SVG icons (loaders, arrows, UI, media)', 'free commercial, no attribution (per site)', 'no', 'fetch_anim.py url <svg-url> --source sveegees --license "free commercial"'),
    ('IconKing', 'SVG/PNG icons free; animations mostly premium AI', 'free icons: commercial, no attribution; check each animation', 'check', 'fetch_anim.py url ...'),
    ('Pulsar Icons', 'free animated SVG icons', 'free WITH attribution', 'YES', 'fetch_anim.py url ... --attribution "Icons by Pulsar (pulsaricons.com)"'),
    ('LottieFiles', 'Lottie JSON / dotLottie animations', 'Lottie Simple License (free animations) - check each', 'no (check)', 'fetch_anim.py lottie <json url> --page <page url>'),
    ('Lottieflow', 'Lottie UI elements (arrows, menus, checkmarks)', 'free (check the element page)', 'check', 'fetch_anim.py lottie <json url>'),
    ('SVG Repo', '500k open-licensed SVGs (some animated)', 'per icon (MIT / CC0 / CC BY ...) - read the page', 'per icon', 'fetch_anim.py url https://www.svgrepo.com/download/<id>/<name>.svg --license "<from page>"'),
    ('Openverse', 'CC images + audio (SFX)', 'CC0 / CC BY / CC BY-SA per item', 'per item', 'fetch_anim.py url <file> --license "CC BY 4.0" --attribution "<title> by <creator>"'),
    ('awesome-motion-graphics (GitHub list)', 'curated free effects, particles, transitions, backgrounds', 'per resource', 'per item', 'reference list: github.com/beast-ofcourse/awesome-motion-graphics'),
    ('Animora', 'browser SVG animation editor -> MP4/GIF/PNG sequence', 'tool', '-', 'make an animation there, export PNG sequence/MP4 into the project, render with <OffthreadVideo>'),
]

def get(url, binary=True):
    d = urllib.request.urlopen(urllib.request.Request(url, headers=UA), timeout=40).read()
    return d if binary else d.decode('utf-8', 'replace')
def cached(name, url):
    p = os.path.join(CACHE, name)
    if not os.path.exists(p) or (datetime.datetime.now().timestamp() - os.path.getmtime(p)) > 7 * 86400: open(p, 'wb').write(get(url))
    return open(p, encoding='utf-8', errors='replace').read()
def credit(rel, source, page, lic, attribution=None, url=None):
    p = os.path.join(OUT, 'CREDITS.json'); data = json.load(open(p, encoding='utf-8')) if os.path.exists(p) else []
    data = [d for d in data if d['file'] != rel]
    data.append({'file': rel, 'source': source, 'page': page, 'url': url, 'license': lic, 'attribution': attribution, 'credit_required': bool(attribution), 'fetched': datetime.date.today().isoformat()})
    json.dump(data, open(p, 'w', encoding='utf-8'), indent=1, ensure_ascii=False)
def save(data, sub, fname):
    d = os.path.join(OUT, sub); os.makedirs(d, exist_ok=True); p = os.path.join(d, fname)
    open(p, 'wb' if isinstance(data, bytes) else 'w', **({} if isinstance(data, bytes) else {'encoding': 'utf-8'})).write(data)
    rel = os.path.relpath(p, HERE).replace('\\', '/'); print('saved', p, f'-> use "{rel}" (public/brand/{rel})'); return rel
def check_svg(s):
    if '<svg' not in s[:5000]: raise SystemExit('not an SVG (the site may have changed) - download it by hand into brand/animated/')
    if re.search(r'<script|javascript:|on(load|click|error)\s*=', s, re.I): raise SystemExit('SVG contains script/handlers - refusing (only plain SVG + CSS/SMIL animation is allowed)')
    kind = 'css' if '@keyframes' in s else 'smil' if re.search(r'<animate', s) else 'static'
    print('animation:', kind); return kind

def motive_index(): return sorted(set(re.findall(r'href="/icons/([a-z0-9-]+)/"', cached('motive.html', 'https://freeicon.dev/'))))
def ap_index():
    h = cached('assetpolish.html', 'https://www.assetpolish.com/animated-icons/')
    return sorted({m for m in re.findall(r'/assets/([a-z0-9-]+/[a-z0-9-]+)\.svg', h) if not m.endswith('-still')})
def sv_index():
    h = cached('sketchvalley.html', 'https://sketchvalley.com/motion/')
    return sorted(set(re.findall(r'/motion/([a-z0-9-]+)(?:/|\.svg)', h)))

cmd = sys.argv[1] if len(sys.argv) > 1 else 'help'
args = [a for a in sys.argv[2:]]
def opt(k):
    if k in args: i = args.index(k); v = args[i + 1]; del args[i:i + 2]; return v
    return None
if cmd == 'sources':
    for s in SOURCES: print(f'- {s[0]}: {s[1]} | licence: {s[2]} | credit: {s[3]} | {s[4]}')
elif cmd == 'search':
    q = ' '.join(args).lower().split()
    hit = lambda name: all(w in name for w in q)
    print('motive:      ', ', '.join(s for s in motive_index() if hit(s))[:900] or '-')
    print('assetpolish: ', ', '.join(s for s in ap_index() if hit(s))[:900] or '-')
    print('sketchvalley:', ', '.join(s for s in sv_index() if hit(s))[:900] or '-')
    print('also: theSVG static icons -> python -I fetch_icon.py search', ' '.join(q))
elif cmd == 'motive':
    slug = args[0]; page = f'https://freeicon.dev/icons/{slug}/'
    import html as _html
    h = get(page, False)
    # the page's "copy SVG" code block holds the full animated source (escaped); the inline preview has no <style>
    cands = [_html.unescape(x) for x in re.findall(r'&lt;svg[\s\S]*?&lt;/svg&gt;', h)] + re.findall(r'<svg[^>]*id="svg-' + re.escape(slug) + r'-[\s\S]*?</svg>', h)
    cands = [c for c in cands if 'svg-' + slug in c]
    if not cands: raise SystemExit(f'no animated SVG for {slug} on {page}; try: fetch_anim.py search {slug}')
    s = max(cands, key=lambda c: ('@keyframes' in c, len(c))); check_svg(s)
    s = re.sub(r'#253e35', 'currentColor', s, flags=re.I)   # Motive's default ink -> currentColor, so <Asset color=...> recolours it
    rel = save(s, 'motive', f'{slug}.svg'); credit(rel, 'Motive (freeicon.dev)', page, 'CC0-1.0', url=page)
elif cmd == 'assetpolish':
    key = args[0].strip('/'); url = f'https://www.assetpolish.com/assets/{key}.svg'
    s = get(url, False); check_svg(s)
    rel = save(s, 'assetpolish', key.split('/')[-1] + '.svg'); credit(rel, 'AssetPolish', 'https://www.assetpolish.com/animated-icons/', 'CC0', url=url)
elif cmd == 'sketchvalley':
    slug = args[0]; url = f'https://sketchvalley.com/motion/{slug}.svg'
    s = get(url, False); check_svg(s)
    rel = save(s, 'sketchvalley', f'{slug}.svg'); credit(rel, 'SketchValley Motion', f'https://sketchvalley.com/motion/{slug}/', 'free for personal and commercial use, no attribution required', url=url)
elif cmd == 'lottie':
    page = opt('--page'); url = args[0]; name = args[1] if len(args) > 1 else re.sub(r'[^a-z0-9-]+', '-', url.rsplit('/', 1)[-1].lower().rsplit('.', 1)[0])[:40]
    d = get(url)
    if d[:2] == b'PK':   # dotLottie = zip with animations/*.json
        z = zipfile.ZipFile(io.BytesIO(d)); js = [n for n in z.namelist() if n.startswith('animations/') and n.endswith('.json')]
        if not js: raise SystemExit('dotLottie without animations/*.json')
        d = z.read(js[0])
    j = json.loads(d)
    if not all(k in j for k in ('fr', 'ip', 'op', 'layers')): raise SystemExit('not a Lottie JSON')
    print(f"lottie: {j.get('w')}x{j.get('h')} {j['fr']} fps, {(j['op'] - j['ip']) / j['fr']:.2f} s, {len(j['layers'])} layers")
    rel = save(json.dumps(j), 'lottie', f'{name}.json'); credit(rel, 'LottieFiles/Lottieflow', page or url, 'Lottie Simple License (free animation) - verify on the page', url=url)
elif cmd == 'url':
    src = opt('--source') or 'manual'; lic = opt('--license'); att = opt('--attribution'); page = opt('--page')
    if not lic: raise SystemExit('give --license (read it on the asset page); add --attribution "..." if the licence asks for credit')
    url = args[0]; name = args[1] if len(args) > 1 else url.split('?')[0].rsplit('/', 1)[-1]
    d = get(url)
    if name.lower().endswith('.svg'): check_svg(d.decode('utf-8', 'replace'))
    rel = save(d, re.sub(r'[^a-z0-9-]+', '-', src.lower()), name); credit(rel, src, page or url, lic, att, url)
elif cmd == 'credits':
    p = os.path.join(OUT, 'CREDITS.json'); data = json.load(open(p, encoding='utf-8')) if os.path.exists(p) else []
    need = [d for d in data if d.get('credit_required')]
    print('\n'.join(f"{d['attribution']} ({d['license']})" for d in need) or 'no attribution required for the downloaded assets')
else:
    print(open(__file__, encoding='utf-8').read().split('import json')[0])
