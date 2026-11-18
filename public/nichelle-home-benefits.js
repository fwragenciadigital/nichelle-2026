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
      !window.Nichelle27Activation?.active()) return;

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
    return window.Nichelle27Activation?.active() === true;
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
