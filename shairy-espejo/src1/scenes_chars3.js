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
