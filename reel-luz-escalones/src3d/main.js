// Reel 9:16 3D — Estilo C "Escalada 3D" (ref. referencias/estilo-escalada-balcon.mp4) — La luz te llegó el doble
import * as THREE from 'three';

const W = 1080, H = 1920, END = 70.5;   // END = última palabra + ~4,2 s (cierre 3,7 s)
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
// partículas instanciadas
function parts(n, c, r = .05, geo) { const m = new THREE.InstancedMesh(geo || new THREE.SphereGeometry(r, 6, 4), c.isMaterial ? c : new THREE.MeshBasicMaterial({ color: c }), n); m.frustumCulled = false; scene.add(m); return m; }
const tmp = new THREE.Object3D();
function setP(m, i, x, y, z, vis, s = 1, rot = 0) { tmp.position.set(x, y, z); tmp.rotation.set(rot, rot * .7, 0); tmp.scale.setScalar(vis ? s : .001); tmp.updateMatrix(); m.setMatrixAt(i, tmp.matrix); }
// ================= LA LUZ TE LLEGÓ EL DOBLE: LOS ESCALONES =================
const DISC = (t) => t >= PS(24) - .2 && t < PS(25) ? 'No abras el medidor: pide que lo revise tu compañía de luz' : t >= PS(6) && t < PS(9) ? 'Ejemplo ilustrativo · cada país y compañía tiene sus tarifas' : 'Recreación ilustrativa';
const KW = { doble: T('doble'), robando: T('robando'), peor: T('peor'), cobran: T('cobran'), escalones: T('escalones'), baratos: T('baratos'), limite: T('límite'), caro1: T('caro'), calor: T('calor'), refri: T('refrigerador'), ventilador: T('ventilador'), noche: T('noche'), aire: T('aire'), brincas: T('brincas'), caro2: T('caro', 2), susc: T('suscríbete'), haces: T('haces'), monto: T('monto'), usaste: T('usaste'), recibo: T('recibo'), empieza: T('empieza'), truco: T('truco'), poquito: T('poquito'), medidor: T('medidor'), reclama: T('reclama'), coment: T('comentarios') };
add(road(30, 9, 200)); [[-14, -9, 5, 3, 4, 0xe8d7b0], [16, -11, 6, 3, 7, 0xd9c9a6], [60, -10, 5, 3, 5, 0xf0e0c0], [100, -10, 6, 3, 6, 0xe2d2b0], [140, -10, 5, 3, 4, 0xd9c9a6]].forEach(b => building(...b));
[[-7, 4], [12, 4.5], [32, 4], [54, 4.5], [72, 4], [92, 4.5], [112, 4], [132, 4.5]].forEach(([x, z]) => tree(x, z, 1.3));
// ---------- casa con medidor (zona A) ----------
function house(x, z, col) { const h = add(new THREE.Group()); const b = box(6, 3.4, 5, col); b.position.y = 1.7; const roof = M(new THREE.ConeGeometry(4.6, 1.8, 4), lp(0xb5543a, { flatShading: true })); roof.position.y = 4.3; roof.rotation.y = Math.PI / 4; const door = box(1, 2, .1, 0x8a5a36); door.position.set(-1.2, 1, 2.52); const w1 = box(1.2, 1, .1, 0x23406e); w1.position.set(1.4, 2.1, 2.52); h.add(b, roof, door, w1); h.position.set(x, 0, z); return h; }
const HOUSE = house(0, -1, 0xf2e6c8);
const METER = add(new THREE.Group()); { const bx = rbox(1, 1.3, .35, .06, lp(0xdfe3ea, { metalness: .3, roughness: .4 })); const sc = texPlane(.7, .35, 140, 70, (x, w, h) => { x.fillStyle = '#10141c'; x.fillRect(0, 0, w, h); }); sc.position.set(0, .2, .2); METER.add(bx, sc); METER.userData.sc = sc; const wire = cyl(.04, .04, 2.2, 0x22252c, 6); wire.position.set(0, 1.6, 0); METER.add(wire); } METER.position.set(2.2, 2.0, 1.75);
function meterScreen(v) { const t2 = METER.userData.sc.userData.tex, x = t2.x; x.fillStyle = '#10141c'; x.fillRect(0, 0, 140, 70); x.fillStyle = v > 300 ? '#ff4d4d' : '#3ddc84'; x.font = '800 40px I'; x.textAlign = 'center'; x.textBaseline = 'middle'; x.fillText(String(Math.floor(v)).padStart(4, '0'), 70, 38); t2.tx.needsUpdate = true; }
const SPARK = parts(20, new THREE.MeshBasicMaterial({ color: 0xffd23a }), .06);
// ---------- escalera de tarifas (zona B) ----------
const BX = 40; add(box(16, .2, 9, 0xd9d4c8)).position.set(BX, .1, 0);
const STEPC = [0x3ddc84, 0x9be15d, 0xffb020, 0xff4d4d]; const STEPS = STEPC.map((c, i) => { const s = add(box(3, .8 + i * 1.1, 3.2, lp(c, { roughness: .6 }))); s.position.set(BX - 4.5 + i * 3, (.8 + i * 1.1) / 2 + .2, 0); return s; });
const STEPL = ['$', '$$', '$$$', '$$$$'].map((s, i) => { const p = add(texPlane(1.8, .8, 220, 100, (x, w, h) => { x.fillStyle = '#fff'; x.font = '900 72px I'; x.textAlign = 'center'; x.textBaseline = 'middle'; x.fillText(s, w / 2, h / 2 + 4); })); p.position.set(BX - 4.5 + i * 3, .8 + i * 1.1 + .25, 1.62); p.rotation.x = -.2; return p; });
const COIN = add(new THREE.Group()); { const c = cyl(.5, .5, .16, lp(0xffc83a, { metalness: .6, roughness: .3, emissive: 0x332200 }), 28); c.rotation.x = Math.PI / 2; const tx = texPlane(.8, .8, 128, 128, (x) => { x.fillStyle = '#7a5200'; x.font = '900 96px I'; x.textAlign = 'center'; x.textBaseline = 'middle'; x.fillText('⚡', 64, 70); }); tx.position.z = .09; COIN.add(c, tx); }
const LIMIT = add(new THREE.Group()); { const bar = box(.12, 5.8, .12, 0xff2d3d); bar.position.y = 2.9; const flag = texPlane(2.4, .7, 300, 90, (x, w, h) => { x.fillStyle = '#ff2d3d'; rrp(x, 0, 0, 0, w, h, 16); x.fill(); x.fillStyle = '#fff'; x.font = '900 52px I'; x.textAlign = 'center'; x.textBaseline = 'middle'; x.fillText('LÍMITE', w / 2, h / 2 + 3); }); flag.position.set(1.25, 5.4, 0); LIMIT.add(bar, flag); } LIMIT.position.set(BX - 1.5, .2, 1.7);
// ---------- casa en corte con calor (zona C) ----------
const CX = 80; add(box(14, .2, 9, 0xd9d4c8)).position.set(CX, .1, 0);
const ROOM = add(new THREE.Group()); { const fl = box(10, .2, 5, 0xc9a77c); fl.position.y = .3; const bw = box(10, 4, .2, 0xf4ead2); bw.position.set(0, 2.3, -2.5); const lw = box(.2, 4, 5, 0xeadfc4); lw.position.set(-5, 2.3, 0); ROOM.add(fl, bw, lw); } ROOM.position.set(CX, 0, 0);
const FRIDGE = add(new THREE.Group()); { const b = rbox(1.6, 3, 1.4, .1, lp(0xf2f4f7, { roughness: .4 })); b.position.y = 1.9; const ln = box(1.5, .04, .05, 0xb9c0cc); ln.position.set(0, 2.5, .72); const h1 = box(.08, .6, .1, 0x9aa0aa); h1.position.set(.6, 3, .75); const h2 = box(.08, .8, .1, 0x9aa0aa); h2.position.set(.6, 1.6, .75); FRIDGE.add(b, ln, h1, h2); } FRIDGE.position.set(CX - 3.4, 0, -1.3);
const FAN = add(new THREE.Group()); const BLADES = new THREE.Group(); { const base = cyl(.5, .6, .2, 0x2b5fd0); base.position.y = .5; const pole = cyl(.08, .08, 1.6, 0x9aa0aa); pole.position.y = 1.3; const cage = M(new THREE.TorusGeometry(.8, .05, 8, 32), lp(0x2b5fd0)); cage.position.y = 2.3; for (let i = 0; i < 3; i++) { const b = box(.25, .7, .03, 0xffffff); b.position.y = .35; const h = new THREE.Group(); h.rotation.z = i * 2.09; h.add(b); BLADES.add(h); } BLADES.position.y = 2.3; FAN.add(base, pole, cage, BLADES); } FAN.position.set(CX, 0, -.6);
const AC = add(new THREE.Group()); { const b = rbox(2.6, .9, .7, .1, lp(0xfafafa, { roughness: .35 })); const v = box(2.2, .08, .1, 0xb9c0cc); v.position.set(0, -.3, .36); AC.add(b, v); } AC.position.set(CX + 2.8, 3.4, -2.1);
const SUN = add(new THREE.Group()); { const s = sph(1.4, lp(0xffc23a, { emissive: 0xff9a00, emissiveIntensity: .8 }), 24); SUN.add(s); for (let i = 0; i < 10; i++) { const r = box(.18, .8, .1, lp(0xffb020, { emissive: 0xff8800 })); const h = new THREE.Group(); h.rotation.z = i * .628; r.position.y = 2.1; h.add(r); SUN.add(h); } } SUN.position.set(CX + 4.5, 7.5, -3);
const COLD = parts(16, new THREE.MeshBasicMaterial({ color: 0xbfe6ff, transparent: true, opacity: .8 }), .07);
const WIND = parts(18, new THREE.MeshBasicMaterial({ color: 0xffffff, transparent: true, opacity: .7 }), .045);
const MOON = add(sph(.7, lp(0xf2f0e0, { emissive: 0x888866 }), 18)); MOON.position.set(CX - 3.5, 6.5, -3);
// ---------- mesa con recibo (zona D) ----------
const DX = 120; add(box(14, .2, 9, 0xd9d4c8)).position.set(DX, .1, 0);
const DESK = add(new THREE.Group()); { const tp = box(7, .2, 3.4, 0xc9a77c); tp.position.y = 2; DESK.add(tp); for (const [x, z] of [[-3.2, -1.5], [3.2, -1.5], [-3.2, 1.5], [3.2, 1.5]]) { const l = box(.2, 1.9, .2, 0x9a6a40); l.position.set(x, 1, z); DESK.add(l); } } DESK.position.set(DX, .2, 0);
const BILL = add(texPlane(2.6, 3.4, 260, 340, (x, w, h) => { x.fillStyle = '#fbf8ef'; x.fillRect(0, 0, w, h); x.fillStyle = '#2b5fd0'; x.fillRect(0, 0, w, 46); x.fillStyle = '#fff'; x.font = '800 26px I'; x.fillText('FACTURA LUZ', 18, 32); x.fillStyle = '#9aa0aa'; for (let i = 0; i < 7; i++) x.fillRect(18, 70 + i * 26, 140 + (i * 37) % 80, 10); x.fillStyle = '#ff4d4d'; x.fillRect(18, 262, 224, 52); x.fillStyle = '#fff'; x.font = '900 32px I'; x.fillText('412 kWh', 40, 298); }, false)); BILL.rotation.x = -Math.PI / 2; BILL.position.set(DX - 1.2, 2.33, 0); BILL.rotation.z = .08;
const MAG = add(new THREE.Group()); { const r = M(new THREE.TorusGeometry(.6, .1, 8, 28), lp(0x2a2d36)); const gl = M(new THREE.CircleGeometry(.58, 24), lp(0xbfe6ff, { transparent: true, opacity: .35 })); const hd = cyl(.1, .1, 1.1, 0x2a2d36, 8); hd.position.set(.75, -.75, 0); hd.rotation.z = .78; MAG.add(r, gl, hd); }
const MET2 = add(new THREE.Group()); { const bx = rbox(1.4, 1.8, .4, .08, lp(0xdfe3ea, { metalness: .3, roughness: .4 })); const dial = texPlane(1.1, .8, 220, 160, (x, w, h) => { x.fillStyle = '#10141c'; rrp(x, 0, 0, 0, w, h, 16); x.fill(); x.fillStyle = '#3ddc84'; x.font = '800 54px I'; x.textAlign = 'center'; x.fillText('0412', w / 2, 80); x.font = '700 30px I'; x.fillStyle = '#9aa0aa'; x.fillText('kWh', w / 2, 128); }); dial.position.set(0, .2, .25); MET2.add(bx, dial); } MET2.position.set(DX + 2.4, 3.3, -.8);
// ---------- tomas ----------
SHOTS = [
  [0, PS(2), [4, 4.2, 12], [3, 3.6, 9.5], [0, 2.2, 0], [1.5, 2.2, 1.5]],
  [PS(2), PS(6), [3.2, 2.6, 6.5], [2.6, 2.4, 5.4], [2.2, 2, 1.8], [2.2, 2.1, 1.8]],
  [PS(6), PS(9), [BX - 1, 7, 26], [BX + 1, 7.5, 23], [BX + 1, 3, 0], [BX + 1.2, 3.2, 0]],
  [PS(9), PS(13), [CX - 1, 6.5, 22], [CX + 1, 6, 20], [CX, 3, -1], [CX + .2, 3, -1]],
  [PS(13), PS(15), [BX + 3, 6, 22], [BX + 2, 7, 19], [BX + 1, 3.4, 0], [BX + 1.5, 3.6, 0]],
  [PS(15), PS(18), [BX - 3, 8, 26], [BX + 3, 8.5, 26], [BX + 1, 3, 0], [BX + 1, 3, 0]],
  [PS(18), PS(22), [DX - .5, 6.5, 6.5], [DX - 1, 5.6, 5], [DX - 1, 2.3, 0], [DX - 1.1, 2.3, 0]],
  [PS(22), PS(24), [BX + 2, 6, 24], [BX + 1, 5.5, 22], [BX + 1, 3, 0], [BX + .6, 2.8, 0]],
  [PS(24), PS(25), [DX + 2.8, 4, 6], [DX + 2.5, 3.7, 4.8], [DX + 2.4, 3.2, -.8], [DX + 2.4, 3.2, -.8]],
  [PS(25), END, [DX, 6.5, 13], [DX - 1, 7, 14.5], [DX, 2.6, 0], [DX, 2.6, 0]]
];
SHAKE = [[KW.doble - .1, KW.doble + .6, .07], [KW.brincas, KW.brincas + .7, .07]];
function coinStep(i) { return V(BX - 4.5 + i * 3, .8 + i * 1.1 + .2 + .6, .3); }
function animWorld(t) {
  sunAt(t < PS(6) ? 0 : t < PS(9) || inn(t, PS(13), PS(18)) || inn(t, PS(22), PS(24)) ? BX : t < PS(13) ? CX : DX, 0, 0, 14);
  // medidor que corre
  const v = t < KW.doble ? 120 + t * 20 : lerp(170, 412, eout(P(t, KW.doble, 1.2))); meterScreen(v);
  SPARK.visible = inn(t, KW.doble, PS(6)); for (let i = 0; i < 20; i++) { const ph = (t * 1.4 + i * .137) % 1, a = i * 2.3; setP(SPARK, i, 2.2 + Math.cos(a) * ph * 1.4, 2.2 + Math.sin(a) * ph * 1.2, 2.1 + ph * .4, SPARK.visible, 1 - ph); } SPARK.instanceMatrix.needsUpdate = true;
  // escalones
  STEPS.forEach((s, i) => { pop(s, t, PS(6) - .2 + i * .25, .4); }); STEPL.forEach((s, i) => pop(s, t, KW.escalones + .1 + i * .15, .35));
  pop(LIMIT, t, KW.limite - .3, .4);
  let ci = 0; if (t > KW.baratos) ci = 1; if (t > KW.limite + .3) ci = 2; if (t > KW.caro1 - .2) ci = 3; if (t > PS(13) - .1) ci = 1; if (t > KW.brincas) ci = 3; if (t > PS(15)) ci = 3; if (t > PS(22)) ci = 2; if (t > KW.poquito) ci = 1;
  const keys = [0, KW.baratos, KW.limite + .3, KW.caro1 - .2, PS(13) - .1, KW.brincas, PS(22), KW.poquito]; let last = 0; for (const k of keys) if (t > k) last = k;
  const cur = coinStep(ci); const hop = P(t, last, .5); COIN.position.copy(cur); COIN.position.y += Math.sin(hop * Math.PI) * 1.6 * (hop < 1 ? 1 : 0); COIN.rotation.y = t * 2.5; COIN.visible = t > KW.escalones;
  STEPS[3].material.emissive = new THREE.Color(0xff2020); STEPS[3].material.emissiveIntensity = ci === 3 ? .25 + .2 * Math.sin(t * 10) : 0;
  // casa con calor
  pop(SUN, t, KW.calor - .3, .5, PS(11)); SUN.rotation.z = t * .5; MOON.visible = inn(t, KW.noche - .3, PS(13)); pop(MOON, t, KW.noche - .3, .4, PS(13));
  pop(FRIDGE, t, PS(9), .4); FRIDGE.position.x = CX - 3.4 + (inn(t, KW.refri, PS(11)) ? Math.sin(t * 50) * .02 : 0);
  COLD.visible = inn(t, KW.refri, PS(13)); for (let i = 0; i < 16; i++) { const ph = (t * .7 + i * .19) % 1; setP(COLD, i, CX - 3.4 + (i % 4 - 1.5) * .3, 3.6 + ph * 1.2, -1.3 + (i % 3) * .3, COLD.visible, 1 - ph * .6); } COLD.instanceMatrix.needsUpdate = true;
  pop(FAN, t, KW.ventilador - .3, .4); BLADES.rotation.z = t * 16;
  WIND.visible = inn(t, KW.ventilador, PS(13)); for (let i = 0; i < 18; i++) { const ph = (t * .9 + i * .19) % 1; setP(WIND, i, CX + (i % 3 - 1) * .3, 2.1 + (i % 5) * .12, lerp(-.3, 2.4, ph), WIND.visible, 1.4); } WIND.instanceMatrix.needsUpdate = true;
  pop(AC, t, KW.aire - .3, .4);
  // recibo, lupa y medidor
  MAG.visible = inn(t, KW.usaste - .4, PS(22)); if (MAG.visible) { const k = eio(P(t, KW.usaste - .4, .8)); MAG.position.set(lerp(DX + 2, DX - 1.1, k), 2.9, lerp(1.5, .9, k)); MAG.rotation.set(-1.1, 0, 0); }
  BILL.rotation.z = .08 + Math.sin(t * .8) * .02;
}
function overlay2d(t) {
  floaters(t, 8, 'rgba(255,230,140,.8)', 'dust');
  punch(t, KW.doble - .2, PS(2), [['¡EL', '#ffffff'], ['DOBLE!', C.red]], 540, 1240, { size: 120 });
  paper(t, KW.doble, PS(2) + .2, 540, 1500, 380, 150, (g, w, h) => { g.font = '700 26px I'; g.fillStyle = '#777'; g.textAlign = 'center'; g.fillText('TOTAL A PAGAR', 0, -30); g.font = '900 60px I'; g.fillStyle = C.red; g.fillText('× 2', 0, 34); });
  pill(t, KW.robando - .2, PS(3), 540, 1450, '¿TE ESTÁN ROBANDO?', C.red, 'warn');
  pill(t, PS(3), PS(4), 540, 1450, 'PUEDE QUE NO', C.blue, 'dot');
  punch(t, KW.cobran - .7, PS(6), [['¿CÓMO TE', '#ffffff'], ['COBRAN?', C.amber]], 540, 1250, { size: 96 });
  pill(t, KW.escalones - .2, PS(7), 540, 1500, 'SE COBRA POR ESCALONES', C.amber, 'star');
  pill(t, KW.baratos - .4, PS(8), 540, 1500, 'PRIMEROS kWh: MÁS BARATOS', C.green, 'check');
  pill(t, KW.limite - .2, PS(9), 540, 1500, 'PASAS EL LÍMITE → MÁS CARO', C.red, 'warn');
  pill(t, KW.calor - .3, PS(10), 540, 1500, 'LLEGA EL CALOR', C.amber, 'warn');
  const A = [[KW.refri, 'REFRIGERADOR TRABAJA MÁS'], [KW.ventilador, 'VENTILADOR TODA LA NOCHE'], [KW.aire, 'AIRE PRENDIDO']]; A.forEach(([a, txt], i) => pill(t, a - .2, PS(13), 540, 1340 + i * 84, txt, C.red, 'arrow', 32));
  punch(t, KW.brincas - .2, PS(15), [['¡ESCALÓN', '#ffffff'], ['CARO!', C.red]], 540, 1260, { size: 100 });
  punch(t, KW.susc - .1, PE(16) + .3, [['¡SUSCRÍBETE!', '#ffffff']], 540, 1250, { stamp: '#ff2d3d', size: 92, rot: -.05 });
  punch(t, KW.haces - .5, PS(19), [['¿QUÉ', '#ffffff'], ['HAGO?', C.amber]], 540, 1260, { size: 104 });
  pill(t, KW.monto - .3, PS(20), 540, 1450, 'NO MIRES SOLO EL MONTO', C.red, 'x');
  pill(t, KW.usaste - .5, PS(21), 540, 1450, 'MIRA LOS kWh USADOS', C.green, 'check');
  panel(t, KW.recibo - .2, PS(22), 540, 1420, 820, 190, 'BUSCA EN TU RECIBO', C.amber, (g, w, h) => { g.font = '800 36px I'; g.fillStyle = '#fff'; g.textAlign = 'left'; g.textBaseline = 'middle'; g.fillText('¿Dónde empieza el escalón caro?', -w / 2 + 30, 26); });
  pill(t, KW.truco - .3, PS(23), 540, 1500, 'CERCA DEL LÍMITE = EL TRUCO', C.amber, 'star');
  punch(t, KW.poquito - .3, PS(24), [['BAJA UN', '#ffffff'], ['POQUITO', C.green]], 540, 1260, { size: 96 });
  pill(t, KW.medidor - .4, PS(25), 540, 1460, 'REVISA EL MEDIDOR Y RECLAMA', C.blue, 'arrow');
  question(t, KW.coment, '¿Cuánto te llegó la luz este mes?', ['Más que el mes pasado', 'Igual', 'Menos'], 1300);
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
