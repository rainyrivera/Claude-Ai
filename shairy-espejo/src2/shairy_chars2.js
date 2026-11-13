// ---------- extras Capítulo 2 ----------
const ABUELA = {
  skin: '#d8b090', armC: '#7a3a4a', legC: '#4a3a3a', bootC: '#2a2020', torso: '#7a3a4a', tw: 110, handC: '#d8b090',
  capeBack: (g, tw, th) => { g.beginPath(); g.moveTo(-tw / 2 - 20, -th - 10); g.lineTo(tw / 2 + 20, -th - 10); g.lineTo(tw / 2 + 40, -th + 110); g.lineTo(-tw / 2 - 40, -th + 110); g.closePath(); fs(g, '#5a2a6a', 5); },
  head: (g, p) => { ell(g, 0, -60, 28, 22, '#dcdcdc', 5); ell(g, 0, 0, 42, 52, '#d8b090'); g.beginPath(); g.moveTo(-44, 10); g.quadraticCurveTo(-48, -62, 0, -58); g.quadraticCurveTo(48, -62, 44, 10); g.lineTo(34, -22); g.quadraticCurveTo(0, -36, -34, -22); g.closePath(); fs(g, '#dcdcdc', 5);
    eyesX(g, p); g.lineWidth = 3; g.strokeStyle = OL; g.beginPath(); g.arc(-15, -2, 12, 0, 7); g.arc(15, -2, 12, 0, 7); g.moveTo(-3, -2); g.lineTo(3, -2); g.stroke();
    g.strokeStyle = 'rgba(80,50,40,.4)'; g.beginPath(); g.moveTo(-30, 14); g.lineTo(-22, 18); g.moveTo(30, 14); g.lineTo(22, 18); g.stroke(); smile(g, p, 10, 26); },
  torsoDeco: (g, tw, th) => { poly(g, [[-tw / 2 - 20, -th - 10], [tw / 2 + 20, -th - 10], [0, -th + 80]], '#5a2a6a', 5); },
};
function grannyRoom(g, t) {
  g.fillStyle = '#5a4a3a'; g.fillRect(0, 0, W, H); g.fillStyle = 'rgba(255,255,255,.04)'; for (let x = 0; x < W; x += 90) g.fillRect(x, 0, 40, 1300);
  for (const [x, y] of [[160, 360], [380, 320], [860, 380]]) { rr(g, x - 70, y - 90, 140, 180, 6); fs(g, '#b8862f', 5); rr(g, x - 54, y - 74, 108, 148, 3); fs(g, '#8a7a6a', 3); }
  for (const x of [700, 780]) { rr(g, x - 12, 900, 24, 90, 4); fs(g, '#f2ead8', 4); const f = 1 + Math.sin(t * 12 + x) * .15; g.save(); g.shadowColor = '#ffb347'; g.shadowBlur = 40; ell(g, x, 884, 10 * f, 20 * f, '#ffb347', 3); g.restore(); }
  rr(g, 600, 990, 280, 30, 6); fs(g, '#6b4a2b', 5);
  const lg = g.createRadialGradient(740, 900, 0, 740, 900, 520); lg.addColorStop(0, 'rgba(255,190,110,.3)'); lg.addColorStop(1, 'rgba(0,0,0,0)'); g.fillStyle = lg; g.fillRect(0, 300, W, 1200);
  g.fillStyle = '#3a2a20'; g.fillRect(0, 1300, W, H); g.lineWidth = 6; g.strokeStyle = OL; g.beginPath(); g.moveTo(0, 1300); g.lineTo(W, 1300); g.stroke();
}
function grannyHouse(g, t) {
  const gr = g.createLinearGradient(0, 0, 0, H); gr.addColorStop(0, '#7a8aa8'); gr.addColorStop(1, '#d8b88a'); g.fillStyle = gr; g.fillRect(0, 0, W, H);
  poly(g, [[160, 720], [540, 440], [920, 720]], '#5a2a2a', 8); rr(g, 210, 720, 660, 640, 4); fs(g, '#c8b89a', 8); rr(g, 470, 1000, 140, 360, 6); fs(g, '#4a2a1a', 7);
  for (const x of [270, 680]) { rr(g, x, 800, 130, 150, 4); fs(g, '#ffe4a8', 6); }
  for (let i = 0; i < 6; i++) { ell(g, 120 + i * 170, 1380, 60, 40, '#5a7a3a', 5); } g.fillStyle = '#6a5a3a'; g.fillRect(0, 1400, W, H);
}
function phoneUI(g, x, y, s, draw) { g.save(); g.translate(x, y); g.scale(s, s); rr(g, -280, -520, 560, 1040, 50); fs(g, '#111', 8); g.save(); rr(g, -250, -470, 500, 940, 20); g.clip(); draw(g); g.restore(); g.restore(); }
function wristWatch(g, x, y, s, t, back) { g.save(); g.translate(x, y); g.scale(s, s); rr(g, -60, -200, 120, 400, 30); fs(g, '#c8946c', 6); rr(g, -70, -60, 140, 120, 14); fs(g, '#2a2a2a', 5); ell(g, 0, 0, 80, 80, '#b8c0c8', 6); ell(g, 0, 0, 66, 66, '#f2f2f2', 4);
  const a = (back ? -1 : 1) * t * 3; g.lineCap = 'round'; g.strokeStyle = OL; g.lineWidth = 6; g.beginPath(); g.moveTo(0, 0); g.lineTo(Math.sin(a) * 50, -Math.cos(a) * 50); g.stroke(); g.lineWidth = 8; g.beginPath(); g.moveTo(0, 0); g.lineTo(Math.sin(a / 12) * 32, -Math.cos(a / 12) * 32); g.stroke(); g.restore(); }
function stepsIcon(g, kind, x, y, s) { g.save(); g.translate(x, y); g.scale(s, s);
  if (kind === 'clap') { g.save(); g.rotate(-.3); ell(g, -20, 0, 34, 50, '#e0b48e', 5); g.restore(); g.save(); g.rotate(.3); ell(g, 20, 0, 34, 50, '#e0b48e', 5); g.restore(); g.strokeStyle = '#ffd21f'; g.lineWidth = 6; for (const a of [-1, 0, 1]) { g.beginPath(); g.moveTo(a * 30, -64); g.lineTo(a * 44, -84); g.stroke(); } }
  else if (kind === 'fist') { ell(g, 0, 0, 50, 46, '#e0b48e', 5); for (let i = 0; i < 4; i++) { g.strokeStyle = OL; g.lineWidth = 3; g.beginPath(); g.moveTo(-34 + i * 22, -30); g.lineTo(-34 + i * 22, -6); g.stroke(); } }
  else { g.strokeStyle = '#47c6ff'; g.lineWidth = 12; g.beginPath(); g.arc(0, 0, 44, -.5, 4.2); g.stroke(); poly(g, [[44 * Math.cos(-.5) - 6, 44 * Math.sin(-.5) - 22], [44 * Math.cos(-.5) + 24, 44 * Math.sin(-.5) + 4], [44 * Math.cos(-.5) - 18, 44 * Math.sin(-.5) + 14]], '#47c6ff', 0); }
  g.restore(); }
function moons(g, y, filled, k = 1) { if (k <= 0) return; g.save(); g.translate(W / 2, y); g.scale(k, k); for (let i = 0; i < 7; i++) { const x = (i - 3) * 130; ell(g, x, 0, 50, 50, i < filled ? '#f2e6b8' : '#2a3040', 5); if (i < filled) { g.save(); g.shadowColor = '#f2e6b8'; g.shadowBlur = 30; ell(g, x, 0, 50, 50, '#f2e6b8', 0); g.restore(); } g.font = '36px BB'; g.fillStyle = '#e8f0f4'; g.textAlign = 'center'; g.fillText(String(i + 1), x, 90); } g.restore(); }
function foggyWindow(g, t, msgK, flip) {
  g.fillStyle = '#141a28'; g.fillRect(0, 0, W, H); rr(g, 120, 300, 840, 1000, 8); fs(g, '#4a3a2a', 10);
  g.save(); rr(g, 150, 330, 780, 940, 4); g.clip(); g.fillStyle = '#0a1020'; g.fillRect(150, 330, 780, 940); moon(g, 760, 480, 40);
  g.fillStyle = 'rgba(200,215,230,.55)'; g.fillRect(150, 330, 780, 940); rain(g, t, .15, 40);
  if (msgK > 0) { g.save(); g.globalCompositeOperation = 'destination-out'; g.translate(540, 800); g.scale(flip, 1); g.font = '96px PM'; g.textAlign = 'center'; g.textBaseline = 'middle'; const s1 = 'Ya casi', s2 = 'eres nuestra';
    g.fillText(s1.slice(0, Math.ceil(Math.min(1, msgK * 2) * s1.length)), 0, -70); g.fillText(s2.slice(0, Math.ceil(Math.max(0, msgK * 2 - 1) * s2.length)), 0, 70); g.restore();
    g.save(); g.globalCompositeOperation = 'destination-over'; g.fillStyle = '#05070c'; g.fillRect(150, 330, 780, 940); g.restore(); }
  g.restore(); g.lineWidth = 12; g.strokeStyle = '#4a3a2a'; g.beginPath(); g.moveTo(540, 300); g.lineTo(540, 1300); g.moveTo(120, 800); g.lineTo(960, 800); g.stroke();
}

function livingRoom(g, t, lamp = 0) {
  g.fillStyle = '#141a24'; g.fillRect(0, 0, W, H); rr(g, 640, 300, 320, 420, 6); fs(g, '#0a1020', 7); rain(g, t, .12, 30);
  g.fillStyle = 'rgba(150,180,220,.12)'; poly(g, [[640, 300], [960, 300], [700, 1500], [200, 1500]], 'rgba(150,180,220,.08)', 0);
  rr(g, 140, 980, 800, 260, 40); fs(g, '#3a2a3a', 7); rr(g, 140, 860, 140, 380, 40); fs(g, '#3a2a3a', 6); rr(g, 800, 860, 140, 380, 40); fs(g, '#3a2a3a', 6);
  g.fillStyle = '#1a1410'; g.fillRect(0, 1300, W, H); g.lineWidth = 6; g.strokeStyle = OL; g.beginPath(); g.moveTo(0, 1300); g.lineTo(W, 1300); g.stroke();
  if (lamp) { const lg = g.createRadialGradient(540, 900, 0, 540, 900, 600); lg.addColorStop(0, `rgba(255,200,120,${.3 * lamp})`); lg.addColorStop(1, 'rgba(0,0,0,0)'); g.fillStyle = lg; g.fillRect(0, 300, W, 1300); }
}
