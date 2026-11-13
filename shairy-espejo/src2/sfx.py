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
def srnd(i):
    x = np.sin(i * 127.1 + 311.7) * 43758.5453; return x - np.floor(x)
def prog(t, a, b):
    return min(1.0, max(0.0, (t - a) / (b - a)))
def musicbox(t0, t1, step=.36, g=.05, notes=(523.25, 659.25, 783.99, 659.25, 587.33, 698.46, 880.0, 698.46), detune=0.0):
    t = t0; i = 0
    while t < t1: f = notes[i % len(notes)] * (1 + detune * (srnd(i) - .5) * .06 * prog(t, t0, t1)); add(mus, t, chime(f, 1.2), g); t += step; i += 1
drone(0, 9.95, [A2 / 2, A2, F3 / 2 * 1.06], .5, .3, .3, 400, .3)
drone(9.90, 13.6, [A2, E3], .35, .3, .5, 700)
drone(13.52, 49.1, [A2 / 2, C3, E3], .35, 1, .5, 300)
musicbox(18.3, 35.6, .45, .03, detune=1.0)
drone(49.03, 56.0, [A2, C3, E3], .3, .3, .5, 500)
drone(55.97, 92.5, [C3, E3, A2 * 2], .3, 1, 1, 500)
drone(92.48, 109.2, [A2 / 2, A2, F3 / 2], .45, .5, .5, 350, .2)
musicbox(101.91, 107.0, .5, .045, notes=(392.0, 440.0, 493.88, 523.25, 493.88, 440.0), detune=2.0)
drone(109.16, 137.5, [A2 / 2, A2, F3 / 2 * 1.06, E3 * 2], .55, .5, .4, 500, .35)
drone(137.47, 141.3, [A2, C3, E3], .3, .3, .5, 500)
drone(141.21, DUR + 1.4, [A2 / 2, A2, E3], .55, .05, 2.8, 600)
def W_(t, g=.4, d=.42): add(fx, t - d * .55, whoosh(d), g)
for t0 in (13.52, 18.24, 27.93, 35.66, 55.97, 71.67, 92.48, 109.16, 122.90, 128.08): W_(t0)
for t0 in (49.03, 137.47): W_(t0, .45, .5)
for k in range(10): add(fx, 1.0 + k * .4, thump(90, 50, .2, 20), .3)
add(fx, 7.79, stinger(), .5)
add(fx, 9.95, impact(1.8), .45); add(fx, 12.04, stamp(), .5)
add(fx, 16.8, chime(1318, .5), .08)
for t0 in (18.3, 28.0, 35.7): add(fx, t0, chime(988, .5), .1)
for t0 in (22.4, 22.7): add(fx, t0, click(.06), .45)
add(fx, 23.53, thump(150, 70, .2, 18), .35); add(fx, 24.3, whoosh(.3), .25)
for t0 in (25.4, 25.8, 26.2): add(fx, t0, click(.05), .3)
add(fx, 26.5, impact(1.2), .3)
for k in range(12): add(fx, 31.0 + k * .33, click(.025), .15)
add(fx, 33.17, riser(1.2), .2)
add(fx, 37.04, click(.05), .4); add(fx, 37.1, filt(rng.standard_normal(int(.15 * SR)), 1500, 8000) * np.exp(-tt(.15) * 30), .4)
add(fx, 39.87, impact(1.2), .3); add(fx, 44.5, whoosh(.5), .3)
for t0 in (50.71, 51.84, 52.4): add(fx, t0, click(.05), .3); add(fx, t0 + .02, chime(880, .4), .08)
add(fx, 53.76, chime(1318, .6), .12)
for k in range(10): add(fx, 56.1 + k * .09, click(.02), .12)
add(fx, 63.24, chime(523, 2.0), .07); add(fx, 65.5, creak(1.2, 140), .3); add(fx, 69.59, impact(1.4), .3)
for i, t0 in enumerate((75.18, 79.01, 80.32, 83.6, 84.89, 88.08)): add(fx, t0, page(), .3)
add(fx, 84.95, filt(rng.standard_normal(int(1.0 * SR)), 2500, 9000) * np.exp(-tt(1.0) * 4) * (rng.random(int(SR)) > .6), .3)
add(fx, 92.5, impact(1.5), .35); add(fx, 96.0, stinger(), .4)
add(fx, 98.3, filt(rng.standard_normal(int(3 * SR)), 200, 2000) * np.linspace(.4, 0, int(3 * SR)), .2)
add(fx, 107.0, chime(659, 1.5), .1); add(fx, 108.0, impact(1.2), .35)
add(fx, 113.79, creak(.9, 120), .2); add(fx, 120.32, stinger(), .55)
for k in range(3): add(fx, 123.0 + k * 1.2, beep(425, .6), .12)
add(fx, 126.56, beep(300, .9), .15)
add(fx, 128.2, filt(rng.standard_normal(int(9 * SR)), 1500, 8000) * .3, .06)
add(fx, 130.86, filt(rng.standard_normal(int(3.8 * SR)), 2000, 6000) * (np.sin(2 * np.pi * 3 * tt(3.8)) > 0) * .5, .18)
add(fx, 135.85, stinger(), .7)
add(fx, 139.29, chime(1318, .6), .12)
mus[int(140.6 * SR):int(141.21 * SR)] *= np.linspace(1, 0, int(141.21 * SR) - int(140.6 * SR))
add(fx, 141.21, impact(3.0), .55)
# reverb del bus de efectos
ir_t = tt(1.6); ir = rng.standard_normal(len(ir_t)) * np.exp(-ir_t * 3.2); ir[0] = 6
L = len(fx) + len(ir); fxr = np.fft.irfft(np.fft.rfft(fx, L) * np.fft.rfft(ir / 6, L), L)[:len(fx)]
fx = fx * .75 + fxr * .25
def save(p, x):
    x = x[:int(DUR * SR)] if len(x) > int(DUR * SR) else x
    x = x / (np.max(np.abs(x)) + 1e-9) * .89; st = np.stack([x, x], 1)
    with wave.open(p, 'wb') as w: w.setnchannels(2); w.setsampwidth(2); w.setframerate(SR); w.writeframes((st * 32767).astype('<i2').tobytes())
save(sys.argv[2], mus); save(sys.argv[3], fx)
