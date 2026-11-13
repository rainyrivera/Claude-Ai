// ---------- escenas Capítulo 1 ----------
const S = [];
const scene = (t0, draw, tr = 'cut', trd = 0) => S.push({ t0, draw, tr, trd });
const PHONE = (g, t, x, y, s, ring, caller, clk) => { phone(g, x, y, s, ring, t); if (clk) digiClock(g, W / 2, 520, 1.2, clk); if (caller) { g.save(); g.translate(W / 2, 760); rr(g, -260, -60, 520, 120, 20); fs(g, 'rgba(12,14,18,.9)', 5); g.font = '56px BB'; g.fillStyle = '#e8f0e8'; g.textAlign = 'center'; g.textBaseline = 'middle'; g.fillText(caller, 0, 4); g.restore(); } };

// 0. Gancho: grulla en la calle mojada / alguien lo observa
scene(0, (g, t, lt) => {
  nightSky(g); g.fillStyle = '#10161c'; g.fillRect(0, 1100, W, H); g.save(); cam(g, lt, 7.2, .2, W / 2, 1250);
  const fl = g.createLinearGradient(0, 600, 0, 1500); fl.addColorStop(0, 'rgba(255,240,190,0)'); fl.addColorStop(1, 'rgba(255,240,190,.35)'); g.fillStyle = fl; g.beginPath(); g.moveTo(980, 300); g.lineTo(200, 1450); g.lineTo(900, 1500); g.fill();
  g.fillStyle = 'rgba(180,200,220,.12)'; g.beginPath(); g.ellipse(540, 1290, 300, 40, 0, 0, 7); g.fill();
  crane(g, 540, 1220, .9, { glow: 1, rot: -.05 }); g.restore(); rain(g, t);
});
scene(7.28, (g, t, lt) => {
  office(g, t, .35); figure(g, 380, 1330, 1.25, JULIAN, { ...idle(t), t, aL: -.3 });
  g.save(); g.globalAlpha = .85 * prog(lt, .6, 2.0); g.fillStyle = '#05070a'; rr(g, 820, 700, 220, 700, 0); g.fill(); g.restore();
  g.save(); g.globalAlpha = .9 * prog(lt, 1.2, 2.4); g.fillStyle = '#000'; g.beginPath(); g.ellipse(930, 860, 46, 56, 0, 0, 7); g.fill(); g.fillRect(870, 920, 120, 380); g.restore();
}, 'push', .3);
// 1. Título
scene(11.90, (g, t, lt) => {
  g.fillStyle = '#0a0d12'; g.fillRect(0, 0, W, H); rain(g, t, .2);
  crane(g, W / 2, 600, 1.4 * eback(prog(lt, 0, .5)), { glow: 1, rot: -.08 });
  bigText(g, 'LA GRULLA', W / 2, 920, 130, '#f0e8d8', eback(prog(lt, .2, .5)), 'CZ');
  bigText(g, 'DE PAPEL', W / 2, 1050, 110, '#f0e8d8', eback(prog(lt, .4, .7)), 'CZ');
  if (lt > 1.83) { const k = eback(prog(lt, 1.83, 2.05)); g.save(); g.translate(W / 2, 1210); g.rotate(-.04); g.scale(k, k); g.fillStyle = '#9d1418'; g.fillRect(-210, -56, 420, 112); g.lineWidth = 5; g.strokeStyle = '#ffd7c2'; g.strokeRect(-200, -46, 400, 92); g.font = '74px LG'; g.fillStyle = '#ffe9dc'; g.textAlign = 'center'; g.textBaseline = 'middle'; g.fillText('CAPÍTULO 1', 0, 8); g.restore(); }
}, 'glitch', .35);
// 2. Julián
scene(15.62, (g, t, lt) => {
  office(g, t); figure(g, 300, 1330, 1.15, JULIAN, { ...idle(t), t });
  dossier(g, 620, 560, .78 * eback(prog(t, 15.8, 16.1)), JULIAN.head, [['JULIÁN FERRER', '#1b1b1b', 60], ['52 AÑOS'], ['30 AÑOS EN LA POLICÍA'], t > 20.1 ? ['MEJOR INSPECTOR', '#1f9e4a'] : ['']], { tag: 'INSPECTOR' });
  if (t > 22.74) { g.strokeStyle = '#c4161c'; g.lineWidth = 9; const k = prog(t, 22.74, 23.1); g.beginPath(); g.moveTo(380, 660); g.lineTo(380 + 260 * k, 660); g.stroke(); stamp(g, '¿O LO ERA?', 640, 860, prog(t, 22.9, 23.15), '#c4161c', -.1, 70); }
}, 'push', .3);
// 3. Elena: la noche de lluvia (recuerdo)
scene(24.43, (g, t, lt) => {
  g.fillStyle = '#0b0f14'; g.fillRect(0, 0, W, H); g.fillStyle = '#1a1f26'; g.fillRect(0, 1000, W, H);
  g.fillStyle = '#e8e2d0'; for (let x = -((t * 40) % 220); x < W; x += 220) g.fillRect(x, 1330, 120, 16);
  if (t > 25.69 && t < 30.88) { const hx = lerp(-300, 1500, prog(t, 26.2, 29.6)); const hg = g.createRadialGradient(hx, 1180, 0, hx, 1180, 500); hg.addColorStop(0, 'rgba(255,240,200,.55)'); hg.addColorStop(1, 'rgba(0,0,0,0)'); g.fillStyle = hg; g.fillRect(0, 700, W, 900); }
  if (t > 29.23) { g.save(); g.shadowColor = '#ff2020'; g.shadowBlur = 40; const tx = lerp(700, 1150, prog(t, 29.23, 30.8)); ell(g, tx, 1180, 18, 10, '#ff3030', 0); ell(g, tx + 90, 1180, 18, 10, '#ff3030', 0); g.restore(); }
  g.save(); g.translate(430, 1420); g.rotate(.5); g.beginPath(); g.arc(0, 0, 150, Math.PI, 0); g.lineTo(-150, 0); fs(g, '#a8202a', 6); g.lineWidth = 6; g.beginPath(); g.moveTo(0, 0); g.lineTo(40, 170); g.stroke(); g.restore();
  g.save(); g.globalAlpha = .9; photoFrame(g, 820, 520, 1.6, ELENA_HEAD); g.restore(); bigText(g, 'ELENA', 820, 740, 60, '#f0e8d8', 1, 'BB');
  if (t > 30.88) stamp(g, 'CASO ARCHIVADO', W / 2, 980, prog(t, 30.88, 31.1), '#c4161c', -.1, 90);
  rain(g, t, .4);
}, 'push', .3);
scene(32.87, (g, t, lt) => {
  office(g, t, .55); const months = ['MARZO', 'ABRIL', 'MAYO', 'JUNIO', 'JULIO', 'AGOSTO']; const i = Math.min(5, Math.floor(prog(t, 32.9, 35.4) * 6));
  g.save(); g.translate(W / 2, 600); rr(g, -260, -220, 520, 440, 14); fs(g, '#efe6d2', 8); rr(g, -260, -220, 520, 110, 14); fs(g, '#b3161b', 8); g.font = '72px BB'; g.fillStyle = '#fff'; g.textAlign = 'center'; g.textBaseline = 'middle'; g.fillText(months[i], 0, -164); g.font = '220px LG'; g.fillStyle = '#1b1b1b'; g.fillText('?', 0, 60); g.restore();
  // la caja se cierra
  if (t > 35.17) { const c = eio(prog(t, 36.5, 38.2)); g.save(); g.translate(W / 2, 1220); poly(g, [[-260, 0], [260, 0], [240, -220], [-240, -220]], '#9a7a50', 7); g.font = '54px PM'; g.fillStyle = '#1b1b1b'; g.textAlign = 'center'; g.fillText('ELENA', 0, -90); g.save(); g.translate(0, -220); g.scale(1, lerp(-1, 1, c)); poly(g, [[-270, 0], [270, 0], [250, -70], [-250, -70]], '#b38f5e', 6); g.restore(); g.restore(); }
  if (t > 37.54) stamp(g, 'DEJÓ DE BUSCAR', W / 2, 1520, prog(t, 37.54, 37.8), '#c4161c', -.08, 80);
}, 'push', .3);
// 4. En casa con Mateo
scene(39.22, (g, t, lt) => {
  nightKitchen(g, t); table(g);
  figure(g, 250, 1280, 1.0, JULIAN, { ...idle(t), t, aL: -.4, aR: .4 }); emptyChair(g, 540, 1180, .9); photoFrame(g, 540, 1080, .55, ELENA_HEAD);
  figure(g, 830, 1280, .95, MATEO, { ...idle(t, 2), t, aL: -.4, aR: .4 });
  if (t > 42.66 && t < 47.5) dossier(g, W / 2, 470, .7 * eback(prog(t, 42.66, 42.95)), MATEO.head, [['MATEO FERRER', '#1b1b1b', 60], ['19 AÑOS'], t > 44.68 ? ['ESTUDIA MEDICINA'] : [''], t > 46.11 ? ['CASI NO HABLA', '#6a6a6a'] : ['']], { tag: 'HIJO', rot: .03 });
  if (t > 49.76) { g.save(); g.strokeStyle = '#ffd21f'; g.lineWidth = 8; g.beginPath(); g.ellipse(540, 1080, 150, 190, 0, 0, 7 * prog(t, 49.76, 50.4)); g.stroke(); g.restore(); }
}, 'fade', .5);
// 5. Teléfono a las 6:00
scene(51.97, (g, t, lt) => {
  g.fillStyle = '#0c1018'; g.fillRect(0, 0, W, H); g.fillStyle = '#1a2230'; g.fillRect(0, 1200, W, H);
  PHONE(g, t, W / 2, 1180, 1.4, t < 55.12 ? 1 : 0, t > 52.6 && t < 58.9 ? 'LLAMADA: COMISARIO RIVAS' : null, t < 55.12 ? '6:00' : null);
  if (t > 55.12) dossier(g, W / 2, 360, .7 * eback(prog(t, 55.12, 55.4)), RIVAS.head, [['RAFAEL RIVAS', '#1b1b1b', 60], ['COMISARIO'], t > 56.58 ? ['SU COMPAÑERO'] : [''], t > 57.56 ? ['DE TODA LA VIDA'] : ['']], { tag: 'POLICÍA', rot: .03 });
  if (t > 58.9) bubble(g, W / 2, 980, 760, 220, t < 59.69 ? ['«JULIÁN…»'] : ['«JULIÁN, TIENES', 'QUE VER ESTO»'], { size: 62, tail: [0, 80] });
}, 'push', .3);
// 6. Taller: Ignacio
scene(61.58, (g, t, lt) => {
  if (t < 66.48) { nightSky(g); rr(g, 120, 520, 840, 900, 4); fs(g, '#4a4e52', 8); rr(g, 220, 900, 640, 520, 4); fs(g, '#2a2e32', 6); g.fillStyle = 'rgba(255,255,255,.08)'; for (let y = 910; y < 1410; y += 40) g.fillRect(230, y, 620, 4);
    rr(g, 220, 600, 640, 160, 8); fs(g, '#1b1b1b', 6); g.font = '96px BB'; g.fillStyle = '#ffd21f'; g.textAlign = 'center'; g.textBaseline = 'middle'; g.fillText('TALLER BRAVO', 540, 684);
    g.fillStyle = '#1f2224'; g.fillRect(0, 1410, W, H); for (let i = 0; i < 2; i++) { g.save(); g.translate(0, 1250 + i * 60); g.rotate(-.04 + i * .07); g.fillStyle = '#ffd21f'; g.fillRect(-20, -18, 1120, 36); g.fillStyle = '#111'; g.font = '30px BB'; g.textAlign = 'left'; for (let x = 0; x < 1100; x += 320) g.fillText('NO PASAR · POLICÍA', x, 2); g.restore(); }
    const bl = Math.sin(t * 8) > 0; g.fillStyle = bl ? 'rgba(255,40,40,.15)' : 'rgba(40,80,255,.15)'; g.fillRect(0, 0, W, H);
    if (t > 65.43) dossier(g, W / 2, 330, .62 * eback(prog(t, 65.43, 65.7)), IGNACIO.head, [['IGNACIO BRAVO', '#1b1b1b', 60], ['DUEÑO DEL TALLER']], { tag: 'VÍCTIMA 1' }); }
  else { workshop(g, t, .25); seated(g, W / 2, 1180, 1.0, IGNACIO, { t, holdR: t > 73.39 ? (gg, x, y) => crane(gg, x + 10, y - 10, .22, { num: t > 84.35 ? '1' : null }) : null });
    if (t > 69.48 && t < 73.3) { const L = [['SANGRE', 69.48], ['GOLPES', 70.57], ['ROBO', 71.59]]; L.forEach(([n, t0], i) => { if (t < t0) return; const k = eback(prog(t, t0, t0 + .2)); g.save(); g.translate(250 + i * 290, 420); g.scale(k, k); rr(g, -130, -60, 260, 120, 16); fs(g, '#ece4cf', 5); g.font = '48px BB'; g.fillStyle = '#1b1b1b'; g.textAlign = 'center'; g.textBaseline = 'middle'; g.fillText(n, 20, 4); g.strokeStyle = '#c4161c'; g.lineWidth = 8; g.beginPath(); g.moveTo(-110, -20); g.lineTo(-70, 20); g.moveTo(-70, -20); g.lineTo(-110, 20); g.stroke(); g.restore(); }); } }
  if (t > 76.21) { g.save(); g.globalAlpha = prog(t, 76.21, 76.5); g.fillStyle = 'rgba(0,0,0,.75)'; g.fillRect(0, 0, W, H); g.restore(); crane(g, W / 2, 800, 1.7 * eback(prog(t, 76.21, 76.6)), { glow: 1, num: t > 84.35 ? '1' : null, rot: -.06 });
    if (t > 80.05 && t < 84.3) { g.strokeStyle = '#47c6ff'; g.lineWidth = 8; g.beginPath(); g.arc(W / 2 - 128, 650, 120, 0, 7 * prog(t, 80.05, 80.6)); g.stroke(); } }
}, 'push', .3);
// 7. Informe forense
scene(86.04, (g, t, lt) => {
  g.fillStyle = '#d8dde0'; g.fillRect(0, 0, W, H); g.fillStyle = 'rgba(0,0,0,.05)'; for (let x = 0; x < W; x += 60) g.fillRect(x, 0, 3, H);
  g.save(); g.translate(W / 2, 830); g.rotate(-.02); rr(g, -420, -560, 840, 1120, 6); fs(g, '#fbfaf4', 8);
  g.font = '64px BB'; g.fillStyle = '#1b1b1b'; g.textAlign = 'center'; g.fillText('INFORME FORENSE', 0, -460); g.fillRect(-360, -430, 720, 5);
  g.font = '56px BB'; g.textAlign = 'left'; const L = [['VÍCTIMA:', 'IGNACIO BRAVO'], ['HERIDAS:', 'NINGUNA'], ['CAUSA:', t > 88.08 ? 'SEDANTE' : '…'], ['ORIGEN:', t > 89.6 ? 'USO HOSPITALARIO' : '…']];
  L.forEach(([a, b], i) => { g.fillStyle = '#6a6a6a'; g.fillText(a, -370, -330 + i * 110); g.fillStyle = i >= 2 ? '#c4161c' : '#1b1b1b'; g.fillText(b, -40, -330 + i * 110); });
  g.restore();
  if (t > 89.6) { const k = eback(prog(t, 89.6, 89.9)); g.save(); g.translate(W / 2, 1280); g.scale(k, k); rr(g, -60, -150, 120, 240, 20); fs(g, '#e8f4f8', 6); rr(g, -40, -190, 80, 50, 8); fs(g, '#c4161c', 5); g.fillStyle = '#9fd0e8'; g.fillRect(-56, -40, 112, 126); g.font = '30px BB'; g.fillStyle = '#1b1b1b'; g.textAlign = 'center'; g.fillText('HOSPITAL', 0, -70); g.restore(); }
}, 'zoom', .3);
// 8. Libro de cuentas
scene(92.44, (g, t, lt) => {
  workshop(g, t, .2); if (t < 96.18) figure(g, W / 2, 1330, 1.15, JULIAN, { ...walk(t, .6, .25), t, aL: -.4 });
  else { g.fillStyle = 'rgba(0,0,0,.55)'; g.fillRect(0, 0, W, H); ledger(g, W / 2, 820, 1.0 * eback(prog(t, 96.18, 96.5)), t, 1);
    if (t > 100.36) { g.save(); g.strokeStyle = '#ff2b2b'; g.lineWidth = 9; g.beginPath(); g.ellipse(W / 2 + 40, 820, 70, 330, 0, 0, 7 * prog(t, 100.36, 100.9)); g.stroke(); g.restore(); } }
}, 'push', .3);
// 9. El doble pliegue
scene(102.69, (g, t, lt) => {
  g.fillStyle = '#12161c'; g.fillRect(0, 0, W, H); g.save(); cam(g, lt, 9, .1);
  crane(g, W / 2 + 60, 820, 1.8, { num: '1', tailHi: t > 106.63 ? prog(t, 106.63, 107.2) : 0, rot: -.05 }); g.restore();
  if (t > 106.63) { const k = eback(prog(t, 106.63, 106.95)); g.save(); g.translate(260, 860); g.scale(k, k); g.lineWidth = 16; g.strokeStyle = '#2a2a2a'; g.beginPath(); g.arc(0, 0, 150, 0, 7); g.stroke(); g.beginPath(); g.moveTo(100, 110); g.lineTo(200, 230); g.lineWidth = 28; g.stroke(); g.restore(); }
}, 'push', .3);
// 10. Pregunta al público 1
scene(111.81, (g, t, lt) => {
  g.fillStyle = '#0a0d12'; g.fillRect(0, 0, W, H); rain(g, t, .12);
  question(g, t, 111.9, '¿QUÉ HARÍAS TÚ?', [['A', 'LA HOJA ARRANCADA'], ['B', 'EL SEDANTE DE HOSPITAL'], ['C', 'LA GRULLA DE PAPEL']], [116.35, 117.78, 119.33]);
  commentIcon(g, W / 2, 1580, eback(prog(t, 120.96, 121.2)));
}, 'zoom', .3);
// 11. Los vecinos
scene(123.19, (g, t, lt) => {
  street(g, t, 120); g.fillStyle = 'rgba(20,30,50,.25)'; g.fillRect(0, 0, W, H);
  figure(g, 540, 1300, 1.1, JULIAN, { ...idle(t), t, aR: -.9 });
  const B = [['«ERA CALLADO»', 127.44, 260, 520], ['«TRABAJABA SOLO»', 129.49, 800, 660], ['«COMPRÓ UNA CASA NUEVA»', 133.35, 540, 400]];
  B.forEach(([s, t0, x, y]) => { if (t > t0) bubble(g, x, y, s.length * 30 + 120, 160, [s], { size: 50, tail: [0, 60] }); });
  if (t > 135.04) { const k = eback(prog(t, 135.04, 135.3)); g.save(); g.translate(W / 2, 760); g.scale(k, k); ell(g, 0, 0, 110, 110, '#1f9e4a', 6); g.font = '120px LG'; g.fillStyle = '#fff'; g.textAlign = 'center'; g.textBaseline = 'middle'; g.fillText('$?', 0, 8); g.restore(); }
}, 'push', .3);
// 12. Cocina: la servilleta
scene(137.65, (g, t, lt) => {
  nightKitchen(g, t); table(g);
  if (t < 143.91 || t > 160.0) { figure(g, 330, 1280, 1.05, JULIAN, { ...idle(t), t, aL: -.3 }); if (t < 160.59) figure(g, 760, 1280, 1.0, MATEO, { ...idle(t, 2), t, aL: -.5, aR: .5, tilt: .1 }); else figure(g, lerp(760, 1200, prog(t, 160.59, 161.6)), 1280, 1.0, MATEO, { ...walk(t, 1, .3), t, flip: true });
    if (t < 143.91) { g.save(); g.translate(760, 1160); rr(g, -120, -30, 240, 40, 4); fs(g, '#e8e2d0', 5); g.fillStyle = '#c4161c'; g.font = '22px BB'; g.textAlign = 'center'; g.fillText('ANATOMÍA', 0, -2); g.restore(); } }
  else { g.fillStyle = 'rgba(0,0,0,.45)'; g.fillRect(0, 0, W, H);
    const fold = t < 156.13 ? (t - 143.91) : 156.13 - 143.91; const ph = Math.min(1, fold / 10);
    g.save(); g.translate(W / 2, 820); g.rotate(Math.sin(fold * .8) * .05); const sq = 260 * (1 - ph * .55);
    poly(g, [[-sq, -sq * .6], [sq, -sq * .6], [sq * (1 - ph * .6), sq * .6], [-sq * (1 - ph * .3), sq * .6]], '#f4f1ea', 6);
    g.strokeStyle = 'rgba(0,0,0,.2)'; g.lineWidth = 4; for (let i = 0; i < Math.floor(ph * 6); i++) { g.beginPath(); g.moveTo(-sq + i * 30, -sq * .6); g.lineTo(sq - i * 40, sq * .6); g.stroke(); }
    for (const sx of [-1, 1]) { g.save(); g.translate(sx * (sq + 60) + Math.sin(t * (t < 156.13 ? 6 : 0) + sx) * 12, 40); ell(g, 0, 0, 70, 90, '#d9ad88', 6); for (let f = 0; f < 4; f++) { rr(g, -sx * 70 - 18, -60 + f * 34, 46, 26, 13); fs(g, '#d9ad88', 4); } g.restore(); }
    g.restore();
    if (t > 148.82 && t < 156.13) { const lines = t < 150.67 ? ['MATEO:', '«¿UN CASO DIFÍCIL, PAPÁ?»'] : ['JULIÁN:', '«UNA GRULLA DE PAPEL', 'EN LA MANO»']; bubble(g, W / 2, 380, 820, 280, lines, { size: 54, tail: [0, 100] }); }
    if (t > 156.13) { stamp(g, 'SE DETIENE', W / 2, 400, prog(t, 156.13, 156.4), '#c4161c', -.08, 90); if (t > 158.88) bubble(g, W / 2, 1180, 460, 160, ['«QUÉ RARO»'], { size: 60, tail: [0, -100] }); } }
}, 'push', .3);
// 13. Julián no duerme
scene(162.45, (g, t, lt) => {
  nightKitchen(g, t, .8); table(g); figure(g, 330, 1280, 1.05, JULIAN, { t, blink: false, aL: -.6 });
  g.save(); g.translate(720, 1150); g.rotate(-.1); rr(g, -110, -80, 220, 160, 4); fs(g, '#f4f1ea', 5); crane(g, 0, 0, .3, { num: '1' }); g.restore();
  if (t > 164.07) { const h = Math.floor(prog(t, 164.1, 167.4) * 4); digiClock(g, W / 2, 420, .9, ['1:00', '2:00', '3:00', '4:00'][Math.min(3, h)], '#ffb52e'); }
  if (t > 168.11) { g.save(); g.globalAlpha = .35 * prog(t, 168.11, 168.8) * (.7 + .3 * Math.sin(t * 9)); g.filter = 'blur(6px)'; nightKitchen(g, 0, .2); g.fillStyle = 'rgba(255,220,160,.35)'; g.fillRect(0, 0, W, H); g.translate(W / 2, 900); ell(g, -120, 0, 60, 60, '#e2b48c', 0); ell(g, 120, 40, 40, 40, '#d9ad88', 0); crane(g, 0, 160, .4, {}); g.restore(); }
}, 'push', .3);
// 14. Pasa una semana
scene(172.28, (g, t, lt) => {
  office(g, t, .45);
  if (t < 177.2) { const days = ['LUN', 'MAR', 'MIÉ', 'JUE', 'VIE', 'SÁB', 'DOM']; const d = Math.min(6, Math.floor(prog(t, 172.3, 173.6) * 7)); g.save(); g.translate(W / 2, 480); days.forEach((s, i) => { rr(g, -455 + i * 130, -60, 120, 120, 10); fs(g, i <= d ? '#ece4cf' : '#3a3a3a', 5); g.font = '44px BB'; g.fillStyle = i <= d ? '#1b1b1b' : '#888'; g.textAlign = 'center'; g.textBaseline = 'middle'; g.fillText(s, -395 + i * 130, 4); }); g.restore();
    [['HUELLAS', 173.7], ['TESTIGOS', 174.75], ['CÁMARAS', 175.9]].forEach(([n, t0], i) => { if (t < t0) return; const k = eback(prog(t, t0, t0 + .2)); g.save(); g.translate(W / 2, 760 + i * 150); g.scale(k, k); rr(g, -260, -60, 520, 120, 16); fs(g, '#ece4cf', 5); g.font = '58px BB'; g.fillStyle = '#1b1b1b'; g.textAlign = 'center'; g.textBaseline = 'middle'; g.fillText('NO HAY ' + n, 40, 4); g.strokeStyle = '#c4161c'; g.lineWidth = 9; g.beginPath(); g.moveTo(-230, -24); g.lineTo(-180, 24); g.moveTo(-180, -24); g.lineTo(-230, 24); g.stroke(); g.restore(); }); }
  else { figure(g, 320, 1330, 1.15, JULIAN, { ...idle(t), t }); figure(g, 780, 1330, 1.1, RIVAS, { ...idle(t, 3), t, aR: -.8 });
    g.save(); g.globalAlpha = prog(t, 177.2, 178.6) * .6; g.fillStyle = '#9fd0ff'; g.fillRect(0, 0, W, H); g.restore();
    if (t > 181.05) bubble(g, 700, 560, 700, 240, ['«FUE UN AJUSTE DE CUENTAS.', 'NO PIERDAS EL TIEMPO»'], { size: 50, tail: [60, 120] }); }
}, 'push', .3);
// 15. Domingo 6:00 / Clara Montes
scene(184.64, (g, t, lt) => {
  if (t < 189.18) { g.fillStyle = '#0c1018'; g.fillRect(0, 0, W, H); g.fillStyle = '#1a2230'; g.fillRect(0, 1200, W, H); PHONE(g, t, W / 2, 1180, 1.4, t > 186.93 ? 1 : 0, t > 186.93 ? 'DOMINGO · OTRA LLAMADA' : null, '6:00'); }
  else { g.fillStyle = '#3a2e36'; g.fillRect(0, 0, W, H); g.fillStyle = 'rgba(255,255,255,.04)'; for (let x = 0; x < W; x += 80) g.fillRect(x, 0, 30, 1100); g.fillStyle = '#4a3a2a'; g.fillRect(0, 1100, W, H);
    for (const [x, y] of [[180, 380], [880, 420]]) { rr(g, x - 70, y - 90, 140, 180, 6); fs(g, '#b8862f', 5); }
    seated(g, W / 2, 1150, 1.0, CLARA, { t, tilt: -.15, holdR: t > 197.88 ? (gg, x, y) => crane(gg, x + 10, y - 10, .22, { num: t > 201.41 ? '2' : null }) : null }, '#6a3a4a');
    if (t > 190.05 && t < 194.9) dossier(g, W / 2, 360, .62 * eback(prog(t, 190.05, 190.3)), CLARA.head, [['CLARA MONTES', '#1b1b1b', 60], ['60 AÑOS']], { tag: 'VÍCTIMA 2' });
    if (t > 194.97 && t < 197.8) [['SIN HERIDAS', 194.97], ['MISMO SEDANTE', 196.13]].forEach(([n, t0], i) => { if (t < t0) return; const k = eback(prog(t, t0, t0 + .2)); g.save(); g.translate(W / 2, 360 + i * 140); g.scale(k, k); rr(g, -300, -56, 600, 112, 16); fs(g, '#ece4cf', 5); g.font = '56px BB'; g.fillStyle = '#c4161c'; g.textAlign = 'center'; g.textBaseline = 'middle'; g.fillText(n, 0, 4); g.restore(); });
    if (t > 198.84) { g.save(); g.globalAlpha = prog(t, 198.84, 199.1); g.fillStyle = 'rgba(0,0,0,.75)'; g.fillRect(0, 0, W, H); g.restore(); crane(g, W / 2, 800, 1.7 * eback(prog(t, 198.84, 199.2)), { glow: 1, num: t > 201.41 ? '2' : null, rot: .05 }); } }
}, 'push', .3);
// 16. El mensaje dentro de la grulla
scene(203.01, (g, t, lt) => {
  g.fillStyle = '#0a0d12'; g.fillRect(0, 0, W, H);
  const u = eio(prog(t, 205.3, 208.0)); if (u < 1) { g.save(); g.globalAlpha = 1 - u; crane(g, W / 2, 800, 1.7 * (1 - u * .4), { num: '2', rot: u * 1.5 }); g.restore(); }
  if (u > .2) { const k = eout(prog(t, 205.8, 208.4)); g.save(); g.translate(W / 2, 820); g.rotate(-.03); g.scale(k, k); rr(g, -400, -260, 800, 520, 4); fs(g, '#f4f1ea', 6); g.strokeStyle = 'rgba(0,0,0,.12)'; g.lineWidth = 3; for (const x of [-200, 0, 200]) { g.beginPath(); g.moveTo(x, -260); g.lineTo(x, 260); g.stroke(); } g.beginPath(); g.moveTo(-400, 0); g.lineTo(400, 0); g.stroke();
    g.font = '66px PM'; g.fillStyle = '#1d3fa8'; g.textAlign = 'center'; g.textBaseline = 'middle'; const l1 = 'Inspector Ferrer.', l2 = '¿Todavía no', l3 = 'te acuerdas?';
    g.fillText(l1.slice(0, Math.floor(prog(t, 210.82, 211.7) * l1.length)), 0, -120); const r2 = prog(t, 212.3, 213.4); g.fillText(l2.slice(0, Math.floor(Math.min(1, r2 * 2) * l2.length)), 0, 10); g.fillText(l3.slice(0, Math.floor(Math.max(0, r2 * 2 - 1) * l3.length)), 0, 120); g.restore(); }
}, 'push', .3);
// 17. Escalofrío
scene(214.13, (g, t, lt) => {
  nightKitchen(g, t, .6); g.save(); g.translate(W / 2, 1700); figure(g, 0, 0, 2.3, JULIAN, { t, wide: true, mouth: 'o', bob: Math.sin(t * 40) * 2 }); g.restore();
  g.save(); g.globalAlpha = .35 * prog(t, 214.2, 216); const fr = g.createRadialGradient(W / 2, 900, 200, W / 2, 900, 1100); fr.addColorStop(0, 'rgba(0,0,0,0)'); fr.addColorStop(1, 'rgba(170,220,255,1)'); g.fillStyle = fr; g.fillRect(0, 0, W, H); g.restore();
  if (t > 218.52) { g.save(); g.globalAlpha = .9 * prog(t, 218.52, 219.6); g.fillStyle = '#000'; g.beginPath(); g.ellipse(790, 700, 40, 50, 0, 0, 7); g.fill(); g.fillRect(738, 750, 104, 150); g.restore(); }
}, 'push', .3);
// 18. Pregunta final
scene(220.36, (g, t, lt) => {
  g.fillStyle = '#0a0d12'; g.fillRect(0, 0, W, H); rain(g, t, .12); crane(g, W / 2, 420, .7, { num: '2', glow: .6 });
  const k = eback(prog(t, 220.4, 220.7)); g.save(); g.translate(W / 2, 860); g.scale(k, k); rr(g, -460, -200, 920, 400, 30); fs(g, '#12161c', 8); g.font = '78px LG'; g.textAlign = 'center'; g.textBaseline = 'middle'; g.fillStyle = '#ffd21f'; g.lineWidth = 12; g.strokeStyle = '#000';
  for (const [s, y] of [['¿QUÉ ES LO QUE', -90], ['JULIÁN NO', 0], ['RECUERDA?', 90]]) { g.strokeText(s, 0, y); g.fillText(s, 0, y); } g.restore();
  commentIcon(g, W / 2, 1200, eback(prog(t, 223.01, 223.3)));
}, 'zoom', .3);
// 19. Continuará
scene(224.95, (g, t, lt) => {
  g.fillStyle = '#07090c'; g.fillRect(0, 0, W, H); rain(g, t, .15); const k = prog(lt, 0, .8);
  g.save(); g.globalAlpha = k; g.font = '900 120px CZ'; g.textAlign = 'center'; g.textBaseline = 'middle'; g.shadowColor = '#ffcf6a'; g.shadowBlur = 40; g.fillStyle = '#f3dca2'; g.fillText('CONTINUARÁ', W / 2, 760); g.restore();
  g.save(); g.globalAlpha = prog(lt, .4, 1); bigText(g, 'CAPÍTULO 2', W / 2, 900, 96, '#ffffff', 1, 'BB'); g.restore();
  if (lt > 1.93) bigText(g, 'SÍGUEME PARA NO PERDÉRTELO', W / 2, 1010, 64, '#ff4a3d', eback(prog(lt, 1.93, 2.2)), 'BB');
}, 'fade', .5);
