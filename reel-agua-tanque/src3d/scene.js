// ================= EL AGUA QUE GUARDAS EN LA CISTERNA Y EL TANQUE =================
const DISC = (t) => t >= PS(14) && t < PS(20) ? 'Si dudas del agua, consulta a tu servicio local de agua' : 'Recreación ilustrativa';
const KW = { dias1: T('días'), guardas: T('guardas'), cisterna1: T('cisterna'), bomba1: T('bomba'), techo: T('techo'), espera: T('espera'), horas: T('horas'), millones: T('millones'), problema: T('problema'), limpia: T('limpia'), red: T('red'), cisterna2: T('cisterna', 2), ensuciar: T('ensuciar'), tapa: T('tapa'), polvo: T('polvo'), hojas: T('hojas'), animalitos: T('animalitos'), nunca: T('nunca'), cocinar: T('cocinar'), misma: T('misma'), susc: T('suscríbete'), haces: T('haces'), tapados: T('tapados'), limpialos: T('límpialos'), dentro: T('dentro'), olor: T('olor'), color: T('color'), tierrita: T('tierrita'), tomar: T('tomar'), ojo: T('ojo'), luz: T('luz'), bomba2: T('bomba', 2), reserva: T('reserva'), coment: T('comentarios') };
add(road(60, 10, 220)); [[-15, -11, 5, 3, 5, 0xe8d7b0], [22, -11, 6, 3, 6, 0xd9c9a6], [60, -12, 5, 3, 4, 0xf0e0c0], [100, -11, 6, 3, 7, 0xe2d2b0], [140, -11, 5, 3, 4, 0xd9c9a6]].forEach(b => building(...b));
[[-9, 4.5], [12, 4.5], [33, 4], [53, 4.5], [72, 4], [93, 4.5], [113, 4], [133, 4.5]].forEach(([x, z]) => tree(x, z, 1.3));
function plat(x, w = 14) { const p = add(box(w, .2, 9, 0xd9d4c8)); p.position.set(x, .1, 0); return p; }
const glassM = () => lp(0xcfe9ff, { transparent: true, opacity: .28, roughness: .1, depthWrite: false });
const waterM = () => lp(0x3aa6e8, { transparent: true, opacity: .8, roughness: .15 });
// cisterna en corte: caja de vidrio con agua dentro
function cistern(w, h, d) { const g0 = new THREE.Group(); const sh = M(new THREE.BoxGeometry(w, h, d), glassM(), false); sh.position.y = h / 2; const rim = box(w + .1, .12, d + .1, 0x9aa0aa); rim.position.y = h; const bot = box(w, .1, d, 0x7d838c); bot.position.y = .05; const wt = M(new THREE.BoxGeometry(w - .1, 1, d - .1), waterM(), false); wt.position.y = .1; g0.add(sh, rim, bot, wt); g0.userData.w = wt; g0.userData.h = h; return g0; }
function setLevel(c, f) { const wt = c.userData.w, h = c.userData.h; const y = Math.max(.02, f * (h - .2)); wt.scale.y = y; wt.position.y = .1 + y / 2; }
function tank(s = 1) { const g0 = new THREE.Group(); const b = cyl(1, 1.1, 2, lp(0x1d2029, { roughness: .5 }), 24); b.position.y = 1; const lid = cyl(.5, .5, .15, 0x2a2d36, 20); lid.position.y = 2.08; for (let i = 0; i < 3; i++) { const r = M(new THREE.TorusGeometry(1.05, .04, 6, 28), lp(0x2a2d36)); r.rotation.x = Math.PI / 2; r.position.y = .4 + i * .6; g0.add(r); } g0.add(b, lid); g0.scale.setScalar(s); return g0; }
function pump() { const g0 = new THREE.Group(); const m = cyl(.4, .4, .9, lp(0x2b5fd0), 16); m.rotation.z = Math.PI / 2; m.position.y = .5; const b = box(1.1, .2, .7, 0x5e6573); b.position.y = .1; g0.add(m, b); return g0; }
function pipe(a, b, r = .08, col = 0x9aa0aa) { const d = b.clone().sub(a), L = d.length(); const p = cyl(r, r, L, col, 8); p.position.copy(a).add(b).multiplyScalar(.5); p.quaternion.setFromUnitVectors(V(0, 1, 0), d.normalize()); return add(p); }
// ---------- ZONA A: casa con cisterna, bomba y tanque ----------
plat(0, 16);
const HOUSE = add(new THREE.Group()); { const b = box(6, 3.4, 5, 0xf2e6c8); b.position.y = 1.9; const roof = box(6.2, .2, 5.2, 0xcfc6b2); roof.position.y = 3.7; const door = box(1, 2, .1, 0x8a5a36); door.position.set(-1.6, 1.2, 2.52); const w1 = box(1.2, 1, .1, 0x23406e); w1.position.set(1.2, 2.3, 2.52); HOUSE.add(b, roof, door, w1); } HOUSE.position.set(-1, 0, -1.5);
const CIS1 = add(cistern(2.6, 1.6, 2)); CIS1.position.set(4.6, .2, 1.4);
const PMP1 = add(pump()); PMP1.position.set(4.6, .2, -1);
const TNK1 = add(tank(.8)); TNK1.position.set(.4, 3.8, -1.6);
const PIPES1 = [pipe(V(4.6, .9, -1), V(4.6, 4.6, -1)), pipe(V(4.6, 4.6, -1), V(1.2, 4.6, -1.6))];
const FLOW1 = parts(16, new THREE.MeshBasicMaterial({ color: 0x4aa8ff }), .1);
const CAL = add(texPlane(2.6, 2.2, 260, 220, (x, w, h) => { x.fillStyle = '#fff'; rrp(x, 0, 0, 0, w, h, 16); x.fill(); x.fillStyle = '#2b5fd0'; x.fillRect(0, 0, w, 44); x.fillStyle = '#fff'; x.font = '900 30px I'; x.textAlign = 'center'; x.fillText('AGUA', w / 2, 32); x.font = '800 22px I'; for (let i = 0; i < 21; i++) { const cx = 22 + (i % 7) * 36, cy = 80 + Math.floor(i / 7) * 52; const ok = [0, 3, 8, 11, 15, 18].includes(i); x.fillStyle = ok ? '#4aa8ff' : '#e9ecf2'; x.beginPath(); x.arc(cx + 2, cy - 6, 15, 0, 6.29); x.fill(); x.fillStyle = ok ? '#fff' : '#9aa0aa'; x.fillText(String(i + 1), cx + 2, cy + 2); } })); CAL.position.set(-1, 6.3, 1);
const FAUCET = add(new THREE.Group()); { const p = cyl(.12, .12, 1.2, 0xb9c0cc, 10); p.position.y = .6; const sp = cyl(.1, .1, .7, 0xb9c0cc, 10); sp.rotation.z = Math.PI / 2; sp.position.set(.3, 1.2, 0); const h = box(.4, .1, .1, 0xff4d4d); h.position.set(0, 1.35, 0); FAUCET.add(p, sp, h); } FAUCET.position.set(-3, .2, 2.6);
const DRIP = add(sph(.09, lp(0x4aa8ff), 10));
// ---------- ZONA B: el agua se ensucia ----------
const BX = 40; plat(BX, 18);
const MAIN = pipe(V(BX - 8, .9, 1), V(BX - 3, .9, 1), .18, 0x5e6573);
const CIS = add(cistern(4, 2.6, 3)); CIS.position.set(BX - 1, .2, 0);
const LID = add(box(4.1, .14, 3.1, 0x9aa0aa));
const TNK = add(tank(1.1)); TNK.position.set(BX + 4, 2.8, -.5); const STAND = add(new THREE.Group()); for (const [x, z] of [[-.8, -.8], [.8, -.8], [-.8, .8], [.8, .8]]) { const l = box(.15, 2.6, .15, 0x7d838c); l.position.set(x, 1.4, z); STAND.add(l); } STAND.position.set(BX + 4, 0, -.5);
pipe(V(BX + 1, 2.7, 0), V(BX + 3, 3.8, -.5), .08);
const INFLOW = parts(18, new THREE.MeshBasicMaterial({ color: 0x6cc4ff }), .1);
const DUST = parts(40, new THREE.MeshBasicMaterial({ color: 0x9a7b54 }), .05);
const LEAVES = Array.from({ length: 6 }, (_, i) => { const l = add(M(new THREE.CircleGeometry(.22, 5), lp([0x7cb342, 0xc0a040, 0x9a7b34][i % 3], { side: THREE.DoubleSide }))); l.scale.x = .6; return l; });
const BUGS = Array.from({ length: 3 }, () => { const b = add(new THREE.Group()); const body = sph(.14, lp(0x3a2a1a), 10); body.scale.set(1, .6, 1.4); b.add(body); for (let k = -1; k <= 1; k++) for (const s of [-1, 1]) { const lg = box(.18, .02, .02, 0x3a2a1a); lg.position.set(s * .14, -.02, k * .08); b.add(lg); } return b; });
const MURK = new THREE.Color(0x7a8a5a), CLEAN = new THREE.Color(0x3aa6e8);
const GLASS = add(new THREE.Group()); { const gl = M(new THREE.CylinderGeometry(.45, .38, 1.1, 20, 1, true), glassM(), false); gl.position.y = .55; const w = cyl(.42, .37, .8, waterM(), 20); w.position.y = .45; GLASS.add(gl, w); GLASS.userData.w = w; } GLASS.position.set(BX - 4.4, .2, 2.4);
// ---------- ZONA C: qué haces ----------
const CX = 80; plat(CX, 18);
const CIS3 = add(cistern(4, 2.6, 3)); CIS3.position.set(CX - 2.4, .2, 0); setLevel(CIS3, .35);
const LID3 = add(box(4.1, .14, 3.1, 0x9aa0aa));
const BRUSH = add(new THREE.Group()); { const h = cyl(.06, .06, 2.4, 0xe8c99a, 8); h.position.y = 1.2; const hd = box(.9, .2, .4, 0x2b5fd0); const br = box(.85, .2, .35, 0xffd23a); br.position.y = -.2; BRUSH.add(h, hd, br); }
const BUB = parts(16, new THREE.MeshBasicMaterial({ color: 0xffffff, transparent: true, opacity: .8 }), .08);
const GL3 = add(new THREE.Group()); { const gl = M(new THREE.CylinderGeometry(.6, .5, 1.5, 20, 1, true), glassM(), false); gl.position.y = .75; const w = cyl(.57, .49, 1.1, lp(0x8a7a4a, { transparent: true, opacity: .85 }), 20); w.position.y = .6; GL3.add(gl, w); } GL3.position.set(CX + 3, .2, .8);
const STINK = Array.from({ length: 3 }, (_, i) => { const o = add(texPlane(.5, 1.2, 60, 140, (x) => { x.strokeStyle = '#7cb342'; x.lineWidth = 9; x.lineCap = 'round'; x.beginPath(); for (let y = 130; y > 10; y -= 4) x.lineTo(30 + Math.sin(y / 14) * 16, y); x.stroke(); })); return o; });
const SPECK = parts(24, new THREE.MeshBasicMaterial({ color: 0x5a4020 }), .045);
const XG = add(texPlane(1.8, 1.8, 128, 128, (x) => { x.strokeStyle = '#ff3030'; x.lineWidth = 16; x.lineCap = 'round'; x.beginPath(); x.moveTo(18, 18); x.lineTo(110, 110); x.moveTo(110, 18); x.lineTo(18, 110); x.stroke(); })); XG.position.set(CX + 3, 1.2, 1.6);
// ---------- ZONA D: sin luz, sin bomba ----------
const DX = 120; plat(DX, 16);
const CIS4 = add(cistern(2.8, 1.8, 2.2)); CIS4.position.set(DX - 3, .2, .6); setLevel(CIS4, .8);
const PMP4 = add(pump()); PMP4.position.set(DX - 3, .2, -1.6);
const TNK4 = add(tank(1)); TNK4.position.set(DX + 1.4, 3, -1); const ST4 = add(new THREE.Group()); for (const [x, z] of [[-.8, -.8], [.8, -.8], [-.8, .8], [.8, .8]]) { const l = box(.15, 3, .15, 0x7d838c); l.position.set(x, 1.5, z); ST4.add(l); } ST4.position.set(DX + 1.4, 0, -1);
pipe(V(DX - 3, .9, -1.6), V(DX - 3, 4.4, -1.6)); pipe(V(DX - 3, 4.4, -1.6), V(DX + .6, 4.4, -1));
const FLOW4 = parts(14, new THREE.MeshBasicMaterial({ color: 0x4aa8ff }), .1);
const BULB = add(sph(.45, lp(0xffe08a, { emissive: 0xffb020, emissiveIntensity: 1 }), 16)); BULB.position.set(DX - .8, 5.6, 0);
const JUGS = [0, 1, 2].map(i => { const j = add(new THREE.Group()); const b = M(new THREE.CylinderGeometry(.55, .55, 1.3, 20), lp(0x7fc8ff, { transparent: true, opacity: .75, roughness: .1 })); b.position.y = .65; const n = cyl(.2, .3, .35, lp(0x7fc8ff, { transparent: true, opacity: .75 }), 14); n.position.y = 1.45; const c = cyl(.2, .2, .12, 0x2b5fd0, 14); c.position.y = 1.66; j.add(b, n, c); j.position.set(DX + 3.4 + (i % 2) * 1.2, .2, 2 - Math.floor(i / 2) * 1.1); return j; });
// ---------- tomas ----------
SHOTS = [
  [0, PS(3), [1.5, 6.5, 28], [1, 6, 26], [1, 3, 0], [1, 3, 0]],
  [PS(3), PS(6), [1.5, 7.5, 29], [0, 8, 28], [1, 4, 0], [.6, 4.2, 0]],
  [PS(6), PS(12), [BX + .5, 6.5, 22], [BX, 6, 19], [BX + .3, 2.2, 0], [BX - .3, 1.8, 0]],
  [PS(12), PS(14), [BX - 3, 8, 26], [BX + 3, 8, 26], [BX, 2.6, 0], [BX, 2.6, 0]],
  [PS(14), PS(17), [CX - 1.6, 7, 17], [CX - 2, 6.4, 15], [CX - 2, 1.6, 0], [CX - 2.2, 1.6, 0]],
  [PS(17), PS(20), [CX + 3, 3.6, 9.5], [CX + 3, 3.2, 8.5], [CX + 3, 1.2, .6], [CX + 3, 1.2, .6]],
  [PS(20), END, [DX + .5, 7, 30], [DX, 7.6, 32], [DX + .5, 2.8, 0], [DX + .5, 2.8, 0]]
];
SHAKE = [[KW.ensuciar - .1, KW.ensuciar + .5, .05]];
function flowAlong(m, pts, n, on, speed = .5) { m.visible = on; const segs = pts.length - 1; for (let i = 0; i < n; i++) { const ph = (performance.now ? 0 : 0) + ((curT * speed + i / n) % 1); const f = ph * segs, k = Math.min(segs - 1, Math.floor(f)), u = f - k; const p = pts[k].clone().lerp(pts[k + 1], u); setP(m, i, p.x, p.y, p.z, on, 1); } m.instanceMatrix.needsUpdate = true; }
let curT = 0;
function animWorld(t) {
  curT = t; sunAt(t < PS(6) ? 0 : t < PS(14) ? BX : t < PS(20) ? CX : DX, 0, 0, 16);
  // zona A
  pop(CAL, t, KW.dias1 - .6, .4, PS(3)); pop(FAUCET, t, .1, .3, PS(3));
  { const ph = (t * .6) % 1; DRIP.visible = t < KW.guardas - .3 && ph < .7; DRIP.position.set(-2.4, 1.3 - ph * 1.6, 2.6); }
  pop(CIS1, t, KW.cisterna1 - .3, .4); pop(PMP1, t, KW.bomba1 - .3, .4); pop(TNK1, t, KW.techo - .5, .4); PIPES1.forEach(p => pop(p, t, KW.bomba1, .3));
  setLevel(CIS1, .2 + .6 * eout(P(t, KW.guardas, 2)));
  flowAlong(FLOW1, [V(4.6, .9, -1), V(4.6, 4.6, -1), V(1.2, 4.6, -1.6)], 16, inn(t, KW.bomba1 + .3, PS(6)), .5);
  // zona B
  const inB = t >= PS(6); setLevel(CIS, .25 + .5 * eout(P(t, KW.red, 3)));
  flowAlong(INFLOW, [V(BX - 8, .9, 1), V(BX - 3, .9, 1), V(BX - 3, 2.3, 1), V(BX - 2, 2.3, .6)], 18, inn(t, KW.limpia - .4, PS(12)), .45);
  const lidOff = t > KW.tapa - .2 ? eout(P(t, KW.tapa - .2, .6)) : 0; LID.position.set(BX - 1 + lidOff * 2.2, 2.9 + lidOff * .1, lidOff * .8); LID.rotation.set(0, lidOff * .5, lidOff * .25);
  const dirt = clamp(P(t, KW.polvo - .2, PS(12) - KW.polvo)); CIS.userData.w.material.color.copy(CLEAN).lerp(MURK, t > PS(12) ? 0 : dirt * .9);
  DUST.visible = inn(t, KW.polvo - .3, PS(12)); for (let i = 0; i < 40; i++) { const ph = (t * .25 + i * .05) % 1, a = i * 2.4; setP(DUST, i, BX - 1 + Math.cos(a) * 1.6 + Math.sin(t + i) * .2, lerp(5.5, 1.2, ph), Math.sin(a) * 1.1, DUST.visible, 1 - ph * .3); } DUST.instanceMatrix.needsUpdate = true;
  LEAVES.forEach((l, i) => { const a = KW.hojas - .2 + i * .18; l.visible = inn(t, a, PS(12)); const k = clamp(P(t, a, 1.3)); l.position.set(BX - 2.4 + i * .6 + Math.sin(t * 2 + i) * .3 * (1 - k), lerp(6, 2.45, k), -.8 + (i % 3) * .7); l.rotation.set(-Math.PI / 2 + Math.sin(t * 3 + i) * (1 - k), 0, t * (1 - k) + i); });
  BUGS.forEach((b, i) => { b.visible = inn(t, KW.animalitos - .2 + i * .15, PS(12)); const a = t * 1.2 + i * 2.1; b.position.set(BX - 1 + Math.cos(a) * 1.9, 2.95, Math.sin(a) * 1.4); b.rotation.y = -a; });
  pop(GLASS, t, KW.cocinar - .3, .4, PS(12)); GLASS.userData.w.material.color.copy(CLEAN).lerp(MURK, eout(P(t, KW.misma - .5, .8)));
  // zona C
  const lidOn = eout(P(t, KW.tapados - .6, .6)); LID3.position.set(CX - 2.4 + (1 - lidOn) * 3, 2.9 + (1 - lidOn) * 1.5, 0); LID3.visible = t > PS(14) && t < KW.limpialos - .2;
  BRUSH.visible = inn(t, KW.limpialos - .2, PS(17)); BRUSH.position.set(CX - 2.4 + Math.sin(t * 6) * 1.2, 1.15, Math.cos(t * 3) * .7); BRUSH.rotation.z = Math.sin(t * 6) * .3;
  BUB.visible = BRUSH.visible; for (let i = 0; i < 16; i++) { const ph = (t * .8 + i / 16) % 1; setP(BUB, i, CX - 2.4 + Math.cos(i * 2.2) * 1.4, .4 + ph * 1.2, Math.sin(i * 2.2) * 1, BUB.visible, 1 - ph * .4); } BUB.instanceMatrix.needsUpdate = true;
  CIS3.userData.w.material.color.copy(MURK).lerp(CLEAN, eout(P(t, KW.dentro, 1.5)));
  pop(GL3, t, PS(17) - .1, .4, PS(20));
  STINK.forEach((s, i) => { s.visible = inn(t, KW.olor - .2, PS(20)); s.position.set(CX + 2.6 + i * .4, 2.4 + Math.sin(t * 2 + i) * .15, .8); s.material.opacity = .7 + .3 * Math.sin(t * 3 + i); });
  GL3.children[1].material.color.set(t > KW.color - .2 ? 0x9a7a3a : 0x8aa07a);
  SPECK.visible = inn(t, KW.tierrita - .3, PS(20)); for (let i = 0; i < 24; i++) { const ph = (t * .3 + i * .041) % 1; setP(SPECK, i, CX + 3 + Math.cos(i * 1.7) * .35, .4 + ph * .7, .8 + Math.sin(i * 1.7) * .35, SPECK.visible, 1); } SPECK.instanceMatrix.needsUpdate = true;
  pop(XG, t, KW.tomar - .2, .35, PS(20));
  // zona D
  const off = t > KW.luz - .1; BULB.material.emissiveIntensity = off ? 0 : 1; BULB.material.color.set(off ? 0x555a66 : 0xffe08a);
  flowAlong(FLOW4, [V(DX - 3, .9, -1.6), V(DX - 3, 4.4, -1.6), V(DX + .6, 4.4, -1)], 14, inn(t, PS(20), KW.luz - .1), .5);
  PMP4.children[0].material.color.set(off ? 0x5e6573 : 0x2b5fd0); PMP4.position.x = DX - 3 + (off ? 0 : Math.sin(t * 60) * .015);
  JUGS.forEach((j, i) => pop(j, t, KW.reserva - .4 + i * .2, .4));
}
function overlay2d(t) {
  floaters(t, 9, 'rgba(200,235,255,.75)', 'drop');
  pill(t, KW.dias1 - .7, PS(1), 540, 1450, 'EL AGUA NO LLEGA TODOS LOS DÍAS', C.blue, 'clock', 32);
  const A = [[KW.cisterna1, 'CISTERNA'], [KW.bomba1, 'BOMBA'], [KW.techo - .4, 'TANQUE']]; A.forEach(([a, txt], i) => pill(t, a - .2, PS(3), 540, 1340 + i * 84, txt, C.blue, 'check', 34));
  punch(t, KW.espera - 1, PS(4), [['¿QUÉ LE', '#ffffff'], ['PASA?', C.amber]], 540, 1260, { size: 104 });
  pill(t, KW.horas - .6, PS(5), 540, 1450, 'LLEGA POR DÍAS O POR HORAS', C.amber, 'clock');
  pill(t, KW.millones - .3, PS(6), 540, 1450, 'MILLONES VIVEN GUARDANDO AGUA', C.blue, 'dot');
  punch(t, KW.problema - .5, PS(7), [['EL', '#ffffff'], ['PROBLEMA', C.red]], 540, 1260, { size: 104 });
  pill(t, KW.limpia - .3, PS(8), 540, 1450, 'SALE LIMPIA DE LA RED', C.green, 'check');
  punch(t, KW.ensuciar - .3, PS(9) + 1.2, [['SE PUEDE', '#ffffff'], ['ENSUCIAR', C.red]], 540, 1260, { size: 92 });
  const D = [[KW.tapa, 'TAPA MAL PUESTA'], [KW.polvo, 'POLVO Y HOJAS'], [KW.animalitos, 'ANIMALITOS'], [KW.nunca, 'TANQUE NUNCA LIMPIADO']]; D.forEach(([a, txt], i) => pill(t, a - .2, PS(11), 540, 1300 + i * 80, txt, C.red, 'x', 32));
  pill(t, KW.cocinar - .4, PS(12), 540, 1460, 'YA NO ES LA MISMA AGUA', C.red, 'warn');
  punch(t, KW.susc - .1, PS(13) + .3, [['¡SUSCRÍBETE!', '#ffffff']], 540, 1250, { stamp: '#ff2d3d', size: 92, rot: -.05 });
  punch(t, KW.haces - .4, PS(15), [['¿QUÉ', '#ffffff'], ['HAGO?', C.amber]], 540, 1260, { size: 104 });
  pill(t, KW.tapados - .5, PS(16), 540, 1460, 'SIEMPRE BIEN TAPADOS', C.green, 'check');
  pill(t, KW.limpialos - .3, PS(17), 540, 1460, 'LÍMPIALOS POR DENTRO', C.green, 'check');
  const B = [[KW.olor, 'MAL OLOR'], [KW.color, 'COLOR RARO'], [KW.tierrita, 'TIERRITA']]; B.forEach(([a, txt], i) => pill(t, a - .2, PS(20), 540, 1300 + i * 80, txt, C.amber, 'warn', 32));
  punch(t, KW.tomar - .4, PS(20), [['NO LA', '#ffffff'], ['TOMES', C.red]], 540, 1180, { size: 96 });
  punch(t, KW.ojo - .2, PS(21), [['¡OJO!', C.amber]], 540, 1260, { size: 120 });
  pill(t, KW.luz - .3, PS(22), 540, 1450, 'SIN LUZ, LA BOMBA NO SUBE EL AGUA', C.red, 'warn', 31);
  pill(t, KW.reserva - .5, PS(23), 540, 1450, 'TEN UNA RESERVA APARTE', C.green, 'check');
  question(t, KW.coment, '¿Cada cuánto te llega el agua?', ['Todos los días', 'Por días', 'Casi nunca'], 1300);
}
