import assert from "node:assert/strict";
import {readFile} from "node:fs/promises";
import {chromium} from "playwright";
import {runInNewContext} from "node:vm";

const source = async name => readFile(new URL("../"+name,import.meta.url),"utf8");
const activation=await source("public/nichelle-activation.js");
const auth=await source("public/nichelle-auth.js");
const header=await source("public/nichelle-header.js");
const pdp=await source("public/nichelle-pdp.js");
const styles=await Promise.all(["nichelle-auth.css","nichelle-header.css","nichelle-pdp.css","nichelle-containers.css","nichelle-geral.css"].map(name=>source("public/"+name)));
const loader=await source("integracao/nichelle-core-fixo-producao.html");
const loaderGate=loader.match(/var accountVisual=.*\nvar blocked=.*\n/)[0];
const allowed=["/","/conta/login","/conta/criar","/conta/index/","/conta/pedido/listar","/conta/favorito/listar"];
const blocked=["/conta/favorito/294428996/adicionar","/conta/pedido/cancelar","/conta/sair","/checkout","/checkout/123/finalizacao","/pedido","/carrinho/produto"];
for (const [routes,expected] of [[allowed,true],[blocked,false]]) {
  for(const pathname of routes){
    const location={hostname:"www.nichelleimports.com.br",pathname};
    const window={Nichelle27Settings:{geral:{ativo:true,publicarNaLoja:true}}};
    runInNewContext(activation,{location,window,URLSearchParams});
    assert.equal(window.Nichelle27Activation.active(),expected,pathname);
    const gate=runInNewContext(loaderGate+"!blocked",{location});
    assert.equal(gate,expected,"loader: "+pathname);
  }
}

const browser=await chromium.launch({headless:true,executablePath:process.env.CHROMIUM_PATH||undefined,args:["--no-sandbox"]});
try{
  const page=await browser.newPage({viewport:{width:1440,height:900}});
  const nativeHeader='<div id="cabecalho"><div class="logo"><a href="/"><img alt="Nichelle"></a></div><div class="menu superior"><ul class="nivel-um"><li><a href="/marcas">Marcas</a></li><li><a href="/mais-vendidos">Mais vendidos</a></li></ul></div></div>';
  const profile='<div class="row-fluid"><aside class="span3 conta-menu caixa-sombreada"><p class="nome-usuario">Cliente de teste</p><ul><li><a href="/conta/index">Minha conta</a></li><li><a href="/conta/pedido/listar">Meus pedidos</a></li><li><a href="/conta/favorito/listar">Lista de desejos</a></li><li><a href="/conta/sair">Sair</a></li></ul></aside><section class="span9"><ul class="abas-conta"><li class="active"><a href="/conta/index">Minha conta</a></li><li><a href="/conta/pedido/listar">Meus pedidos</a></li><li><a href="/conta/favorito/listar">Lista de desejos</a></li></ul><div class="abas-conteudo"><div class="caixa-dados"><h3>Minha Conta <small>Confirme os dados</small></h3><fieldset><legend>Dados cadastrais</legend><div class="caixa-info">Dados de teste</div><a class="botao principal" href="/conta/editar">Editar dados cadastrais</a></fieldset></div><table><thead><tr><th>Pedido</th><th>Estado</th></tr></thead><tbody><tr><td>Teste</td><td>Em andamento</td></tr></tbody></table></div></section></div>';
  const product='<div class="produto-detalhes"><div class="conteiner"><div class="row-fluid"><div class="produto-detalhes-imagem"></div><div class="produto-detalhes-detalhes"><div class="principal"><div class="info-principal-produto"><h1 class="nome-produto">Produto de teste</h1></div><div class="acoes-produto indisponivel"><div class="precos-wrap"><div class="preco-produto"><div class="avise-me"><form action="/espera/produto/123/assinar/" method="POST" class="avise-me-form"><span class="avise-tit">Ops!</span><span class="avise-descr">Esse produto encontra-se indisponível.<br>Deixe seu e-mail que avisaremos quando chegar.</span><div class="avise-input"><div class="controls controls-row"><input class="span5 avise-nome" name="avise-nome" type="text" placeholder="Digite seu nome"><label class="span7"><i class="icon-envelope avise-icon"></i><input class="span12 avise-email" name="avise-email" type="email" placeholder="Digite seu e-mail"></label></div></div><div class="avise-btn"><input type="submit" value="Avise-me quando disponível" class="botao btn-block"></div></form></div></div></div></div><div class="acoes-produto" style="display:none"><div class="desconto-a-vista"><span class="avista-valor"><strong>R$ 99,00</strong></span></div><a class="botao-comprar">Comprar</a></div></div></div></div></div></div>';
  await page.route("**/*",route=>{
    const u=new URL(route.request().url());
    if(u.hostname!=="www.nichelleimports.com.br")return route.abort();
    const isPdp=u.pathname==="/produto-teste";
    return route.fulfill({contentType:"text/html",body:'<!doctype html><meta name="viewport" content="width=device-width,initial-scale=1"><body class="'+(isPdp?'pagina-produto':'pagina-conta')+'"><div class="conteiner-principal">'+nativeHeader+'<main id="corpo"><div class="conteiner">'+(isPdp?product:profile)+'</div></main><footer id="rodape"></footer></div></body>'});
  });
  async function load(path){
    await page.goto("https://www.nichelleimports.com.br"+path);
    await page.evaluate(()=>{window.Nichelle27Settings={geral:{ativo:true,publicarNaLoja:true}}});
    for(const css of styles)await page.addStyleTag({content:css});
    for(const js of [activation,auth,header,pdp])await page.addScriptTag({content:js});
  }
  for(const [path,kind] of [["/conta/index","perfil"],["/conta/pedido/listar","pedidos"],["/conta/favorito/listar","favoritos"]]){
    await load(path);
    assert.equal(await page.locator("html").getAttribute("data-n27-account"),kind);
    assert.equal(await page.locator("#n27-independent-header").count(),1);
    assert.equal(await page.locator(".conta-menu a[href='/conta/sair']").count(),1);
    assert.equal(await page.locator(".abas-conteudo .botao").getAttribute("href"),"/conta/editar");
    assert.equal(await page.locator(".abas-conta .active a").evaluate(n=>getComputedStyle(n).color),"rgb(255, 255, 255)");
  }
  await page.setViewportSize({width:390,height:844});
  await load("/conta/index");
  const shortcut=page.locator(".n27-owned-nav__quick-icon.n27-owned-icon--account");
  assert.equal(await shortcut.evaluate(n=>n.tagName.toLowerCase()),"svg");
  assert.equal(await shortcut.evaluate(n=>getComputedStyle(n).stroke),"rgb(255, 255, 255)");
  assert.equal(await shortcut.locator("..").getAttribute("href"),"/conta/index");
  assert.equal(await shortcut.isVisible(),true);
  assert.equal(await page.locator(".conta-menu").evaluate(n=>Math.round(n.getBoundingClientRect().width)),await page.locator(".row-fluid").first().evaluate(n=>Math.round(n.getBoundingClientRect().width)));
  await page.setViewportSize({width:1440,height:900});
  await load("/produto-teste");
  const form=page.locator(".acoes-produto.indisponivel form");
  assert.equal(await form.getAttribute("action"),"/espera/produto/123/assinar/");
  assert.equal(await form.getAttribute("method"),"POST");
  assert.equal(await form.locator("input[name='avise-email']").count(),1);
  assert.equal(await page.locator(".n27-pdp").getAttribute("data-n27-unavailable"),"1");
  assert.equal(await page.locator(".n27-pdp__pix-hero").isVisible(),false);
  assert.equal(await page.locator("[data-section='payment']").isVisible(),false);
  assert.equal(await form.locator(".controls-row").evaluate(n=>getComputedStyle(n).display),"grid");
  await page.setViewportSize({width:390,height:844});
  assert.equal(await form.locator(".controls-row").evaluate(n=>getComputedStyle(n).gridTemplateColumns.split(" ").length),1);
  await page.evaluate(()=>{
    document.querySelector(".acoes-produto.indisponivel").style.display="none";
    document.querySelector(".acoes-produto:not(.indisponivel)").style.display="block";
    window.NichelleProductFWR.refresh();
  });
  assert.equal(await page.locator(".n27-pdp").getAttribute("data-n27-unavailable"),"0");
  assert.equal(await page.locator(".n27-pdp__pix-hero").isVisible(),true);
  assert.equal(await page.locator("[data-section='payment']").isVisible(),true);
  assert.equal(await form.isVisible(),false);
  console.log("OK: allowlist/loader, 3 rotas, menu/ícone mobile, formulário nativo e alternância de estoque/PIX.");
}finally{await browser.close();}
