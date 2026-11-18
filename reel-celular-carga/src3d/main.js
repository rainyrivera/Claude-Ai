// Reel 9:16 3D (Estilo B: construcción en corte) — Celular que carga lento
import * as THREE from 'three';
import { EffectComposer } from 'three/addons/postprocessing/EffectComposer.js';
import { RenderPass } from 'three/addons/postprocessing/RenderPass.js';
import { UnrealBloomPass } from 'three/addons/postprocessing/UnrealBloomPass.js';
import { OutputPass } from 'three/addons/postprocessing/OutputPass.js';

const W = 1080, H = 1920, END = 102.9;   // END = última palabra + 3,7 s (cierre)
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
// ================= CELULAR QUE CARGA LENTO: pelusa en el puerto =================
const K = { lento: PS(0), aveces: PS(1), bateria: PS(2), espera: PS(3), noes: PS(4), mira: PS(5), explico: PS(6), metes: PS(7), bolsillo: PS(8), conectas: PS(9), empuja: PS(10), tiempo: PS(11), noentra: PS(12), notocan: PS(13), desconecta: PS(14),
  p1: PS(15), apaga: PS(16), p2: PS(17), alumbra: PS(18), gris: PS(19), problema: PS(20), p3: PS(21), palillo: PS(22), aguja: PS(23), rayar: PS(24), p4: PS(25), raspa: PS(26), saca: PS(27), fuerza: PS(28),
  p5: PS(29), voltea: PS(30), golpe: PS(31), p6: PS(32), limpia: PS(33), conecta: PS(34), completo: PS(35), listo: PS(36), sigue: PS(37), otro: PS(38), tampoco: PS(39), tecnico: PS(40), cuanta: PS(41), leo: PS(42) };
const CLIC = (() => { try { return T('clic'); } catch (e) { return K.completo + 1.2; } })();
// pared lisa con enchufe
(function () { const x = WT.x; x.fillStyle = '#f3e6cf'; x.fillRect(0, 0, 1024, 406); x.fillStyle = '#e4d3b6'; x.fillRect(0, py(.15), 1024, 8);
  x.fillStyle = '#ffffff'; rrp(x, 0, pxx(.75), py(.62), 34, 48, 6); x.fill(); x.fillStyle = '#555'; x.fillRect(pxx(.75) + 10, py(.62) + 12, 4, 10); x.fillRect(pxx(.75) + 20, py(.62) + 12, 4, 10);
  x.fillStyle = '#9fd6f2'; x.fillRect(pxx(-2.6), py(2.0), 150, 120); x.strokeStyle = '#ffffff'; x.lineWidth = 10; x.strokeRect(pxx(-2.6), py(2.0), 150, 120); WT.tx.needsUpdate = true; })();
// mesa, sofá, lámpara
const woodM = lp(0x9a6a40); const TB = add(new THREE.Group()); TB.position.set(.6, 0, -.7);
{ const top = M(new THREE.BoxGeometry(1.5, .07, .8), woodM); top.position.y = .8; TB.add(top); for (const [a, b] of [[-.68, -.34], [.68, -.34], [-.68, .34], [.68, .34]]) { const l = M(new THREE.BoxGeometry(.07, .78, .07), woodM); l.position.set(a, .4, b); TB.add(l); } }
{ const so = add(new THREE.Group()); so.position.set(-2.1, .15, -1.2); const b = M(new THREE.BoxGeometry(1.6, .45, .8), lp(0x4a6fa5)); b.position.y = .22; const bk = M(new THREE.BoxGeometry(1.6, .6, .2), lp(0x4a6fa5)); bk.position.set(0, .6, -.3); so.add(b, bk); }
// celular sobre la mesa (de pie en un soporte)
const PHS = canvasTex(256, 512);
const phone = add(new THREE.Group()); phone.position.set(.6, .84, -.72);
{ const body = rbox(.36, .72, .05, .03, mat(0x1b1e27, { roughness: .35 })); body.position.y = .36; phone.add(body);
  const scr = M(new THREE.PlaneGeometry(.32, .66), new THREE.MeshStandardMaterial({ map: PHS.tx, emissive: 0xffffff, emissiveMap: PHS.tx, emissiveIntensity: .9, roughness: .3 }), false); scr.position.set(0, .36, .046); phone.add(scr);
  const port = M(new THREE.BoxGeometry(.1, .02, .06), new THREE.MeshBasicMaterial({ color: 0xff8a3d }), false); port.position.set(0, .0, 0); phone.add(port); const spk = M(new THREE.BoxGeometry(.1, .012, .01), lp(0x8a8f99), false); spk.position.set(0, .7, .047); phone.add(spk); }
phone.rotation.x = -.12;
const stand = add(M(new THREE.BoxGeometry(.3, .05, .2), lp(0x666a75))); stand.position.set(.6, .835, -.66);
// cable al enchufe
const cableM = lp(0xf2f2f2); let cableMesh = null;
function setCable(p0, p1, sag = .25) { if (cableMesh) { scene.remove(cableMesh); cableMesh.geometry.dispose(); } const mid = p0.clone().lerp(p1, .5); mid.y -= sag; const c = new THREE.CatmullRomCurve3([p0, p0.clone().lerp(mid, .5).add(V(0, -.05, 0)), mid, mid.clone().lerp(p1, .5), p1]); cableMesh = add(M(new THREE.TubeGeometry(c, 30, .012, 6), cableM, false)); }
const plugS = add(rbox(.06, .1, .035, .01, cableM)); // conector pequeño
function drawPhone(pct, chg, off, warn) {
  const x = PHS.x; x.fillStyle = off ? '#000' : '#0d1730'; x.fillRect(0, 0, 256, 512); if (off) { PHS.tx.needsUpdate = true; return; }
  x.fillStyle = '#ffffff'; x.font = '700 30px M'; x.textAlign = 'center'; x.fillText('9:41', 128, 60);
  x.strokeStyle = '#ffffff'; x.lineWidth = 8; rrp(x, 0, 58, 180, 140, 230, 18); x.stroke(); x.fillStyle = '#ffffff'; x.fillRect(103, 164, 50, 16);
  const col = pct < .2 ? '#ff4d61' : pct < .5 ? '#f6b445' : '#35d39a'; x.fillStyle = col; const hh = 206 * pct; x.fillRect(70, 398 - hh, 116, hh);
  x.font = '900 46px M'; x.fillStyle = '#fff'; x.fillText(Math.round(pct * 100) + '%', 128, 470);
  if (chg) { x.fillStyle = '#ffd23a'; x.beginPath(); x.moveTo(140, 220); x.lineTo(100, 300); x.lineTo(130, 300); x.lineTo(115, 370); x.lineTo(160, 280); x.lineTo(130, 280); x.closePath(); x.fill(); }
  if (warn) { x.fillStyle = '#ff4d61'; x.font = '900 30px M'; x.fillText('¿CARGANDO?', 128, 130); }
  PHS.tx.needsUpdate = true; }
// batería nueva (con precio) para "comprar otra batería"
const newBat = add(new THREE.Group()); newBat.position.set(-.35, .84, -.6);
{ const b = rbox(.34, .5, .08, .02, lp(0x2c3245)); b.position.y = .26; const st = canvasTex(128, 192), x = st.x; x.fillStyle = '#2c3245'; x.fillRect(0, 0, 128, 192); x.fillStyle = '#35d39a'; x.fillRect(20, 30, 88, 20); x.fillStyle = '#fff'; x.font = '900 30px M'; x.textAlign = 'center'; x.fillText('BATERÍA', 64, 110); x.fillStyle = '#f6b445'; x.font = '900 34px M'; x.fillText('$$$', 64, 160); st.tx.needsUpdate = true; const f = M(new THREE.PlaneGeometry(.3, .45), new THREE.MeshBasicMaterial({ map: st.tx }), false); f.position.set(0, .26, .045); newBat.add(b, f); }
// linterna
const torch = add(new THREE.Group()); { const b = M(new THREE.CylinderGeometry(.045, .045, .32, 12), lp(0xffcc33)); b.rotation.z = Math.PI / 2; const h = M(new THREE.CylinderGeometry(.07, .05, .1, 12), lp(0x333844)); h.rotation.z = Math.PI / 2; h.position.x = -.2; torch.add(b, h); }
const beamM = new THREE.MeshBasicMaterial({ color: 0xfff2b0, transparent: true, opacity: .28, depthWrite: false, blending: THREE.AdditiveBlending });
const beam = new THREE.Mesh(new THREE.ConeGeometry(.18, .9, 24, 1, true), beamM); beam.rotation.z = Math.PI / 2; beam.position.x = -.68; torch.add(beam);
// ======== diorama gigante del puerto (corte) ========
const X0 = 30; add(M(new THREE.CylinderGeometry(4.2, 4.4, .4, 40), lp(0xd6dbe4))).position.set(X0, -.2, 0);
const MAC = add(new THREE.Group()); MAC.position.set(X0 - .2, 2.6, 0); MAC.scale.setScalar(.72);
const shellM = lp(0x2b2f3a), cutM = lp(0xc2563c), goldM = new THREE.MeshStandardMaterial({ color: 0xf2c14e, metalness: .8, roughness: .25, emissive: 0x35d39a, emissiveIntensity: 0 });
{ const mk = (w, h, d, x, y, z, m) => { const o = M(new THREE.BoxGeometry(w, h, d), m); o.position.set(x, y, z); MAC.add(o); return o; };
  mk(4.2, .55, 1.6, .1, .55, 0, shellM); mk(4.2, .55, 1.6, .1, -.55, 0, shellM); mk(.5, .55, 1.6, -1.85, 0, 0, shellM); mk(3.7, .55, .12, .35, 0, -.74, lp(0x1d2029));
  mk(4.2, .04, .02, .1, .82, .81, cutM); mk(4.2, .04, .02, .1, -.82, .81, cutM); mk(4.2, .55, .02, .1, .55, .81, lp(0x3a3f4c)); mk(4.2, .55, .02, .1, -.55, .81, lp(0x3a3f4c));
  mk(4.3, .06, 1.7, .1, .86, 0, new THREE.MeshStandardMaterial({ color: 0x0c1830, roughness: .15, metalness: .2 })); // pantalla
  const pcb = mk(3.0, .1, 1.2, -.3, .32, 0, lp(0x1f7a4a)); for (let i = 0; i < 5; i++) mk(.25, .08, .25, -1.4 + i * .55, .4, -.2 + (i % 2) * .3, lp([0x222222, 0x8a8f99, 0x222222, 0xc0c4cc, 0x222222][i]));
}
const portPins = []; for (let i = 0; i < 6; i++) for (const s of [1, -1]) { const p = M(new THREE.BoxGeometry(.1, .05, .9), goldM); p.position.set(-1.45 + i * .16, .25 * s, 0); MAC.add(p); portPins.push(p); }
// conector gigante
const PLUG = new THREE.Group(); MAC.add(PLUG);
const plugGold = new THREE.MeshStandardMaterial({ color: 0xf2c14e, metalness: .8, roughness: .25, emissive: 0x35d39a, emissiveIntensity: 0 });
{ const sh = M(new THREE.BoxGeometry(1.2, .38, 1.1), mat(0xc9ced8, { metalness: .7, roughness: .3 })); sh.position.x = .6; PLUG.add(sh);
  for (let i = 0; i < 6; i++) for (const s of [1, -1]) { const p = M(new THREE.BoxGeometry(.1, .03, .8), plugGold); p.position.set(.12 + i * .16, .2 * s, 0); PLUG.add(p); }
  const hs = rbox(.8, .62, 1.3, .1, lp(0xf2f2f2)); hs.position.x = 1.6; PLUG.add(hs);
  const cb = M(new THREE.CylinderGeometry(.14, .14, 4, 12), lp(0xf2f2f2)); cb.rotation.z = Math.PI / 2; cb.position.x = 4.0; PLUG.add(cb); }
// pelusa: bolitas sueltas + "alfombrita" compactada al fondo
const lintM = new THREE.MeshStandardMaterial({ color: 0x8e8e96, roughness: 1, flatShading: true });
const lint = new THREE.InstancedMesh(new THREE.IcosahedronGeometry(.07, 0), lintM, 50); lint.frustumCulled = false; MAC.add(lint);
const LP = Array.from({ length: 50 }, (_, i) => ({ sx: 3.2 + rnd() * 2.5, sy: (rnd() - .5) * 1.8, sz: (rnd() - .5) * 1.2, ex: -1.45 + rnd() * .5, ey: -.2 + rnd() * .1, ez: (rnd() - .5) * 1.1, d: rnd() * 1.2, s: .7 + rnd() * .9 }));
const LT = canvasTex(128, 128); { const x = LT.x; x.fillStyle = '#86868e'; x.fillRect(0, 0, 128, 128); for (let i = 0; i < 400; i++) { x.strokeStyle = ['#6d6d75', '#a5a5ad', '#5b5b63', '#b8b2a8'][i % 4]; x.lineWidth = 1 + rnd() * 2; x.beginPath(); const a = rnd() * 128, b = rnd() * 128; x.moveTo(a, b); x.quadraticCurveTo(a + (rnd() - .5) * 30, b + (rnd() - .5) * 30, a + (rnd() - .5) * 40, b + (rnd() - .5) * 40); x.stroke(); } LT.tx.needsUpdate = true; }
const carpet = M(new THREE.BoxGeometry(1, .46, 1.3), new THREE.MeshStandardMaterial({ map: LT.tx, roughness: 1, emissive: 0xff4d61, emissiveIntensity: 0 })); MAC.add(carpet);
// palillo, aguja, paño, linterna gigante
const pick = new THREE.Group(); MAC.add(pick); { const c = M(new THREE.CylinderGeometry(.13, .03, 4.5, 10), lp(0xe0b77a)); c.rotation.z = Math.PI / 2; c.position.x = 2.25; pick.add(c); }
const pickLint = M(new THREE.IcosahedronGeometry(.22, 1), new THREE.MeshStandardMaterial({ map: LT.tx, roughness: 1, flatShading: true })); pick.add(pickLint); pickLint.scale.set(1.3, .8, 1.1);
const needle = new THREE.Group(); MAC.add(needle); { const c = M(new THREE.CylinderGeometry(.07, .01, 4.5, 8), mat(0xdfe3ea, { metalness: .9, roughness: .15 })); c.rotation.z = Math.PI / 2; c.position.x = 2.25; needle.add(c); }
const sparkM = new THREE.MeshBasicMaterial({ color: 0xfff3a0, transparent: true, blending: THREE.AdditiveBlending, depthWrite: false });
const spark = new THREE.Mesh(new THREE.IcosahedronGeometry(.18, 0), sparkM); MAC.add(spark);
const cloth = rbox(.9, .7, 1.5, .15, lp(0xf2f6ff)); MAC.add(cloth);
const bigBeam = new THREE.Mesh(new THREE.ConeGeometry(.55, 4, 32, 1, true), beamM.clone()); bigBeam.rotation.z = -Math.PI / 2; MAC.add(bigBeam);
const macL = new THREE.PointLight(0xfff4e0, 0, 14, 1.2); macL.position.set(X0 + .5, 3.2, 3.6); scene.add(macL);
const tunL = new THREE.PointLight(0xfff0b0, 0, 4, 1.5); MAC.add(tunL); tunL.position.set(-.8, 0, .4);
// energía por el cable
const flow = parts(16, 0x5bffb5, .07);
// batería 3D flotante (indicador de carga)
const BAT = add(new THREE.Group()); { const sh = rbox(.7, 1.2, .3, .08, new THREE.MeshStandardMaterial({ color: 0xffffff, transparent: true, opacity: .35, roughness: .2 })); const cp = rbox(.3, .12, .2, .04, lp(0xffffff)); cp.position.y = .66; BAT.add(sh, cp); }
const batFillM = new THREE.MeshStandardMaterial({ color: 0x35d39a, emissive: 0x35d39a, emissiveIntensity: .6 }); const batFill = M(new THREE.BoxGeometry(.56, 1.06, .2), batFillM, false); BAT.add(batFill);
function setBat(pct) { batFill.scale.y = Math.max(.01, pct); batFill.position.y = -.53 + .53 * pct; const c = pct < .2 ? 0xff4d61 : pct < .5 ? 0xf6b445 : 0x35d39a; batFillM.color.set(c); batFillM.emissive.set(c); }
const crumbs = parts(14, 0x8e8e96, .025);
// ---- cámara ----
const PH0 = V(.6, 1.1, -.72); // pantalla del celular en la mesa
const MC = V(X0 - .2, 2.6, 0);
SHOTS = [
  [0, K.espera, [2.6, 1.9, 5.2], [1.6, 1.5, 3.4], [.3, 0.78, -.6], [.5, 0.83, -.7]],
  [K.espera, K.mira, [.1, 1.5, 3.6], [.4, 1.3, 2.6], [-.1, 0.88, -.5], [.3, 0.83, -.6]],
  [K.mira, K.explico, [.6, 1.0, 1.4], [.6, 0.9, .4], [.6, 0.64, -.7], [.6, 0.63, -.72]],
  [K.explico, K.bolsillo, [X0 + 1.6, 2.9, 7.4], [X0 + .6, 2.5, 6.2], [X0 + .3, 1.75, 0], [X0, 1.75, 0]],
  [K.bolsillo, K.empuja, [X0 + 2.4, 3.1, 6.6], [X0 + 1.4, 2.5, 5.6], [X0 + .8, 1.75, 0], [X0 + .2, 1.75, 0]],
  [K.empuja, K.tiempo, [X0 - .4, 2.4, 4.2], [X0 - .9, 2.2, 3.6], [X0 - .9, 2.15, 0], [X0 - .9, 2.15, 0]],
  [K.tiempo, K.p1, [X0 + .3, 2.7, 6.6], [X0 - .1, 2.4, 5.6], [X0, 1.75, 0], [X0, 1.75, 0]],
  [K.p1, K.p2, [.2, 1.6, 2.8], [.4, 1.35, 2.0], [.4, 0.78, -.6], [.6, 0.73, -.7]],
  [K.p2, K.gris, [1.9, 1.3, 2.0], [1.4, 1.1, 1.3], [.6, 0.68, -.7], [.6, 0.64, -.7]],
  [K.gris, K.p3, [X0 + .2, 2.3, 4.4], [X0 - .5, 2.1, 3.4], [X0 - .6, 2.15, 0], [X0 - 1.0, 2.15, 0]],
  [K.p3, K.p4, [X0 + 1.8, 2.8, 6.8], [X0 + 1.2, 2.5, 6.0], [X0 + .6, 1.75, 0], [X0 + .4, 1.75, 0]],
  [K.p4, K.p5, [X0 - .2, 2.4, 4.8], [X0 - .6, 2.2, 3.9], [X0 - .6, 2.15, 0], [X0 - .3, 2.15, 0]],
  [K.p5, K.p6, [-.4, 1.7, 3.0], [-.1, 1.5, 2.4], [.4, 0.98, -.6], [.5, 0.93, -.6]],
  [K.p6, K.conecta, [X0 + 3.6, 2.7, 5.4], [X0 + 3.0, 2.4, 4.6], [X0 + 2.0, 1.75, 0], [X0 + 2.2, 1.75, 0]],
  [K.conecta, K.sigue, [X0 + 1.2, 2.8, 7.2], [X0 + .4, 2.5, 6.0], [X0 + .1, 1.85, 0], [X0 - .2, 1.85, 0]],
  [K.sigue, K.cuanta, [1.8, 1.6, 4.6], [1.2, 1.4, 3.6], [.2, 0.88, -.5], [.2, 0.88, -.5]],
  [K.cuanta, 200, [2.8, 2.6, 7.4], [2.2, 2.2, 6.2], [0, 0.88, -.4], [0, 0.98, -.4]],
];
function animWorld(t) {
  skyDay(t);
  const inMac = (inn(t, K.explico, K.p1) || inn(t, K.gris, K.p5) || inn(t, K.p6, K.sigue));
  macL.intensity = inMac ? 3.6 : 0;
  // ---- estado del celular ----
  const clean = t >= K.raspa + 2.5, fixed = t >= CLIC - .2;
  let pct = .12 + .02 * Math.sin(t * .3); let chg = !inn(t, K.aveces, K.aveces + 1.2) && !inn(t, K.aveces + 2, K.aveces + 2.5);
  if (t >= K.desconecta && t < K.p1) chg = Math.sin(t * 6) > 0;
  const off = inn(t, K.apaga + .4, K.conecta - .2);
  if (fixed) { pct = clamp(.12 + (t - CLIC) * .09, 0, 1); chg = true; }
  drawPhone(pct, chg, off, inn(t, K.lento, K.bateria));
  // celular: voltear y golpecitos
  let flip = 0, tap = 0; if (inn(t, K.voltea, K.p6)) { flip = eio(P(t, K.voltea, .8)) * (1 - eio(P(t, K.p6 - .7, .6))); tap = inn(t, K.golpe, K.golpe + 1.6) ? Math.abs(Math.sin((t - K.golpe) * 12)) * .06 : 0; }
  phone.rotation.set(-.12 + flip * Math.PI, 0, 0); phone.position.y = .84 + flip * .75 + tap;
  // cable del celular al enchufe (desconectado mientras se limpia)
  const plugged = !inn(t, K.p1, CLIC - .4);
  const pb = V(.6, .84 + flip * .75, -.72); const pIn = plugged ? pb : V(1.05, .84, -.45);
  plugS.position.copy(pIn).add(V(0, plugged ? -.04 : .02, 0)); plugS.rotation.set(plugged ? 0 : Math.PI / 2, 0, plugged ? 0 : .5);
  if (!cableMesh || (t * 30 | 0) % 3 === 0 || true) setCable(pIn.clone().add(V(0, -.08, 0)), V(.6 + .15, .5, -1.79), .35);
  newBat.visible = inn(t, K.bateria, K.mira); newBat.position.y = .84 + (1 - eback(P(t, K.bateria, .4))) * .3; newBat.rotation.y = inn(t, K.noes, K.mira) ? Math.sin(t * 20) * .05 : 0;
  for (let i = 0; i < 14; i++) { const u = ((t - K.golpe) * 1.3 + i / 14) % 1; setP(crumbs, i, .6 + Math.sin(i * 3) * .05, lerp(1.55, .86, u), -.7 + Math.cos(i * 5) * .04, inn(t, K.golpe, K.golpe + 2.2)); } crumbs.instanceMatrix.needsUpdate = true;
  // linterna en la mesa
  torch.visible = inn(t, K.alumbra, K.gris) || inn(t, K.golpe + 1.4, K.p6);
  torch.position.set(1.25, .9, -.6); torch.rotation.set(0, .55, 0); beam.position.set(-.55, 0, 0);
  if (flip > .5) { torch.position.set(1.15, 1.3, -.55); torch.rotation.set(0, .5, -.35); }
  // ---- diorama ----
  const th = t < K.conectas ? 0 : t < K.raspa ? clamp(.12 + .33 * eout(P(t, K.conectas, 4.5))) : clamp(.45 * (1 - eout(P(t, K.raspa + .5, 2.5))));
  carpet.scale.x = Math.max(.01, th); carpet.position.set(-1.6 + th / 2, 0, 0); carpet.visible = th > .01;
  carpet.material.emissiveIntensity = inn(t, K.gris, K.p3) ? .25 + .2 * Math.sin(t * 8) : 0;
  // conector: entra, se empuja, se atasca
  let tip = 3.4; // fuera
  if (inn(t, K.metes, K.bolsillo)) tip = lerp(3.4, -1.55, eio(P(t, K.metes + .3, 2.0)));
  else if (inn(t, K.bolsillo, K.conectas)) tip = lerp(-1.55, 3.4, eio(P(t, K.bolsillo, 1.0)));
  else if (inn(t, K.conectas, K.p1)) { const cyc = ((t - K.conectas) % 2.6) / 2.6; const stop = -1.55 + th; tip = t < K.noentra ? lerp(3.0, stop, eio(clamp(cyc * 2))) * (cyc < .5 ? 1 : 1) : lerp(3.4, -1.55 + .45, eio(P(t, K.noentra, 1.2))); if (t < K.noentra && cyc > .6) tip = lerp(stop, 3.0, eio((cyc - .6) / .4)); }
  else if (inn(t, K.p6, K.conecta)) tip = 2.4;
  else if (inn(t, K.conecta, K.sigue)) tip = lerp(3.4, -1.55, eio(P(t, K.conecta + .3, CLIC - K.conecta - .3)));
  PLUG.position.x = tip; PLUG.visible = inn(t, K.explico, K.p1) || inn(t, K.p6, K.sigue);
  const contact = tip < -1.48 + 1e-3 + 0 || (tip < -1.3 && th < .1); const glowK = (contact && (t < K.bolsillo || t >= CLIC - .1)) ? 1 : 0;
  const bad = inn(t, K.notocan, K.p1); goldM.emissiveIntensity = glowK * (1.2 + .4 * Math.sin(t * 10)); plugGold.emissiveIntensity = glowK * (1.2 + .4 * Math.sin(t * 10));
  goldM.emissive.set(bad ? 0xff4d61 : 0x35d39a); plugGold.emissive.set(bad ? 0xff4d61 : 0x35d39a); if (bad) { goldM.emissiveIntensity = plugGold.emissiveIntensity = Math.max(0, Math.sin(t * 14)) * 1.2; }
  // flujo de energía
  for (let i = 0; i < 16; i++) { const u = (t * .7 + i / 16) % 1; const wp = V(lerp(6.5, tip + .5, u), 0, 0); wp.multiplyScalar(.72).add(MC); setP(flow, i, wp.x, wp.y, wp.z + .2, glowK > 0 && PLUG.visible && !bad, 1); } flow.instanceMatrix.needsUpdate = true;
  // pelusa suelta que entra
  for (let i = 0; i < 50; i++) { const L = LP[i]; let u = clamp((t - K.bolsillo - L.d) / 2.4); let x = lerp(L.sx, L.ex, eout(u)), y = lerp(L.sy, L.ey, eout(u)) + Math.sin(t * 2 + i) * .05 * (1 - u), z = lerp(L.sz, L.ez, eout(u));
    let vis = inn(t, K.bolsillo, K.conectas + 1.5); if (t >= K.conectas) { x = lerp(x, -1.55, P(t, K.conectas, 1.2)); vis = vis && P(t, K.conectas, 1.2) < 1; }
    tmp.position.set(x, y, z); tmp.rotation.set(i, i * .7, 0); tmp.scale.setScalar(vis ? L.s : .001); tmp.updateMatrix(); lint.setMatrixAt(i, tmp.matrix); } lint.instanceMatrix.needsUpdate = true;
  // palillo y aguja
  pick.visible = inn(t, K.palillo, K.aguja) || inn(t, K.raspa - .3, K.p5); needle.visible = inn(t, K.aguja, K.p4);
  let px = 3.6; if (inn(t, K.palillo, K.aguja)) px = lerp(5.5, 3.2, eout(P(t, K.palillo, .6)));
  if (inn(t, K.raspa - .3, K.saca)) px = lerp(3.2, -1.5, eio(P(t, K.raspa - .3, 1.4))) + Math.sin((t - K.raspa) * 9) * .12 * P(t, K.raspa + 1, .3);
  if (inn(t, K.saca, K.p5)) px = lerp(-1.5, 3.6, eio(P(t, K.saca, 1.6)));
  pick.position.set(px, -.12, .1); pick.rotation.z = inn(t, K.raspa, K.saca) ? Math.sin(t * 9) * .04 : 0;
  pickLint.visible = t >= K.saca; pickLint.position.set(-.05, 0, 0);
  needle.position.set(lerp(5.5, -.9, eout(P(t, K.aguja, .8))), .2, .1);
  spark.visible = inn(t, K.rayar + .6, K.rayar + 1.4) && Math.sin(t * 40) > 0; spark.position.set(-.9, .22, .1); spark.scale.setScalar(.6 + Math.random() * .8);
  cloth.visible = inn(t, K.limpia, K.conecta); cloth.position.set(3.0 + Math.sin((t - K.limpia) * 7) * .5, 0, .2 + Math.cos((t - K.limpia) * 7) * .2);
  bigBeam.visible = inn(t, K.gris, K.p3) || inn(t, K.golpe + 1.4, K.p6) && false; bigBeam.position.set(1.2, .05, 0); tunL.intensity = inn(t, K.gris, K.p3) ? 4 : 0;
  // batería flotante
  BAT.visible = inn(t, K.lento, K.espera) || inn(t, K.tiempo, K.p1) || inn(t, CLIC - .3, K.sigue);
  if (t < K.espera) { BAT.position.set(1.35, 1.25, -.75); setBat(.12 + .03 * Math.sin(t)); } else if (t < K.p1) { BAT.position.set(X0 + 1.2, 1.1, 1.2); setBat(.08 + .05 * Math.abs(Math.sin(t * 3))); } else { BAT.position.set(X0 + 1.2, 1.1, 1.2); setBat(clamp(.1 + (t - CLIC) * .3)); }
  BAT.scale.setScalar(t < K.espera ? .4 : .7);
  // ---- personajes ----
  let op = [-.35, 0, -.1], ory = .4, p = { emo: 'worried' }, ev = false, ep = [0, 0, 0], ery = 0, e = { emo: 'neutral' };
  const point = (a = -2.3) => ({ armR: [a, -.3, -.2], armL: [-.2, .15, -.3] });
  if (t < K.espera) { p = { emo: t > K.bateria ? 'sad' : 'worried', armR: [-1.0, -.3, -.8], headRy: .4, look: [.6, -.3] }; }
  else if (t < K.mira) { p = { emo: 'surprised', headRy: .9, look: [.8, 0] }; ev = true; ep = [1.75, 0, -.25]; ery = -.8; e = { emo: t > K.noes ? 'happy' : 'determined', armR: [-2.6, -.4, -.2], armL: [-.4, .2, -.3] }; }
  else if (t < K.explico) { op = [-.6, 0, .4]; ev = false; }
  else if (t < K.p1) { op = [X0 - 1.55, 0, .9]; ory = .45; p = { emo: t > K.notocan ? 'surprised' : t > K.bolsillo ? 'worried' : 'neutral', ...point(-1.7), headRy: .3 }; }
  else if (t < K.gris) { op = [-.25, 0, -.15]; ory = .5; p = { emo: 'determined', armR: [-1.3, -.2, -.6], armL: [-.2, .15, -.3], headRy: .3, look: [.6, -.4] }; }
  else if (t < K.p5) { op = [X0 - 1.55, 0, .9]; ory = .45; p = { emo: inn(t, K.aguja, K.p4) ? 'worried' : t > K.saca ? 'happy' : 'determined', ...point(-1.5), headRy: .3 }; ev = inn(t, K.aguja, K.p4); ep = [X0 + 1.3, 0, 1.6]; ery = -.5; e = { emo: 'determined', armR: [-2.0, -.4, -.3], headRx: -.1 }; }
  else if (t < K.p6) { op = [-.1, 0, -.1]; ory = .55; p = { emo: 'determined', armR: [-1.5, -.2, -.5], armL: [-1.4, .2, -.5], look: [.5, 0] }; }
  else if (t < K.sigue) { op = [X0 - 1.55, 0, .9]; ory = .45; p = { emo: t > CLIC ? 'happy' : 'neutral', ...(t > CLIC ? { armR: [-2.6, -.35, -.2 + .3 * Math.sin(t * 8)], armL: [-2.6, .35, -.2] } : point(-1.6)) }; }
  else if (t < K.cuanta) { op = [-.35, 0, -.1]; ory = .4; p = { emo: 'neutral', armR: [-1.1, -.3, -.7], look: [.5, -.2] }; ev = t > K.tampoco; ep = [1.9, 0, .1]; ery = -.7; e = { emo: 'determined', armL: [-1.0, .3, -.6], armR: [-2.0, -.3, -.2] }; }
  else { op = [-.5, 0, .2]; ory = .3; p = { emo: 'happy', armR: [-2.6, -.35, -.2 + .3 * Math.sin(t * 8)], armL: [-.2, .15, -.3] }; ev = true; ep = [1.6, 0, .3]; ery = -.4; e = { emo: 'happy', armL: [-.9, .3, -.6] }; }
  owner.root.position.set(...op); owner.root.rotation.y = ory; pose(owner, p, t);
  eng.root.visible = ev; eng.root.position.set(...ep); eng.root.rotation.y = ery; pose(eng, e, t + 1.3); wrench.visible = false; engCB.visible = true;
  // etiquetas
  OVL.length = 0; const Lb = (text, at, end, pos, color = '#ffcc33') => { if (t >= at && t < end) OVL.push({ text, at, end, pos, color }); };
  const TOPH = V(.6, 2.3, -.7), TOPM = V(X0, 4.3, 0);
  Lb('CARGA LENTO', .1, K.bateria, TOPH, '#ff6a4a'); Lb('¿OTRA BATERÍA?', K.bateria, K.espera, TOPH); Lb('¡ESPERA!', K.espera, K.noes, TOPH, '#ff6a4a'); Lb('✖ NO ES LA BATERÍA', K.noes, K.mira, TOPH, '#ff6a4a'); Lb('MIRA DENTRO DEL PUERTO', K.mira, K.explico, V(.6, 1.3, -.7));
  Lb('EL PUERTO POR DENTRO', K.explico, K.metes, TOPM); Lb('CONTACTOS', K.metes, K.bolsillo, TOPM, '#7be36b'); Lb('BOLSILLO = PELUSA', K.bolsillo, K.conectas, TOPM, '#ff8a4a'); Lb('SE EMPUJA AL FONDO', K.conectas, K.empuja, TOPM, '#ff8a4a'); Lb('UNA ALFOMBRITA', K.empuja + .8, K.tiempo, V(X0 - 1.3, 3.7, 0), '#ff6a4a');
  Lb('NO ENTRA COMPLETO', K.noentra, K.notocan, TOPM, '#ff6a4a'); Lb('✖ NO SE TOCAN', K.notocan, K.desconecta, TOPM, '#ff6a4a'); Lb('CARGA LENTO', K.desconecta, K.p1, TOPM, '#ff6a4a');
  Lb('PASO 1: APÁGALO', K.p1, K.p2, TOPH); Lb('PASO 2: LINTERNA', K.p2, K.gris, TOPH); Lb('¿GRIS O NEGRO?', K.gris, K.problema, V(X0 - 1.3, 3.7, 0), '#ff8a4a'); Lb('¡AHÍ ESTÁ!', K.problema, K.p3, V(X0 - 1.3, 3.7, 0), '#ff6a4a');
  Lb('PASO 3: PALILLO DE MADERA', K.p3, K.aguja, TOPM, '#7be36b'); Lb('✖ AGUJA O CLIP', K.aguja, K.rayar, TOPM, '#ff6a4a'); Lb('RAYA O HACE CORTO', K.rayar, K.p4, TOPM, '#ff6a4a');
  Lb('PASO 4: RASPA SUAVE', K.p4, K.saca, TOPM); Lb('SACA LA PELUSA', K.saca, K.fuerza, TOPM, '#7be36b'); Lb('SIN FUERZA', K.fuerza, K.p5, TOPM, '#ff8a4a');
  Lb('PASO 5: VOLTÉALO', K.p5, K.golpe, TOPH); Lb('GOLPECITOS SUAVES', K.golpe, K.p6, TOPH);
  Lb('PASO 6: LIMPIA EL CABLE', K.p6, K.conecta, V(X0 + 2.0, 4.0, 0)); Lb('AHORA CONECTA', K.conecta, CLIC - .1, TOPM); Lb('¡CLIC!', CLIC - .1, K.listo + .2, TOPM, '#7be36b'); Lb('¡LISTO!', K.listo + .2, K.sigue, TOPM, '#7be36b');
  Lb('OTRO CABLE Y CARGADOR', K.sigue, K.tampoco, TOPH); Lb('LLÉVALO A UN TÉCNICO', K.tampoco, K.cuanta, TOPH);
  Lb('¿CUÁNTA PELUSA TENÍA?', K.cuanta + .1, CTA_ST, V(0, 3.0, -.5), '#ff8a4a');
}
function overlay2d(t) {}
const KEYW = new Set(['celular', 'lento', 'batería', 'puerto', 'contactos', 'pelusa', 'bolsillo', 'cartera', 'fondo', 'alfombrita', 'completo', 'apaga', 'linterna', 'gris', 'negro', 'problema', 'palillo', 'madera', 'aguja', 'clip', 'metal', 'corto', 'raspa', 'suavecito', 'fuerza', 'voltea', 'golpecitos', 'cable', 'paño', 'seco', 'conecta', 'clic', 'listo', 'cargador', 'técnico', 'comentarios']);

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
