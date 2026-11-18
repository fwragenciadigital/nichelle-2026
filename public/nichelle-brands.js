/*
 * FWR | Nichelle 2026 — Brands showcase v1.0
 *
 * Images, names, URLs and order come from the brands published by the
 * Loja Integrada panel, via a read-only storefront adapter. No hardcoded
 * brand inventory and no Groom/Slick visual or event dependency.
 * Safe, preview-only; keep LI's own source untouched for storefront data.
 */
(function(){
  "use strict";
  if(!window.Nichelle27Activation?.onStore() ||
     (location.pathname.replace(/\/+$/, "") || "/") !== "/" ||
     !window.Nichelle27Activation?.active()) return;

  const ID="n27-approved-brands", SOURCE=".vitrine-marcas";
  let observer=null, sourceNode=null, queued=false, signature="";
  const txt=(s,max)=>typeof s==="string"?s.replace(/\s+/g," ").trim().slice(0,max):"";
  function allowed(){
  return window.Nichelle27Activation?.active()===true;
 }
  function el(tag,cls,t){
    const n=document.createElement(tag);if(cls)n.className=cls;
    if(t!==undefined)n.textContent=t;return n;
  }
  function safeLink(value) {
    try{
      const u=new URL(value,location.origin);
      if(u.origin!==location.origin||!/^https?:$/.test(u.protocol))return"";
      return u.pathname+u.search;
    }catch(_){return"";}
  }
  function safeImage(value) {
    try{
      const u=new URL(value,location.href);
      if(!/^https?:$/.test(u.protocol)||u.username||u.password)return"";
      return u.href;
    }catch(_){return"";}
  }
  function readConfig(){
    let a=window.Nichelle27Settings?.vitrineMarcas||{};
    const inline=document.getElementById("n27-vitrine-marcas-json");
    if(inline){
      try{
        const x=JSON.parse(inline.textContent);
        if(x&&typeof x==="object"&&!Array.isArray(x))a=x;
      }catch(e){console.warn("[Nichelle Marcas] JSON inválido",e);}
    }
    return{
      ativo:a.ativo!==false,
      prefixo:txt(a.prefixo ?? "Compre as",45),
      titulo:txt(a.titulo ?? "Melhores Marcas",55),
      maxMarcas:Math.min(100,Math.max(1,Number(a.maxMarcas)||60))
    };
  }
  function readNativeBrands(root,max) {
    // Featured brand images are sourced from the Loja Integrada home module.
    // The complete *registered* list is sourced from the category menu.
    // It currently has 43 brands; only 5 images are published in the home.
    // Never invent logos: use name-only fallback for unillustrated brands.
    const normalize=name=>txt(name,150).normalize("NFD")
      .replace(/[\u0300-\u036f]/g,"").toLowerCase().replace(/[^a-z0-9]/g,"");
    const featured=[],featuredByName=new Map();
    for(const a of root.querySelectorAll("a[href]")) {
      if(a.closest(".slick-cloned"))continue;
      const img=a.querySelector("img[src],img[data-src],img[data-original]");
      if(!img)continue;
      const href=safeLink(a.getAttribute("href"));
      const src=safeImage(img.getAttribute("src")||
        img.getAttribute("data-src")||img.getAttribute("data-original"));
      const name=txt(img.getAttribute("alt")||a.getAttribute("title")||a.textContent,100);
      if(!name||!href||!src)continue;
      const key=normalize(name);
      if(featuredByName.has(key))continue;
      const item={name,href,src};
      featured.push(item);featuredByName.set(key,item);
    }
    const menu=[...document.querySelectorAll(".menu-desktop ul.tc-level1 > li")]
      .find(li=>normalize(li.querySelector(":scope > a")?.textContent)==="marcas");
    const registry=[],byName=new Map();
    if(menu){
      for(const a of menu.querySelectorAll("ul.tc-level2 > li > a[href]")){
        const name=txt(a.textContent,100),href=safeLink(a.getAttribute("href"));
        const key=normalize(name);
        if(!name||!href||!key||byName.has(key))continue;
        const matched=featuredByName.get(key);
        const item={name,href,src:matched?.src||""};
        registry.push(item);byName.set(key,item);
      }
    }
    // Put logos already selected by the client first, then the remaining
    // registered brands in their published menu order.
    const result=[],added=new Set();
    for(const source of featured){
      const key=normalize(source.name);
      const entry=byName.get(key)||source;
      if(added.has(key))continue;
      result.push(entry);added.add(key);
    }
    for(const source of registry){
      const key=normalize(source.name);
      if(added.has(key))continue;
      result.push(source);added.add(key);
    }
    return result.slice(0,max);
  }
  function chevron(direction) {
    const button=el("button","n27-brands__arrow n27-brands__arrow--"+direction);
    button.type="button";button.setAttribute("aria-label",
      direction==="prev"?"Marcas anteriores":"Próximas marcas");
    const svg=document.createElementNS("http://www.w3.org/2000/svg","svg");
    svg.setAttribute("viewBox","0 0 24 24");svg.setAttribute("aria-hidden","true");
    svg.setAttribute("fill","none");svg.setAttribute("stroke","currentColor");
    svg.setAttribute("stroke-width","1.8");svg.setAttribute("stroke-linecap","round");
    svg.setAttribute("stroke-linejoin","round");
    const line=document.createElementNS("http://www.w3.org/2000/svg","path");
    line.setAttribute("d",direction==="prev"?"m15 4-8 8 8 8":"m9 4 8 8-8 8");
    svg.appendChild(line);button.appendChild(svg);return button;
  }
  function build(brands,cfg) {
    const root=el("section","n27-brands");
    root.id=ID;root.setAttribute("aria-label","Escolha de marcas Nichelle Imports");
    const container=el("div","n27-brands__inner");
    const heading=el("h2","n27-brands__heading");
    if(cfg.prefixo)heading.appendChild(el("span","",cfg.prefixo+" "));
    heading.appendChild(el("strong","",cfg.titulo));
    container.appendChild(heading);
    const rail=el("div","n27-brands__rail");
    rail.setAttribute("role","region");
    rail.setAttribute("aria-label","Marcas disponíveis na loja");
    rail.setAttribute("tabindex","0");
    for(const b of brands){
      const card=el("a","n27-brands__card");card.href=b.href;
      card.title="Conheça "+b.name;card.setAttribute("aria-label","Ver produtos da marca "+b.name);
      if(b.src){
        const img=el("img","n27-brands__logo");
        img.alt=b.name;img.src=b.src;img.loading="lazy";img.decoding="async";
        img.width=150;img.height=90;
        img.addEventListener("error",()=>{
          img.hidden=true;
          if(!card.querySelector(".n27-brands__fallback")){
            card.appendChild(el("span","n27-brands__fallback",b.name));
          }
        },{once:true});
        card.appendChild(img);
      } else {
        card.classList.add("n27-brands__card--text");
        card.appendChild(el("span","n27-brands__fallback",b.name));
      }
      rail.appendChild(card);
    }
    container.appendChild(rail);
    const controls=el("div","n27-brands__controls");
    controls.append(chevron("prev"),chevron("next"));
    container.appendChild(controls);
    root.appendChild(container);
    const prev=controls.firstElementChild,next=controls.lastElementChild;
    const step=()=>{
      const c=rail.firstElementChild,r=c?.getBoundingClientRect();
      return (r?.width||150)+(parseFloat(getComputedStyle(rail).columnGap)||20);
    };
    const refresh=()=>{
      if(!root.isConnected)return;
      const max=rail.scrollWidth-rail.clientWidth;
      controls.hidden=max<=2;
      prev.disabled=max<=2;
      next.disabled=max<=2;
    };
    prev.addEventListener("click",()=>{
      const max=rail.scrollWidth-rail.clientWidth;
      if(rail.scrollLeft<=1)rail.scrollTo({left:max,behavior:"auto"});
      else rail.scrollBy({left:-step(),behavior:"smooth"});
    });
    next.addEventListener("click",()=>{
      const max=rail.scrollWidth-rail.clientWidth;
      if(rail.scrollLeft>=max-1)rail.scrollTo({left:0,behavior:"auto"});
      else rail.scrollBy({left:step(),behavior:"smooth"});
    });
    rail.addEventListener("scroll",refresh,{passive:true});
    const resize=new ResizeObserver(refresh);resize.observe(rail);
    requestAnimationFrame(refresh);
    return root;
  }
  function render(source,brands,cfg){
    if(!source.parentElement)return;
    const stage=document.getElementById("n27-preview-stage");
    if(!stage||source.parentElement!==stage)return;
    let current=document.getElementById(ID);
    if(!cfg.ativo){
      current?.remove();
      source.removeAttribute("data-n27-brands-source");
      document.documentElement.removeAttribute("data-n27-brands");
      signature="";return;
    }
    if(!brands.length){
      // A loja ainda não publicou marcas: preservar seção antiga.
      current?.remove();
      source.removeAttribute("data-n27-brands-source");
      document.documentElement.removeAttribute("data-n27-brands");
      signature="";return;
    }
    const sig=JSON.stringify([cfg,brands]);
    if(sig===signature&&current&&current.parentElement===stage)return;
    const next=build(brands,cfg);
    source.before(next);
    current?.remove();
    source.dataset.n27BrandsSource="1";
    document.documentElement.dataset.n27Brands="1";
    signature=sig;
  }
  function mount(){
    if(!allowed())return;
    const stage=document.getElementById("n27-preview-stage");
    const source=stage?.querySelector(":scope > "+SOURCE);
    if(!source)return;
    const cfg=readConfig();
    render(source,readNativeBrands(source,cfg.maxMarcas),cfg);
    if(source!==sourceNode){
      observer?.disconnect();
      observer=new MutationObserver(schedule);
      observer.observe(source,{subtree:true,childList:true,attributes:true,
        attributeFilter:["src","href","alt","data-src"]});
      sourceNode=source;
    }
  }
  function schedule(){
    if(queued)return;
    queued=true;setTimeout(()=>{queued=false;mount();},110);
  }
  if(document.readyState==="loading")
    document.addEventListener("DOMContentLoaded",mount,{once:true});
  else mount();
  window.addEventListener("load",mount,{once:true});
  [250,700,1500,3200,4900].forEach(t=>setTimeout(mount,t));
  document.addEventListener("nichelle27:refresh",schedule);
  document.addEventListener("nichelle27:marcas:update",()=>{signature="";schedule();});
  window.NichelleBrands={version:"1.1.0",refresh:schedule,source:"loja-integrada",mode:"registered-menu-and-featured-logos"};
})();
