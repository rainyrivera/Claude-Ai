// ---------- La grulla de papel: personajes y gráficos ----------
function star(g, x, y, R, r, fill, n = 5) { g.beginPath(); for (let i = 0; i < n * 2; i++) { const a = -Math.PI / 2 + i * Math.PI / n, q = i % 2 ? r : R; g.lineTo(x + Math.cos(a) * q, y + Math.sin(a) * q); } g.closePath(); fs(g, fill, 4); }
const JULIAN = {
  skin: '#d2a27e', armC: '#8a7a5a', legC: '#3a3a40', bootC: '#2a1e16', torso: '#8a7a5a', tw: 126, handC: '#d2a27e',
  head: (g, p) => { ell(g, 0, 0, 45, 54, '#d2a27e'); ell(g, -45, 4, 9, 13, '#d2a27e', 4); ell(g, 45, 4, 9, 13, '#d2a27e', 4);
    g.beginPath(); g.moveTo(-46, 2); g.quadraticCurveTo(-50, -60, -10, -58); g.lineTo(-8, -40); g.lineTo(8, -40); g.lineTo(10, -58); g.quadraticCurveTo(50, -60, 46, 2); g.lineTo(38, -22); g.lineTo(-38, -22); g.closePath(); fs(g, '#9a9a9a', 5);
    eyes(g, -2, 16, p.blink, OL, p.wide ? 7 : 5); g.strokeStyle = 'rgba(80,50,40,.45)'; g.lineWidth = 3; g.beginPath(); g.arc(-16, 8, 9, .3, Math.PI - .3); g.arc(16, 8, 9, .3, Math.PI - .3); g.stroke();
    g.lineWidth = 4; g.strokeStyle = OL; g.beginPath(); g.moveTo(-28, -18); g.lineTo(-6, -14); g.moveTo(28, -18); g.lineTo(6, -14); g.stroke();
    g.beginPath(); g.moveTo(-24, 20); g.quadraticCurveTo(0, 8, 24, 20); g.quadraticCurveTo(0, 28, -24, 20); fs(g, '#8d8d8d', 4);
    if (p.mouth === 'o') { g.beginPath(); g.ellipse(0, 34, 6, 8, 0, 0, 7); g.stroke(); } },
  torsoDeco: (g, tw, th) => { poly(g, [[-18, -th], [18, -th], [10, -th + 110], [-10, -th + 110]], '#e8e2d2', 0); poly(g, [[-7, -th + 8], [7, -th + 8], [9, -th + 100], [0, -th + 118], [-9, -th + 100]], '#7a1f22', 3);
    poly(g, [[-tw / 2, -th], [-16, -th], [-6, -th + 120], [-tw / 2 + 6, -th + 60]], '#9a8a68', 4); poly(g, [[tw / 2, -th], [16, -th], [6, -th + 120], [tw / 2 - 6, -th + 60]], '#9a8a68', 4);
    rr(g, -tw / 2 + 6, -40, tw - 12, 14, 4); fs(g, '#5a4a32', 3); },
};
const MATEO = {
  skin: '#d9ad88', armC: '#5a6068', legC: '#2b3036', bootC: '#e8e8e8', torso: '#5a6068', tw: 108, handC: '#d9ad88',
  head: (g, p) => { ell(g, 0, 0, 42, 52, '#d9ad88'); ell(g, -42, 4, 8, 12, '#d9ad88', 4); ell(g, 42, 4, 8, 12, '#d9ad88', 4);
    g.beginPath(); g.moveTo(-46, 0); g.quadraticCurveTo(-50, -64, 4, -62); g.quadraticCurveTo(54, -60, 46, 0); g.lineTo(40, -18); g.lineTo(26, -30); g.lineTo(10, -20); g.lineTo(-8, -32); g.lineTo(-26, -20); g.lineTo(-40, -22); g.closePath(); fs(g, '#1e1612', 5);
    eyes(g, 0, 15, p.blink, OL, 5); g.lineWidth = 4; g.strokeStyle = OL; g.beginPath(); g.arc(-15, 0, 12, 0, 7); g.moveTo(-3, 0); g.lineTo(3, 0); g.arc(15, 0, 12, Math.PI, Math.PI * 3); g.stroke();
    g.beginPath(); if (p.mouth === 'smile') g.arc(0, 22, 10, .3, Math.PI - .3); else { g.moveTo(-8, 28); g.lineTo(8, 28); } g.stroke(); },
  torsoDeco: (g, tw, th) => { g.beginPath(); g.moveTo(-30, -th); g.quadraticCurveTo(0, -th + 40, 30, -th); g.lineWidth = 4; g.strokeStyle = OL; g.stroke(); rr(g, -34, -70, 68, 40, 8); fs(g, '#4d535a', 3); g.beginPath(); g.moveTo(-10, -th + 20); g.lineTo(-12, -th + 70); g.moveTo(10, -th + 20); g.lineTo(12, -th + 70); g.stroke(); },
};
const RIVAS = {
  skin: '#c08e6c', armC: '#2f3440', legC: '#2a2e38', bootC: '#161616', torso: '#2f3440', tw: 150, handC: '#c08e6c',
  head: (g, p) => { ell(g, 0, 4, 50, 56, '#c08e6c'); ell(g, -50, 8, 9, 13, '#c08e6c', 4); ell(g, 50, 8, 9, 13, '#c08e6c', 4);
    g.beginPath(); g.moveTo(-48, -6); g.quadraticCurveTo(-46, -62, 0, -58); g.quadraticCurveTo(46, -62, 48, -6); g.lineTo(40, -26); g.lineTo(-40, -26); g.closePath(); fs(g, '#1a1a1a', 5);
    eyes(g, 0, 17, p.blink, OL, 5); g.beginPath(); g.moveTo(-28, 22); g.quadraticCurveTo(0, 6, 28, 22); g.lineTo(20, 30); g.quadraticCurveTo(0, 20, -20, 30); g.closePath(); fs(g, '#1a1a1a', 4);
    g.lineWidth = 5; g.strokeStyle = OL; g.beginPath(); g.moveTo(-30, -20); g.lineTo(-8, -16); g.moveTo(30, -20); g.lineTo(8, -16); g.stroke(); },
  torsoDeco: (g, tw, th) => { poly(g, [[-16, -th], [16, -th], [8, -th + 100], [-8, -th + 100]], '#e8e2d2', 0); poly(g, [[-6, -th + 8], [6, -th + 8], [8, -th + 92], [0, -th + 108], [-8, -th + 92]], '#1d2a4a', 3); star(g, -44, -th + 70, 16, 7, '#d7a93a'); },
};
const IGNACIO = {
  skin: '#c49270', armC: '#3d5a7a', legC: '#3d5a7a', bootC: '#2a1e16', torso: '#3d5a7a', handC: '#c49270',
  head: (g, p) => { ell(g, 0, 0, 44, 54, '#c49270'); g.beginPath(); g.moveTo(-44, -4); g.quadraticCurveTo(-44, -60, 0, -58); g.quadraticCurveTo(44, -60, 44, -4); g.lineTo(34, -30); g.lineTo(-34, -30); g.closePath(); fs(g, '#3a2a1e', 5);
    eyes(g, 0, 16, true); g.fillStyle = 'rgba(40,30,20,.3)'; g.beginPath(); g.ellipse(0, 30, 26, 16, 0, 0, 7); g.fill(); },
  torsoDeco: (g, tw, th) => { rr(g, -40, -th + 10, 80, 70, 6); fs(g, '#4a6a8a', 4); g.fillStyle = 'rgba(30,20,10,.35)'; g.beginPath(); g.ellipse(30, -60, 18, 10, .4, 0, 7); g.fill(); },
};
const CLARA = {
  skin: '#e2c0a2', armC: '#9a7ab0', legC: '#5a5060', bootC: '#3a2a2a', torso: '#9a7ab0', tw: 104, handC: '#e2c0a2',
  head: (g, p) => { ell(g, 0, -58, 26, 22, '#e6e6e6', 5); ell(g, 0, 0, 42, 52, '#e2c0a2'); g.beginPath(); g.moveTo(-44, 8); g.quadraticCurveTo(-48, -62, 0, -58); g.quadraticCurveTo(48, -62, 44, 8); g.lineTo(34, -24); g.quadraticCurveTo(0, -36, -34, -24); g.closePath(); fs(g, '#e6e6e6', 5);
    eyes(g, 0, 15, true); g.lineWidth = 3; g.strokeStyle = OL; g.beginPath(); g.arc(-15, 0, 12, 0, 7); g.arc(15, 0, 12, 0, 7); g.stroke(); },
};
// figura sentada de frente (víctimas en su silla)
function seated(g, x, y, s, sp, p = {}, chairCol = '#5a3a2a') {
  g.save(); g.translate(x, y); g.scale(s, s);
  rr(g, -110, -420, 220, 440, 24); fs(g, chairCol, 7); rr(g, -150, -120, 40, 150, 12); fs(g, chairCol, 6); rr(g, 110, -120, 40, 150, 12); fs(g, chairCol, 6);
  const tw = sp.tw || 116, th = sp.th || 190;
  for (const sx of [-1, 1]) { rr(g, sx * 30 - 24, 10, 48, 70, 20); fs(g, sp.legC, 5); limb(g, sx * 30, 70, 0, 150, 38, sp.legC, boot(sp.bootC)); }
  g.beginPath(); g.moveTo(-tw / 2, -th); g.lineTo(tw / 2, -th); g.lineTo(tw / 2 - 6, 30); g.lineTo(-tw / 2 + 6, 30); g.closePath(); fs(g, sp.torso); if (sp.torsoDeco) sp.torsoDeco(g, tw, th);
  g.save(); g.translate(0, -th - 50); g.rotate(p.tilt ?? .18); sp.head(g, p); g.restore();
  limb(g, -tw / 2 + 10, -th + 20, .5, 160, 30, sp.armC, hand(sp.handC || sp.skin)); limb(g, tw / 2 - 10, -th + 20, -.5, 160, 30, sp.armC, hand(sp.handC || sp.skin));
  if (p.holdR) p.holdR(g, tw / 2 - 10 + Math.sin(.5) * 160, -th + 20 + Math.cos(.5) * 160 + 10);
  g.restore();
}
// grulla de papel
function crane(g, x, y, s, { num = null, rot = 0, glow = 0, tailHi = 0 } = {}) {
  g.save(); g.translate(x, y); g.rotate(rot); g.scale(s, s);
  if (glow) { g.save(); g.shadowColor = '#fff6d8'; g.shadowBlur = 50 * glow; poly(g, [[-200, 10], [0, -40], [200, 10], [0, 60]], 'rgba(255,255,255,.01)', 0); g.restore(); }
  poly(g, [[-30, 20], [-230, -20], [-80, 60]], '#efe9da', 5); // cola
  poly(g, [[30, 20], [190, -150], [210, -170], [200, -140], [70, 50]], '#e6dfcc', 5); // cuello
  poly(g, [[195, -160], [250, -150], [205, -140]], '#d9d1bc', 4); // cabeza
  poly(g, [[-90, 30], [0, -10], [90, 30], [0, 90]], '#f4efe2', 6); // cuerpo
  poly(g, [[-10, 0], [-160, -220], [60, 10]], '#faf6ec', 6); // ala izquierda
  poly(g, [[10, 10], [160, -120], [90, 40]], '#ece5d2', 5); // ala derecha
  g.strokeStyle = 'rgba(0,0,0,.15)'; g.lineWidth = 3; g.beginPath(); g.moveTo(-10, 0); g.lineTo(-100, -130); g.moveTo(-90, 30); g.lineTo(0, 90); g.stroke();
  if (tailHi) { g.save(); g.strokeStyle = `rgba(255,40,40,${tailHi})`; g.lineWidth = 7; g.beginPath(); g.moveTo(-200, -10); g.lineTo(-150, 22); g.moveTo(-180, 4); g.lineTo(-130, 34); g.stroke(); g.restore(); }
  if (num) { g.save(); g.translate(-75, -90); g.rotate(-.45); g.font = '86px PM'; g.fillStyle = '#1d3fa8'; g.textAlign = 'center'; g.textBaseline = 'middle'; g.fillText(num, 0, 0); g.restore(); }
  g.restore();
}
// ficha de personaje
function dossier(g, x, y, k, face, lines, opt = {}) {
  if (k <= 0) return; g.save(); g.translate(x, y); g.rotate(opt.rot ?? -.03); g.scale(k, k);
  rr(g, -400, -190, 800, 380, 12); fs(g, '#ece4cf', 7); rr(g, -370, -160, 230, 320, 6); fs(g, '#3a4048', 5);
  g.save(); g.beginPath(); g.rect(-370, -160, 230, 320); g.clip(); g.translate(-255, 30); g.scale(1.6, 1.6); face(g, {}); g.restore();
  g.textAlign = 'left'; g.textBaseline = 'middle'; lines.forEach(([txt, col, sz], i) => { g.font = `${sz || 48}px BB`; g.fillStyle = col || '#1b1b1b'; g.fillText(txt, -110, -110 + i * 66); });
  g.fillStyle = '#c4161c'; g.font = '30px BB'; g.fillText(opt.tag || 'EXPEDIENTE', 170, -150);
  g.restore();
}
// tarjeta de pregunta al público
function question(g, t, t0, title, opts, tc = []) {
  const k = eback(prog(t, t0, t0 + .3)); if (k <= 0) return;
  g.save(); g.translate(W / 2, 800); g.scale(k, k); rr(g, -460, -430, 920, 860, 30); fs(g, '#12161c', 8);
  g.font = '92px LG'; g.textAlign = 'center'; g.textBaseline = 'middle'; g.fillStyle = '#ffd21f'; g.lineWidth = 12; g.strokeStyle = '#000'; g.strokeText(title, 0, -330); g.fillText(title, 0, -330);
  opts.forEach(([letter, txt], i) => { const kk = eback(prog(t, tc[i] ?? t0, (tc[i] ?? t0) + .25)); if (kk <= 0) return; g.save(); g.translate(0, -170 + i * 170); g.scale(kk, kk);
    rr(g, -400, -64, 800, 128, 64); fs(g, '#f2efe6', 6); ell(g, -330, 0, 46, 46, ['#47c6ff', '#ffb52e', '#ff4a3d'][i], 5);
    g.font = '64px LG'; g.fillStyle = '#fff'; g.fillText(letter, -330, 4); g.font = '52px BB'; g.fillStyle = '#1b1b1b'; g.textAlign = 'left'; g.fillText(txt, -260, 4); g.textAlign = 'center'; g.restore(); });
  g.restore();
}
function commentIcon(g, x, y, k) { if (k <= 0) return; g.save(); g.translate(x, y); g.scale(k, k); rr(g, -150, -70, 300, 140, 40); fs(g, '#fff', 6); poly(g, [[-80, 66], [-30, 66], [-90, 120]], '#fff', 0); g.font = '56px LG'; g.fillStyle = '#ff2b6a'; g.textAlign = 'center'; g.textBaseline = 'middle'; g.fillText('COMENTA', 0, 4); g.restore(); }
// fondos
function rain(g, t, a = .35, n = 160) { g.strokeStyle = `rgba(190,210,230,${a})`; g.lineWidth = 3; g.beginPath(); for (let i = 0; i < n; i++) { const x = (srnd(i) * W + t * 120) % W, y = (srnd(i + 7) * H + t * 1600 * (.8 + srnd(i + 3) * .4)) % H; g.moveTo(x, y); g.lineTo(x - 10, y + 46); } g.stroke(); }
function office(g, t, dark = 0) {
  g.fillStyle = '#2a2f36'; g.fillRect(0, 0, W, H);
  rr(g, 560, 220, 440, 560, 6); fs(g, '#1a2028', 7); g.fillStyle = 'rgba(255,214,150,.18)'; for (let i = 0; i < 12; i++) g.fillRect(570, 240 + i * 45, 420, 22);
  rr(g, 70, 260, 440, 420, 8); fs(g, '#a07a50', 7); [[120, 300], [300, 320], [180, 470], [370, 500]].forEach(([x, y], i) => { rr(g, x, y, 100, 120, 3); fs(g, '#ece4cf', 3); ell(g, x + 50, y - 4, 8, 8, '#c4161c', 0); });
  g.strokeStyle = '#c4161c'; g.lineWidth = 3; g.beginPath(); g.moveTo(170, 300); g.lineTo(350, 320); g.lineTo(230, 470); g.lineTo(420, 500); g.stroke();
  g.save(); g.shadowColor = '#ffcf7a'; g.shadowBlur = 60; poly(g, [[760, 980], [860, 980], [830, 930], [790, 930]], '#2a5a3a', 5); g.restore();
  const lg = g.createRadialGradient(810, 1060, 0, 810, 1060, 420); lg.addColorStop(0, 'rgba(255,200,120,.35)'); lg.addColorStop(1, 'rgba(0,0,0,0)'); g.fillStyle = lg; g.fillRect(0, 600, W, 900);
  rr(g, -20, 1080, 1120, 60, 6); fs(g, '#4a3424', 8); g.fillStyle = '#2a1e14'; g.fillRect(0, 1140, W, 800); g.lineWidth = 6; g.strokeStyle = OL; g.beginPath(); g.moveTo(0, 1140); g.lineTo(W, 1140); g.stroke();
  for (let i = 0; i < 3; i++) { rr(g, 120 + i * 30, 1040 - i * 18, 260, 40, 3); fs(g, ['#c9b48f', '#b8a07a', '#d6c4a0'][i], 4); }
  if (dark) { g.fillStyle = `rgba(0,0,0,${dark})`; g.fillRect(0, 0, W, H); }
}
function workshop(g, t, dark = 0) {
  g.fillStyle = '#3a3e3a'; g.fillRect(0, 0, W, H);
  rr(g, 60, 220, 960, 500, 6); fs(g, '#5a5040', 6); g.fillStyle = 'rgba(0,0,0,.35)'; for (let y = 250; y < 700; y += 40) for (let x = 90; x < 1000; x += 40) g.fillRect(x, y, 6, 6);
  [[160, 300, 'w'], [300, 280, 'h'], [460, 310, 'w'], [640, 290, 's'], [820, 300, 'h']].forEach(([x, y, k]) => { g.save(); g.translate(x, y); if (k === 'w') { rr(g, -10, 0, 20, 160, 6); fs(g, '#9aa0a6', 4); ell(g, 0, 0, 26, 18, '#9aa0a6', 4); } else if (k === 'h') { rr(g, -8, 20, 16, 150, 6); fs(g, '#6b4a2b', 4); rr(g, -40, 0, 80, 34, 6); fs(g, '#5a5f66', 4); } else { rr(g, -6, 0, 12, 180, 6); fs(g, '#c4161c', 4); } g.restore(); });
  rr(g, 0, 820, W, 70, 4); fs(g, '#6b4a2b', 7); g.fillStyle = '#2a2622'; g.fillRect(0, 890, W, H); g.fillStyle = 'rgba(0,0,0,.25)'; g.beginPath(); g.ellipse(700, 1500, 300, 60, 0, 0, 7); g.fill();
  if (dark) { g.fillStyle = `rgba(0,0,0,${dark})`; g.fillRect(0, 0, W, H); }
}
function ledger(g, x, y, s, t, tear = 1) {
  g.save(); g.translate(x, y); g.scale(s, s); rr(g, -460, -320, 920, 640, 10); fs(g, '#5a3a22', 8);
  rr(g, -440, -300, 430, 600, 4); fs(g, '#efe6cf', 4); rr(g, 10, -300, 430, 600, 4); fs(g, '#efe6cf', 4);
  g.font = '40px BB'; g.fillStyle = '#1b2a6a'; g.textAlign = 'left'; g.fillText('MARZO · HACE 6 AÑOS', -420, -250);
  g.fillStyle = 'rgba(30,40,90,.55)'; for (let i = 0; i < 9; i++) { g.fillRect(-420, -200 + i * 52, 220 + (i * 37) % 140, 8); g.fillRect(-140, -200 + i * 52, 100, 8); }
  if (tear) { g.fillStyle = '#5a3a22'; g.beginPath(); g.moveTo(20, -300); for (let i = 0; i <= 24; i++) g.lineTo(20 + (i % 2 ? 22 : 6), -300 + i * 25); g.lineTo(440, 300); g.lineTo(440, -300); g.fill(); g.strokeStyle = '#e9dfc4'; g.lineWidth = 6; g.beginPath(); g.moveTo(20, -300); for (let i = 0; i <= 24; i++) g.lineTo(20 + (i % 2 ? 22 : 6), -300 + i * 25); g.stroke(); }
  g.restore();
}
function nightKitchen(g, t, lamp = 1) {
  kitchen(g, t, .45); g.fillStyle = 'rgba(10,20,45,.35)'; g.fillRect(0, 0, W, H);
  g.fillStyle = '#0d1424'; g.fillRect(646, 606, 288, 288); g.lineWidth = 6; g.strokeStyle = OL; g.beginPath(); g.moveTo(790, 600); g.lineTo(790, 900); g.moveTo(640, 750); g.lineTo(940, 750); g.stroke(); rain(g, t, .15, 30);
  if (lamp) { g.save(); g.lineWidth = 4; g.strokeStyle = '#222'; g.beginPath(); g.moveTo(540, 0); g.lineTo(540, 560); g.stroke(); poly(g, [[470, 560], [610, 560], [580, 520], [500, 520]], '#3a3a3a', 5); g.restore();
    const lg = g.createRadialGradient(540, 980, 0, 540, 980, 640); lg.addColorStop(0, `rgba(255,200,120,${.42 * lamp})`); lg.addColorStop(1, 'rgba(0,0,0,0)'); g.fillStyle = lg; g.fillRect(0, 300, W, 1300); }
}
function table(g, y = 1180) { rr(g, 100, y, 880, 50, 8); fs(g, '#6b4a2b', 7); g.fillStyle = '#4a3220'; g.fillRect(150, y + 50, 30, 400); g.fillRect(900, y + 50, 30, 400); }
function emptyChair(g, x, y, s = 1) { g.save(); g.translate(x, y); g.scale(s, s); rr(g, -90, -300, 180, 300, 14); fs(g, '#5a3a22', 6); rr(g, -100, -10, 200, 40, 8); fs(g, '#5a3a22', 6); g.restore(); }
function photoFrame(g, x, y, s, face) { g.save(); g.translate(x, y); g.scale(s, s); rr(g, -80, -100, 160, 200, 6); fs(g, '#b8862f', 6); rr(g, -62, -82, 124, 164, 4); fs(g, '#d8d0c0', 3); g.save(); g.beginPath(); g.rect(-62, -82, 124, 164); g.clip(); g.translate(0, 10); g.scale(.9, .9); face(g, {}); g.restore(); g.restore(); }
const ELENA_HEAD = (g, p) => { g.beginPath(); g.moveTo(-50, 70); g.quadraticCurveTo(-60, -64, 0, -60); g.quadraticCurveTo(60, -64, 50, 70); g.closePath(); fs(g, '#5a3220', 5); ell(g, 0, 0, 40, 50, '#e2b48c'); eyes(g, 0, 15, false); g.lineWidth = 4; g.strokeStyle = OL; g.beginPath(); g.arc(0, 20, 12, .3, Math.PI - .3); g.stroke(); };
