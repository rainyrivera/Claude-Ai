// Reel 9:16 3D — "¿Por qué tienes eyaculación precoz?"
// Personajes 3D procedurales (estilo arcilla) + capa 2D (titulares, karaoke, PENDIENTE).
import * as THREE from 'three';
import { EffectComposer } from 'three/addons/postprocessing/EffectComposer.js';
import { RenderPass } from 'three/addons/postprocessing/RenderPass.js';
import { UnrealBloomPass } from 'three/addons/postprocessing/UnrealBloomPass.js';
import { OutputPass } from 'three/addons/postprocessing/OutputPass.js';

const W = 1080, H = 1920, END = 56.0;
const TIM = await (await fetch('timing.json')).json();
const WORDS = TIM.words, PH = TIM.phrases;
await Promise.all(['500 20px M', '800 20px M', '900 20px M', '500 20px J', '700 20px J'].map(f => document.fonts.load(f)));

// ---------- utilidades ----------
const C = { amber: '#f6b445', red: '#ff4d61', purple: '#a98bff', blue: '#6cc4ff', green: '#35d39a', text: '#eef1f7', dim: '#8a92a8' };
const clamp = (x, a = 0, b = 1) => Math.min(b, Math.max(a, x));
const P = (t, a, d) => clamp((t - a) / d);
const eout = x => 1 - Math.pow(1 - x, 3);
const eio = x => x < .5 ? 4 * x * x * x : 1 - Math.pow(-2 * x + 2, 3) / 2;
const eback = x => { const c1 = 1.7, c3 = c1 + 1; return x <= 0 ? 0 : 1 + c3 * Math.pow(x - 1, 3) + c1 * Math.pow(x - 1, 2); };
const lerp = (a, b, x) => a + (b - a) * x;
const norm = s => s.toLowerCase().replace(/[¿?¡!.,:…]/g, '');
const T = (w, n = 1) => { let k = 0; for (const x of WORDS) if (norm(x.w) === norm(w) && ++k === n) return x.s; throw new Error('word ' + w); };
let seed = 7; const rnd = () => (seed = (seed * 16807) % 2147483647) / 2147483647;
const hexA = (h, a) => { const n = parseInt(h.slice(1), 16); return `rgba(${n >> 16},${(n >> 8) & 255},${n & 255},${a})`; };
const V = (x, y, z) => new THREE.Vector3(x, y, z);

// ---------- renderer ----------
const glc = document.getElementById('gl'), out = document.getElementById('out'), g = out.getContext('2d');
const renderer = new THREE.WebGLRenderer({ canvas: glc, antialias: true, preserveDrawingBuffer: true });
renderer.setPixelRatio(1); renderer.setSize(W, H, false);
renderer.shadowMap.enabled = true; renderer.shadowMap.type = THREE.PCFSoftShadowMap;
renderer.toneMapping = THREE.ACESFilmicToneMapping; renderer.toneMappingExposure = 1.05;
const scene = new THREE.Scene(); scene.fog = new THREE.Fog(0x0a0e1c, 9, 26);
const cam = new THREE.PerspectiveCamera(38, W / H, .05, 100);
const rt = new THREE.WebGLRenderTarget(W, H, { samples: 4, type: THREE.HalfFloatType });
const composer = new EffectComposer(renderer, rt);
composer.addPass(new RenderPass(scene, cam));
const bloom = new UnrealBloomPass(new THREE.Vector2(W / 2, H / 2), .42, .45, .9); composer.addPass(bloom);
composer.addPass(new OutputPass());

// luces globales
const hemi = new THREE.HemisphereLight(0x8aa0ff, 0x10131f, .9); scene.add(hemi);
const key = new THREE.SpotLight(0xfff1e0, 60, 30, .55, .6, 1.6); key.position.set(3.5, 7, 5); key.castShadow = true; key.shadow.mapSize.set(1024, 1024); key.shadow.bias = -.0004; key.shadow.radius = 4; scene.add(key, key.target);
const rim = new THREE.DirectionalLight(0xff4d61, 2.2); rim.position.set(-4, 3, -4); scene.add(rim);
const fill = new THREE.DirectionalLight(0x6cc4ff, .5); fill.position.set(-3, 2, 4); scene.add(fill);

// ---------- materiales / primitivas ----------
const mat = (c, o = {}) => new THREE.MeshStandardMaterial({ color: c, roughness: .55, metalness: 0, ...o });
const glow = (c, i = 2) => new THREE.MeshStandardMaterial({ color: 0x000000, emissive: c, emissiveIntensity: i, roughness: 1 });
function mesh(geo, m, cast = true) { const o = new THREE.Mesh(geo, m); o.castShadow = cast; o.receiveShadow = true; return o; }
const cap = (r, l, m) => mesh(new THREE.CapsuleGeometry(r, l, 8, 18), m);
const sph = (r, m, s = 24) => mesh(new THREE.SphereGeometry(r, s, s), m);
const box = (x, y, z, m) => mesh(new THREE.BoxGeometry(x, y, z), m);
function rbox(x, y, z, r, m) { // caja redondeada simple (extrusión)
  const s = new THREE.Shape(), w = x / 2 - r, h = y / 2 - r;
  s.moveTo(-w, -y / 2); s.lineTo(w, -y / 2); s.quadraticCurveTo(x / 2, -y / 2, x / 2, -h); s.lineTo(x / 2, h); s.quadraticCurveTo(x / 2, y / 2, w, y / 2); s.lineTo(-w, y / 2); s.quadraticCurveTo(-x / 2, y / 2, -x / 2, h); s.lineTo(-x / 2, -h); s.quadraticCurveTo(-x / 2, -y / 2, -w, -y / 2);
  const gm = new THREE.ExtrudeGeometry(s, { depth: z - r * 2 > 0 ? z - r * 2 : .01, bevelEnabled: true, bevelThickness: r, bevelSize: r * .6, bevelSegments: 4, curveSegments: 8 }); gm.center(); return mesh(gm, m);
}
function limb(r, l, m) { const gr = new THREE.Group(); const c = cap(r, l, m); c.position.y = -l / 2 - r * .3; gr.add(c); return gr; }

// ---------- personaje ----------
function makeChar(o) {
  const X = o.xray;
  const xm = (c) => new THREE.MeshStandardMaterial({ color: c, transparent: true, opacity: .16, emissive: 0x1d5a9a, emissiveIntensity: .6, roughness: .3, depthWrite: false });
  const M = c => X ? xm(c) : mat(c);
  const skin = M(o.skin ?? 0xd9a07a), shirt = M(o.shirt ?? 0x3d6bff), pants = M(o.pants ?? 0x262c45), hairM = M(o.hair ?? 0x2a1c14), shoe = M(0x161925);
  const ch = { root: new THREE.Group() };
  const hips = ch.hips = new THREE.Group(); hips.position.y = .98; ch.root.add(hips);
  const pel = cap(.2, .16, pants); pel.rotation.z = Math.PI / 2; pel.position.y = .02; hips.add(pel);
  const spine = ch.spine = new THREE.Group(); spine.position.y = .08; hips.add(spine);
  const torso = cap(.27, .4, shirt); torso.position.y = .32; torso.scale.set(1, 1, .8); spine.add(torso);
  if (o.coat) { const ct = mesh(new THREE.CylinderGeometry(.3, .38, .95, 24, 1, true), mat(0xf3f5fa, { side: THREE.DoubleSide })); ct.position.y = .2; spine.add(ct); const lap = box(.08, .5, .02, mat(0xdfe3ec)); lap.position.set(0, .38, .3); spine.add(lap); }
  const neck = ch.neck = new THREE.Group(); neck.position.y = .66; spine.add(neck);
  const nk = cap(.08, .08, skin); nk.position.y = .02; neck.add(nk);
  const head = ch.head = new THREE.Group(); head.position.y = .3; neck.add(head);
  const hd = sph(.3, skin, 32); hd.scale.set(1, 1.06, .98); head.add(hd);
  if (!X) {
    const hr = mesh(new THREE.SphereGeometry(.318, 32, 20, 0, Math.PI * 2, 0, o.longHair ? 1.75 : 1.25), hairM); hr.rotation.x = -.42; hr.position.y = .02; head.add(hr);
    if (o.longHair) { const bk = cap(.25, .35, hairM); bk.position.set(0, -.18, -.12); bk.scale.set(1.1, 1, .6); head.add(bk); }
    const ew = mat(0xffffff, { roughness: .2 }), ep = mat(0x101018, { roughness: .1 });
    ch.eyes = []; for (const s of [1, -1]) { const e = new THREE.Group(); e.position.set(.105 * s, .04, .245); const w = sph(.068, ew, 16); w.scale.z = .6; const p = sph(.038, ep, 12); p.position.z = .035; e.add(w, p); head.add(e); ch.eyes.push(e); }
    ch.brows = []; for (const s of [1, -1]) { const b = rbox(.12, .03, .03, .012, mat(o.hair ?? 0x2a1c14)); b.position.set(.11 * s, .155, .275); head.add(b); ch.brows.push(b); }
    const nose = sph(.04, skin, 12); nose.position.set(0, -.03, .3); head.add(nose);
    ch.mouth = mesh(new THREE.TorusGeometry(.075, .017, 8, 20, Math.PI), mat(0x5a1f22)); ch.mouth.position.set(0, -.13, .27); head.add(ch.mouth);
    ch.mouthO = sph(.045, mat(0x3a1216), 12); ch.mouthO.scale.set(1, 1.2, .5); ch.mouthO.position.set(0, -.13, .27); head.add(ch.mouthO);
    if (o.glasses) { const gm = mat(0x1a1d28); for (const s of [1, -1]) { const r = mesh(new THREE.TorusGeometry(.075, .012, 8, 24), gm); r.position.set(.105 * s, .04, .29); head.add(r); } const br = box(.06, .012, .012, gm); br.position.set(0, .05, .3); head.add(br); }
    for (const s of [1, -1]) { const ear = sph(.06, skin, 12); ear.position.set(.29 * s, 0, 0); ear.scale.set(.6, 1, .8); head.add(ear); }
  } else {
    // órganos que brillan (modo rayos X)
    ch.brain = sph(.2, glow(0x6cc4ff, 2.2), 24); ch.brain.scale.set(1, .85, 1.1); ch.brain.position.y = .07; head.add(ch.brain);
    ch.thyroid = sph(.07, glow(0xf6b445, 0), 16); ch.thyroid.scale.set(1.6, .7, .7); ch.thyroid.position.set(0, .0, .06); neck.add(ch.thyroid);
    ch.prost = sph(.08, glow(0xf6b445, 0), 16); ch.prost.position.set(0, -.02, .05); hips.add(ch.prost);
    const sp = glow(0x6cc4ff, 1.2); for (let i = 0; i < 9; i++) { const v = sph(.04, sp, 10); v.position.set(0, .05 + i * .075, -.12); spine.add(v); }
    ch.heart = sph(.09, glow(0xff4d61, 1.5), 16); ch.heart.position.set(.08, .4, .08); spine.add(ch.heart);
  }
  ch.sh = []; ch.el = []; ch.hand = [];
  for (const s of [1, -1]) { // 1 = izquierda del personaje (+x)
    const sh = new THREE.Group(); sh.position.set(.34 * s, .56, 0); spine.add(sh);
    const ua = limb(.08, .26, shirt); sh.add(ua);
    const el = new THREE.Group(); el.position.y = -.4; sh.add(el);
    if (o.coat) { const cuff = cap(.085, .2, mat(0xf3f5fa)); cuff.position.y = -.12; el.add(cuff); }
    const fa = limb(.068, .24, skin); el.add(fa);
    const hn = sph(.085, skin, 16); hn.position.y = -.38; hn.scale.set(1, 1.1, .8); el.add(hn);
    ch.sh.push(sh); ch.el.push(el); ch.hand.push(hn);
  }
  ch.hip = []; ch.kn = [];
  for (const s of [1, -1]) {
    const hp = new THREE.Group(); hp.position.set(.13 * s, -.04, 0); hips.add(hp);
    const th = limb(.105, .34, pants); hp.add(th);
    const kn = new THREE.Group(); kn.position.y = -.48; hp.add(kn);
    const sn = limb(.09, .32, pants); kn.add(sn);
    const ft = cap(.08, .14, shoe); ft.rotation.x = Math.PI / 2; ft.position.set(0, -.47, .07); kn.add(ft);
    ch.hip.push(hp); ch.kn.push(kn);
  }
  if (o.clipboard) { const cb = rbox(.3, .4, .03, .01, mat(0x8a6a48)); cb.position.set(0, -.42, .12); cb.rotation.x = -.5; const pp = box(.24, .3, .01, mat(0xf4f4f4)); pp.position.z = .02; cb.add(pp); ch.el[1].add(cb); }
  ch.root.traverse(m => { if (m.isMesh && X) { m.castShadow = false; } });
  return ch;
}
// pose: valores en radianes; campos opcionales
function pose(ch, p = {}, t = 0) {
  const d = (k, v) => p[k] ?? v;
  const br = Math.sin(t * 2.1) * .012 * d('breath', 1);
  ch.hips.position.y = d('hipY', .98) + d('bob', 0);
  ch.hips.rotation.set(d('hipRx', 0), d('hipRy', 0), 0);
  ch.spine.rotation.set(d('spineRx', 0) + br, 0, d('spineRz', 0)); ch.spine.scale.setScalar(1 + br * .6);
  ch.neck.rotation.set(d('neckRx', 0), 0, 0);
  ch.head.rotation.set(d('headRx', 0), d('headRy', 0), d('headRz', 0));
  const L = p.armL ?? [0, .12, 0, 0], R = p.armR ?? [0, -.12, 0, 0];
  ch.sh[0].rotation.set(L[0], L[3] || 0, L[1]); ch.el[0].rotation.set(L[2], 0, 0);
  ch.sh[1].rotation.set(R[0], R[3] || 0, R[1]); ch.el[1].rotation.set(R[2], 0, 0);
  const lg = p.legs ?? [0, 0, 0, 0];
  ch.hip[0].rotation.set(lg[0], 0, p.legSpread ?? 0); ch.kn[0].rotation.x = lg[1]; ch.hip[1].rotation.set(lg[2], 0, -(p.legSpread ?? 0)); ch.kn[1].rotation.x = lg[3];
  if (!ch.eyes) return;
  const em = d('emo', 'neutral'), k = d('emoK', 1);
  const E = { neutral: [0, 0, 0, 1, 0], worried: [.38, .01, 0, 1, 0], sad: [.42, -.01, -1, 1, 0], happy: [-.08, .03, 1, .78, 0], surprised: [.05, .055, 0, 1.18, 1], determined: [-.3, -.01, .35, .9, 0] }[em];
  ch.brows[0].rotation.z = -E[0] * k; ch.brows[1].rotation.z = E[0] * k; ch.brows[0].position.y = ch.brows[1].position.y = .155 + E[1] * k;
  const smile = E[2]; ch.mouth.rotation.z = smile >= 0 ? Math.PI : 0; ch.mouth.position.y = smile >= 0 ? -.11 : -.15; ch.mouth.scale.set(1, Math.abs(smile) < .5 && smile >= 0 ? .25 : Math.max(.4, Math.abs(smile)), 1);
  if (smile >= 0 && smile < .5) { ch.mouth.rotation.z = Math.PI; ch.mouth.scale.set(.8, .25 + smile, 1); }
  ch.mouth.visible = !E[4]; ch.mouthO.visible = !!E[4];
  const blink = d('blink', 1) * (((t * 1.0 + (p.blinkOff ?? 0)) % 3.3) < .12 ? .1 : 1);
  for (const e of ch.eyes) e.scale.set(E[3], E[3] * blink, 1);
  const lk = p.look ?? [0, 0]; for (const e of ch.eyes) e.children[1].position.set(lk[0] * .025, lk[1] * .02, .035);
}
// poses base
const SIT = (h = .55) => ({ hipY: h, legs: [-1.5, 1.5, -1.5, 1.5] });

// ---------- texturas dinámicas ----------
function canvasTex(w, h) { const c = document.createElement('canvas'); c.width = w; c.height = h; const tx = new THREE.CanvasTexture(c); tx.colorSpace = THREE.SRGBColorSpace; tx.anisotropy = 4; return { c, x: c.getContext('2d'), tx }; }
function rrp(x, c, X, Y, w, h, r) { x.beginPath(); x.moveTo(X + r, Y); x.arcTo(X + w, Y, X + w, Y + h, r); x.arcTo(X + w, Y + h, X, Y + h, r); x.arcTo(X, Y + h, X, Y, r); x.arcTo(X, Y, X + w, Y, r); x.closePath(); }
// cronómetro 3D
function makeWatch() {
  const gr = new THREE.Group(), tex = canvasTex(512, 512);
  const face = mesh(new THREE.CircleGeometry(1, 64), new THREE.MeshStandardMaterial({ map: tex.tx, emissive: 0xffffff, emissiveMap: tex.tx, emissiveIntensity: .7, roughness: .5 }), false); face.position.z = .07; gr.add(face);
  const back = mesh(new THREE.CylinderGeometry(1.02, 1.02, .14, 64), mat(0x1a1f33, { metalness: .3, roughness: .4 })); back.rotation.x = Math.PI / 2; gr.add(back);
  const ring = mesh(new THREE.TorusGeometry(1.04, .085, 20, 80), mat(0xb9c0d0, { metalness: .5, roughness: .45 })); ring.position.z = .04; gr.add(ring);
  const crown = rbox(.32, .2, .2, .05, mat(0xeef1f7, { metalness: .6, roughness: .25 })); crown.position.y = 1.24; gr.add(crown);
  const stem = mesh(new THREE.CylinderGeometry(.07, .07, .18, 16), mat(0xeef1f7, { metalness: .6, roughness: .3 })); stem.position.y = 1.1; gr.add(stem);
  gr.userData.draw = (hand, arc, color, readout) => {
    const x = tex.x; x.clearRect(0, 0, 512, 512); x.save(); x.translate(256, 256);
    x.fillStyle = '#070a14'; x.beginPath(); x.arc(0, 0, 256, 0, 6.29); x.fill();
    for (let i = 0; i < 60; i++) { const a = i / 60 * 6.283, l = i % 5 ? 14 : 30; x.strokeStyle = i % 5 ? 'rgba(230,235,245,.35)' : 'rgba(230,235,245,.9)'; x.lineWidth = i % 5 ? 3 : 7; x.beginPath(); x.moveTo(Math.sin(a) * 236, -Math.cos(a) * 236); x.lineTo(Math.sin(a) * (236 - l), -Math.cos(a) * (236 - l)); x.stroke(); }
    if (arc > 0) { x.strokeStyle = color; x.lineWidth = 26; x.lineCap = 'round'; x.beginPath(); x.arc(0, 0, 175, -Math.PI / 2, -Math.PI / 2 + arc * 6.283); x.stroke(); }
    if (readout) { x.font = '700 92px J'; x.fillStyle = '#ffffff'; x.textAlign = 'center'; x.textBaseline = 'middle'; x.fillText(readout, 0, 100); }
    x.rotate(hand); x.strokeStyle = color; x.lineWidth = 12; x.lineCap = 'round'; x.beginPath(); x.moveTo(0, 30); x.lineTo(0, -200); x.stroke(); x.rotate(-hand);
    x.fillStyle = color; x.beginPath(); x.arc(0, 0, 18, 0, 6.29); x.fill(); x.restore(); tex.tx.needsUpdate = true;
  };
  return gr;
}
// etiqueta (sprite) tipo píldora
function label(text, color, { size = 64, w = 0, dark = true, font = 'M', weight = 900, h = 0 } = {}) {
  const cx = document.createElement('canvas').getContext('2d'); cx.font = `${weight} ${size}px ${font}`; const tw = w || cx.measureText(text).width + size * 1.2, th = h || size * 1.7;
  const t = canvasTex(Math.ceil(tw), Math.ceil(th)), x = t.x; x.font = `${weight} ${size}px ${font}`;
  if (dark) { x.fillStyle = 'rgba(14,18,34,.92)'; rrp(x, 0, 3, 3, tw - 6, th - 6, (th - 6) / 2); x.fill(); x.lineWidth = 6; x.strokeStyle = color; x.stroke(); }
  x.fillStyle = dark ? color : color; x.textAlign = 'center'; x.textBaseline = 'middle'; x.fillText(text, tw / 2, th / 2 + size * .05);
  const sp = new THREE.Sprite(new THREE.SpriteMaterial({ map: t.tx, transparent: true, depthWrite: false })); sp.scale.set(tw / 400, th / 400, 1); sp.userData.base = sp.scale.clone(); return sp;
}
function popSprite(sp, t, at, d = .35) { const k = eback(P(t, at, d)); sp.visible = t >= at; sp.scale.copy(sp.userData.base).multiplyScalar(Math.max(.001, k)); sp.material.opacity = clamp(P(t, at, .15)); }

// ---------- escenarios ----------
const SETS = {}; const mkSet = n => { const s = new THREE.Group(); s.visible = false; scene.add(s); SETS[n] = s; return s; };
// suelo con brillo radial
function floorDisc(color, r = 9) { const t = canvasTex(512, 512), x = t.x; const gr = x.createRadialGradient(256, 256, 0, 256, 256, 256); gr.addColorStop(0, color); gr.addColorStop(1, 'rgba(8,10,20,0)'); x.fillStyle = '#0a0d19'; x.fillRect(0, 0, 512, 512); x.fillStyle = gr; x.fillRect(0, 0, 512, 512); const m = mesh(new THREE.CircleGeometry(r, 64), new THREE.MeshStandardMaterial({ map: t.tx, roughness: .85 }), false); m.rotation.x = -Math.PI / 2; m.receiveShadow = true; return m; }

// A) Dormitorio nocturno
const bed = mkSet('bed');
{
  const fl = mesh(new THREE.PlaneGeometry(30, 30), mat(0x141a2e, { roughness: .9 }), false); fl.rotation.x = -Math.PI / 2; bed.add(fl);
  const wall = mesh(new THREE.PlaneGeometry(30, 12), mat(0x1a2140, { roughness: 1 }), false); wall.position.set(0, 6, -3.2); bed.add(wall);
  const frame = rbox(2.3, .35, 2.6, .06, mat(0x3b2a22)); frame.position.set(0, .3, -1.6); bed.add(frame);
  const head = rbox(2.4, 1.3, .14, .05, mat(0x46332a)); head.position.set(0, .8, -2.9); bed.add(head);
  const matt = rbox(2.15, .3, 2.45, .1, mat(0xdfe4ef)); matt.position.set(0, .6, -1.6); bed.add(matt);
  const blanket = rbox(2.2, .14, 1.5, .07, mat(0x30407a)); blanket.position.set(0, .78, -1.0); bed.add(blanket);
  for (const s of [-.55, .55]) { const pil = rbox(.8, .2, .5, .1, mat(0xf2f4fa)); pil.position.set(s, .84, -2.55); bed.add(pil); }
  const ns = rbox(.6, .6, .5, .04, mat(0x3b2a22)); ns.position.set(1.65, .3, -2.4); bed.add(ns);
  const lampB = mesh(new THREE.CylinderGeometry(.05, .1, .4, 16), mat(0xd8c7a8)); lampB.position.set(1.65, .8, -2.4); bed.add(lampB);
  const shade = mesh(new THREE.CylinderGeometry(.16, .26, .3, 24, 1, true), new THREE.MeshStandardMaterial({ color: 0xffd9a0, emissive: 0xffb45a, emissiveIntensity: 1.6, side: THREE.DoubleSide })); shade.position.set(1.65, 1.1, -2.4); bed.add(shade);
  const lamp = new THREE.PointLight(0xffb45a, 9, 7, 1.6); lamp.position.set(1.6, 1.1, -2.1); bed.add(lamp); bed.userData.lamp = lamp;
  const win = mesh(new THREE.PlaneGeometry(1.4, 1.9), new THREE.MeshStandardMaterial({ color: 0x000000, emissive: 0x1d3a7a, emissiveIntensity: 1 }), false); win.position.set(-1.9, 2.4, -3.18); bed.add(win);
  const moon = mesh(new THREE.CircleGeometry(.2, 32), glow(0xdfe8ff, 2.5), false); moon.position.set(-1.6, 2.9, -3.17); bed.add(moon);
  for (const [x, y, w, h] of [[-1.9, 2.4, .06, 1.95], [-1.9, 2.4, 1.45, .06], [-2.62, 2.4, .08, 2], [-1.18, 2.4, .08, 2], [-1.9, 3.38, 1.5, .08], [-1.9, 1.42, 1.5, .08]]) { const b = box(w, h, .06, mat(0x2a3150)); b.position.set(x, y, -3.15); bed.add(b); }
  const rug = mesh(new THREE.CircleGeometry(1.4, 48), mat(0x6b3a3a, { roughness: 1 }), false); rug.rotation.x = -Math.PI / 2; rug.position.set(0, .01, .6); rug.scale.set(1.3, .8, 1); bed.add(rug);
}
const manBed = makeChar({ shirt: 0x3d6bff }); manBed.root.position.set(0, 0, -.1); bed.add(manBed.root);
const partner = makeChar({ shirt: 0xe0648a, pants: 0x2d2a45, hair: 0x4a2a1c, longHair: true, skin: 0xc98f6c }); partner.root.position.set(.75, 0, -.15); partner.root.scale.setScalar(.95); bed.add(partner.root);
const watchBed = makeWatch(); watchBed.position.set(0, 2.55, -.6); bed.add(watchBed);
const qMark = label('?', C.amber, { size: 200, dark: false }); qMark.position.set(.6, 2.2, .3); bed.add(qMark);
const cloud = new THREE.Group(); { const cm = mat(0x3a4058, { roughness: 1 }); [[0, 0, 0, .32], [.3, .05, 0, .26], [-.3, .02, 0, .25], [.12, .2, 0, .25], [-.15, .17, 0, .22]].forEach(([x, y, z, r]) => { const s = sph(r, cm, 16); s.position.set(x, y, z); cloud.add(s); }); const bolt = mesh(new THREE.ConeGeometry(.06, .45, 4), glow(0xffe08a, 3)); bolt.position.set(.05, -.35, .05); bolt.rotation.z = .3; cloud.add(bolt); cloud.userData.bolt = bolt; }
bed.add(cloud);
const loop = new THREE.Group(); { const tor = mesh(new THREE.TorusGeometry(1.25, .03, 8, 120), glow(0xff4d61, 1.6), false); tor.rotation.x = Math.PI / 2; loop.add(tor); const runners = []; for (let i = 0; i < 3; i++) { const r = sph(.09 - i * .02, glow(0xff4d61, 3 - i * .8), 12); loop.add(r); runners.push(r); } loop.userData.runners = runners; const labs = ['MIEDO', 'PRISA', 'TERMINAS', 'MÁS MIEDO'].map((s, i) => { const l = label(s, i === 3 ? C.red : '#ffffff', { size: 54 }); l.material.color.set(i === 3 ? 0xffffff : 0xffffff); loop.add(l); return l; }); loop.userData.labs = labs; }
bed.add(loop);
const tagsCause = ['ANSIEDAD', 'ERECCIÓN', 'CUERPO'].map((s, i) => { const l = label(s, [C.red, C.purple, C.blue][i], { size: 58 }); bed.add(l); return l; });
const pollWatch = makeWatch(); bed.add(pollWatch);

// B) Laboratorio / experimento
const lab = mkSet('lab');
lab.add(floorDisc('#4a3a1c', 14));
const sci = makeChar({ coat: true, shirt: 0x2fa58a, pants: 0x283048, glasses: true, clipboard: true, hair: 0x5b4636 }); sci.root.position.set(-.9, 0, 2.2); sci.root.rotation.y = .35; lab.add(sci.root);
const NC = 72; const crowd = { body: new THREE.InstancedMesh(new THREE.CapsuleGeometry(.13, .34, 4, 10), mat(0xffffff), NC * 2), head: new THREE.InstancedMesh(new THREE.SphereGeometry(.13, 14, 12), mat(0xd9a07a), NC * 2), dot: new THREE.InstancedMesh(new THREE.SphereGeometry(.07, 12, 10), glow(0xf6b445, 3), NC) };
{ const cols = [0x3d6bff, 0xe0648a, 0x35d39a, 0xa98bff, 0xf6b445, 0x6cc4ff], sk = [0xd9a07a, 0xc98f6c, 0x8d5a3c, 0xeac3a0]; crowd.pos = [];
  for (let i = 0; i < NC; i++) { const gx = i % 9 - 4, gz = Math.floor(i / 9); crowd.pos.push(V(gx * 1.0 + (gz % 2) * .5, 0, -gz * 1.0 - .3)); for (let k = 0; k < 2; k++) { crowd.body.setColorAt(i * 2 + k, new THREE.Color(cols[(i * 2 + k) % 6])); crowd.head.setColorAt(i * 2 + k, new THREE.Color(sk[(i + k) % 4])); } }
  for (const m of [crowd.body, crowd.head]) { m.castShadow = true; m.receiveShadow = true; lab.add(m); } lab.add(crowd.dot); }
const watchLab = makeWatch(); lab.add(watchLab);
const phone = new THREE.Group(); const phTex = canvasTex(400, 820); { const b = rbox(1.0, 2.0, .1, .04, mat(0x111421, { metalness: .4, roughness: .3 })); phone.add(b); const sc = mesh(new THREE.PlaneGeometry(.92, 1.88), new THREE.MeshStandardMaterial({ map: phTex.tx, emissive: 0xffffff, emissiveMap: phTex.tx, emissiveIntensity: .5 }), false); sc.position.z = .055; phone.add(sc); } lab.add(phone);
const countryTags = ['HOLANDA', 'R. UNIDO', 'ESPAÑA', 'TURQUÍA', 'EE. UU.'].map(s => { const l = label(s, C.blue, { size: 46 }); lab.add(l); return l; });

// C) Consulta del médico
const doc = mkSet('doc');
doc.add(floorDisc('#1d3f63', 10));
const doctor = makeChar({ coat: true, shirt: 0x2fa58a, pants: 0x223047, glasses: true, hair: 0x9a9aa4, skin: 0xb98261 }); doctor.root.position.set(-1.05, 0, .4); doctor.root.rotation.y = .5; doc.add(doctor.root);
const manDoc = makeChar({ shirt: 0x3d6bff }); manDoc.root.position.set(1.15, 0, .9); manDoc.root.rotation.y = -.7; doc.add(manDoc.root);
const stool = mesh(new THREE.CylinderGeometry(.3, .3, .5, 24), mat(0x2a3150)); stool.position.set(1.15, .25, .75); doc.add(stool);
const boardTex = canvasTex(900, 1080); const board = mesh(new THREE.PlaneGeometry(2.5, 3.0), new THREE.MeshStandardMaterial({ map: boardTex.tx, emissive: 0xffffff, emissiveMap: boardTex.tx, emissiveIntensity: .55, transparent: true }), false); board.position.set(.35, 2.65, -.6); doc.add(board);

// D) Batería (erección)
const bat = mkSet('bat');
bat.add(floorDisc('#3a2a6b', 10));
const manBat = makeChar({ shirt: 0x3d6bff }); manBat.root.position.set(.55, 0, .3); bat.add(manBat.root);
const battery = new THREE.Group(); { const shell = mesh(new THREE.CylinderGeometry(.55, .55, 2.1, 40, 1, true), new THREE.MeshStandardMaterial({ color: 0xbfc8ff, transparent: true, opacity: .22, roughness: .1, side: THREE.DoubleSide, depthWrite: false }), false); shell.position.y = 1.05; battery.add(shell); const capT = mesh(new THREE.CylinderGeometry(.22, .22, .18, 24), mat(0xdfe3ff, { metalness: .5 })); capT.position.y = 2.18; battery.add(capT); const base = mesh(new THREE.CylinderGeometry(.57, .57, .08, 40), mat(0xdfe3ff, { metalness: .5 })); base.position.y = .04; battery.add(base); const lvl = mesh(new THREE.CylinderGeometry(.47, .47, 1, 40), new THREE.MeshStandardMaterial({ color: 0x000000, emissive: 0xa98bff, emissiveIntensity: 1.6 }), false); battery.add(lvl); battery.userData.lvl = lvl; }
battery.position.set(-1.05, 0, -.2); bat.add(battery);
const bubble = label('¿Y SI LA PIERDO?', '#141a2e', { size: 56, dark: false }); { const t2 = canvasTex(760, 230), x = t2.x; x.fillStyle = '#f4f5fa'; rrp(x, 0, 6, 6, 748, 160, 80); x.fill(); x.beginPath(); x.arc(120, 196, 22, 0, 6.29); x.arc(70, 222, 10, 0, 6.29); x.fill(); x.font = '900 60px M'; x.fillStyle = '#141a2e'; x.textAlign = 'center'; x.textBaseline = 'middle'; x.fillText('¿Y SI LA PIERDO?', 380, 90); bubble.material.map = t2.tx; bubble.scale.set(760 / 480, 230 / 480, 1); bubble.userData.base = bubble.scale.clone(); }
bubble.position.set(1.0, 3.0, .3); bat.add(bubble);
const acel = label('ACELERAS', C.red, { size: 64 }); acel.position.set(.6, .5, 1.1); bat.add(acel);
const streaks = new THREE.Group(); for (let i = 0; i < 14; i++) { const s = mesh(new THREE.PlaneGeometry(.9 + rnd() * .8, .025), new THREE.MeshBasicMaterial({ color: 0xff8a96, transparent: true, opacity: .7 }), false); s.position.set(1.6 + rnd() * 1.4, .3 + rnd() * 1.9, -.2 + rnd() * .6); s.userData.sp = 4 + rnd() * 4; streaks.add(s); } bat.add(streaks);

// E) Rayos X (cuerpo)
const xr = mkSet('xr');
xr.add(floorDisc('#16466e', 10));
const manX = makeChar({ xray: true }); xr.add(manX.root);
const ringX = mesh(new THREE.TorusGeometry(1.2, .02, 8, 100), glow(0x6cc4ff, 1.4), false); ringX.rotation.x = Math.PI / 2; ringX.position.y = .02; xr.add(ringX);
const serPts = new THREE.Points(new THREE.BufferGeometry(), new THREE.PointsMaterial({ color: 0x9fdcff, size: .05, transparent: true, depthWrite: false, blending: THREE.AdditiveBlending })); { const n = 160, a = new Float32Array(n * 3); serPts.geometry.setAttribute('position', new THREE.BufferAttribute(a, 3)); serPts.userData.n = n; } xr.add(serPts);
const lblSer = label('SEROTONINA', C.blue, { size: 54 }), lblTir = label('TIROIDES', C.amber, { size: 50 }), lblPro = label('PRÓSTATA', C.amber, { size: 50 }); xr.add(lblSer, lblTir, lblPro);

// F) Tratamiento
const tr = mkSet('tr');
tr.add(floorDisc('#145a45', 10));
const mat0 = rbox(1.4, .05, 2.1, .02, mat(0x2fa58a)); mat0.position.set(0, .03, 0); tr.add(mat0);
const manTr = makeChar({ shirt: 0x3d6bff }); tr.add(manTr.root);
const docTr = makeChar({ coat: true, shirt: 0x2fa58a, pants: 0x223047, glasses: true, hair: 0x9a9aa4, skin: 0xb98261 }); tr.add(docTr.root);
const pelvRing = mesh(new THREE.TorusGeometry(.32, .025, 8, 60), glow(0x35d39a, 2.5), false); pelvRing.rotation.x = Math.PI / 2; manTr.hips.add(pelvRing);
const pauseIco = new THREE.Group(); for (const s of [-1, 1]) { const b = rbox(.22, .9, .18, .06, glow(0x35d39a, 1.8)); b.position.x = s * .2; pauseIco.add(b); } tr.add(pauseIco);
const checks = [0, 1, 2].map(i => { const l = label(['1 · SUELO PÉLVICO ✓', '2 · TÉCNICAS DE PAUSA ✓', '3 · UN URÓLOGO ✓'][i], C.green, { size: 46 }); tr.add(l); return l; });

// G) Héroe (hombría → salud)
const hero = mkSet('hero');
hero.add(floorDisc('#1f6b4c', 10));
const manHero = makeChar({ shirt: 0x3d6bff }); hero.add(manHero.root);
const heroGlow = mesh(new THREE.TorusGeometry(.9, .03, 8, 100), glow(0x35d39a, 2), false); heroGlow.rotation.x = Math.PI / 2; heroGlow.position.y = .02; hero.add(heroGlow);

// ---------- línea de tiempo de escenas ----------
const CUTS = [[0, 'bed'], [5.15, 'lab'], [14.95, 'doc'], [23.45, 'bed'], [30.95, 'bat'], [35.35, 'xr'], [41.6, 'tr'], [48.8, 'hero'], [51.25, 'bed']];
const segAt = t => { let i = 0; while (i + 1 < CUTS.length && t >= CUTS[i + 1][0]) i++; return i; };
const ENV = { bed: [0x0b1022, 0x2a3a7a, 0xff4d61], lab: [0x120f0a, 0x6b5a3a, 0xf6b445], doc: [0x0a1424, 0x3a6a9a, 0x6cc4ff], bat: [0x100c22, 0x5a4a9a, 0xa98bff], xr: [0x06101e, 0x2a5a8a, 0x6cc4ff], tr: [0x07150f, 0x3a7a5a, 0x35d39a], hero: [0x07150f, 0x3a7a5a, 0x35d39a] };

function camTo(pos, look, fov = 38) { cam.position.copy(pos); cam.fov = fov * 1.32; cam.updateProjectionMatrix(); cam.lookAt(look); }
const CL = (a, b, x) => a.clone().lerp(b, x);

// ---------- animación por escena ----------
const tEsp = T('espera'), tQui = T('quizás'), tCro = T('cronómetro'), tQuin = T('quinientas'), tPai = T('países'), tProm = T('promedio', 1), tCin = T('cinco', 2), tMed = T('media'), tInt = T('internet');
const tMedi = T('médicos'), tMin2 = T('minutos', 2), tCon = T('controlar'), tAfe = T('afecta'), tExp = T('explicación'), tAns = T('ansiedad'), tMie = T('mientras'), tRap2 = T('rápido', 2);
const tEre = T('erección'), tAce = T('aceleran'), tPer = T('perderla'), tMie2 = T('miedo', 2), tCue = T('cuerpo'), tSer = T('serotonina'), tTir = T('tiroides'), tPro = T('próstata');
const tBue = T('bueno'), tTra = T('tratamiento'), tEje = T('ejercicios'), tTec = T('técnicas'), tUro = T('urólogo'), tHom = T('hombría'), tSal = T('salud'), tSab = T('sabías'), tLeo = T('leo');

function animBed(t, part) {
  const lamp = bed.userData.lamp; lamp.intensity = 9;
  qMark.visible = false; cloud.visible = false; loop.visible = false; tagsCause.forEach(l => l.visible = false); watchBed.visible = false; pollWatch.visible = false; partner.root.visible = false;
  manBed.root.position.set(0, 0, -.1); manBed.root.rotation.y = 0;
  if (part === 0) { // GANCHO
    const frozen = t >= tEsp, tt = (frozen ? tEsp : t) + .8;
    const lookUp = eio(P(t, tQui - .1, .5));
    pose(manBed, { ...SIT(.62), spineRx: lerp(.55, .1, lookUp), neckRx: lerp(.35, -.05, lookUp), headRx: lerp(.15, -.25, lookUp), armL: [lerp(-1.6, -.2, lookUp), .1, lerp(-1.9, -.3, lookUp)], armR: [lerp(-1.6, -.2, lookUp), -.1, lerp(-1.9, -.3, lookUp)], emo: t < tQui ? 'worried' : 'surprised', look: [0, lookUp], breath: frozen ? 0 : 1.5 }, frozen ? tEsp : t);
    watchBed.visible = true; const hand = tt * tt * 2.0 + tt * 5; const secs = Math.floor(tt * 23) % 60;
    watchBed.userData.draw(hand, (hand / 6.283) % 1, frozen ? C.amber : C.red, frozen ? '?:??' : `0:${String(secs).padStart(2, '0')}`);
    watchBed.position.set(0, 2.3 + Math.sin(t * 1.3) * .04, -.8); watchBed.rotation.set(.1, Math.sin(t * .7) * .12, frozen ? 0 : Math.sin(t * 30) * .02 * P(t, 1, 1));
    watchBed.scale.setScalar(.6 * (frozen ? 1 + .05 * Math.sin(P(t, tEsp, .25) * Math.PI) : 1));
    if (t > tQui + .3) { qMark.visible = true; popSprite(qMark, t, tQui + .3); qMark.position.set(.55, 1.95 + Math.sin(t * 3) * .03, .25); }
    lamp.intensity = frozen ? 4 : 9 + Math.sin(t * 13) * 1.5;
    const zoom = eio(P(t, 0, 5.1));
    camTo(V(lerp(.25, -.05, zoom), lerp(1.7, 1.75, zoom), lerp(4.9, 4.2, zoom) - (frozen ? .25 * eout(P(t, tEsp, .4)) : 0)), V(0, 1.65, -.4), 40);
  } else if (part === 1) { // CAUSAS: intro + ansiedad
    const tIn = 23.45;
    const ans = t >= tAns - .1;
    pose(manBed, { ...SIT(.62), spineRx: .3, neckRx: .15, headRx: ans ? .05 : -.05, armL: [-.5, .15, -1.1], armR: [-.5, -.15, -1.1], emo: 'worried', breath: ans ? 3 : 1, look: [0, ans ? .2 : 0] }, t * (ans ? 1.8 : 1));
    tagsCause.forEach((l, i) => { const at = tIn + .1 + i * .2; const out = ans ? 1 - P(t, tAns - .2, .3) : 1; popSprite(l, t, at); l.material.opacity *= out; l.visible = out > 0.01; l.position.set((i - 1) * .95, 2.5 + (i === 1 ? .22 : 0), .2); });
    if (t > tAns - .3) {
      cloud.visible = true; const cp = eback(P(t, tAns - .3, .5)); cloud.scale.setScalar(Math.max(.001, cp)); cloud.position.set(0, 2.55 + Math.sin(t * 2) * .05, -.1);
      cloud.userData.bolt.visible = Math.floor(t * 7) % 5 === 0;
      loop.visible = true; loop.position.set(0, 1.0, -.1); loop.scale.setScalar(Math.max(.001, eback(P(t, tAns, .5))));
      const sp = t - tAns, ang = sp * sp * .9 + sp * 1.6; loop.userData.runners.forEach((r, k) => { const a = ang - k * .22; r.position.set(Math.cos(a) * 1.25, 0, Math.sin(a) * 1.25); });
      loop.userData.labs.forEach((l, i) => { const a = -Math.PI / 2 + i * Math.PI / 2 + .25; l.position.set(Math.cos(a) * 1.05, .2 + (i % 2) * .3, Math.sin(a) * 1.05); popSprite(l, t, tMie + i * .55); if (i === 3) l.scale.multiplyScalar(1 + .08 * Math.sin(t * 9) * P(t, tRap2, .3)); });
      lamp.intensity = 6 + Math.sin(t * 17) * 2;
    }
    const orb = ans ? (t - tAns) * .25 : 0;
    const dist = ans ? 6.4 : lerp(5.4, 5.7, P(t, tIn, 2));
    camTo(V(Math.sin(orb - .15) * dist, ans ? 2.6 : 2.1, Math.cos(orb - .15) * dist - .2), V(0, ans ? 1.55 : 1.6, -.2), 40);
  } else { // CIERRE: pareja + cronómetro 5:24 + encuesta
    partner.root.visible = true;
    manBed.root.position.set(-.45, 0, -.1); partner.root.position.set(.5, 0, -.15);
    const k = eio(P(t, 51.3, .8));
    pose(manBed, { ...SIT(.62), spineRx: .05, headRy: .25 * k, headRz: -.06 * k, armL: [-.3, .2, -.6], armR: [-.4, -.1, -.8], emo: 'happy', look: [.5, 0] }, t);
    pose(partner, { ...SIT(.62), spineRx: .05, spineRz: .08 * k, headRy: -.3 * k, headRz: .12 * k, armL: [-.4, .1, -.7], armR: [-.6, -.5, -.9, .3], emo: 'happy', look: [-.5, 0], blinkOff: 1.3 }, t);
    pollWatch.visible = true; const pw = eback(P(t, 51.3, .5)), fadeW = 1 - eio(P(t, tLeo - .4, .5));
    pollWatch.scale.setScalar(Math.max(.001, .5 * pw * fadeW + .001)); pollWatch.position.set(0, 2.5 + Math.sin(t * 1.5) * .04, -.4); pollWatch.rotation.y = Math.sin(t * .8) * .15;
    pollWatch.userData.draw(5.4 / 60 * 6.283, 5.4 / 60 * eout(P(t, T('promedio', 2), .6)), C.amber, '5:24');
    lamp.intensity = 11;
    const zz = eio(P(t, 51.25, 4.5));
    camTo(V(lerp(-.4, .2, zz), lerp(1.9, 2.3, zz), lerp(4.6, 5.6, zz)), V(0, lerp(1.7, 2.0, zz), -.2), 40);
  }
}
function animLab(t) {
  // científico en primer plano → grúa hacia arriba revelando la multitud
  const cr = eio(P(t, tQuin - .6, 1.6)), up = eio(P(t, tProm - .4, .8));
  pose(sci, { armR: [-1.1, -.2, -1.2], armL: [lerp(-.2, -2.6, P(t, tCro - .2, .4) * (1 - P(t, tQuin, .4))), .25, lerp(0, -.3, 1)], headRy: lerp(-.35, .25, cr), headRx: -.05, emo: t > tCin ? 'surprised' : 'neutral', look: [lerp(-.5, .4, cr), 0] }, t);
  // multitud: aparece en ola; cronómetros (puntos dorados) se encienden
  const tmp = new THREE.Object3D();
  crowd.pos.forEach((p, i) => {
    const d = (Math.abs(p.x) + Math.abs(p.z)) / 12, s = eback(P(t, tQuin - .35 + d * .7, .35));
    for (let k = 0; k < 2; k++) {
      const sx = (k ? .22 : -.22); const bob = Math.sin(t * 3 + i + k) * .01;
      tmp.position.set(p.x + sx, .32 * s + bob, p.z); tmp.rotation.set(0, k ? -1.3 : 1.3, 0); tmp.scale.setScalar(Math.max(.001, s)); tmp.updateMatrix(); crowd.body.setMatrixAt(i * 2 + k, tmp.matrix);
      tmp.position.set(p.x + sx, .78 * s + bob, p.z); tmp.updateMatrix(); crowd.head.setMatrixAt(i * 2 + k, tmp.matrix);
    }
    const ds = eback(P(t, tQuin + .2 + d * .7, .3)) * (1 - P(t, tMed - .3, .4)); tmp.position.set(p.x, 1.15 + Math.sin(t * 4 + i) * .04, p.z); tmp.rotation.set(0, 0, 0); tmp.scale.setScalar(Math.max(.001, ds)); tmp.updateMatrix(); crowd.dot.setMatrixAt(i, tmp.matrix);
  });
  for (const m of [crowd.body, crowd.head, crowd.dot]) m.instanceMatrix.needsUpdate = true;
  countryTags.forEach((l, i) => { popSprite(l, t, tPai - .2 + i * .12); l.material.opacity *= 1 - P(t, tProm - .4, .3); l.position.set((i - 2) * 1.25, 2.2 + (i % 2) * .35, -2.5); });
  // cronómetro grande
  const wIn = P(t, tProm - .4, .5), rolling = t < tCin, pr = rolling ? 0 : eout(P(t, tCin, .9));
  watchLab.visible = t > tProm - .45;
  if (watchLab.visible) {
    const secs = Math.round(pr * 324), ro = rolling ? `${Math.floor(rnd() * 9)}:${String(Math.floor(rnd() * 60)).padStart(2, '0')}` : `${Math.floor(secs / 60)}:${String(secs % 60).padStart(2, '0')}`;
    watchLab.userData.draw(rolling ? t * 9 : pr * 5.4 / 60 * 6.283, pr * 5.4 / 60, C.amber, ro);
    const side = eio(P(t, tMed - .2, .6));
    watchLab.position.set(lerp(0, -.75, side), lerp(4.5, 3.05, eout(wIn)) + Math.sin(t * 1.4) * .04, lerp(-.2, .2, side)); watchLab.scale.setScalar(lerp(.85, .62, side)); watchLab.rotation.set(.05, lerp(0, .25, side), 0);
  }
  // celular "internet" con 30:00 y sello FICCIÓN
  phone.visible = t > tMed - .3;
  if (phone.visible) {
    const ph = eback(P(t, tMed - .3, .5)); phone.position.set(.65, lerp(-.5, 2.9, eout(P(t, tMed - .3, .5))), .4); phone.rotation.set(0, -.3 + Math.sin(t) * .05, -.08); phone.scale.setScalar(Math.max(.001, .9 * ph));
    const x = phTex.x; x.fillStyle = '#0d0f1c'; x.fillRect(0, 0, 400, 820); x.fillStyle = '#2a1f4a'; rrp(x, 0, 30, 140, 340, 260, 24); x.fill();
    x.fillStyle = '#a98bff'; x.beginPath(); x.moveTo(170, 220); x.lineTo(250, 270); x.lineTo(170, 320); x.fill();
    x.font = '700 30px J'; x.fillStyle = '#8a92a8'; x.textAlign = 'center'; x.fillText('INTERNET', 200, 90); x.font = '900 104px M'; x.fillStyle = '#eef1f7'; x.fillText('30:00', 200, 520);
    x.fillStyle = 'rgba(255,255,255,.15)'; rrp(x, 0, 40, 600, 320, 18, 9); x.fill(); x.fillStyle = '#a98bff'; rrp(x, 0, 40, 600, 320 * eout(P(t, tMed, .8)), 18, 9); x.fill();
    if (t > tInt + .05) { const s = eback(P(t, tInt + .05, .3)); x.save(); x.translate(200, 420); x.rotate(-.18); x.scale(lerp(2, 1, clamp(s)), lerp(2, 1, clamp(s))); x.globalAlpha = clamp(s * 2); x.fillStyle = '#ff4d61'; rrp(x, 0, -170, -55, 340, 110, 14); x.fill(); x.font = '900 70px M'; x.fillStyle = '#fff'; x.textBaseline = 'middle'; x.fillText('FICCIÓN', 0, 4); x.restore(); }
    phTex.tx.needsUpdate = true;
  }
  const look = V(lerp(-.6, 0, cr), lerp(1.55, 1.6, cr) + up * 1.3, lerp(1.9, -2.2, cr) + up * 2.1);
  camTo(V(lerp(.3, 0, cr) + Math.sin(t * .3) * .1, lerp(1.6, 5.4, cr) - up * 2.4, lerp(4.7, 6.2, cr) - up * 1.1), look, 40);
}
function animDoc(t) {
  const items = [[tMin2, C.amber, '≈ 1 A 3 MINUTOS', 'casi siempre, no una vez'], [tCon, C.red, 'SIN CONTROL', 'no puedes retrasarlo'], [tAfe, C.purple, 'TE AFECTA', 'frustración, evitar intimidad']];
  const act = t >= tAfe ? 2 : t >= tCon ? 1 : t >= T('casi') ? 0 : -1;
  // pizarra
  const x = boardTex.x; x.clearRect(0, 0, 900, 1080); x.fillStyle = 'rgba(12,18,34,.88)'; rrp(x, 0, 6, 6, 888, 1068, 40); x.fill(); x.lineWidth = 6; x.strokeStyle = 'rgba(108,196,255,.6)'; x.stroke();
  x.font = '700 40px J'; x.fillStyle = '#6cc4ff'; x.textAlign = 'center'; x.textBaseline = 'middle'; x.fillText('DEFINICIÓN MÉDICA', 450, 90);
  items.forEach(([on, col, ti, sub], i) => {
    const y = 190 + i * 290, lit = t >= on, a = eout(P(t, 15.2 + i * .2, .4)); x.save(); x.globalAlpha = a; x.translate((1 - a) * 80, 0);
    x.fillStyle = lit ? hexA(col, .14) : 'rgba(255,255,255,.04)'; rrp(x, 0, 50, y, 800, 240, 30); x.fill(); x.lineWidth = 7; x.strokeStyle = lit ? col : 'rgba(255,255,255,.15)'; x.stroke();
    x.textAlign = 'left'; x.font = '900 62px M'; x.fillStyle = lit ? col : '#8a92a8'; x.fillText(ti, 100, y + 90); x.font = '500 34px J'; x.fillStyle = lit ? '#eef1f7' : '#6a7288'; x.fillText(sub, 100, y + 165);
    x.beginPath(); x.arc(780, y + 120, 36, 0, 6.29); x.lineWidth = 6; x.strokeStyle = lit ? col : 'rgba(255,255,255,.2)'; x.stroke(); if (lit) { const p = eout(P(t, on, .3)); x.beginPath(); x.moveTo(762, y + 120); x.lineTo(762 + 12 * Math.min(1, p * 2), y + 120 + 14 * Math.min(1, p * 2)); if (p > .5) x.lineTo(774 + 24 * (p - .5) * 2, y + 134 - 30 * (p - .5) * 2); x.stroke(); }
    x.restore();
  });
  if (t > tAfe + .2) { x.globalAlpha = P(t, tAfe + .2, .3); x.font = '900 46px M'; x.fillStyle = '#eef1f7'; x.textAlign = 'center'; x.fillText('LAS 3 A LA VEZ', 450, 1030); x.globalAlpha = 1; }
  boardTex.tx.needsUpdate = true; board.scale.setScalar(lerp(.6, 1, eback(P(t, 15.0, .5))));
  // doctor señala la tarjeta activa
  const ty = [.75, 0, -.75][Math.max(0, act)], pt = act >= 0 ? eio(P(t, [T('casi'), tCon, T('te', 1)][act] - .3, .35)) : 0;
  pose(doctor, { armR: [lerp(-.2, -2.0 - ty * .5, act >= 0 ? 1 : pt), lerp(-.12, -.9, act >= 0 ? 1 : 0), -.2], armL: [-.3, .2, -1.4], headRy: -.35, headRx: -.15 + ty * -.1, emo: 'neutral', look: [.5, .6] }, t);
  pose(manDoc, { ...SIT(.55), spineRx: .12, headRx: -.2, headRy: .2, armL: [-.6, .1, -1.3], armR: [-.6, -.1, -1.3], emo: act === 2 ? 'sad' : 'worried', look: [-.4, .6] }, t);
  const orb = (t - 14.95) * .03;
  camTo(V(Math.sin(orb) * 6.6 + .3, 2.5, Math.cos(orb) * 6.6 + 1), V(.15, 2.05, -.2), 40);
}
function animBat(t) {
  const run = P(t, tAce, .3), sp = 6 + 10 * P(t, tAce, 2.5), ph = t * sp;
  const sw = Math.sin(ph) * .9 * run;
  pose(manBat, { hipY: .98 + Math.abs(Math.sin(ph)) * .06 * run, spineRx: .15 * run, armL: [sw, .15, -1.3 * run], armR: [-sw, -.15, -1.3 * run], legs: [-sw * .8, Math.max(0, sw) * 1.2 * run + .1, sw * .8, Math.max(0, -sw) * 1.2 * run + .1], emo: t > tPer - .5 ? 'surprised' : 'worried', headRy: lerp(.6, 0, run), look: [run ? 0 : -.8, 0] }, t);
  manBat.root.rotation.y = lerp(-.4, -1.2, run);
  const lv = 1 - .6 * eio(P(t, tMie2 - .2, 1.2)), L = battery.userData.lvl; L.scale.y = 1.9 * lv; L.position.y = .1 + .95 * lv; L.material.emissive.set(lv < .6 ? 0xff4d61 : 0xa98bff);
  battery.rotation.y = t * .2;
  popSprite(bubble, t, tPer - .55); bubble.position.set(.35, 2.75 + Math.sin(t * 2) * .03, .5);
  popSprite(acel, t, tAce + .2); acel.material.opacity *= 1 - P(t, tPer - .7, .2); acel.position.set(.55, 2.35, .6);
  streaks.visible = run > 0; streaks.children.forEach(s => { s.position.x = 2.8 - ((t * s.userData.sp + s.position.y * 3) % 3.2); s.material.opacity = .6 * run; });
  camTo(V(lerp(-.4, .2, P(t, 30.95, 4.3)), 1.9, 6.4), V(-.2, 1.45, 0), 40);
}
function animXr(t) {
  manX.root.rotation.y = -.5 + (t - 35.35) * .18;
  pose(manX, { armL: [0, .25, -.1], armR: [0, -.25, -.1] }, t);
  const sOn = P(t, tSer - .3, .4); manX.brain.material.emissiveIntensity = 1.6 + 2 * sOn * (.8 + .2 * Math.sin(t * 6));
  manX.thyroid.material.emissiveIntensity = 3 * P(t, tTir - .2, .3) * (.8 + .2 * Math.sin(t * 7)); manX.prost.material.emissiveIntensity = 3 * P(t, tPro - .2, .3) * (.8 + .2 * Math.sin(t * 7));
  manX.heart.scale.setScalar(1 + .15 * Math.max(0, Math.sin(t * 7)));
  // partículas de serotonina alrededor del cerebro
  const a = serPts.geometry.attributes.position.array, n = serPts.userData.n; const hp = new THREE.Vector3(); manX.head.getWorldPosition(hp);
  for (let i = 0; i < n; i++) { const ph2 = (t * .5 + i / n) % 1, an = i * 2.399 + t * .6, r = .25 + ph2 * .9 * sOn; a[i * 3] = hp.x + Math.cos(an) * r; a[i * 3 + 1] = hp.y + .05 + Math.sin(i * 1.7) * .2 * r - ph2 * .4 * sOn; a[i * 3 + 2] = hp.z + Math.sin(an) * r; }
  serPts.geometry.attributes.position.needsUpdate = true; serPts.material.opacity = .9 * sOn;
  popSprite(lblSer, t, tSer - .2); lblSer.position.set(0, 2.35, .2);
  popSprite(lblTir, t, tTir - .2); lblTir.position.set(-.7, 1.6, .3);
  popSprite(lblPro, t, tPro - .2); lblPro.position.set(.75, .95, .3);
  const fz = eio(P(t, tTir - .6, 1.2));
  camTo(V(0, lerp(1.9, 1.5, fz), lerp(5.6, 4.9, fz)), V(0, lerp(1.6, 1.35, fz), 0), 40);
}
function animTr(t) {
  // hombre sentado en el tapete; el urólogo entra caminando
  manTr.root.position.set(-.25, 0, 0); manTr.root.rotation.y = .25;
  const stop = P(t, tTec - .1, .3) * (1 - P(t, tUro - .2, .3));
  pose(manTr, { hipY: .3, legs: [-1.45, 2.2, -1.45, 2.2], legSpread: .35, spineRx: .05, armL: [-.6, .3, -.5], armR: [lerp(-.6, -1.9, stop), -.3, lerp(-.5, -.3, stop)], emo: t > tTra ? 'happy' : 'neutral', breath: 3, headRy: t > tUro ? .5 : 0, look: [t > tUro ? .8 : 0, 0] }, t);
  pelvRing.visible = t > tEje - .2; const pr = .5 + .5 * Math.sin(t * 6); pelvRing.scale.setScalar(.9 + .25 * pr); pelvRing.material.emissiveIntensity = 1 + 2 * pr * P(t, tEje - .2, .3);
  pauseIco.visible = t > tTec - .2; pauseIco.position.set(1.15, 1.6 + Math.sin(t * 2) * .05, .1); pauseIco.scale.setScalar(Math.max(.001, eback(P(t, tTec - .2, .4)) * (1 - P(t, tUro - .3, .3)))); pauseIco.rotation.y = Math.sin(t) * .3;
  const walk = clamp((t - (tUro - 1.0)) / 1.0), wp = t * 7;
  docTr.root.visible = t > tUro - 1.0; docTr.root.position.set(lerp(3.0, 1.0, eout(walk)), 0, .25); docTr.root.rotation.y = lerp(-1.4, -.6, walk);
  const ws = Math.sin(wp) * .5 * (1 - walk);
  pose(docTr, { legs: [-ws, Math.max(0, ws) * .8, ws, Math.max(0, -ws) * .8], armL: [ws * .6, .15, -.2], armR: walk >= 1 ? [-2.4, -.4, -.6] : [-ws * .6, -.15, -.2], emo: 'happy', headRy: -.2 }, t);
  checks.forEach((l, i) => { popSprite(l, t, [tEje, tTec, tUro][i] + .2); l.position.set(-.1, 2.75 - i * .3, -.6); });
  camTo(V(.4 + Math.sin(t * .2) * .2, 2.0, 5.4), V(.25, 1.6, 0), 40);
}
function animHero(t) {
  const k = eio(P(t, tSal - .4, .6));
  pose(manHero, { spineRx: lerp(.35, -.08, k), neckRx: lerp(.3, -.05, k), headRx: lerp(.2, -.1, k), armL: [lerp(-.1, -.2, k), lerp(.1, .5, k), lerp(-.2, -2.2, k)], armR: [lerp(-.1, -.2, k), lerp(-.1, -.5, k), lerp(-.2, -2.2, k)], emo: k > .5 ? 'determined' : 'sad', breath: 2 }, t);
  heroGlow.scale.setScalar(1 + .3 * k + .05 * Math.sin(t * 5)); heroGlow.material.emissiveIntensity = .5 + 2.5 * k;
  rim.color.set(k > .3 ? 0x35d39a : 0xff4d61);
  const z = eio(P(t, 48.8, 2.4));
  camTo(V(.2, lerp(1.3, .7, z), lerp(5.2, 4.3, z)), V(0, lerp(1.4, 1.75, z), 0), 42);
}

// ---------- capa 2D ----------
function rr(x, y, w, h, r) { g.beginPath(); g.moveTo(x + r, y); g.arcTo(x + w, y, x + w, y + h, r); g.arcTo(x + w, y + h, x, y + h, r); g.arcTo(x, y + h, x, y, r); g.arcTo(x, y, x + w, y, r); g.closePath(); }
function txt(s, x, y, { w = 800, size = 40, f = 'M', color = C.text, align = 'center', ls = 0, alpha = 1 } = {}) { g.save(); g.globalAlpha *= alpha; g.font = `${w} ${size}px ${f}`; g.fillStyle = color; g.textAlign = align; g.textBaseline = 'middle'; if (ls) g.letterSpacing = ls + 'px'; g.fillText(s, x, y); g.restore(); }
function withT(x, y, s, a, fn) { g.save(); g.globalAlpha *= a; g.translate(x, y); g.scale(s, s); fn(); g.restore(); }
const HEAD = [[0, 'LA PREGUNTA', '¿TERMINAS MUY RÁPIDO?'], [5.15, 'EL EXPERIMENTO', '500 PAREJAS · 5 PAÍSES'], [9.8, 'EL EXPERIMENTO', 'TIEMPO PROMEDIO: ?'], [11.1, 'EL EXPERIMENTO', 'TIEMPO PROMEDIO: 5,4 MIN'], [14.95, 'QUÉ DICEN LOS MÉDICOS', 'NO ES SOLO EL RELOJ'], [23.45, 'POR QUÉ PASA', 'TIENE EXPLICACIÓN'], [25.7, 'POR QUÉ PASA', '1 · ANSIEDAD'], [30.95, 'POR QUÉ PASA', '2 · ERECCIÓN'], [35.35, 'POR QUÉ PASA', '3 · TU CUERPO'], [41.6, 'LO BUENO', 'TIENE TRATAMIENTO'], [48.8, 'LA VERDAD', 'NO ES FALTA DE HOMBRÍA'], [51.25, 'RECUERDA', 'PROMEDIO REAL: 5,4 MIN'], [53.8, 'TU TURNO', '¿LO SABÍAS?']];
function plate(y0, y1, a = .55) { const gr = g.createLinearGradient(0, y0, 0, y1); gr.addColorStop(0, `rgba(5,7,15,${a})`); gr.addColorStop(1, 'rgba(5,7,15,0)'); g.fillStyle = gr; g.fillRect(0, y0, W, y1 - y0); }
function header(t) {
  let i = 0; while (i + 1 < HEAD.length && t >= HEAD[i + 1][0]) i++;
  const [t0, lab, head] = HEAD[i], prev = i ? HEAD[i - 1][2] : '';
  const del = .18, typ = Math.max(.35, head.length * .028);
  let s; if (i === 0) s = head; else if (t - t0 < del && prev) s = prev.slice(0, Math.round(prev.length * (1 - (t - t0) / del))); else s = head.slice(0, Math.round(head.length * clamp((t - t0 - del) / typ)));
  g.font = '700 24px J'; g.letterSpacing = '3px'; const lw = g.measureText(lab).width; g.letterSpacing = '0px';
  g.fillStyle = C.amber; g.beginPath(); g.arc(540 - lw / 2 - 18, 210, 6, 0, 6.29); g.fill();
  txt(lab, 546, 211, { w: 700, size: 24, f: 'J', color: '#aab2c6', ls: 3 });
  const cursor = (Math.floor(t * 2.5) % 2 === 0 || s.length < head.length) ? '▍' : ' ';
  txt(s + cursor, 540, 282, { w: 500, size: 46, f: 'J', color: '#e3e7f0', ls: 2 });
}
const CH = []; {
  for (const ph of PH) { const ws = WORDS.filter(w => w.s >= ph.s - .01 && w.e <= ph.e + .01); let cur = []; const flush = () => { if (cur.length) CH.push(cur); cur = []; }; for (const w of ws) { const len = cur.map(x => x.w).join(' ').length + w.w.length; if (cur.length >= 4 || (cur.length && len > 22)) flush(); cur.push(w); } flush(); }
  CH.forEach((c, i) => { c.s = c[0].s - .06; const nx = CH[i + 1]; c.e = Math.min(c[c.length - 1].e + .45, nx ? nx[0].s - .06 : 99); });
}
function captions(t) {
  const c = CH.find(c => t >= c.s && t < c.e); if (!c) return;
  const k = eback(P(t, c.s, .22)), a = clamp((c.e - t) / .12) * P(t, c.s, .08);
  g.font = '900 66px M'; const words = c.map(w => w.w.toUpperCase()), sp = 20, wd = words.map(w => g.measureText(w).width); let lines = [[0, words.length]];
  const tot = wd.reduce((a, b) => a + b, 0) + sp * (words.length - 1);
  if (tot > 860 && words.length > 1) { let best = 1, bd = 1e9; for (let s = 1; s < words.length; s++) { const l1 = wd.slice(0, s).reduce((a, b) => a + b, 0) + sp * (s - 1), l2 = tot - l1 - sp; if (Math.abs(l1 - l2) < bd) { bd = Math.abs(l1 - l2); best = s; } } lines = [[0, best], [best, words.length]]; }
  const lh = 80, Y = 1430, y0 = -(lines.length - 1) * lh / 2;
  const bw = Math.max(...lines.map(([a, b]) => wd.slice(a, b).reduce((x, y) => x + y, 0) + sp * (b - a - 1))) + 70, bh = lines.length * lh + 34;
  withT(540, Y, lerp(.9, 1, k), a, () => {
    g.fillStyle = 'rgba(8,10,20,0.66)'; rr(-bw / 2, -bh / 2, bw, bh, 22); g.fill();
    lines.forEach(([s, e], li) => { const lwid = wd.slice(s, e).reduce((x, y) => x + y, 0) + sp * (e - s - 1); let x = -lwid / 2; const y = y0 + li * lh;
      for (let i = s; i < e; i++) { const w = c[i], on = t >= w.s && t < w.e + .02, past = t >= w.e; g.font = '900 66px M'; g.textBaseline = 'middle'; g.textAlign = 'left'; g.fillStyle = on ? C.amber : past ? C.text : 'rgba(238,241,247,0.4)'; if (on) { g.save(); g.shadowColor = hexA(C.amber, .55); g.shadowBlur = 24; g.fillText(words[i], x, y + 3); g.restore(); } else g.fillText(words[i], x, y + 3); x += wd[i] + sp; } });
  });
}
function pending(t) {
  const a0 = 3.7, done = tCin + .05, a1 = done + 1.6; if (t < a0 || t > a1) return;
  const a = Math.min(P(t, a0, .3), 1 - P(t, a1 - .3, .3)), ok = t >= done;
  const label = ok ? 'RESUELTO:' : 'PENDIENTE:', body = ok ? 'lo normal son ~5 minutos' : '¿cuánto dura lo normal?';
  g.font = '700 28px J'; const w1 = g.measureText(label + ' ').width; g.font = '500 28px J'; const w2 = g.measureText(body).width, bw = w1 + w2 + 64;
  const k = ok ? 1 + .08 * Math.sin(P(t, done, .3) * Math.PI) : lerp(.85, 1, eback(P(t, a0, .35)));
  withT(540, 1600, k, a, () => { g.fillStyle = 'rgba(10,14,28,.85)'; rr(-bw / 2, -32, bw, 64, 32); g.fill(); g.lineWidth = 3; g.strokeStyle = ok ? C.green : hexA(C.blue, .8); g.stroke(); txt(label, -bw / 2 + 32, 2, { w: 700, size: 28, f: 'J', color: ok ? C.green : C.blue, align: 'left' }); txt(body, -bw / 2 + 32 + w1, 2, { w: 500, size: 28, f: 'J', color: C.text, align: 'left' }); });
}
function strike(x1, x2, y, p, color, wdt) { if (p <= 0) return; g.save(); g.strokeStyle = color; g.lineWidth = wdt; g.lineCap = 'round'; g.shadowColor = color; g.shadowBlur = 16; g.beginPath(); g.moveTo(x1, y); g.lineTo(lerp(x1, x2, eout(p)), y - 6 * p); g.stroke(); g.restore(); }
function overlays(t) {
  // gancho: título grande
  if (t < 5.3) {
    const a = 1 - P(t, 5.0, .2);
    withT(540, 420, lerp(.92, 1, eback(P(t, 0, .4))), a, () => { g.font = '900 76px M'; const a1 = '¿EYACULACIÓN ', a2 = 'PRECOZ?', w1 = g.measureText(a1).width, w2 = g.measureText(a2).width, x0 = -(w1 + w2) / 2; g.save(); g.shadowColor = 'rgba(0,0,0,.6)'; g.shadowBlur = 20; txt(a1, x0, 0, { w: 900, size: 76, align: 'left' }); g.restore(); g.save(); g.shadowColor = C.red; g.shadowBlur = 30; txt(a2, x0 + w1, 0, { w: 900, size: 76, color: C.red, align: 'left' }); g.restore(); strike(x0 + w1 - 6, x0 + w1 + w2 + 6, 4, P(t, tQui + .1, .35), C.amber, 10); if (t > tQui) txt('o solo crees que la tienes', 0, 72, { w: 500, size: 34, f: 'J', color: '#c3c9d8', alpha: P(t, tQui, .3) }); });
  }
  // hombría → salud
  if (t > 48.8 && t < 51.4) {
    const a = Math.min(P(t, 48.85, .25), 1 - P(t, 51.1, .25));
    withT(540, 470, lerp(.85, 1, eback(P(t, 48.85, .4))), a * (1 - P(t, tSal - .15, .2)), () => { txt('FALTA DE', 0, -60, { w: 900, size: 56, color: '#b8bfd0' }); g.font = '900 110px M'; const w = g.measureText('HOMBRÍA').width; g.save(); g.shadowColor = 'rgba(0,0,0,.6)'; g.shadowBlur = 20; txt('HOMBRÍA', 0, 40, { w: 900, size: 110 }); g.restore(); strike(-w / 2 - 20, w / 2 + 20, 40, P(t, tHom + .15, .3), C.red, 16); });
    if (t > tSal - .1) withT(540, 470, lerp(1.5, 1, eback(P(t, tSal - .1, .35))), a * P(t, tSal - .1, .2), () => { g.shadowColor = C.green; g.shadowBlur = 40; txt('ES SALUD', 0, 0, { w: 900, size: 120, color: C.green }); });
  }
  // encuesta final
  if (t > tLeo - .35) {
    const p = P(t, tLeo - .35, .35);
    txt('¿Y TÚ?', 540, 470, { w: 900, size: 92, color: C.text, alpha: p });
    [['A', 'Sí, lo sabía', C.blue], ['B', 'No tenía idea', C.red]].forEach(([l, s, col], i) => { const q = eback(P(t, tLeo - .2 + i * .25, .35)); withT(540, 600 + i * 125, lerp(.8, 1, clamp(q)), clamp(q), () => { g.fillStyle = 'rgba(14,18,34,.92)'; rr(-380, -50, 760, 100, 18); g.fill(); g.lineWidth = 4; g.strokeStyle = col; g.stroke(); g.fillStyle = col; g.beginPath(); g.arc(-320, 0, 28, 0, 6.29); g.fill(); txt(l, -320, 2, { w: 900, size: 32, color: '#0b0e1a' }); txt(s, -270, 2, { w: 800, size: 40, color: C.text, align: 'left' }); }); });
  }
}
const noise = document.createElement('canvas'); noise.width = noise.height = 256; { const n = noise.getContext('2d'), id = n.createImageData(256, 256); for (let i = 0; i < id.data.length; i += 4) { const v = rnd() * 255; id.data[i] = id.data[i + 1] = id.data[i + 2] = v; id.data[i + 3] = 255; } n.putImageData(id, 0, 0); }

// ---------- render ----------
function renderAt(t) {
  seed = 7 + Math.floor(t * 30) * 13;
  const si = segAt(t), name = CUTS[si][1];
  for (const k in SETS) SETS[k].visible = k === name;
  const [bg, sky, rc] = ENV[name]; scene.background = new THREE.Color(bg); scene.fog.color.set(bg); hemi.color.set(sky); rim.color.set(rc);
  key.position.set(3.5, 7, 5); key.target.position.set(0, 1, 0);
  if (name === 'bed') animBed(t, si === 0 ? 0 : si === 3 ? 1 : 2); else if (name === 'lab') animLab(t); else if (name === 'doc') animDoc(t); else if (name === 'bat') animBat(t); else if (name === 'xr') animXr(t); else if (name === 'tr') animTr(t); else animHero(t);
  // micro-temblor de cámara al congelarse y en cortes
  composer.render();
  g.drawImage(glc, 0, 0);
  plate(0, 560, .7); { const gr = g.createLinearGradient(0, 1240, 0, H); gr.addColorStop(0, 'rgba(5,7,15,0)'); gr.addColorStop(1, 'rgba(5,7,15,.6)'); g.fillStyle = gr; g.fillRect(0, 1240, W, H - 1240); }
  // viñeta
  const vg = g.createRadialGradient(540, 960, 520, 540, 960, 1250); vg.addColorStop(0, 'rgba(0,0,0,0)'); vg.addColorStop(1, 'rgba(0,0,0,.5)'); g.fillStyle = vg; g.fillRect(0, 0, W, H);
  // destello de corte
  for (const [c] of CUTS.slice(1)) { const d = Math.abs(t - c); if (d < .2) { g.fillStyle = `rgba(4,6,12,${(1 - d / .2) * .85})`; g.fillRect(0, 0, W, H); } }
  overlays(t); header(t); pending(t); captions(t);
  g.save(); g.globalAlpha = .04; g.globalCompositeOperation = 'overlay'; const o = Math.floor(t * 30) * 37; for (let y = -(o % 256); y < H; y += 256) for (let x = -((o * 3) % 256); x < W; x += 256) g.drawImage(noise, x, y); g.restore();
  const fo = P(t, END - .4, .4); if (fo > 0) { g.fillStyle = `rgba(0,0,0,${fo})`; g.fillRect(0, 0, W, H); }
}
window.renderAt = renderAt; window.END = END;
window.frameJPG = (t, q = .92) => { renderAt(t); return out.toDataURL('image/jpeg', q).split(',')[1]; };
window.READY = true;
