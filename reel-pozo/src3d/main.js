// Reel 9:16 3D (Estilo B: construcción en corte) — Cavas un pozo en tu patio
import * as THREE from 'three';
import { EffectComposer } from 'three/addons/postprocessing/EffectComposer.js';
import { RenderPass } from 'three/addons/postprocessing/RenderPass.js';
import { UnrealBloomPass } from 'three/addons/postprocessing/UnrealBloomPass.js';
import { OutputPass } from 'three/addons/postprocessing/OutputPass.js';

const W = 1080, H = 1920, END = 76.6;
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
// ---------- mundo: patio + subsuelo en corte (pozo) ----------
const FZ = 4; // cara frontal del corte
// capas del subsuelo (cara frontal en z = FZ)
function layer(y0, y1, c) { const b = add(M(new THREE.BoxGeometry(50, y0 - y1, 24), lp(c))); b.position.set(0, (y0 + y1) / 2, FZ - 12); return b; }
add(M(new THREE.BoxGeometry(50.1, .25, 24.1), lp(0x62b84b))).position.set(0, -.1, FZ - 12);
layer(-.22, -3, 0x9b6a3e); layer(-3, -5.5, 0xbf8f58); const aqL = layer(-5.5, -8.5, 0x7d93b0); layer(-8.5, -12, 0x7c818c);
for (let i = 0; i < 60; i++) { const y = -.6 - rnd() * 11, r = add(M(new THREE.DodecahedronGeometry(.08 + rnd() * .18, 0), lp(y < -8.5 ? 0x5f646e : y < -5.5 ? 0x9aa8bb : 0x7c6a58))); r.position.set((rnd() - .5) * 30, y, FZ + .02); if (Math.abs(r.position.x) < 1.2) r.visible = false; }
const aqSh = new THREE.InstancedMesh(new THREE.SphereGeometry(.05, 6, 4), new THREE.MeshBasicMaterial({ color: 0x9fe0ff }), 140); aqSh.frustumCulled = false; scene.add(aqSh);
const aqP = Array.from({ length: 140 }, () => V((rnd() - .5) * 18, -5.7 - rnd() * 2.6, FZ + .04));
const lineMat = new THREE.MeshBasicMaterial({ color: 0x5ec8ff, transparent: true, opacity: .9 }); const wtLine = add(M(new THREE.BoxGeometry(50, .05, .02), lineMat, false)); wtLine.position.set(0, -5.5, FZ + .03);
// cerca, árboles, casa
for (let i = -12; i <= 12; i++) { const p = add(M(new THREE.BoxGeometry(.16, 1, .16), lp(0xf4f4f0))); p.position.set(i * 1.6, .5, -8); }
function bgHouse(x, z, c) { const h = new THREE.Group(); const b = M(new THREE.BoxGeometry(4, 2.6, 3.4), lp(c)); b.position.y = 1.3; h.add(b); const rf = M(new THREE.ConeGeometry(3.2, 1.6, 4), lp(0xd9643a)); rf.rotation.y = Math.PI / 4; rf.scale.set(1, 1, .8); rf.position.y = 3.4; h.add(rf); for (const wx of [-1, 1]) { const w = M(new THREE.BoxGeometry(.7, .7, .05), lp(0x6aa7d8)); w.position.set(wx, 1.6, 1.72); h.add(w); } const d = M(new THREE.BoxGeometry(.8, 1.5, .05), lp(0x8a5a3a)); d.position.set(0, .75, 1.72); h.add(d); h.position.set(x, 0, z); scene.add(h); return h; }
const home = bgHouse(-6.5, -1.5, 0xf6e7cc); bgHouse(9, -12, 0xe9d7b5); bgHouse(-14, -11, 0xf0d9c0);
function tree(x, z, s = 1) { const t = new THREE.Group(); const tr = M(new THREE.CylinderGeometry(.18, .25, 1.4, 6), lp(0x7a4f2c)); tr.position.y = .7; t.add(tr); const c1 = M(new THREE.IcosahedronGeometry(1.1, 0), lp(0x3f9a45)); c1.position.y = 2.0; t.add(c1); const c2 = M(new THREE.IcosahedronGeometry(.8, 0), lp(0x4aa84f)); c2.position.set(.3, 2.7, .1); t.add(c2); t.position.set(x, 0, z); t.scale.setScalar(s); scene.add(t); return t; }
tree(-11, -4, 1.3); tree(6, -5, 1.2); tree(12, -7, 1.3);
for (let i = 0; i < 60; i++) { const b = add(M(new THREE.ConeGeometry(.07, .3, 3), lp(0x4f9e3c), false)); b.position.set((rnd() - .5) * 30, .12, -7 + rnd() * 10.5); }
// pozo en corte
const SECT = (w, h, c, z = .03) => { const m = add(M(new THREE.BoxGeometry(w, h, .04), c instanceof THREE.Material ? c : lp(c), false)); m.position.z = FZ + z; return m; };
const hole = SECT(1.2, 1, 0x2b1e15, .02);
const rubble = []; for (let i = 0; i < 26; i++) { const r = add(M(new THREE.DodecahedronGeometry(.12 + rnd() * .14, 0), lp(0x8a5f38))); r.userData.x = (rnd() - .5) * 1.0; r.userData.y = -.4 - rnd() * 3; r.userData.d = rnd() * .5; rubble.push(r); }
const casL = SECT(.12, 1, 0xd9dee6, .05), casR = SECT(.12, 1, 0xd9dee6, .05);
const water = SECT(.84, 1, new THREE.MeshStandardMaterial({ color: 0x3fa9f5, emissive: 0x1a6fb0, emissiveIntensity: .4, transparent: true, opacity: .85 }), .04);
const slots = []; for (let i = 0; i < 12; i++) for (const s of [-1, 1]) { const sl = SECT(.14, .06, 0x2b1e15, .07); sl.userData = { s, i }; slots.push(sl); }
const gravel = new THREE.InstancedMesh(new THREE.DodecahedronGeometry(.07, 0), lp(0xd8c9a8), 90); scene.add(gravel); const gravP = Array.from({ length: 90 }, (_, i) => V((i % 2 ? 1 : -1) * (.5 + rnd() * .1), -6.0 - rnd() * 2.2, FZ + .06));
const pump = new THREE.Group(); { const b = rbox(.42, .9, .12, .05, lp(0x2f6fd8)); pump.add(b); const st = M(new THREE.BoxGeometry(.3, .08, .13), lp(0x1d3f80)); for (let i = 0; i < 3; i++) { const s = st.clone(); s.position.y = -.25 + i * .25; pump.add(s); } } pump.position.z = FZ + .09; scene.add(pump);
const pumpPipe = SECT(.08, 1, 0xf4f6fa, .08);
const surfPipe = add(M(new THREE.TubeGeometry(new THREE.CatmullRomCurve3([V(0, .15, FZ - .2), V(1.2, .2, 3.4), V(2.3, .2, 3.1), V(2.3, .7, 3.1)]), 30, .05, 6), lp(0xf4f6fa), false));
const housePipe = add(M(new THREE.TubeGeometry(new THREE.CatmullRomCurve3([V(0, .12, FZ - .3), V(-2, .12, 2.6), V(-5, .12, 1.0), V(-6.0, .4, .3)]), 30, .05, 6), lp(0xf4f6fa), false));
const cable = add(M(new THREE.TubeGeometry(new THREE.CatmullRomCurve3([V(-5.6, .9, .25), V(-4, .1, 1.6), V(-1.5, .1, 3.0), V(-.1, .2, FZ - .25)]), 30, .03, 6), lp(0x222222), false));
// llave del patio
const faucet = new THREE.Group(); { faucet.add(at(M(new THREE.BoxGeometry(.2, 1.0, .2), lp(0x9aa2b0)), 0, .5, 0)); const sp = M(new THREE.CylinderGeometry(.05, .05, .35, 8), lp(0xc9d1dc, { metalness: .6 })); sp.rotation.x = Math.PI / 2; sp.position.set(0, .85, .2); faucet.add(sp); const hd = M(new THREE.CylinderGeometry(.09, .09, .05, 10), lp(0xd94a4a)); hd.position.set(0, 1.02, .05); faucet.add(hd); faucet.userData.handle = hd; } faucet.position.set(2.3, 0, 3.1); scene.add(faucet);
const stream = add(M(new THREE.CylinderGeometry(.045, .06, .78, 10), new THREE.MeshStandardMaterial({ color: 0x8a6a3a, transparent: true, opacity: .9, roughness: .1 }), false)); stream.position.set(2.3, .45, 3.48);
const puddle = add(M(new THREE.CylinderGeometry(.35, .35, .02, 16), new THREE.MeshStandardMaterial({ color: 0x8a6a3a, transparent: true, opacity: .8 }), false)); puddle.position.set(2.3, .03, 3.5);
const sand = []; for (let i = 0; i < 18; i++) { const s = add(M(new THREE.SphereGeometry(.025, 5, 4), lp(0xc8a46a), false)); sand.push(s); }
const germs = []; for (let i = 0; i < 6; i++) { const gm = new THREE.Group(); const b = M(new THREE.IcosahedronGeometry(.08, 0), new THREE.MeshStandardMaterial({ color: 0x6be36b, emissive: 0x2a8a2a, emissiveIntensity: .6, flatShading: true }), false); gm.add(b); for (let k = 0; k < 6; k++) { const sp = M(new THREE.ConeGeometry(.02, .07, 4), lp(0x4fbf4f), false); const a = k / 6 * 6.28; sp.position.set(Math.cos(a) * .09, Math.sin(a) * .09, 0); sp.rotation.z = a - Math.PI / 2; gm.add(sp); } scene.add(gm); germs.push(gm); }
const filterC = new THREE.Group(); { filterC.add(at(M(new THREE.CylinderGeometry(.2, .2, .6, 14), new THREE.MeshStandardMaterial({ color: 0xdff2ff, transparent: true, opacity: .55 }), false), 0, 0, 0)); filterC.add(at(M(new THREE.CylinderGeometry(.16, .16, .45, 12), lp(0xf0e2c0), false), 0, 0, 0)); filterC.add(at(M(new THREE.CylinderGeometry(.23, .23, .08, 14), lp(0x2f6fd8)), 0, .33, 0)); } filterC.position.set(1.65, .55, 3.25); scene.add(filterC);
// fosa séptica
const septic = new THREE.Group(); { septic.add(rbox(2.4, 1.4, .1, .06, lp(0x6b6f78))); const muck = M(new THREE.BoxGeometry(2.2, .8, .05), lp(0x5a4a2a), false); muck.position.set(0, -.25, .05); septic.add(muck); const lid = M(new THREE.BoxGeometry(.5, .25, .1), lp(0x6b6f78)); lid.position.set(-.5, .8, 0); septic.add(lid); } septic.position.set(4.2, -2.1, FZ + .05); scene.add(septic);
const plume = new THREE.InstancedMesh(new THREE.SphereGeometry(.07, 6, 4), new THREE.MeshBasicMaterial({ color: 0x7a5a1a, transparent: true, opacity: .85 }), 70); plume.frustumCulled = false; scene.add(plume);
const dimL = SECT(1, .05, new THREE.MeshBasicMaterial({ color: 0xffcc33 }), .1); const dimA = SECT(.05, .45, new THREE.MeshBasicMaterial({ color: 0xffcc33 }), .1), dimB = dimA.clone(); scene.add(dimB);
// sello sanitario
const seal = new THREE.Group(); { seal.add(at(M(new THREE.BoxGeometry(1.9, .14, 1.4), lp(0xb8bcc4)), 0, .07, -.7)); seal.add(at(M(new THREE.BoxGeometry(.96, .32, .7), lp(0xa8acb6)), 0, .3, -.35)); } seal.position.set(0, 0, FZ); scene.add(seal);
const sealSect = SECT(1.9, .5, 0xa8acb6, .08);
const dirtyDrops = []; for (let i = 0; i < 10; i++) { const d = add(M(new THREE.SphereGeometry(.05, 6, 4), new THREE.MeshBasicMaterial({ color: 0x8a6a3a }), false)); dirtyDrops.push(d); }
// frasco de análisis
const jar = new THREE.Group(); { jar.add(M(new THREE.CylinderGeometry(.16, .16, .5, 16), new THREE.MeshStandardMaterial({ color: 0xe8f6ff, transparent: true, opacity: .7, roughness: .05 }), false)); jar.add(at(M(new THREE.CylinderGeometry(.14, .14, .36, 16), new THREE.MeshStandardMaterial({ color: 0x2f9be8, emissive: 0x0f4f8a, emissiveIntensity: .4 }), false), 0, -.05, 0)); jar.add(at(M(new THREE.CylinderGeometry(.17, .17, .08, 16), lp(0xffffff)), 0, .28, 0)); const tag = M(new THREE.BoxGeometry(.2, .12, .01), lp(0xffffff), false); tag.position.set(0, 0, .16); jar.add(tag); } scene.add(jar);
// personaje: dueño con pala / vaso
const owner = makeChar({ shirt: 0xff8a3d, pants: 0x2b3350 }); scene.add(owner.root);
const shovel = new THREE.Group(); { shovel.add(at(M(new THREE.CylinderGeometry(.03, .03, 1.2, 6), lp(0x8a5a3a)), 0, -.5, 0)); shovel.add(at(rbox(.26, .32, .03, .02, lp(0x9aa2b0, { metalness: .5 })), 0, -1.2, 0)); } owner.hand[1].add(shovel);
const glass = M(new THREE.CylinderGeometry(.07, .06, .18, 12), new THREE.MeshStandardMaterial({ color: 0xbfe6ff, transparent: true, opacity: .6 }), false); glass.position.set(0, -.05, .06); owner.hand[0].add(glass);
const dirtFly = []; for (let i = 0; i < 14; i++) { const d = add(M(new THREE.DodecahedronGeometry(.06, 0), lp(0x7a5230))); dirtFly.push(d); }
const pumpFlow = (() => { const im = new THREE.InstancedMesh(new THREE.SphereGeometry(.05, 6, 4), new THREE.MeshBasicMaterial({ color: 0x9fe0ff }), 24); im.frustumCulled = false; scene.add(im); return im; })();
const bolts = (() => { const im = new THREE.InstancedMesh(new THREE.SphereGeometry(.06, 6, 4), new THREE.MeshBasicMaterial({ color: 0xffd23a }), 16); im.frustumCulled = false; scene.add(im); return im; })();
const cableCurve = new THREE.CatmullRomCurve3([V(-5.6, .95, .25), V(-4, .15, 1.6), V(-1.5, .15, 3.0), V(-.1, .25, FZ - .25)]);
const LB = n => { const s = arcLabel(n); scene.add(s); return s; };
const LBL = { tubo: LB('TUBO DE REVESTIMIENTO'), manto: LB('MANTO FREÁTICO'), bomba: LB('BOMBA SUMERGIBLE'), rejilla: LB('REJILLA Y GRAVA'), filtro: LB('FILTRO'), fosa: LB('FOSA SÉPTICA'), m15: LB('15 M O MÁS'), sello: LB('SELLO DE CONCRETO'), anal: LB('ANÁLISIS DE AGUA'), luz: LB('LA LUZ DE LA BOMBA'), seca: LB('TIERRA SECA') };

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
// ---------- tiempos (palabras de la voz) ----------
const K = { cavas2: T('cavas', 2), derrumba: T('derrumba'), revest: T('revestimiento'), bajando: T('bajando'), nada: T('nada'), seca: T('seca'), abajo: T('abajo'), empapadas: T('empapadas'), freatico: T('freático'), llegas: T('llegas'), sube: T('sube'), casa1: T('casa', 1), bomba1: T('bomba', 1), tuberia: T('tubería'), llave: T('llave'), turbia: T('turbia'), arena: T('arena', 1), grava: T('grava'), rejilla: T('rejilla'), filtro: T('filtro'), clara: T('clara'), enfermar: T('enfermar'), septica: T('séptica'), filtra: T('filtra'), lejos: T('lejos'), quince: T('quince'), arenoso: T('arenoso'), sellas: T('sellas'), concreto: T('concreto'), analizar: T('analizar'), felic: T('felicidades'), gratis2: T('gratis', 2), luz: T('luz'), bomba2: T('bomba', 2) };
const SHOTS = [
  [0, 3.3, [8, 6.5, 13.5], [5.5, 4.6, 10.5], [-.5, .6, 2], [0, .5, 2.5]],
  [3.3, 9.9, [0, -.9, 11.5], [0, -1.3, 10.2], [0, -1.4, FZ], [0, -1.6, FZ]],
  [9.9, 13.9, [0, -1.4, 10.6], [0, -1.6, 10.0], [0, -1.8, FZ], [0, -1.9, FZ]],
  [13.9, 17.7, [0, -2.6, 12.5], [0, -2.9, 12.0], [0, -3.0, FZ], [0, -3.2, FZ]],
  [17.7, 26.3, [0, -3.4, 13.5], [0, -5.4, 12.6], [0, -4.0, FZ], [0, -6.2, FZ]],
  [26.3, 31.1, [-2.6, -1.6, 17.5], [-2.8, -1.4, 16.8], [-2.6, -2.6, FZ], [-2.8, -2.5, FZ]],
  [31.1, 35.9, [0, -3.0, 15.0], [0, -3.2, 14.2], [0, -3.4, FZ], [0, -3.6, FZ]],
  [35.9, 39.6, [3.4, 1.4, 6.6], [3.1, 1.25, 5.9], [2.3, .6, 3.2], [2.3, .6, 3.2]],
  [39.6, K.filtro - .15, [0, -6.6, 8.6], [0, -6.8, 7.8], [0, -7.0, FZ], [0, -7.0, FZ]],
  [K.filtro - .15, 44.2, [3.5, 1.5, 6.7], [3.2, 1.35, 6.1], [1.9, .6, 3.2], [1.9, .6, 3.2]],
  [44.2, 47.8, [3.6, 1.6, 6.8], [3.3, 1.45, 6.2], [2.0, .8, 3.0], [2.0, .8, 3.0]],
  [47.8, 55.3, [2.0, -2.0, 15.5], [2.0, -2.3, 14.6], [2.0, -3.4, FZ], [2.0, -3.6, FZ]],
  [55.3, 61.8, [4.75, -1.2, 23.6], [4.75, -1.4, 23.0], [4.75, -2.4, FZ], [4.75, -2.6, FZ]],
  [61.8, 65.8, [1.8, 1.9, 8.2], [1.4, 1.6, 7.4], [0, .1, 3.6], [0, .1, 3.6]],
  [65.8, 68.7, [3.9, 1.7, 6.4], [3.7, 1.55, 5.9], [2.7, 1.0, 3.3], [2.7, 1.0, 3.3]],
  [68.7, 77, [8, 6, 13.5], [-5, 6.8, 12.5], [-1.5, .6, 1.5], [-1.5, .6, 1.5]],
];
function camAt(t) { const s = SHOTS.find(s => t >= s[0] && t < s[1]) || SHOTS[SHOTS.length - 1]; const k = eio(clamp((t - s[0]) / (s[1] - s[0]))); cam.position.copy(V(...s[2]).lerp(V(...s[3]), k)); cam.fov = 50; cam.updateProjectionMatrix(); cam.lookAt(V(...s[4]).lerp(V(...s[5]), k)); }
// ---------- estado del pozo ----------
function holeDepth(t) { if (t < 3.3) return .3; if (t < K.derrumba) return lerp(.3, 3.4, P(t, 3.4, K.derrumba - 3.4)); if (t < K.revest - .3) return 3.4; if (t < K.bajando) return 3.4; if (t < K.seca + .4) return lerp(3.4, 5.4, P(t, K.bajando, 1.6)); if (t < K.abajo) return 5.4; return lerp(5.4, 8.0, P(t, K.abajo, 1.6)); }
const sectY = (m, top, bot) => { m.scale.y = Math.max(.001, top - bot); m.position.y = (top + bot) / 2; };
const tmp = new THREE.Object3D();
function animWorld(t) {
  const gold = P(t, 69, 2.5); const sky = new THREE.Color(0x8fd0ff).lerp(new THREE.Color(0xffb27a), gold * .5); scene.background = sky; scene.fog.color.copy(sky); scene.fog.near = 40; scene.fog.far = 90;
  hemi.intensity = 1.3; sunL.intensity = 2.6; sunL.color.set(gold > .1 ? 0xffc890 : 0xfff4dc); sunL.position.set(lerp(6, -14, gold), lerp(22, 9, gold), 16); sunL.target.position.set(0, -3, 0);
  sun.position.set(lerp(-12, -26, gold) * 1.7, lerp(22, 8, gold) * 1.7, -30); sun.visible = true; sunHalo.position.copy(sun.position); sunHalo.scale.setScalar(9); sunHalo.material.opacity = 1; moon.visible = false; stars.material.opacity = 0;
  clouds.forEach(c => { c.position.x = -40 + ((c.position.z * 7 + t * c.userData.v * 3) % 90 + 90) % 90 - 5; });
  // hoyo y derrumbe
  const d = holeDepth(t); sectY(hole, 0, -d); hole.scale.x = 1;
  const col = P(t, K.derrumba, 1.0), cleared = t > K.revest - .5;
  rubble.forEach((r, i) => { const fall = eout(clamp((t - K.derrumba - r.userData.d) / .7)); r.visible = t > K.derrumba && !cleared; r.position.set(r.userData.x + (r.userData.x > 0 ? .4 : -.4) * (1 - fall), lerp(-.3 - rnd() * 0, -3.2 + i * .1, fall), FZ + .08); r.rotation.set(t * 3 + i, t * 2, 0); });
  // tubo de revestimiento
  const casOn = t > K.revest - .3; const casDrop = eout(P(t, K.revest - .3, .9));
  const casBot = casOn ? -Math.min(d, 8.0) : 0; const top = casOn ? lerp(3.5, .25, casDrop) : 0;
  [casL, casR].forEach((c, i) => { c.visible = casOn; sectY(c, top, casBot + (top - .25)); c.position.x = i ? .48 : -.48; });
  // agua en el manto y dentro del tubo
  aqP.forEach((p, i) => { tmp.position.set(p.x + Math.sin(t * .8 + i) * .15, p.y + Math.cos(t * .6 + i) * .05, p.z); tmp.scale.setScalar(.6 + .4 * Math.sin(t * 3 + i)); tmp.updateMatrix(); aqSh.setMatrixAt(i, tmp.matrix); }); aqSh.instanceMatrix.needsUpdate = true;
  const glowAq = P(t, K.abajo, .6) * (1 - P(t, 31.1, .5)); aqL.material.emissive.set(0x1f5fa8); aqL.material.emissiveIntensity = .35 * glowAq; wtLine.visible = t > K.empapadas - .3 && t < 61.8; lineMat.opacity = .6 + .4 * Math.sin(t * 5);
  const wl = t < K.llegas ? -8.2 : lerp(-5.6, -4.6, eout(P(t, K.sube, 1.2))); water.visible = t > K.llegas - .2 && d > 7; sectY(water, wl, -8.0);
  // rejilla (ranuras) y grava
  slots.forEach(sl => { sl.visible = t > K.grava - .3; sl.position.set(sl.userData.s * .48, -6.0 - sl.userData.i * .17, FZ + .07); });
  gravP.forEach((p, i) => { const k = eback(P(t, K.grava - .2 + i * .01, .3)); tmp.position.set(p.x, p.y + (1 - clamp(k)) * 3, p.z); tmp.scale.setScalar(Math.max(.001, k)); tmp.rotation.set(i, i * 2, 0); tmp.updateMatrix(); gravel.setMatrixAt(i, tmp.matrix); }); gravel.instanceMatrix.needsUpdate = true; gravel.visible = t > K.grava - .3;
  // bomba sumergible y flujo
  const pIn = eout(P(t, K.bomba1 - .2, 1.6)); pump.visible = t > K.bomba1 - .3; pump.position.set(0, lerp(-.5, -7.3, pIn), FZ + .09); pumpPipe.visible = pump.visible; sectY(pumpPipe, .2, pump.position.y + .45);
  const flowOn = t > K.tuberia - .3; pumpFlow.visible = flowOn; for (let i = 0; i < 24; i++) { const u = (t * .5 + i / 24) % 1; tmp.position.set(0, lerp(-6.9, .2, u), FZ + .12); tmp.scale.setScalar(flowOn ? 1 : .001); tmp.rotation.set(0, 0, 0); tmp.updateMatrix(); pumpFlow.setMatrixAt(i, tmp.matrix); } pumpFlow.instanceMatrix.needsUpdate = true;
  surfPipe.visible = t > K.bomba1; housePipe.visible = t > K.bomba1; cable.visible = t > K.bomba1;
  // llave: turbia → clara → gérmenes
  const tapOn = t > K.llave + .2; faucet.userData.handle.rotation.y = tapOn ? 1.2 : 0;
  const clean = t > K.clara - .2; stream.visible = tapOn && (t < 61.8 || t > 65.8); stream.material.color.set(clean ? 0x7fd0ff : 0x8a6a3a); stream.material.opacity = clean ? .65 : .92; stream.scale.y = 1 + .05 * Math.sin(t * 20);
  puddle.visible = stream.visible; puddle.material.color.set(clean ? 0x7fd0ff : 0x8a6a3a); puddle.scale.setScalar(.6 + .4 * P(t, K.llave + .2, 1.5));
  sand.forEach((s, i) => { const u = (t * 1.6 + i / sand.length) % 1; s.visible = tapOn && !clean; s.position.set(2.3 + Math.sin(i * 7) * .03, .82 - u * .78, 3.48 + Math.cos(i * 5) * .03); });
  germs.forEach((gm, i) => { const on = t > K.enfermar - .3 && t < 47.8; gm.visible = on; const u = (t * .9 + i / germs.length) % 1; gm.position.set(2.3 + Math.sin(t * 3 + i) * .18, .35 + u * .5, 3.55 + Math.cos(t * 2 + i) * .15); gm.rotation.set(t * 2 + i, t * 3, 0); gm.scale.setScalar(Math.max(.001, eback(P(t, K.enfermar - .3 + i * .08, .3)) * 1.3)); });
  filterC.visible = t > K.filtro - .2; filterC.scale.setScalar(Math.max(.001, eback(P(t, K.filtro - .2, .4))));
  // fosa séptica, filtración y distancia
  const septOn = t > K.septica - .5; septic.visible = septOn; const away = eio(P(t, K.lejos - .1, 1.6)); septic.position.x = lerp(3.4, 8.2, away); septic.scale.setScalar(Math.max(.001, eback(P(t, K.septica - .5, .4))));
  const plOn = t > K.filtra - .3 && t < 61.8; plume.visible = plOn; for (let i = 0; i < 70; i++) { const u = ((t - K.filtra) * .35 + i / 70) % 1; const reach = 1 - away; const sx = septic.position.x - .6, tx = lerp(sx, .3, reach * .95); tmp.position.set(lerp(sx, tx, u) + Math.sin(i * 3.1) * .25, lerp(-2.6, -5.9, Math.min(1, u * 1.3)) + Math.cos(i * 1.7) * .15, FZ + .1); tmp.scale.setScalar(plOn ? (.5 + .5 * Math.sin(i)) * (1 - u * .3) : .001); tmp.rotation.set(0, 0, 0); tmp.updateMatrix(); plume.setMatrixAt(i, tmp.matrix); } plume.instanceMatrix.needsUpdate = true;
  const dimOn = t > K.lejos && t < 61.8; [dimL, dimA, dimB].forEach(m => m.visible = dimOn); const x1 = .55, x2 = septic.position.x - 1.25; dimL.scale.x = Math.max(.01, x2 - x1); dimL.position.set((x1 + x2) / 2, -1.0, FZ + .1); dimA.position.set(x1, -1.0, FZ + .1); dimB.position.set(x2, -1.0, FZ + .1);
  // sello de concreto y agua sucia rebotando
  const sOn = t > K.concreto - .4; seal.visible = sOn; seal.scale.set(1, Math.max(.001, eout(P(t, K.concreto - .4, .7))), 1); sealSect.visible = sOn; sectY(sealSect, .25 * eout(P(t, K.concreto - .4, .7)), -.5); sealSect.scale.x = 1;
  dirtyDrops.forEach((dd, i) => { const ph = (t * 1.2 + i / dirtyDrops.length) % 1; dd.visible = t > 62.3 && t < 65.8; const x = (i % 2 ? 1 : -1) * (.2 + (i % 5) * .15); dd.position.set(x * (1 + (ph > .6 ? (ph - .6) * 4 : 0)), 1.6 - Math.min(ph, .6) * 2.4 + (ph > .6 ? Math.sin((ph - .6) * 7.8) * .3 : 0), FZ - .3 + (i % 3) * .1); });
  // frasco de análisis
  jar.visible = t > K.analizar - .3 && t < 68.7; jar.position.set(2.95, 1.25 + Math.sin(t * 2) * .03, 3.55); jar.rotation.z = Math.sin(t * 3) * .1; jar.scale.setScalar(Math.max(.001, eback(P(t, K.analizar - .3, .4))));
  // electricidad de la bomba
  const bOn = t > K.luz - .3; bolts.visible = bOn; for (let i = 0; i < 16; i++) { const u = (t * .6 + i / 16) % 1; tmp.position.copy(cableCurve.getPointAt(u)); tmp.scale.setScalar(bOn ? 1.2 : .001); tmp.updateMatrix(); bolts.setMatrixAt(i, tmp.matrix); } bolts.instanceMatrix.needsUpdate = true;
  // personaje
  const dig = t < 3.3, drink = t > 70;
  owner.root.position.set(dig ? .9 : t > 44 && t < 47.8 ? .7 : t > 68 ? -1.2 : 4.6, 0, dig ? 2.7 : t > 44 && t < 47.8 ? 2.0 : t > 68 ? 2.4 : 1.2); owner.root.rotation.y = dig ? -1.2 : t > 44 && t < 47.8 ? .6 : t > 68 ? .3 : -.9;
  shovel.visible = dig; glass.visible = drink || (t > 44 && t < 47.8);
  const sw = Math.sin(t * 7);
  if (dig) pose(owner, { spineRx: .35 + .15 * sw, armR: [-1.0 + .4 * sw, -.2, -.6], armL: [-1.1 + .4 * sw, .2, -.7], emo: 'happy', headRx: .2 }, t);
  else if (t > 44 && t < 47.8) pose(owner, { armL: [-1.2, .2, -1.6], armR: [-.2, -.2, -.3], emo: t > K.enfermar ? 'worried' : 'happy', headRx: .1, look: [0, -.4] }, t);
  else { const sip = drink ? Math.max(0, Math.sin((t - 70) * 1.8)) : 0; pose(owner, { armL: drink ? [-1.6 - sip * .7, .25, -1.9] : [-.1, .15, -.2], armR: t > K.luz ? [-.3, -.4, -1.0] : [-.1, -.15, -.2], headRx: -sip * .3, emo: t > K.luz + .5 ? 'surprised' : 'happy', look: [t > K.luz ? .5 : 0, 0] }, t); }
  dirtFly.forEach((df, i) => { const ph = (t * 1.1 + i / dirtFly.length) % 1; df.visible = dig; df.position.set(.3 - ph * 1.6 + Math.sin(i) * .2, .2 + Math.sin(ph * Math.PI) * 1.4, 2.9 + Math.cos(i * 2) * .3); df.rotation.set(t * 4 + i, t * 3, 0); });
  // etiquetas
  OVL.length = 0; const L = (s, at, end, pos, color) => { s.visible = false; if (t >= at && t < end) OVL.push({ text: s.userData.text, at, end, pos: pos.clone(), color: color || s.userData.color }); };
  L(LBL.tubo, K.revest, 13.9, V(0, .9, FZ)); L(LBL.seca, K.seca - .1, 17.7, V(0, -5.0, FZ), '#e8c08a'); L(LBL.manto, K.freatico - .3, 26.3, V(0, -5.0, FZ), '#7fd6ff');
  L(LBL.bomba, K.bomba1, 35.9, V(0, -2.2, FZ)); L(LBL.rejilla, K.rejilla - .2, K.filtro - .15, V(0, -5.6, FZ)); L(LBL.filtro, K.filtro, 44.2, V(1.65, 1.15, 3.25));
  L(LBL.fosa, K.septica, 55.3, V(septic.position.x, -1.0, FZ)); L(LBL.m15, K.quince - .2, 61.8, V((x1 + x2) / 2, -.2, FZ)); L(LBL.sello, K.concreto, 65.8, V(0, 1.0, FZ - .3));
  L(LBL.anal, K.analizar, 68.7, V(2.6, 1.9, 3.4)); L(LBL.luz, K.luz - .1, 77, V(-2.5, 1.8, 2));
}
// ---------- subtítulos de una palabra ----------
const KEYW = new Set(['revestimiento', 'freático', 'manto', 'bomba', 'sumergible', 'grava', 'rejilla', 'filtro', 'séptica', 'fosa', 'quince', 'concreto', 'analizar', 'felicidades', 'gratis', 'casi', 'turbia', 'enfermar']);

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
