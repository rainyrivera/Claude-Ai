// Reel 9:16 3D (Estilo B: construcción en corte) — Construyes el segundo piso
import * as THREE from 'three';
import { EffectComposer } from 'three/addons/postprocessing/EffectComposer.js';
import { RenderPass } from 'three/addons/postprocessing/RenderPass.js';
import { UnrealBloomPass } from 'three/addons/postprocessing/UnrealBloomPass.js';
import { OutputPass } from 'three/addons/postprocessing/OutputPass.js';

const W = 1080, H = 1920, END = 105.0;   // END = última palabra + 3,7 s (cierre)
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
// ---------- mundo: casa de un piso que crece a dos ----------
const GZ = 1.98;
add(M(new THREE.BoxGeometry(50.1, .25, 24.1), lp(0x5fae4a))).position.set(0, -.1, GZ - 12);
{ const b = add(M(new THREE.BoxGeometry(50, 3.4, 24), lp(0x8a5a34))); b.position.set(0, -1.92, GZ - 12); const r = add(M(new THREE.BoxGeometry(50, 3, 24), lp(0x6c717c))); r.position.set(0, -5.1, GZ - 12); }
for (let i = 0; i < 30; i++) { const r = add(M(new THREE.DodecahedronGeometry(.08 + rnd() * .15, 0), lp(0x6a5a4a))); const x = (rnd() - .5) * 24; r.position.set(Math.abs(Math.abs(x) - 3.3) < .7 ? x + 1.6 : x, -1.3 - rnd() * 2.2, GZ + .02); }
for (let i = -12; i <= 12; i++) { const p = add(M(new THREE.BoxGeometry(.16, 1, .16), lp(0xdcdcd6))); p.position.set(i * 1.6, .5, -7); }
function bgHouse(x, z, c, two) { const h = new THREE.Group(); const hh = two ? 5.2 : 2.6; const b = M(new THREE.BoxGeometry(4, hh, 3.4), lp(c)); b.position.y = hh / 2; h.add(b); const rf = M(new THREE.BoxGeometry(4.2, .25, 3.6), lp(0x9a9ea6)); rf.position.y = hh + .1; h.add(rf); for (const wx of [-1, 1]) for (let f = 0; f < (two ? 2 : 1); f++) { const w = M(new THREE.BoxGeometry(.7, .7, .05), lp(0x9fd3e6)); w.position.set(wx, 1.6 + f * 2.6, 1.72); h.add(w); } h.position.set(x, 0, z); scene.add(h); }
bgHouse(-10, -11, 0xe9d7b5, 1); bgHouse(9, -12, 0xf3e2c4); bgHouse(14, -7, 0xe0cdb0, 1); bgHouse(-15, -6, 0xf0dcc0);
for (let i = 0; i < 6; i++) { const tr = new THREE.Group(); const tk = M(new THREE.CylinderGeometry(.12, .16, 1.2, 6), lp(0x7a5230)); tk.position.y = .6; const cr = M(new THREE.IcosahedronGeometry(.9, 0), lp(0x4f9a3e)); cr.position.y = 1.7; tr.add(tk, cr); tr.position.set([-7, -5.5, 10.5, 7.5, -12, 12][i], 0, [-4, -9, -4.5, -9, -3, -3][i]); scene.add(tr); }
// grupo de la casa (se hunde)
const HS = add(new THREE.Group());
const hadd = o => { HS.add(o); return o; };
const W1 = lp(0xf2e3c8), W2 = lp(0xfff4e0);
// cimientos (zapatas corridas) visibles en el corte del terreno
const footM = new THREE.MeshStandardMaterial({ color: 0x9a9c9f, roughness: .9, flatShading: true, emissive: 0xff2a1a, emissiveIntensity: 0 });
const footR = [];
for (const x of [-3.3, 3.3]) {
  const z0 = hadd(M(new THREE.BoxGeometry(.75, .25, 3.96), footM)); z0.position.set(x, -.85, .02);
  const st = hadd(M(new THREE.BoxGeometry(.25, .72, 3.96), footM)); st.position.set(x, -.38, .02);
  const r = hadd(M(new THREE.BoxGeometry(1.5, .3, 3.97), lp(0xc9d3cf))); r.position.set(x, -1.02, .02); footR.push(r);
}
// planta baja
hadd(M(new THREE.BoxGeometry(6.6, .15, 3.8), lp(0xc8a27a))).position.set(0, .07, 0);
hadd(M(new THREE.BoxGeometry(6.6, 2.7, .16), W2)).position.set(0, 1.35, -1.9);
for (const x of [-3.3, 3.3]) hadd(M(new THREE.BoxGeometry(.16, 2.7, 3.8), W1)).position.set(x, 1.35, 0);
const slab1 = hadd(M(new THREE.BoxGeometry(6.9, .3, 4.1), lp(0x8f939b))); slab1.position.set(0, 2.85, 0);
// muebles planta baja: sillón, mesa, lavabo
hadd(M(new THREE.BoxGeometry(1.8, .45, .8), lp(0x4f7fd8))).position.set(1.3, .38, -1.35);
hadd(M(new THREE.BoxGeometry(1.8, .55, .25), lp(0x3f6cc0))).position.set(1.3, .8, -1.7);
hadd(M(new THREE.BoxGeometry(.9, .06, .6), lp(0x8a6a48))).position.set(1.3, .48, -.3);
hadd(M(new THREE.BoxGeometry(.7, .12, .45), lp(0xffffff))).position.set(-2.3, .9, -1.58);
hadd(M(new THREE.BoxGeometry(.2, .82, .2), lp(0xf2f2f2))).position.set(-2.3, .45, -1.62);
hadd(M(new THREE.BoxGeometry(.08, .22, .08), lp(0xb9c0d0, { metalness: .5 }))).position.set(-2.3, 1.07, -1.77);
hadd(M(new THREE.BoxGeometry(.06, .06, .2), lp(0xb9c0d0, { metalness: .5 }))).position.set(-2.3, 1.16, -1.68);
const clock = hadd(new THREE.Group()); clock.position.set(-2.75, 2.25, -1.8); { const f = M(new THREE.CylinderGeometry(.22, .22, .05, 24), lp(0xffffff)); f.rotation.x = Math.PI / 2; clock.add(f); const r = M(new THREE.TorusGeometry(.22, .03, 6, 24), lp(0x2a2c33)); clock.add(r); }
// grietas (tubo zigzag que crece)
const crackM = new THREE.MeshBasicMaterial({ color: 0x3a2618 }), crackRed = new THREE.MeshBasicMaterial({ color: 0xd8322a });
function crack(pts, m = crackM, r = .022) { const gm = new THREE.TubeGeometry(new THREE.CatmullRomCurve3(pts, false, 'catmullrom', .1), 60, r, 4); const o = hadd(M(gm, m, false)); o.userData.n = gm.index.count; return o; }
const zig = (x0, y0, z0, dx, dy, n, axis = 'x') => { const p = []; for (let i = 0; i <= n; i++) { const j = (i % 2 ? .12 : -.12); p.push(axis === 'x' ? V(x0 + dx * i / n + j, y0 + dy * i / n, z0) : V(x0, y0 + dy * i / n, z0 + dx * i / n + j)); } return p; };
const cracks1 = [crack(zig(2.4, 2.65, -1.81, -1.3, -1.9, 7)), crack(zig(-1.2, 2.65, -1.81, .9, -1.6, 6)), crack(zig(-3.21, 2.65, .8, -1.2, -1.7, 6, 'z'))];
const growCrack = (c, k) => { c.visible = k > .01; c.geometry.setDrawRange(0, Math.floor(c.userData.n * k / 3) * 3); };
// varillas de espera en la azotea
const CP = [[-3.25, -1.8], [3.25, -1.8], [-3.25, 1.8], [3.25, 1.8], [-3.25, 0], [3.25, 0]];
const rustM = lp(0xb5582a), steelM = lp(0x6f7480, { metalness: .4, roughness: .5 });
const rebar = [], rebarNew = [];
for (const [x, z] of CP) for (const o of [[-.06, -.06], [.06, .06], [-.06, .06], [.06, -.06]]) {
  const b = hadd(M(new THREE.CylinderGeometry(.022, .022, 1.1, 6), rustM)); b.position.set(x + o[0], 3.55, z + o[1]); b.rotation.z = (o[0] + o[1]) * .5; rebar.push(b);
}
for (const [x, z] of CP) { const b = hadd(M(new THREE.CylinderGeometry(.026, .026, 1.2, 6), steelM)); b.userData.x = x; b.userData.z = z; rebarNew.push(b); }
// varilla en macro (óxido que se come el acero), con corte para ver el núcleo
const macro = hadd(new THREE.Group()); macro.position.set(0, 3.0, .8);
const mCore = M(new THREE.CylinderGeometry(.2, .2, 1.5, 24), lp(0x7a8088, { metalness: .5, roughness: .4 })); mCore.position.y = .75; macro.add(mCore);
for (let i = 0; i < 7; i++) { const r = M(new THREE.TorusGeometry(.2, .03, 6, 24), lp(0x7a8088, { metalness: .5 })); r.rotation.x = Math.PI / 2; r.position.y = .15 + i * .2; mCore.add(r); r.position.y -= .75; }
const mRust = M(new THREE.CylinderGeometry(.24, .26, 1.5, 24, 1, true, 1.35, Math.PI * 1.45), new THREE.MeshStandardMaterial({ color: 0xb04e22, roughness: 1, flatShading: true, side: THREE.DoubleSide })); mRust.position.y = .75; macro.add(mRust);
// segundo piso: muros de tabique (crecen desde abajo)
const brickTex = (() => { const t = canvasTex(256, 256), x = t.x; x.fillStyle = '#d8c8b0'; x.fillRect(0, 0, 256, 256); for (let r = 0; r < 8; r++) for (let c = -1; c < 5; c++) { const off = r % 2 ? 32 : 0; x.fillStyle = ['#b85a3c', '#c4643f', '#ab5236'][(r * 3 + c + 6) % 3]; x.fillRect(c * 64 + off + 3, r * 32 + 3, 58, 26); } t.tx.needsUpdate = true; return t.tx; })();
function brickMat(w, h) { const tx = brickTex.clone(); tx.wrapS = tx.wrapT = THREE.RepeatWrapping; tx.repeat.set(w / 1.2, h / .96); tx.needsUpdate = true; return new THREE.MeshStandardMaterial({ map: tx, roughness: .9 }); }
const W2F = [];
function wallPiece(w, h, d, x, y0, z, kind) { const gm = new THREE.BoxGeometry(w, h, d); gm.translate(0, h / 2, 0); const bm = brickMat(Math.max(w, d), h); const m = hadd(M(gm, bm)); m.position.set(x, y0, z); m.userData = { bm, kind, x, y0, z }; W2F.push(m); return m; }
const WH = 2.55, Y2 = 3.0;
wallPiece(2.3, WH, .16, -2.15, Y2, -1.9, 'bL'); wallPiece(2.3, WH, .16, 2.15, Y2, -1.9, 'bR');
wallPiece(2.0, .9, .16, 0, Y2, -1.9, 'bB'); wallPiece(2.0, .6, .16, 0, Y2 + 1.95, -1.9, 'bT');
wallPiece(.16, WH, 3.8, -3.3, Y2, 0, 'sL'); wallPiece(.16, WH, 3.8, 3.3, Y2, 0, 'sR');
// castillos, dalas, marco de ventana
const concM = new THREE.MeshStandardMaterial({ color: 0xa9adb3, roughness: .85, flatShading: true, emissive: 0x7be36b, emissiveIntensity: 0 });
const cast = CP.map(([x, z]) => { const gm = new THREE.BoxGeometry(.42, WH, .42); gm.translate(0, WH / 2, 0); const m = hadd(M(gm, concM)); m.position.set(x, Y2, z); return m; });
const dalas = [[6.8, .3, 0, -1.8], [6.8, .3, 0, 1.8], [.3, 3.9, -3.25, 0], [.3, 3.9, 3.25, 0]].map(([w, d, x, z]) => { const m = hadd(M(new THREE.BoxGeometry(w, .22, d), concM)); m.position.set(x, Y2 + WH + .11, z); return m; });
const marco = new THREE.Group(); HS.add(marco); marco.position.set(0, 0, -1.9);
for (const [w, h, x, y] of [[.16, 1.15, -1.08, 4.42], [.16, 1.15, 1.08, 4.42], [2.32, .12, 0, 3.86], [2.32, .14, 0, 4.98]]) { const m = M(new THREE.BoxGeometry(w, h, .22), concM); m.position.set(x, y, 0); marco.add(m); }
const winCracks = [crack(zig(-1, 3.9, -1.8, -.9, -.6, 4), crackRed, .026), crack(zig(1, 3.9, -1.8, .9, -.6, 4), crackRed, .026), crack(zig(-1, 4.95, -1.8, -.9, .5, 4), crackRed, .026), crack(zig(1, 4.95, -1.8, .9, .5, 4), crackRed, .026)];
const glass2 = hadd(M(new THREE.BoxGeometry(2.0, 1.05, .03), new THREE.MeshStandardMaterial({ color: 0xbfe6ff, transparent: true, opacity: .4, roughness: .1, depthWrite: false }), false)); glass2.position.set(0, 4.42, -1.9);
// losa nueva: parrilla de varilla + colado
const grid = new THREE.Group(); HS.add(grid);
for (let i = 0; i < 11; i++) { const b = M(new THREE.BoxGeometry(6.7, .035, .035), steelM, false); b.position.set(0, 0, -1.85 + i * .37); grid.add(b); }
for (let i = 0; i < 18; i++) { const b = M(new THREE.BoxGeometry(.035, .035, 3.8), steelM, false); b.position.set(-3.3 + i * .388, .04, 0); grid.add(b); }
const slab2 = (() => { const gm = new THREE.BoxGeometry(6.9, .3, 4.1); gm.translate(0, .15, 0); const m = hadd(M(gm, lp(0x8f939b))); m.position.set(0, Y2 + WH + .2, 0); return m; })();
const ROOF2 = Y2 + WH + .5;
// tubos: agua, luz, drenaje (crecen hacia abajo)
function pipe(x, z, top, bot, r, c) { const len = top - bot; const gm = new THREE.CylinderGeometry(r, r, len, 10); gm.translate(0, -len / 2, 0); const m = hadd(M(gm, lp(c), false)); m.position.set(x, top, z); const h = M(new THREE.CylinderGeometry(r, r, 1.4, 10), lp(c), false); h.rotation.x = Math.PI / 2; h.position.set(0, 0, .7); m.add(h); return m; }
const pipes = [pipe(-2.65, -1.66, ROOF2 - .25, .95, .06, 0x3d8bff), pipe(2.95, -1.66, ROOF2 - .25, 1.3, .05, 0xffcc33), pipe(1.9, -1.64, ROOF2 - .25, -.7, .1, 0xb9bcc4)];
const hole = hadd(M(new THREE.CircleGeometry(.36, 7), new THREE.MeshBasicMaterial({ color: 0x3a2a20 }), false)); hole.position.set(-2.62, 2.0, -1.8);
// escalera exterior: empinada vs cómoda
function stair(n, run) { const gr = new THREE.Group(); const d = run / n; for (let i = 0; i < n; i++) { const top = Y2 * (i + 1) / n; const s = M(new THREE.BoxGeometry(d, top, 1.0), lp(0xa9adb3)); s.position.set(3.5 + run - (i + .5) * d, top / 2, .7); gr.add(s); } scene.add(gr); return gr; }
const stairBad = stair(8, 1.4), stairOk = stair(16, 4.8);
// tinaco y su base
const tin = add(new THREE.Group());
{ const b = M(new THREE.CylinderGeometry(.5, .46, 1.0, 20), lp(0x1f2125)); b.position.y = .5; tin.add(b); const l = M(new THREE.CylinderGeometry(.3, .34, .14, 16), lp(0x2a2c33)); l.position.y = 1.06; tin.add(l); for (const y of [.25, .75]) { const r = M(new THREE.TorusGeometry(.49, .02, 6, 24), lp(0x2a2c33)); r.rotation.x = Math.PI / 2; r.position.y = y; tin.add(r); } }
const tinStand = add(new THREE.Group()); tinStand.position.set(-4.6, 0, -1.0);
for (const [x, z] of [[-.4, -.4], [.4, -.4], [-.4, .4], [.4, .4]]) { const l = M(new THREE.BoxGeometry(.08, Y2, .08), lp(0x5a5f6a)); l.position.set(x, Y2 / 2, z); tinStand.add(l); }
{ const p = M(new THREE.BoxGeometry(1.0, .08, 1.0), lp(0x5a5f6a)); p.position.y = Y2; tinStand.add(p); }
// cama planta alta (casa terminada)
const bed2 = new THREE.Group(); HS.add(bed2); { const a = M(new THREE.BoxGeometry(2.0, .3, 1.2), lp(0x8a6a48)); a.position.y = .15; const b = M(new THREE.BoxGeometry(1.95, .16, 1.15), lp(0xf4f4f0)); b.position.y = .38; const c = M(new THREE.BoxGeometry(1.2, .06, 1.17), lp(0xe86a5a)); c.position.set(.35, .48, 0); bed2.add(a, b, c); } bed2.position.set(-1.9, Y2, -1.1);
// varillas de espera en la nueva azotea (cierre)
const rebar2 = CP.map(([x, z]) => { const gr = new THREE.Group(); for (const o of [[-.06, -.06], [.06, .06], [-.06, .06], [.06, -.06]]) { const b = M(new THREE.CylinderGeometry(.022, .022, 1.0, 6), rustM); b.position.set(o[0], .5, o[1]); gr.add(b); } gr.position.set(x, ROOF2, z); HS.add(gr); return gr; });
// flechas de peso
const arrowM = new THREE.MeshBasicMaterial({ color: 0xff6a2a, transparent: true, depthTest: false });
const arrows = []; for (let i = 0; i < 6; i++) { const a = new THREE.Group(); const sh = M(new THREE.CylinderGeometry(.07, .07, .5, 8), arrowM, false); sh.position.y = .32; const cn = M(new THREE.ConeGeometry(.17, .3, 10), arrowM, false); cn.rotation.x = Math.PI; a.add(sh, cn); a.renderOrder = 8; sh.renderOrder = cn.renderOrder = 8; a.userData.x = i % 2 ? 3.3 : -3.3; a.userData.o = Math.floor(i / 2) / 3; scene.add(a); arrows.push(a); }
// partículas
function parts(n, c, r = .05) { const m = new THREE.InstancedMesh(new THREE.SphereGeometry(r, 6, 4), new THREE.MeshBasicMaterial({ color: c }), n); m.frustumCulled = false; scene.add(m); return m; }
const tmp = new THREE.Object3D();
function setP(m, i, x, y, z, vis, s = 1) { tmp.position.set(x, y, z); tmp.scale.setScalar(vis ? s : .001); tmp.updateMatrix(); m.setMatrixAt(i, tmp.matrix); }
const dust = parts(40, 0xd8c8a8, .07), debris = parts(24, 0x9a8a78, .06), water = parts(26, 0x5ab8ff, .035), flakes = parts(16, 0xb04e22, .03), spark = parts(16, 0x9cff8a, .04);
// personajes
const owner = makeChar({ shirt: 0xff8a3d, pants: 0x2b3350 }); scene.add(owner.root);
const eng = makeChar({ shirt: 0x3d6bff, pants: 0x262c45, skin: 0xc68a62, hair: 0x1a1210, clipboard: true }); scene.add(eng.root);
{ const hm = mat(0xffcc33, { roughness: .35 }); const dome = mesh(new THREE.SphereGeometry(.34, 24, 12, 0, Math.PI * 2, 0, Math.PI / 2), hm); dome.position.y = .08; const brim = mesh(new THREE.CylinderGeometry(.42, .42, .03, 24), hm); brim.position.y = .09; eng.head.add(dome, brim); }
const fillL = new THREE.PointLight(0xfff4e0, 3.2, 9, 1.2); fillL.position.set(0, 2.2, 1.6); scene.add(fillL);
const fill2 = new THREE.PointLight(0xfff4e0, 0, 9, 1.2); fill2.position.set(0, 5.0, 1.6); scene.add(fill2);
const OVL_DUMMY = 0;
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
const K = { aguantar: T('aguantar'), subes: PS(3), grietas: T('grietas'), porque: PS(5), peso: T('peso'), cimientos: T('cimientos'), hunden: PS(7), antes: PS(8), ingeniero: T('ingeniero'), refuerza: T('refuerza'), ahora: PS(11), varillas2: PS(12), oxidadas: T('oxidadas'), oxido: PS(15), come: T('come'), revisan: PS(16), refuerzan: T('refuerzan'), levantas: PS(18), castillos1: T('castillos', 1), temblor: T('temblor'), abren: T('abren'), poreso: PS(20), castillos2: T('castillos', 2), dala: T('dala'), marco: PS(22), tambien: PS(23), alrededor: T('alrededor'), cuarteen: T('cuarteen'), encima: PS(24), varilla: T('varilla'), colar: PS(25), tubos: PS(26), agua: T('agua', 1), luz: T('luz'), drenaje: T('drenaje'), sino: PS(27), romper: T('romper'), escalera: PS(28), empinada: T('empinada'), subirla: T('subirla'), tinaco: PS(31), altura: PS(32), papel: PS(33), licencia: T('licencia'), sin: PS(35), multar: T('multar'), parar: PS(36), felic: PS(37), crecio: T('creció'), sinuna: PS(39), dime: PS(40) };
const POUR = K.romper + .4, ST2 = K.subirla + .5;
const SHOTS = [
  [0, K.subes, [7.5, 7.2, 11], [5.4, 6.0, 8.6], [.6, 2.9, 0], [.8, 3.2, .2]],
  [K.subes, K.porque, [1.4, 4.2, 15], [1.0, 3.9, 13.8], [0, 3.2, -.5], [0, 3.0, -.5]],
  [K.porque, K.antes, [7, 2.2, 14], [5.5, 1.0, 12], [1.0, 1.8, 0], [1.2, .6, 0]],
  [K.antes, K.ahora, [5.5, 2.2, 9.5], [4.6, 1.6, 8.2], [2.0, .8, .8], [2.4, .4, 1.0]],
  [K.ahora, K.oxido, [7.5, 5.2, 6.5], [6.3, 4.7, 5.4], [2.4, 3.6, 1.0], [2.6, 3.5, 1.1]],
  [K.oxido, K.revisan, [1.6, 4.4, 3.8], [1.3, 4.2, 3.2], [0, 3.7, .8], [0, 3.7, .8]],
  [K.revisan, K.levantas, [7.8, 5.6, 7.0], [6.6, 5.0, 5.8], [2.0, 3.5, .6], [2.4, 3.5, .8]],
  [K.levantas, K.tambien, [7, 5.6, 12], [5.2, 5.0, 10.2], [0, 4.1, 0], [0, 4.2, 0]],
  [K.tambien, K.encima, [.6, 4.6, 5.6], [.3, 4.5, 4.6], [0, 4.4, -1.9], [0, 4.4, -1.9]],
  [K.encima, K.tubos, [5.5, 11, 7.5], [4.3, 10, 6.2], [0, 5.4, 0], [0, 5.4, 0]],
  [K.tubos, K.escalera, [1.0, 3.6, 12.5], [.7, 3.4, 11.5], [0, 3.1, -.6], [0, 3.0, -.6]],
  [K.escalera, K.tinaco, [11, 4.2, 9.5], [9.6, 3.6, 8.2], [5.4, 1.6, .3], [5.6, 1.5, .3]],
  [K.tinaco, K.papel, [-6, 3.6, 12], [-5, 3.4, 10.5], [-2.4, 2.8, -.6], [-2.4, 2.7, -.6]],
  [K.papel, K.felic, [.4, 3.0, 8.2], [.2, 2.8, 7.0], [0, 2.2, 0], [0, 2.1, 0]],
  [K.felic, K.dime, [10, 7, 13], [-7, 6.4, 12.5], [0, 3.2, 0], [0, 3.2, 0]],
  [K.dime, 200, [5.5, 10, 8.5], [4.3, 9.0, 7.0], [0, 6.5, 0], [0, 6.6, 0]],
];
const CUTS = SHOTS.map(s => s[0]).slice(1);
const inn = (t, a, b) => t >= a && t < b;
function camAt(t) {
  const s = SHOTS.find(s => t >= s[0] && t < s[1]) || SHOTS[SHOTS.length - 1]; const k = eio(clamp((t - s[0]) / (Math.min(s[1], END) - s[0])));
  cam.position.copy(V(...s[2]).lerp(V(...s[3]), k)); cam.fov = 50; cam.updateProjectionMatrix(); cam.lookAt(V(...s[4]).lerp(V(...s[5]), k));
  if (inn(t, K.temblor - .1, K.poreso)) { const a = .07 * (1 - P(t, K.poreso - .4, .4)); cam.position.x += Math.sin(t * 55) * a; cam.position.y += Math.sin(t * 47) * a * .7; }
}
// muros del 2.º piso: subir (kr), romperse (kb)
function wallK(t) {
  if (t < K.antes + .5) return inn(t, K.subes, K.antes + .5) ? eout(P(t, K.subes, .7)) * (1 - P(t, K.antes, .45)) : 0;
  return eout(P(t, K.levantas, 1.1));
}
function animWorld(t) {
  const sky = new THREE.Color(0x8fd0ff); scene.background = sky; scene.fog.color.copy(sky);
  hemi.intensity = 1.3; sunL.intensity = 2.8; sunL.position.set(5, 20, 9); sunL.target.position.set(0, 0, 0);
  sun.visible = true; sun.position.set(7, 15, -22); sunHalo.position.copy(sun.position); sunHalo.scale.setScalar(9); sunHalo.material.opacity = .9;
  moon.visible = false; stars.visible = false;
  clouds.forEach(c => { c.position.x = ((c.position.x + 40 + c.userData.v * .02) % 80) - 40; });
  // la casa se hunde
  const sinkY = inn(t, K.hunden, K.antes) ? -.22 * eout(P(t, K.hunden + .1, .7)) : 0; HS.position.y = sinkY;
  footM.emissiveIntensity = inn(t, K.hunden, K.antes) ? .5 * P(t, K.hunden, .4) * (.8 + .2 * Math.sin(t * 8)) : 0;
  footR.forEach(r => { const k = eback(P(t, K.refuerza, .6)); r.visible = t >= K.refuerza; r.scale.x = Math.max(.001, k); });
  // grietas planta baja
  cracks1.forEach((c, i) => growCrack(c, inn(t, K.grietas - .1, K.antes) ? eout(P(t, K.grietas - .1 + i * .3, 1.0)) : 0));
  // varillas: óxido y varilla nueva
  const rk = P(t, K.oxidadas - .2, .8); rustM.color.set(new THREE.Color(0x8a6a5a).lerp(new THREE.Color(0xb5582a), t < K.ahora ? 1 : rk));
  const showRebar = t < K.levantas + .8 || false; rebar.forEach(b => b.visible = showRebar);
  rebarNew.forEach((b, i) => { const t0 = K.refuerzan + i * .12; b.visible = t >= t0 && t < K.levantas + .8; b.position.set(b.userData.x + .12, 3.6 + 2.4 * (1 - eout(P(t, t0, .4))), b.userData.z + .12); });
  macro.visible = inn(t, K.oxido - .05, K.revisan); { const k = P(t, K.come - .4, 1.6); mCore.scale.set(lerp(1, .62, k), 1, lerp(1, .62, k)); mCore.material.color.set(new THREE.Color(0x7a8088).lerp(new THREE.Color(0x8a4a2a), k * .7)); mRust.scale.set(lerp(.86, 1.12, k), 1, lerp(.86, 1.12, k)); }
  for (let i = 0; i < 16; i++) { const u = (t * .7 + i / 16) % 1; setP(flakes, i, Math.cos(i * 2.1) * .3, 3.0 + 1.4 * (1 - u) * (.4 + (i % 4) * .2), .8 + Math.sin(i * 2.1) * .3, macro.visible && t > K.come, 1); } flakes.instanceMatrix.needsUpdate = true;
  // muros 2.º piso
  const kr = wallK(t);
  let kb = 0; if (t >= K.levantas) kb = eout(P(t, K.abren - .1, .5)) * (1 - eout(P(t, K.poreso + .1, .6)));
  const wob = inn(t, K.temblor - .1, K.poreso) ? Math.sin(t * 40) * .03 : 0;
  const finished = t >= K.felic;
  W2F.forEach(m => {
    const u = m.userData; m.visible = kr > .01; m.scale.y = Math.max(.001, kr); m.material = finished ? W2 : u.bm;
    let dx = 0, dy = 0, rz = wob;
    if (u.kind === 'bL') { dx = -.4 * kb; rz += .14 * kb; } if (u.kind === 'bR') { dx = .4 * kb; rz -= .14 * kb; }
    if (u.kind === 'bT') { dy = -.25 * kb; rz += .2 * kb; } if (u.kind === 'sL') { dx = -.1 * kb; rz += .2 * kb; } if (u.kind === 'sR') { dx = .1 * kb; rz -= .2 * kb; }
    m.position.set(u.x + dx, u.y0 + dy, u.z); m.rotation.z = rz;
  });
  // castillos y dalas (desde "castillos de concreto")
  const ck = t >= K.poreso ? eout(P(t, K.castillos2, .8)) : 0;
  cast.forEach((c, i) => { const k = eout(P(t, K.castillos2 + i * .1, .7)); c.visible = t >= K.castillos2; c.scale.y = Math.max(.001, k); });
  dalas.forEach((d, i) => { const k = eback(P(t, K.dala + i * .1, .5)); d.visible = t >= K.dala; d.scale.x = d.scale.z = Math.max(.001, k); });
  concM.emissiveIntensity = inn(t, K.marco, K.tambien + .3) ? .35 * (.5 + .5 * Math.sin((t - K.marco) * 9)) : inn(t, K.alrededor, K.cuarteen + .8) ? .25 * (.5 + .5 * Math.sin((t - K.alrededor) * 9)) : 0;
  const mk = eback(P(t, K.alrededor, .5)); marco.visible = t >= K.alrededor; marco.scale.setScalar(Math.max(.001, mk));
  winCracks.forEach((c, i) => growCrack(c, inn(t, K.tambien, K.alrededor) ? eout(P(t, K.tambien + .2 + i * .15, .8)) : 0));
  glass2.visible = finished;
  // losa nueva
  grid.visible = inn(t, K.encima + .2, POUR + .6); grid.position.y = Y2 + WH + .3 + 2.5 * (1 - eout(P(t, K.encima + .2, .6)));
  slab2.visible = t >= POUR; slab2.scale.y = Math.max(.001, eout(P(t, POUR, .7)));
  const pT = [K.agua, K.luz, K.drenaje]; pipes.forEach((p, i) => { p.visible = inn(t, pT[i] - .1, K.felic); p.scale.y = Math.max(.001, eout(P(t, pT[i] - .1, .7))); });
  hole.visible = inn(t, K.romper, K.escalera);
  for (let i = 0; i < 24; i++) { const u = clamp((t - K.romper) / .9); const a = i * 2.39; setP(debris, i, -2.62 + Math.cos(a) * u * (.5 + (i % 3) * .3), 2.0 + Math.sin(a) * u * .5 - u * u * 1.4, -1.75 + u * (.4 + (i % 4) * .2), inn(t, K.romper, K.romper + .9), 1 - u * .5); } debris.instanceMatrix.needsUpdate = true;
  // escalera
  const sb = eback(P(t, K.escalera, .5)); stairBad.visible = inn(t, K.escalera, ST2); stairBad.scale.y = Math.max(.001, sb);
  stairOk.visible = t >= ST2; stairOk.scale.y = Math.max(.001, eback(P(t, ST2, .5)));
  // tinaco
  const tk = eback(P(t, K.tinaco, .5)), lift = eio(P(t, K.altura, 1.2));
  tin.visible = t >= K.tinaco; tin.scale.setScalar(Math.max(.001, tk));
  tin.position.set(lerp(-4.6, -2.3, lift), lerp(Y2 + .05, ROOF2, lift) + Math.sin(lift * Math.PI) * 1.2, -1.0);
  tinStand.visible = inn(t, K.tinaco, K.felic); tinStand.scale.y = Math.max(.001, tk);
  const strong = t > K.altura + 1.0;
  for (let i = 0; i < 26; i++) { const u = (t * (strong ? 1.6 : .7) + i / 26) % 1; const on = inn(t, K.tinaco, K.papel) && (strong || (i % 5 === 0)); setP(water, i, -2.3, 1.12 - u * (strong ? .25 : .22) - (strong ? u * u * .05 : 0), -1.62 + (strong ? u * .22 : 0), on, strong ? 1.3 : 1); } water.instanceMatrix.needsUpdate = true;
  bed2.visible = finished;
  rebar2.forEach((r, i) => { r.visible = t >= K.dime + i * .12; r.scale.y = Math.max(.001, eback(P(t, K.dime + i * .12, .4))); });
  // polvo del temblor y chispas de refuerzo
  for (let i = 0; i < 40; i++) { const u = (t * .5 + i / 40) % 1; setP(dust, i, (i % 2 ? -1 : 1) * (3.3 + u * 1.2), 3.2 + (i % 7) * .35 - u * 1.2, -1.9 + (i % 5) * .9, inn(t, K.abren, K.poreso + .3), 1 - u); } dust.instanceMatrix.needsUpdate = true;
  for (let i = 0; i < 16; i++) { const u = clamp((t - K.refuerza) / .8), a = i * 2.4; setP(spark, i, (i % 2 ? 3.3 : -3.3) + Math.cos(a) * u * .8, -1.0 + Math.sin(a) * u * .6 + u * .4, 2.05, inn(t, K.refuerza, K.refuerza + .8), 1 - u); } spark.instanceMatrix.needsUpdate = true;
  // flechas de peso
  const arrOn = inn(t, K.peso - .2, K.antes);
  arrows.forEach(a => { a.visible = arrOn; const u = (t * .45 + a.userData.o) % 1; a.position.set(a.userData.x, lerp(5.5, -.6, u) + sinkY, 2.1); a.scale.setScalar(u > .85 ? (1 - u) / .15 : u < .08 ? u / .08 : 1); });
  fill2.intensity = (kr > .5 || t >= K.encima) ? 3.0 : 0;
  // personajes
  let op = [1.0, Y2, .6], ory = .7, p = { emo: 'neutral' }, ev = false, ep = [2.6, 0, 1.0], ery = -.4, e = { emo: 'neutral' };
  const wave = { armR: [-2.6, -.35, -.2 + .3 * Math.sin(t * 8)], armL: [-.2, .15, -.3] };
  if (t < K.subes) { p = { emo: t > K.aguantar - .2 ? 'worried' : 'neutral', headRx: -.25, look: [.6, .6] }; }
  else if (t < K.porque) { op = [-.8, 0, .6]; ory = .35; p = { emo: t > K.grietas ? 'surprised' : 'neutral', headRx: -.2, look: [-.5, .6], ...(t > K.grietas ? { armR: [-.4, -.4, -.8], armL: [-.4, .4, -.8] } : {}) }; }
  else if (t < K.antes) { op = [-1.0, 0, .7]; ory = .4; const sc = t > K.hunden; p = { emo: sc ? 'surprised' : 'worried', headRx: .25, look: [0, -.8], ...(sc ? { armR: [-2.4, -.5, -.4], armL: [-2.4, .5, -.4] } : {}) }; }
  else if (t < K.ahora) { op = [.9, 0, 1.1]; ory = .5; p = { emo: t > K.refuerza ? 'happy' : 'neutral', look: [.8, 0], headRy: .4 }; ev = t > K.ingeniero - .4; ep = [2.5, 0, 1.25]; ery = -.7; e = { emo: 'determined', headRx: .45, look: [0, -1], armL: [-.9, .3, -.6] }; }
  else if (t < K.levantas) { op = [.1, Y2, .1]; ory = .5; p = { emo: inn(t, K.oxidadas, K.refuerzan) ? 'worried' : t > K.refuerzan ? 'happy' : 'neutral', look: [.8, -.3] }; ev = true; ep = [1.5, Y2, .3]; ery = .9; e = { emo: 'determined', headRx: .4, look: [.6, -1], armL: [-1.2, .2, -.4] }; }
  else if (t < K.encima) { op = [-2.1, Y2, .8]; ory = .35; const sh = inn(t, K.temblor - .1, K.poreso); p = { emo: sh ? 'surprised' : t > K.castillos2 ? 'happy' : 'neutral', headRx: -.25, look: [0, .7], ...(sh ? { armR: [-2.4, -.5, -.4], armL: [-2.4, .5, -.4], bob: Math.sin(t * 40) * .02 } : {}) }; }
  else if (t < K.escalera) { op = [.6, Y2, 1.0]; ory = .2; p = { emo: t > K.romper ? 'worried' : 'neutral', headRx: t < K.tubos ? -.4 : 0, look: [0, t < K.tubos ? 1 : 0] }; }
  else if (t < K.tinaco) {
    if (t < ST2) { const x = 4.25; op = [x, Y2 * (4.9 - x) / 1.4 - .15, .7]; ory = -Math.PI / 2; p = { emo: 'worried', spineRx: .55, hipY: .9, armR: [-1.6, -.2, -.3], armL: [-1.6, .2, -.3], legs: [-1.0, 1.2, -.2, .3], look: [0, .5] }; }
    else { const x = 6.3; op = [x, Y2 * (8.3 - x) / 4.8, .7]; ory = -Math.PI / 2 + .4; p = { emo: 'happy', legs: [-.4, .4, .1, .1] }; }
  }
  else if (t < K.papel) { op = [-1.55, 0, -1.15]; ory = -.7; p = { emo: t > K.altura + 1 ? 'happy' : 'worried', armR: [-.9, -.1, -.5], armL: [-.2, .15, -.3], headRx: .25, look: [-.8, -.5] }; }
  else if (t < K.felic) { op = [0, 0, .9]; ory = 0; p = { emo: t > K.parar ? 'surprised' : t > K.sin ? 'worried' : 'neutral' }; }
  else if (t < K.dime) { op = [.3, Y2, .7]; ory = 0; p = { emo: 'happy', ...wave }; }
  else { op = [.8, ROOF2, .7]; ory = .4; p = { emo: 'happy', armR: [-2.3, -.3, -.1], armL: [-.2, .15, -.3], headRy: -.3 }; }
  if (inn(t, K.oxido - .05, K.revisan)) op[1] = -50;
  owner.root.position.set(op[0], op[1] + (op[1] < 5 ? sinkY : 0), op[2]); owner.root.rotation.y = ory; pose(owner, p, t);
  if (inn(t, K.oxido - .05, K.revisan)) { ev = false; op[1] = -50; }
  eng.root.visible = ev; eng.root.position.set(...ep); eng.root.rotation.y = ery; pose(eng, e, t + 1.3);
  // etiquetas
  OVL.length = 0; const L = (text, at, end, pos, color = '#ffcc33') => { if (t >= at && t < end) OVL.push({ text, at, end, pos, color }); };
  L('VARILLAS DE ESPERA', .5, K.aguantar - .1, V(1.5, 4.6, .6));
  L('¿AGUANTA?', K.aguantar - .1, K.subes, V(0, 4.8, 0), '#ff6a4a');
  L('GRIETAS', K.grietas - .1, K.porque, V(.6, 2.2, -1.8), '#ff6a4a');
  L('PESO', K.peso - .1, K.cimientos - .1, V(3.3, 4.6, 2.0), '#ff8a4a');
  L('CIMIENTOS', K.cimientos - .1, K.hunden, V(3.3, -.9, 2.0));
  L('SE HUNDEN', K.hunden - .05, K.antes, V(3.3, -.9, 2.0), '#ff6a4a');
  L('INGENIERO', K.ingeniero - .1, K.refuerza - .1, V(2.5, 2.6, 1.2));
  L('CIMIENTOS REFORZADOS', K.refuerza - .1, K.ahora, V(2.0, 2.4, 1.2), '#7be36b');
  L('VARILLAS DE ESPERA', K.varillas2 - .1, K.oxidadas - .1, V(3.0, 4.5, 1.5));
  L('OXIDADAS', K.oxidadas - .1, K.oxido, V(3.0, 4.5, 1.5), '#ff8a4a');
  L('ÓXIDO', K.oxido, K.come - .1, V(0, 4.9, .8), '#ff8a4a');
  L('SE COME EL ACERO', K.come - .1, K.revisan, V(0, 4.9, .8), '#ff6a4a');
  L('REVISIÓN', K.revisan, K.refuerzan - .1, V(2.4, 4.8, .9));
  L('VARILLA NUEVA', K.refuerzan - .1, K.levantas, V(3.0, 4.6, 1.5), '#7be36b');
  L('SIN CASTILLOS', K.castillos1 - .1, K.poreso, V(0, 6.4, 0), '#ff6a4a');
  L('CASTILLOS', K.castillos2 - .1, K.dala - .1, V(3.3, 6.2, 1.8));
  L('DALA', K.dala - .1, K.marco, V(0, 6.2, 1.8));
  L('COMO UN MARCO', K.marco, K.tambien, V(0, 6.4, 0), '#7be36b');
  L('MARCO EN VENTANAS', K.alrededor - .1, K.cuarteen - .1, V(0, 5.4, -1.9));
  L('SIN CUARTEADURAS', K.cuarteen - .1, K.encima, V(0, 5.4, -1.9), '#7be36b');
  L('LOSA NUEVA', K.encima, K.varilla - .1, V(0, 7.2, 0));
  L('VARILLA BIEN PUESTA', K.varilla - .1, K.tubos, V(0, 7.2, 0), '#7be36b');
  L('AGUA', K.agua - .1, K.luz - .1, V(-2.65, 6.3, -1.6), '#6cc4ff');
  L('LUZ', K.luz - .1, K.drenaje - .1, V(2.95, 6.3, -1.6));
  L('DRENAJE', K.drenaje - .1, K.sino, V(1.9, 6.3, -1.6), '#d8dbe2');
  L('PLANÉALOS ANTES DE COLAR', K.sino, K.romper - .1, V(0, 6.5, 0), '#7be36b');
  L('TOCA ROMPER', K.romper - .1, K.escalera, V(-2.6, 2.9, -1.6), '#ff6a4a');
  L('ESCALERA', K.escalera, K.empinada - .1, V(4.6, 3.6, .7));
  L('MUY EMPINADA', K.empinada - .1, ST2, V(4.6, 3.6, .7), '#ff6a4a');
  L('MÁS CÓMODA', ST2, K.tinaco, V(6.0, 3.6, .7), '#7be36b');
  L('TINACO', K.tinaco, K.altura, V(-4.6, 5.0, -1.0));
  L('+ ALTURA = + PRESIÓN', K.altura, K.papel, V(-2.3, 7.6, -1.0), '#7be36b');
  L('¡TU CASA CRECIÓ!', K.crecio - .1, K.sinuna, V(0, 7.4, 0), '#7be36b');
  L('SIN CUARTEADURAS', K.sinuna, K.dime, V(0, 7.4, 0), '#7be36b');
  L('¿CUÁNTOS AÑOS?', K.dime + .3, CTA_ST, V(0, 7.9, 0), '#ff8a4a');
}
// licencia 2D
function license(t) {
  if (!inn(t, K.papel - .05, K.felic)) return;
  const k = eback(P(t, K.papel - .05, .45)); g.save(); g.translate(540, 1360); g.scale(k, k); g.rotate(-.035);
  const bad = t >= K.sin;
  g.fillStyle = 'rgba(0,0,0,.35)'; rrp(g, 0, -225, -195, 450, 390, 22); g.fill(); g.fillStyle = '#fffdf6'; rrp(g, 0, -235, -205, 450, 390, 22); g.fill();
  g.textAlign = 'center'; g.textBaseline = 'middle';
  g.font = '900 34px M'; g.fillStyle = '#2a2c33'; g.fillText('LICENCIA DE', -10, -150); g.fillText('CONSTRUCCIÓN', -10, -108);
  g.fillStyle = '#d8d8d0'; for (let i = 0; i < 3; i++) g.fillRect(-180, -60 + i * 30, 320 - i * 60, 12);
  if (!bad) { const s = eback(P(t, K.licencia + .3, .35)); if (s > 0) { g.save(); g.translate(0, 85); g.rotate(-.12); g.scale(s, s); g.strokeStyle = '#1aa86a'; g.lineWidth = 9; rrp(g, 0, -150, -42, 300, 84, 14); g.stroke(); g.font = '900 46px M'; g.fillStyle = '#1aa86a'; g.fillText('✔ EN REGLA', 0, 4); g.restore(); } }
  else { g.save(); g.translate(0, 85); g.rotate(-.12); g.strokeStyle = '#e8383a'; g.lineWidth = 9; rrp(g, 0, -195, -42, 390, 84, 14); g.stroke(); g.font = '900 42px M'; g.fillStyle = '#e8383a'; g.fillText(t >= K.multar ? '✖ MULTA' : '✖ SIN LICENCIA', 0, 4); g.restore(); }
  g.restore();
  if (t >= K.parar) { const s = eout(P(t, K.parar, .35)); g.save(); g.translate(540, 1230); g.rotate(-.18); const w = 1400 * s; g.fillStyle = '#ffd400'; g.fillRect(-w / 2, -55, w, 110); g.save(); g.beginPath(); g.rect(-w / 2, -55, w, 110); g.clip(); g.fillStyle = '#1a1a1a'; for (let x = -800; x < 800; x += 90) { g.beginPath(); g.moveTo(x, -55); g.lineTo(x + 40, -55); g.lineTo(x - 10, 55); g.lineTo(x - 50, 55); g.fill(); } g.fillStyle = '#ffd400'; g.fillRect(-330, -40, 660, 80); g.font = 'italic 900 58px M'; g.fillStyle = '#1a1a1a'; g.fillText('OBRA SUSPENDIDA', 0, 4); g.restore(); g.restore(); }
}
const KEYW = new Set(['varillas', 'azotea', 'aguantar', 'grietas', 'peso', 'cimientos', 'hunden', 'ingeniero', 'refuerza', 'oxidadas', 'óxido', 'acero', 'refuerzan', 'castillos', 'temblor', 'galleta', 'amarrado', 'dala', 'marco', 'ventanas', 'cuarteen', 'losa', 'varilla', 'colar', 'tubos', 'agua', 'luz', 'drenaje', 'romper', 'escalera', 'empinada', 'tinaco', 'altura', 'presión', 'licencia', 'multar', 'obra', 'felicidades', 'creció', 'cuarteadura', 'años']);

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
  overlayLabels(t); if (t < CTA_ST) { license(t); caption(t); } watermark(t); followCTA(t);
  const fo = P(t, END - .3, .3); if (fo > 0) { g.fillStyle = `rgba(0,0,0,${fo})`; g.fillRect(0, 0, W, H); }
}
window.renderAt = renderAt; window.END = END;
window.frameJPG = (t, q = .92) => { renderAt(t); return out.toDataURL('image/jpeg', q).split(',')[1]; };
window.READY = true;
