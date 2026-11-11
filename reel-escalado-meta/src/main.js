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

// ---------- camera paths (reel 2 v2) ----------
const shots = [
  { a: 0, b: 3.2, ease: x => 1 - Math.pow(1 - x, 1.8),
    pos: [V(52, 92, 118), V(20, 40, 50), V(6, 17, 12), V(4.6, Y0 + 2.05, 1.4), V(5.15, Y0 + 1.8, -1.55)],
    look: [V(0, 12, 0), V(4, Y0 + 2, 0), V(4.6, Y0 + 2, -1), V(4.6, Y0 + 1.6, -3.5), V(4.5, Y0 + 1.35, -4.3)] },
  { a: 3.8, b: 4.7, ease: x => x * x,
    pos: [V(5.15, Y0 + 1.8, -1.55), V(4.75, Y0 + 1.55, -3.0), V(4.6, Y0 + 1.43, -3.85)],
    look: [V(4.5, Y0 + 1.35, -4.3), V(4.6, Y0 + 1.42, -4.3), V(4.6, Y0 + 1.42, -4.3)] },
];
shots.forEach(s => { s.pc = new THREE.CatmullRomCurve3(s.pos, false, 'centripetal'); s.lc = new THREE.CatmullRomCurve3(s.look, false, 'centripetal'); });
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

// ---------- times ----------
const tEsp = T('espera'), tDos = T('dos'), tCosas = T('cosas'), tAnun = T('anuncio', 10), tDia = T('día'), tY = T('y', 28), tEst = T('estable'),
  tNo = T('no', 30), tOrig = T('original'), tCopia = T('copia'), tPub = T('publicación'), tLanz = T('lánzalo'), tCamp = T('campaña'), tNueva = T('nueva'),
  tAsi = T('así'), tLikes = T('likes'), tComs = T('comentarios'), tArr = T('arriesgas'), tGan2 = T('ganador', 50),
  tCom = T('comenta'), tEsc = T('escalar'), tExp = T('explico'), tComo = T('cómo');
const OPEN1 = tDia + .12, OPEN2 = tEst + .02, DOOR = OPEN2 + .12;

// ---------- css ----------
const css = document.createElement('style');
css.textContent = `
#ui{background:radial-gradient(ellipse at 50% 62%,#1d2645 0%,#0c1122 48%,#04060c 100%)!important}
#root{position:absolute;inset:0;overflow:hidden}
#grid{position:absolute;left:-540px;right:-540px;top:1180px;height:1400px;transform-origin:50% 0;transform:perspective(700px) rotateX(72deg);
 background-image:linear-gradient(rgba(120,150,255,.22) 2px,transparent 2px),linear-gradient(90deg,rgba(120,150,255,.22) 2px,transparent 2px);background-size:90px 90px;
 -webkit-mask-image:linear-gradient(180deg,rgba(0,0,0,.9),transparent 70%)}
.L{position:absolute}
.chipc{position:absolute;left:50%;top:500px;transform:translateX(-50%);padding:14px 30px;border-radius:40px;font-weight:900;font-size:30px;letter-spacing:2px;color:#fff;white-space:nowrap;display:flex;gap:14px;align-items:center}
.toast{position:absolute;left:130px;width:820px;height:100px;border-radius:26px;background:rgba(245,247,250,.97);box-shadow:0 18px 40px rgba(0,0,0,.45);display:flex;align-items:center;gap:22px;padding:0 26px;box-sizing:border-box}
.toast .ic{width:60px;height:60px;border-radius:16px;background:linear-gradient(135deg,#f7b733,#fc4a1a);display:flex;align-items:center;justify-content:center;color:#fff;font-weight:900;font-size:36px}
.toast .tx{flex:1;color:#101622}.toast .tx b{display:block;font-size:30px;font-weight:900}.toast .tx span{font-size:22px;color:#6b7686;font-weight:700}
.toast .am{color:#16a864;font-weight:900;font-size:36px}
.lock{position:absolute;width:120px;height:150px}
.post{position:absolute;width:520px;height:640px;border-radius:34px;background:#111a2c;border:3px solid rgba(255,255,255,.1);box-shadow:0 30px 80px rgba(0,0,0,.6);overflow:hidden}
.post .hd{position:absolute;left:24px;top:22px;display:flex;align-items:center;gap:16px;color:#fff;font-weight:900;font-size:28px}
.post .hd i{width:58px;height:58px;border-radius:50%;background:linear-gradient(135deg,#f2a53a,#e2563d)}
.post .hd span{display:block;font-size:20px;color:#8b97ad;font-weight:700}
.post .im{position:absolute;left:0;right:0;top:104px;height:400px;background:linear-gradient(135deg,#d39a3c,#7a4b18);display:flex;align-items:center;justify-content:center}
.post .en{position:absolute;left:28px;top:528px;display:flex;gap:34px;color:#fff;font-weight:900;font-size:36px;align-items:center}
.post .en span{display:flex;align-items:center;gap:12px}
.ribbon{position:absolute;left:-10px;top:120px;padding:10px 26px 10px 30px;background:#21c07a;color:#fff;font-weight:900;font-size:28px;letter-spacing:2px;border-radius:0 12px 12px 0;box-shadow:0 8px 24px rgba(33,192,122,.5)}
.key{position:absolute;height:120px;border-radius:22px;background:linear-gradient(180deg,#f4f6fb,#cdd3e0);color:#1b2233;font-weight:900;font-size:46px;display:flex;align-items:center;justify-content:center;box-shadow:0 14px 0 #8d96aa,0 24px 40px rgba(0,0,0,.5)}
.cb{position:absolute;display:flex;align-items:center;gap:16px;padding:16px 28px 16px 16px;border-radius:40px;background:rgba(255,255,255,.96);color:#121a26;font-weight:900;font-size:34px;box-shadow:0 14px 34px rgba(0,0,0,.4);white-space:nowrap}
.cb i{width:50px;height:50px;border-radius:50%}
`;
document.head.appendChild(css);

// ---------- build DOM ----------
const $ = id => document.getElementById(id);
const ui = $('ui'); $('panel').style.display = 'none';
const HEART = (s = 40) => `<svg viewBox="0 0 40 40" width="${s}" height="${s}"><path d="M20 35 C6 25 2 18 6 11 C9 6 16 6 20 12 C24 6 31 6 34 11 C38 18 34 25 20 35Z" fill="#ff4d6d"/></svg>`;
const BUB = (s = 40) => `<svg viewBox="0 0 40 40" width="${s}" height="${s}"><path d="M6 8 h28 a4 4 0 0 1 4 4 v14 a4 4 0 0 1 -4 4 h-16 l-8 7 v-7 h-4 a4 4 0 0 1 -4 -4 v-14 a4 4 0 0 1 4 -4z" fill="#5fd3c9"/></svg>`;
const CHECK = (s = 40, c = '#fff') => `<svg viewBox="0 0 24 24" width="${s}" height="${s}"><path d="M5 12.5 L10 17 L19 7" fill="none" stroke="${c}" stroke-width="3.4" stroke-linecap="round" stroke-linejoin="round"/></svg>`;
const PLAY = '<svg viewBox="0 0 40 40" width="110" height="110"><circle cx="20" cy="20" r="19" fill="rgba(255,255,255,.22)"/><path d="M15 11 L30 20 L15 29Z" fill="#fff"/></svg>';
const lockSvg = (n) => `<svg viewBox="0 0 120 150" width="120" height="150"><path id="sk${n}" d="M28 70 V44 a32 32 0 0 1 64 0 V70" fill="none" stroke="#c9d3e6" stroke-width="14" stroke-linecap="round"/>
 <rect id="lb${n}" x="10" y="64" width="100" height="82" rx="18" fill="#d9443a"/><text x="60" y="122" text-anchor="middle" font-family="N" font-weight="900" font-size="46" fill="#fff">${n}</text></svg>`;
const post = (id, extra = '') => `<div class="post" id="${id}"><div class="hd"><i></i><div>Tu marca<span>Patrocinado</span></div></div><div class="im">${PLAY}</div>
 <div class="en"><span>${HEART(44)}<b id="${id}h">1.248</b></span><span>${BUB(44)}<b id="${id}c">86</b></span></div>${extra}</div>`;
const SALES = [29, 29, 58, 29, 29, 58, 29];
const CPA = [4.9, 4.7, 4.8, 5.0, 4.8, 4.7, 4.8];
const root = document.createElement('div'); root.id = 'root'; ui.appendChild(root);
root.innerHTML = `
<div id="grid"></div>
<div id="vaultW" class="L" style="left:220px;top:1090px;width:640px;height:640px">
 <div id="rays" class="L" style="left:-500px;top:-500px;width:1640px;height:1640px;border-radius:50%;opacity:0;background:repeating-conic-gradient(from 0deg,rgba(255,214,140,.35) 0deg 6deg,transparent 6deg 18deg);-webkit-mask-image:radial-gradient(circle,#000 20%,transparent 65%)"></div>
 <svg class="L" width="640" height="640" viewBox="0 0 640 640"><defs><radialGradient id="gl"><stop offset="0" stop-color="#fff6dc"/><stop offset=".45" stop-color="#ffc861"/><stop offset="1" stop-color="#7a4a10"/></radialGradient></defs>
  <circle cx="320" cy="320" r="300" fill="#1a2238" stroke="#3a4766" stroke-width="14"/>
  ${Array.from({ length: 16 }, (_, i) => { const a = i / 16 * Math.PI * 2; return `<circle cx="${320 + Math.cos(a) * 280}" cy="${320 + Math.sin(a) * 280}" r="9" fill="#5d6b8f"/>`; }).join('')}
  <circle cx="320" cy="320" r="255" fill="url(#gl)"/></svg>
 <div id="door" class="L" style="left:65px;top:65px;width:510px;height:510px;transform-origin:0 50%">
  <svg width="510" height="510" viewBox="0 0 510 510"><defs><linearGradient id="dg" x1="0" y1="0" x2="1" y2="1"><stop offset="0" stop-color="#34405f"/><stop offset="1" stop-color="#161d30"/></linearGradient></defs>
   <circle cx="255" cy="255" r="253" fill="url(#dg)" stroke="#f2a53a" stroke-width="5"/>
   <circle cx="255" cy="255" r="200" fill="none" stroke="#45547a" stroke-width="6" stroke-dasharray="14 10"/>
   <g id="wheel"><circle cx="255" cy="255" r="70" fill="none" stroke="#c9d3e6" stroke-width="12"/>
    ${[0, 60, 120].map(a => `<line x1="${255 - Math.cos(a * Math.PI / 180) * 110}" y1="${255 - Math.sin(a * Math.PI / 180) * 110}" x2="${255 + Math.cos(a * Math.PI / 180) * 110}" y2="${255 + Math.sin(a * Math.PI / 180) * 110}" stroke="#c9d3e6" stroke-width="16" stroke-linecap="round"/>`).join('')}
    <circle cx="255" cy="255" r="28" fill="#f2a53a"/></g>
   <text x="255" y="430" text-anchor="middle" font-family="N" font-weight="900" font-size="44" letter-spacing="8" fill="#f2a53a">ESCALAR</text></svg>
 </div>
 <div class="lock" id="lk1" style="left:105px;top:20px">${lockSvg(1)}</div>
 <div class="lock" id="lk2" style="left:415px;top:20px">${lockSvg(2)}</div>
</div>
<div class="chipc" id="c1" style="background:#2b3654;border:2px solid rgba(255,255,255,.15)">CONDICIÓN 1 · <span id="c1t">VENTAS CONSTANTES</span></div>
<div class="chipc" id="c2" style="background:#2b3654;border:2px solid rgba(255,255,255,.15)">CONDICIÓN 2 · COSTO ESTABLE</div>
<div id="toasts">${SALES.map((v, i) => `<div class="toast" id="to${i}"><div class="ic">$</div><div class="tx"><b>¡Nueva venta!</b><span>Día ${i + 1} · Anuncio B</span></div><div class="am">+$${v}</div></div>`).join('')}</div>
<div id="gauge" class="L" style="left:140px;top:560px;width:800px;height:420px">
 <svg width="800" height="420" viewBox="0 0 800 420">
  <path d="M90 380 A310 310 0 0 1 247 111" fill="none" stroke="#f2a53a" stroke-width="44"/>
  <path d="M247 111 A310 310 0 0 1 553 111" fill="none" stroke="#21c07a" stroke-width="44"/>
  <path d="M553 111 A310 310 0 0 1 710 380" fill="none" stroke="#e5484d" stroke-width="44"/>
  <text x="400" y="60" text-anchor="middle" font-family="N" font-weight="900" font-size="26" fill="#7ee2b0" letter-spacing="3">OBJETIVO</text>
  <g id="needle"><line x1="400" y1="380" x2="400" y2="120" stroke="#fff" stroke-width="12" stroke-linecap="round"/><circle cx="400" cy="380" r="26" fill="#fff"/></g>
  <text id="gv" x="400" y="300" text-anchor="middle" font-family="N" font-weight="900" font-size="96" fill="#fff">$4,80</text>
  <text id="gd" x="400" y="345" text-anchor="middle" font-family="N" font-weight="800" font-size="28" fill="#8b97ad" letter-spacing="3">COSTO POR RESULTADO · DÍA 1</text>
 </svg></div>
<div id="flash" class="L" style="inset:0;background:#ffe9b8;opacity:0"></div>
<div id="sceneB" class="L" style="inset:0">
 <div id="portal" class="L" style="left:560px;top:860px;width:460px;height:580px;border-radius:40px;border:5px dashed #3ee08f;box-shadow:0 0 60px rgba(62,224,143,.35),inset 0 0 60px rgba(62,224,143,.2)"></div>
 <div id="trail"></div>
 <div id="wW" class="L" style="left:280px;top:640px;width:520px;height:640px">
  ${post('wc', '<div class="ribbon">GANADOR</div>')}
  <div id="shield" class="L" style="left:-26px;top:-26px;width:572px;height:692px;border-radius:52px;border:5px solid rgba(140,225,255,.9);background:linear-gradient(135deg,rgba(255,255,255,.28),rgba(255,255,255,.04) 45%,rgba(140,225,255,.12));box-shadow:0 0 60px rgba(140,225,255,.5)">
   <div class="L" style="left:50%;top:-34px;transform:translateX(-50%);padding:10px 26px;border-radius:30px;background:#2a8fd6;color:#fff;font-weight:900;font-size:28px;letter-spacing:2px;white-space:nowrap">PROTEGIDO</div></div>
  <div id="medal" class="L" style="left:380px;top:-70px;width:170px;height:170px">
   <svg width="170" height="170" viewBox="0 0 170 170"><path d="M55 100 L35 165 L60 150 L75 170 L85 110Z M115 100 L135 165 L110 150 L95 170 L85 110Z" fill="#d9443a"/>
    <circle cx="85" cy="70" r="62" fill="#f2c14e" stroke="#fff3c4" stroke-width="6"/><path d="M85 34 L95 58 L121 60 L101 77 L107 103 L85 89 L63 103 L69 77 L49 60 L75 58Z" fill="#fff8de"/></svg></div>
 </div>
 <div id="clone" class="L" style="width:520px;height:640px">${post('nc')}</div>
 <div id="x2" class="L" style="left:540px;top:1400px;transform:translateX(-50%);padding:24px 50px;border-radius:50px;background:#f2a53a;color:#1a1206;font-weight:900;font-size:50px;white-space:nowrap">x2 PRESUPUESTO</div>
 <svg id="hand" class="L" width="130" height="150" viewBox="0 0 26 30"><path d="M9 2 a2 2 0 0 1 4 0 v10 l1-1 a2 2 0 0 1 3 1 a2 2 0 0 1 3 1 a2 2 0 0 1 3 1.5 v7 c0 4-3 7.5-7 7.5h-3c-3 0-4.5-1.5-6-4l-4-7a2 2 0 0 1 3.4-2L9 19Z" fill="#fff" stroke="#1b2233" stroke-width="1.4"/></svg>
 <div id="nox" class="L" style="left:390px;top:1290px;width:300px;height:300px"><svg width="300" height="300" viewBox="0 0 100 100"><circle cx="50" cy="50" r="42" fill="none" stroke="#ff3b3b" stroke-width="10"/><line x1="22" y1="78" x2="78" y2="22" stroke="#ff3b3b" stroke-width="10" stroke-linecap="round"/></svg></div>
 <div id="idb" class="L" style="left:60px;top:1130px;width:960px;text-align:center">
  <div style="color:#8b97ad;font-weight:900;font-size:30px;letter-spacing:5px">ID DE PUBLICACIÓN</div>
  <div style="display:inline-block;margin-top:14px;position:relative;font-family:monospace,N;font-weight:900;font-size:80px;color:#fff;letter-spacing:2px"><span id="sel" style="position:absolute;left:-10px;top:0;bottom:0;background:rgba(61,125,255,.55);border-radius:8px;width:0"></span><span id="idt" style="position:relative"></span></div>
 </div>
 <div id="kctrl" class="key L" style="left:310px;top:1420px;width:240px">CTRL</div>
 <div id="kc" class="key L" style="left:590px;top:1420px;width:160px">C</div>
 <div id="copied" class="L" style="left:540px;top:1620px;transform:translateX(-50%);padding:14px 30px;border-radius:30px;background:#21c07a;color:#fff;font-weight:900;font-size:34px;display:flex;gap:10px;align-items:center;white-space:nowrap">${CHECK(34)}ID copiado</div>
 <div id="pstamp" class="L" style="left:790px;top:800px;padding:14px 30px;border-radius:14px;background:#21c07a;color:#fff;font-weight:900;font-size:40px;letter-spacing:3px;border:4px solid #b9f5d8;white-space:nowrap;box-shadow:0 10px 40px rgba(33,192,122,.6)">CAMPAÑA NUEVA</div>
 <div id="ring" class="L" style="border-radius:50%;border:8px solid #3ee08f"></div>
 <div id="river"></div>
 <div id="snips"></div>
</div>
<div id="ctaS" class="L" style="inset:0">
 <div class="L" style="left:-200px;top:500px;width:1480px;height:1100px;background:radial-gradient(ellipse,rgba(242,165,58,.3),transparent 60%)"></div>
 ${'ESCALAR'.split('').map((c, i) => `<div class="key L" id="ek${i}" style="left:${78 + i * 134}px;top:900px;width:120px">${c}</div>`).join('')}
 <div id="flood"></div>
</div>`;
// particles on rain canvas
const rain = $('rain').getContext('2d');
function hash(a, b) { let h = (a * 374761393 + b * 668265263) | 0; h = (h ^ (h >>> 13)) * 1274126177; return ((h ^ (h >>> 16)) >>> 0) / 4294967295; }
function drawDust(t, gold) {
  rain.clearRect(0, 0, W, H);
  for (let i = 0; i < 90; i++) {
    const x = hash(i, 1) * W, y0 = hash(i, 2) * H, sp = 20 + hash(i, 3) * 50, y = ((y0 - t * sp) % H + H) % H, r = 1.5 + hash(i, 4) * 3;
    rain.fillStyle = `rgba(${gold ? '255,200,120' : '150,175,255'},${.15 + hash(i, 5) * .45})`;
    rain.beginPath(); rain.arc(x, y, r, 0, 7); rain.fill();
  }
}
const shakeAt = (t, list) => { let s = 0; for (const [a, m] of list) { const k = prog(t, a, a + .35); if (k > 0 && k < 1) s += m * (1 - k) * Math.sin(k * 60); } return s; };
const pop = (t, a, d = .3) => eback(prog(t, a, a + d));
const px = v => v + 'px';
const COMMENTS = ['¡Lo quiero!', '¿Precio?', 'Info, por favor'];
const AV = ['#f2a53a', '#5fd3c9', '#e2563d', '#8b7cf6', '#21c07a', '#3d7dff'];

function uiFrame(t) {
  const inA = prog(t, 4.25, 4.6);
  ui.style.opacity = inA;
  if (inA <= 0) return;
  const shk = shakeAt(t, [[OPEN1, 10], [OPEN2, 10], [DOOR + .2, 18], [tNo, 22], [tOrig, 16], [tCamp + .1, 14], [tGan2, 10]]);
  root.style.transform = `translate(${shk}px,${shk * .6}px) scale(${lerp(1.25, 1, eout(inA))})`;
  const inB = t > DOOR + .3, inC = t > 21.6;
  drawDust(t, inB && !inC);
  $('grid').style.backgroundPosition = `0 ${t * 60}px`;
  // ---------- scene A: vault ----------
  const vaultZoom = eio(prog(t, DOOR + .12, DOOR + .45));
  const vW = $('vaultW');
  const va = pop(t, 4.3, .45);
  vW.style.opacity = clamp(va * 1.5) * (1 - prog(t, DOOR + .3, DOOR + .45));
  vW.style.transform = `scale(${Math.max(0, va) * lerp(1, 4.5, vaultZoom)})`;
  vW.style.transformOrigin = '50% 50%';
  $('grid').style.opacity = 1 - prog(t, DOOR + .3, DOOR + .6) + prog(t, 21.6, 22) * 0;
  [[1, tDos, OPEN1], [2, tCosas, OPEN2]].forEach(([n, ta, to]) => {
    const l = $('lk' + n), a = pop(t, ta - .05, .35), o = eout(prog(t, to, to + .25));
    l.style.transform = `scale(${Math.max(0, a) * (1 + Math.sin(prog(t, to, to + .3) * Math.PI) * .2)}) rotate(${Math.sin(prog(t, to, to + .4) * Math.PI * 3) * 8 * (1 - prog(t, to, to + .4))}deg)`;
    l.style.opacity = clamp(a * 2) * (1 - prog(t, DOOR - .1, DOOR + .1));
    $('sk' + n).setAttribute('transform', `translate(${o * 26} ${-o * 24}) rotate(${o * 28} 92 70)`);
    $('lb' + n).setAttribute('fill', o > .3 ? '#21c07a' : '#d9443a');
    l.style.filter = o > .3 ? 'drop-shadow(0 0 24px rgba(33,192,122,.9))' : 'drop-shadow(0 0 18px rgba(217,68,58,.6))';
  });
  $('wheel').setAttribute('transform', `rotate(${eio(prog(t, OPEN2, DOOR + .1)) * 360} 255 255)`);
  $('door').style.transform = `perspective(1400px) rotateY(${-eio(prog(t, DOOR, DOOR + .3)) * 105}deg)`;
  $('rays').style.opacity = prog(t, DOOR, DOOR + .3);
  $('rays').style.transform = `rotate(${t * 20}deg)`;
  $('flash').style.opacity = Math.sin(prog(t, DOOR + .15, DOOR + .42) * Math.PI) * .9 + Math.sin(prog(t, 21.45, 21.85) * Math.PI) * .5;
  // condition 1: toasts
  const c1 = $('c1'), c1a = pop(t, tAnun - .25, .3), c1o = 1 - prog(t, tY - .3, tY - .05);
  c1.style.opacity = clamp(c1a * 2) * c1o; c1.style.transform = `translateX(-50%) scale(${Math.max(0, c1a)})`;
  const done1 = t > OPEN1;
  c1.style.background = done1 ? '#1d9a62' : '#2b3654';
  $('c1t').innerHTML = done1 ? `7/7 DÍAS VENDIENDO ${CHECK(30)}` : 'VENTAS CONSTANTES';
  const sp = (tDia + .1 - tAnun) / SALES.length;
  SALES.forEach((v, i) => {
    const ta = tAnun + i * sp, el = $('to' + i), a = eout(prog(t, ta, ta + .22));
    const newer = SALES.reduce((n, _, j) => n + (j > i && t > tAnun + j * sp ? eout(prog(t, tAnun + j * sp, tAnun + j * sp + .22)) : 0), 0);
    const y = 575 + newer * 112;
    const fadeOld = 1 - clamp(newer - 2.2);
    el.style.top = px(y - (1 - a) * 140);
    el.style.opacity = (t < ta ? 0 : a) * fadeOld * c1o;
    el.style.transform = `scale(${lerp(.9, 1, a) * (1 - newer * .03)})`;
  });
  // condition 2: gauge
  const c2 = $('c2'), c2a = pop(t, tY - .1, .3), c2o = 1 - prog(t, DOOR - .1, DOOR + .15);
  c2.style.opacity = clamp(c2a * 2) * c2o; c2.style.transform = `translateX(-50%) scale(${Math.max(0, c2a)})`;
  c2.style.background = t > OPEN2 ? '#1d9a62' : '#2b3654';
  const g = $('gauge'), ga = pop(t, tY, .4);
  g.style.opacity = clamp(ga * 2) * c2o; g.style.transform = `scale(${Math.max(0, ga)})`; g.style.transformOrigin = '50% 90%';
  const dk = clamp((t - tY - .1) / (tEst - tY - .1)), di = Math.min(6, Math.floor(dk * 7));
  const val = t > OPEN2 ? 4.8 : CPA[di];
  const ang = (val - 4.85) * 60 + Math.sin(t * 9) * 2.5 * (t > OPEN2 ? .3 : 1) - (1 - clamp(ga)) * 70;
  $('needle').setAttribute('transform', `rotate(${ang} 400 380)`);
  $('gv').textContent = '$' + val.toFixed(2).replace('.', ',');
  $('gv').setAttribute('fill', t > OPEN2 ? '#5fe3a5' : '#fff');
  $('gd').textContent = t > OPEN2 ? 'ESTABLE 7 DÍAS ✓' : `COSTO POR RESULTADO · DÍA ${di + 1}`;
  $('gd').setAttribute('fill', t > OPEN2 ? '#5fe3a5' : '#8b97ad');
  // ---------- scene B ----------
  const B = $('sceneB'); B.style.opacity = inB ? 1 - prog(t, 21.4, 21.7) : 0;
  B.style.transform = `scale(${lerp(1, .8, eio(prog(t, 21.4, 21.7)))})`;
  if (inB && t < 21.75) {
    const wW = $('wW'), wa = pop(t, DOOR + .3, .35);
    const mv = eio(prog(t, tCopia - .05, tCopia + .45));
    const back = eio(prog(t, tArr - .25, tArr + .25));
    const sc = Math.max(0, wa) * lerp(1, .58, mv) * lerp(1, 1.12 / .58 * .58 / .58 > 0 ? 1 : 1, 0);
    let cx = lerp(540, 290, mv), cy = lerp(960, 760, mv);
    let s2 = lerp(1, .58, mv);
    cx = lerp(cx, 290, back); cy = lerp(cy, 900, back); s2 = lerp(s2, .78, back);
    wW.style.left = px(cx - 260); wW.style.top = px(cy - 320);
    wW.style.transform = `scale(${Math.max(0, wa) * s2})`;
    wW.style.opacity = clamp(wa * 2);
    // x2 + hand + no
    const x2 = $('x2'); x2.style.opacity = clamp(prog(t, DOOR + .3, DOOR + .45)) * (1 - prog(t, tOrig + .3, tOrig + .6));
    x2.style.filter = t > tNo ? 'grayscale(.7) brightness(.6)' : 'none';
    x2.style.transform = `translateX(-50%) scale(${t > tNo ? .95 : 1 + Math.sin(t * 8) * .03})`;
    const hk = eio(prog(t, DOOR + .7, tNo - .02));
    const hand = $('hand'); hand.style.left = px(lerp(900, 600, hk)); hand.style.top = px(lerp(1750, 1440, hk) + (t > tNo ? eout(prog(t, tNo, tNo + .3)) * 260 : 0));
    hand.style.opacity = 0;
    const nx = $('nox'), na = eout(prog(t, tNo + .06, tNo + .24));
    nx.style.opacity = (t > tNo + .06 ? 1 : 0) * (1 - prog(t, tOrig + .3, tOrig + .6));
    nx.style.transform = `scale(${lerp(2.4, 1, na)}) rotate(${(1 - na) * -30}deg)`;
    root.style.boxShadow = '';
    // shield
    const sh = $('shield'), sa = eout(prog(t, tOrig - .05, tOrig + .25));
    sh.style.opacity = t > tOrig - .05 ? clamp(sa * 3) : 0;
    sh.style.transform = `translateY(${(1 - sa) * -500}px) scale(${1 + Math.sin(prog(t, tOrig + .25, tOrig + .5) * Math.PI) * .04})`;
    // ID typing + keys
    const ida = prog(t, tCopia + .2, tCopia + .4), ido = 1 - prog(t, tLanz - .15, tLanz + .1);
    const idb = $('idb'); idb.style.opacity = ida * ido; idb.style.transform = `translateY(${(1 - eout(ida)) * 40}px)`;
    const ID = '1029384756_88', nch = Math.floor(clamp((t - tCopia - .25) / .55) * ID.length);
    $('idt').textContent = ID.slice(0, nch) + (nch < ID.length && Math.floor(t * 8) % 2 ? '|' : '');
    $('sel').style.width = (eout(prog(t, tPub - .2, tPub)) * 100) + '%';
    [['kctrl', 0], ['kc', .06]].forEach(([id, d]) => {
      const k = $(id), a = pop(t, tCopia + .5 + d, .3), pr = Math.sin(prog(t, tPub + d, tPub + d + .18) * Math.PI);
      k.style.opacity = clamp(a * 2) * ido; k.style.transform = `translateY(${(1 - clamp(a)) * 60 + pr * 12}px) scale(${Math.max(0, a)})`;
      k.style.boxShadow = `0 ${14 - pr * 12}px 0 #8d96aa,0 24px 40px rgba(0,0,0,.5)`;
      k.style.background = pr > .3 ? 'linear-gradient(180deg,#ffe3a8,#f2a53a)' : 'linear-gradient(180deg,#f4f6fb,#cdd3e0)';
    });
    const cpd = $('copied'), ca = pop(t, tPub + .12, .3); cpd.style.opacity = clamp(ca * 2) * ido; cpd.style.transform = `translateX(-50%) scale(${Math.max(0, ca)})`;
    // portal + clone launch
    const po = $('portal'), pa = pop(t, tLanz - .1, .35);
    po.style.opacity = clamp(pa * 2) * (1 - prog(t, tArr - .3, tArr)); po.style.transform = `scale(${Math.max(0, pa)})`;
    po.style.borderStyle = t > tCamp + .1 ? 'solid' : 'dashed';
    const lk = eio(prog(t, tLanz + .15, tCamp + .1));
    const pos = k => [lerp(290, 790, k), lerp(760, 1150, k) - Math.sin(k * Math.PI) * 260];
    const [lx, ly] = pos(lk);
    const cl = $('clone'), landed = t > tCamp + .1;
    const cs = lerp(.58, .78, eio(prog(t, tArr - .25, tArr + .25)));
    const [fx, fy] = landed ? [lerp(790, 790, 0), lerp(1150, 900, eio(prog(t, tArr - .25, tArr + .25)))] : [lx, ly];
    cl.style.left = px(fx - 260); cl.style.top = px(fy - 320);
    cl.style.transform = `scale(${cs * (1 + Math.sin(lk * Math.PI) * .12)}) rotate(${Math.sin(lk * Math.PI) * 10}deg)`;
    cl.style.opacity = t > tLanz + .15 ? 1 : 0;
    let tr = '';
    if (lk > 0 && lk < 1) for (let j = 1; j <= 6; j++) {
      const [gx, gy] = pos(clamp(lk - j * .05));
      tr += `<div class="L" style="left:${gx - 150}px;top:${gy - 185}px;width:300px;height:370px;border-radius:30px;background:rgba(242,190,90,${.28 - j * .04});filter:blur(${j * 2}px)"></div>`;
    }
    $('trail').innerHTML = tr;
    const ring = $('ring'), rk = prog(t, tCamp + .1, tCamp + .6), rr2 = lerp(80, 520, eout(rk));
    ring.style.opacity = rk > 0 && rk < 1 ? 1 - rk : 0; ring.style.left = px(790 - rr2 / 2); ring.style.top = px(1150 - rr2 / 2); ring.style.width = ring.style.height = px(rr2);
    const ps = $('pstamp'), pk = eout(prog(t, tNueva - .05, tNueva + .2));
    ps.style.opacity = t > tNueva - .05 ? clamp(pk * 3) * (1 - prog(t, tArr - .3, tArr)) : 0;
    ps.style.transform = `translateX(-50%) rotate(-6deg) scale(${lerp(2.4, 1, pk)})`;
    // likes/comments counters on clone
    const lh = eout(prog(t, tLikes - .1, tLikes + .6)), lc = eout(prog(t, tComs - .1, tComs + .6));
    $('nch').textContent = Math.round(1248 * lh).toLocaleString('es-ES').replace(/\s/g, '.');
    $('ncc').textContent = Math.round(86 * lc);
    $('nch').parentNode.style.transform = `scale(${1 + Math.sin(prog(t, tLikes + .4, tLikes + .75) * Math.PI) * .3})`;
    $('ncc').parentNode.style.transform = `scale(${1 + Math.sin(prog(t, tComs + .4, tComs + .75) * Math.PI) * .3})`;
    // particle river
    let rv = '';
    for (let j = 0; j < 34; j++) {
      const st = tAsi + .3 + j * .055, k = prog(t, st, st + .75);
      if (k <= 0 || k >= 1) continue;
      const e = eio(k), wob = Math.sin(j * 2.1 + k * 6) * 40;
      const x = lerp(290, 790, e) + wob, y = lerp(780, 1060, e) - Math.sin(e * Math.PI) * (220 + (j % 5) * 30);
      const ic = j % 3 === 2 ? BUB(52) : HEART(52);
      rv += `<div class="L" style="left:${x}px;top:${y}px;transform:scale(${.7 + Math.sin(e * Math.PI) * .6});opacity:${Math.sin(k * Math.PI) * 1.4}">${ic}</div>`;
    }
    $('river').innerHTML = rv;
    let sn = '';
    COMMENTS.forEach((c, j) => {
      const a = pop(t, tComs + .1 + j * .22, .3), o = 1 - prog(t, tArr - .2, tArr + .1);
      if (a <= 0 || o <= 0) return;
      sn += `<div class="cb" style="left:${600 + (j % 2) * 40}px;top:${1460 + j * 100}px;transform:scale(${Math.max(0, a)});opacity:${clamp(a * 2) * o};transform-origin:0 50%"><i style="background:${AV[j]}"></i>${c}</div>`;
    });
    $('snips').innerHTML = sn;
    // medal
    const md = $('medal'), mk = eback(prog(t, tGan2 - .1, tGan2 + .25));
    md.style.opacity = t > tGan2 - .1 ? clamp(mk * 3) : 0;
    md.style.transform = `scale(${Math.max(0, mk) * 1.3}) rotate(${(1 - clamp(mk)) * -40}deg)`;
  }
  // ---------- CTA ----------
  const C = $('ctaS'); C.style.opacity = prog(t, 21.6, 21.85);
  if (t > 21.55) {
    'ESCALAR'.split('').forEach((c, i) => {
      const k = $('ek' + i), a = pop(t, 21.7 + i * .05, .35), pt = tEsc + i * .07, pr = Math.sin(prog(t, pt, pt + .16) * Math.PI), lit = t > pt + .05;
      k.style.transform = `translateY(${(1 - clamp(a)) * 120 + pr * 12}px) scale(${Math.max(0, a)})`;
      k.style.opacity = clamp(a * 2);
      k.style.background = lit ? 'linear-gradient(180deg,#ffe3a8,#f2a53a)' : 'linear-gradient(180deg,#f4f6fb,#cdd3e0)';
      k.style.boxShadow = `0 ${14 - pr * 12}px 0 ${lit ? '#a8681c' : '#8d96aa'},0 24px 40px rgba(0,0,0,.5)${lit ? ',0 0 50px rgba(242,165,58,.6)' : ''}`;
    });
    let fl = '';
    for (let j = 0; j < 16; j++) {
      const st = tExp - .5 + j * .22, k = prog(t, st, st + 1.6);
      if (k <= 0) continue;
      const x = [70, 520, 250, 640, 120, 430][j % 6], y = 1960 - (t - st) * 520;
      if (y < 1080) continue;
      const heart = j === 2 && t > tComo ? `<span style="position:absolute;right:-18px;top:-22px;transform:scale(${Math.max(0, eback(prog(t, tComo, tComo + .25)))})">${HEART(50)}</span>` : '';
      fl += `<div class="cb" style="left:${x}px;top:${y + (j % 4) * 0}px;opacity:${clamp(k * 4) * (1 - prog(1260 - y + 1260, 1260, 1440))};position:absolute"><i style="background:${AV[j % 6]}"></i>ESCALAR${heart}</div>`;
    }
    $('flood').innerHTML = fl;
  }
}

// ---------- freeze ----------
const frz = document.createElement('div'); frz.id = 'frz';
frz.style.cssText = 'position:absolute;inset:0;pointer-events:none;opacity:0;background:rgba(90,10,10,.18)';
frz.innerHTML = `<div id="frzs" style="position:absolute;left:50%;top:52%;width:250px;height:250px;margin:-125px 0 0 -125px;border-radius:44px;background:#d9443a;box-shadow:0 20px 80px rgba(217,68,58,.6);display:flex;align-items:center;justify-content:center;gap:34px;border:6px solid #ffb1a8"><i style="width:44px;height:130px;border-radius:10px;background:#fff"></i><i style="width:44px;height:130px;border-radius:10px;background:#fff"></i></div>`;
document.body.insertBefore(frz, document.getElementById('vig'));
function freezeFrame(t) {
  const on = prog(t, tEsp - .05, tEsp + .05) * (1 - prog(t, 3.75, 3.95));
  frz.style.opacity = on;
  canvas.style.filter = on > 0 ? `grayscale(${on}) brightness(${1 - .35 * on})` : 'none';
  const k = eout(prog(t, tEsp - .05, tEsp + .2));
  $('frzs').style.transform = `rotate(-6deg) scale(${lerp(2.2, 1, k) + Math.sin(prog(t, tEsp + .2, tEsp + .45) * Math.PI) * .05})`;
  const s = shakeAt(t, [[tEsp, 14]]); canvas.style.transform = `translate(${s}px,${s * .5}px)`;
}

// ---------- 3D ----------
function shotAt(t) { for (const s of shots) if (t >= s.a && t <= s.b) return s; return null; }
function frame3D(t) {
  const t3 = (t > 3.2 && t < 3.8) ? 3.2 : t;
  const s = shotAt(t3);
  if (!s || t > 4.7) return false;
  const u = s.ease(prog(t3, s.a, s.b));
  camera.position.copy(s.pc.getPoint(u)); camera.lookAt(s.lc.getPoint(u));
  poseArms(p1, t3); poseArms(p2, t3);
  qSpr.material.opacity = 0;
  composer.render();
  return true;
}
window.renderAt = (t) => {
  const has3D = frame3D(t);
  canvas.style.opacity = has3D ? 1 : 0;
  uiFrame(t); freezeFrame(t); caption(t);
  return true;
};
window.READY = true;
