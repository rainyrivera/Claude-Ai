// Reel 9:16 3D — "¿Por qué tienes eyaculación precoz?"
// Personajes 3D procedurales (estilo arcilla) + capa 2D (titulares, karaoke, PENDIENTE).
import * as THREE from 'three';
import { EffectComposer } from 'three/addons/postprocessing/EffectComposer.js';
import { RenderPass } from 'three/addons/postprocessing/RenderPass.js';
import { UnrealBloomPass } from 'three/addons/postprocessing/UnrealBloomPass.js';
import { OutputPass } from 'three/addons/postprocessing/OutputPass.js';

const W = 1080, H = 1920, END = 47.2;
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
  const E = { neutral: [0, 0, 0, 1, 0], worried: [.38, .01, 0, 1, 0], sad: [.42, -.01, -1, 1, 0], happy: [-.08, .03, 1, .78, 0], surprised: [.05, .055, 0, 1.18, 1], determined: [-.3, -.01, .35, .9, 0], disgust: [-.32, -.015, -1, .62, 0], suspicious: [-.2, -.01, 0, .55, 0] }[em];
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

// ---------- escenarios (video: ¿Por qué te tiras peos apestosos?) ----------
const SETS = {}; const mkSet = n => { const s = new THREE.Group(); s.visible = false; scene.add(s); SETS[n] = s; return s; };
function floorDisc(color, r = 9) { const t = canvasTex(512, 512), x = t.x; const gr = x.createRadialGradient(256, 256, 0, 256, 256, 256); gr.addColorStop(0, color); gr.addColorStop(1, 'rgba(8,10,20,0)'); x.fillStyle = '#0a0d19'; x.fillRect(0, 0, 512, 512); x.fillStyle = gr; x.fillRect(0, 0, 512, 512); const m = mesh(new THREE.CircleGeometry(r, 64), new THREE.MeshStandardMaterial({ map: t.tx, roughness: .85 }), false); m.rotation.x = -Math.PI / 2; m.receiveShadow = true; return m; }
function room(set, floorC, wallC, w = 16, d = 16) { const fl = mesh(new THREE.PlaneGeometry(w, d), mat(floorC, { roughness: .95 }), false); fl.rotation.x = -Math.PI / 2; set.add(fl); const wl = mesh(new THREE.PlaneGeometry(w, 9), mat(wallC, { roughness: 1 }), false); wl.position.set(0, 4.5, -3.4); set.add(wl); return { fl, wl }; }
// nube de gas con cara
function makeCloud() {
  const gr = new THREE.Group(), m = new THREE.MeshStandardMaterial({ color: 0x8be36b, emissive: 0x3fae2c, emissiveIntensity: .7, transparent: true, opacity: .82, roughness: .9 });
  [[0, 0, 0, .42], [.36, .05, -.05, .32], [-.36, .03, -.05, .33], [.15, .3, -.05, .3], [-.18, .27, -.05, .28], [0, -.18, .05, .3]].forEach(([x, y, z, r]) => { const s = sph(r, m, 18); s.castShadow = false; s.position.set(x, y, z); gr.add(s); });
  for (const s of [1, -1]) { const e = sph(.085, mat(0xffffff), 12); e.position.set(.14 * s, .08, .38); const p = sph(.04, mat(0x111111), 10); p.position.set(.14 * s, .07, .45); const b = rbox(.13, .025, .02, .01, mat(0x1f5a17)); b.position.set(.14 * s, .2, .42); b.rotation.z = -.4 * s; gr.add(e, p, b); }
  const mo = mesh(new THREE.TorusGeometry(.09, .02, 8, 16, Math.PI), mat(0x1f5a17)); mo.position.set(0, -.1, .42); mo.rotation.z = Math.PI; gr.add(mo);
  return gr;
}
function cloudAnim(c, t, born, size = 1, drift = [0, 0, 0]) { const k = eback(P(t, born, .45)); c.visible = t >= born; const age = Math.max(0, t - born); c.scale.setScalar(Math.max(.001, k * size * (1 + .04 * Math.sin(t * 5)))); c.position.x += drift[0] * age; c.position.y += drift[1] * age; c.position.z += drift[2] * age; c.rotation.z = Math.sin(t * 2) * .08; }
// bacteria con cara
function makeBug(color) {
  const gr = new THREE.Group(); const b = cap(.22, .35, new THREE.MeshStandardMaterial({ color, emissive: color, emissiveIntensity: .25, roughness: .5 })); b.rotation.z = Math.PI / 2; gr.add(b);
  for (const s of [1, -1]) { const e = sph(.07, mat(0xffffff), 12); e.position.set(.12 * s + .12, .1, .17); const p = sph(.035, mat(0x111111), 10); p.position.set(.12 * s + .12, .1, .23); gr.add(e, p); }
  const mo = sph(.07, mat(0x3a1216), 10); mo.position.set(.12, -.07, .19); mo.scale.set(1.2, .6, .5); gr.add(mo); gr.userData.mouth = mo;
  for (let i = 0; i < 6; i++) { const c = cap(.02, .12, mat(color)); c.position.set(-.3 + i * .12, -.24, 0); gr.add(c); }
  return gr;
}
function runPose(ch, t, k, sp = 14) { const ph = t * sp, sw = Math.sin(ph) * .9 * k; return { hipY: .98 + Math.abs(Math.sin(ph)) * .06 * k, spineRx: .18 * k, armL: [sw, .15, -1.3 * k], armR: [-sw, -.15, -1.3 * k], legs: [-sw * .8, Math.max(0, sw) * 1.2 * k + .1, sw * .8, Math.max(0, -sw) * 1.2 * k + .1] }; }
const LUIS = { shirt: 0xff8a3d, pants: 0x2b3350, hair: 0x2a1c14 };

// A) OFICINA
const off = mkSet('office');
room(off, 0x2a3350, 0x2e3a5e);
{ // ventana con persianas
  const win = mesh(new THREE.PlaneGeometry(4.2, 2.2), new THREE.MeshStandardMaterial({ color: 0, emissive: 0x9fc6ff, emissiveIntensity: .9 }), false); win.position.set(-.6, 2.7, -3.38); off.add(win);
  for (let i = 0; i < 10; i++) { const s = box(4.3, .07, .04, mat(0xdfe6f5)); s.position.set(-.6, 1.68 + i * .22, -3.33); off.add(s); }
  const cooler = new THREE.Group(); const cb = rbox(.5, .9, .5, .05, mat(0xe8ecf4)); cb.position.y = .45; const bt = mesh(new THREE.CylinderGeometry(.2, .2, .55, 20), new THREE.MeshStandardMaterial({ color: 0x8fd3ff, transparent: true, opacity: .6 })); bt.position.y = 1.2; cooler.add(cb, bt); cooler.position.set(2.6, 0, -2.6); off.add(cooler);
  const pot = mesh(new THREE.CylinderGeometry(.25, .2, .45, 16), mat(0xc8673c)); pot.position.set(-2.8, .22, -2.5); off.add(pot); for (let i = 0; i < 6; i++) { const l = sph(.22, mat(0x2fa35a), 12); l.position.set(-2.8 + Math.sin(i) * .2, .65 + i * .08, -2.5 + Math.cos(i) * .15); off.add(l); } off.userData.plant = pot;
}
const desks = []; function desk(x, z, ry) { const d = new THREE.Group(); const top = rbox(1.5, .08, .8, .03, mat(0xd9c3a0)); top.position.y = .78; d.add(top); for (const [a, b] of [[-.65, -.33], [.65, -.33], [-.65, .33], [.65, .33]]) { const l = box(.06, .78, .06, mat(0x3a3f55)); l.position.set(a, .39, b); d.add(l); } const mon = rbox(.7, .45, .05, .02, mat(0x1a1d2a)); mon.position.set(0, 1.12, -.22); const sc = mesh(new THREE.PlaneGeometry(.62, .37), new THREE.MeshStandardMaterial({ color: 0, emissive: 0x4f8bff, emissiveIntensity: 1.1 }), false); sc.position.set(0, 1.12, -.19); const st = box(.06, .2, .06, mat(0x1a1d2a)); st.position.set(0, .9, -.22); const kb = rbox(.45, .03, .15, .01, mat(0x2b2f40)); kb.position.set(0, .83, .05); d.add(mon, sc, st, kb); const ch = mesh(new THREE.CylinderGeometry(.28, .28, .08, 20), mat(0x2b2f40)); ch.position.set(0, .5, .62); const cs = box(.06, .5, .06, mat(0x2b2f40)); cs.position.set(0, .25, .62); const bk = rbox(.5, .5, .06, .03, mat(0x2b2f40)); bk.position.set(0, .8, .9); d.add(ch, cs, bk); d.position.set(x, 0, z); d.rotation.y = ry; off.add(d); desks.push(d); return d; }
desk(0, .62, Math.PI); desk(-1.85, .0, Math.PI + .35); desk(1.85, .0, Math.PI - .35);
const luisO = makeChar(LUIS); off.add(luisO.root);
const cwA = makeChar({ shirt: 0xa98bff, pants: 0x2d2a45, hair: 0x4a2a1c, longHair: true, skin: 0xc98f6c }); off.add(cwA.root);
const cwB = makeChar({ shirt: 0x2fa58a, pants: 0x283048, glasses: true, hair: 0x5b4636, skin: 0x8d5a3c }); off.add(cwB.root);
const cwC = makeChar({ shirt: 0x6cc4ff, pants: 0x22283d, hair: 0x111111, skin: 0xeac3a0 }); cwC.root.visible = false; off.add(cwC.root);
const cloudO = makeCloud(); off.add(cloudO); const cloudO2 = makeCloud(); off.add(cloudO2);
const bellyGlow = sph(.16, glow(0xff4d61, 2.5), 16); bellyGlow.position.set(0, .2, .2); luisO.spine.add(bellyGlow);
const tagLuis = label('LUIS', C.amber, { size: 56 }); off.add(tagLuis);
const tagDan = label('¿DAÑADO?', C.red, { size: 56 }); off.add(tagDan);
const tagAir = label('AIRE LIMPIO ✓', C.green, { size: 56 }); off.add(tagAir);

// B) SALA DE CATA (experimento)
const labS = mkSet('lab');
room(labS, 0x1d2c3a, 0xdfe7ee);
labS.add(floorDisc('#2d5a6b', 12));
const table = rbox(6.2, .1, 1.0, .04, mat(0xf2f4f8)); table.position.set(0, .8, .2); labS.add(table);
for (const x of [-2.9, 2.9]) { const l = box(.08, .8, .9, mat(0xb8c0cc)); l.position.set(x, .4, .2); labS.add(l); }
const eaters = []; const SK = [0xd9a07a, 0xc98f6c, 0x8d5a3c, 0xeac3a0, 0xb98261, 0xd9a07a], SH = [0x3d6bff, 0xe0648a, 0x35d39a, 0xa98bff, 0xf6b445, 0x6cc4ff];
for (let i = 0; i < 6; i++) { const c = makeChar({ shirt: SH[i], skin: SK[i], longHair: i % 2 === 1, hair: [0x2a1c14, 0x4a2a1c, 0x111111][i % 3] }); c.root.position.set(-2.5 + i * 1.0, 0, -.55); labS.add(c.root); const bowl = mesh(new THREE.SphereGeometry(.17, 16, 10, 0, 6.29, Math.PI / 2, Math.PI / 2), mat(0xf6f1e6, { side: THREE.DoubleSide })); bowl.position.set(-2.5 + i * 1.0, .98, .1); labS.add(bowl); const beans = sph(.14, mat(0x7a3b22, { roughness: .8 }), 12); beans.scale.y = .35; beans.position.set(-2.5 + i * 1.0, .96, .1); labS.add(beans); const bal = sph(.3, new THREE.MeshStandardMaterial({ color: 0x8be36b, emissive: 0x3fae2c, emissiveIntensity: .5, transparent: true, opacity: .85 }), 16); bal.scale.y = 1.15; labS.add(bal); const tube = mesh(new THREE.CylinderGeometry(.02, .02, 1, 8), mat(0xdfe3ec)); labS.add(tube); eaters.push({ c, bal, tube }); }
const x16 = label('× 16 PERSONAS', C.amber, { size: 54 }); labS.add(x16);
const judges = [makeChar({ coat: true, shirt: 0x2fa58a, pants: 0x223047, glasses: true, hair: 0x9a9aa4, skin: 0xb98261 }), makeChar({ coat: true, shirt: 0x3d6bff, pants: 0x223047, glasses: true, hair: 0x2a1c14, skin: 0xd9a07a })];
const jt = rbox(1.6, .08, .7, .03, mat(0xf2f4f8)); jt.position.set(4.6, .9, 1.4); labS.add(jt); const jl = box(.08, .9, .6, mat(0xb8c0cc)); jl.position.set(4.6, .45, 1.4); labS.add(jl);
judges.forEach((j, i) => { j.root.position.set(4.15 + i * .9, 0, 2.1); j.root.rotation.y = i ? -.45 : .15; labS.add(j.root); });
const jars = [0, 1].map(i => { const gj = new THREE.Group(); const gl = mesh(new THREE.CylinderGeometry(.13, .13, .3, 20), new THREE.MeshStandardMaterial({ color: 0xdff6ff, transparent: true, opacity: .35, roughness: .05 })); const gas = mesh(new THREE.CylinderGeometry(.11, .11, .26, 20), new THREE.MeshStandardMaterial({ color: 0x8be36b, emissive: 0x3fae2c, emissiveIntensity: 1, transparent: true, opacity: .6 })); const lid = mesh(new THREE.CylinderGeometry(.14, .14, .04, 20), mat(0x888fa0)); lid.position.y = .17; gj.add(gl, gas, lid); labS.add(gj); return gj; });
const score = label('PESTE: 9/10', C.red, { size: 56 }); labS.add(score);
const ko = label('K.O.', C.amber, { size: 64 }); labS.add(ko);

// C) INTESTINO
const gut = mkSet('gut');
const tubeM = new THREE.MeshStandardMaterial({ color: 0xc8506a, emissive: 0x5a1426, emissiveIntensity: .5, roughness: .7, side: THREE.BackSide });
const gutTube = mesh(new THREE.CylinderGeometry(2.6, 2.6, 60, 48, 1, true), tubeM, false); gutTube.rotation.x = Math.PI / 2; gutTube.position.z = -22; gut.add(gutTube);
for (let i = 0; i < 26; i++) { const r = mesh(new THREE.TorusGeometry(2.55, .22, 10, 48), new THREE.MeshStandardMaterial({ color: 0xd8607a, roughness: .7 }), false); r.position.z = 6 - i * 2.2; gut.add(r); }
const gutLight = new THREE.PointLight(0xffc0d0, 14, 12, 1.4); gut.add(gutLight);
const bubbles = []; for (let i = 0; i < 26; i++) { const b = sph(.18 + rnd() * .35, new THREE.MeshStandardMaterial({ color: 0xffffff, transparent: true, opacity: .18, roughness: .05, metalness: .1 }), 16); b.userData.p = V((rnd() - .5) * 3.2, (rnd() - .5) * 3.2, -2 - rnd() * 14); b.userData.s = rnd() * 6; gut.add(b); bubbles.push(b); }
const sulf = sph(.32, glow(0xffd23a, 2.4), 18); gut.add(sulf);
const lblNo = label('CASI TODO: NO HUELE', '#ffffff', { size: 52 }); gut.add(lblNo);
const lblS = label('AZUFRE', '#ffd23a', { size: 56 }); gut.add(lblS);
const lblH2S = label('SULFURO DE HIDRÓGENO', '#ffd23a', { size: 46 }); gut.add(lblH2S);
const bugs = [0x35d39a, 0xa98bff, 0x6cc4ff, 0x9be36b].map((c, i) => { const b = makeBug(c); gut.add(b); return b; });
const crumbs = []; for (let i = 0; i < 10; i++) { const c = rbox(.14, .1, .12, .03, mat([0xf6b445, 0x7a3b22, 0xfff3d6, 0x5bbf4a][i % 4])); gut.add(c); crumbs.push(c); }
const yb = []; for (let i = 0; i < 18; i++) { const b = sph(.09, glow(0xffd23a, 2), 10); gut.add(b); yb.push(b); }

// D) COCINA
const kit = mkSet('kitchen');
room(kit, 0x3a2f2a, 0x2f5b63);
{ const ctr = rbox(4.6, .9, .9, .04, mat(0xe9e4da)); ctr.position.set(0, .45, -2.6); kit.add(ctr); const top = rbox(4.7, .08, 1.0, .02, mat(0x3c3f4a)); top.position.set(0, .94, -2.6); kit.add(top); for (let i = 0; i < 4; i++) { const dr = rbox(1.05, .7, .03, .02, mat(0xd4cec2)); dr.position.set(-1.65 + i * 1.1, .45, -2.13); kit.add(dr); }
  const fr = rbox(1.0, 2.2, .9, .06, mat(0xf3f5f8)); fr.position.set(2.9, 1.1, -2.6); kit.add(fr); const hd = box(.05, .6, .06, mat(0x9aa2b2)); hd.position.set(2.5, 1.3, -2.13); kit.add(hd);
  const win = mesh(new THREE.PlaneGeometry(1.6, 1.1), new THREE.MeshStandardMaterial({ color: 0, emissive: 0xffe3a8, emissiveIntensity: 1.1 }), false); win.position.set(-.8, 2.2, -3.38); kit.add(win);
  const stove = rbox(.9, .04, .7, .02, mat(0x1a1d2a)); stove.position.set(.6, 1.0, -2.6); kit.add(stove); }
const pan = new THREE.Group(); { const p = mesh(new THREE.CylinderGeometry(.32, .26, .08, 28), mat(0x2b2f3a, { metalness: .4 })); const h = box(.45, .04, .06, mat(0x2b2f3a)); h.position.set(.5, .02, 0); pan.add(p, h); for (const x of [-.11, .12]) { const w = mesh(new THREE.CylinderGeometry(.12, .13, .02, 20), mat(0xffffff)); w.position.set(x, .05, 0); const y = sph(.055, mat(0xffb21e, { roughness: .3 }), 12); y.scale.y = .6; y.position.set(x, .07, 0); pan.add(w, y); } } pan.position.set(.6, 1.06, -2.5); kit.add(pan);
const egg = new THREE.Group(); { const e = sph(.17, mat(0xfff4e2), 20); e.scale.set(1, 1.3, 1); egg.add(e); } egg.position.set(-.9, 1.2, -2.35); kit.add(egg);
const eggGlow = sph(.3, new THREE.MeshBasicMaterial({ color: 0xff4d61, transparent: true, opacity: .35, depthWrite: false }), 16); egg.add(eggGlow);
const carton = new THREE.Group(); { const b = rbox(.9, .14, .4, .03, mat(0xbfa27a)); carton.add(b); for (let i = 0; i < 6; i++) { const e = sph(.07, mat(0xfff4e2), 10); e.scale.y = 1.3; e.position.set(-.33 + (i % 3) * .33, .12, i < 3 ? -.09 : .09); carton.add(e); } } carton.position.set(-1.7, 1.02, -2.5); kit.add(carton);
const luisK = makeChar({ ...LUIS, clipboard: true }); kit.add(luisK.root);
const days = ['LUN · HUEVOS', 'MAR · HUEVOS', 'MIÉ · HUEVOS'].map(s => { const l = label(s, '#ffffff', { size: 44 }); kit.add(l); return l; });
const stamp = label('CULPABLE', C.red, { size: 66 }); kit.add(stamp);
const minus = label('MENOS HUEVOS', C.green, { size: 54 }); kit.add(minus);

// E) ESCENARIO HÉROE (plato)
const hero = mkSet('hero'); hero.add(floorDisc('#1f6b4c', 10));
const luisH = makeChar(LUIS); hero.add(luisH.root);
const plate = new THREE.Group(); { const p = mesh(new THREE.CylinderGeometry(.75, .55, .08, 40), mat(0xffffff, { roughness: .3 })); plate.add(p); const items = [[0x5bbf4a, -.25, .1], [0xf6b445, .2, .2], [0xe0648a, .05, -.25], [0x7a3b22, -.3, -.2], [0x5bbf4a, .3, -.1]]; items.forEach(([c, x, z]) => { const s = sph(.16, mat(c), 12); s.scale.y = .6; s.position.set(x, .08, z); plate.add(s); }); } hero.add(plate);
const heroRing = mesh(new THREE.TorusGeometry(.9, .03, 8, 100), glow(0x35d39a, 2), false); heroRing.rotation.x = Math.PI / 2; heroRing.position.y = .02; hero.add(heroRing);

// F) CONSULTA (médico)
const cli = mkSet('clinic'); room(cli, 0x1f3442, 0xe6eef4); cli.add(floorDisc('#2f6b8a', 8));
{ const door = rbox(1.3, 2.4, .1, .03, mat(0x7da7c8)); door.position.set(-1.2, 1.2, -3.3); cli.add(door); const kn = sph(.06, mat(0xd8d8d8, { metalness: .6 })); kn.position.set(-.7, 1.2, -3.22); cli.add(kn); const cr = new THREE.Group(); const a = box(.5, .16, .05, glow(0xff4d61, 2)), b = box(.16, .5, .05, glow(0xff4d61, 2)); cr.add(a, b); cr.position.set(1.0, 2.7, -3.3); cli.add(cr); const bedC = rbox(1.8, .6, .8, .05, mat(0xd6e6f2)); bedC.position.set(1.6, .4, -2.4); cli.add(bedC); }
const docC = makeChar({ coat: true, shirt: 0x2fa58a, pants: 0x223047, glasses: true, hair: 0x9a9aa4, skin: 0xb98261 }); cli.add(docC.root);
const luisC = makeChar(LUIS); cli.add(luisC.root);
const sign = label('DOLOR O CAMBIOS = MÉDICO', C.blue, { size: 48 }); cli.add(sign);

// G) SALA DE LA CASA
const home = mkSet('home'); room(home, 0x3a2a2a, 0x3a3060);
{ const sofaB = rbox(3.4, .5, 1.0, .12, mat(0x4a5aa8)); sofaB.position.set(0, .45, -1.4); home.add(sofaB); const back = rbox(3.4, .8, .3, .12, mat(0x4a5aa8)); back.position.set(0, 1.0, -1.85); home.add(back); for (const x of [-1.7, 1.7]) { const arm = rbox(.3, .65, 1.0, .1, mat(0x3f4d94)); arm.position.set(x, .6, -1.4); home.add(arm); }
  const lampH = mesh(new THREE.CylinderGeometry(.2, .3, .35, 20, 1, true), new THREE.MeshStandardMaterial({ color: 0xffd9a0, emissive: 0xffb45a, emissiveIntensity: 1.6, side: THREE.DoubleSide })); lampH.position.set(2.4, 1.7, -2.2); home.add(lampH); const pole = mesh(new THREE.CylinderGeometry(.03, .03, 1.6, 8), mat(0x333333)); pole.position.set(2.4, .8, -2.2); home.add(pole); const pl = new THREE.PointLight(0xffb45a, 8, 7, 1.6); pl.position.set(2.3, 1.7, -1.8); home.add(pl);
  const frame = rbox(1.2, .8, .05, .02, mat(0xd9c3a0)); frame.position.set(-.8, 2.6, -3.35); home.add(frame); const art = mesh(new THREE.PlaneGeometry(1.0, .6), new THREE.MeshStandardMaterial({ color: 0, emissive: 0xf6b445, emissiveIntensity: .5 }), false); art.position.set(-.8, 2.6, -3.32); home.add(art); }
const fam = [makeChar(LUIS), makeChar({ shirt: 0xe0648a, pants: 0x2d2a45, hair: 0x4a2a1c, longHair: true, skin: 0xc98f6c }), makeChar({ shirt: 0xf6b445, pants: 0x283048, hair: 0x2a1c14 }), makeChar({ shirt: 0x6b7a8f, pants: 0x283048, hair: 0xb8bcc6, glasses: true, skin: 0xb98261 })];
fam[2].root.scale.setScalar(.68); fam.forEach(f => home.add(f.root));
const cloudH = makeCloud(); home.add(cloudH);

// ---------- línea de tiempo ----------
const CUTS = [[0, 'office'], [10.55, 'lab'], [21.2, 'gut'], [29.2, 'kitchen'], [35.4, 'office'], [37.7, 'hero'], [40.65, 'clinic'], [43.5, 'home']];
const segAt = t => { let i = 0; while (i + 1 < CUTS.length && t >= CUTS[i + 1][0]) i++; return i; };
const ENV = { office: [0x0c1224, 0x8aa0d0, 0x6cc4ff], lab: [0x0c1620, 0xb8d8e8, 0x6cc4ff], gut: [0x1a050c, 0xff9ab0, 0xffd23a], kitchen: [0x140f0c, 0xffd9a8, 0xf6b445], hero: [0x07150f, 0x3a7a5a, 0x35d39a], clinic: [0x0a1620, 0xb8d8e8, 0x6cc4ff], home: [0x120c1c, 0xa08ad0, 0xf6b445] };
function camTo(pos, look, fov = 38) { cam.position.copy(pos); cam.fov = fov * 1.32; cam.updateProjectionMatrix(); cam.lookAt(look); }

// palabras clave
const tLuis1 = T('luis', 1), tSale = T('sale'), tVac = T('vacía'), tLuis2 = T('luis', 2), tDan = T('dañado', 1), tCie = T('científicos'), tHab = T('habichuelas'), tRec = T('recogieron'), tPus = T('pusieron'), tOle = T('olerlos'), tTra = T('trabajo'), tNad = T('nadie');
const tDes = T('descubrieron'), tCasi = T('casi'), tPes = T('peste'), tAzu = T('azufre'), tBac = T('bacterias'), tCom = T('comes');
const tAno = T('anotó'), tPum = T('pum'), tHue = T('huevos'), tBaj = T('bajó'), tOfi2 = T('oficina', 2), tRes = T('respirar'), tDan2 = T('dañado', 2), tPla = T('plato'), tDue = T('duele'), tMed = T('médico'), tDime = T('dime'), tQui = T('quién');

// ---------- animaciones ----------
const TYPE = (t, k = 1) => ({ ...SIT(.55), spineRx: .12, armL: [-1.25 + Math.sin(t * 14) * .08 * k, .12, -.5], armR: [-1.25 + Math.cos(t * 13) * .08 * k, -.12, -.5] });
function animOffice(t, part) {
  luisO.root.position.set(0, 0, 0); luisO.root.rotation.y = 0;
  const seats = [[cwA, -1.85 + .62 * Math.sin(.35), -.62 * Math.cos(.35) - .62, .35], [cwB, 1.85 - .62 * Math.sin(.35), -.62 * Math.cos(.35) - .62, -.35]];
  cloudO.visible = cloudO2.visible = false; bellyGlow.visible = false; tagLuis.visible = tagDan.visible = tagAir.visible = false; cwC.root.visible = false;
  if (part === 0) {
    const flee = P(t, tVac - .4, 1.4);
    // Luis tecleando → avergonzado → triste
    const shame = P(t, .5, .3), sad = P(t, tLuis2 - .2, .5);
    pose(luisO, { ...TYPE(t, 1 - shame), spineRx: lerp(.12, .35, sad), headRx: lerp(0, .3, sad), headRy: lerp(0, .25, shame) * (1 - sad), emo: sad > .5 ? 'sad' : shame > .5 ? 'worried' : 'neutral', look: [shame * (1 - sad) * .7, 0] }, t);
    seats.forEach(([c, x, z, ry], i) => {
      const turn = P(t, .7 + i * .12, .25);
      if (flee <= 0) { c.root.position.set(x, 0, z + .62); c.root.rotation.y = ry; pose(c, { ...TYPE(t + i, 1 - turn), headRy: (i ? 1 : -1) * -.7 * turn, emo: turn > .5 ? 'disgust' : 'neutral', look: [(i ? -1 : 1) * turn, 0], blinkOff: i }, t); }
      else { const k = eio(flee); c.root.position.set(x + (i ? 1 : -1) * k * 7, 0, z + .62 + k * 2.2); c.root.rotation.y = (i ? 1 : -1) * Math.PI / 2; pose(c, { ...runPose(c, t + i, clamp(flee * 3)), emo: 'disgust' }, t); }
    });
    cloudO.position.set(.55, .9, -.55); cloudAnim(cloudO, t, .45, .62, [.05, .1, -.05]); if (t > tLuis2 - .3) cloudO.scale.multiplyScalar(Math.max(.001, 1 - P(t, tLuis2 - .3, .4)));
    if (t > tSale - .1) { cloudO2.position.set(-.5, .95, -.6); cloudAnim(cloudO2, t, tSale + .1, .8, [-.05, .1, -.04]); if (t > tLuis2 - .3) cloudO2.scale.multiplyScalar(Math.max(.001, 1 - P(t, tLuis2 - .3, .4))); }
    if (t > tLuis1 - .2) { popSprite(tagLuis, t, tLuis1 - .1); tagLuis.position.set(0, 2.25, .1); tagLuis.material.opacity *= 1 - P(t, tLuis2 - .4, .3); }
    if (t > tLuis2) { bellyGlow.visible = true; bellyGlow.scale.setScalar(1 + .25 * Math.sin(t * 8)); popSprite(tagDan, t, tDan - .1); tagDan.position.set(.15, 2.2, .1); }
    // cámara
    const push = eio(P(t, tLuis1 - .3, .7)), back = eio(P(t, 3.6, 1.2)), sadZ = eio(P(t, tLuis2 - .4, .8));
    const pos = V(lerp(.2, 0, push), lerp(2.5, 2.2, push), lerp(5.6, 3.6, push)).lerp(V(0, 2.9, 6.8), back).lerp(V(.3, 2.35, 3.1), sadZ);
    camTo(pos, V(0, lerp(1.25, 1.35, push), -.3).lerp(V(0, 1.2, -.3), sadZ), 40);
  } else { // la oficina vuelve a respirar
    const k = P(t, tOfi2, .4);
    pose(luisO, { ...TYPE(t), emo: 'happy', headRy: Math.sin(t * 2) * .2, look: [.3, 0] }, t);
    seats.forEach(([c, x, z, ry], i) => { const back = eout(P(t, 35.5 + i * .15, .8)); c.root.position.set(x + (i ? 1 : -1) * (1 - back) * 2.5, 0, z + .62); c.root.rotation.y = ry; pose(c, back < 1 ? { ...runPose(c, t, 1 - back, 10), emo: 'happy' } : { ...TYPE(t + i), emo: 'happy', headRy: (i ? 1 : -1) * -.5, look: [(i ? -1 : 1) * .6, 0], blinkOff: i }, t); });
    popSprite(tagAir, t, tRes - .1); tagAir.position.set(0, 2.45, -.4);
    off.userData.plant.rotation.z = Math.sin(t * 3) * .05;
    camTo(V(Math.sin(t * .3) * .3, 2.5, 6.0), V(0, 1.3, -.6), 40);
  }
}
function animLab(t) {
  eaters.forEach(({ c, bal, tube }, i) => {
    const eat = Math.max(0, Math.sin(t * 5 + i)); const x = -2.5 + i * 1.0;
    const sn = t > tPus ? P(t, tPus, .4) : 0; // giran a ver a los jueces
    pose(c, { ...SIT(.55), spineRx: .1, armR: [-1.0 - eat * .6, -.2, -1.2 - eat * .5], armL: [-.8, .2, -1.0], emo: t > tRec ? 'surprised' : 'happy', headRy: -.6 * sn, look: [sn ? .8 : 0, 0], blinkOff: i * .7 }, t);
    const b = eback(P(t, tRec - .1 + i * .12, .5)); bal.visible = t > tRec - .1; bal.scale.set(Math.max(.001, b), Math.max(.001, b * 1.15), Math.max(.001, b)); bal.position.set(x, 2.45 + Math.sin(t * 2 + i) * .05, -1.0);
    tube.visible = bal.visible; tube.position.set(x, 1.75, -.95); tube.scale.y = .8 * Math.max(.01, b);
  });
  popSprite(x16, t, tHab - .2); x16.position.set(0, 2.95, -.6); x16.material.opacity *= 1 - P(t, tPus - .3, .3);
  // jueces
  const faint = eio(P(t, tNad - .3, .5));
  judges.forEach((j, i) => {
    const sniff = Math.max(0, Math.sin((t - tOle) * 4)) * P(t, tOle - .2, .3);
    if (i === 0) { j.root.rotation.x = -faint * 1.35; j.root.position.set(4.15, 0, 2.1 + faint * .1); pose(j, { spineRx: .35 * sniff * (1 - faint), headRx: .2 * sniff, armR: [-1.2, -.2, -1.4], armL: [-.3 - faint * 2, .2 + faint, -.3], emo: faint > .3 ? 'surprised' : sniff > .3 ? 'disgust' : 'neutral', blink: faint > .5 ? .1 : 1 }, t); }
    else { const fan = P(t, tTra, .3); pose(j, { spineRx: .3 * sniff * (1 - fan), armR: [-1.6 * fan + Math.sin(t * 18) * .25 * fan, -.6 * fan, -1.6 * fan], armL: [-1.1, .2, -1.4], emo: t > tOle ? 'disgust' : 'neutral', headRy: -.4 * fan, look: [-.6 * fan, 0], blinkOff: 1 }, t); }
    const hand = new THREE.Vector3(); j.hand[i === 0 ? 1 : 0].getWorldPosition(hand); jars[i].position.copy(hand).add(V(0, .12, 0));
    if (i === 0 && faint > .5) jars[0].position.set(4.4, .95, 1.4);
  });
  popSprite(score, t, tPus + .9); score.position.set(5.05, 2.75, 1.6);
  popSprite(ko, t, tNad); ko.position.set(4.0, 1.25, 2.6);
  const toJ = eio(P(t, tPus - .4, .9));
  const pos = V(lerp(-.4, 0, P(t, 10.55, 4)), lerp(2.0, 2.3, P(t, 10.55, 4)), lerp(5.6, 6.6, P(t, 10.55, 4))).lerp(V(2.6, 1.9, 5.6), toJ);
  camTo(pos, V(0, 1.4, -.4).lerp(V(4.6, 1.4, 1.6), toJ), 40);
}
function animGut(t) {
  const z = -(t - 21.2) * 1.15; gutLight.position.set(0, .5, z - 1);
  bubbles.forEach((b, i) => { const p = b.userData.p; b.position.set(p.x + Math.sin(t + b.userData.s) * .15, p.y + Math.cos(t * .8 + b.userData.s) * .15, p.z + z - 1.5); b.visible = t < tPes + .6; });
  sulf.position.set(.45, -.1, z - 3.2); sulf.scale.setScalar((.8 + .15 * Math.sin(t * 6)) * eback(P(t, tCasi + .6, .4)) + .001); sulf.visible = t > tCasi + .5;
  popSprite(lblNo, t, tCasi + .1); lblNo.position.set(-.3, 1.35, z - 3.4); lblNo.material.opacity *= 1 - P(t, tPes - .2, .3);
  popSprite(lblS, t, tAzu - .1); lblS.position.set(.45, .55, z - 3.2);
  popSprite(lblH2S, t, tBac + .3); lblH2S.position.set(0, 1.5, z - 3.6);
  // bacterias comiendo y soltando burbujas amarillas
  bugs.forEach((b, i) => { const a = i / 4 * 6.283 + .6, r = 1.5; const k = eback(P(t, tBac - .4 + i * .12, .4)); b.visible = t > tBac - .45; b.scale.setScalar(Math.max(.001, k * 1.1)); b.position.set(Math.cos(a) * r * .9, Math.sin(a) * r * .8 - .2, z - 3.6 + (i % 2) * .5); b.rotation.set(0, 0, Math.sin(t * 3 + i) * .2); b.lookAt(cam.position); b.rotateY(-Math.PI / 2 + .9); b.userData.mouth.scale.y = .3 + .5 * Math.abs(Math.sin(t * 9 + i)); });
  crumbs.forEach((c, i) => { const a = i * .9 + t * .5; c.visible = t > tBac - .45 && t < tCom + .4; c.position.set(Math.cos(a) * .9, Math.sin(a) * .7 - .2, z - 3.6); c.rotation.set(t + i, t * .7, 0); });
  yb.forEach((b, i) => { const st = tBac + .2 + i * .08, ph = (t - st) % 2.2; b.visible = t > st; const a = (i % 4) / 4 * 6.283 + .6; b.position.set(Math.cos(a) * 1.3 + Math.sin(ph * 3 + i) * .1, Math.sin(a) * 1.1 - .2 + ph * .6, z - 3.6 + ph * .3); b.scale.setScalar(.6 + ph * .3); });
  camTo(V(Math.sin(t * .6) * .25, Math.cos(t * .5) * .15 + .2, z + 1.2), V(0, .2, z - 3.6), 44);
}
function animKitchen(t) {
  luisK.root.position.set(-.3, 0, -1.2); luisK.root.rotation.y = .15;
  const write = Math.sin(t * 16) * .06 * (t < tPum ? 1 : 0), shock = P(t, tPum, .2), push = P(t, tBaj - .1, .4);
  pose(luisK, { armR: [-1.0, -.25, -1.3], armL: t > tBaj ? [-1.4 * (1 - P(t, tBaj + .6, .4)), .5, -.2] : [-.9 + write, .3, -1.6], headRx: t < tPum ? .25 : -.05, headRy: t > tPum ? -.5 * (1 - push) : 0, emo: t < tPum ? 'neutral' : t < tBaj ? 'surprised' : 'happy', look: [t > tPum && t < tBaj ? -.8 : 0, t < tPum ? -.6 : 0] }, t);
  days.forEach((l, i) => { popSprite(l, t, tAno + .2 + i * .35); l.position.set(.7, 2.75 - i * .38, -1.6); l.material.opacity *= 1 - P(t, tPum - .1, .2); });
  egg.position.set(-.9, 1.2 + (t > tPum ? Math.abs(Math.sin(t * 7)) * .06 : 0), -2.35); egg.rotation.z = t > tPum ? Math.sin(t * 20) * .15 * (1 - push) : 0;
  eggGlow.visible = t > tPum && t < tBaj + .3; eggGlow.scale.setScalar(1 + .2 * Math.sin(t * 10));
  popSprite(stamp, t, tPum + .05); stamp.position.set(-1.25, 1.62, -2.0); stamp.scale.multiplyScalar(.75); stamp.material.rotation = -.12; stamp.material.opacity *= 1 - P(t, tBaj - .2, .2);
  carton.position.x = -1.7 - eio(push) * 1.8; carton.visible = carton.position.x > -3.4;
  egg.visible = !(t > tBaj + .2); popSprite(minus, t, tBaj + .1); minus.position.set(-.9, 1.95, -2.1);
  const close = eio(P(t, tPum - .15, .35)) * (1 - eio(P(t, tBaj - .3, .5))), toPan = eio(P(t, tHue - .1, .5)) * (1 - eio(P(t, tBaj - .3, .5)));
  const base = V(.2, 2.0, 3.6).lerp(V(-2.0, 1.75, -.6), close * (1 - toPan)).lerp(V(.55, 1.75, -1.2), toPan);
  camTo(base, V(-.2, 1.4, -1.8).lerp(V(-.9, 1.25, -2.35), close * (1 - toPan)).lerp(V(.6, 1.06, -2.5), toPan), 40);
}
function animHero(t) {
  luisH.root.position.set(0, 0, 0);
  const k = eio(P(t, tPla - .3, .5)), up = eio(P(t, 37.75, .6));
  pose(luisH, { spineRx: lerp(.3, -.05, up), headRx: lerp(.2, -.1, up), armL: [-1.25, .25, -1.25], armR: [-1.25, -.25, -1.25], emo: k > .5 ? 'happy' : 'determined', breath: 2 }, t);
  plate.position.set(0, lerp(1.05, 1.25, k) + Math.sin(t * 2) * .02, .55); plate.rotation.set(lerp(.2, .55, k), t * .4, 0); plate.scale.setScalar(lerp(.7, 1, eback(P(t, 37.8, .5))));
  heroRing.scale.setScalar(1 + .3 * k + .05 * Math.sin(t * 5)); heroRing.material.emissiveIntensity = .6 + 2.4 * k;
  const z = eio(P(t, 37.7, 2.9)); camTo(V(.2, lerp(1.4, 1.0, z), lerp(5.2, 4.2, z)), V(0, lerp(1.3, 1.45, z), 0), 42);
}
function animClinic(t) {
  docC.root.position.set(.45, 0, -.6); docC.root.rotation.y = -.35; luisC.root.position.set(-.75, 0, .2); luisC.root.rotation.y = .6;
  const th = P(t, tMed - .2, .3);
  pose(docC, { armR: [-2.4 * th - .2, -.4 * th, -.9 * th], armL: [-.4, .3, -1.3], emo: 'happy', headRy: .4, look: [-.6, 0] }, t);
  pose(luisC, { armL: [-.3, .2, -.4], armR: [-.6, -.2, -1.6], spineRx: .15 * (1 - th), emo: th > .5 ? 'happy' : 'worried', headRy: -.3, look: [.6, 0] }, t);
  popSprite(sign, t, tDue); sign.position.set(-.1, 2.85, -.4);
  camTo(V(Math.sin(t * .4) * .3 + .1, 2.0, 5.4), V(-.1, 1.4, -.5), 40);
}
function animHome(t) {
  const xs = [-1.15, -.35, .4, 1.15];
  fam.forEach((f, i) => { f.root.position.set(xs[i], i === 2 ? .2 : 0, -1.15); const sus = P(t, tDime - .2 + i * .15, .3); const dir = Math.sin(t * 2.2 + i * 1.7); pose(f, { ...SIT(i === 2 ? .6 : .55), spineRx: .05, headRy: dir * .5 * sus, armL: [-.5, .15, -.9], armR: [-.5, -.15, -.9], emo: 'suspicious', look: [dir * sus, 0], blinkOff: i * .9 }, t); });
  cloudH.position.set(1.45, 1.55, -.9); cloudAnim(cloudH, t, tQui + .1, .5);
  camTo(V(0, 2.1, lerp(5.0, 5.6, P(t, 43.5, 3))), V(0, 1.55, -1.2), 40);
}

// ---------- capa 2D ----------
function rr(x, y, w, h, r) { g.beginPath(); g.moveTo(x + r, y); g.arcTo(x + w, y, x + w, y + h, r); g.arcTo(x + w, y + h, x, y + h, r); g.arcTo(x, y + h, x, y, r); g.arcTo(x, y, x + w, y, r); g.closePath(); }
function txt(s, x, y, { w = 800, size = 40, f = 'M', color = C.text, align = 'center', ls = 0, alpha = 1 } = {}) { g.save(); g.globalAlpha *= alpha; g.font = `${w} ${size}px ${f}`; g.fillStyle = color; g.textAlign = align; g.textBaseline = 'middle'; if (ls) g.letterSpacing = ls + 'px'; g.fillText(s, x, y); g.restore(); }
function withT(x, y, s, a, fn) { g.save(); g.globalAlpha *= a; g.translate(x, y); g.scale(s, s); fn(); g.restore(); }
const HEAD = [[0, 'LA PREGUNTA', '¿POR QUÉ HUELEN TAN MAL?'], [2.4, 'CONOCE A LUIS', 'EL DE LA OFICINA'], [8.3, 'CONOCE A LUIS', '¿ESTARÁ DAÑADO?'], [10.55, 'EL EXPERIMENTO', '16 PERSONAS · HABICHUELAS'], [16.6, 'EL EXPERIMENTO', '2 JUECES OLIENDO'], [21.2, 'LO QUE DESCUBRIERON', 'CASI TODO EL GAS: SIN OLOR'], [25.1, 'LO QUE DESCUBRIERON', 'EL CULPABLE: AZUFRE'], [29.2, 'LA SOLUCIÓN DE LUIS', 'ANOTAR LO QUE COME'], [31.4, 'LA SOLUCIÓN DE LUIS', 'CULPABLE: LOS HUEVOS'], [35.4, 'RESULTADO', 'AIRE LIMPIO'], [37.7, 'LA VERDAD', 'NO ESTÁS DAÑADO'], [40.65, 'OJO', 'SI DUELE: AL MÉDICO'], [43.5, 'TU TURNO', '¿QUIÉN ES TU LUIS?']];

function plate2d(y0, y1, a = .55) { const gr = g.createLinearGradient(0, y0, 0, y1); gr.addColorStop(0, `rgba(5,7,15,${a})`); gr.addColorStop(1, 'rgba(5,7,15,0)'); g.fillStyle = gr; g.fillRect(0, y0, W, y1 - y0); }
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
function strike(x1, x2, y, p, color, wdt) { if (p <= 0) return; g.save(); g.strokeStyle = color; g.lineWidth = wdt; g.lineCap = 'round'; g.shadowColor = color; g.shadowBlur = 16; g.beginPath(); g.moveTo(x1, y); g.lineTo(lerp(x1, x2, eout(p)), y - 6 * p); g.stroke(); g.restore(); }
function pending(t) {
  const a0 = tCie, done = T('chin') - .1, a1 = done + 1.6; if (t < a0 || t > a1) return;
  const a = Math.min(P(t, a0, .3), 1 - P(t, a1 - .3, .3)), ok = t >= done;
  const label = ok ? 'RESUELTO:' : 'PENDIENTE:', body = ok ? 'el olor sale del azufre' : '¿qué descubrieron los jueces?';
  g.font = '700 28px J'; const w1 = g.measureText(label + ' ').width; g.font = '500 28px J'; const w2 = g.measureText(body).width, bw = w1 + w2 + 64;
  const k = ok ? 1 + .08 * Math.sin(P(t, done, .3) * Math.PI) : lerp(.85, 1, eback(P(t, a0, .35)));
  withT(540, 1600, k, a, () => { g.fillStyle = 'rgba(10,14,28,.85)'; rr(-bw / 2, -32, bw, 64, 32); g.fill(); g.lineWidth = 3; g.strokeStyle = ok ? C.green : hexA(C.blue, .8); g.stroke(); txt(label, -bw / 2 + 32, 2, { w: 700, size: 28, f: 'J', color: ok ? C.green : C.blue, align: 'left' }); txt(body, -bw / 2 + 32 + w1, 2, { w: 500, size: 28, f: 'J', color: C.text, align: 'left' }); });
}
function overlays(t) {
  if (t < 2.45) { // gancho
    const a = 1 - P(t, 2.25, .2);
    withT(540, 420, lerp(.92, 1, eback(P(t, 0, .4))), a, () => { g.font = '900 84px M'; const a1 = '¿PEOS ', a2 = 'APESTOSOS?', w1 = g.measureText(a1).width, w2 = g.measureText(a2).width, x0 = -(w1 + w2) / 2; g.save(); g.shadowColor = 'rgba(0,0,0,.6)'; g.shadowBlur = 20; txt(a1, x0, 0, { w: 900, size: 84, align: 'left' }); g.restore(); g.save(); g.shadowColor = '#5bd13a'; g.shadowBlur = 34; txt(a2, x0 + w1, 0, { w: 900, size: 84, color: '#8be36b', align: 'left' }); g.restore(); });
  }
  if (t > tDan2 - .4 && t < 40.6) { // DAÑADO → ES TU PLATO
    const a = Math.min(P(t, tDan2 - .4, .25), 1 - P(t, 40.35, .25)), sw = P(t, tPla - .15, .2);
    withT(540, 470, lerp(.85, 1, eback(P(t, tDan2 - .4, .4))), a * (1 - sw), () => { txt('NO ESTÁS', 0, -62, { w: 900, size: 56, color: '#b8bfd0' }); g.font = '900 112px M'; const w = g.measureText('DAÑADO').width; txt('DAÑADO', 0, 40, { w: 900, size: 112 }); strike(-w / 2 - 20, w / 2 + 20, 40, P(t, tDan2 + .15, .3), C.red, 16); });
    if (sw > 0) withT(540, 470, lerp(1.5, 1, eback(P(t, tPla - .15, .35))), a * sw, () => { g.shadowColor = C.green; g.shadowBlur = 40; txt('ES TU PLATO', 0, 0, { w: 900, size: 104, color: C.green }); });
  }
  if (t > tQui - .3) { // encuesta
    const p = P(t, tQui - .3, .35);
    txt('¿QUIÉN ES EL LUIS', 540, 440, { w: 900, size: 64, color: C.text, alpha: p }); txt('DE TU CASA?', 540, 515, { w: 900, size: 64, color: C.amber, alpha: p });
    [['A', 'Yo, lo confieso', C.green], ['B', 'Alguien de mi casa', C.red]].forEach(([l, s, col], i) => { const q = eback(P(t, tQui - .15 + i * .25, .35)); withT(540, 640 + i * 120, lerp(.8, 1, clamp(q)), clamp(q), () => { g.fillStyle = 'rgba(14,18,34,.92)'; rr(-380, -48, 760, 96, 18); g.fill(); g.lineWidth = 4; g.strokeStyle = col; g.stroke(); g.fillStyle = col; g.beginPath(); g.arc(-320, 0, 28, 0, 6.29); g.fill(); txt(l, -320, 2, { w: 900, size: 32, color: '#0b0e1a' }); txt(s, -270, 2, { w: 800, size: 40, color: C.text, align: 'left' }); }); });
  }
}

const noise = document.createElement('canvas'); noise.width = noise.height = 256; { const n = noise.getContext('2d'), id = n.createImageData(256, 256); for (let i = 0; i < id.data.length; i += 4) { const v = rnd() * 255; id.data[i] = id.data[i + 1] = id.data[i + 2] = v; id.data[i + 3] = 255; } n.putImageData(id, 0, 0); }
// ---------- render ----------
function renderAt(t) {
  seed = 7 + Math.floor(t * 30) * 13;
  const si = segAt(t), name = CUTS[si][1];
  for (const k in SETS) SETS[k].visible = k === name;
  const [bg, sky, rc] = ENV[name]; scene.background = new THREE.Color(bg); scene.fog.color.set(bg); hemi.color.set(sky); rim.color.set(rc);
  scene.fog.near = name === 'gut' ? 4 : 9; scene.fog.far = name === 'gut' ? 16 : 26;
  key.position.set(3.5, 7, 5); key.target.position.set(0, 1, 0);
  if (name === 'office') animOffice(t, si === 0 ? 0 : 1); else if (name === 'lab') animLab(t); else if (name === 'gut') animGut(t); else if (name === 'kitchen') animKitchen(t); else if (name === 'hero') animHero(t); else if (name === 'clinic') animClinic(t); else animHome(t);
  composer.render();
  g.drawImage(glc, 0, 0);
  plate2d(0, 560, .7); { const gr = g.createLinearGradient(0, 1240, 0, H); gr.addColorStop(0, 'rgba(5,7,15,0)'); gr.addColorStop(1, 'rgba(5,7,15,.6)'); g.fillStyle = gr; g.fillRect(0, 1240, W, H - 1240); }
  const vg = g.createRadialGradient(540, 960, 520, 540, 960, 1250); vg.addColorStop(0, 'rgba(0,0,0,0)'); vg.addColorStop(1, 'rgba(0,0,0,.5)'); g.fillStyle = vg; g.fillRect(0, 0, W, H);
  for (const [c] of CUTS.slice(1)) { const d = Math.abs(t - c); if (d < .2) { g.fillStyle = `rgba(4,6,12,${(1 - d / .2) * .85})`; g.fillRect(0, 0, W, H); } }
  if (t > tPum && t < tPum + .25) { g.fillStyle = `rgba(255,255,255,${(1 - (t - tPum) / .25) * .5})`; g.fillRect(0, 0, W, H); }
  overlays(t); header(t); pending(t); captions(t);
  g.save(); g.globalAlpha = .04; g.globalCompositeOperation = 'overlay'; const o = Math.floor(t * 30) * 37; for (let y = -(o % 256); y < H; y += 256) for (let x = -((o * 3) % 256); x < W; x += 256) g.drawImage(noise, x, y); g.restore();
  const fo = P(t, END - .4, .4); if (fo > 0) { g.fillStyle = `rgba(0,0,0,${fo})`; g.fillRect(0, 0, W, H); }
}
window.renderAt = renderAt; window.END = END;
window.frameJPG = (t, q = .92) => { renderAt(t); return out.toDataURL('image/jpeg', q).split(',')[1]; };
window.READY = true;
