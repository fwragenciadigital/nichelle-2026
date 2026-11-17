/*
 * Nichelle Imports 2026 — FWR PDP v1.0
 * Variações, preço, galeria Splide, frete, parcela e compra são DOM
 * original da Loja Integrada. Este componente só faz composição visual.
 * Homologação explícita: ?nichelle_preview=1.
 */
(function(){
"use strict";
if(!/^(www\.)?nichelleimports\.com\.br$/i.test(location.hostname) ||
   new URLSearchParams(location.search).get("nichelle_preview")!=="1" ||
   window.NichelleProductFWR)return;
let container=null,hero=null,observer=null,timer=0,init=false;
const SELECTOR=".produto-detalhes > .conteiner > .row-fluid";
const safe=(x,n=190)=>String(x||"").replace(/\s+/g," ").trim().slice(0,n);
const e=(tag,cls,txt)=>{const n=document.createElement(tag);if(cls)n.className=cls;if(txt!==undefined)n.textContent=txt;return n;};
function settings(){return window.Nichelle27Settings?.paginaProdutoFWR||{};}
function enabled(){
 const g=window.Nichelle27Settings?.geral;
 return g?.ativo===true&&g.modoPreview===true&&g.publicarNaLoja!==true &&
   settings().ativo!==false;
}
function icon(name){
 const paths={truck:"M3 5h11v12H3V5Zm11 4h4l3 4v4h-7V9ZM7 19a2 2 0 1 0 0-4 2 2 0 0 0 0 4Zm11 0a2 2 0 1 0 0-4 2 2 0 0 0 0 4Z",
 shield:"M12 2 4 6v6c0 5 3 8 8 10 5-2 8-5 8-10V6l-8-4Zm-3 10 2 2 4-4",
 chat:"M21 11.5a8.5 8.5 0 0 1-8.5 8.5 9 9 0 0 1-4-.9L3 21l1.9-5.5A8.5 8.5 0 1 1 21 11.5Z",
 pix:"M12 2 22 12 12 22 2 12 12 2Z M8 12h8",
 check:"m5 12 4 4L19 6",
 arrow:"M5 12h14m-6-6 6 6-6 6"};const svg=document.createElementNS("http://www.w3.org/2000/svg","svg");
 svg.setAttribute("viewBox","0 0 24 24");svg.setAttribute("aria-hidden","true");svg.setAttribute("fill","none");
 svg.setAttribute("stroke","currentColor");svg.setAttribute("stroke-width","1.7");svg.setAttribute("stroke-linecap","round");svg.setAttribute("stroke-linejoin","round");
 (paths[name]||paths.check).split(" M").forEach((p,i)=>{const path=document.createElementNS("http://www.w3.org/2000/svg","path");
 path.setAttribute("d",i?"M"+p:p);svg.append(path);});return svg;
}
function benefit(name,title,description){
 const n=e("div","n27-pdp__benefit"),symbol=e("span","n27-pdp__benefit-icon");
 symbol.append(icon(name));const text=e("div","n27-pdp__benefit-text");
 text.append(e("strong","",title),e("small","",description));n.append(symbol,text);return n;
}
function benefits(media){
 if(media.querySelector(".n27-pdp__benefits"))return;
 const row=e("section","n27-pdp__benefits");row.setAttribute("aria-label","Informações importantes da compra");
 row.append(e("h2","n27-pdp__benefits-title","Informações importantes"));
 const cols=e("div","n27-pdp__benefits-row");
 cols.append(
  benefit("truck","Entrega para todo o Brasil","Calcule o frete pelo CEP"),
  benefit("shield","Compra segura","Pagamento processado pela loja"),
  benefit("chat","Atendimento","Equipe disponível para dúvidas")
 );
 row.append(cols);media.append(row);
}
function findDescription(){
 const src=document.querySelector(".produto-descricao .tab-content,.produto-descricao .conteudo,.produto-descricao .descricao-produto,.produto-descricao");
 if(!src)return"";
 const plain=safe(src.innerText||src.textContent,460);
 return plain.length>22?plain:"";
}
function line(name,title,content,kind){
 const details=e("details","n27-pdp__accordion");
 details.dataset.section=name;
 if(kind==="open")details.open=true;
 const summary=e("summary","n27-pdp__accordion-title");
 summary.append(e("span","",title),e("span","n27-pdp__accordion-symbol","+"));
 const body=e("div","n27-pdp__accordion-body");
 if(content)body.append(e("p","",content));
 details.append(summary,body);return{details,body};
}
function extras(detailsCol){
 if(detailsCol.querySelector(".n27-pdp__extras"))return;
 const section=e("section","n27-pdp__extras");
 section.setAttribute("aria-label","Informações complementares do produto");
 const description=findDescription();
 const a=line("description","Descrição e especificações",description||"Conheça as características e informações completas do produto.","open");
 const original=document.querySelector(".produto-descricao");
 if(original){
  original.id=original.id||"n27-pdp-full-description";
  const link=e("a","n27-pdp__inline-link","Ver descrição completa ↓");link.href="#"+original.id;
  a.body.append(link);
 }
 const freight=line("freight","Envio e entrega","Informe seu CEP no calculador de frete para consultar prazos e opções de envio.");
 const price=line("payment","Pagamento e condições","As condições de parcelamento e pagamento são determinadas pela Loja Integrada.");
 const priceLink=e("button","n27-pdp__inline-link","Consultar formas de pagamento");priceLink.type="button";
 priceLink.addEventListener("click",()=>{
  const native=[...detailsCol.querySelectorAll(".acoes-produto")].find(n=>!n.classList.contains("hide")&&n.getBoundingClientRect().height>0);
  const pay=native?.querySelector(".mais-formas");
  if(pay){pay.click();pay.scrollIntoView({behavior:"smooth",block:"center"});}
 });price.body.append(priceLink);
 const help=line("support","Dúvidas e atendimento","Nossa equipe pode ajudar com informações sobre produtos e pedidos.");
 const source=document.querySelector('#rodape-atendimento a[href^="https://wa.me/"], #rodape-atendimento a[href*="api.whatsapp"], #cabecalho a[href*="wa.me/"]');
 if(source){
  const a=e("a","n27-pdp__inline-link","Conversar com atendimento");
  a.href=source.href;a.target="_blank";a.rel="noopener noreferrer";help.body.append(a);
 }
 section.append(a.details,freight.details,price.details,help.details);
 detailsCol.append(section);
}
function setupPix(principal){
 if(principal.querySelector(".n27-pdp__pix-hero"))return;
 hero=e("div","n27-pdp__pix-hero");
 hero.setAttribute("aria-live","polite");
 hero.setAttribute("aria-label","Preço especial no Pix");
 hero.hidden=true;
 const over=e("span","n27-pdp__pix-overline","PREÇO ESPECIAL NO PIX");
 const value=e("strong","n27-pdp__pix-value");
 const desc=e("span","n27-pdp__pix-label","Pagamento à vista via Pix");
 const discount=e("span","n27-pdp__pix-discount");
 hero.append(over,value,desc,discount);
 const variant=principal.querySelector(":scope > .atributos");
 const first=principal.querySelector(":scope > .acoes-produto");
 if(first)principal.insertBefore(hero,first);
 else if(variant)variant.after(hero);
 else principal.append(hero);
}
function visibleAction(principal){
 const list=[...principal.querySelectorAll(":scope > .acoes-produto")];
 return list.find(n=>!n.classList.contains("hide")&&!n.classList.contains("indisponivel") &&
   n.getBoundingClientRect().height>0) ||
   list.find(n=>!n.classList.contains("hide")&&n.getBoundingClientRect().height>0) ||null;
}
function syncPix(){
 if(!container||!container.isConnected||!hero)return;
 const principal=container.querySelector(".produto-detalhes-detalhes > .principal");
 if(!principal)return;
 const action=visibleAction(principal);
 const real=action?.querySelector(".desconto-a-vista .avista-valor strong");
 const value=safe(real?.textContent,60);
 const discount=safe(action?.querySelector(".desconto-a-vista .avista-desconto")?.textContent,100);
 const signature=value+"|"+discount;
 if(value&&/R\$\s*[\d.,]+/.test(value)){
  if(hero.dataset.signature!==signature){
   hero.querySelector(".n27-pdp__pix-value").textContent=value;
   hero.querySelector(".n27-pdp__pix-discount").textContent=discount||"";
   hero.dataset.signature=signature;
  }
  if(hero.hidden)hero.hidden=false;
  container.dataset.n27PixReady="1";
 }else{
  hero.hidden=true;
  container.dataset.n27PixReady="0";
 }
}
function schedule(){
 if(timer)clearTimeout(timer);
 timer=window.setTimeout(()=>{timer=0;syncPix();},70);
}
function mount(){
 if(init||!enabled()||!document.body.classList.contains("pagina-produto"))return;
 const native=document.querySelector(SELECTOR);
 if(!native)return;
 const media=native.querySelector(":scope > .produto-detalhes-imagem");
 const details=native.querySelector(":scope > .produto-detalhes-detalhes");
 const principal=details?.querySelector(":scope > .principal");
 if(!media||!details||!principal)return;
 init=true;container=document.querySelector(".produto-detalhes");
 document.documentElement.dataset.n27Pdp="1";
 document.body.classList.add("n27-pdp-page");
 container.classList.add("n27-pdp");
 native.classList.add("n27-pdp__layout");
 media.classList.add("n27-pdp__media");
 details.classList.add("n27-pdp__details");
 benefits(media);setupPix(principal);extras(details);
 document.querySelector(".produto-descricao")?.classList.add("n27-pdp__description");
 document.querySelector(".produto-aproveite")?.classList.add("n27-pdp__recommendations");
 syncPix();
 observer=new MutationObserver(records=>{
  if(records.some(r=>r.target.closest?.(".n27-pdp__pix-hero, .n27-pdp__extras")))return;
  schedule();
 });
 observer.observe(principal,{subtree:true,attributes:true,attributeFilter:["class","style","data-sell-price"],childList:true,characterData:true});
 document.addEventListener("click",evt=>{
  if(evt.target.closest?.(".atributo-item,.wrapper-dropdown,.atributo-comum,.lista-atributos"))schedule();
 },true);
 document.addEventListener("change",schedule,true);
 window.NichelleProductFWR={version:"1.0.0",refresh:syncPix};
}
if(document.readyState==="loading")document.addEventListener("DOMContentLoaded",mount,{once:true});else mount();
window.addEventListener("load",mount,{once:true});
[300,950,2000].forEach(ms=>window.setTimeout(mount,ms));
})();