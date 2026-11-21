// ================= ¿EL CELULAR MOJADO EN ARROZ? =================
const DISC = (t) => inn(t, PS(1), PS(9)) || t >= PS(18) ? 'Fuente: soporte de Apple (iPhone mojado)' : 'Recreación ilustrativa · no está a escala';
const KW = { cayo: T('cayó'), agua: T('agua'), arroz1: T('arroz'), apple: T('apple'), hagas: T('hagas'), sorprender: T('sorprender'), seca: T('seca'), pedacitos: T('pedacitos'), polvillo: T('polvillo'), puerto1: T('puerto'), ayudarte: T('ayudarte'), danar: T('dañar'), susc: T('suscríbete'), moja: T('moja'), desconectalo: T('desconéctalo'), forro: T('forro'), golpecitos: T('golpecitos'), abajo: T('abajo'), seco: T('seco'), aire1: T('aire'), dia1: T('día'), nunca: T('nunca'), secadora: T('secadora'), calor: T('calor'), presion: T('presión'), papel: T('papel'), palillo: T('palillo'), tecnico: T('técnico'), coment: T('comentarios') };
add(road(20, 10, 160)); [[-12, -10, 5, 3, 6, 0xe8d7b0], [10, -12, 5, 3, 8, 0xd9c9a6], [34, -10, 4, 3, 5, 0xf0e0c0], [50, -9, 5, 3, 4, 0xe2d2b0]].forEach(b => building(...b));
[[-8, 4], [7, 4.5], [27, 4], [46, 4.5]].forEach(([x, z]) => tree(x, z, 1.3));
function makePhone(scale = 1, caseCol = null) { const p = new THREE.Group(); const b = rbox(2, 4, .25, .07, lp(0x1d2029, { roughness: .35 })); p.add(b); const sc = texPlane(1.84, 3.8, 184, 380, (x, w, h) => { const gr = x.createLinearGradient(0, 0, w, h); gr.addColorStop(0, '#3a4fd8'); gr.addColorStop(1, '#b04ad8'); x.fillStyle = gr; x.fillRect(0, 0, w, h); x.fillStyle = '#fff'; x.font = '700 44px I'; x.textAlign = 'center'; x.fillText('9:41', w / 2, 90); }); sc.position.z = .14; p.add(sc); const port = box(.6, .1, .14, 0x050505); port.position.set(0, -2.0, 0); p.add(port); p.userData.port = port; if (caseCol) { const c = rbox(2.2, 4.2, .3, .12, lp(caseCol)); c.position.z = -.06; p.add(c); p.userData.case = c; } p.scale.setScalar(scale); return p; }
// ---------- ZONA A: piscina + tazón de arroz ----------
const POOL = add(new THREE.Group()); { const rim = box(8, .5, 6, 0xf1efe8); rim.position.y = .25; const w = box(7.2, .1, 5.2, lp(0x2fa8e0, { roughness: .1, metalness: .1, transparent: true, opacity: .9 })); w.position.y = .45; POOL.add(rim, w); } POOL.position.set(-3, 0, 0);
const PH1 = add(makePhone(.8, 0xff8a3d));
const SPL = parts(16, new THREE.MeshBasicMaterial({ color: 0xbfeaff, transparent: true, opacity: .85 }), .12);
const BOWL = add(new THREE.Group()); { const b = M(new THREE.SphereGeometry(2, 28, 14, 0, Math.PI * 2, Math.PI / 2, Math.PI / 2), lp(0xe94f37, { side: THREE.DoubleSide })); b.position.y = 2; const rice = cyl(1.9, 1.9, .1, lp(0xfaf6ec), 28); rice.position.y = 1.85; const st = cyl(.9, 1.1, .3, 0xc23a28, 20); st.position.y = .15; BOWL.add(b, rice, st); } BOWL.position.set(5, .2, 0);
const riceM = lp(0xfffbf0, { roughness: .6 }); const GR = new THREE.InstancedMesh(new THREE.SphereGeometry(.05, 6, 4), riceM, 260); GR.frustumCulled = false; scene.add(GR);
// ---------- ZONA B: macro del puerto ----------
const BX = 40; add(box(12, .2, 8, 0xd9d4c8)).position.set(BX, .1, 0);
const BIG = add(makePhone(1.6)); BIG.position.set(BX, 1.4, 0); BIG.rotation.x = -1.25;
const PORTGLOW = add(new THREE.Sprite(new THREE.SpriteMaterial({ color: 0xff3030, transparent: true, opacity: 0, depthTest: false }))); { const t2 = canvasTex(128, 128), x = t2.x, gr = x.createRadialGradient(64, 64, 0, 64, 64, 64); gr.addColorStop(0, 'rgba(255,60,40,1)'); gr.addColorStop(1, 'rgba(255,60,40,0)'); x.fillStyle = gr; x.fillRect(0, 0, 128, 128); t2.tx.needsUpdate = true; PORTGLOW.material.map = t2.tx; } PORTGLOW.scale.set(2.2, 2.2, 1); PORTGLOW.renderOrder = 6;
const DUST = parts(60, new THREE.MeshBasicMaterial({ color: 0xfff3dc, transparent: true, opacity: .9 }), .035);
const SACK = add(new THREE.Group()); { const s = M(new THREE.CapsuleGeometry(1.1, 1.2, 6, 14), lp(0xe8dcc0)); s.position.y = 1.5; s.scale.z = .7; const lb = texPlane(1.4, .7, 280, 140, (x, w, h) => { x.fillStyle = '#c0392b'; rrp(x, 0, 0, 0, w, h, 14); x.fill(); x.fillStyle = '#fff'; x.font = '900 64px I'; x.textAlign = 'center'; x.textBaseline = 'middle'; x.fillText('ARROZ', w / 2, h / 2 + 3); }); lb.position.set(0, 1.5, .8); SACK.add(s, lb); } SACK.position.set(BX - 3.6, .2, 1);
// ---------- ZONA C: mesa con los 4 pasos ----------
const CX = 80; add(box(14, .2, 8, 0xd9d4c8)).position.set(CX, .1, 0);
const TABLE = add(new THREE.Group()); { const tp = box(6, .2, 3, 0xc9a77c); tp.position.y = 2; TABLE.add(tp); for (const [x, z] of [[-2.7, -1.3], [2.7, -1.3], [-2.7, 1.3], [2.7, 1.3]]) { const l = box(.2, 1.9, .2, 0x9a6a40); l.position.set(x, 1, z); TABLE.add(l); } } TABLE.position.set(CX, .2, 0);
const PH3 = add(makePhone(.6, 0xff8a3d));
const CABLE = add(new THREE.Group()); { const pl = box(.3, .5, .2, 0xf2f2f2); const cb = cyl(.05, .05, 2.5, 0xf2f2f2, 6); cb.position.y = -1.4; CABLE.add(pl, cb); }
const DROPS = parts(14, new THREE.MeshBasicMaterial({ color: 0x6cc4ff, transparent: true, opacity: .9 }), .07);
const FAN = add(new THREE.Group()); const BLADES = new THREE.Group(); { const base = cyl(.5, .6, .2, 0x2b5fd0); base.position.y = .1; const pole = cyl(.08, .08, 1.4, 0x9aa0aa); pole.position.y = .8; const cage = M(new THREE.TorusGeometry(.8, .05, 8, 32), lp(0x2b5fd0)); cage.position.y = 1.7; for (let i = 0; i < 3; i++) { const b = box(.25, .7, .03, 0xffffff); b.position.y = .35; const h = new THREE.Group(); h.rotation.z = i * 2.09; h.add(b); BLADES.add(h); } BLADES.position.y = 1.7; FAN.add(base, pole, cage, BLADES); } FAN.position.set(CX + 2.4, 2.3, 0); FAN.rotation.y = -.7;
const WIND = parts(18, new THREE.MeshBasicMaterial({ color: 0xffffff, transparent: true, opacity: .7 }), .04);
// los "nunca"
function itemDryer() { const g0 = new THREE.Group(); const b = M(new THREE.CapsuleGeometry(.35, .7, 6, 12), lp(0xff6fa8)); b.rotation.z = Math.PI / 2; const n = cyl(.25, .3, .4, 0xff6fa8); n.rotation.z = Math.PI / 2; n.position.x = .7; const h = box(.25, .8, .3, 0xff6fa8); h.position.set(-.2, -.55, 0); g0.add(b, n, h); return g0; }
function itemFire() { const g0 = new THREE.Group(); const f1 = M(new THREE.ConeGeometry(.4, 1.0, 10), lp(0xff7a1a, { emissive: 0x993300 })); f1.position.y = .5; const f2 = M(new THREE.ConeGeometry(.22, .6, 10), lp(0xffd23a, { emissive: 0x996600 })); f2.position.set(0, .4, .15); g0.add(f1, f2); return g0; }
function itemCan() { const g0 = new THREE.Group(); const c = cyl(.3, .3, 1.1, 0x3d7bff, 14); c.position.y = .55; const tp = cyl(.12, .3, .2, 0xc9cdd4, 14); tp.position.y = 1.2; const nz = cyl(.03, .03, .5, 0xff4d4d, 6); nz.rotation.z = Math.PI / 2; nz.position.set(.25, 1.3, 0); g0.add(c, tp, nz); return g0; }
function itemStick() { const g0 = new THREE.Group(); const s = cyl(.03, .03, 1.2, 0xe8c99a, 6); s.rotation.z = .6; s.position.y = .6; const p = box(.6, .8, .02, 0xffffff); p.position.set(-.5, .5, 0); p.rotation.z = -.2; g0.add(s, p); return g0; }
const NEVER = [itemDryer(), itemFire(), itemCan(), itemStick()].map((o, i) => { add(o); o.position.set(CX - 1.8 + i * 1.2, 2.35, .6); o.scale.setScalar(.85); return o; });
const NX = NEVER.map(() => add(texPlane(1.1, 1.1, 128, 128, (x) => { x.strokeStyle = '#ff3030'; x.lineWidth = 20; x.lineCap = 'round'; x.beginPath(); x.moveTo(18, 18); x.lineTo(110, 110); x.moveTo(110, 18); x.lineTo(18, 110); x.stroke(); })));
const TOOLS = add(new THREE.Group()); { const b = box(1.6, .7, .8, 0xe0453a); b.position.y = .35; const h = M(new THREE.TorusGeometry(.35, .06, 6, 16, Math.PI), lp(0x2a2d36)); h.position.y = .7; const w = box(.12, 1.0, .06, 0xb9c0d0); w.position.set(.4, 1.1, .3); w.rotation.z = -.5; TOOLS.add(b, h, w); }
// ---------- tomas ----------
SHOTS = [
  [0, KW.arroz1 - .4, [-2, 6, 10], [-2.5, 5, 9], [-3, 1.2, 0], [-3, .8, 0]],
  [KW.arroz1 - .4, PS(3), [5.5, 5, 10], [5, 5.6, 9], [5, 2.4, 0], [5, 2.6, 0]],
  [PS(3), PS(5), [BX + 1.8, 5.2, 14], [BX + .8, 4.6, 12.5], [BX - 1.2, 1.6, 0], [BX - .6, 1.4, 0]],
  [PS(5), PS(8), [BX + .9, 2.2, 8.5], [BX + .4, 1.9, 7.2], [BX, 1.0, 2.9], [BX, 1.0, 2.9]],
  [PS(8), PS(10), [BX + 5, 5, 14], [BX - 4, 5, 14], [BX - 1, 1.6, 0], [BX - 1, 1.6, 0]],
  [PS(10), PS(18), [CX, 4.6, 10.5], [CX + .6, 4.4, 9.5], [CX, 2.8, 0], [CX + .4, 2.8, 0]],
  [PS(18), PS(21), [CX - .4, 4.6, 12], [CX + .2, 4.4, 11.2], [CX - .1, 2.9, 0], [CX - .1, 2.9, 0]],
  [PS(21), PS(22), [CX + 2.5, 3.8, 8], [CX + 1.8, 3.6, 7.5], [CX + 1.5, 2.6, 1], [CX + 1.5, 2.6, 1]],
  [PS(22), END, [CX - 1, 5.5, 14], [CX - 1.5, 6, 15.5], [CX, 3, 0], [CX, 3, 0]]
];
SHAKE = [[KW.cayo + .9, KW.cayo + 1.5, .06], [KW.danar - .1, KW.danar + .6, .06]];
function animWorld(t) {
  sunAt(t < PS(3) ? 0 : t < PS(10) ? BX : CX, 0, 0, 14);
  // caída a la piscina y luego al arroz
  const fallAt = KW.cayo + .2; let pp, rx = 0, ry = 0;
  if (t < KW.arroz1 - .4) { const k = P(t, fallAt, .7); pp = V(-3, lerp(5, .35, k * k), .4); rx = k * 1.3; ry = t; if (t < fallAt) pp.y = 5; }
  else { const k = P(t, KW.arroz1 - .2, .7); pp = V(5, lerp(6, 2.4, k * k), 0); rx = -.4; ry = .3; }
  PH1.visible = t < PS(3); PH1.position.copy(pp); PH1.rotation.set(rx, ry, .2);
  SPL.visible = inn(t, fallAt + .7, fallAt + 1.6); for (let i = 0; i < 16; i++) { const a = i / 16 * 6.28, k = P(t, fallAt + .7, .9); setP(SPL, i, -3 + Math.cos(a) * k * 1.6, .45 + Math.sin(k * Math.PI) * 1.4 * (.6 + (i % 3) * .2), .4 + Math.sin(a) * k * 1.6, SPL.visible, 1 - k * .5); } SPL.instanceMatrix.needsUpdate = true;
  pop(BOWL, t, KW.arroz1 - .6, .4, PS(3));
  // granos: en el tazón y luego cayendo junto al puerto
  for (let i = 0; i < 260; i++) { const a = i * 2.4, r = Math.sqrt((i % 130) / 130) * 1.7; let x, y, z, vis = false;
    if (t < PS(3)) { vis = BOWL.visible; x = 5 + Math.cos(a) * r; z = Math.sin(a) * r; y = 2.15 + ((i * 7) % 5) * .02; }
    else if (t < PS(10)) { vis = i < 140 && t > PS(4) - .3; const ph = (t * .5 + i * .37) % 1; const pq = BIG.userData.port.getWorldPosition(new THREE.Vector3()); const tx = pq.x + Math.cos(a) * .25, ty = pq.y; x = lerp(BX - 3.2 + Math.cos(a) * .6, tx, ph); y = lerp(3.4 + Math.sin(a) * .5, ty, ph) + Math.sin(ph * Math.PI) * .6; z = lerp(1 + Math.sin(a) * .4, pq.z, ph); }
    tmp.position.set(x || 0, y || 0, z || 0); tmp.rotation.set(a, a * .5, 0); tmp.scale.set(vis ? 1.8 : .001, vis ? .6 : .001, vis ? .6 : .001); tmp.updateMatrix(); GR.setMatrixAt(i, tmp.matrix); }
  GR.instanceMatrix.needsUpdate = true;
  // polvillo entrando al puerto
  const pw = BIG.userData.port.getWorldPosition(new THREE.Vector3());
  DUST.visible = inn(t, KW.polvillo - .4, PS(8)); for (let i = 0; i < 60; i++) { const ph = (t * .6 + i * .173) % 1; const a = i * 1.7; setP(DUST, i, lerp(pw.x + Math.cos(a) * 1.4, pw.x + Math.cos(a) * .12, ph), lerp(pw.y + .8 + Math.sin(a) * .6, pw.y, ph), lerp(pw.z + 1.2, pw.z + .02, ph), DUST.visible, 1 - ph * .6); } DUST.instanceMatrix.needsUpdate = true;
  PORTGLOW.position.copy(pw).add(V(0, 0, .2)); PORTGLOW.material.opacity = inn(t, KW.danar - .3, PS(8)) ? .8 + .2 * Math.sin(t * 12) : inn(t, KW.puerto1 - .3, KW.danar - .3) ? .35 : 0;
  pop(SACK, t, KW.pedacitos - .6, .45, PS(8));
  // zona C: pasos
  let p3 = V(CX - .6, 3.35, 0), r3 = [-.1, 0, 0];
  if (t > KW.golpecitos - .3 && t < PS(16)) { const tap = Math.max(0, Math.sin((t - KW.golpecitos) * 9)) * .25; p3 = V(CX - .6, 3.9 + tap, .4); r3 = [0, 0, Math.PI * eout(P(t, KW.golpecitos - .3, .5))]; }
  PH3.position.copy(p3); PH3.rotation.set(...r3);
  const cs = PH3.userData.case; cs.visible = t < KW.forro + .9; if (cs.visible) cs.position.set(0, 0, -.06 - eio(P(t, KW.forro, .8)) * 3);
  const pw3 = PH3.userData.port.getWorldPosition(new THREE.Vector3());
  CABLE.visible = inn(t, PS(10), PS(12) + .5); if (CABLE.visible) { const k = eio(P(t, KW.desconectalo, .6)); CABLE.position.set(pw3.x, pw3.y - .3 - k * 1.2, pw3.z); CABLE.rotation.z = k * .4; }
  DROPS.visible = inn(t, KW.golpecitos, PS(16)); for (let i = 0; i < 14; i++) { const ph = (t * 1.3 + i * .29) % 1; setP(DROPS, i, pw3.x + (i % 3 - 1) * .1, pw3.y + .1 - ph * 1.3, pw3.z, DROPS.visible, 1 - ph * .5); } DROPS.instanceMatrix.needsUpdate = true;
  pop(FAN, t, KW.seco - .4, .45, PS(18)); BLADES.rotation.z = t * 14;
  WIND.visible = inn(t, KW.aire1 - .2, PS(18)); for (let i = 0; i < 18; i++) { const ph = (t * .9 + i * .19) % 1; setP(WIND, i, lerp(CX + 1.6, CX - 1.2, ph), 3.3 + (i % 5) * .2 + Math.sin(ph * 6) * .05, lerp(.6, 0, ph) + (i % 3) * .2, WIND.visible, 1.5); } WIND.instanceMatrix.needsUpdate = true;
  const nev = [KW.secadora, KW.calor, KW.presion, KW.papel]; NEVER.forEach((o, i) => { pop(o, t, nev[i] - .3, .4, PS(21)); o.rotation.y = Math.sin(t * 1.5 + i) * .3; const x = NX[i]; x.position.set(o.position.x, 3.0, 1.2); x.scale.setScalar(.75); x.userData.s0 = null; pop(x, t, nev[i] + .2, .3, PS(21)); });
  PH3.visible = t < PS(18) || t >= PS(21);
  pop(TOOLS, t, KW.tecnico - .3, .45); TOOLS.position.set(CX + 1.6, 2.3, .6);
}
function overlay2d(t) {
  floaters(t, 10, 'rgba(200,235,255,.75)', 'drop');
  pill(t, KW.agua - .2, KW.arroz1 - .3, 540, 1450, '¡AL AGUA!', C.blue, 'warn');
  pill(t, KW.arroz1 - .3, PS(1), 540, 1450, 'LO PRIMERO: ARROZ', C.amber, 'dot');
  punch(t, KW.hagas - .4, PS(2) + .3, [['APPLE DICE:', '#ffffff'], ['NO', C.red]], 540, 1260, { size: 92 });
  pill(t, KW.sorprender - .4, PS(3), 540, 1450, 'LA RAZÓN TE VA A SORPRENDER', C.amber, 'star');
  pill(t, KW.seca - .3, PS(4), 540, 1450, 'NO ES SI SECA O NO', C.blue, 'dot');
  pill(t, KW.pedacitos - .3, PS(5), 540, 1450, 'PEDACITOS Y POLVILLO', C.red, 'warn');
  pill(t, KW.puerto1 - .5, PS(6), 540, 1450, 'SE METEN POR EL PUERTO', C.red, 'warn');
  punch(t, KW.danar - .3, PS(8) + .1, [['TE LO', '#ffffff'], ['DAÑA', C.red]], 540, 1260, { size: 104 });
  punch(t, KW.susc - .1, PE(8) + .2, [['¡SUSCRÍBETE!', '#ffffff']], 540, 1250, { stamp: '#ff2d3d', size: 92, rot: -.05 });
  punch(t, KW.moja - .4, PS(10), [['¿QUÉ', '#ffffff'], ['HAGO?', C.amber]], 540, 1260, { size: 104 });
  const S = [[PS(10), '1 · DESCONÉCTALO, NO LO CARGUES'], [PS(12), '2 · QUÍTALE EL FORRO'], [PS(14), '3 · GOLPECITOS, PUERTO ABAJO'], [PS(16), '4 · LUGAR SECO CON AIRE']];
  S.forEach(([a, txt], i) => pill(t, a, PS(18), 540, 1150 + i * 84, txt, C.green, 'check', 31));
  pill(t, KW.dia1 - .3, PS(18), 540, 1500, 'HASTA UN DÍA', C.amber, 'clock');
  punch(t, KW.nunca - .3, PS(19), [['NUNCA', C.red]], 540, 1260, { size: 110 });
  const N = [[KW.secadora, 'SECADORA'], [KW.calor, 'CALOR'], [KW.presion, 'AIRE A PRESIÓN'], [KW.papel, 'PAPEL O PALILLO']];
  N.forEach(([a, txt], i) => pill(t, a, PS(21), 540, 1180 + i * 80, txt, C.red, 'x', 32));
  pill(t, KW.tecnico - .3, PS(22), 540, 1450, '¿SIGUE FALLANDO? → TÉCNICO', C.blue, 'arrow');
  question(t, KW.coment, '¿Se salvó tu celular?', ['Sí, con arroz', 'No se salvó', 'Nunca se me ha mojado'], 1300);
}
