import { test } from "node:test";
import assert from "node:assert/strict";
import { readFile, mkdtemp, access, rm } from "node:fs/promises";
import { tmpdir } from "node:os";
import { join } from "node:path";
import { spawn } from "node:child_process";
import { createServer } from "node:http";

const runtime = await readFile(new URL("../public/nichelle.js", import.meta.url), "utf8");
const ids = ["AbCdEfGhI_1", "BcCdEfGhI_2", "CcCdEfGhI_3", "DcCdEfGhI_4"];
const published = { schemaVersion: 1, project: "nichelle-2026", modules: { videoGallery: {
  enabled: true, placement: "after-brand-strip", mobileMode: "scroll-snap", openMode: "modal",
  items: ids.map((id, index) => ({ id: "video-" + (index + 1), enabled: true, order: index,
    provider: "youtube", videoUrl: "https://www.youtube.com/shorts/" + id, posterUrl: "",
    alt: "Fixture de teste " + (index + 1) }))
} } };
let publishAvailable = true;
const html = `<!doctype html><html lang="pt-BR"><head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1">
<script>window.FWRNichelle={galeriaVideos:{configUrl:"/published.json",ativo:false,shorts:[]}};</script></head><body>
<main><div id="fwr-nichelle-video-slot" class="fwr-nichelle-video-slot" data-fwr-active="1" data-fwr-remote="1"></div></main>
<script defer src="/nichelle.js"></script></body></html>`;
const server = createServer((req, res) => {
  const pathname = new URL(req.url || "/", "http://127.0.0.1").pathname;
  if (pathname === "/published.json") {
    if (!publishAvailable) { res.writeHead(503); res.end("offline"); return; }
    res.writeHead(200, { "Content-Type": "application/json" }); res.end(JSON.stringify(published)); return;
  }
  if (pathname === "/nichelle.js") {
    res.writeHead(200, { "Content-Type": "text/javascript" }); res.end(runtime); return;
  }
  res.writeHead(200, { "Content-Type": "text/html; charset=utf-8" }); res.end(html);
});
await new Promise(resolve => server.listen(0, "127.0.0.1", resolve));
const base = "http://127.0.0.1:" + server.address().port;
const profile = await mkdtemp(join(tmpdir(), "nichelle-video-gallery-"));
const wait = ms => new Promise(resolve => setTimeout(resolve, ms));
let chrome, socket, id = 0;
const pending = new Map();
function send(method, params = {}) {
  return new Promise((resolve, reject) => {
    const messageId = ++id; pending.set(messageId, { resolve, reject });
    socket.send(JSON.stringify({ id: messageId, method, params }));
  });
}
async function evaluate(expression) {
  const result = await send("Runtime.evaluate", { expression, returnByValue: true, awaitPromise: true });
  return result.result?.value;
}

try {
  const candidates = [process.env.CHROME_BIN, "C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe",
    "/usr/bin/google-chrome", "/usr/bin/chromium", "/usr/bin/chromium-browser"].filter(Boolean);
  let binary = "";
  for (const candidate of candidates) { try { await access(candidate); binary = candidate; break; } catch {} }
  if (!binary) throw new Error("Chromium não disponível");
  chrome = spawn(binary, ["--headless=new", "--no-sandbox", "--disable-gpu", "--disable-dev-shm-usage",
    "--no-first-run", "--remote-allow-origins=*", "--remote-debugging-port=0", "--user-data-dir=" + profile,
    "about:blank"], { stdio: "ignore" });
  let port = 0;
  for (let i = 0; i < 120; i++) {
    try { port = Number((await readFile(join(profile, "DevToolsActivePort"), "utf8")).split("\n")[0]); } catch {}
    if (port) break;
    if (chrome.exitCode !== null) throw new Error("Chromium encerrou durante a inicialização");
    await wait(80);
  }
  if (!port) throw new Error("Chromium não abriu a porta DevTools");
  const tabs = await (await fetch("http://127.0.0.1:" + port + "/json/list")).json();
  const page = tabs.find(tab => tab.type === "page");
  socket = new WebSocket(page.webSocketDebuggerUrl);
  socket.addEventListener("message", event => {
    const message = JSON.parse(event.data), entry = pending.get(message.id);
    if (!entry) return;
    pending.delete(message.id);
    if (message.error) entry.reject(new Error(JSON.stringify(message.error))); else entry.resolve(message.result);
  });
  await new Promise((resolve, reject) => {
    socket.addEventListener("open", resolve, { once: true }); socket.addEventListener("error", reject, { once: true });
  });
  await send("Runtime.enable"); await send("Page.enable"); await send("Network.enable");
  await send("Network.setBlockedURLs", { urls: ["https://www.youtube-nocookie.com/*", "https://i.ytimg.com/*"] });
  await send("Page.navigate", { url: base + "/" });
  let ready = false;
  for (let i = 0; i < 100; i++) {
    await wait(70);
    if (await evaluate("document.querySelectorAll('.fwr-nichelle-videos__card').length === 4")) { ready = true; break; }
  }
  assert.equal(ready, true, "quatro cards devem montar sem requisição de player");

  const initial = await evaluate(`({cards:document.querySelectorAll('.fwr-nichelle-videos__card').length,
    frames:document.querySelectorAll('iframe').length,
    poster:document.querySelector('.fwr-nichelle-videos__poster')?.src,
    ratio:getComputedStyle(document.querySelector('.fwr-nichelle-videos__card')).aspectRatio,
    alt:document.querySelector('.fwr-nichelle-videos__poster')?.alt})`);
  assert.equal(initial.cards, 4); assert.equal(initial.frames, 0);
  assert.match(initial.poster, /i\.ytimg\.com\/vi\/AbCdEfGhI_1\/(?:oar2|oardefault|hqdefault)\.jpg/);
  assert.equal(initial.ratio, "9 / 16"); assert.match(initial.alt, /Fixture de teste 1/);

  const fallback = await evaluate(`new Promise(resolve=>{const img=document.querySelector('.fwr-nichelle-videos__poster');
    const get=()=>resolve(!!document.querySelector('.fwr-nichelle-videos__fallback:not([hidden])'));
    if(img.complete&&img.naturalWidth===0)get();else img.addEventListener('error',get,{once:true});setTimeout(get,3000)})`);
  assert.equal(fallback, true, "thumbnail indisponível deve mostrar fallback");

  const opened = await evaluate(`(()=>{const card=document.querySelector('.fwr-nichelle-videos__card');card.focus();card.click();
    return {modal:!!document.querySelector('.fwr-nichelle-video-modal'),frames:document.querySelectorAll('.fwr-nichelle-video-modal iframe').length,
    src:document.querySelector('.fwr-nichelle-video-modal iframe')?.src,focus:document.activeElement.getAttribute('aria-label'),inert:document.querySelector('main').inert}})()`);
  assert.equal(opened.modal, true); assert.equal(opened.frames, 1);
  assert.match(opened.src, /youtube-nocookie\.com\/embed\/AbCdEfGhI_1/);
  assert.equal(opened.focus, "Fechar vídeo"); assert.equal(opened.inert, true);
  await send("Input.dispatchKeyEvent", { type: "keyDown", key: "Escape", code: "Escape", windowsVirtualKeyCode: 27 });
  await send("Input.dispatchKeyEvent", { type: "keyUp", key: "Escape", code: "Escape", windowsVirtualKeyCode: 27 });
  const closed = await evaluate(`({modal:!!document.querySelector('.fwr-nichelle-video-modal'),frames:document.querySelectorAll('iframe').length,
    focus:document.activeElement.className,overflow:document.body.style.overflow,mainInert:document.querySelector('main').inert})`);
  assert.equal(closed.modal, false); assert.equal(closed.frames, 0);
  assert.match(closed.focus, /fwr-nichelle-videos__card/); assert.equal(closed.overflow, ""); assert.equal(closed.mainInert, false);

  const buttonClosed = await evaluate(`(()=>{const card=document.querySelectorAll('.fwr-nichelle-videos__card')[1];card.click();
    document.querySelector('.fwr-nichelle-video-modal__close').click();
    return {modal:!!document.querySelector('.fwr-nichelle-video-modal'),focus:document.activeElement===card,frames:document.querySelectorAll('iframe').length}})()`);
  assert.deepEqual(buttonClosed, { modal: false, focus: true, frames: 0 });
  publishAvailable = false;
  await send("Page.navigate", { url: base + "/" });
  let unavailable = false;
  for (let i = 0; i < 100; i++) {
    await wait(70);
    if (await evaluate("!!document.querySelector('.fwr-nichelle-videos__status')")) { unavailable = true; break; }
  }
  assert.equal(unavailable, true, "falha de rede deve manter estado reservado e falhar fechado");
  console.log("PASS — config publicada, poster 9:16, lazy iframe, fallback, modal, teclado, foco e falha de rede");
} finally {
  try { socket?.close(); } catch {}
  if (chrome && chrome.exitCode === null && chrome.signalCode === null) {
    const stopped = new Promise(resolve => chrome.once("close", resolve)); chrome.kill("SIGKILL"); await Promise.race([stopped, wait(1200)]);
  }
  await new Promise(resolve => server.close(resolve));
  await rm(profile, { recursive: true, force: true, maxRetries: 10, retryDelay: 120 });
}
