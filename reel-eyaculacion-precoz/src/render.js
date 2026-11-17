// Uso: node render.js preview 0.5,3,8 outdir   |   node render.js full out.mp4
const { chromium } = require('playwright');
const http = require('http'), fs = require('fs'), path = require('path'), { spawn } = require('child_process');
const root = __dirname, [, , mode, a, b] = process.argv;
const types = { '.js': 'text/javascript', '.html': 'text/html', '.json': 'application/json', '.woff2': 'font/woff2' };
const srv = http.createServer((q, r) => { const f = path.join(root, decodeURIComponent(q.url.split('?')[0])); fs.readFile(f, (e, d) => { if (e) { r.writeHead(404); r.end(); return; } r.writeHead(200, { 'Content-Type': types[path.extname(f)] || 'application/octet-stream' }); r.end(d); }); }).listen(8766);
(async () => {
  const br = await chromium.launch(); const pg = await br.newPage({ viewport: { width: 1080, height: 1920 } });
  pg.on('console', m => console.log('PAGE:', m.text())); pg.on('pageerror', e => console.log('ERR:', e.message));
  await pg.goto('http://localhost:8766/index.html'); await pg.waitForFunction('window.READY === true', null, { timeout: 60000 });
  if (mode === 'preview') {
    fs.mkdirSync(b, { recursive: true });
    for (const t of a.split(',').map(Number)) { const j = await pg.evaluate(t => window.frameJPG(t, .9), t); fs.writeFileSync(path.join(b, `p_${t.toFixed(2)}.jpg`), Buffer.from(j, 'base64')); }
  } else {
    const END = await pg.evaluate('window.END'), N = Math.round(END * 30);
    const ff = spawn('ffmpeg', ['-y', '-v', 'error', '-f', 'image2pipe', '-framerate', '30', '-c:v', 'mjpeg', '-i', '-', '-c:v', 'libx264', '-preset', 'medium', '-crf', '17', '-pix_fmt', 'yuv420p', a], { stdio: ['pipe', 'inherit', 'inherit'] });
    const t0 = Date.now();
    for (let f = 0; f < N; f++) { const j = await pg.evaluate(t => window.frameJPG(t, .95), f / 30); if (!ff.stdin.write(Buffer.from(j, 'base64'))) await new Promise(r => ff.stdin.once('drain', r)); if (f % 150 === 0) console.log('frame', f, '/', N, ((Date.now() - t0) / 1000).toFixed(0) + 's'); }
    ff.stdin.end(); await new Promise(r => ff.on('close', r));
  }
  await br.close(); srv.close();
})();
