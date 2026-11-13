import { createServer } from "node:http";
import { readFile, stat } from "node:fs/promises";
import { extname, resolve, sep } from "node:path";

const root = resolve(".");
const mime = {
  ".html": "text/html; charset=utf-8",
  ".css": "text/css; charset=utf-8",
  ".js": "text/javascript; charset=utf-8",
  ".svg": "image/svg+xml"
};
const mappings = new Map([
  ["/nichelle.js", "public/nichelle.js"],
  ["/nichelle27.js", "public/nichelle27.js"],
  ["/nichelle27.css", "public/nichelle27.css"]
]);
const server = createServer(async (req, res) => {
  try {
    const pathname = new URL(req.url || "/", "http://127.0.0.1").pathname;
    let relative = mappings.get(pathname);
    if (pathname === "/preview" || pathname === "/preview/") relative = "preview/index.html";
    else if (!relative && pathname.startsWith("/preview/")) relative = pathname.slice(1);
    if (!relative || !/^preview\//.test(relative) && !mappings.has(pathname)) {
      res.writeHead(404); res.end("Not found"); return;
    }
    const file = resolve(root, relative);
    if (!file.startsWith(root + sep)) { res.writeHead(403); res.end("Forbidden"); return; }
    if (!(await stat(file)).isFile()) { res.writeHead(404); res.end("Not found"); return; }
    const headers = { "Content-Type": mime[extname(file)] || "application/octet-stream", "X-Content-Type-Options": "nosniff" };
    if (pathname.startsWith("/preview/")) headers["X-Robots-Tag"] = "noindex, nofollow, noarchive";
    res.writeHead(200, headers); res.end(await readFile(file));
  } catch {
    res.writeHead(404); res.end("Not found");
  }
});
const port = Number(process.env.PORT || 8765);
server.listen(port, "127.0.0.1", () => console.log(`Nichelle preview: http://127.0.0.1:${port}/preview/`));
