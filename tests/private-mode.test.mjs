import { test } from "node:test";
import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";
import { Script, runInNewContext } from "node:vm";

const core = await readFile(new URL("../public/nichelle27.js", import.meta.url),"utf8");
const popup = await readFile(new URL("../tools/homologacao-privada/popup.js", import.meta.url),"utf8");
const manifest = JSON.parse(await readFile(new URL("../tools/homologacao-privada/manifest.json", import.meta.url),"utf8"));
const html = await readFile(new URL("../tools/homologacao-privada/popup.html", import.meta.url),"utf8");

function check(host, marker, flag) {
  const document = {
    readyState: "loading", addEventListener(){},
    documentElement: { dataset: { n27PrivateMode: marker } },
    body: {dataset:{}}
  };
  const window = {
    location: {hostname:host, pathname:"/cabelos"},
    Nichelle27Settings:{geral:{ativo:true}},
    __FWR_NICHELLE_PRIVATE_MODE__:flag
  };
  runInNewContext(core,{document,window,console,URL,Set});
  return window.Nichelle27Framework.diagnostico();
}

test("modo privado exige hostname oficial, marcador local e ativação explícita",()=>{
  assert.equal(check("www.nichelleimports.com.br","fwr-local-extension",true).previewPermitido,true);
  assert.equal(check("nichelleimports.com.br","fwr-local-extension",true).previewPermitido,true);
  assert.equal(check("www.nichelleimports.com.br","",true).previewPermitido,false);
  assert.equal(check("www.nichelleimports.com.br","fwr-local-extension",false).previewPermitido,false);
  assert.equal(check("nichelleimports.com.br","",false).previewPermitido,false);
  assert.equal(check("outrodominio.com.br","fwr-local-extension",true).previewPermitido,false);
  assert.equal(check("example.com","fwr-local-extension",true).bloqueado,true);
});
test("manifest Chrome v3 sem execução automática e sem storage",()=>{
  assert.equal(manifest.manifest_version,3);
  assert.deepEqual(manifest.permissions,["activeTab","scripting"]);
  assert.equal(manifest.host_permissions.length,2);
  assert.ok(manifest.host_permissions.every(x=>/nichelleimports\.com\.br\/\*$/.test(x)));
  assert.equal(manifest.content_scripts,undefined);
  assert.equal(manifest.background,undefined);
  assert.equal(manifest.permissions.includes("storage"),false);
});
test("extensão só aplica alterações após clique e permite desligar por reload",()=>{
  assert.doesNotThrow(()=>new Script(popup));
  assert.match(popup,/chrome\.scripting\.executeScript/);
  assert.match(popup,/world:\s*"MAIN"/);
  assert.match(popup,/chrome\.tabs\.reload/);
  assert.match(popup,/chrome\.scripting\.insertCSS/);
  assert.doesNotMatch(popup,/nichelle-2026\.vercel\.app/);
  assert.match(popup,/window\.__FWR_NICHELLE_PRIVATE_MODE__ = true/);
  assert.match(popup,/dataset\.n27PrivateMode = "fwr-local-extension"/);
  assert.match(popup,/files: \["nichelle27\.js"\]/);
  assert.match(popup,/files: \["nichelle27\.css"\]/);
  assert.match(popup,/window\.Nichelle27Framework\?\.mount\(\)/);
  assert.doesNotMatch(popup,/localStorage|sessionStorage|chrome\.storage|\/web_api\/cart|checkout|fetch\s*\(/);
  assert.match(html,/id="inspect"/);
  assert.match(html,/id="visual"/);
  assert.match(html,/id="advanced"/);
  assert.match(html,/id="reset"/);
});
test("modo seguro mantém as vitrines nativas e integração existentes fora do root",()=>{
  assert.match(popup,/mode === "advanced" \? \[\.\.\.main\.querySelectorAll\("\.listagem-produtos"\)\]/);
  assert.match(popup,/integracoes: \{banners:mode==="advanced",videos:mode==="advanced",noticias:mode==="advanced"\}/);
  assert.match(core,/integrations && integrations\[key\] === false/);
});
