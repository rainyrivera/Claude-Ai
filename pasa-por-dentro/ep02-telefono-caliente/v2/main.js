import * as THREE from 'three';
import { RoundedBoxGeometry } from 'three/addons/geometries/RoundedBoxGeometry.js';
import { EffectComposer } from 'three/addons/postprocessing/EffectComposer.js';
import { RenderPass } from 'three/addons/postprocessing/RenderPass.js';
import { UnrealBloomPass } from 'three/addons/postprocessing/UnrealBloomPass.js';
import { OutputPass } from 'three/addons/postprocessing/OutputPass.js';
import { RoomEnvironment } from 'three/addons/environments/RoomEnvironment.js';
import { loadGLB, Person } from './people.js';

const W = 1080, H = 1920;
const TIMING = await (await fetch('timing.json')).json();
const WORDS = TIMING.words, P = TIMING.paras, DUR = TIMING.dur;
await Promise.all([400, 800, 900].map(w => document.fonts.load(`${w} 30px N`)));

// ---------- helpers ----------
let seed = 11;
const rnd = () => { seed = (seed * 16807) % 2147483647; return (seed - 1) / 2147483646; };
const clamp = (x, a = 0, b = 1) => Math.min(b, Math.max(a, x));
const prog = (t, a, b) => clamp((t - a) / (b - a));
const eio = x => x < .5 ? 4 * x * x * x : 1 - Math.pow(-2 * x + 2, 3) / 2;
const eout = x => 1 - Math.pow(1 - x, 3);
const eback = x => { const c1 = 1.9, c3 = c1 + 1; return 1 + c3 * Math.pow(x - 1, 3) + c1 * Math.pow(x - 1, 2); };
const lerp = (a, b, x) => a + (b - a) * x;
const norm = s => s.toLowerCase().replace(/[¿?¡!.,:;"…“”]/g, '');
const T = (w, after = 0) => { for (const x of WORDS) if (x.s >= after - 0.01 && norm(x.w) === norm(w)) return x.s; throw new Error('word ' + w + ' after ' + after); };
const V = (x, y, z) => new THREE.Vector3(x, y, z);
// scene boundaries (paragraph starts)
const S = [0, ...P.slice(1), DUR];
const SC = i => [S[i], S[i + 1]];

// ---------- renderer ----------
const canvas = document.getElementById('gl');
const renderer = new THREE.WebGLRenderer({ canvas, antialias: true, preserveDrawingBuffer: true });
const RS = 0.67; renderer.setPixelRatio(1); renderer.setSize(Math.round(W * RS), Math.round(H * RS), false);
renderer.toneMapping = THREE.ACESFilmicToneMapping; renderer.toneMappingExposure = 1.05;
renderer.outputColorSpace = THREE.SRGBColorSpace;
const scene = new THREE.Scene();
const camera = new THREE.PerspectiveCamera(42, W / H, 0.05, 400);
const ENVTEX = new THREE.PMREMGenerator(renderer).fromScene(new RoomEnvironment(), .04).texture;

function canvasTex(w, h, draw) {
  const c = document.createElement('canvas'); c.width = w; c.height = h; const g = c.getContext('2d'); if (draw) draw(g, w, h);
  const t = new THREE.CanvasTexture(c); t.colorSpace = THREE.SRGBColorSpace; t.anisotropy = 8; t.userData = { c, g }; return t;
}
const gradTex = (stops) => canvasTex(4, 512, (g, w, h) => { const gr = g.createLinearGradient(0, 0, 0, h); stops.forEach(([o, c]) => gr.addColorStop(o, c)); g.fillStyle = gr; g.fillRect(0, 0, w, h); });
const BG = {
  sunny: gradTex([[0, '#3d8fe0'], [.55, '#8cc8f2'], [1, '#ffe2b0']]),
  inside: gradTex([[0, '#050914'], [.5, '#0b1530'], [1, '#141030']]),
  studio: gradTex([[0, '#141a33'], [.6, '#1f2547'], [1, '#2c2140']]),
  warm: gradTex([[0, '#2a1230'], [.6, '#4a1d2e'], [1, '#6a2a22']]),
  cool: gradTex([[0, '#0d2340'], [.6, '#173a5e'], [1, '#22507a']]),
  hot: gradTex([[0, '#ff9a3d'], [.5, '#ffc26b'], [1, '#ffe6b0']]),
};
const hemi = new THREE.HemisphereLight(0xcfe3ff, 0x3a2a20, 1.5); scene.add(hemi);
const key = new THREE.DirectionalLight(0xfff1dc, 2.2); key.position.set(4, 8, 6); scene.add(key);
const rim = new THREE.DirectionalLight(0x88aaff, 1.0); rim.position.set(-6, 3, -5); scene.add(rim);

const M = (color, o = {}) => new THREE.MeshStandardMaterial({ color, roughness: .8, metalness: 0, flatShading: true, ...o });
const mesh = (geo, mat, x = 0, y = 0, z = 0) => { const m = new THREE.Mesh(geo, mat); m.position.set(x, y, z); return m; };
const radial = canvasTex(128, 128, (g) => { const r = g.createRadialGradient(64, 64, 0, 64, 64, 64); r.addColorStop(0, 'rgba(255,255,255,1)'); r.addColorStop(.35, 'rgba(255,255,255,.55)'); r.addColorStop(1, 'rgba(255,255,255,0)'); g.fillStyle = r; g.fillRect(0, 0, 128, 128); });

// ---------- heat particles (additive, vertex colors -> per-particle fade) ----------
function particles(n, color, opts = {}) {
  const geo = new THREE.BufferGeometry();
  const pos = new Float32Array(n * 3), col = new Float32Array(n * 3);
  geo.setAttribute('position', new THREE.BufferAttribute(pos, 3)); geo.setAttribute('color', new THREE.BufferAttribute(col, 3));
  const mat = new THREE.PointsMaterial({ size: opts.size || .35, map: radial, vertexColors: true, transparent: true, depthWrite: false, blending: THREE.AdditiveBlending, toneMapped: false });
  const pts = new THREE.Points(geo, mat); pts.frustumCulled = false;
  const c = new THREE.Color(color), seeds = [...Array(n)].map(() => [rnd(), rnd(), rnd()]);
  pts.userData.update = (t, k, sx = .6, sz = .3, rise = 2.2, speed = .45) => {
    for (let i = 0; i < n; i++) {
      const [a, b, d] = seeds[i]; const ph = (t * speed * (0.7 + d * .6) + a) % 1;
      pos[i * 3] = (b - .5) * 2 * sx + Math.sin(t * 2.3 + i) * .12 * ph;
      pos[i * 3 + 1] = ph * rise * (opts.down ? -1 : 1);
      pos[i * 3 + 2] = (d - .5) * 2 * sz;
      const f = Math.sin(Math.PI * ph) * k;
      col[i * 3] = c.r * f; col[i * 3 + 1] = c.g * f; col[i * 3 + 2] = c.b * f;
    }
    geo.attributes.position.needsUpdate = true; geo.attributes.color.needsUpdate = true;
  };
  return pts;
}

// ---------- phone ----------
function makePhone(color = 0x2a2f3a) {
  const g = new THREE.Group();
  const bodyMat = new THREE.MeshStandardMaterial({ color, roughness: .35, metalness: .4, emissive: 0x000000 });
  const body = new THREE.Mesh(new RoundedBoxGeometry(.8, 1.62, .1, 4, .09), bodyMat); g.add(body);
  const tex = canvasTex(400, 810);
  const scr = new THREE.Mesh(new THREE.PlaneGeometry(.73, 1.55), new THREE.MeshBasicMaterial({ map: tex, toneMapped: false }));
  scr.position.z = .052; g.add(scr);
  const bump = mesh(new RoundedBoxGeometry(.3, .3, .04, 2, .05), new THREE.MeshStandardMaterial({ color: 0x15181f, roughness: .3, metalness: .5 }), -.18, .58, -.065); g.add(bump);
  for (const [x, y] of [[-.24, .64], [-.12, .52]]) { const l = mesh(new THREE.CylinderGeometry(.05, .05, .03, 16), new THREE.MeshStandardMaterial({ color: 0x05070a, roughness: .1, metalness: .8 }), x, y, -.09); l.rotation.x = Math.PI / 2; g.add(l); }
  const aura = new THREE.Sprite(new THREE.SpriteMaterial({ map: radial, color: 0xff5a1f, transparent: true, opacity: 0, depthWrite: false, blending: THREE.AdditiveBlending, toneMapped: false }));
  aura.scale.set(2.2, 2.6, 1); aura.position.z = 0; g.add(aura);
  g.userData = {
    body, tex, aura,
    heat(h) { bodyMat.emissive.setRGB(h * .55, h * .1, h * .02); bodyMat.emissiveIntensity = 1; aura.material.opacity = h * .45; },
    draw(fn) { const { g: c } = tex.userData; c.save(); fn(c, 400, 810); c.restore(); tex.needsUpdate = true; },
  };
  return g;
}
function rr(c, x, y, w, h, r) { c.beginPath(); c.roundRect(x, y, w, h, r); }
function scrGame(c, w, h, t) {
  const gr = c.createLinearGradient(0, 0, 0, h); gr.addColorStop(0, '#2b1b6b'); gr.addColorStop(1, '#ff6a8a'); c.fillStyle = gr; c.fillRect(0, 0, w, h);
  for (let i = 0; i < 7; i++) { const x = ((i * 97 + t * 160) % (w + 80)) - 40, y = 140 + (i * 113) % 520; c.fillStyle = ['#ffd34d', '#5ef0c0', '#fff'][i % 3]; c.beginPath(); c.arc(x, y, 16 + (i % 3) * 8, 0, 7); c.fill(); }
  c.fillStyle = '#3cf0a0'; rr(c, 150 + Math.sin(t * 3) * 90, 640, 100, 60, 18); c.fill();
  c.fillStyle = '#fff'; c.font = '900 44px N'; c.textAlign = 'center'; c.fillText('SCORE ' + (1200 + Math.floor(t * 37)), w / 2, 80);
}
function scrHome(c, w, h, o) {
  const gr = c.createLinearGradient(0, 0, w, h); gr.addColorStop(0, '#3a6df0'); gr.addColorStop(1, '#a24df0'); c.fillStyle = gr; c.fillRect(0, 0, w, h);
  c.fillStyle = '#fff'; c.font = '800 28px N'; c.textAlign = 'left'; c.fillText('9:41', 34, 50);
  // battery icon
  c.strokeStyle = '#fff'; c.lineWidth = 3; rr(c, 300, 28, 56, 28, 7); c.stroke(); c.fillStyle = '#fff'; c.fillRect(304, 32, 40, 20); c.fillRect(358, 36, 5, 12);
  if (o.bolt) { c.fillStyle = o.paused ? '#ffb020' : '#3cf07a'; c.font = '900 30px N'; c.fillText(o.paused ? '⏸' : '⚡', 258, 54); }
  for (let r = 0; r < 4; r++) for (let k = 0; k < 4; k++) { c.fillStyle = ['#ffd34d', '#5ef0c0', '#ff7a7a', '#ffffff', '#7ad0ff'][(r * 4 + k) % 5]; rr(c, 34 + k * 88, 120 + r * 110, 68, 68, 18); c.fill(); }
  // brightness slider
  if (o.slider != null) {
    c.fillStyle = 'rgba(0,0,0,.35)'; rr(c, 40, 590, 320, 70, 35); c.fill();
    c.fillStyle = '#fff'; rr(c, 40, 590, 70 + 250 * o.slider, 70, 35); c.fill();
    c.fillStyle = '#ffb020'; c.font = '900 40px N'; c.fillText('☀', 58, 640);
  }
  if (o.paused) {
    c.fillStyle = 'rgba(0,0,0,.6)'; rr(c, 30, 690, 340, 90, 22); c.fill();
    c.fillStyle = '#fff'; c.font = '800 24px N'; c.fillText('Carga en espera', 60, 728); c.font = '400 20px N'; c.fillText('Se reanudará al bajar la temperatura', 60, 758);
  }
  if (o.dim) { c.fillStyle = `rgba(0,0,0,${o.dim})`; c.fillRect(0, 0, w, h); }
}
function scrWarn(c, w, h) {
  c.fillStyle = '#05060a'; c.fillRect(0, 0, w, h);
  c.fillStyle = '#ffb020'; c.beginPath(); c.moveTo(200, 220); c.lineTo(290, 380); c.lineTo(110, 380); c.closePath(); c.fill();
  c.fillStyle = '#05060a'; c.font = '900 110px N'; c.textAlign = 'center'; c.fillText('!', 200, 370);
  c.fillStyle = '#fff'; c.font = '900 40px N'; c.fillText('Temperatura', 200, 460);
  c.font = '400 25px N'; c.fillText('El teléfono necesita', 200, 510); c.fillText('enfriarse antes de usarlo.', 200, 545);
  c.fillStyle = '#e53935'; rr(c, 90, 640, 220, 64, 32); c.fill(); c.fillStyle = '#fff'; c.font = '800 26px N'; c.fillText('Emergencia', 200, 682);
}

// ---------- character ----------
function makeChar(shirt = 0x2fb5a8) {
  const g = new THREE.Group();
  const skin = M(0xf0b98a), dark = M(0x2a1d18), pants = M(0x34406b);
  for (const s of [-1, 1]) { g.add(mesh(new THREE.CylinderGeometry(.17, .15, .85, 6), pants, s * .22, .43, 0)); g.add(mesh(new THREE.BoxGeometry(.3, .16, .42), M(0xf4f4f4), s * .22, .08, .07)); }
  const body = mesh(new THREE.CylinderGeometry(.48, .6, 1.15, 7), M(shirt), 0, 1.4, 0); g.add(body);
  const head = new THREE.Group(); head.position.set(0, 2.38, 0); g.add(head);
  head.add(mesh(new THREE.IcosahedronGeometry(.56, 1), skin));
  const hair = mesh(new THREE.SphereGeometry(.6, 8, 6, 0, Math.PI * 2, 0, Math.PI * .42), dark, 0, .06, -.04); hair.rotation.x = -.35; head.add(hair);
  const eyes = [];
  for (const s of [-1, 1]) {
    const e = mesh(new THREE.SphereGeometry(.12, 10, 8), M(0xffffff, { flatShading: false }), s * .2, .05, .45); e.scale.z = .5; head.add(e);
    const p = mesh(new THREE.SphereGeometry(.065, 10, 8), M(0x111111, { flatShading: false }), s * .2, .05, .51); head.add(p); eyes.push(e, p);
  }
  const brows = [-1, 1].map(s => { const b = mesh(new THREE.BoxGeometry(.2, .045, .04), dark, s * .2, .22, .49); head.add(b); return b; });
  const mouth = mesh(new THREE.TorusGeometry(.11, .028, 6, 14, Math.PI), M(0x8a2a2a), 0, -.2, .5); mouth.rotation.z = Math.PI; head.add(mouth);
  head.add(mesh(new THREE.SphereGeometry(.07, 8, 6), M(0xe8a679), 0, -.05, .55));
  const arms = [-1, 1].map(s => {
    const piv = new THREE.Group(); piv.position.set(s * .58, 1.85, 0); g.add(piv);
    piv.add(mesh(new THREE.CylinderGeometry(.12, .1, .8, 6), M(shirt), 0, -.4, 0));
    const hand = mesh(new THREE.IcosahedronGeometry(.14, 0), skin, 0, -.85, 0); piv.add(hand); return piv;
  });
  const sweat = new THREE.Group(); head.add(sweat);
  const dropMat = M(0x7fd3ff, { flatShading: false, emissive: 0x1a5f8a, roughness: .2 });
  for (const [x, y, s] of [[.52, .25, 1], [-.5, .1, .8]]) { const d = new THREE.Group(); d.add(mesh(new THREE.SphereGeometry(.07, 8, 6), dropMat)); const cn = mesh(new THREE.ConeGeometry(.068, .14, 8), dropMat, 0, .1, 0); d.add(cn); d.position.set(x, y, .3); d.scale.setScalar(s); sweat.add(d); }
  const shadow = new THREE.Mesh(new THREE.CircleGeometry(.9, 24), new THREE.MeshBasicMaterial({ color: 0x000000, transparent: true, opacity: .22, depthWrite: false }));
  shadow.rotation.x = -Math.PI / 2; shadow.position.y = .01; g.add(shadow);
  g.userData = { head, arms, brows, mouth, sweat, eyes,
    face(kind) { // 'happy' | 'worried' | 'shock'
      mouth.rotation.z = kind === 'happy' ? Math.PI : 0; mouth.scale.set(1, kind === 'shock' ? 1.6 : 1, 1); mouth.position.y = kind === 'happy' ? -.2 : -.27;
      brows[0].rotation.z = kind === 'happy' ? 0 : .35; brows[1].rotation.z = kind === 'happy' ? 0 : -.35;
    } };
  return g;
}

// ---------- groups per set ----------
const SET = {};
const mk = n => { const g = new THREE.Group(); g.visible = false; scene.add(g); SET[n] = g; return g; };

// OUTDOOR (sunny park)
const out = mk('out');
{
  const ground = mesh(new THREE.CircleGeometry(40, 28), M(0x86c95a), 0, 0, 0); ground.rotation.x = -Math.PI / 2; out.add(ground);
  const path = mesh(new THREE.PlaneGeometry(2.6, 60), M(0xe9d3a0), 1.8, .01, -10); path.rotation.x = -Math.PI / 2; out.add(path);
  for (let i = 0; i < 14; i++) {
    const tr = new THREE.Group(); const a = rnd() * Math.PI * 2, r = 6 + rnd() * 16;
    tr.position.set(Math.cos(a) * r, 0, -Math.abs(Math.sin(a) * r) - 2);
    tr.add(mesh(new THREE.CylinderGeometry(.15, .22, 1.4, 6), M(0x7a5236), 0, .7, 0));
    const s = .9 + rnd() * .8; tr.add(mesh(new THREE.IcosahedronGeometry(1.1 * s, 0), M([0x4fa64a, 0x5cb85a, 0x3f9a46][i % 3]), 0, 1.7 + s * .6, 0)); out.add(tr);
  }
  const bench = new THREE.Group(); bench.position.set(-2.2, 0, -1.5);
  bench.add(mesh(new THREE.BoxGeometry(2.2, .12, .6), M(0xb07a45), 0, .55, 0)); bench.add(mesh(new THREE.BoxGeometry(2.2, .5, .1), M(0xb07a45), 0, .9, -.28));
  for (const s of [-1, 1]) bench.add(mesh(new THREE.BoxGeometry(.1, .55, .55), M(0x444444), s * .95, .27, 0)); out.add(bench);
  const sun = new THREE.Mesh(new THREE.SphereGeometry(3, 24, 16), new THREE.MeshBasicMaterial({ color: 0xfff1a8, toneMapped: false })); sun.position.set(-14, 22, -60); out.add(sun);
  out.userData.sun = sun;
}
const hero = makeChar(); out.add(hero); hero.visible = false;
const heroPhone = makePhone(); out.add(heroPhone);
const heroHeat = particles(40, 0xff7a2a, { size: .07 }); out.add(heroHeat);

// INSIDE PHONE (circuit board)
const ins = mk('ins');
const chipMat = new THREE.MeshStandardMaterial({ color: 0x2b2f38, roughness: .4, metalness: .6, emissive: 0x000000 });
const chip = new THREE.Group();
{
  const pcbTex = canvasTex(1024, 1024, (g, w, h) => {
    g.fillStyle = '#0d3b2c'; g.fillRect(0, 0, w, h);
    g.strokeStyle = '#1f7a55'; g.lineWidth = 6; g.lineCap = 'round';
    for (let i = 0; i < 70; i++) { let x = rnd() * w, y = rnd() * h; g.beginPath(); g.moveTo(x, y); for (let k = 0; k < 4; k++) { if (rnd() < .5) x += (rnd() - .5) * 300; else y += (rnd() - .5) * 300; g.lineTo(x, y); } g.stroke(); g.fillStyle = '#c9a54a'; g.beginPath(); g.arc(x, y, 8, 0, 7); g.fill(); }
  });
  const pcb = mesh(new THREE.BoxGeometry(9, .2, 16), new THREE.MeshStandardMaterial({ map: pcbTex, roughness: .7 }), 0, -.1, 0); ins.add(pcb);
  chip.add(mesh(new THREE.BoxGeometry(2.2, .35, 2.2), chipMat, 0, .17, 0));
  const lab = canvasTex(256, 256, (g) => { g.fillStyle = '#2b2f38'; g.fillRect(0, 0, 256, 256); g.fillStyle = '#cfd6e2'; g.font = '900 64px N'; g.textAlign = 'center'; g.fillText('CPU', 128, 150); g.strokeStyle = '#cfd6e2'; g.lineWidth = 4; g.strokeRect(20, 20, 216, 216); });
  const top = mesh(new THREE.PlaneGeometry(2.0, 2.0), new THREE.MeshStandardMaterial({ map: lab, roughness: .5, emissive: 0x000000 }), 0, .36, 0); top.rotation.x = -Math.PI / 2; chip.add(top); chip.userData.top = top;
  for (let i = 0; i < 10; i++) for (const s of [-1, 1]) { chip.add(mesh(new THREE.BoxGeometry(.08, .06, .3), M(0xd8c07a, { metalness: .8, roughness: .3 }), -1 + i * .22, .03, s * 1.25)); chip.add(mesh(new THREE.BoxGeometry(.3, .06, .08), M(0xd8c07a, { metalness: .8, roughness: .3 }), s * 1.25, .03, -1 + i * .22)); }
  chip.position.set(-1.6, 0, -3); ins.add(chip);
  for (let i = 0; i < 22; i++) { const c = mesh(new THREE.BoxGeometry(.2 + rnd() * .5, .15 + rnd() * .25, .2 + rnd() * .5), M([0x1c1f26, 0x8a6a3a, 0x3a3f4a, 0xd9d9d9][i % 4]), (rnd() - .5) * 8, .1, (rnd() - .5) * 15); if (Math.hypot(c.position.x + 1.6, c.position.z + 3) > 2 && Math.abs(c.position.z - 3.5) > 3.2) ins.add(c); }
  const cam = mesh(new THREE.CylinderGeometry(.8, .8, .6, 24), M(0x15181f, { flatShading: false, metalness: .6, roughness: .3 }), 2.6, .3, -6); ins.add(cam);
  ins.add(mesh(new THREE.CylinderGeometry(.5, .5, .62, 24), new THREE.MeshStandardMaterial({ color: 0x0a1630, roughness: .05, metalness: .9 }), 2.6, .31, -6));
}
const insBat = new THREE.Group();
const batTex = canvasTex(512, 640);
{
  insBat.add(new THREE.Mesh(new RoundedBoxGeometry(6, .6, 6, 4, .2), new THREE.MeshStandardMaterial({ color: 0x9aa6b8, roughness: .35, metalness: .6 })));
  const lab = mesh(new THREE.PlaneGeometry(4.8, 4.8 * 640 / 512), new THREE.MeshStandardMaterial({ map: batTex, roughness: .6 }), 0, .31, 0); lab.rotation.x = -Math.PI / 2; lab.rotation.z = Math.PI; insBat.add(lab);
  insBat.position.set(0, .3, 4); ins.add(insBat);
}
function drawBat(level, t) {
  const g = batTex.userData.g; g.fillStyle = '#1e2a3d'; g.fillRect(0, 0, 512, 640);
  g.fillStyle = '#fff'; g.font = '900 64px N'; g.textAlign = 'center'; g.fillText('BATERÍA', 256, 110); g.font = '800 40px N'; g.fillStyle = '#9fb0c8'; g.fillText('Li-ion', 256, 165);
  g.strokeStyle = '#fff'; g.lineWidth = 10; rr(g, 96, 220, 320, 360, 26); g.stroke();
  const c = level > .6 ? '#3ce07a' : level > .35 ? '#ffc23d' : '#ff5a3d'; g.fillStyle = c; const hh = 330 * level; rr(g, 111, 565 - hh, 290, hh, 14); g.fill();
  g.fillStyle = '#fff'; g.font = '900 72px N'; g.fillText(Math.round(level * 100) + '%', 256, 430);
  batTex.needsUpdate = true;
}
drawBat(1);
const chipHeat = particles(90, 0xff6a1f, { size: .55 }); chipHeat.position.copy(chip.position); ins.add(chipHeat);
const shield = new THREE.Mesh(new THREE.IcosahedronGeometry(2.1, 2), new THREE.MeshBasicMaterial({ color: 0x4fb4ff, wireframe: true, transparent: true, opacity: 0, toneMapped: false }));
shield.position.copy(chip.position); ins.add(shield);
const shieldFill = new THREE.Mesh(new THREE.IcosahedronGeometry(2.08, 2), new THREE.MeshBasicMaterial({ color: 0x2a7fff, transparent: true, opacity: 0, depthWrite: false, toneMapped: false }));
shieldFill.position.copy(chip.position); ins.add(shieldFill);
const chipLight = new THREE.PointLight(0xff5a1a, 0, 9, 1.5); chipLight.position.set(chip.position.x, 1.2, chip.position.z); ins.add(chipLight);

// STUDIO (floating objects)
const stu = mk('stu');
const bigPhone = makePhone(); stu.add(bigPhone);
const stuHeat = particles(70, 0xff7a2a, { size: .3 }); stu.add(stuHeat);
const floor = mesh(new THREE.CircleGeometry(6, 40), new THREE.MeshStandardMaterial({ color: 0x232a4a, roughness: .9 }), 0, -1.4, 0); floor.rotation.x = -Math.PI / 2; stu.add(floor);
// 3D battery (for myth 1 / real)
const bat = new THREE.Group();
const batBody = new THREE.Mesh(new RoundedBoxGeometry(1.3, 2.1, .32, 4, .1), new THREE.MeshStandardMaterial({ color: 0x9aa6b8, roughness: .35, metalness: .6, emissive: 0x000000 }));
bat.add(batBody);
const batTex2 = canvasTex(256, 420);
const batFace = mesh(new THREE.PlaneGeometry(1.1, 1.8), new THREE.MeshBasicMaterial({ map: batTex2, color: 0x9a9a9a }), 0, 0, .165); bat.add(batFace);
const bulge = new THREE.Mesh(new THREE.SphereGeometry(.7, 20, 14), new THREE.MeshStandardMaterial({ color: 0x9aa6b8, roughness: .35, metalness: .6 })); bulge.scale.set(.9, 1.4, 0); bulge.position.z = 0; bat.add(bulge);
const bulgeB = bulge.clone(); bat.add(bulgeB);
bat.visible = false; stu.add(bat);
function drawBat2(level, warn) {
  const g = batTex2.userData.g; g.fillStyle = '#1e2a3d'; g.fillRect(0, 0, 256, 420);
  g.strokeStyle = '#fff'; g.lineWidth = 8; rr(g, 58, 70, 140, 300, 18); g.stroke(); g.fillStyle = '#fff'; g.fillRect(100, 48, 56, 22);
  const c = level > .6 ? '#3ce07a' : level > .35 ? '#ffc23d' : '#ff5a3d'; g.fillStyle = c; const hh = 280 * level; rr(g, 68, 360 - hh, 120, hh, 10); g.fill();
  g.fillStyle = '#fff'; g.font = '900 46px N'; g.textAlign = 'center'; g.fillText(Math.round(level * 100) + '%', 128, 236);
  if (warn) { g.fillStyle = '#ffb020'; g.font = '900 40px N'; g.fillText('⚠', 128, 410); }
  batTex2.needsUpdate = true;
}
const smell = new THREE.Group();
for (let i = 0; i < 3; i++) {
  const pts = []; for (let k = 0; k <= 30; k++) pts.push(V(Math.sin(k * .45) * .15, k * .04, 0));
  const tube = new THREE.Mesh(new THREE.TubeGeometry(new THREE.CatmullRomCurve3(pts), 40, .035, 6), new THREE.MeshBasicMaterial({ color: 0x9be05a, transparent: true, opacity: 0, toneMapped: false }));
  tube.position.set(-.45 + i * .45, 1.2, .2); smell.add(tube);
}
bat.add(smell);
// car
const car = new THREE.Group();
{
  const red = M(0xe8473a);
  car.add(mesh(new THREE.BoxGeometry(3.4, .75, 1.6), red, 0, .65, 0));
  car.add(mesh(new THREE.BoxGeometry(1.9, .7, 1.45), red, -.2, 1.35, 0));
  const glass = new THREE.MeshStandardMaterial({ color: 0x9fd4ff, roughness: .1, metalness: .3, transparent: true, opacity: .45 });
  car.add(mesh(new THREE.BoxGeometry(1.75, .55, 1.47), glass, -.2, 1.37, 0));
  for (const x of [-1.1, 1.1]) for (const z of [-.8, .8]) { const w = mesh(new THREE.CylinderGeometry(.36, .36, .26, 14), M(0x1a1a1a), x, .36, z); w.rotation.x = Math.PI / 2; car.add(w); }
  for (const z of [-.5, .5]) car.add(mesh(new THREE.SphereGeometry(.12, 8, 6), new THREE.MeshBasicMaterial({ color: 0xfff6c0, toneMapped: false }), 1.71, .75, z));
  const road = mesh(new THREE.PlaneGeometry(14, 8), M(0x6b6b78), 0, 0, 0); road.rotation.x = -Math.PI / 2; car.add(road);
  const cp = makePhone(); cp.scale.setScalar(.32); cp.position.set(.45, 1.1, .1); cp.rotation.set(-.4, Math.PI / 2, 0); car.add(cp); car.userData.phone = cp;
  const s = new THREE.Mesh(new THREE.SphereGeometry(1.2, 20, 14), new THREE.MeshBasicMaterial({ color: 0xfff09a, toneMapped: false })); s.position.set(-3.5, 6.5, -6); car.add(s);
  const ch = particles(50, 0xff7a2a, { size: .45 }); ch.position.set(0, 1.6, 0); car.add(ch); car.userData.heat = ch;
  car.visible = false; stu.add(car);
}
// fridge
const fridge = new THREE.Group();
{
  const white = M(0xd5dce6, { flatShading: false, roughness: .55 });
  const shell = new THREE.Group();
  shell.add(mesh(new THREE.BoxGeometry(1.8, 3.2, .12), white, 0, 1.6, -.7));
  for (const s of [-1, 1]) shell.add(mesh(new THREE.BoxGeometry(.12, 3.2, 1.5), white, s * .9, 1.6, 0));
  shell.add(mesh(new THREE.BoxGeometry(1.8, .12, 1.5), white, 0, 3.2, 0)); shell.add(mesh(new THREE.BoxGeometry(1.8, .12, 1.5), white, 0, .06, 0));
  for (const y of [1.0, 1.9, 2.6]) shell.add(mesh(new THREE.BoxGeometry(1.66, .04, 1.3), new THREE.MeshStandardMaterial({ color: 0xcfe9ff, transparent: true, opacity: .6 }), 0, y, 0));
  fridge.add(shell);
  const inner = new THREE.PointLight(0xbfe3ff, 1.0, 4, 1.5); inner.position.set(0, 2.6, .2); fridge.add(inner);
  const hinge = new THREE.Group(); hinge.position.set(-.9, 0, .75); fridge.add(hinge);
  const door = mesh(new THREE.BoxGeometry(1.8, 3.2, .14), white, .9, 1.6, 0); hinge.add(door);
  hinge.add(mesh(new THREE.BoxGeometry(.08, .9, .1), M(0xb8c2d0), 1.6, 1.9, .1));
  fridge.userData.hinge = hinge;
  const fp = makePhone(); fp.scale.setScalar(.16); fp.position.set(0, 1.45, .1); fp.rotation.x = -.15; fridge.add(fp); fridge.userData.phone = fp;
  const drops = new THREE.Group(); const dm = new THREE.MeshStandardMaterial({ color: 0xbfe8ff, roughness: .05, metalness: .2, transparent: true, opacity: .9 });
  for (let i = 0; i < 16; i++) { const d = mesh(new THREE.SphereGeometry(.035 + rnd() * .03, 8, 6), dm, (rnd() - .5) * .3, (rnd() - .5) * .66, .06); d.userData.k = rnd(); drops.add(d); }
  fp.add(drops); drops.scale.setScalar(1 / .45 * .45); fridge.userData.drops = drops;
  const mist = particles(50, 0x9fdcff, { size: .4 }); mist.position.set(0, 1.0, .6); fridge.add(mist); fridge.userData.mist = mist;
  fridge.visible = false; stu.add(fridge);
}
// row of phones (no single limit)
const row = new THREE.Group();
const rowPhones = [0x2a2f3a, 0xd9dee8, 0x3a5ad9, 0xe0567a].map((c, i) => { const p = makePhone(c); p.position.set((i % 2 - .5) * 1.15, i < 2 ? .95 : -.9, 0); p.rotation.y = (i % 2 - .5) * -.3; p.scale.setScalar(.95); row.add(p); return p; });
row.visible = false; stu.add(row);

// CHARACTER CLOSE-UP set reuse "out" but for skin scene uses studio with character
const stuChar = makeChar(0xff8a5a); stuChar.visible = false; stu.add(stuChar); stuChar.userData.hidden = true;
const stuCharPhone = makePhone(); stuCharPhone.visible = false; stu.add(stuCharPhone);
const handGlow = new THREE.Sprite(new THREE.SpriteMaterial({ map: radial, color: 0xff3a1a, transparent: true, opacity: 0, depthWrite: false, blending: THREE.AdditiveBlending, toneMapped: false }));
handGlow.scale.set(1.6, 1.6, 1); stu.add(handGlow);

// PILLOW teaser
const pil = new THREE.Group();
{
  const geo = new THREE.SphereGeometry(1, 28, 18); geo.scale(1.9, .45, 1.1);
  const p = new THREE.Mesh(geo, new THREE.MeshStandardMaterial({ color: 0xeef0ff, roughness: .95 })); p.position.y = .55; pil.add(p);
  const bed = mesh(new RoundedBoxGeometry(5, .5, 4, 3, .2), new THREE.MeshStandardMaterial({ color: 0x4b5fd0, roughness: .9 }), 0, -.05, .6); pil.add(bed);
  const glow = new THREE.Sprite(new THREE.SpriteMaterial({ map: radial, color: 0xff6a2a, transparent: true, opacity: .0, depthWrite: false, blending: THREE.AdditiveBlending, toneMapped: false })); glow.scale.set(3, 1.6, 1); glow.position.set(0, .5, 1.2); pil.add(glow); pil.userData.glow = glow;
  const cable = new THREE.Mesh(new THREE.TubeGeometry(new THREE.CatmullRomCurve3([V(.6, .25, .5), V(1.6, .26, 1.3), V(2.6, .2, 2.4), V(3.2, -.4, 2.8)]), 30, .035, 6), M(0xffffff)); pil.add(cable);
  pil.visible = false; stu.add(pil);
}

// ---------- composer ----------
const composer = new EffectComposer(renderer);
composer.addPass(new RenderPass(scene, camera));
composer.setSize(Math.round(W * RS), Math.round(H * RS));
const bloom = new UnrealBloomPass(new THREE.Vector2(W * RS / 2, H * RS / 2), .6, .5, .85); composer.addPass(bloom);
composer.addPass(new OutputPass());

// ---------- 2D overlays ----------
const ovEl = document.getElementById('ov');
const L = (id, html, css) => { const d = document.createElement('div'); d.className = 'L'; d.id = id; d.style.cssText = css; d.innerHTML = html; ovEl.appendChild(d); return d; };
const icon = (emo, lab, bg) => `<div style="display:flex;flex-direction:column;align-items:center;gap:8px"><div style="width:150px;height:150px;border-radius:40px;background:${bg};display:flex;align-items:center;justify-content:center;font-size:84px;box-shadow:0 12px 30px rgba(0,0,0,.35)">${emo}</div><div style="color:#fff;font-weight:900;font-size:30px;text-shadow:0 2px 8px rgba(0,0,0,.6)">${lab}</div></div>`;
const ICONS = [['🎮', 'JUEGOS', '#7a4dff', 'Juegos'], ['🎬', 'VIDEO', '#ff4d7a', 'video'], ['📷', 'CÁMARA', '#2a9dff', 'cámara'], ['🔌', 'CARGAR', '#26c281', 'cargar'], ['☀️', 'SOL', '#ffb020', 'sol']];
const icEls = ICONS.map(([e, l, b], i) => L('ic' + i, icon(e, l, b), `left:${40 + i * 202}px;top:1060px`));
const gauge = L('gauge', `<svg width="560" height="360" viewBox="0 0 560 360">
  <path d="M60 300 A220 220 0 0 1 500 300" fill="none" stroke="rgba(255,255,255,.15)" stroke-width="44" stroke-linecap="round"/>
  <path d="M60 300 A220 220 0 0 1 166 112" fill="none" stroke="#ff5a3d" stroke-width="44" stroke-linecap="round"/>
  <path d="M190 98 A220 220 0 0 1 370 98" fill="none" stroke="#ffc23d" stroke-width="44"/>
  <path d="M394 112 A220 220 0 0 1 500 300" fill="none" stroke="#3ce07a" stroke-width="44" stroke-linecap="round"/>
  <g id="needle"><line x1="280" y1="300" x2="280" y2="110" stroke="#fff" stroke-width="14" stroke-linecap="round"/><circle cx="280" cy="300" r="28" fill="#fff"/></g>
  <text x="280" y="355" text-anchor="middle" fill="#fff" font-family="N" font-weight="900" font-size="34">VELOCIDAD</text></svg>`, 'left:260px;top:960px');
const third = L('third', `<div style="width:760px;background:rgba(8,12,24,.75);border-radius:28px;padding:26px 30px;border:2px solid rgba(255,255,255,.12)">
  <div style="color:#cfd6e8;font-weight:800;font-size:30px;margin-bottom:14px">RENDIMIENTO</div>
  <div style="height:60px;border-radius:30px;background:rgba(255,255,255,.12);overflow:hidden"><div id="thb" style="height:100%;width:100%;border-radius:30px;background:linear-gradient(90deg,#3ce07a,#ffc23d)"></div></div>
  <div style="display:flex;justify-content:space-between;color:#fff;font-weight:900;font-size:34px;margin-top:12px"><span>100%</span><span id="thn" style="color:#ff8a3d">−⅓</span></div></div>`, 'left:160px;top:1035px');
const thermo = L('thermo', `<svg width="300" height="640" viewBox="0 0 300 640">
  <rect x="110" y="30" width="80" height="480" rx="40" fill="rgba(255,255,255,.12)" stroke="#fff" stroke-width="6"/>
  <circle cx="150" cy="560" r="62" fill="#ff5a3d" stroke="#fff" stroke-width="6"/>
  <rect id="thm" x="128" y="300" width="44" height="270" rx="22" fill="#ff5a3d"/>
  <rect x="200" y="210" width="80" height="220" rx="10" fill="rgba(60,224,122,.25)" stroke="#3ce07a" stroke-width="4"/>
  <text x="96" y="222" text-anchor="end" fill="#fff" font-family="N" font-weight="900" font-size="40">35°</text>
  <text x="96" y="440" text-anchor="end" fill="#fff" font-family="N" font-weight="900" font-size="40">0°</text>
  <line x1="100" y1="210" x2="200" y2="210" stroke="#fff" stroke-width="4"/><line x1="100" y1="430" x2="200" y2="430" stroke="#fff" stroke-width="4"/>
  <text x="240" y="330" text-anchor="middle" fill="#3ce07a" font-family="N" font-weight="900" font-size="36" transform="rotate(-90 240 320)">OK</text></svg>`, 'left:610px;top:640px');
const signs = [['🎈', 'SE INFLA'], ['👃', 'HUELE RARO'], ['🌡️', 'MUY CALIENTE']].map(([e, l], i) => L('sg' + i, `<div style="display:flex;align-items:center;gap:18px;padding:16px 26px;border-radius:24px;background:rgba(8,12,24,.8);border:3px solid #ffb020"><span style="font-size:60px">${e}</span><span style="color:#fff;font-weight:900;font-size:44px">${l}</span></div>`, `left:${[90, 360, 640][i]}px;top:1175px;transform-origin:50% 50%`));
signs.forEach((s, i) => { s.style.left = '0'; s.style.right = '0'; s.style.textAlign = 'center'; s.style.top = (1000 + i * 120) + 'px'; s.firstChild.style.display = 'inline-flex'; });
const stamp = (txt, col) => `<div style="position:relative"><div class="ring" style="position:absolute;left:50%;top:50%;width:520px;height:520px;margin:-260px 0 0 -260px;border-radius:50%;border:14px solid ${col};opacity:0"></div><div style="position:relative;padding:18px 50px;border:10px solid ${col};border-radius:24px;color:${col};font-weight:900;font-size:150px;letter-spacing:8px;background:rgba(10,12,24,.55);box-shadow:0 0 60px ${col}66">${txt}</div></div>`;
const mitoStamp = L('mito', stamp('MITO', '#ff3b3b'), 'left:0;right:0;top:820px;display:flex;justify-content:center');
const mito2Stamp = L('mito2', stamp('¡NO!', '#ff3b3b'), 'left:0;right:0;top:700px;display:flex;justify-content:center');
const realStamp = L('real', stamp('REAL', '#3ce07a'), 'left:0;right:0;top:660px;display:flex;justify-content:center');
const qmarks = L('qm', `<div style="display:flex;gap:40px;justify-content:center">${['?', '?', '?', '?'].map((q, i) => `<span style="font-size:130px;font-weight:900;color:${['#ffd34d', '#5ef0c0', '#7ad0ff', '#ff8a8a'][i]};text-shadow:0 6px 20px rgba(0,0,0,.5)">${q}°</span>`).join('')}</div>`, 'left:0;right:0;top:760px');
const VER = [['¿EXPLOTA?', 'MUY POCO PROBABLE', '#ffb020', '🤏'], ['¿SE PONE LENTO?', 'SÍ, PARA PROTEGERSE', '#3cb4ff', '🛡️'], ['¿SE GASTA LA BATERÍA?', 'SÍ, CON EL TIEMPO', '#ff5a3d', '🔋']];
const verEls = VER.map(([q, a, c, e], i) => L('v' + i, `<div style="width:900px;border-radius:30px;overflow:hidden;box-shadow:0 18px 40px rgba(0,0,0,.4)"><div style="background:#fff;color:#141a33;font-weight:900;font-size:46px;padding:20px 34px">${q}</div><div style="background:${c};color:#fff;font-weight:900;font-size:52px;padding:18px 34px;display:flex;justify-content:space-between"><span>${a}</span><span>${e}</span></div></div>`, `left:90px;top:${650 + i * 250}px`));
const SOL = ['DÉJALO DESCANSAR', 'CIERRA LO QUE USAS', 'SÁCALO DEL SOL', 'QUE SE ENFRÍE SOLO'];
const solEls = SOL.map((s, i) => L('so' + i, `<div style="display:inline-flex;align-items:center;gap:20px;padding:16px 30px;border-radius:24px;background:rgba(8,12,24,.78);border:3px solid #3ce07a"><span style="width:56px;height:56px;border-radius:50%;background:#3ce07a;display:flex;align-items:center;justify-content:center;color:#fff;font-size:40px;font-weight:900">✓</span><span style="color:#fff;font-weight:900;font-size:46px">${s}</span></div>`, `left:90px;top:${640 + i * 118}px`));
const cta = L('cta', `<div style="display:inline-flex;align-items:center;gap:22px;padding:22px 40px 22px 24px;border-radius:60px;background:#fff;box-shadow:0 20px 60px rgba(0,0,0,.5)"><div style="width:84px;height:84px;border-radius:50%;background:linear-gradient(135deg,#ff8a3d,#e2563d)"></div><span style="font-size:70px;font-weight:900;color:#141a33">YO 🙋</span><span style="font-size:44px;color:#93a3a6;font-weight:800">Comenta</span></div>`, 'left:0;right:0;top:700px;text-align:center');
const pend = L('pend', `<div style="margin:0 60px;padding:30px 36px;border-radius:34px;background:rgba(8,12,24,.86);border:4px solid #ff8a3d;text-align:center"><div style="color:#ff8a3d;font-weight:900;font-size:50px;letter-spacing:6px">PENDIENTE:</div><div style="color:#fff;font-weight:900;font-size:62px;line-height:1.08;margin-top:10px">¿QUÉ PASA CUANDO CARGAS EL TELÉFONO DEBAJO DE LA ALMOHADA?</div></div>`, 'left:0;right:0;top:300px');

function pop(el, t, t0, t1, from = 'scale') {
  const a = prog(t, t0, t0 + .35), b = 1 - prog(t, t1 - .25, t1);
  const v = Math.min(a, b);
  if (v <= 0) { el.style.opacity = 0; return 0; }
  el.style.opacity = Math.min(1, v * 1.4);
  const s = from === 'scale' ? lerp(.6, 1, eback(a)) : 1, dy = from === 'up' ? (1 - eout(a)) * 60 : 0;
  el.style.transform = `translateY(${dy}px) scale(${s}) rotate(${from === 'scale' ? (1 - eout(a)) * -10 : 0}deg)`;
  return v;
}

// ---------- big keywords ----------
const kwEl = document.getElementById('kw');
const KW = [];
function K(text, t0, color = '#ff6a2a', sub = '', t1 = null) { const d = document.createElement('div'); d.className = 'k'; d.innerHTML = `<div class="pill" style="background:${color}">${text.split(' ').map(w => `<span class="kwd">${w}</span>`).join(' ')}</div>${sub ? `<br><div class="sub">${sub}</div>` : ''}`; kwEl.appendChild(d); KW.push({ d, t0, t1, pill: d.querySelector('.pill'), ws: [...d.querySelectorAll('.kwd')], sub: d.querySelector('.sub') }); }
const ORANGE = '#ff6a2a', RED = '#e8343b', BLUE = '#2f7bff', GREEN = '#1fb36b', PURP = '#7a4dff', YEL = '#f0a500';
K('🔥 ¡QUEMA!', T('quema') - .1, RED);
K('¿ES PELIGROSO?', T('peligroso', 11), PURP);
K('¿PUEDE EXPLOTAR?', T('explotar', 12), RED);
K('¿MITO O REAL?', T('mito', 14), BLUE);
K('¿POR QUÉ SE CALIENTA?', T('calienta', 17), ORANGE);
K('PROCESADOR A TODA MÁQUINA', T('procesador'), ORANGE);
K('TODO SUMA CALOR 🔥', T('suma'), RED);
K('SE DEFIENDE SOLO 🛡️', T('defiende'), BLUE);
K('BAJA SU VELOCIDAD', T('bajar', 34), BLUE);
K('POR ESO SE PONE LENTO 🐢', T('lento', 39), PURP);
K('HASTA ⅓ MENOS RENDIMIENTO', T('tercio') - .3, ORANGE, 'Estudio con un modelo de teléfono (2019)');
K('BAJA EL BRILLO ☀️', T('brillo') - .2, BLUE);
K('PAUSA LA CARGA ⏸', T('pausa', 49) - .2, YEL);
K('AVISO DE TEMPERATURA ⚠️', T('aviso') - .2, RED);
K('✓ LLAMADAS DE EMERGENCIA', T('llamadas') - .2, GREEN);
K('MITO #1: "SI LO USAS CALIENTE, EXPLOTA"', T('Primer', 59) - .1, RED);
K('SE FRENA ANTES', T('frenarse') - .2, BLUE);
K('INCENDIOS: POCO COMUNES', T('incendios', 67) - .2, ORANGE, 'Baterías dañadas · cargadores de mala calidad');
K('SEÑALES DE ALERTA ⚠️', T('señal', 75) - .2, YEL, 'Fuente: NFPA');
K('DEJA DE USARLO', T('deja', 83) - .1, RED);
K('LO QUE SÍ ES REAL', T('Ahora', 85) - .1, GREEN);
K('EL CALOR DESGASTA LA BATERÍA', T('desgasta') - .3, RED, 'Fuente: Battery University');
K('Y NO VUELVE', T('vuelve', 95) - .4, RED);
K('USO IDEAL: 0–35 °C', T('Apple', 97) - .1, BLUE, 'Temperatura ambiente · Fuente: Apple');
K('🚗 NO LO DEJES EN EL CARRO', T('dejes', 104) - .2, RED);
K('REAL: TU PIEL', T('piel', 107) - .3, ORANGE);
K('CONTACTO PROLONGADO', T('contacto', 109) - .1, ORANGE, 'Fuente: Apple, información de seguridad');
K('MOLESTIAS O LESIONES', T('molestias') - .2, RED);
K('SI NO SIENTES BIEN EL CALOR', T('condición', 118) - .2, PURP);
K('MITO #2: ¿AL REFRIGERADOR?', T('Segundo', 122) - .1, BLUE);
K('HUMEDAD POR DENTRO 💧', T('humedad') - .2, BLUE, 'Fuentes: AP, iFixit');
K('LO QUE NO ESTÁ CLARO', T('claro', 133) - .5, PURP);
K('NO HAY UN LÍMITE ÚNICO', T('única') - .3, PURP);
K('CADA MODELO ES DISTINTO', T('Cada', 139) - .1, PURP);
K('VEREDICTO', T('Veredicto') - .1, ORANGE, '', S[11]);
K('LA SOLUCIÓN', T('solución', 155) - .2, GREEN, '', S[12]);
KW.forEach((k, i) => { if (k.t1 == null) { const nx = KW[i + 1] ? KW[i + 1].t0 : DUR; const sceneEnd = S.find(s => s > k.t0 + .5) ?? DUR; k.t1 = Math.min(nx, sceneEnd + .0); } });

function kwAnim(k, t) {
  const o = 1 - prog(t, k.t1 - .22, k.t1);
  if (t < k.t0 || o <= 0) { k.d.style.opacity = 0; return; }
  k.d.style.opacity = o;
  const a = prog(t, k.t0, k.t0 + .28);
  k.pill.style.clipPath = `inset(-20px ${(1 - eout(a)) * 100}% -20px 0 round 26px)`;
  k.pill.style.transform = `translateY(${(1 - o) * -50}px) rotate(${-1.5 - (1 - eout(prog(t, k.t0, k.t0 + .5))) * 3}deg) scale(${1 + .03 * Math.sin((t - k.t0) * 2.2)})`;
  k.ws.forEach((w, i) => { const wa = prog(t, k.t0 + .06 + i * .07, k.t0 + .4 + i * .07); w.style.transform = `translateY(${(1 - eback(wa)) * 60}px) scale(${lerp(.4, 1, eback(wa))})`; w.style.opacity = clamp(wa * 2.5); });
  if (k.sub) { const sa = eout(prog(t, k.t0 + .35, k.t0 + .7)); k.sub.style.transform = `translateX(${(1 - sa) * -120}px)`; k.sub.style.opacity = sa; }
}
function slam(el, t, t0, t1, rot = -8, noIntro = false) {
  const o = 1 - prog(t, t1 - .2, t1);
  if (t < t0 || o <= 0) { el.style.opacity = 0; return; }
  const a = noIntro ? 1 : prog(t, t0, t0 + .2);
  const sh = noIntro ? 0 : Math.exp(-Math.max(0, t - t0 - .2) * 9) * (t > t0 + .2 ? 1 : 0);
  el.style.opacity = Math.min(o, clamp(a * 3));
  el.style.transform = `translate(${Math.sin(t * 70) * 10 * sh}px,${Math.cos(t * 55) * 8 * sh}px) scale(${lerp(2.6, 1, eout(a))}) rotate(${rot}deg)`;
  const ring = el.querySelector('.ring'); if (ring) { const r = prog(t, t0 + .16, t0 + .7); ring.style.opacity = noIntro ? 0 : (r > 0 && r < 1 ? 1 - r : 0); ring.style.transform = `scale(${lerp(.6, 2.4, eout(r))})`; }
}
const W1 = document.getElementById('w1'), W2 = document.getElementById('w2'), PROG = document.getElementById('progb');
const CUTS = [...S.slice(1, -1), T('Vamos', 14) - .15, T('El', 63.3) - .1, T('pendiente', 169) - .15];
const SHK = [T('quema'), T('explotar', 12), T('No', 62), T('No', 126), T('Veredicto')];

// ---------- captions ----------
const KEYS = new Set(['caliente', 'quema', 'peligroso', 'explotar', 'mito', 'real', 'procesador', 'calor', 'defiende', 'lento', 'tercio', 'brillo', 'pausa', 'temperatura', 'emergencia', 'explota', 'no', 'frenarse', 'dañadas', 'infla', 'raro', 'desgasta', 'vuelve', 'cero', 'treinta', 'cinco', 'carro', 'piel', 'lesiones', 'refrigerador', 'humedad', 'única', 'límites', 'probable', 'protegerse', 'tiempo', 'descansar', 'sol', 'enfríe', 'yo', 'almohada', 'incendios', 'lesiones', 'velocidad']);
const chunks = []; { let cur = [];
  WORDS.forEach((w, i) => {
    const nx = WORDS[i + 1]; cur.push(i);
    const gap = nx ? nx.s - w.e : 9, punct = /[.,:;?!…"]$/.test(w.w);
    if (!nx || gap > .15 || (cur.length >= 5 && punct) || cur.length >= 7) { chunks.push(cur); cur = []; }
  }); }
const capEl = document.getElementById('cap');
let lastChunk = -1;
function caption(t) {
  if (t < S[1] - .05) { capEl.style.opacity = 0; return; }
  let ci = -1; for (let i = 0; i < chunks.length; i++) if (WORDS[chunks[i][0]].s - .08 <= t) ci = i;
  if (ci < 0) { capEl.style.opacity = 0; return; }
  const ch = chunks[ci], lastW = WORDS[ch[ch.length - 1]];
  const nxt = chunks[ci + 1] ? WORDS[chunks[ci + 1][0]].s - .08 : DUR;
  if (t > Math.min(nxt, lastW.e + .7)) { capEl.style.opacity = 0; return; }
  capEl.style.opacity = 1;
  if (ci !== lastChunk) {
    capEl.innerHTML = ch.map(i => { const w = WORDS[i].w; const k = KEYS.has(norm(w)); return `<span class="w${k ? ' key' : ''}" data-i="${i}">${k ? '<span class="bx"></span>' : ''}<span style="position:relative">${w}</span></span>`; }).join(' ');
    lastChunk = ci;
  }
  capEl.querySelectorAll('.w').forEach(el => { const w = WORDS[+el.dataset.i]; el.classList.toggle('on', t >= w.s - .03); const bx = el.querySelector('.bx'); if (bx) bx.style.opacity = t >= w.s - .03 ? 1 : 0; });
}

// ---------- title ----------
const titleEl = document.getElementById('title');
titleEl.innerHTML = '¿QUÉ PASA CUANDO USAS EL TELÉFONO Y ESTÁ <span class="hot">CALIENTE</span>?';

// ---------- camera helper ----------
const _l = V(0, 0, 0);
function cam(p, l, fov = 42) { camera.position.copy(p); _l.copy(l); camera.lookAt(_l); if (camera.fov !== fov) { camera.fov = fov; camera.updateProjectionMatrix(); } }
const vl = (a, b, x) => a.clone().lerp(b, x);

function setBG(b) { scene.background = BG[b]; }
function show(name) { for (const k in SET) SET[k].visible = k === name; }
function only(list) { for (const o of [bigPhone, bat, car, fridge, row, stuChar, stuCharPhone, pil, floor]) o.visible = list.includes(o); handGlow.visible = false; stuHeat.visible = list.includes(bigPhone); }

// ---------- 3D people ----------
const LIP = await (await fetch('lip.json')).json();
const [gA, gH] = await Promise.all([loadGLB('models/Michelle.glb'), loadGLB('models/readyplayer.me.glb')]);
const ana = new Person(gA, 'mixamorig'), host = new Person(gH, '');
scene.add(ana.root, host.root);
for (const P of [ana, host]) P.model.traverse(o => { if (o.isMesh) { o.material.envMap = ENVTEX; o.material.envMapIntensity = .7; o.material.needsUpdate = true; } });
const anaPhone = makePhone(); anaPhone.scale.setScalar(.095); scene.add(anaPhone);
const anaHeat = particles(40, 0xff7a2a, { size: .07 }); scene.add(anaHeat);
const ringTex = canvasTex(512, 512, (g) => { const r = g.createRadialGradient(256, 256, 0, 256, 256, 256); r.addColorStop(0, 'rgba(255,140,60,.55)'); r.addColorStop(.6, 'rgba(255,90,60,.25)'); r.addColorStop(1, 'rgba(255,90,60,0)'); g.fillStyle = r; g.fillRect(0, 0, 512, 512); g.strokeStyle = 'rgba(255,255,255,.35)'; g.lineWidth = 6; for (const rr of [150, 190, 230]) { g.beginPath(); g.arc(256, 256, rr, 0, 7); g.stroke(); } });
const hostBack = new THREE.Mesh(new THREE.PlaneGeometry(2.6, 2.6), new THREE.MeshBasicMaterial({ map: ringTex, transparent: true, depthWrite: false, toneMapped: false })); scene.add(hostBack);
const _hp = new THREE.Vector3();
function poseAna(t, o = {}) {
  ana.root.visible = true; ana.reset();
  const f = o.flinch || 0, sh = (o.shake || 0) * Math.sin(t * 37) * .012, br = Math.sin(t * 1.7) * .005;
  const hy = 1.12 - f * .08 + br, hz = .3 + f * .14;
  const hold = V(sh, hy, hz);
  const rT = o.rHand || V(-.05 + sh, hy, hz);
  if (!o.armsDown) { ana.arm('R', rT, V(-.7, .8, -.3)); if (!o.oneHand) ana.arm('L', V(.05 + sh, hy, hz), V(.7, .8, -.3)); }
  const lk = o.look || V(0, hy + .04, hz);
  ana.look(lk.clone().lerp(V(0, 1.8, 1.6), f), o.lookAmt ?? .85);
  if (o.phone !== false) {
    anaPhone.visible = true;
    if (o.phonePos) anaPhone.position.copy(o.phonePos); else anaPhone.position.copy(ana.w(o.rHand ? rT.clone().add(V(.04, .05, .02)) : V(sh, hy + .05, hz + .02)));
    ana.b.Head.getWorldPosition(_hp); if (!o.phoneQuat) anaPhone.lookAt(_hp);
  }
}
function poseHost(t, mode = 'talk') {
  host.root.visible = true; host.reset();
  const lp = LIP[Math.min(LIP.length - 1, Math.round(t * 30))] || 0;
  host.mouth(lp * .9, .3);
  if (mode === 'wave') host.arm('R', V(-.42 + .08 * Math.sin(t * 9), 1.8, .14), V(-.9, 1.3, -.5));
  else host.arm('R', V(-.24 + .05 * Math.sin(t * 2.3), 1.36 + .06 * Math.sin(t * 3.1) + lp * .06, .46), V(-.8, .9, -.4));
  host.arm('L', V(.26 + .04 * Math.sin(t * 1.9 + 1), 1.3 + .05 * Math.sin(t * 2.7 + 2) + lp * .04, .44), V(.8, .9, -.4));
  const cl = host.root.worldToLocal(camera.position.clone());
  cl.x += mode === 'no' ? Math.sin(t * 13) * 1.1 : Math.sin(t * .9) * .15; cl.y += Math.sin(t * 1.3) * .08;
  host.look(cl, .75);
}
function hostShot(t, t0, t1, mode) {
  show('stu'); setBG('studio'); only([floor]);
  host.root.position.set(0, -1.4, 0); host.root.rotation.y = 0;
  hostBack.visible = true; hostBack.position.set(0, .25, -1.0); hostBack.rotation.z = t * .2;
  const k = eio(prog(t, t0, t1));
  cam(V(lerp(.25, -.15, k), .35, lerp(2.9, 2.35, k)), V(0, .18, 0), 38);
  poseHost(t, mode);
}
// ---------- main frame ----------
function frame(t) {
  // reset overlays
  for (const el of ovEl.children) el.style.opacity = 0;
  ana.root.visible = host.root.visible = anaPhone.visible = anaHeat.visible = hostBack.visible = false;
  hemi.intensity = 1.5; key.intensity = 2.2; key.color.set(0xfff1dc);
  const sc = S.findIndex((s, i) => t >= s && t < S[i + 1]); const [a, b] = SC(Math.max(0, sc));
  const lt = t - a;

  const tV = T('Vamos', 14) - .15;
  if (sc <= 1 && t >= tV) { hostShot(t, tV, S[2], 'talk'); titleEl.style.opacity = 0; }
  else if (sc <= 1) { // HOOK + intro (sunny park) with Ana
    show('out'); setBG('sunny');
    const tq = T('quema');
    const heat = sc === 0 ? .9 + .1 * Math.sin(t * 6) : lerp(.5, 1, prog(t, tq - .5, tq + .3));
    const fl = sc === 0 ? .55 * eback(prog(t, .3, .7)) : eback(prog(t, tq - .1, tq + .3)) * (1 - .4 * prog(t, tq + 1.2, tq + 2.2));
    ana.root.position.set(0, 0, 0); ana.root.rotation.y = .35;
    heroPhone.visible = false;
    poseAna(t, { flinch: clamp(fl, 0, 1.1), shake: heat > .8 ? 1 : 0 });
    anaPhone.userData.heat(heat); anaPhone.userData.draw((c, w, h) => scrGame(c, w, h, t));
    anaHeat.visible = true; anaHeat.position.copy(anaPhone.position); anaHeat.userData.update(t, heat, .07, .05, .55, .6);
    if (sc === 0) {
      const k = eio(prog(t, 0, S[1]));
      cam(vl(V(.5, 1.5, 1.55), V(.85, 1.55, 2.3), k), vl(V(0, 1.62, .2), V(0, 1.6, .2), k), 40);
    } else {
      const k = eio(prog(t, a, tV));
      cam(vl(V(1.7, 1.55, 3.3), V(-1.3, 1.5, 2.9), k), V(0, 1.22, .2), 42);
    }
    titleEl.style.opacity = sc === 0 ? 1 : 1 - prog(t, S[1], S[1] + .25);
    titleEl.style.transform = `scale(${sc === 0 ? lerp(.85, 1, eback(prog(t, 0, .35))) : 1})`;
  } else titleEl.style.opacity = 0;

  if (sc === 2 || sc === 3) { // inside the phone
    show('ins'); setBG('inside'); hemi.intensity = .9; key.intensity = 1.6;
    let heat;
    if (sc === 2) heat = lerp(.25, 1, prog(t, T('Juegos', 22) - .3, T('suma') + .3));
    else heat = lerp(1, .45, prog(t, T('bajar', 34), T('calor', 36) + .5));
    chipMat.emissive.setRGB(heat * .9, heat * .25, heat * .04); chip.userData.top.material.emissive.setRGB(heat * .5, heat * .12, 0);
    chipLight.intensity = heat * 12; chipHeat.userData.update(t, heat * 1.3, 1.1, 1.1, 3.2, .4);
    drawBat(1);
    const sv = sc === 3 ? prog(t, T('defiende') - .2, T('defiende') + .4) : 0;
    shield.material.opacity = sv * (.55 + .15 * Math.sin(t * 5)); shieldFill.material.opacity = sv * .12; shield.rotation.y = t * .4; shield.scale.setScalar(lerp(.6, 1, eback(sv)));
    if (sc === 2) {
      const k = eio(prog(t, a, a + 3.2)), k2 = eio(prog(t, a + 3.2, b));
      const p0 = V(0, 14, 9), p1 = V(3.5, 5.5, 4.5), p2 = V(-1.2, 4.2, 3.6);
      cam(k2 > 0 ? vl(p1, p2, k2) : vl(p0, p1, k), V(-1.6, 0, -3), 42);
      icEls.forEach((el, i) => { const tw = T(ICONS[i][3], 22) - .1; pop(el, t, tw, b - .1); });
    } else {
      const k = eio(prog(t, a, b));
      cam(vl(V(-1.2, 4.2, 3.6), V(-5.5, 4.8, 2.5), k), V(-1.6, .4, -3), 42);
      const g0 = T('bajar', 34) - .2;
      if (pop(gauge, t, g0, T('tercio') - .3) > 0) { const n = gauge.querySelector('#needle'); const ang = lerp(70, -62, eio(prog(t, g0, g0 + 2.2))) + Math.sin(t * 9) * 1.5; n.setAttribute('transform', `rotate(${ang} 280 300)`); }
      const t3 = T('tercio') - .3;
      if (pop(third, t, t3, b) > 0) { const v = eio(prog(t, t3 + .2, t3 + 1.4)); third.querySelector('#thb').style.width = lerp(100, 66.7, v) + '%'; }
    }
  }

  if (sc === 4) { // phone screen states
    show('stu'); setBG('studio'); only([bigPhone, floor]);
    const tb = T('brillo') - .2, tp = T('pausa', 49) - .2, tw = T('aviso') - .2;
    const heat = .55 + .1 * Math.sin(t * 3);
    bigPhone.position.set(0, .25, 0); bigPhone.rotation.set(-.05, Math.sin(t * .6) * .12, 0); bigPhone.scale.setScalar(1.25);
    bigPhone.userData.heat(heat * .5);
    stuHeat.position.set(0, .8, -.3); stuHeat.userData.update(t, heat, .7, .2, 2, .45);
    if (t < tw) {
      const sl = 1 - eio(prog(t, tb, tb + 1.4));
      bigPhone.userData.draw((c, w, h) => scrHome(c, w, h, { slider: sl, dim: (1 - sl) * .45, bolt: true, paused: t >= tp }));
    } else bigPhone.userData.draw((c, w, h) => scrWarn(c, w, h));
    const k = eio(prog(t, a, b));
    cam(vl(V(0, .5, 4.6), V(.4, .4, 3.7), k), V(0, .25, 0), 42);
  }

  if (sc === 5 || sc === 6) { // myth 1: explosion / warning signs ; real: battery wear + car
    show('stu');
    const tc = T('dejes', 104) - 1.6;
    const tEl = T('El', 63.3) - .1;
    if (sc === 5 && t < tEl) {
      hostShot(t, a, tEl, t >= T('No', 62) - .1 ? 'no' : 'talk'); setBG('warm');
      slam(mitoStamp, t, T('No', 62) - .05, tEl + .05, -8);
    } else if (sc === 5) {
      setBG('warm'); only([bigPhone, bat, floor]);
      const tb = T('incendios', 67) - .2;
      const phV = 1 - prog(t, tb - .3, tb);
      bigPhone.visible = phV > 0; bigPhone.scale.setScalar(1.15 * Math.max(.001, phV)); bigPhone.position.set(0, .2, 0); bigPhone.rotation.set(0, t * .5, 0);
      bigPhone.userData.heat(.6); bigPhone.userData.draw((c, w, h) => scrGame(c, w, h, t)); stuHeat.position.set(0, .8, -.3); stuHeat.userData.update(t, .8 * phV, .7, .3, 2, .45);
      slam(mitoStamp, t, tEl - .3, T('frenarse') + 1.6, -8, true);
      const bv = prog(t, tb, tb + .5); bat.visible = bv > 0; bat.scale.setScalar(Math.max(.001, eback(bv)));
      bat.position.set(0, .3, 0); bat.rotation.set(0, Math.sin(t * .7) * .4, 0);
      const ti = T('infla') - .1, tr = T('raro') - .2, th = T('demasiado', 80) - .1;
      const inf = eio(prog(t, ti, ti + .8));
      bulge.scale.set(.75, 1.15, inf * .32 + .001); bulgeB.scale.set(.75, 1.15, inf * .32 + .001); bulge.position.z = .12; bulgeB.position.z = -.12;
      drawBat2(.8, inf > .1);
      smell.children.forEach((s, i) => { s.material.opacity = prog(t, tr, tr + .4) * (.6 + .4 * Math.sin(t * 4 + i)); s.position.y = 1.2 + ((t * .3 + i * .3) % .4); });
      batBody.material.emissive.setRGB(prog(t, th, th + .5) * .7, prog(t, th, th + .5) * .15, 0);
      const ss = T('señal', 75) - .2;
      [ti, tr, th].forEach((x, i) => { pop(signs[i], t, x, b - .1); });
      cam(V(0, .9, 5.4), V(0, .35, 0), 42);
      if (t >= ss) { cam(V(0, .7, 7.6), V(0, -.25, 0), 42); bat.scale.setScalar(Math.max(.001, eback(bv)) * .72); bat.position.y = .55; }
    } else if (t < tc) {
      setBG('studio'); only([bat, floor]);
      bat.position.set(0, .45, 0); bat.rotation.set(0, Math.sin(t * .5) * .3, 0); bat.scale.setScalar(1.2);
      bulge.scale.set(.9, 1.4, .001); bulgeB.scale.set(.9, 1.4, .001); smell.children.forEach(s => s.material.opacity = 0);
      const td = T('desgasta') - .3, tv = T('vuelve', 95) - .4, tA = T('Apple', 97) - .1;
      const lev = lerp(1, .72, eio(prog(t, td + .3, tv)));
      drawBat2(lev, false);
      batBody.material.emissive.setRGB(.5 * (1 - prog(t, tv, tv + 1)), .1 * (1 - prog(t, tv, tv + 1)), 0);
      stuHeat.visible = true; stuHeat.position.set(0, 1, -.2); stuHeat.userData.update(t, .9 * (1 - prog(t, tv, tv + 1)), .7, .25, 1.8, .45);
      slam(realStamp, t, a + .2, td - .05, -6);
      if (pop(thermo, t, tA, tc) > 0) thermo.querySelector('#thm').setAttribute('y', lerp(500, 300, eio(prog(t, tA, tA + 1.5))));
      const k = eio(prog(t, a, tA));
      cam(vl(V(0, .8, 5.2), V(-.8, .9, 5.4), k), V(0, .45, 0), 42);
      if (t >= tA) { bat.position.x = lerp(0, -.7, eio(prog(t, tA, tA + .6))); bat.scale.setScalar(lerp(1.2, .75, eio(prog(t, tA, tA + .6)))); }
    } else {
      setBG('hot'); only([car]); hemi.intensity = 2; key.intensity = 3.2; key.color.set(0xffd9a0);
      const k = eio(prog(t, tc, b));
      const hv = prog(t, tc + .3, b);
      car.userData.phone.userData.heat(hv); car.userData.phone.userData.draw((c, w, h) => scrHome(c, w, h, { dim: .2 }));
      car.userData.heat.userData.update(t, hv * 1.3, 1.2, .6, 2, .5);
      cam(vl(V(5.0, 2.4, 8.2), V(3.6, 2.1, 6.6), k), V(-.6, 1.9, 0), 42);
    }
  }

  if (sc === 7) { // skin
    show('stu'); setBG('warm'); only([floor]);
    ana.root.position.set(0, -1.4, 0); ana.root.rotation.y = -.3;
    const hv = .35 + .65 * prog(t, T('contacto', 109), T('molestias'));
    poseAna(t, { shake: prog(t, T('molestias') - .2, T('molestias') + .3) * .6 });
    anaPhone.userData.heat(hv); anaPhone.userData.draw((c, w, h) => scrHome(c, w, h, { bolt: true }));
    handGlow.visible = true; handGlow.position.copy(anaPhone.position); handGlow.scale.setScalar(.55 + .1 * Math.sin(t * 4)); handGlow.material.opacity = hv * .8;
    anaHeat.visible = true; anaHeat.position.copy(anaPhone.position); anaHeat.userData.update(t, hv, .07, .05, .5, .6);
    const k = eio(prog(t, a, b));
    cam(vl(V(1.0, .05, 2.2), V(.55, -.1, 1.45), k), V(0, -.2, .2), 40);
  }

  if (sc === 8) { // fridge myth
    show('stu'); setBG('cool'); only([fridge, floor]);
    fridge.position.set(-.35, -1.4, -.55); fridge.scale.setScalar(.6);
    const tn = T('No', 126) - .05, th = T('humedad') - .2;
    const open = eio(prog(t, a + .2, a + 1.2)) * (1 - eio(prog(t, tn - .4, tn)) * .0);
    fridge.userData.hinge.rotation.y = -open * 1.9;
    const fp = fridge.userData.phone; fp.userData.heat(.7 * (1 - prog(t, tn, tn + 1.5))); fp.userData.draw((c, w, h) => scrHome(c, w, h, {}));
    const dv = prog(t, th, th + 1.2); fridge.userData.drops.children.forEach(d => d.scale.setScalar(Math.max(.001, prog(dv, d.userData.k * .6, d.userData.k * .6 + .4))));
    fridge.userData.mist.userData.update(t, .7 * open, .7, .3, 1.5, .25);
    slam(mito2Stamp, t, tn, th - .1, -8);
    ana.root.position.set(.62, -1.4, .2); ana.root.rotation.y = -1.15; ana.root.updateMatrixWorld(true);
    const fpW = fp.getWorldPosition(new THREE.Vector3());
    const reach = eio(prog(t, a + .7, a + 1.7)), back = eio(prog(t, tn - .1, tn + .5));
    fridge.updateMatrixWorld(true);
    const holdL = V(-.05, 1.12, .3), inL = ana.root.worldToLocal(fpW.clone()).add(V(0, -.04, 0));
    const hand = holdL.clone().lerp(inL, reach * (1 - back));
    fp.visible = reach >= 1;
    poseAna(t, { oneHand: true, rHand: hand, look: reach > .5 ? inL : V(0, 1.2, .4), phone: reach < 1, armsDown: back >= 1 });
    if (reach < 1) { anaPhone.userData.heat(.7); anaPhone.userData.draw((c, w, h) => scrHome(c, w, h, {})); }
    const k = eio(prog(t, a, b));
    cam(vl(V(1.9, .05, 3.6), V(1.2, -.15, 2.7), k), V(-.05, -.55, -.2), 40);
  }

  if (sc === 9) { // no single limit
    show('stu'); setBG('studio'); only([row, floor]);
    rowPhones.forEach((p, i) => { p.position.y = (i < 2 ? .95 : -.9) + Math.sin(t * 1.5 + i) * .06; p.userData.heat(.3 + .3 * Math.sin(t * 1.3 + i * 1.7) ** 2); const qv = prog(t, T('única') - .3 + i * .15, T('única') + i * .15); p.userData.draw((c, w, h) => { scrHome(c, w, h, {}); if (qv > 0) { c.fillStyle = `rgba(5,8,20,${.7 * qv})`; c.fillRect(0, 0, w, h); c.globalAlpha = qv; c.fillStyle = ['#ffd34d', '#5ef0c0', '#7ad0ff', '#ff8a8a'][i]; c.font = '900 170px N'; c.textAlign = 'center'; c.fillText('?°', w / 2, h / 2 + 60); } }); });
        const k = eio(prog(t, a, b));
    cam(vl(V(0, .2, 7.6), V(0, .1, 6.6), k), V(0, -.05, 0), 42);
  }

  if (sc === 10) { // verdict
    show('stu'); setBG('studio'); only([bigPhone, floor]);
    bigPhone.position.set(0, -.2, -2); bigPhone.rotation.set(0, t * .6, 0); bigPhone.scale.setScalar(1); bigPhone.userData.heat(.2); bigPhone.userData.draw((c, w, h) => scrHome(c, w, h, {}));
    stuHeat.visible = false;
    const qs = [T('Explota', 143), T('pone', 147), T('gasta', 151)];
    verEls.forEach((el, i) => pop(el, t, qs[i] - .2, b, 'up'));
    cam(V(0, .4, 5), V(0, -.1, -2), 42);
  }

  if (sc === 11) { // solution: shade
    show('out'); setBG('sunny');
    const cool = eio(prog(t, a, b - 1));
    const tput = a + .9, put = eio(prog(t, a + .1, tput));
    ana.root.position.set(-2.55, 0, -.55); ana.root.rotation.y = -.9; ana.root.updateMatrixWorld(true);
    heroPhone.position.set(-2.0, .62, -1.35); heroPhone.rotation.set(-Math.PI / 2, 0, .3); heroPhone.scale.setScalar(.095);
    const benchL = ana.root.worldToLocal(heroPhone.position.clone());
    const hand = V(-.05, 1.12, .3).lerp(benchL.clone().add(V(0, .03, 0)), put);
    const rel = eio(prog(t, tput + .2, tput + .8));
    poseAna(t, { oneHand: true, rHand: hand, phone: false, armsDown: rel >= 1, look: rel > .3 ? ana.root.worldToLocal(camera.position.clone()) : benchL, lookAmt: .7 });
    if (put < 1) { anaPhone.visible = true; anaPhone.position.copy(ana.w(hand.clone().add(V(.03, .02, .03)))); anaPhone.rotation.set(-Math.PI / 2, 0, .3); anaPhone.userData.heat(.8); heroPhone.visible = false; }
    else heroPhone.visible = true;
    heroPhone.userData.heat(lerp(.8, 0, cool)); heroPhone.userData.draw((c, w, h) => { scrHome(c, w, h, {}); c.fillStyle = 'rgba(0,0,0,.75)'; c.fillRect(0, 0, w, h); });
    heroHeat.position.copy(heroPhone.position); heroHeat.userData.update(t, lerp(1, 0, cool) * (put >= 1 ? 1 : 0), .08, .05, .5, .5);
    SOL.forEach((s, i) => pop(solEls[i], t, [T('descansar', 156), T('cierra', 159), T('sácalo', 162), T('enfríe', 162)][i] - .25, b, 'up'));
    const k = eio(prog(t, a, b));
    cam(vl(V(-1.0, 1.4, 1.9), V(-1.45, 1.3, 1.4), k), V(-2.25, .95, -.9), 42);
  }

  if (sc === 12) { // CTA + next
    const tp = T('pendiente', 169) - .15;
    if (t < tp) { hostShot(t, a, tp, t < T('comenta', 166) - .2 ? 'talk' : 'wave'); pop(cta, t, T('comenta', 166) - .3, tp); }
    else { show('stu'); setBG('studio'); only([pil, floor]); floor.visible = false; }
    const pv = prog(t, tp, tp + .4);
    pil.visible = t >= tp; pil.position.set(0, -1.2, -1); pil.rotation.y = -.35 + t * .05;
    pil.userData.glow.material.opacity = (.35 + .25 * Math.sin(t * 4)) * pv;
    pop(pend, t, tp, DUR + 1);
    if (t >= tp) cam(vl(V(0, 1.6, 7.5), V(0, 2.2, 6.0), eio(pv)), V(0, -.4, 0), 42);
  }

  // big keywords
  for (const k of KW) kwAnim(k, t);
  caption(t);
  // diagonal wipe at scene cuts (+ host cut-ins)
  let wp = -1; for (const c of CUTS) { const p = prog(t, c - .3, c + .3); if (p > 0 && p < 1) wp = p; }
  if (wp >= 0) { W1.style.transform = `translateX(${lerp(-140, 140, eio(wp))}%) skewX(-14deg)`; W2.style.transform = `translateX(${lerp(-140, 140, eio(clamp(wp * 1.15 - .12)))}%) skewX(-14deg)`; W1.style.opacity = W2.style.opacity = 1; }
  else W1.style.opacity = W2.style.opacity = 0;
  PROG.style.width = (t / DUR * 100) + '%';
  // camera shake on emphasis
  let sk = 0; for (const e of SHK) if (t >= e) sk += Math.exp(-(t - e) * 7);
  if (sk > .01) { camera.position.x += Math.sin(t * 61) * .025 * sk; camera.position.y += Math.cos(t * 47) * .025 * sk; }
  composer.render();
}

window.renderAt = (t) => frame(t);
window.SCENES = S; window.KWT = KW.map(k => k.t0); window.CUTS = CUTS; window.SHK = SHK;
window.READY = true;
