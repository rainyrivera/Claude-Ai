// ================= LA FLECHA DE LA GASOLINA =================
const DISC = 'Recreación ilustrativa · no está a escala';
const KW = { mira: T('mira'), flechita: T('flechita'), diciendo: T('diciendo'), lado1: T('lado'), izq: T('izquierda'), der: T('derecha'), facil: T('fácil'), sirve: T('sirve'), bomba: T('bomba'), prestado: T('prestado'), paras: T('paras'), otro: T('otro'), vuelta: T('vuelta'), manguera: T('manguera'), verguenza: T('vergüenza'), susc: T('suscríbete'), ojo: T('ojo'), falso: T('falso'), manguerita: T('manguerita'), siempre: T('siempre'), manda: T('manda'), noTiene: T('tiene'), manual: T('manual'), fijate: T('fíjate'), coment: T('comentarios') };
// ---------- carro low-poly ----------
function makeCar(col) {
  const c = new THREE.Group(); const body = rbox(4.2, .9, 1.9, .12, lp(col, { roughness: .45 })); body.position.y = .75; c.add(body);
  const cab = rbox(2.3, .75, 1.7, .12, lp(col, { roughness: .45 })); cab.position.set(-.3, 1.5, 0); c.add(cab);
  const glass = lp(0x1e2a3c, { roughness: .2 }); const ws = box(.08, .6, 1.5, glass); ws.position.set(.86, 1.5, 0); ws.rotation.z = -.35; c.add(ws); const rw = box(.08, .55, 1.5, glass); rw.position.set(-1.46, 1.5, 0); rw.rotation.z = .3; c.add(rw);
  for (const s of [1, -1]) { const sw = box(1.9, .5, .04, glass); sw.position.set(-.3, 1.52, s * .86); c.add(sw); }
  for (const [x, z] of [[1.35, .95], [1.35, -.95], [-1.35, .95], [-1.35, -.95]]) { const w = cyl(.42, .42, .32, 0x1b1d22, 18); w.rotation.x = Math.PI / 2; w.position.set(x, .42, z); c.add(w); const hb = cyl(.2, .2, .34, 0xc9cdd4, 12); hb.rotation.x = Math.PI / 2; hb.position.set(x, .42, z); c.add(hb); }
  for (const s of [1, -1]) { const hl = box(.06, .18, .35, lp(0xfff6d0, { emissive: 0x665522 })); hl.position.set(2.1, .85, s * .6); c.add(hl); const tl = box(.06, .16, .35, lp(0xff3030, { emissive: 0x550000 })); tl.position.set(-2.1, .85, s * .6); c.add(tl); }
  // tapas de gasolina (s=+1 derecha = +z, s=-1 izquierda = -z), con bisagra
  c.userData.doors = {}; for (const s of [1, -1]) { const hinge = new THREE.Group(); hinge.position.set(-1.05, .98, s * .965); const d = box(.34, .3, .04, lp(col, { roughness: .4 })); d.position.x = .17; hinge.add(d); const hole = cyl(.1, .1, .05, 0x111111, 12); hole.rotation.x = Math.PI / 2; hole.position.set(-1.05 + .17, .98, s * .95); c.add(hinge, hole); c.userData.doors[s] = hinge; const glowS = new THREE.Sprite(new THREE.SpriteMaterial({ color: 0xffd23a, transparent: true, opacity: 0, depthTest: false })); glowS.position.set(-.88, .98, s * 1.05); glowS.scale.set(.9, .9, 1); glowS.renderOrder = 4; c.add(glowS); c.userData['g' + s] = glowS; }
  return c;
}
const glowTex = (() => { const t = canvasTex(128, 128), x = t.x, gr = x.createRadialGradient(64, 64, 0, 64, 64, 64); gr.addColorStop(0, 'rgba(255,230,120,1)'); gr.addColorStop(1, 'rgba(255,230,120,0)'); x.fillStyle = gr; x.fillRect(0, 0, 128, 128); t.tx.needsUpdate = true; return t.tx; })();
const CAR = add(makeCar(0xe0453a)); for (const s of [1, -1]) CAR.userData['g' + s].material.map = glowTex;
// ---------- mundo: carretera + gasolinera ----------
add(road(10, 6.5, 160)); add(road(30, 0, 40, 0, 12)).children.forEach(o => { if (o.geometry && o.geometry.type === 'BoxGeometry') o.visible = false; });
[[-20, -8, 4, 3, 5, 0xe8d7b0], [-10, -12, 5, 3, 7, 0xd9c9a6], [48, -12, 5, 3, 6, 0xf0e0c0], [58, -9, 4, 3, 4, 0xe2d2b0]].forEach(b => building(...b));
[[-14, 12], [-4, 12], [8, 12], [20, 12.5], [44, 11], [52, 12]].forEach(([x, z]) => tree(x, z, 1.3));
const ST = add(new THREE.Group()); ST.position.set(30, 0, 0);
{ const cn = box(16, .5, 10, 0xf7f7f7); cn.position.y = 5.2; const strip = box(16.1, .22, 10.1, 0xe0453a); strip.position.y = 5.0; ST.add(cn, strip); for (const [x, z] of [[-5, 0], [5, 0]]) { const col = cyl(.25, .25, 5, 0xdedede, 12); col.position.set(x, 2.5, z); ST.add(col); }
  const isl = box(12, .35, 1.4, 0xbfc3ca); isl.position.y = .17; ST.add(isl); }
const PUMPS = []; for (const x of [-3, 3]) { const p = new THREE.Group(); const b = rbox(1.0, 2.0, .7, .08, lp(0xf4f4f4)); b.position.y = 1.35; const top = box(1.05, .35, .75, 0xe0453a); top.position.y = 2.45; const sc = box(.6, .35, .05, lp(0x1e2a3c)); sc.position.set(0, 1.8, .37); const sc2 = sc.clone(); sc2.position.z = -.37; const noz = box(.15, .4, .15, 0x2a2d36); noz.position.set(.42, 1.4, .3); const noz2 = noz.clone(); noz2.position.z = -.3; p.add(b, top, sc, sc2, noz, noz2); p.position.set(x, 0, 0); ST.add(p); PUMPS.push(p); }
{ const pole = cyl(.15, .15, 7, 0x9aa0aa); pole.position.set(9.5, 3.5, -4); const sg = texPlane(2.6, 1.6, 260, 160, (x, w, h) => { x.fillStyle = '#e0453a'; rrp(x, 0, 0, 0, w, h, 16); x.fill(); x.fillStyle = '#fff'; x.font = '900 56px I'; x.textAlign = 'center'; x.textBaseline = 'middle'; x.fillText('GAS', w / 2, 52); x.font = '800 40px I'; x.fillText('$ 2 9 1', w / 2, 116); }, false); sg.position.set(9.5, 7.6, -4); ST.add(pole, sg); }
// manguera estirada sobre el techo (se revela con drawRange)
const hoseCurve = new THREE.CatmullRomCurve3([V(27, 1.4, .3), V(27.2, 2.4, 1.2), V(28.6, 2.6, 2.2), V(28.9, 2.1, 3.3), V(28.95, 1.0, 3.2)]);
const hoseG = new THREE.TubeGeometry(hoseCurve, 60, .06, 6); const HOSE = add(M(hoseG, lp(0x1b1d22)));
// ruta de "dar la vuelta" (para el final, estacionarse bien)
const loop = new THREE.CatmullRomCurve3([V(30, 0, 2.2), V(38, 0, 2.6), V(44, 0, -1), V(41, 0, -7), V(26, 0, -8.5), V(17, 0, -5), V(20, 0, -2.2), V(30, 0, -2.2)]);
const dashPts = loop.getPoints(80); const DASH = add(new THREE.Line(new THREE.BufferGeometry().setFromPoints(dashPts.map(p => V(p.x, .08, p.z))), new THREE.LineDashedMaterial({ color: 0xffd23a, dashSize: .6, gapSize: .4, linewidth: 2 }))); DASH.computeLineDistances();
// manual
const MANUAL = add(new THREE.Group()); { const b = rbox(1.4, 1.9, .22, .04, lp(0x2b5fd0)); const tx = texPlane(1.2, 1.6, 240, 320, (x, w, h) => { x.fillStyle = '#fff'; x.font = '900 46px I'; x.textAlign = 'center'; x.fillText('MANUAL', w / 2, 90); x.font = '600 26px I'; x.fillText('del propietario', w / 2, 130); x.strokeStyle = '#fff'; x.lineWidth = 6; x.beginPath(); x.arc(w / 2, 220, 50, 0, 6.29); x.stroke(); }); tx.position.z = .12; MANUAL.add(b, tx); }
// ---------- tablero gigante (zona B) ----------
const BX = -40; add(box(14, .3, 8, 0xd9d4c8)).position.set(BX, .15, 0);
const DASHT = canvasTex(1024, 600); const DB = add(new THREE.Group()); { const fr = rbox(9.4, 5.6, .5, .3, lp(0x16181d, { roughness: .5 })); const sc = M(new THREE.PlaneGeometry(8.8, 5.15), new THREE.MeshBasicMaterial({ map: DASHT.tx, toneMapped: false }), false); sc.position.z = .34; for (const x of [-3, 3]) { const lg = box(.3, 2.2, .3, 0x2a2d36); lg.position.set(x, -3.6, -.1); DB.add(lg); } DB.add(fr, sc); } DB.position.set(BX, 3.9, 0); DB.scale.setScalar(.7);
function drawDash(t) {
  const x = DASHT.x, w = 1024, h = 600; x.fillStyle = '#0d0f14'; x.fillRect(0, 0, w, h);
  // velocímetro
  x.save(); x.translate(300, 330); x.strokeStyle = 'rgba(255,255,255,.85)'; x.lineWidth = 6; x.beginPath(); x.arc(0, 0, 210, Math.PI * .8, Math.PI * 2.2); x.stroke();
  for (let i = 0; i <= 12; i++) { const a = Math.PI * .8 + i / 12 * Math.PI * 1.4; x.lineWidth = i % 2 ? 3 : 6; x.beginPath(); x.moveTo(Math.cos(a) * 190, Math.sin(a) * 190); x.lineTo(Math.cos(a) * 165, Math.sin(a) * 165); x.stroke(); }
  x.fillStyle = '#fff'; x.font = '800 70px I'; x.textAlign = 'center'; x.fillText('60', 0, 90); x.font = '600 24px I'; x.fillStyle = 'rgba(255,255,255,.6)'; x.fillText('km/h', 0, 125);
  const na = Math.PI * .8 + .45 * Math.PI * 1.4; x.strokeStyle = '#ff5a3c'; x.lineWidth = 8; x.beginPath(); x.moveTo(0, 0); x.lineTo(Math.cos(na) * 175, Math.sin(na) * 175); x.stroke(); x.restore();
  // indicador de gasolina
  x.save(); x.translate(760, 360); x.strokeStyle = 'rgba(255,255,255,.85)'; x.lineWidth = 6; x.beginPath(); x.arc(0, 0, 170, Math.PI * 1.15, Math.PI * 1.85); x.stroke(); x.font = '800 34px I'; x.fillStyle = '#fff'; x.fillText('E', -150, -40); x.fillText('F', 125, -40);
  const fa = Math.PI * 1.15 + .25 * Math.PI * .7; x.strokeStyle = '#ffb020'; x.lineWidth = 8; x.beginPath(); x.moveTo(0, 0); x.lineTo(Math.cos(fa) * 150, Math.sin(fa) * 150); x.stroke(); x.restore();
  // ícono de bomba + manguera + flecha
  const ix = 730, iy = 420; const hoseHi = inn(t, KW.manguerita - .2, KW.manda); const hoseX = inn(t, KW.siempre - .2, KW.manda);
  x.fillStyle = '#ffb020'; rrp(x, 0, ix - 30, iy - 50, 60, 90, 8); x.fill(); x.fillStyle = '#0d0f14'; x.fillRect(ix - 18, iy - 38, 36, 26);
  x.strokeStyle = hoseHi ? '#4aa8ff' : '#ffb020'; x.lineWidth = hoseHi ? 12 : 8; x.beginPath(); x.moveTo(ix + 30, iy - 30); x.lineTo(ix + 52, iy - 30); x.lineTo(ix + 52, iy + 20); x.lineTo(ix + 64, iy + 20); x.stroke();
  if (hoseHi) { x.strokeStyle = 'rgba(74,168,255,.6)'; x.lineWidth = 4; x.beginPath(); x.arc(ix + 52, iy - 5, 48, 0, 6.29); x.stroke(); }
  if (hoseX) { x.strokeStyle = '#ff4d4d'; x.lineWidth = 12; x.beginPath(); x.moveTo(ix + 22, iy - 50); x.lineTo(ix + 84, iy + 40); x.moveTo(ix + 84, iy - 50); x.lineTo(ix + 22, iy + 40); x.stroke(); }
  const dir = inn(t, KW.der - .1, KW.sirve) ? 1 : inn(t, KW.izq - .1, KW.der - .1) ? -1 : 1;
  const gone = t > KW.noTiene && t < KW.fijate; const hi = inn(t, KW.flechita - .2, KW.sirve) || inn(t, KW.manda - .2, KW.noTiene);
  if (!gone) { const ax = dir > 0 ? ix + 120 : ix - 90; x.save(); x.translate(ax, iy - 5); x.scale(dir, 1); const pul = hi ? 1 + .12 * Math.sin(t * 10) : 1; x.scale(pul, pul); x.fillStyle = hi ? '#ffd23a' : '#ffb020'; x.shadowColor = hi ? '#ffd23a' : 'transparent'; x.shadowBlur = hi ? 30 : 0; x.beginPath(); x.moveTo(26, 0); x.lineTo(-16, -26); x.lineTo(-16, 26); x.closePath(); x.fill(); x.restore(); if (hi) { x.strokeStyle = 'rgba(255,210,58,.8)'; x.lineWidth = 5; x.beginPath(); x.arc(ax, iy - 5, 52 + 6 * Math.sin(t * 8), 0, 6.29); x.stroke(); } }
  else { x.strokeStyle = 'rgba(255,255,255,.25)'; x.setLineDash([8, 8]); x.lineWidth = 4; x.beginPath(); x.arc(ix + 120, iy - 5, 40, 0, 6.29); x.stroke(); x.setLineDash([]); x.fillStyle = 'rgba(255,255,255,.5)'; x.font = '900 50px I'; x.textAlign = 'center'; x.fillText('?', ix + 120, iy + 12); }
  DASHT.tx.needsUpdate = true;
}
// ---------- tomas ----------
SHOTS = [
  [0, PS(1), [-6, 2.2, 15], [-3, 2.8, 14], [-12, 1, 6.5], [-4, 1, 6.5]],
  [PS(1), PS(2), [BX + 2, 4.2, 14], [BX + 1, 4.0, 12], [BX, 3.8, 0], [BX, 3.8, 0]],
  [PS(2), PS(4), [BX + 2.6, 3.8, 8], [BX + 2.2, 3.7, 6.8], [BX + 1.6, 3.6, 0], [BX + 1.7, 3.6, 0]],
  [PS(4), PS(8), [-9, 4.2, 1.5], [-8, 4.6, -1], [0, .9, 0], [0, .9, 0]],
  [PS(8), PS(11), [18, 9, 20], [20, 8, 18], [30, 1.5, 0], [30, 1.5, 0]],
  [PS(11), PS(14), [26, 4.2, 12], [24.5, 4.6, 12.5], [29, 1.4, 1.6], [28.5, 1.6, 1.6]],
  [PS(14), PS(15), [36, 6, 14], [24, 6, 14], [30, 2, 0], [30, 2, 0]],
  [PS(15), PS(20), [BX + 2.4, 3.9, 10], [BX + 2.0, 3.8, 8.5], [BX + 1.6, 3.6, 0], [BX + 1.6, 3.6, 0]],
  [PS(20), PS(21) + 1.2, [BX - 2, 4.2, 14], [BX, 4.2, 13], [BX - .5, 3.6, 0], [BX - .5, 3.6, 0]],
  [PS(21) + 1.2, PS(22), [30, 14, 18], [30, 12, 16], [30, 0, -1], [30, 0, -1]],
  [PS(22), END, [24, 7, 16], [22, 7.5, 18], [30, 1.5, 0], [30, 1.5, 0]]
];
SHAKE = [[KW.paras, KW.paras + .4, .05], [KW.verguenza, KW.verguenza + .7, .06]];
// ---------- animación ----------
function placeCar(p, yaw) { CAR.position.set(p.x, 0, p.z); CAR.rotation.y = yaw; }
function animWorld(t) {
  sunAt(t >= PS(1) && t < PS(4) || inn(t, PS(15), PS(21) + 1.2) ? BX : t < PS(8) ? 0 : 30, 0, 0, 16);
  drawDash(t);
  // carro
  for (const s of [1, -1]) { CAR.userData.doors[s].rotation.y = 0; CAR.userData['g' + s].material.opacity = 0; }
  const open = (s, a, b) => { const k = eout(P(t, a, .35)) * (1 - eout(P(t, b, .3))); CAR.userData.doors[s].rotation.y = -s * k * 1.4; CAR.userData['g' + s].material.opacity = k * (.6 + .3 * Math.sin(t * 8)); };
  if (t < PS(1)) { placeCar(V(lerp(-22, -6, eout(P(t, 0, 3.6))), 0, 6.5), 0); }
  else if (t < PS(8)) { placeCar(V(0, 0, 0), 0); open(1, KW.lado1, KW.izq - .1); open(-1, KW.izq, KW.der - .1); open(1, KW.der, PS(8)); }
  else if (t < PS(21) + 1.2) { const k = eout(P(t, KW.bomba - .3, KW.paras - KW.bomba + .5)); placeCar(V(lerp(8, 30, k), 0, 2.2), 0); open(1, KW.otro - .2, PS(21)); }
  else { const k = eio(P(t, PS(21) + 1.3, 3.2)); const p = loop.getPointAt(k), tg = loop.getTangentAt(Math.min(.999, k)); placeCar(p, Math.atan2(-tg.z, tg.x)); if (k >= 1) open(1, PS(21) + 4.4, END + 9); }
  // manguera
  HOSE.visible = inn(t, KW.manguera - .2, PS(14)); hoseG.setDrawRange(0, Math.floor(hoseG.index.count * eout(P(t, KW.manguera - .2, .9)) / 3) * 3);
  DASH.visible = inn(t, KW.vuelta - .2, KW.manguera - .2) || inn(t, PS(21) + 1.2, PS(22)); DASH.material.dashSize = .6;
  pop(MANUAL, t, KW.manual - .1, .45, KW.fijate + .2); MANUAL.position.set(BX - 3.4, 2.2, 2.5); MANUAL.rotation.set(0, .4 + Math.sin(t) * .1, 0);
}
// ---------- capa 2D ----------
function overlay2d(t) {
  floaters(t, 10, 'rgba(255,255,255,.7)', 'dust');
  pill(t, .4, PS(1) - .2, 540, 1380, 'AÑOS MANEJANDO…', C.amber, 'clock');
  pill(t, KW.mira, PS(2), 540, 1420, 'EL TABLERO DE TU CARRO', C.blue, 'arrow');
  pill(t, KW.flechita - .1, PS(4), 540, 1400, '¿VES LA FLECHITA?', C.amber, 'arrow');
  pill(t, KW.lado1 - .2, PS(5), 540, 1430, 'EL LADO DE LA TAPA', C.amber, 'star');
  pill(t, KW.izq - .2, KW.der - .2, 540, 1430, 'FLECHA ◀ = TAPA IZQUIERDA', C.blue, 'check');
  pill(t, KW.der - .2, PS(7), 540, 1430, 'FLECHA ▶ = TAPA DERECHA', C.blue, 'check');
  punch(t, KW.facil - .2, PS(8), [['ASÍ DE', '#ffffff'], ['FÁCIL', C.green]], 540, 1200);
  pill(t, KW.prestado - .2, PS(11), 540, 1420, 'CARRO PRESTADO O RENTADO', C.amber, 'star');
  pill(t, KW.otro - .2, KW.vuelta - .1, 540, 1430, 'LA TAPA ESTÁ DEL OTRO LADO', C.red, 'x');
  pill(t, KW.vuelta - .1, KW.manguera - .2, 540, 1430, 'DAR LA VUELTA', C.amber, 'arrow');
  pill(t, KW.manguera - .2, KW.verguenza - .3, 540, 1430, 'ESTIRAR LA MANGUERA', C.amber, 'warn');
  punch(t, KW.verguenza - .2, PS(14) - .1, [['¡QUÉ', '#ffffff'], ['VERGÜENZA!', C.red]], 540, 1200, { size: 100 });
  punch(t, KW.susc - .1, PE(14) + .2, [['¡SUSCRÍBETE!', '#ffffff']], 540, 1200, { stamp: '#ff2d3d', size: 92, rot: -.05 });
  pill(t, KW.falso - .3, PS(17), 540, 1420, 'TRUCO FALSO DE INTERNET', C.red, 'warn');
  pill(t, KW.manguerita - .2, PS(18), 540, 1420, '"EL LADO DE LA MANGUERITA"', C.blue, 'quote');
  punch(t, KW.siempre - .3, PS(19), [['NO', C.red], ['SIEMPRE', '#ffffff']], 540, 1260, { size: 104 });
  punch(t, KW.manda - .3, PS(20), [['MANDA LA', '#ffffff'], ['FLECHA', C.amber]], 540, 1200, { size: 96 });
  pill(t, KW.noTiene - .2, KW.manual, 540, 1420, '¿TU CARRO NO TIENE FLECHA?', C.amber, 'warn');
  pill(t, KW.manual, PS(22), 540, 1420, 'MIRA EL MANUAL O FÍJATE BIEN', C.green, 'check');
  pill(t, PS(21) + 4.4, PS(22), 540, 1500, 'LADO CORRECTO', C.green, 'check');
  question(t, KW.coment, '¿Ya lo sabías?', ['Sí, ya lo sabía', 'Me acabo de enterar', 'Mi carro no tiene flecha'], 1300);
}
