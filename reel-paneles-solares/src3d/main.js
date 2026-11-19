// Reel 9:16 3D (Estilo B: construcción en corte) — Paneles solares
import * as THREE from 'three';
import { EffectComposer } from 'three/addons/postprocessing/EffectComposer.js';
import { RenderPass } from 'three/addons/postprocessing/RenderPass.js';
import { UnrealBloomPass } from 'three/addons/postprocessing/UnrealBloomPass.js';
import { OutputPass } from 'three/addons/postprocessing/OutputPass.js';

const W = 1600, H = 900, END = 594.9;   // END = última palabra + 3,7 s (cierre)
const CTA_ST = END - 3.7;               // inicio del cierre SÍGUEME/SUSCRÍBETE
const BRAND = 'Así funciona con Rai';
// Cierre: ?cta=yt → versión YouTube (¡SUSCRÍBETE!); por defecto Instagram/Facebook/TikTok (¡SÍGUEME!)
const YT = new URLSearchParams(location.search).get('cta') === 'yt';
const CTA = YT ? { big: '¡SUSCRÍBETE!', btn: 'SUSCRIBIRSE', col: '#ff2d3d', bw: 560 } : { big: '¡SÍGUEME!', btn: '+ SEGUIR', col: '#3d7bff', bw: 420 };
const MASCOT = new Image(); MASCOT.src = 'mascota.png'; await new Promise(r => { MASCOT.onload = r; MASCOT.onerror = r; });
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

// ---------- renderer (estilo B: low-poly de día) ----------
const glc = document.getElementById('gl'), out = document.getElementById('out'), g = out.getContext('2d');
const renderer = new THREE.WebGLRenderer({ canvas: glc, antialias: true, preserveDrawingBuffer: true });
renderer.setPixelRatio(1); renderer.setSize(W, H, false);
renderer.shadowMap.enabled = true; renderer.shadowMap.type = THREE.PCFSoftShadowMap;
renderer.toneMapping = THREE.ACESFilmicToneMapping; renderer.toneMappingExposure = 1.0;
const scene = new THREE.Scene(); scene.fog = new THREE.Fog(0xbfe3ff, 30, 80);
const cam = new THREE.PerspectiveCamera(50, W / H, .05, 200);
const rt = new THREE.WebGLRenderTarget(W, H, { samples: 2, type: THREE.HalfFloatType });
const composer = new EffectComposer(renderer, rt);
composer.addPass(new RenderPass(scene, cam));
const bloom = new UnrealBloomPass(new THREE.Vector2(W / 2, H / 2), .35, .4, .92); composer.addPass(bloom);
composer.addPass(new OutputPass());
const hemi = new THREE.HemisphereLight(0xcfe8ff, 0x6b8a4a, 1.3); scene.add(hemi);
const sunL = new THREE.DirectionalLight(0xfff4dc, 2.6); sunL.castShadow = true; sunL.shadow.mapSize.set(1024, 1024); sunL.shadow.bias = -.0005; sunL.shadow.normalBias = .02;
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
// ---------- mundo base: terreno, vecindario, casa de un piso en corte ----------
const GZ = 1.98;
add(M(new THREE.BoxGeometry(50.1, .25, 24.1), lp(0x5fae4a))).position.set(0, -.1, GZ - 12);
const soilM = new THREE.MeshStandardMaterial({ color: 0x8a5a34, roughness: .9, flatShading: true });
{ const b = add(M(new THREE.BoxGeometry(50, 3.4, 24), soilM)); b.position.set(0, -1.92, GZ - 12); const r = add(M(new THREE.BoxGeometry(50, 3, 24), lp(0x6c717c))); r.position.set(0, -5.1, GZ - 12); }
for (let i = 0; i < 30; i++) { const r = add(M(new THREE.DodecahedronGeometry(.08 + rnd() * .15, 0), lp(0x6a5a4a))); const x = (rnd() - .5) * 24; r.position.set(Math.abs(Math.abs(x) - 3.3) < .7 ? x + 1.6 : x, -1.3 - rnd() * 2.2, GZ + .02); }
for (let i = -12; i <= 12; i++) { const p = add(M(new THREE.BoxGeometry(.16, 1, .16), lp(0xdcdcd6))); p.position.set(i * 1.6, .5, -7); }
function bgHouse(x, z, c, two) { const h = new THREE.Group(); const hh = two ? 5.2 : 2.6; const b = M(new THREE.BoxGeometry(4, hh, 3.4), lp(c)); b.position.y = hh / 2; h.add(b); const rf = M(new THREE.BoxGeometry(4.2, .25, 3.6), lp(0x9a9ea6)); rf.position.y = hh + .1; h.add(rf); for (const wx of [-1, 1]) for (let f = 0; f < (two ? 2 : 1); f++) { const w = M(new THREE.BoxGeometry(.7, .7, .05), lp(0x9fd3e6)); w.position.set(wx, 1.6 + f * 2.6, 1.72); h.add(w); } h.position.set(x, 0, z); scene.add(h); }
bgHouse(-10, -11, 0xe9d7b5, 1); bgHouse(9, -12, 0xf3e2c4); bgHouse(14, -7, 0xe0cdb0, 1); bgHouse(-15, -6, 0xf0dcc0);
for (let i = 0; i < 6; i++) { const tr = new THREE.Group(); const tk = M(new THREE.CylinderGeometry(.12, .16, 1.2, 6), lp(0x7a5230)); tk.position.y = .6; const cr = M(new THREE.IcosahedronGeometry(.9, 0), lp(0x4f9a3e)); cr.position.y = 1.7; tr.add(tk, cr); tr.position.set([-7, -5.5, 10.5, 7.5, -12, 12][i], 0, [-4, -9, -4.5, -9, -3, -3][i]); scene.add(tr); }
const W1 = lp(0xf2e3c8), W2 = lp(0xfff4e0), footM = lp(0x9a9c9f);
const HS = add(new THREE.Group()); const hadd = o => { HS.add(o); return o; };
for (const x of [-3.3, 3.3]) { hadd(M(new THREE.BoxGeometry(.75, .25, 3.96), footM)).position.set(x, -.85, .02); hadd(M(new THREE.BoxGeometry(.25, .9, 3.96), footM)).position.set(x, -.3, .02); }
const floorM = lp(0xc8a27a); hadd(M(new THREE.BoxGeometry(6.6, .15, 3.8), floorM)).position.set(0, .07, 0);
const backWall = hadd(M(new THREE.BoxGeometry(6.6, 2.55, .16), W2)); backWall.position.set(0, 1.465, -1.9);
const sideWalls = [-3.3, 3.3].map(x => { const w = hadd(M(new THREE.BoxGeometry(.16, 2.55, 3.96), W1)); w.position.set(x, 1.465, .02); return w; });
const slab = hadd(M(new THREE.BoxGeometry(6.9, .3, 4.1), lp(0x8f939b))); slab.position.set(0, 2.88, 0);
// muro del fondo con textura dinámica
const WT = canvasTex(1024, 406); const PXM = 406 / 2.55; const py = hm => 406 - hm * PXM; const pxx = xm => (xm + 3.22) * PXM;
const wallFace = hadd(M(new THREE.PlaneGeometry(6.44, 2.55), new THREE.MeshStandardMaterial({ map: WT.tx, roughness: .85 }), false)); wallFace.position.set(0, 1.425, -1.815);
// personajes
const owner = makeChar({ shirt: 0xff8a3d, pants: 0x2b3350 }); scene.add(owner.root);
const eng = makeChar({ shirt: 0x3d6bff, pants: 0x262c45, skin: 0xc68a62, hair: 0x1a1210, clipboard: true }); scene.add(eng.root);
{ const hm = mat(0xffcc33, { roughness: .35 }); const dome = mesh(new THREE.SphereGeometry(.34, 24, 12, 0, Math.PI * 2, 0, Math.PI / 2), hm); dome.position.y = .08; const brim = mesh(new THREE.CylinderGeometry(.42, .42, .03, 24), hm); brim.position.y = .09; eng.head.add(dome, brim); }
const engCB = eng.el[1].children[eng.el[1].children.length - 1];
const wrench = new THREE.Group(); { const h = M(new THREE.BoxGeometry(.05, .3, .03), lp(0xb9c0d0, { metalness: .5 })); h.position.y = -.15; const hd = M(new THREE.TorusGeometry(.06, .02, 6, 12, 4.5), lp(0xb9c0d0, { metalness: .5 })); hd.position.y = -.32; wrench.add(h, hd); } eng.el[0].add(wrench); wrench.position.y = -.42;
const fillL = new THREE.PointLight(0xfff4e0, 3.4, 10, 1.2); fillL.position.set(0, 2.2, 1.6); scene.add(fillL);
const ceilL = new THREE.PointLight(0xfff1d8, 5, 8, 1.2); ceilL.position.set(0, 2.35, 0); scene.add(ceilL);
// partículas
function parts(n, c, r = .05, geo) { const m = new THREE.InstancedMesh(geo || new THREE.SphereGeometry(r, 6, 4), c.isMaterial ? c : new THREE.MeshBasicMaterial({ color: c }), n); m.frustumCulled = false; scene.add(m); return m; }
const tmp = new THREE.Object3D();
function setP(m, i, x, y, z, vis, s = 1, rot = 0) { tmp.position.set(x, y, z); tmp.rotation.set(rot, rot * .7, 0); tmp.scale.setScalar(vis ? s : .001); tmp.updateMatrix(); m.setMatrixAt(i, tmp.matrix); }
const PS = i => PH[i].s;
const inn = (t, a, b) => t >= a && t < b;
let SHOTS = [], SHAKE = null;
function camAt(t) {
  const s = SHOTS.find(s => t >= s[0] && t < s[1]) || SHOTS[SHOTS.length - 1]; const k = eio(clamp((t - s[0]) / (Math.min(s[1], END) - s[0])));
  cam.position.copy(V(...s[2]).lerp(V(...s[3]), k)); cam.fov = 34; cam.updateProjectionMatrix(); cam.lookAt(V(...s[4]).lerp(V(...s[5]), k));
  if (SHAKE && inn(t, SHAKE[0], SHAKE[1])) { const a = .06 * (1 - P(t, SHAKE[1] - .4, .4)); cam.position.x += Math.sin(t * 55) * a; cam.position.y += Math.sin(t * 47) * a * .7; }
}
function skyDay(t, gray = false) {
  const sky = new THREE.Color(gray ? 0x9aaabb : 0x8fd0ff); scene.background = sky; scene.fog.color.copy(sky);
  hemi.intensity = 1.3; sunL.intensity = 2.8; sunL.position.set(5, 20, 9); sunL.target.position.set(0, 0, 0);
  sun.visible = !gray; sun.position.set(7, 15, -22); sunHalo.position.copy(sun.position); sunHalo.scale.setScalar(9); sunHalo.material.opacity = .9; moon.visible = false; stars.visible = false;
  clouds.forEach(c => { c.position.x = ((c.position.x + 40 + c.userData.v * .02) % 80) - 40; });
}
function card(t, a, b, x0, y0, title, col, body) { // tarjeta 2D genérica
  if (!inn(t, a, b)) return; const k = eback(P(t, a, .4)) * (1 - P(t, b - .25, .25)); g.save(); g.translate(x0, y0); g.scale(k, k); g.rotate(-.03);
  g.fillStyle = 'rgba(0,0,0,.35)'; rrp(g, 0, -190, -150, 400, 320, 26); g.fill(); g.fillStyle = '#fffdf6'; rrp(g, 0, -200, -160, 400, 320, 26); g.fill();
  g.fillStyle = col; rrp(g, 0, -200, -160, 400, 86, 26); g.fill(); g.fillRect(-200, -100, 400, 26);
  g.textAlign = 'center'; g.textBaseline = 'middle'; g.font = '900 40px M'; g.fillStyle = '#ffffff'; g.fillText(title, 0, -116); body(g); g.restore();
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
    let size = 60; g.font = `italic 900 ${size}px M`; let w = g.measureText(o.text).width + o.text.length; if (w > 900) { size = Math.floor(size * 900 / w); w = 900; }
    let x = (v.x * .5 + .5) * W, y = (-v.y * .5 + .5) * H; x = clamp(x, w / 2 + 40, Math.max(w / 2 + 40, 930 - w / 2)); y = clamp(y, 150, 660);
    const k = Math.max(.001, eback(P(t, o.at, .3))) * (1 - P(t, o.end - .15, .15));
    drawArcText(o.text, x, y, size, o.color, k);
  }
}
// ================= PANELES SOLARES PASO A PASO (video largo 16:9) =================
const S = i => PS(i);
const SEC = { hook: 0, verdad: S(14), como: S(22), p1: S(39), p2: S(56), p3: S(65), p4: S(76), red: S(80), cero: S(90), hib: S(96), subs: S(104), p5: S(110), p6: S(118), p7: S(131), regla: S(140), p8: S(149), p9: S(163), p10: S(174), err: S(185), res: S(195), inst: S(205), cta: S(208) };
// pared del fondo
(function () { const x = WT.x; x.fillStyle = '#f3e6cf'; x.fillRect(0, 0, 1024, 406); x.fillStyle = '#9fd6f2'; x.fillRect(pxx(-.6), py(2.1), 170, 110); x.strokeStyle = '#fff'; x.lineWidth = 10; x.strokeRect(pxx(-.6), py(2.1), 170, 110); WT.tx.needsUpdate = true; })();
// ---- interior: nevera, TV, aire, bombillo ----
const TVS = canvasTex(256, 144);
const tv = add(new THREE.Group()); tv.position.set(-1.0, 1.35, -1.78); { const b = rbox(1.2, .7, .07, .02, lp(0x16181f)); const s = M(new THREE.PlaneGeometry(1.1, .6), new THREE.MeshStandardMaterial({ map: TVS.tx, emissive: 0xffffff, emissiveMap: TVS.tx, emissiveIntensity: 1 }), false); s.position.z = .04; tv.add(b, s); }
const fridge = add(rbox(.75, 1.7, .7, .06, lp(0xf4f6fa))); fridge.position.set(-2.55, 1.0, -1.35);
const gasketM = new THREE.MeshBasicMaterial({ color: 0xff4d61, transparent: true, opacity: 0 }); const gasket = M(new THREE.BoxGeometry(.78, 1.66, .02), gasketM, false); gasket.position.set(-2.55, 1.0, -.99); scene.add(gasket);
const acS = canvasTex(128, 48); const ac = add(new THREE.Group()); ac.position.set(.9, 2.3, -1.72); { const b = rbox(1.1, .32, .22, .06, lp(0xf7f8fb)); const d = M(new THREE.PlaneGeometry(.3, .11), new THREE.MeshStandardMaterial({ map: acS.tx, emissive: 0xffffff, emissiveMap: acS.tx, emissiveIntensity: 1 }), false); d.position.set(.3, .02, .115); ac.add(b, d); }
const bulbM = new THREE.MeshStandardMaterial({ color: 0xfff1c0, emissive: 0xffc46a, emissiveIntensity: 2 }); const bulb = add(M(new THREE.SphereGeometry(.12, 16, 12), bulbM, false)); bulb.position.set(-.2, 2.55, -.2);
const plugO = add(rbox(.1, .14, .06, .02, lp(0xffffff))); plugO.position.set(-1.0, .5, -1.75);
// inversor y baterías (pared del fondo, adentro)
const INVS = canvasTex(128, 160);
const inv = add(new THREE.Group()); inv.position.set(2.35, 1.55, -1.72); { const b = rbox(.55, .7, .2, .04, lp(0xe9edf3)); const d = M(new THREE.PlaneGeometry(.4, .5), new THREE.MeshStandardMaterial({ map: INVS.tx, emissive: 0xffffff, emissiveMap: INVS.tx, emissiveIntensity: .8 }), false); d.position.z = .105; inv.add(b, d); }
const batG = add(new THREE.Group()); batG.position.set(2.35, .15, -1.6); const batFillM = new THREE.MeshStandardMaterial({ color: 0x35d39a, emissive: 0x35d39a, emissiveIntensity: .8 });
for (let i = 0; i < 2; i++) { const b = rbox(.5, .42, .32, .04, lp(0x2c3245)); b.position.set(0, .22 + i * .45, 0); batG.add(b); const f = M(new THREE.BoxGeometry(.06, .3, .02), batFillM, false); f.position.set(.16, .22 + i * .45, .17); batG.add(f); }
// paneles en el techo (2 filas x 6)
const PT = canvasTex(128, 96); { const x = PT.x; x.fillStyle = '#16284f'; x.fillRect(0, 0, 128, 96); x.strokeStyle = '#7f9cd6'; x.lineWidth = 2; for (let i = 0; i <= 6; i++) { x.beginPath(); x.moveTo(i * 21.3, 0); x.lineTo(i * 21.3, 96); x.stroke(); } for (let j = 0; j <= 4; j++) { x.beginPath(); x.moveTo(0, j * 24); x.lineTo(128, j * 24); x.stroke(); } x.strokeStyle = '#d7dde8'; x.lineWidth = 6; x.strokeRect(0, 0, 128, 96); PT.tx.needsUpdate = true; }
const panM = new THREE.MeshStandardMaterial({ map: PT.tx, roughness: .25, metalness: .3, emissive: 0x6cc4ff, emissiveIntensity: 0 });
const panels = []; for (let r = 0; r < 2; r++) for (let c = 0; c < 6; c++) { const g0 = new THREE.Group(); g0.position.set(-2.75 + c * 1.1, 3.18, -.95 + r * 1.35); const p = M(new THREE.BoxGeometry(1.0, .04, 1.15), panM); p.rotation.x = .2; const leg = M(new THREE.BoxGeometry(.04, .25, .04), lp(0xb9c0d0)); leg.position.set(0, -.08, -.45); g0.add(p, leg); scene.add(g0); panels.push(g0); }
const shadeM = new THREE.MeshBasicMaterial({ color: 0x000000, transparent: true, opacity: 0, depthWrite: false }); const shade = M(new THREE.PlaneGeometry(2.4, 2.8), shadeM, false); shade.rotation.x = -Math.PI / 2 + .2; shade.position.set(-1.9, 3.25, -.3); scene.add(shade);
const roofCoatM = new THREE.MeshStandardMaterial({ color: 0xd9534a, roughness: .7, transparent: true, opacity: 0 }); const roofCoat = M(new THREE.BoxGeometry(6.92, .02, 4.12), roofCoatM, false); roofCoat.position.set(0, 3.04, 0); scene.add(roofCoat);
// cable del techo al inversor
const roofCable = new THREE.CatmullRomCurve3([V(2.9, 3.1, -.9), V(3.05, 3.05, -1.75), V(2.6, 2.6, -1.78), V(2.4, 1.92, -1.75)]);
add(M(new THREE.TubeGeometry(roofCable, 30, .025, 6), lp(0x222222), false));
// contador bidireccional y poste
const MT = canvasTex(256, 384);
const meter = add(new THREE.Group()); meter.position.set(4.35, 0, 1.0); { const post = M(new THREE.BoxGeometry(.18, 1.7, .18), lp(0x9a9c9f)); post.position.y = .85; const box = rbox(.62, .86, .3, .05, mat(0xc9ced8, { metalness: .3, roughness: .5 })); box.position.set(0, 1.35, .14); const face = M(new THREE.PlaneGeometry(.5, .75), new THREE.MeshStandardMaterial({ map: MT.tx, emissive: 0xffffff, emissiveMap: MT.tx, emissiveIntensity: .55 }), false); face.position.set(0, 1.35, .3); meter.add(post, box, face); }
const pole = add(M(new THREE.CylinderGeometry(.09, .12, 5.2, 8), lp(0x8a6a48))); pole.position.set(6.3, 2.6, -1.6);
add(M(new THREE.BoxGeometry(1.2, .08, .08), lp(0x8a6a48))).position.set(6.3, 5.0, -1.6);
const gridLine = new THREE.CatmullRomCurve3([V(5.8, 5.0, -1.6), V(5.0, 3.6, -.3), V(4.35, 2.3, .9), V(4.35, 1.8, 1.0)]);
const houseLine = new THREE.CatmullRomCurve3([V(4.35, 1.6, .95), V(3.9, 2.0, .6), V(3.4, 2.5, .2)]);
const wireM = new THREE.MeshStandardMaterial({ color: 0x1d1f25, emissive: 0x6cc4ff, emissiveIntensity: 0 });
add(M(new THREE.TubeGeometry(gridLine, 40, .02, 6), wireM, false)); add(M(new THREE.TubeGeometry(houseLine, 30, .02, 6), wireM, false));
add(M(new THREE.TubeGeometry(new THREE.CatmullRomCurve3([V(6.8, 5.0, -1.6), V(10, 4.6, -2.2), V(14, 5, -2.8)]), 30, .02, 6), wireM, false));
// casa del vecino con paneles
const nh = add(new THREE.Group()); nh.position.set(9.4, 0, -.9); { const b = M(new THREE.BoxGeometry(2.8, 2.4, 2.6), lp(0xe7c9a0)); b.position.y = 1.2; const rf = M(new THREE.BoxGeometry(3.0, .2, 2.8), lp(0x9a9ea6)); rf.position.y = 2.5; nh.add(b, rf); for (let i = 0; i < 4; i++) { const p = M(new THREE.BoxGeometry(.6, .04, .9), panM); p.position.set(-.95 + i * .63, 2.7, .1); p.rotation.x = .2; nh.add(p); } }
const nWinM = new THREE.MeshStandardMaterial({ color: 0x9fd3e6, emissive: 0xffd27a, emissiveIntensity: 0 }); const nWin = M(new THREE.BoxGeometry(.7, .6, .05), nWinM, false); nWin.position.set(9.4, 1.3, .42); scene.add(nWin);
// oficina de la distribuidora
const OFS = canvasTex(512, 96); { const x = OFS.x; x.fillStyle = '#3d6bff'; x.fillRect(0, 0, 512, 96); x.fillStyle = '#fff'; x.font = '900 52px M'; x.textAlign = 'center'; x.textBaseline = 'middle'; x.fillText('DISTRIBUIDORA', 256, 50); OFS.tx.needsUpdate = true; }
const office = add(new THREE.Group()); office.position.set(-9.6, 0, -1.2); { const b = M(new THREE.BoxGeometry(3.6, 3.0, 2.6), lp(0xdfe6f0)); b.position.y = 1.5; const s = M(new THREE.PlaneGeometry(3.0, .56), new THREE.MeshBasicMaterial({ map: OFS.tx }), false); s.position.set(0, 2.55, 1.31); const d = M(new THREE.BoxGeometry(.8, 1.5, .05), lp(0x6a7180)); d.position.set(0, .75, 1.31); office.add(b, s, d); for (const wx of [-1.2, 1.2]) { const w = M(new THREE.BoxGeometry(.7, .6, .05), lp(0x9fd3e6)); w.position.set(wx, 1.5, 1.31); office.add(w); } }
// árbol que da sombra (paso 5) y tinaco
const bigTree = add(new THREE.Group()); { const tk = M(new THREE.CylinderGeometry(.18, .25, 2.6, 6), lp(0x7a5230)); tk.position.y = 1.3; const cr = M(new THREE.IcosahedronGeometry(1.6, 0), lp(0x4f9a3e)); cr.position.y = 3.6; bigTree.add(tk, cr); } bigTree.position.set(-4.6, 0, -1.4);
const tinaco = add(M(new THREE.CylinderGeometry(.45, .45, .9, 16), lp(0x2a2c33))); tinaco.position.set(-2.9, 3.5, -1.55);
// papeles (permisos) y gotas
const paperM = new THREE.MeshStandardMaterial({ color: 0xffffff, roughness: .6 }); const papers = parts(6, paperM, 1, new THREE.BoxGeometry(.28, .02, .36));
const drips = parts(8, 0x6cc4ff, .04);
// partículas de energía
const BATC = new THREE.CatmullRomCurve3([V(2.35, 1.2, -1.6), V(2.35, .6, -1.5)]);
const sunP = parts(24, 0xffe27a, .05), dcP = parts(14, 0xffcc33, .045), acP = parts(18, 0x6cc4ff, .045), gridP = parts(16, 0x7be36b, .05), batP = parts(8, 0x35d39a, .045);
const toFr = new THREE.CatmullRomCurve3([V(2.1, 1.5, -1.6), V(.5, 1.2, -1.4), V(-1.0, 1.3, -1.6), V(-2.2, 1.2, -1.2)]);
const toAC = new THREE.CatmullRomCurve3([V(2.1, 1.7, -1.6), V(1.6, 2.2, -1.6), V(1.2, 2.3, -1.6)]);
const toMeter = new THREE.CatmullRomCurve3([V(2.6, 1.5, -1.6), V(3.3, 2.5, .2), V(3.9, 2.0, .6), V(4.35, 1.6, .95)]);
// ---- textos de pantallas ----
function drawTV(on) { const x = TVS.x; if (!on) { x.fillStyle = '#050608'; x.fillRect(0, 0, 256, 144); } else { const gr = x.createLinearGradient(0, 0, 256, 144); gr.addColorStop(0, '#3d8bff'); gr.addColorStop(1, '#a98bff'); x.fillStyle = gr; x.fillRect(0, 0, 256, 144); x.fillStyle = '#ffcc33'; x.beginPath(); x.arc(170, 60, 26, 0, 6.29); x.fill(); x.fillStyle = '#35d39a'; x.fillRect(0, 105, 256, 39); } TVS.tx.needsUpdate = true; }
function drawAC(temp, on) { const x = acS.x; x.fillStyle = '#0d1730'; x.fillRect(0, 0, 128, 48); if (on) { x.fillStyle = temp < 20 ? '#6cc4ff' : '#35d39a'; x.font = '700 34px J'; x.textAlign = 'center'; x.textBaseline = 'middle'; x.fillText(temp + '°', 64, 26); } acS.tx.needsUpdate = true; }
function drawInv(mode) { const x = INVS.x; x.fillStyle = '#0d1730'; x.fillRect(0, 0, 128, 160); x.textAlign = 'center'; x.textBaseline = 'middle'; x.font = '900 20px M';
  if (mode === 'off') { x.fillStyle = '#ff4d61'; x.fillText('APAGADO', 64, 80); } else { x.fillStyle = '#ffcc33'; x.fillText('DC', 32, 40); x.fillStyle = '#fff'; x.fillText('→', 64, 40); x.fillStyle = '#6cc4ff'; x.fillText('AC', 96, 40); x.strokeStyle = '#6cc4ff'; x.lineWidth = 4; x.beginPath(); for (let i = 0; i <= 100; i++) { const xx = 14 + i, yy = 100 + Math.sin(i / 8 + mode * 3) * 20; i ? x.lineTo(xx, yy) : x.moveTo(xx, yy); } x.stroke(); }
  INVS.tx.needsUpdate = true; }
let meterRead = 4580;
function drawMeter(t, dir) { const x = MT.x; x.fillStyle = '#e9edf3'; x.fillRect(0, 0, 256, 384); x.fillStyle = '#1b1e27'; rrp(x, 0, 18, 40, 220, 96, 10); x.fill(); const r = String(Math.floor(meterRead)).padStart(5, '0'); x.font = '700 64px J'; x.textAlign = 'center'; x.textBaseline = 'middle'; for (let i = 0; i < 5; i++) { x.fillStyle = '#fff'; x.fillText(r[i], 46 + i * 41, 90); } x.fillStyle = '#1b1e27'; x.font = '900 30px M'; x.fillText('kWh', 128, 165);
  x.font = '900 46px M'; x.fillStyle = dir > 0 ? '#ff8a3d' : dir < 0 ? '#35d39a' : '#9aa1ad'; x.fillText(dir > 0 ? '→ CASA' : dir < 0 ? '← RED' : '⇄', 128, 245); x.font = '800 24px M'; x.fillStyle = '#5a6070'; x.fillText('BIDIRECCIONAL', 128, 330); MT.tx.needsUpdate = true; }
// ---- cielo de noche ----
function skyNight() { const c = new THREE.Color(0x101a3a); scene.background = c; scene.fog.color.copy(c); hemi.intensity = .45; sunL.intensity = .35; sun.visible = false; sunHalo.material.opacity = 0; moon.visible = true; moon.position.set(-8, 14, -22); stars.visible = true; }
// ---- cámara ----
const WIDE = [[1.8, 4.6, 13.5], [2.6, 4.2, 12.4], [1.2, 1.7, 0], [1.6, 1.7, 0]];
const sh = (a, b, c0, c1, l0, l1) => [a, b, c0, c1, l0, l1];
SHOTS = [
  sh(0, S(2), [-1.5, 5.2, 11.5], [0.2, 5.6, 10.0], [1.2, 2.6, 0], [1.4, 2.8, 0]),
  sh(S(2), S(3), [2.8, 3.0, 10.5], [3.4, 2.8, 9.4], [2.4, 1.6, 0], [2.6, 1.6, 0]),
  sh(S(3), S(6), [5.5, 4.4, 13.0], [4.6, 4.8, 12.0], [5.0, 1.8, -.5], [3.8, 2.0, -.5]),
  sh(S(6), SEC.verdad, [2.6, 4.3, 12.5], [1.8, 4.6, 11.8], [-1.0, 1.9, 0], [-1.2, 2.0, 0]),
  sh(SEC.verdad, SEC.como, [3.8, 2.6, 9.6], [3.2, 2.5, 8.8], [-.4, 1.4, 0], [-.6, 1.5, 0]),
  sh(SEC.como, S(24), [-2.0, 6.4, 8.4], [-.6, 6.0, 7.6], [-1.6, 2.9, 0], [-1.2, 2.9, 0]),
  sh(S(24), S(29), [1.0, 3.2, 6.6], [.6, 2.9, 6.0], [3.0, 2.0, -1.2], [2.6, 1.8, -1.2]),
  sh(S(29), S(32), [.8, 3.6, 10.4], [1.6, 3.8, 10.8], [2.4, 1.7, -.4], [3.4, 1.9, -.4]),
  sh(S(32), S(34), [2.4, 4.0, 12.0], [2.8, 4.0, 11.6], [3.2, 2.0, -.4], [3.6, 2.0, -.4]),
  sh(S(34), SEC.p1, [4.9, 2.0, 6.2], [4.7, 1.9, 5.6], [4.0, 1.15, 1.0], [3.95, 1.15, 1.0]),
  sh(SEC.p1, S(51), [3.0, 3.0, 9.5], [2.5, 2.8, 8.8], [-1.6, 1.4, 0], [-1.8, 1.4, 0]),
  sh(S(51), SEC.p2, WIDE[0], WIDE[1], [-.6, 2.0, 0], [-.2, 2.0, 0]),
  sh(SEC.p2, S(60), [1.6, 2.4, 6.6], [1.0, 2.3, 6.0], [-1.6, 1.9, -.6], [-1.8, 1.9, -.6]),
  sh(S(60), S(61), [.2, 1.8, 5.2], [-.3, 1.7, 4.8], [-3.6, 1.1, -1.0], [-3.7, 1.1, -1.0]),
  sh(S(61), S(62), [3.0, 2.4, 5.6], [2.6, 2.3, 5.0], [-.2, 2.1, -1.4], [-.3, 2.1, -1.4]),
  sh(S(62), SEC.p3, [3.2, 2.8, 8.6], [2.8, 2.7, 8.2], [-1.4, 1.5, 0], [-1.5, 1.5, 0]),
  sh(SEC.p3, S(75), [-2.6, 6.6, 9.6], [-1.8, 6.3, 9.0], [-2.0, 2.9, -.2], [-1.8, 2.9, -.2]),
  sh(S(75), SEC.p4, [2.4, 4.0, 10.6], [2.0, 3.8, 10.0], [-1.0, 2.0, 0], [-1.2, 2.0, 0]),
  sh(SEC.p4, SEC.red, WIDE[0], WIDE[1], WIDE[2], WIDE[3]),
  sh(SEC.red, S(88), [-1.6, 5.4, 12.6], [-.8, 5.2, 11.8], [1.6, 2.4, -.5], [1.8, 2.4, -.5]),
  sh(S(88), SEC.cero, [8.8, 3.8, 9.0], [8.4, 3.6, 8.4], [5.0, 3.0, -1.0], [5.2, 3.2, -1.0]),
  sh(SEC.cero, SEC.hib, [4.2, 3.6, 11.0], [3.6, 3.4, 10.2], [3.4, 2.0, -.2], [3.0, 2.0, -.2]),
  sh(SEC.hib, S(99), [3.2, 2.2, 6.4], [2.9, 2.1, 5.8], [.6, 1.0, -1.3], [.5, 1.0, -1.3]),
  sh(S(99), SEC.subs, [9.0, 5.0, 15.0], [7.0, 4.8, 14.0], [3.4, 1.6, -2], [2.6, 1.6, -2]),
  sh(SEC.subs, SEC.p5, [-4.0, 4.5, 13.0], [-2.5, 4.4, 12.6], [1.4, 2.0, 0], [1.8, 2.0, 0]),
  sh(SEC.p5, S(115), [-3.6, 6.8, 9.0], [-3.0, 6.5, 8.4], [-2.4, 2.9, -.4], [-2.2, 2.9, -.4]),
  sh(S(115), SEC.p6, [2.4, 3.0, 8.2], [2.0, 2.9, 7.6], [-1.0, 2.2, 0], [-1.1, 2.3, 0]),
  sh(SEC.p6, S(128), WIDE[0], WIDE[1], [-1.0, 1.8, 0], [-.8, 1.8, 0]),
  sh(S(128), SEC.p7, [11.8, 3.6, 9.0], [11.2, 3.4, 8.2], [7.8, 1.6, -.6], [7.6, 1.6, -.6]),
  sh(SEC.p7, S(138), [-2.0, 4.0, 12.0], [-4.0, 4.2, 11.6], [-5.2, 1.6, -.6], [-5.6, 1.6, -.6]),
  sh(S(138), SEC.regla, [4.9, 2.0, 6.2], [4.7, 1.9, 5.6], [4.0, 1.15, 1.0], [3.95, 1.15, 1.0]),
  sh(SEC.regla, SEC.p8, [6.0, 4.6, 13.4], [5.0, 4.4, 12.6], [3.6, 2.2, -.5], [3.2, 2.2, -.5]),
  sh(SEC.p8, SEC.p9, [3.6, 3.0, 9.8], [3.0, 2.8, 9.0], [-1.4, 1.6, 0], [-1.6, 1.6, 0]),
  sh(SEC.p9, SEC.p10, [-1.0, 5.4, 12.6], [.2, 5.0, 12.0], [-1.6, 2.0, -.4], [-1.4, 2.0, -.4]),
  sh(SEC.p10, S(181), [-2.6, 5.4, 6.8], [-1.8, 5.0, 6.2], [-2.4, 3.2, -.3], [-2.0, 3.1, -.3]),
  sh(S(181), SEC.err, [3.4, 2.6, 6.4], [3.0, 2.4, 5.8], [1.0, 1.4, -1.3], [.9, 1.4, -1.3]),
  sh(SEC.err, SEC.res, [-5.0, 5.0, 13.0], [-3.6, 5.2, 12.6], [-1.6, 2.0, 0], [-1.2, 2.0, 0]),
  sh(SEC.res, SEC.inst, [3.0, 6.0, 14.0], [2.2, 5.6, 13.0], [-1.6, 2.2, 0], [-1.6, 2.2, 0]),
  sh(SEC.inst, SEC.cta, [-2.4, 5.0, 8.4], [-1.6, 4.8, 7.8], [-1.0, 3.0, -.4], [-1.0, 3.0, -.4]),
  sh(SEC.cta, 9999, [6.0, 5.6, 16.0], [4.4, 5.0, 14.6], [-.6, 2.0, -.6], [-.8, 2.2, -.6]),
];
// ---- estado del mundo ----
function flow(m, curve, n, t, speed, on, s = 1) { for (let i = 0; i < n; i++) { const u = ((t * speed + i / n) % 1 + 1) % 1; const p = curve.getPoint(u); setP(m, i, p.x, p.y, p.z, on, s); } m.instanceMatrix.needsUpdate = true; }
const PNL = { x: -.1, y: 3.4, z: -.3 };
function animWorld(t) {
  const night = inn(t, S(32), S(34)) || inn(t, S(99), SEC.subs);
  if (night) skyNight(); else skyDay(t);
  if (inn(t, SEC.p10, S(181))) { sunL.color.set(0xffd9a0); } else sunL.color.set(0xffffff);
  // paneles visibles
  const nShow = t < S(5) ? 0 : t < S(5) + 1.5 ? Math.floor(12 * P(t, S(5), 1.5)) : 12;
  panels.forEach((p, i) => { p.visible = i < nShow; const pop = clamp((t - S(5) - i * .12) / .3); p.scale.setScalar(t < S(5) + 3 ? Math.max(.01, eback(pop)) : 1); });
  // apagón (red caída)
  const gridDown = inn(t, S(84), S(90)) || inn(t, S(99), SEC.subs);
  const hybrid = t >= SEC.hib && t < SEC.subs;
  const produce = !night && nShow > 0 && !(gridDown && !hybrid);
  panM.emissiveIntensity = produce ? .15 + .05 * Math.sin(t * 2) : 0; panM.color.set(gridDown && !hybrid ? 0x8a8f99 : 0xffffff);
  const houseOn = !(gridDown && !hybrid) && !inn(t, S(1) + .2, S(1) + 1.2) && !inn(t, S(2) + 2.4, S(3));
  ceilL.intensity = houseOn ? (night ? 7 : 5) : .2; bulbM.emissiveIntensity = houseOn ? 2 : 0; drawTV(houseOn); nWinM.emissiveIntensity = night && !gridDown ? 1.6 : 0;
  bulbM.emissive.set(t >= S(59) + .8 ? 0xf5fbff : 0xffc46a);
  drawAC(t >= S(61) ? 25 : 18, houseOn); drawInv(produce || (hybrid && night) ? t : 'off');
  gasketM.opacity = inn(t, S(60), S(61)) ? .4 + .3 * Math.sin(t * 9) : 0;
  plugO.position.z = inn(t, S(61) + 3.2, S(62)) ? -1.55 : -1.75; plugO.position.y = .5;
  // meter
  let dir = 0; if (inn(t, S(30), S(32)) || inn(t, S(37) + 1.2, S(38))) dir = -1; if (inn(t, S(32), S(37) + 1.2)) dir = 1; if (inn(t, S(138), SEC.regla)) dir = Math.sin(t * 1.5) > 0 ? 1 : -1;
  meterRead = 4580 + Math.max(0, t - 60) * .05; drawMeter(t, dir);
  wireM.emissiveIntensity = gridDown ? 0 : .0;
  // flujos de energía
  const showFlow = inn(t, SEC.como, SEC.p1) || inn(t, SEC.p4, SEC.subs) || inn(t, SEC.regla, SEC.p8);
  for (let i = 0; i < 24; i++) { const u = (t * .5 + i / 24) % 1; const px = -2.8 + (i % 6) * 1.1, pz = -.9 + (i % 2) * 1.3; setP(sunP, i, px + 2.5 * (1 - u), 3.25 + 5 * (1 - u), pz - 2 * (1 - u), showFlow && produce, 1); } sunP.instanceMatrix.needsUpdate = true;
  flow(dcP, roofCable, 14, t, .6, showFlow && produce && t >= S(23));
  flow(acP, toFr, 18, t, .5, showFlow && t >= S(25) && (produce || (hybrid && night)) && !inn(t, S(32), S(34)));
  const toGrid = (inn(t, S(30), S(32)) || inn(t, S(37), S(38)) || inn(t, SEC.red, S(84)) || inn(t, SEC.regla, SEC.p8)) && produce;
  const fromGrid = inn(t, S(32), S(34)) || inn(t, S(37), S(38) - .5);
  for (let i = 0; i < 16; i++) { const u = ((t * .5 + i / 16) % 1); const c = i < 8 ? toMeter : gridLine; let uu = i < 8 ? u : u; let on = false; let p;
    if (toGrid) { p = i < 8 ? toMeter.getPoint(uu) : gridLine.getPoint(1 - uu); on = true; } else if (fromGrid) { p = i < 8 ? toMeter.getPoint(1 - uu) : gridLine.getPoint(uu); on = true; } else p = V(0, -9, 0);
    setP(gridP, i, p.x, p.y, p.z, on); } gridP.instanceMatrix.needsUpdate = true;
  gridP.material.color.set(fromGrid && !toGrid ? 0xff8a3d : 0x7be36b);
  // inyección cero: el excedente se pierde (bolitas que se apagan en el techo)
  batG.visible = t >= SEC.hib && t < SEC.subs + .1 || inn(t, S(184), SEC.err);
  flow(batP, BATC, 8, t, night ? -.6 : .6, hybrid);
  batFillM.emissiveIntensity = hybrid ? .8 + .3 * Math.sin(t * 3) : .3;
  // sombra, filtraciones, impermeabilizante
  bigTree.visible = inn(t, SEC.p5, S(115)); tinaco.visible = inn(t, S(113), S(115));
  shadeM.opacity = inn(t, S(113), S(115)) ? .45 * P(t, S(113), 1) : 0;
  const leak = inn(t, S(115), S(117)); for (let i = 0; i < 8; i++) { const u = (t * .9 + i / 8) % 1; setP(drips, i, -1.4 + (i % 3) * .5, 2.7 - u * 2.4, -.5 + (i % 2) * .6, leak); } drips.instanceMatrix.needsUpdate = true;
  roofCoatM.opacity = t >= S(117) + .5 && t < SEC.p6 ? .85 * P(t, S(117) + .5, 1.2) : 0;
  // papeles volando a la distribuidora
  const pp = inn(t, S(134), S(138)); for (let i = 0; i < 6; i++) { const u = clamp((t - S(134) - i * .35) / 2.2); const a = V(-2.2, 1.4, .6), b = V(-9.6, 1.2, .3); const p = a.clone().lerp(b, eio(u)); p.y += Math.sin(u * Math.PI) * 2.2; setP(papers, i, p.x, p.y, p.z, pp && u < 1, 1, t * 2 + i); } papers.instanceMatrix.needsUpdate = true;
  // ---- personajes ----
  let op = [-1.4, .15, .4], ory = .3, p = { emo: 'neutral' }, ev = false, ep = [1.4, .15, .4], ery = -.3, e = { emo: 'neutral' };
  const point = (a = -2.3) => ({ armR: [a, -.3, -.2], armL: [-.2, .15, -.3] }), wave = { armR: [-2.6, -.35, -.2 + .3 * Math.sin(t * 8)], armL: [-.2, .15, -.3] };
  const holdBill = { armR: [-1.3, -.2, -.7], armL: [-1.3, .2, -.7], look: [0, -.6], headRx: .25 };
  if (t < SEC.verdad) { op = [-1.3, .15, .6]; p = t < S(5) ? { emo: t > S(2) ? 'sad' : 'worried', ...holdBill } : { emo: 'happy', ...point(-2.6), headRy: .3 }; }
  else if (t < SEC.como) { op = [-.6, .15, .6]; ev = true; ep = [1.2, .15, .5]; p = { emo: t > S(19) ? 'happy' : 'surprised', ...holdBill }; e = { emo: 'determined', armL: [-1.0, .3, -.6], armR: [-2.0, -.3, -.2] }; }
  else if (t < SEC.p1) { op = [-.8, .15, .6]; ev = true; ep = [.8, .15, .6]; ery = -.4; p = { emo: 'neutral', headRy: -.3, look: [.5, .3] }; e = { emo: 'determined', ...point(-2.2), headRy: .4 }; }
  else if (t < SEC.p2) { op = [-1.0, .15, .5]; p = { emo: 'determined', ...holdBill }; }
  else if (t < SEC.p3) { op = [-.6, .15, -.1]; ory = t < S(60) ? 0 : t < S(61) ? -.8 : .2; p = { emo: 'determined', ...point(-2.0) }; if (inn(t, S(61) + 3, S(62))) { op = [-1.0, .15, -1.1]; ory = 3.14; p = { emo: 'determined', armR: [-1.0, -.2, -.6], armL: [-1.0, .2, -.6], spineRx: .4 }; } }
  else if (t < SEC.p4) { op = [-1.2, .15, .6]; ev = t > S(73); ep = [1.0, .15, .5]; p = { emo: 'neutral', look: [.3, .5], headRx: -.3 }; e = { emo: 'determined', armL: [-1.4, .3, -.6], armR: [-1.6, -.3, -.6] }; }
  else if (t < SEC.subs) { op = [-1.0, .15, .6]; ory = .2; p = { emo: gridDown && !hybrid ? 'surprised' : hybrid && night ? 'happy' : 'neutral', look: [0, .5] }; ev = inn(t, S(88), SEC.cero); ep = [6.3, 0, -.9]; ery = -.4; e = { emo: 'determined', armR: [-2.8, -.3, -.2], armL: [-2.6, .3, -.2] }; }
  else if (t < SEC.p5) { op = [-.6, .15, .6]; ev = true; ep = [1.0, .15, .6]; p = { emo: 'happy', ...wave }; e = { emo: 'happy', armL: [-.9, .3, -.6] }; }
  else if (t < SEC.p6) { op = [-1.2, .15, .6]; p = { emo: inn(t, S(113), S(117)) ? 'worried' : 'neutral', look: [0, .5], headRx: -.3 }; ev = t >= S(117); ep = [1.2, .15, .5]; e = { emo: 'determined', ...point(-2.4) }; }
  else if (t < SEC.p7) { op = [-1.2, .15, .6]; p = { emo: 'determined', ...holdBill }; if (t >= S(128)) { op = [7.4, 0, .9]; ory = .9; p = { emo: 'happy', ...point(-2.0) }; ev = true; ep = [8.3, 0, 1.3]; ery = -.6; e = { emo: 'happy', armL: [-.9, .3, -.6] }; } }
  else if (t < SEC.regla) { op = [-2.2, .15, .7]; ory = -.9; p = { emo: 'determined', ...holdBill }; if (t >= S(136) && t < S(138)) { op = [-7.6, 0, .9]; ory = -1.2; } if (t >= S(138)) { op = [3.6, 0, 1.25]; ory = .7; p = { emo: 'happy', ...point(-1.8) }; ev = true; ep = [5.45, 0, 1.15]; ery = -.6; e = { emo: 'determined', armL: [-1.3, .3, -.6], armR: [-1.8, -.3, -.4] }; } }
  else if (t < SEC.p8) { op = [-1.0, .15, .6]; p = { emo: 'neutral', ...holdBill }; }
  else if (t < SEC.p9) { op = [-1.2, .15, .6]; p = { emo: t > S(157) && t < S(160) ? 'worried' : 'happy', ...holdBill }; ev = t >= S(162); ep = [.8, .15, .6]; e = { emo: 'happy', armL: [-1.0, .3, -.6] }; }
  else if (t < SEC.p10) { op = [-1.4, .15, .6]; p = { emo: 'determined', ...holdBill }; }
  else if (t < SEC.err) { if (t < S(181)) { op = [-2.2, 3.03, .9]; ory = 3.0; p = { emo: 'determined', armR: [-1.5 + .3 * Math.sin(t * 5), -.2, -.6], armL: [-1.4, .2, -.6], spineRx: .3 }; } else { op = [.2, .15, -.6]; ory = .2; p = { emo: 'neutral', armR: [-1.4, -.2, -.6], look: [.5, -.3] }; ev = t >= S(184); ep = [1.6, .15, -.8]; ery = .3; e = { emo: 'determined', armL: [-1.0, .3, -.6] }; } }
  else if (t < SEC.inst) { op = [-1.0, .15, .6]; p = { emo: t < SEC.res ? 'worried' : 'happy', ...(t < SEC.res ? holdBill : point(-2.4)) }; }
  else if (t < SEC.cta) { op = [-2.0, 3.03, 1.2]; ory = .5; ev = true; ep = [-.4, 3.03, 1.2]; ery = -.3; p = { emo: 'happy' }; e = { emo: 'determined', armR: [-1.6, -.2, -.5], armL: [-1.0, .2, -.6] }; }
  else { op = [-1.2, .15, .6]; ev = true; ep = [.6, .15, .6]; p = { emo: 'happy', ...wave }; e = { emo: 'happy', armL: [-2.6, .35, -.2 + .3 * Math.sin(t * 7)] }; }
  owner.root.position.set(...op); owner.root.rotation.y = ory; pose(owner, p, t);
  eng.root.visible = ev; eng.root.position.set(...ep); eng.root.rotation.y = ery; pose(eng, e, t + 1.3); wrench.visible = inn(t, S(88), SEC.cero) || t >= S(184) && t < SEC.err; engCB.visible = !wrench.visible;
  // etiquetas 3D
  OVL.length = 0; const Lb = (text, at, end, pos, color = '#ffcc33') => { if (t >= at && t < end) OVL.push({ text, at, end, pos, color }); };
  const ROOF = V(0, 4.6, -.2), MTR = V(4.35, 2.6, 1.0), INV = V(2.35, 2.6, -1.7);
  Lb('TECHO VACÍO', S(1), S(2), ROOF, '#ff6a4a'); Lb('¡SE VA LA LUZ!', S(2) + 2.4, S(3), ROOF, '#ff6a4a'); Lb('ENERGÍA DEL SOL', S(5), S(6), ROOF, '#7be36b');
  Lb('PAGAR CERO ✖', S(16), S(17), ROOF, '#ff6a4a'); Lb('PERO BAJA MUCHO', S(19), SEC.como, ROOF, '#7be36b');
  Lb('PANELES', S(23), S(24), ROOF); Lb('CORRIENTE DIRECTA', S(24), S(25), INV, '#ffcc33'); Lb('CORRIENTE ALTERNA', S(25), S(26), INV, '#6cc4ff'); Lb('EL INVERSOR', S(26), S(29), INV, '#ffcc33');
  Lb('PRIMERO TU CASA', S(29), S(30), ROOF, '#7be36b'); Lb('EL SOBRANTE → RED', S(30), S(32), MTR, '#7be36b'); Lb('DE NOCHE ← RED', S(32), S(34), MTR, '#ff8a3d'); Lb('CONTADOR BIDIRECCIONAL', S(35), S(38), MTR); Lb('MEDICIÓN NETA', S(38), SEC.p1, MTR, '#7be36b');
  Lb('LED', S(59), S(60), V(-.2, 3.1, -.2), '#7be36b'); Lb('GOMA DE LA NEVERA', S(60), S(61), V(-2.55, 2.3, -1.2)); Lb('24–25 °C', S(61), S(61) + 3, V(.9, 2.9, -1.6), '#6cc4ff'); Lb('DESCONECTA', S(61) + 3.2, S(62), V(-1.0, 1.3, -1.6));
  Lb('1. CONECTADO A LA RED', SEC.red, S(84), ROOF, '#7be36b'); Lb('APAGÓN = PANELES APAGADOS', S(84), S(88), ROOF, '#ff6a4a'); Lb('POR SEGURIDAD', S(88), SEC.cero, V(6.3, 5.8, -1.6), '#ffcc33');
  Lb('2. INYECCIÓN CERO', SEC.cero, S(94), MTR, '#6cc4ff'); Lb('SOBRANTE SE PIERDE', S(94), SEC.hib, ROOF, '#ff8a4a');
  Lb('3. HÍBRIDO CON BATERÍAS', SEC.hib, S(99), V(2.35, 1.6, -1.4), '#7be36b'); Lb('LUZ EN EL APAGÓN', S(99), S(102), V(0, 4.4, 0), '#7be36b'); Lb('INVERSOR HÍBRIDO', S(102), SEC.subs, V(0, 4.4, 0));
  Lb('SIN SOMBRA', S(112), S(114), ROOF, '#7be36b'); Lb('UNA SOMBRA = MENOS ENERGÍA', S(114), S(115), ROOF, '#ff6a4a'); Lb('¿FILTRACIONES?', S(115), S(117), V(-1.0, 3.6, 0), '#ff6a4a'); Lb('IMPERMEABILIZA ANTES', S(117), SEC.p6, ROOF, '#7be36b');
  Lb('VE, MIRA Y PREGUNTA', S(128), SEC.p7, V(9.4, 3.9, -.9), '#7be36b');
  Lb('SOLICITUD', S(134), S(136), V(-9.6, 3.9, -1.2)); Lb('ACUERDOS FIRMADOS', S(136), S(138), V(-9.6, 3.9, -1.2), '#7be36b'); Lb('CONTADOR BIDIRECCIONAL', S(138), S(139), MTR); Lb('✖ SIN PERMISO', S(139), SEC.regla, MTR, '#ff6a4a');
  Lb('USA TU ENERGÍA EN CASA', S(148), SEC.p8, ROOF, '#7be36b');
  Lb('TEMPRANO O AL ATARDECER', S(178), S(179), V(-2.2, 5.0, .6)); Lb('✖ PANEL CALIENTE', S(179), S(180), V(-2.2, 5.0, .6), '#ff6a4a'); Lb('CON SEGURIDAD', S(180), S(181), V(-2.2, 5.0, .6), '#ff8a4a');
  Lb('INSTALADOR CERTIFICADO', S(206), SEC.cta, V(-1.2, 5.2, 1.2), '#7be36b');
}
// ---------- 2D ----------
const STEPS = [[SEC.p1, SEC.p2, 1, 'TU CONSUMO EN kWh'], [SEC.p2, SEC.p3, 2, 'BAJA TU CONSUMO'], [SEC.p3, SEC.p4, 3, 'CALCULA EL TAMAÑO'], [SEC.p4, SEC.subs, 4, 'ELIGE EL TIPO'], [SEC.p5, SEC.p6, 5, 'REVISA TU TECHO'], [SEC.p6, SEC.p7, 6, 'TRES COTIZACIONES'], [SEC.p7, SEC.p8, 7, 'LOS PERMISOS'], [SEC.p8, SEC.p9, 8, 'LEY 57-07'], [SEC.p9, SEC.p10, 9, 'HAZ LOS NÚMEROS'], [SEC.p10, SEC.err, 10, 'MANTENIMIENTO']];
function stepBadge(t) { const s = STEPS.find(s => inn(t, s[0], s[1])); if (!s) return; const k = eback(P(t, s[0], .4)); g.save(); g.translate(36, 34); g.scale(k, k); g.font = '900 30px M'; const w = g.measureText(s[3]).width;
  g.fillStyle = '#ffcc33'; rrp(g, 0, 0, 0, 150, 56, 28); g.fill(); g.fillStyle = '#2a2c33'; g.textBaseline = 'middle'; g.textAlign = 'center'; g.fillText('PASO ' + s[2], 75, 30);
  g.fillStyle = 'rgba(10,14,28,.7)'; rrp(g, 0, 160, 0, w + 40, 56, 28); g.fill(); g.fillStyle = '#fff'; g.textAlign = 'left'; g.fillText(s[3], 180, 30); g.restore(); }
// tarjeta con lista: rows = [[tiempo, texto, color, marca]]
function listCard(t, a, b, x0, y0, w, title, col, rows, opt = {}) {
  if (!inn(t, a, b)) return; const k = eback(P(t, a, .4)) * (1 - P(t, b - .25, .25)); const rh = opt.rh || 56, fs = opt.fs || 30; const h = 90 + rows.length * rh + 20;
  g.save(); g.translate(x0, y0); g.scale(k, k); g.rotate(-.015);
  g.fillStyle = 'rgba(0,0,0,.35)'; rrp(g, 0, -w / 2 + 10, -h / 2 + 10, w, h, 24); g.fill(); g.fillStyle = '#fffdf6'; rrp(g, 0, -w / 2, -h / 2, w, h, 24); g.fill();
  g.fillStyle = col; rrp(g, 0, -w / 2, -h / 2, w, 76, 24); g.fill(); g.fillRect(-w / 2, -h / 2 + 50, w, 26);
  g.textAlign = 'center'; g.textBaseline = 'middle'; g.font = '900 34px M'; g.fillStyle = '#fff'; g.fillText(title, 0, -h / 2 + 40);
  rows.forEach(([at, text, c, mark], i) => { const kk = eback(P(t, at, .3)); if (kk <= 0) return; const y = -h / 2 + 76 + 22 + i * rh + rh / 2 - 10; g.save(); g.translate(-w / 2 + 34, y); g.scale(kk, kk);
    if (mark) { g.fillStyle = mark === '✖' ? '#e8383a' : mark === '✔' ? '#1aa86a' : '#3d8bff'; g.beginPath(); g.arc(14, 0, 17, 0, 6.29); g.fill(); g.fillStyle = '#fff'; g.font = '900 20px M'; g.textAlign = 'center'; g.fillText(mark, 14, 1); }
    g.textAlign = 'left'; let f2 = fs; g.font = `800 ${f2}px M`; const avail = w - 68 - (mark ? 46 : 0); const tw = g.measureText(text).width; if (tw > avail) { f2 = Math.floor(fs * avail / tw); g.font = `800 ${f2}px M`; } g.fillStyle = c || '#2a2c33'; g.fillText(text, mark ? 46 : 0, 1); g.restore(); });
  g.restore(); }
function bigNum(t, a, b, x0, y0, top, big, sub, col = '#3d8bff') { if (!inn(t, a, b)) return; const k = eback(P(t, a, .4)) * (1 - P(t, b - .25, .25)); g.save(); g.translate(x0, y0); g.scale(k, k);
  g.font = '900 72px M'; let w = Math.max(420, g.measureText(big).width + 80); g.font = '800 26px M'; w = Math.max(w, g.measureText(sub).width + 60); g.font = '900 72px M'; g.fillStyle = 'rgba(0,0,0,.35)'; rrp(g, 0, -w / 2 + 10, -120, w, 250, 26); g.fill(); g.fillStyle = '#fffdf6'; rrp(g, 0, -w / 2, -130, w, 250, 26); g.fill();
  g.textAlign = 'center'; g.textBaseline = 'middle'; g.font = '800 28px M'; g.fillStyle = '#5a6070'; g.fillText(top, 0, -82); g.font = '900 72px M'; g.fillStyle = col; g.fillText(big, 0, -5); g.font = '800 26px M'; g.fillStyle = '#5a6070'; g.fillText(sub, 0, 72); g.restore(); }
function bill(t, a, b, x0, y0, extra) { if (!inn(t, a, b)) return; const k = eback(P(t, a, .4)) * (1 - P(t, b - .25, .25)); g.save(); g.translate(x0, y0); g.scale(k, k); g.rotate(-.02);
  g.fillStyle = 'rgba(0,0,0,.35)'; rrp(g, 0, -232, -172, 480, 352, 24); g.fill(); g.fillStyle = '#fffdf6'; rrp(g, 0, -240, -180, 480, 352, 24); g.fill(); g.fillStyle = '#f6b445'; rrp(g, 0, -240, -180, 480, 72, 24); g.fill(); g.fillRect(-240, -130, 480, 22);
  g.textAlign = 'center'; g.textBaseline = 'middle'; g.font = '900 34px M'; g.fillStyle = '#2a2c33'; g.fillText('FACTURA DE LUZ', 0, -144);
  const rows = extra || [['CONSUMO', '600 kWh', '#2a2c33'], ['CARGO FIJO', 'RD$ ✔', '#2a2c33'], ['TOTAL', 'RD$ $$$$', '#e8383a']];
  rows.forEach(([l, v, c, hl], i) => { const y = -70 + i * 70; if (hl && t >= hl) { g.fillStyle = 'rgba(255,204,51,.5)'; rrp(g, 0, -220, y - 28, 440, 56, 12); g.fill(); } g.textAlign = 'left'; g.font = '800 28px M'; g.fillStyle = '#5a6070'; g.fillText(l, -205, y); g.textAlign = 'right'; g.font = '800 30px M'; g.fillStyle = c; g.fillText(v, 205, y); });
  g.restore(); }
function barChart(t, a, b, x0, y0) { if (!inn(t, a, b)) return; const k = eback(P(t, a, .4)) * (1 - P(t, b - .25, .25)); g.save(); g.translate(x0, y0); g.scale(k, k);
  g.fillStyle = 'rgba(0,0,0,.35)'; rrp(g, 0, -290, -190, 600, 400, 24); g.fill(); g.fillStyle = '#fffdf6'; rrp(g, 0, -300, -200, 600, 400, 24); g.fill();
  g.textAlign = 'center'; g.textBaseline = 'middle'; g.font = '900 30px M'; g.fillStyle = '#2a2c33'; g.fillText('kWh POR MES (EJEMPLO)', 0, -160);
  const v = [480, 470, 520, 560, 640, 720, 760, 750, 690, 600, 520, 490], ms = 'EFMAMJJASOND'; const avg = v.reduce((a, b) => a + b) / 12;
  v.forEach((val, i) => { const kk = clamp((t - a - .3 - i * .12) / .4); const hh = val / 800 * 250 * eout(kk); g.fillStyle = i >= 5 && i <= 8 ? '#ff8a3d' : '#3d8bff'; rrp(g, 0, -260 + i * 44, 150 - hh, 32, hh, 6); g.fill(); g.fillStyle = '#5a6070'; g.font = '800 20px M'; g.fillText(ms[i], -244 + i * 44, 172); });
  if (t > S(49)) { const y = 150 - avg / 800 * 250; g.strokeStyle = '#1aa86a'; g.lineWidth = 5; g.setLineDash([14, 10]); g.beginPath(); g.moveTo(-270, y); g.lineTo(270 * Math.min(1, (t - S(49)) * 1.5) * 2 - 270, y); g.stroke(); g.setLineDash([]); g.fillStyle = '#1aa86a'; g.font = '900 26px M'; g.fillText('PROMEDIO ≈ ' + Math.round(avg) + ' kWh', 60, y - 22); }
  if (inn(t, S(47), S(49))) { g.fillStyle = '#ff8a3d'; g.font = '900 26px M'; g.fillText('VERANO + AIRE', 40, -110); }
  g.restore(); }
function appChart(t, a, b, x0, y0) { if (!inn(t, a, b)) return; const k = eback(P(t, a, .4)) * (1 - P(t, b - .25, .25)); g.save(); g.translate(x0, y0); g.scale(k, k);
  g.fillStyle = '#1b1e27'; rrp(g, 0, -170, -300, 340, 600, 44); g.fill(); g.fillStyle = '#0d1730'; rrp(g, 0, -150, -270, 300, 540, 26); g.fill();
  g.textAlign = 'center'; g.textBaseline = 'middle'; g.font = '900 26px M'; g.fillStyle = '#fff'; g.fillText('APP DEL INVERSOR', 0, -230); g.font = '700 20px M'; g.fillStyle = '#9aa3b2'; g.fillText('kWh por día', 0, -196);
  const v = [24, 25, 23, 26, 24, 9, 25]; v.forEach((val, i) => { const hh = val / 28 * 300; const bad = i === 5; g.fillStyle = bad ? '#ff4d61' : '#35d39a'; rrp(g, 0, -126 + i * 36, 170 - hh, 26, hh, 5); g.fill(); g.fillStyle = '#9aa3b2'; g.font = '700 18px M'; g.fillText('LMMJVSD'[i], -113 + i * 36, 195); });
  if (t > S(182) + .6) { g.strokeStyle = '#ff4d61'; g.lineWidth = 5; g.beginPath(); g.arc(-126 + 5 * 36 + 13, 170 - 9 / 28 * 300 - 34, 26, 0, 6.29); g.stroke(); g.fillStyle = '#ff4d61'; g.font = '900 24px M'; g.fillText('¿QUÉ PASÓ?', 0, 240); }
  g.restore(); }
function subscribeFX(t, a, b) { if (!inn(t, a, b)) return; const k = eback(P(t, a, .45)) * (1 - P(t, b - .3, .3)); g.save(); g.translate(1170, 380); g.scale(k, k);
  const pressed = inn(t, S(105) + 1.2, S(105) + 1.6); const sub = t > S(105) + 1.4; g.fillStyle = sub ? '#5a6070' : '#ff2d3d'; const sc = pressed ? .92 : 1; g.save(); g.scale(sc, sc); rrp(g, 0, -230, -55, 460, 110, 55); g.fill();
  g.fillStyle = '#fff'; g.font = '900 46px M'; g.textAlign = 'center'; g.textBaseline = 'middle'; g.fillText(sub ? 'SUSCRITO ✔' : 'SUSCRÍBETE', 0, 3); g.restore();
  // campana
  g.save(); g.translate(300, 0); g.rotate(t > S(105) + 2.2 && t < S(105) + 3.6 ? Math.sin(t * 22) * .35 : 0); g.fillStyle = t > S(105) + 2.2 ? '#ffcc33' : '#ffffff'; g.beginPath(); g.moveTo(-34, 26); g.quadraticCurveTo(-30, -38, 0, -40); g.quadraticCurveTo(30, -38, 34, 26); g.closePath(); g.fill(); g.beginPath(); g.arc(0, 34, 10, 0, 6.29); g.fill(); g.fillRect(-42, 22, 84, 10); g.restore();
  // cursor
  const cu = clamp((t - S(105) - .2) / 1.0); g.save(); g.translate(lerp(260, 40, eout(cu)), lerp(200, 30, eout(cu))); g.fillStyle = '#fff'; g.strokeStyle = '#1b1e27'; g.lineWidth = 4; g.beginPath(); g.moveTo(0, 0); g.lineTo(0, 58); g.lineTo(16, 44); g.lineTo(28, 70); g.lineTo(38, 64); g.lineTo(26, 40); g.lineTo(46, 40); g.closePath(); g.fill(); g.stroke(); g.restore();
  g.restore(); }
function ctaFX(t) { if (!inn(t, SEC.cta, CTA_ST)) return; const items = [[S(208) + 1.4, 'ME GUSTA', '#3d8bff'], [S(209), 'COMPARTIR', '#1aa86a'], [S(209) + 3.2, 'SUSCRÍBETE', '#ff2d3d']];
  items.forEach(([at, tx, c], i) => { const k = eback(P(t, at, .35)); if (k <= 0) return; g.save(); g.translate(1230, 220 + i * 120); g.scale(k, k); g.fillStyle = c; rrp(g, 0, -190, -46, 380, 92, 46); g.fill(); g.fillStyle = '#fff'; g.font = '900 38px M'; g.textAlign = 'center'; g.textBaseline = 'middle'; g.fillText(tx, 0, 2); g.restore(); });
  if (t > S(210)) { const k = eback(P(t, S(210), .4)); g.save(); g.translate(1230, 590); g.scale(k, k); g.fillStyle = '#fffdf6'; rrp(g, 0, -260, -60, 520, 120, 26); g.fill(); g.fillStyle = '#2a2c33'; g.font = '900 32px M'; g.textAlign = 'center'; g.textBaseline = 'middle'; g.fillText('¿CUÁNTOS kWh GASTAS?', 0, -14); g.font = '800 24px M'; g.fillStyle = '#5a6070'; g.fillText('Escríbelo en los comentarios', 0, 28); g.restore(); }
}
function overlay2d(t) {
  stepBadge(t);
  const R = 1220; // columna derecha
  // gancho
  bill(t, S(2), S(3) + .2, R, 380, [['CONSUMO', '600 kWh', '#2a2c33'], ['TOTAL', 'RD$ MILES', '#e8383a'], ['APAGONES', '¡SÍ!', '#e8383a']]);
  listCard(t, S(6), S(11), R, 380, 560, 'EN ESTE VIDEO', '#3d8bff', [[S(6), 'Cómo funciona', 0, '•'], [S(7), 'Cuánto cuesta', 0, '•'], [S(8), 'Qué permisos necesitas', 0, '•'], [S(9), 'Recupera hasta 40 %', '#1aa86a', '•'], [S(10), 'Los errores', '#e8383a', '•']]);
  bigNum(t, S(11), SEC.verdad, R, 380, 'AL FINAL', 'ERROR #1', 'el que comete casi todo el mundo', '#e8383a');
  // verdad
  bill(t, S(15), S(19), R, 380, [['CARGO FIJO', 'SIGUE', '#2a2c33', S(17)], ['CARGO NUEVO', 'ALGUNOS', '#e8383a', S(18)], ['PAGAR CERO', 'CASI NUNCA', '#e8383a', S(16)]]);
  bigNum(t, S(19), SEC.como, R, 380, 'SI LO HACES BIEN', 'FACTURA ↓', 'puede bajar muchísimo', '#1aa86a');
  // paso 1
  bill(t, S(41), S(45), R, 380, [['CONSUMO', '600 kWh', '#2a2c33', S(42) + .8], ['TOTAL', 'RD$ —', '#9aa3b2'], ['MIRA', 'LOS kWh', '#1aa86a', S(44)]]);
  barChart(t, S(45), S(51), R, 390);
  listCard(t, S(51), SEC.p2, R, 380, 560, 'TAMAÑO SEGÚN CONSUMO', '#3d8bff', [[S(51), '200 kWh → sistema pequeño', 0, '•'], [S(52), '1,000 kWh → mucho más grande', 0, '•'], [S(54), 'Sin tu número = cotización inventada', '#e8383a', '✖']], { fs: 26 });
  // paso 2
  listCard(t, S(57), SEC.p3, R, 380, 560, 'BAJA TU CONSUMO PRIMERO', '#1aa86a', [[S(59), 'Bombillos LED', 0, '✔'], [S(60), 'Goma de la nevera', 0, '✔'], [S(61), 'Aire en 24–25 °C', 0, '✔'], [S(61) + 3.2, 'Desconecta lo que no usas', 0, '✔'], [S(64), 'Ahorrar < producir', '#1aa86a', '•']], { fs: 28 });
  // paso 3
  bigNum(t, S(67), S(70), R, 380, 'REGLA APROXIMADA EN RD', '1 kW ≈ 120 kWh', 'por mes (estimado)', '#3d8bff');
  bigNum(t, S(70), S(72), R, 380, 'EJEMPLO', '600 ÷ 120 = 5', 'kWh al mes ÷ 120', '#2a2c33');
  bigNum(t, S(72), S(75), R, 380, 'NECESITARÍAS', '≈ 5 kW', 'solo para tener una idea', '#1aa86a');
  listCard(t, S(75), SEC.p4, R, 380, 560, 'EL CÁLCULO EXACTO', '#3d8bff', [[S(75), 'Lo hace el instalador', 0, '✔'], [S(75) + 1.5, 'Según tu techo', 0, '•'], [S(75) + 2.6, 'La sombra', 0, '•'], [S(75) + 3.6, 'Y tu zona', 0, '•']]);
  // paso 4
  listCard(t, S(79), SEC.red, R, 380, 560, '3 TIPOS DE SISTEMA', '#3d8bff', [[S(79), '1. Conectado a la red', 0, '•'], [S(79) + .7, '2. Inyección cero', 0, '•'], [S(79) + 1.4, '3. Híbrido con baterías', 0, '•']]);
  listCard(t, S(81), S(84), R, 380, 560, 'CONECTADO A LA RED', '#1aa86a', [[S(81), 'Medición neta', 0, '•'], [S(82), 'El más barato', '#1aa86a', '✔'], [S(82) + 1.2, 'Sin baterías', 0, '•']]);
  listCard(t, S(91), SEC.hib, R, 380, 560, 'INYECCIÓN CERO', '#6c8bd6', [[S(91), 'Alimenta tu casa', 0, '✔'], [S(91) + 2, 'Nada va a la red', 0, '✖'], [S(92), 'No paga el cargo nuevo', '#1aa86a', '✔'], [S(94), 'El sobrante se pierde', '#e8383a', '✖']], { fs: 28 });
  listCard(t, S(97), S(99), R, 380, 560, 'HÍBRIDO', '#1aa86a', [[S(98), 'El más caro', '#e8383a', '•'], [S(98) + .8, 'Luz en los apagones', '#1aa86a', '✔']]);
  subscribeFX(t, S(104) + .5, SEC.p5 - .2);
  // paso 5
  listCard(t, S(111), S(113), R, 380, 560, 'TU TECHO', '#3d8bff', [[S(112), 'Sol directo casi todo el día', 0, '✔'], [S(113), 'Sin sombra', 0, '✔']]);
  listCard(t, S(115), SEC.p6, R, 380, 560, 'ANTES DE INSTALAR', '#ff8a3d', [[S(115), 'Que aguante el peso', 0, '✔'], [S(115) + 2, 'Sin filtraciones', 0, '✔'], [S(116), 'Arreglar después = más caro', '#e8383a', '✖'], [S(117), 'Techo viejo: impermeabiliza', '#1aa86a', '✔']], { fs: 28 });
  // paso 6
  bigNum(t, S(119), S(121), R, 380, 'PIDE POR LO MENOS', '3 COTIZACIONES', 'y no compares solo el precio', '#3d8bff');
  listCard(t, S(121), S(127), R, 420, 600, 'CADA COTIZACIÓN DEBE DECIR', '#3d8bff', [[S(121), 'Paneles: cuántos y de cuántos vatios', 0, '✔'], [S(122), 'Marca y modelo del inversor', 0, '✔'], [S(123), 'Baterías: sí o no, y de qué tipo', 0, '✔'], [S(124), 'Energía que producirá al mes', '#1aa86a', '✔'], [S(125), 'Garantías', 0, '✔'], [S(126), 'Permisos y crédito fiscal', 0, '✔']], { fs: 25, rh: 50 });
  bigNum(t, S(127), S(128), R, 380, 'SI NO DICE CUÁNTO PRODUCE', '✖ NO SIRVE', 'para comparar', '#e8383a');
  // paso 7
  listCard(t, S(133), S(136), R, 380, 560, 'SI VA CONECTADO A LA RED', '#3d8bff', [[S(133), 'La distribuidora lo aprueba', 0, '✔'], [S(134), 'Solicitud: tú o tu instalador', 0, '•'], [S(135), 'Edesur · Edenorte · Edeeste', 0, '•']], { fs: 28 });
  listCard(t, S(136), S(138), R, 380, 560, 'SE FIRMA', '#1aa86a', [[S(136), 'Acuerdo de interconexión', 0, '✔'], [S(137), 'Acuerdo de medición neta', 0, '✔']]);
  listCard(t, S(140) + .3, SEC.p8, R, 400, 620, 'REGLAMENTO NUEVO (SIE)', '#e8383a', [[S(141), 'Solicitudes nuevas: reglas nuevas', 0, '•'], [S(143), 'Desde 1 nov 2026: cargo nuevo', '#e8383a', '•'], [S(144), '25 % del cargo por energía', 0, '•'], [S(145), 'Solo sobre lo que entregas a la red', 0, '•'], [S(147), 'Ya aprobados: transición hasta 5 años', 0, '•'], [S(148), 'Usa en casa lo que produces', '#1aa86a', '✔']], { fs: 25, rh: 50 });
  // paso 8
  listCard(t, S(150), S(157), R, 380, 600, 'LEY 57-07', '#1aa86a', [[S(153), 'Equipos exentos de ITBIS', 0, '✔'], [S(156), 'Crédito fiscal de hasta 40 %', '#1aa86a', '✔'], [S(156) + 1.6, 'del costo de los equipos', '#5a6070', '']], { fs: 28 });
  bigNum(t, S(157), S(160), R, 380, 'OJO: SE DESCUENTA DEL', 'ISR', 'si no pagas ISR, no te llega en efectivo', '#e8383a');
  listCard(t, S(160), S(163), R, 380, 600, 'SE PIDE A LA CNE CON', '#3d8bff', [[S(161), 'Tu cédula', 0, '✔'], [S(161) + 1.2, 'Título o contrato de alquiler', 0, '✔'], [S(161) + 2.8, 'Las facturas', 0, '✔'], [S(162), '¿Tu instalador lo tramita?', '#1aa86a', '•']], { fs: 28 });
  // paso 9
  bigNum(t, S(165), S(168), R, 380, 'SISTEMA DE ~5 kW INSTALADO', 'US$5,000–8,000', S(167) <= t ? 'con baterías: sube bastante' : 'guías de precios 2026', '#3d8bff');
  listCard(t, S(168), S(172), R, 380, 620, 'LA CUENTA', '#3d8bff', [[S(169), 'Pago de luz hoy − pago con paneles', 0, '•'], [S(170), '= tu ahorro al mes', '#1aa86a', '•'], [S(171), 'Costo ÷ ahorro = meses', 0, '•']], { fs: 28 });
  bigNum(t, S(172), SEC.p10, R, 380, 'MUCHAS GUÍAS DICEN', '5–7 AÑOS', 'pero haz tu cuenta con tus números', '#1aa86a');
  // paso 10
  listCard(t, S(177), S(181), R, 380, 560, 'LIMPIEZA', '#3d8bff', [[S(177), 'Agua y paño suave', 0, '✔'], [S(178), 'Temprano o al atardecer', 0, '✔'], [S(179), 'Nunca con el panel caliente', '#e8383a', '✖'], [S(180), 'Nunca sin seguridad', '#e8383a', '✖']]);
  appChart(t, S(181), S(184), R, 400);
  // errores
  listCard(t, SEC.err, SEC.res, R, 420, 620, 'ERRORES QUE CUESTAN DINERO', '#e8383a', [[S(187), 'Comprar el más grande sin mirar consumo', 0, '✖'], [S(188), 'Elegir solo por el más barato', 0, '✖'], [S(189), 'No preguntar por los apagones', 0, '✖'], [S(190), 'Techo con filtraciones', 0, '✖'], [S(191), 'Conectarse sin permiso', 0, '✖'], [S(193), '#1: No bajar primero el consumo', '#e8383a', '✖']], { fs: 24, rh: 50 });
  // resumen
  listCard(t, SEC.res, SEC.inst, R, 420, 560, 'RESUMEN', '#1aa86a', [[S(196), 'Mira tus kWh', 0, '✔'], [S(197), 'Baja tu consumo', 0, '✔'], [S(198), 'Calcula el tamaño', 0, '✔'], [S(199), 'Elige el tipo', 0, '✔'], [S(200), 'Revisa tu techo', 0, '✔'], [S(201), 'Tres cotizaciones', 0, '✔'], [S(202), 'Permisos', 0, '✔'], [S(203), 'Crédito fiscal', 0, '✔'], [S(204), 'Números y mantenimiento', 0, '✔']], { fs: 22, rh: 36 });
  ctaFX(t);
}
const KEYW = new Set(['techo', 'luz', 'sol', 'paneles', 'inversor', 'red', 'bidireccional', 'medición', 'neta', 'kilovatios', 'factura', 'consumo', 'led', 'nevera', 'promedio', 'cinco', 'tipos', 'apagón', 'baterías', 'híbrido', 'cero', 'suscríbete', 'campanita', 'sombra', 'filtraciones', 'cotizaciones', 'permisos', 'interconexión', 'contador', 'noviembre', 'veinticinco', 'itbis', 'crédito', 'cuarenta', 'renta', 'dólares', 'ahorro', 'años', 'mantenimiento', 'seguridad', 'error', 'certificado', 'comentarios', 'like']);

function caption(t) {
  let i = -1; for (let k = 0; k < WORDS.length; k++) if (t >= WORDS[k].s - .03) i = k; if (i < 0) return;
  const w = WORDS[i], nx = WORDS[i + 1]; const end = nx ? Math.min(nx.s - .03, w.e + .5) : w.e + .6; if (t > end) return;
  const raw = w.w.replace(/[¿?¡!.,:…]/g, ''); const word = raw.charAt(0).toUpperCase() + raw.slice(1); const key = KEYW.has(norm(raw));
  const k = eback(P(t, w.s - .03, .14)); g.save(); g.translate(800, 812); g.scale(lerp(.85, 1, k), lerp(.85, 1, k));
  g.font = '900 60px M'; g.textAlign = 'center'; g.textBaseline = 'middle'; g.lineJoin = 'round'; g.lineWidth = 12; g.strokeStyle = 'rgba(20,18,30,.9)'; g.shadowColor = 'rgba(0,0,0,.45)'; g.shadowBlur = 16; g.shadowOffsetY = 4; g.strokeText(word, 0, 0); g.shadowBlur = 0; g.shadowOffsetY = 0; g.fillStyle = key ? '#ffcc33' : '#ffffff'; g.fillText(word, 0, 0); g.restore();
}
// ---------- marca de agua y cierre SÍGUEME ----------
function watermark(t) {
  g.save(); g.globalAlpha = .62 * (1 - P(t, CTA_ST, .3)); g.font = '800 26px M'; const w = g.measureText(BRAND).width;
  const x = W - 30 - w - 56, y = 52; g.fillStyle = 'rgba(10,14,28,.45)'; rrp(g, 0, x - 12, y - 24, w + 80, 48, 24); g.fill();
  g.save(); g.beginPath(); g.arc(x + 16, y, 18, 0, 6.29); g.clip(); g.drawImage(MASCOT, x - 2, y - 18, 36, 36); g.restore();
  g.fillStyle = '#ffffff'; g.textBaseline = 'middle'; g.fillText(BRAND, x + 42, y + 2); g.restore();
}
function followCTA(t) {
  const st = CTA_ST; if (t < st) return; const a = P(t, st, .3);
  g.save(); g.fillStyle = `rgba(6,10,24,${.72 * a})`; g.fillRect(0, 0, W, H);
  const k = eback(P(t, st + .05, .45)); g.translate(800, 250); g.scale(k * .62, k * .62);
  g.save(); g.beginPath(); g.arc(0, 0, 190, 0, 6.29); g.fillStyle = '#ffcc33'; g.fill(); g.beginPath(); g.arc(0, 0, 176, 0, 6.29); g.clip(); g.drawImage(MASCOT, -176, -176, 352, 352); g.restore();
  g.textAlign = 'center'; g.textBaseline = 'middle'; g.lineJoin = 'round';
  let fs = 128; g.font = `italic 900 ${fs}px M`; const mw = g.measureText(CTA.big).width; if (mw > 940) { fs = Math.floor(fs * 940 / mw); g.font = `italic 900 ${fs}px M`; }
  g.lineWidth = 22 * fs / 128; g.strokeStyle = '#3a2405'; g.strokeText(CTA.big, 0, 330); g.fillStyle = '#ffcc33'; g.fillText(CTA.big, 0, 330);
  g.font = '800 58px M'; g.fillStyle = '#ffffff'; g.fillText(BRAND, 0, 450);
  const pb = .5 + .5 * Math.sin((t - st) * 6), bw = CTA.bw; g.fillStyle = CTA.col; rrp(g, 0, -bw / 2, 520, bw, 104, 52); g.fill(); g.lineWidth = 6; g.strokeStyle = `rgba(255,255,255,${.4 + .4 * pb})`; g.stroke();
  g.font = '900 52px M'; g.fillStyle = '#ffffff'; g.fillText(CTA.btn, 0, 574);
  g.font = '700 38px M'; g.fillStyle = 'rgba(255,255,255,.85)'; g.fillText('Más videos de cómo funcionan las cosas', 0, 700);
  g.restore();
}
// ---------- render ----------
function renderAt(t) {
  seed = 7 + Math.floor(t * 30) * 13;
  camAt(t); animWorld(t);
  composer.render(); g.drawImage(glc, 0, 0);
  const vg = g.createRadialGradient(800, 450, 520, 800, 450, 1000); vg.addColorStop(0, 'rgba(0,0,0,0)'); vg.addColorStop(1, 'rgba(0,0,0,.28)'); g.fillStyle = vg; g.fillRect(0, 0, W, H);
  overlayLabels(t); if (t < CTA_ST) { overlay2d(t); caption(t); } watermark(t); followCTA(t);
  const fo = P(t, END - .3, .3); if (fo > 0) { g.fillStyle = `rgba(0,0,0,${fo})`; g.fillRect(0, 0, W, H); }
}
window.renderAt = renderAt; window.END = END;
window.frameJPG = (t, q = .92) => { renderAt(t); return out.toDataURL('image/jpeg', q).split(',')[1]; };
window.READY = true;
