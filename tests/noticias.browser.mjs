import { test } from "node:test";
import assert from "node:assert/strict";
import { createServer } from "node:http";
import { spawn } from "node:child_process";
import { mkdtemp, readFile, access, rm } from "node:fs/promises";
import { tmpdir } from "node:os";
import { join } from "node:path";

const runtime = await readFile(new URL("../public/nichelle.js", import.meta.url));
const fixture = String.raw`<!doctype html><html lang="pt-BR"><head><meta charset="utf-8">
<meta name="viewport" content="width=device-width, initial-scale=1">
<style>html,body{margin:0;padding:0;font-family:Arial,sans-serif}footer{padding:20px;background:#fff}footer a{display:inline-block;margin-right:10px}</style>
<script>window.FWRNichelle={noticias:{ativo:true,ocultarLinksRodape:true,itens:[
{foto:"/imagem/1.svg",titulo:"SKINCARE COREANO: A ROTINA DE BELEZA K-BEAUTY EM 10 PASSOS",breveTexto:"Descubra os 10 passos da rotina coreana para uma pele radiante e saudável.",data:"2026-10-01",link:"/pagina/skincare-coreano"},
{foto:"/imagem/2.svg",titulo:"NAD+ NO SKINCARE: O QUE É E POR QUE ESTÁ GANHANDO DESTAQUE?",breveTexto:"O skincare coreano está cada vez mais conectado à biotecnologia.",data:"2026-09-25",link:"/pagina/nad-skincare"},
{foto:"/imagem/3.svg",titulo:"PROTETOR SOLAR NO INVERNO: POR QUE ELE CONTINUA SENDO O ÚLTIMO PASSO?",breveTexto:"No inverno, a rotina muda e a proteção continua.",data:"2026-08-11",link:"/pagina/protetor-solar"}
]}};</script></head><body>
<main><div id="fwr-nichelle-noticias-slot"></div></main>
<footer><ul><li id="link-noticia"><a href="/pagina/skincare-coreano">Notícia</a></li><li id="politica"><a href="/pagina/politica-de-privacidade">Política de privacidade</a></li></ul></footer>
<script defer src="/nichelle.js"></script></body></html>`;
function svg(n) {
  const palettes = [["#d5c4cd","#6d495d"],["#edb7d2","#a3398c"],["#d1e0d6","#4e8276"]];
  const c = palettes[n - 1] || palettes[0];
  return '<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 1200 800"><defs><linearGradient id="g"><stop stop-color="' + c[0] + '"/><stop offset="1" stop-color="' + c[1] + '"/></linearGradient></defs><rect width="1200" height="800" fill="url(#g)"/><circle cx="650" cy="350" r="220" fill="#ffffff55"/></svg>';
}
const server = createServer((req, res) => {
  if (req.url === "/nichelle.js") {
    res.writeHead(200, { "Content-Type": "text/javascript; charset=utf-8" });
    return res.end(runtime);
  }
  if (req.url === "/") {
    res.writeHead(200, { "Content-Type": "text/html; charset=utf-8" });
    return res.end(fixture);
  }
  if (/^\/imagem\/[123]\.svg$/.test(req.url || "")) {
    res.writeHead(200, { "Content-Type": "image/svg+xml" });
    return res.end(svg(Number(req.url.match(/[123]/)[0])));
  }
  res.writeHead(404);
  res.end("Not Found");
});
await new Promise(resolve => server.listen(0, "127.0.0.1", resolve));
const url = "http://127.0.0.1:" + server.address().port + "/";

async function chromeBinary() {
  const candidates = [process.env.CHROME_BIN, "/usr/bin/google-chrome", "/usr/bin/google-chrome-stable", "/usr/bin/chromium", "/usr/bin/chromium-browser"].filter(Boolean);
  for (const bin of candidates) {
    try { await access(bin); return bin; } catch {}
  }
  throw new Error("Chromium/Chrome não encontrado para validação real de viewports");
}
const workdir = await mkdtemp(join(tmpdir(), "fwr-news-browser-"));
let chrome, ws, pending = new Map(), id = 0;
function delay(ms) { return new Promise(r => setTimeout(r, ms)); }
function send(method, params = {}) {
  return new Promise((resolve, reject) => {
    const currentId = ++id;
    pending.set(currentId, { resolve, reject });
    ws.send(JSON.stringify({ id: currentId, method, params }));
  });
}
async function startChrome() {
  chrome = spawn(await chromeBinary(), [
    "--headless=new", "--no-sandbox", "--disable-gpu", "--disable-dev-shm-usage",
    "--no-first-run", "--no-default-browser-check",
    "--remote-allow-origins=*", "--remote-debugging-port=0",
    "--user-data-dir=" + workdir,
    "about:blank"
  ], { stdio: "ignore" });
  let port;
  for (let i = 0; i < 90; i++) {
    if (chrome.exitCode !== null) throw new Error("Chromium saiu antes de iniciar");
    try {
      const active = await readFile(join(workdir, "DevToolsActivePort"), "utf8");
      port = Number(active.split("\n")[0]);
      if (port) break;
    } catch {}
    await delay(100);
  }
  if (!port) throw new Error("Porta de depuração do Chromium indisponível");
  const tabs = await (await fetch("http://127.0.0.1:" + port + "/json/list")).json();
  const page = tabs.find(t => t.type === "page");
  if (!page) throw new Error("Aba Chromium não encontrada");
  ws = new WebSocket(page.webSocketDebuggerUrl);
  ws.addEventListener("message", e => {
    const msg = JSON.parse(e.data);
    if (!msg.id || !pending.has(msg.id)) return;
    const p = pending.get(msg.id);
    pending.delete(msg.id);
    if (msg.error) p.reject(Error(JSON.stringify(msg.error)));
    else p.resolve(msg.result);
  });
  await new Promise((resolve, reject) => {
    ws.addEventListener("open", resolve, { once: true });
    ws.addEventListener("error", reject, { once: true });
  });
  await send("Page.enable");
  await send("Runtime.enable");
}

async function inspect(width, height) {
  await send("Emulation.setDeviceMetricsOverride", { width, height, deviceScaleFactor: 1, mobile: width < 700 });
  await send("Page.navigate", { url });
  let value;
  for (let i = 0; i < 60; i++) {
    await delay(100);
    const result = await send("Runtime.evaluate", {
      expression: `(function () {
        var layout = document.querySelector(".fwr-nichelle-news__layout");
        var sidebar = document.querySelector(".fwr-nichelle-news__sidebar");
        if (!layout || !sidebar) return null;
        var count = function(el) {
          return getComputedStyle(el).gridTemplateColumns.split(" ").filter(Boolean).length;
        };
        return {
          viewport: innerWidth,
          layoutCols: count(layout),
          sidebarCols: count(sidebar),
          pageWidth: document.documentElement.scrollWidth,
          heroHeight: Math.round(document.querySelector(".fwr-nichelle-news__featured").getBoundingClientRect().height),
          visibleArticles: document.querySelectorAll("#fwr-nichelle-noticias-slot a[href]").length,
          hiddenLink: getComputedStyle(document.querySelector("#link-noticia")).display === "none",
          legalLink: getComputedStyle(document.querySelector("#politica")).display !== "none"
        };
      })()`,
      returnByValue: true
    });
    value = result.result?.value;
    if (value) break;
  }
  assert.ok(value, "Não renderizou módulo de notícias");
  assert.equal(value.viewport, width, "Largura real de viewport não corresponde à emulação");
  assert.equal(value.visibleArticles, 3);
  assert.equal(value.hiddenLink, true, "Link de notícia não foi ocultado no rodapé");
  assert.equal(value.legalLink, true, "Link institucional legal foi ocultado por engano");
  assert.ok(value.heroHeight > 250, "Destaque com altura insuficiente");
  assert.ok(value.pageWidth <= width + 2, "A página tem rolagem horizontal inesperada: " + JSON.stringify(value));
  return value;
}

try {
  await startChrome();
  await test("desktop 1440px: destaque ao lado de duas notícias e sem overflow", async () => {
    const v = await inspect(1440, 900);
    assert.equal(v.layoutCols, 2);
    assert.equal(v.sidebarCols, 1);
  });
  await test("tablet 900px: destaque acima e duas notícias lado a lado", async () => {
    const v = await inspect(900, 1050);
    assert.equal(v.layoutCols, 1);
    assert.equal(v.sidebarCols, 2);
  });
  await test("mobile 375px: coluna única e cards laterais empilhados", async () => {
    const v = await inspect(375, 812);
    assert.equal(v.layoutCols, 1);
    assert.equal(v.sidebarCols, 1);
  });
} finally {
  try { ws?.close(); } catch {}
  if (chrome && chrome.exitCode === null && chrome.signalCode === null) {
    const stopped = new Promise(resolve => chrome.once("close", resolve));
    chrome.kill("SIGKILL");
    await Promise.race([stopped, delay(1500)]);
  }
  await new Promise(resolve => server.close(resolve));
  // Chromium pode terminar a gravação do perfil após fechar a janela.
  // Aguardar o encerramento e repetir a limpeza evita ENOTEMPTY intermitente.
  await delay(200);
  await rm(workdir, { recursive: true, force: true, maxRetries: 10, retryDelay: 200 });
}
