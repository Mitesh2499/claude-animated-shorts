# Contrast check for text drawn ON photos (photo scene overlays: REC label, timecode, corner brackets, FREEZE tag, caption pill;
# versus stamp). For every image in public/brand/cards it crops what the card actually shows (object-fit: cover into 950x550,
# object-position 50% 35%), measures WCAG relative luminance in each overlay region and picks the text treatment:
#   "light" = white text passes 4.5:1 against the region's bright end (85th percentile luminance)
#   "dark"  = navy ink passes 4.5:1 against the region's dark end (15th percentile)
#   "scrim" = neither passes on a busy region -> white text on a dark gradient scrim (always >= 4.5:1)
# Writes src/imgstats.json (read by scenes_story.tsx / scenes_data.tsx) and out/contrast_report.md.
# usage (project root): py -I scripts/img_contrast.py        (build.py calls it automatically)
import json, os, sys
import numpy as np
from PIL import Image

ROOT = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
CARDS = os.path.join(ROOT, 'public', 'brand', 'cards')
PM = json.load(open(os.path.join(ROOT, 'src', 'posters.json'), encoding='utf-8')) if os.path.exists(os.path.join(ROOT, 'src', 'posters.json')) else {}
INK = (11, 18, 32)   # #0B1220
W, H = 950, 550
REGIONS = {   # x0, y0, x1, y1 in card pixels (scenes_story.tsx photo + Rec)
    'rec': (20, 30, 300, 100), 'tc': (630, 30, 935, 100), 'freeze': (320, 30, 630, 95),
    'corners': None, 'caption': (20, 465, 520, 540), 'center': (240, 160, 710, 390),
}
def lin(c): c = c / 255.0; return np.where(c <= 0.03928, c / 12.92, ((c + 0.055) / 1.055) ** 2.4)
def lum_arr(a): r, g, b = lin(a[..., 0]), lin(a[..., 1]), lin(a[..., 2]); return 0.2126 * r + 0.7152 * g + 0.0722 * b
def L1(rgb): return float(lum_arr(np.array([[rgb]], dtype=float))[0, 0])
def cr(a, b): hi, lo = max(a, b), min(a, b); return (hi + 0.05) / (lo + 0.05)
L_WHITE, L_INK = 1.0, L1(INK)

def cover(im, w=W, h=H, px=0.5, py=0.35):
    s = max(w / im.width, h / im.height); im = im.resize((max(w, round(im.width * s)), max(h, round(im.height * s))), Image.LANCZOS)
    x = round((im.width - w) * px); y = round((im.height - h) * py); return im.crop((x, y, x + w, y + h))

def judge(region, need=4.5, fail='scrim'):   # text needs 4.5:1; graphics (brackets) 3:1 and fall back to a dark halo
    L = lum_arr(np.asarray(region, dtype=float)).ravel(); lo, hi = float(np.percentile(L, 15)), float(np.percentile(L, 85))
    cw, cd = cr(L_WHITE, hi), cr(L_INK, lo)
    mode = 'light' if cw >= need else 'dark' if cd >= need else fail
    return {'mode': mode, 'white': round(cw, 2), 'ink': round(cd, 2), 'p15': round(lo, 3), 'p85': round(hi, 3)}

def main():
    out, rows = {}, []
    for stem, fn in sorted(PM.items()):
        path = os.path.join(CARDS, fn)
        if not os.path.exists(path): continue
        try: im = cover(Image.open(path).convert('RGB'))
        except Exception as e: print('skip', fn, e); continue
        st = {}
        for name, box in REGIONS.items():
            if name == 'corners':
                parts = [im.crop(b) for b in [(10, 10, 110, 110), (W - 110, 10, W - 10, 110), (10, H - 110, 110, H - 10), (W - 110, H - 110, W - 10, H - 10)]]
                js = [judge(p, 3.0, 'halo') for p in parts]; ms = {j['mode'] for j in js}   # all four brackets share one colour
                worst = min(js, key=lambda j: max(j['white'], j['ink']))
                st[name] = {**worst, 'mode': 'light' if ms == {'light'} else 'dark' if ms == {'dark'} else 'halo'}
            else: st[name] = judge(im.crop(box))
        out[stem] = st
        rows.append(f"| {stem} | " + " | ".join(f"{st[k]['mode']} (w {st[k]['white']} / ink {st[k]['ink']})" for k in ('rec', 'tc', 'corners', 'caption', 'center')) + " |")
    json.dump(out, open(os.path.join(ROOT, 'src', 'imgstats.json'), 'w', encoding='utf-8'), indent=1)
    os.makedirs(os.path.join(ROOT, 'out'), exist_ok=True)
    with open(os.path.join(ROOT, 'out', 'contrast_report.md'), 'w', encoding='utf-8') as f:
        f.write("# Text-on-image contrast (WCAG, text >= 4.5:1)\n\nPer element: REC label and timecode are text (4.5:1) -> white / navy ink / white on a dark pill (scrim); corner brackets are graphics (3:1) -> white / ink / white with a dark halo. "
                "Cells: chosen mode (contrast of white text vs the bright end / navy ink vs the dark end of the region).\n"
                "Caption pills and the FREEZE tag sit on their own dark pill (white on #0B1220 = 18:1), so their region is informational.\n\n"
                "| image | REC label | timecode | corner brackets | caption area | centre |\n|---|---|---|---|---|---|\n" + "\n".join(rows) + "\n")
    from collections import Counter
    print('imgstats', len(out), 'images; REC', dict(Counter(v['rec']['mode'] for v in out.values())), 'timecode', dict(Counter(v['tc']['mode'] for v in out.values())), 'brackets', dict(Counter(v['corners']['mode'] for v in out.values())))

if __name__ == '__main__': main()
