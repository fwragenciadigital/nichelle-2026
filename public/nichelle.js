/* Nichelle 2026 — runtime FWR. Uma única URL para funcionalidades customizadas.
   Configurações ficam no HTML editável da Loja Integrada; não usa JSON remoto. */
(function () {
  "use strict";
  if (window.__FWR_NICHELLE_RUNTIME__) return;
  window.__FWR_NICHELLE_RUNTIME__ = true;

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
    function close() {
      if (!modal) return;
      const iframe = modal.querySelector("iframe");
      if (iframe) iframe.remove();
      modal.remove(); modal = null;
      document.removeEventListener("keydown", onKey);
      document.removeEventListener("focusin", keepFocus);
      document.body.style.overflow = originalOverflow;
      priorInert.forEach(function (row) {
        row[0].inert = row[1];
        if (row[2] === null) row[0].removeAttribute("aria-hidden");
        else row[0].setAttribute("aria-hidden", row[2]);
      });
      priorInert = [];
      if (lastFocus && lastFocus.isConnected) lastFocus.focus();
    }
    function onKey(event) {
      if (!modal) return;
      if (event.key === "Escape") { event.preventDefault(); close(); return; }
      if (event.key !== "Tab") return;
      const controls = Array.from(modal.querySelectorAll("button,iframe"));
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
    function play(card, button) {
      lastFocus = button; originalOverflow = document.body.style.overflow;
      modal = document.createElement("div");
      modal.className = "fwr-nichelle-video-modal";
      const dialog = document.createElement("div");
      dialog.className = "fwr-nichelle-video-modal__dialog";
      dialog.setAttribute("role", "dialog");
      dialog.setAttribute("aria-modal", "true");
      dialog.setAttribute("aria-label", card.alt);
      const closeButton = document.createElement("button");
      closeButton.className = "fwr-nichelle-video-modal__close";
      closeButton.type = "button"; closeButton.textContent = "×";
      closeButton.setAttribute("aria-label", "Fechar vídeo");
      closeButton.addEventListener("click", close);
      const iframe = document.createElement("iframe");
      iframe.className = "fwr-nichelle-video-modal__media";
      iframe.title = card.alt; iframe.allow = "autoplay; encrypted-media; fullscreen; picture-in-picture";
      iframe.allowFullscreen = true; iframe.referrerPolicy = "strict-origin-when-cross-origin";
      iframe.src = "https://www.youtube-nocookie.com/embed/" + card.id + "?autoplay=1&playsinline=1&rel=0";
      dialog.append(closeButton, iframe); modal.append(dialog);
      modal.addEventListener("click", function (e) { if (e.target === modal) close(); });
      document.body.append(modal);
      priorInert = Array.from(document.body.children).filter(function (el) { return el !== modal; })
        .map(function (el) { return [el, el.inert, el.getAttribute("aria-hidden")]; });
      priorInert.forEach(function (row) { row[0].inert = true; row[0].setAttribute("aria-hidden", "true"); });
      document.body.style.overflow = "hidden";
      document.addEventListener("keydown", onKey);
      document.addEventListener("focusin", keepFocus);
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
      button.addEventListener("click", function () { play(card, button); });
      track.append(button);
    });
    section.append(track); slot.replaceChildren(section);
  }

  function start() {
    initVideoGallery();
    /* Adicionar futuras funções exclusivas aqui, sem recriar recursos nativos da LI. */
  }
  if (document.readyState === "loading") document.addEventListener("DOMContentLoaded", start, {once:true});
  else start();
})();
