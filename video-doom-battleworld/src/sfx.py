# Música y efectos sintetizados (sin samples externos). Uso: python3 sfx.py dur out_music.wav out_sfx.wav
import numpy as np, wave, sys
SR = 44100; DUR = float(sys.argv[1]); N = int(SR * (DUR + 1.5)); rng = np.random.default_rng(7)
mus = np.zeros(N); fx = np.zeros(N)
def add(buf, t, sig, g=1.0):
    i = int(t * SR); j = min(N, i + len(sig))
    if j > i: buf[i:j] += sig[:j - i] * g
def filt(x, lo=0, hi=SR / 2):
    X = np.fft.rfft(x); f = np.fft.rfftfreq(len(x), 1 / SR); m = np.ones_like(f)
    if lo: m *= 1 / (1 + (lo / np.maximum(f, 1)) ** 4)
    if hi < SR / 2: m *= 1 / (1 + (f / hi) ** 4)
    return np.fft.irfft(X * m, len(x))
def tt(d): return np.arange(int(d * SR)) / SR
def norm(x): return x / (np.max(np.abs(x)) + 1e-9)
def mix(a, b):
    n = max(len(a), len(b)); return np.pad(a, (0, n - len(a))) + np.pad(b, (0, n - len(b)))
def env(n, a=.01, r=None):
    t = np.arange(n) / SR; e = np.minimum(1, t / a)
    return e if r is None else e * np.exp(-t / r)
def whoosh(d=.45):
    n = int(d * SR); x = rng.standard_normal(n); lo = filt(x, 200, 1200); hi = filt(x, 1500, 7000); s = np.linspace(0, 1, n)
    return norm((lo * (1 - s) + hi * s * .6) * np.sin(np.pi * s) ** 2)
def thump(f0=120, f1=40, d=.6, dec=6):
    t = tt(d); f = f1 + (f0 - f1) * np.exp(-t * 18); return np.sin(2 * np.pi * np.cumsum(f) / SR) * np.exp(-t * dec) * np.minimum(1, t * 800)
def impact(d=2.2):
    t = tt(d); n = rng.standard_normal(len(t)); b = filt(n, 30, 900) * np.exp(-t * 3.5)
    return norm(thump(150, 32, d, 2.8) * 1.0 + norm(b) * .6)
def riser(d=1.2):
    t = tt(d); n = filt(rng.standard_normal(len(t)), 800, 9000); s = t / d
    sw = np.sin(2 * np.pi * np.cumsum(200 + 900 * s ** 2) / SR)
    return norm(n * s ** 2.5 * .7 + sw * s ** 2 * .4)
def chime(f=880, d=2.0):
    t = tt(d); return sum(np.sin(2 * np.pi * f * k * t) * np.exp(-t * (2 + k)) / k for k in (1, 2.01, 3.03, 4.2)) * np.minimum(1, t * 300)
def click(d=.03): t = tt(d); return filt(rng.standard_normal(len(t)), 1500, 9000) * np.exp(-t * 150)
def stamp(): return norm(mix(thump(180, 60, .35, 14), click(.06) * .8))
def page(): t = tt(.12); return norm(filt(rng.standard_normal(len(t)), 1800, 8000) * np.sin(np.pi * t / .12) ** 2)
def beep(f=880, d=.09): t = tt(d); return np.sign(np.sin(2 * np.pi * f * t)) * .5 * np.minimum(1, (d - t) * 200) * np.minimum(1, t * 400)
def groan(d=1.6, f=85):
    t = tt(d); ph = np.cumsum(f * (1 + .05 * np.sin(2 * np.pi * 5 * t)) * (1 - .25 * t / d)) / SR; saw = 2 * (ph % 1) - 1
    return norm(filt(saw, 300, 900)) * np.sin(np.pi * t / d)
def thunder(d=3.0):
    t = tt(d); n = rng.standard_normal(len(t)); c = filt(n, 40, 500) * np.exp(-t * 1.3); cr = filt(n, 1500, 6000) * np.exp(-t * 9)
    return norm(c + cr * .4)
def heartbeat(): return np.concatenate([thump(90, 45, .25, 14), np.zeros(int(.12 * SR)), thump(80, 40, .35, 11) * .8])
def crackle(d=1.6):
    t = tt(d); x = (rng.random(len(t)) < .004) * rng.standard_normal(len(t)); return norm(filt(x, 1200, 9000)) * np.minimum(1, t / d * 2)
def boing(d=.6): t = tt(d); return np.sin(2 * np.pi * np.cumsum(180 + 520 * t / d + 25 * np.sin(2 * np.pi * 14 * t)) / SR) * np.sin(np.pi * t / d)
def crunch(d=1.6):
    t = tt(d); x = (rng.random(len(t)) < .01 * (t / d)) * rng.standard_normal(len(t)); return norm(filt(x, 300, 5000))
def clank(): t = tt(.35); return norm(mix(sum(np.sin(2 * np.pi * f * t) for f in (310, 470, 1210)) * np.exp(-t * 18), click(.05)))
def rumble(d): t = tt(d); return norm(filt(rng.standard_normal(len(t)), 25, 160)) * (t / d) ** 1.5

# ---------- música ----------
T = np.arange(N) / SR
def drone_seg(t0, t1, freqs, g, att=1.5, rel=1.5, bright=500):
    n0, n1 = int(t0 * SR), min(N, int(t1 * SR)); t = np.arange(n1 - n0) / SR; d = t1 - t0
    x = sum(np.sin(2 * np.pi * f * t + np.sin(2 * np.pi * .3 * t) * .6) + .4 * np.sin(2 * np.pi * f * 2.003 * t) for f in freqs)
    x += filt(rng.standard_normal(len(t)), 40, bright) * 1.5
    e = np.minimum(1, t / att) * np.minimum(1, (d - t) / rel); mus[n0:n1] += norm(x) * e * g
D, A, F, Bb, C = 73.42, 110.0, 87.31, 116.54, 65.41
drone_seg(0, 7.4, [D / 2, D, A], .5, 0.3, .3)
drone_seg(7.28, 12.0, [D, A, D * 2], .35, .2, .6, 900)
drone_seg(11.96, 26.7, [D / 2, D, F], .45, .5, .4)
drone_seg(26.64, 41.9, [C, C * 1.5, D], .4, .4, .4, 380)
drone_seg(41.8, 47.9, [D, A, D * 2, F * 2], .5, .5, .3, 1200)
drone_seg(47.88, 74.7, [Bb / 2, F, D], .42, .6, .6, 600)
drone_seg(74.59, 84.9, [D / 2, F, A], .45, .5, .4, 300)
drone_seg(84.78, 97.6, [D, A, D * 1.5 * 2], .38, .6, .4, 700)
drone_seg(97.48, 100.3, [D / 2, Bb / 2, D], .55, .4, .15, 250)
drone_seg(102.73, DUR + 1.4, [D / 2, D, A, D * 2], .5, .05, 2.4, 900)
def pulses(t0, t1, bpm, g, f0=110):
    step = 60 / bpm; t = t0
    while t < t1: add(mus, t, thump(f0, 38, .5, 7), g); t += step
pulses(11.96, 26.5, 84, .55); pulses(20.52, 26.5, 168, .25, 90)
pulses(41.8, 45.4, 120, .5); pulses(43.6, 45.4, 240, .3)
pulses(47.88, 74.5, 90, .35)
pulses(92.05, 100.1, 96, .45)
for t in np.arange(58.24, 67.1, 60 / 180): add(mus, t, click(.02), .08)
# ---------- efectos ----------
def W_(t, g=.5, d=.42): add(fx, t - d * .55, whoosh(d), g)
add(fx, 0, impact(3.0), .7); add(fx, .2, rumble(4.0), .35); W_(4.35, .5); add(fx, 4.6, chime(1320, 1.4), .12)
add(fx, 6.1, riser(1.18), .45); add(fx, 7.28, impact(2.0), .75); add(fx, 7.28, crackle(.35), .4)
for t in (7.33, 7.68, 8.18): add(fx, t, stamp(), .25)
add(fx, 10.66, stamp(), .55); add(fx, 12.2, rumble(6.5), .55); add(fx, 18.7, impact(3.0), 1.0)
W_(20.52); add(fx, 24.44, impact(1.5), .45)
W_(26.64); [add(fx, 26.7 + k * .45, clank(), .18) for k in range(4)]; add(fx, 29.5, page(), .45); add(fx, 31.37, stamp(), .6)
W_(34.15); add(fx, 34.95, beep(880), .12); add(fx, 35.65, beep(660), .12)
W_(36.86, .45, .5); add(fx, 38.5, crunch(2.0), .35); add(fx, 40.45, impact(1.0), .3)
W_(41.8); add(fx, 42.8, crackle(2.6), .35); add(fx, 44.3, riser(1.18), .5); add(fx, 45.48, impact(2.4), .85); add(fx, 45.5, chime(587, 2.5), .2); add(fx, 45.5, chime(880, 2.5), .14)
W_(47.88, .45, .5); add(fx, 48.1, rumble(3.6), .5); add(fx, 51.7, impact(2.0), .7); add(fx, 51.72, chime(1175, 1.6), .14)
W_(52.97); add(fx, 53.0, page(), .35)
for k in range(6): add(fx, 53.1 + k * .18 * 1, click(.04), .25); add(fx, 54.6 + k * .18, chime(1568, .5), .05)
W_(58.24); add(fx, 58.5, groan(1.8), .3); add(fx, 59.6, groan(1.5, 70), .25); W_(60.95, .4, .5)
for k in range(4): add(fx, 61.7 + k * .22, beep(1200 - k * 120, .07), .1)
W_(63.55, .4, .5); add(fx, 64.35, impact(1.6), .6); add(fx, 65.92, thump(), .5)
W_(67.13); add(fx, 67.5, thunder(), .6)
W_(69.16); add(fx, 69.3, chime(1760, 1.2), .14)
W_(71.13); W_(74.59); add(fx, 76.6, chime(988, 1.5), .12); add(fx, 78.8, chime(1175, 1.5), .1); add(fx, 78.95, chime(1480, 1.5), .08)
W_(81.12, .45, .5); add(fx, 82.97, crunch(.4), .5); add(fx, 82.97, stamp(), .5)
W_(84.78)
for k in range(8): add(fx, 84.98 + k * .275, page(), .25)
for k in range(5): add(fx, 88.48 + k * .15, beep(520 + k * 80, .08), .1)
add(fx, 89.2, whoosh(.5), .3); add(fx, 89.6, heartbeat(), .55); add(fx, 90.7, heartbeat(), .5)
W_(92.05); add(fx, 95.9, boing(), .25); add(fx, 95.9, impact(1.2), .35)
W_(97.48); add(fx, 100.21, impact(1.8), .55)
add(fx, 102.73, impact(3.0), .8); add(fx, 104.29, stamp(), .4)
# reverb del bus de efectos
ir_t = tt(1.6); ir = rng.standard_normal(len(ir_t)) * np.exp(-ir_t * 3.2); ir[0] = 6
L = len(fx) + len(ir); fxr = np.fft.irfft(np.fft.rfft(fx, L) * np.fft.rfft(ir / 6, L), L)[:len(fx)]
fx = fx * .75 + fxr * .25
def save(p, x):
    x = x[:int(DUR * SR)] if len(x) > int(DUR * SR) else x
    x = x / (np.max(np.abs(x)) + 1e-9) * .89; st = np.stack([x, x], 1)
    with wave.open(p, 'wb') as w: w.setnchannels(2); w.setsampwidth(2); w.setframerate(SR); w.writeframes((st * 32767).astype('<i2').tobytes())
save(sys.argv[2], mus); save(sys.argv[3], fx)
