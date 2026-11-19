/* FWR Nichelle 2026 — extensão local MV3; ativação manual, apenas na aba atual. */
"use strict";
// O pacote inclui JS/CSS do commit homologado. Não depende da quota Vercel nem de CSP externo.
const statusEl = document.getElementById("status");
const buttons = [...document.querySelectorAll("button")];
const allowed = url => {
  try {
    const u = new URL(url);
    return u.protocol === "https:" && ["www.nichelleimports.com.br", "nichelleimports.com.br"].includes(u.hostname);
  } catch { return false; }
};
async function currentTab() {
  const tabs = await chrome.tabs.query({ active: true, currentWindow: true });
  const tab = tabs[0];
  if (!tab || !tab.id || !allowed(tab.url)) throw new Error("Abra a loja Nichelle (domínio oficial) na aba atual.");
  return tab;
}
function setStatus(value, error=false) {
  statusEl.textContent = value;
  statusEl.style.color = error ? "#a62020" : "#39313e";
}
async function action(mode) {
  buttons.forEach(b => b.disabled = true);
  setStatus("Executando na aba atual...");
  try {
    const tab = await currentTab();
    if (mode === "reset") {
      await chrome.tabs.reload(tab.id);
      setStatus("Página recarregada. O modo privado foi desativado.");
      return;
    }
    const result = await chrome.scripting.executeScript({
      target: { tabId: tab.id }, world: "MAIN",
      func: mode === "inspect" ? inspectSite : enablePrivate,
      args: mode === "inspect" ? [] : [mode]
    });
    let report = result[0]?.result;
    if (!report?.ok) throw new Error(report?.message || "A aba não respondeu.");
    if (mode !== "inspect" && !report.alreadyActive) {
      // Assets locais empacotados a partir de public/nichelle27.js/.css.
      await chrome.scripting.insertCSS({ target: { tabId: tab.id }, files: ["nichelle27.css"] });
      await chrome.scripting.executeScript({ target: { tabId: tab.id }, world: "MAIN", files: ["nichelle27.js"] });
      const done = await chrome.scripting.executeScript({ target: { tabId: tab.id }, world: "MAIN", func: finishPrivate });
      report = done[0]?.result;
      if (!report?.ok) throw new Error(report?.message || "A montagem falhou.");
    }
    setStatus(report.message + (report.details ? "\n" + report.details : ""));
  } catch(e) {
    setStatus("Não foi possível executar: " + String(e.message || e), true);
  } finally {
    buttons.forEach(b => b.disabled = false);
  }
}
function inspectSite() {
  const main = document.querySelector("#corpo .secao-principal .conteudo") ||
    document.querySelector("#corpo .conteudo") || document.querySelector("main");
  const shelves = main ? [...main.querySelectorAll(".listagem-produtos")].filter(x =>
    x.querySelectorAll(".listagem-item").length > 0 && !x.closest("header,nav,.cabecalho")
  ) : [];
  const diagnosis = window.FWRNichelle?.diagnosticoBanners?.();
  const active = window.__FWR_NICHELLE_PRIVATE_MODE__ === true;
  return { ok:true, message: active ? "Modo FWR ativo nesta aba." : "Modo FWR desligado.",
    details: "Conteúdo principal: " + (main ? "encontrado" : "não encontrado") +
      " · vitrines nativas: " + shelves.length +
      " · banner FWR: " + (diagnosis?.galeriaMontada ? "montado" : "não montado") +
      " · framework: " + (window.Nichelle27Framework?.version || "não carregado") };
}
function enablePrivate(mode) {
  if (!["visual", "advanced"].includes(mode)) return {ok:false,message:"Modo inválido"};
  if (location.protocol !== "https:" || !["www.nichelleimports.com.br", "nichelleimports.com.br"].includes(location.hostname)) {
    return {ok:false,message:"Esta extensão funciona somente no domínio oficial da Nichelle."};
  }
  const main = document.querySelector("#corpo .secao-principal .conteudo") ||
    document.querySelector("#corpo .conteudo") || document.querySelector("main");
  if (!main || main.closest("header,nav,.cabecalho")) return {ok:false,message:"Área de conteúdo não identificada. Nenhum módulo foi ativado."};
  if (window.__FWR_NICHELLE_PRIVATE_MODE__ === true) {
    return {ok:true,alreadyActive:true,message:"O modo FWR já está ativo. Recarregue para mudar de modo.",
      details: "Módulos: " + (window.Nichelle27Framework?.diagnostico?.().montados || []).join(", ")};
  }
  // A LI pode já ter carregado um Nichelle27 antigo (inicializado, mas bloqueado).
  // Substituir SOMENTE o objeto de runtime na aba local, antes de injetar a versão empacotada.
  // A atualização da página restaura o runtime original normalmente.
  if (window.Nichelle27Framework?.initialized) {
    try { delete window.Nichelle27Framework; }
    catch (_) { return {ok:false,message:"Runtime existente não pode ser substituído em modo privado."}; }
    if (window.Nichelle27Framework) return {ok:false,message:"Runtime anterior ainda ativo. Atualize a página."};
  }
  const root = document.getElementById("n27-layout-root");
  if (root && !main.contains(root)) return {ok:false,message:"Slot n27-layout-root fora do conteúdo principal. Interrompido por segurança."};
  const shelfNodes = mode === "advanced" ? [...main.querySelectorAll(".listagem-produtos")]
    .filter(x => x.querySelectorAll(".listagem-item").length >= 3 &&
      !x.closest("header,nav,.cabecalho,.menu") &&
      getComputedStyle(x).visibility !== "hidden" && x.getBoundingClientRect().width >= 180).slice(0,3) : [];
  if (!root) {
    const newRoot = document.createElement("div");
    newRoot.id = "n27-layout-root";
    main.insertBefore(newRoot, main.firstElementChild || null);
  }
  shelfNodes.forEach((node,i) => node.setAttribute("data-n27-private-shelf",String(i)));
  const shelf = (i,title,highlight)=>({
    ativo: mode === "advanced" && shelfNodes.length > i,
    titulo: title,destaque:highlight,
    seletorFonte: '[data-n27-private-shelf="' + i + '"]',seletorItem: ".listagem-item"
  });
  window.Nichelle27Settings = {
    geral: {ativo:true, debug:true, paginas:[location.pathname]},
    layout: {ativo:true,seletor:"#n27-layout-root"},
    // Não movimentar Shorts/banners/notícias no modo seguro.
    integracoes: {banners:mode==="advanced",videos:mode==="advanced",noticias:mode==="advanced"},
    topo: {ativo:false},rodape:{ativo:false},
    qualificadores: {ativo:true,rotulo:"VANTAGENS (TESTE FWR)",itens:[
      {icone:"caixa",texto:"INFORMAÇÃO DE ENTREGA A CONFIRMAR"},
      {icone:"original",texto:"ORIGINALIDADE · TEXTO A CONFIRMAR"},
      {icone:"atendimento",texto:"ATENDIMENTO · TEXTO A CONFIRMAR"},
      {icone:"selo",texto:"VANTAGENS · TEXTO A CONFIRMAR"}
    ]},
    maisVendidos:shelf(0,"Produtos","Mais Vendidos"),
    lancamentos:shelf(1,"Produtos","Lançamentos"),
    promocoes:shelf(2,"Produtos","Promocionais"),
    marcas:{ativo:false},newsletter:{ativo:false},instagram:{ativo:false},empresa:{ativo:false}
  };
  window.__FWR_NICHELLE_PRIVATE_MODE__ = true;
  document.documentElement.dataset.n27PrivateMode = "fwr-local-extension";
  return {ok:true,message:"Navegador preparado para a prévia FWR.",
    details:"Modo: "+(mode==="advanced"?"avançado":"seguro")+
      " · vitrines reais detectadas: "+shelfNodes.length};
}
function finishPrivate() {
  try {
    const status=window.Nichelle27Framework?.mount();
    if(!status || status.bloqueado===true) throw Error("Framework não autorizado neste navegador.");
    const report=window.Nichelle27Framework?.diagnostico?.();
    let badge=document.getElementById("n27-private-badge");
    if(!badge) {
      badge=document.createElement("div");badge.id="n27-private-badge";
      badge.textContent="PRÉVIA FWR · APENAS NESTE NAVEGADOR";
      badge.style.cssText="position:fixed!important;bottom:12px;left:12px;z-index:2147483000;padding:10px 14px;background:#700092;color:white;border-radius:9px;font:700 11px/1.2 Arial,sans-serif;box-shadow:0 4px 20px #0004;pointer-events:none";
      document.body.appendChild(badge);
    }
    return {ok:true,message:"Prévia FWR ativada somente nesta aba.",details:
      "Módulos montados: "+(report?.montados||[]).join(", ")+
      " · Para desligar: recarregue a página."};
  }catch(e){return {ok:false,message:String(e.message||e)+". Recarregue para restaurar."};}
}
document.getElementById("inspect").addEventListener("click",()=>action("inspect"));
document.getElementById("visual").addEventListener("click",()=>action("visual"));
document.getElementById("advanced").addEventListener("click",()=>action("advanced"));
document.getElementById("reset").addEventListener("click",()=>action("reset"));
