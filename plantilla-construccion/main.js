// Reel 9:16 3D (Estilo B: construcción en corte) — Conectas todo en un solo enchufe
import * as THREE from 'three';
import { EffectComposer } from 'three/addons/postprocessing/EffectComposer.js';
import { RenderPass } from 'three/addons/postprocessing/RenderPass.js';
import { UnrealBloomPass } from 'three/addons/postprocessing/UnrealBloomPass.js';
import { OutputPass } from 'three/addons/postprocessing/OutputPass.js';

const W = 1080, H = 1920, END = 107.8;   // END = última palabra + 3,7 s (cierre)
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
// ---------- mundo: casa en corte de noche (electricidad) ----------
const GZ = 3.6; // cara frontal del terreno en corte
add(M(new THREE.BoxGeometry(50.1, .25, 24.1), lp(0x4f9a3e))).position.set(0, -.1, GZ - 12);
{ const b = add(M(new THREE.BoxGeometry(50, 3.4, 24), lp(0x8a5a34))); b.position.set(0, -1.92, GZ - 12); const r = add(M(new THREE.BoxGeometry(50, 3, 24), lp(0x6c717c))); r.position.set(0, -5.1, GZ - 12); }
for (let i = 0; i < 30; i++) { const r = add(M(new THREE.DodecahedronGeometry(.08 + rnd() * .15, 0), lp(0x6a5a4a))); r.position.set((rnd() - .5) * 24, -.5 - rnd() * 3, GZ + .02); if (Math.abs(r.position.x - 3.6) < .4) r.visible = false; }
for (let i = -12; i <= 12; i++) { const p = add(M(new THREE.BoxGeometry(.16, 1, .16), lp(0xdcdcd6))); p.position.set(i * 1.6, .5, -7); }
function bgHouse(x, z, c) { const h = new THREE.Group(); const b = M(new THREE.BoxGeometry(4, 2.6, 3.4), lp(c)); b.position.y = 1.3; h.add(b); const rf = M(new THREE.ConeGeometry(3.2, 1.6, 4), lp(0xb8553a)); rf.rotation.y = Math.PI / 4; rf.scale.set(1, 1, .8); rf.position.y = 3.4; h.add(rf); for (const wx of [-1, 1]) { const w = M(new THREE.BoxGeometry(.7, .7, .05), new THREE.MeshBasicMaterial({ color: 0xffd27a })); w.position.set(wx, 1.6, 1.72); h.add(w); } h.position.set(x, 0, z); scene.add(h); }
bgHouse(-10, -11, 0xe9d7b5); bgHouse(9, -12, 0xf3e2c4); bgHouse(14, -7, 0xe0cdb0);
// casa en corte
const W1 = lp(0xf2e3c8), W2 = lp(0xfff4e0);
add(M(new THREE.BoxGeometry(6.6, .15, 3.8), lp(0xc8a27a))).position.set(0, .07, 0);
add(M(new THREE.BoxGeometry(6.6, 2.7, .16), W2)).position.set(0, 1.35, -1.9);
add(M(new THREE.BoxGeometry(.16, 2.7, 3.8), W1)).position.set(-3.3, 1.35, 0);
add(M(new THREE.BoxGeometry(.16, 2.7, 3.8), W1)).position.set(3.3, 1.35, 0);
add(M(new THREE.BoxGeometry(.12, 2.7, 3.6), W2)).position.set(.7, 1.35, 0);
add(M(new THREE.BoxGeometry(6.9, .22, 4.1), lp(0xd8d2c4))).position.set(0, 2.8, 0);
add(M(new THREE.BoxGeometry(2.5, 2.0, .04), lp(0x9fd3e6), false)).position.set(2.0, 1.1, -1.8);
// luces de techo
const lampK = add(M(new THREE.SphereGeometry(.14, 12, 8), new THREE.MeshBasicMaterial({ color: 0xfff1c0 }), false)); lampK.position.set(-1.3, 2.55, 0);
const lampB = add(M(new THREE.SphereGeometry(.12, 12, 8), new THREE.MeshBasicMaterial({ color: 0xfff1c0 }), false)); lampB.position.set(2.0, 2.55, 0);
const lightK = new THREE.PointLight(0xffe2a8, 0, 8, 1.4); lightK.position.set(-1.3, 2.3, .2); scene.add(lightK);
const lightB = new THREE.PointLight(0xffe2a8, 0, 6, 1.4); lightB.position.set(2.0, 2.3, .2); scene.add(lightB);
// cocina: barra y aparatos
add(M(new THREE.BoxGeometry(3.4, .9, .7), lp(0xe9e4da))).position.set(-1.5, .45, -1.45);
add(M(new THREE.BoxGeometry(3.5, .06, .8), lp(0x3c3f4a))).position.set(-1.5, .93, -1.45);
const micro = new THREE.Group(); { micro.add(rbox(.7, .42, .45, .03, lp(0xe8eaee))); const d = M(new THREE.BoxGeometry(.42, .3, .02), new THREE.MeshStandardMaterial({ color: 0x222831, emissive: 0xffb84a, emissiveIntensity: 0 }), false); d.position.set(-.08, 0, .23); micro.add(d); micro.userData.door = d; } micro.position.set(-2.55, 1.17, -1.5); scene.add(micro);
const coffee = new THREE.Group(); { coffee.add(rbox(.3, .45, .3, .03, lp(0x2b2f3a))); const jug = M(new THREE.CylinderGeometry(.1, .1, .18, 12), new THREE.MeshStandardMaterial({ color: 0x5a3a20, transparent: true, opacity: .8 }), false); jug.position.set(0, -.12, .12); coffee.add(jug); const led = M(new THREE.SphereGeometry(.025, 6, 4), new THREE.MeshBasicMaterial({ color: 0x220000 }), false); led.position.set(.1, .15, .16); coffee.add(led); coffee.userData.led = led; } coffee.position.set(-1.7, 1.18, -1.5); scene.add(coffee);
const iron = new THREE.Group(); { const b = rbox(.38, .14, .2, .05, lp(0x3f7fd8)); iron.add(b); const h = M(new THREE.TorusGeometry(.09, .03, 6, 12, Math.PI), lp(0x2a2c33)); h.position.y = .1; iron.add(h); const sole = M(new THREE.BoxGeometry(.38, .03, .2), new THREE.MeshStandardMaterial({ color: 0xc9d1dc, emissive: 0xff5a1a, emissiveIntensity: 0 }), false); sole.position.y = -.08; iron.add(sole); iron.userData.sole = sole; } iron.position.set(-.85, 1.05, -1.4); scene.add(iron);
// enchufes de pared (cara frontal con 3 hoyos)
const outTex = (() => { const t = canvasTex(128, 160), x = t.x; x.fillStyle = '#f4f4f0'; rrp(x, 0, 4, 4, 120, 152, 14); x.fill(); x.fillStyle = '#2a2a2a'; rrp(x, 0, 38, 50, 12, 34, 4); x.fill(); rrp(x, 0, 78, 50, 12, 34, 4); x.fill(); x.beginPath(); x.arc(64, 112, 10, Math.PI, 0); x.lineTo(74, 124); x.lineTo(54, 124); x.closePath(); x.fill(); t.tx.needsUpdate = true; return t.tx; })();
function outlet(x, y, z, ry = 0) { const o = M(new THREE.PlaneGeometry(.16, .2), new THREE.MeshStandardMaterial({ map: outTex }), false); o.position.set(x, y, z); o.rotation.y = ry; scene.add(o); return o; }
const outMain = outlet(-1.25, 1.15, -1.81), outA = outlet(-2.55, 1.6, -1.81), outB = outlet(-.6, 1.6, -1.81);
// regletas
function strip() { const g = new THREE.Group(); g.add(rbox(.62, .07, .16, .03, lp(0xf4f4f0))); for (let i = 0; i < 4; i++) { const s = M(new THREE.BoxGeometry(.08, .01, .06), lp(0x2a2a2a), false); s.position.set(-.21 + i * .14, .04, 0); g.add(s); } const led = M(new THREE.SphereGeometry(.022, 6, 4), new THREE.MeshBasicMaterial({ color: 0xff3b3b }), false); led.position.set(.28, .04, .05); g.add(led); g.userData.led = led; const glow = M(new THREE.BoxGeometry(.66, .1, .2), new THREE.MeshBasicMaterial({ color: 0xff5a1a, transparent: true, opacity: 0, depthWrite: false }), false); g.add(glow); g.userData.glow = glow; scene.add(g); return g; }
const strip1 = strip(); strip1.position.set(-1.45, .99, -1.15); const strip2 = strip(); strip2.position.set(-.55, .99, -1.0); strip2.rotation.y = .3;
// cables (curvas que se reconstruyen)
const cordM = lp(0x2a2a2a); const cords = [];
function cord(pts) { const c = new THREE.Mesh(new THREE.TubeGeometry(new THREE.CatmullRomCurve3(pts), 24, .015, 5), cordM); scene.add(c); cords.push(c); return c; }
const cMain = cord([V(-1.75, 1.0, -1.15), V(-1.6, .98, -1.6), V(-1.25, 1.08, -1.78)]);
function setCord(c, pts) { c.geometry.dispose(); c.geometry = new THREE.TubeGeometry(new THREE.CatmullRomCurve3(pts), 24, .015, 5); }
const cMicro = cord([V(-2.2, 1.0, -1.3), V(-1.9, .97, -1.2), V(-1.6, 1.0, -1.15)]), cCoffee = cord([V(-1.7, .98, -1.4), V(-1.5, .97, -1.25), V(-1.45, 1.0, -1.15)]), cIron = cord([V(-1.0, 1.0, -1.35), V(-1.2, .97, -1.2), V(-1.3, 1.0, -1.15)]);
// cable dentro de la pared (rayos X) hasta la caja
const wallCurve = new THREE.CatmullRomCurve3([V(-1.25, 1.12, -1.74), V(-1.25, 2.3, -1.74), V(-.5, 2.4, -1.74), V(.3, 2.3, -1.74), V(.3, 1.85, -1.74)]);
const wallWireM = new THREE.MeshStandardMaterial({ color: 0x3a3f4a, emissive: 0xff3a00, emissiveIntensity: 0 });
const wallWire = add(M(new THREE.TubeGeometry(wallCurve, 60, .035, 6), wallWireM, false));
const wallWin = add(M(new THREE.PlaneGeometry(2.0, 1.6), new THREE.MeshBasicMaterial({ color: 0x1a1d26, transparent: true, opacity: .55, depthWrite: false }), false)); wallWin.position.set(-.45, 1.75, -1.75);
const heatW = []; for (let i = 0; i < 6; i++) { const pts = []; for (let k = 0; k < 10; k++) pts.push(V(Math.sin(k * .9) * .06, k * .07, 0)); const m = add(M(new THREE.TubeGeometry(new THREE.CatmullRomCurve3(pts), 20, .015, 4), new THREE.MeshBasicMaterial({ color: 0xffb070, transparent: true, opacity: .8 }), false)); heatW.push(m); }
const flames = []; for (let i = 0; i < 8; i++) { const f = add(M(new THREE.ConeGeometry(.05, .16, 6), new THREE.MeshBasicMaterial({ color: i % 2 ? 0xffb020 : 0xff5a1a }), false)); flames.push(f); }
// caja de luz con pastillas
const panel = new THREE.Group(); panel.position.set(.32, 1.55, -1.78); scene.add(panel); panel.add(rbox(.62, .8, .1, .03, lp(0x9aa2b0)));
const pDoor = new THREE.Group(); pDoor.position.set(-.31, 0, .06); panel.add(pDoor); { const d = M(new THREE.BoxGeometry(.62, .8, .02), lp(0xb8c0cc)); d.position.x = .31; pDoor.add(d); }
const brk = []; for (let i = 0; i < 6; i++) { const b = new THREE.Group(); b.add(M(new THREE.BoxGeometry(.11, .22, .05), lp(0x2a2c33))); const lv = M(new THREE.BoxGeometry(.05, .08, .05), lp(0xf4f4f0)); lv.position.set(0, .04, .03); b.add(lv); b.userData.lv = lv; b.position.set(-.19 + (i % 3) * .19, i < 3 ? .17 : -.17, .06); panel.add(b); brk.push(b); }
const tripB = brk[1];
// pastilla en macro (lejos, se filma aparte)
const macro = new THREE.Group(); macro.position.set(30, 1.5, 0); scene.add(macro);
{ const shell = M(new THREE.BoxGeometry(2.2, 3.2, .3), new THREE.MeshStandardMaterial({ color: 0x2a2c33, transparent: true, opacity: .35, depthWrite: false }), false); macro.add(shell); const back = M(new THREE.BoxGeometry(2.2, 3.2, .05), lp(0x1d1f26)); back.position.z = -.2; macro.add(back); }
const bimA = M(new THREE.BoxGeometry(.12, 1.3, .1), new THREE.MeshStandardMaterial({ color: 0xc87a3a, emissive: 0xff3a00, emissiveIntensity: 0 }), false), bimB = M(new THREE.BoxGeometry(.12, 1.3, .1), new THREE.MeshStandardMaterial({ color: 0xc9d1dc, emissive: 0xff3a00, emissiveIntensity: 0 }), false);
const bimG = new THREE.Group(); bimG.position.set(-.5, -.9, .05); macro.add(bimG); bimA.position.set(-.06, .65, 0); bimB.position.set(.06, .65, 0); bimG.add(bimA, bimB);
const coil = new THREE.Group(); coil.position.set(.55, -.2, .05); macro.add(coil); for (let i = 0; i < 9; i++) { const r = M(new THREE.TorusGeometry(.22, .035, 6, 20), new THREE.MeshStandardMaterial({ color: 0xc87a3a, emissive: 0x2a6fff, emissiveIntensity: 0 }), false); r.rotation.x = Math.PI / 2; r.position.y = -.4 + i * .1; coil.add(r); }
const plunger = M(new THREE.CylinderGeometry(.1, .1, .9, 12), lp(0x9aa2b0)); plunger.position.set(.55, .1, .05); macro.add(plunger);
const latch = M(new THREE.BoxGeometry(1.3, .12, .1), lp(0xd5dce6)); latch.position.set(0, .75, .05); macro.add(latch);
const mLever = new THREE.Group(); mLever.position.set(0, 1.35, .05); macro.add(mLever); { const l = M(new THREE.BoxGeometry(.25, .7, .2), lp(0xf4f4f0)); l.position.y = .3; mLever.add(l); }
const wA = M(new THREE.CylinderGeometry(.06, .06, 1.4, 8), lp(0xd94a4a)), wB = M(new THREE.CylinderGeometry(.06, .06, 1.4, 8), lp(0x2a2a2a)); wA.rotation.z = Math.PI / 2; wB.rotation.z = Math.PI / 2; macro.add(wA, wB);
const sparks = []; for (let i = 0; i < 24; i++) { const s = M(new THREE.SphereGeometry(.03, 5, 4), new THREE.MeshBasicMaterial({ color: 0xffe066 }), false); macro.add(s); sparks.push(s); }
const amps = new THREE.InstancedMesh(new THREE.SphereGeometry(.05, 6, 4), new THREE.MeshBasicMaterial({ color: 0xffd23a }), 30); amps.frustumCulled = false; scene.add(amps);
// baño: lavabo, secadora, enchufe diferencial
add(M(new THREE.BoxGeometry(1.0, .8, .55), lp(0xf4f4f0))).position.set(2.0, .4, -1.5);
const basin = add(M(new THREE.CylinderGeometry(.32, .26, .14, 20), lp(0xffffff))); basin.position.set(2.0, .86, -1.45);
const bWater = add(M(new THREE.CylinderGeometry(.28, .28, .02, 20), new THREE.MeshStandardMaterial({ color: 0x5ec8ff, transparent: true, opacity: .8, emissive: 0x1a6fb0, emissiveIntensity: .3 }), false)); bWater.position.set(2.0, .9, -1.45);
add(M(new THREE.BoxGeometry(.7, .9, .03), new THREE.MeshStandardMaterial({ color: 0xbfe6ff, metalness: .6, roughness: .1 }), false)).position.set(2.0, 1.75, -1.79);
const dryer = new THREE.Group(); { const b = M(new THREE.CylinderGeometry(.08, .1, .32, 12), lp(0xe0648a)); b.rotation.z = Math.PI / 2; dryer.add(b); const h = M(new THREE.CylinderGeometry(.045, .045, .2, 8), lp(0xe0648a)); h.position.set(.05, -.14, 0); dryer.add(h); } scene.add(dryer);
const outBath = outlet(2.62, 1.15, -1.765);
const gfci = new THREE.Group(); gfci.position.set(2.76, 1.15, -1.755); scene.add(gfci); { const t = M(new THREE.BoxGeometry(.05, .03, .02), lp(0x2a2a2a)); t.position.set(0, .035, .01); const r = M(new THREE.BoxGeometry(.05, .03, .02), new THREE.MeshBasicMaterial({ color: 0xd94a4a })); r.position.set(0, -.005, .01); gfci.add(t, r); gfci.userData.r = r; }
const dCord = add(new THREE.Mesh(new THREE.TubeGeometry(new THREE.CatmullRomCurve3([V(2.0, 1.0, -1.3), V(2.4, 1.05, -1.5), V(2.62, 1.12, -1.78)]), 20, .014, 5), cordM));
const danger = new THREE.InstancedMesh(new THREE.SphereGeometry(.04, 6, 4), new THREE.MeshBasicMaterial({ color: 0xff3b3b }), 24); danger.frustumCulled = false; scene.add(danger);
// tierra física: cable verde hasta la varilla en el terreno
const gCurve = new THREE.CatmullRomCurve3([V(2.62, 1.08, -1.76), V(2.9, .4, -1.76), V(3.2, .05, -1.6), V(3.45, -.1, 0), V(3.6, -.15, 2.5), V(3.6, -.25, GZ + .05), V(3.6, -.6, GZ + .05)]);
const gWire = add(M(new THREE.TubeGeometry(gCurve, 60, .03, 6), lp(0x35b84a), false));
const rod = add(M(new THREE.CylinderGeometry(.05, .05, 2.4, 8), lp(0xd18a4a, { metalness: .5, roughness: .4 }))); rod.position.set(3.6, -1.8, GZ + .06);
const gFlow = new THREE.InstancedMesh(new THREE.SphereGeometry(.05, 6, 4), new THREE.MeshBasicMaterial({ color: 0x7dff9a }), 20); gFlow.frustumCulled = false; scene.add(gFlow);
// personaje
const owner = makeChar({ shirt: 0xff8a3d, pants: 0x2b3350 }); scene.add(owner.root);
const LB = (n, c) => { const s = arcLabel(n, c ? { color: c } : {}); scene.add(s); return s; };
const LBL = { pastilla: LB('PASTILLA'), cable: LB('CABLE CALIENTE', '#ff8a4a'), lamina: LB('LÁMINA BIMETÁLICA'), corto: LB('CORTOCIRCUITO', '#ff6a5a'), iman: LB('ELECTROIMÁN'), regleta: LB('REGLETA SOBRECARGADA', '#ff8a4a'), pared: LB('DIRECTO A LA PARED', '#7be36b'), dif: LB('INTERRUPTOR DIFERENCIAL'), tierra: LB('TIERRA FÍSICA', '#7be36b'), hoyo: LB('3er HOYO = TIERRA') };

const macroL = new THREE.PointLight(0xffffff, 0, 10, 1.2); macroL.position.set(30.5, 2.5, 3); scene.add(macroL);
const groundL = new THREE.PointLight(0xfff0d8, 0, 9, 1.2); groundL.position.set(4.6, .2, 6.5); scene.add(groundL);
const M_OK = lp(0x1aa86a), M_BAD = lp(0xd94a4a), M_N = lp(0x2a2c33);

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
const K = { luz: T('luz', 1), plancha: T('plancha', 1), micro: T('microondas', 1), cafetera: T('cafetera'), apagado: T('apagado'), caja: T('caja'), abajo: T('abajo'), salvar: T('salvar'), calienta: T('calienta', 1), incendio: T('incendio'), laminita: T('laminita'), dobla: T('dobla'), corta1: T('corta', 1), instante: T('instante'), corto: T('cortocircuito'), tocan: T('tocan'), dispara: T('dispara'), iman: T('imán'), golpe: T('golpe'), regleta2: T('regleta', 2), miles: T('miles'), sobrec: T('sobrecargarlas'), otra: T('otra'), directo: T('directo'), bano: T('baño'), secadora: T('secadora'), lavabo: T('lavabo'), ti1: T('ti', 1), especial: T('especial'), dif: T('diferencial'), corta2: T('corta', 2), hoyo: T('hoyo'), fisica: T('física'), seguro: T('seguro'), felic: T('felicidades'), regleta3: T('regleta', 4), cuantas: T('cuántas') };
const SHOTS = [
  [0, 4.03, [2.2, 3.4, 10.5], [.4, 2.5, 7.6], [-.6, 1.3, -.6], [-.8, 1.2, -.8]],
  [4.03, 10.4, [-1.4, 1.95, 2.8], [-1.45, 1.8, 2.2], [-1.6, 1.15, -1.4], [-1.6, 1.15, -1.4]],
  [10.4, 17.6, [.65, 1.7, .5], [.45, 1.62, .1], [.32, 1.55, -1.8], [.32, 1.55, -1.8]],
  [17.6, 29.4, [-.4, 1.85, 2.9], [-.4, 1.85, 2.2], [-.45, 1.8, -1.75], [-.45, 1.8, -1.75]],
  [29.4, 50.0, [30.7, 1.5, 5.6], [30.3, 1.3, 4.9], [30, 1.15, 0], [30, 1.15, 0]],
  [50.0, 64.3, [-.85, 1.5, .7], [-.95, 1.38, .25], [-1.05, 1.0, -1.1], [-1.05, 1.0, -1.1]],
  [64.3, 69.0, [-1.5, 1.8, 1.6], [-1.5, 1.7, 1.2], [-1.5, 1.3, -1.6], [-1.5, 1.3, -1.6]],
  [69.0, 79.8, [2.75, 1.6, 3.0], [2.65, 1.5, 2.5], [1.55, 1.0, -1.2], [1.55, 1.0, -1.2]],
  [79.8, 89.4, [2.75, 1.3, -.55], [2.68, 1.25, -.85], [2.62, 1.15, -1.8], [2.62, 1.15, -1.8]],
  [89.4, K.fisica - .3, [2.68, 1.22, -.85], [2.65, 1.2, -1.1], [2.62, 1.15, -1.8], [2.62, 1.15, -1.8]],
  [K.fisica - .3, 96.3, [6.5, .9, 9.5], [5.8, .6, 8.6], [3.2, -.5, 2.0], [3.3, -.6, 2.2]],
  [96.3, K.regleta3 - .2, [6.5, 3.6, 11.5], [-3, 3.3, 10.5], [0, 1.2, 0], [0, 1.2, 0]],
  [K.regleta3 - .2, 106, [-1.15, 1.5, .55], [-1.25, 1.4, .25], [-1.45, 1.0, -1.15], [-1.45, 1.0, -1.15]],
];
function camAt(t) { const s = SHOTS.find(s => t >= s[0] && t < s[1]) || SHOTS[SHOTS.length - 1]; const k = eio(clamp((t - s[0]) / (s[1] - s[0]))); cam.position.copy(V(...s[2]).lerp(V(...s[3]), k)); cam.fov = 50; cam.updateProjectionMatrix(); cam.lookAt(V(...s[4]).lerp(V(...s[5]), k)); }
const tmp = new THREE.Object3D();
function powerK(t) { if (t < K.luz) return true; if (t < 4.03) return false; if (t < K.apagado) return true; if (t < K.salvar + .5) return false; return true; }
function powerB(t) { return !(t > K.corta2 && t < 89.4); }
function animWorld(t) {
  const sky = new THREE.Color(0x0c1430).lerp(new THREE.Color(0x1d2a5a), P(t, 96, 3)); scene.background = sky; scene.fog.color.copy(sky); scene.fog.near = 30; scene.fog.far = 80;
  hemi.intensity = .45; hemi.color.set(0x7d8ccf); sunL.intensity = .7; sunL.color.set(0x9fb4ff); sunL.position.set(-8, 18, 12); sunL.target.position.set(0, 0, 0);
  sun.visible = false; sunHalo.material.opacity = 0; moon.visible = true; moon.position.set(-14, 22, -38); stars.material.opacity = 1;
  clouds.forEach(c => { c.visible = false; });
  const pk = powerK(t), pb = powerB(t); macroL.intensity = t > 29.4 && t < 50 ? 18 : 0; groundL.intensity = t > K.fisica - .4 && t < 96.3 ? 14 : 0;
  lightK.intensity = pk ? 9 : 0; lampK.material.color.set(pk ? 0xfff1c0 : 0x333333); lightB.intensity = pb ? 7 : 0; lampB.material.color.set(pb ? 0xfff1c0 : 0x333333);
  // aparatos encendidos
  const onA = pk && t > 4.03 && t < K.apagado;
  iron.userData.sole.material.emissiveIntensity = (onA && t > K.plancha) ? .8 : 0; micro.userData.door.material.emissiveIntensity = (onA && t > K.micro) || (pk && t > 96) ? .9 : 0; coffee.userData.led.material.color.set((onA && t > K.cafetera) || (pk && t > 96) ? 0xff3b3b : 0x220000);
  // caja de luz
  pDoor.rotation.y = -1.6 * eout(P(t, K.caja, .6)) * (t < 17.6 ? 1 : 0);
  tripB.userData.lv.position.y = (t > K.luz && t < K.salvar + .5) ? -.04 : .04; tripB.children[0].material = t > K.abajo - .2 && t < 17.6 ? (t > K.salvar ? M_OK : M_BAD) : M_N;
  // cable dentro de la pared
  const hot = P(t, K.calienta, 2.5) * (1 - P(t, 29.4, .2)); wallWireM.emissiveIntensity = hot * 1.8; wallWin.visible = t > 17.6 && t < 29.4; wallWire.visible = wallWin.visible; gWire.visible = t > K.fisica - .35;
  heatW.forEach((h, i) => { const u = (t * .7 + i / 6) % 1; h.visible = hot > .3 && t < 29.4; const p = wallCurve.getPointAt(.2 + i * .12); h.position.set(p.x, p.y + .05 + u * .25, p.z + .05); h.material.opacity = .8 * (1 - u); });
  flames.forEach((f, i) => { const on = t > K.incendio - .2 && t < 29.4; f.visible = on; const p = wallCurve.getPointAt(.45 + (i % 4) * .05); f.position.set(p.x + Math.sin(i) * .05, p.y + .1 + Math.abs(Math.sin(t * 9 + i)) * .1, p.z + .06); f.scale.setScalar(Math.max(.001, eback(P(t, K.incendio - .2 + i * .05, .3)) * (1 + .3 * Math.sin(t * 12 + i)))); });
  // macro de la pastilla: lámina bimetálica y cortocircuito
  const bh = P(t, K.laminita, 1.5) * (1 - P(t, K.instante, .3)); bimA.material.emissiveIntensity = bimB.material.emissiveIntensity = bh * 1.5; bimG.rotation.z = -.4 * eout(P(t, K.dobla - .3, .8)) * (1 - P(t, K.instante, .3));
  const trip1 = t > K.corta1 && t < K.instante, trip2 = t > K.golpe;
  latch.position.x = (trip1 || trip2) ? .35 : 0; mLever.rotation.z = (trip1 || trip2) ? -.9 : .5;
  const touch = eio(P(t, K.tocan - .3, .5)); wA.position.set(-.1, -.3 + .15 * (1 - touch), .12); wB.position.set(.1, -.3 - .15 * (1 - touch), .12); wA.visible = wB.visible = t > K.instante;
  sparks.forEach((s, i) => { const ph = ((t - K.tocan) * 3 + i * .07) % 1; s.visible = t > K.tocan && t < K.golpe + .3; const a = i * 2.4; s.position.set(Math.cos(a) * ph * .7, -.3 + Math.sin(a) * ph * .6 + ph * .2, .2); });
  const coilOn = P(t, K.iman - .2, .3); coil.children.forEach(r => r.material.emissiveIntensity = coilOn * 1.6 * (t < 50 ? 1 : 0)); plunger.position.y = .1 - .35 * eout(P(t, K.iman, .4));
  amps.visible = t > K.dispara - .2 && t < 50; for (let i = 0; i < 30; i++) { const u = (t * 1.6 + i / 30) % 1; tmp.position.set(30 + lerp(-1.2, .55, u), lerp(-.3, -.2, u) + Math.sin(u * 20) * .03, .25); tmp.scale.setScalar(amps.visible ? 1 : .001); tmp.updateMatrix(); amps.setMatrixAt(i, tmp.matrix); } amps.instanceMatrix.needsUpdate = true;
  // regletas
  const over = P(t, K.regleta2, 1.5) * (1 - P(t, K.directo + .6, .6)); strip1.userData.glow.material.opacity = .45 * over * (.8 + .2 * Math.sin(t * 10)); strip1.userData.led.material.color.set(pk ? 0xff3b3b : 0x330000);
  strip2.visible = t > K.otra - .3 && t < K.directo + .8; strip2.userData.glow.material.opacity = .45 * over;
  const toWall = eio(P(t, K.directo, .8));
  setCord(cMicro, [V(-2.2, 1.0, -1.3), V(lerp(-1.9, -2.4, toWall), lerp(.97, 1.3, toWall), lerp(-1.2, -1.7, toWall)), V(lerp(-1.6, -2.55, toWall), lerp(1.0, 1.58, toWall), lerp(-1.15, -1.79, toWall))]);
  setCord(cIron, [V(-1.0, 1.0, -1.35), V(lerp(-1.2, -.75, toWall), lerp(.97, 1.3, toWall), lerp(-1.2, -1.7, toWall)), V(lerp(-1.3, -.6, toWall), lerp(1.0, 1.58, toWall), lerp(-1.15, -1.79, toWall))]);
  // baño: secadora cae al lavabo
  const fall = eio(P(t, K.lavabo - .2, .5)); dryer.position.set(lerp(2.42, 2.02, fall), lerp(1.0, .92, fall) + Math.sin(fall * Math.PI) * .15, lerp(-1.45, -1.45, fall)); dryer.rotation.z = lerp(0, 1.2, fall);
  const zap = t > K.lavabo + .2 && t < K.corta2; bWater.material.emissive.set(zap ? 0xffd23a : 0x1a6fb0); bWater.material.emissiveIntensity = zap ? .6 + .4 * Math.sin(t * 40) : .3;
  danger.visible = t > K.ti1 - .5 && t < K.corta2; for (let i = 0; i < 24; i++) { const u = (t * .9 + i / 24) % 1; tmp.position.set(lerp(2.0, 1.55, u), lerp(.92, 1.0, u) + Math.sin(u * 12) * .05, lerp(-1.45, -.75, u)); tmp.scale.setScalar(danger.visible ? 1 : .001); tmp.updateMatrix(); danger.setMatrixAt(i, tmp.matrix); } danger.instanceMatrix.needsUpdate = true;
  gfci.userData.r.position.z = t > K.corta2 && t < 89.4 ? .025 : .01;
  // tierra física
  gFlow.visible = t > K.fisica - .2 && t < 96.3; for (let i = 0; i < 20; i++) { const u = (t * .4 + i / 20) % 1; tmp.position.copy(gCurve.getPointAt(u)); tmp.scale.setScalar(gFlow.visible ? 1 : .001); tmp.updateMatrix(); gFlow.setMatrixAt(i, tmp.matrix); } gFlow.instanceMatrix.needsUpdate = true;
  // personaje
  if (t > 69 && t < 96.3) { owner.root.position.set(1.05, 0, -1.05); owner.root.rotation.y = 1.4; const scared = t > K.lavabo && t < K.corta2 + .4; pose(owner, { armR: scared ? [-1.4, -.4, -.8] : [-.2, -.15, -.3], armL: scared ? [-1.4, .4, -.8] : [-.2, .15, -.3], spineRx: scared ? -.1 : 0, emo: scared ? 'surprised' : t > K.corta2 ? 'happy' : 'neutral', look: [.5, -.3] }, t); }
  else { const away = (t > 17.6 && t < 29.4) || (t > 50 && t < 69); owner.root.position.set(away ? -2.9 : -.35, 0, away ? .6 : -.35); owner.root.rotation.y = -2.6; const dark = !pk; pose(owner, { armR: t < K.luz ? [-1.0, -.2, -.8] : [-.2, -.15, -.3], armL: [-.2, .15, -.3], emo: dark ? 'worried' : t > 96 ? 'happy' : 'neutral', look: [dark ? Math.sin(t * 2) : 0, 0] }, t); }
  // etiquetas
  OVL.length = 0; const L = (s, at, end, pos, color) => { s.visible = false; if (t >= at && t < end) OVL.push({ text: s.userData.text, at, end, pos: pos.clone(), color: color || s.userData.color }); };
  L(LBL.pastilla, K.abajo, 17.6, V(.32, 2.05, -1.75)); L(LBL.cable, K.calienta, 29.4, V(-.45, 2.6, -1.75)); L(LBL.lamina, K.laminita, K.instante, V(29.5, 2.2, 0));
  L(LBL.corto, K.corto, K.iman - .1, V(30, 2.3, 0)); L(LBL.iman, K.iman, 50, V(30.55, 2.3, 0)); L(LBL.regleta, K.sobrec - .2, 64.3, V(-1.0, 1.45, -1.1)); L(LBL.pared, K.directo, 69, V(-1.5, 2.15, -1.7));
  L(LBL.dif, K.dif - .2, 89.4, V(2.62, 1.45, -1.8)); L(LBL.hoyo, K.hoyo, K.fisica - .3, V(2.62, 1.38, -1.8)); L(LBL.tierra, K.fisica - .2, 96.3, V(3.6, .6, GZ));
}
const KEYW = new Set(['luz', 'regleta', 'pastilla', 'salvar', 'incendio', 'laminita', 'corta', 'cortocircuito', 'imán', 'miles', 'sobrecargarlas', 'pared', 'agua', 'diferencial', 'tierra', 'física', 'felicidades', 'quema']);

function caption(t) {
  let i = -1; for (let k = 0; k < WORDS.length; k++) if (t >= WORDS[k].s - .03) i = k; if (i < 0) return;
  const w = WORDS[i], nx = WORDS[i + 1]; const end = nx ? Math.min(nx.s - .03, w.e + .5) : w.e + .6; if (t > end) return;
  const raw = w.w.replace(/[¿?¡!.,:…]/g, ''); const word = raw.charAt(0).toUpperCase() + raw.slice(1); const key = KEYW.has(norm(raw));
  const k = eback(P(t, w.s - .03, .14)); g.save(); g.translate(540, 1020); g.scale(lerp(.85, 1, k), lerp(.85, 1, k));
  g.font = '900 74px M'; g.textAlign = 'center'; g.textBaseline = 'middle'; g.lineJoin = 'round'; g.lineWidth = 14; g.strokeStyle = 'rgba(20,18,30,.9)'; g.shadowColor = 'rgba(0,0,0,.45)'; g.shadowBlur = 16; g.shadowOffsetY = 4; g.strokeText(word, 0, 0); g.shadowBlur = 0; g.shadowOffsetY = 0; g.fillStyle = key ? '#ffcc33' : '#ffffff'; g.fillText(word, 0, 0); g.restore();
}
// ---------- marca de agua y cierre SÍGUEME ----------
function watermark(t) {
  g.save(); g.globalAlpha = .62 * (1 - P(t, CTA_ST, .3)); g.font = '800 38px M'; const w = g.measureText(BRAND).width;
  const x = W - 46 - w - 70, y = 128; g.fillStyle = 'rgba(10,14,28,.45)'; rrp(g, 0, x - 14, y - 32, w + 98, 64, 32); g.fill();
  g.save(); g.beginPath(); g.arc(x + 22, y, 24, 0, 6.29); g.clip(); g.drawImage(MASCOT, x - 2, y - 24, 48, 48); g.restore();
  g.fillStyle = '#ffffff'; g.textBaseline = 'middle'; g.fillText(BRAND, x + 56, y + 2); g.restore();
}
function followCTA(t) {
  const st = CTA_ST; if (t < st) return; const a = P(t, st, .3);
  g.save(); g.fillStyle = `rgba(6,10,24,${.72 * a})`; g.fillRect(0, 0, W, H);
  const k = eback(P(t, st + .05, .45)); g.translate(540, 820); g.scale(k, k);
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
  const vg = g.createRadialGradient(540, 960, 650, 540, 960, 1300); vg.addColorStop(0, 'rgba(0,0,0,0)'); vg.addColorStop(1, 'rgba(0,0,0,.28)'); g.fillStyle = vg; g.fillRect(0, 0, W, H);
  overlayLabels(t); if (t < CTA_ST) caption(t); watermark(t); followCTA(t);
  const fo = P(t, END - .3, .3); if (fo > 0) { g.fillStyle = `rgba(0,0,0,${fo})`; g.fillRect(0, 0, W, H); }
}
window.renderAt = renderAt; window.END = END;
window.frameJPG = (t, q = .92) => { renderAt(t); return out.toDataURL('image/jpeg', q).split(',')[1]; };
window.READY = true;
