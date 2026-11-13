const { chromium } = require('playwright');
const http = require('http'), fs = require('fs'), path = require('path');
const root = __dirname; const [,, mode, a, b, c] = process.argv;
const T = { '.js': 'text/javascript', '.html': 'text/html', '.json': 'application/json', '.woff2': 'font/woff2' };
const PORT = +(process.env.PORT || 8767);
const srv = http.createServer((q, r) => { const f = path.join(root, decodeURIComponent(q.url.split('?')[0])); fs.readFile(f, (e, d) => { if (e) { r.writeHead(404); r.end(); return; } r.writeHead(200, { 'Content-Type': T[path.extname(f)] || 'application/octet-stream' }); r.end(d); }); }).listen(PORT);
(async () => {
  const br = await chromium.launch(); const pg = await br.newPage({ viewport: { width: 1080, height: 1920 }, deviceScaleFactor: 1 });
  pg.on('console', m => console.log('PAGE:', m.text())); pg.on('pageerror', e => console.log('ERR:', e.message));
  await pg.goto(`http://localhost:${PORT}/index.html`); await pg.waitForFunction('window.READY === true', null, { timeout: 120000 });
  const cv = await pg.$('#c');
  if (mode === 'preview') { for (const t of a.split(',').map(Number)) { await pg.evaluate(t => window.renderAt(t), t); await cv.screenshot({ path: path.join(b, `p_${t.toFixed(2)}.jpg`), type: 'jpeg', quality: 80 }); } }
  else { fs.mkdirSync(a, { recursive: true }); const dur = await pg.evaluate('window.DUR'); const N = Math.ceil(dur * 30); const s = +(b || 0), e = Math.min(N, +(c || N)); const t0 = Date.now();
    for (let f = s; f < e; f++) { await pg.evaluate(t => window.renderAt(t), f / 30); await cv.screenshot({ path: path.join(a, `f_${String(f).padStart(5, '0')}.jpg`), type: 'jpeg', quality: 90 }); if (f % 100 === 0) console.log('frame', f, '/', N, ((Date.now() - t0) / 1000).toFixed(0) + 's'); } }
  await br.close(); srv.close();
})();
