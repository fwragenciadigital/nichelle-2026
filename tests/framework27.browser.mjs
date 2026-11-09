import { test } from "node:test";
import assert from "node:assert/strict";
import { readFile, mkdtemp, access, rm } from "node:fs/promises";
import { tmpdir } from "node:os";
import { join } from "node:path";
import { spawn } from "node:child_process";
import { createServer } from "node:http";

const js=await readFile(new URL("../public/nichelle27.js",import.meta.url));
const css=await readFile(new URL("../public/nichelle27.css",import.meta.url));
function products(prefix) {
 return '<div id="'+prefix+'" class="listagem-produtos">' +
  Array.from({length:7},(_,i)=>'<div class="listagem-item"><div class="produto">' +
  '<div style="height:190px;background:#eee4f0;border-radius:12px;display:grid;place-items:center;font-size:70px;color:#9401ac">✦</div>' +
  '<p class="nome-produto">Produto demonstrativo '+(i+1)+'</p>' +
  '<div class="preco-produto"><strong class="preco-promocional">R$ 189,00</strong></div>' +
  '</div></div>').join('') + '</div>';
}
const config={
 geral:{ativo:true,debug:false,paginas:['/']},
 layout:{ativo:true,seletor:'#n27-layout-root'},
 topo:{ativo:true,seletor:'#cabecalho',faixaAtiva:true,qualificadores:[
  {titulo:'LOJA 100% SEGURA',texto:'PROTEÇÃO SSL'},
  {titulo:'ENTREGA GARANTIDA',texto:'PARA TODO O BRASIL'},
  {titulo:'PARCELE SUAS COMPRAS',texto:'ATÉ 10X'},
  {titulo:'TROCA FÁCIL',texto:'ATÉ 7 DIAS'}]},
 qualificadores:{ativo:true,rotulo:'VANTAGENS',itens:[
  {icone:'caixa',texto:'COSMÉTICOS IMPORTADOS À PRONTA ENTREGA'},
  {icone:'original',texto:'PRODUTOS 100% ORIGINAIS'},
  {icone:'atendimento',texto:'ATENDIMENTO PERSONALIZADO'},
  {icone:'selo',texto:'LOJA COM SELO DE VERIFICAÇÃO'}]},
 maisVendidos:{ativo:true,titulo:'Produtos',destaque:'Mais Vendidos',seletorFonte:'#best',seletorItem:'.listagem-item'},
 lancamentos:{ativo:true,titulo:'Produtos',destaque:'Lançamentos',seletorFonte:'#launch',seletorItem:'.listagem-item'},
 promocoes:{ativo:true,titulo:'Produtos',destaque:'Promocionais',seletorFonte:'#deals',seletorItem:'.listagem-item'},
 marcas:{ativo:true,titulo:'Compre as',destaque:'Melhores Marcas',itens:Array.from({length:8},(_,i)=>({nome:'Marca '+(i+1),imagem:'/assets/brand'+i+'.svg',link:'/marca/'+i}))},
 newsletter:{ativo:true,titulo:'Fique por dentro das novidades',texto:'Receba lançamentos e ofertas.',seletorFormulario:'#newsletter-form'},
 instagram:{ativo:true,perfil:'https://www.instagram.com/nichelle_imports/',usuario:'@nichelle_imports',
  itens:Array.from({length:4},(_,i)=>({imagem:'/assets/instagram'+i+'.svg',alt:'Publicação '+i,link:'https://www.instagram.com/p/exemplo'+i+'/'}))},
 empresa:{ativo:true,nome:'Nichelle Imports',logo:'/assets/logo.svg',texto:'A NICHELLE IMPORTS oferece produtos de qualidade com atendimento especializado.',imagem:'/assets/company.svg'},
 rodape:{ativo:true,seletor:'#footer'}
};
const html=[
'<!doctype html><html lang="pt-BR"><head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1">',
'<link rel="stylesheet" href="/nichelle27.css">',
'<style>html,body{margin:0;padding:0;color:#444;font:14px Arial,sans-serif}',
'#cabecalho{height:130px;padding:10px 6%;background:#fff;display:flex;align-items:center;justify-content:space-between}',
'#cabecalho .menu{background:#8000a9;color:#fff;padding:16px;border-radius:6px}',
'#footer{padding:35px 6%}</style>',
'<script>const cfg=',JSON.stringify(config),
';if(location.search.includes("disabled"))cfg.geral.ativo=false;window.Nichelle27Settings=cfg;'+
  'if(location.search.includes("modules"))window.FWRNichelle={bannerVitrine:{ativo:true},galeriaVideos:{ativo:true},noticias:{ativo:true}};</script></head><body>',
'<header id="cabecalho"><strong>Nichelle Imports</strong><nav class="menu">Skincare · Tipos de Pele · Marcas</nav></header>',
'<main><div id="n27-layout-root"></div></main>'+
 '<div id="fwr-nichelle-vitrine-slot"></div><div id="fwr-nichelle-video-slot"></div><div id="fwr-nichelle-noticias-slot"></div><div id="native-products">',
 products('best'),products('launch'),products('deals'),
'</div><div id="native-forms"><form id="newsletter-form" action="/newsletter" method="post">',
'<input type="email" name="email" placeholder="Insira seu e-mail"><button type="submit">QUERO RECEBER</button></form></div>',
'<footer id="footer"><h3>Institucional</h3><a href="/pagina/termos">Termos de uso</a></footer>',
'<script defer src="/nichelle27.js"></script></body></html>'
].join('');
function svg(name){
 const n=Number((name.match(/\d+/)||['0'])[0]),colors=['#ead8ee','#f5dbe4','#dcebdc','#e6dbda','#ddd4e8'];
 const label=name.startsWith('brand')?'MARCA '+(n+1):name==='logo'?'NICHELLE':'SKINCARE';
 return '<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 500 500"><rect width="500" height="500" rx="20" fill="'+colors[n%colors.length]+'"/><circle cx="270" cy="210" r="120" fill="#ffffff80"/><text x="250" y="420" font-family="Arial" font-size="37" font-weight="bold" text-anchor="middle" fill="#80009a">'+label+'</text></svg>';
}
const server=createServer((req,res)=>{
 const pathname=new URL(req.url||'/',"http://localhost").pathname;
 if(pathname==='/nichelle27.js'){res.writeHead(200,{'Content-Type':'text/javascript'});return res.end(js);}
 if(pathname==='/nichelle27.css'){res.writeHead(200,{'Content-Type':'text/css'});return res.end(css);}
 if(pathname==='/'){res.writeHead(200,{'Content-Type':'text/html; charset=utf-8'});return res.end(html);}
 if(pathname.startsWith('/assets/')&&pathname.endsWith('.svg')){
  res.writeHead(200,{'Content-Type':'image/svg+xml'});return res.end(svg(pathname.split('/').pop().replace('.svg','')));
 }
 res.writeHead(404);res.end('Not found');
});
await new Promise(resolve=>server.listen(0,'127.0.0.1',resolve));
const base='http://127.0.0.1:'+server.address().port;
const delay=ms=>new Promise(resolve=>setTimeout(resolve,ms));
const workdir=await mkdtemp(join(tmpdir(),'fwr-framework27-'));
let chrome,ws,id=0;
const inflight=new Map();
function send(method,params={}){
 return new Promise((resolve,reject)=>{
  const messageId=++id;inflight.set(messageId,{resolve,reject});
  ws.send(JSON.stringify({id:messageId,method,params}));
 });
}
async function start(){
 const candidates=[process.env.CHROME_BIN,'/usr/bin/google-chrome','/usr/bin/chromium','/usr/bin/chromium-browser'].filter(Boolean);
 let bin;
 for(const c of candidates){try{await access(c);bin=c;break;}catch{}}
 if(!bin)throw Error('Chromium não disponível');
 chrome=spawn(bin,['--headless=new','--no-sandbox','--disable-gpu','--disable-dev-shm-usage',
  '--no-first-run','--remote-allow-origins=*','--remote-debugging-port=0','--user-data-dir='+workdir,'about:blank'],{stdio:'ignore'});
 let port;
 for(let i=0;i<100;i++){
  if(chrome.exitCode!==null)throw Error('Chromium encerrou');
  try{port=Number((await readFile(join(workdir,'DevToolsActivePort'),'utf8')).split('\n')[0]);if(port)break;}catch{}
  await delay(80);
 }
 if(!port)throw Error('Sem DevToolsActivePort');
 const tabs=await(await fetch('http://127.0.0.1:'+port+'/json/list')).json();
 const page=tabs.find(t=>t.type==='page');
 if(!page)throw Error('Aba Chrome não encontrada');
 ws=new WebSocket(page.webSocketDebuggerUrl);
 ws.addEventListener('message',event=>{
  const message=JSON.parse(event.data),p=inflight.get(message.id);
  if(!p)return;inflight.delete(message.id);
  if(message.error)p.reject(Error(JSON.stringify(message.error)));else p.resolve(message.result);
 });
 await new Promise((resolve,reject)=>{
  ws.addEventListener('open',resolve,{once:true});
  ws.addEventListener('error',reject,{once:true});
 });
 await send('Runtime.enable');await send('Page.enable');
}
const expression="(function(){"+
 "const fw=window.Nichelle27Framework;if(!fw)return null;"+
 "const root=document.querySelector('#n27-layout-root');if(!root)return null;"+
 "const shelf=root.querySelector('.n27-shelf__track');"+
 "const brands=root.querySelector('.n27-brands__grid');"+
 "const benefits=root.querySelector('.n27-benefits__list');"+
 "return {ready:document.readyState,width:innerWidth,documentWidth:document.documentElement.scrollWidth,"+
 "report:fw.diagnostico(),order:Array.from(root.querySelectorAll('[data-n27-section]')).map(x=>x.dataset.n27Section),"+
 "productsRoot:document.querySelector('#best').closest('[data-n27-root]')===root,"+
 "productCount:document.querySelectorAll('#best .listagem-item').length,"+
 "headerStyled:!!document.querySelector('#cabecalho[data-n27-topo]'),"+
 "footerStyled:!!document.querySelector('#footer[data-n27-footer]'),"+
 "newsletterRetained:document.querySelector('#newsletter-form').getAttribute('action')==='/newsletter' && !!root.querySelector('#newsletter-form'),"+
 "modulesMoved:document.querySelector('#fwr-nichelle-vitrine-slot')?.closest('[data-n27-root]')===root && "+
 "document.querySelector('#fwr-nichelle-video-slot')?.closest('[data-n27-root]')===root && "+
 "document.querySelector('#fwr-nichelle-noticias-slot')?.closest('[data-n27-root]')===root,"+
 "brandColumns:brands?getComputedStyle(brands).gridTemplateColumns.split(' ').filter(Boolean).length:0,"+
 "qualifierColumns:benefits?getComputedStyle(benefits).gridTemplateColumns.split(' ').filter(Boolean).length:0,"+
 "shelfOverflow:shelf?shelf.scrollWidth>shelf.clientWidth:false,brandsCount:root.querySelectorAll('.n27-brands__item').length};"+
 "})()";
async function measure(width,height,disabled=false,modules=false){
 await send('Emulation.setDeviceMetricsOverride',{width,height,deviceScaleFactor:1,mobile:width<768});
 await send('Page.navigate',{url:base+(disabled?'/?disabled=1':(modules?'/?modules=1':'/'))});
 for(let i=0;i<70;i++){
  await delay(70);
  const r=await send('Runtime.evaluate',{expression,returnByValue:true});
  const v=r.result?.value;
  if(v&&v.ready==='complete')return v;
 }
 throw Error('Framework não estabilizou no Chrome');
}
try{
 await start();
 await test('desktop 1440px — layout, 5 produtos e 8 logos, sem duplicar form',async()=>{
  const v=await measure(1440,900);
  assert.equal(v.documentWidth<=1442,true,JSON.stringify(v));
  assert.deepEqual(v.order,['qualificadores','maisVendidos','lancamentos','marcas','promocoes','newsletter','instagram','empresa']);
  assert.equal(v.brandColumns,8);assert.equal(v.qualifierColumns,4);
  assert.equal(v.productCount,7);assert.equal(v.productsRoot,true);
  assert.equal(v.newsletterRetained,true);assert.equal(v.headerStyled,true);
  assert.equal(v.footerStyled,true);assert.equal(v.brandsCount,8);assert.equal(v.shelfOverflow,true);
 });
 await test('mobile 375px — ordem e sem rolagem horizontal na página',async()=>{
  const v=await measure(375,812);
  assert.equal(v.documentWidth<=377,true,JSON.stringify(v));
  assert.equal(v.qualifierColumns,2);assert.equal(v.shelfOverflow,true);assert.equal(v.order.length,8);
 });
 await test('mobile 320px — qualificadores em uma coluna',async()=>{
  const v=await measure(320,700);
  assert.equal(v.documentWidth<=322,true,JSON.stringify(v));assert.equal(v.qualifierColumns,1);
 });
 await test('orquestra os três módulos existentes entre as vitrines na ordem pedida',async()=>{
  const v=await measure(1440,900,false,true);
  assert.equal(v.modulesMoved,true);
  assert.deepEqual(v.order,[
    'qualificadores','maisVendidos','banners','lancamentos','marcas',
    'videos','promocoes','noticias','newsletter','instagram','empresa'
  ]);
 });
 await test('geral:false — nenhuma alteração em header, footer ou produtos nativos',async()=>{
  const v=await measure(1440,900,true);
  assert.equal(v.order.length,0);assert.equal(v.productsRoot,false);
  assert.equal(v.headerStyled,false);assert.equal(v.footerStyled,false);
  assert.equal(v.report.configuracaoAtiva,false);
 });
}finally{
 try{ws?.close();}catch{}
 if(chrome&&chrome.exitCode===null&&chrome.signalCode===null){
  const stopped=new Promise(resolve=>chrome.once('close',resolve));
  chrome.kill('SIGKILL');await Promise.race([stopped,delay(1400)]);
 }
 await new Promise(resolve=>server.close(resolve));
 await delay(200);
 await rm(workdir,{recursive:true,force:true,maxRetries:12,retryDelay:180});
}
