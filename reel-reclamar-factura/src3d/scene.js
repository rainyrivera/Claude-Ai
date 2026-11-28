// ================= CÓMO RECLAMAR UNA FACTURA ALTA (4 PASOS) =================
const DISC = (t) => t >= PS(19) && t < PS(23) ? 'El nombre de la oficina cambia según tu país' : t >= PS(23) && t < PS(27) ? 'Los plazos para reclamar dependen de cada país' : 'Recreación ilustrativa';
const KW = { alta: T('alta'), nada: T('nada'), mucha: T('mucha'), devuelven: T('devuelven'), orden: T('orden'), uno: T('uno'), revisa: T('revisa'), compara: T('compara'), anteriores: T('anteriores'), medidor: T('medidor'), coincide: T('coincide'), dos: T('dos'), empresa1: T('empresa'), identificacion: T('identificación'), contrato: T('contrato'), importante: T('importante'), constancia1: T('constancia'), papel: T('papel'), prueba: T('prueba'), susc: T('suscríbete'), tres: T('tres'), responden: T('responden'), oficina: T('oficina'), luz: T('luz'), agua: T('agua'), telefono: T('teléfono'), respuesta2: T('respuesta', 2), cuatro: T('cuatro'), despues: T('después'), plazo: T('plazo'), derecho: T('derecho'), coment: T('comentarios') };
add(road(70, 10, 240)); [[-14, -10, 5, 3, 5, 0xe8d7b0], [22, -11, 6, 3, 6, 0xd9c9a6], [60, -11, 5, 3, 4, 0xf0e0c0], [100, -12, 6, 3, 7, 0xe2d2b0], [142, -11, 5, 3, 4, 0xd9c9a6], [180, -10, 6, 3, 5, 0xe8d7b0]].forEach(b => building(...b));
[[-7, 4.5], [14, 4.5], [33, 4], [55, 4.5], [72, 4], [93, 4.5], [113, 4], [135, 4.5], [152, 4], [173, 4.5]].forEach(([x, z]) => tree(x, z, 1.3));
function plat(x, w = 14) { const p = add(box(w, .2, 9, 0xd9d4c8)); p.position.set(x, .1, 0); return p; }
function desk(x, z = 0, w = 7) { const d = add(new THREE.Group()); const tp = box(w, .2, 3.4, 0xc9a77c); tp.position.y = 2; d.add(tp); for (const [a, b] of [[-w / 2 + .3, -1.5], [w / 2 - .3, -1.5], [-w / 2 + .3, 1.5], [w / 2 - .3, 1.5]]) { const l = box(.2, 1.9, .2, 0x9a6a40); l.position.set(a, 1, b); d.add(l); } d.position.set(x, .2, z); return d; }
function doc(w, h, draw) { const o = texPlane(w, h, Math.round(w * 100), Math.round(h * 100), draw, false); o.castShadow = true; return o; }
const lines = (x, w, h, y0, n, c = '#a9aeb8') => { x.fillStyle = c; for (let i = 0; i < n; i++) x.fillRect(16, y0 + i * 24, (w - 32) * (.55 + ((i * 37) % 40) / 100), 9); };
function numBlock(n, col) { return texPlane(1.3, 1.3, 160, 160, (x, w, h) => { x.fillStyle = col; rrp(x, 0, 0, 0, w, h, 30); x.fill(); x.fillStyle = '#fff'; x.font = '900 110px I'; x.textAlign = 'center'; x.textBaseline = 'middle'; x.fillText(n, w / 2, h / 2 + 6); }); }
// ---------- ZONA A: la factura alta ----------
plat(0); desk(0);
const BILL = add(doc(2.6, 3.4, (x, w, h) => { x.fillStyle = '#fbf8ef'; x.fillRect(0, 0, w, h); x.fillStyle = '#2b5fd0'; x.fillRect(0, 0, w, 46); x.fillStyle = '#fff'; x.font = '800 26px I'; x.fillText('FACTURA', 18, 32); lines(x, w, h, 70, 7); x.fillStyle = '#ff4d4d'; x.fillRect(16, 262, w - 32, 56); x.fillStyle = '#fff'; x.font = '900 34px I'; x.fillText('MUY ALTA', 40, 300); }));
const COINS = Array.from({ length: 8 }, () => { const c = add(cyl(.32, .32, .1, lp(0xffc83a, { metalness: .6, roughness: .3, emissive: 0x2a1a00 }), 20)); return c; });
const WALLET = add(new THREE.Group()); { const w = rbox(1.8, 1.2, .4, .1, lp(0x7a4a2a)); const f = box(1.8, .5, .45, 0x5e3820); f.position.y = .2; WALLET.add(w, f); } WALLET.rotation.x = -1.2; WALLET.position.set(2.2, 2.45, .6);
const NUMS = ['1', '2', '3', '4'].map((n, i) => { const o = add(numBlock(n, [C.blue, C.amber, C.purple, C.green][i])); o.position.set(-2.4 + i * 1.6, 3.6, 1.2); return o; });
// ---------- ZONA B: paso 1 revisa ----------
const BX = 40; plat(BX, 16); desk(BX, 0, 9);
const BARS = [.9, 1.1, 1.0, 2.3].map((h, i) => { const b = add(box(.8, h, .8, lp(i === 3 ? 0xff4d4d : 0x4aa8ff, { roughness: .5 }))); b.position.set(BX - 3.8 + i * 1.05, 2.1 + h / 2, -.6); b.userData.h = h; return b; });
const MLAB = ['ENE', 'FEB', 'MAR', 'HOY'].map((s, i) => { const p = add(texPlane(.9, .35, 120, 46, (x, w, h) => { x.fillStyle = '#2a2d36'; x.font = '800 34px I'; x.textAlign = 'center'; x.textBaseline = 'middle'; x.fillText(s, w / 2, h / 2 + 2); })); p.position.set(BX - 3.8 + i * 1.05, 2.25, .2); p.rotation.x = -.6; return p; });
const MET = add(new THREE.Group()); { const bx = rbox(1.4, 1.8, .4, .08, lp(0xdfe3ea, { metalness: .3, roughness: .4 })); const sc = texPlane(1.1, .7, 220, 140, (x, w, h) => { x.fillStyle = '#10141c'; rrp(x, 0, 0, 0, w, h, 14); x.fill(); x.fillStyle = '#3ddc84'; x.font = '800 60px I'; x.textAlign = 'center'; x.fillText('5280', w / 2, 82); x.font = '700 26px I'; x.fillStyle = '#9aa0aa'; x.fillText('LECTURA', w / 2, 122); }); sc.position.set(0, .2, .25); MET.add(bx, sc); } MET.position.set(BX + 1.8, 3.2, -.6);
const BILL2 = add(doc(1.8, 2.3, (x, w, h) => { x.fillStyle = '#fbf8ef'; x.fillRect(0, 0, w, h); x.fillStyle = '#2b5fd0'; x.fillRect(0, 0, w, 36); lines(x, w, h, 56, 5); x.fillStyle = '#2a2d36'; x.font = '900 40px I'; x.fillText('5280', 30, 200); }));
BILL2.position.set(BX + 3.7, 3.2, -.6);
const EQ = add(texPlane(1, 1, 128, 128, (x) => { x.fillStyle = '#3ddc84'; x.beginPath(); x.arc(64, 64, 60, 0, 6.29); x.fill(); x.strokeStyle = '#fff'; x.lineWidth = 16; x.lineCap = 'round'; x.beginPath(); x.moveTo(34, 66); x.lineTo(56, 88); x.lineTo(96, 42); x.stroke(); })); EQ.position.set(BX + 2.75, 4.6, -.4);
// ---------- ZONA C: paso 2 la empresa ----------
const CX = 80; plat(CX, 16);
const OFF = add(new THREE.Group()); { const b = box(9, 5, 3, 0xdfe7f2); b.position.y = 2.6; const sign = texPlane(5, 1, 500, 100, (x, w, h) => { x.fillStyle = '#2b5fd0'; rrp(x, 0, 0, 0, w, h, 20); x.fill(); x.fillStyle = '#fff'; x.font = '900 60px I'; x.textAlign = 'center'; x.textBaseline = 'middle'; x.fillText('EMPRESA DE LUZ', w / 2, h / 2 + 3); }); sign.position.set(0, 4.4, 1.52); const win = box(3.4, 1.6, .1, lp(0x23406e, { roughness: .3 })); win.position.set(0, 2.6, 1.52); const counter = box(4.4, .3, 1.2, 0xc9a77c); counter.position.set(0, 1.6, 2); OFF.add(b, sign, win, counter); } OFF.position.set(CX, .2, -2);
const IDC = add(doc(1.6, 1, (x, w, h) => { x.fillStyle = '#e8f1ff'; rrp(x, 0, 0, 0, w, h, 12); x.fill(); x.fillStyle = '#9ab0d0'; x.fillRect(12, 16, 50, 60); x.fillStyle = '#2b5fd0'; x.font = '800 18px I'; x.fillText('IDENTIFICACIÓN', 70, 30); lines(x, w, h, 46, 2, '#9ab0d0'); }));
const CONTR = add(doc(1.4, 1.8, (x, w, h) => { x.fillStyle = '#fbf8ef'; x.fillRect(0, 0, w, h); x.fillStyle = '#2a2d36'; x.font = '800 18px I'; x.fillText('CONTRATO N.º', 14, 28); x.font = '900 24px I'; x.fillText('48-1902', 14, 56); lines(x, w, h, 76, 4); }));
const CONST = add(doc(2, 2.6, (x, w, h) => { x.fillStyle = '#fbf8ef'; x.fillRect(0, 0, w, h); x.fillStyle = '#2a2d36'; x.font = '900 26px I'; x.fillText('CONSTANCIA', 18, 38); x.font = '700 20px I'; x.fillText('Reclamo N.º 000123', 18, 70); lines(x, w, h, 96, 4); }));
const STAMP = add(texPlane(1.3, 1.3, 160, 160, (x) => { x.strokeStyle = '#e0303c'; x.lineWidth = 10; x.beginPath(); x.arc(80, 80, 68, 0, 6.29); x.stroke(); x.fillStyle = '#e0303c'; x.font = '900 34px I'; x.textAlign = 'center'; x.textBaseline = 'middle'; x.save(); x.translate(80, 80); x.rotate(-.3); x.fillText('RECIBIDO', 0, 2); x.restore(); }));
// ---------- ZONA D: paso 3 oficina del consumidor ----------
const DX = 120; plat(DX, 16);
const GOV = add(new THREE.Group()); { const base = box(10, .6, 4, 0xe9e4d8); base.position.y = .3; const roof = M(new THREE.CylinderGeometry(.01, 6.2, 1.6, 4, 1), lp(0xd8d0bf, { flatShading: true })); roof.rotation.y = Math.PI / 4; roof.scale.z = .45; roof.position.y = 5.6; const top = box(10, .6, 4, 0xe9e4d8); top.position.y = 4.6; GOV.add(base, roof, top); for (let i = 0; i < 6; i++) { const c = cyl(.28, .32, 3.8, 0xf6f2ea, 14); c.position.set(-4 + i * 1.6, 2.5, 1.4); GOV.add(c); } const wall = box(9.6, 3.8, .2, 0xdcd3c0); wall.position.set(0, 2.5, -1.4); GOV.add(wall); const sign = texPlane(6.6, .8, 660, 80, (x, w, h) => { x.fillStyle = '#1f2a44'; rrp(x, 0, 0, 0, w, h, 12); x.fill(); x.fillStyle = '#fff'; x.font = '900 36px I'; x.textAlign = 'center'; x.textBaseline = 'middle'; x.fillText('PROTECCIÓN AL CONSUMIDOR', w / 2, h / 2 + 3); }); sign.position.set(0, 4.6, 2.02); GOV.add(sign); } GOV.position.set(DX, .2, -2.5);
function bulb() { const g0 = new THREE.Group(); const b = sph(.55, lp(0xffe27a, { emissive: 0xffb020, emissiveIntensity: .6 })); b.position.y = .9; const s = cyl(.25, .25, .4, 0x9aa0aa, 12); s.position.y = .25; g0.add(b, s); return g0; }
function drop3() { const g0 = new THREE.Group(); const s = sph(.5, lp(0x4aa8ff, { roughness: .2 })); s.position.y = .6; const c = M(new THREE.ConeGeometry(.42, .7, 20), lp(0x4aa8ff, { roughness: .2 })); c.position.y = 1.25; g0.add(s, c); return g0; }
function phone3() { const g0 = new THREE.Group(); const b = rbox(.8, 1.5, .14, .05, lp(0x1d2029)); b.position.y = .9; const sc = texPlane(.68, 1.3, 68, 130, (x, w, h) => { const gr = x.createLinearGradient(0, 0, w, h); gr.addColorStop(0, '#3a4fd8'); gr.addColorStop(1, '#b04ad8'); x.fillStyle = gr; x.fillRect(0, 0, w, h); }); sc.position.set(0, .9, .09); g0.add(b, sc); return g0; }
const SERV = [bulb(), drop3(), phone3()].map((o, i) => { add(o); o.position.set(DX - 2.4 + i * 2.4, .2, 2.4); return o; });
const FOLDER = add(doc(1.8, 1.4, (x, w, h) => { x.fillStyle = '#f2c26b'; rrp(x, 0, 0, 0, w, h, 10); x.fill(); x.fillStyle = '#fbf8ef'; x.fillRect(16, 14, w - 32, h - 50); x.fillStyle = '#e0303c'; x.font = '900 22px I'; x.fillText('RECIBIDO', 26, 52); }));
// ---------- ZONA E: paso 4 el plazo ----------
const EX = 160; plat(EX, 16);
const CAL = add(new THREE.Group()); { const b = rbox(3, 3.2, .3, .1, lp(0xffffff)); const hd = texPlane(3, .8, 300, 80, (x, w, h) => { x.fillStyle = '#e0303c'; x.fillRect(0, 0, w, h); x.fillStyle = '#fff'; x.font = '900 48px I'; x.textAlign = 'center'; x.textBaseline = 'middle'; x.fillText('PLAZO', w / 2, h / 2 + 3); }); hd.position.set(0, 1.2, .18); const gr = texPlane(2.7, 2.2, 270, 220, (x, w, h) => { x.fillStyle = '#2a2d36'; x.font = '700 26px I'; x.textAlign = 'center'; for (let i = 0; i < 28; i++) { const cx = 20 + (i % 7) * 38, cy = 34 + Math.floor(i / 7) * 48; x.fillText(String(i + 1), cx + 2, cy); } }); gr.position.set(0, -.35, .18); CAL.add(b, hd, gr); CAL.userData.gr = gr; } CAL.position.set(EX - 2, 3, -1);
const XS = Array.from({ length: 28 }, (_, i) => { const o = add(texPlane(.32, .32, 64, 64, (x) => { x.strokeStyle = '#e0303c'; x.lineWidth = 10; x.lineCap = 'round'; x.beginPath(); x.moveTo(12, 12); x.lineTo(52, 52); x.moveTo(52, 12); x.lineTo(12, 52); x.stroke(); })); o.position.set(EX - 2 - 1.18 + (i % 7) * .38, 3 + .55 - Math.floor(i / 7) * .48, -.8); return o; });
const HG = add(new THREE.Group()); { const f1 = cyl(.9, .9, .15, 0x8a5a36, 20); f1.position.y = 2.6; const f2 = f1.clone(); f2.position.y = 0; const gl1 = M(new THREE.ConeGeometry(.8, 1.2, 20), lp(0xbfe6ff, { transparent: true, opacity: .4 })); gl1.position.y = 1.9; gl1.rotation.x = Math.PI; const gl2 = M(new THREE.ConeGeometry(.8, 1.2, 20), lp(0xbfe6ff, { transparent: true, opacity: .4 })); gl2.position.y = .7; const s1 = M(new THREE.ConeGeometry(.6, .9, 20), lp(0xffb020)); s1.position.y = 2.05; s1.rotation.x = Math.PI; const s2 = M(new THREE.ConeGeometry(.6, .9, 20), lp(0xffb020)); s2.position.y = .55; HG.add(f1, f2, gl1, gl2, s1, s2); HG.userData.s1 = s1; HG.userData.s2 = s2; } HG.position.set(EX + 2.6, .3, 0);
const NB = [[BX, KW.uno, C.blue, '1'], [CX, KW.dos, C.amber, '2'], [DX, KW.tres, C.purple, '3'], [EX, KW.cuatro, C.green, '4']].map(([x, a, c, n]) => { const o = add(numBlock(n, c)); o.position.set(x, 6.2, 1); o.scale.setScalar(1.3); o.userData.a = a; return o; });
// ---------- tomas ----------
SHOTS = [
  [0, PS(2), [0, 6.5, 8], [0, 5.5, 7], [0, 2.3, 0], [0, 2.3, .2]],
  [PS(2), PS(5), [-1, 6.5, 17], [1, 6.2, 16], [0, 3.2, 0], [0, 3.4, 0]],
  [PS(5), PS(10), [BX, 7, 23], [BX + .6, 6.6, 21], [BX + .3, 3.2, 0], [BX + .4, 3.3, 0]],
  [PS(10), PS(17), [CX - 1, 6.5, 20], [CX + .5, 6, 18.5], [CX, 2.8, 0], [CX, 2.8, 0]],
  [PS(17), PS(19), [CX + 3, 8, 22], [CX - 3, 8, 22], [CX, 3, 0], [CX, 3, 0]],
  [PS(19), PS(23), [DX - 2, 7, 26], [DX + 1, 6.5, 24], [DX, 3.2, 0], [DX, 3.2, 0]],
  [PS(23), PS(27), [EX + .5, 6.5, 20], [EX, 6, 18.5], [EX + .3, 3, 0], [EX + .3, 3, 0]],
  [PS(27), END, [EX + 1, 8, 24], [EX - 1, 9, 26], [EX, 3, 0], [EX, 3, 0]]
];
SHAKE = [[KW.alta - .1, KW.alta + .5, .06], [KW.prueba - .1, KW.prueba + .4, .05]];
function animWorld(t) {
  sunAt(t < PS(5) ? 0 : t < PS(10) ? BX : t < PS(19) ? CX : t < PS(23) ? DX : EX, 0, 0, 16);
  // factura cae sobre la mesa
  BILL.visible = t < PS(5); { const k = P(t, .1, .6); BILL.position.set(-.6, lerp(7, 2.33, k * k), 0); BILL.rotation.set(-Math.PI / 2, 0, .08 + (1 - k) * 1.5); }
  // monedas vuelven a la cartera
  pop(WALLET, t, KW.mucha - .3, .4, PS(5));
  COINS.forEach((c, i) => { c.visible = inn(t, KW.devuelven - .2, PS(5)); const k = eio(P(t, KW.devuelven - .2 + i * .12, .7)); const a = i * .8; c.position.set(lerp(-3 + Math.cos(a), 2.2, k), lerp(5 + Math.sin(a), 2.8, k) + Math.sin(k * Math.PI) * 1.2, lerp(-1, .6, k)); c.rotation.set(t * 4 + i, 0, t * 2); });
  NUMS.forEach((o, i) => { pop(o, t, KW.orden - .2 + i * .18, .4, PS(5)); o.position.y = 4.2 + Math.sin(t * 2 + i) * .08; });
  // paso 1
  BARS.forEach((b, i) => { const k = eout(P(t, KW.compara + i * .2, .5)); b.visible = t > KW.compara - .1; b.scale.y = Math.max(.01, k); b.position.y = 2.1 + b.userData.h * k / 2; }); MLAB.forEach((m, i) => pop(m, t, KW.compara + i * .2, .35));
  BARS[3].material.emissive = new THREE.Color(0xff2020); BARS[3].material.emissiveIntensity = inn(t, KW.anteriores - .2, PS(9)) ? .3 + .2 * Math.sin(t * 10) : 0;
  pop(MET, t, KW.medidor - .3, .4); pop(BILL2, t, KW.medidor, .4); pop(EQ, t, KW.coincide, .4);
  // paso 2
  IDC.visible = t > KW.identificacion - .2; { const k = eout(P(t, KW.identificacion - .2, .5)); IDC.position.set(CX - 2.2, lerp(5, 2.15, k), 1.8); IDC.rotation.set(-Math.PI / 2, 0, .15); }
  CONTR.visible = t > KW.contrato - .2; { const k = eout(P(t, KW.contrato - .2, .5)); CONTR.position.set(CX - .5, lerp(5, 2.16, k), 1.9); CONTR.rotation.set(-Math.PI / 2, 0, -.1); }
  CONST.visible = t > KW.constancia1 - .5; { const k = eback(P(t, KW.constancia1 - .5, .6)); CONST.position.set(CX + 1.6, 2.6 + .1, 2.6); CONST.rotation.set(-.35, 0, .05); CONST.scale.setScalar(Math.max(.001, k)); }
  STAMP.visible = t > KW.constancia1 + .4; { const k = P(t, KW.constancia1 + .4, .25); STAMP.position.set(CX + 1.9, 2.4, 3.05); STAMP.rotation.set(-.35, 0, -.2); STAMP.scale.setScalar(lerp(2.2, 1, eout(k))); STAMP.material.opacity = k; }
  // paso 3
  [KW.luz, KW.agua, KW.telefono].forEach((a, i) => { pop(SERV[i], t, a - .2, .4); SERV[i].rotation.y = Math.sin(t * 1.4 + i) * .4; });
  FOLDER.visible = t > KW.respuesta2 - .3; { const k = eout(P(t, KW.respuesta2 - .3, .6)); FOLDER.position.set(lerp(DX + 6, DX + .5, k), 1.3, 3.2); FOLDER.rotation.set(-.4, 0, 0); }
  // paso 4
  NB.forEach(o => { pop(o, t, o.userData.a - .3, .45); o.rotation.y = Math.sin(t * 1.5) * .3; });
  const nx = Math.floor(clamp((t - KW.despues) / (PS(27) - KW.despues)) * 28); XS.forEach((o, i) => { o.visible = t > KW.despues && i < nx; });
  const sk = P(t, KW.cuatro, PS(27) - KW.cuatro); HG.userData.s1.scale.setScalar(Math.max(.01, 1 - sk)); HG.userData.s2.scale.setScalar(Math.max(.01, sk)); HG.rotation.y = t * .3;
}
function overlay2d(t) {
  floaters(t, 8, 'rgba(255,255,255,.8)', 'dust');
  punch(t, KW.alta - .3, PS(1), [['FACTURA', '#ffffff'], ['ALTA', C.red]], 540, 1260, { size: 104 });
  paper(t, PS(1), PS(2), 540, 1440, 700, 150, (g, w, h) => { g.font = 'italic 800 40px I'; g.fillStyle = '#2a2d36'; g.textAlign = 'center'; g.textBaseline = 'middle'; g.fillText('"No se puede reclamar…"', 0, 2); });
  pill(t, KW.devuelven - .3, PS(4), 540, 1460, 'LE DEVUELVEN EL DINERO', C.green, 'check');
  punch(t, KW.orden - .4, PS(5), [['EN', '#ffffff'], ['ORDEN', C.amber]], 540, 1260, { size: 110 });
  const ST = (n, col, a, b, txt) => { punch(t, a - .2, a + 1.3, [['PASO', '#ffffff'], [n, col]], 540, 1250, { size: 110 }); pill(t, a + 1.1, b, 540, 1520, txt, col, 'check', 34); };
  ST('1', C.blue, KW.uno, PS(10), 'REVISA ANTES DE RECLAMAR');
  pill(t, KW.compara - .2, PS(9), 540, 1400, 'COMPARA CON MESES ANTERIORES', C.blue, 'arrow', 32);
  pill(t, KW.medidor - .2, PS(10), 540, 1400, 'MEDIDOR = FACTURA', C.green, 'check', 34);
  ST('2', C.amber, KW.dos, PS(13), 'RECLAMA PRIMERO A LA EMPRESA');
  pill(t, KW.identificacion - .2, PS(13), 540, 1400, 'IDENTIFICACIÓN + N.º DE CONTRATO', C.amber, 'dot', 32);
  punch(t, KW.importante - .2, PS(14), [['LO MÁS', '#ffffff'], ['IMPORTANTE', C.amber]], 540, 1260, { size: 88 });
  pill(t, KW.constancia1 - .6, PS(15), 540, 1450, 'N.º DE RECLAMO O CONSTANCIA', C.amber, 'star');
  punch(t, KW.papel - .4, PS(17), [['SIN PAPEL,', '#ffffff'], ['NO HAY PRUEBA', C.red]], 540, 1260, { size: 64 });
  punch(t, KW.susc - .1, PS(18) + .6, [['¡SUSCRÍBETE!', '#ffffff']], 540, 1250, { stamp: '#ff2d3d', size: 92, rot: -.05 });
  ST('3', C.purple, KW.tres, PS(21), 'NO TE QUEDES AHÍ');
  pill(t, KW.oficina - .3, PS(23), 540, 1400, 'OFICINA QUE PROTEGE AL CONSUMIDOR', C.purple, 'star', 31);
  pill(t, KW.respuesta2 - .3, PS(23), 540, 1490, 'LLEVA LA RESPUESTA O TU CONSTANCIA', C.blue, 'arrow', 31);
  ST('4', C.green, KW.cuatro, PS(25), 'NO LO DEJES PARA DESPUÉS');
  pill(t, KW.plazo - .4, PS(27), 540, 1400, 'LOS RECLAMOS TIENEN PLAZO', C.red, 'clock');
  punch(t, KW.derecho - .6, PS(27), [['PIERDES EL', '#ffffff'], ['DERECHO', C.red]], 540, 1250, { size: 88 });
  question(t, KW.coment, '¿Alguna vez reclamaste una factura?', ['Sí, y me resolvieron', 'Sí, y nada', 'Nunca he reclamado'], 1300);
}
