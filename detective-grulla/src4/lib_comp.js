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
