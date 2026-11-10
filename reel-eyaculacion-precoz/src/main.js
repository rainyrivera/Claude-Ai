// Reel 9:16 — "¿Por qué tienes eyaculación precoz?" — motion graphics 2D deterministas.
// window.renderAt(t) dibuja el cuadro del segundo t. Estilo: video de referencia (as.pasa1).
const W = 1080, H = 1920, END = 56.0;
const cv = document.getElementById('c'), g = cv.getContext('2d');
const TIM = await (await fetch('timing.json')).json();
const WORDS = TIM.words, PH = TIM.phrases;
await Promise.all(['600 20px M', '800 20px M', '900 20px M', '500 20px J', '700 20px J'].map(f => document.fonts.load(f)));

// ---------- utilidades ----------
const C = { bg0: '#070912', bg1: '#0d1226', amber: '#f6b445', red: '#ff4d61', purple: '#a98bff', blue: '#6cc4ff', green: '#35d39a', text: '#eef1f7', dim: '#8a92a8', card: 'rgba(16,20,36,0.92)' };
const clamp = (x, a = 0, b = 1) => Math.min(b, Math.max(a, x));
const P = (t, a, d) => clamp((t - a) / d);
const eout = x => 1 - Math.pow(1 - x, 3);
const eio = x => x < .5 ? 4 * x * x * x : 1 - Math.pow(-2 * x + 2, 3) / 2;
const eback = x => { const c1 = 1.7, c3 = c1 + 1; return x <= 0 ? 0 : 1 + c3 * Math.pow(x - 1, 3) + c1 * Math.pow(x - 1, 2); };
const lerp = (a, b, x) => a + (b - a) * x;
const norm = s => s.toLowerCase().replace(/[¿?¡!.,:…]/g, '');
const T = (w, n = 1) => { let k = 0; for (const x of WORDS) if (norm(x.w) === norm(w) && ++k === n) return x.s; throw new Error('word ' + w); };
const TE = (w, n = 1) => { let k = 0; for (const x of WORDS) if (norm(x.w) === norm(w) && ++k === n) return x.e; throw new Error('word ' + w); };
let seed = 11; const rnd = () => (seed = (seed * 16807) % 2147483647) / 2147483647;
const hex = (h, a) => { const n = parseInt(h.slice(1), 16); return `rgba(${n >> 16},${(n >> 8) & 255},${n & 255},${a})`; };
const mixHex = (a, b, x) => { const A = parseInt(a.slice(1), 16), B = parseInt(b.slice(1), 16); const f = s => Math.round(lerp((A >> s) & 255, (B >> s) & 255, x)); return `rgb(${f(16)},${f(8)},${f(0)})`; };

function rr(x, y, w, h, r) { g.beginPath(); g.moveTo(x + r, y); g.arcTo(x + w, y, x + w, y + h, r); g.arcTo(x + w, y + h, x, y + h, r); g.arcTo(x, y + h, x, y, r); g.arcTo(x, y, x + w, y, r); g.closePath(); }
function font(w, s, f = 'M') { g.font = `${w} ${s}px ${f}`; }
function txt(s, x, y, { w = 800, size = 40, f = 'M', color = C.text, align = 'center', ls = 0, alpha = 1, base = 'middle' } = {}) {
  g.save(); g.globalAlpha *= alpha; font(w, size, f); g.fillStyle = color; g.textAlign = align; g.textBaseline = base;
  if (ls) { g.letterSpacing = ls + 'px'; } g.fillText(s, x, y); g.restore();
}
function withT(x, y, s, a, fn) { g.save(); g.globalAlpha *= a; g.translate(x, y); g.scale(s, s); fn(); g.restore(); }
// aparición con rebote
const pop = (t, at, d = .35) => eback(P(t, at, d));
const fadeIO = (t, a, b, f = .3) => Math.min(P(t, a, f), 1 - P(t, b - f, f));

// ---------- fondo ----------
const dust = Array.from({ length: 70 }, () => ({ x: rnd() * W, y: rnd() * H, r: .8 + rnd() * 2.2, v: 4 + rnd() * 14, p: rnd() * 6.28 }));
const noise = document.createElement('canvas'); noise.width = noise.height = 256;
{ const n = noise.getContext('2d'), id = n.createImageData(256, 256); for (let i = 0; i < id.data.length; i += 4) { const v = rnd() * 255; id.data[i] = id.data[i + 1] = id.data[i + 2] = v; id.data[i + 3] = 255; } n.putImageData(id, 0, 0); }
// color de brillo por tramo
const GLOW = [[0, C.red], [5.1, C.amber], [14.9, C.blue], [23.4, C.red], [30.95, C.purple], [35.3, C.blue], [41.5, C.green], [48.75, C.red], [50.2, C.green], [51.2, C.amber]];
function glowAt(t) { let c = GLOW[0][1]; for (let i = 0; i < GLOW.length; i++) { if (t >= GLOW[i][0]) { const nx = GLOW[i + 1]; c = nx && t > nx[0] - .6 ? mixHex(GLOW[i][1], nx[1], P(t, nx[0] - .6, .6)) : GLOW[i][1]; } } return c; }
function background(t) {
  const gr = g.createLinearGradient(0, 0, 0, H); gr.addColorStop(0, C.bg0); gr.addColorStop(.5, C.bg1); gr.addColorStop(1, C.bg0);
  g.fillStyle = gr; g.fillRect(0, 0, W, H);
  const gc = glowAt(t), m = gc.startsWith('#') ? hex(gc, .22) : gc.replace('rgb', 'rgba').replace(')', ',.22)');
  const cy = 900 + Math.sin(t * .4) * 40, rg = g.createRadialGradient(540, cy, 0, 540, cy, 760);
  rg.addColorStop(0, m); rg.addColorStop(1, 'rgba(0,0,0,0)'); g.fillStyle = rg; g.fillRect(0, 0, W, H);
  for (const d of dust) { const y = (d.y - t * d.v + H * 10) % H, x = d.x + Math.sin(t * .5 + d.p) * 12; g.fillStyle = `rgba(200,210,255,${.10 + .12 * Math.sin(t + d.p) ** 2})`; g.beginPath(); g.arc(x, y, d.r, 0, 6.29); g.fill(); }
  const vg = g.createRadialGradient(540, 960, 500, 540, 960, 1250); vg.addColorStop(0, 'rgba(0,0,0,0)'); vg.addColorStop(1, 'rgba(0,0,0,.6)'); g.fillStyle = vg; g.fillRect(0, 0, W, H);
}
function grain(t) { g.save(); g.globalAlpha = .045; g.globalCompositeOperation = 'overlay'; const o = Math.floor(t * 30) * 37; for (let y = -(o % 256); y < H; y += 256) for (let x = -((o * 3) % 256); x < W; x += 256) g.drawImage(noise, x, y); g.restore(); }

// ---------- cabecera: etiqueta de sección + titular tipo máquina de escribir ----------
const HEAD = [
  [0, 'LA PREGUNTA', '¿TERMINAS MUY RÁPIDO?'],
  [5.15, 'EL EXPERIMENTO', '500 PAREJAS · 5 PAÍSES'],
  [9.8, 'EL EXPERIMENTO', 'TIEMPO PROMEDIO: ?'],
  [11.1, 'EL EXPERIMENTO', 'TIEMPO PROMEDIO: 5,4 MIN'],
  [14.95, 'QUÉ DICEN LOS MÉDICOS', 'NO ES SOLO EL RELOJ'],
  [23.4, 'POR QUÉ PASA', 'TIENE EXPLICACIÓN'],
  [25.7, 'POR QUÉ PASA', '1 · ANSIEDAD'],
  [30.95, 'POR QUÉ PASA', '2 · ERECCIÓN'],
  [35.3, 'POR QUÉ PASA', '3 · TU CUERPO'],
  [41.5, 'LO BUENO', 'TIENE TRATAMIENTO'],
  [48.75, 'LA VERDAD', 'NO ES FALTA DE HOMBRÍA'],
  [51.2, 'RECUERDA', 'PROMEDIO REAL: 5,4 MIN'],
  [53.8, 'TU TURNO', '¿LO SABÍAS?'],
];
function header(t) {
  let i = 0; while (i + 1 < HEAD.length && t >= HEAD[i + 1][0]) i++;
  const [t0, lab, head] = HEAD[i], prev = i ? HEAD[i - 1][2] : '';
  // borrado rápido del anterior y tecleo del nuevo
  const del = .18, typ = Math.max(.35, head.length * .028);
  let s; if (i === 0) s = head; else if (t - t0 < del && prev) s = prev.slice(0, Math.round(prev.length * (1 - (t - t0) / del))); else s = head.slice(0, Math.round(head.length * clamp((t - t0 - del) / typ)));
  const a = 1;
  // etiqueta
  font(700, 24, 'J'); g.letterSpacing = '3px'; const lw = g.measureText(lab).width; g.letterSpacing = '0px';
  g.save(); g.globalAlpha = a; g.fillStyle = C.amber; g.beginPath(); g.arc(540 - lw / 2 - 18, 210, 6, 0, 6.29); g.fill(); g.restore();
  txt(lab, 540 + 6, 211, { w: 700, size: 24, f: 'J', color: C.dim, ls: 3, alpha: a });
  const cursor = (Math.floor(t * 2.5) % 2 === 0 || s.length < head.length) ? '▍' : ' ';
  txt(s + cursor, 540, 282, { w: 500, size: 46, f: 'J', color: '#d9dde8', ls: 2, alpha: a });
}

// ---------- subtítulos karaoke ----------
const CH = []; {
  for (const ph of PH) {
    const ws = WORDS.filter(w => w.s >= ph.s - .01 && w.e <= ph.e + .01); let cur = [];
    const flush = () => { if (cur.length) CH.push(cur); cur = []; };
    for (const w of ws) { const len = cur.map(x => x.w).join(' ').length + w.w.length; if (cur.length >= 4 || (cur.length && len > 22)) flush(); cur.push(w); }
    flush();
  }
  CH.forEach((c, i) => { c.s = c[0].s - .06; const nx = CH[i + 1]; c.e = Math.min(c[c.length - 1].e + .45, nx ? nx[0].s - .06 : 99); });
  for (let i = 0; i < CH.length - 1; i++) CH[i].e = Math.min(CH[i].e, CH[i + 1].s);
}
function captions(t) {
  const c = CH.find(c => t >= c.s && t < c.e); if (!c) return;
  const k = pop(t, c.s, .22), a = clamp((c.e - t) / .12) * P(t, c.s, .08);
  font(900, 66); const words = c.map(w => w.w.toUpperCase()); const sp = 20;
  // dividir en 2 líneas si es ancho
  const wd = words.map(w => g.measureText(w).width); let lines = [[0, words.length]];
  const tot = wd.reduce((a, b) => a + b, 0) + sp * (words.length - 1);
  if (tot > 860 && words.length > 1) { let best = 1, bd = 1e9; for (let s = 1; s < words.length; s++) { const l1 = wd.slice(0, s).reduce((a, b) => a + b, 0) + sp * (s - 1), l2 = tot - l1 - sp; if (Math.abs(l1 - l2) < bd) { bd = Math.abs(l1 - l2); best = s; } } lines = [[0, best], [best, words.length]]; }
  const lh = 80, y0 = 1400 - (lines.length - 1) * lh / 2;
  const bw = Math.max(...lines.map(([a, b]) => wd.slice(a, b).reduce((x, y) => x + y, 0) + sp * (b - a - 1))) + 70, bh = lines.length * lh + 34;
  withT(540, 1400, lerp(.9, 1, k), a, () => {
    g.fillStyle = 'rgba(8,10,20,0.62)'; rr(-bw / 2, -bh / 2, bw, bh, 22); g.fill();
    lines.forEach(([s, e], li) => {
      const lwid = wd.slice(s, e).reduce((x, y) => x + y, 0) + sp * (e - s - 1); let x = -lwid / 2; const y = y0 - 1400 + li * lh;
      for (let i = s; i < e; i++) {
        const w = c[i], on = t >= w.s && t < w.e + .02, past = t >= w.e;
        font(900, 66); g.textBaseline = 'middle'; g.textAlign = 'left';
        g.fillStyle = on ? C.amber : past ? C.text : 'rgba(238,241,247,0.38)';
        if (on) { g.save(); g.shadowColor = hex(C.amber, .55); g.shadowBlur = 24; g.fillText(words[i], x, y + 3); g.restore(); } else g.fillText(words[i], x, y + 3);
        x += wd[i] + sp;
      }
    });
  });
}

// ---------- etiqueta PENDIENTE (bucle abierto) ----------
function pending(t) {
  const a0 = 3.7, done = T('cinco', 2) + .05, a1 = done + 1.6; if (t < a0 || t > a1) return;
  const a = Math.min(P(t, a0, .3), 1 - P(t, a1 - .3, .3)), ok = t >= done;
  const label = ok ? 'RESUELTO:' : 'PENDIENTE:', body = ok ? 'lo normal son ~5 minutos' : '¿cuánto dura lo normal?';
  font(700, 28, 'J'); const w1 = g.measureText(label + ' ').width; font(500, 28, 'J'); const w2 = g.measureText(body).width; const bw = w1 + w2 + 64;
  const k = ok ? 1 + .08 * Math.sin(P(t, done, .3) * Math.PI) : lerp(.85, 1, eback(P(t, a0, .35)));
  withT(540, 1572, k, a, () => {
    g.fillStyle = 'rgba(10,14,28,.8)'; rr(-bw / 2, -32, bw, 64, 32); g.fill(); g.lineWidth = 3; g.strokeStyle = ok ? C.green : hex(C.blue, .8); g.stroke();
    txt(label, -bw / 2 + 32, 2, { w: 700, size: 28, f: 'J', color: ok ? C.green : C.blue, align: 'left' });
    txt(body, -bw / 2 + 32 + w1, 2, { w: 500, size: 28, f: 'J', color: C.text, align: 'left' });
  });
}

// ---------- piezas gráficas ----------
function stopwatch(x, y, r, { hand = 0, arc = 0, color = C.amber, readout = '', glitch = 0, alpha = 1 } = {}) {
  g.save(); g.globalAlpha *= alpha; g.translate(x + (glitch ? (rnd() - .5) * 18 * glitch : 0), y);
  g.fillStyle = '#e9ecf3'; rr(-r * .16, -r * 1.24, r * .32, r * .16, 6); g.fill(); g.fillRect(-r * .06, -r * 1.12, r * .12, r * .14);
  g.beginPath(); g.arc(0, 0, r, 0, 6.29); g.fillStyle = '#121729'; g.fill(); g.lineWidth = r * .07; g.strokeStyle = '#e9ecf3'; g.stroke();
  for (let i = 0; i < 60; i++) { const a = i / 60 * 6.283, l = i % 5 ? .06 : .13; g.strokeStyle = i % 5 ? 'rgba(233,236,243,.35)' : 'rgba(233,236,243,.8)'; g.lineWidth = i % 5 ? 2 : 4; g.beginPath(); g.moveTo(Math.sin(a) * r * .88, -Math.cos(a) * r * .88); g.lineTo(Math.sin(a) * r * (.88 - l), -Math.cos(a) * r * (.88 - l)); g.stroke(); }
  if (arc > 0) { g.save(); g.shadowColor = color; g.shadowBlur = 30; g.strokeStyle = color; g.lineWidth = r * .09; g.lineCap = 'round'; g.beginPath(); g.arc(0, 0, r * .7, -Math.PI / 2, -Math.PI / 2 + arc * 6.283); g.stroke(); g.restore(); }
  g.save(); g.rotate(hand); g.strokeStyle = color; g.lineWidth = r * .045; g.lineCap = 'round'; g.beginPath(); g.moveTo(0, r * .12); g.lineTo(0, -r * .78); g.stroke(); g.restore();
  g.fillStyle = color; g.beginPath(); g.arc(0, 0, r * .07, 0, 6.29); g.fill();
  if (readout) txt(readout, 0, r * .42, { w: 700, size: r * .26, f: 'J', color: C.text });
  g.restore();
}
function card(x, y, w, h, color, on, fn) { // tarjeta con borde de color (estilo referencia)
  g.save(); g.translate(x, y); g.fillStyle = C.card; rr(-w / 2, -h / 2, w, h, 22); g.fill();
  g.lineWidth = 4; g.strokeStyle = on ? color : 'rgba(255,255,255,.12)'; if (on) { g.shadowColor = hex(color, .6); g.shadowBlur = 26; } g.stroke(); g.shadowBlur = 0; fn && fn(); g.restore();
}
function chip(x, y, s, color, a = 1, k = 1, size = 30) { font(800, size); const w = g.measureText(s).width + 52; withT(x, y, k, a, () => { g.fillStyle = hex(color, .16); rr(-w / 2, -30 * size / 30, w, 60 * size / 30, 30); g.fill(); g.lineWidth = 3; g.strokeStyle = color; g.stroke(); txt(s, 0, 2, { w: 800, size, color }); }); return w; }
function check(x, y, r, color, p) { g.save(); g.translate(x, y); g.beginPath(); g.arc(0, 0, r, 0, 6.29); g.fillStyle = hex(color, .18); g.fill(); g.lineWidth = r * .14; g.strokeStyle = color; g.stroke(); if (p > 0) { g.lineCap = 'round'; g.lineJoin = 'round'; g.beginPath(); const pts = [[-r * .42, 0], [-r * .1, r * .32], [r * .46, -r * .34]]; const L1 = Math.hypot(pts[1][0] - pts[0][0], pts[1][1] - pts[0][1]), L2 = Math.hypot(pts[2][0] - pts[1][0], pts[2][1] - pts[1][1]), d = p * (L1 + L2); g.moveTo(...pts[0]); if (d <= L1) g.lineTo(pts[0][0] + (pts[1][0] - pts[0][0]) * d / L1, pts[0][1] + (pts[1][1] - pts[0][1]) * d / L1); else { g.lineTo(...pts[1]); const q = (d - L1) / L2; g.lineTo(pts[1][0] + (pts[2][0] - pts[1][0]) * q, pts[1][1] + (pts[2][1] - pts[1][1]) * q); } g.stroke(); } g.restore(); }
function strike(x1, x2, y, p, color = C.red, wdt = 10) { if (p <= 0) return; g.save(); g.strokeStyle = color; g.lineWidth = wdt; g.lineCap = 'round'; g.shadowColor = color; g.shadowBlur = 16; g.beginPath(); g.moveTo(x1, y); g.lineTo(lerp(x1, x2, eout(p)), y - 6 * p); g.stroke(); g.restore(); }
function arrow(x1, y1, x2, y2, color, p = 1, wdt = 6) { if (p <= 0) return; const x = lerp(x1, x2, p), y = lerp(y1, y2, p), a = Math.atan2(y2 - y1, x2 - x1); g.save(); g.strokeStyle = g.fillStyle = color; g.lineWidth = wdt; g.lineCap = 'round'; g.beginPath(); g.moveTo(x1, y1); g.lineTo(x, y); g.stroke(); g.translate(x, y); g.rotate(a); g.beginPath(); g.moveTo(6, 0); g.lineTo(-16, -12); g.lineTo(-16, 12); g.closePath(); g.fill(); g.restore(); }
// iconos
function icoBrain(s, color) { g.save(); g.scale(s, s); g.strokeStyle = color; g.lineWidth = 7; g.lineJoin = g.lineCap = 'round'; g.beginPath(); g.moveTo(-10, -70); g.bezierCurveTo(-60, -90, -95, -45, -80, -10); g.bezierCurveTo(-110, 10, -95, 60, -55, 60); g.bezierCurveTo(-40, 85, -10, 80, -5, 60); g.lineTo(-5, -65); g.moveTo(5, -70); g.bezierCurveTo(55, -90, 95, -45, 80, -10); g.bezierCurveTo(110, 10, 95, 60, 55, 60); g.bezierCurveTo(40, 85, 10, 80, 5, 60); g.lineTo(5, -65); g.moveTo(-60, -20); g.quadraticCurveTo(-35, -10, -40, 15); g.moveTo(60, -20); g.quadraticCurveTo(35, -10, 40, 15); g.moveTo(-60, 35); g.quadraticCurveTo(-30, 30, -25, 50); g.moveTo(60, 35); g.quadraticCurveTo(30, 30, 25, 50); g.stroke(); g.restore(); }
function icoClock(s, c) { g.save(); g.scale(s, s); g.strokeStyle = c; g.lineWidth = 6; g.lineCap = 'round'; g.beginPath(); g.arc(0, 0, 26, 0, 6.29); g.moveTo(0, 0); g.lineTo(0, -15); g.moveTo(0, 0); g.lineTo(11, 7); g.stroke(); g.restore(); }
function icoUnlock(s, c) { g.save(); g.scale(s, s); g.strokeStyle = c; g.lineWidth = 6; g.lineCap = 'round'; rr(-22, -4, 44, 32, 6); g.stroke(); g.beginPath(); g.arc(-6, -14, 14, Math.PI, 0); g.lineTo(8, -4); g.stroke(); g.restore(); }
function icoHeart(s, c) { g.save(); g.scale(s, s); g.strokeStyle = c; g.lineWidth = 6; g.lineJoin = 'round'; g.beginPath(); g.moveTo(0, 26); g.bezierCurveTo(-40, -2, -30, -34, 0, -16); g.bezierCurveTo(30, -34, 40, -2, 0, 26); g.stroke(); g.beginPath(); g.moveTo(0, -16); g.lineTo(-6, -2); g.lineTo(5, 6); g.lineTo(-1, 18); g.stroke(); g.restore(); }
function icoPause(s, c) { g.save(); g.scale(s, s); g.fillStyle = c; rr(-16, -22, 11, 44, 4); g.fill(); rr(5, -22, 11, 44, 4); g.fill(); g.restore(); }
function icoDoc(s, c) { g.save(); g.scale(s, s); g.strokeStyle = c; g.lineWidth = 6; g.lineCap = 'round'; g.beginPath(); g.arc(0, -14, 12, 0, 6.29); g.moveTo(-22, 26); g.quadraticCurveTo(0, -4, 22, 26); g.moveTo(14, 6); g.lineTo(14, 18); g.arc(20, 18, 6, Math.PI, 0, true); g.stroke(); g.restore(); }
function icoPelvis(s, c) { g.save(); g.scale(s, s); g.strokeStyle = c; g.lineWidth = 6; g.lineCap = 'round'; g.beginPath(); g.moveTo(-26, -18); g.quadraticCurveTo(0, 30, 26, -18); g.moveTo(-26, -18); g.lineTo(-26, -26); g.moveTo(26, -18); g.lineTo(26, -26); g.stroke(); g.beginPath(); g.setLineDash([4, 7]); g.moveTo(-18, 8); g.lineTo(18, 8); g.stroke(); g.restore(); }

// ---------- escenas ----------
const S = []; const scene = (a, b, fn) => S.push({ a, b, fn });

// 1 · GANCHO: cronómetro que corre, se congela en "Espera…", PRECOZ se tacha en "quizás…"
const tEsp = T('espera'), tQui = T('quizás'), tTie2 = T('tienes', 2);
scene(0, 5.15, (t, A) => {
  const k = lerp(1.06, 1, eout(P(t, 0, .6)));
  // título acento grande
  withT(540, 430, lerp(.92, 1, eback(P(t, 0, .4))), A, () => {
    font(900, 74); const a1 = '¿EYACULACIÓN ', a2 = 'PRECOZ?'; const w1 = g.measureText(a1).width, w2 = g.measureText(a2).width, x0 = -(w1 + w2) / 2;
    txt(a1, x0, 0, { w: 900, size: 74, align: 'left' }); g.save(); g.shadowColor = C.red; g.shadowBlur = 30; txt(a2, x0 + w1, 0, { w: 900, size: 74, color: C.red, align: 'left' }); g.restore();
    if (t > tQui) txt('o solo crees que la tienes', 0, 70, { w: 500, size: 32, f: 'J', color: C.dim, alpha: P(t, tQui, .3) });
  });
  const frozen = t >= tEsp; const tt = (frozen ? tEsp : t) + .7;
  const hand = tt * tt * 2.2 + tt * 5; // acelera
  const secs = Math.floor(tt * 23) % 60; const ro = frozen ? (t < tQui ? '?:??' : '?:??') : `0:${String(secs).padStart(2, '0')}`;
  const gl = frozen ? Math.max(0, 1 - (t - tEsp) / .25) : 0;
  withT(540, 860, k * (frozen ? 1 + .03 * Math.sin(P(t, tEsp, .2) * Math.PI) : 1), A, () => {
    if (frozen && t < tEsp + .25) { g.save(); g.globalAlpha = .5 * gl; g.translate(14, 0); stopwatch(0, 0, 250, { hand, color: C.blue }); g.restore(); g.save(); g.globalAlpha = .5 * gl; g.translate(-14, 0); stopwatch(0, 0, 250, { hand, color: C.red }); g.restore(); }
    stopwatch(0, 0, 250, { hand, arc: (hand / 6.283) % 1, color: frozen ? C.amber : C.red, readout: ro, glitch: gl });
  });
  // sello PRECOZ que se tacha
  const sa = pop(t, 1.2, .3);
  withT(540, 1205, lerp(1.4, 1, sa) , clamp(sa) * A, () => {
    g.rotate(-.05); font(900, 54); const w = g.measureText('PRECOZ').width + 60; g.lineWidth = 6; g.strokeStyle = C.red; rr(-w / 2, -42, w, 84, 12); g.stroke(); txt('PRECOZ', 0, 3, { w: 900, size: 54, color: C.red, ls: 4 });
    strike(-w / 2 - 10, w / 2 + 10, 0, P(t, tQui + .1, .35), C.amber, 12);
    if (t > tTie2) txt('?', w / 2 + 50, -4, { w: 900, size: 90, color: C.amber, alpha: pop(t, tTie2, .3) });
  });
});

// 2 · EXPERIMENTO: cronómetro + 500 puntos + 5 países → promedio 5:24 → realidad vs internet
const tCro = T('cronómetro'), tQuin = T('quinientas'), tPai = T('países'), tProm = T('promedio', 1), tCin = T('cinco', 2), tMed = T('media'), tInt = T('internet');
scene(5.15, 14.95, (t, A) => {
  // fase A: puntos
  const fa = 1 - P(t, tProm - .25, .35);
  if (fa > 0) {
    g.save(); g.globalAlpha = A * fa;
    withT(540, 600, pop(t, 5.3), 1, () => stopwatch(0, 0, 70, { hand: t * 3, color: C.amber }));
    txt('UN CRONÓMETRO POR PAREJA', 540, 715, { w: 700, size: 26, f: 'J', color: C.dim, alpha: P(t, 5.6, .3), ls: 2 });
    const cols = 25, rows = 20, gx = 820 / cols, x0 = 540 - 410 + gx / 2, y0 = 770;
    for (let i = 0; i < 500; i++) { const c = i % cols, r = Math.floor(i / cols); const d = (c + r) / (cols + rows); const p = P(t, tQuin - .1 + d * .9, .25); if (p <= 0) { const q = P(t, 5.4 + d * .6, .3); if (q > 0) { g.fillStyle = 'rgba(255,255,255,' + (.10 * q) + ')'; g.beginPath(); g.arc(x0 + c * gx, y0 + r * gx, 4, 0, 6.29); g.fill(); } continue; } g.fillStyle = i % 37 === 0 ? C.amber : hex(C.amber, .55); g.beginPath(); g.arc(x0 + c * gx, y0 + r * gx, 11 * eback(p) * .6, 0, 6.29); g.fill(); }
    txt('500', 540, 1110, { w: 900, size: 64, color: C.text, alpha: P(t, tQuin + .4, .3) });
    const cs = ['HOLANDA', 'R. UNIDO', 'ESPAÑA', 'TURQUÍA', 'EE. UU.'];
    font(800, 24); const ws = cs.map(s => g.measureText(s).width + 40); const tw = ws.reduce((a, b) => a + b, 0) + 14 * 4; let x = 540 - tw / 2;
    cs.forEach((s, i) => { chip(x + ws[i] / 2, 1195, s, C.blue, P(t, tPai - .2 + i * .1, .2), pop(t, tPai - .2 + i * .1, .3), 24); x += ws[i] + 14; });
    g.restore();
  }
  // fase B: promedio
  if (t > tProm - .3) {
    const b = P(t, tProm - .3, .35), up = eio(P(t, tMed - .1, .5));
    const rolling = t < tCin; const target = 5.4 / 60;
    const pr = rolling ? 0 : eout(P(t, tCin, .9));
    const secs = Math.round(pr * 324); const ro = rolling ? `${Math.floor(rnd() * 9)}:${String(Math.floor(rnd() * 60)).padStart(2, '0')}` : `${Math.floor(secs / 60)}:${String(secs % 60).padStart(2, '0')}`;
    withT(540, lerp(840, 660, up), lerp(.8, 1, eback(b)) * lerp(1, .62, up), A * b, () => stopwatch(0, 0, 250, { hand: rolling ? t * 9 : pr * target * 6.283, arc: pr * target, color: C.amber, readout: ro }));
    if (!rolling) txt('MEDIANA DEL ESTUDIO: 5,4 MIN', 540, lerp(1170, 850, up), { w: 700, size: 28, f: 'J', color: C.amber, ls: 2, alpha: A * P(t, tCin + .5, .3) });
    // barras realidad vs internet
    if (t > tMed - .2) {
      const q = P(t, tMed - .2, .3), y1 = 990, y2 = 1150, maxw = 760, x0 = 160;
      g.save(); g.globalAlpha = A * q;
      txt('REALIDAD', x0, y1 - 44, { w: 800, size: 30, color: C.amber, align: 'left' }); txt('~5 MIN', x0 + maxw, y1 - 44, { w: 700, size: 30, f: 'J', color: C.amber, align: 'right' });
      g.fillStyle = 'rgba(255,255,255,.08)'; rr(x0, y1 - 16, maxw, 32, 16); g.fill(); g.fillStyle = C.amber; rr(x0, y1 - 16, Math.max(32, maxw * 5.4 / 30 * eout(P(t, tMed, .5))), 32, 16); g.fill();
      txt('INTERNET', x0, y2 - 44, { w: 800, size: 30, color: C.purple, align: 'left' }); txt('30 MIN', x0 + maxw, y2 - 44, { w: 700, size: 30, f: 'J', color: C.purple, align: 'right' });
      g.fillStyle = 'rgba(255,255,255,.08)'; rr(x0, y2 - 16, maxw, 32, 16); g.fill();
      const gl = t > tInt ? (Math.floor(t * 24) % 3 === 0 ? 8 : 0) : 0; g.fillStyle = C.purple; rr(x0 + gl, y2 - 16, Math.max(32, maxw * eout(P(t, tMed + .4, .7))), 32, 16); g.fill();
      if (t > tInt) { const s = pop(t, tInt + .1, .3); withT(700, y2 + 4, lerp(1.6, 1, s), clamp(s), () => { g.rotate(-.08); font(900, 46); const w = g.measureText('FICCIÓN').width + 40; g.fillStyle = C.red; rr(-w / 2, -36, w, 72, 10); g.fill(); txt('FICCIÓN', 0, 3, { w: 900, size: 46, color: '#fff', ls: 3 }); }); }
      g.restore();
    }
  }
});

// 3 · DEFINICIÓN: 3 tarjetas que se encienden
const tMedi = T('médicos'), tCasi = T('casi'), tMin2 = T('minutos', 2), tCon = T('controlar'), tAfe = T('afecta');
scene(14.95, 23.4, (t, A) => {
  g.save(); g.globalAlpha = A;
  chip(540, 440, 'DEFINICIÓN MÉDICA', C.blue, P(t, tMedi - .2, .3), pop(t, tMedi - .2), 28);
  const items = [
    [tCasi, tMin2, C.amber, icoClock, '≈ 1 A 3 MINUTOS', 'casi siempre, no una vez'],
    [tCon - .1, tCon, C.red, icoUnlock, 'SIN CONTROL', 'no puedes retrasarlo'],
    [T('te', 1) - .05, tAfe, C.purple, icoHeart, 'TE AFECTA', 'frustración, evitar intimidad'],
  ];
  items.forEach(([ap, on, col, ico, ti, sub], i) => {
    const y = 600 + i * 205, p = pop(t, 15.1 + i * .18, .4), lit = t >= on;
    withT(540 + (1 - clamp(p)) * 120, y, 1, clamp(p), () => {
      card(0, 0, 860, 170, col, lit, () => {
        g.save(); g.translate(-340, 0); g.beginPath(); g.arc(0, 0, 52, 0, 6.29); g.fillStyle = hex(lit ? col : '#ffffff', lit ? .16 : .05); g.fill(); ico(1.25, lit ? col : C.dim); g.restore();
        txt(ti, -250, -22, { w: 900, size: 46, color: lit ? col : C.dim, align: 'left' });
        txt(sub, -250, 34, { w: 500, size: 28, f: 'J', color: lit ? C.text : C.dim, align: 'left' });
        check(360, 0, 30, col, lit ? eout(P(t, on, .3)) : 0);
      });
    });
  });
  if (t > tAfe + .2) txt('LAS 3 A LA VEZ', 540, 1225, { w: 800, size: 34, color: C.text, ls: 3, alpha: P(t, tAfe + .2, .3) });
  g.restore();
});

// 4 · CAUSAS: pestañas arriba + contenido
const tExp = T('explicación'), tAns = T('ansiedad'), tEre = T('erección'), tCue = T('cuerpo');
const CAUSES = [['ANSIEDAD', C.red, tAns], ['ERECCIÓN', C.purple, tEre], ['CUERPO', C.blue, tCue]];
scene(23.4, 41.75, (t, A) => {
  g.save(); g.globalAlpha = A;
  const active = t >= tCue - .1 ? 2 : t >= tEre - .1 ? 1 : t >= tAns - .1 ? 0 : -1;
  // pestañas
  const tabY = lerp(800, 470, eio(P(t, tAns - .35, .45))), tabS = lerp(1.25, .82, eio(P(t, tAns - .35, .45)));
  [-300, 0, 300].forEach((dx, i) => {
    const [n, col] = CAUSES[i], p = pop(t, 23.45 + i * .2, .35), on = active === i || active < 0;
    withT(540 + dx * tabS, tabY, tabS * lerp(.6, 1, clamp(p)), clamp(p) * (on ? 1 : .35), () => { card(0, 0, 260, 90, col, active === i, () => txt(n, 0, 3, { w: 900, size: 32, color: on ? col : C.dim })); });
  });
  if (active < 0 && t > tExp) { check(540, 1060, 60, C.green, eout(P(t, tExp + .1, .4))); }
  // 1 ANSIEDAD: círculo vicioso que acelera
  const a1 = fadeIO(t, tAns - .1, tEre - .05, .3);
  if (a1 > 0) {
    g.save(); g.globalAlpha *= a1; const cx = 540, cy = 900, R = 270;
    const nodes = ['MIEDO', 'PRISA', 'TERMINAS', 'MÁS MIEDO'];
    g.strokeStyle = hex(C.red, .3); g.lineWidth = 8; g.setLineDash([2, 18]); g.lineCap = 'round'; g.beginPath(); g.arc(cx, cy, R, 0, 6.29); g.stroke(); g.setLineDash([]);
    const sp = (t - tAns) ; const ang = sp * sp * 1.1 + sp * 1.5; // acelera
    for (let k = 0; k < 3; k++) { const a = ang - k * .18; g.fillStyle = hex(C.red, 1 - k * .3); g.beginPath(); g.arc(cx + Math.cos(a) * R, cy + Math.sin(a) * R, 16 - k * 4, 0, 6.29); g.fill(); }
    nodes.forEach((n, i) => { const a = -Math.PI / 2 + i * Math.PI / 2, p = pop(t, T('mientras') + i * .55, .35); const x = cx + Math.cos(a) * R, y = cy + Math.sin(a) * R; withT(x, y, clamp(p) * (i === 3 ? 1.1 : 1), clamp(p), () => { font(900, 34); const w = g.measureText(n).width + 50; g.fillStyle = '#141a2e'; rr(-w / 2, -36, w, 72, 36); g.fill(); g.lineWidth = 4; g.strokeStyle = C.red; g.stroke(); txt(n, 0, 2, { w: 900, size: 34, color: i === 3 ? C.red : C.text }); }); });
    txt('CÍRCULO VICIOSO', cx, cy, { w: 700, size: 30, f: 'J', color: C.dim, ls: 2, alpha: P(t, T('rápido', 2), .4) });
    g.restore();
  }
  // 2 ERECCIÓN: medidor que baja + "¿y si la pierdo?" + ACELERAS
  const a2 = fadeIO(t, tEre - .05, tCue - .05, .3);
  if (a2 > 0) {
    g.save(); g.globalAlpha *= a2; const tPer = T('perderla'), tAce = T('aceleran');
    const lvl = 1 - .55 * eio(P(t, T('miedo', 2) - .2, 1.2));
    // batería
    const bx = 330, by = 900; g.lineWidth = 8; g.strokeStyle = C.purple; rr(bx - 70, by - 160, 140, 320, 24); g.stroke(); g.fillStyle = C.purple; rr(bx - 30, by - 184, 60, 22, 6); g.fill();
    g.fillStyle = lvl < .6 ? C.red : C.purple; const hh = 290 * lvl; rr(bx - 55, by + 145 - hh, 110, hh, 14); g.fill();
    txt('ERECCIÓN', bx, by + 215, { w: 800, size: 30, color: C.purple });
    // burbuja de pensamiento
    if (t > tPer - .5) withT(720, 700, pop(t, tPer - .5, .35), 1, () => { g.fillStyle = '#f2f3f8'; rr(-190, -60, 380, 120, 60); g.fill(); g.beginPath(); g.arc(-150, 85, 18, 0, 6.29); g.arc(-185, 120, 10, 0, 6.29); g.fill(); txt('¿Y SI LA PIERDO?', 0, 2, { w: 900, size: 36, color: '#141a2e' }); });
    // velocímetro
    const sx = 740, sy = 1010; const p = P(t, tAce, .4); g.lineWidth = 14; g.lineCap = 'round'; g.strokeStyle = 'rgba(255,255,255,.12)'; g.beginPath(); g.arc(sx, sy, 130, Math.PI, 0); g.stroke();
    const v = clamp(p) * .92 + Math.sin(t * 30) * .02 * clamp(p); g.strokeStyle = C.red; g.beginPath(); g.arc(sx, sy, 130, Math.PI, Math.PI + v * Math.PI); g.stroke();
    g.save(); g.translate(sx, sy); g.rotate(-Math.PI / 2 + (v - .5) * Math.PI); g.strokeStyle = C.text; g.lineWidth = 8; g.beginPath(); g.moveTo(0, 0); g.lineTo(0, -105); g.stroke(); g.restore();
    txt('ACELERAS', sx, sy + 60, { w: 900, size: 40, color: C.red, alpha: P(t, tAce, .3) });
    txt('sin darte cuenta', sx, sy + 108, { w: 500, size: 26, f: 'J', color: C.dim, alpha: P(t, T('darse'), .3) });
    g.restore();
  }
  // 3 CUERPO: cerebro + serotonina + tiroides / próstata
  const a3 = fadeIO(t, tCue - .05, 41.75, .3);
  if (a3 > 0) {
    g.save(); g.globalAlpha *= a3; const tSer = T('serotonina'), tTir = T('tiroides'), tPro = T('próstata');
    withT(540, 790, lerp(.7, 1, eback(P(t, tCue, .4))), 1, () => { g.shadowColor = C.blue; g.shadowBlur = 20; icoBrain(1.9, C.blue); g.shadowBlur = 0; });
    if (t > tSer - .4) { for (let i = 0; i < 14; i++) { const ph = (t * .7 + i / 14) % 1; const a = i * 2.4; const r = 60 + ph * 190; g.fillStyle = hex(C.blue, (1 - ph) * .9); g.beginPath(); g.arc(540 + Math.cos(a) * r, 790 + Math.sin(a) * r * .8, 9, 0, 6.29); g.fill(); } chip(540, 1035, 'SEROTONINA', C.blue, P(t, tSer - .2, .3), pop(t, tSer - .2), 36); }
    if (t > tTir - .3) chip(330, 1170, 'TIROIDES', C.amber, P(t, tTir - .3, .3), pop(t, tTir - .3), 32);
    if (t > tPro - .3) chip(720, 1170, 'PRÓSTATA INFLAMADA', C.amber, P(t, tPro - .3, .3), pop(t, tPro - .3), 32);
    g.restore();
  }
  g.restore();
});

// 5 · TRATAMIENTO: check grande + 3 pasos
const tTra = T('tratamiento'), tEje = T('ejercicios'), tTec = T('técnicas'), tUro = T('urólogo');
scene(41.5, 48.75, (t, A) => {
  g.save(); g.globalAlpha = A;
  const up = eio(P(t, tEje - .4, .45));
  withT(540, lerp(840, 470, up), lerp(1, .55, up) * lerp(.6, 1, eback(P(t, T('bueno'), .4))), 1, () => check(0, 0, 130, C.green, eout(P(t, tTra, .5))));
  const items = [[tEje, icoPelvis, 'SUELO PÉLVICO', 'ejercicios para controlar'], [tTec, icoPause, 'TÉCNICAS DE PAUSA', 'parar y retomar'], [tUro, icoDoc, 'UN URÓLOGO', 'te guía con opciones']];
  items.forEach(([ap, ico, ti, sub], i) => {
    const p = pop(t, ap - .25, .4), y = 690 + i * 190, lit = t >= ap + .2;
    withT(540, y, lerp(.85, 1, clamp(p)), clamp(p), () => card(0, 0, 860, 160, C.green, lit, () => {
      txt(String(i + 1), -370, 0, { w: 900, size: 54, color: C.green });
      g.save(); g.translate(-270, 0); ico(1.2, C.green); g.restore();
      txt(ti, -200, -20, { w: 900, size: 42, color: C.text, align: 'left' }); txt(sub, -200, 32, { w: 500, size: 26, f: 'J', color: C.dim, align: 'left' });
      check(360, 0, 28, C.green, eout(P(t, ap + .3, .3)));
    }));
  });
  g.restore();
});

// 6 · HOMBRÍA tachado → SALUD
const tHom = T('hombría'), tSal = T('salud');
scene(48.75, 51.2, (t, A) => {
  g.save(); g.globalAlpha = A;
  withT(540, 780, lerp(.85, 1, eback(P(t, 48.8, .4))), 1, () => {
    txt('FALTA DE', 0, -70, { w: 900, size: 64, color: C.dim });
    font(900, 120); const w = g.measureText('HOMBRÍA').width; txt('HOMBRÍA', 0, 50, { w: 900, size: 120, color: C.text });
    strike(-w / 2 - 20, w / 2 + 20, 50, P(t, tHom + .15, .3), C.red, 16);
  });
  if (t > tSal - .1) withT(540, 1080, lerp(1.5, 1, eback(P(t, tSal - .1, .35))), P(t, tSal - .1, .2), () => { g.shadowColor = C.green; g.shadowBlur = 40; txt('ES SALUD', 0, 0, { w: 900, size: 130, color: C.green }); });
  g.restore();
});

// 7 · CIERRE: promedio + encuesta
const tSab = T('sabías'), tLeo = T('leo');
scene(51.2, END + 1, (t, A) => {
  g.save(); g.globalAlpha = A;
  const out = P(t, tLeo - .35, .35);
  if (out < 1) { g.save(); g.globalAlpha *= 1 - out; withT(540, 860, lerp(.8, 1, eback(P(t, 51.25, .4))), 1, () => stopwatch(0, 0, 230, { hand: 5.4 / 60 * 6.283, arc: 5.4 / 60 * eout(P(t, T('promedio', 2), .6)), color: C.amber, readout: '5:24' })); txt('NO 30 · NO 1 · ~5 MINUTOS', 540, 1180, { w: 800, size: 34, color: C.amber, ls: 2, alpha: P(t, T('minutos', 3), .3) }); g.restore(); }
  if (t > tLeo - .35) {
    const p = P(t, tLeo - .35, .35);
    txt('¿Y TÚ?', 540, 640, { w: 900, size: 96, color: C.text, alpha: p });
    const opts = [['A', 'Sí, lo sabía', C.blue], ['B', 'No tenía idea', C.red]];
    opts.forEach(([l, s, col], i) => { const q = pop(t, tLeo - .2 + i * .25, .35); withT(540, 800 + i * 140, lerp(.8, 1, clamp(q)), clamp(q), () => { g.fillStyle = C.card; rr(-380, -52, 760, 104, 18); g.fill(); g.lineWidth = 4; g.strokeStyle = col; g.stroke(); g.fillStyle = col; g.beginPath(); g.arc(-320, 0, 28, 0, 6.29); g.fill(); txt(l, -320, 2, { w: 900, size: 32, color: '#0b0e1a' }); txt(s, -270, 2, { w: 800, size: 40, color: C.text, align: 'left' }); }); });
    const q = pop(t, tLeo + .5, .35); withT(540, 1110, clamp(q), clamp(q), () => { g.fillStyle = C.amber; rr(-230, -40, 460, 80, 40); g.fill(); g.beginPath(); g.moveTo(-150, 36); g.lineTo(-170, 66); g.lineTo(-120, 38); g.fill(); txt('TE LEO 👇', 0, 3, { w: 900, size: 38, color: '#141a2e' }); });
  }
  g.restore();
});

// ---------- composición ----------
function renderAt(t) {
  seed = 11 + Math.floor(t * 30) * 7;
  background(t);
  const pre = seed; seed = 11; // para que rnd() de escenas sea estable por cuadro
  seed = pre;
  for (const s of S) {
    if (t < s.a - .01 || t > s.b + .01) continue;
    const a = Math.min(P(t, s.a, .3), 1 - P(t, s.b - .3, .3)), z = lerp(1.03, 1, eout(P(t, s.a, .4)));
    g.save(); g.translate(540, 960); g.scale(z, z); g.translate(-540, -960); s.fn(t, s.a === 0 ? Math.max(a, t < .3 ? 1 : a) : a); g.restore();
  }
  header(t); pending(t); captions(t); grain(t);
  const fo = P(t, END - .4, .4); if (fo > 0) { g.fillStyle = `rgba(0,0,0,${fo})`; g.fillRect(0, 0, W, H); }
}
window.renderAt = renderAt; window.END = END;
window.frameJPG = (t, q = .92) => { renderAt(t); return cv.toDataURL('image/jpeg', q).split(',')[1]; };
window.READY = true;
