// Reel 9:16 3D (Estilo B: construcción en corte) — Tu casa es un horno
import * as THREE from 'three';
import { EffectComposer } from 'three/addons/postprocessing/EffectComposer.js';
import { RenderPass } from 'three/addons/postprocessing/RenderPass.js';
import { UnrealBloomPass } from 'three/addons/postprocessing/UnrealBloomPass.js';
import { OutputPass } from 'three/addons/postprocessing/OutputPass.js';

const W = 1080, H = 1920, END = 106.9;   // END = última palabra + 3,7 s (cierre)
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
// ---------- mundo: casa de un piso en corte (calor) ----------
const GZ = 3.6;
add(M(new THREE.BoxGeometry(50.1, .25, 24.1), lp(0x5fae4a))).position.set(0, -.1, GZ - 12);
{ const b = add(M(new THREE.BoxGeometry(50, 3.4, 24), lp(0x8a5a34))); b.position.set(0, -1.92, GZ - 12); const r = add(M(new THREE.BoxGeometry(50, 3, 24), lp(0x6c717c))); r.position.set(0, -5.1, GZ - 12); }
for (let i = 0; i < 30; i++) { const r = add(M(new THREE.DodecahedronGeometry(.08 + rnd() * .15, 0), lp(0x6a5a4a))); r.position.set((rnd() - .5) * 24, -.5 - rnd() * 3, GZ + .02); }
for (let i = -12; i <= 12; i++) { const p = add(M(new THREE.BoxGeometry(.16, 1, .16), lp(0xdcdcd6))); p.position.set(i * 1.6, .5, -7); }
function bgHouse(x, z, c) { const h = new THREE.Group(); const b = M(new THREE.BoxGeometry(4, 2.6, 3.4), lp(c)); b.position.y = 1.3; h.add(b); const rf = M(new THREE.ConeGeometry(3.2, 1.6, 4), lp(0xb8553a)); rf.rotation.y = Math.PI / 4; rf.scale.set(1, 1, .8); rf.position.y = 3.4; h.add(rf); for (const wx of [-1, 1]) { const w = M(new THREE.BoxGeometry(.7, .7, .05), lp(0x9fd3e6)); w.position.set(wx, 1.6, 1.72); h.add(w); } h.position.set(x, 0, z); scene.add(h); }
bgHouse(-10, -11, 0xe9d7b5); bgHouse(9, -12, 0xf3e2c4); bgHouse(14, -7, 0xe0cdb0); bgHouse(-15, -6, 0xf0dcc0);
for (let i = 0; i < 7; i++) { const tr = new THREE.Group(); const tk = M(new THREE.CylinderGeometry(.12, .16, 1.2, 6), lp(0x7a5230)); tk.position.y = .6; const cr = M(new THREE.IcosahedronGeometry(.9, 0), lp(0x4f9a3e)); cr.position.y = 1.7; tr.add(tk, cr); tr.position.set([-7, -5.5, 6, 7.5, -12, 12, 4][i], 0, [-4, -9, -4.5, -9, -3, -3, -10][i]); scene.add(tr); }
// casa
const W1 = lp(0xf2e3c8), W2 = lp(0xfff4e0);
add(M(new THREE.BoxGeometry(6.6, .15, 3.8), lp(0xc8a27a))).position.set(0, .07, 0);
add(M(new THREE.BoxGeometry(6.6, 2.7, .16), W2)).position.set(0, 1.35, -1.9);
function sideWall(x) { // pared lateral con hueco de ventana (z -1.0..0.2, y 1.0..2.0)
  add(M(new THREE.BoxGeometry(.16, 2.7, .9), W1)).position.set(x, 1.35, -1.45);
  add(M(new THREE.BoxGeometry(.16, 2.7, 1.7), W1)).position.set(x, 1.35, 1.05);
  add(M(new THREE.BoxGeometry(.16, 1.0, 1.2), W1)).position.set(x, .5, -.4);
  add(M(new THREE.BoxGeometry(.16, .7, 1.2), W1)).position.set(x, 2.35, -.4);
  const fr = lp(0x8a6a48); for (const [yy, hh, zz, dd] of [[1.0, .05, -.4, 1.24], [2.0, .05, -.4, 1.24], [1.5, 1.0, -1.0, .05], [1.5, 1.0, .2, .05]]) add(M(new THREE.BoxGeometry(.2, hh, dd), fr)).position.set(x, yy, zz);
}
sideWall(-3.3); sideWall(3.3);
const glassM = new THREE.MeshStandardMaterial({ color: 0xbfe6ff, transparent: true, opacity: .35, roughness: .1, depthWrite: false });
function sash(x, s) { const p = new THREE.Group(); p.position.set(x, 1.5, -1.0); const g1 = M(new THREE.BoxGeometry(.03, .96, 1.18), glassM, false); g1.position.z = .59; p.add(g1); scene.add(p); p.userData.s = s; return p; }
const sashL = sash(-3.3, -1), sashR = sash(3.3, 1);
// losa de concreto + capa de pintura (3 franjas) + aislante
const slabM = new THREE.MeshStandardMaterial({ color: 0x5b5f69, roughness: .9, flatShading: true, emissive: 0xff4a12, emissiveIntensity: 0 });
const slab = add(M(new THREE.BoxGeometry(6.9, .3, 4.1), slabM)); slab.position.set(0, 2.85, 0);
const paintM = lp(0xf7f7f2); const paint = []; for (let r = 0; r < 3; r++) { const p = add(M(new THREE.BoxGeometry(6.9, .04, 1.367), paintM, false)); p.position.set(0, 3.02, 1.367 - r * 1.367); paint.push(p); }
const roller = new THREE.Group(); { const c = M(new THREE.CylinderGeometry(.11, .11, 1.36, 14), lp(0xffffff)); c.rotation.x = Math.PI / 2; roller.add(c); const h = M(new THREE.CylinderGeometry(.025, .025, 1.4, 6), lp(0xd9a23a)); h.position.set(-.45, .55, 0); h.rotation.z = .7; roller.add(h); const a = M(new THREE.BoxGeometry(.04, .04, .7), lp(0x9aa2b0)); a.position.set(0, .05, 0); roller.add(a); } scene.add(roller);
const insM = lp(0xf09bb0); const ins = []; for (let i = 0; i < 8; i++) { const p = add(M(new THREE.BoxGeometry(1.7, .16, 2.02), insM)); p.userData.x = -2.59 + (i % 4) * 1.725; p.userData.z = i < 4 ? -1.02 : 1.02; ins.push(p); }
// termómetro en el techo
const thermo = new THREE.Group(); scene.add(thermo); thermo.position.set(2.5, 3.0, 1.2);
{ const b = M(new THREE.SphereGeometry(.13, 14, 10), new THREE.MeshBasicMaterial({ color: 0xff3b3b }), false); b.position.y = .14; thermo.add(b); const tube = M(new THREE.CylinderGeometry(.07, .07, 1.2, 12), new THREE.MeshStandardMaterial({ color: 0xffffff, transparent: true, opacity: .45, depthWrite: false }), false); tube.position.y = .8; thermo.add(tube); }
const thCol = M(new THREE.CylinderGeometry(.045, .045, 1, 10), new THREE.MeshBasicMaterial({ color: 0xff3b3b }), false); thermo.add(thCol);
const thTex = canvasTex(320, 150); const thSp = new THREE.Sprite(new THREE.SpriteMaterial({ map: thTex.tx, transparent: true, depthTest: false })); thSp.scale.set(1.2, .56, 1); thSp.position.y = 1.85; thSp.renderOrder = 9; thermo.add(thSp);
let thLast = '';
function drawThermo(v) { const s = Math.round(v) + ' °C'; const col = v > 50 ? '#ff4d61' : '#35d39a'; if (s + col === thLast) return; thLast = s + col; const x = thTex.x; x.clearRect(0, 0, 320, 150); x.fillStyle = 'rgba(14,18,34,.9)'; rrp(x, 0, 6, 6, 308, 138, 60); x.fill(); x.lineWidth = 8; x.strokeStyle = col; x.stroke(); x.font = '900 84px M'; x.fillStyle = col; x.textAlign = 'center'; x.textBaseline = 'middle'; x.fillText(s, 160, 80); thTex.tx.needsUpdate = true; }
// flechas de calor
const arrowM = new THREE.MeshBasicMaterial({ color: 0xff4a2a, transparent: true });
const arrows = []; for (let i = 0; i < 7; i++) { const a = new THREE.Group(); const sh = M(new THREE.CylinderGeometry(.05, .05, .45, 8), arrowM, false); sh.position.y = .3; const cn = M(new THREE.ConeGeometry(.12, .24, 10), arrowM, false); cn.rotation.x = Math.PI; a.add(sh, cn); a.userData.x = -2.7 + i * .9; a.userData.z = i % 2 ? .9 : .2; scene.add(a); arrows.push(a); }
const heatW = []; for (let i = 0; i < 9; i++) { const pts = []; for (let k = 0; k < 10; k++) pts.push(V(Math.sin(k * .9) * .08, k * .09, 0)); const m = add(M(new THREE.TubeGeometry(new THREE.CatmullRomCurve3(pts), 20, .02, 4), new THREE.MeshBasicMaterial({ color: 0xffa060, transparent: true, opacity: .8, depthWrite: false }), false)); m.userData.x = -3 + i * .75; heatW.push(m); }
// calor dentro del cuarto (tinte)
const roomHeat = add(M(new THREE.BoxGeometry(6.3, 2.5, 3.5), new THREE.MeshBasicMaterial({ color: 0xff4020, transparent: true, opacity: 0, depthWrite: false, side: THREE.DoubleSide }), false)); roomHeat.position.set(0, 1.4, -.05);
// muebles: cama, reloj, mesa
add(M(new THREE.BoxGeometry(2.0, .3, 1.2), lp(0x8a6a48))).position.set(-2.15, .3, -1.25);
add(M(new THREE.BoxGeometry(1.95, .16, 1.15), lp(0xf4f4f0))).position.set(-2.15, .53, -1.25);
add(M(new THREE.BoxGeometry(1.2, .06, 1.17), lp(0x4f7fd8))).position.set(-1.8, .63, -1.25);
add(M(new THREE.BoxGeometry(.5, .14, .7), lp(0xffffff))).position.set(-2.9, .68, -1.25);
const clock = new THREE.Group(); clock.position.set(-.9, 2.15, -1.8); scene.add(clock); { const f = M(new THREE.CylinderGeometry(.24, .24, .05, 24), lp(0xffffff)); f.rotation.x = Math.PI / 2; clock.add(f); const r = M(new THREE.TorusGeometry(.24, .03, 6, 24), lp(0x2a2c33)); clock.add(r); const h1 = M(new THREE.BoxGeometry(.025, .13, .02), lp(0x2a2c33)); h1.position.set(0, .065, .04); clock.add(h1); const h2 = M(new THREE.BoxGeometry(.11, .025, .02), lp(0x2a2c33)); h2.position.set(.055, 0, .04); clock.add(h2); }
add(M(new THREE.BoxGeometry(.8, .6, .5), lp(0xd8c4a0))).position.set(.9, .3, -1.5);
// aire acondicionado
const ac = new THREE.Group(); ac.position.set(1.7, 2.2, -1.68); scene.add(ac); { ac.add(rbox(1.1, .34, .26, .05, lp(0xf4f6f8))); const v = M(new THREE.BoxGeometry(.9, .04, .02), lp(0x9aa2b0), false); v.position.set(0, -.12, .13); ac.add(v); const led = M(new THREE.SphereGeometry(.025, 6, 4), new THREE.MeshBasicMaterial({ color: 0x35d39a }), false); led.position.set(.42, .06, .14); ac.add(led); ac.userData.led = led; }
// ventilador de techo
const fan = new THREE.Group(); fan.position.set(-.2, 2.5, -.2); scene.add(fan); { const rod = M(new THREE.CylinderGeometry(.03, .03, .2, 6), lp(0x2a2c33)); rod.position.y = .1; fan.add(rod); const hub = M(new THREE.CylinderGeometry(.12, .1, .1, 12), lp(0x2a2c33)); fan.add(hub); }
const blades = new THREE.Group(); fan.add(blades); for (let i = 0; i < 4; i++) { const b = M(new THREE.BoxGeometry(.75, .02, .16), lp(0x8a6a48)); b.position.x = .45; const p = new THREE.Group(); p.rotation.y = i * Math.PI / 2; p.add(b); blades.add(p); }
// toldo, haz de sol, cortina
const stripeTex = (() => { const t = canvasTex(256, 64), x = t.x; for (let i = 0; i < 8; i++) { x.fillStyle = i % 2 ? '#ffffff' : '#e8463a'; x.fillRect(0, i * 8, 256, 8); } t.tx.needsUpdate = true; return t.tx; })();
const toldo = new THREE.Group(); toldo.position.set(3.4, 2.12, -.4); scene.add(toldo); { const f = M(new THREE.BoxGeometry(1.0, .03, 1.45), new THREE.MeshStandardMaterial({ map: stripeTex, roughness: .8 })); f.position.x = .5; toldo.add(f); const v = M(new THREE.BoxGeometry(.04, .2, 1.45), lp(0xe8463a)); v.position.set(1.0, -.1, 0); toldo.add(v); }
const shaftM = new THREE.MeshBasicMaterial({ color: 0xffd27a, transparent: true, opacity: 0, depthWrite: false, side: THREE.DoubleSide, blending: THREE.AdditiveBlending });
const shaftGeo = new THREE.BufferGeometry().setFromPoints([V(3.3, 2.0, 0), V(3.3, 1.0, 0), V(.6, .09, 0), V(3.3, 2.0, 0), V(.6, .09, 0), V(1.6, .09, 0)]);
const shafts = []; for (let i = 0; i < 6; i++) { const s = add(new THREE.Mesh(shaftGeo, shaftM)); s.position.z = -.98 + i * .23; shafts.push(s); }
const floorPatch = add(M(new THREE.PlaneGeometry(1.1, 1.2), new THREE.MeshBasicMaterial({ color: 0xffc860, transparent: true, opacity: 0, depthWrite: false, blending: THREE.AdditiveBlending }), false)); floorPatch.rotation.x = -Math.PI / 2; floorPatch.position.set(1.15, .16, -.4);
const curtain = add(M(new THREE.BoxGeometry(.03, 1.15, 1.3), lp(0xe9d8b8))); curtain.position.set(3.1, 1.5, -.4);
const hotGap = add(M(new THREE.BoxGeometry(.1, 1.0, 1.2), new THREE.MeshBasicMaterial({ color: 0xff5a2a, transparent: true, opacity: 0, depthWrite: false }), false)); hotGap.position.set(3.2, 1.5, -.4);
// partículas
function parts(n, c, r = .05) { const m = new THREE.InstancedMesh(new THREE.SphereGeometry(r, 6, 4), new THREE.MeshBasicMaterial({ color: c }), n); m.frustumCulled = false; scene.add(m); return m; }
const tmp = new THREE.Object3D();
function setP(m, i, x, y, z, vis, s = 1) { tmp.position.set(x, y, z); tmp.scale.setScalar(vis ? s : .001); tmp.updateMatrix(); m.setMatrixAt(i, tmp.matrix); }
const airP = parts(48, 0x8fe0ff), hotP = parts(36, 0xff6a3a), acP = parts(16, 0xbfeaff, .04), fanP = parts(28, 0x9fe6ff, .04), sweat = parts(4, 0x6cc4ff, .035);
// personaje
const owner = makeChar({ shirt: 0xff8a3d, pants: 0x2b3350 }); scene.add(owner.root);
const LB = (n, c) => ({ userData: { text: n, color: c || '#ffcc33' } });
const nightL = new THREE.PointLight(0xffd59a, 0, 8, 1.4); nightL.position.set(-.5, 2.3, .3); scene.add(nightL);
const fillL = new THREE.PointLight(0xfff4e0, 0, 9, 1.2); fillL.position.set(0, 2.2, 1.6); scene.add(fillL);
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
const K = { horno: T('horno', 1), son: PS(2), aire: T('aire', 1), porque: PS(5), techo: T('techo', 1), losa: T('losa'), sesenta: T('sesenta'), comal: T('comal'), ese: PS(9), atraviesa: T('atraviesa'), doble: T('doble'), recibo: T('recibo', 1), primera: PS(13), pinta: T('pinta'), reflej: T('reflejante'), veint: T('veinticinco'), casa1: PS(16), quince: T('quince'), noche: T('noche'), porque2: PS(19), guardo: T('guardó', 1), suelta: T('suelta'), poreso: PS(22), cruzada: T('cruzada'), abres: T('abres'), lleva: T('lleva'), tarde: PS(25), poniente: T('poniente'), toldo: T('toldo'), tres2: T('tres', 2), cortina: PS(29), entro: T('entró'), siq: PS(31), aislante: T('aislante'), hielera: T('hielera'), ultimo: PS(35), ventilador: T('ventilador'), enfria2: T('enfría', 2), dos: T('dos'), felic: PS(40), horno2: T('horno', 2), recibo2: T('recibo', 2), dime: PS(43), oscuro: T('oscuro', 2), blanco2: T('blanco', 2) };
const SHOTS = [
  [0, K.son, [9, 6.5, 13], [4.6, 3.6, 8.2], [0, 2.2, 0], [0, 1.8, 0]],
  [K.son, K.porque, [1.1, 1.9, 6.4], [.6, 1.8, 5.2], [.2, 1.5, -1], [0, 1.45, -1]],
  [K.porque, K.ese, [.4, 1.7, 3.6], [5.2, 7.2, 7.4], [0, 1.9, -1], [.4, 3.0, 0]],
  [K.ese, K.primera, [5.0, 3.0, 6.2], [3.8, 2.4, 5.0], [0, 2.1, -.4], [0, 2.0, -.6]],
  [K.primera, K.casa1, [7.5, 8.6, 9.5], [5.4, 7.6, 7.8], [0, 2.9, 0], [.3, 2.9, 0]],
  [K.casa1, K.noche - .25, [1.0, 1.9, 6.0], [.6, 1.8, 5.0], [.5, 1.5, -1], [.4, 1.5, -1]],
  [K.noche - .25, K.porque2, [7, 4, 10], [4.5, 2.8, 7.5], [0, 1.8, 0], [0, 1.6, 0]],
  [K.porque2, K.poreso, [-.2, 1.7, 4.4], [-.7, 1.6, 3.5], [-1.8, 1.4, -1], [-2.0, 1.5, -1]],
  [K.poreso, K.tarde, [0, 2.4, 8.4], [0, 2.1, 7.2], [0, 1.4, -.5], [0, 1.4, -.5]],
  [K.tarde, K.cortina, [5.9, 2.3, 6.6], [4.8, 2.0, 5.4], [1.7, 1.3, -.3], [1.9, 1.3, -.3]],
  [K.cortina, K.siq, [1.2, 1.65, 2.6], [1.6, 1.6, 1.9], [3.2, 1.45, -.4], [3.2, 1.45, -.4]],
  [K.siq, K.ultimo, [6.0, 7.8, 7.4], [4.4, 6.8, 6.0], [0, 2.9, 0], [0, 2.9, 0]],
  [K.ultimo, K.felic, [.8, 2.0, 5.8], [.4, 1.9, 4.7], [-.1, 1.75, -.6], [-.1, 1.7, -.6]],
  [K.felic, K.dime, [9, 5, 12], [-6, 4.6, 11.5], [0, 1.7, 0], [0, 1.7, 0]],
  [K.dime, 200, [6.5, 8.5, 10], [5.0, 7.4, 8.4], [0, 3.0, 0], [0, 3.0, 0]],
];
const CUTS = SHOTS.map(s => s[0]).slice(1);
function camAt(t) { const s = SHOTS.find(s => t >= s[0] && t < s[1]) || SHOTS[SHOTS.length - 1]; const k = eio(clamp((t - s[0]) / (Math.min(s[1], END) - s[0]))); cam.position.copy(V(...s[2]).lerp(V(...s[3]), k)); cam.fov = 50; cam.updateProjectionMatrix(); cam.lookAt(V(...s[4]).lerp(V(...s[5]), k)); }
const inn = (t, a, b) => t >= a && t < b;
function phase(t) { return inn(t, K.noche - .25, K.tarde) ? 'night' : inn(t, K.tarde, K.siq) ? 'pm' : 'day'; }
function heatRoom(t) {
  if (t < K.ese) return .55 + .08 * Math.sin(t * 3);
  if (t < K.primera) return lerp(.45, .95, P(t, K.atraviesa, 3));
  if (t < K.casa1) return .6;
  if (t < K.noche - .25) return lerp(.6, .2, P(t, K.casa1, 1.5));
  if (t < K.poreso) return .7;
  if (t < K.tarde) return lerp(.7, .08, P(t, K.abres + .5, 4));
  if (t < K.cortina) return lerp(.35, .7, P(t, K.tarde + .5, 2.5)) * (1 - .65 * P(t, K.toldo + .3, 1.2));
  if (t < K.siq) return .55;
  if (t < K.ultimo) return .2;
  return 0;
}
const slabHot = t => inn(t, K.comal, K.primera) ? .35 * P(t, K.comal, .8) : inn(t, K.noche - .25, K.tarde) ? lerp(1.1, .12, P(t, K.abres + .5, 5)) * (.9 + .1 * Math.sin(t * 4)) : 0;
function arrowMode(t) {
  if (t < K.son) return ['in', 0xff4a2a];
  if (inn(t, K.ese, K.primera)) return ['in', 0xff4a2a];
  if (inn(t, K.pinta + 2.6, K.casa1)) return ['bounce', 0xffd23a];
  if (inn(t, K.porque2, K.poreso)) return ['in', 0xff7a2a];
  if (inn(t, K.aislante + 1.4, K.ultimo)) return ['stop', 0xff4a2a];
  return null;
}
function paintK(r, t) { return P(t, K.pinta - .1 + r * .85, .8); }
function animWorld(t) {
  const ph = phase(t);
  const skyDay = new THREE.Color(0x8fd0ff), sky = ph === 'night' ? new THREE.Color(0x0c1430) : ph === 'pm' ? new THREE.Color(0xf6b07a) : skyDay;
  scene.background = sky; scene.fog.color.copy(sky); scene.fog.near = 30; scene.fog.far = 80;
  if (ph === 'day') { hemi.intensity = 1.3; hemi.color.set(0xcfe8ff); sunL.intensity = 2.8; sunL.color.set(0xfff4dc); sunL.position.set(5, 20, 9); }
  else if (ph === 'night') { hemi.intensity = .45; hemi.color.set(0x7d8ccf); sunL.intensity = .6; sunL.color.set(0x9fb4ff); sunL.position.set(-8, 18, 12); }
  else { hemi.intensity = .9; hemi.color.set(0xffd2b0); sunL.intensity = 3.2; sunL.color.set(0xffb070); sunL.position.set(20, 5.5, -.6); }
  sunL.target.position.set(0, 0, 0);
  sun.visible = ph === 'day'; sun.position.set(7, 15, -22); sunHalo.position.copy(sun.position); sunHalo.scale.setScalar(9); sunHalo.material.opacity = ph === 'day' ? .9 : 0;
  moon.visible = ph === 'night'; moon.position.set(-12, 20, -36); stars.material.opacity = ph === 'night' ? 1 : 0; stars.visible = ph === 'night';
  clouds.forEach(c => { c.visible = ph !== 'night'; c.position.x = ((c.position.x + 40 + c.userData.v * .02) % 80) - 40; });
  nightL.intensity = ph === 'night' ? 6 : 0; fillL.intensity = ph === 'night' ? 0 : 3.5;
  // calor
  const hr = heatRoom(t); roomHeat.material.opacity = .2 * hr; slabM.emissiveIntensity = slabHot(t);
  const am = arrowMode(t); arrowM.color.set(am ? am[1] : 0xffffff);
  arrows.forEach((a, i) => {
    a.visible = !!am; if (!am) return; const u = (t * .55 + i / 7) % 1; a.rotation.set(0, 0, 0); let y, op = 1;
    if (am[0] === 'in') { y = lerp(4.9, 1.0, u); op = u > .8 ? (1 - u) / .2 : u < .1 ? u / .1 : 1; }
    else if (am[0] === 'bounce') { if (u < .5) { y = lerp(5.0, 3.15, u / .5); } else { y = lerp(3.4, 5.2, (u - .5) / .5); a.rotation.z = Math.PI; op = 1 - (u - .5) / .5; } }
    else { y = lerp(5.0, 3.35, Math.min(1, u / .6)); op = u > .6 ? 1 - (u - .6) / .4 : 1; a.scale.y = u > .6 ? lerp(1, .4, (u - .6) / .4) : 1; }
    if (am[0] !== 'stop') a.scale.y = 1;
    a.position.set(a.userData.x, y, a.userData.z); arrowM.opacity = 1; a.children.forEach(c => c.visible = op > .05); a.scale.x = a.scale.z = Math.max(.001, op);
  });
  const roofHot = (t < K.primera + 3 && t < K.pinta + 2.4) || inn(t, K.noche - .25, K.poreso);
  heatW.forEach((h, i) => { const u = (t * .6 + i / 9) % 1; h.visible = roofHot; h.position.set(h.userData.x, 3.05 + u * .9, .6 + (i % 3) * .5); h.material.opacity = .8 * (1 - u); });
  // pintura blanca y rodillo
  const finalDark = t > K.oscuro - .05 && t < K.blanco2 - .05;
  paintM.color.set(finalDark ? 0x4a4d55 : 0xf7f7f2);
  let rollOn = false; paint.forEach((p, r) => { const k = paintK(r, t); p.visible = k > 0; p.scale.x = Math.max(.001, k); p.position.x = -3.45 + 3.45 * k; p.position.y = t >= K.ultimo ? 3.2 : 3.02; if (k > 0 && k < 1) { rollOn = true; roller.position.set(-3.45 + 6.9 * k, 3.15, p.position.z); roller.children[0].rotation.y = k * 30; } });
  roller.visible = rollOn;
  // aislante
  ins.forEach((p, i) => { const t0 = K.aislante - .15 + i * .14; p.visible = t >= t0; p.position.set(p.userData.x, 3.08 + 3.2 * (1 - eout(P(t, t0, .45))), p.userData.z); });
  // termómetro
  const roofShot = inn(t, K.porque, K.casa1); thermo.visible = roofShot && t > K.techo - .3;
  let temp = 34; if (t < K.primera) temp = lerp(34, 65, eio(P(t, K.sesenta - 1.0, 1.3))); else temp = lerp(65, 37, eio(P(t, K.reflej, 1.6)));
  thCol.scale.y = lerp(.15, 1.05, (temp - 20) / 50); thCol.position.y = .2 + thCol.scale.y / 2; thCol.material.color.set(temp > 50 ? 0xff3b3b : 0x35d39a); drawThermo(temp);
  // ventanas (abiertas tras "abres")
  const op = eout(P(t, K.abres, .7)) * (inn(t, K.abres, K.tarde) ? 1 : 0); sashL.rotation.y = op * 1.3; sashR.rotation.y = -op * 1.3;
  // tarde: haz de sol, toldo, cortina
  const tk = eback(P(t, K.toldo - .1, .6)); const toldoOn = inn(t, K.toldo - .1, K.cortina) || t >= K.siq; toldo.visible = toldoOn; toldo.scale.x = Math.max(.001, toldoOn ? (t >= K.siq ? 1 : tk) : 0); toldo.rotation.z = -.45;
  const pmOn = inn(t, K.tarde, K.siq); const shaftK = pmOn ? P(t, K.tarde + .2, .8) * (1 - (inn(t, K.toldo, K.cortina) ? .8 * P(t, K.toldo, .6) : 0)) : 0;
  shaftM.opacity = .07 * shaftK; floorPatch.material.opacity = .55 * shaftK;
  const ck = eout(P(t, K.cortina + .3, .8)); curtain.visible = inn(t, K.cortina, K.siq); curtain.scale.z = Math.max(.05, ck); curtain.position.z = -1.0 + .6 * ck;
  hotGap.material.opacity = inn(t, K.cortina, K.siq) ? (.25 + .1 * Math.sin(t * 6)) * P(t, K.cortina + .6, .6) : 0;
  // aire acondicionado
  const acHard = inn(t, K.aire, K.porque) || inn(t, K.doble - .3, K.primera); const acOn = t < K.noche - .25 || t >= K.ultimo;
  ac.position.x = 1.7 + (acHard ? Math.sin(t * 60) * .012 : 0); ac.userData.led.material.color.set(acHard ? 0xff3b3b : 0x35d39a);
  for (let i = 0; i < 16; i++) { const u = (t * (acHard ? 1.4 : .6) + i / 16) % 1; setP(acP, i, 1.7 + (i % 5 - 2) * .18, 2.02 - u * .8, -1.5 + u * 1.3, acOn && t < K.felic, 1 - u * .5); } acP.instanceMatrix.needsUpdate = true;
  // ventilador de techo
  const fanOn = t > K.ventilador; blades.rotation.y = fanOn ? (t - K.ventilador) * 14 * Math.min(1, (t - K.ventilador) / 1.2) : 0;
  for (let i = 0; i < 28; i++) { const u = (t * .5 + i / 28) % 1, a = i * 2.3 + t * 3; setP(fanP, i, -.2 + Math.cos(a) * (.3 + u * .5), 2.35 - u * 1.6, -.2 + Math.sin(a) * (.3 + u * .5), inn(t, K.ventilador + .3, K.felic), 1 - u * .6); } fanP.instanceMatrix.needsUpdate = true;
  // aire cruzado y calor que sale
  const flow = inn(t, K.abres + .3, K.tarde);
  for (let i = 0; i < 48; i++) { const u = (t * .35 + i / 48) % 1; setP(airP, i, lerp(-4.6, 4.6, u), 1.15 + (i % 6) * .17 + Math.sin(u * 9 + i) * .06, -.95 + (i % 7) * .18, flow); } airP.instanceMatrix.needsUpdate = true;
  for (let i = 0; i < 36; i++) { const u = (t * .25 + i / 36) % 1; let x = -2.9 + (i % 9) * .7, y = 2.55 - u * 1.6, z = -1.4 + (i % 4) * .6, vis = inn(t, K.porque2, K.poreso); if (flow) { const v = clamp((t - K.abres - .3) * .35 + (i % 9) / 12); x = lerp(-2.9 + (i % 9) * .55, 4.6, v); y = 1.3 + (i % 5) * .2; z = -.4 + ((i % 3) - 1) * .3; vis = v < .99; } setP(hotP, i, x, y, z, vis); } hotP.instanceMatrix.needsUpdate = true;
  // personaje
  let pos = [-.3, 0, -.2], ry = 0, p = {};
  const fanning = { armR: [-1.5, -.6, -1.3 + .45 * Math.sin(t * 13)], armL: [-.2, .15, -.3] };
  if (t < K.porque) p = { ...fanning, emo: 'sad' };
  else if (t < K.casa1) p = { emo: 'worried', headRx: -.35, look: [0, 1] };
  else if (t < K.noche - .25) p = { emo: 'happy', armR: [-.2, -.15, -.3], armL: [-.2, .15, -.3] };
  else if (t < K.tarde) { pos = [-2.05, 0, -.55]; p = { ...SIT(.62), emo: t > K.lleva ? 'happy' : 'worried', armR: t > K.lleva ? [-.3, -.2, -.6] : fanning.armR, armL: [-.3, .2, -.6], look: t > K.abres && t < K.lleva ? [.8, 0] : [0, 0] }; }
  else if (t < K.siq) { pos = [1.5, 0, .5]; ry = 1.2; p = { emo: inn(t, K.toldo + .5, K.cortina) ? 'happy' : 'worried', ...(inn(t, K.toldo + .5, K.cortina) ? {} : fanning) }; }
  else if (t < K.felic) { pos = [-.2, 0, -.15]; p = { emo: t > K.ventilador + .5 ? 'happy' : 'neutral', headRx: t > K.ventilador && t < K.enfria2 ? -.3 : 0, look: [0, t > K.ventilador && t < K.enfria2 ? 1 : 0] }; }
  else { pos = [-.3, 0, .4]; p = { emo: 'happy', armR: [-2.6, -.35, -.2 + .3 * Math.sin(t * 8)], armL: [-.2, .15, -.3] }; }
  owner.root.position.set(...pos); owner.root.rotation.y = ry; pose(owner, p, t);
  const sweaty = t < K.casa1 || inn(t, K.noche - .25, K.lleva) || inn(t, K.tarde, K.toldo + .5) || inn(t, K.cortina, K.siq); const hy = (p.hipY ?? .98) + 1.08;
  for (let i = 0; i < 4; i++) { const u = (t * .8 + i / 4) % 1; const s = i % 2 ? 1 : -1; const lx = .24 * s, lz = .12; const c = Math.cos(ry), sn = Math.sin(ry); setP(sweat, i, pos[0] + lx * c + lz * sn, hy + .05 - u * .45, pos[2] - lx * sn + lz * c, sweaty && u < .9); } sweat.instanceMatrix.needsUpdate = true;
  // etiquetas
  OVL.length = 0; const L = (text, at, end, pos, color = '#ffcc33') => { if (t >= at && t < end) OVL.push({ text, at, end, pos, color }); };
  L('TU CASA = HORNO', K.horno - .1, K.son, V(0, 4.2, 0), '#ff6a4a');
  L('AIRE AL MÁXIMO', K.aire, K.porque, V(1.7, 2.6, -1.6), '#ff6a4a');
  L('LOSA DE CONCRETO', K.losa, K.ese, V(-1.2, 3.6, 0));
  L('AIRE AL DOBLE', K.doble - .1, K.primera, V(1.7, 2.6, -1.6), '#ff6a4a');
  L('TECHO REFLEJANTE', K.reflej - .1, K.veint, V(-1.5, 4.9, -1));
  L('HASTA 28 °C MÁS FRESCO', K.veint - .1, K.casa1, V(-1.5, 4.9, -1), '#7be36b');
  L('HASTA −15% DE AIRE', K.quince - .2, K.noche - .25, V(1.7, 2.6, -1.6), '#7be36b');
  L('LOSA CALIENTE', K.noche, K.porque2, V(0, 3.6, 0), '#ff8a4a');
  L('EL CONCRETO GUARDA CALOR', K.guardo - .2, K.poreso, V(-1.2, 2.5, -1), '#ff8a4a');
  L('VENTILACIÓN CRUZADA', K.cruzada - .2, K.tarde, V(0, 3.4, 0));
  L('VENTANA AL PONIENTE', K.poniente - .3, K.toldo - .1, V(3.3, 2.5, -.4), '#ff8a4a');
  L('TOLDO', K.toldo - .1, K.tres2 - .1, V(3.9, 2.5, -.4));
  L('HASTA 77% MENOS CALOR', K.tres2 - .1, K.cortina, V(3.9, 2.5, -.4), '#7be36b');
  L('CORTINA', K.cortina + .2, K.entro - .1, V(3.1, 2.25, -.4));
  L('EL CALOR YA ENTRÓ', K.entro - .1, K.siq, V(3.1, 2.25, -.4), '#ff6a4a');
  L('AISLANTE TÉRMICO', K.aislante - .1, K.hielera - .1, V(-1, 3.8, 0));
  L('COMO UNA HIELERA', K.hielera - .1, K.ultimo, V(-1, 3.8, 0), '#6cc4ff');
  L('VENTILADOR DE TECHO', K.ventilador - .1, K.enfria2 - .1, V(-.2, 2.9, -.2));
  L('TE ENFRÍA A TI', K.enfria2 - .1, K.dos - .2, V(-.2, 2.9, -.2), '#6cc4ff');
  L('+2 °C AL AIRE', K.dos - .2, K.felic, V(1.7, 2.6, -1.6), '#7be36b');
  L('¿OSCURO…', K.oscuro - .1, K.blanco2 - .05, V(-1.5, 3.4, 0), '#ff6a4a');
  L('…O BLANCO?', K.blanco2 - .05, CTA_ST, V(-1.5, 3.4, 0), '#ffffff');
}
// recibo 2D
function receipt(t) {
  let mode = null, at = 0; if (inn(t, K.recibo - .1, K.primera)) { mode = 'up'; at = K.recibo - .1; } else if (inn(t, K.recibo2 - .1, K.dime)) { mode = 'down'; at = K.recibo2 - .1; } if (!mode) return;
  const k = eback(P(t, at, .4)); g.save(); g.translate(540, 1330); g.scale(k, k); g.rotate(-.04);
  g.fillStyle = 'rgba(0,0,0,.35)'; rrp(g, 0, -205, -175, 420, 360, 22); g.fill(); g.fillStyle = '#fffdf6'; rrp(g, 0, -215, -185, 420, 360, 22); g.fill();
  g.font = '900 34px M'; g.fillStyle = '#2a2c33'; g.textAlign = 'center'; g.textBaseline = 'middle'; g.fillText('RECIBO DE LUZ', -5, -135);
  g.fillStyle = '#d8d8d0'; for (let i = 0; i < 3; i++) g.fillRect(-170, -85 + i * 30, 300 - i * 50, 12);
  g.font = '800 26px M'; g.fillStyle = '#6a6e78'; g.fillText('TOTAL', -5, 40);
  if (mode === 'up') { const v = Math.round(lerp(1250, 2480, eout(P(t, at + .2, 1.0))) / 10) * 10; g.font = '900 76px M'; g.fillStyle = '#e8383a'; g.fillText('$' + v.toLocaleString('en-US') + ' ▲', -5, 110); }
  else { g.font = '900 64px M'; g.fillStyle = '#9a9ca4'; g.fillText('$2,480', -5, 100); const s = P(t, at + .3, .4); g.strokeStyle = '#e8383a'; g.lineWidth = 8; g.beginPath(); g.moveTo(-125, 100); g.lineTo(-125 + 240 * s, 100); g.stroke(); if (s >= 1) { g.font = '900 44px M'; g.fillStyle = '#1aa86a'; g.fillText('▼ MÁS BAJO', -5, 158); } }
  g.restore();
}
const KEYW = new Set(['horno', 'calor', 'techo', 'losa', 'sesenta', 'comal', 'doble', 'recibo', 'blanco', 'reflejante', 'veinticinco', 'quince', 'noche', 'guardó', 'cruzada', 'poniente', 'toldo', 'cortina', 'aislante', 'hielera', 'ventilador', 'dos', 'felicidades', 'oscuro']);

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
  overlayLabels(t); if (t < CTA_ST) { receipt(t); caption(t); } watermark(t); followCTA(t);
  const fo = P(t, END - .3, .3); if (fo > 0) { g.fillStyle = `rgba(0,0,0,${fo})`; g.fillRect(0, 0, W, H); }
}
window.renderAt = renderAt; window.END = END;
window.frameJPG = (t, q = .92) => { renderAt(t); return out.toDataURL('image/jpeg', q).split(',')[1]; };
window.READY = true;
