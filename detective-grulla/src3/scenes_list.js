// ---------- escenas Capítulo 3 ----------
const S = [];
const scene = (t0, draw, tr = 'cut', trd = 0) => S.push({ t0, draw, tr, trd });
const pill = (g, x, y, k, txt, bg = '#ece4cf', col = '#1b1b1b', size = 54) => { if (k <= 0) return; g.save(); g.translate(x, y); g.scale(k, k); g.font = `${size}px BB`; const w = g.measureText(txt).width; rr(g, -w / 2 - 34, -size * .9, w + 68, size * 1.8, 18); fs(g, bg, 5); g.fillStyle = col; g.textAlign = 'center'; g.textBaseline = 'middle'; g.fillText(txt, 0, 4); g.restore(); };

// 0. Gancho
scene(0, (g, t, lt) => {
  office(g, t, .5); g.save(); cam(g, lt, 9.9, .1, W / 2, 820);
  [[300, 760, '1'], [560, 640, '2'], [800, 780, '3']].forEach(([x, y, n], i) => { if (lt > i * .7) crane(g, x, y, .4 * eback(prog(lt, i * .7, i * .7 + .3)), { num: n }); });
  if (lt > 4.4) { g.save(); g.globalAlpha = prog(lt, 4.4, 5.2); photoFrame(g, W / 2, 1060, 1.1, ELENA_HEAD); g.restore(); g.strokeStyle = '#c4161c'; g.lineWidth = 6; const k = prog(lt, 5.0, 6.5); for (const [x, y] of [[300, 760], [560, 640], [800, 780]]) { g.beginPath(); g.moveTo(x, y); g.lineTo(lerp(x, W / 2, k), lerp(y, 1000, k)); g.stroke(); } }
  g.restore();
});
// 1. Título
scene(9.97, (g, t, lt) => {
  g.fillStyle = '#0a0d12'; g.fillRect(0, 0, W, H); rain(g, t, .2);
  crane(g, W / 2, 600, 1.4 * eback(prog(lt, 0, .5)), { glow: 1, rot: -.08 });
  bigText(g, 'LA GRULLA', W / 2, 920, 130, '#f0e8d8', eback(prog(lt, .2, .5)), 'CZ'); bigText(g, 'DE PAPEL', W / 2, 1050, 110, '#f0e8d8', eback(prog(lt, .4, .7)), 'CZ');
  if (lt > 2.07) { const k = eback(prog(lt, 2.07, 2.3)); g.save(); g.translate(W / 2, 1210); g.rotate(-.04); g.scale(k, k); g.fillStyle = '#9d1418'; g.fillRect(-210, -56, 420, 112); g.lineWidth = 5; g.strokeStyle = '#ffd7c2'; g.strokeRect(-200, -46, 400, 92); g.font = '74px LG'; g.fillStyle = '#ffe9dc'; g.textAlign = 'center'; g.textBaseline = 'middle'; g.fillText('CAPÍTULO 3', 0, 8); g.restore(); }
}, 'glitch', .35);
// 2. La caja de Elena
scene(13.91, (g, t, lt) => {
  nightKitchen(g, t, .8); table(g);
  const op = eio(prog(t, 15.0, 16.6)); g.save(); g.translate(W / 2, 1180); poly(g, [[-260, 0], [260, 0], [240, -220], [-240, -220]], '#9a7a50', 7); g.font = '54px PM'; g.fillStyle = '#1b1b1b'; g.textAlign = 'center'; g.fillText('ELENA', 0, -90); g.save(); g.translate(0, -220); g.scale(1, lerp(1, -1, op)); poly(g, [[-270, 0], [270, 0], [250, -70], [-250, -70]], '#b38f5e', 6); g.restore(); g.restore();
  if (t > 18.08) { const k = eout(prog(t, 18.08, 18.8)); g.save(); g.translate(W / 2, lerp(1100, 560, k)); g.rotate(-.04); rr(g, -260, -170, 520, 340, 8); fs(g, '#e9dfc4', 6); g.font = '46px BB'; g.fillStyle = '#1b1b1b'; g.textAlign = 'center'; g.fillText('EXPEDIENTE', 0, -60); g.fillText('ELENA FERRER', 0, 10); g.restore(); }
  if (t > 20.88) { const P = [['CALLE MOJADA', 20.88, 200, 420], ['PARAGUAS ROTO', 22.53, 860, 420]]; P.forEach(([n, t0, x, y]) => { if (t < t0) return; const k = eback(prog(t, t0, t0 + .25)); g.save(); g.translate(x, y + 360); g.rotate(x < 500 ? -.12 : .12); g.scale(k, k); rr(g, -150, -120, 300, 240, 4); fs(g, '#f4f1ea', 6); rr(g, -130, -100, 260, 160, 2); fs(g, '#20262e', 3); if (n === 'PARAGUAS ROTO') { g.save(); g.translate(0, -20); g.rotate(.5); g.beginPath(); g.arc(0, 0, 60, Math.PI, 0); fs(g, '#a8202a', 4); g.restore(); } else { g.fillStyle = '#e8e2d0'; for (let i = 0; i < 3; i++) g.fillRect(-110 + i * 90, 10, 50, 8); } g.font = '28px BB'; g.fillStyle = '#1b1b1b'; g.textAlign = 'center'; g.fillText(n, 0, 95); g.restore(); }); }
  if (t > 25.4) stamp(g, 'CONDUCTOR DESCONOCIDO', W / 2, 1580, prog(t, 25.4, 25.65), '#c4161c', -.06, 64);
  if (t > 27.13) stamp(g, 'CASO ARCHIVADO', W / 2, 1720, prog(t, 27.13, 27.4), '#c4161c', .05, 64);
}, 'push', .3);
// 3. Los nombres
scene(28.66, (g, t, lt) => {
  g.fillStyle = '#12161c'; g.fillRect(0, 0, W, H); const hl = []; if (t > 37.97) hl.push(1); if (t > 42.27) hl.push(3);
  g.save(); if (t > 34.73 && t < 37.97) { const z = lerp(1, 1.06, prog(t, 34.73, 37.9)); g.translate(W / 2, 800); g.scale(z, z); g.translate(-W / 2, -800); } caseFile(g, W / 2, 820, .95, t, hl); g.restore();
  if (t > 40.17 && t < 42.2) pill(g, W / 2, 1600, eback(prog(t, 40.17, 40.4)), '«NO VI NADA»', '#1b1b1b', '#ffd21f');
  if (t > 44.63 && t < 47.5) pill(g, W / 2, 1600, eback(prog(t, 44.63, 44.9)), 'PIDIÓ ARCHIVAR EL CASO', '#1b1b1b', '#ffd21f');
  if (t > 47.59) { g.fillStyle = 'rgba(0,0,0,.7)'; g.fillRect(0, 0, W, H); crane(g, 340, 680, .55 * eback(prog(t, 47.6, 47.9)), { num: '2' }); crane(g, 740, 680, .55 * eback(prog(t, 48.4, 48.7)), { num: '3' });
    pill(g, 340, 940, eback(prog(t, 47.8, 48.1)), 'CLARA', '#ece4cf', '#1b1b1b', 60); pill(g, 740, 940, eback(prog(t, 48.6, 48.9)), 'ANDRÉS', '#ece4cf', '#1b1b1b', 60);
    if (t > 50.04) pill(g, W / 2, 1140, eback(prog(t, 50.04, 50.3)), 'EN EL CASO DE ELENA', '#c4161c', '#fff', 64); }
}, 'push', .3);
// 4. Falta Ignacio / vuelve al taller
scene(54.37, (g, t, lt) => {
  if (t < 59.99) { g.fillStyle = '#12161c'; g.fillRect(0, 0, W, H); crane(g, W / 2, 620, .8, { num: '1' }); pill(g, W / 2, 900, 1, 'IGNACIO BRAVO', '#ece4cf', '#1b1b1b', 70); if (t > 57.13) stamp(g, 'NO APARECE', W / 2, 1150, prog(t, 57.13, 57.4), '#c4161c', -.08, 90); }
  else { workshop(g, t, .3); if (t < 63.35) figure(g, W / 2, 1330, 1.15, JULIAN, { ...walk(t, .6, .25), t, aL: -.4 });
    else { g.fillStyle = 'rgba(0,0,0,.55)'; g.fillRect(0, 0, W, H); ledger(g, W / 2, 820, 1.0, t, 1); if (t > 63.35) pill(g, W / 2, 1220, eback(prog(t, 63.6, 63.9)), 'EL DÍA DESPUÉS DE LA MUERTE DE ELENA', '#c4161c', '#fff', 40); if (t > 67.02) { g.save(); g.strokeStyle = '#47c6ff'; g.lineWidth = 9; g.beginPath(); g.ellipse(W / 2 + 230, 820, 210, 310, 0, 0, 7 * prog(t, 67.02, 67.6)); g.stroke(); g.restore(); } } }
}, 'push', .3);
// 5. El calco a lápiz
scene(71.08, (g, t, lt) => {
  g.fillStyle = '#12161c'; g.fillRect(0, 0, W, H); rubbing(g, W / 2, 760, 1.0, t, 71.3, 74.6);
  [['REPARACIÓN URGENTE', 75.45], ['SEDÁN GRIS', 77.12], ['GOLPE EN EL FRENTE', 78.37], ['PAGADO EN EFECTIVO', 79.86], ['SIN FACTURA', 81.22]].forEach(([n, t0], i) => { if (t < t0) return; g.save(); g.strokeStyle = '#ff2b2b'; g.lineWidth = 6; const y = 760 - 300 + i * 100 + 30; g.beginPath(); g.moveTo(W / 2 - 360, y); g.lineTo(W / 2 - 360 + 600 * prog(t, t0, t0 + .5), y); g.stroke(); g.restore(); });
  if (t > 82.53) { g.fillStyle = 'rgba(0,0,0,.6)'; g.fillRect(0, 0, W, H); plate(g, W / 2, 820, eback(prog(t, 83.37, 83.7))); }
}, 'push', .3);
// 6. El sistema
scene(84.74, (g, t, lt) => {
  office(g, t, .6); screen(g, t, 86.7);
  if (t > 88.84) { const k = eback(prog(t, 92.75, 93.05)); if (k > 0) { g.save(); g.translate(540, 860); g.scale(k, k); g.font = '84px BB'; g.fillStyle = '#ff4a3d'; g.textAlign = 'center'; g.textBaseline = 'middle'; g.fillText('RAFAEL RIVAS', 0, 0); g.font = '44px BB'; g.fillStyle = '#ffd21f'; g.fillText('COMISARIO', 0, 80); g.restore(); } }
}, 'push', .3);
// 7. Su compañero, su amigo
scene(95.12, (g, t, lt) => {
  if (t < 97.68) { office(g, t, .3); figure(g, 300, 1330, 1.15, JULIAN, { ...idle(t), t, aR: -.8, aL: .8 }); figure(g, 780, 1330, 1.15, RIVAS, { ...idle(t, 3), t, aL: .8, aR: -.8 });
    pill(g, W / 2, 520, eback(prog(t, 95.12, 95.4)), 'SU COMPAÑERO', '#ece4cf'); if (t > 96.24) pill(g, W / 2, 660, eback(prog(t, 96.24, 96.5)), 'SU MEJOR AMIGO', '#ece4cf'); }
  else { g.fillStyle = '#1a1d22'; g.fillRect(0, 0, W, H); rain(g, t, .35); g.fillStyle = '#2a2d30'; g.fillRect(0, 1300, W, H);
    rr(g, 700, 1000, 300, 300, 30); fs(g, '#3a3a3a', 6); g.font = '40px CZ'; g.fillStyle = '#ccc'; g.textAlign = 'center'; g.fillText('ELENA', 850, 1120);
    for (const [x, c] of [[430, '#111'], [560, '#111']]) { g.save(); g.translate(x, 860); g.beginPath(); g.arc(0, 0, 150, Math.PI, 0); fs(g, c, 6); g.lineWidth = 6; g.beginPath(); g.moveTo(0, 0); g.lineTo(0, 200); g.stroke(); g.restore(); }
    figure(g, 430, 1330, 1.0, JULIAN, { t, aL: 1.0, aR: -.3, blink: true, tilt: .15 }); figure(g, 560, 1330, 1.0, RIVAS, { t, aL: -1.0, aR: .3, tilt: -.15 });
    g.fillStyle = 'rgba(120,100,70,.18)'; g.fillRect(0, 0, W, H);
    if (t > 100.41) bubble(g, W / 2, 470, 760, 220, ['«DEJA DE BUSCAR, JULIÁN»'], { size: 56, tail: [60, 100] }); }
}, 'push', .3);
// 8. Pregunta 1
scene(104.82, (g, t, lt) => {
  g.fillStyle = '#0a0d12'; g.fillRect(0, 0, W, H); rain(g, t, .12);
  question(g, t, 104.9, '¿QUÉ HARÍAS TÚ?', [['A', 'LO DENUNCIO YA'], ['B', 'HABLO PRIMERO CON ÉL']], [111.6, 112.9]);
  commentIcon(g, W / 2, 1580, eback(prog(t, 114.98, 115.25)));
}, 'zoom', .3);
// 9. La oficina de Rivas
scene(116.97, (g, t, lt) => {
  office(g, t, .15); const door = eio(prog(t, 125.05, 125.8));
  figure(g, lerp(-100, 330, eout(prog(t, 117.0, 119.0))), 1330, 1.15, JULIAN, { ...(t < 119 ? walk(t, 1, .3) : idle(t)), t, aR: t > 119.15 && t < 121.9 ? -1.3 : -.12 });
  figure(g, 780, 1330, 1.15, { ...RIVAS, skin: t > 122.46 ? '#c9b4a4' : RIVAS.skin }, { ...idle(t, 3), t, aL: -.8, tilt: t > 122.46 ? .15 : 0 });
  if (t > 119.15) { g.save(); g.translate(560, 1060); g.rotate(-.05); rr(g, -90, -60, 180, 120, 4); fs(g, '#efe6cf', 4); g.fillStyle = '#7a7a80'; g.fillRect(-70, -40, 140, 80); g.restore(); }
  if (door > 0) { g.fillStyle = `rgba(0,0,0,${door * .5})`; g.fillRect(0, 0, W, H); g.save(); g.translate(W, 0); g.scale(-door, 1); rr(g, 0, 0, W, H, 0); fs(g, '#2a2420', 0); g.restore(); }
}, 'push', .3);
scene(127.26, (g, t, lt) => {
  office(g, t, .45); figure(g, 300, 1330, 1.15, JULIAN, { ...idle(t), t }); figure(g, 780, 1330, 1.15, { ...RIVAS, skin: '#c9b4a4' }, { ...idle(t, 3), t, aL: -.4 });
  if (t < 130.5) bubble(g, 700, 520, 680, 220, ['«¿QUIÉN MÁS SABE', 'ESTO, JULIÁN?»'], { size: 54, tail: [60, 140] });
  else if (t < 132.9) { bubble(g, 340, 520, 380, 180, ['«NADIE»'], { size: 64, tail: [-40, 140] }); }
  else if (t < 134.6) { pill(g, W / 2, 470, eback(prog(t, 131.0, 131.3)), 'NO LO NIEGA', '#ece4cf'); pill(g, W / 2, 610, eback(prog(t, 132.01, 132.3)), 'NO LO CONFIESA', '#ece4cf'); }
  else bubble(g, 700, 520, 720, 240, t < 135.89 ? ['«DAME DOS DÍAS»'] : ['«DAME DOS DÍAS.', 'TE LO VOY A EXPLICAR TODO»'], { size: 50, tail: [60, 140] });
}, 'cut');
// 10. Las dos teorías
scene(137.94, (g, t, lt) => {
  office(g, t, .65); theory(g, t, 141.28, 150.24);
  if (t > 146.64 && t < 150.2) pill(g, W / 2, 790, eback(prog(t, 146.64, 146.9)), 'EL ÚNICO QUE QUEDA: RIVAS', '#c4161c', '#fff', 50);
}, 'push', .3);
// 11. Mateo en la sala
scene(154.29, (g, t, lt) => {
  livingRoom(g, t, t > 161.17 ? .8 : .2);
  const up = t > 184.71; figure(g, up ? lerp(620, 1200, prog(t, 185.2, 186.9)) : 620, 1240, 1.05, MATEO, { ...(up ? walk(t, 1, .3) : idle(t, 2)), t, flip: up, mouth: t > 182.97 && t < 184.7 ? 'smile' : null, aL: up ? 0 : .5, aR: up ? 0 : -.5 });
  figure(g, lerp(-150, 320, eout(prog(t, 155.2, 157.0))), 1300, 1.1, JULIAN, { ...(t < 157 ? walk(t, .8, .3) : idle(t)), t, blink: t > 155 && t < 157, tilt: t > 180.43 && t < 182.3 ? -.12 : 0 });
  if (t > 165.03 && t < 169.3) { const items = [['EL CASO', 165.03], ['LAS GRULLAS', 165.92], ['LA MATRÍCULA', 166.95], ['RIVAS', 168.09]]; items.forEach(([n, t0], i) => { if (t < t0) return; pill(g, W / 2, 360 + i * 120, eback(prog(t, t0, t0 + .2)), n, i === 3 ? '#c4161c' : '#ece4cf', i === 3 ? '#fff' : '#1b1b1b', 52); }); }
  if (t > 174.21 && t < 180.3) { g.fillStyle = 'rgba(0,0,0,.35)'; g.fillRect(0, 0, W, H); bubble(g, W / 2, 520, 900, 300, t < 177.08 ? ['«¿Y SI EL ASESINO NO', 'ES UN MONSTRUO, PAPÁ?»'] : ['«¿Y SI SOLO ESTÁ TERMINANDO', 'LO QUE TÚ NO TERMINASTE?»'], { size: 54, tail: [100, 160] }); }
}, 'push', .3);
// 12. Rivas no aparece
scene(187.89, (g, t, lt) => {
  if (t < 195.85) { office(g, t); emptyChair(g, 780, 1300, 1.1); figure(g, 300, 1330, 1.15, JULIAN, { ...idle(t), t, aR: t > 191.43 ? -2.6 : -.12, holdR: t > 191.43 ? (gg, x, y) => { rr(gg, x - 24, y - 110, 48, 130, 18); fs(gg, '#2a2a2a', 5); } : null });
    if (t > 189.05) pill(g, 780, 520, eback(prog(t, 189.05, 189.3)), 'RIVAS: AUSENTE', '#c4161c', '#fff', 52);
    if (t > 191.43) pill(g, 780, 660, eback(prog(t, 191.43, 191.7)), 'SIN RESPUESTA', '#1b1b1b', '#ffd21f', 52);
    if (t > 193.2) bubble(g, 700, 860, 680, 200, ['«ÉL NUNCA FALTA»'], { size: 54, tail: [100, 100] }); }
  else { g.fillStyle = '#0c1018'; g.fillRect(0, 0, W, H); if (t < 197.27) digiClock(g, W / 2, 760, 1.5 * eback(prog(t, 195.85, 196.1)), '23:00');
    else phoneScreen(g, W / 2, 860, 1.0, t, 'RIVAS', t < 203.04 ? ['VEN A MI CASA.'] : ['VEN A MI CASA.', 'SOLO.'], eback(prog(t, 201.68, 201.95))); }
}, 'push', .3);
// 13. Bajo la lluvia
scene(204.20, (g, t, lt) => {
  windshield(g, t); if (t > 206.03) { g.save(); g.globalAlpha = .4 * prog(t, 206.03, 206.8); g.translate(W / 2, 600); g.rotate(.5); g.beginPath(); g.arc(0, 0, 120, Math.PI, 0); fs(g, '#a8202a', 0); g.restore(); }
}, 'push', .3);
scene(208.57, (g, t, lt) => {
  if (t < 213.55) { rivasHouse(g, t, 1); if (t > 211.36) pill(g, W / 2, 470, eback(prog(t, 211.36, 211.6)), 'LUCES APAGADAS', '#1b1b1b', '#ffd21f', 52); }
  else { livingRoom(g, t, 0); g.fillStyle = 'rgba(0,0,0,.35)'; g.fillRect(0, 0, W, H); const fl = g.createLinearGradient(0, 0, 0, 1300); fl.addColorStop(0, 'rgba(255,240,190,0)'); fl.addColorStop(1, 'rgba(255,240,190,.22)'); g.fillStyle = fl; g.beginPath(); g.moveTo(-100, 0); g.lineTo(300, 1300); g.lineTo(900, 1300); g.fill();
    seated(g, W / 2, 1190, 1.0, RIVAS, { t, blink: true, tilt: .3, holdR: t > 218.58 ? (gg, x, y) => crane(gg, x + 10, y - 10, .22, { num: t > 221.13 ? '4' : null }) : null }, '#4a2a2a');
    if (t > 217.23 && t < 219.4) pill(g, W / 2, 400, eback(prog(t, 217.23, 217.5)), 'NO RESPIRA', '#c4161c', '#fff', 64);
    if (t > 219.5 && t < 222.7) { g.save(); g.globalAlpha = prog(t, 219.5, 219.8); g.fillStyle = 'rgba(0,0,0,.75)'; g.fillRect(0, 0, W, H); g.restore(); crane(g, W / 2, 800, 1.7 * eback(prog(t, 219.5, 219.9)), { glow: 1, num: t > 221.13 ? '4' : null, rot: .05 }); }
    if (t > 222.77) { g.fillStyle = 'rgba(0,0,0,.7)'; g.fillRect(0, 0, W, H); recorder(g, W / 2, 820, 1.8 * eback(prog(t, 222.77, 223.1)), t); } }
}, 'push', .3);
// 14. Pregunta final
scene(227.36, (g, t, lt) => {
  g.fillStyle = '#0a0d12'; g.fillRect(0, 0, W, H); rain(g, t, .12); recorder(g, W / 2, 420, .8, t);
  const k = eback(prog(t, 227.4, 227.7)); g.save(); g.translate(W / 2, 860); g.scale(k, k); rr(g, -460, -170, 920, 340, 30); fs(g, '#12161c', 8); g.font = '78px LG'; g.textAlign = 'center'; g.textBaseline = 'middle'; g.fillStyle = '#ffd21f'; g.lineWidth = 12; g.strokeStyle = '#000';
  for (const [s, y] of [['¿TÚ ESCUCHARÍAS', -50], ['ESA GRABACIÓN?', 50]]) { g.strokeText(s, 0, y); g.fillText(s, 0, y); } g.restore();
  commentIcon(g, W / 2, 1580, eback(prog(t, 229.38, 229.65)));
}, 'zoom', .3);
// 15. Continuará
scene(231.15, (g, t, lt) => {
  g.fillStyle = '#07090c'; g.fillRect(0, 0, W, H); rain(g, t, .15); const k = prog(lt, 0, .8);
  g.save(); g.globalAlpha = k; g.font = '900 120px CZ'; g.textAlign = 'center'; g.textBaseline = 'middle'; g.shadowColor = '#ffcf6a'; g.shadowBlur = 40; g.fillStyle = '#f3dca2'; g.fillText('CONTINUARÁ', W / 2, 760); g.restore();
  g.save(); g.globalAlpha = prog(lt, .4, 1); bigText(g, 'CAPÍTULO 4 · EL FINAL', W / 2, 900, 86, '#ffffff', 1, 'BB'); g.restore();
  if (lt > 3.0) bigText(g, 'SÍGUEME PARA NO PERDÉRTELO', W / 2, 1010, 64, '#ff4a3d', eback(prog(lt, 3.0, 3.25)), 'BB');
}, 'fade', .5);
