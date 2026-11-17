// Reel 9:16 3D (Estilo B: construcción en corte) — Salitre en la pared
import * as THREE from 'three';
import { EffectComposer } from 'three/addons/postprocessing/EffectComposer.js';
import { RenderPass } from 'three/addons/postprocessing/RenderPass.js';
import { UnrealBloomPass } from 'three/addons/postprocessing/UnrealBloomPass.js';
import { OutputPass } from 'three/addons/postprocessing/OutputPass.js';

const W = 1080, H = 1920, END = 108.7;   // END = última palabra + 3,7 s (cierre)
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
// ---------- mundo: casa de un piso en corte (salitre) ----------
const GZ = 1.98;
add(M(new THREE.BoxGeometry(50.1, .25, 24.1), lp(0x5fae4a))).position.set(0, -.1, GZ - 12);
const soilM = new THREE.MeshStandardMaterial({ color: 0x8a5a34, roughness: .9, flatShading: true, emissive: 0x000000, emissiveIntensity: 0 });
{ const b = add(M(new THREE.BoxGeometry(50, 3.4, 24), soilM)); b.position.set(0, -1.92, GZ - 12); const r = add(M(new THREE.BoxGeometry(50, 3, 24), lp(0x6c717c))); r.position.set(0, -5.1, GZ - 12); }
for (let i = 0; i < 30; i++) { const r = add(M(new THREE.DodecahedronGeometry(.08 + rnd() * .15, 0), lp(0x6a5a4a))); const x = (rnd() - .5) * 24; r.position.set(Math.abs(Math.abs(x) - 3.3) < .7 ? x + 1.6 : x, -1.3 - rnd() * 2.2, GZ + .02); }
for (let i = -12; i <= 12; i++) { const p = add(M(new THREE.BoxGeometry(.16, 1, .16), lp(0xdcdcd6))); p.position.set(i * 1.6, .5, -7); }
function bgHouse(x, z, c, two) { const h = new THREE.Group(); const hh = two ? 5.2 : 2.6; const b = M(new THREE.BoxGeometry(4, hh, 3.4), lp(c)); b.position.y = hh / 2; h.add(b); const rf = M(new THREE.BoxGeometry(4.2, .25, 3.6), lp(0x9a9ea6)); rf.position.y = hh + .1; h.add(rf); for (const wx of [-1, 1]) for (let f = 0; f < (two ? 2 : 1); f++) { const w = M(new THREE.BoxGeometry(.7, .7, .05), lp(0x9fd3e6)); w.position.set(wx, 1.6 + f * 2.6, 1.72); h.add(w); } h.position.set(x, 0, z); scene.add(h); }
bgHouse(-10, -11, 0xe9d7b5, 1); bgHouse(9, -12, 0xf3e2c4); bgHouse(14, -7, 0xe0cdb0, 1); bgHouse(-15, -6, 0xf0dcc0);
for (let i = 0; i < 6; i++) { const tr = new THREE.Group(); const tk = M(new THREE.CylinderGeometry(.12, .16, 1.2, 6), lp(0x7a5230)); tk.position.y = .6; const cr = M(new THREE.IcosahedronGeometry(.9, 0), lp(0x4f9a3e)); cr.position.y = 1.7; tr.add(tk, cr); tr.position.set([-7, -5.5, 10.5, 7.5, -12, 12][i], 0, [-4, -9, -4.5, -9, -3, -3][i]); scene.add(tr); }
const W1 = lp(0xf2e3c8), W2 = lp(0xfff4e0);
// cimientos + cadena de desplante + barrera
const footM = lp(0x9a9c9f);
const cadM = new THREE.MeshStandardMaterial({ color: 0xa9adb3, roughness: .85, flatShading: true, emissive: 0xf6b445, emissiveIntensity: 0 });
const barM = new THREE.MeshStandardMaterial({ color: 0x15161a, roughness: .3, transparent: true, emissive: 0x35d39a, emissiveIntensity: 0 });
const barrier = [];
for (const x of [-3.3, 3.3]) {
  add(M(new THREE.BoxGeometry(.75, .25, 3.96), footM)).position.set(x, -.85, .02);
  add(M(new THREE.BoxGeometry(.25, .72, 3.96), footM)).position.set(x, -.4, .02);
  add(M(new THREE.BoxGeometry(.32, .2, 3.96), cadM)).position.set(x, .05, .02);
  const b = add(M(new THREE.BoxGeometry(.36, .04, 3.97), barM)); b.position.set(x, .17, .02); barrier.push(b);
}
add(M(new THREE.BoxGeometry(6.6, .15, 3.8), lp(0xc8a27a))).position.set(0, .07, 0);
add(M(new THREE.BoxGeometry(6.6, 2.55, .16), W2)).position.set(0, 1.465, -1.9);
for (const x of [-3.3, 3.3]) add(M(new THREE.BoxGeometry(.16, 2.55, 3.96), W1)).position.set(x, 1.465, .02);
add(M(new THREE.BoxGeometry(6.9, .3, 4.1), lp(0x8f939b))).position.set(0, 2.88, 0);
// muebles: sillón y mesita (lado derecho)
add(M(new THREE.BoxGeometry(1.6, .45, .8), lp(0x4f7fd8))).position.set(2.2, .38, -.2);
add(M(new THREE.BoxGeometry(.25, .55, .8), lp(0x3f6cc0))).position.set(3.0, .7, -.2);
add(M(new THREE.BoxGeometry(.7, .06, .5), lp(0x8a6a48))).position.set(2.2, .48, .9);
// ---------- textura dinámica del muro del fondo ----------
const WT = canvasTex(1024, 406); const PXM = 406 / 2.55;
const wallFace = add(M(new THREE.PlaneGeometry(6.44, 2.55), new THREE.MeshStandardMaterial({ map: WT.tx, roughness: .85 }), false)); wallFace.position.set(0, 1.425, -1.815);
const BL = Array.from({ length: 240 }, () => ({ x: rnd(), h: Math.pow(rnd(), .8), r: .02 + rnd() * .05, p: rnd(), q: rnd() }));
const py = hm => 406 - hm * PXM;
function bricks(x, X0, X1, H0, H1, dark) {
  x.save(); x.beginPath(); x.rect(X0, py(H1), X1 - X0, py(H0) - py(H1)); x.clip(); x.fillStyle = '#cdbfa6'; x.fillRect(X0, py(H1), X1 - X0, py(H0) - py(H1));
  for (let r = 0; r < 16; r++) for (let c = -1; c < 22; c++) { const off = r % 2 ? 26 : 0; x.fillStyle = ['#b85a3c', '#c4643f', '#ab5236'][(r * 3 + c + 9) % 3]; x.fillRect(c * 52 + off + 2, 406 - (r + 1) * 22 + 2, 48, 18); }
  if (dark > 0) { x.fillStyle = `rgba(30,40,70,${.45 * dark})`; x.fillRect(X0, py(H1), X1 - X0, py(H0) - py(H1)); }
  x.restore();
}
function drawWall(s) {
  const x = WT.x, Wd = 1024; x.clearRect(0, 0, Wd, 406);
  x.fillStyle = '#d9d0c0'; x.fillRect(0, 0, Wd, 406);
  x.fillStyle = s.col; x.fillRect(0, 0, Wd * s.cover, 406);
  if (s.cover < 1 && s.cover > 0) { x.fillStyle = 'rgba(255,255,255,.35)'; x.fillRect(Wd * s.cover - 10, 0, 10, 406); }
  // salitre: neblina + manchas + desprendimientos
  if (s.sk > 0 && s.top > s.from) {
    const y0 = py(s.from), y1 = py(s.top); const gr = x.createLinearGradient(0, y0, 0, y1); gr.addColorStop(0, `rgba(255,255,255,${.7 * s.sk})`); gr.addColorStop(.7, `rgba(250,250,245,${.45 * s.sk})`); gr.addColorStop(1, 'rgba(255,255,255,0)'); x.fillStyle = gr; x.fillRect(0, y1, Wd, y0 - y1);
    for (const b of BL) { const hm = s.from + b.h * (s.top - s.from); x.globalAlpha = s.sk * (.5 + .5 * b.p); x.fillStyle = '#ffffff'; x.beginPath(); x.arc(b.x * Wd, py(hm), b.r * PXM * (1 + b.q), 0, 6.29); x.fill(); }
    x.globalAlpha = 1;
    for (const b of BL) { if (b.q > s.peel * .55) continue; const hm = s.from + b.h * (s.top - s.from) * .9, cx = b.x * Wd, cy = py(hm), R = b.r * PXM * 1.6;
      x.fillStyle = '#c9b9a0'; x.strokeStyle = 'rgba(80,60,40,.8)'; x.lineWidth = 2; x.beginPath(); for (let k = 0; k < 7; k++) { const a = k / 7 * 6.283, rr = R * (.7 + .5 * Math.abs(Math.sin(k * 3.1 + b.p * 9))); x.lineTo(cx + Math.cos(a) * rr, cy + Math.sin(a) * rr * .8); } x.closePath(); x.fill(); x.stroke(); }
  }
  // yeso encima
  if (s.yk > 0) { const Y = py(1.15); x.fillStyle = `rgba(246,244,238,${s.yk})`; x.fillRect(0, Y, Wd * Math.min(1, s.yk * 1.3), 406 - Y);
    if (s.yb > 0) for (const b of BL) { if (b.h > .9) continue; const cx = b.x * Wd, cy = py(b.h * 1.0 + .05), R = b.r * PXM * 1.8 * s.yb; x.fillStyle = 'rgba(200,196,186,.9)'; x.beginPath(); x.arc(cx + 3, cy + 3, R, 0, 6.29); x.fill(); x.fillStyle = '#fbfaf6'; x.beginPath(); x.arc(cx, cy, R, 0, 6.29); x.fill(); }
    if (s.yp > 0) for (const b of BL) { if (b.q > s.yp * .7 || b.h > .9) continue; const cx = b.x * Wd, cy = py(b.h * 1.0 + .05); x.fillStyle = '#8f8270'; x.beginPath(); x.arc(cx, cy, b.r * PXM * 2.2, 0, 6.29); x.fill(); } }
  // pintura "impermeable" abajo
  if (s.seal > 0) { const Y = py(.9); x.fillStyle = '#d9784d'; x.fillRect(0, Y, Wd * s.seal, 406 - Y); x.fillStyle = 'rgba(255,255,255,.25)'; x.fillRect(0, Y + 14, Wd * s.seal, 10); }
  // reparación: ladrillo expuesto, secado, antisalitre, mortero
  const RB = 1.25;
  if (s.ex > 0) bricks(x, 0, Wd * s.ex, 0, RB, s.wet);
  if (s.an > 0) { x.fillStyle = 'rgba(53,211,154,.38)'; x.fillRect(0, py(RB), Wd * s.an, py(0) - py(RB)); }
  if (s.mo > 0) { x.fillStyle = '#b4b1aa'; x.fillRect(0, py(RB), Wd * s.mo, py(0) - py(RB)); x.strokeStyle = 'rgba(255,255,255,.18)'; x.lineWidth = 3; for (let i = 0; i < 14; i++) { x.beginPath(); x.arc(i * 80 + 30, py(.6), 60, 3.6, 5.8); x.stroke(); } }
  if (s.holes > 0) { const n = Math.floor(s.holes * 30); for (let i = 0; i < n; i++) { const cx = 20 + i * 33, cy = py(.22); x.fillStyle = '#2a2420'; x.beginPath(); x.arc(cx, cy, 6, 0, 6.29); x.fill(); } if (s.holes >= 1) { x.fillStyle = `rgba(53,211,154,${s.glowL})`; x.fillRect(0, py(.22) - 5, Wd, 10); } }
  if (s.stain > 0) { const gr = x.createRadialGradient(150, 0, 10, 150, 0, 150 * s.stain); gr.addColorStop(0, 'rgba(120,90,50,.55)'); gr.addColorStop(.85, 'rgba(120,90,50,.35)'); gr.addColorStop(1, 'rgba(90,60,30,0)'); x.fillStyle = gr; x.fillRect(0, 0, 330, 200); }
  if (s.cover2 > 0) { x.fillStyle = '#f6b98f'; x.fillRect(0, 0, Wd * s.cover2, 406); if (s.cover2 < 1) { x.fillStyle = 'rgba(255,255,255,.4)'; x.fillRect(Wd * s.cover2 - 10, 0, 10, 406); } }
  if (s.band > 0) { x.save(); x.strokeStyle = `rgba(246,180,69,${s.band})`; x.lineWidth = 8; x.setLineDash([26, 16]); x.strokeRect(8, py(1.05), Wd - 16, py(0) - py(1.05) - 6); x.restore(); }
  WT.tx.needsUpdate = true;
}
// ---------- utilería ----------
const roller = new THREE.Group(); { const h = M(new THREE.CylinderGeometry(.018, .018, .4, 6), lp(0x50555f)); h.position.y = -.2; const r = M(new THREE.CylinderGeometry(.07, .07, .32, 12), lp(0xf2a97e)); r.rotation.z = Math.PI / 2; r.position.y = -.42; roller.add(h, r); roller.userData.r = r; }
const scraper = new THREE.Group(); { const h = M(new THREE.CylinderGeometry(.025, .025, .16, 6), lp(0x8a6a48)); h.position.y = -.08; const b = M(new THREE.BoxGeometry(.18, .14, .012), lp(0xb9c0d0, { metalness: .5 })); b.position.y = -.22; scraper.add(h, b); }
const drill = new THREE.Group(); { const b = M(new THREE.BoxGeometry(.12, .14, .3), lp(0x2c8f5a)); b.position.set(0, -.05, .1); const g2 = M(new THREE.BoxGeometry(.07, .18, .08), lp(0x1d1f25)); g2.position.set(0, -.14, 0); const bit = M(new THREE.CylinderGeometry(.012, .012, .22, 6), lp(0xb9c0d0, { metalness: .6 })); bit.rotation.x = Math.PI / 2; bit.position.set(0, -.04, .36); drill.add(b, g2, bit); }
const fan = add(new THREE.Group()); { const base = M(new THREE.CylinderGeometry(.22, .25, .06, 16), lp(0xeef1f7)); base.position.y = .03; const post = M(new THREE.CylinderGeometry(.03, .03, .8, 8), lp(0xeef1f7)); post.position.y = .43; const head = new THREE.Group(); head.position.y = .9; const hub = M(new THREE.SphereGeometry(.07, 10, 8), lp(0x3d6bff)); head.add(hub); const bl = new THREE.Group(); for (let i = 0; i < 3; i++) { const b = M(new THREE.BoxGeometry(.1, .3, .015), lp(0x6cc4ff)); b.position.y = .17; const pv = new THREE.Group(); pv.rotation.z = i * 2.094; pv.add(b); bl.add(pv); } bl.position.z = .06; head.add(bl); const cage = M(new THREE.TorusGeometry(.36, .012, 6, 30), lp(0xb9c0d0)); cage.position.z = .06; head.add(cage); fan.add(base, post, head); fan.userData.bl = bl; } fan.position.set(.6, .15, -.6); fan.rotation.y = Math.PI;
const picture = add(new THREE.Group()); { const fr = M(new THREE.BoxGeometry(.9, .62, .05), lp(0x8a6a48)); const pt = canvasTex(256, 176), x = pt.x; const gr = x.createLinearGradient(0, 0, 0, 176); gr.addColorStop(0, '#8fd0ff'); gr.addColorStop(1, '#dff3ff'); x.fillStyle = gr; x.fillRect(0, 0, 256, 176); x.fillStyle = '#ffd34d'; x.beginPath(); x.arc(190, 50, 26, 0, 6.29); x.fill(); x.fillStyle = '#4f9a3e'; x.beginPath(); x.moveTo(0, 176); x.lineTo(80, 80); x.lineTo(150, 150); x.lineTo(200, 110); x.lineTo(256, 176); x.fill(); pt.tx.needsUpdate = true; const im = M(new THREE.PlaneGeometry(.78, .5), new THREE.MeshStandardMaterial({ map: pt.tx, roughness: .6 }), false); im.position.z = .027; picture.add(fr, im); } picture.position.set(.9, 1.85, -1.78);
const bucket = add(M(new THREE.CylinderGeometry(.2, .16, .32, 14), lp(0x3d6bff))); bucket.position.set(-2.4, .31, -1.2);
const ceilStain = add(M(new THREE.CircleGeometry(.85, 24), new THREE.MeshBasicMaterial({ color: 0x5a3a1a, transparent: true, opacity: .9, depthWrite: false, side: THREE.DoubleSide }), false)); ceilStain.rotation.x = Math.PI / 2; ceilStain.position.set(-2.4, 2.725, -1.2);
// exterior: charco, banqueta, mancha húmeda
const puddle = add(M(new THREE.CylinderGeometry(1, 1, .02, 24), new THREE.MeshStandardMaterial({ color: 0x4a9be0, transparent: true, opacity: .8, roughness: .1 }), false)); puddle.position.set(-4.0, .03, .3);
const wetBand = add(M(new THREE.PlaneGeometry(3.9, .9), new THREE.MeshBasicMaterial({ color: 0x5a4a3a, transparent: true, opacity: 0, depthWrite: false }), false)); wetBand.rotation.y = -Math.PI / 2; wetBand.position.set(-3.39, .6, .02);
const banq = add(new THREE.Group()); { const s = M(new THREE.BoxGeometry(1.3, .14, 3.96), lp(0xbfc2c8)); s.position.set(-.65, 0, 0); s.rotation.z = .07; banq.add(s); } banq.position.set(-3.38, .1, .02);
// ---------- diorama macro (ladrillo en corte) ----------
const X0 = 30;
const ped = add(M(new THREE.CylinderGeometry(6, 6.3, .4, 40), lp(0xd6dbe4))); ped.position.set(X0 + .6, -1.2, 0);
const soilMac = new THREE.MeshStandardMaterial({ color: 0x5e4636, roughness: .9, flatShading: true });
add(M(new THREE.BoxGeometry(4.2, 1.0, 1.4), soilMac)).position.set(X0, -.5, 0);
add(M(new THREE.BoxGeometry(3.0, 2.4, .44), lp(0xd8c8b0))).position.set(X0, 1.2, 0);
for (let r = 0; r < 11; r++) for (let c = 0; c < 7; c++) { const off = r % 2 ? .25 : 0; let x0 = -1.5 + c * .5 + off, x1 = x0 + .48; x0 = Math.max(-1.5, x0); x1 = Math.min(1.5, x1); if (x1 - x0 < .05) continue; const b = add(M(new THREE.BoxGeometry(x1 - x0, .2, .5), lp([0xb85a3c, 0xc4643f, 0xab5236][(r + c) % 3]))); b.position.set(X0 + (x0 + x1) / 2, .11 + r * .22, 0); }
const tileM = lp(0xf2a97e), tiles = [];
for (let r = 0; r < 10; r++) for (let c = 0; c < 7; c++) { const tl = add(M(new THREE.BoxGeometry(.2, .2, .05), tileM)); const x = X0 + .2 + c * .2, y = .3 + r * .2; tl.position.set(x, y, .28); tl.userData = { x, y, r, c, ph: rnd() }; tiles.push(tl); }
const crystals = []; for (let i = 0; i < 46; i++) { const c = add(M(new THREE.OctahedronGeometry(.07, 0), new THREE.MeshStandardMaterial({ color: 0xffffff, emissive: 0xcfe8ff, emissiveIntensity: .35, roughness: .3, flatShading: true }))); c.userData = { x: X0 + .15 + rnd() * 1.4, y: .25 + rnd() * 1.1, s: .6 + rnd() * .8, ph: rnd() }; crystals.push(c); }
const glass = add(M(new THREE.CylinderGeometry(.42, .36, .9, 24, 1, true), new THREE.MeshStandardMaterial({ color: 0xdff3ff, transparent: true, opacity: .4, roughness: .05, side: THREE.DoubleSide, depthWrite: false }), false)); glass.position.set(X0 + 2.2, -.55, 1.0);
const gWater = add(M(new THREE.CylinderGeometry(.39, .34, .5, 24), new THREE.MeshStandardMaterial({ color: 0x3d8bff, transparent: true, opacity: .75 }), false)); gWater.position.set(X0 + 2.2, -.75, 1.0);
const straw = add(M(new THREE.CylinderGeometry(.08, .08, 1.7, 12, 1, true), new THREE.MeshStandardMaterial({ color: 0xffffff, transparent: true, opacity: .5, side: THREE.DoubleSide, depthWrite: false }), false)); straw.position.set(X0 + 2.2, -.1, 1.0);
const strawW = add(M((() => { const gm = new THREE.CylinderGeometry(.065, .065, 1, 10); gm.translate(0, .5, 0); return gm; })(), new THREE.MeshStandardMaterial({ color: 0x3d8bff, emissive: 0x2a7bff, emissiveIntensity: .5 }), false)); strawW.position.set(X0 + 2.2, -.95, 1.0);
const macL = new THREE.PointLight(0xfff4e0, 0, 12, 1.2); macL.position.set(X0 + .5, 2.6, 3.2); scene.add(macL);
// flechas (azules, hacia arriba)
const arrowM = new THREE.MeshBasicMaterial({ color: 0x3d9bff, transparent: true, depthTest: false });
const arrows = []; for (let i = 0; i < 6; i++) { const a = new THREE.Group(); const sh = M(new THREE.CylinderGeometry(.07, .07, .5, 8), arrowM, false); sh.position.y = .32; const cn = M(new THREE.ConeGeometry(.17, .3, 10), arrowM, false); cn.rotation.x = Math.PI; a.add(sh, cn); a.rotation.z = Math.PI; a.renderOrder = 8; sh.renderOrder = cn.renderOrder = 8; a.userData.o = (i % 3) / 3; a.userData.k = i; scene.add(a); arrows.push(a); }
// partículas
function parts(n, c, r = .05, geo) { const m = new THREE.InstancedMesh(geo || new THREE.SphereGeometry(r, 6, 4), c.isMaterial ? c : new THREE.MeshBasicMaterial({ color: c }), n); m.frustumCulled = false; scene.add(m); return m; }
const tmp = new THREE.Object3D();
function setP(m, i, x, y, z, vis, s = 1, rot = 0) { tmp.position.set(x, y, z); tmp.rotation.set(rot, rot * .7, 0); tmp.scale.setScalar(vis ? s : .001); tmp.updateMatrix(); m.setMatrixAt(i, tmp.matrix); }
const NC = 80;
const capP = parts(NC, 0x3d9bff, .045), saltP = parts(NC, 0xffffff, .02, new THREE.BoxGeometry(.035, .035, .035));
const vapor = parts(30, new THREE.MeshBasicMaterial({ color: 0xffffff, transparent: true, opacity: .45, depthWrite: false }), .08);
const chips = parts(36, 0xf2a97e, .05, new THREE.BoxGeometry(.09, .07, .015)), dust = parts(40, 0xf4f2ec, .05), rain = parts(90, 0x7fc4ff, .02, new THREE.BoxGeometry(.02, .2, .02)), drips = parts(6, 0x3d9bff, .05), spark = parts(20, 0x9cff8a, .04);
// personajes
const owner = makeChar({ shirt: 0xff8a3d, pants: 0x2b3350 }); scene.add(owner.root);
const eng = makeChar({ shirt: 0x3d6bff, pants: 0x262c45, skin: 0xc68a62, hair: 0x1a1210, clipboard: true }); scene.add(eng.root);
{ const hm = mat(0xffcc33, { roughness: .35 }); const dome = mesh(new THREE.SphereGeometry(.34, 24, 12, 0, Math.PI * 2, 0, Math.PI / 2), hm); dome.position.y = .08; const brim = mesh(new THREE.CylinderGeometry(.42, .42, .03, 24), hm); brim.position.y = .09; eng.head.add(dome, brim); }
const engCB = eng.el[1].children[eng.el[1].children.length - 1];
owner.el[1].add(roller, scraper); roller.position.y = -.42; scraper.position.y = -.42; eng.el[0].add(drill); drill.position.y = -.42;
const ceilL = new THREE.PointLight(0xfff1d8, 5, 8, 1.2); ceilL.position.set(0, 2.35, 0); scene.add(ceilL);
const fillL = new THREE.PointLight(0xfff4e0, 3.4, 10, 1.2); fillL.position.set(0, 2.2, 1.6); scene.add(fillL);
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
const PS = i => PH[i].s;
const K = { dos: T('dos'), pedazos: T('pedazos'), noes: PS(2), salitre: PS(3), afuera: PS(4), abajo: PS(5), tierra: PS(6), humedad: T('humedad', 1), sube: PS(7), popote: T('popote'), sola: PS(8), sales: PS(9), llega: PS(10), evapora: T('evapora'), queda: PS(11), cristales: PS(12), empujan: T('empujan'), caen: PS(13), poreso: PS(14), siempre: PS(15), raspas: PS(16), pintas: T('pintas'), regresa: T('regresa'), sigue: PS(17), yeso: PS(18), esponja: T('esponja'), polvo: T('polvo'), imper: PS(20), arriba: PS(21), mancha: PS(22), problema: PS(23), entre: PS(24), cimiento: T('cimiento'), cadena: T('cadena'), encima: PS(25), capa: T('capa'), muchas: PS(26), hecha: PS(27), quita: PS(28), ladrillo2: T('ladrillo', 2), secar: PS(29), antis: PS(30), mortero: PS(31), noyeso: PS(32), inyectar: PS(33), barrera: T('barrera'), afuera2: PS(34), charque: T('encharque'), pared3: T('pared', 3), ojo: PS(35), arriba2: PS(36), techo: T('techo'), esquina: T('esquina'), noes2: PS(37), gotera: PS(38), felic: PS(39), aguanta: PS(40), dime: PS(41) };
const BQ = K.pared3 + .2;
const SHOTS = [
  [0, K.afuera, [1.4, 1.8, 7.6], [.5, 1.5, 6.4], [0, 1.15, -1.8], [-.2, 1.0, -1.8]],
  [K.afuera, K.sube, [2.6, 1.2, 10], [1.4, -.1, 8.6], [0, .6, -.5], [0, -.7, 0]],
  [K.sube, K.llega, [X0 + .9, 1.3, 8.6], [X0 + .7, 1.0, 7.6], [X0 + .6, .55, 0], [X0 + .55, .55, 0]],
  [K.llega, K.poreso, [X0 + 1.0, 1.35, 4.3], [X0 + .85, 1.2, 3.5], [X0 + .85, 1.15, .3], [X0 + .85, 1.0, .3]],
  [K.poreso, K.siempre, [0, 1.3, 6.4], [-.3, 1.0, 5.4], [0, .8, -1.8], [0, .7, -1.8]],
  [K.siempre, K.imper, [1.8, 1.6, 6.0], [.9, 1.4, 5.2], [-.4, 1.0, -1.8], [-.4, 1.0, -1.8]],
  [K.imper, K.problema, [0, 1.3, 6.4], [0, 1.6, 5.8], [0, 1.0, -1.8], [0, 1.4, -1.8]],
  [K.problema, K.hecha, [-1.4, .8, 7.2], [-2.3, .3, 5.6], [-3.1, -.1, 1.98], [-3.3, -.3, 1.98]],
  [K.hecha, K.inyectar, [1.4, 1.5, 6.0], [.6, 1.2, 5.1], [-.5, .9, -1.8], [-.6, .8, -1.8]],
  [K.inyectar, K.afuera2, [1.4, 1.1, 5.2], [.7, .9, 4.4], [0, .5, -1.8], [0, .5, -1.8]],
  [K.afuera2, K.ojo, [-10.5, 2.8, 6.4], [-9.2, 2.2, 5.0], [-3.8, .5, 0], [-4.0, .4, 0]],
  [K.ojo, K.felic, [1.2, 1.1, 5.0], [.6, 1.2, 4.2], [-1.8, 2.2, -1.4], [-2.0, 2.3, -1.3]],
  [K.felic, K.dime, [0, 1.5, 6.4], [.5, 1.45, 5.4], [0, 1.3, -1.8], [.2, 1.35, -1.8]],
  [K.dime, 200, [7, 5.2, 12], [5.5, 4.4, 10], [0, 1.0, 0], [0, 1.1, 0]],
];
const CUTS = SHOTS.map(s => s[0]).slice(1);
const inn = (t, a, b) => t >= a && t < b;
function camAt(t) {
  const s = SHOTS.find(s => t >= s[0] && t < s[1]) || SHOTS[SHOTS.length - 1]; const k = eio(clamp((t - s[0]) / (Math.min(s[1], END) - s[0])));
  cam.position.copy(V(...s[2]).lerp(V(...s[3]), k)); cam.fov = 50; cam.updateProjectionMatrix(); cam.lookAt(V(...s[4]).lerp(V(...s[5]), k));
}
// estado del muro
function wallState(t) {
  const s = { col: '#f2a97e', cover: 1, sk: 0, from: 0, top: 0, peel: 0, yk: 0, yb: 0, yp: 0, seal: 0, ex: 0, wet: 1, an: 0, mo: 0, holes: 0, glowL: 0, stain: 0, cover2: 0, band: 0 };
  const full = () => { s.sk = 1; s.top = 1.0; s.peel = .8; };
  if (t < K.raspas) {
    s.cover = eio(P(t, .05, 1.7));
    if (t >= K.dos + .9) { s.sk = P(t, K.dos + .9, 1.0); s.top = 1.0 * eout(P(t, K.dos + .9, 2.0)); s.peel = .8 * P(t, K.pedazos - .3, .8); }
    s.band = inn(t, K.poreso + .2, K.siempre) ? .6 + .4 * Math.sin(t * 8) : 0;
  } else if (t < K.yeso) {
    full(); const sc = 1 - P(t, K.raspas, .6); s.sk *= sc; s.peel *= sc;
    if (t >= K.pintas) s.cover = 1;
    if (t >= K.regresa) { s.sk = P(t, K.regresa, .6); s.top = eout(P(t, K.regresa, .9)); s.peel = .5 * P(t, K.regresa + .3, .8); }
  } else if (t < K.imper) {
    full(); s.peel = .5; s.yk = P(t, K.yeso + .2, .9); s.yb = P(t, K.esponja, .7); s.yp = P(t, K.polvo, .7);
  } else if (t < K.hecha) {
    full(); s.peel = .5; s.seal = eio(P(t, K.imper + .1, 1.2));
    if (t >= K.arriba) { s.from = .9; s.top = .9 + .9 * eout(P(t, K.arriba, 1.6)); s.sk = P(t, K.arriba, .6); s.peel = .35 * P(t, K.mancha, .6); }
  } else if (t < K.felic) {
    full(); s.ex = eio(P(t, K.quita + .3, 2.2)); s.wet = 1 - P(t, K.secar, 1.1); s.an = eio(P(t, K.antis + .1, 1.6)); s.mo = eio(P(t, K.mortero + .1, 1.8));
    s.holes = P(t, K.inyectar + .5, K.barrera - K.inyectar); s.glowL = t > K.barrera ? .5 + .3 * Math.sin(t * 6) : 0;
    s.stain = eout(P(t, K.techo - .2, 1.2));
  } else { full(); s.ex = 1; s.wet = 0; s.an = 1; s.mo = 1; s.holes = 1; s.stain = 1; s.cover2 = eio(P(t, K.felic + .05, 1.4)); }
  return s;
}
function animWorld(t) {
  const rainy = inn(t, K.afuera2, K.ojo);
  const sky = new THREE.Color(rainy ? 0x9aaabb : 0x8fd0ff); scene.background = sky; scene.fog.color.copy(sky);
  hemi.intensity = rainy ? 1.0 : 1.3; sunL.intensity = rainy ? 1.4 : 2.8; sunL.position.set(5, 20, 9); sunL.target.position.set(0, 0, 0);
  sun.visible = !rainy; sun.position.set(7, 15, -22); sunHalo.position.copy(sun.position); sunHalo.scale.setScalar(9); sunHalo.material.opacity = .9;
  moon.visible = false; stars.visible = false;
  clouds.forEach(c => { c.position.x = ((c.position.x + 40 + c.userData.v * .02) % 80) - 40; c.children.forEach(m => m.material.color.set(rainy ? 0x8a93a0 : 0xffffff)); });
  const macro = inn(t, K.sube, K.poreso); macL.intensity = macro ? 3.2 : 0;
  drawWall(wallState(t));
  // humedad del suelo
  { const wk = inn(t, K.abajo, K.sube) ? P(t, K.abajo, .5) : inn(t, K.problema, K.hecha) ? .8 : 0; soilM.color.set(new THREE.Color(0x8a5a34).lerp(new THREE.Color(0x4e4a4c), wk * (.85 + .15 * Math.sin(t * 5)))); }
  cadM.emissiveIntensity = inn(t, K.cadena - .1, K.capa) ? .45 * (.5 + .5 * Math.sin((t - K.cadena) * 8)) : 0;
  const bOn = t >= K.capa && t < K.hecha; const bk = eback(P(t, K.capa, .5));
  barrier.forEach(b => { b.visible = bOn; b.scale.x = Math.max(.001, bk); b.material.opacity = 1 - .75 * P(t, K.muchas, .5); });
  barM.emissiveIntensity = inn(t, K.capa + .3, K.muchas) ? .5 : 0; barM.emissive.set(t < K.muchas ? 0x35d39a : 0xff4d61); if (t >= K.muchas) barM.emissiveIntensity = .4 * (.5 + .5 * Math.sin(t * 9));
  // partículas de agua por capilaridad
  let mode = '';
  if (inn(t, K.abajo, K.sube)) mode = 'soil'; else if (inn(t, K.sube, K.poreso)) mode = 'mac'; else if (inn(t, K.problema, K.hecha)) mode = 'cut'; else if (inn(t, K.inyectar, K.afuera2)) mode = 'wall';
  const salted = t >= K.sales;
  for (let i = 0; i < NC; i++) {
    const a = i * 2.399, u = (t * .32 + (i * .618) % 1) % 1; let x = 0, y = 0, z = 0, vis = !!mode, sz = 1;
    if (mode === 'soil') { x = -3.9 + (i / NC) * 7.8; y = lerp(-1.9, -.12, u); z = GZ + .05; vis = vis && t > K.abajo + (i % 5) * .08; }
    else if (mode === 'mac') { const L = lerp(-.4, 1.65, eout(P(t, K.sube + .2, 3.0))); x = X0 - 1.4 + (i / NC) * 2.8; const y0 = -.9; y = y0 + u * (L - y0); z = x > X0 + .1 ? .26 : .27; sz = 1 - Math.pow(u, 6) * .5; vis = vis && !(x > X0 + .1 && y > .2 && t > K.caen + .6) ; }
    else if (mode === 'cut') { const stop = bOn && t > K.capa + .4 && t < K.muchas + .2; const L = stop ? .13 : 1.1; x = -3.3 + (((i * .7548) % 1) - .5) * .7; y = lerp(-1.6, L, u); z = GZ + .06; vis = i % 2 === 0; sz = .8; }
    else if (mode === 'wall') { const L = t > K.barrera + .3 ? .2 : 1.1; x = -2.6 + (i / NC) * 5.2; y = lerp(.16, L, u); z = -1.74; }
    setP(capP, i, x, y, z, vis, sz);
    setP(saltP, i, x + .035, y + .03, z + .02, vis && salted && mode === 'mac', 1, t * 2 + i);
  }
  capP.instanceMatrix.needsUpdate = saltP.instanceMatrix.needsUpdate = true;
  // diorama: vapor, cristales, recubrimiento que se cae
  for (let i = 0; i < 30; i++) { const u = (t * .45 + i / 30) % 1; setP(vapor, i, X0 + .2 + (i % 7) * .2 + Math.sin(u * 6 + i) * .05, .3 + (i % 6) * .2 + u * .6, .4 + u * .2, inn(t, K.evapora - .2, K.cristales + 1), (1 - u) * 1.1); } vapor.instanceMatrix.needsUpdate = true;
  const grow = eout(P(t, K.queda, 3.5)), push = eout(P(t, K.empujan, 1.6)), fall = t - K.caen;
  crystals.forEach(c => { const d = c.userData; c.visible = macro && t > K.queda; const s = Math.max(.001, grow * d.s * (1 + .4 * push)); c.scale.setScalar(s); c.position.set(d.x, d.y, .3 + .02 * push); c.rotation.set(d.ph * 3, t * .2 + d.ph * 5, 0); });
  const wetK = inn(t, K.llega, K.caen + 3) ? P(t, K.llega + .3, 1.2) : 0; tileM.color.set(new THREE.Color(0xf2a97e).lerp(new THREE.Color(0xb7795a), wetK * .6));
  tiles.forEach(tl => { const d = tl.userData, low = d.y < 1.45; let z = .28, y = d.y, rx = 0, rz = 0, vis = true, s = 1;
    if (low) { const pk = push * (1 - d.y / 1.6); z += .14 * pk; rx = (d.ph - .5) * .6 * pk; rz = (d.ph - .5) * .5 * pk; s = 1 - .14 * grow;
      if (fall > 0) { const f = Math.max(0, fall - d.ph * .5); y -= 2.4 * f * f; z += f * .6; rx += f * 3 * (d.ph - .3); vis = y > -1.2; } }
    tl.visible = vis; tl.position.set(d.x, y, z); tl.rotation.set(rx, 0, rz); tl.scale.set(s, s, 1); });
  const sw = eout(P(t, K.sube + .4, 3.0)); strawW.scale.y = Math.max(.001, lerp(.45, 1.55, sw));
  // chips de pintura (pedazos, raspas, quitar aplanado)
  const chipAt = [K.pedazos - .1, K.raspas, K.quita + .3].find(a => inn(t, a, a + 1.6));
  for (let i = 0; i < 36; i++) { let vis = chipAt !== undefined, x = 0, y = 0, z = 0; if (vis) { const u = clamp((t - chipAt - (i % 6) * .08) / 1.2); x = -2.8 + (i / 36) * 5.6; y = lerp(.2 + (i % 9) * .1, .16, Math.min(1, u * u * 1.4)); z = -1.76 + u * (.2 + (i % 4) * .1); vis = u > 0; } setP(chips, i, x, y, z, vis, 1, t * 4 + i); } chips.instanceMatrix.needsUpdate = true;
  for (let i = 0; i < 40; i++) { const u = clamp((t - K.polvo - (i % 8) * .06) / 1.4); setP(dust, i, -2.9 + (i / 40) * 5.8, lerp(.2 + (i % 10) * .09, .16, u * u), -1.74 + u * .4, inn(t, K.polvo, K.imper) && u > 0, 1 - u * .5); } dust.instanceMatrix.needsUpdate = true;
  // flechas
  arrows.forEach((a, i) => { let on = false, x = 0, y0 = 0, y1 = 0, z = 0; const u = (t * .5 + a.userData.o) % 1;
    if (inn(t, K.abajo, K.humedad)) { on = true; x = -2.2 + (i % 3) * 2.2; y0 = -1.7; y1 = -.2; z = GZ + .2; }
    else if (inn(t, K.sigue, K.yeso)) { on = i < 3; x = -1.6 + i * 1.6; y0 = .1; y1 = 1.2; z = -1.6; }
    a.visible = on; a.position.set(x, lerp(y0, y1, u), z); a.scale.setScalar((u > .85 ? (1 - u) / .15 : u < .08 ? u / .08 : 1) * .9); });
  // exterior
  for (let i = 0; i < 90; i++) { const u = (t * 1.3 + (i * .37) % 1) % 1; setP(rain, i, -3.5 - (i % 15) * .4, lerp(6, .05, u), -2 + ((i * 7) % 13) * .32, rainy); } rain.instanceMatrix.needsUpdate = true;
  const pk = P(t, K.afuera2 + .3, 1.2), gone = eio(P(t, BQ, 1.2));
  puddle.visible = rainy; puddle.scale.set(Math.max(.001, lerp(.3, 1, pk) * (1 - .6 * gone)), 1, Math.max(.001, 1.6 * lerp(.3, 1, pk) * (1 - .6 * gone))); puddle.position.x = lerp(-4.0, -5.7, gone);
  wetBand.visible = rainy; wetBand.material.opacity = .45 * pk * (1 - gone);
  banq.visible = rainy && t >= BQ; banq.scale.set(Math.max(.001, eback(P(t, BQ, .5))), 1, 1);
  // gotera
  ceilStain.visible = inn(t, K.ojo, K.felic); ceilStain.scale.setScalar(Math.max(.001, eout(P(t, K.techo - .4, 1.2))));
  bucket.visible = inn(t, K.ojo, K.felic);
  for (let i = 0; i < 6; i++) { const u = (t * .9 + i / 6) % 1; setP(drips, i, -2.4, lerp(2.68, .45, u * u), -1.2, inn(t, K.techo, K.felic)); } drips.instanceMatrix.needsUpdate = true;
  // utilería
  fan.visible = inn(t, K.secar - .2, K.inyectar); fan.userData.bl.rotation.z = t * 25;
  picture.visible = t >= K.aguanta; picture.scale.setScalar(Math.max(.001, eback(P(t, K.aguanta, .45))));
  for (let i = 0; i < 20; i++) { const sa = t >= K.felic + 1.4 ? K.felic + 1.4 : K.barrera; const u = clamp((t - sa) / .9), a = i * 2.4; setP(spark, i, (sa === K.barrera ? -2.6 + i * .27 : Math.cos(a) * 2.4 * u), sa === K.barrera ? .3 + u * .5 : 1.5 + Math.sin(a) * 1.0 * u, -1.7, u > 0 && u < 1 && (sa === K.barrera ? inn(t, K.barrera, K.afuera2) : true), 1 - u); } spark.instanceMatrix.needsUpdate = true;
  // personajes
  let op = [1.6, 0, -.4], ory = .3, p = { emo: 'neutral' }, ev = false, ep = [2.4, 0, .4], ery = -.4, e = { emo: 'neutral' };
  let tool = '', etool = false; const paint = { armR: [-1.5 - .45 * Math.sin(t * 7), -.15, -.35], armL: [-.2, .15, -.3] };
  const scrape = { armR: [-1.1 - .25 * Math.sin(t * 12), -.25, -.6], armL: [-.2, .15, -.3] };
  if (t < K.dos + .2) { op = [lerp(-2.4, 1.8, s0(t)), 0, -1.0]; ory = 2.7; p = { emo: 'happy', ...paint }; tool = 'roller'; }
  else if (t < K.afuera) { op = [1.8, 0, -.7]; ory = .5; const sc = t > K.pedazos - .2; p = { emo: sc ? 'surprised' : 'neutral', headRy: -.5, look: [-.8, -.2], ...(sc ? { armR: [-2.4, -.5, -.4], armL: [-2.4, .5, -.4] } : {}) }; tool = 'roller'; if (t > K.noes) p = { emo: 'suspicious', headRy: .1, armR: [-.5, -.3, -1.6], armL: [-.2, .15, -.3] }; }
  else if (t < K.sube) { op = [1.9, 0, -.5]; ory = .2; p = { emo: 'worried', headRx: .35, look: [0, -1] }; }
  else if (t < K.poreso) { op = [0, -50, 0]; }
  else if (t < K.siempre) { op = [1.9, 0, -.6]; ory = -.3; p = { emo: 'worried', armR: [-.7, -.2, -.3], look: [-.8, -.5], headRy: -.4 }; }
  else if (t < K.raspas) { op = [1.7, 0, -.5]; ory = .2; p = { emo: 'determined', armR: [-.4, -.2, -1.2], armL: [-.4, .2, -1.2] }; tool = 'scraper'; }
  else if (t < K.regresa) { op = [lerp(-1.6, .6, P(t, K.raspas, 2.6)), 0, -1.15]; ory = 2.6; p = { emo: 'determined', ...(t < K.pintas ? scrape : paint) }; tool = t < K.pintas ? 'scraper' : 'roller'; }
  else if (t < K.yeso) { op = [.9, 0, -.8]; ory = .5; p = { emo: t > K.sigue ? 'worried' : 'surprised', armR: [-2.4, -.5, -.4], armL: [-2.4, .5, -.4], headRy: -.4 }; if (t > K.sigue) p = { emo: 'worried', headRx: .3, look: [-.6, -.8] }; }
  else if (t < K.imper) { op = [lerp(-1.4, .8, P(t, K.yeso, 2.2)), 0, -1.15]; ory = 2.6; p = { emo: t > K.polvo ? 'surprised' : 'neutral', ...scrape }; tool = 'scraper'; if (t > K.polvo) { op = [1.0, 0, -.8]; ory = .5; p = { emo: 'surprised', armR: [-2.4, -.5, -.4], armL: [-2.4, .5, -.4] }; } }
  else if (t < K.problema) { op = [lerp(-1.6, 1.0, P(t, K.imper, 2.0)), 0, -1.15]; ory = 2.6; p = { emo: 'determined', hipY: .78, spineRx: .35, armR: [-.9 - .3 * Math.sin(t * 7), -.15, -.3], legs: [-.6, 1.0, -.6, 1.0] }; tool = 'roller'; if (t > K.arriba) { op = [1.2, 0, -.8]; ory = .4; p = { emo: 'surprised', headRx: -.25, look: [-.6, .8], armR: [-2.4, -.5, -.4], armL: [-2.4, .5, -.4] }; tool = ''; } }
  else if (t < K.hecha) { op = [0, -50, 0]; ev = true; ep = [-1.7, 0, 1.25]; ery = -.6; e = { emo: t > K.muchas ? 'worried' : 'determined', armR: [-.6, -.2, -1.0], armL: [-.4, .9, -.2], look: [-.6, -.2] }; }
  else if (t < K.inyectar) {
    op = [1.8, 0, -.6]; ory = -.2; p = { emo: 'neutral', look: [-.6, 0] };
    if (inn(t, K.quita, K.secar)) { op = [lerp(-1.8, .8, P(t, K.quita, 2.8)), 0, -1.15]; ory = 2.6; p = { emo: 'determined', ...scrape }; tool = 'scraper'; }
    else if (inn(t, K.secar, K.antis)) { op = [1.4, 0, -.3]; ory = -.2; p = { emo: 'happy', look: [-.6, -.3] }; }
    else if (inn(t, K.antis, K.mortero)) { op = [lerp(-1.8, .8, P(t, K.antis, 2.0)), 0, -1.15]; ory = 2.6; p = { emo: 'determined', hipY: .78, spineRx: .35, armR: [-.9 - .3 * Math.sin(t * 7), -.15, -.3], legs: [-.6, 1.0, -.6, 1.0] }; tool = 'roller'; }
    else if (inn(t, K.mortero, K.noyeso)) { op = [lerp(-1.8, .8, P(t, K.mortero, 2.0)), 0, -1.15]; ory = 2.6; p = { emo: 'determined', ...scrape }; tool = 'scraper'; }
    else if (t >= K.noyeso) { op = [1.3, 0, -.5]; ory = .2; p = { emo: 'determined', headRy: .35 * Math.sin(t * 9), armR: [-1.6, -.2, -.2, -.4 * Math.sin(t * 9)], armL: [-.2, .15, -.3] }; }
  }
  else if (t < K.afuera2) { op = [2.0, 0, -.2]; ory = -.3; p = { emo: t > K.barrera ? 'happy' : 'neutral', look: [-.7, -.5] }; ev = true; ep = [lerp(-1.6, 1.0, P(t, K.inyectar + .4, 3.6)), 0, -1.05]; ery = 2.8; e = { emo: 'determined', hipY: .62, spineRx: .3, legs: [-1.2, 1.9, -1.2, 1.9], armL: [-1.3, .1, -.3], armR: [-.4, -.2, -.4] }; etool = true; }
  else if (t < K.ojo) { op = [-5.6, 0, .9]; ory = -.8; const ok = t > BQ; p = { emo: ok ? 'happy' : 'worried', look: [.6, -.4], ...(ok ? { armR: [-2.6, -.35, -.2 + .3 * Math.sin(t * 8)] } : { armR: [-.5, -.3, -1.4] }) }; }
  else if (t < K.felic) { op = [-.1, 0, -.1]; ory = -.6; p = { emo: t > K.noes2 ? 'determined' : 'surprised', headRx: -.5, look: [-.4, 1], ...(t > K.techo ? { armR: [-2.6, -.6, -.2] } : {}) }; }
  else if (t < K.dime) { op = [-.4, 0, -.7]; ory = .3; p = { emo: 'happy', ...(t > K.aguanta + .4 ? { armR: [-2.6, -.35, -.2 + .3 * Math.sin(t * 8)], armL: [-.2, .15, -.3] } : { armR: [-2.0, -.3, -.4], armL: [-2.0, .3, -.4] }) }; ev = t > K.aguanta + .3; ep = [2.0, 0, -.3]; ery = -.5; e = { emo: 'happy', armL: [-.9, .3, -.6] }; }
  else { op = [1.0, 0, .4]; ory = .2; p = { emo: 'happy', armR: [-2.3, -.3, -.1], armL: [-.2, .15, -.3], headRy: -.2 }; ev = true; ep = [-1.0, 0, .2]; ery = .3; e = { emo: 'happy', armL: [-.9, .3, -.6] }; }
  owner.root.position.set(...op); owner.root.rotation.y = ory; pose(owner, p, t);
  roller.visible = tool === 'roller'; scraper.visible = tool === 'scraper'; roller.userData.r.material.color.set(inn(t, K.antis, K.mortero) ? 0x35d39a : inn(t, K.imper, K.problema) ? 0xd9784d : 0xf2a97e);
  eng.root.visible = ev; eng.root.position.set(...ep); eng.root.rotation.y = ery; pose(eng, e, t + 1.3); drill.visible = etool; engCB.visible = !etool;
  // etiquetas
  OVL.length = 0; const L = (text, at, end, pos, color = '#ffcc33') => { if (t >= at && t < end) OVL.push({ text, at, end, pos, color }); };
  const WP = (y = 1.6) => V(0, y, -1.8);
  L('PINTURA NUEVA', .15, K.dos - .1, WP(2.3), '#7be36b');
  L('SE CAE A PEDAZOS', K.pedazos - .1, K.noes, WP(2.2), '#ff6a4a');
  L('¿LA PINTURA?', K.noes, K.salitre - .05, WP(2.2));
  L('✖ NO: ES SALITRE', K.salitre - .05, K.afuera, WP(2.2), '#ff6a4a');
  L('NO VIENE DE AFUERA', K.afuera, K.abajo - .05, V(0, 2.2, 0));
  L('VIENE DE ABAJO', K.abajo - .05, K.humedad - .1, V(0, -1.4, GZ), '#6cc4ff');
  L('HUMEDAD EN LA TIERRA', K.humedad - .1, K.sube, V(0, -1.4, GZ), '#6cc4ff');
  L('SUBE POR LOS LADRILLOS', K.sube + .2, K.popote - .2, V(X0, 2.9, 0), '#6cc4ff');
  L('COMO POR UN POPOTE', K.popote - .2, K.sales - .1, V(X0 + 2.2, 1.4, 1.0), '#6cc4ff');
  L('TRAE SALES', K.sales - .1, K.llega, V(X0, 2.9, 0), '#ffffff');
  L('LLEGA A LA PARED', K.llega, K.evapora - .1, V(X0 + .85, 2.1, .4), '#6cc4ff');
  L('SE EVAPORA', K.evapora - .1, K.queda, V(X0 + .85, 2.1, .4), '#cfe8ff');
  L('LA SAL SE QUEDA', K.queda, K.cristales, V(X0 + .85, 2.1, .4), '#ffffff');
  L('CRISTALES DE SAL', K.cristales, K.empujan, V(X0 + .85, 2.1, .4));
  L('EMPUJAN DESDE ADENTRO', K.empujan, K.caen, V(X0 + .85, 2.1, .4), '#ff8a4a');
  L('¡SE CAE!', K.caen, K.poreso, V(X0 + .85, 2.1, .4), '#ff6a4a');
  L('SIEMPRE EMPIEZA ABAJO', K.poreso + .2, K.siempre, WP(1.7));
  L('✖ RASPAR Y PINTAR', K.raspas, K.regresa - .05, WP(2.2), '#ff6a4a');
  L('¡REGRESA!', K.regresa - .05, K.sigue, WP(2.2), '#ff6a4a');
  L('EL AGUA SIGUE SUBIENDO', K.sigue, K.yeso, WP(2.2), '#6cc4ff');
  L('✖ YESO', K.yeso, K.esponja - .1, WP(2.2), '#ff6a4a');
  L('SE ESPONJA', K.esponja - .1, K.polvo - .1, WP(2.2), '#ff8a4a');
  L('SE HACE POLVO', K.polvo - .1, K.imper, WP(2.2), '#ff6a4a');
  L('✖ PINTURA IMPERMEABLE', K.imper, K.arriba, WP(2.3), '#ff6a4a');
  L('¡LA MANCHA SUBE!', K.arriba + .3, K.problema, WP(2.35), '#ff6a4a');
  L('EL PROBLEMA NACE AQUÍ', K.problema, K.cimiento - .1, V(-3.3, .9, GZ));
  L('CIMIENTO', K.cimiento - .1, K.cadena - .1, V(-3.3, -1.1, GZ));
  L('CADENA DE DESPLANTE', K.cadena - .1, K.capa - .1, V(-3.3, 1.0, GZ));
  L('BARRERA IMPERMEABLE', K.capa - .1, K.muchas, V(-3.3, 1.0, GZ), '#7be36b');
  L('MUCHAS CASAS NO LA TIENEN', K.muchas, K.hecha, V(-3.3, 1.0, GZ), '#ff6a4a');
  L('¿TU CASA YA ESTÁ HECHA?', K.hecha, K.quita, WP(2.3));
  L('1. QUITA EL APLANADO', K.quita, K.secar, WP(2.3));
  L('2. DEJA SECAR', K.secar, K.antis, WP(2.3), '#6cc4ff');
  L('3. ANTISALITRE', K.antis, K.mortero, WP(2.3), '#7be36b');
  L('4. MORTERO', K.mortero, K.noyeso, WP(2.3), '#7be36b');
  L('✖ NO CON YESO', K.noyeso, K.inyectar, WP(2.3), '#ff6a4a');
  L('ESPECIALISTA', K.inyectar + .2, K.barrera - .1, WP(1.6));
  L('BARRERA INYECTADA', K.barrera - .1, K.afuera2, WP(1.6), '#7be36b');
  L('✖ CHARCO PEGADO', K.charque - .1, BQ, V(-4.0, 1.6, .3), '#ff6a4a');
  L('BANQUETA CON PENDIENTE', BQ, K.ojo, V(-4.2, 1.6, .3), '#7be36b');
  L('¿MANCHA ARRIBA?', K.ojo, K.noes2, V(-2.2, 2.5, -1.3), '#ff8a4a');
  L('NO ES SALITRE', K.noes2, K.gotera, V(-2.2, 2.5, -1.3), '#ff6a4a');
  L('GOTERA O FUGA', K.gotera, K.felic, V(-2.2, 2.5, -1.3), '#6cc4ff');
  L('¡AGUANTA LA PINTURA!', K.aguanta, K.dime, WP(2.4), '#7be36b');
  L('¿DÓNDE TE SALE?', K.dime + .2, CTA_ST, V(0, 4.2, 0), '#ff8a4a');
}
function s0(t) { return eio(P(t, .05, 1.7)); }
// tarjeta 2D: calendario "2 MESES"
function card2d(t) {
  if (!inn(t, K.dos - .05, K.noes)) return;
  const k = eback(P(t, K.dos - .05, .4)) * (1 - P(t, K.noes - .25, .25)); g.save(); g.translate(540, 560); g.scale(k, k); g.rotate(-.04);
  g.fillStyle = 'rgba(0,0,0,.35)'; rrp(g, 0, -170, -150, 360, 320, 26); g.fill();
  g.fillStyle = '#fffdf6'; rrp(g, 0, -180, -160, 360, 320, 26); g.fill();
  g.fillStyle = '#ff4d61'; rrp(g, 0, -180, -160, 360, 86, 26); g.fill(); g.fillRect(-180, -100, 360, 26);
  g.textAlign = 'center'; g.textBaseline = 'middle'; g.font = '900 40px M'; g.fillStyle = '#ffffff'; g.fillText('CALENDARIO', 0, -116);
  const n = t < K.dos + .3 ? 0 : t < K.dos + .6 ? 1 : 2;
  g.font = '900 150px M'; g.fillStyle = '#2a2c33'; g.fillText(n === 0 ? 'HOY' : String(n), 0, 30);
  g.font = '900 40px M'; g.fillStyle = '#ff4d61'; g.fillText(n === 0 ? '' : n === 1 ? 'MES' : 'MESES DESPUÉS', 0, 120);
  g.restore();
}
const KEYW = new Set(['pintaste', 'pared', 'pedazos', 'pintura', 'salitre', 'abajo', 'tierra', 'humedad', 'agua', 'ladrillos', 'popote', 'sales', 'evapora', 'sal', 'cristales', 'aplanado', 'caen', 'raspas', 'pintas', 'regresa', 'subiendo', 'yeso', 'peor', 'esponja', 'polvo', 'impermeable', 'arriba', 'mancha', 'sube', 'cimiento', 'ladrillo', 'cadena', 'desplante', 'capa', 'secar', 'antisalitre', 'mortero', 'especialista', 'barrera', 'lluvia', 'encharque', 'techo', 'esquina', 'gotera', 'fuga', 'felicidades', 'aguanta', 'comentarios']);

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
  overlayLabels(t); if (t < CTA_ST) { card2d(t); caption(t); } watermark(t); followCTA(t);
  const fo = P(t, END - .3, .3); if (fo > 0) { g.fillStyle = `rgba(0,0,0,${fo})`; g.fillRect(0, 0, W, H); }
}
window.renderAt = renderAt; window.END = END;
window.frameJPG = (t, q = .92) => { renderAt(t); return out.toDataURL('image/jpeg', q).split(',')[1]; };
window.READY = true;
