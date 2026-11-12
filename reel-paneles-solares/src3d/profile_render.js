const { chromium } = require('playwright'); const http = require('http'), fs = require('fs'), path = require('path');
const root = __dirname, out = process.argv[2]; const types = { '.js': 'text/javascript', '.html': 'text/html', '.json': 'application/json', '.woff2': 'font/woff2' };
const srv = http.createServer((q, r) => { const f = path.join(root, decodeURIComponent(q.url.split('?')[0])); fs.readFile(f, (e, d) => { if (e) { r.writeHead(404); r.end(); return; } r.writeHead(200, { 'Content-Type': types[path.extname(f)] || 'application/octet-stream' }); r.end(d); }); }).listen(8768);
(async () => { const br = await chromium.launch({ args: ['--enable-unsafe-swiftshader', '--use-angle=swiftshader', '--ignore-gpu-blocklist'] }); const pg = await br.newPage({ viewport: { width: 1080, height: 1080 } });
  pg.on('pageerror', e => console.log('ERR:', e.message)); await pg.goto('http://localhost:8768/profile.html'); await pg.waitForFunction('window.READY === true', null, { timeout: 180000 });
  const shots = { con_texto: [[10, 6.4, 15.5], [0, 2.75, 0], 30, true], solo_casa: [[10, 6.2, 15.5], [0, 2.3, 0], 30, false] };
  for (const [name, [p, l, f, txt]] of Object.entries(shots)) { const b64 = await pg.evaluate(([p, l, f, txt]) => { window.PROFILE = true; window.PTEXT = txt; window.PCAM = [p, l, f]; window.renderAt(59.2); return document.getElementById('out').toDataURL('image/png').split(',')[1]; }, [p, l, f, txt]); fs.writeFileSync(path.join(out, `perfil_${name}.png`), Buffer.from(b64, 'base64')); }
  await br.close(); srv.close(); })();
