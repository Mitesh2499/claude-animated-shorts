# Builds the whole soundtrack of the phonics song from song.json on ONE beat grid shared with the picture
# (src/timing.ts uses the same formulas): original bouncy kids-pop backing (ukulele strums, bass, kick, clap, shaker,
# glockenspiel melody), the vocal clips tuned toward the melody and placed on their beats, pop + swish SFX on the
# picture transitions. Master: -14 LUFS integrated, true peak <= -1 dBTP, 48 kHz stereo 24-bit.
# Run from the project root:  py -3.10 audio/song.py      -> audio/mix.wav, audio/cues.json
import json, os, subprocess, sys
import numpy as np
from scipy import signal

HERE = os.path.dirname(os.path.abspath(__file__))
ROOT = os.path.dirname(HERE)
sys.path.insert(0, HERE)
from dsp import SR, TAU, ns, tt, rng, lp, hp, bp, fades, place, widen, dbg, write_wav, integrated, true_peak, make_ir, convolve_st
from instruments import m2f, pluck, glock, triangle

SONG = json.load(open(os.path.join(ROOT, "song.json"), encoding="utf8"))
ITEMS = SONG["items"]
BEAT = 60.0 / SONG["bpm"]
BAR = 4 * BEAT
INTRO = SONG["introBeats"] * BEAT
PUSH_LEAD, PUSH_S = 0.18, 11 / 30
bar_start = lambda i: INTRO + i * BAR
pop_t = lambda i: bar_start(i) + 2 * BEAT
push_t = lambda i: bar_start(i) - PUSH_LEAD
DUR = INTRO + len(ITEMS) * BAR + SONG["tailBeats"] * BEAT
N = ns(DUR) + ns(1.5)            # render with headroom for ring-outs, cut to DUR at the end

# ---------------------------------------------------------------- harmony + melody (original, 4-bar cycle)
# One line = one bar. Odd lines ask (end high), even lines answer (resolve home). MIDI notes.
CHORDS = [("C", [67, 60, 64, 72], 48), ("F", [69, 60, 65, 69], 53), ("G", [67, 62, 67, 71], 55), ("C", [67, 60, 64, 72], 48)]
#            letter, is,  for, word
MELODY = [(67, 64, 64, 72), (69, 65, 65, 72), (71, 67, 67, 74), (67, 64, 62, 60)]

def r_(seed):
    return rng(seed)

# ---------------------------------------------------------------- small drum kit (own synthesis)
def kick(vel=0.9):
    t = tt(0.35)
    f = 48 + 70 * np.exp(-t / 0.035)
    y = np.sin(TAU * np.cumsum(f) / SR) * np.exp(-t / 0.16)
    y += 0.25 * lp(rng(1).standard_normal(len(t)), 2500) * np.exp(-t / 0.004)
    return fades(y * vel, 0.0003, 0.03)

def clap(vel=0.6, r=None):
    r = r or rng(2)
    t = tt(0.3)
    nz = bp(r.standard_normal(len(t)), 900, 5000, 2)
    e = sum(np.exp(-np.clip(t - d, 0, None) / 0.006) * (t >= d) for d in (0, 0.011, 0.022)) * 0.6 + np.exp(-np.clip(t - 0.03, 0, None) / 0.09) * (t >= 0.03)
    return nz * e * vel * 0.6

def shaker(vel=0.3, r=None):
    r = r or rng(3)
    t = tt(0.09)
    e = np.sin(np.pi * np.clip(t / 0.09, 0, 1)) ** 2
    return hp(r.standard_normal(len(t)), 6000, 2) * e * vel * 0.5

def pop_sfx(vel=0.5):   # bubbly "bloop" for the object pop
    t = tt(0.16)
    f = 320 + 900 * (1 - np.exp(-t / 0.035))
    return fades(np.sin(TAU * np.cumsum(f) / SR) * np.exp(-t / 0.05) * vel, 0.001, 0.02)

def swish_sfx(dur=0.36, vel=0.35, r=None):   # air swish for the push transition
    r = r or rng(4)
    n = ns(dur)
    t = np.arange(n) / SR
    x = r.standard_normal(n)
    f, t2, Z = signal.stft(x, SR, nperseg=1024)
    centre = 900 * (6 ** (t2 / dur))
    Z *= np.exp(-((np.log(np.maximum(f[:, None], 1) / centre[None, :])) ** 2) / 0.35)
    y = signal.istft(Z, SR, nperseg=1024)[1][:n]
    return y / (np.abs(y).max() + 1e-9) * np.sin(np.pi * np.clip(t / dur, 0, 1)) ** 1.5 * vel

# ---------------------------------------------------------------- ukulele strum + bass
def strum(notes, vel, up=False, r=None, dur=0.55):
    r = r or rng(5)
    order = notes[::-1] if up else notes
    out = np.zeros(ns(dur + 0.1))
    for k, m in enumerate(order):
        x = pluck(m2f(m), vel=vel * (0.85 + 0.15 * r.random()), r=r, dur=dur, bright=0.65, pos=0.2)
        i = ns(k * (0.009 if up else 0.012))
        out[i:i + len(x)] += x[: len(out) - i]
    return out

def bass(m, dur=0.6, vel=0.8):
    return lp(pluck(m2f(m), vel=vel, r=rng(6), dur=dur, bright=0.25, pos=0.3), 900)

# ---------------------------------------------------------------- vocals
def ffmpeg_exe():
    if os.environ.get("FFMPEG"):
        return os.environ["FFMPEG"]
    p = os.path.join(ROOT, "node_modules", "@remotion", "compositor-win32-x64-msvc", "ffmpeg.exe")
    return p if os.path.exists(p) else "ffmpeg"

_lines = {}
def load_line(i):
    """decode line{i}.mp3 once, return (samples, word boundaries)"""
    if i in _lines:
        return _lines[i]
    mp3, wav = (os.path.join(HERE, "vocals", f"line{i}.{e}") for e in ("mp3", "wav"))
    if not os.path.exists(wav) or os.path.getmtime(wav) < os.path.getmtime(mp3):
        subprocess.run([ffmpeg_exe(), "-hide_banner", "-loglevel", "error", "-y", "-i", mp3, "-ac", "1", "-ar", str(SR), wav], check=True)
    import wave
    with wave.open(wav) as w:
        x = np.frombuffer(w.readframes(w.getnframes()), "<i2").astype(np.float64) / 32768
    words = json.load(open(os.path.join(HERE, "vocals", f"line{i}.json")))["words"]
    _lines[i] = (x, words)
    return _lines[i]

def trim(x, keep_head=0.01, keep_tail=0.04):
    env = np.convolve(np.abs(x), np.ones(ns(0.01)) / ns(0.01), "same")
    on = np.nonzero(env > env.max() * 0.05)[0]
    if len(on) == 0:
        return x
    return fades(x[max(0, on[0] - ns(keep_head)): on[-1] + ns(keep_tail)], 0.004, 0.03)

def load_clip(cid):
    """cid = L{i} (letter), F{i} ("is for"), W{i} (word): cut from the whole line at the TTS word boundaries"""
    kind, i = cid[0], int(cid[1:])
    x, wd = load_line(i)
    t_is = wd[-3]["t"]                       # "... is for <word>" : the last three boundaries
    t_word = wd[-1]["t"]
    cut = {"L": (0.0, t_is - 0.03), "F": (t_is - 0.03, t_word - 0.02), "W": (t_word - 0.02, len(x) / SR)}[kind]
    return trim(x[ns(cut[0]): ns(cut[1])])

def f0_median(x):
    """median pitch of the voiced part (autocorrelation per 40 ms frame)"""
    fr, hop, out = ns(0.04), ns(0.01), []
    for i in range(0, len(x) - fr, hop):
        s = x[i:i + fr] * np.hanning(fr)
        if np.sqrt((s ** 2).mean()) < 0.02:
            continue
        ac = np.correlate(s, s, "full")[fr - 1:]
        lo, hi = int(SR / 600), int(SR / 150)
        k = lo + np.argmax(ac[lo:hi])
        if ac[k] > 0.35 * ac[0]:
            out.append(SR / k)
    return float(np.median(out)) if out else None

def tune(x, target_midi, max_st=4.0):
    """tape-style pitch move toward the melody note (shifts pitch and length together; small moves sound natural)"""
    f = f0_median(x)
    if not f:
        return x, 0.0
    cur = 69 + 12 * np.log2(f / 440)
    tgt = target_midi + 12 * round((cur - target_midi) / 12)   # same note in the voice's own octave
    st = float(np.clip(tgt - cur, -max_st, max_st))
    if abs(st) < 0.15:
        return x, st
    ratio = 2 ** (st / 12)
    up, down = int(round(1000 / ratio)), 1000
    return signal.resample_poly(x, up, down), st

# ---------------------------------------------------------------- build
def build():
    music = np.zeros((2, N)); vox = np.zeros((2, N)); sfx = np.zeros((2, N))
    cues = {"bpm": SONG["bpm"], "beat": BEAT, "intro": INTRO, "dur": DUR, "lines": []}
    r = rng(11)
    # intro: rising glock arpeggio in 8ths + soft strum on the pickup
    for k, m in enumerate([72, 76, 79, 84]):
        place(music, widen(glock(m2f(m), 0.5, r, 1.4), r, 9, 0.4), k * BEAT / 2, 0.55)
    place(music, strum(CHORDS[0][1], 0.5, r=r), 0.0, 0.5)
    # bars
    for i in range(len(ITEMS)):
        t0 = bar_start(i)
        name, uke, root = CHORDS[i % 4]
        for pos, up, v in [(0, 0, 0.75), (1, 0, 0.6), (1.5, 1, 0.45), (2.5, 1, 0.45), (3, 0, 0.6), (3.5, 1, 0.45)]:
            place(music, widen(strum(uke, v, bool(up), r), r, 8, 0.5), t0 + pos * BEAT, 0.55)
        for pos, m in [(0, root), (2, root), (3.5, root + 7)]:
            place(music, bass(m - 12 if m >= 48 else m), t0 + pos * BEAT, 0.9)
        for pos in (0, 2):
            place(music, kick(), t0 + pos * BEAT, 0.8)
        for pos in (1, 3):
            place(music, widen(clap(0.6, r), r, 12, 0.6), t0 + pos * BEAT, 0.5)
        for k in range(8):
            place(music, shaker(0.35 if k % 2 else 0.22, r), t0 + k * BEAT / 2, 0.6)
        mel = MELODY[i % 4]
        for pos, m in zip((0, 1, 1.5, 2), mel):
            place(music, widen(glock(m2f(m + 12), 0.45, r, 1.2), r, 9, 0.4), t0 + pos * BEAT, 0.32)
        # vocals on the grid
        line = {"i": i, "letter": ITEMS[i]["letter"], "word": ITEMS[i]["word"], "bar": t0, "pop": pop_t(i)}
        for cid, pos, note in [(f"L{i}", 0, mel[0]), (f"F{i}", 1, mel[1]), (f"W{i}", 2, mel[3])]:
            x, st = tune(load_clip(cid), note)
            slot = (2 if cid[0] == "W" else 1) * BEAT
            if len(x) / SR > slot + 0.25:
                print(f"  warning: {cid} is {len(x)/SR:.2f}s for a {slot:.2f}s slot (lower bpm or raise the TTS rate)")
            place(vox, x, t0 + pos * BEAT - 0.03, 1.0)   # tiny pre-roll: consonant before the beat, vowel on it
            line[cid[0]] = {"t": t0 + pos * BEAT, "len": len(x) / SR, "shift_st": round(st, 2)}
        cues["lines"].append(line)
        # SFX on the picture transitions
        place(sfx, widen(swish_sfx(PUSH_S + 0.05, 0.35, r), r, 10, 0.8), push_t(i), 1.0)
        place(sfx, pop_sfx(0.55), pop_t(i), 1.0)
    # tail: final strum + bright glock ring + triangle
    tend = bar_start(len(ITEMS))
    place(music, widen(strum(CHORDS[0][1], 0.8, r=r, dur=1.6), r, 8, 0.5), tend, 0.6)
    place(music, bass(36, 1.4), tend, 0.9)
    place(music, kick(), tend, 0.8)
    place(music, widen(glock(m2f(84), 0.6, r, 2.0), r, 9, 0.4), tend, 0.5)
    place(music, triangle(0.5, r, 1.6), tend, 0.4)
    return music, vox, sfx, cues

def master(music, vox, sfx):
    # room: a small bright plate on vocals + glock so it sounds produced, not dry TTS
    ir = make_ir(0.9, 7)
    vox = vox + 0.12 * convolve_st(vox, ir)[:, : vox.shape[1]]
    music = music + 0.10 * convolve_st(music, ir)[:, : music.shape[1]]
    v = integrated(vox)
    music *= dbg((v - 7.0) - integrated(music))      # band ~7 LU under the singer (kids songs keep the band up)
    sfx *= dbg((v - 12.0) - integrated(sfx))
    # duck the band 2 dB while the voice sounds
    env = np.convolve(np.abs(vox).max(0), np.ones(ns(0.05)) / ns(0.05), "same")
    duck = 1 - (1 - dbg(-2.0)) * np.clip(env / (env.max() * 0.15), 0, 1)
    duck = np.convolve(duck, np.ones(ns(0.08)) / ns(0.08), "same")
    mixed = vox + music * duck + sfx
    mixed *= dbg(-14.0 - integrated(mixed))
    # simple look-ahead peak limiter to -1 dBTP
    from scipy import ndimage
    ceil = dbg(-1.5)
    up = np.abs(signal.resample_poly(mixed, 4, 1, axis=-1)).max(0)
    pk = up.reshape(-1, 4).max(1)[: mixed.shape[1]] if len(up) % 4 == 0 else up[: 4 * (len(up) // 4)].reshape(-1, 4).max(1)
    pk = np.pad(pk, (0, max(0, mixed.shape[1] - len(pk))), mode="edge")
    g = np.minimum(1, ceil / np.maximum(pk, 1e-9))
    w = ns(0.006)
    g = ndimage.minimum_filter1d(g, 2 * w + 1)                       # look-ahead + hold around every peak
    g = np.convolve(np.pad(g, w, mode="edge"), np.ones(w) / w, "same")[w:-w]   # smooth (stays <= the needed gain)
    g = np.minimum(g, ndimage.minimum_filter1d(np.minimum(1, ceil / np.maximum(pk, 1e-9)), w + 1))
    mixed *= g
    mixed = mixed[:, : ns(DUR)]
    mixed[:, -ns(0.05):] *= np.linspace(1, 0, ns(0.05))
    return mixed, vox, music * duck, sfx

if __name__ == "__main__":
    music, vox, sfx, cues = build()
    mixed, v, m, s = master(music, vox, sfx)
    write_wav(os.path.join(HERE, "mix.wav"), mixed)
    cues["lufs"] = round(integrated(mixed), 2)
    cues["true_peak_dbtp"] = round(true_peak(mixed), 2)
    json.dump(cues, open(os.path.join(HERE, "cues.json"), "w"), indent=1)
    print(f"mix.wav {mixed.shape[1]/SR:.3f}s  {cues['lufs']} LUFS  TP {cues['true_peak_dbtp']} dBTP")
    for l in cues["lines"]:
        print(f"  {l['letter']} bar {l['bar']:.2f}  L{l['L']['shift_st']:+.1f}st  F{l['F']['shift_st']:+.1f}st  W{l['W']['shift_st']:+.1f}st  word {l['W']['len']:.2f}s")
