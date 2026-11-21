// Reel 9:16 3D — Estilo C "Escalada 3D" (ref. referencias/estilo-escalada-balcon.mp4) — Lo que borras no se borra
import * as THREE from 'three';

const W = 1080, H = 1920, END = 72.57;   // END = última palabra + ~4,2 s (cierre 3,7 s)
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
// ================= LO QUE BORRAS NO SE BORRA =================
const DISC = 'Recreación ilustrativa · simplificado';
const KW = { borraste: T('borraste'), vendes: T('vendes'), recup1: T('recuperar'), papel1: T('papelera'), dias: T('días'), recup2: T('recuperar', 2), curioso: T('curioso'), vacies: T('vacíes'), verdad: T('verdad'), biblio: T('biblioteca'), indice2: T('índice', 2), estante: T('estante'), libre: T('libre'), encima1: T('encima'), susc: T('suscríbete'), programas: T('programas'), querer: T('querer'), usar: T('usar'), ayuda: T('ayuda'), encima2: T('encima', 2), vender: T('vender'), fotos: T('fotos'), copia: T('copia'), resta: T('restablecimiento'), coment: T('comentarios') };
// ---------- ZONA A: plaza con el celular gigante ----------
add(road(0, 9, 120)); [[-9, -10, 4, 3, 7, 0xe8d7b0], [9, -12, 5, 3, 9, 0xd9c9a6], [-16, -14, 4, 3, 5, 0xf0e0c0], [17, -9, 4, 3, 6, 0xe2d2b0]].forEach(b => building(...b));
[[-6, 3], [9, -1.5], [-11, 1], [12, 1.5]].forEach(([x, z]) => tree(x, z, 1.2));
add(box(9, .2, 6, 0xd9d4c8)).position.set(0, .1, 1);
const PHN = add(new THREE.Group()); PHN.position.set(0, .2, 0);
{ const body = rbox(3.1, 6.2, .32, .08, lp(0x1d2029, { roughness: .4 })); body.position.y = 3.1; PHN.add(body); const cam1 = cyl(.12, .12, .05, 0x0b0d12); cam1.rotation.x = Math.PI / 2; cam1.position.set(0, 5.95, .17); PHN.add(cam1); const st = box(1.6, .25, 1.2, 0x9aa0aa); st.position.set(0, .12, .2); PHN.add(st); }
const SCR = canvasTex(512, 1024); const scr = M(new THREE.PlaneGeometry(2.86, 5.9), new THREE.MeshBasicMaterial({ map: SCR.tx, toneMapped: false }), false); scr.position.set(0, 3.1, .2); PHN.add(scr);
function photoArt(x, w, h) { const gr = x.createLinearGradient(0, 0, 0, h); gr.addColorStop(0, '#ff9a5a'); gr.addColorStop(.55, '#ffd27a'); gr.addColorStop(.56, '#2f8fd8'); gr.addColorStop(1, '#1d5fa8'); x.fillStyle = gr; x.fillRect(0, 0, w, h); x.fillStyle = '#fff2b0'; x.beginPath(); x.arc(w * .5, h * .55, w * .16, Math.PI, 0); x.fill(); x.fillStyle = '#f1d9a0'; x.fillRect(0, h * .82, w, h * .18); x.fillStyle = '#2d6b3a'; x.beginPath(); x.moveTo(w * .12, h * .82); x.lineTo(w * .16, h * .45); x.lineTo(w * .2, h * .82); x.fill(); x.beginPath(); x.ellipse(w * .16, h * .45, w * .12, h * .05, 0, 0, 6.29); x.fill(); }
// la foto 3D (sale de la pantalla)
const PHOTO = add(new THREE.Group()); { const fr = box(1.6, 1.25, .06, 0xffffff); PHOTO.add(fr); const pl = texPlane(1.46, 1.11, 256, 196, photoArt); pl.position.z = .035; PHOTO.add(pl); }
const photoMats = []; PHOTO.traverse(o => { if (o.isMesh) { o.material = o.material.clone(); o.material.transparent = true; photoMats.push(o.material); } });
// cartel SE VENDE
const SALE = add(texPlane(2.2, .8, 440, 160, (x, w, h) => { x.fillStyle = '#ffd23a'; rrp(x, 0, 4, 4, w - 8, h - 8, 18); x.fill(); x.strokeStyle = '#1a1a1a'; x.lineWidth = 8; x.stroke(); x.fillStyle = '#1a1a1a'; x.font = '900 86px I'; x.textAlign = 'center'; x.textBaseline = 'middle'; x.fillText('SE VENDE', w / 2, h / 2 + 4); }, false)); SALE.position.set(.9, 4.9, .6); SALE.rotation.z = -.12;
// lupa (otra persona recupera)
const LUPA = add(new THREE.Group()); { const r = M(new THREE.TorusGeometry(.6, .1, 10, 32), lp(0x2a2d36)); const gl = M(new THREE.CircleGeometry(.58, 32), new THREE.MeshStandardMaterial({ color: 0xbfe6ff, transparent: true, opacity: .35 }), false); const h = cyl(.09, .09, 1.2, 0x7a5230); h.position.set(.75, -.75, 0); h.rotation.z = Math.PI / 4; LUPA.add(r, gl, h); }
// papelera gigante
const BIN = add(new THREE.Group()); BIN.position.set(4.6, .2, 1.2);
{ const b = cyl(1.05, .85, 2.2, lp(0x3d7bff), 32); b.position.y = 1.1; BIN.add(b); for (let i = 0; i < 8; i++) { const r = box(.06, 1.9, .06, 0x2a5ed0); const a = i / 8 * Math.PI * 2; r.position.set(Math.sin(a) * .98, 1.1, Math.cos(a) * .98); BIN.add(r); } }
const LID = new THREE.Group(); LID.position.set(-1.05, 2.25, 0); BIN.add(LID); { const l = cyl(1.12, 1.12, .14, lp(0x2a5ed0), 32); l.position.x = 1.05; LID.add(l); const kn = box(.4, .14, .14, 0x1c3f99); kn.position.set(1.05, .12, 0); LID.add(kn); }
// nube (copia) + botón rojo
const CLOUD = add(new THREE.Group()); for (let k = 0; k < 6; k++) { const s = sph(.55 + (k % 3) * .15, lp(0xffffff, { roughness: 1 }), 14); s.position.set(k * .5 - 1.25, (k % 2) * .25, 0); s.scale.y = .8; CLOUD.add(s); } CLOUD.position.set(-2.8, 7.2, 0);
const BTN = add(new THREE.Group()); { const pd = cyl(.7, .8, 1.1, 0xe6e6e6); pd.position.y = .55; const cap = cyl(.5, .5, .25, lp(0xff2d3d, { emissive: 0x550000 })); cap.position.y = 1.2; cap.name = 'cap'; BTN.add(pd, cap); } BTN.position.set(-3.6, .2, 2.2);
const CUBES = []; for (let i = 0; i < 6; i++) { const c = box(.35, .28, .04, 0xffffff); const p = texPlane(.31, .24, 64, 48, photoArt); p.position.z = .025; c.add(p); add(c); CUBES.push(c); }
const LAPTOP = add(new THREE.Group()); { const b = box(2.2, .1, 1.5, 0x9aa0aa); const s = box(2.2, 1.45, .08, 0x1d2029); s.position.set(0, .72, -.72); s.rotation.x = -.15; const sc = texPlane(2.0, 1.25, 256, 160, (x, w, h) => { x.fillStyle = '#2b6cd6'; x.fillRect(0, 0, w, h); x.fillStyle = '#fff'; x.font = '800 30px I'; x.textAlign = 'center'; x.fillText('Mis fotos', w / 2, 40); for (let i = 0; i < 6; i++) { x.fillStyle = ['#ffb020', '#3ddc84', '#ff4d4d', '#a98bff', '#4aa8ff', '#ffd27a'][i]; x.fillRect(24 + (i % 3) * 74, 64 + Math.floor(i / 3) * 46, 60, 38); } }); sc.position.set(0, .72, -.67); sc.rotation.x = -.15; LAPTOP.add(b, s, sc); } LAPTOP.position.set(3.2, 1.4, 2.2); LAPTOP.rotation.y = -.35;
const tableA = add(box(2.6, 1.2, 1.8, 0xc9a77c)); tableA.position.set(3.2, .8, 2.2);
// ---------- ZONA B: el disco por dentro = biblioteca ----------
const BX = 40; add(box(16, .3, 10, 0xe9e4d8)).position.set(BX, .15, -1);
for (const z of [-6]) { const wl = box(16, 7, .3, 0xf3ead8); wl.position.set(BX, 3.5, z); add(wl); }
const SHELF = add(new THREE.Group()); SHELF.position.set(BX + 1.2, .3, -4.6);
{ const wd = lp(0x9a6a40); for (const x of [-3.6, 3.6]) { const s = box(.2, 5.2, 1.2, wd); s.position.set(x, 2.6, 0); SHELF.add(s); } for (let l = 0; l < 5; l++) { const b = box(7.4, .14, 1.2, wd); b.position.set(0, .1 + l * 1.25, 0); SHELF.add(b); } const bk = box(7.4, 5.2, .1, lp(0x7a5230)); bk.position.set(0, 2.6, -.55); SHELF.add(bk); }
const bookCols = [0xff4d4d, 0x4aa8ff, 0x3ddc84, 0xffb020, 0xa98bff, 0xff8a3d, 0x2a9d8f, 0xe76f51, 0x6c757d];
const BOOKS = []; for (let l = 0; l < 4; l++) { let x = -3.35; while (x < 3.3) { const w = .18 + rnd() * .14, h = .75 + rnd() * .35; const b = box(w, h, .8, bookCols[Math.floor(rnd() * bookCols.length)]); b.position.set(x + w / 2, .17 + l * 1.25 + h / 2, 0); SHELF.add(b); BOOKS.push({ b, l, x: x + w / 2 }); x += w + .02; } }
// el libro "foto" (rojo brillante) en el estante 2
const TB = BOOKS.filter(o => o.l === 1)[9]; const TBM = lp(0xff2d3d, { emissive: 0xff2d3d, emissiveIntensity: 0 }); TB.b.material = TBM; const tbPos = () => TB.b.getWorldPosition(new THREE.Vector3());
const FREE = add(M(new THREE.BoxGeometry(.6, 1.2, 1.0), new THREE.MeshBasicMaterial({ color: 0x3ddc84, transparent: true, opacity: 0, depthWrite: false, depthTest: false }), false)); FREE.renderOrder = 5;
const ARW = add(new THREE.Group()); { const c = M(new THREE.ConeGeometry(.28, .5, 16), lp(0xffb020, { emissive: 0x553300 })); c.rotation.x = Math.PI; const st = cyl(.1, .1, .6, 0xffb020); st.position.y = .55; ARW.add(c, st); }
const NEWB = add(box(.5, 1.0, .82, lp(0x4aa8ff, { transparent: true, opacity: .55 })));
const RAIN = []; for (let i = 0; i < 9; i++) { const b = box(.32, .9, .8, bookCols[i % bookCols.length]); add(b); RAIN.push(b); }
// índice (pizarra)
const IDX = canvasTex(512, 640); const idxB = add(new THREE.Group()); { const fr = box(3.1, 3.8, .14, 0x7a5230); const pl = M(new THREE.PlaneGeometry(2.9, 3.6), new THREE.MeshBasicMaterial({ map: IDX.tx, toneMapped: false }), false); pl.position.z = .08; const lg = box(.12, 1.6, .12, 0x5a3a20); lg.position.set(0, -2.6, -.2); idxB.add(fr, pl, lg); } idxB.position.set(BX - 4.6, 3.1, -1.2); idxB.rotation.y = .35;
function drawIndex(strike) { const x = IDX.x; x.fillStyle = '#163a2c'; x.fillRect(0, 0, 512, 640); x.fillStyle = '#fff'; x.font = '900 46px I'; x.textAlign = 'center'; x.fillText('ÍNDICE', 256, 64); x.textAlign = 'left'; x.font = '600 28px I';
  const rows = [['boda.jpg', 'Est. 1'], ['playa.jpg', 'Est. 2'], ['trabajo.pdf', 'Est. 3'], ['chat.txt', 'Est. 1'], ['video.mp4', 'Est. 4'], ['notas.doc', 'Est. 3']];
  rows.forEach((r, i) => { const y = 140 + i * 78; const hot = i === 1; x.fillStyle = hot ? '#ffd27a' : 'rgba(255,255,255,.88)'; x.fillText(r[0], 40, y); x.fillText('→ ' + r[1], 330, y); if (hot && strike > 0) { x.strokeStyle = '#ff4d4d'; x.lineWidth = 9; x.beginPath(); x.moveTo(30, y - 9); x.lineTo(30 + 450 * strike, y - 9); x.stroke(); } });
  IDX.tx.needsUpdate = true; }
// garra (programa de recuperación)
const CLAW = add(new THREE.Group()); { const r = box(.12, 6, .12, 0x2a2d36); r.position.y = 3; const h = box(.7, .3, .5, lp(0x4aa8ff)); const f1 = box(.08, .6, .4, 0x2a2d36); f1.position.set(-.3, -.4, 0); const f2 = f1.clone(); f2.position.x = .3; CLAW.add(r, h, f1, f2); }
// STOP
const STOPS = add(new THREE.Group()); { const o = M(new THREE.CylinderGeometry(1, 1, .1, 8), lp(0xe02424)); o.rotation.x = Math.PI / 2; o.rotation.y = Math.PI / 8; const tx = texPlane(1.5, .55, 256, 96, (x, w, h) => { x.fillStyle = '#fff'; x.font = '900 80px I'; x.textAlign = 'center'; x.textBaseline = 'middle'; x.fillText('STOP', w / 2, h / 2 + 4); }); tx.position.z = .06; const pst = box(.12, 2.4, .12, 0x9aa0aa); pst.position.y = -1.9; STOPS.add(o, tx, pst); } STOPS.position.set(BX - 1.6, 3.4, 1.8);

// ---------- tomas de cámara [t0, t1, pos0, pos1, look0, look1, fov] ----------
const tB = PS(9);
SHOTS = [
  [0, PS(4) - .2, [-1, 4.2, 15.5], [.6, 3.9, 14], [0, 3.3, 0], [0, 3.2, 0]],
  [PS(4) - .2, KW.curioso, [1.2, 3.8, 16], [2.6, 3.6, 15], [2.2, 2.4, 0], [3.2, 2.2, .6]],
  [KW.curioso, tB, [4.0, 4.2, 12.5], [4.4, 5.0, 10.5], [4.5, 1.7, 1.2], [4.6, 1.4, 1.2]],
  [tB, PS(10) + .3, [BX + 1, 5, 21], [BX + .5, 4.4, 18], [BX - .8, 2.8, -2], [BX - .8, 2.8, -2]],
  [PS(10) + .3, PS(11), [BX - 2.2, 3.6, 8.5], [BX - 2.6, 3.4, 7.4], [BX - 4.6, 3.1, -1.2], [BX - 4.6, 3.1, -1.2]],
  [PS(11), PS(14), [BX + 1.4, 3.0, 8.5], [BX + .2, 2.7, 7], [BX - .3, 2.0, -4.6], [BX - .3, 2.0, -4.6]],
  [PS(14), PS(15), [BX + 4, 4.2, 15], [BX - 2, 4.2, 15], [BX, 2.6, -3], [BX, 2.6, -3]],
  [PS(15), PS(17), [BX + 1.2, 3.6, 9.5], [BX + .4, 3.8, 9], [BX - .3, 2.6, -4.6], [BX - .3, 3.0, -4.6]],
  [PS(17), PS(19), [BX + 1, 4.4, 16], [BX - .5, 4.8, 17], [BX - .5, 2.8, -2], [BX, 2.8, -2.5]],
  [PS(19), PS(22), [2, 4.4, 17], [.8, 5.0, 18.5], [.6, 3.5, 0], [.2, 4.0, 0]],
  [PS(22), END, [0, 6, 21], [0, 6.6, 22.5], [0, 4.2, 0], [0, 4.2, 0]]
];
SHAKE = [[PS(18) + .3, PS(18) + 1.2, .07], [KW.resta + .2, KW.resta + .8, .08]];

function drawScreen(t) {
  const x = SCR.x, w = 512, h = 1024; const reset = t > KW.resta + .3;
  x.fillStyle = reset ? '#111827' : '#f4f6fb'; x.fillRect(0, 0, w, h);
  if (reset) { x.fillStyle = '#fff'; x.font = '800 74px I'; x.textAlign = 'center'; x.fillText('Hola', w / 2, 470); x.font = '500 30px I'; x.fillStyle = 'rgba(255,255,255,.7)'; x.fillText('Configura tu teléfono', w / 2, 530); x.fillStyle = '#3d8bff'; rrp(x, 0, 156, 800, 200, 70, 35); x.fill(); SCR.tx.needsUpdate = true; return; }
  x.fillStyle = '#16161c'; x.font = '800 40px I'; x.textAlign = 'left'; x.fillText('Galería', 34, 110);
  for (let i = 0; i < 12; i++) { const cx = 24 + (i % 3) * 158, cy = 150 + Math.floor(i / 3) * 158; if (i === 4) continue; x.fillStyle = ['#ffd27a', '#9fd6f2', '#c8e6a0', '#f7b2b7', '#d0c4f7', '#ffe0a3'][i % 6]; x.fillRect(cx, cy, 148, 148); }
  // hueco de la foto 4
  const gone = t > KW.borraste + .2 && t < PS(1) + .4; x.strokeStyle = '#3d8bff'; x.lineWidth = 4; x.setLineDash([10, 8]); x.strokeRect(24 + 158, 150 + 158, 148, 148); x.setLineDash([]);
  if (!gone) { x.save(); x.translate(24 + 158, 150 + 158); photoArt(x, 148, 148); x.restore(); }
  SCR.tx.needsUpdate = true;
}
// ---------- animación del mundo ----------
function animWorld(t) {
  sunAt(t < tB || t >= PS(19) ? 0 : BX, 0, 0, 14);
  drawScreen(t); drawIndex(eout(P(t, PS(10) + .8, .7)));
  // foto: sale de la pantalla → fantasma → vuelve → papelera → vuelve → vaciado
  const base = V(0, 3.3, 1.0); let pp = base.clone(), op = 1, sc = 1, vis = t < KW.vacies + 1.5;
  if (t < KW.borraste) { const k = eback(P(t, .1, .5)); sc = k; }
  else if (t < PS(1)) { op = lerp(1, .22, P(t, KW.borraste, .35)); }
  else if (t < PS(4)) { op = lerp(.22, 1, P(t, PS(1) + .3, .5)) * (t < PS(1) + 1 ? (.6 + .4 * Math.sin(t * 40)) : 1); }
  if (inn(t, KW.papel1 - .4, PS(6))) { const k = eio(P(t, KW.papel1 - .4, .9)); const end = V(4.6, 2.9, 1.2); pp = base.clone().lerp(end, k); pp.y += Math.sin(k * Math.PI) * 2; sc = lerp(1, .55, k); op = 1; }
  if (inn(t, PS(6), KW.curioso)) { const k = eback(P(t, PS(6) + .2, .6)); pp = V(4.6, lerp(2.9, 4.6, k), 1.4); sc = .8; }
  if (t >= KW.curioso) { const k = P(t, KW.vacies + .3, 1.0); pp = V(4.6, lerp(3.0, -1.5, k * k), 1.2); sc = .55; }
  PHOTO.visible = vis && t < tB; PHOTO.position.copy(pp); PHOTO.scale.setScalar(Math.max(.001, sc)); PHOTO.rotation.set(0, Math.sin(t * 1.2) * .08, Math.sin(t * .9) * .04); photoMats.forEach(m => m.opacity = op);
  // tapa de la papelera
  const lidOpen = Math.max(eout(P(t, KW.papel1 - .5, .3)) * (1 - eout(P(t, KW.papel1 + .7, .3))), eout(P(t, PS(6), .25)) * (1 - eout(P(t, PS(6) + .9, .3))), eout(P(t, KW.vacies, .3)) * (1 - eout(P(t, KW.vacies + 1.6, .3))));
  LID.rotation.z = lidOpen * 1.7 + (inn(t, KW.curioso, KW.vacies) ? Math.sin(t * 30) * .05 : 0);
  BIN.rotation.z = inn(t, KW.vacies, KW.vacies + 1.4) ? -Math.sin(P(t, KW.vacies, 1.4) * Math.PI) * .5 : 0;
  pop(SALE, t, KW.vendes, .45, PS(4)); if (t >= PS(19)) pop(SALE, t, KW.vender, .45, PS(22));
  LUPA.visible = inn(t, PS(3), PS(4)); if (LUPA.visible) { const k = P(t, PS(3), PE(3) - PS(3)); LUPA.position.set(lerp(-1.6, .4, k), 3.4 + Math.sin(k * 6) * .3, 2.2); LUPA.scale.setScalar(eback(P(t, PS(3), .35))); }
  // zona B
  TBM.emissiveIntensity = inn(t, PS(11), PS(19)) ? .9 + .6 * Math.sin(t * 6) : 0;
  const tp = tbPos(); ARW.visible = inn(t, PS(11), PS(15)); ARW.position.set(tp.x, tp.y + .95 + Math.sin(t * 5) * .1, tp.z + 1.0); ARW.scale.setScalar(.7); FREE.position.copy(tp); FREE.material.opacity = inn(t, KW.libre - .2, PS(17)) ? .45 * eout(P(t, KW.libre - .2, .4)) : 0;
  NEWB.visible = inn(t, KW.encima1 - 1.2, PS(14) + .4); if (NEWB.visible) { const k = eout(P(t, KW.encima1 - 1.2, .8)), back = eio(P(t, PS(14) - .2, .6)); NEWB.position.set(tp.x, tp.y + lerp(4, 1.3, k) + back * 4, tp.z + .1); NEWB.rotation.z = Math.sin(t * 3) * .05; }
  // garra: baja, agarra y sube el libro
  CLAW.visible = inn(t, PS(15) - .3, PS(17)); if (CLAW.visible) { const dn = eio(P(t, PS(15), 1.0)), up = eio(P(t, PS(15) + 1.6, 1.1)); CLAW.position.set(tp.x, lerp(9, tp.y + 1.0, dn) + up * 1.6, tp.z + .1); }
  if (inn(t, PS(15) + 1.6, PS(17))) { const up = eio(P(t, PS(15) + 1.6, 1.1)); TB.b.position.y = .17 + 1.25 + TB.b.geometry.parameters.height / 2 + up * 1.6; } else TB.b.position.y = .17 + 1.25 + TB.b.geometry.parameters.height / 2;
  pop(STOPS, t, KW.usar - .1, .45, PS(18) + .3);
  RAIN.forEach((b, i) => { const a = PS(18) + i * .18; b.visible = inn(t, a, PS(19)); if (b.visible) { const x = BX - 2.6 + i * .7, k = P(t, a, .55); b.position.set(x, lerp(9, 3.0 + (i % 2) * 1.25, k * k), -4.6); b.rotation.z = (1 - k) * 2 + (i % 3 - 1) * .15; } });
  // zona A final: laptop, copia en la nube, botón
  pop(LAPTOP, t, KW.vender + .3, .45); tableA.visible = LAPTOP.visible; if (tableA.visible) tableA.scale.copy(LAPTOP.scale);
  pop(CLOUD, t, KW.copia - .2, .5); CUBES.forEach((c, i) => { const a = KW.copia + i * .15; c.visible = inn(t, a, a + 1.4); if (c.visible) { const k = eio(P(t, a, 1.2)); c.position.set(lerp(-.6 + (i % 3) * .6, -2.8, k), lerp(3.5 + Math.floor(i / 3) * .7, 7.2, k), lerp(1.2, 0, k)); c.scale.setScalar(1 - k * .7); } });
  pop(BTN, t, KW.resta - .8, .4); const cap = BTN.getObjectByName('cap'); cap.position.y = 1.2 - .14 * Math.sin(P(t, KW.resta, .35) * Math.PI);
}
// ---------- capa 2D ----------
function overlay2d(t) {
  floaters(t, 12, 'rgba(255,255,255,.8)', 'dust');
  pill(t, KW.borraste + .1, PS(1), 540, 1240, 'FOTO BORRADA', C.red, 'x');
  punch(t, PS(1) + .3, PS(2), [['SIGUE', '#ffffff'], ['AHÍ', C.amber]], 540, 1260);
  pill(t, KW.vendes + .2, PS(3), 540, 1300, 'VENDES TU CELULAR', C.amber, 'dot');
  pill(t, PS(3) + .2, PS(4) - .2, 540, 1300, 'OTRA PERSONA LA RECUPERA', C.red, 'warn');
  pill(t, KW.papel1 + .2, PS(5), 540, 1320, 'A LA PAPELERA', C.blue, 'arrow');
  pill(t, KW.dias - .3, PS(6), 540, 1320, '30 DÍAS EN LA PAPELERA', C.amber, 'clock');
  pill(t, PS(6) + .3, KW.curioso - .1, 540, 1320, 'FÁCIL DE RECUPERAR', C.green, 'check');
  pill(t, KW.vacies, KW.verdad, 540, 1330, 'PAPELERA VACIADA', C.blue, 'check');
  punch(t, KW.verdad - .5, tB - .2, [['NO SE', '#ffffff'], ['BORRA', C.red]], 540, 1160);
  pill(t, KW.biblio + .2, PS(10) + .2, 540, 1460, 'TU DISCO = UNA BIBLIOTECA', C.amber, 'star');
  pill(t, KW.indice2 - .2, PS(11), 540, 1380, 'SE BORRA DEL ÍNDICE', C.red, 'x');
  pill(t, KW.estante - .3, PS(12), 540, 1380, 'EL LIBRO SIGUE EN EL ESTANTE', C.green, 'check');
  pill(t, KW.libre - .2, PS(13), 540, 1380, 'ESPACIO "LIBRE"', C.green, 'dot');
  pill(t, PS(13) + .3, PS(14), 540, 1380, 'HASTA QUE SE GUARDE ALGO ENCIMA', C.amber, 'warn', 32);
  punch(t, KW.susc - .1, PE(14) + .2, [['¡SUSCRÍBETE!', '#ffffff']], 540, 1180, { stamp: '#ff2d3d', size: 92, rot: -.05 });
  pill(t, KW.programas, PS(16), 540, 1420, 'PROGRAMA DE RECUPERACIÓN', C.blue, 'check');
  pill(t, KW.querer - .2, PS(17), 540, 1420, '¿LO BORRASTE SIN QUERER?', C.amber, 'warn');
  pill(t, KW.usar - .1, PS(18), 540, 1420, 'DEJA DE USARLO', C.red, 'x');
  pill(t, KW.ayuda - .1, PS(18) + .2, 540, 1520, 'BUSCA AYUDA RÁPIDO', C.green, 'arrow');
  pill(t, PS(18) + .2, PS(19), 540, 1460, 'ANTES DE QUE SE GUARDE ALGO ENCIMA', C.amber, 'clock', 31);
  pill(t, KW.fotos - .4, PS(21), 540, 1380, 'NO BASTA CON BORRAR LAS FOTOS', C.red, 'x');
  pill(t, KW.copia - .1, KW.resta, 540, 1380, '1. COPIA DE LO TUYO', C.blue, 'check');
  pill(t, KW.resta, PS(22), 540, 1380, '2. RESTABLECIMIENTO DE FÁBRICA', C.green, 'check', 33);
  punch(t, KW.resta + .5, PS(22) - .1, [['RESTABLECIDO', '#ffffff']], 540, 1160, { stamp: '#1f9d55', size: 78, rot: -.06 });
  question(t, KW.coment, '¿Qué borraste sin querer?', ['Fotos', 'Un chat', 'Un trabajo', 'Contactos', 'Un video'], 1250);
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
