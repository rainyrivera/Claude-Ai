// ---------- escenas Capítulo 4 ----------
const S = [];
const scene = (t0, draw, tr = 'cut', trd = 0) => S.push({ t0, draw, tr, trd });
const pill = (g, x, y, k, txt, bg = '#ece4cf', col = '#1b1b1b', size = 54) => { if (k <= 0) return; g.save(); g.translate(x, y); g.scale(k, k); g.font = `${size}px BB`; const w = g.measureText(txt).width; rr(g, -w / 2 - 34, -size * .9, w + 68, size * 1.8, 18); fs(g, bg, 5); g.fillStyle = col; g.textAlign = 'center'; g.textBaseline = 'middle'; g.fillText(txt, 0, 4); g.restore(); };

// 0. Gancho
scene(0, (g, t, lt) => {
  livingRoom(g, t, 0); g.fillStyle = 'rgba(0,0,0,.45)'; g.fillRect(0, 0, W, H);
  [[220, 620, '1'], [430, 560, '2'], [650, 560, '3'], [860, 620, '4']].forEach(([x, y, n], i) => { if (lt > i * .4) crane(g, x, y, .32 * eback(prog(lt, i * .4, i * .4 + .3)), { num: n }); });
  if (lt > 1.58) recorder(g, W / 2, 960, 1.2 * eback(prog(lt, 1.58, 1.9)), t);
  if (lt > 3.1) { g.save(); g.globalAlpha = .9 * prog(lt, 3.1, 5); g.fillStyle = '#000'; g.beginPath(); g.ellipse(540, 1130, 50, 60, 0, 0, 7); g.fill(); g.fillRect(470, 1190, 140, 300); g.restore(); }
});
// 1. Título
scene(8.13, (g, t, lt) => {
  g.fillStyle = '#0a0d12'; g.fillRect(0, 0, W, H); rain(g, t, .2);
  crane(g, W / 2, 600, 1.4 * eback(prog(lt, 0, .5)), { glow: 1, rot: -.08 });
  bigText(g, 'LA GRULLA', W / 2, 920, 130, '#f0e8d8', eback(prog(lt, .2, .5)), 'CZ'); bigText(g, 'DE PAPEL', W / 2, 1050, 110, '#f0e8d8', eback(prog(lt, .4, .7)), 'CZ');
  if (lt > 1.69) { const k = eback(prog(lt, 1.69, 1.9)); g.save(); g.translate(W / 2, 1210); g.rotate(-.04); g.scale(k, k); g.fillStyle = '#9d1418'; g.fillRect(-210, -56, 420, 112); g.lineWidth = 5; g.strokeStyle = '#ffd7c2'; g.strokeRect(-200, -46, 400, 92); g.font = '74px LG'; g.fillStyle = '#ffe9dc'; g.textAlign = 'center'; g.textBaseline = 'middle'; g.fillText('CAPÍTULO 4', 0, 8); g.restore(); }
  if (lt > 3.12) bigText(g, 'EL FINAL', W / 2, 1600, 90, '#ff4a3d', eback(prog(lt, 3.12, 3.35)), 'BB');
}, 'glitch', .35);
// 2. La confesión
const MEMS = [[17.95, 'HABÍA BEBIDO', 'bottle'], [19.86, 'LLOVÍA', 'rain'], [21.0, 'NO LA VI', 'lights'], [22.31, 'BAJÉ DEL AUTO', 'car'], [23.68, 'YA NO RESPIRABA', 'umbrella'], [27.3, 'LE PAGUÉ AL MECÁNICO', 'money'], [30.18, 'LA ENFERMERA VIO TODO', 'nurse'], [33.39, 'EL ABOGADO SE ENCARGÓ', 'stamp'], [35.65, 'SEIS AÑOS MIRÁNDOTE', 'eyes']];
scene(12.61, (g, t, lt) => {
  livingRoom(g, t, 0); g.fillStyle = 'rgba(0,0,0,.55)'; g.fillRect(0, 0, W, H);
  if (t < 17.95) { recorder(g, W / 2, 760, 1.8, t); if (t > 13.5) { g.save(); g.translate(W / 2 + 140 * 1.8, 760 - 80 * 1.8); g.restore(); } if (t > 15.16) waveform(g, 1150, t, 60); if (t > 16.81) pill(g, W / 2, 470, eback(prog(t, 16.81, 17.0)), 'VOZ DE RIVAS · TEMBLANDO', '#1b1b1b', '#ffd21f', 50); }
  else if (t < 40.11) { let cur = 0; MEMS.forEach((m, i) => { if (t >= m[0]) cur = i; }); const [t0, title, key] = MEMS[cur]; memoryCard(g, eback(prog(t, t0, t0 + .25)), title, MEM[key], t); recorder(g, 900, 300, .5, t); waveform(g, 1620, t, 22, 700); }
  else { recorder(g, W / 2, 760, 1.8, t); bigText(g, '«PERDÓNAME»', W / 2, 1120, 110, '#f0e8d8', eback(prog(t, 40.11, 40.4)), 'PM'); }
}, 'push', .3);
// 3. Silencio y el susurro
scene(41.37, (g, t, lt) => {
  g.fillStyle = '#05070a'; g.fillRect(0, 0, W, H); recorder(g, W / 2, 520, 1.2, t);
  const amp = t < 50.84 ? 3 : 70 * Math.max(0, 1 - prog(t, 51.6, 52.2)); waveform(g, 960, t, amp);
  if (t > 45.77 && t < 50.8) pill(g, W / 2, 760, eback(prog(t, 45.77, 46.0)), 'MUY BAJO…', '#12161c', '#9ab', 50);
  if (t > 48.49 && t < 50.8) pill(g, W / 2, 1180, eback(prog(t, 48.49, 48.7)), 'UNA VOZ JOVEN', '#12161c', '#47c6ff', 56);
  if (t > 50.84) { g.save(); g.globalAlpha = prog(t, 50.84, 51.3) * (.75 + .25 * Math.sin(t * 9)); g.font = '130px PM'; g.fillStyle = '#ff2b2b'; g.textAlign = 'center'; g.textBaseline = 'middle'; g.shadowColor = '#ff2020'; g.shadowBlur = 30; g.fillText('«Falta uno»', W / 2 + Math.sin(t * 13) * 4, 1180); g.restore(); }
}, 'push', .3);
// 4. Diez veces
scene(52.29, (g, t, lt) => {
  g.fillStyle = '#05070a'; g.fillRect(0, 0, W, H);
  if (t < 59.48) { recorder(g, W / 2, 560, 1.2, t); const n = Math.min(10, 1 + Math.floor(prog(t, 54.3, 56.2) * 10)); for (const dx of [0, 70]) poly(g, [[330 - dx, 840], [330 - dx, 960], [250 - dx, 900]], '#47c6ff', 5); if (t > 54.3) bigText(g, `× ${n}`, 680, 900, 140, '#f0e8d8', 1, 'LG');
    if (t > 56.37) { waveform(g, 1180, t, 30); pill(g, W / 2, 1060, eback(prog(t, 56.6, 56.9)), 'VOZ: ¿?', '#c4161c', '#fff', 60); } }
  else { [['1', 180], ['2', 360], ['3', 540], ['4', 720]].forEach(([n, x], i) => { const k = eback(prog(t, 59.48 + i * .15, 59.78 + i * .15)); crane(g, x, 620, .3 * k, { num: n }); });
    g.save(); g.setLineDash([16, 12]); g.strokeStyle = '#ff2b2b'; g.lineWidth = 6; g.strokeRect(830, 520, 160, 200); g.setLineDash([]); g.restore(); if (t > 62.62) bigText(g, '?', 910, 620, 140, '#ff2b2b', eback(prog(t, 62.62, 62.9)), 'LG');
    if (t > 60.97) pill(g, W / 2, 900, eback(prog(t, 60.97, 61.2)), '4 CULPABLES', '#ece4cf', '#1b1b1b', 64); if (t > 63.79) pill(g, W / 2, 1100, eback(prog(t, 63.79, 64.0)), 'FALTA UNO', '#c4161c', '#fff', 70); }
}, 'push', .3);
// 5. El laboratorio
scene(65.27, (g, t, lt) => {
  g.fillStyle = '#d8dde0'; g.fillRect(0, 0, W, H); g.fillStyle = 'rgba(0,0,0,.05)'; for (let x = 0; x < W; x += 60) g.fillRect(x, 0, 3, H);
  if (t < 81.41) { g.save(); g.translate(W / 2, 780); g.rotate(-.02); rr(g, -420, -520, 840, 1040, 6); fs(g, '#fbfaf4', 8); g.font = '60px BB'; g.fillStyle = '#1b1b1b'; g.textAlign = 'center'; g.fillText('ANÁLISIS DE LAS 4 GRULLAS', 0, -430); g.fillRect(-360, -400, 720, 5);
    g.font = '50px BB'; g.textAlign = 'left'; const L = [['PAPEL:', t > 71.73 ? 'CUADRICULADO' : '…', 71.73], ['ORIGEN:', t > 74.6 ? 'CUADERNO UNIVERSITARIO' : '…', 74.6], ['DETALLE:', t > 76.71 ? 'EL MISMO EN LAS 4' : '…', 76.71]];
    L.forEach(([a, b], i) => { g.fillStyle = '#6a6a6a'; g.fillText(a, -370, -300 + i * 110); g.fillStyle = b === '…' ? '#999' : '#c4161c'; g.fillText(b, -150, -300 + i * 110); });
    rr(g, -330, 30, 660, 400, 6); fs(g, '#f4f1ea', 4); g.strokeStyle = 'rgba(80,110,160,.35)'; g.lineWidth = 3; for (let x = -320; x < 330; x += 40) { g.beginPath(); g.moveTo(x, 30); g.lineTo(x, 430); g.stroke(); } for (let y = 30; y < 430; y += 40) { g.beginPath(); g.moveTo(-330, y); g.lineTo(330, y); g.stroke(); } g.restore(); }
  else { g.fillStyle = '#12161c'; g.fillRect(0, 0, W, H); crane(g, W / 2 + 80, 820, 1.8, { num: '4', tailHi: prog(t, 81.6, 82.2), rot: -.05 }); const k = eback(prog(t, 81.6, 81.9)); g.save(); g.translate(260, 860); g.scale(k, k); g.lineWidth = 16; g.strokeStyle = '#2a2a2a'; g.beginPath(); g.arc(0, 0, 150, 0, 7); g.stroke(); g.beginPath(); g.moveTo(100, 110); g.lineTo(200, 230); g.lineWidth = 28; g.stroke(); g.restore(); pill(g, W / 2, 1180, eback(prog(t, 82.2, 82.5)), 'DOBLADA DOS VECES', '#c4161c', '#fff', 60); }
}, 'push', .3);
// 6. El recuerdo
scene(84.53, (g, t, lt) => {
  if (t < 88.68) { g.fillStyle = '#12161c'; g.fillRect(0, 0, W, H); g.save(); cam(g, lt, 4, .3, 300, 900); crane(g, W / 2 + 80, 820, 1.8, { num: '4', tailHi: 1, rot: -.05 }); g.restore(); if (t > 86.95) { g.fillStyle = `rgba(255,230,180,${prog(t, 86.95, 88.6) * .9})`; g.fillRect(0, 0, W, H); } }
  else if (t < 104.02) { kitchen(g, t, .85); g.fillStyle = 'rgba(160,120,60,.25)'; g.fillRect(0, 0, W, H); rain(g, t, .1, 20); table(g);
    figure(g, 330, 1280, 1.05, ELENA, { ...idle(t, 1), t, aL: -.5, aR: .5, mouth: 'smile' }); figure(g, 720, 1290, .95, KID, { ...idle(t, 2), t, aL: -.5, aR: .5 });
    g.save(); g.translate(540, 1150); crane(g, -80, 0, .22, {}); if (t > 94.56) crane(g, 90, 0, .22 * eback(prog(t, 94.56, 94.9)), { tailHi: t > 99.1 ? 1 : 0 }); g.restore();
    if (t > 91.41 && t < 94.5) pill(g, W / 2, 470, eback(prog(t, 91.41, 91.7)), 'UN NIÑO DE 7 AÑOS', '#ece4cf', '#1b1b1b', 56);
    if (t > 97.03) bubble(g, 430, 520, 760, 260, t < 101.24 ? ['«Y AL FINAL, LA COLA', 'SE DOBLA DOS VECES…»'] : ['«…PARA QUE LA GRULLA', 'NUNCA SE VAYA VOLANDO»'], { size: 52, tail: [-80, 160] });
    g.fillStyle = 'rgba(255,240,210,.12)'; g.fillRect(0, 0, W, H); }
  else { g.fillStyle = '#0a0d12'; g.fillRect(0, 0, W, H); g.save(); g.globalAlpha = .9; figure(g, W / 2, 1300, 1.3, KID, { t, blink: false }); g.restore();
    g.save(); g.globalAlpha = prog(t, 105.0, 106.8); g.fillStyle = '#0a0d12'; g.fillRect(0, 0, W, H); figure(g, W / 2, 1300, 1.25, MATEO, { t }); g.restore();
    pill(g, W / 2, 460, eback(prog(t, 104.02, 104.3)), 'SOLO UNA PERSONA', '#c4161c', '#fff', 70); }
}, 'push', .3);
// 7. Vuelve a casa
scene(107.76, (g, t, lt) => {
  if (t < 112.24) { windshield(g, t * .5); if (t > 110.7) { g.save(); g.translate(760, 1500); g.rotate(.2); rr(g, -70, -130, 140, 260, 22); fs(g, '#111', 6); g.restore(); pill(g, 760, 1280, eback(prog(t, 110.7, 110.95)), 'NO LLAMA A NADIE', '#1b1b1b', '#ffd21f', 44); } }
  else { homeStairs(g, t, 0, .55); const op = prog(t, 114.0, 115.3); g.save(); g.fillStyle = `rgba(255,233,176,${op * .4})`; g.fillRect(380, 140, 320, 400); g.restore(); figure(g, 540, lerp(1500, 1100, prog(t, 112.3, 114.5)), lerp(1.0, .7, prog(t, 112.3, 114.5)), JULIAN, { ...walk(t, .5, .25), t }); }
}, 'push', .3);
// 8. El escritorio de Mateo
scene(115.96, (g, t, lt) => {
  mateoDesk(g, t, t < 120.94 ? 1 : t < 124.36 ? 2 : 3);
  if (t > 116.2 && t < 120.9) pill(g, 260, 820, eback(prog(t, 116.2, 116.5)), 'HOJAS ARRANCADAS', '#c4161c', '#fff', 44);
  if (t > 120.94 && t < 124.3) pill(g, 560, 820, eback(prog(t, 120.94, 121.2)), 'HOSPITAL SAN RAFAEL', '#c4161c', '#fff', 44);
  if (t > 126.64) pill(g, 850, 820, eback(prog(t, 126.64, 126.9)), '5 NOMBRES', '#c4161c', '#fff', 44);
}, 'push', .3);
// 9. La lista
scene(129.18, (g, t, lt) => { g.fillStyle = '#12161c'; g.fillRect(0, 0, W, H); finalList(g, t, eback(prog(t, 129.2, 129.45))); }, 'zoom', .3);
// 10. Detrás de él
scene(144.19, (g, t, lt) => {
  g.fillStyle = '#1c222c'; g.fillRect(0, 0, W, H); rr(g, 640, 300, 320, 1000, 6); fs(g, '#2a2420', 7); g.fillStyle = 'rgba(255,233,176,.3)'; g.fillRect(660, 320, 280, 960); g.fillStyle = '#2a2018'; g.fillRect(0, 1300, W, H);
  figure(g, 300, 1330, 1.15, JULIAN, { t, wide: true, tilt: t > 144.5 ? -.15 : 0 });
  g.save(); g.globalAlpha = prog(t, 144.4, 145.5); figure(g, 800, 1300, 1.1, MATEO, { ...idle(t, 2), t, aL: -.9, holdL: (gg, x, y) => mug(gg, x + 6, y - 10, .9, 0) }); g.restore();
  const B = [[147.01, ['«ENCONTRÉ TU CAJA', 'HACE UN AÑO, PAPÁ»']], [149.53, ['«LEÍ EL EXPEDIENTE', 'DE MAMÁ»']], [151.5, ['«SEGUÍ CADA NOMBRE,', 'HASTA LLEGAR AL TALLER»']], [155.5, ['«LA HOJA DEL MECÁNICO', 'LA ARRANQUÉ YO»']], [157.67, ['«PARA QUE TÚ TAMBIÉN', 'TUVIERAS QUE BUSCARLA»']], [160.26, ['«TÚ TUVISTE TODO', 'EN TUS MANOS…»']], [162.63, ['«…Y NUNCA', 'LO LEÍSTE»']]];
  let cur = null; B.forEach(b => { if (t >= b[0]) cur = b; }); if (cur) bubble(g, 640, 520, 800, 260, cur[1], { size: 54, tail: [120, 150] });
}, 'push', .3);
// 11. Tranquilo, como cada noche
scene(164.46, (g, t, lt) => {
  livingRoom(g, t, .8); g.save(); g.translate(W / 2, 1720); figure(g, 0, 0, 2.1, MATEO, { t, aL: -1.0, holdL: (gg, x, y) => mug(gg, x + 6, y - 10, .9, 0), blink: blinkAt(t) }); g.restore();
  for (let i = 0; i < 3; i++) { const p = (t * .6 + i / 3) % 1; g.fillStyle = `rgba(230,230,230,${.35 * (1 - p)})`; g.beginPath(); g.ellipse(360 + Math.sin(p * 6 + i) * 20, 1060 - p * 200, 18 + p * 20, 26 + p * 30, 0, 0, 7); g.fill(); }
  if (t > 167.95 && t < 170.3) pill(g, W / 2, 470, eback(prog(t, 167.95, 168.2)), 'TRANQUILO', '#ece4cf', '#1b1b1b', 60);
  if (t > 170.35) bubble(g, W / 2, 470, 860, 260, t < 171.97 ? ['«NO TE VOY A HACER DAÑO»'] : t < 173.83 ? ['«TU CASTIGO', 'NO ES MORIR»'] : ['«TU CASTIGO', 'ES SABERLO»'], { size: 62, tail: [0, 150] });
}, 'push', .3);
// 12. Julián no puede hablar
scene(175.92, (g, t, lt) => {
  if (t < 177.68) { livingRoom(g, t, .6); g.save(); g.translate(W / 2, 1720); figure(g, 0, 0, 2.2, JULIAN, { t, wide: true, mouth: 'o' }); g.restore(); }
  else if (t < 178.89) { livingRoom(g, t, .6); g.save(); g.translate(W / 2, 1720); figure(g, 0, 0, 2.2, MATEO, { t, blink: false }); g.restore(); }
  else if (t < 180.07) { mateoDesk(g, t, 2); }
  else { g.fillStyle = '#12161c'; g.fillRect(0, 0, W, H); photoFrame(g, W / 2, 760, 2.4, ELENA_HEAD); bigText(g, 'ELENA', W / 2, 1100, 80, '#f0e8d8', 1, 'BB'); }
}, 'cut');
// 13. Pregunta final
scene(182.49, (g, t, lt) => {
  g.fillStyle = '#0a0d12'; g.fillRect(0, 0, W, H); rain(g, t, .12);
  question(g, t, 182.6, '¿QUÉ HARÍAS TÚ?', [['A', 'ENTREGARLO A LA POLICÍA'], ['B', 'PROTEGERLO']], [187.97, 190.35]);
  if (t > 192.04) pill(g, W / 2, 1330 - 60, eback(prog(t, 192.04, 192.3)), 'PIÉNSALO BIEN', '#c4161c', '#fff', 54);
  commentIcon(g, W / 2, 1600, eback(prog(t, 192.3, 192.6)));
}, 'zoom', .3);
// 14. La llamada
scene(194.74, (g, t, lt) => {
  livingRoom(g, t, .7);
  figure(g, 300, 1330, 1.15, JULIAN, { t, aR: t > 195.2 ? -2.6 : -.12, holdR: t > 195.2 ? (gg, x, y) => { g.save(); gg.translate(Math.sin(t * 40) * 3, 0); rr(gg, x - 24, y - 110, 48, 130, 18); fs(gg, '#2a2a2a', 5); gg.restore(); } : null, wide: true });
  figure(g, 800, 1300, 1.1, MATEO, { ...idle(t, 2), t, blink: t > 209.2, tilt: t > 209.6 && t < 211.4 ? .12 * Math.sin((t - 209.6) * 6) : 0 });
  if (t > 198.07 && t < 200.5) { const s = 'COMISARÍA CENTRAL'; pill(g, W / 2, 470, 1, s.slice(0, Math.floor(prog(t, 198.1, 199.6) * s.length)) || ' ', '#12161c', '#47c6ff', 56); }
  if (t > 200.53 && t < 202.7) bubble(g, 700, 480, 640, 200, ['«COMISARÍA CENTRAL,', '¿DÍGAME?»'], { size: 50, tail: [0, 120] });
  if (t > 204.66 && t < 209.1) bubble(g, 420, 480, 760, 240, t < 206.81 ? ['«HABLA EL INSPECTOR', 'JULIÁN FERRER»'] : ['«ENCONTRÉ AL ASESINO', 'DE LAS GRULLAS»'], { size: 50, tail: [-120, 160] });
  if (t > 215.84) { g.fillStyle = 'rgba(0,0,0,.65)'; g.fillRect(0, 0, W, H); bigText(g, '«ES MI HIJO»', W / 2, 820, 130, '#ff4a3d', eback(prog(t, 215.84, 216.1)), 'LG'); }
}, 'push', .3);
// 15. La última grulla
scene(217.39, (g, t, lt) => {
  if (t < 223.65) { nightKitchen(g, t, .7); table(g); emptyChair(g, 540, 1180, .9); g.save(); g.globalAlpha = prog(t, 219.12, 219.8); photoFrame(g, 540, 1080, .55, ELENA_HEAD); g.restore(); crane(g, 760, 1150, .3 * eback(prog(t, 221.2, 221.5)), { glow: .6 }); }
  else { g.fillStyle = '#0a0d12'; g.fillRect(0, 0, W, H); g.save(); cam(g, t - 223.65, 7.5, .1, W / 2, 800); crane(g, W / 2 + 60, 820, 1.8, { glow: .8, rot: -.05 });
    if (t > 224.52) { g.save(); g.translate(W / 2 + 60 - 75 * 1.8, 820 - 90 * 1.8); g.rotate(-.45); g.font = '58px PM'; g.fillStyle = '#1d3fa8'; g.textAlign = 'center'; g.textBaseline = 'middle'; const s = t > 229.49 ? 'Gracias' : ''; g.fillText(s.slice(0, Math.floor(prog(t, 229.49, 230.2) * s.length)), 0, 0); g.restore(); }
    g.restore(); if (t > 229.49) { g.save(); g.globalAlpha = prog(t, 229.49, 229.9); g.translate(W / 2, 1180); g.rotate(-.04); g.font = '150px PM'; g.textAlign = 'center'; g.textBaseline = 'middle'; g.shadowColor = '#47c6ff'; g.shadowBlur = 30; g.fillStyle = '#5a8aff'; g.fillText('«Gracias»', 0, 0); g.restore(); } if (t > 226.19 && t < 229.4) pill(g, W / 2, 1220, eback(prog(t, 226.19, 226.4)), 'NINGÚN NÚMERO', '#1b1b1b', '#ffd21f', 56); }
}, 'push', .3);
// 16. Fin
scene(231.13, (g, t, lt) => {
  g.fillStyle = '#07090c'; g.fillRect(0, 0, W, H); rain(g, t, .15);
  g.save(); g.globalAlpha = prog(lt, 0, .5); g.font = '900 220px CZ'; g.textAlign = 'center'; g.textBaseline = 'middle'; g.shadowColor = '#ffcf6a'; g.shadowBlur = 50; g.fillStyle = '#f3dca2'; g.fillText('FIN', W / 2, 560); g.restore();
  if (lt > .98) { const k = eback(prog(lt, .98, 1.25)); g.save(); g.translate(W / 2, 900); g.scale(k, k); rr(g, -460, -150, 920, 300, 30); fs(g, '#12161c', 8); g.font = '68px LG'; g.textAlign = 'center'; g.textBaseline = 'middle'; g.fillStyle = '#ffd21f'; g.lineWidth = 12; g.strokeStyle = '#000'; for (const [s, y] of [['¿TÚ HABRÍAS HECHO', -45], ['LO MISMO?', 45]]) { g.strokeText(s, 0, y); g.fillText(s, 0, y); } g.restore(); }
  commentIcon(g, W / 2, 1600, eback(prog(t, 234.45, 234.7)));
}, 'fade', .5);
