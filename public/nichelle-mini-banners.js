/* Nichelle Imports 2026 — Mini Banner nativo (LI) v1.0
 * Fonte única: banners publicados no painel em posição "Mini Banner".
 * Nenhuma imagem/link demonstrativo é incluído ou substituído.
 * Somente home da loja sob ?nichelle_preview=1 e settings opt-in.
 */
(function(){
"use strict";
const pathname=location.pathname.replace(/\/+$/,"")||"/";
if(!/^(www\.)?nichelleimports\.com\.br$/i.test(location.hostname)||pathname!=="/"||
 new URLSearchParams(location.search).get("nichelle_preview")!=="1")return;
const ID="n27-approved-categories";
const SOURCE=".row-fluid.banner.mini-banner, .banner.mini-banner, .mini-banner, .minibanner, [data-banner-posicao='mini'], [data-banner-position='mini']";
const LIMIT=8;
let lastKey="",scheduled=false,watcher=null;
const text=(val,max=180)=>String(val||"").replace(/\s+/g," ").trim().slice(0,max);
function allowed(){
 const s=window.Nichelle27Settings?.geral;
 return !!(s&&s.ativo===true&&s.modoPreview===true&&s.publicarNaLoja!==true);
}
function config(){
 const s=window.Nichelle27Settings?.miniBanners||window.Nichelle27Settings?.miniBanner||{};
 return {ativo:s.ativo!==false,limite:Math.min(LIMIT,Math.max(1,Number(s.limite)||LIMIT))};
}
function safeURL(raw,image){
 if(typeof raw!=="string"||!raw.trim())return"";
 try{
  const u=new URL(raw.trim(),location.href);
  if(u.username||u.password||!["https:","http:"].includes(u.protocol))return"";
  if(image&&u.protocol!=="https:")return"";
  return u.href;
 }catch(_){return"";}
}
function imageURL(img){
 // LI e temas costumam escrever a URL em atributos lazy loading.
 const choices=[img?.getAttribute("data-src"),img?.getAttribute("data-original"),
  img?.getAttribute("data-lazy-src"),img?.getAttribute("data-srcset"),
  img?.getAttribute("src"),img?.currentSrc];
 for(const raw of choices){
  const first=typeof raw==="string"?raw.split(",")[0].trim().split(/\s+/)[0]:"";
  const result=safeURL(first,true);
  if(result&&!/data:image|blank\.gif|placeholder/i.test(result))return result;
 }
 return"";
}
function roots(){
 // Nao ler os proprios cards FWR; apenas a superficie nativa da LI.
 return [...document.querySelectorAll(SOURCE)].filter(root=>
   !root.closest("#"+ID) &&
   !root.closest(".n27-shorts, .n27-best-shelf") &&
   !root.closest(".slick-cloned") &&
   !root.matches("[data-n27-mini-clone]"));
}
function collect(){
 const output=[],seen=new Set();
 for(const root of roots()){
  const imgs=root.matches("img")?[root]:[...root.querySelectorAll("img")];
  for(const img of imgs){
   if(img.closest(".slick-cloned, .n27-approved-category"))continue;
   const src=imageURL(img);
   if(!src)continue;
   const a=img.closest("a[href]");
   const href=a?safeURL(a.getAttribute("href"),false):"";
   const key=src+"|"+href;
   if(seen.has(key))continue;
   seen.add(key);
   output.push({src,href,alt:text(img.getAttribute("alt")||
     a?.getAttribute("title")||img.getAttribute("title")||"Mini banner Nichelle Imports"),
     blank:a?.getAttribute("target")==="_blank"});
   if(output.length>=LIMIT)return output;
  }
 }
 return output;
}
function render(){
 if(!allowed())return;
 const stage=document.getElementById("n27-preview-stage");
 let host=document.getElementById(ID);
 if(!stage||!host||host.parentElement!==stage)return;
 const cfg=config(),banners=cfg.ativo?collect().slice(0,cfg.limite):[];
 const key=JSON.stringify([cfg,banners]);
 if(key===lastKey&&host.dataset.n27MiniReady==="1")return;
 lastKey=key;
 const grid=document.createElement("div");
 grid.className="n27-approved-container n27-approved-categories__grid";
 grid.setAttribute("role","list");
 grid.dataset.n27Count=String(banners.length);
 for(const banner of banners){
  const item=document.createElement(banner.href?"a":"div");
  item.className="n27-approved-category";
  item.setAttribute("role","listitem");
  if(banner.href){
   item.href=banner.href;
   if(banner.blank){item.target="_blank";item.rel="noopener noreferrer";}
  }
  const img=document.createElement("img");
  img.src=banner.src;img.alt=banner.alt;img.width=405;img.height=710;
  img.loading="lazy";img.decoding="async";
  item.appendChild(img);grid.appendChild(item);
 }
 host.replaceChildren(grid);
 host.hidden=banners.length===0;
 host.dataset.n27MiniReady="1";
 document.documentElement.dataset.n27NativeMiniBanner=banners.length?"1":"0";
}
function schedule(){
 if(scheduled)return;
 scheduled=true;
 requestAnimationFrame(()=>{scheduled=false;render();});
}
function observe(){
 if(watcher||!document.body||!window.MutationObserver)return;
 watcher=new MutationObserver(records=>{
  if(records.some(r=>{
   const target=r.target.nodeType===1?r.target:r.target.parentElement;
   return target?.closest?.(".secao-banners,.mini-banner,.minibanner,[data-banner-posicao='mini'],[data-banner-position='mini']") ||
     [...r.addedNodes].some(n=>n.nodeType===1&&
       (n.matches?.(SOURCE)||n.querySelector?.(SOURCE)));
  }))schedule();
 });
 watcher.observe(document.body,{subtree:true,childList:true,attributes:true,attributeFilter:["src","data-src","data-original","data-lazy-src","href"]});
}
function init(){render();observe();}
if(document.readyState==="loading")document.addEventListener("DOMContentLoaded",init,{once:true});
else init();
window.addEventListener("load",schedule,{once:true});
[250,850,1800,3500,5500].forEach(t=>setTimeout(schedule,t));
["nichelle27:refresh","nichelle27:mini-banners:update","nichelle27:home:reordered"]
 .forEach(evt=>document.addEventListener(evt,schedule));
window.NichelleMiniBanners={version:"1.0.0",refresh:schedule,source:"Loja Integrada Mini Banner"};
})();
