// ================= ¿TE COBRAN LUZ DE MÁS? Lee tu contador =================
const K = { recibo: PS(0), contador: PS(1), revisas: PS(2), explico: PS(3), cuenta: PS(4), anota: PS(5), resta: PS(6), mal: PS(7), mas: PS(8), p1: PS(9), busca: PS(10), actual: PS(11), p2: PS(12), foto: PS(13), fecha: PS(14),
  p3: PS(15), compara: PS(16), menos: PS(17), cobraron: PS(18), p4: PS(19), estimada: PS(20), nadie: PS(21), p5: PS(22), vecino: PS(23), apaga: PS(24), corriendo: PS(25), cable: PS(26), p6: PS(27), reclama: PS(28), protecom: PS(29), calc: PS(30),
  ojo: PS(31), toques: PS(32), sigue: PS(33), electricista: PS(34), ya: PS(35), leo: PS(36) };
(function () { const x = WT.x; x.fillStyle = '#f3e6cf'; x.fillRect(0, 0, 1024, 406); x.fillStyle = '#9fd6f2'; x.fillRect(pxx(.4), py(2.05), 200, 130); x.strokeStyle = '#fff'; x.lineWidth = 10; x.strokeRect(pxx(.4), py(2.05), 200, 130);
  x.fillStyle = '#ffffff'; rrp(x, 0, pxx(-2.9), py(.6), 30, 44, 6); x.fill(); WT.tx.needsUpdate = true; })();
// ---- interior: TV, nevera, lámpara, abanico ----
const TVS = canvasTex(256, 144);
const tv = add(new THREE.Group()); tv.position.set(-1.4, 1.45, -1.78); { const b = rbox(1.3, .76, .07, .02, lp(0x16181f)); const s = M(new THREE.PlaneGeometry(1.2, .66), new THREE.MeshStandardMaterial({ map: TVS.tx, emissive: 0xffffff, emissiveMap: TVS.tx, emissiveIntensity: 1 }), false); s.position.z = .04; tv.add(b, s); }
const fridge = add(rbox(.75, 1.7, .7, .06, lp(0xf4f6fa))); fridge.position.set(2.6, 1.0, -1.35);
const fridgeLed = add(M(new THREE.BoxGeometry(.12, .05, .02), new THREE.MeshStandardMaterial({ color: 0x35d39a, emissive: 0x35d39a, emissiveIntensity: 2 }), false)); fridgeLed.position.set(2.6, 1.5, -.99);
const lamp = add(M(new THREE.SphereGeometry(.14, 16, 12), new THREE.MeshStandardMaterial({ color: 0xfff6d8, emissive: 0xfff1c0, emissiveIntensity: 2 }), false)); lamp.position.set(0, 2.62, 0);
const fan = add(new THREE.Group()); fan.position.set(-.2, 0, -.9); { const st = M(new THREE.CylinderGeometry(.03, .03, 1.1, 8), lp(0xdfe3ea)); st.position.y = .7; const base = M(new THREE.CylinderGeometry(.2, .22, .05, 16), lp(0xdfe3ea)); base.position.y = .17; fan.add(st, base); }
const fanHead = new THREE.Group(); fanHead.position.y = 1.3; fan.add(fanHead); for (let i = 0; i < 3; i++) { const b = M(new THREE.BoxGeometry(.08, .32, .02), lp(0x6cc4ff)); b.position.y = .16; const h = new THREE.Group(); h.rotation.z = i * 2.094; h.add(b); fanHead.add(h); }
// ---- contador en un poste, frente a la casa ----
const MT = canvasTex(256, 384);
const meter = add(new THREE.Group()); meter.position.set(4.35, 0, 1.0);
{ const post = M(new THREE.BoxGeometry(.18, 1.7, .18), lp(0x9a9c9f)); post.position.y = .85; meter.add(post);
  const box = rbox(.62, .86, .3, .05, mat(0xc9ced8, { metalness: .3, roughness: .5 })); box.position.set(0, 1.35, .14); meter.add(box);
  const face = M(new THREE.PlaneGeometry(.5, .75), new THREE.MeshStandardMaterial({ map: MT.tx, emissive: 0xffffff, emissiveMap: MT.tx, emissiveIntensity: .55, roughness: .2 }), false); face.position.set(0, 1.35, .3); meter.add(face); }
const meterGlowM = new THREE.MeshBasicMaterial({ color: 0xff4d61, transparent: true, opacity: 0, depthWrite: false }); const meterGlow = M(new THREE.PlaneGeometry(.8, 1.05), meterGlowM, false); meterGlow.position.set(0, 1.35, .27); meter.add(meterGlow);
const pole = add(M(new THREE.CylinderGeometry(.09, .12, 5.2, 8), lp(0x8a6a48))); pole.position.set(6.3, 2.6, -1.6);
const cross = add(M(new THREE.BoxGeometry(1.2, .08, .08), lp(0x8a6a48))); cross.position.set(6.3, 5.0, -1.6);
function wire(pts, col = 0x1d1f25, r = .02) { return add(M(new THREE.TubeGeometry(new THREE.CatmullRomCurve3(pts.map(p => V(...p))), 40, r, 6), new THREE.MeshStandardMaterial({ color: col, emissive: col, emissiveIntensity: 0 }), false)); }
wire([[5.8, 5.0, -1.6], [5.0, 3.6, -.3], [4.35, 2.3, .9], [4.35, 1.8, 1.0]]); wire([[4.35, 1.6, .95], [3.9, 2.0, .6], [3.4, 2.5, .2]]);
// casa del vecino y conexión ilegal
const nh = add(new THREE.Group()); nh.position.set(8.6, 0, -.8); { const b = M(new THREE.BoxGeometry(2.6, 2.3, 2.4), lp(0xe7c9a0)); b.position.y = 1.15; const rf = M(new THREE.BoxGeometry(2.8, .2, 2.6), lp(0x9a9ea6)); rf.position.y = 2.4; nh.add(b, rf); }
const nWinM = new THREE.MeshStandardMaterial({ color: 0x9fd3e6, emissive: 0xffd27a, emissiveIntensity: 0 }); const nWin = M(new THREE.BoxGeometry(.7, .6, .05), nWinM, false); nWin.position.set(8.6, 1.4, .42); scene.add(nWin);
const tap = wire([[5.05, 3.75, -.45], [6.5, 3.2, -.2], [7.6, 2.6, -.1], [8.0, 2.0, .2]], 0xff4d61, .028);
const bad = parts(10, 0xff4d61, .05);
const spk = add(new THREE.Mesh(new THREE.IcosahedronGeometry(.06, 0), new THREE.MeshBasicMaterial({ color: 0xfff3a0, transparent: true, blending: THREE.AdditiveBlending, depthWrite: false })));
// celular de la foto (en la mano del dueño)
const cam3 = add(rbox(.12, .22, .02, .01, lp(0x1b1e27)));
// ---- números ----
const PREV = 4210, BILLR = 4650, READ0 = 4580;
function reading(t) { return READ0 + (t > K.corriendo ? Math.floor((t - K.corriendo) * 1.6) : 0); }
function spinRate(t) { if (inn(t, K.apaga + 1.5, K.corriendo)) return 0; if (t >= K.corriendo && t < K.p6) return 2.2; return 1; }
let discA = 0, lastT = 0;
function drawMeter(t) {
  const x = MT.x; x.fillStyle = '#e9edf3'; x.fillRect(0, 0, 256, 384); x.fillStyle = '#1b1e27'; rrp(x, 0, 18, 40, 220, 96, 10); x.fill();
  const r = String(reading(t)).padStart(5, '0'); x.font = '700 64px J'; x.textAlign = 'center'; x.textBaseline = 'middle';
  for (let i = 0; i < 5; i++) { x.fillStyle = i === 4 ? '#ff4d61' : '#ffffff'; x.fillText(r[i], 46 + i * 41, 90); }
  x.fillStyle = '#1b1e27'; x.font = '900 30px M'; x.fillText('kWh', 128, 170);
  x.fillStyle = '#c7ccd6'; rrp(x, 0, 18, 210, 220, 60, 10); x.fill(); x.fillStyle = '#9aa1ad'; x.fillRect(18, 236, 220, 8);
  const mk = ((discA % 1) + 1) % 1; x.fillStyle = '#ff4d61'; x.fillRect(18 + mk * 200, 222, 20, 36);
  x.fillStyle = '#6a7180'; x.font = '700 22px M'; x.fillText('CONTADOR', 128, 320); MT.tx.needsUpdate = true;
}
function drawTV(on) { const x = TVS.x; if (!on) { x.fillStyle = '#050608'; x.fillRect(0, 0, 256, 144); } else { const gr = x.createLinearGradient(0, 0, 256, 144); gr.addColorStop(0, '#3d8bff'); gr.addColorStop(1, '#a98bff'); x.fillStyle = gr; x.fillRect(0, 0, 256, 144); x.fillStyle = '#ffcc33'; x.beginPath(); x.arc(170, 60, 26, 0, 6.29); x.fill(); x.fillStyle = '#35d39a'; x.fillRect(0, 105, 256, 39); } TVS.tx.needsUpdate = true; }
// ---- cámara ----
const MP = V(4.35, 1.35, 1.0);
SHOTS = [
  [0, K.contador, [2.4, 2.2, 7.6], [3.1, 1.9, 6.4], [2.4, .55, .2], [3.0, .55, .4]],
  [K.contador, K.explico, [5.0, 1.7, 4.6], [4.7, 1.6, 4.2], [4.35, .85, 1.0], [4.35, .87, 1.0]],
  [K.explico, K.anota, [4.8, 1.6, 4.3], [4.5, 1.55, 4.0], [4.35, .85, 1.0], [4.35, .85, 1.0]],
  [K.anota, K.mal, [6.6, 2.4, 6.2], [5.8, 2.2, 5.4], [4.6, .7, .8], [4.4, .7, .8]],
  [K.mal, K.p1, [3.4, 3.6, 9.6], [2.6, 3.3, 8.8], [3.0, .9, .2], [3.0, .9, .2]],
  [K.p1, K.p2, [1.2, 2.2, 6.4], [1.0, 2.1, 5.8], [1.0, 1.4, -.5], [1.0, 1.4, -.5]],
  [K.p2, K.p3, [5.6, 1.8, 4.4], [5.1, 1.7, 3.6], [4.2, .95, .9], [4.25, .95, .9]],
  [K.p3, K.p4, [4.9, 1.6, 4.5], [4.6, 1.55, 4.1], [4.35, .85, 1.0], [4.35, .85, 1.0]],
  [K.p4, K.p5, [1.4, 2.3, 6.6], [1.1, 2.2, 6.0], [1.4, 1.3, -.5], [1.4, 1.3, -.5]],
  [K.p5, K.corriendo, [0, 2.0, 6.4], [-.3, 1.9, 5.6], [0, .9, -1.0], [0, .9, -1.0]],
  [K.corriendo, K.cable, [4.8, 1.6, 4.4], [4.55, 1.55, 4.0], [4.35, .85, 1.0], [4.35, .85, 1.0]],
  [K.cable, K.p6, [7.0, 3.6, 7.8], [7.3, 3.4, 7.0], [7.2, 1.9, -.3], [7.3, 2.0, -.3]],
  [K.p6, K.ojo, [2.6, 2.2, 7.2], [2.2, 2.0, 6.4], [2.6, .8, .4], [2.6, .8, .4]],
  [K.ojo, K.electricista, [5.2, 1.7, 4.6], [4.9, 1.6, 4.1], [4.35, .85, 1.0], [4.35, .85, 1.0]],
  [K.electricista, K.ya, [5.8, 2.0, 4.6], [5.4, 1.9, 4.0], [4.5, .8, .9], [4.5, .85, .9]],
  [K.ya, 200, [3.0, 3.4, 10.4], [2.6, 3.0, 9.4], [2.4, .9, 0], [2.4, 1.0, 0]],
];
function animWorld(t) {
  skyDay(t);
  // contador
  discA += (t - lastT) * .6 * spinRate(t) * (t >= lastT ? 1 : 0); if (t < lastT || t - lastT > 1) discA = t * .6; lastT = t; drawMeter(t);
  const allOff = inn(t, K.apaga + 1.5, K.p6);
  drawTV(!allOff); ceilL.intensity = allOff ? .4 : 5; lamp.material.emissiveIntensity = allOff ? 0 : 2; fridgeLed.material.emissiveIntensity = allOff ? 0 : 2;
  fanHead.rotation.z = allOff ? fanHead.rotation.z : t * 14;
  meterGlowM.opacity = inn(t, K.toques, K.sigue) ? .25 + .2 * Math.sin(t * 9) : inn(t, K.corriendo, K.cable) ? .18 + .15 * Math.sin(t * 9) : 0;
  // conexión del vecino
  const thief = inn(t, K.cable + 1.2, K.p6); tap.visible = thief; tap.material.emissiveIntensity = thief ? 1 + .6 * Math.sin(t * 8) : 0; nWinM.emissiveIntensity = thief ? 1.5 : .0;
  for (let i = 0; i < 10; i++) { const u = (t * .8 + i / 10) % 1; const p = [V(5.05, 3.75, -.45), V(6.5, 3.2, -.2), V(7.6, 2.6, -.1), V(8.0, 2.0, .2)]; const s = u * 3, k = Math.min(2, Math.floor(s)); const q = p[k].clone().lerp(p[k + 1], s - k); setP(bad, i, q.x, q.y, q.z, thief, 1); } bad.instanceMatrix.needsUpdate = true;
  spk.visible = inn(t, K.cable, K.cable + 1.2) && Math.sin(t * 40) > 0; spk.position.set(3.4, 2.5, .2); spk.scale.setScalar(1 + Math.random() * 1.5);
  // ---- personajes ----
  let op = [3.3, 0, 2.2], ory = .5, p = { emo: 'neutral' }, ev = false, ep = [0, 0, 0], ery = 0, e = { emo: 'neutral' };
  const point = (a = -2.3) => ({ armR: [a, -.3, -.2], armL: [-.2, .15, -.3] });
  const holdBill = { armR: [-1.3, -.2, -.7], armL: [-1.3, .2, -.7], look: [0, -.6], headRx: .25 };
  cam3.visible = false;
  if (t < K.contador) { op = [2.4, 0, 1.2]; ory = .2; p = { emo: 'surprised', ...holdBill }; }
  else if (t < K.explico) { op = [3.4, 0, 1.6]; ory = .9; p = { emo: t > K.revisas ? 'worried' : 'suspicious', ...point(-1.8), headRy: .2 }; }
  else if (t < K.anota) { op = [3.3, 0, 1.9]; ory = .9; p = { emo: 'neutral', ...point(-1.7) }; }
  else if (t < K.mal) { op = [2.6, 0, 1.4]; ory = .4; p = { emo: 'neutral' }; ev = true; ep = [5.35, 0, 1.35]; ery = -1.9; e = { emo: 'determined', armL: [-1.4, .3, -.6], armR: [-1.6, -.3, -.7], look: [-.6, .2] }; }
  else if (t < K.p1) { op = [2.0, 0, 1.4]; ory = .3; p = { emo: 'sad', ...holdBill }; ev = t < K.mas; ep = [5.6, 0, 1.6]; ery = -.4; e = { emo: 'suspicious', armR: [-1.0, -.3, -.6], headRy: .6 }; }
  else if (t < K.p2) { op = [1.0, 0, .2]; ory = .1; p = { emo: 'determined', ...holdBill }; }
  else if (t < K.p3) { op = [3.75, 0, 2.0]; ory = 2.56; p = { emo: 'determined', armR: [-1.8, -.2, -.3], armL: [-.2, .15, -.3], look: [0, .3] }; cam3.visible = true; }
  else if (t < K.p4) { op = [3.35, 0, 2.0]; ory = .9; p = { emo: t > K.cobraron ? 'surprised' : 'suspicious', ...point(-1.8) }; }
  else if (t < K.p5) { op = [1.4, 0, .3]; ory = .1; p = { emo: t > K.nadie ? 'worried' : 'suspicious', ...holdBill }; }
  else if (t < K.corriendo) { op = [-1.0, 0, -.6]; ory = -.4; p = { emo: 'determined', armR: [-.6, -.2, -1.2], armL: [-.6, .2, -1.2], spineRx: .35, hipY: .9 }; }
  else if (t < K.p6) { op = [3.3, 0, 2.0]; ory = .8; p = { emo: 'surprised', armR: [-2.4, -.5, -.4], armL: [-2.4, .5, -.4] }; }
  else if (t < K.ojo) { op = [2.2, 0, 1.0]; ory = .1; p = { emo: 'determined', ...holdBill }; }
  else if (t < K.electricista) { op = [3.6, 0, 1.9]; ory = 1.1; p = { emo: t > K.toques + .6 ? 'surprised' : 'neutral', armR: [-1.4, -.2, -.3], armL: [-.2, .15, -.3] }; }
  else if (t < K.ya) { op = [2.9, 0, 1.6]; ory = .5; p = { emo: 'happy' }; ev = true; ep = [5.35, 0, 1.35]; ery = -1.9; e = { emo: 'determined', armL: [-1.3, .3, -.6], armR: [-1.8, -.3, -.4] }; }
  else { op = [2.2, 0, 1.4]; ory = .2; p = { emo: 'happy', armR: [-2.6, -.35, -.2 + .3 * Math.sin(t * 8)], armL: [-.2, .15, -.3] }; ev = true; ep = [4.9, 0, 1.6]; ery = -.5; e = { emo: 'happy', armL: [-.9, .3, -.6] }; }
  owner.root.position.set(...op); owner.root.rotation.y = ory; pose(owner, p, t);
  if (cam3.visible) { owner.root.updateMatrixWorld(true); cam3.position.copy(owner.hand[1].getWorldPosition(new THREE.Vector3())).add(V(0, .1, -.05)); cam3.rotation.set(0, ory, 0); }
  eng.root.visible = ev; eng.root.position.set(...ep); eng.root.rotation.y = ery; pose(eng, e, t + 1.3); wrench.visible = t >= K.electricista; engCB.visible = true;
  // etiquetas
  OVL.length = 0; const Lb = (text, at, end, pos, color = '#ffcc33') => { if (t >= at && t < end) OVL.push({ text, at, end, pos, color }); };
  const TOPM = V(4.35, 2.6, 1.0), TOPH = V(1.0, 3.4, 0);
  Lb('¿TE COBRAN DE MÁS?', .1, K.contador, V(2.6, 3.2, .4), '#ff6a4a'); Lb('¿QUÉ DICE TU CONTADOR?', K.contador, K.explico, TOPM);
  Lb('CUENTA KILOVATIOS HORA', K.cuenta, K.anota, TOPM, '#6cc4ff'); Lb('ANOTAN EL NÚMERO', K.anota, K.resta, V(4.6, 2.6, .8)); Lb('ACTUAL − ANTERIOR', K.resta, K.mal, V(4.6, 2.6, .8), '#7be36b');
  Lb('¿LO CALCULAN A OJO?', K.mal, K.mas, TOPH, '#ff8a4a'); Lb('PAGAS DE MÁS', K.mas, K.p1, TOPH, '#ff6a4a');
  Lb('PASO 1: TU FACTURA', K.p1, K.p2, V(1.0, 2.9, -.5)); Lb('PASO 2: FOTO CON FECHA', K.p2, K.p3, TOPM); Lb('✖ SIN TOCARLO', K.foto + 1.0, K.fecha, V(4.35, .4, 1.0), '#ff6a4a');
  Lb('PASO 3: COMPARA', K.p3, K.menos, TOPM); Lb('CONTADOR: 04580', K.menos, K.cobraron, TOPM, '#6cc4ff'); Lb('TE COBRARON DE MÁS', K.cobraron, K.p4, TOPM, '#ff6a4a');
  Lb('PASO 4: ¿ESTIMADA?', K.p4, K.nadie, V(1.4, 2.9, -.5)); Lb('NADIE LEYÓ TU CONTADOR', K.nadie, K.p5, V(1.4, 2.9, -.5), '#ff6a4a');
  Lb('PASO 5: LA PRUEBA DEL VECINO', K.p5, K.apaga, V(0, 3.1, -1)); Lb('APAGA Y DESCONECTA TODO', K.apaga, K.corriendo, V(0, 3.1, -1), '#6cc4ff');
  Lb('¿SIGUE CORRIENDO?', K.corriendo, K.cable, TOPM, '#ff6a4a'); Lb('CABLE CON PROBLEMA', K.cable, K.cable + 1.6, V(6.8, 4.0, -.3), '#ff8a4a'); Lb('O ALGUIEN CONECTADO', K.cable + 1.6, K.p6, V(6.8, 4.0, -.3), '#ff6a4a');
  Lb('PASO 6: RECLAMA', K.p6, K.protecom, V(2.6, 3.0, .4)); Lb('LUEGO: PROTECOM', K.protecom, K.ojo, V(2.6, 3.0, .4), '#6cc4ff');
  Lb('✖ NO LO ABRAS', K.ojo, K.sigue, TOPM, '#ff6a4a'); Lb('¿SIGUE CORRIENDO?', K.sigue, K.electricista, TOPM, '#ff8a4a'); Lb('QUE LO REVISE UN ELECTRICISTA', K.electricista, K.ya, V(4.6, 2.7, .9), '#7be36b');
  Lb('¿YA REVISASTE EL TUYO?', K.ya + .1, CTA_ST, V(2.6, 3.4, .2), '#ff8a4a');
}
function bill(t, a, b, hl, stamp) {
  if (!inn(t, a, b)) return; const k = eback(P(t, a, .4)) * (1 - P(t, b - .25, .25)); g.save(); g.translate(540, 1420); g.scale(k, k); g.rotate(-.02);
  g.fillStyle = 'rgba(0,0,0,.35)'; rrp(g, 0, -262, -182, 532, 372, 24); g.fill(); g.fillStyle = '#fffdf6'; rrp(g, 0, -270, -190, 540, 372, 24); g.fill();
  g.fillStyle = '#f6b445'; rrp(g, 0, -270, -190, 540, 78, 24); g.fill(); g.fillRect(-270, -136, 540, 24);
  g.textAlign = 'center'; g.textBaseline = 'middle'; g.font = '900 40px M'; g.fillStyle = '#2a2c33'; g.fillText('FACTURA DE LUZ', 0, -150);
  const rows = [['LECTURA ANTERIOR', String(PREV).padStart(5, '0')], ['LECTURA ACTUAL', String(BILLR).padStart(5, '0')], ['CONSUMO', (BILLR - PREV) + ' kWh']];
  rows.forEach(([l, v], i) => { const y = -70 + i * 72; if (hl.includes(i)) { g.fillStyle = 'rgba(255,204,51,.45)'; rrp(g, 0, -250, y - 30, 500, 60, 12); g.fill(); }
    g.textAlign = 'left'; g.font = '800 30px M'; g.fillStyle = '#5a6070'; g.fillText(l, -230, y); g.textAlign = 'right'; g.font = '700 38px J'; g.fillStyle = i === 2 ? '#e8383a' : '#2a2c33'; g.fillText(v, 230, y); });
  if (stamp) { const s = eback(P(t, stamp[0], .35)); if (s > 0) { g.save(); g.translate(40, 60); g.rotate(-.18); g.scale(s, s); g.strokeStyle = stamp[1]; g.lineWidth = 8; rrp(g, 0, -230, -44, 460, 88, 12); g.stroke(); g.font = '900 42px M'; g.textAlign = 'center'; g.fillStyle = stamp[1]; g.fillText(stamp[2], 0, 4); g.restore(); } }
  g.restore();
}
function overlay2d(t) {
  bill(t, .05, K.contador - .05, [1], null);
  bill(t, K.resta, K.mal, [0, 1, 2], null);
  bill(t, K.busca - .2, K.p2, t < K.actual ? [0] : [1, 2], null);
  bill(t, K.estimada, K.p5, [1], [K.estimada + 1.0, '#e8383a', 'LECTURA ESTIMADA']);
  // foto del contador con fecha
  card(t, K.foto + 1.6, K.p3, 540, 1440, 'FOTO', '#3d8bff', x => { x.fillStyle = '#1b1e27'; rrp(x, 0, -150, -50, 300, 100, 12); x.fill(); x.font = '700 70px J'; x.fillStyle = '#fff'; x.fillText('04580', 0, 2); x.font = '800 30px M'; x.fillStyle = '#5a6070'; x.fillText('18 / NOV · 9:12 AM', 0, 100); });
  // comparación
  if (inn(t, K.compara, K.p4)) { const k = eback(P(t, K.compara, .4)) * (1 - P(t, K.p4 - .25, .25)); g.save(); g.translate(540, 1420); g.scale(k, k);
    const box = (x0, title, val, col) => { g.fillStyle = '#fffdf6'; rrp(g, 0, x0 - 200, -120, 400, 220, 22); g.fill(); g.fillStyle = col; rrp(g, 0, x0 - 200, -120, 400, 64, 22); g.fill(); g.fillRect(x0 - 200, -76, 400, 20); g.font = '900 30px M'; g.fillStyle = '#fff'; g.textAlign = 'center'; g.textBaseline = 'middle'; g.fillText(title, x0, -88); g.font = '700 70px J'; g.fillStyle = '#2a2c33'; g.fillText(val, x0, 10); };
    box(-215, 'RECIBO DICE', '04650', '#f6b445'); box(215, 'CONTADOR', '04580', '#3d8bff');
    if (t > K.cobraron) { const s = eback(P(t, K.cobraron, .35)); g.save(); g.translate(0, 150); g.scale(s, s); g.fillStyle = '#e8383a'; rrp(g, 0, -230, -40, 460, 80, 40); g.fill(); g.font = '900 40px M'; g.fillStyle = '#fff'; g.fillText('70 kWh DE MÁS', 0, 3); g.restore(); }
    g.restore(); }
  card(t, K.reclama, K.protecom, 540, 1440, 'RECLAMACIÓN', '#3d8bff', x => { x.font = '900 34px M'; x.fillStyle = '#2a2c33'; x.fillText('1. TU DISTRIBUIDORA', 0, -30); x.font = '800 30px M'; x.fillStyle = '#1aa86a'; x.fillText('✔ FOTOS DEL CONTADOR', 0, 30); x.fillText('✔ TU FACTURA', 0, 80); });
  card(t, K.protecom, K.ojo, 540, 1440, 'PROTECOM', '#1aa86a', x => { x.font = '900 34px M'; x.fillStyle = '#2a2c33'; x.fillText('2. SI NO TE RESUELVEN', 0, -30); x.font = '800 30px M'; x.fillStyle = '#3d8bff'; x.fillText('CALCULADORA OFICIAL', 0, 30); x.fillText('DE FACTURA', 0, 75); });
  // destello de la cámara
  const fl = P(t, K.foto + 1.3, .08) * (1 - P(t, K.foto + 1.4, .3)); if (fl > 0) { g.fillStyle = `rgba(255,255,255,${fl * .85})`; g.fillRect(0, 0, W, H); }
}
const KEYW = new Set(['recibo', 'contador', 'revisas', 'kilovatios', 'número', 'resta', 'cobran', 'mal', 'ojo', 'más', 'factura', 'anterior', 'actual', 'cobrados', 'foto', 'fecha', 'compara', 'menos', 'cobraron', 'estimada', 'nadie', 'vecino', 'apaga', 'desconecta', 'corriendo', 'cable', 'conectado', 'reclama', 'distribuidora', 'fotos', 'protecom', 'calculadora', 'toques', 'electricista', 'comentarios']);
