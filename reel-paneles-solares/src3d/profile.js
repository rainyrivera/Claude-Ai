// Reel 9:16 3D (Estilo B: construcción en corte) — Paneles solares para no pagar luz
import * as THREE from 'three';
import { EffectComposer } from 'three/addons/postprocessing/EffectComposer.js';
import { RenderPass } from 'three/addons/postprocessing/RenderPass.js';
import { UnrealBloomPass } from 'three/addons/postprocessing/UnrealBloomPass.js';
import { OutputPass } from 'three/addons/postprocessing/OutputPass.js';

const W = 1080, H = 1080, END = 76.0;
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
// terreno en corte
const soil = add(M(new THREE.BoxGeometry(46, 4, 30), lp(0xa06a3e))); soil.position.set(0, -2.05, -5);
const rockL = add(M(new THREE.BoxGeometry(46, 1.2, 30.1), lp(0x8a8f99))); rockL.position.set(0, -3.5, -5);
const grass = add(M(new THREE.BoxGeometry(46.1, .2, 30.1), lp(0x62b84b))); grass.position.set(0, -.05, -5);
for (let i = 0; i < 26; i++) { const r = add(M(new THREE.DodecahedronGeometry(.12 + rnd() * .2, 0), lp(0x7c818c))); r.position.set((rnd() - .5) * 40, -.6 - rnd() * 2.4, 10.05); }
for (let i = 0; i < 70; i++) { const b = add(M(new THREE.ConeGeometry(.08, .35, 3), lp(0x4f9e3c), false)); b.position.set((rnd() - .5) * 40, .15, -18 + rnd() * 27); if (Math.abs(b.position.x) < 4.2 && b.position.z > -2.5 && b.position.z < 2.6) b.visible = false; }
// cerca y casas vecinas
for (let i = -11; i <= 11; i++) { const p = add(M(new THREE.BoxGeometry(.18, 1.1, .18), lp(0xf4f4f0))); p.position.set(i * 1.6, .55, -6.5); } { const r1 = add(M(new THREE.BoxGeometry(36, .12, .08), lp(0xf4f4f0))); r1.position.set(0, .8, -6.5); const r2 = r1.clone(); r2.position.y = .45; scene.add(r2); }
function bgHouse(x, z, c) { const h = new THREE.Group(); const b = M(new THREE.BoxGeometry(4, 2.6, 3.4), lp(c)); b.position.y = 1.3; h.add(b); const rf = M(new THREE.ConeGeometry(3.2, 1.6, 4), lp(0xd9643a)); rf.rotation.y = Math.PI / 4; rf.scale.set(1, 1, .8); rf.position.y = 3.4; h.add(rf); for (const wx of [-1, 1]) { const w = M(new THREE.BoxGeometry(.7, .7, .05), lp(0x6aa7d8)); w.position.set(wx, 1.6, 1.72); h.add(w); } h.position.set(x, 0, z); scene.add(h); }
bgHouse(-10, -11, 0xf3e2c4); bgHouse(10.5, -12, 0xe9d7b5); bgHouse(-3, -15, 0xf0d9c0); bgHouse(5, -16, 0xf6ead2);
function tree(x, z, s = 1) { const t = new THREE.Group(); const tr = M(new THREE.CylinderGeometry(.18, .25, 1.4, 6), lp(0x7a4f2c)); tr.position.y = .7; t.add(tr); const c1 = M(new THREE.IcosahedronGeometry(1.1, 0), lp(0x3f9a45)); c1.position.y = 2.0; t.add(c1); const c2 = M(new THREE.IcosahedronGeometry(.8, 0), lp(0x4aa84f)); c2.position.set(.3, 2.7, .1); t.add(c2); t.position.set(x, 0, z); t.scale.setScalar(s); scene.add(t); return t; }
tree(-8, -4, 1.2); tree(8.5, -5, 1.1); tree(-12, -8, 1.3); tree(12, -9, 1.2);
// CASA en corte (sin pared frontal)
const house = new THREE.Group(); scene.add(house);
const WALL = lp(0xf6e7cc), WALLI = lp(0xfff6e6);
house.add(at(M(new THREE.BoxGeometry(6.3, .15, 4.3), lp(0xc99a6b)), 0, .07, 0));
house.add(at(M(new THREE.BoxGeometry(6.3, 2.6, .16), WALLI), 0, 1.3, -2.08));
for (const x of [-3.08, 3.08]) house.add(at(M(new THREE.BoxGeometry(.16, 2.6, 4.3), WALL), x, 1.3, 0));
house.add(at(M(new THREE.BoxGeometry(.12, 2.6, 4.1), WALLI), .78, 1.3, 0));
for (const x of [-2.85, 2.85]) house.add(at(M(new THREE.BoxGeometry(.5, 2.6, .16), WALL), x, 1.3, 2.08));
house.add(at(M(new THREE.BoxGeometry(6.3, .25, .16), WALL), 0, 2.48, 2.08));
const TH = Math.atan(1.6 / 2.3), SL = Math.hypot(1.6, 2.3) + .3;
const roofF = new THREE.Group(); roofF.position.set(0, 3.42, 1.15); roofF.rotation.x = TH; house.add(roofF);
roofF.add(M(new THREE.BoxGeometry(6.9, .16, SL), lp(0xd9643a)));
const roofB = M(new THREE.BoxGeometry(6.9, .16, SL), lp(0xc95a33)); roofB.position.set(0, 3.42, -1.15); roofB.rotation.x = -TH; house.add(roofB);
for (const x of [-3.08, 3.08]) { const s = new THREE.Shape(); s.moveTo(-2.15, 0); s.lineTo(2.15, 0); s.lineTo(0, 1.55); s.closePath(); const gm = new THREE.ExtrudeGeometry(s, { depth: .16, bevelEnabled: false }); const gb = M(gm, WALL); gb.rotation.y = Math.PI / 2; gb.position.set(x - .08, 2.6, 0); house.add(gb); }
{ const door = at(M(new THREE.BoxGeometry(.9, 1.7, .1), lp(0x8a5a3a)), 3.14, .9, -.9); door.rotation.y = Math.PI / 2; house.add(door); }
// sala
const sofa = new THREE.Group(); sofa.add(at(M(new THREE.BoxGeometry(.9, .45, 1.9), lp(0x4a6fd1)), 0, .37, 0), at(M(new THREE.BoxGeometry(.25, .7, 1.9), lp(0x3f60b8)), -.4, .65, 0)); sofa.position.set(-2.35, 0, -.6); house.add(sofa);
const rug = add(M(new THREE.CylinderGeometry(1.1, 1.1, .02, 8), lp(0xe0648a), false), house); rug.position.set(-1.1, .16, -.4);
const tvG = new THREE.Group(); tvG.position.set(.66, 1.35, -.6); tvG.rotation.y = -Math.PI / 2; house.add(tvG);
tvG.add(M(new THREE.BoxGeometry(1.4, .82, .08), lp(0x1a1d26)));
const tvTex = canvasTex(256, 150); const tvScr = M(new THREE.PlaneGeometry(1.3, .72), new THREE.MeshBasicMaterial({ map: tvTex.tx }), false); tvScr.position.z = .045; tvG.add(tvScr);
const outlet = at(M(new THREE.BoxGeometry(.06, .16, .12), lp(0xffffff)), .7, .38, -.6); house.add(outlet);
const lampG = new THREE.Group(); lampG.add(at(M(new THREE.CylinderGeometry(.03, .03, 1.5, 6), lp(0x333333)), 0, .75, 0)); const lampShade = M(new THREE.CylinderGeometry(.18, .28, .3, 8, 1, true), new THREE.MeshStandardMaterial({ color: 0xfff0d0, emissive: 0xffc070, emissiveIntensity: 0, side: THREE.DoubleSide, flatShading: true })); lampShade.position.y = 1.55; lampG.add(lampShade); lampG.position.set(-2.7, .15, -1.6); house.add(lampG);
const owner = makeChar({ shirt: 0xff8a3d, pants: 0x2b3350 }); owner.root.position.set(-2.25, 0, -.6); owner.root.rotation.y = Math.PI / 2; house.add(owner.root);
// cuarto de máquinas
const invG = new THREE.Group(); invG.position.set(1.75, 1.55, -1.9); house.add(invG); invG.add(rbox(.75, .95, .22, .05, lp(0xf4f6fa)));
const invTex = canvasTex(200, 120); const invScr = M(new THREE.PlaneGeometry(.42, .25), new THREE.MeshBasicMaterial({ map: invTex.tx }), false); invScr.position.set(0, .15, .12); invG.add(invScr);
const ctrlG = new THREE.Group(); ctrlG.position.set(1.15, 2.25, -1.9); house.add(ctrlG); ctrlG.add(rbox(.42, .5, .16, .04, lp(0x2f6fd8)));
const ctrlLed = M(new THREE.SphereGeometry(.035, 8, 6), new THREE.MeshBasicMaterial({ color: 0x35d39a }), false); ctrlLed.position.set(.12, .15, .09); ctrlG.add(ctrlLed);
const bats = []; for (let i = 0; i < 3; i++) { const b = new THREE.Group(); b.add(rbox(.42, 1.0, .4, .05, lp(0x2b2f3a))); const lv = M(new THREE.PlaneGeometry(.12, .8), new THREE.MeshBasicMaterial({ color: 0x35d39a }), false); lv.position.set(0, 0, .205); b.add(lv); b.userData.lv = lv; const cap1 = M(new THREE.CylinderGeometry(.05, .05, .06, 8), lp(0xd94a4a)); cap1.position.set(-.1, .53, 0); const cap2 = M(new THREE.CylinderGeometry(.05, .05, .06, 8), lp(0x222222)); cap2.position.set(.1, .53, 0); b.add(cap1, cap2); b.position.set(1.35 + i * .55, .65, -1.45); house.add(b); bats.push(b); }
const fuseG = new THREE.Group(); fuseG.position.set(2.65, 1.55, -1.95); house.add(fuseG); fuseG.add(rbox(.5, .7, .14, .03, lp(0x9aa2b0)));
const fuses = []; for (let i = 0; i < 4; i++) { const f = M(new THREE.BoxGeometry(.07, .18, .06), lp(0xffcc33)); f.position.set(-.15 + i * .1, 0, .09); fuseG.add(f); fuses.push(f); }
// medidor y poste
const meterG = new THREE.Group(); meterG.position.set(2.85, 1.45, 2.2); meterG.rotation.y = 0; house.add(meterG); meterG.add(rbox(.5, .7, .16, .05, lp(0xb8c0cc)));
const mTex = canvasTex(220, 110); const mScr = M(new THREE.PlaneGeometry(.36, .18), new THREE.MeshBasicMaterial({ map: mTex.tx }), false); mScr.position.set(0, .1, .085); meterG.add(mScr);
const pole = new THREE.Group(); pole.add(at(M(new THREE.CylinderGeometry(.13, .17, 6, 8), lp(0x7a4f2c)), 0, 3, 0), at(M(new THREE.BoxGeometry(1.4, .12, .12), lp(0x7a4f2c)), 0, 5.6, 0)); pole.position.set(7.2, 0, 1.2); scene.add(pole);
const wire = add(M(new THREE.TubeGeometry(new THREE.CatmullRomCurve3([V(2.85, 1.85, 2.25), V(2.95, 2.9, 2.3), V(5.2, 4.2, 1.8), V(7.2, 5.62, 1.2)]), 20, .025, 6), lp(0x222222), false));
// tierra física
const rod = add(M(new THREE.CylinderGeometry(.04, .04, 2.6, 6), lp(0xd18a4a, { metalness: .5, roughness: .4 }))); rod.position.set(3.6, -1.0, 10.08);
const gWire = add(M(new THREE.TubeGeometry(new THREE.CatmullRomCurve3([V(3.18, 1.0, 1.6), V(3.4, .2, 4), V(3.6, .2, 9.5), V(3.6, .25, 10.08)]), 30, .025, 6), lp(0x35b84a), false));
// paneles
const PANEL_TEX = (() => { const t = canvasTex(256, 200), x = t.x; x.fillStyle = '#16326e'; x.fillRect(0, 0, 256, 200); for (let i = 0; i < 6; i++) for (let j = 0; j < 4; j++) { x.fillStyle = (i + j) % 2 ? '#1f468f' : '#1b3e82'; x.fillRect(6 + i * 41.5, 6 + j * 47, 38, 43); } x.strokeStyle = 'rgba(255,255,255,.45)'; x.lineWidth = 2; for (let i = 1; i < 6; i++) { x.beginPath(); x.moveTo(4 + i * 41.5, 4); x.lineTo(4 + i * 41.5, 196); x.stroke(); } t.tx.needsUpdate = true; return t.tx; })();
const panels = []; const PX = [-2.45, -1.15, .15, 1.45, 2.75], PZ = [.62, -.62];
for (let r = 0; r < 2; r++) for (let c = 0; c < 4; c++) { if (r === 0 && c === 3) continue; const p = new THREE.Group(); const fr = M(new THREE.BoxGeometry(1.22, .06, 1.12), lp(0xcfd6e0, { metalness: .4 })); p.add(fr); const cm = new THREE.MeshStandardMaterial({ map: PANEL_TEX, emissive: 0xff5a1a, emissiveIntensity: 0, roughness: .25, metalness: .3 }); const cl = M(new THREE.PlaneGeometry(1.14, 1.04), cm, false); cl.rotation.x = -Math.PI / 2; cl.position.y = .035; p.add(cl); const rack = M(new THREE.BoxGeometry(1.1, .3, .08), lp(0x9aa2b0)); rack.position.set(0, -.15, 0); rack.visible = false; p.add(rack); p.userData = { r, c, cm, rack, home: V(PX[c], .12, PZ[r]) }; roofF.add(p); panels.push(p); }
const shadeP = panels.find(p => p.userData.r === 0 && p.userData.c === 0);
const shadowPatch = (() => { const t = canvasTex(256, 256), x = t.x, gr = x.createRadialGradient(80, 90, 10, 80, 90, 150); gr.addColorStop(0, 'rgba(0,0,0,.75)'); gr.addColorStop(1, 'rgba(0,0,0,0)'); x.fillStyle = gr; x.fillRect(0, 0, 256, 256); t.tx.needsUpdate = true; const m = M(new THREE.PlaneGeometry(1.14, 1.04), new THREE.MeshBasicMaterial({ map: t.tx, transparent: true, depthWrite: false }), false); m.rotation.x = -Math.PI / 2; m.position.y = .04; return m; })(); shadeP.add(shadowPatch);
const diodeBox = new THREE.Group(); { diodeBox.add(rbox(.36, .16, .06, .02, lp(0x222222))); for (let i = 0; i < 3; i++) { const d = M(new THREE.BoxGeometry(.06, .05, .04), new THREE.MeshBasicMaterial({ color: 0x35d39a }), false); d.position.set(-.1 + i * .1, 0, .04); diodeBox.add(d); } } diodeBox.rotation.x = -Math.PI / 2; diodeBox.position.set(0, .05, .35); shadeP.add(diodeBox);
const nTree = tree(-5.0, -.6, .01);
// líneas de calor y flechas de aire
const heatW = []; for (let i = 0; i < 6; i++) { const pts = []; for (let k = 0; k < 12; k++) pts.push(V(Math.sin(k * .9) * .12, k * .12, 0)); const m = M(new THREE.TubeGeometry(new THREE.CatmullRomCurve3(pts), 24, .03, 5), new THREE.MeshBasicMaterial({ color: 0xfff1b0, transparent: true, opacity: .8 }), false); m.position.set(-2.4 + i * .95, 3.3, 1.3 + (i % 2) * .5); scene.add(m); heatW.push(m); }
function arrowMesh(col = 0xffffff) { const a = new THREE.Group(); a.add(at(M(new THREE.CylinderGeometry(.05, .05, .4, 6), new THREE.MeshBasicMaterial({ color: col }), false), 0, -.15, 0), at(M(new THREE.ConeGeometry(.12, .22, 6), new THREE.MeshBasicMaterial({ color: col }), false), 0, .15, 0)); return a; }
const airA = []; for (let i = 0; i < 8; i++) { const a = arrowMesh(); a.rotation.z = -Math.PI / 2; scene.add(a); airA.push(a); }
// termómetro y medidor de producción (sprites)
function gaugeSprite() { const t = canvasTex(420, 120); GAUGE_CV = t.c; const sp = new THREE.Sprite(new THREE.SpriteMaterial({ map: t.tx, transparent: true, depthTest: false })); sp.renderOrder = 9; sp.scale.set(1.75, .5, 1); sp.userData.base = sp.scale.clone(); sp.userData.draw = (v, col) => { const x = t.x; x.clearRect(0, 0, 420, 120); x.fillStyle = 'rgba(20,24,40,.85)'; rrp(x, 0, 4, 4, 412, 112, 28); x.fill(); x.font = '900 34px M'; x.fillStyle = '#fff'; x.textBaseline = 'middle'; x.fillText('PRODUCCIÓN', 24, 38); x.fillStyle = 'rgba(255,255,255,.15)'; rrp(x, 0, 24, 70, 372, 26, 13); x.fill(); x.fillStyle = col; rrp(x, 0, 24, 70, Math.max(26, 372 * v), 26, 13); x.fill(); t.tx.needsUpdate = true; }; return sp; }
let GAUGE_CV; const gauge = gaugeSprite(); scene.add(gauge);
const thermo = new THREE.Group(); { thermo.add(at(M(new THREE.CylinderGeometry(.08, .08, 1.2, 10), new THREE.MeshStandardMaterial({ color: 0xffffff, transparent: true, opacity: .5 }), false), 0, .6, 0)); const bulb = M(new THREE.SphereGeometry(.16, 12, 10), new THREE.MeshBasicMaterial({ color: 0xff3b3b }), false); thermo.add(bulb); const lvl = M(new THREE.CylinderGeometry(.05, .05, 1, 8), new THREE.MeshBasicMaterial({ color: 0xff3b3b }), false); thermo.add(lvl); thermo.userData.lvl = lvl; } scene.add(thermo);
// globo terráqueo con latitud
const globe = new THREE.Group(); { globe.add(M(new THREE.IcosahedronGeometry(.9, 2), lp(0x3d8de0), false)); for (let i = 0; i < 6; i++) { const l = M(new THREE.IcosahedronGeometry(.3 + rnd() * .2, 0), lp(0x5bbf4a), false); const a = rnd() * 6.28, b = (rnd() - .5) * 2.2; l.position.set(Math.cos(a) * Math.cos(b) * .8, Math.sin(b) * .8, Math.sin(a) * Math.cos(b) * .8); l.scale.set(1, .5, 1); globe.add(l); } const eq = M(new THREE.TorusGeometry(.93, .02, 6, 48), new THREE.MeshBasicMaterial({ color: 0xffffff }), false); eq.rotation.x = Math.PI / 2; globe.add(eq); const la = M(new THREE.TorusGeometry(.93 * Math.cos(.35), .025, 6, 48), new THREE.MeshBasicMaterial({ color: 0xffcc33 }), false); la.rotation.x = Math.PI / 2; la.position.y = .93 * Math.sin(.35); globe.add(la); } scene.add(globe);
const angArc = add(M(new THREE.TorusGeometry(1.1, .03, 6, 32, TH), new THREE.MeshBasicMaterial({ color: 0xffcc33 }), false));
// recibo de luz
const rcTex = canvasTex(360, 480); const RC_CV = rcTex.c; const receipt = new THREE.Sprite(new THREE.SpriteMaterial({ map: rcTex.tx, transparent: true, depthTest: false })); receipt.renderOrder = 11; receipt.scale.set(1.5, 2.0, 1); receipt.userData.base = receipt.scale.clone(); scene.add(receipt);
function drawReceipt(amount, stamp) { const x = rcTex.x; x.clearRect(0, 0, 360, 480); x.fillStyle = '#fbfbf6'; rrp(x, 0, 6, 6, 348, 468, 16); x.fill(); x.fillStyle = '#1b2440'; x.font = '900 34px M'; x.textAlign = 'center'; x.fillText('RECIBO DE LUZ', 180, 60); x.fillStyle = '#c8ccd6'; for (let i = 0; i < 5; i++) x.fillRect(40, 100 + i * 34, 200 + (i % 2) * 60, 12); x.fillStyle = '#1b2440'; x.font = '700 28px J'; x.fillText('TOTAL', 180, 310); x.font = '900 76px M'; x.fillStyle = stamp ? '#1aa86a' : '#d94a4a'; x.fillText('$' + Math.round(amount).toLocaleString('en-US'), 180, 385); if (stamp) { x.save(); x.translate(180, 440); x.rotate(-.12); x.strokeStyle = '#1aa86a'; x.lineWidth = 6; rrp(x, 0, -120, -28, 240, 52, 10); x.stroke(); x.font = '900 30px M'; x.fillStyle = '#1aa86a'; x.fillText('CASI EN CERO', 0, 12); x.restore(); } rcTex.tx.needsUpdate = true; }
// flujo de energía (partículas)
function Flow(points, color, n = 26) { const curve = new THREE.CatmullRomCurve3(points); const im = new THREE.InstancedMesh(new THREE.SphereGeometry(.06, 8, 6), new THREE.MeshBasicMaterial({ color }), n); im.frustumCulled = false; scene.add(im); const tube = M(new THREE.TubeGeometry(curve, 60, .022, 6), lp(0x222222), false); scene.add(tube); const o = new THREE.Object3D();
  return { curve, im, tube, upd(t, on, { speed = .35, ac = false, rev = false, block = 1, amp = 1 } = {}) { tube.visible = on > 0; for (let i = 0; i < n; i++) { let u = ((t * speed + i / n) % 1); if (rev) u = 1 - u; const vis = on > 0 && u < block; const p = curve.getPointAt(Math.min(.999, u)); if (ac) { const tg = curve.getTangentAt(Math.min(.999, u)); const side = new THREE.Vector3(0, 1, 0).cross(tg).normalize(); if (side.lengthSq() < .1) side.set(1, 0, 0); p.addScaledVector(side, Math.sin(u * 60 - t * 8) * .07 * amp); p.y += Math.cos(u * 60 - t * 8) * .05 * amp; } o.position.copy(p); o.scale.setScalar(vis ? on : .0001); o.updateMatrix(); im.setMatrixAt(i, o.matrix); } im.instanceMatrix.needsUpdate = true; } }; }
const H2W = (v) => { const p = v.clone(); roofF.localToWorld(p); return p; };
house.updateMatrixWorld(true);
const roofOut = H2W(V(1.45, .2, .62));
const fDirect = Flow([roofOut, V(1.5, 2.55, 1.0), V(1.45, 2.5, -1.6), V(.95, 2.1, -1.8), V(.86, .6, -1.3), V(.74, .38, -.6)], 0xffd23a);
const fPanel = Flow([roofOut, V(1.5, 2.55, 1.0), V(1.45, 2.5, -1.6), V(1.15, 2.42, -1.85), V(1.15, 2.0, -1.85), V(1.55, 1.85, -1.85)], 0xffd23a);
const fHouse = Flow([V(1.4, 1.55, -1.8), V(.95, 1.5, -1.6), V(.86, .6, -1.1), V(.74, .38, -.6)], 0x5ad1ff, 18);
const fBat = Flow([V(1.75, 1.08, -1.8), V(1.75, .9, -1.6), V(1.9, 1.2, -1.45)], 0x35d39a, 12);
const fGrid = Flow([V(2.1, 1.55, -1.8), V(2.6, 1.5, -1.0), V(2.8, 1.45, 2.1), V(2.95, 2.9, 2.3), V(5.2, 4.2, 1.8), V(7.2, 5.62, 1.2)], 0x5ad1ff, 30);
// cables explicativos directa / alterna
const fDC = Flow([V(-2.2, 4.6, 4.2), V(0, 4.6, 4.2), V(2.2, 4.6, 4.2)], 0xffd23a, 20), fAC = Flow(Array.from({ length: 41 }, (_, i) => V(-2.4 + i * .12, 3.15 + Math.sin(i * .62) * .28, 4.2)), 0x5ad1ff, 34);
fDC.tube.material = fAC.tube.material = lp(0x444a58);
const lblDC = arcLabel('DIRECTA'), lblAC = arcLabel('ALTERNA'); scene.add(lblDC, lblAC);
const LBL = { inv: arcLabel('INVERSOR'), bat: arcLabel('BATERÍAS'), ctrl: arcLabel('CONTROLADOR DE CARGA', { size: 52 }), diodo: arcLabel('DIODOS DE DERIVACIÓN', { size: 52 }), ang: arcLabel('ÁNGULO = LATITUD', { size: 84 }), med: arcLabel('MEDIDOR BIDIRECCIONAL', { size: 50 }), fus: arcLabel('FUSIBLES'), tierra: arcLabel('TIERRA FÍSICA'), calor: arcLabel('CALOR', { color: '#ff7a3a' }) };
Object.values(LBL).forEach(l => scene.add(l));
const xMark = (() => { const t = canvasTex(200, 200), x = t.x; x.strokeStyle = '#ff3b3b'; x.lineWidth = 34; x.lineCap = 'round'; x.beginPath(); x.moveTo(40, 40); x.lineTo(160, 160); x.moveTo(160, 40); x.lineTo(40, 160); x.stroke(); t.tx.needsUpdate = true; const s = new THREE.Sprite(new THREE.SpriteMaterial({ map: t.tx, transparent: true, depthTest: false })); s.renderOrder = 9; s.scale.set(.6, .6, 1); s.userData.base = s.scale.clone(); return s; })(); scene.add(xMark);
const sparks = []; for (let i = 0; i < 12; i++) { const s = M(new THREE.SphereGeometry(.03, 6, 4), new THREE.MeshBasicMaterial({ color: 0xffe066 }), false); scene.add(s); sparks.push(s); }
const full = arcLabel('100%', { color: '#35d39a', size: 70, arc: .1 }); scene.add(full);

// ---------- tiempos clave (palabras de la voz) ----------
const tw = (w, n = 1) => T(w, n);
const K = { conectas: tw('conectas'), nada: tw('nada'), tele: tw('tele'), directa: tw('directa'), alterna: tw('alterna'), inversor: tw('inversor'), prende: tw('prende', 2), noche: tw('noche'), oscuras: tw('oscuras'), baterias: tw('baterías'), dia: tw('día', 1), controlador: tw('controlador'), sobrecarguen: tw('sobrecarguen'), mediodia: tw('mediodía'), menos: tw('menos', 1), calor: tw('calor'), separas: tw('separas'), aire: tw('aire'), vecino: tw('vecino'), arbol: tw('árbol'), sombra: tw('sombra', 1), produccion: tw('producción'), diodos: tw('diodos'), mueves: tw('mueves'), angulo: tw('ángulo'), latitud: tw('latitud'), sobra2: tw('sobra', 2), medidor: tw('medidor'), red: tw('red'), descuenta: tw('descuenta'), fusibles: tw('fusibles'), tierra: tw('tierra'), felicidades: tw('felicidades'), recibo2: tw('recibo', 2), cero: tw('cero') };
// ---------- tomas de cámara ----------
const SHOTS = [
  [0, 3.83, [11, 10, 16], [7, 7.5, 12], [0, 2.4, 0], [0, 2.8, .5]],
  [3.83, 8.44, [-.7, 2.3, 9.0], [-.5, 2.0, 7.4], [-.9, 1.25, -.6], [-.6, 1.2, -.6]],
  [8.44, 12.82, [0, 3.9, 10.5], [0, 3.9, 9.2], [0, 3.9, 3.5], [0, 3.9, 3.5]],
  [12.82, 16.89, [2.4, 1.9, 2.9], [2.0, 1.75, 2.0], [1.6, 1.55, -1.8], [1.6, 1.55, -1.8]],
  [16.89, 18.09, [0, 2.3, 10.0], [0, 2.1, 8.6], [0, 1.4, -.5], [0, 1.4, -.5]],
  [18.09, 21.15, [8, 5, 14], [6, 4, 12], [0, 2, 0], [0, 2, 0]],
  [21.15, 24.81, [2.5, 1.55, 3.7], [2.1, 1.25, 2.7], [1.9, .8, -1.4], [1.9, .8, -1.4]],
  [24.81, 29.62, [2.0, 2.2, 4.2], [1.8, 2.1, 3.4], [1.4, 1.7, -1.8], [1.4, 1.75, -1.8]],
  [29.62, 38.26, [3.5, 8.6, 9.2], [2.4, 7.2, 7.6], [0, 3.4, 1.1], [0, 3.4, 1.1]],
  [38.26, 41.85, [7.2, 4.3, 5.6], [6.1, 4.0, 4.6], [0, 3.3, 1.2], [0, 3.3, 1.2]],
  [41.85, 47.95, [-1.8, 9.2, 10.5], [-1.4, 8.4, 8.8], [-1.7, 3.2, 1.2], [-1.7, 3.2, 1.2]],
  [47.95, K.mueves - .1, [-3.2, 5.6, 5.0], [-2.9, 5.3, 4.4], [-2.45, 2.95, 1.75], [-2.45, 2.95, 1.75]],
  [K.mueves - .1, 52.83, [0, 7.8, 8.5], [.5, 7.4, 7.8], [0, 3.4, 1.0], [0, 3.4, 1.0]],
  [52.83, 57.95, [9.2, 4.8, 4.8], [8.2, 4.7, 4.0], [0, 4.2, .6], [0, 4.2, .6]],
  [57.95, 61.33, [6.5, 5.2, 13.5], [5.2, 4.6, 11.2], [1, 1.8, 0], [1.2, 1.6, 0]],
  [61.33, 63.36, [3.6, 1.9, 5.4], [3.2, 1.7, 4.3], [2.85, 1.5, 2.2], [2.85, 1.5, 2.2]],
  [63.36, 66.81, [9.5, 3.9, 9.5], [8.3, 3.6, 7.8], [4.8, 3.0, 1.2], [5.2, 3.2, 1.2]],
  [66.81, K.tierra - .25, [2.5, 2.5, 2.1], [2.55, 2.3, 1.4], [2.65, 1.55, -1.95], [2.65, 1.55, -1.95]],
  [K.tierra - .25, 69.51, [5.6, .5, 14], [4.7, .2, 12.8], [3.6, -.6, 10], [3.6, -.7, 10]],
  [69.51, 77, [10, 7, 14], [-7, 8.5, 13], [0, 2.4, 0], [0, 2.6, 0]],
];
function camAt(t) { let s = SHOTS.find(s => t >= s[0] && t < s[1]) || SHOTS[SHOTS.length - 1]; const k = eio(clamp((t - s[0]) / (s[1] - s[0]))); const p = V(...s[2]).lerp(V(...s[3]), k), l = V(...s[4]).lerp(V(...s[5]), k); cam.position.copy(p); cam.fov = 50; cam.updateProjectionMatrix(); cam.lookAt(l); }
// ---------- día / noche ----------
function dayK(t) { if (t < K.noche) return 1; if (t < 21.15) return 1 - P(t, K.noche, 1.0); if (t < 23.1) return P(t, 21.15, .4); if (t < 24.81) return 1 - P(t, 23.1, .5); return P(t, 24.81, .4); }
const SKY_D = new THREE.Color(0x8fd0ff), SKY_N = new THREE.Color(0x0b1430), SKY_G = new THREE.Color(0xffb27a);
function powered(t) { if (t < K.prende) return false; const d = dayK(t); if (d > .5) return true; return t > 23.1 && t < 24.9; }
function animWorld(t) {
  const d = dayK(t), noon = P(t, K.mediodia - .3, .6) * (1 - P(t, K.separas + 1.2, 1.5)), gold = P(t, 69.5, 2.5);
  const sky = SKY_N.clone().lerp(SKY_D, d).lerp(SKY_G, gold * .55); scene.background = sky; scene.fog.color.copy(sky);
  hemi.intensity = .25 + 1.05 * d; sunL.intensity = 2.8 * d * (1 + .25 * noon); sunL.color.set(gold > .1 ? 0xffc890 : noon > .3 ? 0xffe2a8 : 0xfff4dc);
  const sp = noon > .01 ? V(lerp(-12, 2, noon), lerp(22, 32, noon), 6) : gold > 0 ? V(lerp(-12, -24, gold), lerp(22, 8, gold), 6) : V(-12 + (t % 60) * .05, 22, 6);
  sunL.position.copy(sp); sunL.target.position.set(0, 0, 0);
  sun.position.copy(sp).multiplyScalar(1.7).add(V(0, 0, -30)); sun.scale.setScalar(1 + noon * .6); sun.material.color.set(noon > .3 ? 0xffd27a : 0xfff1a0); sun.visible = d > .05;
  sunHalo.position.copy(sun.position); sunHalo.scale.setScalar(9 + noon * 8); sunHalo.material.opacity = d;
  moon.position.set(14, 26, -40); moon.visible = d < .9; stars.material.opacity = 1 - d;
  clouds.forEach(c => { c.position.x = -40 + ((c.position.z * 7 + t * c.userData.v * 3) % 90 + 90) % 90 - 5; });
  const on = powered(t);
  roomL.intensity = on ? (d < .5 ? 9 : 2.5) : 0; utilL.intensity = on ? (d < .5 ? 6 : 1.5) : (t > K.inversor && t < K.prende ? 1 : 0);
  lampShade.material.emissiveIntensity = on ? 1.6 : 0;
  // TV
  const x = tvTex.x; if (on) { const h = (t * 40) % 360; const gr = x.createLinearGradient(0, 0, 256, 150); gr.addColorStop(0, `hsl(${h},80%,60%)`); gr.addColorStop(1, `hsl(${(h + 120) % 360},80%,55%)`); x.fillStyle = gr; x.fillRect(0, 0, 256, 150); x.fillStyle = 'rgba(255,255,255,.85)'; x.beginPath(); x.arc(128 + Math.sin(t * 2) * 60, 75, 22, 0, 6.29); x.fill(); } else { x.fillStyle = '#0c0e14'; x.fillRect(0, 0, 256, 150); } tvTex.tx.needsUpdate = true;
  // inversor pantalla
  const ix = invTex.x; ix.fillStyle = '#0d1a14'; ix.fillRect(0, 0, 200, 120); if (t > K.inversor) { ix.strokeStyle = '#35d39a'; ix.lineWidth = 6; ix.beginPath(); for (let i = 0; i <= 200; i += 4) ix.lineTo(i, 60 + Math.sin(i / 14 - t * 6) * 30); ix.stroke(); } invTex.tx.needsUpdate = true;
  invG.scale.setScalar(Math.max(.001, eback(P(t, 12.9, .4))));
  bats.forEach((b, i) => { b.scale.setScalar(Math.max(.001, eback(P(t, K.baterias - .3 + i * .12, .4)))); const fill = t < 21.4 ? .15 : t < 23.1 ? lerp(.15, 1, P(t, 21.4, 1.6)) : t < 24.81 ? lerp(1, .55, P(t, 23.2, 1.5)) : t < K.sobrecarguen ? lerp(.55, 1, P(t, 25.2, 3)) : 1; b.userData.lv.scale.y = Math.max(.05, fill); b.userData.lv.position.y = -.4 + .4 * fill; b.userData.lv.material.color.set(fill > .95 ? 0x35d39a : fill > .4 ? 0xf6c445 : 0xff4d61); });
  ctrlG.scale.setScalar(Math.max(.001, eback(P(t, K.controlador - .3, .4)))); ctrlLed.material.color.set(Math.floor(t * 4) % 2 ? 0x35d39a : 0x0b3a26);
  fuses.forEach((f, i) => { f.scale.y = Math.max(.001, eback(P(t, K.fusibles + i * .12, .3))); });
  fuseG.visible = t > K.fusibles - .5;
  // medidor
  const mx = mTex.x; mx.fillStyle = '#10141c'; mx.fillRect(0, 0, 220, 110); mx.font = '700 46px J'; mx.textAlign = 'center'; mx.textBaseline = 'middle'; const back = t > K.red - .2; const val = 4821 + (back ? -Math.floor((t - K.red) * 37) : Math.floor(t * 3)); mx.fillStyle = back ? '#35d39a' : '#ffcc33'; mx.fillText(String(val).padStart(5, '0'), 110, 50); mx.font = '700 22px J'; mx.fillText(back ? '◀ A LA RED' : 'kWh', 110, 92); mTex.tx.needsUpdate = true;
  // paneles: caída inicial, calor, rieles, sombra, mudanza
  const lift = eio(P(t, K.separas, .8)), tilt = eio(P(t, K.latitud, .8)) * .14;
  panels.forEach((p, i) => { const u = p.userData; const drop = eback(P(t, .25 + i * .26, .4)); let pos = u.home.clone(); pos.y += (1 - clamp(drop)) * 6 + lift * .32; if (p === shadeP) { const mv = eio(P(t, K.mueves, 1.4)); pos.x = lerp(u.home.x, 1.45, mv); pos.y += Math.sin(mv * Math.PI) * .5; } p.position.copy(pos); p.rotation.x = -tilt; u.rack.visible = lift > .05; u.rack.scale.y = Math.max(.01, lift); u.rack.position.y = -.17 * lift; const heat = clamp(P(t, K.mediodia, 2.5) * (1 - P(t, K.aire - .2, 1.6))); u.cm.emissiveIntensity = heat * 1.1; });
  const shaded = P(t, K.sombra - .1, .3) * (1 - P(t, K.mueves + .6, .6)); shadowPatch.material.opacity = shaded; shadeP.userData.cm.color.setScalar(1 - .6 * P(t, K.produccion - .2, .4) * (1 - P(t, K.mueves + .6, .6)));
  diodeBox.children.slice(1).forEach((dd, i) => dd.material.color.set(t > K.diodos && Math.floor(t * 6 + i) % 2 ? 0x7dffb8 : 0x1a6b45));
  nTree.scale.setScalar(Math.max(.01, eback(P(t, K.arbol - .3, 1.1)) * 1.7)); nTree.visible = t > K.arbol - .4;
  heatW.forEach((h, i) => { const vis = t > K.mediodia + .5 && t < K.aire + .5; h.visible = vis; h.position.y = 3.6 + ((t * .8 + i * .3) % 1.2); h.material.opacity = .75 * (1 - ((t * .8 + i * .3) % 1.2) / 1.2); });
  airA.forEach((a, i) => { const vis = t > K.aire - .4 && t < 41.85; a.visible = vis; const u = ((t * .6 + i / airA.length) % 1); const p = H2W(V(-3.4 + u * 6.8, .22, (i % 2 ? .5 : -.5))); a.position.copy(p); });
  thermo.visible = t > K.calor - .4 && t < K.separas + 1.2; thermo.position.set(-4.0, 3.4, 2.4); const tl = lerp(.2, 1, P(t, K.calor - .3, 1.5)) * (1 - .6 * P(t, K.aire, 1.2)); thermo.userData.lvl.scale.y = tl; thermo.userData.lvl.position.y = tl / 2;
  // producción
  const prodShown = (t > K.mediodia - .2 && t < 41.85) || (t > K.vecino && t < 52.83);
  gauge.userData.show = prodShown; gauge.visible = false; if (prodShown) { let v = .92; v -= .38 * P(t, K.menos - .3, .6) * (1 - P(t, K.aire, 1)); if (t > K.vecino) v = .92 - .6 * P(t, K.produccion - .2, .5) * (1 - P(t, K.mueves + .6, .8)); gauge.userData.draw(v, v > .7 ? '#35d39a' : v > .45 ? '#f6c445' : '#ff4d61'); gauge.position.copy(t > K.vecino && t < 52.83 && t < K.mueves - .1 ? V(-1.4, 5.9, 2.2) : t > K.mueves - .1 ? V(0, 5.8, 1.8) : V(3.1, 5.6, 2.2)); }
  // globo y ángulo
  globe.visible = t > K.angulo - .3 && t < 57.95; globe.position.set(0, 7.4, -2.6); globe.rotation.y = t * .6; globe.scale.setScalar(Math.max(.001, eback(P(t, K.angulo - .3, .5))));
  angArc.visible = globe.visible; angArc.position.set(3.55, 2.62, 2.3); angArc.rotation.set(0, Math.PI / 2, 0); angArc.scale.setScalar(Math.max(.001, eout(P(t, K.angulo, .6))));
  // tierra física
  rod.position.y = lerp(1.6, -1.0, eout(P(t, K.tierra, .9))); rod.visible = t > K.tierra - .3; gWire.visible = t > K.tierra + .6;
  // recibo
  receipt.userData.show = (t > K.descuenta - .2 && t < 66.75) || t > K.recibo2 - .2; receipt.visible = false;
  if (receipt.userData.show) { const fin = t > 70; const amt = fin ? lerp(1850, 45, eout(P(t, K.cero - .1, .8))) : lerp(1850, 980, eout(P(t, K.descuenta, 1))); drawReceipt(amt, fin && t > K.cero + .4); const dir = new THREE.Vector3(); cam.getWorldDirection(dir); const right = dir.clone().cross(cam.up).normalize(); receipt.position.copy(cam.position).addScaledVector(dir, 4).addScaledVector(right, .55).add(V(0, -.55, 0)); const k = eback(P(t, fin ? K.recibo2 - .2 : K.descuenta - .2, .4)); receipt.userData.k = Math.max(.001, k); }
  // dueño de casa
  const fail = P(t, K.nada, .2), happy = t > K.prende && (on || t > 69);
  const remote = t > K.conectas && t < K.prende + .5;
  pose(owner, { ...SIT(.55), spineRx: .05, headRy: -.2, armR: remote ? [-1.4, -.1, -.4] : [-.5, -.15, -.9], armL: [-.5, .15, -.9], emo: happy ? 'happy' : !on && t > K.noche && t < 24.81 ? 'worried' : t > K.tele ? 'worried' : fail > .5 ? 'surprised' : 'neutral', look: [-.4, 0] }, t);
  // chispas y X en la tele fallida
  const fz = t > K.nada && t < K.tele + 1.2; xMark.visible = fz; if (fz) { xMark.position.set(.55, 1.35, -.6); xMark.scale.copy(xMark.userData.base).multiplyScalar(Math.max(.001, eback(P(t, K.nada, .3)))); }
  sparks.forEach((s, i) => { const ph = (t - K.nada) * 2.5 + i * .13; s.visible = t > K.nada && t < K.nada + .8; s.position.set(.66 - Math.abs(Math.sin(i * 3)) * ph * .4, .4 + Math.sin(i * 1.7) * ph * .4 + ph * .3, -.6 + Math.cos(i * 2.3) * ph * .4); });
  // flujos de energía
  const day = d > .5;
  fDirect.upd(t, t > K.conectas && t < K.directa ? 1 : 0, { speed: .45, block: t < K.nada ? P(t, K.conectas, 1.8) : 1 });
  fPanel.upd(t, t > K.inversor && day ? 1 : 0, { speed: .4 });
  fHouse.upd(t, on && t > K.inversor + .5 ? 1 : 0, { speed: .5, ac: true });
  fBat.upd(t, t > K.baterias + .3 ? 1 : 0, { speed: .45, rev: !day, block: t > K.sobrecarguen && t < 29.62 ? .55 : 1 });
  fGrid.upd(t, t > K.red - .3 && t < 66.81 ? 1 : 0, { speed: .35, ac: true });
  const dcOn = t > K.directa - .3 && t < 12.82 ? 1 : 0; fDC.upd(t, dcOn, { speed: .35 }); fAC.upd(t, t > K.alterna - .3 && t < 12.82 ? 1 : 0, { speed: .22 });
  // etiquetas amarillas
  OVL.length = 0; const L = (s, at, end, pos, color) => { s.visible = false; if (t >= at && t < end) OVL.push({ text: s.userData.text, at, end, pos: pos.clone(), color: color || s.userData.color }); };
  L(lblDC, K.directa - .2, 12.82, V(0, 5.25, 4.2)); L(lblAC, K.alterna - .2, 12.82, V(0, 3.8, 4.2));
  L(LBL.inv, K.inversor, 16.89, V(1.75, 2.35, -1.55)); L(LBL.bat, K.baterias, 24.81, V(1.9, 1.6, -1.0)); L(LBL.ctrl, K.controlador, 29.62, V(1.25, 2.75, -1.5));
  L(LBL.calor, K.calor, 38.26, V(0, 6.0, 1.4)); L(LBL.diodo, K.diodos, K.mueves - .1, H2W(V(-2.45, .9, .62))); L(LBL.ang, K.angulo, 57.95, V(3.2, 5.6, 2.2));
  L(LBL.med, K.medidor, 63.36, V(2.85, 2.25, 2.25)); L(LBL.fus, K.fusibles, K.tierra - .25, V(2.65, 2.1, -1.7)); L(LBL.tierra, K.tierra, 69.51, V(3.6, .75, 10.1));
  L(full, 25.8, 29.62, V(1.9, 1.35, -1.0), '#35d39a');
}
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
// ---------- subtítulos de una palabra (estilo referencia) ----------
const KEYW = new Set(['directa', 'alterna', 'inversor', 'baterías', 'controlador', 'carga', 'calor', 'diodos', 'derivación', 'ángulo', 'latitud', 'medidor', 'bidireccional', 'fusibles', 'tierra', 'física', 'felicidades', 'cero']);
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
  camAt(t); animWorld(t); if (window.PCAM) { cam.position.set(...window.PCAM[0]); cam.fov = window.PCAM[2]; cam.updateProjectionMatrix(); cam.lookAt(...window.PCAM[1]); }
  composer.render(); g.drawImage(glc, 0, 0);
  const vg = g.createRadialGradient(540, 960, 650, 540, 960, 1300); vg.addColorStop(0, 'rgba(0,0,0,0)'); vg.addColorStop(1, 'rgba(0,0,0,.28)'); g.fillStyle = vg; g.fillRect(0, 0, W, H);
  if (window.PROFILE) { if (window.PTEXT) { g.save(); const gr = g.createLinearGradient(0, 0, 0, 330); gr.addColorStop(0, 'rgba(10,30,70,.35)'); gr.addColorStop(1, 'rgba(10,30,70,0)'); g.fillStyle = gr; g.fillRect(0, 0, W, 330); g.restore(); drawArcText('ASÍ FUNCIONA', 540, 225, 96, '#ffcc33', 1); } return; }
  overlayLabels(t);
  if (gauge.userData.show) { g.save(); g.globalAlpha = 1; g.drawImage(GAUGE_CV, 540 - 260, 1500, 520, 149); g.restore(); }
  if (receipt.userData.show) { const k = receipt.userData.k || 1; g.save(); g.translate(770, 1400); g.scale(k * 1.22, k * 1.22); g.shadowColor = 'rgba(0,0,0,.35)'; g.shadowBlur = 24; g.drawImage(RC_CV, -180, -240, 360, 480); g.restore(); }
  caption(t);
  const fo = P(t, END - .4, .4); if (fo > 0) { g.fillStyle = `rgba(0,0,0,${fo})`; g.fillRect(0, 0, W, H); }
}
window.renderAt = renderAt; window.END = END;
window.frameJPG = (t, q = .92) => { renderAt(t); return out.toDataURL('image/jpeg', q).split(',')[1]; };
window.READY = true;
