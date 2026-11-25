# Loudness master for every reel template (canonical copy: templates/_shared/audio_master.py; templates keep a copy in scripts/).
# Why: Instagram / YouTube Shorts play everything at about -14 LUFS. A mix normalised by sample peak (our old 0.95 peak)
# lands anywhere from -12 to -18 LUFS and can clip after the platform's AAC encode (inter-sample peaks).
# Rules adopted from cinetic and motionmaxxing (look.py audits LUFS + true peak): integrated -14 LUFS, true peak <= -1.5 dBTP.
# Implementation: ITU-R BS.1770-4 K-weighting + 400 ms gated blocks (abs -70 LUFS, rel -10 LU), true peak on a 4x
# oversampled signal, then a look-ahead peak limiter (5 ms attack, 80 ms release) so loud hits are tamed, not clipped.
# numpy + scipy only.  usage:  from audio_master import master, measure      or   py -I audio_master.py file.wav
import sys
import numpy as np
from scipy.signal import lfilter, resample_poly, bilinear
from scipy.ndimage import minimum_filter1d


def _kweight(sr):
    # pre-filter (high shelf ~+4 dB above 1.5 kHz) + RLB high-pass (~38 Hz), designed for any sample rate (same as pyloudnorm)
    G, Q, fc = 3.99984385397, 0.7071752369554193, 1681.9744509555319
    K = np.tan(np.pi * fc / sr); Vh = 10 ** (G / 20); Vb = Vh ** 0.499666774155
    a0 = 1 + K / Q + K * K
    b1 = [(Vh + Vb * K / Q + K * K) / a0, 2 * (K * K - Vh) / a0, (Vh - Vb * K / Q + K * K) / a0]
    a1 = [1, 2 * (K * K - 1) / a0, (1 - K / Q + K * K) / a0]
    Q2, fc2 = 0.5003270373253953, 38.13547087613982
    K2 = np.tan(np.pi * fc2 / sr); a02 = 1 + K2 / Q2 + K2 * K2
    b2 = [1, -2, 1]; a2 = [1, 2 * (K2 * K2 - 1) / a02, (1 - K2 / Q2 + K2 * K2) / a02]
    return (b1, a1), (b2, a2)


def lufs(x, sr):
    """integrated loudness (LUFS) of mono (n,) or multi-channel (n, ch) audio"""
    x = np.atleast_2d(np.asarray(x, dtype=np.float64).T).T if np.ndim(x) == 1 else np.asarray(x, dtype=np.float64)
    if x.ndim == 1: x = x[:, None]
    (b1, a1), (b2, a2) = _kweight(sr)
    y = lfilter(b2, a2, lfilter(b1, a1, x, axis=0), axis=0)
    blk, hop = int(0.4 * sr), int(0.1 * sr)
    if len(y) < blk: return -70.0
    starts = np.arange(0, len(y) - blk + 1, hop)
    z = np.array([np.mean(y[s:s + blk] ** 2, axis=0).sum() for s in starts])
    L = -0.691 + 10 * np.log10(z + 1e-12)
    g = z[L > -70]
    if not len(g): return -70.0
    rel = -0.691 + 10 * np.log10(g.mean()) - 10
    g2 = z[(L > -70) & (L > rel)]
    return float(-0.691 + 10 * np.log10(g2.mean() + 1e-12))


def true_peak(x, sr):
    """true peak in dBTP (4x oversampled, BS.1770-4 Annex 2)"""
    x = np.asarray(x, dtype=np.float64); x = x if x.ndim == 2 else x[:, None]
    up = resample_poly(x, 4, 1, axis=0)
    return float(20 * np.log10(np.abs(up).max() + 1e-12))


def _limit(x, sr, ceiling_db):
    """look-ahead peak limiter on the 4x-oversampled envelope; returns the gain-reduced signal"""
    thr = 10 ** (ceiling_db / 20)
    mono = np.abs(x).max(axis=1) if x.ndim == 2 else np.abs(x)
    env = np.abs(resample_poly(mono, 4, 1)).reshape(-1)[: len(mono) * 4].reshape(len(mono), 4).max(axis=1) if len(mono) else mono
    need = np.minimum(1.0, thr / np.maximum(env, 1e-12))
    look = max(1, int(0.005 * sr))
    need = minimum_filter1d(need, size=2 * look + 1, mode='nearest')        # gain is already down when the peak arrives
    # smooth: instant attack (already looked ahead), exponential release
    rel = np.exp(-1.0 / (0.08 * sr)); g = np.empty_like(need); cur = 1.0
    for i, v in enumerate(need):
        cur = v if v < cur else v + (cur - v) * rel
        g[i] = cur
    return x * (g[:, None] if x.ndim == 2 else g)


def master(x, sr, target_lufs=-14.0, ceiling_dbtp=-1.5, max_gain_db=20.0):
    """gain to the target loudness, then limit true peaks; returns (audio, report dict)"""
    x = np.asarray(x, dtype=np.float64)
    before, tp0 = lufs(x, sr), true_peak(x, sr)
    gain = min(max_gain_db, target_lufs - before)
    y = x * 10 ** (gain / 20)
    for _ in range(3):                                  # limiter + tiny make-up until both targets hold
        y = _limit(y, sr, ceiling_dbtp - 0.3)
        tp = true_peak(y, sr)
        if tp <= ceiling_dbtp: break
        y *= 10 ** ((ceiling_dbtp - tp - 0.05) / 20)
    after, tp1 = lufs(y, sr), true_peak(y, sr)
    return y.astype(np.float32), {'lufs_in': round(before, 1), 'tp_in': round(tp0, 1), 'gain_db': round(gain, 1), 'lufs': round(after, 1), 'true_peak': round(tp1, 1)}


def measure(path):
    import soundfile as sf
    x, sr = sf.read(path, always_2d=True)
    return {'lufs': round(lufs(x, sr), 1), 'true_peak': round(true_peak(x, sr), 1), 'sr': sr, 'seconds': round(len(x) / sr, 2)}


if __name__ == '__main__':
    for p in sys.argv[1:]: print(p, measure(p))
