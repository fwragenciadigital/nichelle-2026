import assert from 'node:assert/strict';
import { spawn } from 'node:child_process';
import { mkdtempSync, rmSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { join } from 'node:path';

const chrome = 'C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe';
const port = 9237;
const profile = mkdtempSync(join(tmpdir(), 'nichelle-gallery-'));
const origin = `http://127.0.0.1:8765/tests/fixtures/`;
const processChrome = spawn(chrome, ['--headless=new', '--no-first-run', '--no-default-browser-check', '--disable-gpu', '--remote-allow-origins=*', `--remote-debugging-port=${port}`, `--user-data-dir=${profile}`, `${origin}gallery.html`], { stdio: 'ignore' });
let socket;
let send;
try {
  let target;
  for (let tries = 0; tries < 50; tries++) {
    try {
      const pages = await fetch(`http://127.0.0.1:${port}/json/list`).then(r => r.json());
      target = pages.find(page => page.type === 'page');
      if (target) break;
    } catch {}
    await new Promise(resolve => setTimeout(resolve, 100));
  }
  assert.ok(target, 'Chrome DevTools endpoint did not start');
  socket = new WebSocket(target.webSocketDebuggerUrl);
  await new Promise((resolve, reject) => { socket.onopen = resolve; socket.onerror = reject; });
  let nextId = 0;
  const pending = new Map();
  const events = new Map();
  socket.onmessage = event => {
    const message = JSON.parse(event.data);
    if (message.id) {
      const request = pending.get(message.id);
      if (!request) return;
      pending.delete(message.id);
      if (message.error) request.reject(new Error(message.error.message)); else request.resolve(message.result);
    } else {
      for (const handler of events.get(message.method) || []) handler(message.params);
    }
  };
  send = (method, params = {}) => new Promise((resolve, reject) => {
    const id = ++nextId;
    pending.set(id, { resolve, reject });
    socket.send(JSON.stringify({ id, method, params }));
  });
  const on = (method, handler) => events.set(method, [...(events.get(method) || []), handler]);
  await send('Page.enable');
  await send('Runtime.enable');
  await send('Page.addScriptToEvaluateOnNewDocument', { source: 'window.__cls=0;new PerformanceObserver(list=>{for(const e of list.getEntries())if(!e.hadRecentInput)window.__cls+=e.value}).observe({type:"layout-shift",buffered:true});' });
  const evaluate = async expression => {
    const result = await send('Runtime.evaluate', { expression, awaitPromise: true, returnByValue: true });
    if (result.exceptionDetails) throw new Error(result.exceptionDetails.text);
    return result.result.value;
  };
  const key = async (value, code, windowsVirtualKeyCode) => {
    await send('Input.dispatchKeyEvent', { type: 'keyDown', key: value, code, windowsVirtualKeyCode });
    await send('Input.dispatchKeyEvent', { type: 'keyUp', key: value, code, windowsVirtualKeyCode });
  };
  const navigate = async path => {
    const loaded = new Promise(resolve => on('Page.loadEventFired', resolve));
    await send('Page.navigate', { url: origin + path });
    await loaded;
    await new Promise(resolve => setTimeout(resolve, 900));
  };

  for (const width of [360, 390, 820, 1440]) {
    await send('Emulation.setDeviceMetricsOverride', { width, height: 900, deviceScaleFactor: 1, mobile: width < 500 });
    await navigate('gallery.html');
    const initial = await evaluate(`(()=>{const s=document.querySelector('.fwr-nichelle-videos'),slot=document.querySelector('.fwr-nichelle-video-slot'),t=s.querySelector('.fwr-nichelle-videos__track');return {width:innerWidth,cardCount:s.querySelectorAll('.fwr-nichelle-videos__card').length,columns:getComputedStyle(t).gridTemplateColumns,trackOverflow:t.scrollWidth>t.clientWidth,slotHeight:Math.round(slot.getBoundingClientRect().height),galleryHeight:Math.round(s.getBoundingClientRect().height),iframeCount:document.querySelectorAll('iframe').length,fallbackCount:s.querySelectorAll('.fwr-nichelle-videos__fallback:not([hidden])').length,cls:window.__cls||0}})()`);
    assert.equal(initial.width, width);
    assert.equal(initial.cardCount, 4);
    assert.equal(initial.iframeCount, 0, 'iframe must not load before interaction');
    assert.equal(initial.fallbackCount, 4, 'unavailable thumbnails must show a visual fallback');
    assert.ok(initial.slotHeight >= initial.galleryHeight, `reserved slot ${initial.slotHeight}px is smaller than gallery ${initial.galleryHeight}px at ${width}px`);
    assert.ok(initial.cls < 0.005, `CLS ${initial.cls} exceeded 0.005 at ${width}px`);
    assert.equal(initial.trackOverflow, width < 768);
    assert.equal(initial.columns.split(' ').length, 4);
    await evaluate('document.querySelector(".fwr-nichelle-videos__card").click()');
    const playing = await evaluate('({count:document.querySelectorAll(".fwr-nichelle-video-modal iframe").length,src:document.querySelector(".fwr-nichelle-video-modal iframe")?.src||"",focus:document.activeElement.getAttribute("aria-label")})');
    assert.equal(playing.count, 1);
    assert.match(playing.src, /^https:\/\/www\.youtube-nocookie\.com\/embed\//);
    assert.equal(playing.focus, 'Fechar vídeo');
    await key('Tab', 'Tab', 9);
    assert.equal(await evaluate('document.activeElement.tagName'), 'IFRAME');
    for (let tab = 0; tab < 8; tab++) {
      await key('Tab', 'Tab', 9);
      assert.equal(await evaluate('document.querySelector(".fwr-nichelle-video-modal").contains(document.activeElement)'), true, 'Tab focus escaped the modal');
    }
    for (let tab = 0; tab < 8; tab++) {
      await send('Input.dispatchKeyEvent', { type: 'keyDown', key: 'Shift', code: 'ShiftLeft', windowsVirtualKeyCode: 16, modifiers: 8 });
      await send('Input.dispatchKeyEvent', { type: 'keyDown', key: 'Tab', code: 'Tab', windowsVirtualKeyCode: 9, modifiers: 8 });
      await send('Input.dispatchKeyEvent', { type: 'keyUp', key: 'Tab', code: 'Tab', windowsVirtualKeyCode: 9, modifiers: 8 });
      await send('Input.dispatchKeyEvent', { type: 'keyUp', key: 'Shift', code: 'ShiftLeft', windowsVirtualKeyCode: 16 });
      const focusState=await evaluate('({inside:document.querySelector(".fwr-nichelle-video-modal").contains(document.activeElement),tag:document.activeElement.tagName,className:document.activeElement.className,aria:document.activeElement.getAttribute("aria-label")})');
      assert.equal(focusState.inside,true,`Shift+Tab focus escaped the modal: ${JSON.stringify(focusState)}`);
    }
    await evaluate('document.querySelector(".fwr-nichelle-video-modal__close").focus()');
    await key('Escape', 'Escape', 27);
    const closed = await evaluate('({modal:document.querySelectorAll(".fwr-nichelle-video-modal").length,focus:document.activeElement.getAttribute("aria-label")})');
    assert.equal(closed.modal, 0);
    assert.equal(closed.focus, 'Reproduzir vídeo: Thumbnail sintética de teste 1');
    await evaluate('document.querySelector(".fwr-nichelle-videos__card").click()');
    await evaluate('document.querySelector(".fwr-nichelle-video-modal__close").click()');
    assert.equal(await evaluate('document.querySelectorAll(".fwr-nichelle-video-modal").length'), 0);
    assert.equal(await evaluate('document.activeElement.getAttribute("aria-label")'), 'Reproduzir vídeo: Thumbnail sintética de teste 1');
    process.stdout.write(JSON.stringify({ width, ...initial, playback: 'iframe added on click', escape: 'modal closed and trigger focused' }) + '\n');
  }

  await navigate('empty.html');
  assert.equal(await evaluate('document.querySelectorAll("[data-fwr-nichelle-video-gallery]").length'), 0);
  process.stdout.write('empty config: no gallery mounted\n');
  await navigate('offline.html');
  assert.equal(await evaluate('document.querySelectorAll("[data-fwr-nichelle-video-gallery]").length'), 0);
  process.stdout.write('network error: no gallery mounted\n');
} finally {
  const exited = processChrome.exitCode !== null ? Promise.resolve() : new Promise(resolve => processChrome.once('exit', resolve));
  if (socket?.readyState === WebSocket.OPEN) await send?.('Browser.close').catch(() => {});
  socket?.close();
  processChrome.kill();
  await Promise.race([exited, new Promise(resolve => setTimeout(resolve, 3000))]);
  try { rmSync(profile, { recursive: true, force: true, maxRetries: 8, retryDelay: 250 }); } catch {}
}
