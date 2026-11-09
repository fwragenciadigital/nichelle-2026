/* Nichelle 2026 — runtime FWR. Uma única URL para funcionalidades customizadas.
   Configurações ficam no HTML editável da Loja Integrada; não usa JSON remoto. */
(function () {
  "use strict";
  if (window.__FWR_NICHELLE_RUNTIME__) return;
  window.__FWR_NICHELLE_RUNTIME__ = true;

  // CSS padrão versionado no JS oficial. O editor LI pode sobrescrever regras após o carregamento.
  function installStyles() {
    if (document.getElementById("fwr-nichelle-styles")) return;
    const css = "#fwr-nichelle-video-slot{box-sizing:border-box;width:100%;max-width:1440px;margin-inline:auto}\n#fwr-nichelle-video-slot[data-fwr-active=\"1\"]{min-height:clamp(440px,calc(135.12vw + 84px),650px)}\n#fwr-nichelle-video-slot .fwr-nichelle-videos{padding:20px 18px 38px}\n#fwr-nichelle-video-slot .fwr-nichelle-videos *{box-sizing:border-box}\n#fwr-nichelle-video-slot .fwr-nichelle-videos__track{display:grid;grid-auto-flow:column;grid-auto-columns:min(76vw,310px);gap:12px;overflow-x:auto;scroll-snap-type:x mandatory;padding:4px 0 12px}\n#fwr-nichelle-video-slot .fwr-nichelle-videos__card{appearance:none;position:relative;display:block;width:100%;aspect-ratio:9/16;border:0;border-radius:20px;overflow:hidden;background:#ded8dc;cursor:pointer;scroll-snap-align:start;padding:0}\n#fwr-nichelle-video-slot .fwr-nichelle-videos__poster{display:block;width:100%;height:100%;object-fit:cover}\n#fwr-nichelle-video-slot .fwr-nichelle-videos__card::after{content:\"\";position:absolute;inset:0;background:rgba(0,0,0,.20);pointer-events:none}\n#fwr-nichelle-video-slot .fwr-nichelle-videos__play{position:absolute;z-index:2;left:50%;top:50%;transform:translate(-50%,-50%);pointer-events:none;filter:drop-shadow(0 2px 4px #3335)}\n#fwr-nichelle-video-slot .fwr-nichelle-videos__play svg{display:block;width:46px;height:46px;fill:#fff}\n#fwr-nichelle-video-slot .fwr-nichelle-videos__fallback{position:absolute;z-index:1;bottom:10px;left:12px;right:12px;padding:8px;background:#161616c9;color:white;text-align:center;font:500 12px/1.4 Arial,sans-serif;border-radius:8px}\n#fwr-nichelle-video-slot .fwr-nichelle-videos__fallback[hidden]{display:none}\n#fwr-nichelle-video-slot .fwr-nichelle-videos__card:focus-visible{outline:3px solid #fff;outline-offset:-5px}\n@media (min-width:768px){\n  #fwr-nichelle-video-slot[data-fwr-active=\"1\"]{min-height:clamp(420px,calc(42vw + 72px),700px)}\n  #fwr-nichelle-video-slot .fwr-nichelle-videos{padding:28px 24px 42px}\n  #fwr-nichelle-video-slot .fwr-nichelle-videos__track{grid-auto-flow:row;grid-auto-columns:auto;grid-template-columns:repeat(4,minmax(0,1fr));gap:clamp(12px,1.8vw,30px);overflow:visible;scroll-snap-type:none}\n}\n.fwr-nichelle-video-modal{position:fixed;inset:0;z-index:2147482000;background:#000d;display:grid;place-items:center;padding:20px}\n.fwr-nichelle-video-modal__dialog{position:relative;width:min(450px,92vw);height:min(80vh,800px);aspect-ratio:9/16;border-radius:16px;background:#111}\n.fwr-nichelle-video-modal__media{display:block;width:100%;height:100%;border:0;border-radius:16px}\n.fwr-nichelle-video-modal__close{position:absolute;z-index:2;right:-12px;top:-12px;width:40px;height:40px;border:0;border-radius:50%;background:white;color:#111;font-size:25px;cursor:pointer}\n/* Navegação entre Shorts somente quando o modal é aberto. */\n.fwr-nichelle-video-modal{padding:18px 18px 72px}\n.fwr-nichelle-video-modal__dialog{width:min(450px,92vw,42.75vh);height:auto;aspect-ratio:9/16;max-height:76vh}\n.fwr-nichelle-video-modal__controls{position:absolute;z-index:4;top:calc(100% + 12px);left:50%;transform:translateX(-50%);display:flex;align-items:center;justify-content:center;gap:15px;min-width:245px;color:#fff;touch-action:pan-y;user-select:none}\n.fwr-nichelle-video-modal__controls[hidden]{display:none!important}\n.fwr-nichelle-video-modal__nav{display:grid;place-items:center;flex:none;width:44px;height:44px;padding:0;border:1px solid #fff7;border-radius:50%;background:#242424;color:#fff;cursor:pointer;font:400 34px/1 Arial,sans-serif}\n.fwr-nichelle-video-modal__nav:focus-visible,.fwr-nichelle-video-modal__close:focus-visible{outline:3px solid #fff;outline-offset:3px}\n.fwr-nichelle-video-modal__position{min-width:92px;text-align:center;font:600 13px/1.3 Arial,sans-serif}\n.fwr-nichelle-video-modal__hint{display:block;margin-top:3px;white-space:nowrap;font:400 10px/1.3 Arial,sans-serif;color:#ffffffb8}\n@media(min-width:768px){.fwr-nichelle-video-modal__hint{display:none}}\n";
    const el = document.createElement("style");
    el.id = "fwr-nichelle-styles";
    el.textContent = css;
    (document.head || document.documentElement).appendChild(el);
  }
  installStyles();

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

  function initVideoGallery() {
    const slot = document.querySelector("#fwr-nichelle-video-slot");
    if (!slot || slot.dataset.fwrInitialized === "1") return;
    const opts = window.FWRNichelle && window.FWRNichelle.galeriaVideos;
    if (!opts || opts.ativo !== true) return;
    const cards = normalizedCards(opts);
    if (!cards.length) return;
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
    const origem = ["mini", "categoria"].includes(cfg.origem) ? cfg.origem : "vitrine";
    const slot = document.getElementById("fwr-nichelle-vitrine-slot");
    if (!slot || slot.dataset.fwrInitialized === "1") return;
    // Não renderizar nem alterar os banners nativos sem todos os quatro nomes.
    const names = Array.isArray(cfg.nomes) ? cfg.nomes.slice(0, 4) : [];
    if (names.length !== 4 || names.some(function (n) { return typeof n !== "string" || !n.trim(); })) return;

    function key(s) {
      return String(s || "").normalize("NFD").replace(/[\u0300-\u036f]/g, "")
        .replace(/\s+/g, " ").trim().toLowerCase();
    }
    const required = names.map(key);
    if (new Set(required).size !== 4) return;

    function safeURL(value) {
      if (!value || typeof value !== "string") return "";
      try {
        const u = new URL(value.trim(), window.location.href);
        return (u.protocol === "https:" || (u.protocol === "http:" && u.origin === window.location.origin)) ? u.href : "";
      } catch (_) { return ""; }
    }

    function findNative() {
      const selected = [];
      const images = Array.from(document.querySelectorAll("img[alt],img[title]"));
      for (const name of required) {
        const img = images.find(function (candidate) {
          if (candidate.closest("#fwr-nichelle-vitrine-slot")) return false;
          if (key(candidate.getAttribute("alt") || candidate.getAttribute("title")) !== name) return false;
          // Mini Banner e Full Banner em categorias podem ter classes distintas.
          // Usar nome ALT exato impede capturar outras artes da loja; ignorar clones
          // de carrosséis para preservar a ordem e a origem real dos banners.
          if (origem === "categoria" || origem === "mini") {
            return !candidate.closest(".slick-cloned, .swiper-slide-duplicate, [aria-hidden='true']");
          }
          const src = candidate.currentSrc || candidate.getAttribute("data-src") ||
            candidate.getAttribute("data-original") || candidate.getAttribute("src") || "";
          return !!candidate.closest(".banner.vitrine, .banner-vitrine, [class*='banner-vitrine'], .secao-banners") ||
            /\/banner\//i.test(src);
        });
        if (!img) return [];
        const src = safeURL(img.getAttribute("data-src") || img.getAttribute("data-original") ||
          img.getAttribute("data-lazy") || img.currentSrc || img.getAttribute("src"));
        if (!src) return [];
        const link = img.closest("a[href]");
        const destination = link && safeURL(link.getAttribute("href"));
        selected.push({ img: img, src: src, link: link, destination: destination });
      }
      return selected;
    }

    function mount(banners) {
      if (slot.dataset.fwrInitialized === "1" || banners.length !== 4) return;
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
        image.alt = banner.img.getAttribute("alt") || names[index];
        image.loading = "lazy";
        image.decoding = "async";
        image.width = 600;
        image.height = 1000;
        image.removeAttribute("style");
        if (picture) card.appendChild(picture);
        else card.appendChild(image);
        grid.appendChild(card);
      });
      if (grid.children.length !== 4) return;
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
      if (found.length !== 4) return false;
      mount(found);
      if (observer) observer.disconnect();
      if (timer) clearTimeout(timer);
      return true;
    }
    if (attempt()) return;
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
    initVideoGallery();
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
    const images = Array.from(document.querySelectorAll("img[alt], img[title]"));
    const norm = function (value) {
      return String(value || "").normalize("NFD").replace(/[\u0300-\u036f]/g, "")
        .replace(/\s+/g, " ").trim().toLowerCase();
    };
    const names = Array.isArray(cfg.nomes) ? cfg.nomes.slice(0, 4) : [];
    return {
      pagina: window.location.pathname,
      ativo: cfg.ativo === true,
      origem: ["mini", "categoria"].includes(cfg.origem) ? cfg.origem : "vitrine",
      slotEncontrado: !!slot,
      galeriaMontada: !!(slot && slot.dataset.fwrInitialized === "1"),
      banners: names.map(function (name) {
        const normalized = norm(name);
        return { nome: name, imagemNoDOM: images.some(function (img) {
          return norm(img.getAttribute("alt") || img.getAttribute("title")) === normalized;
        }) };
      })
    };
  };

  document.addEventListener("fwr:nichelle:banner-config", initBannerVitrine);
  document.addEventListener("fwr:nichelle:news-config", initNoticias);
  if (document.readyState === "loading") document.addEventListener("DOMContentLoaded", start, {once:true});
  else start();
})();
