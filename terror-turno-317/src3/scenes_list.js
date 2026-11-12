// ---------- escenas Parte 3 ----------
const S = [];
const scene = (t0, draw, tr = 'cut', trd = 0) => S.push({ t0, draw, tr, trd });
const CW = 1000, CH = 740;
const bigCam = (g, label, clk, kind, t, o) => cctv(g, 40, 430, CW, CH, label, clk, cg => camX(cg, CW, CH, kind, t, o));
const run = t => walk(t, 2.2, .75);

// 0. Gancho
scene(0, (g, t, lt) => {
  g.fillStyle = '#040606'; g.fillRect(0, 0, W, H);
  bigCam(g, 'CAM 6 · PLANTA BAJA', '00:00:52', 'lobby', t, { walker: COPY, wx: 540, wy: lerp(640, 760, prog(t, 0, 3.4)), ws: lerp(.5, .7, prog(t, 0, 3.4)), pose: walk(t, .7, .3), extra: { aL: -.5, holdL: flashlight(.9), smile: 1 } });
});
scene(3.43, (g, t, lt) => {
  booth(g, t, { lit: .5 }); g.fillStyle = 'rgba(0,0,0,.45)'; g.fillRect(0, 0, W, H);
  raceBar(g, 640, .1, lerp(1, .25, eio(prog(t, 3.5, 5.3))), null);
  const fade = prog(t, 5.6, 7.0); g.save(); g.globalAlpha = 1 - fade; figure(g, W / 2, 1480, 1.5, TOMAS, { t, wide: true, sweat: true }); g.restore();
  if (fade > 0) for (let i = 0; i < 40; i++) { const a = srnd(i) * 6.28, d = fade * 400 * srnd(i + 2); g.fillStyle = `rgba(30,45,69,${1 - fade})`; g.fillRect(W / 2 + Math.cos(a) * d, 1150 + Math.sin(a) * d - fade * 200, 14, 14); }
}, 'push', .3);
// 1. Título
scene(7.80, (g, t, lt) => {
  g.fillStyle = '#060908'; g.fillRect(0, 0, W, H);
  for (let i = 0; i < 400; i++) { g.fillStyle = `rgba(200,220,210,${srnd(i * 7 + Math.floor(t * 24)) * .12})`; g.fillRect(srnd(i + Math.floor(t * 24) * 1.3) * W, srnd(i * 3.3 + Math.floor(t * 24)) * H, 6, 2); }
  bigText(g, 'EL TURNO', W / 2, 520, 130, '#e8f0e8', eback(prog(lt, .05, .35)));
  bigText(g, 'DE LAS', W / 2, 650, 80, '#e8f0e8', eback(prog(lt, .3, .55)));
  const blink = Math.floor(lt * 2) % 2 === 0 || lt < 1; digiClock(g, W / 2, 900, 1.5 * eback(prog(lt, .5, .85)), blink ? '3:17' : '3 17');
  if (lt > 2.37) { const k = eback(prog(lt, 2.37, 2.6)); g.save(); g.translate(W / 2, 1150); g.rotate(-.05); g.scale(k, k); g.fillStyle = '#9d1418'; g.fillRect(-170, -56, 340, 112); g.lineWidth = 5; g.strokeStyle = '#ffd7c2'; g.strokeRect(-160, -46, 320, 92); g.font = '86px LG'; g.fillStyle = '#ffe9dc'; g.textAlign = 'center'; g.textBaseline = 'middle'; g.fillText('PARTE 3', 0, 8); g.restore(); }
  if (lt > 3.48) bigText(g, 'EL FINAL', W / 2, 1290, 90, '#ff4a3d', eback(prog(lt, 3.48, 3.7)), 'BB');
}, 'glitch', .35);
// 2. Cuaderno: contratapa
scene(12.58, (g, t, lt) => {
  booth(g, t, { lit: .6 }); g.fillStyle = 'rgba(0,0,0,.35)'; g.fillRect(0, 0, W, H);
  figure(g, 300, 1490, 1.3, TOMAS, { t, sweat: true, aL: -.9 });
  const flip = prog(t, 15.22, 15.8); g.save(); g.translate(720, 760); g.rotate(-.05); g.scale(Math.max(.05, Math.abs(Math.cos(flip * Math.PI))), 1);
  rr(g, -220, -280, 440, 560, 12); fs(g, flip < .5 ? '#6b4a2b' : '#7a5838', 8);
  if (flip < .5) { rr(g, -150, -90, 300, 120, 8); fs(g, '#e9e1c8', 5); g.font = '44px PM'; g.fillStyle = '#1d1a16'; g.textAlign = 'center'; g.textBaseline = 'middle'; g.fillText('RAMIRO', 0, -30); }
  else { rr(g, -190, -250, 380, 500, 6); fs(g, '#d8cfb4', 4); g.fillStyle = 'rgba(90,90,90,.5)'; for (let i = 0; i < 5; i++) g.fillRect(-150, -170 + i * 70, 280 - (i % 2) * 60, 10); }
  g.restore();
}, 'push', .3);
const STEPS = [['Terminar la ronda antes que él', 19.52], ['Volver a la caseta', 23.18], ['Cerrar con llave', 24.47], ['NO responder a tu nombre', 25.82]];
scene(17.45, (g, t, lt) => {
  g.fillStyle = '#0c100f'; g.fillRect(0, 0, W, H); g.save(); cam(g, lt, 11.7, .06, W / 2, 860);
  g.save(); g.translate(W / 2, 860); g.rotate(.02); rr(g, -450, -560, 900, 1120, 10); fs(g, '#d8cfb4', 8); g.fillStyle = 'rgba(0,0,0,.06)'; for (let i = 0; i < 30; i++) g.fillRect(-440 + srnd(i) * 860, -540 + srnd(i + 9) * 1080, 30, 3);
  g.font = '62px PM'; g.fillStyle = '#4a4a4a'; g.textAlign = 'center'; g.textBaseline = 'middle'; g.fillText('LA ÚNICA FORMA:', 0, -450);
  STEPS.forEach(([s, t0], i) => { if (t < t0) return; const k = prog(t, t0, t0 + .7); const y = -280 + i * 190; rr(g, -400, y - 40, 80, 80, 8); fs(g, '#f2efe6', 5);
    g.save(); g.beginPath(); g.rect(-300, y - 70, 740 * k, 140); g.clip(); g.font = (i === 3 ? '46px' : '44px') + ' PM'; g.textAlign = 'left'; g.fillStyle = i === 3 ? '#8a1010' : '#4a4a4a'; g.fillText(s, -300, y); g.restore();
    if (i === 3 && t > 27.12) { g.strokeStyle = '#b3161b'; g.lineWidth = 8; g.beginPath(); g.moveTo(-300, y + 45); g.lineTo(-300 + 700 * prog(t, 27.12, 27.8), y + 45); g.stroke(); } });
  g.restore(); g.restore();
}, 'zoom', .3);
// 3. Toma la linterna y sale
scene(29.22, (g, t, lt) => {
  booth(g, t, { lit: .6 }); g.fillStyle = 'rgba(0,0,0,.3)'; g.fillRect(0, 0, W, H);
  const x = lerp(400, 1250, eio(prog(t, 29.9, 31.6))); figure(g, x, 1490, 1.3, TOMAS, { ...(t > 29.9 ? walk(t, 1.4, .5) : idle(t)), t, aL: -.5, holdL: flashlight(.9) });
}, 'push', .3);
// 4. Piso 1
scene(31.64, (g, t, lt) => {
  corridor(g, t, { stretchers: false, dark: .35 });
  for (const [x, y, s, r] of [[380, 1260, .9, .5], [700, 1120, .65, -.4], [520, 980, .45, .9]]) { g.save(); g.translate(x, y); g.rotate(r); g.scale(s, s); rr(g, -140, -40, 280, 34, 8); fs(g, '#9a8d7a', 5); g.lineWidth = 7; g.strokeStyle = '#5b4a3a'; g.beginPath(); g.moveTo(-120, -6); g.lineTo(-120, 90); g.moveTo(120, -6); g.lineTo(120, 90); g.stroke(); g.restore(); }
  if (t > 36.15) { const k = prog(t, 36.15, 41.1); const s = lerp(.25, .75, k); figure(g, 540, lerp(900, 1180, k), s, COPY, { ...walk(t, .7, .3), t, aL: -.5, holdL: flashlight(1), smile: t > 39.84 ? 1 : 0 }); }
  if (t > 39.84) { g.save(); g.globalAlpha = .25 * Math.abs(Math.sin(t * 8)); g.fillStyle = '#ff2020'; g.fillRect(0, 0, W, H); g.restore(); }
  const rx = t > 41.17 ? lerp(300, -300, eio(prog(t, 41.17, 42.9))) : 300; figure(g, rx, 1500, 1.1, TOMAS, { ...(t > 41.17 ? run(t) : idle(t)), t, flip: t > 41.17, wide: t > 39.84, aL: t > 41.17 ? 1 : -.5, holdL: t > 41.17 ? null : flashlight(.8) });
}, 'push', .3);
// 5. Piso 2: pasos que imitan
scene(43.27, (g, t, lt) => {
  corridor(g, t, { dark: .45 }); const running = (t > 46.85 && t < 48.87); const stopped = t > 48.87;
  figure(g, 540, 1460, 1.1, TOMAS, { ...(running ? run(t) : idle(t)), t, wide: true, sweat: true, aL: running ? .9 : -.4, holdL: running ? null : flashlight(.8) });
  const active = t > 44.57 && (!stopped || t < 49.9);
  if (active) for (let i = 0; i < 6; i++) { const ph = (t * (running ? 3 : 1.4) + i / 6) % 1; const side = i % 2 ? 1 : -1; g.save(); g.globalAlpha = (1 - ph) * .9; g.translate(540 + side * 120, 900 - ph * 300); g.rotate(side * .2); ell(g, 0, 0, 22, 40, '#e8f0e8', 3); ell(g, 0, -52, 14, 14, '#e8f0e8', 3); g.restore(); }
  if (stopped && t > 49.9) bigText(g, '…', W / 2, 760, 160, '#e8f0e8', 1);
}, 'push', .3);
// 6. Piso 3: humo y relojes
scene(51.80, (g, t, lt) => {
  corridor(g, t, { dark: .2, smoke: .45, flick: false });
  g.fillStyle = '#0d0a08'; for (let i = 0; i < 10; i++) { g.beginPath(); g.ellipse(srnd(i) * W, 300 + srnd(i + 4) * 1000, 120, 220, srnd(i + 2), 0, 7); g.fill(); }
  for (let i = 0; i < 9; i++) { const p = (t * .22 + i / 9) % 1; g.fillStyle = `rgba(60,52,46,${.55 * (1 - p)})`; g.beginPath(); g.arc(srnd(i) * W, H - p * H * 1.2, 140 + p * 120, 0, 7); g.fill(); }
  if (t > 57.17) { [[260, 560, 90], [820, 520, 80], [540, 380, 70]].forEach(([x, y, r], i) => { const k = eback(prog(t, 57.2 + i * .25, 57.5 + i * .25)); if (k > 0) { g.save(); g.translate(x, y); g.scale(k, k); analogClock(g, 0, 0, r, 3, 17, 1); g.restore(); } }); }
  figure(g, 540, 1470, 1.1, TOMAS, { ...walk(t, .8, .3), t, aL: -.5, holdL: flashlight(.6), tilt: Math.sin(t) * .05 });
  if (t > 59.59) { const k = eback(prog(t, 59.59, 59.85)); g.save(); g.translate(W / 2, 800); g.scale(k, k); rr(g, -360, -120, 720, 240, 30); fs(g, 'rgba(12,12,12,.92)', 6); g.font = '60px BB'; g.textAlign = 'center'; g.textBaseline = 'middle'; g.fillStyle = '#e8f0e8'; g.fillText('SU RELOJ', -170, -60); g.fillText('LAS PAREDES', 170, -60); g.font = '110px BB'; g.fillStyle = '#7fe08a'; g.fillText('3:00', -170, 40); g.fillStyle = '#ff3b30'; g.fillText('3:17', 170, 40); g.restore(); }
}, 'push', .3);
// 7. Piso 4: silencio y la voz
scene(61.60, (g, t, lt) => {
  g.fillStyle = '#020303'; g.fillRect(0, 0, W, H);
  g.save(); g.beginPath(); g.moveTo(560, 1200); g.lineTo(200, 300); g.lineTo(900, 300); g.closePath(); g.clip(); corridor(g, t, { dark: .55, flick: false }); g.restore();
  figure(g, 560, 1480, 1.2, TOMAS, { t, wide: t > 64.65, aL: -2.6, holdL: flashlight(0) });
  if (t > 67.62) { const lines = t < 68.54 ? ['¿TOMÁS?'] : t < 69.26 ? ['¿TOMÁS?', 'HIJO…'] : ['¿TOMÁS? HIJO…', '¿ERES TÚ?']; bubble(g, 640, 560, 640, 260, lines, { wobble: true, tail: [-60, -140], size: 62 }); }
  if (t > 70.35) { g.save(); g.globalAlpha = .55 * prog(t, 70.35, 71.2); g.translate(840, 300); g.scale(1.6, 1.6); ell(g, 0, 0, 60, 60, 'rgba(255,154,209,.25)', 0); MOM.head(g, {}); g.restore(); }
}, 'push', .3);
// 8. Se congela / regla 4 / responde
scene(74.25, (g, t, lt) => {
  g.fillStyle = '#030404'; g.fillRect(0, 0, W, H);
  if (t < 77.69) { sheet(g, W / 2, 820, .85, 4, t, lt, 3); if (t > 75.65) { const k = prog(t, 75.65, 76.2); g.strokeStyle = '#ff2020'; g.lineWidth = 10; g.beginPath(); g.ellipse(W / 2 - 20, 1100, 420 * k + 10, 100 * k + 5, -.03, 0, 7); g.stroke(); } }
  else if (t < 79.01) { bubble(g, W / 2, 760, 700, 300, ['*LLANTO*'], { wobble: true, size: 80, color: '#5a3a60' }); for (let i = 0; i < 6; i++) { const p = (t * 1.5 + i / 6) % 1; ell(g, 300 + i * 90, 920 + p * 300, 10, 16, `rgba(160,210,255,${1 - p})`, 0); } }
  else { figure(g, W / 2, 1520, 1.8, TOMAS, { t, wide: true, sweat: true, mouth: t > 81.38 ? 'o' : null });
    if (t > 81.38) bubble(g, 760, 540, 380, 180, ['¿MAMÁ?'], { size: 70, tail: [-120, -170] });
    if (t > 81.6) { g.save(); g.translate(240, 560); g.rotate(-.15); sheet(g, 0, 0, .28, 4, t, lt, 3); g.strokeStyle = '#ff2020'; g.lineWidth = 16; g.beginPath(); g.moveTo(-110, -140); g.lineTo(110, 140); g.moveTo(110, -140); g.lineTo(-110, 140); g.stroke(); g.restore(); } }
}, 'push', .3);
scene(82.36, (g, t, lt) => {
  g.fillStyle = '#000'; g.fillRect(0, 0, W, H);
  if (t > 83.89 && t < 87.81) bubble(g, W / 2, 760, 600, 220, ['…'], { size: 120, fill: '#1b1b1b', color: '#ff2b2b' });
  if (t > 87.81) { const k = eback(prog(t, 87.81, 88.05)); g.save(); g.translate(W / 2, 760); g.scale(k, k); bubble(g, 0, 0, 760, 300, ['GRACIAS'], { size: 150, font: 'PM', fill: '#120404', color: '#ff2020', shake: 10 }); g.restore();
    g.save(); g.globalAlpha = .3; g.translate(W / 2, 1150); g.scale(3.5, 3.5); faceTomas(g, { smile: 1 }, true); g.restore(); }
}, 'push', .3);
// 9. Carrera a la caseta
scene(88.98, (g, t, lt) => {
  corridor(g, t, { dark: .4, stretchers: false });
  const x = lerp(-100, 1200, prog(t, 88.98, 92.5)); figure(g, x, 1480, 1.1, TOMAS, { ...run(t), t, aL: 1, aR: -1, sweat: true, wide: true });
}, 'push', .3);
scene(92.61, (g, t, lt) => {
  g.fillStyle = '#0a0d0c'; g.fillRect(0, 0, W, H); g.fillStyle = '#2b3530'; g.fillRect(0, 1180, W, H); g.fillStyle = '#4b5a52'; g.fillRect(0, 300, W, 880);
  rr(g, 430, 560, 220, 620, 6); fs(g, '#3b4a44', 8); rr(g, 470, 620, 140, 160, 4); fs(g, '#cfe8d6', 5);
  const a = prog(t, 92.61, 100.3), b = 1 - prog(t, 95.02, 100.3) * .85;
  figure(g, lerp(80, 400, a), 1440, .85, TOMAS, { ...run(t), t, aL: 1, aR: -1, wide: true });
  if (t > 95.02) figure(g, lerp(1100, 740, prog(t, 95.02, 100.3)), 1440, .85, COPY, { ...run(t + .3), t, aL: 1, aR: -1, smile: 1, flip: true });
  const lab = t > 99.61 ? '3 M' : t > 98.5 ? '5 M' : '10 M'; raceBar(g, 250, a, b, lab);
}, 'push', .3);
// 10. Entra y cierra con llave
scene(100.41, (g, t, lt) => {
  g.fillStyle = '#0a0d0c'; g.fillRect(0, 0, W, H);
  const slam = eio(prog(t, 101.3, 101.6)); rr(g, 200, 300, 680, 1100, 10); fs(g, '#1c2321', 8); g.save(); g.translate(200, 300); g.scale(lerp(.2, 1, slam), 1); rr(g, 0, 0, 680, 1100, 10); fs(g, '#3b4a44', 8); g.restore();
  if (t > 101.6) { g.save(); g.translate(W / 2, 1000); ell(g, 0, 0, 110, 110, '#c9a24a', 7); rr(g, -18, -60, 36, 120, 8); g.save(); g.rotate(eio(prog(t, 102.2, 102.8)) * Math.PI / 2); rr(g, -14, -70, 28, 140, 8); fs(g, '#e8d9a8', 5); g.restore(); g.restore(); }
  if (t > 102.8) stamp(g, 'CERRADO', W / 2, 640, prog(t, 102.8, 103.0), '#1f9e4a', -.08, 110);
}, 'push', .3);
// 11. Golpes en el vidrio
scene(103.29, (g, t, lt) => {
  g.fillStyle = '#0a0d0c'; g.fillRect(0, 0, W, H); const sh = t > 104.4 ? Math.sin(t * 40) * 6 * (Math.sin(t * 3) > 0) : 0;
  g.save(); g.translate(sh, 0); rr(g, 120, 260, 840, 1180, 10); fs(g, '#3b4a44', 10); rr(g, 220, 360, 640, 760, 6); fs(g, '#4f6a5e', 7);
  g.save(); rr(g, 220, 360, 640, 760, 6); g.clip(); g.fillStyle = '#20302a'; g.fillRect(220, 360, 640, 760); const z = t > 105.93 ? lerp(3.4, 4.6, prog(t, 105.93, 108.8)) : 3.2; g.translate(540, 760); g.scale(z, z); faceTomas(g, { smile: 0 }, true); g.restore();
  g.fillStyle = 'rgba(220,240,230,.12)'; poly(g, [[260, 380], [420, 380], [260, 600]], 'rgba(220,240,230,.12)', 0);
  for (const [x, y] of [[300, 980], [760, 1000]]) { g.fillStyle = 'rgba(230,230,220,.25)'; g.beginPath(); g.ellipse(x, y, 40, 50, 0, 0, 7); g.fill(); for (let f = 0; f < 4; f++) { g.beginPath(); g.ellipse(x - 30 + f * 20, y - 70, 9, 22, 0, 0, 7); g.fill(); } }
  g.restore();
}, 'push', .3);
// 12. 3:17 – uno, dos, tres… nada
scene(109.21, (g, t, lt) => {
  booth(g, t, { lit: .45 }); g.fillStyle = 'rgba(0,0,0,.4)'; g.fillRect(0, 0, W, H);
  if (t < 111.63) digiClock(g, W / 2, 720, 1.5 * eback(prog(t, 109.21, 109.45)), '3:17');
  else if (t < 117.61) { figure(g, W / 2, 1520, 1.8, TOMAS, { t, wide: true, sweat: true, blink: false });
    const n = t > 115.92 ? '3' : t > 115.11 ? '2' : t > 114.43 ? '1' : null; if (n) { const t0 = n === '1' ? 114.43 : n === '2' ? 115.11 : 115.92; bigText(g, n, W / 2, 520, 260, '#ff2b2b', eback(prog(t, t0, t0 + .15))); g.save(); g.translate((Math.random() - .5) * 20 * (1 - prog(t, t0, t0 + .3)), 0); g.restore(); } }
  else { g.fillStyle = '#000'; g.fillRect(0, 0, W, H); bigText(g, 'NADA', W / 2, 800, 140, '#e8f0e8', eback(prog(t, 117.61, 117.9)), 'BB'); }
}, 'push', .3);
// 13. Amanecer
scene(118.62, (g, t, lt) => {
  if (t < 120.83) { const gr = g.createLinearGradient(0, 0, 0, H); gr.addColorStop(0, '#5a7aa0'); gr.addColorStop(.55, '#f0a070'); gr.addColorStop(1, '#f6d6a0'); g.fillStyle = gr; g.fillRect(0, 0, W, H); g.save(); g.shadowColor = '#fff1b8'; g.shadowBlur = 90; ell(g, W / 2, lerp(520, 380, prog(t, 118.6, 120.8)), 110, 110, '#fff1b8', 0); g.restore(); clinicExtNoSky(g, t); }
  else if (t < 124.40) { booth(g, t, { lit: .95 }); g.fillStyle = 'rgba(255,200,140,.12)'; g.fillRect(0, 0, W, H); if (t < 122.78) { g.strokeStyle = '#ff2b2b'; g.lineWidth = 9; g.strokeRect(MONS[5][0] - 10, MONS[5][1] - 10, 260, 195); g.fillStyle = '#000'; g.fillRect(MONS[5][0], MONS[5][1], 240, 175); }
    else { g.save(); g.fillStyle = 'rgba(0,0,0,.5)'; g.fillRect(0, 0, W, H); g.restore(); cctv(g, 90, 520, 900, 660, 'CAM 1 · PASILLO', '06:00:12', cg => camX(cg, 900, 660, 'corridor', t, {})); } }
  else { const gr = g.createLinearGradient(0, 0, 0, H); gr.addColorStop(0, '#7aa6c9'); gr.addColorStop(.6, '#f2c48a'); gr.addColorStop(1, '#f6dca0'); g.fillStyle = gr; g.fillRect(0, 0, W, H); clinicExtNoSky(g, t);
    figure(g, 360, 1300, 1.0, TOMAS, { ...idle(t), t, aR: t < 126.4 ? -.9 : -.12, mouth: t > 126.79 ? 'smile' : null });
    figure(g, 760, 1300, 1.0, BOSS, { ...idle(t, 2), t, aL: t < 126.4 ? .9 : .12 });
    if (t < 126.4) { g.save(); g.translate(560, 1050); ell(g, -12, 0, 26, 26, '#d7a93a', 5); rr(g, 6, -8, 54, 14, 4); fs(g, '#d7a93a', 4); g.restore(); }
    if (t > 126.79) { const k = eback(prog(t, 126.79, 127.1)); g.save(); g.translate(360, 760); g.scale(k, k); ell(g, 0, 0, 100, 100, '#1f9e4a', 6); g.strokeStyle = '#fff'; g.lineWidth = 16; g.beginPath(); g.moveTo(-40, 0); g.lineTo(-10, 34); g.lineTo(46, -36); g.stroke(); g.restore(); } }
}, 'push', .3);
// 14. Maneja / abre la puerta
scene(129.98, (g, t, lt) => {
  if (t < 131.41) { const gr = g.createLinearGradient(0, 0, 0, H); gr.addColorStop(0, '#7aa6c9'); gr.addColorStop(1, '#f6dca0'); g.fillStyle = gr; g.fillRect(0, 0, W, H);
    g.fillStyle = '#4a4a4a'; g.fillRect(0, 1250, W, 300); g.fillStyle = '#f2efe6'; for (let x = -((t * 900) % 200); x < W; x += 200) g.fillRect(x, 1390, 110, 16); g.fillStyle = '#6a8a4a'; g.fillRect(0, 1550, W, H);
    for (let i = 0; i < 5; i++) { const x = ((i * 300 - t * 500) % 1500 + 1500) % 1500 - 200; rr(g, x, 1000, 30, 250, 6); fs(g, '#6b4a2b', 5); ell(g, x + 15, 960, 90, 90, '#5d8f4a', 6); }
    car(g, W / 2, 1360 + Math.sin(t * 20) * 3, 1.0, 0, '#2d5fb3'); }
  else { house(g, t); const op = eio(prog(t, 131.41, 132.1)); g.save(); g.translate(470, 1060); g.scale(lerp(1, .15, op), 1); rr(g, 0, 0, 140, 340, 6); fs(g, '#6b4a2b', 7); g.restore(); if (op > 0) { g.fillStyle = '#ffe9b0'; g.fillRect(470 + 140 * (1 - op * .85) + 2, 1064, 140 * op * .85 - 4, 332); } }
}, 'push', .3);
// 15. Cocina: taza
scene(132.47, (g, t, lt) => {
  kitchen(g, t); const fall = prog(t, 134.89, 135.5);
  figure(g, 640, 1330, 1.2, MOM, { t, aR: t < 134.89 ? -1.6 : -.4, wide: t > 134.14, mouth: t > 134.14 ? 'o' : null, pale: t > 134.14 });
  if (t > 134.14) figure(g, 180, 1400, 1.1, TOMAS, { t, mouth: 'smile' });
  if (fall < 1) mug(g, lerp(800, 820, fall), lerp(990, 1450, fall * fall), 1.2, fall * 4);
  else { for (let i = 0; i < 9; i++) { const a = srnd(i) * 3.14, d = eout(prog(t, 135.5, 136)) * 160 * srnd(i + 1); poly(g, [[0, -14], [16, 6], [-10, 12]].map(([x, y]) => [820 + Math.cos(a) * d * (srnd(i + 2) > .5 ? 1 : -1) + x, 1460 - Math.sin(a) * d * .3 + y]), '#f2efe6', 3); } }
}, 'push', .3);
scene(136.82, (g, t, lt) => {
  kitchen(g, t, .7); g.save(); g.translate(W / 2, 1700); figure(g, 0, 0, 2.4, MOM, { t, pale: true, wide: true, mouth: t > 140.47 ? 'o' : null, bob: Math.sin(t * 30) * 3 }); g.restore();
  if (t > 140.47) { const lines = t < 141.57 ? ['«TOMÁS…»'] : t < 143.47 ? ['«TÚ LLEGASTE', 'HACE UNA HORA»'] : ['«ESTÁS ARRIBA,', 'DURMIENDO»']; bubble(g, W / 2, 520, 820, 280, lines, { size: 70, tail: [40, 120] }); }
}, 'push', .3);
// 16. Escalera: la puerta se cierra / la voz de arriba
scene(145.67, (g, t, lt) => {
  homeStairs(g, t, eio(prog(t, 146.2, 148.4)), lerp(.25, .5, prog(t, 145.7, 150)));
  if (t > 148.89 && t < 152.25) { g.save(); g.globalAlpha = .7; g.fillStyle = '#000'; g.beginPath(); g.ellipse(540, 120, 40, 50, 0, 0, 7); g.fill(); g.restore(); }
  if (t > 152.25) bubble(g, 680, 700, 760, 260, t < 153.12 ? ['«¿MAMÁ?»'] : ['«¿MAMÁ?', '¿QUIÉN ESTÁ AHÍ ABAJO?»'], { size: 62, tail: [-140, -260], wobble: true });
  if (t > 152.25) { g.save(); g.globalAlpha = .9; g.translate(540, 380); g.scale(1.3, 1.3); g.beginPath(); g.rect(-120, -160, 240, 120); g.clip(); g.restore(); }
}, 'push', .3);
// 17. Fin
scene(154.65, (g, t, lt) => {
  g.fillStyle = '#050606'; g.fillRect(0, 0, W, H);
  for (let i = 0; i < 60; i++) { g.fillStyle = `rgba(200,240,220,${.2 + srnd(i) * .4})`; g.fillRect((srnd(i) * W + t * 15) % W, (srnd(i + 9) * H - t * 25 * (srnd(i + 3) + .3) + H * 9) % H, 4, 4); }
  const k = prog(lt, 0, .5); g.save(); g.globalAlpha = k; g.font = '900 220px CZ'; g.textAlign = 'center'; g.textBaseline = 'middle'; g.shadowColor = '#ff2b2b'; g.shadowBlur = 50; g.fillStyle = '#f0e2d0'; g.fillText('FIN', W / 2, 720); g.restore();
  g.save(); g.globalAlpha = .25 * prog(lt, .5, 1.5); g.translate(W / 2, 1050); g.scale(1.6, 1.6); faceTomas(g, { smile: 1 }, true); g.restore();
  if (lt > 1.85) bigText(g, 'SÍGUEME PARA MÁS', W / 2, 1180, 76, '#ffffff', eback(prog(lt, 1.85, 2.1)), 'BB');
  if (lt > 2.3) bigText(g, 'HISTORIAS DE TERROR', W / 2, 1270, 76, '#ff4a3d', eback(prog(lt, 2.3, 2.55)), 'BB');
}, 'fade', .5);
const _cx = mk(W, H); function clinicExtNoSky(g, t) { const c = _cx, cg = c.getContext('2d'); cg.clearRect(0, 0, W, H); clinicExt(cg, t, 0); cg.globalCompositeOperation = 'destination-out'; cg.fillStyle = '#000'; cg.fillRect(0, 0, W, 380); cg.globalCompositeOperation = 'source-over'; g.drawImage(c, 0, 0); }
