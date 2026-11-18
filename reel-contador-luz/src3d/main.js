// Reel 9:16 3D (Estilo B: construcción en corte) — Contador de luz
import * as THREE from 'three';
import { EffectComposer } from 'three/addons/postprocessing/EffectComposer.js';
import { RenderPass } from 'three/addons/postprocessing/RenderPass.js';
import { UnrealBloomPass } from 'three/addons/postprocessing/UnrealBloomPass.js';
import { OutputPass } from 'three/addons/postprocessing/OutputPass.js';

const W = 1080, H = 1920, END = 99.2;   // END = última palabra + 3,7 s (cierre)
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
// ================= ¿TE COBRAN LUZ DE MÁS? Lee tu contador =================
const K = { recibo: PS(0), contador: PS(1), revisas: PS(2), explico: PS(3), cuenta: PS(4), anota: PS(5), resta: PS(6), mal: PS(7), mas: PS(8), p1: PS(9), busca: PS(10), actual: PS(11), p2: PS(12), foto: PS(13), fecha: PS(14),
  p3: PS(15), compara: PS(16), menos: PS(17), cobraron: PS(18), p4: PS(19), estimada: PS(20), nadie: PS(21), p5: PS(22), vecino: PS(23), apaga: PS(24), corriendo: PS(25), cable: PS(26), p6: PS(27), reclama: PS(28), protecom: PS(29), calc: PS(30),
  ojo: PS(31), toques: PS(32), sigue: PS(33), electricista: PS(34), ya: PS(35), leo: PS(36) };
(function () { const x = WT.x; x.fillStyle = '#f3e6cf'; x.fillRect(0, 0, 1024, 406); x.fillStyle = '#9fd6f2'; x.fillRect(pxx(.4), py(2.05), 200, 130); x.strokeStyle = '#fff'; x.lineWidth = 10; x.strokeRect(pxx(.4), py(2.05), 200, 130);
  x.fillStyle = '#ffffff'; rrp(x, 0, pxx(-2.9), py(.6), 30, 44, 6); x.fill(); WT.tx.needsUpdate = true; })();
// ---- interior: TV, nevera, lámpara, abanico ----
const TVS = canvasTex(256, 144);
const tv = add(new THREE.Group()); tv.position.set(-1.4, 1.45, -1.78); { const b = rbox(1.3, .76, .07, .02, lp(0x16181f)); const s = M(new THREE.PlaneGeometry(1.2, .66), new THREE.MeshStandardMaterial({ map: TVS.tx, emissive: 0xffffff, emissiveMap: TVS.tx, emissiveIntensity: 1 }), false); s.position.z = .04; tv.add(b, s); }
const fridge = add(rbox(.75, 1.7, .7, .06, lp(0xf4f6fa))); fridge.position.set(2.6, 1.0, -1.35);
const fridgeLed = add(M(new THREE.BoxGeometry(.12, .05, .02), new THREE.MeshStandardMaterial({ color: 0x35d39a, emissive: 0x35d39a, emissiveIntensity: 2 }), false)); fridgeLed.position.set(2.6, 1.5, -.99);
const lamp = add(M(new THREE.SphereGeometry(.14, 16, 12), new THREE.MeshStandardMaterial({ color: 0xfff6d8, emissive: 0xfff1c0, emissiveIntensity: 2 }), false)); lamp.position.set(0, 2.62, 0);
const fan = add(new THREE.Group()); fan.position.set(-.2, 0, -.9); { const st = M(new THREE.CylinderGeometry(.03, .03, 1.1, 8), lp(0xdfe3ea)); st.position.y = .7; const base = M(new THREE.CylinderGeometry(.2, .22, .05, 16), lp(0xdfe3ea)); base.position.y = .17; fan.add(st, base); }
const fanHead = new THREE.Group(); fanHead.position.y = 1.3; fan.add(fanHead); for (let i = 0; i < 3; i++) { const b = M(new THREE.BoxGeometry(.08, .32, .02), lp(0x6cc4ff)); b.position.y = .16; const h = new THREE.Group(); h.rotation.z = i * 2.094; h.add(b); fanHead.add(h); }
// ---- contador en un poste, frente a la casa ----
const MT = canvasTex(256, 384);
const meter = add(new THREE.Group()); meter.position.set(4.35, 0, 1.0);
{ const post = M(new THREE.BoxGeometry(.18, 1.7, .18), lp(0x9a9c9f)); post.position.y = .85; meter.add(post);
  const box = rbox(.62, .86, .3, .05, mat(0xc9ced8, { metalness: .3, roughness: .5 })); box.position.set(0, 1.35, .14); meter.add(box);
  const face = M(new THREE.PlaneGeometry(.5, .75), new THREE.MeshStandardMaterial({ map: MT.tx, emissive: 0xffffff, emissiveMap: MT.tx, emissiveIntensity: .55, roughness: .2 }), false); face.position.set(0, 1.35, .3); meter.add(face); }
const meterGlowM = new THREE.MeshBasicMaterial({ color: 0xff4d61, transparent: true, opacity: 0, depthWrite: false }); const meterGlow = M(new THREE.PlaneGeometry(.8, 1.05), meterGlowM, false); meterGlow.position.set(0, 1.35, .27); meter.add(meterGlow);
const pole = add(M(new THREE.CylinderGeometry(.09, .12, 5.2, 8), lp(0x8a6a48))); pole.position.set(6.3, 2.6, -1.6);
const cross = add(M(new THREE.BoxGeometry(1.2, .08, .08), lp(0x8a6a48))); cross.position.set(6.3, 5.0, -1.6);
function wire(pts, col = 0x1d1f25, r = .02) { return add(M(new THREE.TubeGeometry(new THREE.CatmullRomCurve3(pts.map(p => V(...p))), 40, r, 6), new THREE.MeshStandardMaterial({ color: col, emissive: col, emissiveIntensity: 0 }), false)); }
wire([[5.8, 5.0, -1.6], [5.0, 3.6, -.3], [4.35, 2.3, .9], [4.35, 1.8, 1.0]]); wire([[4.35, 1.6, .95], [3.9, 2.0, .6], [3.4, 2.5, .2]]);
// casa del vecino y conexión ilegal
const nh = add(new THREE.Group()); nh.position.set(8.6, 0, -.8); { const b = M(new THREE.BoxGeometry(2.6, 2.3, 2.4), lp(0xe7c9a0)); b.position.y = 1.15; const rf = M(new THREE.BoxGeometry(2.8, .2, 2.6), lp(0x9a9ea6)); rf.position.y = 2.4; nh.add(b, rf); }
const nWinM = new THREE.MeshStandardMaterial({ color: 0x9fd3e6, emissive: 0xffd27a, emissiveIntensity: 0 }); const nWin = M(new THREE.BoxGeometry(.7, .6, .05), nWinM, false); nWin.position.set(8.6, 1.4, .42); scene.add(nWin);
const tap = wire([[5.05, 3.75, -.45], [6.5, 3.2, -.2], [7.6, 2.6, -.1], [8.0, 2.0, .2]], 0xff4d61, .028);
const bad = parts(10, 0xff4d61, .05);
const spk = add(new THREE.Mesh(new THREE.IcosahedronGeometry(.06, 0), new THREE.MeshBasicMaterial({ color: 0xfff3a0, transparent: true, blending: THREE.AdditiveBlending, depthWrite: false })));
// celular de la foto (en la mano del dueño)
const cam3 = add(rbox(.12, .22, .02, .01, lp(0x1b1e27)));
// ---- números ----
const PREV = 4210, BILLR = 4650, READ0 = 4580;
function reading(t) { return READ0 + (t > K.corriendo ? Math.floor((t - K.corriendo) * 1.6) : 0); }
function spinRate(t) { if (inn(t, K.apaga + 1.5, K.corriendo)) return 0; if (t >= K.corriendo && t < K.p6) return 2.2; return 1; }
let discA = 0, lastT = 0;
function drawMeter(t) {
  const x = MT.x; x.fillStyle = '#e9edf3'; x.fillRect(0, 0, 256, 384); x.fillStyle = '#1b1e27'; rrp(x, 0, 18, 40, 220, 96, 10); x.fill();
  const r = String(reading(t)).padStart(5, '0'); x.font = '700 64px J'; x.textAlign = 'center'; x.textBaseline = 'middle';
  for (let i = 0; i < 5; i++) { x.fillStyle = i === 4 ? '#ff4d61' : '#ffffff'; x.fillText(r[i], 46 + i * 41, 90); }
  x.fillStyle = '#1b1e27'; x.font = '900 30px M'; x.fillText('kWh', 128, 170);
  x.fillStyle = '#c7ccd6'; rrp(x, 0, 18, 210, 220, 60, 10); x.fill(); x.fillStyle = '#9aa1ad'; x.fillRect(18, 236, 220, 8);
  const mk = ((discA % 1) + 1) % 1; x.fillStyle = '#ff4d61'; x.fillRect(18 + mk * 200, 222, 20, 36);
  x.fillStyle = '#6a7180'; x.font = '700 22px M'; x.fillText('CONTADOR', 128, 320); MT.tx.needsUpdate = true;
}
function drawTV(on) { const x = TVS.x; if (!on) { x.fillStyle = '#050608'; x.fillRect(0, 0, 256, 144); } else { const gr = x.createLinearGradient(0, 0, 256, 144); gr.addColorStop(0, '#3d8bff'); gr.addColorStop(1, '#a98bff'); x.fillStyle = gr; x.fillRect(0, 0, 256, 144); x.fillStyle = '#ffcc33'; x.beginPath(); x.arc(170, 60, 26, 0, 6.29); x.fill(); x.fillStyle = '#35d39a'; x.fillRect(0, 105, 256, 39); } TVS.tx.needsUpdate = true; }
// ---- cámara ----
const MP = V(4.35, 1.35, 1.0);
SHOTS = [
  [0, K.contador, [2.4, 2.2, 7.6], [3.1, 1.9, 6.4], [2.4, .55, .2], [3.0, .55, .4]],
  [K.contador, K.explico, [5.0, 1.7, 4.6], [4.7, 1.6, 4.2], [4.35, .85, 1.0], [4.35, .87, 1.0]],
  [K.explico, K.anota, [4.8, 1.6, 4.3], [4.5, 1.55, 4.0], [4.35, .85, 1.0], [4.35, .85, 1.0]],
  [K.anota, K.mal, [6.6, 2.4, 6.2], [5.8, 2.2, 5.4], [4.6, .7, .8], [4.4, .7, .8]],
  [K.mal, K.p1, [3.4, 3.6, 9.6], [2.6, 3.3, 8.8], [3.0, .9, .2], [3.0, .9, .2]],
  [K.p1, K.p2, [1.2, 2.2, 6.4], [1.0, 2.1, 5.8], [1.0, 1.4, -.5], [1.0, 1.4, -.5]],
  [K.p2, K.p3, [5.6, 1.8, 4.4], [5.1, 1.7, 3.6], [4.2, .95, .9], [4.25, .95, .9]],
  [K.p3, K.p4, [4.9, 1.6, 4.5], [4.6, 1.55, 4.1], [4.35, .85, 1.0], [4.35, .85, 1.0]],
  [K.p4, K.p5, [1.4, 2.3, 6.6], [1.1, 2.2, 6.0], [1.4, 1.3, -.5], [1.4, 1.3, -.5]],
  [K.p5, K.corriendo, [0, 2.0, 6.4], [-.3, 1.9, 5.6], [0, .9, -1.0], [0, .9, -1.0]],
  [K.corriendo, K.cable, [4.8, 1.6, 4.4], [4.55, 1.55, 4.0], [4.35, .85, 1.0], [4.35, .85, 1.0]],
  [K.cable, K.p6, [7.0, 3.6, 7.8], [7.3, 3.4, 7.0], [7.2, 1.9, -.3], [7.3, 2.0, -.3]],
  [K.p6, K.ojo, [2.6, 2.2, 7.2], [2.2, 2.0, 6.4], [2.6, .8, .4], [2.6, .8, .4]],
  [K.ojo, K.electricista, [5.2, 1.7, 4.6], [4.9, 1.6, 4.1], [4.35, .85, 1.0], [4.35, .85, 1.0]],
  [K.electricista, K.ya, [5.8, 2.0, 4.6], [5.4, 1.9, 4.0], [4.5, .8, .9], [4.5, .85, .9]],
  [K.ya, 200, [3.0, 3.4, 10.4], [2.6, 3.0, 9.4], [2.4, .9, 0], [2.4, 1.0, 0]],
];
function animWorld(t) {
  skyDay(t);
  // contador
  discA += (t - lastT) * .6 * spinRate(t) * (t >= lastT ? 1 : 0); if (t < lastT || t - lastT > 1) discA = t * .6; lastT = t; drawMeter(t);
  const allOff = inn(t, K.apaga + 1.5, K.p6);
  drawTV(!allOff); ceilL.intensity = allOff ? .4 : 5; lamp.material.emissiveIntensity = allOff ? 0 : 2; fridgeLed.material.emissiveIntensity = allOff ? 0 : 2;
  fanHead.rotation.z = allOff ? fanHead.rotation.z : t * 14;
  meterGlowM.opacity = inn(t, K.toques, K.sigue) ? .25 + .2 * Math.sin(t * 9) : inn(t, K.corriendo, K.cable) ? .18 + .15 * Math.sin(t * 9) : 0;
  // conexión del vecino
  const thief = inn(t, K.cable + 1.2, K.p6); tap.visible = thief; tap.material.emissiveIntensity = thief ? 1 + .6 * Math.sin(t * 8) : 0; nWinM.emissiveIntensity = thief ? 1.5 : .0;
  for (let i = 0; i < 10; i++) { const u = (t * .8 + i / 10) % 1; const p = [V(5.05, 3.75, -.45), V(6.5, 3.2, -.2), V(7.6, 2.6, -.1), V(8.0, 2.0, .2)]; const s = u * 3, k = Math.min(2, Math.floor(s)); const q = p[k].clone().lerp(p[k + 1], s - k); setP(bad, i, q.x, q.y, q.z, thief, 1); } bad.instanceMatrix.needsUpdate = true;
  spk.visible = inn(t, K.cable, K.cable + 1.2) && Math.sin(t * 40) > 0; spk.position.set(3.4, 2.5, .2); spk.scale.setScalar(1 + Math.random() * 1.5);
  // ---- personajes ----
  let op = [3.3, 0, 2.2], ory = .5, p = { emo: 'neutral' }, ev = false, ep = [0, 0, 0], ery = 0, e = { emo: 'neutral' };
  const point = (a = -2.3) => ({ armR: [a, -.3, -.2], armL: [-.2, .15, -.3] });
  const holdBill = { armR: [-1.3, -.2, -.7], armL: [-1.3, .2, -.7], look: [0, -.6], headRx: .25 };
  cam3.visible = false;
  if (t < K.contador) { op = [2.4, 0, 1.2]; ory = .2; p = { emo: 'surprised', ...holdBill }; }
  else if (t < K.explico) { op = [3.4, 0, 1.6]; ory = .9; p = { emo: t > K.revisas ? 'worried' : 'suspicious', ...point(-1.8), headRy: .2 }; }
  else if (t < K.anota) { op = [3.3, 0, 1.9]; ory = .9; p = { emo: 'neutral', ...point(-1.7) }; }
  else if (t < K.mal) { op = [2.6, 0, 1.4]; ory = .4; p = { emo: 'neutral' }; ev = true; ep = [5.35, 0, 1.35]; ery = -1.9; e = { emo: 'determined', armL: [-1.4, .3, -.6], armR: [-1.6, -.3, -.7], look: [-.6, .2] }; }
  else if (t < K.p1) { op = [2.0, 0, 1.4]; ory = .3; p = { emo: 'sad', ...holdBill }; ev = t < K.mas; ep = [5.6, 0, 1.6]; ery = -.4; e = { emo: 'suspicious', armR: [-1.0, -.3, -.6], headRy: .6 }; }
  else if (t < K.p2) { op = [1.0, 0, .2]; ory = .1; p = { emo: 'determined', ...holdBill }; }
  else if (t < K.p3) { op = [3.75, 0, 2.0]; ory = 2.56; p = { emo: 'determined', armR: [-1.8, -.2, -.3], armL: [-.2, .15, -.3], look: [0, .3] }; cam3.visible = true; }
  else if (t < K.p4) { op = [3.35, 0, 2.0]; ory = .9; p = { emo: t > K.cobraron ? 'surprised' : 'suspicious', ...point(-1.8) }; }
  else if (t < K.p5) { op = [1.4, 0, .3]; ory = .1; p = { emo: t > K.nadie ? 'worried' : 'suspicious', ...holdBill }; }
  else if (t < K.corriendo) { op = [-1.0, 0, -.6]; ory = -.4; p = { emo: 'determined', armR: [-.6, -.2, -1.2], armL: [-.6, .2, -1.2], spineRx: .35, hipY: .9 }; }
  else if (t < K.p6) { op = [3.3, 0, 2.0]; ory = .8; p = { emo: 'surprised', armR: [-2.4, -.5, -.4], armL: [-2.4, .5, -.4] }; }
  else if (t < K.ojo) { op = [2.2, 0, 1.0]; ory = .1; p = { emo: 'determined', ...holdBill }; }
  else if (t < K.electricista) { op = [3.6, 0, 1.9]; ory = 1.1; p = { emo: t > K.toques + .6 ? 'surprised' : 'neutral', armR: [-1.4, -.2, -.3], armL: [-.2, .15, -.3] }; }
  else if (t < K.ya) { op = [2.9, 0, 1.6]; ory = .5; p = { emo: 'happy' }; ev = true; ep = [5.35, 0, 1.35]; ery = -1.9; e = { emo: 'determined', armL: [-1.3, .3, -.6], armR: [-1.8, -.3, -.4] }; }
  else { op = [2.2, 0, 1.4]; ory = .2; p = { emo: 'happy', armR: [-2.6, -.35, -.2 + .3 * Math.sin(t * 8)], armL: [-.2, .15, -.3] }; ev = true; ep = [4.9, 0, 1.6]; ery = -.5; e = { emo: 'happy', armL: [-.9, .3, -.6] }; }
  owner.root.position.set(...op); owner.root.rotation.y = ory; pose(owner, p, t);
  if (cam3.visible) { owner.root.updateMatrixWorld(true); cam3.position.copy(owner.hand[1].getWorldPosition(new THREE.Vector3())).add(V(0, .1, -.05)); cam3.rotation.set(0, ory, 0); }
  eng.root.visible = ev; eng.root.position.set(...ep); eng.root.rotation.y = ery; pose(eng, e, t + 1.3); wrench.visible = t >= K.electricista; engCB.visible = true;
  // etiquetas
  OVL.length = 0; const Lb = (text, at, end, pos, color = '#ffcc33') => { if (t >= at && t < end) OVL.push({ text, at, end, pos, color }); };
  const TOPM = V(4.35, 2.6, 1.0), TOPH = V(1.0, 3.4, 0);
  Lb('¿TE COBRAN DE MÁS?', .1, K.contador, V(2.6, 3.2, .4), '#ff6a4a'); Lb('¿QUÉ DICE TU CONTADOR?', K.contador, K.explico, TOPM);
  Lb('CUENTA KILOVATIOS HORA', K.cuenta, K.anota, TOPM, '#6cc4ff'); Lb('ANOTAN EL NÚMERO', K.anota, K.resta, V(4.6, 2.6, .8)); Lb('ACTUAL − ANTERIOR', K.resta, K.mal, V(4.6, 2.6, .8), '#7be36b');
  Lb('¿LO CALCULAN A OJO?', K.mal, K.mas, TOPH, '#ff8a4a'); Lb('PAGAS DE MÁS', K.mas, K.p1, TOPH, '#ff6a4a');
  Lb('PASO 1: TU FACTURA', K.p1, K.p2, V(1.0, 2.9, -.5)); Lb('PASO 2: FOTO CON FECHA', K.p2, K.p3, TOPM); Lb('✖ SIN TOCARLO', K.foto + 1.0, K.fecha, V(4.35, .4, 1.0), '#ff6a4a');
  Lb('PASO 3: COMPARA', K.p3, K.menos, TOPM); Lb('CONTADOR: 04580', K.menos, K.cobraron, TOPM, '#6cc4ff'); Lb('TE COBRARON DE MÁS', K.cobraron, K.p4, TOPM, '#ff6a4a');
  Lb('PASO 4: ¿ESTIMADA?', K.p4, K.nadie, V(1.4, 2.9, -.5)); Lb('NADIE LEYÓ TU CONTADOR', K.nadie, K.p5, V(1.4, 2.9, -.5), '#ff6a4a');
  Lb('PASO 5: LA PRUEBA DEL VECINO', K.p5, K.apaga, V(0, 3.1, -1)); Lb('APAGA Y DESCONECTA TODO', K.apaga, K.corriendo, V(0, 3.1, -1), '#6cc4ff');
  Lb('¿SIGUE CORRIENDO?', K.corriendo, K.cable, TOPM, '#ff6a4a'); Lb('CABLE CON PROBLEMA', K.cable, K.cable + 1.6, V(6.8, 4.0, -.3), '#ff8a4a'); Lb('O ALGUIEN CONECTADO', K.cable + 1.6, K.p6, V(6.8, 4.0, -.3), '#ff6a4a');
  Lb('PASO 6: RECLAMA', K.p6, K.protecom, V(2.6, 3.0, .4)); Lb('LUEGO: PROTECOM', K.protecom, K.ojo, V(2.6, 3.0, .4), '#6cc4ff');
  Lb('✖ NO LO ABRAS', K.ojo, K.sigue, TOPM, '#ff6a4a'); Lb('¿SIGUE CORRIENDO?', K.sigue, K.electricista, TOPM, '#ff8a4a'); Lb('QUE LO REVISE UN ELECTRICISTA', K.electricista, K.ya, V(4.6, 2.7, .9), '#7be36b');
  Lb('¿YA REVISASTE EL TUYO?', K.ya + .1, CTA_ST, V(2.6, 3.4, .2), '#ff8a4a');
}
function bill(t, a, b, hl, stamp) {
  if (!inn(t, a, b)) return; const k = eback(P(t, a, .4)) * (1 - P(t, b - .25, .25)); g.save(); g.translate(540, 1420); g.scale(k, k); g.rotate(-.02);
  g.fillStyle = 'rgba(0,0,0,.35)'; rrp(g, 0, -262, -182, 532, 372, 24); g.fill(); g.fillStyle = '#fffdf6'; rrp(g, 0, -270, -190, 540, 372, 24); g.fill();
  g.fillStyle = '#f6b445'; rrp(g, 0, -270, -190, 540, 78, 24); g.fill(); g.fillRect(-270, -136, 540, 24);
  g.textAlign = 'center'; g.textBaseline = 'middle'; g.font = '900 40px M'; g.fillStyle = '#2a2c33'; g.fillText('FACTURA DE LUZ', 0, -150);
  const rows = [['LECTURA ANTERIOR', String(PREV).padStart(5, '0')], ['LECTURA ACTUAL', String(BILLR).padStart(5, '0')], ['CONSUMO', (BILLR - PREV) + ' kWh']];
  rows.forEach(([l, v], i) => { const y = -70 + i * 72; if (hl.includes(i)) { g.fillStyle = 'rgba(255,204,51,.45)'; rrp(g, 0, -250, y - 30, 500, 60, 12); g.fill(); }
    g.textAlign = 'left'; g.font = '800 30px M'; g.fillStyle = '#5a6070'; g.fillText(l, -230, y); g.textAlign = 'right'; g.font = '700 38px J'; g.fillStyle = i === 2 ? '#e8383a' : '#2a2c33'; g.fillText(v, 230, y); });
  if (stamp) { const s = eback(P(t, stamp[0], .35)); if (s > 0) { g.save(); g.translate(40, 60); g.rotate(-.18); g.scale(s, s); g.strokeStyle = stamp[1]; g.lineWidth = 8; rrp(g, 0, -230, -44, 460, 88, 12); g.stroke(); g.font = '900 42px M'; g.textAlign = 'center'; g.fillStyle = stamp[1]; g.fillText(stamp[2], 0, 4); g.restore(); } }
  g.restore();
}
function overlay2d(t) {
  bill(t, .05, K.contador - .05, [1], null);
  bill(t, K.resta, K.mal, [0, 1, 2], null);
  bill(t, K.busca - .2, K.p2, t < K.actual ? [0] : [1, 2], null);
  bill(t, K.estimada, K.p5, [1], [K.estimada + 1.0, '#e8383a', 'LECTURA ESTIMADA']);
  // foto del contador con fecha
  card(t, K.foto + 1.6, K.p3, 540, 1440, 'FOTO', '#3d8bff', x => { x.fillStyle = '#1b1e27'; rrp(x, 0, -150, -50, 300, 100, 12); x.fill(); x.font = '700 70px J'; x.fillStyle = '#fff'; x.fillText('04580', 0, 2); x.font = '800 30px M'; x.fillStyle = '#5a6070'; x.fillText('18 / NOV · 9:12 AM', 0, 100); });
  // comparación
  if (inn(t, K.compara, K.p4)) { const k = eback(P(t, K.compara, .4)) * (1 - P(t, K.p4 - .25, .25)); g.save(); g.translate(540, 1420); g.scale(k, k);
    const box = (x0, title, val, col) => { g.fillStyle = '#fffdf6'; rrp(g, 0, x0 - 200, -120, 400, 220, 22); g.fill(); g.fillStyle = col; rrp(g, 0, x0 - 200, -120, 400, 64, 22); g.fill(); g.fillRect(x0 - 200, -76, 400, 20); g.font = '900 30px M'; g.fillStyle = '#fff'; g.textAlign = 'center'; g.textBaseline = 'middle'; g.fillText(title, x0, -88); g.font = '700 70px J'; g.fillStyle = '#2a2c33'; g.fillText(val, x0, 10); };
    box(-215, 'RECIBO DICE', '04650', '#f6b445'); box(215, 'CONTADOR', '04580', '#3d8bff');
    if (t > K.cobraron) { const s = eback(P(t, K.cobraron, .35)); g.save(); g.translate(0, 150); g.scale(s, s); g.fillStyle = '#e8383a'; rrp(g, 0, -230, -40, 460, 80, 40); g.fill(); g.font = '900 40px M'; g.fillStyle = '#fff'; g.fillText('70 kWh DE MÁS', 0, 3); g.restore(); }
    g.restore(); }
  card(t, K.reclama, K.protecom, 540, 1440, 'RECLAMACIÓN', '#3d8bff', x => { x.font = '900 34px M'; x.fillStyle = '#2a2c33'; x.fillText('1. TU DISTRIBUIDORA', 0, -30); x.font = '800 30px M'; x.fillStyle = '#1aa86a'; x.fillText('✔ FOTOS DEL CONTADOR', 0, 30); x.fillText('✔ TU FACTURA', 0, 80); });
  card(t, K.protecom, K.ojo, 540, 1440, 'PROTECOM', '#1aa86a', x => { x.font = '900 34px M'; x.fillStyle = '#2a2c33'; x.fillText('2. SI NO TE RESUELVEN', 0, -30); x.font = '800 30px M'; x.fillStyle = '#3d8bff'; x.fillText('CALCULADORA OFICIAL', 0, 30); x.fillText('DE FACTURA', 0, 75); });
  // destello de la cámara
  const fl = P(t, K.foto + 1.3, .08) * (1 - P(t, K.foto + 1.4, .3)); if (fl > 0) { g.fillStyle = `rgba(255,255,255,${fl * .85})`; g.fillRect(0, 0, W, H); }
}
const KEYW = new Set(['recibo', 'contador', 'revisas', 'kilovatios', 'número', 'resta', 'cobran', 'mal', 'ojo', 'más', 'factura', 'anterior', 'actual', 'cobrados', 'foto', 'fecha', 'compara', 'menos', 'cobraron', 'estimada', 'nadie', 'vecino', 'apaga', 'desconecta', 'corriendo', 'cable', 'conectado', 'reclama', 'distribuidora', 'fotos', 'protecom', 'calculadora', 'toques', 'electricista', 'comentarios']);

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
