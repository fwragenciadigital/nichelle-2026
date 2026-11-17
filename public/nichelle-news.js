/*
 * Nichelle Imports 2026 | Conteúdos para você — FWR v1.0
 * Fidelity to the approved 3-story reference. Read published article data
 * from HTML/Rodapé when available. Demo text from approved mockup is shown
 * only during ?nichelle_preview=1 until real article URLs are configured.
 */
(function(){
  "use strict";
  if(!/^(www\.)?nichelleimports\.com\.br$/i.test(location.hostname) ||
    (location.pathname.replace(/\/+$/,"")||"/")!=="/" ||
    new URLSearchParams(location.search).get("nichelle_preview")!=="1")return;

  const ID="n27-approved-news";
  const CDN="https://cdn.awsli.com.br/2550/2550587/arquivos/";
  const FALLBACK=[
    {
      foto:CDN+"coreana.jpg",
      titulo:"SKINCARE COREANO: A ROTINA DE BELEZA K-BEAUTY EM 10 PASSOS",
      breveTexto:"Descubra os 10 passos da rotina de skincare coreana para uma pele radiante e saudável.",
      data:"2026-10-01",link:""
    },
    {
      foto:CDN+"coreana1.jpg",
      titulo:"NAD+ NO SKINCARE: O QUE É E POR QUE ESTÁ GANHANDO DESTAQUE?",
      breveTexto:"O skincare coreano está cada vez mais conectado à biotecnologia. Entre os ingredientes que vêm despertando curiosidade está o NAD...",
      data:"2026-09-25",link:""
    },
    {
      // Real product photograph from the Nichelle storefront; the screenshot's
      // third editorial photo is not supplied as a standalone asset.
      foto:"https://cdn.awsli.com.br/300x300/2550/2550587/produto/398845857/centella-water-fit-sun-01-j0900wdoft.jpg",
      titulo:"PROTETOR SOLAR NO INVERNO: POR QUE ELE CONTINUA SENDO O ÚLTIMO PASSO DA ROTINA K-BEAUTY",
      breveTexto:"No inverno, a rotina de skincare costuma mudar: a pele pede texturas mais confortáveis, limpeza mais gentil e hidratação reforçada. Mas existe um passo que não...",
      data:"2026-08-11",link:""
    }
  ];
  const plain=(v,n)=>typeof v==="string"?v.replace(/\s+/g," ").trim().slice(0,n):"";
  let lastSignature="";
  let queued=false;

  function allowed(){
    const s=window.Nichelle27Settings?.geral;
    return !!(s && s.ativo && s.modoPreview && !s.publicarNaLoja);
  }
  function safePhoto(raw){
    try{
      const url=new URL(raw,location.href);
      return url.protocol==="https:"&&!url.username&&!url.password?url.href:"";
    }catch(_){return"";}
  }
  function safeArticle(raw){
    if(!raw||typeof raw!=="string")return"";
    try{
      const u=new URL(raw,location.origin);
      if(u.origin!==location.origin||!/^https?:$/.test(u.protocol)||u.username||u.password)return"";
      return u.pathname+u.search+u.hash;
    }catch(_){return"";}
  }
  function dateOf(raw){
    const value=plain(raw,30);
    const match=/^(\d{4})-(\d{2})-(\d{2})$/.exec(value);
    if(!match)return {iso:"",label:value};
    const yy=Number(match[1]),mm=Number(match[2]),dd=Number(match[3]);
    const d=new Date(Date.UTC(yy,mm-1,dd));
    if(d.getUTCFullYear()!==yy||d.getUTCMonth()!==mm-1||d.getUTCDate()!==dd)
      return {iso:"",label:value};
    return{iso:value,label:new Intl.DateTimeFormat("pt-BR",
      {day:"2-digit",month:"long",year:"numeric",timeZone:"UTC"}).format(d)};
  }
  function item(raw){
    if(!raw||typeof raw!=="object")return null;
    const foto=safePhoto(raw.foto||raw.imagem||raw.image||"");
    const titulo=plain(raw.titulo||raw.title,185);
    const resumo=plain(raw.breveTexto||raw.resumo||raw.descricao,350);
    const data=dateOf(raw.data||raw.date||"");
    const link=safeArticle(raw.link||raw.url||"");
    if(!foto||!titulo||!resumo)return null;
    return {foto,titulo,resumo,data,link};
  }
  function settings(){
    const s=window.Nichelle27Settings?.noticiasHome||{};
    const old=window.FWRNichelle?.noticias||{};
    let inline=null;
    const rawInline=document.getElementById("n27-noticias-home-json");
    if(rawInline){try{inline=JSON.parse(rawInline.textContent);}catch(e){
      console.warn("[Nichelle Notícias] JSON inválido",e.message);
    }}
    const custom=inline&&typeof inline==="object"&&!Array.isArray(inline)?inline:s;
    const customItems=Array.isArray(custom.itens)&&custom.itens.length>0;
    const useLegacy=!customItems&&old.ativo===true&&
      Array.isArray(old.itens)&&old.itens.length>0;
    // Configuracao atual no painel tem prioridade sobre o legado.
    const src=useLegacy?old:custom;
    const active=custom.ativo!==false;
    const incoming=Array.isArray(src.itens)&&src.itens.length?src.itens:FALLBACK;
    const valid=incoming.slice(0,3).map(item).filter(Boolean);
    return{
      ativo:active,
      titulo:plain(custom.titulo||"Conteúdos",45),
      destaque:plain(custom.destaque||"para você",50),
      itens:valid,
      // Screenshot content is only a visual mockup until article pages exist.
      demonstracao:!useLegacy && !(Array.isArray(custom.itens)&&custom.itens.length),
      ocultarLinksRodape:old.ocultarLinksRodape===true||custom.ocultarLinksRodape===true
    };
  }
  function tag(name,klass,txt){
    const e=document.createElement(name);
    if(klass)e.className=klass;
    if(txt!==undefined)e.textContent=txt;
    return e;
  }
  function linkOrArticle(kind,href,cls){
    const a=tag(href?"a":"article",cls);
    if(href)a.href=href;
    else a.dataset.n27PendingLink="1";
    return a;
  }
  function image(p,featured){
    const pic=tag("img",featured?"n27-news__hero-img":"n27-news__thumb-img");
    pic.src=p.foto;pic.alt=p.titulo;pic.decoding="async";pic.loading="lazy";
    pic.width=featured?1000:600;pic.height=featured?680:430;
    return pic;
  }
  function metadata(p,featured){
    const meta=tag("div","n27-news__meta");
    if(p.data.label){
      const time=tag("time","n27-news__published","Publicado em "+p.data.label);
      if(p.data.iso)time.dateTime=p.data.iso;
      meta.append(time);
    }
    if(p.link){
      meta.append(tag("span","n27-news__read","Ler mais"));
    }else{
      const pending=tag("span","n27-news__read n27-news__read--pending","Ler mais");
      pending.title="Link disponível após publicar a página de conteúdo";
      meta.append(pending);
    }
    return meta;
  }
  function storyHero(p){
    const card=linkOrArticle("featured",p.link,"n27-news__featured");
    card.append(image(p,true));
    const overlay=tag("div","n27-news__featured-body");
    overlay.append(tag("h3","n27-news__featured-title",p.titulo),
      tag("p","n27-news__featured-summary",p.resumo),metadata(p,true));
    card.append(overlay);
    return card;
  }
  function storySmall(p){
    const card=linkOrArticle("small",p.link,"n27-news__item");
    const thumb=tag("div","n27-news__thumb");
    thumb.append(image(p,false));
    const content=tag("div","n27-news__details");
    content.append(tag("h3","n27-news__item-title",p.titulo),
      tag("p","n27-news__summary",p.resumo),metadata(p,false));
    card.append(thumb,content);
    return card;
  }
  function hideFooterItems(cfg){
    if(!cfg.ocultarLinksRodape)return;
    const set=new Set(cfg.itens.map(x=>x.link).filter(Boolean).map(x=>{
      const u=new URL(x,location.origin);return u.pathname.replace(/\/+$/,"")||"/";
    }));
    if(!set.size)return;
    document.querySelectorAll("#rodape a[href],footer a[href]").forEach(a=>{
      const safe=safeArticle(a.getAttribute("href"));
      if(!safe)return;
      const url=new URL(safe,location.origin);
      if(!set.has(url.pathname.replace(/\/+$/,"")||"/"))return;
      const li=a.closest("li");
      const n=li&&li.querySelectorAll("a[href]").length===1?li:a;
      n.hidden=true;n.dataset.n27ArticleFooterHidden="1";
    });
  }
  function render(cfg){
    const stage=document.getElementById("n27-preview-stage");
    const old=stage?.querySelector(":scope > #n27-approved-editorial");
    if(!stage||!old)return;
    const previous=document.getElementById(ID);
    if(!cfg.ativo||!cfg.itens.length){
      previous?.remove();document.documentElement.removeAttribute("data-n27-news");
      lastSignature="";return;
    }
    hideFooterItems(cfg);
    const key=JSON.stringify([cfg.titulo,cfg.destaque,cfg.itens,cfg.demonstracao]);
    if(key===lastSignature && previous?.parentElement===stage)return;
    const main=tag("section","n27-news");
    main.id=ID;main.setAttribute("aria-label","Conteúdos para você");
    main.dataset.n27Example=cfg.demonstracao?"1":"0";
    const inner=tag("div","n27-news__inner");
    const heading=tag("h2","n27-news__heading");
    heading.append(document.createTextNode(cfg.titulo+" "),tag("strong","",cfg.destaque));
    inner.append(heading);
    const layout=tag("div","n27-news__layout");
    layout.dataset.count=String(cfg.itens.length);
    layout.append(storyHero(cfg.itens[0]));
    if(cfg.itens.length>1){
      const side=tag("div","n27-news__side");
      cfg.itens.slice(1).forEach(p=>side.append(storySmall(p)));
      layout.append(side);
    }
    inner.append(layout);main.append(inner);
    old.before(main);previous?.remove();
    document.documentElement.dataset.n27News="1";
    lastSignature=key;
    document.dispatchEvent(new Event("nichelle27:motion:refresh"));
  }
  function refresh(){
    if(!allowed())return;
    render(settings());
  }
  function schedule(){
    if(queued)return;queued=true;
    setTimeout(()=>{queued=false;refresh();},100);
  }
  if(document.readyState==="loading")document.addEventListener("DOMContentLoaded",schedule,{once:true});
  else schedule();
  window.addEventListener("load",schedule,{once:true});
  [220,700,1700,3500].forEach(t=>setTimeout(schedule,t));
  ["fwr:nichelle:news-config","nichelle27:noticias:update","nichelle27:refresh"]
    .forEach(name=>document.addEventListener(name,()=>{lastSignature="";schedule();}));
  window.NichelleNews={version:"1.1.0",refresh:schedule};
})();
