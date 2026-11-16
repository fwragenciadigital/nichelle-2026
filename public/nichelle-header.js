/*
 * FWR | Nichelle Imports — topo aprovado 2026
 * Preview-only. Reaproveita logo, busca, atendimento, conta e carrinho da LI.
 * Não cria formulários, conta, checkout ou carrinho paralelos.
 */
(function () {
  "use strict";

  const qs = new URLSearchParams(location.search);
  if (!/^(www\.)?nichelleimports\.com\.br$/i.test(location.hostname) ||
      qs.get("nichelle_preview") !== "1" ||
      (location.pathname.replace(/\/+$/, "") || "/") !== "/") return;

  function permitted() {
    const s = window.Nichelle27Settings;
    return !!(s && s.geral && s.geral.ativo === true &&
      s.geral.modoPreview === true && s.geral.publicarNaLoja !== true);
  }
  function tag(name, classes, text) {
    const n = document.createElement(name);
    if (classes) n.className = classes;
    if (text !== undefined) n.textContent = text;
    return n;
  }
  const icons = Object.freeze({
    safe: '<path d="M7 10V7a5 5 0 0 1 10 0v3"/><rect x="5" y="10" width="14" height="11" rx="2"/><path d="M12 14v3"/>',
    truck: '<rect x="2" y="5" width="13" height="12" rx="1"/><path d="M15 9h4l3 4v4h-7M6 17a2 2 0 1 0 4 0M17 17a2 2 0 1 0 4 0"/>',
    card: '<rect x="2" y="5" width="20" height="14" rx="2"/><path d="M2 10h20M6 15h6"/>',
    exchange: '<path d="M20 7h-12a5 5 0 0 0-5 5M4 7h16l-4-4M4 17h12a5 5 0 0 0 5-5M20 17H4l4 4"/>',
    star: '<path d="m12 2 3.1 6.3 7 .9-5 4.9 1.2 7-6.3-3.3-6.3 3.3 1.2-7-5-4.9 7-.9Z" fill="currentColor" stroke="none"/>',
    skincare: '<path d="M12 2c5.2 0 8.5 4 8.5 9.5 0 5.6-4 10.5-8.5 10.5S3.5 17.1 3.5 11.5C3.5 6 6.8 2 12 2Z" fill="currentColor" stroke="none"/><circle cx="9" cy="11" r="1.2" fill="#8000a5"/><circle cx="15" cy="11" r="1.2" fill="#8000a5"/><path d="M9 16c1.6 1.4 4.4 1.4 6 0" stroke="#8000a5"/>',
    type: '<path d="M3 14 14 3a2.3 2.3 0 0 1 3.3 0l3.7 3.7a2.3 2.3 0 0 1 0 3.3L10 21a3 3 0 0 1-4.2 0L3 18.2A3 3 0 0 1 3 14Z"/><path d="m12 5 7 7M6 17l4 4M7 11l2 2"/>',
    needs: '<path d="m5 19 13-13 2 2L7 21H5Z"/><path d="M18 2v3M22 6h-3M17 11l-2-2M4 6V3M2 5h4"/>',
    heart: '<path d="M20.8 5.4a5.3 5.3 0 0 0-7.5 0L12 6.7l-1.3-1.3a5.3 5.3 0 0 0-7.5 7.5L12 21l8.8-8.1a5.3 5.3 0 0 0 0-7.5Z" fill="currentColor" stroke="none"/>',
    kits: '<rect x="3" y="9" width="7" height="12" rx="1"/><path d="M5 9V6h3v3M6.5 3v3"/><rect x="13" y="6" width="8" height="15" rx="1"/><path d="M15 6V3h4v3M15 13h4M5 15h3"/>',
    brands: '<rect x="3" y="3" width="8" height="8" rx="1" fill="currentColor" stroke="none"/><rect x="13" y="3" width="8" height="8" rx="1" fill="currentColor" stroke="none"/><rect x="3" y="13" width="8" height="8" rx="1" fill="currentColor" stroke="none"/><rect x="13" y="13" width="8" height="8" rx="1" fill="currentColor" stroke="none"/>'
  });
  function icon(name, className) {
    const span = tag("span", className || "n27-h-icon");
    span.setAttribute("aria-hidden", "true");
    const svg = document.createElementNS("http://www.w3.org/2000/svg", "svg");
    svg.setAttribute("viewBox", "0 0 24 24");
    svg.setAttribute("fill", "none");
    svg.setAttribute("stroke", "currentColor");
    svg.setAttribute("stroke-width", "1.9");
    svg.setAttribute("stroke-linejoin", "round");
    svg.setAttribute("stroke-linecap", "round");
    svg.innerHTML = icons[name] || icons.star;
    span.appendChild(svg);
    return span;
  }
  function renderHighlights(header, anchor) {
    let bar = document.getElementById("n27-head-benefits");
    if (bar) return bar;
    bar = tag("div", "n27-head-benefits");
    bar.id = "n27-head-benefits";
    bar.setAttribute("aria-label", "Benefícios da Nichelle Imports");
    const track = tag("div", "n27-head-benefits__track");
    const data = [
      ["safe", "LOJA 100% SEGURA", "COM PROTEÇÃO DE CERTIFICADO SSL"],
      ["truck", "ENTREGA GARANTIDA", "PARA TODO O BRASIL"],
      ["card", "PARCELE SUAS COMPRAS", "EM ATÉ 10X NO CARTÃO"],
      ["exchange", "TROCA FÁCIL", "EM ATÉ 7 DIAS APÓS O RECEBIMENTO"]
    ];
    data.concat(data.slice(0, 3)).forEach(function (item, i) {
      const row = tag("div", "n27-head-benefits__item");
      if (i > 3) row.setAttribute("aria-hidden", "true");
      row.appendChild(icon(item[0], "n27-head-benefits__icon"));
      const copy = tag("span", "n27-head-benefits__copy");
      copy.append(tag("strong", "", item[1]), tag("span", "", " " + item[2]));
      row.appendChild(copy);
      track.appendChild(row);
    });
    bar.appendChild(track);
    header.insertBefore(bar, anchor);
    return bar;
  }
  function nativeHref(label, form, fallback) {
    const exact = Array.from(document.querySelectorAll(".menu-desktop a[href], .menu-mobile a[href]"))
      .find(function (a) {return a.textContent.replace(/\s+/g, " ").trim().toLowerCase() === label.toLowerCase();});
    if (exact) {
      try {
        const u = new URL(exact.href, location.origin);
        if (u.origin === location.origin && u.pathname !== "/") return u.pathname + u.search;
      } catch (_) {}
    }
    if (fallback) return fallback;
    const action = form?.getAttribute("action") || "/buscar";
    const field = form?.querySelector('input[name="q"]');
    const params = new URLSearchParams([[field?.name || "q", label]]);
    return action + "?" + params.toString();
  }
  function renderNav(header, anchor, form) {
    let nav = document.getElementById("n27-head-nav");
    if (nav) return nav;
    nav = tag("nav", "n27-head-nav");
    nav.id = "n27-head-nav";
    nav.setAttribute("aria-label", "Categorias principais");
    const track = tag("div", "n27-head-nav__inner");
    const items = [
      ["Mais Vendidos", "star", "Mais vendidos", "/mais-vendidos"],
      ["Skincare", "skincare", "Skincare", "/skincare"],
      ["Tipos de Pele", "type", "Tipos de Pele", ""],
      ["Necessidades da Pele", "needs", "Necessidades da Pele", ""],
      ["Cuidados Pessoais", "heart", "Corpo & Banho", "/corpo-banho"],
      ["Kits", "kits", "Kits", "/kits-de-skincare"],
      ["Marcas", "brands", "Marcas", "/marcas"]
    ];
    items.forEach(function (item) {
      const a = tag("a", "n27-head-nav__link");
      a.href = nativeHref(item[2], form, item[3]);
      a.append(icon(item[1]), tag("span", "n27-head-nav__label", item[0]));
      track.appendChild(a);
    });
    nav.appendChild(track);
    header.insertBefore(nav, anchor);
    return nav;
  }
  function mount() {
    if (!permitted()) return;
    const cabecalho = document.getElementById("cabecalho");
    const header = cabecalho?.closest("header");
    const inside = cabecalho?.querySelector(".cabecalho-inside");
    const logo = inside?.querySelector(".logo");
    const search = inside?.querySelector(".busca-mobile");
    const form = search?.querySelector("form#form-buscar");
    const painel = inside?.querySelector(".painel");
    const menu = inside?.querySelector(".mobile-left .menu-mobile-button");
    if (!header || !inside || !logo || !form || !painel || !menu) return;

    const searchField = form.querySelector('input[name="q"]');
    if (searchField) {
      searchField.placeholder = "Buscar na loja";
      searchField.setAttribute("aria-label", "Buscar na loja");
    }
    const support = painel.querySelector(".painel-atendimento");
    const account = painel.querySelector(".painel-conta");
    const contactTop = support?.querySelector(".a .b .c");
    const contactBottom = support?.querySelector(".a .b .d strong");
    if (contactTop) contactTop.textContent = "Atendimento";
    if (contactBottom) contactBottom.textContent = "Fale com nossa equipe";
    const accountTop = account?.querySelector(".a .b .c");
    if (accountTop) accountTop.textContent = "Meu Painel";
    const register = account?.querySelector(".a .b .d a:last-of-type");
    if (register) register.textContent = "Cadastrar-se";

    // Não recriar controles LI. Só aplica CSS Grid aos filhos existentes
    // de .cabecalho-inside e adiciona duas faixas de conteúdo aprovado.
    inside.classList.add("n27-head-main");
    cabecalho.classList.add("n27-head-base");
    menu.setAttribute("role", "button");
    menu.setAttribute("tabindex", "0");
    menu.setAttribute("aria-label", "Abrir menu de categorias");
    if (!menu.dataset.n27Keyboard) {
      menu.addEventListener("keydown", function (ev) {
        if (ev.key === "Enter" || ev.key === " ") {ev.preventDefault();menu.click();}
      });
      menu.dataset.n27Keyboard = "1";
    }
    renderHighlights(header, cabecalho);
    renderNav(header, header.querySelector(".menu-desktop") || null, form);
    document.documentElement.dataset.n27Header = "1";
  }

  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", mount, { once:true });
  } else mount();
  window.addEventListener("load", mount, { once:true });
  [220, 720, 1450, 2850, 4800].forEach(function (delay) {
    setTimeout(mount, delay);
  });
})();
