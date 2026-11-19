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
  function enter(stage) {
    if (!allowed() || !stage || !one(".vitrine-mas-vendido", stage)) return;
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
    const featured = one("#n27-approved-best-sellers", stage);
    const best = one(".vitrine-mas-vendido", stage);
    const featuredLaunches = one("#n27-approved-launches", stage);
    const launches = one(".vitrine-lancamento", stage);
    const featuredBrands = one("#n27-approved-brands", stage);
    const brands = one(".vitrine-marcas", stage);
    const featuredShorts = one("#n27-approved-shorts", stage);
    const videos = one(".vitrine-video", stage);
    const featuredNews = one("#n27-approved-news", stage);
    const featuredPromo = one("#n27-approved-highlights", stage);
    const promo = one(".vitrine-destaque", stage);
    const featuredExtra = one("#n27-approved-brand-products", stage);
    const extra = one(".vitrine-18709305", stage);
    // A imagem do projeto é a especificação visual, não uma página com
    // componentes HTML. Cada seção real é montada com os nós LI existentes.
    const order = [hero, benefits, featured, best, category, featuredLaunches, launches,
      featuredBrands, brands, featuredShorts, videos, featuredPromo, promo, featuredNews, editorial,
      featuredExtra, extra, newsletter, social].filter(Boolean);
    // A home executa retries em load e depois do DOMContentLoaded.
    // Reanexar a vitrine FWR a cada retry zera o scrollLeft do carrossel
    // circular no Chrome. Não mover nós quando já estão na ordem correta.
    const allAttached=order.every(function (section) {return section.parentNode===stage;});
    const orderStable=allAttached && order.every(function (section,idx) {
      return idx===0 || !!(order[idx-1].compareDocumentPosition(section) &
        Node.DOCUMENT_POSITION_FOLLOWING);
    });
    if(!orderStable) {
      order.forEach(function (section) {stage.appendChild(section);});
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
})();
