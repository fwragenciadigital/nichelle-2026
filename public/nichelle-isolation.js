/*
 * Nichelle 2026 — isolamento visual do tema ativo na home de homologação.
 * Não desinstala o tema. Reaproveita DOM, links e dados reais da Loja Integrada.
 * Apenas ?nichelle_preview=1, com Nichelle27Settings.geral.modoPreview=true.
 */
(function () {
  "use strict";
  if (!window.Nichelle27Activation?.onStore() ||
      !window.Nichelle27Activation?.active() ||
      location.pathname.replace(/\/+$/, "") !== "") return;

  function active() {
    return window.Nichelle27Activation?.active() === true;
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
      stage.setAttribute("aria-label", window.Nichelle27Activation?.published() ?
        "Conteúdo da Nichelle Imports" : "Layout Nichelle Imports 2026 em homologação");
      corpo.insertBefore(stage, corpo.firstChild);
    }

    // O tema deixa a vitrine Mais vendidos sem seus produtos e move um UL
    // com 20 cards para #corpo, gerando uma lacuna de milhares de pixels.
    const best = direct(corpo, ".vitrine-produtos:is(.vitrine-24488857,.vitrine-mas-vendido,.vitrine-mais-vendidos)") ||
      direct(stage, ".vitrine-produtos:is(.vitrine-24488857,.vitrine-mas-vendido,.vitrine-mais-vendidos)");
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
      ".vitrine-produtos:is(.vitrine-24488857,.vitrine-mas-vendido,.vitrine-mais-vendidos)",
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
