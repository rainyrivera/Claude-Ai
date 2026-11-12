// "El turno de las 3:17" – Parte 3 – animación 2D estilo recorte
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
function building(g, x, y, s, marker, t) { // corte del edificio por pisos
  g.save(); g.translate(x, y); g.scale(s, s);
  const F = ['PISO 4', 'PISO 3', 'PISO 2', 'ESCALERAS', 'PLANTA BAJA'];
  F.forEach((n, i) => { rr(g, -380, -560 + i * 220, 760, 210, 6); fs(g, i === 4 ? '#3a4a44' : '#2a3531', 6); g.font = '44px BB'; g.fillStyle = '#cfe3d6'; g.textAlign = 'left'; g.textBaseline = 'middle'; g.fillText(n, -350, -455 + i * 220);
    if (i === 4) { rr(g, 160, -540 + i * 220 + 60, 180, 120, 6); fs(g, '#1c2321', 5); g.font = '36px BB'; g.fillStyle = '#ffd21f'; g.textAlign = 'center'; g.fillText('CASETA', 250, -540 + i * 220 + 120); } });
  if (marker) { const [fy, label] = marker; g.save(); g.translate(0, -455 + fy * 220); g.shadowColor = '#ff2a2a'; g.shadowBlur = 30 + 10 * Math.sin(t * 8); ell(g, 0, 0, 56, 56, '#b3161b', 6); g.restore(); g.save(); g.translate(0, -455 + fy * 220); g.scale(.75, .75); faceTomas(g, { smile: 1 }, true); g.restore(); }
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
// ---------- textos ----------
const NAME = { 'tomás': '#47c6ff', 'tomás…': '#47c6ff', 'ramiro': '#ffb52e', 'mamá': '#ff9ad1', 'diecisiete': '#ff4a3d', 'gracias': '#ff4a3d' };

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
  [0.04, 3.3, 'YA ESTÁ ABAJO', '#b3161b', -2, 0],
  [3.43, 7.7, 'SI LLEGA PRIMERO…', '#111', 2, 0],
  [12.58, 19.4, 'EL CUADERNO', '#111', -2, 0],
  [29.22, 31.5, 'LA ÚLTIMA RONDA', '#b3161b', 2, 0],
  [31.64, 39.7, 'PISO 1', '#111', -2, 0],
  [39.84, 43.2, 'ES SU COPIA', '#b3161b', 2, 0],
  [43.27, 51.7, 'PISO 2', '#111', -2, 0],
  [51.80, 61.5, 'PISO 3', '#111', 2, 0],
  [61.60, 67.5, 'PISO 4', '#111', -2, 0],
  [70.35, 74.2, 'LA VOZ DE SU MAMÁ', '#b3161b', 2, 0],
  [75.65, 79.0, 'NO RESPONDAS', '#b3161b', -2, 0],
  [79.01, 82.3, 'RESPONDE', '#b3161b', 2, 0],
  [88.98, 92.5, '¡CORRE!', '#b3161b', -2, 0],
  [103.29, 109.1, 'GOLPEAN EL VIDRIO', '#b3161b', 2, 0],
  [118.62, 124.3, 'AMANECE', '#111', -2, 0],
  [124.40, 129.9, 'RENUNCIA', '#111', 2, 0],
  [132.47, 136.7, 'EN CASA', '#111', -2, 0],
  [140.47, 145.6, 'LLEGÓ HACE UNA HORA', '#b3161b', 2, 0],
  [145.67, 148.8, 'ARRIBA', '#111', -2, 0],
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
  [37.5, 39.8, '¿QUÉ ES ESO?', 330, 560, 380, 610, 520, 720, -6],
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

// ---------- escenas Parte 3 ----------
const S = [];
const scene = (t0, draw, tr = 'cut', trd = 0) => S.push({ t0, draw, tr, trd });
const CW = 1000, CH = 740;
const bigCam = (g, label, clk, kind, t, o) => cctv(g, 40, 430, CW, CH, label, clk, cg => camX(cg, CW, CH, kind, t, o));
const run = t => walk(t, 2.2, .75);

// 0. Gancho
scene(0, (g, t, lt) => {
  g.fillStyle = '#040606'; g.fillRect(0, 0, W, H);
  bigCam(g, 'CAM 6 · PLANTA BAJA', '00:00:52', 'lobby', t, { walker: COPY, wx: 540, wy: lerp(640, 760, prog(t, 0, 3.4)), ws: lerp(.5, .7, prog(t, 0, 3.4)), pose: walk(t, .7, .3), extra: { aL: -.5, holdL: flashlight(.9), smile: 1 } });
});
scene(3.43, (g, t, lt) => {
  booth(g, t, { lit: .5 }); g.fillStyle = 'rgba(0,0,0,.45)'; g.fillRect(0, 0, W, H);
  raceBar(g, 640, .1, lerp(1, .25, eio(prog(t, 3.5, 5.3))), null);
  const fade = prog(t, 5.6, 7.0); g.save(); g.globalAlpha = 1 - fade; figure(g, W / 2, 1480, 1.5, TOMAS, { t, wide: true, sweat: true }); g.restore();
  if (fade > 0) for (let i = 0; i < 40; i++) { const a = srnd(i) * 6.28, d = fade * 400 * srnd(i + 2); g.fillStyle = `rgba(30,45,69,${1 - fade})`; g.fillRect(W / 2 + Math.cos(a) * d, 1150 + Math.sin(a) * d - fade * 200, 14, 14); }
}, 'push', .3);
// 1. Título
scene(7.80, (g, t, lt) => {
  g.fillStyle = '#060908'; g.fillRect(0, 0, W, H);
  for (let i = 0; i < 400; i++) { g.fillStyle = `rgba(200,220,210,${srnd(i * 7 + Math.floor(t * 24)) * .12})`; g.fillRect(srnd(i + Math.floor(t * 24) * 1.3) * W, srnd(i * 3.3 + Math.floor(t * 24)) * H, 6, 2); }
  bigText(g, 'EL TURNO', W / 2, 520, 130, '#e8f0e8', eback(prog(lt, .05, .35)));
  bigText(g, 'DE LAS', W / 2, 650, 80, '#e8f0e8', eback(prog(lt, .3, .55)));
  const blink = Math.floor(lt * 2) % 2 === 0 || lt < 1; digiClock(g, W / 2, 900, 1.5 * eback(prog(lt, .5, .85)), blink ? '3:17' : '3 17');
  if (lt > 2.37) { const k = eback(prog(lt, 2.37, 2.6)); g.save(); g.translate(W / 2, 1150); g.rotate(-.05); g.scale(k, k); g.fillStyle = '#9d1418'; g.fillRect(-170, -56, 340, 112); g.lineWidth = 5; g.strokeStyle = '#ffd7c2'; g.strokeRect(-160, -46, 320, 92); g.font = '86px LG'; g.fillStyle = '#ffe9dc'; g.textAlign = 'center'; g.textBaseline = 'middle'; g.fillText('PARTE 3', 0, 8); g.restore(); }
  if (lt > 3.48) bigText(g, 'EL FINAL', W / 2, 1290, 90, '#ff4a3d', eback(prog(lt, 3.48, 3.7)), 'BB');
}, 'glitch', .35);
// 2. Cuaderno: contratapa
scene(12.58, (g, t, lt) => {
  booth(g, t, { lit: .6 }); g.fillStyle = 'rgba(0,0,0,.35)'; g.fillRect(0, 0, W, H);
  figure(g, 300, 1490, 1.3, TOMAS, { t, sweat: true, aL: -.9 });
  const flip = prog(t, 15.22, 15.8); g.save(); g.translate(720, 760); g.rotate(-.05); g.scale(Math.max(.05, Math.abs(Math.cos(flip * Math.PI))), 1);
  rr(g, -220, -280, 440, 560, 12); fs(g, flip < .5 ? '#6b4a2b' : '#7a5838', 8);
  if (flip < .5) { rr(g, -150, -90, 300, 120, 8); fs(g, '#e9e1c8', 5); g.font = '44px PM'; g.fillStyle = '#1d1a16'; g.textAlign = 'center'; g.textBaseline = 'middle'; g.fillText('RAMIRO', 0, -30); }
  else { rr(g, -190, -250, 380, 500, 6); fs(g, '#d8cfb4', 4); g.fillStyle = 'rgba(90,90,90,.5)'; for (let i = 0; i < 5; i++) g.fillRect(-150, -170 + i * 70, 280 - (i % 2) * 60, 10); }
  g.restore();
}, 'push', .3);
const STEPS = [['Terminar la ronda antes que él', 19.52], ['Volver a la caseta', 23.18], ['Cerrar con llave', 24.47], ['NO responder a tu nombre', 25.82]];
scene(17.45, (g, t, lt) => {
  g.fillStyle = '#0c100f'; g.fillRect(0, 0, W, H); g.save(); cam(g, lt, 11.7, .06, W / 2, 860);
  g.save(); g.translate(W / 2, 860); g.rotate(.02); rr(g, -450, -560, 900, 1120, 10); fs(g, '#d8cfb4', 8); g.fillStyle = 'rgba(0,0,0,.06)'; for (let i = 0; i < 30; i++) g.fillRect(-440 + srnd(i) * 860, -540 + srnd(i + 9) * 1080, 30, 3);
  g.font = '62px PM'; g.fillStyle = '#4a4a4a'; g.textAlign = 'center'; g.textBaseline = 'middle'; g.fillText('LA ÚNICA FORMA:', 0, -450);
  STEPS.forEach(([s, t0], i) => { if (t < t0) return; const k = prog(t, t0, t0 + .7); const y = -280 + i * 190; rr(g, -400, y - 40, 80, 80, 8); fs(g, '#f2efe6', 5);
    g.save(); g.beginPath(); g.rect(-300, y - 70, 740 * k, 140); g.clip(); g.font = (i === 3 ? '46px' : '44px') + ' PM'; g.textAlign = 'left'; g.fillStyle = i === 3 ? '#8a1010' : '#4a4a4a'; g.fillText(s, -300, y); g.restore();
    if (i === 3 && t > 27.12) { g.strokeStyle = '#b3161b'; g.lineWidth = 8; g.beginPath(); g.moveTo(-300, y + 45); g.lineTo(-300 + 700 * prog(t, 27.12, 27.8), y + 45); g.stroke(); } });
  g.restore(); g.restore();
}, 'zoom', .3);
// 3. Toma la linterna y sale
scene(29.22, (g, t, lt) => {
  booth(g, t, { lit: .6 }); g.fillStyle = 'rgba(0,0,0,.3)'; g.fillRect(0, 0, W, H);
  const x = lerp(400, 1250, eio(prog(t, 29.9, 31.6))); figure(g, x, 1490, 1.3, TOMAS, { ...(t > 29.9 ? walk(t, 1.4, .5) : idle(t)), t, aL: -.5, holdL: flashlight(.9) });
}, 'push', .3);
// 4. Piso 1
scene(31.64, (g, t, lt) => {
  corridor(g, t, { stretchers: false, dark: .35 });
  for (const [x, y, s, r] of [[380, 1260, .9, .5], [700, 1120, .65, -.4], [520, 980, .45, .9]]) { g.save(); g.translate(x, y); g.rotate(r); g.scale(s, s); rr(g, -140, -40, 280, 34, 8); fs(g, '#9a8d7a', 5); g.lineWidth = 7; g.strokeStyle = '#5b4a3a'; g.beginPath(); g.moveTo(-120, -6); g.lineTo(-120, 90); g.moveTo(120, -6); g.lineTo(120, 90); g.stroke(); g.restore(); }
  if (t > 36.15) { const k = prog(t, 36.15, 41.1); const s = lerp(.25, .75, k); figure(g, 540, lerp(900, 1180, k), s, COPY, { ...walk(t, .7, .3), t, aL: -.5, holdL: flashlight(1), smile: t > 39.84 ? 1 : 0 }); }
  if (t > 39.84) { g.save(); g.globalAlpha = .25 * Math.abs(Math.sin(t * 8)); g.fillStyle = '#ff2020'; g.fillRect(0, 0, W, H); g.restore(); }
  const rx = t > 41.17 ? lerp(300, -300, eio(prog(t, 41.17, 42.9))) : 300; figure(g, rx, 1500, 1.1, TOMAS, { ...(t > 41.17 ? run(t) : idle(t)), t, flip: t > 41.17, wide: t > 39.84, aL: t > 41.17 ? 1 : -.5, holdL: t > 41.17 ? null : flashlight(.8) });
}, 'push', .3);
// 5. Piso 2: pasos que imitan
scene(43.27, (g, t, lt) => {
  corridor(g, t, { dark: .45 }); const running = (t > 46.85 && t < 48.87); const stopped = t > 48.87;
  figure(g, 540, 1460, 1.1, TOMAS, { ...(running ? run(t) : idle(t)), t, wide: true, sweat: true, aL: running ? .9 : -.4, holdL: running ? null : flashlight(.8) });
  const active = t > 44.57 && (!stopped || t < 49.9);
  if (active) for (let i = 0; i < 6; i++) { const ph = (t * (running ? 3 : 1.4) + i / 6) % 1; const side = i % 2 ? 1 : -1; g.save(); g.globalAlpha = (1 - ph) * .9; g.translate(540 + side * 120, 900 - ph * 300); g.rotate(side * .2); ell(g, 0, 0, 22, 40, '#e8f0e8', 3); ell(g, 0, -52, 14, 14, '#e8f0e8', 3); g.restore(); }
  if (stopped && t > 49.9) bigText(g, '…', W / 2, 760, 160, '#e8f0e8', 1);
}, 'push', .3);
// 6. Piso 3: humo y relojes
scene(51.80, (g, t, lt) => {
  corridor(g, t, { dark: .2, smoke: .45, flick: false });
  g.fillStyle = '#0d0a08'; for (let i = 0; i < 10; i++) { g.beginPath(); g.ellipse(srnd(i) * W, 300 + srnd(i + 4) * 1000, 120, 220, srnd(i + 2), 0, 7); g.fill(); }
  for (let i = 0; i < 9; i++) { const p = (t * .22 + i / 9) % 1; g.fillStyle = `rgba(60,52,46,${.55 * (1 - p)})`; g.beginPath(); g.arc(srnd(i) * W, H - p * H * 1.2, 140 + p * 120, 0, 7); g.fill(); }
  if (t > 57.17) { [[260, 560, 90], [820, 520, 80], [540, 380, 70]].forEach(([x, y, r], i) => { const k = eback(prog(t, 57.2 + i * .25, 57.5 + i * .25)); if (k > 0) { g.save(); g.translate(x, y); g.scale(k, k); analogClock(g, 0, 0, r, 3, 17, 1); g.restore(); } }); }
  figure(g, 540, 1470, 1.1, TOMAS, { ...walk(t, .8, .3), t, aL: -.5, holdL: flashlight(.6), tilt: Math.sin(t) * .05 });
  if (t > 59.59) { const k = eback(prog(t, 59.59, 59.85)); g.save(); g.translate(W / 2, 800); g.scale(k, k); rr(g, -360, -120, 720, 240, 30); fs(g, 'rgba(12,12,12,.92)', 6); g.font = '60px BB'; g.textAlign = 'center'; g.textBaseline = 'middle'; g.fillStyle = '#e8f0e8'; g.fillText('SU RELOJ', -170, -60); g.fillText('LAS PAREDES', 170, -60); g.font = '110px BB'; g.fillStyle = '#7fe08a'; g.fillText('3:00', -170, 40); g.fillStyle = '#ff3b30'; g.fillText('3:17', 170, 40); g.restore(); }
}, 'push', .3);
// 7. Piso 4: silencio y la voz
scene(61.60, (g, t, lt) => {
  g.fillStyle = '#020303'; g.fillRect(0, 0, W, H);
  g.save(); g.beginPath(); g.moveTo(560, 1200); g.lineTo(200, 300); g.lineTo(900, 300); g.closePath(); g.clip(); corridor(g, t, { dark: .55, flick: false }); g.restore();
  figure(g, 560, 1480, 1.2, TOMAS, { t, wide: t > 64.65, aL: -2.6, holdL: flashlight(0) });
  if (t > 67.62) { const lines = t < 68.54 ? ['¿TOMÁS?'] : t < 69.26 ? ['¿TOMÁS?', 'HIJO…'] : ['¿TOMÁS? HIJO…', '¿ERES TÚ?']; bubble(g, 640, 560, 640, 260, lines, { wobble: true, tail: [-60, -140], size: 62 }); }
  if (t > 70.35) { g.save(); g.globalAlpha = .55 * prog(t, 70.35, 71.2); g.translate(840, 300); g.scale(1.6, 1.6); ell(g, 0, 0, 60, 60, 'rgba(255,154,209,.25)', 0); MOM.head(g, {}); g.restore(); }
}, 'push', .3);
// 8. Se congela / regla 4 / responde
scene(74.25, (g, t, lt) => {
  g.fillStyle = '#030404'; g.fillRect(0, 0, W, H);
  if (t < 77.69) { sheet(g, W / 2, 820, .85, 4, t, lt, 3); if (t > 75.65) { const k = prog(t, 75.65, 76.2); g.strokeStyle = '#ff2020'; g.lineWidth = 10; g.beginPath(); g.ellipse(W / 2 - 20, 1100, 420 * k + 10, 100 * k + 5, -.03, 0, 7); g.stroke(); } }
  else if (t < 79.01) { bubble(g, W / 2, 760, 700, 300, ['*LLANTO*'], { wobble: true, size: 80, color: '#5a3a60' }); for (let i = 0; i < 6; i++) { const p = (t * 1.5 + i / 6) % 1; ell(g, 300 + i * 90, 920 + p * 300, 10, 16, `rgba(160,210,255,${1 - p})`, 0); } }
  else { figure(g, W / 2, 1520, 1.8, TOMAS, { t, wide: true, sweat: true, mouth: t > 81.38 ? 'o' : null });
    if (t > 81.38) bubble(g, 760, 540, 380, 180, ['¿MAMÁ?'], { size: 70, tail: [-120, -170] });
    if (t > 81.6) { g.save(); g.translate(240, 560); g.rotate(-.15); sheet(g, 0, 0, .28, 4, t, lt, 3); g.strokeStyle = '#ff2020'; g.lineWidth = 16; g.beginPath(); g.moveTo(-110, -140); g.lineTo(110, 140); g.moveTo(110, -140); g.lineTo(-110, 140); g.stroke(); g.restore(); } }
}, 'push', .3);
scene(82.36, (g, t, lt) => {
  g.fillStyle = '#000'; g.fillRect(0, 0, W, H);
  if (t > 83.89 && t < 87.81) bubble(g, W / 2, 760, 600, 220, ['…'], { size: 120, fill: '#1b1b1b', color: '#ff2b2b' });
  if (t > 87.81) { const k = eback(prog(t, 87.81, 88.05)); g.save(); g.translate(W / 2, 760); g.scale(k, k); bubble(g, 0, 0, 760, 300, ['GRACIAS'], { size: 150, font: 'PM', fill: '#120404', color: '#ff2020', shake: 10 }); g.restore();
    g.save(); g.globalAlpha = .3; g.translate(W / 2, 1150); g.scale(3.5, 3.5); faceTomas(g, { smile: 1 }, true); g.restore(); }
}, 'push', .3);
// 9. Carrera a la caseta
scene(88.98, (g, t, lt) => {
  corridor(g, t, { dark: .4, stretchers: false });
  const x = lerp(-100, 1200, prog(t, 88.98, 92.5)); figure(g, x, 1480, 1.1, TOMAS, { ...run(t), t, aL: 1, aR: -1, sweat: true, wide: true });
}, 'push', .3);
scene(92.61, (g, t, lt) => {
  g.fillStyle = '#0a0d0c'; g.fillRect(0, 0, W, H); g.fillStyle = '#2b3530'; g.fillRect(0, 1180, W, H); g.fillStyle = '#4b5a52'; g.fillRect(0, 300, W, 880);
  rr(g, 430, 560, 220, 620, 6); fs(g, '#3b4a44', 8); rr(g, 470, 620, 140, 160, 4); fs(g, '#cfe8d6', 5);
  const a = prog(t, 92.61, 100.3), b = 1 - prog(t, 95.02, 100.3) * .85;
  figure(g, lerp(80, 400, a), 1440, .85, TOMAS, { ...run(t), t, aL: 1, aR: -1, wide: true });
  if (t > 95.02) figure(g, lerp(1100, 740, prog(t, 95.02, 100.3)), 1440, .85, COPY, { ...run(t + .3), t, aL: 1, aR: -1, smile: 1, flip: true });
  const lab = t > 99.61 ? '3 M' : t > 98.5 ? '5 M' : '10 M'; raceBar(g, 250, a, b, lab);
}, 'push', .3);
// 10. Entra y cierra con llave
scene(100.41, (g, t, lt) => {
  g.fillStyle = '#0a0d0c'; g.fillRect(0, 0, W, H);
  const slam = eio(prog(t, 101.3, 101.6)); rr(g, 200, 300, 680, 1100, 10); fs(g, '#1c2321', 8); g.save(); g.translate(200, 300); g.scale(lerp(.2, 1, slam), 1); rr(g, 0, 0, 680, 1100, 10); fs(g, '#3b4a44', 8); g.restore();
  if (t > 101.6) { g.save(); g.translate(W / 2, 1000); ell(g, 0, 0, 110, 110, '#c9a24a', 7); rr(g, -18, -60, 36, 120, 8); g.save(); g.rotate(eio(prog(t, 102.2, 102.8)) * Math.PI / 2); rr(g, -14, -70, 28, 140, 8); fs(g, '#e8d9a8', 5); g.restore(); g.restore(); }
  if (t > 102.8) stamp(g, 'CERRADO', W / 2, 640, prog(t, 102.8, 103.0), '#1f9e4a', -.08, 110);
}, 'push', .3);
// 11. Golpes en el vidrio
scene(103.29, (g, t, lt) => {
  g.fillStyle = '#0a0d0c'; g.fillRect(0, 0, W, H); const sh = t > 104.4 ? Math.sin(t * 40) * 6 * (Math.sin(t * 3) > 0) : 0;
  g.save(); g.translate(sh, 0); rr(g, 120, 260, 840, 1180, 10); fs(g, '#3b4a44', 10); rr(g, 220, 360, 640, 760, 6); fs(g, '#4f6a5e', 7);
  g.save(); rr(g, 220, 360, 640, 760, 6); g.clip(); g.fillStyle = '#20302a'; g.fillRect(220, 360, 640, 760); const z = t > 105.93 ? lerp(3.4, 4.6, prog(t, 105.93, 108.8)) : 3.2; g.translate(540, 760); g.scale(z, z); faceTomas(g, { smile: 0 }, true); g.restore();
  g.fillStyle = 'rgba(220,240,230,.12)'; poly(g, [[260, 380], [420, 380], [260, 600]], 'rgba(220,240,230,.12)', 0);
  for (const [x, y] of [[300, 980], [760, 1000]]) { g.fillStyle = 'rgba(230,230,220,.25)'; g.beginPath(); g.ellipse(x, y, 40, 50, 0, 0, 7); g.fill(); for (let f = 0; f < 4; f++) { g.beginPath(); g.ellipse(x - 30 + f * 20, y - 70, 9, 22, 0, 0, 7); g.fill(); } }
  g.restore();
}, 'push', .3);
// 12. 3:17 – uno, dos, tres… nada
scene(109.21, (g, t, lt) => {
  booth(g, t, { lit: .45 }); g.fillStyle = 'rgba(0,0,0,.4)'; g.fillRect(0, 0, W, H);
  if (t < 111.63) digiClock(g, W / 2, 720, 1.5 * eback(prog(t, 109.21, 109.45)), '3:17');
  else if (t < 117.61) { figure(g, W / 2, 1520, 1.8, TOMAS, { t, wide: true, sweat: true, blink: false });
    const n = t > 115.92 ? '3' : t > 115.11 ? '2' : t > 114.43 ? '1' : null; if (n) { const t0 = n === '1' ? 114.43 : n === '2' ? 115.11 : 115.92; bigText(g, n, W / 2, 520, 260, '#ff2b2b', eback(prog(t, t0, t0 + .15))); g.save(); g.translate((Math.random() - .5) * 20 * (1 - prog(t, t0, t0 + .3)), 0); g.restore(); } }
  else { g.fillStyle = '#000'; g.fillRect(0, 0, W, H); bigText(g, 'NADA', W / 2, 800, 140, '#e8f0e8', eback(prog(t, 117.61, 117.9)), 'BB'); }
}, 'push', .3);
// 13. Amanecer
scene(118.62, (g, t, lt) => {
  if (t < 120.83) { const gr = g.createLinearGradient(0, 0, 0, H); gr.addColorStop(0, '#5a7aa0'); gr.addColorStop(.55, '#f0a070'); gr.addColorStop(1, '#f6d6a0'); g.fillStyle = gr; g.fillRect(0, 0, W, H); g.save(); g.shadowColor = '#fff1b8'; g.shadowBlur = 90; ell(g, W / 2, lerp(520, 380, prog(t, 118.6, 120.8)), 110, 110, '#fff1b8', 0); g.restore(); clinicExtNoSky(g, t); }
  else if (t < 124.40) { booth(g, t, { lit: .95 }); g.fillStyle = 'rgba(255,200,140,.12)'; g.fillRect(0, 0, W, H); if (t < 122.78) { g.strokeStyle = '#ff2b2b'; g.lineWidth = 9; g.strokeRect(MONS[5][0] - 10, MONS[5][1] - 10, 260, 195); g.fillStyle = '#000'; g.fillRect(MONS[5][0], MONS[5][1], 240, 175); }
    else { g.save(); g.fillStyle = 'rgba(0,0,0,.5)'; g.fillRect(0, 0, W, H); g.restore(); cctv(g, 90, 520, 900, 660, 'CAM 1 · PASILLO', '06:00:12', cg => camX(cg, 900, 660, 'corridor', t, {})); } }
  else { const gr = g.createLinearGradient(0, 0, 0, H); gr.addColorStop(0, '#7aa6c9'); gr.addColorStop(.6, '#f2c48a'); gr.addColorStop(1, '#f6dca0'); g.fillStyle = gr; g.fillRect(0, 0, W, H); clinicExtNoSky(g, t);
    figure(g, 360, 1300, 1.0, TOMAS, { ...idle(t), t, aR: t < 126.4 ? -.9 : -.12, mouth: t > 126.79 ? 'smile' : null });
    figure(g, 760, 1300, 1.0, BOSS, { ...idle(t, 2), t, aL: t < 126.4 ? .9 : .12 });
    if (t < 126.4) { g.save(); g.translate(560, 1050); ell(g, -12, 0, 26, 26, '#d7a93a', 5); rr(g, 6, -8, 54, 14, 4); fs(g, '#d7a93a', 4); g.restore(); }
    if (t > 126.79) { const k = eback(prog(t, 126.79, 127.1)); g.save(); g.translate(360, 760); g.scale(k, k); ell(g, 0, 0, 100, 100, '#1f9e4a', 6); g.strokeStyle = '#fff'; g.lineWidth = 16; g.beginPath(); g.moveTo(-40, 0); g.lineTo(-10, 34); g.lineTo(46, -36); g.stroke(); g.restore(); } }
}, 'push', .3);
// 14. Maneja / abre la puerta
scene(129.98, (g, t, lt) => {
  if (t < 131.41) { const gr = g.createLinearGradient(0, 0, 0, H); gr.addColorStop(0, '#7aa6c9'); gr.addColorStop(1, '#f6dca0'); g.fillStyle = gr; g.fillRect(0, 0, W, H);
    g.fillStyle = '#4a4a4a'; g.fillRect(0, 1250, W, 300); g.fillStyle = '#f2efe6'; for (let x = -((t * 900) % 200); x < W; x += 200) g.fillRect(x, 1390, 110, 16); g.fillStyle = '#6a8a4a'; g.fillRect(0, 1550, W, H);
    for (let i = 0; i < 5; i++) { const x = ((i * 300 - t * 500) % 1500 + 1500) % 1500 - 200; rr(g, x, 1000, 30, 250, 6); fs(g, '#6b4a2b', 5); ell(g, x + 15, 960, 90, 90, '#5d8f4a', 6); }
    car(g, W / 2, 1360 + Math.sin(t * 20) * 3, 1.0, 0, '#2d5fb3'); }
  else { house(g, t); const op = eio(prog(t, 131.41, 132.1)); g.save(); g.translate(470, 1060); g.scale(lerp(1, .15, op), 1); rr(g, 0, 0, 140, 340, 6); fs(g, '#6b4a2b', 7); g.restore(); if (op > 0) { g.fillStyle = '#ffe9b0'; g.fillRect(470 + 140 * (1 - op * .85) + 2, 1064, 140 * op * .85 - 4, 332); } }
}, 'push', .3);
// 15. Cocina: taza
scene(132.47, (g, t, lt) => {
  kitchen(g, t); const fall = prog(t, 134.89, 135.5);
  figure(g, 640, 1330, 1.2, MOM, { t, aR: t < 134.89 ? -1.6 : -.4, wide: t > 134.14, mouth: t > 134.14 ? 'o' : null, pale: t > 134.14 });
  if (t > 134.14) figure(g, 180, 1400, 1.1, TOMAS, { t, mouth: 'smile' });
  if (fall < 1) mug(g, lerp(800, 820, fall), lerp(990, 1450, fall * fall), 1.2, fall * 4);
  else { for (let i = 0; i < 9; i++) { const a = srnd(i) * 3.14, d = eout(prog(t, 135.5, 136)) * 160 * srnd(i + 1); poly(g, [[0, -14], [16, 6], [-10, 12]].map(([x, y]) => [820 + Math.cos(a) * d * (srnd(i + 2) > .5 ? 1 : -1) + x, 1460 - Math.sin(a) * d * .3 + y]), '#f2efe6', 3); } }
}, 'push', .3);
scene(136.82, (g, t, lt) => {
  kitchen(g, t, .7); g.save(); g.translate(W / 2, 1700); figure(g, 0, 0, 2.4, MOM, { t, pale: true, wide: true, mouth: t > 140.47 ? 'o' : null, bob: Math.sin(t * 30) * 3 }); g.restore();
  if (t > 140.47) { const lines = t < 141.57 ? ['«TOMÁS…»'] : t < 143.47 ? ['«TÚ LLEGASTE', 'HACE UNA HORA»'] : ['«ESTÁS ARRIBA,', 'DURMIENDO»']; bubble(g, W / 2, 520, 820, 280, lines, { size: 70, tail: [40, 120] }); }
}, 'push', .3);
// 16. Escalera: la puerta se cierra / la voz de arriba
scene(145.67, (g, t, lt) => {
  homeStairs(g, t, eio(prog(t, 146.2, 148.4)), lerp(.25, .5, prog(t, 145.7, 150)));
  if (t > 148.89 && t < 152.25) { g.save(); g.globalAlpha = .7; g.fillStyle = '#000'; g.beginPath(); g.ellipse(540, 120, 40, 50, 0, 0, 7); g.fill(); g.restore(); }
  if (t > 152.25) bubble(g, 680, 700, 760, 260, t < 153.12 ? ['«¿MAMÁ?»'] : ['«¿MAMÁ?', '¿QUIÉN ESTÁ AHÍ ABAJO?»'], { size: 62, tail: [-140, -260], wobble: true });
  if (t > 152.25) { g.save(); g.globalAlpha = .9; g.translate(540, 380); g.scale(1.3, 1.3); g.beginPath(); g.rect(-120, -160, 240, 120); g.clip(); g.restore(); }
}, 'push', .3);
// 17. Fin
scene(154.65, (g, t, lt) => {
  g.fillStyle = '#050606'; g.fillRect(0, 0, W, H);
  for (let i = 0; i < 60; i++) { g.fillStyle = `rgba(200,240,220,${.2 + srnd(i) * .4})`; g.fillRect((srnd(i) * W + t * 15) % W, (srnd(i + 9) * H - t * 25 * (srnd(i + 3) + .3) + H * 9) % H, 4, 4); }
  const k = prog(lt, 0, .5); g.save(); g.globalAlpha = k; g.font = '900 220px CZ'; g.textAlign = 'center'; g.textBaseline = 'middle'; g.shadowColor = '#ff2b2b'; g.shadowBlur = 50; g.fillStyle = '#f0e2d0'; g.fillText('FIN', W / 2, 720); g.restore();
  g.save(); g.globalAlpha = .25 * prog(lt, .5, 1.5); g.translate(W / 2, 1050); g.scale(1.6, 1.6); faceTomas(g, { smile: 1 }, true); g.restore();
  if (lt > 1.85) bigText(g, 'SÍGUEME PARA MÁS', W / 2, 1180, 76, '#ffffff', eback(prog(lt, 1.85, 2.1)), 'BB');
  if (lt > 2.3) bigText(g, 'HISTORIAS DE TERROR', W / 2, 1270, 76, '#ff4a3d', eback(prog(lt, 2.3, 2.55)), 'BB');
}, 'fade', .5);
const _cx = mk(W, H); function clinicExtNoSky(g, t) { const c = _cx, cg = c.getContext('2d'); cg.clearRect(0, 0, W, H); clinicExt(cg, t, 0); cg.globalCompositeOperation = 'destination-out'; cg.fillStyle = '#000'; cg.fillRect(0, 0, W, 380); cg.globalCompositeOperation = 'source-over'; g.drawImage(c, 0, 0); }
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
