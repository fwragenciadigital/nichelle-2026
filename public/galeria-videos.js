/* FWR Nichelle 2026: gallery runtime. No jQuery, no native LI overrides. */
(function(){
"use strict";
const script=document.currentScript;
if(!script||window.__FWR_NICHELLE_VIDEO_RUNTIME__)return;
window.__FWR_NICHELLE_VIDEO_RUNTIME__=true;
if(script.dataset.previewOnly==="true"&&new URLSearchParams(location.search).get("fwr_nichelle_preview")!=="1")return;
const url=script.dataset.configUrl,selector=script.dataset.target||"#corpo";
if(!url)return;
let modal,lastFocus,overflow;
function absolute(raw,base){
  if(typeof raw!=="string"||!raw.trim())return "";
  try{const u=new URL(raw.trim(),base);if(u.protocol!=="https:"&&!(location.hostname==="localhost"&&u.protocol==="http:"))return "";return u.href;}
  catch{return "";}
}
function vimeo(url){
  try{const u=new URL(url),m=u.pathname.match(/(?:^|\/)(\d{6,12})(?:$|\/)/);
    if(!["vimeo.com","www.vimeo.com","player.vimeo.com"].includes(u.hostname)||!m)return "";
    return "https://player.vimeo.com/video/"+m[1]+"?autoplay=1&title=0&byline=0";
  }catch{return "";}
}
function close(){
 if(!modal)return;
 const video=modal.querySelector("video");if(video){video.pause();video.removeAttribute("src");video.load();}
 const iframe=modal.querySelector("iframe");if(iframe)iframe.removeAttribute("src");
 modal.remove();modal=null;document.body.style.overflow=overflow;document.removeEventListener("keydown",keys);
 if(lastFocus&&lastFocus.isConnected)lastFocus.focus();
}
function keys(e){
 if(e.key==="Escape"){e.preventDefault();close();}
 if(e.key==="Tab"&&modal){
   const nodes=[...modal.querySelectorAll("button,video[controls],iframe")];
   if(e.shiftKey&&document.activeElement===nodes[0]){e.preventDefault();nodes[nodes.length-1].focus();}
   else if(!e.shiftKey&&document.activeElement===nodes[nodes.length-1]){e.preventDefault();nodes[0].focus();}
 }
}
function play(item,button,base){
 const src=absolute(item.videoUrl,base);if(!src)return;
 if(item.provider==="vimeo"&&!vimeo(src))return;
 lastFocus=button;overflow=document.body.style.overflow;
 modal=document.createElement("div");modal.className="fwr-nichelle-video-modal";
 const dialog=document.createElement("div");dialog.className="fwr-nichelle-video-modal__dialog";
 dialog.setAttribute("role","dialog");dialog.setAttribute("aria-modal","true");dialog.setAttribute("aria-label","Vídeo: "+(item.alt||"produto"));
 const exit=document.createElement("button");exit.type="button";exit.className="fwr-nichelle-video-modal__close";exit.textContent="×";exit.setAttribute("aria-label","Fechar vídeo");exit.addEventListener("click",close);
 dialog.appendChild(exit);
 if(item.provider==="vimeo"){
   const iframe=document.createElement("iframe");iframe.className="fwr-nichelle-video-modal__media";
   iframe.title=item.alt||"Vídeo Nichelle";iframe.allow="autoplay;fullscreen;picture-in-picture";iframe.allowFullscreen=true;
   iframe.referrerPolicy="strict-origin-when-cross-origin";iframe.src=vimeo(src);dialog.appendChild(iframe);
 }else{
   const video=document.createElement("video");video.className="fwr-nichelle-video-modal__media";video.controls=true;
   video.setAttribute("playsinline","");video.preload="metadata";video.src=src;dialog.appendChild(video);
 }
 modal.appendChild(dialog);modal.addEventListener("click",e=>{if(e.target===modal)close();});
 document.body.appendChild(modal);document.body.style.overflow="hidden";document.addEventListener("keydown",keys);exit.focus();
 const video=dialog.querySelector("video");if(video)video.play().catch(()=>{});
}
function mount(cfg,base){
 if(!document.body.classList.contains("pagina-inicial"))return;
 const data=cfg&&cfg.modules&&cfg.modules.videoGallery;
 if(!data||data.enabled!==true||!Array.isArray(data.items))return;
 const items=data.items.filter(i=>i&&i.enabled!==false&&absolute(i.posterUrl,base)).slice(0,12);
 const anchor=document.querySelector(selector);
 if(!anchor||!items.length||document.querySelector("[data-fwr-nichelle-video-gallery]"))return;
 const section=document.createElement("section");section.className="fwr-nichelle-videos";section.dataset.fwrNichelleVideoGallery="1";
 section.setAttribute("aria-label",data.title||"Vídeos de produtos");
 if(data.title){const h=document.createElement("h2");h.className="fwr-nichelle-videos__heading";h.textContent=data.title;section.appendChild(h);}
 const track=document.createElement("div");track.className="fwr-nichelle-videos__track";
 items.sort((a,b)=>(Number(a.order)||0)-(Number(b.order)||0)).forEach((item,index)=>{
   const poster=absolute(item.posterUrl,base),src=absolute(item.videoUrl,base);
   const hasVideo=!!src&&(item.provider!=="vimeo"||!!vimeo(src));
   const card=document.createElement("button");card.type="button";card.className="fwr-nichelle-videos__card";
   card.disabled=!hasVideo;
   card.setAttribute("aria-label",(hasVideo?"Reproduzir vídeo: ":"Vídeo em preparação: ")+(item.alt||"Produto "+(index+1)));
   if(item.demoPoster===true)card.classList.add("fwr-nichelle-videos__card--demo");
   const img=document.createElement("img");img.className="fwr-nichelle-videos__poster";img.src=poster;img.alt=item.alt||"Produto Nichelle";
   img.width=450;img.height=800;img.decoding="async";img.loading="lazy";card.appendChild(img);
   if(!item.demoPoster){
     const icon=document.createElement("span");icon.className="fwr-nichelle-videos__play";icon.setAttribute("aria-hidden","true");
     icon.innerHTML='<svg viewBox="0 0 48 48"><path d="M11 5 Q11 2 15 4 L42 21 Q46 24 42 27 L15 44 Q11 46 11 42 Z"/></svg>';
     card.appendChild(icon);
   }
   if(!hasVideo){const tag=document.createElement("span");tag.className="fwr-nichelle-videos__tag";tag.textContent="Prévia de layout";card.appendChild(tag);}
   else card.addEventListener("click",()=>play(item,card,base));
   track.appendChild(card);
 });
 section.appendChild(track);anchor.appendChild(section);
}
function start(){
 const base=new URL(url,location.href).href;
 fetch(base,{cache:"no-cache",credentials:"same-origin"}).then(r=>{if(!r.ok)throw Error("HTTP "+r.status);return r.json();})
 .then(data=>mount(data,base)).catch(e=>console.warn("[Nichelle] Configuração indisponível:",e.message));
}
if(document.readyState==="loading")document.addEventListener("DOMContentLoaded",start,{once:true});else start();
})();
