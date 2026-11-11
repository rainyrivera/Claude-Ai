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
const screen3 = canvasTex(1024, 576, (g, w, h) => {
  g.fillStyle = '#0f1d22'; g.fillRect(0, 0, w, h);
  g.fillStyle = '#f2a53a'; g.beginPath(); g.arc(40, 40, 9, 0, 7); g.fill();
  g.fillStyle = '#cfe0e3'; g.font = '800 26px N'; g.fillText('CAMPAÑA DE TESTEO', 60, 49);
  rr(g, 70, 90, 380, 440, 24); g.fillStyle = '#1a2f35'; g.fill(); g.strokeStyle = '#21c07a'; g.lineWidth = 5; g.stroke();
  g.fillStyle = '#fff'; g.font = '900 54px N'; g.fillText('B', 96, 156);
  rr(g, 96, 180, 328, 170, 16); g.fillStyle = '#9a6a28'; g.fill();
  g.fillStyle = '#fff'; g.beginPath(); g.moveTo(240, 230); g.lineTo(240, 300); g.lineTo(295, 265); g.fill();
  g.save(); g.translate(260, 420); g.rotate(-.12); rr(g, -130, -38, 260, 76, 12); g.fillStyle = '#21c07a'; g.fill();
  g.fillStyle = '#fff'; g.font = '900 40px N'; g.textAlign = 'center'; g.fillText('GANADOR', 0, 14); g.restore();
  g.fillStyle = '#9fb6ba'; g.font = '800 28px N'; g.fillText('PRESUPUESTO', 540, 170);
  g.fillStyle = '#fff'; g.font = '900 72px N'; g.fillText('$50/día', 540, 250);
  rr(g, 540, 320, 400, 100, 50); g.fillStyle = '#f2a53a'; g.fill();
  g.fillStyle = '#1a1206'; g.font = '900 40px N'; g.fillText('x2 PRESUPUESTO', 572, 384);
  g.fillStyle = '#fff'; g.strokeStyle = '#000'; g.lineWidth = 3; g.beginPath(); g.moveTo(860, 380); g.lineTo(860, 440); g.lineTo(875, 426); g.lineTo(888, 452); g.lineTo(898, 447); g.lineTo(885, 422); g.lineTo(905, 420); g.closePath(); g.fill(); g.stroke();
});
const room2 = room(3, { wall: 0x2d3b3c, screen: screen3, warm: true });
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

// ---------- camera paths (reel 2) ----------
const shots = [
  { a: 0, b: 3.2, ease: x => 1 - Math.pow(1 - x, 1.8),
    pos: [V(52, 92, 118), V(20, 40, 50), V(6, 17, 12), V(4.6, Y0 + 2.05, 1.4), V(5.15, Y0 + 1.8, -1.55)],
    look: [V(0, 12, 0), V(4, Y0 + 2, 0), V(4.6, Y0 + 2, -1), V(4.6, Y0 + 1.6, -3.5), V(4.5, Y0 + 1.35, -4.3)] },
  { a: 3.8, b: 4.6, ease: x => x * x,
    pos: [V(5.15, Y0 + 1.8, -1.55), V(4.75, Y0 + 1.55, -3.0), V(4.6, Y0 + 1.43, -3.75)],
    look: [V(4.5, Y0 + 1.35, -4.3), V(4.6, Y0 + 1.42, -4.3), V(4.6, Y0 + 1.42, -4.3)] },
  { a: 21.55, b: 22.3, ease: x => x * x * (3 - 2 * x) * .6 + x * .4,
    pos: [V(4.6, Y0 + 1.5, -2.3), V(4.75, Y0 + 1.9, -0.6), V(4.6, Y0 + 2.1, 3.2)],
    look: [V(4.6, Y0 + 1.42, -4.3), V(4.6, Y0 + 1.8, -2.5), V(4.4, Y0 + 2, 0)] },
  { a: 22.3, b: 25, ease: x => 1 - Math.pow(1 - x, 2.2),
    pos: [V(4.6, Y0 + 2.1, 3.2), V(7, Y0 + 4, 12), V(20, 30, 46), V(34, 50, 78), V(38, 56, 88)],
    look: [V(4.4, Y0 + 2, 0), V(4, Y0 + 2, 0), V(2, 12, 0), V(0, 10, 0), V(-1, 9, 0)] },
];
shots.forEach(s => { s.pc = new THREE.CatmullRomCurve3(s.pos, false, 'centripetal'); s.lc = new THREE.CatmullRomCurve3(s.look, false, 'centripetal'); });

// ---------- post ----------
const composer = new EffectComposer(renderer);
composer.addPass(new RenderPass(scene, camera));
composer.addPass(new UnrealBloomPass(new THREE.Vector2(W / 2, H / 2), .75, .55, .72));
composer.addPass(new OutputPass());

// ---------- captions ----------
const CHUNKS = [4, 5, 1, 3, 3, 5, 3, 4, 5, 4, 4, 5, 6, 4, 2, 5, 2, 4];
const KEY = new Set(['duplicarle', 'espera', 'constante', 'estable', 'original', 'id', 'nueva', 'comentarios', 'ganador', 'comenta', 'escalar']);
const chunks = []; { let i = 0; for (const n of CHUNKS) { chunks.push(WORDS.slice(i, i + n)); i += n; } }
const capEl = document.getElementById('cap');
function caption(t) {
  let ci = -1; for (let i = 0; i < chunks.length; i++) if (t >= chunks[i][0].s - .04) ci = i;
  if (ci < 0) { capEl.innerHTML = ''; return; }
  const ch = chunks[ci];
  capEl.innerHTML = ch.map(w => {
    if (t < w.s - .04) return '';
    const k = prog(t, w.s - .04, w.s + .1), act = t < w.e + .02 || w === ch[ch.length - 1];
    const bx = KEY.has(norm(w.w)) ? `<span class="bx" style="transform:scale(${lerp(1.25, 1, eout(prog(t, w.s, w.s + .18)))});opacity:${prog(t, w.s, w.s + .1)}"><i></i><i></i><i></i><i></i></span>` : '';
    return `<span class="w${act ? ' on' : ''}" style="opacity:${k};transform:translateY(${(1 - eout(k)) * 18}px)">${bx}<span style="position:relative">${w.w}</span></span>`;
  }).join('');
}

// ---------- extra css ----------
const css = document.createElement('style');
css.textContent = `
.ck{position:absolute;width:900px;height:400px;left:0;border-radius:26px;background:linear-gradient(180deg,#16292f,#102026);border:2px solid rgba(255,255,255,.08);box-shadow:0 20px 50px rgba(0,0,0,.45);overflow:hidden}
.badge{position:absolute;left:28px;top:26px;width:64px;height:64px;border-radius:50%;background:#f2a53a;color:#1a1206;font-weight:900;font-size:38px;display:flex;align-items:center;justify-content:center}
.ttl{position:absolute;left:112px;top:38px;color:#fff;font-weight:900;font-size:34px;letter-spacing:1px}
.ok{position:absolute;right:26px;top:20px;width:76px;height:76px;border-radius:50%;background:#21c07a;box-shadow:0 0 40px rgba(33,192,122,.6);display:flex;align-items:center;justify-content:center}
.bar2{position:absolute;bottom:62px;width:70px;border-radius:12px 12px 4px 4px;background:linear-gradient(180deg,#f2c17a,#f2a53a)}
.bl{position:absolute;bottom:22px;width:90px;text-align:center;color:#8aa3a8;font-weight:800;font-size:20px}
.bv{position:absolute;width:70px;text-align:center;color:#fff;font-weight:900;font-size:26px}
.colh{position:absolute;top:96px;font-weight:900;font-size:24px;letter-spacing:2px;color:#9fb6ba;text-align:center}
.ac{position:absolute;width:400px;height:470px;border-radius:26px;background:linear-gradient(180deg,#16292f,#102026);border:2px solid rgba(255,255,255,.08);box-shadow:0 20px 50px rgba(0,0,0,.45);overflow:hidden}
.ac .lab{position:absolute;left:26px;top:22px;color:#9fb6ba;font-weight:800;font-size:22px;letter-spacing:2px}
.ac .let{position:absolute;left:26px;top:50px;color:#fff;font-weight:900;font-size:54px}
.ac .tg{position:absolute;right:24px;top:34px;width:92px;height:50px;border-radius:25px;background:#21c07a}
.ac .tg b{position:absolute;top:6px;left:48px;width:38px;height:38px;border-radius:50%;background:#fff}
.ac .th{position:absolute;left:26px;top:126px;width:348px;height:170px;border-radius:16px;background:linear-gradient(135deg,#b07a2e,#5a3b17);display:flex;align-items:center;justify-content:center}
.eng{position:absolute;left:26px;top:318px;display:flex;gap:26px;color:#fff;font-weight:900;font-size:30px;align-items:center}
.eng span{display:flex;align-items:center;gap:10px}
.ab{position:absolute;left:26px;top:392px;color:#e6eef0;font-weight:800;font-size:28px}
.pill{position:absolute;padding:12px 24px;border-radius:30px;font-weight:900;font-size:28px;letter-spacing:1px;white-space:nowrap;display:flex;align-items:center;gap:12px}
#idf{position:absolute;left:0;top:650px;width:420px;height:150px;border-radius:22px;background:#0c1a1e;border:2px solid rgba(95,211,201,.35)}
#frz{position:absolute;inset:0;pointer-events:none;opacity:0;background:rgba(90,10,10,.18)}
`;
document.head.appendChild(css);

// ---------- UI ----------
const $ = id => document.getElementById(id);
const panel = $('panel'), ui = $('ui');
const PLAY = '<svg viewBox="0 0 40 40" width="64" height="64"><circle cx="20" cy="20" r="19" fill="rgba(255,255,255,.18)"/><path d="M15 11 L30 20 L15 29Z" fill="#fff"/></svg>';
const CHECK = '<svg viewBox="0 0 24 24" width="46" height="46"><path d="M5 12.5 L10 17 L19 7" fill="none" stroke="#fff" stroke-width="3.4" stroke-linecap="round" stroke-linejoin="round"/></svg>';
const HEART = '<svg viewBox="0 0 40 40" width="34" height="34"><path d="M20 35 C6 25 2 18 6 11 C9 6 16 6 20 12 C24 6 31 6 34 11 C38 18 34 25 20 35Z" fill="#ff4d6d"/></svg>';
const BUBBLE = '<svg viewBox="0 0 40 40" width="34" height="34"><path d="M6 8 h28 a4 4 0 0 1 4 4 v14 a4 4 0 0 1 -4 4 h-16 l-8 7 v-7 h-4 a4 4 0 0 1 -4 -4 v-14 a4 4 0 0 1 4 -4z" fill="#5fd3c9"/></svg>';
const LOCK = '<svg viewBox="0 0 24 24" width="30" height="30"><rect x="5" y="10" width="14" height="10" rx="2" fill="#fff"/><path d="M8 10 V7 a4 4 0 0 1 8 0 V10" fill="none" stroke="#fff" stroke-width="2.4"/></svg>';
const SALES = [7, 8, 7, 9, 8, 8, 9];
const CPA = [4.9, 4.7, 4.8, 5.0, 4.8, 4.7, 4.8];
const adCard = (id, extra = '') => `<div class="ac" id="${id}"><div class="lab">ANUNCIO</div><div class="let">B</div><div class="tg"><b></b></div>
  <div class="th">${PLAY}</div><div class="eng"><span>${HEART}<b id="${id}h">1,2 mil</b></span><span>${BUBBLE}<b id="${id}c">86</b></span></div>
  <div class="ab">$50/día</div>${extra}</div>`;
panel.innerHTML = `<div class="waves">${[0, 1, 2].map(i => `<svg viewBox="0 0 280 110" preserveAspectRatio="none"><path id="wv${i}" fill="none" stroke="${i === 1 ? '#5fd3c9' : '#f2a53a'}" stroke-width="4" stroke-linecap="round"/></svg>`).join('')}</div>
<div class="hdr"><div class="dot"></div><span id="hdrt">ANTES DE ESCALAR · 2 CONDICIONES</span></div>
<div id="u1">
 <div class="ck" id="k1" style="top:110px"><div class="badge">1</div><div class="ttl">VENTAS CONSTANTES</div><div class="ok" id="ok1">${CHECK}</div>
  ${SALES.map((v, i) => `<div class="bar2" id="sb${i}" style="left:${70 + i * 115}px;height:0"></div><div class="bv" id="sv${i}" style="left:${70 + i * 115}px">${v}</div><div class="bl" style="left:${60 + i * 115}px">DÍA ${i + 1}</div>`).join('')}
 </div>
 <div class="ck" id="k2" style="top:540px"><div class="badge">2</div><div class="ttl">COSTO POR RESULTADO ESTABLE</div><div class="ok" id="ok2">${CHECK}</div>
  <svg style="position:absolute;left:40px;top:120px" width="820" height="250" viewBox="0 0 820 250">
   <rect x="0" y="70" width="820" height="70" rx="10" fill="rgba(33,192,122,.10)" stroke="rgba(33,192,122,.5)" stroke-dasharray="10 8" stroke-width="2"/>
   <path id="cpl" fill="none" stroke="#5fe3a5" stroke-width="7" stroke-linecap="round" stroke-linejoin="round"/>
   <g id="cpd"></g>
   ${CPA.map((v, i) => `<text x="${40 + i * 123}" y="235" fill="#8aa3a8" font-family="N" font-weight="800" font-size="20" text-anchor="middle">DÍA ${i + 1}</text>`).join('')}
   <text id="cpv" x="780" y="50" fill="#5fe3a5" font-family="N" font-weight="900" font-size="34" text-anchor="end">$4,80</text>
  </svg>
 </div>
</div>
<div id="u2" style="position:absolute;inset:0">
 <div class="colh" id="hl" style="left:0;width:420px">CAMPAÑA DE TESTEO</div>
 <div class="colh" id="hr" style="left:470px;width:430px;color:#5fe3a5">CAMPAÑA NUEVA · ESCALADO</div>
 <div id="rc" style="position:absolute;left:490px;top:150px;width:396px;height:466px;border-radius:26px;border:3px dashed rgba(95,227,165,.55)"></div>
 ${adCard('oc', `<div class="pill" id="lk" style="left:150px;top:24px;background:#d9443a;color:#fff;font-size:20px;padding:6px 12px">${LOCK}ORIGINAL</div>
   <div class="pill" id="sh" style="left:26px;top:388px;background:#21c07a;color:#fff;font-size:24px;padding:8px 16px">${CHECK.replace(/46/g, '30')}GANADOR PROTEGIDO</div>`)}
 <div class="pill" id="x2" style="left:450px;top:700px;background:#f2a53a;color:#1a1206;font-size:36px;padding:16px 32px">x2 PRESUPUESTO<div id="x2s" style="position:absolute;left:-10px;top:50%;height:8px;border-radius:4px;background:#ff3b3b;width:0"></div></div>
 <div id="idf"><div style="position:absolute;left:24px;top:18px;color:#8aa3a8;font-weight:800;font-size:22px;letter-spacing:2px">ID DE PUBLICACIÓN</div>
  <div style="position:absolute;left:24px;top:60px;color:#fff;font-weight:900;font-size:30px;font-family:monospace,N">1029384756_88</div>
  <div class="pill" id="cpb" style="right:16px;top:98px;background:#3d7dff;color:#fff;font-size:22px;padding:8px 18px">COPIAR</div></div>
 ${adCard('nc')}
</div>`;
const rain = $('rain').getContext('2d');
function hash(a, b) { let h = (a * 374761393 + b * 668265263) | 0; h = (h ^ (h >>> 13)) * 1274126177; return ((h ^ (h >>> 16)) >>> 0) / 4294967295; }
function drawRain(t) {
  rain.clearRect(0, 0, W, H);
  const f = Math.floor(t * 14);
  for (const side of [0, 1]) for (let c = 0; c < 6; c++) {
    const x = side ? W - 30 - c * 12 : 30 + c * 12;
    for (let r = 0; r < 150; r++) {
      const v = hash(c + side * 50, r + f * 3);
      if (v < .55) continue;
      rain.fillStyle = v > .93 ? 'rgba(242,165,58,.85)' : v > .8 ? 'rgba(95,211,201,.45)' : 'rgba(242,165,58,.22)';
      rain.fillRect(x, 300 + r * 9, 4, 4);
    }
  }
}
const tDos = T('dos'), tCosas = T('cosas'), tAnun = T('anuncio', 10), tDia = T('día'), tY = T('y', 28), tEst = T('estable'),
  tNo = T('no', 30), tOrig = T('original'), tCopia = T('copia'), tPub = T('publicación'), tLanz = T('lánzalo'), tCamp = T('campaña'),
  tAsi = T('así'), tLikes = T('likes'), tComs = T('comentarios'), tArr = T('arriesgas'), tGan2 = T('ganador', 50),
  tCom = T('comenta'), tEsc = T('escalar'), tExp = T('explico'), tComo = T('cómo');
const pop = (t, a, d = .3) => eback(prog(t, a, a + d));
function fmtK(v) { return v >= 1000 ? (v / 1000).toFixed(1).replace('.', ',') + ' mil' : String(Math.round(v)); }

function uiFrame(t) {
  const inA = prog(t, 4.0, 4.55), outA = prog(t, 21.55, 21.95);
  const vis = inA * (1 - outA);
  ui.style.opacity = vis;
  if (vis <= 0) return;
  panel.style.transform = `scale(${lerp(.55, 1, eout(inA)) * lerp(1, .55, eio(outA))})`;
  panel.style.filter = `blur(${(1 - inA) * 10 + outA * 8}px)`;
  drawRain(t);
  for (let i = 0; i < 3; i++) {
    let d = ''; const amp = 30 + 8 * Math.sin(t * 2 + i);
    for (let x = 0; x <= 280; x += 6) d += (x ? 'L' : 'M') + x + ' ' + (55 + amp * Math.sin(x / 280 * Math.PI * 4 + t * (3 + i) + i * 2) * Math.sin(x / 280 * Math.PI)).toFixed(1);
    $('wv' + i).setAttribute('d', d);
  }
  const sw = prog(t, 12.7, 13.1);
  $('hdrt').textContent = sw < .5 ? 'ANTES DE ESCALAR · 2 CONDICIONES' : 'ESCALADO HORIZONTAL · POST ID';
  // ---- U1 checklist ----
  const u1 = $('u1'); u1.style.opacity = 1 - eio(sw); u1.style.transform = `translateY(${-eio(sw) * 80}px)`;
  [['k1', tDos], ['k2', tCosas]].forEach(([id, tt], i) => {
    const a = pop(t, Math.min(tt, 4.4 + i * .15) - .05, .35);
    const el = $(id); el.style.opacity = clamp(a * 1.5); el.style.transform = `scale(${lerp(.85, 1, clamp(a))})`;
  });
  const sp = (tDia + .2 - tAnun) / SALES.length;
  SALES.forEach((v, i) => {
    const k = eback(prog(t, tAnun + i * sp, tAnun + i * sp + .3));
    const h = Math.max(0, k) * v / 9 * 175;
    $('sb' + i).style.height = h + 'px';
    const bv = $('sv' + i); bv.style.bottom = (62 + h + 6) + 'px'; bv.style.opacity = clamp(k);
  });
  [['ok1', tDia + .1], ['ok2', tEst]].forEach(([id, tt]) => { const k = pop(t, tt, .3); $(id).style.transform = `scale(${Math.max(0, k)})`; });
  {
    const k = prog(t, tY, tEst + .1), pts = CPA.map((v, i) => [40 + i * 123, 105 + (v - 4.85) * 220]);
    const n = (pts.length - 1) * eio(k); let d = ''; const shown = [];
    for (let i = 0; i <= Math.floor(n); i++) shown.push(pts[i]);
    if (n % 1 > 0 && Math.floor(n) < pts.length - 1) { const a = pts[Math.floor(n)], b = pts[Math.floor(n) + 1], f = n % 1; shown.push([lerp(a[0], b[0], f), lerp(a[1], b[1], f)]); }
    shown.forEach((p, i) => d += (i ? 'L' : 'M') + p[0].toFixed(1) + ' ' + p[1].toFixed(1));
    $('cpl').setAttribute('d', k > 0 ? d : '');
    $('cpd').innerHTML = k > 0 ? pts.slice(0, Math.floor(n) + 1).map(p => `<circle cx="${p[0]}" cy="${p[1]}" r="9" fill="#0f1d22" stroke="#5fe3a5" stroke-width="4"/>`).join('') : '';
    $('cpv').style.opacity = prog(t, tEst - .1, tEst + .2);
  }
  // ---- U2 horizontal scaling ----
  const u2 = $('u2'); u2.style.opacity = eio(sw);
  const oc = $('oc'), mv = eio(prog(t, tCopia - .1, tCopia + .45));
  const oa = pop(t, tNo - .25, .4);
  oc.style.left = lerp(250, 10, mv) + 'px'; oc.style.top = lerp(170, 150, mv) + 'px';
  oc.style.transform = `scale(${Math.max(0, oa)})`; oc.style.opacity = clamp(oa * 1.5);
  const x2 = $('x2'); const shake = Math.sin(t * 60) * 8 * (1 - prog(t, tNo + .1, tNo + .5)) * (t > tNo ? 1 : 0);
  x2.style.opacity = clamp(oa * 1.5) * (1 - prog(t, tCopia - .2, tCopia + .1));
  x2.style.transform = `translateX(calc(-50% + ${shake}px))`;
  $('x2s').style.width = (eout(prog(t, tNo, tNo + .25)) * 110) + '%';
  x2.style.filter = t > tNo + .1 ? 'brightness(.75)' : 'none';
  const lk = pop(t, tOrig, .3); $('lk').style.transform = `scale(${Math.max(0, lk)})`; $('lk').style.opacity = clamp(lk * 2);
  const sh = pop(t, tGan2 - .05, .35); $('sh').style.transform = `scale(${Math.max(0, sh)})`; $('sh').style.opacity = clamp(sh * 2);
  oc.querySelector('.ab').style.opacity = t > tGan2 - .1 ? 0 : 1;
  oc.style.borderColor = t > tGan2 ? 'rgba(33,192,122,.9)' : 'rgba(255,255,255,.08)';
  oc.style.boxShadow = t > tGan2 ? '0 0 60px rgba(33,192,122,.45),0 20px 50px rgba(0,0,0,.45)' : '0 20px 50px rgba(0,0,0,.45)';
  const hl = prog(t, tCopia, tCopia + .4); $('hl').style.opacity = hl; $('hr').style.opacity = pop(t, tCamp - .05, .3) > 0 ? clamp(pop(t, tCamp - .05, .3)) : 0;
  $('hr').style.transform = `scale(${Math.max(0, pop(t, tCamp - .05, .3))})`;
  const idf = $('idf'), ia = pop(t, tCopia + .2, .35);
  idf.style.opacity = clamp(ia * 1.5) * (1 - prog(t, tAsi - .2, tAsi + .1)); idf.style.transform = `translateY(${(1 - clamp(ia)) * 40}px)`;
  const cp = $('cpb'), cpk = prog(t, tPub, tPub + .15);
  cp.textContent = cpk > 0 ? '¡COPIADO!' : 'COPIAR'; cp.style.background = cpk > 0 ? '#21c07a' : '#3d7dff';
  cp.style.transform = `scale(${1 + Math.sin(prog(t, tPub - .05, tPub + .25) * Math.PI) * .2})`;
  const rc = $('rc'); rc.style.opacity = clamp(prog(t, tLanz - .3, tLanz)) * (1 - prog(t, tCamp + .3, tCamp + .6));
  const nc = $('nc'), fk = eio(prog(t, tLanz, tCamp + .1));
  nc.style.opacity = t < tLanz ? 0 : clamp(prog(t, tLanz, tLanz + .1));
  nc.style.left = lerp(10, 490, fk) + 'px'; nc.style.top = (lerp(150, 150, fk) - Math.sin(fk * Math.PI) * 120) + 'px';
  nc.style.transform = `scale(${1 + Math.sin(fk * Math.PI) * .08}) rotate(${Math.sin(fk * Math.PI) * 4}deg)`;
  const land = t > tCamp + .1;
  nc.style.borderColor = land ? 'rgba(95,227,165,.7)' : 'rgba(255,255,255,.08)';
  const lh = eout(prog(t, tLikes, tLikes + .45)), lc = eout(prog(t, tComs, tComs + .45));
  $('nch').textContent = lh > 0 ? fmtK(1200 * lh) : '0'; $('ncc').textContent = lc > 0 ? Math.round(86 * lc) : '0';
  $('nch').parentNode.style.transform = `scale(${1 + Math.sin(prog(t, tLikes + .3, tLikes + .6) * Math.PI) * .25})`;
  $('ncc').parentNode.style.transform = `scale(${1 + Math.sin(prog(t, tComs + .3, tComs + .6) * Math.PI) * .25})`;
  $('nch').parentNode.style.transformOrigin = $('ncc').parentNode.style.transformOrigin = '0 50%';
  // flying hearts/bubbles
  let fly = document.getElementById('fly'); if (!fly) { fly = document.createElement('div'); fly.id = 'fly'; fly.style.cssText = 'position:absolute;inset:0;pointer-events:none'; u2.appendChild(fly); }
  let fh = '';
  [[tLikes, HEART, 46], [tComs, BUBBLE, 160]].forEach(([tt, ic, x0]) => {
    for (let j = 0; j < 5; j++) {
      const k = prog(t, tt - .3 + j * .05, tt + .1 + j * .05); if (k <= 0 || k >= 1) continue;
      const e = eio(k), x = lerp(10 + x0, 490 + x0, e), y = 150 + 330 - Math.sin(e * Math.PI) * (140 + j * 25);
      fh += `<div style="position:absolute;left:${x}px;top:${y}px;transform:scale(${1.2 - Math.abs(e - .5)})">${ic}</div>`;
    }
  });
  fly.innerHTML = fh;
}

// ---------- freeze ----------
const frz = document.createElement('div'); frz.id = 'frz';
frz.innerHTML = `<div id="frzs" style="position:absolute;left:50%;top:52%;width:250px;height:250px;margin:-125px 0 0 -125px;border-radius:44px;background:#d9443a;box-shadow:0 20px 80px rgba(217,68,58,.6);display:flex;align-items:center;justify-content:center;gap:34px;border:6px solid #ffb1a8"><i style="width:44px;height:130px;border-radius:10px;background:#fff"></i><i style="width:44px;height:130px;border-radius:10px;background:#fff"></i></div>`;
document.body.insertBefore(frz, document.getElementById('vig'));
const tEsp = T('espera');
function freezeFrame(t) {
  const on = prog(t, tEsp - .05, tEsp + .05) * (1 - prog(t, 3.75, 3.95));
  frz.style.opacity = on;
  canvas.style.filter = on > 0 ? `grayscale(${on}) brightness(${1 - .35 * on})` : 'none';
  const k = eout(prog(t, tEsp - .05, tEsp + .2));
  $('frzs').style.transform = `rotate(-6deg) scale(${lerp(2.2, 1, k) + Math.sin(prog(t, tEsp + .2, tEsp + .45) * Math.PI) * .05})`;
}

// ---------- CTA ----------
const cta = $('cta');
cta.innerHTML = `<div class="bub" id="bub"><div class="av" style="width:64px;height:64px"></div>ESCALAR
<svg class="heart" id="heart" viewBox="0 0 40 40"><path d="M20 35 C6 25 2 18 6 11 C9 6 16 6 20 12 C24 6 31 6 34 11 C38 18 34 25 20 35Z" fill="#ff4d6d"/></svg></div>
<div class="bar"><div class="av"></div><div class="inp" id="inp"></div><div class="send" id="send"><svg width="44" height="44" viewBox="0 0 24 24"><path d="M3 12 L21 3 L14 21 L11 13Z" fill="#fff"/></svg></div></div>`;
function ctaFrame(t) {
  const a = eback(prog(t, tCom - .1, tCom + .35));
  cta.style.opacity = clamp(prog(t, tCom - .1, tCom + .15));
  cta.style.transform = `translateY(${(1 - a) * 160}px)`;
  const word = 'ESCALAR', typed = word.slice(0, Math.floor(clamp((t - tEsc + .05) / .5) * word.length + .001));
  const sent = t > tExp - .1;
  $('inp').innerHTML = sent ? '<span class="ph">Añade un comentario…</span>' : typed ? typed + (Math.floor(t * 4) % 2 ? '|' : '') : '<span class="ph">Añade un comentario…</span>';
  $('send').style.transform = `scale(${1 + Math.sin(prog(t, tExp - .1, tExp + .1) * Math.PI) * .25})`;
  const bk = eback(prog(t, tExp - .05, tExp + .35));
  const bub = $('bub'); bub.style.opacity = clamp(bk * 2); bub.style.transform = `translateY(${(1 - bk) * 60}px) scale(${lerp(.6, 1, clamp(bk))})`;
  bub.style.transformOrigin = '0 100%';
  $('heart').style.transform = `scale(${Math.max(0, eback(prog(t, tComo - .1, tComo + .2)))})`;
}

// ---------- 3D ----------
function shotAt(t) { for (const s of shots) if (t >= s.a && t <= s.b) return s; return null; }
function frame3D(t) {
  const t3 = (t > 3.2 && t < 3.8) ? 3.2 : t;
  const s = shotAt(t3);
  if (!s) return false;
  const u = s.ease(prog(t3, s.a, s.b));
  camera.position.copy(s.pc.getPoint(u)); camera.lookAt(s.lc.getPoint(u));
  poseArms(p1, t3); poseArms(p2, t3);
  qSpr.material.opacity = 0;
  arcs.forEach(a => {
    const k = eio(prog(t, 22.1 + a.delay, 23.3 + a.delay));
    a.mesh.visible = k > 0; a.head.visible = k > 0 && k < 1;
    const segs = 120, idx = a.geo.index.count / segs;
    a.geo.setDrawRange(0, Math.floor(segs * k) * idx);
    a.head.position.copy(a.curve.getPoint(k));
  });
  cityOverlays.forEach((m, i) => m.opacity = eout(prog(t, 22.5 + i * .3, 23.3 + i * .3)));
  composer.render();
  return true;
}
window.renderAt = (t) => {
  const has3D = frame3D(t);
  canvas.style.opacity = has3D ? 1 : 0;
  uiFrame(t); freezeFrame(t); ctaFrame(t); caption(t);
  return true;
};
window.READY = true;
