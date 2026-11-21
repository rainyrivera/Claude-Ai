// Reel 9:16 3D — Estilo C "Escalada 3D" (ref. referencias/estilo-escalada-balcon.mp4) — ¿Tu celular te escucha?
import * as THREE from 'three';

const W = 1080, H = 1920, END = 72.86;   // END = última palabra + ~4,2 s (cierre 3,7 s)
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
// ================= ¿TU CELULAR TE ESCUCHA? =================
const DISC = (t) => inn(t, PS(4), PS(9)) ? 'Fuente: FTC (EE. UU.) sobre "Active Listening" de Cox Media Group' : 'Recreación ilustrativa · simplificado';
const KW = { zapatos1: T('zapatos'), zapatos2: T('zapatos', 2), escuchando: T('escuchando'), rara: T('rara'), empresa: T('empresa'), microfono1: T('micrófono'), anuncios: T('anuncios'), panico: T('pánico'), gobierno: T('gobierno'), inventado: T('inventado'), nadie: T('nadie'), susc: T('suscríbete'), sabe1: T('sabe'), oirte: T('oírte'), buscas: T('buscas'), estas: T('estás'), compras: T('compras'), videos: T('videos'), foto: T('foto'), adivina: T('adivina'), digas: T('digas'), microfono2: T('micrófono', 2), verde: T('verde'), naranja: T('naranja'), camara: T('cámara'), ajustes: T('ajustes'), permiso: T('permiso'), coment: T('comentarios') };
add(road(30, 9, 200));
[[-12, -10, 5, 3, 6, 0xe8d7b0], [12, -12, 5, 3, 8, 0xd9c9a6], [100, -10, 5, 3, 6, 0xf0e0c0], [-22, -8, 4, 3, 4, 0xe2d2b0]].forEach(b => building(...b));
[[-7, 3], [7, 3.5], [33, 4], [52, 4], [72, 4], [92, 4]].forEach(([x, z]) => tree(x, z, 1.3));
// ---------- ZONA A: sofá, zapato, celular gigante ----------
add(box(10, .2, 6, 0xd9d4c8)).position.set(0, .1, 0);
const SOFA = add(new THREE.Group()); { const m = lp(0x3d7bff); const s = box(3.4, .6, 1.2, m); s.position.y = .6; const bk = box(3.4, 1.0, .3, m); bk.position.set(0, 1.2, -.45); const a1 = box(.3, .8, 1.2, m); a1.position.set(-1.7, .9, 0); const a2 = a1.clone(); a2.position.x = 1.7; SOFA.add(s, bk, a1, a2); } SOFA.position.set(-1.8, .2, .4);
function makeShoe(col) { const g0 = new THREE.Group(); const sole = rbox(1.5, .22, .6, .08, lp(0xffffff)); sole.position.y = .11; const up = rbox(1.2, .5, .55, .18, lp(col)); up.position.set(-.1, .42, 0); const toe = sph(.28, lp(col)); toe.scale.set(1.1, .8, .95); toe.position.set(.45, .3, 0); const lace = box(.5, .04, .3, 0xffffff); lace.position.set(.1, .66, 0); lace.rotation.z = -.25; g0.add(sole, up, toe, lace); return g0; }
const SHOE = add(makeShoe(0xff4d4d)); SHOE.position.set(-1.8, 3.2, .6);
const BUB = []; for (const [x, c] of [[-2.9, 0xffffff], [-.7, 0xffffff]]) { const b = add(new THREE.Group()); const s = sph(.55, lp(c, { roughness: .9 }), 16); s.scale.set(1.3, 1, .4); const tl = M(new THREE.ConeGeometry(.15, .4, 8), lp(c)); tl.position.set(.2, -.55, 0); tl.rotation.z = .5; b.add(s, tl); b.position.set(x, 2.6, .6); BUB.push(b); }
const PHN = add(new THREE.Group()); PHN.position.set(2.2, .2, .4);
{ const body = rbox(2.2, 4.4, .25, .07, lp(0x1d2029, { roughness: .4 })); body.position.y = 2.4; PHN.add(body); const st = box(1.2, .2, .9, 0x9aa0aa); st.position.set(0, .1, .1); PHN.add(st); }
const SCR = canvasTex(400, 800); const scr = M(new THREE.PlaneGeometry(2.04, 4.2), new THREE.MeshBasicMaterial({ map: SCR.tx, toneMapped: false }), false); scr.position.set(0, 2.4, .14); PHN.add(scr);
function drawShoe2d(x, cx, cy, s) { x.save(); x.translate(cx, cy); x.scale(s, s); x.fillStyle = '#fff'; rrp(x, 0, -80, 20, 170, 24, 10); x.fill(); x.fillStyle = '#ff4d4d'; x.beginPath(); x.moveTo(-75, 22); x.lineTo(-60, -40); x.lineTo(10, -40); x.quadraticCurveTo(80, -10, 88, 22); x.closePath(); x.fill(); x.strokeStyle = '#fff'; x.lineWidth = 5; for (let i = 0; i < 3; i++) { x.beginPath(); x.moveTo(-20 + i * 18, -36); x.lineTo(-8 + i * 18, -18); x.stroke(); } x.restore(); }
function drawScreen(t) {
  const x = SCR.x, w = 400, h = 800; x.fillStyle = '#f4f6fb'; x.fillRect(0, 0, w, h);
  // barra de estado
  x.fillStyle = '#16161c'; x.font = '700 24px I'; x.textAlign = 'left'; x.fillText('9:41', 24, 40); x.textAlign = 'right'; x.fillText('▮▮▮ 87%', w - 20, 40);
  const dot = inn(t, KW.verde - .3, PS(20)) ? (t < KW.naranja - .1 ? '#22c55e' : '#f59e0b') : null; if (dot) { const pr = 1 + .25 * Math.sin(t * 8); x.fillStyle = dot; x.beginPath(); x.arc(w / 2 + 70, 32, 11 * pr, 0, 6.29); x.fill(); x.strokeStyle = dot; x.lineWidth = 3; x.beginPath(); x.arc(w / 2 + 70, 32, 22 + 6 * Math.sin(t * 8), 0, 6.29); x.stroke(); }
  if (t >= PS(20)) { // ajustes > privacidad > micrófono
    x.fillStyle = '#16161c'; x.textAlign = 'left'; x.font = '800 34px I'; x.fillText('Privacidad', 24, 110); x.font = '600 22px I'; x.fillStyle = '#6b7280'; x.fillText('Micrófono', 24, 148);
    const apps = [['Juego de frutas', '#ff8a3d'], ['Linterna', '#a98bff'], ['Calculadora', '#4aa8ff'], ['Notas de voz', '#ef4444'], ['WhatsApp', '#22c55e']];
    apps.forEach(([n, c], i) => { const y = 200 + i * 104; x.fillStyle = '#fff'; rrp(x, 0, 16, y - 40, w - 32, 88, 18); x.fill(); x.fillStyle = c; rrp(x, 0, 32, y - 22, 52, 52, 12); x.fill(); x.fillStyle = '#16161c'; x.font = '700 24px I'; x.fillText(n, 100, y + 10);
      const off = i < 3 && t > KW.permiso - .6 + i * .35; const k = off ? eout(P(t, KW.permiso - .6 + i * .35, .25)) : 0; x.fillStyle = off ? `rgb(${lerp(34, 200, k)},${lerp(197, 200, k)},${lerp(94, 205, k)})` : '#22c55e'; rrp(x, 0, w - 110, y - 18, 76, 42, 21); x.fill(); x.fillStyle = '#fff'; x.beginPath(); x.arc(w - 55 - 32 * k, y + 3, 17, 0, 6.29); x.fill(); });
  } else if (inn(t, KW.zapatos2 - .4, PS(4))) { // anuncio de zapatos
    x.fillStyle = '#16161c'; x.font = '800 30px I'; x.textAlign = 'left'; x.fillText('Para ti', 24, 100);
    x.fillStyle = '#fff'; rrp(x, 0, 20, 130, w - 40, 420, 24); x.fill(); x.fillStyle = '#ffe9e0'; rrp(x, 0, 36, 146, w - 72, 260, 18); x.fill(); drawShoe2d(x, w / 2, 280, 1.3);
    x.fillStyle = '#16161c'; x.font = '900 40px I'; x.fillText('ZAPATOS', 40, 460); x.fillStyle = '#ef4444'; x.fillText('-30%', 250, 460); x.fillStyle = '#3d8bff'; rrp(x, 0, 40, 486, w - 80, 48, 24); x.fill(); x.fillStyle = '#fff'; x.font = '800 22px I'; x.textAlign = 'center'; x.fillText('COMPRAR', w / 2, 518);
    x.fillStyle = '#6b7280'; x.font = '600 18px I'; x.fillText('Patrocinado', w / 2, 580);
  } else { x.fillStyle = '#16161c'; x.font = '800 30px I'; x.textAlign = 'left'; x.fillText('Inicio', 24, 100); for (let i = 0; i < 4; i++) { x.fillStyle = ['#ffd27a', '#9fd6f2', '#c8e6a0', '#d0c4f7'][i]; rrp(x, 0, 20, 130 + i * 160, w - 40, 140, 18); x.fill(); } }
  SCR.tx.needsUpdate = true;
}
// ---------- ZONA B: la agencia con oreja gigante + gobierno ----------
const BX = 40; add(box(26, .2, 10, 0xd9d4c8)).position.set(BX + 6, .1, 0);
const AG = building(BX, -1, 5, 4, 5, 0xd9c9f0); { const sg = texPlane(4.4, .9, 440, 90, (x, w, h) => { x.fillStyle = '#1d2029'; rrp(x, 0, 0, 0, w, h, 12); x.fill(); x.fillStyle = '#ffb020'; x.font = '900 52px I'; x.textAlign = 'center'; x.textBaseline = 'middle'; x.fillText('PUBLICIDAD', w / 2, h / 2 + 3); }, false); sg.position.set(BX, 6.3, 1.05); add(sg); }
const EAR = add(new THREE.Group()); { const m = lp(0xf2b49a); const e = sph(1.1, m, 20); e.scale.set(.55, 1, .3); const rim = M(new THREE.TorusGeometry(.8, .18, 10, 24, Math.PI * 1.6), m); rim.position.z = .25; rim.rotation.z = -.4; const hole = sph(.22, lp(0x8a4a3a), 10); hole.position.set(0, -.1, .3); EAR.add(e, rim, hole); } EAR.position.set(BX, 7.6, -1);
const MIC = add(new THREE.Group()); { const hd = M(new THREE.CapsuleGeometry(.4, .5, 6, 14), lp(0x2a2d36, { roughness: .4 })); hd.position.y = .7; const st = cyl(.06, .06, 1, 0x9aa0aa); const ba = cyl(.4, .4, .1, 0x2a2d36); ba.position.y = -.5; MIC.add(hd, st, ba); } MIC.position.set(BX + 1.9, 6.4, -.2);
const MICX = add(texPlane(1.6, 1.6, 200, 200, (x, w, h) => { x.strokeStyle = '#ff4d4d'; x.lineWidth = 26; x.lineCap = 'round'; x.beginPath(); x.moveTo(30, 30); x.lineTo(170, 170); x.moveTo(170, 30); x.lineTo(30, 170); x.stroke(); }));
const GX = BX + 12; const GOV = add(new THREE.Group()); { const b = box(6, 3.4, 3.6, 0xf4f1ea); b.position.y = 1.9; const st = box(6.6, .3, 4.2, 0xdedad0); st.position.y = .15; const roof = box(6.4, .4, 3.9, 0xe0dcd2); roof.position.y = 3.8; const dome = M(new THREE.SphereGeometry(1.3, 20, 10, 0, Math.PI * 2, 0, Math.PI / 2), lp(0xdfe6ee)); dome.position.y = 4.0; GOV.add(b, st, roof, dome); for (let i = 0; i < 6; i++) { const c = cyl(.16, .16, 3.2, 0xffffff, 12); c.position.set(-2.5 + i, 1.9, 1.95); GOV.add(c); } const fl = box(.06, 1.6, .06, 0x9aa0aa); fl.position.set(0, 6, 0); GOV.add(fl); } GOV.position.set(GX, 0, -1);
const LUPA = add(new THREE.Group()); { const r = M(new THREE.TorusGeometry(1.0, .14, 10, 32), lp(0x2a2d36)); const gl = M(new THREE.CircleGeometry(.98, 32), new THREE.MeshStandardMaterial({ color: 0xbfe6ff, transparent: true, opacity: .3 }), false); const h = cyl(.13, .13, 1.8, 0x7a5230); h.position.set(1.1, -1.1, 0); h.rotation.z = Math.PI / 4; LUPA.add(r, gl, h); }
// ---------- ZONA C: la torre de datos ----------
const CX = 80; add(box(14, .2, 10, 0xd9d4c8)).position.set(CX, .1, 0);
const TOWER = add(new THREE.Group()); { const b = rbox(2.4, 6, 2.4, .2, lp(0x2a2d36, { roughness: .45 })); b.position.y = 3; TOWER.add(b); for (let i = 0; i < 8; i++) { const l = box(2.0, .08, .05, lp(0x4aa8ff, { emissive: 0x1d4f99 })); l.position.set(0, .8 + i * .65, 1.22); TOWER.add(l); } } TOWER.position.set(CX, .2, -1.5);
function iconTex(col, draw) { const c = canvasTex(128, 128), x = c.x; x.fillStyle = col; x.beginPath(); x.arc(64, 64, 60, 0, 6.29); x.fill(); x.strokeStyle = '#fff'; x.fillStyle = '#fff'; x.lineWidth = 9; x.lineCap = 'round'; draw(x); c.tx.needsUpdate = true; return new THREE.SpriteMaterial({ map: c.tx, transparent: true, depthWrite: false }); }
const ICONS = [
  iconTex('#4aa8ff', x => { x.beginPath(); x.arc(56, 56, 24, 0, 6.29); x.stroke(); x.beginPath(); x.moveTo(74, 74); x.lineTo(94, 94); x.stroke(); }),
  iconTex('#ef4444', x => { x.beginPath(); x.arc(64, 52, 22, Math.PI, 0); x.lineTo(64, 100); x.closePath(); x.fill(); x.fillStyle = '#ef4444'; x.beginPath(); x.arc(64, 52, 9, 0, 6.29); x.fill(); }),
  iconTex('#22c55e', x => { x.beginPath(); x.moveTo(28, 40); x.lineTo(40, 40); x.lineTo(50, 80); x.lineTo(92, 80); x.lineTo(100, 52); x.lineTo(44, 52); x.stroke(); x.beginPath(); x.arc(54, 96, 6, 0, 6.29); x.arc(88, 96, 6, 0, 6.29); x.fill(); }),
  iconTex('#a98bff', x => { x.beginPath(); x.moveTo(50, 40); x.lineTo(92, 64); x.lineTo(50, 88); x.closePath(); x.fill(); }),
  iconTex('#ffb020', x => { x.beginPath(); x.ellipse(64, 64, 38, 22, 0, 0, 6.29); x.stroke(); x.beginPath(); x.arc(64, 64, 11, 0, 6.29); x.fill(); })];
const FLOW = []; for (let i = 0; i < 20; i++) { const s = new THREE.Sprite(ICONS[i % 5]); s.scale.set(.8, .8, 1); add(s); FLOW.push(s); }
const BALL = add(new THREE.Group()); { const gb = M(new THREE.SphereGeometry(1.1, 32, 20), new THREE.MeshStandardMaterial({ color: 0xc6b6ff, transparent: true, opacity: .55, roughness: .1, emissive: 0x4a2aa0, emissiveIntensity: .4 })); gb.position.y = 1.4; const bs = cyl(.8, 1.0, .4, 0x7a5230, 16); bs.position.y = .2; BALL.add(gb, bs); } BALL.position.set(CX + 3.2, .2, 1.4);
const SHOE2 = add(makeShoe(0xff4d4d)); SHOE2.scale.setScalar(.7);
// ---------- tomas ----------
SHOTS = [
  [0, PS(2), [-.2, 3.6, 14], [.3, 3.4, 12.5], [.2, 2.4, 0], [.4, 2.4, 0]],
  [PS(2), PS(4), [3.2, 3.0, 8], [2.6, 2.9, 7], [2.2, 2.6, .4], [2.2, 2.6, .4]],
  [PS(4), PS(6), [BX + 2, 5.5, 17], [BX + 1, 6.5, 15], [BX, 5.0, 0], [BX, 5.6, -1]],
  [PS(6), PS(9), [BX + 5, 7, 28], [BX + 6.5, 6.5, 25.5], [BX + 6, 3.8, -1], [BX + 6, 3.6, -1]],
  [PS(9), PS(11), [BX + 10, 6, 26], [BX + 2, 6, 26], [BX + 6, 3.6, -1], [BX + 6, 3.6, -1]],
  [PS(11), PS(15), [CX + 1, 4.8, 15], [CX - .5, 4.4, 13], [CX, 3.4, -1], [CX, 3.2, -1]],
  [PS(15), PS(17), [CX + 4.5, 3.2, 9], [CX + 3.8, 2.9, 7.5], [CX + 3.2, 1.8, 1.4], [CX + 3.2, 1.8, 1.4]],
  [PS(17), PS(18), [4, 3.4, 9.5], [3, 3.3, 8.2], [2.2, 2.8, .4], [2.2, 2.8, .4]],
  [PS(18), PS(20), [2.4, 4.6, 5.2], [2.3, 4.5, 4.6], [2.2, 4.4, .4], [2.2, 4.4, .4]],
  [PS(20), PS(21), [2.6, 2.8, 6.6], [2.4, 2.7, 6.0], [2.2, 2.6, .4], [2.2, 2.6, .4]],
  [PS(21), END, [-1, 4.2, 15], [-1.5, 4.6, 16.5], [.2, 2.6, 0], [.2, 2.6, 0]]
];
SHAKE = [[KW.panico - .2, KW.panico + 1.2, .07]];
function animWorld(t) {
  const zx = t < PS(4) || t >= PS(17) ? 0 : t < PS(11) ? BX + 5 : CX; sunAt(zx, 0, 0, 16);
  drawScreen(t);
  BUB.forEach((b, i) => { pop(b, t, .1 + i * .5, .4, PS(2)); b.position.y = 2.6 + Math.sin(t * 2 + i) * .08; });
  pop(SHOE, t, KW.zapatos1 - .1, .45, PS(2)); SHOE.rotation.y = t * 1.2;
  // agencia
  pop(EAR, t, KW.empresa + .3, .5, PS(9)); EAR.rotation.y = Math.sin(t * 2) * .2;
  pop(MIC, t, KW.microfono1 - .2, .45, PS(9));
  MICX.visible = inn(t, KW.nadie - .2, PS(9) + .3); if (MICX.visible) { MICX.position.set(BX + 1.9, 7.1, .5); pop(MICX, t, KW.nadie - .2, .35); }
  LUPA.visible = inn(t, KW.gobierno, PS(8)); if (LUPA.visible) { const k = P(t, KW.gobierno, 2.4); LUPA.position.set(lerp(BX + 8, BX + .5, eio(k)), 4.5 + Math.sin(t * 4) * .3, 2.5); LUPA.scale.setScalar(eback(P(t, KW.gobierno, .4))); }
  // torre de datos: íconos fluyen hacia la torre
  const kinds = [[KW.buscas, 0], [KW.estas, 1], [KW.compras, 2], [KW.videos, 3], [KW.foto, 4]];
  FLOW.forEach((s, i) => { const kd = i % 5, a0 = kinds[kd][0] - .2 + Math.floor(i / 5) * .35; s.visible = inn(t, a0, PS(15) + .5); if (!s.visible) return; const ang = kd / 5 * Math.PI * 2 + 1.1; const k = ((t - a0) * .45 + Math.floor(i / 5) * .25) % 1; const r = lerp(5.5, .6, eio(k)); s.position.set(CX + Math.cos(ang) * r, 1.5 + Math.sin(ang) * 1.2 + 2 + k * .5, -1.5 + Math.sin(ang) * r * .5 + 1.2); s.material.opacity = 1 - P(k, .85, .15); s.scale.setScalar(.85 * eback(P(t, a0, .3))); });
  pop(BALL, t, KW.adivina - .3, .5); SHOE2.visible = inn(t, KW.adivina + .2, PS(17)); if (SHOE2.visible) { SHOE2.position.set(CX + 3.2, 1.55, 1.4); SHOE2.rotation.y = t * 1.5; pop(SHOE2, t, KW.adivina + .2, .5); }
}
function overlay2d(t) {
  floaters(t, 10, 'rgba(255,255,255,.7)', 'dust');
  pill(t, .4, PS(1), 540, 1450, 'HABLAS DE ZAPATOS', C.amber, 'quote');
  pill(t, KW.zapatos2 - .3, PS(2), 540, 1450, 'ANUNCIO DE ZAPATOS', C.red, 'warn');
  punch(t, KW.escuchando - .3, PS(3) + .2, [['¿TE', '#ffffff'], ['ESCUCHA?', C.red]], 540, 1280, { size: 104 });
  pill(t, KW.rara - .2, PS(4), 540, 1450, 'LA RESPUESTA ES MÁS RARA', C.amber, 'star');
  pill(t, KW.empresa - .1, KW.microfono1 - .3, 540, 1430, '2023 · EMPRESA DE PUBLICIDAD (EE. UU.)', C.amber, 'dot', 30);
  pill(t, KW.microfono1 - .3, PS(5), 540, 1430, '"ESCUCHAMOS POR EL MICRÓFONO"', C.blue, 'mic');
  punch(t, KW.panico - .3, PS(6), [['¡PÁNICO!', C.red]], 540, 1260, { size: 110 });
  pill(t, KW.gobierno - .2, KW.inventado - .3, 540, 1450, 'EL GOBIERNO INVESTIGÓ', C.blue, 'arrow');
  punch(t, KW.inventado - .2, PS(8) + .2, [['INVENTADO', '#ffffff']], 540, 1250, { stamp: '#e02424', size: 96, rot: -.07 });
  pill(t, KW.nadie - .3, PS(9), 540, 1450, 'NO ESCUCHABA A NADIE', C.green, 'check');
  punch(t, KW.susc - .1, PE(10) + .3, [['¡SUSCRÍBETE!', '#ffffff']], 540, 1250, { stamp: '#ff2d3d', size: 92, rot: -.05 });
  punch(t, KW.sabe1 - .2, KW.oirte, [['¿CÓMO', '#ffffff'], ['SABE?', C.amber]], 540, 1280, { size: 104 });
  pill(t, KW.oirte - .2, KW.buscas - .1, 540, 1450, 'NO NECESITA OÍRTE', C.green, 'check');
  const L = [[KW.buscas, 'LO QUE BUSCAS', C.blue], [KW.estas, 'DÓNDE ESTÁS', C.red], [KW.compras, 'QUÉ COMPRAS', C.green], [KW.videos, 'QUÉ VIDEOS VES', C.purple], [KW.foto - .6, 'CUÁNTO MIRAS UNA FOTO', C.amber]];
  L.forEach(([a, txt, c], i) => pill(t, a - .15, PS(15), 540, 1180 + i * 78, txt, c, 'check', 32));
  punch(t, KW.adivina - .2, PS(17), [['ADIVINA', '#ffffff'], ['ANTES', C.amber]], 540, 1300, { size: 96 });
  pill(t, KW.microfono2 - .3, PS(18), 540, 1450, '¿QUIÉN USA TU MICRÓFONO?', C.amber, 'mic');
  pill(t, KW.verde - .2, KW.naranja - .1, 540, 1300, 'PUNTITO VERDE', C.green, 'dot');
  pill(t, KW.naranja - .1, PS(19), 540, 1300, 'O NARANJA', C.amber, 'dot');
  pill(t, PS(19), PS(20), 540, 1300, 'UNA APP USA EL MICRÓFONO O LA CÁMARA', C.amber, 'mic', 29);
  pill(t, KW.ajustes - .2, KW.permiso - .4, 540, 1450, 'AJUSTES › PRIVACIDAD', C.blue, 'arrow');
  pill(t, KW.permiso - .4, PS(21), 540, 1450, 'QUÍTALE EL PERMISO', C.green, 'check');
  question(t, KW.coment, '¿Qué anuncio raro te salió?', ['Zapatos', 'Comida', 'Un viaje', 'Algo que solo dije'], 1300);
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
