// Reel 9:16 3D (Estilo B: construcción en corte) — Celular lleno
import * as THREE from 'three';
import { EffectComposer } from 'three/addons/postprocessing/EffectComposer.js';
import { RenderPass } from 'three/addons/postprocessing/RenderPass.js';
import { UnrealBloomPass } from 'three/addons/postprocessing/UnrealBloomPass.js';
import { OutputPass } from 'three/addons/postprocessing/OutputPass.js';

const W = 1080, H = 1920, END = 111.7;   // END = última palabra + 3,7 s (cierre)
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
// ================= CELULAR LLENO: NO SON TUS FOTOS, ES WHATSAPP =================
const K = { lleno: PS(0), borrando: PS(1), espera: PS(2), noson: PS(3), wa: PS(4), explico: PS(5), config: PS(6), wifi: PS(7), datos: PS(8), chats: PS(9), grupos: PS(10), buenos: PS(11), reenv: PS(12), guarda: PS(13), gigas: PS(14),
  p1: PS(15), abre: PS(16), ajustes: PS(17), p2: PS(18), busca: PS(19), desact: PS(20), conDatos: PS(21), iphone: PS(22), hoy: PS(23), p3: T('tres'), mismo: PS(24), admin: PS(25), arriba: PS(26), abajo: PS(27),
  p4: PS(28), borra: PS(29), entra: PS(30), p5: PS(31), ojo: PS(32), noborra: PS(33), solo: PS(34), guarda2: PS(35), p6: PS(36), papelera: PS(37), queda: PS(38), cinco: PS(39), cuanto: PS(40), leo: PS(41) };
(function () { const x = WT.x; x.fillStyle = '#f3e6cf'; x.fillRect(0, 0, 1024, 406); x.fillStyle = '#9fd6f2'; x.fillRect(pxx(-.4), py(2.1), 150, 110); x.strokeStyle = '#fff'; x.lineWidth = 10; x.strokeRect(pxx(-.4), py(2.1), 150, 110); WT.tx.needsUpdate = true; })();
// ---- casa: sofá y papelera ----
{ const so = add(new THREE.Group()); so.position.set(-.6, .15, -1.1); const b = M(new THREE.BoxGeometry(1.8, .45, .8), lp(0x4a6fa5)); b.position.y = .22; const bk = M(new THREE.BoxGeometry(1.8, .6, .2), lp(0x4a6fa5)); bk.position.set(0, .6, -.3); so.add(b, bk); }
const bin = add(new THREE.Group()); bin.position.set(1.0, .15, -.4); { const c = M(new THREE.CylinderGeometry(.22, .17, .5, 16, 1, true), lp(0x8a8f99)); c.position.y = .25; const bt = M(new THREE.CylinderGeometry(.17, .17, .02, 16), lp(0x8a8f99)); bin.add(c, bt); }
function iconTex(kind, col) { const c = canvasTex(128, 128), x = c.x; x.fillStyle = col; rrp(x, 0, 4, 4, 120, 120, 22); x.fill(); x.fillStyle = '#fff'; x.strokeStyle = '#fff'; x.lineWidth = 8;
  if (kind === 'foto') { x.beginPath(); x.moveTo(20, 100); x.lineTo(55, 55); x.lineTo(80, 85); x.lineTo(95, 70); x.lineTo(110, 100); x.closePath(); x.fill(); x.beginPath(); x.arc(90, 38, 12, 0, 6.29); x.fill(); }
  if (kind === 'video') { x.beginPath(); x.moveTo(45, 32); x.lineTo(95, 64); x.lineTo(45, 96); x.closePath(); x.fill(); }
  if (kind === 'audio') { for (let i = 0; i < 6; i++) { const h = [20, 50, 70, 40, 60, 25][i]; x.fillRect(22 + i * 15, 64 - h / 2, 9, h); } }
  if (kind === 'fam') { x.beginPath(); x.arc(45, 50, 16, 0, 6.29); x.arc(85, 50, 16, 0, 6.29); x.fill(); x.fillRect(25, 72, 40, 34); x.fillRect(65, 72, 40, 34); }
  c.tx.needsUpdate = true; return new THREE.MeshBasicMaterial({ map: c.tx, transparent: true, side: THREE.DoubleSide }); }
const ICM = [iconTex('foto', '#3d8bff'), iconTex('video', '#ff4d61'), iconTex('audio', '#a98bff'), iconTex('fam', '#35d39a')];
const media = []; for (let i = 0; i < 24; i++) { const m = new THREE.Mesh(new THREE.PlaneGeometry(.42, .42), ICM[i % 3]); scene.add(m); media.push(m); }
const famPh = []; for (let i = 0; i < 5; i++) { const m = new THREE.Mesh(new THREE.PlaneGeometry(.22, .22), ICM[3]); scene.add(m); famPh.push(m); }
// ---- celular gigante ----
const X0 = 30; add(M(new THREE.CylinderGeometry(4.2, 4.4, .4, 40), lp(0xd6dbe4))).position.set(X0, -.2, 0);
const SC = canvasTex(512, 1024);
const BIG = add(new THREE.Group()); BIG.position.set(X0, 2.75, -.3);
{ const b = rbox(1.75, 3.45, .16, .12, mat(0x1b1e27, { roughness: .35 })); BIG.add(b); const s = M(new THREE.PlaneGeometry(1.6, 3.2), new THREE.MeshBasicMaterial({ map: SC.tx, color: 0xd8d8d8, toneMapped: false }), false); s.position.z = .135; BIG.add(s); }
const bigL = new THREE.PointLight(0xfff4e0, 0, 14, 1.2); bigL.position.set(X0 + .5, 3.5, 4); scene.add(bigL);
const smallPh = add(rbox(.1, .18, .02, .01, lp(0x1b1e27)));
// ---- pantalla ----
const GB = (t) => { // GB usados (ejemplo)
  if (t < K.config) return 63.4; if (t < K.p1) return 63.4 + .0; if (t < K.borra + 1) return 63.4; return Math.max(55.2, 63.4 - (t - K.borra - 1) * 1.6); };
let tapAt = null;
function hdr(x, title, col = '#1aa86a') { x.fillStyle = col; x.fillRect(0, 0, 512, 120); x.fillStyle = '#fff'; let fs = 38; x.font = `800 ${fs}px M`; const w = x.measureText(title).width; if (w > 432) { fs = Math.floor(fs * 432 / w); x.font = `800 ${fs}px M`; } x.textAlign = 'left'; x.textBaseline = 'middle'; x.fillText(title, 40, 72); }
function row(x, y, text, sub, hl, right) { if (hl) { x.fillStyle = 'rgba(255,204,51,.45)'; x.fillRect(0, y - 46, 512, 92); } x.fillStyle = '#2a2c33'; x.font = '800 30px M'; x.textAlign = 'left'; x.textBaseline = 'middle'; x.fillText(text, 40, sub ? y - 12 : y); if (sub) { x.font = '600 22px M'; x.fillStyle = '#7a8090'; x.fillText(sub, 40, y + 22); } if (right) { x.textAlign = 'right'; x.font = '800 26px M'; x.fillStyle = right.c || '#5a6070'; x.fillText(right.t, 476, y); } x.fillStyle = '#e4e7ee'; x.fillRect(40, y + 45, 432, 2); }
function toggle(x, y, on) { x.fillStyle = on ? '#1aa86a' : '#c7ccd6'; rrp(x, 0, 392, y - 22, 84, 44, 22); x.fill(); x.fillStyle = '#fff'; x.beginPath(); x.arc(on ? 454 : 414, y, 18, 0, 6.29); x.fill(); }
function storageBar(x, y, gb, total = 64) { const f = gb / total; x.fillStyle = '#e4e7ee'; rrp(x, 0, 40, y, 432, 34, 17); x.fill(); x.fillStyle = f > .95 ? '#ff4d61' : f > .85 ? '#f6b445' : '#35d39a'; rrp(x, 0, 40, y, Math.max(34, 432 * f), 34, 17); x.fill(); x.fillStyle = '#2a2c33'; x.font = '800 26px M'; x.textAlign = 'center'; x.fillText(gb.toFixed(1) + ' GB de ' + total + ' GB', 256, y + 70); }
function drawScreen(t) {
  const x = SC.x; x.fillStyle = '#f7f8fb'; x.fillRect(0, 0, 512, 1024); tapAt = null;
  if (t < K.config) { // galería / aviso lleno
    x.fillStyle = '#0d1730'; x.fillRect(0, 0, 512, 1024); for (let i = 0; i < 12; i++) { const gone = t > K.borrando + .6 + i * .25 && i < 5; if (gone) continue; x.fillStyle = ['#3d8bff', '#35d39a', '#ff8a3d', '#a98bff'][i % 4]; rrp(x, 0, 30 + (i % 3) * 156, 150 + Math.floor(i / 3) * 156, 140, 140, 14); x.fill(); }
    if (t > .3) { x.fillStyle = '#fff'; rrp(x, 0, 40, 380, 432, 260, 28); x.fill(); x.fillStyle = '#e8383a'; x.font = '900 40px M'; x.textAlign = 'center'; x.textBaseline = 'middle'; x.fillText('ALMACENAMIENTO', 256, 450); x.fillText('LLENO', 256, 500); storageBar(x, 540, 63.4); }
  } else if (t < K.p1) { // chats y grupos que mandan cosas
    hdr(x, 'WhatsApp'); const items = [['Grupo Familia', 'Video: Buenos días', '12'], ['Grupo Trabajo', 'Meme reenviado', '34'], ['Grupo Vecinos', 'Video reenviado muchas veces', '58'], ['Mamá', 'Foto', '3'], ['Grupo Iglesia', 'Audio', '21'], ['Grupo Colegio', 'Video', '17']];
    items.forEach(([a, b, n], i) => { const y = 200 + i * 110; x.fillStyle = ['#35d39a', '#3d8bff', '#ff8a3d', '#a98bff', '#f6b445', '#ff4d61'][i]; x.beginPath(); x.arc(76, y, 36, 0, 6.29); x.fill(); x.fillStyle = '#2a2c33'; x.font = '800 28px M'; x.textAlign = 'left'; x.textBaseline = 'middle'; x.fillText(a, 130, y - 14); x.font = '600 22px M'; x.fillStyle = '#7a8090'; x.fillText(b, 130, y + 20); x.fillStyle = '#1aa86a'; x.beginPath(); x.arc(450, y, 22, 0, 6.29); x.fill(); x.fillStyle = '#fff'; x.font = '800 20px M'; x.textAlign = 'center'; x.fillText(n, 450, y + 1); });
    const gb = 40 + 23.4 * clamp((t - K.config) / (K.gigas + 2 - K.config)); x.fillStyle = '#fff'; x.fillRect(0, 870, 512, 154); storageBar(x, 890, gb);
  } else if (t < K.p2) { // ajustes
    hdr(x, 'Ajustes'); ['Cuenta', 'Privacidad', 'Chats', 'Notificaciones', 'Almacenamiento y datos', 'Ayuda'].forEach((s, i) => row(x, 200 + i * 104, s, null, i === 4 && t > K.ajustes + 1.2, { t: '›' })); if (inn(t, K.ajustes + 2.2, K.ajustes + 3)) tapAt = [256, 616];
  } else if (t < K.p3) { // descarga automática
    hdr(x, 'Almacenamiento y datos'); x.fillStyle = '#1aa86a'; x.font = '800 26px M'; x.textAlign = 'left'; x.fillText('DESCARGA AUTOMÁTICA', 40, 170);
    const iph = inn(t, K.iphone, K.hoy);
    ['Fotos', 'Audios', 'Videos', 'Documentos'].forEach((s, i) => { const y = 250 + i * 104; row(x, y, s, iph ? null : 'Datos móviles y WiFi', inn(t, K.desact + i * .9, K.desact + i * .9 + .9)); if (iph) { x.textAlign = 'right'; x.font = '800 26px M'; x.fillStyle = '#e8383a'; x.fillText('Nunca', 476, y); } else toggle(x, y, t < K.desact + .4 + i * .9); });
    if (t > K.hoy) { x.fillStyle = '#1aa86a'; rrp(x, 0, 40, 720, 432, 120, 24); x.fill(); x.fillStyle = '#fff'; x.font = '900 30px M'; x.textAlign = 'center'; x.fillText('Solo se baja', 256, 765); x.fillText('lo que tú toques', 256, 805); }
  } else if (t < K.p5) { // administrar almacenamiento
    hdr(x, 'Administrar almacenamiento'); const gb = t < K.borra + 1 ? 8.2 : Math.max(2.4, 8.2 - (t - K.borra - 1) * 1.1); x.fillStyle = '#2a2c33'; x.font = '900 34px M'; x.textAlign = 'left'; x.fillText('WhatsApp usa ' + gb.toFixed(1) + ' GB', 40, 180);
    const sel = t > K.entra + 1.2; const del = t > K.entra + 3.0;
    row(x, 280, 'Más de 5 MB', 'Archivos grandes', inn(t, K.borra, K.borra + 1.6), { t: del ? '0 B' : '2.3 GB', c: '#e8383a' }); row(x, 384, 'Reenviados', 'Muchas veces',  inn(t, K.borra + 1.6, K.entra), { t: del ? '0 B' : '1.1 GB', c: '#e8383a' });
    x.fillStyle = '#7a8090'; x.font = '800 22px M'; x.textAlign = 'left'; x.fillText('CHATS', 40, 470);
    [['Grupo Vecinos', '2.1 GB'], ['Grupo Familia', '1.4 GB'], ['Grupo Trabajo', '0.9 GB'], ['Grupo Colegio', '0.4 GB']].forEach(([a, b], i) => { const y = 540 + i * 104; row(x, y, a, null, inn(t, K.abajo, K.p4) && i === 0, { t: del && i === 0 ? '0.2 GB' : b }); if (sel && i === 0 && t < K.p5) { for (let k = 0; k < 3; k++) { x.fillStyle = '#1aa86a'; x.beginPath(); x.arc(330 - k * 40, y, 14, 0, 6.29); x.fill(); } } });
    if (inn(t, K.entra + 2.6, K.entra + 3.2)) tapAt = [256, 540];
  } else if (t < K.p6) { // chat: mensajes quedan
    hdr(x, 'Grupo Familia'); const b = (y, txt, me) => { x.fillStyle = me ? '#d9fdd3' : '#fff'; rrp(x, 0, me ? 160 : 30, y, 320, 70, 16); x.fill(); x.fillStyle = '#2a2c33'; x.font = '700 24px M'; x.textAlign = 'left'; x.fillText(txt, (me ? 160 : 30) + 20, y + 38); };
    x.fillStyle = '#efe7de'; x.fillRect(0, 120, 512, 904); b(170, '¡Buenos días!', 0); b(260, 'Ya llegué 🙂'.replace('🙂', ''), 1); b(350, '¿A qué hora es?', 0);
    x.fillStyle = '#c7ccd6'; rrp(x, 0, 30, 440, 320, 160, 16); x.fill(); x.fillStyle = '#7a8090'; x.font = '800 22px M'; x.fillText('Archivo eliminado', 60, 525); b(620, 'A las 5', 1);
    if (t > K.guarda2) { x.fillStyle = '#1aa86a'; rrp(x, 0, 40, 760, 432, 100, 24); x.fill(); x.fillStyle = '#fff'; x.font = '900 28px M'; x.textAlign = 'center'; x.fillText('Lo importante: guárdalo antes', 256, 812); }
  } else if (t < K.cinco) { // papelera de la galería
    hdr(x, 'Galería · Papelera', '#3d8bff'); const vac = t > K.queda + 3.2; for (let i = 0; i < 9; i++) { if (vac) break; x.fillStyle = ['#3d8bff', '#35d39a', '#ff8a3d'][i % 3]; rrp(x, 0, 30 + (i % 3) * 156, 160 + Math.floor(i / 3) * 156, 140, 140, 14); x.fill(); }
    x.fillStyle = vac ? '#1aa86a' : '#e8383a'; rrp(x, 0, 40, 680, 432, 90, 45); x.fill(); x.fillStyle = '#fff'; x.font = '900 32px M'; x.textAlign = 'center'; x.fillText(vac ? '✔ Papelera vacía' : 'Vaciar papelera', 256, 728); if (inn(t, K.queda + 2.6, K.queda + 3.2)) tapAt = [256, 725];
  } else { // resultado
    x.fillStyle = '#0d1730'; x.fillRect(0, 0, 512, 1024); x.fillStyle = '#fff'; rrp(x, 0, 40, 300, 432, 360, 28); x.fill(); x.fillStyle = '#1aa86a'; x.font = '900 52px M'; x.textAlign = 'center'; x.fillText('+ 8.2 GB', 256, 400); x.font = '800 30px M'; x.fillStyle = '#2a2c33'; x.fillText('libres (ejemplo)', 256, 450); storageBar(x, 500, 55.2); }
  if (tapAt) { x.strokeStyle = 'rgba(255,204,51,.9)'; x.lineWidth = 8; x.beginPath(); x.arc(tapAt[0], tapAt[1], 30 + ((t * 3) % 1) * 30, 0, 6.29); x.stroke(); }
  SC.tx.needsUpdate = true;
}
// ---- cámara ----
const MC = V(X0, 2.75, -.3);
SHOTS = [
  [0, K.espera, [1.0, 2.0, 4.2], [.6, 1.8, 3.6], [-.4, .9, -.8], [-.3, .9, -.8]],
  [K.espera, K.explico, [1.6, 2.4, 6.0], [1.2, 2.3, 5.6], [0, 1.0, -.6], [0, 1.0, -.6]],
  [K.explico, K.gigas, [X0 + 1.2, 2.6, 9.4], [X0 + .6, 2.3, 8.4], [X0, 1.9, 0], [X0, 1.85, 0]],
  [K.gigas, K.p1, [X0, 2.7, 5.8], [X0, 2.7, 5.4], [X0, 2.4, -.3], [X0, 2.4, -.3]],
  [K.p1, K.p3, [X0, 2.7, 5.6], [X0, 2.65, 5.2], [X0, 2.4, -.3], [X0, 2.4, -.3]],
  [K.p3, K.p5, [X0, 2.7, 5.6], [X0, 2.65, 5.2], [X0, 2.4, -.3], [X0, 2.4, -.3]],
  [K.p5, K.p6, [X0 - .8, 2.6, 7.6], [X0 - .3, 2.6, 6.6], [X0, 2.3, -.3], [X0, 2.3, -.3]],
  [K.p6, K.cinco, [X0, 2.7, 5.6], [X0, 2.65, 5.2], [X0, 2.4, -.3], [X0, 2.4, -.3]],
  [K.cinco, 200, [X0 + 1.6, 3.0, 10.4], [X0 + 1.0, 2.6, 9.4], [X0, 1.8, -.3], [X0, 1.9, -.3]],
];
function animWorld(t) {
  skyDay(t); drawScreen(t); bigL.intensity = t >= K.explico ? 3.2 : 0;
  // fotos de la familia que se van a la papelera
  famPh.forEach((m, i) => { const u = clamp((t - K.borrando - .6 - i * .25) / .9); m.visible = u > 0 && u < 1; const a = V(-.25, 1.45, -.35), b = V(1.0, .55, -.4); const p = a.clone().lerp(b, eio(u)); p.y += Math.sin(u * Math.PI) * .5; m.position.copy(p); m.rotation.z = u * 4; m.lookAt(cam.position); });
  // multimedia que cae en el celular gigante
  media.forEach((m, i) => { const st = K.config + .3 + i * ((K.gigas + 1.5 - K.config) / 24); const u = clamp((t - st) / 1.3); m.visible = u > 0 && u < 1 && t < K.p1; const sx = X0 + ((i * 37) % 7 - 3) * .7, sy = 6.5; const p = V(lerp(sx, X0 + ((i % 5) - 2) * .25, eio(u)), lerp(sy, 2.6, eio(u)), lerp(.5, -.15, u)); m.position.copy(p); m.scale.setScalar(1 - u * .6); m.lookAt(cam.position); });
  // ---- personajes ----
  let op = [-.4, .15, -.85], ory = .3, p = { emo: 'sad' }, ev = false, ep = [0, 0, 0], ery = 0, e = { emo: 'neutral' };
  const holdPh = { armR: [-1.3, -.2, -.5], armL: [-.4, .15, -.3], look: [0, -.6], headRx: .3 }, point = (a = -2.3) => ({ armR: [a, -.3, -.2], armL: [-.2, .15, -.3] });
  if (t < K.espera) { p = { emo: t > K.borrando ? 'sad' : 'worried', ...holdPh }; }
  else if (t < K.explico) { p = { emo: 'surprised', ...holdPh }; ev = true; ep = [1.0, .15, .2]; ery = -.5; e = { emo: t > K.wa ? 'determined' : 'neutral', ...point(-2.2) }; }
  else if (t < K.cinco) { op = [X0 - 1.6, 0, 1.3]; ory = .5; p = { emo: inn(t, K.buenos, K.p1) ? 'surprised' : t > K.p4 ? 'happy' : 'determined', ...point(-1.9), headRy: .2 }; ev = inn(t, K.explico, K.p1) || inn(t, K.ojo, K.p6); ep = [X0 + 1.6, 0, 1.3]; ery = -.5; e = { emo: 'determined', ...point(-2.0), headRy: -.2 }; }
  else { op = [X0 - 1.5, 0, 1.4]; ory = .4; p = { emo: 'happy', armR: [-2.6, -.35, -.2 + .3 * Math.sin(t * 8)], armL: [-.2, .15, -.3] }; ev = true; ep = [X0 + 1.5, 0, 1.4]; ery = -.4; e = { emo: 'happy', armL: [-.9, .3, -.6] }; }
  owner.root.position.set(...op); owner.root.rotation.y = ory; pose(owner, p, t);
  eng.root.visible = ev; eng.root.position.set(...ep); eng.root.rotation.y = ery; pose(eng, e, t + 1.3); wrench.visible = false; engCB.visible = true;
  smallPh.visible = t < K.explico; owner.root.updateMatrixWorld(true); smallPh.position.copy(owner.hand[1].getWorldPosition(new THREE.Vector3())).add(V(0, .08, .02)); smallPh.rotation.y = ory;
  // etiquetas (abajo, para no tapar la pantalla gigante)
  OVL.length = 0; const Lb = (text, at, end, pos, color = '#ffcc33') => { if (t >= at && t < end) OVL.push({ text, at, end, pos, color }); };
  const HT = V(0, 2.9, -.6), LO = V(X0, -.6, .6);
  Lb('ALMACENAMIENTO LLENO', .1, K.borrando, HT, '#ff6a4a'); Lb('✖ NO BORRES TUS FOTOS', K.borrando, K.espera, HT, '#ff6a4a'); Lb('¡ESPERA!', K.espera, K.wa, HT, '#ff6a4a'); Lb('ES WHATSAPP', K.wa, K.explico, HT, '#7be36b');
  Lb('DESCARGA SOLO', K.config, K.chats, LO, '#ff8a4a'); Lb('DE TODOS LOS GRUPOS', K.grupos, K.buenos, LO, '#ff8a4a'); Lb('BUENOS DÍAS · MEMES', K.buenos, K.reenv, LO); Lb('REENVIADOS MIL VECES', K.reenv, K.guarda, LO); Lb('SIN QUE LO PIDAS', K.guarda, K.gigas, LO, '#ff6a4a'); Lb('GIGAS Y GIGAS', K.gigas, K.p1, LO, '#ff6a4a');
  Lb('PASO 1: AJUSTES', K.p1, K.p2, LO); Lb('PASO 2: DESCARGA AUTOMÁTICA', K.p2, K.iphone, LO); Lb('IPHONE: NUNCA', K.iphone, K.hoy, LO, '#6cc4ff'); Lb('PASO 3: ADMINISTRAR', K.p3, K.p4, LO); Lb('PASO 4: BORRA LO GRANDE', K.p4, K.p5, LO, '#7be36b');
  Lb('PASO 5: TUS CHATS SE QUEDAN', K.p5, K.p6, LO, '#7be36b'); Lb('PASO 6: VACÍA LA PAPELERA', K.p6, K.cinco, LO); Lb('GIGAS LIBRES, FOTOS INTACTAS', K.cinco, K.cuanto, LO, '#7be36b'); Lb('¿CUÁNTO OCUPABA EL TUYO?', K.cuanto + .1, CTA_ST, LO, '#ff8a4a');
}
function overlay2d(t) {}
const KEYW = new Set(['lleno', 'fotos', 'whatsapp', 'descargar', 'wifi', 'datos', 'grupos', 'memes', 'reenviado', 'gigas', 'ajustes', 'almacenamiento', 'automática', 'desactiva', 'nunca', 'administrar', 'grandes', 'borra', 'bórralos', 'conversaciones', 'guárdalo', 'papelera', 'galería', 'vacías', 'comentarios']);

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
