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
  g.save(); g.scale(w / 1080, h / 1920 * (1920 / 1080) * (1080 / 1920) * (1920 / 1080) * .5625 * 1.0); g.restore();
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
