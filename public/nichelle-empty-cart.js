/*
 * Nichelle 2026 — estado vazio do carrinho.
 * Somente classes/estilos: não cria pedido, produto, checkout ou botões falsos.
 */
(function(){
  "use strict";
  if(!/^\/carrinho\/index\/?$/i.test(location.pathname))return;
  if(!/^(?:www\.)?nichelleimports\.com\.br$/i.test(location.hostname))return;
  if(window.NichelleEmptyCartFWR)return;
  var active=window.Nichelle27Activation?.active()===true;
  if(!active)return;
  var done=false;
  function scan(){
    if(done)return;
    var corpo=document.getElementById("corpo");
    if(!corpo)return;
    // Produtos / checkout nativos presentes? Não aplicar estilo vazio.
    if(corpo.querySelector(".tabela-carrinho tr[data-produto-id],.finalizar-compra .tabela-carrinho tr"))return;
    var heads=[...corpo.querySelectorAll("h1,h2,h3,h4,.titulo,.alerta,.mensagem-vazia,.carrinho-vazio")];
    var heading=heads.find(function(n){
      var t=(n.textContent||"").replace(/\s+/g," ").trim();
      return t.length<130 &&
       /(?:n[aã]o existem produtos no carrinho|carrinho vazio|seu carrinho est[aá] vazio|nenhum produto no carrinho)/i.test(t);
    });
    if(!heading)return;
    var stage=heading.closest(".secao-principal")||heading.parentElement;
    if(!stage)return;
    stage.classList.add("n27-cart-empty");
    heading.classList.add("n27-cart-empty__title");
    var cta=[...stage.querySelectorAll("a[href]")].find(function(a){
      return /(?:ir (?:[aà]s?|para) compras|continuar comprando|voltar [aà]s? compras)/i.test(a.textContent||"");
    });
    if(cta)cta.classList.add("n27-cart-empty__cta");
    document.documentElement.dataset.n27CartEmpty="1";
    done=true;
  }
  window.NichelleEmptyCartFWR={version:"1.0.0",refresh:scan};
  if(document.readyState==="loading")document.addEventListener("DOMContentLoaded",scan,{once:true});
  else scan();
  window.addEventListener("load",scan,{once:true});
  [250,650,1300].forEach(function(t){window.setTimeout(scan,t)});
})();
