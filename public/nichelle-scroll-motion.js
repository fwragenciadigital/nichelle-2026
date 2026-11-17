/*
 * Nichelle 2026 — progressive scroll reveal v1.0
 * Only ?nichelle_preview=1 until layout is published. Keeps native LI
 * commerce and navigation fully interactive. No CLS: opacity/transform only.
 * Opts out when prefers-reduced-motion is enabled.
 */
(function(){
  "use strict";
  const isHome=(location.pathname.replace(/\/+$/,"")||"/")==="/";
  if(!/^(www\.)?nichelleimports\.com\.br$/i.test(location.hostname)||
     !isHome||new URLSearchParams(location.search).get("nichelle_preview")!=="1")return;
  const STAGE="n27-preview-stage";
  let io=null,changes=null,pending=false,initialized=false;
  const tracked=new WeakSet();
  const reduced=window.matchMedia("(prefers-reduced-motion: reduce)");
  const config=()=>window.Nichelle27Settings?.movimento||{};
  const allowed=()=>{
    const g=window.Nichelle27Settings?.geral,c=config();
    return !!(g?.ativo===true&&g.modoPreview===true&&g.publicarNaLoja!==true&&c.ativo!==false);
  };
  const clamp=(v,min,max,defaultVal)=>{
    const n=Number(v);return Number.isFinite(n)?Math.max(min,Math.min(max,n)):defaultVal;
  };
  function visible(n){
    const r=n.getBoundingClientRect();
    return r.top<window.innerHeight-40&&r.bottom>0;
  }
  function reveal(el){
    if(!el?.classList.contains("n27-motion-pending"))return;
    el.classList.remove("n27-motion-pending");
    el.classList.add("n27-motion-visible");
    el.style.removeProperty("will-change");
    io?.unobserve(el);
  }
  function observe(el,delay){
    if(!el||tracked.has(el)||el.closest('[hidden],.slick-cloned,[data-n27-clone="1"]'))return;
    tracked.add(el);
    if(reduced.matches||!io)return;
    const cs=getComputedStyle(el),rect=el.getBoundingClientRect();
    if(cs.display==="none"||cs.visibility==="hidden"||rect.height<25||rect.width<60)return;
    if(visible(el))return; // don't hide hero, header, visible widgets.
    el.style.setProperty("--n27-motion-delay",delay+"ms");
    el.style.willChange="opacity,transform";
    el.classList.add("n27-motion-target","n27-motion-pending");
    io.observe(el);
  }
  function collect(){
    const stage=document.getElementById(STAGE);
    if(!stage)return;
    const children=[...stage.children];
    let idx=0;
    const stagger=clamp(config().stagger,0,180,70);
    for(const child of children){
      if(child.id==="n27-approved-hero"||child.id==="n27-approved-benefits")continue;
      observe(child,Math.min(190,(idx++%3)*stagger));
    }
    // Give the editorial cards a subtle independent motion, without
    // changing sizes, layouts or the individual card hover transforms.
    const news=document.getElementById("n27-approved-news");
    if(news){
      const cards=[...news.querySelectorAll(".n27-news__featured,.n27-news__item")];
      cards.forEach((card,i)=>observe(card,Math.min(180,i*stagger)));
    }
    const footer=document.querySelector("#rodape");
    if(footer && footer.getBoundingClientRect().height>120){
      observe(footer,0);
    }
  }
  function schedule(){
    if(pending)return;
    pending=true;
    window.requestAnimationFrame(()=>{pending=false;collect();});
  }
  function init(){
    if(!allowed()||initialized)return;
    initialized=true;
    const c=config();
    document.documentElement.style.setProperty("--n27-motion-duration",
      clamp(c.duracao,250,1200,690)+"ms");
    document.documentElement.style.setProperty("--n27-motion-distance",
      clamp(c.deslocamento,4,64,22)+"px");
    document.documentElement.dataset.n27Motion="1";
    if(!reduced.matches && "IntersectionObserver" in window){
      io=new IntersectionObserver(entries=>{
        entries.forEach(entry=>{
          if(entry.isIntersecting)reveal(entry.target);
        });
      },{threshold:0.075,rootMargin:"0px 0px -8% 0px"});
    }
    collect();
    changes=new MutationObserver(schedule);
    const root=document.getElementById(STAGE);
    if(root)changes.observe(root,{childList:true,subtree:true});
    document.addEventListener("nichelle27:motion:refresh",schedule);
    document.addEventListener("nichelle27:refresh",schedule);
    reduced.addEventListener?.("change",()=>{
      if(reduced.matches){
        document.querySelectorAll(".n27-motion-pending").forEach(reveal);
        io?.disconnect();io=null;
      }
    });
  }
  if(document.readyState==="loading")document.addEventListener("DOMContentLoaded",init,{once:true});
  else init();
  window.addEventListener("load",schedule,{once:true});
  [400,1200,2400].forEach(t=>setTimeout(()=>{init();schedule();},t));
  window.NichelleMotion={
    version:"1.0.0",refresh:schedule,
    get stats(){return{
      pending:document.querySelectorAll(".n27-motion-pending").length,
      visible:document.querySelectorAll(".n27-motion-visible").length,
      reduced:reduced.matches
    };}
  };
})();
