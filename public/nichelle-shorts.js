/*
 * Nichelle 2026 — Galeria Shorts FWR v1.0
 * Four vertical cards below brands, independent of Groom.
 * Uses the user's original galeria-publicada.json schema and YouTube-only
 * playback. No fabricated video links. Demo cards are explicitly disabled.
 */
(function () {
  "use strict";
  const preview = new URLSearchParams(location.search).get("nichelle_preview") === "1";
  if (!/^(www\.)?nichelleimports\.com\.br$/i.test(location.hostname) ||
      (location.pathname.replace(/\/+$/, "") || "/") !== "/" || !preview) return;

  const ID="n27-approved-shorts";
  const DEFAULT_URL="https://nichelle-2026-git-develop-fwragenciadigitals-projects.vercel.app/galeria-publicada.json";
  const LIMIT=4;
  const shades=["one","two","three","four"];
  let lastSignature="",activeDialog=null,modalCleanup=null,lastFetch="",lastRemote=null,queued=false;
  function allowed(){
    const s=window.Nichelle27Settings?.geral;
    return !!(s && s.ativo===true && s.modoPreview===true && s.publicarNaLoja!==true);
  }
  function el(tag,klass,text){
    const n=document.createElement(tag);
    if(klass)n.className=klass;
    if(text!==undefined)n.textContent=text;
    return n;
  }
  const safeText=(value,max=170)=>typeof value==="string"?value.replace(/\s+/g," ").trim().slice(0,max):"";
  function secureUrl(raw,base){
    if(typeof raw!=="string"||!raw.trim())return"";
    try{
      const u=new URL(raw.trim(),base||location.href);
      if(u.protocol!=="https:"||u.username||u.password)return"";
      return u.href;
    }catch(_){return"";}
  }
  function youtubeId(raw){
    const url=secureUrl(raw);
    if(!url)return"";
    try{
      const u=new URL(url),host=u.hostname.toLowerCase();
      let id="";
      if(host==="youtu.be"||host==="www.youtu.be")id=u.pathname.split("/")[1]||"";
      else if(["youtube.com","www.youtube.com","m.youtube.com","youtube-nocookie.com",
               "www.youtube-nocookie.com"].includes(host)){
        if(u.pathname==="/watch")id=u.searchParams.get("v")||"";
        else id=u.pathname.match(/^\/(?:shorts|embed|live)\/([A-Za-z0-9_-]{11})(?:\/|$)/)?.[1]||"";
      }
      return /^[a-zA-Z0-9_-]{11}$/.test(id)?id:"";
    }catch(_){return"";}
  }
  function config(){
    const s=window.Nichelle27Settings?.galeriaShorts||{};
    let inline=null;
    const slot=document.getElementById("n27-galeria-shorts-json");
    if(slot){
      try{inline=JSON.parse(slot.textContent);}
      catch(e){console.warn("[Nichelle Shorts] JSON inline inválido:",e.message);}
    }
    const chosen=inline && typeof inline==="object"&&!Array.isArray(inline)?inline:s;
    return{
      ativo:chosen.ativo!==false,
      titulo:safeText(chosen.titulo||"",70),
      configUrl:safeText(chosen.configUrl ?? DEFAULT_URL,500),
      items:Array.isArray(chosen.itens)?chosen.itens:
        (Array.isArray(chosen.shorts)?chosen.shorts:[]),
      exibirPrevia:chosen.exibirPrevia!==false
    };
  }
  /* Aceita URL do YouTube/Vimeo ou iframe HTML colado pelo lojista.
     Nunca injeta HTML recebido. Extrai somente src e usa embed allowlist. */
  function iframeSource(raw){
    if(typeof raw!=="string")return "";
    const value=raw.trim();
    const match=value.match(/<iframe\b[^>]*\bsrc\s*=\s*(?:"([^"]+)"|'([^']+)'|([^\s>]+))/i);
    return match?(match[1]||match[2]||match[3]||""):value;
  }
  function videoInfo(raw){
    const url=secureUrl(iframeSource(raw));
    if(!url)return null;
    const yt=youtubeId(url);
    if(yt)return{
      provider:"youtube",id:yt,
      embed:"https://www.youtube-nocookie.com/embed/"+yt+"?autoplay=1&playsinline=1&rel=0"
    };
    try{
      const u=new URL(url),host=u.hostname.toLowerCase();
      if(!["vimeo.com","www.vimeo.com","player.vimeo.com"].includes(host))return null;
      const m=host==="player.vimeo.com"?
        u.pathname.match(/^\/video\/(\d+)(?:\/|$)/):
        u.pathname.match(/^\/(\d+)(?:\/([a-f0-9]+))?(?:\/|$)/i);
      if(!m)return null;
      const videoId=m[1],hash=(u.searchParams.get("h")||m[2]||"");
      if(!/^\d{5,15}$/.test(videoId)||hash&&!/^[a-f0-9]{5,64}$/i.test(hash))return null;
      const embed=new URL("https://player.vimeo.com/video/"+videoId);
      embed.searchParams.set("autoplay","1");
      embed.searchParams.set("title","0");
      embed.searchParams.set("byline","0");
      embed.searchParams.set("portrait","0");
      if(hash)embed.searchParams.set("h",hash);
      return{provider:"vimeo",id:videoId,embed:embed.href};
    }catch(_){return null;}
  }
  function normalizeItem(raw,base,index){
    const o=typeof raw==="string"?{videoUrl:raw}:raw;
    if(!o||typeof o!=="object"||o.enabled===false||o.ativo===false)return null;
    const media=videoInfo(o.videoUrl||o.url||o.iframeUrl||o.embedUrl||
      o.iframe||o.embed||o.src||"");
    if(!media)return null;
    const cover=secureUrl(o.posterUrl||o.capa||o.poster||"",base);
    return{
      ...media,alt:safeText(o.alt||o.titulo||o.descricao||"Vídeo de produto "+(index+1),170),
      poster:cover || (media.provider==="youtube"?
        "https://i.ytimg.com/vi/"+media.id+"/oar2.jpg":""),
      autoPoster:!cover&&media.provider==="youtube"
    };
  }
  function itemsFromPayload(payload,base){
    const gallery=payload?.schemaVersion===1 && payload?.project==="nichelle-2026" ?
      payload?.modules?.videoGallery : null;
    if(!gallery||gallery.enabled!==true||!Array.isArray(gallery.items))return[];
    return gallery.items.filter(x=>x && x.enabled===true)
      .sort((a,b)=>(Number(a.order)||0)-(Number(b.order)||0))
      .slice(0,LIMIT).map((x,i)=>normalizeItem(x,base,i)).filter(Boolean);
  }
  function placeholderPictures(){
    const source=[...document.querySelectorAll(
      "#n27-preview-stage .vitrine-produtos .listagem-item:not(.slick-cloned)"
    )].filter(n=>/medicube/i.test(n.querySelector(".nome-produto")?.textContent||""));
    const list=[],seen=new Set();
    for(const card of source){
      const image=card.querySelector(".imagem-produto img");
      const url=secureUrl(image?.getAttribute("src")||"");
      const name=safeText(image?.alt||card.querySelector(".nome-produto")?.textContent||"",100);
      if(!url || seen.has(url))continue;
      seen.add(url);list.push({poster:url,alt:name});
      if(list.length===LIMIT)break;
    }
    return list;
  }
  function makePlay(){
    const svg=document.createElementNS("http://www.w3.org/2000/svg","svg");
    svg.setAttribute("viewBox","0 0 48 48");
    svg.setAttribute("aria-hidden","true");
    const path=document.createElementNS("http://www.w3.org/2000/svg","path");
    path.setAttribute("d","M13 5c-2 0-3 1.4-3 3.4v31.2c0 2 1.3 3.4 3.3 3.4.6 0 1.4-.2 2-.6l27-15.6a3.4 3.4 0 0 0 0-5.8l-27-15.6A4 4 0 0 0 13 5Z");
    path.setAttribute("fill","currentColor");svg.append(path);return svg;
  }
  function imageFallback(img,item){
    if(!item.autoPoster||item.provider!=="youtube")return;
    let index=0;
    const options=["oardefault.jpg","hqdefault.jpg"];
    const next=()=>{
      if(index===options.length){
        img.hidden=true;
        img.parentElement?.classList.add("n27-shorts__card--no-poster");return;
      }
      img.src="https://i.ytimg.com/vi/"+item.id+"/"+options[index++];
    };
    img.addEventListener("error",next);
    img.addEventListener("load",()=>{
      if(img.naturalWidth>0&&img.naturalWidth<120)next();
    });
  }
  function onEscape(e){
    if(e.key==="Escape"){e.preventDefault();closeVideo();}
    else if(e.key==="Tab"&&activeDialog){
      const controls=[...activeDialog.querySelectorAll('button,[tabindex]:not([tabindex="-1"])')];
      if(!controls.length)return;
      const first=controls[0],last=controls[controls.length-1];
      if(e.shiftKey && document.activeElement===first){e.preventDefault();last.focus();}
      else if(!e.shiftKey && document.activeElement===last){e.preventDefault();first.focus();}
    }
  }
  function closeVideo(){
    if(!activeDialog)return;
    const iframe=activeDialog.querySelector("iframe");
    if(iframe)iframe.removeAttribute("src");
    activeDialog.remove();activeDialog=null;
    if(modalCleanup){modalCleanup();modalCleanup=null;}
  }
  function showVideo(item,trigger){
    if(!item?.embed||activeDialog)return;
    const overlay=el("div","n27-shorts-modal");
    const dialog=el("div","n27-shorts-modal__dialog");
    dialog.setAttribute("role","dialog");
    dialog.setAttribute("aria-modal","true");
    dialog.setAttribute("aria-label","Vídeo: "+item.alt);
    const close=el("button","n27-shorts-modal__close","×");
    close.type="button";close.setAttribute("aria-label","Fechar vídeo");
    close.addEventListener("click",closeVideo);
    const frame=el("iframe","n27-shorts-modal__iframe");
    frame.title=item.alt;frame.allow="autoplay;encrypted-media;fullscreen;picture-in-picture";
    frame.allowFullscreen=true;frame.referrerPolicy="strict-origin-when-cross-origin";
    dialog.append(close,frame);overlay.append(dialog);
    overlay.addEventListener("click",e=>{if(e.target===overlay)closeVideo();});
    const previousOverflow=document.body.style.overflow;
    const prior=[...document.body.children].filter(n=>n!==overlay)
      .map(n=>[n,n.inert,n.getAttribute("aria-hidden")]);
    document.body.append(overlay);
    prior.forEach(([n])=>{n.inert=true;n.setAttribute("aria-hidden","true");});
    document.body.style.overflow="hidden";
    activeDialog=overlay;
    document.addEventListener("keydown",onEscape);
    modalCleanup=()=>{
      document.removeEventListener("keydown",onEscape);
      document.body.style.overflow=previousOverflow;
      prior.forEach(([n,inert,aria])=>{
        n.inert=inert;
        if(aria===null)n.removeAttribute("aria-hidden");
        else n.setAttribute("aria-hidden",aria);
      });
      if(trigger.isConnected)trigger.focus();
    };
    frame.src=item.embed;
    close.focus();
  }
  function createCard(item,index,previewArt){
    const playable=!!item?.embed;
    const card=el(playable?"button":"div",
      "n27-shorts__card n27-shorts__card--"+shades[index]+
      (playable?"":" n27-shorts__card--demo"));
    if(playable){
      card.type="button";
      card.setAttribute("aria-label","Assistir: "+item.alt);
      card.addEventListener("click",()=>showVideo(item,card));
    }else{
      card.setAttribute("role","img");
      card.setAttribute("aria-label","Vídeo em preparação: "+(item?.alt||"Produto Nichelle"));
    }
    const src=item?.poster||previewArt?.poster||"";
    if(src){
      const img=el("img","n27-shorts__poster");
      img.src=src;img.alt=item?.alt||previewArt?.alt||"Prévia de produto Nichelle";
      img.width=450;img.height=800;img.decoding="async";img.loading="lazy";
      img.addEventListener("error",()=>{
        if(!item?.autoPoster){img.hidden=true;card.classList.add("n27-shorts__card--no-poster");}
      },{once:!item?.autoPoster});
      if(item?.autoPoster)imageFallback(img,item);
      card.append(img);
    }
    const overlay=el("span","n27-shorts__shade");
    overlay.setAttribute("aria-hidden","true");card.append(overlay);
    const play=el("span","n27-shorts__play");
    play.setAttribute("aria-hidden","true");play.append(makePlay());
    card.append(play);
    if(!playable)card.append(el("span","n27-shorts__pending","Vídeo em preparação"));
    return card;
  }
  function signature(items,cfg){
    return JSON.stringify([items.map(i=>[i.provider,i.id,i.embed,i.poster,i.alt]),
      cfg.ativo,cfg.titulo,cfg.exibirPrevia]);
  }
  function render(items,cfg){
    const stage=document.getElementById("n27-preview-stage");
    const native=stage?.querySelector(":scope > .vitrine-video");
    if(!stage||!native)return;
    const existing=document.getElementById(ID);
    if(!cfg.ativo || (!items.length&&!cfg.exibirPrevia)){
      existing?.remove();document.documentElement.removeAttribute("data-n27-shorts");
      lastSignature="";return;
    }
    const nextSignature=signature(items,cfg);
    if(existing && existing.parentElement===stage && lastSignature===nextSignature)return;
    const section=el("section","n27-shorts");
    section.id=ID;
    section.setAttribute("aria-label","Vídeos de produtos Nichelle Imports");
    section.dataset.n27Configured=items.length?"1":"0";
    if(cfg.titulo) section.append(el("h2","n27-shorts__heading",cfg.titulo));
    const wrap=el("div","n27-shorts__inner");
    const rail=el("div","n27-shorts__track");
    rail.setAttribute("role","group");
    rail.setAttribute("aria-label",items.length?"Galeria de Shorts":"Prévia da galeria de Shorts");
    const demos=placeholderPictures();
    const count=items.length?Math.min(LIMIT,items.length):(cfg.exibirPrevia?LIMIT:0);
    for(let i=0;i<count;i++)rail.append(createCard(items[i]||null,i,demos[i]));
    wrap.append(rail);section.append(wrap);
    native.before(section);existing?.remove();
    document.documentElement.dataset.n27Shorts="1";
    lastSignature=nextSignature;
  }
  async function loadRemote(url){
    let valid;
    try{
      valid=new URL(url,location.origin);
      const trusted=valid.origin===location.origin||
        valid.hostname==="nichelle-2026-git-develop-fwragenciadigitals-projects.vercel.app"||
        valid.hostname==="cdn.awsli.com.br";
      if(!trusted||valid.protocol!=="https:"||valid.username||valid.password)throw Error("URL não permitida");
    }catch(e){
      console.warn("[Nichelle Shorts] JSON externo não permitido:",e.message);
      return [];
    }
    try{
      const response=await fetch(valid.href,{mode:"cors",credentials:"omit",cache:"no-store"});
      if(!response.ok)throw Error("HTTP "+response.status);
      return itemsFromPayload(await response.json(),valid.href);
    }catch(e){
      console.warn("[Nichelle Shorts] Configuração indisponível:",e.message);
      return [];
    }
  }
  async function refresh(){
    if(!allowed())return;
    const settings=config();
    if(!settings.ativo){render([],settings);return;}
    const inline= settings.items.slice(0,LIMIT)
      .map((o,i)=>normalizeItem(o,location.href,i)).filter(Boolean);
    if(inline.length){render(inline,settings);return;}
    if(settings.configUrl){
      const url=settings.configUrl;
      if(url!==lastFetch){lastFetch=url;lastRemote=loadRemote(url);}
      const selected=await lastRemote;
      // A new panel setting may arrive during a fetch. Never apply stale data.
      if(config().configUrl!==url || !allowed())return;
      render(selected,config());
    }else{
      render([],settings);
    }
  }
  function schedule(){
    if(queued)return;
    queued=true;
    setTimeout(()=>{queued=false;refresh();},110);
  }
  if(document.readyState==="loading")document.addEventListener("DOMContentLoaded",schedule,{once:true});
  else schedule();
  window.addEventListener("load",schedule,{once:true});
  [300,1100,2400].forEach(x=>setTimeout(schedule,x));
  document.addEventListener("nichelle27:refresh",schedule);
  document.addEventListener("nichelle27:shorts:update",()=>{
    lastSignature="";lastFetch="";lastRemote=null;schedule();
  });
  window.NichelleShorts={
    version:"1.1.0",refresh:schedule,
    source:"galeria-publicada.json ou painel Loja Integrada"
  };
})();
