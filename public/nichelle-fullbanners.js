/* Nichelle Imports 2026 — FULLBANNER nativo v1.0
 * Usa SOMENTE banners publicados pela Loja Integrada e presentes no DOM.
 * Preserva origem (painel), imagem mobile, links e ordem. Sem placeholder.
 * Isolado da loja normal: executa apenas com ?nichelle_preview=1.
 */
(function(){
"use strict";
const path=location.pathname.replace(/\/+$/,"")||"/";
if(!/^(www\.)?nichelleimports\.com\.br$/i.test(location.hostname)||
 path!=="/"||!window.Nichelle27Activation?.active())return;
const ID="n27-approved-hero";
const ROOTS=[
 ".secao-banners .banner.cheio",
 ".secao-banners .banner.full",
 ".secao-banners .banner-full",
 ".secao-banners .banner-fullbanner",
 ".secao-banners .fullbanner",
 ".secao-banners .full-banner",
 ".secao-banners .banner-principal",
 ".secao-banners .banner-slider",
 "#banner-full",
 "#fullbanner",
 "[data-banner-posicao='fullbanner']",
 "[data-banner-position='fullbanner']",
 "[data-banner-posicao='full']",
 "[data-banner-position='full']"
].join(",");
const EXCLUDED=".mini-banner,.minibanner,.banner-tarja,.banner-lateral,.banner-vitrine,.slick-cloned,.owl-item.cloned,.swiper-slide-duplicate,[data-n27-full-clone]";
const MAX=12;
let signature="",observer=null,queued=false,rotateTimer=null,slideIndex=0,eventsController=null;
function allowed() {
    return window.Nichelle27Activation?.active() === true;
  }
function config(){
 const s=window.Nichelle27Settings?.fullBanners||window.Nichelle27Settings?.fullBanner||{};
 return{
  ativo:s.ativo!==false,
  autoplay:s.autoplay!==false,
  intervalo:Math.min(20000,Math.max(4000,Number(s.intervalo)||6500)),
  limite:Math.min(MAX,Math.max(1,Number(s.limite)||MAX))
 };
}
function safeUrl(raw){
 if(typeof raw!=="string"||!raw.trim()||raw.trim()==="#")return "";
 try{
  const u=new URL(raw.trim(),location.href);
  return ["https:","http:"].includes(u.protocol)&&!u.username&&!u.password?u.href:"";
 }catch(_){return "";}
}
function sourceUrl(raw){
 if(!raw||typeof raw!=="string")return "";
 const first=raw.trim().split(",")[0].trim().split(/\s+/)[0];
 const url=safeUrl(first);
 return url&&url.startsWith("https://")&&!/\b(?:blank|placeholder)\.(?:gif|png)|data:image/i.test(url)?url:"";
}
function imageUrl(img){
 if(!img)return "";
 const attrs=["data-src","data-lazy","data-lazy-src","data-original","data-image","src","data-srcset","srcset"];
 for(const name of attrs){
  const value=sourceUrl(img.getAttribute(name));
  if(value)return value;
 }
 return sourceUrl(img.currentSrc);
}
function getRoots(){
 const matches=[...document.querySelectorAll(ROOTS)].filter(el=>
   !el.closest("#"+ID)&&!el.matches(EXCLUDED)&&!el.closest(".n27-approved-category"));
 if(matches.length)return matches.filter((el,i)=>!matches.some((parent,j)=>
   i!==j&&parent!==el&&parent.contains(el)));
 // Alguns temas usam apenas .banner dentro de .secao-banners.
 return [...document.querySelectorAll(".secao-banners .banner")].filter(el=>
   !el.matches(EXCLUDED)&&!el.closest(".mini-banner,.minibanner,.banner-tarja,.banner-lateral,.banner-vitrine") &&
   !el.closest("#"+ID));
}
function isMobileImage(img){
 const s=(img.className&&typeof img.className==="string"?img.className:"")+" "+
   (img.getAttribute("media")||"");
 return /mobile|celular|visible-phone|only-mobile|show-phone/i.test(s);
}
function mobileImage(slide,desktop,images){
 for(const img of images){
  if(img!==desktop&&isMobileImage(img)){
   const src=imageUrl(img);if(src)return src;
  }
 }
 const picture=desktop?.closest("picture");
 if(picture){
  for(const source of picture.querySelectorAll("source[media]")){
   const media=source.getAttribute("media")||"";
   if(/max-width|max-device-width/i.test(media)){
    const url=sourceUrl(source.getAttribute("srcset")||source.getAttribute("data-srcset"));
    if(url)return url;
   }
  }
 }
 for(const attr of ["data-mobile-src","data-src-mobile","data-image-mobile","data-mobile"]){
  const src=sourceUrl(slide.getAttribute?.(attr)||desktop?.getAttribute?.(attr));
  if(src)return src;
 }
 return "";
}
function collect(){
 const result=[],seen=new Set();
 for(const root of getRoots()){
  const all=root.matches("img")?[root]:[...root.querySelectorAll("img")];
  const grouped=new Map();
  for(const img of all){
   if(img.closest(EXCLUDED)||img.closest("#"+ID))continue;
   const group=img.closest(".slides > li,.slick-slide,.swiper-slide,.owl-item,.banner-item,.banner-slide,.carousel-item,.slide");
   const key=group&&root.contains(group)?group:(img.closest("a[href]")||img);
   if(!grouped.has(key))grouped.set(key,[]);
   grouped.get(key).push(img);
  }
  for(const [node,imgs] of grouped){
   const desktop=imgs.find(img=>!isMobileImage(img)&&imageUrl(img))||imgs.find(img=>imageUrl(img));
   if(!desktop)continue;
   let src=imageUrl(desktop);if(!src)continue;
   const desktopPicture=desktop.closest("picture");
   if(desktopPicture){
     const wide=[...desktopPicture.querySelectorAll("source[media]")]
       .find(el=>/min-width|min-device-width/i.test(el.getAttribute("media")||""));
     const alternative=sourceUrl(wide?.getAttribute("srcset")||wide?.getAttribute("data-srcset"));
     if(alternative)src=alternative;
   }
   const slide=node.matches?.("img")?desktop:node;
   const a=desktop.closest("a[href]")||slide.querySelector?.("a[href]")||
     root.closest("a[href]");
   const href=a?safeUrl(a.getAttribute("href")):"";
   let mobile=mobileImage(slide,desktop,imgs);
   // Quando o <picture> usa a imagem base no mobile e um <source> desktop,
   // preservar os dois arquivos, sem forcar crop da imagem desktop no celular.
   if(desktopPicture&&src!==imageUrl(desktop)&&!mobile)mobile=imageUrl(desktop);
   const key=src+"|"+href+"|"+mobile;
   if(seen.has(key))continue;seen.add(key);
   result.push({
    src,mobile,href,blank:a?.getAttribute("target")==="_blank",
    alt:(desktop.getAttribute("alt")||a?.getAttribute("title")||
      slide.getAttribute?.("aria-label")||"Banner Nichelle Imports").trim().slice(0,160)
   });
   if(result.length>=MAX)return result;
  }
 }
 return result;
}
function el(tag,cls,txt){
 const x=document.createElement(tag);
 if(cls)x.className=cls;
 if(txt!==undefined)x.textContent=txt;
 return x;
}
function clearRotation(){
 if(rotateTimer){clearInterval(rotateTimer);rotateTimer=null;}
}
function setActive(hero,index){
 const slides=[...hero.querySelectorAll(".n27-full__slide")];
 const dots=[...hero.querySelectorAll(".n27-full__dot")];
 if(!slides.length)return;
 slideIndex=(index+slides.length)%slides.length;
 slides.forEach((s,i)=>{
  const active=i===slideIndex;
  s.hidden=!active;
  s.setAttribute("aria-hidden",active?"false":"true");
  s.setAttribute("tabindex",active?"0":"-1");
 });
 dots.forEach((d,i)=>{
  d.setAttribute("aria-current",i===slideIndex?"true":"false");
  d.setAttribute("aria-label","Exibir banner "+(i+1)+" de "+slides.length);
 });
}
function render(){
 if(!allowed())return;
 const stage=document.getElementById("n27-preview-stage");
 const hero=document.getElementById(ID);
 if(!stage||!hero||hero.parentElement!==stage)return;
 const cfg=config(),banners=cfg.ativo?collect().slice(0,cfg.limite):[];
 const key=JSON.stringify([cfg,banners]);
 if(signature===key&&hero.dataset.n27FullReady==="1")return;
 signature=key;
 clearRotation();
 eventsController?.abort();
 eventsController=new AbortController();
 document.querySelectorAll('[data-n27-native-full-source="1"]').forEach(el=>{
   delete el.dataset.n27NativeFullSource;
 });
 if(!banners.length){
  hero.replaceChildren();
  hero.hidden=true;hero.dataset.n27FullReady="0";
  document.documentElement.dataset.n27NativeFullbanner="0";
  return;
 }
 // Identifica a origem exata no DOM para omitir somente o FULLBANNER
 // nativo quando a nova vitrine ja estiver pronta para exibir.
 getRoots().forEach(el=>{el.dataset.n27NativeFullSource="1";});
 const track=el("div","n27-full__track");
 track.setAttribute("aria-label","Banners de destaque da Nichelle Imports");
 const multiple=banners.length>1;
 const first=slideIndex<banners.length?slideIndex:0;
 banners.forEach((banner,i)=>{
  const node=el(banner.href?"a":"div","n27-full__slide");
  if(banner.href){
   node.href=banner.href;
   if(banner.blank){node.target="_blank";node.rel="noopener noreferrer";}
  }
  const picture=document.createElement("picture");
  if(banner.mobile){
   const src=document.createElement("source");
   src.media="(max-width: 767px)";
   src.srcset=banner.mobile;
   picture.append(src);
  }
  const image=el("img","n27-full__image");
  image.src=banner.src;
  image.alt=banner.alt;
  image.width=1920;image.height=600;
  image.loading=i===0?"eager":"lazy";
  image.decoding="async";
  if(i===0)image.fetchPriority="high";
  picture.append(image);node.append(picture);track.append(node);
 });
 hero.replaceChildren(track);
 if(multiple){
  const controls=el("div","n27-full__controls");
  const previous=el("button","n27-full__arrow n27-full__arrow--previous","‹");
  const next=el("button","n27-full__arrow n27-full__arrow--next","›");
  previous.type="button";next.type="button";
  previous.setAttribute("aria-label","Banner anterior");
  next.setAttribute("aria-label","Próximo banner");
  previous.addEventListener("click",()=>{setActive(hero,slideIndex-1);startRotation();});
  next.addEventListener("click",()=>{setActive(hero,slideIndex+1);startRotation();});
  const dots=el("div","n27-full__dots");
  banners.forEach((_,i)=>{
   const dot=el("button","n27-full__dot");
   dot.type="button";dot.addEventListener("click",()=>{setActive(hero,i);startRotation();});
   dots.append(dot);
  });
  controls.append(previous,dots,next);hero.append(controls);
  const options={signal:eventsController.signal};
  hero.addEventListener("mouseenter",clearRotation,options);
  hero.addEventListener("mouseleave",startRotation,options);
  hero.addEventListener("focusin",clearRotation,options);
  hero.addEventListener("focusout",startRotation,options);
  let startX=0;
  hero.addEventListener("touchstart",ev=>{
   startX=ev.touches?.[0]?.clientX||0;
  },{passive:true,signal:eventsController.signal});
  hero.addEventListener("touchend",ev=>{
   const endX=ev.changedTouches?.[0]?.clientX||0;
   if(Math.abs(startX-endX)>40){setActive(hero,slideIndex+(endX<startX?1:-1));startRotation();}
  },{passive:true,signal:eventsController.signal});
 }
 hero.hidden=false;hero.dataset.n27FullReady="1";
 document.documentElement.dataset.n27NativeFullbanner="1";
 setActive(hero,first);
 startRotation();
 function startRotation(){
  clearRotation();
  if(!multiple||!cfg.autoplay||document.hidden||
    window.matchMedia?.("(prefers-reduced-motion: reduce)")?.matches||
    hero.matches?.(":hover")||hero.contains(document.activeElement))return;
  rotateTimer=setInterval(()=>{if(hero.isConnected)setActive(hero,slideIndex+1);else clearRotation();},cfg.intervalo);
 }
}
function schedule(){
 if(queued)return;queued=true;
 requestAnimationFrame(()=>{queued=false;render();});
}
function watch(){
 if(observer||!document.body||!window.MutationObserver)return;
 observer=new MutationObserver(records=>{
  if(records.some(r=>{
   const t=r.target.nodeType===1?r.target:r.target.parentElement;
   return t?.closest?.(".secao-banners,#banner-full,#fullbanner,[data-banner-position='fullbanner']") ||
    [...r.addedNodes].some(n=>n.nodeType===1&&
     (n.matches?.(ROOTS)||n.querySelector?.(ROOTS)));
  }))schedule();
 });
 observer.observe(document.body,{subtree:true,childList:true,
  attributes:true,attributeFilter:["src","srcset","data-src","data-original","href"]});
}
function init(){render();watch();}
if(document.readyState==="loading")document.addEventListener("DOMContentLoaded",init,{once:true});
else init();
window.addEventListener("load",schedule,{once:true});
document.addEventListener("visibilitychange",()=>{if(document.hidden)clearRotation();else schedule();});
[250,900,1800,3300,5500].forEach(t=>setTimeout(schedule,t));
["nichelle27:refresh","nichelle27:full-banners:update","nichelle27:home:reordered"]
 .forEach(name=>document.addEventListener(name,schedule));
window.NichelleFullBanners={version:"1.0.0",refresh:schedule,source:"Loja Integrada FULLBANNER"};
})();
