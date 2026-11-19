/* FWR Nichelle 2026: gallery runtime. No jQuery, no native LI overrides. */
(function(){
"use strict";
const script=document.currentScript;
if(!script||window.__FWR_NICHELLE_VIDEO_RUNTIME__)return;
window.__FWR_NICHELLE_VIDEO_RUNTIME__=true;
if(script.dataset.previewOnly==="true"&&new URLSearchParams(location.search).get("fwr_nichelle_preview")!=="1")return;
const url=script.dataset.configUrl,selector=script.dataset.target||"#fwr-nichelle-video-slot";
if(!url)return;
let modal,lastFocus,overflow,inertState=[];
function absolute(raw,base){
  if(typeof raw!=="string"||!raw.trim())return "";
  try{const u=new URL(raw.trim(),base);if(u.protocol!=="https:"&&!(location.hostname==="localhost"&&u.protocol==="http:"))return "";return u.href;}
  catch{return "";}
}
// Somente URLs oficiais do YouTube; nunca transformar um endereço externo em iframe arbitrário.
function youtubeId(raw){
 if(typeof raw!=="string")return "";
 try{
  const u=new URL(raw.trim());
  if(u.protocol!=="https:")return "";
  const host=u.hostname.toLowerCase();
  let id="";
  if(host==="youtu.be"||host==="www.youtu.be"){
    id=u.pathname.split("/")[1]||"";
  }else if(["youtube.com","www.youtube.com","m.youtube.com","youtube-nocookie.com","www.youtube-nocookie.com"].includes(host)){
    if(u.pathname==="/watch")id=u.searchParams.get("v")||"";
    else{
      const m=u.pathname.match(/^\/(?:shorts|embed|live)\/([A-Za-z0-9_-]{11})(?:\/|$)/);
      id=m?m[1]:"";
    }
  }
  return /^[A-Za-z0-9_-]{11}$/.test(id)?id:"";
 }catch{return "";}
}
function youtubePoster(item,base){
 const id=item.provider==="youtube"?youtubeId(item.videoUrl):"";
 const custom=absolute(item.posterUrl,base);
 if(custom)return {src:custom,id:"",automatic:false};
 return id?{src:"https://i.ytimg.com/vi/"+id+"/oar2.jpg",id,automatic:true}:{src:"",id:"",automatic:false};
}
function resolvePoster(item,base){
 if(item.provider==="youtube")return youtubePoster(item,base);
 return {src:"",id:"",automatic:false};
}
function validConfig(cfg){
 const gallery=cfg&&cfg.modules&&cfg.modules.videoGallery;
 if(cfg?.schemaVersion!==1||cfg?.project!=="nichelle-2026"||!gallery||typeof gallery.enabled!=="boolean"||!Array.isArray(gallery.items)||gallery.items.length>4)return false;
 const seen=new Set();
 for(const item of gallery.items){
   if(!item||typeof item.id!=="string"||seen.has(item.id)||typeof item.enabled!=="boolean"||item.provider!=="youtube"||!youtubeId(item.videoUrl)||typeof item.alt!=="string")return false;
   seen.add(item.id);
   if(item.posterUrl&&!/^https:\/\//i.test(item.posterUrl))return false;
 }
 return !gallery.enabled||gallery.items.length===4&&gallery.items.every(item=>item.enabled);
}
function close(){
 if(!modal)return;
 const iframe=modal.querySelector("iframe");if(iframe)iframe.removeAttribute("src");
 modal.remove();modal=null;document.body.style.overflow=overflow;document.removeEventListener("keydown",keys);document.removeEventListener("focusin",guardFocus);
 inertState.forEach(([element,inert,ariaHidden])=>{element.inert=inert;if(ariaHidden===null)element.removeAttribute("aria-hidden");else element.setAttribute("aria-hidden",ariaHidden);});inertState=[];
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
function guardFocus(e){
 if(modal&&!modal.contains(e.target))modal.querySelector(".fwr-nichelle-video-modal__close--sentinel")?.focus();
}
function play(item,button,base){
 const src=absolute(item.videoUrl,base);if(!src)return;
 if(item.provider==="youtube"&&!youtubeId(src))return;
 if(item.provider!=="youtube")return;
 lastFocus=button;overflow=document.body.style.overflow;
 modal=document.createElement("div");modal.className="fwr-nichelle-video-modal";
 const dialog=document.createElement("div");dialog.className="fwr-nichelle-video-modal__dialog";
 dialog.setAttribute("role","dialog");dialog.setAttribute("aria-modal","true");dialog.setAttribute("aria-label","Vídeo: "+(item.alt||"produto"));
 const makeClose=className=>{const button=document.createElement("button");button.type="button";button.className=className;button.textContent="×";button.setAttribute("aria-label","Fechar vídeo");button.addEventListener("click",close);return button;};
 const exit=makeClose("fwr-nichelle-video-modal__close");
 dialog.appendChild(exit);
 const iframe=document.createElement("iframe");iframe.className="fwr-nichelle-video-modal__media";
 iframe.title=item.alt||"Vídeo Nichelle";iframe.allow="autoplay;encrypted-media;fullscreen;picture-in-picture";iframe.allowFullscreen=true;
 iframe.referrerPolicy="strict-origin-when-cross-origin";
 iframe.src="https://www.youtube-nocookie.com/embed/"+youtubeId(src)+"?autoplay=1&playsinline=1&rel=0";
 dialog.appendChild(iframe);
 dialog.appendChild(makeClose("fwr-nichelle-video-modal__close fwr-nichelle-video-modal__close--sentinel"));
 modal.appendChild(dialog);modal.addEventListener("click",e=>{if(e.target===modal)close();});
 document.body.appendChild(modal);inertState=[...document.body.children].filter(element=>element!==modal).map(element=>[element,element.inert,element.getAttribute("aria-hidden")]);
 inertState.forEach(([element])=>{element.inert=true;element.setAttribute("aria-hidden","true");});
 document.body.style.overflow="hidden";document.addEventListener("keydown",keys);document.addEventListener("focusin",guardFocus);exit.focus();
 const video=dialog.querySelector("video");if(video)video.play().catch(()=>{});
}
function mount(cfg,base){
 if(!document.body.classList.contains("pagina-inicial"))return;
 const data=cfg&&cfg.modules&&cfg.modules.videoGallery;
 if(!validConfig(cfg)||!data||data.enabled!==true)return;
 const items=data.items.filter(i=>i&&i.enabled!==false&&resolvePoster(i,base).src).slice(0,4);
 const anchor=document.querySelector(selector);
 if(!anchor||!items.length||document.querySelector("[data-fwr-nichelle-video-gallery]"))return;
 const section=document.createElement("section");section.className="fwr-nichelle-videos";section.dataset.fwrNichelleVideoGallery="1";
 section.setAttribute("aria-label","Vídeos de produtos");
 const track=document.createElement("div");track.className="fwr-nichelle-videos__track";
 items.sort((a,b)=>(Number(a.order)||0)-(Number(b.order)||0)).forEach((item,index)=>{
   const resolved=resolvePoster(item,base),poster=resolved.src,src=absolute(item.videoUrl,base);
   const hasVideo=!!src&&item.provider==="youtube"&&!!youtubeId(src);
   const card=document.createElement("button");card.type="button";card.className="fwr-nichelle-videos__card";
   card.disabled=!hasVideo;
   card.setAttribute("aria-label",(hasVideo?"Reproduzir vídeo: ":"Vídeo em preparação: ")+(item.alt||"Produto "+(index+1)));
   const img=document.createElement("img");img.className="fwr-nichelle-videos__poster";img.src=poster;img.alt=item.alt||"Produto Nichelle";
   img.width=450;img.height=800;img.decoding="async";img.loading="lazy";
   const fallback=document.createElement("span");fallback.className="fwr-nichelle-videos__fallback";fallback.textContent="Prévia indisponível";fallback.hidden=true;
   // Thumbnail vertical de Shorts; fallback apenas se YouTube não disponibilizar o arquivo.
   if(resolved.automatic){
     const backups=["oardefault.jpg","hqdefault.jpg"];
     let idx=0;
     const tryFallback=()=>{
       if(idx>=backups.length){img.hidden=true;fallback.hidden=false;return;}
       img.src="https://i.ytimg.com/vi/"+resolved.id+"/"+backups[idx++];
     };
     img.addEventListener("error",tryFallback);
     img.addEventListener("load",()=>{if(img.naturalWidth>0&&img.naturalWidth<150)tryFallback();});
   }else{
     img.addEventListener("error",()=>{img.hidden=true;fallback.hidden=false;});
   }
   card.appendChild(img);
   card.appendChild(fallback);
   const icon=document.createElement("span");icon.className="fwr-nichelle-videos__play";icon.setAttribute("aria-hidden","true");
   icon.innerHTML='<svg viewBox="0 0 48 48"><path d="M11 5 Q11 2 15 4 L42 21 Q46 24 42 27 L15 44 Q11 46 11 42 Z"/></svg>';
   card.appendChild(icon);
   card.addEventListener("click",()=>play(item,card,base));
   track.appendChild(card);
 });
 section.appendChild(track);anchor.appendChild(section);
}
function start(){
 const base=new URL(url,location.href).href;
 fetch(base,{cache:"no-cache",credentials:"same-origin"}).then(r=>{if(!r.ok)throw Error("HTTP "+r.status);return r.json();})
 .then(data=>{if(!validConfig(data))throw Error("JSON inválido");mount(data,base);}).catch(e=>console.warn("[Nichelle] Configuração indisponível:",e.message));
}
if(document.readyState==="loading")document.addEventListener("DOMContentLoaded",start,{once:true});else start();
})();
