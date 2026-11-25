/*
 * Nichelle Imports 2026 - Home homologada, base no mockup FWR de 20/10/2026.
 * Somente prévia, sem substituir recursos de comércio nativos da Loja Integrada.
 */
(function () {
  "use strict";
  const HOST = "https://nichelle-2026-git-develop-fwragenciadigitals-projects.vercel.app";
  const CDN = "https://cdn.awsli.com.br/2550/2550587/arquivos/";
  if (!window.Nichelle27Activation?.onStore() ||
      location.pathname.replace(/\/+$/, "") !== "" ||
      !window.Nichelle27Activation?.active()) return;
  function allowed() {
    return window.Nichelle27Activation?.active() === true;
  }
  function one(s, root) { return (root || document).querySelector(s); }
  function node(tag, cls, txt) {
    const e = document.createElement(tag);
    if (cls) e.className = cls;
    if (txt) e.textContent = txt;
    return e;
  }
  function img(src, alt, width, height) {
    const i = node("img");
    i.src = src;
    i.alt = alt;
    i.width = width;
    i.height = height;
    i.loading = "lazy";
    i.decoding = "async";
    return i;
  }
  function make(id, cls) {
    const n = document.createElement("section");
    n.id = id;
    n.className = "n27-approved " + cls;
    return n;
  }
  const BEST_SELECTOR=".vitrine-produtos:is(.vitrine-24488857,.vitrine-mas-vendido,.vitrine-mais-vendidos)";
  function bestSections(stage) {
    const corpo=document.getElementById("corpo");
    if(!corpo)return [];
    const sources=[...corpo.querySelectorAll(BEST_SELECTOR)].filter(n=>
      !n.parentElement?.closest(BEST_SELECTOR));
    const rendered=document.getElementById("n27-approved-best-sellers");
    return [...new Set([rendered,...sources].filter(Boolean))];
  }
  // Ordem oficial da home; fontes nativas acompanham seus componentes.
  // O rodapé permanece fora do stage e é administrado pelo módulo próprio.
  function homeOrder(stage,slots){
    const {hero,benefits,category,editorial,newsletter,social}=slots;
    const find=selector=>one(selector,stage);
    return [...new Set([
      hero,benefits,
      ...bestSections(stage),
      category,
      find('[data-n27-shelf-type="lancamentos"],#n27-approved-launches'),find(".vitrine-lancamento"),
      find("#n27-approved-brands"),find(".vitrine-marcas"),
      // Vitrine opcional por marca, se publicada, acompanha a seção de marcas.
      find("#n27-approved-brand-products"),find(".vitrine-18709305"),
      find("#n27-approved-shorts"),find(".vitrine-video"),
      find("#n27-approved-highlights"),find(".vitrine-destaque"),
      find("#n27-approved-news"),editorial,
      newsletter,social
    ].filter(Boolean))];
  }
  function applyHomeOrder(stage,order){
    const stable=order.every((section,index)=>
      section.parentNode===stage&&(index===0||
        !!(order[index-1].compareDocumentPosition(section)&Node.DOCUMENT_POSITION_FOLLOWING)));
    if(stable)return false;
    order.forEach(section=>stage.appendChild(section));
    return true;
  }
  function enter(stage) {
    if (!allowed() || !stage) return;
    let hero = document.getElementById("n27-approved-hero");
    if (!hero) {
      hero = make("n27-approved-hero", "n27-approved-hero");
      // FULLBANNER: as imagens e os links serao extraidos SOMENTE
      // dos banners nativos publicados pela Loja Integrada.
      // Nao insira artes fixas: nichelle-fullbanners.js gerencia o slot.
      hero.hidden = true;
      hero.dataset.n27FullReady = "0";
    }
    let benefits = document.getElementById("n27-approved-benefits");
    if (!benefits) benefits = make("n27-approved-benefits", "n27-approved-benefits");
    // Este nó é um slot 100% FWR. A apresentação e o conteúdo da seção
    // pertencem a nichelle-home-benefits.js, nunca ao HTML do Groom.
    let category = document.getElementById("n27-approved-categories");
    if (!category) {
      category = make("n27-approved-categories", "n27-approved-categories");
      // Os cards são gerados SOMENTE de banners nativos do painel da LI.
      // Sem os banners publicados, este slot permanece invisível.
      category.hidden=true;
      category.dataset.n27MiniReady="0";
    }
    let editorial = document.getElementById("n27-approved-editorial");
    if (!editorial) {
      editorial = make("n27-approved-editorial", "n27-approved-editorial");
      const row = node("div", "n27-approved-container n27-approved-editorial__grid");
      const portrait = node("div", "n27-approved-editorial__portrait");
      portrait.appendChild(img(CDN + "coreana.jpg",
        "Modelo aplicando cuidados de skincare", 970, 648));
      const text = node("div", "n27-approved-editorial__text");
      text.appendChild(node("span", "n27-approved-eyebrow", "BELEZA, CUIDADO E INOVAÇÃO"));
      text.appendChild(node("h2", "", "Sua rotina de skincare começa aqui"));
      text.appendChild(node("p", "", "Explore produtos selecionados das marcas de cuidados com a pele disponíveis na Nichelle."));
      text.appendChild(img(CDN + "coreana1.jpg",
        "Produtos de skincare coreano Medicube", 380, 279));
      row.append(portrait, text);
      editorial.appendChild(row);
    }
    let newsletter = document.getElementById("n27-approved-newsletter");
    if (!newsletter) {
      newsletter = make("n27-approved-newsletter", "n27-approved-newsletter");
      const wrap = node("div", "n27-approved-container");
      const native = document.getElementById("barraNewsletter");
      if (native) {
        native.classList.remove("hidden-phone");
        wrap.appendChild(native);
      }
      newsletter.appendChild(wrap);
    }
    let social = document.getElementById("n27-approved-instagram");
    if (!social) {
      social = make("n27-approved-instagram", "n27-approved-instagram");
      const container = node("div", "n27-approved-container");
      // O Instagram é composto e mantido pelo módulo FWR, usando o
      // LightWidget oficial do cliente. Não gerar cards de produtos falsos.
      const grid = node("div", "n27-approved-instagram__grid");
      container.appendChild(grid);
      social.appendChild(container);
    }
    const order=homeOrder(stage,{hero,benefits,category,editorial,newsletter,social});
    // Não mover nós quando já ordenados; preserva scroll e estado do carrossel.
    if(applyHomeOrder(stage,order)){
      document.dispatchEvent(new Event("nichelle27:home:reordered"));
    }
    // O rodapé é renderizado pelo módulo FWR separado. Os elementos
    // originais da LI permanecem no DOM para modais, links e integrações.
    document.documentElement.dataset.n27Approved = "1";
  }
  function mount() {
    const stage = document.getElementById("n27-preview-stage");
    if (stage && allowed()) enter(stage);
  }
  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", mount, { once:true });
  } else mount();
  window.addEventListener("load", mount, { once:true });
  [350, 1100, 2300, 4250].forEach(function (delay) { window.setTimeout(mount, delay); });
  document.addEventListener("nichelle27:refresh", mount);
  document.addEventListener("nichelle27:shelf:mounted", mount);
  // Reage a todos os módulos da home, inclusive os montados depois.
  // A verificação idempotente acima evita ciclos de MutationObserver.
  function observeSections(){
    const corpo=document.getElementById("corpo");
    if(!corpo||!window.MutationObserver)return;
    let queued=false;
    const selector=BEST_SELECTOR+[
      ",#n27-approved-hero,#n27-approved-benefits,#n27-approved-categories",
      "#n27-approved-brands,#n27-approved-shorts,#n27-approved-news",
      "#n27-approved-editorial,#n27-approved-newsletter,#n27-approved-instagram",
      ".n27-best-shelf,.vitrine-lancamento,.vitrine-marcas,.vitrine-video,.vitrine-destaque,.vitrine-18709305"
    ].join(",");
    new MutationObserver(records=>{
      if(queued||!records.some(record=>[...record.addedNodes].some(node=>
        node.nodeType===1&&(node.matches?.(selector)||node.querySelector?.(selector)))))return;
      queued=true;
      setTimeout(()=>{queued=false;mount();},50);
    }).observe(corpo,{childList:true,subtree:true});
  }
  if(document.readyState==="loading")document.addEventListener("DOMContentLoaded",observeSections,{once:true});
  else observeSections();
})();
