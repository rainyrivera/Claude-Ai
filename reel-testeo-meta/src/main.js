import * as THREE from 'three';
import { mergeGeometries } from 'three/addons/utils/BufferGeometryUtils.js';
import { EffectComposer } from 'three/addons/postprocessing/EffectComposer.js';
import { RenderPass } from 'three/addons/postprocessing/RenderPass.js';
import { UnrealBloomPass } from 'three/addons/postprocessing/UnrealBloomPass.js';
import { OutputPass } from 'three/addons/postprocessing/OutputPass.js';

const W = 1080, H = 1920;
const TIMING = await (await fetch('timing.json')).json();
const WORDS = TIMING.words;
await Promise.all([400, 800, 900].map(w => document.fonts.load(`${w} 30px N`)));

// ---------- helpers ----------
let seed = 7;
const rnd = () => { seed = (seed * 16807) % 2147483647; return (seed - 1) / 2147483646; };
const clamp = (x, a = 0, b = 1) => Math.min(b, Math.max(a, x));
const prog = (t, a, b) => clamp((t - a) / (b - a));
const eio = x => x < .5 ? 4 * x * x * x : 1 - Math.pow(-2 * x + 2, 3) / 2;
const eout = x => 1 - Math.pow(1 - x, 3);
const eback = x => { const c1 = 1.9, c3 = c1 + 1; return 1 + c3 * Math.pow(x - 1, 3) + c1 * Math.pow(x - 1, 2); };
const lerp = (a, b, x) => a + (b - a) * x;
const norm = s => s.toLowerCase().replace(/[¿?¡!.,:]/g, '');
const T = (w, from = 0) => { for (let i = from; i < WORDS.length; i++) if (norm(WORDS[i].w) === norm(w)) return WORDS[i].s; throw w; };
const V = (x, y, z) => new THREE.Vector3(x, y, z);

// ---------- renderer ----------
const canvas = document.getElementById('gl');
const renderer = new THREE.WebGLRenderer({ canvas, antialias: true, preserveDrawingBuffer: true });
renderer.setPixelRatio(1); renderer.setSize(W, H, false);
renderer.toneMapping = THREE.ACESFilmicToneMapping; renderer.toneMappingExposure = 1.15;
renderer.outputColorSpace = THREE.SRGBColorSpace;
const scene = new THREE.Scene();
const camera = new THREE.PerspectiveCamera(50, W / H, 0.05, 900);

function canvasTex(w, h, draw) {
  const c = document.createElement('canvas'); c.width = w; c.height = h; draw(c.getContext('2d'), w, h);
  const t = new THREE.CanvasTexture(c); t.colorSpace = THREE.SRGBColorSpace; t.anisotropy = 8; return t;
}
// sky
scene.background = canvasTex(4, 512, (g, w, h) => {
  const gr = g.createLinearGradient(0, 0, 0, h);
  gr.addColorStop(0, '#05080f'); gr.addColorStop(.45, '#0e1426'); gr.addColorStop(.72, '#2a2342'); gr.addColorStop(1, '#3b2b44');
  g.fillStyle = gr; g.fillRect(0, 0, w, h);
});
scene.fog = new THREE.FogExp2(0x1a1830, 0.0075);

scene.add(new THREE.HemisphereLight(0x6f8fb8, 0x0b0f14, 1.4));
const moon = new THREE.DirectionalLight(0x8fb3ff, 0.9); moon.position.set(-40, 80, 60); scene.add(moon);

const M = (color, o = {}) => new THREE.MeshStandardMaterial({ color, roughness: .85, metalness: 0, ...o });

// ---------- city ----------
function windowTex(p, cols = 8, rows = 16) {
  return canvasTex(256, 512, (g, w, h) => {
    g.fillStyle = '#0d171c'; g.fillRect(0, 0, w, h);
    const cw = w / cols, rh = h / rows;
    for (let r = 0; r < rows; r++) for (let c = 0; c < cols; c++) {
      const lit = rnd() < p;
      g.fillStyle = lit ? (rnd() < .8 ? '#ffb24d' : '#ffe2a8') : '#16262c';
      g.fillRect(c * cw + cw * .22, r * rh + rh * .25, cw * .56, rh * .5);
    }
  });
}
function overlayTex(p, cols = 8, rows = 16) {
  return canvasTex(256, 512, (g, w, h) => {
    g.clearRect(0, 0, w, h);
    const cw = w / cols, rh = h / rows;
    for (let r = 0; r < rows; r++) for (let c = 0; c < cols; c++) if (rnd() < p) {
      g.fillStyle = '#ffc56a'; g.fillRect(c * cw + cw * .22, r * rh + rh * .25, cw * .56, rh * .5);
    }
  });
}
const cityGroups = [[], [], [], []];
const roofs = [];
for (let gx = -12; gx <= 12; gx++) for (let gz = -12; gz <= 12; gz++) {
  const x = gx * 11 + (rnd() - .5) * 2, z = gz * 11 + (rnd() - .5) * 2;
  if (Math.abs(x) < 20 && z > -26 && z < 18) continue;          // hero block + plaza
  if (rnd() < .12) continue;
  const near = (x > -28 && x < 55 && z > -5 && z < 125) || (Math.hypot(x, z) < 45 && z > 0);
  const w = 5 + rnd() * 4, d = 5 + rnd() * 4;
  const h = near ? 3 + rnd() * 5 : 6 + Math.pow(rnd(), 1.6) * 38;
  const geo = new THREE.BoxGeometry(w, h, d);
  // scale uv so windows have constant size (8 cols per 8m, 16 rows per 32m)
  const uv = geo.attributes.uv, nrm = geo.attributes.normal;
  for (let i = 0; i < uv.count; i++) {
    const ny = Math.abs(nrm.getY(i)) > .5, nx = Math.abs(nrm.getX(i)) > .5;
    if (ny) { uv.setXY(i, 0.01, 0.01); continue; }
    const span = nx ? d : w;
    uv.setXY(i, uv.getX(i) * span / 8, uv.getY(i) * h / 32);
  }
  geo.translate(x, h / 2, z);
  const k = Math.floor(rnd() * 4);
  cityGroups[k].push(geo);
  roofs.push(V(x, h, z));
}
const cityOverlays = [];
cityGroups.forEach((geos, k) => {
  const g = mergeGeometries(geos);
  const tex = windowTex(.22 + k * .03); tex.wrapS = tex.wrapT = THREE.RepeatWrapping;
  scene.add(new THREE.Mesh(g, M(0x0e181d, { emissive: 0xffffff, emissiveMap: tex, emissiveIntensity: 1.25, map: null })));
  const ot = overlayTex(.35); ot.wrapS = ot.wrapT = THREE.RepeatWrapping;
  const om = new THREE.MeshBasicMaterial({ map: ot, transparent: true, opacity: 0, depthWrite: false, toneMapped: false, color: 0xffd28a, polygonOffset: true, polygonOffsetFactor: -2 });
  const ov = new THREE.Mesh(g, om); scene.add(ov); cityOverlays.push(om);
});
// ground + street lights
const ground = new THREE.Mesh(new THREE.PlaneGeometry(800, 800), M(0x0a1215));
ground.rotation.x = -Math.PI / 2; scene.add(ground);
{
  const pts = [];
  for (let a = -12; a <= 12; a++) for (let b = -60; b <= 60; b++) {
    if (rnd() < .5) continue;
    pts.push(V(a * 11 + 5.5, .35, b * 2.2), V(b * 2.2, .35, a * 11 + 5.5));
  }
  const im = new THREE.InstancedMesh(new THREE.SphereGeometry(.22, 6, 4), new THREE.MeshBasicMaterial({ color: 0xffb04a, toneMapped: false }), pts.length);
  const m4 = new THREE.Matrix4(); pts.forEach((p, i) => { m4.makeTranslation(p.x, p.y, p.z); im.setMatrixAt(i, m4); }); scene.add(im);
}

// ---------- hero building ----------
const COLS = 5, ROWS = 9, SPX = 4.6, SPY = 3.6, WW = 2.8, WH = 2.0;
const colX = c => (c - 2) * SPX;
const FW = COLS * SPX, FH = ROWS * SPY;
{
  const body = new THREE.BoxGeometry(FW, FH, 14);
  const mats = Array(6).fill(M(0x1b2d33)); mats[4] = new THREE.MeshBasicMaterial({ visible: false });
  const b = new THREE.Mesh(body, mats); b.position.set(0, FH / 2, -7); scene.add(b);
  const fac = canvasTex(1024, Math.round(1024 * FH / FW), (g, w, h) => {
    const sx = w / FW, sy = h / FH;
    g.fillStyle = '#1f343a'; g.fillRect(0, 0, w, h);
    for (let r = 0; r < ROWS; r++) { g.fillStyle = '#18292e'; g.fillRect(0, h - (r * SPY) * sy - 6, w, 6); }
    for (let r = 1; r < ROWS; r++) for (let c = 0; c < COLS; c++) {
      const cx = (colX(c) + FW / 2) * sx, cy = h - (r * SPY + 2.0) * sy;
      g.clearRect(cx - WW / 2 * sx, cy - WH / 2 * sy, WW * sx, WH * sy);
    }
  });
  const facade = new THREE.Mesh(new THREE.PlaneGeometry(FW, FH), M(0xffffff, { map: fac, alphaTest: .5, side: THREE.DoubleSide }));
  facade.position.set(0, FH / 2, 0); scene.add(facade);
  for (let r = 1; r < ROWS; r++) for (let c = 0; c < COLS; c++) {
    const y = r * SPY + 2.0, x = colX(c);
    const sill = new THREE.Mesh(new THREE.BoxGeometry(WW + .4, .14, .35), M(0x2b4248)); sill.position.set(x, y - WH / 2 - .07, .1); scene.add(sill);
    if (r === 3 && (c === 1 || c === 3)) continue;
    const lit = rnd() < .45;
    const p = new THREE.Mesh(new THREE.PlaneGeometry(WW, WH), lit
      ? new THREE.MeshBasicMaterial({ color: rnd() < .5 ? 0xd98a3a : 0xb8763a })
      : M(0x0c171b));
    p.position.set(x, y, -.35); scene.add(p);
  }
}

// ---------- characters ----------
function limb(a, b, r, mat) {
  const len = a.distanceTo(b);
  const m = new THREE.Mesh(new THREE.CapsuleGeometry(r, Math.max(.001, len), 4, 10), mat);
  m.position.copy(a).add(b).multiplyScalar(.5);
  m.quaternion.setFromUnitVectors(V(0, 1, 0), b.clone().sub(a).normalize());
  return m;
}
function person({ shirt, pants, skin, hair, pose }) {
  const g = new THREE.Group();
  const S = M(shirt), P = M(pants), K = M(skin), Hm = M(hair), shoe = M(0x111619);
  // chair
  const chair = M(0x2a2f33);
  const seat = new THREE.Mesh(new THREE.BoxGeometry(.6, .08, .55), chair); seat.position.set(0, .46, 0); g.add(seat);
  const back = new THREE.Mesh(new THREE.BoxGeometry(.6, .7, .07), chair); back.position.set(0, .85, .3); back.rotation.x = .12; g.add(back);
  const post = new THREE.Mesh(new THREE.CylinderGeometry(.04, .04, .42), chair); post.position.set(0, .23, 0); g.add(post);
  const lean = pose === 'cross' ? .2 : -.08;
  const torso = new THREE.Mesh(new THREE.CapsuleGeometry(.21, .34, 6, 14), S);
  torso.position.set(0, .86, .05); torso.rotation.x = lean; g.add(torso);
  const headY = 1.33, headZ = .05 - Math.sin(lean) * .5;
  const head = new THREE.Mesh(new THREE.SphereGeometry(.135, 20, 16), K); head.position.set(0, headY, headZ); g.add(head);
  const hairM = new THREE.Mesh(new THREE.SphereGeometry(.142, 20, 16, 0, Math.PI * 2, 0, Math.PI * .62), Hm);
  hairM.position.copy(head.position); hairM.rotation.x = .35; g.add(hairM);
  g.add(limb(V(0, 1.1, headZ + .02), V(0, 1.22, headZ), .05, K));
  for (const s of [-1, 1]) {
    g.add(limb(V(s * .1, .52, -.02), V(s * .11, .52, -.44), .085, P));
    g.add(limb(V(s * .11, .52, -.44), V(s * .11, .1, -.47), .07, P));
    const sh = new THREE.Mesh(new THREE.BoxGeometry(.12, .08, .24), shoe); sh.position.set(s * .11, .04, -.53); g.add(sh);
  }
  const shY = 1.08, shZ = .05 - Math.sin(lean) * .38;
  const arms = [];
  for (const s of [-1, 1]) {
    const sh = V(s * .25, shY, shZ);
    const arm = new THREE.Group(); g.add(arm); arms.push({ s, sh, arm });
  }
  g.userData = { arms, S, K, pose };
  return g;
}
function poseArms(p, t) {
  const { arms, S, K, pose } = p.userData;
  for (const a of arms) {
    a.arm.clear();
    let el, hand;
    if (pose === 'type') {
      const tap = Math.max(0, Math.sin(t * 22 + a.s * 1.7)) * .035;
      el = a.sh.clone().add(V(a.s * .05, -.28, -.12));
      hand = V(a.s * .16, .79 + tap, -.55);
    } else if (pose === 'cross' && a.s === 1) {
      const bob = Math.sin(t * 3) * .015;
      el = a.sh.clone().add(V(.2, -.12, -.05));
      hand = V(.36, 1.38 + bob, .02);
      // crossed fingers
      const f1 = limb(hand.clone().add(V(-.03, .05, 0)), hand.clone().add(V(.03, .19, 0)), .022, K);
      const f2 = limb(hand.clone().add(V(.03, .05, 0)), hand.clone().add(V(-.035, .2, .01)), .022, K);
      a.arm.add(f1, f2);
    } else {
      el = a.sh.clone().add(V(a.s * .04, -.3, -.08));
      hand = V(a.s * .12, .72, -.32);
    }
    a.arm.add(limb(a.sh, el, .065, S), limb(el, hand, .055, S));
    const hm = new THREE.Mesh(new THREE.SphereGeometry(.06, 12, 10), K); hm.position.copy(hand); a.arm.add(hm);
  }
}

// ---------- screens ----------
function rr(g, x, y, w, h, r) { g.beginPath(); g.roundRect(x, y, w, h, r); }
const screen1 = canvasTex(1024, 576, (g, w, h) => {
  g.fillStyle = '#0f1d22'; g.fillRect(0, 0, w, h);
  g.fillStyle = '#f2a53a'; g.beginPath(); g.arc(40, 40, 9, 0, 7); g.fill();
  g.fillStyle = '#cfe0e3'; g.font = '800 26px N'; g.fillText('MI CAMPAÑA', 60, 49);
  rr(g, 362, 110, 300, 330, 22); g.fillStyle = '#1a2f35'; g.fill();
  rr(g, 384, 132, 256, 150, 14); g.fillStyle = '#2d5560'; g.fill();
  g.fillStyle = '#e8f0f2'; g.beginPath(); g.moveTo(492, 175); g.lineTo(492, 240); g.lineTo(545, 207); g.fill();
  g.fillStyle = '#9fb6ba'; g.font = '800 24px N'; g.fillText('ANUNCIO ÚNICO', 400, 320);
  rr(g, 384, 352, 256, 64, 32); g.fillStyle = '#f2a53a'; g.fill();
  g.fillStyle = '#1a1206'; g.font = '900 28px N'; g.fillText('PUBLICAR', 446, 394);
});
const screen2 = canvasTex(1024, 576, (g, w, h) => {
  g.fillStyle = '#0f1d22'; g.fillRect(0, 0, w, h);
  g.fillStyle = '#f2a53a'; g.beginPath(); g.arc(40, 40, 9, 0, 7); g.fill();
  g.fillStyle = '#cfe0e3'; g.font = '800 26px N'; g.fillText('CAMPAÑA DE TESTEO', 60, 49);
  const cols = ['#2d5560', '#5a4527', '#30485a', '#4a3550'];
  for (let i = 0; i < 4; i++) {
    const x = 40 + i * 240;
    rr(g, x, 100, 218, 400, 20); g.fillStyle = '#1a2f35'; g.fill();
    rr(g, x + 16, 160, 186, 130, 12); g.fillStyle = cols[i]; g.fill();
    g.fillStyle = '#fff'; g.font = '900 40px N'; g.fillText('ABCD'[i], x + 18, 145);
    rr(g, x + 140, 112, 60, 32, 16); g.fillStyle = '#21c07a'; g.fill();
    g.fillStyle = '#fff'; g.beginPath(); g.arc(x + 184, 128, 12, 0, 7); g.fill();
    for (let k = 0; k < 3; k++) { rr(g, x + 16, 310 + k * 44, 120 + ((i + k) % 3) * 22, 28, 8); g.fillStyle = '#25393e'; g.fill(); }
    g.fillStyle = '#e6eef0'; g.font = '800 26px N'; g.fillText('$5/día', x + 18, 478);
  }
});

// ---------- rooms ----------
const ROW = 3, Y0 = ROW * SPY;
function room(col, { wall, screen, warm }) {
  const g = new THREE.Group(); g.position.set(colX(col), Y0, 0); scene.add(g);
  const box = new THREE.BoxGeometry(SPX - .2, SPY - .1, 4.6);
  const mats = Array(6).fill(M(wall, { side: THREE.BackSide })); mats[4] = new THREE.MeshBasicMaterial({ visible: false });
  mats[3] = M(0x2a2420, { side: THREE.BackSide });
  const r = new THREE.Mesh(box, mats); r.position.set(0, (SPY - .1) / 2 + .02, -2.32); g.add(r);
  const desk = M(0x3b2f27);
  const top = new THREE.Mesh(new THREE.BoxGeometry(2.3, .07, .8), desk); top.position.set(0, .76, -3.95); g.add(top);
  for (const s of [-1, 1]) { const l = new THREE.Mesh(new THREE.BoxGeometry(.06, .76, .7), desk); l.position.set(s * 1.1, .38, -3.95); g.add(l); }
  // monitor
  const mw = 1.75, mh = .98;
  const bez = new THREE.Mesh(new THREE.BoxGeometry(mw + .08, mh + .08, .05), M(0x0a0d0f)); bez.position.set(0, 1.42, -4.28); g.add(bez);
  const scr = new THREE.Mesh(new THREE.PlaneGeometry(mw, mh), new THREE.MeshBasicMaterial({ map: screen, toneMapped: false, color: 0xa8a8a8 }));
  scr.position.set(0, 1.42, -4.25); g.add(scr);
  const st = new THREE.Mesh(new THREE.BoxGeometry(.08, .45, .05), M(0x0a0d0f)); st.position.set(0, .98, -4.3); g.add(st);
  const kb = new THREE.Mesh(new THREE.BoxGeometry(.7, .03, .22), M(0x1c2226)); kb.position.set(0, .8, -3.72); g.add(kb);
  const sl = new THREE.PointLight(0x7fd6ff, warm ? 2.2 : 3.2, 6, 1.6); sl.position.set(0, 1.4, -3.6); g.add(sl);
  const cl = new THREE.PointLight(warm ? 0xffb066 : 0x6f8fb0, warm ? 9 : 2.2, 7, 1.5); cl.position.set(-1.2, 2.8, -1.6); g.add(cl);
  if (warm) {
    const shade = new THREE.Mesh(new THREE.ConeGeometry(.18, .22, 16, 1, true), M(0xf2a53a, { side: THREE.DoubleSide, emissive: 0x7a4a10 }));
    shade.position.set(-.9, 1.32, -3.95); g.add(shade);
    const arm = new THREE.Mesh(new THREE.CylinderGeometry(.015, .015, .52), M(0x222)); arm.position.set(-.9, 1.05, -3.95); g.add(arm);
    const bulb = new THREE.Mesh(new THREE.SphereGeometry(.06, 10, 8), new THREE.MeshBasicMaterial({ color: 0xffd9a0, toneMapped: false })); bulb.position.set(-.9, 1.24, -3.95); g.add(bulb);
    const ll = new THREE.PointLight(0xffb066, 3, 4, 1.6); ll.position.set(-.9, 1.15, -3.85); g.add(ll);
    const plant = new THREE.Mesh(new THREE.IcosahedronGeometry(.28, 0), M(0x2f6b4a)); plant.position.set(1.65, .5, -3.9); g.add(plant);
    const pot = new THREE.Mesh(new THREE.CylinderGeometry(.16, .12, .3, 10), M(0x8a5a3a)); pot.position.set(1.65, .15, -3.9); g.add(pot);
  }
  const shelf = new THREE.Mesh(new THREE.BoxGeometry(1, .05, .25), M(0x3b2f27)); shelf.position.set(1.4, 2.3, -4.4); g.add(shelf);
  return g;
}
const room1 = room(1, { wall: 0x1c3a40, screen: screen1, warm: false });
const room2 = room(3, { wall: 0x2d3b3c, screen: screen2, warm: true });
const p1 = person({ shirt: 0x3a4a6a, pants: 0x262c3a, skin: 0xe2b48c, hair: 0x2a1c14, pose: 'cross' });
p1.position.set(0, 0, -2.9); room1.add(p1);
const p2 = person({ shirt: 0xd9763a, pants: 0x2b3550, skin: 0xb98260, hair: 0x15100c, pose: 'type' });
p2.position.set(0, 0, -2.95); room2.add(p2);
// question mark sprite
const qTex = canvasTex(256, 256, (g) => { g.fillStyle = '#ffb24d'; g.font = '900 220px N'; g.textAlign = 'center'; g.fillText('?', 128, 210); });
const qSpr = new THREE.Sprite(new THREE.SpriteMaterial({ map: qTex, transparent: true, toneMapped: false, depthTest: false }));
qSpr.scale.set(.3, .3, 1); room1.add(qSpr);

// ---------- golden arcs ----------
const TARGET = V(colX(3), Y0 + 2.0, .4);
const arcs = [];
{
  const cand = roofs.filter(r => r.z > 10 || Math.abs(r.x) > 30).sort(() => rnd() - .5).slice(0, 12);
  cand.forEach((s, i) => {
    const mid = s.clone().lerp(TARGET, .5); mid.y = Math.max(s.y, TARGET.y) + 18 + rnd() * 14;
    const curve = new THREE.QuadraticBezierCurve3(s, mid, TARGET);
    const geo = new THREE.TubeGeometry(curve, 120, .09, 6, false);
    const mat = new THREE.MeshBasicMaterial({ color: 0xffc061, toneMapped: false, transparent: true, opacity: .95 });
    const mesh = new THREE.Mesh(geo, mat); mesh.visible = false; scene.add(mesh);
    const head = new THREE.Mesh(new THREE.SphereGeometry(.45, 12, 10), new THREE.MeshBasicMaterial({ color: 0xffe2a8, toneMapped: false }));
    head.visible = false; scene.add(head);
    arcs.push({ curve, geo, mesh, head, delay: i * .11 });
  });
}

// ---------- camera paths ----------
const shots = [
  { a: 0, b: 2.6, ease: x => 1 - Math.pow(1 - x, 1.7),
    pos: [V(52, 92, 118), V(16, 38, 48), V(-4.6, 15, 10), V(-4.6, Y0 + 2.05, 1.4), V(-3.95, Y0 + 1.85, -1.25)],
    look: [V(0, 12, 0), V(-3, Y0 + 2, 0), V(-4.6, Y0 + 2, -1), V(-4.6, Y0 + 1.6, -3.5), V(-4.75, Y0 + 1.3, -4.3)] },
  { a: 2.6, b: 5.05, ease: eio,
    pos: [V(-3.95, Y0 + 1.85, -1.25), V(-4.6, Y0 + 2.0, 1.2), V(-3.4, Y0 + 2.1, 6.8), V(3.4, Y0 + 2.1, 6.8), V(4.6, Y0 + 2.0, 1.2), V(5.15, Y0 + 1.8, -1.55)],
    look: [V(-4.75, Y0 + 1.3, -4.3), V(-4.6, Y0 + 1.8, -2), V(-1.5, Y0 + 2, 0), V(1.5, Y0 + 2, 0), V(4.6, Y0 + 1.7, -2), V(4.5, Y0 + 1.35, -4.3)] },
  { a: 5.05, b: 5.9, ease: x => x * x,
    pos: [V(5.15, Y0 + 1.8, -1.55), V(4.75, Y0 + 1.55, -3.0), V(4.6, Y0 + 1.43, -3.75)],
    look: [V(4.5, Y0 + 1.35, -4.3), V(4.6, Y0 + 1.42, -4.3), V(4.6, Y0 + 1.42, -4.3)] },
  { a: 14.6, b: 15.55, ease: x => x * x * (3 - 2 * x) * .6 + x * .4,
    pos: [V(4.6, Y0 + 1.5, -2.3), V(4.75, Y0 + 1.9, -0.6), V(4.6, Y0 + 2.1, 3.2)],
    look: [V(4.6, Y0 + 1.42, -4.3), V(4.6, Y0 + 1.8, -2.5), V(4.4, Y0 + 2, 0)] },
  { a: 15.55, b: 20, ease: x => 1 - Math.pow(1 - x, 2.2),
    pos: [V(4.6, Y0 + 2.1, 3.2), V(7, Y0 + 4, 12), V(20, 30, 46), V(34, 50, 78), V(38, 56, 88)],
    look: [V(4.4, Y0 + 2, 0), V(4, Y0 + 2, 0), V(2, 12, 0), V(0, 10, 0), V(-1, 9, 0)] },
];
shots.forEach(s => { s.pc = new THREE.CatmullRomCurve3(s.pos, false, 'centripetal'); s.lc = new THREE.CatmullRomCurve3(s.look, false, 'centripetal'); });

// ---------- post ----------
const composer = new EffectComposer(renderer);
composer.addPass(new RenderPass(scene, camera));
const bloom = new UnrealBloomPass(new THREE.Vector2(W / 2, H / 2), .75, .55, .72); composer.addPass(bloom);
composer.addPass(new OutputPass());

// ---------- captions ----------
const CHUNKS = [5, 4, 5, 1, 6, 3, 2, 3, 5, 3, 3, 6, 2, 4];
const KEY = new Set(['dedos', 'prueban', 'varios', 'presupuesto', 'ganador', 'grande', 'testeo', 'comenta', 'test']);
const chunks = []; { let i = 0; for (const n of CHUNKS) { chunks.push(WORDS.slice(i, i + n)); i += n; } }
const capEl = document.getElementById('cap');
function caption(t) {
  let ci = -1; for (let i = 0; i < chunks.length; i++) if (t >= chunks[i][0].s - .04) ci = i;
  if (ci < 0) { capEl.innerHTML = ''; return; }
  const ch = chunks[ci];
  capEl.innerHTML = ch.map(w => {
    if (t < w.s - .04) return '';
    const k = prog(t, w.s - .04, w.s + .1), act = t < w.e + .02 || w === ch[ch.length - 1];
    const isKey = KEY.has(norm(w.w));
    const bx = isKey ? `<span class="bx" style="transform:scale(${lerp(1.25, 1, eout(prog(t, w.s, w.s + .18)))});opacity:${prog(t, w.s, w.s + .1)}"><i></i><i></i><i></i><i></i></span>` : '';
    return `<span class="w${act ? ' on' : ''}" style="opacity:${k};transform:translateY(${(1 - eout(k)) * 18}px)">${bx}<span style="position:relative">${w.w}</span></span>`;
  }).join('');
}

// ---------- UI (dashboard) ----------
const panel = document.getElementById('panel'), ui = document.getElementById('ui');
const ICON = {
  play: '<svg viewBox="0 0 40 40" width="64" height="64"><circle cx="20" cy="20" r="19" fill="rgba(255,255,255,.18)"/><path d="M15 11 L30 20 L15 29Z" fill="#fff"/></svg>',
  text: '<svg viewBox="0 0 60 40" width="96" height="64"><text x="2" y="34" font-family="N" font-weight="900" font-size="38" fill="#fff">Aa</text></svg>',
  ppl: '<svg viewBox="0 0 60 40" width="96" height="64"><circle cx="18" cy="13" r="7" fill="#fff"/><path d="M5 37c0-9 6-14 13-14s13 5 13 14z" fill="#fff"/><circle cx="40" cy="12" r="6" fill="#fff" opacity=".7"/><path d="M30 36c1-8 5-12 10-12s11 4 11 12z" fill="#fff" opacity=".7"/></svg>',
};
const CARDS = [
  { L: 'A', bg: 'linear-gradient(135deg,#2d6470,#1b3a42)', ic: 'play', ch: ['VIDEO 1', 'TEXTO 2', 'PÚBLICO 1'], res: 12 },
  { L: 'B', bg: 'linear-gradient(135deg,#b07a2e,#5a3b17)', ic: 'play', ch: ['VIDEO 2', 'TEXTO 1', 'PÚBLICO 2'], res: 47 },
  { L: 'C', bg: 'linear-gradient(135deg,#3b5f80,#1e3348)', ic: 'text', ch: ['VIDEO 1', 'TEXTO 3', 'PÚBLICO 3'], res: 9 },
  { L: 'D', bg: 'linear-gradient(135deg,#6a4a7a,#35233f)', ic: 'ppl', ch: ['VIDEO 3', 'TEXTO 2', 'PÚBLICO 1'], res: 15 },
];
const WIN = 1;
const POS = [[0, 110], [468, 110], [0, 560], [468, 560]];
panel.innerHTML = `<div class="waves">${[0, 1, 2].map(i => `<svg viewBox="0 0 280 110" preserveAspectRatio="none"><path id="wv${i}" fill="none" stroke="${i === 1 ? '#5fd3c9' : '#f2a53a'}" stroke-width="4" stroke-linecap="round"/></svg>`).join('')}</div>
<div class="hdr"><div class="dot"></div>CAMPAÑA DE TESTEO · EN CURSO</div>` +
  CARDS.map((c, i) => `<div class="card" id="c${i}"><div class="lab">ANUNCIO</div><div class="let">${c.L}</div>
  <div class="tog" id="tg${i}"><b></b></div>
  <div class="thumb" style="background:${c.bg};display:flex;align-items:center;justify-content:center">${ICON[c.ic]}</div>
  <div class="chips">${c.ch.map((x, k) => `<div class="chip" id="ch${i}_${k}">${x}</div>`).join('')}</div>
  <div class="bud" id="bd${i}">$5/día</div><div class="metn" id="mn${i}"></div><div class="met"><b id="mb${i}"></b></div>
  <div class="paus" id="ps${i}" style="opacity:0">PAUSADO</div></div>`).join('') +
  `<div class="stamp" id="stamp" style="opacity:0">GANADOR</div>
  <div id="big"><div style="position:absolute;left:0;right:0;top:560px;text-align:center;color:#9fb6ba;font-weight:800;font-size:30px;letter-spacing:3px">PRESUPUESTO DIARIO</div>
  <div class="cnt" id="cnt" style="position:absolute;left:0;right:0;top:610px"></div>
  <svg style="position:absolute;left:60px;top:800px" width="780" height="150" viewBox="0 0 780 150"><path id="chart" fill="none" stroke="#21c07a" stroke-width="7" stroke-linecap="round" stroke-linejoin="round"/><path id="charta" fill="rgba(33,192,122,.15)"/></svg></div>`;
const $ = id => document.getElementById(id);
const rain = $('rain').getContext('2d');
function hash(a, b) { let h = (a * 374761393 + b * 668265263) | 0; h = (h ^ (h >>> 13)) * 1274126177; return ((h ^ (h >>> 16)) >>> 0) / 4294967295; }
function drawRain(t) {
  rain.clearRect(0, 0, W, H);
  const f = Math.floor(t * 14);
  for (const side of [0, 1]) for (let c = 0; c < 6; c++) {
    const x = side ? W - 30 - c * 12 : 30 + c * 12;
    for (let r = 0; r < 150; r++) {
      const v = hash(c + side * 50, r + f * 3 - Math.floor(t * 30 * (1 + c % 3)) * 0);
      if (v < .55) continue;
      rain.fillStyle = v > .93 ? 'rgba(242,165,58,.85)' : v > .8 ? 'rgba(95,211,201,.45)' : 'rgba(242,165,58,.22)';
      rain.fillRect(x, 300 + r * 9, 4, 4);
    }
  }
}
const tVarios = T('varios'), tVez = T('vez'), tPoco = T('poco'), tVid = T('videos'), tTex = T('textos'), tPub = T('públicos'),
  tDatos = T('datos'), tGan = T('ganador'), tY = T('y', 34), tInv = T('invierten'), tGrande = T('grande'),
  tCom = T('comenta'), tTest = T('test'), tExp = T('explico');

function uiFrame(t) {
  const inA = prog(t, 5.2, 5.75), outA = prog(t, 14.55, 15.0);
  const vis = inA * (1 - outA);
  ui.style.opacity = vis;
  if (vis <= 0) return;
  const sc = lerp(.55, 1, eout(inA)) * lerp(1, .55, eio(outA));
  panel.style.transform = `scale(${sc})`;
  panel.style.filter = `blur(${(1 - inA) * 10 + outA * 8}px)`;
  drawRain(t);
  for (let i = 0; i < 3; i++) {
    let d = ''; const amp = 30 + 8 * Math.sin(t * 2 + i);
    for (let x = 0; x <= 280; x += 6) d += (x ? 'L' : 'M') + x + ' ' + (55 + amp * Math.sin(x / 280 * Math.PI * 4 + t * (3 + i) + i * 2) * Math.sin(x / 280 * Math.PI)).toFixed(1);
    $('wv' + i).setAttribute('d', d);
  }
  const bigK = eio(prog(t, tY - .05, tY + .45));
  CARDS.forEach((c, i) => {
    const el = $('c' + i);
    const a = eback(prog(t, tVarios - .25 + i * .12, tVarios + .2 + i * .12));
    const [x, y] = POS[i];
    let cx = x, cy = y, s = Math.max(0, a), op = clamp(a * 1.5);
    if (i === WIN) { cx = lerp(x, 234, bigK); cy = lerp(y, 120, bigK); s *= lerp(1, 1.0, bigK); }
    else { op *= 1 - bigK; cy += bigK * 80; }
    el.style.left = cx + 'px'; el.style.top = cy + 'px'; el.style.opacity = op;
    el.style.transform = `scale(${s}) rotate(${(1 - clamp(a)) * (i % 2 ? 6 : -6)}deg)`;
    // toggles at "vez"
    const on = eout(prog(t, tVez, tVez + .18));
    const tg = $('tg' + i); tg.style.background = on > .5 ? '#21c07a' : '#2a3b40'; tg.firstChild.style.left = lerp(6, 48, on) + 'px';
    tg.firstChild.style.background = on > .5 ? '#fff' : '#cfd8da';
    // budget pop at "poco"
    const bp = prog(t, tPoco + i * .06, tPoco + .3 + i * .06);
    const bd = $('bd' + i); bd.style.opacity = .3 + .7 * clamp(bp * 2); bd.style.transform = `scale(${1 + Math.sin(bp * Math.PI) * .25})`; bd.style.transformOrigin = '0 50%';
    bd.style.color = bp > 0 && bp < 1 ? '#f2c17a' : '#e6eef0';
    if (i === WIN) {
      const k = prog(t, tInv, tGrande + .3);
      bd.textContent = '$' + Math.round(lerp(5, 50, eio(k))) + '/día';
    }
    // chips highlight
    [tVid, tTex, tPub].forEach((tt, k) => {
      const h = prog(t, tt - .05, tt + .15) * (1 - prog(t, tDatos - .1, tDatos + .2));
      const chip = $(`ch${i}_${k}`);
      chip.style.borderColor = `rgba(95,211,201,${h})`; chip.style.color = h > .5 ? '#ffffff' : '#a9bfc3';
      chip.style.background = h > .5 ? '#1f4a4a' : '#203338';
      chip.style.transform = `translateY(${-Math.sin(prog(t, tt - .05, tt + .25) * Math.PI) * 8}px)`;
    });
    // metrics
    const mk = eout(prog(t, tDatos - .1, tGan - .05));
    $('mb' + i).style.width = (mk * c.res / 47 * 100) + '%';
    $('mb' + i).style.background = i === WIN && t > tGan ? '#21c07a' : '#f2a53a';
    $('mn' + i).textContent = mk > 0 ? Math.round(mk * c.res) : '';
    $('mn' + i).style.color = i === WIN && t > tGan ? '#5fe3a5' : '#f2c17a';
    const pz = i !== WIN ? eout(prog(t, tGan - .1 + i * .05, tGan + .15 + i * .05)) : 0;
    $('ps' + i).style.opacity = pz;
    el.style.borderColor = i === WIN && t > tGan ? `rgba(33,192,122,${.9})` : 'rgba(255,255,255,.08)';
    el.style.boxShadow = i === WIN && t > tGan ? '0 0 60px rgba(33,192,122,.45),0 20px 50px rgba(0,0,0,.45)' : '0 20px 50px rgba(0,0,0,.45)';
  });
  // stamp
  const st = $('stamp'), sk = prog(t, tGan, tGan + .22);
  const wc = $('c' + WIN);
  st.style.opacity = sk > 0 ? clamp(sk * 3) * (1 - prog(t, tY - .1, tY + .15)) : 0;
  st.style.left = (parseFloat(wc.style.left) + 216) + 'px'; st.style.top = (parseFloat(wc.style.top) + 200) + 'px';
  st.style.transform = `translate(-50%,-50%) rotate(-7deg) scale(${lerp(2.4, 1, eout(sk)) + Math.sin(prog(t, tGan + .22, tGan + .45) * Math.PI) * .06})`;
  // big counter + chart
  const big = $('big'); big.style.opacity = prog(t, tY + .2, tY + .5);
  const k = eio(prog(t, tInv, tGrande + .3)), val = Math.round(lerp(5, 50, k));
  $('cnt').innerHTML = '<b style="align-self:center;font-size:96px">$</b>' + String(val).split('').map(ch => `<span>${ch}</span>`).join('') + '<b style="align-self:flex-end;font-size:54px;color:#9fb6ba;padding-bottom:18px">/día</b>';
  let d = '', n = 40, ck = prog(t, tY + .3, tGrande + .4);
  const pts = [];
  for (let j = 0; j <= n * ck; j++) { const x = j / n * 780, y = 130 - Math.pow(j / n, 1.8) * 110 - Math.sin(j * 1.3) * 6; pts.push([x, y]); }
  pts.forEach((p, j) => d += (j ? 'L' : 'M') + p[0].toFixed(1) + ' ' + p[1].toFixed(1));
  $('chart').setAttribute('d', d);
  $('charta').setAttribute('d', pts.length ? d + `L${pts[pts.length - 1][0]} 150 L0 150Z` : '');
}

// ---------- CTA ----------
const cta = $('cta');
cta.innerHTML = `<div class="bub" id="bub"><div class="av" style="width:64px;height:64px"></div>TEST
<svg class="heart" id="heart" viewBox="0 0 40 40"><path d="M20 35 C6 25 2 18 6 11 C9 6 16 6 20 12 C24 6 31 6 34 11 C38 18 34 25 20 35Z" fill="#ff4d6d"/></svg></div>
<div class="bar"><div class="av"></div><div class="inp" id="inp"></div><div class="send" id="send"><svg width="44" height="44" viewBox="0 0 24 24"><path d="M3 12 L21 3 L14 21 L11 13Z" fill="#fff"/></svg></div></div>`;
function ctaFrame(t) {
  const a = eback(prog(t, tCom - .1, tCom + .35));
  cta.style.opacity = clamp(prog(t, tCom - .1, tCom + .15));
  cta.style.transform = `translateY(${(1 - a) * 160}px)`;
  const typed = 'TEST'.slice(0, Math.floor(clamp((t - tTest + .05) / .32) * 4 + .001));
  const sent = t > tExp - .1;
  $('inp').innerHTML = sent ? '<span class="ph">Añade un comentario…</span>' : typed ? typed + (Math.floor(t * 4) % 2 ? '|' : '') : '<span class="ph">Añade un comentario…</span>';
  const sp = prog(t, tExp - .1, tExp + .1);
  $('send').style.transform = `scale(${1 + Math.sin(sp * Math.PI) * .25})`;
  const bk = eback(prog(t, tExp - .05, tExp + .35));
  const bub = $('bub'); bub.style.opacity = clamp(bk * 2); bub.style.transform = `translateY(${(1 - bk) * 60}px) scale(${lerp(.6, 1, clamp(bk))})`;
  bub.style.transformOrigin = '0 100%';
  const hk = eback(prog(t, T('cómo') - .1, T('cómo') + .2));
  $('heart').style.transform = `scale(${Math.max(0, hk)})`;
}

// ---------- 3D frame ----------
function shotAt(t) { for (const s of shots) if (t >= s.a && t <= s.b) return s; return null; }
function frame3D(t) {
  const s = shotAt(t);
  if (!s) return false;
  const u = s.ease(prog(t, s.a, s.b));
  camera.position.copy(s.pc.getPoint(u));
  camera.lookAt(s.lc.getPoint(u));
  camera.fov = 50; camera.updateProjectionMatrix();
  poseArms(p1, t); poseArms(p2, t);
  const qk = eback(prog(t, 1.3, 1.7));
  qSpr.position.set(-.3, 1.72 + Math.sin(t * 4) * .04, -2.9); qSpr.material.opacity = clamp(qk) * (1 - prog(t, 3.4, 3.8));
  qSpr.scale.setScalar(.3 * Math.max(0, qk));
  // arcs
  arcs.forEach(a => {
    const k = eio(prog(t, 15.0 + a.delay, 16.4 + a.delay));
    a.mesh.visible = k > 0; a.head.visible = k > 0 && k < 1;
    const segs = 120, idx = a.geo.index.count / segs;
    a.geo.setDrawRange(0, Math.floor(segs * k) * idx);
    a.head.position.copy(a.curve.getPoint(k));
    a.mesh.material.opacity = .95 - prog(t, 18.5, 20) * .3;
  });
  cityOverlays.forEach((m, i) => m.opacity = eout(prog(t, 15.6 + i * .35, 16.4 + i * .35)));
  composer.render();
  return true;
}

window.renderAt = (t) => {
  const has3D = frame3D(t);
  canvas.style.opacity = has3D ? 1 : 0;
  uiFrame(t);
  ctaFrame(t);
  caption(t);
  return true;
};
await document.fonts.ready;
// force font load for canvas textures then redraw them
await Promise.all([400, 800, 900].map(w => document.fonts.load(`${w} 30px N`)));
window.READY = true;
