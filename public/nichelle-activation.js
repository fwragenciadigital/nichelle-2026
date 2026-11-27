/*
 * Nichelle Imports | Gate central de homologacao e publicacao.
 *
 * O CSS/JS hospedado na Vercel nao ativa sozinho na loja:
 * o HTML da Loja Integrada precisa configurar `geral.publicarNaLoja:true`
 * (ou `modoPreview:true` + ?nichelle_preview=1).
 *
 * Nao executa no checkout, nem modifica transacoes, pedidos ou pagamentos.
 */
(function () {
  "use strict";
  // Dominios autorizados: oficial + manutencao desta mesma loja (nao aceitar outras lojas LI).
  const STORE = /^(?:(?:www\.)?nichelleimports\.com\.br|nichelle-imports-manutencao\.lojaintegrada\.com\.br)$/i;
  // Login/cadastro e rotas de leitura da conta recebem a camada visual FWR: a LI continua
  // dona dos formularios, validacoes, autenticacao e redirecionamentos.
  const ACCOUNT_VISUAL = /^\/conta\/(?:login|criar|index|pedido\/listar|favorito\/listar)\/?$/i;
  const BLOCKED = /^\/(?:checkout|finalizar-pedido|login|conta|pedido|meus-pedidos|carrinho\/(?:produto|cupom|frete|checkout))(?:\/|$)/i;
  function onStore() {
    return STORE.test(location.hostname) &&
      (ACCOUNT_VISUAL.test(location.pathname)||!BLOCKED.test(location.pathname));
  }
  function settings() { return window.Nichelle27Settings?.geral || {}; }
  function published() {
    const g = settings();
    return onStore() && g.ativo === true && g.publicarNaLoja === true;
  }
  function preview() {
    const g = settings();
    return onStore() && g.ativo === true && g.publicarNaLoja !== true &&
      g.modoPreview === true &&
      new URLSearchParams(location.search).get("nichelle_preview") === "1";
  }
  function active() { return published() || preview(); }
  function href(path) {
    if (!preview()) return path;
    const url = new URL(path, location.origin);
    if (url.origin !== location.origin) return path;
    url.searchParams.set("nichelle_preview", "1");
    return url.pathname + url.search + url.hash;
  }
  window.Nichelle27Activation = Object.freeze({
    onStore, active, published, preview, href
  });
})();

