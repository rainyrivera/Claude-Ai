// ================= TU TELÉFONO SE CALIENTA =================
const K = { hook: PS(0), danar: PS(1), espera: PS(2), nodan: PS(3), trabajar: PS(4), explico: PS(5), dentro: PS(6), fino: PS(7), despacio: PS(8), suma: PS(9), acumula: PS(10), protege: PS(11), lento: PS(12),
  p1: PS(13), descon: PS(14), p2: PS(15), funda: PS(16), p3: PS(17), sol: PS(18), carro: PS(19), p4: PS(20), cierra: PS(21), p5: PS(22), brillo: PS(23), p6: PS(24), juegues: PS(25), cargar: PS(26),
  p7: PS(27), cargador: PS(28), danado: PS(29), p8: PS(30), actual: PS(31), sigue: PS(32), tecnico: PS(33), hora: PS(34), leo: PS(35) };
(function () { const x = WT.x; x.fillStyle = '#f3e6cf'; x.fillRect(0, 0, 1024, 406); x.fillStyle = '#fff'; rrp(x, 0, pxx(.75), py(.62), 34, 48, 6); x.fill(); x.fillStyle = '#9fd6f2'; x.fillRect(pxx(-2.6), py(2.0), 150, 120); x.strokeStyle = '#fff'; x.lineWidth = 10; x.strokeRect(pxx(-2.6), py(2.0), 150, 120); WT.tx.needsUpdate = true; })();
// mesa
const woodM = lp(0x9a6a40); { const TB = add(new THREE.Group()); TB.position.set(.6, 0, -.7); const top = M(new THREE.BoxGeometry(1.5, .07, .8), woodM); top.position.y = .8; TB.add(top); for (const [a, b] of [[-.68, -.34], [.68, -.34], [-.68, .34], [.68, .34]]) { const l = M(new THREE.BoxGeometry(.07, .78, .07), woodM); l.position.set(a, .4, b); TB.add(l); } }
// ---- celular en la mesa ----
const PHS = canvasTex(256, 512);
const phone = add(new THREE.Group()); phone.position.set(.6, .84, -.72); phone.rotation.x = -.12;
{ const body = rbox(.36, .72, .05, .02, mat(0x1b1e27, { roughness: .35 })); body.position.y = .36; phone.add(body); const scr = M(new THREE.PlaneGeometry(.32, .66), new THREE.MeshBasicMaterial({ map: PHS.tx, color: 0xdddddd, toneMapped: false }), false); scr.position.set(0, .36, .036); phone.add(scr); }
const heatM = new THREE.MeshBasicMaterial({ color: 0xff3b2f, transparent: true, opacity: 0, depthWrite: false, blending: THREE.AdditiveBlending }); const heatShell = M(new THREE.BoxGeometry(.46, .82, .06), heatM, false); heatShell.position.set(0, .36, -.015); phone.add(heatShell);
const caseM = lp(0xff8a3d); const caseG = new THREE.Group(); { const c = rbox(.4, .76, .07, .03, caseM); c.position.set(0, .36, -.015); caseG.add(c); } phone.add(caseG);
const stand = add(M(new THREE.BoxGeometry(.3, .05, .2), lp(0x666a75))); stand.position.set(.6, .835, -.66);
const cableM = lp(0xf2f2f2); let cableMesh = null; function setCable(p0, p1, sag = .3) { if (cableMesh) { scene.remove(cableMesh); cableMesh.geometry.dispose(); } const mid = p0.clone().lerp(p1, .5); mid.y -= sag; cableMesh = add(M(new THREE.TubeGeometry(new THREE.CatmullRomCurve3([p0, mid, p1]), 24, .012, 6), cableM, false)); }
const plugS = add(rbox(.06, .1, .035, .01, cableM));
const fray = add(M(new THREE.TorusGeometry(.03, .012, 6, 10), lp(0xb87333))); const sparkM = new THREE.MeshBasicMaterial({ color: 0xfff3a0, transparent: true, blending: THREE.AdditiveBlending, depthWrite: false }); const spark = add(new THREE.Mesh(new THREE.IcosahedronGeometry(.04, 0), sparkM));
// íconos de apps flotando
function appTex(col, glyph) { const c = canvasTex(96, 96), x = c.x; x.fillStyle = col; rrp(x, 0, 4, 4, 88, 88, 20); x.fill(); x.fillStyle = '#fff'; x.font = '900 46px M'; x.textAlign = 'center'; x.textBaseline = 'middle'; x.fillText(glyph, 48, 52); c.tx.needsUpdate = true; return new THREE.SpriteMaterial({ map: c.tx, transparent: true }); }
const apps = [['#ff4d61', '▶'], ['#3d8bff', 'f'], ['#35d39a', '✆'], ['#a98bff', '♫'], ['#f6b445', '★'], ['#1aa86a', '⌖'], ['#ff8a3d', '◎'], ['#6cc4ff', '✉'], ['#e8383a', '♥'], ['#2a2c33', '♪']].map(([c, gl]) => { const s = new THREE.Sprite(appTex(c, gl)); s.scale.set(.16, .16, 1); scene.add(s); return s; });
// termómetro
const thermo = add(new THREE.Group()); { const tube = M(new THREE.CylinderGeometry(.05, .05, .7, 16), new THREE.MeshStandardMaterial({ color: 0xffffff, transparent: true, opacity: .45 })); tube.position.y = .35; const bulb = M(new THREE.SphereGeometry(.09, 16, 12), new THREE.MeshStandardMaterial({ color: 0xff3b2f, emissive: 0xff3b2f, emissiveIntensity: .8 })); thermo.add(tube, bulb); }
const thFillM = new THREE.MeshStandardMaterial({ color: 0xff3b2f, emissive: 0xff3b2f, emissiveIntensity: .8 }); const thFill = M(new THREE.CylinderGeometry(.03, .03, .66, 10), thFillM, false); thermo.add(thFill);
const heatP = parts(16, new THREE.MeshBasicMaterial({ color: 0xff8a3d, transparent: true, opacity: .7 }), .03);
// ---- tablero del carro ----
const CX = -30; add(M(new THREE.CylinderGeometry(4.2, 4.4, .4, 40), lp(0xd6dbe4))).position.set(CX, -.2, 0);
const dash = add(new THREE.Group()); dash.position.set(CX, 0, 0); { const d = M(new THREE.BoxGeometry(3.2, .5, 1.0), lp(0x2a2c33)); d.position.set(0, 1.1, -.4); const ws = M(new THREE.BoxGeometry(3.2, 1.4, .04), new THREE.MeshStandardMaterial({ color: 0x9fd0ef, transparent: true, opacity: .35 })); ws.position.set(0, 1.95, -.95); ws.rotation.x = -.5; const wh = M(new THREE.TorusGeometry(.32, .05, 8, 24), lp(0x1b1e27)); wh.position.set(-.8, 1.25, .25); wh.rotation.x = -.9; const col = M(new THREE.BoxGeometry(.1, .1, .5), lp(0x1b1e27)); col.position.set(-.8, 1.15, 0); dash.add(d, ws, wh, col); }
const dashPh = add(new THREE.Group()); { const b = rbox(.36, .72, .05, .02, mat(0x1b1e27)); b.rotation.x = -Math.PI / 2 + .1; dashPh.add(b); } dashPh.position.set(CX + .5, 1.38, -.4);
const dashHeatM = new THREE.MeshBasicMaterial({ color: 0xff3b2f, transparent: true, opacity: 0, blending: THREE.AdditiveBlending, depthWrite: false }); const dashHeat = M(new THREE.BoxGeometry(.44, .1, .8), dashHeatM, false); dashPh.add(dashHeat);
const sunS = add(M(new THREE.SphereGeometry(.6, 20, 12), new THREE.MeshBasicMaterial({ color: 0xfff1a0 }), false)); sunS.position.set(CX + 1.6, 4.3, -4.5);
const beamM = new THREE.MeshBasicMaterial({ color: 0xfff2b0, transparent: true, opacity: .22, depthWrite: false, blending: THREE.AdditiveBlending }); const beam = add(new THREE.Mesh(new THREE.CylinderGeometry(.3, .7, 3.2, 20, 1, true), beamM)); beam.position.set(CX + .8, 2.8, -1.1); beam.rotation.z = .35; beam.rotation.x = .3;
// ---- diorama: el celular por dentro ----
const X0 = 30; add(M(new THREE.CylinderGeometry(4.2, 4.4, .4, 40), lp(0xd6dbe4))).position.set(X0, -.2, 0);
const MAC = add(new THREE.Group()); MAC.position.set(X0, 2.5, 0);
{ const shell = M(new THREE.BoxGeometry(2.0, 3.8, .25), lp(0x2b2f3a)); shell.position.z = -.2; MAC.add(shell); const rim = M(new THREE.BoxGeometry(2.1, 3.9, .1), lp(0x3a3f4c)); rim.position.z = -.35; MAC.add(rim); const pcb = M(new THREE.BoxGeometry(1.7, 1.3, .06), lp(0x1f7a4a)); pcb.position.set(0, 1.1, -.05); MAC.add(pcb); }
const chipM = new THREE.MeshStandardMaterial({ color: 0x2a2c33, emissive: 0xff3b2f, emissiveIntensity: 0 }); const chip = M(new THREE.BoxGeometry(.6, .6, .1), chipM); chip.position.set(-.2, 1.15, .02); MAC.add(chip);
const batM2 = new THREE.MeshStandardMaterial({ color: 0x4a5160, emissive: 0xff3b2f, emissiveIntensity: 0 }); const bat2 = rbox(1.6, 1.9, .14, .05, batM2); bat2.position.set(0, -.7, 0); MAC.add(bat2);
{ const lc = canvasTex(256, 64); lc.x.fillStyle = '#fff'; lc.x.font = '900 40px M'; lc.x.textAlign = 'center'; lc.x.textBaseline = 'middle'; lc.x.fillText('BATERÍA', 128, 34); lc.tx.needsUpdate = true; const l = M(new THREE.PlaneGeometry(.9, .22), new THREE.MeshBasicMaterial({ map: lc.tx, transparent: true }), false); l.position.set(0, -.7, .13); MAC.add(l);
  const lc2 = canvasTex(256, 64); lc2.x.fillStyle = '#fff'; lc2.x.font = '900 36px M'; lc2.x.textAlign = 'center'; lc2.x.textBaseline = 'middle'; lc2.x.fillText('PROCESADOR', 128, 34); lc2.tx.needsUpdate = true; const l2 = M(new THREE.PlaneGeometry(.9, .22), new THREE.MeshBasicMaterial({ map: lc2.tx, transparent: true }), false); l2.position.set(-.2, 1.65, .1); MAC.add(l2); }
const macP = parts(22, new THREE.MeshBasicMaterial({ color: 0xff6a3d, transparent: true, opacity: .75 }), .06);
const macL = new THREE.PointLight(0xfff4e0, 0, 14, 1.2); macL.position.set(X0 + .5, 3.5, 4); scene.add(macL);
const fanX = add(new THREE.Group()); fanX.position.set(X0 + 1.7, 3.6, .2); { for (let i = 0; i < 3; i++) { const b = M(new THREE.BoxGeometry(.12, .4, .03), lp(0x6cc4ff)); b.position.y = .2; const h = new THREE.Group(); h.rotation.z = i * 2.094; h.add(b); fanX.add(h); } const x1 = M(new THREE.BoxGeometry(1.0, .1, .05), new THREE.MeshBasicMaterial({ color: 0xff4d61 }), false); x1.rotation.z = .785; x1.position.z = .05; const x2 = x1.clone(); x2.rotation.z = -.785; fanX.add(x1, x2); }
// ---- pantalla del teléfono ----
function heat(t) { // 0 frío … 1 muy caliente
  if (t < K.p1) return clamp(.7 + .3 * P(t, 0, 3));
  if (t < K.sigue) return clamp(1 - (t - K.p1) / (K.sigue - K.p1) * .85);
  if (t < K.hora) return .55; return .1;
}
function drawPhone(t, h) {
  const x = PHS.x; x.fillStyle = '#0d1730'; x.fillRect(0, 0, 256, 512); x.textAlign = 'center'; x.textBaseline = 'middle';
  const dim = inn(t, K.lento + 1, K.p1) ? .55 : inn(t, K.brillo, K.p6) ? .7 : 0;
  if (inn(t, K.protege, K.p1)) { x.fillStyle = '#fff'; rrp(x, 0, 20, 150, 216, 200, 20); x.fill(); x.fillStyle = '#e8383a'; x.font = '900 72px M'; x.fillText('🌡'.length > 1 ? '!' : '!', 128, 205); x.fillStyle = '#2a2c33'; x.font = '800 22px M'; x.fillText('El teléfono necesita', 128, 270); x.fillText('enfriarse', 128, 298); }
  else if (inn(t, K.p4, K.p5)) { const k = clamp((t - K.cierra) / 2.2); for (let i = 0; i < 4; i++) { const gone = k > i * .25; x.fillStyle = ['#ff4d61', '#3d8bff', '#35d39a', '#a98bff'][i]; rrp(x, 0, 40 + (gone ? 400 : 0), 60 + i * 105, 176, 90, 14); x.fill(); } }
  else if (inn(t, K.p5, K.p6)) { x.fillStyle = '#fff'; x.font = '800 22px M'; x.textAlign = 'left'; const rows = ['Brillo', 'GPS', 'Bluetooth', 'WiFi']; rows.forEach((r, i) => { const y = 90 + i * 90; x.fillStyle = '#fff'; x.fillText(r, 24, y); const on = t < K.brillo + 1.2 + i * .9; if (i === 0) { x.fillStyle = '#3a3f4c'; rrp(x, 0, 24, y + 22, 208, 14, 7); x.fill(); x.fillStyle = '#ffcc33'; rrp(x, 0, 24, y + 22, on ? 190 : 70, 14, 7); x.fill(); } else { x.fillStyle = on ? '#1aa86a' : '#5a6070'; rrp(x, 0, 168, y - 16, 64, 32, 16); x.fill(); x.fillStyle = '#fff'; x.beginPath(); x.arc(on ? 216 : 184, y, 13, 0, 6.29); x.fill(); } }); }
  else if (inn(t, K.p6, K.p7)) { x.fillStyle = '#35d39a'; x.fillRect(0, 300, 256, 212); x.fillStyle = '#ff4d61'; x.fillRect(100, 240, 50, 60); x.fillStyle = '#ffcc33'; x.beginPath(); x.arc(60 + ((t * 80) % 160), 200, 22, 0, 6.29); x.fill(); x.fillStyle = '#fff'; x.font = '900 30px M'; x.fillText('JUEGO', 128, 80); }
  else if (inn(t, K.p8, K.sigue)) { x.fillStyle = '#fff'; x.font = '800 24px M'; x.fillText('Actualizando…', 128, 200); x.fillStyle = '#3a3f4c'; rrp(x, 0, 28, 240, 200, 18, 9); x.fill(); x.fillStyle = '#35d39a'; rrp(x, 0, 28, 240, 200 * clamp((t - K.actual) / 3), 18, 9); x.fill(); }
  else { const tc = Math.round(30 + h * 15); x.fillStyle = h > .6 ? '#ff4d61' : h > .35 ? '#f6b445' : '#6cc4ff'; x.font = '900 64px M'; x.fillText(tc + '°', 128, 220); x.fillStyle = '#fff'; x.font = '700 22px M'; x.fillText(h > .6 ? 'MUY CALIENTE' : h > .35 ? 'TIBIO' : 'NORMAL', 128, 280); }
  if (dim) { x.fillStyle = `rgba(0,0,0,${dim})`; x.fillRect(0, 0, 256, 512); }
  PHS.tx.needsUpdate = true;
}
// ---- cámara ----
SHOTS = [
  [0, K.espera, [1.7, 1.7, 3.6], [1.3, 1.5, 2.9], [.4, 1.0, -.6], [.5, 1.0, -.7]],
  [K.espera, K.explico, [.9, 1.8, 4.2], [.6, 1.7, 3.8], [.0, 1.1, -.5], [.1, 1.1, -.5]],
  [K.explico, K.suma, [X0 + 1.2, 3.0, 8.0], [X0 + .4, 2.8, 7.0], [X0, 2.1, 0], [X0, 2.1, 0]],
  [K.suma, K.protege, [1.9, 1.8, 3.6], [1.5, 1.6, 3.0], [.5, 1.0, -.6], [.6, 1.0, -.7]],
  [K.protege, K.p1, [.6, 1.25, 1.6], [.6, 1.2, 1.3], [.6, .95, -.7], [.6, .95, -.7]],
  [K.p1, K.p3, [1.7, 1.6, 3.2], [1.4, 1.5, 2.8], [.6, .95, -.7], [.6, .95, -.7]],
  [K.p3, K.p4, [CX - .2, 2.7, 2.8], [CX - .1, 2.6, 2.4], [CX + .3, 1.6, -.8], [CX + .3, 1.6, -.8]],
  [K.p4, K.p6, [.7, 1.3, 1.9], [.65, 1.25, 1.6], [.6, .97, -.7], [.6, .97, -.7]],
  [K.p6, K.p8, [1.6, 1.6, 3.0], [1.4, 1.5, 2.7], [.6, .95, -.7], [.65, .95, -.7]],
  [K.p8, K.sigue, [.7, 1.3, 1.9], [.65, 1.25, 1.6], [.6, .97, -.7], [.6, .97, -.7]],
  [K.sigue, K.hora, [X0 - 1.0, 3.0, 7.6], [X0 - .4, 2.6, 6.6], [X0, 1.7, 0], [X0, 1.7, 0]],
  [K.hora, 200, [2.4, 2.2, 5.2], [2.0, 2.0, 4.4], [.3, 1.1, -.5], [.3, 1.2, -.5]],
];
function animWorld(t) {
  skyDay(t); const h = heat(t); drawPhone(t, h);
  const inMac = inn(t, K.explico, K.suma) || inn(t, K.sigue, K.hora); macL.intensity = inMac ? 3.4 : 0;
  heatM.opacity = h * .35 * (.75 + .25 * Math.sin(t * 6)); thermo.position.set(1.25, .86, -.6); thFill.scale.y = Math.max(.05, h); thFill.position.y = .02 + .33 * h; thFillM.color.set(h > .5 ? 0xff3b2f : 0x6cc4ff); thFillM.emissive.set(h > .5 ? 0xff3b2f : 0x6cc4ff);
  for (let i = 0; i < 16; i++) { const u = (t * .6 + i / 16) % 1; setP(heatP, i, .6 + Math.sin(i * 2.1 + t) * .15, 1.62 + u * .7, -.72, h > .45 && !inMac, 1 - u * .5); } heatP.instanceMatrix.needsUpdate = true;
  // funda
  const caseOff = t >= K.funda + .3 ? eio(P(t, K.funda + .3, .8)) : 0; caseG.position.set(caseOff * .7, caseOff * .3, -caseOff * .3); caseG.visible = caseOff < 1 || t < K.p3;
  if (t >= K.p3) caseG.visible = false;
  // cargador: conectado hasta el paso 1; vuelve en el paso 6 (juego) y paso 7 (cable)
  const plugged = (t < K.descon + .6) || inn(t, K.juegues, K.cargar + 3) || inn(t, K.cargador, K.p8);
  const pIn = plugged ? V(.6, .84, -.72) : V(1.05, .84, -.45); plugS.position.copy(pIn).add(V(0, plugged ? -.04 : .02, 0)); plugS.rotation.set(plugged ? 0 : Math.PI / 2, 0, plugged ? 0 : .5);
  setCable(pIn.clone().add(V(0, -.08, 0)), V(.75, .5, -1.79), .35);
  fray.visible = inn(t, K.danado, K.p8); fray.position.set(.85, .58, -1.2); spark.visible = fray.visible && Math.sin(t * 40) > 0; spark.position.set(.86, .6, -1.18); spark.scale.setScalar(.6 + Math.random());
  // apps flotando
  apps.forEach((s, i) => { const a = i / 10 * 6.28 + t * .6; const show = inn(t, K.suma + 1.5, K.protege) || inn(t, K.p4, K.cierra + .3 + i * .22); s.visible = show; s.position.set(.6 + Math.cos(a) * .55, 1.15 + Math.sin(a * 1.3) * .25, -.6 + Math.sin(a) * .3); });
  // carro
  dashHeatM.opacity = inn(t, K.p3, K.p4) && t < K.carro + 2.5 ? .35 + .15 * Math.sin(t * 6) : 0; dashPh.position.x = t > K.carro + 2.5 ? CX - 2.5 : CX + .5; beamM.opacity = .22;
  // diorama
  const hm = t >= K.sigue ? .9 : inn(t, K.dentro, K.suma) ? .9 * P(t, K.dentro, 2) : 0; chipM.emissiveIntensity = hm * (1 + .3 * Math.sin(t * 7)); batM2.emissiveIntensity = hm * .6;
  const swell = t >= K.sigue + 2.5 ? 1 + .15 * eout(P(t, K.sigue + 2.5, .8)) : 1; bat2.scale.set(1, 1, swell * 1.6 - .6);
  for (let i = 0; i < 22; i++) { const u = (t * .35 + i / 22) % 1; const sx = (i % 2 ? -.2 : 0) + Math.sin(i * 3.1) * .6; setP(macP, i, X0 + sx * (1 + u), 2.5 + (i % 2 ? 1.15 : -.7) + u * 1.6, .3 + u * .4, inMac && (t < K.fino || inn(t, K.sigue, K.hora)) || inn(t, K.fino, K.suma) && u < .35, 1); } macP.instanceMatrix.needsUpdate = true;
  fanX.visible = inn(t, K.fino, K.suma);
  // ---- personajes ----
  let op = [-.35, 0, -.1], ory = .4, p = { emo: 'worried' }, ev = false, ep = [1.75, 0, -.25], ery = -.8, e = { emo: 'neutral' };
  const point = (a = -2.3) => ({ armR: [a, -.3, -.2], armL: [-.2, .15, -.3] }), reach = { armR: [-1.4, -.2, -.6], armL: [-.2, .15, -.3], look: [.6, -.3] };
  if (t < K.espera) { p = { emo: t > K.danar ? 'sad' : 'surprised', ...(Math.sin(t * 3) > .3 ? reach : { armR: [-.9, -.2, -.3], armL: [-.2, .15, -.3] }), headRy: .4 }; }
  else if (t < K.explico) { p = { emo: 'surprised', headRy: .9 }; ev = true; e = { emo: t > K.nodan ? 'happy' : 'determined', armR: [-2.6, -.4, -.2], armL: [-.4, .2, -.3] }; }
  else if (t < K.suma) { op = [X0 - 1.6, 0, 1.4]; ory = .5; p = { emo: 'neutral', ...point(-1.9) }; ev = true; ep = [X0 + 1.6, 0, 1.4]; ery = -.5; e = { emo: 'determined', ...point(-2.0) }; }
  else if (t < K.p3) { p = { emo: t < K.p1 ? 'worried' : 'determined', ...reach, headRy: .4 }; }
  else if (t < K.p4) { op = [CX - 1.3, 0, .9]; ory = .7; p = { emo: t > K.carro + 2.5 ? 'happy' : 'determined', ...point(-1.8) }; }
  else if (t < K.sigue) { p = { emo: 'determined', ...reach, headRy: .4 }; ev = inn(t, K.cargador, K.p8); e = { emo: 'determined', ...point(-1.8) }; }
  else if (t < K.hora) { op = [X0 - 1.6, 0, 1.4]; ory = .5; p = { emo: 'worried', ...point(-1.9) }; ev = true; ep = [X0 + 1.6, 0, 1.4]; ery = -.5; e = { emo: 'determined', armL: [-1.3, .3, -.6], armR: [-2.0, -.3, -.2] }; }
  else { op = [-.5, 0, .2]; ory = .3; p = { emo: 'happy', armR: [-2.6, -.35, -.2 + .3 * Math.sin(t * 8)], armL: [-.2, .15, -.3] }; ev = true; ep = [1.6, 0, .3]; ery = -.4; e = { emo: 'happy', armL: [-.9, .3, -.6] }; }
  owner.root.position.set(...op); owner.root.rotation.y = ory; pose(owner, p, t);
  eng.root.visible = ev; eng.root.position.set(...ep); eng.root.rotation.y = ery; pose(eng, e, t + 1.3); wrench.visible = false; engCB.visible = true;
  // etiquetas
  OVL.length = 0; const Lb = (text, at, end, pos, color = '#ffcc33') => { if (t >= at && t < end) OVL.push({ text, at, end, pos, color }); };
  const TOPH = V(.6, 2.3, -.7), TOPM = V(X0, 4.9, 0);
  Lb('¡SE CALIENTA!', .1, K.danar, TOPH, '#ff6a4a'); Lb('¿SE VA A DAÑAR?', K.danar, K.espera, TOPH); Lb('¡ESPERA!', K.espera, K.nodan, TOPH, '#ff6a4a'); Lb('CASI SIEMPRE NO', K.nodan, K.trabajar, TOPH, '#7be36b'); Lb('TRABAJA DE MÁS', K.trabajar, K.explico, TOPH, '#ff8a4a');
  Lb('PROCESADOR + BATERÍA = CALOR', K.dentro, K.fino, TOPM, '#ff8a4a'); Lb('NO TIENE ABANICO', K.fino, K.suma, TOPM, '#ff6a4a');
  Lb('SOL · FUNDA · CARGADOR · APPS', K.suma, K.protege, TOPH, '#ff6a4a'); Lb('SE PROTEGE SOLO', K.protege, K.p1, V(.6, 1.6, -.7), '#6cc4ff');
  Lb('PASO 1: DESCONÉCTALO', K.p1, K.p2, TOPH); Lb('PASO 2: QUÍTALE LA FUNDA', K.p2, K.p3, TOPH); Lb('PASO 3: FUERA DEL SOL', K.p3, K.carro, V(CX, 3.4, -.4)); Lb('✖ TABLERO AL SOL', K.carro, K.p4, V(CX, 3.4, -.4), '#ff6a4a');
  Lb('PASO 4: CIERRA APPS', K.p4, K.p5, V(.6, 1.6, -.7)); Lb('PASO 5: BRILLO Y AJUSTES', K.p5, K.p6, V(.6, 1.6, -.7)); Lb('PASO 6: ✖ JUGAR CARGANDO', K.p6, K.p7, TOPH, '#ff6a4a'); Lb('PASO 7: CABLE BUENO', K.p7, K.danado, TOPH); Lb('✖ CABLE DAÑADO', K.danado, K.p8, TOPH, '#ff6a4a');
  Lb('PASO 8: ACTUALIZA', K.p8, K.sigue, V(.6, 1.6, -.7)); Lb('¿SIGUE CALIENTE?', K.sigue, K.sigue + 2.5, TOPM, '#ff8a4a'); Lb('¿BATERÍA HINCHADA?', K.sigue + 2.5, K.tecnico, TOPM, '#ff6a4a'); Lb('LLÉVALO A UN TÉCNICO', K.tecnico, K.hora, TOPM, '#7be36b');
  Lb('¿A QUÉ HORA SE CALIENTA?', K.hora + .1, CTA_ST, V(.3, 3.0, -.5), '#ff8a4a');
}
function overlay2d(t) {}
const KEYW = new Set(['calienta', 'dañar', 'malo', 'trabajar', 'procesador', 'batería', 'calor', 'abanico', 'despacio', 'sol', 'funda', 'cargador', 'aplicaciones', 'protege', 'enfriarse', 'desconéctalo', 'quítale', 'carro', 'tablero', 'cierra', 'brillo', 'gps', 'bluetooth', 'wifi', 'juegues', 'videos', 'carga', 'cable', 'dañado', 'actualizados', 'hinchada', 'técnico', 'comentarios']);
