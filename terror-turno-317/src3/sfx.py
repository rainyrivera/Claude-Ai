# Música y efectos de terror sintetizados (sin samples externos). Uso: python3 sfx.py dur out_music.wav out_sfx.wav
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

# ---------- música de terror ----------
def drone(t0, t1, freqs, g, att=2, rel=2, bright=300, trem=0):
    n0, n1 = int(t0 * SR), min(N, int(t1 * SR)); t = np.arange(n1 - n0) / SR; d = t1 - t0
    x = sum(np.sin(2 * np.pi * f * t + 0.8 * np.sin(2 * np.pi * .17 * t + f)) for f in freqs) + filt(rng.standard_normal(len(t)), 30, bright) * 1.2
    e = np.minimum(1, t / att) * np.minimum(1, np.maximum(0, d - t) / rel) * (1 - trem * .5 * (1 + np.sin(2 * np.pi * 5 * t)))
    mus[n0:n1] += norm(x) * e * g
# zumbido fluorescente en la caseta / pasillos
def buzz(t0, t1, g):
    n0, n1 = int(t0 * SR), min(N, int(t1 * SR)); t = np.arange(n1 - n0) / SR
    x = np.sign(np.sin(2 * np.pi * 120 * t)) * .3 + np.sin(2 * np.pi * 240 * t) * .2; x = filt(x, 100, 1500); e = np.minimum(1, t / .3) * np.minimum(1, (t1 - t0 - t) / .3)
    fx[n0:n1] += norm(x) * e * g
def static(d):
    t = tt(d); return norm(filt(rng.standard_normal(len(t)), 800, 9000)) * (0.6 + .4 * (rng.random(len(t)) > .5))
def bell(d=1.9):  # timbre de teléfono antiguo
    t = tt(d); car = sum(np.sin(2 * np.pi * f * t) for f in (1050, 1310, 2120)); am = (np.sin(2 * np.pi * 20 * t) > 0) * 1.0
    return norm(car * am) * np.minimum(1, t * 50) * np.minimum(1, (d - t) * 50)
def step(): t = tt(.18); return norm(filt(rng.standard_normal(len(t)), 80, 900) * np.exp(-t * 35))
def creak(d=1.4, f0=180):
    t = tt(d); ph = np.cumsum(f0 * (1 + .3 * np.sin(2 * np.pi * 1.7 * t)) * (1 + .5 * t / d)) / SR; x = ((ph % 1) < .3) * 1.0
    return norm(filt(x, 300, 3000)) * np.sin(np.pi * t / d)
def screech(d=1.6):
    t = tt(d); x = np.sin(2 * np.pi * 1480 * t) + np.sin(2 * np.pi * 1555 * t) + .6 * np.sin(2 * np.pi * 2210 * t * (1 + .02 * np.sin(2 * np.pi * 6 * t)))
    return norm(x) * np.exp(-t * 2.2) * np.minimum(1, t * 40)
def slide(d=1.0): t = tt(d); return norm(filt(rng.standard_normal(len(t)), 150, 1200)) * np.sin(np.pi * t / d) ** .7
def scribble(d=.7):
    t = tt(d); x = filt(rng.standard_normal(len(t)), 1500, 6000) * (.4 + .6 * (np.sin(2 * np.pi * 9 * t) > 0)); return norm(x) * np.sin(np.pi * t / d)
def stinger(): return norm(mix(impact(2.5), screech(1.8) * .5))
D, Eb, A, F, C = 73.42, 77.78, 110.0, 87.31, 65.41
drone(0, 7.9, [D / 2, D, Eb * 2], .55, .2, .3, 400, .3)
drone(7.80, 12.6, [D, A], .35, .3, .5, 800)
drone(12.58, 29.3, [D / 2, F, A], .4, 1, 1, 300)
drone(29.22, 61.7, [D / 2, D, Eb], .5, .5, 1, 400, .25)
drone(61.60, 82.4, [D / 2, Eb, Eb * 2.01], .45, 1, .3, 250)
drone(88.98, 103.4, [D / 2, D, Eb, D * 4], .65, .2, .3, 600, .4)
drone(103.29, 118.0, [D / 2, Eb, A], .55, .3, .5, 400, .3)
drone(118.62, 133.5, [F, A, C * 2, F * 2], .32, 2, 1.5, 1200)
drone(134.14, 145.7, [D / 2, Eb, A], .45, .3, 1, 300)
drone(145.67, 154.6, [D / 2, D, Eb, Eb * 4], .6, 1, .3, 500, .35)
drone(154.65, DUR + 1.4, [D / 2, D, Eb], .55, .05, 2.8, 600)
for a, b in [(3.43, 7.7), (12.58, 17.4), (29.22, 31.6), (31.64, 61.5), (109.21, 117.6), (120.83, 124.3)]: buzz(a, b, .05)
def W_(t, g=.4, d=.42): add(fx, t - d * .55, whoosh(d), g)
for t0 in (3.43, 12.58, 29.22, 31.64, 43.27, 51.80, 61.60, 74.25, 82.36, 88.98, 92.61, 100.41, 103.29, 109.21, 118.62, 129.98, 132.47, 136.82, 145.67): W_(t0)
W_(17.45, .45, .5)
add(fx, 0, impact(2.5), .5); add(fx, .05, static(.4), .3)
for k in range(6): add(fx, .4 + k * .5, step(), .2)
add(fx, 5.36, stinger(), .55); add(fx, 5.6, filt(rng.standard_normal(int(1.4 * SR)), 2000, 9000) * np.linspace(1, 0, int(1.4 * SR)), .2)
add(fx, 7.80, static(.5), .35); add(fx, 8.4, impact(1.5), .5); add(fx, 10.17, stamp(), .5); add(fx, 11.28, impact(1.8), .45)
add(fx, 15.3, page(), .4)
for t0 in (19.52, 23.18, 24.47, 25.82): add(fx, t0, scribble(.7), .28)
add(fx, 27.15, scribble(.6), .3); add(fx, 29.5, click(.05), .3)
for k in range(4): add(fx, 29.9 + k * .4, step(), .25)
add(fx, 32.8, creak(1.0, 140), .25); add(fx, 36.15, riser(3.6), .25); add(fx, 39.84, stinger(), .7)
for k in range(8): add(fx, 41.2 + k * .23, step(), .35)
for k in range(5): add(fx, 44.6 + k * .55, step(), .22); add(fx, 44.6 + k * .55 + .2, step(), .12)
for k in range(8): add(fx, 46.9 + k * .23, step(), .3); add(fx, 46.9 + k * .23 + .08, step(), .2)
add(fx, 50.0, impact(1.2), .25)
add(fx, 52.0, filt(rng.standard_normal(int(9 * SR)), 60, 600) * np.sin(np.pi * tt(9) / 9), .25)
for k in range(3): add(fx, 57.2 + k * .25, clank(), .12)
add(fx, 59.6, beep(900, .1), .15)
add(fx, 62.0, filt(rng.standard_normal(int(2 * SR)), 50, 200) * np.sin(np.pi * tt(2) / 2), .1)
add(fx, 67.5, impact(1.4), .3)
add(fx, 77.7, filt(rng.standard_normal(int(1.0 * SR)), 300, 1200) * (np.sin(2 * np.pi * 5 * tt(1.0)) > 0) * np.sin(np.pi * tt(1.0)), .12)
add(fx, 81.38, impact(1.2), .3)
add(mus, 82.36, np.zeros(10), 0); mus[int(82.36 * SR):int(87.8 * SR)] *= .25
add(fx, 87.81, stinger(), .95); add(fx, 87.82, screech(2.0), .25)
for k in range(18): add(fx, 89.0 + k * .23, step(), .3)
for k in range(30): add(fx, 92.7 + k * .25, step(), .28 + .1 * (k > 10)); 
for k in range(22): add(fx, 95.1 + k * .24 + .12, step(), .18)
for t0 in (94.7, 98.5, 99.61): add(fx, t0, heartbeat(), .5)
add(fx, 101.3, impact(1.5), .7); add(fx, 101.32, click(.08), .5); add(fx, 102.2, clank(), .35); add(fx, 102.8, chime(1568, .6), .12)
for t0 in (104.4, 104.75, 105.1, 106.6, 106.95, 107.3): add(fx, t0, thump(160, 70, .25, 16), .55); add(fx, t0, click(.05), .3)
add(fx, 105.93, stinger(), .5); add(fx, 109.3, beep(1200, .2), .2)
for t0 in (113.1, 113.5): add(fx, t0, thump(160, 70, .25, 16), .45)
for t0 in (114.43, 115.11, 115.92): add(fx, t0, thump(150, 60, .35, 12), .8); add(fx, t0, click(.06), .4)
mus[int(117.3 * SR):int(118.6 * SR)] *= np.linspace(1, 0, int(118.6 * SR) - int(117.3 * SR))
add(fx, 118.7, chime(523, 3.0), .1); add(fx, 118.9, chime(659, 3.0), .08); add(fx, 119.1, chime(784, 3.0), .07)
add(fx, 124.6, click(.05), .3); for_ = None
for k in range(6): add(fx, 124.5 + k * .07, click(.03), .15)
add(fx, 126.8, chime(784, 2.0), .1)
tm = tt(1.5); add(fx, 130.0, norm(filt(rng.standard_normal(len(tm)), 40, 300)) * np.minimum(1, tm / .2), .3)
add(fx, 131.4, creak(.9, 220), .25); add(fx, 134.14, impact(1.2), .35)
add(fx, 135.45, norm(mix(click(.08), filt(rng.standard_normal(int(.5 * SR)), 2000, 9000) * np.exp(-tt(.5) * 9))), .6)
add(fx, 140.47, impact(2.0), .35)
add(fx, 146.2, creak(2.2, 90), .4); add(fx, 148.5, thump(120, 50, .4, 9), .55)
add(fx, 152.25, stinger(), .7)
mus[int(153.9 * SR):int(154.65 * SR)] *= np.linspace(1, 0, int(154.65 * SR) - int(153.9 * SR))
add(fx, 154.65, impact(3.5), .9)
# reverb del bus de efectos
ir_t = tt(1.6); ir = rng.standard_normal(len(ir_t)) * np.exp(-ir_t * 3.2); ir[0] = 6
L = len(fx) + len(ir); fxr = np.fft.irfft(np.fft.rfft(fx, L) * np.fft.rfft(ir / 6, L), L)[:len(fx)]
fx = fx * .75 + fxr * .25
def save(p, x):
    x = x[:int(DUR * SR)] if len(x) > int(DUR * SR) else x
    x = x / (np.max(np.abs(x)) + 1e-9) * .89; st = np.stack([x, x], 1)
    with wave.open(p, 'wb') as w: w.setnchannels(2); w.setsampwidth(2); w.setframerate(SR); w.writeframes((st * 32767).astype('<i2').tobytes())
save(sys.argv[2], mus); save(sys.argv[3], fx)
