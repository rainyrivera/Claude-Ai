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
