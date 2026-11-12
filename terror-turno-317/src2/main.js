// "El turno de las 3:17" – Parte 2 – animación 2D estilo recorte
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
// ---------- extras Parte 2 ----------
const RAMIRO = {
  skin: '#c79c7a', armC: '#4a5560', legC: '#2f353b', bootC: '#161616', torso: '#4a5560', handC: '#c79c7a',
  head: (g, p) => { ell(g, 0, 0, 46, 54, '#c79c7a'); ell(g, -46, 4, 9, 13, '#c79c7a', 4); ell(g, 46, 4, 9, 13, '#c79c7a', 4);
    g.beginPath(); g.moveTo(-46, -4); g.quadraticCurveTo(-46, -64, 0, -62); g.quadraticCurveTo(46, -64, 46, -4); g.lineTo(36, -26); g.lineTo(-36, -26); g.closePath(); fs(g, '#8d8d8d', 5);
    eyes(g, -4, 16, p.blink, OL, 5); g.beginPath(); g.moveTo(-22, 18); g.quadraticCurveTo(0, 8, 22, 18); g.quadraticCurveTo(0, 28, -22, 18); fs(g, '#6d6d6d', 4);
    g.strokeStyle = 'rgba(60,40,30,.5)'; g.lineWidth = 3; g.beginPath(); g.moveTo(-30, -36); g.lineTo(-8, -34); g.moveTo(30, -36); g.lineTo(8, -34); g.stroke(); },
  torsoDeco: (g, tw, th) => { rr(g, -50, -th + 46, 50, 22, 3); fs(g, '#e8e2cf', 3); g.font = '14px BB'; g.fillStyle = '#1b1b1b'; g.textAlign = 'center'; g.textBaseline = 'middle'; g.fillText('RAMIRO', -25, -th + 58); g.lineWidth = 4; g.strokeStyle = OL; g.beginPath(); g.moveTo(0, -th + 10); g.lineTo(0, 8); g.stroke(); },
};
// cámara con caminante / silla
function camX(g, w, h, kind, t, o = {}) {
  camView(g, w, h, kind, t, o);
  g.save(); g.scale(w / 1080, h / 788);
  if (o.chair !== undefined) { const c = Math.cos(o.chair), sn = Math.sin(o.chair); g.save(); g.translate(540, 560); g.scale(.9, .9);
    g.lineWidth = 10; g.strokeStyle = '#111'; g.beginPath(); g.moveTo(-110, 150); g.lineTo(110, 150); g.moveTo(0, 150); g.lineTo(0, 40); g.stroke(); ell(g, -110, 160, 16, 16, '#111', 4); ell(g, 110, 160, 16, 16, '#111', 4); ell(g, 0, 165, 16, 16, '#111', 4);
    rr(g, -130, 10, 260, 40, 14); fs(g, '#2a302e', 6);
    g.save(); g.translate(-sn * 120, 0); g.scale(Math.max(.15, Math.abs(c)), 1); rr(g, -110, -260, 220, 270, 30); fs(g, '#1f2523', 7); g.restore(); g.restore(); }
  if (o.walker) { const p = o.pose || walk(t, .8, .3); figure(g, o.wx ?? 540, o.wy ?? 700, o.ws ?? .5, o.walker, { ...p, t, ...(o.extra || {}) }); }
  g.restore();
}
function notebook(g, x, y, s, lines, t, opt = {}) {
  g.save(); g.translate(x, y); g.rotate(opt.rot ?? -.03); g.scale(s, s);
  rr(g, -440, -560, 880, 1120, 10); fs(g, '#e9e1c8', 8); g.fillStyle = 'rgba(0,0,0,.12)'; g.fillRect(-440, -560, 50, 1120);
  g.strokeStyle = 'rgba(80,110,160,.22)'; g.lineWidth = 3; for (let i = 0; i < 18; i++) { g.beginPath(); g.moveTo(-370, -470 + i * 58); g.lineTo(400, -470 + i * 58); g.stroke(); }
  g.textAlign = 'left'; g.textBaseline = 'middle';
  lines.forEach(([txt, shake, col, sz], i) => { if (!txt) return; g.save(); g.translate(-370, -420 + i * 150); const j = shake || 0; g.rotate((srnd(i + 3) - .5) * .08 * j);
    g.font = `${sz || 64}px PM`; g.fillStyle = col || '#1d1a16'; let x0 = 0; for (let c = 0; c < txt.length; c++) { const ch = txt[c]; const dy = (srnd(c * 7.1 + i) - .5) * 22 * j + (j > 0 ? Math.sin(t * 30 + c) * 1.5 * j : 0); g.fillText(ch, x0, dy); x0 += g.measureText(ch).width * (1 + (srnd(c + i * 3) - .5) * .25 * Math.min(j, 1)); }
    g.restore(); });
  if (opt.stains) { g.fillStyle = 'rgba(90,40,20,.18)'; g.beginPath(); g.ellipse(250, 380, 120, 70, .4, 0, 7); g.fill(); g.beginPath(); g.ellipse(-200, 300, 60, 40, -.2, 0, 7); g.fill(); }
  g.restore();
}
function analogClock(g, x, y, r, hh = 3, mm = 17, burnt = 0) {
  ell(g, x, y, r, r, burnt ? '#3a332c' : '#ece4cf', 6); for (let i = 0; i < 12; i++) { const a = i / 12 * 6.283; g.fillStyle = OL; g.fillRect(x + Math.cos(a) * r * .8 - 3, y + Math.sin(a) * r * .8 - 3, 6, 6); }
  const am = mm / 60 * 6.283 - Math.PI / 2, ah = (hh + mm / 60) / 12 * 6.283 - Math.PI / 2; g.lineCap = 'round'; g.strokeStyle = OL;
  g.lineWidth = r * .09; g.beginPath(); g.moveTo(x, y); g.lineTo(x + Math.cos(ah) * r * .5, y + Math.sin(ah) * r * .5); g.stroke();
  g.lineWidth = r * .06; g.beginPath(); g.moveTo(x, y); g.lineTo(x + Math.cos(am) * r * .75, y + Math.sin(am) * r * .75); g.stroke();
  if (burnt) { g.fillStyle = 'rgba(0,0,0,.35)'; g.beginPath(); g.arc(x, y, r, 0, 7); g.fill(); }
}
function car(g, x, y, s, dust = 1) {
  g.save(); g.translate(x, y); g.scale(s, s);
  poly(g, [[-330, 0], [-330, -90], [-200, -110], [-120, -190], [140, -190], [230, -110], [330, -90], [330, 0]], '#7a2f2a', 8);
  poly(g, [[-100, -175], [0, -175], [0, -115], [-170, -115]], '#26302e', 5); poly(g, [[20, -175], [130, -175], [200, -115], [20, -115]], '#26302e', 5);
  ell(g, -190, 0, 62, 62, '#1b1b1b', 7); ell(g, 190, 0, 62, 62, '#1b1b1b', 7); ell(g, -190, 0, 24, 24, '#8f8f8f', 5); ell(g, 190, 0, 24, 24, '#8f8f8f', 5);
  if (dust) { g.fillStyle = `rgba(170,160,140,${.45 * dust})`; g.beginPath(); g.moveTo(-330, -90); g.lineTo(-200, -110); g.lineTo(-120, -190); g.lineTo(140, -190); g.lineTo(230, -110); g.lineTo(330, -90); g.lineTo(330, -60); g.lineTo(-330, -60); g.fill();
    for (let i = 0; i < 40; i++) { g.fillStyle = 'rgba(200,190,170,.35)'; g.fillRect(-320 + srnd(i) * 640, -180 + srnd(i + 4) * 170, 6, 3); }
    g.save(); g.translate(60, -150); g.rotate(-.05); g.font = '30px PM'; g.fillStyle = 'rgba(60,50,40,.7)'; g.fillText('LÁVAME', 0, 0); g.restore(); }
  g.restore();
}
function building(g, x, y, s, marker, t) { // corte del edificio por pisos
  g.save(); g.translate(x, y); g.scale(s, s);
  const F = ['PISO 4', 'PISO 3', 'PISO 2', 'ESCALERAS', 'PLANTA BAJA'];
  F.forEach((n, i) => { rr(g, -380, -560 + i * 220, 760, 210, 6); fs(g, i === 4 ? '#3a4a44' : '#2a3531', 6); g.font = '44px BB'; g.fillStyle = '#cfe3d6'; g.textAlign = 'left'; g.textBaseline = 'middle'; g.fillText(n, -350, -455 + i * 220);
    if (i === 4) { rr(g, 160, -540 + i * 220 + 60, 180, 120, 6); fs(g, '#1c2321', 5); g.font = '36px BB'; g.fillStyle = '#ffd21f'; g.textAlign = 'center'; g.fillText('CASETA', 250, -540 + i * 220 + 120); } });
  if (marker) { const [fy, label] = marker; g.save(); g.translate(0, -455 + fy * 220); g.shadowColor = '#ff2a2a'; g.shadowBlur = 30 + 10 * Math.sin(t * 8); ell(g, 0, 0, 56, 56, '#b3161b', 6); g.restore(); g.save(); g.translate(0, -455 + fy * 220); g.scale(.75, .75); faceTomas(g, { smile: 1 }, true); g.restore(); }
  g.restore();
}
// ---------- textos ----------
const NAME = { 'tomás': '#47c6ff', 'ramiro': '#ffb52e', 'valdivieso': '#ffb52e', 'seis': '#ff4a3d', 'diecisiete': '#ff4a3d' };

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
  [0.09, 3.4, 'ROMPIÓ UNA REGLA', '#b3161b', -2, 0],
  [3.47, 7.6, 'TIENE SU CARA', '#111', 2, 0],
  [7.67, 10.9, 'CADA VEZ MÁS TEMPRANO', '#b3161b', -2, 0],
  [14.64, 16.5, 'NO MIRA ATRÁS', '#111', 2, 0],
  [21.49, 24.1, 'CASETA VACÍA', '#111', -2, 0],
  [24.21, 26.8, 'LA SILLA SE MOVIÓ', '#b3161b', 2, 0],
  [26.87, 31.8, 'AL AMANECER', '#111', -2, 0],
  [31.84, 38.1, 'INVESTIGA', '#111', 2, 0],
  [46.10, 52.1, 'LA LETRA CAMBIA', '#b3161b', -2, 0],
  [59.86, 67.9, 'LA ÚLTIMA NOTA', '#b3161b', 2, 0],
  [77.65, 83.9, 'RELOJES DETENIDOS', '#111', -2, 0],
  [83.97, 85.1, 'Y HAY ALGO MÁS', '#b3161b', 2, 0],
  [89.72, 93.9, 'SU AUTO SIGUE AHÍ', '#111', -2, 0],
  [97.47, 101.3, 'PASOS', '#b3161b', 2, 0],
  [104.45, 113.4, 'TERCER PISO', '#111', -2, 0],
  [113.44, 114.5, 'SONRÍE', '#b3161b', 2, 0],
  [121.43, 126.8, 'LAS OTRAS CÁMARAS', '#111', -2, 0],
  [129.72, 133.7, 'NO SE DETIENE', '#111', 2, 0],
  [137.24, 139.6, '2 MESES DE RONDA', '#b3161b', -2, 0],
  [151.62, 153.9, 'YA ESTÁ ABAJO', '#b3161b', 2, 0],
  [153.97, 158.7, 'EL ASCENSOR BAJA', '#111', -2, 0],
];

function headlines(g, t) {
  for (const [t0, t1, txt, bg, rot, ln] of HEAD) { if (t < t0 || t > t1) continue; const k = eback(prog(t, t0, t0 + .22)); const out = prog(t, t1 - .12, t1);
    g.save(); g.font = '104px BB'; const w = g.measureText(txt).width; g.translate(W / 2, 250 + ln * 120); g.rotate(rot * Math.PI / 180); g.scale(k * (1 - out * .3), k * (1 - out * .3)); g.globalAlpha = 1 - out;
    g.fillStyle = 'rgba(0,0,0,.35)'; g.fillRect(-w / 2 - 26 + 10, -66 + 10, w + 52, 128); g.fillStyle = bg; g.fillRect(-w / 2 - 26, -66, w + 52, 128);
    g.lineWidth = 4; g.strokeStyle = 'rgba(255,255,255,.85)'; g.strokeRect(-w / 2 - 18, -58, w + 36, 112);
    g.fillStyle = '#fff'; g.textAlign = 'center'; g.textBaseline = 'middle'; g.fillText(txt, 0, 6); g.restore(); }
}
// notas a mano: [t0,t1,texto,x,y,ax1,ay1,ax2,ay2,rot]
const NOTES = [
  [24.6, 26.8, '¡GIRADA!', 300, 1260, 330, 1215, 470, 1020, -6],
  [90.0, 93.9, 'EL AUTO DE RAMIRO', 330, 900, 380, 950, 470, 1130, -5],
];

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

// ---------- escenas Parte 2 ----------
const S = [];
const scene = (t0, draw, tr = 'cut', trd = 0) => S.push({ t0, draw, tr, trd });
const CORR_W = 1000, CORR_H = 740;
const bigCam = (g, label, clk, kind, t, o) => cctv(g, 40, 430, CORR_W, CORR_H, label, clk, cg => camX(cg, CORR_W, CORR_H, kind, t, o));

// 0. Gancho
scene(0, (g, t, lt) => {
  g.fillStyle = '#040606'; g.fillRect(0, 0, W, H); const z = lerp(1, 1.15, eio(prog(lt, 0, 3.4)));
  g.save(); g.translate(W / 2, 800); g.scale(z, z); g.translate(-W / 2, -800);
  bigCam(g, 'CAM 6 · CASETA', '03:17:00', 'booth', t, { man: true, turn: 1, smile: 1 }); g.restore();
});
scene(3.47, (g, t, lt) => {
  g.fillStyle = '#030404'; g.fillRect(0, 0, W, H);
  cctv(g, 90, 360, 900, 900, 'CAM 6', '03:17:09', cg => { cg.fillStyle = '#2d3a35'; cg.fillRect(0, 0, 900, 900); cg.save(); cg.translate(450, 520); cg.scale(4.6, 4.6); faceTomas(cg, { smile: 1 }, true); cg.restore(); });
}, 'zoom', .3);
scene(7.67, (g, t, lt) => {
  g.fillStyle = '#060808'; g.fillRect(0, 0, W, H);
  const seq = ['3:17', '3:10', '2:40', '1:30', '12:00']; const i = Math.min(4, Math.floor(prog(lt, .1, 3.0) * 5)); const k = (prog(lt, .1, 3.0) * 5) % 1;
  digiClock(g, W / 2, 800, 1.6 * (1 + (i < 4 ? (1 - eout(Math.min(1, k * 3))) * .15 : 0)), seq[i]);
  g.save(); g.font = '60px BB'; g.textAlign = 'center'; g.fillStyle = '#e8f0e8'; const nights = ['NOCHE 3', 'NOCHE 4', 'NOCHE 5', 'NOCHE 6', 'NOCHE 7']; g.fillText(nights[i], W / 2, 600); g.restore();
  g.strokeStyle = '#ff2b2b'; g.lineWidth = 10; g.beginPath(); g.moveTo(820, 980); g.lineTo(820, 1180); g.stroke(); poly(g, [[790, 1170], [850, 1170], [820, 1220]], '#ff2b2b', 0);
}, 'push', .3);
// 1. Título
scene(10.97, (g, t, lt) => {
  g.fillStyle = '#060908'; g.fillRect(0, 0, W, H);
  for (let i = 0; i < 400; i++) { g.fillStyle = `rgba(200,220,210,${srnd(i * 7 + Math.floor(t * 24)) * .12})`; g.fillRect(srnd(i + Math.floor(t * 24) * 1.3) * W, srnd(i * 3.3 + Math.floor(t * 24)) * H, 6, 2); }
  bigText(g, 'EL TURNO', W / 2, 520, 130, '#e8f0e8', eback(prog(lt, .05, .35)));
  bigText(g, 'DE LAS', W / 2, 650, 80, '#e8f0e8', eback(prog(lt, .3, .55)));
  const blink = Math.floor(lt * 2) % 2 === 0 || lt < 1; digiClock(g, W / 2, 900, 1.5 * eback(prog(lt, .5, .85)), blink ? '3:17' : '3 17');
  if (lt > 2.46) { const k = eback(prog(lt, 2.46, 2.7)); g.save(); g.translate(W / 2, 1150); g.rotate(-.05); g.scale(k, k); g.fillStyle = '#9d1418'; g.fillRect(-170, -56, 340, 112); g.lineWidth = 5; g.strokeStyle = '#ffd7c2'; g.strokeRect(-160, -46, 320, 92); g.font = '86px LG'; g.fillStyle = '#ffe9dc'; g.textAlign = 'center'; g.textBaseline = 'middle'; g.fillText('PARTE 2', 0, 8); g.restore(); }
}, 'glitch', .35);
// 2. No mira atrás – cuenta hasta cien
scene(14.64, (g, t, lt) => {
  booth(g, t, { lit: .55 }); g.fillStyle = 'rgba(0,0,0,.35)'; g.fillRect(0, 0, W, H);
  const hung = t > 16.9; const closed = t > 17.74;
  figure(g, W / 2, 1490, 1.7, TOMAS, { t, sweat: true, wide: !closed, blink: closed, aR: hung ? -.12 : -2.6, holdR: hung ? null : (gg, x, y) => { rr(gg, x - 30, y - 120, 60, 170, 25); fs(gg, '#c9b98f', 6); } });
  if (t > 18.9) { const n = Math.min(100, Math.floor(prog(t, 18.9, 20.5) * 100) + 1); g.save(); g.translate(W / 2, 470); rr(g, -230, -110, 460, 220, 20); fs(g, 'rgba(10,12,12,.85)', 6); g.font = '150px LG'; g.fillStyle = '#e8f0e8'; g.textAlign = 'center'; g.textBaseline = 'middle'; g.fillText(String(n), 0, 12); g.restore(); }
}, 'glitch', .3);
scene(20.53, (g, t, lt) => {
  g.fillStyle = '#040606'; g.fillRect(0, 0, W, H); const ch = eio(prog(t, 24.3, 25.3)) * 1.2;
  bigCam(g, 'CAM 6 · CASETA', '03:19:40', 'booth', t, { chair: ch });
}, 'push', .3);
// 3. Amanecer – vuelve
scene(26.87, (g, t, lt) => {
  const gr = g.createLinearGradient(0, 0, 0, H); gr.addColorStop(0, '#2b3a4a'); gr.addColorStop(.6, '#c27a5a'); gr.addColorStop(1, '#e7b07a'); g.fillStyle = gr; g.fillRect(0, 0, W, H);
  g.save(); g.globalAlpha = .9; clinicExtNoSky(g, t); g.restore();
  const back = t > 30.48; const x = back ? lerp(800, 560, prog(t, 30.48, 31.8)) : lerp(560, 820, prog(t, 26.87, 29));
  figure(g, x, 1300, 1.0, TOMAS, { ...walk(t, .8, .3), t, flip: back, tired: true });
  if (t > 29.02 && t < 30.48) { const k = eback(prog(t, 29.02, 29.3)); g.save(); g.translate(W / 2, 560); g.scale(k, k); rr(g, -220, -130, 440, 260, 20); fs(g, '#5a3d24', 7); rr(g, -180, -90, 360, 180, 10); fs(g, '#3d2a18', 5); g.font = '120px LG'; g.fillStyle = '#ff4a3d'; g.textAlign = 'center'; g.textBaseline = 'middle'; g.fillText('$0', 0, 10); g.restore(); }
}, 'push', .3);
const _cx = mk(W, H); function clinicExtNoSky(g, t) { const c = _cx, cg = c.getContext('2d'); cg.clearRect(0, 0, W, H); clinicExt(cg, t, 0); cg.globalCompositeOperation = 'destination-out'; cg.fillStyle = '#000'; cg.fillRect(0, 0, W, 380); cg.globalCompositeOperation = 'source-over'; g.drawImage(c, 0, 0); }
// 4. Investiga: caja y cuaderno
scene(31.84, (g, t, lt) => {
  booth(g, t, { lit: .75 }); g.fillStyle = 'rgba(0,0,0,.35)'; g.fillRect(0, 0, W, H);
  figure(g, 330, 1490, 1.3, TOMAS, { t, aL: -.4, aR: .4, ...(t > 33.98 ? { tilt: .15 } : {}), holdL: flashlight(.8) });
  if (t > 33.98) { const k = eback(prog(t, 33.98, 34.3)); g.save(); g.translate(760, 1420); g.scale(k, k); poly(g, [[-170, 0], [170, 0], [150, -200], [-150, -200]], '#9a7a50', 7); poly(g, [[-170, -200], [170, -200], [200, -260], [-140, -260]], '#b38f5e', 6);
    if (t > 35.5) { g.save(); g.translate(0, -260 - eout(prog(t, 35.5, 36.2)) * 120); g.rotate(-.1); rr(g, -90, -120, 180, 240, 8); fs(g, '#6b4a2b', 6); g.restore(); } g.restore(); }
  if (t > 38.18) { const k = eback(prog(t, 38.18, 38.45)); g.save(); g.translate(W / 2, 640); g.rotate(-.04); g.scale(k, k); rr(g, -260, -330, 520, 660, 14); fs(g, '#6b4a2b', 8); rr(g, -180, -120, 360, 150, 8); fs(g, '#e9e1c8', 5);
    g.font = '50px PM'; g.fillStyle = '#1d1a16'; g.textAlign = 'center'; g.textBaseline = 'middle'; g.fillText('RAMIRO', 0, -40); g.font = '30px BB'; g.fillText('BITÁCORA DE RONDAS', 0, 10); g.restore(); }
}, 'push', .3);
// 5. Notas ordenadas → desordenadas
scene(39.67, (g, t, lt) => {
  g.fillStyle = '#0c100f'; g.fillRect(0, 0, W, H);
  const pageTurn = prog(t, 46.1, 46.6);
  if (pageTurn < .5) { const L = [['NOCHE 1'], t > 42.27 ? ['00:00  Ronda. OK.'] : [], t > 43.68 ? ['01:00  Ronda. OK.'] : [], t > 44.97 ? ['Todo normal.'] : []]; notebook(g, W / 2, 860, 1.0 * (1 - pageTurn * 2 * .1), L.map(x => x.length ? x : [null]), t); }
  else { const L = [];
    if (t > 48.89) L.push(['Lo vi en el monitor 6', .5]); else L.push([null]); if (t > 48.89) L.push(['a las 3:17.', .5]); else L.push([null]);
    if (t > 52.21) L.push(['Una semana después:', .8]); else L.push([null]); if (t > 53.73) L.push(['Hoy apareció a las 3:10.', 1.0, '#3a1a12']); else L.push([null]);
    if (t > 56.88) L.push(['2:50. YA ESTÁ EN', 1.6, '#5a1210']); else L.push([null]); if (t > 58.07) L.push(['EL SEGUNDO PISO', 1.8, '#7a1010']); else L.push([null]);
    notebook(g, W / 2, 860, 1.0, L, t, { stains: t > 56 }); }
  if (pageTurn > 0 && pageTurn < 1) { g.save(); g.translate(W / 2 - 420, 860); g.scale(Math.abs(Math.cos(pageTurn * Math.PI)), 1); rr(g, 0, -530, 840, 1060, 8); fs(g, '#e9e1c8', 6); g.restore(); }
}, 'zoom', .3);
scene(59.86, (g, t, lt) => {
  g.fillStyle = '#080404'; g.fillRect(0, 0, W, H); g.save(); cam(g, lt, 8.2, .15, W / 2, 900);
  const L = [[null], [null], t > 62.26 ? ['SI LLEGA A LA CASETA', 2.4, '#6a0c0c', 64] : [null], t > 62.9 ? ['ANTES QUE TÚ', 2.6, '#6a0c0c', 74] : [null], t > 64.35 ? ['SE QUEDA CON TU TURNO', 2.8, '#7a0a0a', 56] : [null], t > 65.84 ? ['Y TÚ CON EL SUYO', 3.2, '#8a0808', 70] : [null]];
  notebook(g, W / 2, 900, 1.0, L, t, { stains: true, rot: .04 }); g.restore();
  g.fillStyle = `rgba(80,0,0,${.15 + .1 * Math.sin(t * 3)})`; g.fillRect(0, 0, W, H);
}, 'push', .3);
// 6. Internet / incendio
scene(68.09, (g, t, lt) => {
  booth(g, t, { lit: .4 }); g.fillStyle = 'rgba(0,0,0,.5)'; g.fillRect(0, 0, W, H);
  g.save(); g.translate(W / 2, 860); rr(g, -280, -520, 560, 1040, 50); fs(g, '#111', 8); rr(g, -250, -470, 500, 940, 20); fs(g, '#f2f2f2', 0);
  rr(g, -220, -420, 440, 70, 35); fs(g, '#fff', 4); g.font = '32px BB'; g.fillStyle = '#333'; g.textAlign = 'left'; g.textBaseline = 'middle'; const q = 'clínica valdivieso'; g.fillText(q.slice(0, Math.floor(prog(t, 68.2, 69.3) * q.length)), -190, -384);
  if (t > 69.4) { for (let i = 0; i < 4; i++) { g.fillStyle = '#1a4fb3'; g.fillRect(-220, -300 + i * 150, 360, 26); g.fillStyle = '#999'; g.fillRect(-220, -260 + i * 150, 420, 14); g.fillRect(-220, -236 + i * 150, 300, 14); } }
  g.restore();
}, 'push', .3);
scene(69.81, (g, t, lt) => {
  g.fillStyle = '#0c0a08'; g.fillRect(0, 0, W, H); g.save(); cam(g, lt, 7.8, .08, W / 2, 900);
  g.save(); g.translate(W / 2, 880); g.rotate(-.03); rr(g, -440, -600, 880, 1200, 4); fs(g, '#e6dcc0', 8);
  g.font = '50px CZ'; g.fillStyle = '#1b1b1b'; g.textAlign = 'center'; g.fillText('EL DIARIO', 0, -520); g.fillRect(-400, -490, 800, 6); g.font = '30px BB'; g.fillText('16 DE MARZO DE 1989', 0, -455);
  g.font = '78px BB'; g.fillText('INCENDIO EN CLÍNICA', 0, -370); g.fillText('VALDIVIESO', 0, -290);
  rr(g, -380, -240, 760, 460, 4); fs(g, '#2a2420', 5);
  g.save(); g.beginPath(); g.rect(-380, -240, 760, 460); g.clip(); g.fillStyle = '#4a403a'; g.fillRect(-260, -120, 520, 340); for (let r = 0; r < 3; r++) for (let c = 0; c < 4; c++) { g.fillStyle = r === 0 ? `rgba(255,${140 + 60 * Math.sin(t * 9 + c)},40,.9)` : '#15110e'; g.fillRect(-230 + c * 125, -100 + r * 100, 80, 60); }
  for (let i = 0; i < 6; i++) { const p = (t * .4 + i / 6) % 1; g.fillStyle = `rgba(30,25,22,${.7 * (1 - p)})`; g.beginPath(); g.arc(-150 + i * 60 + p * 40, -140 - p * 120, 40 + p * 60, 0, 7); g.fill(); } g.restore();
  g.fillStyle = '#4a4036'; for (let i = 0; i < 5; i++) g.fillRect(-380, 270 + i * 50, 760 - (i % 2) * 120, 18);
  g.restore();
  if (t > 75.34) { const n = Math.min(17, Math.floor(prog(t, 75.34, 76.6) * 17) + 1); g.save(); g.translate(W / 2, 1560); rr(g, -280, -80, 560, 160, 16); fs(g, 'rgba(10,8,8,.9)', 6); g.font = '96px LG'; g.fillStyle = '#ff4a3d'; g.textAlign = 'center'; g.textBaseline = 'middle'; g.fillText(`${n} MUERTOS`, 0, 8); g.restore(); }
  g.restore();
}, 'zoom', .3);
scene(77.65, (g, t, lt) => {
  g.fillStyle = '#16120f'; g.fillRect(0, 0, W, H); g.fillStyle = 'rgba(0,0,0,.25)'; for (let x = 0; x < W; x += 90) g.fillRect(x, 0, 6, H);
  g.save(); cam(g, lt, 6.3, .1, W / 2, 800); const pos = [[270, 520, 140], [790, 470, 120], [540, 830, 200], [240, 1080, 110], [830, 1100, 130]];
  pos.forEach(([x, y, r], i) => { const k = eback(prog(t, 77.8 + i * .35, 78.1 + i * .35)); if (k <= 0) return; g.save(); g.translate(x, y); g.scale(k, k); analogClock(g, 0, 0, r, 3, 17, i % 2); g.restore(); });
  for (let i = 0; i < 8; i++) { const p = (t * .25 + i / 8) % 1; g.fillStyle = `rgba(40,34,30,${.5 * (1 - p)})`; g.beginPath(); g.arc(srnd(i) * W, H - p * H, 120 + p * 100, 0, 7); g.fill(); }
  g.restore();
  if (t > 82.07) digiClock(g, W / 2, 1600, eback(prog(t, 82.07, 82.3)), '3:17');
}, 'push', .3);
// 7. Ramiro desaparecido / auto
scene(83.97, (g, t, lt) => {
  g.fillStyle = '#1a201e'; g.fillRect(0, 0, W, H);
  const k = eback(prog(t, 85.22, 85.5)); g.save(); g.translate(W / 2, 850); g.rotate(.03); g.scale(k, k);
  rr(g, -360, -520, 720, 1000, 6); fs(g, '#efe8d2', 8); g.font = '120px BB'; g.fillStyle = '#b3161b'; g.textAlign = 'center'; g.fillText('DESAPARECIDO', 0, -400);
  rr(g, -220, -330, 440, 440, 6); fs(g, '#7a8580', 6); g.save(); g.translate(0, -60); g.scale(2.6, 2.6); RAMIRO.head(g, {}); g.restore();
  g.font = '80px BB'; g.fillStyle = '#1b1b1b'; g.fillText('RAMIRO', 0, 210); g.font = '46px BB'; g.fillStyle = '#3a3a3a'; g.fillText('GUARDIA NOCTURNO', 0, 280); g.fillText('VISTO HACE 2 MESES', 0, 340);
  g.restore();
}, 'push', .3);
scene(89.72, (g, t, lt) => {
  nightSky(g); moon(g, 860, 300, 60); g.fillStyle = '#20272a'; g.fillRect(0, 1150, W, H); g.save(); cam(g, lt, 4.3, .08, W / 2, 1150);
  g.strokeStyle = '#d8d0b0'; g.lineWidth = 8; for (let i = 0; i < 5; i++) { g.beginPath(); g.moveTo(80 + i * 240, 1200); g.lineTo(40 + i * 260, 1700); g.stroke(); }
  rr(g, 840, 520, 20, 700, 6); fs(g, '#20282a', 5); g.save(); g.shadowColor = '#ffe2a2'; g.shadowBlur = 60; ell(g, 850, 520, 40, 18, '#ffe2a2', 4); g.restore();
  const cone = g.createLinearGradient(0, 530, 0, 1500); cone.addColorStop(0, 'rgba(255,226,162,.35)'); cone.addColorStop(1, 'rgba(255,226,162,0)'); g.fillStyle = cone; g.beginPath(); g.moveTo(830, 530); g.lineTo(380, 1500); g.lineTo(1080, 1500); g.lineTo(870, 530); g.fill();
  car(g, 560, 1380, 1.25, 1); g.restore(); fog(g, t, 1300, .14);
}, 'push', .3);
// 8. Noche 4: escucha pasos
scene(94.05, (g, t, lt) => {
  booth(g, t, { lit: .6 }); g.fillStyle = 'rgba(0,0,0,.35)'; g.fillRect(0, 0, W, H);
  figure(g, 330, 1490, 1.5, TOMAS, { t, wide: t > 97.47, sweat: t > 98.6, tilt: t > 97.47 ? -.12 : 0 });
  if (t > 98.64) for (let i = 0; i < 3; i++) { const p = ((t * 1.2 + i / 3) % 1); g.strokeStyle = `rgba(232,240,232,${1 - p})`; g.lineWidth = 7; g.beginPath(); g.arc(800, 600, 40 + p * 160, -0.7, 0.7); g.stroke(); g.beginPath(); g.arc(800, 600, 40 + p * 160, Math.PI - .7, Math.PI + .7); g.stroke(); }
  if (lt < 1.2) bigText(g, 'NOCHE 4', W / 2, 260, 120, '#e8f0e8', eback(prog(lt, 0, .3)), 'BB');
  if (t > 101.35) { const on = prog(t, 101.35, 101.6); g.save(); g.globalAlpha = on; g.fillStyle = 'rgba(160,255,190,.25)'; g.fillRect(MONS[5][0], MONS[5][1], 240, 175); g.restore(); digiClock(g, 760, 1000, .7 * eback(prog(t, 101.35, 101.6)), '3:10'); }
}, 'push', .3);
scene(104.45, (g, t, lt) => {
  g.fillStyle = '#040606'; g.fillRect(0, 0, W, H);
  const wy = lerp(520, 770, prog(t, 104.45, 113.6)), ws = lerp(.32, .72, prog(t, 104.45, 113.6));
  bigCam(g, 'CAM 6 · PISO 3', '03:10:' + String(Math.floor(lt) + 12).padStart(2, '0'), 'corridor', t, { walker: COPY, wx: 540 + Math.sin(t * .6) * 30, wy, ws, extra: { aL: -.5, holdL: flashlight(.9), smile: t > 113.44 ? 1 : 0 } });
  if (t > 113.44) { g.save(); g.globalAlpha = prog(t, 113.44, 113.6); cctv(g, 40, 430, CORR_W, CORR_H, 'CAM 6 · PISO 3', '03:10:21', cg => { cg.fillStyle = '#4b5a52'; cg.fillRect(0, 0, CORR_W, CORR_H); cg.save(); cg.translate(500, 420); cg.scale(4.2, 4.2); faceTomas(cg, { smile: 1 }, true); cg.restore(); }); g.restore(); }
}, 'push', .3);
// 9. Noches 5 y 6: edificio
scene(114.61, (g, t, lt) => {
  g.fillStyle = '#0b100e'; g.fillRect(0, 0, W, H);
  const f = t < 118.39 ? lerp(1, 2, eio(prog(t, 114.8, 116.2))) : lerp(2, 3, eio(prog(t, 118.5, 119.8)));
  building(g, W / 2, 830, .85, [f, ''], t);
  const lab = t < 118.39 ? ['NOCHE 5', '2:40'] : ['NOCHE 6', '1:30']; g.save(); g.font = '72px BB'; g.textAlign = 'center'; g.fillStyle = '#e8f0e8'; g.fillText(lab[0], W / 2 - 200, 230); g.restore(); digiClock(g, W / 2 + 200, 210, .55, lab[1]);
}, 'push', .3);
// 10. Otras cámaras / Ramiro en el sótano
scene(121.43, (g, t, lt) => {
  booth(g, t, { lit: .75 }); g.fillStyle = 'rgba(0,0,0,.3)'; g.fillRect(0, 0, W, H);
  const sel = Math.floor(prog(t, 121.5, 124.2) * 6) % 6; const [x, y] = MONS[t < 124.71 ? sel : 2]; g.strokeStyle = '#ffd21f'; g.lineWidth = 9; g.strokeRect(x - 10, y - 10, 260, 195);
  figure(g, 280, 1490, 1.3, TOMAS, { t, aL: -1.2 });
}, 'push', .3);
scene(126.89, (g, t, lt) => {
  g.fillStyle = '#040606'; g.fillRect(0, 0, W, H);
  const ang = t * 1.1; const z = t > 132.08 ? lerp(1, 2.2, eio(prog(t, 132.08, 133.4))) : 1;
  g.save(); g.translate(W / 2, 800); g.scale(z, z); g.translate(-W / 2, -800);
  bigCam(g, 'CAM 3 · SÓTANO', '03:42:17', 'basement', t, { walker: RAMIRO, wx: 540 + Math.cos(ang) * 260, wy: 640 + Math.sin(ang) * 40, ws: .8, pose: walk(t, .9, .3), extra: { flip: Math.sin(ang) < 0 } });
  g.restore();
  if (t > 133.79) { const k = eback(prog(t, 133.79, 134.1)); g.save(); g.translate(W / 2, 820); g.scale(k, k); rr(g, -360, -130, 720, 260, 10); fs(g, '#4a5560', 8); rr(g, -320, -90, 640, 180, 8); fs(g, '#e8e2cf', 5);
    g.font = '130px PM'; g.fillStyle = '#1b2a6a'; g.textAlign = 'center'; g.textBaseline = 'middle'; const nm = 'RAMIRO'; g.fillText(nm.slice(0, Math.max(0, Math.floor(prog(t, 134.2, 136.6) * 6))), 0, 10); g.restore(); }
}, 'push', .3);
// 11. Noche 7
scene(139.72, (g, t, lt) => {
  booth(g, t, { lit: lerp(.2, .85, prog(t, 142.2, 142.6)) });
  figure(g, W / 2, 1490, 1.6, TOMAS, { t, blink: t > 144 && t < 145, bob: Math.sin(t * 1.5) * 5 });
  if (lt < 1.2) bigText(g, 'NOCHE 7', W / 2, 260, 120, '#e8f0e8', eback(prog(lt, 0, .3)), 'BB');
  if (t > 145.58) digiClock(g, W / 2, 620, 1.3 * eback(prog(t, 145.58, 145.8)), '11:59');
}, 'push', .3);
scene(148.51, (g, t, lt) => {
  g.fillStyle = '#040606'; g.fillRect(0, 0, W, H);
  if (t < 151.62) { digiClock(g, W / 2, 800, 1.7 * eback(prog(t, 148.51, 148.75)), '12:00'); }
  else if (t < 153.97) bigCam(g, 'CAM 6 · PLANTA BAJA', '00:00:41', 'lobby', t, { walker: COPY, wx: 540, wy: 700, ws: .6, pose: idle(t), extra: { aL: -.5, holdL: flashlight(.9), smile: 1 } });
  else { const fl = t < 155.2 ? '4' : t < 156.69 ? '4' : t < 157.4 ? '3' : t < 158.1 ? '2' : '1';
    g.save(); g.translate(W / 2, 880); rr(g, -260, -230, 520, 460, 20); fs(g, '#151a19', 9); g.font = '300px BB'; g.textAlign = 'center'; g.textBaseline = 'middle'; g.shadowColor = '#ff3b30'; g.shadowBlur = 40; g.fillStyle = '#ff3b30'; g.fillText(fl, 40, 20);
    if (t > 156.69) { const a = Math.floor(t * 3) % 2; poly(g, [[-150, a ? 40 : 30], [-90, a ? -40 : -50], [-210, a ? -40 : -50]], '#ff3b30', 0); } g.restore(); }
}, 'push', .3);
// 12. Continuará
scene(158.80, (g, t, lt) => {
  g.fillStyle = '#060808'; g.fillRect(0, 0, W, H); const rg = g.createRadialGradient(W / 2, 820, 0, W / 2, 820, 700); rg.addColorStop(0, 'rgba(60,110,90,.35)'); rg.addColorStop(1, 'rgba(0,0,0,0)'); g.fillStyle = rg; g.fillRect(0, 0, W, H);
  for (let i = 0; i < 60; i++) { g.fillStyle = `rgba(200,240,220,${.2 + srnd(i) * .4})`; g.fillRect((srnd(i) * W + t * 15) % W, (srnd(i + 9) * H - t * 25 * (srnd(i + 3) + .3) + H * 9) % H, 4, 4); }
  const k = prog(lt, 0, .8); g.save(); g.globalAlpha = k; g.font = '900 120px CZ'; g.textAlign = 'center'; g.textBaseline = 'middle'; g.shadowColor = '#9dffb0'; g.shadowBlur = 40; g.fillStyle = '#d9f2e0'; g.fillText('CONTINUARÁ', W / 2, 760); g.restore();
  g.save(); g.globalAlpha = prog(lt, .4, 1); bigText(g, 'PARTE 3 · EL FINAL', W / 2, 900, 90, '#ffffff', 1, 'BB'); g.restore();
  if (lt > 1.67) bigText(g, 'SÍGUEME PARA NO PERDÉRTELA', W / 2, 1010, 64, '#ff4a3d', eback(prog(lt, 1.67, 1.95)), 'BB');
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
