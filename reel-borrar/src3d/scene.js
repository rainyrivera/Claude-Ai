// ================= LO QUE BORRAS NO SE BORRA =================
const DISC = 'Recreación ilustrativa · simplificado';
const KW = { borraste: T('borraste'), vendes: T('vendes'), recup1: T('recuperar'), papel1: T('papelera'), dias: T('días'), recup2: T('recuperar', 2), curioso: T('curioso'), vacies: T('vacíes'), verdad: T('verdad'), biblio: T('biblioteca'), indice2: T('índice', 2), estante: T('estante'), libre: T('libre'), encima1: T('encima'), susc: T('suscríbete'), programas: T('programas'), querer: T('querer'), usar: T('usar'), ayuda: T('ayuda'), encima2: T('encima', 2), vender: T('vender'), fotos: T('fotos'), copia: T('copia'), resta: T('restablecimiento'), coment: T('comentarios') };
// ---------- ZONA A: plaza con el celular gigante ----------
add(road(0, 9, 120)); [[-9, -10, 4, 3, 7, 0xe8d7b0], [9, -12, 5, 3, 9, 0xd9c9a6], [-16, -14, 4, 3, 5, 0xf0e0c0], [17, -9, 4, 3, 6, 0xe2d2b0]].forEach(b => building(...b));
[[-6, 3], [9, -1.5], [-11, 1], [12, 1.5]].forEach(([x, z]) => tree(x, z, 1.2));
add(box(9, .2, 6, 0xd9d4c8)).position.set(0, .1, 1);
const PHN = add(new THREE.Group()); PHN.position.set(0, .2, 0);
{ const body = rbox(3.1, 6.2, .32, .08, lp(0x1d2029, { roughness: .4 })); body.position.y = 3.1; PHN.add(body); const cam1 = cyl(.12, .12, .05, 0x0b0d12); cam1.rotation.x = Math.PI / 2; cam1.position.set(0, 5.95, .17); PHN.add(cam1); const st = box(1.6, .25, 1.2, 0x9aa0aa); st.position.set(0, .12, .2); PHN.add(st); }
const SCR = canvasTex(512, 1024); const scr = M(new THREE.PlaneGeometry(2.86, 5.9), new THREE.MeshBasicMaterial({ map: SCR.tx, toneMapped: false }), false); scr.position.set(0, 3.1, .2); PHN.add(scr);
function photoArt(x, w, h) { const gr = x.createLinearGradient(0, 0, 0, h); gr.addColorStop(0, '#ff9a5a'); gr.addColorStop(.55, '#ffd27a'); gr.addColorStop(.56, '#2f8fd8'); gr.addColorStop(1, '#1d5fa8'); x.fillStyle = gr; x.fillRect(0, 0, w, h); x.fillStyle = '#fff2b0'; x.beginPath(); x.arc(w * .5, h * .55, w * .16, Math.PI, 0); x.fill(); x.fillStyle = '#f1d9a0'; x.fillRect(0, h * .82, w, h * .18); x.fillStyle = '#2d6b3a'; x.beginPath(); x.moveTo(w * .12, h * .82); x.lineTo(w * .16, h * .45); x.lineTo(w * .2, h * .82); x.fill(); x.beginPath(); x.ellipse(w * .16, h * .45, w * .12, h * .05, 0, 0, 6.29); x.fill(); }
// la foto 3D (sale de la pantalla)
const PHOTO = add(new THREE.Group()); { const fr = box(1.6, 1.25, .06, 0xffffff); PHOTO.add(fr); const pl = texPlane(1.46, 1.11, 256, 196, photoArt); pl.position.z = .035; PHOTO.add(pl); }
const photoMats = []; PHOTO.traverse(o => { if (o.isMesh) { o.material = o.material.clone(); o.material.transparent = true; photoMats.push(o.material); } });
// cartel SE VENDE
const SALE = add(texPlane(2.2, .8, 440, 160, (x, w, h) => { x.fillStyle = '#ffd23a'; rrp(x, 0, 4, 4, w - 8, h - 8, 18); x.fill(); x.strokeStyle = '#1a1a1a'; x.lineWidth = 8; x.stroke(); x.fillStyle = '#1a1a1a'; x.font = '900 86px I'; x.textAlign = 'center'; x.textBaseline = 'middle'; x.fillText('SE VENDE', w / 2, h / 2 + 4); }, false)); SALE.position.set(.9, 4.9, .6); SALE.rotation.z = -.12;
// lupa (otra persona recupera)
const LUPA = add(new THREE.Group()); { const r = M(new THREE.TorusGeometry(.6, .1, 10, 32), lp(0x2a2d36)); const gl = M(new THREE.CircleGeometry(.58, 32), new THREE.MeshStandardMaterial({ color: 0xbfe6ff, transparent: true, opacity: .35 }), false); const h = cyl(.09, .09, 1.2, 0x7a5230); h.position.set(.75, -.75, 0); h.rotation.z = Math.PI / 4; LUPA.add(r, gl, h); }
// papelera gigante
const BIN = add(new THREE.Group()); BIN.position.set(4.6, .2, 1.2);
{ const b = cyl(1.05, .85, 2.2, lp(0x3d7bff), 32); b.position.y = 1.1; BIN.add(b); for (let i = 0; i < 8; i++) { const r = box(.06, 1.9, .06, 0x2a5ed0); const a = i / 8 * Math.PI * 2; r.position.set(Math.sin(a) * .98, 1.1, Math.cos(a) * .98); BIN.add(r); } }
const LID = new THREE.Group(); LID.position.set(-1.05, 2.25, 0); BIN.add(LID); { const l = cyl(1.12, 1.12, .14, lp(0x2a5ed0), 32); l.position.x = 1.05; LID.add(l); const kn = box(.4, .14, .14, 0x1c3f99); kn.position.set(1.05, .12, 0); LID.add(kn); }
// nube (copia) + botón rojo
const CLOUD = add(new THREE.Group()); for (let k = 0; k < 6; k++) { const s = sph(.55 + (k % 3) * .15, lp(0xffffff, { roughness: 1 }), 14); s.position.set(k * .5 - 1.25, (k % 2) * .25, 0); s.scale.y = .8; CLOUD.add(s); } CLOUD.position.set(-2.8, 7.2, 0);
const BTN = add(new THREE.Group()); { const pd = cyl(.7, .8, 1.1, 0xe6e6e6); pd.position.y = .55; const cap = cyl(.5, .5, .25, lp(0xff2d3d, { emissive: 0x550000 })); cap.position.y = 1.2; cap.name = 'cap'; BTN.add(pd, cap); } BTN.position.set(-3.6, .2, 2.2);
const CUBES = []; for (let i = 0; i < 6; i++) { const c = box(.35, .28, .04, 0xffffff); const p = texPlane(.31, .24, 64, 48, photoArt); p.position.z = .025; c.add(p); add(c); CUBES.push(c); }
const LAPTOP = add(new THREE.Group()); { const b = box(2.2, .1, 1.5, 0x9aa0aa); const s = box(2.2, 1.45, .08, 0x1d2029); s.position.set(0, .72, -.72); s.rotation.x = -.15; const sc = texPlane(2.0, 1.25, 256, 160, (x, w, h) => { x.fillStyle = '#2b6cd6'; x.fillRect(0, 0, w, h); x.fillStyle = '#fff'; x.font = '800 30px I'; x.textAlign = 'center'; x.fillText('Mis fotos', w / 2, 40); for (let i = 0; i < 6; i++) { x.fillStyle = ['#ffb020', '#3ddc84', '#ff4d4d', '#a98bff', '#4aa8ff', '#ffd27a'][i]; x.fillRect(24 + (i % 3) * 74, 64 + Math.floor(i / 3) * 46, 60, 38); } }); sc.position.set(0, .72, -.67); sc.rotation.x = -.15; LAPTOP.add(b, s, sc); } LAPTOP.position.set(3.2, 1.4, 2.2); LAPTOP.rotation.y = -.35;
const tableA = add(box(2.6, 1.2, 1.8, 0xc9a77c)); tableA.position.set(3.2, .8, 2.2);
// ---------- ZONA B: el disco por dentro = biblioteca ----------
const BX = 40; add(box(16, .3, 10, 0xe9e4d8)).position.set(BX, .15, -1);
for (const z of [-6]) { const wl = box(16, 7, .3, 0xf3ead8); wl.position.set(BX, 3.5, z); add(wl); }
const SHELF = add(new THREE.Group()); SHELF.position.set(BX + 1.2, .3, -4.6);
{ const wd = lp(0x9a6a40); for (const x of [-3.6, 3.6]) { const s = box(.2, 5.2, 1.2, wd); s.position.set(x, 2.6, 0); SHELF.add(s); } for (let l = 0; l < 5; l++) { const b = box(7.4, .14, 1.2, wd); b.position.set(0, .1 + l * 1.25, 0); SHELF.add(b); } const bk = box(7.4, 5.2, .1, lp(0x7a5230)); bk.position.set(0, 2.6, -.55); SHELF.add(bk); }
const bookCols = [0xff4d4d, 0x4aa8ff, 0x3ddc84, 0xffb020, 0xa98bff, 0xff8a3d, 0x2a9d8f, 0xe76f51, 0x6c757d];
const BOOKS = []; for (let l = 0; l < 4; l++) { let x = -3.35; while (x < 3.3) { const w = .18 + rnd() * .14, h = .75 + rnd() * .35; const b = box(w, h, .8, bookCols[Math.floor(rnd() * bookCols.length)]); b.position.set(x + w / 2, .17 + l * 1.25 + h / 2, 0); SHELF.add(b); BOOKS.push({ b, l, x: x + w / 2 }); x += w + .02; } }
// el libro "foto" (rojo brillante) en el estante 2
const TB = BOOKS.filter(o => o.l === 1)[9]; const TBM = lp(0xff2d3d, { emissive: 0xff2d3d, emissiveIntensity: 0 }); TB.b.material = TBM; const tbPos = () => TB.b.getWorldPosition(new THREE.Vector3());
const FREE = add(M(new THREE.BoxGeometry(.6, 1.2, 1.0), new THREE.MeshBasicMaterial({ color: 0x3ddc84, transparent: true, opacity: 0, depthWrite: false, depthTest: false }), false)); FREE.renderOrder = 5;
const ARW = add(new THREE.Group()); { const c = M(new THREE.ConeGeometry(.28, .5, 16), lp(0xffb020, { emissive: 0x553300 })); c.rotation.x = Math.PI; const st = cyl(.1, .1, .6, 0xffb020); st.position.y = .55; ARW.add(c, st); }
const NEWB = add(box(.5, 1.0, .82, lp(0x4aa8ff, { transparent: true, opacity: .55 })));
const RAIN = []; for (let i = 0; i < 9; i++) { const b = box(.32, .9, .8, bookCols[i % bookCols.length]); add(b); RAIN.push(b); }
// índice (pizarra)
const IDX = canvasTex(512, 640); const idxB = add(new THREE.Group()); { const fr = box(3.1, 3.8, .14, 0x7a5230); const pl = M(new THREE.PlaneGeometry(2.9, 3.6), new THREE.MeshBasicMaterial({ map: IDX.tx, toneMapped: false }), false); pl.position.z = .08; const lg = box(.12, 1.6, .12, 0x5a3a20); lg.position.set(0, -2.6, -.2); idxB.add(fr, pl, lg); } idxB.position.set(BX - 4.6, 3.1, -1.2); idxB.rotation.y = .35;
function drawIndex(strike) { const x = IDX.x; x.fillStyle = '#163a2c'; x.fillRect(0, 0, 512, 640); x.fillStyle = '#fff'; x.font = '900 46px I'; x.textAlign = 'center'; x.fillText('ÍNDICE', 256, 64); x.textAlign = 'left'; x.font = '600 28px I';
  const rows = [['boda.jpg', 'Est. 1'], ['playa.jpg', 'Est. 2'], ['trabajo.pdf', 'Est. 3'], ['chat.txt', 'Est. 1'], ['video.mp4', 'Est. 4'], ['notas.doc', 'Est. 3']];
  rows.forEach((r, i) => { const y = 140 + i * 78; const hot = i === 1; x.fillStyle = hot ? '#ffd27a' : 'rgba(255,255,255,.88)'; x.fillText(r[0], 40, y); x.fillText('→ ' + r[1], 330, y); if (hot && strike > 0) { x.strokeStyle = '#ff4d4d'; x.lineWidth = 9; x.beginPath(); x.moveTo(30, y - 9); x.lineTo(30 + 450 * strike, y - 9); x.stroke(); } });
  IDX.tx.needsUpdate = true; }
// garra (programa de recuperación)
const CLAW = add(new THREE.Group()); { const r = box(.12, 6, .12, 0x2a2d36); r.position.y = 3; const h = box(.7, .3, .5, lp(0x4aa8ff)); const f1 = box(.08, .6, .4, 0x2a2d36); f1.position.set(-.3, -.4, 0); const f2 = f1.clone(); f2.position.x = .3; CLAW.add(r, h, f1, f2); }
// STOP
const STOPS = add(new THREE.Group()); { const o = M(new THREE.CylinderGeometry(1, 1, .1, 8), lp(0xe02424)); o.rotation.x = Math.PI / 2; o.rotation.y = Math.PI / 8; const tx = texPlane(1.5, .55, 256, 96, (x, w, h) => { x.fillStyle = '#fff'; x.font = '900 80px I'; x.textAlign = 'center'; x.textBaseline = 'middle'; x.fillText('STOP', w / 2, h / 2 + 4); }); tx.position.z = .06; const pst = box(.12, 2.4, .12, 0x9aa0aa); pst.position.y = -1.9; STOPS.add(o, tx, pst); } STOPS.position.set(BX - 1.6, 3.4, 1.8);

// ---------- tomas de cámara [t0, t1, pos0, pos1, look0, look1, fov] ----------
const tB = PS(9);
SHOTS = [
  [0, PS(4) - .2, [-1, 4.2, 15.5], [.6, 3.9, 14], [0, 3.3, 0], [0, 3.2, 0]],
  [PS(4) - .2, KW.curioso, [1.2, 3.8, 16], [2.6, 3.6, 15], [2.2, 2.4, 0], [3.2, 2.2, .6]],
  [KW.curioso, tB, [4.0, 4.2, 12.5], [4.4, 5.0, 10.5], [4.5, 1.7, 1.2], [4.6, 1.4, 1.2]],
  [tB, PS(10) + .3, [BX + 1, 5, 21], [BX + .5, 4.4, 18], [BX - .8, 2.8, -2], [BX - .8, 2.8, -2]],
  [PS(10) + .3, PS(11), [BX - 2.2, 3.6, 8.5], [BX - 2.6, 3.4, 7.4], [BX - 4.6, 3.1, -1.2], [BX - 4.6, 3.1, -1.2]],
  [PS(11), PS(14), [BX + 1.4, 3.0, 8.5], [BX + .2, 2.7, 7], [BX - .3, 2.0, -4.6], [BX - .3, 2.0, -4.6]],
  [PS(14), PS(15), [BX + 4, 4.2, 15], [BX - 2, 4.2, 15], [BX, 2.6, -3], [BX, 2.6, -3]],
  [PS(15), PS(17), [BX + 1.2, 3.6, 9.5], [BX + .4, 3.8, 9], [BX - .3, 2.6, -4.6], [BX - .3, 3.0, -4.6]],
  [PS(17), PS(19), [BX + 1, 4.4, 16], [BX - .5, 4.8, 17], [BX - .5, 2.8, -2], [BX, 2.8, -2.5]],
  [PS(19), PS(22), [2, 4.4, 17], [.8, 5.0, 18.5], [.6, 3.5, 0], [.2, 4.0, 0]],
  [PS(22), END, [0, 6, 21], [0, 6.6, 22.5], [0, 4.2, 0], [0, 4.2, 0]]
];
SHAKE = [[PS(18) + .3, PS(18) + 1.2, .07], [KW.resta + .2, KW.resta + .8, .08]];

function drawScreen(t) {
  const x = SCR.x, w = 512, h = 1024; const reset = t > KW.resta + .3;
  x.fillStyle = reset ? '#111827' : '#f4f6fb'; x.fillRect(0, 0, w, h);
  if (reset) { x.fillStyle = '#fff'; x.font = '800 74px I'; x.textAlign = 'center'; x.fillText('Hola', w / 2, 470); x.font = '500 30px I'; x.fillStyle = 'rgba(255,255,255,.7)'; x.fillText('Configura tu teléfono', w / 2, 530); x.fillStyle = '#3d8bff'; rrp(x, 0, 156, 800, 200, 70, 35); x.fill(); SCR.tx.needsUpdate = true; return; }
  x.fillStyle = '#16161c'; x.font = '800 40px I'; x.textAlign = 'left'; x.fillText('Galería', 34, 110);
  for (let i = 0; i < 12; i++) { const cx = 24 + (i % 3) * 158, cy = 150 + Math.floor(i / 3) * 158; if (i === 4) continue; x.fillStyle = ['#ffd27a', '#9fd6f2', '#c8e6a0', '#f7b2b7', '#d0c4f7', '#ffe0a3'][i % 6]; x.fillRect(cx, cy, 148, 148); }
  // hueco de la foto 4
  const gone = t > KW.borraste + .2 && t < PS(1) + .4; x.strokeStyle = '#3d8bff'; x.lineWidth = 4; x.setLineDash([10, 8]); x.strokeRect(24 + 158, 150 + 158, 148, 148); x.setLineDash([]);
  if (!gone) { x.save(); x.translate(24 + 158, 150 + 158); photoArt(x, 148, 148); x.restore(); }
  SCR.tx.needsUpdate = true;
}
// ---------- animación del mundo ----------
function animWorld(t) {
  sunAt(t < tB || t >= PS(19) ? 0 : BX, 0, 0, 14);
  drawScreen(t); drawIndex(eout(P(t, PS(10) + .8, .7)));
  // foto: sale de la pantalla → fantasma → vuelve → papelera → vuelve → vaciado
  const base = V(0, 3.3, 1.0); let pp = base.clone(), op = 1, sc = 1, vis = t < KW.vacies + 1.5;
  if (t < KW.borraste) { const k = eback(P(t, .1, .5)); sc = k; }
  else if (t < PS(1)) { op = lerp(1, .22, P(t, KW.borraste, .35)); }
  else if (t < PS(4)) { op = lerp(.22, 1, P(t, PS(1) + .3, .5)) * (t < PS(1) + 1 ? (.6 + .4 * Math.sin(t * 40)) : 1); }
  if (inn(t, KW.papel1 - .4, PS(6))) { const k = eio(P(t, KW.papel1 - .4, .9)); const end = V(4.6, 2.9, 1.2); pp = base.clone().lerp(end, k); pp.y += Math.sin(k * Math.PI) * 2; sc = lerp(1, .55, k); op = 1; }
  if (inn(t, PS(6), KW.curioso)) { const k = eback(P(t, PS(6) + .2, .6)); pp = V(4.6, lerp(2.9, 4.6, k), 1.4); sc = .8; }
  if (t >= KW.curioso) { const k = P(t, KW.vacies + .3, 1.0); pp = V(4.6, lerp(3.0, -1.5, k * k), 1.2); sc = .55; }
  PHOTO.visible = vis && t < tB; PHOTO.position.copy(pp); PHOTO.scale.setScalar(Math.max(.001, sc)); PHOTO.rotation.set(0, Math.sin(t * 1.2) * .08, Math.sin(t * .9) * .04); photoMats.forEach(m => m.opacity = op);
  // tapa de la papelera
  const lidOpen = Math.max(eout(P(t, KW.papel1 - .5, .3)) * (1 - eout(P(t, KW.papel1 + .7, .3))), eout(P(t, PS(6), .25)) * (1 - eout(P(t, PS(6) + .9, .3))), eout(P(t, KW.vacies, .3)) * (1 - eout(P(t, KW.vacies + 1.6, .3))));
  LID.rotation.z = lidOpen * 1.7 + (inn(t, KW.curioso, KW.vacies) ? Math.sin(t * 30) * .05 : 0);
  BIN.rotation.z = inn(t, KW.vacies, KW.vacies + 1.4) ? -Math.sin(P(t, KW.vacies, 1.4) * Math.PI) * .5 : 0;
  pop(SALE, t, KW.vendes, .45, PS(4)); if (t >= PS(19)) pop(SALE, t, KW.vender, .45, PS(22));
  LUPA.visible = inn(t, PS(3), PS(4)); if (LUPA.visible) { const k = P(t, PS(3), PE(3) - PS(3)); LUPA.position.set(lerp(-1.6, .4, k), 3.4 + Math.sin(k * 6) * .3, 2.2); LUPA.scale.setScalar(eback(P(t, PS(3), .35))); }
  // zona B
  TBM.emissiveIntensity = inn(t, PS(11), PS(19)) ? .9 + .6 * Math.sin(t * 6) : 0;
  const tp = tbPos(); ARW.visible = inn(t, PS(11), PS(15)); ARW.position.set(tp.x, tp.y + .95 + Math.sin(t * 5) * .1, tp.z + 1.0); ARW.scale.setScalar(.7); FREE.position.copy(tp); FREE.material.opacity = inn(t, KW.libre - .2, PS(17)) ? .45 * eout(P(t, KW.libre - .2, .4)) : 0;
  NEWB.visible = inn(t, KW.encima1 - 1.2, PS(14) + .4); if (NEWB.visible) { const k = eout(P(t, KW.encima1 - 1.2, .8)), back = eio(P(t, PS(14) - .2, .6)); NEWB.position.set(tp.x, tp.y + lerp(4, 1.3, k) + back * 4, tp.z + .1); NEWB.rotation.z = Math.sin(t * 3) * .05; }
  // garra: baja, agarra y sube el libro
  CLAW.visible = inn(t, PS(15) - .3, PS(17)); if (CLAW.visible) { const dn = eio(P(t, PS(15), 1.0)), up = eio(P(t, PS(15) + 1.6, 1.1)); CLAW.position.set(tp.x, lerp(9, tp.y + 1.0, dn) + up * 1.6, tp.z + .1); }
  if (inn(t, PS(15) + 1.6, PS(17))) { const up = eio(P(t, PS(15) + 1.6, 1.1)); TB.b.position.y = .17 + 1.25 + TB.b.geometry.parameters.height / 2 + up * 1.6; } else TB.b.position.y = .17 + 1.25 + TB.b.geometry.parameters.height / 2;
  pop(STOPS, t, KW.usar - .1, .45, PS(18) + .3);
  RAIN.forEach((b, i) => { const a = PS(18) + i * .18; b.visible = inn(t, a, PS(19)); if (b.visible) { const x = BX - 2.6 + i * .7, k = P(t, a, .55); b.position.set(x, lerp(9, 3.0 + (i % 2) * 1.25, k * k), -4.6); b.rotation.z = (1 - k) * 2 + (i % 3 - 1) * .15; } });
  // zona A final: laptop, copia en la nube, botón
  pop(LAPTOP, t, KW.vender + .3, .45); tableA.visible = LAPTOP.visible; if (tableA.visible) tableA.scale.copy(LAPTOP.scale);
  pop(CLOUD, t, KW.copia - .2, .5); CUBES.forEach((c, i) => { const a = KW.copia + i * .15; c.visible = inn(t, a, a + 1.4); if (c.visible) { const k = eio(P(t, a, 1.2)); c.position.set(lerp(-.6 + (i % 3) * .6, -2.8, k), lerp(3.5 + Math.floor(i / 3) * .7, 7.2, k), lerp(1.2, 0, k)); c.scale.setScalar(1 - k * .7); } });
  pop(BTN, t, KW.resta - .8, .4); const cap = BTN.getObjectByName('cap'); cap.position.y = 1.2 - .14 * Math.sin(P(t, KW.resta, .35) * Math.PI);
}
// ---------- capa 2D ----------
function overlay2d(t) {
  floaters(t, 12, 'rgba(255,255,255,.8)', 'dust');
  pill(t, KW.borraste + .1, PS(1), 540, 1240, 'FOTO BORRADA', C.red, 'x');
  punch(t, PS(1) + .3, PS(2), [['SIGUE', '#ffffff'], ['AHÍ', C.amber]], 540, 1260);
  pill(t, KW.vendes + .2, PS(3), 540, 1300, 'VENDES TU CELULAR', C.amber, 'dot');
  pill(t, PS(3) + .2, PS(4) - .2, 540, 1300, 'OTRA PERSONA LA RECUPERA', C.red, 'warn');
  pill(t, KW.papel1 + .2, PS(5), 540, 1320, 'A LA PAPELERA', C.blue, 'arrow');
  pill(t, KW.dias - .3, PS(6), 540, 1320, '30 DÍAS EN LA PAPELERA', C.amber, 'clock');
  pill(t, PS(6) + .3, KW.curioso - .1, 540, 1320, 'FÁCIL DE RECUPERAR', C.green, 'check');
  pill(t, KW.vacies, KW.verdad, 540, 1330, 'PAPELERA VACIADA', C.blue, 'check');
  punch(t, KW.verdad - .5, tB - .2, [['NO SE', '#ffffff'], ['BORRA', C.red]], 540, 1160);
  pill(t, KW.biblio + .2, PS(10) + .2, 540, 1460, 'TU DISCO = UNA BIBLIOTECA', C.amber, 'star');
  pill(t, KW.indice2 - .2, PS(11), 540, 1380, 'SE BORRA DEL ÍNDICE', C.red, 'x');
  pill(t, KW.estante - .3, PS(12), 540, 1380, 'EL LIBRO SIGUE EN EL ESTANTE', C.green, 'check');
  pill(t, KW.libre - .2, PS(13), 540, 1380, 'ESPACIO "LIBRE"', C.green, 'dot');
  pill(t, PS(13) + .3, PS(14), 540, 1380, 'HASTA QUE SE GUARDE ALGO ENCIMA', C.amber, 'warn', 32);
  punch(t, KW.susc - .1, PE(14) + .2, [['¡SUSCRÍBETE!', '#ffffff']], 540, 1180, { stamp: '#ff2d3d', size: 92, rot: -.05 });
  pill(t, KW.programas, PS(16), 540, 1420, 'PROGRAMA DE RECUPERACIÓN', C.blue, 'check');
  pill(t, KW.querer - .2, PS(17), 540, 1420, '¿LO BORRASTE SIN QUERER?', C.amber, 'warn');
  pill(t, KW.usar - .1, PS(18), 540, 1420, 'DEJA DE USARLO', C.red, 'x');
  pill(t, KW.ayuda - .1, PS(18) + .2, 540, 1520, 'BUSCA AYUDA RÁPIDO', C.green, 'arrow');
  pill(t, PS(18) + .2, PS(19), 540, 1460, 'ANTES DE QUE SE GUARDE ALGO ENCIMA', C.amber, 'clock', 31);
  pill(t, KW.fotos - .4, PS(21), 540, 1380, 'NO BASTA CON BORRAR LAS FOTOS', C.red, 'x');
  pill(t, KW.copia - .1, KW.resta, 540, 1380, '1. COPIA DE LO TUYO', C.blue, 'check');
  pill(t, KW.resta, PS(22), 540, 1380, '2. RESTABLECIMIENTO DE FÁBRICA', C.green, 'check', 33);
  punch(t, KW.resta + .5, PS(22) - .1, [['RESTABLECIDO', '#ffffff']], 540, 1160, { stamp: '#1f9d55', size: 78, rot: -.06 });
  question(t, KW.coment, '¿Qué borraste sin querer?', ['Fotos', 'Un chat', 'Un trabajo', 'Contactos', 'Un video'], 1250);
}
