// Reel 9:16 3D (Estilo B: construcción en corte) — Comprar casa
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
  cam.position.copy(V(...s[2]).lerp(V(...s[3]), k)); cam.fov = 50; cam.updateProjectionMatrix(); cam.lookAt(V(...s[4]).lerp(V(...s[5]), k));
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
    let size = 86; g.font = `italic 900 ${size}px M`; let w = g.measureText(o.text).width + o.text.length; if (w > 860) { size = Math.floor(size * 860 / w); w = 860; }
    let x = (v.x * .5 + .5) * W, y = (-v.y * .5 + .5) * H; x = clamp(x, w / 2 + 70, W - w / 2 - 70); y = clamp(y, 330, 1640); if (Math.abs(y - 1020) < 170) y = y < 1020 ? 850 : 1190;
    const k = Math.max(.001, eback(P(t, o.at, .3))) * (1 - P(t, o.end - .15, .15));
    drawArcText(o.text, x, y, size, o.color, k);
  }
}
// ================= ANTES DE COMPRAR UNA CASA =================
const K = { fijaste: PS(1), diagonal: PS(2), pintura1: PS(3), mira: PS(4), esquinas: PS(5), mueve: PS(6), porque: PS(7), hunde: PS(8), temblor: PS(9), tranquilo: PS(10), notodas: PS(11), rayita: PS(12), capa: PS(13), sidiag: PS(14), atraviesa: PS(15), columna: PS(16), estructura: PS(17), segunda: PS(18), abre: PS(19), traban: PS(20), movio: PS(21), tercera: PS(22), canica: PS(24), rodando: PS(25), torcido: PS(26), cuarta: PS(27), manchas: PS(29), humedad: PS(30), arriba: PS(31), techo: PS(32), bano: PS(33), nadie: PS(34), relleno: PS(35), hundiendo: PS(36), ojo: PS(37), nosiempre: PS(38), ingeniero: PS(39), antes: PS(40), despues: PS(41), listo: PS(42), tucasa: PS(44) };
SHAKE = [K.temblor, K.tranquilo];
let cs = 11; const r2 = () => (cs = (cs * 16807) % 2147483647) / 2147483647;
function mkCrack(x0, y0, dx, dy, n, j) { const pts = []; const L = Math.hypot(dx, dy), nx = -dy / L, ny = dx / L; for (let i = 0; i <= n; i++) { const q = (i === 0 ? 0 : (r2() - .5) * 2 * j); pts.push([x0 + dx * i / n + nx * q, y0 + dy * i / n + ny * q]); } return pts; }
function drawCrack(x, pts, k, w = 4, col = '#3a2618') { if (k <= 0) return; const n = (pts.length - 1) * k; x.strokeStyle = col; x.lineWidth = w; x.lineJoin = 'round'; x.beginPath(); x.moveTo(...pts[0]); for (let i = 1; i <= Math.ceil(n); i++) { const f = Math.min(1, n - (i - 1)); const a = pts[i - 1], b = pts[i]; x.lineTo(a[0] + (b[0] - a[0]) * f, a[1] + (b[1] - a[1]) * f); } x.stroke(); }
// muro del fondo: ventana + grietas
const WX0 = pxx(0), WX1 = pxx(1.2), WY0 = py(1.0), WY1 = py(2.0);
const CR = { TR: mkCrack(WX1, WY1, 90, -75, 8, 7), BL: mkCrack(WX0, WY0, -110, 110, 9, 7), TL: mkCrack(WX0, WY1, -80, -70, 7, 6), BR: mkCrack(WX1, WY0, 100, 100, 8, 6) };
const HAIR = [mkCrack(pxx(1.9), py(1.4), 60, 20, 6, 10), mkCrack(pxx(2.2), py(.9), -30, 45, 5, 10), mkCrack(pxx(2.5), py(1.7), 40, -10, 5, 8)];
const BLB = Array.from({ length: 120 }, () => ({ x: r2(), h: r2(), r: .02 + r2() * .04 }));
function drawWall(t) {
  const x = WT.x; x.fillStyle = '#efe0c6'; x.fillRect(0, 0, 1024, 406);
  x.fillStyle = '#ffffff'; x.fillRect(WX0 - 10, WY1 - 10, WX1 - WX0 + 20, WY0 - WY1 + 20); const gr = x.createLinearGradient(0, WY1, 0, WY0); gr.addColorStop(0, '#9fd6f2'); gr.addColorStop(1, '#d9f1ff'); x.fillStyle = gr; x.fillRect(WX0, WY1, WX1 - WX0, WY0 - WY1); x.fillStyle = '#ffffff'; x.fillRect((WX0 + WX1) / 2 - 4, WY1, 8, WY0 - WY1);
  const k1 = eout(P(t, K.diagonal - .2, 1.6)), k2 = eout(P(t, K.mueve, 1.2));
  drawCrack(x, CR.TR, Math.max(k1, 0), 5); drawCrack(x, CR.BL, k2, 5); drawCrack(x, CR.TL, k2, 4); drawCrack(x, CR.BR, k2, 4);
  if (t >= K.rayita) HAIR.forEach(h => drawCrack(x, h, eout(P(t, K.rayita, 1.0)), 1.5, '#8a7a66'));
  if (inn(t, K.esquinas, K.porque)) { const a = .5 + .5 * Math.sin(t * 8); x.strokeStyle = `rgba(255,77,97,${a})`; x.lineWidth = 6; for (const [cx, cy] of [[WX0, WY0], [WX1, WY0], [WX0, WY1], [WX1, WY1], [pxx(-2.32), py(2.05)], [pxx(-1.47), py(2.05)]]) { x.beginPath(); x.arc(cx, cy, 22, 0, 6.29); x.stroke(); } }
  if (t >= K.traban) { x.fillStyle = '#2a1c14'; x.beginPath(); x.moveTo(pxx(-2.36), py(2.12)); x.lineTo(pxx(-1.4), py(2.12)); x.lineTo(pxx(-1.4), py(2.2)); x.closePath(); x.fill(); }
  const sk = P(t, K.manchas - .3, 1.0); if (sk > 0) { const g2 = x.createLinearGradient(0, py(0), 0, py(.8)); g2.addColorStop(0, `rgba(255,255,255,${.7 * sk})`); g2.addColorStop(1, 'rgba(255,255,255,0)'); x.fillStyle = g2; x.fillRect(0, py(.8), 1024, py(0) - py(.8)); x.fillStyle = `rgba(255,255,255,${.85 * sk})`; for (const b of BLB) { x.beginPath(); x.arc(b.x * 1024, py(b.h * .7), b.r * PXM, 0, 6.29); x.fill(); } }
  WT.tx.needsUpdate = true;
}
// puerta en el muro del fondo
hadd(M(new THREE.BoxGeometry(.06, 2.05, .08), lp(0x8a6a48))).position.set(-2.35, 1.17, -1.77); hadd(M(new THREE.BoxGeometry(.06, 2.05, .08), lp(0x8a6a48))).position.set(-1.44, 1.17, -1.77); hadd(M(new THREE.BoxGeometry(.97, .06, .08), lp(0x8a6a48))).position.set(-1.9, 2.2, -1.77);
const doorG = hadd(new THREE.Group()); doorG.position.set(-2.32, .15, -1.76); { const d = M(new THREE.BoxGeometry(.85, 2.0, .05), lp(0xa0784e)); d.position.set(.425, 1.0, 0); const kn = M(new THREE.SphereGeometry(.035, 8, 6), lp(0xd9c060, { metalness: .6 })); kn.position.set(.75, .95, .05); doorG.add(d, kn); }
// canica
const marble = hadd(M(new THREE.SphereGeometry(.07, 16, 12), new THREE.MeshStandardMaterial({ color: 0x3d9bff, roughness: .1, metalness: .1, emissive: 0x1d5abf, emissiveIntensity: .3 })));
// mancha del techo
const ceilStain = hadd(M(new THREE.CircleGeometry(.7, 24), new THREE.MeshBasicMaterial({ color: 0x5a3a1a, transparent: true, opacity: .9, depthWrite: false, side: THREE.DoubleSide }), false)); ceilStain.rotation.x = Math.PI / 2; ceilStain.position.set(-1.5, 2.725, -.9);
const drips = parts(6, 0x3d9bff, .045);
// letrero SE VENDE
const sign = add(new THREE.Group()); sign.position.set(3.75, 0, 1.6); sign.rotation.y = -.25; { const p = M(new THREE.BoxGeometry(.08, 1.4, .08), lp(0x8a6a48)); p.position.y = .7; const st = canvasTex(256, 160), x = st.x; x.fillStyle = '#ff4d61'; x.fillRect(0, 0, 256, 160); x.fillStyle = '#ffffff'; x.font = '900 58px M'; x.textAlign = 'center'; x.textBaseline = 'middle'; x.fillText('SE', 128, 50); x.fillText('VENDE', 128, 112); st.tx.needsUpdate = true; const b = M(new THREE.BoxGeometry(.9, .56, .04), new THREE.MeshStandardMaterial({ map: st.tx })); b.position.y = 1.3; sign.add(p, b); }
// relleno bajo la casa (en el corte del terreno)
const RL = canvasTex(256, 256); { const x = RL.x; x.fillStyle = '#b8935f'; x.fillRect(0, 0, 256, 256); for (let i = 0; i < 90; i++) { x.fillStyle = ['#8a6a48', '#d4b48a', '#6a5a4a', '#9a9c9f'][i % 4]; x.fillRect(r2() * 250, r2() * 250, 6 + r2() * 12, 5 + r2() * 9); } RL.tx.needsUpdate = true; }
const fill = add(M((() => { const gm = new THREE.PlaneGeometry(3.0, 1.8); gm.translate(0, -.9, 0); return gm; })(), new THREE.MeshStandardMaterial({ map: RL.tx, roughness: 1 }), false)); fill.position.set(2.2, -.03, GZ + .012);
const voidM = add(M(new THREE.PlaneGeometry(3.0, .2), new THREE.MeshBasicMaterial({ color: 0x1a120c }), false)); voidM.position.set(2.2, -.1, GZ + .014);
// diorama: muro que se parte + columna
const X0 = 30;
add(M(new THREE.CylinderGeometry(3.6, 3.8, .4, 40), lp(0xd6dbe4))).position.set(X0 + .4, -.2, 0);
const MW = canvasTex(512, 427);
const SPL = [[-.4, 2.0], [-.25, 1.72], [-.2, 1.45], [0, 1.2], [.05, .9], [.25, .65], [.32, .4], [.5, .2], [.6, 0]];
function piece(poly) { const s = new THREE.Shape(); s.moveTo(...poly[0]); poly.slice(1).forEach(p => s.lineTo(...p)); const gm = new THREE.ExtrudeGeometry(s, { depth: .3, bevelEnabled: false }); gm.translate(0, 0, -.15); const tx = MW.tx; const cap = new THREE.MeshStandardMaterial({ map: tx, roughness: .85 }); const m = M(gm, [cap, lp(0xb85a3c)]); return m; }
MW.tx.repeat.set(1 / 2.4, 1 / 2.0); MW.tx.offset.set(.5, 0); MW.tx.wrapS = MW.tx.wrapT = THREE.ClampToEdgeWrapping;
const pL = add(piece([[-1.2, 0], ...SPL.slice().reverse(), [-1.2, 2.0]])), pR = add(piece([[.6, 0], [1.2, 0], [1.2, 2.0], ...SPL]));
pL.position.set(X0, 0, 0); pR.position.set(X0, 0, 0);
const colM = new THREE.MeshStandardMaterial({ color: 0xa9adb3, roughness: .85, flatShading: true, emissive: 0xff4d61, emissiveIntensity: 0 });
add(M(new THREE.BoxGeometry(.36, 2.0, .36), colM)).position.set(X0 + 1.38, 1.0, 0); add(M(new THREE.BoxGeometry(3.0, .3, .38), colM)).position.set(X0 + .1, 2.15, 0);
const colCrack = add(M(new THREE.TubeGeometry(new THREE.CatmullRomCurve3([V(X0 + 1.27, 1.45, .19), V(X0 + 1.36, 1.2, .19), V(X0 + 1.33, 1.0, .19), V(X0 + 1.45, .75, .19), V(X0 + 1.5, .55, .19)]), 40, .016, 4), new THREE.MeshBasicMaterial({ color: 0x2a1a10 }), false)); colCrack.userData.n = colCrack.geometry.index.count;
const macL = new THREE.PointLight(0xfff4e0, 0, 12, 1.2); macL.position.set(X0 + .5, 2.8, 3.2); scene.add(macL);
const MHAIR = [mkCrack(70, 120, 60, 25, 6, 10), mkCrack(120, 190, -25, 40, 5, 9), mkCrack(60, 250, 50, -15, 5, 8)];
function drawMac(t) { const x = MW.x; x.fillStyle = '#efe0c6'; x.fillRect(0, 0, 512, 427); if (t >= K.rayita) MHAIR.forEach(h => drawCrack(x, h, eout(P(t, K.rayita, 1.0)), 2.5, '#8a7a66'));
  if (t >= K.sidiag) { const k = eout(P(t, K.sidiag, 1.0)); const pts = SPL.map(([u, v]) => [(u / 2.4 + .5) * 512, 427 - v / 2.0 * 427]); drawCrack(x, pts, k, 6); }
  MW.tx.needsUpdate = true; }
const dust = parts(30, 0xd8c8a8, .04);
// ---- animación ----
SHOTS = [
  [0, K.diagonal, [4.4, 2.4, 9.4], [3.4, 2.0, 7.8], [2.2, 1.4, .5], [2.0, 1.4, .3]],
  [K.diagonal, K.mira, [1.1, 1.8, 3.6], [1.0, 1.85, 2.7], [.9, 1.8, -1.8], [.9, 1.85, -1.8]],
  [K.mira, K.porque, [0, 1.6, 6.2], [0, 1.5, 5.4], [-.5, 1.4, -1.8], [-.5, 1.4, -1.8]],
  [K.porque, K.tranquilo, [1.8, 1.5, 9.8], [1.2, .9, 8.4], [.8, .5, 0], [.8, .3, 0]],
  [K.tranquilo, K.atraviesa, [X0 + .2, 1.3, 5.6], [X0 + .3, 1.2, 4.6], [X0 + .1, 1.0, 0], [X0 + .1, 1.0, 0]],
  [K.atraviesa, K.columna, [X0 + 1.6, 1.5, 4.4], [X0 + 2.1, 1.4, 3.4], [X0 + .1, 1.0, 0], [X0 + .1, 1.0, 0]],
  [K.columna, K.segunda, [X0 + 1.9, 1.4, 3.3], [X0 + 1.7, 1.25, 2.6], [X0 + 1.38, 1.0, 0], [X0 + 1.38, 1.0, 0]],
  [K.segunda, K.tercera, [-.1, 1.5, 4.8], [-.6, 1.4, 3.9], [-1.8, 1.2, -1.6], [-1.8, 1.2, -1.6]],
  [K.tercera, K.cuarta, [.4, .85, 3.6], [.3, .75, 2.9], [.2, .25, -.6], [.6, .25, -.6]],
  [K.cuarta, K.arriba, [0, 1.0, 5.0], [-.2, .9, 4.3], [.2, .5, -1.8], [.2, .5, -1.8]],
  [K.arriba, K.nadie, [.7, 1.0, 4.2], [.5, 1.1, 3.6], [-1.4, 2.4, -.9], [-1.5, 2.45, -.9]],
  [K.nadie, K.ojo, [4.2, .9, 9.4], [3.2, .4, 7.9], [2.0, -.5, 1.98], [2.0, -.6, 1.98]],
  [K.ojo, K.listo, [1.4, 1.7, 5.8], [.8, 1.6, 4.9], [.4, 1.5, -1.8], [.4, 1.5, -1.8]],
  [K.listo, K.tucasa, [0, 1.7, 7.0], [.3, 1.6, 6.2], [0, 1.3, -1.2], [0, 1.3, -1.2]],
  [K.tucasa, 200, [7, 5, 12], [5.5, 4.2, 10], [0, 1.0, 0], [0, 1.1, 0]],
];
function animWorld(t) {
  skyDay(t); drawWall(t); drawMac(t);
  macL.intensity = inn(t, K.tranquilo, K.segunda) ? 3.4 : 0;
  // la casa se mueve: hundimiento, temblor, relleno
  let tilt = 0, sink = 0; if (inn(t, K.hunde, K.tranquilo)) { const k = eout(P(t, K.hunde, 1.0)); tilt = -.03 * k; sink = -.06 * k; }
  if (inn(t, K.hundiendo - .5, K.ojo)) { const k = eout(P(t, K.hundiendo - .3, 1.6)); tilt = -.035 * k; sink = -.07 * k; }
  HS.rotation.z = tilt; HS.position.y = sink; HS.position.x = inn(t, K.temblor, K.tranquilo) ? Math.sin(t * 40) * .05 * (1 - P(t, K.tranquilo - .4, .4)) : 0;
  fill.visible = inn(t, K.relleno - .3, K.ojo); fill.material.color.set(new THREE.Color(0xffffff).lerp(new THREE.Color(0x9a8a7a), P(t, K.hundiendo, 1.5)));
  voidM.visible = inn(t, K.hundiendo, K.ojo); voidM.scale.y = Math.max(.01, P(t, K.hundiendo, 1.5));
  // diorama
  const sep = eout(P(t, K.atraviesa, .8)) * (t < K.segunda ? 1 : 0); pL.position.set(X0 - .07 * sep, 0, 0); pL.rotation.z = .02 * sep; pR.position.set(X0 + .03 * sep, 0, 0);
  colM.emissiveIntensity = inn(t, K.columna, K.segunda) ? .25 + .2 * Math.sin(t * 8) : 0;
  colCrack.visible = t >= K.columna && t < K.segunda; colCrack.geometry.setDrawRange(0, Math.floor(colCrack.userData.n * eout(P(t, K.columna, 1.0)) / 3) * 3);
  for (let i = 0; i < 30; i++) { const u = clamp((t - K.atraviesa - (i % 6) * .05) / 1.2); setP(dust, i, X0 + .1 + Math.sin(i * 2) * .2, lerp(1.0 + (i % 5) * .2, 0, u * u), .25 + u * .3, inn(t, K.atraviesa, K.columna) && u > 0 && u < 1, 1 - u * .5); } dust.instanceMatrix.needsUpdate = true;
  // puerta que se traba
  let dr = 0; if (inn(t, K.abre, K.traban)) dr = .9 * Math.abs(Math.sin((t - K.abre) * 1.6)); else if (inn(t, K.traban, K.tercera)) dr = .32 + (Math.sin(t * 30) * .015) * (t < K.movio ? 1 : 0);
  doorG.rotation.y = dr;
  // canica
  const mk = P(t, K.rodando - .2, 2.4); marble.visible = inn(t, K.canica + .5, K.cuarta); marble.position.set(lerp(-1.4, 2.6, mk * mk), .22, -.3 + mk * .4); marble.rotation.z = -mk * 30;
  ceilStain.visible = inn(t, K.techo - .3, K.nadie); ceilStain.scale.setScalar(Math.max(.01, eout(P(t, K.techo - .3, 1.0))));
  for (let i = 0; i < 6; i++) { const u = (t * .9 + i / 6) % 1; setP(drips, i, -1.5, lerp(2.68, .2, u * u), -.9, inn(t, K.techo, K.nadie)); } drips.instanceMatrix.needsUpdate = true;
  // personajes
  let op = [3.0, 0, 1.45], ory = -.3, p = { emo: 'happy' }, ev = false, ep = [0, 0, 0], ery = 0, e = { emo: 'neutral' };
  const point = (a = -2.3) => ({ armR: [a, -.3, -.2], armL: [-.2, .15, -.3] }), wow = { armR: [-2.4, -.5, -.4], armL: [-2.4, .5, -.4] };
  if (t < K.diagonal) { p = { emo: t > K.fijaste ? 'worried' : 'happy', armR: [-1.2, -.2, -.6], headRy: -.3 }; }
  else if (t < K.mira) { op = [-.5, 0, -.5]; ory = .7; p = { emo: 'worried', ...point(-2.5), headRy: .4, look: [.6, .6] }; }
  else if (t < K.porque) { op = [2.0, 0, -.4]; ory = -.5; p = { emo: t > K.mueve ? 'surprised' : 'neutral', ...point(-2.2), headRy: -.4 }; }
  else if (t < K.tranquilo) { op = [-1.0, 0, .3]; ory = .3; p = { emo: 'surprised', ...wow, bob: inn(t, K.temblor, K.tranquilo) ? Math.sin(t * 40) * .02 : 0 }; }
  else if (t < K.segunda) { op = [X0 - 1.7, 0, .5]; ory = .7; p = { emo: t > K.atraviesa ? 'surprised' : t > K.notodas ? 'happy' : 'neutral', ...point(-1.6), headRy: .3 }; }
  else if (t < K.tercera) { op = [-1.1, 0, -.75]; ory = -2.2; p = { emo: t > K.traban ? 'surprised' : 'determined', armR: [-1.5, -.2, -.3], armL: [-1.4, .2, -.3], headRy: t > K.traban ? 1.0 : 0 }; }
  else if (t < K.cuarta) { op = [-1.75, 0, -.55]; ory = .9; const cr = t < K.rodando; p = cr ? { emo: 'neutral', hipY: .6, spineRx: .45, legs: [-1.2, 1.9, -1.2, 1.9], armR: [-.9, -.2, -.3] } : { emo: 'surprised', headRy: .9, look: [.8, -.5] }; }
  else if (t < K.arriba) { op = [1.3, 0, -.75]; ory = -.4; p = { emo: 'worried', ...point(-.8), headRy: -.5, look: [-.5, -.8] }; }
  else if (t < K.nadie) { op = [-.2, 0, -.2]; ory = -.6; p = { emo: 'surprised', headRx: -.5, look: [-.4, 1], ...point(-2.7) }; }
  else if (t < K.ojo) { op = [4.4, 0, 1.2]; ory = -.6; p = { emo: 'worried', headRx: .4, look: [-.4, -1] }; }
  else if (t < K.listo) { op = [1.9, 0, -.3]; ory = -.4; p = { emo: t > K.despues ? 'determined' : 'neutral', look: [-.5, .2] }; ev = true; ep = [.5, 0, -1.05]; ery = 2.9; e = { emo: 'determined', armL: [-1.0, .3, -.6], armR: [-2.3, -.3, -.2], headRx: -.2 }; }
  else if (t < K.tucasa) { op = [.6, 0, .4]; ory = .1; p = { emo: 'happy', armR: [-2.6, -.35, -.2 + .3 * Math.sin(t * 8)], armL: [-.2, .15, -.3] }; ev = true; ep = [-.9, 0, .2]; ery = .3; e = { emo: 'happy', armL: [-.9, .3, -.6] }; }
  else { op = [3.9, 0, 1.3]; ory = -.4; p = { emo: 'happy', armR: [-2.3, -.3, -.1], armL: [-.2, .15, -.3] }; }
  owner.root.position.set(op[0], op[1] + (op[0] < 3.3 && op[0] > -3.3 && op[2] < 1.9 ? HS.position.y : 0), op[2]); owner.root.rotation.y = ory; pose(owner, p, t);
  eng.root.visible = ev; eng.root.position.set(...ep); eng.root.rotation.y = ery; pose(eng, e, t + 1.3); wrench.visible = false; engCB.visible = true;
  // etiquetas
  OVL.length = 0; const Lb = (text, at, end, pos, color = '#ffcc33') => { if (t >= at && t < end) OVL.push({ text, at, end, pos, color }); };
  const WIN = V(.9, 2.45, -1.8);
  Lb('20 AÑOS PAGANDO', .1, K.fijaste, V(1.0, 3.6, 0)); Lb('¿Y ESTA GRIETA?', K.fijaste, K.diagonal, V(1.0, 3.6, 0), '#ff6a4a');
  Lb('GRIETA EN DIAGONAL', K.diagonal, K.pintura1, WIN, '#ff6a4a'); Lb('✖ NO ES DE PINTURA', K.pintura1, K.mira, WIN, '#ff6a4a');
  Lb('ESQUINAS = PUNTO DÉBIL', K.esquinas, K.mueve, V(-.5, 2.5, -1.8), '#ff8a4a'); Lb('AHÍ SE ROMPE PRIMERO', K.mueve, K.porque, V(-.5, 2.5, -1.8), '#ff6a4a');
  Lb('¿POR QUÉ SE MUEVE?', K.porque, K.hunde, V(.8, 3.6, 0)); Lb('LA TIERRA SE HUNDE', K.hunde, K.temblor, V(2.5, -1.0, GZ), '#ff8a4a'); Lb('O UN TEMBLOR', K.temblor, K.tranquilo, V(.8, 3.6, 0), '#ff6a4a');
  const MW2 = V(X0, 2.7, 0);
  Lb('TRANQUILO', K.tranquilo, K.rayita, MW2, '#7be36b'); Lb('RAYITA FINA', K.rayita, K.capa, MW2); Lb('✔ SOLO LA CAPA DE ENCIMA', K.capa, K.sidiag, MW2, '#7be36b');
  Lb('✖ EN DIAGONAL', K.sidiag, K.atraviesa, MW2, '#ff6a4a'); Lb('✖ ATRAVIESA LA PARED', K.atraviesa, K.columna, MW2, '#ff6a4a'); Lb('✖ COLUMNA O VIGA', K.columna, K.estructura, V(X0 + 1.38, 2.6, 0), '#ff6a4a'); Lb('ES DE LA ESTRUCTURA', K.estructura, K.segunda, V(X0 + 1.38, 2.6, 0), '#ff6a4a');
  const DR = V(-1.9, 2.55, -1.7);
  Lb('2. PUERTAS Y VENTANAS', K.segunda, K.traban, DR); Lb('SE TRABAN', K.traban, K.traban + 1.4, DR, '#ff6a4a'); Lb('HUECO EN EL MARCO', K.traban + 1.4, K.movio, DR, '#ff6a4a'); Lb('LA CASA SE MOVIÓ', K.movio, K.tercera, DR, '#ff6a4a');
  Lb('3. EL PISO', K.tercera, K.canica, V(.4, 1.4, -.6)); Lb('UNA CANICA', K.canica, K.rodando, V(.4, 1.4, -.6), '#6cc4ff'); Lb('SE VA SOLITA', K.rodando, K.torcido, V(.4, 1.4, -.6), '#ff8a4a'); Lb('PISO TORCIDO', K.torcido, K.cuarta, V(.4, 1.4, -.6), '#ff6a4a');
  Lb('4. ABAJO DE LAS PAREDES', K.cuarta, K.manchas, V(0, 1.6, -1.8)); Lb('SALITRE', K.manchas, K.humedad, V(0, 1.6, -1.8), '#ffffff'); Lb('HUMEDAD DEL SUELO', K.humedad, K.arriba, V(0, 1.6, -1.8), '#6cc4ff');
  Lb('MIRA ARRIBA', K.arriba, K.techo, V(-1.5, 2.4, -.9)); Lb('GOTERAS', K.techo, K.bano, V(-1.5, 2.4, -.9), '#6cc4ff'); Lb('O FUGA DEL BAÑO DE ARRIBA', K.bano, K.nadie, V(-1.5, 2.4, -.9), '#6cc4ff');
  Lb('¿TERRENO DE RELLENO?', K.nadie, K.hundiendo, V(2.2, .6, GZ), '#ff8a4a'); Lb('SE SIGUE HUNDIENDO', K.hundiendo, K.ojo, V(2.2, .6, GZ), '#ff6a4a');
  Lb('NO SIEMPRE ESTÁ MAL', K.nosiempre, K.ingeniero, V(.4, 2.6, -1.8), '#7be36b'); Lb('QUE LO REVISE UN INGENIERO', K.ingeniero, K.antes, V(.4, 2.6, -1.8));
  Lb('¡YA SABES REVISAR UNA CASA!', K.listo + .4, K.tucasa, V(0, 2.6, -1.0), '#7be36b'); Lb('¿TU CASA TIENE GRIETAS?', K.tucasa + .2, CTA_ST, V(0, 4.2, 0), '#ff8a4a');
}
function overlay2d(t) {
  const contract = (stamp) => x => { x.font = '900 36px M'; x.fillStyle = '#2a2c33'; x.fillText('CRÉDITO DE CASA', 0, -50); x.fillStyle = '#ff4d61'; x.font = '900 64px M'; x.fillText('20 AÑOS', 0, 15); x.strokeStyle = '#2a2c33'; x.lineWidth = 3; x.beginPath(); x.moveTo(-150, 110); x.lineTo(150, 110); x.stroke(); x.font = '700 22px M'; x.fillStyle = '#8a92a8'; x.fillText('FIRMA', 0, 132);
    if (stamp) { const s = eback(P(t, stamp[0], .35)); if (s > 0) { x.save(); x.translate(0, 70); x.rotate(-.15); x.scale(s, s); x.strokeStyle = stamp[1]; x.lineWidth = 8; rrp(x, 0, -170, -38, 340, 76, 12); x.stroke(); x.font = '900 40px M'; x.fillStyle = stamp[1]; x.fillText(stamp[2], 0, 3); x.restore(); } } };
  card(t, .05, K.diagonal - .1, 540, 1440, 'CONTRATO', '#3d8bff', contract(null));
  card(t, K.antes - .1, K.listo, 540, 1440, 'CONTRATO', '#3d8bff', contract(t < K.despues ? [K.antes + .2, '#1aa86a', '✔ ANTES DE FIRMAR'] : [K.despues, '#e8383a', '✖ NO DESPUÉS']));
}
const KEYW = new Set(['veinte', 'años', 'casa', 'grieta', 'diagonal', 'esquina', 'ventana', 'pintura', 'esquinas', 'débil', 'mueve', 'rompe', 'tierra', 'hunde', 'temblor', 'tranquilo', 'rayita', 'cemento', 'atraviesa', 'columna', 'viga', 'estructura', 'puertas', 'ventanas', 'traban', 'hueco', 'marco', 'movió', 'piso', 'canica', 'pelotita', 'rodando', 'torcido', 'salitre', 'humedad', 'techo', 'goteras', 'fuga', 'baño', 'terreno', 'rellenaron', 'hundiendo', 'ingeniero', 'firmar', 'después', 'listo', 'experto', 'comentarios']);

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
  overlayLabels(t); if (t < CTA_ST) { overlay2d(t); caption(t); } watermark(t); followCTA(t);
  const fo = P(t, END - .3, .3); if (fo > 0) { g.fillStyle = `rgba(0,0,0,${fo})`; g.fillRect(0, 0, W, H); }
}
window.renderAt = renderAt; window.END = END;
window.frameJPG = (t, q = .92) => { renderAt(t); return out.toDataURL('image/jpeg', q).split(',')[1]; };
window.READY = true;
