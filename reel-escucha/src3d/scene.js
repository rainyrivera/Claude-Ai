// ================= ¿TU CELULAR TE ESCUCHA? =================
const DISC = (t) => inn(t, PS(4), PS(9)) ? 'Fuente: FTC (EE. UU.) sobre "Active Listening" de Cox Media Group' : 'Recreación ilustrativa · simplificado';
const KW = { zapatos1: T('zapatos'), zapatos2: T('zapatos', 2), escuchando: T('escuchando'), rara: T('rara'), empresa: T('empresa'), microfono1: T('micrófono'), anuncios: T('anuncios'), panico: T('pánico'), gobierno: T('gobierno'), inventado: T('inventado'), nadie: T('nadie'), susc: T('suscríbete'), sabe1: T('sabe'), oirte: T('oírte'), buscas: T('buscas'), estas: T('estás'), compras: T('compras'), videos: T('videos'), foto: T('foto'), adivina: T('adivina'), digas: T('digas'), microfono2: T('micrófono', 2), verde: T('verde'), naranja: T('naranja'), camara: T('cámara'), ajustes: T('ajustes'), permiso: T('permiso'), coment: T('comentarios') };
add(road(30, 9, 200));
[[-12, -10, 5, 3, 6, 0xe8d7b0], [12, -12, 5, 3, 8, 0xd9c9a6], [100, -10, 5, 3, 6, 0xf0e0c0], [-22, -8, 4, 3, 4, 0xe2d2b0]].forEach(b => building(...b));
[[-7, 3], [7, 3.5], [33, 4], [52, 4], [72, 4], [92, 4]].forEach(([x, z]) => tree(x, z, 1.3));
// ---------- ZONA A: sofá, zapato, celular gigante ----------
add(box(10, .2, 6, 0xd9d4c8)).position.set(0, .1, 0);
const SOFA = add(new THREE.Group()); { const m = lp(0x3d7bff); const s = box(3.4, .6, 1.2, m); s.position.y = .6; const bk = box(3.4, 1.0, .3, m); bk.position.set(0, 1.2, -.45); const a1 = box(.3, .8, 1.2, m); a1.position.set(-1.7, .9, 0); const a2 = a1.clone(); a2.position.x = 1.7; SOFA.add(s, bk, a1, a2); } SOFA.position.set(-1.8, .2, .4);
function makeShoe(col) { const g0 = new THREE.Group(); const sole = rbox(1.5, .22, .6, .08, lp(0xffffff)); sole.position.y = .11; const up = rbox(1.2, .5, .55, .18, lp(col)); up.position.set(-.1, .42, 0); const toe = sph(.28, lp(col)); toe.scale.set(1.1, .8, .95); toe.position.set(.45, .3, 0); const lace = box(.5, .04, .3, 0xffffff); lace.position.set(.1, .66, 0); lace.rotation.z = -.25; g0.add(sole, up, toe, lace); return g0; }
const SHOE = add(makeShoe(0xff4d4d)); SHOE.position.set(-1.8, 3.2, .6);
const BUB = []; for (const [x, c] of [[-2.9, 0xffffff], [-.7, 0xffffff]]) { const b = add(new THREE.Group()); const s = sph(.55, lp(c, { roughness: .9 }), 16); s.scale.set(1.3, 1, .4); const tl = M(new THREE.ConeGeometry(.15, .4, 8), lp(c)); tl.position.set(.2, -.55, 0); tl.rotation.z = .5; b.add(s, tl); b.position.set(x, 2.6, .6); BUB.push(b); }
const PHN = add(new THREE.Group()); PHN.position.set(2.2, .2, .4);
{ const body = rbox(2.2, 4.4, .25, .07, lp(0x1d2029, { roughness: .4 })); body.position.y = 2.4; PHN.add(body); const st = box(1.2, .2, .9, 0x9aa0aa); st.position.set(0, .1, .1); PHN.add(st); }
const SCR = canvasTex(400, 800); const scr = M(new THREE.PlaneGeometry(2.04, 4.2), new THREE.MeshBasicMaterial({ map: SCR.tx, toneMapped: false }), false); scr.position.set(0, 2.4, .14); PHN.add(scr);
function drawShoe2d(x, cx, cy, s) { x.save(); x.translate(cx, cy); x.scale(s, s); x.fillStyle = '#fff'; rrp(x, 0, -80, 20, 170, 24, 10); x.fill(); x.fillStyle = '#ff4d4d'; x.beginPath(); x.moveTo(-75, 22); x.lineTo(-60, -40); x.lineTo(10, -40); x.quadraticCurveTo(80, -10, 88, 22); x.closePath(); x.fill(); x.strokeStyle = '#fff'; x.lineWidth = 5; for (let i = 0; i < 3; i++) { x.beginPath(); x.moveTo(-20 + i * 18, -36); x.lineTo(-8 + i * 18, -18); x.stroke(); } x.restore(); }
function drawScreen(t) {
  const x = SCR.x, w = 400, h = 800; x.fillStyle = '#f4f6fb'; x.fillRect(0, 0, w, h);
  // barra de estado
  x.fillStyle = '#16161c'; x.font = '700 24px I'; x.textAlign = 'left'; x.fillText('9:41', 24, 40); x.textAlign = 'right'; x.fillText('▮▮▮ 87%', w - 20, 40);
  const dot = inn(t, KW.verde - .3, PS(20)) ? (t < KW.naranja - .1 ? '#22c55e' : '#f59e0b') : null; if (dot) { const pr = 1 + .25 * Math.sin(t * 8); x.fillStyle = dot; x.beginPath(); x.arc(w / 2 + 70, 32, 11 * pr, 0, 6.29); x.fill(); x.strokeStyle = dot; x.lineWidth = 3; x.beginPath(); x.arc(w / 2 + 70, 32, 22 + 6 * Math.sin(t * 8), 0, 6.29); x.stroke(); }
  if (t >= PS(20)) { // ajustes > privacidad > micrófono
    x.fillStyle = '#16161c'; x.textAlign = 'left'; x.font = '800 34px I'; x.fillText('Privacidad', 24, 110); x.font = '600 22px I'; x.fillStyle = '#6b7280'; x.fillText('Micrófono', 24, 148);
    const apps = [['Juego de frutas', '#ff8a3d'], ['Linterna', '#a98bff'], ['Calculadora', '#4aa8ff'], ['Notas de voz', '#ef4444'], ['WhatsApp', '#22c55e']];
    apps.forEach(([n, c], i) => { const y = 200 + i * 104; x.fillStyle = '#fff'; rrp(x, 0, 16, y - 40, w - 32, 88, 18); x.fill(); x.fillStyle = c; rrp(x, 0, 32, y - 22, 52, 52, 12); x.fill(); x.fillStyle = '#16161c'; x.font = '700 24px I'; x.fillText(n, 100, y + 10);
      const off = i < 3 && t > KW.permiso - .6 + i * .35; const k = off ? eout(P(t, KW.permiso - .6 + i * .35, .25)) : 0; x.fillStyle = off ? `rgb(${lerp(34, 200, k)},${lerp(197, 200, k)},${lerp(94, 205, k)})` : '#22c55e'; rrp(x, 0, w - 110, y - 18, 76, 42, 21); x.fill(); x.fillStyle = '#fff'; x.beginPath(); x.arc(w - 55 - 32 * k, y + 3, 17, 0, 6.29); x.fill(); });
  } else if (inn(t, KW.zapatos2 - .4, PS(4))) { // anuncio de zapatos
    x.fillStyle = '#16161c'; x.font = '800 30px I'; x.textAlign = 'left'; x.fillText('Para ti', 24, 100);
    x.fillStyle = '#fff'; rrp(x, 0, 20, 130, w - 40, 420, 24); x.fill(); x.fillStyle = '#ffe9e0'; rrp(x, 0, 36, 146, w - 72, 260, 18); x.fill(); drawShoe2d(x, w / 2, 280, 1.3);
    x.fillStyle = '#16161c'; x.font = '900 40px I'; x.fillText('ZAPATOS', 40, 460); x.fillStyle = '#ef4444'; x.fillText('-30%', 250, 460); x.fillStyle = '#3d8bff'; rrp(x, 0, 40, 486, w - 80, 48, 24); x.fill(); x.fillStyle = '#fff'; x.font = '800 22px I'; x.textAlign = 'center'; x.fillText('COMPRAR', w / 2, 518);
    x.fillStyle = '#6b7280'; x.font = '600 18px I'; x.fillText('Patrocinado', w / 2, 580);
  } else { x.fillStyle = '#16161c'; x.font = '800 30px I'; x.textAlign = 'left'; x.fillText('Inicio', 24, 100); for (let i = 0; i < 4; i++) { x.fillStyle = ['#ffd27a', '#9fd6f2', '#c8e6a0', '#d0c4f7'][i]; rrp(x, 0, 20, 130 + i * 160, w - 40, 140, 18); x.fill(); } }
  SCR.tx.needsUpdate = true;
}
// ---------- ZONA B: la agencia con oreja gigante + gobierno ----------
const BX = 40; add(box(26, .2, 10, 0xd9d4c8)).position.set(BX + 6, .1, 0);
const AG = building(BX, -1, 5, 4, 5, 0xd9c9f0); { const sg = texPlane(4.4, .9, 440, 90, (x, w, h) => { x.fillStyle = '#1d2029'; rrp(x, 0, 0, 0, w, h, 12); x.fill(); x.fillStyle = '#ffb020'; x.font = '900 52px I'; x.textAlign = 'center'; x.textBaseline = 'middle'; x.fillText('PUBLICIDAD', w / 2, h / 2 + 3); }, false); sg.position.set(BX, 6.3, 1.05); add(sg); }
const EAR = add(new THREE.Group()); { const m = lp(0xf2b49a); const e = sph(1.1, m, 20); e.scale.set(.55, 1, .3); const rim = M(new THREE.TorusGeometry(.8, .18, 10, 24, Math.PI * 1.6), m); rim.position.z = .25; rim.rotation.z = -.4; const hole = sph(.22, lp(0x8a4a3a), 10); hole.position.set(0, -.1, .3); EAR.add(e, rim, hole); } EAR.position.set(BX, 7.6, -1);
const MIC = add(new THREE.Group()); { const hd = M(new THREE.CapsuleGeometry(.4, .5, 6, 14), lp(0x2a2d36, { roughness: .4 })); hd.position.y = .7; const st = cyl(.06, .06, 1, 0x9aa0aa); const ba = cyl(.4, .4, .1, 0x2a2d36); ba.position.y = -.5; MIC.add(hd, st, ba); } MIC.position.set(BX + 1.9, 6.4, -.2);
const MICX = add(texPlane(1.6, 1.6, 200, 200, (x, w, h) => { x.strokeStyle = '#ff4d4d'; x.lineWidth = 26; x.lineCap = 'round'; x.beginPath(); x.moveTo(30, 30); x.lineTo(170, 170); x.moveTo(170, 30); x.lineTo(30, 170); x.stroke(); }));
const GX = BX + 12; const GOV = add(new THREE.Group()); { const b = box(6, 3.4, 3.6, 0xf4f1ea); b.position.y = 1.9; const st = box(6.6, .3, 4.2, 0xdedad0); st.position.y = .15; const roof = box(6.4, .4, 3.9, 0xe0dcd2); roof.position.y = 3.8; const dome = M(new THREE.SphereGeometry(1.3, 20, 10, 0, Math.PI * 2, 0, Math.PI / 2), lp(0xdfe6ee)); dome.position.y = 4.0; GOV.add(b, st, roof, dome); for (let i = 0; i < 6; i++) { const c = cyl(.16, .16, 3.2, 0xffffff, 12); c.position.set(-2.5 + i, 1.9, 1.95); GOV.add(c); } const fl = box(.06, 1.6, .06, 0x9aa0aa); fl.position.set(0, 6, 0); GOV.add(fl); } GOV.position.set(GX, 0, -1);
const LUPA = add(new THREE.Group()); { const r = M(new THREE.TorusGeometry(1.0, .14, 10, 32), lp(0x2a2d36)); const gl = M(new THREE.CircleGeometry(.98, 32), new THREE.MeshStandardMaterial({ color: 0xbfe6ff, transparent: true, opacity: .3 }), false); const h = cyl(.13, .13, 1.8, 0x7a5230); h.position.set(1.1, -1.1, 0); h.rotation.z = Math.PI / 4; LUPA.add(r, gl, h); }
// ---------- ZONA C: la torre de datos ----------
const CX = 80; add(box(14, .2, 10, 0xd9d4c8)).position.set(CX, .1, 0);
const TOWER = add(new THREE.Group()); { const b = rbox(2.4, 6, 2.4, .2, lp(0x2a2d36, { roughness: .45 })); b.position.y = 3; TOWER.add(b); for (let i = 0; i < 8; i++) { const l = box(2.0, .08, .05, lp(0x4aa8ff, { emissive: 0x1d4f99 })); l.position.set(0, .8 + i * .65, 1.22); TOWER.add(l); } } TOWER.position.set(CX, .2, -1.5);
function iconTex(col, draw) { const c = canvasTex(128, 128), x = c.x; x.fillStyle = col; x.beginPath(); x.arc(64, 64, 60, 0, 6.29); x.fill(); x.strokeStyle = '#fff'; x.fillStyle = '#fff'; x.lineWidth = 9; x.lineCap = 'round'; draw(x); c.tx.needsUpdate = true; return new THREE.SpriteMaterial({ map: c.tx, transparent: true, depthWrite: false }); }
const ICONS = [
  iconTex('#4aa8ff', x => { x.beginPath(); x.arc(56, 56, 24, 0, 6.29); x.stroke(); x.beginPath(); x.moveTo(74, 74); x.lineTo(94, 94); x.stroke(); }),
  iconTex('#ef4444', x => { x.beginPath(); x.arc(64, 52, 22, Math.PI, 0); x.lineTo(64, 100); x.closePath(); x.fill(); x.fillStyle = '#ef4444'; x.beginPath(); x.arc(64, 52, 9, 0, 6.29); x.fill(); }),
  iconTex('#22c55e', x => { x.beginPath(); x.moveTo(28, 40); x.lineTo(40, 40); x.lineTo(50, 80); x.lineTo(92, 80); x.lineTo(100, 52); x.lineTo(44, 52); x.stroke(); x.beginPath(); x.arc(54, 96, 6, 0, 6.29); x.arc(88, 96, 6, 0, 6.29); x.fill(); }),
  iconTex('#a98bff', x => { x.beginPath(); x.moveTo(50, 40); x.lineTo(92, 64); x.lineTo(50, 88); x.closePath(); x.fill(); }),
  iconTex('#ffb020', x => { x.beginPath(); x.ellipse(64, 64, 38, 22, 0, 0, 6.29); x.stroke(); x.beginPath(); x.arc(64, 64, 11, 0, 6.29); x.fill(); })];
const FLOW = []; for (let i = 0; i < 20; i++) { const s = new THREE.Sprite(ICONS[i % 5]); s.scale.set(.8, .8, 1); add(s); FLOW.push(s); }
const BALL = add(new THREE.Group()); { const gb = M(new THREE.SphereGeometry(1.1, 32, 20), new THREE.MeshStandardMaterial({ color: 0xc6b6ff, transparent: true, opacity: .55, roughness: .1, emissive: 0x4a2aa0, emissiveIntensity: .4 })); gb.position.y = 1.4; const bs = cyl(.8, 1.0, .4, 0x7a5230, 16); bs.position.y = .2; BALL.add(gb, bs); } BALL.position.set(CX + 3.2, .2, 1.4);
const SHOE2 = add(makeShoe(0xff4d4d)); SHOE2.scale.setScalar(.7);
// ---------- tomas ----------
SHOTS = [
  [0, PS(2), [-.2, 3.6, 14], [.3, 3.4, 12.5], [.2, 2.4, 0], [.4, 2.4, 0]],
  [PS(2), PS(4), [3.2, 3.0, 8], [2.6, 2.9, 7], [2.2, 2.6, .4], [2.2, 2.6, .4]],
  [PS(4), PS(6), [BX + 2, 5.5, 17], [BX + 1, 6.5, 15], [BX, 5.0, 0], [BX, 5.6, -1]],
  [PS(6), PS(9), [BX + 5, 7, 28], [BX + 6.5, 6.5, 25.5], [BX + 6, 3.8, -1], [BX + 6, 3.6, -1]],
  [PS(9), PS(11), [BX + 10, 6, 26], [BX + 2, 6, 26], [BX + 6, 3.6, -1], [BX + 6, 3.6, -1]],
  [PS(11), PS(15), [CX + 1, 4.8, 15], [CX - .5, 4.4, 13], [CX, 3.4, -1], [CX, 3.2, -1]],
  [PS(15), PS(17), [CX + 4.5, 3.2, 9], [CX + 3.8, 2.9, 7.5], [CX + 3.2, 1.8, 1.4], [CX + 3.2, 1.8, 1.4]],
  [PS(17), PS(18), [4, 3.4, 9.5], [3, 3.3, 8.2], [2.2, 2.8, .4], [2.2, 2.8, .4]],
  [PS(18), PS(20), [2.4, 4.6, 5.2], [2.3, 4.5, 4.6], [2.2, 4.4, .4], [2.2, 4.4, .4]],
  [PS(20), PS(21), [2.6, 2.8, 6.6], [2.4, 2.7, 6.0], [2.2, 2.6, .4], [2.2, 2.6, .4]],
  [PS(21), END, [-1, 4.2, 15], [-1.5, 4.6, 16.5], [.2, 2.6, 0], [.2, 2.6, 0]]
];
SHAKE = [[KW.panico - .2, KW.panico + 1.2, .07]];
function animWorld(t) {
  const zx = t < PS(4) || t >= PS(17) ? 0 : t < PS(11) ? BX + 5 : CX; sunAt(zx, 0, 0, 16);
  drawScreen(t);
  BUB.forEach((b, i) => { pop(b, t, .1 + i * .5, .4, PS(2)); b.position.y = 2.6 + Math.sin(t * 2 + i) * .08; });
  pop(SHOE, t, KW.zapatos1 - .1, .45, PS(2)); SHOE.rotation.y = t * 1.2;
  // agencia
  pop(EAR, t, KW.empresa + .3, .5, PS(9)); EAR.rotation.y = Math.sin(t * 2) * .2;
  pop(MIC, t, KW.microfono1 - .2, .45, PS(9));
  MICX.visible = inn(t, KW.nadie - .2, PS(9) + .3); if (MICX.visible) { MICX.position.set(BX + 1.9, 7.1, .5); pop(MICX, t, KW.nadie - .2, .35); }
  LUPA.visible = inn(t, KW.gobierno, PS(8)); if (LUPA.visible) { const k = P(t, KW.gobierno, 2.4); LUPA.position.set(lerp(BX + 8, BX + .5, eio(k)), 4.5 + Math.sin(t * 4) * .3, 2.5); LUPA.scale.setScalar(eback(P(t, KW.gobierno, .4))); }
  // torre de datos: íconos fluyen hacia la torre
  const kinds = [[KW.buscas, 0], [KW.estas, 1], [KW.compras, 2], [KW.videos, 3], [KW.foto, 4]];
  FLOW.forEach((s, i) => { const kd = i % 5, a0 = kinds[kd][0] - .2 + Math.floor(i / 5) * .35; s.visible = inn(t, a0, PS(15) + .5); if (!s.visible) return; const ang = kd / 5 * Math.PI * 2 + 1.1; const k = ((t - a0) * .45 + Math.floor(i / 5) * .25) % 1; const r = lerp(5.5, .6, eio(k)); s.position.set(CX + Math.cos(ang) * r, 1.5 + Math.sin(ang) * 1.2 + 2 + k * .5, -1.5 + Math.sin(ang) * r * .5 + 1.2); s.material.opacity = 1 - P(k, .85, .15); s.scale.setScalar(.85 * eback(P(t, a0, .3))); });
  pop(BALL, t, KW.adivina - .3, .5); SHOE2.visible = inn(t, KW.adivina + .2, PS(17)); if (SHOE2.visible) { SHOE2.position.set(CX + 3.2, 1.55, 1.4); SHOE2.rotation.y = t * 1.5; pop(SHOE2, t, KW.adivina + .2, .5); }
}
function overlay2d(t) {
  floaters(t, 10, 'rgba(255,255,255,.7)', 'dust');
  pill(t, .4, PS(1), 540, 1450, 'HABLAS DE ZAPATOS', C.amber, 'quote');
  pill(t, KW.zapatos2 - .3, PS(2), 540, 1450, 'ANUNCIO DE ZAPATOS', C.red, 'warn');
  punch(t, KW.escuchando - .3, PS(3) + .2, [['¿TE', '#ffffff'], ['ESCUCHA?', C.red]], 540, 1280, { size: 104 });
  pill(t, KW.rara - .2, PS(4), 540, 1450, 'LA RESPUESTA ES MÁS RARA', C.amber, 'star');
  pill(t, KW.empresa - .1, KW.microfono1 - .3, 540, 1430, '2023 · EMPRESA DE PUBLICIDAD (EE. UU.)', C.amber, 'dot', 30);
  pill(t, KW.microfono1 - .3, PS(5), 540, 1430, '"ESCUCHAMOS POR EL MICRÓFONO"', C.blue, 'mic');
  punch(t, KW.panico - .3, PS(6), [['¡PÁNICO!', C.red]], 540, 1260, { size: 110 });
  pill(t, KW.gobierno - .2, KW.inventado - .3, 540, 1450, 'EL GOBIERNO INVESTIGÓ', C.blue, 'arrow');
  punch(t, KW.inventado - .2, PS(8) + .2, [['INVENTADO', '#ffffff']], 540, 1250, { stamp: '#e02424', size: 96, rot: -.07 });
  pill(t, KW.nadie - .3, PS(9), 540, 1450, 'NO ESCUCHABA A NADIE', C.green, 'check');
  punch(t, KW.susc - .1, PE(10) + .3, [['¡SUSCRÍBETE!', '#ffffff']], 540, 1250, { stamp: '#ff2d3d', size: 92, rot: -.05 });
  punch(t, KW.sabe1 - .2, KW.oirte, [['¿CÓMO', '#ffffff'], ['SABE?', C.amber]], 540, 1280, { size: 104 });
  pill(t, KW.oirte - .2, KW.buscas - .1, 540, 1450, 'NO NECESITA OÍRTE', C.green, 'check');
  const L = [[KW.buscas, 'LO QUE BUSCAS', C.blue], [KW.estas, 'DÓNDE ESTÁS', C.red], [KW.compras, 'QUÉ COMPRAS', C.green], [KW.videos, 'QUÉ VIDEOS VES', C.purple], [KW.foto - .6, 'CUÁNTO MIRAS UNA FOTO', C.amber]];
  L.forEach(([a, txt, c], i) => pill(t, a - .15, PS(15), 540, 1180 + i * 78, txt, c, 'check', 32));
  punch(t, KW.adivina - .2, PS(17), [['ADIVINA', '#ffffff'], ['ANTES', C.amber]], 540, 1300, { size: 96 });
  pill(t, KW.microfono2 - .3, PS(18), 540, 1450, '¿QUIÉN USA TU MICRÓFONO?', C.amber, 'mic');
  pill(t, KW.verde - .2, KW.naranja - .1, 540, 1300, 'PUNTITO VERDE', C.green, 'dot');
  pill(t, KW.naranja - .1, PS(19), 540, 1300, 'O NARANJA', C.amber, 'dot');
  pill(t, PS(19), PS(20), 540, 1300, 'UNA APP USA EL MICRÓFONO O LA CÁMARA', C.amber, 'mic', 29);
  pill(t, KW.ajustes - .2, KW.permiso - .4, 540, 1450, 'AJUSTES › PRIVACIDAD', C.blue, 'arrow');
  pill(t, KW.permiso - .4, PS(21), 540, 1450, 'QUÍTALE EL PERMISO', C.green, 'check');
  question(t, KW.coment, '¿Qué anuncio raro te salió?', ['Zapatos', 'Comida', 'Un viaje', 'Algo que solo dije'], 1300);
}
