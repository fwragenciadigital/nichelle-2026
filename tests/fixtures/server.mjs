import { createServer } from 'node:http';
import { readFile } from 'node:fs/promises';
import { resolve, sep } from 'node:path';

const root = resolve(process.cwd());
const types = { '.html': 'text/html; charset=utf-8', '.js': 'text/javascript; charset=utf-8', '.css': 'text/css; charset=utf-8', '.json': 'application/json; charset=utf-8' };
createServer(async (req, res) => {
  try {
    const pathname = decodeURIComponent(new URL(req.url, 'http://localhost').pathname);
    const file = resolve(root, `.${pathname}`);
    if (file !== root && !file.startsWith(root + sep)) throw new Error('Not found');
    const content = await readFile(file);
    const ext = file.slice(file.lastIndexOf('.'));
    res.writeHead(200, { 'content-type': types[ext] || 'application/octet-stream', 'cache-control': 'no-store' });
    res.end(content);
  } catch {
    res.writeHead(404);
    res.end('Not found');
  }
}).listen(8765, '127.0.0.1', () => process.stdout.write('Nichelle browser fixture on http://127.0.0.1:8765/tests/fixtures/gallery.html\n'));
