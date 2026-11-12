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
D, Eb, A, F = 73.42, 77.78, 110.0, 87.31
drone(0, 11.0, [D / 2, D, Eb * 2], .55, .2, .3, 400, .3)
drone(10.97, 14.7, [D, A], .35, .3, .5, 800)
drone(14.64, 26.9, [D / 2, D, Eb], .5, .3, 1, 300)
drone(26.87, 31.9, [F, A, D * 2], .3, 1, 1, 900)
drone(31.84, 68.1, [D / 2, F, A], .42, 1, 1, 300, .15)
drone(68.09, 94.1, [D / 2, Eb, A], .45, 1, 1, 350)
drone(94.05, 121.5, [D / 2, D, Eb, Eb * 4], .55, 1, 1, 500, .3)
drone(121.43, 139.8, [D / 2, F, Eb * 2], .45, 1, 1, 300)
drone(139.72, 158.8, [D / 2, D, Eb, D * 4], .6, 1, .3, 500, .35)
drone(158.80, DUR + 1.4, [D / 2, D, Eb], .55, .05, 2.5, 600)
for a, b in [(14.64, 20.5), (31.84, 39.6), (68.09, 69.8), (94.05, 104.4), (121.43, 126.8), (139.72, 148.5)]: buzz(a, b, .05)
def W_(t, g=.4, d=.42): add(fx, t - d * .55, whoosh(d), g)
for t0 in (7.67, 20.53, 26.87, 31.84, 59.86, 68.09, 77.65, 83.97, 89.72, 94.05, 104.45, 114.61, 121.43, 126.89, 139.72, 148.51): W_(t0)
for t0 in (3.47, 39.67, 69.81): W_(t0, .45, .5)
add(fx, 0, impact(2.5), .5); add(fx, 0.05, static(.4), .3); add(fx, 3.47, stinger(), .5)
for k in range(5): add(fx, 7.77 + k * .58, beep(900 - k * 90, .12), .18)
add(fx, 10.97, static(.5), .35); add(fx, 11.6, impact(1.5), .5); add(fx, 13.43, stamp(), .5)
add(fx, 16.9, click(.06), .4); add(fx, 16.95, thump(140, 70, .2, 20), .3)
for k in range(12): add(fx, 18.9 + k * .13, click(.02), .12)
add(fx, 20.53, static(.4), .3); add(fx, 24.3, creak(1.4, 110), .45); add(fx, 24.21, impact(1.6), .35)
for k in range(8): add(fx, 27.0 + k * .55, step(), .2)
add(fx, 29.02, chime(330, .9), .12); add(fx, 33.98, thump(110, 50, .35, 10), .4); add(fx, 35.5, page(), .35); add(fx, 38.18, impact(1.2), .3)
for t0 in (42.27, 43.68, 44.97): add(fx, t0, scribble(.6), .22)
add(fx, 46.1, page(), .45)
for t0 in (48.89, 52.21, 53.73, 56.88, 58.07): add(fx, t0, scribble(.9), .28)
add(fx, 59.86, impact(1.8), .35)
for t0 in (62.26, 62.9, 64.35, 65.84): add(fx, t0, scribble(1.1), .35)
add(fx, 66.43, stinger(), .55)
for k in range(14): add(fx, 68.2 + k * .08, click(.02), .15)
add(fx, 69.81, impact(1.6), .4); add(fx, 70.3, filt(rng.standard_normal(int(5 * SR)), 200, 3000) * np.sin(np.pi * tt(5) / 5) * .6, .2)
for k in range(17): add(fx, 75.34 + k * .075, click(.03), .2)
for k in range(5): add(fx, 77.8 + k * .35, clank(), .12)
for k in range(5): add(fx, 78.2 + k * 1.0, click(.03), .25)
add(fx, 82.07, impact(1.4), .45); add(fx, 85.22, stamp(), .5)
add(fx, 89.9, filt(rng.standard_normal(int(4 * SR)), 100, 800) * np.sin(np.pi * tt(4) / 4), .15)
for k in range(9): add(fx, 98.64 + k * .7, step(), .3); add(fx, 98.64 + k * .7 + .25, step(), .08)
add(fx, 101.35, static(.5), .4); add(fx, 101.4, beep(1200, .15), .2)
for k in range(12): add(fx, 104.6 + k * .75, step(), .15 + k * .015)
add(fx, 113.44, stinger(), .85)
add(fx, 114.8, slide(1.2), .3); add(fx, 118.5, slide(1.2), .3); add(fx, 114.7, beep(700, .15), .15); add(fx, 118.4, beep(700, .15), .15)
for k in range(6): add(fx, 121.5 + k * .45, click(.04), .25)
add(fx, 124.71, static(.4), .3)
for k in range(16): add(fx, 126.9 + k * .7, step(), .14)
add(fx, 132.1, riser(1.3), .3); add(fx, 136.16, impact(2.0), .55); add(fx, 137.3, screech(1.5), .12)
add(fx, 142.2, click(.06), .45); add(fx, 142.25, thump(200, 80, .15, 30), .2)
for k in range(5): add(fx, 143.2 + k, click(.03), .2)
add(fx, 148.51, beep(1200, .2), .25); add(fx, 148.75, beep(1200, .2), .25); add(fx, 151.62, static(.5), .35); add(fx, 151.65, stinger(), .6)
add(fx, 153.97, chime(784, 1.5), .2)
tm = tt(4.5); add(fx, 154.2, norm(filt(rng.standard_normal(len(tm)), 40, 220)) * np.minimum(1, tm / .5) * np.minimum(1, (4.5 - tm) / .3), .32)
for t0 in (156.9, 157.6, 158.3): add(fx, t0, chime(1568, .5), .1)
add(fx, 158.8, impact(3.0), .6)
mus[int(158.2 * SR):int(158.8 * SR)] *= np.linspace(1, 0, int(158.8 * SR) - int(158.2 * SR))
# reverb del bus de efectos
ir_t = tt(1.6); ir = rng.standard_normal(len(ir_t)) * np.exp(-ir_t * 3.2); ir[0] = 6
L = len(fx) + len(ir); fxr = np.fft.irfft(np.fft.rfft(fx, L) * np.fft.rfft(ir / 6, L), L)[:len(fx)]
fx = fx * .75 + fxr * .25
def save(p, x):
    x = x[:int(DUR * SR)] if len(x) > int(DUR * SR) else x
    x = x / (np.max(np.abs(x)) + 1e-9) * .89; st = np.stack([x, x], 1)
    with wave.open(p, 'wb') as w: w.setnchannels(2); w.setsampwidth(2); w.setframerate(SR); w.writeframes((st * 32767).astype('<i2').tobytes())
save(sys.argv[2], mus); save(sys.argv[3], fx)
