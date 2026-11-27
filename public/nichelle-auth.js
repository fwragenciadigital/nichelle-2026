/*
 * Nichelle 2026 | Login, cadastro e páginas da conta com identidade FWR.
 * Camada visual; nao le dados inseridos pelo cliente nem intercepta form submits.
 */
(function(){
  "use strict";
  const path=location.pathname.replace(/\/+$/,"").toLowerCase();
  const pages={
    "/conta/login":"login",
    "/conta/criar":"cadastro",
    "/conta/index":"perfil",
    "/conta/pedido/listar":"pedidos",
    "/conta/favorito/listar":"favoritos"
  };
  const page=pages[path];
  if(!page||window.NichelleAuthFWR||!window.Nichelle27Activation?.active())return;
  const root=document.documentElement;
  if(page==="login"||page==="cadastro")root.dataset.n27Auth=page;
  else root.dataset.n27Account=page;
  function check(){
    const forms=document.querySelectorAll("#corpo form,main form");
    return {pagina:page,formulariosNativos:forms.length,
      actionPreservado:[...forms].every(f=>!!f.getAttribute("action")||!!f.id)};
  }
  window.NichelleAuthFWR={version:"1.1.0",pagina:page,diagnostico:check};
})();

