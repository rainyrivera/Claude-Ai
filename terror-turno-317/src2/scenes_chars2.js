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
