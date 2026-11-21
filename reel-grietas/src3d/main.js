// Reel 9:16 3D — Estilo C "Escalada 3D" (ref. referencias/estilo-escalada-balcon.mp4) — Grietas
import * as THREE from 'three';

const W = 1080, H = 1920, END = 70.31;   // END = última palabra + ~4,2 s (cierre 3,7 s)
const CTA_ST = END - 3.7;
const RS = .72;                           // escala del render 3D (los textos van a resolución completa)
const BRAND = 'Así funciona con Rai';
const YT = new URLSearchParams(location.search).get('cta') === 'yt';
const CTA = YT ? { big: '¡SUSCRÍBETE!', btn: 'SUSCRIBIRSE', col: '#ff2d3d', bw: 560 } : { big: '¡SÍGUEME!', btn: '+ SEGUIR', col: '#3d7bff', bw: 420 };
const MASCOT = new Image(); MASCOT.src = 'mascota.png'; await new Promise(r => { MASCOT.onload = r; MASCOT.onerror = r; });
const TIM = await (await fetch('timing.json')).json();
const WORDS = TIM.words, PH = TIM.phrases;
await Promise.all(['500 20px M', '800 20px M', '900 20px M', '500 20px I', '600 20px I', '700 20px I', '800 20px I', '900 20px I'].map(f => document.fonts.load(f)));

// ---------- utilidades ----------
const C = { amber: '#ffb020', red: '#ff4d4d', blue: '#4aa8ff', green: '#3ddc84', white: '#ffffff', purple: '#a98bff' };
const clamp = (x, a = 0, b = 1) => Math.min(b, Math.max(a, x));
const P = (t, a, d) => clamp((t - a) / d);
const eout = x => 1 - Math.pow(1 - x, 3);
const eio = x => x < .5 ? 4 * x * x * x : 1 - Math.pow(-2 * x + 2, 3) / 2;
const eback = x => { const c1 = 1.7, c3 = c1 + 1; return x <= 0 ? 0 : 1 + c3 * Math.pow(x - 1, 3) + c1 * Math.pow(x - 1, 2); };
const lerp = (a, b, x) => a + (b - a) * x;
const norm = s => s.toLowerCase().replace(/[¿?¡!.,:…;"«»]/g, '');
const T = (w, n = 1) => { let k = 0; for (const x of WORDS) if (norm(x.w) === norm(w) && ++k === n) return x.s; throw new Error('word ' + w); };
const PS = i => PH[i].s, PE = i => PH[i].e;
const inn = (t, a, b) => t >= a && t < b;
let seed = 7; const rnd = () => (seed = (seed * 16807) % 2147483647) / 2147483647;
const V = (x, y, z) => new THREE.Vector3(x, y, z);
function rrp(x, c, X, Y, w, h, r) { x.beginPath(); x.moveTo(X + r, Y); x.arcTo(X + w, Y, X + w, Y + h, r); x.arcTo(X + w, Y + h, X, Y + h, r); x.arcTo(X, Y + h, X, Y, r); x.arcTo(X, Y, X + w, Y, r); x.closePath(); }
function canvasTex(w, h) { const c = document.createElement('canvas'); c.width = w; c.height = h; const tx = new THREE.CanvasTexture(c); tx.colorSpace = THREE.SRGBColorSpace; tx.anisotropy = 4; return { c, x: c.getContext('2d'), tx }; }

// ---------- renderer: día, low-poly limpio ----------
const glc = document.getElementById('gl'), out = document.getElementById('out'), g = out.getContext('2d');
const renderer = new THREE.WebGLRenderer({ canvas: glc, antialias: true, preserveDrawingBuffer: true });
renderer.setPixelRatio(1); renderer.setSize(Math.round(W * RS), Math.round(H * RS), false);
renderer.shadowMap.enabled = true; renderer.shadowMap.type = THREE.PCFSoftShadowMap;
renderer.toneMapping = THREE.ACESFilmicToneMapping; renderer.toneMappingExposure = 1.05;
const scene = new THREE.Scene();
{ const s = canvasTex(4, 256), x = s.x, gr = x.createLinearGradient(0, 0, 0, 256); gr.addColorStop(0, '#5fa8e8'); gr.addColorStop(.6, '#a9d6f5'); gr.addColorStop(1, '#e3f1fb'); x.fillStyle = gr; x.fillRect(0, 0, 4, 256); s.tx.needsUpdate = true; scene.background = s.tx; }
scene.fog = new THREE.Fog(0xcfe7f7, 40, 130);
const cam = new THREE.PerspectiveCamera(42, W / H, .05, 400);
const hemi = new THREE.HemisphereLight(0xdcefff, 0x8a9a6a, 1.25); scene.add(hemi);
const sunL = new THREE.DirectionalLight(0xfff1d6, 2.7); sunL.castShadow = true; sunL.shadow.mapSize.set(1024, 1024); sunL.shadow.bias = -.0004; sunL.shadow.normalBias = .03;
Object.assign(sunL.shadow.camera, { left: -16, right: 16, top: 16, bottom: -16, near: 1, far: 80 }); sunL.position.set(9, 22, 12); scene.add(sunL, sunL.target);
function sunAt(x, y, z, r = 16) { sunL.position.set(x + 9, y + 22, z + 12); sunL.target.position.set(x, y, z); Object.assign(sunL.shadow.camera, { left: -r, right: r, top: r, bottom: -r }); sunL.shadow.camera.updateProjectionMatrix(); }

// ---------- primitivas ----------
const lp = (c, o = {}) => new THREE.MeshStandardMaterial({ color: c, roughness: .82, ...o });
const add = (o, p = scene) => { p.add(o); return o; };
function M(geo, m, cast = true) { const o = new THREE.Mesh(geo, m); o.castShadow = cast; o.receiveShadow = true; return o; }
const box = (x, y, z, m) => M(new THREE.BoxGeometry(x, y, z), m.isMaterial ? m : lp(m));
const cyl = (r1, r2, h, m, s = 24) => M(new THREE.CylinderGeometry(r1, r2, h, s), m.isMaterial ? m : lp(m));
const sph = (r, m, s = 20) => M(new THREE.SphereGeometry(r, s, s), m.isMaterial ? m : lp(m));
function at(o, x, y, z) { o.position.set(x, y, z); return o; }
function rbox(x, y, z, r, m) {
  const s = new THREE.Shape(), w = x / 2 - r, h = y / 2 - r;
  s.moveTo(-w, -y / 2); s.lineTo(w, -y / 2); s.quadraticCurveTo(x / 2, -y / 2, x / 2, -h); s.lineTo(x / 2, h); s.quadraticCurveTo(x / 2, y / 2, w, y / 2); s.lineTo(-w, y / 2); s.quadraticCurveTo(-x / 2, y / 2, -x / 2, h); s.lineTo(-x / 2, -h); s.quadraticCurveTo(-x / 2, -y / 2, -w, -y / 2);
  const gm = new THREE.ExtrudeGeometry(s, { depth: Math.max(.01, z - r * 2), bevelEnabled: true, bevelThickness: r, bevelSize: r * .6, bevelSegments: 3, curveSegments: 6 }); gm.center(); return M(gm, m.isMaterial ? m : lp(m));
}
function texPlane(w, h, cw, ch, draw, basic = true) { const t = canvasTex(cw, ch); draw(t.x, cw, ch); t.tx.needsUpdate = true; const m = basic ? new THREE.MeshBasicMaterial({ map: t.tx, transparent: true, toneMapped: false }) : new THREE.MeshStandardMaterial({ map: t.tx, roughness: .8 }); const o = M(new THREE.PlaneGeometry(w, h), m, false); o.userData.tex = t; return o; }
// aparición con rebote (escala 0→1) — todo depende solo de t
function pop(o, t, a, d = .45, b = 1e9) { if (!o.userData.s0) o.userData.s0 = o.scale.clone(); const k = eback(P(t, a, d)) * (1 - eout(P(t, b, .3))); o.visible = t >= a && t < b + .3; o.scale.copy(o.userData.s0).multiplyScalar(Math.max(.001, k)); }
function drop(o, t, a, y0, y1, d = .5) { o.visible = t >= a; const k = P(t, a, d); const b = k < 1 ? k * k : 1; o.position.y = lerp(y0, y1, b) + (k >= 1 ? Math.sin(P(t, a + d, .25) * Math.PI) * .06 * (1 - P(t, a + d, .25)) : 0); }

// ---------- mundo base ----------
const grassM = lp(0x7cc46a); const ground = add(M(new THREE.PlaneGeometry(400, 400), grassM)); ground.rotation.x = -Math.PI / 2; ground.position.y = -.01;
const clouds = []; for (let i = 0; i < 14; i++) { const c = new THREE.Group(); for (let k = 0; k < 6; k++) { const s = M(new THREE.SphereGeometry(1.3 + rnd() * 1.2, 10, 8), lp(0xffffff, { roughness: 1 }), false); s.position.set(k * 1.6 - 4, rnd() * .9, rnd() * 1.2); s.scale.y = .7; c.add(s); } c.position.set(-80 + i * 12, 26 + rnd() * 12, -55 - rnd() * 30); c.userData.v = .25 + rnd() * .35; scene.add(c); clouds.push(c); }
function cloudsAt(t) { clouds.forEach((c, i) => { c.position.x = ((-80 + i * 12 + t * c.userData.v + 160) % 170) - 85; }); }
function road(x, z, len, rot = 0, w = 6) { const gr = add(new THREE.Group()); const r = M(new THREE.PlaneGeometry(len, w), lp(0x3a3d44)); r.rotation.x = -Math.PI / 2; gr.add(r); for (let i = -len / 2 + 2; i < len / 2; i += 4) { const d = M(new THREE.PlaneGeometry(2, .18), lp(0xf2f2f2), false); d.rotation.x = -Math.PI / 2; d.position.set(i, .01, 0); gr.add(d); } const sw = M(new THREE.BoxGeometry(len, .15, 1.4), lp(0xb8bcc4)); sw.position.set(0, .07, w / 2 + .7); gr.add(sw); gr.position.set(x, .01, z); gr.rotation.y = rot; return gr; }
function building(x, z, w, d, fl, col = 0xe8d7b0, opt = {}) {
  const gr = add(new THREE.Group()); const fh = 1.15, h = fl * fh; const b = box(w, h, d, col); b.position.y = h / 2; gr.add(b);
  const top = box(w + .12, .14, d + .12, 0xcfc6b2); top.position.y = h + .07; gr.add(top);
  const wm = lp(0x23406e, { roughness: .35 }), fm = lp(0xf4f4f0);
  const nx = Math.max(1, Math.floor(w / 1.1)); for (let f = 0; f < fl; f++) for (let i = 0; i < nx; i++) { const xx = -w / 2 + (i + .5) * w / nx; for (const s of [1]) { const fr = box(.56, .7, .05, fm); fr.position.set(xx, f * fh + .65, d / 2 + .02); const gl = box(.46, .6, .04, wm); gl.position.set(xx, f * fh + .65, d / 2 + .05); gr.add(fr, gl); } }
  gr.position.set(x, 0, z); if (opt.rot) gr.rotation.y = opt.rot; return gr;
}
function tree(x, z, s = 1) { const tr = add(new THREE.Group()); const tk = cyl(.12 * s, .16 * s, 1.2 * s, 0x7a5230, 6); tk.position.y = .6 * s; const cr = M(new THREE.IcosahedronGeometry(.9 * s, 0), lp(0x4f9a3e, { flatShading: true })); cr.position.y = 1.7 * s; tr.add(tk, cr); tr.position.set(x, 0, z); return tr; }

// ---------- cámara: tomas + desenfoque en los cambios ----------
let SHOTS = [], BLURS = [], SHAKE = [];
function camAt(t) {
  const s = SHOTS.find(s => t >= s[0] && t < s[1]) || SHOTS[SHOTS.length - 1]; const k = eio(clamp((t - s[0]) / (Math.min(s[1], END) - s[0])));
  cam.position.copy(V(...s[2]).lerp(V(...s[3]), k)); cam.fov = s[6] || 42; cam.updateProjectionMatrix(); cam.lookAt(V(...s[4]).lerp(V(...s[5]), k));
  for (const [a, b, amp] of SHAKE) if (inn(t, a, b)) { const q = (amp || .08) * (1 - P(t, a, b - a)); cam.position.x += Math.sin(t * 61) * q; cam.position.y += Math.sin(t * 47) * q * .7; }
}
function blurAt(t) { let b = 0; for (const c of BLURS) { const d = Math.abs(t - c); if (d < .32) b = Math.max(b, 22 * (1 - d / .32)); } for (const s of SHOTS) { const d = Math.abs(t - s[0]); if (s[0] > 0 && d < .28 && !s[7]) b = Math.max(b, 18 * (1 - d / .28)); } return b; }
const proj = v => { const p = v.clone().project(cam); return { x: (p.x * .5 + .5) * W, y: (-p.y * .5 + .5) * H, ok: p.z < 1 }; };

// ---------- capa 2D: píldoras, palabras golpe, tarjetas ----------
function icon(x, y, kind, col) {
  g.save(); g.translate(x, y); g.strokeStyle = col; g.fillStyle = col; g.lineWidth = 4.5; g.lineCap = 'round'; g.lineJoin = 'round';
  if (kind === 'check') { g.beginPath(); g.moveTo(-9, 0); g.lineTo(-3, 7); g.lineTo(10, -8); g.stroke(); }
  else if (kind === 'x') { g.beginPath(); g.moveTo(-8, -8); g.lineTo(8, 8); g.moveTo(8, -8); g.lineTo(-8, 8); g.stroke(); }
  else if (kind === 'warn') { g.beginPath(); g.moveTo(0, -11); g.lineTo(11, 9); g.lineTo(-11, 9); g.closePath(); g.fill(); g.fillStyle = '#16161c'; g.fillRect(-1.6, -4, 3.2, 7); g.fillRect(-1.6, 5, 3.2, 2.6); }
  else if (kind === 'arrow') { g.beginPath(); g.moveTo(-9, 0); g.lineTo(9, 0); g.moveTo(3, -6); g.lineTo(9, 0); g.lineTo(3, 6); g.stroke(); }
  else if (kind === 'clock') { g.beginPath(); g.arc(0, 0, 10, 0, 6.29); g.stroke(); g.beginPath(); g.moveTo(0, -6); g.lineTo(0, 0); g.lineTo(5, 3); g.stroke(); }
  else if (kind === 'star') { g.beginPath(); for (let i = 0; i < 10; i++) { const r = i % 2 ? 4.5 : 11, a = i * Math.PI / 5 - Math.PI / 2; g.lineTo(Math.cos(a) * r, Math.sin(a) * r); } g.closePath(); g.fill(); }
  else if (kind === 'quote') { g.font = '900 30px I'; g.textAlign = 'center'; g.textBaseline = 'middle'; g.fillText('»', 0, 0); }
  else if (kind === 'mic') { g.beginPath(); rrp(g, 0, -5, -11, 10, 15, 5); g.fill(); g.beginPath(); g.arc(0, 1, 9, 0, Math.PI); g.stroke(); g.beginPath(); g.moveTo(0, 10); g.lineTo(0, 13); g.stroke(); }
  else { g.beginPath(); g.arc(0, 0, 7, 0, 6.29); g.fill(); }
  g.restore();
}
// píldora oscura con borde de color: [a,b) visible, (x,y) centro, o anclada a un Vector3
function pill(t, a, b, x, y, text, col = C.amber, ic = 'dot', size = 36) {
  if (!inn(t, a, b + .25)) return; let X = x, Y = y; if (x && x.isVector3) { const p = proj(x); if (!p.ok) return; X = p.x; Y = p.y + (y || 0); }
  const k = Math.max(.001, eback(P(t, a, .35))) * (1 - eout(P(t, b, .25)));
  g.save(); g.font = `800 ${size}px I`; const tw = g.measureText(text).width, iw = ic ? size * 1.05 : 0, w = tw + iw + size * 1.3, h = size * 1.75;
  X = clamp(X, w / 2 + 30, W - w / 2 - 30); Y = clamp(Y, 380, 1640);
  g.translate(X, Y); g.scale(k, k); g.globalAlpha = clamp(P(t, a, .12));
  g.shadowColor = 'rgba(0,0,0,.35)'; g.shadowBlur = 18; g.shadowOffsetY = 6; g.fillStyle = 'rgba(20,20,26,.9)'; rrp(g, 0, -w / 2, -h / 2, w, h, 14); g.fill(); g.shadowColor = 'transparent';
  g.lineWidth = 3; g.strokeStyle = col; g.stroke();
  if (ic) icon(-w / 2 + size * .65 + iw * .3, 0, ic, col);
  g.fillStyle = col; g.textAlign = 'left'; g.textBaseline = 'middle'; g.fillText(text, -w / 2 + size * .65 + iw, 2); g.restore();
}
// palabra golpe grande: parts = [[texto, color], ...]
function punch(t, a, b, parts, x = 540, y = 1180, o = {}) {
  if (!inn(t, a, b + .2)) return; const size = o.size || 120; const k = Math.max(.001, eback(P(t, a, .3))) * (1 - eout(P(t, b, .2)));
  g.save(); g.translate(x, y); g.rotate(o.rot || 0); g.scale(k * (o.stamp ? lerp(1.6, 1, eout(P(t, a, .25))) : 1), k * (o.stamp ? lerp(1.6, 1, eout(P(t, a, .25))) : 1));
  g.font = `900 ${size}px I`; g.textBaseline = 'middle'; g.lineJoin = 'round';
  const ws = parts.map(p => g.measureText(p[0]).width), sp = size * .25, tw = ws.reduce((s, v) => s + v, 0) + sp * (parts.length - 1);
  if (o.stamp) { g.lineWidth = 10; g.strokeStyle = o.stamp; g.fillStyle = hexA(o.stamp, .92); rrp(g, 0, -tw / 2 - 40, -size * .72, tw + 80, size * 1.44, 18); g.fill(); g.strokeStyle = 'rgba(255,255,255,.9)'; g.lineWidth = 6; rrp(g, 0, -tw / 2 - 28, -size * .6, tw + 56, size * 1.2, 12); g.stroke(); }
  let cx = -tw / 2; parts.forEach((p, i) => { g.textAlign = 'left'; if (!o.stamp) { g.shadowColor = 'rgba(0,0,0,.45)'; g.shadowBlur = 20; g.shadowOffsetY = 8; g.lineWidth = size * .16; g.strokeStyle = 'rgba(18,20,34,.9)'; g.strokeText(p[0], cx, 4); g.shadowColor = 'transparent'; } g.fillStyle = p[1]; g.fillText(p[0], cx, 4); cx += ws[i] + sp; });
  g.restore();
}
const hexA = (h, a) => { const n = parseInt(h.slice(1), 16); return `rgba(${n >> 16},${(n >> 8) & 255},${n & 255},${a})`; };
// panel oscuro con título (explicaciones)
function panel(t, a, b, x, y, w, h, title, tcol, body) {
  if (!inn(t, a, b + .25)) return; const k = eout(P(t, a, .35)) * (1 - eout(P(t, b, .25)));
  g.save(); g.globalAlpha = k; g.translate(x, y + (1 - k) * 40); g.shadowColor = 'rgba(0,0,0,.4)'; g.shadowBlur = 30; g.fillStyle = 'rgba(14,16,24,.9)'; rrp(g, 0, -w / 2, -h / 2, w, h, 22); g.fill(); g.shadowColor = 'transparent';
  if (title) { g.font = '800 30px I'; g.fillStyle = tcol || C.amber; g.textAlign = 'left'; g.textBaseline = 'middle'; g.fillText(title, -w / 2 + 30, -h / 2 + 42); }
  body(g, w, h, P(t, a, 1e-9)); g.restore();
}
// tarjeta de papel (documentos)
function paper(t, a, b, x, y, w, h, body, rot = -.03) {
  if (!inn(t, a, b + .25)) return; const k = Math.max(.001, eback(P(t, a, .4))) * (1 - eout(P(t, b, .25)));
  g.save(); g.translate(x, y); g.rotate(rot); g.scale(k, k); g.shadowColor = 'rgba(0,0,0,.35)'; g.shadowBlur = 26; g.shadowOffsetY = 10; g.fillStyle = '#fbf8ef'; rrp(g, 0, -w / 2, -h / 2, w, h, 10); g.fill(); g.shadowColor = 'transparent';
  body(g, w, h); g.restore();
}
// medidor tipo "TU BALCÓN AGUANTA 200 kg/m²"
function meter(t, a, b, x, y, label, value, col, fill = 1) {
  panel(t, a, b, x, y, 420, 150, null, null, (g, w, h) => {
    g.font = '700 22px I'; g.fillStyle = 'rgba(255,255,255,.7)'; g.textAlign = 'left'; g.textBaseline = 'middle'; g.fillText(label, -w / 2 + 24, -h / 2 + 34);
    g.font = '900 54px I'; g.fillStyle = col; g.fillText(value, -w / 2 + 24, 8);
    const f = clamp(fill) * eout(P(t, a + .2, .8)); g.fillStyle = 'rgba(255,255,255,.12)'; rrp(g, 0, -w / 2 + 24, h / 2 - 30, w - 48, 10, 5); g.fill();
    const gr = g.createLinearGradient(-w / 2, 0, w / 2, 0); gr.addColorStop(0, '#3ddc84'); gr.addColorStop(.55, '#ffb020'); gr.addColorStop(1, '#ff4d4d'); g.fillStyle = gr; rrp(g, 0, -w / 2 + 24, h / 2 - 30, Math.max(10, (w - 48) * f), 10, 5); g.fill();
  });
}
// tarjeta final de pregunta con opciones
function question(t, a, q, opts, y = 1300) {
  if (t < a) return; const k = eout(P(t, a, .45));
  g.save(); g.globalAlpha = k; g.translate(540, y + (1 - k) * 60); const w = 900;
  g.font = '800 40px I'; const qh = 96;
  g.shadowColor = 'rgba(0,0,0,.35)'; g.shadowBlur = 28; g.fillStyle = '#ffffff'; rrp(g, 0, -w / 2, -qh / 2, w, qh, 26); g.fill(); g.shadowColor = 'transparent';
  g.fillStyle = '#4aa8ff'; g.beginPath(); g.arc(-w / 2 + 52, 0, 20, 0, 6.29); g.fill(); g.beginPath(); g.moveTo(-w / 2 + 40, 12); g.lineTo(-w / 2 + 36, 26); g.lineTo(-w / 2 + 54, 16); g.fill();
  g.fillStyle = '#16161c'; g.textAlign = 'left'; g.textBaseline = 'middle'; g.fillText(q, -w / 2 + 92, 2);
  g.font = '700 30px I'; let cx = -w / 2, cy = qh / 2 + 52;
  opts.forEach((o, i) => { const kk = eback(P(t, a + .35 + i * .22, .35)); const ow = g.measureText(o).width + 52; if (cx + ow > w / 2) { cx = -w / 2; cy += 76; } g.save(); g.translate(cx + ow / 2, cy); g.scale(Math.max(.001, kk), Math.max(.001, kk)); g.fillStyle = 'rgba(20,20,26,.92)'; rrp(g, 0, -ow / 2, -30, ow, 60, 30); g.fill(); g.fillStyle = '#fff'; g.textAlign = 'center'; g.fillText(o, 0, 2); g.restore(); cx += ow + 16; });
  g.restore();
}
// plumas/partículas ambientales en 2D (cayendo, girando)
function floaters(t, n = 14, col = 'rgba(255,255,255,.85)', kind = 'leaf') {
  for (let i = 0; i < n; i++) {
    const sp = 40 + (i * 37) % 50, x0 = (i * 211) % W, ph = i * 1.7; const y = ((t * sp + i * 271) % (H + 200)) - 100; const x = x0 + Math.sin(t * .8 + ph) * 60; const r = Math.sin(t * 1.3 + ph) * 1.2;
    g.save(); g.translate(x, y); g.rotate(r); g.globalAlpha = .75; g.fillStyle = col;
    if (kind === 'leaf') { g.beginPath(); g.ellipse(0, 0, 26, 7, 0, 0, 6.29); g.fill(); g.strokeStyle = 'rgba(120,120,130,.5)'; g.lineWidth = 1.5; g.beginPath(); g.moveTo(-24, 0); g.lineTo(24, 0); g.stroke(); }
    else if (kind === 'dust') { g.beginPath(); g.arc(0, 0, 4 + (i % 3) * 2, 0, 6.29); g.fill(); }
    else if (kind === 'drop') { g.beginPath(); g.moveTo(0, -12); g.quadraticCurveTo(10, 4, 0, 10); g.quadraticCurveTo(-10, 4, 0, -12); g.fill(); }
    g.restore();
  }
}
// cota / línea de medida
function dimLine(t, a, b, p0, p1, text, col = '#ffffff') { if (!inn(t, a, b)) return; const A = proj(p0), B = proj(p1); const k = eout(P(t, a, .4)); g.save(); g.strokeStyle = col; g.fillStyle = col; g.lineWidth = 3; g.beginPath(); g.moveTo(A.x, A.y); g.lineTo(lerp(A.x, B.x, k), lerp(A.y, B.y, k)); g.stroke(); g.font = '800 34px I'; g.textAlign = 'center'; g.textBaseline = 'middle'; g.shadowColor = 'rgba(0,0,0,.6)'; g.shadowBlur = 8; if (k > .9) g.fillText(text, (A.x + B.x) / 2 + 50, (A.y + B.y) / 2); g.restore(); }
// ================= GRIETAS: ¿CUÁLES SON PELIGROSAS? =================
const DISC = 'Recreación ilustrativa · ante la duda, consulta a un profesional';
const KW = { pared: T('pared'), pintura1: T('pintura'), avisandote: T('avisándote'), facil: T('fácil'), ancho: T('ancho'), pelo: T('pelo'), panete: T('pañete'), grave: T('grave'), direccion: T('dirección'), diagonal: T('diagonal'), escalerita: T('escalerita'), blocks: T('blocks'), preocupan: T('preocupan'), estructura: T('estructura'), moviendo: T('moviendo'), horizontales: T('horizontales'), verticales: T('verticales'), susc: T('suscríbete'), crece: T('crece'), lapiz: T('lápiz'), puntas: T('puntas'), fecha: T('fecha'), semanas: T('semanas'), raya: T('raya'), creciendo1: T('creciendo'), alarmas: T('alarmas'), milimetros: T('milímetros'), creciendo2: T('creciendo', 2), puertas: T('puertas'), pisos: T('pisos'), tapes: T('tapes'), ingeniero: T('ingeniero'), coment: T('comentarios') };
// ---------- casa ----------
add(road(0, 12, 120)); [[-14, -6, 5, 4, 3, 0xe8d7b0], [14, -6, 5, 4, 4, 0xd9c9a6], [-24, -9, 5, 3, 6, 0xf0e0c0], [24, -10, 5, 3, 5, 0xe2d2b0]].forEach(b => building(...b));
[[-8.5, 5], [8.5, 5.5], [-11, 2], [11, 2]].forEach(([x, z]) => tree(x, z, 1.3));
add(box(12, .25, 3.5, 0xc9c4b8)).position.set(0, .12, 5.2);
const HOUSE = add(new THREE.Group());
{ const b = box(10, 4, 7, 0xefe3c8); b.position.set(0, 2, 0); HOUSE.add(b); const roof = box(10.6, .35, 7.6, 0xb9b2a4); roof.position.set(0, 4.17, 0); HOUSE.add(roof);
  const win = box(1.6, 1.3, .1, 0xf4f4f0); win.position.set(-3.3, 2.3, 3.55); const wg = box(1.4, 1.1, .1, lp(0x23406e, { roughness: .3 })); wg.position.set(-3.3, 2.3, 3.6); HOUSE.add(win, wg);
  const df = box(1.25, 2.45, .12, 0xf4f4f0); df.position.set(3.1, 1.22, 3.55); HOUSE.add(df); const dk = box(1.05, 2.3, .1, 0x1d2029); dk.position.set(3.1, 1.15, 3.57); HOUSE.add(dk); }
const DOOR = new THREE.Group(); DOOR.position.set(2.58, 0, 3.66); add(DOOR); { const d = box(1.04, 2.28, .08, 0x8a5a34); d.position.set(.52, 1.15, 0); const kn = sph(.05, 0xffd23a); kn.position.set(.92, 1.1, .07); DOOR.add(d, kn); }
// textura de la fachada (grietas dibujadas)
const S = 153.6, WT = canvasTex(1536, 615); const face = add(M(new THREE.PlaneGeometry(10, 4), new THREE.MeshStandardMaterial({ map: WT.tx, roughness: .9, transparent: true }), false)); face.position.set(0, 2, 3.505);
const wx = X => (X + 5) * S, wy = Y => (4 - Y) * S;
let sd = 3; const r2 = () => (sd = (sd * 16807) % 2147483647) / 2147483647;
function jag(pts, n, amp) { const out = []; for (let i = 0; i < pts.length - 1; i++) { const [a, b] = [pts[i], pts[i + 1]]; for (let k = 0; k < n; k++) { const f = k / n; out.push([lerp(a[0], b[0], f) + (k ? (r2() - .5) * amp : 0), lerp(a[1], b[1], f) + (k ? (r2() - .5) * amp : 0)]); } } out.push(pts[pts.length - 1]); return out; }
const CR = { main: jag([[-.8, 3.1], [.6, 1.4]], 18, .08), hair: jag([[-.5, 2.6], [.1, 2.45], [.6, 2.3]], 14, .05), diag: jag([[-1.3, 3.3], [1.0, 1.0]], 22, .1), horiz: jag([[-2.2, 1.6], [1.6, 1.66]], 26, .05), vert: jag([[2.0, 3.6], [2.05, 1.7]], 16, .05), grow: jag([[-.7, 3.0], [.3, 2.05], [.95, 1.45]], 14, .07), wide: jag([[-1.6, 3.5], [-.6, 2.4], [.2, 1.2]], 16, .1) };
const STAIR = (() => { const p = [[1.6, 3.6]]; let x = 1.6, y = 3.6; for (let i = 0; i < 6; i++) { y -= .2; p.push([x, y]); x -= .2 * (i % 2 ? 1 : 2); p.push([x, y]); } return p; })();
function stroke(x, pts, prog, w, col) { const n = Math.max(1, Math.floor((pts.length - 1) * clamp(prog))); if (prog <= 0) return; x.strokeStyle = col; x.lineWidth = w; x.lineJoin = 'round'; x.lineCap = 'round'; x.beginPath(); x.moveTo(wx(pts[0][0]), wy(pts[0][1])); for (let i = 1; i <= n; i++) x.lineTo(wx(pts[i][0]), wy(pts[i][1])); const f = (pts.length - 1) * clamp(prog) - n; if (n < pts.length - 1 && f > 0) x.lineTo(wx(lerp(pts[n][0], pts[n + 1][0], f)), wy(lerp(pts[n][1], pts[n + 1][1], f))); x.stroke(); }
function crack(x, pts, prog, w, hl) { if (hl) stroke(x, pts, prog, w + 16, hl); stroke(x, pts, prog, w + 2, 'rgba(120,100,70,.5)'); stroke(x, pts, prog, w, '#3b2f22'); }
function drawWall(t) {
  const x = WT.x; x.fillStyle = '#efe3c8'; x.fillRect(0, 0, 1536, 615);
  const blocks = inn(t, KW.escalerita - .4, PS(12)); if (blocks) { x.strokeStyle = `rgba(150,130,100,${.5 * eout(P(t, KW.escalerita - .4, .5))})`; x.lineWidth = 2; for (let r = 0; r < 20; r++) { const y = wy(r * .2); x.beginPath(); x.moveTo(0, y); x.lineTo(1536, y); x.stroke(); for (let c = 0; c < 26; c++) { const xx = wx(-5 + c * .4 + (r % 2) * .2); x.beginPath(); x.moveTo(xx, y); x.lineTo(xx, y - .2 * S); x.stroke(); } } }
  if (t < PS(3)) crack(x, CR.main, eout(P(t, .2, 1.4)), 4);
  else if (t < PS(8)) crack(x, CR.hair, eout(P(t, PS(3), .8)), 1.0);
  else if (t < PS(12)) { crack(x, CR.diag, eout(P(t, KW.diagonal - .3, 1)), 5, inn(t, KW.diagonal - .3, KW.escalerita - .3) ? 'rgba(255,77,77,.35)' : null); crack(x, STAIR, eout(P(t, KW.escalerita - .3, 1.2)), 5, inn(t, KW.escalerita - .3, PS(11)) ? 'rgba(255,77,77,.35)' : null); }
  else if (t < PS(14)) { crack(x, CR.horiz, eout(P(t, KW.horizontales - .3, 1)), 5, inn(t, KW.horizontales - .3, KW.verticales) ? 'rgba(255,77,77,.4)' : null); crack(x, CR.vert, eout(P(t, KW.verticales - .3, .8)), 4, inn(t, KW.verticales - .3, PS(13)) ? 'rgba(74,168,255,.4)' : null); }
  else {
    const grown = eout(P(t, KW.raya - .3, 1.2)); const base = 2 / 3; crack(x, CR.grow, t < KW.raya - .3 ? eout(P(t, PS(14), .8)) * base : base + grown * (1 - base), 4, t > KW.raya ? 'rgba(255,77,77,.3)' : null);
    if (t > KW.puntas - .2) { const pts = [CR.grow[0], CR.grow[Math.floor((CR.grow.length - 1) * base)]]; x.strokeStyle = '#1f4fd1'; x.lineWidth = 5; for (const [X, Y] of pts) { const k = eout(P(t, KW.puntas - .2, .4)); x.beginPath(); x.moveTo(wx(X) - 26 * k, wy(Y) - 10); x.lineTo(wx(X) + 26 * k, wy(Y) + 10); x.stroke(); } }
    if (t > KW.fecha - .2) { x.save(); x.globalAlpha = eout(P(t, KW.fecha - .2, .4)); x.fillStyle = '#1f4fd1'; x.font = '700 34px I'; x.fillText('21/11', wx(-.55), wy(3.05)); x.restore(); }
    if (t >= PS(19)) crack(x, CR.wide, eout(P(t, KW.milimetros - .6, 1.1)), 16, inn(t, KW.milimetros - .4, PS(21)) ? 'rgba(255,77,77,.35)' : null);
  }
  WT.tx.needsUpdate = true;
}
// ---------- utilería ----------
const RULER = add(texPlane(1.6, .22, 512, 70, (x, w, h) => { x.fillStyle = '#ffd23a'; x.fillRect(0, 0, w, h); x.fillStyle = '#1a1a1a'; for (let i = 0; i <= 50; i++) { const xx = 10 + i * 9.8; x.fillRect(xx, 0, 2, i % 10 ? (i % 5 ? 16 : 24) : 34); } x.font = '700 18px I'; for (let i = 0; i <= 5; i++) x.fillText(String(i), 6 + i * 98, 58); }, false));
const CALIP = add(texPlane(1.2, .5, 360, 150, (x, w, h) => { x.fillStyle = '#1d2029'; rrp(x, 0, 0, 0, w, h, 18); x.fill(); x.fillStyle = '#ff4d4d'; x.font = '900 70px I'; x.textAlign = 'center'; x.textBaseline = 'middle'; x.fillText('> 5 mm', w / 2, h / 2 + 4); }));
const PENCIL = add(new THREE.Group()); { const b = cyl(.06, .06, 1.1, 0xffc21a, 6); b.rotation.z = Math.PI / 2; const tip = M(new THREE.ConeGeometry(.06, .18, 6), lp(0xf1d4a8)); tip.rotation.z = Math.PI / 2; tip.position.x = -.64; const er = cyl(.062, .062, .12, 0xff8aa0, 8); er.rotation.z = Math.PI / 2; er.position.x = .6; PENCIL.add(b, tip, er); }
const CAL = add(new THREE.Group()); const CALT = canvasTex(256, 300); { const b = box(1.3, 1.5, .08, 0xffffff); const top = box(1.3, .3, .1, 0xff4d4d); top.position.y = .62; const pg = M(new THREE.PlaneGeometry(1.2, 1.15), new THREE.MeshBasicMaterial({ map: CALT.tx, toneMapped: false }), false); pg.position.set(0, -.1, .05); CAL.add(b, top, pg); }
function drawCal(n) { const x = CALT.x; x.fillStyle = '#fff'; x.fillRect(0, 0, 256, 300); x.fillStyle = '#1d2029'; x.font = '800 40px I'; x.textAlign = 'center'; x.fillText('SEMANA', 128, 80); x.font = '900 150px I'; x.fillText(String(n), 128, 240); CALT.tx.needsUpdate = true; }
const LEVEL = add(new THREE.Group()); const LVB = sph(.06, lp(0x9ff07a, { emissive: 0x2a5a10 })); { const b = box(1.8, .18, .22, 0x2b5fd0); const vial = box(.5, .1, .1, lp(0xd8ffd0, { transparent: true, opacity: .6 })); vial.position.set(0, .1, .06); LEVEL.add(b, vial, LVB); }
const MARBLE = add(sph(.12, lp(0x4aa8ff, { roughness: .2 })));
const ROLLER = add(new THREE.Group()); { const r = cyl(.18, .18, .8, 0xffffff, 16); r.rotation.z = Math.PI / 2; const h = box(.06, 1.0, .06, 0x9aa0aa); h.position.y = -.55; const hd = cyl(.06, .06, .6, 0xff4d4d, 8); hd.position.y = -1.3; ROLLER.add(r, h, hd); }
const HELMET = add(new THREE.Group()); { const d = M(new THREE.SphereGeometry(.45, 24, 12, 0, Math.PI * 2, 0, Math.PI / 2), lp(0xffcc33, { roughness: .35 })); const br = cyl(.58, .58, .05, 0xffcc33); HELMET.add(d, br); }
const CLIPB = add(new THREE.Group()); { const b = box(.8, 1.05, .05, 0x8a6a48); const p = texPlane(.7, .9, 140, 180, (x, w, h) => { x.fillStyle = '#fff'; x.fillRect(0, 0, w, h); x.fillStyle = '#1d2029'; x.font = '800 18px I'; x.fillText('REVISIÓN', 16, 28); for (let i = 0; i < 5; i++) { x.fillStyle = '#3ddc84'; x.fillRect(16, 50 + i * 24, 12, 12); x.fillStyle = '#9aa0aa'; x.fillRect(36, 52 + i * 24, 80, 7); } }); p.position.z = .03; CLIPB.add(b, p); }
// ---------- tomas ----------
SHOTS = [
  [0, PS(2), [0, 2.7, 15.5], [0, 2.5, 12.5], [0, 2.2, 3.5], [0, 2.3, 3.5]],
  [PS(2), PS(3), [-6, 4, 16], [6, 4, 16], [0, 2, 3.5], [0, 2, 3.5]],
  [PS(3), PS(8), [.1, 2.5, 8.2], [.05, 2.5, 7.2], [.05, 2.45, 3.5], [.05, 2.45, 3.5]],
  [PS(8), PS(12), [-.4, 2.4, 12.5], [.2, 2.4, 11.5], [.1, 2.3, 3.5], [.2, 2.3, 3.5]],
  [PS(12), PS(14), [-.2, 2.7, 14.5], [.2, 2.7, 14], [0, 2.4, 3.5], [0, 2.4, 3.5]],
  [PS(14), PS(19), [.4, 2.6, 10.5], [.3, 2.5, 9.5], [.1, 2.3, 3.5], [.1, 2.3, 3.5]],
  [PS(19), PS(22), [-.8, 2.7, 11], [-.4, 2.6, 10], [-.6, 2.3, 3.5], [-.5, 2.3, 3.5]],
  [PS(22), PS(23), [4.6, 2.2, 9.5], [4.2, 2.0, 8.5], [2.8, 1.1, 3.5], [2.8, 1.0, 3.5]],
  [PS(23), PS(25), [0, 3, 11], [0, 2.8, 9.5], [0, 2.2, 3.5], [0, 2.2, 3.5]],
  [PS(25), END, [0, 4.2, 19], [0, 4.6, 20.5], [0, 2.6, 3.5], [0, 2.6, 3.5]]
];
SHAKE = [[KW.moviendo - .3, KW.moviendo + .6, .05], [KW.alarmas, KW.alarmas + .5, .05]];
function animWorld(t) {
  sunAt(0, 0, 3, 14); drawWall(t);
  RULER.visible = inn(t, KW.ancho - .2, PS(8)); if (RULER.visible) { RULER.position.set(.05, 2.18, 3.56); RULER.rotation.z = -.05; pop(RULER, t, KW.ancho - .2, .4, PS(8) - .3); }
  CALIP.visible = inn(t, KW.milimetros - .3, PS(21)); if (CALIP.visible) { CALIP.position.set(-1.3, 1.6, 3.7); pop(CALIP, t, KW.milimetros - .3, .4, PS(21) - .3); }
  PENCIL.visible = inn(t, KW.lapiz - .3, KW.fecha + 1.4); if (PENCIL.visible) { const g0 = CR.grow[0], g1 = CR.grow[Math.floor((CR.grow.length - 1) * 2 / 3)]; let p = V(1.6, 1.6, 3.9); if (t > KW.puntas - .5) { const k = eio(P(t, KW.puntas - .5, .5)); p = V(lerp(1.6, g0[0] + .65, k), lerp(1.6, g0[1], k), 3.75); } if (t > KW.puntas + .3) { const k = eio(P(t, KW.puntas + .3, .5)); p = V(lerp(g0[0], g1[0], k) + .65, lerp(g0[1], g1[1], k), 3.75); } if (t > KW.fecha - .4) { const k = eio(P(t, KW.fecha - .4, .5)); p = V(lerp(g1[0] + .65, .2, k), lerp(g1[1], 3.05, k), 3.75); } PENCIL.position.copy(p); PENCIL.rotation.set(0, 0, -.5 + Math.sin(t * 12) * .05); pop(PENCIL, t, KW.lapiz - .3, .4, KW.fecha + 1.1); }
  CAL.visible = inn(t, KW.semanas - .3, PS(19)); if (CAL.visible) { CAL.position.set(1.15, 3.0, 3.8); pop(CAL, t, KW.semanas - .3, .4, PS(19) - .3); drawCal(1 + Math.min(2, Math.floor(P(t, KW.semanas, 1.2) * 3))); }
  // puerta que no cierra
  DOOR.rotation.y = inn(t, KW.puertas - .3, KW.pisos) ? -(.35 + .25 * Math.abs(Math.sin((t - KW.puertas) * 3))) : 0;
  LEVEL.visible = inn(t, KW.pisos - .3, PS(23)); if (LEVEL.visible) { LEVEL.position.set(2.0, .38, 4.6); LEVEL.rotation.z = .07; LVB.position.set(lerp(0, .2, eout(P(t, KW.pisos, .6))), .12, .06); pop(LEVEL, t, KW.pisos - .3, .4, PS(23) - .2); }
  MARBLE.visible = inn(t, KW.pisos, PS(23)); if (MARBLE.visible) { const k = P(t, KW.pisos, 1.8); MARBLE.position.set(lerp(1.0, 3.6, k * k), .37, 4.25); }
  ROLLER.visible = inn(t, KW.tapes - .3, PS(24)); if (ROLLER.visible) { ROLLER.position.set(-.2 + Math.sin(t * 6) * .3, 2.4, 3.85); pop(ROLLER, t, KW.tapes - .3, .4, PS(24) - .2); }
  HELMET.visible = CLIPB.visible = inn(t, KW.ingeniero - .3, END); if (HELMET.visible) { HELMET.position.set(-1.0, .3, 5.0); CLIPB.position.set(.9, .85, 5.0); CLIPB.rotation.x = -.4; pop(HELMET, t, KW.ingeniero - .3, .45); pop(CLIPB, t, KW.ingeniero, .45); }
}
// ---------- capa 2D ----------
function overlay2d(t) {
  floaters(t, 12, 'rgba(255,255,255,.75)', 'dust');
  punch(t, KW.pintura1 - .2, KW.avisandote - .2, [['¿PINTURA?', '#ffffff']], 540, 1320, { size: 96 });
  punch(t, KW.avisandote - .2, PS(2), [['¿O', '#ffffff'], ['AVISO?', C.red]], 540, 1320, { size: 96 });
  pill(t, KW.facil - .2, PS(3), 540, 1450, 'CASI NADIE LO SABE', C.amber, 'star');
  pill(t, PS(3), PS(5), 540, 1400, '1 · MIRA EL ANCHO', C.blue, 'dot');
  pill(t, KW.pelo - .3, PS(7), 540, 1400, 'FINITA COMO UN PELO', C.amber, 'dot');
  pill(t, KW.panete - .3, PS(7), 540, 1500, 'PINTURA O PAÑETE', C.blue, 'dot');
  pill(t, KW.grave - .3, PS(8), 540, 1400, 'NORMALMENTE NO ES GRAVE', C.green, 'check');
  pill(t, PS(8), PS(10), 540, 1400, '2 · MIRA LA DIRECCIÓN', C.blue, 'dot');
  pill(t, KW.diagonal - .2, KW.escalerita - .3, 540, 1420, 'EN DIAGONAL', C.red, 'warn');
  pill(t, KW.escalerita - .3, PS(11), 540, 1420, 'EN ESCALERITA POR LOS BLOCKS', C.red, 'warn');
  punch(t, KW.preocupan - .2, PS(11) + .3, [['PREOCUPAN', C.red]], 540, 1260, { size: 100 });
  pill(t, KW.estructura - .3, PS(12), 540, 1420, 'LA ESTRUCTURA SE PUEDE ESTAR MOVIENDO', C.red, 'warn', 29);
  pill(t, KW.horizontales - .2, PS(13), 540, 1380, 'HORIZONTAL: PREOCUPA MÁS', C.red, 'warn');
  pill(t, KW.verticales - .2, PS(13), 540, 1480, 'VERTICAL: SUELE SER MENOS', C.blue, 'dot');
  punch(t, KW.susc - .1, PE(13) + .2, [['¡SUSCRÍBETE!', '#ffffff']], 540, 1250, { stamp: '#ff2d3d', size: 92, rot: -.05 });
  pill(t, PS(14), PS(16), 540, 1420, '3 · MIRA SI CRECE', C.blue, 'dot');
  pill(t, KW.lapiz - .2, KW.fecha + .2, 540, 1420, 'MARCA LAS PUNTAS + FECHA', C.amber, 'check');
  pill(t, KW.semanas - .2, PS(18), 540, 1420, 'UNAS SEMANAS DESPUÉS…', C.amber, 'clock');
  punch(t, KW.creciendo1 - .3, PS(19), [['ESTÁ', '#ffffff'], ['CRECIENDO', C.red]], 540, 1300, { size: 92 });
  punch(t, KW.alarmas - .3, PS(20) - .1, [['ALARMAS', '#ffffff']], 540, 1280, { stamp: '#e02424', size: 96, rot: -.04 });
  pill(t, KW.milimetros - .3, PS(21), 540, 1450, 'MÁS DE 5 MILÍMETROS', C.red, 'warn');
  pill(t, PS(21), PS(22), 540, 1450, 'SIGUE CRECIENDO', C.red, 'warn');
  pill(t, KW.puertas - .2, KW.pisos - .2, 540, 1450, 'PUERTAS QUE NO CIERRAN', C.red, 'warn');
  pill(t, KW.pisos - .2, PS(23), 540, 1450, 'PISOS DESNIVELADOS', C.red, 'warn');
  pill(t, KW.tapes - .2, PS(24), 540, 1450, 'NO LA TAPES CON PINTURA', C.red, 'x');
  pill(t, KW.ingeniero - .3, PS(25), 540, 1450, 'LLAMA A UN INGENIERO', C.green, 'check');
  question(t, KW.coment, '¿De qué forma es tu grieta?', ['Finita como un pelo', 'Diagonal', 'En escalerita', 'Horizontal'], 1320);
}

// ---------- subtítulos ARRIBA (palabra actual con caja de selección azul) ----------
const STOP = new Set('a al como con de del el en es la las lo los me mi mis o para por que se si su sus te tu tus un una y ya le les no ni ese esa eso esto hay muy más mas qué cómo pero ahí aquí hasta este esta'.split(' '));
const CAP_Y = 300, CAP_FS = 46, CAP_MAX = 880;
const CHUNKS = (() => { const mc = document.createElement('canvas').getContext('2d'); mc.font = `800 ${CAP_FS}px I`; const out = []; let wi = 0;
  for (const ph of PH) { const n = ph.t.split(' ').length; let cur = [], cw = 0; for (let j = 0; j < n; j++, wi++) { const ww = mc.measureText(WORDS[wi].w).width + 14; if (cur.length && (cw + ww > CAP_MAX || cur.length >= 6)) { out.push(cur); cur = []; cw = 0; } cur.push(wi); cw += ww; } if (cur.length) out.push(cur); }
  return out; })();
function caption(t) {
  let i = -1; for (let k = 0; k < WORDS.length; k++) if (t >= WORDS[k].s - .04) i = k; if (i < 0) return;
  const ch = CHUNKS.find(c => c.includes(i)); const last = WORDS[ch[ch.length - 1]]; const nxt = WORDS[ch[ch.length - 1] + 1]; if (t > (nxt ? Math.min(nxt.s - .04, last.e + .7) : last.e + .8)) return;
  g.save(); g.textBaseline = 'middle'; g.textAlign = 'left';
  const items = ch.map(j => { const w = WORDS[j]; const s = norm(w.w); const key = !STOP.has(s); g.font = `${key ? 800 : 500} ${CAP_FS}px I`; return { j, w: w.w, key, wd: g.measureText(w.w).width }; });
  const sp = 13, tw = items.reduce((s, o) => s + o.wd, 0) + sp * (items.length - 1); let x = 540 - tw / 2; const k0 = eout(P(t, WORDS[ch[0]].s - .04, .18));
  g.globalAlpha = k0; g.translate(0, (1 - k0) * 10);
  for (const o of items) {
    const said = o.j <= i, cur = o.j === i; g.font = `${o.key ? 800 : 500} ${CAP_FS}px I`;
    g.shadowColor = 'rgba(0,0,0,.55)'; g.shadowBlur = 12; g.shadowOffsetY = 2;
    g.fillStyle = !said ? 'rgba(255,255,255,.42)' : o.key ? '#ffffff' : 'rgba(235,238,245,.82)'; g.fillText(o.w, x, CAP_Y);
    g.shadowColor = 'transparent';
    if (cur) { const kk = eout(P(t, WORDS[o.j].s - .04, .12)); const bx = x - 6, by = CAP_Y - CAP_FS * .62, bw = o.wd + 12, bh = CAP_FS * 1.24; g.globalAlpha = k0 * kk; g.strokeStyle = '#3d8bff'; g.lineWidth = 2.5; g.strokeRect(bx, by, bw, bh); g.fillStyle = 'rgba(61,139,255,.14)'; g.fillRect(bx, by, bw, bh); g.fillStyle = '#ffffff'; g.strokeStyle = '#3d8bff'; g.lineWidth = 2; for (const [hx, hy] of [[bx, by], [bx + bw, by], [bx, by + bh], [bx + bw, by + bh]]) { g.fillRect(hx - 5, hy - 5, 10, 10); g.strokeRect(hx - 5, hy - 5, 10, 10); } g.globalAlpha = k0; }
    x += o.wd + sp;
  }
  g.restore();
}
// ---------- marca de agua, aviso y cierre ----------
function watermark(t) {
  g.save(); g.globalAlpha = .7 * (1 - P(t, CTA_ST, .3)); g.font = '800 34px M'; const w = g.measureText(BRAND).width;
  const x = W - 40 - w - 66, y = 130; g.fillStyle = 'rgba(10,14,28,.42)'; rrp(g, 0, x - 12, y - 29, w + 90, 58, 29); g.fill();
  g.save(); g.beginPath(); g.arc(x + 20, y, 22, 0, 6.29); g.clip(); g.drawImage(MASCOT, x - 2, y - 22, 44, 44); g.restore();
  g.fillStyle = '#ffffff'; g.textBaseline = 'middle'; g.fillText(BRAND, x + 52, y + 2); g.restore();
}
function disclaimer(t) { if (t >= CTA_ST) return; g.save(); g.font = '500 24px I'; g.fillStyle = 'rgba(255,255,255,.55)'; g.shadowColor = 'rgba(0,0,0,.5)'; g.shadowBlur = 6; g.textAlign = 'left'; g.textBaseline = 'middle'; g.fillText(typeof DISC === 'function' ? DISC(t) : DISC, 56, 1560); g.restore(); }
function followCTA(t) {
  const st = CTA_ST; if (t < st) return; const a = P(t, st, .3);
  g.save(); g.fillStyle = `rgba(6,10,24,${.72 * a})`; g.fillRect(0, 0, W, H);
  const k = eback(P(t, st + .05, .45)); g.translate(540, 820); g.scale(k, k);
  g.save(); g.beginPath(); g.arc(0, 0, 190, 0, 6.29); g.fillStyle = '#ffcc33'; g.fill(); g.beginPath(); g.arc(0, 0, 176, 0, 6.29); g.clip(); g.drawImage(MASCOT, -176, -176, 352, 352); g.restore();
  g.textAlign = 'center'; g.textBaseline = 'middle'; g.lineJoin = 'round';
  let fs = 128; g.font = `900 ${fs}px I`; const mw = g.measureText(CTA.big).width; if (mw > 940) { fs = Math.floor(fs * 940 / mw); g.font = `900 ${fs}px I`; }
  g.lineWidth = 20 * fs / 128; g.strokeStyle = 'rgba(18,20,34,.95)'; g.strokeText(CTA.big, 0, 330); g.fillStyle = '#ffffff'; g.fillText(CTA.big, 0, 330);
  g.font = '800 56px I'; g.fillStyle = '#ffb020'; g.fillText(BRAND, 0, 450);
  const pb = .5 + .5 * Math.sin((t - st) * 6), bw = CTA.bw; g.fillStyle = CTA.col; rrp(g, 0, -bw / 2, 520, bw, 104, 52); g.fill(); g.lineWidth = 6; g.strokeStyle = `rgba(255,255,255,${.4 + .4 * pb})`; g.stroke();
  g.font = '900 50px I'; g.fillStyle = '#ffffff'; g.fillText(CTA.btn, 0, 574);
  g.font = '600 36px I'; g.fillStyle = 'rgba(255,255,255,.85)'; g.fillText('Más videos de cómo funcionan las cosas', 0, 700);
  g.restore();
}
// ---------- render ----------
function renderAt(t) {
  seed = 7 + Math.floor(t * 30) * 13;
  cloudsAt(t); camAt(t); animWorld(t);
  renderer.render(scene, cam);
  const b = blurAt(t); g.save(); if (b > .5) g.filter = `blur(${b.toFixed(1)}px)`; g.drawImage(glc, 0, 0, W, H); g.restore();
  const vg = g.createRadialGradient(540, 960, 700, 540, 960, 1350); vg.addColorStop(0, 'rgba(0,0,0,0)'); vg.addColorStop(1, 'rgba(0,0,0,.22)'); g.fillStyle = vg; g.fillRect(0, 0, W, H);
  if (t < CTA_ST) { overlay2d(t); caption(t); disclaimer(t); } watermark(t); followCTA(t);
  const fo = P(t, END - .3, .3); if (fo > 0) { g.fillStyle = `rgba(0,0,0,${fo})`; g.fillRect(0, 0, W, H); }
}
window.renderAt = renderAt; window.END = END;
window.frameJPG = (t, q = .92) => { renderAt(t); return out.toDataURL('image/jpeg', q).split(',')[1]; };
window.READY = true;
