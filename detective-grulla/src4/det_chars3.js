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
