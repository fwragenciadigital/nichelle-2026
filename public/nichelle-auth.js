/*
 * Nichelle 2026 | Login e cadastro com identidade FWR.
 * Camada visual; nao le dados inseridos pelo cliente nem intercepta form submits.
 */
(function(){
  "use strict";
  const path=location.pathname.replace(/\/+$/,"");
  const page=path==="/conta/login"?"login":path==="/conta/criar"?"cadastro":null;
  if(!page||window.NichelleAuthFWR||!window.Nichelle27Activation?.active())return;
  const root=document.documentElement;
  root.dataset.n27Auth=page;
  function check(){
    const forms=document.querySelectorAll("#corpo form,main form");
    return {pagina:page,formulariosNativos:forms.length,
      actionPreservado:[...forms].every(f=>!!f.getAttribute("action")||!!f.id)};
  }
  window.NichelleAuthFWR={version:"1.0.0",pagina:page,diagnostico:check};
})();
