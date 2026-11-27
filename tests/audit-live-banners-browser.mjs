// Diagnóstico Chromium SOMENTE LEITURA da página pública da Nichelle.
// Não publica screenshots, dados do cliente, cookies nem solicitações autenticadas.
import { spawn } from "node:child_process";
import { readFile, access, mkdtemp, rm } from "node:fs/promises";
import { join } from "node:path";
import { tmpdir } from "node:os";

const delay = ms => new Promise(resolve => setTimeout(resolve, ms));
const candidates = [process.env.CHROME_BIN, "/usr/bin/google-chrome", "/usr/bin/chromium"].filter(Boolean);
let binary;
for (const c of candidates) { try { await access(c); binary = c; break; } catch {} }
if (!binary) { console.log("Sem Chromium neste runner"); process.exit(0); }
const profile = await mkdtemp(join(tmpdir(), "nichelle-banner-audit-"));
let chrome, ws, id = 0;
const pendings = new Map();
async function command(method, params={}) {
  return new Promise((resolve, reject)=>{
    const key = ++id;
    pendings.set(key, {resolve,reject});
    ws.send(JSON.stringify({id:key,method,params}));
  });
}
try {
  chrome = spawn(binary, [
    "--headless=new", "--no-sandbox", "--disable-gpu", "--disable-dev-shm-usage",
    "--no-first-run", "--remote-allow-origins=*", "--remote-debugging-port=0",
    "--user-data-dir="+profile, "about:blank"
  ], {stdio:"ignore"});
  let port;
  for(let i=0;i<150;i++){
    if(chrome.exitCode !== null)break;
    try{
      port=Number((await readFile(join(profile,"DevToolsActivePort"),"utf8")).split("\n")[0]);
      if(port)break;
    }catch{}
    await delay(100);
  }
  if(!port)throw Error("Chromium indisponível");
  const tabs=await(await fetch("http://127.0.0.1:"+port+"/json/list")).json();
  const tab=tabs.find(t=>t.type==="page");
  if(!tab)throw Error("Sem aba");
  ws=new WebSocket(tab.webSocketDebuggerUrl);
  ws.addEventListener("message",event=>{
    const payload=JSON.parse(event.data),stored=pendings.get(payload.id);
    if(!stored)return;
    pendings.delete(payload.id);
    if(payload.error)stored.reject(Error(JSON.stringify(payload.error)));
    else stored.resolve(payload.result);
  });
  await new Promise((resolve,reject)=>{
    ws.addEventListener("open",resolve,{once:true});
    ws.addEventListener("error",reject,{once:true});
  });
  await command("Page.enable");
  await command("Runtime.enable");
  await command("Emulation.setDeviceMetricsOverride",{width:1440,height:900,deviceScaleFactor:1,mobile:false});
  await command("Page.navigate",{url:"https://www.nichelleimports.com.br/cabelos"});
  await delay(6000);
  const expression = String.raw`(function(){
    const slot=document.getElementById("fwr-nichelle-vitrine-slot");
    const cfg=window.FWRNichelle?.bannerVitrine || {};
    const rect=function(node) {
      if(!node)return null;
      const b=node.getBoundingClientRect(),c=getComputedStyle(node);
      return {tag:node.tagName,id:node.id,classes:String(node.className||"").slice(0,120),
        x:Math.round(b.x),y:Math.round(b.y),width:Math.round(b.width),height:Math.round(b.height),
        display:c.display,visibility:c.visibility,opacity:c.opacity,
        overflow:c.overflow,position:c.position,zIndex:c.zIndex,
        maxWidth:c.maxWidth,transform:c.transform,clipPath:c.clipPath};
    };
    const card=slot?.querySelector(".fwr-nichelle-vitrine__card");
    const img=card?.querySelector("img");
    const bounds=card?.getBoundingClientRect();
    const center=bounds?document.elementFromPoint(
      Math.max(0,Math.min(window.innerWidth-1,bounds.left+bounds.width/2)),
      Math.max(0,Math.min(window.innerHeight-1,bounds.top+bounds.height/2))):null;
    return {
      url:location.href,readyState:document.readyState,
      viewport:{w:innerWidth,h:innerHeight,scrollY:scrollY,pageHeight:document.documentElement.scrollHeight},
      slotCSS:rect(slot),sectionCSS:rect(slot?.firstElementChild),
      gridCSS:rect(slot?.querySelector(".fwr-nichelle-vitrine__grid")),
      cardCSS:rect(card),imageCSS:rect(img),
      imageStatus:img&&{complete:img.complete,naturalWidth:img.naturalWidth,naturalHeight:img.naturalHeight,src:img.currentSrc||img.src},
      ancestors:slot&&Array.from((function*(node){for(let i=0;node&&i<9;i++,node=node.parentElement)yield node})(slot)).map(rect),
      cardIsOnscreen:!!(bounds&&bounds.width>0&&bounds.height>0&&bounds.bottom>0&&bounds.top<innerHeight),
      cardCoveredBy:center&&{tag:center.tagName,id:center.id,className:String(center.className||"").slice(0,80)},
      sameSourceCount:document.querySelectorAll('img[alt="mini-pages1"]').length,
      configured:cfg.ativo===true,origin:cfg.origem||"",
      min:cfg.minimo||null,
      runtimeLoaded:window.__FWR_NICHELLE_RUNTIME__===true,
      slotExists:!!slot,slotParent:slot?.parentElement?.className||"",
      mounted:slot?.dataset.fwrInitialized==="1",
      cards:slot?.querySelectorAll(".fwr-nichelle-vitrine__card").length||0,
      bannerImgs:Array.from(document.querySelectorAll("img")).filter(x=>/mini-pages/i.test((x.alt||"")+(x.src||""))).slice(0,10).map(x=>({alt:x.alt,src:x.getAttribute("src")})),
      diagnostic:window.FWRNichelle?.diagnosticoBanners?.()||null
    };
  })()`;
  const check = function (name,report) {
    console.log("DIAGNÓSTICO DOM PÚBLICO "+name+":",JSON.stringify(report,null,2));
    if(!report || !report.runtimeLoaded) throw Error("Runtime Nichelle não disponível em "+name);
    // O admin pode deixar o banner desligado. Isso não é falha do JS:
    // nesses casos marcar como NÃO TESTADO, nunca como sucesso visual.
    if(report.configured !== true) {
      console.log("SKIP (sem homologação visual): banner desativado pela Loja Integrada em "+name);
      return;
    }
    if(!report.slotExists || !report.mounted || report.cards<1 ||
       !report.cardCSS || report.cardCSS.width<30 || report.cardCSS.height<30 ||
       report.cardCSS.display==="none" || report.cardCSS.visibility!=="visible" ||
       !report.imageStatus || !report.imageStatus.complete ||
       report.imageStatus.naturalWidth<1) {
      throw Error("Banner ativo não está visível ou imagem não carregou no viewport "+name);
    }
  };
  const out=await command("Runtime.evaluate",{expression,returnByValue:true});
  check("desktop 1440px",out.result?.value);
  await command("Emulation.setDeviceMetricsOverride",{width:390,height:844,deviceScaleFactor:1,mobile:true});
  await command("Page.navigate",{url:"https://www.nichelleimports.com.br/cabelos"});
  await delay(6000);
  const mobile=await command("Runtime.evaluate",{expression,returnByValue:true});
  check("mobile 390px",mobile.result?.value);
} catch(error) {
  console.error("Auditoria dinâmica falhou:",String(error).slice(0,500));
  process.exitCode=1;
} finally {
  try{ws?.close();}catch{}
  if(chrome && chrome.exitCode===null && chrome.signalCode===null){
    const stopped=new Promise(resolve=>chrome.once("close",resolve));
    chrome.kill("SIGKILL");
    await Promise.race([stopped,delay(2000)]);
  }
  await delay(200);
  await rm(profile,{recursive:true,force:true,maxRetries:8,retryDelay:200});
}
