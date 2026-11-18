// ================= CELULAR QUE CARGA LENTO: pelusa en el puerto =================
const K = { lento: PS(0), aveces: PS(1), bateria: PS(2), espera: PS(3), noes: PS(4), mira: PS(5), explico: PS(6), metes: PS(7), bolsillo: PS(8), conectas: PS(9), empuja: PS(10), tiempo: PS(11), noentra: PS(12), notocan: PS(13), desconecta: PS(14),
  p1: PS(15), apaga: PS(16), p2: PS(17), alumbra: PS(18), gris: PS(19), problema: PS(20), p3: PS(21), palillo: PS(22), aguja: PS(23), rayar: PS(24), p4: PS(25), raspa: PS(26), saca: PS(27), fuerza: PS(28),
  p5: PS(29), voltea: PS(30), golpe: PS(31), p6: PS(32), limpia: PS(33), conecta: PS(34), completo: PS(35), listo: PS(36), sigue: PS(37), otro: PS(38), tampoco: PS(39), tecnico: PS(40), cuanta: PS(41), leo: PS(42) };
const CLIC = (() => { try { return T('clic'); } catch (e) { return K.completo + 1.2; } })();
// pared lisa con enchufe
(function () { const x = WT.x; x.fillStyle = '#f3e6cf'; x.fillRect(0, 0, 1024, 406); x.fillStyle = '#e4d3b6'; x.fillRect(0, py(.15), 1024, 8);
  x.fillStyle = '#ffffff'; rrp(x, 0, pxx(.75), py(.62), 34, 48, 6); x.fill(); x.fillStyle = '#555'; x.fillRect(pxx(.75) + 10, py(.62) + 12, 4, 10); x.fillRect(pxx(.75) + 20, py(.62) + 12, 4, 10);
  x.fillStyle = '#9fd6f2'; x.fillRect(pxx(-2.6), py(2.0), 150, 120); x.strokeStyle = '#ffffff'; x.lineWidth = 10; x.strokeRect(pxx(-2.6), py(2.0), 150, 120); WT.tx.needsUpdate = true; })();
// mesa, sofá, lámpara
const woodM = lp(0x9a6a40); const TB = add(new THREE.Group()); TB.position.set(.6, 0, -.7);
{ const top = M(new THREE.BoxGeometry(1.5, .07, .8), woodM); top.position.y = .8; TB.add(top); for (const [a, b] of [[-.68, -.34], [.68, -.34], [-.68, .34], [.68, .34]]) { const l = M(new THREE.BoxGeometry(.07, .78, .07), woodM); l.position.set(a, .4, b); TB.add(l); } }
{ const so = add(new THREE.Group()); so.position.set(-2.1, .15, -1.2); const b = M(new THREE.BoxGeometry(1.6, .45, .8), lp(0x4a6fa5)); b.position.y = .22; const bk = M(new THREE.BoxGeometry(1.6, .6, .2), lp(0x4a6fa5)); bk.position.set(0, .6, -.3); so.add(b, bk); }
// celular sobre la mesa (de pie en un soporte)
const PHS = canvasTex(256, 512);
const phone = add(new THREE.Group()); phone.position.set(.6, .84, -.72);
{ const body = rbox(.36, .72, .05, .03, mat(0x1b1e27, { roughness: .35 })); body.position.y = .36; phone.add(body);
  const scr = M(new THREE.PlaneGeometry(.32, .66), new THREE.MeshStandardMaterial({ map: PHS.tx, emissive: 0xffffff, emissiveMap: PHS.tx, emissiveIntensity: .9, roughness: .3 }), false); scr.position.set(0, .36, .046); phone.add(scr);
  const port = M(new THREE.BoxGeometry(.1, .02, .06), new THREE.MeshBasicMaterial({ color: 0xff8a3d }), false); port.position.set(0, .0, 0); phone.add(port); const spk = M(new THREE.BoxGeometry(.1, .012, .01), lp(0x8a8f99), false); spk.position.set(0, .7, .047); phone.add(spk); }
phone.rotation.x = -.12;
const stand = add(M(new THREE.BoxGeometry(.3, .05, .2), lp(0x666a75))); stand.position.set(.6, .835, -.66);
// cable al enchufe
const cableM = lp(0xf2f2f2); let cableMesh = null;
function setCable(p0, p1, sag = .25) { if (cableMesh) { scene.remove(cableMesh); cableMesh.geometry.dispose(); } const mid = p0.clone().lerp(p1, .5); mid.y -= sag; const c = new THREE.CatmullRomCurve3([p0, p0.clone().lerp(mid, .5).add(V(0, -.05, 0)), mid, mid.clone().lerp(p1, .5), p1]); cableMesh = add(M(new THREE.TubeGeometry(c, 30, .012, 6), cableM, false)); }
const plugS = add(rbox(.06, .1, .035, .01, cableM)); // conector pequeño
function drawPhone(pct, chg, off, warn) {
  const x = PHS.x; x.fillStyle = off ? '#000' : '#0d1730'; x.fillRect(0, 0, 256, 512); if (off) { PHS.tx.needsUpdate = true; return; }
  x.fillStyle = '#ffffff'; x.font = '700 30px M'; x.textAlign = 'center'; x.fillText('9:41', 128, 60);
  x.strokeStyle = '#ffffff'; x.lineWidth = 8; rrp(x, 0, 58, 180, 140, 230, 18); x.stroke(); x.fillStyle = '#ffffff'; x.fillRect(103, 164, 50, 16);
  const col = pct < .2 ? '#ff4d61' : pct < .5 ? '#f6b445' : '#35d39a'; x.fillStyle = col; const hh = 206 * pct; x.fillRect(70, 398 - hh, 116, hh);
  x.font = '900 46px M'; x.fillStyle = '#fff'; x.fillText(Math.round(pct * 100) + '%', 128, 470);
  if (chg) { x.fillStyle = '#ffd23a'; x.beginPath(); x.moveTo(140, 220); x.lineTo(100, 300); x.lineTo(130, 300); x.lineTo(115, 370); x.lineTo(160, 280); x.lineTo(130, 280); x.closePath(); x.fill(); }
  if (warn) { x.fillStyle = '#ff4d61'; x.font = '900 30px M'; x.fillText('¿CARGANDO?', 128, 130); }
  PHS.tx.needsUpdate = true; }
// batería nueva (con precio) para "comprar otra batería"
const newBat = add(new THREE.Group()); newBat.position.set(-.35, .84, -.6);
{ const b = rbox(.34, .5, .08, .02, lp(0x2c3245)); b.position.y = .26; const st = canvasTex(128, 192), x = st.x; x.fillStyle = '#2c3245'; x.fillRect(0, 0, 128, 192); x.fillStyle = '#35d39a'; x.fillRect(20, 30, 88, 20); x.fillStyle = '#fff'; x.font = '900 30px M'; x.textAlign = 'center'; x.fillText('BATERÍA', 64, 110); x.fillStyle = '#f6b445'; x.font = '900 34px M'; x.fillText('$$$', 64, 160); st.tx.needsUpdate = true; const f = M(new THREE.PlaneGeometry(.3, .45), new THREE.MeshBasicMaterial({ map: st.tx }), false); f.position.set(0, .26, .045); newBat.add(b, f); }
// linterna
const torch = add(new THREE.Group()); { const b = M(new THREE.CylinderGeometry(.045, .045, .32, 12), lp(0xffcc33)); b.rotation.z = Math.PI / 2; const h = M(new THREE.CylinderGeometry(.07, .05, .1, 12), lp(0x333844)); h.rotation.z = Math.PI / 2; h.position.x = -.2; torch.add(b, h); }
const beamM = new THREE.MeshBasicMaterial({ color: 0xfff2b0, transparent: true, opacity: .28, depthWrite: false, blending: THREE.AdditiveBlending });
const beam = new THREE.Mesh(new THREE.ConeGeometry(.18, .9, 24, 1, true), beamM); beam.rotation.z = Math.PI / 2; beam.position.x = -.68; torch.add(beam);
// ======== diorama gigante del puerto (corte) ========
const X0 = 30; add(M(new THREE.CylinderGeometry(4.2, 4.4, .4, 40), lp(0xd6dbe4))).position.set(X0, -.2, 0);
const MAC = add(new THREE.Group()); MAC.position.set(X0 - .2, 2.6, 0); MAC.scale.setScalar(.72);
const shellM = lp(0x2b2f3a), cutM = lp(0xc2563c), goldM = new THREE.MeshStandardMaterial({ color: 0xf2c14e, metalness: .8, roughness: .25, emissive: 0x35d39a, emissiveIntensity: 0 });
{ const mk = (w, h, d, x, y, z, m) => { const o = M(new THREE.BoxGeometry(w, h, d), m); o.position.set(x, y, z); MAC.add(o); return o; };
  mk(4.2, .55, 1.6, .1, .55, 0, shellM); mk(4.2, .55, 1.6, .1, -.55, 0, shellM); mk(.5, .55, 1.6, -1.85, 0, 0, shellM); mk(3.7, .55, .12, .35, 0, -.74, lp(0x1d2029));
  mk(4.2, .04, .02, .1, .82, .81, cutM); mk(4.2, .04, .02, .1, -.82, .81, cutM); mk(4.2, .55, .02, .1, .55, .81, lp(0x3a3f4c)); mk(4.2, .55, .02, .1, -.55, .81, lp(0x3a3f4c));
  mk(4.3, .06, 1.7, .1, .86, 0, new THREE.MeshStandardMaterial({ color: 0x0c1830, roughness: .15, metalness: .2 })); // pantalla
  const pcb = mk(3.0, .1, 1.2, -.3, .32, 0, lp(0x1f7a4a)); for (let i = 0; i < 5; i++) mk(.25, .08, .25, -1.4 + i * .55, .4, -.2 + (i % 2) * .3, lp([0x222222, 0x8a8f99, 0x222222, 0xc0c4cc, 0x222222][i]));
}
const portPins = []; for (let i = 0; i < 6; i++) for (const s of [1, -1]) { const p = M(new THREE.BoxGeometry(.1, .05, .9), goldM); p.position.set(-1.45 + i * .16, .25 * s, 0); MAC.add(p); portPins.push(p); }
// conector gigante
const PLUG = new THREE.Group(); MAC.add(PLUG);
const plugGold = new THREE.MeshStandardMaterial({ color: 0xf2c14e, metalness: .8, roughness: .25, emissive: 0x35d39a, emissiveIntensity: 0 });
{ const sh = M(new THREE.BoxGeometry(1.2, .38, 1.1), mat(0xc9ced8, { metalness: .7, roughness: .3 })); sh.position.x = .6; PLUG.add(sh);
  for (let i = 0; i < 6; i++) for (const s of [1, -1]) { const p = M(new THREE.BoxGeometry(.1, .03, .8), plugGold); p.position.set(.12 + i * .16, .2 * s, 0); PLUG.add(p); }
  const hs = rbox(.8, .62, 1.3, .1, lp(0xf2f2f2)); hs.position.x = 1.6; PLUG.add(hs);
  const cb = M(new THREE.CylinderGeometry(.14, .14, 4, 12), lp(0xf2f2f2)); cb.rotation.z = Math.PI / 2; cb.position.x = 4.0; PLUG.add(cb); }
// pelusa: bolitas sueltas + "alfombrita" compactada al fondo
const lintM = new THREE.MeshStandardMaterial({ color: 0x8e8e96, roughness: 1, flatShading: true });
const lint = new THREE.InstancedMesh(new THREE.IcosahedronGeometry(.07, 0), lintM, 50); lint.frustumCulled = false; MAC.add(lint);
const LP = Array.from({ length: 50 }, (_, i) => ({ sx: 3.2 + rnd() * 2.5, sy: (rnd() - .5) * 1.8, sz: (rnd() - .5) * 1.2, ex: -1.45 + rnd() * .5, ey: -.2 + rnd() * .1, ez: (rnd() - .5) * 1.1, d: rnd() * 1.2, s: .7 + rnd() * .9 }));
const LT = canvasTex(128, 128); { const x = LT.x; x.fillStyle = '#86868e'; x.fillRect(0, 0, 128, 128); for (let i = 0; i < 400; i++) { x.strokeStyle = ['#6d6d75', '#a5a5ad', '#5b5b63', '#b8b2a8'][i % 4]; x.lineWidth = 1 + rnd() * 2; x.beginPath(); const a = rnd() * 128, b = rnd() * 128; x.moveTo(a, b); x.quadraticCurveTo(a + (rnd() - .5) * 30, b + (rnd() - .5) * 30, a + (rnd() - .5) * 40, b + (rnd() - .5) * 40); x.stroke(); } LT.tx.needsUpdate = true; }
const carpet = M(new THREE.BoxGeometry(1, .46, 1.3), new THREE.MeshStandardMaterial({ map: LT.tx, roughness: 1, emissive: 0xff4d61, emissiveIntensity: 0 })); MAC.add(carpet);
// palillo, aguja, paño, linterna gigante
const pick = new THREE.Group(); MAC.add(pick); { const c = M(new THREE.CylinderGeometry(.13, .03, 4.5, 10), lp(0xe0b77a)); c.rotation.z = Math.PI / 2; c.position.x = 2.25; pick.add(c); }
const pickLint = M(new THREE.IcosahedronGeometry(.22, 1), new THREE.MeshStandardMaterial({ map: LT.tx, roughness: 1, flatShading: true })); pick.add(pickLint); pickLint.scale.set(1.3, .8, 1.1);
const needle = new THREE.Group(); MAC.add(needle); { const c = M(new THREE.CylinderGeometry(.07, .01, 4.5, 8), mat(0xdfe3ea, { metalness: .9, roughness: .15 })); c.rotation.z = Math.PI / 2; c.position.x = 2.25; needle.add(c); }
const sparkM = new THREE.MeshBasicMaterial({ color: 0xfff3a0, transparent: true, blending: THREE.AdditiveBlending, depthWrite: false });
const spark = new THREE.Mesh(new THREE.IcosahedronGeometry(.18, 0), sparkM); MAC.add(spark);
const cloth = rbox(.9, .7, 1.5, .15, lp(0xf2f6ff)); MAC.add(cloth);
const bigBeam = new THREE.Mesh(new THREE.ConeGeometry(.55, 4, 32, 1, true), beamM.clone()); bigBeam.rotation.z = -Math.PI / 2; MAC.add(bigBeam);
const macL = new THREE.PointLight(0xfff4e0, 0, 14, 1.2); macL.position.set(X0 + .5, 3.2, 3.6); scene.add(macL);
const tunL = new THREE.PointLight(0xfff0b0, 0, 4, 1.5); MAC.add(tunL); tunL.position.set(-.8, 0, .4);
// energía por el cable
const flow = parts(16, 0x5bffb5, .07);
// batería 3D flotante (indicador de carga)
const BAT = add(new THREE.Group()); { const sh = rbox(.7, 1.2, .3, .08, new THREE.MeshStandardMaterial({ color: 0xffffff, transparent: true, opacity: .35, roughness: .2 })); const cp = rbox(.3, .12, .2, .04, lp(0xffffff)); cp.position.y = .66; BAT.add(sh, cp); }
const batFillM = new THREE.MeshStandardMaterial({ color: 0x35d39a, emissive: 0x35d39a, emissiveIntensity: .6 }); const batFill = M(new THREE.BoxGeometry(.56, 1.06, .2), batFillM, false); BAT.add(batFill);
function setBat(pct) { batFill.scale.y = Math.max(.01, pct); batFill.position.y = -.53 + .53 * pct; const c = pct < .2 ? 0xff4d61 : pct < .5 ? 0xf6b445 : 0x35d39a; batFillM.color.set(c); batFillM.emissive.set(c); }
const crumbs = parts(14, 0x8e8e96, .025);
// ---- cámara ----
const PH0 = V(.6, 1.1, -.72); // pantalla del celular en la mesa
const MC = V(X0 - .2, 2.6, 0);
SHOTS = [
  [0, K.espera, [2.6, 1.9, 5.2], [1.6, 1.5, 3.4], [.3, 0.78, -.6], [.5, 0.83, -.7]],
  [K.espera, K.mira, [.1, 1.5, 3.6], [.4, 1.3, 2.6], [-.1, 0.88, -.5], [.3, 0.83, -.6]],
  [K.mira, K.explico, [.6, 1.0, 1.4], [.6, 0.9, .4], [.6, 0.64, -.7], [.6, 0.63, -.72]],
  [K.explico, K.bolsillo, [X0 + 1.6, 2.9, 7.4], [X0 + .6, 2.5, 6.2], [X0 + .3, 1.75, 0], [X0, 1.75, 0]],
  [K.bolsillo, K.empuja, [X0 + 2.4, 3.1, 6.6], [X0 + 1.4, 2.5, 5.6], [X0 + .8, 1.75, 0], [X0 + .2, 1.75, 0]],
  [K.empuja, K.tiempo, [X0 - .4, 2.4, 4.2], [X0 - .9, 2.2, 3.6], [X0 - .9, 2.15, 0], [X0 - .9, 2.15, 0]],
  [K.tiempo, K.p1, [X0 + .3, 2.7, 6.6], [X0 - .1, 2.4, 5.6], [X0, 1.75, 0], [X0, 1.75, 0]],
  [K.p1, K.p2, [.2, 1.6, 2.8], [.4, 1.35, 2.0], [.4, 0.78, -.6], [.6, 0.73, -.7]],
  [K.p2, K.gris, [1.9, 1.3, 2.0], [1.4, 1.1, 1.3], [.6, 0.68, -.7], [.6, 0.64, -.7]],
  [K.gris, K.p3, [X0 + .2, 2.3, 4.4], [X0 - .5, 2.1, 3.4], [X0 - .6, 2.15, 0], [X0 - 1.0, 2.15, 0]],
  [K.p3, K.p4, [X0 + 1.8, 2.8, 6.8], [X0 + 1.2, 2.5, 6.0], [X0 + .6, 1.75, 0], [X0 + .4, 1.75, 0]],
  [K.p4, K.p5, [X0 - .2, 2.4, 4.8], [X0 - .6, 2.2, 3.9], [X0 - .6, 2.15, 0], [X0 - .3, 2.15, 0]],
  [K.p5, K.p6, [-.4, 1.7, 3.0], [-.1, 1.5, 2.4], [.4, 0.98, -.6], [.5, 0.93, -.6]],
  [K.p6, K.conecta, [X0 + 3.6, 2.7, 5.4], [X0 + 3.0, 2.4, 4.6], [X0 + 2.0, 1.75, 0], [X0 + 2.2, 1.75, 0]],
  [K.conecta, K.sigue, [X0 + 1.2, 2.8, 7.2], [X0 + .4, 2.5, 6.0], [X0 + .1, 1.85, 0], [X0 - .2, 1.85, 0]],
  [K.sigue, K.cuanta, [1.8, 1.6, 4.6], [1.2, 1.4, 3.6], [.2, 0.88, -.5], [.2, 0.88, -.5]],
  [K.cuanta, 200, [2.8, 2.6, 7.4], [2.2, 2.2, 6.2], [0, 0.88, -.4], [0, 0.98, -.4]],
];
function animWorld(t) {
  skyDay(t);
  const inMac = (inn(t, K.explico, K.p1) || inn(t, K.gris, K.p5) || inn(t, K.p6, K.sigue));
  macL.intensity = inMac ? 3.6 : 0;
  // ---- estado del celular ----
  const clean = t >= K.raspa + 2.5, fixed = t >= CLIC - .2;
  let pct = .12 + .02 * Math.sin(t * .3); let chg = !inn(t, K.aveces, K.aveces + 1.2) && !inn(t, K.aveces + 2, K.aveces + 2.5);
  if (t >= K.desconecta && t < K.p1) chg = Math.sin(t * 6) > 0;
  const off = inn(t, K.apaga + .4, K.conecta - .2);
  if (fixed) { pct = clamp(.12 + (t - CLIC) * .09, 0, 1); chg = true; }
  drawPhone(pct, chg, off, inn(t, K.lento, K.bateria));
  // celular: voltear y golpecitos
  let flip = 0, tap = 0; if (inn(t, K.voltea, K.p6)) { flip = eio(P(t, K.voltea, .8)) * (1 - eio(P(t, K.p6 - .7, .6))); tap = inn(t, K.golpe, K.golpe + 1.6) ? Math.abs(Math.sin((t - K.golpe) * 12)) * .06 : 0; }
  phone.rotation.set(-.12 + flip * Math.PI, 0, 0); phone.position.y = .84 + flip * .75 + tap;
  // cable del celular al enchufe (desconectado mientras se limpia)
  const plugged = !inn(t, K.p1, CLIC - .4);
  const pb = V(.6, .84 + flip * .75, -.72); const pIn = plugged ? pb : V(1.05, .84, -.45);
  plugS.position.copy(pIn).add(V(0, plugged ? -.04 : .02, 0)); plugS.rotation.set(plugged ? 0 : Math.PI / 2, 0, plugged ? 0 : .5);
  if (!cableMesh || (t * 30 | 0) % 3 === 0 || true) setCable(pIn.clone().add(V(0, -.08, 0)), V(.6 + .15, .5, -1.79), .35);
  newBat.visible = inn(t, K.bateria, K.mira); newBat.position.y = .84 + (1 - eback(P(t, K.bateria, .4))) * .3; newBat.rotation.y = inn(t, K.noes, K.mira) ? Math.sin(t * 20) * .05 : 0;
  for (let i = 0; i < 14; i++) { const u = ((t - K.golpe) * 1.3 + i / 14) % 1; setP(crumbs, i, .6 + Math.sin(i * 3) * .05, lerp(1.55, .86, u), -.7 + Math.cos(i * 5) * .04, inn(t, K.golpe, K.golpe + 2.2)); } crumbs.instanceMatrix.needsUpdate = true;
  // linterna en la mesa
  torch.visible = inn(t, K.alumbra, K.gris) || inn(t, K.golpe + 1.4, K.p6);
  torch.position.set(1.25, .9, -.6); torch.rotation.set(0, .55, 0); beam.position.set(-.55, 0, 0);
  if (flip > .5) { torch.position.set(1.15, 1.3, -.55); torch.rotation.set(0, .5, -.35); }
  // ---- diorama ----
  const th = t < K.conectas ? 0 : t < K.raspa ? clamp(.12 + .33 * eout(P(t, K.conectas, 4.5))) : clamp(.45 * (1 - eout(P(t, K.raspa + .5, 2.5))));
  carpet.scale.x = Math.max(.01, th); carpet.position.set(-1.6 + th / 2, 0, 0); carpet.visible = th > .01;
  carpet.material.emissiveIntensity = inn(t, K.gris, K.p3) ? .25 + .2 * Math.sin(t * 8) : 0;
  // conector: entra, se empuja, se atasca
  let tip = 3.4; // fuera
  if (inn(t, K.metes, K.bolsillo)) tip = lerp(3.4, -1.55, eio(P(t, K.metes + .3, 2.0)));
  else if (inn(t, K.bolsillo, K.conectas)) tip = lerp(-1.55, 3.4, eio(P(t, K.bolsillo, 1.0)));
  else if (inn(t, K.conectas, K.p1)) { const cyc = ((t - K.conectas) % 2.6) / 2.6; const stop = -1.55 + th; tip = t < K.noentra ? lerp(3.0, stop, eio(clamp(cyc * 2))) * (cyc < .5 ? 1 : 1) : lerp(3.4, -1.55 + .45, eio(P(t, K.noentra, 1.2))); if (t < K.noentra && cyc > .6) tip = lerp(stop, 3.0, eio((cyc - .6) / .4)); }
  else if (inn(t, K.p6, K.conecta)) tip = 2.4;
  else if (inn(t, K.conecta, K.sigue)) tip = lerp(3.4, -1.55, eio(P(t, K.conecta + .3, CLIC - K.conecta - .3)));
  PLUG.position.x = tip; PLUG.visible = inn(t, K.explico, K.p1) || inn(t, K.p6, K.sigue);
  const contact = tip < -1.48 + 1e-3 + 0 || (tip < -1.3 && th < .1); const glowK = (contact && (t < K.bolsillo || t >= CLIC - .1)) ? 1 : 0;
  const bad = inn(t, K.notocan, K.p1); goldM.emissiveIntensity = glowK * (1.2 + .4 * Math.sin(t * 10)); plugGold.emissiveIntensity = glowK * (1.2 + .4 * Math.sin(t * 10));
  goldM.emissive.set(bad ? 0xff4d61 : 0x35d39a); plugGold.emissive.set(bad ? 0xff4d61 : 0x35d39a); if (bad) { goldM.emissiveIntensity = plugGold.emissiveIntensity = Math.max(0, Math.sin(t * 14)) * 1.2; }
  // flujo de energía
  for (let i = 0; i < 16; i++) { const u = (t * .7 + i / 16) % 1; const wp = V(lerp(6.5, tip + .5, u), 0, 0); wp.multiplyScalar(.72).add(MC); setP(flow, i, wp.x, wp.y, wp.z + .2, glowK > 0 && PLUG.visible && !bad, 1); } flow.instanceMatrix.needsUpdate = true;
  // pelusa suelta que entra
  for (let i = 0; i < 50; i++) { const L = LP[i]; let u = clamp((t - K.bolsillo - L.d) / 2.4); let x = lerp(L.sx, L.ex, eout(u)), y = lerp(L.sy, L.ey, eout(u)) + Math.sin(t * 2 + i) * .05 * (1 - u), z = lerp(L.sz, L.ez, eout(u));
    let vis = inn(t, K.bolsillo, K.conectas + 1.5); if (t >= K.conectas) { x = lerp(x, -1.55, P(t, K.conectas, 1.2)); vis = vis && P(t, K.conectas, 1.2) < 1; }
    tmp.position.set(x, y, z); tmp.rotation.set(i, i * .7, 0); tmp.scale.setScalar(vis ? L.s : .001); tmp.updateMatrix(); lint.setMatrixAt(i, tmp.matrix); } lint.instanceMatrix.needsUpdate = true;
  // palillo y aguja
  pick.visible = inn(t, K.palillo, K.aguja) || inn(t, K.raspa - .3, K.p5); needle.visible = inn(t, K.aguja, K.p4);
  let px = 3.6; if (inn(t, K.palillo, K.aguja)) px = lerp(5.5, 3.2, eout(P(t, K.palillo, .6)));
  if (inn(t, K.raspa - .3, K.saca)) px = lerp(3.2, -1.5, eio(P(t, K.raspa - .3, 1.4))) + Math.sin((t - K.raspa) * 9) * .12 * P(t, K.raspa + 1, .3);
  if (inn(t, K.saca, K.p5)) px = lerp(-1.5, 3.6, eio(P(t, K.saca, 1.6)));
  pick.position.set(px, -.12, .1); pick.rotation.z = inn(t, K.raspa, K.saca) ? Math.sin(t * 9) * .04 : 0;
  pickLint.visible = t >= K.saca; pickLint.position.set(-.05, 0, 0);
  needle.position.set(lerp(5.5, -.9, eout(P(t, K.aguja, .8))), .2, .1);
  spark.visible = inn(t, K.rayar + .6, K.rayar + 1.4) && Math.sin(t * 40) > 0; spark.position.set(-.9, .22, .1); spark.scale.setScalar(.6 + Math.random() * .8);
  cloth.visible = inn(t, K.limpia, K.conecta); cloth.position.set(3.0 + Math.sin((t - K.limpia) * 7) * .5, 0, .2 + Math.cos((t - K.limpia) * 7) * .2);
  bigBeam.visible = inn(t, K.gris, K.p3) || inn(t, K.golpe + 1.4, K.p6) && false; bigBeam.position.set(1.2, .05, 0); tunL.intensity = inn(t, K.gris, K.p3) ? 4 : 0;
  // batería flotante
  BAT.visible = inn(t, K.lento, K.espera) || inn(t, K.tiempo, K.p1) || inn(t, CLIC - .3, K.sigue);
  if (t < K.espera) { BAT.position.set(1.35, 1.25, -.75); setBat(.12 + .03 * Math.sin(t)); } else if (t < K.p1) { BAT.position.set(X0 + 1.2, 1.1, 1.2); setBat(.08 + .05 * Math.abs(Math.sin(t * 3))); } else { BAT.position.set(X0 + 1.2, 1.1, 1.2); setBat(clamp(.1 + (t - CLIC) * .3)); }
  BAT.scale.setScalar(t < K.espera ? .4 : .7);
  // ---- personajes ----
  let op = [-.35, 0, -.1], ory = .4, p = { emo: 'worried' }, ev = false, ep = [0, 0, 0], ery = 0, e = { emo: 'neutral' };
  const point = (a = -2.3) => ({ armR: [a, -.3, -.2], armL: [-.2, .15, -.3] });
  if (t < K.espera) { p = { emo: t > K.bateria ? 'sad' : 'worried', armR: [-1.0, -.3, -.8], headRy: .4, look: [.6, -.3] }; }
  else if (t < K.mira) { p = { emo: 'surprised', headRy: .9, look: [.8, 0] }; ev = true; ep = [1.75, 0, -.25]; ery = -.8; e = { emo: t > K.noes ? 'happy' : 'determined', armR: [-2.6, -.4, -.2], armL: [-.4, .2, -.3] }; }
  else if (t < K.explico) { op = [-.6, 0, .4]; ev = false; }
  else if (t < K.p1) { op = [X0 - 1.55, 0, .9]; ory = .45; p = { emo: t > K.notocan ? 'surprised' : t > K.bolsillo ? 'worried' : 'neutral', ...point(-1.7), headRy: .3 }; }
  else if (t < K.gris) { op = [-.25, 0, -.15]; ory = .5; p = { emo: 'determined', armR: [-1.3, -.2, -.6], armL: [-.2, .15, -.3], headRy: .3, look: [.6, -.4] }; }
  else if (t < K.p5) { op = [X0 - 1.55, 0, .9]; ory = .45; p = { emo: inn(t, K.aguja, K.p4) ? 'worried' : t > K.saca ? 'happy' : 'determined', ...point(-1.5), headRy: .3 }; ev = inn(t, K.aguja, K.p4); ep = [X0 + 1.3, 0, 1.6]; ery = -.5; e = { emo: 'determined', armR: [-2.0, -.4, -.3], headRx: -.1 }; }
  else if (t < K.p6) { op = [-.1, 0, -.1]; ory = .55; p = { emo: 'determined', armR: [-1.5, -.2, -.5], armL: [-1.4, .2, -.5], look: [.5, 0] }; }
  else if (t < K.sigue) { op = [X0 - 1.55, 0, .9]; ory = .45; p = { emo: t > CLIC ? 'happy' : 'neutral', ...(t > CLIC ? { armR: [-2.6, -.35, -.2 + .3 * Math.sin(t * 8)], armL: [-2.6, .35, -.2] } : point(-1.6)) }; }
  else if (t < K.cuanta) { op = [-.35, 0, -.1]; ory = .4; p = { emo: 'neutral', armR: [-1.1, -.3, -.7], look: [.5, -.2] }; ev = t > K.tampoco; ep = [1.9, 0, .1]; ery = -.7; e = { emo: 'determined', armL: [-1.0, .3, -.6], armR: [-2.0, -.3, -.2] }; }
  else { op = [-.5, 0, .2]; ory = .3; p = { emo: 'happy', armR: [-2.6, -.35, -.2 + .3 * Math.sin(t * 8)], armL: [-.2, .15, -.3] }; ev = true; ep = [1.6, 0, .3]; ery = -.4; e = { emo: 'happy', armL: [-.9, .3, -.6] }; }
  owner.root.position.set(...op); owner.root.rotation.y = ory; pose(owner, p, t);
  eng.root.visible = ev; eng.root.position.set(...ep); eng.root.rotation.y = ery; pose(eng, e, t + 1.3); wrench.visible = false; engCB.visible = true;
  // etiquetas
  OVL.length = 0; const Lb = (text, at, end, pos, color = '#ffcc33') => { if (t >= at && t < end) OVL.push({ text, at, end, pos, color }); };
  const TOPH = V(.6, 2.3, -.7), TOPM = V(X0, 4.3, 0);
  Lb('CARGA LENTO', .1, K.bateria, TOPH, '#ff6a4a'); Lb('¿OTRA BATERÍA?', K.bateria, K.espera, TOPH); Lb('¡ESPERA!', K.espera, K.noes, TOPH, '#ff6a4a'); Lb('✖ NO ES LA BATERÍA', K.noes, K.mira, TOPH, '#ff6a4a'); Lb('MIRA DENTRO DEL PUERTO', K.mira, K.explico, V(.6, 1.3, -.7));
  Lb('EL PUERTO POR DENTRO', K.explico, K.metes, TOPM); Lb('CONTACTOS', K.metes, K.bolsillo, TOPM, '#7be36b'); Lb('BOLSILLO = PELUSA', K.bolsillo, K.conectas, TOPM, '#ff8a4a'); Lb('SE EMPUJA AL FONDO', K.conectas, K.empuja, TOPM, '#ff8a4a'); Lb('UNA ALFOMBRITA', K.empuja + .8, K.tiempo, V(X0 - 1.3, 3.7, 0), '#ff6a4a');
  Lb('NO ENTRA COMPLETO', K.noentra, K.notocan, TOPM, '#ff6a4a'); Lb('✖ NO SE TOCAN', K.notocan, K.desconecta, TOPM, '#ff6a4a'); Lb('CARGA LENTO', K.desconecta, K.p1, TOPM, '#ff6a4a');
  Lb('PASO 1: APÁGALO', K.p1, K.p2, TOPH); Lb('PASO 2: LINTERNA', K.p2, K.gris, TOPH); Lb('¿GRIS O NEGRO?', K.gris, K.problema, V(X0 - 1.3, 3.7, 0), '#ff8a4a'); Lb('¡AHÍ ESTÁ!', K.problema, K.p3, V(X0 - 1.3, 3.7, 0), '#ff6a4a');
  Lb('PASO 3: PALILLO DE MADERA', K.p3, K.aguja, TOPM, '#7be36b'); Lb('✖ AGUJA O CLIP', K.aguja, K.rayar, TOPM, '#ff6a4a'); Lb('RAYA O HACE CORTO', K.rayar, K.p4, TOPM, '#ff6a4a');
  Lb('PASO 4: RASPA SUAVE', K.p4, K.saca, TOPM); Lb('SACA LA PELUSA', K.saca, K.fuerza, TOPM, '#7be36b'); Lb('SIN FUERZA', K.fuerza, K.p5, TOPM, '#ff8a4a');
  Lb('PASO 5: VOLTÉALO', K.p5, K.golpe, TOPH); Lb('GOLPECITOS SUAVES', K.golpe, K.p6, TOPH);
  Lb('PASO 6: LIMPIA EL CABLE', K.p6, K.conecta, V(X0 + 2.0, 4.0, 0)); Lb('AHORA CONECTA', K.conecta, CLIC - .1, TOPM); Lb('¡CLIC!', CLIC - .1, K.listo + .2, TOPM, '#7be36b'); Lb('¡LISTO!', K.listo + .2, K.sigue, TOPM, '#7be36b');
  Lb('OTRO CABLE Y CARGADOR', K.sigue, K.tampoco, TOPH); Lb('LLÉVALO A UN TÉCNICO', K.tampoco, K.cuanta, TOPH);
  Lb('¿CUÁNTA PELUSA TENÍA?', K.cuanta + .1, CTA_ST, V(0, 3.0, -.5), '#ff8a4a');
}
function overlay2d(t) {}
const KEYW = new Set(['celular', 'lento', 'batería', 'puerto', 'contactos', 'pelusa', 'bolsillo', 'cartera', 'fondo', 'alfombrita', 'completo', 'apaga', 'linterna', 'gris', 'negro', 'problema', 'palillo', 'madera', 'aguja', 'clip', 'metal', 'corto', 'raspa', 'suavecito', 'fuerza', 'voltea', 'golpecitos', 'cable', 'paño', 'seco', 'conecta', 'clic', 'listo', 'cargador', 'técnico', 'comentarios']);
