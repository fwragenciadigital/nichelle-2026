/*
 * FWR • Nichelle Imports 2026 • Mais Vendidos v1.0
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
  if (!/^(www\.)?nichelleimports\.com\.br$/i.test(location.hostname) ||
      (location.pathname.replace(/\/+$/, "") || "/") !== "/" ||
      new URLSearchParams(location.search).get("nichelle_preview") !== "1") return;

  const SOURCE = ".vitrine-produtos.vitrine-mas-vendido";
  const ID = "n27-approved-best-sellers";
  let observer = null, pending = false, previousKey = "", lastSource = null, buttonsBound = false;

  function enabled() {
    const s = window.Nichelle27Settings;
    return !!(s && s.geral?.ativo === true && s.geral?.modoPreview === true &&
      s.geral?.publicarNaLoja !== true);
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
  function parseMoney(text) {
    const m = safeText(text,150).match(/R\$\s*([\d.]+,\d{2})/i);
    if (!m) return null;
    const v = Number(m[1].replace(/\./g,"").replace(",","."));
    return Number.isFinite(v) && v >= 0 ? v : null;
  }
  const brl = v => new Intl.NumberFormat("pt-BR",{style:"currency",currency:"BRL"}).format(v);
  function selectedConfig() {
    const raw = window.Nichelle27Settings?.vitrineMaisVendidos || {};
    const inline = document.getElementById("n27-vitrine-mais-vendidos-json");
    if (inline) {
      try {
        const json=JSON.parse(inline.textContent);
        if (json && typeof json==="object" && !Array.isArray(json)) return json;
      } catch (e) {console.warn("[Nichelle Vitrine] JSON inválido",e);}
    }
    return raw;
  }
  function config() {
    const s=selectedConfig();
    return {
      ativo:s.ativo !== false,
      prefixo:safeText(s.prefixo ?? "Produtos",32),
      titulo:safeText(s.titulo ?? "Mais Vendidos",55),
      exibirSelo:s.exibirSelo !== false,
      exibirPix:s.exibirPix !== false,
      exibirParcelamento:s.exibirParcelamento !== false,
      maxProdutos:Math.min(30,Math.max(1,Number(s.maxProdutos) || 20))
    };
  }
  function extractItem(source) {
    const id=source.dataset.id || source.className.match(/prod-id-(\d+)/)?.[1] || "";
    const href=sameOriginUrl(source.querySelector(".nome-produto[href], .produto-sobrepor[href], a[href]")?.getAttribute("href"));
    const name=safeText(source.querySelector(".nome-produto")?.textContent ||
      source.querySelector(".produto-sobrepor")?.title,170);
    const imageEl=source.querySelector(".imagem-produto img") || source.querySelector("img");
    const img=safeImg(imageEl?.getAttribute("src") || imageEl?.getAttribute("data-imagem-caminho"));
    if (!href || !name || !img) return null;
    const original=parseMoney(source.querySelector(".preco-venda")?.textContent);
    const promo=parseMoney(source.querySelector(".preco-promocional")?.textContent);
    const standard=parseMoney(source.querySelector(".preco-produto .titulo")?.textContent);
    const current=promo ?? standard ?? original;
    if (current === null) return null;
    const oldPrice=original !== null && original > current ? original : null;
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
      id,href,name,img,alt:safeText(imageEl?.alt,170)||name,
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
  function getProductData(source,max) {
    // Exclude Slick duplicates and all UI-only nodes from the legacy theme.
    const candidates=[...source.querySelectorAll(".listagem-item[data-id], .listagem-item[class*='prod-id-']")];
    const result=[],seen=new Set();
    for (const item of candidates) {
      if (item.closest(".slick-cloned")) continue;
      const product=extractItem(item);
      if (!product || seen.has(product.id || product.href)) continue;
      seen.add(product.id || product.href);
      result.push(product);
      if (result.length>=max) break;
    }
    return result;
  }
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
    pic.src=product.img;
    pic.alt=product.alt;
    pic.width=300;pic.height=300;pic.loading="lazy";pic.decoding="async";
    media.appendChild(pic);
    if(cfg.exibirSelo && product.percent){
      const badge=el("span","n27-best-card__badge",product.percent+"% OFF");
      media.appendChild(badge);
    }
    article.appendChild(media);
    const info=el("div","n27-best-card__info");
    const title=el("a","n27-best-card__title",product.name);
    title.href=product.href;
    info.appendChild(title);
    const price=el("div","n27-best-card__price");
    if (product.oldPrice !== null) price.appendChild(el("del","n27-best-card__old-price",brl(product.oldPrice)));
    price.appendChild(el("strong","n27-best-card__current-price",brl(product.current)));
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
  function setupNavigation(shelf, rail) {
    const prev=shelf.querySelector(".n27-best-shelf__arrow--prev");
    const next=shelf.querySelector(".n27-best-shelf__arrow--next");
    if(!prev||!next)return;
    function refresh(){
      const max=rail.scrollWidth-rail.clientWidth;
      prev.disabled=rail.scrollLeft<=1;
      next.disabled=rail.scrollLeft>=max-1;
      const controls=shelf.querySelector(".n27-best-shelf__controls");
      if(controls) controls.hidden=max<=2;
    }
    const step=()=> {
      const card=rail.querySelector(".n27-best-card");
      const styles=getComputedStyle(rail);
      return (card?.getBoundingClientRect().width||240)+
        (parseFloat(styles.columnGap)||0);
    };
    prev.addEventListener("click",()=>rail.scrollBy({left:-step(),behavior:"smooth"}));
    next.addEventListener("click",()=>rail.scrollBy({left:step(),behavior:"smooth"}));
    rail.addEventListener("scroll",refresh,{passive:true});
    window.addEventListener("resize",refresh,{passive:true});
    window.requestAnimationFrame(refresh);
  }
  function render(source,products,cfg) {
    const stage=document.getElementById("n27-preview-stage");
    if(!stage||source.parentNode!==stage)return;
    let shelf=document.getElementById(ID);
    if (!cfg.ativo) {
      shelf?.remove();
      source.removeAttribute("data-n27-shelf-source");
      return;
    }
    const dataKey=JSON.stringify([cfg,products.map(p=>[
      p.id,p.name,p.img,p.oldPrice,p.current,p.pix,p.pixPercent,p.percent,
      p.installment?.amount,p.installment?.count
    ])]);
    if(dataKey===previousKey && shelf && shelf.parentNode===stage) return;

    const fresh=el("section","n27-best-shelf");
    fresh.id=ID;
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
    document.documentElement.dataset.n27BestShelf="1";
    previousKey=dataKey;
    setupNavigation(fresh,rail);
  }
  function schedule(){
    if(pending)return;
    pending=true;
    setTimeout(()=>{pending=false;mount();},120);
  }
  function mount(){
    if(!enabled())return;
    const stage=document.getElementById("n27-preview-stage");
    const source=stage?.querySelector(":scope > "+SOURCE);
    if(!source)return;
    const cfg=config();
    const products=getProductData(source,cfg.maxProdutos);
    if(!products.length)return; // fail safe: retain native shelf if LI data is absent
    render(source,products,cfg);
    if(lastSource!==source){
      observer?.disconnect();
      observer=new MutationObserver(schedule);
      observer.observe(source,{childList:true,characterData:true,subtree:true,
        attributes:true,attributeFilter:["src","data-sell-price"]});
      lastSource=source;
    }
  }
  if(document.readyState==="loading")document.addEventListener("DOMContentLoaded",mount,{once:true});
  else mount();
  window.addEventListener("load",mount,{once:true});
  [250,750,1900,4000].forEach(t=>setTimeout(mount,t));
  document.addEventListener("nichelle27:refresh",schedule);
  document.addEventListener("nichelle27:vitrine:update",()=>{previousKey="";schedule();});
  window.NichelleBestSellers={version:"1.0.0",refresh:schedule};
})();
