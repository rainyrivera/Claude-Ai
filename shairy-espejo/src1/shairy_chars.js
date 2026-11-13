// ---------- El otro lado del espejo: personajes y gráficos ----------
// mir = reflejo (detalles al revés); unc = sonrisa inquietante
function smile(g, p, w = 14, y = 22) { g.lineWidth = 4; g.strokeStyle = OL; g.beginPath(); if (p.unc) { g.moveTo(-26, y - 2); g.quadraticCurveTo(0, y + 22, 26, y - 2); } else if (p.mouth === 'o') g.ellipse(0, y + 6, 7, 10, 0, 0, 7); else if (p.mouth === 'cry') g.arc(0, y + 14, 12, Math.PI + .3, -.3); else if (p.mouth === 'yell') g.ellipse(0, y + 6, 14, 12, 0, 0, 7); else if (p.mouth === 'flat') { g.moveTo(-10, y + 4); g.lineTo(10, y + 4); } else g.arc(0, y, w, .3, Math.PI - .3); g.stroke(); }
function eyesX(g, p, dx = 15, y = -2) { if (p.unc) { ell(g, -dx, y, 10, 11, '#fff', 3); ell(g, dx, y, 10, 11, '#fff', 3); g.fillStyle = OL; g.beginPath(); g.arc(-dx, y, 3.5, 0, 7); g.arc(dx, y, 3.5, 0, 7); g.fill(); } else eyes(g, y, dx, p.blink, OL, p.wide ? 7 : 5); if (p.tears) { ell(g, -dx - 2, y + 18, 5, 9, '#9fd0ff', 2); ell(g, dx + 2, y + 18, 5, 9, '#9fd0ff', 2); } }
const SHAIRY = {
  skin: '#d8a882', armC: '#3f8f8a', legC: '#2b3046', bootC: '#f2f2f2', torso: '#3f8f8a', tw: 104, handC: '#d8a882',
  capeBack: (g, tw, th) => { g.beginPath(); g.moveTo(-60, -th - 60); g.quadraticCurveTo(-80, -th + 60, -56, -th + 70); g.lineTo(56, -th + 70); g.quadraticCurveTo(80, -th + 60, 60, -th - 60); g.closePath(); fs(g, '#2a1a14', 5); },
  head: (g, p) => { ell(g, 0, 0, 42, 52, '#d8a882'); g.beginPath(); g.moveTo(-46, 30); g.quadraticCurveTo(-56, -66, 0, -62); g.quadraticCurveTo(56, -66, 46, 30); g.lineTo(38, -10); g.quadraticCurveTo(10, -40, -20, -36); g.quadraticCurveTo(-36, -20, -40, 0); g.closePath(); fs(g, '#2a1a14', 5);
    eyesX(g, p); smile(g, p); ell(g, 30, -36, 9, 6, '#ff7aa8', 3); },
  torsoDeco: (g, tw, th) => { g.lineWidth = 4; g.strokeStyle = OL; g.beginPath(); g.moveTo(-26, -th + 6); g.quadraticCurveTo(0, -th + 40, 26, -th + 6); g.stroke(); rr(g, -34, -70, 68, 40, 8); fs(g, '#357a76', 3); g.beginPath(); g.moveTo(-10, -th + 24); g.lineTo(-12, -th + 70); g.moveTo(10, -th + 24); g.lineTo(12, -th + 70); g.stroke(); },
};
const mamaHead = (g, p) => { const m = p.mir ? 1 : -1; g.beginPath(); g.moveTo(-50, 50); g.quadraticCurveTo(-60, -66, 0, -60); g.quadraticCurveTo(60, -66, 50, 50); g.closePath(); fs(g, '#4a2a1a', 5); ell(g, 0, 0, 41, 51, '#dfb08c');
  g.beginPath(); g.moveTo(-42, -6); g.quadraticCurveTo(-20, -60, 40, -20); g.quadraticCurveTo(10, -42, -42, -6); fs(g, '#4a2a1a', 4);
  eyesX(g, p); smile(g, p, 12, 24); ell(g, 22 * m, 16, 4.5, 4.5, '#3a1a10', 0); };
const MAMA = { skin: '#dfb08c', armC: '#c4566a', legC: '#3a3a4a', bootC: '#2a2020', torso: '#c4566a', tw: 104, handC: '#dfb08c', head: mamaHead,
  torsoDeco: (g, tw, th) => { poly(g, [[-36, -th + 30], [36, -th + 30], [42, 10], [-42, 10]], '#f2ead8', 4); } };
const papaHead = (g, p) => { ell(g, 0, 0, 44, 53, '#c8946c'); ell(g, -44, 4, 9, 13, '#c8946c', 4); ell(g, 44, 4, 9, 13, '#c8946c', 4);
  g.beginPath(); g.moveTo(-46, -4); g.quadraticCurveTo(-46, -64, 0, -60); g.quadraticCurveTo(46, -64, 46, -4); g.lineTo(36, -28); g.lineTo(-36, -28); g.closePath(); fs(g, '#1e1612', 5);
  eyesX(g, p); g.beginPath(); g.moveTo(-22, 16); g.quadraticCurveTo(0, 8, 22, 16); g.quadraticCurveTo(0, 26, -22, 16); fs(g, '#1e1612', 4); smile(g, p, 10, 30); };
const PAPA = { skin: '#c8946c', armC: '#3a5a8a', legC: '#3a3a40', bootC: '#2a1e16', torso: '#3a5a8a', tw: 126, handC: '#c8946c', head: papaHead,
  torsoDeco: (g, tw, th) => { g.lineWidth = 4; g.strokeStyle = OL; g.beginPath(); g.moveTo(0, -th); g.lineTo(0, 8); g.stroke(); for (const y of [-130, -80, -30]) ell(g, 8, y, 5, 5, '#e8e8e8', 0); } };
const joaHead = (g, p) => { const m = p.mir ? -1 : 1; ell(g, 0, 0, 44, 50, '#d9ad88'); g.beginPath(); g.moveTo(-46, 6); g.quadraticCurveTo(-48, -64, 0, -60); g.quadraticCurveTo(48, -64, 46, 6); g.lineTo(36, -24); g.lineTo(-36, -24); g.closePath(); fs(g, '#3a2414', 5);
  g.strokeStyle = '#e8c9a0'; g.lineWidth = 4; g.beginPath(); g.moveTo(-18 * m, -58); g.lineTo(-14 * m, -26); g.stroke(); eyesX(g, p, 15, 2); smile(g, p, 10, 24); };
const JOAQUIN = { skin: '#d9ad88', armC: '#e0a030', legC: '#2f3a55', bootC: '#c4161c', torso: '#e0a030', tw: 92, th: 140, leg: 140, arm: 120, handC: '#d9ad88', head: joaHead };
function canela(g, x, y, s, t, growl = 0) {
  g.save(); g.translate(x, y); g.scale(s, s); const sh = growl ? Math.sin(t * 40) * 2 : 0; g.translate(sh, 0);
  for (const lx of [-70, -40, 40, 70]) { rr(g, lx - 10, 0, 20, 70, 8); fs(g, '#c8823a', 4); }
  ell(g, 0, -10, 100, 50, '#d8924a'); g.save(); g.translate(-100, -60); g.rotate(-.3); g.lineWidth = 14; g.strokeStyle = '#c8823a'; g.beginPath(); g.moveTo(0, 50); g.quadraticCurveTo(-20, 0, -10, -30); g.stroke(); g.restore();
  g.save(); g.translate(110, -50); ell(g, 0, 0, 48, 42, '#d8924a'); poly(g, [[-30, -30], [-20, -70], [-4, -34]], '#a8622a', 4); poly(g, [[30, -30], [20, -70], [4, -34]], '#a8622a', 4); ell(g, 30, 14, 22, 16, '#e8b07a', 3); ell(g, 46, 8, 7, 6, '#111', 0);
  eyes(g, -6, 14, false, OL, 4); if (growl) { g.strokeStyle = OL; g.lineWidth = 3; g.beginPath(); g.moveTo(-24, -18); g.lineTo(-6, -12); g.moveTo(24, -18); g.lineTo(6, -12); g.stroke(); g.fillStyle = '#fff'; g.fillRect(18, 24, 6, 8); g.fillRect(30, 24, 6, 8); } g.restore();
  g.restore();
}
// espejo antiguo
function mirror(g, x, y, s, { crack = 0, cover = 0, inside = null, glow = 0, t = 0 } = {}) {
  g.save(); g.translate(x, y); g.scale(s, s);
  g.beginPath(); g.moveTo(-200, 360); g.lineTo(-200, -200); g.quadraticCurveTo(-200, -380, 0, -390); g.quadraticCurveTo(200, -380, 200, -200); g.lineTo(200, 360); g.closePath(); fs(g, '#b8862f', 10);
  for (const [a, b] of [[-200, -200], [200, -200], [-200, 360], [200, 360], [0, -390]]) ell(g, a, b, 22, 22, '#d7a93a', 5);
  g.save(); g.beginPath(); g.moveTo(-160, 330); g.lineTo(-160, -190); g.quadraticCurveTo(-160, -340, 0, -350); g.quadraticCurveTo(160, -340, 160, -190); g.lineTo(160, 330); g.closePath(); g.clip();
  const gr = g.createLinearGradient(-160, -350, 160, 330); gr.addColorStop(0, '#9fb8c4'); gr.addColorStop(1, '#3a4e5a'); g.fillStyle = gr; g.fillRect(-170, -360, 340, 700);
  if (inside) inside(g); g.fillStyle = 'rgba(255,255,255,.12)'; poly(g, [[-150, -300], [-60, -340], [-150, -40]], 'rgba(255,255,255,.14)', 0);
  if (crack > 0) { g.strokeStyle = glow ? `rgba(255,240,200,${.6 + .4 * glow})` : '#f4f8fa'; g.lineWidth = 5; if (glow) { g.shadowColor = '#fff6d0'; g.shadowBlur = 30 * glow; } g.beginPath(); let px = 10, py = -350; g.moveTo(px, py); const P = [[-20, -250], [30, -150], [-10, -40], [40, 60], [0, 170], [30, 330]]; P.forEach(([a, b], i) => { if (i / P.length <= crack) { px = a; py = b; g.lineTo(a, b); } }); g.stroke();
    if (crack > .5) { g.beginPath(); g.moveTo(-10, -40); g.lineTo(-90, -10); g.moveTo(40, 60); g.lineTo(120, 40); g.moveTo(30, -150); g.lineTo(110, -190); g.stroke(); } g.shadowBlur = 0; }
  g.restore();
  if (cover > 0) { g.save(); g.globalAlpha = cover; g.beginPath(); g.moveTo(-230, -320); g.quadraticCurveTo(0, -440, 230, -320); g.lineTo(250, 380); for (let i = 0; i <= 8; i++) g.lineTo(250 - i * 62.5, 380 + (i % 2) * 30); g.closePath(); fs(g, '#eeeae0', 6); g.strokeStyle = 'rgba(0,0,0,.12)'; g.lineWidth = 6; for (const xx of [-120, 0, 120]) { g.beginPath(); g.moveTo(xx, -300); g.quadraticCurveTo(xx + 20, 0, xx - 10, 380); g.stroke(); } g.restore(); }
  g.restore();
}
function hallway(g, t, night = 0) {
  g.fillStyle = night ? '#1c2230' : '#c9b48f'; g.fillRect(0, 0, W, H); g.fillStyle = night ? 'rgba(255,255,255,.03)' : 'rgba(0,0,0,.05)'; for (let x = 0; x < W; x += 80) g.fillRect(x, 0, 30, 1300);
  for (const dx of [40, 860]) { rr(g, dx, 420, 180, 900, 4); fs(g, night ? '#2a2420' : '#8a6a48', 7); ell(g, dx + (dx < 500 ? 150 : 30), 880, 9, 9, '#d7a93a', 3); }
  g.fillStyle = night ? '#141820' : '#7a5a3a'; g.fillRect(0, 1300, W, H); g.lineWidth = 6; g.strokeStyle = OL; g.beginPath(); g.moveTo(0, 1300); g.lineTo(W, 1300); g.stroke();
  if (night) { g.fillStyle = 'rgba(10,20,45,.35)'; g.fillRect(0, 0, W, H); }
}
function bedroom(g, t, night = 1) {
  g.fillStyle = night ? '#1a2032' : '#d8c8e0'; g.fillRect(0, 0, W, H); rr(g, 640, 280, 300, 360, 6); fs(g, night ? '#0a1020' : '#bfe4ff', 7); if (night) moon(g, 800, 380, 40);
  for (const [x, y, c] of [[180, 380, '#ff7aa8'], [330, 420, '#7ab8ff']]) { rr(g, x, y, 110, 140, 4); fs(g, c, 5); }
  rr(g, 120, 1040, 840, 200, 30); fs(g, night ? '#4a3a5a' : '#c890c8', 7); rr(g, 120, 980, 260, 110, 40); fs(g, '#f2efe6', 6);
  g.fillStyle = night ? '#141820' : '#8a6a5a'; g.fillRect(0, 1300, W, H); if (night) { g.fillStyle = 'rgba(10,20,45,.35)'; g.fillRect(0, 0, W, H); }
}
function bathroom(g, t) {
  g.fillStyle = '#c8d8dc'; g.fillRect(0, 0, W, H); g.strokeStyle = 'rgba(0,0,0,.1)'; g.lineWidth = 3; for (let y = 0; y < 1300; y += 70) { g.beginPath(); g.moveTo(0, y); g.lineTo(W, y); g.stroke(); } for (let x = 0; x < W; x += 70) { g.beginPath(); g.moveTo(x, 0); g.lineTo(x, 1300); g.stroke(); }
  rr(g, 260, 1180, 560, 140, 20); fs(g, '#f2f2f2', 7); g.fillStyle = '#5a6a70'; g.fillRect(0, 1320, W, H);
  g.fillStyle = 'rgba(10,20,45,.45)'; g.fillRect(0, 0, W, H);
}
function compareCard(g, k, title, before, after, drawB, drawA) {
  if (k <= 0) return; g.save(); g.translate(W / 2, 800); g.scale(k, k); rr(g, -460, -400, 920, 800, 20); fs(g, '#ece4cf', 8);
  g.font = '64px BB'; g.fillStyle = '#1b1b1b'; g.textAlign = 'center'; g.textBaseline = 'middle'; g.fillText(title, 0, -330);
  for (const [sx, lab, col, d] of [[-220, before, '#1f9e4a', drawB], [220, after, '#c4161c', drawA]]) { rr(g, sx - 190, -260, 380, 420, 12); fs(g, '#2d3a35', 5); g.save(); g.beginPath(); g.rect(sx - 190, -260, 380, 420); g.clip(); g.translate(sx, -40); d(g); g.restore(); g.font = '52px BB'; g.fillStyle = col; g.fillText(lab, sx, 230); }
  g.restore();
}
function handIcon(g, left) { g.save(); g.scale(left ? -1 : 1, 1); ell(g, 0, 20, 70, 80, '#c8946c', 6); for (let f = 0; f < 4; f++) { rr(g, -60 + f * 32, -110, 26, 90, 13); fs(g, '#c8946c', 5); } rr(g, 64, -10, 26, 70, 13); fs(g, '#c8946c', 5); g.restore(); g.font = '56px BB'; g.fillStyle = '#fff'; g.textAlign = 'center'; g.fillText(left ? 'IZQUIERDA' : 'DERECHA', 0, 150); }
function pancakes(g, x, y, s) { g.save(); g.translate(x, y); g.scale(s, s); ell(g, 0, 40, 200, 40, '#f2f2f2', 6); for (let i = 0; i < 5; i++) ell(g, 0, 10 - i * 34, 150, 34, '#d89a4a', 5); poly(g, [[-40, -150], [40, -150], [30, -110], [-30, -110]], '#f2e08a', 4); g.fillStyle = 'rgba(140,60,20,.7)'; g.beginPath(); g.ellipse(0, -140, 120, 22, 0, 0, 7); g.fill(); g.restore(); }
function fridgeNote(g, x, y, s, flip, t) { g.save(); g.translate(x, y); g.scale(s, s); rr(g, -260, -200, 520, 400, 6); fs(g, '#fff8a8', 6); ell(g, 0, -190, 26, 26, '#c4161c', 4); g.save(); g.scale(flip, 1); g.font = '120px PM'; g.fillStyle = '#c4166a'; g.textAlign = 'center'; g.textBaseline = 'middle'; g.fillText('Te quiero', 0, 20); g.restore(); g.restore(); }
