/*
 * Nichelle 27 — Framework estrutural FWR v0.3.0 (pré-homologação)
 * Origem: layout de referência Nichelle 2026.
 * Somente integra conteúdo real da Loja Integrada. NÃO cria produtos/preços fictícios,
 * checkout, autenticação, formulários falsos ou imagens externas automáticas.
 * Preserva todos os módulos já existentes em public/nichelle.js.
 * Settings ficam em window.Nichelle27Settings no HTML editável da LI.
 */
(function () {
  "use strict";
  if (window.Nichelle27Framework && window.Nichelle27Framework.initialized) return;
  const VERSION = "0.3.0";
  const ORDER = Object.freeze([
    "qualificadores", "maisVendidos", "banners", "lancamentos", "marcas",
    "videos", "promocoes", "noticias", "newsletter", "instagram", "empresa"
  ]);
  const mounted = new Set();

  function settings() { return window.Nichelle27Settings || {}; }
  function log() {
    if (settings().geral && settings().geral.debug === true) {
      console.info.apply(console, ["[Nichelle27]"].concat(Array.from(arguments)));
    }
  }
  function normalizePath(p) { return (String(p || "/").split("?")[0].replace(/\/+$/, "") || "/"); }
  function allowedPage(cfg) {
    return !Array.isArray(cfg.paginas) || !cfg.paginas.length ||
      cfg.paginas.some(function (p) { return normalizePath(p) === normalizePath(window.location.pathname); });
  }
  function enabled(cfg) { return !!(cfg && cfg.ativo === true && allowedPage(cfg)); }
  function select(css, base) {
    if (typeof css !== "string" || !css.trim()) return null;
    try { return (base || document).querySelector(css); }
    catch (error) { log("Seletor inválido:", css); return null; }
  }
  function safeURL(value, sameOrigin) {
    if (typeof value !== "string" || !value.trim() || value.trim() === "#") return "";
    try {
      const url = new URL(value.trim(), window.location.href);
      if (url.protocol !== "https:" && !(url.protocol === "http:" && url.origin === window.location.origin)) return "";
      if (url.username || url.password) return "";
      if (sameOrigin && url.origin !== window.location.origin) return "";
      return url.href;
    } catch (_) { return ""; }
  }
  function el(tag, className, textValue) {
    const node = document.createElement(tag);
    if (className) node.className = className;
    if (typeof textValue === "string") node.textContent = textValue;
    return node;
  }
  function headline(prefix, highlighted, center) {
    const h = el("h2", "n27-title" + (center ? " n27-title--center" : ""));
    h.append(document.createTextNode((prefix || "") + (highlighted ? " " : "")));
    if (highlighted) h.appendChild(el("strong", "", highlighted));
    return h;
  }
  function container() { return el("div", "n27-container"); }
  function section(key) {
    const node = el("section", "n27-section n27-section--" + key);
    node.dataset.n27Section = key;
    return node;
  }

  function nativeSkin(cfg, attr) {
    if (!enabled(cfg)) return;
    const node = select(cfg.seletor);
    if (!node) { log("Estrutura nativa não encontrada:", cfg.seletor); return; }
    node.setAttribute(attr, "1");
  }

  function mountTopo() {
    const cfg = settings().topo || {};
    if (!enabled(cfg)) return;
    nativeSkin(cfg, "data-n27-topo");
    if (cfg.faixaAtiva !== true || document.getElementById("n27-ticker")) return;
    const header = select(cfg.seletor);
    if (!header || !header.parentNode) return;
    const labels = Array.isArray(cfg.qualificadores) ? cfg.qualificadores.filter(function (x) {
      return x && typeof x.titulo === "string" && x.titulo.trim();
    }).slice(0, 6) : [];
    if (!labels.length) return;
    const bar = el("div", "n27-ticker"); bar.id = "n27-ticker";
    bar.setAttribute("aria-label", "Informações da loja");
    const inner = el("div", "n27-ticker__inner");
    labels.concat(labels).forEach(function (item) {
      const row = el("span", "n27-ticker__item");
      row.appendChild(el("strong", "", item.titulo.slice(0, 55)));
      if (typeof item.texto === "string") row.appendChild(el("span", "", item.texto.slice(0, 85)));
      inner.appendChild(row);
    });
    bar.appendChild(inner);
    header.parentNode.insertBefore(bar, header);
  }

  function mountQualificadores(cfg) {
    if (!enabled(cfg)) return null;
    const items = Array.isArray(cfg.itens) ? cfg.itens.filter(function (i) {
      return i && typeof i.texto === "string" && i.texto.trim();
    }).slice(0, 4) : [];
    if (!items.length) return null;
    const outer = section("beneficios");
    const frame = container();
    const benefits = el("div", "n27-benefits");
    benefits.setAttribute("aria-label", "Vantagens de comprar na Nichelle");
    const label = el("div", "n27-benefits__label");
    const labelContent = el("span");
    labelContent.appendChild(el("b", "", "+"));
    labelContent.appendChild(document.createTextNode((cfg.rotulo || "VANTAGENS").slice(0, 30)));
    label.appendChild(labelContent);
    const list = el("div", "n27-benefits__list");
    const icons = { caixa: "◇", original: "✧", atendimento: "◎", selo: "✺" };
    items.forEach(function (item) {
      const wrapper = el("div", "n27-benefits__item");
      const icon = el("span", "n27-benefits__icon", icons[item.icone] || "✦");
      icon.setAttribute("aria-hidden", "true");
      wrapper.append(icon, el("span", "n27-benefits__text", item.texto.slice(0, 115)));
      list.appendChild(wrapper);
    });
    benefits.append(label, list);
    frame.appendChild(benefits);
    outer.appendChild(frame);
    return outer;
  }

  /*
   * Vitrines: move (NÃO clona) uma listagem nativa selecionada manualmente.
   * Isso mantém nós e listeners de ações de carrinho/produto. As recomendações
   * e preços exibidos continuam integralmente sob controle da Loja Integrada.
   * Exige seletorFonte exato; não adivinha a estrutura do tema.
   */
  function mountVitrine(cfg, key) {
    if (!enabled(cfg) || typeof cfg.seletorFonte !== "string" || !cfg.seletorFonte.trim()) return null;
    const source = select(cfg.seletorFonte);
    if (!source || source.dataset.n27Adopted === "1") return null;
    const selector = cfg.seletorItem || ":scope > *";
    let items;
    try { items = source.querySelectorAll(selector); } catch (_) { log("Seletor item inválido", selector); return null; }
    if (!items.length) { log("Listagem vazia:", cfg.seletorFonte); return null; }

    const outer = section(key), frame = container();
    const shelf = el("div", "n27-shelf"), viewport = el("div", "n27-shelf__viewport");
    shelf.appendChild(headline(cfg.titulo || "Produtos", cfg.destaque || "", false));
    const controls = el("div", "n27-shelf__controls");
    const prev = el("button", "n27-shelf__arrow", "‹");
    const next = el("button", "n27-shelf__arrow", "›");
    prev.type = "button"; next.type = "button";
    prev.setAttribute("aria-label", "Produtos anteriores");
    next.setAttribute("aria-label", "Próximos produtos");
    function navigation(dir) {
      source.scrollBy({ left: dir * Math.max(200, source.clientWidth * .8), behavior: "smooth" });
    }
    prev.addEventListener("click", function () { navigation(-1); });
    next.addEventListener("click", function () { navigation(1); });
    controls.append(prev, next);
    // Adota a fonte sem clonar, inclusive seus listeners nativos.
    source.dataset.n27Adopted = "1";
    source.classList.add("n27-shelf__track");
    viewport.appendChild(source);
    shelf.append(viewport, controls);
    frame.appendChild(shelf); outer.appendChild(frame);
    return outer;
  }

  /*
   * Slots são os mesmos do nichelle.js. O framework apenas os posiciona.
   * Ele não reimplementa banners, vídeos ou notícias.
   */
  function mountSlot(key) {
    const sources = {
      banners: { id: "fwr-nichelle-vitrine-slot", cfg: "bannerVitrine", event: "fwr:nichelle:banner-config" },
      videos: { id: "fwr-nichelle-video-slot", cfg: "galeriaVideos" },
      noticias: { id: "fwr-nichelle-noticias-slot", cfg: "noticias", event: "fwr:nichelle:news-config" }
    };
    const spec = sources[key], config = window.FWRNichelle && window.FWRNichelle[spec.cfg];
    if (!config || config.ativo !== true) return null;
    let slot = document.getElementById(spec.id);
    if (!slot) { slot = el("div"); slot.id = spec.id; slot.dataset.fwrActive = "0"; }
    const outer = section(key);
    if (key === "noticias") {
      outer.appendChild(slot); // O módulo notícias possui container/fundo próprios
    } else {
      const frame = container();
      frame.appendChild(slot); outer.appendChild(frame);
    }
    if (spec.event) window.queueMicrotask(function () {
      document.dispatchEvent(new Event(spec.event));
    });
    return outer;
  }

  function mountMarcas(cfg) {
    if (!enabled(cfg)) return null;
    const data = Array.isArray(cfg.itens) ? cfg.itens.slice(0, 16) : [];
    const items = data.map(function (item) {
      if (!item || typeof item.nome !== "string") return null;
      const imagem = safeURL(item.imagem), link = safeURL(item.link);
      return imagem ? { nome: item.nome.trim().slice(0, 70), imagem, link } : null;
    }).filter(Boolean);
    if (!items.length) return null;
    const outer = section("marcas"); const bg = el("div", "n27-brands"); const frame = container();
    frame.appendChild(headline(cfg.titulo || "Compre as", cfg.destaque || "Melhores Marcas", true));
    const grid = el("div", "n27-brands__grid");
    items.forEach(function (item) {
      const card = el(item.link ? "a" : "div", "n27-brands__item");
      if (item.link) card.href = item.link;
      const image = el("img");
      image.src = item.imagem; image.alt = item.nome; image.loading = "lazy"; image.decoding = "async";
      image.width = 200; image.height = 120;
      card.appendChild(image); grid.appendChild(card);
    });
    frame.appendChild(grid); bg.appendChild(frame); outer.appendChild(bg);
    return outer;
  }

  function mountNewsletter(cfg) {
    if (!enabled(cfg)) return null;
    const form = select(cfg.seletorFormulario);
    if (!form || form.dataset.n27Adopted === "1") return null;
    const source = form.matches("form") ? form : select("form", form);
    if (!source || !source.querySelector("input[type=email], input[name=email]")) return null;
    const outer = section("newsletter"), frame = container();
    const banner = el("div", "n27-newsletter");
    const layout = el("div", "n27-newsletter__content");
    const textBlock = el("div");
    textBlock.append(el("h2", "n27-newsletter__title", cfg.titulo || "Fique por dentro das novidades"),
      el("p", "n27-newsletter__subtitle", cfg.texto || ""));
    const formSlot = el("div", "n27-newsletter__form");
    // Reusa submissão e validação do formulário do próprio tema.
    form.dataset.n27Adopted = "1";
    formSlot.appendChild(form);
    layout.append(textBlock, formSlot);
    banner.appendChild(layout); frame.appendChild(banner); outer.appendChild(frame);
    return outer;
  }

  function mountInstagram(cfg) {
    if (!enabled(cfg)) return null;
    const url = safeURL(cfg.perfil);
    const images = Array.isArray(cfg.itens) ? cfg.itens.slice(0, 8).map(function (v) {
      if (!v) return null;
      const imagem = safeURL(v.imagem), link = safeURL(v.link);
      return imagem && link ? { imagem, link, alt: String(v.alt || "Instagram Nichelle").slice(0, 110) } : null;
    }).filter(Boolean) : [];
    if (!url && !images.length) return null;
    const outer = section("instagram"), frame = container(), grid = el("div", "n27-instagram");
    if (url) {
      const follow = el("a", "n27-instagram__item n27-instagram__follow");
      follow.href = url; follow.target = "_blank"; follow.rel = "noopener noreferrer";
      follow.append(el("span", "n27-instagram__camera", "◎"),
        el("strong", "", cfg.usuario || "@nichelle_imports"),
        el("small", "", "Últimas postagens"));
      grid.appendChild(follow);
    }
    images.forEach(function (item) {
      const a = el("a", "n27-instagram__item"); a.href = item.link;
      a.target = "_blank"; a.rel = "noopener noreferrer";
      const img = el("img"); img.src = item.imagem; img.alt = item.alt;
      img.loading = "lazy"; img.decoding = "async"; img.width = 500; img.height = 500;
      a.appendChild(img); grid.appendChild(a);
    });
    frame.appendChild(grid); outer.appendChild(frame);
    return outer;
  }

  function mountEmpresa(cfg) {
    if (!enabled(cfg) || typeof cfg.texto !== "string" || !cfg.texto.trim()) return null;
    const outer = section("empresa"), company = el("div", "n27-company");
    const band = el("div", "n27-company__band"), frame = container();
    const inner = el("div", "n27-company__band-inner");
    const logo = safeURL(cfg.logo);
    const brand = logo ? el("img", "n27-company__brand") :
      el("strong", "n27-company__brand-fallback", cfg.nome || "Nichelle Imports");
    if (logo) {
      brand.src = logo; brand.alt = cfg.nome || "Nichelle Imports";
      brand.loading = "lazy"; brand.decoding = "async"; brand.width = 280; brand.height = 80;
    }
    inner.append(brand, el("div", "n27-company__description", cfg.texto.trim().slice(0, 1800)));
    frame.appendChild(inner); band.appendChild(frame); company.appendChild(band);
    const photo = safeURL(cfg.imagem);
    if (photo) {
      const img = el("img", "n27-company__photo");
      img.src = photo; img.alt = cfg.nome || "Nichelle Imports";
      img.loading = "lazy"; img.decoding = "async"; img.width = 590; img.height = 380;
      company.appendChild(img);
    }
    outer.appendChild(company);
    return outer;
  }

  function mount() {
    const cfg = settings();
    if (!enabled(cfg.geral)) return { ativo: false, montados: Array.from(mounted) };

    mountTopo();
    nativeSkin(cfg.rodape, "data-n27-footer");

    const opts = cfg.layout || {};
    if (!enabled(opts)) return { ativo: true, layout: false, montados: Array.from(mounted) };
    const root = select(opts.seletor);
    if (!root) { log("Slot principal ausente:", opts.seletor); return { ativo: true, layout: false }; }
    root.setAttribute("data-n27-root", "1");

    const map = {
      qualificadores: function () { return mountQualificadores(cfg.qualificadores || cfg.beneficios); },
      maisVendidos: function () { return mountVitrine(cfg.maisVendidos, "maisVendidos"); },
      banners: function () { return mountSlot("banners"); },
      lancamentos: function () { return mountVitrine(cfg.lancamentos, "lancamentos"); },
      marcas: function () { return mountMarcas(cfg.marcas); },
      videos: function () { return mountSlot("videos"); },
      promocoes: function () { return mountVitrine(cfg.promocoes, "promocoes"); },
      noticias: function () { return mountSlot("noticias"); },
      newsletter: function () { return mountNewsletter(cfg.newsletter); },
      instagram: function () { return mountInstagram(cfg.instagram); },
      empresa: function () { return mountEmpresa(cfg.empresa); }
    };

    ORDER.forEach(function (key) {
      if (mounted.has(key)) return;
      const created = map[key]();
      if (!created) return;
      root.appendChild(created);
      mounted.add(key);
      log("Seção montada:", key);
    });
    return { ativo: true, layout: true, montados: Array.from(mounted) };
  }

  window.Nichelle27Framework = Object.freeze({
    version: VERSION, initialized: true, ordem: ORDER,
    mount: mount,
    diagnostico: function () {
      return { versao: VERSION, configuracaoAtiva: enabled(settings().geral),
        layout: !!select(settings().layout && settings().layout.seletor),
        ordem: Array.from(ORDER), montados: Array.from(mounted),
        modules: Object.keys(settings()).filter(function (k) { return settings()[k] && settings()[k].ativo === true; }) };
    }
  });
  document.addEventListener("nichelle27:refresh", mount);
  if (document.readyState === "loading") document.addEventListener("DOMContentLoaded", mount, { once: true });
  else mount();
})();
