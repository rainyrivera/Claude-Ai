// "La grulla de papel" – Capítulo 3 – animación 2D estilo recorte
const W = 1080, H = 1920;
const TIMING = await (await fetch('timing.json')).json();
const WORDS = TIMING.words;
const DUR = TIMING.dur;
await Promise.all(['70px LG', '90px BB', '60px PM', '900 90px CZ'].map(f => document.fonts.load(f, 'ÁÉÍÓÚáéíóúÑñ¿?')));

const cv = document.getElementById('c'); const ctx = cv.getContext('2d');
const mk = (w = W, h = H) => { const c = document.createElement('canvas'); c.width = w; c.height = h; return c; };
const bufA = mk(), bufB = mk();

// ---------- utilidades ----------
let seed = 11;
const rnd = () => { seed = (seed * 16807) % 2147483647; return (seed - 1) / 2147483646; };
const srnd = s => { let x = Math.sin(s * 127.1 + 311.7) * 43758.5453; return x - Math.floor(x); };
const clamp = (x, a = 0, b = 1) => Math.min(b, Math.max(a, x));
const prog = (t, a, b) => clamp((t - a) / (b - a));
const eio = x => x < .5 ? 4 * x * x * x : 1 - Math.pow(-2 * x + 2, 3) / 2;
const eout = x => 1 - Math.pow(1 - x, 3);
const eback = x => { const c1 = 1.9, c3 = c1 + 1; return 1 + c3 * Math.pow(x - 1, 3) + c1 * Math.pow(x - 1, 2); };
const lerp = (a, b, x) => a + (b - a) * x;
const OL = '#16130f';
function rr(g, x, y, w, h, r) { g.beginPath(); g.roundRect(x, y, w, h, r); }
function fs(g, fill, lw = 6) { g.fillStyle = fill; g.fill(); if (lw) { g.lineWidth = lw; g.strokeStyle = OL; g.lineJoin = 'round'; g.stroke(); } }
function ell(g, x, y, rx, ry, fill, lw = 6) { g.beginPath(); g.ellipse(x, y, rx, ry, 0, 0, Math.PI * 2); fs(g, fill, lw); }
function poly(g, pts, fill, lw = 6) { g.beginPath(); pts.forEach(([x, y], i) => i ? g.lineTo(x, y) : g.moveTo(x, y)); g.closePath(); fs(g, fill, lw); }
const blinkAt = (t, k = 0) => ((t + k * 1.37) % 3.3) < 0.11;
function cam(g, lt, dur, amt = 0.05, cx = W / 2, cy = H * 0.45) { const s = 1 + amt * eio(clamp(lt / dur)); g.translate(cx, cy); g.scale(s, s); g.translate(-cx, -cy); }

// ---------- rig de personajes (recorte) ----------
function limb(g, x, y, ang, len, w, fill, end) {
  g.save(); g.translate(x, y); g.rotate(ang);
  rr(g, -w / 2, -w / 2, w, len + w / 2, w / 2); fs(g, fill);
  if (end) end(g, len);
  g.restore();
  return [x - Math.sin(ang) * len, y + Math.cos(ang) * len];
}
const hand = c => (g, len) => { ell(g, 0, len + 6, 17, 17, c, 5); };
const boot = c => (g, len) => { rr(g, -20, len - 10, 52, 30, 10); fs(g, c, 5); };

// spec: colores y funciones; pose: ángulos
function figure(g, x, y, s, sp, p = {}) {
  g.save(); g.translate(x, y + (p.bob || 0)); g.scale(s * (p.flip ? -1 : 1), s);
  const aL = p.aL ?? 0.12, aR = p.aR ?? -0.12, lL = p.lL ?? 0.06, lR = p.lR ?? -0.06;
  const tw = sp.tw || 116, th = sp.th || 190, leg = sp.leg || 215, arm = sp.arm || 175;
  if (sp.capeBack) sp.capeBack(g, tw, th, leg, p);
  // brazo trasero
  limb(g, tw / 2 - 12, -th + 18, aR, arm, 30, sp.arm2 || sp.armC, hand(sp.handC || sp.skin));
  if (p.holdR) p.holdR(g, tw / 2 - 12 - Math.sin(aR) * arm, -th + 18 + Math.cos(aR) * arm + 6);
  // piernas
  limb(g, 22, -6, lR, leg, 38, sp.legC, boot(sp.bootC));
  limb(g, -22, -6, lL, leg, 38, sp.legC, boot(sp.bootC));
  // torso
  g.beginPath(); g.moveTo(-tw / 2, -th); g.lineTo(tw / 2, -th); g.lineTo(tw / 2 - 10, 10); g.lineTo(-tw / 2 + 10, 10); g.closePath(); fs(g, sp.torso);
  if (sp.torsoDeco) sp.torsoDeco(g, tw, th);
  // cabeza
  g.save(); g.translate(0, -th - 50); g.rotate(p.tilt || 0); sp.head(g, p); g.restore();
  // brazo delantero
  limb(g, -tw / 2 + 12, -th + 18, aL, arm, 30, sp.armC, hand(sp.handC || sp.skin));
  if (p.holdL) p.holdL(g, -tw / 2 + 12 - Math.sin(aL) * arm, -th + 18 + Math.cos(aL) * arm + 6);
  if (sp.front) sp.front(g, tw, th, p);
  g.restore();
}
// pose de caminar/idle
const walk = (t, sp = 1, amp = 0.45) => { const a = Math.sin(t * Math.PI * 2 * sp) * amp; return { aL: -a * .8, aR: a * .8, lL: a, lR: -a, bob: -Math.abs(Math.cos(t * Math.PI * 2 * sp)) * 8 }; };
const idle = (t, k = 0) => { const a = Math.sin(t * 1.6 + k) * 0.05; return { aL: 0.12 + a, aR: -0.12 - a, bob: Math.sin(t * 2.2 + k) * 2.5, blink: blinkAt(t, k) }; };

function eyes(g, y, dx, blink, c = '#16130f', r = 6) {
  if (blink) { g.lineWidth = 4; g.strokeStyle = OL; g.beginPath(); g.moveTo(-dx - 8, y); g.lineTo(-dx + 8, y); g.moveTo(dx - 8, y); g.lineTo(dx + 8, y); g.stroke(); }
  else { g.fillStyle = c; g.beginPath(); g.arc(-dx, y, r, 0, 7); g.arc(dx, y, r, 0, 7); g.fill(); }
}

// ---------- personajes ----------
const SKIN = '#c99a74', JACKET = '#1f2d45', PALE = '#b8b2a4';
function faceTomas(g, p, copy = false) {
  const sk = copy ? PALE : SKIN;
  ell(g, 0, 0, 44, 54, sk); ell(g, -44, 4, 9, 13, sk, 4); ell(g, 44, 4, 9, 13, sk, 4);
  g.beginPath(); g.moveTo(-46, 0); g.quadraticCurveTo(-50, -66, 2, -64); g.quadraticCurveTo(52, -62, 46, 0); g.lineTo(40, -24); g.quadraticCurveTo(10, -38, -20, -30); g.lineTo(-40, -22); g.closePath(); fs(g, '#1b1512', 5);
  if (copy) {
    ell(g, -16, -2, 11, 13, '#050505', 3); ell(g, 16, -2, 11, 13, '#050505', 3); g.fillStyle = '#fff'; g.fillRect(-18, -4, 3, 3); g.fillRect(14, -4, 3, 3);
    g.lineWidth = 4; g.strokeStyle = OL; g.beginPath(); g.moveTo(-14, 26); g.quadraticCurveTo(0, 32 + (p.smile || 0) * 6, 14, 26); g.stroke();
    g.fillStyle = 'rgba(40,60,50,.25)'; g.beginPath(); g.ellipse(-16, 12, 12, 5, 0, 0, 7); g.ellipse(16, 12, 12, 5, 0, 0, 7); g.fill();
  } else {
    eyes(g, -2, 16, p.blink, OL, p.wide ? 8 : 6);
    if (p.wide) { g.lineWidth = 3; g.strokeStyle = OL; g.beginPath(); g.arc(-16, -2, 12, 0, 7); g.arc(16, -2, 12, 0, 7); g.stroke(); }
    g.lineWidth = 4; g.strokeStyle = OL; g.beginPath();
    if (p.mouth === 'smile') { g.arc(0, 20, 14, .2, Math.PI - .2); } else if (p.mouth === 'o') { g.ellipse(0, 28, 7, 10, 0, 0, 7); } else { g.moveTo(-10, 27); g.lineTo(10, 27); }
    g.stroke();
    if (p.tired) { g.strokeStyle = 'rgba(60,30,40,.6)'; g.lineWidth = 3; g.beginPath(); g.arc(-16, 8, 9, .3, Math.PI - .3); g.arc(16, 8, 9, .3, Math.PI - .3); g.stroke(); }
    if (p.sweat) { ell(g, 40, -24, 6, 10, '#bfe6ff', 3); }
  }
}
const TOMAS = {
  skin: SKIN, armC: JACKET, legC: '#2b2f36', bootC: '#161616', torso: JACKET, handC: SKIN,
  head: (g, p) => faceTomas(g, p, p.copy),
  torsoDeco: (g, tw, th) => { g.lineWidth = 4; g.strokeStyle = OL; g.beginPath(); g.moveTo(0, -th + 10); g.lineTo(0, 8); g.stroke(); poly(g, [[-30, -th], [0, -th + 28], [30, -th]], '#2e4064', 4); rr(g, -48, -th + 50, 34, 22, 3); fs(g, '#d8c27a', 3); },
};
const COPY = { ...TOMAS, skin: PALE, handC: PALE, head: (g, p) => faceTomas(g, p, true) };
const BOSS = {
  skin: '#d9a982', armC: '#a58f6a', legC: '#4a443c', bootC: '#2a2420', torso: '#a58f6a', handC: '#d9a982',
  head: (g, p) => { ell(g, 0, 0, 46, 54, '#d9a982'); ell(g, -46, 6, 9, 13, '#d9a982', 4); ell(g, 46, 6, 9, 13, '#d9a982', 4);
    g.fillStyle = '#cfcfcf'; g.fillRect(-48, -14, 10, 24); g.fillRect(38, -14, 10, 24);
    const dx = p.lookAway ? 10 : 0; eyes(g, -4, 16, p.blink, OL, 5); g.save(); g.translate(dx, 0); g.restore();
    g.beginPath(); g.moveTo(-24, 18); g.quadraticCurveTo(0, 8, 24, 18); g.quadraticCurveTo(0, 30, -24, 18); fs(g, '#cfcfcf', 4);
    g.lineWidth = 4; g.strokeStyle = OL; g.beginPath(); g.moveTo(-28, -22); g.lineTo(-6, -18); g.moveTo(28, -22); g.lineTo(6, -18); g.stroke(); },
  torsoDeco: (g, tw, th) => { g.lineWidth = 4; g.strokeStyle = OL; g.beginPath(); g.moveTo(0, -th); g.lineTo(0, 8); g.stroke(); for (const y of [-130, -80, -30]) ell(g, 10, y, 5, 5, '#3a3020', 0); },
};
// linterna con haz
const flashlight = (beam = 1) => (g, x, y) => { g.save(); g.translate(x, y); rr(g, -10, -6, 20, 46, 6); fs(g, '#2a2a2a', 4);
  if (beam > 0) { const gr = g.createLinearGradient(0, 40, 0, 600); gr.addColorStop(0, `rgba(255,240,190,${.45 * beam})`); gr.addColorStop(1, 'rgba(255,240,190,0)'); g.fillStyle = gr; g.beginPath(); g.moveTo(-8, 40); g.lineTo(-160, 600); g.lineTo(160, 600); g.lineTo(8, 40); g.fill(); }
  g.restore(); };
// vista de espaldas sentado (caseta). turn: 0 = espalda, 1 = de frente
function backView(g, x, y, s, { copy = false, turn = 0, t = 0, smile = 0 } = {}) {
  g.save(); g.translate(x, y); g.scale(s, s);
  rr(g, -150, -330, 300, 360, 30); fs(g, '#222826', 7); // respaldo
  g.beginPath(); g.moveTo(-120, -250); g.lineTo(120, -250); g.lineTo(130, 20); g.lineTo(-130, 20); g.closePath(); fs(g, JACKET, 7);
  g.lineWidth = 5; g.strokeStyle = 'rgba(0,0,0,.35)'; g.beginPath(); g.moveTo(0, -240); g.lineTo(0, 20); g.stroke();
  rr(g, -20, -290, 40, 50, 10); fs(g, copy ? PALE : SKIN, 6);
  const k = clamp(turn); const sx = Math.max(.04, Math.abs(Math.cos(k * Math.PI)));
  g.save(); g.translate(0, -340); g.scale(1.25 * (k < .5 ? sx : sx), 1.25);
  if (k < .5) { ell(g, -44, 4, 9, 13, copy ? PALE : SKIN, 4); ell(g, 44, 4, 9, 13, copy ? PALE : SKIN, 4); ell(g, 0, -2, 46, 58, '#1b1512', 6); }
  else faceTomas(g, { smile }, copy);
  g.restore(); g.restore();
}

// ---------- fondos ----------
function nightSky(g) { const gr = g.createLinearGradient(0, 0, 0, H); gr.addColorStop(0, '#05080b'); gr.addColorStop(.6, '#0f1d22'); gr.addColorStop(1, '#16282a'); g.fillStyle = gr; g.fillRect(0, 0, W, H); }
function fog(g, t, y, a = .18) { for (let i = 0; i < 3; i++) { const x = ((t * 25 * (i + 1)) % 1400) - 300; const rg = g.createRadialGradient(x + 400, y + i * 60, 0, x + 400, y + i * 60, 600); rg.addColorStop(0, `rgba(170,200,190,${a})`); rg.addColorStop(1, 'rgba(0,0,0,0)'); g.fillStyle = rg; g.fillRect(0, y - 500, W, 1100); } }
function moon(g, x, y, r) { g.save(); g.shadowColor = '#dfe9d8'; g.shadowBlur = 60; ell(g, x, y, r, r, '#dfe6d2', 0); g.restore(); ell(g, x - r * .3, y - r * .2, r * .18, r * .18, 'rgba(0,0,0,.08)', 0); }
const WINS = Array.from({ length: 30 }, () => [rnd(), rnd()]);
function clinicExt(g, t, flick = 1) {
  nightSky(g); moon(g, 840, 260, 70);
  rr(g, 90, 520, 900, 900, 4); fs(g, '#4a5a55', 9);
  rr(g, 60, 480, 960, 60, 4); fs(g, '#3a4844', 8);
  let i = 0; for (let r = 0; r < 5; r++) for (let c = 0; c < 6; c++) { const x = 140 + c * 145, y = 580 + r * 150; const [b, l] = WINS[i++];
    rr(g, x, y, 95, 110, 4); fs(g, '#121a1a', 5);
    if (b < .3) { g.fillStyle = '#05080a'; g.beginPath(); g.moveTo(x + 10, y + 10); g.lineTo(x + 60, y + 40); g.lineTo(x + 30, y + 70); g.lineTo(x + 85, y + 100); g.lineTo(x + 10, y + 100); g.fill(); }
    if (r === 0 && c === 4) { const on = Math.sin(t * 7) > .6 ? .7 : .1; g.fillStyle = `rgba(200,240,190,${on})`; g.fillRect(x + 6, y + 6, 83, 98); } }
  // letrero
  const letters = 'CLÍNICA VALDIVIESO'; g.font = '62px BB'; g.textAlign = 'center'; g.textBaseline = 'middle';
  rr(g, 200, 390, 680, 90, 6); fs(g, '#1d2422', 6);
  let x0 = 540 - g.measureText(letters).width / 2;
  for (let j = 0; j < letters.length; j++) { const ch = letters[j]; const w = g.measureText(ch).width; const dead = j === 3 || j === 11; const on = !dead && (j !== 6 || Math.sin(t * 9) > -.2) && flick;
    g.save(); if (on) { g.shadowColor = '#9dffb0'; g.shadowBlur = 18; } g.fillStyle = on ? '#c9ffd2' : '#33403a'; g.fillText(ch, x0 + w / 2, 440); g.restore(); x0 += w; }
  rr(g, 430, 1180, 220, 240, 4); fs(g, '#1a1f1d', 7); // puerta
  g.fillStyle = '#1f2624'; g.fillRect(0, 1420, W, H); g.lineWidth = 6; g.strokeStyle = OL; g.beginPath(); g.moveTo(0, 1420); g.lineTo(W, 1420); g.stroke();
  g.strokeStyle = '#2b3431'; g.lineWidth = 6; for (let x = 0; x < W; x += 40) { g.beginPath(); g.moveTo(x, 1300); g.lineTo(x, 1430); g.stroke(); } g.beginPath(); g.moveTo(0, 1310); g.lineTo(W, 1310); g.stroke();
  fog(g, t, 1350, .16);
}
function street(g, t, px = 0) {
  nightSky(g); g.save(); g.translate(-px, 0);
  for (let i = 0; i < 8; i++) { const x = i * 300 - 100, h = 500 + srnd(i) * 400; rr(g, x, 1300 - h, 260, h, 2); fs(g, '#1b2528', 6); for (let r = 0; r < 6; r++) for (let c = 0; c < 3; c++) if (srnd(i * 31 + r * 7 + c) < .3) { g.fillStyle = '#e8c97a'; g.fillRect(x + 30 + c * 75, 1300 - h + 40 + r * 70, 40, 40); } }
  for (let i = 0; i < 6; i++) { const x = i * 420 + 120; rr(g, x, 900, 16, 520, 6); fs(g, '#20282a', 5); g.save(); g.shadowColor = '#ffd98a'; g.shadowBlur = 40; ell(g, x + 8, 900, 28, 14, '#ffe2a2', 4); g.restore();
    const rg = g.createRadialGradient(x + 8, 1420, 0, x + 8, 1420, 260); rg.addColorStop(0, 'rgba(255,220,140,.2)'); rg.addColorStop(1, 'rgba(0,0,0,0)'); g.fillStyle = rg; g.fillRect(x - 260, 1160, 540, 520); }
  g.restore(); g.fillStyle = '#1b2224'; g.fillRect(0, 1420, W, H); g.lineWidth = 6; g.strokeStyle = OL; g.beginPath(); g.moveTo(0, 1420); g.lineTo(W, 1420); g.stroke();
}
// pasillo en perspectiva
function corridor(g, t, { dark = 0, flick = true, stretchers = true, smoke = 0 } = {}) {
  const vx = 540, vy = 820; g.fillStyle = '#16201d'; g.fillRect(0, 0, W, H);
  const on = !flick || (Math.sin(t * 17) + Math.sin(t * 5.3)) > -1.3;
  poly(g, [[0, 0], [W, 0], [vx + 90, vy - 120], [vx - 90, vy - 120]], on ? '#55675e' : '#2a3430', 0);
  poly(g, [[0, 0], [vx - 90, vy - 120], [vx - 90, vy + 120], [0, H]], on ? '#6d8276' : '#33403a', 0);
  poly(g, [[W, 0], [vx + 90, vy - 120], [vx + 90, vy + 120], [W, H]], on ? '#64796d' : '#2f3b36', 0);
  poly(g, [[0, H], [vx - 90, vy + 120], [vx + 90, vy + 120], [W, H]], '#2b3530', 0);
  rr(g, vx - 90, vy - 120, 180, 240, 0); fs(g, '#0a0e0d', 5);
  for (let i = 0; i < 4; i++) { const k = [0.12, .35, .55, .72][i], l = (a, b) => lerp(a, b, k); g.fillStyle = on ? '#efffe8' : '#3a4640'; if (on) { g.save(); g.shadowColor = '#d8ffd8'; g.shadowBlur = 30; } g.fillRect(l(340, vx - 30), l(60, vy - 110), l(400, 60), l(36, 6)); if (on) g.restore(); }
  for (const side of [-1, 1]) for (let i = 0; i < 3; i++) { const k = [.1, .38, .6][i]; const x0 = side < 0 ? lerp(0, vx - 90, k) : lerp(W, vx + 90, k), x1 = side < 0 ? lerp(0, vx - 90, k + .14) : lerp(W, vx + 90, k + .14);
    const yt0 = lerp(380, vy - 70, k), yb0 = lerp(1580, vy + 120, k), yt1 = lerp(380, vy - 70, k + .14), yb1 = lerp(1580, vy + 120, k + .14);
    poly(g, [[x0, yt0], [x1, yt1], [x1, yb1], [x0, yb0]], '#3d4a44', 5); }
  if (stretchers) for (const [x, y, s] of [[230, 1420, 1], [800, 1180, .6]]) { g.save(); g.translate(x, y); g.scale(s, s); rr(g, -140, -40, 280, 34, 8); fs(g, '#9a8d7a', 5); g.lineWidth = 7; g.strokeStyle = '#5b4a3a'; g.beginPath(); g.moveTo(-120, -6); g.lineTo(-120, 90); g.moveTo(120, -6); g.lineTo(120, 90); g.stroke(); ell(g, -120, 98, 12, 12, '#2a2a2a', 4); ell(g, 120, 98, 12, 12, '#2a2a2a', 4); g.restore(); }
  if (smoke) { g.fillStyle = `rgba(20,16,14,${smoke})`; g.fillRect(0, 0, W, H); }
  if (dark) { g.fillStyle = `rgba(0,0,0,${dark})`; g.fillRect(0, 0, W, H); }
}
// caseta por dentro
const MONS = Array.from({ length: 6 }, (_, i) => [150 + (i % 3) * 265, 360 + Math.floor(i / 3) * 215]);
function camThumb(g, k, t) { // contenido miniatura según cámara
  const kinds = ['corridor', 'stairs', 'basement', 'lobby', 'elevator', 'booth'];
  camView(g, 240, 175, kinds[k], t, {});
}
function booth(g, t, { lit = 1, mon6 = null, rings = 0, sheetGlow = 0 } = {}) {
  g.fillStyle = '#2d3a35'; g.fillRect(0, 0, W, H);
  g.fillStyle = 'rgba(0,0,0,.18)'; for (let x = 0; x < W; x += 90) g.fillRect(x, 0, 4, 1150);
  rr(g, 120, 330, 840, 470, 14); fs(g, '#1c2321', 8);
  MONS.forEach(([x, y], i) => { rr(g, x - 6, y - 6, 252, 187, 8); fs(g, '#0b0f0e', 5); if (i === 5 && mon6) mon6(g, x, y, 240, 175); else cctv(g, x, y, 240, 175, `CAM ${i + 1}`, null, gg => camThumb(gg, i, t), true); });
  // hoja de reglas en la pared
  g.save(); g.translate(70, 870); g.rotate(-.05); rr(g, 0, 0, 190, 240, 3); fs(g, '#ece4cf', 5); if (sheetGlow) { g.strokeStyle = `rgba(255,40,40,${sheetGlow})`; g.lineWidth = 10; g.stroke(); }
  g.fillStyle = '#5a4b3a'; for (let i = 0; i < 6; i++) g.fillRect(20, 40 + i * 32, 140 - (i % 2) * 30, 6); g.restore();
  // puerta con ventana
  rr(g, 880, 840, 190, 420, 6); fs(g, '#3b4a44', 7); rr(g, 915, 880, 120, 140, 4); fs(g, '#0a0f0e', 5);
  // escritorio
  rr(g, -20, 1180, 1120, 80, 6); fs(g, '#5a4a38', 8); g.fillStyle = '#3d3226'; g.fillRect(0, 1262, W, 700); g.lineWidth = 8; g.strokeStyle = OL; g.beginPath(); g.moveTo(0, 1262); g.lineTo(W, 1262); g.stroke();
  phone(g, 830, 1180, .8, rings, t);
  if (lit < 1) { g.fillStyle = `rgba(0,0,0,${1 - lit})`; g.fillRect(0, 0, W, H); }
}
function phone(g, x, y, s, ring = 0, t = 0) {
  g.save(); g.translate(x + (ring ? Math.sin(t * 70) * 5 : 0), y); g.scale(s, s);
  poly(g, [[-110, 0], [110, 0], [80, -110], [-80, -110]], '#c9b98f', 7); ell(g, 0, -60, 42, 42, '#e8ddc0', 5); for (let i = 0; i < 8; i++) { const a = i / 8 * 6; ell(g, Math.cos(a) * 28, -60 + Math.sin(a) * 28, 7, 7, '#5a503a', 0); }
  rr(g, -130, -170, 260, 50, 25); fs(g, '#c9b98f', 7); rr(g, -150, -180, 70, 80, 20); fs(g, '#c9b98f', 7); rr(g, 80, -180, 70, 80, 20); fs(g, '#c9b98f', 7);
  g.restore();
  if (ring) { g.save(); g.strokeStyle = `rgba(255,50,50,${.6 + .4 * Math.sin(t * 20)})`; g.lineWidth = 8; for (let i = 0; i < 3; i++) { const r = 60 + i * 40 + (t * 120 % 40); g.beginPath(); g.arc(x - 150 * s, y - 120 * s, r * s, Math.PI * .6, Math.PI * 1.4); g.stroke(); g.beginPath(); g.arc(x + 150 * s, y - 120 * s, r * s, -Math.PI * .4, Math.PI * .4); g.stroke(); } g.restore(); }
}
// contenido de cámaras
function camView(g, w, h, kind, t, o) {
  g.save(); const sx = w / 1080, sy = h / 788; g.scale(sx, sy);
  if (kind === 'corridor' || kind === 'stairs' || kind === 'basement' || kind === 'lobby') {
    g.fillStyle = '#5f7166'; g.fillRect(0, 0, 1080, 788); poly(g, [[0, 788], [440, 420], [640, 420], [1080, 788]], '#2d3832', 0); poly(g, [[0, 0], [440, 300], [640, 300], [1080, 0]], '#46564e', 0); rr(g, 440, 300, 200, 120, 0); fs(g, '#0d1210', 0);
    if (kind === 'stairs') { g.fillStyle = '#3a4741'; for (let i = 0; i < 6; i++) g.fillRect(300 + i * 30, 700 - i * 50, 480 - i * 60, 40); }
    if (kind === 'basement') { g.fillStyle = 'rgba(0,0,0,.45)'; g.fillRect(0, 0, 1080, 788); }
    if (kind === 'lobby') { rr(g, 380, 520, 320, 120, 6); fs(g, '#4a3c2e', 5); }
  } else if (kind === 'elevator') {
    g.fillStyle = '#56685e'; g.fillRect(0, 0, 1080, 788); g.fillStyle = '#2d3832'; g.fillRect(0, 640, 1080, 148);
    const op = o.open || 0; rr(g, 330, 160, 420, 520, 4); fs(g, '#0b0f0e', 6); g.fillStyle = '#8f9a95'; g.fillRect(330, 160, 210 * (1 - op), 520); g.fillRect(540 + 210 * op, 160, 210 * (1 - op), 520); g.strokeStyle = OL; g.lineWidth = 6; g.strokeRect(330, 160, 420, 520);
    rr(g, 470, 70, 140, 70, 6); fs(g, '#0a0a0a', 5); g.font = '64px BB'; g.fillStyle = '#ff3b30'; g.textAlign = 'center'; g.textBaseline = 'middle'; g.fillText(o.floor || '4', 540, 108);
    if (o.shadow) { g.fillStyle = `rgba(0,0,0,${o.shadow})`; g.beginPath(); g.ellipse(540, 690, 120, 24, 0, 0, 7); g.fill(); }
  } else if (kind === 'booth') {
    g.fillStyle = '#2d3a35'; g.fillRect(0, 0, 1080, 788); rr(g, 160, 60, 760, 330, 10); fs(g, '#1c2321', 6); for (let i = 0; i < 6; i++) { rr(g, 200 + (i % 3) * 235, 90 + Math.floor(i / 3) * 150, 210, 130, 6); fs(g, '#7ea38d', 4); }
    rr(g, -20, 520, 1120, 60, 6); fs(g, '#5a4a38', 6); g.fillStyle = '#3d3226'; g.fillRect(0, 580, 1080, 300);
    if (o.man) backView(g, 540, 640, .8, { copy: true, turn: o.turn || 0, t, smile: o.smile || 0 });
  }
  g.restore();
}
// envoltura de cámara de seguridad
const CCTV = {}; const cbuf = (w, h) => (CCTV[w + 'x' + h] ||= mk(w, h));
function cctv(g, x, y, w, h, label, clockTxt, draw, small = false) {
  const c = cbuf(w, h), cg = c.getContext('2d'); cg.save(); cg.clearRect(0, 0, w, h); draw(cg); cg.restore();
  cg.save(); cg.globalCompositeOperation = 'color'; cg.fillStyle = 'rgba(120,170,140,.75)'; cg.fillRect(0, 0, w, h); cg.globalCompositeOperation = 'source-over';
  cg.fillStyle = 'rgba(0,0,0,.18)'; for (let yy = 0; yy < h; yy += small ? 3 : 6) cg.fillRect(0, yy, w, small ? 1 : 2);
  const nf = Math.floor(performance.now() / 1000 * 0 + (window.__t || 0) * 24); for (let i = 0; i < (small ? 40 : 260); i++) { cg.fillStyle = `rgba(255,255,255,${srnd(i * 13.7 + nf) * .12})`; cg.fillRect(srnd(i + nf * 3.1) * w, srnd(i * 2.3 + nf) * h, small ? 2 : 4, small ? 1 : 2); }
  const vg = cg.createRadialGradient(w / 2, h / 2, Math.min(w, h) * .3, w / 2, h / 2, Math.max(w, h) * .7); vg.addColorStop(0, 'rgba(0,0,0,0)'); vg.addColorStop(1, 'rgba(0,0,0,.6)'); cg.fillStyle = vg; cg.fillRect(0, 0, w, h);
  const fsz = small ? 18 : 44; cg.font = `${fsz}px BB`; cg.textBaseline = 'top'; cg.fillStyle = '#e8f0e8'; cg.textAlign = 'left'; cg.fillText(label, small ? 8 : 24, small ? 6 : 20);
  if (!small) { const on = Math.floor((window.__t || 0) * 2) % 2 === 0; if (on) { cg.fillStyle = '#ff3030'; cg.beginPath(); cg.arc(w - 120, 44, 12, 0, 7); cg.fill(); } cg.fillStyle = '#e8f0e8'; cg.textAlign = 'right'; cg.fillText('REC', w - 24, 20); if (clockTxt) { cg.textAlign = 'left'; cg.textBaseline = 'bottom'; cg.fillText(clockTxt, 24, h - 18); } }
  cg.restore(); g.drawImage(c, x, y); g.lineWidth = small ? 4 : 10; g.strokeStyle = OL; g.strokeRect(x, y, w, h);
}
function digiClock(g, x, y, s, txt, color = '#ff3b30') { g.save(); g.translate(x, y); g.scale(s, s); rr(g, -210, -95, 420, 190, 18); fs(g, '#0a0a0a', 8); g.font = '170px BB'; g.textAlign = 'center'; g.textBaseline = 'middle'; g.shadowColor = color; g.shadowBlur = 30; g.fillStyle = color; g.fillText(txt, 0, 10); g.restore(); }
function sheet(g, x, y, s, n, t, lt, hl = -1) { // hoja de reglas
  g.save(); g.translate(x, y); g.rotate(-.03); g.scale(s, s); rr(g, -430, -520, 860, 1040, 6); fs(g, '#ece4cf', 8);
  g.strokeStyle = 'rgba(80,110,160,.25)'; g.lineWidth = 3; for (let i = 0; i < 18; i++) { g.beginPath(); g.moveTo(-400, -420 + i * 55); g.lineTo(400, -420 + i * 55); g.stroke(); }
  g.fillStyle = '#c72b2b'; g.fillRect(-340, -520, 4, 1040); ell(g, -380, -380, 16, 16, '#2d3a35', 0); ell(g, -380, 0, 16, 16, '#2d3a35', 0); ell(g, -380, 380, 16, 16, '#2d3a35', 0);
  g.font = '62px PM'; g.fillStyle = '#1d1a16'; g.textAlign = 'left'; g.textBaseline = 'middle'; g.fillText('REGLAS DEL TURNO', -300, -440);
  const R = [['1. Ronda cada hora.', 'Todos los pisos.'], ['2. Si el ascensor sube', 'solo, no lo llames.'], ['3. A las 3:17, NO mires', 'el monitor 6.'], ['4. Si te llaman por tu', 'nombre, NO respondas.']];
  for (let i = 0; i < Math.min(n, 4); i++) { const yy = -300 + i * 205; g.font = '50px PM'; g.fillStyle = i === hl ? '#b3161b' : '#1d1a16'; g.fillText(R[i][0], -300, yy); g.fillText(R[i][1], -260, yy + 64); }
  g.restore();
}
// ---------- extras Parte 3 ----------
const MOM = {
  skin: '#d4a07c', armC: '#8a5a7a', legC: '#3d3a44', bootC: '#2a2420', torso: '#8a5a7a', tw: 104, handC: '#d4a07c',
  head: (g, p) => { ell(g, 0, -58, 26, 22, '#2a1d18', 5); ell(g, 0, 0, 42, 52, p.pale ? '#d9cfc2' : '#d4a07c');
    g.beginPath(); g.moveTo(-44, 10); g.quadraticCurveTo(-48, -62, 0, -58); g.quadraticCurveTo(48, -62, 44, 10); g.lineTo(34, -22); g.quadraticCurveTo(0, -36, -34, -22); g.closePath(); fs(g, '#2a1d18', 5);
    g.fillStyle = '#9a9a9a'; g.fillRect(-44, -18, 7, 20);
    if (p.wide) { ell(g, -15, -2, 10, 11, '#fff', 3); ell(g, 15, -2, 10, 11, '#fff', 3); g.fillStyle = OL; g.beginPath(); g.arc(-15, -2, 4, 0, 7); g.arc(15, -2, 4, 0, 7); g.fill(); } else eyes(g, -2, 15, p.blink, OL, 5);
    g.lineWidth = 4; g.strokeStyle = OL; g.beginPath(); if (p.mouth === 'o') g.ellipse(0, 26, 7, 10, 0, 0, 7); else { g.moveTo(-9, 26); g.lineTo(9, 26); } g.stroke(); },
  torsoDeco: (g, tw, th) => { poly(g, [[-34, -th + 30], [34, -th + 30], [40, 10], [-40, 10]], '#e8dcc4', 4); rr(g, -24, -th + 60, 48, 40, 6); fs(g, '#d8c9ae', 3); },
};
function kitchen(g, t, lit = 1) {
  g.fillStyle = '#c9b48f'; g.fillRect(0, 0, W, H);
  g.strokeStyle = 'rgba(0,0,0,.12)'; g.lineWidth = 3; for (let y = 700; y < 1250; y += 60) { g.beginPath(); g.moveTo(0, y); g.lineTo(W, y); g.stroke(); } for (let x = 0; x < W; x += 60) { g.beginPath(); g.moveTo(x, 700); g.lineTo(x, 1250); g.stroke(); }
  for (let i = 0; i < 4; i++) { rr(g, 40 + i * 255, 260, 235, 300, 6); fs(g, '#8a6a48', 6); ell(g, 40 + i * 255 + 200, 420, 8, 8, '#d7a93a', 3); }
  rr(g, 640, 600, 300, 300, 6); fs(g, '#f6dca0', 7); g.lineWidth = 6; g.beginPath(); g.moveTo(790, 600); g.lineTo(790, 900); g.moveTo(640, 750); g.lineTo(940, 750); g.stroke();
  const lg = g.createLinearGradient(640, 600, 300, 1500); lg.addColorStop(0, 'rgba(255,220,150,.35)'); lg.addColorStop(1, 'rgba(255,220,150,0)'); g.fillStyle = lg; g.beginPath(); g.moveTo(640, 600); g.lineTo(940, 600); g.lineTo(600, 1500); g.lineTo(100, 1500); g.fill();
  rr(g, -20, 1240, 1120, 60, 6); fs(g, '#e9e1d0', 7); g.fillStyle = '#7a5a3a'; g.fillRect(0, 1300, W, 160); g.fillStyle = '#9a8a74'; g.fillRect(0, 1460, W, H); g.lineWidth = 6; g.strokeStyle = OL; g.beginPath(); g.moveTo(0, 1460); g.lineTo(W, 1460); g.stroke();
  if (lit < 1) { g.fillStyle = `rgba(0,0,0,${1 - lit})`; g.fillRect(0, 0, W, H); }
}
function mug(g, x, y, s, rot = 0) { g.save(); g.translate(x, y); g.rotate(rot); g.scale(s, s); rr(g, -30, -40, 60, 70, 8); fs(g, '#f2efe6', 5); g.lineWidth = 6; g.strokeStyle = OL; g.beginPath(); g.arc(34, -6, 16, -1.3, 1.3); g.stroke(); g.restore(); }
function house(g, t) {
  const gr = g.createLinearGradient(0, 0, 0, H); gr.addColorStop(0, '#7aa6c9'); gr.addColorStop(.6, '#f2c48a'); gr.addColorStop(1, '#f6dca0'); g.fillStyle = gr; g.fillRect(0, 0, W, H);
  g.save(); g.shadowColor = '#fff3c4'; g.shadowBlur = 80; ell(g, 860, 380, 90, 90, '#fff1b8', 0); g.restore();
  poly(g, [[140, 760], [540, 420], [940, 760]], '#8a3a2a', 8); rr(g, 190, 760, 700, 640, 4); fs(g, '#e8d8b8', 8);
  rr(g, 250, 840, 170, 170, 4); fs(g, '#5a7a8a', 6); rr(g, 660, 840, 170, 170, 4); fs(g, '#5a7a8a', 6);
  rr(g, 470, 1060, 140, 340, 6); fs(g, '#6b4a2b', 7); ell(g, 585, 1240, 8, 8, '#d7a93a', 3);
  g.fillStyle = '#6a8a4a'; g.fillRect(0, 1400, W, H); g.lineWidth = 6; g.strokeStyle = OL; g.beginPath(); g.moveTo(0, 1400); g.lineTo(W, 1400); g.stroke();
}
function homeStairs(g, t, doorClose = 0, dark = .3) {
  g.fillStyle = '#b8a07e'; g.fillRect(0, 0, W, H);
  for (let i = 0; i < 12; i++) { const y = 1500 - i * 85, x0 = 200 + i * 22, x1 = 880 - i * 22; poly(g, [[x0, y], [x1, y], [x1 - 6, y - 85], [x0 + 6, y - 85]], i % 2 ? '#7a5a3a' : '#8a6a48', 4); }
  g.lineWidth = 12; g.strokeStyle = '#5a3d24'; g.beginPath(); g.moveTo(180, 1300); g.lineTo(450, 400); g.stroke();
  // puerta arriba
  const dx = 380, dy = 140; rr(g, dx, dy, 320, 400, 4); fs(g, '#2a2420', 7); const op = 1 - doorClose; g.fillStyle = '#ffe9b0'; g.fillRect(dx + 10, dy + 10, 300 * op, 380);
  g.save(); g.translate(dx + 10 + 300 * op, dy + 10); rr(g, 0, 0, 300 * (1 - op) + 4, 380, 4); fs(g, '#6b4a2b', 6); g.restore();
  if (dark) { g.fillStyle = `rgba(0,0,0,${dark})`; g.fillRect(0, 0, W, H); }
}
function bubble(g, x, y, w, h, lines, opt = {}) {
  g.save(); g.translate(x, y); if (opt.shake) g.translate((Math.random() - .5) * opt.shake, (Math.random() - .5) * opt.shake);
  g.beginPath(); if (opt.wobble) { for (let i = 0; i <= 40; i++) { const a = i / 40 * 6.283; const r = 1 + Math.sin(a * 9 + (window.__t || 0) * 6) * .03; g.lineTo(Math.cos(a) * w / 2 * r, Math.sin(a) * h / 2 * r); } } else g.ellipse(0, 0, w / 2, h / 2, 0, 0, 7);
  fs(g, opt.fill || '#f2efe6', 6); if (opt.tail) poly(g, [[opt.tail[0], h / 2 - 20], [opt.tail[0] + 40, h / 2 - 20], [opt.tail[1], h / 2 + 70]], opt.fill || '#f2efe6', 0);
  g.font = `${opt.size || 60}px ${opt.font || 'BB'}`; g.fillStyle = opt.color || '#1b1b1b'; g.textAlign = 'center'; g.textBaseline = 'middle'; lines.forEach((l, i) => g.fillText(l, 0, (i - (lines.length - 1) / 2) * (opt.size || 60) * 1.1));
  g.restore();
}
function raceBar(g, y, a, b, label) { // a: Tomás 0→1 ; b: copia 1→0
  g.save(); g.translate(0, y); rr(g, 80, -60, 920, 120, 60); fs(g, 'rgba(10,12,12,.88)', 6); rr(g, 470, -50, 140, 100, 12); fs(g, '#ffd21f', 5); g.font = '36px BB'; g.fillStyle = '#111'; g.textAlign = 'center'; g.textBaseline = 'middle'; g.fillText('CASETA', 540, 4);
  const tx = lerp(140, 450, a), cx = lerp(940, 630, 1 - b); g.save(); g.translate(tx, 0); g.scale(.55, .55); faceTomas(g, {}, false); g.restore(); g.save(); g.translate(cx, 0); g.scale(.55, .55); faceTomas(g, { smile: 1 }, true); g.restore();
  if (label) { g.font = '80px LG'; g.fillStyle = '#ff4a3d'; g.lineWidth = 12; g.strokeStyle = '#000'; g.strokeText(label, 540, -130); g.fillText(label, 540, -130); }
  g.restore();
}
// ---------- La grulla de papel: personajes y gráficos ----------
function star(g, x, y, R, r, fill, n = 5) { g.beginPath(); for (let i = 0; i < n * 2; i++) { const a = -Math.PI / 2 + i * Math.PI / n, q = i % 2 ? r : R; g.lineTo(x + Math.cos(a) * q, y + Math.sin(a) * q); } g.closePath(); fs(g, fill, 4); }
const JULIAN = {
  skin: '#d2a27e', armC: '#8a7a5a', legC: '#3a3a40', bootC: '#2a1e16', torso: '#8a7a5a', tw: 126, handC: '#d2a27e',
  head: (g, p) => { ell(g, 0, 0, 45, 54, '#d2a27e'); ell(g, -45, 4, 9, 13, '#d2a27e', 4); ell(g, 45, 4, 9, 13, '#d2a27e', 4);
    g.beginPath(); g.moveTo(-46, 2); g.quadraticCurveTo(-50, -60, -10, -58); g.lineTo(-8, -40); g.lineTo(8, -40); g.lineTo(10, -58); g.quadraticCurveTo(50, -60, 46, 2); g.lineTo(38, -22); g.lineTo(-38, -22); g.closePath(); fs(g, '#9a9a9a', 5);
    eyes(g, -2, 16, p.blink, OL, p.wide ? 7 : 5); g.strokeStyle = 'rgba(80,50,40,.45)'; g.lineWidth = 3; g.beginPath(); g.arc(-16, 8, 9, .3, Math.PI - .3); g.arc(16, 8, 9, .3, Math.PI - .3); g.stroke();
    g.lineWidth = 4; g.strokeStyle = OL; g.beginPath(); g.moveTo(-28, -18); g.lineTo(-6, -14); g.moveTo(28, -18); g.lineTo(6, -14); g.stroke();
    g.beginPath(); g.moveTo(-24, 20); g.quadraticCurveTo(0, 8, 24, 20); g.quadraticCurveTo(0, 28, -24, 20); fs(g, '#8d8d8d', 4);
    if (p.mouth === 'o') { g.beginPath(); g.ellipse(0, 34, 6, 8, 0, 0, 7); g.stroke(); } },
  torsoDeco: (g, tw, th) => { poly(g, [[-18, -th], [18, -th], [10, -th + 110], [-10, -th + 110]], '#e8e2d2', 0); poly(g, [[-7, -th + 8], [7, -th + 8], [9, -th + 100], [0, -th + 118], [-9, -th + 100]], '#7a1f22', 3);
    poly(g, [[-tw / 2, -th], [-16, -th], [-6, -th + 120], [-tw / 2 + 6, -th + 60]], '#9a8a68', 4); poly(g, [[tw / 2, -th], [16, -th], [6, -th + 120], [tw / 2 - 6, -th + 60]], '#9a8a68', 4);
    rr(g, -tw / 2 + 6, -40, tw - 12, 14, 4); fs(g, '#5a4a32', 3); },
};
const MATEO = {
  skin: '#d9ad88', armC: '#5a6068', legC: '#2b3036', bootC: '#e8e8e8', torso: '#5a6068', tw: 108, handC: '#d9ad88',
  head: (g, p) => { ell(g, 0, 0, 42, 52, '#d9ad88'); ell(g, -42, 4, 8, 12, '#d9ad88', 4); ell(g, 42, 4, 8, 12, '#d9ad88', 4);
    g.beginPath(); g.moveTo(-46, 0); g.quadraticCurveTo(-50, -64, 4, -62); g.quadraticCurveTo(54, -60, 46, 0); g.lineTo(40, -18); g.lineTo(26, -30); g.lineTo(10, -20); g.lineTo(-8, -32); g.lineTo(-26, -20); g.lineTo(-40, -22); g.closePath(); fs(g, '#1e1612', 5);
    eyes(g, 0, 15, p.blink, OL, 5); g.lineWidth = 4; g.strokeStyle = OL; g.beginPath(); g.arc(-15, 0, 12, 0, 7); g.moveTo(-3, 0); g.lineTo(3, 0); g.arc(15, 0, 12, Math.PI, Math.PI * 3); g.stroke();
    g.beginPath(); if (p.mouth === 'smile') g.arc(0, 22, 10, .3, Math.PI - .3); else { g.moveTo(-8, 28); g.lineTo(8, 28); } g.stroke(); },
  torsoDeco: (g, tw, th) => { g.beginPath(); g.moveTo(-30, -th); g.quadraticCurveTo(0, -th + 40, 30, -th); g.lineWidth = 4; g.strokeStyle = OL; g.stroke(); rr(g, -34, -70, 68, 40, 8); fs(g, '#4d535a', 3); g.beginPath(); g.moveTo(-10, -th + 20); g.lineTo(-12, -th + 70); g.moveTo(10, -th + 20); g.lineTo(12, -th + 70); g.stroke(); },
};
const RIVAS = {
  skin: '#c08e6c', armC: '#2f3440', legC: '#2a2e38', bootC: '#161616', torso: '#2f3440', tw: 150, handC: '#c08e6c',
  head: (g, p) => { ell(g, 0, 4, 50, 56, '#c08e6c'); ell(g, -50, 8, 9, 13, '#c08e6c', 4); ell(g, 50, 8, 9, 13, '#c08e6c', 4);
    g.beginPath(); g.moveTo(-48, -6); g.quadraticCurveTo(-46, -62, 0, -58); g.quadraticCurveTo(46, -62, 48, -6); g.lineTo(40, -26); g.lineTo(-40, -26); g.closePath(); fs(g, '#1a1a1a', 5);
    eyes(g, 0, 17, p.blink, OL, 5); g.beginPath(); g.moveTo(-28, 22); g.quadraticCurveTo(0, 6, 28, 22); g.lineTo(20, 30); g.quadraticCurveTo(0, 20, -20, 30); g.closePath(); fs(g, '#1a1a1a', 4);
    g.lineWidth = 5; g.strokeStyle = OL; g.beginPath(); g.moveTo(-30, -20); g.lineTo(-8, -16); g.moveTo(30, -20); g.lineTo(8, -16); g.stroke(); },
  torsoDeco: (g, tw, th) => { poly(g, [[-16, -th], [16, -th], [8, -th + 100], [-8, -th + 100]], '#e8e2d2', 0); poly(g, [[-6, -th + 8], [6, -th + 8], [8, -th + 92], [0, -th + 108], [-8, -th + 92]], '#1d2a4a', 3); star(g, -44, -th + 70, 16, 7, '#d7a93a'); },
};
const IGNACIO = {
  skin: '#c49270', armC: '#3d5a7a', legC: '#3d5a7a', bootC: '#2a1e16', torso: '#3d5a7a', handC: '#c49270',
  head: (g, p) => { ell(g, 0, 0, 44, 54, '#c49270'); g.beginPath(); g.moveTo(-44, -4); g.quadraticCurveTo(-44, -60, 0, -58); g.quadraticCurveTo(44, -60, 44, -4); g.lineTo(34, -30); g.lineTo(-34, -30); g.closePath(); fs(g, '#3a2a1e', 5);
    eyes(g, 0, 16, true); g.fillStyle = 'rgba(40,30,20,.3)'; g.beginPath(); g.ellipse(0, 30, 26, 16, 0, 0, 7); g.fill(); },
  torsoDeco: (g, tw, th) => { rr(g, -40, -th + 10, 80, 70, 6); fs(g, '#4a6a8a', 4); g.fillStyle = 'rgba(30,20,10,.35)'; g.beginPath(); g.ellipse(30, -60, 18, 10, .4, 0, 7); g.fill(); },
};
const CLARA = {
  skin: '#e2c0a2', armC: '#9a7ab0', legC: '#5a5060', bootC: '#3a2a2a', torso: '#9a7ab0', tw: 104, handC: '#e2c0a2',
  head: (g, p) => { ell(g, 0, -58, 26, 22, '#e6e6e6', 5); ell(g, 0, 0, 42, 52, '#e2c0a2'); g.beginPath(); g.moveTo(-44, 8); g.quadraticCurveTo(-48, -62, 0, -58); g.quadraticCurveTo(48, -62, 44, 8); g.lineTo(34, -24); g.quadraticCurveTo(0, -36, -34, -24); g.closePath(); fs(g, '#e6e6e6', 5);
    eyes(g, 0, 15, true); g.lineWidth = 3; g.strokeStyle = OL; g.beginPath(); g.arc(-15, 0, 12, 0, 7); g.arc(15, 0, 12, 0, 7); g.stroke(); },
};
// figura sentada de frente (víctimas en su silla)
function seated(g, x, y, s, sp, p = {}, chairCol = '#5a3a2a') {
  g.save(); g.translate(x, y); g.scale(s, s);
  rr(g, -110, -420, 220, 440, 24); fs(g, chairCol, 7); rr(g, -150, -120, 40, 150, 12); fs(g, chairCol, 6); rr(g, 110, -120, 40, 150, 12); fs(g, chairCol, 6);
  const tw = sp.tw || 116, th = sp.th || 190;
  for (const sx of [-1, 1]) { rr(g, sx * 30 - 24, 10, 48, 70, 20); fs(g, sp.legC, 5); limb(g, sx * 30, 70, 0, 150, 38, sp.legC, boot(sp.bootC)); }
  g.beginPath(); g.moveTo(-tw / 2, -th); g.lineTo(tw / 2, -th); g.lineTo(tw / 2 - 6, 30); g.lineTo(-tw / 2 + 6, 30); g.closePath(); fs(g, sp.torso); if (sp.torsoDeco) sp.torsoDeco(g, tw, th);
  g.save(); g.translate(0, -th - 50); g.rotate(p.tilt ?? .18); sp.head(g, p); g.restore();
  limb(g, -tw / 2 + 10, -th + 20, .5, 160, 30, sp.armC, hand(sp.handC || sp.skin)); limb(g, tw / 2 - 10, -th + 20, -.5, 160, 30, sp.armC, hand(sp.handC || sp.skin));
  if (p.holdR) p.holdR(g, tw / 2 - 10 + Math.sin(.5) * 160, -th + 20 + Math.cos(.5) * 160 + 10);
  g.restore();
}
// grulla de papel
function crane(g, x, y, s, { num = null, rot = 0, glow = 0, tailHi = 0 } = {}) {
  g.save(); g.translate(x, y); g.rotate(rot); g.scale(s, s);
  if (glow) { g.save(); g.shadowColor = '#fff6d8'; g.shadowBlur = 50 * glow; poly(g, [[-200, 10], [0, -40], [200, 10], [0, 60]], 'rgba(255,255,255,.01)', 0); g.restore(); }
  poly(g, [[-30, 20], [-230, -20], [-80, 60]], '#efe9da', 5); // cola
  poly(g, [[30, 20], [190, -150], [210, -170], [200, -140], [70, 50]], '#e6dfcc', 5); // cuello
  poly(g, [[195, -160], [250, -150], [205, -140]], '#d9d1bc', 4); // cabeza
  poly(g, [[-90, 30], [0, -10], [90, 30], [0, 90]], '#f4efe2', 6); // cuerpo
  poly(g, [[-10, 0], [-160, -220], [60, 10]], '#faf6ec', 6); // ala izquierda
  poly(g, [[10, 10], [160, -120], [90, 40]], '#ece5d2', 5); // ala derecha
  g.strokeStyle = 'rgba(0,0,0,.15)'; g.lineWidth = 3; g.beginPath(); g.moveTo(-10, 0); g.lineTo(-100, -130); g.moveTo(-90, 30); g.lineTo(0, 90); g.stroke();
  if (tailHi) { g.save(); g.strokeStyle = `rgba(255,40,40,${tailHi})`; g.lineWidth = 7; g.beginPath(); g.moveTo(-200, -10); g.lineTo(-150, 22); g.moveTo(-180, 4); g.lineTo(-130, 34); g.stroke(); g.restore(); }
  if (num) { g.save(); g.translate(-75, -90); g.rotate(-.45); g.font = '86px PM'; g.fillStyle = '#1d3fa8'; g.textAlign = 'center'; g.textBaseline = 'middle'; g.fillText(num, 0, 0); g.restore(); }
  g.restore();
}
// ficha de personaje
function dossier(g, x, y, k, face, lines, opt = {}) {
  if (k <= 0) return; g.save(); g.translate(x, y); g.rotate(opt.rot ?? -.03); g.scale(k, k);
  rr(g, -400, -190, 800, 380, 12); fs(g, '#ece4cf', 7); rr(g, -370, -160, 230, 320, 6); fs(g, '#3a4048', 5);
  g.save(); g.beginPath(); g.rect(-370, -160, 230, 320); g.clip(); g.translate(-255, 30); g.scale(1.6, 1.6); face(g, {}); g.restore();
  g.textAlign = 'left'; g.textBaseline = 'middle'; lines.forEach(([txt, col, sz], i) => { g.font = `${sz || 48}px BB`; g.fillStyle = col || '#1b1b1b'; g.fillText(txt, -110, -110 + i * 66); });
  g.fillStyle = '#c4161c'; g.font = '30px BB'; g.fillText(opt.tag || 'EXPEDIENTE', 170, -150);
  g.restore();
}
// tarjeta de pregunta al público
function question(g, t, t0, title, opts, tc = []) {
  const k = eback(prog(t, t0, t0 + .3)); if (k <= 0) return;
  g.save(); g.translate(W / 2, 800); g.scale(k, k); rr(g, -460, -430, 920, 860, 30); fs(g, '#12161c', 8);
  g.font = '92px LG'; g.textAlign = 'center'; g.textBaseline = 'middle'; g.fillStyle = '#ffd21f'; g.lineWidth = 12; g.strokeStyle = '#000'; g.strokeText(title, 0, -330); g.fillText(title, 0, -330);
  opts.forEach(([letter, txt], i) => { const kk = eback(prog(t, tc[i] ?? t0, (tc[i] ?? t0) + .25)); if (kk <= 0) return; g.save(); g.translate(0, -170 + i * 170); g.scale(kk, kk);
    rr(g, -400, -64, 800, 128, 64); fs(g, '#f2efe6', 6); ell(g, -330, 0, 46, 46, ['#47c6ff', '#ffb52e', '#ff4a3d'][i], 5);
    g.font = '64px LG'; g.fillStyle = '#fff'; g.fillText(letter, -330, 4); g.font = '52px BB'; g.fillStyle = '#1b1b1b'; g.textAlign = 'left'; g.fillText(txt, -260, 4); g.textAlign = 'center'; g.restore(); });
  g.restore();
}
function commentIcon(g, x, y, k) { if (k <= 0) return; g.save(); g.translate(x, y); g.scale(k, k); rr(g, -150, -70, 300, 140, 40); fs(g, '#fff', 6); poly(g, [[-80, 66], [-30, 66], [-90, 120]], '#fff', 0); g.font = '56px LG'; g.fillStyle = '#ff2b6a'; g.textAlign = 'center'; g.textBaseline = 'middle'; g.fillText('COMENTA', 0, 4); g.restore(); }
// fondos
function rain(g, t, a = .35, n = 160) { g.strokeStyle = `rgba(190,210,230,${a})`; g.lineWidth = 3; g.beginPath(); for (let i = 0; i < n; i++) { const x = (srnd(i) * W + t * 120) % W, y = (srnd(i + 7) * H + t * 1600 * (.8 + srnd(i + 3) * .4)) % H; g.moveTo(x, y); g.lineTo(x - 10, y + 46); } g.stroke(); }
function office(g, t, dark = 0) {
  g.fillStyle = '#2a2f36'; g.fillRect(0, 0, W, H);
  rr(g, 560, 220, 440, 560, 6); fs(g, '#1a2028', 7); g.fillStyle = 'rgba(255,214,150,.18)'; for (let i = 0; i < 12; i++) g.fillRect(570, 240 + i * 45, 420, 22);
  rr(g, 70, 260, 440, 420, 8); fs(g, '#a07a50', 7); [[120, 300], [300, 320], [180, 470], [370, 500]].forEach(([x, y], i) => { rr(g, x, y, 100, 120, 3); fs(g, '#ece4cf', 3); ell(g, x + 50, y - 4, 8, 8, '#c4161c', 0); });
  g.strokeStyle = '#c4161c'; g.lineWidth = 3; g.beginPath(); g.moveTo(170, 300); g.lineTo(350, 320); g.lineTo(230, 470); g.lineTo(420, 500); g.stroke();
  g.save(); g.shadowColor = '#ffcf7a'; g.shadowBlur = 60; poly(g, [[760, 980], [860, 980], [830, 930], [790, 930]], '#2a5a3a', 5); g.restore();
  const lg = g.createRadialGradient(810, 1060, 0, 810, 1060, 420); lg.addColorStop(0, 'rgba(255,200,120,.35)'); lg.addColorStop(1, 'rgba(0,0,0,0)'); g.fillStyle = lg; g.fillRect(0, 600, W, 900);
  rr(g, -20, 1080, 1120, 60, 6); fs(g, '#4a3424', 8); g.fillStyle = '#2a1e14'; g.fillRect(0, 1140, W, 800); g.lineWidth = 6; g.strokeStyle = OL; g.beginPath(); g.moveTo(0, 1140); g.lineTo(W, 1140); g.stroke();
  for (let i = 0; i < 3; i++) { rr(g, 120 + i * 30, 1040 - i * 18, 260, 40, 3); fs(g, ['#c9b48f', '#b8a07a', '#d6c4a0'][i], 4); }
  if (dark) { g.fillStyle = `rgba(0,0,0,${dark})`; g.fillRect(0, 0, W, H); }
}
function workshop(g, t, dark = 0) {
  g.fillStyle = '#3a3e3a'; g.fillRect(0, 0, W, H);
  rr(g, 60, 220, 960, 500, 6); fs(g, '#5a5040', 6); g.fillStyle = 'rgba(0,0,0,.35)'; for (let y = 250; y < 700; y += 40) for (let x = 90; x < 1000; x += 40) g.fillRect(x, y, 6, 6);
  [[160, 300, 'w'], [300, 280, 'h'], [460, 310, 'w'], [640, 290, 's'], [820, 300, 'h']].forEach(([x, y, k]) => { g.save(); g.translate(x, y); if (k === 'w') { rr(g, -10, 0, 20, 160, 6); fs(g, '#9aa0a6', 4); ell(g, 0, 0, 26, 18, '#9aa0a6', 4); } else if (k === 'h') { rr(g, -8, 20, 16, 150, 6); fs(g, '#6b4a2b', 4); rr(g, -40, 0, 80, 34, 6); fs(g, '#5a5f66', 4); } else { rr(g, -6, 0, 12, 180, 6); fs(g, '#c4161c', 4); } g.restore(); });
  rr(g, 0, 820, W, 70, 4); fs(g, '#6b4a2b', 7); g.fillStyle = '#2a2622'; g.fillRect(0, 890, W, H); g.fillStyle = 'rgba(0,0,0,.25)'; g.beginPath(); g.ellipse(700, 1500, 300, 60, 0, 0, 7); g.fill();
  if (dark) { g.fillStyle = `rgba(0,0,0,${dark})`; g.fillRect(0, 0, W, H); }
}
function ledger(g, x, y, s, t, tear = 1) {
  g.save(); g.translate(x, y); g.scale(s, s); rr(g, -460, -320, 920, 640, 10); fs(g, '#5a3a22', 8);
  rr(g, -440, -300, 430, 600, 4); fs(g, '#efe6cf', 4); rr(g, 10, -300, 430, 600, 4); fs(g, '#efe6cf', 4);
  g.font = '40px BB'; g.fillStyle = '#1b2a6a'; g.textAlign = 'left'; g.fillText('MARZO · HACE 6 AÑOS', -420, -250);
  g.fillStyle = 'rgba(30,40,90,.55)'; for (let i = 0; i < 9; i++) { g.fillRect(-420, -200 + i * 52, 220 + (i * 37) % 140, 8); g.fillRect(-140, -200 + i * 52, 100, 8); }
  if (tear) { g.fillStyle = '#5a3a22'; g.beginPath(); g.moveTo(20, -300); for (let i = 0; i <= 24; i++) g.lineTo(20 + (i % 2 ? 22 : 6), -300 + i * 25); g.lineTo(440, 300); g.lineTo(440, -300); g.fill(); g.strokeStyle = '#e9dfc4'; g.lineWidth = 6; g.beginPath(); g.moveTo(20, -300); for (let i = 0; i <= 24; i++) g.lineTo(20 + (i % 2 ? 22 : 6), -300 + i * 25); g.stroke(); }
  g.restore();
}
function nightKitchen(g, t, lamp = 1) {
  kitchen(g, t, .45); g.fillStyle = 'rgba(10,20,45,.35)'; g.fillRect(0, 0, W, H);
  g.fillStyle = '#0d1424'; g.fillRect(646, 606, 288, 288); g.lineWidth = 6; g.strokeStyle = OL; g.beginPath(); g.moveTo(790, 600); g.lineTo(790, 900); g.moveTo(640, 750); g.lineTo(940, 750); g.stroke(); rain(g, t, .15, 30);
  if (lamp) { g.save(); g.lineWidth = 4; g.strokeStyle = '#222'; g.beginPath(); g.moveTo(540, 0); g.lineTo(540, 560); g.stroke(); poly(g, [[470, 560], [610, 560], [580, 520], [500, 520]], '#3a3a3a', 5); g.restore();
    const lg = g.createRadialGradient(540, 980, 0, 540, 980, 640); lg.addColorStop(0, `rgba(255,200,120,${.42 * lamp})`); lg.addColorStop(1, 'rgba(0,0,0,0)'); g.fillStyle = lg; g.fillRect(0, 300, W, 1300); }
}
function table(g, y = 1180) { rr(g, 100, y, 880, 50, 8); fs(g, '#6b4a2b', 7); g.fillStyle = '#4a3220'; g.fillRect(150, y + 50, 30, 400); g.fillRect(900, y + 50, 30, 400); }
function emptyChair(g, x, y, s = 1) { g.save(); g.translate(x, y); g.scale(s, s); rr(g, -90, -300, 180, 300, 14); fs(g, '#5a3a22', 6); rr(g, -100, -10, 200, 40, 8); fs(g, '#5a3a22', 6); g.restore(); }
function photoFrame(g, x, y, s, face) { g.save(); g.translate(x, y); g.scale(s, s); rr(g, -80, -100, 160, 200, 6); fs(g, '#b8862f', 6); rr(g, -62, -82, 124, 164, 4); fs(g, '#d8d0c0', 3); g.save(); g.beginPath(); g.rect(-62, -82, 124, 164); g.clip(); g.translate(0, 10); g.scale(.9, .9); face(g, {}); g.restore(); g.restore(); }
const ELENA_HEAD = (g, p) => { g.beginPath(); g.moveTo(-50, 70); g.quadraticCurveTo(-60, -64, 0, -60); g.quadraticCurveTo(60, -64, 50, 70); g.closePath(); fs(g, '#5a3220', 5); ell(g, 0, 0, 40, 50, '#e2b48c'); eyes(g, 0, 15, false); g.lineWidth = 4; g.strokeStyle = OL; g.beginPath(); g.arc(0, 20, 12, .3, Math.PI - .3); g.stroke(); };
// ---------- extras Capítulo 2 ----------
const SALCEDO = {
  skin: '#b98a66', armC: '#2a2a2a', legC: '#3a3f4a', bootC: '#161616', torso: '#2a2a2a', tw: 136, handC: '#b98a66',
  head: (g, p) => { ell(g, 0, 0, 46, 54, '#b98a66'); ell(g, -46, 4, 9, 13, '#b98a66', 4); ell(g, 46, 4, 9, 13, '#b98a66', 4);
    g.fillStyle = 'rgba(30,20,10,.35)'; g.beginPath(); g.ellipse(0, -30, 42, 22, 0, Math.PI, 0); g.fill();
    eyes(g, -2, 16, p.blink, OL, 5); g.lineWidth = 5; g.strokeStyle = OL; g.beginPath(); g.moveTo(-30, -20); g.lineTo(-6, -12); g.moveTo(30, -20); g.lineTo(6, -12); g.stroke();
    g.strokeStyle = '#8a4a3a'; g.lineWidth = 4; g.beginPath(); g.moveTo(22, -8); g.lineTo(34, 18); g.stroke();
    g.strokeStyle = OL; g.lineWidth = 4; g.beginPath(); if (p.mouth === 'smile') g.arc(4, 18, 14, .25, Math.PI - .6); else if (p.mouth === 'yell') { g.ellipse(0, 28, 14, 12, 0, 0, 7); } else { g.moveTo(-10, 28); g.lineTo(10, 28); } g.stroke();
    g.fillStyle = 'rgba(40,40,40,.35)'; g.fillRect(-28, 26, 56, 26); },
  torsoDeco: (g, tw, th) => { g.lineWidth = 4; g.strokeStyle = OL; g.beginPath(); g.moveTo(0, -th); g.lineTo(0, 8); g.stroke(); g.strokeStyle = '#3a5a8a'; g.lineWidth = 3; g.beginPath(); g.moveTo(-tw / 2 - 2, -th + 120); g.lineTo(-tw / 2 + 14, -th + 140); g.stroke(); },
};
const LAGOS = {
  skin: '#e0b896', armC: '#1d2a4a', legC: '#1d2a4a', bootC: '#111', torso: '#1d2a4a', tw: 116, handC: '#e0b896',
  head: (g, p) => { ell(g, 0, 0, 43, 52, '#e0b896'); g.beginPath(); g.moveTo(-45, -4); g.quadraticCurveTo(-40, -66, 20, -60); g.quadraticCurveTo(52, -50, 45, -4); g.lineTo(36, -28); g.quadraticCurveTo(-10, -40, -36, -26); g.closePath(); fs(g, '#2a2a2a', 5);
    eyes(g, 0, 15, true); g.lineWidth = 3; g.strokeStyle = OL; g.strokeRect(-28, -10, 22, 16); g.strokeRect(6, -10, 22, 16); g.beginPath(); g.moveTo(-6, -2); g.lineTo(6, -2); g.stroke(); },
  torsoDeco: (g, tw, th) => { poly(g, [[-16, -th], [16, -th], [8, -th + 100], [-8, -th + 100]], '#f2f2f2', 0); poly(g, [[-6, -th + 8], [6, -th + 8], [8, -th + 92], [0, -th + 108], [-8, -th + 92]], '#8a1a1a', 3); },
};
function interrogation(g, t, dark = 0) {
  g.fillStyle = '#4a4e4a'; g.fillRect(0, 0, W, H); g.fillStyle = 'rgba(0,0,0,.12)'; for (let y = 0; y < 1200; y += 80) g.fillRect(0, y, W, 4);
  rr(g, 120, 260, 840, 420, 6); fs(g, '#1a2024', 8); g.fillStyle = 'rgba(160,190,200,.12)'; poly(g, [[140, 280], [420, 280], [200, 660], [140, 660]], 'rgba(160,190,200,.12)', 0);
  g.lineWidth = 4; g.strokeStyle = '#222'; g.beginPath(); g.moveTo(540, 0); g.lineTo(540, 760); g.stroke(); poly(g, [[440, 760], [640, 760], [600, 700], [480, 700]], '#2f2f2f', 5);
  const lg = g.createLinearGradient(0, 760, 0, 1500); lg.addColorStop(0, 'rgba(255,240,200,.35)'); lg.addColorStop(1, 'rgba(255,240,200,0)'); g.fillStyle = lg; g.beginPath(); g.moveTo(450, 760); g.lineTo(630, 760); g.lineTo(980, 1500); g.lineTo(100, 1500); g.fill();
  g.fillStyle = '#2a2c2e'; g.fillRect(0, 1240, W, H); rr(g, 160, 1160, 760, 50, 6); fs(g, '#5a5f66', 7); g.fillStyle = '#3a3f46'; g.fillRect(200, 1210, 26, 300); g.fillRect(854, 1210, 26, 300);
  if (dark) { g.fillStyle = `rgba(0,0,0,${dark})`; g.fillRect(0, 0, W, H); }
}
function mugshot(g, x, y, k, face, name, lines) {
  if (k <= 0) return; g.save(); g.translate(x, y); g.rotate(-.03); g.scale(k, k);
  rr(g, -420, -300, 840, 600, 10); fs(g, '#e8e2d2', 7); rr(g, -390, -270, 380, 470, 4); fs(g, '#cfd2d4', 4);
  g.strokeStyle = 'rgba(0,0,0,.35)'; g.lineWidth = 3; g.font = '22px BB'; g.fillStyle = '#333'; g.textAlign = 'left'; for (let i = 0; i < 9; i++) { const yy = -250 + i * 52; g.beginPath(); g.moveTo(-390, yy); g.lineTo(-330, yy); g.stroke(); g.fillText(`${2 - i * .1 > 0 ? (2 - i * .1).toFixed(1) : ''}`, -380, yy - 6); }
  g.save(); g.beginPath(); g.rect(-390, -270, 380, 470); g.clip(); g.translate(-200, -20); g.scale(2.2, 2.2); face(g, {}); g.restore();
  rr(g, -360, 130, 320, 60, 4); fs(g, '#1b1b1b', 3); g.font = '34px BB'; g.fillStyle = '#fff'; g.textAlign = 'center'; g.fillText('N° 4417-B', -200, 172);
  g.textAlign = 'left'; g.font = '62px BB'; g.fillStyle = '#1b1b1b'; g.fillText(name, 20, -200); lines.forEach(([s, c], i) => { if (!s) return; g.font = '46px BB'; g.fillStyle = c || '#3a3a3a'; g.fillText(s, 20, -120 + i * 70); });
  g.restore();
}
function pharmacy(g, t, empties = 0) {
  g.fillStyle = '#dfe6e8'; g.fillRect(0, 0, W, H); g.fillStyle = '#c4ced2'; g.fillRect(0, 1250, W, H);
  for (let r = 0; r < 5; r++) { rr(g, 80, 260 + r * 190, 920, 24, 4); fs(g, '#8a969c', 5);
    for (let c = 0; c < 10; c++) { const idx = r * 10 + c; const isEmpty = [12, 13, 14, 15, 16, 17].indexOf(idx) >= 0 && empties > ([12, 13, 14, 15, 16, 17].indexOf(idx)); const x = 120 + c * 88, y = 260 + r * 190;
      if (isEmpty) { g.strokeStyle = '#ff2b2b'; g.lineWidth = 6; g.setLineDash([10, 8]); g.strokeRect(x - 26, y - 130, 52, 126); g.setLineDash([]); continue; }
      rr(g, x - 22, y - 120, 44, 116, 10); fs(g, r === 1 ? '#e8f4f8' : ['#f2e8c8', '#e8d0d0', '#d8e8d0', '#e0e0f0'][r % 4], 4); rr(g, x - 14, y - 136, 28, 20, 4); fs(g, r === 1 ? '#c4161c' : '#555', 3); } }
}
function claraRoom(g, t) {
  g.fillStyle = '#5a4a5e'; g.fillRect(0, 0, W, H); g.fillStyle = 'rgba(255,255,255,.04)'; for (let x = 0; x < W; x += 70) g.fillRect(x, 0, 26, 1150);
  rr(g, 620, 280, 300, 360, 6); fs(g, '#1a2030', 7); g.fillStyle = 'rgba(200,220,255,.12)'; g.fillRect(630, 290, 280, 340);
  rr(g, 520, 820, 600, 340, 20); fs(g, '#d8cfe6', 7); rr(g, 520, 760, 120, 120, 30); fs(g, '#f2efe6', 6);
  rr(g, 120, 900, 320, 260, 6); fs(g, '#6b4a2b', 7); g.fillStyle = '#3d2a18'; g.fillRect(120, 1160, 320, 80);
  g.save(); g.shadowColor = '#ffcf7a'; g.shadowBlur = 50; poly(g, [[190, 900], [290, 900], [270, 820], [210, 820]], '#e8d8a8', 5); g.restore();
  rr(g, 300, 850, 110, 60, 6); fs(g, '#2a1a12', 5); g.fillStyle = '#d7a93a'; g.fillRect(350, 862, 8, 36); g.fillRect(338, 874, 32, 8);
  g.fillStyle = '#4a3a2a'; g.fillRect(0, 1240, W, H); g.lineWidth = 6; g.strokeStyle = OL; g.beginPath(); g.moveTo(0, 1240); g.lineTo(W, 1240); g.stroke();
}
function courthousePhoto(g, x, y, s, back = false, t = 0) {
  g.save(); g.translate(x, y); g.scale(s, s); rr(g, -300, -220, 600, 440, 6); fs(g, back ? '#ece4cf' : '#f4efe2', 7);
  if (!back) { rr(g, -270, -190, 540, 330, 2); fs(g, '#a89a80', 3); poly(g, [[-200, -40], [0, -150], [200, -40]], '#8a7c64', 3); for (let i = 0; i < 5; i++) { g.fillStyle = '#c8bca0'; g.fillRect(-170 + i * 80, -30, 30, 150); } g.fillStyle = '#6a5c44'; g.fillRect(-210, 120, 420, 20);
    g.save(); g.translate(0, 130); g.scale(.55, .55); figure(g, 0, -60, 1, CLARA, { t: 0, blink: false }); g.restore(); g.fillStyle = 'rgba(120,90,40,.25)'; g.fillRect(-270, -190, 540, 330); }
  else { g.font = '70px PM'; g.fillStyle = '#1d3fa8'; g.textAlign = 'center'; g.textBaseline = 'middle'; g.rotate(-.05); g.fillText('Por fin terminó', 0, 0); }
  g.restore();
}
function lawOffice(g, t) {
  g.fillStyle = '#3a2e26'; g.fillRect(0, 0, W, H);
  for (let s = 0; s < 4; s++) { rr(g, 60, 260 + s * 160, 420, 20, 4); fs(g, '#5a3a22', 5); for (let b = 0; b < 9; b++) { rr(g, 76 + b * 44, 140 + s * 160, 38, 118, 3); fs(g, ['#6a1a1a', '#1a3a5a', '#2a4a2a', '#5a4a1a'][(b + s) % 4], 3); } }
  rr(g, 620, 300, 300, 220, 6); fs(g, '#b8862f', 6); rr(g, 645, 325, 250, 170, 3); fs(g, '#efe6cf', 3); g.font = '30px CZ'; g.fillStyle = '#1b1b1b'; g.textAlign = 'center'; g.fillText('DIPLOMA', 770, 420);
  g.fillStyle = '#2a201a'; g.fillRect(0, 1250, W, H); }
function listCard(g, t, k, items) {
  if (k <= 0) return; g.save(); g.translate(W / 2, 820); g.rotate(-.02); g.scale(k, k);
  rr(g, -400, -480, 800, 960, 8); fs(g, '#ece4cf', 8); g.font = '80px BB'; g.fillStyle = '#b3161b'; g.textAlign = 'center'; g.fillText('LA LISTA', 0, -370);
  items.forEach(([n, t0, cross], i) => { if (t < t0) return; const y = -240 + i * 130; g.font = '60px PM'; g.textAlign = 'left'; g.textBaseline = 'middle'; g.fillStyle = '#1b1b1b'; g.fillText(`${i + 1}. ${n}`, -320, y);
    if (cross) { const c = prog(t, t0 + .2, t0 + .5); g.strokeStyle = '#c4161c'; g.lineWidth = 9; g.beginPath(); g.moveTo(-330, y); g.lineTo(-330 + 640 * c, y); g.stroke(); } });
  g.restore();
}

function car(g, x, y, s, dust = 1, col = '#7a2f2a') {
  g.save(); g.translate(x, y); g.scale(s, s);
  poly(g, [[-330, 0], [-330, -90], [-200, -110], [-120, -190], [140, -190], [230, -110], [330, -90], [330, 0]], col, 8);
  poly(g, [[-100, -175], [0, -175], [0, -115], [-170, -115]], '#26302e', 5); poly(g, [[20, -175], [130, -175], [200, -115], [20, -115]], '#26302e', 5);
  ell(g, -190, 0, 62, 62, '#1b1b1b', 7); ell(g, 190, 0, 62, 62, '#1b1b1b', 7); ell(g, -190, 0, 24, 24, '#8f8f8f', 5); ell(g, 190, 0, 24, 24, '#8f8f8f', 5);
  if (dust) { g.fillStyle = `rgba(170,160,140,${.45 * dust})`; g.beginPath(); g.moveTo(-330, -90); g.lineTo(-200, -110); g.lineTo(-120, -190); g.lineTo(140, -190); g.lineTo(230, -110); g.lineTo(330, -90); g.lineTo(330, -60); g.lineTo(-330, -60); g.fill();
    for (let i = 0; i < 40; i++) { g.fillStyle = 'rgba(200,190,170,.35)'; g.fillRect(-320 + srnd(i) * 640, -180 + srnd(i + 4) * 170, 6, 3); }
    g.save(); g.translate(60, -150); g.rotate(-.05); g.font = '30px PM'; g.fillStyle = 'rgba(60,50,40,.7)'; g.fillText('LÁVAME', 0, 0); g.restore(); }
  g.restore();
}
// ---------- extras Capítulo 3 ----------
function caseFile(g, x, y, s, t, hl = []) { // expediente de Elena
  g.save(); g.translate(x, y); g.rotate(-.02); g.scale(s, s);
  rr(g, -440, -560, 880, 1120, 8); fs(g, '#e9dfc4', 8); g.font = '58px BB'; g.fillStyle = '#1b1b1b'; g.textAlign = 'center'; g.fillText('EXPEDIENTE: ELENA FERRER', 0, -470); g.fillRect(-380, -440, 760, 5);
  g.font = '40px BB'; g.textAlign = 'left'; g.fillStyle = '#5a4a3a'; g.fillText('DECLARARON ESA NOCHE:', -380, -370);
  const names = ['MARCOS PEÑA – VECINO', 'CLARA MONTES – ENFERMERA', 'LUISA ROJAS – TAXISTA', 'ANDRÉS LAGOS – ABOGADO', 'JORGE DÍAZ – PEATÓN'];
  names.forEach((n, i) => { const yy = -290 + i * 90; if (hl.includes(i)) { g.fillStyle = 'rgba(255,210,31,.6)'; g.fillRect(-390, yy - 36, 700, 60); } g.fillStyle = '#1b1b1b'; g.font = '46px BB'; g.fillText(n, -380, yy); });
  g.fillStyle = 'rgba(30,30,30,.35)'; for (let i = 0; i < 5; i++) g.fillRect(-380, 200 + i * 60, 760 - (i % 2) * 140, 22);
  g.restore();
}
function rubbing(g, x, y, s, t, t0, t1) { // hoja con calco a lápiz
  g.save(); g.translate(x, y); g.rotate(.02); g.scale(s, s); rr(g, -420, -420, 840, 840, 4); fs(g, '#efe6cf', 7);
  const k = prog(t, t0, t1); const L = ['Reparación urgente.', 'Sedán gris.', 'Golpe en el frente.', 'Pagado en efectivo.', 'Sin factura.'];
  g.save(); g.beginPath(); g.rect(-420, -420, 840 * k, 840); g.clip(); g.fillStyle = '#7a7a80'; for (let i = 0; i < 260; i++) { const yy = -400 + (i * 37) % 800, xx = -400 + (i * 113) % 800; g.fillRect(xx, yy, 60, 6); }
  g.fillStyle = 'rgba(90,90,96,.55)'; g.fillRect(-420, -420, 840, 840); g.font = '54px PM'; g.fillStyle = '#efe6cf'; g.textAlign = 'left'; g.textBaseline = 'middle'; L.forEach((l, i) => g.fillText(l, -360, -300 + i * 100));
  g.restore();
  if (k > 0 && k < 1) { g.save(); g.translate(-420 + 840 * k, Math.sin(t * 14) * 200); g.rotate(.6); rr(g, -14, -150, 28, 260, 6); fs(g, '#f2c53d', 5); poly(g, [[-14, 110], [14, 110], [0, 150]], '#e8c9a0', 4); g.restore(); }
  g.restore();
}
function plate(g, x, y, k, txt = 'GXR · 4417') { if (k <= 0) return; g.save(); g.translate(x, y); g.scale(k, k); rr(g, -300, -100, 600, 200, 20); fs(g, '#f2f2f2', 8); rr(g, -280, -80, 560, 160, 14); fs(g, '#f2f2f2', 4); g.font = '110px BB'; g.fillStyle = '#1b1b1b'; g.textAlign = 'center'; g.textBaseline = 'middle'; g.fillText(txt, 0, 8); g.restore(); }
function screen(g, t, t0) {
  rr(g, 90, 360, 900, 700, 20); fs(g, '#1b1f24', 9); rr(g, 120, 390, 840, 640, 8); fs(g, '#0d2a3a', 4);
  g.font = '44px BB'; g.fillStyle = '#7fd8ff'; g.textAlign = 'left'; g.fillText('SISTEMA DE REGISTRO VEHICULAR', 160, 450); g.fillText('MATRÍCULA: GXR · 4417', 160, 520);
  const k = prog(t, t0, t0 + 1.6); rr(g, 160, 580, 760, 40, 20); fs(g, '#123', 3); rr(g, 166, 586, 748 * k, 28, 14); fs(g, '#47c6ff', 0);
  if (k >= 1) { g.fillStyle = '#e8f0e8'; g.font = '40px BB'; g.fillText('DUEÑO (HACE 6 AÑOS):', 160, 690); }
  rr(g, 470, 1060, 140, 120, 6); fs(g, '#2a2e34', 6); rr(g, 340, 1170, 400, 30, 10); fs(g, '#2a2e34', 6);
}
function livingRoom(g, t, lamp = 0) {
  g.fillStyle = '#141a24'; g.fillRect(0, 0, W, H); rr(g, 640, 300, 320, 420, 6); fs(g, '#0a1020', 7); rain(g, t, .12, 30);
  g.fillStyle = 'rgba(150,180,220,.12)'; poly(g, [[640, 300], [960, 300], [700, 1500], [200, 1500]], 'rgba(150,180,220,.08)', 0);
  rr(g, 140, 980, 800, 260, 40); fs(g, '#3a2a3a', 7); rr(g, 140, 860, 140, 380, 40); fs(g, '#3a2a3a', 6); rr(g, 800, 860, 140, 380, 40); fs(g, '#3a2a3a', 6);
  g.fillStyle = '#1a1410'; g.fillRect(0, 1300, W, H); g.lineWidth = 6; g.strokeStyle = OL; g.beginPath(); g.moveTo(0, 1300); g.lineTo(W, 1300); g.stroke();
  if (lamp) { const lg = g.createRadialGradient(540, 900, 0, 540, 900, 600); lg.addColorStop(0, `rgba(255,200,120,${.3 * lamp})`); lg.addColorStop(1, 'rgba(0,0,0,0)'); g.fillStyle = lg; g.fillRect(0, 300, W, 1300); }
}
function phoneScreen(g, x, y, s, t, sender, msg, k = 1) {
  g.save(); g.translate(x, y); g.scale(s, s); rr(g, -280, -520, 560, 1040, 50); fs(g, '#111', 8); rr(g, -250, -470, 500, 940, 20); fs(g, '#1d232b', 0);
  g.font = '40px BB'; g.fillStyle = '#e8f0e8'; g.textAlign = 'center'; g.fillText(sender, 0, -400); g.font = '30px BB'; g.fillStyle = '#8a9aa8'; g.fillText('23:00', 0, -350);
  if (k > 0) { g.save(); g.scale(k, k); rr(g, -220, -280, 400, 160, 30); fs(g, '#2d3a48', 0); g.font = '46px BB'; g.fillStyle = '#fff'; g.textAlign = 'left'; g.textBaseline = 'middle'; msg.forEach((m, i) => g.fillText(m, -190, -230 + i * 56)); g.restore(); }
  g.restore();
}
function windshield(g, t) {
  g.fillStyle = '#05070a'; g.fillRect(0, 0, W, H); const gr = g.createLinearGradient(0, 300, 0, 1200); gr.addColorStop(0, '#0d1420'); gr.addColorStop(1, '#1a2230'); g.fillStyle = gr; g.fillRect(60, 300, 960, 900);
  for (let i = 0; i < 6; i++) { const z = ((t * .5 + i / 6) % 1); const x = 540 + (i % 2 ? 1 : -1) * z * 500; g.save(); g.shadowColor = '#ffcf7a'; g.shadowBlur = 30; ell(g, x, 700 - z * 100, 10 + z * 20, 6 + z * 10, '#ffcf7a', 0); g.restore(); }
  g.fillStyle = '#e8e2d0'; for (let i = 0; i < 6; i++) { const z = ((t * .8 + i / 6) % 1); g.fillRect(540 - 6 - z * 12, 760 + z * 440, 12 + z * 24, 30 + z * 60); }
  for (let i = 0; i < 70; i++) { const x = 80 + srnd(i) * 920, y = 320 + ((srnd(i + 3) * 860 + t * 60 * (1 + srnd(i))) % 860); ell(g, x, y, 4, 7, 'rgba(200,220,240,.45)', 0); }
  const a = Math.sin(t * 3) * .9; for (const px of [320, 760]) { g.save(); g.translate(px, 1220); g.rotate(-1.57 + a); rr(g, -8, -480, 16, 480, 8); fs(g, '#111', 4); g.restore(); }
  rr(g, 0, 1200, W, 720, 0); fs(g, '#121418', 0); ell(g, 300, 1450, 220, 220, '#1d2026', 10); ell(g, 300, 1450, 60, 60, '#2a2e34', 6);
}
function recorder(g, x, y, s, t) { g.save(); g.translate(x, y); g.scale(s, s); rr(g, -180, -110, 360, 220, 20); fs(g, '#2a2a2a', 7); ell(g, -70, -10, 46, 46, '#444', 5); ell(g, 70, -10, 46, 46, '#444', 5); rr(g, -120, 60, 240, 30, 8); fs(g, '#555', 4);
  if (Math.floor(t * 2) % 2 === 0) { g.save(); g.shadowColor = '#ff2020'; g.shadowBlur = 30; ell(g, 140, -80, 14, 14, '#ff3030', 0); g.restore(); } else ell(g, 140, -80, 14, 14, '#5a1010', 0); g.restore(); }
function theory(g, t, t0, t1) {
  const k0 = eback(prog(t, t0, t0 + .3)), k1 = eback(prog(t, t1, t1 + .3));
  for (const [k, y, title, body, col] of [[k0, 560, 'TEORÍA 1', ['ALGUIEN CASTIGA A LOS', 'QUE AYUDARON A RIVAS'], '#47c6ff'], [k1, 1000, 'TEORÍA 2', ['RIVAS ELIMINA TESTIGOS', 'PARA SALVARSE'], '#ff4a3d']]) { if (k <= 0) continue;
    g.save(); g.translate(W / 2, y); g.scale(k, k); rr(g, -440, -170, 880, 340, 20); fs(g, '#ece4cf', 7); rr(g, -440, -170, 880, 80, 20); fs(g, col, 7); g.font = '56px BB'; g.fillStyle = '#fff'; g.textAlign = 'center'; g.textBaseline = 'middle'; g.fillText(title, 0, -128);
    g.font = '54px BB'; g.fillStyle = '#1b1b1b'; body.forEach((b, i) => g.fillText(b, 0, -10 + i * 80)); g.restore(); }
}
function rivasHouse(g, t, open = 1) {
  nightSky(g); g.fillStyle = '#1a1e22'; g.fillRect(0, 1350, W, H);
  poly(g, [[120, 640], [540, 360], [960, 640]], '#2a2228', 8); rr(g, 170, 640, 740, 710, 4); fs(g, '#3a3a40', 8);
  for (const x of [240, 700]) { rr(g, x, 760, 150, 170, 4); fs(g, '#0a0c10', 6); }
  rr(g, 460, 1000, 160, 350, 4); fs(g, '#05070a', 7); g.save(); g.translate(460, 1000); g.scale(1 - .7 * open, 1); rr(g, 0, 0, 160, 350, 4); fs(g, '#4a2a1a', 7); g.restore();
  rain(g, t, .35);
}
// ---------- textos ----------
const NAME = { 'julián': '#47c6ff', 'julián?».': '#47c6ff', 'ferrer': '#47c6ff', 'mateo': '#47c6ff', 'rivas': '#47c6ff', 'rivas.': '#47c6ff', 'rafael': '#47c6ff', 'ignacio': '#47c6ff', 'bravo': '#47c6ff', 'clara': '#47c6ff', 'montes': '#47c6ff', 'elena': '#47c6ff', 'andrés': '#47c6ff', 'lagos': '#47c6ff' };

const clean = w => w.replace(/[.,:…¿?]/g, '');
const CHUNKS = (() => { const out = []; let cur = [];
  WORDS.forEach((w, i) => { cur.push(w); const nx = WORDS[i + 1]; const br = /[.,:…?]$/.test(w.w) || cur.length >= 3 || !nx || nx.s - w.e > .2; if (br) { out.push(cur); cur = []; } });
  return out.map((c, i) => ({ ws: c, s: c[0].s - .04, e: (out[i + 1] && out[i + 1][0].s - c[c.length - 1].e < .7) ? out[i + 1][0].s - .04 : c[c.length - 1].e + .3 })); })();
function captions(g, t) {
  const ch = CHUNKS.find(c => t >= c.s && t < c.e); if (!ch) return;
  g.save(); g.font = '76px LG'; g.textBaseline = 'middle'; g.lineJoin = 'round';
  const parts = ch.ws.map(w => clean(w.w).toUpperCase()); const sp = 22; const ws = parts.map(p => g.measureText(p).width);
  let tot = ws.reduce((a, b) => a + b, 0) + sp * (parts.length - 1); let sc = Math.min(1, 960 / tot);
  const k = prog(t, ch.s, ch.s + .14); sc *= lerp(.82, 1, eback(k));
  g.translate(W / 2, 1390); g.scale(sc, sc); let x = -tot / 2;
  ch.ws.forEach((w, i) => { const on = t >= w.s - .03; const key = clean(w.w).toLowerCase(); const nc = NAME[key];
    g.lineWidth = 16; g.strokeStyle = '#0d0b08'; g.strokeText(parts[i], x, 0);
    g.fillStyle = nc ? nc : (on && t < w.e + .05 ? '#ffd21f' : '#ffffff'); if (!on && !nc) g.fillStyle = '#ffffff';
    if (on && t < w.e + .05 && !nc) g.fillStyle = '#ffd21f';
    g.fillText(parts[i], x, 0); x += ws[i] + sp; });
  g.restore();
}
// titulares superiores: [t0, t1, texto, fondo, rot, línea]
const HEAD = [
  [0.03, 9.9, 'TRES VÍCTIMAS', '#b3161b', -2, 0],
  [13.91, 20.8, 'LA CAJA DE ELENA', '#111', 2, 0],
  [54.37, 59.9, 'FALTA UNO', '#b3161b', -2, 0],
  [59.99, 63.3, 'EL TALLER', '#111', 2, 0],
  [71.08, 75.4, 'UN LÁPIZ SUAVE', '#111', -2, 0],
  [84.74, 88.8, 'EL SISTEMA', '#111', 2, 0],
  [97.68, 104.7, 'EL FUNERAL', '#111', -2, 0],
  [116.97, 125.0, 'LA CONFRONTACIÓN', '#111', 2, 0],
  [137.94, 154.2, 'UNA IDEA TERRIBLE', '#b3161b', -2, 0],
  [154.29, 165.0, 'ESA NOCHE', '#111', 2, 0],
  [169.38, 174.1, 'LO ESCUCHA', '#111', -2, 0],
  [180.43, 187.8, 'SORPRENDIDO', '#111', 2, 0],
  [187.89, 195.8, 'AL DÍA SIGUIENTE', '#111', -2, 0],
  [195.85, 204.1, 'UN MENSAJE', '#b3161b', 2, 0],
  [204.2, 208.5, 'BAJO LA LLUVIA', '#111', -2, 0],
  [213.55, 217.2, 'EN LA SALA', '#111', 2, 0],
  [222.77, 227.3, 'UNA GRABADORA', '#b3161b', -2, 0],
];

function headlines(g, t) {
  for (const [t0, t1, txt, bg, rot, ln] of HEAD) { if (t < t0 || t > t1) continue; const k = eback(prog(t, t0, t0 + .22)); const out = prog(t, t1 - .12, t1);
    g.save(); g.font = '104px BB'; const w = g.measureText(txt).width; g.translate(W / 2, 250 + ln * 120); g.rotate(rot * Math.PI / 180); g.scale(k * (1 - out * .3), k * (1 - out * .3)); g.globalAlpha = 1 - out;
    g.fillStyle = 'rgba(0,0,0,.35)'; g.fillRect(-w / 2 - 26 + 10, -66 + 10, w + 52, 128); g.fillStyle = bg; g.fillRect(-w / 2 - 26, -66, w + 52, 128);
    g.lineWidth = 4; g.strokeStyle = 'rgba(255,255,255,.85)'; g.strokeRect(-w / 2 - 18, -58, w + 36, 112);
    g.fillStyle = '#fff'; g.textAlign = 'center'; g.textBaseline = 'middle'; g.fillText(txt, 0, 6); g.restore(); }
}
// notas a mano: [t0,t1,texto,x,y,ax1,ay1,ax2,ay2,rot]
const NOTES = [];

function notes(g, t) {
  for (const [t0, t1, txt, x, y, ax, ay, bx, by, rot] of NOTES) { if (t < t0 || t > t1) continue; const k = prog(t, t0, t0 + .45), out = 1 - prog(t, t1 - .15, t1);
    g.save(); g.globalAlpha = out; g.font = '64px PM'; g.textAlign = 'center'; g.textBaseline = 'middle'; const w = g.measureText(txt).width;
    g.save(); g.beginPath(); g.rect(x - w / 2 - 20, y - 80, (w + 40) * k, 160); g.clip(); g.translate(x, y); g.rotate(rot * Math.PI / 180); g.lineWidth = 10; g.strokeStyle = 'rgba(0,0,0,.5)'; g.strokeText(txt, 0, 0); g.fillStyle = '#ff2b2b'; g.fillText(txt, 0, 0); g.restore();
    const a = prog(t, t0 + .3, t0 + .6); if (a > 0) { const mx = (ax + bx) / 2 + 40, my = (ay + by) / 2; g.strokeStyle = '#ff2b2b'; g.lineWidth = 9; g.lineCap = 'round'; g.beginPath(); g.moveTo(ax, ay);
      const N = 20; for (let i = 1; i <= N * a; i++) { const s = i / N; g.lineTo((1 - s) ** 2 * ax + 2 * (1 - s) * s * mx + s * s * bx, (1 - s) ** 2 * ay + 2 * (1 - s) * s * my + s * s * by); } g.stroke();
      if (a >= 1) { const an = Math.atan2(by - my, bx - mx); g.beginPath(); g.moveTo(bx, by); g.lineTo(bx - Math.cos(an - .5) * 34, by - Math.sin(an - .5) * 34); g.moveTo(bx, by); g.lineTo(bx - Math.cos(an + .5) * 34, by - Math.sin(an + .5) * 34); g.stroke(); } }
    g.restore(); }
}
function bigText(g, txt, x, y, size, fill, k = 1, font = 'LG', rot = 0) { g.save(); g.translate(x, y); g.rotate(rot); g.scale(k, k); g.font = `${size}px ${font}`; g.textAlign = 'center'; g.textBaseline = 'middle'; g.lineJoin = 'round'; g.lineWidth = size * .2; g.strokeStyle = '#0d0b08'; g.strokeText(txt, 0, 0); g.fillStyle = fill; g.fillText(txt, 0, 0); g.restore(); }
function stamp(g, txt, x, y, k, color = '#c4161c', rot = -.12, size = 90) { if (k <= 0) return; const s = lerp(2.4, 1, eout(k)); g.save(); g.translate(x, y); g.rotate(rot); g.scale(s, s); g.globalAlpha = clamp(k * 2); g.font = `${size}px BB`; const w = g.measureText(txt).width; g.lineWidth = 9; g.strokeStyle = color; g.strokeRect(-w / 2 - 24, -size * .62, w + 48, size * 1.2); g.fillStyle = color; g.textAlign = 'center'; g.textBaseline = 'middle'; g.fillText(txt, 0, 6); g.restore(); }

// ---------- escenas Capítulo 3 ----------
const S = [];
const scene = (t0, draw, tr = 'cut', trd = 0) => S.push({ t0, draw, tr, trd });
const pill = (g, x, y, k, txt, bg = '#ece4cf', col = '#1b1b1b', size = 54) => { if (k <= 0) return; g.save(); g.translate(x, y); g.scale(k, k); g.font = `${size}px BB`; const w = g.measureText(txt).width; rr(g, -w / 2 - 34, -size * .9, w + 68, size * 1.8, 18); fs(g, bg, 5); g.fillStyle = col; g.textAlign = 'center'; g.textBaseline = 'middle'; g.fillText(txt, 0, 4); g.restore(); };

// 0. Gancho
scene(0, (g, t, lt) => {
  office(g, t, .5); g.save(); cam(g, lt, 9.9, .1, W / 2, 820);
  [[300, 760, '1'], [560, 640, '2'], [800, 780, '3']].forEach(([x, y, n], i) => { if (lt > i * .7) crane(g, x, y, .4 * eback(prog(lt, i * .7, i * .7 + .3)), { num: n }); });
  if (lt > 4.4) { g.save(); g.globalAlpha = prog(lt, 4.4, 5.2); photoFrame(g, W / 2, 1060, 1.1, ELENA_HEAD); g.restore(); g.strokeStyle = '#c4161c'; g.lineWidth = 6; const k = prog(lt, 5.0, 6.5); for (const [x, y] of [[300, 760], [560, 640], [800, 780]]) { g.beginPath(); g.moveTo(x, y); g.lineTo(lerp(x, W / 2, k), lerp(y, 1000, k)); g.stroke(); } }
  g.restore();
});
// 1. Título
scene(9.97, (g, t, lt) => {
  g.fillStyle = '#0a0d12'; g.fillRect(0, 0, W, H); rain(g, t, .2);
  crane(g, W / 2, 600, 1.4 * eback(prog(lt, 0, .5)), { glow: 1, rot: -.08 });
  bigText(g, 'LA GRULLA', W / 2, 920, 130, '#f0e8d8', eback(prog(lt, .2, .5)), 'CZ'); bigText(g, 'DE PAPEL', W / 2, 1050, 110, '#f0e8d8', eback(prog(lt, .4, .7)), 'CZ');
  if (lt > 2.07) { const k = eback(prog(lt, 2.07, 2.3)); g.save(); g.translate(W / 2, 1210); g.rotate(-.04); g.scale(k, k); g.fillStyle = '#9d1418'; g.fillRect(-210, -56, 420, 112); g.lineWidth = 5; g.strokeStyle = '#ffd7c2'; g.strokeRect(-200, -46, 400, 92); g.font = '74px LG'; g.fillStyle = '#ffe9dc'; g.textAlign = 'center'; g.textBaseline = 'middle'; g.fillText('CAPÍTULO 3', 0, 8); g.restore(); }
}, 'glitch', .35);
// 2. La caja de Elena
scene(13.91, (g, t, lt) => {
  nightKitchen(g, t, .8); table(g);
  const op = eio(prog(t, 15.0, 16.6)); g.save(); g.translate(W / 2, 1180); poly(g, [[-260, 0], [260, 0], [240, -220], [-240, -220]], '#9a7a50', 7); g.font = '54px PM'; g.fillStyle = '#1b1b1b'; g.textAlign = 'center'; g.fillText('ELENA', 0, -90); g.save(); g.translate(0, -220); g.scale(1, lerp(1, -1, op)); poly(g, [[-270, 0], [270, 0], [250, -70], [-250, -70]], '#b38f5e', 6); g.restore(); g.restore();
  if (t > 18.08) { const k = eout(prog(t, 18.08, 18.8)); g.save(); g.translate(W / 2, lerp(1100, 560, k)); g.rotate(-.04); rr(g, -260, -170, 520, 340, 8); fs(g, '#e9dfc4', 6); g.font = '46px BB'; g.fillStyle = '#1b1b1b'; g.textAlign = 'center'; g.fillText('EXPEDIENTE', 0, -60); g.fillText('ELENA FERRER', 0, 10); g.restore(); }
  if (t > 20.88) { const P = [['CALLE MOJADA', 20.88, 200, 420], ['PARAGUAS ROTO', 22.53, 860, 420]]; P.forEach(([n, t0, x, y]) => { if (t < t0) return; const k = eback(prog(t, t0, t0 + .25)); g.save(); g.translate(x, y + 360); g.rotate(x < 500 ? -.12 : .12); g.scale(k, k); rr(g, -150, -120, 300, 240, 4); fs(g, '#f4f1ea', 6); rr(g, -130, -100, 260, 160, 2); fs(g, '#20262e', 3); if (n === 'PARAGUAS ROTO') { g.save(); g.translate(0, -20); g.rotate(.5); g.beginPath(); g.arc(0, 0, 60, Math.PI, 0); fs(g, '#a8202a', 4); g.restore(); } else { g.fillStyle = '#e8e2d0'; for (let i = 0; i < 3; i++) g.fillRect(-110 + i * 90, 10, 50, 8); } g.font = '28px BB'; g.fillStyle = '#1b1b1b'; g.textAlign = 'center'; g.fillText(n, 0, 95); g.restore(); }); }
  if (t > 25.4) stamp(g, 'CONDUCTOR DESCONOCIDO', W / 2, 1580, prog(t, 25.4, 25.65), '#c4161c', -.06, 64);
  if (t > 27.13) stamp(g, 'CASO ARCHIVADO', W / 2, 1720, prog(t, 27.13, 27.4), '#c4161c', .05, 64);
}, 'push', .3);
// 3. Los nombres
scene(28.66, (g, t, lt) => {
  g.fillStyle = '#12161c'; g.fillRect(0, 0, W, H); const hl = []; if (t > 37.97) hl.push(1); if (t > 42.27) hl.push(3);
  g.save(); if (t > 34.73 && t < 37.97) { const z = lerp(1, 1.06, prog(t, 34.73, 37.9)); g.translate(W / 2, 800); g.scale(z, z); g.translate(-W / 2, -800); } caseFile(g, W / 2, 820, .95, t, hl); g.restore();
  if (t > 40.17 && t < 42.2) pill(g, W / 2, 1600, eback(prog(t, 40.17, 40.4)), '«NO VI NADA»', '#1b1b1b', '#ffd21f');
  if (t > 44.63 && t < 47.5) pill(g, W / 2, 1600, eback(prog(t, 44.63, 44.9)), 'PIDIÓ ARCHIVAR EL CASO', '#1b1b1b', '#ffd21f');
  if (t > 47.59) { g.fillStyle = 'rgba(0,0,0,.7)'; g.fillRect(0, 0, W, H); crane(g, 340, 680, .55 * eback(prog(t, 47.6, 47.9)), { num: '2' }); crane(g, 740, 680, .55 * eback(prog(t, 48.4, 48.7)), { num: '3' });
    pill(g, 340, 940, eback(prog(t, 47.8, 48.1)), 'CLARA', '#ece4cf', '#1b1b1b', 60); pill(g, 740, 940, eback(prog(t, 48.6, 48.9)), 'ANDRÉS', '#ece4cf', '#1b1b1b', 60);
    if (t > 50.04) pill(g, W / 2, 1140, eback(prog(t, 50.04, 50.3)), 'EN EL CASO DE ELENA', '#c4161c', '#fff', 64); }
}, 'push', .3);
// 4. Falta Ignacio / vuelve al taller
scene(54.37, (g, t, lt) => {
  if (t < 59.99) { g.fillStyle = '#12161c'; g.fillRect(0, 0, W, H); crane(g, W / 2, 620, .8, { num: '1' }); pill(g, W / 2, 900, 1, 'IGNACIO BRAVO', '#ece4cf', '#1b1b1b', 70); if (t > 57.13) stamp(g, 'NO APARECE', W / 2, 1150, prog(t, 57.13, 57.4), '#c4161c', -.08, 90); }
  else { workshop(g, t, .3); if (t < 63.35) figure(g, W / 2, 1330, 1.15, JULIAN, { ...walk(t, .6, .25), t, aL: -.4 });
    else { g.fillStyle = 'rgba(0,0,0,.55)'; g.fillRect(0, 0, W, H); ledger(g, W / 2, 820, 1.0, t, 1); if (t > 63.35) pill(g, W / 2, 1220, eback(prog(t, 63.6, 63.9)), 'EL DÍA DESPUÉS DE LA MUERTE DE ELENA', '#c4161c', '#fff', 40); if (t > 67.02) { g.save(); g.strokeStyle = '#47c6ff'; g.lineWidth = 9; g.beginPath(); g.ellipse(W / 2 + 230, 820, 210, 310, 0, 0, 7 * prog(t, 67.02, 67.6)); g.stroke(); g.restore(); } } }
}, 'push', .3);
// 5. El calco a lápiz
scene(71.08, (g, t, lt) => {
  g.fillStyle = '#12161c'; g.fillRect(0, 0, W, H); rubbing(g, W / 2, 760, 1.0, t, 71.3, 74.6);
  [['REPARACIÓN URGENTE', 75.45], ['SEDÁN GRIS', 77.12], ['GOLPE EN EL FRENTE', 78.37], ['PAGADO EN EFECTIVO', 79.86], ['SIN FACTURA', 81.22]].forEach(([n, t0], i) => { if (t < t0) return; g.save(); g.strokeStyle = '#ff2b2b'; g.lineWidth = 6; const y = 760 - 300 + i * 100 + 30; g.beginPath(); g.moveTo(W / 2 - 360, y); g.lineTo(W / 2 - 360 + 600 * prog(t, t0, t0 + .5), y); g.stroke(); g.restore(); });
  if (t > 82.53) { g.fillStyle = 'rgba(0,0,0,.6)'; g.fillRect(0, 0, W, H); plate(g, W / 2, 820, eback(prog(t, 83.37, 83.7))); }
}, 'push', .3);
// 6. El sistema
scene(84.74, (g, t, lt) => {
  office(g, t, .6); screen(g, t, 86.7);
  if (t > 88.84) { const k = eback(prog(t, 92.75, 93.05)); if (k > 0) { g.save(); g.translate(540, 860); g.scale(k, k); g.font = '84px BB'; g.fillStyle = '#ff4a3d'; g.textAlign = 'center'; g.textBaseline = 'middle'; g.fillText('RAFAEL RIVAS', 0, 0); g.font = '44px BB'; g.fillStyle = '#ffd21f'; g.fillText('COMISARIO', 0, 80); g.restore(); } }
}, 'push', .3);
// 7. Su compañero, su amigo
scene(95.12, (g, t, lt) => {
  if (t < 97.68) { office(g, t, .3); figure(g, 300, 1330, 1.15, JULIAN, { ...idle(t), t, aR: -.8, aL: .8 }); figure(g, 780, 1330, 1.15, RIVAS, { ...idle(t, 3), t, aL: .8, aR: -.8 });
    pill(g, W / 2, 520, eback(prog(t, 95.12, 95.4)), 'SU COMPAÑERO', '#ece4cf'); if (t > 96.24) pill(g, W / 2, 660, eback(prog(t, 96.24, 96.5)), 'SU MEJOR AMIGO', '#ece4cf'); }
  else { g.fillStyle = '#1a1d22'; g.fillRect(0, 0, W, H); rain(g, t, .35); g.fillStyle = '#2a2d30'; g.fillRect(0, 1300, W, H);
    rr(g, 700, 1000, 300, 300, 30); fs(g, '#3a3a3a', 6); g.font = '40px CZ'; g.fillStyle = '#ccc'; g.textAlign = 'center'; g.fillText('ELENA', 850, 1120);
    for (const [x, c] of [[430, '#111'], [560, '#111']]) { g.save(); g.translate(x, 860); g.beginPath(); g.arc(0, 0, 150, Math.PI, 0); fs(g, c, 6); g.lineWidth = 6; g.beginPath(); g.moveTo(0, 0); g.lineTo(0, 200); g.stroke(); g.restore(); }
    figure(g, 430, 1330, 1.0, JULIAN, { t, aL: 1.0, aR: -.3, blink: true, tilt: .15 }); figure(g, 560, 1330, 1.0, RIVAS, { t, aL: -1.0, aR: .3, tilt: -.15 });
    g.fillStyle = 'rgba(120,100,70,.18)'; g.fillRect(0, 0, W, H);
    if (t > 100.41) bubble(g, W / 2, 470, 760, 220, ['«DEJA DE BUSCAR, JULIÁN»'], { size: 56, tail: [60, 100] }); }
}, 'push', .3);
// 8. Pregunta 1
scene(104.82, (g, t, lt) => {
  g.fillStyle = '#0a0d12'; g.fillRect(0, 0, W, H); rain(g, t, .12);
  question(g, t, 104.9, '¿QUÉ HARÍAS TÚ?', [['A', 'LO DENUNCIO YA'], ['B', 'HABLO PRIMERO CON ÉL']], [111.6, 112.9]);
  commentIcon(g, W / 2, 1580, eback(prog(t, 114.98, 115.25)));
}, 'zoom', .3);
// 9. La oficina de Rivas
scene(116.97, (g, t, lt) => {
  office(g, t, .15); const door = eio(prog(t, 125.05, 125.8));
  figure(g, lerp(-100, 330, eout(prog(t, 117.0, 119.0))), 1330, 1.15, JULIAN, { ...(t < 119 ? walk(t, 1, .3) : idle(t)), t, aR: t > 119.15 && t < 121.9 ? -1.3 : -.12 });
  figure(g, 780, 1330, 1.15, { ...RIVAS, skin: t > 122.46 ? '#c9b4a4' : RIVAS.skin }, { ...idle(t, 3), t, aL: -.8, tilt: t > 122.46 ? .15 : 0 });
  if (t > 119.15) { g.save(); g.translate(560, 1060); g.rotate(-.05); rr(g, -90, -60, 180, 120, 4); fs(g, '#efe6cf', 4); g.fillStyle = '#7a7a80'; g.fillRect(-70, -40, 140, 80); g.restore(); }
  if (door > 0) { g.fillStyle = `rgba(0,0,0,${door * .5})`; g.fillRect(0, 0, W, H); g.save(); g.translate(W, 0); g.scale(-door, 1); rr(g, 0, 0, W, H, 0); fs(g, '#2a2420', 0); g.restore(); }
}, 'push', .3);
scene(127.26, (g, t, lt) => {
  office(g, t, .45); figure(g, 300, 1330, 1.15, JULIAN, { ...idle(t), t }); figure(g, 780, 1330, 1.15, { ...RIVAS, skin: '#c9b4a4' }, { ...idle(t, 3), t, aL: -.4 });
  if (t < 130.5) bubble(g, 700, 520, 680, 220, ['«¿QUIÉN MÁS SABE', 'ESTO, JULIÁN?»'], { size: 54, tail: [60, 140] });
  else if (t < 132.9) { bubble(g, 340, 520, 380, 180, ['«NADIE»'], { size: 64, tail: [-40, 140] }); }
  else if (t < 134.6) { pill(g, W / 2, 470, eback(prog(t, 131.0, 131.3)), 'NO LO NIEGA', '#ece4cf'); pill(g, W / 2, 610, eback(prog(t, 132.01, 132.3)), 'NO LO CONFIESA', '#ece4cf'); }
  else bubble(g, 700, 520, 720, 240, t < 135.89 ? ['«DAME DOS DÍAS»'] : ['«DAME DOS DÍAS.', 'TE LO VOY A EXPLICAR TODO»'], { size: 50, tail: [60, 140] });
}, 'cut');
// 10. Las dos teorías
scene(137.94, (g, t, lt) => {
  office(g, t, .65); theory(g, t, 141.28, 150.24);
  if (t > 146.64 && t < 150.2) pill(g, W / 2, 790, eback(prog(t, 146.64, 146.9)), 'EL ÚNICO QUE QUEDA: RIVAS', '#c4161c', '#fff', 50);
}, 'push', .3);
// 11. Mateo en la sala
scene(154.29, (g, t, lt) => {
  livingRoom(g, t, t > 161.17 ? .8 : .2);
  const up = t > 184.71; figure(g, up ? lerp(620, 1200, prog(t, 185.2, 186.9)) : 620, 1240, 1.05, MATEO, { ...(up ? walk(t, 1, .3) : idle(t, 2)), t, flip: up, mouth: t > 182.97 && t < 184.7 ? 'smile' : null, aL: up ? 0 : .5, aR: up ? 0 : -.5 });
  figure(g, lerp(-150, 320, eout(prog(t, 155.2, 157.0))), 1300, 1.1, JULIAN, { ...(t < 157 ? walk(t, .8, .3) : idle(t)), t, blink: t > 155 && t < 157, tilt: t > 180.43 && t < 182.3 ? -.12 : 0 });
  if (t > 165.03 && t < 169.3) { const items = [['EL CASO', 165.03], ['LAS GRULLAS', 165.92], ['LA MATRÍCULA', 166.95], ['RIVAS', 168.09]]; items.forEach(([n, t0], i) => { if (t < t0) return; pill(g, W / 2, 360 + i * 120, eback(prog(t, t0, t0 + .2)), n, i === 3 ? '#c4161c' : '#ece4cf', i === 3 ? '#fff' : '#1b1b1b', 52); }); }
  if (t > 174.21 && t < 180.3) { g.fillStyle = 'rgba(0,0,0,.35)'; g.fillRect(0, 0, W, H); bubble(g, W / 2, 520, 900, 300, t < 177.08 ? ['«¿Y SI EL ASESINO NO', 'ES UN MONSTRUO, PAPÁ?»'] : ['«¿Y SI SOLO ESTÁ TERMINANDO', 'LO QUE TÚ NO TERMINASTE?»'], { size: 54, tail: [100, 160] }); }
}, 'push', .3);
// 12. Rivas no aparece
scene(187.89, (g, t, lt) => {
  if (t < 195.85) { office(g, t); emptyChair(g, 780, 1300, 1.1); figure(g, 300, 1330, 1.15, JULIAN, { ...idle(t), t, aR: t > 191.43 ? -2.6 : -.12, holdR: t > 191.43 ? (gg, x, y) => { rr(gg, x - 24, y - 110, 48, 130, 18); fs(gg, '#2a2a2a', 5); } : null });
    if (t > 189.05) pill(g, 780, 520, eback(prog(t, 189.05, 189.3)), 'RIVAS: AUSENTE', '#c4161c', '#fff', 52);
    if (t > 191.43) pill(g, 780, 660, eback(prog(t, 191.43, 191.7)), 'SIN RESPUESTA', '#1b1b1b', '#ffd21f', 52);
    if (t > 193.2) bubble(g, 700, 860, 680, 200, ['«ÉL NUNCA FALTA»'], { size: 54, tail: [100, 100] }); }
  else { g.fillStyle = '#0c1018'; g.fillRect(0, 0, W, H); if (t < 197.27) digiClock(g, W / 2, 760, 1.5 * eback(prog(t, 195.85, 196.1)), '23:00');
    else phoneScreen(g, W / 2, 860, 1.0, t, 'RIVAS', t < 203.04 ? ['VEN A MI CASA.'] : ['VEN A MI CASA.', 'SOLO.'], eback(prog(t, 201.68, 201.95))); }
}, 'push', .3);
// 13. Bajo la lluvia
scene(204.20, (g, t, lt) => {
  windshield(g, t); if (t > 206.03) { g.save(); g.globalAlpha = .4 * prog(t, 206.03, 206.8); g.translate(W / 2, 600); g.rotate(.5); g.beginPath(); g.arc(0, 0, 120, Math.PI, 0); fs(g, '#a8202a', 0); g.restore(); }
}, 'push', .3);
scene(208.57, (g, t, lt) => {
  if (t < 213.55) { rivasHouse(g, t, 1); if (t > 211.36) pill(g, W / 2, 470, eback(prog(t, 211.36, 211.6)), 'LUCES APAGADAS', '#1b1b1b', '#ffd21f', 52); }
  else { livingRoom(g, t, 0); g.fillStyle = 'rgba(0,0,0,.35)'; g.fillRect(0, 0, W, H); const fl = g.createLinearGradient(0, 0, 0, 1300); fl.addColorStop(0, 'rgba(255,240,190,0)'); fl.addColorStop(1, 'rgba(255,240,190,.22)'); g.fillStyle = fl; g.beginPath(); g.moveTo(-100, 0); g.lineTo(300, 1300); g.lineTo(900, 1300); g.fill();
    seated(g, W / 2, 1190, 1.0, RIVAS, { t, blink: true, tilt: .3, holdR: t > 218.58 ? (gg, x, y) => crane(gg, x + 10, y - 10, .22, { num: t > 221.13 ? '4' : null }) : null }, '#4a2a2a');
    if (t > 217.23 && t < 219.4) pill(g, W / 2, 400, eback(prog(t, 217.23, 217.5)), 'NO RESPIRA', '#c4161c', '#fff', 64);
    if (t > 219.5 && t < 222.7) { g.save(); g.globalAlpha = prog(t, 219.5, 219.8); g.fillStyle = 'rgba(0,0,0,.75)'; g.fillRect(0, 0, W, H); g.restore(); crane(g, W / 2, 800, 1.7 * eback(prog(t, 219.5, 219.9)), { glow: 1, num: t > 221.13 ? '4' : null, rot: .05 }); }
    if (t > 222.77) { g.fillStyle = 'rgba(0,0,0,.7)'; g.fillRect(0, 0, W, H); recorder(g, W / 2, 820, 1.8 * eback(prog(t, 222.77, 223.1)), t); } }
}, 'push', .3);
// 14. Pregunta final
scene(227.36, (g, t, lt) => {
  g.fillStyle = '#0a0d12'; g.fillRect(0, 0, W, H); rain(g, t, .12); recorder(g, W / 2, 420, .8, t);
  const k = eback(prog(t, 227.4, 227.7)); g.save(); g.translate(W / 2, 860); g.scale(k, k); rr(g, -460, -170, 920, 340, 30); fs(g, '#12161c', 8); g.font = '78px LG'; g.textAlign = 'center'; g.textBaseline = 'middle'; g.fillStyle = '#ffd21f'; g.lineWidth = 12; g.strokeStyle = '#000';
  for (const [s, y] of [['¿TÚ ESCUCHARÍAS', -50], ['ESA GRABACIÓN?', 50]]) { g.strokeText(s, 0, y); g.fillText(s, 0, y); } g.restore();
  commentIcon(g, W / 2, 1580, eback(prog(t, 229.38, 229.65)));
}, 'zoom', .3);
// 15. Continuará
scene(231.15, (g, t, lt) => {
  g.fillStyle = '#07090c'; g.fillRect(0, 0, W, H); rain(g, t, .15); const k = prog(lt, 0, .8);
  g.save(); g.globalAlpha = k; g.font = '900 120px CZ'; g.textAlign = 'center'; g.textBaseline = 'middle'; g.shadowColor = '#ffcf6a'; g.shadowBlur = 40; g.fillStyle = '#f3dca2'; g.fillText('CONTINUARÁ', W / 2, 760); g.restore();
  g.save(); g.globalAlpha = prog(lt, .4, 1); bigText(g, 'CAPÍTULO 4 · EL FINAL', W / 2, 900, 86, '#ffffff', 1, 'BB'); g.restore();
  if (lt > 3.0) bigText(g, 'SÍGUEME PARA NO PERDÉRTELO', W / 2, 1010, 64, '#ff4a3d', eback(prog(lt, 3.0, 3.25)), 'BB');
}, 'fade', .5);
// ---------- composición ----------
const GRAIN = Array.from({ length: 3 }, () => { const c = mk(540, 960), g = c.getContext('2d'), im = g.createImageData(540, 960); for (let i = 0; i < im.data.length; i += 4) { const v = rnd() * 255; im.data[i] = im.data[i + 1] = im.data[i + 2] = v; im.data[i + 3] = 18; } g.putImageData(im, 0, 0); return c; });
function drawScene(i, g, t) { const s = S[i]; g.save(); g.clearRect(0, 0, W, H); s.draw(g, t, t - s.t0); g.restore(); }
window.renderAt = t => { window.__t = t;
  let i = 0; while (i + 1 < S.length && t >= S[i + 1].t0) i++;
  const s = S[i], lt = t - s.t0; const g = ctx;
  if (i > 0 && lt < s.trd && s.tr !== 'cut' && s.tr !== 'flash') {
    drawScene(i - 1, bufA.getContext('2d'), t); drawScene(i, bufB.getContext('2d'), t); const k = eio(lt / s.trd);
    g.fillStyle = '#000'; g.fillRect(0, 0, W, H);
    if (s.tr === 'push') { g.drawImage(bufA, -W * k, 0); g.drawImage(bufB, W * (1 - k), 0); }
    else if (s.tr === 'zoom') { g.drawImage(bufA, 0, 0); g.save(); g.globalAlpha = k; const sc = lerp(1.35, 1, k); g.translate(W / 2, H / 2); g.scale(sc, sc); g.drawImage(bufB, -W / 2, -H / 2); g.restore(); }
    else if (s.tr === 'fade') { g.globalAlpha = 1 - k; g.drawImage(bufA, 0, 0); g.globalAlpha = k; g.drawImage(bufB, 0, 0); g.globalAlpha = 1; }
    else if (s.tr === 'glitch') { const n = 24; for (let j = 0; j < n; j++) { const y = j * H / n, h = H / n + 1; const useB = srnd(j * 3.1 + Math.floor(lt * 30)) < k; const dx = (srnd(j + Math.floor(lt * 30) * 7) - .5) * 160 * (1 - Math.abs(k * 2 - 1)) * 2; g.drawImage(useB ? bufB : bufA, 0, y, W, h, dx, y, W, h); }
      g.globalCompositeOperation = 'screen'; g.fillStyle = `rgba(255,40,60,${.25 * (1 - Math.abs(k * 2 - 1))})`; g.fillRect(0, 0, W, H); g.globalCompositeOperation = 'source-over'; }
  } else { drawScene(i, bufB.getContext('2d'), t); g.drawImage(bufB, 0, 0); }
  if (s.tr === 'flash' && lt < s.trd + .1) { const a = 1 - clamp(lt / (s.trd + .1)); g.fillStyle = `rgba(255,255,255,${a})`; g.fillRect(0, 0, W, H);
    g.save(); g.translate(W / 2, H / 2); g.strokeStyle = `rgba(120,120,120,${a * .6})`; g.lineWidth = 4; for (let j = 0; j < 70; j++) { const an = srnd(j) * 7, r0 = 250 + srnd(j + 1) * 300; g.beginPath(); g.moveTo(Math.cos(an) * r0, Math.sin(an) * r0); g.lineTo(Math.cos(an) * 1400, Math.sin(an) * 1400); g.stroke(); } g.restore(); }
  // viñeta y grano
  const vg = g.createRadialGradient(W / 2, H / 2, H * .3, W / 2, H / 2, H * .75); vg.addColorStop(0, 'rgba(0,0,0,0)'); vg.addColorStop(1, 'rgba(0,0,0,.5)'); g.fillStyle = vg; g.fillRect(0, 0, W, H);
  g.drawImage(GRAIN[Math.floor(t * 15) % 3], 0, 0, W, H);
  headlines(g, t); notes(g, t); captions(g, t);
  // fundido final
  if (t > DUR - .6) { g.fillStyle = `rgba(0,0,0,${prog(t, DUR - .6, DUR)})`; g.fillRect(0, 0, W, H); }
};
window.DUR = DUR; window.READY = true;
