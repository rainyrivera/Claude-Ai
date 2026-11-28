// Reel 9:16 3D — Estilo C "Escalada 3D" (ref. referencias/estilo-escalada-balcon.mp4) — El inversor no guarda la luz
import * as THREE from 'three';

const W = 1080, H = 1920, END = 76.18;   // END = última palabra + ~4,2 s (cierre 3,7 s)
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
// ================= EL INVERSOR NO GUARDA LA LUZ =================
const DISC = (t) => t >= PS(16) && t < PS(20) ? 'La instalación eléctrica: que la haga un electricista' : t >= PS(12) && t < PS(16) ? 'Datos generales · revisa la ficha de cada batería' : 'Recreación ilustrativa';
const KW = { apagones: T('apagones'), corre: T('corre'), inversor1: T('inversor'), compra: T('compra'), horas1: T('horas'), oscuras: T('oscuras'), porque: T('porque'), guarda: T('guarda'), baterias1: T('baterías'), convierte: T('convierte'), casa: T('casa'), pequenas: T('pequeñas'), malas: T('malas'), bueno: T('bueno'), explica: T('explica'), iguales: T('iguales'), susc: T('suscríbete'), plomo: T('plomo-ácido'), baratas: T('baratas'), atencion: T('atención'), agm: T('agm'), gel: T('gel'), seguras: T('seguras'), litio: T('litio'), lifepo4: T('lifepo4'), caras: T('caras'), duran: T('duran'), pesan: T('pesan'), solo: T('solo', 2), trae: T('trae'), horas2: T('horas', 2), prender: T('prender'), instale: T('instale'), sepa: T('sepa'), coment: T('comentarios') };
add(road(60, 10, 220)); [[-15, -10, 5, 3, 5, 0xe8d7b0], [20, -11, 6, 3, 6, 0xd9c9a6], [62, -11, 5, 3, 4, 0xf0e0c0], [100, -12, 6, 3, 7, 0xe2d2b0], [140, -11, 5, 3, 4, 0xd9c9a6]].forEach(b => building(...b));
[[-8, 4.5], [13, 4.5], [33, 4], [55, 4.5], [72, 4], [93, 4.5], [113, 4], [133, 4.5]].forEach(([x, z]) => tree(x, z, 1.3));
function plat(x, w = 14) { const p = add(box(w, .2, 9, 0xd9d4c8)); p.position.set(x, .1, 0); return p; }
const glowM = () => lp(0xffe08a, { emissive: 0xffc040, emissiveIntensity: 1 });
function inverter(s = 1) { const g0 = new THREE.Group(); const b = rbox(1.6, 2, .6, .08, lp(0x2d3340, { roughness: .4 })); const sc = texPlane(1, .5, 200, 100, (x, w, h) => { x.fillStyle = '#0d1220'; rrp(x, 0, 0, 0, w, h, 12); x.fill(); x.fillStyle = '#3ddc84'; x.font = '800 44px I'; x.textAlign = 'center'; x.fillText('220V ~', w / 2, 66); }); sc.position.set(0, .45, .32); const lab = texPlane(1.3, .3, 260, 60, (x, w, h) => { x.fillStyle = '#ffb020'; x.font = '900 40px I'; x.textAlign = 'center'; x.textBaseline = 'middle'; x.fillText('INVERSOR', w / 2, h / 2 + 2); }); lab.position.set(0, -.35, .32); g0.add(b, sc, lab); g0.scale.setScalar(s); return g0; }
function battery(col, top, label, s = 1) { const g0 = new THREE.Group(); const b = rbox(1.4, 1.6, 1, .08, lp(col, { roughness: .5 })); b.position.y = .8; const t1 = cyl(.12, .12, .2, 0xe0303c, 10); t1.position.set(-.4, 1.7, 0); const t2 = cyl(.12, .12, .2, 0x2a2d36, 10); t2.position.set(.4, 1.7, 0); const tp = box(1.42, .12, 1.02, top); tp.position.y = 1.55; const lb = texPlane(1.2, .45, 240, 90, (x, w, h) => { x.fillStyle = '#fff'; x.font = `900 ${label.length > 7 ? 38 : 50}px I`; x.textAlign = 'center'; x.textBaseline = 'middle'; x.fillText(label, w / 2, h / 2 + 2); }); lb.position.set(0, .9, .52); g0.add(b, tp, t1, t2, lb); g0.scale.setScalar(s); return g0; }
// ---------- ZONA A: casa en apagón ----------
plat(0);
const HOUSE = add(new THREE.Group()); const WINS = []; { const b = box(6, 3.4, 5, 0xf2e6c8); b.position.y = 1.9; const roof = M(new THREE.ConeGeometry(4.6, 1.8, 4), lp(0xb5543a, { flatShading: true })); roof.position.y = 4.5; roof.rotation.y = Math.PI / 4; const door = box(1, 2, .1, 0x8a5a36); door.position.set(-1.4, 1.2, 2.52); HOUSE.add(b, roof, door); for (const [x, y] of [[.6, 2.4], [2, 2.4]]) { const w = box(1, 1, .1, glowM()); w.position.set(x, y, 2.52); HOUSE.add(w); WINS.push(w); } } HOUSE.position.set(-1, 0, -1.5);
const POLE = add(new THREE.Group()); { const p = cyl(.12, .15, 7, 0x6a4a30, 8); p.position.y = 3.5; const cr = box(2, .15, .15, 0x6a4a30); cr.position.y = 6.6; POLE.add(p, cr); } POLE.position.set(4.6, 0, 1);
const BOLT = add(texPlane(1.4, 1.4, 128, 128, (x) => { x.fillStyle = '#ffd23a'; x.beginPath(); x.moveTo(70, 6); x.lineTo(30, 70); x.lineTo(60, 70); x.lineTo(46, 122); x.lineTo(98, 50); x.lineTo(66, 50); x.lineTo(84, 6); x.closePath(); x.fill(); })); BOLT.position.set(4.6, 7.4, 1.3);
const BOXI = add(new THREE.Group()); { const b = box(2.2, 1.6, 1.4, 0xc9a27a); b.position.y = .8; const tape = box(2.22, .1, .3, 0xe8d9a8); tape.position.y = 1.62; const lb = texPlane(1.6, .4, 320, 80, (x, w, h) => { x.fillStyle = '#5a3a1a'; x.font = '900 52px I'; x.textAlign = 'center'; x.textBaseline = 'middle'; x.fillText('INVERSOR', w / 2, h / 2 + 2); }); lb.position.set(0, .9, .71); BOXI.add(b, tape, lb); } BOXI.position.set(2.6, .2, 3);
const CLK = add(texPlane(1.6, 1.6, 200, 200, (x) => {})); CLK.position.set(-1, 6.2, 1.2);
function drawClock(h) { const t2 = CLK.userData.tex, x = t2.x; x.clearRect(0, 0, 200, 200); x.fillStyle = '#fff'; x.beginPath(); x.arc(100, 100, 92, 0, 6.29); x.fill(); x.strokeStyle = '#2a2d36'; x.lineWidth = 8; x.stroke(); x.fillStyle = 'rgba(255,77,77,.35)'; x.beginPath(); x.moveTo(100, 100); x.arc(100, 100, 84, -Math.PI / 2, -Math.PI / 2 + h / 12 * 6.283); x.fill(); x.strokeStyle = '#2a2d36'; x.lineWidth = 7; x.lineCap = 'round'; const a = -Math.PI / 2 + h / 12 * 6.283; x.beginPath(); x.moveTo(100, 100); x.lineTo(100 + Math.cos(a) * 70, 100 + Math.sin(a) * 70); x.stroke(); x.fillStyle = '#2a2d36'; x.font = '900 34px I'; x.textAlign = 'center'; x.fillText(Math.floor(h) + ' h', 100, 160); t2.tx.needsUpdate = true; }
// ---------- ZONA B: el circuito ----------
const BX = 40; plat(BX, 18);
const BANK = add(new THREE.Group()); const BB = [0, 1].map(i => { const b = battery(0x3a3f4b, 0x22252c, 'BATERÍA'); b.position.set(i * 1.6, 0, 0); BANK.add(b); return b; }); BANK.position.set(BX - 5.3, .2, 0);
const LEVEL = add(new THREE.Group()); const LV = []; for (let i = 0; i < 5; i++) { const s = box(.5, .25, .1, lp(0x3ddc84, { emissive: 0x1a8040, emissiveIntensity: .6 })); s.position.y = i * .3; LEVEL.add(s); LV.push(s); } LEVEL.position.set(BX - 4.5, 2.5, .2);
const INV = add(inverter(1.1)); INV.position.set(BX, 1.4, 0);
const XINV = add(texPlane(2.2, 2.2, 128, 128, (x) => { x.strokeStyle = '#ff3030'; x.lineWidth = 16; x.lineCap = 'round'; x.beginPath(); x.moveTo(18, 18); x.lineTo(110, 110); x.moveTo(110, 18); x.lineTo(18, 110); x.stroke(); })); XINV.position.set(BX, 1.6, .8);
const MINI = add(new THREE.Group()); const MW = []; { const b = box(3, 2.4, 2.4, 0xf2e6c8); b.position.y = 1.4; const roof = M(new THREE.ConeGeometry(2.4, 1.2, 4), lp(0xb5543a, { flatShading: true })); roof.position.y = 3.2; roof.rotation.y = Math.PI / 4; MINI.add(b, roof); for (const x of [-.6, .6]) { const w = box(.7, .7, .1, glowM()); w.position.set(x, 1.6, 1.22); MINI.add(w); MW.push(w); } } MINI.position.set(BX + 4, .2, 0);
const DC = parts(14, new THREE.MeshBasicMaterial({ color: 0x4aa8ff }), .1); const AC = parts(14, new THREE.MeshBasicMaterial({ color: 0xffc23a }), .1);
const WIRE1 = add(cyl(.06, .06, 1.6, 0x22252c, 6)); WIRE1.rotation.z = Math.PI / 2; WIRE1.position.set(BX - 1.6, 1.2, 0);
const WIRE2 = add(cyl(.06, .06, 1.8, 0x22252c, 6)); WIRE2.rotation.z = Math.PI / 2; WIRE2.position.set(BX + 1.7, 1.2, 0);
// ---------- ZONA C: tres tipos de batería ----------
const CX = 80; plat(CX, 18);
const PED = [-4, 0, 4].map((x, i) => { const p = add(cyl(1.3, 1.4, .5, [0x9aa0aa, 0x5e6573, 0x2b5fd0][i], 28)); p.position.set(CX + x, .45, 0); return p; });
const BT = [battery(0x8a8f99, 0x6e737c, 'PLOMO', 1), battery(0x1d2029, 0x111316, 'AGM · GEL', 1), battery(0x2a6bd8, 0x1d4fa8, 'LITIO', .85)].map((b, i) => { add(b); b.position.set(CX - 4 + i * 4, .7, 0); return b; });
const CAPS = [-.35, 0, .35].map(x => { const c = cyl(.1, .1, .15, 0xffffff, 8); c.position.set(x, 1.68, -.2); BT[0].add(c); return c; });
const DRIPS = parts(10, new THREE.MeshBasicMaterial({ color: 0x9fe0ff }), .06);
const WR = add(new THREE.Group()); { const h = box(.15, 1.4, .1, 0x9aa0aa); const hd = M(new THREE.TorusGeometry(.22, .07, 6, 14, 4.8), lp(0x9aa0aa)); hd.position.y = .8; WR.add(h, hd); }
const CHK = add(texPlane(1, 1, 128, 128, (x) => { x.fillStyle = '#3ddc84'; x.beginPath(); x.arc(64, 64, 60, 0, 6.29); x.fill(); x.strokeStyle = '#fff'; x.lineWidth = 16; x.lineCap = 'round'; x.beginPath(); x.moveTo(34, 66); x.lineTo(56, 88); x.lineTo(96, 42); x.stroke(); })); CHK.position.set(CX, 3.4, .8);
const SCALE = add(new THREE.Group()); { const b = box(1.8, .2, 1.4, 0xdfe3ea); const d = texPlane(.8, .3, 160, 60, (x, w, h) => { x.fillStyle = '#0d1220'; x.fillRect(0, 0, w, h); x.fillStyle = '#3ddc84'; x.font = '800 40px I'; x.textAlign = 'center'; x.fillText('LIGERA', w / 2, 44); }); d.position.set(0, .02, .71); SCALE.add(b, d); } SCALE.position.set(CX + 4, .82, 1.6);
// ---------- ZONA D: antes de comprar ----------
const DX = 120; plat(DX, 16);
const INV2 = add(inverter(1.2)); INV2.position.set(DX - 3, 1.5, 0);
const QB = add(texPlane(1.3, 1.3, 128, 128, (x) => { x.fillStyle = '#ffb020'; x.beginPath(); x.arc(64, 64, 60, 0, 6.29); x.fill(); x.fillStyle = '#fff'; x.font = '900 90px I'; x.textAlign = 'center'; x.textBaseline = 'middle'; x.fillText('?', 64, 70); })); QB.position.set(DX - .8, 4, .5);
const BAT2 = add(battery(0x2a6bd8, 0x1d4fa8, 'BATERÍAS', 1)); BAT2.position.set(DX, .2, .3);
const CLK2 = add(texPlane(1.6, 1.6, 200, 200, (x) => { x.fillStyle = '#fff'; x.beginPath(); x.arc(100, 100, 92, 0, 6.29); x.fill(); x.strokeStyle = '#2a2d36'; x.lineWidth = 8; x.stroke(); x.fillStyle = 'rgba(61,220,132,.45)'; x.beginPath(); x.moveTo(100, 100); x.arc(100, 100, 84, -Math.PI / 2, Math.PI * .8); x.fill(); x.fillStyle = '#2a2d36'; x.font = '900 40px I'; x.textAlign = 'center'; x.fillText('¿? h', 100, 162); })); CLK2.position.set(DX + 2.5, 3.2, 0);
const TOOLS = add(new THREE.Group()); { const b = box(1.8, .8, .9, 0xe0453a); b.position.y = .4; const h = M(new THREE.TorusGeometry(.4, .07, 6, 16, Math.PI), lp(0x2a2d36)); h.position.y = .8; TOOLS.add(b, h); } TOOLS.position.set(DX + 4.2, .2, 1.2);
const APPL = [[0xffe08a, 'bulb'], [0x2b5fd0, 'fan'], [0xf2f4f7, 'fridge']].map(([c, k], i) => { const g0 = new THREE.Group(); if (k === 'bulb') { const b = sph(.4, lp(c, { emissive: 0xffb020, emissiveIntensity: .5 })); b.position.y = .5; g0.add(b); } else if (k === 'fan') { const p = cyl(.06, .06, .9, 0x9aa0aa); p.position.y = .45; const r = M(new THREE.TorusGeometry(.4, .05, 6, 20), lp(c)); r.position.y = 1; g0.add(p, r); } else { const f = rbox(.7, 1.3, .6, .06, lp(c)); f.position.y = .65; g0.add(f); } add(g0); g0.position.set(DX + 1.2 + i * 1.1, .2, 2.6); return g0; });
// ---------- tomas ----------
SHOTS = [
  [0, PS(2), [1, 6.5, 21], [0, 6, 19], [0, 3, 0], [0, 3.2, 0]],
  [PS(2), PS(9), [BX - .5, 5.5, 30], [BX + .3, 5, 28], [BX - .3, 3.2, 0], [BX - .3, 3.2, 0]],
  [PS(9), PS(12), [CX, 7.5, 25], [CX + .5, 7, 23], [CX, 2.4, 0], [CX, 2.4, 0]],
  [PS(12), PS(13), [CX - 4, 4.2, 9.5], [CX - 3.6, 3.8, 8.5], [CX - 4, 1.7, 0], [CX - 4, 1.7, 0]],
  [PS(13), PS(14), [CX, 4.2, 9.5], [CX + .4, 3.8, 8.5], [CX, 1.8, 0], [CX, 1.8, 0]],
  [PS(14), PS(16), [CX + 4, 4.2, 10], [CX + 4.4, 3.8, 9], [CX + 4, 1.7, .5], [CX + 4, 1.7, .5]],
  [PS(16), PS(20), [DX + .5, 7.5, 30], [DX + 1, 7, 28], [DX + .8, 2.5, 0], [DX + .8, 2.5, 0]],
  [PS(20), END, [BX + 1, 9, 34], [BX - 1, 10, 36], [BX - .3, 2.6, 0], [BX - .3, 2.6, 0]]
];
SHAKE = [[KW.oscuras - .1, KW.oscuras + .5, .06]];
let DARK = 0;
function animWorld(t) {
  sunAt(t < PS(2) ? 0 : t < PS(9) || t >= PS(20) ? BX : t < PS(16) ? CX : DX, 0, 0, 16);
  // oscuridad: apagón al inicio y al quedarse a oscuras
  DARK = t < PS(2) ? (t < KW.compra ? .55 * (1 - P(t, KW.inversor1 - .2, .4)) : .7 * P(t, KW.oscuras - .3, .3)) : 0;
  hemi.intensity = 1.25 * (1 - DARK * .8); sunL.intensity = 2.7 * (1 - DARK);
  const lit = t < PS(2) && inn(t, KW.inversor1, KW.oscuras - .3); WINS.forEach(w => { w.material.emissiveIntensity = lit ? 1 : 0; w.material.color.set(lit ? 0xffe08a : 0x2a3350); });
  pop(BOLT, t, KW.apagones - .2, .3, KW.corre); BOLT.material.opacity = .6 + .4 * Math.sin(t * 30);
  BOXI.visible = inn(t, KW.corre - .2, PS(2)); if (BOXI.visible) { const k = P(t, KW.corre - .2, .5); BOXI.position.y = lerp(6, .2, k * k); }
  pop(CLK, t, KW.horas1 - .5, .4, PS(2)); drawClock(lerp(0, 2, clamp(P(t, KW.horas1 - .3, 1.2))));
  // circuito
  const flow = inn(t, KW.baterias1 - .2, PS(9)) && !inn(t, KW.malas, KW.bueno + .6);
  DC.visible = flow; AC.visible = flow && t > KW.convierte - .3;
  for (let i = 0; i < 14; i++) { const ph = (t * .6 + i / 14) % 1; setP(DC, i, lerp(BX - 2.4, BX - .9, ph), 1.2 + Math.sin(ph * 12) * .05, 0, DC.visible, 1); setP(AC, i, lerp(BX + .9, BX + 2.6, ph), 1.2 + Math.sin(ph * 18) * .12, 0, AC.visible, 1); }
  DC.instanceMatrix.needsUpdate = true; AC.instanceMatrix.needsUpdate = true;
  pop(XINV, t, KW.guarda - .2, .35, KW.baterias1 - .2);
  const glowB = inn(t, KW.baterias1 - .2, PS(5)); BB.forEach(b => { b.children[0].material.emissive = new THREE.Color(0x3ddc84); b.children[0].material.emissiveIntensity = glowB ? .25 + .15 * Math.sin(t * 6) : 0; });
  const small = t > KW.pequenas - .2 && t < PS(9) ? 1 - .45 * eout(P(t, KW.pequenas - .2, .5)) : 1; BANK.scale.setScalar(small);
  const lev = t < KW.malas ? 5 : Math.max(0, 5 - Math.floor((t - KW.malas) * 3)); LV.forEach((s, i) => { s.visible = t > KW.baterias1 - .2 && t < PS(9) && i < lev; s.material.color.set(lev <= 2 ? 0xff4d4d : 0x3ddc84); });
  const mlit = flow && t > KW.casa - .6; MW.forEach(w => { w.material.emissiveIntensity = mlit ? 1 : 0; w.material.color.set(mlit ? 0xffe08a : 0x2a3350); });
  INV.rotation.y = inn(t, KW.bueno - .3, PS(9)) ? Math.sin(t * 3) * .3 : 0; pop(INV, t, KW.inversor1 > PS(2) ? PS(2) : PS(2), .4);
  // tipos
  BT.forEach((b, i) => { pop(b, t, PS(9) + .4 + i * .35, .45); b.rotation.y = Math.sin(t * .8 + i) * .15; });
  DRIPS.visible = inn(t, KW.atencion - .3, PS(13)); for (let i = 0; i < 10; i++) { const ph = (t * 1.2 + i * .1) % 1; setP(DRIPS, i, CX - 4 + (i % 3 - 1) * .35, 2.5 - ph * 1.2, .55, DRIPS.visible, 1 - ph * .5); } DRIPS.instanceMatrix.needsUpdate = true;
  WR.visible = inn(t, KW.atencion - .3, PS(13)); WR.position.set(CX - 2.8, 2.3, .8); WR.rotation.z = Math.sin(t * 6) * .5;
  pop(CHK, t, KW.mantenimiento ?? (KW.agm + 1.2), .35, PS(14)); CHK.position.set(CX, 3.3, .8);
  pop(SCALE, t, KW.pesan - .3, .4, PS(16));
  // antes de comprar
  pop(INV2, t, PS(16), .4); pop(QB, t, KW.solo - .3, .35, KW.trae - .3); pop(BAT2, t, KW.trae - .4, .4); pop(CLK2, t, KW.horas2 - .3, .4);
  APPL.forEach((o, i) => pop(o, t, KW.prender - .3 + i * .15, .35)); pop(TOOLS, t, KW.instale - .3, .4);
}
function overlay2d(t) {
  if (DARK > 0) { g.save(); g.fillStyle = `rgba(8,12,34,${DARK * .75})`; g.fillRect(0, 0, W, H); g.restore(); }
  floaters(t, 8, 'rgba(255,230,140,.8)', 'dust');
  pill(t, KW.apagones - .2, KW.corre, 540, 1450, 'APAGÓN', C.red, 'warn');
  pill(t, KW.inversor1 - .3, PS(1), 540, 1450, 'TODOS COMPRAN INVERSOR', C.amber, 'arrow');
  punch(t, KW.horas1 - .4, PS(2), [['¡A OSCURAS', '#ffffff'], ['OTRA VEZ!', C.red]], 540, 1260, { size: 80 });
  punch(t, PS(2) - .2, PS(3), [['¿POR', '#ffffff'], ['QUÉ?', C.amber]], 540, 1260, { size: 110 });
  pill(t, KW.guarda - .5, PS(4), 540, 1480, 'EL INVERSOR NO GUARDA LUZ', C.red, 'x');
  pill(t, KW.baterias1 - .3, PS(5), 540, 1480, 'LA GUARDAN LAS BATERÍAS', C.green, 'check');
  panel(t, KW.convierte - .4, PS(6), 540, 1440, 860, 200, 'EL INVERSOR CONVIERTE', C.amber, (g, w, h) => { g.font = '800 34px I'; g.textAlign = 'left'; g.textBaseline = 'middle'; g.fillStyle = C.blue; g.fillText('Energía de la batería', -w / 2 + 30, 30); g.fillStyle = '#fff'; g.fillText('→', 40, 30); g.fillStyle = C.amber; g.fillText('tu casa', 110, 30); });
  pill(t, KW.pequenas - .3, PS(8), 540, 1450, 'BATERÍAS PEQUEÑAS O MALAS', C.red, 'warn');
  punch(t, KW.bueno - .5, PS(9), [['BATERÍAS', C.amber], ['PRIMERO', '#ffffff']], 540, 1260, { size: 96 });
  punch(t, KW.iguales - 1.2, PS(11), [['NO SON', '#ffffff'], ['IGUALES', C.amber]], 540, 1260, { size: 104 });
  punch(t, KW.susc - .1, PS(11) + 2.6, [['¡SUSCRÍBETE!', '#ffffff']], 540, 1250, { stamp: '#ff2d3d', size: 92, rot: -.05 });
  const card = (a, b, title, col, rows) => panel(t, a, b, 540, 1430, 880, 250, title, col, (g, w, h) => { g.font = '800 32px I'; g.textAlign = 'left'; g.textBaseline = 'middle'; rows.forEach(([ok, txt], i) => { g.fillStyle = ok ? C.green : C.red; g.fillText(ok ? '✓' : '✗', -w / 2 + 30, -18 + i * 54); g.fillStyle = '#fff'; g.fillText(txt, -w / 2 + 76, -18 + i * 54); }); });
  card(KW.plomo - .3, PS(13), 'PLOMO-ÁCIDO TRADICIONAL', '#c9ced8', [[1, 'La más barata al principio'], [0, 'Necesita atención constante']]);
  card(KW.agm - .3, PS(14), 'AGM Y GEL', C.blue, [[1, 'Sin mantenimiento'], [1, 'Seguras para la casa']]);
  card(KW.litio - .3, PS(16), 'LITIO (LiFePO4)', C.green, [[0, 'Más caras'], [1, 'Duran mucho más y pesan menos']]);
  punch(t, KW.solo - 1.4, PS(17), [['ANTES DE', '#ffffff'], ['COMPRAR', C.amber]], 540, 1260, { size: 92 });
  const Q = [[KW.trae, '¿QUÉ BATERÍAS TRAE?'], [KW.horas2, '¿CUÁNTAS HORAS ME DURA?'], [KW.instale, '¿QUIÉN LO INSTALA?']]; Q.forEach(([a, txt], i) => pill(t, a - .4, PS(20), 540, 1340 + i * 86, txt, C.green, 'check', 33));
  question(t, KW.coment, '¿Cuántas horas te dura el respaldo?', ['Menos de 2 h', '2 a 6 h', 'Más de 6 h', 'No tengo'], 1300);
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
