/*
 * Nichelle 27 — Adaptador estrutural FWR v0.5.0 (base Malheiro, visual Nichelle 2026)
 * Adapta o padrão de inicialização/Settings da base Malheiro; não carrega o bundle Malheiro.
 * Somente integra conteúdo real da Loja Integrada. NÃO cria produtos/preços fictícios,
 * checkout, autenticação, formulários falsos ou imagens externas automáticas.
 * Preserva todos os módulos já existentes em public/nichelle.js.
 * Settings ficam em window.Nichelle27Settings no HTML editável da LI.
 */
(function () {
  "use strict";
  if (window.Nichelle27Framework && window.Nichelle27Framework.initialized) return;
  const VERSION = "0.21.0";
  const ORDER = Object.freeze([
    "qualificadores", "maisVendidos", "banners", "lancamentos", "marcas",
    "videos", "promocoes", "noticias", "newsletter", "instagram", "empresa"
  ]);
  const mounted = new Set();

  function settings() { return window.Nichelle27Settings || {}; }
  function isLiveStore() {
    const host = String(window.location.hostname || "").toLowerCase();
    return host === "www.nichelleimports.com.br" || host === "nichelleimports.com.br";
  }
  function previewOnStore() {
    // Prévia opt-in. Visita normal sem ?nichelle_preview=1 NÃO altera a loja.
    return isLiveStore() && settings().geral && settings().geral.modoPreview === true &&
      new URLSearchParams(window.location.search).get("nichelle_preview") === "1";
  }
  function officialStoreMode() {
    return isLiveStore() && !!(settings().geral && settings().geral.publicarNaLoja === true ||
      previewOnStore());
  }
  function previewFixtureAllowed() {
    const host = String(window.location.hostname || "").toLowerCase();
    const localHost = host === "localhost" || host === "127.0.0.1";
    const vercelPreview = host.startsWith("nichelle-2026-") &&
      host.endsWith("-fwragenciadigitals-projects.vercel.app");
    const fixture = !!(document.body && document.body.dataset.nichellePreviewFixture === "true" &&
      (localHost || vercelPreview));
    // O modo FWR é inserido manualmente, em uma única aba, por uma extensão
    // local do Chrome. Não concede acesso a painel ou API; é apenas um gate
    // de execução para o visual em um navegador privado.
    const liveHost = host === "www.nichelleimports.com.br" || host === "nichelleimports.com.br";
    const privateMode = liveHost && !!(document.documentElement &&
      document.documentElement.dataset.n27PrivateMode === "fwr-local-extension" &&
      window.__FWR_NICHELLE_PRIVATE_MODE__ === true);
    // Publicação oficial: opt-in explícito no HTML da Loja Integrada.
    // O script hospedado sozinho na Vercel NÃO ativa nenhuma personalização.
    // A home e as páginas internas obedecem às flags e páginas em Settings.
    return fixture || privateMode || officialStoreMode();
  }
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
  function imageURL(value) {
    if (typeof value !== "string" || !value.trim()) return "";
    const raw = value.trim();
    if (/^(?:https?:)?\/\//i.test(raw) || raw.startsWith("/")) return safeURL(raw);
    const base = String(settings().assetsBase || "").trim();
    if (!base) return "";
    return safeURL(base.replace(/\/+$/, "") + "/" + raw.replace(/^\/+/, ""));
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
    const nativeHeader = select(cfg.seletor);
    if (nativeHeader && cfg.fixo === true) nativeHeader.dataset.n27Sticky = "1";
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
    // Ícones SVG originais, leves e próximos da referência visual.
    // Sem fontes de ícones, dependências ou HTML remoto.
    const paths = {
      caixa: ["M5 12 20 5 35 12 20 19Z", "M5 12v17l15 7 15-7V12", "M20 19v17"],
      original: ["M20 4 32 10v11c0 8-5 13-12 17C13 34 8 29 8 21V10Z",
        "m13 20 5 5 9-11"],
      atendimento: ["M7 22v-3c0-9 5-15 13-15s13 6 13 15v3",
        "M6 20c-4 1-4 12 0 13l5 1V19Z", "M34 20c4 1 4 12 0 13l-5 1V19Z",
        "M29 33c-2 3-5 4-10 4h-3"],
      selo: ["M20 3 25 7l7 1 1 7 4 5-4 5-1 7-7 1-5 4-5-4-7-1-1-7-4-5 4-5 1-7 7-1Z",
        "m13 20 5 5 9-10"]
    };
    items.forEach(function (item) {
      const wrapper = el("div", "n27-benefits__item");
      const icon = el("span", "n27-benefits__icon");
      const svg = document.createElementNS("http://www.w3.org/2000/svg", "svg");
      svg.setAttribute("viewBox", "0 0 40 40");
      svg.setAttribute("width", "38");
      svg.setAttribute("height", "38");
      svg.setAttribute("fill", "none");
      svg.setAttribute("stroke", "currentColor");
      svg.setAttribute("stroke-width", "2.4");
      svg.setAttribute("stroke-linejoin", "round");
      svg.setAttribute("stroke-linecap", "round");
      svg.setAttribute("aria-hidden", "true");
      (paths[item.icone] || paths.selo).forEach(function (d) {
        const path = document.createElementNS("http://www.w3.org/2000/svg", "path");
        path.setAttribute("d", d);
        svg.appendChild(path);
      });
      icon.appendChild(svg);
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
    if (!source) return null;
    // mount() never calls this for the official store; the real LI DOM remains native.
    if (source.dataset.n27Adopted === "1") return null;
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
  // Quatro cards 3:5 oriundos do recorte aprovado. Imagens e destinos vêm
  // exclusivamente das Settings (CDN LI); nenhuma URL/compra é inventada.
  function mountMiniBanners(cfg) {
    if (!enabled(cfg)) return null;
    const data = Array.isArray(cfg.itens) ? cfg.itens.slice(0, 4) : [];
    const items = data.map(function (item) {
      if (!item) return null;
      const imagem = imageURL(item.imagem), link = safeURL(item.link);
      return imagem ? { imagem, link, alt: String(item.alt || "Nichelle Imports").slice(0, 130) } : null;
    }).filter(Boolean);
    if (items.length !== 4) {
      log("Mini banners aguardam as quatro artes da Nichelle na CDN.");
      return null;
    }
    const outer = section("banners"), frame = container();
    // As quatro imagens só aparecem em conjunto após carregar. Se a CDN
    // não tiver os arquivos, o visitante não vê retângulos vazios.
    outer.hidden = true;
    outer.dataset.n27Images = "loading";
    const grid = el("div", "n27-mini-grid");
    grid.setAttribute("aria-label", "Coleções e cuidados em destaque");
    let loaded = 0, failed = false;
    function settle(ok) {
      if (!ok) {
        failed = true;
        outer.dataset.n27Images = "error";
        log("Mini banners: imagem ausente na CDN; seção oculta.");
        return;
      }
      loaded += 1;
      if (!failed && loaded === items.length) {
        outer.dataset.n27Images = "ready";
        outer.hidden = false;
      }
    }
    items.forEach(function (item) {
      const a = el(item.link ? "a" : "div", "n27-mini-card");
      if (item.link) a.href = item.link;
      const img = el("img");
      img.alt = item.alt;
      img.loading = "eager"; img.decoding = "async";
      img.width = 405; img.height = 676;
      img.addEventListener("load", function () { settle(img.naturalWidth > 0); }, { once: true });
      img.addEventListener("error", function () { settle(false); }, { once: true });
      img.src = item.imagem;
      a.appendChild(img); grid.appendChild(a);
    });
    frame.appendChild(grid); outer.appendChild(frame);
    return outer;
  }

  function mountSlot(key) {
    const sources = {
      banners: { id: "fwr-nichelle-vitrine-slot", cfg: "bannerVitrine", event: "fwr:nichelle:banner-config" },
      videos: { id: "fwr-nichelle-video-slot", cfg: "galeriaVideos" },
      noticias: { id: "fwr-nichelle-noticias-slot", cfg: "noticias", event: "fwr:nichelle:news-config" }
    };
    const spec = sources[key], config = window.FWRNichelle && window.FWRNichelle[spec.cfg];
    // Na homologação local é permitido não mover os módulos já instalados.
    const integrations = settings().integracoes;
    if (integrations && integrations[key] === false) return null;
    if (!config || config.ativo !== true) return null;
    let slot = document.getElementById(spec.id);
    if (officialStoreMode()) {
      // Keep the FWR-owned slot where the merchant placed it. Never guess a
      // location or mutate native LI sections on the official host.
      if (!slot) { log("Slot FWR não encontrado:", spec.id); return null; }
      return null;
    }
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
      const imagem = imageURL(item.imagem), link = safeURL(item.link);
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
    if (!form) return null;
    const source = form.matches("form") ? form : select("form", form);
    if (!source || !source.querySelector("input[type=email], input[name=email]")) return null;
    // mount() never calls this for the official store; the real LI form remains native.
    if (form.dataset.n27Adopted === "1") return null;
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
      const imagem = imageURL(v.imagem), link = safeURL(v.link);
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
    const logo = imageURL(cfg.logo);
    const brand = logo ? el("img", "n27-company__brand") :
      el("strong", "n27-company__brand-fallback", cfg.nome || "Nichelle Imports");
    if (logo) {
      brand.src = logo; brand.alt = cfg.nome || "Nichelle Imports";
      brand.loading = "lazy"; brand.decoding = "async"; brand.width = 280; brand.height = 80;
    }
    inner.append(brand, el("div", "n27-company__description", cfg.texto.trim().slice(0, 1800)));
    frame.appendChild(inner); band.appendChild(frame); company.appendChild(band);
    const photo = imageURL(cfg.imagem);
    if (photo) {
      const img = el("img", "n27-company__photo");
      img.src = photo; img.alt = cfg.nome || "Nichelle Imports";
      img.loading = "lazy"; img.decoding = "async"; img.width = 590; img.height = 380;
      company.appendChild(img);
    }
    outer.appendChild(company);
    return outer;
  }

  // Montserrat variable 100–900: ativa apenas apos o gate de preview/publicacao.
  // Uma instalacao antecipada no HTML/Cabecalho e preferivel para evitar FOUT.
  function installMontserrat() {
    if (!document.head || document.documentElement.dataset.n27Fonts === "1") return;
    const links = [
      { rel: "preconnect", href: "https://fonts.googleapis.com" },
      { rel: "preconnect", href: "https://fonts.gstatic.com", crossorigin: "anonymous" },
      { rel: "stylesheet", href: "https://fonts.googleapis.com/css2?family=Montserrat:ital,wght@0,100..900;1,100..900&display=swap" }
    ];
    for (const spec of links) {
      const present = Array.from(document.head.querySelectorAll("link")).some(link =>
        link.rel === spec.rel && (
          spec.rel === "stylesheet" ?
            link.href.startsWith("https://fonts.googleapis.com/css2?family=Montserrat") :
            link.href === spec.href || link.href === spec.href + "/"
        )
      );
      if (present) continue;
      const link = document.createElement("link");
      link.rel = spec.rel;
      link.href = spec.href;
      if (spec.crossorigin) link.crossOrigin = spec.crossorigin;
      document.head.appendChild(link);
    }
    document.documentElement.dataset.n27Fonts = "1";
  }

  function mount() {
    const cfg = settings();
    if (!enabled(cfg.geral)) return { ativo: false, montados: Array.from(mounted) };
    // Execução permitida somente na fixture, na extensão privada ou
    // no domínio oficial com publicarNaLoja:true explicitamente configurado.
    if (!previewFixtureAllowed()) {
      log("Bloqueado: exige modo privado ou publicarNaLoja:true no domínio oficial.");
      return { ativo: false, bloqueado: true, montados: Array.from(mounted) };
    }

    installMontserrat();

    if (officialStoreMode() && !(cfg.layout && cfg.layout.homologado === true)) {
      // Sem homologação explícita, só deixa os slots FWR existentes intactos.
      // A liberação não depende de uma URL externa ou do mero download do JS.
      mountSlot("videos");
      return { ativo: true, adaptador: true, layout: false, montados: Array.from(mounted) };
    }

    // Skin visual aplica estilos apenas depois do gate opt-in; sem a URL
    // de teste e sem a flag publicarNaLoja, o site permanece inalterado.
    if (enabled(cfg.visual)) document.documentElement.dataset.n27Theme = "1";
    mountTopo();
    nativeSkin(cfg.rodape, "data-n27-footer");

    const opts = cfg.layout || {};
    if (!enabled(opts)) return { ativo: true, layout: false, montados: Array.from(mounted) };
    let root = select(opts.seletor);
    if (!root && opts.autocriarSlot === true && normalizePath(window.location.pathname) === "/") {
      const configuredAnchor = opts.inserirDepois || ".secao-banners";
      // Na Nichelle, o seletor genérico .vitrine-produtos pode apontar para
      // uma estrutura invisível; usar a vitrine visível Mais Vendidos.
      const anchor = configuredAnchor === ".vitrine-produtos" ?
        (select(".vitrine-mas-vendido") || select(configuredAnchor)) :
        select(configuredAnchor);
      if (anchor && anchor.parentNode) {
        root = el("div");
        root.id = "n27-layout-root";
        anchor.insertAdjacentElement("afterend", root);
      }
    }
    if (!root) { log("Slot principal ausente:", opts.seletor); return { ativo: true, layout: false }; }
    root.setAttribute("data-n27-root", "1");

    const map = {
      qualificadores: function () { return mountQualificadores(cfg.qualificadores || cfg.beneficios); },
      maisVendidos: function () { return mountVitrine(cfg.maisVendidos, "maisVendidos"); },
      banners: function () { return mountSlot("banners") || mountMiniBanners(cfg.miniBanners); },
      lancamentos: function () { return mountVitrine(cfg.lancamentos, "lancamentos"); },
      marcas: function () { return mountMarcas(cfg.marcas); },
      videos: function () { return mountSlot("videos"); },
      promocoes: function () { return mountVitrine(cfg.promocoes, "promocoes"); },
      noticias: function () { return mountSlot("noticias"); },
      newsletter: function () { return mountNewsletter(cfg.newsletter); },
      instagram: function () { return mountInstagram(cfg.instagram); },
      empresa: function () { return mountEmpresa(cfg.empresa); }
    };

    ORDER.forEach(function (key, index) {
      if (mounted.has(key)) return;
      const created = map[key]();
      if (!created) return;
      // Garante a sequência do layout mesmo se um bloco for ativado mais tarde.
      created.dataset.n27Section = key;
      const next = ORDER.slice(index + 1)
        .map(function (name) { return select('[data-n27-section="' + name + '"]', root); })
        .find(Boolean);
      root.insertBefore(created, next || null);
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
        previewPermitido: previewFixtureAllowed(), modoPreview: previewOnStore(),
        publicacaoAtiva: !!(settings().geral && settings().geral.publicarNaLoja === true),
        bloqueado: enabled(settings().geral) && !previewFixtureAllowed(),
        layout: !!select(settings().layout && settings().layout.seletor),
        isolamentoVisual: document.documentElement.dataset.n27Isolated === "1",
        homeAprovada: document.documentElement.dataset.n27Approved === "1",
        ordem: Array.from(ORDER), montados: Array.from(mounted),
        modules: Object.keys(settings()).filter(function (k) { return settings()[k] && settings()[k].ativo === true; }) };
    }
  });
  document.addEventListener("nichelle27:refresh", mount);
  if (document.readyState === "loading") document.addEventListener("DOMContentLoaded", mount, { once: true });
  else mount();
  // A Loja Integrada injeta vitrines e banners depois do DOMContentLoaded.
  // A montagem inicial pode não encontrar a âncora. Retentativas curtas,
  // idempotentes, somente na página e no modo autorizados.
  if (normalizePath(window.location.pathname) === "/" && enabled(settings().geral) &&
      previewFixtureAllowed()) {
    window.addEventListener("load", mount, { once: true });
    [250, 900, 2000, 4000].forEach(function (delay) {
      window.setTimeout(function () {
        if (!select(settings().layout && settings().layout.seletor)) mount();
      }, delay);
    });
  }
})();


/* Runtime FWR legado integrado ao bundle Nichelle27 */
/* Nichelle 2026 — runtime FWR. Uma única URL para funcionalidades customizadas.
   Configuração operacional da galeria pode vir do JSON público publicado pelo dashboard. */
(function () {
  "use strict";
  if (window.__FWR_NICHELLE_RUNTIME__) return;
  window.__FWR_NICHELLE_RUNTIME__ = true;
  function isOfficialStoreHost() {
    const host = String(window.location.hostname || "").toLowerCase();
    return host === "www.nichelleimports.com.br" || host === "nichelleimports.com.br";
  }

  // Carrega o CSS oficial ao lado do JS. Pode ser sobrescrito no editor LI.
  function installStyles() {
    if (document.getElementById("fwr-nichelle-styles")) return;
    const script = document.currentScript;
    const configured = window.FWRNichelleStylesheet ||
      (script && script.getAttribute("data-stylesheet-url")) || "";
    let href = "";
    try {
      if (!script || !script.src) return;
      const scriptURL = new URL(script.src, window.location.href);
      href = configured ? new URL(configured, scriptURL).href : new URL("nichelle.css", scriptURL).href;
      const url = new URL(href);
      const localHttp = url.protocol === "http:" &&
        ["localhost", "127.0.0.1"].includes(url.hostname) && url.origin === scriptURL.origin;
      if ((!localHttp && url.protocol !== "https:") || url.username || url.password || url.search || url.hash) return;
      if (url.origin !== scriptURL.origin) return;
    } catch (_) { return; }
    const link = document.createElement("link");
    link.id = "fwr-nichelle-styles";
    link.rel = "stylesheet";
    link.href = href;
    (document.head || document.documentElement).appendChild(link);
  }
  /* CSS incorporado ao nichelle27.css */

  function youtubeId(value) {
    if (typeof value !== "string") return "";
    try {
      const u = new URL(value.trim());
      if (u.protocol !== "https:") return "";
      const h = u.hostname.toLowerCase();
      let id = "";
      if (h === "youtu.be" || h === "www.youtu.be") id = u.pathname.split("/")[1] || "";
      else if (["youtube.com", "www.youtube.com", "m.youtube.com"].includes(h)) {
        if (u.pathname === "/watch") id = u.searchParams.get("v") || "";
        else id = (u.pathname.match(/^\/(?:shorts|embed|live)\/([A-Za-z0-9_-]{11})(?:\/|$)/) || [])[1] || "";
      }
      return /^[A-Za-z0-9_-]{11}$/.test(id) ? id : "";
    } catch (_) { return ""; }
  }

  function normalizedCards(config) {
    const list = config && Array.isArray(config.shorts) ? config.shorts.slice(0, 4) : [];
    return list.map(function (entry, i) {
      const raw = typeof entry === "string" ? { url: entry } : (entry || {});
      const id = youtubeId(raw.url);
      if (!id) return null;
      let poster = "";
      if (typeof raw.capa === "string" && raw.capa.trim()) {
        try {
          const p = new URL(raw.capa.trim());
          if (p.protocol === "https:" && !p.username && !p.password) poster = p.href;
        } catch (_) { /* ignore invalid custom poster */ }
      }
      return {
        id: id,
        poster: poster || "https://i.ytimg.com/vi/" + id + "/oar2.jpg",
        automatic: !poster,
        alt: typeof raw.descricao === "string" && raw.descricao.trim() ?
          raw.descricao.trim().slice(0, 180) : "Vídeo de produto " + (i + 1)
      };
    }).filter(Boolean);
  }

  function publishedGalleryConfig(payload) {
    const gallery = payload && payload.schemaVersion === 1 && payload.project === "nichelle-2026" &&
      payload.modules && payload.modules.videoGallery;
    if (!gallery || typeof gallery.enabled !== "boolean" || !Array.isArray(gallery.items)) return null;
    const items = gallery.items.filter(function (item) {
      return item && item.enabled === true && Number.isFinite(item.order);
    }).sort(function (a, b) { return a.order - b.order; }).slice(0, 4);
    return {
      ativo: gallery.enabled,
      shorts: items.map(function (item) {
        return { url: item.videoUrl, capa: item.posterUrl || "", descricao: item.alt || "" };
      })
    };
  }

  function loadPublishedGallery() {
    const settings = window.FWRNichelle && window.FWRNichelle.galeriaVideos;
    const configUrl = settings && typeof settings.configUrl === "string" ? settings.configUrl.trim() : "";
    // The official host only accepts the server-validated published snapshot.
    // Manual settings remain available in local previews and isolated fixtures.
    if (!configUrl) return Promise.resolve(isOfficialStoreHost() ? null : (settings || null));
    let url;
    try {
      url = new URL(configUrl, window.location.href);
      const localHttp = url.protocol === "http:" && url.origin === window.location.origin &&
        ["localhost", "127.0.0.1"].includes(url.hostname);
      if ((!localHttp && url.protocol !== "https:") || url.username || url.password || url.hash || url.search) {
        return Promise.resolve(null);
      }
    } catch (_) { return Promise.resolve(null); }
    return fetch(url.href, { mode: "cors", credentials: "omit", cache: "no-store", redirect: "error" })
      .then(function (response) {
        if (!response.ok) throw new Error("Configuração pública indisponível");
        return response.json();
      })
      .then(publishedGalleryConfig)
      .catch(function () { return null; });
  }

  function showUnavailableGallery(slot) {
    const message = document.createElement("p");
    message.className = "fwr-nichelle-videos__status";
    message.setAttribute("role", "status");
    message.textContent = "Galeria de vídeos temporariamente indisponível.";
    slot.replaceChildren(message);
    slot.dataset.fwrInitialized = "1";
  }

  function initVideoGallery(opts) {
    const slot = document.querySelector("#fwr-nichelle-video-slot");
    if (!slot || slot.dataset.fwrInitialized === "1") return;
    const remoteManaged = slot.dataset.fwrRemote === "1";
    if (!opts || opts.ativo !== true) {
      if (remoteManaged) showUnavailableGallery(slot);
      return;
    }
    const cards = normalizedCards(opts);
    if (!cards.length) {
      if (remoteManaged) showUnavailableGallery(slot);
      return;
    }
    slot.dataset.fwrInitialized = "1";

    const section = document.createElement("section");
    section.className = "fwr-nichelle-videos";
    section.setAttribute("aria-label", "Galeria de vídeos da Nichelle");
    const track = document.createElement("div");
    track.className = "fwr-nichelle-videos__track";
    track.style.setProperty("--fwr-nichelle-cards", String(cards.length));

    let modal = null, lastFocus = null, originalOverflow = "", priorInert = [];
    let activeIndex = 0, frame = null, dialog = null, position = null;
    let touchStart = null;

    function showVideo(index) {
      if (!modal || !frame || !cards.length) return;
      activeIndex = (index + cards.length) % cards.length;
      const card = cards[activeIndex];
      // Reutiliza apenas UM iframe. Alterar sua URL interrompe a reprodução anterior.
      frame.removeAttribute("src");
      frame.title = card.alt;
      dialog.setAttribute("aria-label", "Vídeo " + (activeIndex + 1) + " de " + cards.length + ": " + card.alt);
      position.textContent = (activeIndex + 1) + " / " + cards.length;
      frame.src = "https://www.youtube-nocookie.com/embed/" + card.id + "?autoplay=1&playsinline=1&rel=0";
    }
    function close() {
      if (!modal) return;
      if (frame) { frame.removeAttribute("src"); frame.remove(); }
      modal.remove(); modal = null; frame = null; dialog = null; position = null;
      document.removeEventListener("keydown", onKey);
      document.removeEventListener("focusin", keepFocus);
      document.body.style.overflow = originalOverflow;
      priorInert.forEach(function (row) {
        row[0].inert = row[1];
        if (row[2] === null) row[0].removeAttribute("aria-hidden");
        else row[0].setAttribute("aria-hidden", row[2]);
      });
      priorInert = [];
      touchStart = null;
      if (lastFocus && lastFocus.isConnected) lastFocus.focus();
    }
    function onKey(event) {
      if (!modal) return;
      if (event.key === "Escape") { event.preventDefault(); close(); return; }
      if (cards.length > 1 && event.key === "ArrowRight") { event.preventDefault(); showVideo(activeIndex + 1); return; }
      if (cards.length > 1 && event.key === "ArrowLeft") { event.preventDefault(); showVideo(activeIndex - 1); return; }
      if (event.key !== "Tab") return;
      const controls = Array.from(modal.querySelectorAll("button,iframe"))
        .filter(function (el) { return el.getClientRects().length > 0; });
      if (!controls.length) return;
      if (event.shiftKey && document.activeElement === controls[0]) {
        event.preventDefault(); controls[controls.length - 1].focus();
      } else if (!event.shiftKey && document.activeElement === controls[controls.length - 1]) {
        event.preventDefault(); controls[0].focus();
      }
    }
    function keepFocus(event) {
      if (modal && !modal.contains(event.target)) modal.querySelector("button")?.focus();
    }
    function play(index, button) {
      if (modal) return;
      lastFocus = button;
      originalOverflow = document.body.style.overflow;
      modal = document.createElement("div");
      modal.className = "fwr-nichelle-video-modal";
      dialog = document.createElement("div");
      dialog.className = "fwr-nichelle-video-modal__dialog";
      dialog.setAttribute("role", "dialog");
      dialog.setAttribute("aria-modal", "true");

      const closeButton = document.createElement("button");
      closeButton.className = "fwr-nichelle-video-modal__close";
      closeButton.type = "button"; closeButton.textContent = "×";
      closeButton.setAttribute("aria-label", "Fechar vídeo");
      closeButton.addEventListener("click", close);

      frame = document.createElement("iframe");
      frame.className = "fwr-nichelle-video-modal__media";
      frame.allow = "autoplay; encrypted-media; fullscreen; picture-in-picture";
      frame.allowFullscreen = true;
      frame.referrerPolicy = "strict-origin-when-cross-origin";

      const controls = document.createElement("div");
      controls.className = "fwr-nichelle-video-modal__controls";
      controls.setAttribute("aria-label", "Navegar entre vídeos");
      if (cards.length < 2) controls.hidden = true;
      const prev = document.createElement("button");
      prev.type = "button";
      prev.className = "fwr-nichelle-video-modal__nav";
      prev.textContent = "‹";
      prev.setAttribute("aria-label", "Vídeo anterior");
      prev.addEventListener("click", function () { showVideo(activeIndex - 1); });
      const next = document.createElement("button");
      next.type = "button";
      next.className = "fwr-nichelle-video-modal__nav";
      next.textContent = "›";
      next.setAttribute("aria-label", "Próximo vídeo");
      next.addEventListener("click", function () { showVideo(activeIndex + 1); });
      const center = document.createElement("div");
      center.className = "fwr-nichelle-video-modal__position";
      position = document.createElement("span");
      position.setAttribute("aria-live", "polite");
      position.setAttribute("aria-atomic", "true");
      const hint = document.createElement("span");
      hint.className = "fwr-nichelle-video-modal__hint";
      hint.textContent = "Deslize aqui para trocar";
      center.append(position, hint);
      controls.append(prev, center, next);
      dialog.append(closeButton, frame, controls);
      modal.append(dialog);
      modal.addEventListener("click", function (event) { if (event.target === modal) close(); });

      // O iframe do YouTube intercepta gestos de toque; o deslize funciona
      // na faixa de navegação inferior e nas áreas externas ao player.
      modal.addEventListener("touchstart", function (event) {
        if (event.touches.length !== 1 || event.target.closest("button")) { touchStart = null; return; }
        touchStart = { x: event.touches[0].clientX, y: event.touches[0].clientY };
      }, { passive: true });
      modal.addEventListener("touchend", function (event) {
        if (!touchStart || cards.length < 2 || !event.changedTouches.length) return;
        const dx = event.changedTouches[0].clientX - touchStart.x;
        const dy = event.changedTouches[0].clientY - touchStart.y;
        touchStart = null;
        if (Math.abs(dx) < 55 || Math.abs(dx) < Math.abs(dy) * 1.3) return;
        showVideo(activeIndex + (dx < 0 ? 1 : -1));
      }, { passive: true });

      document.body.append(modal);
      priorInert = Array.from(document.body.children).filter(function (el) { return el !== modal; })
        .map(function (el) { return [el, el.inert, el.getAttribute("aria-hidden")]; });
      priorInert.forEach(function (row) { row[0].inert = true; row[0].setAttribute("aria-hidden", "true"); });
      document.body.style.overflow = "hidden";
      document.addEventListener("keydown", onKey);
      document.addEventListener("focusin", keepFocus);
      showVideo(index);
      closeButton.focus();
    }
    cards.forEach(function (card, index) {
      const button = document.createElement("button");
      button.type = "button";
      button.className = "fwr-nichelle-videos__card";
      button.setAttribute("aria-label", "Reproduzir vídeo: " + card.alt);
      const img = document.createElement("img");
      img.className = "fwr-nichelle-videos__poster";
      img.alt = card.alt; img.src = card.poster;
      img.width = 450; img.height = 800; img.loading = "lazy"; img.decoding = "async";
      const fallback = document.createElement("span");
      fallback.className = "fwr-nichelle-videos__fallback";
      fallback.textContent = "Prévia indisponível";
      fallback.hidden = true;
      if (card.automatic) {
        const variants = ["oardefault.jpg", "hqdefault.jpg"];
        let attempt = 0;
        function next() {
          if (attempt >= variants.length) { img.hidden = true; fallback.hidden = false; return; }
          img.src = "https://i.ytimg.com/vi/" + card.id + "/" + variants[attempt++];
        }
        img.addEventListener("error", next);
        img.addEventListener("load", function () { if (img.naturalWidth > 0 && img.naturalWidth < 150) next(); });
      } else img.addEventListener("error", function () { img.hidden = true; fallback.hidden = false; });
      const icon = document.createElement("span");
      icon.className = "fwr-nichelle-videos__play";
      icon.setAttribute("aria-hidden", "true");
      icon.innerHTML = '<svg viewBox="0 0 48 48" focusable="false"><path d="M11 5 Q11 2 15 4 L42 21 Q46 24 42 27 L15 44 Q11 46 11 42 Z"/></svg>';
      button.append(img, fallback, icon);
      button.addEventListener("click", function () { play(index, button); });
      track.append(button);
    });
    section.append(track); slot.replaceChildren(section);
  }

  /*
   * VITRINE EM QUATRO CARDS — totalmente opt-in.
   * Origem: banners VITRINE publicados pelo próprio painel Loja Integrada.
   * O nome cadastrado no painel precisa corresponder exatamente a cfg.nomes,
   * pois a LI o expõe como ALT da imagem. Nunca acessa API privada.
   */
  function initBannerVitrine() {
    const cfg = window.FWRNichelle && window.FWRNichelle.bannerVitrine;
    if (!cfg || cfg.ativo !== true) return;
    // "mini" busca imagens da posição Mini Banner, quando o tema LI
    // efetivamente as renderiza na página. "categoria" preserva legado Full Banner.
    // A modalidade "vitrine" permanece disponível para configurações anteriores.
    const origem = ["lateral", "mini", "categoria"].includes(cfg.origem) ? cfg.origem : "vitrine";
    const slot = document.getElementById("fwr-nichelle-vitrine-slot");
    if (!slot) return;
    // Alguns temas têm .listagem dentro de submenus ocultos do cabeçalho.
    // Se o HTML antigo criou o slot ali, realocá-lo para o conteúdo principal.
    // Nunca deslocar slots intencionalmente posicionados fora do menu.
    if (slot.closest && slot.closest("header, nav, .cabecalho, .submenu, .submenu-wrap, .menu.superior")) {
      const content = document.querySelector("#corpo .secao-principal .conteudo") ||
        document.querySelector("#corpo .conteudo");
      if (content && !content.contains(slot)) {
        let before = content.querySelector(".listagem, .listagem-produtos");
        // insertBefore exige um filho direto; respeita agrupamentos do tema.
        while (before && before.parentElement !== content) before = before.parentElement;
        content.insertBefore(slot, before || content.firstElementChild || null);
      }
    }
    if (slot.dataset.fwrInitialized === "1") return;
    // Sem restrição fixa de categoria: a lista de páginas é configurada no HTML.
    // Array vazio ou ausência da opção permite renderização em qualquer página.
    if (Array.isArray(cfg.paginas) && cfg.paginas.length) {
      const normal = function (p) { return (String(p || "/").replace(/\/+$/, "") || "/"); };
      if (!cfg.paginas.some(function (p) { return normal(p) === normal(window.location.pathname); })) return;
    }
    // Não renderizar nem alterar os banners nativos sem todos os quatro nomes.
    const configuredNames = Array.isArray(cfg.nomes) ? cfg.nomes.slice(0, 4) : [];
    if (configuredNames.length !== 4 ||
        configuredNames.some(function (n) { return typeof n !== "string" || !n.trim(); })) return;
    // Por padrão só monta com 4 imagens. Na homologação lateral, minimo:1
    // mostra as imagens publicadas mesmo que a configuração tenha nomes repetidos.
    const minimo = Number.isInteger(cfg.minimo) && cfg.minimo >= 1 && cfg.minimo <= 4 ?
      cfg.minimo : (origem === "lateral" ? 1 : 4);

    function key(s) {
      return String(s || "").normalize("NFD").replace(/[\u0300-\u036f]/g, "")
        .replace(/\s+/g, " ").trim().toLowerCase();
    }
    const usedNames = new Set();
    const names = configuredNames.filter(function (value) {
      const normalized = key(value);
      if (usedNames.has(normalized)) return false;
      usedNames.add(normalized);
      return true;
    });
    // Nas vitrines normais continua obrigatória a presença dos 4 nomes distintos.
    if (names.length < minimo || (origem !== "lateral" && names.length !== 4)) return;
    const required = names.map(key);

    function safeURL(value) {
      if (!value || typeof value !== "string" || value.trim() === "#") return "";
      try {
        const u = new URL(value.trim(), window.location.href);
        return (u.protocol === "https:" || (u.protocol === "http:" && u.origin === window.location.origin)) ? u.href : "";
      } catch (_) { return ""; }
    }

    // O campo "Nome do banner" da LI nem sempre é publicado como ALT.
    // Aceita também nome do arquivo/atributos de banner, mas NÃO qualquer imagem
    // da página. A busca ocorre apenas quando o bloco está habilitado.
    let documentoAlternativo = null;
    function bannerNameMatches(img, name) {
      const anchor = img.closest("a");
      const wrapper = img.closest("[data-banner-name], [data-nome], [title]");
      const values = [
        img.getAttribute("alt"), img.getAttribute("title"),
        img.getAttribute("data-banner-name"), img.getAttribute("data-nome"),
        img.getAttribute("src"), img.getAttribute("data-src"),
        img.getAttribute("data-lazy"), img.getAttribute("data-original"),
        anchor && anchor.getAttribute("title"),
        wrapper && wrapper.getAttribute("data-banner-name"),
        wrapper && wrapper.getAttribute("data-nome")
      ].filter(Boolean);
      return values.some(function (value) {
        if (key(value) === name) return true;
        // O CDN às vezes preserva o nome do upload dentro da URL.
        // Exigir limite de palavra para não confundir pages1 com pages10.
        let leaf = String(value).split(/[?#]/)[0].split("/").pop() || "";
        try { leaf = decodeURIComponent(leaf); } catch (_) {}
        leaf = key(leaf).replace(/\.[a-z0-9]{2,5}$/i, "");
        return leaf === name || leaf.startsWith(name + "-") || leaf.startsWith(name + "_");
      });
    }
    function findNative() {
      const selected = [];
      const roots = [document].concat(documentoAlternativo ? [documentoAlternativo] : []);
      const direct = Array.isArray(cfg.imagens) ? cfg.imagens : [];
      for (let i = 0; i < required.length; i++) {
        const name = required[i];
        let entry = null;
        for (const root of roots) {
          const images = Array.from(root.querySelectorAll("img"));
          const img = images.find(function (candidate) {
            if (root === document && candidate.closest("#fwr-nichelle-vitrine-slot")) return false;
            if (candidate.closest(".slick-cloned, .swiper-slide-duplicate")) return false;
            if (!bannerNameMatches(candidate, name)) return false;
            if (origem === "vitrine") {
              const src = candidate.getAttribute("src") || "";
              return !!candidate.closest(".banner.vitrine, .banner-vitrine, [class*='banner-vitrine'], .secao-banners") ||
                /\/banner\//i.test(src);
            }
            return true;
          });
          if (!img) continue;
          const src = safeURL(img.getAttribute("data-src") || img.getAttribute("data-original") ||
            img.getAttribute("data-lazy") || img.currentSrc || img.getAttribute("src"));
          if (!src) continue;
          const link = img.closest("a[href]");
          entry = { img: img, src: src, link: link,
            destination: link && safeURL(link.getAttribute("href")) };
          break;
        }
        // Fallback controlado: imagens/links continuam hospedados e editados na LI.
        // Útil quando o tema NÃO renderiza Banner Lateral na página de categoria.
        if (!entry) {
          const item = direct.find(function (value) { return value && key(value.nome) === name; });
          const src = item && safeURL(item.imagem);
          if (src) {
            const img = document.createElement("img");
            img.setAttribute("src", src);
            img.setAttribute("alt", names[i]);
            entry = { img: img, src: src, link: null,
              destination: safeURL(item.link) };
          }
        }
        if (!entry) {
          if (minimo < 4) continue;
          return [];
        }
        entry.nome = names[i];
        selected.push(entry);
      }
      return selected.length >= minimo ? selected : [];
    }

    function mount(banners) {
      if (slot.dataset.fwrInitialized === "1" || banners.length < minimo || banners.length > 4) return;
      const styleId = "fwr-nichelle-vitrine-styles";
      if (!document.getElementById(styleId)) {
        const style = document.createElement("style");
        style.id = styleId;
        style.textContent = "#fwr-nichelle-vitrine-slot{box-sizing:border-box;max-width:1920px;width:100%;margin-inline:auto}" +
          "#fwr-nichelle-vitrine-slot *{box-sizing:border-box}" +
          "#fwr-nichelle-vitrine-slot .fwr-nichelle-vitrine{padding:24px clamp(14px,3.3vw,65px)}" +
          "#fwr-nichelle-vitrine-slot .fwr-nichelle-vitrine__grid{display:grid;grid-template-columns:repeat(4,minmax(0,1fr));gap:clamp(12px,1.85vw,36px)}" +
          "#fwr-nichelle-vitrine-slot .fwr-nichelle-vitrine__card{display:block;position:relative;width:100%;aspect-ratio:3/5;border-radius:clamp(12px,1.2vw,22px);overflow:hidden;background:#f0eeeb;text-decoration:none;isolation:isolate}" +
          "#fwr-nichelle-vitrine-slot .fwr-nichelle-vitrine__card img{display:block;width:100%;height:100%;object-fit:cover}" +
          "#fwr-nichelle-vitrine-slot .fwr-nichelle-vitrine__card picture{display:block;width:100%;height:100%}" +
          "#fwr-nichelle-vitrine-slot .fwr-nichelle-vitrine__card:focus-visible{outline:3px solid #252525;outline-offset:4px}" +
          ".fwr-nichelle-vitrine-native-hidden{display:none!important}" +
          "@media(max-width:767px){" +
          "#fwr-nichelle-vitrine-slot .fwr-nichelle-vitrine{padding:18px 0 24px}" +
          "#fwr-nichelle-vitrine-slot .fwr-nichelle-vitrine__grid{grid-auto-flow:column;grid-auto-columns:minmax(0,72vw);grid-template-columns:none;gap:12px;overflow-x:auto;scroll-snap-type:x mandatory;overscroll-behavior-inline:contain;scroll-padding-inline:16px;padding:3px 16px 12px;-webkit-overflow-scrolling:touch;scrollbar-width:thin}" +
          "#fwr-nichelle-vitrine-slot .fwr-nichelle-vitrine__card{scroll-snap-align:start;border-radius:16px}" +
          "}";
        (document.head || document.documentElement).appendChild(style);
      }
      const section = document.createElement("section");
      section.className = "fwr-nichelle-vitrine";
      section.setAttribute("aria-label", "Encontre o cuidado ideal para sua pele");
      const grid = document.createElement("div");
      grid.className = "fwr-nichelle-vitrine__grid";
      banners.forEach(function (banner, index) {
        const card = document.createElement(banner.destination ? "a" : "div");
        card.className = "fwr-nichelle-vitrine__card";
        if (banner.destination) {
          card.href = banner.destination;
          if (banner.link && banner.link.target === "_blank") {
            card.target = "_blank";
            card.rel = "noopener noreferrer";
          }
        }
        const picture = banner.img.parentElement && banner.img.parentElement.tagName === "PICTURE" ?
          banner.img.parentElement.cloneNode(true) : null;
        const image = picture ? picture.querySelector("img") : banner.img.cloneNode(true);
        if (!image) return;
        // Src/links continuam vindo do painel nativo; poster não é cadastrado no JS.
        image.src = banner.src;
        image.alt = banner.img.getAttribute("alt") || banner.nome || names[index];
        image.loading = "lazy";
        image.decoding = "async";
        image.width = 600;
        image.height = 1000;
        image.removeAttribute("style");
        if (picture) card.appendChild(picture);
        else card.appendChild(image);
        grid.appendChild(card);
      });
      if (grid.children.length !== banners.length || grid.children.length < minimo) return;
      section.appendChild(grid);
      slot.replaceChildren(section);
      slot.dataset.fwrInitialized = "1";
      slot.dataset.fwrActive = "1";
      slot.style.minHeight = "";
      // Ocultar apenas os quatro banners individuais reaproveitados. Os demais
      // banners, vitrines, carrinho e módulos nativos da LI ficam intactos.
      // Mini Banner e Full Banner podem integrar um carrossel do tema.
      // Preservá-lo por padrão; ocultação só com autorização explícita,
      // evitando espaços vazios e quebra da navegação nativa.
      if (origem === "vitrine" || cfg.ocultarOriginais === true) {
        banners.forEach(function (banner) {
          const source = banner.link && banner.link.querySelectorAll("img").length === 1 ?
            banner.link : banner.img;
          source.classList.add("fwr-nichelle-vitrine-native-hidden");
        });
      }
    }

    let observer = null, timer = null, pending = false;
    function attempt() {
      if (slot.dataset.fwrInitialized === "1") return true;
      const found = findNative();
      if (found.length < minimo || found.length > 4) return false;
      mount(found);
      if (observer) observer.disconnect();
      if (timer) clearTimeout(timer);
      return true;
    }
    if (attempt()) return;
    // Busca opcional da fonte original, na MESMA loja e apenas quando habilitado.
    // Permite testar /cabelos usando banners publicados somente na home.
    if (typeof cfg.fonteAlternativa === "string" && cfg.fonteAlternativa.trim() &&
        typeof window.fetch === "function" && typeof window.DOMParser === "function") {
      try {
        const url = new URL(cfg.fonteAlternativa, window.location.href);
        if (url.origin === window.location.origin && url.pathname !== window.location.pathname &&
            (url.protocol === "https:" || url.protocol === "http:")) {
          window.fetch(url.href, { credentials: "same-origin", cache: "no-store" })
            .then(function (response) { if (!response.ok) throw Error("Origem de banners indisponível"); return response.text(); })
            .then(function (html) {
              documentoAlternativo = new window.DOMParser().parseFromString(html, "text/html");
              attempt();
            })
            .catch(function () {
              if (cfg.debug === true) console.warn("[Nichelle] Não foi possível ler banners da fonte alternativa.");
            });
        }
      } catch (_) { /* URL não suportada: manter banners nativos intactos. */ }
    }
    // Os banners da LI podem ser injetados depois de DOMContentLoaded.
    // O observador só existe com ativo:true e é encerrado após no máximo 6s.
    observer = new MutationObserver(function () {
      if (pending) return;
      pending = true;
      window.requestAnimationFrame(function () {
        pending = false;
        attempt();
      });
    });
    observer.observe(document.body, { childList: true, subtree: true });
    timer = window.setTimeout(function () {
      observer.disconnect();
      if (slot.dataset.fwrInitialized !== "1") {
        slot.dataset.fwrActive = "0";
        slot.style.minHeight = "";
      }
    }, 6000);
  }

  /*
   * NOTÍCIAS EDITORIAIS — cadastro no HTML/Rodapé; URL de destino
   * aponta para página de conteúdo da Loja Integrada.
   * Oculte SOMENTE os links dessas páginas no rodapé, nunca as páginas.
   */
  function initNoticias() {
    const config = window.FWRNichelle && window.FWRNichelle.noticias;
    if (!config || !Array.isArray(config.itens)) return;

    function safeUrl(input, sameOriginOnly) {
      if (typeof input !== "string" || !input.trim()) return "";
      try {
        const u = new URL(input.trim(), window.location.href);
        if (u.protocol !== "https:" && !(u.protocol === "http:" && u.origin === window.location.origin)) return "";
        if (u.username || u.password) return "";
        if (sameOriginOnly && u.origin !== window.location.origin) return "";
        return u.href;
      } catch (_) { return ""; }
    }
    function pathOf(href) {
      const url = safeUrl(href, true);
      if (!url) return "";
      const u = new URL(url);
      return u.pathname.replace(/\/+$/, "") || "/";
    }
    // Páginas extras/institucionais são listadas no rodapé nativo da LI.
    // Apenas o link exato de cada notícia cadastrada é removido dali.
    function hideFooterLinks() {
      if (config.ocultarLinksRodape !== true) return;
      const paths = new Set(config.itens.map(function (item) {
        return item && pathOf(item.link);
      }).filter(Boolean));
      if (!paths.size) return;
      document.querySelectorAll("footer a[href], .rodape a[href], #rodape a[href], .footer a[href], #footer a[href]")
        .forEach(function (anchor) {
          if (!paths.has(pathOf(anchor.getAttribute("href")))) return;
          const li = anchor.closest("li");
          const target = li && li.querySelectorAll("a[href]").length === 1 ? li : anchor;
          target.style.setProperty("display", "none", "important");
          target.setAttribute("data-fwr-noticia-footer-oculta", "1");
        });
    }
    hideFooterLinks();

    if (config.ativo !== true) return;
    const slot = document.getElementById("fwr-nichelle-noticias-slot");
    if (!slot || slot.dataset.fwrInitialized === "1") return;

    const items = config.itens.slice(0, 3).map(function (raw) {
      if (!raw || typeof raw !== "object") return null;
      const foto = safeUrl(raw.foto, false), link = safeUrl(raw.link, true);
      const titulo = typeof raw.titulo === "string" ? raw.titulo.trim().slice(0, 170) : "";
      const breve = typeof raw.breveTexto === "string" ? raw.breveTexto : raw.resumo;
      const resumo = typeof breve === "string" ? breve.trim().slice(0, 310) : "";
      const data = typeof raw.data === "string" ? raw.data.trim() : "";
      if (!foto || !link || !titulo || !resumo || !data) return null;
      let iso = "", label = data.slice(0, 60);
      const parts = /^(\d{4})-(\d{2})-(\d{2})$/.exec(data);
      if (parts) {
        const year = Number(parts[1]), month = Number(parts[2]), day = Number(parts[3]);
        const date = new Date(Date.UTC(year, month - 1, day));
        if (year >= 2000 && date.getUTCFullYear() === year &&
            date.getUTCMonth() === month - 1 && date.getUTCDate() === day) {
          iso = data;
          label = new Intl.DateTimeFormat("pt-BR", {
            day: "2-digit", month: "long", year: "numeric", timeZone: "UTC"
          }).format(date);
        }
      }
      return { foto, link, titulo, resumo, iso, data: label };
    }).filter(Boolean);
    if (!items.length) return;

    const styleId = "fwr-nichelle-news-styles";
    if (!document.getElementById(styleId)) {
      const style = document.createElement("style");
      style.id = styleId;
      style.textContent = "#fwr-nichelle-noticias-slot{box-sizing:border-box;width:100%}\n#fwr-nichelle-noticias-slot,#fwr-nichelle-noticias-slot *{box-sizing:border-box}\n#fwr-nichelle-noticias-slot .fwr-nichelle-news{background:#f0eaf2;padding:clamp(26px,3.2vw,55px) 0}\n#fwr-nichelle-noticias-slot .fwr-nichelle-news__inner{max-width:1460px;margin-inline:auto;padding-inline:clamp(16px,2.2vw,32px)}\n#fwr-nichelle-noticias-slot .fwr-nichelle-news__heading{display:flex;align-items:center;gap:10px;margin:0 0 clamp(22px,2vw,32px);font:400 clamp(19px,1.5vw,23px)/1.25 Arial,sans-serif;color:#68616c}\n#fwr-nichelle-noticias-slot .fwr-nichelle-news__heading strong{color:#aa41bb;font-weight:700}\n#fwr-nichelle-noticias-slot .fwr-nichelle-news__heading:after{content:\"\";flex:1;height:1px;background:#bcb4bf}\n#fwr-nichelle-noticias-slot .fwr-nichelle-news__layout{display:grid;grid-template-columns:minmax(0,1fr) minmax(0,1fr);gap:16px;align-items:stretch}\n#fwr-nichelle-noticias-slot .fwr-nichelle-news__layout[data-count=\"1\"]{grid-template-columns:minmax(0,1fr)}\n#fwr-nichelle-noticias-slot .fwr-nichelle-news__featured{position:relative;display:block;overflow:hidden;isolation:isolate;aspect-ratio:1.48;min-height:0;border-radius:17px;background:#d8c9d7;text-decoration:none;color:#fff}\n#fwr-nichelle-noticias-slot .fwr-nichelle-news__featured:after{content:\"\";position:absolute;inset:0;z-index:1;background:linear-gradient(180deg,transparent 24%,rgba(0,0,0,.12) 39%,rgba(0,0,0,.86) 100%);pointer-events:none}\n#fwr-nichelle-noticias-slot .fwr-nichelle-news__image{display:block;width:100%;height:100%;object-fit:cover}\n#fwr-nichelle-noticias-slot .fwr-nichelle-news__featured-content{position:absolute;z-index:2;bottom:0;left:0;right:0;padding:clamp(18px,2.4vw,34px);display:grid;gap:clamp(12px,1.3vw,21px)}\n#fwr-nichelle-noticias-slot .fwr-nichelle-news__featured-title{margin:0;font:800 clamp(16px,1.3vw,21px)/1.18 Arial,sans-serif;text-transform:uppercase;letter-spacing:.005em;overflow-wrap:anywhere}\n#fwr-nichelle-noticias-slot .fwr-nichelle-news__featured-summary{margin:0;font:400 clamp(12px,.95vw,15px)/1.45 Arial,sans-serif;display:-webkit-box;-webkit-line-clamp:3;-webkit-box-orient:vertical;overflow:hidden}\n#fwr-nichelle-noticias-slot .fwr-nichelle-news__meta{display:flex;justify-content:space-between;align-items:flex-end;gap:12px;font:400 clamp(11px,.94vw,14px)/1.35 Arial,sans-serif}\n#fwr-nichelle-noticias-slot .fwr-nichelle-news__read{text-decoration:underline;font-weight:700;white-space:nowrap}\n#fwr-nichelle-noticias-slot .fwr-nichelle-news__sidebar{display:grid;grid-auto-rows:minmax(0,1fr);gap:16px;min-width:0}\n#fwr-nichelle-noticias-slot .fwr-nichelle-news__item{min-width:0;display:grid;grid-template-columns:minmax(0,44%) minmax(0,1fr);gap:clamp(12px,1vw,19px);align-items:stretch;color:#625d66;text-decoration:none}\n#fwr-nichelle-noticias-slot .fwr-nichelle-news__thumb{display:block;min-width:0;overflow:hidden;position:relative;aspect-ratio:1.38;border-radius:17px;background:#dbcddd}\n#fwr-nichelle-noticias-slot .fwr-nichelle-news__thumb img{position:absolute;inset:0;width:100%;height:100%;object-fit:cover}\n#fwr-nichelle-noticias-slot .fwr-nichelle-news__info{min-width:0;display:flex;flex-direction:column;padding:clamp(8px,1.6vw,32px) 0;gap:clamp(9px,.9vw,17px)}\n#fwr-nichelle-noticias-slot .fwr-nichelle-news__item-title{margin:0;color:#a83cba;font:800 clamp(13px,1.05vw,17px)/1.12 Arial,sans-serif;text-transform:uppercase;overflow-wrap:anywhere;display:-webkit-box;-webkit-box-orient:vertical;-webkit-line-clamp:3;overflow:hidden}\n#fwr-nichelle-noticias-slot .fwr-nichelle-news__summary{margin:0;font:400 clamp(11px,.9vw,14px)/1.28 Arial,sans-serif;display:-webkit-box;-webkit-line-clamp:3;-webkit-box-orient:vertical;overflow:hidden}\n#fwr-nichelle-noticias-slot .fwr-nichelle-news__item .fwr-nichelle-news__meta{margin-top:auto;font-size:clamp(10px,.87vw,13px)}\n#fwr-nichelle-noticias-slot a:focus-visible{outline:3px solid #a83cba;outline-offset:4px}\n@media(max-width:1100px){\n#fwr-nichelle-noticias-slot .fwr-nichelle-news__layout{grid-template-columns:minmax(0,1fr)}\n#fwr-nichelle-noticias-slot .fwr-nichelle-news__featured{aspect-ratio:1.75}\n#fwr-nichelle-noticias-slot .fwr-nichelle-news__sidebar{grid-template-columns:repeat(2,minmax(0,1fr));grid-auto-rows:auto}\n#fwr-nichelle-noticias-slot .fwr-nichelle-news__item{grid-template-columns:minmax(0,43%) minmax(0,1fr)}\n#fwr-nichelle-noticias-slot .fwr-nichelle-news__thumb{aspect-ratio:.98}\n#fwr-nichelle-noticias-slot .fwr-nichelle-news__info{padding:2px 0}\n}\n@media(max-width:700px){\n#fwr-nichelle-noticias-slot .fwr-nichelle-news{padding:28px 0}\n#fwr-nichelle-noticias-slot .fwr-nichelle-news__inner{padding-inline:16px}\n#fwr-nichelle-noticias-slot .fwr-nichelle-news__heading{font-size:19px;margin-bottom:20px}\n#fwr-nichelle-noticias-slot .fwr-nichelle-news__featured{aspect-ratio:auto;height:clamp(350px,110vw,480px)}\n#fwr-nichelle-noticias-slot .fwr-nichelle-news__featured-content{padding:20px;gap:14px}\n#fwr-nichelle-noticias-slot .fwr-nichelle-news__featured-title{font-size:16px}\n#fwr-nichelle-noticias-slot .fwr-nichelle-news__featured-summary{font-size:12px;-webkit-line-clamp:2}\n#fwr-nichelle-noticias-slot .fwr-nichelle-news__sidebar{grid-template-columns:minmax(0,1fr);gap:20px}\n#fwr-nichelle-noticias-slot .fwr-nichelle-news__item{grid-template-columns:minmax(0,42%) minmax(0,1fr);gap:13px}\n#fwr-nichelle-noticias-slot .fwr-nichelle-news__thumb{aspect-ratio:1.14;border-radius:13px}\n#fwr-nichelle-noticias-slot .fwr-nichelle-news__item-title{font-size:13px}\n#fwr-nichelle-noticias-slot .fwr-nichelle-news__summary{font-size:12px;-webkit-line-clamp:2}\n#fwr-nichelle-noticias-slot .fwr-nichelle-news__meta{font-size:11px}\n}\n@media(max-width:360px){\n#fwr-nichelle-noticias-slot .fwr-nichelle-news__item{grid-template-columns:minmax(0,40%) minmax(0,1fr);gap:10px}\n#fwr-nichelle-noticias-slot .fwr-nichelle-news__item-title{font-size:12px}\n#fwr-nichelle-noticias-slot .fwr-nichelle-news__summary{font-size:11px}\n#fwr-nichelle-noticias-slot .fwr-nichelle-news__item .fwr-nichelle-news__meta{font-size:10px;gap:5px}\n}";
      (document.head || document.documentElement).appendChild(style);
    }
    function element(name, className, text) {
      const el = document.createElement(name);
      if (className) el.className = className;
      if (typeof text === "string") el.textContent = text;
      return el;
    }
    function photo(item, featured) {
      const img = element("img", "fwr-nichelle-news__image");
      img.src = item.foto;
      img.alt = item.titulo;
      img.loading = "lazy";
      img.decoding = "async";
      img.width = featured ? 1200 : 700;
      img.height = featured ? 810 : 500;
      return img;
    }
    function metadata(item) {
      const meta = element("div", "fwr-nichelle-news__meta");
      const published = element("time", "", "Publicado em " + item.data);
      if (item.iso) published.dateTime = item.iso;
      const read = element("span", "fwr-nichelle-news__read", "Ler mais");
      meta.append(published, read);
      return meta;
    }
    const section = element("section", "fwr-nichelle-news");
    section.setAttribute("aria-label", "Conteúdos para você");
    const inner = element("div", "fwr-nichelle-news__inner");
    const heading = element("h2", "fwr-nichelle-news__heading");
    heading.append(document.createTextNode("Conteúdos "), element("strong", "", "para você"));
    const layout = element("div", "fwr-nichelle-news__layout");
    layout.dataset.count = String(items.length);

    const featured = items[0];
    const hero = element("a", "fwr-nichelle-news__featured");
    hero.href = featured.link;
    hero.appendChild(photo(featured, true));
    const copy = element("div", "fwr-nichelle-news__featured-content");
    copy.append(element("h3", "fwr-nichelle-news__featured-title", featured.titulo),
      element("p", "fwr-nichelle-news__featured-summary", featured.resumo),
      metadata(featured));
    hero.appendChild(copy);
    layout.appendChild(hero);

    if (items.length > 1) {
      const side = element("div", "fwr-nichelle-news__sidebar");
      items.slice(1).forEach(function (item) {
        const card = element("a", "fwr-nichelle-news__item");
        card.href = item.link;
        const thumb = element("span", "fwr-nichelle-news__thumb");
        thumb.appendChild(photo(item, false));
        const detail = element("div", "fwr-nichelle-news__info");
        detail.append(element("h3", "fwr-nichelle-news__item-title", item.titulo),
          element("p", "fwr-nichelle-news__summary", item.resumo),
          metadata(item));
        card.append(thumb, detail);
        side.appendChild(card);
      });
      layout.appendChild(side);
    }
    inner.append(heading, layout);
    section.appendChild(inner);
    slot.replaceChildren(section);
    slot.dataset.fwrInitialized = "1";
    slot.dataset.fwrActive = "1";
    slot.style.minHeight = "";
  }

  function start() {
    // The LI footer can be global. Do not request public settings on pages
    // where the merchant has not placed the FWR-owned gallery slot.
    if (document.getElementById("fwr-nichelle-video-slot")) {
      loadPublishedGallery().then(function (gallery) { initVideoGallery(gallery); });
    }
    if (isOfficialStoreHost()) return;
    // The official storefront only enables the confirmed FWR gallery. Legacy
    // banner/news modules remain available to previews but cannot rewrite LI UI.
    initBannerVitrine();
    initNoticias();
    /* Adicionar futuras funções exclusivas aqui, sem recriar recursos nativos da LI. */
  }
  // Diagnóstico sob demanda: window.FWRNichelle.diagnosticoBanners()
  // Não varre o DOM nem altera banners durante a navegação normal.
  window.FWRNichelle = window.FWRNichelle || {};
  window.FWRNichelle.diagnosticoBanners = function () {
    const cfg = window.FWRNichelle.bannerVitrine || {};
    const slot = document.getElementById("fwr-nichelle-vitrine-slot");
    const images = Array.from(document.querySelectorAll("img"));
    const norm = function (value) {
      return String(value || "").normalize("NFD").replace(/[\u0300-\u036f]/g, "")
        .replace(/\s+/g, " ").trim().toLowerCase();
    };
    const names = Array.isArray(cfg.nomes) ? cfg.nomes.slice(0, 4) : [];
    return {
      pagina: window.location.pathname,
      ativo: cfg.ativo === true,
      origem: ["lateral", "mini", "categoria"].includes(cfg.origem) ? cfg.origem : "vitrine",
      nomesUnicos: new Set((Array.isArray(cfg.nomes) ? cfg.nomes : []).map(norm)).size,
      fonteAlternativa: cfg.fonteAlternativa || "",
      imagensDiretasConfiguradas: Array.isArray(cfg.imagens) ? cfg.imagens.filter(function (i) { return i && i.imagem; }).length : 0,
      minimo: Number.isInteger(cfg.minimo) && cfg.minimo >= 1 && cfg.minimo <= 4 ? cfg.minimo : (cfg.origem === "lateral" ? 1 : 4),
      slotEncontrado: !!slot,
      galeriaMontada: !!(slot && slot.dataset.fwrInitialized === "1"),
      possiveisBanners: images.filter(function (img) {
        const meta = [img.getAttribute("src"), img.getAttribute("alt"),
          img.getAttribute("title"), img.getAttribute("data-src")].join(" ");
        return /mini[-_ ]?pages|banner[-_ ]?lateral|vitrine[-_ ]?mini/i.test(meta);
      }).slice(0, 12).map(function (img) {
        return { alt: img.getAttribute("alt") || "",
          src: (img.getAttribute("src") || img.getAttribute("data-src") || "").slice(0, 250) };
      }),
      banners: names.map(function (name) {
        const normalized = norm(name);
        return { nome: name, imagemNoDOM: images.some(function (img) {
          const src = img.getAttribute("src") || img.getAttribute("data-src") || "";
          const file = norm(src.split(/[?#]/)[0].split("/").pop()).replace(/\.[a-z0-9]{2,5}$/i, "");
          return norm(img.getAttribute("alt") || img.getAttribute("title")) === normalized ||
            file === normalized || file.startsWith(normalized + "-") || file.startsWith(normalized + "_");
        }) };
      })
    };
  };

  if (!isOfficialStoreHost()) {
    document.addEventListener("fwr:nichelle:banner-config", initBannerVitrine);
    document.addEventListener("fwr:nichelle:news-config", initNoticias);
  }
  if (document.readyState === "loading") document.addEventListener("DOMContentLoaded", start, {once:true});
  else start();
})();


/* Isolamento visual exclusivo da home em preview */
/*
 * Nichelle 2026 — isolamento visual do tema ativo na home de homologação.
 * Não desinstala o tema. Reaproveita DOM, links e dados reais da Loja Integrada.
 * Apenas ?nichelle_preview=1, com Nichelle27Settings.geral.modoPreview=true.
 */
(function () {
  "use strict";
  if (!/^(www\.)?nichelleimports\.com\.br$/i.test(location.hostname) ||
      new URLSearchParams(location.search).get("nichelle_preview") !== "1" ||
      location.pathname.replace(/\/+$/, "") !== "") return;

  function active() {
    const s = window.Nichelle27Settings;
    return !!(s && s.geral && s.geral.ativo === true &&
      s.geral.modoPreview === true && s.geral.publicarNaLoja !== true);
  }
  function direct(parent, selector) {
    if (!parent) return null;
    return Array.from(parent.children).find(function (n) { return n.matches(selector); }) || null;
  }
  function isolate() {
    if (!active() || !document.body ||
        !document.body.classList.contains("pagina-inicial")) return;
    const corpo = document.getElementById("corpo");
    if (!corpo) return;

    let stage = document.getElementById("n27-preview-stage");
    if (!stage) {
      stage = document.createElement("div");
      stage.id = "n27-preview-stage";
      stage.setAttribute("aria-label", "Layout Nichelle Imports 2026 em homologação");
      corpo.insertBefore(stage, corpo.firstChild);
    }

    // O tema deixa a vitrine Mais vendidos sem seus produtos e move um UL
    // com 20 cards para #corpo, gerando uma lacuna de milhares de pixels.
    const best = direct(corpo, ".vitrine-produtos.vitrine-mas-vendido") ||
      direct(stage, ".vitrine-produtos.vitrine-mas-vendido");
    const orphan = direct(corpo, "ul[data-produtos-linha]");
    if (best && orphan && !best.contains(orphan)) {
      const row = best.querySelector(".conteiner .row-fluid") || best;
      let holder = best.querySelector(".n27-best-products");
      if (!holder) {
        holder = document.createElement("div");
        holder.className = "n27-best-products";
        row.appendChild(holder);
      }
      orphan.classList.add("n27-best-products__track");
      holder.appendChild(orphan);
    }

    // Move nós já existentes, sem clonagem; eventos, preços e URLs nativos
    // são preservados. A loja normal sem o parâmetro permanece intocada.
    [
      ".secao-banners",
      ".vitrine-produtos.vitrine-mas-vendido",
      "#n27-layout-root",
      ".vitrine-produtos.vitrine-lancamento",
      ".vitrine-marcas",
      ".vitrine-video",
      ".vitrine-produtos.vitrine-destaque",
      ".vitrine-produtos.vitrine-18709305"
    ].forEach(function (selector) {
      const node = direct(corpo, selector) || direct(stage, selector);
      if (node && node.parentNode === corpo) stage.appendChild(node);
    });

    if (!stage.children.length) return;

    // Slick é o controlador dos trilhos Groom. Na prévia, o substituímos
    // por overflow/scroll-snap com os mesmos cards e links de produtos.
    Array.from(stage.children).filter(function (node) {
      return node.classList.contains("vitrine-produtos");
    }).forEach(function (shelf) {
      const rail = shelf.querySelector("ul[data-produtos-linha]");
      if (!rail) return;
      if (rail.classList.contains("slick-initialized") &&
          window.jQuery && window.jQuery.fn && window.jQuery.fn.slick) {
        try { window.jQuery(rail).slick("unslick"); }
        catch (_) { return; }
      }
      if (rail.querySelector(".slick-list")) return;
      rail.classList.add("n27-native-products-rail");
    });

    // Atributo só é criado após a reorganização estar pronta. O CSS externo
    // faz o override do visual e não bloqueia endpoints ou funções da LI.
    document.documentElement.dataset.n27Isolated = "1";
  }

  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", isolate, { once: true });
  } else isolate();
  window.addEventListener("load", isolate, { once: true });
  [250, 800, 1800, 3600].forEach(function (ms) {
    window.setTimeout(isolate, ms);
  });
  document.addEventListener("nichelle27:refresh", isolate);
})();


/* Reconstrução da home a partir da arte aprovada */
/*
 * Nichelle Imports 2026 - Home homologada, base no mockup FWR de 20/10/2026.
 * Somente prévia, sem substituir recursos de comércio nativos da Loja Integrada.
 */
(function () {
  "use strict";
  const HOST = "https://nichelle-2026-git-develop-fwragenciadigitals-projects.vercel.app";
  const CDN = "https://cdn.awsli.com.br/2550/2550587/arquivos/";
  if (!/^(www\.)?nichelleimports\.com\.br$/.test(location.hostname) ||
      location.pathname.replace(/\/+$/, "") !== "" ||
      new URLSearchParams(location.search).get("nichelle_preview") !== "1") return;
  function allowed() {
    const s = window.Nichelle27Settings;
    return !!(s && s.geral && s.geral.ativo === true &&
      s.geral.modoPreview === true && s.geral.publicarNaLoja !== true);
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


/* FULLBANNER vinculado aos banners nativos da Loja Integrada */
/* Nichelle Imports 2026 — FULLBANNER nativo v1.0
 * Usa SOMENTE banners publicados pela Loja Integrada e presentes no DOM.
 * Preserva origem (painel), imagem mobile, links e ordem. Sem placeholder.
 * Isolado da loja normal: executa apenas com ?nichelle_preview=1.
 */
(function(){
"use strict";
const path=location.pathname.replace(/\/+$/,"")||"/";
if(!/^(www\.)?nichelleimports\.com\.br$/i.test(location.hostname)||
 path!=="/"||new URLSearchParams(location.search).get("nichelle_preview")!=="1")return;
const ID="n27-approved-hero";
const ROOTS=[
 ".secao-banners .banner.cheio",
 ".secao-banners .banner.full",
 ".secao-banners .banner-full",
 ".secao-banners .banner-fullbanner",
 ".secao-banners .fullbanner",
 ".secao-banners .full-banner",
 ".secao-banners .banner-principal",
 ".secao-banners .banner-slider",
 "#banner-full",
 "#fullbanner",
 "[data-banner-posicao='fullbanner']",
 "[data-banner-position='fullbanner']",
 "[data-banner-posicao='full']",
 "[data-banner-position='full']"
].join(",");
const EXCLUDED=".mini-banner,.minibanner,.banner-tarja,.banner-lateral,.banner-vitrine,.slick-cloned,.owl-item.cloned,.swiper-slide-duplicate,[data-n27-full-clone]";
const MAX=12;
let signature="",observer=null,queued=false,rotateTimer=null,slideIndex=0,eventsController=null;
function allowed(){
 const g=window.Nichelle27Settings?.geral;
 return !!(g&&g.ativo===true&&g.modoPreview===true&&g.publicarNaLoja!==true);
}
function config(){
 const s=window.Nichelle27Settings?.fullBanners||window.Nichelle27Settings?.fullBanner||{};
 return{
  ativo:s.ativo!==false,
  autoplay:s.autoplay!==false,
  intervalo:Math.min(20000,Math.max(4000,Number(s.intervalo)||6500)),
  limite:Math.min(MAX,Math.max(1,Number(s.limite)||MAX))
 };
}
function safeUrl(raw){
 if(typeof raw!=="string"||!raw.trim()||raw.trim()==="#")return "";
 try{
  const u=new URL(raw.trim(),location.href);
  return ["https:","http:"].includes(u.protocol)&&!u.username&&!u.password?u.href:"";
 }catch(_){return "";}
}
function sourceUrl(raw){
 if(!raw||typeof raw!=="string")return "";
 const first=raw.trim().split(",")[0].trim().split(/\s+/)[0];
 const url=safeUrl(first);
 return url&&url.startsWith("https://")&&!/\b(?:blank|placeholder)\.(?:gif|png)|data:image/i.test(url)?url:"";
}
function imageUrl(img){
 if(!img)return "";
 const attrs=["data-src","data-lazy","data-lazy-src","data-original","data-image","src","data-srcset","srcset"];
 for(const name of attrs){
  const value=sourceUrl(img.getAttribute(name));
  if(value)return value;
 }
 return sourceUrl(img.currentSrc);
}
function getRoots(){
 const matches=[...document.querySelectorAll(ROOTS)].filter(el=>
   !el.closest("#"+ID)&&!el.matches(EXCLUDED)&&!el.closest(".n27-approved-category"));
 if(matches.length)return matches.filter((el,i)=>!matches.some((parent,j)=>
   i!==j&&parent!==el&&parent.contains(el)));
 // Alguns temas usam apenas .banner dentro de .secao-banners.
 return [...document.querySelectorAll(".secao-banners .banner")].filter(el=>
   !el.matches(EXCLUDED)&&!el.closest(".mini-banner,.minibanner,.banner-tarja,.banner-lateral,.banner-vitrine") &&
   !el.closest("#"+ID));
}
function isMobileImage(img){
 const s=(img.className&&typeof img.className==="string"?img.className:"")+" "+
   (img.getAttribute("media")||"");
 return /mobile|celular|visible-phone|only-mobile|show-phone/i.test(s);
}
function mobileImage(slide,desktop,images){
 for(const img of images){
  if(img!==desktop&&isMobileImage(img)){
   const src=imageUrl(img);if(src)return src;
  }
 }
 const picture=desktop?.closest("picture");
 if(picture){
  for(const source of picture.querySelectorAll("source[media]")){
   const media=source.getAttribute("media")||"";
   if(/max-width|max-device-width/i.test(media)){
    const url=sourceUrl(source.getAttribute("srcset")||source.getAttribute("data-srcset"));
    if(url)return url;
   }
  }
 }
 for(const attr of ["data-mobile-src","data-src-mobile","data-image-mobile","data-mobile"]){
  const src=sourceUrl(slide.getAttribute?.(attr)||desktop?.getAttribute?.(attr));
  if(src)return src;
 }
 return "";
}
function collect(){
 const result=[],seen=new Set();
 for(const root of getRoots()){
  const all=root.matches("img")?[root]:[...root.querySelectorAll("img")];
  const grouped=new Map();
  for(const img of all){
   if(img.closest(EXCLUDED)||img.closest("#"+ID))continue;
   const group=img.closest(".slides > li,.slick-slide,.swiper-slide,.owl-item,.banner-item,.banner-slide,.carousel-item,.slide");
   const key=group&&root.contains(group)?group:(img.closest("a[href]")||img);
   if(!grouped.has(key))grouped.set(key,[]);
   grouped.get(key).push(img);
  }
  for(const [node,imgs] of grouped){
   const desktop=imgs.find(img=>!isMobileImage(img)&&imageUrl(img))||imgs.find(img=>imageUrl(img));
   if(!desktop)continue;
   let src=imageUrl(desktop);if(!src)continue;
   const desktopPicture=desktop.closest("picture");
   if(desktopPicture){
     const wide=[...desktopPicture.querySelectorAll("source[media]")]
       .find(el=>/min-width|min-device-width/i.test(el.getAttribute("media")||""));
     const alternative=sourceUrl(wide?.getAttribute("srcset")||wide?.getAttribute("data-srcset"));
     if(alternative)src=alternative;
   }
   const slide=node.matches?.("img")?desktop:node;
   const a=desktop.closest("a[href]")||slide.querySelector?.("a[href]")||
     root.closest("a[href]");
   const href=a?safeUrl(a.getAttribute("href")):"";
   let mobile=mobileImage(slide,desktop,imgs);
   // Quando o <picture> usa a imagem base no mobile e um <source> desktop,
   // preservar os dois arquivos, sem forcar crop da imagem desktop no celular.
   if(desktopPicture&&src!==imageUrl(desktop)&&!mobile)mobile=imageUrl(desktop);
   const key=src+"|"+href+"|"+mobile;
   if(seen.has(key))continue;seen.add(key);
   result.push({
    src,mobile,href,blank:a?.getAttribute("target")==="_blank",
    alt:(desktop.getAttribute("alt")||a?.getAttribute("title")||
      slide.getAttribute?.("aria-label")||"Banner Nichelle Imports").trim().slice(0,160)
   });
   if(result.length>=MAX)return result;
  }
 }
 return result;
}
function el(tag,cls,txt){
 const x=document.createElement(tag);
 if(cls)x.className=cls;
 if(txt!==undefined)x.textContent=txt;
 return x;
}
function clearRotation(){
 if(rotateTimer){clearInterval(rotateTimer);rotateTimer=null;}
}
function setActive(hero,index){
 const slides=[...hero.querySelectorAll(".n27-full__slide")];
 const dots=[...hero.querySelectorAll(".n27-full__dot")];
 if(!slides.length)return;
 slideIndex=(index+slides.length)%slides.length;
 slides.forEach((s,i)=>{
  const active=i===slideIndex;
  s.hidden=!active;
  s.setAttribute("aria-hidden",active?"false":"true");
  s.setAttribute("tabindex",active?"0":"-1");
 });
 dots.forEach((d,i)=>{
  d.setAttribute("aria-current",i===slideIndex?"true":"false");
  d.setAttribute("aria-label","Exibir banner "+(i+1)+" de "+slides.length);
 });
}
function render(){
 if(!allowed())return;
 const stage=document.getElementById("n27-preview-stage");
 const hero=document.getElementById(ID);
 if(!stage||!hero||hero.parentElement!==stage)return;
 const cfg=config(),banners=cfg.ativo?collect().slice(0,cfg.limite):[];
 const key=JSON.stringify([cfg,banners]);
 if(signature===key&&hero.dataset.n27FullReady==="1")return;
 signature=key;
 clearRotation();
 eventsController?.abort();
 eventsController=new AbortController();
 document.querySelectorAll('[data-n27-native-full-source="1"]').forEach(el=>{
   delete el.dataset.n27NativeFullSource;
 });
 if(!banners.length){
  hero.replaceChildren();
  hero.hidden=true;hero.dataset.n27FullReady="0";
  document.documentElement.dataset.n27NativeFullbanner="0";
  return;
 }
 // Identifica a origem exata no DOM para omitir somente o FULLBANNER
 // nativo quando a nova vitrine ja estiver pronta para exibir.
 getRoots().forEach(el=>{el.dataset.n27NativeFullSource="1";});
 const track=el("div","n27-full__track");
 track.setAttribute("aria-label","Banners de destaque da Nichelle Imports");
 const multiple=banners.length>1;
 const first=slideIndex<banners.length?slideIndex:0;
 banners.forEach((banner,i)=>{
  const node=el(banner.href?"a":"div","n27-full__slide");
  if(banner.href){
   node.href=banner.href;
   if(banner.blank){node.target="_blank";node.rel="noopener noreferrer";}
  }
  const picture=document.createElement("picture");
  if(banner.mobile){
   const src=document.createElement("source");
   src.media="(max-width: 767px)";
   src.srcset=banner.mobile;
   picture.append(src);
  }
  const image=el("img","n27-full__image");
  image.src=banner.src;
  image.alt=banner.alt;
  image.width=1920;image.height=600;
  image.loading=i===0?"eager":"lazy";
  image.decoding="async";
  if(i===0)image.fetchPriority="high";
  picture.append(image);node.append(picture);track.append(node);
 });
 hero.replaceChildren(track);
 if(multiple){
  const controls=el("div","n27-full__controls");
  const previous=el("button","n27-full__arrow n27-full__arrow--previous","‹");
  const next=el("button","n27-full__arrow n27-full__arrow--next","›");
  previous.type="button";next.type="button";
  previous.setAttribute("aria-label","Banner anterior");
  next.setAttribute("aria-label","Próximo banner");
  previous.addEventListener("click",()=>{setActive(hero,slideIndex-1);startRotation();});
  next.addEventListener("click",()=>{setActive(hero,slideIndex+1);startRotation();});
  const dots=el("div","n27-full__dots");
  banners.forEach((_,i)=>{
   const dot=el("button","n27-full__dot");
   dot.type="button";dot.addEventListener("click",()=>{setActive(hero,i);startRotation();});
   dots.append(dot);
  });
  controls.append(previous,dots,next);hero.append(controls);
  const options={signal:eventsController.signal};
  hero.addEventListener("mouseenter",clearRotation,options);
  hero.addEventListener("mouseleave",startRotation,options);
  hero.addEventListener("focusin",clearRotation,options);
  hero.addEventListener("focusout",startRotation,options);
  let startX=0;
  hero.addEventListener("touchstart",ev=>{
   startX=ev.touches?.[0]?.clientX||0;
  },{passive:true,signal:eventsController.signal});
  hero.addEventListener("touchend",ev=>{
   const endX=ev.changedTouches?.[0]?.clientX||0;
   if(Math.abs(startX-endX)>40){setActive(hero,slideIndex+(endX<startX?1:-1));startRotation();}
  },{passive:true,signal:eventsController.signal});
 }
 hero.hidden=false;hero.dataset.n27FullReady="1";
 document.documentElement.dataset.n27NativeFullbanner="1";
 setActive(hero,first);
 startRotation();
 function startRotation(){
  clearRotation();
  if(!multiple||!cfg.autoplay||document.hidden||
    window.matchMedia?.("(prefers-reduced-motion: reduce)")?.matches||
    hero.matches?.(":hover")||hero.contains(document.activeElement))return;
  rotateTimer=setInterval(()=>{if(hero.isConnected)setActive(hero,slideIndex+1);else clearRotation();},cfg.intervalo);
 }
}
function schedule(){
 if(queued)return;queued=true;
 requestAnimationFrame(()=>{queued=false;render();});
}
function watch(){
 if(observer||!document.body||!window.MutationObserver)return;
 observer=new MutationObserver(records=>{
  if(records.some(r=>{
   const t=r.target.nodeType===1?r.target:r.target.parentElement;
   return t?.closest?.(".secao-banners,#banner-full,#fullbanner,[data-banner-position='fullbanner']") ||
    [...r.addedNodes].some(n=>n.nodeType===1&&
     (n.matches?.(ROOTS)||n.querySelector?.(ROOTS)));
  }))schedule();
 });
 observer.observe(document.body,{subtree:true,childList:true,
  attributes:true,attributeFilter:["src","srcset","data-src","data-original","href"]});
}
function init(){render();watch();}
if(document.readyState==="loading")document.addEventListener("DOMContentLoaded",init,{once:true});
else init();
window.addEventListener("load",schedule,{once:true});
document.addEventListener("visibilitychange",()=>{if(document.hidden)clearRotation();else schedule();});
[250,900,1800,3300,5500].forEach(t=>setTimeout(schedule,t));
["nichelle27:refresh","nichelle27:full-banners:update","nichelle27:home:reordered"]
 .forEach(name=>document.addEventListener(name,schedule));
window.NichelleFullBanners={version:"1.0.0",refresh:schedule,source:"Loja Integrada FULLBANNER"};
})();


/* Catálogo nativo de categorias */
window.N27CategoryCatalog = {"schemaVersion":1,"source":"Loja Integrada: categorias e subcategorias publicadas no menu da loja em 2026-11-16","generatedAt":"2026-11-16","categories":[{"id":"categoria-id-18709305","name":"Marcas","url":"/marcas","children":[{"id":"categoria-id-24392775","name":"Abib","url":"/abib"},{"id":"categoria-id-21930994","name":"AHC","url":"/ahc"},{"id":"categoria-id-23904059","name":"Anua","url":"/anua"},{"id":"categoria-id-24418516","name":"Axis-Y","url":"/axis-y"},{"id":"categoria-id-23128956","name":"Banila CO","url":"/banila-co"},{"id":"categoria-id-23077992","name":"Bath & Body Works","url":"/bath-body-works"},{"id":"categoria-id-23127900","name":"Beauty of Joseon","url":"/beauty-of-joseon"},{"id":"categoria-id-23882249","name":"Celimax","url":"/celimax"},{"id":"categoria-id-24069906","name":"CKD","url":"/ckd"},{"id":"categoria-id-23009672","name":"Cosrx","url":"/cosrx"},{"id":"categoria-id-24392780","name":"Dr. Althea","url":"/dr-althea"},{"id":"categoria-id-24443121","name":"Dr.G","url":"/drg"},{"id":"categoria-id-24392776","name":"Dr. Reju-All","url":"/dr-reju-all"},{"id":"categoria-id-23118511","name":"Elizavecca","url":"/elizavecca"},{"id":"categoria-id-23009814","name":"Etude","url":"/etude"},{"id":"categoria-id-24159456","name":"HEVEBLUE","url":"/heveblue"},{"id":"categoria-id-24455571","name":"Illiyoon","url":"/illiyoon"},{"id":"categoria-id-23223155","name":"JBSara","url":"/jbsara"},{"id":"categoria-id-24158364","name":"KOEC","url":"/koec"},{"id":"categoria-id-24451294","name":"K-Secret","url":"/k-secret"},{"id":"categoria-id-23751767","name":"Laneige","url":"/laneige"},{"id":"categoria-id-24392781","name":"Lilyeve","url":"/lilyeve"},{"id":"categoria-id-23129533","name":"Luna","url":"/luna"},{"id":"categoria-id-23245260","name":"Medicube","url":"/medicube"},{"id":"categoria-id-23127672","name":"Mise en Scène","url":"/mise-en-scene"},{"id":"categoria-id-18930682","name":"Missha","url":"/missha"},{"id":"categoria-id-24145581","name":"Mixsoon","url":"/mixsoon"},{"id":"categoria-id-24158471","name":"MUMCHIT","url":"/mumchit"},{"id":"categoria-id-24388516","name":"Numbuzin","url":"/numbuzin"},{"id":"categoria-id-24416355","name":"Purito","url":"/purito"},{"id":"categoria-id-24343968","name":"Pyunkang Yul","url":"/pyunkang-yul"},{"id":"categoria-id-24392779","name":"Rejuran","url":"/rejuran"},{"id":"categoria-id-24392777","name":"Round Lab","url":"/round-lab"},{"id":"categoria-id-23882248","name":"Senka","url":"/senka"},{"id":"categoria-id-23245257","name":"Shiseido","url":"/shiseido"},{"id":"categoria-id-23245259","name":"SKIN1004","url":"/skin1004"},{"id":"categoria-id-22962493","name":"Some By Mi","url":"/some-by-mi"},{"id":"categoria-id-23714983","name":"Tirtir","url":"/tirtir"},{"id":"categoria-id-24443075","name":"Tocobo","url":"/tocobo"},{"id":"categoria-id-22854288","name":"Tree Hut","url":"/tree-hut"},{"id":"categoria-id-20453444","name":"Victoria's Secret","url":"/victorias-secret"},{"id":"categoria-id-24005467","name":"VT Cosmetics","url":"/vt-cosmetics"},{"id":"categoria-id-23640798","name":"Yepre","url":"/yepre"}]},{"id":"categoria-id-23118505","name":"Makes","url":"/makes","children":[{"id":"categoria-id-24485544","name":"Lábios","url":"/labios"},{"id":"categoria-id-24485545","name":"Olhos","url":"/maquiagem-olhos"},{"id":"categoria-id-24485543","name":"Rosto","url":"/maquiagem-rosto"}]},{"id":"categoria-id-24485532","name":"Cabelos","url":"/cabelos","children":[]},{"id":"categoria-id-23903402","name":"Skincare","url":"/skincare","children":[{"id":"categoria-id-24485534","name":"Hidratante","url":"/hidratante-facial"},{"id":"categoria-id-24485538","name":"Kits","url":"/kits-de-skincare"},{"id":"categoria-id-24485536","name":"Limpeza","url":"/limpeza-facial"},{"id":"categoria-id-24485539","name":"Máscaras","url":"/mascaras-faciais"},{"id":"categoria-id-24485537","name":"Olhos","url":"/area-dos-olhos"},{"id":"categoria-id-24485535","name":"Protetor Solar","url":"/protetor-solar"},{"id":"categoria-id-24485533","name":"Sérum","url":"/serum"},{"id":"categoria-id-24485528","name":"Tônico","url":"/tonico"}]},{"id":"categoria-id-18930654","name":"Perfumaria","url":"/perfumaria","children":[]},{"id":"categoria-id-24485531","name":"Corpo & Banho","url":"/corpo-banho","children":[{"id":"categoria-id-24485540","name":"Body Splash","url":"/body-splash"},{"id":"categoria-id-24485541","name":"Hidratante Corporal","url":"/hidratante-corporal"},{"id":"categoria-id-24485542","name":"Sabonete & Esfoliante","url":"/sabonete-e-esfoliante"}]},{"id":"categoria-id-24488857","name":"Mais vendidos","url":"/mais-vendidos","children":[]}]};


/* nichelle-header.js */
/*
 * Nichelle FWR | Cabeçalho independente v1.0
 * Own HTML/CSS/events. Loja Integrada remains owner of /buscar, /conta,
 * /carrinho and registered category URLs; no Groom UI is reused.
 */
(function () {
  "use strict";
  const path = location.pathname.replace(/\/+$/, "") || "/";
  if (!/^(www\.)?nichelleimports\.com\.br$/i.test(location.hostname) ||
      /^\/(?:checkout|finalizar-pedido)(?:\/|$)/i.test(path) ||
      new URLSearchParams(location.search).get("nichelle_preview") !== "1") return;

  function allowed() {
    const s = window.Nichelle27Settings;
    return !!(s && s.geral?.ativo === true && s.geral?.modoPreview === true &&
      s.geral?.publicarNaLoja !== true);
  }
  function el(tag, cls, text) {
    const n = document.createElement(tag);
    if (cls) n.className = cls;
    if (text !== undefined) n.textContent = text;
    return n;
  }
  // Iconografia oficial publicada na CDN da Loja Integrada.
  // Ordem conforme a navegacao aprovada: Mais Vendidos, Skincare,
  // Tipos de Pele, Necessidades da Pele, Cuidados Pessoais, Kits e Marcas.
  const ICON_CDN = "https://cdn.awsli.com.br/2550/2550587/arquivos/";
  const ICON_ASSETS = Object.freeze({
    star: ICON_CDN + "icon_03.png",
    skincare: ICON_CDN + "icon_05.png",
    type: ICON_CDN + "icon_07.png",
    needs: ICON_CDN + "icon_09.png",
    heart: ICON_CDN + "icon_11.png",
    kits: ICON_CDN + "icon_13.png",
    brands: ICON_CDN + "icon_15.png",
    account: ICON_CDN + "userrr.svg",
    support: ICON_CDN + "chattt.svg",
    cart: ICON_CDN + "carttt.svg"
  });
  // Mantem as mesmas chamadas SVG existentes sem alterar links, eventos
  // dos dropdowns, acessibilidade, drawer mobile ou contador de carrinho.
  // Fallback para o SVG antigo se algum arquivo CDN nao carregar.
  function svg(name, cls) {
    const url = ICON_ASSETS[name];
    if (url) {
      const image = document.createElement("img");
      image.className = (cls ? cls + " " : "") +
        "n27-owned-icon n27-owned-icon--" + name;
      image.src = url;
      image.alt = "";
      image.setAttribute("aria-hidden", "true");
      image.width = 24;
      image.height = 24;
      image.loading = "eager";
      image.decoding = "async";
      image.addEventListener("error", function () {
        image.replaceWith(inlineSvg(name, cls));
      }, { once: true });
      return image;
    }
    return inlineSvg(name, cls);
  }
  function inlineSvg(name, cls) {
    const paths = {
      safe:'<path d="M7 10V7a5 5 0 0 1 10 0v3"/><rect x="5" y="10" width="14" height="11" rx="2"/><path d="M12 14v3"/>',
      truck:'<path d="M3 6h11v11H3zM14 10h4l3 4v3h-7M5 17a2 2 0 1 0 4 0M16 17a2 2 0 1 0 4 0"/>',
      card:'<rect x="2" y="5" width="20" height="14" rx="2"/><path d="M2 10h20M6 15h5"/>',
      exchange:'<path d="M4 7h15l-4-4M19 7l-4 4M20 17H5l4 4M5 17l4-4"/>',
      star:'<path d="m12 2 3.1 6.3 7 .9-5 4.9 1.2 7L12 17.8l-6.3 3.3 1.2-7-5-4.9 7-.9Z" fill="currentColor" stroke="none"/>',
      skincare:'<path d="M12 2c5.2 0 8.5 4 8.5 9.5 0 5.6-4 10.5-8.5 10.5S3.5 17.1 3.5 11.5C3.5 6 6.8 2 12 2Z" fill="currentColor" stroke="none"/><circle cx="9" cy="11" r="1.2" fill="#8000a5"/><circle cx="15" cy="11" r="1.2" fill="#8000a5"/><path d="M9 16c1.6 1.4 4.4 1.4 6 0" stroke="#8000a5"/>',
      type:'<path d="M3 14 14 3a2.3 2.3 0 0 1 3.3 0l3.7 3.7a2.3 2.3 0 0 1 0 3.3L10 21a3 3 0 0 1-4.2 0L3 18.2A3 3 0 0 1 3 14Z"/><path d="m12 5 7 7M6 17l4 4"/>',
      needs:'<path d="m5 19 13-13 2 2L7 21H5Z"/><path d="M18 2v3M22 6h-3M17 11l-2-2M4 6V3M2 5h4"/>',
      heart:'<path d="M20.8 5.4a5.3 5.3 0 0 0-7.5 0L12 6.7l-1.3-1.3a5.3 5.3 0 0 0-7.5 7.5L12 21l8.8-8.1a5.3 5.3 0 0 0 0-7.5Z" fill="currentColor" stroke="none"/>',
      kits:'<rect x="3" y="9" width="7" height="12" rx="1"/><path d="M5 9V6h3v3M6.5 3v3"/><rect x="13" y="6" width="8" height="15" rx="1"/><path d="M15 6V3h4v3M15 13h4M5 15h3"/>',
      brands:'<rect x="3" y="3" width="8" height="8" rx="1" fill="currentColor" stroke="none"/><rect x="13" y="3" width="8" height="8" rx="1" fill="currentColor" stroke="none"/><rect x="3" y="13" width="8" height="8" rx="1" fill="currentColor" stroke="none"/><rect x="13" y="13" width="8" height="8" rx="1" fill="currentColor" stroke="none"/>',
      search:'<circle cx="10.8" cy="10.8" r="7"/><path d="m16 16 5 5"/>',
      account:'<circle cx="12" cy="8" r="4"/><path d="M4 21c0-4 3.5-7 8-7s8 3 8 7"/>',
      support:'<path d="M4 4h13a3 3 0 0 1 3 3v8a3 3 0 0 1-3 3H9l-5 3v-3a3 3 0 0 1-2-3V7a3 3 0 0 1 2-3z"/><path d="M7 9h10M7 13h7"/>',
      cart:'<path d="M3 7h18l-1.6 14H4.6L3 7Z"/><path d="M8 8V6a4 4 0 0 1 8 0v2"/>',
      menu:'<path d="M4 6h16M4 12h16M4 18h16"/>',
      close:'<path d="M5 5l14 14M19 5 5 19"/>',
      chevron:'<path d="m6 9 6 6 6-6"/>',
      phone:'<path d="M8 3H5a2 2 0 0 0-2 2c0 9 7 16 16 16a2 2 0 0 0 2-2v-3l-5-2-2 3a13 13 0 0 1-7-7l3-2-2-5Z"/>',
      mail:'<rect x="2" y="5" width="20" height="14" rx="3"/><path d="m3 7 9 7 9-7"/>',
      contact:'<rect x="4" y="3" width="16" height="18" rx="2"/><path d="M8 8h8M8 12h8M8 16h5"/>',
      login:'<path d="M10 4H5v16h5M13 7l5 5-5 5M7 12h11"/>',
      orders:'<path d="M7 3h10v18H7V3Zm3 5h4m-4 4h4m-4 4h3"/>',
      favorites:'<path d="M20.8 5.4a5.3 5.3 0 0 0-7.5 0L12 6.7l-1.3-1.3a5.3 5.3 0 0 0-7.5 7.5L12 21l8.8-8.1a5.3 5.3 0 0 0 0-7.5Z"/>',
      grid:'<rect x="3" y="3" width="7" height="7" rx="2"/><rect x="14" y="3" width="7" height="7" rx="2"/><rect x="3" y="14" width="7" height="7" rx="2"/><rect x="14" y="14" width="7" height="7" rx="2"/>',
      home:'<path d="m3 11 9-8 9 8v10h-7v-7h-4v7H3V11Z"/>',
      sparkle:'<path d="m12 2 2.2 7.8L22 12l-7.8 2.2L12 22l-2.2-7.8L2 12l7.8-2.2L12 2Z"/>',
      whatsapp:'<path d="M20 11.5a8.5 8.5 0 0 1-12.3 7.6L3 21l1.9-4.7A8.5 8.5 0 1 1 20 11.5Z"/><path d="M9 8c.4 2.6 2.4 4.7 5 5.3l1.1-1.2 2 1.1c-.2 1.8-1.1 2.5-2.5 2.3-4-.6-7.1-3.8-7.7-7.6-.2-1.2.6-2.3 1.6-2.3h.5l1.1 2-1.1 1.4"/>'

    };
    const s = document.createElementNS("http://www.w3.org/2000/svg", "svg");
    s.setAttribute("viewBox", "0 0 24 24");
    s.setAttribute("aria-hidden", "true");
    s.setAttribute("fill", "none");
    s.setAttribute("stroke", "currentColor");
    s.setAttribute("stroke-width", "1.8");
    s.setAttribute("stroke-linecap", "round");
    s.setAttribute("stroke-linejoin", "round");
    if (cls) s.setAttribute("class", cls);
    s.innerHTML = paths[name] || paths.star;
    return s;
  }
  function safeInternal(raw) {
    if (!raw || typeof raw !== "string") return "";
    try {
      const u = new URL(raw, location.origin);
      return u.origin === location.origin && /^https?:$/.test(u.protocol) ?
        u.pathname + u.search + u.hash : "";
    } catch (_) { return ""; }
  }
  function searchURL(text) { return "/buscar?" + new URLSearchParams({q:text}); }
  const normalize = s => String(s || "").toLowerCase().normalize("NFD").replace(/[\u0300-\u036f]/g,"").trim();
  function menuData() {
    const registered = Array.isArray(window.N27CategoryCatalog?.categories) ?
      window.N27CategoryCatalog.categories : [];
    const top = label => registered.find(c => normalize(c.name) === normalize(label));
    const child = label => registered.flatMap(c=>Array.isArray(c.children)?c.children:[])
      .find(c => normalize(c.name) === normalize(label));
    const items = [
      {label:"Mais Vendidos",icon:"star",source:top("Mais vendidos"),fallback:"/mais-vendidos"},
      {label:"Skincare",icon:"skincare",source:top("Skincare"),fallback:"/skincare"},
      {label:"Tipos de Pele",icon:"type",source:top("Tipos de Pele"),fallback:searchURL("Tipos de Pele")},
      {label:"Necessidades da Pele",icon:"needs",source:top("Necessidades da Pele"),fallback:searchURL("Necessidades da Pele")},
      {label:"Cuidados Pessoais",icon:"heart",source:top("Corpo & Banho"),fallback:"/corpo-banho"},
      {label:"Kits",icon:"kits",source:top("Kits") || child("Kits"),fallback:"/kits-de-skincare"},
      {label:"Marcas",icon:"brands",source:top("Marcas"),fallback:"/marcas"}
    ];
    return items.map((item,index)=>{
      const link=safeInternal(item.source?.url) || item.fallback;
      const children=(Array.isArray(item.source?.children)?item.source.children:[])
        .map(sub=>({name:sub.name,url:safeInternal(sub.url)}))
        .filter(sub=>sub.name&&sub.url);
      return {...item,key:String(index),url:link,children};
    });
  }
  function buildMarquee() {
    const bar=el("div","n27-owned-benefits");
    bar.id="n27-head-benefits";
    bar.setAttribute("aria-label","Benefícios da loja");
    const track=el("div","n27-owned-benefits__track n27-head-benefits__track");
    const data=[
      ["safe","LOJA 100% SEGURA","COM PROTEÇÃO DE CERTIFICADO SSL"],
      ["truck","ENTREGA GARANTIDA","PARA TODO O BRASIL"],
      ["card","PARCELE SUAS COMPRAS","EM ATÉ 10X NO CARTÃO"],
      ["exchange","TROCA FÁCIL","EM ATÉ 7 DIAS APÓS O RECEBIMENTO"]
    ];
    for(let g=0;g<2;g++){
      const group=el("div","n27-owned-benefits__group");
      if(g)group.setAttribute("aria-hidden","true");
      // Uma volta é mais larga que a viewport, evitando vazios no loop.
      for(let repeat=0;repeat<4;repeat++){
        for(const info of data){
          const item=el("span","n27-owned-benefits__item");
          item.appendChild(svg(info[0]));
          const copy=el("span","n27-owned-benefits__copy");
          copy.append(el("strong","",info[1]),el("span",""," "+info[2]));
          item.appendChild(copy);group.appendChild(item);
        }
      }
      track.appendChild(group);
    }
    bar.appendChild(track);
    return bar;
  }
  function button(text,classes,onClick,iconName){
    const btn=el("button",classes,text);
    btn.type="button";
    if(iconName){btn.textContent="";btn.appendChild(svg(iconName));}
    if(onClick)btn.addEventListener("click",onClick);
    return btn;
  }
  function buildDetails(cls,iconName,title,subtitle,menuItems){
    const root=el("details","n27-owned-actions__detail "+cls);
    const summary=el("summary","n27-owned-actions__summary");
    const labels=el("span","n27-owned-actions__labels");
    labels.append(el("strong","",title),el("small","",subtitle));
    summary.append(svg(iconName),labels,inlineSvg("chevron","n27-owned-actions__chevron"));
    root.appendChild(summary);
    const panel=el("div","n27-owned-actions__dropdown");
    menuItems.forEach(item=>{
      if(!item.url)return;
      const a=el("a","n27-owned-actions__dropdown-link");
      a.append(inlineSvg(item.icon||"contact","n27-owned-actions__link-icon"),
        el("span","",item.label));
      a.href=item.url;
      if(item.external){a.target="_blank";a.rel="noopener noreferrer";}
      panel.appendChild(a);
    });
    root.appendChild(panel);
    root.addEventListener("mouseenter",()=>{if(window.matchMedia("(min-width: 768px)").matches)root.open=true;});
    root.addEventListener("mouseleave",()=>{if(window.matchMedia("(min-width: 768px)").matches)root.open=false;});
    return root;
  }
  function buildMain() {
    const box=el("div","n27-owned-main");
    const wrap=el("div","n27-owned-container n27-owned-main__inner");
    const mobileBtn=button("","n27-owned-mobile-toggle",null,"menu");
    mobileBtn.setAttribute("aria-label","Abrir menu");
    mobileBtn.setAttribute("aria-expanded","false");
    mobileBtn.setAttribute("aria-controls","n27-owned-drawer");
    const logo=el("a","n27-owned-logo");
    logo.href="/";logo.title="Nichelle Imports — início";
    const image=el("img");
    image.src="https://cdn.awsli.com.br/400x300/2550/2550587/logo/logo-nichelle-loja-integrada-600-13zuqalvp1.png";
    image.alt="Nichelle Imports";image.width=200;image.height=60;
    logo.appendChild(image);
    const form=el("form","n27-owned-search");
    form.action="/buscar";form.method="get";form.role="search";
    const label=el("label","n27-owned-sr-only","Buscar produtos");
    const input=el("input","n27-owned-search__field");
    input.type="search";input.name="q";input.placeholder="Buscar na loja";
    input.maxLength=255;input.autocomplete="off";input.id="n27-owned-search-input";
    label.htmlFor=input.id;form.append(label,input);
    const searchBtn=button("","n27-owned-search__button",null,"search");
    searchBtn.type="submit";searchBtn.setAttribute("aria-label","Buscar");
    form.appendChild(searchBtn);
    const actions=el("div","n27-owned-actions");
    const support=buildDetails("n27-owned-actions__support","support","Atendimento","Fale com nossa equipe",[
      {label:"Conversar pelo WhatsApp",icon:"whatsapp",url:"https://wa.me/5551994641695",external:true},
      {label:"Ligar: (51) 99464-1695",icon:"phone",url:"tel:51994641695"},
      {label:"Enviar e-mail",icon:"mail",url:"mailto:contato@nichelleimports.com.br"},
      {label:"Formulário de contato",icon:"contact",url:"/contato"}
    ]);
    const account=buildDetails("n27-owned-actions__account","account","Meu Painel","Entrar ou Cadastrar-se",[
      {label:"Entrar ou cadastrar",icon:"login",url:"/conta/login"},
      {label:"Minha Conta",icon:"account",url:"/conta/index"},
      {label:"Meus Pedidos",icon:"orders",url:"/conta/pedido/listar"},
      {label:"Lista de Desejos",icon:"favorites",url:"/conta/favorito/listar"}
    ]);
    const cart=el("a","n27-owned-cart");
    cart.href="/carrinho/index";cart.title="Ver resumo do carrinho";
    cart.setAttribute("aria-label","Abrir resumo do carrinho");
    cart.setAttribute("aria-haspopup","dialog");
    cart.setAttribute("aria-controls","n27-cart-drawer");
    cart.appendChild(svg("cart"));
    const count=el("span","n27-owned-cart__badge","0");
    count.id="n27-owned-cart-count";cart.appendChild(count);
    actions.append(support,account,cart);
    wrap.append(mobileBtn,logo,form,actions);
    box.appendChild(wrap);
    return{box,mobileBtn,cartCount:count};
  }
  function buildNav(items,openMobile) {
    const nav=el("nav","n27-owned-nav");
    nav.id="n27-head-nav";
    nav.setAttribute("aria-label","Categorias principais");
    const track=el("ul","n27-owned-nav__track n27-owned-container");
    items.forEach(item=>{
      const li=el("li","n27-owned-nav__item");
      li.dataset.key=item.key;
      const main=el("a","n27-owned-nav__main");
      main.href=item.url;
      main.append(svg(item.icon),el("span","",item.label));
      li.appendChild(main);
      if(item.children.length){
        li.classList.add("n27-owned-nav__item--children");
        const t=button("","n27-owned-nav__toggle",null,"chevron");
        t.setAttribute("aria-label","Abrir subcategorias de "+item.label);
        t.setAttribute("aria-expanded","false");
        t.addEventListener("click",function(event){
          event.stopPropagation();
          if(window.matchMedia("(max-width: 767px)").matches){
            openMobile(item.key);return;
          }
          const was=li.dataset.open==="true";
          track.querySelectorAll('.n27-owned-nav__item[data-open="true"]').forEach(n=>{
            n.dataset.open="false";
            const x=n.querySelector('.n27-owned-nav__toggle');if(x)x.setAttribute("aria-expanded","false");
          });
          li.dataset.open=String(!was);
          t.setAttribute("aria-expanded",String(!was));
        });
        li.appendChild(t);
        const menu=el("div","n27-owned-submenu");
        menu.setAttribute("role","group");
        menu.setAttribute("aria-label","Subcategorias de "+item.label);
        const intro=el("a","n27-owned-submenu__viewall","Ver todos em "+item.label);
        intro.href=item.url;menu.appendChild(intro);
        const links=el("div","n27-owned-submenu__grid");
        if(item.children.length>20)links.classList.add("n27-owned-submenu__grid--large");
        item.children.forEach(sub=>{
          const a=el("a","n27-owned-submenu__link",sub.name);
          a.href=sub.url;links.appendChild(a);
        });
        menu.appendChild(links);
        li.appendChild(menu);
      }
      track.appendChild(li);
    });
    nav.appendChild(track);
    // Cinco atalhos fixos mobile; todas as categorias continuam no drawer.
    // A grade desktop original não é alterada.
    const quick=el("ul","n27-owned-nav__quick");
    const shortcut=(label,icon,url,action,featured=false)=>{
      const li=el("li","n27-owned-nav__quick-item"+(featured?" n27-owned-nav__quick-item--featured":""));
      const control=action?button("","n27-owned-nav__quick-link",action):
        el("a","n27-owned-nav__quick-link");
      if(!action)control.href=url;
      control.setAttribute("aria-label",label);
      control.append(inlineSvg(icon,"n27-owned-nav__quick-icon"),
        el("span","",label));
      li.appendChild(control);quick.appendChild(li);
    };
    shortcut("Início","home","/?nichelle_preview=1");
    shortcut("Buscar","search","",()=>{
      const input=document.getElementById("n27-owned-search-input");
      document.getElementById("n27-independent-header")?.scrollIntoView({behavior:
        window.matchMedia("(prefers-reduced-motion: reduce)").matches?"instant":"smooth",block:"start"});
      input?.focus({preventScroll:true});
    });
    shortcut("Categorias","grid","",()=>openMobile(),true);
    shortcut("Ofertas","sparkle",items[0]?.url||"/mais-vendidos");
    shortcut("Conta","account","/conta/index");
    nav.appendChild(quick);
    document.addEventListener("click",ev=>{
      if(nav.contains(ev.target))return;
      track.querySelectorAll('.n27-owned-nav__item[data-open="true"]').forEach(n=>{
        n.dataset.open="false";
        n.querySelector(".n27-owned-nav__toggle")?.setAttribute("aria-expanded","false");
      });
    });
    document.addEventListener("keydown",ev=>{
      if(ev.key==="Escape")track.querySelectorAll('.n27-owned-nav__item[data-open="true"]').forEach(n=>{
        n.dataset.open="false";n.querySelector(".n27-owned-nav__toggle")?.setAttribute("aria-expanded","false");
      });
    });
    return nav;
  }
  // Menu lateral: accordion de uma categoria por vez, com transicao
  // fluida. Links e semantica HTML <details>/<summary> permanecem nativos.
  function animateMobileCategory(details,expanded){
    const summary=details.querySelector("summary");
    const content=details.querySelector(".n27-owned-drawer__links");
    const prev=details._n27Animation;
    if(prev){prev.onfinish=null;prev.cancel();}
    details.dataset.n27Expanded=expanded?"1":"0";
    summary?.setAttribute("aria-expanded",String(expanded));
    if(!content){details.open=expanded;return;}
    const wasOpen=details.open;
    const start=wasOpen?content.getBoundingClientRect().height:0;
    if(expanded)details.open=true;
    const finish=()=>{
      details.open=expanded;
      content.style.removeProperty("overflow");
      content.style.removeProperty("height");
      content.style.removeProperty("opacity");
      details._n27Animation=null;
    };
    if(window.matchMedia("(prefers-reduced-motion: reduce)").matches||
       typeof content.animate!=="function"){
      finish();return;
    }
    const end=expanded?content.scrollHeight:0;
    content.style.overflow="hidden";
    const anim=content.animate([
      {height:start+"px",opacity:expanded?0:1},
      {height:end+"px",opacity:expanded?1:0}
    ],{duration:expanded?260:190,easing:"cubic-bezier(.22,1,.36,1)"});
    details._n27Animation=anim;
    anim.onfinish=finish;
  }
  function buildDrawer(items) {
    const overlay=el("div","n27-owned-drawer");
    overlay.id="n27-owned-drawer";overlay.hidden=true;
    const scrim=button("","n27-owned-drawer__scrim");
    scrim.setAttribute("aria-label","Fechar menu");
    const aside=el("div","n27-owned-drawer__panel");
    aside.setAttribute("role","dialog");aside.setAttribute("aria-modal","true");
    aside.setAttribute("aria-label","Menu Nichelle Imports");
    const head=el("div","n27-owned-drawer__top");
    head.append(el("strong","","Categorias"));
    const close=button("","n27-owned-drawer__close",null,"close");
    close.setAttribute("aria-label","Fechar menu");
    head.appendChild(close);aside.appendChild(head);
    const list=el("div","n27-owned-drawer__list");
    for(const item of items){
      const details=el("details","n27-owned-drawer__item");
      details.dataset.key=item.key;
      const summary=el("summary","n27-owned-drawer__summary");
      summary.append(svg(item.icon),el("span","",item.label));
      if(item.children.length){summary.appendChild(svg("chevron","n27-owned-drawer__chevron"));}
      details.appendChild(summary);
      const inside=el("div","n27-owned-drawer__links");
      const all=el("a","n27-owned-drawer__all","Ver todos em "+item.label);
      all.href=item.url;inside.appendChild(all);
      item.children.forEach(sub=>{
        const a=el("a","",sub.name);a.href=sub.url;inside.appendChild(a);
      });
      details.appendChild(inside);
      summary.setAttribute("aria-expanded","false");
      if(item.children.length){
        summary.addEventListener("click",event=>{
          event.preventDefault();
          const expand=details.dataset.n27Expanded!=="1";
          if(expand){
            list.querySelectorAll("details[data-n27-expanded='1']").forEach(other=>{
              if(other!==details)animateMobileCategory(other,false);
            });
          }
          animateMobileCategory(details,expand);
        });
      } else summary.addEventListener("click",ev=>{
        ev.preventDefault();window.location.href=item.url;
      });
      list.appendChild(details);
    }
    aside.appendChild(list);
    const foot=el("div","n27-owned-drawer__foot");
    const links=[
      ["Minha Conta","/conta/login"],
      ["Meus Pedidos","/conta/pedido/listar"],
      ["Atendimento","https://wa.me/5551994641695"]
    ];
    links.forEach(it=>{
      const a=el("a","",it[0]);a.href=it[1];
      if(/^https:/.test(it[1])){a.target="_blank";a.rel="noopener noreferrer";}
      foot.appendChild(a);
    });
    aside.appendChild(foot);
    overlay.append(scrim,aside);
    return {overlay,close,scrim,list};
  }
  function readCartCount() {
    // Dados LI; nunca utiliza estilos ou eventos do Groom.
    if(typeof window.qtd_prods_carrinho==="number")return Math.max(0,window.qtd_prods_carrinho);
    if(Array.isArray(window.CARRINHO_PRODS))return window.CARRINHO_PRODS.length;
    return 0;
  }
  function mount() {
    if(!allowed()||document.getElementById("n27-independent-header"))return;
    const host=document.querySelector(".conteiner-principal")||document.body;
    if(!host)return;
    const main=buildMain();
    const items=menuData();
    const drawer=buildDrawer(items);
    let drawerCloseTimer=0,drawerTransitionToken=0;
    function setDrawer(open,key) {
      const token=++drawerTransitionToken;
      clearTimeout(drawerCloseTimer);
      main.mobileBtn.setAttribute("aria-expanded",String(open));
      document.documentElement.classList.toggle("n27-owned-menu-open",open);
      drawer.overlay.setAttribute("aria-hidden",String(!open));
      if(open){
        drawer.overlay.hidden=false;
        window.requestAnimationFrame(()=>{
          if(token===drawerTransitionToken&&!drawer.overlay.hidden){
            drawer.overlay.classList.add("n27-owned-drawer--visible");
            drawer.close.focus({preventScroll:true});
          }
        });
        if(key!==undefined){
          const selected=[...drawer.list.querySelectorAll("details")].find(n=>n.dataset.key===key);
          if(selected){
            drawer.list.querySelectorAll("details[data-n27-expanded='1']")
              .forEach(other=>{
                if(other!==selected)animateMobileCategory(other,false);
              });
            animateMobileCategory(selected,true);
            window.requestAnimationFrame(()=>selected.scrollIntoView({block:"nearest"}));
          }
        }
      }else{
        drawer.overlay.classList.remove("n27-owned-drawer--visible");
        const reduced=window.matchMedia("(prefers-reduced-motion: reduce)").matches;
        drawerCloseTimer=window.setTimeout(()=>{
          if(token===drawerTransitionToken&&
             !drawer.overlay.classList.contains("n27-owned-drawer--visible"))
            drawer.overlay.hidden=true;
        },reduced?0:290);
        main.mobileBtn.focus({preventScroll:true});
      }
    }
    main.mobileBtn.addEventListener("click",()=>setDrawer(true));
    drawer.close.addEventListener("click",()=>setDrawer(false));
    drawer.scrim.addEventListener("click",()=>setDrawer(false));
    document.addEventListener("keydown",e=>{
      if(drawer.overlay.hidden)return;
      if(e.key==="Escape"){e.preventDefault();setDrawer(false);return;}
      if(e.key!=="Tab"||!drawer.overlay.classList.contains("n27-owned-drawer--visible"))return;
      const focusable=[...drawer.overlay.querySelectorAll(
        'button:not([disabled]),a[href],summary,[tabindex]:not([tabindex="-1"])'
      )].filter(n=>n.getClientRects().length>0);
      if(!focusable.length)return;
      const first=focusable[0],last=focusable[focusable.length-1];
      if(e.shiftKey&&document.activeElement===first){e.preventDefault();last.focus();}
      else if(!e.shiftKey&&document.activeElement===last){e.preventDefault();first.focus();}
    });
    const root=el("div","n27-owned-header");
    root.setAttribute("role","banner");
    root.id="n27-independent-header";
    // A spacer reserves exactly the mobile main-bar height whenever that
    // bar becomes fixed. Without it, scrolling would shift page content.
    const mobileStickySpacer=el("div","n27-owned-sticky-placeholder");
    mobileStickySpacer.setAttribute("aria-hidden","true");
    root.append(buildMarquee(),mobileStickySpacer,main.box,buildNav(items,key=>setDrawer(true,key)));
    // Overlay is portaled outside the navigation scroll container.
    root.appendChild(drawer.overlay);
    host.insertBefore(root,host.firstChild);
    // Barra inferior do tema Groom nao pode coexistir com #n27-head-nav.
    // Remocao restrita a mobile e a prévia, sem alterar a loja publicada.
    function removeNativeMobileBar(){
      if(!window.matchMedia("(max-width: 767px)").matches)return;
      document.querySelectorAll("nav.barra-mobile").forEach(native=>{
        native.remove();
      });
    }
    removeNativeMobileBar();
    if(window.MutationObserver){
      const barObserver=new MutationObserver(records=>{
        if(!window.matchMedia("(max-width: 767px)").matches)return;
        if(records.some(record=>[...record.addedNodes].some(n=>
          n.nodeType===1&&(n.matches?.("nav.barra-mobile")||
            n.querySelector?.("nav.barra-mobile")))))removeNativeMobileBar();
      });
      barObserver.observe(document.body,{childList:true,subtree:true});
    }
    window.addEventListener("resize",removeNativeMobileBar,{passive:true});
    function updateCart(override) {
      const qty=typeof override==="number"&&Number.isFinite(override)?override:readCartCount();
      const n=Math.max(0,Math.floor(qty));
      main.cartCount.textContent=String(n);
      main.cartCount.setAttribute("aria-label",n+" itens no carrinho");
    }
    updateCart();
    window.NichelleHeader={version:"1.4.0",categories:items,refreshCart:updateCart,icons:ICON_ASSETS};
    window.addEventListener("nichelle:cart-updated",e=>updateCart(e.detail?.quantity));
    window.addEventListener("cart:updated",e=>updateCart(e.detail?.quantity));
    // Optional bridge for LI themes that expose a rendered cart quantity.
    // Nothing visual or interactive depends on this node's existence.
    const nativeBadge=document.querySelector('#cabecalho .qtd-carrinho');
    if(nativeBadge && window.MutationObserver){
      new MutationObserver(()=>{
        const qty=Number(nativeBadge.textContent.trim());
        if(Number.isFinite(qty))updateCart(qty);
      }).observe(nativeBadge,{childList:true,characterData:true,subtree:true});
    }
    document.documentElement.dataset.n27IndependentHeader="1";
    // Desktop: native CSS sticky keeps the complete approved header visible.
    // Mobile: only logo/search/cart are pinned; marquee and category rail
    // continue scrolling away. The placeholder prevents any layout jump.
    const headerTop=window.scrollY+root.getBoundingClientRect().top;
    let rafPending=false;
    function updateSticky() {
      rafPending=false;
      if(!root.isConnected)return;
      const compact=window.matchMedia("(max-width: 767px)").matches &&
        window.scrollY>headerTop+145;
      root.dataset.n27MobileSticky=compact?"1":"0";
    }
    function requestSticky() {
      if(rafPending)return;
      rafPending=true;
      window.requestAnimationFrame(updateSticky);
    }
    window.addEventListener("scroll",requestSticky,{passive:true});
    window.addEventListener("resize",requestSticky,{passive:true});
    requestSticky();
  }
  if(document.readyState==="loading")document.addEventListener("DOMContentLoaded",mount,{once:true});
  else mount();
  window.addEventListener("load",mount,{once:true});
  [180,600,1500,3000].forEach(t=>setTimeout(mount,t));
})();


/* nichelle-home-benefits.js */
/*
 * Nichelle Imports • FWR Home Advantages v1.0
 * FWR component; zero dependency on Groom markup, CSS or events.
 * Admin: window.Nichelle27Settings.vantagens (LI HTML editor)
 * Alternate: <script type="application/json" id="n27-vantagens-json">
 * Alternate: vantagens.configUrl -> externally hosted JSON (CORS permitting).
 * Only the explicitly opted-in home preview is modified.
 */
(function () {
  "use strict";

  if (!/^(www\.)?nichelleimports\.com\.br$/i.test(location.hostname) ||
      (location.pathname.replace(/\/+$/, "") || "/") !== "/" ||
      new URLSearchParams(location.search).get("nichelle_preview") !== "1") return;

  const ID = "n27-approved-benefits";
  const FIELDS = Object.freeze([
    { icone:"package", titulo:"COSMÉTICOS IMPORTADOS", descricao:"À PRONTA ENTREGA" },
    { icone:"seal", titulo:"PRODUTOS 100% ORIGINAIS", descricao:"COM NOTA FISCAL" },
    { icone:"headset", titulo:"ATENDIMENTO PERSONALIZADO", descricao:"COM EQUIPE ESPECIALISTA" },
    { icone:"medal", titulo:"LOJA COM SELO DE VERIFICAÇÃO", descricao:"RECLAME AQUI" }
  ]);
  const ALLOWED_ICONS = Object.freeze({
    package: '<path d="m12 2-9 5.1v10L12 22l9-4.9v-10L12 2Z"/><path d="m3 7.1 9 5.1 9-5.1M12 12.2V22M7.5 4.6l9 5.2"/><path d="m19 16 2 2 2-2" stroke-width="2.4"/>',
    seal: '<path d="m12 2 3.2 2 3.8.5.5 3.8L22 12l-2.5 3.7-.5 3.8-3.8.5L12 22l-3.2-2-3.8-.5-.5-3.8L2 12l2.5-3.7.5-3.8 3.8-.5L12 2Z"/><path d="m8 12 2.6 2.6L16 9"/>',
    headset: '<path d="M4 13v-2a8 8 0 0 1 16 0v2"/><rect x="2.2" y="11.1" width="3.7" height="7" rx="1.6"/><rect x="18.1" y="11.1" width="3.7" height="7" rx="1.6"/><path d="M20 17.5c0 2.5-2 4.5-4.5 4.5H13"/><path d="M9 12.7v.1M15 12.7v.1M8.5 16a5.2 5.2 0 0 0 7 0"/>',
    medal: '<circle cx="12" cy="10" r="7.5"/><path d="m8.6 10 2.2 2.2 4.4-4.3"/><path d="m7.1 16.7-1 5.1 5.9-2.2 5.9 2.2-1-5.1"/>',
    truck: '<path d="M2 7h12v11H2zM14 10h4l4 4v4h-8M5 18a2 2 0 1 0 4 0M16 18a2 2 0 1 0 4 0"/>',
    card: '<rect x="2" y="5" width="20" height="14" rx="2"/><path d="M2 10h20M6 15h5"/>',
    shield: '<path d="M12 2 4 5v7c0 5 3.1 8.5 8 10 4.9-1.5 8-5 8-10V5l-8-3Z"/><path d="m9 12 2 2 4-4"/>',
    pix: '<path d="m8 4 4 4 4-4M8 20l4-4 4 4M4 8l4 4-4 4M20 8l-4 4 4 4"/>'
  });

  function active() {
    const settings = window.Nichelle27Settings;
    return !!(settings && settings.geral &&
      settings.geral.ativo === true &&
      settings.geral.modoPreview === true &&
      settings.geral.publicarNaLoja !== true);
  }
  function node(name, cls, text) {
    const el = document.createElement(name);
    if (cls) el.className = cls;
    if (text !== undefined) el.textContent = text;
    return el;
  }
  function icon(code) {
    const svg = document.createElementNS("http://www.w3.org/2000/svg","svg");
    svg.setAttribute("viewBox","0 0 24 24");
    svg.setAttribute("fill","none");
    svg.setAttribute("stroke","currentColor");
    svg.setAttribute("stroke-width","1.8");
    svg.setAttribute("stroke-linecap","round");
    svg.setAttribute("stroke-linejoin","round");
    svg.setAttribute("aria-hidden","true");
    // Icon names are allowlisted; client-provided HTML/SVG is never injected.
    svg.innerHTML = ALLOWED_ICONS[code] || ALLOWED_ICONS.package;
    return svg;
  }
  function safeString(value, length) {
    return typeof value === "string" ? value.trim().slice(0,length) : "";
  }
  function safeLink(raw) {
    if (typeof raw !== "string" || !raw.trim()) return "";
    try {
      const url = new URL(raw, location.origin);
      if (url.origin !== location.origin || !/^https?:$/.test(url.protocol)) return "";
      return url.pathname + url.search + url.hash;
    } catch (_) {return "";}
  }
  function parseInlineJSON() {
    const json = document.getElementById("n27-vantagens-json");
    if (!json) return null;
    try {
      const value = JSON.parse(json.textContent);
      return value && typeof value === "object" && !Array.isArray(value) ? value : null;
    } catch (error) {
      console.warn("[Nichelle Vantagens] JSON do painel inválido.",error);
      return null;
    }
  }
  function getSettings() {
    const fromSettings = window.Nichelle27Settings?.vantagens;
    const fromJSON = parseInlineJSON();
    const fromGlobal = window.NichelleBenefitsData;
    return (fromJSON && typeof fromJSON === "object") ? fromJSON :
      ((fromSettings && typeof fromSettings === "object") ? fromSettings :
      ((fromGlobal && typeof fromGlobal === "object") ? fromGlobal : {}));
  }
  function normalize(cfg) {
    const collection = Array.isArray(cfg.itens) ? cfg.itens :
      (Array.isArray(cfg.items) ? cfg.items : FIELDS);
    const items = collection.slice(0,4).map((item, i) => ({
      icone:Object.prototype.hasOwnProperty.call(ALLOWED_ICONS,item?.icone) ? item.icone : FIELDS[i].icone,
      titulo:safeString(item?.titulo,74) || FIELDS[i].titulo,
      descricao:safeString(item?.descricao || item?.texto,74) || FIELDS[i].descricao,
      link:safeLink(item?.link)
    }));
    return {
      ativo:cfg.ativo !== false,
      etiqueta:safeString(cfg.etiqueta || cfg.rotulo,50) || "+VANTAGENS",
      itens:items.length ? items : FIELDS,
      configUrl:safeString(cfg.configUrl,500)
    };
  }
  function mountConfig(cfg) {
    if (!active()) return;
    let region = document.getElementById(ID);
    if (!region) {
      const stage = document.getElementById("n27-preview-stage");
      if (!stage) return;
      region = node("section","n27-approved n27-approved-benefits");
      region.id=ID;
      const hero = document.getElementById("n27-approved-hero");
      if (hero && hero.parentNode === stage) hero.insertAdjacentElement("afterend",region);
      else stage.prepend(region);
    }
    region.setAttribute("aria-label","Vantagens de comprar na Nichelle Imports");
    region.classList.add("n27-home-benefits");
    region.dataset.n27OwnedBenefits="1";
    region.hidden = !cfg.ativo;
    if (!cfg.ativo) {region.replaceChildren();return;}
    const wrap=node("div","n27-home-benefits__inner");
    const label=node("div","n27-home-benefits__label");
    label.setAttribute("aria-hidden","true");
    const letters=node("span","n27-home-benefits__label-text");
    const lines = cfg.etiqueta.replace(/^\+/,"").replace(/\s/g,"").toUpperCase();
    if (lines==="VANTAGENS") {
      const line1=node("span");
      line1.append(node("b","","+"),document.createTextNode("VAN"));
      letters.append(line1,node("span","","TA"),node("span","","GENS"));
    } else {
      letters.append(node("span","",cfg.etiqueta.toUpperCase()));
    }
    label.appendChild(letters);
    const list=node("div","n27-home-benefits__list");
    list.setAttribute("role","list");
    for (const item of cfg.itens) {
      const card=node(item.link ? "a" : "div","n27-home-benefits__item");
      card.setAttribute("role","listitem");
      if (item.link) card.setAttribute("href",item.link);
      const pic=node("span","n27-home-benefits__icon");
      pic.appendChild(icon(item.icone));
      const words=node("span","n27-home-benefits__text");
      words.append(node("strong","",item.titulo),node("span","",item.descricao));
      card.append(pic,words);
      list.appendChild(card);
    }
    wrap.append(label,list);
    region.replaceChildren(wrap);
    region.dataset.n27BenefitsReady="1";
  }
  async function loadExternal(url) {
    let target;
    try {
      target = new URL(url,location.href);
      const approvedHost=target.origin === location.origin ||
        target.hostname === "cdn.awsli.com.br" ||
        target.hostname === "nichelle-2026-git-develop-fwragenciadigitals-projects.vercel.app";
      if (!approvedHost || target.protocol !== "https:") throw Error("Origem não permitida");
    } catch (e) {
      console.warn("[Nichelle Vantagens] URL de JSON não permitida.",e.message);
      return;
    }
    try {
      const response=await fetch(target.href,{mode:"cors",credentials:"omit",cache:"no-cache"});
      if (!response.ok) throw Error("HTTP "+response.status);
      const data=await response.json();
      if (!data || typeof data !== "object" || Array.isArray(data)) throw Error("Formato JSON inválido");
      if (!active() || getSettings().configUrl !== url) return;
      externalCache={url,data};
      mountConfig(normalize(data));
    } catch (error) {
      console.warn("[Nichelle Vantagens] JSON externo indisponível. Mantendo configuração do painel.",error);
    }
  }
  let queued=false, requested="", externalCache=null;
  function mount() {
    if (!active()) return;
    const admin=getSettings();
    // Valores editados no HTML da loja vencem JSON remoto antigo.
    const inlineItems=Array.isArray(admin.itens)&&admin.itens.length>0;
    const url=inlineItems?"":safeString(admin.configUrl,500);
    const cfg=normalize(externalCache && externalCache.url===url ? externalCache.data : admin);
    mountConfig(cfg);
    if (url && requested !== url) {
      requested=url;
      loadExternal(url);
    }
  }
  function scheduleMount() {
    if (queued) return;
    queued=true;
    window.requestAnimationFrame(()=>{
      queued=false;mount();
    });
  }
  if (document.readyState === "loading") document.addEventListener("DOMContentLoaded",mount,{once:true});
  else mount();
  window.addEventListener("load",mount,{once:true});
  [250,850,2200].forEach(delay=>window.setTimeout(mount,delay));
  document.addEventListener("nichelle27:vantagens:update",function(){requested="";externalCache=null;scheduleMount();});
  window.NichelleHomeBenefits={version:"1.1.0",refresh:scheduleMount,icons:Object.keys(ALLOWED_ICONS)};
})();


/* nichelle-mini-banners.js */
/* Nichelle Imports 2026 — Mini Banner nativo (LI) v1.3
 * Prioriza Mini Banners nativos; opcionalmente aceita imagens manuais
 * aprovadas no HTML do cliente quando o tema não as publica no DOM.
 * Somente home da loja sob ?nichelle_preview=1 e settings opt-in.
 */
(function(){
"use strict";
const pathname=location.pathname.replace(/\/+$/,"")||"/";
if(!/^(www\.)?nichelleimports\.com\.br$/i.test(location.hostname)||pathname!=="/"||
 new URLSearchParams(location.search).get("nichelle_preview")!=="1")return;
const ID="n27-approved-categories";
// O tema Groom e variantes da LI podem renderizar o mesmo tipo em locais diferentes.
// "banners-extras" tambem fica oculto visualmente na home FWR, mas permanece no DOM.
// A fonte de verdade deve ser uma posicao EXPLICITAMENTE Mini Banner.
// NUNCA ler o container generico .banners-extras: ele hospeda Banner Vitrine.
const SOURCE=[
 ".row-fluid.banner.mini-banner",".banner.mini-banner",".banner.mini",
 ".mini-banner",".minibanner",".mini-banners",".minibanners",
 ".banner-mini",".banners-mini","#banner-mini","#mini-banner","#mini-banners",
 "[data-banner-posicao='mini' i]","[data-banner-position='mini' i]",
 "[data-banner-posicao='minibanner' i]","[data-banner-position='minibanner' i]",
 "[data-banner-tipo='mini' i]","[data-banner-type='mini' i]",
 "[data-banner-category='mini' i]"
].join(",");
const ALT_SOURCE='img[alt*="mini banner" i],img[alt*="minibanner" i],img[title*="mini banner" i]';
const EXCLUDED=".slick-cloned,.owl-item.cloned,.swiper-slide-duplicate,"+
 ".banner-full,.banner.cheio,.banner.full,.banner-principal,.banner-slider,"+
 ".banner-tarja,.banner-vitrine,.banner-lateral,.fullbanner,.full-banner,"+
 ".vitrine-banner,.banners-vitrine,[data-banner-posicao*='vitrine' i],"+
 "[data-banner-position*='vitrine' i],.n27-approved-category,"+
 ".n27-full__slide,[data-n27-mini-clone]";
const LIMIT=4;
let lastKey="",scheduled=false,watcher=null;
const text=(val,max=180)=>String(val||"").replace(/\s+/g," ").trim().slice(0,max);
function allowed(){
 const s=window.Nichelle27Settings?.geral;
 return !!(s&&s.ativo===true&&s.modoPreview===true&&s.publicarNaLoja!==true);
}
function config(){
 const s=window.Nichelle27Settings?.miniBanners||window.Nichelle27Settings?.miniBanner||{};
 return {ativo:s.ativo!==false,limite:Math.min(LIMIT,Math.max(1,Number(s.limite)||LIMIT)),
  itens:Array.isArray(s.itens)?s.itens:[]};
}
function safeURL(raw,image){
 if(typeof raw!=="string"||!raw.trim())return"";
 try{
  const u=new URL(raw.trim(),location.href);
  if(u.username||u.password||!["https:","http:"].includes(u.protocol))return"";
  if(image&&u.protocol!=="https:")return"";
  return u.href;
 }catch(_){return"";}
}
function imageURL(img){
 // LI e temas costumam escrever a URL em atributos lazy loading.
 const choices=[img?.getAttribute("data-src"),img?.getAttribute("data-original"),
  img?.getAttribute("data-lazy-src"),img?.getAttribute("data-lazy"),
  img?.getAttribute("data-image"),img?.getAttribute("data-srcset"),
  img?.getAttribute("srcset"),img?.getAttribute("src"),img?.currentSrc];
 for(const raw of choices){
  const first=typeof raw==="string"?raw.split(",")[0].trim().split(/\s+/)[0]:"";
  const result=safeURL(first,true);
  if(result&&!/data:image|blank\.gif|placeholder/i.test(result))return result;
 }
 return"";
}
function roots(){
 // Captura somente containers Mini identificados no HTML da LI.
 // O tema pode colocar tambem Vitrines em .banners-extras: jamais usa-lo sozinho.
 const found=[...document.querySelectorAll(SOURCE)].filter(root=>
   !root.closest("#"+ID+",.n27-shorts,.n27-best-shelf") &&
   !root.matches(EXCLUDED) && !root.closest(EXCLUDED));
 // Evita repetir a mesma imagem quando pai e filho sao identificados.
 const unique=found.filter((root,i)=>!found.some((parent,j)=>
   i!==j&&parent!==root&&parent.contains(root)));
 if(unique.length)return unique;
 // A LI costuma usar o Nome do banner como texto alternativo da imagem.
 // Na captura do lojista ele e "Mini Banner - One".
 return [...document.querySelectorAll(ALT_SOURCE)].filter(img=>
   !img.closest("#"+ID+",.n27-shorts,.n27-best-shelf,"+EXCLUDED));
}
function mobileSource(img){
 const picture=img?.closest("picture");
 const source=picture?.querySelector('source[media*="max-width"],source[media*="max-device-width"]');
 const raw=source?.getAttribute("data-srcset")||source?.getAttribute("srcset")||
   img?.getAttribute("data-mobile-src")||img?.getAttribute("data-src-mobile")||"";
 const part=typeof raw==="string"?raw.trim().split(",")[0].trim().split(/\s+/)[0]:"";
 return safeURL(part,true);
}
function backgroundURL(element){
 const values=[
  element?.getAttribute?.("data-background"),
  element?.getAttribute?.("data-bg"),
  element?.getAttribute?.("data-background-image"),
  element?.getAttribute?.("style")
 ];
 for(const raw of values){
  if(typeof raw!=="string"||!raw.trim())continue;
  const m=raw.match(/url\(\s*["']?([^"')]+)["']?\s*\)/i);
  const image=m?.[1]||(!raw.includes(";")&&!raw.includes(":")?raw.trim():"");
  const url=safeURL(image,true);
  if(url)return url;
 }
 return"";
}
function collect(){
 const output=[],seen=new Set();
 const groups=roots();
 for(const root of groups){
  const imgs=root.matches("img")?[root]:[...root.querySelectorAll("img")];
  for(const img of imgs){
   if(img.closest(EXCLUDED)||img.closest("#"+ID))continue;
   const src=imageURL(img);
   if(!src)continue;
   // Em HTML nativo com <picture>, apenas o <img> representa o banner;
   // <source> fornece a imagem especifica do mobile, quando publicada.
   const a=img.closest("a[href]")||root.closest("a[href]")||
     (root.matches("a[href]")?root:null);
   const href=a?safeURL(a.getAttribute("href"),false):"";
   const mobile=mobileSource(img);
   const key=src+"|"+href+"|"+mobile;
   if(seen.has(key))continue;
   seen.add(key);
   output.push({src,mobile,href,alt:text(img.getAttribute("alt")||
     a?.getAttribute("title")||img.getAttribute("title")||"Mini banner Nichelle Imports"),
     blank:a?.getAttribute("target")==="_blank"});
   if(output.length>=LIMIT)return output;
  }
 }
 // Algunos temas desenham banners como background-image em vez de <img>.
 // Ler apenas os elementos dentro dos containers identificados como banners.
 if(!output.length&&groups.length){
  for(const root of groups){
   const nodes=[root,...root.querySelectorAll('[style*="background-image"],[data-background],[data-bg],[data-background-image]')];
   for(const element of nodes){
    if(element.closest(EXCLUDED)||element.closest("#"+ID))continue;
    const src=backgroundURL(element);if(!src)continue;
    const a=element.closest("a[href]")||root.closest("a[href]")||
      (root.matches("a[href]")?root:null);
    const href=a?safeURL(a.getAttribute("href"),false):"";
    const key=src+"|"+href+"|";
    if(seen.has(key))continue;seen.add(key);
    output.push({src,mobile:"",href,alt:text(element.getAttribute("aria-label")||
      a?.getAttribute("title")||element.getAttribute("title")||
      "Mini banner Nichelle Imports"),blank:a?.getAttribute("target")==="_blank"});
    if(output.length>=LIMIT)return output;
   }
  }
 }
 // Em alguns temas o container nao recebe o nome 'mini' e
 // somente a imagem recebe o nome do banner no atributo alt.
 if(!output.length&&groups.length){
  for(const img of document.querySelectorAll(ALT_SOURCE)){
   if(img.closest(EXCLUDED)||img.closest("#"+ID))continue;
   const src=imageURL(img);if(!src)continue;
   const a=img.closest("a[href]");
   const href=a?safeURL(a.getAttribute("href"),false):"";
   const mobile=mobileSource(img);
   const key=src+"|"+href+"|"+mobile;
   if(seen.has(key))continue;seen.add(key);
   output.push({src,mobile,href,alt:text(img.getAttribute("alt")||
     img.getAttribute("title")||"Mini banner Nichelle Imports"),
     blank:a?.getAttribute("target")==="_blank"});
   if(output.length>=LIMIT)break;
  }
 }
 return output;
}
function configuredBanners(items){
 const output=[],seen=new Set();
 for(const item of items){
  if(!item||item.ativo===false)continue;
  const src=safeURL(item.imagem||item.src||item.url||"",true);
  if(!src||seen.has(src))continue;
  seen.add(src);
  const mobile=safeURL(item.imagemMobile||item.mobile||"",true);
  const href=safeURL(item.link||item.href||"",false);
  output.push({src,mobile,href,alt:text(item.alt||item.titulo||"Mini Banner Nichelle Imports"),
   blank:item.novaAba===true||item.blank===true});
  if(output.length>=LIMIT)break;
 }
 return output;
}
function render(){
 if(!allowed())return;
 const stage=document.getElementById("n27-preview-stage");
 let host=document.getElementById(ID);
 if(!stage||!host||host.parentElement!==stage)return;
 const cfg=config(),native=cfg.ativo?collect().slice(0,cfg.limite):[];
 const fallback=cfg.ativo&&!native.length?configuredBanners(cfg.itens).slice(0,cfg.limite):[];
 const banners=native.length?native:fallback;
 const key=JSON.stringify([cfg,banners]);
 if(key===lastKey&&host.dataset.n27MiniReady==="1")return;
 lastKey=key;
 const grid=document.createElement("div");
 grid.className="n27-approved-container n27-approved-categories__grid";
 grid.setAttribute("role","list");
 grid.dataset.n27Count=String(banners.length);
 for(const banner of banners){
  const item=document.createElement(banner.href?"a":"div");
  item.className="n27-approved-category";
  item.setAttribute("role","listitem");
  if(banner.href){
   item.href=banner.href;
   if(banner.blank){item.target="_blank";item.rel="noopener noreferrer";}
  }
  const picture=document.createElement("picture");
  if(banner.mobile){
   const mobile=document.createElement("source");
   mobile.media="(max-width: 767px)";
   mobile.srcset=banner.mobile;
   picture.appendChild(mobile);
  }
  const img=document.createElement("img");
  img.src=banner.src;img.alt=banner.alt;img.width=405;img.height=710;
  img.loading="lazy";img.decoding="async";
  picture.appendChild(img);item.appendChild(picture);grid.appendChild(item);
 }
 host.replaceChildren(grid);
 host.hidden=banners.length===0;
 host.dataset.n27MiniReady="1";
 host.dataset.n27MiniCount=String(banners.length);
 host.dataset.n27MiniSource=native.length?"nativo":fallback.length?"configuracao":"nenhum";
 document.documentElement.dataset.n27NativeMiniBanner=native.length?"1":"0";
}
function schedule(){
 if(scheduled)return;
 scheduled=true;
 requestAnimationFrame(()=>{scheduled=false;render();});
}
function observe(){
 if(watcher||!document.body||!window.MutationObserver)return;
 watcher=new MutationObserver(records=>{
  if(records.some(r=>{
   const target=r.target.nodeType===1?r.target:r.target.parentElement;
   return target?.closest?.(".mini-banner,.minibanner,.banner-mini,.banners-mini,[data-banner-posicao='mini' i],[data-banner-position='mini' i]") ||
     [...r.addedNodes].some(n=>n.nodeType===1&&
       (n.matches?.(SOURCE)||n.querySelector?.(SOURCE)));
  }))schedule();
 });
 watcher.observe(document.body,{subtree:true,childList:true,attributes:true,attributeFilter:["src","data-src","data-original","data-lazy-src","href"]});
}
function init(){render();observe();}
if(document.readyState==="loading")document.addEventListener("DOMContentLoaded",init,{once:true});
else init();
window.addEventListener("load",schedule,{once:true});
[250,850,1800,3500,5500].forEach(t=>setTimeout(schedule,t));
["nichelle27:refresh","nichelle27:mini-banners:update","nichelle27:home:reordered"]
 .forEach(evt=>document.addEventListener(evt,schedule));
window.NichelleMiniBanners={
 version:"1.3.0",refresh:schedule,source:"Mini Banner LI ou configuracao editavel",
 diagnostico:function(){
  const host=document.getElementById(ID);
  const candidates=roots();
  const published=collect();
  return{
   previewAtivo:allowed(),slotExiste:!!host,
   slotPronto:host?.dataset.n27MiniReady==="1",
   imagensNativas:published.length,
   raizesEncontradas:candidates.length,
   candidatosPorNome:document.querySelectorAll(ALT_SOURCE).length,
   cardsVisiveis:Number(host?.dataset.n27MiniCount||0),
   fonteExibida:host?.dataset.n27MiniSource||"nenhuma",
   fallbackConfigurados:configuredBanners(config().itens).length,
   mensagem:published.length?"Mini Banners nativos encontrados no HTML da loja":
    "Tema sem Mini Banner no DOM: use URLs no bloco editavel, se desejar exibir os cards."
  };
 }
};
})();


/* nichelle-best-sellers.js */
/*
 * FWR • Nichelle Imports 2026 • Mais Vendidos v1.3
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

  const SHELVES = [
    {key:"maisVendidos", selector:".vitrine-mas-vendido", id:"n27-approved-best-sellers",
      settings:"vitrineMaisVendidos", defaultPrefixo:"Produtos", defaultTitulo:"Mais Vendidos"},
    {key:"lancamentos", selector:".vitrine-lancamento", id:"n27-approved-launches",
      settings:"vitrineLancamentos", defaultPrefixo:"Novos", defaultTitulo:"Lançamentos"},
    {key:"destaques", selector:".vitrine-destaque", id:"n27-approved-highlights",
      settings:"vitrineDestaques", defaultPrefixo:"Produtos", defaultTitulo:"Em Destaque"},
    {key:"marcasProdutos", selector:".vitrine-18709305", id:"n27-approved-brand-products",
      settings:"vitrineMarcasProdutos", defaultPrefixo:"Produtos", defaultTitulo:"Por Marca"}
  ];
  const signatures = new Map();
  const observedSources = new WeakSet();
  let pending = false;

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
    pic.src=productArtAt(product.img,800);
    if(pic.src!==product.img) {
      pic.srcset=[500,800,1000].map(w=>productArtAt(product.img,w)+" "+w+"w").join(", ");
      pic.sizes="(max-width: 520px) 78vw, (max-width: 900px) 45vw, (max-width: 1280px) 28vw, 300px";
    }
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
    const stage=document.getElementById("n27-preview-stage");
    if(!stage||source.parentNode!==stage)return;
    let shelf=document.getElementById(def.id);
    if (!cfg.ativo) {
      shelf?.remove();
      source.removeAttribute("data-n27-shelf-source");
      signatures.delete(def.key);
      return;
    }
    const dataKey=JSON.stringify([cfg,products.map(p=>[
      p.id,p.name,p.img,p.oldPrice,p.current,p.pix,p.pixPercent,p.percent,
      p.installment?.amount,p.installment?.count
    ])]);
    if(dataKey===signatures.get(def.key) && shelf && shelf.parentNode===stage) return;

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
    document.documentElement.dataset.n27BestShelf="1";
    signatures.set(def.key,dataKey);
    setupNavigation(fresh,rail,cfg);
  }
  function schedule(){
    if(pending)return;
    pending=true;
    setTimeout(()=>{pending=false;mount();},120);
  }
  function mount(){
    if(!enabled())return;
    const stage=document.getElementById("n27-preview-stage");
    if(!stage)return;
    SHELVES.forEach(def=>{
      const source=stage.querySelector(":scope > .vitrine-produtos"+def.selector);
      if(!source)return;
      const cfg=config(def);
      if(!cfg.ativo) {
        render(source,[],cfg,def);
        return;
      }
      const products=getProductData(source,cfg.maxProdutos);
      if(!products.length)return; // keep the native vitrine as a safe fallback
      render(source,products,cfg,def);
      if(!observedSources.has(source)) {
        const mo=new MutationObserver(schedule);
        mo.observe(source,{childList:true,characterData:true,subtree:true,
          attributes:true,attributeFilter:["src","data-sell-price"]});
        observedSources.add(source);
      }
    });
  }
  if(document.readyState==="loading")document.addEventListener("DOMContentLoaded",mount,{once:true});
  else mount();
  window.addEventListener("load",mount,{once:true});
  [250,750,1900,4000].forEach(t=>setTimeout(mount,t));
  document.addEventListener("nichelle27:refresh",schedule);
  document.addEventListener("nichelle27:vitrine:update",()=>{signatures.clear();schedule();});
  document.addEventListener("nichelle27:vitrines:update",()=>{signatures.clear();schedule();});
  window.NichelleBestSellers={
    version:"1.3.0",refresh:schedule,
    sections:SHELVES.map(def=>({key:def.key,selector:def.selector,id:def.id}))
  };
})();


/* nichelle-brands.js */
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
  const PARAM = new URLSearchParams(location.search);
  if(!/^(www\.)?nichelleimports\.com\.br$/i.test(location.hostname) ||
     (location.pathname.replace(/\/+$/, "") || "/") !== "/" ||
     PARAM.get("nichelle_preview") !== "1") return;

  const ID="n27-approved-brands", SOURCE=".vitrine-marcas";
  let observer=null, sourceNode=null, queued=false, signature="";
  const txt=(s,max)=>typeof s==="string"?s.replace(/\s+/g," ").trim().slice(0,max):"";
  function allowed(){
    const s=window.Nichelle27Settings?.geral;
    return s?.ativo===true && s.modoPreview===true && s.publicarNaLoja!==true;
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


/* nichelle-shorts.js */
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


/* nichelle-news.js */
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


/* nichelle-scroll-motion.js */
/*
 * Nichelle 2026 — progressive scroll reveal v1.0
 * Runs on storefront home, category, product and content-page previews.
 * Only ?nichelle_preview=1 until layout is published. Keeps native LI
 * commerce and navigation fully interactive. No CLS: opacity/transform only.
 * Opts out when prefers-reduced-motion is enabled.
 */
(function(){
  "use strict";
  const isHome=(location.pathname.replace(/\/+$/,"")||"/")==="/";
  if(!/^(www\.)?nichelleimports\.com\.br$/i.test(location.hostname)||
     new URLSearchParams(location.search).get("nichelle_preview")!=="1" ||
     /^(\/carrinho|\/checkout|\/finalizar-pedido|\/login)(\/|$)/.test(location.pathname))return;
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
    if(reduced.matches||!io)return;
    const cs=getComputedStyle(el),rect=el.getBoundingClientRect();
    if(cs.display==="none"||cs.visibility==="hidden"||rect.height<25||rect.width<60)return;
    // DOM can initially measure all cards at y=0 before theme CSS settles.
    // Don't mark above-fold/unstable nodes as seen: retry after layout.
    if(visible(el)||rect.bottom<=0)return;
    tracked.add(el);
    el.style.setProperty("--n27-motion-delay",delay+"ms");
    el.style.willChange="opacity,transform";
    el.classList.add("n27-motion-target","n27-motion-pending");
    io.observe(el);
  }
  function collect(){
    if(!allowed()){
      document.querySelectorAll(".n27-motion-pending").forEach(reveal);
      document.documentElement.removeAttribute("data-n27-motion");
      return;
    }
    const stage=document.getElementById(STAGE);
    const stagger=clamp(config().stagger,0,180,70);
    if(stage){
      let idx=0;
      for(const child of stage.children){
        if(child.id==="n27-approved-hero"||child.id==="n27-approved-benefits")continue;
        observe(child,Math.min(190,(idx++%3)*stagger));
      }
      const news=document.getElementById("n27-approved-news");
      if(news){
        [...news.querySelectorAll(".n27-news__featured,.n27-news__item")]
          .forEach((card,i)=>observe(card,Math.min(180,i*stagger)));
      }
    }else{
      // Safe category / product / content-page support: never animate
      // buy buttons, quantity inputs, variation selectors, cart, or
      // Slick-controlled carousel nodes.
      const cards=[...document.querySelectorAll("#corpo .listagem-item")]
        .filter(n=>!n.closest(".slick-cloned,.slick-track,.slick-slider"));
      cards.slice(0,140).forEach((card,i)=>observe(card,Math.min(150,(i%3)*stagger)));
      const sections=[...document.querySelectorAll(
        "#corpo .produto .abas-custom, #corpo .produto .tab-content,"+
        "#corpo .produto-descricao, #corpo .produtos-relacionados,"+
        "#corpo .listagem > .titulo, #corpo .pagina-conteudo,"+
        "#corpo .secao-principal > .row-fluid"
      )];
      sections.slice(0,30).forEach((section,i)=>observe(section,Math.min(100,(i%2)*stagger)));
    }
    const footer=document.querySelector("#rodape");
    if(footer && footer.getBoundingClientRect().height>120)observe(footer,0);
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
    const root=document.getElementById(STAGE)||document.getElementById("corpo");
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
    version:"1.2.0",refresh:schedule,
    get stats(){return{
      pending:document.querySelectorAll(".n27-motion-pending").length,
      visible:document.querySelectorAll(".n27-motion-visible").length,
      reduced:reduced.matches
    };}
  };
})();


/* nichelle-endcap.js */
/*
 * Nichelle Imports 2026 — approved footer prelude v1.0
 * Layout-only newsletter; preserves LI native #barraNewsletter and AJAX
 * .newsletter-assinar action. Instagram uses the exact user LightWidget
 * iframe, without manufacturing product or Instagram content.
 * Runs only on official homepage ?nichelle_preview=1.
 */
(function(){
  "use strict";
  const PATH=(location.pathname.replace(/\/+$/,"")||"/");
  if(!/^(www\.)?nichelleimports\.com\.br$/i.test(location.hostname) ||
    PATH!=="/" || new URLSearchParams(location.search).get("nichelle_preview")!=="1")return;
  const WIDGET="https://cdn.lightwidget.com/widgets/ae2ac001588f5eba997f9106957c5d8e.html";
  const SCRIPT="https://cdn.lightwidget.com/widgets/lightwidget.js";
  let mountQueued=false,scriptRequested=false,originalTitle=null,originalSubtitle=null,originalButton=null;
  const settings=()=>{
    const n=window.Nichelle27Settings||{};
    const newsletter=n.newsletterFWR||{};
    const instagram=n.instagramWidget||{};
    return{
      newsletter:{
        ativo:newsletter.ativo!==false,
        titulo:safeText(newsletter.titulo??"Fique por dentro das novidades",90),
        subtitulo:safeText(newsletter.subtitulo??"Receba lançamentos, dicas e ofertas exclusivas.",140),
        botao:safeText(newsletter.botao??"QUERO RECEBER",28),
        placeholder:safeText(newsletter.placeholder??"Insira seu e-mail",70)
      },
      instagram:{
        ativo:instagram.ativo!==false,
        usuario:safeText(instagram.usuario??"@nichelle_imports",55),
        legenda:safeText(instagram.legenda??"ÚLTIMAS POSTAGENS",48),
        urlPerfil:safeProfile(instagram.urlPerfil??"https://www.instagram.com/nichelle_imports/"),
        widgetUrl:safeWidget(instagram.widgetUrl??WIDGET),
        capa:safeImage(instagram.capa??"https://cdn.awsli.com.br/2550/2550587/arquivos/coreana1.jpg")
      }
    };
  };
  function safeText(value,max){
    return typeof value==="string"?value.replace(/\s+/g," ").trim().slice(0,max):"";
  }
  function safeProfile(input){
    try{
      const u=new URL(input);return u.protocol==="https:"&&
        ["www.instagram.com","instagram.com"].includes(u.hostname)&&!u.username&&!u.password
        ?u.href:"https://www.instagram.com/nichelle_imports/";
    }catch(_){return"https://www.instagram.com/nichelle_imports/";}
  }
  function safeWidget(input){
    try{
      const u=new URL(input);
      return u.protocol==="https:"&&u.hostname==="cdn.lightwidget.com"&&
        /^\/widgets\/[a-f0-9]{32}\.html$/.test(u.pathname)&&!u.username&&!u.password
        ?u.href:WIDGET;
    }catch(_){return WIDGET;}
  }
  function safeImage(input){
    try{
      const u=new URL(input,location.origin);
      return u.protocol==="https:"&&!u.username&&!u.password?u.href:"";
    }catch(_){return"";}
  }
  function allowed(){
    const g=window.Nichelle27Settings?.geral;
    return g?.ativo===true && g.modoPreview===true && g.publicarNaLoja!==true;
  }
  function node(tag,cls,content){
    const n=document.createElement(tag);if(cls)n.className=cls;
    if(content!==undefined)n.textContent=content;return n;
  }
  function newsletter(config){
    const root=document.getElementById("n27-approved-newsletter");
    const native=document.getElementById("barraNewsletter");
    if(!root||!native||!root.contains(native))return;
    const title=native.querySelector(".newsletter-titulo .titulo"),
      subtitle=native.querySelector(".newsletter-titulo .texto-newsletter"),
      button=native.querySelector("button.newsletter-assinar"),
      input=native.querySelector('input[name="email"]');
    if(!title||!subtitle||!button||!input)return;
    if(originalTitle===null)originalTitle=title.innerHTML;
    if(originalSubtitle===null)originalSubtitle=subtitle.textContent;
    if(originalButton===null)originalButton=button.innerHTML;
    if(!config.ativo){
      root.removeAttribute("data-n27-newsletter");
      document.documentElement.removeAttribute("data-n27-endcap-newsletter");
      if(title.dataset.n27Text==="1"){
        title.innerHTML=originalTitle;delete title.dataset.n27Text;
      }
      if(subtitle.dataset.n27Text==="1"){
        subtitle.textContent=originalSubtitle;delete subtitle.dataset.n27Text;
      }
      if(button.dataset.n27Text==="1"){
        button.innerHTML=originalButton;delete button.dataset.n27Text;
      }
      return;
    }
    title.textContent=config.titulo;
    title.dataset.n27Text="1";
    subtitle.textContent=config.subtitulo;
    subtitle.dataset.n27Text="1";
    button.textContent=config.botao;button.dataset.n27Text="1";
    button.setAttribute("aria-label","Assinar newsletter: "+config.botao.toLowerCase());
    input.placeholder=config.placeholder;
    // No submit handler or action is replaced. LI delegated events
    // still receive clicks from this original DOM node.
    native.dataset.n27NativeAction=button.getAttribute("data-action")||"";
    root.dataset.n27Newsletter="1";
    document.documentElement.dataset.n27EndcapNewsletter="1";
  }
  function social(config){
    const root=document.getElementById("n27-approved-instagram");
    if(!root)return;
    if(!config.ativo){
      root.removeAttribute("data-n27-instagram-widget");
      document.documentElement.removeAttribute("data-n27-endcap-instagram");
      return;
    }
    const container=root.querySelector(".n27-approved-container");
    if(!container)return;
    let grid=container.querySelector(".n27-approved-instagram__grid");
    if(!grid){grid=node("div","n27-approved-instagram__grid");container.append(grid);}
    const previousURL=grid.dataset.n27WidgetUrl;
    if(grid.dataset.n27EndcapReady!=="1"||previousURL!==config.widgetUrl){
      grid.replaceChildren();
      const promo=node("a","n27-approved-instagram__brand");
      promo.href=config.urlPerfil;
      promo.target="_blank";promo.rel="noopener noreferrer";
      promo.setAttribute("aria-label","Acompanhe a Nichelle no Instagram");
      const bg=node("span","n27-approved-instagram__brand-image");
      bg.setAttribute("aria-hidden","true");
      if(config.capa)bg.style.backgroundImage='url("'+config.capa.replace(/["\\]/g,"")+'")';
      const shade=node("span","n27-approved-instagram__brand-shade");
      shade.setAttribute("aria-hidden","true");
      const contents=node("span","n27-approved-instagram__brand-copy");
      const svg=document.createElementNS("http://www.w3.org/2000/svg","svg");
      svg.setAttribute("viewBox","0 0 24 24");
      svg.setAttribute("aria-hidden","true");svg.setAttribute("fill","none");
      svg.setAttribute("stroke","currentColor");svg.setAttribute("stroke-width","1.85");
      svg.setAttribute("stroke-linecap","round");svg.setAttribute("stroke-linejoin","round");
      for(const data of [["rect",{x:"2",y:"2",width:"20",height:"20",rx:"5"}],
                          ["circle",{cx:"12",cy:"12",r:"4"}],
                          ["circle",{cx:"17.5",cy:"6.5",r:".85",fill:"currentColor",stroke:"none"}]]){
        const x=document.createElementNS("http://www.w3.org/2000/svg",data[0]);
        Object.entries(data[1]).forEach(([k,v])=>x.setAttribute(k,v));svg.append(x);
      }
      contents.append(svg,node("strong","n27-approved-instagram__handle",config.usuario),
        node("small","n27-approved-instagram__caption",config.legenda));
      promo.append(bg,shade,contents);
      const embed=node("div","n27-approved-instagram__embed");
      embed.setAttribute("aria-label","Últimas publicações do Instagram Nichelle Imports");
      const frame=node("iframe","lightwidget-widget n27-approved-instagram__iframe");
      frame.title="Últimas publicações da Nichelle Imports no Instagram";
      frame.src=config.widgetUrl;frame.loading="lazy";frame.scrolling="no";
      frame.setAttribute("allowtransparency","true");frame.referrerPolicy="strict-origin-when-cross-origin";
      frame.style.cssText="width:100%;border:0;overflow:hidden;";
      embed.append(frame);
      grid.append(promo,embed);
      grid.dataset.n27EndcapReady="1";
      grid.dataset.n27WidgetUrl=config.widgetUrl;
    }
    const promo=grid.querySelector(".n27-approved-instagram__brand");
    if(promo){
      promo.href=config.urlPerfil;
      const handle=promo.querySelector(".n27-approved-instagram__handle");
      const label=promo.querySelector(".n27-approved-instagram__caption");
      const photo=promo.querySelector(".n27-approved-instagram__brand-image");
      if(handle)handle.textContent=config.usuario;
      if(label)label.textContent=config.legenda;
      if(photo)photo.style.backgroundImage=config.capa
        ?'url("'+config.capa.replace(/["\\]/g,"")+'")':"none";
    }
    root.dataset.n27InstagramWidget="1";
    document.documentElement.dataset.n27EndcapInstagram="1";
    // The vendor's official embed JS resizes the iframe and handles
    // the four-item slideshow. Include it once, after the iframe exists.
    if(!document.querySelector('script[src="'+SCRIPT+'"]')){
      if(!scriptRequested){
        scriptRequested=true;
        const script=node("script");script.src=SCRIPT;script.async=true;
        script.dataset.n27Lightwidget="1";document.head.append(script);
      }
    }
    document.dispatchEvent(new Event("nichelle27:motion:refresh"));
  }
  function mount(){
    if(!allowed())return;
    const config=settings();
    newsletter(config.newsletter);
    social(config.instagram);
  }
  function schedule(){
    if(mountQueued)return;
    mountQueued=true;setTimeout(()=>{mountQueued=false;mount();},90);
  }
  if(document.readyState==="loading")document.addEventListener("DOMContentLoaded",mount,{once:true});
  else mount();
  window.addEventListener("load",mount,{once:true});
  [260,880,2100,3900].forEach(t=>setTimeout(mount,t));
  ["nichelle27:refresh","nichelle27:endcap:update"].forEach(evt=>
    document.addEventListener(evt,schedule));
  window.NichelleEndcap={version:"1.0.0",refresh:schedule};
})();


/* nichelle-footer.js */
/*
 * NICHELLE IMPORTS 2026 — FWR institutional footer v1.0
 * Preview-only. New visual structure, native LI data and interactions intact.
 * No JS business logic is rewritten: login, order URLs, contact modals, stamps,
 * payments and shipping sources remain in the platform's original DOM.
 */
(function () {
  "use strict";
  const id="n27-fwr-footer";
  const preview=new URLSearchParams(location.search).get("nichelle_preview")==="1";
  const host=/^(www\.)?nichelleimports\.com\.br$/i.test(location.hostname);
  const path=location.pathname.replace(/\/+$/,"")||"/";
  const restricted=/^\/(?:checkout|finalizar-pedido)(?:\/|$)/i.test(path);
  if(!host||!preview||restricted)return;

  const defaultPhoto="https://cdn.awsli.com.br/2550/2550587/arquivos/rodape.png";
  // A marca do topo e a fonte oficial primaria para o espaco marcado.
  const storefrontLogo="https://cdn.awsli.com.br/400x300/2550/2550587/logo/logo-nichelle-loja-integrada-600-13zuqalvp1.png";
  const defaultLogo=storefrontLogo;
  const legacyFooterLogo="https://cdn.awsli.com.br/2550/2550587/arquivos/logo-footer.png";
  let lastKey="",retries=0,observer=null,pending=false;

  function text(value,max=1000){
    return typeof value==="string"?value.replace(/\s+/g," ").trim().slice(0,max):"";
  }
  function node(tag,cls,content){
    const n=document.createElement(tag);
    if(cls)n.className=cls;
    if(content!==undefined)n.textContent=content;
    return n;
  }
  function setting(){
    const s=window.Nichelle27Settings?.rodapeFWR||{};
    let inline=null;
    const tag=document.getElementById("n27-rodape-json");
    if(tag)try{inline=JSON.parse(tag.textContent);}catch(e){console.warn("[Nichelle Rodapé] JSON inválido",e);}
    const x=inline&&typeof inline==="object"&&!Array.isArray(inline)?inline:s;
    return {
      ativo:x.ativo!==false,
      logo:secureImage(x.logo||defaultLogo),
      imagem:secureImage(x.imagem||defaultPhoto),
      textoComplementar:text(x.textoComplementar??"Beleza, cuidados pessoais e as últimas tendências em produtos importados.",220),
      tituloInstitucional:text(x.tituloInstitucional??"Institucional",50),
      tituloConta:text(x.tituloConta??"Área do Cliente",50),
      tituloAtendimento:text(x.tituloAtendimento??"Atendimento",50),
      tituloSeguranca:text(x.tituloSeguranca??"Compra Segura",50),
      tituloPagamento:text(x.tituloPagamento??"Formas de Pagamento",50),
      tituloEnvios:text(x.tituloEnvios??"Formas de envio",50),
      mostrarEnvios:x.mostrarEnvios!==false,
      mostrarFWR:x.mostrarFWR!==false
    };
  }
  function enabled(){
    const g=window.Nichelle27Settings?.geral;
    return g?.ativo===true&&g.modoPreview===true&&g.publicarNaLoja!==true;
  }
  function secureImage(raw){
    try{
      const u=new URL(raw,location.href);
      return u.protocol==="https:"&&!u.username&&!u.password?u.href:"";
    }catch(_){return"";}
  }
  function secureHref(raw) {
    try{
      const u=new URL(raw,location.origin);
      if(u.protocol==="tel:"||u.protocol==="mailto:")return u.href;
      if(u.protocol!=="https:"&&u.protocol!=="http:")return"";
      if(u.protocol==="http:"&&u.hostname!=="www.google.com")return"";
      if(u.username||u.password)return"";
      return u.href;
    }catch(_){return"";}
  }
  function sourceLink(source){
    if(!source)return null;
    const href=source.getAttribute("href")||"";
    if(href==="#modalContato"||href==="#enderecoModal")
      return {href:"#",source};
    const url=secureHref(href);
    return url?{href:url,source}:null;
  }
  function copyLink(item,cls,override){
    if(!item)return null;
    const anchor=node("a",cls||"");
    anchor.textContent=text(override||item.source?.textContent||"",90);
    anchor.href=item.href;
    if(item.href==="#"){
      anchor.setAttribute("role","button");
      anchor.addEventListener("click",e=>{
        e.preventDefault();
        if(item.source?.isConnected)item.source.click();
      });
    }else if(!item.href.startsWith(location.origin)&&!item.href.startsWith("tel:")&&!item.href.startsWith("mailto:")){
      anchor.target="_blank";
      anchor.rel="noopener noreferrer";
    }
    return anchor;
  }
  function pickLink(root,regexp){
    return [...(root?.querySelectorAll("a[href]")||[])].find(a=>
      regexp.test(text(a.textContent+" "+(a.getAttribute("title")||"")+
        " "+(a.getAttribute("aria-label")||""),180)));
  }
  function addLink(list,source,label){
    const l=copyLink(sourceLink(source),"",label);
    if(!l||!l.textContent)return;
    const li=node("li");li.append(l);list.append(li);
  }
  function icon(kind){
    // FWR outline icons (no dependence on Groom iconfont).
    const p={
      phone:["M22 16.9v3a2 2 0 0 1-2.2 2A19.6 19.6 0 0 1 2.1 4.2 2 2 0 0 1 4.1 2h3a2 2 0 0 1 2 1.7l.6 3a2 2 0 0 1-.6 1.8L7.5 12a16 16 0 0 0 4.5 4.5l1.5-1.7a2 2 0 0 1 1.8-.6l3 .6A2 2 0 0 1 20 16.9h2"],
      whatsapp:["M21 11.5a8.7 8.7 0 0 1-12.8 7.7L3 21l1.8-5.2A8.7 8.7 0 1 1 21 11.5Z","M8.8 8.2c-.3 3.8 3.4 7.5 7.2 7.1"],
      mail:["M3 5h18v14H3z","m3 6 9 7 9-7"],
      clock:["M12 22a10 10 0 1 0 0-20 10 10 0 0 0 0 20Z","M12 6v6l4 2"],
      address:["M20 10c0 5-8 12-8 12S4 15 4 10a8 8 0 1 1 16 0Z","M12 12a2.4 2.4 0 1 0 0-4.8 2.4 2.4 0 0 0 0 4.8Z"]
    }[kind]||[];
    const svg=document.createElementNS("http://www.w3.org/2000/svg","svg");
    svg.setAttribute("viewBox","0 0 24 24");
    svg.setAttribute("aria-hidden","true");
    svg.setAttribute("fill","none");svg.setAttribute("stroke","currentColor");
    svg.setAttribute("stroke-width","1.7");svg.setAttribute("stroke-linecap","round");svg.setAttribute("stroke-linejoin","round");
    p.forEach(d=>{
      const path=document.createElementNS("http://www.w3.org/2000/svg","path");
      path.setAttribute("d",d);svg.append(path);
    });
    return svg;
  }
  function labeledColumn(heading,cls){
    const section=node("section","n27-foot__column "+(cls||""));
    section.append(node("h3","n27-foot__title",heading));
    return section;
  }
  function nativeData(root){
    const base=root.querySelector(".institucional");
    const institution=base?.querySelector("#rodape-institucional");
    const about=base?.querySelector("#rodape-sobre");
    const atendimento=base?.querySelector("#rodape-atendimento");
    const payment=root.querySelector("#rodape-pagamento");
    const security=root.querySelector("#rodape-selos");
    const shipping=root.querySelector("#rodape-envios");
    const copy=root.querySelector(".rodape-inferior .rodape-dados p");
    const logo=about?.querySelector(".logo img");
    const aboutText=about?.querySelector(":scope > span p")||about?.querySelector("p");
    const address=about?.querySelector(".rodape-endereco button");
    const cards=[...root.querySelectorAll("#rodape-pagamento .bandeiras-pagamento li")];
    const gateways=[...root.querySelectorAll("#rodape-pagamento .gateways-rodape li")];
    const shields=[...root.querySelectorAll("#rodape-selos img")];
    const sLinks=[...root.querySelectorAll("#rodape-selos a[href]")];
    return {base,institution,about,atendimento,payment,security,shipping,
      copy,logo,aboutText,address,cards,gateways,shields,sLinks};
  }
  function institutional(data,cfg){
    const n=labeledColumn(cfg.tituloInstitucional,"n27-foot__institutional");
    const list=node("ul","n27-foot__links");
    const root=data.institution;
    [
      [/quem somos|sobre n[oó]s/i,"Sobre Nós"],
      [/pagamento e envio|frete|entrega/i,"Frete & Entrega"],
      [/trocas|devolu[cç][oõ]es/i,"Trocas & Devoluções"],
      [/pol[ií]tica de privacidade/i,"Política de Privacidade"],
      [/termos de uso/i,"Termos de Uso"],
      [/blog/i,"Blog"]
    ].forEach(([pattern,label])=>addLink(list,pickLink(root,pattern),label));
    n.append(list);return n;
  }
  function account(cfg,data){
    const n=labeledColumn(cfg.tituloConta,"n27-foot__account");
    const list=node("ul","n27-foot__links");
    const header=document.querySelector("#cabecalho");
    [
      [/minha conta/i,"Minha Conta"],
      [/meus pedidos/i,"Meus Pedidos"],
      [/cadastrar|cadastre-se/i,"Cadastre-se"]
    ].forEach(([pattern,label])=>addLink(list,pickLink(header,pattern),label));
    const contact=pickLink(data.institution,/fale conosco/i);
    addLink(list,contact,"Fale Conosco");
    n.append(list);return n;
  }
  function contact(cfg,data){
    const n=labeledColumn(cfg.tituloAtendimento,"n27-foot__contact");
    const info=node("ul","n27-foot__contact-list");
    const add=(type,link,label,description)=>{
      if(!link)return;
      const href=sourceLink(link),a=copyLink(href,"n27-foot__contact-link",label||text(link.textContent,100));
      if(!a)return;
      const li=node("li","n27-foot__contact-item");
      li.append(icon(type));
      const wrapper=node("span","n27-foot__contact-copy");wrapper.append(a);
      if(description)wrapper.append(node("small","",description));
      li.append(wrapper);info.append(li);
    };
    add("whatsapp",data.atendimento?.querySelector('a[href^="https://wa.me/"]'));
    add("mail",data.atendimento?.querySelector('a[href^="mailto:"]'));
    const hour=[...(data.atendimento?.querySelectorAll(".a-block")||[])]
      .find(x=>/hor[aá]rio/i.test(x.textContent));
    if(hour){
      const li=node("li","n27-foot__contact-item n27-foot__contact-hours");
      li.append(icon("clock"));
      const span=node("span","n27-foot__contact-copy");
      span.append(node("span","",text(hour.textContent,125).replace(/^Hor[aá]rio de atendimento\\s*/i,"")));
      li.append(span);info.append(li);
    }
    // Keep available voice/telephone number if not already in WhatsApp.
    if(!info.querySelector('a[href^="https://wa.me/"]'))
      add("phone",data.atendimento?.querySelector('a[href^="tel:"]'));
    if(data.address){
      const li=node("li","n27-foot__contact-item n27-foot__contact-address");
      li.append(icon("address"));
      const wrapper=node("span","n27-foot__contact-copy");
      const button=node("button","n27-foot__address-button","Onde estamos");
      button.type="button";
      button.addEventListener("click",()=>{if(data.address.isConnected)data.address.click();});
      wrapper.append(button);
      const addressText=text(data.address.querySelector(".onde-estamos .b")?.textContent||"",130);
      if(addressText)wrapper.append(node("small","",addressText));
      li.append(wrapper);info.append(li);
    }
    n.append(info);
    const socialLinks=[...(document.querySelectorAll("#rodape-social .lista-redes a[href]")||[])];
    if(socialLinks.length){
      const social=node("div","n27-foot__social");
      social.append(node("span","n27-foot__social-title","Redes sociais"));
      for(const a of socialLinks){
        const label=/instagram/i.test(a.href)?"Instagram":/facebook/i.test(a.href)?"Facebook":"Rede social";
        const link=copyLink(sourceLink(a),"n27-foot__social-link",label);
        if(link)social.append(link);
      }
      n.append(social);
    }
    return n;
  }
  function security(cfg,data){
    const n=labeledColumn(cfg.tituloSeguranca,"n27-foot__security");
    const list=node("div","n27-foot__seals");
    const seen=new Set();
    const candidate=[...data.shields].filter(i=>/(site seguro|google|reclame)/i.test(i.alt||i.src));
    for(const img of candidate){
      const src=secureImage(img.currentSrc||img.src);
      if(!src||seen.has(src))continue;
      seen.add(src);
      const wrapper=node("span","n27-foot__seal");
      const clone=node("img");clone.src=src;clone.alt=text(img.alt,70)||"Selo de segurança";
      clone.loading="lazy";clone.decoding="async";wrapper.append(clone);
      list.append(wrapper);
    }
    // Keep the existing, platform-verified RA destination without inventing
    // an approval status if its third-party badge doesn't load.
    const ra=data.sLinks.find(a=>/reclame aqui/i.test((a.title||"")+" "+(a.href||"")));
    if(ra){
      const href=sourceLink(ra);
      if(href){
        const badge=copyLink(href,"n27-foot__ra","Reclame AQUI");
        badge.title=ra.title||"Consultar Reclame AQUI";
        list.append(badge);
      }
    }
    n.append(list);return n;
  }
  function payments(cfg,data){
    const n=labeledColumn(cfg.tituloPagamento,"n27-foot__payments");
    const list=node("ul","n27-foot__payment-list");
    // Copy only logos/icons. Native payment and checkout scripts remain
    // untouched and are NEVER replaced by FWR elements.
    for(const li of data.cards){
      const child=li.querySelector(".icone-pagamento");
      if(!child)continue;
      const copy=node("li","n27-foot__payment");
      const iconNode=child.cloneNode(false);
      iconNode.removeAttribute("id");
      copy.append(iconNode);list.append(copy);
    }
    for(const li of data.gateways){
      const img=li.querySelector("img");
      const src=secureImage(img?.getAttribute("src")||"");
      if(!src)continue;
      const wrapper=node("li","n27-foot__payment n27-foot__payment--pix");
      const image=node("img");image.src=src;image.alt=text(img.alt,80)||"Forma de pagamento";
      image.loading="lazy";wrapper.append(image);list.append(wrapper);
    }
    n.append(list);return n;
  }
  function shipping(cfg,data){
    if(!cfg.mostrarEnvios)return null;
    const native=data.shipping;
    const imgs=[...(native?.querySelectorAll("img")||[])];
    if(!imgs.length)return null;
    const n=labeledColumn(cfg.tituloEnvios,"n27-foot__shipping");
    const wrap=node("div","n27-foot__shipping-logos");
    imgs.forEach(original=>{
      const url=secureImage(original.getAttribute("src"));
      if(!url)return;
      const im=node("img");im.src=url;im.alt=text(original.alt,65)||"Transportadora";
      im.loading="lazy";wrap.append(im);
    });
    if(!wrap.children.length)return null;
    n.append(wrap);return n;
  }
  // Substitui somente o credito do DESENVOLVEDOR Groom pelo da FWR.
  // Preserva completamente a marca e o link "Plataforma: Loja Integrada".
  // A busca e limitada ao rodape nativo; nunca altera links em vitrine/checkout.
  // A assinatura Groom pode estar dentro OU fora de #rodape, e pode ser
  // um link, uma imagem sem link ou apenas um texto curto. Modificar somente
  // a marca do desenvolvedor, preservando o crédito Loja Integrada.
  function syncAgencyCredit(){
    if(!document.getElementById("rodape"))return;
    const src="https://cdn.awsli.com.br/2550/2550587/arquivos/fwr-agencia-digital.svg";
    const agency="https://fwragenciadigital.com.br/";
    const mark=/groom(?:b)?/i;
    const creditContext=
      "footer,#rodape,.rodape-inferior,[class*='rodape'],[class*='footer'],"+
      "[class*='assinatura'],[class*='credito'],[class*='credit']";
    const nodes=[
      ...document.querySelectorAll("a[href],img[src],span,strong,small,b")
    ];
    const targets=new Set();
    for(const element of nodes){
      if(element.closest("#"+id))continue;
      const relevantRegion=element.closest(creditContext);
      const nearby=(element.parentElement?.parentElement?.textContent||"").slice(0,260);
      if(!relevantRegion&&!/desenvolvimento\s*:/i.test(nearby))continue;
      // Evitar qualquer troca na coluna Plataforma / Loja Integrada.
      if(/plataforma/i.test(element.closest("a")?.getAttribute("aria-label")||""))continue;
      let match=false;
      if(element.matches("a[href]")){
        const href=element.getAttribute("href")||"";
        const image=element.querySelector("img");
        match=mark.test(href)||mark.test(image?.getAttribute("src")||"")||
          mark.test(image?.getAttribute("alt")||"")||
          /^groom(?:b)?$/i.test((element.textContent||"").trim());
      }else if(element.matches("img[src]")){
        match=mark.test(element.getAttribute("src")||"")||
          mark.test(element.getAttribute("alt")||"");
      }else{
        match=/^groom(?:b)?$/i.test((element.textContent||"").trim());
      }
      if(!match)continue;
      const anchor=element.matches("a[href]")?element:element.closest("a[href]");
      targets.add(anchor&&anchor!==document.querySelector("#"+id+" .n27-foot__agency")?
        anchor:element);
    }
    for(const target of targets){
      if(!target.isConnected)continue;
      const alreadyAnchor=target.matches("a[href]");
      const link=alreadyAnchor?target:node("a");
      const logo=node("img");
      logo.src=src;
      logo.alt="FWR Agência Digital";
      logo.width=95;logo.height=32;
      logo.loading="lazy";logo.decoding="async";
      link.replaceChildren(logo);
      link.href=agency;
      link.target="_blank";
      link.rel="noopener noreferrer";
      link.classList.add("n27-foot__agency--native-credit");
      link.setAttribute("aria-label","Desenvolvimento: FWR Agência Digital");
      link.title="FWR Agência Digital";
      if(!alreadyAnchor)target.replaceWith(link);
    }
    const visible=[...document.querySelectorAll("a.n27-foot__agency--native-credit")]
      .some(link=>typeof link.getClientRects==="function"?
        link.getClientRects().length>0:true);
    if(visible)document.documentElement.dataset.n27AgencyCredit="native";
    else delete document.documentElement.dataset.n27AgencyCredit;
  }
  function render(data,cfg){
    const root=document.getElementById("rodape");
    const current=document.getElementById(id);
    if(!cfg.ativo || !data.base || !data.about || !data.institution || !data.payment){
      current?.remove();
      root?.removeAttribute("data-n27-fwr-ready");
      delete document.documentElement.dataset.n27FwrFooter;
      root?.querySelector(".rodape-inferior")?.style.removeProperty("display");
      lastKey="";return;
    }
    const originalLogo=secureImage(data.logo?.getAttribute("src")||"");
    const logo=cfg.logo||originalLogo||defaultLogo;
    const desc=text(data.aboutText?.textContent||"",800);
    const legal=text(data.copy?.textContent||data.copy?.parentElement?.textContent||"",260);
    const sig=JSON.stringify([cfg,logo,desc,legal,
      [...data.institution.querySelectorAll("a[href]")].map(a=>[a.textContent,a.href]),
      data.cards.length,data.gateways.length,data.shields.length,
      [...document.querySelectorAll("#rodape-social a[href]")].map(a=>a.href)]);
    if(current?.parentElement===root&&sig===lastKey){
      syncAgencyCredit();
      return;
    }

    const section=node("div","n27-foot");
    section.id=id;section.dataset.n27Version="1.1.0";
    section.setAttribute("role","contentinfo");
    // The original #rodape stays mounted and its source DOM is not deleted.
    const top=node("div","n27-foot__top");
    const topInner=node("div","n27-foot__top-inner");
    const logoLink=node("a","n27-foot__logo");
    logoLink.href=sourceLink(data.about.querySelector(".logo a"))?.href||"/";
    const logoImg=node("img");
    logoImg.alt="Nichelle Imports";
    logoImg.width=280;logoImg.height=66;
    logoImg.decoding="async";
    logoImg.loading="eager";
    // A arte principal do rodape e mantida; caso nao exista mais no CDN,
    // recupera o logotipo original da Loja Integrada ou o usado no topo FWR.
    const logoSources=[logo,originalLogo,
      document.querySelector("#n27-independent-header .n27-owned-logo img")?.src,
      document.querySelector("#cabecalho .logo img")?.src,
      storefrontLogo,legacyFooterLogo].map(secureImage).filter((url,index,items)=>url&&items.indexOf(url)===index);
    let logoSourceIndex=0;
    logoImg.addEventListener("error",()=>{
      logoSourceIndex++;
      if(logoSourceIndex<logoSources.length){
        logoImg.src=logoSources[logoSourceIndex];
      } else {
        logoImg.remove();
        const fallback=node("span","n27-foot__logo-label","NICHELLE IMPORTS");
        logoLink.append(fallback);
      }
    });
    logoImg.src=logoSources[0]||storefrontLogo;
    logoLink.append(logoImg);
    const about=node("div","n27-foot__about");
    about.append(node("p","n27-foot__about-main",desc));
    if(cfg.textoComplementar)about.append(node("p","n27-foot__about-small",cfg.textoComplementar));
    topInner.append(logoLink,about);top.append(topInner);
    const panel=node("div","n27-foot__panel");
    const image=node("div","n27-foot__art");
    image.setAttribute("aria-hidden","true");
    if(cfg.imagem)image.style.backgroundImage='url("'+cfg.imagem.replace(/["\\]/g,"")+'")';
    const content=node("div","n27-foot__content");
    const columns=node("div","n27-foot__columns");
    // Pagamentos e transportadoras pertencem à mesma coluna da
    // segurança, sem alterar a origem nativa dos selos e das imagens.
    const securityColumn=security(cfg,data);
    const paymentWrap=node("div","n27-foot__details");
    paymentWrap.append(payments(cfg,data));
    const ship=shipping(cfg,data);if(ship)paymentWrap.append(ship);
    securityColumn.append(paymentWrap);
    columns.append(institutional(data,cfg),account(cfg,data),
      contact(cfg,data),securityColumn);
    const bottom=node("div","n27-foot__bottom");
    bottom.append(node("small","n27-foot__legal",legal));
    if(cfg.mostrarFWR){
      const link=node("a","n27-foot__agency");
      link.href="https://fwragenciadigital.com.br/";
      link.target="_blank";link.rel="noopener noreferrer";
      link.setAttribute("aria-label","Desenvolvimento: FWR Agência Digital");
      link.title="FWR Agência Digital";
      const img=node("img");
      img.src="https://cdn.awsli.com.br/2550/2550587/arquivos/fwr-agencia-digital.svg";
      img.alt="FWR Agência Digital";
      img.width=92;img.height=44;img.loading="lazy";img.decoding="async";
      link.append(img);bottom.append(link);
    }
    content.append(columns,bottom);
    panel.append(image,content);
    section.append(top,panel);
    root.insertBefore(section,root.firstChild);
    current?.remove();
    root.dataset.n27FwrReady="1";
    document.documentElement.dataset.n27FwrFooter="1";
    // Hide only the legacy copyright surface. Preserve its DOM and text;
    // Groom can force display:block so a scoped inline override is needed.
    root.querySelector(".rodape-inferior")?.style.setProperty("display","none","important");
    syncAgencyCredit();
    lastKey=sig;
    document.dispatchEvent(new Event("nichelle27:motion:refresh"));
  }
  function mount(){
    if(!enabled())return;
    const root=document.getElementById("rodape");
    if(!root)return;
    const cfg=setting();
    const data=nativeData(root);
    render(data,cfg);
    if(!observer){
      observer=new MutationObserver(schedule);
      // Watch only the original footer sources; FWR panel is isolated.
      ["#rodape-sobre","#rodape-atendimento","#rodape-institucional",
       "#rodape-pagamento","#rodape-selos","#rodape-envios",
       ".rodape-inferior","#rodape-social"].forEach(selector=>{
        const target=root.querySelector(selector);
        if(target)observer.observe(target,{childList:true,subtree:true,characterData:true});
      });
    }
  }
  function schedule(){
    if(pending)return;
    pending=true;setTimeout(()=>{pending=false;mount();},130);
  }
  if(document.readyState==="loading")document.addEventListener("DOMContentLoaded",schedule,{once:true});
  else schedule();
  window.addEventListener("load",schedule,{once:true});
  [200,650,1400,2600,4500].forEach(delay=>setTimeout(schedule,delay));
  ["nichelle27:refresh","nichelle27:rodape:update"].forEach(evt=>document.addEventListener(evt,()=>{
    lastKey="";schedule();
  }));
  window.NichelleFooter={version:"1.2.0",refresh:schedule,source:"loja-integrada-native"};
})();


/* nichelle-cart-drawer.js */
/*
 * NICHELLE 2026 — FWR Cart Drawer v1.0
 * Preview-only, native Loja Integrada source of truth:
 * GET /carrinho/index returns authoritative rows/subtotal.
 * The site's /carrinho/minicart endpoint is not reliable for this store.
 * Mutations use the EXACT hrefs generated by LI in each cart row.
 * Order bumps use actual products, never fictitious values.
 */
(function(){
"use strict";
const params=new URLSearchParams(location.search);
if(!/^(www\.)?nichelleimports\.com\.br$/i.test(location.hostname)||
   params.get("nichelle_preview")!=="1"||
   /^\/(?:checkout|carrinho|finalizar-pedido)(?:\/|$)/i.test(location.pathname))return;
if(window.NichelleCartDrawer?.version)return;
const SID="n27-cart-drawer";
let root,panel,itemsBox,totalLabel,quantityLabel,offersBox,messageBox,closeBtn,trigger=null,
    opened=false,mutating=false,loading=false,latestToken=0,offersCache=null,
    cartState={items:[],subtotal:0,quantity:0},lastSuggested=[],
    previousOverflow="",ignoreNativeUntil=0,ready=false,lastRefresh=0;
const MAX_QUANTITY=99;
function txt(value,max=180){return typeof value==="string"?value.replace(/\s+/g," ").trim().slice(0,max):"";}
function el(tag,cls,value){const n=document.createElement(tag);if(cls)n.className=cls;if(value!==undefined)n.textContent=value;return n;}
function settings(){
 const o=window.Nichelle27Settings?.carrinhoFWR||{};
 return {ativo:o.ativo!==false,orderBump:o.orderBump!==false,
   maxOfertas:Math.max(0,Math.min(4,o.maxOfertas===undefined?3:Number(o.maxOfertas)||0)),
   titulo:txt(o.titulo??"Meu carrinho",65),
   subtitulo:txt(o.subtitulo??"Confira os produtos antes de finalizar.",90),
   ofertasTitulo:txt(o.ofertasTitulo??"Aproveite e leve também",90),
   finalizar:txt(o.finalizar??"VER CARRINHO E FINALIZAR",55),
   continuar:txt(o.continuar??"Continuar comprando",55),
   origemOfertas:typeof o.origemOfertas==="string"?o.origemOfertas:"catálogo",
   mostrarParcelamento:o.mostrarParcelamento!==false};
}
function allowed(){
 const s=window.Nichelle27Settings?.geral;
 return s?.ativo===true&&s.modoPreview===true&&s.publicarNaLoja!==true&&settings().ativo;
}
function url(src,internalOnly=true){
 try{
  const v=new URL(src,location.origin);
  if(v.protocol!=="https:"||v.username||v.password)return"";
  if(internalOnly&&v.origin!==location.origin)return"";
  return v.href;
 }catch(_){return"";}
}
function money(value){
 const n=Number(value);
 return Number.isFinite(n)?n.toLocaleString("pt-BR",{style:"currency",currency:"BRL"}):"R$ 0,00";
}
function moneyNumber(raw){
 const s=txt(raw,75).replace(/[^\d.,-]/g,"");
 if(!s)return NaN;
 const comma=s.lastIndexOf(","),dot=s.lastIndexOf(".");
 if(comma>dot)return Number(s.replace(/\./g,"").replace(",","."));
 return Number(s.replace(/,/g,""));
}
function icon(name){
 const data={
  close:'M18 6 6 18 M6 6l12 12',
  trash:'M3 6h18 M8 6V4h8v2 M6 6l1 15h10l1-15 M10 10v7 M14 10v7',
  plus:'M12 5v14 M5 12h14',
  minus:'M5 12h14',
  bag:'M3 7h18l-1.5 14h-15L3 7z M8 8V6a4 4 0 0 1 8 0v2',
  shield:'M12 2 4 6v6c0 5 3.5 8 8 10 4.5-2 8-5 8-10V6l-8-4z M9 12l2 2 4-4',
  refresh:'M20 4v6h-6 M4 20v-6h6 M19 9a7 7 0 0 0-12-3 M5 15a7 7 0 0 0 12 3',
  right:'M5 12h14m-6-6 6 6-6 6'
 }[name]||"";
 const svg=document.createElementNS("http://www.w3.org/2000/svg","svg");
 svg.setAttribute("viewBox","0 0 24 24");
 svg.setAttribute("aria-hidden","true");
 svg.setAttribute("fill","none");svg.setAttribute("stroke","currentColor");
 svg.setAttribute("stroke-width","1.8");svg.setAttribute("stroke-linecap","round");
 svg.setAttribute("stroke-linejoin","round");
 data.split(" M").forEach((d,i)=>{
  const path=document.createElementNS("http://www.w3.org/2000/svg","path");
  path.setAttribute("d",i?"M"+d:d);svg.append(path);
 });
 return svg;
}
function button(cls,label,fn,iconName){
 const b=el("button",cls);
 b.type="button";
 if(iconName)b.append(icon(iconName));
 if(label)b.append(el("span","",label));
 if(fn)b.addEventListener("click",fn);
 return b;
}
function svgIconFrom(name){return icon(name);}
function renderShell(){
 if(root)return;
 root=el("div","n27-cart");root.id=SID;root.hidden=true;
 root.setAttribute("aria-hidden","true");
 const backdrop=button("n27-cart__backdrop","",close);
 backdrop.setAttribute("aria-label","Fechar carrinho lateral");
 backdrop.setAttribute("tabindex","-1");
 panel=el("aside","n27-cart__panel");
 panel.setAttribute("role","dialog");panel.setAttribute("aria-modal","true");
 panel.setAttribute("aria-labelledby","n27-cart-title");
 panel.setAttribute("aria-describedby","n27-cart-subtitle");
 const header=el("header","n27-cart__head");
 const brand=el("div","n27-cart__brand","NICHELLE IMPORTS");
 const heading=el("h2","n27-cart__title",settings().titulo);heading.id="n27-cart-title";
 const subtitle=el("p","n27-cart__subtitle",settings().subtitulo);subtitle.id="n27-cart-subtitle";
 closeBtn=button("n27-cart__close","",close,"close");
 closeBtn.setAttribute("aria-label","Fechar carrinho");
 const headingWrap=el("div","n27-cart__heading");
 headingWrap.append(brand,heading,subtitle);header.append(headingWrap,closeBtn);
 const body=el("div","n27-cart__body");
 const line=el("div","n27-cart__items-label");
 quantityLabel=el("span","", "Produtos no carrinho");
 line.append(quantityLabel);
 itemsBox=el("div","n27-cart__items");itemsBox.setAttribute("aria-live","polite");itemsBox.setAttribute("aria-relevant","additions text");
 const offers=el("section","n27-cart__offers");
 offers.setAttribute("aria-label","Sugestões de produtos");
 offers.append(el("h3","n27-cart__offers-title",settings().ofertasTitulo));
 offersBox=el("div","n27-cart__offer-list");offers.append(offersBox);
 body.append(line,itemsBox,offers);
 const foot=el("footer","n27-cart__foot");
 const total=el("div","n27-cart__total");
 total.append(el("span","n27-cart__total-label","Subtotal dos produtos"));
 totalLabel=el("strong","n27-cart__total-value","R$ 0,00");
 total.append(totalLabel);
 const info=el("div","n27-cart__info");info.append(svgIconFrom("shield"),
  el("span","","Pagamento, descontos e frete confirmados na Loja Integrada."));
 messageBox=el("p","n27-cart__feedback");messageBox.id="n27-cart-feedback";
 messageBox.setAttribute("role","status");messageBox.hidden=true;
 const checkout=el("a","n27-cart__checkout",settings().finalizar);
 checkout.href="/carrinho/index";checkout.id="n27-cart-checkout";
 checkout.append(icon("right"));
 const continueBtn=button("n27-cart__continue",settings().continuar,close);
 foot.append(total,info,messageBox,checkout,continueBtn);
 panel.append(header,body,foot);root.append(backdrop,panel);document.body.append(root);
 root.addEventListener("keydown",e=>{
  if(e.key!=="Tab")return;
  const focusable=[...panel.querySelectorAll('a[href],button:not([disabled]),input:not([disabled])')]
   .filter(n=>!n.closest('[hidden]')&&getComputedStyle(n).display!=="none");
  if(!focusable.length)return;
  const first=focusable[0],last=focusable[focusable.length-1];
  if(e.shiftKey&&document.activeElement===first){e.preventDefault();last.focus();}
  else if(!e.shiftKey&&document.activeElement===last){e.preventDefault();first.focus();}
 });
}
function alertMessage(value,type){
 if(!messageBox)return;
 const v=txt(value,250);
 messageBox.textContent=v;
 messageBox.hidden=!v;
 messageBox.dataset.type=type||"info";
}
function browserFocusKey(e){if(e.key==="Escape"&&opened){e.preventDefault();close();}}
function close(){
 if(!root||!opened)return;
 opened=false;
 root.hidden=true;root.setAttribute("aria-hidden","true");
 document.documentElement.classList.remove("n27-cart-open");
 document.body.style.overflow=previousOverflow;
 document.removeEventListener("keydown",browserFocusKey,true);
 if(trigger?.isConnected)trigger.focus({preventScroll:true});
 trigger=null;
}
function open(clicked){
 if(!allowed())return;
 renderShell();
 if(!opened){
  trigger=clicked||document.activeElement;
  opened=true;
  root.hidden=false;root.setAttribute("aria-hidden","false");
  previousOverflow=document.body.style.overflow;
  document.body.style.overflow="hidden";
  document.documentElement.classList.add("n27-cart-open");
  document.addEventListener("keydown",browserFocusKey,true);
  closeBtn.focus({preventScroll:true});
 }
 const opts=settings();
 panel.querySelector(".n27-cart__title").textContent=opts.titulo;
 panel.querySelector(".n27-cart__subtitle").textContent=opts.subtitulo;
 panel.querySelector(".n27-cart__offers-title").textContent=opts.ofertasTitulo;
 panel.querySelector(".n27-cart__checkout").firstChild.textContent=opts.finalizar;
 panel.querySelector(".n27-cart__continue span").textContent=opts.continuar;
 loadCart();
}
function parseCart(doc){
 const records=[...doc.querySelectorAll(".tabela-carrinho tr[data-produto-id]")];
 const items=[];
 for(const row of records){
  const id=txt(row.getAttribute("data-produto-id"),25);
  const quantity=Math.max(1,parseInt(row.getAttribute("data-produto-quantidade")||"1",10)||1);
  const link=row.querySelector(".produto-info > a[href]");
  const image=row.querySelector(".conteiner-imagem img");
  const val=row.querySelector(".col-item-unit-price")?.getAttribute("data-item-unit-valor");
  const price=Number(val);
  if(!/^\d+$/.test(id)||!Number.isFinite(price)||price<0)continue;
  const title=txt(link?.textContent||image?.alt||"Produto Nichelle",165);
  items.push({id,quantity,title,price,
   url:url(link?.getAttribute("href")||"")||"",
   img:url(image?.getAttribute("src")||"",false)||"",
   sku:txt(row.querySelector(".produto-info li strong")?.textContent||"",45),
   increase:url(row.querySelector("a.icon-plus")?.getAttribute("href")||""),
   decrease:url(row.querySelector("a.icon-minus")?.getAttribute("href")||""),
   remove:url(row.querySelector(".excluir a[href]")?.getAttribute("href")||"")});
 }
 const nativeSubtotal=doc.querySelector(".tabela-carrinho .valor-subtotal");
 const nativeTotal=Number(nativeSubtotal?.getAttribute("data-subtotal-valor"));
 const sum=items.reduce((n,item)=>n+item.price*item.quantity,0);
 const subtotal=Number.isFinite(nativeTotal)&&nativeTotal>=0?nativeTotal:
  Number.isFinite(moneyNumber(nativeSubtotal?.textContent))?moneyNumber(nativeSubtotal?.textContent):sum;
 return {items,quantity:items.reduce((n,x)=>n+x.quantity,0),subtotal};
}
async function officialFetch(path,accept){
 const response=await fetch(path,{method:"GET",credentials:"same-origin",cache:"no-store",
   redirect:"follow",headers:{Accept:accept||"text/html,application/xhtml+xml"}});
 if(!response.ok)throw Error("A Loja Integrada retornou HTTP "+response.status);
 const finalUrl=new URL(response.url,location.href);
 if(finalUrl.origin!==location.origin)throw Error("Redirecionamento fora da loja");
 return response;
}
async function retrieve(){
 const response=await officialFetch("/carrinho/index");
 const documentString=await response.text();
 const doc=new DOMParser().parseFromString(documentString,"text/html");
 if(!doc.querySelector("#corpo"))throw Error("Resposta inesperada do carrinho");
 if(!doc.querySelector(".tabela-carrinho")&&!/n[aã]o existem produtos no carrinho/i.test(doc.body.textContent||""))
  throw Error("Estrutura do carrinho não reconhecida");
 return parseCart(doc);
}
function itemCard(item){
 const row=el("article","n27-cart__item");row.dataset.productId=item.id;
 const imgLink=el(item.url?"a":"span","n27-cart__picture");
 if(item.url)imgLink.href=item.url;
 if(item.img){const img=el("img");img.src=item.img;img.alt=item.title;img.width=80;img.height=80;
  img.loading="lazy";img.decoding="async";imgLink.append(img);}
 const details=el("div","n27-cart__item-info");
 const name=el(item.url?"a":"strong","n27-cart__item-name",item.title);
 if(item.url)name.href=item.url;details.append(name);
 if(item.sku)details.append(el("small","n27-cart__sku","Cód: "+item.sku));
 const qty=el("div","n27-cart__item-quantity");
 const decrease=button("n27-cart__qty-button","",()=>mutate(item,item.quantity<=1?"remove":"decrease"),"minus");
 decrease.setAttribute("aria-label","Diminuir quantidade de "+item.title);
 const quantity=el("span","n27-cart__qty-count",String(item.quantity));
 quantity.setAttribute("aria-label",item.quantity+" unidades");
 const increase=button("n27-cart__qty-button","",()=>mutate(item,"increase"),"plus");
 increase.setAttribute("aria-label","Aumentar quantidade de "+item.title);
 if(!item.increase||item.quantity>=MAX_QUANTITY)increase.disabled=true;
 if(!item.decrease&&!item.remove)decrease.disabled=true;
 qty.append(decrease,quantity,increase);
 const remove=button("n27-cart__item-remove","Remover",()=>mutate(item,"remove"),"trash");
 remove.setAttribute("aria-label","Remover "+item.title);
 if(!item.remove)remove.disabled=true;
 const lower=el("div","n27-cart__item-bottom");
 lower.append(qty,el("strong","n27-cart__line-price",money(item.price*item.quantity)));
 details.append(lower,remove);row.append(imgLink,details);
 return row;
}
function updateHeader(){
 window.dispatchEvent(new CustomEvent("nichelle:cart-updated",{detail:{quantity:cartState.quantity}}));
 window.dispatchEvent(new CustomEvent("cart:updated",{detail:{quantity:cartState.quantity}}));
}
function renderCart(){
 if(!itemsBox)return;
 itemsBox.replaceChildren();
 quantityLabel.textContent=cartState.quantity===1?"1 produto no carrinho":
  cartState.quantity+" produtos no carrinho";
 if(!cartState.items.length){
  const empty=el("div","n27-cart__empty");
  empty.append(icon("bag"),el("h3","","Seu carrinho está vazio"),
    el("p","","Explore os produtos Nichelle e encontre seu próximo favorito."));
  itemsBox.append(empty);
 }else cartState.items.forEach(x=>itemsBox.append(itemCard(x)));
 totalLabel.textContent=money(cartState.subtotal);
 updateHeader();
 renderOffers();
}
async function loadCart(){
 if(!root||!opened)return;
 const token=++latestToken;
 loading=true;
 itemsBox.setAttribute("aria-busy","true");
 if(!cartState.items.length)itemsBox.replaceChildren(el("div","n27-cart__loading","Atualizando carrinho..."));
 try{
  const next=await retrieve();
  if(token!==latestToken||!opened)return;
  cartState=next;alertMessage("");
  renderCart();
 }catch(err){
  if(token!==latestToken)return;
  alertMessage("Não foi possível atualizar o carrinho. Abra a página do carrinho para conferir seus itens.","error");
  if(!cartState.items.length)itemsBox.replaceChildren(el("p","n27-cart__fallback","Sua compra continua disponível na Loja Integrada."));
  console.warn("[Nichelle cart]",err);
 }finally{
  if(token===latestToken){loading=false;itemsBox.removeAttribute("aria-busy");}
 }
}
async function mutate(item,type){
 if(mutating||loading)return;
 const target=type==="increase"?item.increase:type==="decrease"?item.decrease:item.remove;
 if(!target){alertMessage("Use a página do carrinho para alterar este produto.","error");return;}
 try{
  mutating=true;alertMessage("Atualizando produto...");
  panel.querySelectorAll(".n27-cart__item button,.n27-cart__offer button").forEach(b=>b.disabled=true);
  const response=await officialFetch(target);
  if(!response.url.includes("/carrinho/index")){
   const body=await response.text();
   if(/status"?\s*:\s*"erro"/i.test(body))throw Error("Operação recusada pela loja");
  }
  // Never optimistically change quantities or prices.
  const newCart=await retrieve();
  cartState=newCart;renderCart();alertMessage("");
 }catch(err){
  console.warn("[Nichelle cart mutation]",err);
  alertMessage("Não foi possível alterar este item. Confira as opções no carrinho.","error");
 }finally{mutating=false;panel.querySelectorAll(".n27-cart__offer button").forEach(b=>b.disabled=false);}
}
function readOffersFromDocument(doc){
 const candidates=[...doc.querySelectorAll(".listagem-item[data-id]")];
 const unique=new Set(),out=[];
 for(const source of candidates){
  const id=txt(source.getAttribute("data-id"),20);
  if(!/^\d+$/.test(id)||unique.has(id)||source.closest(".slick-cloned"))continue;
  if(source.classList.contains("produto-indisponivel")||source.querySelector(".avise-me"))continue;
  const titleEl=source.querySelector("a.nome-produto");
  const href=url(titleEl?.getAttribute("href")||"");
  const name=txt(titleEl?.textContent||"",140);
  const img=url(source.querySelector(".imagem-produto img")?.getAttribute("src")||"",false);
  if(!href||!name||!img)continue;
  unique.add(id);
  out.push({id,title:name,href,img,
    price:txt(source.querySelector(".preco-promocional")?.textContent||"",55)});
 }
 return out;
}
async function offersCatalog(){
 if(offersCache)return offersCache;
 const present=readOffersFromDocument(document);
 if(present.length>=10){offersCache=present;return present;}
 // Product pages may contain no listagem. Request real storefront catalog
 // once, and parse its actual product cards (not invented products).
 try{
  const r=await officialFetch("/");
  const html=await r.text();
  const doc=new DOMParser().parseFromString(html,"text/html");
  const items=readOffersFromDocument(doc);
  offersCache=items.length?items:present;
 }catch(_){offersCache=present;}
 return offersCache;
}
function pickRandom(candidates,max){
 const copy=candidates.slice();
 for(let i=copy.length-1;i>0;i--){
  const j=Math.floor(Math.random()*(i+1));
  [copy[i],copy[j]]=[copy[j],copy[i]];
 }
 return copy.slice(0,max);
}
async function renderOffers(){
 if(!opened||!offersBox)return;
 const token=latestToken,opts=settings();
 const section=offersBox.parentElement;
 section.hidden=!opts.orderBump||!opts.maxOfertas;
 if(section.hidden)return;
 const candidates=await offersCatalog();
 if(token!==latestToken||!opened)return;
 const exclude=new Set(cartState.items.map(x=>x.id));
 const entries=candidates.filter(x=>!exclude.has(x.id));
 const picks=pickRandom(entries,opts.maxOfertas);
 lastSuggested=picks;
 offersBox.replaceChildren();
 if(!picks.length){section.hidden=true;return;}
 for(const offer of picks){
  const item=el("article","n27-cart__offer");
  const picture=el("a","n27-cart__offer-image");picture.href=offer.href;
  const img=el("img");img.src=offer.img;img.alt=offer.title;img.width=64;img.height=64;
  img.loading="lazy";picture.append(img);
  const content=el("div","n27-cart__offer-info");
  const name=el("a","n27-cart__offer-name",offer.title);name.href=offer.href;
  content.append(name);
  if(offer.price)content.append(el("small","n27-cart__offer-price",offer.price));
  const add=button("n27-cart__offer-add","Adicionar +",()=>addOffer(offer,add));
  add.setAttribute("aria-label","Adicionar "+offer.title+" ao carrinho");
  content.append(add);item.append(picture,content);offersBox.append(item);
 }
}
async function addOffer(offer,btn){
 if(mutating||loading)return;
 mutating=true;btn.disabled=true;
 const original=btn.textContent;btn.textContent="Adicionando...";
 try{
  // Confirm the product's own official add endpoint before mutating cart.
  const page=await officialFetch(offer.href);
  const html=await page.text();
  const doc=new DOMParser().parseFromString(html,"text/html");
  const native=doc.querySelector('.produto .botao-comprar-ajax[href*="/carrinho/produto/"]');
  const path=url(native?.getAttribute("href")||"");
  if(!path||!path.includes("/carrinho/produto/"+offer.id+"/adicionar")){
   // Multi-variation and unavailable items must be selected on PDP.
   location.href=offer.href+(offer.href.includes("?")?"&":"?")+"nichelle_preview=1";
   return;
  }
  const response=await fetch(path,{
    method:"GET",credentials:"same-origin",cache:"no-store",
    headers:{Accept:"application/json","X-Requested-With":"XMLHttpRequest"}
  });
  if(!response.ok||new URL(response.url,location.href).origin!==location.origin)
    throw Error("Erro da Loja Integrada ao adicionar produto");
  const data=await response.json();
  if(data?.status!=="sucesso")throw Error(data?.mensagem||"Produto não adicionado");
  cartState=await retrieve();
  renderCart();alertMessage("Produto adicionado ao carrinho!","success");
  window.NichelleHeader?.refreshCart?.(cartState.quantity);
 }catch(err){
  console.warn("[Nichelle order bump]",err);
  alertMessage("Este produto não pôde ser adicionado automaticamente. Confira sua página antes de comprar.","error");
  const link=el("a","n27-cart__offer-link","Ver produto");
  link.href=offer.href+(offer.href.includes("?")?"&":"?")+"nichelle_preview=1";
  btn.replaceWith(link);
 }finally{mutating=false;btn.disabled=false;btn.textContent=original;}
}
function onCartAnchor(e){
 const target=e.target?.closest?.("#n27-independent-header .n27-owned-cart");
 if(!target||!allowed()||e.defaultPrevented||
    e.button!==0||e.ctrlKey||e.shiftKey||e.altKey||e.metaKey)return;
 e.preventDefault();open(target);
}
function closeNativeSuccess(){
 const j=window.jQuery||window.$;
 if(!j?.fancybox?.close)return;
 // Close only the add-to-cart success popup; never image/size-guide modals.
 const wrapper=document.querySelector(".fancybox-wrap.modal-comprar-ajax-status.fancybox-opened");
 if(wrapper)try{j.fancybox.close();}catch(_){}
}
function watchNativeSuccess(){
 // Groom/LI sometimes opens the success popup *after* the AJAX event.
 // A bounded series of checks avoids leaving that popup behind the drawer.
 [0,150,380,680,1100,1700].forEach(ms=>window.setTimeout(()=>{
   if(opened)closeNativeSuccess();
 },ms));
}
function onNativeAjaxSuccess(event,xhr,opts){
 if(!allowed()||!opts||mutating)return;
 let u;
 try{u=new URL(opts.url,location.href);}catch(_){return;}
 if(u.origin!==location.origin || !/^\/carrinho\/produto\/\d+\/adicionar\/?$/.test(u.pathname))return;
 let data=xhr.responseJSON;
 if(!data&&typeof xhr.responseText==="string"){try{data=JSON.parse(xhr.responseText);}catch(_){}}
 if(data?.status!=="sucesso")return;
 // Native LI AJAX already added the product; FWR only reads the actual cart.
 window.setTimeout(()=>{
  open(document.activeElement);
  watchNativeSuccess();
 },220);
}
function register(){
 if(ready||!allowed())return;
 ready=true;
 document.addEventListener("click",onCartAnchor,true);
 const j=window.jQuery||window.$;
 if(j?.fn?.jquery)j(document).ajaxSuccess(onNativeAjaxSuccess);
 window.addEventListener("nichelle:cart-updated",()=>{if(opened&&!mutating){const t=Date.now();if(t-lastRefresh>800){lastRefresh=t;loadCart();}}});
 document.addEventListener("nichelle27:cart:open",()=>open());
 document.addEventListener("nichelle27:cart:refresh",()=>{if(opened)loadCart();});
 window.NichelleCartDrawer={version:"1.1.0",open:()=>open(),close,refresh:loadCart,
  get state(){return{open:opened,quantity:cartState.quantity,subtotal:cartState.subtotal,
   items:cartState.items.map(x=>({id:x.id,quantity:x.quantity,price:x.price}))};}};
}
if(document.readyState==="loading")document.addEventListener("DOMContentLoaded",register,{once:true});
else register();
window.addEventListener("load",register,{once:true});
[400,1400].forEach(ms=>setTimeout(register,ms));
})();


/* nichelle-pdp.js */
/*
 * Nichelle Imports 2026 — FWR PDP v1.0
 * Variações, preço, galeria Splide, frete, parcela e compra são DOM
 * original da Loja Integrada. Este componente só faz composição visual.
 * Homologação explícita: ?nichelle_preview=1.
 */
(function(){
"use strict";
if(!/^(www\.)?nichelleimports\.com\.br$/i.test(location.hostname) ||
   new URLSearchParams(location.search).get("nichelle_preview")!=="1" ||
   window.NichelleProductFWR)return;
let container=null,hero=null,observer=null,timer=0,init=false;
const SELECTOR=".produto-detalhes > .conteiner > .row-fluid";
const safe=(x,n=190)=>String(x||"").replace(/\s+/g," ").trim().slice(0,n);
const e=(tag,cls,txt)=>{const n=document.createElement(tag);if(cls)n.className=cls;if(txt!==undefined)n.textContent=txt;return n;};
function settings(){return window.Nichelle27Settings?.paginaProdutoFWR||{};}
function enabled(){
 const g=window.Nichelle27Settings?.geral;
 return g?.ativo===true&&g.modoPreview===true&&g.publicarNaLoja!==true &&
   settings().ativo!==false;
}
function icon(name){
 const paths={truck:"M3 5h11v12H3V5Zm11 4h4l3 4v4h-7V9ZM7 19a2 2 0 1 0 0-4 2 2 0 0 0 0 4Zm11 0a2 2 0 1 0 0-4 2 2 0 0 0 0 4Z",
 shield:"M12 2 4 6v6c0 5 3 8 8 10 5-2 8-5 8-10V6l-8-4Zm-3 10 2 2 4-4",
 chat:"M21 11.5a8.5 8.5 0 0 1-8.5 8.5 9 9 0 0 1-4-.9L3 21l1.9-5.5A8.5 8.5 0 1 1 21 11.5Z",
 pix:"M12 2 22 12 12 22 2 12 12 2Z M8 12h8",
 check:"m5 12 4 4L19 6",
 arrow:"M5 12h14m-6-6 6 6-6 6"};const svg=document.createElementNS("http://www.w3.org/2000/svg","svg");
 svg.setAttribute("viewBox","0 0 24 24");svg.setAttribute("aria-hidden","true");svg.setAttribute("fill","none");
 svg.setAttribute("stroke","currentColor");svg.setAttribute("stroke-width","1.7");svg.setAttribute("stroke-linecap","round");svg.setAttribute("stroke-linejoin","round");
 (paths[name]||paths.check).split(" M").forEach((p,i)=>{const path=document.createElementNS("http://www.w3.org/2000/svg","path");
 path.setAttribute("d",i?"M"+p:p);svg.append(path);});return svg;
}
function benefit(name,title,description){
 const n=e("div","n27-pdp__benefit"),symbol=e("span","n27-pdp__benefit-icon");
 symbol.append(icon(name));const text=e("div","n27-pdp__benefit-text");
 text.append(e("strong","",title),e("small","",description));n.append(symbol,text);return n;
}
function benefits(media){
 if(media.querySelector(".n27-pdp__benefits"))return;
 const row=e("section","n27-pdp__benefits");row.setAttribute("aria-label","Informações importantes da compra");
 row.append(e("h2","n27-pdp__benefits-title","Informações importantes"));
 const cols=e("div","n27-pdp__benefits-row");
 cols.append(
  benefit("truck","Entrega para todo o Brasil","Calcule o frete pelo CEP"),
  benefit("shield","Compra segura","Pagamento processado pela loja"),
  benefit("chat","Atendimento","Equipe disponível para dúvidas")
 );
 row.append(cols);media.append(row);
}
function findDescription(){
 const src=document.querySelector(".produto-descricao .tab-content,.produto-descricao .conteudo,.produto-descricao .descricao-produto,.produto-descricao");
 if(!src)return"";
 const plain=safe(src.innerText||src.textContent,460);
 return plain.length>22?plain:"";
}
function line(name,title,content,kind){
 const details=e("details","n27-pdp__accordion");
 details.dataset.section=name;
 if(kind==="open")details.open=true;
 const summary=e("summary","n27-pdp__accordion-title");
 summary.append(e("span","",title),e("span","n27-pdp__accordion-symbol","+"));
 const body=e("div","n27-pdp__accordion-body");
 if(content)body.append(e("p","",content));
 details.append(summary,body);return{details,body};
}
function extras(detailsCol){
 if(detailsCol.querySelector(".n27-pdp__extras"))return;
 const section=e("section","n27-pdp__extras");
 section.setAttribute("aria-label","Informações complementares do produto");
 const description=findDescription();
 const a=line("description","Descrição e especificações",description||"Conheça as características e informações completas do produto.","open");
 const original=document.querySelector(".produto-descricao");
 if(original){
  original.id=original.id||"n27-pdp-full-description";
  const link=e("a","n27-pdp__inline-link","Ver descrição completa ↓");link.href="#"+original.id;
  a.body.append(link);
 }
 const freight=line("freight","Envio e entrega","Informe seu CEP no calculador de frete para consultar prazos e opções de envio.");
 const price=line("payment","Pagamento e condições","As condições de parcelamento e pagamento são determinadas pela Loja Integrada.");
 const priceLink=e("button","n27-pdp__inline-link","Consultar formas de pagamento");priceLink.type="button";
 priceLink.addEventListener("click",()=>{
  const native=[...detailsCol.querySelectorAll(".acoes-produto")].find(n=>n.getBoundingClientRect().height>0);
  const pay=native?.querySelector(".mais-formas");
  if(pay){pay.click();pay.scrollIntoView({behavior:"smooth",block:"center"});}
 });price.body.append(priceLink);
 const help=line("support","Dúvidas e atendimento","Nossa equipe pode ajudar com informações sobre produtos e pedidos.");
 const source=document.querySelector('#rodape-atendimento a[href^="https://wa.me/"], #rodape-atendimento a[href*="api.whatsapp"], #cabecalho a[href*="wa.me/"]');
 if(source){
  const a=e("a","n27-pdp__inline-link","Conversar com atendimento");
  a.href=source.href;a.target="_blank";a.rel="noopener noreferrer";help.body.append(a);
 }
 section.append(a.details,freight.details,price.details,help.details);
 detailsCol.append(section);
}
function setupPix(principal){
 if(principal.querySelector(".n27-pdp__pix-hero"))return;
 hero=e("div","n27-pdp__pix-hero");
 hero.setAttribute("aria-live","polite");
 hero.setAttribute("aria-label","Preço especial no Pix");
 hero.hidden=true;
 const over=e("span","n27-pdp__pix-overline","PREÇO ESPECIAL NO PIX");
 const value=e("strong","n27-pdp__pix-value");
 const desc=e("span","n27-pdp__pix-label","Pagamento à vista via Pix");
 const discount=e("span","n27-pdp__pix-discount");
 hero.append(over,value,desc,discount);
 const variant=principal.querySelector(":scope > .atributos");
 const first=principal.querySelector(":scope > .acoes-produto");
 if(first)principal.insertBefore(hero,first);
 else if(variant)variant.after(hero);
 else principal.append(hero);
}
function visibleAction(principal){
 const list=[...principal.querySelectorAll(":scope > .acoes-produto")];
 // LI keeps the CSS class "hide" on selected variants and toggles
 // inline display:block. Visibility, not the class name, is authoritative.
 return list.find(n=>n.getBoundingClientRect().height>0 &&
   getComputedStyle(n).display!=="none" && !n.classList.contains("indisponivel")) ||
   list.find(n=>n.getBoundingClientRect().height>0 &&
   getComputedStyle(n).display!=="none") ||null;
}
function syncPix(){
 if(!container||!container.isConnected||!hero)return;
 const principal=container.querySelector(".produto-detalhes-detalhes > .principal");
 if(!principal)return;
 const action=visibleAction(principal);
 const real=action?.querySelector(".desconto-a-vista .avista-valor strong");
 const value=safe(real?.textContent,60);
 const discount=safe(action?.querySelector(".desconto-a-vista .avista-desconto")?.textContent,100);
 const signature=value+"|"+discount;
 if(value&&/R\$\s*[\d.,]+/.test(value)){
  if(hero.dataset.signature!==signature){
   hero.querySelector(".n27-pdp__pix-value").textContent=value;
   hero.querySelector(".n27-pdp__pix-discount").textContent=discount||"";
   hero.dataset.signature=signature;
  }
  if(hero.hidden)hero.hidden=false;
  container.dataset.n27PixReady="1";
 }else{
  hero.hidden=true;
  container.dataset.n27PixReady="0";
 }
}
function schedule(){
 if(timer)clearTimeout(timer);
 timer=window.setTimeout(()=>{timer=0;syncPix();},70);
}
function mount(){
 if(init||!enabled()||!document.body.classList.contains("pagina-produto"))return;
 const native=document.querySelector(SELECTOR);
 if(!native)return;
 const media=native.querySelector(":scope > .produto-detalhes-imagem");
 const details=native.querySelector(":scope > .produto-detalhes-detalhes");
 const principal=details?.querySelector(":scope > .principal");
 if(!media||!details||!principal)return;
 init=true;container=document.querySelector(".produto-detalhes");
 document.documentElement.dataset.n27Pdp="1";
 document.body.classList.add("n27-pdp-page");
 container.classList.add("n27-pdp");
 native.classList.add("n27-pdp__layout");
 media.classList.add("n27-pdp__media");
 details.classList.add("n27-pdp__details");
 benefits(media);setupPix(principal);extras(details);
 document.querySelector(".produto-descricao")?.classList.add("n27-pdp__description");
 document.querySelector(".produto-aproveite")?.classList.add("n27-pdp__recommendations");
 syncPix();
 observer=new MutationObserver(records=>{
  if(records.some(r=>r.target.closest?.(".n27-pdp__pix-hero, .n27-pdp__extras")))return;
  schedule();
 });
 observer.observe(principal,{subtree:true,attributes:true,attributeFilter:["class","style","data-sell-price"],childList:true,characterData:true});
 document.addEventListener("click",evt=>{
  if(evt.target.closest?.(".atributo-item,.wrapper-dropdown,.atributo-comum,.lista-atributos"))schedule();
 },true);
 document.addEventListener("change",schedule,true);
 window.NichelleProductFWR={version:"1.0.1",refresh:syncPix};
}
if(document.readyState==="loading")document.addEventListener("DOMContentLoaded",mount,{once:true});else mount();
window.addEventListener("load",mount,{once:true});
[300,950,2000].forEach(ms=>window.setTimeout(mount,ms));
})();

/* nichelle-cart-page.js */
/*
 * NICHELLE — Cart page FWR v1.0
 * Pure presentation adapter for the actual Loja Integrada cart.
 * Keeps item forms, quantity links, shipping, coupon, checkout redirect.
 * Only ?nichelle_preview=1.
 */
(function(){
"use strict";
if(!/^(www\.)?nichelleimports\.com\.br$/i.test(location.hostname) ||
 !/^\/carrinho\/index\/?$/.test(location.pathname)||
 window.NichelleCartPageFWR)return;
// The native LI quantity/remove endpoints redirect to /carrinho/index without
// the preview query param. Restore it only once in this SAME TAB immediately
// after an explicitly previewed cart action. No checkout or public-user impact.
const PREVIEW_RETURN_KEY="n27-cart-preview-native-return";
let isPreview=new URLSearchParams(location.search).get("nichelle_preview")==="1";
if(!isPreview){
 try{
  const issued=Number(sessionStorage.getItem(PREVIEW_RETURN_KEY)||0);
  sessionStorage.removeItem(PREVIEW_RETURN_KEY);
  if(issued>0&&Date.now()-issued>=0&&Date.now()-issued<18000){
   const url=new URL(location.href);
   url.searchParams.set("nichelle_preview","1");
   history.replaceState(history.state,"",url.pathname+url.search+url.hash);
   isPreview=true;
  }
 }catch(_){}
}
if(!isPreview)return;
function rememberNativeCartPreview(){
 try{sessionStorage.setItem(PREVIEW_RETURN_KEY,String(Date.now()));}catch(_){}
}
function preserveNativeActionPreview(table){
 if(table.dataset.n27PreviewHooked==="1")return;
 table.dataset.n27PreviewHooked="1";
 table.addEventListener("click",evt=>{
  const a=evt.target.closest?.('tr[data-produto-id] a[href]');
  if(!a)return;
  try{
   const href=new URL(a.href,location.href);
   if(href.origin===location.origin &&
     /^\/carrinho\/produto\/\d+\/(?:atualizar|remover)(?:\/|$)/.test(href.pathname))
     rememberNativeCartPreview();
  }catch(_){}
 },true);
 table.querySelectorAll('#formCalcularFrete,form[action*="/carrinho/cupom/validar"]')
   .forEach(form=>form.addEventListener("submit",rememberNativeCartPreview,true));
}
let ready=false,root=null,totalView,installmentsView,pixBlock,pixAmount,pixNote,observer;
const $$=(s,n=document)=>n.querySelector(s);
const el=(tag,cls,text)=>{const n=document.createElement(tag);if(cls)n.className=cls;if(text!==undefined)n.textContent=text;return n;};
const safe=(x,l=150)=>String(x||"").replace(/\s+/g," ").trim().slice(0,l);
function settings(){return window.Nichelle27Settings?.paginaCarrinhoFWR||{};}
function allowed(){
 const g=window.Nichelle27Settings?.geral;
 return g?.ativo===true&&g.modoPreview===true&&g.publicarNaLoja!==true &&
   settings().ativo!==false;
}
function readMoney(node){
 return safe(node?.textContent,70)||"";
}
// As condicoes do checkout sao a fonte definitiva; a loja anuncia ate
// 6 parcelas sem juros. Esta vitrine apenas simula valores, sem criar
// uma modalidade de pagamento e sem modificar o formulario oficial.
function maxInstallments(){
 const value=Number(settings().parcelasMaximasSemJuros ?? 6);
 return Number.isInteger(value)&&value>=2&&value<=12?value:0;
}
function totalCents(raw){
 const value=String(raw||"").match(/R\$\s*([\d.,]+)/)?.[1];
 if(!value)return 0;
 const n=Number(value.replace(/\./g,"").replace(",","."));
 return Number.isFinite(n)&&n>0?Math.round(n*100):0;
}
function formatBRL(value){
 return (value/100).toLocaleString("pt-BR",{style:"currency",currency:"BRL"});
}
function setAttrControls(table){
 for(const tr of table.querySelectorAll('tr[data-produto-id]')){
  const name=safe(tr.querySelector('.produto-info a')?.textContent,120)||"produto";
  const minus=tr.querySelector('.quantidade .icon-minus');
  const plus=tr.querySelector('.quantidade .icon-plus');
  const remove=tr.querySelector('.excluir a[href]');
  if(minus)minus.setAttribute("aria-label","Diminuir quantidade de "+name);
  if(plus)plus.setAttribute("aria-label","Aumentar quantidade de "+name);
  if(remove)remove.setAttribute("aria-label","Remover "+name+" do carrinho");
  const qty=tr.querySelector('.quantidade input');
  if(qty)qty.setAttribute("aria-label","Quantidade de "+name);
 }
}
function mount(){
 if(ready||!allowed()||!document.body.classList.contains("pagina-carrinho"))return;
 const native=document.querySelector('#corpo .finalizar-compra');
 const table=native?.querySelector(".tabela-carrinho");
 const box=native?.querySelector(".caixa-sombreada");
 const checkout=native?.querySelector('form[action*="/checkout/redirect/"]');
 if(!native||!table||!box||!checkout)return;
 const action=new URL(checkout.action,location.href);
 if(action.origin!==location.origin||!/^\/checkout\/redirect\/?$/.test(action.pathname))return;
 ready=true;root=native;
 root.classList.add("n27-cart-page");
 document.documentElement.dataset.n27CartPage="1";
 const nativeHeader=native.querySelector(".cabecalho-interno");
 if(nativeHeader){
  nativeHeader.classList.add("n27-cart-page__header");
  const label=el("span","n27-cart-page__eyebrow","SEU PEDIDO");
  nativeHeader.insertBefore(label,nativeHeader.firstChild);
  const title=nativeHeader.querySelector("h1");
  if(title)title.textContent="CARRINHO";
 }
 const cap=el("div","n27-cart-page__bar","ITENS DO SEU CARRINHO");
 box.insertBefore(cap,table);
 const summary=el("aside","n27-cart-page__summary");
 summary.setAttribute("aria-label","Resumo do seu pedido");
 const eyebrow=el("span","n27-cart-page__summary-eyebrow","FINALIZAÇÃO");
 summary.append(eyebrow,el("h2","n27-cart-page__summary-title","Resumo do pedido"));
 // O subtotal redundante foi removido apenas do painel visual da FWR.
 // O subtotal/total nativos da Loja Integrada permanecem intactos.
 const total=el("div","n27-cart-page__summary-total");
 total.append(el("span","", "Total do pedido"));
 totalView=el("strong","n27-cart-page__summary-total-number");total.append(totalView);summary.append(total);
 installmentsView=el("p","n27-cart-page__installments");
 installmentsView.hidden=true;
 installmentsView.setAttribute("aria-label","Parcelamento estimado do pedido");
 summary.append(installmentsView);
 pixBlock=el("div","n27-cart-page__pix");
 pixBlock.append(el("span","n27-cart-page__pix-eyebrow","PREÇO ESPECIAL NO PIX"));
 pixAmount=el("strong","n27-cart-page__pix-amount");
 pixNote=el("span","n27-cart-page__pix-note");
 pixBlock.append(pixAmount,pixNote);summary.append(pixBlock);
 const info=el("p","n27-cart-page__note",
  "Frete, cupons e condições finais são calculados pela Loja Integrada.");
 summary.append(info);
 // MOVE, never clone: native checkout form and its event behavior remain
 // the only official path to checkout and payment.
 checkout.classList.add("n27-cart-page__checkout-form");
 summary.append(checkout);
 native.append(summary);
 setAttrControls(table);
 preserveNativeActionPreview(table);
 sync();
 let pending=false;
 observer=new MutationObserver(records=>{
  // Avoid observing our summary; no infinite loops on copied totals.
  if(pending)return;pending=true;
  requestAnimationFrame(()=>{pending=false;sync();});
 });
 observer.observe(table,{subtree:true,characterData:true,childList:true,attributes:true,attributeFilter:["data-total-valor","data-subtotal-valor"]});
 window.NichelleCartPageFWR={version:"1.1.0",refresh:sync};
}
function sync(){
 if(!ready)return;
 const table=root.querySelector(".tabela-carrinho");
 if(!table)return;
 const subtotal=table.querySelector(".valor-subtotal");
 const total=table.querySelector(".valor-total");
 const totalText=readMoney(total)||readMoney(subtotal);
 totalView.textContent=totalText||"R$ 0,00";
 const cents=totalCents(totalText),max=maxInstallments();
 if(max>0&&cents>0){
  installmentsView.textContent="ou até "+max+"x de "+
   formatBRL(Math.round(cents/max))+" sem juros";
  installmentsView.hidden=false;
 }else{
  installmentsView.textContent="";
  installmentsView.hidden=true;
 }
 const pix=table.querySelector(".valores-descontos .descontos.avista");
 const pixText=safe(pix?.textContent,200);
 const matches=pixText.match(/R\$\s*[\d.,]+/g);
 if(matches&&matches.length){
  pixAmount.textContent=matches[matches.length-1];
  pixNote.textContent=pixText.replace(matches[matches.length-1],"").trim().slice(0,80);
  pixBlock.hidden=false;
 } else {
  pixAmount.textContent="";
  pixNote.textContent="";
  pixBlock.hidden=true;
 }
 setAttrControls(table);
}
if(document.readyState==="loading")document.addEventListener("DOMContentLoaded",mount,{once:true});
else mount();
window.addEventListener("load",mount,{once:true});
[300,900,1800].forEach(ms=>setTimeout(mount,ms));
})();

/* nichelle-first-order-coupon.js */
/* NICHELLE | Oferta flutuante de primeira compra v1.0 — SOMENTE PREVIEW.
   Toda validação do desconto fica com o carrinho da Loja Integrada. */
(function(){
"use strict";
if(!/^(www\.)?nichelleimports\.com\.br$/i.test(location.hostname)||
   new URLSearchParams(location.search).get("nichelle_preview")!=="1"||
   /^\/(?:checkout|finalizar-pedido)(?:\/|$)/i.test(location.pathname)||
   window.NichelleWelcomeCoupon)return;
const g=window.Nichelle27Settings?.geral;
const opt=window.Nichelle27Settings?.primeiraCompra||{};
if(g?.ativo!==true||g.modoPreview!==true||g.publicarNaLoja===true||
   opt.ativo===false)return;
const CODE=String(opt.codigo||"PRIMEIRACOMPRA").trim().toUpperCase();
if(!/^[A-Z0-9_-]{3,40}$/.test(CODE))return;
const pct=Number(opt.percentual)||10;
const KEY="n27-welcome-coupon-pending";
const ATTEMPT="n27-welcome-coupon-attempt";
const CART_RETURN="n27-cart-preview-native-return";
const isCart=/^\/carrinho\/index\/?$/.test(location.pathname);
const element=(tag,cls,txt)=>{
 const n=document.createElement(tag);
 if(cls)n.className=cls;
 if(txt!==undefined)n.textContent=txt;
 return n;
};
function get(k){try{return sessionStorage.getItem(k)||"";}catch(_){return "";}}
function put(k,v){try{sessionStorage.setItem(k,v);}catch(_){}}
function del(k){try{sessionStorage.removeItem(k);}catch(_){}}
function alreadyHasCoupon(){
 return !!document.querySelector(
  'a[href*="/carrinho/cupom/remover"],.cupom-aplicado,.cupom-desconto-aplicado'
 );
}
function attempt(){
 if(!isCart||get(KEY)!==CODE||get(ATTEMPT)===CODE)return;
 if(!document.querySelector('#corpo .tabela-carrinho tr[data-produto-id]'))return;
 if(alreadyHasCoupon()){del(KEY);return;}
 const forms=[...document.querySelectorAll('form[action*="/carrinho/cupom/validar"]')];
 const form=forms.find(f=>{
  try{
   const u=new URL(f.action,location.href);
   return u.origin===location.origin&&/^\/carrinho\/cupom\/validar\/?$/.test(u.pathname);
  }catch(_){return false;}
 });
 const input=form?.querySelector(
  'input[name="cupom"],input[name="codigo"],input[type="text"]:not([disabled])'
 );
 if(input?.value?.trim()&&input.value.trim().toUpperCase()!==CODE)return;
 // Uma tentativa por clique: evita refresh/redirect em loop.
 put(ATTEMPT,CODE);del(KEY);
 put(CART_RETURN,String(Date.now()));
 if(form&&input){
  input.value=CODE;
  input.dispatchEvent(new Event("input",{bubbles:true}));
  input.dispatchEvent(new Event("change",{bubbles:true}));
  if(form.requestSubmit)form.requestSubmit();
  else HTMLFormElement.prototype.submit.call(form);
 }else{
  // Endpoint nativo documentado pela comunidade LI.
  const to=new URL("/carrinho/cupom/validar",location.origin);
  to.searchParams.set("cupom",CODE);
  location.assign(to.pathname+to.search);
 }
}
function render(){
 if(!document.body||document.getElementById("n27-welcome-coupon"))return;
 const root=element("aside","n27-welcome-coupon");
 root.id="n27-welcome-coupon";
 root.setAttribute("aria-label","Oferta de primeira compra");
 const trigger=element("button","n27-welcome-coupon__trigger");
 trigger.type="button";
 trigger.setAttribute("aria-controls","n27-welcome-coupon-panel");
 trigger.setAttribute("aria-expanded","false");
 trigger.setAttribute("aria-label","Abrir a oferta de primeira compra");
 trigger.append(element("strong","",pct+"% OFF"),element("span","","1ª COMPRA"));
 const panel=element("section","n27-welcome-coupon__panel");
 panel.id="n27-welcome-coupon-panel";panel.hidden=true;
 panel.setAttribute("aria-label","Detalhes do cupom de primeira compra");
 const close=element("button","n27-welcome-coupon__close","×");
 close.type="button";close.setAttribute("aria-label","Fechar oferta");
 const title=element("strong","n27-welcome-coupon__title",pct+"% OFF na primeira compra");
 const desc=element("p","n27-welcome-coupon__description",
  "Use o cupom abaixo. O desconto será confirmado no carrinho, conforme as regras da loja.");
 const coupon=element("button","n27-welcome-coupon__code");
 coupon.type="button";coupon.setAttribute("aria-label","Selecionar cupom "+CODE);
 coupon.append(element("span","",CODE),element("small","","USAR CUPOM"));
 const status=element("p","n27-welcome-coupon__status","");
 status.setAttribute("role","status");
 const link=element("a","n27-welcome-coupon__cart","Ver meu carrinho");
 link.href="/carrinho/index?nichelle_preview=1";
 panel.append(close,title,desc,coupon,status,link);
 root.append(trigger,panel);document.body.append(root);
 function show(open){
  panel.hidden=!open;root.classList.toggle("n27-welcome-coupon--open",open);
  trigger.setAttribute("aria-expanded",String(open));
 }
 trigger.addEventListener("click",()=>show(panel.hidden));
 close.addEventListener("click",()=>{show(false);trigger.focus();});
 document.addEventListener("click",e=>{
  if(!panel.hidden&&!root.contains(e.target))show(false);
 });
 document.addEventListener("keydown",e=>{
  if(e.key==="Escape"&&!panel.hidden){show(false);trigger.focus();}
 });
 coupon.addEventListener("click",()=>{
  put(KEY,CODE);del(ATTEMPT);
  status.textContent="Cupom selecionado! Vamos validá-lo quando você chegar ao carrinho.";
  coupon.classList.add("n27-welcome-coupon__code--selected");
  navigator.clipboard?.writeText?.(CODE).catch(()=>{});
  if(isCart)attempt();
 });
 if(get(KEY)===CODE){
  status.textContent="Cupom reservado para validar no carrinho.";
  coupon.classList.add("n27-welcome-coupon__code--selected");
 }
}
function mount(){render();attempt();}
if(document.readyState==="loading")document.addEventListener("DOMContentLoaded",mount,{once:true});
else mount();
window.addEventListener("load",mount,{once:true});
if(isCart)[350,1100,2100].forEach(ms=>setTimeout(attempt,ms));
window.NichelleWelcomeCoupon={version:"1.0.0",applyPending:attempt};
})();


/* nichelle-listing.js — categoria e busca */
/*
 * Nichelle Imports 2026 — Categoria e busca com cards FWR v1.0.
 * Somente preview; consome exclusivamente produtos do HTML nativo da LI.
 * Filtros, ordenacao, paginacao, URLs e precos continuam sob a plataforma.
 * Fallback seguro: se houver dados incompletos, exibe listagem nativa.
 */
(function(){
"use strict";
const path=location.pathname.replace(/\/+$/,"")||"/";
if(!/^(www\.)?nichelleimports\.com\.br$/i.test(location.hostname)||
 new URLSearchParams(location.search).get("nichelle_preview")!=="1"||
 /^\/(?:checkout|carrinho|conta|finalizar-pedido)(?:\/|$)/i.test(path)||
 window.NichelleListingFWR)return;
const ID="n27-listing-fwr";
let source=null,root=null,observer=null,scheduled=false,signature="";
const allowed=()=>{
 const g=window.Nichelle27Settings?.geral;
 return !!(g?.ativo===true&&g?.modoPreview===true&&g?.publicarNaLoja!==true&&
   window.Nichelle27Settings?.listagemFWR?.ativo!==false);
};
const node=(tag,cls,txt)=>{
 const n=document.createElement(tag);
 if(cls)n.className=cls;
 if(txt!==undefined)n.textContent=txt;
 return n;
};
const clean=(value,max=180)=>String(value||"").replace(/\s+/g," ").trim().slice(0,max);
function money(raw){
 const match=clean(raw,300).match(/R\$\s*([\d.]+,\d{2})/);
 if(!match)return null;
 const amount=Number(match[1].replace(/\./g,"").replace(",","."));
 return Number.isFinite(amount)&&amount>=0?amount:null;
}
const brl=n=>new Intl.NumberFormat("pt-BR",{style:"currency",currency:"BRL"}).format(n);
function url(raw,img=false){
 if(typeof raw!=="string"||!raw.trim())return "";
 try{
  const u=new URL(raw,location.href);
  if(!/^https?:$/.test(u.protocol)||u.username||u.password)return "";
  if(!img&&u.origin!==location.origin)return "";
  return img?u.href:u.pathname+u.search+u.hash;
 }catch(_){return "";}
}
function art(src,size=800){
 try{
  const u=new URL(src,location.href);
  if(u.protocol==="https:"&&u.hostname==="cdn.awsli.com.br"&&
     /^\/\d+x\d+\/\d+\/\d+\/produto\//.test(u.pathname)){
   u.pathname=u.pathname.replace(/^\/\d+x\d+\//,"/"+size+"x"+size+"/");
   return u.href;
  }
 }catch(_){}
 return src;
}
function pickImage(img){
 if(!img)return "";
 for(const attr of ["data-src","data-original","data-lazy-src","src","data-image","data-imagem-caminho"]){
  const src=url(img.getAttribute(attr),true);
  if(src&&!/blank\.gif|placeholder|data:image/i.test(src))return src;
 }
 return url(img.currentSrc,true);
}
function collectItem(li){
 const name=clean(li.querySelector(".nome-produto")?.textContent||
   li.querySelector("a.produto-sobrepor")?.getAttribute("title")||
   li.querySelector(".produto-info > a")?.textContent,170);
 const href=url(li.querySelector(".nome-produto[href],a.produto-sobrepor[href],.produto-info > a[href],a[href]")?.getAttribute("href"));
 const imageEl=li.querySelector(".imagem-produto img")||li.querySelector("img");
 const image=pickImage(imageEl);
 const original=money(li.querySelector(".preco-venda")?.textContent);
 const promotional=money(li.querySelector(".preco-promocional")?.textContent);
 const regular=money(li.querySelector(".preco-produto .titulo")?.textContent);
 const current=promotional??regular??original;
 if(!name||!href||!image||current===null)return null;
 const old=original!==null&&original>current?original:null;
 const percent=old?Math.round((1-current/old)*100):null;
 const nativePercent=clean(li.querySelector(".desconto,[class*='selo-desconto'],[class*='percentual-desconto']")?.textContent,25)
   .match(/(\d{1,2})\s*%/)?.[1];
 const pixEl=li.querySelector(".desconto-a-vista,[data-avista],.listagem-avista-2");
 const pix=money(pixEl?.textContent);
 const pixPercent=clean(li.querySelector(".avista-desconto")?.textContent,70).match(/(\d+(?:[.,]\d+)?)\s*%/)?.[1]||"";
 const installmentText=clean(li.querySelector(".preco-parcela")?.textContent,160);
 const installmentMatch=installmentText.match(/(\d+)\s*x\s+de\s+(R\$\s*[\d.,]+)/i);
 return{
  key:li.dataset.id||li.className.match(/prod-id-(\d+)/)?.[1]||href,
  name,href,image,alt:clean(imageEl?.alt,170)||name,old,current,
  percent:percent&&percent>0?percent:nativePercent?Number(nativePercent):null,
  pix:pix!==null&&pix>0?pix:null,pixPercent,
  installment:installmentMatch?{
   count:Number(installmentMatch[1]),
   amount:clean(installmentMatch[2],45),
   noInterest:/sem juros/i.test(installmentText)
  }:null
 };
}
function pixIcon(){
 const svg=document.createElementNS("http://www.w3.org/2000/svg","svg");
 svg.setAttribute("viewBox","0 0 24 24");
 svg.setAttribute("aria-hidden","true");
 svg.setAttribute("fill","currentColor");
 for(const d of [
  "M12 1.6 18.6 8.2 12 14.8 5.4 8.2 12 1.6Z",
  "M19.2 8.8 23 12.6l-6.6 6.6-3.8-3.8 6.6-6.6Z",
  "M5.4 8.8 11.9 15.4l-3.8 3.8L1.5 12.6l3.9-3.8Z",
  "M12 16.2 15.8 20 12 23.8 8.2 20 12 16.2Z"
 ]){const p=document.createElementNS("http://www.w3.org/2000/svg","path");p.setAttribute("d",d);svg.appendChild(p)}
 return svg;
}
function makeCard(p){
 const card=node("article","n27-listing__card");
 card.dataset.n27Product=p.key;
 const media=node("a","n27-listing__media");
 media.href=p.href;media.setAttribute("aria-label","Ver "+p.name);
 const img=node("img");
 img.src=art(p.image,800);
 if(img.src!==p.image){
  img.srcset=[500,800,1000].map(size=>art(p.image,size)+" "+size+"w").join(", ");
  img.sizes="(max-width: 767px) 47vw,(max-width: 1150px) 31vw,(max-width: 1450px) 23vw,230px";
 }
 img.alt=p.alt;img.width=300;img.height=300;img.loading="lazy";img.decoding="async";
 media.append(img);
 if(p.percent){
  media.append(node("span","n27-listing__badge",p.percent+"% OFF"));
 }
 card.append(media);
 const info=node("div","n27-listing__info");
 const title=node("a","n27-listing__name",p.name);title.href=p.href;
 info.append(title);
 const prices=node("div","n27-listing__prices");
 const row=node("div","n27-listing__price-row");
 if(p.old!==null)row.append(node("del","n27-listing__old",brl(p.old)));
 row.append(node("strong","n27-listing__price",brl(p.current)));
 prices.append(row);
 if(p.installment){
  const installment=node("span","n27-listing__installment");
  installment.append(document.createTextNode("até "));
  installment.append(node("b","",p.installment.count+"x"));
  installment.append(document.createTextNode(" de "));
  installment.append(node("b","",p.installment.amount));
  if(p.installment.noInterest)installment.append(document.createTextNode(" sem juros"));
  prices.append(installment);
 }
 info.append(prices);
 const pix=node("div","n27-listing__pix");
 if(p.pix!==null){
  pix.append(pixIcon());
  const details=node("span","n27-listing__pix-details");
  const line=node("span","n27-listing__pix-line");
  line.append(node("b","",brl(p.pix)));
  line.append(document.createTextNode(" no pix"));
  details.append(line);
  if(p.pixPercent)details.append(node("span","n27-listing__pix-note","com "+p.pixPercent+"% de desconto"));
  pix.append(details);
 }else pix.classList.add("n27-listing__pix--empty");
 info.append(pix);card.append(info);
 return card;
}
function findSource(){
 if(!document.body||
    !(document.body.classList.contains("pagina-categoria")||
      document.body.classList.contains("pagina-busca")||
      document.body.classList.contains("pagina-marca")||
      path==="/mais-vendidos"||path==="/buscar"))return null;
 const options=[...document.querySelectorAll("#corpo .listagem")].filter(el=>
  !el.closest(".vitrine-produtos,.n27-best-shelf,.n27-approved")&&
  el.querySelectorAll(".listagem-item").length>0);
 return options.sort((a,b)=>b.querySelectorAll(".listagem-item").length-a.querySelectorAll(".listagem-item").length)[0]||null;
}
function nativeLists(root){
 return [...root.querySelectorAll("ul.produtos-linha,ul[data-produtos-linha],ul[class*='produtos-linha']")]
  .filter(ul=>ul.querySelector(".listagem-item"));
}
function originalCards(root){
 const lists=nativeLists(root);
 const items=lists.length?lists.flatMap(list=>[...list.querySelectorAll(".listagem-item")]):
  [...root.querySelectorAll(".listagem-item")];
 return [...new Set(items)].filter(item=>!item.closest(".slick-cloned,.owl-item.cloned,.swiper-slide-duplicate"));
}
function signatureOf(items){
 return JSON.stringify(items.map(i=>[
  i.key,i.href,i.name,i.image,i.old,i.current,i.pix,
  i.pixPercent,i.percent,i.installment?.amount,i.installment?.count
 ]));
}
function clearNativeFlag(){
 document.documentElement.removeAttribute("data-n27-listing");
 document.querySelectorAll("[data-n27-listing-native]").forEach(e=>delete e.dataset.n27ListingNative);
}
function mount(){
 if(!allowed())return;
 const found=findSource();
 if(!found)return;
 const native=originalCards(found);
 const products=[],seen=new Set();
 for(const li of native){
  const item=collectItem(li);
  if(!item)continue;
  if(seen.has(item.key))continue;
  products.push(item);seen.add(item.key);
 }
 // All genuine list items must have intact links, pricing and imagery,
 // otherwise leave the original LI cards visible rather than drop products.
 if(!products.length||products.length!==native.length){
  root?.remove();root=null;signature="";clearNativeFlag();return;
 }
 const key=signatureOf(products);
 if(found===source&&root?.isConnected&&key===signature)return;
 const lists=nativeLists(found);
 const firstRow=lists[0]?.closest(".listagem-linha")||lists[0]||native[0]?.parentElement;
 if(!firstRow?.parentNode)return;
 if(found!==source){observer?.disconnect();observer=null;}
 const section=node("section","n27-listing");section.id=ID;
 section.setAttribute("aria-label","Produtos da listagem Nichelle Imports");
 const grid=node("div","n27-listing__grid");
 products.forEach(product=>grid.append(makeCard(product)));
 section.append(grid);
 firstRow.before(section);
 root?.remove();root=section;source=found;signature=key;
 const rows=lists.map(list=>list.closest(".listagem-linha")||list);
 rows.forEach(row=>row.dataset.n27ListingNative="1");
 document.documentElement.dataset.n27Listing="1";
 if(!observer){
  observer=new MutationObserver(records=>{
   if(!records.some(r=>
     !r.target.closest?.("#"+ID)&&
     (!r.addedNodes.length||[...r.addedNodes].some(n=>n.nodeType!==1||!n.closest?.("#"+ID)))
   ))return;
   schedule();
  });
  observer.observe(found,{childList:true,subtree:true,characterData:true,
   attributes:true,attributeFilter:["src","data-src","data-imagem-caminho"]});
 }
}
function schedule(){
 if(scheduled)return;
 scheduled=true;setTimeout(()=>{scheduled=false;mount()},120);
}
if(document.readyState==="loading")document.addEventListener("DOMContentLoaded",mount,{once:true});
else mount();
window.addEventListener("load",mount,{once:true});
[250,850,1800,3200].forEach(n=>setTimeout(mount,n));
document.addEventListener("nichelle27:refresh",schedule);
window.NichelleListingFWR={version:"1.0.0",refresh:schedule};
})();
