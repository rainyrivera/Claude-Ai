// Reel 9:16 3D — Estilo C "Escalada 3D" (ref. referencias/estilo-escalada-balcon.mp4) — Cómo reclamar la factura
import * as THREE from 'three';

const W = 1080, H = 1920, END = 72.44;   // END = última palabra + ~4,2 s (cierre 3,7 s)
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
// ================= CÓMO RECLAMAR UNA FACTURA ALTA (4 PASOS) =================
const DISC = (t) => t >= PS(19) && t < PS(23) ? 'El nombre de la oficina cambia según tu país' : t >= PS(23) && t < PS(27) ? 'Los plazos para reclamar dependen de cada país' : 'Recreación ilustrativa';
const KW = { alta: T('alta'), nada: T('nada'), mucha: T('mucha'), devuelven: T('devuelven'), orden: T('orden'), uno: T('uno'), revisa: T('revisa'), compara: T('compara'), anteriores: T('anteriores'), medidor: T('medidor'), coincide: T('coincide'), dos: T('dos'), empresa1: T('empresa'), identificacion: T('identificación'), contrato: T('contrato'), importante: T('importante'), constancia1: T('constancia'), papel: T('papel'), prueba: T('prueba'), susc: T('suscríbete'), tres: T('tres'), responden: T('responden'), oficina: T('oficina'), luz: T('luz'), agua: T('agua'), telefono: T('teléfono'), respuesta2: T('respuesta', 2), cuatro: T('cuatro'), despues: T('después'), plazo: T('plazo'), derecho: T('derecho'), coment: T('comentarios') };
add(road(70, 10, 240)); [[-14, -10, 5, 3, 5, 0xe8d7b0], [22, -11, 6, 3, 6, 0xd9c9a6], [60, -11, 5, 3, 4, 0xf0e0c0], [100, -12, 6, 3, 7, 0xe2d2b0], [142, -11, 5, 3, 4, 0xd9c9a6], [180, -10, 6, 3, 5, 0xe8d7b0]].forEach(b => building(...b));
[[-7, 4.5], [14, 4.5], [33, 4], [55, 4.5], [72, 4], [93, 4.5], [113, 4], [135, 4.5], [152, 4], [173, 4.5]].forEach(([x, z]) => tree(x, z, 1.3));
function plat(x, w = 14) { const p = add(box(w, .2, 9, 0xd9d4c8)); p.position.set(x, .1, 0); return p; }
function desk(x, z = 0, w = 7) { const d = add(new THREE.Group()); const tp = box(w, .2, 3.4, 0xc9a77c); tp.position.y = 2; d.add(tp); for (const [a, b] of [[-w / 2 + .3, -1.5], [w / 2 - .3, -1.5], [-w / 2 + .3, 1.5], [w / 2 - .3, 1.5]]) { const l = box(.2, 1.9, .2, 0x9a6a40); l.position.set(a, 1, b); d.add(l); } d.position.set(x, .2, z); return d; }
function doc(w, h, draw) { const o = texPlane(w, h, Math.round(w * 100), Math.round(h * 100), draw, false); o.castShadow = true; return o; }
const lines = (x, w, h, y0, n, c = '#a9aeb8') => { x.fillStyle = c; for (let i = 0; i < n; i++) x.fillRect(16, y0 + i * 24, (w - 32) * (.55 + ((i * 37) % 40) / 100), 9); };
function numBlock(n, col) { return texPlane(1.3, 1.3, 160, 160, (x, w, h) => { x.fillStyle = col; rrp(x, 0, 0, 0, w, h, 30); x.fill(); x.fillStyle = '#fff'; x.font = '900 110px I'; x.textAlign = 'center'; x.textBaseline = 'middle'; x.fillText(n, w / 2, h / 2 + 6); }); }
// ---------- ZONA A: la factura alta ----------
plat(0); desk(0);
const BILL = add(doc(2.6, 3.4, (x, w, h) => { x.fillStyle = '#fbf8ef'; x.fillRect(0, 0, w, h); x.fillStyle = '#2b5fd0'; x.fillRect(0, 0, w, 46); x.fillStyle = '#fff'; x.font = '800 26px I'; x.fillText('FACTURA', 18, 32); lines(x, w, h, 70, 7); x.fillStyle = '#ff4d4d'; x.fillRect(16, 262, w - 32, 56); x.fillStyle = '#fff'; x.font = '900 34px I'; x.fillText('MUY ALTA', 40, 300); }));
const COINS = Array.from({ length: 8 }, () => { const c = add(cyl(.32, .32, .1, lp(0xffc83a, { metalness: .6, roughness: .3, emissive: 0x2a1a00 }), 20)); return c; });
const WALLET = add(new THREE.Group()); { const w = rbox(1.8, 1.2, .4, .1, lp(0x7a4a2a)); const f = box(1.8, .5, .45, 0x5e3820); f.position.y = .2; WALLET.add(w, f); } WALLET.rotation.x = -1.2; WALLET.position.set(2.2, 2.45, .6);
const NUMS = ['1', '2', '3', '4'].map((n, i) => { const o = add(numBlock(n, [C.blue, C.amber, C.purple, C.green][i])); o.position.set(-2.4 + i * 1.6, 3.6, 1.2); return o; });
// ---------- ZONA B: paso 1 revisa ----------
const BX = 40; plat(BX, 16); desk(BX, 0, 9);
const BARS = [.9, 1.1, 1.0, 2.3].map((h, i) => { const b = add(box(.8, h, .8, lp(i === 3 ? 0xff4d4d : 0x4aa8ff, { roughness: .5 }))); b.position.set(BX - 3.8 + i * 1.05, 2.1 + h / 2, -.6); b.userData.h = h; return b; });
const MLAB = ['ENE', 'FEB', 'MAR', 'HOY'].map((s, i) => { const p = add(texPlane(.9, .35, 120, 46, (x, w, h) => { x.fillStyle = '#2a2d36'; x.font = '800 34px I'; x.textAlign = 'center'; x.textBaseline = 'middle'; x.fillText(s, w / 2, h / 2 + 2); })); p.position.set(BX - 3.8 + i * 1.05, 2.25, .2); p.rotation.x = -.6; return p; });
const MET = add(new THREE.Group()); { const bx = rbox(1.4, 1.8, .4, .08, lp(0xdfe3ea, { metalness: .3, roughness: .4 })); const sc = texPlane(1.1, .7, 220, 140, (x, w, h) => { x.fillStyle = '#10141c'; rrp(x, 0, 0, 0, w, h, 14); x.fill(); x.fillStyle = '#3ddc84'; x.font = '800 60px I'; x.textAlign = 'center'; x.fillText('5280', w / 2, 82); x.font = '700 26px I'; x.fillStyle = '#9aa0aa'; x.fillText('LECTURA', w / 2, 122); }); sc.position.set(0, .2, .25); MET.add(bx, sc); } MET.position.set(BX + 1.8, 3.2, -.6);
const BILL2 = add(doc(1.8, 2.3, (x, w, h) => { x.fillStyle = '#fbf8ef'; x.fillRect(0, 0, w, h); x.fillStyle = '#2b5fd0'; x.fillRect(0, 0, w, 36); lines(x, w, h, 56, 5); x.fillStyle = '#2a2d36'; x.font = '900 40px I'; x.fillText('5280', 30, 200); }));
BILL2.position.set(BX + 3.7, 3.2, -.6);
const EQ = add(texPlane(1, 1, 128, 128, (x) => { x.fillStyle = '#3ddc84'; x.beginPath(); x.arc(64, 64, 60, 0, 6.29); x.fill(); x.strokeStyle = '#fff'; x.lineWidth = 16; x.lineCap = 'round'; x.beginPath(); x.moveTo(34, 66); x.lineTo(56, 88); x.lineTo(96, 42); x.stroke(); })); EQ.position.set(BX + 2.75, 4.6, -.4);
// ---------- ZONA C: paso 2 la empresa ----------
const CX = 80; plat(CX, 16);
const OFF = add(new THREE.Group()); { const b = box(9, 5, 3, 0xdfe7f2); b.position.y = 2.6; const sign = texPlane(5, 1, 500, 100, (x, w, h) => { x.fillStyle = '#2b5fd0'; rrp(x, 0, 0, 0, w, h, 20); x.fill(); x.fillStyle = '#fff'; x.font = '900 60px I'; x.textAlign = 'center'; x.textBaseline = 'middle'; x.fillText('EMPRESA DE LUZ', w / 2, h / 2 + 3); }); sign.position.set(0, 4.4, 1.52); const win = box(3.4, 1.6, .1, lp(0x23406e, { roughness: .3 })); win.position.set(0, 2.6, 1.52); const counter = box(4.4, .3, 1.2, 0xc9a77c); counter.position.set(0, 1.6, 2); OFF.add(b, sign, win, counter); } OFF.position.set(CX, .2, -2);
const IDC = add(doc(1.6, 1, (x, w, h) => { x.fillStyle = '#e8f1ff'; rrp(x, 0, 0, 0, w, h, 12); x.fill(); x.fillStyle = '#9ab0d0'; x.fillRect(12, 16, 50, 60); x.fillStyle = '#2b5fd0'; x.font = '800 18px I'; x.fillText('IDENTIFICACIÓN', 70, 30); lines(x, w, h, 46, 2, '#9ab0d0'); }));
const CONTR = add(doc(1.4, 1.8, (x, w, h) => { x.fillStyle = '#fbf8ef'; x.fillRect(0, 0, w, h); x.fillStyle = '#2a2d36'; x.font = '800 18px I'; x.fillText('CONTRATO N.º', 14, 28); x.font = '900 24px I'; x.fillText('48-1902', 14, 56); lines(x, w, h, 76, 4); }));
const CONST = add(doc(2, 2.6, (x, w, h) => { x.fillStyle = '#fbf8ef'; x.fillRect(0, 0, w, h); x.fillStyle = '#2a2d36'; x.font = '900 26px I'; x.fillText('CONSTANCIA', 18, 38); x.font = '700 20px I'; x.fillText('Reclamo N.º 000123', 18, 70); lines(x, w, h, 96, 4); }));
const STAMP = add(texPlane(1.3, 1.3, 160, 160, (x) => { x.strokeStyle = '#e0303c'; x.lineWidth = 10; x.beginPath(); x.arc(80, 80, 68, 0, 6.29); x.stroke(); x.fillStyle = '#e0303c'; x.font = '900 34px I'; x.textAlign = 'center'; x.textBaseline = 'middle'; x.save(); x.translate(80, 80); x.rotate(-.3); x.fillText('RECIBIDO', 0, 2); x.restore(); }));
// ---------- ZONA D: paso 3 oficina del consumidor ----------
const DX = 120; plat(DX, 16);
const GOV = add(new THREE.Group()); { const base = box(10, .6, 4, 0xe9e4d8); base.position.y = .3; const roof = M(new THREE.CylinderGeometry(.01, 6.2, 1.6, 4, 1), lp(0xd8d0bf, { flatShading: true })); roof.rotation.y = Math.PI / 4; roof.scale.z = .45; roof.position.y = 5.6; const top = box(10, .6, 4, 0xe9e4d8); top.position.y = 4.6; GOV.add(base, roof, top); for (let i = 0; i < 6; i++) { const c = cyl(.28, .32, 3.8, 0xf6f2ea, 14); c.position.set(-4 + i * 1.6, 2.5, 1.4); GOV.add(c); } const wall = box(9.6, 3.8, .2, 0xdcd3c0); wall.position.set(0, 2.5, -1.4); GOV.add(wall); const sign = texPlane(6.6, .8, 660, 80, (x, w, h) => { x.fillStyle = '#1f2a44'; rrp(x, 0, 0, 0, w, h, 12); x.fill(); x.fillStyle = '#fff'; x.font = '900 36px I'; x.textAlign = 'center'; x.textBaseline = 'middle'; x.fillText('PROTECCIÓN AL CONSUMIDOR', w / 2, h / 2 + 3); }); sign.position.set(0, 4.6, 2.02); GOV.add(sign); } GOV.position.set(DX, .2, -2.5);
function bulb() { const g0 = new THREE.Group(); const b = sph(.55, lp(0xffe27a, { emissive: 0xffb020, emissiveIntensity: .6 })); b.position.y = .9; const s = cyl(.25, .25, .4, 0x9aa0aa, 12); s.position.y = .25; g0.add(b, s); return g0; }
function drop3() { const g0 = new THREE.Group(); const s = sph(.5, lp(0x4aa8ff, { roughness: .2 })); s.position.y = .6; const c = M(new THREE.ConeGeometry(.42, .7, 20), lp(0x4aa8ff, { roughness: .2 })); c.position.y = 1.25; g0.add(s, c); return g0; }
function phone3() { const g0 = new THREE.Group(); const b = rbox(.8, 1.5, .14, .05, lp(0x1d2029)); b.position.y = .9; const sc = texPlane(.68, 1.3, 68, 130, (x, w, h) => { const gr = x.createLinearGradient(0, 0, w, h); gr.addColorStop(0, '#3a4fd8'); gr.addColorStop(1, '#b04ad8'); x.fillStyle = gr; x.fillRect(0, 0, w, h); }); sc.position.set(0, .9, .09); g0.add(b, sc); return g0; }
const SERV = [bulb(), drop3(), phone3()].map((o, i) => { add(o); o.position.set(DX - 2.4 + i * 2.4, .2, 2.4); return o; });
const FOLDER = add(doc(1.8, 1.4, (x, w, h) => { x.fillStyle = '#f2c26b'; rrp(x, 0, 0, 0, w, h, 10); x.fill(); x.fillStyle = '#fbf8ef'; x.fillRect(16, 14, w - 32, h - 50); x.fillStyle = '#e0303c'; x.font = '900 22px I'; x.fillText('RECIBIDO', 26, 52); }));
// ---------- ZONA E: paso 4 el plazo ----------
const EX = 160; plat(EX, 16);
const CAL = add(new THREE.Group()); { const b = rbox(3, 3.2, .3, .1, lp(0xffffff)); const hd = texPlane(3, .8, 300, 80, (x, w, h) => { x.fillStyle = '#e0303c'; x.fillRect(0, 0, w, h); x.fillStyle = '#fff'; x.font = '900 48px I'; x.textAlign = 'center'; x.textBaseline = 'middle'; x.fillText('PLAZO', w / 2, h / 2 + 3); }); hd.position.set(0, 1.2, .18); const gr = texPlane(2.7, 2.2, 270, 220, (x, w, h) => { x.fillStyle = '#2a2d36'; x.font = '700 26px I'; x.textAlign = 'center'; for (let i = 0; i < 28; i++) { const cx = 20 + (i % 7) * 38, cy = 34 + Math.floor(i / 7) * 48; x.fillText(String(i + 1), cx + 2, cy); } }); gr.position.set(0, -.35, .18); CAL.add(b, hd, gr); CAL.userData.gr = gr; } CAL.position.set(EX - 2, 3, -1);
const XS = Array.from({ length: 28 }, (_, i) => { const o = add(texPlane(.32, .32, 64, 64, (x) => { x.strokeStyle = '#e0303c'; x.lineWidth = 10; x.lineCap = 'round'; x.beginPath(); x.moveTo(12, 12); x.lineTo(52, 52); x.moveTo(52, 12); x.lineTo(12, 52); x.stroke(); })); o.position.set(EX - 2 - 1.18 + (i % 7) * .38, 3 + .55 - Math.floor(i / 7) * .48, -.8); return o; });
const HG = add(new THREE.Group()); { const f1 = cyl(.9, .9, .15, 0x8a5a36, 20); f1.position.y = 2.6; const f2 = f1.clone(); f2.position.y = 0; const gl1 = M(new THREE.ConeGeometry(.8, 1.2, 20), lp(0xbfe6ff, { transparent: true, opacity: .4 })); gl1.position.y = 1.9; gl1.rotation.x = Math.PI; const gl2 = M(new THREE.ConeGeometry(.8, 1.2, 20), lp(0xbfe6ff, { transparent: true, opacity: .4 })); gl2.position.y = .7; const s1 = M(new THREE.ConeGeometry(.6, .9, 20), lp(0xffb020)); s1.position.y = 2.05; s1.rotation.x = Math.PI; const s2 = M(new THREE.ConeGeometry(.6, .9, 20), lp(0xffb020)); s2.position.y = .55; HG.add(f1, f2, gl1, gl2, s1, s2); HG.userData.s1 = s1; HG.userData.s2 = s2; } HG.position.set(EX + 2.6, .3, 0);
const NB = [[BX, KW.uno, C.blue, '1'], [CX, KW.dos, C.amber, '2'], [DX, KW.tres, C.purple, '3'], [EX, KW.cuatro, C.green, '4']].map(([x, a, c, n]) => { const o = add(numBlock(n, c)); o.position.set(x, 6.2, 1); o.scale.setScalar(1.3); o.userData.a = a; return o; });
// ---------- tomas ----------
SHOTS = [
  [0, PS(2), [0, 6.5, 8], [0, 5.5, 7], [0, 2.3, 0], [0, 2.3, .2]],
  [PS(2), PS(5), [-1, 6.5, 17], [1, 6.2, 16], [0, 3.2, 0], [0, 3.4, 0]],
  [PS(5), PS(10), [BX, 7, 23], [BX + .6, 6.6, 21], [BX + .3, 3.2, 0], [BX + .4, 3.3, 0]],
  [PS(10), PS(17), [CX - 1, 6.5, 20], [CX + .5, 6, 18.5], [CX, 2.8, 0], [CX, 2.8, 0]],
  [PS(17), PS(19), [CX + 3, 8, 22], [CX - 3, 8, 22], [CX, 3, 0], [CX, 3, 0]],
  [PS(19), PS(23), [DX - 2, 7, 26], [DX + 1, 6.5, 24], [DX, 3.2, 0], [DX, 3.2, 0]],
  [PS(23), PS(27), [EX + .5, 6.5, 20], [EX, 6, 18.5], [EX + .3, 3, 0], [EX + .3, 3, 0]],
  [PS(27), END, [EX + 1, 8, 24], [EX - 1, 9, 26], [EX, 3, 0], [EX, 3, 0]]
];
SHAKE = [[KW.alta - .1, KW.alta + .5, .06], [KW.prueba - .1, KW.prueba + .4, .05]];
function animWorld(t) {
  sunAt(t < PS(5) ? 0 : t < PS(10) ? BX : t < PS(19) ? CX : t < PS(23) ? DX : EX, 0, 0, 16);
  // factura cae sobre la mesa
  BILL.visible = t < PS(5); { const k = P(t, .1, .6); BILL.position.set(-.6, lerp(7, 2.33, k * k), 0); BILL.rotation.set(-Math.PI / 2, 0, .08 + (1 - k) * 1.5); }
  // monedas vuelven a la cartera
  pop(WALLET, t, KW.mucha - .3, .4, PS(5));
  COINS.forEach((c, i) => { c.visible = inn(t, KW.devuelven - .2, PS(5)); const k = eio(P(t, KW.devuelven - .2 + i * .12, .7)); const a = i * .8; c.position.set(lerp(-3 + Math.cos(a), 2.2, k), lerp(5 + Math.sin(a), 2.8, k) + Math.sin(k * Math.PI) * 1.2, lerp(-1, .6, k)); c.rotation.set(t * 4 + i, 0, t * 2); });
  NUMS.forEach((o, i) => { pop(o, t, KW.orden - .2 + i * .18, .4, PS(5)); o.position.y = 4.2 + Math.sin(t * 2 + i) * .08; });
  // paso 1
  BARS.forEach((b, i) => { const k = eout(P(t, KW.compara + i * .2, .5)); b.visible = t > KW.compara - .1; b.scale.y = Math.max(.01, k); b.position.y = 2.1 + b.userData.h * k / 2; }); MLAB.forEach((m, i) => pop(m, t, KW.compara + i * .2, .35));
  BARS[3].material.emissive = new THREE.Color(0xff2020); BARS[3].material.emissiveIntensity = inn(t, KW.anteriores - .2, PS(9)) ? .3 + .2 * Math.sin(t * 10) : 0;
  pop(MET, t, KW.medidor - .3, .4); pop(BILL2, t, KW.medidor, .4); pop(EQ, t, KW.coincide, .4);
  // paso 2
  IDC.visible = t > KW.identificacion - .2; { const k = eout(P(t, KW.identificacion - .2, .5)); IDC.position.set(CX - 2.2, lerp(5, 2.15, k), 1.8); IDC.rotation.set(-Math.PI / 2, 0, .15); }
  CONTR.visible = t > KW.contrato - .2; { const k = eout(P(t, KW.contrato - .2, .5)); CONTR.position.set(CX - .5, lerp(5, 2.16, k), 1.9); CONTR.rotation.set(-Math.PI / 2, 0, -.1); }
  CONST.visible = t > KW.constancia1 - .5; { const k = eback(P(t, KW.constancia1 - .5, .6)); CONST.position.set(CX + 1.6, 2.6 + .1, 2.6); CONST.rotation.set(-.35, 0, .05); CONST.scale.setScalar(Math.max(.001, k)); }
  STAMP.visible = t > KW.constancia1 + .4; { const k = P(t, KW.constancia1 + .4, .25); STAMP.position.set(CX + 1.9, 2.4, 3.05); STAMP.rotation.set(-.35, 0, -.2); STAMP.scale.setScalar(lerp(2.2, 1, eout(k))); STAMP.material.opacity = k; }
  // paso 3
  [KW.luz, KW.agua, KW.telefono].forEach((a, i) => { pop(SERV[i], t, a - .2, .4); SERV[i].rotation.y = Math.sin(t * 1.4 + i) * .4; });
  FOLDER.visible = t > KW.respuesta2 - .3; { const k = eout(P(t, KW.respuesta2 - .3, .6)); FOLDER.position.set(lerp(DX + 6, DX + .5, k), 1.3, 3.2); FOLDER.rotation.set(-.4, 0, 0); }
  // paso 4
  NB.forEach(o => { pop(o, t, o.userData.a - .3, .45); o.rotation.y = Math.sin(t * 1.5) * .3; });
  const nx = Math.floor(clamp((t - KW.despues) / (PS(27) - KW.despues)) * 28); XS.forEach((o, i) => { o.visible = t > KW.despues && i < nx; });
  const sk = P(t, KW.cuatro, PS(27) - KW.cuatro); HG.userData.s1.scale.setScalar(Math.max(.01, 1 - sk)); HG.userData.s2.scale.setScalar(Math.max(.01, sk)); HG.rotation.y = t * .3;
}
function overlay2d(t) {
  floaters(t, 8, 'rgba(255,255,255,.8)', 'dust');
  punch(t, KW.alta - .3, PS(1), [['FACTURA', '#ffffff'], ['ALTA', C.red]], 540, 1260, { size: 104 });
  paper(t, PS(1), PS(2), 540, 1440, 700, 150, (g, w, h) => { g.font = 'italic 800 40px I'; g.fillStyle = '#2a2d36'; g.textAlign = 'center'; g.textBaseline = 'middle'; g.fillText('"No se puede reclamar…"', 0, 2); });
  pill(t, KW.devuelven - .3, PS(4), 540, 1460, 'LE DEVUELVEN EL DINERO', C.green, 'check');
  punch(t, KW.orden - .4, PS(5), [['EN', '#ffffff'], ['ORDEN', C.amber]], 540, 1260, { size: 110 });
  const ST = (n, col, a, b, txt) => { punch(t, a - .2, a + 1.3, [['PASO', '#ffffff'], [n, col]], 540, 1250, { size: 110 }); pill(t, a + 1.1, b, 540, 1520, txt, col, 'check', 34); };
  ST('1', C.blue, KW.uno, PS(10), 'REVISA ANTES DE RECLAMAR');
  pill(t, KW.compara - .2, PS(9), 540, 1400, 'COMPARA CON MESES ANTERIORES', C.blue, 'arrow', 32);
  pill(t, KW.medidor - .2, PS(10), 540, 1400, 'MEDIDOR = FACTURA', C.green, 'check', 34);
  ST('2', C.amber, KW.dos, PS(13), 'RECLAMA PRIMERO A LA EMPRESA');
  pill(t, KW.identificacion - .2, PS(13), 540, 1400, 'IDENTIFICACIÓN + N.º DE CONTRATO', C.amber, 'dot', 32);
  punch(t, KW.importante - .2, PS(14), [['LO MÁS', '#ffffff'], ['IMPORTANTE', C.amber]], 540, 1260, { size: 88 });
  pill(t, KW.constancia1 - .6, PS(15), 540, 1450, 'N.º DE RECLAMO O CONSTANCIA', C.amber, 'star');
  punch(t, KW.papel - .4, PS(17), [['SIN PAPEL,', '#ffffff'], ['NO HAY PRUEBA', C.red]], 540, 1260, { size: 64 });
  punch(t, KW.susc - .1, PS(18) + .6, [['¡SUSCRÍBETE!', '#ffffff']], 540, 1250, { stamp: '#ff2d3d', size: 92, rot: -.05 });
  ST('3', C.purple, KW.tres, PS(21), 'NO TE QUEDES AHÍ');
  pill(t, KW.oficina - .3, PS(23), 540, 1400, 'OFICINA QUE PROTEGE AL CONSUMIDOR', C.purple, 'star', 31);
  pill(t, KW.respuesta2 - .3, PS(23), 540, 1490, 'LLEVA LA RESPUESTA O TU CONSTANCIA', C.blue, 'arrow', 31);
  ST('4', C.green, KW.cuatro, PS(25), 'NO LO DEJES PARA DESPUÉS');
  pill(t, KW.plazo - .4, PS(27), 540, 1400, 'LOS RECLAMOS TIENEN PLAZO', C.red, 'clock');
  punch(t, KW.derecho - .6, PS(27), [['PIERDES EL', '#ffffff'], ['DERECHO', C.red]], 540, 1250, { size: 88 });
  question(t, KW.coment, '¿Alguna vez reclamaste una factura?', ['Sí, y me resolvieron', 'Sí, y nada', 'Nunca he reclamado'], 1300);
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
