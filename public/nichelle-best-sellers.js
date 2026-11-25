/*
 * FWR • Nichelle Imports 2026 • Vitrines compartilhadas v1.6
 *
 * Component visuals and events are FWR-owned. Product facts are sourced
 * read-only from Loja Integrada's existing product-list HTML, not from
 * theme formatting or theme carousel controls. Sales and checkout stay LI.
 *
 * Custom settings: Nichelle27Settings.vitrineMaisVendidos, or optional
 * <script type="application/json" id="n27-vitrine-mais-vendidos-json">.
 */
(function () {
  "use strict";
  if (!window.Nichelle27Activation?.onStore() ||
      !window.Nichelle27Activation?.active()) return;
  const isHome=(location.pathname.replace(/\/+$/, "")||"/")==="/";

  const SHELVES = [
    {key:"maisVendidos", selector:":is(.vitrine-24488857,.vitrine-mas-vendido,.vitrine-mais-vendidos)", id:"n27-approved-best-sellers",
      settings:"vitrineMaisVendidos", defaultPrefixo:"Produtos", defaultTitulo:"Mais Vendidos"},
    {key:"lancamentos", selector:".vitrine-lancamento", id:"n27-approved-launches",
      settings:"vitrineLancamentos", defaultPrefixo:"Novos", defaultTitulo:"Lançamentos"},
    {key:"destaques", selector:".vitrine-destaque", id:"n27-approved-highlights",
      settings:"vitrineDestaques", defaultPrefixo:"Produtos", defaultTitulo:"Em Destaque"},
    {key:"marcasProdutos", selector:".vitrine-18709305", id:"n27-approved-brand-products",
      settings:"vitrineMarcasProdutos", defaultPrefixo:"Produtos", defaultTitulo:"Por Marca"}
  ];
  const related={key:"aproveiteTambem",selector:".produto-aproveite,.n27-pdp__recommendations,.listagem.aproveite-tambem",
    id:"n27-approved-related-products",settings:"vitrineAproveiteTambem",defaultPrefixo:"",defaultTitulo:"Aproveite Também"};
  const signatures = new Map();
  const diagnostics = new Map();
  const observedSources = new WeakSet();
  let pending = false;

  function enabled(){
  return window.Nichelle27Activation?.active()===true;
 }
  function el(type, cls, text) {
    const n = document.createElement(type);
    if (cls) n.className = cls;
    if (text !== undefined) n.textContent = text;
    return n;
  }
  function safeText(value, max) {return String(value || "").replace(/\s+/g," ").trim().slice(0,max);}
  function sameOriginUrl(raw) {
    if (!raw) return "";
    try {
      const u = new URL(raw, location.origin);
      return /^https?:$/.test(u.protocol) && u.origin === location.origin ?
        u.pathname + u.search + u.hash : "";
    } catch (_) { return ""; }
  }
  function safeImg(raw) {
    if (!raw) return "";
    try {
      const u = new URL(raw, location.href);
      return /^https?:$/.test(u.protocol) && !u.username && !u.password ? u.href : "";
    } catch (_) {return "";}
  }
  // Loja Integrada returns 300x300 thumbnails to the native listagem.
  // FWR cards are much larger; use the verified CDN resize endpoint.
  // Only rewrite Nichelle's product images, never uploaded banners or
  // third-party URLs. Native theme source stays untouched.
  function productArtAt(raw,size) {
    try {
      const u=new URL(raw,location.href);
      if(u.protocol!=="https:"||u.hostname!=="cdn.awsli.com.br"||
        !/^\/\d+x\d+\/\d+\/\d+\/produto\//.test(u.pathname))return raw;
      u.pathname=u.pathname.replace(/^\/\d+x\d+\//,"/"+size+"x"+size+"/");
      return u.href;
    } catch (_) {return raw;}
  }
  function parseMoney(text) {
    const m = safeText(text,150).match(/R\$\s*([\d.]+,\d{2})/i);
    if (!m) return null;
    const v = Number(m[1].replace(/\./g,"").replace(",","."));
    return Number.isFinite(v) && v >= 0 ? v : null;
  }
  const brl = v => new Intl.NumberFormat("pt-BR",{style:"currency",currency:"BRL"}).format(v);
  function selectedConfig(def) {
    const raw = window.Nichelle27Settings?.[def.settings] || {};
    const inlineId = def.key==="maisVendidos" ?
      "n27-vitrine-mais-vendidos-json" : "n27-vitrine-"+def.key+"-json";
    const inline = document.getElementById(inlineId);
    if (inline) {
      try {
        const json=JSON.parse(inline.textContent);
        if (json && typeof json==="object" && !Array.isArray(json)) return json;
      } catch (e) {console.warn("[Nichelle Vitrine] JSON inválido",e);}
    }
    return raw;
  }
  function config(def) {
    const s=selectedConfig(def);
    return {
      ativo:s.ativo !== false,
      prefixo:safeText(s.prefixo ?? def.defaultPrefixo,32),
      titulo:safeText(s.titulo ?? def.defaultTitulo,55),
      exibirSelo:s.exibirSelo !== false,
      exibirPix:s.exibirPix !== false,
      exibirParcelamento:s.exibirParcelamento !== false,
      maxProdutos:Math.min(30,Math.max(1,Number(s.maxProdutos) || 20)),
      loopInfinito:s.loopInfinito !== false
    };
  }
  function extractItem(source) {
    const id=source.dataset.id || source.className.match(/prod-id-(\d+)/)?.[1] || "";
    const href=[".nome-produto[href]","a.produto-sobrepor[href]",".produto-info > a[href]",".imagem-produto a[href]","a[href]"]
      .map(sel=>sameOriginUrl(source.querySelector(sel)?.getAttribute("href"))).find(Boolean)||"";
    const name=safeText(source.querySelector(".nome-produto")?.textContent ||
      source.querySelector(".produto-sobrepor")?.title,170);
    const imageEl=source.querySelector(".imagem-produto img") || source.querySelector("img");
    const img=["data-src","data-original","data-lazy-src","data-lazy","data-imagem-caminho","src"]
      .map(attr=>safeImg(imageEl?.getAttribute(attr)))
      .find(url=>url&&!/blank\.gif|placeholder|loading\.gif/i.test(url))||safeImg(imageEl?.currentSrc);
    if (!href || !name || !img) return null;
    const original=parseMoney(source.querySelector(".preco-venda")?.textContent);
    const promo=parseMoney(source.querySelector(".preco-promocional")?.textContent);
    const standard=parseMoney(source.querySelector(".preco-produto .titulo")?.textContent);
    const current=promo ?? standard ?? original;
    const unavailable=source.matches(".indisponivel,.produto-indisponivel,.esgotado,.sem-estoque")||
      !!source.querySelector(".indisponivel,.produto-indisponivel,.produto-esgotado,.sem-estoque,.avise-me")||
      /(?:avise.me|produto indispon[ií]vel|esgotado|fora de estoque)/i.test(source.textContent||"");
    if(current===null&&!unavailable)return null;
    const oldPrice=!unavailable&&original!==null&&original>current?original:null;
    const percent=oldPrice ? Math.round((1 - current/oldPrice)*100) : null;
    const pixBlock=source.querySelector(".desconto-a-vista, [data-avista], .listagem-avista-2");
    const pixAmount=parseMoney(pixBlock?.textContent);
    const pixLabel=safeText(source.querySelector(".avista-desconto")?.textContent,70);
    const pixPercent=pixLabel.match(/(\d+(?:[.,]\d+)?)\s*%/)?.[1] || "";
    const installment=source.querySelector(".preco-parcela");
    const installmentText=safeText(installment?.textContent,200);
    const installmentMatch=installmentText.match(/(\d+)\s*x\s+de\s+(R\$\s*[\d.,]+)/i);
    const noInterest=/sem juros/i.test(installmentText);
    return {
      id,href,name,img,alt:safeText(imageEl?.alt,170)||name,unavailable,
      oldPrice,current,percent:percent && percent>0?percent:null,
      pix:pixAmount !== null && pixAmount > 0 ? pixAmount : null,
      pixPercent,
      installment:installmentMatch ? {
        count:Number(installmentMatch[1]),
        amount:safeText(installmentMatch[2],50),
        noInterest
      } : null
    };
  }
  function nativeItems(source) {
    return [...source.querySelectorAll(".listagem-item")].filter(item=>
      !item.closest(".slick-cloned,.owl-item.cloned,.swiper-slide-duplicate")&&
      !item.parentElement?.closest(".listagem-item"));
  }
  function readProducts(source,max) {
    const result=[],seen=new Set(),missing=[];
    const candidates=nativeItems(source);
    for(const item of candidates){
      const product=extractItem(item);
      if(!product){missing.push(item.dataset.id||"sem-id");continue;}
      const key=product.id||product.href;
      if(seen.has(key))continue;
      seen.add(key);result.push(product);
    }
    return {products:result.slice(0,max),total:result.length,missing,nativeCount:candidates.length};
  }
  function getProductData(source,max){return readProducts(source,max).products;}
  function pixIcon() {
    const svg=document.createElementNS("http://www.w3.org/2000/svg","svg");
    svg.setAttribute("viewBox","0 0 24 24");
    svg.setAttribute("aria-hidden","true");
    svg.setAttribute("fill","currentColor");
    const paths=[
      "M12 1.6 18.6 8.2 12 14.8 5.4 8.2 12 1.6Z",
      "M19.2 8.8 23 12.6l-6.6 6.6-3.8-3.8 6.6-6.6Z",
      "M5.4 8.8 11.9 15.4l-3.8 3.8L1.5 12.6l3.9-3.8Z",
      "M12 16.2 15.8 20 12 23.8 8.2 20 12 16.2Z"
    ];
    for(const d of paths){
      const path=document.createElementNS("http://www.w3.org/2000/svg","path");
      path.setAttribute("d",d);svg.appendChild(path);
    }
    return svg;
  }
  function card(product,cfg) {
    const article=el("article","n27-best-card");
    article.dataset.productId=product.id;
    const media=el("a","n27-best-card__media");
    media.href=product.href;
    media.setAttribute("aria-label","Ver produto: "+product.name);
    const pic=el("img");
    pic.src=productArtAt(product.img,800);
    if(pic.src!==product.img) {
      pic.srcset=[500,800,1000].map(w=>productArtAt(product.img,w)+" "+w+"w").join(", ");
      pic.sizes="(max-width: 520px) 78vw, (max-width: 900px) 45vw, (max-width: 1280px) 28vw, 300px";
    }
    pic.alt=product.alt;
    pic.width=300;pic.height=300;pic.loading="lazy";pic.decoding="async";
    media.appendChild(pic);
    if(cfg.exibirSelo && product.percent&&!product.unavailable){
      const badge=el("span","n27-best-card__badge",product.percent+"% OFF");
      media.appendChild(badge);
    }
    article.appendChild(media);
    const info=el("div","n27-best-card__info");
    const title=el("a","n27-best-card__title",product.name);
    title.href=product.href;
    info.appendChild(title);
    if(product.unavailable){
      const stock=el("div","n27-best-card__price n27-best-card__stock","Produto indisponível");
      const more=el("a","n27-best-card__pix n27-best-card__stock-link","Ver produto");
      more.href=product.href;
      info.append(stock,more);
      article.appendChild(info);
      return article;
    }
    const price=el("div","n27-best-card__price");
    const priceRow=el("div","n27-best-card__price-row");
    if (product.oldPrice !== null) priceRow.appendChild(el("del","n27-best-card__old-price",brl(product.oldPrice)));
    priceRow.appendChild(el("strong","n27-best-card__current-price",brl(product.current)));
    price.appendChild(priceRow);
    if(cfg.exibirParcelamento && product.installment){
      const sub=el("span","n27-best-card__installments");
      sub.appendChild(document.createTextNode("até "));
      sub.appendChild(el("b","",product.installment.count+"x"));
      sub.appendChild(document.createTextNode(" de "));
      sub.appendChild(el("b","",product.installment.amount));
      if(product.installment.noInterest) sub.appendChild(document.createTextNode(" sem juros"));
      price.appendChild(sub);
    }
    info.appendChild(price);
    const pix=el("div","n27-best-card__pix");
    if(cfg.exibirPix && product.pix !== null){
      pix.appendChild(pixIcon());
      const line=el("span","n27-best-card__pix-info");
      const amount=el("span","n27-best-card__pix-price");
      amount.appendChild(el("b","",brl(product.pix)));
      amount.appendChild(document.createTextNode(" no pix"));
      line.appendChild(amount);
      if(product.pixPercent) {
        const discount=el("span","n27-best-card__pix-discount","com "+product.pixPercent+"% de desconto");
        line.appendChild(discount);
      }
      pix.appendChild(line);
    }
    info.appendChild(pix);
    article.appendChild(info);
    return article;
  }
  function control(dir, text) {
    const button=el("button","n27-best-shelf__arrow n27-best-shelf__arrow--"+dir);
    button.type="button";button.setAttribute("aria-label",text);
    const svg=document.createElementNS("http://www.w3.org/2000/svg","svg");
    svg.setAttribute("viewBox","0 0 24 24");
    svg.setAttribute("aria-hidden","true");
    const path=document.createElementNS("http://www.w3.org/2000/svg","path");
    path.setAttribute("d",dir==="prev"?"M15 4 7 12l8 8":"m9 4 8 8-8 8");
    path.setAttribute("fill","none");path.setAttribute("stroke","currentColor");
    path.setAttribute("stroke-linecap","round");
    path.setAttribute("stroke-linejoin","round");path.setAttribute("stroke-width","1.8");
    svg.appendChild(path);button.appendChild(svg);
    return button;
  }
  /**
   * Circular snap rail. We clone only 6 edge cards, never a whole 20-item
   * collection: 6 tail + N real cards + 6 head. Once the first/last
   * clone settles, jump by exactly one set width with snapping disabled.
   * No visual jump, no empty gap and no dependency on Slick/Groom.
   */
  function setupNavigation(shelf, rail, cfg) {
    const prev=shelf.querySelector(".n27-best-shelf__arrow--prev");
    const next=shelf.querySelector(".n27-best-shelf__arrow--next");
    const controls=shelf.querySelector(".n27-best-shelf__controls");
    const original=[...rail.querySelectorAll(":scope > .n27-best-card")];
    const total=original.length;
    const loop=cfg.loopInfinito && total>1;
    const edge=loop ? Math.min(6,total) : 0;
    if (controls) controls.hidden=total<=1;

    function duplicate(card) {
      const copy=card.cloneNode(true);
      copy.dataset.n27Clone="1";
      copy.setAttribute("aria-hidden","true");
      copy.querySelectorAll("a,button,input,[tabindex]").forEach(control=>{
        control.setAttribute("tabindex","-1");
      });
      copy.querySelectorAll("img").forEach(image=>{image.loading="lazy";});
      return copy;
    }
    if(loop) {
      original.slice(-edge).forEach(card=>{
        rail.insertBefore(duplicate(card),original[0]);
      });
      original.slice(0,edge).forEach(card=>{
        rail.appendChild(duplicate(card));
      });
    }
    rail.dataset.n27Infinite=loop?"1":"0";
    rail.dataset.n27Ready="0";
    // Do not infer index from tail clones before initial alignment.
    rail.dataset.n27Index="0";

    const step=()=>{
      const cards=rail.querySelectorAll(":scope > .n27-best-card");
      if(cards.length>1){
        const delta=cards[1].getBoundingClientRect().left-cards[0].getBoundingClientRect().left;
        if(delta>0)return delta;
      }
      return (cards[0]?.getBoundingClientRect().width||260) +
        (parseFloat(getComputedStyle(rail).columnGap)||0);
    };
    const prefersReduced=()=>window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    const modulo=(value,size)=>((value%size)+size)%size;
    let scrollTimer=0, resizing=false;

    function instant(position) {
      rail.classList.add("n27-best-shelf__rail--rebase");
      rail.scrollLeft=Math.max(0,position);
      // Await the next paint before re-enabling smooth snap.
      window.requestAnimationFrame(()=>{
        rail.classList.remove("n27-best-shelf__rail--rebase");
        rail.dataset.n27Ready="1";
        normalize();
      });
    }
    function currentIndex() {
      return modulo(Math.round(rail.scrollLeft/Math.max(1,step()))-edge,total);
    }
    function normalize() {
      if(resizing || !total || rail.dataset.n27Ready!=="1")return;
      const s=step();
      let shifted=0;
      if(loop) {
        const logical=rail.scrollLeft/s-edge;
        // Only jump after snapping to a clone, not while the
        // last original card is still partly visible.
        if(logical < -.5) shifted=total*s;
        else if(logical >= total-.5) shifted=-total*s;
      }
      if(shifted) instant(rail.scrollLeft+shifted);
      rail.dataset.n27Index=String(currentIndex());
      if(!loop) {
        prev.disabled=rail.scrollLeft<=1;
        next.disabled=rail.scrollLeft>=rail.scrollWidth-rail.clientWidth-1;
      } else {
        prev.disabled=false;
        next.disabled=false;
      }
    }
    function go(direction) {
      if(total<=1)return;
      // If a user clicks repeatedly, let the native smooth scroller
      // calculate relative to its present position. No disabled edge.
      rail.scrollBy({left:direction*step(),
        behavior:prefersReduced()?"auto":"smooth"});
      window.clearTimeout(scrollTimer);
      scrollTimer=window.setTimeout(normalize,360);
    }
    prev.addEventListener("click",()=>go(-1));
    next.addEventListener("click",()=>go(1));
    rail.addEventListener("keydown",event=>{
      if(event.key==="ArrowRight" || event.key==="ArrowLeft") {
        event.preventDefault();go(event.key==="ArrowRight"?1:-1);
      }
    });
    rail.addEventListener("scroll",()=>{
      window.clearTimeout(scrollTimer);
      scrollTimer=window.setTimeout(normalize,170);
    },{passive:true});
    if("onscrollend" in rail)rail.addEventListener("scrollend",()=>{
      window.clearTimeout(scrollTimer);normalize();
    });
    const onResize=()=>{
      if(!shelf.isConnected)return;
      const saved=Number(rail.dataset.n27Index);
      const index=Number.isInteger(saved)?modulo(saved,total):0;
      resizing=true;
      window.requestAnimationFrame(()=>{
        instant((edge+index)*step());
        resizing=false;
        normalize();
      });
    };
    window.addEventListener("resize",onResize,{passive:true});
    // Quando outras seções da home são reorganizadas, o browser pode
    // restaurar o scrollLeft a zero. Alinhar novamente ao índice real.
    document.addEventListener("nichelle27:home:reordered",onResize);
    // Show only after the real first card (not the tail clones) is aligned.
    window.requestAnimationFrame(()=>{
      instant(edge*step());
      rail.dataset.n27Index="0";
      normalize();
    });
    shelf.dataset.n27Loop=loop?"infinite":"finite";
  }

  function render(source,products,cfg,def) {
    const parent=source.parentElement;
    if(!parent)return;
    let shelf=document.getElementById(def.id);
    if (!cfg.ativo) {
      shelf?.remove();
      source.removeAttribute("data-n27-shelf-source");
      signatures.delete(def.key);
      return;
    }
    const dataKey=JSON.stringify([cfg,products.map(p=>[
      p.id,p.href,p.name,p.img,p.oldPrice,p.current,p.unavailable,p.pix,p.pixPercent,p.percent,
      p.installment?.amount,p.installment?.count
    ])]);
    if(dataKey===signatures.get(def.key)&&shelf&&shelf.parentNode===parent){
      source.dataset.n27ShelfSource="1";return;
    }

    const fresh=el("section","n27-best-shelf");
    fresh.id=def.id;
    fresh.dataset.n27ShelfType=def.key;
    fresh.setAttribute("aria-label",cfg.titulo+" — Nichelle Imports");
    const wrap=el("div","n27-best-shelf__inner");
    const heading=el("div","n27-best-shelf__heading");
    const title=el("h2","n27-best-shelf__heading-title");
    if(cfg.prefixo) title.appendChild(el("span","",cfg.prefixo+" "));
    title.appendChild(el("strong","",cfg.titulo));
    heading.append(title,el("span","n27-best-shelf__heading-line"));
    wrap.appendChild(heading);
    const rail=el("div","n27-best-shelf__rail");
    rail.setAttribute("role","region");
    rail.setAttribute("aria-label","Carrossel de "+cfg.titulo);
    rail.setAttribute("tabindex","0");
    products.forEach(p=>rail.appendChild(card(p,cfg)));
    wrap.appendChild(rail);
    const controls=el("div","n27-best-shelf__controls");
    controls.append(control("prev","Produtos anteriores"),control("next","Próximos produtos"));
    wrap.appendChild(controls);
    fresh.appendChild(wrap);

    source.before(fresh);
    shelf?.remove();
    source.dataset.n27ShelfSource="1";
    delete source.dataset.n27ShelfFallback;
    document.documentElement.dataset.n27BestShelf="1";
    signatures.set(def.key,dataKey);
    setupNavigation(fresh,rail,cfg);
  }
  // A LI pode publicar a vitrine dentro de um wrapper ou fora do stage.
  // Para Mais Vendidos, trazemos o próprio nó nativo (com eventos e dados)
  // para o mesmo stage das demais vitrines FWR, sem cloná-lo.
  function findShelfSource(stage,def){
    const selector=def.key==="aproveiteTambem"?def.selector:".vitrine-produtos"+def.selector;
    const root=document.getElementById("corpo");
    if(!root)return null;
    const sources=[...root.querySelectorAll(selector)].filter(n=>!n.closest(".n27-best-shelf"));
    if(def.key==="aproveiteTambem"){
      return sources.find(n=>n.matches(".produto-aproveite")&&nativeItems(n).length)||
        sources.find(n=>nativeItems(n).length)||sources[0]||null;
    }
    // Prefere a vitrine realmente preenchida; não uma segunda versão vazia.
    sources.sort((a,b)=>nativeItems(b).length-nativeItems(a).length||
      Number(b.matches(".vitrine-24488857"))-Number(a.matches(".vitrine-24488857")));
    return sources[0]||null;
  }
  function schedule(){
    if(pending)return;
    pending=true;
    setTimeout(()=>{pending=false;mount();},120);
  }
  function mount(){
    if(!enabled()||!document.body)return;
    const stage=document.getElementById("n27-preview-stage");
    if(!isHome&&!document.body.classList.contains("pagina-produto"))return;
    const defs=isHome?SHELVES:[related];
    defs.forEach(def=>{
      const source=findShelfSource(stage,def);
      if(!source)return;
      if(!observedSources.has(source)){
        const mo=new MutationObserver(schedule);
        mo.observe(source,{childList:true,characterData:true,subtree:true,
          attributes:true,attributeFilter:["src","data-src","data-lazy","data-imagem-caminho","data-sell-price"]});
        observedSources.add(source);
      }
      const cfg=config(def);
      const read=readProducts(source,cfg.maxProdutos);
      diagnostics.set(def.key,{nativos:read.nativeCount,lidos:read.total,ausentes:read.missing});
      if(!cfg.ativo||!read.products.length||read.missing.length){
        // Nunca ocultar produtos que não foi possível converter.
        document.getElementById(def.id)?.remove();
        delete source.dataset.n27ShelfSource;
        source.dataset.n27ShelfFallback="1";
        signatures.delete(def.key);
        return;
      }
      render(source,read.products,cfg,def);
    });
  }
  if(document.readyState==="loading")document.addEventListener("DOMContentLoaded",mount,{once:true});
  else mount();
  window.addEventListener("load",mount,{once:true});
  [250,750,1900,4000,7000].forEach(t=>setTimeout(mount,t));
  // Se a plataforma inserir a vitrine depois, converter ao mesmo padrão.
  // Observa apenas inclusões de nós de vitrine para não reagir à própria FWR.
  function watchLateNativeShelves(){
    const corpo=document.getElementById("corpo");
    if(!corpo||!window.MutationObserver)return;
    const observer=new MutationObserver(records=>{
      if(records.some(record=>[...record.addedNodes].some(node=>
        node.nodeType===1&&(
          node.matches?.(".vitrine-produtos,.produto-aproveite,.listagem.aproveite-tambem")||
          !!node.querySelector?.(".vitrine-produtos,.produto-aproveite,.listagem.aproveite-tambem")
        ))))schedule();
    });
    observer.observe(corpo,{childList:true,subtree:true});
  }
  if(document.readyState==="loading"){
    document.addEventListener("DOMContentLoaded",watchLateNativeShelves,{once:true});
  }else watchLateNativeShelves();
  document.addEventListener("nichelle27:refresh",schedule);
  document.addEventListener("nichelle27:vitrine:update",()=>{signatures.clear();schedule();});
  document.addEventListener("nichelle27:vitrines:update",()=>{signatures.clear();schedule();});
  window.NichelleBestSellers={
    version:"1.6.0",refresh:schedule,
    diagnostico:function(){
      const stage=document.getElementById("n27-preview-stage");
      const def=isHome?SHELVES[0]:related;
      const source=findShelfSource(stage,def);
      const shelf=document.getElementById(def.id);
      const cfg=config(def);
      return {
        versao:"1.6.0",dados:diagnostics.get(def.key)||null,
        ativo:enabled(),configAtiva:cfg.ativo,
        fonteEncontrada:!!source,
        fonteNoStage:!!source&&source.parentNode===stage,
        produtosNativos:source?.querySelectorAll(".listagem-item[data-id]:not(.slick-cloned)").length||0,
        produtosLidos:source?getProductData(source,cfg.maxProdutos).length:0,
        componenteFWR:!!shelf,
        cardsFWR:shelf?.querySelectorAll(".n27-best-shelf__rail > .n27-best-card:not([data-n27-clone])").length||0,
        fonteOculta:source?.dataset.n27ShelfSource==="1",
        estiloFWR:document.documentElement.dataset.n27BestShelf==="1"
      };
    },
    sections:SHELVES.map(def=>({key:def.key,selector:def.selector,id:def.id}))
  };
})();
