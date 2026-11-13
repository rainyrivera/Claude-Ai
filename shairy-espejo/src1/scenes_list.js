// ---------- escenas Capítulo 1 ----------
const S = [];
const scene = (t0, draw, tr = 'cut', trd = 0) => S.push({ t0, draw, tr, trd });
const pill = (g, x, y, k, txt, bg = '#ece4cf', col = '#1b1b1b', size = 54) => { if (k <= 0) return; g.save(); g.translate(x, y); g.scale(k, k); g.font = `${size}px BB`; const w = g.measureText(txt).width; rr(g, -w / 2 - 34, -size * .9, w + 68, size * 1.8, 18); fs(g, bg, 5); g.fillStyle = col; g.textAlign = 'center'; g.textBaseline = 'middle'; g.fillText(txt, 0, 4); g.restore(); };
const R = { mir: true };  // reflejos

// 0. Gancho
scene(0, (g, t, lt) => {
  kitchen(g, t, 1); table(g, 1180);
  figure(g, 260, 1280, .95, MAMA, { ...idle(t, 1), ...R, t, unc: lt > 7.4 });
  figure(g, 500, 1280, 1.0, PAPA, { ...idle(t, 2), ...R, t, unc: lt > 7.4 });
  figure(g, 720, 1300, .85, JOAQUIN, { ...idle(t, 3), ...R, t, unc: lt > 7.4 });
  figure(g, 940, 1330, 1.0, SHAIRY, { ...idle(t, 4), t, wide: lt > 7.4 });
  if (lt > 8.3) { g.save(); g.globalAlpha = .25 + .15 * Math.sin(t * 20); g.fillStyle = '#ff2020'; g.fillRect(0, 0, W, H); g.restore(); }
});
// 1. Título
scene(10.74, (g, t, lt) => {
  g.fillStyle = '#0c0f16'; g.fillRect(0, 0, W, H);
  mirror(g, W / 2, 560, .8 * eback(prog(lt, 0, .5)), { crack: prog(lt, .6, 1.4), t });
  bigText(g, 'EL OTRO LADO', W / 2, 980, 110, '#f0e8d8', eback(prog(lt, .3, .6)), 'CZ'); bigText(g, 'DEL ESPEJO', W / 2, 1100, 110, '#f0e8d8', eback(prog(lt, .5, .8)), 'CZ');
  g.save(); g.globalAlpha = .25; g.translate(W, 0); g.scale(-1, 1); bigText(g, 'DEL ESPEJO', W / 2, 1200, 110, '#9fb8c4', eback(prog(lt, .5, .8)), 'CZ'); g.restore();
  if (lt > 2.15) { const k = eback(prog(lt, 2.15, 2.4)); g.save(); g.translate(W / 2, 1520); g.rotate(-.04); g.scale(k, k); g.fillStyle = '#9d1418'; g.fillRect(-210, -56, 420, 112); g.lineWidth = 5; g.strokeStyle = '#ffd7c2'; g.strokeRect(-200, -46, 400, 92); g.font = '74px LG'; g.fillStyle = '#ffe9dc'; g.textAlign = 'center'; g.textBaseline = 'middle'; g.fillText('CAPÍTULO 1', 0, 8); g.restore(); }
}, 'glitch', .35);
// 2. Shairy y la pelea
scene(14.27, (g, t, lt) => {
  bedroom(g, t, 1);
  if (t < 16.76) { figure(g, W / 2, 1330, 1.2, SHAIRY, { ...idle(t), t }); dossier(g, W / 2, 470, .7 * eback(prog(t, 14.3, 14.6)), SHAIRY.head, [['SHAIRY', '#1b1b1b', 70], ['16 AÑOS'], ['PROTAGONISTA', '#3f8f8a']], { tag: 'ELLA' }); }
  else { figure(g, 300, 1330, 1.1, MAMA, { t, mouth: 'yell', aL: -1.2 }); figure(g, 780, 1330, 1.1, SHAIRY, { t, mouth: 'yell', aR: 1.3, aL: -.4 });
    bubble(g, 330, 520, 480, 200, ['«¡NO VAS A IR!»'], { size: 56, tail: [-40, 120] }); if (t > 18.6) bubble(g, 760, 760, 480, 200, ['«¡NO ES JUSTO!»'], { size: 56, tail: [40, 120] });
    g.save(); g.translate(W / 2, 330); g.rotate(-.06); rr(g, -160, -90, 320, 180, 10); fs(g, '#ff7aa8', 6); g.font = '64px LG'; g.fillStyle = '#fff'; g.textAlign = 'center'; g.textBaseline = 'middle'; g.fillText('FIESTA', 0, 6); g.strokeStyle = '#c4161c'; g.lineWidth = 14; g.beginPath(); g.moveTo(-150, -80); g.lineTo(150, 80); g.stroke(); g.restore(); }
}, 'push', .3);
// 3. El deseo
scene(21.06, (g, t, lt) => {
  hallway(g, t, 1); mirror(g, W / 2, 760, 1.0, { inside: gg => { gg.save(); gg.translate(0, 520); gg.scale(-1, 1); figure(gg, 0, 0, .95, SHAIRY, { t, mouth: t > 25.54 ? 'yell' : 'flat' }); gg.restore(); }, glow: t > 25.54 ? .5 + .5 * Math.sin(t * 10) : 0, t });
  figure(g, W / 2, 1460, 1.2, SHAIRY, { t, mouth: t > 25.54 ? 'yell' : 'flat', aL: t > 25.54 ? -.6 : .1, aR: t > 25.54 ? .6 : -.1, bob: t > 25.54 ? Math.sin(t * 30) * 3 : 0 });
  if (t > 23.32 && t < 25.5) pill(g, W / 2, 300, eback(prog(t, 23.32, 23.6)), 'EL ESPEJO DE LA ABUELA', '#ece4cf', '#1b1b1b', 50);
  if (t > 25.54) { g.save(); g.translate((Math.random() - .5) * 10, 0); bigText(g, '¡OJALÁ TUVIERA', W / 2, 280, 84, '#ff4a3d', eback(prog(t, 25.54, 25.8)), 'LG'); bigText(g, 'OTRA FAMILIA!', W / 2, 380, 84, '#ff4a3d', eback(prog(t, 25.9, 26.2)), 'LG'); g.restore(); }
}, 'push', .3);
// 4. Portazo, crujido, llanto
scene(27.85, (g, t, lt) => {
  if (t < 31.56) { hallway(g, t, 1); const sh = t > 28.5 && t < 29.2 ? (Math.random() - .5) * 30 : 0; g.save(); g.translate(sh, 0); mirror(g, W / 2, 760, 1.0, { crack: prog(t, 29.98, 30.9), t }); g.restore(); if (t > 28.5 && t < 29.4) bigText(g, '¡PUM!', W / 2, 300, 150, '#ffd21f', eback(prog(t, 28.5, 28.7)), 'LG'); if (t > 29.98) pill(g, W / 2, 300, eback(prog(t, 29.98, 30.2)), 'CRAAAC…', '#1b1b1b', '#e8f0f4', 70); }
  else { bedroom(g, t, 1); g.save(); g.translate(260, 1010); g.rotate(-1.4); SHAIRY.head(g, { t, blink: true, tears: true, mouth: 'cry' }); g.restore(); rr(g, 300, 1000, 640, 120, 40); fs(g, '#6a5aa0', 6); }
}, 'push', .3);
// 5. La mañana perfecta
scene(33.40, (g, t, lt) => {
  kitchen(g, t, 1); table(g, 1180);
  if (t < 38.17) { for (let i = 0; i < 14; i++) { const a = srnd(i) * 6.28, d = 200 + srnd(i + 3) * 350; const k = (Math.sin(t * 3 + i) + 1) / 2; star(g, W / 2 + Math.cos(a) * d, 760 + Math.sin(a) * d * .7, 22 * k + 6, 9 * k + 3, '#ffe68a'); } if (t > 36.17) bigText(g, 'DEMASIADO PERFECTO', W / 2, 760, 90, '#ffd21f', eback(prog(t, 36.17, 36.4)), 'LG'); }
  else { pancakes(g, 540, 1120, .7 * eback(prog(t, 38.17, 38.5)));
    figure(g, 230, 1280, .95, MAMA, { ...idle(t, 1), ...R, t, mouth: 'smile' });
    figure(g, 840, 1280, 1.0, PAPA, { ...idle(t, 2), ...R, t, aR: t > 44.93 ? -1.2 : -.12, holdR: t > 44.93 ? (gg, x, y) => { rr(gg, x - 30, y - 70, 60, 90, 8); fs(gg, '#ffa830', 5); } : null });
    if (t > 46.58) { figure(g, 640, 1310, .85, JOAQUIN, { ...idle(t, 3), ...R, t, aL: -1.2, aR: 1.2 }); }
    if (t > 40.82 && t < 44.8) bubble(g, 340, 520, 640, 220, ['«¡CLARO QUE PUEDES', 'IR A LA FIESTA!»'], { size: 52, tail: [-80, 140] });
    if (t > 48.7) { const k = eback(prog(t, 48.7, 48.95)); pill(g, W / 2, 420, k, 'LA PELEA', '#ece4cf', '#1b1b1b', 70); if (t > 49.3) { g.strokeStyle = '#c4161c'; g.lineWidth = 12; g.beginPath(); g.moveTo(W / 2 - 200, 420); g.lineTo(W / 2 - 200 + 400 * prog(t, 49.3, 49.7), 420); g.stroke(); } } }
}, 'push', .3);
// 6. Algo no encaja: comparaciones
scene(50.84, (g, t, lt) => {
  g.fillStyle = '#1a1d22'; g.fillRect(0, 0, W, H);
  if (t < 53.16) bigText(g, 'ALGO NO ENCAJA', W / 2, 800, 110, '#ff4a3d', eback(prog(t, 51.39, 51.7)), 'LG');
  else if (t < 57.57) compareCard(g, eback(prog(t, 53.16, 53.45)), 'PAPÁ SIRVE CON LA…', 'ANTES', 'HOY', gg => handIcon(gg, false), gg => handIcon(gg, true));
  else if (t < 60.44) compareCard(g, eback(prog(t, 57.57, 57.85)), 'EL LUNAR DE MAMÁ', 'ANTES', 'HOY', gg => { gg.save(); gg.scale(2, 2); mamaHead(gg, {}); gg.restore(); gg.strokeStyle = '#1f9e4a'; gg.lineWidth = 6; gg.beginPath(); gg.arc(-44, 32, 26, 0, 7); gg.stroke(); }, gg => { gg.save(); gg.scale(2, 2); mamaHead(gg, R); gg.restore(); gg.strokeStyle = '#c4161c'; gg.lineWidth = 6; gg.beginPath(); gg.arc(44, 32, 26, 0, 7); gg.stroke(); });
  else compareCard(g, eback(prog(t, 60.44, 60.7)), 'EL PELO DE JOAQUÍN', 'ANTES', 'HOY', gg => { gg.save(); gg.scale(2, 2); joaHead(gg, {}); gg.restore(); }, gg => { gg.save(); gg.scale(2, 2); joaHead(gg, R); gg.restore(); });
}, 'push', .3);
// 7. Pregunta 1
scene(63.86, (g, t, lt) => {
  g.fillStyle = '#0c0f16'; g.fillRect(0, 0, W, H);
  question(g, t, 63.9, '¿QUÉ NOTARÍAS?', [['A', 'LA MANO DE PAPÁ'], ['B', 'EL LUNAR DE MAMÁ'], ['C', 'EL PELO DE JOAQUÍN']], [65.5, 66.6, 68.32]);
  commentIcon(g, W / 2, 1580, eback(prog(t, 69.75, 70.0)));
}, 'zoom', .3);
// 8. Espejos tapados
scene(71.56, (g, t, lt) => {
  hallway(g, t, 0);
  if (t < 78.42) mirror(g, W / 2, 760, 1.0, { crack: 1, cover: t > 75.8 ? eout(prog(t, 75.8, 76.6)) : 0, t });
  else if (t < 80.45) { [[200, 'BAÑO'], [540, 'SALA'], [880, 'CUARTO']].forEach(([x, n], i) => { const k = eback(prog(t, 78.42 + i * .3, 78.7 + i * .3)); if (k <= 0) return; g.save(); g.translate(x, 760); g.scale(k, k); mirror(g, 0, 0, .45, { cover: 1 }); g.font = '44px BB'; g.fillStyle = '#1b1b1b'; g.textAlign = 'center'; g.fillText(n, 0, 260); g.restore(); }); }
  else { mirror(g, 780, 760, .7, { crack: 1, cover: 1 }); figure(g, 230, 1330, 1.05, SHAIRY, { ...idle(t), t, aR: -.8 }); if (t > 82.38) figure(g, 520, 1330, 1.0, MAMA, { ...idle(t, 1), ...R, t, unc: true });
    if (t < 82.3) bubble(g, 330, 480, 620, 200, ['«¿POR QUÉ TAPARON', 'LOS ESPEJOS?»'], { size: 50, tail: [-60, 120] }); else if (t > 83.82) bubble(g, 560, 480, 720, 200, ['«PORQUE LA CASA SE VE', 'MÁS BONITA ASÍ»'], { size: 50, tail: [-40, 120] }); }
}, 'push', .3);
// 9. Canela gruñe
scene(86.49, (g, t, lt) => {
  g.fillStyle = '#8ac0e8'; g.fillRect(0, 0, W, 1100); g.fillStyle = '#6a9a4a'; g.fillRect(0, 1100, W, H); for (let x = 0; x < W; x += 60) { rr(g, x, 900, 40, 200, 6); fs(g, '#e8dcc0', 4); }
  figure(g, 760, 1330, 1.1, PAPA, { ...idle(t, 2), ...R, t, unc: true, aR: -.8 }); canela(g, 300, 1380, 1.1, t, t > 87.92);
  if (t > 87.92) { g.save(); g.font = '90px LG'; g.fillStyle = '#ff4a3d'; g.textAlign = 'center'; g.lineWidth = 12; g.strokeStyle = '#000'; const sx = Math.sin(t * 40) * 4; g.strokeText('GRRR…', 400 + sx, 1060); g.fillText('GRRR…', 400 + sx, 1060); g.restore(); }
  if (t > 89.5) pill(g, W / 2, 420, eback(prog(t, 89.5, 89.75)), 'NUNCA LE HABÍA GRUÑIDO A NADIE', '#1b1b1b', '#ffd21f', 46);
}, 'push', .3);
// 10. La nota al revés
scene(91.67, (g, t, lt) => {
  g.fillStyle = '#e8eef0'; g.fillRect(0, 0, W, H); rr(g, 140, 120, 800, 1700, 40); fs(g, '#f6f8fa', 8); g.fillStyle = '#d8dee2'; g.fillRect(150, 700, 780, 8); rr(g, 860, 300, 30, 300, 14); fs(g, '#b8c0c4', 4); rr(g, 860, 800, 30, 300, 14); fs(g, '#b8c0c4', 4);
  const k = eback(prog(t, 91.7, 92.0)); const flip = t > 97.18 ? lerp(-1, 1, eio(prog(t, 97.18, 98.3))) : -1; fridgeNote(g, 500, 520, 1.1 * k, flip, t);
  if (t > 95.65 && t < 97.1) { g.strokeStyle = '#ff2b2b'; g.lineWidth = 8; g.beginPath(); g.ellipse(500, 540, 290, 110, 0, 0, 7 * prog(t, 95.65, 96.2)); g.stroke(); pill(g, 500, 900, 1, 'LETRAS AL REVÉS', '#c4161c', '#fff', 54); }
  if (t > 97.18) pill(g, 500, 900, eback(prog(t, 97.3, 97.6)), 'ESCRITA EN UN ESPEJO', '#1b1b1b', '#ffd21f', 54);
}, 'push', .3);
// 11. Nadie come
scene(99.09, (g, t, lt) => {
  nightKitchen(g, t, .8); table(g, 1180);
  for (const [x, y] of [[230, 1150], [540, 1150], [850, 1150]]) { ell(g, x, y, 90, 26, '#f2f2f2', 5); ell(g, x, y - 8, 56, 16, '#c86a3a', 3); }
  figure(g, 230, 1280, .95, MAMA, { ...idle(t, 1), ...R, t, unc: true }); figure(g, 540, 1280, 1.0, PAPA, { ...idle(t, 2), ...R, t, unc: true }); figure(g, 850, 1300, .85, JOAQUIN, { ...idle(t, 3), ...R, t, unc: true });
  if (t > 100.0) pill(g, W / 2, 420, eback(prog(t, 100.0, 100.25)), 'NADIE COME', '#c4161c', '#fff', 64);
  if (t > 103.5) pill(g, W / 2, 560, eback(prog(t, 103.5, 103.75)), 'PLATOS: LLENOS', '#ece4cf', '#1b1b1b', 52);
}, 'push', .3);
// 12. 3 AM – toc toc toc
scene(105.79, (g, t, lt) => {
  bedroom(g, t, 1); g.fillStyle = 'rgba(0,0,0,.35)'; g.fillRect(0, 0, W, H); rr(g, 760, 600, 220, 700, 6); fs(g, '#2a2420', 7);
  if (t < 109.16) digiClock(g, W / 2, 520, 1.3 * eback(prog(t, 105.8, 106.05)), '3:00');
  [[109.16, 300], [109.98, 540], [110.77, 780]].forEach(([t0, x]) => { if (t < t0) return; const k = eback(prog(t, t0, t0 + .15)); bigText(g, 'TOC', x, 420, 110, '#f0e8d8', k, 'LG'); });
  const sh = [109.16, 109.98, 110.77].some(t0 => t > t0 && t < t0 + .2) ? (Math.random() - .5) * 14 : 0; g.save(); g.translate(sh, 0); rr(g, 760, 600, 220, 700, 6); fs(g, '#2a2420', 7); ell(g, 790, 950, 10, 10, '#d7a93a', 3); g.restore();
  g.save(); g.translate(260, 1010); g.rotate(-1.4); SHAIRY.head(g, { t, wide: t > 107.32 }); g.restore(); rr(g, 300, 1000, 640, 120, 40); fs(g, '#6a5aa0', 6);
}, 'push', .3);
// 13. La familia en el pasillo
scene(111.62, (g, t, lt) => {
  g.fillStyle = '#05070a'; g.fillRect(0, 0, W, H); const op = eio(prog(t, 111.7, 112.8));
  g.save(); g.beginPath(); g.rect(W / 2 - 420 * op, 200, 840 * op, 1200); g.clip(); hallway(g, t, 1); g.fillStyle = 'rgba(0,0,0,.45)'; g.fillRect(0, 0, W, H);
  const P = [[260, MAMA, 112.94, .95], [540, PAPA, 115.21, 1.0], [780, JOAQUIN, 115.98, .85]]; P.forEach(([x, sp, t0, s]) => { if (t < t0) return; g.save(); g.globalAlpha = prog(t, t0, t0 + .4); figure(g, x, 1300, s, sp, { ...R, t, unc: true, aL: .05, aR: -.05 }); g.restore(); });
  g.restore(); g.lineWidth = 14; g.strokeStyle = '#2a2420'; g.strokeRect(W / 2 - 430, 190, 860, 1220);
  if (t > 117.05 && t < 120.3) { const L = [['DE PIE', 117.05], ['SONRIENDO', 117.92], ['SIN PARPADEAR', 118.93]]; L.forEach(([n, t0], i) => { if (t > t0) pill(g, W / 2, 1580 + i * 0, eback(prog(t, t0, t0 + .2)), n, '#1b1b1b', '#ffd21f', 56); }); }
  if (t > 120.42) bubble(g, 330, 400, 640, 220, t < 122.02 ? ['«VUELVE A DORMIR,', 'MI AMOR»'] : ['«SOLO QUERÍAMOS', 'VERTE»'], { size: 52, tail: [-40, 140] });
}, 'push', .3);
// 14. El espejo del baño
scene(123.70, (g, t, lt) => {
  bathroom(g, t);
  const momIn = t > 126.89; const pound = momIn && t > 133.97;
  mirror(g, W / 2, 760, 1.25, { cover: 1 - eout(prog(t, 124.6, 125.6)), t, inside: gg => {
    if (momIn) { gg.save(); gg.globalAlpha = prog(t, 126.89, 127.6); gg.translate(70, 70 + (pound ? Math.sin(t * 16) * 4 : 0)); figure(gg, 0, 0, .75, MAMA, { t, tears: true, mouth: t > 137.16 ? 'o' : 'cry', aL: pound ? 2.6 + Math.sin(t * 16) * .15 : .1, aR: pound ? -2.6 - Math.sin(t * 16) * .15 : -.1 }); gg.restore();
      if (t > 130.86 && t < 133.9) { gg.strokeStyle = '#1f9e4a'; gg.lineWidth = 6; gg.beginPath(); gg.arc(70 - 16.5, 70 - 180 + 12, 18, 0, 7 * prog(t, 130.86, 131.3)); gg.stroke(); } }
    gg.save(); gg.translate(-60, 330); gg.scale(-1, 1); figure(gg, 0, 0, .95, SHAIRY, { t, wide: true, mouth: 'o' }); gg.restore(); } });
  if (pound) for (let i = 0; i < 3; i++) { const p = ((t * 2 + i / 3) % 1); g.strokeStyle = `rgba(255,255,255,${.5 * (1 - p)})`; g.lineWidth = 4; g.beginPath(); g.arc(W / 2 + 90, 600, 40 + p * 160, 0, 7); g.stroke(); }
  if (t > 130.86 && t < 133.9) { pill(g, W / 2, 1420 + 140, eback(prog(t, 130.86, 131.1)), 'LUNAR EN LA MEJILLA CORRECTA', '#1f9e4a', '#fff', 46); }
  if (t > 138.72) { g.save(); g.translate((Math.random() - .5) * 6, 0); bigText(g, '«AYÚDANOS»', W / 2, 1560, 130, '#ff2b2b', eback(prog(t, 138.72, 139.0)), 'PM'); g.restore(); }
}, 'push', .3);
// 15. Pregunta final
scene(140.30, (g, t, lt) => {
  g.fillStyle = '#0c0f16'; g.fillRect(0, 0, W, H); mirror(g, W / 2, 420, .45, { crack: 1, t });
  const k = eback(prog(t, 140.35, 140.65)); g.save(); g.translate(W / 2, 880); g.scale(k, k); rr(g, -460, -170, 920, 340, 30); fs(g, '#12161c', 8); g.font = '74px LG'; g.textAlign = 'center'; g.textBaseline = 'middle'; g.fillStyle = '#ffd21f'; g.lineWidth = 12; g.strokeStyle = '#000';
  for (const [s, y] of [['¿QUÉ HARÍAS TÚ', -50], ['SI FUERAS SHAIRY?', 50]]) { g.strokeText(s, 0, y); g.fillText(s, 0, y); } g.restore();
  commentIcon(g, W / 2, 1580, eback(prog(t, 142.17, 142.45)));
}, 'zoom', .3);
// 16. Continuará
scene(144.01, (g, t, lt) => {
  g.fillStyle = '#07090c'; g.fillRect(0, 0, W, H); const k = prog(lt, 0, .8);
  g.save(); g.globalAlpha = k; g.font = '900 120px CZ'; g.textAlign = 'center'; g.textBaseline = 'middle'; g.shadowColor = '#9fd8ff'; g.shadowBlur = 40; g.fillStyle = '#e8f0f4'; g.fillText('CONTINUARÁ', W / 2, 760); g.restore();
  g.save(); g.globalAlpha = prog(lt, .4, 1); bigText(g, 'CAPÍTULO 2', W / 2, 900, 96, '#ffffff', 1, 'BB'); g.restore();
  if (lt > 1.77) bigText(g, 'SÍGUEME PARA NO PERDÉRTELO', W / 2, 1010, 64, '#ff4a3d', eback(prog(lt, 1.77, 2.0)), 'BB');
}, 'fade', .5);
