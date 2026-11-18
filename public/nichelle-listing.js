/*
 * Nichelle Imports 2026 — Categoria e busca com cards FWR v1.0.
 * Somente preview; consome exclusivamente produtos do HTML nativo da LI.
 * Filtros, ordenacao, paginacao, URLs e precos continuam sob a plataforma.
 * Fallback seguro: se houver dados incompletos, exibe listagem nativa.
 */
(function(){
"use strict";
const path=location.pathname.replace(/\/+$/,"")||"/";
if(!/^(www\.)?nichelleimports\.com\.br$/i.test(location.hostname)||
 new URLSearchParams(location.search).get("nichelle_preview")!=="1"||
 /^\/(?:checkout|carrinho|conta|finalizar-pedido)(?:\/|$)/i.test(path)||
 window.NichelleListingFWR)return;
const ID="n27-listing-fwr";
let source=null,root=null,observer=null,scheduled=false,signature="";
const allowed=()=>{
 const g=window.Nichelle27Settings?.geral;
 return !!(g?.ativo===true&&g?.modoPreview===true&&g?.publicarNaLoja!==true&&
   window.Nichelle27Settings?.listagemFWR?.ativo!==false);
};
const node=(tag,cls,txt)=>{
 const n=document.createElement(tag);
 if(cls)n.className=cls;
 if(txt!==undefined)n.textContent=txt;
 return n;
};
const clean=(value,max=180)=>String(value||"").replace(/\s+/g," ").trim().slice(0,max);
function money(raw){
 const match=clean(raw,300).match(/R\$\s*([\d.]+,\d{2})/);
 if(!match)return null;
 const amount=Number(match[1].replace(/\./g,"").replace(",","."));
 return Number.isFinite(amount)&&amount>=0?amount:null;
}
const brl=n=>new Intl.NumberFormat("pt-BR",{style:"currency",currency:"BRL"}).format(n);
function url(raw,img=false){
 try{
  const u=new URL(raw,location.href);
  if(!/^https?:$/.test(u.protocol)||u.username||u.password)return "";
  if(!img&&u.origin!==location.origin)return "";
  return img?u.href:u.pathname+u.search+u.hash;
 }catch(_){return "";}
}
function art(src,size=800){
 try{
  const u=new URL(src,location.href);
  if(u.protocol==="https:"&&u.hostname==="cdn.awsli.com.br"&&
     /^\/\d+x\d+\/\d+\/\d+\/produto\//.test(u.pathname)){
   u.pathname=u.pathname.replace(/^\/\d+x\d+\//,"/"+size+"x"+size+"/");
   return u.href;
  }
 }catch(_){}
 return src;
}
function pickImage(img){
 if(!img)return "";
 for(const attr of ["data-src","data-original","data-lazy-src","src","data-image","data-imagem-caminho"]){
  const src=url(img.getAttribute(attr),true);
  if(src&&!/blank\.gif|placeholder|data:image/i.test(src))return src;
 }
 return url(img.currentSrc,true);
}
function collectItem(li){
 const name=clean(li.querySelector(".nome-produto")?.textContent||
   li.querySelector("a.produto-sobrepor")?.getAttribute("title")||
   li.querySelector(".produto-info > a")?.textContent,170);
 const href=url(li.querySelector(".nome-produto[href],a.produto-sobrepor[href],.produto-info > a[href],a[href]")?.getAttribute("href"));
 const imageEl=li.querySelector(".imagem-produto img")||li.querySelector("img");
 const image=pickImage(imageEl);
 const original=money(li.querySelector(".preco-venda")?.textContent);
 const promotional=money(li.querySelector(".preco-promocional")?.textContent);
 const regular=money(li.querySelector(".preco-produto .titulo")?.textContent);
 const current=promotional??regular??original;
 if(!name||!href||!image||current===null)return null;
 const old=original!==null&&original>current?original:null;
 const percent=old?Math.round((1-current/old)*100):null;
 const nativePercent=clean(li.querySelector(".desconto,[class*='selo-desconto'],[class*='percentual-desconto']")?.textContent,25)
   .match(/(\d{1,2})\s*%/)?.[1];
 const pixEl=li.querySelector(".desconto-a-vista,[data-avista],.listagem-avista-2");
 const pix=money(pixEl?.textContent);
 const pixPercent=clean(li.querySelector(".avista-desconto")?.textContent,70).match(/(\d+(?:[.,]\d+)?)\s*%/)?.[1]||"";
 const installmentText=clean(li.querySelector(".preco-parcela")?.textContent,160);
 const installmentMatch=installmentText.match(/(\d+)\s*x\s+de\s+(R\$\s*[\d.,]+)/i);
 return{
  key:li.dataset.id||li.className.match(/prod-id-(\d+)/)?.[1]||href,
  name,href,image,alt:clean(imageEl?.alt,170)||name,old,current,
  percent:percent&&percent>0?percent:nativePercent?Number(nativePercent):null,
  pix:pix!==null&&pix>0?pix:null,pixPercent,
  installment:installmentMatch?{
   count:Number(installmentMatch[1]),
   amount:clean(installmentMatch[2],45),
   noInterest:/sem juros/i.test(installmentText)
  }:null
 };
}
function pixIcon(){
 const svg=document.createElementNS("http://www.w3.org/2000/svg","svg");
 svg.setAttribute("viewBox","0 0 24 24");
 svg.setAttribute("aria-hidden","true");
 svg.setAttribute("fill","currentColor");
 for(const d of [
  "M12 1.6 18.6 8.2 12 14.8 5.4 8.2 12 1.6Z",
  "M19.2 8.8 23 12.6l-6.6 6.6-3.8-3.8 6.6-6.6Z",
  "M5.4 8.8 11.9 15.4l-3.8 3.8L1.5 12.6l3.9-3.8Z",
  "M12 16.2 15.8 20 12 23.8 8.2 20 12 16.2Z"
 ]){const p=document.createElementNS("http://www.w3.org/2000/svg","path");p.setAttribute("d",d);svg.appendChild(p)}
 return svg;
}
function makeCard(p){
 const card=node("article","n27-listing__card");
 card.dataset.n27Product=p.key;
 const media=node("a","n27-listing__media");
 media.href=p.href;media.setAttribute("aria-label","Ver "+p.name);
 const img=node("img");
 img.src=art(p.image,800);
 if(img.src!==p.image){
  img.srcset=[500,800,1000].map(size=>art(p.image,size)+" "+size+"w").join(", ");
  img.sizes="(max-width: 767px) 47vw,(max-width: 1150px) 31vw,(max-width: 1450px) 23vw,230px";
 }
 img.alt=p.alt;img.width=300;img.height=300;img.loading="lazy";img.decoding="async";
 media.append(img);
 if(p.percent){
  media.append(node("span","n27-listing__badge",p.percent+"% OFF"));
 }
 card.append(media);
 const info=node("div","n27-listing__info");
 const title=node("a","n27-listing__name",p.name);title.href=p.href;
 info.append(title);
 const prices=node("div","n27-listing__prices");
 const row=node("div","n27-listing__price-row");
 if(p.old!==null)row.append(node("del","n27-listing__old",brl(p.old)));
 row.append(node("strong","n27-listing__price",brl(p.current)));
 prices.append(row);
 if(p.installment){
  const installment=node("span","n27-listing__installment");
  installment.append(document.createTextNode("até "));
  installment.append(node("b","",p.installment.count+"x"));
  installment.append(document.createTextNode(" de "));
  installment.append(node("b","",p.installment.amount));
  if(p.installment.noInterest)installment.append(document.createTextNode(" sem juros"));
  prices.append(installment);
 }
 info.append(prices);
 const pix=node("div","n27-listing__pix");
 if(p.pix!==null){
  pix.append(pixIcon());
  const details=node("span","n27-listing__pix-details");
  const line=node("span","n27-listing__pix-line");
  line.append(node("b","",brl(p.pix)));
  line.append(document.createTextNode(" no pix"));
  details.append(line);
  if(p.pixPercent)details.append(node("span","n27-listing__pix-note","com "+p.pixPercent+"% de desconto"));
  pix.append(details);
 }else pix.classList.add("n27-listing__pix--empty");
 info.append(pix);card.append(info);
 return card;
}
function findSource(){
 if(!document.body||
    !(document.body.classList.contains("pagina-categoria")||
      document.body.classList.contains("pagina-busca")||
      document.body.classList.contains("pagina-marca")||
      path==="/mais-vendidos"||path==="/buscar"))return null;
 const options=[...document.querySelectorAll("#corpo .listagem")].filter(el=>
  !el.closest(".vitrine-produtos,.n27-best-shelf,.n27-approved")&&
  el.querySelectorAll(".listagem-item").length>0);
 return options.sort((a,b)=>b.querySelectorAll(".listagem-item").length-a.querySelectorAll(".listagem-item").length)[0]||null;
}
function nativeLists(root){
 return [...root.querySelectorAll("ul.produtos-linha,ul[data-produtos-linha],ul[class*='produtos-linha']")]
  .filter(ul=>ul.querySelector(".listagem-item"));
}
function originalCards(root){
 const lists=nativeLists(root);
 const items=lists.length?lists.flatMap(list=>[...list.querySelectorAll(".listagem-item")]):
  [...root.querySelectorAll(".listagem-item")];
 return [...new Set(items)].filter(item=>!item.closest(".slick-cloned,.owl-item.cloned,.swiper-slide-duplicate"));
}
function signatureOf(items){
 return JSON.stringify(items.map(i=>[
  i.key,i.href,i.name,i.image,i.old,i.current,i.pix,
  i.pixPercent,i.percent,i.installment?.amount,i.installment?.count
 ]));
}
function clearNativeFlag(){
 document.documentElement.removeAttribute("data-n27-listing");
 document.querySelectorAll("[data-n27-listing-native]").forEach(e=>delete e.dataset.n27ListingNative);
}
function mount(){
 if(!allowed())return;
 const found=findSource();
 if(!found)return;
 const native=originalCards(found);
 const products=[],seen=new Set();
 for(const li of native){
  const item=collectItem(li);
  if(!item)continue;
  if(seen.has(item.key))continue;
  products.push(item);seen.add(item.key);
 }
 // All genuine list items must have intact links, pricing and imagery,
 // otherwise leave the original LI cards visible rather than drop products.
 if(!products.length||products.length!==native.length){
  root?.remove();root=null;signature="";clearNativeFlag();return;
 }
 const key=signatureOf(products);
 if(found===source&&root?.isConnected&&key===signature)return;
 const lists=nativeLists(found);
 const firstRow=lists[0]?.closest(".listagem-linha")||lists[0]||native[0]?.parentElement;
 if(!firstRow?.parentNode)return;
 if(found!==source){observer?.disconnect();observer=null;}
 const section=node("section","n27-listing");section.id=ID;
 section.setAttribute("aria-label","Produtos da listagem Nichelle Imports");
 const grid=node("div","n27-listing__grid");
 products.forEach(product=>grid.append(makeCard(product)));
 section.append(grid);
 firstRow.before(section);
 root?.remove();root=section;source=found;signature=key;
 const rows=lists.map(list=>list.closest(".listagem-linha")||list);
 rows.forEach(row=>row.dataset.n27ListingNative="1");
 document.documentElement.dataset.n27Listing="1";
 if(!observer){
  observer=new MutationObserver(records=>{
   if(!records.some(r=>
     !r.target.closest?.("#"+ID)&&
     (!r.addedNodes.length||[...r.addedNodes].some(n=>n.nodeType!==1||!n.closest?.("#"+ID)))
   ))return;
   schedule();
  });
  observer.observe(found,{childList:true,subtree:true,characterData:true,
   attributes:true,attributeFilter:["src","data-src","data-imagem-caminho"]});
 }
}
function schedule(){
 if(scheduled)return;
 scheduled=true;setTimeout(()=>{scheduled=false;mount()},120);
}
if(document.readyState==="loading")document.addEventListener("DOMContentLoaded",mount,{once:true});
else mount();
window.addEventListener("load",mount,{once:true});
[250,850,1800,3200].forEach(n=>setTimeout(mount,n));
document.addEventListener("nichelle27:refresh",schedule);
window.NichelleListingFWR={version:"1.0.0",refresh:schedule};
})();