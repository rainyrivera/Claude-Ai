// ---------- escenas Capítulo 2 ----------
const S = [];
const scene = (t0, draw, tr = 'cut', trd = 0) => S.push({ t0, draw, tr, trd });
const pill = (g, x, y, k, txt, bg = '#ece4cf', col = '#1b1b1b', size = 54) => { if (k <= 0) return; g.save(); g.translate(x, y); g.scale(k, k); g.font = `${size}px BB`; const w = g.measureText(txt).width; rr(g, -w / 2 - 34, -size * .9, w + 68, size * 1.8, 18); fs(g, bg, 5); g.fillStyle = col; g.textAlign = 'center'; g.textBaseline = 'middle'; g.fillText(txt, 0, 4); g.restore(); };
const R = { mir: true };

// 0. Gancho: familia real dentro / reflejos fuera
scene(0, (g, t, lt) => {
  hallway(g, t, 1);
  mirror(g, W / 2, 700, 1.2, { crack: 1, t, inside: gg => { const pd = Math.sin(t * 14) * 4; gg.save(); gg.translate(-90, 120 + pd); figure(gg, 0, 0, .55, MAMA, { t, tears: true, mouth: 'cry', aL: 2.6, aR: -2.6 }); gg.restore(); gg.save(); gg.translate(30, 120 - pd); figure(gg, 0, 0, .58, PAPA, { t, mouth: 'o', aL: 2.6, aR: -2.6 }); gg.restore(); gg.save(); gg.translate(110, 160 + pd); figure(gg, 0, 0, .5, JOAQUIN, { t, tears: true, mouth: 'cry', aL: 2.6, aR: -2.6 }); gg.restore(); } });
  if (t > 6.03) { g.save(); g.globalAlpha = prog(t, 6.03, 6.6); figure(g, 230, 1450, .95, MAMA, { ...R, t, unc: true }); figure(g, 860, 1450, 1.0, PAPA, { ...R, t, unc: true }); g.restore(); }
});
// 1. Título
scene(9.90, (g, t, lt) => {
  g.fillStyle = '#0c0f16'; g.fillRect(0, 0, W, H);
  mirror(g, W / 2, 560, .8 * eback(prog(lt, 0, .5)), { crack: 1, t });
  bigText(g, 'EL OTRO LADO', W / 2, 980, 110, '#f0e8d8', eback(prog(lt, .3, .6)), 'CZ'); bigText(g, 'DEL ESPEJO', W / 2, 1100, 110, '#f0e8d8', eback(prog(lt, .5, .8)), 'CZ');
  g.save(); g.globalAlpha = .25; g.translate(W, 0); g.scale(-1, 1); bigText(g, 'DEL ESPEJO', W / 2, 1200, 110, '#9fb8c4', eback(prog(lt, .5, .8)), 'CZ'); g.restore();
  if (lt > 2.14) { const k = eback(prog(lt, 2.14, 2.4)); g.save(); g.translate(W / 2, 1520); g.rotate(-.04); g.scale(k, k); g.fillStyle = '#9d1418'; g.fillRect(-210, -56, 420, 112); g.lineWidth = 5; g.strokeStyle = '#ffd7c2'; g.strokeRect(-200, -46, 400, 92); g.font = '74px LG'; g.fillStyle = '#ffe9dc'; g.textAlign = 'center'; g.textBaseline = 'middle'; g.fillText('CAPÍTULO 2', 0, 8); g.restore(); }
}, 'glitch', .35);
// 2. Fingir y buscar pruebas
scene(13.52, (g, t, lt) => {
  kitchen(g, t, .9); g.save(); g.translate(W / 2, 1720); figure(g, 0, 0, 2.1, SHAIRY, { t, mouth: 'flat', blink: blinkAt(t) }); g.restore();
  pill(g, W / 2, 420, eback(prog(t, 13.6, 13.9)), 'FINGIR QUE TODO ES NORMAL', '#ece4cf', '#1b1b1b', 52);
  if (t > 16.57) { pill(g, W / 2, 560, eback(prog(t, 16.57, 16.85)), 'Y BUSCAR PRUEBAS', '#c4161c', '#fff', 60); const k = eback(prog(t, 16.8, 17.1)); g.save(); g.translate(860, 760); g.scale(k, k); g.lineWidth = 16; g.strokeStyle = '#2a2a2a'; g.beginPath(); g.arc(0, 0, 90, 0, 7); g.stroke(); g.beginPath(); g.moveTo(60, 70); g.lineTo(130, 150); g.lineWidth = 24; g.stroke(); g.restore(); }
}, 'push', .3);
// 3. Prueba 1: saludo secreto
scene(18.24, (g, t, lt) => {
  g.fillStyle = '#1a1d22'; g.fillRect(0, 0, W, H); pill(g, W / 2, 330, eback(prog(t, 18.3, 18.55)), 'PRUEBA 1: EL SALUDO SECRETO', '#ffd21f', '#1b1b1b', 54);
  const order = [['clap', 'DOS PALMADAS', 22.4], ['fist', 'UN PUÑO', 23.53], ['spin', 'UN GIRO', 24.3]];
  g.save(); g.translate(0, 0); rr(g, 70, 450, 440, 820, 16); fs(g, '#ece4cf', 6); rr(g, 570, 450, 440, 820, 16); fs(g, '#ece4cf', 6);
  g.font = '50px BB'; g.textAlign = 'center'; g.fillStyle = '#1f9e4a'; g.fillText('ANTES', 290, 520); g.fillStyle = '#c4161c'; g.fillText('HOY', 790, 520);
  order.forEach(([k, n, t0], i) => { if (t < t0) return; const kk = eback(prog(t, t0, t0 + .25)); stepsIcon(g, k, 200, 660 + i * 220, .9 * kk); g.font = '36px BB'; g.fillStyle = '#1b1b1b'; g.textAlign = 'left'; g.fillText(`${i + 1}. ${n}`, 270, 670 + i * 220); });
  if (t > 25.37) order.slice().reverse().forEach(([k, n], i) => { const t0 = 25.4 + i * .4; if (t < t0) return; const kk = eback(prog(t, t0, t0 + .25)); stepsIcon(g, k, 700, 660 + i * 220, .9 * kk); g.font = '36px BB'; g.fillStyle = '#c4161c'; g.textAlign = 'left'; g.fillText(`${i + 1}. ${n}`, 770, 670 + i * 220); });
  g.restore(); if (t > 26.5) pill(g, W / 2, 1600, eback(prog(t, 26.5, 26.75)), 'TODO AL REVÉS', '#c4161c', '#fff', 64);
}, 'push', .3);
// 4. Prueba 2: el reloj
scene(27.93, (g, t, lt) => {
  g.fillStyle = '#1a1d22'; g.fillRect(0, 0, W, H); pill(g, W / 2, 330, eback(prog(t, 28.0, 28.25)), 'PRUEBA 2: EL RELOJ', '#ffd21f', '#1b1b1b', 54);
  if (t < 30.97) { g.save(); g.translate(W / 2, 1600); figure(g, 0, 0, 2.0, PAPA, { ...R, t, unc: true, aR: -1.4 }); g.restore(); }
  else { rr(g, 70, 450, 440, 880, 16); fs(g, '#ece4cf', 6); rr(g, 570, 450, 440, 880, 16); fs(g, '#ece4cf', 6); g.font = '50px BB'; g.textAlign = 'center'; g.fillStyle = '#1f9e4a'; g.fillText('ANTES: IZQUIERDA', 290, 520); g.fillStyle = '#c4161c'; g.fillText('HOY: DERECHA', 790, 520);
    wristWatch(g, 290, 900, 1.3, t, false); wristWatch(g, 790, 900, 1.3, t * (t > 33.17 ? 3 : 1), t > 33.17);
    if (t > 33.17) pill(g, 790, 1200, eback(prog(t, 33.17, 33.4)), 'GIRA HACIA ATRÁS', '#c4161c', '#fff', 40); }
}, 'push', .3);
// 5. Prueba 3: la foto
scene(35.66, (g, t, lt) => {
  kitchen(g, t, .85); pill(g, W / 2, 300, eback(prog(t, 35.7, 35.95)), 'PRUEBA 3: UNA FOTO', '#ffd21f', '#1b1b1b', 54);
  const take = t > 43.92; const px = take ? lerp(W / 2, -400, eio(prog(t, 44.5, 45.8))) : W / 2;
  phoneUI(g, px, 900, .95, gg => { gg.fillStyle = '#c9b48f'; gg.fillRect(-260, -480, 520, 960);
    gg.save(); if (t > 38.89) gg.filter = 'blur(10px)'; figure(gg, -160, 260, .55, MAMA, { ...R, t, unc: true }); figure(gg, -30, 260, .6, PAPA, { ...R, t, unc: true }); figure(gg, 90, 300, .5, JOAQUIN, { ...R, t, unc: true }); gg.restore();
    figure(gg, 190, 280, .55, SHAIRY, { t, mouth: 'flat' });
    if (Math.floor(t * 2) % 2 === 0) { gg.fillStyle = '#ff3030'; gg.beginPath(); gg.arc(-200, -420, 12, 0, 7); gg.fill(); } });
  if (t > 39.87 && t < 43.9) pill(g, W / 2, 1520, eback(prog(t, 39.87, 40.1)), t < 41.73 ? 'CARAS BORROSAS' : 'SOLO ELLA ES NÍTIDA', '#c4161c', '#fff', 56);
  if (take) { figure(g, lerp(1300, 760, eout(prog(t, 43.92, 44.6))), 1600, 1.4, MAMA, { ...R, t, unc: true, aR: -1.3 }); if (t > 46.5) bubble(g, 420, 520, 620, 220, ['«BASTA DE FOTOS,', 'MI AMOR. COME»'], { size: 52, tail: [120, 140] }); }
}, 'push', .3);
// 6. Pregunta 1
scene(49.03, (g, t, lt) => {
  g.fillStyle = '#0c0f16'; g.fillRect(0, 0, W, H);
  question(g, t, 49.1, '¿QUIÉN TE AYUDA?', [['A', 'A LA POLICÍA'], ['B', 'A UNA AMIGA'], ['C', 'A LA ABUELA']], [50.71, 51.84, 52.4]);
  commentIcon(g, W / 2, 1580, eback(prog(t, 53.76, 54.0)));
}, 'zoom', .3);
// 7. La abuela Rosa
scene(55.97, (g, t, lt) => {
  if (t < 65.49) { if (t < 58.27) { grannyHouse(g, t); dossier(g, W / 2, 380, .62 * eback(prog(t, 56.1, 56.4)), ABUELA.head, [['ABUELA ROSA', '#1b1b1b', 64], ['DUEÑA DEL ESPEJO']], { tag: 'FAMILIA' }); }
    else { g.fillStyle = '#e8d8b8'; g.fillRect(0, 0, W, H); g.fillStyle = 'rgba(140,100,50,.25)'; g.fillRect(0, 0, W, H); mirror(g, 720, 700, .8, {}); figure(g, 300, 1330, 1.05, ABUELA, { ...idle(t), t, aR: -1.1, mouth: 'smile' }); pill(g, W / 2, 230, 1, 'HACE 10 AÑOS', '#5a3a22', '#f2e8d0', 50);
      if (t > 62.32) bubble(g, 540, 1500, 760, 220, ['«CUÍDENLO. ESE ESPEJO', 'TIENE MEMORIA»'], { size: 52, tail: [-120, -140] }); } }
  else { grannyHouse(g, t); g.fillStyle = '#ffe4a8'; g.fillRect(480, 1010, 120 * prog(t, 65.5, 66.3), 340); figure(g, 540, 1330, 1.05, ABUELA, { ...idle(t), t }); figure(g, 840, 1360, 1.0, SHAIRY, { ...idle(t, 2), t, wide: t > 69.59 });
    if (t > 69.59) bubble(g, 480, 560, 700, 220, ['«ROMPISTE EL ESPEJO,', '¿VERDAD?»'], { size: 56, tail: [0, 140] }); }
}, 'push', .3);
// 8. La explicación
const RULES = [[75.18, 'VIVEN DEL OTRO LADO', 'copy'], [79.01, 'NOS ENVIDIAN', 'envy'], [80.32, 'SOLO CRUZAN SI LOS INVITAN', 'door'], [83.6, 'TÚ LOS INVITASTE', 'wish'], [84.89, 'EL ESPEJO SE ROMPIÓ: PUERTA ABIERTA', 'crack'], [88.08, 'NO SOPORTAN VERSE A SÍ MISMOS', 'sheet']];
scene(71.67, (g, t, lt) => {
  grannyRoom(g, t);
  if (t < 75.18) { figure(g, 330, 1330, 1.05, ABUELA, { ...idle(t), t }); figure(g, 760, 1360, 1.0, SHAIRY, { ...idle(t, 2), t, aR: -.6 }); }
  else if (t < 90.9) { let cur = 0; RULES.forEach((r, i) => { if (t >= r[0]) cur = i; }); const [t0, title, key] = RULES[cur]; const k = eback(prog(t, t0, t0 + .25));
    g.fillStyle = 'rgba(0,0,0,.45)'; g.fillRect(0, 0, W, H); g.save(); g.translate(W / 2, 820); g.scale(k, k); rr(g, -420, -380, 840, 760, 12); fs(g, '#efe6cf', 8); rr(g, -380, -340, 760, 520, 6); fs(g, '#3a4048', 4);
    g.save(); g.beginPath(); g.rect(-380, -340, 760, 520); g.clip(); g.translate(0, -80);
    if (key === 'copy') { mirror(g, 0, 0, .55, { inside: gg => { gg.save(); gg.translate(0, 230); gg.scale(-1, 1); figure(gg, 0, 0, .7, SHAIRY, { t, aL: Math.sin(t * 3) * .8 }); gg.restore(); } }); }
    else if (key === 'envy') { mirror(g, 0, 0, .55, { inside: gg => { gg.save(); gg.translate(0, 230); figure(gg, 0, 0, .7, MAMA, { ...R, t, unc: true, aL: 2.4 }); gg.restore(); } }); for (let i = 0; i < 3; i++) { g.save(); g.translate(-250 + i * 250, 170); ell(g, -16, -8, 22, 22, '#ff4a6a', 0); ell(g, 16, -8, 22, 22, '#ff4a6a', 0); poly(g, [[-36, 0], [36, 0], [0, 40]], '#ff4a6a', 0); g.restore(); } }
    else if (key === 'door') { rr(g, -120, -200, 240, 400, 6); fs(g, '#4a2a1a', 7); g.save(); g.fillStyle = '#ffe9b0'; g.fillRect(-110, -190, 220 * (.5 + .5 * Math.sin(t * 2)), 380); g.restore(); }
    else if (key === 'wish') { bigText(g, '«¡OJALÁ TUVIERA', 0, -40, 64, '#ff4a3d', 1, 'LG'); bigText(g, 'OTRA FAMILIA!»', 0, 50, 64, '#ff4a3d', 1, 'LG'); }
    else if (key === 'crack') mirror(g, 0, 20, .55, { crack: 1, glow: .5 + .5 * Math.sin(t * 6) });
    else mirror(g, 0, 20, .55, { cover: 1 });
    g.restore(); g.font = '50px BB'; g.fillStyle = '#1b1b1b'; g.textAlign = 'center'; g.textBaseline = 'middle'; g.fillText(title, 0, 280); g.restore(); }
  else { figure(g, 330, 1330, 1.05, ABUELA, { ...idle(t), t }); figure(g, 760, 1360, 1.0, SHAIRY, { ...idle(t, 2), t, wide: true }); bubble(g, 700, 560, 600, 200, ['«¿CÓMO LOS REGRESO?»'], { size: 54, tail: [40, 140] }); }
}, 'push', .3);
// 9. Siete noches / el olvido
scene(92.48, (g, t, lt) => {
  g.fillStyle = '#0c1018'; g.fillRect(0, 0, W, H);
  if (t < 98.28) { moons(g, 480, 0, eback(prog(t, 92.5, 92.8))); bigText(g, '7 NOCHES', W / 2, 300, 110, '#f2e6b8', eback(prog(t, 92.5, 92.8)), 'BB');
    if (t > 95.6) { mirror(g, W / 2, 1050, .7, { t, inside: gg => { gg.save(); gg.globalAlpha = 1 - prog(t, 96.0, 98.0) * .8; gg.translate(-60, 200); figure(gg, 0, 0, .5, MAMA, { t, tears: true }); gg.translate(110, 0); figure(gg, 0, 0, .52, PAPA, { t }); gg.restore(); } }); pill(g, W / 2, 1560, eback(prog(t, 96.4, 96.7)), 'PARA SIEMPRE', '#c4161c', '#fff', 60); } }
  else if (t < 101.91) { const f = prog(t, 98.3, 101.6); g.save(); g.globalAlpha = 1 - f * .85; g.filter = `blur(${f * 12}px)`; photoFrame(g, W / 2, 760, 2.6, mamaHead); g.restore(); pill(g, W / 2, 1200, eback(prog(t, 98.3, 98.6)), 'LOS OLVIDARÁ', '#c4161c', '#fff', 64); }
  else if (t < 107.0) { kitchen(g, t, .5); g.fillStyle = 'rgba(10,15,30,.4)'; g.fillRect(0, 0, W, H); const f = prog(t, 104.8, 106.8); g.save(); g.globalAlpha = 1 - f; figure(g, 400, 1320, 1.1, MAMA, { t, mouth: 'o' }); for (let i = 0; i < 5; i++) { const p = (t * .5 + i / 5) % 1; bigText(g, '♪', 480 + i * 70 + Math.sin(t * 2 + i) * 20, 900 - p * 400, 70, '#ffd21f', 1, 'LG'); } g.restore(); if (t > 105.35) pill(g, W / 2, 420, eback(prog(t, 105.35, 105.6)), 'LE CUESTA RECORDAR SU VOZ', '#1b1b1b', '#ffd21f', 50); }
  else { moons(g, 760, 1, 1); pill(g, W / 2, 500, eback(prog(t, 107.0, 107.3)), 'YA PASÓ UNA NOCHE', '#ece4cf', '#1b1b1b', 60); pill(g, W / 2, 1060, eback(prog(t, 108.0, 108.3)), 'QUEDAN 6', '#c4161c', '#fff', 70); }
}, 'push', .3);
// 10. La sala oscura
scene(109.16, (g, t, lt) => {
  livingRoom(g, t, 0); g.fillStyle = 'rgba(0,0,0,.35)'; g.fillRect(0, 0, W, H);
  const up = t > 113.79; figure(g, up ? lerp(330, 600, eio(prog(t, 113.8, 115.0))) : 330, 1260, .95, MAMA, { ...R, t, unc: true, aR: t > 114.94 ? -1.6 : -.1 });
  figure(g, 540, 1260, 1.0, PAPA, { ...R, t, unc: true }); figure(g, 760, 1280, .85, JOAQUIN, { ...R, t, unc: true });
  figure(g, 920, 1360, 1.0, SHAIRY, { t, wide: true });
  if (t > 115.0 && t < 116.8) bubble(g, 480, 560, 560, 200, ['«¿DÓNDE ESTABAS,', 'MI AMOR?»'], { size: 52, tail: [60, 140] });
  if (t > 120.32) bubble(g, 480, 560, 740, 220, ['«TU ABUELA NO DEBERÍA', 'CONTARTE CUENTOS»'], { size: 52, tail: [60, 140], wobble: true });
}, 'push', .3);
// 11. La abuela no contesta
scene(122.90, (g, t, lt) => {
  bedroom(g, t, 1); phoneUI(g, W / 2, 860, .95, gg => { gg.fillStyle = '#1d232b'; gg.fillRect(-260, -480, 520, 960); gg.save(); gg.translate(0, -220); gg.scale(1.4, 1.4); ABUELA.head(gg, {}); gg.restore(); gg.font = '50px BB'; gg.fillStyle = '#fff'; gg.textAlign = 'center'; gg.fillText('ABUELA ROSA', 0, -40);
    gg.font = '40px BB'; gg.fillStyle = '#9ab'; gg.fillText(t < 126.56 ? 'LLAMANDO' + '.'.repeat(1 + Math.floor(t * 2) % 3) : 'SIN RESPUESTA', 0, 30); ell(gg, 0, 300, 60, 60, '#c4161c', 0); });
  if (t < 126.56) for (let i = 0; i < 3; i++) { const p = ((t * 1.2 + i / 3) % 1); g.strokeStyle = `rgba(255,255,255,${.5 * (1 - p)})`; g.lineWidth = 6; g.beginPath(); g.arc(W / 2, 640, 120 + p * 260, -2.4, -.7); g.stroke(); }
}, 'push', .3);
// 13. Pregunta final
scene(137.47, (g, t, lt) => {
  g.fillStyle = '#0c0f16'; g.fillRect(0, 0, W, H); g.save(); g.translate(W / 2, 420); g.scale(.9, .9); ABUELA.head(g, {}); g.restore();
  const k = eback(prog(t, 137.5, 137.8)); g.save(); g.translate(W / 2, 860); g.scale(k, k); rr(g, -460, -170, 920, 340, 30); fs(g, '#12161c', 8); g.font = '74px LG'; g.textAlign = 'center'; g.textBaseline = 'middle'; g.fillStyle = '#ffd21f'; g.lineWidth = 12; g.strokeStyle = '#000';
  for (const [s, y] of [['¿QUÉ LE PASÓ', -50], ['A LA ABUELA?', 50]]) { g.strokeText(s, 0, y); g.fillText(s, 0, y); } g.restore();
  commentIcon(g, W / 2, 1580, eback(prog(t, 139.29, 139.55)));
}, 'zoom', .3);
// 14. Continuará
scene(141.21, (g, t, lt) => {
  g.fillStyle = '#07090c'; g.fillRect(0, 0, W, H); const k = prog(lt, 0, .8);
  g.save(); g.globalAlpha = k; g.font = '900 120px CZ'; g.textAlign = 'center'; g.textBaseline = 'middle'; g.shadowColor = '#9fd8ff'; g.shadowBlur = 40; g.fillStyle = '#e8f0f4'; g.fillText('CONTINUARÁ', W / 2, 760); g.restore();
  g.save(); g.globalAlpha = prog(lt, .4, 1); bigText(g, 'CAPÍTULO 3', W / 2, 900, 96, '#ffffff', 1, 'BB'); g.restore();
  if (lt > 1.92) bigText(g, 'SÍGUEME PARA VERLO', W / 2, 1010, 64, '#ff4a3d', eback(prog(lt, 1.92, 2.15)), 'BB');
}, 'fade', .5);
