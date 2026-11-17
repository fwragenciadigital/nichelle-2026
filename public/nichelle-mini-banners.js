/* Nichelle Imports 2026 — Mini Banner nativo (LI) v1.1
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
// O tema Groom e variantes da LI podem renderizar o mesmo tipo em locais diferentes.
// "banners-extras" tambem fica oculto visualmente na home FWR, mas permanece no DOM.
const SOURCE=[
 ".row-fluid.banner.mini-banner",".banner.mini-banner",".banner.mini",
 ".mini-banner",".minibanner",".mini-banners",".minibanners",
 ".banner-mini",".banners-mini","#banner-mini","#mini-banner","#mini-banners",
 ".banners-extras",
 "[data-banner-posicao*='mini' i]","[data-banner-position*='mini' i]",
 "[data-banner-tipo*='mini' i]","[data-banner-type*='mini' i]"
].join(",");
const ALT_SOURCE='img[alt*="mini banner" i],img[alt*="minibanner" i],img[title*="mini banner" i]';
const EXCLUDED=".slick-cloned,.owl-item.cloned,.swiper-slide-duplicate,"+
 ".banner-full,.banner.cheio,.banner.full,.banner-principal,.banner-slider,"+
 ".banner-tarja,.banner-vitrine,.banner-lateral,.fullbanner,.full-banner,"+
 ".n27-approved-category,.n27-full__slide,[data-n27-mini-clone]";
const LIMIT=4;
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
  img?.getAttribute("data-lazy-src"),img?.getAttribute("data-lazy"),
  img?.getAttribute("data-image"),img?.getAttribute("data-srcset"),
  img?.getAttribute("srcset"),img?.getAttribute("src"),img?.currentSrc];
 for(const raw of choices){
  const first=typeof raw==="string"?raw.split(",")[0].trim().split(/\s+/)[0]:"";
  const result=safeURL(first,true);
  if(result&&!/data:image|blank\.gif|placeholder/i.test(result))return result;
 }
 return"";
}
function roots(){
 // Busca banners existentes no HTML publicado pela LI, inclusive layouts com
 // .banners-extras oculto pelo tema. Nunca usa o painel administrativo privado.
 const found=[...document.querySelectorAll(SOURCE)].filter(root=>
   !root.closest("#"+ID+",.n27-shorts,.n27-best-shelf") &&
   !root.matches(EXCLUDED) && !root.closest(EXCLUDED));
 // Evita repetir a mesma imagem quando pai e filho sao identificados.
 const unique=found.filter((root,i)=>!found.some((parent,j)=>
   i!==j&&parent!==root&&parent.contains(root)));
 if(unique.length)return unique;
 // A LI costuma usar o Nome do banner como texto alternativo da imagem.
 // Na captura do lojista ele e "Mini Banner - One".
 return [...document.querySelectorAll(ALT_SOURCE)].filter(img=>
   !img.closest("#"+ID+",.n27-shorts,.n27-best-shelf,"+EXCLUDED));
}
function mobileSource(img){
 const picture=img?.closest("picture");
 const source=picture?.querySelector('source[media*="max-width"],source[media*="max-device-width"]');
 const raw=source?.getAttribute("data-srcset")||source?.getAttribute("srcset")||
   img?.getAttribute("data-mobile-src")||img?.getAttribute("data-src-mobile")||"";
 const part=typeof raw==="string"?raw.trim().split(",")[0].trim().split(/\s+/)[0]:"";
 return safeURL(part,true);
}
function backgroundURL(element){
 const values=[
  element?.getAttribute?.("data-background"),
  element?.getAttribute?.("data-bg"),
  element?.getAttribute?.("data-background-image"),
  element?.getAttribute?.("style")
 ];
 for(const raw of values){
  if(typeof raw!=="string"||!raw.trim())continue;
  const m=raw.match(/url\(\s*["']?([^"')]+)["']?\s*\)/i);
  const image=m?.[1]||(!raw.includes(";")&&!raw.includes(":")?raw.trim():"");
  const url=safeURL(image,true);
  if(url)return url;
 }
 return"";
}
function collect(){
 const output=[],seen=new Set();
 const groups=roots();
 for(const root of groups){
  const imgs=root.matches("img")?[root]:[...root.querySelectorAll("img")];
  for(const img of imgs){
   if(img.closest(EXCLUDED)||img.closest("#"+ID))continue;
   const src=imageURL(img);
   if(!src)continue;
   // Em HTML nativo com <picture>, apenas o <img> representa o banner;
   // <source> fornece a imagem especifica do mobile, quando publicada.
   const a=img.closest("a[href]")||root.closest("a[href]")||
     (root.matches("a[href]")?root:null);
   const href=a?safeURL(a.getAttribute("href"),false):"";
   const mobile=mobileSource(img);
   const key=src+"|"+href+"|"+mobile;
   if(seen.has(key))continue;
   seen.add(key);
   output.push({src,mobile,href,alt:text(img.getAttribute("alt")||
     a?.getAttribute("title")||img.getAttribute("title")||"Mini banner Nichelle Imports"),
     blank:a?.getAttribute("target")==="_blank"});
   if(output.length>=LIMIT)return output;
  }
 }
 // Algunos temas desenham banners como background-image em vez de <img>.
 // Ler apenas os elementos dentro dos containers identificados como banners.
 if(!output.length&&groups.length){
  for(const root of groups){
   const nodes=[root,...root.querySelectorAll('[style*="background-image"],[data-background],[data-bg],[data-background-image]')];
   for(const element of nodes){
    if(element.closest(EXCLUDED)||element.closest("#"+ID))continue;
    const src=backgroundURL(element);if(!src)continue;
    const a=element.closest("a[href]")||root.closest("a[href]")||
      (root.matches("a[href]")?root:null);
    const href=a?safeURL(a.getAttribute("href"),false):"";
    const key=src+"|"+href+"|";
    if(seen.has(key))continue;seen.add(key);
    output.push({src,mobile:"",href,alt:text(element.getAttribute("aria-label")||
      a?.getAttribute("title")||element.getAttribute("title")||
      "Mini banner Nichelle Imports"),blank:a?.getAttribute("target")==="_blank"});
    if(output.length>=LIMIT)return output;
   }
  }
 }
 // Em alguns temas o container nao recebe o nome 'mini' e
 // somente a imagem recebe o nome do banner no atributo alt.
 if(!output.length&&groups.length){
  for(const img of document.querySelectorAll(ALT_SOURCE)){
   if(img.closest(EXCLUDED)||img.closest("#"+ID))continue;
   const src=imageURL(img);if(!src)continue;
   const a=img.closest("a[href]");
   const href=a?safeURL(a.getAttribute("href"),false):"";
   const mobile=mobileSource(img);
   const key=src+"|"+href+"|"+mobile;
   if(seen.has(key))continue;seen.add(key);
   output.push({src,mobile,href,alt:text(img.getAttribute("alt")||
     img.getAttribute("title")||"Mini banner Nichelle Imports"),
     blank:a?.getAttribute("target")==="_blank"});
   if(output.length>=LIMIT)break;
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
  const picture=document.createElement("picture");
  if(banner.mobile){
   const mobile=document.createElement("source");
   mobile.media="(max-width: 767px)";
   mobile.srcset=banner.mobile;
   picture.appendChild(mobile);
  }
  const img=document.createElement("img");
  img.src=banner.src;img.alt=banner.alt;img.width=405;img.height=710;
  img.loading="lazy";img.decoding="async";
  picture.appendChild(img);item.appendChild(picture);grid.appendChild(item);
 }
 host.replaceChildren(grid);
 host.hidden=banners.length===0;
 host.dataset.n27MiniReady="1";
 host.dataset.n27MiniCount=String(banners.length);
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
   return target?.closest?.(".secao-banners,.banners-extras,.mini-banner,.minibanner,.banner-mini,.banners-mini,[data-banner-posicao*='mini' i],[data-banner-position*='mini' i]") ||
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
window.NichelleMiniBanners={
 version:"1.1.0",refresh:schedule,source:"Loja Integrada Mini Banner",
 diagnostico:function(){
  const host=document.getElementById(ID);
  const candidates=roots();
  const published=collect();
  return{
   previewAtivo:allowed(),slotExiste:!!host,
   slotPronto:host?.dataset.n27MiniReady==="1",
   imagensNativas:published.length,
   raizesEncontradas:candidates.length,
   candidatosPorNome:document.querySelectorAll(ALT_SOURCE).length,
   cardsVisiveis:Number(host?.dataset.n27MiniCount||0),
   mensagem:published.length?"Banners encontrados no HTML da loja":
    "O tema nao disponibilizou imagens de Mini Banner no HTML publico."
  };
 }
};
})();
