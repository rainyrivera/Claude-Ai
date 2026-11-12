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
D, Eb, A, F = 73.42, 77.78, 110.0, 87.31
drone(0, 14.8, [D / 2, D, Eb * 2], .55, 1, .3)
drone(14.73, 19.0, [D, A], .35, .3, .5, 800)
drone(19.0, 43.7, [D / 2, F, A], .4, 1, 1)
drone(43.65, 82.9, [D / 2, D, F * 2], .42, 2, 1)
drone(82.81, 115.4, [D / 2, Eb, A], .5, 1, .5, 300, .3)
drone(115.34, 150.4, [D / 2, D, Eb, Eb * 4], .6, .3, 1, 500, .2)
drone(150.32, 165.9, [D / 2, Eb, Eb * 2.01, D * 4], .6, 1, .3, 400, .4)
drone(166.52, DUR + 1.4, [D / 2, D, Eb], .6, .05, 2.5, 600)
# zumbido fluorescente en la caseta / pasillos
def buzz(t0, t1, g):
    n0, n1 = int(t0 * SR), min(N, int(t1 * SR)); t = np.arange(n1 - n0) / SR
    x = np.sign(np.sin(2 * np.pi * 120 * t)) * .3 + np.sin(2 * np.pi * 240 * t) * .2; x = filt(x, 100, 1500); e = np.minimum(1, t / .3) * np.minimum(1, (t1 - t0 - t) / .3)
    fx[n0:n1] += norm(x) * e * g
for a, b in [(43.65, 51.3), (72.33, 76.2), (76.23, 82.8), (82.81, 96.7), (105.98, 115.3), (134.96, 143.1), (150.32, 166.5)]: buzz(a, b, .05)
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
# ---------- efectos ----------
def W_(t, g=.4, d=.42): add(fx, t - d * .55, whoosh(d), g)
for t0 in (22.32, 25.10, 31.35, 72.33, 76.23, 82.81, 96.71, 105.98, 134.96, 143.19, 150.32, 155.36): W_(t0)
for t0 in (5.24, 51.30, 115.34, 119.48): W_(t0, .45, .5)
add(fx, 0, impact(3), .6); add(fx, .5, page(), .4); add(fx, 6.6, scribble(.8), .3)
add(fx, 10.42, static(.35), .35); add(fx, 13.4, stinger(), .55); add(fx, 14.0, static(.7), .35)
add(fx, 14.73, static(4.1), .06); add(fx, 15.35, impact(1.5), .55); add(fx, 17.35, stamp(), .5)
add(mus, 19, filt(rng.standard_normal(int(12 * SR)), 100, 700) * .0, 0)
for k in range(6): add(fx, 19.1 + k * .55, step(), .25)
add(fx, 23.72, stamp(), .5); add(fx, 27.74, impact(1.6), .4); add(fx, 27.74, stamp(), .45)
for k in range(6): add(fx, 31.4 + k * .07, click(.04), .2)
add(fx, 32.6, click(.05), .3); add(fx, 33.6, thump(150, 60, .3, 12), .35); add(fx, 38.17, click(.05), .2)
for k in range(5): add(fx, 41.4 + k * .5, step(), .18 * (1 - k / 6))
add(fx, 43.7, creak(1.6, 160), .25)
for t0 in (51.3, 55.17, 59.35, 64.44): add(fx, t0 + .05, scribble(.7), .3)
add(fx, 60.6, scribble(.9), .25); add(fx, 69.82, impact(1.5), .35)
for k in range(9): add(fx, 76.5 + k * .7, step(), .22); add(fx, 76.5 + k * .7 + .25, step(), .05)
for t0 in (78.9, 80.1, 81.4): add(fx, t0, click(.08), .3)
add(fx, 85.15, chime(1046, 1.6), .25); add(fx, 85.3, chime(1318, 1.6), .2)
n0 = int(86.63 * SR); tm = tt(6.7); add(fx, 86.63, norm(filt(rng.standard_normal(len(tm)), 40, 220)) * np.minimum(1, tm / .5) * np.minimum(1, (6.7 - tm) / .3), .3)
for t0 in (89.78, 90.98, 92.06, 93.24): add(fx, t0, chime(1568, .6), .12)
add(fx, 93.3, chime(784, 1.8), .2); add(fx, 95.1, heartbeat(), .5)
add(fx, 96.95, slide(1.0), .3); add(fx, 100.6, slide(4.6), .25); add(fx, 102.88, impact(2.0), .35)
for k in range(10): add(fx, 106.0 + k, click(.03), .2)
add(fx, 110.39, impact(1.2), .3)
for k, tt0 in enumerate(np.cumsum([0, .8, .7, .6, .5, .45, .4])): add(fx, 113.6 + tt0, heartbeat(), .4 + k * .04)
add(fx, 115.34, beep(1200, .15), .2); add(fx, 115.6, stinger(), .55); add(fx, 116.3, creak(2.2, 120), .3)
add(fx, 119.48, static(.5), .25); add(fx, 125.13, impact(2.0), .4)
for t0 in (128.74, 130.31, 132.04): add(fx, t0 + .1, click(.05), .3); add(fx, t0 + .2, chime(1760, .4), .06)
add(fx, 133.76, stinger(), .7)
add(fx, 143.2, riser(4.9), .35); add(fx, 148.12, stinger(), .9)
add(fx, 150.4, filt(rng.standard_normal(int(3.5 * SR)), 300, 2500) * np.sin(np.pi * tt(3.5) / 3.5) * .5, .25)
add(fx, 153.96, creak(1.0, 90), .5)
for k in range(2): add(fx, 155.36 + k * 2.4, bell(1.9), .3)
add(fx, 159.85, click(.06), .4); add(fx, 159.9, thump(140, 70, .2, 20), .3)
add(fx, 163.93, impact(1.6), .35); add(fx, 166.52, impact(3.0), .9); add(fx, 167.2, stamp(), .5); add(fx, 168.73, impact(3.0), .5)
mus[int(165.9 * SR):int(166.5 * SR)] *= np.linspace(1, 0, int(166.5 * SR) - int(165.9 * SR))
# reverb del bus de efectos
ir_t = tt(1.6); ir = rng.standard_normal(len(ir_t)) * np.exp(-ir_t * 3.2); ir[0] = 6
L = len(fx) + len(ir); fxr = np.fft.irfft(np.fft.rfft(fx, L) * np.fft.rfft(ir / 6, L), L)[:len(fx)]
fx = fx * .75 + fxr * .25
def save(p, x):
    x = x[:int(DUR * SR)] if len(x) > int(DUR * SR) else x
    x = x / (np.max(np.abs(x)) + 1e-9) * .89; st = np.stack([x, x], 1)
    with wave.open(p, 'wb') as w: w.setnchannels(2); w.setsampwidth(2); w.setframerate(SR); w.writeframes((st * 32767).astype('<i2').tobytes())
save(sys.argv[2], mus); save(sys.argv[3], fx)
