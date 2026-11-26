# Synthesised score + SFX + Hindi voice -> ../public/audio/mix.wav (48 kHz stereo). Timings from ../src/timeline.json.
import json, numpy as np, soundfile as sf
from scipy.signal import butter, sosfilt, fftconvolve
SR = 48000
TL = json.load(open('../src/timeline.json')); TOTAL = TL['total'] / TL['fps']
N = int((TOTAL + 0.6) * SR); rng = np.random.default_rng(7)
def t_(d): return np.arange(int(d * SR)) / SR
def bp(x, lo, hi, o=2): return sosfilt(butter(o, [lo, hi], 'bandpass', fs=SR, output='sos'), x)
def lp(x, f, o=2): return sosfilt(butter(o, f, 'lowpass', fs=SR, output='sos'), x)
def hp(x, f, o=2): return sosfilt(butter(o, f, 'highpass', fs=SR, output='sos'), x)
def env(n, a, r):
    e = np.ones(n); na, nr = int(a * SR), int(r * SR)
    if na: e[:na] = np.linspace(0, 1, na)
    if nr: e[-nr:] *= np.linspace(1, 0, nr)
    return e
def put(buf, x, t0, g=1.0, pan=0.0):
    i = int(t0 * SR)
    if i >= N: return
    x = x[: N - i]
    buf[i:i + len(x), 0] += x * g * (1 - max(0, pan)); buf[i:i + len(x), 1] += x * g * (1 + min(0, pan))
def ramp(buf, t0, t1, g0, g1):
    a, b = int(t0 * SR), min(int(t1 * SR), len(buf)); buf[a:b] *= np.linspace(g0, g1, b - a)[:, None]
def tone(f, d, harm=(1, .5, .25, .12), dec=3.0):
    t = t_(d); ph = 2 * np.pi * f * t
    return sum(a * np.sin((k + 1) * ph) for k, a in enumerate(harm)) * np.exp(-t * dec)

voice, music, sfx = (np.zeros((N, 2)) for _ in range(3))

# ---------------- voice (Krishna lines get a hall reverb, stranger a little warmth)
def rev(x, wet, T):
    ir = rng.standard_normal(int(T * SR)) * np.exp(-np.arange(int(T * SR)) / (T * SR / 5)); ir = lp(ir, 5000)
    y = fftconvolve(x, ir)[: len(x)]; return x + wet * y / (np.abs(y).max() + 1e-9) * np.abs(x).max()
G = {'k': .85, 's': .8, 'g': .92}
for v in TL['voice']:
    x, sr = sf.read(f"trim_{v['id']}.wav"); assert sr == SR
    if v['who'] == 'g': x = np.concatenate([x, np.zeros(int(1.6 * SR))]); x = rev(x, .5, 1.8) + .12 * lp(x if len(x) else x, 400) if False else rev(x, .5, 1.8)
    if v['who'] == 's': x = x + .08 * lp(x, 500)
    put(voice, x, v['t0'], G[v['who']])

# ---------------- dawn ambience 0 -> 23
wind = lp(np.cumsum(rng.standard_normal(N)) * .002, 300); wind = wind / (np.abs(wind).max() + 1e-9) * .05
wb = np.zeros((N, 2)); wb[:, 0] = wind; wb[:, 1] = np.roll(wind, 900)
ramp(wb, 22, 25, 1, .25); ramp(wb, 41, TOTAL, 1, 0); sfx += wb
for tc in [.3, .9, 1.7, 2.6, 3.5, 4.4, 6.2, 7.0, 8.0, 9.0, 12.0, 14.1, 17.6, 19.3, 21.2]:
    tt = tc
    for _ in range(int(rng.integers(2, 5))):
        d = .08; t = t_(d); f = rng.uniform(2600, 4200) + rng.uniform(600, 1400) * (t / d)
        put(sfx, np.sin(2 * np.pi * np.cumsum(f) / SR) * env(len(t), .01, .05), tt, .035 * (1 if tc < 9 else .6), rng.uniform(-.8, .8)); tt += .12
def bell(t0, g=.28):
    d = 5; t = t_(d)
    x = sum(a * np.sin(2 * np.pi * f * t) * np.exp(-t * dc) for f, a, dc in [(392, 1, .9), (792, .6, 1.3), (1176, .35, 1.8), (1600, .25, 2.2), (2090, .12, 3)])
    put(sfx, x * env(len(t), .003, .2), t0, g)
bell(.8, .26); bell(TOTAL - 2.2, .22)
wt = t_(4.9); wn = bp(rng.standard_normal(len(wt)), 1400, 5200) * (0.5 + .5 * (rng.random(len(wt)) > .55)) * .09
put(sfx, wn * env(len(wt), .3, .5), .6, 1)                              # water pouring
for k in range(9):                                                      # soil crumble
    d = rng.uniform(.04, .09); put(sfx, lp(rng.standard_normal(int(d * SR)), 900) * np.exp(-t_(d) * 40) * .6, 8.7 + k * .12, .25)
t = t_(2.2); hum = np.sin(2 * np.pi * 55 * t) * .3 + np.sin(2 * np.pi * 110 * t) * .15; put(sfx, hum * env(len(t), .6, .8), 10.35, .5)
for k, f in enumerate([1318, 1568, 1976, 2349]): put(sfx, tone(f, 1.2, (1, .3), 4), 10.9 + k * .3, .03, rng.uniform(-.6, .6))
rs = bp(rng.standard_normal(int(.5 * SR)), 2500, 7000) * .05; put(sfx, rs * env(len(rs), .08, .3), 12.95, 1)

# ---------------- music: tanpura, bansuri, choir pad
for i, tt in enumerate(np.arange(10.4, TOTAL - 1.0, 1.5)):
    f = [98.0, 130.8, 130.8, 65.4][i % 4]
    put(music, tone(f, 3.4, (1, .55, .35, .25, .15), 1.4), tt, .16, .2 * (-1) ** i)
    put(music, tone(f * 2.003, 2.8, (1, .4, .2), 1.8), tt + .02, .06, -.2 * (-1) ** i)
ramp(music, 10.4, 12, 0, 1)
def flute(f, d, vol=1.0):
    t = t_(d); vib = 1 + .006 * np.sin(2 * np.pi * 5.2 * t) * np.minimum(1, t * 2)
    x = np.sin(2 * np.pi * np.cumsum(f * vib) / SR) + .22 * np.sin(2 * np.pi * np.cumsum(2 * f * vib) / SR) + bp(rng.standard_normal(len(t)), 1800, 5000) * .05
    return x * env(len(t), .12, .25) * vol
SA, RE, GA, PA, DHA = 523.25, 587.33, 659.25, 783.99, 880.0
for tt, notes in [(17.0, [(GA, .9), (RE, .5), (SA, 1.4)]), (20.4, [(PA, .8), (GA, .6), (RE, .6), (SA, 1.4)]),
                  (24.0, [(SA * 2, 1.6), (DHA, .8), (PA, .8), (GA, 1.4)]), (28.6, [(PA, .9), (GA, .6), (RE, .6), (SA, 1.6)]),
                  (41.4, [(GA, .8), (PA, .8), (SA * 2, 2.4)])]:
    t0 = tt
    for f, d in notes: put(music, flute(f, d, .5), t0, .3, .15); t0 += d * .95
def pad(chord, d, vol):
    t = t_(d); x = 0
    for f in chord:
        for det in (-.004, 0, .004):
            ph = 2 * np.pi * np.cumsum(np.full(len(t), f * (1 + det)) * (1 + .003 * np.sin(2 * np.pi * 4.6 * t + det * 900))) / SR
            x = x + (np.sin(ph) + .5 * np.sin(2 * ph) + .3 * np.sin(3 * ph) + .15 * np.sin(5 * ph))
    x = bp(x, 200, 3500, 2); return x / (np.abs(x).max() + 1e-9) * vol
put(music, pad([130.8, 196, 261.6, 329.6, 392, 587.3], 10.4, 1) * env(int(10.4 * SR), 1.0, 1.5), 22.7, .42)
put(music, pad([110, 164.8, 220, 261.6, 329.6, 440], 6.8, 1) * env(int(6.8 * SR), 1.2, 1.5), 32.6, .22)
put(music, pad([130.8, 196, 261.6, 329.6, 392, 523.3], 6.5, 1) * env(int(6.5 * SR), 1.2, 3.5), 40.0, .3)
# hero hit
rt = t_(1.5); put(sfx, hp(rng.standard_normal(len(rt)), 800) * (rt / 1.5) ** 2 * .12, 21.5)
st = t_(1.6); put(sfx, np.sin(2 * np.pi * np.cumsum(70 - 30 * st / 1.6) / SR) * np.exp(-st * 1.3) * .6, 23.0)
bell(23.0, .34)
for k, f in enumerate([2093, 2637, 3136, 3951, 3136, 2637]): put(sfx, tone(f, 1.6, (1, .3), 3.2), 23.1 + k * .17, .045, rng.uniform(-.8, .8))
for k, f in enumerate([1046.5, 1318.5, 1568, 2093]): put(sfx, tone(f, 2.2, (1, .4, .15), 2.2), 41.55 + k * .14, .1, rng.uniform(-.4, .4))  # sprout chime
for tt in [36.2, 37.4]: put(sfx, bp(rng.standard_normal(int(.5 * SR)), 500, 3000) * np.hanning(int(.5 * SR)) * .03, tt, 1)

# ---------------- music out for the witness beats, ducking under voice, final fade
ramp(music, 7.0, 7.4, 1, .05); ramp(music, 7.4, 10.4, .05, .05)
ramp(music, TOTAL - 3.0, TOTAL, 1, 0)
vo = np.abs(voice).max(axis=1); ve = lp(vo, 6, 1); ve = np.clip(ve / (ve.max() + 1e-9) * 3, 0, 1)
music *= (1 - .5 * ve)[:, None]; sfx *= (1 - .3 * ve)[:, None]
mix = voice + .9 * music + sfx
mix = lp(mix, 15000, 1); mix *= .9 / np.abs(mix).max()
mix = np.tanh(mix * 2.2) / np.tanh(2.2) * .95          # gentle soft limiter: about +5 dB average loudness for phones
mix = mix[: int(TOTAL * SR)]
# loudness master (templates/_shared/audio_master.py): -14 LUFS integrated, true peak <= -1.5 dBTP
import os as _os, sys as _sys; _sys.path.insert(0, _os.path.dirname(_os.path.abspath(__file__))); from audio_master import master as _master
mix, _rep = _master(mix if mix.ndim == 2 else mix[:, None].repeat(2, axis=1), SR); print('master', _rep)
sf.write('../public/audio/mix.wav', mix.astype('float32'), SR)
rms = lambda x: 20 * np.log10(np.sqrt((x ** 2).mean()) + 1e-9)
print('dur', len(mix) / SR, 'peak', np.abs(mix).max().round(2), 'rms dB', round(rms(mix), 1))
for a, b in [(0, 7), (10, 12), (17, 22), (23, 33), (33, 39), (40, 45), (45, 47)]:
    print(f'{a}-{b}s rms {rms(mix[int(a*SR):int(b*SR)]):.1f} dB')
