# Reference probe: measure HOW a reference reel moves before we copy its craft (the reanimate method - capture, filmstrip,
# measure, write a motion spec with numbers - applied to the videos the user drops in Raw/).
# Canonical copy: templates/_shared/probe_reference.py.   Run with the system Python (OpenCV):
#   py -I templates/_shared/probe_reference.py Raw/<video>.mp4 [--out Raw/_probe/<name>] [--start 0 --end 30]
# Outputs in --out: probe.json, probe.md (the motion spec), strips/shotNN.jpg (first 0.5 s of every shot, every 2 frames,
# labelled), sheet.jpg (one tile per shot). Use the numbers (shot lengths, cut kinds, move durations, nearest ease,
# hit sync) to write the skill's lessons file - never "it looks about right".
import argparse, json, os, subprocess, sys, tempfile
import numpy as np, cv2

FF = r"C:\Projects\bitter-fruit\node_modules\@remotion\compositor-win32-x64-msvc\ffmpeg.exe"
ap = argparse.ArgumentParser(); ap.add_argument('video'); ap.add_argument('--out'); ap.add_argument('--start', type=float, default=0); ap.add_argument('--end', type=float, default=1e9)
a = ap.parse_args()
name = os.path.splitext(os.path.basename(a.video))[0][:40]
out = a.out or os.path.join(os.path.dirname(os.path.abspath(a.video)), '_probe', name); os.makedirs(os.path.join(out, 'strips'), exist_ok=True)

# the 12 measured eases (templates/_shared/motion.tsx): % done at 10/25/50/75 % of the move's time
EASES = {'cruise': [10, 25, 50, 75], 'glide': [16, 39, 69, 91], 'softInOut': [4, 17, 50, 83], 'softLand': [30, 59, 85, 95], 'gentleIn': [1, 6, 24, 55],
         'snapSettle': [54, 84, 96, 98], 'whip': [23, 52, 83, 97], 'accelExit': [0, 3, 16, 47], 'crashOut': [0, 0, 6, 32], 'popOver': [10, 46, 96, 108],
         'crashIn': [91, 118, 110, 103], 'bounceHard': [13, 62, 138, 139]}
def nearest_ease(curve):
    c = np.array(curve); best = min(EASES, key=lambda k: np.abs(np.array(EASES[k]) - c).mean())
    return best, round(float(np.abs(np.array(EASES[best]) - c).mean()), 1)

cap = cv2.VideoCapture(a.video); fps = cap.get(cv2.CAP_PROP_FPS) or 30.0; W = int(cap.get(3)); H = int(cap.get(4))
cap.set(cv2.CAP_PROP_POS_MSEC, a.start * 1000)
sw = 240; sh = int(round(sw * H / W / 2) * 2)
grays, frames_small, lum, stds, cols = [], [], [], [], []
idx = int(round(a.start * fps))
while True:
    ok, f = cap.read()
    if not ok or idx / fps > a.end: break
    s = cv2.resize(f, (sw, sh), interpolation=cv2.INTER_AREA); g = cv2.cvtColor(s, cv2.COLOR_BGR2GRAY).astype(np.float32)
    grays.append(g); frames_small.append(s); lum.append(float(g.mean())); stds.append(float(g.std())); cols.append(s.reshape(-1, 3).mean(axis=0)); idx += 1
n = len(grays); t0 = a.start
diff = np.array([0.0] + [float(np.abs(grays[i] - grays[i - 1]).mean()) for i in range(1, n)])
med = np.array([np.median(diff[max(0, j - 15):j + 15]) for j in range(n)])
cand = [j for j in range(1, n) if diff[j] > 16 and diff[j] > 4 * (med[j] + 0.5)]
cuts = []
for c in cand:
    if not cuts or c - cuts[-1] > 3: cuts.append(c)
lum = np.array(lum)
stds = np.array(stds)
def hexc(i): b, g, r = cols[i]; return '#%02x%02x%02x' % (int(r), int(g), int(b))
def cut_kind(c):
    flood = [j for j in range(c, min(n, c + 8)) if stds[j] < 10]
    if flood: return f'colour flood {hexc(flood[0])} ({len(flood)} f)'
    w = lum[max(0, c - 3):min(n, c + 4)]
    if w.max() > 235 and w.max() - min(lum[max(0, c - 4)], lum[min(n - 1, c + 4)]) > 60: return 'flash (white)'
    if w.min() < 20 and max(lum[max(0, c - 4)], lum[min(n - 1, c + 4)]) - w.min() > 60: return 'dip to black'
    pre = diff[max(1, c - 6):c]
    if len(pre) and pre.mean() > 6: return 'cut on motion (whip / smear)'
    return 'hard cut'

# camera motion per frame: translation by phase correlation, scale by log-polar phase correlation
def motion(g0, g1):
    win = cv2.createHanningWindow(g0.shape[::-1], cv2.CV_32F)
    (dx, dy), r = cv2.phaseCorrelate(g0, g1, win)
    c = (g0.shape[1] / 2, g0.shape[0] / 2); M = g0.shape[1] / np.log(g0.shape[1] / 2)
    lp0 = cv2.logPolar(g0, c, M, cv2.INTER_LINEAR); lp1 = cv2.logPolar(g1, c, M, cv2.INTER_LINEAR)
    (sx, _), r2 = cv2.phaseCorrelate(lp0, lp1)
    return dx * W / sw, dy * W / sw, float(np.exp(sx / M)), r
bounds = [0] + cuts + [n]
kinds = {c: cut_kind(c) for c in cuts}
keep = [0]
for j in range(1, len(bounds) - 1):
    if bounds[j + 1] - bounds[j] < 0.25 * fps and j + 1 < len(bounds) - 1:   # a transition frame-run, not a shot
        kinds[bounds[j + 1]] = kinds[bounds[j]] + ' -> ' + kinds.get(bounds[j + 1], 'cut'); continue
    keep.append(bounds[j])
bounds = keep + [n]; shots = []
for k in range(len(bounds) - 1):
    b0, b1 = bounds[k], bounds[k + 1]
    tx, ty, zs = [0.0], [0.0], [1.0]
    for i in range(b0 + 1, b1):
        dx, dy, z, r = motion(grays[i - 1], grays[i])
        if r < 0.05: dx = dy = 0; z = 1.0
        tx.append(tx[-1] + dx); ty.append(ty[-1] + dy); zs.append(zs[-1] * z)
    tx, ty, zs = map(np.array, (tx, ty, zs))
    travel = np.hypot(tx - tx[0], ty - ty[0]); zoom = np.log(zs)
    info = {'shot': k, 'start_s': round(t0 + b0 / fps, 2), 'len_s': round((b1 - b0) / fps, 2), 'cut_in': kinds.get(b0, cut_kind(b0)) if k else 'start',
            'pan_px': round(float(travel.max()), 1), 'pan_px_per_frame_peak': round(float(np.abs(np.diff(travel)).max()) if len(travel) > 1 else 0, 1),
            'zoom_total': round(float(np.exp(zoom[-1])), 3), 'motion_mean': round(float(diff[b0 + 1:b1].mean()) if b1 - b0 > 1 else 0, 2)}
    # the dominant move's curve -> nearest measured ease (only if it actually moves)
    prog = travel if travel.max() >= abs(zoom).max() * 400 else np.abs(zoom - zoom[0])
    if prog.max() > (12 if prog is travel else 0.03) and len(prog) > 6:
        p = prog / prog.max(); mv = np.where(p > 0.02)[0]; st = mv[0] if len(mv) else 0
        en = int(np.argmax(p >= 0.98)) if (p >= 0.98).any() else len(p) - 1
        if en - st >= 4:
            seg = p[st:en + 1]; ts = np.linspace(0, 1, len(seg)); curve = [round(float(np.interp(q, ts, seg)) * 100) for q in (0.1, 0.25, 0.5, 0.75)]
            e, err = nearest_ease(curve)
            info.update({'move_frames': int(en - st), 'move_curve_10_25_50_75': curve, 'nearest_ease': e, 'ease_err': err, 'move_kind': 'pan' if prog is travel else 'zoom'})
    shots.append(info)
    # filmstrip: first 0.5 s of the shot, every 2 frames
    picks = list(range(b0, min(b1, b0 + int(0.5 * fps) + 1), 2)) or [b0]
    tiles = []
    for p_ in picks:
        im = frames_small[p_].copy(); cv2.rectangle(im, (0, 0), (sw, 20), (20, 20, 20), -1)
        cv2.putText(im, f'+{p_ - b0}f {t0 + p_ / fps:.2f}s', (4, 14), cv2.FONT_HERSHEY_SIMPLEX, 0.42, (255, 255, 255), 1, cv2.LINE_AA); tiles.append(im)
    cv2.imwrite(os.path.join(out, 'strips', f'shot{k:02d}.jpg'), np.hstack(tiles), [cv2.IMWRITE_JPEG_QUALITY, 80])

# sound: onsets and how they sit against the cuts
audio = {}
try:
    tmp = os.path.join(tempfile.gettempdir(), 'probe_audio.wav')
    subprocess.run([FF, '-y', '-v', 'error', '-ss', str(a.start), '-i', a.video] + (['-t', str(a.end - a.start)] if a.end < 1e8 else []) + ['-vn', '-ac', '1', '-ar', '22050', tmp], check=True)
    import soundfile as sf
    x, sr = sf.read(tmp); nfft, hp = 1024, 256
    win_ = np.hanning(nfft); spec = np.abs(np.array([np.fft.rfft(x[k:k + nfft] * win_) for k in range(0, len(x) - nfft, hp)]))
    flux = np.maximum(0, np.diff(np.log1p(spec), axis=0)).sum(axis=1); thr = np.median(flux) + 2.5 * np.std(flux)
    on = [(k + 1) * hp / sr for k in range(1, len(flux) - 1) if flux[k] > thr and flux[k] >= flux[k - 1] and flux[k] >= flux[k + 1]]
    offs = [min((o - c / fps for o in on), key=abs) for c in cuts] if on else []
    audio = {'onsets': len(on), 'onsets_per_s': round(len(on) / max(1e-6, len(x) / sr), 2),
             'cut_to_nearest_hit_frames': [round(o * fps, 1) for o in offs], 'cuts_with_hit_within_2f': sum(1 for o in offs if abs(o) <= 2 / fps)}
except Exception as e: audio = {'error': str(e)}

L = np.array([s['len_s'] for s in shots])
summary = {'video': os.path.abspath(a.video), 'fps': fps, 'size': [W, H], 'seconds': round(n / fps, 2), 'cuts': len(cuts), 'cuts_per_min': round(len(cuts) / (n / fps) * 60, 1),
           'shot_len_s': {'median': round(float(np.median(L)), 2), 'p25': round(float(np.percentile(L, 25)), 2), 'p75': round(float(np.percentile(L, 75)), 2), 'min': round(float(L.min()), 2), 'max': round(float(L.max()), 2)},
           'cut_kinds': {k: sum(1 for s in shots if s['cut_in'] == k) for k in sorted({s['cut_in'] for s in shots})},
           'eases': {k: sum(1 for s in shots if s.get('nearest_ease') == k) for k in sorted({s.get('nearest_ease') for s in shots if s.get('nearest_ease')})},
           'mean_motion': round(float(diff[1:].mean()), 2), 'audio': audio}
json.dump({'summary': summary, 'shots': shots}, open(os.path.join(out, 'probe.json'), 'w'), indent=1)
tiles = []
for s in shots:
    im = frames_small[min(n - 1, int((s['start_s'] - t0) * fps + s['len_s'] * fps / 2))].copy(); cv2.rectangle(im, (0, 0), (sw, 20), (20, 20, 20), -1)
    cv2.putText(im, f"#{s['shot']} {s['start_s']:.1f}s {s['len_s']:.1f}s", (4, 14), cv2.FONT_HERSHEY_SIMPLEX, 0.42, (255, 255, 255), 1, cv2.LINE_AA); tiles.append(im)
cols = 8; rows = [np.hstack(tiles[r:r + cols] + [np.full_like(tiles[0], 255)] * (cols - len(tiles[r:r + cols]))) for r in range(0, len(tiles), cols)]
cv2.imwrite(os.path.join(out, 'sheet.jpg'), np.vstack(rows), [cv2.IMWRITE_JPEG_QUALITY, 82])
md = [f"# Motion spec: {name}", '', '```json', json.dumps(summary, indent=1), '```', '', '| # | start | len | cut in | pan px (peak px/f) | zoom | move | f | curve 10/25/50/75 | nearest ease |', '|---|---|---|---|---|---|---|---|---|---|']
md += [f"| {s['shot']} | {s['start_s']} | {s['len_s']} | {s['cut_in']} | {s['pan_px']} ({s['pan_px_per_frame_peak']}) | {s['zoom_total']} | {s.get('move_kind', '-')} | {s.get('move_frames', '-')} | {s.get('move_curve_10_25_50_75', '-')} | {s.get('nearest_ease', '-')} ({s.get('ease_err', '-')}) |" for s in shots]
md += ['', 'Next: open sheet.jpg and strips/shotNN.jpg, describe each shot in one sentence, then write the lessons (timings, eases, cut grammar, sound sync) into the skill.']
open(os.path.join(out, 'probe.md'), 'w', encoding='utf-8').write('\n'.join(md) + '\n')
print(json.dumps(summary, indent=1)); print('->', out)
