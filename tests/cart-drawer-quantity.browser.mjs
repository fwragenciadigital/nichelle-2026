import assert from "node:assert/strict";
import {readFile} from "node:fs/promises";
import {chromium} from "playwright";

const script=await readFile(new URL("../public/nichelle-cart-drawer.js",import.meta.url),"utf8");
const css=await readFile(new URL("../public/nichelle-cart-drawer.css",import.meta.url),"utf8");
const origin="https://www.nichelleimports.com.br";
const endpoint="/carrinho/produto/402198969/adicionar";
const browser=await chromium.launch({headless:true,executablePath:process.env.CHROMIUM_PATH||undefined,args:["--no-sandbox"]});
try{
 for(const viewport of [{width:1440,height:900},{width:390,height:844}]){
  const page=await browser.newPage({viewport});
  let qty=0,mutations=0,reads=0;
  await page.route("**/*",async route=>{
   const u=new URL(route.request().url());
   if(u.origin!==origin)return route.abort();
   if(u.pathname.startsWith(endpoint)){
    qty+=Number(u.pathname.slice(endpoint.length).replace(/\//g,"")||1);
    mutations++;
    return route.fulfill({contentType:"application/json",body:JSON.stringify({status:"sucesso"})});
   }
   if(u.pathname==="/carrinho/index"){
    reads++;
    return route.fulfill({contentType:"text/html",body:'<main id="corpo"><table class="tabela-carrinho"><tbody><tr data-produto-id="402198969" data-produto-quantidade="'+qty+'"><td class="produto-info"><a href="/produto-teste">Sérum</a></td><td class="col-item-unit-price" data-item-unit-valor="249"></td></tr><tr><td class="valor-subtotal" data-subtotal-valor="'+(qty*249)+'"></td></tr></tbody></table></main>'});
   }
   return route.fulfill({contentType:"text/html",body:'<!doctype html><meta name="viewport" content="width=device-width,initial-scale=1"><main id="corpo"><input id="qty" type="number" min="1" value="1"><a href="'+endpoint+'" class="botao-comprar-ajax" id="buy">Comprar</a></main>'});
  });
  await page.goto(origin+"/produto-teste");
  // Model the native quantity URL, confirmed AJAX event and Fancybox.
  // Only the native purchase handler may execute the mutation.
  await page.evaluate(({endpoint})=>{
   window.Nichelle27Activation={active:()=>true,href:s=>s};
   window.Nichelle27Settings={carrinhoFWR:{orderBump:false}};
   window.jQuery=function(){return{ajaxSuccess(fn){window.ajaxSuccessHandler=fn;}}};
   window.jQuery.fn={jquery:"native-fixture"};
   window.jQuery.fancybox={close(){
    document.querySelector(".fancybox-wrap.modal-comprar-ajax-status")?.remove();
    document.body.style.overflow="";
   }};
   window.showNative=(isError=false)=>{
    const wrap=document.createElement("div");
    wrap.className="fancybox-wrap fancybox-desktop fancybox-type-inline modal-comprar-ajax-status fancybox-opened";
    wrap.innerHTML='<div id="comprar-ajax-status"><div class="sucesso" '+(isError?'style="display:none"':'')+'>Compra confirmada</div><div class="erro" '+(!isError?'style="display:none"':'')+'>Estoque insuficiente</div></div>';
    document.body.append(wrap);
   };
   document.querySelector("#buy").addEventListener("click",async e=>{
    e.preventDefault();
    const quantity=Number(document.querySelector("#qty").value);
    const url=endpoint+(quantity===1?"":"/"+quantity);
    const resp=await fetch(url);
    const responseJSON=await resp.json();
    // Simulate LI opening its modal in a later callback.
    window.ajaxSuccessHandler(null,{responseJSON},{url});
    setTimeout(()=>window.showNative(),250);
   });
  },{endpoint});
  await page.addStyleTag({content:css});
  await page.addScriptTag({content:script});
  for(const quantity of [1,2,3]){
   await page.locator("#qty").fill(String(quantity));
   await page.locator("#buy").click();
   await page.waitForFunction(expected=>window.NichelleCartDrawer.state.open&&window.NichelleCartDrawer.state.quantity===expected,quantity===1?1:quantity===2?3:6);
   await page.waitForTimeout(750);
   assert.equal(await page.locator(".fancybox-wrap.modal-comprar-ajax-status").count(),0);
   assert.equal(await page.locator("#n27-cart-drawer").isVisible(),true);
   assert.equal(await page.locator("body").evaluate(n=>n.style.overflow),"hidden");
   assert.equal(await page.locator(".n27-cart__qty-count").textContent(),String(qty));
   assert.equal(await page.locator(".n27-cart__line-price").textContent(),(qty*249).toLocaleString("pt-BR",{style:"currency",currency:"BRL"}));
   await page.locator(".n27-cart__close").click();
   assert.equal(await page.locator("#n27-cart-drawer").isVisible(),false);
  }
  assert.equal(mutations,3,"FWR must not duplicate the native mutation");
  assert.ok(reads>=3);
  // Unsuccessful purchase and unrelated endpoints must never open the drawer.
  for(const [url,status] of [[endpoint+"/2","erro"],["/carrinho/produto/402198969/remover","sucesso"],[endpoint+"/0","sucesso"],["https://example.com"+endpoint+"/2","sucesso"]]){
   await page.evaluate(({url,status})=>window.ajaxSuccessHandler(null,{responseJSON:{status}},{url}),{url,status});
   await page.waitForTimeout(45);
   assert.equal(await page.locator("#n27-cart-drawer").isVisible(),false);
  }
  // Preserve a native stock error, even with an outstanding success watcher.
  await page.evaluate(()=>window.showNative(true));
  assert.equal(await page.locator("#comprar-ajax-status .erro").isVisible(),true);
  console.log("PASS",viewport.width,"px: 1, 2, 3; total observado; sem duplicação; erros preservados.");
  await page.close();
 }
}finally{await browser.close();}
