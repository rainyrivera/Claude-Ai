// Reel 9:16 3D (Estilo B: construcción en corte) — Fuga de agua
import * as THREE from 'three';
import { EffectComposer } from 'three/addons/postprocessing/EffectComposer.js';
import { RenderPass } from 'three/addons/postprocessing/RenderPass.js';
import { UnrealBloomPass } from 'three/addons/postprocessing/UnrealBloomPass.js';
import { OutputPass } from 'three/addons/postprocessing/OutputPass.js';

const W = 1080, H = 1920, END = 102.5;   // END = última palabra + 3,7 s (cierre)
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
// ================= FUGA DE AGUA (inodoro) =================
{ const x = WT.x; x.fillStyle = '#eef3f6'; x.fillRect(0, 0, 1024, 406); WT.tx.needsUpdate = true; }
const K = { colorante: T('colorante'), media: PS(3), botando: PS(4), mira: PS(5), palanca: T('palanca'), levanta: T('levanta'), cae: PS(7), baja1: T('baja', 1), tapa: T('tapa', 1), boya1: T('boya', 1), anos: PS(11), sarro: T('sarro'), notapa: PS(12), sale: PS(13), tbaja: PS(14), babre: PS(15), llena: PS(16), dia: PS(17), noche: PS(18), mal: PS(19), sube: PS(20), otra: PS(21), techo: PS(22), nocierra: PS(23), desague: PS(24), tubo: PS(25), nada: PS(26), piso: PS(27), verde: T('verde'), prueba: PS(28), cierra: PS(29), espera: PS(30), cambio: PS(31), fuga: PS(32), bueno: PS(33), arregla: PS(34), baratos: PS(35), plomero: PS(36), listo: PS(37), hiciste: PS(39) };
const X0 = 30, MAG = new THREE.Color(0xe0218a), WBLUE = new THREE.Color(0x7cc8f0);
// ---- set del baño (diorama) ----
add(M(new THREE.CylinderGeometry(3.6, 3.8, .4, 40), lp(0xe8ecef))).position.set(X0, -.2, 0);
const tileT = (() => { const t = canvasTex(256, 256), x = t.x; x.fillStyle = '#cfe6f2'; x.fillRect(0, 0, 256, 256); x.strokeStyle = '#ffffff'; x.lineWidth = 6; for (let i = 0; i <= 4; i++) { x.beginPath(); x.moveTo(i * 64, 0); x.lineTo(i * 64, 256); x.stroke(); x.beginPath(); x.moveTo(0, i * 64); x.lineTo(256, i * 64); x.stroke(); } t.tx.wrapS = t.tx.wrapT = THREE.RepeatWrapping; t.tx.repeat.set(6, 4); t.tx.needsUpdate = true; return t.tx; })();
add(M(new THREE.BoxGeometry(6.4, 4.2, .12), new THREE.MeshStandardMaterial({ map: tileT, roughness: .5 }))).position.set(X0, 2.1, -1.5);
const winM = new THREE.MeshBasicMaterial({ color: 0x8fd0ff }); add(M(new THREE.PlaneGeometry(1.2, .9), winM, false)).position.set(X0 + 1.7, 2.9, -1.43);
add(M(new THREE.BoxGeometry(1.3, .08, .1), lp(0xffffff))).position.set(X0 + 1.7, 2.42, -1.42);
const moonW = add(M(new THREE.CircleGeometry(.12, 20), new THREE.MeshBasicMaterial({ color: 0xf4f0d0 }), false)); moonW.position.set(X0 + 2.0, 3.1, -1.42);
const sunW = add(M(new THREE.CircleGeometry(.12, 20), new THREE.MeshBasicMaterial({ color: 0xffe066 }), false)); sunW.position.set(X0 + 1.4, 3.1, -1.42);
const macL = new THREE.PointLight(0xfff4e0, 0, 12, 1.2); macL.position.set(X0 + .5, 3.2, 3.0); scene.add(macL);
// ---- inodoro gigante en corte (unidades reales, escala 2.2) ----
const TG = add(new THREE.Group()); TG.position.set(X0, 0, 0); TG.scale.setScalar(2.2);
const cer = lp(0xffffff, { roughness: .35 }), tadd = (o, x, y, z) => { o.position.set(x, y, z); TG.add(o); return o; };
tadd(M(new THREE.CylinderGeometry(.12, .15, .33, 20), cer), 0, .165, .03);
tadd(M(new THREE.CylinderGeometry(.21, .13, .2, 28), cer), 0, .43, .08);
const bowlW = tadd(M(new THREE.CircleGeometry(.18, 28), new THREE.MeshStandardMaterial({ color: 0x7cc8f0, roughness: .1 }), false), 0, .532, .08); bowlW.rotation.x = -Math.PI / 2;
const seat = tadd(M(new THREE.TorusGeometry(.19, .024, 8, 28), cer), 0, .545, .08); seat.rotation.x = Math.PI / 2;
tadd(M(new THREE.BoxGeometry(.52, .42, .02), cer), 0, .79, -.43); for (const s of [-1, 1]) tadd(M(new THREE.BoxGeometry(.02, .42, .22), cer), .25 * s, .79, -.32); tadd(M(new THREE.BoxGeometry(.52, .02, .22), cer), 0, .57, -.32);
tadd(M(new THREE.BoxGeometry(.52, .42, .005), new THREE.MeshStandardMaterial({ color: 0xdff3ff, transparent: true, opacity: .18, roughness: .05, depthWrite: false }), false), 0, .79, -.212);
const tankWM = new THREE.MeshStandardMaterial({ color: 0x7cc8f0, transparent: true, opacity: .55, roughness: .1, depthWrite: false });
const tankW = tadd(M((() => { const gm = new THREE.BoxGeometry(.47, 1, .19); gm.translate(0, .5, 0); return gm; })(), tankWM, false), 0, .58, -.32);
tadd(M(new THREE.TorusGeometry(.05, .01, 6, 20), lp(0x9aa0aa)), 0, .585, -.335).rotation.x = Math.PI / 2;
const ovfl = tadd(M(new THREE.CylinderGeometry(.02, .02, .32, 10), lp(0xd9dde3)), 0, .74, -.405);
const flapG = tadd(new THREE.Group(), 0, .6, -.395); const flapM = new THREE.MeshStandardMaterial({ color: 0xd8322a, roughness: .7, emissive: 0x35d39a, emissiveIntensity: 0 });
const flap = M(new THREE.CylinderGeometry(.058, .058, .026, 20), flapM); flap.position.set(0, -.012, .06); flapG.add(flap);
const sarroS = []; for (let i = 0; i < 9; i++) { const s = M(new THREE.SphereGeometry(.009, 6, 4), lp(0xeee6c8)); const a = i * .7; s.position.set(Math.cos(a) * .05, .012, Math.sin(a) * .05); flap.add(s); sarroS.push(s); }
tadd(M(new THREE.CylinderGeometry(.02, .02, .3, 10), lp(0x6a6f7a)), .19, .73, -.32); tadd(M(new THREE.CylinderGeometry(.035, .035, .05, 12), lp(0x50555f)), .19, .9, -.32);
const armG = tadd(new THREE.Group(), .19, .9, -.32); { const a = M(new THREE.BoxGeometry(.18, .012, .012), lp(0x9aa0aa)); a.position.x = -.09; armG.add(a); }
const ballM = lp(0xff8a3d); const ball = M(new THREE.SphereGeometry(.045, 16, 12), ballM); ball.position.x = -.19; armG.add(ball);
const handle = tadd(new THREE.Group(), -.2, .95, -.205); { const h = M(new THREE.BoxGeometry(.09, .025, .03), lp(0xb9c0d0, { metalness: .5 })); h.position.x = .03; handle.add(h); }
// partículas dentro del inodoro (rayos X)
function tparts(n, c, r) { const m = new THREE.InstancedMesh(new THREE.SphereGeometry(r, 6, 4), new THREE.MeshBasicMaterial({ color: c, depthTest: false, transparent: true }), n); m.frustumCulled = false; m.renderOrder = 6; TG.add(m); return m; }
const flowP = tparts(40, 0x3d9bff, .012), fillP = tparts(16, 0x9fd8ff, .01), dyeP = tparts(10, 0xe0218a, .014), ovP = tparts(16, 0x3d9bff, .011);
const bottle = new THREE.Group(); { const b = M(new THREE.CylinderGeometry(.05, .05, .16, 12), lp(0xe0218a)); b.position.y = -.08; const c = M(new THREE.CylinderGeometry(.02, .03, .05, 10), lp(0xffffff)); c.position.y = -.18; bottle.add(b, c); } owner.el[1].add(bottle); bottle.position.y = -.42; bottle.rotation.x = Math.PI;
// ---- casa: tanque del techo, tubo enterrado, medidor ----
const RT = hadd(new THREE.Group()); RT.position.set(-2.3, 3.03, -.55);
RT.add(at(M(new THREE.CylinderGeometry(.52, .48, 1.0, 24, 1, true), new THREE.MeshStandardMaterial({ color: 0x2a2f38, transparent: true, opacity: .45, side: THREE.DoubleSide, depthWrite: false }), false), 0, .5, 0));
RT.add(at(M(new THREE.CylinderGeometry(.3, .34, .08, 20), lp(0x2a2f38)), 0, 1.04, 0));
const rtW = M((() => { const gm = new THREE.CylinderGeometry(.47, .45, 1, 24); gm.translate(0, .5, 0); return gm; })(), new THREE.MeshStandardMaterial({ color: 0x3d9bff, transparent: true, opacity: .7 }), false); RT.add(rtW);
const rtArm = new THREE.Group(); rtArm.position.set(.3, .9, 0); RT.add(rtArm); { const a = M(new THREE.BoxGeometry(.3, .02, .02), lp(0x9aa0aa)); a.position.x = -.15; rtArm.add(a); const b = M(new THREE.SphereGeometry(.08, 12, 8), lp(0xff8a3d)); b.position.x = -.3; rtArm.add(b); }
const OVR = new THREE.CatmullRomCurve3([V(-2.8, 3.92, -.55), V(-3.2, 3.92, -.55), V(-3.55, 3.85, -.55), V(-3.55, 2.0, -.55), V(-3.55, .1, -.55), V(-3.75, .04, -.2)], false, 'catmullrom', .05);
hadd(M(new THREE.TubeGeometry(OVR, 60, .05, 8), lp(0xd9dde3), false));
add(M(new THREE.BoxGeometry(.5, .03, .5), lp(0x3a3d44))).position.set(-3.75, .03, -.2);
const GP = new THREE.CatmullRomCurve3([V(2.6, .05, GZ + .04), V(2.6, -.55, GZ + .04), V(1.6, -.6, GZ + .04), V(.6, -.55, GZ + .04), V(.6, .1, GZ + .04)], false, 'catmullrom', .02);
add(M(new THREE.TubeGeometry(GP, 60, .06, 8), lp(0x3d8bff), false));
const LEAK = V(1.55, -.6, GZ + .06);
const wetSoil = add(M(new THREE.CircleGeometry(.75, 24), new THREE.MeshBasicMaterial({ color: 0x3a2618, transparent: true, opacity: 0, depthWrite: false }), false)); wetSoil.position.set(1.55, -.6, GZ + .035); wetSoil.scale.y = .6;
const green = add(M(new THREE.CircleGeometry(.6, 24), new THREE.MeshStandardMaterial({ color: 0x3fd14a, roughness: .8 }), false)); green.rotation.x = -Math.PI / 2; green.position.set(1.55, .035, 1.55);
const damp = hadd(M(new THREE.CircleGeometry(.55, 24), new THREE.MeshBasicMaterial({ color: 0x6a4a2a, transparent: true, opacity: 0, depthWrite: false }), false)); damp.rotation.x = -Math.PI / 2; damp.position.set(1.2, .152, 1.2);
const fixRing = add(M(new THREE.CylinderGeometry(.09, .09, .2, 12), new THREE.MeshStandardMaterial({ color: 0x35d39a, emissive: 0x35d39a, emissiveIntensity: .4 }), false)); fixRing.rotation.z = Math.PI / 2; fixRing.position.copy(LEAK);
const wm = add(M(new THREE.BoxGeometry(.36, .2, .28), lp(0x2c5aa0))); wm.position.set(2.6, .12, 1.55);
const WMT = canvasTex(256, 128); const wmFace = add(M(new THREE.PlaneGeometry(.3, .15), new THREE.MeshStandardMaterial({ map: WMT.tx, emissive: 0xffffff, emissiveMap: WMT.tx, emissiveIntensity: .5 }), false)); wmFace.rotation.x = -Math.PI / 2; wmFace.position.set(2.6, .225, 1.55);
const valve = add(new THREE.Group()); valve.position.set(2.15, .14, 1.55); { const v = M(new THREE.BoxGeometry(.24, .04, .05), lp(0xd8322a)); v.position.x = .1; valve.add(v); }
const leakP = parts(20, 0x3d9bff, .03), ovOut = parts(24, 0x3d9bff, .035);
// ---- estado del inodoro ----
const LV = l => .58 + l * .38;
function toilet(t) {
  let L = .8, open = 0, fill = false, trickle = 0, over = false, worn = false, fixed = t >= K.arregla + .6;
  if (t < K.mira) { worn = true; trickle = t > K.colorante + 1.0 ? 1 : 0; }
  else if (t < K.anos) { // demo del ciclo
    const o0 = K.levanta, c0 = K.tapa; open = t < o0 ? 0 : t < c0 ? (t < K.baja1 ? eout(P(t, o0, .4)) : 1 - eout(P(t, K.baja1, .8))) : 0;
    handle.rotation.z = inn(t, K.palanca - .1, K.palanca + 1.0) ? -.5 : 0;
    if (t >= o0) L = lerp(.8, .12, eout(P(t, o0 + .2, 2.2)));
    if (t >= K.boya1 - .3) { L = lerp(.12, .8, eio(P(t, K.boya1 - .3, 3.6))); fill = L < .79; }
  } else if (t < K.mal) { worn = true; trickle = t >= K.notapa ? 1 : 0;
    const cyc = t >= K.tbaja ? ((t - K.tbaja) % 3.2) / 3.2 : 0; if (t >= K.tbaja) { L = cyc < .6 ? lerp(.8, .62, cyc / .6) : lerp(.62, .8, (cyc - .6) / .4); fill = cyc >= .6; } }
  else if (t < K.techo) { L = lerp(.8, .93, eout(P(t, K.mal + .3, 2.0))); fill = true; over = L > .86; }
  else { worn = !fixed && t < K.listo; trickle = (t >= K.bueno && !fixed) ? 1 : 0; }
  return { L, open, fill, trickle, over, worn, fixed };
}
SHOTS = [
  [0, K.media, [X0 + .7, 2.2, 5.0], [X0 + .5, 2.0, 4.2], [X0 - .2, 1.5, -.4], [X0 - .1, 1.5, -.5]],
  [K.media, K.mira, [X0 + .3, 1.9, 2.8], [X0 + .2, 1.8, 2.2], [X0, 1.15, .1], [X0, 1.15, .1]],
  [K.mira, K.anos, [X0 + .2, 2.0, 2.6], [X0 + .1, 1.9, 2.1], [X0, 1.65, -.7], [X0, 1.6, -.7]],
  [K.anos, K.mal, [X0 + .1, 1.7, 2.1], [X0 + .05, 1.6, 1.7], [X0, 1.45, -.75], [X0, 1.5, -.75]],
  [K.mal, K.techo, [X0 + .4, 2.1, 2.5], [X0 + .3, 2.0, 2.1], [X0 + .05, 1.85, -.7], [X0 + .05, 1.85, -.7]],
  [K.techo, K.tubo, [1.4, 5.4, 7.2], [.6, 4.9, 6.0], [-2.4, 3.3, -.4], [-2.6, 2.8, -.4]],
  [K.tubo, K.prueba, [2.8, .7, 7.4], [2.2, .4, 6.2], [1.4, -.3, 1.6], [1.4, -.25, 1.6]],
  [K.prueba, K.bueno, [3.8, 1.5, 4.6], [3.3, 1.2, 3.8], [2.4, .2, 1.4], [2.5, .2, 1.5]],
  [K.bueno, K.plomero, [X0 + .2, 1.8, 2.4], [X0 + .1, 1.75, 2.0], [X0, 1.55, -.7], [X0, 1.6, -.7]],
  [K.plomero, K.listo, [2.8, .9, 7.2], [2.2, .6, 6.2], [1.4, -.1, 1.6], [1.4, -.1, 1.6]],
  [K.listo, 200, [X0 + .8, 2.3, 5.2], [X0 + .6, 2.1, 4.4], [X0 - .2, 1.3, -.4], [X0 - .2, 1.3, -.4]],
];
const cumW = [0]; for (let i = 1; i <= Math.ceil(END * 30) + 2; i++) { const t = i / 30; cumW.push(cumW[i - 1] + (inn(t, K.espera, K.bueno) ? .0006 : 0)); }
const m3 = t => 482.731 + cumW[Math.min(cumW.length - 1, Math.floor(t * 30))];
function animWorld(t) {
  const night = inn(t, K.noche, K.mal); skyDay(t);
  if (night) { const c = new THREE.Color(0x0e1630); scene.background = c; scene.fog.color.copy(c); hemi.intensity = .55; sunL.intensity = .4; }
  winM.color.set(night ? 0x16244a : 0x8fd0ff); moonW.visible = night; sunW.visible = !night;
  const macro = t < K.techo || inn(t, K.bueno, K.plomero) || t >= K.listo; macL.intensity = macro ? 3.4 : 0;
  // inodoro
  const s = toilet(t);
  tankW.scale.y = Math.max(.001, s.L * .38); flapG.rotation.x = -s.open * 1.1;
  const dyeT = t < K.mira ? P(t, K.colorante + .6, 1.2) : 0; tankWM.color.copy(WBLUE).lerp(MAG, dyeT);
  const bowlK = t < K.mira ? P(t, K.media - .3, 3.2) * .9 : 0; bowlW.material.color.copy(WBLUE).lerp(MAG, bowlK);
  flapM.color.set(s.worn ? 0x7a2a22 : 0xd8322a); flap.scale.set(s.worn ? 1.12 : 1, 1, s.worn ? .85 : 1); flap.rotation.z = s.worn ? .12 : 0;
  sarroS.forEach(x => x.visible = s.worn && (t < K.mira || t >= K.sarro));
  flapM.emissiveIntensity = inn(t, K.arregla + .6, K.baratos + .8) ? .6 : 0; ballM.color.set(inn(t, K.arregla + 1.2, K.listo) ? 0x35d39a : 0xff8a3d);
  const ly = LV(s.L); const sn = clamp((.9 - (ly + .012)) / .19, -1, 1); armG.rotation.z = Math.asin(sn);
  if (inn(t, K.arregla, K.arregla + .6)) { flapG.position.y = .6 - P(t, K.arregla, .6) * .3; } else flapG.position.y = .6;
  for (let i = 0; i < 40; i++) { const u = (t * (s.open > .2 ? 1.6 : .55) + i / 40) % 1; const p = u < .4 ? [0, lerp(.58, .49, u / .4), lerp(-.335, -.25, u / .4)] : [0, lerp(.49, .53, (u - .4) / .6), lerp(-.25, .06, (u - .4) / .6)]; const on = s.open > .2 ? true : s.trickle > 0 && i % 4 === 0; setP(flowP, i, p[0] + Math.sin(i) * .01, p[1], p[2], on); flowP.material.color.copy(t < K.mira ? MAG : new THREE.Color(0x3d9bff)); } flowP.instanceMatrix.needsUpdate = true;
  for (let i = 0; i < 16; i++) { const u = (t * 1.4 + i / 16) % 1; setP(fillP, i, .17, lerp(.88, ly, u), -.32 + Math.sin(i * 2) * .01, s.fill); } fillP.instanceMatrix.needsUpdate = true;
  for (let i = 0; i < 10; i++) { const u = clamp((t - K.colorante - i * .07) / .6); setP(dyeP, i, -.05, lerp(1.12, ly, u), -.32, u > 0 && u < 1); } dyeP.instanceMatrix.needsUpdate = true;
  for (let i = 0; i < 16; i++) { const u = (t * .9 + i / 16) % 1; setP(ovP, i, 0, lerp(.9, .58, u), -.405, s.over); } ovP.instanceMatrix.needsUpdate = true;
  // tanque del techo
  const rk = inn(t, K.techo, K.tubo) ? P(t, K.techo, 2.0) : 0; rtW.scale.y = lerp(.75, .97, rk); rtArm.rotation.z = -.1 * rk;
  for (let i = 0; i < 24; i++) { const u = (t * .45 + i / 24) % 1; const p = OVR.getPointAt(u); setP(ovOut, i, p.x, p.y, p.z, inn(t, K.nocierra, K.tubo)); } ovOut.instanceMatrix.needsUpdate = true;
  // tubo enterrado
  const lk = inn(t, K.tubo, K.plomero + 1.5); const wk = lk ? P(t, K.tubo, 3) : 0;
  for (let i = 0; i < 20; i++) { const u = (t * .7 + i / 20) % 1, a = i * 2.4; setP(leakP, i, LEAK.x + Math.cos(a) * u * .6, LEAK.y + Math.sin(a) * u * .35, GZ + .07, lk && t < K.plomero + 1.2, 1 - u * .5); } leakP.instanceMatrix.needsUpdate = true;
  wetSoil.material.opacity = .55 * wk * (t < K.listo ? 1 : 0); wetSoil.scale.set(Math.max(.01, wk), Math.max(.01, wk * .6), 1);
  const gk = t >= K.piso ? eout(P(t, K.verde - .3, 1.0)) : 0; green.visible = gk > 0 && t < K.listo; green.scale.setScalar(Math.max(.01, gk));
  damp.material.opacity = t >= K.piso && t < K.listo ? .5 * P(t, K.piso, .8) : 0;
  fixRing.visible = t >= K.plomero + 1.2;
  valve.rotation.y = t >= K.cierra + .5 && t < K.bueno ? -Math.PI / 2 : 0;
  { const x = WMT.x; x.fillStyle = '#0d1420'; x.fillRect(0, 0, 256, 128); x.font = '700 50px J'; x.fillStyle = '#7dd3ff'; x.textAlign = 'center'; x.textBaseline = 'middle'; x.fillText(m3(t).toFixed(3), 128, 54); x.font = '700 24px J'; x.fillText('m³', 128, 104); WMT.tx.needsUpdate = true; }
  // personajes
  let op = [X0 - 1.15, 0, .15], ory = 1.2, p = { emo: 'neutral' }, ev = false, ep = [0, 0, 0], ery = 0, e = { emo: 'neutral' }, eW = false; let bot = false;
  if (t < K.media) { bot = true; p = { emo: 'determined', armR: [-2.8, -.2, -.2], headRx: -.3, look: [.6, .6] }; op = [X0 - .95, 0, -.3]; ory = 1.4; }
  else if (t < K.mira) { op = [X0 - 1.0, 0, .5]; ory = .8; p = { emo: t > K.botando ? 'surprised' : 'neutral', headRx: .3, look: [.5, -.6], ...(t > K.botando ? { armR: [-2.4, -.5, -.4], armL: [-2.4, .5, -.4] } : {}) }; }
  else if (t < K.techo) { op = [X0 - 1.25, 0, -.35]; ory = 1.3; const push = inn(t, K.palanca - .3, K.palanca + 1.0); p = { emo: t > K.notapa && t < K.mal ? 'worried' : 'neutral', armR: push ? [-1.9, -.1, -.3] : [-.3, -.15, -.3], headRy: -.4, look: [.5, 0], ...(inn(t, K.noche, K.mal) ? { emo: 'sad', headRx: .25 } : {}) }; }
  else if (t < K.tubo) { op = [-1.0, 3.03, -1.0]; ory = -.6; p = { emo: t > K.nocierra ? 'surprised' : 'worried', armR: [-1.6, -.3, -.2], headRy: -.3 }; }
  else if (t < K.prueba) { op = [1.0, 0, .9]; ory = .3; p = { emo: t > K.piso ? 'surprised' : 'worried', headRx: .4, look: [0, -1] }; }
  else if (t < K.bueno) { op = [2.25, 0, .85]; ory = .5; p = { emo: t > K.fuga ? 'surprised' : 'determined', hipY: t < K.espera ? .7 : .98, spineRx: t < K.espera ? .4 : 0, legs: t < K.espera ? [-1.0, 1.6, -1.0, 1.6] : [0, 0, 0, 0], armR: t < K.espera ? [-.8, -.2, -.3] : [-.2, -.15, -.3], headRx: .3, look: [.5, -.8] }; }
  else if (t < K.plomero) { op = [X0 - 1.1, 0, -.4]; ory = 1.4; p = { emo: t > K.baratos ? 'happy' : 'determined', armR: [-2.6, -.2, -.6], headRx: -.2, look: [.6, .3] }; }
  else if (t < K.listo) { op = [.2, 0, 1.0]; ory = .5; p = { emo: 'happy', look: [.8, -.4] }; ev = true; ep = [1.45, 0, 1.45]; ery = 3.0; e = { emo: 'determined', hipY: .62, spineRx: .3, legs: [-1.2, 1.9, -1.2, 1.9], armL: [-1.0 + .2 * Math.sin(t * 9), .1, -.3] }; eW = true; }
  else { op = [X0 - 1.0, 0, .45]; ory = .6; bot = t >= K.hiciste; p = { emo: 'happy', ...(bot ? { armR: [-1.6, -.3, -.6] } : { armR: [-2.6, -.35, -.2 + .3 * Math.sin(t * 8)] }), armL: [-.2, .15, -.3] }; }
  owner.root.position.set(...op); owner.root.rotation.y = ory; pose(owner, p, t); bottle.visible = bot;
  eng.root.visible = ev; eng.root.position.set(...ep); eng.root.rotation.y = ery; pose(eng, e, t + 1.3); wrench.visible = eW; engCB.visible = !eW;
  // etiquetas
  OVL.length = 0; const Lb = (text, at, end, pos, color = '#ffcc33') => { if (t >= at && t < end) OVL.push({ text, at, end, pos, color }); };
  const TK = V(X0, 2.55, -.7), BW = V(X0, 1.9, .2);
  Lb('HAZ ESTA PRUEBA', .1, K.colorante - .1, TK); Lb('COLORANTE', K.colorante - .1, K.media, TK, '#ff6ac0');
  Lb('NO LO USES', PH[2].s, K.media, TK); Lb('SI SE PINTA…', K.media, K.botando, BW, '#ff6ac0'); Lb('¡ESTÁ BOTANDO AGUA!', K.botando, K.mira, BW, '#ff6a4a');
  Lb('ASÍ FUNCIONA', K.mira, K.palanca - .1, TK); Lb('PALANCA', K.palanca - .1, K.levanta - .1, TK); Lb('TAPÓN DE GOMA', K.levanta - .1, K.cae, TK); Lb('EL AGUA CAE', K.cae, K.baja1, TK, '#6cc4ff');
  Lb('EL TAPÓN BAJA', K.baja1, K.boya1 - .1, TK); Lb('BOYA', K.boya1 - .1, K.boya1 + 1.5, TK, '#ff8a4a'); Lb('SE LLENA OTRA VEZ', K.boya1 + 1.5, K.anos, TK, '#6cc4ff');
  Lb('GOMA DEFORMADA', K.anos, K.sarro - .1, TK, '#ff8a4a'); Lb('SARRO', K.sarro - .1, K.notapa, TK, '#ff8a4a'); Lb('YA NO TAPA', K.notapa, K.sale, TK, '#ff6a4a'); Lb('SE SALE POQUITO A POQUITO', K.sale, K.tbaja, TK, '#ff6a4a');
  Lb('EL TANQUE BAJA', K.tbaja, K.babre, TK); Lb('LA BOYA ABRE', K.babre, K.llena, TK, '#ff8a4a'); Lb('SE VUELVE A LLENAR', K.llena, K.dia, TK, '#6cc4ff'); Lb('TODO EL DÍA', K.dia, K.noche, TK); Lb('TODA LA NOCHE', K.noche, K.mal, TK, '#a98bff');
  Lb('BOYA MAL AJUSTADA', K.mal, K.sube, TK, '#ff8a4a'); Lb('TUBO DEL CENTRO', K.sube, K.otra, TK, '#6cc4ff'); Lb('OTRA FUGA QUE NO VES', K.otra, K.techo, TK, '#ff6a4a');
  Lb('TANQUE DEL TECHO', K.techo, K.nocierra, V(-2.3, 4.6, -.5)); Lb('LA BOYA NO CIERRA', K.nocierra, K.desague, V(-2.3, 4.6, -.5), '#ff6a4a'); Lb('SE VA AL DESAGÜE', K.desague, K.tubo, V(-3.5, 2.4, -.5), '#ff6a4a');
  Lb('TUBO DEBAJO DEL PISO', K.tubo, K.nada, V(1.5, .6, GZ)); Lb('NO VES NADA', K.nada, K.piso, V(1.5, .6, GZ), '#ff8a4a'); Lb('PISO HÚMEDO', K.piso, K.verde - .2, V(1.2, 1.0, 1.2), '#ff8a4a'); Lb('PASTO MÁS VERDE', K.verde - .2, K.prueba, V(1.5, 1.0, 1.5), '#7be36b');
  Lb('LA PRUEBA DEL MEDIDOR', K.prueba, K.cierra, V(2.6, 1.0, 1.5)); Lb('CIERRA TODAS LAS LLAVES', K.cierra, K.espera, V(2.6, 1.0, 1.5)); Lb('ANOTA Y ESPERA', K.espera, K.cambio, V(2.6, 1.0, 1.5)); Lb('¿CAMBIÓ?', K.cambio, K.fuga, V(2.6, 1.0, 1.5), '#ff8a4a'); Lb('¡HAY UNA FUGA!', K.fuga, K.bueno, V(2.6, 1.0, 1.5), '#ff6a4a');
  Lb('GOMA NUEVA', K.arregla + .5, K.arregla + 2.0, TK, '#7be36b'); Lb('BOYA NUEVA', K.arregla + 2.0, K.baratos, TK, '#7be36b'); Lb('REPUESTOS BARATOS', K.baratos, K.plomero, TK, '#7be36b');
  Lb('TUBO ENTERRADO = PLOMERO', K.plomero, K.listo, V(1.5, 1.2, GZ));
  Lb('¡CERO FUGAS!', K.listo + .4, K.hiciste, TK, '#7be36b'); Lb('¿DE QUÉ COLOR QUEDÓ?', K.hiciste + .2, CTA_ST, TK, '#ff6ac0');
}
function overlay2d(t) {
  const clock = (x, k) => { x.save(); x.translate(0, 35); x.strokeStyle = '#2a2c33'; x.lineWidth = 8; x.beginPath(); x.arc(0, 0, 80, 0, 6.29); x.stroke(); x.rotate(k * 6.283 * 6); x.lineWidth = 6; x.beginPath(); x.moveTo(0, 0); x.lineTo(0, -62); x.stroke(); x.rotate(-k * 6.283 * 6 + k * 6.283 / 2); x.lineWidth = 9; x.beginPath(); x.moveTo(0, 0); x.lineTo(0, -40); x.stroke(); x.restore(); };
  card(t, K.media - .05, K.botando, 540, 560, 'ESPERA', '#e0218a', x => { clock(x, P(t, K.media, 2.2)); x.font = '900 44px M'; x.fillStyle = '#e0218a'; x.fillText('30 MIN', 0, 138); });
  card(t, K.espera - .05, K.cambio + .4, 540, 560, 'ESPERA', '#3d8bff', x => { clock(x, P(t, K.espera, 2.0)); x.font = '900 44px M'; x.fillStyle = '#3d8bff'; x.fillText('1 A 2 HORAS', 0, 138); });
  if (inn(t, K.cierra, K.bueno)) { const k = eout(P(t, K.cierra, .35)); const moving = t > K.espera + .4; const col = t > K.cambio ? '#ff4d61' : '#6cc4ff';
    g.save(); g.translate(540, 1440); g.scale(k, k); g.fillStyle = 'rgba(10,14,28,.86)'; rrp(g, 0, -250, -95, 500, 190, 28); g.fill(); g.lineWidth = 5; g.strokeStyle = col; g.stroke();
    g.textAlign = 'center'; g.textBaseline = 'middle'; g.font = '700 26px J'; g.fillStyle = '#8a92a8'; g.fillText('MEDIDOR DE AGUA', 0, -66); g.font = '700 72px J'; g.fillStyle = '#7dd3ff'; g.fillText(m3(t).toFixed(3) + ' m³', 0, -8);
    g.font = '900 34px M'; g.fillStyle = col; g.fillText(t > K.cambio ? '⚠ SE MOVIÓ: FUGA' : moving ? 'ESPERANDO…' : 'ANOTA EL NÚMERO', 0, 58); g.restore(); }
}
const KEYW = new Set(['prueba', 'colorante', 'tanque', 'baño', 'pinta', 'botando', 'agua', 'palanca', 'tapón', 'goma', 'inodoro', 'hueco', 'boya', 'llave', 'sarro', 'poquito', 'ruido', 'día', 'noche', 'tubito', 'fuga', 'techo', 'rebosa', 'desagüe', 'tubo', 'piso', 'húmedo', 'pasto', 'verde', 'medidor', 'llaves', 'número', 'horas', 'repuestos', 'baratos', 'plomero', 'listo', 'color', 'comentarios']);

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
