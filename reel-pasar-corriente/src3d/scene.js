// ================= CÓMO PASAR CORRIENTE SIN DAÑAR EL CARRO =================
const K = { hook: PS(0), chispa: PS(1), explico: PS(2), gas: PS(3), prende: PS(4), orden: PS(5), p1: PS(6), apaga: PS(7), revisa: PS(8), rajada: PS(9), p2: PS(10), signos: PS(11), mas: PS(12), tapa: PS(13), menos: PS(14),
  p3: PS(15), rojo1: PS(16), p4: PS(17), rojo2: PS(18), p5: PS(19), negro1: PS(20), error: PS(21), p6: PS(22), nova: PS(23), metal: PS(24), lejos: PS(25), asi: PS(26), p7: PS(27), bueno: PS(28), tuyo: PS(29),
  p8: PS(30), quita: PS(31), primero: PS(32), regla: PS(33), aprende: PS(34), manual: PS(35), haz: PS(36), tu: PS(37), leo: PS(38) };
(function () { const x = WT.x; x.fillStyle = '#f3e6cf'; x.fillRect(0, 0, 1024, 406); x.fillStyle = '#9fd6f2'; x.fillRect(pxx(-1), py(2.0), 220, 120); x.strokeStyle = '#fff'; x.lineWidth = 10; x.strokeRect(pxx(-1), py(2.0), 220, 120); WT.tx.needsUpdate = true; })();
const CX = 11.3; // centro entre los carros
add(M(new THREE.BoxGeometry(9, .05, 3.4), lp(0x4a4e57))).position.set(CX, .04, -.3);
for (let i = 0; i < 5; i++) add(M(new THREE.BoxGeometry(.8, .055, .1), lp(0xf2f2f2))).position.set(CX - 3.6 + i * 1.8, .045, 1.25);
// ---- carro ----
function makeCar(col, batZ) {
  const c = { g: new THREE.Group(), body: new THREE.Group() }; c.g.add(c.body);
  const paint = lp(col), dark = lp(0x1f232c), glass = new THREE.MeshStandardMaterial({ color: 0x9fd0ef, roughness: .1, metalness: .2 });
  const ch = rbox(3.0, .55, 1.5, .12, paint); ch.position.set(0, .58, 0); c.body.add(ch);
  const cab = rbox(1.5, .55, 1.32, .14, paint); cab.position.set(-.45, 1.08, 0); c.body.add(cab);
  const gl = M(new THREE.BoxGeometry(1.3, .36, 1.36), glass); gl.position.set(-.45, 1.1, 0); c.body.add(gl);
  const ws = M(new THREE.BoxGeometry(.05, .4, 1.2), glass); ws.position.set(.3, 1.08, 0); ws.rotation.z = -.5; c.body.add(ws);
  const bay = M(new THREE.BoxGeometry(1.2, .06, 1.36), dark); bay.position.set(.85, .84, 0); c.body.add(bay);
  const eng = M(new THREE.BoxGeometry(.6, .3, .7), lp(0x7c828e)); eng.position.set(.8, 1.0, -.2); c.body.add(eng);
  const bolt = M(new THREE.CylinderGeometry(.05, .05, .07, 6), mat(0xe8ecf2, { metalness: .8, roughness: .2, emissive: 0x35d39a, emissiveIntensity: 0 })); bolt.position.set(.65, 1.18, -.35); c.body.add(bolt); c.bolt = bolt;
  for (const [x, z] of [[.95, .72], [.95, -.72], [-.95, .72], [-.95, -.72]]) { const w = M(new THREE.CylinderGeometry(.32, .32, .22, 16), lp(0x202228)); w.rotation.x = Math.PI / 2; w.position.set(x, .32, z); c.g.add(w); const r = M(new THREE.CylinderGeometry(.16, .16, .23, 10), lp(0xb9c0d0)); r.rotation.x = Math.PI / 2; r.position.set(x, .32, z); c.g.add(r); }
  c.lights = []; for (const z of [.5, -.5]) { const l = M(new THREE.BoxGeometry(.06, .14, .3), new THREE.MeshStandardMaterial({ color: 0xfff6d0, emissive: 0xfff2b0, emissiveIntensity: .1 })); l.position.set(1.5, .68, z); c.body.add(l); c.lights.push(l); }
  const gr = M(new THREE.BoxGeometry(.05, .16, .7), dark); gr.position.set(1.5, .55, 0); c.body.add(gr);
  // capó abierto
  const hp = new THREE.Group(); hp.position.set(.3, .9, 0); c.body.add(hp); const hood = M(new THREE.BoxGeometry(1.25, .05, 1.48), paint); hood.position.x = .62; hp.add(hood); hp.rotation.z = 1.15; c.hood = hp;
  // batería
  const b = new THREE.Group(); b.position.set(1.1, .98, batZ); c.body.add(b); c.bat = b;
  c.batBody = rbox(.38, .26, .3, .03, lp(0x23262e)); b.add(c.batBody); const top = M(new THREE.BoxGeometry(.38, .03, .3), lp(0x3a3f4c)); top.position.y = .14; b.add(top);
  c.pos = M(new THREE.CylinderGeometry(.04, .04, .07, 12), new THREE.MeshStandardMaterial({ color: 0xe23a3a, emissive: 0xff4d61, emissiveIntensity: 0 })); c.pos.position.set(.11, .18, 0); b.add(c.pos);
  c.neg = M(new THREE.CylinderGeometry(.04, .04, .07, 12), new THREE.MeshStandardMaterial({ color: 0x111111, emissive: 0x6cc4ff, emissiveIntensity: 0 })); c.neg.position.set(-.11, .18, 0); b.add(c.neg);
  c.crack = M(new THREE.BoxGeometry(.02, .2, .005), new THREE.MeshBasicMaterial({ color: 0xff4d61 }), false); c.crack.position.set(.05, 0, (batZ > 0 ? 1 : -1) * .152); c.crack.rotation.z = .5; b.add(c.crack);
  c.wp = (o) => { c.g.updateMatrixWorld(true); return o.getWorldPosition(new THREE.Vector3()); };
  return c;
}
const carA = makeCar(0x3fb7a8, .42); carA.g.position.set(CX - 2.2, 0, -.2); scene.add(carA.g);            // carro descargado (el tuyo)
const carB = makeCar(0x5a7dff, -.42); carB.g.position.set(CX + 2.2, 0, -.2); carB.g.rotation.y = Math.PI; scene.add(carB.g); // carro bueno
// ---- cables con pinzas ----
function clamp3(col) { const g = new THREE.Group(); const a = rbox(.1, .06, .16, .02, lp(col)); a.position.y = .05; const b = rbox(.1, .06, .16, .02, lp(col)); b.position.y = -.02; b.rotation.x = .25; const j = M(new THREE.BoxGeometry(.06, .05, .05), mat(0xc9ced8, { metalness: .7 })); j.position.set(0, .01, -.09); g.add(a, b, j); add(g); return g; }
const CAB = { r: { col: 0xd8323a, a: clamp3(0xd8323a), b: clamp3(0xd8323a), mesh: null }, k: { col: 0x1d1f25, a: clamp3(0x1d1f25), b: clamp3(0x1d1f25), mesh: null } };
function tube(c, pa, pb) { if (c.mesh) { scene.remove(c.mesh); c.mesh.geometry.dispose(); } const m = pa.clone().lerp(pb, .5); m.y = Math.min(pa.y, pb.y) - .55; m.y = Math.max(.1, m.y); const cv = new THREE.CatmullRomCurve3([pa, pa.clone().add(V(0, -.25, .15)), m, pb.clone().add(V(0, -.25, .15)), pb]); c.mat = c.mat || lp(c.col); c.mesh = add(M(new THREE.TubeGeometry(cv, 40, .025, 6), c.mat, false)); }
const PILE = { ra: V(CX - .25, .12, .95), rb: V(CX - .1, .12, 1.0), ka: V(CX + .1, .12, 1.0), kb: V(CX + .25, .12, .95) };
// gas, chispas, humo
const gasM = new THREE.MeshBasicMaterial({ color: 0x7cff9a, transparent: true, opacity: .22, depthWrite: false });
const gas = new THREE.InstancedMesh(new THREE.IcosahedronGeometry(.09, 1), gasM, 18); gas.frustumCulled = false; scene.add(gas);
const sparkM = new THREE.MeshBasicMaterial({ color: 0xfff3a0, transparent: true, blending: THREE.AdditiveBlending, depthWrite: false });
const spark = add(new THREE.Mesh(new THREE.IcosahedronGeometry(.07, 0), sparkM));
const boomM = new THREE.MeshBasicMaterial({ color: 0xff8a3d, transparent: true, opacity: .8, blending: THREE.AdditiveBlending, depthWrite: false });
const boomS = add(new THREE.Mesh(new THREE.IcosahedronGeometry(.3, 1), boomM));
const smoke = parts(16, new THREE.MeshStandardMaterial({ color: 0xb8bcc6, transparent: true, opacity: .6, roughness: 1 }), .09);
const leak = parts(8, 0xc8e05a, .025);
const sparkL = new THREE.PointLight(0xffe08a, 0, 3, 1.5); scene.add(sparkL);
// ---- cámara ----
const BA = () => carA.wp(carA.bat), BB = () => carB.wp(carB.bat);
SHOTS = [
  [0, K.explico, [CX + .8, 4.3, 8.2], [CX - .2, 3.8, 6.6], [CX - .2, 1.2, -.2], [CX - .6, 1.25, -.2]],
  [K.explico, K.p1, [CX - .4, 1.9, 2.8], [CX - .7, 1.8, 2.2], [CX - 1.1, .62, .2], [CX - 1.1, .65, .2]],
  [K.p1, K.revisa, [CX + 1.5, 4.8, 9.6], [CX + .5, 4.4, 8.8], [CX, 1.05, -.3], [CX, 1.05, -.3]],
  [K.revisa, K.p2, [CX - .5, 1.75, 2.3], [CX - .8, 1.7, 1.9], [CX - 1.1, .65, .2], [CX - 1.1, .65, .2]],
  [K.p2, K.p3, [CX - .9, 1.6, 1.9], [CX - 1.05, 1.55, 1.6], [CX - 1.1, .75, .2], [CX - 1.1, .75, .2]],
  [K.p3, K.p4, [CX - .2, 2.3, 3.4], [CX - .5, 2.1, 2.8], [CX - 1.1, .55, .1], [CX - 1.1, .6, .1]],
  [K.p4, K.p5, [CX + .3, 2.3, 3.4], [CX + .6, 2.1, 2.8], [CX + 1.1, .55, .1], [CX + 1.1, .6, .1]],
  [K.p5, K.error, [CX + .6, 2.3, 3.2], [CX + .9, 2.1, 2.7], [CX + 1.1, .55, .1], [CX + 1.1, .6, .1]],
  [K.error, K.p6, [CX, 4.0, 6.8], [CX, 3.7, 6.0], [CX, 1.0, -.2], [CX, 1.05, -.2]],
  [K.p6, K.asi, [CX - .4, 2.1, 2.8], [CX - .7, 2.0, 2.3], [CX - 1.3, .62, -.1], [CX - 1.35, .65, -.2]],
  [K.asi, K.p7, [CX - .2, 2.2, 3.2], [CX - .4, 2.1, 2.7], [CX - 1.3, .6, -.1], [CX - 1.3, .6, -.1]],
  [K.p7, K.p8, [CX + 1.5, 4.6, 9.4], [CX + .4, 4.3, 8.6], [CX, 0.95, -.3], [CX, 1.0, -.3]],
  [K.p8, K.regla, [CX, 4.0, 7.0], [CX, 3.8, 6.2], [CX, 1.0, -.2], [CX, 1.0, -.2]],
  [K.regla, K.manual, [CX, 4.7, 9.2], [CX, 4.5, 8.8], [CX, 1.15, -.3], [CX, 1.15, -.3]],
  [K.manual, K.tu, [CX + 2.2, 2.4, 4.6], [CX + 1.8, 2.2, 4.0], [CX + 1.0, .9, -1.2], [CX + 1.0, .95, -1.2]],
  [K.tu, 200, [CX + .5, 4.8, 10.2], [CX + .3, 4.4, 9.2], [CX - .5, 1.25, -.5], [CX - .5, 1.35, -.5]],
];
function animWorld(t) {
  skyDay(t);
  const aP = carA.wp(carA.pos), aN = carA.wp(carA.neg), bP = carB.wp(carB.pos), bN = carB.wp(carB.neg), bolt = carA.wp(carA.bolt);
  const up = v => v.clone().add(V(0, .07, 0));
  const mv = (from, to, at, d = .9) => from.clone().lerp(to, eio(P(t, at, d)));
  // posiciones de las pinzas según el paso
  let ra = PILE.ra, rb = PILE.rb, ka = PILE.ka, kb = PILE.kb; let showCab = false;
  if (t < K.explico) { showCab = true; ra = up(aP); rb = up(bP); ka = up(bN); kb = mv(PILE.kb, up(aN), K.hook + 1.2, 1.4); }
  else if (t >= K.p3 && t < K.quita) {
    showCab = true; ra = mv(PILE.ra, up(aP), K.rojo1 + .6); rb = mv(PILE.rb, up(bP), K.rojo2 + .6); ka = mv(PILE.ka, up(bN), K.negro1 + .6);
    const hover = up(aN).add(V(0, .25, 0)); kb = t < K.nova ? PILE.kb : t < K.metal ? mv(PILE.kb, hover, K.nova + .3) : mv(hover, up(bolt), K.metal + 1.0, 1.2);
  } else if (t >= K.quita && t < K.regla) {
    showCab = true; const q = K.primero; ra = up(aP); rb = up(bP); ka = up(bN); kb = up(bolt);
    kb = mv(kb, PILE.kb, q - .2, .6); ka = mv(ka, PILE.ka, q + .5, .6); rb = mv(rb, PILE.rb, q + 1.2, .6); ra = mv(ra, PILE.ra, q + 1.9, .6);
  }
  for (const o of [CAB.r.a, CAB.r.b, CAB.k.a, CAB.k.b]) o.visible = showCab;
  CAB.r.a.position.copy(ra); CAB.r.b.position.copy(rb); CAB.k.a.position.copy(ka); CAB.k.b.position.copy(kb);
  if (showCab) { tube(CAB.r, ra, rb); tube(CAB.k, ka, kb); } else { for (const c of [CAB.r, CAB.k]) if (c.mesh) c.mesh.visible = false; }
  if (showCab) { CAB.r.mesh.visible = CAB.k.mesh.visible = true; }
  // gas de hidrógeno
  const gasOn = inn(t, K.hook + 1.5, K.p1) || inn(t, K.p6, K.p7);
  for (let i = 0; i < 18; i++) { const u = (t * .25 + i / 18) % 1; const p = carA.wp(carA.bat); setP(gas, i, p.x + Math.sin(i * 2.3 + t) * .18, p.y + .15 + u * .9, p.z + Math.cos(i * 1.7) * .15, gasOn, (1 - u) * 1.4 + .3); } gas.instanceMatrix.needsUpdate = true;
  // chispa
  let sp = null; if (inn(t, K.chispa + .5, K.explico)) sp = up(aN); if (inn(t, K.prende, K.orden)) sp = up(aN); if (inn(t, K.metal + 1.9, K.p7)) sp = up(bolt);
  spark.visible = !!sp && Math.sin(t * 45) > -.2; if (sp) { spark.position.copy(sp); spark.scale.setScalar(.6 + Math.random() * 1.4); sparkL.position.copy(sp); } sparkL.intensity = spark.visible ? 3 : 0;
  // explosión (solo en la explicación del peligro)
  const bk = P(t, K.prende + .9, .6); boomS.visible = inn(t, K.prende + .9, K.orden); boomS.position.copy(carA.wp(carA.bat)).add(V(0, .3, 0)); boomS.scale.setScalar(.3 + bk * 2.2); boomM.opacity = .8 * (1 - bk);
  // revisar batería: rajada, hinchada, botando líquido
  const bad = inn(t, K.rajada, K.p2); const sw = bad ? 1 + .18 * eout(P(t, K.rajada + .8, .6)) : 1; carA.batBody.scale.set(sw, 1, sw); carA.crack.visible = bad && t > K.rajada; carA.crack.scale.y = eout(P(t, K.rajada, .4));
  for (let i = 0; i < 8; i++) { const u = (t * .8 + i / 8) % 1; const p = carA.wp(carA.bat); setP(leak, i, p.x + .12, p.y - .1 - u * .5, p.z + .16, bad && t > K.rajada + 1.4); } leak.instanceMatrix.needsUpdate = true;
  // signos
  const gl = (on) => on ? 1.2 + .8 * Math.sin(t * 9) : 0;
  carA.pos.material.emissiveIntensity = gl(inn(t, K.mas, K.menos) || inn(t, K.rojo1, K.p4)); carB.pos.material.emissiveIntensity = gl(inn(t, K.rojo2, K.p5));
  carA.neg.material.emissiveIntensity = gl(inn(t, K.menos, K.p3) || inn(t, K.nova, K.metal)); carA.neg.material.emissive.set(inn(t, K.nova, K.metal) ? 0xff4d61 : 0x6cc4ff); carB.neg.material.emissiveIntensity = gl(inn(t, K.negro1, K.error));
  carA.bolt.material.emissiveIntensity = gl(inn(t, K.metal, K.asi));
  // arranque y luces
  const aOn = t >= K.tuyo + .4 && t < K.p8 + 4, bOn = t >= K.bueno + .4 && t < K.p8 + 4;
  carB.body.position.y = bOn ? Math.sin(t * 60) * .008 : 0; carA.body.position.y = aOn ? Math.sin(t * 57) * .008 : 0;
  carA.lights.forEach(l => l.material.emissiveIntensity = aOn ? 2.5 : (inn(t, K.chispa, K.explico) ? (Math.sin(t * 30) > 0 ? 1.5 : 0) : .05));
  carB.lights.forEach(l => l.material.emissiveIntensity = bOn ? 2.5 : .05);
  for (let i = 0; i < 16; i++) { const u = (t * .8 + i / 16) % 1; const fromB = i % 2 === 0; const c = fromB ? carB : carA, on = fromB ? bOn : aOn; const ex = c.g.localToWorld(V(-1.55 - u * .8, .3 + u * .5, .45)); setP(smoke, i, ex.x, ex.y, ex.z, on, .6 + u * 1.5); } smoke.instanceMatrix.needsUpdate = true;
  // ---- personajes ----
  let op = [CX - 2.0, 0, -1.55], ory = .2, p = { emo: 'neutral' }, ev = true, ep = [CX + 2.0, 0, -1.55], ery = -.2, e = { emo: 'neutral' };
  const point = (a = -2.3) => ({ armR: [a, -.3, -.2], armL: [-.2, .15, -.3] }), reach = { armR: [-1.6, -.2, -.6], armL: [-1.4, .2, -.6], spineRx: .35 };
  if (t < K.explico) { p = { emo: t > K.chispa ? 'surprised' : 'worried', ...(t > K.chispa ? { armR: [-2.4, -.5, -.4], armL: [-2.4, .5, -.4] } : reach) }; e = { emo: t > K.chispa ? 'surprised' : 'neutral' }; }
  else if (t < K.p1) { ev = true; e = { emo: 'determined', ...point(-1.9), headRy: .3 }; p = { emo: 'worried', look: [.5, -.4] }; }
  else if (t < K.p3) { p = { emo: inn(t, K.rajada, K.p2) ? 'surprised' : 'determined', look: [.4, -.5], headRx: .2 }; e = { emo: 'determined', armL: [-1.0, .3, -.6], armR: [-2.0, -.3, -.2] }; }
  else if (t < K.error) { p = { emo: 'determined', ...(inn(t, K.rojo1, K.p4) ? reach : {}), look: [.3, -.5] }; e = { emo: 'determined', ...(inn(t, K.rojo2, K.error) ? reach : {}), look: [-.3, -.5] }; }
  else if (t < K.asi) { p = { emo: t < K.metal ? 'surprised' : 'determined', ...(t > K.metal ? reach : { armR: [-2.4, -.5, -.4], armL: [-2.4, .5, -.4] }) }; e = { emo: t < K.metal ? 'worried' : 'happy', ...point(-1.8), headRy: .4 }; }
  else if (t < K.p8) { p = { emo: t > K.tuyo + .4 ? 'happy' : 'neutral', ...(t > K.tuyo + .4 ? { armR: [-2.6, -.35, -.2 + .3 * Math.sin(t * 8)] } : {}) }; e = { emo: 'happy', armL: [-1.0, .3, -.6] }; }
  else if (t < K.manual) { p = { emo: 'determined', ...reach }; e = { emo: 'happy', ...point(-2.4) }; }
  else if (t < K.tu) { ep = [CX + .9, 0, -1.3]; ery = .2; e = { emo: 'determined', armL: [-1.4, .3, -.6], armR: [-1.4, -.3, -.6] }; p = { emo: 'neutral', look: [.6, 0] }; }
  else { p = { emo: 'happy', armR: [-2.6, -.35, -.2 + .3 * Math.sin(t * 8)], armL: [-.2, .15, -.3] }; e = { emo: 'happy', armL: [-.9, .3, -.6] }; }
  owner.root.position.set(...op); owner.root.rotation.y = ory; pose(owner, p, t);
  eng.root.visible = ev; eng.root.position.set(...ep); eng.root.rotation.y = ery; pose(eng, e, t + 1.3); wrench.visible = false; engCB.visible = true;
  // etiquetas
  OVL.length = 0; const Lb = (text, at, end, pos, color = '#ffcc33') => { if (t >= at && t < end) OVL.push({ text, at, end, pos, color }); };
  const TOP = V(CX, 2.6, -.3), TA = V(CX - 1.1, 1.5, .2), TB = V(CX + 1.1, 1.5, .2);
  Lb('¡ESE CABLE NO!', .1, K.chispa, TOP, '#ff6a4a'); Lb('¡CHISPA!', K.chispa, K.explico, TOP, '#ff6a4a');
  Lb('GAS HIDRÓGENO', K.gas, K.prende, TA, '#7be36b'); Lb('+ CHISPA = PELIGRO', K.prende, K.orden, TA, '#ff6a4a'); Lb('EL ORDEN IMPORTA', K.orden, K.p1, TOP);
  Lb('PASO 1: TODO APAGADO', K.p1, K.revisa, TOP); Lb('REVISA LA BATERÍA', K.revisa, K.rajada, TA); Lb('RAJADA · HINCHADA · GOTEA', K.rajada, K.rajada + 2.4, TA, '#ff6a4a'); Lb('✖ NO LE PASES CORRIENTE', K.rajada + 2.4, K.p2, TA, '#ff6a4a');
  Lb('PASO 2: LOS SIGNOS', K.p2, K.mas, TA); Lb('+ POSITIVO', K.mas, K.menos, TA, '#ff6a4a'); Lb('− NEGATIVO', K.menos, K.p3, TA, '#6cc4ff');
  Lb('1. ROJO → + DESCARGADA', K.p3, K.p4, TA, '#ff6a4a'); Lb('2. ROJO → + BUENA', K.p4, K.p5, TB, '#ff6a4a'); Lb('3. NEGRO → − BUENA', K.p5, K.error, TB, '#ffffff');
  Lb('EL ERROR DE TODOS', K.error, K.p6, TOP, '#ff8a4a'); Lb('✖ NO AL − DESCARGADO', K.p6, K.metal, TA, '#ff6a4a'); Lb('4. NEGRO → METAL', K.metal, K.asi, TA, '#7be36b'); Lb('CHISPA LEJOS DEL GAS', K.asi, K.p7, TA, '#7be36b');
  Lb('PASO 7: PRENDE EL BUENO', K.p7, K.tuyo, TOP); Lb('¡ARRANCÓ!', K.tuyo + .5, K.p8, TOP, '#7be36b');
  Lb('PASO 8: AL REVÉS', K.p8, K.regla, TOP); Lb('ROJO · ROJO · NEGRO · METAL', K.regla, K.manual, V(CX, 2.4, -.3), '#ffcc33');
  Lb('EL MANUAL MANDA', K.manual, K.tu, V(CX + 1.0, 2.6, -1.2)); Lb('¿LO HACÍAS ASÍ?', K.tu + .1, CTA_ST, V(CX - .5, 2.8, -.5), '#ff8a4a');
}
function overlay2d(t) {
  // números de orden sobre cada pinza en el resumen
  if (inn(t, K.regla, K.manual)) { const items = [['ROJO', '#e23a3a', '+'], ['ROJO', '#e23a3a', '+'], ['NEGRO', '#2a2c33', '−'], ['METAL', '#9aa3b2', '⚙']];
    items.forEach(([tx, col, s], i) => { const at = K.regla + i * .55, k = eback(P(t, at, .35)); if (k <= 0) return; g.save(); g.translate(150 + i * 260, 1330); g.scale(k, k); g.fillStyle = 'rgba(0,0,0,.35)'; rrp(g, 0, -108, -66, 224, 140, 26); g.fill(); g.fillStyle = col; rrp(g, 0, -112, -72, 224, 140, 26); g.fill(); g.lineWidth = 6; g.strokeStyle = '#fff'; g.stroke();
      g.fillStyle = '#fff'; g.textAlign = 'center'; g.textBaseline = 'middle'; g.font = '900 30px M'; g.fillText((i + 1) + '', -80, -42); g.font = '900 46px M'; g.fillText(tx, 0, 6); g.restore(); }); }
  card(t, K.bueno + .3, K.tuyo, 540, 1440, 'ESPERA', '#3d8bff', x => { x.strokeStyle = '#2a2c33'; x.lineWidth = 10; x.beginPath(); x.arc(0, 30, 80, 0, 6.29); x.stroke(); const a = (t - K.bueno) * 2.5; x.lineWidth = 8; x.beginPath(); x.moveTo(0, 30); x.lineTo(Math.sin(a) * 60, 30 - Math.cos(a) * 60); x.stroke(); x.font = '900 34px M'; x.fillStyle = '#2a2c33'; x.fillText('UNOS MINUTOS', 0, 135); });
  card(t, K.manual, K.tu, 540, 1440, 'MANUAL', '#3d8bff', x => { x.fillStyle = '#2a2c33'; x.font = '900 38px M'; x.fillText('DEL CARRO', 0, -40); x.font = '700 28px M'; x.fillStyle = '#8a92a8'; x.fillText('Busca la sección de la batería', 0, 10); x.fillStyle = '#1aa86a'; x.font = '900 40px M'; x.fillText('✔ HAZ LO QUE DIGA', 0, 80); });
}
const KEYW = new Set(['cables', 'orden', 'equivocado', 'corriente', 'dañarlo', 'chispa', 'batería', 'hidrógeno', 'gas', 'importa', 'apaga', 'freno', 'rajada', 'hinchada', 'líquido', 'signos', 'positivo', 'roja', 'negativo', 'rojo', 'primero', 'muerta', 'buena', 'negro', 'error', 'metal', 'pintura', 'tornillo', 'motor', 'lejos', 'prende', 'minutos', 'tuyo', 'revés', 'último', 'apréndetelo', 'manual', 'comentarios']);
