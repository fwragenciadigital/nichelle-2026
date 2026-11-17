/*
 * NICHELLE — Cart page FWR v1.0
 * Pure presentation adapter for the actual Loja Integrada cart.
 * Keeps item forms, quantity links, shipping, coupon, checkout redirect.
 * Only ?nichelle_preview=1.
 */
(function(){
"use strict";
if(!/^(www\.)?nichelleimports\.com\.br$/i.test(location.hostname) ||
 !/^\/carrinho\/index\/?$/.test(location.pathname)||
 new URLSearchParams(location.search).get("nichelle_preview")!=="1"||
 window.NichelleCartPageFWR)return;
let ready=false,root=null,totalView,subtotalView,pixBlock,pixAmount,pixNote,observer;
const $$=(s,n=document)=>n.querySelector(s);
const el=(tag,cls,text)=>{const n=document.createElement(tag);if(cls)n.className=cls;if(text!==undefined)n.textContent=text;return n;};
const safe=(x,l=150)=>String(x||"").replace(/\s+/g," ").trim().slice(0,l);
function settings(){return window.Nichelle27Settings?.paginaCarrinhoFWR||{};}
function allowed(){
 const g=window.Nichelle27Settings?.geral;
 return g?.ativo===true&&g.modoPreview===true&&g.publicarNaLoja!==true &&
   settings().ativo!==false;
}
function readMoney(node){
 return safe(node?.textContent,70)||"R$ 0,00";
}
function setAttrControls(table){
 for(const tr of table.querySelectorAll('tr[data-produto-id]')){
  const name=safe(tr.querySelector('.produto-info a')?.textContent,120)||"produto";
  const minus=tr.querySelector('.quantidade .icon-minus');
  const plus=tr.querySelector('.quantidade .icon-plus');
  const remove=tr.querySelector('.excluir a[href]');
  if(minus)minus.setAttribute("aria-label","Diminuir quantidade de "+name);
  if(plus)plus.setAttribute("aria-label","Aumentar quantidade de "+name);
  if(remove)remove.setAttribute("aria-label","Remover "+name+" do carrinho");
  const qty=tr.querySelector('.quantidade input');
  if(qty)qty.setAttribute("aria-label","Quantidade de "+name);
 }
}
function mount(){
 if(ready||!allowed()||!document.body.classList.contains("pagina-carrinho"))return;
 const native=document.querySelector('#corpo .finalizar-compra');
 const table=native?.querySelector(".tabela-carrinho");
 const box=native?.querySelector(".caixa-sombreada");
 const checkout=native?.querySelector('form[action*="/checkout/redirect/"]');
 if(!native||!table||!box||!checkout)return;
 const action=new URL(checkout.action,location.href);
 if(action.origin!==location.origin||!/^\/checkout\/redirect\/?$/.test(action.pathname))return;
 ready=true;root=native;
 root.classList.add("n27-cart-page");
 document.documentElement.dataset.n27CartPage="1";
 const nativeHeader=native.querySelector(".cabecalho-interno");
 if(nativeHeader){
  nativeHeader.classList.add("n27-cart-page__header");
  const label=el("span","n27-cart-page__eyebrow","SEU PEDIDO");
  nativeHeader.insertBefore(label,nativeHeader.firstChild);
  const title=nativeHeader.querySelector("h1");
  if(title)title.textContent="CARRINHO";
 }
 const cap=el("div","n27-cart-page__bar","ITENS DO SEU CARRINHO");
 box.insertBefore(cap,table);
 const summary=el("aside","n27-cart-page__summary");
 summary.setAttribute("aria-label","Resumo do seu pedido");
 const eyebrow=el("span","n27-cart-page__summary-eyebrow","FINALIZAÇÃO");
 summary.append(eyebrow,el("h2","n27-cart-page__summary-title","Resumo do pedido"));
 const line=el("div","n27-cart-page__summary-line");
 line.append(el("span","","Subtotal dos produtos"));
 subtotalView=el("strong","n27-cart-page__summary-subtotal");line.append(subtotalView);summary.append(line);
 const total=el("div","n27-cart-page__summary-total");
 total.append(el("span","", "Total do pedido"));
 totalView=el("strong","n27-cart-page__summary-total-number");total.append(totalView);summary.append(total);
 pixBlock=el("div","n27-cart-page__pix");
 pixBlock.append(el("span","n27-cart-page__pix-eyebrow","PREÇO ESPECIAL NO PIX"));
 pixAmount=el("strong","n27-cart-page__pix-amount");
 pixNote=el("span","n27-cart-page__pix-note");
 pixBlock.append(pixAmount,pixNote);summary.append(pixBlock);
 const info=el("p","n27-cart-page__note",
  "Frete, cupons e condições finais são calculados pela Loja Integrada.");
 summary.append(info);
 // MOVE, never clone: native checkout form and its event behavior remain
 // the only official path to checkout and payment.
 checkout.classList.add("n27-cart-page__checkout-form");
 summary.append(checkout);
 native.append(summary);
 setAttrControls(table);
 sync();
 let pending=false;
 observer=new MutationObserver(records=>{
  // Avoid observing our summary; no infinite loops on copied totals.
  if(pending)return;pending=true;
  requestAnimationFrame(()=>{pending=false;sync();});
 });
 observer.observe(table,{subtree:true,characterData:true,childList:true,attributes:true,attributeFilter:["data-total-valor","data-subtotal-valor"]});
 window.NichelleCartPageFWR={version:"1.0.0",refresh:sync};
}
function sync(){
 if(!ready)return;
 const table=root.querySelector(".tabela-carrinho");
 if(!table)return;
 const subtotal=table.querySelector(".valor-subtotal");
 const total=table.querySelector(".valor-total");
 subtotalView.textContent=readMoney(subtotal);
 totalView.textContent=readMoney(total)||readMoney(subtotal);
 const pix=table.querySelector(".valores-descontos .descontos.avista");
 const pixText=safe(pix?.textContent,200);
 const matches=pixText.match(/R\$\s*[\d.,]+/g);
 if(matches&&matches.length){
  pixAmount.textContent=matches[matches.length-1];
  pixNote.textContent=pixText.replace(matches[matches.length-1],"").trim().slice(0,80);
  pixBlock.hidden=false;
 } else {
  pixAmount.textContent="";
  pixNote.textContent="";
  pixBlock.hidden=true;
 }
 setAttrControls(table);
}
if(document.readyState==="loading")document.addEventListener("DOMContentLoaded",mount,{once:true});
else mount();
window.addEventListener("load",mount,{once:true});
[300,900,1800].forEach(ms=>setTimeout(mount,ms));
})();