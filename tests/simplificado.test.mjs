import {test} from "node:test";
import assert from "node:assert/strict";
import {readFile} from "node:fs/promises";
import {Script,runInNewContext} from "node:vm";
const read=async path=>readFile(new URL(path,import.meta.url),"utf8");
const js=await read("../public/nichelle.js");
const html=await read("../integracao/html-galeria-shorts.html");
const loader=await read("../integracao/rodape-loader-unico.html");
const config=await read("../integracao/variaveis-tema-primeshop-REFERENCIA.html");

test("runtime unico com sintaxe JavaScript valida",()=>{
 assert.doesNotThrow(()=>new Script(js));
 assert.match(js,/window\.__FWR_NICHELLE_RUNTIME__/);
 assert.match(js,/window\.FWRNichelle\.galeriaVideos/);
});
test("nao usa dashboard, JSON remoto nem bibliotecas novas",()=>{
 assert.doesNotMatch(js,/\bfetch\s*\(/);
 assert.doesNotMatch(js,/\bjQuery\b|\$\(\s*document/);
 assert.doesNotMatch(js,/galeria-publicada\.json|galeria-preview\.json|password_verify/);
});
test("Shorts valida hosts e formatos e recusa IDs invalidos",()=>{
 const start=js.indexOf("function youtubeId(value) {");
 const end=js.indexOf("function normalizedCards(config)",start);
 assert.ok(start>=0&&end>start);
 const parse=runInNewContext(js.slice(start,end)+"\nyoutubeId;",{URL});
 const id="AbCdEfGhI_1";
 for(const url of ["https://www.youtube.com/shorts/"+id,"https://youtu.be/"+id,"https://youtube.com/watch?v="+id]){
  assert.equal(parse(url),id,url);
 }
 for(const url of ["https://youtube.com.evil.example/shorts/"+id,"http://youtube.com/shorts/"+id,"javascript:alert(1)","https://youtube.com/shorts/INVALID_ID"]){
  assert.equal(parse(url),"",url);
 }
});
test("iframe so entra apos clique; proporcao e alt preservados",()=>{
 assert.match(js,/document\.createElement\("iframe"\)/);
 assert.match(js,/button\.addEventListener\("click"/);
 assert.match(js,/img\.width = 450; img\.height = 800/);
 assert.match(js,/youtube-nocookie\.com\/embed/);
});
test("HTML da LI concentra as quatro URLs editaveis e pre-reserva condicional",()=>{
 assert.match(html,/window\.FWRNichelle\.galeriaVideos/);
 assert.match(html,/ativo: false/);
 assert.equal((html.match(/\/\* Vídeo [1-4] \*\//g)||[]).length,4);
 assert.match(html,/data-fwr-active="0"/);
 assert.match(html,/cfg\.ativo === true && preenchidos/);
 assert.doesNotMatch(html,/<style[\\s>]/i);
 assert.match(html,/slot\\.style\\.minHeight/);
 assert.match(js,/aspect-ratio:9\\/16/);
 assert.match(js,/installStyles\\(\\)/);
 assert.match(js,/fwr-nichelle-styles/);
 const scripts=[...html.matchAll(/<script>([\s\S]*?)<\/script>/g)];
 assert.equal(scripts.length,1);
 assert.doesNotThrow(()=>new Script(scripts[0][1]));
});
test("config do tema e loader mantidos separados, sem contatos externos ou token",()=>{
 assert.match(loader,/cdn\\.jsdelivr\\.net\\/gh\\/fwragenciadigital\\/nichelle-2026@develop\\/public\\/nichelle\\.js/);
 assert.doesNotMatch(loader,/raw\.githubusercontent\.com/);
 assert.match(config,/var telefone1 = ""/);
 assert.match(config,/var whatsapp1 = ""/);
 assert.match(config,/var mail1 = ""/);
 assert.doesNotMatch(config,/1909205813|contatoterra7|cientificaweb/);
});
