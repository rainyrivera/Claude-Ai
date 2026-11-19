// ================= CELULAR LLENO: NO SON TUS FOTOS, ES WHATSAPP =================
const K = { lleno: PS(0), borrando: PS(1), espera: PS(2), noson: PS(3), wa: PS(4), explico: PS(5), config: PS(6), wifi: PS(7), datos: PS(8), chats: PS(9), grupos: PS(10), buenos: PS(11), reenv: PS(12), guarda: PS(13), gigas: PS(14),
  p1: PS(15), abre: PS(16), ajustes: PS(17), p2: PS(18), busca: PS(19), desact: PS(20), conDatos: PS(21), iphone: PS(22), hoy: PS(23), p3: T('tres'), mismo: PS(24), admin: PS(25), arriba: PS(26), abajo: PS(27),
  p4: PS(28), borra: PS(29), entra: PS(30), p5: PS(31), ojo: PS(32), noborra: PS(33), solo: PS(34), guarda2: PS(35), p6: PS(36), papelera: PS(37), queda: PS(38), cinco: PS(39), cuanto: PS(40), leo: PS(41) };
(function () { const x = WT.x; x.fillStyle = '#f3e6cf'; x.fillRect(0, 0, 1024, 406); x.fillStyle = '#9fd6f2'; x.fillRect(pxx(-.4), py(2.1), 150, 110); x.strokeStyle = '#fff'; x.lineWidth = 10; x.strokeRect(pxx(-.4), py(2.1), 150, 110); WT.tx.needsUpdate = true; })();
// ---- casa: sofá y papelera ----
{ const so = add(new THREE.Group()); so.position.set(-.6, .15, -1.1); const b = M(new THREE.BoxGeometry(1.8, .45, .8), lp(0x4a6fa5)); b.position.y = .22; const bk = M(new THREE.BoxGeometry(1.8, .6, .2), lp(0x4a6fa5)); bk.position.set(0, .6, -.3); so.add(b, bk); }
const bin = add(new THREE.Group()); bin.position.set(1.0, .15, -.4); { const c = M(new THREE.CylinderGeometry(.22, .17, .5, 16, 1, true), lp(0x8a8f99)); c.position.y = .25; const bt = M(new THREE.CylinderGeometry(.17, .17, .02, 16), lp(0x8a8f99)); bin.add(c, bt); }
function iconTex(kind, col) { const c = canvasTex(128, 128), x = c.x; x.fillStyle = col; rrp(x, 0, 4, 4, 120, 120, 22); x.fill(); x.fillStyle = '#fff'; x.strokeStyle = '#fff'; x.lineWidth = 8;
  if (kind === 'foto') { x.beginPath(); x.moveTo(20, 100); x.lineTo(55, 55); x.lineTo(80, 85); x.lineTo(95, 70); x.lineTo(110, 100); x.closePath(); x.fill(); x.beginPath(); x.arc(90, 38, 12, 0, 6.29); x.fill(); }
  if (kind === 'video') { x.beginPath(); x.moveTo(45, 32); x.lineTo(95, 64); x.lineTo(45, 96); x.closePath(); x.fill(); }
  if (kind === 'audio') { for (let i = 0; i < 6; i++) { const h = [20, 50, 70, 40, 60, 25][i]; x.fillRect(22 + i * 15, 64 - h / 2, 9, h); } }
  if (kind === 'fam') { x.beginPath(); x.arc(45, 50, 16, 0, 6.29); x.arc(85, 50, 16, 0, 6.29); x.fill(); x.fillRect(25, 72, 40, 34); x.fillRect(65, 72, 40, 34); }
  c.tx.needsUpdate = true; return new THREE.MeshBasicMaterial({ map: c.tx, transparent: true, side: THREE.DoubleSide }); }
const ICM = [iconTex('foto', '#3d8bff'), iconTex('video', '#ff4d61'), iconTex('audio', '#a98bff'), iconTex('fam', '#35d39a')];
const media = []; for (let i = 0; i < 24; i++) { const m = new THREE.Mesh(new THREE.PlaneGeometry(.42, .42), ICM[i % 3]); scene.add(m); media.push(m); }
const famPh = []; for (let i = 0; i < 5; i++) { const m = new THREE.Mesh(new THREE.PlaneGeometry(.22, .22), ICM[3]); scene.add(m); famPh.push(m); }
// ---- celular gigante ----
const X0 = 30; add(M(new THREE.CylinderGeometry(4.2, 4.4, .4, 40), lp(0xd6dbe4))).position.set(X0, -.2, 0);
const SC = canvasTex(512, 1024);
const BIG = add(new THREE.Group()); BIG.position.set(X0, 2.75, -.3);
{ const b = rbox(1.75, 3.45, .16, .12, mat(0x1b1e27, { roughness: .35 })); BIG.add(b); const s = M(new THREE.PlaneGeometry(1.6, 3.2), new THREE.MeshBasicMaterial({ map: SC.tx, color: 0xd8d8d8, toneMapped: false }), false); s.position.z = .135; BIG.add(s); }
const bigL = new THREE.PointLight(0xfff4e0, 0, 14, 1.2); bigL.position.set(X0 + .5, 3.5, 4); scene.add(bigL);
const smallPh = add(rbox(.1, .18, .02, .01, lp(0x1b1e27)));
// ---- pantalla ----
const GB = (t) => { // GB usados (ejemplo)
  if (t < K.config) return 63.4; if (t < K.p1) return 63.4 + .0; if (t < K.borra + 1) return 63.4; return Math.max(55.2, 63.4 - (t - K.borra - 1) * 1.6); };
let tapAt = null;
function hdr(x, title, col = '#1aa86a') { x.fillStyle = col; x.fillRect(0, 0, 512, 120); x.fillStyle = '#fff'; let fs = 38; x.font = `800 ${fs}px M`; const w = x.measureText(title).width; if (w > 432) { fs = Math.floor(fs * 432 / w); x.font = `800 ${fs}px M`; } x.textAlign = 'left'; x.textBaseline = 'middle'; x.fillText(title, 40, 72); }
function row(x, y, text, sub, hl, right) { if (hl) { x.fillStyle = 'rgba(255,204,51,.45)'; x.fillRect(0, y - 46, 512, 92); } x.fillStyle = '#2a2c33'; x.font = '800 30px M'; x.textAlign = 'left'; x.textBaseline = 'middle'; x.fillText(text, 40, sub ? y - 12 : y); if (sub) { x.font = '600 22px M'; x.fillStyle = '#7a8090'; x.fillText(sub, 40, y + 22); } if (right) { x.textAlign = 'right'; x.font = '800 26px M'; x.fillStyle = right.c || '#5a6070'; x.fillText(right.t, 476, y); } x.fillStyle = '#e4e7ee'; x.fillRect(40, y + 45, 432, 2); }
function toggle(x, y, on) { x.fillStyle = on ? '#1aa86a' : '#c7ccd6'; rrp(x, 0, 392, y - 22, 84, 44, 22); x.fill(); x.fillStyle = '#fff'; x.beginPath(); x.arc(on ? 454 : 414, y, 18, 0, 6.29); x.fill(); }
function storageBar(x, y, gb, total = 64) { const f = gb / total; x.fillStyle = '#e4e7ee'; rrp(x, 0, 40, y, 432, 34, 17); x.fill(); x.fillStyle = f > .95 ? '#ff4d61' : f > .85 ? '#f6b445' : '#35d39a'; rrp(x, 0, 40, y, Math.max(34, 432 * f), 34, 17); x.fill(); x.fillStyle = '#2a2c33'; x.font = '800 26px M'; x.textAlign = 'center'; x.fillText(gb.toFixed(1) + ' GB de ' + total + ' GB', 256, y + 70); }
function drawScreen(t) {
  const x = SC.x; x.fillStyle = '#f7f8fb'; x.fillRect(0, 0, 512, 1024); tapAt = null;
  if (t < K.config) { // galería / aviso lleno
    x.fillStyle = '#0d1730'; x.fillRect(0, 0, 512, 1024); for (let i = 0; i < 12; i++) { const gone = t > K.borrando + .6 + i * .25 && i < 5; if (gone) continue; x.fillStyle = ['#3d8bff', '#35d39a', '#ff8a3d', '#a98bff'][i % 4]; rrp(x, 0, 30 + (i % 3) * 156, 150 + Math.floor(i / 3) * 156, 140, 140, 14); x.fill(); }
    if (t > .3) { x.fillStyle = '#fff'; rrp(x, 0, 40, 380, 432, 260, 28); x.fill(); x.fillStyle = '#e8383a'; x.font = '900 40px M'; x.textAlign = 'center'; x.textBaseline = 'middle'; x.fillText('ALMACENAMIENTO', 256, 450); x.fillText('LLENO', 256, 500); storageBar(x, 540, 63.4); }
  } else if (t < K.p1) { // chats y grupos que mandan cosas
    hdr(x, 'WhatsApp'); const items = [['Grupo Familia', 'Video: Buenos días', '12'], ['Grupo Trabajo', 'Meme reenviado', '34'], ['Grupo Vecinos', 'Video reenviado muchas veces', '58'], ['Mamá', 'Foto', '3'], ['Grupo Iglesia', 'Audio', '21'], ['Grupo Colegio', 'Video', '17']];
    items.forEach(([a, b, n], i) => { const y = 200 + i * 110; x.fillStyle = ['#35d39a', '#3d8bff', '#ff8a3d', '#a98bff', '#f6b445', '#ff4d61'][i]; x.beginPath(); x.arc(76, y, 36, 0, 6.29); x.fill(); x.fillStyle = '#2a2c33'; x.font = '800 28px M'; x.textAlign = 'left'; x.textBaseline = 'middle'; x.fillText(a, 130, y - 14); x.font = '600 22px M'; x.fillStyle = '#7a8090'; x.fillText(b, 130, y + 20); x.fillStyle = '#1aa86a'; x.beginPath(); x.arc(450, y, 22, 0, 6.29); x.fill(); x.fillStyle = '#fff'; x.font = '800 20px M'; x.textAlign = 'center'; x.fillText(n, 450, y + 1); });
    const gb = 40 + 23.4 * clamp((t - K.config) / (K.gigas + 2 - K.config)); x.fillStyle = '#fff'; x.fillRect(0, 870, 512, 154); storageBar(x, 890, gb);
  } else if (t < K.p2) { // ajustes
    hdr(x, 'Ajustes'); ['Cuenta', 'Privacidad', 'Chats', 'Notificaciones', 'Almacenamiento y datos', 'Ayuda'].forEach((s, i) => row(x, 200 + i * 104, s, null, i === 4 && t > K.ajustes + 1.2, { t: '›' })); if (inn(t, K.ajustes + 2.2, K.ajustes + 3)) tapAt = [256, 616];
  } else if (t < K.p3) { // descarga automática
    hdr(x, 'Almacenamiento y datos'); x.fillStyle = '#1aa86a'; x.font = '800 26px M'; x.textAlign = 'left'; x.fillText('DESCARGA AUTOMÁTICA', 40, 170);
    const iph = inn(t, K.iphone, K.hoy);
    ['Fotos', 'Audios', 'Videos', 'Documentos'].forEach((s, i) => { const y = 250 + i * 104; row(x, y, s, iph ? null : 'Datos móviles y WiFi', inn(t, K.desact + i * .9, K.desact + i * .9 + .9)); if (iph) { x.textAlign = 'right'; x.font = '800 26px M'; x.fillStyle = '#e8383a'; x.fillText('Nunca', 476, y); } else toggle(x, y, t < K.desact + .4 + i * .9); });
    if (t > K.hoy) { x.fillStyle = '#1aa86a'; rrp(x, 0, 40, 720, 432, 120, 24); x.fill(); x.fillStyle = '#fff'; x.font = '900 30px M'; x.textAlign = 'center'; x.fillText('Solo se baja', 256, 765); x.fillText('lo que tú toques', 256, 805); }
  } else if (t < K.p5) { // administrar almacenamiento
    hdr(x, 'Administrar almacenamiento'); const gb = t < K.borra + 1 ? 8.2 : Math.max(2.4, 8.2 - (t - K.borra - 1) * 1.1); x.fillStyle = '#2a2c33'; x.font = '900 34px M'; x.textAlign = 'left'; x.fillText('WhatsApp usa ' + gb.toFixed(1) + ' GB', 40, 180);
    const sel = t > K.entra + 1.2; const del = t > K.entra + 3.0;
    row(x, 280, 'Más de 5 MB', 'Archivos grandes', inn(t, K.borra, K.borra + 1.6), { t: del ? '0 B' : '2.3 GB', c: '#e8383a' }); row(x, 384, 'Reenviados', 'Muchas veces',  inn(t, K.borra + 1.6, K.entra), { t: del ? '0 B' : '1.1 GB', c: '#e8383a' });
    x.fillStyle = '#7a8090'; x.font = '800 22px M'; x.textAlign = 'left'; x.fillText('CHATS', 40, 470);
    [['Grupo Vecinos', '2.1 GB'], ['Grupo Familia', '1.4 GB'], ['Grupo Trabajo', '0.9 GB'], ['Grupo Colegio', '0.4 GB']].forEach(([a, b], i) => { const y = 540 + i * 104; row(x, y, a, null, inn(t, K.abajo, K.p4) && i === 0, { t: del && i === 0 ? '0.2 GB' : b }); if (sel && i === 0 && t < K.p5) { for (let k = 0; k < 3; k++) { x.fillStyle = '#1aa86a'; x.beginPath(); x.arc(330 - k * 40, y, 14, 0, 6.29); x.fill(); } } });
    if (inn(t, K.entra + 2.6, K.entra + 3.2)) tapAt = [256, 540];
  } else if (t < K.p6) { // chat: mensajes quedan
    hdr(x, 'Grupo Familia'); const b = (y, txt, me) => { x.fillStyle = me ? '#d9fdd3' : '#fff'; rrp(x, 0, me ? 160 : 30, y, 320, 70, 16); x.fill(); x.fillStyle = '#2a2c33'; x.font = '700 24px M'; x.textAlign = 'left'; x.fillText(txt, (me ? 160 : 30) + 20, y + 38); };
    x.fillStyle = '#efe7de'; x.fillRect(0, 120, 512, 904); b(170, '¡Buenos días!', 0); b(260, 'Ya llegué 🙂'.replace('🙂', ''), 1); b(350, '¿A qué hora es?', 0);
    x.fillStyle = '#c7ccd6'; rrp(x, 0, 30, 440, 320, 160, 16); x.fill(); x.fillStyle = '#7a8090'; x.font = '800 22px M'; x.fillText('Archivo eliminado', 60, 525); b(620, 'A las 5', 1);
    if (t > K.guarda2) { x.fillStyle = '#1aa86a'; rrp(x, 0, 40, 760, 432, 100, 24); x.fill(); x.fillStyle = '#fff'; x.font = '900 28px M'; x.textAlign = 'center'; x.fillText('Lo importante: guárdalo antes', 256, 812); }
  } else if (t < K.cinco) { // papelera de la galería
    hdr(x, 'Galería · Papelera', '#3d8bff'); const vac = t > K.queda + 3.2; for (let i = 0; i < 9; i++) { if (vac) break; x.fillStyle = ['#3d8bff', '#35d39a', '#ff8a3d'][i % 3]; rrp(x, 0, 30 + (i % 3) * 156, 160 + Math.floor(i / 3) * 156, 140, 140, 14); x.fill(); }
    x.fillStyle = vac ? '#1aa86a' : '#e8383a'; rrp(x, 0, 40, 680, 432, 90, 45); x.fill(); x.fillStyle = '#fff'; x.font = '900 32px M'; x.textAlign = 'center'; x.fillText(vac ? '✔ Papelera vacía' : 'Vaciar papelera', 256, 728); if (inn(t, K.queda + 2.6, K.queda + 3.2)) tapAt = [256, 725];
  } else { // resultado
    x.fillStyle = '#0d1730'; x.fillRect(0, 0, 512, 1024); x.fillStyle = '#fff'; rrp(x, 0, 40, 300, 432, 360, 28); x.fill(); x.fillStyle = '#1aa86a'; x.font = '900 52px M'; x.textAlign = 'center'; x.fillText('+ 8.2 GB', 256, 400); x.font = '800 30px M'; x.fillStyle = '#2a2c33'; x.fillText('libres (ejemplo)', 256, 450); storageBar(x, 500, 55.2); }
  if (tapAt) { x.strokeStyle = 'rgba(255,204,51,.9)'; x.lineWidth = 8; x.beginPath(); x.arc(tapAt[0], tapAt[1], 30 + ((t * 3) % 1) * 30, 0, 6.29); x.stroke(); }
  SC.tx.needsUpdate = true;
}
// ---- cámara ----
const MC = V(X0, 2.75, -.3);
SHOTS = [
  [0, K.espera, [1.0, 2.0, 4.2], [.6, 1.8, 3.6], [-.4, .9, -.8], [-.3, .9, -.8]],
  [K.espera, K.explico, [1.6, 2.4, 6.0], [1.2, 2.3, 5.6], [0, 1.0, -.6], [0, 1.0, -.6]],
  [K.explico, K.gigas, [X0 + 1.2, 2.6, 9.4], [X0 + .6, 2.3, 8.4], [X0, 1.9, 0], [X0, 1.85, 0]],
  [K.gigas, K.p1, [X0, 2.7, 5.8], [X0, 2.7, 5.4], [X0, 2.4, -.3], [X0, 2.4, -.3]],
  [K.p1, K.p3, [X0, 2.7, 5.6], [X0, 2.65, 5.2], [X0, 2.4, -.3], [X0, 2.4, -.3]],
  [K.p3, K.p5, [X0, 2.7, 5.6], [X0, 2.65, 5.2], [X0, 2.4, -.3], [X0, 2.4, -.3]],
  [K.p5, K.p6, [X0 - .8, 2.6, 7.6], [X0 - .3, 2.6, 6.6], [X0, 2.3, -.3], [X0, 2.3, -.3]],
  [K.p6, K.cinco, [X0, 2.7, 5.6], [X0, 2.65, 5.2], [X0, 2.4, -.3], [X0, 2.4, -.3]],
  [K.cinco, 200, [X0 + 1.6, 3.0, 10.4], [X0 + 1.0, 2.6, 9.4], [X0, 1.8, -.3], [X0, 1.9, -.3]],
];
function animWorld(t) {
  skyDay(t); drawScreen(t); bigL.intensity = t >= K.explico ? 3.2 : 0;
  // fotos de la familia que se van a la papelera
  famPh.forEach((m, i) => { const u = clamp((t - K.borrando - .6 - i * .25) / .9); m.visible = u > 0 && u < 1; const a = V(-.25, 1.45, -.35), b = V(1.0, .55, -.4); const p = a.clone().lerp(b, eio(u)); p.y += Math.sin(u * Math.PI) * .5; m.position.copy(p); m.rotation.z = u * 4; m.lookAt(cam.position); });
  // multimedia que cae en el celular gigante
  media.forEach((m, i) => { const st = K.config + .3 + i * ((K.gigas + 1.5 - K.config) / 24); const u = clamp((t - st) / 1.3); m.visible = u > 0 && u < 1 && t < K.p1; const sx = X0 + ((i * 37) % 7 - 3) * .7, sy = 6.5; const p = V(lerp(sx, X0 + ((i % 5) - 2) * .25, eio(u)), lerp(sy, 2.6, eio(u)), lerp(.5, -.15, u)); m.position.copy(p); m.scale.setScalar(1 - u * .6); m.lookAt(cam.position); });
  // ---- personajes ----
  let op = [-.4, .15, -.85], ory = .3, p = { emo: 'sad' }, ev = false, ep = [0, 0, 0], ery = 0, e = { emo: 'neutral' };
  const holdPh = { armR: [-1.3, -.2, -.5], armL: [-.4, .15, -.3], look: [0, -.6], headRx: .3 }, point = (a = -2.3) => ({ armR: [a, -.3, -.2], armL: [-.2, .15, -.3] });
  if (t < K.espera) { p = { emo: t > K.borrando ? 'sad' : 'worried', ...holdPh }; }
  else if (t < K.explico) { p = { emo: 'surprised', ...holdPh }; ev = true; ep = [1.0, .15, .2]; ery = -.5; e = { emo: t > K.wa ? 'determined' : 'neutral', ...point(-2.2) }; }
  else if (t < K.cinco) { op = [X0 - 1.6, 0, 1.3]; ory = .5; p = { emo: inn(t, K.buenos, K.p1) ? 'surprised' : t > K.p4 ? 'happy' : 'determined', ...point(-1.9), headRy: .2 }; ev = inn(t, K.explico, K.p1) || inn(t, K.ojo, K.p6); ep = [X0 + 1.6, 0, 1.3]; ery = -.5; e = { emo: 'determined', ...point(-2.0), headRy: -.2 }; }
  else { op = [X0 - 1.5, 0, 1.4]; ory = .4; p = { emo: 'happy', armR: [-2.6, -.35, -.2 + .3 * Math.sin(t * 8)], armL: [-.2, .15, -.3] }; ev = true; ep = [X0 + 1.5, 0, 1.4]; ery = -.4; e = { emo: 'happy', armL: [-.9, .3, -.6] }; }
  owner.root.position.set(...op); owner.root.rotation.y = ory; pose(owner, p, t);
  eng.root.visible = ev; eng.root.position.set(...ep); eng.root.rotation.y = ery; pose(eng, e, t + 1.3); wrench.visible = false; engCB.visible = true;
  smallPh.visible = t < K.explico; owner.root.updateMatrixWorld(true); smallPh.position.copy(owner.hand[1].getWorldPosition(new THREE.Vector3())).add(V(0, .08, .02)); smallPh.rotation.y = ory;
  // etiquetas (abajo, para no tapar la pantalla gigante)
  OVL.length = 0; const Lb = (text, at, end, pos, color = '#ffcc33') => { if (t >= at && t < end) OVL.push({ text, at, end, pos, color }); };
  const HT = V(0, 2.9, -.6), LO = V(X0, -.6, .6);
  Lb('ALMACENAMIENTO LLENO', .1, K.borrando, HT, '#ff6a4a'); Lb('✖ NO BORRES TUS FOTOS', K.borrando, K.espera, HT, '#ff6a4a'); Lb('¡ESPERA!', K.espera, K.wa, HT, '#ff6a4a'); Lb('ES WHATSAPP', K.wa, K.explico, HT, '#7be36b');
  Lb('DESCARGA SOLO', K.config, K.chats, LO, '#ff8a4a'); Lb('DE TODOS LOS GRUPOS', K.grupos, K.buenos, LO, '#ff8a4a'); Lb('BUENOS DÍAS · MEMES', K.buenos, K.reenv, LO); Lb('REENVIADOS MIL VECES', K.reenv, K.guarda, LO); Lb('SIN QUE LO PIDAS', K.guarda, K.gigas, LO, '#ff6a4a'); Lb('GIGAS Y GIGAS', K.gigas, K.p1, LO, '#ff6a4a');
  Lb('PASO 1: AJUSTES', K.p1, K.p2, LO); Lb('PASO 2: DESCARGA AUTOMÁTICA', K.p2, K.iphone, LO); Lb('IPHONE: NUNCA', K.iphone, K.hoy, LO, '#6cc4ff'); Lb('PASO 3: ADMINISTRAR', K.p3, K.p4, LO); Lb('PASO 4: BORRA LO GRANDE', K.p4, K.p5, LO, '#7be36b');
  Lb('PASO 5: TUS CHATS SE QUEDAN', K.p5, K.p6, LO, '#7be36b'); Lb('PASO 6: VACÍA LA PAPELERA', K.p6, K.cinco, LO); Lb('GIGAS LIBRES, FOTOS INTACTAS', K.cinco, K.cuanto, LO, '#7be36b'); Lb('¿CUÁNTO OCUPABA EL TUYO?', K.cuanto + .1, CTA_ST, LO, '#ff8a4a');
}
function overlay2d(t) {}
const KEYW = new Set(['lleno', 'fotos', 'whatsapp', 'descargar', 'wifi', 'datos', 'grupos', 'memes', 'reenviado', 'gigas', 'ajustes', 'almacenamiento', 'automática', 'desactiva', 'nunca', 'administrar', 'grandes', 'borra', 'bórralos', 'conversaciones', 'guárdalo', 'papelera', 'galería', 'vacías', 'comentarios']);
