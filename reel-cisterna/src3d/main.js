// Reel 9:16 3D (Estilo B: construcción en corte) — Construyes una cisterna
import * as THREE from 'three';
import { EffectComposer } from 'three/addons/postprocessing/EffectComposer.js';
import { RenderPass } from 'three/addons/postprocessing/RenderPass.js';
import { UnrealBloomPass } from 'three/addons/postprocessing/UnrealBloomPass.js';
import { OutputPass } from 'three/addons/postprocessing/OutputPass.js';

const W = 1080, H = 1920, END = 106.7;
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

// ---------- renderer (estilo B: low-poly de día) ----------
const glc = document.getElementById('gl'), out = document.getElementById('out'), g = out.getContext('2d');
const renderer = new THREE.WebGLRenderer({ canvas: glc, antialias: true, preserveDrawingBuffer: true });
renderer.setPixelRatio(1); renderer.setSize(W, H, false);
renderer.shadowMap.enabled = true; renderer.shadowMap.type = THREE.PCFSoftShadowMap;
renderer.toneMapping = THREE.ACESFilmicToneMapping; renderer.toneMappingExposure = 1.0;
const scene = new THREE.Scene(); scene.fog = new THREE.Fog(0xbfe3ff, 30, 80);
const cam = new THREE.PerspectiveCamera(50, W / H, .05, 200);
const rt = new THREE.WebGLRenderTarget(W, H, { samples: 4, type: THREE.HalfFloatType });
const composer = new EffectComposer(renderer, rt);
composer.addPass(new RenderPass(scene, cam));
const bloom = new UnrealBloomPass(new THREE.Vector2(W / 2, H / 2), .35, .4, .92); composer.addPass(bloom);
composer.addPass(new OutputPass());
const hemi = new THREE.HemisphereLight(0xcfe8ff, 0x6b8a4a, 1.3); scene.add(hemi);
const sunL = new THREE.DirectionalLight(0xfff4dc, 2.6); sunL.castShadow = true; sunL.shadow.mapSize.set(2048, 2048); sunL.shadow.bias = -.0005; sunL.shadow.normalBias = .02;
Object.assign(sunL.shadow.camera, { left: -14, right: 14, top: 14, bottom: -14, near: 1, far: 60 }); scene.add(sunL, sunL.target);
const roomL = new THREE.PointLight(0xffd59a, 0, 7, 1.5); roomL.position.set(-1.2, 2.3, -.4); scene.add(roomL);
const utilL = new THREE.PointLight(0xfff1d0, 0, 6, 1.5); utilL.position.set(1.9, 2.3, -.6); scene.add(utilL);

// ---------- utilidades low-poly ----------
const lp = (c, o = {}) => new THREE.MeshStandardMaterial({ color: c, roughness: .85, flatShading: true, ...o });
const add = (o, p = scene) => { p.add(o); return o; };
function at(o, x, y, z) { o.position.set(x, y, z); return o; }
function M(geo, m, cast = true) { const o = new THREE.Mesh(geo, m); o.castShadow = cast; o.receiveShadow = true; return o; }
const OVL = [];
function arcLabel(text, { color = '#ffcc33', size = 74, arc = .25 } = {}) {
  const c = document.createElement('canvas'), x = c.getContext('2d'); x.font = `italic 900 ${size}px M`;
  const w = x.measureText(text).width, cw = Math.ceil(w + size * 1.4), ch = Math.ceil(size * 2.6); c.width = cw; c.height = ch;
  x.font = `italic 900 ${size}px M`; x.textAlign = 'center'; x.textBaseline = 'middle'; x.lineJoin = 'round';
  const R = w / Math.max(.01, arc) / 2; let ang = -arc; const step = 2 * arc / Math.max(1, w);
  for (const chr of text) { const cwid = x.measureText(chr).width; ang += cwid / 2 * step; x.save(); x.translate(cw / 2 + Math.sin(ang) * R, ch * .62 + R - Math.cos(ang) * R); x.rotate(ang); x.lineWidth = size * .2; x.strokeStyle = '#3a2405'; x.strokeText(chr, 0, 0); x.fillStyle = color; x.fillText(chr, 0, 0); x.restore(); ang += cwid / 2 * step; }
  const tx = new THREE.CanvasTexture(c); tx.colorSpace = THREE.SRGBColorSpace;
  const sp = new THREE.Sprite(new THREE.SpriteMaterial({ map: tx, transparent: true, depthTest: false })); sp.userData.text = text; sp.userData.color = color; sp.renderOrder = 10; sp.scale.set(cw / 430, ch / 430, 1); sp.userData.base = sp.scale.clone(); return sp;
}

// ---------- mundo ----------
// cielo, sol, luna, estrellas, nubes
const sun = add(M(new THREE.IcosahedronGeometry(1.6, 2), new THREE.MeshBasicMaterial({ color: 0xfff1a0 }), false));
const sunHalo = add(new THREE.Sprite(new THREE.SpriteMaterial({ map: (() => { const t = canvasTex(256, 256), x = t.x, gr = x.createRadialGradient(128, 128, 0, 128, 128, 128); gr.addColorStop(0, 'rgba(255,240,160,.9)'); gr.addColorStop(1, 'rgba(255,240,160,0)'); x.fillStyle = gr; x.fillRect(0, 0, 256, 256); t.tx.needsUpdate = true; return t.tx; })(), transparent: true, depthWrite: false })));
const moon = add(M(new THREE.IcosahedronGeometry(1.1, 2), new THREE.MeshBasicMaterial({ color: 0xe8eeff }), false));
const stars = add(new THREE.Points(new THREE.BufferGeometry().setAttribute('position', new THREE.Float32BufferAttribute(Array.from({ length: 600 }, (_, i) => i % 3 === 0 ? (rnd() - .5) * 140 : i % 3 === 1 ? 8 + rnd() * 50 : -30 - rnd() * 30), 3)), new THREE.PointsMaterial({ color: 0xffffff, size: .35, transparent: true, depthWrite: false })));
const clouds = []; for (let i = 0; i < 9; i++) { const c = new THREE.Group(); for (let k = 0; k < 5; k++) { const s = M(new THREE.IcosahedronGeometry(1 + rnd() * .8, 0), lp(0xffffff), false); s.position.set(k * 1.3 - 2.6, rnd() * .6, rnd() * .5); c.add(s); } c.position.set(-40 + i * 10, 16 + rnd() * 6, -28 - rnd() * 10); c.userData.v = .3 + rnd() * .4; scene.add(c); clouds.push(c); }
// ---------- mundo: casa de azotea + cisterna en corte ----------
const FZ = 4;
function layer(y0, y1, c) { const b = add(M(new THREE.BoxGeometry(50, y0 - y1, 24), lp(c))); b.position.set(0, (y0 + y1) / 2, FZ - 12); return b; }
add(M(new THREE.BoxGeometry(50.1, .25, 24.1), lp(0x62b84b))).position.set(0, -.1, FZ - 12);
layer(-.22, -3.6, 0x9b6a3e); layer(-3.6, -7, 0x7c818c);
for (let i = 0; i < 40; i++) { const r = add(M(new THREE.DodecahedronGeometry(.08 + rnd() * .16, 0), lp(0x7c6a58))); r.position.set((rnd() - .5) * 30, -.5 - rnd() * 5.5, FZ + .02); if (r.position.x > 2 && r.position.x < 5.4 && r.position.y > -3.1) r.visible = false; }
for (let i = -12; i <= 12; i++) { const p = add(M(new THREE.BoxGeometry(.16, 1, .16), lp(0xf4f4f0))); p.position.set(i * 1.6, .5, -8); }
function bgHouse(x, z, c) { const h = new THREE.Group(); const b = M(new THREE.BoxGeometry(4, 2.6, 3.4), lp(c)); b.position.y = 1.3; h.add(b); const rf = M(new THREE.BoxGeometry(4.3, .25, 3.7), lp(0xd8d2c4)); rf.position.y = 2.72; h.add(rf); const tk = M(new THREE.CylinderGeometry(.45, .45, .9, 12), lp(0x1e1f24)); tk.position.set(.8, 3.3, 0); h.add(tk); for (const wx of [-1, 1]) { const w = M(new THREE.BoxGeometry(.7, .7, .05), lp(0x6aa7d8)); w.position.set(wx, 1.6, 1.72); h.add(w); } h.position.set(x, 0, z); scene.add(h); }
bgHouse(-10, -12, 0xf3e2c4); bgHouse(9, -13, 0xe9d7b5); bgHouse(15, -9, 0xf6d6c9);
function tree(x, z, s = 1) { const t = new THREE.Group(); const tr = M(new THREE.CylinderGeometry(.18, .25, 1.4, 6), lp(0x7a4f2c)); tr.position.y = .7; t.add(tr); const c1 = M(new THREE.IcosahedronGeometry(1.1, 0), lp(0x3f9a45)); c1.position.y = 2.0; t.add(c1); const c2 = M(new THREE.IcosahedronGeometry(.8, 0), lp(0x4aa84f)); c2.position.set(.3, 2.7, .1); t.add(c2); t.position.set(x, 0, z); t.scale.setScalar(s); scene.add(t); }
tree(-8, -4, 1.3); tree(8.5, -5, 1.2); tree(12, -2, 1.1);
// casa de azotea en corte (sin pared frontal)
const HW = lp(0xf6e7cc), HI = lp(0xfff6e6);
add(M(new THREE.BoxGeometry(5.7, .15, 4.2), lp(0xc9b8a0))).position.set(-1.75, .07, FZ - 2.1);
add(M(new THREE.BoxGeometry(5.7, 2.8, .16), HI)).position.set(-1.75, 1.4, FZ - 4.1);
add(M(new THREE.BoxGeometry(.16, 2.8, 4.2), HW)).position.set(-4.6, 1.4, FZ - 2.1);
add(M(new THREE.BoxGeometry(.16, 2.8, 4.2), HW)).position.set(1.1, 1.4, FZ - 2.1);
add(M(new THREE.BoxGeometry(.12, 2.8, 4.0), HI)).position.set(-1.85, 1.4, FZ - 2.1);
const roofS = add(M(new THREE.BoxGeometry(6.0, .22, 4.4), lp(0xd8d2c4))); roofS.position.set(-1.75, 2.91, FZ - 2.1);
add(M(new THREE.BoxGeometry(5.7, .3, .16), HW)).position.set(-1.75, 2.65, FZ - .02);
// baño: azulejo, regadera
add(M(new THREE.BoxGeometry(2.6, 2.0, .05), lp(0x9fd3e6), false)).position.set(-3.25, 1.1, FZ - 4.0);
const showerHead = add(M(new THREE.CylinderGeometry(.18, .1, .12, 12), lp(0xc9d1dc, { metalness: .6 }))); showerHead.position.set(-3.4, 2.3, FZ - 1.9);
const spray = []; for (let i = 0; i < 40; i++) { const d = add(M(new THREE.SphereGeometry(.025, 5, 4), new THREE.MeshBasicMaterial({ color: 0x8fd8ff }), false)); spray.push(d); }
// cocina
add(M(new THREE.BoxGeometry(1.8, .9, .7), lp(0xe9e4da))).position.set(-.4, .45, FZ - 3.6);
add(M(new THREE.BoxGeometry(1.9, .06, .8), lp(0x3c3f4a))).position.set(-.4, .93, FZ - 3.6);
// tinaco en la azotea (cascarón translúcido + agua)
const tin = new THREE.Group(); tin.position.set(-.6, 3.02, FZ - 1.6); scene.add(tin);
const tinShell = M(new THREE.CylinderGeometry(.62, .62, 1.3, 24), new THREE.MeshStandardMaterial({ color: 0x2a2c33, transparent: true, opacity: .45, roughness: .4, depthWrite: false }), false); tinShell.position.y = .65; tin.add(tinShell);
const tinLid = M(new THREE.CylinderGeometry(.3, .3, .1, 16), lp(0x1e1f24)); tinLid.position.y = 1.35; tin.add(tinLid);
const tinWater = M(new THREE.CylinderGeometry(.58, .58, 1, 24), new THREE.MeshStandardMaterial({ color: 0x3fa9f5, emissive: 0x1a6fb0, emissiveIntensity: .35, transparent: true, opacity: .85 }), false); tin.add(tinWater);
const fvArm = new THREE.Group(); fvArm.position.set(.45, 1.15, 0); tin.add(fvArm); { const arm = M(new THREE.CylinderGeometry(.02, .02, .55, 6), lp(0xd5dce6)); arm.rotation.z = Math.PI / 2; arm.position.x = -.27; fvArm.add(arm); const ball = M(new THREE.SphereGeometry(.12, 12, 10), lp(0xffffff)); ball.position.x = -.55; fvArm.add(ball); }
const spill = []; for (let i = 0; i < 40; i++) { const d = add(M(new THREE.SphereGeometry(.04, 5, 4), new THREE.MeshBasicMaterial({ color: 0x8fd8ff }), false)); spill.push(d); }
// tuberías
const pipeM = lp(0xf4f6fa);
const tube = pts => add(M(new THREE.TubeGeometry(new THREE.CatmullRomCurve3(pts, false, 'catmullrom', 0), 64, .045, 6), pipeM, false));
const upCurve = new THREE.CatmullRomCurve3([V(5.6, .35, FZ - .45), V(1.3, .35, FZ - .45), V(1.3, 3.3, FZ - .45), V(1.0, 3.75, FZ - 1.6), V(-.1, 3.75, FZ - 1.6)], false, 'catmullrom', 0);
const upPipe = add(M(new THREE.TubeGeometry(upCurve, 80, .045, 6), pipeM, false));
const downCurve = new THREE.CatmullRomCurve3([V(-1.0, 3.05, FZ - 1.6), V(-1.0, 2.62, FZ - 1.6), V(-3.4, 2.62, FZ - 1.9), V(-3.4, 2.36, FZ - 1.9)], false, 'catmullrom', 0);
const downPipe = add(M(new THREE.TubeGeometry(downCurve, 60, .04, 6), pipeM, false));
// cisterna en corte
const SECT = (w, h, c, z = .03) => { const m = add(M(new THREE.BoxGeometry(w, h, .04), c instanceof THREE.Material ? c : lp(c), false)); m.position.z = FZ + z; return m; };
const sectY = (m, top, bot) => { m.scale.y = Math.max(.001, top - bot); m.position.y = (top + bot) / 2; };
const CX0 = 2.4, CX1 = 5.0, CY0 = -2.9, CY1 = -.1;
const cHole = SECT(CX1 - CX0, 1, 0x2b1e15, .02); cHole.position.x = (CX0 + CX1) / 2;
const wallL = SECT(.2, 1, 0xb8bcc4, .05), wallR = SECT(.2, 1, 0xb8bcc4, .05), wallB = SECT(CX1 - CX0, .2, 0xb8bcc4, .05);
const coatL = SECT(.07, 1, 0x4f7fb8, .06), coatR = SECT(.07, 1, 0x4f7fb8, .06), coatB = SECT(CX1 - CX0 - .4, .07, 0x4f7fb8, .06);
const cWaterM = new THREE.MeshStandardMaterial({ color: 0x3fa9f5, emissive: 0x1a6fb0, emissiveIntensity: .35, transparent: true, opacity: .88 });
const cWater = SECT(CX1 - CX0 - .4, 1, cWaterM, .045); cWater.position.x = (CX0 + CX1) / 2;
const lid = new THREE.Group(); lid.position.set(CX0 + .35, .12, FZ - .55); scene.add(lid); { const l = M(new THREE.BoxGeometry(1.1, .1, 1.0), lp(0x9aa2b0)); l.position.x = .55; lid.add(l); const h = M(new THREE.BoxGeometry(.25, .06, .08), lp(0x5a606c)); h.position.set(.9, .08, 0); lid.add(h); }
const neck = add(M(new THREE.BoxGeometry(1.2, .25, 1.1), lp(0xb8bcc4))); neck.position.set(CX0 + .9, .02, FZ - .55);
const leaks = []; for (let i = 0; i < 30; i++) { const d = add(M(new THREE.SphereGeometry(.05, 5, 4), new THREE.MeshBasicMaterial({ color: 0x5ec8ff }), false)); leaks.push(d); }
// bomba, succión y pichancha
const pump = new THREE.Group(); pump.position.set(5.75, .3, FZ - .45); scene.add(pump); { const m = M(new THREE.CylinderGeometry(.22, .22, .5, 16), lp(0x2f6fd8)); m.rotation.z = Math.PI / 2; pump.add(m); const h = M(new THREE.CylinderGeometry(.25, .25, .16, 16), lp(0x9aa2b0)); h.rotation.z = Math.PI / 2; h.position.x = -.3; pump.add(h); const b = M(new THREE.BoxGeometry(.6, .06, .35), lp(0x444a58)); b.position.y = -.25; pump.add(b); }
const pumpLed = M(new THREE.SphereGeometry(.05, 8, 6), new THREE.MeshBasicMaterial({ color: 0x35d39a }), false); pumpLed.position.set(.15, .25, .1); pump.add(pumpLed);
const sucP = SECT(.08, 1, 0xf4f6fa, .07); sucP.position.x = 4.55; sectY(sucP, .3, -2.45);
const sucH = SECT(.08, .08, 0xf4f6fa, .07); sucH.scale.x = 15; sucH.position.set(5.15, .3, FZ + .07);
const sucW = SECT(.05, 1, new THREE.MeshBasicMaterial({ color: 0x3fa9f5 }), .09); sucW.position.x = 4.55;
const picha = new THREE.Group(); picha.position.set(4.55, -2.55, FZ + .1); scene.add(picha); { picha.add(M(new THREE.CylinderGeometry(.13, .13, .22, 10), new THREE.MeshStandardMaterial({ color: 0x9aa2b0, wireframe: true }), false)); picha.add(M(new THREE.CylinderGeometry(.06, .06, .24, 8), lp(0xd94a4a), false)); }
const smoke = []; for (let i = 0; i < 10; i++) { const s = add(M(new THREE.IcosahedronGeometry(.12, 0), new THREE.MeshStandardMaterial({ color: 0x555555, transparent: true, opacity: .6 }), false)); smoke.push(s); }
// flotador eléctrico
const fSw = new THREE.Group(); scene.add(fSw); { const f = M(new THREE.CapsuleGeometry(.07, .14, 4, 8), lp(0xffcc33), false); f.rotation.z = Math.PI / 2; fSw.add(f); }
const fCable = SECT(.025, 1, 0x222222, .08); fCable.position.x = 3.0;
// entrada de la calle + filtro
const inH = SECT(4.2, .1, 0xd9dee6, .06); inH.position.set(7.1, -.55, FZ + .06);
const inFlowP = []; for (let i = 0; i < 16; i++) { const d = add(M(new THREE.SphereGeometry(.045, 5, 4), new THREE.MeshBasicMaterial({ color: 0x8fd8ff }), false)); inFlowP.push(d); }
const street = add(M(new THREE.BoxGeometry(.25, .6, .25), lp(0x7a8290))); street.position.set(8.7, .3, FZ - .3);
const filt = new THREE.Group(); filt.position.set(6.3, -.55, FZ + .14); scene.add(filt); { filt.add(M(new THREE.CylinderGeometry(.16, .16, .45, 12), new THREE.MeshStandardMaterial({ color: 0xdff2ff, transparent: true, opacity: .7 }), false)); filt.add(M(new THREE.CylinderGeometry(.12, .12, .36, 10), lp(0xf0e2c0), false)); } filt.rotation.z = Math.PI / 2;
// algas, mosquitos, rayos de luz, cepillo
const algae = []; for (let i = 0; i < 26; i++) { const a = add(M(new THREE.IcosahedronGeometry(.05 + rnd() * .05, 0), lp(0x3f8a2a), false)); a.userData = { x: CX0 + .3 + rnd() * (CX1 - CX0 - .6), y: CY0 + .3 + rnd() * 1.6 }; algae.push(a); }
const mosq = []; for (let i = 0; i < 10; i++) { const m = new THREE.Group(); m.add(M(new THREE.CapsuleGeometry(.025, .08, 3, 6), lp(0x111111), false)); for (const s of [-1, 1]) { const w = M(new THREE.PlaneGeometry(.12, .05), new THREE.MeshBasicMaterial({ color: 0xffffff, transparent: true, opacity: .6, side: THREE.DoubleSide }), false); w.position.set(s * .07, .03, 0); m.add(w); } scene.add(m); mosq.push(m); }
const beams = []; for (let i = 0; i < 3; i++) { const b = add(M(new THREE.CylinderGeometry(.08, .35, 4.5, 8, 1, true), new THREE.MeshBasicMaterial({ color: 0xfff2a0, transparent: true, opacity: .25, depthWrite: false, side: THREE.DoubleSide }), false)); beams.push(b); }
const brush = new THREE.Group(); { brush.add(at(M(new THREE.CylinderGeometry(.03, .03, 1.4, 6), lp(0x8a5a3a)), 0, .7, 0)); brush.add(at(M(new THREE.BoxGeometry(.35, .1, .12), lp(0x2f6fd8)), 0, 0, 0)); } scene.add(brush);
// personaje
const owner = makeChar({ shirt: 0xff8a3d, pants: 0x2b3350 }); scene.add(owner.root);
const shovel = new THREE.Group(); { shovel.add(at(M(new THREE.CylinderGeometry(.03, .03, 1.2, 6), lp(0x8a5a3a)), 0, -.5, 0)); shovel.add(at(rbox(.26, .32, .03, .02, lp(0x9aa2b0, { metalness: .5 })), 0, -1.2, 0)); } owner.hand[1].add(shovel);
const dirt = []; for (let i = 0; i < 12; i++) { const d = add(M(new THREE.DodecahedronGeometry(.06, 0), lp(0x7a5230))); dirt.push(d); }
// partículas de flujo
function Stream(curve, color, n = 22) { const im = new THREE.InstancedMesh(new THREE.SphereGeometry(.055, 6, 4), new THREE.MeshBasicMaterial({ color }), n); im.frustumCulled = false; scene.add(im); const o = new THREE.Object3D(); return { im, upd(t, on, sp = .45) { for (let i = 0; i < n; i++) { const u = (t * sp + i / n) % 1; o.position.copy(curve.getPointAt(u)); o.scale.setScalar(on ? 1 : .0001); o.updateMatrix(); im.setMatrixAt(i, o.matrix); } im.instanceMatrix.needsUpdate = true; } }; }
const sUp = Stream(new THREE.CatmullRomCurve3([V(4.55, -2.4, FZ + .1), V(4.55, .3, FZ + .1), V(5.6, .35, FZ - .45), V(1.3, .35, FZ - .45), V(1.3, 3.3, FZ - .45), V(1.0, 3.75, FZ - 1.6), V(-.1, 3.75, FZ - 1.6)], false, 'catmullrom', 0), 0x8fd8ff, 44);
const sDown = Stream(downCurve, 0x8fd8ff, 18);
const LB = (n, c) => { const s = arcLabel(n, c ? { color: c } : {}); scene.add(s); return s; };
const LBL = { imp: LB('IMPERMEABILIZANTE'), bomba: LB('BOMBA'), tinaco: LB('TINACO'), grav: LB('GRAVEDAD'), picha: LB('PICHANCHA'), fsw: LB('FLOTADOR ELÉCTRICO'), fv: LB('VÁLVULA DE FLOTADOR'), algas: LB('ALGAS', '#7be36b'), tapa: LB('TAPA HERMÉTICA'), seis: LB('LAVAR CADA 6 MESES'), filtro: LB('FILTRO'), seco: LB('EN SECO', '#ff6a5a') };
const xMark = (() => { const t = canvasTex(200, 200), x = t.x; x.strokeStyle = '#ff3b3b'; x.lineWidth = 34; x.lineCap = 'round'; x.beginPath(); x.moveTo(40, 40); x.lineTo(160, 160); x.moveTo(160, 40); x.lineTo(40, 160); x.stroke(); t.tx.needsUpdate = true; const s = new THREE.Sprite(new THREE.SpriteMaterial({ map: t.tx, transparent: true, depthTest: false })); s.renderOrder = 9; s.scale.set(.7, .7, 1); return s; })(); scene.add(xMark);

// ---------- etiquetas amarillas 2D ancladas a 3D ----------
function drawArcText(text, cx, cy, size, color, k) {
  g.save(); g.font = `italic 900 ${size}px M`; g.letterSpacing = '1px';
  const chs = [...text], ws = chs.map(ch => g.measureText(ch).width + 1), w = ws.reduce((a, b) => a + b, 0), arc = .2, R = w / (2 * arc);
  g.translate(cx, cy); g.scale(k, k); g.lineJoin = 'round'; let acc = 0;
  for (let i = 0; i < ws.length; i++) { const a = (acc + ws[i] / 2 - w / 2) / R; acc += ws[i]; g.save(); g.translate(Math.sin(a) * R, R - Math.cos(a) * R); g.rotate(a); g.textAlign = 'center'; g.textBaseline = 'middle'; g.lineWidth = size * .22; g.strokeStyle = '#3a2405'; g.strokeText(chs[i], 0, 0); g.fillStyle = color; g.fillText(chs[i], 0, 0); g.restore(); }
  g.restore();
}
function overlayLabels(t) {
  for (const o of OVL) {
    const v = o.pos.clone().project(cam); if (v.z > 1) continue;
    let size = 86; g.font = `italic 900 ${size}px M`; let w = g.measureText(o.text).width + o.text.length; if (w > 860) { size = Math.floor(size * 860 / w); w = 860; }
    let x = (v.x * .5 + .5) * W, y = (-v.y * .5 + .5) * H; x = clamp(x, w / 2 + 70, W - w / 2 - 70); y = clamp(y, 330, 1640); if (Math.abs(y - 1020) < 170) y = y < 1020 ? 850 : 1190;
    const k = Math.max(.001, eback(P(t, o.at, .3))) * (1 - P(t, o.end - .15, .15));
    drawArcText(o.text, x, y, size, o.color, k);
  }
}
// ---------- tiempos ----------
const K = { concreto: T('concreto'), llenas: T('llenas'), bajo: T('bajó'), filtrando: T('filtrando'), imp: T('impermeabilizas'), guarda: T('guarda'), abajo: T('abajo'), regadera1: T('regadera', 1), bomba1: T('bomba', 1), tinaco1: T('tinaco', 1), gravedad: T('gravedad'), prendes: T('prendes'), ruido: T('ruido'), regreso: T('regresó'), pichancha: T('pichancha'), jalar: T('jalar'), cortan: T('cortan'), vacia: T('vacía'), seco: T('seco'), quema: T('quema'), electrico: T('eléctrico'), apaga: T('apaga'), arriba2: T('arriba', 2), desborda: T('desborda'), valvula2: T('válvula', 2), sube2: T('sube', 2), cierra: T('cierra'), llave: T('llave'), verde: T('verde'), luz: T('luz', 1), algas: T('algas'), mosquitos: T('mosquitos'), tapa2: T('tapa', 2), lavas: T('lavas'), seis: T('seis'), filtro: T('filtro'), abierta: T('abierta'), felic: T('felicidades'), tiempo: T('tiempo'), regadera2: T('regadera', 2) };
const SHOTS = [
  [0, 3.69, [10, 6.5, 15], [7.5, 5, 12.5], [.5, 1, 2], [1.2, .8, 2.4]],
  [3.69, 8.07, [3.7, -.6, 10.5], [3.7, -.9, 9.6], [3.7, -1.3, FZ], [3.7, -1.4, FZ]],
  [8.07, 15.15, [3.7, -1.0, 9.6], [3.6, -1.2, 9.0], [3.7, -1.5, FZ], [3.7, -1.5, FZ]],
  [15.15, 20.72, [2.6, -.4, 13], [-2.3, 1.7, 10.5], [3.2, -1.0, FZ], [-3.1, 1.5, FZ - 1]],
  [20.72, 28.42, [.2, 2.0, 21.5], [.2, 2.2, 20.6], [.2, 1.0, FZ], [.2, 1.1, FZ]],
  [28.42, 35.3, [5.9, .8, 10.2], [5.7, .6, 9.5], [4.9, -.5, FZ], [4.9, -.6, FZ]],
  [35.3, 43.38, [4.4, -1.5, 8.4], [4.4, -1.7, 7.8], [4.4, -2.1, FZ], [4.4, -2.1, FZ]],
  [43.38, 57.6, [5.9, .4, 15.8], [5.8, .2, 15.0], [5.8, -.8, FZ], [5.8, -.9, FZ]],
  [57.6, 70.61, [1.6, 5.6, 10.6], [1.2, 5.3, 9.8], [-.6, 3.3, FZ - 1.6], [-.6, 3.3, FZ - 1.6]],
  [70.61, 75.88, [-2.2, 2.0, 8.6], [-2.4, 1.9, 8.0], [-3.3, 1.5, FZ - 1.8], [-3.3, 1.5, FZ - 1.8]],
  [75.88, K.filtro - .2, [4.9, 1.7, 10.2], [4.8, 1.3, 9.4], [4.2, -.7, FZ], [4.2, -.8, FZ]],
  [K.filtro - .2, 95.3, [6.6, 1.2, 8.6], [6.5, 1.1, 8.1], [6.2, .35, FZ], [6.2, .35, FZ]],
  [95.3, 108, [9, 6, 15], [-4, 7, 13.5], [.5, 1.2, 2], [0, 1.2, 2]],
];
function camAt(t) { const s = SHOTS.find(s => t >= s[0] && t < s[1]) || SHOTS[SHOTS.length - 1]; const k = eio(clamp((t - s[0]) / (s[1] - s[0]))); cam.position.copy(V(...s[2]).lerp(V(...s[3]), k)); cam.fov = 50; cam.updateProjectionMatrix(); cam.lookAt(V(...s[4]).lerp(V(...s[5]), k)); }
const tmp = new THREE.Object3D();
// nivel de agua en la cisterna (0..1)
function cLevel(t) {
  if (t < K.llenas) return 0; if (t < K.bajo) return eout(P(t, K.llenas, 1.0)) * .85;
  if (t < K.imp + .5) return lerp(.85, .3, P(t, K.bajo - .2, 3.5)); if (t < K.cortan) return lerp(.3, .8, P(t, K.imp + .5, 2.0));
  if (t < K.electrico) return lerp(.8, .05, P(t, K.vacia - .4, 2.0)); if (t < K.lavas) return lerp(.05, .7, P(t, 57.6, 3)); if (t < K.filtro) return lerp(.7, 0, P(t, K.lavas, 1.2)) + lerp(0, .75, P(t, K.seis + .6, 1.6)); return .75;
}
function tLevel(t) { if (t < K.tinaco1) return 0; if (t < K.arriba2) return lerp(.1, .75, P(t, K.tinaco1 + .4, 4)); if (t < K.valvula2) return lerp(.75, 1, P(t, K.arriba2, 1.5)); return lerp(1, .9, P(t, K.valvula2, 1)); }
function animWorld(t) {
  const gold = P(t, 96, 3); const sky = new THREE.Color(0x8fd0ff).lerp(new THREE.Color(0xffb27a), gold * .5); scene.background = sky; scene.fog.color.copy(sky); scene.fog.near = 40; scene.fog.far = 90;
  hemi.intensity = 1.3; sunL.intensity = 2.6; sunL.color.set(gold > .1 ? 0xffc890 : 0xfff4dc); sunL.position.set(lerp(6, -14, gold), lerp(22, 9, gold), 16); sunL.target.position.set(0, -1, 0);
  sun.position.set(lerp(-12, -26, gold) * 1.7, lerp(22, 8, gold) * 1.7, -30); sun.visible = true; sunHalo.position.copy(sun.position); sunHalo.scale.setScalar(9); sunHalo.material.opacity = 1; moon.visible = false; stars.material.opacity = 0;
  clouds.forEach(c => { c.position.x = -40 + ((c.position.z * 7 + t * c.userData.v * 3) % 90 + 90) % 90 - 5; });
  // excavación y cisterna
  const dig = t < K.concreto ? P(t, 3.7, K.concreto - 3.7) : 1; sectY(cHole, CY1, lerp(CY1, CY0, dig)); cHole.visible = t > 3.6;
  const conc = P(t, K.concreto - .1, .6); [wallL, wallR].forEach((w, i) => { w.visible = conc > 0; w.position.x = i ? CX1 - .1 : CX0 + .1; sectY(w, CY1, lerp(CY1, CY0, eout(conc))); }); wallB.visible = conc > .9; wallB.position.set((CX0 + CX1) / 2, CY0 + .1, FZ + .05);
  const coat = eout(P(t, K.imp - .1, 1.4)); [coatL, coatR].forEach((c, i) => { c.visible = coat > 0; c.position.x = i ? CX1 - .235 : CX0 + .235; sectY(c, lerp(CY0 + .2, CY1, coat), CY0 + .2); }); coatB.visible = coat > 0; coatB.position.set((CX0 + CX1) / 2, CY0 + .235, FZ + .06);
  const lv = cLevel(t), wTop = CY0 + .2 + lv * (CY1 - CY0 - .4); cWater.visible = lv > .01; sectY(cWater, wTop, CY0 + .2);
  const green = P(t, K.verde - .4, .8) * (1 - P(t, K.lavas, .8)); cWaterM.color.set(new THREE.Color(0x3fa9f5).lerp(new THREE.Color(0x4f8a2a), green)); cWaterM.emissive.set(new THREE.Color(0x1a6fb0).lerp(new THREE.Color(0x1f3a10), green));
  leaks.forEach((d, i) => { const on = t > K.bajo - .2 && t < K.imp + .4; d.visible = on; const u = ((t - K.bajo) * .6 + i / leaks.length) % 1; const side = i % 3 === 0 ? 0 : i % 3 === 1 ? -1 : 1; d.position.set(side === 0 ? CX0 + .3 + (i * .37 % 1) * 2 : (side < 0 ? CX0 - u * 1.2 : CX1 + u * 1.2), side === 0 ? CY0 - u * 1.0 : CY0 + .4 + (i * .29 % 1) * 1.4 - u * .6, FZ + .08); });
  // tapa: abierta en luz/mosquitos, cerrada después
  const open = t > 75.88 && t < K.tapa2 + .3 ? 1 - P(t, K.tapa2 - .2, .4) : t > K.tapa2 + .3 ? 0 : 0; lid.rotation.z = open * 1.4 * (t > 76.2 ? 1 : P(t, 75.9, .3));
  // bomba, succión, pichancha, quemado
  pump.visible = t > K.bomba1 - .3; pump.scale.setScalar(Math.max(.001, eback(P(t, K.bomba1 - .3, .4))));
  const shake = (t > K.prendes && t < K.pichancha) || (t > K.seco - .3 && t < K.electrico) ? 1 : 0; pump.position.set(5.75 + (shake ? Math.sin(t * 60) * .02 : 0), .3, FZ - .45);
  const burnt = t > K.quema && t < K.electrico + .8; pumpLed.material.color.set(burnt ? 0xff3b3b : t > K.apaga ? (lv < .2 ? 0xff9f1a : 0x35d39a) : 0x35d39a);
  [sucP, sucH].forEach(m => m.visible = pump.visible);
  const sucTop = t < K.regreso ? .25 : t < K.pichancha + 1.5 ? lerp(.25, -2.4, eout(P(t, K.regreso, 1.2))) : lerp(-2.4, .25, eout(P(t, K.jalar - .3, .8))); sucW.visible = pump.visible && sucTop > -2.35; sectY(sucW, sucTop, -2.45);
  picha.visible = t > K.pichancha - .2; picha.scale.setScalar(Math.max(.001, eback(P(t, K.pichancha - .2, .4))));
  smoke.forEach((s, i) => { const u = (t * .8 + i / smoke.length) % 1; s.visible = burnt; s.position.set(5.75 + Math.sin(i * 2) * .2, .5 + u * 1.6, FZ - .45); s.scale.setScalar(.6 + u); s.material.opacity = .6 * (1 - u); });
  // flotador eléctrico
  fSw.visible = t > K.electrico - .3; fSw.position.set(3.0, Math.max(wTop, CY0 + .3) + .03, FZ + .1); fSw.scale.setScalar(Math.max(.001, eback(P(t, K.electrico - .3, .4)) * 1.5)); fCable.visible = fSw.visible; sectY(fCable, CY1, fSw.position.y);
  // entrada de la calle
  const cut = t > K.cortan && t < 57.6; const inOn = t > K.llenas && t < K.bajo || (t > K.imp + .5 && t < K.cortan) || (t > 57.6 && t < K.lavas) || t > K.seis + .6;
  inFlowP.forEach((d, i) => { const u = (t * .5 + i / inFlowP.length) % 1; d.visible = inOn; d.position.set(lerp(9.1, CX1 - .1, u), -.55, FZ + .1); });
  xMark.visible = cut; if (cut) xMark.position.set(8.7, 1.0, FZ - .3);
  filt.visible = t > K.filtro - .2; filt.scale.setScalar(Math.max(.001, eback(P(t, K.filtro - .2, .4)) * 1.7));
  // tinaco: aparece, se llena, se desborda, válvula de flotador
  tin.visible = t > K.tinaco1 - .3; tin.scale.setScalar(Math.max(.001, eback(P(t, K.tinaco1 - .3, .4)))); const tl = tLevel(t); tinWater.scale.y = Math.max(.01, tl * 1.25); tinWater.position.y = .03 + tl * 1.25 / 2;
  fvArm.visible = t > K.valvula2 - .2; fvArm.rotation.z = lerp(-.5, 0, P(t, K.sube2 - .2, .8));
  const over = t > K.desborda - .2 && t < K.valvula2 + .6; spill.forEach((d, i) => { const u = (t * .9 + i / spill.length) % 1; d.visible = over; const x = -.6 + Math.sin(i * 2.7) * .9; if (u < .15) d.position.set(lerp(-.6, x, u / .15), lerp(4.35, 3.1, u / .15), FZ - 1.6 + .62); else if (u < .5) d.position.set(x, 3.06, lerp(FZ - .98, FZ + .02, (u - .15) / .35)); else d.position.set(x, lerp(3.0, .05, ((u - .5) / .5) ** 2), FZ + .12); });
  // flujos
  const pumping = pump.visible && t > K.tinaco1 && !(t > K.prendes && t < K.jalar) && !(t > K.cortan && t < 57.6) && !(t > K.desborda + 1 && t < K.valvula2) ? 1 : 0;
  sUp.upd(t, pumping && t < K.cierra + .3 || (pumping && t > 72), .3);
  const showerOn = (t > K.gravedad && t < K.prendes) || (t > K.verde - .6 && t < 75.88) || t > K.felic - .3;
  sDown.upd(t, showerOn && tin.visible, .5);
  spray.forEach((d, i) => { const u = (t * 1.4 + i / spray.length) % 1; d.visible = showerOn && tin.visible; const a = i * 2.4; d.position.set(-3.4 + Math.cos(a) * u * .35, 2.25 - u * 2.1, FZ - 1.9 + Math.sin(a) * u * .35); d.material.color.set(t > K.verde - .6 && t < 75.88 ? 0x6fb84a : 0x8fd8ff); });
  // algas, mosquitos, rayos de luz, cepillo
  algae.forEach((a, i) => { a.visible = t > K.algas - .4 && t < K.lavas + .8; a.position.set(a.userData.x + Math.sin(t + i) * .05, Math.min(a.userData.y, wTop - .05), FZ + .1); a.scale.setScalar(Math.max(.001, eback(P(t, K.algas - .4 + i * .03, .3)))); });
  mosq.forEach((m, i) => { m.visible = t > K.mosquitos - .3 && t < K.tapa2 + .6; const a = t * 3 + i * 1.7; m.position.set(CX0 + 1.1 + Math.cos(a) * .6, .9 + Math.sin(a * 1.3) * .35 + i * .05, FZ - .5 + Math.sin(a) * .4); m.children[1].rotation.y = Math.sin(t * 60) * .6; m.children[2].rotation.y = -Math.sin(t * 60) * .6; });
  beams.forEach((b, i) => { b.visible = t > K.luz - .3 && t < K.tapa2; b.position.set(CX0 + .7 + i * .3, 2.2, FZ - .5); b.rotation.z = .25 - i * .08; b.material.opacity = .22 * P(t, K.luz - .3, .4); });
  brush.visible = t > K.lavas && t < K.seis + .9; brush.position.set(lerp(CX0 + .5, CX1 - .5, .5 + .5 * Math.sin(t * 5)), CY0 + .35 + Math.abs(Math.sin(t * 2.5)) * 1.2, FZ + .12); brush.rotation.z = Math.sin(t * 5) * .3;
  // personaje
  const digging = t < 3.69; shovel.visible = digging;
  if (digging) { owner.root.position.set(3.2, 0, 2.7); owner.root.rotation.y = -1.0; const sw = Math.sin(t * 7); pose(owner, { spineRx: .35 + .15 * sw, armR: [-1.0 + .4 * sw, -.2, -.6], armL: [-1.1 + .4 * sw, .2, -.7], emo: 'happy', headRx: .2 }, t); }
  else { owner.root.position.set(-3.4, 0, FZ - 1.75); owner.root.rotation.y = .2; const wet = showerOn; const sad = (t > K.regadera1 - .2 && t < K.gravedad) || (t > K.prendes && t < K.jalar) || (t > K.cortan && t < 57.6); const gross = t > K.verde - .5 && t < 75.88; pose(owner, { armL: wet && !gross ? [-2.6, .4, -.9] : [-.2, .2, -.3], armR: wet && !gross ? [-2.6, -.4, -.9] : gross ? [-1.2, -.3, -1.6] : [-.2, -.2, -.3], headRx: wet ? -.25 : 0, emo: gross ? 'disgust' : sad ? 'worried' : 'happy', look: [0, wet ? .5 : 0] }, t); }
  dirt.forEach((d, i) => { const ph = (t * 1.1 + i / dirt.length) % 1; d.visible = digging; d.position.set(3.6 - ph * 1.4, .2 + Math.sin(ph * Math.PI) * 1.3, 3.0 + Math.cos(i * 2) * .3); d.rotation.set(t * 4 + i, t * 3, 0); });
  // etiquetas
  OVL.length = 0; const L = (s, at, end, pos, color) => { s.visible = false; if (t >= at && t < end) OVL.push({ text: s.userData.text, at, end, pos: pos.clone(), color: color || s.userData.color }); };
  L(LBL.imp, K.imp, 15.15, V(3.7, -.6, FZ)); L(LBL.bomba, K.bomba1, 28.42, V(5.75, 1.0, FZ - .45)); L(LBL.tinaco, K.tinaco1, 28.42, V(-.6, 4.9, FZ - 1.6)); L(LBL.grav, K.gravedad, 28.42, V(-2.5, 3.4, FZ - 1.6));
  L(LBL.picha, K.pichancha, 43.38, V(4.4, -1.6, FZ)); L(LBL.seco, K.seco - .1, K.electrico - .2, V(5.6, 1.1, FZ - .45)); L(LBL.fsw, K.electrico, 57.6, V(3.2, .9, FZ));
  L(LBL.fv, K.valvula2, 70.61, V(-.6, 4.9, FZ - 1.6)); L(LBL.algas, K.algas, 83.5, V(3.7, -1.0, FZ)); L(LBL.tapa, K.tapa2, K.lavas - .1, V(3.0, 1.3, FZ - .5)); L(LBL.seis, K.seis - .3, K.filtro - .1, V(3.7, .9, FZ)); L(LBL.filtro, K.filtro, 95.3, V(6.3, -1.25, FZ));
}
const KEYW = new Set(['concreto', 'impermeabilizas', 'bomba', 'tinaco', 'gravedad', 'pichancha', 'válvula', 'flotador', 'eléctrico', 'seco', 'quema', 'desborda', 'verde', 'algas', 'mosquitos', 'tapa', 'seis', 'filtro', 'felicidades', 'regadera']);

function caption(t) {
  let i = -1; for (let k = 0; k < WORDS.length; k++) if (t >= WORDS[k].s - .03) i = k; if (i < 0) return;
  const w = WORDS[i], nx = WORDS[i + 1]; const end = nx ? Math.min(nx.s - .03, w.e + .5) : w.e + .6; if (t > end) return;
  const raw = w.w.replace(/[¿?¡!.,:…]/g, ''); const word = raw.charAt(0).toUpperCase() + raw.slice(1); const key = KEYW.has(norm(raw));
  const k = eback(P(t, w.s - .03, .14)); g.save(); g.translate(540, 1020); g.scale(lerp(.85, 1, k), lerp(.85, 1, k));
  g.font = '900 74px M'; g.textAlign = 'center'; g.textBaseline = 'middle'; g.lineJoin = 'round'; g.lineWidth = 14; g.strokeStyle = 'rgba(20,18,30,.9)'; g.shadowColor = 'rgba(0,0,0,.45)'; g.shadowBlur = 16; g.shadowOffsetY = 4; g.strokeText(word, 0, 0); g.shadowBlur = 0; g.shadowOffsetY = 0; g.fillStyle = key ? '#ffcc33' : '#ffffff'; g.fillText(word, 0, 0); g.restore();
}
// ---------- render ----------
function renderAt(t) {
  seed = 7 + Math.floor(t * 30) * 13;
  camAt(t); animWorld(t);
  composer.render(); g.drawImage(glc, 0, 0);
  const vg = g.createRadialGradient(540, 960, 650, 540, 960, 1300); vg.addColorStop(0, 'rgba(0,0,0,0)'); vg.addColorStop(1, 'rgba(0,0,0,.28)'); g.fillStyle = vg; g.fillRect(0, 0, W, H);
  overlayLabels(t); caption(t);
  const fo = P(t, END - .4, .4); if (fo > 0) { g.fillStyle = `rgba(0,0,0,${fo})`; g.fillRect(0, 0, W, H); }
}
window.renderAt = renderAt; window.END = END;
window.frameJPG = (t, q = .92) => { renderAt(t); return out.toDataURL('image/jpeg', q).split(',')[1]; };
window.READY = true;
