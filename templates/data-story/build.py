# Kinetic listicle build: script.json -> voice per section (edge-tts with WORD boundaries) -> src/timeline.json + public/audio/mix.wav
# usage (from the project root):  python -I build.py [--ffmpeg path/to/ffmpeg.exe]
import asyncio, json, os, re, subprocess, sys
import numpy as np, soundfile as sf, edge_tts
from scipy.signal import butter, sosfilt

ROOT = os.path.dirname(os.path.abspath(__file__))
FF = sys.argv[sys.argv.index('--ffmpeg') + 1] if '--ffmpeg' in sys.argv else r"C:\Projects\bitter-fruit\node_modules\@remotion\compositor-win32-x64-msvc\ffmpeg.exe"
S = json.load(open(os.path.join(ROOT, 'script.json'), encoding='utf-8'))
VOICE, RATE, PITCH = S.get('voice', 'en-US-AndrewNeural'), S.get('rate', '+8%'), S.get('pitch', '+0Hz')
GAP = S.get('gap', 0.12)
SR = 48000
import shutil
BRAND = S.get('brandDir', "C:/Projects/claude-animated-shorts/brand")   # shared brand kit (logos, profile.json)
if os.path.isdir(BRAND): shutil.copytree(BRAND, os.path.join(ROOT, 'public', 'brand'), dirs_exist_ok=True)
missing = [p for p in [S.get('brandLogo'), S.get('watermarkLogo')] + [sec.get('badge', {}).get('logo') for sec in S['sections']] + [sec.get('cover') for sec in S['sections']] if p and not os.path.exists(os.path.join(ROOT, 'public', p))]
if missing: raise SystemExit('Missing assets (upload them or fetch logos first): ' + ', '.join(missing))
# posters/cards actually present (scenes draw an <image> only for these, else a drawn title card)
_cards = os.path.join(ROOT, 'public', 'brand', 'cards')
os.makedirs(_cards, exist_ok=True)
_imgs = os.path.join(ROOT, S.get('imagesDir', 'images'))   # project images (scene stills, the user's files) override brand/cards
for f in (os.listdir(_imgs) if os.path.isdir(_imgs) else []):
    if f.lower().endswith(('.jpg', '.jpeg', '.png', '.webp')): shutil.copyfile(os.path.join(_imgs, f), os.path.join(_cards, f))
_pm = {}
for f in (os.listdir(_cards) if os.path.isdir(_cards) else []):
    if f.lower().endswith(('.jpg', '.jpeg', '.png', '.webp')) and not f.startswith('_p_'):
        key = os.path.splitext(f)[0].lower(); safe = '_p_' + re.sub(r'[^a-z0-9]+', '_', key) + os.path.splitext(f)[1].lower()
        shutil.copyfile(os.path.join(_cards, f), os.path.join(_cards, safe)); _pm[key] = safe
json.dump(_pm, open(os.path.join(ROOT, 'src', 'posters.json'), 'w'))
subprocess.run([sys.executable, '-I', os.path.join(ROOT, 'scripts', 'img_contrast.py')], check=False)   # text-on-image contrast -> src/imgstats.json
# theSVG UI icons (brand/icons/*.svg) -> src/icons.json for <Icon name="bot" color=...> (inlined, recoloured via currentColor)
icons = {}
for fn in sorted(os.listdir(os.path.join(BRAND, 'icons'))) if os.path.isdir(os.path.join(BRAND, 'icons')) else []:
    if fn.endswith('.svg'):
        raw = open(os.path.join(BRAND, 'icons', fn), encoding='utf-8').read()
        m = re.search(r'<svg[^>]*viewBox="([^"]+)"[^>]*>(.*)</svg>', raw, re.S)
        if m: icons[fn[:-4]] = {'vb': m.group(1), 'body': m.group(2)}
json.dump(icons, open(os.path.join(ROOT, 'src', 'icons.json'), 'w', encoding='utf-8'))
print('icons', len(icons))
# Pronunciation map: on-screen text stays as written, the voice says the mapped word ("RAG" -> "rag", not R-A-G).
PRON = {}
_prof = os.path.join(BRAND, 'profile.json')
if os.path.exists(_prof): PRON.update(json.load(open(_prof, encoding='utf-8')).get('pronounce', {}))
PRON.update(S.get('pronounce', {}))
def speak(text):
    for k, v in PRON.items(): text = re.sub(r'(?<![A-Za-z])' + re.escape(k) + r'(?![A-Za-z])', v, text)
    return text
os.makedirs(os.path.join(ROOT, 'public', 'audio'), exist_ok=True); os.makedirs(os.path.join(ROOT, 'audio', 'voice'), exist_ok=True)

def lines(sec):  # MUST match sectionLines() in Listicle.tsx
    out = []
    if sec['kind'] == 'item':
        if sec.get('ordinal'): out.append(('ordinal', [{'t': sec['ordinal'], 'say': sec.get('ordinalSay')}]))
        if sec.get('badge'): out.append(('badge', [{'t': sec['badge']['name'], 'say': sec['badge'].get('say')}]))
        for l in sec.get('head', []): out.append(('head', l))
        for l in sec.get('sub', []): out.append(('sub', l))
        for b in sec.get('bullets', []): out.append(('bullet', [{'t': b} if isinstance(b, str) else b]))
        if sec.get('tag'): out.append(('tag', [{'t': sec['tag'], 'say': ''}]))
    else:
        for l in sec.get('blocks', []): out.append(('block', l))
    return out

def spans(sec):
    return [sp for _, l in lines(sec) for sp in l]

norm = lambda w: re.sub(r"[^\w%&]+", "", w.lower())

# Voice engine: "edge" (edge-tts, online) or "kokoro" (local Kokoro-82M via C:/Projects/voice-lab, natural Hindi; user's pick 2026-11-25).
ENGINE = S.get('engine', 'edge')
KOKORO_PY = S.get('kokoroPython', 'C:/Projects/voice-lab/.venv/Scripts/python.exe')
KOKORO_SCRIPT = S.get('kokoroScript', 'C:/Projects/voice-lab/kokoro_tts.py')
_K = {}
def kokoro_batch(texts, voices=None):
    items = [{'text': t, 'out': os.path.join(ROOT, 'audio', 'voice', f'k{i:02d}.wav').replace(os.sep, '/'), **({'voice': voices[i]} if voices and voices[i] else {})} for i, t in enumerate(texts)]
    job = {'voice': S.get('kokoroVoice', 'hm_omega'), 'lang': S.get('kokoroLang', 'h'), 'speed': S.get('kokoroSpeed', 1.0), 'whisperLang': S.get('whisperLang', 'hi'), 'items': items}
    jp = os.path.join(ROOT, 'audio', 'kokoro_job.json'); json.dump(job, open(jp, 'w', encoding='utf-8'), ensure_ascii=False)
    subprocess.run([KOKORO_PY, KOKORO_SCRIPT, jp], check=True)
    for t, it in zip(texts, items): _K[t] = (it['out'], [tuple(m) for m in json.load(open(it['out'] + '.marks.json', encoding='utf-8'))])

async def tts(text, path):
    if ENGINE == 'kokoro':
        out, marks = _K[text]; shutil.copyfile(out, path); return marks
    for attempt in range(6):
        try:
            async def collect():
                c = edge_tts.Communicate(text, VOICE, rate=RATE, pitch=PITCH, boundary="WordBoundary")
                marks, audio = [], bytearray()
                async for ch in c.stream():
                    if ch['type'] == 'audio': audio += ch['data']
                    elif ch['type'] == 'WordBoundary': marks.append((ch['offset'] / 1e7, (ch['offset'] + ch['duration']) / 1e7, ch['text']))
                return marks, audio
            marks, audio = await asyncio.wait_for(collect(), timeout=45)   # a stalled connection retries instead of hanging forever
            if marks:
                open(path, 'wb').write(bytes(audio)); return marks
        except Exception as e:
            print('retry', attempt, type(e).__name__)
        await asyncio.sleep(1.5)
    raise SystemExit('edge-tts failed: ' + text[:60])

async def main():
    if ENGINE == 'kokoro':
        texts = []
        for sec in S['sections']:
            sp_ = spans(sec); say_ = [(s['say'] if s.get('say') is not None else speak(s['t'])) for s in sp_]
            texts.append(' '.join(x for x in say_ if x).replace(' ,', ','))
        kokoro_batch(texts, [sec.get('kokoroVoice') for sec in S['sections']])   # per-section voice (e.g. a presenter aside)
    out_secs, t = [], 0.0
    voice = np.zeros(int(SR * 600))
    for i, sec in enumerate(S['sections']):
        sp = spans(sec)
        say = [(s['say'] if s.get('say') is not None else speak(s['t'])) for s in sp]   # say == '' -> shown silently
        text = ' '.join(x for x in say if x).replace(' ,', ',')
        mp3 = os.path.join(ROOT, 'audio', 'voice', f's{i:02d}.mp3'); wav = mp3[:-4] + '.wav'
        marks = await tts(text, mp3)
        subprocess.run([FF, '-v', 'error', '-y', '-i', mp3, '-ar', str(SR), '-ac', '1', wav], check=True)
        x, _ = sf.read(wav)
        dur = min(len(x) / SR, marks[-1][1] + 0.35)
        x = x[: int(dur * SR)]
        # align every displayed word to a spoken word: walk the say-words and the boundary marks in order
        mi, times = 0, []
        for s, sy in zip(sp, say):
            disp, sw = s['t'].split(), sy.split()
            if not sw:   # silent span: appear just after the last spoken word, one word every 0.09 s
                last = (times[-1] - t) if times else 0.0
                times += [round(t + last + 0.35 + 0.09 * k, 3) for k in range(len(disp))]; continue
            starts = []
            for w in sw:
                j = mi
                while j < len(marks) and j < mi + 4 and norm(marks[j][2]) and not norm(w).startswith(norm(marks[j][2])[:3]) and not norm(marks[j][2]).startswith(norm(w)[:3]):
                    j += 1
                if j >= len(marks) or j >= mi + 4: j = min(mi, len(marks) - 1)
                starts.append(marks[j][0]); mi = min(j + 1, len(marks) - 1) if j + 1 < len(marks) else j
            if len(disp) == len(starts): ts = starts
            else:  # display differs from what is said (e.g. "/init" said "slash init"): spread over the spoken span
                a, b = starts[0], starts[-1] + 0.25
                ts = [a + (b - a) * k / max(1, len(disp)) for k in range(len(disp))]
            times += [round(t + v, 3) for v in ts]
        if times and any(x.get("say") == "" for x in sp): dur = max(dur, times[-1] - t + 1.0)   # only sections with silent lines
        dur = max(dur, sec.get('minDur', 0))   # silent tag lines need ~1 s on screen after they appear
        voice[int(t * SR): int(t * SR) + len(x)] += x
        out_secs.append({'kind': sec['kind'], 't0': round(t, 3), 't1': round(t + dur + GAP, 3), 'words': times})
        print(f"section {i} {sec['kind']:7s} {dur:5.2f}s words {len(times)}")
        t += dur + GAP
    total = t + 0.6
    out_secs[-1]['t1'] = round(total, 3)
    json.dump({'total': round(total, 3), 'sections': out_secs}, open(os.path.join(ROOT, 'src', 'timeline.json'), 'w'), indent=1)
    voice = voice[: int(total * SR)]
    mix(voice, out_secs, total)

def mix(voice, secs, total):
    N = len(voice); rng = np.random.default_rng(3)
    sfx = np.zeros(N); mus = np.zeros(N)
    def put(buf, x, t0, g=1.0):
        i = int(t0 * SR); x = x[: max(0, N - i)]; buf[i:i + len(x)] += x * g
    def bp(x, lo, hi): return sosfilt(butter(2, [lo, hi], 'bandpass', fs=SR, output='sos'), x)
    def whoosh(d=0.35):
        n = int(d * SR); tt = np.linspace(0, 1, n); x = rng.standard_normal(n)
        return bp(x, 400, 6000) * np.sin(np.pi * tt) ** 2 * 0.25
    def tick(f=2400, d=0.06):
        tt = np.arange(int(d * SR)) / SR; return np.sin(2 * np.pi * f * tt) * np.exp(-tt * 60) * 0.25
    def pop():
        tt = np.arange(int(0.12 * SR)) / SR; return np.sin(2 * np.pi * (300 + 900 * np.exp(-tt * 40)) * tt) * np.exp(-tt * 30) * 0.4
    for i, (sec, tl) in enumerate(zip(S['sections'], secs)):
        put(sfx, whoosh(), max(0, tl['t0'] - 0.12))
        L = lines(sec); k = 0
        for g, l in L:
            n = sum(len(sp['t'].split()) for sp in l)
            if g == 'badge': put(sfx, pop(), tl['words'][k] - 0.08)
            if g == 'bullet': put(sfx, tick(), tl['words'][k] - 0.02, 0.8)
            k += n
        # per-section sound events: {"word": "500", "type": "pop", "offset": 0} or {"t": 1.2, "type": "tick", "n": 8, "every": 0.08}
        toks = [w for _, l in L for sp in l for w in sp['t'].split()]
        for ev in sec.get('sfx', []):
            if 'word' in ev:
                idx = next((j for j, w in enumerate(toks) if norm(ev['word']) in norm(w)), None)
                if idx is None: continue
                at = tl['words'][idx] + ev.get('offset', 0)
            else: at = tl['t0'] + ev['t']
            for r in range(ev.get('n', 1)):
                kind = ev['type']; x = {'pop': pop, 'tick': tick, 'whoosh': whoosh}.get(kind)
                if kind == 'chime': tt = np.arange(int(0.9 * SR)) / SR; x = lambda: sum(np.sin(2 * np.pi * f * tt) * np.exp(-tt * 4) * 0.12 for f in (1046.5, 1318.5, 1568))
                if kind == 'error': tt = np.arange(int(0.3 * SR)) / SR; x = lambda: np.sign(np.sin(2 * np.pi * 140 * tt)) * np.exp(-tt * 9) * 0.12
                if kind == 'glitch': tt = np.arange(int(0.35 * SR)) / SR; x = lambda: bp(rng.standard_normal(len(tt)), 800, 7000) * (np.sin(2 * np.pi * 23 * tt) > 0) * np.exp(-tt * 6) * 0.35
                if kind == 'boom': tt = np.arange(int(0.9 * SR)) / SR; x = lambda: np.sin(2 * np.pi * np.cumsum(70 - 35 * tt / 0.9) / SR) * np.exp(-tt * 3.5) * 0.7
                if kind == "clack": tt = np.arange(int(0.07 * SR)) / SR; x = lambda: (bp(rng.standard_normal(len(tt)), 1800, 6500) * 0.5 + np.sin(2 * np.pi * 900 * tt)) * np.exp(-tt * 90) * 0.35
                if kind == "rewind": tt = np.arange(int(1.0 * SR)) / SR; x = lambda: np.sin(2 * np.pi * np.cumsum(1400 - 1100 * tt) / SR * 3) * (np.sin(2 * np.pi * 18 * tt) > -0.3) * np.exp(-tt * 1.5) * 0.12
                if kind == "heartbeat": tt = np.arange(int(0.7 * SR)) / SR; x = lambda: (np.sin(2 * np.pi * 52 * tt) * np.exp(-tt * 22) + np.sin(2 * np.pi * 46 * np.clip(tt - 0.24, 0, None)) * np.exp(-np.clip(tt - 0.24, 0, None) * 20) * (tt > 0.24)) * 0.9
                if kind == "shutter": tt = np.arange(int(0.12 * SR)) / SR; x = lambda: bp(rng.standard_normal(len(tt)), 2000, 9000) * (np.exp(-tt * 70) + 0.6 * np.exp(-np.clip(tt - 0.05, 0, None) * 90) * (tt > 0.05)) * 0.5
                if kind == "beep": tt = np.arange(int(0.12 * SR)) / SR; x = lambda: np.sin(2 * np.pi * 1000 * tt) * (tt < 0.1) * 0.15
                if kind == "slam": tt = np.arange(int(0.45 * SR)) / SR; x = lambda: (np.sin(2 * np.pi * 60 * tt) * 0.8 + bp(rng.standard_normal(len(tt)), 200, 3000) * 0.6) * np.exp(-tt * 12) * 0.6
                if kind == 'riser': tt = np.arange(int(1.2 * SR)) / SR; x = lambda: bp(rng.standard_normal(len(tt)), 600, 6000) * (tt / 1.2) ** 2 * 0.3
                if x: put(sfx, x(), at + r * ev.get('every', 0.08), ev.get('gain', 0.8))
    if S.get('music') == 'dark':   # cinematic bed for story/lore reels: slow D-minor pads + soft sub pulse, 70 bpm
        beat = 60 / 70; chords = [[73.4, 146.8, 174.6, 220], [58.3, 116.5, 146.8, 174.6], [49, 98, 116.5, 146.8], [55, 110, 138.6, 164.8]]
        t = 0.0; bar = 0; L = 4 * beat
        while t < total:
            tt = np.arange(int((L + 1.5) * SR)) / SR; env_ = np.minimum(1, tt / 1.2) * np.exp(-np.clip(tt - L, 0, None) * 2.5)
            pad = sum(np.sin(2 * np.pi * f * tt) + 0.5 * np.sin(2 * np.pi * f * 1.003 * tt) for f in chords[bar % 4]) * env_ * 0.018
            put(mus, pad, t)
            for b in range(4):
                ts_ = np.arange(int(0.5 * SR)) / SR; put(mus, np.sin(2 * np.pi * 42 * ts_) * np.exp(-ts_ * 7) * (0.22 if b == 0 else 0.1), t + b * beat)
            t += L; bar += 1
    else:
      # light pluck bed, 96 bpm, i - VI - III - VII in A minor
      beat = 60 / 96; chords = [[220, 261.6, 329.6], [174.6, 220, 261.6], [261.6, 329.6, 392], [196, 246.9, 293.7]]
      t = 0.0; bar = 0
      while t < total:
          for b in range(4):
              for j, f in enumerate(chords[bar % 4]):
                  tt = np.arange(int(0.9 * SR)) / SR
                  put(mus, (np.sin(2 * np.pi * f * tt) + 0.3 * np.sin(4 * np.pi * f * tt)) * np.exp(-tt * 5) * 0.05, t + b * beat + j * 0.02)
              tt = np.arange(int(0.25 * SR)) / SR
              if b % 2 == 0: put(mus, np.sin(2 * np.pi * (55 + 40 * np.exp(-tt * 30)) * tt) * np.exp(-tt * 12) * 0.25, t + b * beat)
          t += 4 * beat; bar += 1
    for sec, tl in zip(S['sections'], secs):   # "mute": true -> music drops out for that section (the silent beat before a gut punch)
        if sec.get('mute'): a_, b_ = int(tl['t0'] * SR), int(tl['t1'] * SR); mus[a_:b_] *= np.linspace(1, 0, b_ - a_) ** 0.15 if sec.get('mute') == 'fade' else 0
    env = sosfilt(butter(1, 5, 'lowpass', fs=SR, output='sos'), np.abs(voice)); env = np.clip(env / (env.max() + 1e-9) * 3, 0, 1)
    mus *= (1 - 0.45 * env); fade = np.ones(N); fade[-int(1.2 * SR):] = np.linspace(1, 0, int(1.2 * SR)); mus *= fade
    m = voice * 0.95 + mus * 1.4 + sfx * 0.7          # standard mix: music under voice, SFX light
    m = np.tanh(m * 1.6) / np.tanh(1.6); m *= 0.95 / (np.abs(m).max() + 1e-9)
    st = np.stack([m, m], 1).astype('float32')
    sf.write(os.path.join(ROOT, 'public', 'audio', 'mix.wav'), st, SR)
    print('mix', round(total, 2), 's  rms dB', round(20 * np.log10(np.sqrt((m ** 2).mean())), 1))

asyncio.run(main())
