// ---------- extras Capítulo 4 ----------
const ELENA = {
  skin: '#e2b48c', armC: '#a86a5a', legC: '#4a3a44', bootC: '#2a2020', torso: '#a86a5a', tw: 104, handC: '#e2b48c',
  head: (g, p) => ELENA_HEAD(g, p), torsoDeco: (g, tw, th) => { poly(g, [[-20, -th], [20, -th], [0, -th + 50]], '#f2e8d8', 3); },
};
const KID = {
  skin: '#e0b48e', armC: '#3f7fb3', legC: '#2b3036', bootC: '#e8e8e8', torso: '#3f7fb3', tw: 92, th: 140, leg: 140, arm: 120, handC: '#e0b48e',
  head: (g, p) => { ell(g, 0, 0, 44, 50, '#e0b48e'); g.beginPath(); g.moveTo(-46, 4); g.quadraticCurveTo(-50, -62, 4, -60); g.quadraticCurveTo(54, -58, 46, 4); g.lineTo(40, -18); g.lineTo(24, -30); g.lineTo(8, -20); g.lineTo(-10, -30); g.lineTo(-28, -18); g.closePath(); fs(g, '#1e1612', 5);
    eyes(g, 2, 15, p.blink, OL, 6); g.lineWidth = 4; g.strokeStyle = OL; g.beginPath(); g.arc(0, 22, 10, .3, Math.PI - .3); g.stroke(); },
};
function memoryCard(g, k, title, draw, t) { // tarjeta de recuerdo en sepia
  if (k <= 0) return; g.save(); g.translate(W / 2, 860); g.rotate(-.02); g.scale(k, k);
  rr(g, -420, -380, 840, 760, 8); fs(g, '#efe6cf', 8); rr(g, -380, -340, 760, 540, 4); fs(g, '#5a4a38', 4);
  g.save(); g.beginPath(); g.rect(-380, -340, 760, 540); g.clip(); g.translate(0, -70); draw(g, t); g.fillStyle = 'rgba(140,100,50,.32)'; g.fillRect(-400, -400, 800, 800); g.restore();
  g.font = '60px BB'; g.fillStyle = '#1b1b1b'; g.textAlign = 'center'; g.textBaseline = 'middle'; g.fillText(title, 0, 280); g.restore();
}
const MEM = {
  bottle: (g) => { rr(g, -50, -120, 100, 220, 20); fs(g, '#3a6a3a', 6); rr(g, -20, -190, 40, 80, 8); fs(g, '#3a6a3a', 5); rr(g, -40, -40, 80, 70, 4); fs(g, '#e8d8a8', 3); },
  rain: (g, t) => { g.strokeStyle = 'rgba(220,230,240,.8)'; g.lineWidth = 4; for (let i = 0; i < 40; i++) { const x = -360 + srnd(i) * 720, y = -260 + ((srnd(i + 2) * 520 + t * 600) % 520); g.beginPath(); g.moveTo(x, y); g.lineTo(x - 8, y + 34); g.stroke(); } },
  lights: (g, t) => { for (const x of [-120, 120]) { g.save(); g.shadowColor = '#fff6d0'; g.shadowBlur = 50; ell(g, x, 0, 70, 40, '#fff6d0', 0); g.restore(); } },
  car: (g) => { g.save(); g.scale(.8, .8); car(g, 0, 120, 1, 0, '#8a8a90'); g.restore(); },
  umbrella: (g) => { g.save(); g.rotate(.5); g.beginPath(); g.arc(0, 40, 150, Math.PI, 0); fs(g, '#a8202a', 6); g.lineWidth = 6; g.beginPath(); g.moveTo(0, 40); g.lineTo(40, 200); g.stroke(); g.restore(); },
  money: (g) => { for (let i = 0; i < 4; i++) { g.save(); g.translate(-90 + i * 60, -20 + i * 18); g.rotate(-.2 + i * .12); rr(g, -110, -55, 220, 110, 6); fs(g, '#6aa36a', 5); ell(g, 0, 0, 30, 30, '#4a8a4a', 3); g.restore(); } },
  nurse: (g) => { g.save(); g.translate(0, 60); g.scale(1.4, 1.4); CLARA.head(g, {}); g.restore(); rr(g, 70, 40, 24, 120, 12); fs(g, '#e2c0a2', 5); },
  stamp: (g) => { rr(g, -200, -150, 400, 300, 4); fs(g, '#f4efe2', 5); g.save(); g.rotate(-.15); g.strokeStyle = '#c4161c'; g.lineWidth = 8; g.strokeRect(-170, -50, 340, 100); g.font = '64px BB'; g.fillStyle = '#c4161c'; g.textAlign = 'center'; g.textBaseline = 'middle'; g.fillText('ARCHIVADO', 0, 6); g.restore(); },
  eyes: (g) => { g.save(); g.translate(-170, 40); g.scale(1.4, 1.4); RIVAS.head(g, {}); g.restore(); g.save(); g.translate(170, 40); g.scale(1.4, 1.4); JULIAN.head(g, {}); g.restore(); },
};
function waveform(g, y, t, amp, w = 900) { g.save(); g.strokeStyle = '#47c6ff'; g.lineWidth = 6; g.beginPath(); for (let x = -w / 2; x <= w / 2; x += 6) { const a = amp * (Math.sin(x * .07 + t * 30) * .6 + Math.sin(x * .023 - t * 17) * .4) * (0.4 + .6 * Math.abs(Math.sin(x * .01 + t * 5))); g.lineTo(W / 2 + x, y + a); } g.stroke(); g.restore(); }
function mateoDesk(g, t, items) {
  g.fillStyle = '#1c222c'; g.fillRect(0, 0, W, H); rr(g, 60, 260, 300, 400, 6); fs(g, '#0a0f18', 6);
  const lg = g.createRadialGradient(540, 1000, 0, 540, 1000, 700); lg.addColorStop(0, 'rgba(255,240,190,.25)'); lg.addColorStop(1, 'rgba(0,0,0,0)'); g.fillStyle = lg; g.fillRect(0, 300, W, 1300);
  rr(g, -20, 1180, 1120, 60, 6); fs(g, '#5a4a38', 8); g.fillStyle = '#2a2018'; g.fillRect(0, 1240, W, H);
  if (items > 0) { g.save(); g.translate(260, 1080); g.rotate(-.08); rr(g, -170, -120, 340, 220, 6); fs(g, '#f4f1ea', 6); g.strokeStyle = 'rgba(80,110,160,.35)'; g.lineWidth = 2; for (let i = -150; i < 160; i += 22) { g.beginPath(); g.moveTo(i, -110); g.lineTo(i, 90); g.stroke(); } for (let j = -110; j < 100; j += 22) { g.beginPath(); g.moveTo(-160, j); g.lineTo(160, j); g.stroke(); } g.fillStyle = '#f4f1ea'; g.beginPath(); g.moveTo(170, -120); for (let i = 0; i < 10; i++) g.lineTo(170 + (i % 2 ? 14 : 0), -120 + i * 22); g.lineTo(170, 100); g.fill(); g.restore(); }
  if (items > 1) { g.save(); g.translate(560, 1110); poly(g, [[-140, 70], [140, 70], [130, -60], [-130, -60]], '#9a7a50', 6); for (let i = 0; i < 5; i++) { rr(g, -110 + i * 50, -130, 34, 80, 8); fs(g, '#e8f4f8', 4); rr(g, -104 + i * 50, -148, 22, 20, 4); fs(g, '#c4161c', 3); } g.restore(); }
  if (items > 2) { g.save(); g.translate(850, 1060); g.rotate(.06); rr(g, -150, -170, 300, 300, 4); fs(g, '#e9dfc4', 6); g.font = '30px BB'; g.fillStyle = '#1b1b1b'; g.textAlign = 'center'; g.fillText('EXPEDIENTE', 0, -120); g.fillText('ELENA (COPIA)', 0, -86); g.fillStyle = '#1b1b1b'; for (let i = 0; i < 5; i++) g.fillRect(-110, -40 + i * 34, 200 - (i % 2) * 40, 12); g.restore(); }
}
function finalList(g, t, k) {
  if (k <= 0) return; g.save(); g.translate(W / 2, 800); g.rotate(-.02); g.scale(k, k);
  rr(g, -440, -520, 880, 1040, 8); fs(g, '#e9dfc4', 8); g.font = '50px PM'; g.fillStyle = '#4a4a4a'; g.textAlign = 'center'; g.fillText('5 NOMBRES', 0, -430);
  const N = [['Ignacio Bravo', 129.18, 130.52], ['Clara Montes', 131.56, 132.73], ['Andrés Lagos', 133.76, 135.06], ['Rafael Rivas', 136.06, 137.46]];
  N.forEach(([n, t0, tc], i) => { if (t < t0) return; const y = -320 + i * 130; g.font = '62px PM'; g.textAlign = 'left'; g.textBaseline = 'middle'; g.fillStyle = '#1b1b1b'; g.fillText(n, -340, y);
    if (t > tc) { g.strokeStyle = '#c4161c'; g.lineWidth = 9; g.beginPath(); g.moveTo(-350, y); g.lineTo(-350 + 620 * prog(t, tc, tc + .35), y); g.stroke(); } });
  if (t > 140.82) { const kk = eback(prog(t, 140.82, 141.1)); g.save(); g.translate(0, 260); g.scale(kk, kk); g.font = '84px PM'; g.fillStyle = '#b3161b'; g.textAlign = 'center'; g.textBaseline = 'middle'; g.fillText('Julián Ferrer', 0, 0); if (t > 142.32) { g.font = '54px PM'; g.fillText('«Por dejar de buscar»', 0, 100); } g.restore(); }
  g.restore();
}
