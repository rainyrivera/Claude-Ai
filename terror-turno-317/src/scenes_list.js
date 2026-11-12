// ---------- escenas ----------
const S = [];
const scene = (t0, draw, tr = 'cut', trd = 0) => S.push({ t0, draw, tr, trd });
const tp = { ...{} };

// 0. Gancho: hoja con 4 reglas en la pared
scene(0, (g, t, lt) => {
  booth(g, t, { lit: .55 }); g.save(); cam(g, lt, 5.2, .25, 165, 990); g.restore();
  g.fillStyle = 'rgba(0,0,0,.55)'; g.fillRect(0, 0, W, H);
  sheet(g, W / 2, 860, .95 * lerp(.9, 1, eout(prog(lt, 0, .6))), Math.floor(prog(lt, .5, 3.6) * 4 + .001) + (lt > .5 ? 1 : 0), t, lt);
});
scene(5.24, (g, t, lt) => {
  g.fillStyle = '#0c100f'; g.fillRect(0, 0, W, H); g.save(); cam(g, lt, 5, .12, W / 2, 900);
  sheet(g, W / 2, 900, 1.05, 4, t, lt, 2);
  const k = prog(lt, 1.3, 2.0); if (k > 0) { g.save(); g.strokeStyle = '#ff2020'; g.lineWidth = 12; g.beginPath(); g.ellipse(W / 2 - 30, 1075, 470, 120, -.03, 0, Math.PI * 2 * k); g.stroke(); g.restore(); }
  g.restore();
}, 'zoom', .3);
scene(10.42, (g, t, lt) => {
  g.fillStyle = '#050707'; g.fillRect(0, 0, W, H);
  cctv(g, 90, 420, 900, 660, 'CAM 6', '03:17:00', cg => camView(cg, 900, 660, 'booth', t, { man: true, turn: prog(lt, 1.6, 3.0) }));
  const gl = lt > 3.6 ? 1 : 0; if (gl) { for (let i = 0; i < 10; i++) { g.drawImage(cv, 0, srnd(i + Math.floor(t * 30)) * H, W, 40, (srnd(i * 3 + Math.floor(t * 30)) - .5) * 80, srnd(i + Math.floor(t * 30)) * H, W, 40); } }
}, 'glitch', .3);
// 1. Título
scene(14.73, (g, t, lt) => {
  g.fillStyle = '#060908'; g.fillRect(0, 0, W, H);
  for (let i = 0; i < 400; i++) { g.fillStyle = `rgba(200,220,210,${srnd(i * 7 + Math.floor(t * 24)) * .12})`; g.fillRect(srnd(i + Math.floor(t * 24) * 1.3) * W, srnd(i * 3.3 + Math.floor(t * 24)) * H, 6, 2); }
  bigText(g, 'EL TURNO', W / 2, 520, 130, '#e8f0e8', eback(prog(lt, .05, .35)));
  bigText(g, 'DE LAS', W / 2, 650, 80, '#e8f0e8', eback(prog(lt, .3, .55)));
  const blink = Math.floor(lt * 2) % 2 === 0 || lt < 1; digiClock(g, W / 2, 900, 1.5 * eback(prog(lt, .6, .95)), blink ? '3:17' : '3 17');
  if (lt > 2.62) { const k = eback(prog(lt, 2.62, 2.85)); g.save(); g.translate(W / 2, 1150); g.rotate(-.05); g.scale(k, k); g.fillStyle = '#9d1418'; g.fillRect(-170, -56, 340, 112); g.lineWidth = 5; g.strokeStyle = '#ffd7c2'; g.strokeRect(-160, -46, 320, 92); g.font = '86px LG'; g.fillStyle = '#ffe9dc'; g.textAlign = 'center'; g.textBaseline = 'middle'; g.fillText('PARTE 1', 0, 8); g.restore(); }
}, 'glitch', .35);
// 2. Tomás necesita trabajo
scene(19.0, (g, t, lt) => {
  street(g, t, lt * 30); g.save(); cam(g, lt, 3.3, .05);
  figure(g, 540, 1260, 1.25, TOMAS, { ...walk(t, .9, .35), t });
  g.restore();
  if (lt > .6) { const k = eback(prog(lt, .6, .9)); g.save(); g.translate(790, 560); g.rotate(.05); g.scale(k, k); rr(g, -230, -120, 460, 240, 10); fs(g, '#e9e0c9', 6); g.font = '46px BB'; g.fillStyle = '#1b1b1b'; g.textAlign = 'left'; g.fillText('NOMBRE: TOMÁS', -200, -50); g.fillText('EDAD: 24 AÑOS', -200, 10); g.fillStyle = '#b3161b'; g.fillText('SIN TRABAJO', -200, 70); g.restore(); }
});
scene(22.32, (g, t, lt) => {
  street(g, t, 200); g.save(); cam(g, lt, 2.8, .1, W / 2, 800);
  g.save(); g.translate(W / 2, 800); g.rotate(-.04); rr(g, -330, -380, 660, 760, 6); fs(g, '#efe6cf', 8); g.font = '96px BB'; g.textAlign = 'center'; g.fillStyle = '#1b1b1b'; g.fillText('SE BUSCA', 0, -250); g.fillStyle = '#b3161b'; g.font = '84px BB'; g.fillText('GUARDIA', 0, -150); g.fillText('NOCTURNO', 0, -60);
  g.font = '44px BB'; g.fillStyle = '#3a3a3a'; g.fillText('TURNO 10 PM – 6 AM', 0, 40); g.fillText('INICIO INMEDIATO', 0, 100);
  for (let i = 0; i < 7; i++) { rr(g, -300 + i * 88, 230, 70, 150, 4); fs(g, '#efe6cf', 3); g.save(); g.translate(-265 + i * 88, 300); g.rotate(Math.PI / 2); g.font = '22px BB'; g.fillStyle = '#333'; g.textAlign = 'center'; g.fillText('555-0317', 0, 0); g.restore(); }
  g.restore(); g.restore(); stamp(g, '¡NADIE LO QUIERE!', W / 2 + 60, 1240, prog(lt, 1.4, 1.65), '#c4161c', -.08, 70);
}, 'push', .3);
scene(25.10, (g, t, lt) => {
  clinicExt(g, t); g.save(); g.restore();
  figure(g, 300, 1300, .9, TOMAS, { ...idle(t), t, tilt: -.08 });
  if (lt > 2.64) { const k = eback(prog(lt, 2.64, 2.9)); g.save(); g.translate(W / 2, 1620); g.rotate(-.06); g.scale(k, k); g.font = '80px BB'; g.textAlign = 'center'; g.textBaseline = 'middle'; const w = g.measureText('CERRADA HACE +30 AÑOS').width; g.lineWidth = 8; g.strokeStyle = '#c4161c'; g.strokeRect(-w / 2 - 24, -56, w + 48, 112); g.fillStyle = '#c4161c'; g.fillText('CERRADA HACE +30 AÑOS', 0, 6); g.restore(); }
}, 'push', .3);
// 3. El encargado
const ITEMS = [['LLAVES', 31.35], ['LINTERNA', 32.6], ['CUADERNO', 33.6]];
scene(31.35, (g, t, lt) => {
  clinicExt(g, t); g.fillStyle = 'rgba(0,0,0,.35)'; g.fillRect(0, 0, W, H);
  const leave = prog(t, 41.29, 43.5); const bx = lerp(760, 1350, eio(leave));
  figure(g, 330, 1300, 1.15, TOMAS, { ...idle(t), t, aL: t > 34 ? -.6 : .12, holdL: t > 33.6 ? flashlight(0) : null });
  figure(g, bx, 1300, 1.15, BOSS, { ...(leave > 0 ? walk(t, 1, .35) : idle(t, 2)), t, flip: leave > 0, aR: t < 34.85 ? .7 : -.12, tilt: t > 35.42 && t < 36.6 ? -.25 : 0 });
  ITEMS.forEach(([n, t0], i) => { if (t < t0 || t > 35.3) return; const k = eback(prog(t, t0, t0 + .25)); const x = 220 + i * 320, y = 520; g.save(); g.translate(x, y); g.scale(k, k); ell(g, 0, 0, 120, 120, '#e9e0c9', 6);
    if (i === 0) { ell(g, -20, -10, 34, 34, '#d7a93a', 6); ell(g, -20, -10, 14, 14, '#e9e0c9', 4); rr(g, 6, -16, 70, 16, 4); fs(g, '#d7a93a', 5); rr(g, 54, -2, 12, 22, 2); fs(g, '#d7a93a', 4); }
    if (i === 1) { rr(g, -18, -60, 36, 110, 10); fs(g, '#2a2a2a', 5); ell(g, 0, -64, 26, 12, '#ffe9a8', 4); }
    if (i === 2) { rr(g, -50, -64, 100, 128, 6); fs(g, '#6b4a2b', 6); g.fillStyle = '#e9e0c9'; g.fillRect(-30, -40, 60, 10); }
    g.font = '40px BB'; g.fillStyle = '#1b1b1b'; g.textAlign = 'center'; g.fillText(n, 0, 90); g.restore(); });
  if (t > 38.17 && t < 41.2) { const k = eback(prog(t, 38.17, 38.4)); g.save(); g.translate(720, 640); g.scale(k, k); rr(g, -300, -110, 600, 220, 40); fs(g, '#f2efe6', 6); poly(g, [[20, 100], [70, 100], [60, 170]], '#f2efe6', 0); g.font = '58px BB'; g.fillStyle = '#1b1b1b'; g.textAlign = 'center'; g.textBaseline = 'middle'; g.fillText(t < 40.2 ? 'EL GUARDIA ANTERIOR' : '«SÍGUELAS»', 0, -24); if (t < 40.2) g.fillText('DEJÓ INSTRUCCIONES', 0, 40); g.restore(); }
}, 'push', .3);
// 4. La caseta
scene(43.65, (g, t, lt) => {
  g.save(); cam(g, lt, 7.6, .08, W / 2, 700); booth(g, t, { sheetGlow: lt > 6.5 ? .8 : 0 }); g.restore();
  const k = prog(lt, 0, 1.9); if (k < 1) { g.fillStyle = `rgba(0,0,0,${1 - k})`; g.fillRect(0, 0, W, H); }
  if (lt > 1.9 && lt < 4.5) { const kk = eback(prog(lt, 2.1, 2.4)); g.save(); g.translate(830, 1000); g.scale(kk, kk); g.strokeStyle = '#ff2b2b'; g.lineWidth = 8; g.beginPath(); g.ellipse(0, 40, 150, 110, 0, 0, 7); g.stroke(); g.restore(); }
}, 'fade', .4);
// 5. Las reglas
scene(51.30, (g, t, lt) => {
  g.fillStyle = '#0c100f'; g.fillRect(0, 0, W, H);
  const n = t < 55.17 ? 1 : t < 59.35 ? 2 : t < 64.44 ? 3 : 4; const hl = t >= 69.82 ? 3 : -1;
  const z = 1.3, starts = [51.3, 55.17, 59.35, 64.44]; const ly = i => -300 + i * 205 + 32; const tgt = i => 820 - (900 + z * ly(i));
  let off = tgt(0); for (let i = 1; i < 4; i++) off = lerp(off, tgt(i), eio(prog(t, starts[i] - .1, starts[i] + .35)));
  g.save(); g.translate(0, off); sheet(g, W / 2, 900, z, n, t, lt, hl); g.restore();
  // iconos
  const icon = n - 1, ik = eback(prog(t, [51.3, 55.17, 59.35, 64.44][icon], [51.3, 55.17, 59.35, 64.44][icon] + .3)); g.save(); g.translate(880, 1620); g.scale(ik, ik); ell(g, 0, 0, 110, 110, '#1c2321', 6);
  if (icon === 0) { g.strokeStyle = '#e8f0e8'; g.lineWidth = 10; g.beginPath(); g.moveTo(-50, 40); g.lineTo(-50, 10); g.lineTo(-15, 10); g.lineTo(-15, -20); g.lineTo(20, -20); g.lineTo(20, -50); g.lineTo(55, -50); g.stroke(); }
  if (icon === 1) { rr(g, -50, -60, 100, 120, 6); fs(g, '#8f9a95', 5); g.fillStyle = '#ff3b30'; poly(g, [[0, -40], [24, -10], [-24, -10]], '#ff3b30', 0); }
  if (icon === 2) { rr(g, -60, -45, 120, 85, 8); fs(g, '#7ea38d', 5); g.font = '40px BB'; g.fillStyle = '#111'; g.textAlign = 'center'; g.fillText('6', 0, 14); g.strokeStyle = '#ff2b2b'; g.lineWidth = 10; g.beginPath(); g.moveTo(-70, -70); g.lineTo(70, 70); g.stroke(); }
  if (icon === 3) { g.font = '120px LG'; g.fillStyle = '#ff2b2b'; g.textAlign = 'center'; g.textBaseline = 'middle'; g.fillText('🤫'.length ? '!' : '!', 0, 6); }
  g.restore();
}, 'zoom', .3);
// 6. Se ríe
scene(72.33, (g, t, lt) => {
  booth(g, t, { lit: .9 }); g.fillStyle = 'rgba(0,0,0,.3)'; g.fillRect(0, 0, W, H);
  g.save(); g.translate(W / 2, 1500); g.scale(2.6, 2.6); TOMAS.torsoDeco && 0; g.restore();
  figure(g, W / 2, 1430, 2.0, TOMAS, { t, mouth: 'smile', blink: lt < 1.2 && Math.sin(t * 20) > 0, bob: Math.sin(t * 22) * 6 * (lt < 1.2), tilt: Math.sin(t * 9) * .05 });
}, 'push', .3);
// 7. Noche 1
scene(76.23, (g, t, lt) => {
  corridor(g, t, { flick: lt > 2.5 }); g.save(); cam(g, lt, 6.5, .08, W / 2, 900);
  const z = lerp(1.3, .9, eio(prog(lt, 0, 6))); figure(g, W / 2 + Math.sin(t) * 40, 1350 - (1 - z) * 300, z, TOMAS, { ...walk(t, .7, .3), t, aL: -.5, holdL: flashlight(1) });
  g.restore();
  if (lt < 1.2) bigText(g, 'NOCHE 1', W / 2, 640, 120, '#e8f0e8', eback(prog(lt, 0, .3)), 'BB');
}, 'push', .3);
// 8. Noche 2 – ascensor sube solo
scene(82.81, (g, t, lt) => {
  booth(g, t, { lit: .8 }); g.fillStyle = 'rgba(0,0,0,.4)'; g.fillRect(0, 0, W, H);
  digiClock(g, W / 2, 420, 1.1, '2:00');
  const fl = t < 89.78 ? '–' : t < 90.98 ? '1' : t < 92.06 ? '2' : t < 93.24 ? '3' : '4';
  g.save(); g.translate(W / 2, 880); rr(g, -260, -230, 520, 460, 20); fs(g, '#151a19', 9); g.font = '300px BB'; g.textAlign = 'center'; g.textBaseline = 'middle'; g.shadowColor = '#ff3b30'; g.shadowBlur = 40; g.fillStyle = '#ff3b30'; g.fillText(fl, 40, 20);
  if (t > 86.63 && t < 93.4) { const a = Math.floor(t * 3) % 2; poly(g, [[-150, a ? -40 : -30], [-90, a ? 40 : 50], [-210, a ? 40 : 50]], '#ff3b30', 0); }
  g.restore();
  if (t > 95.08) { g.save(); g.globalAlpha = prog(t, 95.08, 95.4); figure(g, 900, 1430, 1.3, TOMAS, { ...idle(t), t, wide: true, aL: .05, aR: -.05 }); g.restore(); }
  if (lt < 1.2) bigText(g, 'NOCHE 2', W / 2, 1600, 120, '#e8f0e8', eback(prog(lt, 0, .3)), 'BB');
}, 'push', .3);
scene(96.71, (g, t, lt) => {
  g.fillStyle = '#050707'; g.fillRect(0, 0, W, H);
  const op = t < 100.35 ? eio(prog(t, 96.9, 97.9)) : 1 - eio(prog(t, 100.6, 105.3)); const sh = t > 102.88 ? prog(t, 102.88, 104) * .7 : 0;
  cctv(g, 60, 480, 960, 700, 'CAM 5 · ASCENSOR', '02:04:31', cg => camView(cg, 960, 700, 'elevator', t, { open: op, floor: '4', shadow: sh }));
}, 'push', .3);
// 9. Noche 3
scene(105.98, (g, t, lt) => {
  booth(g, t, { lit: .75, sheetGlow: t > 112.05 && t < 113.6 ? .9 : 0 }); g.fillStyle = 'rgba(0,0,0,.35)'; g.fillRect(0, 0, W, H);
  if (t > 109.27 && t < 112.05) digiClock(g, W / 2, 620, 1.3 * eback(prog(t, 109.27, 109.5)), '3:16');
  figure(g, W / 2, 1480, 1.6, TOMAS, { t, tired: true, blink: Math.sin(t * 1.3) > .7, mouth: lt < 1.5 && lt > .5 ? 'o' : null, tilt: Math.sin(t * .8) * .06, ...(t > 113.61 ? { tilt: .2 } : {}) });
  if (lt < 1.2) bigText(g, 'NOCHE 3', W / 2, 400, 120, '#e8f0e8', eback(prog(lt, 0, .3)), 'BB');
}, 'push', .3);
scene(115.34, (g, t, lt) => {
  g.fillStyle = '#060808'; g.fillRect(0, 0, W, H);
  const flip = prog(lt, 0, .25); digiClock(g, W / 2, 560, 1.6, flip < 1 ? '3:16' : '3:17', flip < 1 ? '#ff3b30' : '#ff1a1a');
  // silla girando (vista superior simple)
  g.save(); g.translate(W / 2, 1150); g.rotate(-eio(prog(lt, 1.0, 3.2)) * 1.4); backView(g, 0, 200, 1.0, { t }); g.restore();
  g.save(); g.globalAlpha = prog(lt, 2.2, 3.4); cctv(g, 640, 940, 380, 280, 'CAM 6', null, cg => camView(cg, 380, 280, 'booth', t, { man: true }), false); g.restore();
}, 'zoom', .3);
// 10. Monitor 6
scene(119.48, (g, t, lt) => {
  g.fillStyle = '#040606'; g.fillRect(0, 0, W, H); const z = lerp(1, 1.18, eio(prog(lt, 0, 9)));
  g.save(); g.translate(W / 2, 800); g.scale(z, z); g.translate(-W / 2, -800);
  cctv(g, 40, 430, 1000, 740, 'CAM 6 · CASETA', '03:17:' + String(Math.floor(lt) % 60).padStart(2, '0'), cg => camView(cg, 1000, 740, 'booth', t, { man: t > 125.13 }));
  g.restore();
  if (t > 128.74) { // comparación
    g.save(); g.globalAlpha = prog(t, 128.74, 129); g.fillStyle = 'rgba(0,0,0,.6)'; g.fillRect(0, 0, W, H); g.restore();
    const k = eback(prog(t, 128.74, 129.05)); g.save(); g.translate(W / 2, 830); g.scale(k, k);
    rr(g, -440, -400, 880, 800, 12); fs(g, '#ece4cf', 8); g.font = '72px BB'; g.textAlign = 'center'; g.fillStyle = '#1b1b1b'; g.fillText('¿ES ÉL?', 0, -320);
    rr(g, -400, -270, 360, 300, 6); fs(g, '#2d3a35', 5); rr(g, 40, -270, 360, 300, 6); fs(g, '#2d3a35', 5);
    g.save(); g.translate(-220, -100); g.scale(1.5, 1.5); faceTomas(g, {}, false); g.restore();
    g.save(); g.beginPath(); g.rect(40, -270, 360, 300); g.clip(); g.translate(220, -100); g.scale(1.5, 1.5); ell(g, 0, -2, 46, 58, '#1b1512', 6); g.restore();
    g.font = '44px BB'; g.fillText('TOMÁS', -220, 80); g.fillText('CAM 6', 220, 80);
    [['CHAQUETA', 128.74], ['PELO', 130.31], ['LINTERNA', 132.04]].forEach(([n, t0], i) => { if (t < t0) return; const y = 160 + i * 70; g.font = '46px BB'; g.fillStyle = '#1b1b1b'; g.fillText(n, 0, y + 14); for (const sx of [-220, 220]) { rr(g, sx - 24, y - 22, 48, 48, 6); fs(g, '#fff', 4); const c = prog(t, t0 + .1, t0 + .3); if (c > 0) { g.strokeStyle = '#1f9e4a'; g.lineWidth = 9; g.beginPath(); g.moveTo(sx - 14, y); g.lineTo(sx - 2, y + 14 * Math.min(1, c * 2)); if (c > .5) g.lineTo(sx - 2 + 24 * (c - .5) * 2, y + 14 - 34 * (c - .5) * 2); g.stroke(); } } });
    g.restore(); stamp(g, 'ES ÉL', W / 2, 820, prog(t, 133.76, 134.0), '#c4161c', -.1, 170);
  }
}, 'zoom', .3);
// 11. Pantalla dividida: levanta la mano
scene(134.96, (g, t, lt) => {
  g.fillStyle = '#0a0d0c'; g.fillRect(0, 0, W, H);
  g.save(); g.beginPath(); g.rect(0, 0, W / 2 - 6, H); g.clip(); booth(g, t, { lit: .7 }); g.fillStyle = 'rgba(0,0,0,.3)'; g.fillRect(0, 0, W, H);
  figure(g, 270, 1330, 1.05, TOMAS, { t, wide: true, aR: lerp(-.12, -2.8, eio(prog(t, 135.2, 135.9))) }); g.restore();
  cctv(g, W / 2 + 6, 0, W / 2 - 6, H, 'CAM 6', '03:17:16', cg => { cg.fillStyle = '#2d3a35'; cg.fillRect(0, 0, 534, H); camView(cg, 534, 400, 'booth', t, {}); cg.save(); cg.translate(0, 700); camView(cg, 534, 400, 'booth', t, {}); cg.restore(); backView(cg, 267, 1500, .9, { copy: true, t }); });
  g.fillStyle = OL; g.fillRect(W / 2 - 6, 0, 12, H);
}, 'push', .3);
// 12. Gira la cabeza
scene(143.19, (g, t, lt) => {
  g.fillStyle = '#030404'; g.fillRect(0, 0, W, H); const z = lerp(1, 1.9, eio(prog(t, 143.5, 149.6)));
  g.save(); g.translate(W / 2, 760); g.scale(z, z); g.translate(-W / 2, -760);
  cctv(g, 40, 430, 1000, 740, 'CAM 6 · CASETA', '03:17:24', cg => camView(cg, 1000, 740, 'booth', t, { man: true, turn: eio(prog(t, 145.43, 147.6)), smile: prog(t, 148.12, 149.5) }));
  g.restore();
  if (t > 148.12 && t < 148.4) { g.fillStyle = 'rgba(255,255,255,.25)'; g.fillRect(0, 0, W, H); }
}, 'push', .3);
// 13. Frío / algo cruje
scene(150.32, (g, t, lt) => {
  booth(g, t, { lit: .6 }); g.fillStyle = 'rgba(0,10,20,.45)'; g.fillRect(0, 0, W, H);
  if (t > 153.96) { g.save(); g.globalAlpha = prog(t, 153.96, 154.8) * .85; g.fillStyle = '#020303'; g.beginPath(); g.ellipse(840, 1000, 110, 140, 0, 0, 7); g.fill(); g.fillRect(700, 1100, 280, 700); g.restore(); }
  figure(g, 470, 1490, 1.7, TOMAS, { t, wide: true, sweat: true, mouth: 'o' });
  for (let i = 0; i < 4; i++) { const p = ((t * .8 + i * .25) % 1); g.fillStyle = `rgba(220,235,240,${.35 * (1 - p)})`; g.beginPath(); g.ellipse(490 + p * 60, 1150 - p * 140, 30 + p * 50, 18 + p * 30, 0, 0, 7); g.fill(); }
  g.fillStyle = 'rgba(160,210,255,.07)'; g.fillRect(0, 0, W, H);
}, 'push', .3);
// 14. Teléfono
scene(155.36, (g, t, lt) => {
  booth(g, t, { lit: .55, rings: t < 159.85 ? 1 : 0 }); g.fillStyle = 'rgba(0,0,0,.35)'; g.fillRect(0, 0, W, H);
  if (t < 159.85) { g.save(); g.translate(W / 2 - 300 + (Math.sin(t * 70) * 6), 700); phone(g, 300, 300, 2.2, 1, t); g.restore(); }
  else { figure(g, W / 2, 1490, 1.7, TOMAS, { t, wide: true, sweat: true, aR: -2.6, holdR: (gg, x, y) => { rr(gg, x - 30, y - 120, 60, 170, 25); fs(gg, '#c9b98f', 6); } });
    if (t > 161.75) { g.save(); g.strokeStyle = '#ff3b30'; g.lineWidth = 8; g.beginPath(); for (let x = 80; x < 1000; x += 8) { const a = Math.sin(x * .05 + t * 20) * Math.sin(x * .013) * 70 * (t > 163.4 ? 1.4 : 1); g.lineTo(x, 520 + a); } g.stroke(); g.restore(); } }
}, 'push', .3);
scene(166.52, (g, t, lt) => {
  g.fillStyle = '#000'; g.fillRect(0, 0, W, H);
  g.save(); g.globalAlpha = .18 + .1 * Math.sin(t * 3); g.translate(W / 2, 1000); g.scale(5, 5); faceTomas(g, { smile: 1 }, true); g.restore();
  const k = eback(prog(t, 166.6, 166.9)); const sh = (Math.random() - .5) * 8;
  g.save(); g.translate(sh, 0); bigText(g, 'NO MIRES', W / 2, 760, 130, '#ff2b2b', k); bigText(g, 'ATRÁS', W / 2, 910, 170, '#ff2b2b', eback(prog(t, 167.2, 167.5))); g.restore();
}, 'cut');
// 15. Continuará
scene(168.73, (g, t, lt) => {
  g.fillStyle = '#060808'; g.fillRect(0, 0, W, H); const rg = g.createRadialGradient(W / 2, 820, 0, W / 2, 820, 700); rg.addColorStop(0, 'rgba(60,110,90,.35)'); rg.addColorStop(1, 'rgba(0,0,0,0)'); g.fillStyle = rg; g.fillRect(0, 0, W, H);
  for (let i = 0; i < 60; i++) { g.fillStyle = `rgba(200,240,220,${.2 + srnd(i) * .4})`; g.fillRect((srnd(i) * W + t * 15) % W, (srnd(i + 9) * H - t * 25 * (srnd(i + 3) + .3) + H * 9) % H, 4, 4); }
  const k = prog(lt, 0, .8); g.save(); g.globalAlpha = k; g.font = '900 120px CZ'; g.textAlign = 'center'; g.textBaseline = 'middle'; g.shadowColor = '#9dffb0'; g.shadowBlur = 40; g.fillStyle = '#d9f2e0'; g.fillText('CONTINUARÁ', W / 2, 760); g.restore();
  g.save(); g.globalAlpha = prog(lt, .4, 1); bigText(g, 'PARTE 2', W / 2, 900, 96, '#ffffff', 1, 'BB'); g.restore();
  if (lt > 1.74) bigText(g, 'SÍGUEME PARA VERLA', W / 2, 1010, 70, '#ff4a3d', eback(prog(lt, 1.74, 2.0)), 'BB');
}, 'fade', .5);
