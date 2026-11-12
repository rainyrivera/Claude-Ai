// ---------- escenas Parte 2 ----------
const S = [];
const scene = (t0, draw, tr = 'cut', trd = 0) => S.push({ t0, draw, tr, trd });
const CORR_W = 1000, CORR_H = 740;
const bigCam = (g, label, clk, kind, t, o) => cctv(g, 40, 430, CORR_W, CORR_H, label, clk, cg => camX(cg, CORR_W, CORR_H, kind, t, o));

// 0. Gancho
scene(0, (g, t, lt) => {
  g.fillStyle = '#040606'; g.fillRect(0, 0, W, H); const z = lerp(1, 1.15, eio(prog(lt, 0, 3.4)));
  g.save(); g.translate(W / 2, 800); g.scale(z, z); g.translate(-W / 2, -800);
  bigCam(g, 'CAM 6 · CASETA', '03:17:00', 'booth', t, { man: true, turn: 1, smile: 1 }); g.restore();
});
scene(3.47, (g, t, lt) => {
  g.fillStyle = '#030404'; g.fillRect(0, 0, W, H);
  cctv(g, 90, 360, 900, 900, 'CAM 6', '03:17:09', cg => { cg.fillStyle = '#2d3a35'; cg.fillRect(0, 0, 900, 900); cg.save(); cg.translate(450, 520); cg.scale(4.6, 4.6); faceTomas(cg, { smile: 1 }, true); cg.restore(); });
}, 'zoom', .3);
scene(7.67, (g, t, lt) => {
  g.fillStyle = '#060808'; g.fillRect(0, 0, W, H);
  const seq = ['3:17', '3:10', '2:40', '1:30', '12:00']; const i = Math.min(4, Math.floor(prog(lt, .1, 3.0) * 5)); const k = (prog(lt, .1, 3.0) * 5) % 1;
  digiClock(g, W / 2, 800, 1.6 * (1 + (i < 4 ? (1 - eout(Math.min(1, k * 3))) * .15 : 0)), seq[i]);
  g.save(); g.font = '60px BB'; g.textAlign = 'center'; g.fillStyle = '#e8f0e8'; const nights = ['NOCHE 3', 'NOCHE 4', 'NOCHE 5', 'NOCHE 6', 'NOCHE 7']; g.fillText(nights[i], W / 2, 600); g.restore();
  g.strokeStyle = '#ff2b2b'; g.lineWidth = 10; g.beginPath(); g.moveTo(820, 980); g.lineTo(820, 1180); g.stroke(); poly(g, [[790, 1170], [850, 1170], [820, 1220]], '#ff2b2b', 0);
}, 'push', .3);
// 1. Título
scene(10.97, (g, t, lt) => {
  g.fillStyle = '#060908'; g.fillRect(0, 0, W, H);
  for (let i = 0; i < 400; i++) { g.fillStyle = `rgba(200,220,210,${srnd(i * 7 + Math.floor(t * 24)) * .12})`; g.fillRect(srnd(i + Math.floor(t * 24) * 1.3) * W, srnd(i * 3.3 + Math.floor(t * 24)) * H, 6, 2); }
  bigText(g, 'EL TURNO', W / 2, 520, 130, '#e8f0e8', eback(prog(lt, .05, .35)));
  bigText(g, 'DE LAS', W / 2, 650, 80, '#e8f0e8', eback(prog(lt, .3, .55)));
  const blink = Math.floor(lt * 2) % 2 === 0 || lt < 1; digiClock(g, W / 2, 900, 1.5 * eback(prog(lt, .5, .85)), blink ? '3:17' : '3 17');
  if (lt > 2.46) { const k = eback(prog(lt, 2.46, 2.7)); g.save(); g.translate(W / 2, 1150); g.rotate(-.05); g.scale(k, k); g.fillStyle = '#9d1418'; g.fillRect(-170, -56, 340, 112); g.lineWidth = 5; g.strokeStyle = '#ffd7c2'; g.strokeRect(-160, -46, 320, 92); g.font = '86px LG'; g.fillStyle = '#ffe9dc'; g.textAlign = 'center'; g.textBaseline = 'middle'; g.fillText('PARTE 2', 0, 8); g.restore(); }
}, 'glitch', .35);
// 2. No mira atrás – cuenta hasta cien
scene(14.64, (g, t, lt) => {
  booth(g, t, { lit: .55 }); g.fillStyle = 'rgba(0,0,0,.35)'; g.fillRect(0, 0, W, H);
  const hung = t > 16.9; const closed = t > 17.74;
  figure(g, W / 2, 1490, 1.7, TOMAS, { t, sweat: true, wide: !closed, blink: closed, aR: hung ? -.12 : -2.6, holdR: hung ? null : (gg, x, y) => { rr(gg, x - 30, y - 120, 60, 170, 25); fs(gg, '#c9b98f', 6); } });
  if (t > 18.9) { const n = Math.min(100, Math.floor(prog(t, 18.9, 20.5) * 100) + 1); g.save(); g.translate(W / 2, 470); rr(g, -230, -110, 460, 220, 20); fs(g, 'rgba(10,12,12,.85)', 6); g.font = '150px LG'; g.fillStyle = '#e8f0e8'; g.textAlign = 'center'; g.textBaseline = 'middle'; g.fillText(String(n), 0, 12); g.restore(); }
}, 'glitch', .3);
scene(20.53, (g, t, lt) => {
  g.fillStyle = '#040606'; g.fillRect(0, 0, W, H); const ch = eio(prog(t, 24.3, 25.3)) * 1.2;
  bigCam(g, 'CAM 6 · CASETA', '03:19:40', 'booth', t, { chair: ch });
}, 'push', .3);
// 3. Amanecer – vuelve
scene(26.87, (g, t, lt) => {
  const gr = g.createLinearGradient(0, 0, 0, H); gr.addColorStop(0, '#2b3a4a'); gr.addColorStop(.6, '#c27a5a'); gr.addColorStop(1, '#e7b07a'); g.fillStyle = gr; g.fillRect(0, 0, W, H);
  g.save(); g.globalAlpha = .9; clinicExtNoSky(g, t); g.restore();
  const back = t > 30.48; const x = back ? lerp(800, 560, prog(t, 30.48, 31.8)) : lerp(560, 820, prog(t, 26.87, 29));
  figure(g, x, 1300, 1.0, TOMAS, { ...walk(t, .8, .3), t, flip: back, tired: true });
  if (t > 29.02 && t < 30.48) { const k = eback(prog(t, 29.02, 29.3)); g.save(); g.translate(W / 2, 560); g.scale(k, k); rr(g, -220, -130, 440, 260, 20); fs(g, '#5a3d24', 7); rr(g, -180, -90, 360, 180, 10); fs(g, '#3d2a18', 5); g.font = '120px LG'; g.fillStyle = '#ff4a3d'; g.textAlign = 'center'; g.textBaseline = 'middle'; g.fillText('$0', 0, 10); g.restore(); }
}, 'push', .3);
const _cx = mk(W, H); function clinicExtNoSky(g, t) { const c = _cx, cg = c.getContext('2d'); cg.clearRect(0, 0, W, H); clinicExt(cg, t, 0); cg.globalCompositeOperation = 'destination-out'; cg.fillStyle = '#000'; cg.fillRect(0, 0, W, 380); cg.globalCompositeOperation = 'source-over'; g.drawImage(c, 0, 0); }
// 4. Investiga: caja y cuaderno
scene(31.84, (g, t, lt) => {
  booth(g, t, { lit: .75 }); g.fillStyle = 'rgba(0,0,0,.35)'; g.fillRect(0, 0, W, H);
  figure(g, 330, 1490, 1.3, TOMAS, { t, aL: -.4, aR: .4, ...(t > 33.98 ? { tilt: .15 } : {}), holdL: flashlight(.8) });
  if (t > 33.98) { const k = eback(prog(t, 33.98, 34.3)); g.save(); g.translate(760, 1420); g.scale(k, k); poly(g, [[-170, 0], [170, 0], [150, -200], [-150, -200]], '#9a7a50', 7); poly(g, [[-170, -200], [170, -200], [200, -260], [-140, -260]], '#b38f5e', 6);
    if (t > 35.5) { g.save(); g.translate(0, -260 - eout(prog(t, 35.5, 36.2)) * 120); g.rotate(-.1); rr(g, -90, -120, 180, 240, 8); fs(g, '#6b4a2b', 6); g.restore(); } g.restore(); }
  if (t > 38.18) { const k = eback(prog(t, 38.18, 38.45)); g.save(); g.translate(W / 2, 640); g.rotate(-.04); g.scale(k, k); rr(g, -260, -330, 520, 660, 14); fs(g, '#6b4a2b', 8); rr(g, -180, -120, 360, 150, 8); fs(g, '#e9e1c8', 5);
    g.font = '50px PM'; g.fillStyle = '#1d1a16'; g.textAlign = 'center'; g.textBaseline = 'middle'; g.fillText('RAMIRO', 0, -40); g.font = '30px BB'; g.fillText('BITÁCORA DE RONDAS', 0, 10); g.restore(); }
}, 'push', .3);
// 5. Notas ordenadas → desordenadas
scene(39.67, (g, t, lt) => {
  g.fillStyle = '#0c100f'; g.fillRect(0, 0, W, H);
  const pageTurn = prog(t, 46.1, 46.6);
  if (pageTurn < .5) { const L = [['NOCHE 1'], t > 42.27 ? ['00:00  Ronda. OK.'] : [], t > 43.68 ? ['01:00  Ronda. OK.'] : [], t > 44.97 ? ['Todo normal.'] : []]; notebook(g, W / 2, 860, 1.0 * (1 - pageTurn * 2 * .1), L.map(x => x.length ? x : [null]), t); }
  else { const L = [];
    if (t > 48.89) L.push(['Lo vi en el monitor 6', .5]); else L.push([null]); if (t > 48.89) L.push(['a las 3:17.', .5]); else L.push([null]);
    if (t > 52.21) L.push(['Una semana después:', .8]); else L.push([null]); if (t > 53.73) L.push(['Hoy apareció a las 3:10.', 1.0, '#3a1a12']); else L.push([null]);
    if (t > 56.88) L.push(['2:50. YA ESTÁ EN', 1.6, '#5a1210']); else L.push([null]); if (t > 58.07) L.push(['EL SEGUNDO PISO', 1.8, '#7a1010']); else L.push([null]);
    notebook(g, W / 2, 860, 1.0, L, t, { stains: t > 56 }); }
  if (pageTurn > 0 && pageTurn < 1) { g.save(); g.translate(W / 2 - 420, 860); g.scale(Math.abs(Math.cos(pageTurn * Math.PI)), 1); rr(g, 0, -530, 840, 1060, 8); fs(g, '#e9e1c8', 6); g.restore(); }
}, 'zoom', .3);
scene(59.86, (g, t, lt) => {
  g.fillStyle = '#080404'; g.fillRect(0, 0, W, H); g.save(); cam(g, lt, 8.2, .15, W / 2, 900);
  const L = [[null], [null], t > 62.26 ? ['SI LLEGA A LA CASETA', 2.4, '#6a0c0c', 64] : [null], t > 62.9 ? ['ANTES QUE TÚ', 2.6, '#6a0c0c', 74] : [null], t > 64.35 ? ['SE QUEDA CON TU TURNO', 2.8, '#7a0a0a', 56] : [null], t > 65.84 ? ['Y TÚ CON EL SUYO', 3.2, '#8a0808', 70] : [null]];
  notebook(g, W / 2, 900, 1.0, L, t, { stains: true, rot: .04 }); g.restore();
  g.fillStyle = `rgba(80,0,0,${.15 + .1 * Math.sin(t * 3)})`; g.fillRect(0, 0, W, H);
}, 'push', .3);
// 6. Internet / incendio
scene(68.09, (g, t, lt) => {
  booth(g, t, { lit: .4 }); g.fillStyle = 'rgba(0,0,0,.5)'; g.fillRect(0, 0, W, H);
  g.save(); g.translate(W / 2, 860); rr(g, -280, -520, 560, 1040, 50); fs(g, '#111', 8); rr(g, -250, -470, 500, 940, 20); fs(g, '#f2f2f2', 0);
  rr(g, -220, -420, 440, 70, 35); fs(g, '#fff', 4); g.font = '32px BB'; g.fillStyle = '#333'; g.textAlign = 'left'; g.textBaseline = 'middle'; const q = 'clínica valdivieso'; g.fillText(q.slice(0, Math.floor(prog(t, 68.2, 69.3) * q.length)), -190, -384);
  if (t > 69.4) { for (let i = 0; i < 4; i++) { g.fillStyle = '#1a4fb3'; g.fillRect(-220, -300 + i * 150, 360, 26); g.fillStyle = '#999'; g.fillRect(-220, -260 + i * 150, 420, 14); g.fillRect(-220, -236 + i * 150, 300, 14); } }
  g.restore();
}, 'push', .3);
scene(69.81, (g, t, lt) => {
  g.fillStyle = '#0c0a08'; g.fillRect(0, 0, W, H); g.save(); cam(g, lt, 7.8, .08, W / 2, 900);
  g.save(); g.translate(W / 2, 880); g.rotate(-.03); rr(g, -440, -600, 880, 1200, 4); fs(g, '#e6dcc0', 8);
  g.font = '50px CZ'; g.fillStyle = '#1b1b1b'; g.textAlign = 'center'; g.fillText('EL DIARIO', 0, -520); g.fillRect(-400, -490, 800, 6); g.font = '30px BB'; g.fillText('16 DE MARZO DE 1989', 0, -455);
  g.font = '78px BB'; g.fillText('INCENDIO EN CLÍNICA', 0, -370); g.fillText('VALDIVIESO', 0, -290);
  rr(g, -380, -240, 760, 460, 4); fs(g, '#2a2420', 5);
  g.save(); g.beginPath(); g.rect(-380, -240, 760, 460); g.clip(); g.fillStyle = '#4a403a'; g.fillRect(-260, -120, 520, 340); for (let r = 0; r < 3; r++) for (let c = 0; c < 4; c++) { g.fillStyle = r === 0 ? `rgba(255,${140 + 60 * Math.sin(t * 9 + c)},40,.9)` : '#15110e'; g.fillRect(-230 + c * 125, -100 + r * 100, 80, 60); }
  for (let i = 0; i < 6; i++) { const p = (t * .4 + i / 6) % 1; g.fillStyle = `rgba(30,25,22,${.7 * (1 - p)})`; g.beginPath(); g.arc(-150 + i * 60 + p * 40, -140 - p * 120, 40 + p * 60, 0, 7); g.fill(); } g.restore();
  g.fillStyle = '#4a4036'; for (let i = 0; i < 5; i++) g.fillRect(-380, 270 + i * 50, 760 - (i % 2) * 120, 18);
  g.restore();
  if (t > 75.34) { const n = Math.min(17, Math.floor(prog(t, 75.34, 76.6) * 17) + 1); g.save(); g.translate(W / 2, 1560); rr(g, -280, -80, 560, 160, 16); fs(g, 'rgba(10,8,8,.9)', 6); g.font = '96px LG'; g.fillStyle = '#ff4a3d'; g.textAlign = 'center'; g.textBaseline = 'middle'; g.fillText(`${n} MUERTOS`, 0, 8); g.restore(); }
  g.restore();
}, 'zoom', .3);
scene(77.65, (g, t, lt) => {
  g.fillStyle = '#16120f'; g.fillRect(0, 0, W, H); g.fillStyle = 'rgba(0,0,0,.25)'; for (let x = 0; x < W; x += 90) g.fillRect(x, 0, 6, H);
  g.save(); cam(g, lt, 6.3, .1, W / 2, 800); const pos = [[270, 520, 140], [790, 470, 120], [540, 830, 200], [240, 1080, 110], [830, 1100, 130]];
  pos.forEach(([x, y, r], i) => { const k = eback(prog(t, 77.8 + i * .35, 78.1 + i * .35)); if (k <= 0) return; g.save(); g.translate(x, y); g.scale(k, k); analogClock(g, 0, 0, r, 3, 17, i % 2); g.restore(); });
  for (let i = 0; i < 8; i++) { const p = (t * .25 + i / 8) % 1; g.fillStyle = `rgba(40,34,30,${.5 * (1 - p)})`; g.beginPath(); g.arc(srnd(i) * W, H - p * H, 120 + p * 100, 0, 7); g.fill(); }
  g.restore();
  if (t > 82.07) digiClock(g, W / 2, 1600, eback(prog(t, 82.07, 82.3)), '3:17');
}, 'push', .3);
// 7. Ramiro desaparecido / auto
scene(83.97, (g, t, lt) => {
  g.fillStyle = '#1a201e'; g.fillRect(0, 0, W, H);
  const k = eback(prog(t, 85.22, 85.5)); g.save(); g.translate(W / 2, 850); g.rotate(.03); g.scale(k, k);
  rr(g, -360, -520, 720, 1000, 6); fs(g, '#efe8d2', 8); g.font = '120px BB'; g.fillStyle = '#b3161b'; g.textAlign = 'center'; g.fillText('DESAPARECIDO', 0, -400);
  rr(g, -220, -330, 440, 440, 6); fs(g, '#7a8580', 6); g.save(); g.translate(0, -60); g.scale(2.6, 2.6); RAMIRO.head(g, {}); g.restore();
  g.font = '80px BB'; g.fillStyle = '#1b1b1b'; g.fillText('RAMIRO', 0, 210); g.font = '46px BB'; g.fillStyle = '#3a3a3a'; g.fillText('GUARDIA NOCTURNO', 0, 280); g.fillText('VISTO HACE 2 MESES', 0, 340);
  g.restore();
}, 'push', .3);
scene(89.72, (g, t, lt) => {
  nightSky(g); moon(g, 860, 300, 60); g.fillStyle = '#20272a'; g.fillRect(0, 1150, W, H); g.save(); cam(g, lt, 4.3, .08, W / 2, 1150);
  g.strokeStyle = '#d8d0b0'; g.lineWidth = 8; for (let i = 0; i < 5; i++) { g.beginPath(); g.moveTo(80 + i * 240, 1200); g.lineTo(40 + i * 260, 1700); g.stroke(); }
  rr(g, 840, 520, 20, 700, 6); fs(g, '#20282a', 5); g.save(); g.shadowColor = '#ffe2a2'; g.shadowBlur = 60; ell(g, 850, 520, 40, 18, '#ffe2a2', 4); g.restore();
  const cone = g.createLinearGradient(0, 530, 0, 1500); cone.addColorStop(0, 'rgba(255,226,162,.35)'); cone.addColorStop(1, 'rgba(255,226,162,0)'); g.fillStyle = cone; g.beginPath(); g.moveTo(830, 530); g.lineTo(380, 1500); g.lineTo(1080, 1500); g.lineTo(870, 530); g.fill();
  car(g, 560, 1380, 1.25, 1); g.restore(); fog(g, t, 1300, .14);
}, 'push', .3);
// 8. Noche 4: escucha pasos
scene(94.05, (g, t, lt) => {
  booth(g, t, { lit: .6 }); g.fillStyle = 'rgba(0,0,0,.35)'; g.fillRect(0, 0, W, H);
  figure(g, 330, 1490, 1.5, TOMAS, { t, wide: t > 97.47, sweat: t > 98.6, tilt: t > 97.47 ? -.12 : 0 });
  if (t > 98.64) for (let i = 0; i < 3; i++) { const p = ((t * 1.2 + i / 3) % 1); g.strokeStyle = `rgba(232,240,232,${1 - p})`; g.lineWidth = 7; g.beginPath(); g.arc(800, 600, 40 + p * 160, -0.7, 0.7); g.stroke(); g.beginPath(); g.arc(800, 600, 40 + p * 160, Math.PI - .7, Math.PI + .7); g.stroke(); }
  if (lt < 1.2) bigText(g, 'NOCHE 4', W / 2, 260, 120, '#e8f0e8', eback(prog(lt, 0, .3)), 'BB');
  if (t > 101.35) { const on = prog(t, 101.35, 101.6); g.save(); g.globalAlpha = on; g.fillStyle = 'rgba(160,255,190,.25)'; g.fillRect(MONS[5][0], MONS[5][1], 240, 175); g.restore(); digiClock(g, 760, 1000, .7 * eback(prog(t, 101.35, 101.6)), '3:10'); }
}, 'push', .3);
scene(104.45, (g, t, lt) => {
  g.fillStyle = '#040606'; g.fillRect(0, 0, W, H);
  const wy = lerp(520, 770, prog(t, 104.45, 113.6)), ws = lerp(.32, .72, prog(t, 104.45, 113.6));
  bigCam(g, 'CAM 6 · PISO 3', '03:10:' + String(Math.floor(lt) + 12).padStart(2, '0'), 'corridor', t, { walker: COPY, wx: 540 + Math.sin(t * .6) * 30, wy, ws, extra: { aL: -.5, holdL: flashlight(.9), smile: t > 113.44 ? 1 : 0 } });
  if (t > 113.44) { g.save(); g.globalAlpha = prog(t, 113.44, 113.6); cctv(g, 40, 430, CORR_W, CORR_H, 'CAM 6 · PISO 3', '03:10:21', cg => { cg.fillStyle = '#4b5a52'; cg.fillRect(0, 0, CORR_W, CORR_H); cg.save(); cg.translate(500, 420); cg.scale(4.2, 4.2); faceTomas(cg, { smile: 1 }, true); cg.restore(); }); g.restore(); }
}, 'push', .3);
// 9. Noches 5 y 6: edificio
scene(114.61, (g, t, lt) => {
  g.fillStyle = '#0b100e'; g.fillRect(0, 0, W, H);
  const f = t < 118.39 ? lerp(1, 2, eio(prog(t, 114.8, 116.2))) : lerp(2, 3, eio(prog(t, 118.5, 119.8)));
  building(g, W / 2, 830, .85, [f, ''], t);
  const lab = t < 118.39 ? ['NOCHE 5', '2:40'] : ['NOCHE 6', '1:30']; g.save(); g.font = '72px BB'; g.textAlign = 'center'; g.fillStyle = '#e8f0e8'; g.fillText(lab[0], W / 2 - 200, 230); g.restore(); digiClock(g, W / 2 + 200, 210, .55, lab[1]);
}, 'push', .3);
// 10. Otras cámaras / Ramiro en el sótano
scene(121.43, (g, t, lt) => {
  booth(g, t, { lit: .75 }); g.fillStyle = 'rgba(0,0,0,.3)'; g.fillRect(0, 0, W, H);
  const sel = Math.floor(prog(t, 121.5, 124.2) * 6) % 6; const [x, y] = MONS[t < 124.71 ? sel : 2]; g.strokeStyle = '#ffd21f'; g.lineWidth = 9; g.strokeRect(x - 10, y - 10, 260, 195);
  figure(g, 280, 1490, 1.3, TOMAS, { t, aL: -1.2 });
}, 'push', .3);
scene(126.89, (g, t, lt) => {
  g.fillStyle = '#040606'; g.fillRect(0, 0, W, H);
  const ang = t * 1.1; const z = t > 132.08 ? lerp(1, 2.2, eio(prog(t, 132.08, 133.4))) : 1;
  g.save(); g.translate(W / 2, 800); g.scale(z, z); g.translate(-W / 2, -800);
  bigCam(g, 'CAM 3 · SÓTANO', '03:42:17', 'basement', t, { walker: RAMIRO, wx: 540 + Math.cos(ang) * 260, wy: 640 + Math.sin(ang) * 40, ws: .8, pose: walk(t, .9, .3), extra: { flip: Math.sin(ang) < 0 } });
  g.restore();
  if (t > 133.79) { const k = eback(prog(t, 133.79, 134.1)); g.save(); g.translate(W / 2, 820); g.scale(k, k); rr(g, -360, -130, 720, 260, 10); fs(g, '#4a5560', 8); rr(g, -320, -90, 640, 180, 8); fs(g, '#e8e2cf', 5);
    g.font = '130px PM'; g.fillStyle = '#1b2a6a'; g.textAlign = 'center'; g.textBaseline = 'middle'; const nm = 'RAMIRO'; g.fillText(nm.slice(0, Math.max(0, Math.floor(prog(t, 134.2, 136.6) * 6))), 0, 10); g.restore(); }
}, 'push', .3);
// 11. Noche 7
scene(139.72, (g, t, lt) => {
  booth(g, t, { lit: lerp(.2, .85, prog(t, 142.2, 142.6)) });
  figure(g, W / 2, 1490, 1.6, TOMAS, { t, blink: t > 144 && t < 145, bob: Math.sin(t * 1.5) * 5 });
  if (lt < 1.2) bigText(g, 'NOCHE 7', W / 2, 260, 120, '#e8f0e8', eback(prog(lt, 0, .3)), 'BB');
  if (t > 145.58) digiClock(g, W / 2, 620, 1.3 * eback(prog(t, 145.58, 145.8)), '11:59');
}, 'push', .3);
scene(148.51, (g, t, lt) => {
  g.fillStyle = '#040606'; g.fillRect(0, 0, W, H);
  if (t < 151.62) { digiClock(g, W / 2, 800, 1.7 * eback(prog(t, 148.51, 148.75)), '12:00'); }
  else if (t < 153.97) bigCam(g, 'CAM 6 · PLANTA BAJA', '00:00:41', 'lobby', t, { walker: COPY, wx: 540, wy: 700, ws: .6, pose: idle(t), extra: { aL: -.5, holdL: flashlight(.9), smile: 1 } });
  else { const fl = t < 155.2 ? '4' : t < 156.69 ? '4' : t < 157.4 ? '3' : t < 158.1 ? '2' : '1';
    g.save(); g.translate(W / 2, 880); rr(g, -260, -230, 520, 460, 20); fs(g, '#151a19', 9); g.font = '300px BB'; g.textAlign = 'center'; g.textBaseline = 'middle'; g.shadowColor = '#ff3b30'; g.shadowBlur = 40; g.fillStyle = '#ff3b30'; g.fillText(fl, 40, 20);
    if (t > 156.69) { const a = Math.floor(t * 3) % 2; poly(g, [[-150, a ? 40 : 30], [-90, a ? -40 : -50], [-210, a ? -40 : -50]], '#ff3b30', 0); } g.restore(); }
}, 'push', .3);
// 12. Continuará
scene(158.80, (g, t, lt) => {
  g.fillStyle = '#060808'; g.fillRect(0, 0, W, H); const rg = g.createRadialGradient(W / 2, 820, 0, W / 2, 820, 700); rg.addColorStop(0, 'rgba(60,110,90,.35)'); rg.addColorStop(1, 'rgba(0,0,0,0)'); g.fillStyle = rg; g.fillRect(0, 0, W, H);
  for (let i = 0; i < 60; i++) { g.fillStyle = `rgba(200,240,220,${.2 + srnd(i) * .4})`; g.fillRect((srnd(i) * W + t * 15) % W, (srnd(i + 9) * H - t * 25 * (srnd(i + 3) + .3) + H * 9) % H, 4, 4); }
  const k = prog(lt, 0, .8); g.save(); g.globalAlpha = k; g.font = '900 120px CZ'; g.textAlign = 'center'; g.textBaseline = 'middle'; g.shadowColor = '#9dffb0'; g.shadowBlur = 40; g.fillStyle = '#d9f2e0'; g.fillText('CONTINUARÁ', W / 2, 760); g.restore();
  g.save(); g.globalAlpha = prog(lt, .4, 1); bigText(g, 'PARTE 3 · EL FINAL', W / 2, 900, 90, '#ffffff', 1, 'BB'); g.restore();
  if (lt > 1.67) bigText(g, 'SÍGUEME PARA NO PERDÉRTELA', W / 2, 1010, 64, '#ff4a3d', eback(prog(lt, 1.67, 1.95)), 'BB');
}, 'fade', .5);
