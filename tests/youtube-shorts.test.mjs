import { test } from "node:test";
import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";
import { Script, runInNewContext } from "node:vm";

const runtime = await readFile(new URL("../public/galeria-videos.js", import.meta.url), "utf8");
const schema = JSON.parse(await readFile(new URL("../config/schema.json", import.meta.url), "utf8"));
const spec = schema.properties.modules.properties.videoGallery.properties.items.items;

function extractYoutubeParser(){
  const a=runtime.indexOf("function youtubeId(raw){");
  const b=runtime.indexOf("function youtubePoster(item,base){",a);
  assert(a>=0 && b>a,"Parser YouTube não encontrado.");
  const ctx={URL};runInNewContext(runtime.slice(a,b)+"\nthis.parseYoutube=youtubeId;",ctx);
  return ctx.parseYoutube;
}
const youtubeId=extractYoutubeParser();

test("runtime JavaScript válido",()=>assert.doesNotThrow(()=>new Script(runtime)));
test("URLs YouTube Shorts, watch, embeds e youtu.be reconhecidas",()=>{
 const id="AbCdEfGhI_1";
 const valid=[
  "https://youtube.com/shorts/"+id,
  "https://www.youtube.com/shorts/"+id+"?si=FwrTeste",
  "https://m.youtube.com/shorts/"+id,
  "https://www.youtube.com/watch?v="+id+"&feature=share",
  "https://youtu.be/"+id+"?t=3",
  "https://www.youtube.com/embed/"+id
 ];
 for(const url of valid)assert.equal(youtubeId(url),id,url);
});
test("Hosts externos, IDs inválidos e HTTP são recusados",()=>{
 const invalid=[
   "https://youtube.com.evil.example/shorts/AbCdEfGhI_1",
   "https://evil.example/?v=AbCdEfGhI_1",
   "http://www.youtube.com/shorts/AbCdEfGhI_1",
   "https://www.youtube.com/shorts/123",
   "javascript:alert(1)",
   "https://www.youtube.com/playlist?list=AbCdEfGhI_1",
   "https://www.youtube.com/shorts/AbCdEfGhI_1more"
 ];
 for(const url of invalid)assert.equal(youtubeId(url),"",url);
});
test("Thumbnail automática e fallback vertical preservam o poster 9:16",()=>{
 assert.match(runtime,/i\.ytimg\.com\/vi\/.*oar2\.jpg/);
 assert.match(runtime,/oardefault\.jpg/);
 assert.match(runtime,/hqdefault\.jpg/);
 assert.match(runtime,/img\.width=450;img\.height=800/);
 assert.match(runtime,/fwr-nichelle-videos__fallback/);
});
test("Player YouTube é carregado somente ao clicar, sem iframe antecipado",()=>{
 assert.match(runtime,/youtube-nocookie\.com\/embed\//);
 assert.match(runtime,/card\.addEventListener\("click",\(\)=>play\(item,card,base\)\)/);
});
test("Schema aceita YouTube e poster opcional, mantendo quatro cards",()=>{
 assert.deepEqual(spec.properties.provider.enum,["youtube"]);
 assert.equal(schema.properties.modules.properties.videoGallery.properties.items.maxItems,4);
 assert.equal(spec.required.includes("posterUrl"),false);
});
test("Runtime rejeita configuração inválida e só usa slot FWR explícito",()=>{
 assert.match(runtime,/function validConfig\(cfg\)/);
 assert.match(runtime,/JSON inválido/);
 assert.ok(runtime.includes('script.dataset.target||"#fwr-nichelle-video-slot"'));
});
test("Runtime carrega iframe YouTube apenas depois da interação",()=>{
 assert.ok(runtime.includes('card.addEventListener("click",()=>play(item,card,base))'));
 const playStart=runtime.indexOf('function play(item,button,base){');
 assert.ok(playStart>=0&&runtime.slice(playStart).includes('document.createElement("iframe")'));
});
