// ================= GRIETAS: ¿CUÁLES SON PELIGROSAS? =================
const DISC = 'Recreación ilustrativa · ante la duda, consulta a un profesional';
const KW = { pared: T('pared'), pintura1: T('pintura'), avisandote: T('avisándote'), facil: T('fácil'), ancho: T('ancho'), pelo: T('pelo'), panete: T('pañete'), grave: T('grave'), direccion: T('dirección'), diagonal: T('diagonal'), escalerita: T('escalerita'), blocks: T('blocks'), preocupan: T('preocupan'), estructura: T('estructura'), moviendo: T('moviendo'), horizontales: T('horizontales'), verticales: T('verticales'), susc: T('suscríbete'), crece: T('crece'), lapiz: T('lápiz'), puntas: T('puntas'), fecha: T('fecha'), semanas: T('semanas'), raya: T('raya'), creciendo1: T('creciendo'), alarmas: T('alarmas'), milimetros: T('milímetros'), creciendo2: T('creciendo', 2), puertas: T('puertas'), pisos: T('pisos'), tapes: T('tapes'), ingeniero: T('ingeniero'), coment: T('comentarios') };
// ---------- casa ----------
add(road(0, 12, 120)); [[-14, -6, 5, 4, 3, 0xe8d7b0], [14, -6, 5, 4, 4, 0xd9c9a6], [-24, -9, 5, 3, 6, 0xf0e0c0], [24, -10, 5, 3, 5, 0xe2d2b0]].forEach(b => building(...b));
[[-8.5, 5], [8.5, 5.5], [-11, 2], [11, 2]].forEach(([x, z]) => tree(x, z, 1.3));
add(box(12, .25, 3.5, 0xc9c4b8)).position.set(0, .12, 5.2);
const HOUSE = add(new THREE.Group());
{ const b = box(10, 4, 7, 0xefe3c8); b.position.set(0, 2, 0); HOUSE.add(b); const roof = box(10.6, .35, 7.6, 0xb9b2a4); roof.position.set(0, 4.17, 0); HOUSE.add(roof);
  const win = box(1.6, 1.3, .1, 0xf4f4f0); win.position.set(-3.3, 2.3, 3.55); const wg = box(1.4, 1.1, .1, lp(0x23406e, { roughness: .3 })); wg.position.set(-3.3, 2.3, 3.6); HOUSE.add(win, wg);
  const df = box(1.25, 2.45, .12, 0xf4f4f0); df.position.set(3.1, 1.22, 3.55); HOUSE.add(df); const dk = box(1.05, 2.3, .1, 0x1d2029); dk.position.set(3.1, 1.15, 3.57); HOUSE.add(dk); }
const DOOR = new THREE.Group(); DOOR.position.set(2.58, 0, 3.66); add(DOOR); { const d = box(1.04, 2.28, .08, 0x8a5a34); d.position.set(.52, 1.15, 0); const kn = sph(.05, 0xffd23a); kn.position.set(.92, 1.1, .07); DOOR.add(d, kn); }
// textura de la fachada (grietas dibujadas)
const S = 153.6, WT = canvasTex(1536, 615); const face = add(M(new THREE.PlaneGeometry(10, 4), new THREE.MeshStandardMaterial({ map: WT.tx, roughness: .9, transparent: true }), false)); face.position.set(0, 2, 3.505);
const wx = X => (X + 5) * S, wy = Y => (4 - Y) * S;
let sd = 3; const r2 = () => (sd = (sd * 16807) % 2147483647) / 2147483647;
function jag(pts, n, amp) { const out = []; for (let i = 0; i < pts.length - 1; i++) { const [a, b] = [pts[i], pts[i + 1]]; for (let k = 0; k < n; k++) { const f = k / n; out.push([lerp(a[0], b[0], f) + (k ? (r2() - .5) * amp : 0), lerp(a[1], b[1], f) + (k ? (r2() - .5) * amp : 0)]); } } out.push(pts[pts.length - 1]); return out; }
const CR = { main: jag([[-.8, 3.1], [.6, 1.4]], 18, .08), hair: jag([[-.5, 2.6], [.1, 2.45], [.6, 2.3]], 14, .05), diag: jag([[-1.3, 3.3], [1.0, 1.0]], 22, .1), horiz: jag([[-2.2, 1.6], [1.6, 1.66]], 26, .05), vert: jag([[2.0, 3.6], [2.05, 1.7]], 16, .05), grow: jag([[-.7, 3.0], [.3, 2.05], [.95, 1.45]], 14, .07), wide: jag([[-1.6, 3.5], [-.6, 2.4], [.2, 1.2]], 16, .1) };
const STAIR = (() => { const p = [[1.6, 3.6]]; let x = 1.6, y = 3.6; for (let i = 0; i < 6; i++) { y -= .2; p.push([x, y]); x -= .2 * (i % 2 ? 1 : 2); p.push([x, y]); } return p; })();
function stroke(x, pts, prog, w, col) { const n = Math.max(1, Math.floor((pts.length - 1) * clamp(prog))); if (prog <= 0) return; x.strokeStyle = col; x.lineWidth = w; x.lineJoin = 'round'; x.lineCap = 'round'; x.beginPath(); x.moveTo(wx(pts[0][0]), wy(pts[0][1])); for (let i = 1; i <= n; i++) x.lineTo(wx(pts[i][0]), wy(pts[i][1])); const f = (pts.length - 1) * clamp(prog) - n; if (n < pts.length - 1 && f > 0) x.lineTo(wx(lerp(pts[n][0], pts[n + 1][0], f)), wy(lerp(pts[n][1], pts[n + 1][1], f))); x.stroke(); }
function crack(x, pts, prog, w, hl) { if (hl) stroke(x, pts, prog, w + 16, hl); stroke(x, pts, prog, w + 2, 'rgba(120,100,70,.5)'); stroke(x, pts, prog, w, '#3b2f22'); }
function drawWall(t) {
  const x = WT.x; x.fillStyle = '#efe3c8'; x.fillRect(0, 0, 1536, 615);
  const blocks = inn(t, KW.escalerita - .4, PS(12)); if (blocks) { x.strokeStyle = `rgba(150,130,100,${.5 * eout(P(t, KW.escalerita - .4, .5))})`; x.lineWidth = 2; for (let r = 0; r < 20; r++) { const y = wy(r * .2); x.beginPath(); x.moveTo(0, y); x.lineTo(1536, y); x.stroke(); for (let c = 0; c < 26; c++) { const xx = wx(-5 + c * .4 + (r % 2) * .2); x.beginPath(); x.moveTo(xx, y); x.lineTo(xx, y - .2 * S); x.stroke(); } } }
  if (t < PS(3)) crack(x, CR.main, eout(P(t, .2, 1.4)), 4);
  else if (t < PS(8)) crack(x, CR.hair, eout(P(t, PS(3), .8)), 1.0);
  else if (t < PS(12)) { crack(x, CR.diag, eout(P(t, KW.diagonal - .3, 1)), 5, inn(t, KW.diagonal - .3, KW.escalerita - .3) ? 'rgba(255,77,77,.35)' : null); crack(x, STAIR, eout(P(t, KW.escalerita - .3, 1.2)), 5, inn(t, KW.escalerita - .3, PS(11)) ? 'rgba(255,77,77,.35)' : null); }
  else if (t < PS(14)) { crack(x, CR.horiz, eout(P(t, KW.horizontales - .3, 1)), 5, inn(t, KW.horizontales - .3, KW.verticales) ? 'rgba(255,77,77,.4)' : null); crack(x, CR.vert, eout(P(t, KW.verticales - .3, .8)), 4, inn(t, KW.verticales - .3, PS(13)) ? 'rgba(74,168,255,.4)' : null); }
  else {
    const grown = eout(P(t, KW.raya - .3, 1.2)); const base = 2 / 3; crack(x, CR.grow, t < KW.raya - .3 ? eout(P(t, PS(14), .8)) * base : base + grown * (1 - base), 4, t > KW.raya ? 'rgba(255,77,77,.3)' : null);
    if (t > KW.puntas - .2) { const pts = [CR.grow[0], CR.grow[Math.floor((CR.grow.length - 1) * base)]]; x.strokeStyle = '#1f4fd1'; x.lineWidth = 5; for (const [X, Y] of pts) { const k = eout(P(t, KW.puntas - .2, .4)); x.beginPath(); x.moveTo(wx(X) - 26 * k, wy(Y) - 10); x.lineTo(wx(X) + 26 * k, wy(Y) + 10); x.stroke(); } }
    if (t > KW.fecha - .2) { x.save(); x.globalAlpha = eout(P(t, KW.fecha - .2, .4)); x.fillStyle = '#1f4fd1'; x.font = '700 34px I'; x.fillText('21/11', wx(-.55), wy(3.05)); x.restore(); }
    if (t >= PS(19)) crack(x, CR.wide, eout(P(t, KW.milimetros - .6, 1.1)), 16, inn(t, KW.milimetros - .4, PS(21)) ? 'rgba(255,77,77,.35)' : null);
  }
  WT.tx.needsUpdate = true;
}
// ---------- utilería ----------
const RULER = add(texPlane(1.6, .22, 512, 70, (x, w, h) => { x.fillStyle = '#ffd23a'; x.fillRect(0, 0, w, h); x.fillStyle = '#1a1a1a'; for (let i = 0; i <= 50; i++) { const xx = 10 + i * 9.8; x.fillRect(xx, 0, 2, i % 10 ? (i % 5 ? 16 : 24) : 34); } x.font = '700 18px I'; for (let i = 0; i <= 5; i++) x.fillText(String(i), 6 + i * 98, 58); }, false));
const CALIP = add(texPlane(1.2, .5, 360, 150, (x, w, h) => { x.fillStyle = '#1d2029'; rrp(x, 0, 0, 0, w, h, 18); x.fill(); x.fillStyle = '#ff4d4d'; x.font = '900 70px I'; x.textAlign = 'center'; x.textBaseline = 'middle'; x.fillText('> 5 mm', w / 2, h / 2 + 4); }));
const PENCIL = add(new THREE.Group()); { const b = cyl(.06, .06, 1.1, 0xffc21a, 6); b.rotation.z = Math.PI / 2; const tip = M(new THREE.ConeGeometry(.06, .18, 6), lp(0xf1d4a8)); tip.rotation.z = Math.PI / 2; tip.position.x = -.64; const er = cyl(.062, .062, .12, 0xff8aa0, 8); er.rotation.z = Math.PI / 2; er.position.x = .6; PENCIL.add(b, tip, er); }
const CAL = add(new THREE.Group()); const CALT = canvasTex(256, 300); { const b = box(1.3, 1.5, .08, 0xffffff); const top = box(1.3, .3, .1, 0xff4d4d); top.position.y = .62; const pg = M(new THREE.PlaneGeometry(1.2, 1.15), new THREE.MeshBasicMaterial({ map: CALT.tx, toneMapped: false }), false); pg.position.set(0, -.1, .05); CAL.add(b, top, pg); }
function drawCal(n) { const x = CALT.x; x.fillStyle = '#fff'; x.fillRect(0, 0, 256, 300); x.fillStyle = '#1d2029'; x.font = '800 40px I'; x.textAlign = 'center'; x.fillText('SEMANA', 128, 80); x.font = '900 150px I'; x.fillText(String(n), 128, 240); CALT.tx.needsUpdate = true; }
const LEVEL = add(new THREE.Group()); const LVB = sph(.06, lp(0x9ff07a, { emissive: 0x2a5a10 })); { const b = box(1.8, .18, .22, 0x2b5fd0); const vial = box(.5, .1, .1, lp(0xd8ffd0, { transparent: true, opacity: .6 })); vial.position.set(0, .1, .06); LEVEL.add(b, vial, LVB); }
const MARBLE = add(sph(.12, lp(0x4aa8ff, { roughness: .2 })));
const ROLLER = add(new THREE.Group()); { const r = cyl(.18, .18, .8, 0xffffff, 16); r.rotation.z = Math.PI / 2; const h = box(.06, 1.0, .06, 0x9aa0aa); h.position.y = -.55; const hd = cyl(.06, .06, .6, 0xff4d4d, 8); hd.position.y = -1.3; ROLLER.add(r, h, hd); }
const HELMET = add(new THREE.Group()); { const d = M(new THREE.SphereGeometry(.45, 24, 12, 0, Math.PI * 2, 0, Math.PI / 2), lp(0xffcc33, { roughness: .35 })); const br = cyl(.58, .58, .05, 0xffcc33); HELMET.add(d, br); }
const CLIPB = add(new THREE.Group()); { const b = box(.8, 1.05, .05, 0x8a6a48); const p = texPlane(.7, .9, 140, 180, (x, w, h) => { x.fillStyle = '#fff'; x.fillRect(0, 0, w, h); x.fillStyle = '#1d2029'; x.font = '800 18px I'; x.fillText('REVISIÓN', 16, 28); for (let i = 0; i < 5; i++) { x.fillStyle = '#3ddc84'; x.fillRect(16, 50 + i * 24, 12, 12); x.fillStyle = '#9aa0aa'; x.fillRect(36, 52 + i * 24, 80, 7); } }); p.position.z = .03; CLIPB.add(b, p); }
// ---------- tomas ----------
SHOTS = [
  [0, PS(2), [0, 2.7, 15.5], [0, 2.5, 12.5], [0, 2.2, 3.5], [0, 2.3, 3.5]],
  [PS(2), PS(3), [-6, 4, 16], [6, 4, 16], [0, 2, 3.5], [0, 2, 3.5]],
  [PS(3), PS(8), [.1, 2.5, 8.2], [.05, 2.5, 7.2], [.05, 2.45, 3.5], [.05, 2.45, 3.5]],
  [PS(8), PS(12), [-.4, 2.4, 12.5], [.2, 2.4, 11.5], [.1, 2.3, 3.5], [.2, 2.3, 3.5]],
  [PS(12), PS(14), [-.2, 2.7, 14.5], [.2, 2.7, 14], [0, 2.4, 3.5], [0, 2.4, 3.5]],
  [PS(14), PS(19), [.4, 2.6, 10.5], [.3, 2.5, 9.5], [.1, 2.3, 3.5], [.1, 2.3, 3.5]],
  [PS(19), PS(22), [-.8, 2.7, 11], [-.4, 2.6, 10], [-.6, 2.3, 3.5], [-.5, 2.3, 3.5]],
  [PS(22), PS(23), [4.6, 2.2, 9.5], [4.2, 2.0, 8.5], [2.8, 1.1, 3.5], [2.8, 1.0, 3.5]],
  [PS(23), PS(25), [0, 3, 11], [0, 2.8, 9.5], [0, 2.2, 3.5], [0, 2.2, 3.5]],
  [PS(25), END, [0, 4.2, 19], [0, 4.6, 20.5], [0, 2.6, 3.5], [0, 2.6, 3.5]]
];
SHAKE = [[KW.moviendo - .3, KW.moviendo + .6, .05], [KW.alarmas, KW.alarmas + .5, .05]];
function animWorld(t) {
  sunAt(0, 0, 3, 14); drawWall(t);
  RULER.visible = inn(t, KW.ancho - .2, PS(8)); if (RULER.visible) { RULER.position.set(.05, 2.18, 3.56); RULER.rotation.z = -.05; pop(RULER, t, KW.ancho - .2, .4, PS(8) - .3); }
  CALIP.visible = inn(t, KW.milimetros - .3, PS(21)); if (CALIP.visible) { CALIP.position.set(-1.3, 1.6, 3.7); pop(CALIP, t, KW.milimetros - .3, .4, PS(21) - .3); }
  PENCIL.visible = inn(t, KW.lapiz - .3, KW.fecha + 1.4); if (PENCIL.visible) { const g0 = CR.grow[0], g1 = CR.grow[Math.floor((CR.grow.length - 1) * 2 / 3)]; let p = V(1.6, 1.6, 3.9); if (t > KW.puntas - .5) { const k = eio(P(t, KW.puntas - .5, .5)); p = V(lerp(1.6, g0[0] + .65, k), lerp(1.6, g0[1], k), 3.75); } if (t > KW.puntas + .3) { const k = eio(P(t, KW.puntas + .3, .5)); p = V(lerp(g0[0], g1[0], k) + .65, lerp(g0[1], g1[1], k), 3.75); } if (t > KW.fecha - .4) { const k = eio(P(t, KW.fecha - .4, .5)); p = V(lerp(g1[0] + .65, .2, k), lerp(g1[1], 3.05, k), 3.75); } PENCIL.position.copy(p); PENCIL.rotation.set(0, 0, -.5 + Math.sin(t * 12) * .05); pop(PENCIL, t, KW.lapiz - .3, .4, KW.fecha + 1.1); }
  CAL.visible = inn(t, KW.semanas - .3, PS(19)); if (CAL.visible) { CAL.position.set(1.15, 3.0, 3.8); pop(CAL, t, KW.semanas - .3, .4, PS(19) - .3); drawCal(1 + Math.min(2, Math.floor(P(t, KW.semanas, 1.2) * 3))); }
  // puerta que no cierra
  DOOR.rotation.y = inn(t, KW.puertas - .3, KW.pisos) ? -(.35 + .25 * Math.abs(Math.sin((t - KW.puertas) * 3))) : 0;
  LEVEL.visible = inn(t, KW.pisos - .3, PS(23)); if (LEVEL.visible) { LEVEL.position.set(2.0, .38, 4.6); LEVEL.rotation.z = .07; LVB.position.set(lerp(0, .2, eout(P(t, KW.pisos, .6))), .12, .06); pop(LEVEL, t, KW.pisos - .3, .4, PS(23) - .2); }
  MARBLE.visible = inn(t, KW.pisos, PS(23)); if (MARBLE.visible) { const k = P(t, KW.pisos, 1.8); MARBLE.position.set(lerp(1.0, 3.6, k * k), .37, 4.25); }
  ROLLER.visible = inn(t, KW.tapes - .3, PS(24)); if (ROLLER.visible) { ROLLER.position.set(-.2 + Math.sin(t * 6) * .3, 2.4, 3.85); pop(ROLLER, t, KW.tapes - .3, .4, PS(24) - .2); }
  HELMET.visible = CLIPB.visible = inn(t, KW.ingeniero - .3, END); if (HELMET.visible) { HELMET.position.set(-1.0, .3, 5.0); CLIPB.position.set(.9, .85, 5.0); CLIPB.rotation.x = -.4; pop(HELMET, t, KW.ingeniero - .3, .45); pop(CLIPB, t, KW.ingeniero, .45); }
}
// ---------- capa 2D ----------
function overlay2d(t) {
  floaters(t, 12, 'rgba(255,255,255,.75)', 'dust');
  punch(t, KW.pintura1 - .2, KW.avisandote - .2, [['¿PINTURA?', '#ffffff']], 540, 1320, { size: 96 });
  punch(t, KW.avisandote - .2, PS(2), [['¿O', '#ffffff'], ['AVISO?', C.red]], 540, 1320, { size: 96 });
  pill(t, KW.facil - .2, PS(3), 540, 1450, 'CASI NADIE LO SABE', C.amber, 'star');
  pill(t, PS(3), PS(5), 540, 1400, '1 · MIRA EL ANCHO', C.blue, 'dot');
  pill(t, KW.pelo - .3, PS(7), 540, 1400, 'FINITA COMO UN PELO', C.amber, 'dot');
  pill(t, KW.panete - .3, PS(7), 540, 1500, 'PINTURA O PAÑETE', C.blue, 'dot');
  pill(t, KW.grave - .3, PS(8), 540, 1400, 'NORMALMENTE NO ES GRAVE', C.green, 'check');
  pill(t, PS(8), PS(10), 540, 1400, '2 · MIRA LA DIRECCIÓN', C.blue, 'dot');
  pill(t, KW.diagonal - .2, KW.escalerita - .3, 540, 1420, 'EN DIAGONAL', C.red, 'warn');
  pill(t, KW.escalerita - .3, PS(11), 540, 1420, 'EN ESCALERITA POR LOS BLOCKS', C.red, 'warn');
  punch(t, KW.preocupan - .2, PS(11) + .3, [['PREOCUPAN', C.red]], 540, 1260, { size: 100 });
  pill(t, KW.estructura - .3, PS(12), 540, 1420, 'LA ESTRUCTURA SE PUEDE ESTAR MOVIENDO', C.red, 'warn', 29);
  pill(t, KW.horizontales - .2, PS(13), 540, 1380, 'HORIZONTAL: PREOCUPA MÁS', C.red, 'warn');
  pill(t, KW.verticales - .2, PS(13), 540, 1480, 'VERTICAL: SUELE SER MENOS', C.blue, 'dot');
  punch(t, KW.susc - .1, PE(13) + .2, [['¡SUSCRÍBETE!', '#ffffff']], 540, 1250, { stamp: '#ff2d3d', size: 92, rot: -.05 });
  pill(t, PS(14), PS(16), 540, 1420, '3 · MIRA SI CRECE', C.blue, 'dot');
  pill(t, KW.lapiz - .2, KW.fecha + .2, 540, 1420, 'MARCA LAS PUNTAS + FECHA', C.amber, 'check');
  pill(t, KW.semanas - .2, PS(18), 540, 1420, 'UNAS SEMANAS DESPUÉS…', C.amber, 'clock');
  punch(t, KW.creciendo1 - .3, PS(19), [['ESTÁ', '#ffffff'], ['CRECIENDO', C.red]], 540, 1300, { size: 92 });
  punch(t, KW.alarmas - .3, PS(20) - .1, [['ALARMAS', '#ffffff']], 540, 1280, { stamp: '#e02424', size: 96, rot: -.04 });
  pill(t, KW.milimetros - .3, PS(21), 540, 1450, 'MÁS DE 5 MILÍMETROS', C.red, 'warn');
  pill(t, PS(21), PS(22), 540, 1450, 'SIGUE CRECIENDO', C.red, 'warn');
  pill(t, KW.puertas - .2, KW.pisos - .2, 540, 1450, 'PUERTAS QUE NO CIERRAN', C.red, 'warn');
  pill(t, KW.pisos - .2, PS(23), 540, 1450, 'PISOS DESNIVELADOS', C.red, 'warn');
  pill(t, KW.tapes - .2, PS(24), 540, 1450, 'NO LA TAPES CON PINTURA', C.red, 'x');
  pill(t, KW.ingeniero - .3, PS(25), 540, 1450, 'LLAMA A UN INGENIERO', C.green, 'check');
  question(t, KW.coment, '¿De qué forma es tu grieta?', ['Finita como un pelo', 'Diagonal', 'En escalerita', 'Horizontal'], 1320);
}
