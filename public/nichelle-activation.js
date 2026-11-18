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
  const STORE = /^(www\.)?nichelleimports\.com\.br$/i;
  function onStore() { return STORE.test(location.hostname); }
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
    active, published, preview, href
  });
})();
