// ================= EL INVERSOR NO GUARDA LA LUZ =================
const DISC = (t) => t >= PS(16) && t < PS(20) ? 'La instalación eléctrica: que la haga un electricista' : t >= PS(12) && t < PS(16) ? 'Datos generales · revisa la ficha de cada batería' : 'Recreación ilustrativa';
const KW = { apagones: T('apagones'), corre: T('corre'), inversor1: T('inversor'), compra: T('compra'), horas1: T('horas'), oscuras: T('oscuras'), porque: T('porque'), guarda: T('guarda'), baterias1: T('baterías'), convierte: T('convierte'), casa: T('casa'), pequenas: T('pequeñas'), malas: T('malas'), bueno: T('bueno'), explica: T('explica'), iguales: T('iguales'), susc: T('suscríbete'), plomo: T('plomo-ácido'), baratas: T('baratas'), atencion: T('atención'), agm: T('agm'), gel: T('gel'), seguras: T('seguras'), litio: T('litio'), lifepo4: T('lifepo4'), caras: T('caras'), duran: T('duran'), pesan: T('pesan'), solo: T('solo', 2), trae: T('trae'), horas2: T('horas', 2), prender: T('prender'), instale: T('instale'), sepa: T('sepa'), coment: T('comentarios') };
add(road(60, 10, 220)); [[-15, -10, 5, 3, 5, 0xe8d7b0], [20, -11, 6, 3, 6, 0xd9c9a6], [62, -11, 5, 3, 4, 0xf0e0c0], [100, -12, 6, 3, 7, 0xe2d2b0], [140, -11, 5, 3, 4, 0xd9c9a6]].forEach(b => building(...b));
[[-8, 4.5], [13, 4.5], [33, 4], [55, 4.5], [72, 4], [93, 4.5], [113, 4], [133, 4.5]].forEach(([x, z]) => tree(x, z, 1.3));
function plat(x, w = 14) { const p = add(box(w, .2, 9, 0xd9d4c8)); p.position.set(x, .1, 0); return p; }
const glowM = () => lp(0xffe08a, { emissive: 0xffc040, emissiveIntensity: 1 });
function inverter(s = 1) { const g0 = new THREE.Group(); const b = rbox(1.6, 2, .6, .08, lp(0x2d3340, { roughness: .4 })); const sc = texPlane(1, .5, 200, 100, (x, w, h) => { x.fillStyle = '#0d1220'; rrp(x, 0, 0, 0, w, h, 12); x.fill(); x.fillStyle = '#3ddc84'; x.font = '800 44px I'; x.textAlign = 'center'; x.fillText('220V ~', w / 2, 66); }); sc.position.set(0, .45, .32); const lab = texPlane(1.3, .3, 260, 60, (x, w, h) => { x.fillStyle = '#ffb020'; x.font = '900 40px I'; x.textAlign = 'center'; x.textBaseline = 'middle'; x.fillText('INVERSOR', w / 2, h / 2 + 2); }); lab.position.set(0, -.35, .32); g0.add(b, sc, lab); g0.scale.setScalar(s); return g0; }
function battery(col, top, label, s = 1) { const g0 = new THREE.Group(); const b = rbox(1.4, 1.6, 1, .08, lp(col, { roughness: .5 })); b.position.y = .8; const t1 = cyl(.12, .12, .2, 0xe0303c, 10); t1.position.set(-.4, 1.7, 0); const t2 = cyl(.12, .12, .2, 0x2a2d36, 10); t2.position.set(.4, 1.7, 0); const tp = box(1.42, .12, 1.02, top); tp.position.y = 1.55; const lb = texPlane(1.2, .45, 240, 90, (x, w, h) => { x.fillStyle = '#fff'; x.font = `900 ${label.length > 7 ? 38 : 50}px I`; x.textAlign = 'center'; x.textBaseline = 'middle'; x.fillText(label, w / 2, h / 2 + 2); }); lb.position.set(0, .9, .52); g0.add(b, tp, t1, t2, lb); g0.scale.setScalar(s); return g0; }
// ---------- ZONA A: casa en apagón ----------
plat(0);
const HOUSE = add(new THREE.Group()); const WINS = []; { const b = box(6, 3.4, 5, 0xf2e6c8); b.position.y = 1.9; const roof = M(new THREE.ConeGeometry(4.6, 1.8, 4), lp(0xb5543a, { flatShading: true })); roof.position.y = 4.5; roof.rotation.y = Math.PI / 4; const door = box(1, 2, .1, 0x8a5a36); door.position.set(-1.4, 1.2, 2.52); HOUSE.add(b, roof, door); for (const [x, y] of [[.6, 2.4], [2, 2.4]]) { const w = box(1, 1, .1, glowM()); w.position.set(x, y, 2.52); HOUSE.add(w); WINS.push(w); } } HOUSE.position.set(-1, 0, -1.5);
const POLE = add(new THREE.Group()); { const p = cyl(.12, .15, 7, 0x6a4a30, 8); p.position.y = 3.5; const cr = box(2, .15, .15, 0x6a4a30); cr.position.y = 6.6; POLE.add(p, cr); } POLE.position.set(4.6, 0, 1);
const BOLT = add(texPlane(1.4, 1.4, 128, 128, (x) => { x.fillStyle = '#ffd23a'; x.beginPath(); x.moveTo(70, 6); x.lineTo(30, 70); x.lineTo(60, 70); x.lineTo(46, 122); x.lineTo(98, 50); x.lineTo(66, 50); x.lineTo(84, 6); x.closePath(); x.fill(); })); BOLT.position.set(4.6, 7.4, 1.3);
const BOXI = add(new THREE.Group()); { const b = box(2.2, 1.6, 1.4, 0xc9a27a); b.position.y = .8; const tape = box(2.22, .1, .3, 0xe8d9a8); tape.position.y = 1.62; const lb = texPlane(1.6, .4, 320, 80, (x, w, h) => { x.fillStyle = '#5a3a1a'; x.font = '900 52px I'; x.textAlign = 'center'; x.textBaseline = 'middle'; x.fillText('INVERSOR', w / 2, h / 2 + 2); }); lb.position.set(0, .9, .71); BOXI.add(b, tape, lb); } BOXI.position.set(2.6, .2, 3);
const CLK = add(texPlane(1.6, 1.6, 200, 200, (x) => {})); CLK.position.set(-1, 6.2, 1.2);
function drawClock(h) { const t2 = CLK.userData.tex, x = t2.x; x.clearRect(0, 0, 200, 200); x.fillStyle = '#fff'; x.beginPath(); x.arc(100, 100, 92, 0, 6.29); x.fill(); x.strokeStyle = '#2a2d36'; x.lineWidth = 8; x.stroke(); x.fillStyle = 'rgba(255,77,77,.35)'; x.beginPath(); x.moveTo(100, 100); x.arc(100, 100, 84, -Math.PI / 2, -Math.PI / 2 + h / 12 * 6.283); x.fill(); x.strokeStyle = '#2a2d36'; x.lineWidth = 7; x.lineCap = 'round'; const a = -Math.PI / 2 + h / 12 * 6.283; x.beginPath(); x.moveTo(100, 100); x.lineTo(100 + Math.cos(a) * 70, 100 + Math.sin(a) * 70); x.stroke(); x.fillStyle = '#2a2d36'; x.font = '900 34px I'; x.textAlign = 'center'; x.fillText(Math.floor(h) + ' h', 100, 160); t2.tx.needsUpdate = true; }
// ---------- ZONA B: el circuito ----------
const BX = 40; plat(BX, 18);
const BANK = add(new THREE.Group()); const BB = [0, 1].map(i => { const b = battery(0x3a3f4b, 0x22252c, 'BATERÍA'); b.position.set(i * 1.6, 0, 0); BANK.add(b); return b; }); BANK.position.set(BX - 5.3, .2, 0);
const LEVEL = add(new THREE.Group()); const LV = []; for (let i = 0; i < 5; i++) { const s = box(.5, .25, .1, lp(0x3ddc84, { emissive: 0x1a8040, emissiveIntensity: .6 })); s.position.y = i * .3; LEVEL.add(s); LV.push(s); } LEVEL.position.set(BX - 4.5, 2.5, .2);
const INV = add(inverter(1.1)); INV.position.set(BX, 1.4, 0);
const XINV = add(texPlane(2.2, 2.2, 128, 128, (x) => { x.strokeStyle = '#ff3030'; x.lineWidth = 16; x.lineCap = 'round'; x.beginPath(); x.moveTo(18, 18); x.lineTo(110, 110); x.moveTo(110, 18); x.lineTo(18, 110); x.stroke(); })); XINV.position.set(BX, 1.6, .8);
const MINI = add(new THREE.Group()); const MW = []; { const b = box(3, 2.4, 2.4, 0xf2e6c8); b.position.y = 1.4; const roof = M(new THREE.ConeGeometry(2.4, 1.2, 4), lp(0xb5543a, { flatShading: true })); roof.position.y = 3.2; roof.rotation.y = Math.PI / 4; MINI.add(b, roof); for (const x of [-.6, .6]) { const w = box(.7, .7, .1, glowM()); w.position.set(x, 1.6, 1.22); MINI.add(w); MW.push(w); } } MINI.position.set(BX + 4, .2, 0);
const DC = parts(14, new THREE.MeshBasicMaterial({ color: 0x4aa8ff }), .1); const AC = parts(14, new THREE.MeshBasicMaterial({ color: 0xffc23a }), .1);
const WIRE1 = add(cyl(.06, .06, 1.6, 0x22252c, 6)); WIRE1.rotation.z = Math.PI / 2; WIRE1.position.set(BX - 1.6, 1.2, 0);
const WIRE2 = add(cyl(.06, .06, 1.8, 0x22252c, 6)); WIRE2.rotation.z = Math.PI / 2; WIRE2.position.set(BX + 1.7, 1.2, 0);
// ---------- ZONA C: tres tipos de batería ----------
const CX = 80; plat(CX, 18);
const PED = [-4, 0, 4].map((x, i) => { const p = add(cyl(1.3, 1.4, .5, [0x9aa0aa, 0x5e6573, 0x2b5fd0][i], 28)); p.position.set(CX + x, .45, 0); return p; });
const BT = [battery(0x8a8f99, 0x6e737c, 'PLOMO', 1), battery(0x1d2029, 0x111316, 'AGM · GEL', 1), battery(0x2a6bd8, 0x1d4fa8, 'LITIO', .85)].map((b, i) => { add(b); b.position.set(CX - 4 + i * 4, .7, 0); return b; });
const CAPS = [-.35, 0, .35].map(x => { const c = cyl(.1, .1, .15, 0xffffff, 8); c.position.set(x, 1.68, -.2); BT[0].add(c); return c; });
const DRIPS = parts(10, new THREE.MeshBasicMaterial({ color: 0x9fe0ff }), .06);
const WR = add(new THREE.Group()); { const h = box(.15, 1.4, .1, 0x9aa0aa); const hd = M(new THREE.TorusGeometry(.22, .07, 6, 14, 4.8), lp(0x9aa0aa)); hd.position.y = .8; WR.add(h, hd); }
const CHK = add(texPlane(1, 1, 128, 128, (x) => { x.fillStyle = '#3ddc84'; x.beginPath(); x.arc(64, 64, 60, 0, 6.29); x.fill(); x.strokeStyle = '#fff'; x.lineWidth = 16; x.lineCap = 'round'; x.beginPath(); x.moveTo(34, 66); x.lineTo(56, 88); x.lineTo(96, 42); x.stroke(); })); CHK.position.set(CX, 3.4, .8);
const SCALE = add(new THREE.Group()); { const b = box(1.8, .2, 1.4, 0xdfe3ea); const d = texPlane(.8, .3, 160, 60, (x, w, h) => { x.fillStyle = '#0d1220'; x.fillRect(0, 0, w, h); x.fillStyle = '#3ddc84'; x.font = '800 40px I'; x.textAlign = 'center'; x.fillText('LIGERA', w / 2, 44); }); d.position.set(0, .02, .71); SCALE.add(b, d); } SCALE.position.set(CX + 4, .82, 1.6);
// ---------- ZONA D: antes de comprar ----------
const DX = 120; plat(DX, 16);
const INV2 = add(inverter(1.2)); INV2.position.set(DX - 3, 1.5, 0);
const QB = add(texPlane(1.3, 1.3, 128, 128, (x) => { x.fillStyle = '#ffb020'; x.beginPath(); x.arc(64, 64, 60, 0, 6.29); x.fill(); x.fillStyle = '#fff'; x.font = '900 90px I'; x.textAlign = 'center'; x.textBaseline = 'middle'; x.fillText('?', 64, 70); })); QB.position.set(DX - .8, 4, .5);
const BAT2 = add(battery(0x2a6bd8, 0x1d4fa8, 'BATERÍAS', 1)); BAT2.position.set(DX, .2, .3);
const CLK2 = add(texPlane(1.6, 1.6, 200, 200, (x) => { x.fillStyle = '#fff'; x.beginPath(); x.arc(100, 100, 92, 0, 6.29); x.fill(); x.strokeStyle = '#2a2d36'; x.lineWidth = 8; x.stroke(); x.fillStyle = 'rgba(61,220,132,.45)'; x.beginPath(); x.moveTo(100, 100); x.arc(100, 100, 84, -Math.PI / 2, Math.PI * .8); x.fill(); x.fillStyle = '#2a2d36'; x.font = '900 40px I'; x.textAlign = 'center'; x.fillText('¿? h', 100, 162); })); CLK2.position.set(DX + 2.5, 3.2, 0);
const TOOLS = add(new THREE.Group()); { const b = box(1.8, .8, .9, 0xe0453a); b.position.y = .4; const h = M(new THREE.TorusGeometry(.4, .07, 6, 16, Math.PI), lp(0x2a2d36)); h.position.y = .8; TOOLS.add(b, h); } TOOLS.position.set(DX + 4.2, .2, 1.2);
const APPL = [[0xffe08a, 'bulb'], [0x2b5fd0, 'fan'], [0xf2f4f7, 'fridge']].map(([c, k], i) => { const g0 = new THREE.Group(); if (k === 'bulb') { const b = sph(.4, lp(c, { emissive: 0xffb020, emissiveIntensity: .5 })); b.position.y = .5; g0.add(b); } else if (k === 'fan') { const p = cyl(.06, .06, .9, 0x9aa0aa); p.position.y = .45; const r = M(new THREE.TorusGeometry(.4, .05, 6, 20), lp(c)); r.position.y = 1; g0.add(p, r); } else { const f = rbox(.7, 1.3, .6, .06, lp(c)); f.position.y = .65; g0.add(f); } add(g0); g0.position.set(DX + 1.2 + i * 1.1, .2, 2.6); return g0; });
// ---------- tomas ----------
SHOTS = [
  [0, PS(2), [1, 6.5, 21], [0, 6, 19], [0, 3, 0], [0, 3.2, 0]],
  [PS(2), PS(9), [BX - .5, 5.5, 30], [BX + .3, 5, 28], [BX - .3, 3.2, 0], [BX - .3, 3.2, 0]],
  [PS(9), PS(12), [CX, 7.5, 25], [CX + .5, 7, 23], [CX, 2.4, 0], [CX, 2.4, 0]],
  [PS(12), PS(13), [CX - 4, 4.2, 9.5], [CX - 3.6, 3.8, 8.5], [CX - 4, 1.7, 0], [CX - 4, 1.7, 0]],
  [PS(13), PS(14), [CX, 4.2, 9.5], [CX + .4, 3.8, 8.5], [CX, 1.8, 0], [CX, 1.8, 0]],
  [PS(14), PS(16), [CX + 4, 4.2, 10], [CX + 4.4, 3.8, 9], [CX + 4, 1.7, .5], [CX + 4, 1.7, .5]],
  [PS(16), PS(20), [DX + .5, 7.5, 30], [DX + 1, 7, 28], [DX + .8, 2.5, 0], [DX + .8, 2.5, 0]],
  [PS(20), END, [BX + 1, 9, 34], [BX - 1, 10, 36], [BX - .3, 2.6, 0], [BX - .3, 2.6, 0]]
];
SHAKE = [[KW.oscuras - .1, KW.oscuras + .5, .06]];
let DARK = 0;
function animWorld(t) {
  sunAt(t < PS(2) ? 0 : t < PS(9) || t >= PS(20) ? BX : t < PS(16) ? CX : DX, 0, 0, 16);
  // oscuridad: apagón al inicio y al quedarse a oscuras
  DARK = t < PS(2) ? (t < KW.compra ? .55 * (1 - P(t, KW.inversor1 - .2, .4)) : .7 * P(t, KW.oscuras - .3, .3)) : 0;
  hemi.intensity = 1.25 * (1 - DARK * .8); sunL.intensity = 2.7 * (1 - DARK);
  const lit = t < PS(2) && inn(t, KW.inversor1, KW.oscuras - .3); WINS.forEach(w => { w.material.emissiveIntensity = lit ? 1 : 0; w.material.color.set(lit ? 0xffe08a : 0x2a3350); });
  pop(BOLT, t, KW.apagones - .2, .3, KW.corre); BOLT.material.opacity = .6 + .4 * Math.sin(t * 30);
  BOXI.visible = inn(t, KW.corre - .2, PS(2)); if (BOXI.visible) { const k = P(t, KW.corre - .2, .5); BOXI.position.y = lerp(6, .2, k * k); }
  pop(CLK, t, KW.horas1 - .5, .4, PS(2)); drawClock(lerp(0, 2, clamp(P(t, KW.horas1 - .3, 1.2))));
  // circuito
  const flow = inn(t, KW.baterias1 - .2, PS(9)) && !inn(t, KW.malas, KW.bueno + .6);
  DC.visible = flow; AC.visible = flow && t > KW.convierte - .3;
  for (let i = 0; i < 14; i++) { const ph = (t * .6 + i / 14) % 1; setP(DC, i, lerp(BX - 2.4, BX - .9, ph), 1.2 + Math.sin(ph * 12) * .05, 0, DC.visible, 1); setP(AC, i, lerp(BX + .9, BX + 2.6, ph), 1.2 + Math.sin(ph * 18) * .12, 0, AC.visible, 1); }
  DC.instanceMatrix.needsUpdate = true; AC.instanceMatrix.needsUpdate = true;
  pop(XINV, t, KW.guarda - .2, .35, KW.baterias1 - .2);
  const glowB = inn(t, KW.baterias1 - .2, PS(5)); BB.forEach(b => { b.children[0].material.emissive = new THREE.Color(0x3ddc84); b.children[0].material.emissiveIntensity = glowB ? .25 + .15 * Math.sin(t * 6) : 0; });
  const small = t > KW.pequenas - .2 && t < PS(9) ? 1 - .45 * eout(P(t, KW.pequenas - .2, .5)) : 1; BANK.scale.setScalar(small);
  const lev = t < KW.malas ? 5 : Math.max(0, 5 - Math.floor((t - KW.malas) * 3)); LV.forEach((s, i) => { s.visible = t > KW.baterias1 - .2 && t < PS(9) && i < lev; s.material.color.set(lev <= 2 ? 0xff4d4d : 0x3ddc84); });
  const mlit = flow && t > KW.casa - .6; MW.forEach(w => { w.material.emissiveIntensity = mlit ? 1 : 0; w.material.color.set(mlit ? 0xffe08a : 0x2a3350); });
  INV.rotation.y = inn(t, KW.bueno - .3, PS(9)) ? Math.sin(t * 3) * .3 : 0; pop(INV, t, KW.inversor1 > PS(2) ? PS(2) : PS(2), .4);
  // tipos
  BT.forEach((b, i) => { pop(b, t, PS(9) + .4 + i * .35, .45); b.rotation.y = Math.sin(t * .8 + i) * .15; });
  DRIPS.visible = inn(t, KW.atencion - .3, PS(13)); for (let i = 0; i < 10; i++) { const ph = (t * 1.2 + i * .1) % 1; setP(DRIPS, i, CX - 4 + (i % 3 - 1) * .35, 2.5 - ph * 1.2, .55, DRIPS.visible, 1 - ph * .5); } DRIPS.instanceMatrix.needsUpdate = true;
  WR.visible = inn(t, KW.atencion - .3, PS(13)); WR.position.set(CX - 2.8, 2.3, .8); WR.rotation.z = Math.sin(t * 6) * .5;
  pop(CHK, t, KW.mantenimiento ?? (KW.agm + 1.2), .35, PS(14)); CHK.position.set(CX, 3.3, .8);
  pop(SCALE, t, KW.pesan - .3, .4, PS(16));
  // antes de comprar
  pop(INV2, t, PS(16), .4); pop(QB, t, KW.solo - .3, .35, KW.trae - .3); pop(BAT2, t, KW.trae - .4, .4); pop(CLK2, t, KW.horas2 - .3, .4);
  APPL.forEach((o, i) => pop(o, t, KW.prender - .3 + i * .15, .35)); pop(TOOLS, t, KW.instale - .3, .4);
}
function overlay2d(t) {
  if (DARK > 0) { g.save(); g.fillStyle = `rgba(8,12,34,${DARK * .75})`; g.fillRect(0, 0, W, H); g.restore(); }
  floaters(t, 8, 'rgba(255,230,140,.8)', 'dust');
  pill(t, KW.apagones - .2, KW.corre, 540, 1450, 'APAGÓN', C.red, 'warn');
  pill(t, KW.inversor1 - .3, PS(1), 540, 1450, 'TODOS COMPRAN INVERSOR', C.amber, 'arrow');
  punch(t, KW.horas1 - .4, PS(2), [['¡A OSCURAS', '#ffffff'], ['OTRA VEZ!', C.red]], 540, 1260, { size: 80 });
  punch(t, PS(2) - .2, PS(3), [['¿POR', '#ffffff'], ['QUÉ?', C.amber]], 540, 1260, { size: 110 });
  pill(t, KW.guarda - .5, PS(4), 540, 1480, 'EL INVERSOR NO GUARDA LUZ', C.red, 'x');
  pill(t, KW.baterias1 - .3, PS(5), 540, 1480, 'LA GUARDAN LAS BATERÍAS', C.green, 'check');
  panel(t, KW.convierte - .4, PS(6), 540, 1440, 860, 200, 'EL INVERSOR CONVIERTE', C.amber, (g, w, h) => { g.font = '800 34px I'; g.textAlign = 'left'; g.textBaseline = 'middle'; g.fillStyle = C.blue; g.fillText('Energía de la batería', -w / 2 + 30, 30); g.fillStyle = '#fff'; g.fillText('→', 40, 30); g.fillStyle = C.amber; g.fillText('tu casa', 110, 30); });
  pill(t, KW.pequenas - .3, PS(8), 540, 1450, 'BATERÍAS PEQUEÑAS O MALAS', C.red, 'warn');
  punch(t, KW.bueno - .5, PS(9), [['BATERÍAS', C.amber], ['PRIMERO', '#ffffff']], 540, 1260, { size: 96 });
  punch(t, KW.iguales - 1.2, PS(11), [['NO SON', '#ffffff'], ['IGUALES', C.amber]], 540, 1260, { size: 104 });
  punch(t, KW.susc - .1, PS(11) + 2.6, [['¡SUSCRÍBETE!', '#ffffff']], 540, 1250, { stamp: '#ff2d3d', size: 92, rot: -.05 });
  const card = (a, b, title, col, rows) => panel(t, a, b, 540, 1430, 880, 250, title, col, (g, w, h) => { g.font = '800 32px I'; g.textAlign = 'left'; g.textBaseline = 'middle'; rows.forEach(([ok, txt], i) => { g.fillStyle = ok ? C.green : C.red; g.fillText(ok ? '✓' : '✗', -w / 2 + 30, -18 + i * 54); g.fillStyle = '#fff'; g.fillText(txt, -w / 2 + 76, -18 + i * 54); }); });
  card(KW.plomo - .3, PS(13), 'PLOMO-ÁCIDO TRADICIONAL', '#c9ced8', [[1, 'La más barata al principio'], [0, 'Necesita atención constante']]);
  card(KW.agm - .3, PS(14), 'AGM Y GEL', C.blue, [[1, 'Sin mantenimiento'], [1, 'Seguras para la casa']]);
  card(KW.litio - .3, PS(16), 'LITIO (LiFePO4)', C.green, [[0, 'Más caras'], [1, 'Duran mucho más y pesan menos']]);
  punch(t, KW.solo - 1.4, PS(17), [['ANTES DE', '#ffffff'], ['COMPRAR', C.amber]], 540, 1260, { size: 92 });
  const Q = [[KW.trae, '¿QUÉ BATERÍAS TRAE?'], [KW.horas2, '¿CUÁNTAS HORAS ME DURA?'], [KW.instale, '¿QUIÉN LO INSTALA?']]; Q.forEach(([a, txt], i) => pill(t, a - .4, PS(20), 540, 1340 + i * 86, txt, C.green, 'check', 33));
  question(t, KW.coment, '¿Cuántas horas te dura el respaldo?', ['Menos de 2 h', '2 a 6 h', 'Más de 6 h', 'No tengo'], 1300);
}
