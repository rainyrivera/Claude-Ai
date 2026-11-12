// "¿Qué pasaría si el Doctor Doom crea el Battleworld?" – animación 2D estilo recorte
const W = 1080, H = 1920;
const TIMING = await (await fetch('timing.json')).json();
const WORDS = TIMING.words;
const DUR = TIMING.dur;
await Promise.all(['70px LG', '90px BB', '60px PM', '900 90px CZ'].map(f => document.fonts.load(f, 'ÁÉÍÓÚáéíóúÑñ¿?')));

const cv = document.getElementById('c'); const ctx = cv.getContext('2d');
const mk = (w = W, h = H) => { const c = document.createElement('canvas'); c.width = w; c.height = h; return c; };
const bufA = mk(), bufB = mk();

// ---------- utilidades ----------
let seed = 11;
const rnd = () => { seed = (seed * 16807) % 2147483647; return (seed - 1) / 2147483646; };
const srnd = s => { let x = Math.sin(s * 127.1 + 311.7) * 43758.5453; return x - Math.floor(x); };
const clamp = (x, a = 0, b = 1) => Math.min(b, Math.max(a, x));
const prog = (t, a, b) => clamp((t - a) / (b - a));
const eio = x => x < .5 ? 4 * x * x * x : 1 - Math.pow(-2 * x + 2, 3) / 2;
const eout = x => 1 - Math.pow(1 - x, 3);
const eback = x => { const c1 = 1.9, c3 = c1 + 1; return 1 + c3 * Math.pow(x - 1, 3) + c1 * Math.pow(x - 1, 2); };
const lerp = (a, b, x) => a + (b - a) * x;
const OL = '#16130f';
function rr(g, x, y, w, h, r) { g.beginPath(); g.roundRect(x, y, w, h, r); }
function fs(g, fill, lw = 6) { g.fillStyle = fill; g.fill(); if (lw) { g.lineWidth = lw; g.strokeStyle = OL; g.lineJoin = 'round'; g.stroke(); } }
function ell(g, x, y, rx, ry, fill, lw = 6) { g.beginPath(); g.ellipse(x, y, rx, ry, 0, 0, Math.PI * 2); fs(g, fill, lw); }
function poly(g, pts, fill, lw = 6) { g.beginPath(); pts.forEach(([x, y], i) => i ? g.lineTo(x, y) : g.moveTo(x, y)); g.closePath(); fs(g, fill, lw); }
const blinkAt = (t, k = 0) => ((t + k * 1.37) % 3.3) < 0.11;
function cam(g, lt, dur, amt = 0.05, cx = W / 2, cy = H * 0.45) { const s = 1 + amt * eio(clamp(lt / dur)); g.translate(cx, cy); g.scale(s, s); g.translate(-cx, -cy); }

// ---------- rig de personajes (recorte) ----------
function limb(g, x, y, ang, len, w, fill, end) {
  g.save(); g.translate(x, y); g.rotate(ang);
  rr(g, -w / 2, -w / 2, w, len + w / 2, w / 2); fs(g, fill);
  if (end) end(g, len);
  g.restore();
  return [x - Math.sin(ang) * len, y + Math.cos(ang) * len];
}
const hand = c => (g, len) => { ell(g, 0, len + 6, 17, 17, c, 5); };
const boot = c => (g, len) => { rr(g, -20, len - 10, 52, 30, 10); fs(g, c, 5); };

// spec: colores y funciones; pose: ángulos
function figure(g, x, y, s, sp, p = {}) {
  g.save(); g.translate(x, y + (p.bob || 0)); g.scale(s * (p.flip ? -1 : 1), s);
  const aL = p.aL ?? 0.12, aR = p.aR ?? -0.12, lL = p.lL ?? 0.06, lR = p.lR ?? -0.06;
  const tw = sp.tw || 116, th = sp.th || 190, leg = sp.leg || 215, arm = sp.arm || 175;
  if (sp.capeBack) sp.capeBack(g, tw, th, leg, p);
  // brazo trasero
  limb(g, tw / 2 - 12, -th + 18, aR, arm, 30, sp.arm2 || sp.armC, hand(sp.handC || sp.skin));
  if (p.holdR) p.holdR(g, tw / 2 - 12 - Math.sin(aR) * arm, -th + 18 + Math.cos(aR) * arm + 6);
  // piernas
  limb(g, 22, -6, lR, leg, 38, sp.legC, boot(sp.bootC));
  limb(g, -22, -6, lL, leg, 38, sp.legC, boot(sp.bootC));
  // torso
  g.beginPath(); g.moveTo(-tw / 2, -th); g.lineTo(tw / 2, -th); g.lineTo(tw / 2 - 10, 10); g.lineTo(-tw / 2 + 10, 10); g.closePath(); fs(g, sp.torso);
  if (sp.torsoDeco) sp.torsoDeco(g, tw, th);
  // cabeza
  g.save(); g.translate(0, -th - 50); g.rotate(p.tilt || 0); sp.head(g, p); g.restore();
  // brazo delantero
  limb(g, -tw / 2 + 12, -th + 18, aL, arm, 30, sp.armC, hand(sp.handC || sp.skin));
  if (p.holdL) p.holdL(g, -tw / 2 + 12 - Math.sin(aL) * arm, -th + 18 + Math.cos(aL) * arm + 6);
  if (sp.front) sp.front(g, tw, th, p);
  g.restore();
}
// pose de caminar/idle
const walk = (t, sp = 1, amp = 0.45) => { const a = Math.sin(t * Math.PI * 2 * sp) * amp; return { aL: -a * .8, aR: a * .8, lL: a, lR: -a, bob: -Math.abs(Math.cos(t * Math.PI * 2 * sp)) * 8 }; };
const idle = (t, k = 0) => { const a = Math.sin(t * 1.6 + k) * 0.05; return { aL: 0.12 + a, aR: -0.12 - a, bob: Math.sin(t * 2.2 + k) * 2.5, blink: blinkAt(t, k) }; };

function eyes(g, y, dx, blink, c = '#16130f', r = 6) {
  if (blink) { g.lineWidth = 4; g.strokeStyle = OL; g.beginPath(); g.moveTo(-dx - 8, y); g.lineTo(-dx + 8, y); g.moveTo(dx - 8, y); g.lineTo(dx + 8, y); g.stroke(); }
  else { g.fillStyle = c; g.beginPath(); g.arc(-dx, y, r, 0, 7); g.arc(dx, y, r, 0, 7); g.fill(); }
}

// --- Doom ---
const DOOM_G = '#2f6b3a', DOOM_G2 = '#24532d', METAL = '#9aa3a8', METAL2 = '#7d868c';
function doomMask(g, glow = 0) {
  ell(g, 0, -4, 62, 72, DOOM_G); // capucha
  g.beginPath(); g.moveTo(-58, 10); g.quadraticCurveTo(0, -95, 58, 10); g.lineTo(46, 70); g.lineTo(-46, 70); g.closePath(); fs(g, DOOM_G2, 5);
  rr(g, -40, -42, 80, 100, 30); fs(g, METAL);
  g.fillStyle = 'rgba(255,255,255,.25)'; rr(g, -30, -36, 18, 80, 9); g.fill();
  // ojos
  const ec = glow > 0 ? `rgba(${180 + 75 * glow | 0},${255},${120 + 60 * glow | 0},1)` : '#141414';
  if (glow > 0) { g.save(); g.shadowColor = '#9dff7a'; g.shadowBlur = 30 * glow; }
  g.fillStyle = ec; rr(g, -30, -10, 22, 9, 3); g.fill(); rr(g, 8, -10, 22, 9, 3); g.fill();
  if (glow > 0) g.restore();
  g.lineWidth = 4; g.strokeStyle = OL; g.beginPath(); g.moveTo(0, -36); g.lineTo(0, 18); g.stroke();
  // rejilla boca
  g.beginPath(); for (let i = -2; i <= 2; i++) { g.moveTo(i * 8, 28); g.lineTo(i * 8, 44); } g.stroke();
  g.fillStyle = '#5d6569'; [[-32, -30], [32, -30], [-32, 44], [32, 44]].forEach(([a, b]) => { g.beginPath(); g.arc(a, b, 4, 0, 7); g.fill(); });
}
const DOOM = {
  skin: METAL, armC: METAL, legC: METAL2, bootC: '#5b6267', torso: DOOM_G, tw: 124,
  head: (g, p) => doomMask(g, p.glow || 0),
  torsoDeco: (g, tw, th) => {
    rr(g, -tw / 2 + 4, -24, tw - 8, 20, 4); fs(g, '#6b4a2b', 5);
    ell(g, 0, -14, 14, 12, '#d7a93a', 4);
    g.beginPath(); g.moveTo(-tw / 2 + 6, -th + 4); g.quadraticCurveTo(0, -th + 70, tw / 2 - 6, -th + 4); g.lineWidth = 5; g.strokeStyle = OL; g.stroke();
    g.beginPath(); g.moveTo(-tw / 2 + 10, -4); g.lineTo(tw / 2 - 10, -4); g.lineTo(tw / 2 + 4, 70); g.lineTo(-tw / 2 - 4, 70); g.closePath(); fs(g, DOOM_G2, 5);
  },
  capeBack: (g, tw, th, leg, p) => {
    const f = Math.sin((p.t || 0) * 3) * 14 + (p.cape || 0);
    g.beginPath(); g.moveTo(-tw / 2 - 6, -th - 6); g.lineTo(tw / 2 + 6, -th - 6);
    g.quadraticCurveTo(tw / 2 + 60 + f, 0, tw / 2 + 70 + f * 1.5, leg + 10);
    g.lineTo(-tw / 2 - 70 + f * .5, leg + 10); g.quadraticCurveTo(-tw / 2 - 60, 0, -tw / 2 - 6, -th - 6); g.closePath(); fs(g, '#1f4a27');
  },
};
// --- otros ---
const MOLE = {
  skin: '#e2b48c', armC: '#7a4f2c', legC: '#4b4f57', bootC: '#2a2a2a', torso: '#7a4f2c',
  head: (g, p) => { ell(g, 0, 0, 44, 54, '#e2b48c'); ell(g, -44, 4, 9, 13, '#e2b48c', 4); ell(g, 44, 4, 9, 13, '#e2b48c', 4);
    g.lineWidth = 4; g.strokeStyle = OL; g.beginPath(); g.arc(-16, -2, 13, 0, 7); g.arc(16, -2, 13, 0, 7); g.moveTo(-3, -2); g.lineTo(3, -2); g.stroke();
    eyes(g, -2, 16, p.blink, OL, 4); g.beginPath(); g.moveTo(-10, 28); g.lineTo(10, 28); g.stroke(); },
  torsoDeco: (g, tw, th) => { g.lineWidth = 5; g.strokeStyle = OL; g.beginPath(); g.moveTo(0, -th); g.lineTo(0, 8); g.stroke(); poly(g, [[-22, -th], [0, -th + 40], [22, -th]], '#e8e1d0', 4); },
};
const STRANGE = {
  skin: '#e7b892', armC: '#273f85', legC: '#1d2c5e', bootC: '#2a2a2a', torso: '#273f85', handC: '#e7b892',
  capeBack: (g, tw, th, leg, p) => { const f = Math.sin((p.t || 0) * 2.5) * 10; g.beginPath(); g.moveTo(-tw / 2 - 30, -th - 40); g.lineTo(tw / 2 + 30, -th - 40); g.lineTo(tw / 2 + 70 + f, leg - 10); g.lineTo(-tw / 2 - 70 + f, leg - 10); g.closePath(); fs(g, '#b4201f'); },
  head: (g, p) => { ell(g, 0, 0, 44, 54, '#e7b892'); g.beginPath(); g.moveTo(-46, 4); g.quadraticCurveTo(-50, -60, 0, -60); g.quadraticCurveTo(50, -60, 46, 4); g.lineTo(38, -22); g.lineTo(-38, -22); g.closePath(); fs(g, '#2a201b', 5);
    g.fillStyle = '#e8e8e8'; g.fillRect(-46, -22, 10, 22); g.fillRect(36, -22, 10, 22);
    eyes(g, -2, 16, p.blink); g.beginPath(); g.moveTo(-14, 22); g.quadraticCurveTo(0, 18, 14, 22); g.lineTo(6, 52); g.lineTo(-6, 52); g.closePath(); fs(g, '#2a201b', 4); },
  torsoDeco: (g, tw, th) => { rr(g, -tw / 2, -28, tw, 18, 4); fs(g, '#d7a93a', 4); ell(g, 0, -th + 34, 16, 16, '#d7a93a', 4); ell(g, 0, -th + 34, 6, 6, '#3fa65a', 0);
    // estrella de sheriff
    g.save(); g.translate(-32, -th + 90); star(g, 0, 0, 22, 10, '#f2c53d'); g.restore(); },
};
function star(g, x, y, R, r, fill, n = 5) { g.beginPath(); for (let i = 0; i < n * 2; i++) { const a = -Math.PI / 2 + i * Math.PI / n, q = i % 2 ? r : R; g.lineTo(x + Math.cos(a) * q, y + Math.sin(a) * q); } g.closePath(); fs(g, fill, 4); }
function mkThor(cape, hair, skin = '#ecc29d') {
  return {
    skin, armC: skin, legC: '#2c2f38', bootC: '#5a3b24', torso: '#2c2f38', handC: skin,
    capeBack: (g, tw, th, leg, p) => { const f = Math.sin((p.t || 0) * 3 + hair.length) * 12; g.beginPath(); g.moveTo(-tw / 2 - 4, -th); g.lineTo(tw / 2 + 4, -th); g.lineTo(tw / 2 + 46 + f, leg); g.lineTo(-tw / 2 - 46 + f, leg); g.closePath(); fs(g, cape); },
    head: (g, p) => { g.beginPath(); g.moveTo(-46, -10); g.lineTo(-52, 70); g.lineTo(52, 70); g.lineTo(46, -10); g.closePath(); fs(g, hair, 5);
      ell(g, 0, 0, 42, 52, skin); g.beginPath(); g.moveTo(-40, 14); g.quadraticCurveTo(0, 90, 40, 14); g.closePath(); fs(g, hair, 5);
      eyes(g, -4, 15, p.blink); g.beginPath(); g.arc(0, -30, 46, Math.PI, 0); g.closePath(); fs(g, '#b9c0c6', 5);
      poly(g, [[-44, -40], [-90, -80], [-70, -36]], '#e9edf0', 4); poly(g, [[44, -40], [90, -80], [70, -36]], '#e9edf0', 4); },
    torsoDeco: (g, tw, th) => { for (const yy of [-th + 40, -th + 100]) { ell(g, -26, yy, 15, 15, '#c8ced3', 4); ell(g, 26, yy, 15, 15, '#c8ced3', 4); } },
  };
}
const hammer = (g, x, y) => { g.save(); g.translate(x, y); rr(g, -7, -10, 14, 90, 6); fs(g, '#6b4a2b', 4); rr(g, -38, 70, 76, 48, 6); fs(g, '#8b9298', 5); g.restore(); };
const ZOMBIE = k => ({
  skin: ['#8fa37a', '#9aa785', '#7f9670'][k % 3], armC: ['#8fa37a', '#9aa785', '#7f9670'][k % 3], legC: '#3d3a33', bootC: '#2b2925', torso: ['#5b4d6b', '#6b5a3d', '#3e5568'][k % 3],
  head: (g, p) => { const c = ['#8fa37a', '#9aa785', '#7f9670'][k % 3]; ell(g, 0, 0, 42, 52, c); ell(g, -15, -4, 11, 11, '#f2f0e6', 3); ell(g, 15, -6, 9, 9, '#f2f0e6', 3);
    g.fillStyle = '#b3241c'; g.beginPath(); g.arc(-15, -4, 3, 0, 7); g.arc(15, -6, 3, 0, 7); g.fill(); rr(g, -16, 22, 32, 16, 6); fs(g, '#3a1512', 4);
    g.fillStyle = '#f2f0e6'; g.fillRect(-10, 22, 6, 6); g.fillRect(4, 22, 6, 6); },
  torsoDeco: (g, tw, th) => { poly(g, [[-tw / 2 + 10, 10], [-20, -20], [0, 10], [20, -14], [tw / 2 - 10, 10]], '#2b2925', 0); },
});
const ULTRON = {
  skin: '#c4cad0', armC: '#aab1b8', legC: '#8f979f', bootC: '#6d747b', torso: '#aab1b8', handC: '#c4cad0',
  head: (g, p) => { g.beginPath(); g.moveTo(-34, 56); g.lineTo(-48, 10); g.bezierCurveTo(-52, -70, 52, -70, 48, 10); g.lineTo(34, 56); g.closePath(); fs(g, '#c4cad0'); g.lineWidth = 4; g.strokeStyle = 'rgba(0,0,0,.3)'; g.beginPath(); g.moveTo(-40, -20); g.lineTo(-20, -48); g.moveTo(40, -20); g.lineTo(20, -48); g.stroke();
    g.save(); g.shadowColor = '#ff2a2a'; g.shadowBlur = 20; g.fillStyle = '#ff3b30'; ell(g, -18, 0, 13, 8, '#ff3b30', 0); ell(g, 18, 0, 13, 8, '#ff3b30', 0); rr(g, -18, 28, 36, 10, 5); g.fill(); g.restore(); },
  torsoDeco: (g, tw, th) => { g.save(); g.shadowColor = '#ff2a2a'; g.shadowBlur = 18; ell(g, 0, -th + 60, 16, 16, '#ff5a4a', 4); g.restore(); g.lineWidth = 4; g.strokeStyle = OL; g.beginPath(); g.moveTo(-30, -60); g.lineTo(30, -60); g.moveTo(-30, -36); g.lineTo(30, -36); g.stroke(); },
};
const SUE = {
  skin: '#f0c7a6', armC: '#2d5fb3', legC: '#2d5fb3', bootC: '#e8e8e8', torso: '#2d5fb3', tw: 100, handC: '#e8e8e8',
  head: (g, p) => { g.beginPath(); g.moveTo(-52, 70); g.quadraticCurveTo(-64, -70, 0, -62); g.quadraticCurveTo(64, -70, 52, 70); g.closePath(); fs(g, '#f2d06b', 5);
    ell(g, 0, 0, 40, 50, '#f0c7a6'); g.beginPath(); g.moveTo(-42, -10); g.quadraticCurveTo(-10, -62, 42, -18); g.quadraticCurveTo(10, -40, -42, -10); fs(g, '#f2d06b', 4);
    eyes(g, 0, 15, p.blink); g.fillStyle = '#b5524b'; rr(g, -9, 26, 18, 6, 3); g.fill(); },
  torsoDeco: (g, tw, th) => { rr(g, -tw / 2, -28, tw, 14, 4); fs(g, '#16243f', 4); },
};
const kid = (hair, shirt) => ({
  skin: '#f0c7a6', armC: shirt, legC: '#2f3a55', bootC: '#2a2a2a', torso: shirt, tw: 96, th: 150, leg: 150, arm: 130,
  head: (g, p) => { ell(g, 0, 0, 44, 50, '#f0c7a6'); g.beginPath(); g.moveTo(-46, 10); g.quadraticCurveTo(-46, -64, 0, -60); g.quadraticCurveTo(46, -64, 46, 10); g.lineTo(30, -26); g.lineTo(-30, -26); g.closePath(); fs(g, hair, 5);
    eyes(g, 2, 15, p.blink); g.lineWidth = 4; g.strokeStyle = OL; g.beginPath(); g.arc(0, 22, 10, 0.2, Math.PI - 0.2); g.stroke(); },
});
const FRANKLIN = kid('#d9692c', '#3f8f5a'), VALERIA = kid('#2a201b', '#7a4fa8');
const REED = {
  skin: '#ecc29d', armC: '#2d5fb3', legC: '#2d5fb3', bootC: '#16243f', torso: '#2d5fb3', handC: '#16243f',
  head: (g, p) => { ell(g, 0, 0, 44, 54, '#ecc29d'); g.beginPath(); g.moveTo(-46, 6); g.quadraticCurveTo(-48, -66, 4, -62); g.quadraticCurveTo(52, -60, 46, 6); g.lineTo(36, -26); g.quadraticCurveTo(0, -46, -36, -26); g.closePath(); fs(g, '#5a3b26', 5);
    g.fillStyle = '#dcdcdc'; g.fillRect(-46, -16, 9, 22); g.fillRect(37, -16, 9, 22); eyes(g, -2, 16, p.blink); g.lineWidth = 4; g.strokeStyle = OL; g.beginPath(); g.moveTo(-10, 26); g.lineTo(10, 26); g.stroke(); },
  torsoDeco: (g, tw, th) => { rr(g, -tw / 2, -28, tw, 14, 4); fs(g, '#16243f', 4); },
};
function silhouette(g, x, y, s, type, t) {
  g.save(); g.translate(x, y); g.scale(s, s); g.fillStyle = '#0b0606';
  const a = Math.sin(t * 8 + x) * .5;
  const L = (px, py, ang, len, w) => { g.save(); g.translate(px, py); g.rotate(ang); rr(g, -w / 2, -w / 2, w, len + w / 2, w / 2); g.fill(); g.restore(); };
  if (type === 2) { g.beginPath(); g.moveTo(-60, -200); g.lineTo(60, -200); g.lineTo(110, 200); g.lineTo(-110, 200); g.fill(); }
  L(-20, -6, a, 210, 38); L(20, -6, -a, 210, 38); g.fillRect(-58, -195, 116, 200);
  L(-48, -180, -0.9 - a, 170, 30); L(48, -180, 1.2 + a * .5, 170, 30);
  g.beginPath(); g.ellipse(0, -248, 44, 54, 0, 0, 7); g.fill();
  if (type === 1) { g.beginPath(); g.arc(-150, -260, 70, 0, 7); g.fill(); }
  if (type === 3) { g.fillRect(150, -330, 20, 110); g.fillRect(120, -360, 80, 50); }
  g.restore();
}

// ---------- fondos ----------
const STARS = Array.from({ length: 260 }, () => [rnd() * W, rnd() * H, rnd() * 2.4 + .6, rnd() * 6]);
function space(g, t, tint = ['#05040c', '#150b2a', '#26103a']) {
  const gr = g.createLinearGradient(0, 0, 0, H); gr.addColorStop(0, tint[0]); gr.addColorStop(.6, tint[1]); gr.addColorStop(1, tint[2]); g.fillStyle = gr; g.fillRect(0, 0, W, H);
  for (const [cx, cy, r, c] of [[200, 500, 520, 'rgba(120,60,200,.18)'], [880, 1300, 600, 'rgba(60,160,110,.13)'], [600, 900, 400, 'rgba(200,80,120,.08)']]) { const rg = g.createRadialGradient(cx, cy, 0, cx, cy, r); rg.addColorStop(0, c); rg.addColorStop(1, 'rgba(0,0,0,0)'); g.fillStyle = rg; g.fillRect(0, 0, W, H); }
  for (const [x, y, r, k] of STARS) { g.globalAlpha = .45 + .55 * Math.abs(Math.sin(t * 1.3 + k)); g.fillStyle = '#fff'; g.fillRect(x, y, r, r); } g.globalAlpha = 1;
}
const CONT = Array.from({ length: 4 }, () => Array.from({ length: 5 }, () => { const cx = rnd() * 2.4, cy = rnd() * 1.4 - .7; return Array.from({ length: 4 }, () => [cx + (rnd() - .5) * .45, cy + (rnd() - .5) * .35, .14 + rnd() * .16, .1 + rnd() * .12]); }));
function earth(g, x, y, r, k = 0, crack = 0, rot = 0) {
  g.save(); g.translate(x, y);
  if (crack > 0) { g.save(); g.shadowColor = '#ff4a1c'; g.shadowBlur = 60 * crack; ell(g, 0, 0, r, r, '#000', 0); g.restore(); }
  g.beginPath(); g.arc(0, 0, r, 0, 7); g.save(); g.clip();
  const og = g.createRadialGradient(-r * .4, -r * .4, r * .1, 0, 0, r); og.addColorStop(0, '#4fa3d9'); og.addColorStop(1, '#1d4f86'); g.fillStyle = og; g.fillRect(-r, -r, 2 * r, 2 * r);
  g.fillStyle = '#5c9a4a'; g.strokeStyle = 'rgba(0,0,0,.25)'; g.lineWidth = 4;
  for (const c of CONT[k % 4]) for (const [bx, by, rx, ry] of c) { const X = (((bx + rot) % 2.4 + 2.4) % 2.4 - 1.2) * r; g.beginPath(); g.ellipse(X, by * r, rx * r, ry * r, 0, 0, 7); g.fill(); }
  const sh = g.createRadialGradient(r * .5, r * .5, r * .2, 0, 0, r * 1.2); sh.addColorStop(0, 'rgba(0,0,0,0)'); sh.addColorStop(1, 'rgba(0,0,0,.55)'); g.fillStyle = sh; g.fillRect(-r, -r, 2 * r, 2 * r);
  if (crack > 0) { g.save(); g.shadowColor = '#ff7a2a'; g.shadowBlur = 20; g.strokeStyle = `rgba(255,150,60,${crack})`; g.lineWidth = 7; let s2 = k * 99 + 5;
    for (let b = 0; b < 6; b++) { g.beginPath(); let px = 0, py = 0; g.moveTo(px, py); const a0 = b / 6 * 7 + srnd(s2++); for (let j = 0; j < 6; j++) { const a = a0 + (srnd(s2++) - .5) * .9; px += Math.cos(a) * r * .2 * crack; py += Math.sin(a) * r * .2 * crack; g.lineTo(px, py); } g.stroke(); } g.restore(); }
  g.restore(); g.beginPath(); g.arc(0, 0, r, 0, 7); g.lineWidth = 7; g.strokeStyle = OL; g.stroke(); g.restore();
}
function castle(g, t, dark = 0) {
  g.fillStyle = '#2f3431'; g.fillRect(0, 0, W, H);
  g.strokeStyle = 'rgba(0,0,0,.35)'; g.lineWidth = 4; for (let y = 0; y < 1500; y += 70) { g.beginPath(); g.moveTo(0, y); g.lineTo(W, y); g.stroke(); for (let x = (y / 70 % 2) * 70; x < W; x += 140) { g.beginPath(); g.moveTo(x, y); g.lineTo(x, y + 70); g.stroke(); } }
  for (const wx of [170, 910]) { g.beginPath(); g.moveTo(wx - 90, 900); g.lineTo(wx - 90, 420); g.arc(wx, 420, 90, Math.PI, 0); g.lineTo(wx + 90, 900); g.closePath(); const wg = g.createLinearGradient(0, 330, 0, 900); wg.addColorStop(0, '#3e7a6a'); wg.addColorStop(1, '#173b33'); fs(g, wg, 8);
    g.lineWidth = 6; g.beginPath(); g.moveTo(wx, 330); g.lineTo(wx, 900); g.moveTo(wx - 90, 620); g.lineTo(wx + 90, 620); g.stroke(); }
  for (const bx of [400, 680]) { poly(g, [[bx - 70, 260], [bx + 70, 260], [bx + 70, 820], [bx, 760], [bx - 70, 820]], '#2f6b3a', 6); ell(g, bx, 440, 40, 40, '#d7a93a', 5); poly(g, [[bx - 18, 420], [bx + 18, 420], [bx, 470]], DOOM_G2, 3); }
  for (const tx of [300, 780]) { rr(g, tx - 14, 900, 28, 80, 6); fs(g, '#5b4a3a', 5); const f = 1 + Math.sin(t * 13 + tx) * .15; g.save(); g.shadowColor = '#ffb347'; g.shadowBlur = 50; ell(g, tx, 880, 18 * f, 34 * f, '#ffb347', 4); ell(g, tx, 888, 9, 18, '#fff1c2', 0); g.restore();
    const rg = g.createRadialGradient(tx, 880, 0, tx, 880, 260); rg.addColorStop(0, 'rgba(255,170,80,.22)'); rg.addColorStop(1, 'rgba(0,0,0,0)'); g.fillStyle = rg; g.fillRect(tx - 260, 620, 520, 520); }
  const fg = g.createLinearGradient(0, 1480, 0, H); fg.addColorStop(0, '#1d211f'); fg.addColorStop(1, '#0c0e0d'); g.fillStyle = fg; g.fillRect(0, 1480, W, H - 1480);
  g.lineWidth = 6; g.strokeStyle = OL; g.beginPath(); g.moveTo(0, 1480); g.lineTo(W, 1480); g.stroke();
  rr(g, 360, 1480, 360, 440, 0); g.fillStyle = '#6e1717'; g.fill();
  if (dark) { g.fillStyle = `rgba(0,0,0,${dark})`; g.fillRect(0, 0, W, H); }
}
function throne(g, x, y) {
  poly(g, [[x - 170, y], [x - 150, y - 620], [x - 60, y - 720], [x, y - 680], [x + 60, y - 720], [x + 150, y - 620], [x + 170, y]], '#4a3a20', 8);
  poly(g, [[x - 120, y], [x - 110, y - 560], [x, y - 620], [x + 110, y - 560], [x + 120, y]], '#2f6b3a', 6);
  ell(g, x, y - 600, 34, 34, '#d7a93a', 5); rr(g, x - 190, y - 260, 380, 80, 10); fs(g, '#5a4526', 6);
}
const RUINS = Array.from({ length: 14 }, (_, i) => [i * 85 - 20, 300 + rnd() * 480, 70 + rnd() * 40]);
function warSky(g, t) {
  const gr = g.createLinearGradient(0, 0, 0, H); gr.addColorStop(0, '#1a0406'); gr.addColorStop(.55, '#7d1a10'); gr.addColorStop(.75, '#c4471d'); gr.addColorStop(1, '#2a0a06'); g.fillStyle = gr; g.fillRect(0, 0, W, H);
  g.fillStyle = '#240807'; for (const [x, h, w] of RUINS) { g.beginPath(); g.moveTo(x, 1400); g.lineTo(x, 1400 - h); g.lineTo(x + w * .4, 1400 - h - 30); g.lineTo(x + w * .6, 1400 - h + 20); g.lineTo(x + w, 1400 - h + 10); g.lineTo(x + w, 1400); g.fill(); }
  g.fillStyle = '#120403'; g.fillRect(0, 1400, W, H);
  for (let i = 0; i < 40; i++) { const x = (srnd(i) * W + t * 40 * (srnd(i + 9) + .3)) % W, y = H - ((t * 120 * (srnd(i + 3) + .4) + srnd(i + 5) * H) % H); g.fillStyle = `rgba(255,${120 + srnd(i) * 100 | 0},40,${.4 + srnd(i + 1) * .5})`; g.fillRect(x, y, 5, 5); }
}
function bwSky(g, t) {
  const gr = g.createLinearGradient(0, 0, 0, H); gr.addColorStop(0, '#22123d'); gr.addColorStop(.5, '#6b2f5e'); gr.addColorStop(.72, '#d9734a'); gr.addColorStop(1, '#3b2b2a'); g.fillStyle = gr; g.fillRect(0, 0, W, H);
  for (const [x, y, s] of [[170, 380, 1], [860, 260, .7], [620, 620, .5]]) { g.save(); g.translate(x, y + Math.sin(t + x) * 10); g.scale(s, s); poly(g, [[-120, 0], [120, 0], [70, 60], [20, 160], [-40, 90]], '#4b3a52', 6); rr(g, -120, -24, 240, 30, 12); fs(g, '#5d7a46', 6); g.restore(); }
  g.fillStyle = '#3b2f2a'; g.fillRect(0, 1460, W, H); g.lineWidth = 6; g.strokeStyle = OL; g.beginPath(); g.moveTo(0, 1460); g.lineTo(W, 1460); g.stroke();
}
// planeta mosaico precalculado
const PR = 400, planetC = mk(PR * 2, PR * 2);
const PATCH = ['#5d8f4a', '#c9a35b', '#7f8c99', '#a8452f', '#3f6f8f', '#8a6aa8', '#d9c48a', '#4c6b3a', '#b06a3a', '#6aa3a0', '#3d4250', '#9b3f5e'];
const SEEDS = Array.from({ length: 34 }, (_, i) => [rnd() * 2 * PR, rnd() * 2 * PR, PATCH[i % PATCH.length]]);
{
  const g = planetC.getContext('2d'), im = g.createImageData(PR * 2, PR * 2); const own = new Int16Array(PR * PR * 4);
  for (let y = 0; y < 2 * PR; y++) for (let x = 0; x < 2 * PR; x++) { let b = 0, bd = 1e9; for (let i = 0; i < SEEDS.length; i++) { const d = (x - SEEDS[i][0]) ** 2 + (y - SEEDS[i][1]) ** 2; if (d < bd) { bd = d; b = i; } } own[y * 2 * PR + x] = b; }
  for (let y = 0; y < 2 * PR; y++) for (let x = 0; x < 2 * PR; x++) { const i = y * 2 * PR + x, o = own[i]; const edge = (x > 0 && own[i - 1] !== o) || (y > 0 && own[i - 2 * PR] !== o) || (x > 1 && own[i - 2] !== o) || (y > 1 && own[i - 4 * PR] !== o);
    const c = SEEDS[o][2]; const n = (srnd(x * 0.13 + y * 7.1) - .5) * 18; const dx = x - PR, dy = y - PR; const sh = clamp(1 - ((dx + 150) ** 2 + (dy + 150) ** 2) / (PR * 2.1) ** 2 * 1.4, .35, 1);
    const p = i * 4; if (edge) { im.data[p] = 30; im.data[p + 1] = 22; im.data[p + 2] = 18; } else { im.data[p] = (parseInt(c.slice(1, 3), 16) + n) * sh; im.data[p + 1] = (parseInt(c.slice(3, 5), 16) + n) * sh; im.data[p + 2] = (parseInt(c.slice(5, 7), 16) + n) * sh; } im.data[p + 3] = 255; }
  g.putImageData(im, 0, 0);
}
function patchPlanet(g, x, y, s, assemble = 1, t = 0) {
  g.save(); g.translate(x, y); g.scale(s, s);
  if (assemble >= 1) { g.save(); g.shadowColor = '#ffb35a'; g.shadowBlur = 80; g.beginPath(); g.arc(0, 0, PR, 0, 7); g.fillStyle = '#000'; g.fill(); g.restore(); }
  const N = 12;
  for (let i = 0; i < N; i++) {
    const a0 = i / N * Math.PI * 2, a1 = (i + 1) / N * Math.PI * 2, am = (a0 + a1) / 2; const k = clamp(assemble * 1.4 - (i % 4) * .12);
    const off = (1 - eout(k)) * 900, rot = (1 - eout(k)) * (srnd(i) - .5) * 2.5;
    g.save(); g.translate(Math.cos(am) * off, Math.sin(am) * off); g.rotate(rot);
    g.beginPath(); g.moveTo(0, 0); g.arc(0, 0, PR, a0, a1 + .01); g.closePath(); g.save(); g.clip(); g.drawImage(planetC, -PR, -PR); g.restore();
    if (k < 1) { g.lineWidth = 6; g.strokeStyle = OL; g.stroke(); }
    g.restore();
  }
  g.beginPath(); g.arc(0, 0, PR, 0, 7); g.lineWidth = 9 * clamp(assemble * 3 - 2); g.strokeStyle = OL; if (assemble > .7) g.stroke();
  g.restore();
}

// ---------- textos ----------
const NAME = { 'doom': '#ff4a3d', 'víctor': '#ff4a3d', 'von': '#ff4a3d', 'reed': '#47c6ff', 'richards': '#47c6ff', 'sue': '#47c6ff', 'storm': '#47c6ff', 'franklin': '#47c6ff', 'valeria': '#47c6ff', 'strange': '#47c6ff', 'battleworld': '#ffb52e', 'beyonders': '#c38cff', 'thors': '#47c6ff', 'ultrons': '#ff4a3d', 'molécula': '#7fe08a', 'hombre': null };
const clean = w => w.replace(/[.,:…¿?]/g, '');
const CHUNKS = (() => { const out = []; let cur = [];
  WORDS.forEach((w, i) => { cur.push(w); const nx = WORDS[i + 1]; const br = /[.,:…?]$/.test(w.w) || cur.length >= 3 || !nx || nx.s - w.e > .2; if (br) { out.push(cur); cur = []; } });
  return out.map((c, i) => ({ ws: c, s: c[0].s - .04, e: (out[i + 1] && out[i + 1][0].s - c[c.length - 1].e < .7) ? out[i + 1][0].s - .04 : c[c.length - 1].e + .3 })); })();
function captions(g, t) {
  const ch = CHUNKS.find(c => t >= c.s && t < c.e); if (!ch) return;
  g.save(); g.font = '76px LG'; g.textBaseline = 'middle'; g.lineJoin = 'round';
  const parts = ch.ws.map(w => clean(w.w).toUpperCase()); const sp = 22; const ws = parts.map(p => g.measureText(p).width);
  let tot = ws.reduce((a, b) => a + b, 0) + sp * (parts.length - 1); let sc = Math.min(1, 960 / tot);
  const k = prog(t, ch.s, ch.s + .14); sc *= lerp(.82, 1, eback(k));
  g.translate(W / 2, 1390); g.scale(sc, sc); let x = -tot / 2;
  ch.ws.forEach((w, i) => { const on = t >= w.s - .03; const key = clean(w.w).toLowerCase(); const nc = NAME[key];
    g.lineWidth = 16; g.strokeStyle = '#0d0b08'; g.strokeText(parts[i], x, 0);
    g.fillStyle = nc ? nc : (on && t < w.e + .05 ? '#ffd21f' : '#ffffff'); if (!on && !nc) g.fillStyle = '#ffffff';
    if (on && t < w.e + .05 && !nc) g.fillStyle = '#ffd21f';
    g.fillText(parts[i], x, 0); x += ws[i] + sp; });
  g.restore();
}
// titulares superiores: [t0, t1, texto, fondo, rot, línea]
const HEAD = [
  [0.05, 2.3, 'EL MULTIVERSO MUERE', '#111', -2, 0],
  [4.3, 7.25, 'EL VILLANO MÁS PELIGROSO', '#b3161b', 2, 0],
  [11.96, 16.6, 'LAS INCURSIONES', '#111', -2, 0],
  [16.69, 18.6, 'SI DOS TIERRAS SE TOCAN…', '#111', 2, 0],
  [20.52, 24.4, 'YA ES TARDE', '#b3161b', -2, 0],
  [24.44, 26.6, 'EL ÚLTIMO CHOQUE', '#b3161b', 2, 0],
  [26.64, 34.1, 'DOCTOR DOOM', '#111', -2, 0],
  [34.15, 36.8, '¿QUIÉN ESTÁ DETRÁS?', '#111', 2, 0],
  [36.86, 41.75, 'LOS BEYONDERS', '#5a2a8a', -2, 0],
  [41.8, 45.45, 'EL HOMBRE MOLÉCULA', '#111', 2, 0],
  [45.48, 47.85, 'UN DIOS', '#b3161b', -2, 0],
  [51.7, 54.9, 'BATTLEWORLD', '#b36a00', -2, 0],
  [54.95, 58.2, 'UN BARÓN POR REINO', '#111', 2, 0],
  [58.24, 60.9, 'ZOMBIS', '#3d5a2a', -2, 0],
  [60.94, 63.4, 'ULTRONS', '#b3161b', 2, 0],
  [64.35, 67.1, 'EL ESCUDO', '#111', -2, 0],
  [67.13, 69.1, 'SU POLICÍA', '#1d3f85', -2, 0],
  [69.16, 71.1, 'SU SHERIFF', '#b3161b', 2, 0],
  [71.13, 74.5, 'NADIE RECUERDA', '#111', -2, 0],
  [74.59, 81.1, 'ALGO MÁS', '#111', 2, 0],
  [82.97, 84.7, 'AHORA ES SUYA', '#b3161b', -2, 0],
  [84.78, 88.1, '8 AÑOS DESPUÉS', '#111', 2, 0],
  [88.18, 92.0, 'ALGO DESPIERTA', '#b3161b', -2, 0],
  [95.9, 97.4, 'SU PEOR ENEMIGO', '#b3161b', 2, 0],
  [97.48, 100.2, 'UNA VERDAD OCULTA', '#111', -2, 0],
  [100.21, 102.6, '¿PODRÁ GANARLE?', '#b36a00', 2, 0],
];
function headlines(g, t) {
  for (const [t0, t1, txt, bg, rot, ln] of HEAD) { if (t < t0 || t > t1) continue; const k = eback(prog(t, t0, t0 + .22)); const out = prog(t, t1 - .12, t1);
    g.save(); g.font = '104px BB'; const w = g.measureText(txt).width; g.translate(W / 2, 250 + ln * 120); g.rotate(rot * Math.PI / 180); g.scale(k * (1 - out * .3), k * (1 - out * .3)); g.globalAlpha = 1 - out;
    g.fillStyle = 'rgba(0,0,0,.35)'; g.fillRect(-w / 2 - 26 + 10, -66 + 10, w + 52, 128); g.fillStyle = bg; g.fillRect(-w / 2 - 26, -66, w + 52, 128);
    g.lineWidth = 4; g.strokeStyle = 'rgba(255,255,255,.85)'; g.strokeRect(-w / 2 - 18, -58, w + 36, 112);
    g.fillStyle = '#fff'; g.textAlign = 'center'; g.textBaseline = 'middle'; g.fillText(txt, 0, 6); g.restore(); }
}
// notas a mano: [t0,t1,texto,x,y,ax1,ay1,ax2,ay2,rot]
const NOTES = [
  [38.2, 41.75, 'LOS CULPABLES', 300, 560, 360, 610, 470, 760, -6],
  [44.0, 45.45, 'EL PODER', 820, 880, 790, 930, 690, 1150, 6],
  [64.9, 67.1, '¡NADIE LO CRUZA!', 560, 1170, 560, 1120, 560, 980, -4],
  [70.0, 71.1, 'SHERIFF', 820, 760, 780, 810, 540, 1100, 5],
  [79.6, 81.1, 'SUS "HIJOS"', 330, 820, 330, 870, 300, 1150, -6],
  [96.0, 97.4, 'EL CEREBRO', 300, 640, 330, 690, 360, 960, -6],
];
function notes(g, t) {
  for (const [t0, t1, txt, x, y, ax, ay, bx, by, rot] of NOTES) { if (t < t0 || t > t1) continue; const k = prog(t, t0, t0 + .45), out = 1 - prog(t, t1 - .15, t1);
    g.save(); g.globalAlpha = out; g.font = '64px PM'; g.textAlign = 'center'; g.textBaseline = 'middle'; const w = g.measureText(txt).width;
    g.save(); g.beginPath(); g.rect(x - w / 2 - 20, y - 80, (w + 40) * k, 160); g.clip(); g.translate(x, y); g.rotate(rot * Math.PI / 180); g.lineWidth = 10; g.strokeStyle = 'rgba(0,0,0,.5)'; g.strokeText(txt, 0, 0); g.fillStyle = '#ff2b2b'; g.fillText(txt, 0, 0); g.restore();
    const a = prog(t, t0 + .3, t0 + .6); if (a > 0) { const mx = (ax + bx) / 2 + 40, my = (ay + by) / 2; g.strokeStyle = '#ff2b2b'; g.lineWidth = 9; g.lineCap = 'round'; g.beginPath(); g.moveTo(ax, ay);
      const N = 20; for (let i = 1; i <= N * a; i++) { const s = i / N; g.lineTo((1 - s) ** 2 * ax + 2 * (1 - s) * s * mx + s * s * bx, (1 - s) ** 2 * ay + 2 * (1 - s) * s * my + s * s * by); } g.stroke();
      if (a >= 1) { const an = Math.atan2(by - my, bx - mx); g.beginPath(); g.moveTo(bx, by); g.lineTo(bx - Math.cos(an - .5) * 34, by - Math.sin(an - .5) * 34); g.moveTo(bx, by); g.lineTo(bx - Math.cos(an + .5) * 34, by - Math.sin(an + .5) * 34); g.stroke(); } }
    g.restore(); }
}
function bigText(g, txt, x, y, size, fill, k = 1, font = 'LG', rot = 0) { g.save(); g.translate(x, y); g.rotate(rot); g.scale(k, k); g.font = `${size}px ${font}`; g.textAlign = 'center'; g.textBaseline = 'middle'; g.lineJoin = 'round'; g.lineWidth = size * .2; g.strokeStyle = '#0d0b08'; g.strokeText(txt, 0, 0); g.fillStyle = fill; g.fillText(txt, 0, 0); g.restore(); }
function stamp(g, txt, x, y, k, color = '#c4161c', rot = -.12, size = 90) { if (k <= 0) return; const s = lerp(2.4, 1, eout(k)); g.save(); g.translate(x, y); g.rotate(rot); g.scale(s, s); g.globalAlpha = clamp(k * 2); g.font = `${size}px BB`; const w = g.measureText(txt).width; g.lineWidth = 9; g.strokeStyle = color; g.strokeRect(-w / 2 - 24, -size * .62, w + 48, size * 1.2); g.fillStyle = color; g.textAlign = 'center'; g.textBaseline = 'middle'; g.fillText(txt, 0, 6); g.restore(); }

// ---------- escenas ----------
const S = [];
const scene = (t0, draw, tr = 'cut', trd = 0) => S.push({ t0, draw, tr, trd });

// 1. Gancho: Tierras agrietándose + Doom de espaldas
scene(0, (g, t, lt) => {
  space(g, t); g.save(); cam(g, lt, 7.2, .08);
  earth(g, 230, 520, 150, 0, clamp(lt / 3), lt * .05); earth(g, 860, 760, 110, 1, clamp((lt - .5) / 3), lt * .04); earth(g, 380, 1050, 90, 2, clamp((lt - 1) / 3), lt * .06);
  const turn = prog(lt, 4.3, 4.6); const glow = prog(lt, 4.6, 5.2);
  g.save(); g.shadowColor = 'rgba(0,0,0,.6)';
  if (turn < .5) { // de espaldas: capa
    g.save(); g.translate(560, 1620); g.scale(1.25, 1.25); g.beginPath(); g.moveTo(-130, -470); g.quadraticCurveTo(-200, -100, -190, 0); g.lineTo(190, 0); g.quadraticCurveTo(200, -100, 130, -470); g.closePath(); fs(g, '#1f4a27', 8);
    rr(g, -150, -480, 300, 60, 30); fs(g, DOOM_G2, 7); g.beginPath(); g.moveTo(-80, -440); g.quadraticCurveTo(-95, -600, 0, -625); g.quadraticCurveTo(95, -600, 80, -440); g.closePath(); fs(g, DOOM_G, 8); g.lineWidth = 5; g.strokeStyle = 'rgba(0,0,0,.35)'; g.beginPath(); g.moveTo(0, -615); g.lineTo(0, -450); g.moveTo(-60, -380); g.quadraticCurveTo(-80, -200, -100, 0); g.moveTo(60, -380); g.quadraticCurveTo(80, -200, 100, 0); g.stroke(); g.restore();
  } else figure(g, 560, 1380, 1.3, DOOM, { ...idle(t), glow, t, aL: .25, aR: -.25 });
  g.restore(); g.restore();
  if (turn > 0 && turn < 1) { g.fillStyle = `rgba(255,255,255,${(1 - Math.abs(turn * 2 - 1)) * .7})`; g.fillRect(0, 0, W, H); }
});
// 2. Título
scene(7.28, (g, t, lt) => {
  g.fillStyle = '#0b0c0a'; g.fillRect(0, 0, W, H);
  g.save(); for (let i = 0; i < 3; i++) { const x = -300 + ((lt * 220 + i * 520) % 1700); g.save(); g.translate(x, 0); g.rotate(.32); g.fillStyle = `rgba(214,190,130,${.16 + i * .04})`; g.fillRect(0, -400, 150 + i * 40, 3000); g.restore(); } g.restore();
  // manos/rayos verdes
  g.save(); g.translate(W / 2, 1180); const s = lerp(.7, 1.05, eout(prog(lt, 0, 1.2))); g.scale(s * 2.4, s * 2.4); doomMask(g, .4 + .6 * Math.abs(Math.sin(lt * 2))); g.restore();
  bigText(g, '¿QUÉ PASARÍA SI', W / 2, 300, 74, '#ffffff', eback(prog(lt, .05, .3)));
  bigText(g, 'DOOM CREA EL', W / 2, 400, 92, '#ff4a3d', eback(prog(lt, .4, .65)));
  bigText(g, 'BATTLEWORLD?', W / 2, 520, 128, '#ffb52e', eback(prog(lt, .9, 1.2)));
  if (lt > 3.38) { const k = eback(prog(lt, 3.38, 3.6)); g.save(); g.translate(W / 2, 680); g.rotate(-.05); g.scale(k, k); g.fillStyle = '#9d1418'; g.fillRect(-170, -56, 340, 112); g.lineWidth = 5; g.strokeStyle = '#ffd7c2'; g.strokeRect(-160, -46, 320, 92); g.font = '86px LG'; g.fillStyle = '#ffe9dc'; g.textAlign = 'center'; g.textBaseline = 'middle'; g.fillText('PARTE 1', 0, 8); g.restore(); }
  bigText(g, 'TEORÍA FAN · AVENGERS: DOOMSDAY', W / 2, 1620, 40, '#d6c7a0', prog(lt, 1.4, 1.8), 'BB');
}, 'glitch', .35);
// 3. Incursiones
scene(11.96, (g, t, lt) => {
  space(g, t, ['#07030a', '#1d0a1e', '#3a0c14']); g.save(); cam(g, lt, 6.7, .1);
  const d = lerp(520, 150, eio(prog(lt, 0, 6.6))); const shake = lt > 4 ? (Math.random() - .5) * 14 * prog(lt, 4, 6.7) : 0;
  earth(g, W / 2 - d + shake, 880, 230, 0, prog(lt, 2, 6.7), lt * .05); earth(g, W / 2 + d - shake, 880, 230, 3, prog(lt, 2, 6.7), -lt * .05);
  if (d < 300) { const rg = g.createRadialGradient(W / 2, 880, 0, W / 2, 880, 300); rg.addColorStop(0, `rgba(255,200,120,${prog(lt, 4, 6.7)})`); rg.addColorStop(1, 'rgba(0,0,0,0)'); g.fillStyle = rg; g.fillRect(0, 500, W, 800); }
  g.restore();
  // contador
  const n = Math.round(lerp(2048, 2, eio(prog(lt, .3, 6.5)))); g.save(); g.translate(W / 2, 1590); rr(g, -260, -70, 520, 140, 18); fs(g, 'rgba(10,10,14,.85)', 5); g.font = '38px BB'; g.fillStyle = '#c9c2b0'; g.textAlign = 'center'; g.fillText('TIERRAS QUE QUEDAN', 0, -28); g.font = '84px LG'; g.fillStyle = n <= 2 ? '#ff4a3d' : '#ffffff'; g.fillText(n.toLocaleString('es'), 0, 48); g.restore();
});
// 3b. Choque (flash) – escombros
scene(18.7, (g, t, lt) => {
  space(g, t, ['#0a0204', '#2a0806', '#4a1408']);
  for (let i = 0; i < 46; i++) { const a = srnd(i) * 7, sp = 200 + srnd(i + 7) * 900; const r = eout(clamp(lt / 1.8)) * sp; const x = W / 2 + Math.cos(a) * r, y = 880 + Math.sin(a) * r; g.save(); g.translate(x, y); g.rotate(lt * (srnd(i + 2) - .5) * 6); const s = 20 + srnd(i + 4) * 50;
    poly(g, [[-s, -s * .6], [s * .8, -s], [s, s * .5], [-s * .4, s]], i % 3 ? '#5c9a4a' : '#2d6aa3', 5); g.restore(); }
  const rg = g.createRadialGradient(W / 2, 880, 0, W / 2, 880, 500); rg.addColorStop(0, `rgba(255,220,150,${1 - prog(lt, 0, 1.5)})`); rg.addColorStop(1, 'rgba(0,0,0,0)'); g.fillStyle = rg; g.fillRect(0, 0, W, H);
}, 'flash', .35);
// 4. Héroes pelean, ya es tarde
scene(20.52, (g, t, lt) => {
  warSky(g, t); g.save(); cam(g, lt, 6, .06);
  [[200, 1330, .8, 1], [430, 1370, .95, 2], [690, 1350, .85, 3], [900, 1330, .78, 0]].forEach(([x, y, s, ty], i) => { g.save(); g.shadowColor = '#ff8a3a'; g.shadowBlur = 24; silhouette(g, x + Math.sin(t * 2 + i) * 6, y, s, ty, t); g.restore(); });
  if (lt > 3.9) { const k = prog(lt, 3.9, 5.5); earth(g, 300 + k * 140, 520, 130, 0, 1, t * .1); earth(g, 780 - k * 140, 520, 130, 3, 1, -t * .1); }
  g.restore();
  // barra multiverso
  const v = lerp(38, 1, eio(prog(lt, 0, 5.5))); g.save(); g.translate(W / 2, 1660); rr(g, -300, -40, 600, 80, 40); fs(g, 'rgba(12,6,6,.85)', 5); rr(g, -290, -30, 580 * v / 100 + 30, 60, 30); fs(g, '#ff4a3d', 0);
  g.font = '50px LG'; g.fillStyle = '#fff'; g.textAlign = 'center'; g.textBaseline = 'middle'; g.lineWidth = 8; g.strokeStyle = '#000'; g.strokeText(`MULTIVERSO ${Math.round(v)}%`, 0, 4); g.fillText(`MULTIVERSO ${Math.round(v)}%`, 0, 4); g.restore();
}, 'push', .3);
// 5. Víctor Von Doom + ficha
scene(26.64, (g, t, lt) => {
  castle(g, t); g.save(); cam(g, lt, 7.5, .06);
  const walkIn = prog(lt, 0, 1.6); const x = lerp(1300, 600, eout(walkIn)); const p = walkIn < 1 ? walk(t, 1.1, .4) : idle(t);
  figure(g, x, 1380, 1.35, DOOM, { ...p, t, glow: prog(lt, 1.6, 2.2) * .8 }); g.restore();
  if (lt > 2.87) { const k = eback(prog(lt, 2.87, 3.2)); g.save(); g.translate(W / 2, 760); g.rotate(-.04); g.scale(k, k);
    rr(g, -400, -260, 800, 520, 14); fs(g, '#e9e0c9', 7); g.fillStyle = 'rgba(120,90,50,.15)'; for (let i = 0; i < 9; i++) g.fillRect(-380, -200 + i * 52, 760, 2);
    rr(g, -370, -220, 250, 300, 8); fs(g, '#2c312e', 5); g.save(); g.translate(-245, -60); g.scale(1.45, 1.45); doomMask(g, .5); g.restore();
    g.font = '64px BB'; g.fillStyle = '#1b1b1b'; g.textAlign = 'left'; g.fillText('VÍCTOR VON DOOM', -90, -170);
    g.font = '44px BB'; g.fillStyle = '#4a4036'; const L = ['GOBERNANTE DE LATVERIA', 'GENIO CIENTÍFICO', 'HECHICERO']; L.forEach((s, i) => { if (lt > 3.1 + i * .35) g.fillText(s, -90, -90 + i * 62); });
    g.restore(); stamp(g, 'PELIGRO', W / 2 + 180, 960, prog(lt, 4.73, 4.95)); }
}, 'push', .3);
// 6. Doom descubre (pantalla)
scene(34.15, (g, t, lt) => {
  castle(g, t, .35); g.save(); cam(g, lt, 2.7, .08);
  // monitor gigante con universos
  rr(g, 140, 380, 800, 820, 30); fs(g, '#22282a', 9); rr(g, 180, 420, 720, 740, 16); fs(g, '#0d1b22', 5);
  g.save(); rr(g, 180, 420, 720, 740, 16); g.clip();
  for (let i = 0; i < 16; i++) { const x = 240 + (i % 4) * 180 + Math.sin(t + i) * 10, y = 500 + Math.floor(i / 4) * 180 + Math.cos(t * 1.2 + i) * 10; const pop = i === 6 || i === 9 ? prog(lt, .8 + (i === 9) * .7, 1.1 + (i === 9) * .7) : 0;
    if (pop >= 1) continue; ell(g, x, y, 60 * (1 + pop * .8), 60 * (1 + pop * .8), `rgba(120,220,255,${.25 * (1 - pop)})`, 4); g.save(); g.translate(x, y); g.rotate(t * 1.5 + i); g.strokeStyle = '#d5f4ff'; g.lineWidth = 4; g.beginPath(); for (let a = 0; a < 9; a += .3) g.lineTo(Math.cos(a) * a * 3.5, Math.sin(a) * a * 3.5); g.stroke(); g.restore(); }
  g.fillStyle = 'rgba(120,255,160,.07)'; for (let y = 420; y < 1160; y += 8) g.fillRect(180, y, 720, 3); g.restore();
  g.restore(); figure(g, 920, 1560, 1.1, DOOM, { ...idle(t), t, glow: .6, aL: -1.6, flip: true });
}, 'push', .3);
// 7. Beyonders
scene(36.86, (g, t, lt) => {
  space(g, t, ['#030208', '#0e0820', '#22103a']); g.save(); cam(g, lt, 4.9, .08, W / 2, 900);
  const by = (x, y, s, k) => { g.save(); g.translate(x, y + Math.sin(t * .8 + k) * 14); g.scale(s, s);
    g.save(); g.shadowColor = '#8a5cff'; g.shadowBlur = 70;
    const bg = g.createLinearGradient(0, -100, 0, 900); bg.addColorStop(0, '#5b3fb8'); bg.addColorStop(1, '#1a1040');
    g.beginPath(); g.moveTo(-60, 40); g.quadraticCurveTo(-210, 120, -170, 900); g.lineTo(170, 900); g.quadraticCurveTo(210, 120, 60, 40); g.closePath(); fs(g, bg, 7); g.restore();
    g.save(); g.strokeStyle = 'rgba(160,230,255,.55)'; g.lineWidth = 5; for (let i = 0; i < 4; i++) { g.beginPath(); g.arc(0, 330, 60 + i * 55 + Math.sin(t * 2 + i + k) * 6, Math.PI * 1.15, Math.PI * 1.85); g.stroke(); } g.restore();
    for (let i = 0; i < 18; i++) { g.fillStyle = 'rgba(255,255,255,.8)'; g.fillRect(-120 + srnd(i + k * 30) * 240, 160 + srnd(i * 3 + k) * 650, 5, 5); }
    g.save(); g.shadowColor = '#b9f0ff'; g.shadowBlur = 60; ell(g, 0, -40, 92, 92, '#2a1d63', 7); g.restore();
    g.save(); g.translate(0, -40); g.rotate(t * .4 + k); for (let i = 0; i < 6; i++) { g.rotate(Math.PI / 3); poly(g, [[0, -60], [14, -20], [-14, -20]], '#7ad8ff', 3); } g.restore();
    g.save(); g.shadowColor = '#ffffff'; g.shadowBlur = 30; ell(g, -30, -40, 16, 10, '#ffffff', 0); ell(g, 30, -40, 16, 10, '#ffffff', 0); g.restore();
    g.restore(); };
  by(200, 820, .9, 0); by(880, 760, .95, 2); by(W / 2, 640, 1.25, 1);
  // universo en su mano, aplastado
  const crush = prog(lt, 1.6, 3.6); const ux = W / 2, uy = 1250; const r = 120 * (1 - eio(crush) * .95);
  if (crush < 1) { ell(g, ux, uy, r, r, 'rgba(120,220,255,.35)', 5); g.save(); g.translate(ux, uy); g.rotate(t * 2); g.strokeStyle = '#d5f4ff'; g.lineWidth = 5; g.beginPath(); for (let a = 0; a < 9; a += .3) g.lineTo(Math.cos(a) * a * r / 10, Math.sin(a) * a * r / 10); g.stroke(); g.restore(); }
  else for (let i = 0; i < 20; i++) { const a = srnd(i) * 7, d = (lt - 3.6) * 500 * srnd(i + 3); g.fillStyle = '#d5f4ff'; g.fillRect(ux + Math.cos(a) * d, uy + Math.sin(a) * d, 8, 8); }
  // manos
  const hk = eio(crush); for (const sgn of [-1, 1]) { g.save(); g.translate(ux + sgn * lerp(320, 135, hk), uy); g.shadowColor = '#8a5cff'; g.shadowBlur = 40; ell(g, 0, 0, 70, 110, '#4a32a0', 7); g.restore(); }
  g.restore();
}, 'zoom', .35);
// 8. Hombre Molécula + robo del poder → dios
scene(41.8, (g, t, lt) => {
  space(g, t, ['#05030a', '#1a0d2e', '#2f1440']);
  const rise = eio(prog(lt, 1.9, 5.6)); const glow = prog(lt, 1.9, 3.7);
  g.save(); cam(g, lt, 6, .06);
  // rayos desde arriba
  if (lt > 1.9) { for (let i = 0; i < 5; i++) { const sx = 100 + i * 220, a = .5 + .5 * Math.sin(t * 20 + i); g.save(); g.strokeStyle = `rgba(255,${220 + i * 6},150,${.35 + .4 * a})`; g.lineWidth = 16 + 10 * a; g.shadowColor = '#ffe08a'; g.shadowBlur = 40; g.beginPath(); g.moveTo(sx, 0);
    for (let k = 1; k <= 8; k++) g.lineTo(lerp(sx, 640, k / 8) + (srnd(i * 9 + k + Math.floor(t * 12)) - .5) * 60, lerp(0, 1000 - rise * 300, k / 8)); g.stroke(); g.restore(); } }
  if (glow > 0) { const rg = g.createRadialGradient(640, 1000 - rise * 300, 0, 640, 1000 - rise * 300, 420); rg.addColorStop(0, `rgba(255,230,150,${.7 * glow})`); rg.addColorStop(1, 'rgba(0,0,0,0)'); g.fillStyle = rg; g.fillRect(0, 0, W, H); }
  g.fillStyle = '#1b1426'; g.fillRect(0, 1560, W, H); g.lineWidth = 6; g.strokeStyle = OL; g.beginPath(); g.moveTo(0, 1560); g.lineTo(W, 1560); g.stroke();
  figure(g, 250, 1500, 1.05, MOLE, { ...idle(t, 2), aL: lt > 1 ? -2.6 : .1, aR: lt > 1 ? -2.4 : -.1, t });
  if (lt > 1) { g.save(); g.shadowColor = '#7fe08a'; g.shadowBlur = 40; g.strokeStyle = 'rgba(127,224,138,.8)'; g.lineWidth = 8; for (let i = 0; i < 3; i++) { g.beginPath(); g.arc(250, 1100, 120 + i * 50 + Math.sin(t * 6 + i) * 10, 0, 7); g.stroke(); } g.restore(); }
  figure(g, 640, 1500 - rise * 300, 1.25, DOOM, { ...idle(t), t, glow: .5 + glow * .5, aL: -2.7 * clamp(rise * 2), aR: 2.7 * clamp(rise * 2), lL: .15 * rise, lR: -.15 * rise, cape: 40 * rise });
  g.restore();
}, 'push', .3);
// 8b. Dios Doom
scene(45.48, (g, t, lt) => {
  const gr = g.createRadialGradient(W / 2, 800, 0, W / 2, 800, 1100); gr.addColorStop(0, '#fff1c4'); gr.addColorStop(.35, '#d9973a'); gr.addColorStop(1, '#2a1406'); g.fillStyle = gr; g.fillRect(0, 0, W, H);
  g.save(); g.translate(W / 2, 800); g.rotate(t * .1); for (let i = 0; i < 24; i++) { g.rotate(Math.PI / 12); g.fillStyle = i % 2 ? 'rgba(255,255,255,.12)' : 'rgba(255,220,140,.08)'; g.beginPath(); g.moveTo(0, 0); g.lineTo(-90, -1600); g.lineTo(90, -1600); g.fill(); } g.restore();
  g.save(); g.shadowColor = '#fff'; g.shadowBlur = 50; g.lineWidth = 18; g.strokeStyle = '#ffe9a8'; g.beginPath(); g.arc(W / 2, 640, 260 + Math.sin(t * 3) * 8, 0, 7); g.stroke(); g.restore();
  g.save(); cam(g, lt, 2.4, .1, W / 2, 800); figure(g, W / 2, 1500 + Math.sin(t * 2) * 12, 1.45, DOOM, { t, glow: 1, aL: -.9, aR: .9, cape: 30 }); g.restore();
}, 'flash', .4);
// 9. Fragmentos → Battleworld
scene(47.88, (g, t, lt) => {
  space(g, t); const as = eio(prog(lt, .2, 3.6)); patchPlanet(g, W / 2, 900, 1.1, as, t);
}, 'zoom', .35);
// 10. Mapa de reinos
const REGIONS = [['DOOMSTADT', 540, 760, '#2f6b3a'], ['LAS TIERRAS MUERTAS', 300, 520, '#6f7a55'], ['PERFECCIÓN', 800, 520, '#8f2a2a'], ['ARCADIA', 300, 1060, '#c9a35b'], ['KILLISEUM', 790, 1060, '#7a5fa8'], ['NUEVA XANDAR', 540, 1240, '#3f6f8f']];
scene(52.97, (g, t, lt) => {
  g.fillStyle = '#2a1d12'; g.fillRect(0, 0, W, H); g.save(); cam(g, lt, 5.3, .07);
  rr(g, 70, 300, 940, 1150, 18); fs(g, '#e8d7ae', 9);
  g.save(); rr(g, 70, 300, 940, 1150, 18); g.clip();
  REGIONS.forEach(([n, x, y, c], i) => { const k = prog(lt, .1 + i * .18, .4 + i * .18); if (k <= 0) return; g.save(); g.globalAlpha = k; g.beginPath(); for (let a = 0; a < 12; a++) { const r = 190 + srnd(i * 20 + a) * 70; g.lineTo(x + Math.cos(a / 12 * 7) * r, y + Math.sin(a / 12 * 7) * r * .8); } g.closePath(); fs(g, c + 'aa', 5); g.restore();
    if (k >= 1) { g.save(); g.translate(x, y - 40); const ck = eback(prog(lt, .4 + i * .18 + 1.6, .7 + i * .18 + 1.6)); g.scale(ck, ck); poly(g, [[-36, 20], [-40, -24], [-18, 0], [0, -34], [18, 0], [40, -24], [36, 20]], '#f2c53d', 5); g.restore();
      g.font = '42px BB'; g.textAlign = 'center'; g.fillStyle = '#1b140c'; g.fillText(n, x, y + 40); } });
  g.setLineDash([18, 14]); g.strokeStyle = '#b3161b'; g.lineWidth = 7; g.beginPath(); REGIONS.forEach(([, x, y], i) => { if (i) { g.moveTo(540, 760); g.lineTo(lerp(540, x, eio(prog(lt, 1, 2.5))), lerp(760, y, eio(prog(lt, 1, 2.5)))); } }); g.stroke(); g.setLineDash([]);
  g.restore(); g.restore();
}, 'push', .3);
// 11. Panorama: zombis | escudo | ultrons
const ZOMS = Array.from({ length: 7 }, (_, i) => [80 + i * 140 + rnd() * 40, 1330 + rnd() * 120, .7 + rnd() * .2]);
const ULTS = Array.from({ length: 7 }, (_, i) => [2240 + i * 140 + rnd() * 30, 1330 + rnd() * 120, .7 + rnd() * .2]);
scene(58.24, (g, t, lt) => {
  // cámara: 0→zombis, 2.7→ultrons, 5.24→centro y alejar
  let cx = 540; cx = lerp(cx, 2700, eio(prog(lt, 2.5, 3.2))); cx = lerp(cx, 1620, eio(prog(lt, 5.2, 6))); const z = lerp(1, .5, eio(prog(lt, 6.1, 7.4)));
  g.save(); g.translate(W / 2, H * .62); g.scale(z, z); g.translate(-cx, -H * .62);
  // zona zombi
  let gr = g.createLinearGradient(0, 0, 0, H); gr.addColorStop(0, '#1c2618'); gr.addColorStop(.7, '#4f6a35'); gr.addColorStop(1, '#22301a'); g.fillStyle = gr; g.fillRect(-1200, -2000, 2600, 4800);
  for (const x of [-200, 150, 700, 1100]) { g.lineWidth = 16; g.strokeStyle = '#1a1510'; g.beginPath(); g.moveTo(x, 1500); g.lineTo(x + 10, 1100); g.lineTo(x - 60, 980); g.moveTo(x + 8, 1200); g.lineTo(x + 90, 1080); g.stroke(); }
  g.fillStyle = '#2a2a1e'; g.fillRect(-1200, 1480, 2600, 1600);
  ZOMS.forEach(([x, y, s], i) => figure(g, x + Math.sin(t * .8 + i) * 20, y, s, ZOMBIE(i), { t, aL: -1.5 + Math.sin(t * 3 + i) * .1, aR: -1.4 + Math.cos(t * 3 + i) * .1, ...{ lL: Math.sin(t * 2 + i) * .2, lR: -Math.sin(t * 2 + i) * .2 }, tilt: Math.sin(t + i) * .15 }));
  // zona ultron
  gr = g.createLinearGradient(0, 0, 0, H); gr.addColorStop(0, '#1a0608'); gr.addColorStop(.7, '#7a1a1a'); gr.addColorStop(1, '#2a0a0a'); g.fillStyle = gr; g.fillRect(2000, -2000, 2400, 4800);
  for (let i = 0; i < 9; i++) { const x = 2050 + i * 120, h = 500 + srnd(i) * 500; rr(g, x, 1480 - h, 100, h, 4); fs(g, '#3a3f46', 5); g.fillStyle = '#ff3b30'; for (let y = 1480 - h + 30; y < 1460; y += 60) g.fillRect(x + 20, y, 60, 8); }
  g.fillStyle = '#2b2d33'; g.fillRect(2000, 1480, 2400, 1600);
  ULTS.forEach(([x, y, s], i) => figure(g, x, y + Math.sin(t * 4 + i) * 3, s, ULTRON, { t, aL: .2, aR: -.2 }));
  // muro
  g.save(); g.translate(1620, 0); rr(g, -380, -1600, 760, 3200, 0); fs(g, '#5f6166', 10);
  g.strokeStyle = 'rgba(0,0,0,.4)'; g.lineWidth = 6; for (let y = -1600; y < 1600; y += 90) { g.beginPath(); g.moveTo(-380, y); g.lineTo(380, y); g.stroke(); for (let x = -380 + (y / 90 % 2) * 95; x < 380; x += 190) { g.beginPath(); g.moveTo(x, y); g.lineTo(x, y + 90); g.stroke(); } }
  for (let i = -3; i <= 3; i++) { rr(g, -420, i * 400 - 40, 840, 60, 6); fs(g, '#4a4c52', 6); }
  for (let i = -2; i <= 2; i++) { g.save(); g.shadowColor = '#ffe08a'; g.shadowBlur = 40; ell(g, -300, i * 400 + 180, 16, 16, '#ffe08a', 4); ell(g, 300, i * 400 + 180, 16, 16, '#ffe08a', 4); g.restore(); }
  g.restore(); g.restore();
}, 'push', .3);
// 12. Thors / Strange / nadie recuerda
const THORS = [mkThor('#b4201f', '#e3c35a'), mkThor('#2e5fa8', '#7a4a2a'), mkThor('#3f8f5a', '#d9692c', '#c98f6b'), mkThor('#7a4fa8', '#e8e8e8'), mkThor('#b36a00', '#2a201b', '#8a5a3c')];
scene(67.13, (g, t, lt) => {
  bwSky(g, t); g.save(); cam(g, lt, 2, .05);
  THORS.forEach((sp, i) => { const x = 120 + i * 210, p = walk(t + i * .1, .9, .3); const sc = i % 2 ? .78 : .85; figure(g, x, 1700 + (i % 2) * 30, sc, sp, { ...p, t, aR: -.3, holdR: (gg, hx, hy) => hammer(gg, hx, hy - 30) }); });
  if (lt > .4) { g.save(); g.globalAlpha = .9 * (Math.sin(lt * 40) > .3 && lt < 1.2 ? 1 : 0); g.strokeStyle = '#d9f3ff'; g.lineWidth = 8; g.shadowColor = '#8fd8ff'; g.shadowBlur = 30; g.beginPath(); g.moveTo(600, 0); g.lineTo(560, 300); g.lineTo(640, 420); g.lineTo(580, 800); g.stroke(); g.restore(); }
  g.restore();
}, 'push', .3);
scene(69.16, (g, t, lt) => {
  bwSky(g, t); g.save(); cam(g, lt, 2, .06);
  figure(g, W / 2, 1250, 1.2, STRANGE, { ...idle(t), t, aL: -.6 });
  g.restore();
}, 'push', .3);
scene(71.13, (g, t, lt) => {
  bwSky(g, t); g.save(); cam(g, lt, 3.4, .05);
  // estatua/póster de Doom
  rr(g, 290, 380, 500, 640, 10); fs(g, '#2f6b3a', 8); g.save(); g.translate(540, 640); g.scale(2.2, 2.2); doomMask(g, .3); g.restore(); bigText(g, 'DOOM ES DIOS', 540, 940, 62, '#ffd21f', 1, 'BB');
  const crowd = [[150, 1, '#c96a3a'], [330, 2, '#3f6f8f'], [540, 3, '#7a4fa8'], [740, 4, '#5d8f4a'], [930, 5, '#a8452f']];
  crowd.forEach(([x, k, c], i) => { const sp = { ...MOLE, torso: c, armC: c, head: (gg, p) => { ell(gg, 0, 0, 42, 52, i % 2 ? '#e7b892' : '#b98a62'); ell(gg, 0, -34, 44, 26, ['#2a201b', '#d9692c', '#f2d06b', '#5a3b26', '#1b1b1b'][i], 5); eyes(gg, 0, 15, blinkAt(t, i)); } };
    figure(g, x, 1720, .8, sp, { ...idle(t, i), t, tilt: Math.sin(t + i) * .08 }); const q = eback(prog(lt, .6 + i * .15, .9 + i * .15)); if (q > 0) bigText(g, '?', x + 40, 1180 + Math.sin(t * 3 + i) * 8, 90, '#ffffff', q); });
  g.restore();
}, 'push', .3);
// 13. Trono + familia
scene(74.59, (g, t, lt) => {
  castle(g, t, .2); g.save(); cam(g, lt, 6.5, .05);
  throne(g, 540, 1480);
  figure(g, 540, 1350, 1.25, DOOM, { ...idle(t), t, glow: .7 });
  const sk = eout(prog(lt, 1.97, 2.4)); if (sk > 0) { g.save(); g.globalAlpha = sk; figure(g, lerp(1150, 830, sk), 1360, 1.1, SUE, { ...idle(t, 3), t }); g.restore(); }
  const kk = eout(prog(lt, 4.17, 4.6)); if (kk > 0) { g.save(); g.globalAlpha = kk; figure(g, lerp(-200, 230, kk), 1440, .95, FRANKLIN, { ...idle(t, 4), t }); figure(g, lerp(-80, 370, kk), 1440, .95, VALERIA, { ...idle(t, 5), t }); g.restore(); }
  g.restore();
}, 'push', .3);
// 13b. Retrato familiar
scene(81.12, (g, t, lt) => {
  castle(g, t, .5); g.save(); cam(g, lt, 3.6, .07);
  g.save(); g.translate(W / 2, 820); rr(g, -380, -420, 760, 840, 20); fs(g, '#b8862f', 10); rr(g, -330, -370, 660, 740, 10); fs(g, '#3b4a3e', 6);
  g.save(); rr(g, -330, -370, 660, 740, 10); g.clip();
  figure(g, 40, 90, 1.0, DOOM, { t: 0, glow: .3 }); figure(g, -190, 100, .92, SUE, { t: 0 }); figure(g, 175, 170, .78, FRANKLIN, { t: 0 }); figure(g, 275, 170, .78, VALERIA, { t: 0 });
  g.restore(); g.restore();
  // foto de Reed rota que cae
  const f = prog(lt, 1.85, 3.5); g.save(); g.translate(lerp(760, 820, f), lerp(1340, 1580, eio(f))); g.rotate(.15 + f * .5); rr(g, -130, -150, 260, 300, 6); fs(g, '#efe6d2', 6); g.save(); g.translate(0, 70); g.scale(.85, .85); REED.head(g, {}); g.restore();
  if (lt > 1.85) { const k = prog(lt, 1.85, 2.1); g.strokeStyle = '#d4171c'; g.lineWidth = 18; g.lineCap = 'round'; g.beginPath(); g.moveTo(-100, -110); g.lineTo(-100 + 200 * k, -110 + 220 * k); g.moveTo(100, -110); g.lineTo(100 - 200 * k, -110 + 220 * k); g.stroke(); }
  g.restore(); g.restore();
}, 'zoom', .3);
// 14. 8 años después: balsa
scene(84.78, (g, t, lt) => {
  space(g, t, ['#020204', '#07080f', '#0f1020']);
  if (lt < 3.4) { // calendario
    const yr = 1 + Math.min(7, Math.floor(prog(lt, .2, 2.4) * 8)); g.save(); g.translate(W / 2, 860); g.rotate(-.04);
    rr(g, -300, -320, 600, 640, 16); fs(g, '#efe6d2', 9); rr(g, -300, -320, 600, 140, 16); fs(g, '#b3161b', 9);
    g.font = '86px LG'; g.fillStyle = '#fff'; g.textAlign = 'center'; g.textBaseline = 'middle'; g.fillText('AÑO', 0, -244);
    g.font = '300px LG'; g.fillStyle = '#1b1b1b'; g.fillText(String(yr), 0, 90); const fl = (prog(lt, .2, 2.4) * 8) % 1; if (yr < 8) { g.save(); g.globalAlpha = 1 - fl; g.translate(0, -fl * 200); g.rotate(-fl * .4); rr(g, -280, -170, 560, 470, 10); fs(g, '#e4d8bf', 5); g.restore(); }
    g.restore();
  } else {
    g.save(); cam(g, lt - 3.4, 3.8, .12);
    for (let i = 0; i < 14; i++) { g.save(); g.translate((srnd(i) * W + t * 12 * (i % 3 + 1)) % W, srnd(i + 4) * H); g.rotate(t * .3 + i); poly(g, [[-20, -10], [16, -18], [22, 14], [-12, 20]], '#3a3b44', 4); g.restore(); }
    g.save(); g.translate(W / 2, 900 + Math.sin(t) * 16); g.rotate(Math.sin(t * .7) * .04);
    poly(g, [[-360, -60], [300, -90], [400, 0], [300, 90], [-360, 70]], '#6a6f7a', 9); rr(g, -260, -140, 360, 90, 30); fs(g, '#4f5560', 7);
    for (let i = 0; i < 5; i++) { const on = lt - 3.4 > .3 + i * .15; g.save(); if (on) { g.shadowColor = '#ffe08a'; g.shadowBlur = 30; } ell(g, -250 + i * 120, 0, 34, 34, on ? '#ffe08a' : '#1b1d24', 6); g.restore(); }
    g.restore(); g.restore();
    if (lt > 4.3) { // ojos que despiertan
      const o = clamp(prog(lt, 4.4, 4.9)); g.save(); g.translate(W / 2, 1180); rr(g, -320, -110, 640, 220, 30); fs(g, 'rgba(10,10,14,.9)', 7);
      for (const ex of [-120, 120]) { g.save(); g.beginPath(); g.ellipse(ex, 0, 90, 60 * o + 2, 0, 0, 7); g.fillStyle = '#f2efe6'; g.fill(); g.clip(); ell(g, ex, 0, 32, 32, '#3a6ea8', 0); ell(g, ex, 0, 14, 14, '#111', 0); g.restore(); g.beginPath(); g.ellipse(ex, 0, 90, 60 * o + 2, 0, 0, 7); g.lineWidth = 7; g.strokeStyle = OL; g.stroke(); }
      g.restore(); }
  }
}, 'push', .3);
// 15. Reed Richards
scene(92.05, (g, t, lt) => {
  space(g, t, ['#030512', '#0a1a3a', '#12305a']); g.save(); cam(g, lt, 5.4, .07);
  const st = eio(prog(lt, 3.85, 4.6)); // brazo que se estira
  figure(g, 360, 1450, 1.35, REED, { ...idle(t), t, aR: -.2, aL: lerp(.12, -1.45, st) });
  if (st > 0) { const S2 = 1.35, px = 360 + (-116 / 2 + 12) * S2, py = 1450 + (-190 + 18) * S2; g.save(); g.translate(px, py); g.scale(S2, S2); limb(g, 0, 0, -1.5, 175 + 420 * st, 30, '#2d5fb3', hand('#16243f')); g.restore(); }
  g.restore();
  if (lt > 3.85) bigText(g, 'REED RICHARDS', W / 2, 560, 96, '#47c6ff', eback(prog(lt, 3.85, 4.15)));
}, 'push', .3);
// 16. Doom: la verdad / ¿podrá un hombre derrotar a un dios?
scene(97.48, (g, t, lt) => {
  castle(g, t, clamp(.3 + prog(lt, 2.8, 5.2) * .6)); throne(g, 540, 1650);
  g.save(); cam(g, lt, 5.2, .18, W / 2, 900); g.translate(W / 2, 1020); g.scale(3.6, 3.6); doomMask(g, .6 + .4 * Math.abs(Math.sin(t * 2))); g.restore();
  const v = prog(lt, 2.73, 5); g.fillStyle = `rgba(0,0,0,${v * .45})`; g.fillRect(0, 0, W, H);
}, 'push', .3);
// 17. Continuará
scene(102.73, (g, t, lt) => {
  g.fillStyle = '#0b0906'; g.fillRect(0, 0, W, H); const rg = g.createRadialGradient(W / 2, 820, 0, W / 2, 820, 700); rg.addColorStop(0, 'rgba(120,90,40,.45)'); rg.addColorStop(1, 'rgba(0,0,0,0)'); g.fillStyle = rg; g.fillRect(0, 0, W, H);
  for (let i = 0; i < 60; i++) { g.fillStyle = `rgba(255,220,150,${.3 + srnd(i) * .5})`; g.fillRect((srnd(i) * W + t * 15) % W, (srnd(i + 9) * H - t * 25 * (srnd(i + 3) + .3) + H * 9) % H, 4, 4); }
  const k = prog(lt, 0, .8); g.save(); g.globalAlpha = k; g.font = '900 120px CZ'; g.textAlign = 'center'; g.textBaseline = 'middle'; g.shadowColor = '#ffcf6a'; g.shadowBlur = 40; g.fillStyle = '#f3dca2'; g.fillText('CONTINUARÁ', W / 2, 760); g.restore();
  g.save(); g.globalAlpha = prog(lt, .4, 1); bigText(g, 'PARTE 2', W / 2, 900, 96, '#ffffff', 1, 'BB'); g.restore();
  if (lt > 1.56) bigText(g, 'SÍGUEME PARA VERLA', W / 2, 1010, 70, '#ff4a3d', eback(prog(lt, 1.56, 1.85)), 'BB');
}, 'fade', .5);

// ---------- composición ----------
const GRAIN = Array.from({ length: 3 }, () => { const c = mk(540, 960), g = c.getContext('2d'), im = g.createImageData(540, 960); for (let i = 0; i < im.data.length; i += 4) { const v = rnd() * 255; im.data[i] = im.data[i + 1] = im.data[i + 2] = v; im.data[i + 3] = 18; } g.putImageData(im, 0, 0); return c; });
function drawScene(i, g, t) { const s = S[i]; g.save(); g.clearRect(0, 0, W, H); s.draw(g, t, t - s.t0); g.restore(); }
window.renderAt = t => {
  let i = 0; while (i + 1 < S.length && t >= S[i + 1].t0) i++;
  const s = S[i], lt = t - s.t0; const g = ctx;
  if (i > 0 && lt < s.trd && s.tr !== 'cut' && s.tr !== 'flash') {
    drawScene(i - 1, bufA.getContext('2d'), t); drawScene(i, bufB.getContext('2d'), t); const k = eio(lt / s.trd);
    g.fillStyle = '#000'; g.fillRect(0, 0, W, H);
    if (s.tr === 'push') { g.drawImage(bufA, -W * k, 0); g.drawImage(bufB, W * (1 - k), 0); }
    else if (s.tr === 'zoom') { g.drawImage(bufA, 0, 0); g.save(); g.globalAlpha = k; const sc = lerp(1.35, 1, k); g.translate(W / 2, H / 2); g.scale(sc, sc); g.drawImage(bufB, -W / 2, -H / 2); g.restore(); }
    else if (s.tr === 'fade') { g.globalAlpha = 1 - k; g.drawImage(bufA, 0, 0); g.globalAlpha = k; g.drawImage(bufB, 0, 0); g.globalAlpha = 1; }
    else if (s.tr === 'glitch') { const n = 24; for (let j = 0; j < n; j++) { const y = j * H / n, h = H / n + 1; const useB = srnd(j * 3.1 + Math.floor(lt * 30)) < k; const dx = (srnd(j + Math.floor(lt * 30) * 7) - .5) * 160 * (1 - Math.abs(k * 2 - 1)) * 2; g.drawImage(useB ? bufB : bufA, 0, y, W, h, dx, y, W, h); }
      g.globalCompositeOperation = 'screen'; g.fillStyle = `rgba(255,40,60,${.25 * (1 - Math.abs(k * 2 - 1))})`; g.fillRect(0, 0, W, H); g.globalCompositeOperation = 'source-over'; }
  } else { drawScene(i, bufB.getContext('2d'), t); g.drawImage(bufB, 0, 0); }
  if (s.tr === 'flash' && lt < s.trd + .1) { const a = 1 - clamp(lt / (s.trd + .1)); g.fillStyle = `rgba(255,255,255,${a})`; g.fillRect(0, 0, W, H);
    g.save(); g.translate(W / 2, H / 2); g.strokeStyle = `rgba(120,120,120,${a * .6})`; g.lineWidth = 4; for (let j = 0; j < 70; j++) { const an = srnd(j) * 7, r0 = 250 + srnd(j + 1) * 300; g.beginPath(); g.moveTo(Math.cos(an) * r0, Math.sin(an) * r0); g.lineTo(Math.cos(an) * 1400, Math.sin(an) * 1400); g.stroke(); } g.restore(); }
  // viñeta y grano
  const vg = g.createRadialGradient(W / 2, H / 2, H * .3, W / 2, H / 2, H * .75); vg.addColorStop(0, 'rgba(0,0,0,0)'); vg.addColorStop(1, 'rgba(0,0,0,.5)'); g.fillStyle = vg; g.fillRect(0, 0, W, H);
  g.drawImage(GRAIN[Math.floor(t * 15) % 3], 0, 0, W, H);
  headlines(g, t); notes(g, t); captions(g, t);
  // fundido final
  if (t > DUR - .6) { g.fillStyle = `rgba(0,0,0,${prog(t, DUR - .6, DUR)})`; g.fillRect(0, 0, W, H); }
};
window.DUR = DUR; window.READY = true;
