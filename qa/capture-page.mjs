import { spawn } from "node:child_process";
import { access, mkdir, mkdtemp, rm, writeFile } from "node:fs/promises";
import { tmpdir } from "node:os";
import { dirname, join, resolve } from "node:path";

const args = process.argv.slice(2);
function option(name, fallback) {
  const index = args.indexOf(name);
  return index < 0 ? fallback : args[index + 1];
}
const url = option("--url", "");
const output = resolve(option("--out", "qa/artifacts"));
const fullPage = args.includes("--fullpage");
const viewports = option("--viewports", "1440x900,390x844").split(",").map((value) => {
  const [width, height] = value.split("x").map(Number);
  if (!Number.isInteger(width) || !Number.isInteger(height)) throw new Error("Viewport inválido: " + value);
  return { width, height };
});
if (!url) throw new Error("Uso: node qa/capture-page.mjs --url URL [--viewports 1440x900,390x844] [--out pasta]");

const candidates = [process.env.CHROME_BIN,
  "C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe",
  "C:\\Program Files (x86)\\Microsoft\\Edge\\Application\\msedge.exe",
  "/usr/bin/google-chrome", "/usr/bin/chromium", "/usr/bin/chromium-browser"].filter(Boolean);
let browser;
for (const candidate of candidates) {
  try { await access(candidate); browser = candidate; break; } catch {}
}
if (!browser) throw new Error("Chrome/Chromium não encontrado. Configure CHROME_BIN.");

const profile = await mkdtemp(join(tmpdir(), "nichelle-capture-"));
let child, socket;
let messageId = 0;
const pending = new Map();
const errors = [];
const failures = [];
function send(method, params = {}) {
  return new Promise((resolveCommand, rejectCommand) => {
    const id = ++messageId;
    pending.set(id, { resolveCommand, rejectCommand });
    socket.send(JSON.stringify({ id, method, params }));
  });
}
const wait = (ms) => new Promise((resolveWait) => setTimeout(resolveWait, ms));
try {
  child = spawn(browser, ["--headless=new", "--no-sandbox", "--disable-gpu", "--disable-dev-shm-usage",
    "--no-first-run", "--no-default-browser-check", "--remote-allow-origins=*", "--remote-debugging-port=0",
    "--user-data-dir=" + profile, "about:blank"], { stdio: "ignore" });
  let port = 0;
  for (let attempt = 0; attempt < 120; attempt++) {
    try { port = Number((await (await import("node:fs/promises")).readFile(join(profile, "DevToolsActivePort"), "utf8")).split("\n")[0]); } catch {}
    if (port) break;
    if (child.exitCode !== null) throw new Error("Chrome encerrou durante inicialização.");
    await wait(100);
  }
  if (!port) throw new Error("Chrome não abriu a porta DevTools.");
  const tabs = await (await fetch(`http://127.0.0.1:${port}/json/list`)).json();
  const page = tabs.find((tab) => tab.type === "page");
  if (!page) throw new Error("Aba Chrome não encontrada.");
  socket = new WebSocket(page.webSocketDebuggerUrl);
  socket.addEventListener("message", (event) => {
    const message = JSON.parse(event.data);
    const safeError = (value) => String(value || "").replace(/https:\/\/api\.reclameaqui\.com\.br\/embed-raverified\/hash\/[^\s'"<>]+/g,
      "https://api.reclameaqui.com.br/embed-raverified/hash/[redacted]");
    if (message.method === "Runtime.exceptionThrown") errors.push(safeError(message.params.exceptionDetails?.text || "exception"));
    if (message.method === "Log.entryAdded" && message.params.entry.level === "error") errors.push(safeError(message.params.entry.text));
    if (message.method === "Network.loadingFailed") failures.push({ error: message.params.errorText });
    if (message.id && pending.has(message.id)) {
      const entry = pending.get(message.id); pending.delete(message.id);
      if (message.error) entry.rejectCommand(new Error(JSON.stringify(message.error)));
      else entry.resolveCommand(message.result);
    }
  });
  await new Promise((resolveOpen, rejectOpen) => {
    socket.addEventListener("open", resolveOpen, { once: true });
    socket.addEventListener("error", rejectOpen, { once: true });
  });
  await send("Runtime.enable"); await send("Page.enable"); await send("Network.enable"); await send("Log.enable");
  await send("Network.setCacheDisabled", { cacheDisabled: true });
  await send("Network.setBypassServiceWorker", { bypass: true });
  await send("Page.addScriptToEvaluateOnNewDocument", { source: `
    window.__nichelleQa = { cls: 0, lcp: 0, events: 0, maxEvent: 0, shifts: [] };
    try { new PerformanceObserver((list) => { for (const e of list.getEntries()) if (!e.hadRecentInput) { window.__nichelleQa.cls += e.value; window.__nichelleQa.shifts.push({value:e.value,startTime:e.startTime,sources:(e.sources||[]).map(s=>({node:s.node?.tagName||'',id:s.node?.id||'',className:typeof s.node?.className==='string'?s.node.className:'',previousRect:s.previousRect,currentRect:s.currentRect}))}); } }).observe({type:'layout-shift', buffered:true}); } catch {}
    try { new PerformanceObserver((list) => { for (const e of list.getEntries()) window.__nichelleQa.lcp = e.startTime; }).observe({type:'largest-contentful-paint', buffered:true}); } catch {}
    try { new PerformanceObserver((list) => { for (const e of list.getEntries()) { window.__nichelleQa.events++; window.__nichelleQa.maxEvent = Math.max(window.__nichelleQa.maxEvent, e.duration || 0); } }).observe({type:'event', buffered:true, durationThreshold:16}); } catch {}
  ` });
  await mkdir(output, { recursive: true });
  const results = [];
  for (const viewport of viewports) {
    process.stdout.write(`Navegando ${viewport.width}x${viewport.height}...\n`);
    await send("Emulation.setDeviceMetricsOverride", { ...viewport, deviceScaleFactor: 1, mobile: viewport.width < 768 });
    const beforeErrors = errors.length, beforeFailures = failures.length;
    await send("Page.navigate", { url });
    let ready = false;
    for (let attempt = 0; attempt < 150; attempt++) {
      await wait(100);
      const state = await send("Runtime.evaluate", { expression: "document.readyState", returnByValue: true });
      if (state.result?.value === "complete") { ready = true; break; }
    }
    if (!ready) throw new Error("Timeout aguardando document.readyState=complete em " + viewport.width);
    await wait(1800);
    const measured = await send("Runtime.evaluate", { expression: `(() => { const p=performance.getEntriesByType('navigation')[0]; const q=window.__nichelleQa||{}; const resources=performance.getEntriesByType('resource'); const images=Array.from(document.images); const chain=(el)=>{const out=[];for(let n=el;n&&out.length<6;n=n.parentElement)out.push(n.tagName.toLowerCase()+(n.id?'#'+n.id:'')+(typeof n.className==='string'&&n.className.trim()?'.'+n.className.trim().replace(/\\s+/g,'.'):''));return out};const scripts=Array.from(document.scripts).map(s=>{try{return new URL(s.src,location.href)}catch{return null}}).filter(Boolean);return {url:location.href,width:innerWidth,height:innerHeight,documentWidth:document.documentElement.scrollWidth,pageHeight:document.documentElement.scrollHeight,readyState:document.readyState,imageCount:images.length,imageFailures:images.filter(i=>i.complete&&i.naturalWidth===0).length,cls:q.cls||0,layoutShifts:q.shifts||[],lcpMs:q.lcp||0,eventCount:q.events||0,maxEventMs:q.maxEvent||0,domContentLoadedMs:p?.domContentLoadedEventEnd||0,loadMs:p?.loadEventEnd||0,resourceCount:resources.length,transferBytes:resources.reduce((s,r)=>s+(r.transferSize||0),0),dom:{sectionOrder:Array.from(document.querySelectorAll('[data-n27-section]')).map(e=>e.dataset.n27Section),videoCards:document.querySelectorAll('.preview-video-card').length,iframeCount:document.querySelectorAll('iframe').length,bannerCards:document.querySelectorAll('.fwr-nichelle-vitrine__card').length,bannerDiagnostics:window.FWRNichelle?.diagnosticoBanners?.(),headers:Array.from(document.querySelectorAll('header,[role=banner]')).slice(0,4).map(e=>({tag:e.tagName,id:e.id,classes:typeof e.className==='string'?e.className:'',height:Math.round(e.getBoundingClientRect().height)})),productCount:document.querySelectorAll('.listagem-item').length,productAncestors:chain(document.querySelector('.listagem-item')),forms:Array.from(document.forms).slice(0,8).map(f=>({id:f.id,classes:f.className,action:f.getAttribute('action'),method:f.method,inputs:f.querySelectorAll('input').length})),miniBannerImages:Array.from(document.querySelectorAll('img[alt],img[title]')).filter(i=>/mini-pages/i.test(i.alt+' '+i.title)).slice(0,8).map(i=>({alt:i.alt,title:i.title,parent:chain(i.parentElement)})),customScriptHosts:Array.from(new Set(scripts.map(u=>/nichelle|fwr/i.test(u.pathname)?u.hostname:'' ).filter(Boolean))),nichelleRuntimeLoaded:scripts.some(u=>u.pathname==='/nichelle.js')}} })()`, returnByValue: true });
    const content = await send("Page.getLayoutMetrics");
    const width = viewport.width;
    const height = fullPage ? Math.max(viewport.height, Math.ceil(content.cssContentSize?.height || viewport.height)) : viewport.height;
    let screenshotTimer;
    const screenshot = await Promise.race([send("Page.captureScreenshot", { format: "png", captureBeyondViewport: fullPage,
      fromSurface: true, clip: { x: 0, y: 0, width, height, scale: 1 } }),
      new Promise((_, reject) => { screenshotTimer = setTimeout(() => reject(new Error("Screenshot timeout")), 20000); })
    ]).finally(() => clearTimeout(screenshotTimer));
    const filename = `capture-${viewport.width}x${viewport.height}.png`;
    await writeFile(join(output, filename), Buffer.from(screenshot.data, "base64"));
    process.stdout.write(`Captura salva: ${filename}\n`);
    results.push({ ...measured.result.value, screenshot: filename,
      consoleErrors: errors.slice(beforeErrors), networkFailures: failures.slice(beforeFailures) });
  }
  await writeFile(join(output, "metrics.json"), JSON.stringify(results, null, 2) + "\n");
  process.stdout.write(JSON.stringify(results, null, 2) + "\n");
} finally {
  try { socket?.close(); } catch {}
  if (child && child.exitCode === null && child.signalCode === null) {
    child.kill();
    await Promise.race([new Promise((resolveClose) => child.once("close", resolveClose)), wait(1500)]);
  }
  await rm(profile, { recursive: true, force: true, maxRetries: 10, retryDelay: 150 });
}
