// ---------- escenas Capítulo 2 ----------
const S = [];
const scene = (t0, draw, tr = 'cut', trd = 0) => S.push({ t0, draw, tr, trd });
const note = (g, x, y, k, lines, size = 60, rot = -.03) => { if (k <= 0) return; g.save(); g.translate(x, y); g.rotate(rot); g.scale(k, k); rr(g, -400, -60 - lines.length * 45, 800, 120 + lines.length * 90, 4); fs(g, '#f4f1ea', 6); g.font = `${size}px PM`; g.fillStyle = '#1d3fa8'; g.textAlign = 'center'; g.textBaseline = 'middle'; lines.forEach((l, i) => g.fillText(l, 0, (i - (lines.length - 1) / 2) * size * 1.4)); g.restore(); };
const typed = (s, t, a, b) => s.slice(0, Math.floor(prog(t, a, b) * s.length));

// 0. Gancho: el tablero del juego
scene(0, (g, t, lt) => {
  office(g, t, .5); g.save(); cam(g, lt, 10.4, .1, W / 2, 800);
  g.save(); g.translate(W / 2, 820); rr(g, -440, -380, 880, 760, 10); fs(g, '#2c4a3a', 8); g.strokeStyle = 'rgba(255,255,255,.15)'; g.lineWidth = 3; for (let i = 1; i < 8; i++) { g.beginPath(); g.moveTo(-440 + i * 110, -380); g.lineTo(-440 + i * 110, 380); g.stroke(); g.beginPath(); g.moveTo(-440, -380 + i * 95); g.lineTo(440, -380 + i * 95); g.stroke(); } g.restore();
  crane(g, 330, 700, .45, { num: '1' }); if (lt > 1.5) crane(g, 700, 900, .45 * eback(prog(lt, 1.5, 1.8)), { num: '2' });
  if (lt > 6.3) note(g, W / 2, 1180, eback(prog(lt, 6.3, 6.6)), ['¿Todavía no te acuerdas?'], 54);
  if (lt > 8.1) { const hx = lerp(1200, 820, eout(prog(lt, 8.1, 9.2))); g.save(); g.fillStyle = '#0a0a0a'; g.beginPath(); g.ellipse(hx, 600, 90, 60, -.3, 0, 7); g.fill(); for (let f = 0; f < 4; f++) { rr(g, hx - 150 - f * 10, 560 + f * 26, 90, 22, 11); g.fill(); } g.restore(); }
  g.restore();
});
// 1. Título
scene(10.41, (g, t, lt) => {
  g.fillStyle = '#0a0d12'; g.fillRect(0, 0, W, H); rain(g, t, .2);
  crane(g, W / 2, 600, 1.4 * eback(prog(lt, 0, .5)), { glow: 1, rot: -.08 });
  bigText(g, 'LA GRULLA', W / 2, 920, 130, '#f0e8d8', eback(prog(lt, .2, .5)), 'CZ'); bigText(g, 'DE PAPEL', W / 2, 1050, 110, '#f0e8d8', eback(prog(lt, .4, .7)), 'CZ');
  if (lt > 1.74) { const k = eback(prog(lt, 1.74, 1.95)); g.save(); g.translate(W / 2, 1210); g.rotate(-.04); g.scale(k, k); g.fillStyle = '#9d1418'; g.fillRect(-210, -56, 420, 112); g.lineWidth = 5; g.strokeStyle = '#ffd7c2'; g.strokeRect(-200, -46, 400, 92); g.font = '74px LG'; g.fillStyle = '#ffe9dc'; g.textAlign = 'center'; g.textBaseline = 'middle'; g.fillText('CAPÍTULO 2', 0, 8); g.restore(); }
}, 'glitch', .35);
// 2. La letra
scene(13.72, (g, t, lt) => {
  g.fillStyle = '#12161c'; g.fillRect(0, 0, W, H); g.save(); cam(g, lt, 10.7, .08, W / 2, 700);
  note(g, W / 2, 620, 1, ['Inspector Ferrer.', '¿Todavía no te acuerdas?'], 64); g.restore();
  if (t > 17.27) { const k = eback(prog(t, 17.27, 17.5)); g.save(); g.translate(330, 640); g.scale(k, k); g.lineWidth = 16; g.strokeStyle = '#2a2a2a'; g.beginPath(); g.arc(0, 0, 160, 0, 7); g.stroke(); g.beginPath(); g.moveTo(110, 120); g.lineTo(220, 250); g.lineWidth = 28; g.stroke(); g.restore(); }
  const R = [['LETRA', 'ORDENADA', 17.27, '#1f9e4a'], ['PRISA', 'NINGUNA', 20.25, '#1b1b1b'], ['MIEDO', 'NINGUNO', 22.6, '#c4161c']];
  R.forEach(([a, b, t0, c], i) => { if (t < t0) return; const k = eback(prog(t, t0, t0 + .25)); g.save(); g.translate(W / 2, 960 + i * 130); g.scale(k, k); rr(g, -330, -54, 660, 108, 16); fs(g, '#ece4cf', 5); g.font = '52px BB'; g.textAlign = 'left'; g.textBaseline = 'middle'; g.fillStyle = '#6a6a6a'; g.fillText(a + ':', -300, 4); g.fillStyle = c; g.fillText(b, -40, 4); g.restore(); });
}, 'glitch', .3);
// 3. Comisaría: Rivas pálido
scene(24.42, (g, t, lt) => {
  office(g, t); figure(g, 300, 1330, 1.15, JULIAN, { ...idle(t), t, aR: -.7 });
  const pale = prog(t, 26.5, 27.9); figure(g, 780, 1330, 1.15, { ...RIVAS, skin: pale > .5 ? '#c9b4a4' : RIVAS.skin }, { ...idle(t, 3), t, aL: -.9, holdL: (gg, x, y) => crane(gg, x, y - 20, .2, { num: '2' }) });
  if (t > 28.62) bubble(g, 680, 520, 720, 240, t < 30.38 ? ['«ESTO ES PERSONAL, JULIÁN»'] : ['«ESTO ES PERSONAL, JULIÁN.', 'ALGUIEN DE TU PASADO»'], { size: 50, tail: [60, 140] });
}, 'push', .3);
// 4. Archivo: Ernesto Salcedo
scene(32.12, (g, t, lt) => {
  office(g, t, .55);
  if (t < 35.08) { for (let i = 0; i < 6; i++) { const p = (t * 3 + i / 6) % 1; g.save(); g.translate(W / 2 + (i - 2.5) * 30, lerp(1300, 500, p)); g.rotate((srnd(i) - .5) * .4); rr(g, -260, -170, 520, 340, 6); fs(g, '#e9dfc4', 5); g.font = '40px BB'; g.fillStyle = '#5a4a3a'; g.textAlign = 'center'; g.fillText('CASO N° ' + (1000 + i * 137), 0, -100); g.restore(); } }
  else if (t < 43.5) mugshot(g, W / 2, 760, .95 * eback(prog(t, 35.08, 35.4)), SALCEDO.head, 'ERNESTO SALCEDO', [t > 38.49 ? ['PRESO: 12 AÑOS'] : [''], t > 40.0 ? ['ARRESTADO POR: J. FERRER'] : [''], t > 41.37 ? ['LIBRE HACE 2 MESES', '#c4161c'] : ['']]);
  else { g.fillStyle = 'rgba(70,50,30,.75)'; g.fillRect(0, 0, W, H); figure(g, 540, 1330, 1.2, SALCEDO, { t, mouth: t > 46.55 ? 'yell' : null, aL: -2.2, aR: .1, bob: Math.sin(t * 20) * 3 }); rr(g, 140, 1250, 800, 80, 6); fs(g, '#5a3a22', 7);
    if (t > 46.55) bubble(g, W / 2, 470, 900, 260, ['«TE VOY A QUITAR', 'LO QUE MÁS QUIERES»'], { size: 70, fill: '#1a0a0a', color: '#ff4a3d', shake: 6, tail: [0, 120] });
    g.fillStyle = 'rgba(120,90,50,.2)'; g.fillRect(0, 0, W, H); }
}, 'push', .3);
// 5. Interrogatorio
scene(49.22, (g, t, lt) => {
  interrogation(g, t);
  if (t < 52.65) figure(g, lerp(1250, 700, eout(prog(t, 50.95, 52.6))), 1340, 1.1, SALCEDO, { ...walk(t, .8, .3), t, flip: true });
  else { figure(g, 760, 1300, 1.05, SALCEDO, { t, aL: .6, aR: -.6, mouth: t > 53.43 ? 'smile' : null }); }
  figure(g, 300, 1330, 1.05, JULIAN, { ...idle(t), t, aL: .5 });
  if (t > 54.59 && t < 58.4) bubble(g, 700, 560, 700, 240, t < 55.93 ? ['«¿GRULLAS DE PAPEL?»'] : ['«INSPECTOR, YO APENAS', 'SÉ ESCRIBIR»'], { size: 52, tail: [60, 140] });
  if (t > 58.5) { g.fillStyle = 'rgba(0,0,0,.6)'; g.fillRect(0, 0, W, H); const k = eback(prog(t, 58.5, 58.8)); g.save(); g.translate(W / 2, 760); g.scale(k, k);
    for (const [sx, title, t0, ok, l1, l2] of [[-230, 'NOCHE DE CLARA', 58.5, true, 'EN UN BAR', '10 TESTIGOS'], [230, 'NOCHE DE IGNACIO', 64.22, false, 'SOLO EN CASA', 'NADIE LO VIO']]) { if (t < t0) continue; const kk = eback(prog(t, t0, t0 + .25)); g.save(); g.translate(sx, 0); g.scale(kk, kk);
      rr(g, -210, -300, 420, 600, 16); fs(g, '#ece4cf', 6); g.font = '46px BB'; g.fillStyle = '#1b1b1b'; g.textAlign = 'center'; g.textBaseline = 'middle'; g.fillText(title, 0, -230);
      ell(g, 0, -60, 90, 90, ok ? '#1f9e4a' : '#c4161c', 6); g.strokeStyle = '#fff'; g.lineWidth = 16; g.beginPath(); if (ok) { g.moveTo(-40, -60); g.lineTo(-10, -26); g.lineTo(44, -96); } else { g.moveTo(-36, -96); g.lineTo(36, -24); g.moveTo(36, -96); g.lineTo(-36, -24); } g.stroke();
      g.font = '50px BB'; g.fillStyle = '#3a3a3a'; g.fillText(l1, 0, 110); g.fillText(l2, 0, 180); g.restore(); }
    g.restore(); }
}, 'push', .3);
// 6. Pregunta 1
scene(70.29, (g, t, lt) => {
  g.fillStyle = '#0a0d12'; g.fillRect(0, 0, W, H); rain(g, t, .12);
  question(g, t, 70.4, '¿QUÉ HARÍAS TÚ?', [['A', 'LE CREO: QUE SE VAYA'], ['B', 'LO SIGO VIGILANDO']], [71.94, 73.53]);
  commentIcon(g, W / 2, 1580, eback(prog(t, 76.34, 76.6)));
}, 'zoom', .3);
// 7. Vigilancia
scene(78.24, (g, t, lt) => {
  nightSky(g); street(g, t, 400); g.fillStyle = 'rgba(10,20,40,.35)'; g.fillRect(0, 0, W, H);
  rr(g, 640, 700, 340, 460, 4); fs(g, '#2a2420', 7); rr(g, 700, 780, 110, 120, 4); fs(g, '#ffd98a', 5); poly(g, [[620, 700], [810, 560], [1000, 700]], '#3a2a22', 6);
  car(g, 360, 1380, 1.0, 0, '#2a3a4a'); g.save(); g.translate(360, 1250); ell(g, -40, 0, 26, 30, '#000', 0); g.restore();
  if (t > 80.02) { g.save(); g.translate(260, 520); rr(g, -180, -70, 360, 140, 16); fs(g, 'rgba(10,12,16,.9)', 5); g.font = '44px BB'; g.fillStyle = '#ff3030'; g.textAlign = 'center'; g.textBaseline = 'middle'; g.fillText((Math.floor(t * 2) % 2 ? '● ' : '  ') + 'VIGILANCIA 24 H', 0, 4); g.restore(); }
}, 'push', .3);
// 8. Hospital: faltan seis frascos
scene(83.19, (g, t, lt) => {
  if (t < 86.2) { g.fillStyle = '#d8dde0'; g.fillRect(0, 0, W, H); figure(g, 540, 1330, 1.15, { ...BOSS, armC: '#f2f2f2', torso: '#f2f2f2' }, { ...idle(t), t, aR: -1.0 }); bubble(g, 700, 560, 600, 200, ['«OTRO DATO, INSPECTOR»'], { size: 50, tail: [-60, 120] }); }
  else { pharmacy(g, t, Math.floor(prog(t, 90.96, 92.2) * 6.99)); g.save(); g.translate(W / 2, 1640); rr(g, -380, -90, 760, 180, 20); fs(g, '#1b1b1b', 6); g.font = '76px BB'; g.fillStyle = '#e8f0e8'; g.textAlign = 'center'; g.textBaseline = 'middle'; g.fillText('HOSPITAL SAN RAFAEL', 0, 6); g.restore();
    if (t > 90.96) { const n = Math.min(6, Math.floor(prog(t, 90.96, 92.2) * 6.99)); const k = eback(prog(t, 90.96, 91.2)); g.save(); g.translate(W / 2, 260); g.scale(k, k); rr(g, -260, -80, 520, 160, 20); fs(g, '#c4161c', 6); g.font = '96px LG'; g.fillStyle = '#fff'; g.textAlign = 'center'; g.textBaseline = 'middle'; g.fillText(`FALTAN ${n}`, 0, 8); g.restore(); }
    if (t > 92.88) { const k = eback(prog(t, 92.88, 93.2)); g.save(); g.translate(W / 2, 1180); g.rotate(-.05); g.scale(k, k); rr(g, -260, -90, 520, 180, 16); fs(g, '#f2f2f2', 6); rr(g, -230, -60, 120, 120, 8); fs(g, '#9fb4c8', 4); g.font = '44px BB'; g.fillStyle = '#1b1b1b'; g.textAlign = 'left'; g.textBaseline = 'middle'; g.fillText('ACCESO: FARMACIA', -90, -24); g.fillStyle = '#c4161c'; g.fillText('¿QUIÉN?', -90, 34); g.restore(); } }
}, 'push', .3);
// 9. La cena
scene(96.27, (g, t, lt) => {
  nightKitchen(g, t); table(g); emptyChair(g, 540, 1180, .9); photoFrame(g, 540, 1080, .55, ELENA_HEAD);
  const up = t > 118.84; const mx = up ? lerp(830, 420, eio(prog(t, 119.2, 120.6))) : 830;
  figure(g, 250, 1280, 1.0, JULIAN, { ...idle(t), t, aL: -.4, aR: .4, tilt: t > 116.4 && t < 117.6 ? .12 : 0 });
  figure(g, mx, 1280, .95, MATEO, { ...(up && t < 120.6 ? walk(t, 1, .3) : idle(t, 2)), t, flip: up && t < 120.6, aL: t > 120.53 ? -1.3 : -.4, aR: .4, tilt: t > 107.81 && t < 110.4 ? -.1 : 0 });
  if (t > 103.52 && t < 110.9) dossier(g, W / 2, 470, .72 * eback(prog(t, 103.52, 103.8)), MATEO.head, [['MATEO FERRER', '#1b1b1b', 60], ['PRÁCTICAS EN EL', '#1b1b1b'], ['HOSPITAL SAN RAFAEL', '#c4161c'], ['3 VECES POR SEMANA']], { tag: 'HIJO', rot: .03 });
  if (t > 100.51 && t < 103.4) bubble(g, 420, 560, 700, 240, ['«EN TU HOSPITAL FALTAN', 'SEIS FRASCOS DE SEDANTE»'], { size: 48, tail: [-120, 140] });
  if (t > 110.99 && t < 116.3) bubble(g, 640, 560, 760, 240, t < 112.97 ? ['«ESO PASA TODO', 'EL TIEMPO, PAPÁ»'] : ['«SE PIERDEN COSAS. NADIE', 'LLEVA BIEN EL INVENTARIO»'], { size: 48, tail: [140, 140] });
  if (t > 123.08) bubble(g, 540, 560, 640, 220, t < 124.43 ? ['«DEBERÍAS DESCANSAR»'] : ['«DEBERÍAS DESCANSAR.', 'TE VES CANSADO»'], { size: 50, tail: [-80, 140] });
}, 'push', .3);
// 10. Casa de Clara
scene(125.74, (g, t, lt) => {
  if (t < 136.21) { claraRoom(g, t); g.save(); g.translate(330, 800); g.scale(.4, .4); courthousePhoto(g, 0, 0, 1); g.restore(); figure(g, 760, 1330, 1.1, JULIAN, { ...idle(t), t, aL: -.4, holdL: flashlight(.5) });
    if (t > 129.69 && t < 132.2) dossier(g, W / 2, 470, .62 * eback(prog(t, 129.69, 129.95)), CLARA.head, [['CLARA MONTES', '#1b1b1b', 60], ['ENFERMERA JUBILADA'], t > 131.09 ? ['VIVÍA SOLA'] : ['']], { tag: 'VÍCTIMA 2' }); }
  else { g.fillStyle = '#12161c'; g.fillRect(0, 0, W, H); const flip = prog(t, 137.95, 138.6); g.save(); g.translate(W / 2, 760); g.scale(Math.max(.04, Math.abs(Math.cos(flip * Math.PI))), 1); courthousePhoto(g, 0, 0, 1.4, flip > .5, t); g.restore();
    if (t > 140.99) { g.save(); g.globalAlpha = prog(t, 140.99, 141.4); g.strokeStyle = '#ff2b2b'; g.lineWidth = 8; g.beginPath(); g.ellipse(W / 2, 760, 420, 120, -.05, 0, 7); g.stroke(); g.restore(); } }
}, 'push', .3);
// 11. El juicio archivado
scene(142.71, (g, t, lt) => {
  office(g, t, .55); g.save(); g.translate(W / 2, 760); g.rotate(-.03); rr(g, -380, -420, 760, 840, 6); fs(g, '#e9dfc4', 8);
  g.font = '56px BB'; g.fillStyle = '#1b1b1b'; g.textAlign = 'center'; g.fillText('JUICIO N° 2290', 0, -320); g.font = '44px BB'; g.fillStyle = '#5a4a3a'; g.fillText('FECHA: HACE 6 AÑOS', 0, -240);
  g.fillStyle = '#1b1b1b'; for (let i = 0; i < 8; i++) g.fillRect(-300, -150 + i * 60, 600 - (i % 3) * 80, 30); g.restore();
  if (t > 146.45) stamp(g, 'ARCHIVADO', W / 2, 820, prog(t, 146.45, 146.7), '#c4161c', -.12, 130);
  if (t > 150.62) { g.fillStyle = 'rgba(0,0,0,.7)'; g.fillRect(0, 0, W, H); for (let i = 0; i < 3; i++) { const t0 = 150.62 + i * .5; if (t > t0) bigText(g, '6 AÑOS', W / 2 + (i - 1) * 40, 520 + i * 260, 150 - i * 10, i === 2 ? '#ff4a3d' : '#f0e8d8', eback(prog(t, t0, t0 + .2)), 'BB'); } }
}, 'push', .3);
// 12. No fue Salcedo
scene(154.18, (g, t, lt) => {
  office(g, t, .3); figure(g, 300, 1330, 1.15, JULIAN, { ...idle(t), t, aR: -2.6, holdR: (gg, x, y) => { rr(gg, x - 24, y - 110, 48, 130, 18); fs(gg, '#2a2a2a', 5); } });
  if (t > 156.27) { const k = eback(prog(t, 156.27, 156.55)); g.save(); g.translate(720, 640); g.rotate(.03); g.scale(k, k); rr(g, -300, -260, 600, 520, 8); fs(g, '#ece4cf', 7); g.font = '48px BB'; g.fillStyle = '#1b1b1b'; g.textAlign = 'center'; g.fillText('REPORTE DE VIGILANCIA', 0, -190); g.font = '40px BB'; g.textAlign = 'left';
    [['22:00', 'EN CASA'], ['01:00', 'EN CASA'], ['04:00', 'EN CASA']].forEach(([h, s], i) => { g.fillStyle = '#6a6a6a'; g.fillText(h, -240, -90 + i * 80); g.fillStyle = '#1f9e4a'; g.fillText(s + ' ✓', -60, -90 + i * 80); });
    g.restore(); }
  if (t > 161.01) stamp(g, 'NO FUE ÉL', 720, 1000, prog(t, 161.01, 161.3), '#1f9e4a', -.1, 100);
}, 'push', .3);
// 13. Andrés Lagos
scene(163.46, (g, t, lt) => {
  if (t < 167.09) { g.fillStyle = '#0c1018'; g.fillRect(0, 0, W, H); digiClock(g, W / 2, 760, 1.5 * eback(prog(t, 163.5, 163.8)), '5:30'); if (t > 165.51) stamp(g, 'NUEVO CRIMEN', W / 2, 1050, prog(t, 165.51, 165.8), '#c4161c', -.08, 100); }
  else { lawOffice(g, t); seated(g, W / 2, 1150, 1.0, LAGOS, { t, tilt: -.25, holdR: t > 175.26 ? (gg, x, y) => crane(gg, x + 10, y - 10, .22, { num: t > 177.61 ? '3' : null }) : null }, '#3a1a1a');
    rr(g, 120, 1140, 840, 60, 6); fs(g, '#5a3a22', 7);
    if (t > 168.18 && t < 173.9) dossier(g, W / 2, 470, .62 * eback(prog(t, 168.18, 168.45)), LAGOS.head, [['ANDRÉS LAGOS', '#1b1b1b', 60], ['ABOGADO']], { tag: 'VÍCTIMA 3' });
    if (t > 173.96 && t < 175.2) { const k = eback(prog(t, 173.96, 174.2)); g.save(); g.translate(W / 2, 420); g.scale(k, k); rr(g, -260, -56, 520, 112, 16); fs(g, '#ece4cf', 5); g.font = '56px BB'; g.fillStyle = '#c4161c'; g.textAlign = 'center'; g.textBaseline = 'middle'; g.fillText('SIN HERIDAS', 0, 4); g.restore(); }
    if (t > 176.2) { g.save(); g.globalAlpha = prog(t, 176.2, 176.5); g.fillStyle = 'rgba(0,0,0,.75)'; g.fillRect(0, 0, W, H); g.restore(); crane(g, W / 2, 800, 1.7 * eback(prog(t, 176.2, 176.6)), { glow: 1, num: t > 177.61 ? '3' : null, rot: -.04 }); } }
}, 'push', .3);
// 14. El mensaje largo
scene(178.92, (g, t, lt) => {
  g.fillStyle = '#0a0d12'; g.fillRect(0, 0, W, H);
  const u = eio(prog(t, 179.0, 181.0)); if (u < 1) { g.save(); g.globalAlpha = 1 - u; crane(g, W / 2, 800, 1.7 * (1 - u * .4), { num: '3', rot: u * 1.5 }); g.restore(); }
  if (u > .2) { const k = eout(prog(t, 179.6, 181.4)); g.save(); g.translate(W / 2, 820); g.rotate(-.03); g.scale(k, k); rr(g, -440, -320, 880, 640, 4); fs(g, '#f4f1ea', 6);
    g.font = '64px PM'; g.fillStyle = '#1d3fa8'; g.textAlign = 'center'; g.textBaseline = 'middle';
    g.fillText(typed('Seis años, inspector.', t, 183.92, 185.2), 0, -170); g.fillText(typed('Ella sigue esperando.', t, 185.87, 187.1), 0, -30);
    g.fillText(typed('Y tú dejaste', t, 187.7, 188.5), 0, 110); g.fillText(typed('de buscar.', t, 188.5, 189.3), 0, 210); g.restore(); }
}, 'push', .3);
// 15. Elena / la lista
scene(190.13, (g, t, lt) => {
  if (t < 197.07) { nightKitchen(g, t, .6); g.save(); g.translate(W / 2, 1700); figure(g, 0, 0, 2.2, JULIAN, { t, blink: t > 194.49, mouth: 'o' }); g.restore(); if (t > 192.21) { g.save(); g.globalAlpha = prog(t, 192.21, 192.8); photoFrame(g, W / 2, 470, 1.6, ELENA_HEAD); g.restore(); bigText(g, 'ELENA', W / 2, 700, 60, '#f0e8d8', prog(t, 192.21, 192.8), 'BB'); } }
  else { office(g, t, .6); listCard(g, t, eback(prog(t, 197.07, 197.4)), [['IGNACIO BRAVO', 199.61, true], ['CLARA MONTES', 199.9, true], ['ANDRÉS LAGOS', 200.2, true], ['. . . ?', 201.47, false]]);
    if (t > 201.47) { const k = eback(prog(t, 201.47, 201.75)); g.save(); g.translate(W / 2, 1220); g.rotate(-.04); g.scale(k, k); rr(g, -380, -60, 760, 120, 12); fs(g, '#1b1b1b', 5); g.font = '50px BB'; g.fillStyle = '#ffd21f'; g.textAlign = 'center'; g.textBaseline = 'middle'; g.fillText('EMPIEZA LA NOCHE QUE MURIÓ ELENA', 0, 4); g.restore(); } }
}, 'push', .3);
// 16. Pregunta 2
scene(204.98, (g, t, lt) => {
  g.fillStyle = '#0a0d12'; g.fillRect(0, 0, W, H); rain(g, t, .12);
  question(g, t, 205.0, '¿QUIÉN ES?', [['A', 'ERNESTO SALCEDO'], ['B', 'ALGUIEN DE LA POLICÍA'], ['C', 'ALGUIEN NUEVO']], [207.18, 208.11, 209.66]);
  commentIcon(g, W / 2, 1580, eback(prog(t, 212.21, 212.5)));
}, 'zoom', .3);
// 17. Continuará
scene(213.77, (g, t, lt) => {
  g.fillStyle = '#07090c'; g.fillRect(0, 0, W, H); rain(g, t, .15); const k = prog(lt, 0, .8);
  g.save(); g.globalAlpha = k; g.font = '900 120px CZ'; g.textAlign = 'center'; g.textBaseline = 'middle'; g.shadowColor = '#ffcf6a'; g.shadowBlur = 40; g.fillStyle = '#f3dca2'; g.fillText('CONTINUARÁ', W / 2, 760); g.restore();
  g.save(); g.globalAlpha = prog(lt, .4, 1); bigText(g, 'CAPÍTULO 3', W / 2, 900, 96, '#ffffff', 1, 'BB'); g.restore();
  if (lt > 1.8) bigText(g, 'SÍGUEME PARA VERLO', W / 2, 1010, 64, '#ff4a3d', eback(prog(lt, 1.8, 2.05)), 'BB');
}, 'fade', .5);
