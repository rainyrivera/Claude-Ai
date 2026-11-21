// Reel 9:16 3D — Estilo C "Escalada 3D" (ref. referencias/estilo-escalada-balcon.mp4) — La flecha de la gasolina
import * as THREE from 'three';

const W = 1080, H = 1920, END = 67.65;   // END = última palabra + ~4,2 s (cierre 3,7 s)
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
// ================= LA FLECHA DE LA GASOLINA =================
const DISC = 'Recreación ilustrativa · no está a escala';
const KW = { mira: T('mira'), flechita: T('flechita'), diciendo: T('diciendo'), lado1: T('lado'), izq: T('izquierda'), der: T('derecha'), facil: T('fácil'), sirve: T('sirve'), bomba: T('bomba'), prestado: T('prestado'), paras: T('paras'), otro: T('otro'), vuelta: T('vuelta'), manguera: T('manguera'), verguenza: T('vergüenza'), susc: T('suscríbete'), ojo: T('ojo'), falso: T('falso'), manguerita: T('manguerita'), siempre: T('siempre'), manda: T('manda'), noTiene: T('tiene'), manual: T('manual'), fijate: T('fíjate'), coment: T('comentarios') };
// ---------- carro low-poly ----------
function makeCar(col) {
  const c = new THREE.Group(); const body = rbox(4.2, .9, 1.9, .12, lp(col, { roughness: .45 })); body.position.y = .75; c.add(body);
  const cab = rbox(2.3, .75, 1.7, .12, lp(col, { roughness: .45 })); cab.position.set(-.3, 1.5, 0); c.add(cab);
  const glass = lp(0x1e2a3c, { roughness: .2 }); const ws = box(.08, .6, 1.5, glass); ws.position.set(.86, 1.5, 0); ws.rotation.z = -.35; c.add(ws); const rw = box(.08, .55, 1.5, glass); rw.position.set(-1.46, 1.5, 0); rw.rotation.z = .3; c.add(rw);
  for (const s of [1, -1]) { const sw = box(1.9, .5, .04, glass); sw.position.set(-.3, 1.52, s * .86); c.add(sw); }
  for (const [x, z] of [[1.35, .95], [1.35, -.95], [-1.35, .95], [-1.35, -.95]]) { const w = cyl(.42, .42, .32, 0x1b1d22, 18); w.rotation.x = Math.PI / 2; w.position.set(x, .42, z); c.add(w); const hb = cyl(.2, .2, .34, 0xc9cdd4, 12); hb.rotation.x = Math.PI / 2; hb.position.set(x, .42, z); c.add(hb); }
  for (const s of [1, -1]) { const hl = box(.06, .18, .35, lp(0xfff6d0, { emissive: 0x665522 })); hl.position.set(2.1, .85, s * .6); c.add(hl); const tl = box(.06, .16, .35, lp(0xff3030, { emissive: 0x550000 })); tl.position.set(-2.1, .85, s * .6); c.add(tl); }
  // tapas de gasolina (s=+1 derecha = +z, s=-1 izquierda = -z), con bisagra
  c.userData.doors = {}; for (const s of [1, -1]) { const hinge = new THREE.Group(); hinge.position.set(-1.05, .98, s * .965); const d = box(.34, .3, .04, lp(col, { roughness: .4 })); d.position.x = .17; hinge.add(d); const hole = cyl(.1, .1, .05, 0x111111, 12); hole.rotation.x = Math.PI / 2; hole.position.set(-1.05 + .17, .98, s * .95); c.add(hinge, hole); c.userData.doors[s] = hinge; const glowS = new THREE.Sprite(new THREE.SpriteMaterial({ color: 0xffd23a, transparent: true, opacity: 0, depthTest: false })); glowS.position.set(-.88, .98, s * 1.05); glowS.scale.set(.9, .9, 1); glowS.renderOrder = 4; c.add(glowS); c.userData['g' + s] = glowS; }
  return c;
}
const glowTex = (() => { const t = canvasTex(128, 128), x = t.x, gr = x.createRadialGradient(64, 64, 0, 64, 64, 64); gr.addColorStop(0, 'rgba(255,230,120,1)'); gr.addColorStop(1, 'rgba(255,230,120,0)'); x.fillStyle = gr; x.fillRect(0, 0, 128, 128); t.tx.needsUpdate = true; return t.tx; })();
const CAR = add(makeCar(0xe0453a)); for (const s of [1, -1]) CAR.userData['g' + s].material.map = glowTex;
// ---------- mundo: carretera + gasolinera ----------
add(road(10, 6.5, 160)); add(road(30, 0, 40, 0, 12)).children.forEach(o => { if (o.geometry && o.geometry.type === 'BoxGeometry') o.visible = false; });
[[-20, -8, 4, 3, 5, 0xe8d7b0], [-10, -12, 5, 3, 7, 0xd9c9a6], [48, -12, 5, 3, 6, 0xf0e0c0], [58, -9, 4, 3, 4, 0xe2d2b0]].forEach(b => building(...b));
[[-14, 12], [-4, 12], [8, 12], [20, 12.5], [44, 11], [52, 12]].forEach(([x, z]) => tree(x, z, 1.3));
const ST = add(new THREE.Group()); ST.position.set(30, 0, 0);
{ const cn = box(16, .5, 10, 0xf7f7f7); cn.position.y = 5.2; const strip = box(16.1, .22, 10.1, 0xe0453a); strip.position.y = 5.0; ST.add(cn, strip); for (const [x, z] of [[-5, 0], [5, 0]]) { const col = cyl(.25, .25, 5, 0xdedede, 12); col.position.set(x, 2.5, z); ST.add(col); }
  const isl = box(12, .35, 1.4, 0xbfc3ca); isl.position.y = .17; ST.add(isl); }
const PUMPS = []; for (const x of [-3, 3]) { const p = new THREE.Group(); const b = rbox(1.0, 2.0, .7, .08, lp(0xf4f4f4)); b.position.y = 1.35; const top = box(1.05, .35, .75, 0xe0453a); top.position.y = 2.45; const sc = box(.6, .35, .05, lp(0x1e2a3c)); sc.position.set(0, 1.8, .37); const sc2 = sc.clone(); sc2.position.z = -.37; const noz = box(.15, .4, .15, 0x2a2d36); noz.position.set(.42, 1.4, .3); const noz2 = noz.clone(); noz2.position.z = -.3; p.add(b, top, sc, sc2, noz, noz2); p.position.set(x, 0, 0); ST.add(p); PUMPS.push(p); }
{ const pole = cyl(.15, .15, 7, 0x9aa0aa); pole.position.set(9.5, 3.5, -4); const sg = texPlane(2.6, 1.6, 260, 160, (x, w, h) => { x.fillStyle = '#e0453a'; rrp(x, 0, 0, 0, w, h, 16); x.fill(); x.fillStyle = '#fff'; x.font = '900 56px I'; x.textAlign = 'center'; x.textBaseline = 'middle'; x.fillText('GAS', w / 2, 52); x.font = '800 40px I'; x.fillText('$ 2 9 1', w / 2, 116); }, false); sg.position.set(9.5, 7.6, -4); ST.add(pole, sg); }
// manguera estirada sobre el techo (se revela con drawRange)
const hoseCurve = new THREE.CatmullRomCurve3([V(27, 1.4, .3), V(27.2, 2.4, 1.2), V(28.6, 2.6, 2.2), V(28.9, 2.1, 3.3), V(28.95, 1.0, 3.2)]);
const hoseG = new THREE.TubeGeometry(hoseCurve, 60, .06, 6); const HOSE = add(M(hoseG, lp(0x1b1d22)));
// ruta de "dar la vuelta" (para el final, estacionarse bien)
const loop = new THREE.CatmullRomCurve3([V(30, 0, 2.2), V(38, 0, 2.6), V(44, 0, -1), V(41, 0, -7), V(26, 0, -8.5), V(17, 0, -5), V(20, 0, -2.2), V(30, 0, -2.2)]);
const dashPts = loop.getPoints(80); const DASH = add(new THREE.Line(new THREE.BufferGeometry().setFromPoints(dashPts.map(p => V(p.x, .08, p.z))), new THREE.LineDashedMaterial({ color: 0xffd23a, dashSize: .6, gapSize: .4, linewidth: 2 }))); DASH.computeLineDistances();
// manual
const MANUAL = add(new THREE.Group()); { const b = rbox(1.4, 1.9, .22, .04, lp(0x2b5fd0)); const tx = texPlane(1.2, 1.6, 240, 320, (x, w, h) => { x.fillStyle = '#fff'; x.font = '900 46px I'; x.textAlign = 'center'; x.fillText('MANUAL', w / 2, 90); x.font = '600 26px I'; x.fillText('del propietario', w / 2, 130); x.strokeStyle = '#fff'; x.lineWidth = 6; x.beginPath(); x.arc(w / 2, 220, 50, 0, 6.29); x.stroke(); }); tx.position.z = .12; MANUAL.add(b, tx); }
// ---------- tablero gigante (zona B) ----------
const BX = -40; add(box(14, .3, 8, 0xd9d4c8)).position.set(BX, .15, 0);
const DASHT = canvasTex(1024, 600); const DB = add(new THREE.Group()); { const fr = rbox(9.4, 5.6, .5, .3, lp(0x16181d, { roughness: .5 })); const sc = M(new THREE.PlaneGeometry(8.8, 5.15), new THREE.MeshBasicMaterial({ map: DASHT.tx, toneMapped: false }), false); sc.position.z = .34; for (const x of [-3, 3]) { const lg = box(.3, 2.2, .3, 0x2a2d36); lg.position.set(x, -3.6, -.1); DB.add(lg); } DB.add(fr, sc); } DB.position.set(BX, 3.9, 0); DB.scale.setScalar(.7);
function drawDash(t) {
  const x = DASHT.x, w = 1024, h = 600; x.fillStyle = '#0d0f14'; x.fillRect(0, 0, w, h);
  // velocímetro
  x.save(); x.translate(300, 330); x.strokeStyle = 'rgba(255,255,255,.85)'; x.lineWidth = 6; x.beginPath(); x.arc(0, 0, 210, Math.PI * .8, Math.PI * 2.2); x.stroke();
  for (let i = 0; i <= 12; i++) { const a = Math.PI * .8 + i / 12 * Math.PI * 1.4; x.lineWidth = i % 2 ? 3 : 6; x.beginPath(); x.moveTo(Math.cos(a) * 190, Math.sin(a) * 190); x.lineTo(Math.cos(a) * 165, Math.sin(a) * 165); x.stroke(); }
  x.fillStyle = '#fff'; x.font = '800 70px I'; x.textAlign = 'center'; x.fillText('60', 0, 90); x.font = '600 24px I'; x.fillStyle = 'rgba(255,255,255,.6)'; x.fillText('km/h', 0, 125);
  const na = Math.PI * .8 + .45 * Math.PI * 1.4; x.strokeStyle = '#ff5a3c'; x.lineWidth = 8; x.beginPath(); x.moveTo(0, 0); x.lineTo(Math.cos(na) * 175, Math.sin(na) * 175); x.stroke(); x.restore();
  // indicador de gasolina
  x.save(); x.translate(760, 360); x.strokeStyle = 'rgba(255,255,255,.85)'; x.lineWidth = 6; x.beginPath(); x.arc(0, 0, 170, Math.PI * 1.15, Math.PI * 1.85); x.stroke(); x.font = '800 34px I'; x.fillStyle = '#fff'; x.fillText('E', -150, -40); x.fillText('F', 125, -40);
  const fa = Math.PI * 1.15 + .25 * Math.PI * .7; x.strokeStyle = '#ffb020'; x.lineWidth = 8; x.beginPath(); x.moveTo(0, 0); x.lineTo(Math.cos(fa) * 150, Math.sin(fa) * 150); x.stroke(); x.restore();
  // ícono de bomba + manguera + flecha
  const ix = 730, iy = 420; const hoseHi = inn(t, KW.manguerita - .2, KW.manda); const hoseX = inn(t, KW.siempre - .2, KW.manda);
  x.fillStyle = '#ffb020'; rrp(x, 0, ix - 30, iy - 50, 60, 90, 8); x.fill(); x.fillStyle = '#0d0f14'; x.fillRect(ix - 18, iy - 38, 36, 26);
  x.strokeStyle = hoseHi ? '#4aa8ff' : '#ffb020'; x.lineWidth = hoseHi ? 12 : 8; x.beginPath(); x.moveTo(ix + 30, iy - 30); x.lineTo(ix + 52, iy - 30); x.lineTo(ix + 52, iy + 20); x.lineTo(ix + 64, iy + 20); x.stroke();
  if (hoseHi) { x.strokeStyle = 'rgba(74,168,255,.6)'; x.lineWidth = 4; x.beginPath(); x.arc(ix + 52, iy - 5, 48, 0, 6.29); x.stroke(); }
  if (hoseX) { x.strokeStyle = '#ff4d4d'; x.lineWidth = 12; x.beginPath(); x.moveTo(ix + 22, iy - 50); x.lineTo(ix + 84, iy + 40); x.moveTo(ix + 84, iy - 50); x.lineTo(ix + 22, iy + 40); x.stroke(); }
  const dir = inn(t, KW.der - .1, KW.sirve) ? 1 : inn(t, KW.izq - .1, KW.der - .1) ? -1 : 1;
  const gone = t > KW.noTiene && t < KW.fijate; const hi = inn(t, KW.flechita - .2, KW.sirve) || inn(t, KW.manda - .2, KW.noTiene);
  if (!gone) { const ax = dir > 0 ? ix + 120 : ix - 90; x.save(); x.translate(ax, iy - 5); x.scale(dir, 1); const pul = hi ? 1 + .12 * Math.sin(t * 10) : 1; x.scale(pul, pul); x.fillStyle = hi ? '#ffd23a' : '#ffb020'; x.shadowColor = hi ? '#ffd23a' : 'transparent'; x.shadowBlur = hi ? 30 : 0; x.beginPath(); x.moveTo(26, 0); x.lineTo(-16, -26); x.lineTo(-16, 26); x.closePath(); x.fill(); x.restore(); if (hi) { x.strokeStyle = 'rgba(255,210,58,.8)'; x.lineWidth = 5; x.beginPath(); x.arc(ax, iy - 5, 52 + 6 * Math.sin(t * 8), 0, 6.29); x.stroke(); } }
  else { x.strokeStyle = 'rgba(255,255,255,.25)'; x.setLineDash([8, 8]); x.lineWidth = 4; x.beginPath(); x.arc(ix + 120, iy - 5, 40, 0, 6.29); x.stroke(); x.setLineDash([]); x.fillStyle = 'rgba(255,255,255,.5)'; x.font = '900 50px I'; x.textAlign = 'center'; x.fillText('?', ix + 120, iy + 12); }
  DASHT.tx.needsUpdate = true;
}
// ---------- tomas ----------
SHOTS = [
  [0, PS(1), [-6, 2.2, 15], [-3, 2.8, 14], [-12, 1, 6.5], [-4, 1, 6.5]],
  [PS(1), PS(2), [BX + 2, 4.2, 14], [BX + 1, 4.0, 12], [BX, 3.8, 0], [BX, 3.8, 0]],
  [PS(2), PS(4), [BX + 2.6, 3.8, 8], [BX + 2.2, 3.7, 6.8], [BX + 1.6, 3.6, 0], [BX + 1.7, 3.6, 0]],
  [PS(4), PS(8), [-9, 4.2, 1.5], [-8, 4.6, -1], [0, .9, 0], [0, .9, 0]],
  [PS(8), PS(11), [18, 9, 20], [20, 8, 18], [30, 1.5, 0], [30, 1.5, 0]],
  [PS(11), PS(14), [26, 4.2, 12], [24.5, 4.6, 12.5], [29, 1.4, 1.6], [28.5, 1.6, 1.6]],
  [PS(14), PS(15), [36, 6, 14], [24, 6, 14], [30, 2, 0], [30, 2, 0]],
  [PS(15), PS(20), [BX + 2.4, 3.9, 10], [BX + 2.0, 3.8, 8.5], [BX + 1.6, 3.6, 0], [BX + 1.6, 3.6, 0]],
  [PS(20), PS(21) + 1.2, [BX - 2, 4.2, 14], [BX, 4.2, 13], [BX - .5, 3.6, 0], [BX - .5, 3.6, 0]],
  [PS(21) + 1.2, PS(22), [30, 14, 18], [30, 12, 16], [30, 0, -1], [30, 0, -1]],
  [PS(22), END, [24, 7, 16], [22, 7.5, 18], [30, 1.5, 0], [30, 1.5, 0]]
];
SHAKE = [[KW.paras, KW.paras + .4, .05], [KW.verguenza, KW.verguenza + .7, .06]];
// ---------- animación ----------
function placeCar(p, yaw) { CAR.position.set(p.x, 0, p.z); CAR.rotation.y = yaw; }
function animWorld(t) {
  sunAt(t >= PS(1) && t < PS(4) || inn(t, PS(15), PS(21) + 1.2) ? BX : t < PS(8) ? 0 : 30, 0, 0, 16);
  drawDash(t);
  // carro
  for (const s of [1, -1]) { CAR.userData.doors[s].rotation.y = 0; CAR.userData['g' + s].material.opacity = 0; }
  const open = (s, a, b) => { const k = eout(P(t, a, .35)) * (1 - eout(P(t, b, .3))); CAR.userData.doors[s].rotation.y = -s * k * 1.4; CAR.userData['g' + s].material.opacity = k * (.6 + .3 * Math.sin(t * 8)); };
  if (t < PS(1)) { placeCar(V(lerp(-22, -6, eout(P(t, 0, 3.6))), 0, 6.5), 0); }
  else if (t < PS(8)) { placeCar(V(0, 0, 0), 0); open(1, KW.lado1, KW.izq - .1); open(-1, KW.izq, KW.der - .1); open(1, KW.der, PS(8)); }
  else if (t < PS(21) + 1.2) { const k = eout(P(t, KW.bomba - .3, KW.paras - KW.bomba + .5)); placeCar(V(lerp(8, 30, k), 0, 2.2), 0); open(1, KW.otro - .2, PS(21)); }
  else { const k = eio(P(t, PS(21) + 1.3, 3.2)); const p = loop.getPointAt(k), tg = loop.getTangentAt(Math.min(.999, k)); placeCar(p, Math.atan2(-tg.z, tg.x)); if (k >= 1) open(1, PS(21) + 4.4, END + 9); }
  // manguera
  HOSE.visible = inn(t, KW.manguera - .2, PS(14)); hoseG.setDrawRange(0, Math.floor(hoseG.index.count * eout(P(t, KW.manguera - .2, .9)) / 3) * 3);
  DASH.visible = inn(t, KW.vuelta - .2, KW.manguera - .2) || inn(t, PS(21) + 1.2, PS(22)); DASH.material.dashSize = .6;
  pop(MANUAL, t, KW.manual - .1, .45, KW.fijate + .2); MANUAL.position.set(BX - 3.4, 2.2, 2.5); MANUAL.rotation.set(0, .4 + Math.sin(t) * .1, 0);
}
// ---------- capa 2D ----------
function overlay2d(t) {
  floaters(t, 10, 'rgba(255,255,255,.7)', 'dust');
  pill(t, .4, PS(1) - .2, 540, 1380, 'AÑOS MANEJANDO…', C.amber, 'clock');
  pill(t, KW.mira, PS(2), 540, 1420, 'EL TABLERO DE TU CARRO', C.blue, 'arrow');
  pill(t, KW.flechita - .1, PS(4), 540, 1400, '¿VES LA FLECHITA?', C.amber, 'arrow');
  pill(t, KW.lado1 - .2, PS(5), 540, 1430, 'EL LADO DE LA TAPA', C.amber, 'star');
  pill(t, KW.izq - .2, KW.der - .2, 540, 1430, 'FLECHA ◀ = TAPA IZQUIERDA', C.blue, 'check');
  pill(t, KW.der - .2, PS(7), 540, 1430, 'FLECHA ▶ = TAPA DERECHA', C.blue, 'check');
  punch(t, KW.facil - .2, PS(8), [['ASÍ DE', '#ffffff'], ['FÁCIL', C.green]], 540, 1200);
  pill(t, KW.prestado - .2, PS(11), 540, 1420, 'CARRO PRESTADO O RENTADO', C.amber, 'star');
  pill(t, KW.otro - .2, KW.vuelta - .1, 540, 1430, 'LA TAPA ESTÁ DEL OTRO LADO', C.red, 'x');
  pill(t, KW.vuelta - .1, KW.manguera - .2, 540, 1430, 'DAR LA VUELTA', C.amber, 'arrow');
  pill(t, KW.manguera - .2, KW.verguenza - .3, 540, 1430, 'ESTIRAR LA MANGUERA', C.amber, 'warn');
  punch(t, KW.verguenza - .2, PS(14) - .1, [['¡QUÉ', '#ffffff'], ['VERGÜENZA!', C.red]], 540, 1200, { size: 100 });
  punch(t, KW.susc - .1, PE(14) + .2, [['¡SUSCRÍBETE!', '#ffffff']], 540, 1200, { stamp: '#ff2d3d', size: 92, rot: -.05 });
  pill(t, KW.falso - .3, PS(17), 540, 1420, 'TRUCO FALSO DE INTERNET', C.red, 'warn');
  pill(t, KW.manguerita - .2, PS(18), 540, 1420, '"EL LADO DE LA MANGUERITA"', C.blue, 'quote');
  punch(t, KW.siempre - .3, PS(19), [['NO', C.red], ['SIEMPRE', '#ffffff']], 540, 1260, { size: 104 });
  punch(t, KW.manda - .3, PS(20), [['MANDA LA', '#ffffff'], ['FLECHA', C.amber]], 540, 1200, { size: 96 });
  pill(t, KW.noTiene - .2, KW.manual, 540, 1420, '¿TU CARRO NO TIENE FLECHA?', C.amber, 'warn');
  pill(t, KW.manual, PS(22), 540, 1420, 'MIRA EL MANUAL O FÍJATE BIEN', C.green, 'check');
  pill(t, PS(21) + 4.4, PS(22), 540, 1500, 'LADO CORRECTO', C.green, 'check');
  question(t, KW.coment, '¿Ya lo sabías?', ['Sí, ya lo sabía', 'Me acabo de enterar', 'Mi carro no tiene flecha'], 1300);
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
