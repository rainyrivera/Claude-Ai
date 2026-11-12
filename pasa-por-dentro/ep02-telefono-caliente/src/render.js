const { chromium } = require('playwright');
const http = require('http'), fs = require('fs'), path = require('path');
const root = __dirname;
const [,, mode, a, b, c, portArg] = process.argv; // preview "t1,t2" outdir | full outdir startFrame endFrame port
const port = +(portArg || (mode === 'preview' ? 8770 : 8771));
const srv = http.createServer((q, r) => { const f = path.join(root, decodeURIComponent(q.url.split('?')[0])); fs.readFile(f, (e, d) => { if (e) { r.writeHead(404); r.end(); return; } const ext = path.extname(f); r.writeHead(200, { 'Content-Type': { '.js': 'text/javascript', '.html': 'text/html', '.json': 'application/json', '.woff2': 'font/woff2' }[ext] || 'application/octet-stream' }); r.end(d); }); }).listen(port);
(async () => {
  const br = await chromium.launch({ args: ['--enable-unsafe-swiftshader', '--use-angle=swiftshader', '--ignore-gpu-blocklist'] });
  const pg = await br.newPage({ viewport: { width: 1080, height: 1920 }, deviceScaleFactor: 1 });
  pg.on('console', m => console.log('PAGE:', m.text())); pg.on('pageerror', e => console.log('ERR:', e.message));
  await pg.goto(`http://localhost:${port}/index.html`); await pg.waitForFunction('window.READY === true', null, { timeout: 120000 });
  if (mode === 'preview') {
    for (const t of a.split(',').map(Number)) { await pg.evaluate(t => window.renderAt(t), t); await pg.screenshot({ path: path.join(b, `p_${t.toFixed(2)}.jpg`), type: 'jpeg', quality: 80 }); }
  } else {
    fs.mkdirSync(a, { recursive: true }); const t0 = Date.now();
    const s = +b, e = +c;
    for (let f = s; f < e; f++) { const fn = path.join(a, `f_${String(f).padStart(5, '0')}.jpg`); if (fs.existsSync(fn)) continue; await pg.evaluate(t => window.renderAt(t), f / 30); await pg.screenshot({ path: fn, type: 'jpeg', quality: 92 }); if (f % 100 === 0) console.log('frame', f, ((Date.now() - t0) / 1000).toFixed(0) + 's'); }
  }
  await br.close(); srv.close();
})();
