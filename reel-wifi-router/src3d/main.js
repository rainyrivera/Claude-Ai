// Reel 9:16 3D (Estilo B: construcción en corte) — WiFi router
import * as THREE from 'three';
import { EffectComposer } from 'three/addons/postprocessing/EffectComposer.js';
import { RenderPass } from 'three/addons/postprocessing/RenderPass.js';
import { UnrealBloomPass } from 'three/addons/postprocessing/UnrealBloomPass.js';
import { OutputPass } from 'three/addons/postprocessing/OutputPass.js';

const W = 1080, H = 1920, END = 101.7;   // END = última palabra + 3,7 s (cierre)
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
// ================= WIFI LENTO: ES DÓNDE PUSISTE EL ROUTER =================
const K = { lento: PS(0), plan: PS(1), espera: PS(2), noes: PS(3), donde: PS(4), explico: PS(5), manda: PS(6), piedra: PS(7), pared: PS(8), metal: PS(9), agua: PS(10), micro: PS(11), frec: PS(12), poreso: PS(13), pierde: PS(14),
  p1: PS(15), centro: PS(16), p2: PS(17), sube: PS(18), repisa: PS(19), piso: PS(20), p3: PS(21), aire: PS(22), gavetas: PS(23), p4: PS(24), aleja: PS(25), p5: PS(26), antenas: PS(27), paradas: PS(28), p6: PS(29), apaga: PS(30), prende: PS(31),
  grande: PS(32), repetidor: PS(33), gratis: PS(34), mueve: PS(35), donde2: PS(36), leo: PS(37) };
(function () { const x = WT.x; x.fillStyle = '#f3e6cf'; x.fillRect(0, 0, 1024, 406); x.fillStyle = '#9fd6f2'; x.fillRect(pxx(-.4), py(2.1), 150, 110); x.strokeStyle = '#fff'; x.lineWidth = 10; x.strokeRect(pxx(-.4), py(2.1), 150, 110); WT.tx.needsUpdate = true; })();
// ---- cuarto (pared divisoria) y muebles ----
const partM = new THREE.MeshStandardMaterial({ color: 0xf2e3c8, transparent: true, opacity: 1 });
const part = add(M(new THREE.BoxGeometry(.14, 2.55, 2.6), partM)); part.position.set(1.15, 1.465, -1.05); part.scale.z = 1.7 / 2.6;
const bed = add(new THREE.Group()); bed.position.set(2.35, .15, -1.0); { const b = M(new THREE.BoxGeometry(1.6, .4, 1.4), lp(0x6c8bd6)); b.position.y = .2; const pl = M(new THREE.BoxGeometry(.5, .15, 1.2), lp(0xffffff)); pl.position.set(.5, .48, 0); bed.add(b, pl); }
const TVS = canvasTex(256, 144); const tv = add(new THREE.Group()); tv.position.set(-1.9, 1.3, -1.78); { const b = rbox(1.2, .7, .07, .02, lp(0x16181f)); const s = M(new THREE.PlaneGeometry(1.1, .6), new THREE.MeshStandardMaterial({ map: TVS.tx, emissive: 0xffffff, emissiveMap: TVS.tx, emissiveIntensity: 1 }), false); s.position.z = .04; tv.add(b, s); }
{ const x = TVS.x; const gr = x.createLinearGradient(0, 0, 256, 144); gr.addColorStop(0, '#3d8bff'); gr.addColorStop(1, '#a98bff'); x.fillStyle = gr; x.fillRect(0, 0, 256, 144); TVS.tx.needsUpdate = true; }
const stand = add(M(new THREE.BoxGeometry(1.6, .5, .45), lp(0x9a6a40))); stand.position.set(-1.9, .4, -1.6);
const cabinet = add(new THREE.Group()); cabinet.position.set(-.6, .15, -1.55); { const b = M(new THREE.BoxGeometry(.9, .7, .5), lp(0x9a6a40)); b.position.y = .35; cabinet.add(b); }
const cabDoor = M(new THREE.BoxGeometry(.88, .66, .04), lp(0x7f5530)); cabDoor.position.set(-.6, .5, -1.28); scene.add(cabDoor);
const shelf = add(M(new THREE.BoxGeometry(1.0, .06, .4), lp(0x9a6a40))); shelf.position.set(0, 1.75, -1.65);
const fridge = add(rbox(.75, 1.7, .7, .06, mat(0xd8dde6, { metalness: .6, roughness: .3 }))); fridge.position.set(-2.75, 1.0, .9);
const mwave = add(new THREE.Group()); mwave.position.set(-2.75, 1.0, 1.6); mwave.rotation.y = Math.PI / 2; { const tb = M(new THREE.BoxGeometry(.8, .9, .7), lp(0x9a6a40)); tb.position.y = -.45; const b = rbox(.6, .36, .4, .03, lp(0x2a2c33)); b.position.y = .18; const d = M(new THREE.PlaneGeometry(.36, .26), new THREE.MeshStandardMaterial({ color: 0x111111, emissive: 0xffc46a, emissiveIntensity: 0 }), false); d.position.set(-.06, .18, .205); mwave.add(tb, b, d); mwave.userData.door = d; }
const mirror = add(M(new THREE.BoxGeometry(.05, 1.1, .7), mat(0xdbe7f3, { metalness: .9, roughness: .05 }))); mirror.position.set(-3.18, 1.5, -1.0);
const tank = add(new THREE.Group()); tank.position.set(.45, .15, -1.6); { const st = M(new THREE.BoxGeometry(.8, .5, .4), lp(0x2a2c33)); st.position.y = .25; const w = M(new THREE.BoxGeometry(.78, .45, .38), new THREE.MeshStandardMaterial({ color: 0x4fb3ff, transparent: true, opacity: .55, roughness: .1 })); w.position.y = .73; tank.add(st, w); }
// ---- router ----
const router = add(new THREE.Group()); { const b = rbox(.42, .08, .3, .03, lp(0x1d1f25)); b.position.y = .04; router.add(b); router.userData.leds = []; for (let i = 0; i < 4; i++) { const l = M(new THREE.BoxGeometry(.03, .02, .01), new THREE.MeshStandardMaterial({ color: 0x35d39a, emissive: 0x35d39a, emissiveIntensity: 2 }), false); l.position.set(-.12 + i * .08, .05, .152); router.add(l); router.userData.leds.push(l); } }
const ants = []; for (let i = 0; i < 2; i++) { const a = new THREE.Group(); a.position.set(-.15 + i * .3, .08, -.12); const m = M(new THREE.CylinderGeometry(.015, .02, .3, 8), lp(0x1d1f25)); m.position.y = .15; a.add(m); router.add(a); ants.push(a); }
// ---- ondas WiFi (anillos que se expanden) ----
const ringM = []; const rings = []; for (let i = 0; i < 6; i++) { const m = new THREE.MeshBasicMaterial({ color: 0x6cc4ff, transparent: true, opacity: .5, side: THREE.DoubleSide, depthWrite: false }); const r = new THREE.Mesh(new THREE.TorusGeometry(1, .025, 6, 64), m); r.rotation.x = Math.PI / 2; scene.add(r); rings.push(r); ringM.push(m); }
const bounce = parts(10, 0xff8a4a, .05), interf = parts(14, 0xff4d61, .035);
// celular del dueño con barras
const SIG = canvasTex(256, 128); const sig = add(new THREE.Sprite(new THREE.SpriteMaterial({ map: SIG.tx, transparent: true, depthTest: false }))); sig.scale.set(.8, .4, 1); sig.renderOrder = 9;
function drawSig(n, spin) { const x = SIG.x; x.clearRect(0, 0, 256, 128); x.fillStyle = 'rgba(10,14,28,.75)'; rrp(x, 0, 6, 6, 244, 116, 24); x.fill(); for (let i = 0; i < 4; i++) { x.fillStyle = i < n ? (n <= 1 ? '#ff4d61' : n <= 2 ? '#f6b445' : '#35d39a') : 'rgba(255,255,255,.2)'; x.fillRect(30 + i * 34, 96 - (i + 1) * 18, 24, (i + 1) * 18); }
  if (spin) { x.strokeStyle = '#fff'; x.lineWidth = 8; x.beginPath(); x.arc(200, 62, 26, spin, spin + 4.2); x.stroke(); } else { x.fillStyle = '#35d39a'; x.font = '900 40px M'; x.textAlign = 'center'; x.textBaseline = 'middle'; x.fillText('✔', 200, 64); } SIG.tx.needsUpdate = true; }
const ext = add(rbox(.16, .22, .08, .03, lp(0xf2f2f2))); ext.position.set(1.4, .55, -1.83);
const phoneH = add(rbox(.1, .18, .02, .01, lp(0x1b1e27)));
// ---- posición del router en el tiempo ----
const RP = { esquina: V(-3.0, .15, -1.6), centro: V(0, 1.78, -1.65), mueble: V(-.6, .35, -1.55) };
function routerPos(t) {
  if (t < K.poreso) return RP.esquina;
  if (t < K.p1) { const k = (t - K.poreso) / (K.p1 - K.poreso); const opts = [RP.esquina, V(-3.0, .15, -1.6), V(-1.9, .7, -1.72), RP.mueble]; return opts[Math.min(3, Math.floor(k * 4))]; }
  if (t < K.p2) return RP.esquina.clone().lerp(V(0, .15, -1.4), eio(P(t, K.centro + .5, 1.5)));
  if (t < K.p3) return V(0, .15, -1.4).lerp(RP.centro, eio(P(t, K.sube + .2, 1.2)));
  return RP.centro;
}
// ---- cámara ----
SHOTS = [
  [0, K.espera, [3.0, 2.1, 4.8], [2.8, 2.0, 4.4], [2.3, 1.25, -.2], [2.3, 1.25, -.2]],
  [K.espera, K.donde, [.4, 2.6, 7.0], [.2, 2.5, 6.6], [-.4, 1.0, -.6], [-.4, 1.0, -.6]],
  [K.donde, K.explico, [-1.0, 1.3, 1.8], [-1.4, 1.1, 1.2], [-3.0, .2, -1.6], [-3.0, .2, -1.6]],
  [K.explico, K.pared, [.4, 5.2, 7.8], [.2, 5.6, 7.2], [-.6, .3, -.4], [-.4, .3, -.4]],
  [K.pared, K.metal, [3.4, 3.4, 6.8], [3.0, 3.2, 6.4], [1.1, 1.0, -.8], [1.2, 1.0, -.8]],
  [K.metal, K.micro, [.6, 2.4, 5.0], [.3, 2.3, 4.6], [-2.6, 1.1, -.4], [-2.6, 1.1, -.4]],
  [K.micro, K.poreso, [-.6, 1.9, 4.2], [-.9, 1.8, 3.8], [-2.75, .95, 1.5], [-2.75, .95, 1.5]],
  [K.poreso, K.p1, [.4, 2.8, 7.0], [.1, 2.7, 6.6], [-1.4, .8, -1.0], [-1.4, .8, -1.0]],
  [K.p1, K.p3, [1.6, 3.2, 7.4], [1.2, 3.0, 7.0], [0, 1.0, -.8], [0, 1.1, -.8]],
  [K.p3, K.p4, [1.2, 2.2, 5.0], [1.0, 2.1, 4.6], [-.4, 1.0, -1.4], [-.2, 1.2, -1.4]],
  [K.p4, K.p5, [.4, 3.6, 8.0], [.2, 3.4, 7.6], [-1.0, 1.0, -.2], [-1.0, 1.0, -.2]],
  [K.p5, K.grande, [.6, 2.3, 3.0], [.5, 2.25, 2.7], [0, 1.6, -1.65], [0, 1.62, -1.65]],
  [K.grande, K.mueve, [3.8, 3.2, 7.0], [3.4, 3.0, 6.6], [1.6, 1.0, -.8], [1.6, 1.0, -.8]],
  [K.mueve, 200, [2.0, 3.6, 9.0], [1.8, 3.2, 8.2], [.6, 1.0, -.6], [.6, 1.1, -.6]],
];
function animWorld(t) {
  skyDay(t);
  const rp = routerPos(t); router.position.copy(rp);
  cabDoor.visible = !inn(t, K.poreso + (K.p1 - K.poreso) * .75, K.p1) || true; cabDoor.position.z = inn(t, K.poreso + (K.p1 - K.poreso) * .75, K.p1) ? -1.28 : -1.28;
  partM.opacity = 1;
  // antenas
  const angA = t >= K.antenas + .4 ? eio(P(t, K.antenas + .4, .8)) * 1.35 : 0; ants[0].rotation.z = 0; ants[1].rotation.z = -angA;
  // reinicio
  const off = inn(t, K.apaga + .2, K.prende + 1.2); router.userData.leds.forEach((l, i) => { l.material.emissiveIntensity = off ? 0 : (t > K.prende + 1.2 && t < K.prende + 2.2 ? (Math.sin(t * 20 + i) > 0 ? 2 : 0) : 2); });
  // calidad de señal en el cuarto
  let q = 1; if (t >= K.p2) q = 2; if (t >= K.p3 + 1) q = 3; if (t >= K.p4 + 2) q = 4; if (off) q = 0; if (t >= K.grande) q = 4;
  const mOn = inn(t, K.micro, K.poreso) || inn(t, K.aleja, K.aleja + 1.5);
  mwave.userData.door.material.emissiveIntensity = mOn ? 1.5 : 0;
  // anillos: velocidad y alcance según la posición
  const reach = t < K.p1 ? 3.2 : 2.6 + q * .7; const showR = !off && (t >= K.explico || t < K.explico);
  rings.forEach((r, i) => { const u = ((t * .45 + i / 6) % 1); const rad = .2 + u * reach; r.position.set(rp.x, rp.y + .1, rp.z); r.scale.setScalar(rad);
    let op = .55 * (1 - u); if (t < K.p1 && rad > 4.1) op *= .25; // pasa la pared: se debilita
    if (mOn && i % 2 === 0) op *= .2 + .8 * Math.abs(Math.sin(t * 25));
    ringM[i].opacity = showR ? op : 0; ringM[i].color.set(t < K.p1 && rad > 4.1 ? 0xff8a4a : 0x6cc4ff); });
  // rebotes en espejo/nevera, interferencia del microondas
  for (let i = 0; i < 10; i++) { const u = (t * .9 + i / 10) % 1; const src = i < 5 ? V(-3.1, 1.5, -1.0) : V(-2.4, 1.2, .9); setP(bounce, i, src.x + u * .8, src.y + Math.sin(i) * .3, src.z + (i % 5) * .15, inn(t, K.metal, K.agua + 1.5), 1); } bounce.instanceMatrix.needsUpdate = true;
  for (let i = 0; i < 14; i++) { const a = i / 14 * 6.28 + t * 3; setP(interf, i, -2.75 + Math.cos(a) * (.4 + .2 * Math.sin(t * 9 + i)), 1.2 + Math.sin(t * 13 + i) * .2, 1.6 + Math.sin(a) * .4, mOn, 1); } interf.instanceMatrix.needsUpdate = true;
  tank.children[1].material.emissive = new THREE.Color(0x4fb3ff); tank.children[1].material.emissiveIntensity = inn(t, K.agua, K.micro) ? .6 + .3 * Math.sin(t * 8) : 0;
  part.material.emissive = new THREE.Color(0xff8a4a); part.material.emissiveIntensity = inn(t, K.pared, K.metal) ? .25 + .15 * Math.sin(t * 8) : 0;
  ext.visible = inn(t, K.repetidor, K.mueve);
  // ---- personajes ----
  let op = [2.4, .15, .1], ory = -.3, p = { emo: 'worried' }, ev = false, ep = [0, .15, .6], ery = 0, e = { emo: 'neutral' };
  const holdPh = { armR: [-1.3, -.2, -.5], armL: [-.4, .15, -.3], look: [0, -.6], headRx: .3 }, point = (a = -2.3) => ({ armR: [a, -.3, -.2], armL: [-.2, .15, -.3] });
  if (t < K.espera) { p = { emo: t > K.plan ? 'sad' : 'worried', ...holdPh }; }
  else if (t < K.explico) { op = [2.3, .15, .2]; p = { emo: 'surprised', ...holdPh }; ev = true; ep = [-.6, .15, -.3]; ery = .2; e = { emo: t > K.donde ? 'determined' : 'neutral', ...(t > K.donde ? point(-1.6) : { armR: [-2.6, -.4, -.2] }), headRy: -.6 }; }
  else if (t < K.p1) { op = [2.3, .15, .2]; p = { emo: 'neutral', ...holdPh }; ev = true; ep = [-.4, .15, -.3]; ery = -.3; e = { emo: 'determined', ...point(-1.9), headRy: .3 }; }
  else if (t < K.p5) { op = [-.95, .15, -.95]; ory = .4; p = { emo: 'determined', armR: [-1.6, -.2, -.6], armL: [-1.6, .2, -.6] }; if (t < K.centro + .5 || t > K.p4 + 3) { op = [2.4, .15, .1]; ory = -.3; p = { emo: q >= 3 ? 'happy' : 'neutral', ...holdPh }; } }
  else if (t < K.grande) { op = [-1.45, .15, -1.3]; ory = .9; p = { emo: 'determined', armR: [-2.4, -.2, -.3], armL: [-.2, .15, -.3] }; }
  else if (t < K.mueve) { op = [2.4, .15, .1]; ory = -.4; p = { emo: 'neutral', ...holdPh }; ev = t >= K.repetidor; ep = [.3, .15, -.6]; ery = .5; e = { emo: 'determined', ...point(-1.8) }; }
  else { op = [2.4, .15, .1]; ory = -.2; p = { emo: 'happy', armR: [-2.6, -.35, -.2 + .3 * Math.sin(t * 8)], armL: [-1.3, .2, -.5] }; ev = true; ep = [-.4, .15, -.5]; ery = .2; e = { emo: 'happy', armL: [-.9, .3, -.6] }; }
  owner.root.position.set(...op); owner.root.rotation.y = ory; pose(owner, p, t);
  eng.root.visible = ev; eng.root.position.set(...ep); eng.root.rotation.y = ery; pose(eng, e, t + 1.3); wrench.visible = false; engCB.visible = true;
  owner.root.updateMatrixWorld(true); phoneH.position.copy(owner.hand[1].getWorldPosition(new THREE.Vector3())).add(V(0, .08, .02)); phoneH.rotation.y = ory;
  drawSig(q, (t < K.p2 || off) ? t * 6 : 0); sig.position.copy(owner.root.position).add(V(0, 2.35, 0)); sig.visible = t < K.explico || t >= K.p1;
  // etiquetas
  OVL.length = 0; const Lb = (text, at, end, pos, color = '#ffcc33') => { if (t >= at && t < end) OVL.push({ text, at, end, pos, color }); };
  const TOP = V(0, 3.4, -.5), R = V(rp.x, rp.y + 1.2, rp.z);
  Lb('INTERNET LENTO', .1, K.plan, V(2.2, 3.0, -.5), '#ff6a4a'); Lb('¿PLAN MÁS CARO?', K.plan, K.espera, V(2.2, 3.0, -.5)); Lb('¡ESPERA!', K.espera, K.noes, TOP, '#ff6a4a'); Lb('✖ NO ES EL PLAN', K.noes, K.donde, TOP, '#ff6a4a'); Lb('ES DÓNDE ESTÁ', K.donde, K.explico, R, '#ff8a4a');
  Lb('LA SEÑAL SALE EN ONDAS', K.manda, K.pared, TOP, '#6cc4ff'); Lb('CADA PARED LA DEBILITA', K.pared, K.metal, V(1.15, 3.2, -.6), '#ff8a4a'); Lb('METAL Y ESPEJOS REBOTAN', K.metal, K.agua, V(-2.8, 2.8, -1.0), '#ff8a4a'); Lb('EL AGUA LA ABSORBE', K.agua, K.micro, V(.45, 1.8, -1.6), '#6cc4ff'); Lb('MICROONDAS = INTERFERENCIA', K.micro, K.poreso, V(-2.75, 2.2, 1.6), '#ff6a4a');
  Lb('✖ ESQUINA · PISO · TV · MUEBLE', K.poreso, K.p1, TOP, '#ff6a4a');
  Lb('PASO 1: AL CENTRO', K.p1, K.p2, TOP); Lb('PASO 2: ARRIBA', K.p2, K.p3, TOP, '#7be36b'); Lb('✖ NUNCA EN EL PISO', K.piso, K.p3, V(0, .9, -1.4), '#ff6a4a');
  Lb('PASO 3: AL AIRE LIBRE', K.p3, K.p4, V(0, 2.8, -1.6)); Lb('PASO 4: LEJOS DE…', K.p4, K.p5, TOP); Lb('PASO 5: ANTENAS', K.p5, K.paradas, V(0, 2.7, -1.6)); Lb('UNA PARADA, OTRA DE LADO', K.paradas, K.p6, V(0, 2.7, -1.6), '#7be36b');
  Lb('PASO 6: REINÍCIALO', K.p6, K.grande, V(0, 2.7, -1.6)); Lb('¿CASA GRANDE?', K.grande, K.repetidor, TOP); Lb('REPETIDOR O MALLA', K.repetidor, K.gratis, V(1.4, 1.6, -1.8), '#6cc4ff'); Lb('PRIMERO ESTO: GRATIS', K.gratis, K.mueve, TOP, '#7be36b');
  Lb('¿DÓNDE ESTÁ EL TUYO?', K.donde2 + .1, CTA_ST, V(.6, 3.4, -.5), '#ff8a4a');
}
function overlay2d(t) {
  // checklist del paso 4
  if (inn(t, K.aleja, K.p5)) { const it = ['MICROONDAS', 'NEVERA', 'ESPEJOS', 'METAL']; it.forEach((s, i) => { const k = eback(P(t, K.aleja + .3 + i * .9, .3)); if (k <= 0) return; g.save(); g.translate(540, 1270 + i * 92); g.scale(k, k); g.fillStyle = '#fffdf6'; rrp(g, 0, -230, -38, 460, 76, 38); g.fill(); g.fillStyle = '#e8383a'; g.font = '900 40px M'; g.textAlign = 'center'; g.textBaseline = 'middle'; g.fillText('✖ ' + s, 0, 2); g.restore(); }); }
  card(t, K.plan + .4, K.espera, 540, 1440, 'PLAN NUEVO', '#e8383a', x => { x.font = '900 60px M'; x.fillStyle = '#2a2c33'; x.fillText('$$$', 0, 0); x.font = '800 30px M'; x.fillStyle = '#5a6070'; x.fillText('¿de verdad hace falta?', 0, 80); });
}
const KEYW = new Set(['lento', 'plan', 'caro', 'router', 'ondas', 'pared', 'debilita', 'metal', 'espejos', 'rebotan', 'agua', 'pecera', 'microondas', 'frecuencia', 'esquina', 'piso', 'mueble', 'centro', 'súbelo', 'repisa', 'gavetas', 'nevera', 'antenas', 'paradas', 'apágalo', 'prenderlo', 'repetidor', 'malla', 'gratis', 'comentarios']);

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
