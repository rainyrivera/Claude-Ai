// Reel 9:16 3D (Estilo B: construcción en corte) — Fuga de luz
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
// ================= FUGA DE LUZ =================
{ const x = WT.x; x.fillStyle = '#f6e6cf'; x.fillRect(0, 0, 1024, 406); x.fillStyle = 'rgba(0,0,0,.05)'; x.fillRect(0, 380, 1024, 26); WT.tx.needsUpdate = true; }
const K = { apaga: T('apaga'), pagando: T('pagando'), sigue: PS(3), mira: PS(4), entra: PS(5), caja: PS(6), cables: PS(7), cuenta: PS(8), uses: PS(9), pierda: PS(10), donde: PS(11), aparatos: PS(13), tele: PS(14), lucecita: PS(15), nevera: PS(16), goma: PS(17), motor: PS(18), peligroso: PS(19), pelado: PS(20), tierra: PS(21), pagas: PS(22), calienta: PS(23), enchufe: PS(24), ojo: PS(25), prueba: PS(27), desconecta: PS(28), principal1: T('principal', 1), mira2: PS(29), paro: PS(30), sube: PS(31), principal2: T('principal', 2), mover: PS(32), ahi: PS(33), ysi: PS(34), noescasa: PS(35), medidor2: PS(36), reporta: PS(37), esoSi: PS(38), noabras: PS(39), electricista: PS(40), cambia: PS(41), especial: PS(42), listo: PS(43), solo: PS(44), cuanto: PS(45) };
// --- utilería ---
const box3 = (w, h, d, c, x, y, z, o = {}) => { const m = hadd(M(new THREE.BoxGeometry(w, h, d), lp(c, o))); m.position.set(x, y, z); return m; };
const ledM = c => new THREE.MeshStandardMaterial({ color: 0x111111, emissive: c, emissiveIntensity: 0 });
// caja de breakers
box3(.52, .66, .08, 0x9aa0aa, -2.6, 1.6, -1.78);
const brk = [0, 1, 2, 3].map(i => { const m = new THREE.MeshStandardMaterial({ color: 0x22252c, emissive: 0x35d39a, emissiveIntensity: 0 }); const b = hadd(M(new THREE.BoxGeometry(.07, .12, .05), m)); b.position.set(-2.75 + i * .1, 1.48, -1.72); return b; });
const mainLev = hadd(new THREE.Group()); { const l = M(new THREE.BoxGeometry(.18, .14, .06), lp(0xd8322a)); l.position.y = .05; mainLev.add(l); } mainLev.position.set(-2.6, 1.72, -1.72);
// tele, mueble, barra, microondas, cargador, nevera, lámpara, apagador, enchufes
box3(1.2, .45, .4, 0x8a6a48, -1.0, .225 + .15, -1.5); const tv = box3(1.0, .6, .06, 0x15161a, -1.0, .95, -1.55);
const tvScr = hadd(M(new THREE.PlaneGeometry(.92, .52), new THREE.MeshStandardMaterial({ color: 0x0a0c12, emissive: 0x6cc4ff, emissiveIntensity: 0 }), false)); tvScr.position.set(-1.0, .95, -1.515);
const tvLed = hadd(M(new THREE.SphereGeometry(.018, 8, 6), ledM(0xff2a2a), false)); tvLed.position.set(-.55, .69, -1.51);
box3(1.3, .9, .55, 0xd9d2c4, .55, .45 + .15, -1.52); box3(1.34, .05, .6, 0x5a5f6a, .55, 1.08, -1.52);
const micro = box3(.55, .32, .36, 0xeef1f7, .3, 1.27, -1.55); const microLed = hadd(M(new THREE.BoxGeometry(.12, .05, .01), ledM(0x35d39a), false)); microLed.position.set(.47, 1.32, -1.365);
const chg = box3(.06, .06, .05, 0xffffff, 1.0, 1.25, -1.76); const chgLed = hadd(M(new THREE.SphereGeometry(.012, 6, 4), ledM(0x6cc4ff), false)); chgLed.position.set(1.0, 1.25, -1.73);
box3(.08, .01, .16, 0x1d1f25, .95, 1.12, -1.45);
const fridge = box3(.82, 1.85, .7, 0xf4f6fa, 2.45, .925 + .15, -1.45);
const doorG = hadd(new THREE.Group()); doorG.position.set(2.04, 0, -1.1); { const d = M(new THREE.BoxGeometry(.82, 1.8, .06), lp(0xeef1f7)); d.position.set(.41, 1.05, 0); doorG.add(d); const h = M(new THREE.BoxGeometry(.04, .4, .05), lp(0x9aa0aa)); h.position.set(.72, 1.25, .05); doorG.add(h); }
const comp = box3(.34, .26, .22, 0x2a2c33, 2.45, .3, -1.72);
const lamp = hadd(M(new THREE.SphereGeometry(.16, 16, 10), new THREE.MeshStandardMaterial({ color: 0xffffff, emissive: 0xffe9b0, emissiveIntensity: 0 }), false)); lamp.position.set(0, 2.6, -.3);
box3(.04, .14, .09, 0xffffff, -3.2, 1.25, .8);
const outM = new THREE.MeshStandardMaterial({ color: 0xffffff, emissive: 0xff3a10, emissiveIntensity: 0 });
const outs = [[-1.85, .4], [1.0, 1.25], [2.0, .4]].map(([x, y]) => { const o = hadd(M(new THREE.BoxGeometry(.1, .14, .03), x === -1.85 ? outM : lp(0xffffff))); o.position.set(x, y, -1.79); return o; });
// medidor exterior + poste
const meter = hadd(new THREE.Group()); meter.position.set(-3.47, 1.3, .8); meter.rotation.y = -Math.PI / 2;
const MT = canvasTex(256, 128);
{ const b = M(new THREE.BoxGeometry(.42, .56, .2), lp(0x8f949c)); meter.add(b); const gl = M(new THREE.CylinderGeometry(.17, .17, .1, 24), new THREE.MeshStandardMaterial({ color: 0xdff3ff, transparent: true, opacity: .35, roughness: .05, depthWrite: false }), false); gl.rotation.x = Math.PI / 2; gl.position.set(0, .04, .14); meter.add(gl); const sc = M(new THREE.PlaneGeometry(.26, .13), new THREE.MeshStandardMaterial({ map: MT.tx, emissive: 0xffffff, emissiveMap: MT.tx, emissiveIntensity: .6 }), false); sc.position.set(0, .1, .121); meter.add(sc); }
const disc = M(new THREE.CylinderGeometry(.13, .13, .012, 24), lp(0xb9c0d0, { metalness: .6 }), false); disc.position.set(0, -.08, .12); meter.add(disc); const discMark = M(new THREE.BoxGeometry(.05, .016, .02), lp(0x111111), false); discMark.position.set(.1, 0, 0); disc.add(discMark);
const pole = add(M(new THREE.CylinderGeometry(.11, .14, 6, 10), lp(0x8a8f99))); pole.position.set(-7.2, 3, 1.4);
add(M(new THREE.BoxGeometry(1.4, .1, .1), lp(0x8a8f99))).position.set(-7.2, 5.7, 1.4);
add(M(new THREE.TubeGeometry(new THREE.CatmullRomCurve3([V(-7.2, 5.6, 1.4), V(-5.4, 3.0, 1.1), V(-3.6, 1.6, .8)]), 30, .018, 5), lp(0x1d1f25), false));
// cables y circuitos
const cabM = [0, 1, 2, 3].map(() => new THREE.MeshStandardMaterial({ color: 0xd9822b, emissive: 0xffb02e, emissiveIntensity: .25, roughness: .4 }));
const feedM = new THREE.MeshStandardMaterial({ color: 0xd9822b, emissive: 0xffb02e, emissiveIntensity: .25 });
const path = pts => new THREE.CatmullRomCurve3(pts.map(p => V(...p)), false, 'catmullrom', .05);
const FEED = path([[-3.47, 1.3, .8], [-3.18, 1.3, .8], [-3.18, 1.6, -1.2], [-3.0, 1.6, -1.73], [-2.6, 1.6, -1.73]]);
const CIR = [path([[-2.75, 1.92, -1.73], [-2.75, 2.62, -1.73], [-1.4, 2.68, -1.0], [0, 2.68, -.3]]),
  path([[-2.65, 1.28, -1.75], [-2.65, .4, -1.75], [-1.85, .4, -1.75]]),
  path([[-2.55, 1.92, -1.73], [-2.55, 2.32, -1.73], [1.0, 2.32, -1.73], [1.0, 1.25, -1.73]]),
  path([[-2.45, 1.92, -1.74], [-2.45, 2.15, -1.74], [1.5, 2.15, -1.74], [2.0, 2.15, -1.74], [2.0, .4, -1.74]])];
hadd(M(new THREE.TubeGeometry(FEED, 60, .028, 6), feedM, false));
CIR.forEach((c, i) => hadd(M(new THREE.TubeGeometry(c, 80, .024, 6), cabM[i], false)));
const SPOT = V(1.5, 2.15, -1.72);
const bare = hadd(M(new THREE.CylinderGeometry(.03, .03, .14, 8), new THREE.MeshStandardMaterial({ color: 0xc87533, emissive: 0xff6a00, emissiveIntensity: 0, metalness: .6 }), false)); bare.rotation.z = Math.PI / 2; bare.position.copy(SPOT);
const fixSleeve = hadd(M(new THREE.CylinderGeometry(.045, .045, .22, 10), new THREE.MeshStandardMaterial({ color: 0x35d39a, emissive: 0x35d39a, emissiveIntensity: .4 }), false)); fixSleeve.rotation.z = Math.PI / 2; fixSleeve.position.copy(SPOT);
const groundGlow = hadd(M(new THREE.CircleGeometry(.3, 20), new THREE.MeshBasicMaterial({ color: 0xff3a2a, transparent: true, opacity: 0, depthWrite: false }), false)); groundGlow.rotation.x = -Math.PI / 2; groundGlow.position.set(1.5, .16, -1.55);
const dots = parts(70, new THREE.MeshBasicMaterial({ color: 0xffe066 }), .035), leakP = parts(16, 0xff3a2a, .035), sparks = parts(18, 0xffd34d, .025), cold = parts(24, new THREE.MeshBasicMaterial({ color: 0xbfe8ff, transparent: true, opacity: .7, depthWrite: false }), .05), smoke = parts(16, new THREE.MeshBasicMaterial({ color: 0x777777, transparent: true, opacity: .45, depthWrite: false }), .07);
// --- estado eléctrico ---
const dev = t => t < K.apaga + .4 ? 'on' : t < K.desconecta + .3 ? 'sb' : t < K.listo ? 'off' : 'on';
function cOn(t, c) {
  if (inn(t, K.principal1 + .2, K.principal2 + .2)) return false;
  if (inn(t, K.principal2 + .2, K.ysi)) return t >= [K.principal2 + .6, K.principal2 + 1.3, K.principal2 + 2.0, K.mover + .1][c];
  if (inn(t, K.ysi, K.electricista)) return false;
  return true;
}
const damaged = t => t < K.cambia + .8;
function loads(t) {
  const d = dev(t); const L = [0, 0, 0, 0];
  L[0] = (t < K.apaga + .4 || t >= K.listo || inn(t, K.principal2 + .6, K.ysi)) ? 1 : 0;
  L[1] = d === 'on' ? 1 : d === 'sb' ? .25 : 0; L[2] = d === 'on' ? .8 : d === 'sb' ? .2 : 0;
  L[3] = (d === 'off' ? 0 : inn(t, K.goma, K.peligroso) ? 1.2 : .6);
  const leak = damaged(t) && cOn(t, 3) ? .5 : 0;
  for (let c = 0; c < 4; c++) if (!cOn(t, c)) L[c] = 0;
  return { L, leak };
}
function rate(t) { if (inn(t, K.ysi, K.esoSi)) return .4; const { L, leak } = loads(t); return L[0] + L[1] + L[2] + L[3] + leak; }
const CUM = [0], CUML = [0]; for (let i = 1; i <= Math.ceil(END * 30) + 2; i++) { const t = i / 30; const lk = loads(t).leak + (rate(t) > 0 && dev(t) === 'sb' ? .5 : 0); CUM.push(CUM[i - 1] + rate(t) / 30 * .9); CUML.push(CUML[i - 1] + (damaged(t) ? lk : 0) / 30 * 18); }
const kwh = t => 2847 + CUM[Math.min(CUM.length - 1, Math.floor(t * 30))];
function drawMeterTex(t) { const x = MT.x; x.fillStyle = '#0d1a14'; x.fillRect(0, 0, 256, 128); x.font = '700 64px J'; x.fillStyle = '#7dffb0'; x.textAlign = 'center'; x.textBaseline = 'middle'; x.fillText(kwh(t).toFixed(1), 128, 58); x.font = '700 26px J'; x.fillText('kWh', 128, 108); MT.tx.needsUpdate = true; }
SHOTS = [
  [0, K.sigue, [.8, 1.8, 7.6], [.3, 1.6, 6.6], [-1.0, 1.2, -.5], [-.6, 1.2, -.6]],
  [K.sigue, K.mira, [-7.6, 1.8, 3.8], [-6.7, 1.6, 3.0], [-3.45, 1.3, .8], [-3.45, 1.3, .8]],
  [K.mira, K.cuenta, [-1.6, 1.9, 7.6], [.4, 1.7, 6.6], [-2.0, 1.5, -.6], [0, 1.6, -1.4]],
  [K.cuenta, K.aparatos, [0, 1.7, 7.2], [0, 1.6, 6.2], [0, 1.5, -1.5], [0, 1.5, -1.5]],
  [K.aparatos, K.nevera, [.2, 1.3, 3.8], [.1, 1.2, 3.0], [-.3, .9, -1.6], [-.3, .9, -1.6]],
  [K.nevera, K.peligroso, [2.9, 1.5, 3.0], [2.7, 1.4, 2.3], [2.3, 1.0, -1.3], [2.3, 1.0, -1.3]],
  [K.peligroso, K.enchufe, [2.0, 2.0, 2.2], [1.7, 1.9, 1.4], [1.5, 1.9, -1.7], [1.5, 1.5, -1.7]],
  [K.enchufe, K.prueba, [-1.2, .9, 1.4], [-1.45, .8, .8], [-1.85, .45, -1.76], [-1.85, .45, -1.76]],
  [K.prueba, K.paro, [-.4, 1.7, 4.2], [-1.3, 1.6, 2.8], [-1.4, 1.2, -1.4], [-2.6, 1.5, -1.76]],
  [K.paro, K.ysi, [.3, 1.8, 7.0], [.5, 1.7, 6.2], [-.4, 1.5, -1.5], [-.4, 1.5, -1.5]],
  [K.ysi, K.esoSi, [-8.6, 2.6, 5.4], [-7.6, 2.2, 4.2], [-5.0, 1.9, .9], [-4.6, 1.7, .9]],
  [K.esoSi, K.electricista, [-7.3, 1.7, 3.5], [-6.6, 1.6, 2.9], [-3.6, 1.3, .8], [-3.6, 1.3, .8]],
  [K.electricista, K.listo, [.8, 1.7, 5.6], [0, 1.6, 4.8], [.6, 1.6, -1.6], [-.6, 1.5, -1.6]],
  [K.listo, K.cuanto, [0, 1.7, 7.2], [.4, 1.6, 6.4], [0, 1.3, -1.2], [0, 1.3, -1.2]],
  [K.cuanto, 200, [7, 5, 12], [5.5, 4.2, 10], [0, 1.0, 0], [0, 1.1, 0]],
];
function animWorld(t) {
  skyDay(t);
  const d = dev(t), { L, leak } = loads(t), R = rate(t);
  const lampOn = L[0] > 0; lamp.material.emissiveIntensity = lampOn ? 2.2 : 0; ceilL.intensity = lampOn ? 6 : 2.2;
  tvScr.material.emissiveIntensity = (d === 'on' && cOn(t, 1)) ? .9 : 0; tvLed.material.emissiveIntensity = (d === 'sb' && cOn(t, 1)) ? 3 * (.7 + .3 * Math.sin(t * 6)) : 0;
  microLed.material.emissiveIntensity = (d !== 'off' && cOn(t, 2)) ? 2.5 : 0; chgLed.material.emissiveIntensity = (d !== 'off' && cOn(t, 2)) ? 2.5 : 0; chg.visible = d !== 'off';
  doorG.rotation.y = inn(t, K.goma, K.peligroso) ? -.09 : 0;
  comp.position.x = 2.45 + (L[3] > 0 ? Math.sin(t * 70) * (L[3] > 1 ? .012 : .005) : 0);
  // cables: brillo según circuito, calor en el dañado
  CIR.forEach((c, i) => { const on = cOn(t, i); cabM[i].emissiveIntensity = on ? .25 + .25 * (L[i] > 0 ? 1 : 0) : 0; cabM[i].color.set(on ? 0xd9822b : 0x6a5040); });
  feedM.emissiveIntensity = R > 0 ? .5 : 0;
  const hot = inn(t, K.calienta, K.prueba) ? P(t, K.calienta, 1.0) : 0; if (hot > 0) { cabM[3].color.set(new THREE.Color(0xd9822b).lerp(new THREE.Color(0xff2a10), hot)); cabM[3].emissive.set(0xff3a10); cabM[3].emissiveIntensity = .3 + .5 * hot; } else cabM[3].emissive.set(0xffb02e);
  if (inn(t, K.ahi, K.ysi)) { cabM[3].emissive.set(0xff2a2a); cabM[3].emissiveIntensity = .5 + .5 * Math.sin(t * 10); }
  if (inn(t, K.cambia + .8, K.especial)) { cabM[3].emissive.set(0x35d39a); cabM[3].emissiveIntensity = .6; }
  bare.visible = damaged(t); bare.material.emissiveIntensity = leak > 0 ? 1.2 + .8 * Math.sin(t * 20) : 0; fixSleeve.visible = t >= K.cambia + .8;
  groundGlow.material.opacity = leak > 0 && inn(t, K.tierra, K.prueba) ? .55 + .2 * Math.sin(t * 8) : 0;
  outM.emissiveIntensity = inn(t, K.enchufe - .3, K.prueba) ? 1.2 + .4 * Math.sin(t * 7) : 0;
  // breakers
  const mo = !inn(t, K.principal1 + .2, K.principal2 + .2) && !inn(t, K.ysi, K.electricista); mainLev.rotation.x = mo ? 0 : 1.0;
  brk.forEach((b, i) => { b.rotation.x = cOn(t, i) ? 0 : .6; b.material.emissiveIntensity = (i === 3 && t >= K.especial) ? 1.2 : 0; });
  // medidor
  drawMeterTex(t); disc.rotation.y = CUM[Math.min(CUM.length - 1, Math.floor(t * 30))] * 9;
  // partículas de energía
  const all = [FEED, ...CIR], spd = [R, ...L.map((l, i) => l + (i === 3 ? leak : 0))];
  for (let i = 0; i < 70; i++) { const ci = i % 5, cv = all[ci], s = spd[ci]; const u = ((t * .35 * Math.max(.3, s) + (i / 70) * 3.7) % 1); const p = cv.getPointAt(u); setP(dots, i, p.x, p.y, p.z + .01, s > 0.01 && (ci === 0 || cOn(t, ci - 1)), .9); } dots.instanceMatrix.needsUpdate = true;
  for (let i = 0; i < 16; i++) { const u = (t * .9 + i / 16) % 1; setP(leakP, i, 1.5 + Math.sin(i * 3) * .05, lerp(2.12, .16, u), -1.7, leak > 0 && inn(t, K.pelado - .2, K.prueba), 1); } leakP.instanceMatrix.needsUpdate = true;
  for (let i = 0; i < 18; i++) { const u = ((t * 2.2 + i / 18) % 1), a = i * 2.4; setP(sparks, i, SPOT.x + Math.cos(a) * u * .3, SPOT.y + Math.sin(a) * u * .25 - u * u * .2, -1.66, leak > 0 && t < K.cambia + .8 && inn(t, K.peligroso, K.esoSi), 1 - u); } sparks.instanceMatrix.needsUpdate = true;
  for (let i = 0; i < 24; i++) { const u = (t * .5 + i / 24) % 1; setP(cold, i, 2.86 + u * .7, .5 + (i % 8) * .17 - u * .2, -1.1 + (i % 3) * .1 + u * .5, inn(t, K.goma, K.peligroso), 1 - u * .6); } cold.instanceMatrix.needsUpdate = true;
  for (let i = 0; i < 16; i++) { const u = (t * .45 + i / 16) % 1; setP(smoke, i, -1.85 + Math.sin(u * 7 + i) * .06, .5 + u * .9, -1.7 + u * .2, inn(t, K.enchufe, K.prueba), .6 + u); } smoke.instanceMatrix.needsUpdate = true;
  // personajes
  let op = [0, 0, .6], ory = .3, p = { emo: 'neutral' }, ev = false, ep = [2, 0, .3], ery = -.4, e = { emo: 'neutral' }, eW = false;
  const point = (y = -1.6) => ({ armR: [y, -.3, -.2], armL: [-.2, .15, -.3] });
  if (t < K.sigue) { op = [-2.75, 0, .8]; ory = -1.2; p = { emo: t > K.apaga ? 'determined' : 'neutral', armR: t > K.apaga - .3 && t < K.apaga + .7 ? [-2.0, -.6, -.6] : [-.2, -.15, -.3], headRy: .9, look: [.6, 0] }; }
  else if (t < K.mira) { op = [-3.95, 0, .1]; ory = 1.6; p = { emo: t > K.pagando - .2 ? 'surprised' : 'worried', headRy: -.9, look: [-.6, 0], ...(t > K.pagando ? { armR: [-2.4, -.5, -.4], armL: [-2.4, .5, -.4] } : {}) }; }
  else if (t < K.aparatos) { op = [.6, 0, .5]; ory = -.3; p = { emo: 'neutral', ...point(-2.4), headRy: -.4, look: [-.5, .6] }; }
  else if (t < K.nevera) { op = [1.25, 0, -.95]; ory = -1.0; p = { emo: t > K.lucecita ? 'worried' : 'neutral', ...point(-1.2), headRy: -.5 }; }
  else if (t < K.peligroso) { op = [1.5, 0, -.95]; ory = .7; p = { emo: t > K.motor ? 'surprised' : 'worried', ...point(-1.3), headRy: .5, look: [.7, 0] }; }
  else if (t < K.enchufe) { op = [.25, 0, -1.25]; ory = .5; p = { emo: t > K.pagas ? 'surprised' : 'worried', headRx: -.45, look: [.5, 1], ...(t > K.pagas ? { armR: [-2.4, -.5, -.4], armL: [-2.4, .5, -.4] } : point(-2.5)) }; }
  else if (t < K.prueba) { op = [-.25, 0, -.6]; ory = -.6; op = [-.45, 0, -1.15]; ory = -1.0; p = { emo: t > K.ojo ? 'surprised' : 'disgust', armR: [-1.9, -.1, -1.9], armL: [-1.9, .1, -1.9], headRx: .2, look: [-.6, -.6] }; }
  else if (t < K.paro) { const atBox = t > K.principal1 - 1.3; op = atBox ? [-2.25, 0, -1.15] : [-.7, 0, -1.0]; ory = atBox ? 2.9 : 3.0; p = atBox ? { emo: 'determined', armR: [t > K.principal1 - .2 ? -1.9 : -2.5, -.3, -.3] } : { emo: 'determined', hipY: .7, spineRx: .4, legs: [-1.0, 1.6, -1.0, 1.6], armR: [-.9, -.2, -.3] }; }
  else if (t < K.ysi) { op = [-2.25, 0, -1.15]; ory = 2.9; p = { emo: t > K.ahi ? 'surprised' : 'determined', armR: [-2.2 + .3 * Math.sin(t * 4), -.3, -.3] }; if (t > K.ahi) { op = [-1.6, 0, -.9]; ory = .8; p = { emo: 'surprised', ...point(-2.2), headRy: .6, look: [.8, .5] }; } }
  else if (t < K.esoSi) { op = [-3.95, 0, .1]; ory = 1.6; p = { emo: 'suspicious', headRy: -.6, look: [-.4, .2], armR: [-.5, -.3, -1.6] }; }
  else if (t < K.electricista) { op = [-3.85, 0, .25]; ory = 1.5; const st = t > K.noabras + .3; p = { emo: st ? 'surprised' : 'neutral', armR: st ? [-.6, -.4, -.4] : [-1.5, -.2, -.2], headRy: st ? -.9 : 0 }; }
  else if (t < K.listo) { op = [.6, 0, .5]; ory = -.2; p = { emo: 'happy', look: [.3, .4] }; ev = true; const atBox = t > K.especial - .3; ep = atBox ? [-2.2, 0, -1.15] : [1.45, 0, -1.25]; ery = 3.0; e = { emo: 'determined', armL: [-2.6 + .2 * Math.sin(t * 9), .1, -.2], armR: [-.3, -.2, -.4] }; eW = true; }
  else { op = [.6, 0, .6]; ory = .2; p = { emo: 'happy', armR: [-2.6, -.35, -.2 + .3 * Math.sin(t * 8)], armL: [-.2, .15, -.3] }; ev = true; ep = [-1.0, 0, .3]; ery = .3; e = { emo: 'happy', armL: [-.9, .3, -.6] }; }
  owner.root.position.set(...op); owner.root.rotation.y = ory; pose(owner, p, t);
  eng.root.visible = ev; eng.root.position.set(...ep); eng.root.rotation.y = ery; pose(eng, e, t + 1.3); wrench.visible = eW; engCB.visible = !eW;
  // etiquetas
  OVL.length = 0; const Lb = (text, at, end, pos, color = '#ffcc33') => { if (t >= at && t < end) OVL.push({ text, at, end, pos, color }); };
  const MP = V(-3.45, 2.0, .8);
  Lb('HAZ ESTA PRUEBA', .1, K.apaga, V(-1.0, 2.4, 0)); Lb('APAGA TODO', K.apaga, K.sigue, V(-1.0, 2.4, 0), '#ff8a4a');
  Lb('¡SIGUE MARCANDO!', K.sigue, K.pagando - .1, MP, '#ff6a4a'); Lb('PAGAS LUZ QUE NADIE USA', K.pagando - .1, K.mira, MP, '#ff6a4a');
  Lb('MEDIDOR', K.entra, K.caja, V(-3.4, 2.1, .8)); Lb('CAJA DE BREAKERS', K.caja, K.cables, V(-2.6, 2.3, -1.7)); Lb('CABLES EN LA PARED', K.cables, K.cuenta, V(0, 2.6, -1.7));
  Lb('CUENTA TODO', K.cuenta, K.uses, V(0, 2.6, -1.0)); Lb('LO QUE USAS…', K.uses, K.pierda, V(0, 2.6, -1.0), '#7be36b'); Lb('…Y LO QUE SE PIERDE', K.pierda, K.donde, V(0, 2.6, -1.0), '#ff6a4a'); Lb('¿POR DÓNDE?', K.donde, K.aparatos, V(0, 2.6, -1.0), '#ff8a4a');
  Lb('APARATOS EN ESPERA', K.aparatos, K.tele, V(-.4, 1.8, -1.6)); Lb('TELE · MICRO · CARGADOR', K.tele, K.lucecita, V(-.4, 1.8, -1.6)); Lb('¡SIGUEN GASTANDO!', K.lucecita, K.nevera, V(-.4, 1.8, -1.6), '#ff6a4a');
  Lb('NEVERA', K.nevera, K.goma, V(2.4, 2.2, -1.3)); Lb('GOMA ROTA', K.goma, K.motor, V(2.4, 2.2, -1.3), '#ff6a4a'); Lb('MOTOR AL DOBLE', K.motor, K.peligroso, V(2.4, 2.2, -1.3), '#ff6a4a');
  Lb('DENTRO DE LA PARED', K.peligroso, K.pelado, V(1.5, 2.6, -1.7)); Lb('CABLE PELADO', K.pelado, K.tierra, V(1.5, 2.6, -1.7), '#ff6a4a'); Lb('SE ESCAPA A TIERRA', K.tierra, K.pagas, V(1.5, 2.6, -1.7), '#ff6a4a'); Lb('¡Y TÚ LA PAGAS!', K.pagas, K.calienta, V(1.5, 2.6, -1.7), '#ff6a4a');
  Lb('SE CALIENTA', K.calienta, K.enchufe, V(1.5, 2.6, -1.7), '#ff8a4a'); Lb('ENCHUFE CALIENTE', K.enchufe, K.ojo, V(-1.85, 1.2, -1.7), '#ff8a4a'); Lb('¡ALARMA!', K.ojo, K.prueba, V(-1.85, 1.2, -1.7), '#ff6a4a');
  Lb('LA PRUEBA', K.prueba, K.desconecta, V(-1.6, 2.4, -1.6)); Lb('DESCONECTA TODO', K.desconecta, K.principal1 - .1, V(-1.6, 2.4, -1.6)); Lb('BAJA EL PRINCIPAL', K.principal1 - .1, K.mira2, V(-2.6, 2.4, -1.7), '#ff8a4a'); Lb('MIRA EL MEDIDOR', K.mira2, K.paro, V(-2.6, 2.4, -1.7));
  Lb('¿SE PARÓ?', K.paro, K.sube, V(0, 2.6, -1.0), '#7be36b'); Lb('UNO POR UNO', K.sube, K.mover, V(0, 2.6, -1.0)); Lb('SE MUEVE OTRA VEZ', K.mover, K.ahi, V(0, 2.6, -1.0), '#ff6a4a'); Lb('¡AHÍ ESTÁ TU FUGA!', K.ahi, K.ysi, V(1.5, 2.6, -1.7), '#ff6a4a');
  Lb('¿TODO ABAJO Y SIGUE?', K.ysi, K.noescasa, V(-4.4, 2.6, .9), '#ff8a4a'); Lb('NO ES TU CASA', K.noescasa, K.medidor2, V(-4.4, 2.6, .9)); Lb('PUEDE SER EL MEDIDOR', K.medidor2, K.reporta, V(-4.4, 2.6, .9), '#ff8a4a'); Lb('REPÓRTALO A LA COMPAÑÍA', K.reporta, K.esoSi, V(-4.4, 2.6, .9), '#7be36b');
  Lb('✖ NO LO ABRAS', K.noabras, K.electricista, MP, '#ff6a4a'); Lb('LLAMA A UN ELECTRICISTA', K.electricista, K.cambia, V(0, 2.6, -1.0)); Lb('CABLE NUEVO', K.cambia, K.especial, V(1.5, 2.6, -1.7), '#7be36b'); Lb('BREAKER CONTRA FUGAS', K.especial, K.listo, V(-2.6, 2.4, -1.7), '#7be36b');
  Lb('¡SOLO PAGAS LO QUE USAS!', K.solo, K.cuanto, V(0, 2.6, -.5), '#7be36b'); Lb('¿CUÁNTO TE LLEGÓ?', K.cuanto + .2, CTA_ST, V(0, 4.2, 0), '#ff8a4a');
}
// HUD del medidor (2D)
function overlay2d(t) {
  const vis = inn(t, K.apaga + .2, K.mira) || inn(t, K.cuenta, K.donde) || inn(t, K.desconecta, K.esoSi) || inn(t, K.listo, CTA_ST); if (!vis) return;
  const R = rate(t), { L, leak } = loads(t), useful = L.reduce((a, b) => a + b, 0) - (dev(t) === 'sb' ? 0 : 0);
  let st = 'MARCANDO', col = '#ffffff'; if (R < .01) { st = '✔ DETENIDO'; col = '#35d39a'; } else if (inn(t, K.ysi, K.esoSi)) { st = '? EL MEDIDOR'; col = '#ff8a4a'; } else if (leak > 0 || dev(t) === 'sb') { st = '⚠ SIGUE MARCANDO'; col = '#ff4d61'; } if (t >= K.listo) { st = '✔ SOLO LO QUE USAS'; col = '#35d39a'; }
  const k = eout(P(t, [K.apaga + .2, K.cuenta, K.desconecta, K.listo].filter(a => a <= t).pop(), .35));
  g.save(); g.translate(540, 1440); g.scale(k, k); g.fillStyle = 'rgba(10,14,28,.86)'; rrp(g, 0, -250, -95, 500, 190, 28); g.fill(); g.lineWidth = 5; g.strokeStyle = col; g.stroke();
  g.textAlign = 'center'; g.textBaseline = 'middle'; g.font = '700 26px J'; g.fillStyle = '#8a92a8'; g.fillText('MEDIDOR DE LUZ', 0, -66);
  g.font = '700 74px J'; g.fillStyle = '#7dffb0'; g.fillText(kwh(t).toFixed(2) + ' kWh', 0, -8);
  g.font = '900 34px M'; g.fillStyle = col; g.fillText(st, 0, 58); g.restore();
}
const KEYW = new Set(['prueba', 'apaga', 'medidor', 'marcando', 'pagando', 'luz', 'breakers', 'cables', 'paredes', 'pierde', 'aparatos', 'tele', 'microondas', 'cargadores', 'lucecita', 'gastando', 'nevera', 'goma', 'motor', 'doble', 'peligroso', 'pelado', 'tierra', 'pagas', 'calienta', 'enchufe', 'quemado', 'alarma', 'desconecta', 'breaker', 'principal', 'paró', 'fuga', 'compañía', 'electricista', 'listo', 'comentarios']);

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
