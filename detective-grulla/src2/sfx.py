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
drone(0, 10.5, [A2 / 2, A2, E3], .5, .3, .3, 350, .2)
drone(10.41, 13.8, [A2, E3], .35, .3, .5, 700)
drone(13.72, 49.3, [A2 / 2, C3, E3], .38, 1, 1, 300)
drone(49.22, 70.4, [A2 / 2, A2, F3 / 2], .45, 1, .5, 350, .15)
drone(70.29, 78.3, [A2, C3, E3], .3, .5, .5, 500)
drone(78.24, 125.8, [A2 / 2, C3, E3], .38, 1, 1, 300)
drone(125.74, 163.5, [A2 / 2, A2, F3 / 2], .42, 1, 1, 350, .15)
drone(163.46, 204.9, [A2 / 2, A2, F3 / 2 * 1.06, E3 * 2], .55, .5, .4, 500, .35)
drone(204.98, 213.8, [A2, C3, E3], .3, .5, .5, 500)
drone(213.77, DUR + 1.4, [A2 / 2, A2, E3], .55, .05, 2.8, 600)
def piano(t0, t1, step=2.2, g=.06, notes=(220.0, 261.63, 329.63, 293.66)):
    t = t0; i = 0
    while t < t1: add(mus, t, chime(notes[i % len(notes)], 2.4), g); t += step; i += 1
piano(13.8, 32.1); piano(96.3, 125.7, 2.0, .05, (220.0, 246.94, 261.63, 196.0)); piano(125.8, 154.1, 2.2, .05)
def rainbed(t0, t1, g=.1):
    d = t1 - t0; tm = tt(d); x = filt(rng.standard_normal(len(tm)), 1500, 8000) * np.minimum(1, tm / .6) * np.minimum(1, (d - tm) / .6); add(fx, t0, x, g)
for a, b in [(10.41, 13.7), (70.29, 83.1), (96.27, 125.7), (190.13, 197.0), (204.98, 216.8)]: rainbed(a, b)
for a, b in [(24.42, 43.4), (49.22, 70.2), (142.71, 163.4)]: buzz(a, b, .03)
def W_(t, g=.4, d=.42): add(fx, t - d * .55, whoosh(d), g)
for t0 in (24.42, 32.12, 49.22, 78.24, 83.19, 96.27, 125.74, 142.71, 154.18, 163.46, 178.92, 190.13): W_(t0)
for t0 in (70.29, 204.98): W_(t0, .45, .5)
add(fx, 0, impact(2.5), .45); add(fx, 1.5, thump(160, 70, .2, 18), .3); add(fx, 6.3, page(), .3); add(fx, 8.16, stinger(), .35)
add(fx, 10.45, impact(1.8), .45); add(fx, 12.15, stamp(), .5)
for t0 in (17.27, 20.25, 22.6): add(fx, t0, click(.05), .3); add(fx, t0 + .02, chime(880, .4), .06)
add(fx, 26.5, impact(1.2), .25)
for k in range(10): add(fx, 32.2 + k * .28, page(), .15)
add(fx, 35.08, thump(160, 70, .25, 14), .45); add(fx, 35.1, click(.08), .35)
for t0 in (38.49, 40.0, 41.37): add(fx, t0, click(.05), .25)
add(fx, 46.55, stinger(), .6)
for k in range(5): add(fx, 50.95 + k * .32, step(), .25)
add(fx, 52.7, creak(.6, 150), .2); add(fx, 53.43, chime(196, 1.5), .06)
for t0 in (58.5, 64.22): add(fx, t0, thump(150, 60, .25, 14), .35)
add(fx, 66.0, impact(1.0), .2)
for t0 in (71.94, 73.53): add(fx, t0, click(.05), .3); add(fx, t0 + .02, chime(880, .4), .08)
add(fx, 76.34, chime(1318, .6), .12)
tm = tt(1.5); add(fx, 78.6, norm(filt(rng.standard_normal(len(tm)), 40, 300)) * np.exp(-tm * 2), .2)
for k in range(6): add(fx, 91.0 + k * .2, click(.04), .2); add(fx, 91.0 + k * .2, chime(1760 - k * 80, .3), .04)
add(fx, 92.88, beep(1200, .12), .15)
add(fx, 100.51, impact(1.2), .2)
for k in range(10): add(fx, 103.6 + k * .09, click(.02), .12)
add(fx, 119.0, clank(), .12); add(fx, 119.3, clank(), .1)
for k in range(4): add(fx, 125.8 + k * .5, step(), .2)
for k in range(10): add(fx, 129.7 + k * .09, click(.02), .12)
add(fx, 137.95, page(), .4); add(fx, 140.99, chime(523, 2.0), .08)
add(fx, 146.45, stamp(), .55)
for k in range(3): add(fx, 150.62 + k * .5, thump(140, 60, .3, 12), .4)
for k in range(3): add(fx, 154.3 + k * .3, beep(900, .08), .12)
add(fx, 161.01, stamp(), .45)
add(fx, 163.5, beep(1200, .2), .2); add(fx, 163.8, beep(1200, .2), .2); add(fx, 165.51, stamp(), .55)
for k in range(10): add(fx, 168.2 + k * .09, click(.02), .12)
add(fx, 176.2, impact(1.5), .4); add(fx, 176.3, page(), .4); add(fx, 177.61, stinger(), .55)
add(fx, 179.0, page(), .4); add(fx, 180.2, page(), .35)
for t0, d in [(183.92, 1.3), (185.87, 1.2), (187.7, 1.6)]: add(fx, t0, scribble(d), .18)
add(fx, 189.4, stinger(), .55)
add(fx, 192.21, chime(659, 2.5), .07)
for t0 in (199.61, 199.9, 200.2): add(fx, t0 + .2, scribble(.3), .3)
add(fx, 201.47, impact(1.8), .45)
for t0 in (207.18, 208.11, 209.66): add(fx, t0, click(.05), .3); add(fx, t0 + .02, chime(880, .4), .08)
add(fx, 212.21, chime(1318, .6), .12)
mus[int(213.2 * SR):int(213.77 * SR)] *= np.linspace(1, 0, int(213.77 * SR) - int(213.2 * SR))
add(fx, 213.77, impact(3.0), .6)
# reverb del bus de efectos
ir_t = tt(1.6); ir = rng.standard_normal(len(ir_t)) * np.exp(-ir_t * 3.2); ir[0] = 6
L = len(fx) + len(ir); fxr = np.fft.irfft(np.fft.rfft(fx, L) * np.fft.rfft(ir / 6, L), L)[:len(fx)]
fx = fx * .75 + fxr * .25
def save(p, x):
    x = x[:int(DUR * SR)] if len(x) > int(DUR * SR) else x
    x = x / (np.max(np.abs(x)) + 1e-9) * .89; st = np.stack([x, x], 1)
    with wave.open(p, 'wb') as w: w.setnchannels(2); w.setsampwidth(2); w.setframerate(SR); w.writeframes((st * 32767).astype('<i2').tobytes())
save(sys.argv[2], mus); save(sys.argv[3], fx)
