// Reel 9:16 3D — Estilo C "Escalada 3D" (ref. referencias/estilo-escalada-balcon.mp4) — Modo avión
import * as THREE from 'three';

const W = 1600, H = 900, END = 519.24;   // END = última palabra + ~4,2 s (cierre 3,7 s)
const CTA_ST = END - 3.7;
const RS = .8;                           // escala del render 3D (los textos van a resolución completa)
const BRAND = 'Así funciona con Rai';
const YT = true;
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
const cam = new THREE.PerspectiveCamera(34, W / H, .05, 400);
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
  cam.position.copy(V(...s[2]).lerp(V(...s[3]), k)); cam.fov = s[6] || 34; cam.updateProjectionMatrix(); cam.lookAt(V(...s[4]).lerp(V(...s[5]), k));
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
function pill(t, a, b, x, y, text, col = C.amber, ic = 'dot', size = 30) {
  if (!inn(t, a, b + .25)) return; let X = x, Y = y; if (x && x.isVector3) { const p = proj(x); if (!p.ok) return; X = p.x; Y = p.y + (y || 0); }
  const k = Math.max(.001, eback(P(t, a, .35))) * (1 - eout(P(t, b, .25)));
  g.save(); g.font = `800 ${size}px I`; const tw = g.measureText(text).width, iw = ic ? size * 1.05 : 0, w = tw + iw + size * 1.3, h = size * 1.75;
  X = clamp(X, w / 2 + 30, W - w / 2 - 30); Y = clamp(Y, 170, H - 70);
  g.translate(X, Y); g.scale(k, k); g.globalAlpha = clamp(P(t, a, .12));
  g.shadowColor = 'rgba(0,0,0,.35)'; g.shadowBlur = 18; g.shadowOffsetY = 6; g.fillStyle = 'rgba(20,20,26,.9)'; rrp(g, 0, -w / 2, -h / 2, w, h, 14); g.fill(); g.shadowColor = 'transparent';
  g.lineWidth = 3; g.strokeStyle = col; g.stroke();
  if (ic) icon(-w / 2 + size * .65 + iw * .3, 0, ic, col);
  g.fillStyle = col; g.textAlign = 'left'; g.textBaseline = 'middle'; g.fillText(text, -w / 2 + size * .65 + iw, 2); g.restore();
}
// palabra golpe grande: parts = [[texto, color], ...]
function punch(t, a, b, parts, x = 800, y = 560, o = {}) {
  if (!inn(t, a, b + .2)) return; const size = o.size || 96; const k = Math.max(.001, eback(P(t, a, .3))) * (1 - eout(P(t, b, .2)));
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
function question(t, a, q, opts, y = 640) {
  if (t < a) return; const k = eout(P(t, a, .45));
  g.save(); g.globalAlpha = k; g.translate(800, y + (1 - k) * 60); const w = 1000;
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
// partículas instanciadas
function parts(n, c, r = .05, geo) { const m = new THREE.InstancedMesh(geo || new THREE.SphereGeometry(r, 6, 4), c.isMaterial ? c : new THREE.MeshBasicMaterial({ color: c }), n); m.frustumCulled = false; scene.add(m); return m; }
const tmp = new THREE.Object3D();
function setP(m, i, x, y, z, vis, s = 1, rot = 0) { tmp.position.set(x, y, z); tmp.rotation.set(rot, rot * .7, 0); tmp.scale.setScalar(vis ? s : .001); tmp.updateMatrix(); m.setMatrixAt(i, tmp.matrix); }
// ================= MODO AVIÓN: ¿CARGA MÁS RÁPIDO? (video largo 16:9) =================
const DISC = (t) => inn(t, PS(39), PS(56)) ? 'Fuentes: Samsung (consejos de carga) · El Diario NY (prueba de 4 a 11 min)'
  : inn(t, PS(73), PS(113)) ? 'Fuente: Apple — "¿Por qué iones de litio?" · Digital Trends (calor y voltaje)'
  : inn(t, PS(113), PS(139)) ? 'Fuentes: Electrical Safety First (64 cargadores) · prueba de 400 cargadores falsos (Applesfera)'
  : inn(t, PS(139), PS(163)) ? 'Fuentes: Apple (carga optimizada, iones de litio)' : 'Recreación ilustrativa · no está a escala';
const KW = { avion1: T('avión'), funciona1: T('funciona'), dure: T('dure'), dane: T('dañe'), truco1: T('truco'), error1: T('error'), noches1: T('noches'), cargador1: T('cargador'), tanque1: T('tanque'), manguera: T('manguera'), llave1: T('llave'), saliendo1: T('saliendo'), antena1: T('antena'), wifi1: T('wifi'), bluetooth1: T('bluetooth'), ubicacion: T('ubicación'), aplicaciones1: T('aplicaciones'), nube: T('nube'), mensajes1: T('mensajes'), pantalla1: T('pantalla'), energia1: T('energía'), famoso: T('famoso'), samsung: T('samsung'), cuatro1: T('cuatro'), empujoncito: T('empujoncito'), llamadas: T('llamadas'), apagalo1: T('apágalo'), veinte1: T('veinte'), emergencia: T('emergencia'), susc: T('suscríbete'), imaginacion: T('imaginación'), danado: T('dañado'), vaso1: T('vaso'), estresa: T('estresa'), calor1: T('calor'), defiende: T('defiende'), sol1: T('sol'), carro1: T('carro'), almohada1: T('almohada'), jugando1: T('jugando'), envejece: T('envejece'), voltaje: T('voltaje'), forro: T('forro'), miedo: T('miedo'), sesenta: T('sesenta'), uno_solo: T('solo'), cuatrocientos: T('cuatrocientos'), tres1: T('tres'), piezas: T('piezas'), incendio: T('incendio'), cable: T('cable'), puerto: T('puerto'), pared1: T('pared'), regleta: T('regleta'), computadora: T('computadora'), explotar: T('explotar'), optimizada1: T('optimizada'), rutina: T('rutina'), levantes: T('levantes'), android: T('android'), actívala: T('actívala'), mito: T('mito'), viejas: T('viejas'), quieras: T('quieras'), coment: T('comentarios') };
// ---------- utilidades de celular ----------
function phoneTex(w = 256, h = 512) { return canvasTex(w, h); }
function drawPhone(S, o) { // o: {pct, plane, off, charging, hot, missed, night, label}
  const x = S.x, w = S.c.width, h = S.c.height;
  if (o.off) { x.fillStyle = '#05070b'; x.fillRect(0, 0, w, h); S.tx.needsUpdate = true; return; }
  const gr = x.createLinearGradient(0, 0, 0, h); gr.addColorStop(0, o.night ? '#0b1530' : '#3a4fd8'); gr.addColorStop(1, o.night ? '#141a35' : '#8a4ad8'); x.fillStyle = gr; x.fillRect(0, 0, w, h);
  x.fillStyle = '#fff'; x.textAlign = 'center'; x.font = `700 ${w * .07}px I`; x.fillText(o.time || '9:41', w * .2, h * .06);
  if (o.plane) { x.save(); x.translate(w * .78, h * .045); x.rotate(-.6); x.fillStyle = '#ffb020'; x.beginPath(); x.moveTo(0, -16); x.lineTo(4, -4); x.lineTo(16, 2); x.lineTo(4, 3); x.lineTo(3, 12); x.lineTo(7, 15); x.lineTo(0, 13); x.lineTo(-7, 15); x.lineTo(-3, 12); x.lineTo(-4, 3); x.lineTo(-16, 2); x.lineTo(-4, -4); x.closePath(); x.fill(); x.restore(); }
  // batería grande
  const bw = w * .5, bh = h * .4, bx = (w - bw) / 2, by = h * .28; x.strokeStyle = '#fff'; x.lineWidth = w * .025; rrp(x, 0, bx, by, bw, bh, w * .05); x.stroke(); x.fillStyle = '#fff'; x.fillRect(w / 2 - bw * .18, by - h * .025, bw * .36, h * .025);
  const p = clamp(o.pct / 100), fh = (bh - w * .06) * p; x.fillStyle = o.hot ? '#ff4d4d' : p < .2 ? '#ff4d4d' : p < .8 ? '#3ddc84' : '#35c46f'; rrp(x, 0, bx + w * .03, by + bh - w * .03 - fh, bw - w * .06, Math.max(2, fh), w * .03); x.fill();
  x.fillStyle = '#fff'; x.font = `900 ${w * .16}px I`; x.fillText(Math.round(o.pct) + '%', w / 2, by + bh + h * .12);
  if (o.charging) { x.save(); x.translate(w / 2, by + bh / 2); x.fillStyle = 'rgba(255,255,255,.95)'; x.beginPath(); x.moveTo(6, -40); x.lineTo(-22, 6); x.lineTo(-2, 6); x.lineTo(-8, 40); x.lineTo(22, -8); x.lineTo(2, -8); x.closePath(); x.fill(); x.restore(); }
  if (o.label) { x.fillStyle = 'rgba(255,255,255,.85)'; x.font = `700 ${w * .06}px I`; x.fillText(o.label, w / 2, h * .9); }
  if (o.missed) { x.fillStyle = 'rgba(255,77,77,.95)'; rrp(x, 0, w * .08, h * .12, w * .84, h * .09, 14); x.fill(); x.fillStyle = '#fff'; x.font = `800 ${w * .06}px I`; x.fillText('Llamada perdida (3)', w / 2, h * .18); }
  S.tx.needsUpdate = true;
}
function makePhone(S, sc = 1) { const p = new THREE.Group(); const b = rbox(2.2, 4.4, .26, .08, lp(0x1d2029, { roughness: .35 })); p.add(b); const s = M(new THREE.PlaneGeometry(2.04, 4.22), new THREE.MeshBasicMaterial({ map: S.tx, toneMapped: false }), false); s.position.z = .15; p.add(s); p.scale.setScalar(sc); return p; }
function tubeAlong(pts, r, col) { const c = new THREE.CatmullRomCurve3(pts); return M(new THREE.TubeGeometry(c, 60, r, 8), lp(col)); }
function chargerBrick(col = 0xf4f4f4) { const g0 = new THREE.Group(); const b = rbox(.9, .9, .9, .1, lp(col)); const p1 = box(.06, .35, .14, 0xc9cdd4); p1.position.set(-.18, 0, -.58); const p2 = p1.clone(); p2.position.x = .18; g0.add(b, p1, p2); return g0; }
const iconSpr = (col, draw) => { const c = canvasTex(128, 128), x = c.x; x.fillStyle = col; x.beginPath(); x.arc(64, 64, 60, 0, 6.29); x.fill(); x.strokeStyle = '#fff'; x.fillStyle = '#fff'; x.lineWidth = 9; x.lineCap = 'round'; draw(x); c.tx.needsUpdate = true; return new THREE.SpriteMaterial({ map: c.tx, transparent: true, depthWrite: false }); };
const IC = {
  antena: iconSpr('#ef4444', x => { x.beginPath(); x.moveTo(64, 40); x.lineTo(64, 100); x.stroke(); for (const r of [18, 32]) { x.beginPath(); x.arc(64, 40, r, -2.4, -.75); x.stroke(); } }),
  wifi: iconSpr('#4aa8ff', x => { for (const r of [14, 30, 46]) { x.beginPath(); x.arc(64, 92, r, -2.4, -.75); x.stroke(); } x.beginPath(); x.arc(64, 92, 6, 0, 6.29); x.fill(); }),
  bt: iconSpr('#2b5fd0', x => { x.beginPath(); x.moveTo(44, 44); x.lineTo(84, 82); x.lineTo(64, 100); x.lineTo(64, 28); x.lineTo(84, 46); x.lineTo(44, 84); x.stroke(); }),
  gps: iconSpr('#ff8a3d', x => { x.beginPath(); x.arc(64, 54, 22, Math.PI, 0); x.lineTo(64, 102); x.closePath(); x.fill(); x.fillStyle = '#ff8a3d'; x.beginPath(); x.arc(64, 54, 9, 0, 6.29); x.fill(); }),
  apps: iconSpr('#a98bff', x => { for (let i = 0; i < 4; i++) { x.fillRect(38 + (i % 2) * 30, 38 + Math.floor(i / 2) * 30, 22, 22); } }),
  nube: iconSpr('#22c55e', x => { x.beginPath(); x.arc(52, 70, 18, 0, 6.29); x.arc(74, 62, 22, 0, 6.29); x.arc(88, 76, 14, 0, 6.29); x.fill(); x.fillRect(40, 72, 56, 16); }),
  msg: iconSpr('#16a34a', x => { x.beginPath(); rrp(x, 0, 32, 38, 64, 44, 12); x.fill(); x.beginPath(); x.moveTo(46, 80); x.lineTo(40, 98); x.lineTo(60, 82); x.fill(); }),
  pant: iconSpr('#ffb020', x => { x.beginPath(); rrp(x, 0, 44, 28, 40, 72, 8); x.stroke(); x.beginPath(); x.arc(64, 64, 10, 0, 6.29); x.fill(); })
};
const ICK = ['antena', 'wifi', 'bt', 'gps', 'apps', 'nube', 'msg', 'pant'];

// ---------- ZONA A: celular gigante + toma de corriente ----------
add(road(100, 12, 320)); [[-14, -12, 5, 3, 7, 0xe8d7b0], [16, -14, 5, 3, 9, 0xd9c9a6], [60, -14, 5, 3, 6, 0xf0e0c0], [140, -14, 5, 3, 8, 0xe2d2b0], [180, -14, 5, 3, 5, 0xe8d7b0], [225, -12, 5, 3, 6, 0xd9c9a6]].forEach(b => building(...b));
[[-9, 4], [9, 5], [30, 5], [52, 5], [70, 5], [108, 5], [130, 5], [150, 5], [172, 5], [190, 5], [214, 5]].forEach(([x, z]) => tree(x, z, 1.4));
add(box(14, .2, 8, 0xd9d4c8)).position.set(0, .1, 0);
const SA = phoneTex(); const PA = add(makePhone(SA, 1.4)); PA.position.set(0, 3.3, 0);
const WALL = add(box(3, 4.5, .6, 0xefe3c8)); WALL.position.set(4.6, 2.25, -.6); const OUT = add(box(.9, 1.3, .12, 0xffffff)); OUT.position.set(4.6, 2.2, -.24);
const BRK = add(chargerBrick()); BRK.position.set(4.6, 2.2, .3);
const CBL = add(tubeAlong([V(4.6, 2.2, .75), V(4.0, 1.0, 1.2), V(2.0, .45, 1.2), V(.4, .6, .6), V(0, .25, 0)], .07, 0xf4f4f4));
const PLANE = add(new THREE.Group()); { const m = lp(0xffffff, { roughness: .4 }); const f = M(new THREE.CapsuleGeometry(.35, 2.4, 6, 14), m); f.rotation.z = Math.PI / 2; const wng = box(.7, .08, 3.2, m); const tl = box(.5, .7, .08, lp(0xff4d4d)); tl.position.set(-1.3, .4, 0); const tw = box(.4, .06, 1.2, m); tw.position.set(-1.3, .1, 0); PLANE.add(f, wng, tl, tw); }
// ---------- ZONA B: el tanque con la llave ----------
const BX = 40; add(box(14, .2, 8, 0xd9d4c8)).position.set(BX, .1, 0);
const TANK = add(new THREE.Group()); TANK.position.set(BX, 0, 0);
{ const st = box(3.2, 1.2, 3.2, 0x9aa0aa); st.position.y = .6; const gl = M(new THREE.CylinderGeometry(1.7, 1.7, 4.2, 40, 1, true), new THREE.MeshStandardMaterial({ color: 0xcfe8ff, transparent: true, opacity: .28, roughness: .1, side: THREE.DoubleSide }), false); gl.position.y = 3.3; const rim = M(new THREE.TorusGeometry(1.72, .07, 8, 40), lp(0x6b7280)); rim.rotation.x = Math.PI / 2; rim.position.y = 5.4; const bot = cyl(1.75, 1.75, .12, 0x6b7280, 40); bot.position.y = 1.2; TANK.add(st, gl, rim, bot); }
const WATER = M(new THREE.CylinderGeometry(1.62, 1.62, 1, 40), new THREE.MeshStandardMaterial({ color: 0x2f8fe0, transparent: true, opacity: .75, roughness: .15 }), false); TANK.add(WATER);
const HOSE = add(tubeAlong([V(BX - 4, .3, 1.5), V(BX - 3.6, 4, 1.2), V(BX - 2.4, 6.6, .4), V(BX - .4, 6.4, 0), V(BX - .2, 5.9, 0)], .14, 0x22a447));
const SPOUT = add(tubeAlong([V(BX + 1.6, 1.6, 0), V(BX + 2.6, 1.6, 0), V(BX + 2.9, 1.3, 0)], .16, 0x9aa0aa));
const VALVE = add(new THREE.Group()); { const st = cyl(.06, .06, .5, 0x6b7280); st.position.y = .25; const wh = M(new THREE.TorusGeometry(.35, .06, 8, 24), lp(0xe02424)); wh.rotation.x = Math.PI / 2; wh.position.y = .5; const sp = box(.7, .05, .06, 0xe02424); sp.position.y = .5; const sp2 = sp.clone(); sp2.rotation.y = Math.PI / 2; VALVE.add(st, wh, sp, sp2); } VALVE.position.set(BX + 2.2, 1.75, 0);
const INFLOW = parts(30, new THREE.MeshBasicMaterial({ color: 0x8fd0ff, transparent: true, opacity: .85 }), .09);
const OUTFLOW = parts(30, new THREE.MeshBasicMaterial({ color: 0x8fd0ff, transparent: true, opacity: .85 }), .08);
const LEAKS = []; for (let i = 0; i < 16; i++) { const s = new THREE.Sprite(IC[ICK[i % 8]]); s.scale.set(.7, .7, 1); add(s); LEAKS.push(s); }
// ---------- ZONA C: carrera de carga + batería gigante + vaso ----------
const CX = 80; add(box(16, .2, 8, 0xd9d4c8)).position.set(CX, .1, 0);
const SC1 = phoneTex(), SC2 = phoneTex(); const PC1 = add(makePhone(SC1, 1.0)); PC1.position.set(CX - 1.8, 2.5, 0); const PC2 = add(makePhone(SC2, 1.0)); PC2.position.set(CX + 1.8, 2.5, 0);
for (const p of [PC1, PC2]) { const pd = add(box(1.8, .3, 1.2, 0x9aa0aa)); pd.position.set(p.position.x, .25, 0); }
const BAT = add(new THREE.Group()); BAT.position.set(CX + 30, 0, 0);
{ const shell = M(new THREE.CapsuleGeometry(1.3, 3.4, 8, 24), new THREE.MeshStandardMaterial({ color: 0xffffff, transparent: true, opacity: .22, roughness: .1 }), false); shell.position.y = 3.2; const cap = cyl(.55, .55, .45, 0x6b7280, 20); cap.position.y = 5.75; const base = cyl(1.6, 1.8, .3, 0x9aa0aa, 30); base.position.y = .15; BAT.add(shell, cap, base); }
const BFILL = M(new THREE.CylinderGeometry(1.12, 1.12, 1, 32), lp(0x3ddc84, { emissive: 0x0a5a2a, emissiveIntensity: .5 }), false); BAT.add(BFILL);
const MARK80 = M(new THREE.TorusGeometry(1.33, .04, 6, 40), lp(0xffb020, { emissive: 0x664400 })); MARK80.rotation.x = Math.PI / 2; MARK80.position.y = 1.1 + 4.1 * .8; BAT.add(MARK80);
const GLASS = add(new THREE.Group()); GLASS.position.set(CX + 34, 0, 1); { const g0 = M(new THREE.CylinderGeometry(.9, .75, 2.4, 32, 1, true), new THREE.MeshStandardMaterial({ color: 0xe6f6ff, transparent: true, opacity: .3, side: THREE.DoubleSide }), false); g0.position.y = 1.4; const bt = cyl(.75, .75, .1, lp(0xe6f6ff, { transparent: true, opacity: .5 }), 32); bt.position.y = .25; GLASS.add(g0, bt); }
const GW = M(new THREE.CylinderGeometry(.8, .72, 1, 32), new THREE.MeshStandardMaterial({ color: 0x2f8fe0, transparent: true, opacity: .75 }), false); GLASS.add(GW);
const POUR = parts(20, new THREE.MeshBasicMaterial({ color: 0x8fd0ff, transparent: true, opacity: .85 }), .07);
const JUG = add(new THREE.Group()); { const j = cyl(.45, .55, 1.1, lp(0x4aa8ff, { transparent: true, opacity: .8 }), 20); const sp = M(new THREE.ConeGeometry(.15, .4, 10), lp(0x4aa8ff)); sp.rotation.z = -1.6; sp.position.set(.55, .35, 0); JUG.add(j, sp); } JUG.position.set(CX + 33, 3.6, 1); JUG.rotation.z = -.7;
// ---------- ZONA D: el calor ----------
const DX = 120; add(box(16, .2, 9, 0xe7d9c0)).position.set(DX, .1, 0);
const SD = phoneTex(); const PD = add(makePhone(SD, 1.0)); PD.position.set(DX, 2.6, 0);
const HEAT = add(new THREE.Sprite(new THREE.SpriteMaterial({ color: 0xff4020, transparent: true, opacity: 0, depthWrite: false }))); { const t2 = canvasTex(128, 128), x = t2.x, gr = x.createRadialGradient(64, 64, 0, 64, 64, 64); gr.addColorStop(0, 'rgba(255,80,30,1)'); gr.addColorStop(1, 'rgba(255,80,30,0)'); x.fillStyle = gr; x.fillRect(0, 0, 128, 128); t2.tx.needsUpdate = true; HEAT.material.map = t2.tx; } HEAT.scale.set(6, 8, 1); HEAT.position.set(DX, 2.6, -.3);
const THERM = add(new THREE.Group()); const TMERC = cyl(.14, .14, 1, lp(0xff3030, { emissive: 0x550000 }), 12); { const tb = M(new THREE.CapsuleGeometry(.24, 3.2, 6, 16), new THREE.MeshStandardMaterial({ color: 0xffffff, transparent: true, opacity: .35 }), false); tb.position.y = 2; const bl = sph(.4, lp(0xff3030, { emissive: 0x550000 })); bl.position.y = .3; THERM.add(tb, bl, TMERC); } THERM.position.set(DX + 3.2, .3, .5);
const SUN = add(new THREE.Group()); { const s = sph(1.0, new THREE.MeshBasicMaterial({ color: 0xffd23a })); SUN.add(s); for (let i = 0; i < 10; i++) { const r = box(.12, .7, .12, new THREE.MeshBasicMaterial({ color: 0xffb020 })); const a = i / 10 * Math.PI * 2; r.position.set(Math.cos(a) * 1.5, Math.sin(a) * 1.5, 0); r.rotation.z = a - Math.PI / 2; SUN.add(r); } } SUN.position.set(DX - 3.5, 6.5, -1);
const CARD = add(new THREE.Group()); { const b = rbox(3.2, .8, 1.5, .1, lp(0x2b5fd0)); b.position.y = .6; const c = rbox(1.8, .6, 1.3, .1, lp(0x2b5fd0)); c.position.set(-.2, 1.2, 0); CARD.add(b, c); for (const [x, z] of [[1, .75], [1, -.75], [-1, .75], [-1, -.75]]) { const w = cyl(.3, .3, .2, 0x1b1d22, 14); w.rotation.x = Math.PI / 2; w.position.set(x, .3, z); CARD.add(w); } } CARD.position.set(DX - 4.5, 0, 2.2);
const PILLOW = add(rbox(2.2, .5, 1.4, .22, lp(0xf6f0ff))); PILLOW.position.set(DX + 4.6, .45, 2.2);
const PAD = add(new THREE.Group()); { const b = rbox(1.4, .25, .7, .12, lp(0x2a2d36)); const g1 = sph(.33, lp(0x2a2d36)); g1.scale.y = .6; g1.position.set(-.55, 0, .1); const g2 = g1.clone(); g2.position.x = .55; const bt = cyl(.07, .07, .05, 0xff4d4d, 8); bt.position.set(.45, .15, -.05); PAD.add(b, g1, g2, bt); } PAD.position.set(DX + 1.8, .45, 2.6);
// ---------- ZONA E: los cargadores ----------
const EX = 160; add(box(18, .2, 10, 0xd9d4c8)).position.set(EX, .1, 0);
const TABLE = add(box(12, .3, 4, 0xc9a77c)); TABLE.position.set(EX, 1.8, -1.2); for (const [x, z] of [[-5.6, -3], [5.6, -3], [-5.6, .6], [5.6, .6]]) { const l = add(box(.25, 1.7, .25, 0x9a6a40)); l.position.set(EX + x, .85, z); }
const CHG = new THREE.InstancedMesh(new THREE.BoxGeometry(.5, .5, .5), lp(0xffffff), 64); CHG.castShadow = true; scene.add(CHG); const CHGC = new THREE.Color();
for (let i = 0; i < 64; i++) { tmp.position.set(EX - 5.2 + (i % 16) * .69, 2.2, -2.8 + Math.floor(i / 16) * .8); tmp.rotation.set(0, 0, 0); tmp.scale.setScalar(1); tmp.updateMatrix(); CHG.setMatrixAt(i, tmp.matrix); CHG.setColorAt(i, CHGC.set(0xf4f4f4)); }
const ORIG = add(chargerBrick()); ORIG.scale.setScalar(2); ORIG.position.set(EX - 2.4, 3.2, 2.2);
const FAKE = add(new THREE.Group()); { const sh = rbox(1.8, 1.8, 1.8, .2, new THREE.MeshStandardMaterial({ color: 0xffffff, transparent: true, opacity: .25 })); FAKE.add(sh); const pcb = box(1.2, .08, 1.2, 0x1f7a3a); pcb.position.y = -.5; const c1 = cyl(.15, .15, .5, 0x2b5fd0, 10); c1.position.set(-.3, -.2, .2); FAKE.add(pcb, c1); } FAKE.position.set(EX + 2.4, 3.2, 2.2);
const ORIGIN = add(new THREE.Group()); { const sh = rbox(1.8, 1.8, 1.8, .2, new THREE.MeshStandardMaterial({ color: 0xffffff, transparent: true, opacity: .25 })); ORIGIN.add(sh); const pcb = box(1.2, .08, 1.2, 0x1f7a3a); pcb.position.y = -.5; ORIGIN.add(pcb); const parts0 = [[-.35, .2, 0x2b5fd0], [.0, .15, 0xffb020], [.35, .25, 0x6b7280], [-.2, .1, 0xa98bff], [.25, .05, 0x2a2d36]]; parts0.forEach(([x, h, c], i) => { const p = cyl(.13, .13, .4 + h, c, 10); p.position.set(x, -.25 + h / 2, (i % 2 ? .3 : -.25)); ORIGIN.add(p); }); const tr = box(.5, .45, .45, 0xb87333); tr.position.set(0, -.2, .35); ORIGIN.add(tr); } ORIGIN.position.set(EX - 2.4, 3.2, 2.2);
const SPARK = parts(24, new THREE.MeshBasicMaterial({ color: 0xffd23a }), .05);
const FIRE = add(new THREE.Group()); { const f1 = M(new THREE.ConeGeometry(.45, 1.2, 10), lp(0xff7a1a, { emissive: 0x993300 })); f1.position.y = .6; const f2 = M(new THREE.ConeGeometry(.25, .8, 10), lp(0xffd23a, { emissive: 0x996600 })); f2.position.set(.05, .45, .2); FIRE.add(f1, f2); } FIRE.position.set(EX + 2.4, 4.1, 2.2);
const WALLE = add(box(4, 5, .5, 0xefe3c8)); WALLE.position.set(EX + 6.5, 2.5, 1); const OUTE = add(box(.9, 1.3, .12, 0xffffff)); OUTE.position.set(EX + 6.5, 2.2, 1.3);
const STRIP = add(new THREE.Group()); { const b = box(2.4, .3, .7, 0xf4f4f4); STRIP.add(b); for (let i = 0; i < 5; i++) { const c = chargerBrick(i % 2 ? 0x2a2d36 : 0xf4f4f4); c.scale.setScalar(.5); c.position.set(-.95 + i * .48, .35, 0); STRIP.add(c); } } STRIP.position.set(EX - 4.5, 2.15, 1.8);
const LAP = add(new THREE.Group()); { const b = box(2.2, .1, 1.5, 0x9aa0aa); const s = box(2.2, 1.45, .08, 0x1d2029); s.position.set(0, .72, -.72); s.rotation.x = -.15; LAP.add(b, s); } LAP.position.set(EX - 1.5, 2.05, 1.8);
// ---------- ZONA F: la noche ----------
const FX = 200; add(box(14, .2, 8, 0xcfc3ad)).position.set(FX, .1, 0);
const BED = add(new THREE.Group()); { const f = box(4.5, .6, 6, 0x8a5a34); f.position.y = .5; const m = box(4.3, .5, 5.8, 0xf4f4f0); m.position.y = 1.05; const bl = box(4.4, .2, 3.6, 0x3d7bff); bl.position.set(0, 1.35, 1.0); const hb = box(4.5, 2.4, .3, 0x8a5a34); hb.position.set(0, 1.4, -3); const pl = rbox(1.6, .4, .9, .18, lp(0xffffff)); pl.position.set(-1, 1.5, -2.2); BED.add(f, m, bl, hb, pl); } BED.position.set(FX - 2, 0, -.5);
const NIGHT = add(box(1.6, 1.6, 1.4, 0x9a6a40)); NIGHT.position.set(FX + 1.3, .8, -2.4);
const SF = phoneTex(); const PF = add(makePhone(SF, .55)); PF.position.set(FX + 1.3, 2.0, -2.2); PF.rotation.x = -.35;
const MOON = add(sph(1.2, new THREE.MeshBasicMaterial({ color: 0xfff6d8 }))); MOON.position.set(FX + 5, 9, -6);
const CLOCK = add(texPlane(2.4, 1.0, 360, 150, (x, w, h) => { }, true)); CLOCK.position.set(FX + 2.6, 3.0, -2.4);
function drawClock(s) { const x = CLOCK.userData.tex.x; x.clearRect(0, 0, 360, 150); x.fillStyle = 'rgba(14,16,24,.9)'; rrp(x, 0, 0, 0, 360, 150, 22); x.fill(); x.fillStyle = '#ffb020'; x.font = '900 96px I'; x.textAlign = 'center'; x.textBaseline = 'middle'; x.fillText(s, 180, 80); CLOCK.userData.tex.tx.needsUpdate = true; }
// ---------- tomas [t0, t1, pos0, pos1, look0, look1, fov] ----------
const ZS = [[PS(163) + .2, 0, 3, 11], [PS(167), BX, 3, 12], [PS(170), EX, 3, 13], [PS(173), DX, 3, 12], [PS(176), FX, 2.5, 12]];
SHOTS = [
  [0, PS(2), [-3, 4, 15], [-1.5, 3.8, 13], [.5, 3.3, 0], [.6, 3.2, 0]],
  [PS(2), PS(9), [6, 5, 17], [-4, 5, 17], [1, 3, 0], [1, 3, 0]],
  [PS(9), PS(11), [3.5, 2.6, 10], [2.5, 2.2, 8.5], [2, 2, 0], [2, 1.8, 0]],
  [PS(11), PS(18), [BX - 2, 4.2, 15], [BX + .5, 4, 13.5], [BX, 3.2, 0], [BX, 3, 0]],
  [PS(18), PS(31), [BX + 5, 3.2, 11], [BX + 3, 2.6, 9.5], [BX + 2.6, 2.2, 0], [BX + 2.8, 2.0, 0]],
  [PS(31), PS(39), [BX - 3, 5, 16], [BX + 3, 4.6, 15], [BX, 3.2, 0], [BX + 1, 3, 0]],
  [PS(39), PS(45), [-2, 3.8, 11], [-1, 3.6, 10], [0, 3.6, 0], [0, 3.5, 0]],
  [PS(45), PS(56), [CX, 3.6, 13], [CX, 3.2, 11], [CX, 2.6, 0], [CX, 2.5, 0]],
  [PS(56), PS(60), [CX + 3.5, 3.2, 8], [CX + 2.6, 3, 7], [CX + 1.8, 2.8, 0], [CX + 1.8, 2.8, 0]],
  [PS(60), PS(64), [BX - 3, 4.6, 15], [BX + 2, 4.4, 14], [BX + 1, 3, 0], [BX + 1, 3, 0]],
  [PS(64), PS(71), [-3, 4.2, 13], [2, 3.8, 12], [.8, 3.2, 0], [.8, 3.2, 0]],
  [PS(71), PS(73), [CX - 40, 14, 30], [CX + 20, 12, 30], [CX - 20, 2, 0], [CX + 20, 2, 0]],
  [PS(73), PS(81), [CX + 30, 4.2, 14], [CX + 30.5, 4, 12.5], [CX + 31, 3.2, 0], [CX + 31, 3.2, 0]],
  [PS(81), PS(87), [CX + 34.5, 2.8, 9], [CX + 34, 2.6, 8], [CX + 33, 2, .5], [CX + 33, 2, .5]],
  [PS(87), PS(91), [CX + 31, 4.6, 15], [CX + 32, 4.2, 14], [CX + 31.5, 3.2, 0], [CX + 31.5, 3.2, 0]],
  [PS(91), PS(97), [DX - 3, 4, 13], [DX + 1, 3.6, 11.5], [DX, 2.8, 0], [DX, 2.6, 0]],
  [PS(97), PS(104), [DX + 6, 6, 16], [DX - 6, 6, 16], [DX, 2, 1], [DX, 2, 1]],
  [PS(104), PS(113), [DX + 2, 3.6, 10.5], [DX + 1, 3.3, 9.5], [DX + 1, 2.4, 0], [DX + 1, 2.4, 0]],
  [PS(113), PS(122), [EX, 6, 15], [EX, 5.4, 13], [EX, 2.4, -1.5], [EX, 2.4, -1.5]],
  [PS(122), PS(130), [EX + 3, 4.6, 11], [EX - 1, 4.4, 10], [EX, 3.2, 2], [EX, 3.2, 2]],
  [PS(130), PS(139), [EX + 1, 4.4, 13], [EX + 3, 4, 12], [EX + 1, 2.4, 1.5], [EX + 2, 2.4, 1.5]],
  [PS(139), PS(147), [FX + 6, 5.5, 13], [FX + 4, 5, 11], [FX, 1.8, -1], [FX + .5, 1.8, -1.5]],
  [PS(147), PS(156), [FX + 3, 3.4, 5.5], [FX + 2.6, 3.2, 4.6], [FX + 1.3, 2.4, -2.3], [FX + 1.3, 2.4, -2.3]],
  [PS(156), PS(163), [-3, 3.8, 12], [-2, 3.6, 11], [0, 3.4, 0], [0, 3.4, 0]],
  ...ZS.map(([a, x, y, z], i) => [a, i < 4 ? ZS[i + 1][0] : PS(178), [x + 3, y + 1.5, z + 2], [x + 1, y + 1, z], [x + (i === 1 ? 1 : 0), y - .3, 0], [x + (i === 1 ? 1 : 0), y - .4, 0]]),
  [PS(178), PS(185), [CX - 60, 16, 34], [CX + 60, 16, 34], [CX - 40, 2, 0], [CX + 60, 2, 0]],
  [PS(185), END, [-4, 5, 16], [-5, 5.6, 17.5], [0, 3.2, 0], [0, 3.2, 0]]
];
SHAKE = [[KW.incendio - .1, KW.incendio + .7, .06], [KW.calor1 - .1, KW.calor1 + .6, .05]];
// ---------- animación ----------
function nightK(t) { return inn(t, PS(139) - .3, PS(156)) ? eout(P(t, PS(139) - .3, .8)) * (1 - eout(P(t, PS(156) - .6, .6))) : 0; }
function animWorld(t) {
  const zx = SHOTS.find(s => t >= s[0] && t < s[1]); sunAt(zx ? zx[4][0] : 0, 0, 0, 16);
  const nk = nightK(t); hemi.intensity = lerp(1.25, .35, nk); sunL.intensity = lerp(2.7, .5, nk); renderer.toneMappingExposure = lerp(1.05, .8, nk); MOON.visible = nk > .05; if (!window.SKYT) window.SKYT = scene.background; if (nk > .02) { scene.background = new THREE.Color(0x9fd4f5).lerp(new THREE.Color(0x0b1430), nk); scene.fog.color.set(0xcfe7f7).lerp(new THREE.Color(0x0b1430), nk); } else { scene.background = window.SKYT; scene.fog.color.set(0xcfe7f7); }
  // A: celular gigante
  const planeOn = inn(t, KW.avion1 - .2, PS(2)) || inn(t, PS(39), PS(45)) || inn(t, PS(163), PS(167));
  const offA = inn(t, KW.apagalo1, PS(71));
  drawPhone(SA, { pct: t < PS(9) ? 23 + t * .4 : t < PS(64) ? 35 : 35 + P(t, PS(66), 14) * 40, plane: planeOn, charging: true, off: offA && t > KW.apagalo1 + .3 && !inn(t, PS(156), PS(163)), label: inn(t, PS(156), PS(163)) ? 'Puedes cargar cuando quieras' : null });
  PLANE.visible = inn(t, PS(31) - .3, PS(33)) || inn(t, KW.avion1 - .3, PS(2)); if (PLANE.visible) { const a0 = t < PS(2) ? KW.avion1 - .3 : PS(31) - .3, k = P(t, a0, 3.2); const bx = t < PS(2) ? 0 : BX; PLANE.position.set(bx - 9 + k * 18, 7 + Math.sin(k * 6) * .3, -1); PLANE.rotation.set(Math.sin(t * 3) * .1, 0, .05); }
  // B: tanque
  const level = t < PS(11) ? .5 : t < PS(31) ? .45 + .05 * Math.sin(t * .5) : t < PS(60) ? lerp(.45, .65, P(t, PS(33), 6)) : lerp(.65, .95, P(t, PS(65), 5));
  const wl = 4.0 * level; WATER.scale.y = wl; WATER.position.y = 1.26 + wl / 2;
  const leakAmt = t < PS(33) ? 1 : t < PS(65) ? .35 : 0; VALVE.rotation.y = (t > PS(33) ? 1.6 * eout(P(t, PS(33), .8)) : 0) + (t > PS(65) ? 2 * eout(P(t, PS(65), .8)) : 0);
  const fl = inn(t, PS(11) + 2, PS(71)); INFLOW.visible = OUTFLOW.visible = fl;
  for (let i = 0; i < 30; i++) { const ph = (t * 1.6 + i / 30) % 1; setP(INFLOW, i, BX - .2 + Math.sin(i) * .05, lerp(5.8, 1.3 + wl, ph), Math.cos(i) * .05, fl, 1); setP(OUTFLOW, i, BX + 2.9 + ph * .2, lerp(1.25, .2, ph), Math.sin(i * 2) * .05, fl && i / 30 < leakAmt, 1); }
  INFLOW.instanceMatrix.needsUpdate = OUTFLOW.instanceMatrix.needsUpdate = true;
  const icAt = [KW.antena1, KW.wifi1, KW.bluetooth1, KW.ubicacion, KW.aplicaciones1, KW.nube, KW.mensajes1, KW.pantalla1];
  LEAKS.forEach((s, i) => { const k = i % 8, a0 = icAt[k] - .2 + Math.floor(i / 8) * 1.1; const keep = t < PS(33) ? true : t < PS(65) ? (k >= 4) : false; s.visible = inn(t, a0, PS(71)) && keep && inn(t, PS(18) - .5, PS(71)); if (!s.visible) return; const ph = ((t - a0) * .35) % 1; s.position.set(BX + 3.0 + ph * 2.5 + (k % 3) * .4, 1.3 - ph * .2 + Math.sin(ph * 3 + k) * .5 + (k % 4) * .35, (k % 2 ? .6 : -.6)); s.material.opacity = 1 - P(ph, .8, .2); s.scale.setScalar(.75 * eback(P(t, a0, .3))); });
  // C: carrera
  const race = P(t, PS(45), PS(56) - PS(45)); const tm = Math.min(1, race * 1.25);
  drawPhone(SC1, { pct: 20 + tm * 70, charging: true, label: 'Normal' }); drawPhone(SC2, { pct: 20 + Math.min(1, tm * 1.12) * 70, plane: true, charging: true, label: 'Modo avión', missed: inn(t, KW.llamadas - .2, PS(60)) });
  // batería gigante (0→80 rápido, luego lento)
  const bk = P(t, PS(73), PS(81) - PS(73)); const bp = bk < .45 ? lerp(.05, .8, eout(bk / .45)) : lerp(.8, 1, (bk - .45) / .55); const bpp = t >= PS(87) ? lerp(.05, .8, eout(P(t, PS(88), 2.4))) + (t > PS(89) ? .2 * P(t, PS(89), 3) : 0) : bp;
  BFILL.scale.y = 4.1 * bpp; BFILL.position.y = 1.1 + 4.1 * bpp / 2; BFILL.material.color.set(bpp > .8 ? 0x35c46f : 0x3ddc84); MARK80.visible = t > KW.imaginacion - 1;
  const gk = P(t, PS(82), PS(84) - PS(82)); const gfill = gk < .5 ? lerp(.05, .75, gk / .5) : lerp(.75, .95, (gk - .5) / .5); GW.scale.y = 2.2 * gfill; GW.position.y = .3 + 1.1 * gfill;
  POUR.visible = inn(t, PS(82), PS(84)); const pourRate = gk < .5 ? 1 : .3; for (let i = 0; i < 20; i++) { const ph = (t * 2 + i / 20) % 1; setP(POUR, i, CX + 33.5 - ph * .3, lerp(3.4, .4 + 2.2 * gfill, ph), 1, POUR.visible && i / 20 < pourRate, 1); } POUR.instanceMatrix.needsUpdate = true; JUG.rotation.z = POUR.visible ? (gk < .5 ? -1.1 : -.8) : -.6;
  // D: calor
  const hot = inn(t, PS(91), PS(109)); HEAT.material.opacity = hot ? .45 + .15 * Math.sin(t * 4) : inn(t, PS(109), PS(113)) ? .15 : 0;
  drawPhone(SD, { pct: hot ? 40 + P(t, PS(91), 20) * 10 : 55, charging: true, hot, plane: t > PS(109) });
  const temp = hot ? .55 + .4 * eout(P(t, KW.calor1, 3)) : .4; TMERC.scale.y = 3 * temp; TMERC.position.y = .3 + 1.5 * temp;
  pop(SUN, t, KW.sol1 - .3, .45); SUN.rotation.z = t * .3; pop(CARD, t, KW.carro1 - .3, .45); pop(PILLOW, t, KW.almohada1 - .3, .45); pop(PAD, t, KW.jugando1 - .3, .45);
  // E: cargadores
  for (let i = 0; i < 64; i++) { let c = 0xf4f4f4; if (t > PS(118) - .3) c = i === 37 ? 0x22c55e : 0xef4444; else if (t > KW.sesenta) { const k = P(t, KW.sesenta, 3); if (i / 64 < k) c = 0xdedede; } CHG.setColorAt(i, CHGC.set(c)); const s = t > KW.sesenta - .4 ? eback(P(t, KW.sesenta - .4 + (i % 16) * .03, .3)) : 0; tmp.position.set(EX - 5.2 + (i % 16) * .69, 2.2 + (i === 37 && t > PS(118) ? .25 + .1 * Math.sin(t * 6) : 0), -2.8 + Math.floor(i / 16) * .8); tmp.scale.setScalar(Math.max(.001, s)); tmp.updateMatrix(); CHG.setMatrixAt(i, tmp.matrix); }
  CHG.instanceMatrix.needsUpdate = true; CHG.instanceColor.needsUpdate = true;
  ORIGIN.visible = FAKE.visible = inn(t, PS(122), PS(130)); ORIG.visible = false; if (ORIGIN.visible) { pop(ORIGIN, t, PS(123), .4, PS(130) - .3); pop(FAKE, t, PS(123) + .2, .4, PS(130) - .3); }
  SPARK.visible = inn(t, PS(126), PS(130)) || inn(t, KW.puerto - .2, PS(133)); for (let i = 0; i < 24; i++) { const ph = (t * 2.2 + i / 24) % 1, a = i * 2.39; const o = t < PS(130) ? FAKE.position : V(EX - 1.5, 2.2, 1.8); setP(SPARK, i, o.x + Math.cos(a) * ph * 1.4, o.y + Math.sin(a) * ph * 1.2, o.z + .9, SPARK.visible, 1 - ph); } SPARK.instanceMatrix.needsUpdate = true;
  pop(FIRE, t, KW.incendio - .2, .4, PS(130)); FIRE.scale.y *= 1 + .15 * Math.sin(t * 14);
  pop(STRIP, t, KW.regleta - .3, .45, PS(139)); pop(LAP, t, KW.computadora - .3, .45, PS(139));
  // F: la noche
  const nh = t < PS(147) ? 11 : t < PS(151) ? 1 + P(t, PS(147), PS(151) - PS(147)) * 4 : t < PS(153) ? 5 + P(t, PS(151), 2) * 1.5 : 6.5;
  const nPct = t < PS(142) ? 100 : t < PS(147) ? 100 : t < PS(152) ? Math.min(80, 40 + P(t, PS(147), 6) * 40) : 80 + P(t, PS(152), 2.2) * 20;
  drawPhone(SF, { pct: nPct, night: true, charging: true, time: (Math.floor(nh) % 12 || 12) + ':' + String(Math.floor((nh % 1) * 60)).padStart(2, '0'), label: inn(t, PS(147), PS(156)) ? 'Carga optimizada' : null });
  CLOCK.visible = inn(t, PS(139), PS(156)); if (CLOCK.visible) drawClock(`${String(Math.floor(nh) % 24).padStart(2, '0')}:${String(Math.floor((nh % 1) * 60)).padStart(2, '0')}`);
}
// ---------- capa 2D ----------
function race2d(t) { panel(t, PS(47), PS(56), 800, 770, 760, 170, 'PRUEBAS: MODO AVIÓN VS. NORMAL', C.amber, (g, w, h) => { const k = eout(P(t, PS(47) + .3, 2.5)); g.font = '700 24px I'; g.fillStyle = '#fff'; g.textAlign = 'left'; g.textBaseline = 'middle'; g.fillText('Ahorro de tiempo:', -w / 2 + 30, 0); g.fillStyle = 'rgba(255,255,255,.12)'; rrp(g, 0, -w / 2 + 260, -14, 440, 28, 14); g.fill(); g.fillStyle = C.green; rrp(g, 0, -w / 2 + 260, -14, Math.max(28, 440 * (11 / 60) * k), 28, 14); g.fill(); g.font = '900 54px I'; g.fillStyle = C.amber; g.textAlign = 'center'; g.fillText('4 – 11 MIN', 0, 58); }); }
function grid400(t) { panel(t, KW.cuatrocientos - .2, PS(122), 800, 520, 560, 560, '400 CARGADORES FALSOS', C.red, (g, w, h) => { const n = 20, s = 22, ox = -n * s / 2, oy = -n * s / 2 + 24; const k = P(t, KW.cuatrocientos, 2.5); const greens = new Set([47, 213, 368]); for (let i = 0; i < 400; i++) { if (i / 400 > k) break; const ok = greens.has(i) && t > KW.tres1 - .3; g.fillStyle = ok ? C.green : 'rgba(255,77,77,.85)'; g.beginPath(); g.arc(ox + (i % n) * s + s / 2, oy + Math.floor(i / n) * s + s / 2, ok ? 9 : 7, 0, 6.29); g.fill(); } }); }
function steps5(t) { const L = [[PS(164), '1 · ¿PRISA? MODO AVIÓN'], [PS(167), '2 · ¿MUCHA PRISA? APÁGALO'], [PS(170), '3 · CARGADOR ORIGINAL O CERTIFICADO'], [PS(173), '4 · LEJOS DEL CALOR'], [PS(176), '5 · CARGA OPTIMIZADA']]; L.forEach(([a, txt], i) => pill(t, a, PS(181), 300, 250 + i * 64, txt, C.green, 'check', 26)); }
function overlay2d(t) {
  floaters(t, 10, 'rgba(255,255,255,.65)', 'dust');
  // intro
  pill(t, KW.avion1 - .2, PS(1), 800, 760, 'MODO AVIÓN = ¿CARGA MÁS RÁPIDO?', C.amber, 'arrow');
  punch(t, PS(1) + .4, PS(2), [['¿FUNCIONA?', '#ffffff']], 800, 520, { size: 92 });
  pill(t, PS(3), PS(5), 330, 300, 'CARGA MÁS RÁPIDO', C.green, 'check', 26); pill(t, KW.dure - .2, PS(5), 330, 362, 'TE DURA MÁS', C.green, 'check', 26); pill(t, KW.dane - .2, PS(5), 330, 424, 'NO SE DAÑA', C.green, 'check', 26);
  punch(t, KW.truco1, PS(7), [['NO ES EL', '#ffffff'], ['MODO AVIÓN', C.red]], 800, 540, { size: 80 });
  pill(t, KW.error1, PS(9), 800, 780, 'EL ERROR DE TODAS LAS NOCHES', C.red, 'warn');
  pill(t, PS(10), PS(11), 800, 780, '¿QUÉ PASA CUANDO LO CONECTAS?', C.blue, 'arrow');
  // tanque
  pill(t, KW.tanque1 - .2, PS(14), 1210, 260, 'BATERÍA = TANQUE', C.blue, 'dot', 26); pill(t, KW.manguera - .2, PS(14), 1210, 320, 'CARGADOR = MANGUERA', C.green, 'dot', 26);
  pill(t, KW.llave1 - .2, PS(18), 800, 790, 'UNA LLAVE ABIERTA POR ABAJO', C.red, 'warn');
  pill(t, PS(18), PS(20), 800, 790, 'LO QUE HACE MIENTRAS CARGA', C.amber, 'dot');
  const LK = [[KW.antena1, 'ANTENA', C.red], [KW.wifi1, 'WIFI', C.blue], [KW.bluetooth1, 'BLUETOOTH', C.blue], [KW.ubicacion, 'UBICACIÓN', C.amber], [KW.aplicaciones1, 'APPS', C.purple], [KW.nube, 'NUBE', C.green], [KW.mensajes1, 'MENSAJES', C.green], [KW.pantalla1, 'PANTALLA', C.amber]];
  LK.forEach(([a, txt, c], i) => pill(t, a - .1, PS(31), 1330 - (i % 2) * 190, 250 + Math.floor(i / 2) * 62, txt, c, 'x', 22));
  punch(t, KW.energia1 - .2, PS(29), [['GASTA', '#ffffff'], ['ENERGÍA', C.red]], 600, 560, { size: 76 });
  pill(t, PS(29), PS(31), 800, 790, 'ENTRA POR UN LADO… SALE POR EL OTRO', C.red, 'warn');
  punch(t, KW.famoso - .3, PS(32), [['MODO', '#ffffff'], ['AVIÓN', C.amber]], 800, 540, { size: 96 });
  pill(t, PS(32), PS(33), 800, 790, 'APAGA ANTENA, WIFI Y BLUETOOTH', C.blue, 'check');
  pill(t, PS(33), PS(38), 800, 790, 'CIERRA PARTE DE LA LLAVE', C.green, 'check');
  pill(t, PS(38), PS(39), 800, 790, 'MÁS ENERGÍA SE QUEDA', C.green, 'check');
  punch(t, PS(40) - .2, PS(42), [['SÍ', C.green], ['FUNCIONA', '#ffffff']], 800, 540, { size: 96 });
  pill(t, KW.samsung - .2, PS(45), 800, 790, 'SAMSUNG LO RECOMIENDA', C.blue, 'check');
  punch(t, PS(45), PS(47), [['¿CUÁNTO', '#ffffff'], ['MÁS?', C.amber]], 800, 560, { size: 90 });
  race2d(t);
  punch(t, KW.empujoncito - .2, PS(53), [['UN', '#ffffff'], ['EMPUJONCITO', C.amber]], 800, 300, { size: 76 });
  pill(t, PS(54), PS(56), 800, 250, 'LO QUE GASTAN LAS ANTENAS ES POCO', C.blue, 'dot');
  pill(t, KW.llamadas - .2, PS(58), 800, 790, 'NO TE ENTRAN LLAMADAS NI MENSAJES', C.red, 'warn');
  pill(t, PS(58), PS(60), 800, 790, '¿ESPERAS UNA LLAMADA? NO LO USES', C.amber, 'warn');
  punch(t, PS(61), KW.apagalo1, [['¿EL TRUCO', '#ffffff'], ['REAL?', C.amber]], 800, 540, { size: 86 });
  punch(t, KW.apagalo1 - .1, PS(64), [['APÁGALO', C.green]], 800, 540, { size: 110 });
  pill(t, PS(65), PS(67), 800, 790, 'LA LLAVE SE CIERRA POR COMPLETO', C.green, 'check');
  pill(t, KW.veinte1 - .2, PS(70), 800, 790, 'SALES EN 20 MIN Y ESTÁ EN ROJO', C.red, 'clock');
  punch(t, KW.emergencia - .6, PS(71), [['TRUCO DE', '#ffffff'], ['EMERGENCIA', C.green]], 800, 540, { size: 80 });
  punch(t, KW.susc - .1, PS(72) + 1, [['¡SUSCRÍBETE!', '#ffffff']], 800, 520, { stamp: '#ff2d3d', size: 86, rot: -.05 });
  // 80 %
  pill(t, PS(73), PS(76), 800, 790, 'RAPIDÍSIMO… Y DESPUÉS DEL 80 %, LENTO', C.amber, 'clock');
  pill(t, KW.danado - .3, PS(77), 800, 790, 'NO ESTÁ DAÑADO', C.green, 'check');
  pill(t, PS(77), PS(81), 800, 790, 'APPLE: RÁPIDO HASTA 80 %, LUEGO LENTO', C.blue, 'check');
  pill(t, PS(82), PS(83), 800, 790, 'AL PRINCIPIO, RÁPIDO', C.green, 'check'); pill(t, PS(83), PS(85), 800, 790, 'CASI LLENO, DESPACITO', C.amber, 'clock');
  pill(t, KW.estresa - .3, PS(87), 800, 790, 'BAJA LA VELOCIDAD PARA PROTEGERLA', C.blue, 'check');
  pill(t, PS(88), PS(91), 800, 790, '0 → 80 % RÁPIDO · ÚLTIMO 20 % LENTO', C.green, 'clock');
  // calor
  punch(t, KW.calor1 - .3, PS(93), [['EL', '#ffffff'], ['CALOR', C.red]], 800, 520, { size: 110 });
  pill(t, PS(93), PS(96), 800, 790, 'SE CALIENTA → CARGA MÁS LENTO', C.red, 'warn');
  pill(t, PS(96), PS(97), 800, 790, 'APPLE: LIMITA LA CARGA SI HAY CALOR', C.blue, 'dot');
  const HX = [[KW.sol1, 'AL SOL'], [KW.carro1, 'CARRO CALIENTE'], [KW.almohada1, 'BAJO LA ALMOHADA'], [KW.jugando1, 'JUGANDO MIENTRAS CARGA']];
  HX.forEach(([a, txt], i) => pill(t, a - .2, PS(104), 300, 260 + i * 62, txt, C.red, 'x', 24));
  punch(t, KW.envejece - .3, PS(106), [['LO', '#ffffff'], ['ENVEJECE', C.red]], 800, 520, { size: 96 });
  pill(t, PS(106), PS(108), 800, 790, 'CALOR + VOLTAJE ALTO = DESGASTE', C.red, 'warn');
  pill(t, PS(109), PS(111), 800, 790, 'MODO AVIÓN = SE CALIENTA MENOS', C.green, 'check');
  pill(t, PS(111), PS(113), 800, 790, 'QUÍTALE EL FORRO · LUGAR FRESCO', C.green, 'check');
  // cargadores
  pill(t, PS(114), PS(116), 800, 790, 'SI EL CARGADOR ES MALO…', C.red, 'warn');
  pill(t, KW.sesenta - .2, PS(117), 800, 790, '64 CARGADORES GENÉRICOS', C.amber, 'dot');
  punch(t, PS(118) - .2, PS(120), [['SOLO', '#ffffff'], ['1', C.green], ['PASÓ', '#ffffff']], 800, 600, { size: 96 });
  grid400(t);
  pill(t, PS(123), PS(125), 800, 790, 'POR DENTRO LES FALTAN PIEZAS', C.red, 'warn');
  const RK = [[PS(126), 'SE CALIENTA'], [PS(127), 'DAÑA TU CELULAR'], [PS(128), 'TE DA CORRIENTE'], [PS(129), 'INCENDIO']];
  RK.forEach(([a, txt], i) => pill(t, a - .1, PS(130), 1300, 260 + i * 62, txt, C.red, 'warn', 24));
  pill(t, PS(131), PS(133), 800, 790, 'CABLES SIN CERTIFICACIÓN: OJO', C.red, 'warn');
  pill(t, PS(134), PS(136), 800, 790, 'ORIGINAL O CERTIFICADO', C.green, 'check');
  pill(t, PS(136), PS(137), 800, 790, 'DIRECTO A LA PARED', C.green, 'check');
  pill(t, KW.regleta - .2, PS(139), 800, 790, 'NI REGLETA LLENA NI PUERTO DE LA PC', C.red, 'x');
  // noche
  pill(t, PS(139), PS(142), 800, 790, 'EL ERROR DE TODAS LAS NOCHES', C.red, 'warn');
  punch(t, PS(142), PS(143), [['TODA LA NOCHE', '#ffffff'], ['AL 100 %', C.red]], 800, 520, { size: 70 });
  pill(t, KW.explotar - .3, PS(145), 800, 790, 'NO EXPLOTA: CORTA LA CARGA', C.green, 'check');
  pill(t, PS(146), PS(147), 800, 790, 'HORAS ENTRE 80 % Y 100 % = ENVEJECE', C.red, 'warn');
  punch(t, KW.optimizada1 - .3, PS(149), [['CARGA', '#ffffff'], ['OPTIMIZADA', C.green]], 800, 300, { size: 76 });
  pill(t, KW.rutina - .2, PS(153), 800, 790, 'ESPERA EN 80 % Y TERMINA AL DESPERTAR', C.green, 'clock');
  pill(t, KW.android - .3, PS(154), 800, 790, 'MUCHOS ANDROID TIENEN ALGO PARECIDO', C.blue, 'dot');
  pill(t, PS(154), PS(156), 800, 790, 'AJUSTES › BATERÍA › ACTÍVALA', C.green, 'check');
  // mito
  punch(t, KW.mito - .3, PS(158), [['MITO', '#ffffff']], 800, 520, { stamp: '#e02424', size: 90, rot: -.05 });
  pill(t, PS(157), PS(158), 800, 790, '¿DESCARGARLA COMPLETA ANTES?', C.amber, 'warn');
  punch(t, PS(158) - .1, PS(159) + .3, [['NO', C.red]], 800, 520, { size: 130 });
  pill(t, PS(159), PS(161), 800, 790, 'ESO ERA CON LAS BATERÍAS VIEJAS', C.blue, 'dot');
  pill(t, PS(161), PS(163), 800, 790, 'APPLE: CÁRGALA CUANDO QUIERAS', C.green, 'check');
  // resumen
  punch(t, PS(163), PS(164), [['RESUMEN EN', '#ffffff'], ['5 PASOS', C.amber]], 800, 520, { size: 80 });
  steps5(t);
  pill(t, PS(179), PS(181), 800, 790, '0 → 80 % RÁPIDO · EL RESTO, LENTO A PROPÓSITO', C.amber, 'clock');
  punch(t, PS(181), PS(183), [['NO ES MAGIA…', '#ffffff'], ['NI MENTIRA', C.amber]], 800, 520, { size: 76 });
  question(t, KW.coment, '¿Cargas el celular en modo avión?', ['Sí', 'Nunca', 'A veces', '¿Cuánto te dura la batería?'], 640);
}

// ---------- subtítulos ARRIBA (palabra actual con caja de selección azul) ----------
const STOP = new Set('a al como con de del el en es la las lo los me mi mis o para por que se si su sus te tu tus un una y ya le les no ni ese esa eso esto hay muy más mas qué cómo pero ahí aquí hasta este esta'.split(' '));
const CAP_Y = 118, CAP_FS = 40, CAP_MAX = 1150;
const CHUNKS = (() => { const mc = document.createElement('canvas').getContext('2d'); mc.font = `800 ${CAP_FS}px I`; const out = []; let wi = 0;
  for (const ph of PH) { const n = ph.t.split(' ').length; let cur = [], cw = 0; for (let j = 0; j < n; j++, wi++) { const ww = mc.measureText(WORDS[wi].w).width + 14; if (cur.length && (cw + ww > CAP_MAX || cur.length >= 6)) { out.push(cur); cur = []; cw = 0; } cur.push(wi); cw += ww; } if (cur.length) out.push(cur); }
  return out; })();
function caption(t) {
  let i = -1; for (let k = 0; k < WORDS.length; k++) if (t >= WORDS[k].s - .04) i = k; if (i < 0) return;
  const ch = CHUNKS.find(c => c.includes(i)); const last = WORDS[ch[ch.length - 1]]; const nxt = WORDS[ch[ch.length - 1] + 1]; if (t > (nxt ? Math.min(nxt.s - .04, last.e + .7) : last.e + .8)) return;
  g.save(); g.textBaseline = 'middle'; g.textAlign = 'left';
  const items = ch.map(j => { const w = WORDS[j]; const s = norm(w.w); const key = !STOP.has(s); g.font = `${key ? 800 : 500} ${CAP_FS}px I`; return { j, w: w.w, key, wd: g.measureText(w.w).width }; });
  const sp = 13, tw = items.reduce((s, o) => s + o.wd, 0) + sp * (items.length - 1); let x = 800 - tw / 2; const k0 = eout(P(t, WORDS[ch[0]].s - .04, .18));
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
  g.save(); g.globalAlpha = .7 * (1 - P(t, CTA_ST, .3)); g.font = '800 24px M'; const w = g.measureText(BRAND).width;
  const x = W - 30 - w - 50, y = 44; g.fillStyle = 'rgba(10,14,28,.42)'; rrp(g, 0, x - 10, y - 22, w + 68, 44, 22); g.fill();
  g.save(); g.beginPath(); g.arc(x + 15, y, 17, 0, 6.29); g.clip(); g.drawImage(MASCOT, x - 2, y - 17, 34, 34); g.restore();
  g.fillStyle = '#ffffff'; g.textBaseline = 'middle'; g.fillText(BRAND, x + 40, y + 2); g.restore();
}
function disclaimer(t) { if (t >= CTA_ST) return; g.save(); g.font = '500 20px I'; g.fillStyle = 'rgba(255,255,255,.55)'; g.shadowColor = 'rgba(0,0,0,.5)'; g.shadowBlur = 6; g.textAlign = 'left'; g.textBaseline = 'middle'; g.fillText(typeof DISC === 'function' ? DISC(t) : DISC, 40, 870); g.restore(); }
function followCTA(t) {
  const st = CTA_ST; if (t < st) return; const a = P(t, st, .3);
  g.save(); g.fillStyle = `rgba(6,10,24,${.72 * a})`; g.fillRect(0, 0, W, H);
  const k = eback(P(t, st + .05, .45)); g.translate(800, 300); g.scale(k * .62, k * .62);
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
  const vg = g.createRadialGradient(800, 450, 500, 800, 450, 1000); vg.addColorStop(0, 'rgba(0,0,0,0)'); vg.addColorStop(1, 'rgba(0,0,0,.22)'); g.fillStyle = vg; g.fillRect(0, 0, W, H);
  if (t < CTA_ST) { overlay2d(t); caption(t); disclaimer(t); } watermark(t); followCTA(t);
  const fo = P(t, END - .3, .3); if (fo > 0) { g.fillStyle = `rgba(0,0,0,${fo})`; g.fillRect(0, 0, W, H); }
}
window.renderAt = renderAt; window.END = END;
window.frameJPG = (t, q = .92) => { renderAt(t); return out.toDataURL('image/jpeg', q).split(',')[1]; };
window.READY = true;
