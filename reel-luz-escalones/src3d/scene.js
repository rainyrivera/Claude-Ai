// ================= LA LUZ TE LLEGÓ EL DOBLE: LOS ESCALONES =================
const DISC = (t) => t >= PS(24) - .2 && t < PS(25) ? 'No abras el medidor: pide que lo revise tu compañía de luz' : t >= PS(6) && t < PS(9) ? 'Ejemplo ilustrativo · cada país y compañía tiene sus tarifas' : 'Recreación ilustrativa';
const KW = { doble: T('doble'), robando: T('robando'), peor: T('peor'), cobran: T('cobran'), escalones: T('escalones'), baratos: T('baratos'), limite: T('límite'), caro1: T('caro'), calor: T('calor'), refri: T('refrigerador'), ventilador: T('ventilador'), noche: T('noche'), aire: T('aire'), brincas: T('brincas'), caro2: T('caro', 2), susc: T('suscríbete'), haces: T('haces'), monto: T('monto'), usaste: T('usaste'), recibo: T('recibo'), empieza: T('empieza'), truco: T('truco'), poquito: T('poquito'), medidor: T('medidor'), reclama: T('reclama'), coment: T('comentarios') };
add(road(30, 9, 200)); [[-14, -9, 5, 3, 4, 0xe8d7b0], [16, -11, 6, 3, 7, 0xd9c9a6], [60, -10, 5, 3, 5, 0xf0e0c0], [100, -10, 6, 3, 6, 0xe2d2b0], [140, -10, 5, 3, 4, 0xd9c9a6]].forEach(b => building(...b));
[[-7, 4], [12, 4.5], [32, 4], [54, 4.5], [72, 4], [92, 4.5], [112, 4], [132, 4.5]].forEach(([x, z]) => tree(x, z, 1.3));
// ---------- casa con medidor (zona A) ----------
function house(x, z, col) { const h = add(new THREE.Group()); const b = box(6, 3.4, 5, col); b.position.y = 1.7; const roof = M(new THREE.ConeGeometry(4.6, 1.8, 4), lp(0xb5543a, { flatShading: true })); roof.position.y = 4.3; roof.rotation.y = Math.PI / 4; const door = box(1, 2, .1, 0x8a5a36); door.position.set(-1.2, 1, 2.52); const w1 = box(1.2, 1, .1, 0x23406e); w1.position.set(1.4, 2.1, 2.52); h.add(b, roof, door, w1); h.position.set(x, 0, z); return h; }
const HOUSE = house(0, -1, 0xf2e6c8);
const METER = add(new THREE.Group()); { const bx = rbox(1, 1.3, .35, .06, lp(0xdfe3ea, { metalness: .3, roughness: .4 })); const sc = texPlane(.7, .35, 140, 70, (x, w, h) => { x.fillStyle = '#10141c'; x.fillRect(0, 0, w, h); }); sc.position.set(0, .2, .2); METER.add(bx, sc); METER.userData.sc = sc; const wire = cyl(.04, .04, 2.2, 0x22252c, 6); wire.position.set(0, 1.6, 0); METER.add(wire); } METER.position.set(2.2, 2.0, 1.75);
function meterScreen(v) { const t2 = METER.userData.sc.userData.tex, x = t2.x; x.fillStyle = '#10141c'; x.fillRect(0, 0, 140, 70); x.fillStyle = v > 300 ? '#ff4d4d' : '#3ddc84'; x.font = '800 40px I'; x.textAlign = 'center'; x.textBaseline = 'middle'; x.fillText(String(Math.floor(v)).padStart(4, '0'), 70, 38); t2.tx.needsUpdate = true; }
const SPARK = parts(20, new THREE.MeshBasicMaterial({ color: 0xffd23a }), .06);
// ---------- escalera de tarifas (zona B) ----------
const BX = 40; add(box(16, .2, 9, 0xd9d4c8)).position.set(BX, .1, 0);
const STEPC = [0x3ddc84, 0x9be15d, 0xffb020, 0xff4d4d]; const STEPS = STEPC.map((c, i) => { const s = add(box(3, .8 + i * 1.1, 3.2, lp(c, { roughness: .6 }))); s.position.set(BX - 4.5 + i * 3, (.8 + i * 1.1) / 2 + .2, 0); return s; });
const STEPL = ['$', '$$', '$$$', '$$$$'].map((s, i) => { const p = add(texPlane(1.8, .8, 220, 100, (x, w, h) => { x.fillStyle = '#fff'; x.font = '900 72px I'; x.textAlign = 'center'; x.textBaseline = 'middle'; x.fillText(s, w / 2, h / 2 + 4); })); p.position.set(BX - 4.5 + i * 3, .8 + i * 1.1 + .25, 1.62); p.rotation.x = -.2; return p; });
const COIN = add(new THREE.Group()); { const c = cyl(.5, .5, .16, lp(0xffc83a, { metalness: .6, roughness: .3, emissive: 0x332200 }), 28); c.rotation.x = Math.PI / 2; const tx = texPlane(.8, .8, 128, 128, (x) => { x.fillStyle = '#7a5200'; x.font = '900 96px I'; x.textAlign = 'center'; x.textBaseline = 'middle'; x.fillText('⚡', 64, 70); }); tx.position.z = .09; COIN.add(c, tx); }
const LIMIT = add(new THREE.Group()); { const bar = box(.12, 5.8, .12, 0xff2d3d); bar.position.y = 2.9; const flag = texPlane(2.4, .7, 300, 90, (x, w, h) => { x.fillStyle = '#ff2d3d'; rrp(x, 0, 0, 0, w, h, 16); x.fill(); x.fillStyle = '#fff'; x.font = '900 52px I'; x.textAlign = 'center'; x.textBaseline = 'middle'; x.fillText('LÍMITE', w / 2, h / 2 + 3); }); flag.position.set(1.25, 5.4, 0); LIMIT.add(bar, flag); } LIMIT.position.set(BX - 1.5, .2, 1.7);
// ---------- casa en corte con calor (zona C) ----------
const CX = 80; add(box(14, .2, 9, 0xd9d4c8)).position.set(CX, .1, 0);
const ROOM = add(new THREE.Group()); { const fl = box(10, .2, 5, 0xc9a77c); fl.position.y = .3; const bw = box(10, 4, .2, 0xf4ead2); bw.position.set(0, 2.3, -2.5); const lw = box(.2, 4, 5, 0xeadfc4); lw.position.set(-5, 2.3, 0); ROOM.add(fl, bw, lw); } ROOM.position.set(CX, 0, 0);
const FRIDGE = add(new THREE.Group()); { const b = rbox(1.6, 3, 1.4, .1, lp(0xf2f4f7, { roughness: .4 })); b.position.y = 1.9; const ln = box(1.5, .04, .05, 0xb9c0cc); ln.position.set(0, 2.5, .72); const h1 = box(.08, .6, .1, 0x9aa0aa); h1.position.set(.6, 3, .75); const h2 = box(.08, .8, .1, 0x9aa0aa); h2.position.set(.6, 1.6, .75); FRIDGE.add(b, ln, h1, h2); } FRIDGE.position.set(CX - 3.4, 0, -1.3);
const FAN = add(new THREE.Group()); const BLADES = new THREE.Group(); { const base = cyl(.5, .6, .2, 0x2b5fd0); base.position.y = .5; const pole = cyl(.08, .08, 1.6, 0x9aa0aa); pole.position.y = 1.3; const cage = M(new THREE.TorusGeometry(.8, .05, 8, 32), lp(0x2b5fd0)); cage.position.y = 2.3; for (let i = 0; i < 3; i++) { const b = box(.25, .7, .03, 0xffffff); b.position.y = .35; const h = new THREE.Group(); h.rotation.z = i * 2.09; h.add(b); BLADES.add(h); } BLADES.position.y = 2.3; FAN.add(base, pole, cage, BLADES); } FAN.position.set(CX, 0, -.6);
const AC = add(new THREE.Group()); { const b = rbox(2.6, .9, .7, .1, lp(0xfafafa, { roughness: .35 })); const v = box(2.2, .08, .1, 0xb9c0cc); v.position.set(0, -.3, .36); AC.add(b, v); } AC.position.set(CX + 2.8, 3.4, -2.1);
const SUN = add(new THREE.Group()); { const s = sph(1.4, lp(0xffc23a, { emissive: 0xff9a00, emissiveIntensity: .8 }), 24); SUN.add(s); for (let i = 0; i < 10; i++) { const r = box(.18, .8, .1, lp(0xffb020, { emissive: 0xff8800 })); const h = new THREE.Group(); h.rotation.z = i * .628; r.position.y = 2.1; h.add(r); SUN.add(h); } } SUN.position.set(CX + 4.5, 7.5, -3);
const COLD = parts(16, new THREE.MeshBasicMaterial({ color: 0xbfe6ff, transparent: true, opacity: .8 }), .07);
const WIND = parts(18, new THREE.MeshBasicMaterial({ color: 0xffffff, transparent: true, opacity: .7 }), .045);
const MOON = add(sph(.7, lp(0xf2f0e0, { emissive: 0x888866 }), 18)); MOON.position.set(CX - 3.5, 6.5, -3);
// ---------- mesa con recibo (zona D) ----------
const DX = 120; add(box(14, .2, 9, 0xd9d4c8)).position.set(DX, .1, 0);
const DESK = add(new THREE.Group()); { const tp = box(7, .2, 3.4, 0xc9a77c); tp.position.y = 2; DESK.add(tp); for (const [x, z] of [[-3.2, -1.5], [3.2, -1.5], [-3.2, 1.5], [3.2, 1.5]]) { const l = box(.2, 1.9, .2, 0x9a6a40); l.position.set(x, 1, z); DESK.add(l); } } DESK.position.set(DX, .2, 0);
const BILL = add(texPlane(2.6, 3.4, 260, 340, (x, w, h) => { x.fillStyle = '#fbf8ef'; x.fillRect(0, 0, w, h); x.fillStyle = '#2b5fd0'; x.fillRect(0, 0, w, 46); x.fillStyle = '#fff'; x.font = '800 26px I'; x.fillText('FACTURA LUZ', 18, 32); x.fillStyle = '#9aa0aa'; for (let i = 0; i < 7; i++) x.fillRect(18, 70 + i * 26, 140 + (i * 37) % 80, 10); x.fillStyle = '#ff4d4d'; x.fillRect(18, 262, 224, 52); x.fillStyle = '#fff'; x.font = '900 32px I'; x.fillText('412 kWh', 40, 298); }, false)); BILL.rotation.x = -Math.PI / 2; BILL.position.set(DX - 1.2, 2.33, 0); BILL.rotation.z = .08;
const MAG = add(new THREE.Group()); { const r = M(new THREE.TorusGeometry(.6, .1, 8, 28), lp(0x2a2d36)); const gl = M(new THREE.CircleGeometry(.58, 24), lp(0xbfe6ff, { transparent: true, opacity: .35 })); const hd = cyl(.1, .1, 1.1, 0x2a2d36, 8); hd.position.set(.75, -.75, 0); hd.rotation.z = .78; MAG.add(r, gl, hd); }
const MET2 = add(new THREE.Group()); { const bx = rbox(1.4, 1.8, .4, .08, lp(0xdfe3ea, { metalness: .3, roughness: .4 })); const dial = texPlane(1.1, .8, 220, 160, (x, w, h) => { x.fillStyle = '#10141c'; rrp(x, 0, 0, 0, w, h, 16); x.fill(); x.fillStyle = '#3ddc84'; x.font = '800 54px I'; x.textAlign = 'center'; x.fillText('0412', w / 2, 80); x.font = '700 30px I'; x.fillStyle = '#9aa0aa'; x.fillText('kWh', w / 2, 128); }); dial.position.set(0, .2, .25); MET2.add(bx, dial); } MET2.position.set(DX + 2.4, 3.3, -.8);
// ---------- tomas ----------
SHOTS = [
  [0, PS(2), [4, 4.2, 12], [3, 3.6, 9.5], [0, 2.2, 0], [1.5, 2.2, 1.5]],
  [PS(2), PS(6), [3.2, 2.6, 6.5], [2.6, 2.4, 5.4], [2.2, 2, 1.8], [2.2, 2.1, 1.8]],
  [PS(6), PS(9), [BX - 1, 7, 26], [BX + 1, 7.5, 23], [BX + 1, 3, 0], [BX + 1.2, 3.2, 0]],
  [PS(9), PS(13), [CX - 1, 6.5, 22], [CX + 1, 6, 20], [CX, 3, -1], [CX + .2, 3, -1]],
  [PS(13), PS(15), [BX + 3, 6, 22], [BX + 2, 7, 19], [BX + 1, 3.4, 0], [BX + 1.5, 3.6, 0]],
  [PS(15), PS(18), [BX - 3, 8, 26], [BX + 3, 8.5, 26], [BX + 1, 3, 0], [BX + 1, 3, 0]],
  [PS(18), PS(22), [DX - .5, 6.5, 6.5], [DX - 1, 5.6, 5], [DX - 1, 2.3, 0], [DX - 1.1, 2.3, 0]],
  [PS(22), PS(24), [BX + 2, 6, 24], [BX + 1, 5.5, 22], [BX + 1, 3, 0], [BX + .6, 2.8, 0]],
  [PS(24), PS(25), [DX + 2.8, 4, 6], [DX + 2.5, 3.7, 4.8], [DX + 2.4, 3.2, -.8], [DX + 2.4, 3.2, -.8]],
  [PS(25), END, [DX, 6.5, 13], [DX - 1, 7, 14.5], [DX, 2.6, 0], [DX, 2.6, 0]]
];
SHAKE = [[KW.doble - .1, KW.doble + .6, .07], [KW.brincas, KW.brincas + .7, .07]];
function coinStep(i) { return V(BX - 4.5 + i * 3, .8 + i * 1.1 + .2 + .6, .3); }
function animWorld(t) {
  sunAt(t < PS(6) ? 0 : t < PS(9) || inn(t, PS(13), PS(18)) || inn(t, PS(22), PS(24)) ? BX : t < PS(13) ? CX : DX, 0, 0, 14);
  // medidor que corre
  const v = t < KW.doble ? 120 + t * 20 : lerp(170, 412, eout(P(t, KW.doble, 1.2))); meterScreen(v);
  SPARK.visible = inn(t, KW.doble, PS(6)); for (let i = 0; i < 20; i++) { const ph = (t * 1.4 + i * .137) % 1, a = i * 2.3; setP(SPARK, i, 2.2 + Math.cos(a) * ph * 1.4, 2.2 + Math.sin(a) * ph * 1.2, 2.1 + ph * .4, SPARK.visible, 1 - ph); } SPARK.instanceMatrix.needsUpdate = true;
  // escalones
  STEPS.forEach((s, i) => { pop(s, t, PS(6) - .2 + i * .25, .4); }); STEPL.forEach((s, i) => pop(s, t, KW.escalones + .1 + i * .15, .35));
  pop(LIMIT, t, KW.limite - .3, .4);
  let ci = 0; if (t > KW.baratos) ci = 1; if (t > KW.limite + .3) ci = 2; if (t > KW.caro1 - .2) ci = 3; if (t > PS(13) - .1) ci = 1; if (t > KW.brincas) ci = 3; if (t > PS(15)) ci = 3; if (t > PS(22)) ci = 2; if (t > KW.poquito) ci = 1;
  const keys = [0, KW.baratos, KW.limite + .3, KW.caro1 - .2, PS(13) - .1, KW.brincas, PS(22), KW.poquito]; let last = 0; for (const k of keys) if (t > k) last = k;
  const cur = coinStep(ci); const hop = P(t, last, .5); COIN.position.copy(cur); COIN.position.y += Math.sin(hop * Math.PI) * 1.6 * (hop < 1 ? 1 : 0); COIN.rotation.y = t * 2.5; COIN.visible = t > KW.escalones;
  STEPS[3].material.emissive = new THREE.Color(0xff2020); STEPS[3].material.emissiveIntensity = ci === 3 ? .25 + .2 * Math.sin(t * 10) : 0;
  // casa con calor
  pop(SUN, t, KW.calor - .3, .5, PS(11)); SUN.rotation.z = t * .5; MOON.visible = inn(t, KW.noche - .3, PS(13)); pop(MOON, t, KW.noche - .3, .4, PS(13));
  pop(FRIDGE, t, PS(9), .4); FRIDGE.position.x = CX - 3.4 + (inn(t, KW.refri, PS(11)) ? Math.sin(t * 50) * .02 : 0);
  COLD.visible = inn(t, KW.refri, PS(13)); for (let i = 0; i < 16; i++) { const ph = (t * .7 + i * .19) % 1; setP(COLD, i, CX - 3.4 + (i % 4 - 1.5) * .3, 3.6 + ph * 1.2, -1.3 + (i % 3) * .3, COLD.visible, 1 - ph * .6); } COLD.instanceMatrix.needsUpdate = true;
  pop(FAN, t, KW.ventilador - .3, .4); BLADES.rotation.z = t * 16;
  WIND.visible = inn(t, KW.ventilador, PS(13)); for (let i = 0; i < 18; i++) { const ph = (t * .9 + i * .19) % 1; setP(WIND, i, CX + (i % 3 - 1) * .3, 2.1 + (i % 5) * .12, lerp(-.3, 2.4, ph), WIND.visible, 1.4); } WIND.instanceMatrix.needsUpdate = true;
  pop(AC, t, KW.aire - .3, .4);
  // recibo, lupa y medidor
  MAG.visible = inn(t, KW.usaste - .4, PS(22)); if (MAG.visible) { const k = eio(P(t, KW.usaste - .4, .8)); MAG.position.set(lerp(DX + 2, DX - 1.1, k), 2.9, lerp(1.5, .9, k)); MAG.rotation.set(-1.1, 0, 0); }
  BILL.rotation.z = .08 + Math.sin(t * .8) * .02;
}
function overlay2d(t) {
  floaters(t, 8, 'rgba(255,230,140,.8)', 'dust');
  punch(t, KW.doble - .2, PS(2), [['¡EL', '#ffffff'], ['DOBLE!', C.red]], 540, 1240, { size: 120 });
  paper(t, KW.doble, PS(2) + .2, 540, 1500, 380, 150, (g, w, h) => { g.font = '700 26px I'; g.fillStyle = '#777'; g.textAlign = 'center'; g.fillText('TOTAL A PAGAR', 0, -30); g.font = '900 60px I'; g.fillStyle = C.red; g.fillText('× 2', 0, 34); });
  pill(t, KW.robando - .2, PS(3), 540, 1450, '¿TE ESTÁN ROBANDO?', C.red, 'warn');
  pill(t, PS(3), PS(4), 540, 1450, 'PUEDE QUE NO', C.blue, 'dot');
  punch(t, KW.cobran - .7, PS(6), [['¿CÓMO TE', '#ffffff'], ['COBRAN?', C.amber]], 540, 1250, { size: 96 });
  pill(t, KW.escalones - .2, PS(7), 540, 1500, 'SE COBRA POR ESCALONES', C.amber, 'star');
  pill(t, KW.baratos - .4, PS(8), 540, 1500, 'PRIMEROS kWh: MÁS BARATOS', C.green, 'check');
  pill(t, KW.limite - .2, PS(9), 540, 1500, 'PASAS EL LÍMITE → MÁS CARO', C.red, 'warn');
  pill(t, KW.calor - .3, PS(10), 540, 1500, 'LLEGA EL CALOR', C.amber, 'warn');
  const A = [[KW.refri, 'REFRIGERADOR TRABAJA MÁS'], [KW.ventilador, 'VENTILADOR TODA LA NOCHE'], [KW.aire, 'AIRE PRENDIDO']]; A.forEach(([a, txt], i) => pill(t, a - .2, PS(13), 540, 1340 + i * 84, txt, C.red, 'arrow', 32));
  punch(t, KW.brincas - .2, PS(15), [['¡ESCALÓN', '#ffffff'], ['CARO!', C.red]], 540, 1260, { size: 100 });
  punch(t, KW.susc - .1, PE(16) + .3, [['¡SUSCRÍBETE!', '#ffffff']], 540, 1250, { stamp: '#ff2d3d', size: 92, rot: -.05 });
  punch(t, KW.haces - .5, PS(19), [['¿QUÉ', '#ffffff'], ['HAGO?', C.amber]], 540, 1260, { size: 104 });
  pill(t, KW.monto - .3, PS(20), 540, 1450, 'NO MIRES SOLO EL MONTO', C.red, 'x');
  pill(t, KW.usaste - .5, PS(21), 540, 1450, 'MIRA LOS kWh USADOS', C.green, 'check');
  panel(t, KW.recibo - .2, PS(22), 540, 1420, 820, 190, 'BUSCA EN TU RECIBO', C.amber, (g, w, h) => { g.font = '800 36px I'; g.fillStyle = '#fff'; g.textAlign = 'left'; g.textBaseline = 'middle'; g.fillText('¿Dónde empieza el escalón caro?', -w / 2 + 30, 26); });
  pill(t, KW.truco - .3, PS(23), 540, 1500, 'CERCA DEL LÍMITE = EL TRUCO', C.amber, 'star');
  punch(t, KW.poquito - .3, PS(24), [['BAJA UN', '#ffffff'], ['POQUITO', C.green]], 540, 1260, { size: 96 });
  pill(t, KW.medidor - .4, PS(25), 540, 1460, 'REVISA EL MEDIDOR Y RECLAMA', C.blue, 'arrow');
  question(t, KW.coment, '¿Cuánto te llegó la luz este mes?', ['Más que el mes pasado', 'Igual', 'Menos'], 1300);
}
