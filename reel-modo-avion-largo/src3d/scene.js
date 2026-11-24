// ================= MODO AVIÓN: ¿CARGA MÁS RÁPIDO? (video largo 16:9) =================
const DISC = (t) => inn(t, PS(39), PS(56)) ? 'Fuentes: Samsung (consejos de carga) · El Diario NY (prueba de 4 a 11 min)'
  : inn(t, PS(73), PS(113)) ? 'Fuente: Apple — "¿Por qué iones de litio?" · Digital Trends (calor y voltaje)'
  : inn(t, PS(113), PS(139)) ? 'Fuentes: Electrical Safety First (64 cargadores) · prueba de 400 cargadores falsos (Applesfera)'
  : inn(t, PS(139), PS(163)) ? 'Fuentes: Apple (carga optimizada, iones de litio)' : 'Recreación ilustrativa · no está a escala';
const KW = { avion1: T('avión'), funciona1: T('funciona'), dure: T('dure'), dane: T('dañe'), truco1: T('truco'), error1: T('error'), noches1: T('noches'), cargador1: T('cargador'), tanque1: T('tanque'), manguera: T('manguera'), llave1: T('llave'), saliendo1: T('saliendo'), antena1: T('antena'), wifi1: T('wifi'), bluetooth1: T('bluetooth'), ubicacion: T('ubicación'), aplicaciones1: T('aplicaciones'), nube: T('nube'), mensajes1: T('mensajes'), pantalla1: T('pantalla'), energia1: T('energía'), famoso: T('famoso'), samsung: T('samsung'), cuatro1: T('cuatro'), empujoncito: T('empujoncito'), llamadas: T('llamadas'), apagalo1: T('apágalo'), veinte1: T('veinte'), emergencia: T('emergencia'), susc: T('suscríbete'), imaginacion: T('imaginación'), danado: T('dañado'), vaso1: T('vaso'), estresa: T('estresa'), calor1: T('calor'), defiende: T('defiende'), sol1: T('sol'), carro1: T('carro'), almohada1: T('almohada'), jugando1: T('jugando'), envejece: T('envejece'), voltaje: T('voltaje'), forro: T('forro'), miedo: T('miedo'), sesenta: T('sesenta'), uno_solo: T('solo'), cuatrocientos: T('cuatrocientos'), tres1: T('tres'), piezas: T('piezas'), incendio: T('incendio'), cable: T('cable'), puerto: T('puerto'), pared1: T('pared'), regleta: T('regleta'), computadora: T('computadora'), explotar: T('explotar'), optimizada1: T('optimizada'), rutina: T('rutina'), levantes: T('levantes'), android: T('android'), actívala: T('actívala'), mito: T('mito'), viejas: T('viejas'), quieras: T('quieras'), coment: T('comentarios') };
// ---------- utilidades de celular ----------
function phoneTex(w = 256, h = 512) { return canvasTex(w, h); }
function drawPhone(S, o) { // o: {pct, plane, off, charging, hot, missed, night, label}
  const x = S.x, w = S.c.width, h = S.c.height;
  if (o.off) { x.fillStyle = '#05070b'; x.fillRect(0, 0, w, h); S.tx.needsUpdate = true; return; }
  const gr = x.createLinearGradient(0, 0, 0, h); gr.addColorStop(0, o.night ? '#0b1530' : '#3a4fd8'); gr.addColorStop(1, o.night ? '#141a35' : '#8a4ad8'); x.fillStyle = gr; x.fillRect(0, 0, w, h);
  x.fillStyle = '#fff'; x.textAlign = 'center'; x.font = `700 ${w * .07}px I`; x.fillText(o.time || '9:41', w * .2, h * .06);
  if (o.plane) { x.save(); x.translate(w * .78, h * .045); x.rotate(-.6); x.fillStyle = '#ffb020'; x.beginPath(); x.moveTo(0, -16); x.lineTo(4, -4); x.lineTo(16, 2); x.lineTo(4, 3); x.lineTo(3, 12); x.lineTo(7, 15); x.lineTo(0, 13); x.lineTo(-7, 15); x.lineTo(-3, 12); x.lineTo(-4, 3); x.lineTo(-16, 2); x.lineTo(-4, -4); x.closePath(); x.fill(); x.restore(); }
  // batería grande
  const bw = w * .5, bh = h * .4, bx = (w - bw) / 2, by = h * .28; x.strokeStyle = '#fff'; x.lineWidth = w * .025; rrp(x, 0, bx, by, bw, bh, w * .05); x.stroke(); x.fillStyle = '#fff'; x.fillRect(w / 2 - bw * .18, by - h * .025, bw * .36, h * .025);
  const p = clamp(o.pct / 100), fh = (bh - w * .06) * p; x.fillStyle = o.hot ? '#ff4d4d' : p < .2 ? '#ff4d4d' : p < .8 ? '#3ddc84' : '#35c46f'; rrp(x, 0, bx + w * .03, by + bh - w * .03 - fh, bw - w * .06, Math.max(2, fh), w * .03); x.fill();
  x.fillStyle = '#fff'; x.font = `900 ${w * .16}px I`; x.fillText(Math.round(o.pct) + '%', w / 2, by + bh + h * .12);
  if (o.charging) { x.save(); x.translate(w / 2, by + bh / 2); x.fillStyle = 'rgba(255,255,255,.95)'; x.beginPath(); x.moveTo(6, -40); x.lineTo(-22, 6); x.lineTo(-2, 6); x.lineTo(-8, 40); x.lineTo(22, -8); x.lineTo(2, -8); x.closePath(); x.fill(); x.restore(); }
  if (o.label) { x.fillStyle = 'rgba(255,255,255,.85)'; x.font = `700 ${w * .06}px I`; x.fillText(o.label, w / 2, h * .9); }
  if (o.missed) { x.fillStyle = 'rgba(255,77,77,.95)'; rrp(x, 0, w * .08, h * .12, w * .84, h * .09, 14); x.fill(); x.fillStyle = '#fff'; x.font = `800 ${w * .06}px I`; x.fillText('Llamada perdida (3)', w / 2, h * .18); }
  S.tx.needsUpdate = true;
}
function makePhone(S, sc = 1) { const p = new THREE.Group(); const b = rbox(2.2, 4.4, .26, .08, lp(0x1d2029, { roughness: .35 })); p.add(b); const s = M(new THREE.PlaneGeometry(2.04, 4.22), new THREE.MeshBasicMaterial({ map: S.tx, toneMapped: false }), false); s.position.z = .15; p.add(s); p.scale.setScalar(sc); return p; }
function tubeAlong(pts, r, col) { const c = new THREE.CatmullRomCurve3(pts); return M(new THREE.TubeGeometry(c, 60, r, 8), lp(col)); }
function chargerBrick(col = 0xf4f4f4) { const g0 = new THREE.Group(); const b = rbox(.9, .9, .9, .1, lp(col)); const p1 = box(.06, .35, .14, 0xc9cdd4); p1.position.set(-.18, 0, -.58); const p2 = p1.clone(); p2.position.x = .18; g0.add(b, p1, p2); return g0; }
const iconSpr = (col, draw) => { const c = canvasTex(128, 128), x = c.x; x.fillStyle = col; x.beginPath(); x.arc(64, 64, 60, 0, 6.29); x.fill(); x.strokeStyle = '#fff'; x.fillStyle = '#fff'; x.lineWidth = 9; x.lineCap = 'round'; draw(x); c.tx.needsUpdate = true; return new THREE.SpriteMaterial({ map: c.tx, transparent: true, depthWrite: false }); };
const IC = {
  antena: iconSpr('#ef4444', x => { x.beginPath(); x.moveTo(64, 40); x.lineTo(64, 100); x.stroke(); for (const r of [18, 32]) { x.beginPath(); x.arc(64, 40, r, -2.4, -.75); x.stroke(); } }),
  wifi: iconSpr('#4aa8ff', x => { for (const r of [14, 30, 46]) { x.beginPath(); x.arc(64, 92, r, -2.4, -.75); x.stroke(); } x.beginPath(); x.arc(64, 92, 6, 0, 6.29); x.fill(); }),
  bt: iconSpr('#2b5fd0', x => { x.beginPath(); x.moveTo(44, 44); x.lineTo(84, 82); x.lineTo(64, 100); x.lineTo(64, 28); x.lineTo(84, 46); x.lineTo(44, 84); x.stroke(); }),
  gps: iconSpr('#ff8a3d', x => { x.beginPath(); x.arc(64, 54, 22, Math.PI, 0); x.lineTo(64, 102); x.closePath(); x.fill(); x.fillStyle = '#ff8a3d'; x.beginPath(); x.arc(64, 54, 9, 0, 6.29); x.fill(); }),
  apps: iconSpr('#a98bff', x => { for (let i = 0; i < 4; i++) { x.fillRect(38 + (i % 2) * 30, 38 + Math.floor(i / 2) * 30, 22, 22); } }),
  nube: iconSpr('#22c55e', x => { x.beginPath(); x.arc(52, 70, 18, 0, 6.29); x.arc(74, 62, 22, 0, 6.29); x.arc(88, 76, 14, 0, 6.29); x.fill(); x.fillRect(40, 72, 56, 16); }),
  msg: iconSpr('#16a34a', x => { x.beginPath(); rrp(x, 0, 32, 38, 64, 44, 12); x.fill(); x.beginPath(); x.moveTo(46, 80); x.lineTo(40, 98); x.lineTo(60, 82); x.fill(); }),
  pant: iconSpr('#ffb020', x => { x.beginPath(); rrp(x, 0, 44, 28, 40, 72, 8); x.stroke(); x.beginPath(); x.arc(64, 64, 10, 0, 6.29); x.fill(); })
};
const ICK = ['antena', 'wifi', 'bt', 'gps', 'apps', 'nube', 'msg', 'pant'];

// ---------- ZONA A: celular gigante + toma de corriente ----------
add(road(100, 12, 320)); [[-14, -12, 5, 3, 7, 0xe8d7b0], [16, -14, 5, 3, 9, 0xd9c9a6], [60, -14, 5, 3, 6, 0xf0e0c0], [140, -14, 5, 3, 8, 0xe2d2b0], [180, -14, 5, 3, 5, 0xe8d7b0], [225, -12, 5, 3, 6, 0xd9c9a6]].forEach(b => building(...b));
[[-9, 4], [9, 5], [30, 5], [52, 5], [70, 5], [108, 5], [130, 5], [150, 5], [172, 5], [190, 5], [214, 5]].forEach(([x, z]) => tree(x, z, 1.4));
add(box(14, .2, 8, 0xd9d4c8)).position.set(0, .1, 0);
const SA = phoneTex(); const PA = add(makePhone(SA, 1.4)); PA.position.set(0, 3.3, 0);
const WALL = add(box(3, 4.5, .6, 0xefe3c8)); WALL.position.set(4.6, 2.25, -.6); const OUT = add(box(.9, 1.3, .12, 0xffffff)); OUT.position.set(4.6, 2.2, -.24);
const BRK = add(chargerBrick()); BRK.position.set(4.6, 2.2, .3);
const CBL = add(tubeAlong([V(4.6, 2.2, .75), V(4.0, 1.0, 1.2), V(2.0, .45, 1.2), V(.4, .6, .6), V(0, .25, 0)], .07, 0xf4f4f4));
const PLANE = add(new THREE.Group()); { const m = lp(0xffffff, { roughness: .4 }); const f = M(new THREE.CapsuleGeometry(.35, 2.4, 6, 14), m); f.rotation.z = Math.PI / 2; const wng = box(.7, .08, 3.2, m); const tl = box(.5, .7, .08, lp(0xff4d4d)); tl.position.set(-1.3, .4, 0); const tw = box(.4, .06, 1.2, m); tw.position.set(-1.3, .1, 0); PLANE.add(f, wng, tl, tw); }
// ---------- ZONA B: el tanque con la llave ----------
const BX = 40; add(box(14, .2, 8, 0xd9d4c8)).position.set(BX, .1, 0);
const TANK = add(new THREE.Group()); TANK.position.set(BX, 0, 0);
{ const st = box(3.2, 1.2, 3.2, 0x9aa0aa); st.position.y = .6; const gl = M(new THREE.CylinderGeometry(1.7, 1.7, 4.2, 40, 1, true), new THREE.MeshStandardMaterial({ color: 0xcfe8ff, transparent: true, opacity: .28, roughness: .1, side: THREE.DoubleSide }), false); gl.position.y = 3.3; const rim = M(new THREE.TorusGeometry(1.72, .07, 8, 40), lp(0x6b7280)); rim.rotation.x = Math.PI / 2; rim.position.y = 5.4; const bot = cyl(1.75, 1.75, .12, 0x6b7280, 40); bot.position.y = 1.2; TANK.add(st, gl, rim, bot); }
const WATER = M(new THREE.CylinderGeometry(1.62, 1.62, 1, 40), new THREE.MeshStandardMaterial({ color: 0x2f8fe0, transparent: true, opacity: .75, roughness: .15 }), false); TANK.add(WATER);
const HOSE = add(tubeAlong([V(BX - 4, .3, 1.5), V(BX - 3.6, 4, 1.2), V(BX - 2.4, 6.6, .4), V(BX - .4, 6.4, 0), V(BX - .2, 5.9, 0)], .14, 0x22a447));
const SPOUT = add(tubeAlong([V(BX + 1.6, 1.6, 0), V(BX + 2.6, 1.6, 0), V(BX + 2.9, 1.3, 0)], .16, 0x9aa0aa));
const VALVE = add(new THREE.Group()); { const st = cyl(.06, .06, .5, 0x6b7280); st.position.y = .25; const wh = M(new THREE.TorusGeometry(.35, .06, 8, 24), lp(0xe02424)); wh.rotation.x = Math.PI / 2; wh.position.y = .5; const sp = box(.7, .05, .06, 0xe02424); sp.position.y = .5; const sp2 = sp.clone(); sp2.rotation.y = Math.PI / 2; VALVE.add(st, wh, sp, sp2); } VALVE.position.set(BX + 2.2, 1.75, 0);
const INFLOW = parts(30, new THREE.MeshBasicMaterial({ color: 0x8fd0ff, transparent: true, opacity: .85 }), .09);
const OUTFLOW = parts(30, new THREE.MeshBasicMaterial({ color: 0x8fd0ff, transparent: true, opacity: .85 }), .08);
const LEAKS = []; for (let i = 0; i < 16; i++) { const s = new THREE.Sprite(IC[ICK[i % 8]]); s.scale.set(.7, .7, 1); add(s); LEAKS.push(s); }
// ---------- ZONA C: carrera de carga + batería gigante + vaso ----------
const CX = 80; add(box(16, .2, 8, 0xd9d4c8)).position.set(CX, .1, 0);
const SC1 = phoneTex(), SC2 = phoneTex(); const PC1 = add(makePhone(SC1, 1.0)); PC1.position.set(CX - 1.8, 2.5, 0); const PC2 = add(makePhone(SC2, 1.0)); PC2.position.set(CX + 1.8, 2.5, 0);
for (const p of [PC1, PC2]) { const pd = add(box(1.8, .3, 1.2, 0x9aa0aa)); pd.position.set(p.position.x, .25, 0); }
const BAT = add(new THREE.Group()); BAT.position.set(CX + 30, 0, 0);
{ const shell = M(new THREE.CapsuleGeometry(1.3, 3.4, 8, 24), new THREE.MeshStandardMaterial({ color: 0xffffff, transparent: true, opacity: .22, roughness: .1 }), false); shell.position.y = 3.2; const cap = cyl(.55, .55, .45, 0x6b7280, 20); cap.position.y = 5.75; const base = cyl(1.6, 1.8, .3, 0x9aa0aa, 30); base.position.y = .15; BAT.add(shell, cap, base); }
const BFILL = M(new THREE.CylinderGeometry(1.12, 1.12, 1, 32), lp(0x3ddc84, { emissive: 0x0a5a2a, emissiveIntensity: .5 }), false); BAT.add(BFILL);
const MARK80 = M(new THREE.TorusGeometry(1.33, .04, 6, 40), lp(0xffb020, { emissive: 0x664400 })); MARK80.rotation.x = Math.PI / 2; MARK80.position.y = 1.1 + 4.1 * .8; BAT.add(MARK80);
const GLASS = add(new THREE.Group()); GLASS.position.set(CX + 34, 0, 1); { const g0 = M(new THREE.CylinderGeometry(.9, .75, 2.4, 32, 1, true), new THREE.MeshStandardMaterial({ color: 0xe6f6ff, transparent: true, opacity: .3, side: THREE.DoubleSide }), false); g0.position.y = 1.4; const bt = cyl(.75, .75, .1, lp(0xe6f6ff, { transparent: true, opacity: .5 }), 32); bt.position.y = .25; GLASS.add(g0, bt); }
const GW = M(new THREE.CylinderGeometry(.8, .72, 1, 32), new THREE.MeshStandardMaterial({ color: 0x2f8fe0, transparent: true, opacity: .75 }), false); GLASS.add(GW);
const POUR = parts(20, new THREE.MeshBasicMaterial({ color: 0x8fd0ff, transparent: true, opacity: .85 }), .07);
const JUG = add(new THREE.Group()); { const j = cyl(.45, .55, 1.1, lp(0x4aa8ff, { transparent: true, opacity: .8 }), 20); const sp = M(new THREE.ConeGeometry(.15, .4, 10), lp(0x4aa8ff)); sp.rotation.z = -1.6; sp.position.set(.55, .35, 0); JUG.add(j, sp); } JUG.position.set(CX + 33, 3.6, 1); JUG.rotation.z = -.7;
// ---------- ZONA D: el calor ----------
const DX = 120; add(box(16, .2, 9, 0xe7d9c0)).position.set(DX, .1, 0);
const SD = phoneTex(); const PD = add(makePhone(SD, 1.0)); PD.position.set(DX, 2.6, 0);
const HEAT = add(new THREE.Sprite(new THREE.SpriteMaterial({ color: 0xff4020, transparent: true, opacity: 0, depthWrite: false }))); { const t2 = canvasTex(128, 128), x = t2.x, gr = x.createRadialGradient(64, 64, 0, 64, 64, 64); gr.addColorStop(0, 'rgba(255,80,30,1)'); gr.addColorStop(1, 'rgba(255,80,30,0)'); x.fillStyle = gr; x.fillRect(0, 0, 128, 128); t2.tx.needsUpdate = true; HEAT.material.map = t2.tx; } HEAT.scale.set(6, 8, 1); HEAT.position.set(DX, 2.6, -.3);
const THERM = add(new THREE.Group()); const TMERC = cyl(.14, .14, 1, lp(0xff3030, { emissive: 0x550000 }), 12); { const tb = M(new THREE.CapsuleGeometry(.24, 3.2, 6, 16), new THREE.MeshStandardMaterial({ color: 0xffffff, transparent: true, opacity: .35 }), false); tb.position.y = 2; const bl = sph(.4, lp(0xff3030, { emissive: 0x550000 })); bl.position.y = .3; THERM.add(tb, bl, TMERC); } THERM.position.set(DX + 3.2, .3, .5);
const SUN = add(new THREE.Group()); { const s = sph(1.0, new THREE.MeshBasicMaterial({ color: 0xffd23a })); SUN.add(s); for (let i = 0; i < 10; i++) { const r = box(.12, .7, .12, new THREE.MeshBasicMaterial({ color: 0xffb020 })); const a = i / 10 * Math.PI * 2; r.position.set(Math.cos(a) * 1.5, Math.sin(a) * 1.5, 0); r.rotation.z = a - Math.PI / 2; SUN.add(r); } } SUN.position.set(DX - 3.5, 6.5, -1);
const CARD = add(new THREE.Group()); { const b = rbox(3.2, .8, 1.5, .1, lp(0x2b5fd0)); b.position.y = .6; const c = rbox(1.8, .6, 1.3, .1, lp(0x2b5fd0)); c.position.set(-.2, 1.2, 0); CARD.add(b, c); for (const [x, z] of [[1, .75], [1, -.75], [-1, .75], [-1, -.75]]) { const w = cyl(.3, .3, .2, 0x1b1d22, 14); w.rotation.x = Math.PI / 2; w.position.set(x, .3, z); CARD.add(w); } } CARD.position.set(DX - 4.5, 0, 2.2);
const PILLOW = add(rbox(2.2, .5, 1.4, .22, lp(0xf6f0ff))); PILLOW.position.set(DX + 4.6, .45, 2.2);
const PAD = add(new THREE.Group()); { const b = rbox(1.4, .25, .7, .12, lp(0x2a2d36)); const g1 = sph(.33, lp(0x2a2d36)); g1.scale.y = .6; g1.position.set(-.55, 0, .1); const g2 = g1.clone(); g2.position.x = .55; const bt = cyl(.07, .07, .05, 0xff4d4d, 8); bt.position.set(.45, .15, -.05); PAD.add(b, g1, g2, bt); } PAD.position.set(DX + 1.8, .45, 2.6);
// ---------- ZONA E: los cargadores ----------
const EX = 160; add(box(18, .2, 10, 0xd9d4c8)).position.set(EX, .1, 0);
const TABLE = add(box(12, .3, 4, 0xc9a77c)); TABLE.position.set(EX, 1.8, -1.2); for (const [x, z] of [[-5.6, -3], [5.6, -3], [-5.6, .6], [5.6, .6]]) { const l = add(box(.25, 1.7, .25, 0x9a6a40)); l.position.set(EX + x, .85, z); }
const CHG = new THREE.InstancedMesh(new THREE.BoxGeometry(.5, .5, .5), lp(0xffffff), 64); CHG.castShadow = true; scene.add(CHG); const CHGC = new THREE.Color();
for (let i = 0; i < 64; i++) { tmp.position.set(EX - 5.2 + (i % 16) * .69, 2.2, -2.8 + Math.floor(i / 16) * .8); tmp.rotation.set(0, 0, 0); tmp.scale.setScalar(1); tmp.updateMatrix(); CHG.setMatrixAt(i, tmp.matrix); CHG.setColorAt(i, CHGC.set(0xf4f4f4)); }
const ORIG = add(chargerBrick()); ORIG.scale.setScalar(2); ORIG.position.set(EX - 2.4, 3.2, 2.2);
const FAKE = add(new THREE.Group()); { const sh = rbox(1.8, 1.8, 1.8, .2, new THREE.MeshStandardMaterial({ color: 0xffffff, transparent: true, opacity: .25 })); FAKE.add(sh); const pcb = box(1.2, .08, 1.2, 0x1f7a3a); pcb.position.y = -.5; const c1 = cyl(.15, .15, .5, 0x2b5fd0, 10); c1.position.set(-.3, -.2, .2); FAKE.add(pcb, c1); } FAKE.position.set(EX + 2.4, 3.2, 2.2);
const ORIGIN = add(new THREE.Group()); { const sh = rbox(1.8, 1.8, 1.8, .2, new THREE.MeshStandardMaterial({ color: 0xffffff, transparent: true, opacity: .25 })); ORIGIN.add(sh); const pcb = box(1.2, .08, 1.2, 0x1f7a3a); pcb.position.y = -.5; ORIGIN.add(pcb); const parts0 = [[-.35, .2, 0x2b5fd0], [.0, .15, 0xffb020], [.35, .25, 0x6b7280], [-.2, .1, 0xa98bff], [.25, .05, 0x2a2d36]]; parts0.forEach(([x, h, c], i) => { const p = cyl(.13, .13, .4 + h, c, 10); p.position.set(x, -.25 + h / 2, (i % 2 ? .3 : -.25)); ORIGIN.add(p); }); const tr = box(.5, .45, .45, 0xb87333); tr.position.set(0, -.2, .35); ORIGIN.add(tr); } ORIGIN.position.set(EX - 2.4, 3.2, 2.2);
const SPARK = parts(24, new THREE.MeshBasicMaterial({ color: 0xffd23a }), .05);
const FIRE = add(new THREE.Group()); { const f1 = M(new THREE.ConeGeometry(.45, 1.2, 10), lp(0xff7a1a, { emissive: 0x993300 })); f1.position.y = .6; const f2 = M(new THREE.ConeGeometry(.25, .8, 10), lp(0xffd23a, { emissive: 0x996600 })); f2.position.set(.05, .45, .2); FIRE.add(f1, f2); } FIRE.position.set(EX + 2.4, 4.1, 2.2);
const WALLE = add(box(4, 5, .5, 0xefe3c8)); WALLE.position.set(EX + 6.5, 2.5, 1); const OUTE = add(box(.9, 1.3, .12, 0xffffff)); OUTE.position.set(EX + 6.5, 2.2, 1.3);
const STRIP = add(new THREE.Group()); { const b = box(2.4, .3, .7, 0xf4f4f4); STRIP.add(b); for (let i = 0; i < 5; i++) { const c = chargerBrick(i % 2 ? 0x2a2d36 : 0xf4f4f4); c.scale.setScalar(.5); c.position.set(-.95 + i * .48, .35, 0); STRIP.add(c); } } STRIP.position.set(EX - 4.5, 2.15, 1.8);
const LAP = add(new THREE.Group()); { const b = box(2.2, .1, 1.5, 0x9aa0aa); const s = box(2.2, 1.45, .08, 0x1d2029); s.position.set(0, .72, -.72); s.rotation.x = -.15; LAP.add(b, s); } LAP.position.set(EX - 1.5, 2.05, 1.8);
// ---------- ZONA F: la noche ----------
const FX = 200; add(box(14, .2, 8, 0xcfc3ad)).position.set(FX, .1, 0);
const BED = add(new THREE.Group()); { const f = box(4.5, .6, 6, 0x8a5a34); f.position.y = .5; const m = box(4.3, .5, 5.8, 0xf4f4f0); m.position.y = 1.05; const bl = box(4.4, .2, 3.6, 0x3d7bff); bl.position.set(0, 1.35, 1.0); const hb = box(4.5, 2.4, .3, 0x8a5a34); hb.position.set(0, 1.4, -3); const pl = rbox(1.6, .4, .9, .18, lp(0xffffff)); pl.position.set(-1, 1.5, -2.2); BED.add(f, m, bl, hb, pl); } BED.position.set(FX - 2, 0, -.5);
const NIGHT = add(box(1.6, 1.6, 1.4, 0x9a6a40)); NIGHT.position.set(FX + 1.3, .8, -2.4);
const SF = phoneTex(); const PF = add(makePhone(SF, .55)); PF.position.set(FX + 1.3, 2.0, -2.2); PF.rotation.x = -.35;
const MOON = add(sph(1.2, new THREE.MeshBasicMaterial({ color: 0xfff6d8 }))); MOON.position.set(FX + 5, 9, -6);
const CLOCK = add(texPlane(2.4, 1.0, 360, 150, (x, w, h) => { }, true)); CLOCK.position.set(FX + 2.6, 3.0, -2.4);
function drawClock(s) { const x = CLOCK.userData.tex.x; x.clearRect(0, 0, 360, 150); x.fillStyle = 'rgba(14,16,24,.9)'; rrp(x, 0, 0, 0, 360, 150, 22); x.fill(); x.fillStyle = '#ffb020'; x.font = '900 96px I'; x.textAlign = 'center'; x.textBaseline = 'middle'; x.fillText(s, 180, 80); CLOCK.userData.tex.tx.needsUpdate = true; }
// ---------- tomas [t0, t1, pos0, pos1, look0, look1, fov] ----------
const ZS = [[PS(163) + .2, 0, 3, 11], [PS(167), BX, 3, 12], [PS(170), EX, 3, 13], [PS(173), DX, 3, 12], [PS(176), FX, 2.5, 12]];
SHOTS = [
  [0, PS(2), [-3, 4, 15], [-1.5, 3.8, 13], [.5, 3.3, 0], [.6, 3.2, 0]],
  [PS(2), PS(9), [6, 5, 17], [-4, 5, 17], [1, 3, 0], [1, 3, 0]],
  [PS(9), PS(11), [3.5, 2.6, 10], [2.5, 2.2, 8.5], [2, 2, 0], [2, 1.8, 0]],
  [PS(11), PS(18), [BX - 2, 4.2, 15], [BX + .5, 4, 13.5], [BX, 3.2, 0], [BX, 3, 0]],
  [PS(18), PS(31), [BX + 5, 3.2, 11], [BX + 3, 2.6, 9.5], [BX + 2.6, 2.2, 0], [BX + 2.8, 2.0, 0]],
  [PS(31), PS(39), [BX - 3, 5, 16], [BX + 3, 4.6, 15], [BX, 3.2, 0], [BX + 1, 3, 0]],
  [PS(39), PS(45), [-2, 3.8, 11], [-1, 3.6, 10], [0, 3.6, 0], [0, 3.5, 0]],
  [PS(45), PS(56), [CX, 3.6, 13], [CX, 3.2, 11], [CX, 2.6, 0], [CX, 2.5, 0]],
  [PS(56), PS(60), [CX + 3.5, 3.2, 8], [CX + 2.6, 3, 7], [CX + 1.8, 2.8, 0], [CX + 1.8, 2.8, 0]],
  [PS(60), PS(64), [BX - 3, 4.6, 15], [BX + 2, 4.4, 14], [BX + 1, 3, 0], [BX + 1, 3, 0]],
  [PS(64), PS(71), [-3, 4.2, 13], [2, 3.8, 12], [.8, 3.2, 0], [.8, 3.2, 0]],
  [PS(71), PS(73), [CX - 40, 14, 30], [CX + 20, 12, 30], [CX - 20, 2, 0], [CX + 20, 2, 0]],
  [PS(73), PS(81), [CX + 30, 4.2, 14], [CX + 30.5, 4, 12.5], [CX + 31, 3.2, 0], [CX + 31, 3.2, 0]],
  [PS(81), PS(87), [CX + 34.5, 2.8, 9], [CX + 34, 2.6, 8], [CX + 33, 2, .5], [CX + 33, 2, .5]],
  [PS(87), PS(91), [CX + 31, 4.6, 15], [CX + 32, 4.2, 14], [CX + 31.5, 3.2, 0], [CX + 31.5, 3.2, 0]],
  [PS(91), PS(97), [DX - 3, 4, 13], [DX + 1, 3.6, 11.5], [DX, 2.8, 0], [DX, 2.6, 0]],
  [PS(97), PS(104), [DX + 6, 6, 16], [DX - 6, 6, 16], [DX, 2, 1], [DX, 2, 1]],
  [PS(104), PS(113), [DX + 2, 3.6, 10.5], [DX + 1, 3.3, 9.5], [DX + 1, 2.4, 0], [DX + 1, 2.4, 0]],
  [PS(113), PS(122), [EX, 6, 15], [EX, 5.4, 13], [EX, 2.4, -1.5], [EX, 2.4, -1.5]],
  [PS(122), PS(130), [EX + 3, 4.6, 11], [EX - 1, 4.4, 10], [EX, 3.2, 2], [EX, 3.2, 2]],
  [PS(130), PS(139), [EX + 1, 4.4, 13], [EX + 3, 4, 12], [EX + 1, 2.4, 1.5], [EX + 2, 2.4, 1.5]],
  [PS(139), PS(147), [FX + 6, 5.5, 13], [FX + 4, 5, 11], [FX, 1.8, -1], [FX + .5, 1.8, -1.5]],
  [PS(147), PS(156), [FX + 3, 3.4, 5.5], [FX + 2.6, 3.2, 4.6], [FX + 1.3, 2.4, -2.3], [FX + 1.3, 2.4, -2.3]],
  [PS(156), PS(163), [-3, 3.8, 12], [-2, 3.6, 11], [0, 3.4, 0], [0, 3.4, 0]],
  ...ZS.map(([a, x, y, z], i) => [a, i < 4 ? ZS[i + 1][0] : PS(178), [x + 3, y + 1.5, z + 2], [x + 1, y + 1, z], [x + (i === 1 ? 1 : 0), y - .3, 0], [x + (i === 1 ? 1 : 0), y - .4, 0]]),
  [PS(178), PS(185), [CX - 60, 16, 34], [CX + 60, 16, 34], [CX - 40, 2, 0], [CX + 60, 2, 0]],
  [PS(185), END, [-4, 5, 16], [-5, 5.6, 17.5], [0, 3.2, 0], [0, 3.2, 0]]
];
SHAKE = [[KW.incendio - .1, KW.incendio + .7, .06], [KW.calor1 - .1, KW.calor1 + .6, .05]];
// ---------- animación ----------
function nightK(t) { return inn(t, PS(139) - .3, PS(156)) ? eout(P(t, PS(139) - .3, .8)) * (1 - eout(P(t, PS(156) - .6, .6))) : 0; }
function animWorld(t) {
  const zx = SHOTS.find(s => t >= s[0] && t < s[1]); sunAt(zx ? zx[4][0] : 0, 0, 0, 16);
  const nk = nightK(t); hemi.intensity = lerp(1.25, .35, nk); sunL.intensity = lerp(2.7, .5, nk); renderer.toneMappingExposure = lerp(1.05, .8, nk); MOON.visible = nk > .05; if (!window.SKYT) window.SKYT = scene.background; if (nk > .02) { scene.background = new THREE.Color(0x9fd4f5).lerp(new THREE.Color(0x0b1430), nk); scene.fog.color.set(0xcfe7f7).lerp(new THREE.Color(0x0b1430), nk); } else { scene.background = window.SKYT; scene.fog.color.set(0xcfe7f7); }
  // A: celular gigante
  const planeOn = inn(t, KW.avion1 - .2, PS(2)) || inn(t, PS(39), PS(45)) || inn(t, PS(163), PS(167));
  const offA = inn(t, KW.apagalo1, PS(71));
  drawPhone(SA, { pct: t < PS(9) ? 23 + t * .4 : t < PS(64) ? 35 : 35 + P(t, PS(66), 14) * 40, plane: planeOn, charging: true, off: offA && t > KW.apagalo1 + .3 && !inn(t, PS(156), PS(163)), label: inn(t, PS(156), PS(163)) ? 'Puedes cargar cuando quieras' : null });
  PLANE.visible = inn(t, PS(31) - .3, PS(33)) || inn(t, KW.avion1 - .3, PS(2)); if (PLANE.visible) { const a0 = t < PS(2) ? KW.avion1 - .3 : PS(31) - .3, k = P(t, a0, 3.2); const bx = t < PS(2) ? 0 : BX; PLANE.position.set(bx - 9 + k * 18, 7 + Math.sin(k * 6) * .3, -1); PLANE.rotation.set(Math.sin(t * 3) * .1, 0, .05); }
  // B: tanque
  const level = t < PS(11) ? .5 : t < PS(31) ? .45 + .05 * Math.sin(t * .5) : t < PS(60) ? lerp(.45, .65, P(t, PS(33), 6)) : lerp(.65, .95, P(t, PS(65), 5));
  const wl = 4.0 * level; WATER.scale.y = wl; WATER.position.y = 1.26 + wl / 2;
  const leakAmt = t < PS(33) ? 1 : t < PS(65) ? .35 : 0; VALVE.rotation.y = (t > PS(33) ? 1.6 * eout(P(t, PS(33), .8)) : 0) + (t > PS(65) ? 2 * eout(P(t, PS(65), .8)) : 0);
  const fl = inn(t, PS(11) + 2, PS(71)); INFLOW.visible = OUTFLOW.visible = fl;
  for (let i = 0; i < 30; i++) { const ph = (t * 1.6 + i / 30) % 1; setP(INFLOW, i, BX - .2 + Math.sin(i) * .05, lerp(5.8, 1.3 + wl, ph), Math.cos(i) * .05, fl, 1); setP(OUTFLOW, i, BX + 2.9 + ph * .2, lerp(1.25, .2, ph), Math.sin(i * 2) * .05, fl && i / 30 < leakAmt, 1); }
  INFLOW.instanceMatrix.needsUpdate = OUTFLOW.instanceMatrix.needsUpdate = true;
  const icAt = [KW.antena1, KW.wifi1, KW.bluetooth1, KW.ubicacion, KW.aplicaciones1, KW.nube, KW.mensajes1, KW.pantalla1];
  LEAKS.forEach((s, i) => { const k = i % 8, a0 = icAt[k] - .2 + Math.floor(i / 8) * 1.1; const keep = t < PS(33) ? true : t < PS(65) ? (k >= 4) : false; s.visible = inn(t, a0, PS(71)) && keep && inn(t, PS(18) - .5, PS(71)); if (!s.visible) return; const ph = ((t - a0) * .35) % 1; s.position.set(BX + 3.0 + ph * 2.5 + (k % 3) * .4, 1.3 - ph * .2 + Math.sin(ph * 3 + k) * .5 + (k % 4) * .35, (k % 2 ? .6 : -.6)); s.material.opacity = 1 - P(ph, .8, .2); s.scale.setScalar(.75 * eback(P(t, a0, .3))); });
  // C: carrera
  const race = P(t, PS(45), PS(56) - PS(45)); const tm = Math.min(1, race * 1.25);
  drawPhone(SC1, { pct: 20 + tm * 70, charging: true, label: 'Normal' }); drawPhone(SC2, { pct: 20 + Math.min(1, tm * 1.12) * 70, plane: true, charging: true, label: 'Modo avión', missed: inn(t, KW.llamadas - .2, PS(60)) });
  // batería gigante (0→80 rápido, luego lento)
  const bk = P(t, PS(73), PS(81) - PS(73)); const bp = bk < .45 ? lerp(.05, .8, eout(bk / .45)) : lerp(.8, 1, (bk - .45) / .55); const bpp = t >= PS(87) ? lerp(.05, .8, eout(P(t, PS(88), 2.4))) + (t > PS(89) ? .2 * P(t, PS(89), 3) : 0) : bp;
  BFILL.scale.y = 4.1 * bpp; BFILL.position.y = 1.1 + 4.1 * bpp / 2; BFILL.material.color.set(bpp > .8 ? 0x35c46f : 0x3ddc84); MARK80.visible = t > KW.imaginacion - 1;
  const gk = P(t, PS(82), PS(84) - PS(82)); const gfill = gk < .5 ? lerp(.05, .75, gk / .5) : lerp(.75, .95, (gk - .5) / .5); GW.scale.y = 2.2 * gfill; GW.position.y = .3 + 1.1 * gfill;
  POUR.visible = inn(t, PS(82), PS(84)); const pourRate = gk < .5 ? 1 : .3; for (let i = 0; i < 20; i++) { const ph = (t * 2 + i / 20) % 1; setP(POUR, i, CX + 33.5 - ph * .3, lerp(3.4, .4 + 2.2 * gfill, ph), 1, POUR.visible && i / 20 < pourRate, 1); } POUR.instanceMatrix.needsUpdate = true; JUG.rotation.z = POUR.visible ? (gk < .5 ? -1.1 : -.8) : -.6;
  // D: calor
  const hot = inn(t, PS(91), PS(109)); HEAT.material.opacity = hot ? .45 + .15 * Math.sin(t * 4) : inn(t, PS(109), PS(113)) ? .15 : 0;
  drawPhone(SD, { pct: hot ? 40 + P(t, PS(91), 20) * 10 : 55, charging: true, hot, plane: t > PS(109) });
  const temp = hot ? .55 + .4 * eout(P(t, KW.calor1, 3)) : .4; TMERC.scale.y = 3 * temp; TMERC.position.y = .3 + 1.5 * temp;
  pop(SUN, t, KW.sol1 - .3, .45); SUN.rotation.z = t * .3; pop(CARD, t, KW.carro1 - .3, .45); pop(PILLOW, t, KW.almohada1 - .3, .45); pop(PAD, t, KW.jugando1 - .3, .45);
  // E: cargadores
  for (let i = 0; i < 64; i++) { let c = 0xf4f4f4; if (t > PS(118) - .3) c = i === 37 ? 0x22c55e : 0xef4444; else if (t > KW.sesenta) { const k = P(t, KW.sesenta, 3); if (i / 64 < k) c = 0xdedede; } CHG.setColorAt(i, CHGC.set(c)); const s = t > KW.sesenta - .4 ? eback(P(t, KW.sesenta - .4 + (i % 16) * .03, .3)) : 0; tmp.position.set(EX - 5.2 + (i % 16) * .69, 2.2 + (i === 37 && t > PS(118) ? .25 + .1 * Math.sin(t * 6) : 0), -2.8 + Math.floor(i / 16) * .8); tmp.scale.setScalar(Math.max(.001, s)); tmp.updateMatrix(); CHG.setMatrixAt(i, tmp.matrix); }
  CHG.instanceMatrix.needsUpdate = true; CHG.instanceColor.needsUpdate = true;
  ORIGIN.visible = FAKE.visible = inn(t, PS(122), PS(130)); ORIG.visible = false; if (ORIGIN.visible) { pop(ORIGIN, t, PS(123), .4, PS(130) - .3); pop(FAKE, t, PS(123) + .2, .4, PS(130) - .3); }
  SPARK.visible = inn(t, PS(126), PS(130)) || inn(t, KW.puerto - .2, PS(133)); for (let i = 0; i < 24; i++) { const ph = (t * 2.2 + i / 24) % 1, a = i * 2.39; const o = t < PS(130) ? FAKE.position : V(EX - 1.5, 2.2, 1.8); setP(SPARK, i, o.x + Math.cos(a) * ph * 1.4, o.y + Math.sin(a) * ph * 1.2, o.z + .9, SPARK.visible, 1 - ph); } SPARK.instanceMatrix.needsUpdate = true;
  pop(FIRE, t, KW.incendio - .2, .4, PS(130)); FIRE.scale.y *= 1 + .15 * Math.sin(t * 14);
  pop(STRIP, t, KW.regleta - .3, .45, PS(139)); pop(LAP, t, KW.computadora - .3, .45, PS(139));
  // F: la noche
  const nh = t < PS(147) ? 11 : t < PS(151) ? 1 + P(t, PS(147), PS(151) - PS(147)) * 4 : t < PS(153) ? 5 + P(t, PS(151), 2) * 1.5 : 6.5;
  const nPct = t < PS(142) ? 100 : t < PS(147) ? 100 : t < PS(152) ? Math.min(80, 40 + P(t, PS(147), 6) * 40) : 80 + P(t, PS(152), 2.2) * 20;
  drawPhone(SF, { pct: nPct, night: true, charging: true, time: (Math.floor(nh) % 12 || 12) + ':' + String(Math.floor((nh % 1) * 60)).padStart(2, '0'), label: inn(t, PS(147), PS(156)) ? 'Carga optimizada' : null });
  CLOCK.visible = inn(t, PS(139), PS(156)); if (CLOCK.visible) drawClock(`${String(Math.floor(nh) % 24).padStart(2, '0')}:${String(Math.floor((nh % 1) * 60)).padStart(2, '0')}`);
}
// ---------- capa 2D ----------
function race2d(t) { panel(t, PS(47), PS(56), 800, 770, 760, 170, 'PRUEBAS: MODO AVIÓN VS. NORMAL', C.amber, (g, w, h) => { const k = eout(P(t, PS(47) + .3, 2.5)); g.font = '700 24px I'; g.fillStyle = '#fff'; g.textAlign = 'left'; g.textBaseline = 'middle'; g.fillText('Ahorro de tiempo:', -w / 2 + 30, 0); g.fillStyle = 'rgba(255,255,255,.12)'; rrp(g, 0, -w / 2 + 260, -14, 440, 28, 14); g.fill(); g.fillStyle = C.green; rrp(g, 0, -w / 2 + 260, -14, Math.max(28, 440 * (11 / 60) * k), 28, 14); g.fill(); g.font = '900 54px I'; g.fillStyle = C.amber; g.textAlign = 'center'; g.fillText('4 – 11 MIN', 0, 58); }); }
function grid400(t) { panel(t, KW.cuatrocientos - .2, PS(122), 800, 520, 560, 560, '400 CARGADORES FALSOS', C.red, (g, w, h) => { const n = 20, s = 22, ox = -n * s / 2, oy = -n * s / 2 + 24; const k = P(t, KW.cuatrocientos, 2.5); const greens = new Set([47, 213, 368]); for (let i = 0; i < 400; i++) { if (i / 400 > k) break; const ok = greens.has(i) && t > KW.tres1 - .3; g.fillStyle = ok ? C.green : 'rgba(255,77,77,.85)'; g.beginPath(); g.arc(ox + (i % n) * s + s / 2, oy + Math.floor(i / n) * s + s / 2, ok ? 9 : 7, 0, 6.29); g.fill(); } }); }
function steps5(t) { const L = [[PS(164), '1 · ¿PRISA? MODO AVIÓN'], [PS(167), '2 · ¿MUCHA PRISA? APÁGALO'], [PS(170), '3 · CARGADOR ORIGINAL O CERTIFICADO'], [PS(173), '4 · LEJOS DEL CALOR'], [PS(176), '5 · CARGA OPTIMIZADA']]; L.forEach(([a, txt], i) => pill(t, a, PS(181), 300, 250 + i * 64, txt, C.green, 'check', 26)); }
function overlay2d(t) {
  floaters(t, 10, 'rgba(255,255,255,.65)', 'dust');
  // intro
  pill(t, KW.avion1 - .2, PS(1), 800, 760, 'MODO AVIÓN = ¿CARGA MÁS RÁPIDO?', C.amber, 'arrow');
  punch(t, PS(1) + .4, PS(2), [['¿FUNCIONA?', '#ffffff']], 800, 520, { size: 92 });
  pill(t, PS(3), PS(5), 330, 300, 'CARGA MÁS RÁPIDO', C.green, 'check', 26); pill(t, KW.dure - .2, PS(5), 330, 362, 'TE DURA MÁS', C.green, 'check', 26); pill(t, KW.dane - .2, PS(5), 330, 424, 'NO SE DAÑA', C.green, 'check', 26);
  punch(t, KW.truco1, PS(7), [['NO ES EL', '#ffffff'], ['MODO AVIÓN', C.red]], 800, 540, { size: 80 });
  pill(t, KW.error1, PS(9), 800, 780, 'EL ERROR DE TODAS LAS NOCHES', C.red, 'warn');
  pill(t, PS(10), PS(11), 800, 780, '¿QUÉ PASA CUANDO LO CONECTAS?', C.blue, 'arrow');
  // tanque
  pill(t, KW.tanque1 - .2, PS(14), 1210, 260, 'BATERÍA = TANQUE', C.blue, 'dot', 26); pill(t, KW.manguera - .2, PS(14), 1210, 320, 'CARGADOR = MANGUERA', C.green, 'dot', 26);
  pill(t, KW.llave1 - .2, PS(18), 800, 790, 'UNA LLAVE ABIERTA POR ABAJO', C.red, 'warn');
  pill(t, PS(18), PS(20), 800, 790, 'LO QUE HACE MIENTRAS CARGA', C.amber, 'dot');
  const LK = [[KW.antena1, 'ANTENA', C.red], [KW.wifi1, 'WIFI', C.blue], [KW.bluetooth1, 'BLUETOOTH', C.blue], [KW.ubicacion, 'UBICACIÓN', C.amber], [KW.aplicaciones1, 'APPS', C.purple], [KW.nube, 'NUBE', C.green], [KW.mensajes1, 'MENSAJES', C.green], [KW.pantalla1, 'PANTALLA', C.amber]];
  LK.forEach(([a, txt, c], i) => pill(t, a - .1, PS(31), 1330 - (i % 2) * 190, 250 + Math.floor(i / 2) * 62, txt, c, 'x', 22));
  punch(t, KW.energia1 - .2, PS(29), [['GASTA', '#ffffff'], ['ENERGÍA', C.red]], 600, 560, { size: 76 });
  pill(t, PS(29), PS(31), 800, 790, 'ENTRA POR UN LADO… SALE POR EL OTRO', C.red, 'warn');
  punch(t, KW.famoso - .3, PS(32), [['MODO', '#ffffff'], ['AVIÓN', C.amber]], 800, 540, { size: 96 });
  pill(t, PS(32), PS(33), 800, 790, 'APAGA ANTENA, WIFI Y BLUETOOTH', C.blue, 'check');
  pill(t, PS(33), PS(38), 800, 790, 'CIERRA PARTE DE LA LLAVE', C.green, 'check');
  pill(t, PS(38), PS(39), 800, 790, 'MÁS ENERGÍA SE QUEDA', C.green, 'check');
  punch(t, PS(40) - .2, PS(42), [['SÍ', C.green], ['FUNCIONA', '#ffffff']], 800, 540, { size: 96 });
  pill(t, KW.samsung - .2, PS(45), 800, 790, 'SAMSUNG LO RECOMIENDA', C.blue, 'check');
  punch(t, PS(45), PS(47), [['¿CUÁNTO', '#ffffff'], ['MÁS?', C.amber]], 800, 560, { size: 90 });
  race2d(t);
  punch(t, KW.empujoncito - .2, PS(53), [['UN', '#ffffff'], ['EMPUJONCITO', C.amber]], 800, 300, { size: 76 });
  pill(t, PS(54), PS(56), 800, 250, 'LO QUE GASTAN LAS ANTENAS ES POCO', C.blue, 'dot');
  pill(t, KW.llamadas - .2, PS(58), 800, 790, 'NO TE ENTRAN LLAMADAS NI MENSAJES', C.red, 'warn');
  pill(t, PS(58), PS(60), 800, 790, '¿ESPERAS UNA LLAMADA? NO LO USES', C.amber, 'warn');
  punch(t, PS(61), KW.apagalo1, [['¿EL TRUCO', '#ffffff'], ['REAL?', C.amber]], 800, 540, { size: 86 });
  punch(t, KW.apagalo1 - .1, PS(64), [['APÁGALO', C.green]], 800, 540, { size: 110 });
  pill(t, PS(65), PS(67), 800, 790, 'LA LLAVE SE CIERRA POR COMPLETO', C.green, 'check');
  pill(t, KW.veinte1 - .2, PS(70), 800, 790, 'SALES EN 20 MIN Y ESTÁ EN ROJO', C.red, 'clock');
  punch(t, KW.emergencia - .6, PS(71), [['TRUCO DE', '#ffffff'], ['EMERGENCIA', C.green]], 800, 540, { size: 80 });
  punch(t, KW.susc - .1, PS(72) + 1, [['¡SUSCRÍBETE!', '#ffffff']], 800, 520, { stamp: '#ff2d3d', size: 86, rot: -.05 });
  // 80 %
  pill(t, PS(73), PS(76), 800, 790, 'RAPIDÍSIMO… Y DESPUÉS DEL 80 %, LENTO', C.amber, 'clock');
  pill(t, KW.danado - .3, PS(77), 800, 790, 'NO ESTÁ DAÑADO', C.green, 'check');
  pill(t, PS(77), PS(81), 800, 790, 'APPLE: RÁPIDO HASTA 80 %, LUEGO LENTO', C.blue, 'check');
  pill(t, PS(82), PS(83), 800, 790, 'AL PRINCIPIO, RÁPIDO', C.green, 'check'); pill(t, PS(83), PS(85), 800, 790, 'CASI LLENO, DESPACITO', C.amber, 'clock');
  pill(t, KW.estresa - .3, PS(87), 800, 790, 'BAJA LA VELOCIDAD PARA PROTEGERLA', C.blue, 'check');
  pill(t, PS(88), PS(91), 800, 790, '0 → 80 % RÁPIDO · ÚLTIMO 20 % LENTO', C.green, 'clock');
  // calor
  punch(t, KW.calor1 - .3, PS(93), [['EL', '#ffffff'], ['CALOR', C.red]], 800, 520, { size: 110 });
  pill(t, PS(93), PS(96), 800, 790, 'SE CALIENTA → CARGA MÁS LENTO', C.red, 'warn');
  pill(t, PS(96), PS(97), 800, 790, 'APPLE: LIMITA LA CARGA SI HAY CALOR', C.blue, 'dot');
  const HX = [[KW.sol1, 'AL SOL'], [KW.carro1, 'CARRO CALIENTE'], [KW.almohada1, 'BAJO LA ALMOHADA'], [KW.jugando1, 'JUGANDO MIENTRAS CARGA']];
  HX.forEach(([a, txt], i) => pill(t, a - .2, PS(104), 300, 260 + i * 62, txt, C.red, 'x', 24));
  punch(t, KW.envejece - .3, PS(106), [['LO', '#ffffff'], ['ENVEJECE', C.red]], 800, 520, { size: 96 });
  pill(t, PS(106), PS(108), 800, 790, 'CALOR + VOLTAJE ALTO = DESGASTE', C.red, 'warn');
  pill(t, PS(109), PS(111), 800, 790, 'MODO AVIÓN = SE CALIENTA MENOS', C.green, 'check');
  pill(t, PS(111), PS(113), 800, 790, 'QUÍTALE EL FORRO · LUGAR FRESCO', C.green, 'check');
  // cargadores
  pill(t, PS(114), PS(116), 800, 790, 'SI EL CARGADOR ES MALO…', C.red, 'warn');
  pill(t, KW.sesenta - .2, PS(117), 800, 790, '64 CARGADORES GENÉRICOS', C.amber, 'dot');
  punch(t, PS(118) - .2, PS(120), [['SOLO', '#ffffff'], ['1', C.green], ['PASÓ', '#ffffff']], 800, 600, { size: 96 });
  grid400(t);
  pill(t, PS(123), PS(125), 800, 790, 'POR DENTRO LES FALTAN PIEZAS', C.red, 'warn');
  const RK = [[PS(126), 'SE CALIENTA'], [PS(127), 'DAÑA TU CELULAR'], [PS(128), 'TE DA CORRIENTE'], [PS(129), 'INCENDIO']];
  RK.forEach(([a, txt], i) => pill(t, a - .1, PS(130), 1300, 260 + i * 62, txt, C.red, 'warn', 24));
  pill(t, PS(131), PS(133), 800, 790, 'CABLES SIN CERTIFICACIÓN: OJO', C.red, 'warn');
  pill(t, PS(134), PS(136), 800, 790, 'ORIGINAL O CERTIFICADO', C.green, 'check');
  pill(t, PS(136), PS(137), 800, 790, 'DIRECTO A LA PARED', C.green, 'check');
  pill(t, KW.regleta - .2, PS(139), 800, 790, 'NI REGLETA LLENA NI PUERTO DE LA PC', C.red, 'x');
  // noche
  pill(t, PS(139), PS(142), 800, 790, 'EL ERROR DE TODAS LAS NOCHES', C.red, 'warn');
  punch(t, PS(142), PS(143), [['TODA LA NOCHE', '#ffffff'], ['AL 100 %', C.red]], 800, 520, { size: 70 });
  pill(t, KW.explotar - .3, PS(145), 800, 790, 'NO EXPLOTA: CORTA LA CARGA', C.green, 'check');
  pill(t, PS(146), PS(147), 800, 790, 'HORAS ENTRE 80 % Y 100 % = ENVEJECE', C.red, 'warn');
  punch(t, KW.optimizada1 - .3, PS(149), [['CARGA', '#ffffff'], ['OPTIMIZADA', C.green]], 800, 300, { size: 76 });
  pill(t, KW.rutina - .2, PS(153), 800, 790, 'ESPERA EN 80 % Y TERMINA AL DESPERTAR', C.green, 'clock');
  pill(t, KW.android - .3, PS(154), 800, 790, 'MUCHOS ANDROID TIENEN ALGO PARECIDO', C.blue, 'dot');
  pill(t, PS(154), PS(156), 800, 790, 'AJUSTES › BATERÍA › ACTÍVALA', C.green, 'check');
  // mito
  punch(t, KW.mito - .3, PS(158), [['MITO', '#ffffff']], 800, 520, { stamp: '#e02424', size: 90, rot: -.05 });
  pill(t, PS(157), PS(158), 800, 790, '¿DESCARGARLA COMPLETA ANTES?', C.amber, 'warn');
  punch(t, PS(158) - .1, PS(159) + .3, [['NO', C.red]], 800, 520, { size: 130 });
  pill(t, PS(159), PS(161), 800, 790, 'ESO ERA CON LAS BATERÍAS VIEJAS', C.blue, 'dot');
  pill(t, PS(161), PS(163), 800, 790, 'APPLE: CÁRGALA CUANDO QUIERAS', C.green, 'check');
  // resumen
  punch(t, PS(163), PS(164), [['RESUMEN EN', '#ffffff'], ['5 PASOS', C.amber]], 800, 520, { size: 80 });
  steps5(t);
  pill(t, PS(179), PS(181), 800, 790, '0 → 80 % RÁPIDO · EL RESTO, LENTO A PROPÓSITO', C.amber, 'clock');
  punch(t, PS(181), PS(183), [['NO ES MAGIA…', '#ffffff'], ['NI MENTIRA', C.amber]], 800, 520, { size: 76 });
  question(t, KW.coment, '¿Cargas el celular en modo avión?', ['Sí', 'Nunca', 'A veces', '¿Cuánto te dura la batería?'], 640);
}
