# Reel QA: one honest pass over the FINAL mp4 (picture + sound), numbers instead of "looks fine".
# Canonical copy: templates/_shared/reel_qa.py (templates keep a copy in scripts/). Run with the system Python (OpenCV):
#   py -I scripts/reel_qa.py out/final.mp4 [--expect 178.9] [--out out/qa] [--max 180] [--every 3]
# Adapted from motionmaxxing's look.py gates (G0 render exists/moves/length, G2 no empty frames, G3 short end hold,
# human motion band) and cinetic's sound rules (-14 LUFS, true peak <= -1.5 dBTP, picture and hits within a frame).
# Writes <out>/qa.json, <out>/qa.md, <out>/sheet.jpg (contact sheet, one tile per shot + timestamps). Exit 1 on a FAIL.
import argparse, json, os, subprocess, sys, tempfile
import numpy as np, cv2

HERE = os.path.dirname(os.path.abspath(__file__))
sys.path.insert(0, HERE)
FF = r"C:\Projects\bitter-fruit\node_modules\@remotion\compositor-win32-x64-msvc\ffmpeg.exe"

ap = argparse.ArgumentParser()
ap.add_argument('video'); ap.add_argument('--expect', type=float); ap.add_argument('--max', type=float, default=180.0)
ap.add_argument('--out'); ap.add_argument('--every', type=float, default=0, help='sheet: one tile every N s instead of one per shot')
ap.add_argument('--lufs', type=float, default=-14.0); ap.add_argument('--tp', type=float, default=-1.5)
a = ap.parse_args()
out = a.out or os.path.join(os.path.dirname(os.path.abspath(a.video)), 'qa'); os.makedirs(out, exist_ok=True)

# ------------------------------------------------------------------ picture
cap = cv2.VideoCapture(a.video); fps = cap.get(cv2.CAP_PROP_FPS) or 30.0
lum, std, diff, thumbs, prev = [], [], [], {}, None
i = 0
while True:
    ok, f = cap.read()
    if not ok: break
    g = cv2.cvtColor(cv2.resize(f, (270, 480), interpolation=cv2.INTER_AREA), cv2.COLOR_BGR2GRAY).astype(np.float32)
    lum.append(float(g.mean())); std.append(float(g.std()))
    diff.append(float(np.abs(g - prev).mean()) if prev is not None else 0.0); prev = g
    if i % max(1, int(fps / 2)) == 0: thumbs[i] = cv2.resize(f, (216, 384), interpolation=cv2.INTER_AREA)
    i += 1
n = i; dur = n / fps; lum, std, diff = map(np.array, (lum, std, diff))
black = int(((lum < 8) & (std < 4)).sum())
def runs(mask):
    best, cur, ends = 0, 0, []
    for j, m in enumerate(mask):
        cur = cur + 1 if m else 0
        if cur > best: best = cur
    return best
blank_run = runs(std < 4)                                   # G2: empty/flat frames in a row (uniform colour)
still = diff < 0.25                                         # nothing visibly changed since the previous frame
still_run = runs(still[1:])
end_hold = 0
for d in diff[::-1][:-1]:
    if d < 0.25: end_hold += 1
    else: break
# cuts: a spike well above the local level
med = np.array([np.median(diff[max(0, j - 15):j + 15]) for j in range(n)])
cuts = [j for j in range(1, n) if diff[j] > 18 and diff[j] > 4 * (med[j] + 0.5)]
merged = []
for c in cuts:
    if not merged or c - merged[-1] > 3: merged.append(c)
cuts = merged
bounds = [0] + cuts + [n]; shots = np.diff(bounds) / fps
mean_motion = float(diff[1:].mean()) if n > 1 else 0.0
win = max(1, int(round(0.4 * fps))); wins = [diff[k:k + win].mean() for k in range(1, n - win, win)]
alive = float(np.mean([w > 0.3 for w in wins])) if wins else 0.0

# ------------------------------------------------------------------ sound
audio = {}
try:
    tmp = os.path.join(tempfile.gettempdir(), 'reel_qa_audio.wav')
    subprocess.run([FF, '-y', '-v', 'error', '-i', a.video, '-vn', '-ac', '2', '-ar', '48000', tmp], check=True)
    import soundfile as sf
    from audio_master import lufs, true_peak
    x, sr = sf.read(tmp, always_2d=True)
    mono = x.mean(axis=1)
    hop = int(sr / fps); frames_rms = np.array([np.sqrt(np.mean(mono[k:k + hop] ** 2) + 1e-12) for k in range(0, len(mono) - hop, hop)])
    db = 20 * np.log10(frames_rms + 1e-9)
    tail = 0
    for v in db[::-1]:
        if v < -50: tail += 1
        else: break
    # onsets: positive spectral flux peaks (numpy STFT), then: how many cuts have a sound event within +-2 frames?
    nfft, hp = 1024, 512
    win_ = np.hanning(nfft); spec = np.abs(np.array([np.fft.rfft(mono[k:k + nfft] * win_) for k in range(0, len(mono) - nfft, hp)]))
    flux = np.maximum(0, np.diff(np.log1p(spec), axis=0)).sum(axis=1); thr = np.median(flux) + 2.5 * np.std(flux)
    on_t = [(k + 1) * hp / sr for k in range(1, len(flux) - 1) if flux[k] > thr and flux[k] >= flux[k - 1] and flux[k] >= flux[k + 1]]
    hit = sum(1 for c in cuts if any(abs(t - c / fps) <= 2 / fps for t in on_t))
    audio = {'lufs': round(lufs(x, sr), 1), 'true_peak_dbtp': round(true_peak(x, sr), 1), 'silent_tail_s': round(tail / fps, 2),
             'audio_s': round(len(x) / sr, 2), 'onsets': len(on_t), 'cuts_with_sound_hit': f'{hit}/{len(cuts)}'}
except Exception as e:
    audio = {'error': str(e)}

# ------------------------------------------------------------------ gates
G = []
def gate(name, ok, val, rule, hard=True): G.append({'gate': name, 'pass': bool(ok), 'value': val, 'rule': rule, 'hard': hard})
gate('G0 decodes + moves', n > 0 and alive > 0.3, f'{n} frames, {alive:.0%} of 0.4 s windows change', 'render exists and the picture moves')
if a.expect: gate('G0 length', abs(dur - a.expect) <= 0.2, f'{dur:.2f} s (plan {a.expect})', 'length matches the plan +-0.2 s')
gate('platform cap', dur <= a.max, f'{dur:.2f} s', f'<= {a.max:.0f} s (Instagram Reels 3:00)')
gate('black frames', black == 0, black, 'no black frames (a missing asset or a failed scene)')
gate('G2 no empty frame', blank_run <= 3, f'longest blank run {blank_run} f', '<= 3 consecutive uniform frames')
gate('no dead hold', still_run <= int(1.5 * fps), f'longest still run {still_run} f = {still_run / fps:.2f} s', 'nothing frozen > 1.5 s (designed breath 0.6-1.5 s is fine)', hard=False)
gate('G3 end hold', end_hold / fps <= 1.4, f'{end_hold / fps:.2f} s', 'resolved end hold <= 1.4 s', hard=False)
if 'lufs' in audio:
    gate('loudness', abs(audio['lufs'] - a.lufs) <= 1.0, f"{audio['lufs']} LUFS", f'{a.lufs} +-1 LUFS (platform playback level)')
    gate('true peak', audio['true_peak_dbtp'] <= a.tp + 0.5, f"{audio['true_peak_dbtp']} dBTP", f'<= {a.tp} dBTP (no clipping after the AAC encode)')
    gate('audio length', abs(audio['audio_s'] - dur) <= 0.15 and audio['silent_tail_s'] < 1.0, f"{audio['audio_s']} s, silent tail {audio['silent_tail_s']} s", 'sound runs to the end, no silent tail')
else: gate('audio present', False, audio.get('error'), 'audio track decodes')
fail = [g for g in G if g['hard'] and not g['pass']]

rep = {'video': os.path.abspath(a.video), 'fps': fps, 'frames': n, 'seconds': round(dur, 2),
       'motion': {'mean_frame_diff': round(mean_motion, 2), 'alive_windows': round(alive, 3), 'note': 'human-made films: mean luma motion median 6.8 (IQR 4.4-9.8) at full res; question, not a gate - above ~10 does it breathe? below ~3 does it exist?'},
       'cuts': {'count': len(cuts), 'per_min': round(len(cuts) / dur * 60, 1) if dur else 0, 'median_shot_s': round(float(np.median(shots)), 2) if len(shots) else 0,
                'shortest_s': round(float(shots.min()), 2) if len(shots) else 0, 'longest_s': round(float(shots.max()), 2) if len(shots) else 0, 'at_s': [round(c / fps, 2) for c in cuts]},
       'audio': audio, 'gates': G, 'verdict': 'FAIL' if fail else 'PASS'}
json.dump(rep, open(os.path.join(out, 'qa.json'), 'w'), indent=1)

# ------------------------------------------------------------------ contact sheet: one tile per shot (middle frame) or every N s
picks = [int((bounds[k] + bounds[k + 1]) / 2) for k in range(len(bounds) - 1)] if not a.every else list(range(0, n, max(1, int(a.every * fps))))
tiles = []
for p in picks:
    key = min(thumbs, key=lambda q: abs(q - p)); im = thumbs[key].copy()
    cv2.rectangle(im, (0, 0), (216, 26), (20, 20, 20), -1)
    cv2.putText(im, f'{key / fps:6.2f}s', (6, 19), cv2.FONT_HERSHEY_SIMPLEX, 0.6, (255, 255, 255), 1, cv2.LINE_AA); tiles.append(im)
cols = 10; rows = [tiles[r:r + cols] for r in range(0, len(tiles), cols)]
rows = [np.hstack(r + [np.full_like(tiles[0], 255)] * (cols - len(r))) for r in rows]
if rows: cv2.imwrite(os.path.join(out, 'sheet.jpg'), np.vstack(rows), [cv2.IMWRITE_JPEG_QUALITY, 82])

md = [f"# Reel QA: {os.path.basename(a.video)} - {rep['verdict']}", '', f"{n} frames @ {fps:g} fps = {dur:.2f} s; {len(cuts)} cuts ({rep['cuts']['per_min']}/min, median shot {rep['cuts']['median_shot_s']} s); "
      f"mean motion {mean_motion:.2f}; alive windows {alive:.0%}", '', '| gate | result | value | rule |', '|---|---|---|---|']
md += [f"| {g['gate']} | {'PASS' if g['pass'] else ('FAIL' if g['hard'] else 'NOTE')} | {g['value']} | {g['rule']} |" for g in G]
md += ['', f"Audio: {json.dumps(audio)}", '', 'Look at sheet.jpg and describe every tile in one sentence before calling the reel done.']
open(os.path.join(out, 'qa.md'), 'w', encoding='utf-8').write('\n'.join(md) + '\n')
print('\n'.join(md))
sys.exit(1 if fail else 0)
