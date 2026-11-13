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
A2, C3, D3, E3, F3 = 110.0, 130.81, 146.83, 164.81, 174.61
drone(0, 8.2, [A2 / 2, A2, E3], .5, .3, .3, 350, .2)
drone(8.13, 12.7, [A2, E3], .35, .3, .5, 700)
drone(12.61, 41.4, [A2 / 2, C3, E3], .35, 1, 1, 280)
drone(41.37, 65.3, [A2 / 2, A2, F3 / 2 * 1.06], .45, .5, .5, 400, .25)
drone(65.27, 84.6, [A2 / 2, A2, F3 / 2], .4, 1, .5, 350, .1)
drone(84.53, 104.1, [C3, E3, A2 * 2], .3, 1.5, 1, 900)
drone(104.02, 129.2, [A2 / 2, A2, F3 / 2], .45, .5, .5, 350, .2)
drone(129.18, 182.5, [A2 / 2, A2, F3 / 2 * 1.06, E3 * 2], .5, .5, .5, 450, .3)
drone(182.49, 194.8, [A2, C3, E3], .3, .5, .5, 500)
drone(194.74, 215.7, [A2 / 2, C3, E3], .45, 1, .6, 300, .15)
drone(217.39, DUR + 1.4, [A2 / 2, C3, E3, A2 * 2], .35, 2, 3.0, 600)
def piano(t0, t1, step=2.2, g=.06, notes=(220.0, 261.63, 329.63, 293.66)):
    t = t0; i = 0
    while t < t1: add(mus, t, chime(notes[i % len(notes)], 2.4), g); t += step; i += 1
piano(84.6, 104.0, 1.8, .07, (261.63, 329.63, 392.0, 329.63)); piano(217.4, 231.0, 2.2, .06, (220.0, 261.63, 329.63, 293.66))
def rainbed(t0, t1, g=.1):
    d = t1 - t0; tm = tt(d); x = filt(rng.standard_normal(len(tm)), 1500, 8000) * np.minimum(1, tm / .6) * np.minimum(1, (d - tm) / .6); add(fx, t0, x, g)
for a, b in [(8.13, 12.6), (88.68, 104.0), (107.76, 112.2), (182.49, 194.7), (231.13, 237.7)]: rainbed(a, b)
rainbed(19.86, 21.0, .2)
def W_(t, g=.4, d=.42): add(fx, t - d * .55, whoosh(d), g)
for t0 in (12.61, 41.37, 52.29, 65.27, 107.76, 115.96, 144.19, 164.46, 194.74, 217.39): W_(t0)
for t0 in (84.53, 129.18, 182.49): W_(t0, .45, .5)
add(fx, 0, impact(2.5), .45)
for k in range(4): add(fx, k * .4, thump(160, 70, .2, 18), .22)
add(fx, 1.6, click(.08), .35); add(fx, 3.2, creak(1.6, 110), .3)
add(fx, 8.2, impact(1.8), .45); add(fx, 9.82, stamp(), .5); add(fx, 11.25, impact(2.0), .45)
add(fx, 13.5, click(.08), .45); add(fx, 13.6, filt(rng.standard_normal(int(27 * SR)), 2000, 7000) * .15, .12)
for t0, _, _k in [m for m in [(17.95, 0, 0), (19.86, 0, 0), (21.0, 0, 0), (22.31, 0, 0), (23.68, 0, 0), (27.3, 0, 0), (30.18, 0, 0), (33.39, 0, 0), (35.65, 0, 0)]]: add(fx, t0, page(), .25)
add(fx, 21.0, filt(rng.standard_normal(int(1.2 * SR)), 200, 1500) * np.sin(np.pi * tt(1.2) / 1.2), .3)
add(fx, 22.4, thump(120, 60, .25, 14), .3)
add(fx, 40.11, chime(220, 3.0), .1)
mus[int(41.4 * SR):int(50.8 * SR)] *= .4
add(fx, 50.84, stinger(), .7); add(fx, 50.9, filt(rng.standard_normal(int(.8 * SR)), 2500, 7000) * np.sin(np.pi * tt(.8) / .8), .25)
for k in range(10): add(fx, 54.3 + k * .19, filt(rng.standard_normal(int(.12 * SR)), 1500, 6000) * np.linspace(1, 0, int(.12 * SR)), .2)
for k in range(4): add(fx, 59.48 + k * .15, thump(160, 70, .2, 18), .22)
add(fx, 63.79, impact(1.6), .45)
for t0 in (71.73, 74.6, 76.71): add(fx, t0, click(.05), .3)
add(fx, 81.6, riser(1.4), .25); add(fx, 83.0, impact(1.4), .35)
add(fx, 86.95, chime(784, 3.0), .1); add(fx, 87.3, chime(988, 3.0), .08)
add(fx, 104.02, stinger(), .7); add(fx, 105.0, chime(196, 3.0), .1)
for k in range(5): add(fx, 112.4 + k * .45, step(), .22)
add(fx, 114.2, creak(1.2, 130), .35)
for t0 in (116.2, 120.94, 126.64): add(fx, t0, thump(150, 70, .2, 16), .3)
for k in range(3): add(fx, 121.0 + k * .1, chime(2093 - k * 200, .4), .05)
for t0 in (130.52, 132.73, 135.06, 137.46): add(fx, t0, scribble(.35), .35)
add(fx, 140.82, impact(2.0), .55); add(fx, 142.32, stinger(), .55)
add(fx, 144.2, creak(1.4, 100), .4); mus[int(144.2 * SR):int(164.4 * SR)] *= .6
add(fx, 170.35, impact(1.2), .2); add(fx, 173.83, chime(196, 3.0), .09)
for t0 in (177.68, 178.89, 180.07): add(fx, t0, thump(130, 60, .3, 12), .3)
for t0 in (187.97, 190.35): add(fx, t0, click(.05), .3); add(fx, t0 + .02, chime(880, .4), .08)
add(fx, 192.3, chime(1318, .6), .12)
for k in range(10): add(fx, 198.1 + k * .17, beep(700 + (k % 5) * 90, .1), .1)
for k in range(2): add(fx, 199.9 + k * .5, beep(425, .4), .1)
add(fx, 208.6, impact(1.4), .25)
mus[int(214.6 * SR):int(217.4 * SR)] *= np.linspace(1, 0, int(217.4 * SR) - int(214.6 * SR))
add(fx, 215.84, chime(110, 4.0), .25); add(fx, 215.85, chime(220, 4.0), .12)
add(fx, 221.2, page(), .2)
for f, d in [(261.63, 0), (329.63, .25), (392.0, .5), (523.25, .75)]: add(fx, 229.49 + d, chime(f, 4.0), .09)
add(fx, 231.13, impact(3.0), .45)
# reverb del bus de efectos
ir_t = tt(1.6); ir = rng.standard_normal(len(ir_t)) * np.exp(-ir_t * 3.2); ir[0] = 6
L = len(fx) + len(ir); fxr = np.fft.irfft(np.fft.rfft(fx, L) * np.fft.rfft(ir / 6, L), L)[:len(fx)]
fx = fx * .75 + fxr * .25
def save(p, x):
    x = x[:int(DUR * SR)] if len(x) > int(DUR * SR) else x
    x = x / (np.max(np.abs(x)) + 1e-9) * .89; st = np.stack([x, x], 1)
    with wave.open(p, 'wb') as w: w.setnchannels(2); w.setsampwidth(2); w.setframerate(SR); w.writeframes((st * 32767).astype('<i2').tobytes())
save(sys.argv[2], mus); save(sys.argv[3], fx)
