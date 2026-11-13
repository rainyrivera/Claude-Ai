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
drone(0, 10.0, [A2 / 2, A2, E3], .5, .3, .3, 350, .2)
drone(9.97, 14.0, [A2, E3], .35, .3, .5, 700)
drone(13.91, 54.4, [A2 / 2, C3, E3], .38, 1, 1, 300)
drone(54.37, 95.2, [A2 / 2, A2, F3 / 2], .45, 1, .5, 350, .15)
drone(95.12, 104.9, [A2 / 2, C3, E3, A2 * 2], .4, .5, .5, 400)
drone(104.82, 117.0, [A2, C3, E3], .3, .5, .5, 500)
drone(116.97, 154.3, [A2 / 2, A2, F3 / 2], .45, 1, .5, 350, .2)
drone(154.29, 187.9, [A2 / 2, C3, E3], .38, 1, 1, 280)
drone(187.89, 227.4, [A2 / 2, A2, F3 / 2 * 1.06, E3 * 2], .55, .5, .4, 500, .35)
drone(227.36, 231.2, [A2, C3, E3], .3, .3, .5, 500)
drone(231.15, DUR + 1.4, [A2 / 2, A2, E3], .55, .05, 2.8, 600)
def piano(t0, t1, step=2.2, g=.06, notes=(220.0, 261.63, 329.63, 293.66)):
    t = t0; i = 0
    while t < t1: add(mus, t, chime(notes[i % len(notes)], 2.4), g); t += step; i += 1
piano(14.0, 28.6); piano(95.2, 104.8, 1.6, .07, (329.63, 311.13, 293.66, 277.18)); piano(154.4, 187.8, 2.0, .05, (220.0, 246.94, 261.63, 196.0))
def rainbed(t0, t1, g=.1):
    d = t1 - t0; tm = tt(d); x = filt(rng.standard_normal(len(tm)), 1500, 8000) * np.minimum(1, tm / .6) * np.minimum(1, (d - tm) / .6); add(fx, t0, x, g)
for a, b in [(9.97, 13.9), (97.68, 104.8), (104.82, 116.9), (154.29, 187.8), (204.2, 213.5), (213.55, 235.8)]: rainbed(a, b)
rainbed(204.2, 213.5, .14)
for a, b in [(84.74, 104.8), (116.97, 154.2), (187.89, 195.8)]: buzz(a, b, .03)
def W_(t, g=.4, d=.42): add(fx, t - d * .55, whoosh(d), g)
for t0 in (13.91, 28.66, 54.37, 59.99, 71.08, 84.74, 95.12, 116.97, 137.94, 154.29, 187.89, 204.2, 208.57): W_(t0)
for t0 in (104.82, 227.36): W_(t0, .45, .5)
add(fx, 0, impact(2.5), .45)
for k in range(3): add(fx, k * .7, thump(160, 70, .2, 18), .25)
add(fx, 5.0, riser(2.0), .2); add(fx, 7.0, impact(1.4), .35)
add(fx, 10.0, impact(1.8), .45); add(fx, 12.04, stamp(), .5)
add(fx, 15.0, creak(1.4, 120), .3); add(fx, 18.1, page(), .4)
for t0 in (20.88, 22.53): add(fx, t0, thump(150, 70, .2, 18), .3)
add(fx, 25.4, stamp(), .5); add(fx, 27.13, stamp(), .5)
add(fx, 28.8, page(), .3); add(fx, 34.73, riser(3.0), .15)
for t0 in (37.97, 42.27): add(fx, t0, scribble(.5), .25); add(fx, t0, impact(1.0), .2)
for t0 in (47.6, 48.4): add(fx, t0, page(), .3)
add(fx, 50.04, stinger(), .45)
add(fx, 57.13, stamp(), .5)
for k in range(4): add(fx, 60.0 + k * .6, step(), .2)
add(fx, 63.4, page(), .3)
add(fx, 71.3, filt(rng.standard_normal(int(3.3 * SR)), 1500, 6000) * (0.6 + .4 * np.sin(2 * np.pi * 7 * tt(3.3))), .16)
for t0 in (75.45, 77.12, 78.37, 79.86, 81.22): add(fx, t0, scribble(.4), .2)
add(fx, 83.37, impact(1.6), .45)
for k in range(10): add(fx, 84.9 + k * .1, click(.02), .15)
add(fx, 86.7, filt(rng.standard_normal(int(1.6 * SR)), 500, 3000) * .2, .15); add(fx, 88.4, beep(1000, .1), .15)
add(fx, 92.75, stinger(), .85)
add(fx, 97.7, filt(rng.standard_normal(int(2 * SR)), 60, 300) * np.sin(np.pi * tt(2) / 2), .2)
for t0 in (111.6, 112.9): add(fx, t0, click(.05), .3); add(fx, t0 + .02, chime(880, .4), .08)
add(fx, 114.98, chime(1318, .6), .12)
for k in range(4): add(fx, 117.1 + k * .45, step(), .22)
add(fx, 119.4, page(), .35); add(fx, 122.46, impact(1.2), .2); add(fx, 125.3, thump(110, 50, .4, 9), .55); add(fx, 125.32, click(.08), .4)
mus[int(125.8 * SR):int(137.9 * SR)] *= .7
add(fx, 130.57, impact(1.0), .2)
add(fx, 141.28, impact(1.4), .3); add(fx, 150.24, impact(1.4), .3); add(fx, 146.64, chime(330, 2.0), .07)
for k in range(4): add(fx, 155.3 + k * .45, step(), .2)
for t0 in (165.03, 165.92, 166.95, 168.09): add(fx, t0, click(.05), .25)
add(fx, 174.21, impact(1.5), .25); mus[int(174.2 * SR):int(180.4 * SR)] *= .55
add(fx, 177.08, chime(196, 3.0), .08)
for k in range(5): add(fx, 185.2 + k * .35, step(), .15)
for k in range(3): add(fx, 191.5 + k * .9, beep(440, .5), .12)
add(fx, 195.85, beep(1200, .2), .2); add(fx, 196.1, beep(1200, .2), .2)
add(fx, 201.68, chime(1568, .3), .15); add(fx, 201.8, chime(2093, .3), .1); add(fx, 203.04, stinger(), .5)
tm = tt(4.3); add(fx, 204.2, norm(filt(rng.standard_normal(len(tm)), 40, 220)) * .6 + norm(np.sin(2 * np.pi * 1.0 * tm)) * 0, .2)
for k in range(5): add(fx, 204.4 + k * 1.05, whoosh(.3), .1)
add(fx, 208.6, creak(1.6, 90), .35)
for k in range(4): add(fx, 213.6 + k * .55, step(), .15)
add(fx, 217.23, impact(1.6), .45)
add(fx, 219.5, impact(1.5), .4); add(fx, 219.6, page(), .4); add(fx, 221.13, stinger(), .65)
for k in range(8): add(fx, 222.9 + k * .5, beep(1800, .05), .06)
for t0 in (227.5,): add(fx, t0, click(.05), .2)
add(fx, 229.38, chime(1318, .6), .12)
mus[int(230.6 * SR):int(231.15 * SR)] *= np.linspace(1, 0, int(231.15 * SR) - int(230.6 * SR))
add(fx, 231.15, impact(3.0), .6)
# reverb del bus de efectos
ir_t = tt(1.6); ir = rng.standard_normal(len(ir_t)) * np.exp(-ir_t * 3.2); ir[0] = 6
L = len(fx) + len(ir); fxr = np.fft.irfft(np.fft.rfft(fx, L) * np.fft.rfft(ir / 6, L), L)[:len(fx)]
fx = fx * .75 + fxr * .25
def save(p, x):
    x = x[:int(DUR * SR)] if len(x) > int(DUR * SR) else x
    x = x / (np.max(np.abs(x)) + 1e-9) * .89; st = np.stack([x, x], 1)
    with wave.open(p, 'wb') as w: w.setnchannels(2); w.setsampwidth(2); w.setframerate(SR); w.writeframes((st * 32767).astype('<i2').tobytes())
save(sys.argv[2], mus); save(sys.argv[3], fx)
