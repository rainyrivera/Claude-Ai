const { chromium } = require('playwright'); const http = require('http'), fs = require('fs'), path = require('path');
const root = __dirname, outd = process.argv[2]; const types = { '.js': 'text/javascript', '.html': 'text/html', '.json': 'application/json', '.woff2': 'font/woff2' };
const srv = http.createServer((q, r) => { const f = path.join(root, decodeURIComponent(q.url.split('?')[0])); fs.readFile(f, (e, d) => { if (e) { r.writeHead(404); r.end(); return; } r.writeHead(200, { 'Content-Type': types[path.extname(f)] || 'application/octet-stream' }); r.end(d); }); }).listen(8769);
(async () => { const br = await chromium.launch({ args: ['--enable-unsafe-swiftshader', '--use-angle=swiftshader', '--ignore-gpu-blocklist'] }); const pg = await br.newPage({ viewport: { width: 1080, height: 1080 } });
  pg.on('pageerror', e => console.log('ERR:', e.message)); pg.on('console', m => { if (!/WebGL/.test(m.text())) console.log('PAGE:', m.text()); });
  await pg.goto('http://localhost:8769/mascot.html'); await pg.waitForFunction('window.READY === true', null, { timeout: 120000 });
  for (const [n, a, b] of [['amarillo', '#ffd84a', '#f5a400'], ['azul', '#5cc2ff', '#1f5fd6']]) { const b64 = await pg.evaluate(([a, b]) => window.renderM(a, b), [a, b]); fs.writeFileSync(path.join(outd, `perfil_mascota_${n}.png`), Buffer.from(b64, 'base64')); }
  await br.close(); srv.close(); })();
