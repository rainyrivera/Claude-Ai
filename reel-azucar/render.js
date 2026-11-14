// Renderiza scene.html cuadro por cuadro con Chromium headless y lo codifica con ffmpeg.
// Uso: node render.js            -> video.mp4 (sin audio)
//      STILLS=1,8,20 node render.js -> capturas de prueba
const http = require('http'), fs = require('fs'), path = require('path'), { spawn } = require('child_process');
const { chromium } = require('playwright');

const root = __dirname;
const types = { '.html': 'text/html', '.js': 'text/javascript', '.woff2': 'font/woff2' };
const srv = http.createServer((q, r) => {
  const p = path.join(root, decodeURIComponent(q.url.split('?')[0]));
  if (!p.startsWith(root)) { r.writeHead(403); return r.end(); }
  fs.readFile(p, (e, d) => {
    if (e) { r.writeHead(404); return r.end(); }
    r.writeHead(200, { 'Content-Type': types[path.extname(p)] || 'application/octet-stream' }); r.end(d);
  });
}).listen(8765, '127.0.0.1');

(async () => {
  const FPS = +(process.env.FPS || 30), DUR = 42.2;
  const start = +(process.env.START || 0), end = +(process.env.END || DUR), out = process.env.OUT || 'video.mp4';
  const browser = await chromium.launch({ args: ['--use-angle=swiftshader', '--enable-unsafe-swiftshader', '--ignore-gpu-blocklist'] });
  const page = await browser.newPage({ viewport: { width: 1080, height: 1920 }, deviceScaleFactor: 1 });
  page.on('console', m => console.log('page:', m.text()));
  page.on('pageerror', e => console.log('PAGE ERROR:', e.message));
  await page.goto('http://127.0.0.1:8765/scene.html');
  await page.waitForFunction(() => window.ready === true, null, { timeout: 60000 });

  if (process.env.STILLS) {
    for (const t of process.env.STILLS.split(',')) {
      await page.evaluate(t => window.renderAt(t), +t);
      await page.screenshot({ path: `still_${t}.jpg`, type: 'jpeg', quality: 80 });
    }
  } else {
    const ff = spawn('ffmpeg', ['-y', '-loglevel', 'error', '-f', 'image2pipe', '-framerate', String(FPS), '-c:v', 'mjpeg', '-i', '-',
      '-c:v', 'libx264', '-pix_fmt', 'yuv420p', '-crf', '18', '-preset', 'medium', out], { stdio: ['pipe', 'inherit', 'inherit'] });
    const n = Math.round((end - start) * FPS);
    for (let i = 0; i < n; i++) {
      const t = start + i / FPS;
      await page.evaluate(t => window.renderAt(t), t);
      const buf = await page.screenshot({ type: 'jpeg', quality: 92 });
      if (!ff.stdin.write(buf)) await new Promise(r => ff.stdin.once('drain', r));
      if (i % 90 === 0) console.log(`frame ${i}/${n}`);
    }
    ff.stdin.end();
    await new Promise(r => ff.on('close', r));
  }
  await browser.close(); srv.close();
})();
