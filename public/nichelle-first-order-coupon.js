/* NICHELLE | Oferta flutuante de primeira compra v1.0 — SOMENTE PREVIEW.
   Toda validação do desconto fica com o carrinho da Loja Integrada. */
(function(){
"use strict";
if(!/^(www\.)?nichelleimports\.com\.br$/i.test(location.hostname)||
   !window.Nichelle27Activation?.active()||
   /^\/(?:checkout|finalizar-pedido)(?:\/|$)/i.test(location.pathname)||
   window.NichelleWelcomeCoupon)return;
const g=window.Nichelle27Settings?.geral;
const opt=window.Nichelle27Settings?.primeiraCompra||{};
if(!window.Nichelle27Activation?.active()||opt.ativo===false)return;
const CODE=String(opt.codigo||"PRIMEIRACOMPRA").trim().toUpperCase();
if(!/^[A-Z0-9_-]{3,40}$/.test(CODE))return;
const pct=Number(opt.percentual)||10;
const KEY="n27-welcome-coupon-pending";
const ATTEMPT="n27-welcome-coupon-attempt";
const CART_RETURN="n27-cart-preview-native-return";
const isCart=/^\/carrinho\/index\/?$/.test(location.pathname);
const element=(tag,cls,txt)=>{
 const n=document.createElement(tag);
 if(cls)n.className=cls;
 if(txt!==undefined)n.textContent=txt;
 return n;
};
function get(k){try{return sessionStorage.getItem(k)||"";}catch(_){return "";}}
function put(k,v){try{sessionStorage.setItem(k,v);}catch(_){}}
function del(k){try{sessionStorage.removeItem(k);}catch(_){}}
function alreadyHasCoupon(){
 return !!document.querySelector(
  'a[href*="/carrinho/cupom/remover"],.cupom-aplicado,.cupom-desconto-aplicado'
 );
}
function attempt(){
 if(!isCart||get(KEY)!==CODE||get(ATTEMPT)===CODE)return;
 if(!document.querySelector('#corpo .tabela-carrinho tr[data-produto-id]'))return;
 if(alreadyHasCoupon()){del(KEY);return;}
 const forms=[...document.querySelectorAll('form[action*="/carrinho/cupom/validar"]')];
 const form=forms.find(f=>{
  try{
   const u=new URL(f.action,location.href);
   return u.origin===location.origin&&/^\/carrinho\/cupom\/validar\/?$/.test(u.pathname);
  }catch(_){return false;}
 });
 const input=form?.querySelector(
  'input[name="cupom"],input[name="codigo"],input[type="text"]:not([disabled])'
 );
 if(input?.value?.trim()&&input.value.trim().toUpperCase()!==CODE)return;
 // Uma tentativa por clique: evita refresh/redirect em loop.
 put(ATTEMPT,CODE);del(KEY);
 if(window.Nichelle27Activation.preview())put(CART_RETURN,String(Date.now()));
 if(form&&input){
  input.value=CODE;
  input.dispatchEvent(new Event("input",{bubbles:true}));
  input.dispatchEvent(new Event("change",{bubbles:true}));
  if(form.requestSubmit)form.requestSubmit();
  else HTMLFormElement.prototype.submit.call(form);
 }else{
  // Endpoint nativo documentado pela comunidade LI.
  const to=new URL("/carrinho/cupom/validar",location.origin);
  to.searchParams.set("cupom",CODE);
  location.assign(to.pathname+to.search);
 }
}
function render(){
 if(!document.body||document.getElementById("n27-welcome-coupon"))return;
 const root=element("aside","n27-welcome-coupon");
 root.id="n27-welcome-coupon";
 root.setAttribute("aria-label","Oferta de primeira compra");
 const trigger=element("button","n27-welcome-coupon__trigger");
 trigger.type="button";
 trigger.setAttribute("aria-controls","n27-welcome-coupon-panel");
 trigger.setAttribute("aria-expanded","false");
 trigger.setAttribute("aria-label","Abrir a oferta de primeira compra");
 trigger.append(element("strong","",pct+"% OFF"),element("span","","1ª COMPRA"));
 const panel=element("section","n27-welcome-coupon__panel");
 panel.id="n27-welcome-coupon-panel";panel.hidden=true;
 panel.setAttribute("aria-label","Detalhes do cupom de primeira compra");
 const close=element("button","n27-welcome-coupon__close","×");
 close.type="button";close.setAttribute("aria-label","Fechar oferta");
 const title=element("strong","n27-welcome-coupon__title",pct+"% OFF na primeira compra");
 const desc=element("p","n27-welcome-coupon__description",
  "Use o cupom abaixo. O desconto será confirmado no carrinho, conforme as regras da loja.");
 const coupon=element("button","n27-welcome-coupon__code");
 coupon.type="button";coupon.setAttribute("aria-label","Selecionar cupom "+CODE);
 coupon.append(element("span","",CODE),element("small","","USAR CUPOM"));
 const status=element("p","n27-welcome-coupon__status","");
 status.setAttribute("role","status");
 const link=element("a","n27-welcome-coupon__cart","Ver meu carrinho");
 link.href=window.Nichelle27Activation.href("/carrinho/index");
 panel.append(close,title,desc,coupon,status,link);
 root.append(trigger,panel);document.body.append(root);
 function show(open){
  panel.hidden=!open;root.classList.toggle("n27-welcome-coupon--open",open);
  trigger.setAttribute("aria-expanded",String(open));
 }
 trigger.addEventListener("click",()=>show(panel.hidden));
 close.addEventListener("click",()=>{show(false);trigger.focus();});
 document.addEventListener("click",e=>{
  if(!panel.hidden&&!root.contains(e.target))show(false);
 });
 document.addEventListener("keydown",e=>{
  if(e.key==="Escape"&&!panel.hidden){show(false);trigger.focus();}
 });
 coupon.addEventListener("click",()=>{
  put(KEY,CODE);del(ATTEMPT);
  status.textContent="Cupom selecionado! Vamos validá-lo quando você chegar ao carrinho.";
  coupon.classList.add("n27-welcome-coupon__code--selected");
  navigator.clipboard?.writeText?.(CODE).catch(()=>{});
  if(isCart)attempt();
 });
 if(get(KEY)===CODE){
  status.textContent="Cupom reservado para validar no carrinho.";
  coupon.classList.add("n27-welcome-coupon__code--selected");
 }
}
function mount(){render();attempt();}
if(document.readyState==="loading")document.addEventListener("DOMContentLoaded",mount,{once:true});
else mount();
window.addEventListener("load",mount,{once:true});
if(isCart)[350,1100,2100].forEach(ms=>setTimeout(attempt,ms));
window.NichelleWelcomeCoupon={version:"1.0.0",applyPending:attempt};
})();