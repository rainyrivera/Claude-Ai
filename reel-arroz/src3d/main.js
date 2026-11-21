// Reel 9:16 3D — Estilo C "Escalada 3D" (ref. referencias/estilo-escalada-balcon.mp4) — Celular mojado en arroz
import * as THREE from 'three';

const W = 1080, H = 1920, END = 73.94;   // END = última palabra + ~4,2 s (cierre 3,7 s)
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
// ================= ¿EL CELULAR MOJADO EN ARROZ? =================
const DISC = (t) => inn(t, PS(1), PS(9)) || t >= PS(18) ? 'Fuente: soporte de Apple (iPhone mojado)' : 'Recreación ilustrativa · no está a escala';
const KW = { cayo: T('cayó'), agua: T('agua'), arroz1: T('arroz'), apple: T('apple'), hagas: T('hagas'), sorprender: T('sorprender'), seca: T('seca'), pedacitos: T('pedacitos'), polvillo: T('polvillo'), puerto1: T('puerto'), ayudarte: T('ayudarte'), danar: T('dañar'), susc: T('suscríbete'), moja: T('moja'), desconectalo: T('desconéctalo'), forro: T('forro'), golpecitos: T('golpecitos'), abajo: T('abajo'), seco: T('seco'), aire1: T('aire'), dia1: T('día'), nunca: T('nunca'), secadora: T('secadora'), calor: T('calor'), presion: T('presión'), papel: T('papel'), palillo: T('palillo'), tecnico: T('técnico'), coment: T('comentarios') };
add(road(20, 10, 160)); [[-12, -10, 5, 3, 6, 0xe8d7b0], [10, -12, 5, 3, 8, 0xd9c9a6], [34, -10, 4, 3, 5, 0xf0e0c0], [50, -9, 5, 3, 4, 0xe2d2b0]].forEach(b => building(...b));
[[-8, 4], [7, 4.5], [27, 4], [46, 4.5]].forEach(([x, z]) => tree(x, z, 1.3));
function makePhone(scale = 1, caseCol = null) { const p = new THREE.Group(); const b = rbox(2, 4, .25, .07, lp(0x1d2029, { roughness: .35 })); p.add(b); const sc = texPlane(1.84, 3.8, 184, 380, (x, w, h) => { const gr = x.createLinearGradient(0, 0, w, h); gr.addColorStop(0, '#3a4fd8'); gr.addColorStop(1, '#b04ad8'); x.fillStyle = gr; x.fillRect(0, 0, w, h); x.fillStyle = '#fff'; x.font = '700 44px I'; x.textAlign = 'center'; x.fillText('9:41', w / 2, 90); }); sc.position.z = .14; p.add(sc); const port = box(.6, .1, .14, 0x050505); port.position.set(0, -2.0, 0); p.add(port); p.userData.port = port; if (caseCol) { const c = rbox(2.2, 4.2, .3, .12, lp(caseCol)); c.position.z = -.06; p.add(c); p.userData.case = c; } p.scale.setScalar(scale); return p; }
// ---------- ZONA A: piscina + tazón de arroz ----------
const POOL = add(new THREE.Group()); { const rim = box(8, .5, 6, 0xf1efe8); rim.position.y = .25; const w = box(7.2, .1, 5.2, lp(0x2fa8e0, { roughness: .1, metalness: .1, transparent: true, opacity: .9 })); w.position.y = .45; POOL.add(rim, w); } POOL.position.set(-3, 0, 0);
const PH1 = add(makePhone(.8, 0xff8a3d));
const SPL = parts(16, new THREE.MeshBasicMaterial({ color: 0xbfeaff, transparent: true, opacity: .85 }), .12);
const BOWL = add(new THREE.Group()); { const b = M(new THREE.SphereGeometry(2, 28, 14, 0, Math.PI * 2, Math.PI / 2, Math.PI / 2), lp(0xe94f37, { side: THREE.DoubleSide })); b.position.y = 2; const rice = cyl(1.9, 1.9, .1, lp(0xfaf6ec), 28); rice.position.y = 1.85; const st = cyl(.9, 1.1, .3, 0xc23a28, 20); st.position.y = .15; BOWL.add(b, rice, st); } BOWL.position.set(5, .2, 0);
const riceM = lp(0xfffbf0, { roughness: .6 }); const GR = new THREE.InstancedMesh(new THREE.SphereGeometry(.05, 6, 4), riceM, 260); GR.frustumCulled = false; scene.add(GR);
// ---------- ZONA B: macro del puerto ----------
const BX = 40; add(box(12, .2, 8, 0xd9d4c8)).position.set(BX, .1, 0);
const BIG = add(makePhone(1.6)); BIG.position.set(BX, 1.4, 0); BIG.rotation.x = -1.25;
const PORTGLOW = add(new THREE.Sprite(new THREE.SpriteMaterial({ color: 0xff3030, transparent: true, opacity: 0, depthTest: false }))); { const t2 = canvasTex(128, 128), x = t2.x, gr = x.createRadialGradient(64, 64, 0, 64, 64, 64); gr.addColorStop(0, 'rgba(255,60,40,1)'); gr.addColorStop(1, 'rgba(255,60,40,0)'); x.fillStyle = gr; x.fillRect(0, 0, 128, 128); t2.tx.needsUpdate = true; PORTGLOW.material.map = t2.tx; } PORTGLOW.scale.set(2.2, 2.2, 1); PORTGLOW.renderOrder = 6;
const DUST = parts(60, new THREE.MeshBasicMaterial({ color: 0xfff3dc, transparent: true, opacity: .9 }), .035);
const SACK = add(new THREE.Group()); { const s = M(new THREE.CapsuleGeometry(1.1, 1.2, 6, 14), lp(0xe8dcc0)); s.position.y = 1.5; s.scale.z = .7; const lb = texPlane(1.4, .7, 280, 140, (x, w, h) => { x.fillStyle = '#c0392b'; rrp(x, 0, 0, 0, w, h, 14); x.fill(); x.fillStyle = '#fff'; x.font = '900 64px I'; x.textAlign = 'center'; x.textBaseline = 'middle'; x.fillText('ARROZ', w / 2, h / 2 + 3); }); lb.position.set(0, 1.5, .8); SACK.add(s, lb); } SACK.position.set(BX - 3.6, .2, 1);
// ---------- ZONA C: mesa con los 4 pasos ----------
const CX = 80; add(box(14, .2, 8, 0xd9d4c8)).position.set(CX, .1, 0);
const TABLE = add(new THREE.Group()); { const tp = box(6, .2, 3, 0xc9a77c); tp.position.y = 2; TABLE.add(tp); for (const [x, z] of [[-2.7, -1.3], [2.7, -1.3], [-2.7, 1.3], [2.7, 1.3]]) { const l = box(.2, 1.9, .2, 0x9a6a40); l.position.set(x, 1, z); TABLE.add(l); } } TABLE.position.set(CX, .2, 0);
const PH3 = add(makePhone(.6, 0xff8a3d));
const CABLE = add(new THREE.Group()); { const pl = box(.3, .5, .2, 0xf2f2f2); const cb = cyl(.05, .05, 2.5, 0xf2f2f2, 6); cb.position.y = -1.4; CABLE.add(pl, cb); }
const DROPS = parts(14, new THREE.MeshBasicMaterial({ color: 0x6cc4ff, transparent: true, opacity: .9 }), .07);
const FAN = add(new THREE.Group()); const BLADES = new THREE.Group(); { const base = cyl(.5, .6, .2, 0x2b5fd0); base.position.y = .1; const pole = cyl(.08, .08, 1.4, 0x9aa0aa); pole.position.y = .8; const cage = M(new THREE.TorusGeometry(.8, .05, 8, 32), lp(0x2b5fd0)); cage.position.y = 1.7; for (let i = 0; i < 3; i++) { const b = box(.25, .7, .03, 0xffffff); b.position.y = .35; const h = new THREE.Group(); h.rotation.z = i * 2.09; h.add(b); BLADES.add(h); } BLADES.position.y = 1.7; FAN.add(base, pole, cage, BLADES); } FAN.position.set(CX + 2.4, 2.3, 0); FAN.rotation.y = -.7;
const WIND = parts(18, new THREE.MeshBasicMaterial({ color: 0xffffff, transparent: true, opacity: .7 }), .04);
// los "nunca"
function itemDryer() { const g0 = new THREE.Group(); const b = M(new THREE.CapsuleGeometry(.35, .7, 6, 12), lp(0xff6fa8)); b.rotation.z = Math.PI / 2; const n = cyl(.25, .3, .4, 0xff6fa8); n.rotation.z = Math.PI / 2; n.position.x = .7; const h = box(.25, .8, .3, 0xff6fa8); h.position.set(-.2, -.55, 0); g0.add(b, n, h); return g0; }
function itemFire() { const g0 = new THREE.Group(); const f1 = M(new THREE.ConeGeometry(.4, 1.0, 10), lp(0xff7a1a, { emissive: 0x993300 })); f1.position.y = .5; const f2 = M(new THREE.ConeGeometry(.22, .6, 10), lp(0xffd23a, { emissive: 0x996600 })); f2.position.set(0, .4, .15); g0.add(f1, f2); return g0; }
function itemCan() { const g0 = new THREE.Group(); const c = cyl(.3, .3, 1.1, 0x3d7bff, 14); c.position.y = .55; const tp = cyl(.12, .3, .2, 0xc9cdd4, 14); tp.position.y = 1.2; const nz = cyl(.03, .03, .5, 0xff4d4d, 6); nz.rotation.z = Math.PI / 2; nz.position.set(.25, 1.3, 0); g0.add(c, tp, nz); return g0; }
function itemStick() { const g0 = new THREE.Group(); const s = cyl(.03, .03, 1.2, 0xe8c99a, 6); s.rotation.z = .6; s.position.y = .6; const p = box(.6, .8, .02, 0xffffff); p.position.set(-.5, .5, 0); p.rotation.z = -.2; g0.add(s, p); return g0; }
const NEVER = [itemDryer(), itemFire(), itemCan(), itemStick()].map((o, i) => { add(o); o.position.set(CX - 1.8 + i * 1.2, 2.35, .6); o.scale.setScalar(.85); return o; });
const NX = NEVER.map(() => add(texPlane(1.1, 1.1, 128, 128, (x) => { x.strokeStyle = '#ff3030'; x.lineWidth = 20; x.lineCap = 'round'; x.beginPath(); x.moveTo(18, 18); x.lineTo(110, 110); x.moveTo(110, 18); x.lineTo(18, 110); x.stroke(); })));
const TOOLS = add(new THREE.Group()); { const b = box(1.6, .7, .8, 0xe0453a); b.position.y = .35; const h = M(new THREE.TorusGeometry(.35, .06, 6, 16, Math.PI), lp(0x2a2d36)); h.position.y = .7; const w = box(.12, 1.0, .06, 0xb9c0d0); w.position.set(.4, 1.1, .3); w.rotation.z = -.5; TOOLS.add(b, h, w); }
// ---------- tomas ----------
SHOTS = [
  [0, KW.arroz1 - .4, [-2, 6, 10], [-2.5, 5, 9], [-3, 1.2, 0], [-3, .8, 0]],
  [KW.arroz1 - .4, PS(3), [5.5, 5, 10], [5, 5.6, 9], [5, 2.4, 0], [5, 2.6, 0]],
  [PS(3), PS(5), [BX + 1.8, 5.2, 14], [BX + .8, 4.6, 12.5], [BX - 1.2, 1.6, 0], [BX - .6, 1.4, 0]],
  [PS(5), PS(8), [BX + .9, 2.2, 8.5], [BX + .4, 1.9, 7.2], [BX, 1.0, 2.9], [BX, 1.0, 2.9]],
  [PS(8), PS(10), [BX + 5, 5, 14], [BX - 4, 5, 14], [BX - 1, 1.6, 0], [BX - 1, 1.6, 0]],
  [PS(10), PS(18), [CX, 4.6, 10.5], [CX + .6, 4.4, 9.5], [CX, 2.8, 0], [CX + .4, 2.8, 0]],
  [PS(18), PS(21), [CX - .4, 4.6, 12], [CX + .2, 4.4, 11.2], [CX - .1, 2.9, 0], [CX - .1, 2.9, 0]],
  [PS(21), PS(22), [CX + 2.5, 3.8, 8], [CX + 1.8, 3.6, 7.5], [CX + 1.5, 2.6, 1], [CX + 1.5, 2.6, 1]],
  [PS(22), END, [CX - 1, 5.5, 14], [CX - 1.5, 6, 15.5], [CX, 3, 0], [CX, 3, 0]]
];
SHAKE = [[KW.cayo + .9, KW.cayo + 1.5, .06], [KW.danar - .1, KW.danar + .6, .06]];
function animWorld(t) {
  sunAt(t < PS(3) ? 0 : t < PS(10) ? BX : CX, 0, 0, 14);
  // caída a la piscina y luego al arroz
  const fallAt = KW.cayo + .2; let pp, rx = 0, ry = 0;
  if (t < KW.arroz1 - .4) { const k = P(t, fallAt, .7); pp = V(-3, lerp(5, .35, k * k), .4); rx = k * 1.3; ry = t; if (t < fallAt) pp.y = 5; }
  else { const k = P(t, KW.arroz1 - .2, .7); pp = V(5, lerp(6, 2.4, k * k), 0); rx = -.4; ry = .3; }
  PH1.visible = t < PS(3); PH1.position.copy(pp); PH1.rotation.set(rx, ry, .2);
  SPL.visible = inn(t, fallAt + .7, fallAt + 1.6); for (let i = 0; i < 16; i++) { const a = i / 16 * 6.28, k = P(t, fallAt + .7, .9); setP(SPL, i, -3 + Math.cos(a) * k * 1.6, .45 + Math.sin(k * Math.PI) * 1.4 * (.6 + (i % 3) * .2), .4 + Math.sin(a) * k * 1.6, SPL.visible, 1 - k * .5); } SPL.instanceMatrix.needsUpdate = true;
  pop(BOWL, t, KW.arroz1 - .6, .4, PS(3));
  // granos: en el tazón y luego cayendo junto al puerto
  for (let i = 0; i < 260; i++) { const a = i * 2.4, r = Math.sqrt((i % 130) / 130) * 1.7; let x, y, z, vis = false;
    if (t < PS(3)) { vis = BOWL.visible; x = 5 + Math.cos(a) * r; z = Math.sin(a) * r; y = 2.15 + ((i * 7) % 5) * .02; }
    else if (t < PS(10)) { vis = i < 140 && t > PS(4) - .3; const ph = (t * .5 + i * .37) % 1; const pq = BIG.userData.port.getWorldPosition(new THREE.Vector3()); const tx = pq.x + Math.cos(a) * .25, ty = pq.y; x = lerp(BX - 3.2 + Math.cos(a) * .6, tx, ph); y = lerp(3.4 + Math.sin(a) * .5, ty, ph) + Math.sin(ph * Math.PI) * .6; z = lerp(1 + Math.sin(a) * .4, pq.z, ph); }
    tmp.position.set(x || 0, y || 0, z || 0); tmp.rotation.set(a, a * .5, 0); tmp.scale.set(vis ? 1.8 : .001, vis ? .6 : .001, vis ? .6 : .001); tmp.updateMatrix(); GR.setMatrixAt(i, tmp.matrix); }
  GR.instanceMatrix.needsUpdate = true;
  // polvillo entrando al puerto
  const pw = BIG.userData.port.getWorldPosition(new THREE.Vector3());
  DUST.visible = inn(t, KW.polvillo - .4, PS(8)); for (let i = 0; i < 60; i++) { const ph = (t * .6 + i * .173) % 1; const a = i * 1.7; setP(DUST, i, lerp(pw.x + Math.cos(a) * 1.4, pw.x + Math.cos(a) * .12, ph), lerp(pw.y + .8 + Math.sin(a) * .6, pw.y, ph), lerp(pw.z + 1.2, pw.z + .02, ph), DUST.visible, 1 - ph * .6); } DUST.instanceMatrix.needsUpdate = true;
  PORTGLOW.position.copy(pw).add(V(0, 0, .2)); PORTGLOW.material.opacity = inn(t, KW.danar - .3, PS(8)) ? .8 + .2 * Math.sin(t * 12) : inn(t, KW.puerto1 - .3, KW.danar - .3) ? .35 : 0;
  pop(SACK, t, KW.pedacitos - .6, .45, PS(8));
  // zona C: pasos
  let p3 = V(CX - .6, 3.35, 0), r3 = [-.1, 0, 0];
  if (t > KW.golpecitos - .3 && t < PS(16)) { const tap = Math.max(0, Math.sin((t - KW.golpecitos) * 9)) * .25; p3 = V(CX - .6, 3.9 + tap, .4); r3 = [0, 0, Math.PI * eout(P(t, KW.golpecitos - .3, .5))]; }
  PH3.position.copy(p3); PH3.rotation.set(...r3);
  const cs = PH3.userData.case; cs.visible = t < KW.forro + .9; if (cs.visible) cs.position.set(0, 0, -.06 - eio(P(t, KW.forro, .8)) * 3);
  const pw3 = PH3.userData.port.getWorldPosition(new THREE.Vector3());
  CABLE.visible = inn(t, PS(10), PS(12) + .5); if (CABLE.visible) { const k = eio(P(t, KW.desconectalo, .6)); CABLE.position.set(pw3.x, pw3.y - .3 - k * 1.2, pw3.z); CABLE.rotation.z = k * .4; }
  DROPS.visible = inn(t, KW.golpecitos, PS(16)); for (let i = 0; i < 14; i++) { const ph = (t * 1.3 + i * .29) % 1; setP(DROPS, i, pw3.x + (i % 3 - 1) * .1, pw3.y + .1 - ph * 1.3, pw3.z, DROPS.visible, 1 - ph * .5); } DROPS.instanceMatrix.needsUpdate = true;
  pop(FAN, t, KW.seco - .4, .45, PS(18)); BLADES.rotation.z = t * 14;
  WIND.visible = inn(t, KW.aire1 - .2, PS(18)); for (let i = 0; i < 18; i++) { const ph = (t * .9 + i * .19) % 1; setP(WIND, i, lerp(CX + 1.6, CX - 1.2, ph), 3.3 + (i % 5) * .2 + Math.sin(ph * 6) * .05, lerp(.6, 0, ph) + (i % 3) * .2, WIND.visible, 1.5); } WIND.instanceMatrix.needsUpdate = true;
  const nev = [KW.secadora, KW.calor, KW.presion, KW.papel]; NEVER.forEach((o, i) => { pop(o, t, nev[i] - .3, .4, PS(21)); o.rotation.y = Math.sin(t * 1.5 + i) * .3; const x = NX[i]; x.position.set(o.position.x, 3.0, 1.2); x.scale.setScalar(.75); x.userData.s0 = null; pop(x, t, nev[i] + .2, .3, PS(21)); });
  PH3.visible = t < PS(18) || t >= PS(21);
  pop(TOOLS, t, KW.tecnico - .3, .45); TOOLS.position.set(CX + 1.6, 2.3, .6);
}
function overlay2d(t) {
  floaters(t, 10, 'rgba(200,235,255,.75)', 'drop');
  pill(t, KW.agua - .2, KW.arroz1 - .3, 540, 1450, '¡AL AGUA!', C.blue, 'warn');
  pill(t, KW.arroz1 - .3, PS(1), 540, 1450, 'LO PRIMERO: ARROZ', C.amber, 'dot');
  punch(t, KW.hagas - .4, PS(2) + .3, [['APPLE DICE:', '#ffffff'], ['NO', C.red]], 540, 1260, { size: 92 });
  pill(t, KW.sorprender - .4, PS(3), 540, 1450, 'LA RAZÓN TE VA A SORPRENDER', C.amber, 'star');
  pill(t, KW.seca - .3, PS(4), 540, 1450, 'NO ES SI SECA O NO', C.blue, 'dot');
  pill(t, KW.pedacitos - .3, PS(5), 540, 1450, 'PEDACITOS Y POLVILLO', C.red, 'warn');
  pill(t, KW.puerto1 - .5, PS(6), 540, 1450, 'SE METEN POR EL PUERTO', C.red, 'warn');
  punch(t, KW.danar - .3, PS(8) + .1, [['TE LO', '#ffffff'], ['DAÑA', C.red]], 540, 1260, { size: 104 });
  punch(t, KW.susc - .1, PE(8) + .2, [['¡SUSCRÍBETE!', '#ffffff']], 540, 1250, { stamp: '#ff2d3d', size: 92, rot: -.05 });
  punch(t, KW.moja - .4, PS(10), [['¿QUÉ', '#ffffff'], ['HAGO?', C.amber]], 540, 1260, { size: 104 });
  const S = [[PS(10), '1 · DESCONÉCTALO, NO LO CARGUES'], [PS(12), '2 · QUÍTALE EL FORRO'], [PS(14), '3 · GOLPECITOS, PUERTO ABAJO'], [PS(16), '4 · LUGAR SECO CON AIRE']];
  S.forEach(([a, txt], i) => pill(t, a, PS(18), 540, 1150 + i * 84, txt, C.green, 'check', 31));
  pill(t, KW.dia1 - .3, PS(18), 540, 1500, 'HASTA UN DÍA', C.amber, 'clock');
  punch(t, KW.nunca - .3, PS(19), [['NUNCA', C.red]], 540, 1260, { size: 110 });
  const N = [[KW.secadora, 'SECADORA'], [KW.calor, 'CALOR'], [KW.presion, 'AIRE A PRESIÓN'], [KW.papel, 'PAPEL O PALILLO']];
  N.forEach(([a, txt], i) => pill(t, a, PS(21), 540, 1180 + i * 80, txt, C.red, 'x', 32));
  pill(t, KW.tecnico - .3, PS(22), 540, 1450, '¿SIGUE FALLANDO? → TÉCNICO', C.blue, 'arrow');
  question(t, KW.coment, '¿Se salvó tu celular?', ['Sí, con arroz', 'No se salvó', 'Nunca se me ha mojado'], 1300);
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
