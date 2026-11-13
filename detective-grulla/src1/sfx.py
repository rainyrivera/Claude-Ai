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
drone(0, 11.95, [A2 / 2, A2, E3], .5, .3, .3, 350, .2)
drone(11.90, 15.7, [A2, E3], .35, .3, .5, 700)
drone(15.62, 61.7, [A2 / 2, C3, E3], .38, 1, 1, 300)
drone(61.58, 111.9, [A2 / 2, A2, F3 / 2], .45, 1, 1, 350, .15)
drone(111.81, 123.3, [A2, C3, E3], .3, .5, .5, 500)
drone(123.19, 172.4, [A2 / 2, C3, E3], .38, 1, 1, 300)
drone(172.28, 203.1, [A2 / 2, A2, F3 / 2], .45, 1, 1, 350, .15)
drone(203.01, 224.9, [A2 / 2, A2, F3 / 2 * 1.06, E3 * 2], .55, .5, .4, 500, .35)
drone(224.95, DUR + 1.4, [A2 / 2, A2, E3], .55, .05, 2.8, 600)
# motivo de piano (arpegio menor lento)
def piano(t0, t1, step=2.2, g=.06, notes=(220.0, 261.63, 329.63, 293.66)):
    t = t0; i = 0
    while t < t1: add(mus, t, chime(notes[i % len(notes)], 2.4), g); t += step; i += 1
piano(15.7, 51.9); piano(123.3, 162.4, 2.0, .05, (220.0, 246.94, 261.63, 196.0)); piano(162.45, 172.2, 1.6, .07, (329.63, 311.13, 293.66, 277.18))
def rainbed(t0, t1, g=.18):
    d = t1 - t0; tm = tt(d); x = filt(rng.standard_normal(len(tm)), 1500, 8000) * np.minimum(1, tm / .6) * np.minimum(1, (d - tm) / .6); add(fx, t0, x, g)
for a, b in [(0, 7.3), (11.9, 15.6), (24.43, 32.9), (39.22, 51.9), (137.65, 172.2), (214.13, 228.4)]: rainbed(a, b, .1)
for a, b in [(15.62, 24.4), (172.28, 184.6)]: buzz(a, b, .03)
def W_(t, g=.4, d=.42): add(fx, t - d * .55, whoosh(d), g)
for t0 in (7.28, 15.62, 24.43, 32.87, 51.97, 61.58, 92.44, 102.69, 123.19, 137.65, 162.45, 172.28, 184.64, 203.01, 214.13): W_(t0)
for t0 in (86.04, 111.81, 220.36): W_(t0, .45, .5)
add(fx, 0, impact(2.5), .45); add(fx, 1.6, page(), .3); add(fx, 8.4, stinger(), .4)
add(fx, 11.95, impact(1.8), .45); add(fx, 13.73, stamp(), .5)
for k in range(14): add(fx, 15.9 + k * .09, click(.02), .14)
add(fx, 22.9, stamp(), .5)
add(fx, 26.2, filt(rng.standard_normal(int(2.5 * SR)), 60, 400) * np.sin(np.pi * tt(2.5) / 2.5), .35)
add(fx, 28.0, filt(rng.standard_normal(int(.6 * SR)), 800, 4000) * np.exp(-tt(.6) * 6), .25)
add(fx, 30.88, stamp(), .5)
for k in range(6): add(fx, 32.9 + k * .42, page(), .2)
add(fx, 37.0, thump(110, 50, .4, 9), .4); add(fx, 37.54, stamp(), .45)
for k in range(14): add(fx, 42.7 + k * .09, click(.02), .12)
for k in range(3): add(fx, 52.1 + k * 1.0, bell(.8), .25)
for k in range(14): add(fx, 55.2 + k * .09, click(.02), .12)
add(fx, 61.8, filt(rng.standard_normal(int(4 * SR)), 300, 2000) * (np.sin(2 * np.pi * 2 * tt(4)) > 0) * .3, .12)
for k in range(14): add(fx, 65.5 + k * .09, click(.02), .12)
for t0 in (69.48, 70.57, 71.59): add(fx, t0, click(.05), .3)
add(fx, 76.21, impact(1.5), .4); add(fx, 76.3, page(), .4); add(fx, 80.1, scribble(.6), .25); add(fx, 84.35, stinger(), .6)
for k in range(10): add(fx, 86.3 + k * .12, click(.02), .15)
add(fx, 89.6, chime(1760, .5), .1)
for k in range(4): add(fx, 92.6 + k * .6, step(), .2)
add(fx, 96.18, thump(120, 60, .3, 12), .4); add(fx, 96.3, page(), .35); add(fx, 100.36, impact(1.4), .4)
add(fx, 106.63, chime(1568, .8), .1); add(fx, 106.9, riser(1.0), .2)
for t0 in (116.35, 117.78, 119.33): add(fx, t0, click(.05), .3); add(fx, t0 + .02, chime(880, .4), .08)
add(fx, 120.96, chime(1318, .6), .12)
for t0 in (127.44, 129.49, 133.35): add(fx, t0, click(.04), .2)
add(fx, 135.04, chime(659, .8), .1)
add(fx, 143.9, filt(rng.standard_normal(int(12 * SR)), 2500, 7000) * (np.sin(2 * np.pi * 1.3 * tt(12)) > .3) * .5, .08)
add(fx, 156.13, impact(1.2), .3); mus[int(156.1 * SR):int(158.8 * SR)] *= .5
for k in range(3): add(fx, 160.7 + k * .35, step(), .15)
for k in range(9): add(fx, 164.1 + k, click(.03), .18)
add(fx, 168.11, chime(523, 2.5), .07); add(fx, 168.5, chime(659, 2.5), .06)
for k in range(7): add(fx, 172.3 + k * .19, click(.03), .2)
for t0 in (173.7, 174.75, 175.9): add(fx, t0, thump(130, 60, .2, 18), .25)
add(fx, 177.3, filt(rng.standard_normal(int(1.5 * SR)), 2000, 9000) * np.linspace(1, 0, int(1.5 * SR)), .12)
for k in range(3): add(fx, 186.95 + k * 1.0, bell(.8), .25)
for k in range(14): add(fx, 190.1 + k * .09, click(.02), .12)
add(fx, 198.84, impact(1.5), .4); add(fx, 198.9, page(), .4); add(fx, 201.41, stinger(), .55)
add(fx, 205.3, page(), .4); add(fx, 206.5, page(), .35)
for k in range(16): add(fx, 210.82 + k * .1, scribble(.08), .12)
add(fx, 212.3, scribble(1.0), .2); add(fx, 213.41, stinger(), .6)
add(fx, 214.2, filt(rng.standard_normal(int(3 * SR)), 300, 2500) * np.sin(np.pi * tt(3) / 3) * .6, .2)
add(fx, 218.52, creak(1.2, 100), .4); add(fx, 218.6, impact(1.4), .4)
add(fx, 223.01, chime(1318, .6), .12)
mus[int(224.3 * SR):int(224.95 * SR)] *= np.linspace(1, 0, int(224.95 * SR) - int(224.3 * SR))
add(fx, 224.95, impact(3.0), .6)
# reverb del bus de efectos
ir_t = tt(1.6); ir = rng.standard_normal(len(ir_t)) * np.exp(-ir_t * 3.2); ir[0] = 6
L = len(fx) + len(ir); fxr = np.fft.irfft(np.fft.rfft(fx, L) * np.fft.rfft(ir / 6, L), L)[:len(fx)]
fx = fx * .75 + fxr * .25
def save(p, x):
    x = x[:int(DUR * SR)] if len(x) > int(DUR * SR) else x
    x = x / (np.max(np.abs(x)) + 1e-9) * .89; st = np.stack([x, x], 1)
    with wave.open(p, 'wb') as w: w.setnchannels(2); w.setsampwidth(2); w.setframerate(SR); w.writeframes((st * 32767).astype('<i2').tobytes())
save(sys.argv[2], mus); save(sys.argv[3], fx)
