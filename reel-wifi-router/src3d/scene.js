// ================= WIFI LENTO: ES DÓNDE PUSISTE EL ROUTER =================
const K = { lento: PS(0), plan: PS(1), espera: PS(2), noes: PS(3), donde: PS(4), explico: PS(5), manda: PS(6), piedra: PS(7), pared: PS(8), metal: PS(9), agua: PS(10), micro: PS(11), frec: PS(12), poreso: PS(13), pierde: PS(14),
  p1: PS(15), centro: PS(16), p2: PS(17), sube: PS(18), repisa: PS(19), piso: PS(20), p3: PS(21), aire: PS(22), gavetas: PS(23), p4: PS(24), aleja: PS(25), p5: PS(26), antenas: PS(27), paradas: PS(28), p6: PS(29), apaga: PS(30), prende: PS(31),
  grande: PS(32), repetidor: PS(33), gratis: PS(34), mueve: PS(35), donde2: PS(36), leo: PS(37) };
(function () { const x = WT.x; x.fillStyle = '#f3e6cf'; x.fillRect(0, 0, 1024, 406); x.fillStyle = '#9fd6f2'; x.fillRect(pxx(-.4), py(2.1), 150, 110); x.strokeStyle = '#fff'; x.lineWidth = 10; x.strokeRect(pxx(-.4), py(2.1), 150, 110); WT.tx.needsUpdate = true; })();
// ---- cuarto (pared divisoria) y muebles ----
const partM = new THREE.MeshStandardMaterial({ color: 0xf2e3c8, transparent: true, opacity: 1 });
const part = add(M(new THREE.BoxGeometry(.14, 2.55, 2.6), partM)); part.position.set(1.15, 1.465, -1.05); part.scale.z = 1.7 / 2.6;
const bed = add(new THREE.Group()); bed.position.set(2.35, .15, -1.0); { const b = M(new THREE.BoxGeometry(1.6, .4, 1.4), lp(0x6c8bd6)); b.position.y = .2; const pl = M(new THREE.BoxGeometry(.5, .15, 1.2), lp(0xffffff)); pl.position.set(.5, .48, 0); bed.add(b, pl); }
const TVS = canvasTex(256, 144); const tv = add(new THREE.Group()); tv.position.set(-1.9, 1.3, -1.78); { const b = rbox(1.2, .7, .07, .02, lp(0x16181f)); const s = M(new THREE.PlaneGeometry(1.1, .6), new THREE.MeshStandardMaterial({ map: TVS.tx, emissive: 0xffffff, emissiveMap: TVS.tx, emissiveIntensity: 1 }), false); s.position.z = .04; tv.add(b, s); }
{ const x = TVS.x; const gr = x.createLinearGradient(0, 0, 256, 144); gr.addColorStop(0, '#3d8bff'); gr.addColorStop(1, '#a98bff'); x.fillStyle = gr; x.fillRect(0, 0, 256, 144); TVS.tx.needsUpdate = true; }
const stand = add(M(new THREE.BoxGeometry(1.6, .5, .45), lp(0x9a6a40))); stand.position.set(-1.9, .4, -1.6);
const cabinet = add(new THREE.Group()); cabinet.position.set(-.6, .15, -1.55); { const b = M(new THREE.BoxGeometry(.9, .7, .5), lp(0x9a6a40)); b.position.y = .35; cabinet.add(b); }
const cabDoor = M(new THREE.BoxGeometry(.88, .66, .04), lp(0x7f5530)); cabDoor.position.set(-.6, .5, -1.28); scene.add(cabDoor);
const shelf = add(M(new THREE.BoxGeometry(1.0, .06, .4), lp(0x9a6a40))); shelf.position.set(0, 1.75, -1.65);
const fridge = add(rbox(.75, 1.7, .7, .06, mat(0xd8dde6, { metalness: .6, roughness: .3 }))); fridge.position.set(-2.75, 1.0, .9);
const mwave = add(new THREE.Group()); mwave.position.set(-2.75, 1.0, 1.6); mwave.rotation.y = Math.PI / 2; { const tb = M(new THREE.BoxGeometry(.8, .9, .7), lp(0x9a6a40)); tb.position.y = -.45; const b = rbox(.6, .36, .4, .03, lp(0x2a2c33)); b.position.y = .18; const d = M(new THREE.PlaneGeometry(.36, .26), new THREE.MeshStandardMaterial({ color: 0x111111, emissive: 0xffc46a, emissiveIntensity: 0 }), false); d.position.set(-.06, .18, .205); mwave.add(tb, b, d); mwave.userData.door = d; }
const mirror = add(M(new THREE.BoxGeometry(.05, 1.1, .7), mat(0xdbe7f3, { metalness: .9, roughness: .05 }))); mirror.position.set(-3.18, 1.5, -1.0);
const tank = add(new THREE.Group()); tank.position.set(.45, .15, -1.6); { const st = M(new THREE.BoxGeometry(.8, .5, .4), lp(0x2a2c33)); st.position.y = .25; const w = M(new THREE.BoxGeometry(.78, .45, .38), new THREE.MeshStandardMaterial({ color: 0x4fb3ff, transparent: true, opacity: .55, roughness: .1 })); w.position.y = .73; tank.add(st, w); }
// ---- router ----
const router = add(new THREE.Group()); { const b = rbox(.42, .08, .3, .03, lp(0x1d1f25)); b.position.y = .04; router.add(b); router.userData.leds = []; for (let i = 0; i < 4; i++) { const l = M(new THREE.BoxGeometry(.03, .02, .01), new THREE.MeshStandardMaterial({ color: 0x35d39a, emissive: 0x35d39a, emissiveIntensity: 2 }), false); l.position.set(-.12 + i * .08, .05, .152); router.add(l); router.userData.leds.push(l); } }
const ants = []; for (let i = 0; i < 2; i++) { const a = new THREE.Group(); a.position.set(-.15 + i * .3, .08, -.12); const m = M(new THREE.CylinderGeometry(.015, .02, .3, 8), lp(0x1d1f25)); m.position.y = .15; a.add(m); router.add(a); ants.push(a); }
// ---- ondas WiFi (anillos que se expanden) ----
const ringM = []; const rings = []; for (let i = 0; i < 6; i++) { const m = new THREE.MeshBasicMaterial({ color: 0x6cc4ff, transparent: true, opacity: .5, side: THREE.DoubleSide, depthWrite: false }); const r = new THREE.Mesh(new THREE.TorusGeometry(1, .025, 6, 64), m); r.rotation.x = Math.PI / 2; scene.add(r); rings.push(r); ringM.push(m); }
const bounce = parts(10, 0xff8a4a, .05), interf = parts(14, 0xff4d61, .035);
// celular del dueño con barras
const SIG = canvasTex(256, 128); const sig = add(new THREE.Sprite(new THREE.SpriteMaterial({ map: SIG.tx, transparent: true, depthTest: false }))); sig.scale.set(.8, .4, 1); sig.renderOrder = 9;
function drawSig(n, spin) { const x = SIG.x; x.clearRect(0, 0, 256, 128); x.fillStyle = 'rgba(10,14,28,.75)'; rrp(x, 0, 6, 6, 244, 116, 24); x.fill(); for (let i = 0; i < 4; i++) { x.fillStyle = i < n ? (n <= 1 ? '#ff4d61' : n <= 2 ? '#f6b445' : '#35d39a') : 'rgba(255,255,255,.2)'; x.fillRect(30 + i * 34, 96 - (i + 1) * 18, 24, (i + 1) * 18); }
  if (spin) { x.strokeStyle = '#fff'; x.lineWidth = 8; x.beginPath(); x.arc(200, 62, 26, spin, spin + 4.2); x.stroke(); } else { x.fillStyle = '#35d39a'; x.font = '900 40px M'; x.textAlign = 'center'; x.textBaseline = 'middle'; x.fillText('✔', 200, 64); } SIG.tx.needsUpdate = true; }
const ext = add(rbox(.16, .22, .08, .03, lp(0xf2f2f2))); ext.position.set(1.4, .55, -1.83);
const phoneH = add(rbox(.1, .18, .02, .01, lp(0x1b1e27)));
// ---- posición del router en el tiempo ----
const RP = { esquina: V(-3.0, .15, -1.6), centro: V(0, 1.78, -1.65), mueble: V(-.6, .35, -1.55) };
function routerPos(t) {
  if (t < K.poreso) return RP.esquina;
  if (t < K.p1) { const k = (t - K.poreso) / (K.p1 - K.poreso); const opts = [RP.esquina, V(-3.0, .15, -1.6), V(-1.9, .7, -1.72), RP.mueble]; return opts[Math.min(3, Math.floor(k * 4))]; }
  if (t < K.p2) return RP.esquina.clone().lerp(V(0, .15, -1.4), eio(P(t, K.centro + .5, 1.5)));
  if (t < K.p3) return V(0, .15, -1.4).lerp(RP.centro, eio(P(t, K.sube + .2, 1.2)));
  return RP.centro;
}
// ---- cámara ----
SHOTS = [
  [0, K.espera, [3.0, 2.1, 4.8], [2.8, 2.0, 4.4], [2.3, 1.25, -.2], [2.3, 1.25, -.2]],
  [K.espera, K.donde, [.4, 2.6, 7.0], [.2, 2.5, 6.6], [-.4, 1.0, -.6], [-.4, 1.0, -.6]],
  [K.donde, K.explico, [-1.0, 1.3, 1.8], [-1.4, 1.1, 1.2], [-3.0, .2, -1.6], [-3.0, .2, -1.6]],
  [K.explico, K.pared, [.4, 5.2, 7.8], [.2, 5.6, 7.2], [-.6, .3, -.4], [-.4, .3, -.4]],
  [K.pared, K.metal, [3.4, 3.4, 6.8], [3.0, 3.2, 6.4], [1.1, 1.0, -.8], [1.2, 1.0, -.8]],
  [K.metal, K.micro, [.6, 2.4, 5.0], [.3, 2.3, 4.6], [-2.6, 1.1, -.4], [-2.6, 1.1, -.4]],
  [K.micro, K.poreso, [-.6, 1.9, 4.2], [-.9, 1.8, 3.8], [-2.75, .95, 1.5], [-2.75, .95, 1.5]],
  [K.poreso, K.p1, [.4, 2.8, 7.0], [.1, 2.7, 6.6], [-1.4, .8, -1.0], [-1.4, .8, -1.0]],
  [K.p1, K.p3, [1.6, 3.2, 7.4], [1.2, 3.0, 7.0], [0, 1.0, -.8], [0, 1.1, -.8]],
  [K.p3, K.p4, [1.2, 2.2, 5.0], [1.0, 2.1, 4.6], [-.4, 1.0, -1.4], [-.2, 1.2, -1.4]],
  [K.p4, K.p5, [.4, 3.6, 8.0], [.2, 3.4, 7.6], [-1.0, 1.0, -.2], [-1.0, 1.0, -.2]],
  [K.p5, K.grande, [.6, 2.3, 3.0], [.5, 2.25, 2.7], [0, 1.6, -1.65], [0, 1.62, -1.65]],
  [K.grande, K.mueve, [3.8, 3.2, 7.0], [3.4, 3.0, 6.6], [1.6, 1.0, -.8], [1.6, 1.0, -.8]],
  [K.mueve, 200, [2.0, 3.6, 9.0], [1.8, 3.2, 8.2], [.6, 1.0, -.6], [.6, 1.1, -.6]],
];
function animWorld(t) {
  skyDay(t);
  const rp = routerPos(t); router.position.copy(rp);
  cabDoor.visible = !inn(t, K.poreso + (K.p1 - K.poreso) * .75, K.p1) || true; cabDoor.position.z = inn(t, K.poreso + (K.p1 - K.poreso) * .75, K.p1) ? -1.28 : -1.28;
  partM.opacity = 1;
  // antenas
  const angA = t >= K.antenas + .4 ? eio(P(t, K.antenas + .4, .8)) * 1.35 : 0; ants[0].rotation.z = 0; ants[1].rotation.z = -angA;
  // reinicio
  const off = inn(t, K.apaga + .2, K.prende + 1.2); router.userData.leds.forEach((l, i) => { l.material.emissiveIntensity = off ? 0 : (t > K.prende + 1.2 && t < K.prende + 2.2 ? (Math.sin(t * 20 + i) > 0 ? 2 : 0) : 2); });
  // calidad de señal en el cuarto
  let q = 1; if (t >= K.p2) q = 2; if (t >= K.p3 + 1) q = 3; if (t >= K.p4 + 2) q = 4; if (off) q = 0; if (t >= K.grande) q = 4;
  const mOn = inn(t, K.micro, K.poreso) || inn(t, K.aleja, K.aleja + 1.5);
  mwave.userData.door.material.emissiveIntensity = mOn ? 1.5 : 0;
  // anillos: velocidad y alcance según la posición
  const reach = t < K.p1 ? 3.2 : 2.6 + q * .7; const showR = !off && (t >= K.explico || t < K.explico);
  rings.forEach((r, i) => { const u = ((t * .45 + i / 6) % 1); const rad = .2 + u * reach; r.position.set(rp.x, rp.y + .1, rp.z); r.scale.setScalar(rad);
    let op = .55 * (1 - u); if (t < K.p1 && rad > 4.1) op *= .25; // pasa la pared: se debilita
    if (mOn && i % 2 === 0) op *= .2 + .8 * Math.abs(Math.sin(t * 25));
    ringM[i].opacity = showR ? op : 0; ringM[i].color.set(t < K.p1 && rad > 4.1 ? 0xff8a4a : 0x6cc4ff); });
  // rebotes en espejo/nevera, interferencia del microondas
  for (let i = 0; i < 10; i++) { const u = (t * .9 + i / 10) % 1; const src = i < 5 ? V(-3.1, 1.5, -1.0) : V(-2.4, 1.2, .9); setP(bounce, i, src.x + u * .8, src.y + Math.sin(i) * .3, src.z + (i % 5) * .15, inn(t, K.metal, K.agua + 1.5), 1); } bounce.instanceMatrix.needsUpdate = true;
  for (let i = 0; i < 14; i++) { const a = i / 14 * 6.28 + t * 3; setP(interf, i, -2.75 + Math.cos(a) * (.4 + .2 * Math.sin(t * 9 + i)), 1.2 + Math.sin(t * 13 + i) * .2, 1.6 + Math.sin(a) * .4, mOn, 1); } interf.instanceMatrix.needsUpdate = true;
  tank.children[1].material.emissive = new THREE.Color(0x4fb3ff); tank.children[1].material.emissiveIntensity = inn(t, K.agua, K.micro) ? .6 + .3 * Math.sin(t * 8) : 0;
  part.material.emissive = new THREE.Color(0xff8a4a); part.material.emissiveIntensity = inn(t, K.pared, K.metal) ? .25 + .15 * Math.sin(t * 8) : 0;
  ext.visible = inn(t, K.repetidor, K.mueve);
  // ---- personajes ----
  let op = [2.4, .15, .1], ory = -.3, p = { emo: 'worried' }, ev = false, ep = [0, .15, .6], ery = 0, e = { emo: 'neutral' };
  const holdPh = { armR: [-1.3, -.2, -.5], armL: [-.4, .15, -.3], look: [0, -.6], headRx: .3 }, point = (a = -2.3) => ({ armR: [a, -.3, -.2], armL: [-.2, .15, -.3] });
  if (t < K.espera) { p = { emo: t > K.plan ? 'sad' : 'worried', ...holdPh }; }
  else if (t < K.explico) { op = [2.3, .15, .2]; p = { emo: 'surprised', ...holdPh }; ev = true; ep = [-.6, .15, -.3]; ery = .2; e = { emo: t > K.donde ? 'determined' : 'neutral', ...(t > K.donde ? point(-1.6) : { armR: [-2.6, -.4, -.2] }), headRy: -.6 }; }
  else if (t < K.p1) { op = [2.3, .15, .2]; p = { emo: 'neutral', ...holdPh }; ev = true; ep = [-.4, .15, -.3]; ery = -.3; e = { emo: 'determined', ...point(-1.9), headRy: .3 }; }
  else if (t < K.p5) { op = [-.95, .15, -.95]; ory = .4; p = { emo: 'determined', armR: [-1.6, -.2, -.6], armL: [-1.6, .2, -.6] }; if (t < K.centro + .5 || t > K.p4 + 3) { op = [2.4, .15, .1]; ory = -.3; p = { emo: q >= 3 ? 'happy' : 'neutral', ...holdPh }; } }
  else if (t < K.grande) { op = [-1.45, .15, -1.3]; ory = .9; p = { emo: 'determined', armR: [-2.4, -.2, -.3], armL: [-.2, .15, -.3] }; }
  else if (t < K.mueve) { op = [2.4, .15, .1]; ory = -.4; p = { emo: 'neutral', ...holdPh }; ev = t >= K.repetidor; ep = [.3, .15, -.6]; ery = .5; e = { emo: 'determined', ...point(-1.8) }; }
  else { op = [2.4, .15, .1]; ory = -.2; p = { emo: 'happy', armR: [-2.6, -.35, -.2 + .3 * Math.sin(t * 8)], armL: [-1.3, .2, -.5] }; ev = true; ep = [-.4, .15, -.5]; ery = .2; e = { emo: 'happy', armL: [-.9, .3, -.6] }; }
  owner.root.position.set(...op); owner.root.rotation.y = ory; pose(owner, p, t);
  eng.root.visible = ev; eng.root.position.set(...ep); eng.root.rotation.y = ery; pose(eng, e, t + 1.3); wrench.visible = false; engCB.visible = true;
  owner.root.updateMatrixWorld(true); phoneH.position.copy(owner.hand[1].getWorldPosition(new THREE.Vector3())).add(V(0, .08, .02)); phoneH.rotation.y = ory;
  drawSig(q, (t < K.p2 || off) ? t * 6 : 0); sig.position.copy(owner.root.position).add(V(0, 2.35, 0)); sig.visible = t < K.explico || t >= K.p1;
  // etiquetas
  OVL.length = 0; const Lb = (text, at, end, pos, color = '#ffcc33') => { if (t >= at && t < end) OVL.push({ text, at, end, pos, color }); };
  const TOP = V(0, 3.4, -.5), R = V(rp.x, rp.y + 1.2, rp.z);
  Lb('INTERNET LENTO', .1, K.plan, V(2.2, 3.0, -.5), '#ff6a4a'); Lb('¿PLAN MÁS CARO?', K.plan, K.espera, V(2.2, 3.0, -.5)); Lb('¡ESPERA!', K.espera, K.noes, TOP, '#ff6a4a'); Lb('✖ NO ES EL PLAN', K.noes, K.donde, TOP, '#ff6a4a'); Lb('ES DÓNDE ESTÁ', K.donde, K.explico, R, '#ff8a4a');
  Lb('LA SEÑAL SALE EN ONDAS', K.manda, K.pared, TOP, '#6cc4ff'); Lb('CADA PARED LA DEBILITA', K.pared, K.metal, V(1.15, 3.2, -.6), '#ff8a4a'); Lb('METAL Y ESPEJOS REBOTAN', K.metal, K.agua, V(-2.8, 2.8, -1.0), '#ff8a4a'); Lb('EL AGUA LA ABSORBE', K.agua, K.micro, V(.45, 1.8, -1.6), '#6cc4ff'); Lb('MICROONDAS = INTERFERENCIA', K.micro, K.poreso, V(-2.75, 2.2, 1.6), '#ff6a4a');
  Lb('✖ ESQUINA · PISO · TV · MUEBLE', K.poreso, K.p1, TOP, '#ff6a4a');
  Lb('PASO 1: AL CENTRO', K.p1, K.p2, TOP); Lb('PASO 2: ARRIBA', K.p2, K.p3, TOP, '#7be36b'); Lb('✖ NUNCA EN EL PISO', K.piso, K.p3, V(0, .9, -1.4), '#ff6a4a');
  Lb('PASO 3: AL AIRE LIBRE', K.p3, K.p4, V(0, 2.8, -1.6)); Lb('PASO 4: LEJOS DE…', K.p4, K.p5, TOP); Lb('PASO 5: ANTENAS', K.p5, K.paradas, V(0, 2.7, -1.6)); Lb('UNA PARADA, OTRA DE LADO', K.paradas, K.p6, V(0, 2.7, -1.6), '#7be36b');
  Lb('PASO 6: REINÍCIALO', K.p6, K.grande, V(0, 2.7, -1.6)); Lb('¿CASA GRANDE?', K.grande, K.repetidor, TOP); Lb('REPETIDOR O MALLA', K.repetidor, K.gratis, V(1.4, 1.6, -1.8), '#6cc4ff'); Lb('PRIMERO ESTO: GRATIS', K.gratis, K.mueve, TOP, '#7be36b');
  Lb('¿DÓNDE ESTÁ EL TUYO?', K.donde2 + .1, CTA_ST, V(.6, 3.4, -.5), '#ff8a4a');
}
function overlay2d(t) {
  // checklist del paso 4
  if (inn(t, K.aleja, K.p5)) { const it = ['MICROONDAS', 'NEVERA', 'ESPEJOS', 'METAL']; it.forEach((s, i) => { const k = eback(P(t, K.aleja + .3 + i * .9, .3)); if (k <= 0) return; g.save(); g.translate(540, 1270 + i * 92); g.scale(k, k); g.fillStyle = '#fffdf6'; rrp(g, 0, -230, -38, 460, 76, 38); g.fill(); g.fillStyle = '#e8383a'; g.font = '900 40px M'; g.textAlign = 'center'; g.textBaseline = 'middle'; g.fillText('✖ ' + s, 0, 2); g.restore(); }); }
  card(t, K.plan + .4, K.espera, 540, 1440, 'PLAN NUEVO', '#e8383a', x => { x.font = '900 60px M'; x.fillStyle = '#2a2c33'; x.fillText('$$$', 0, 0); x.font = '800 30px M'; x.fillStyle = '#5a6070'; x.fillText('¿de verdad hace falta?', 0, 80); });
}
const KEYW = new Set(['lento', 'plan', 'caro', 'router', 'ondas', 'pared', 'debilita', 'metal', 'espejos', 'rebotan', 'agua', 'pecera', 'microondas', 'frecuencia', 'esquina', 'piso', 'mueble', 'centro', 'súbelo', 'repisa', 'gavetas', 'nevera', 'antenas', 'paradas', 'apágalo', 'prenderlo', 'repetidor', 'malla', 'gratis', 'comentarios']);
