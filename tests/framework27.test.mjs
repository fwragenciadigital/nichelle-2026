import { test } from "node:test";
import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";
import { Script } from "node:vm";

const js = await readFile(new URL("../public/nichelle27.js", import.meta.url), "utf8");
const css = await readFile(new URL("../public/nichelle27.css", import.meta.url), "utf8");
const cfg = await readFile(new URL("../integracao/html-framework-nichelle27.html", import.meta.url), "utf8");
const core = await readFile(new URL("../public/nichelle.js", import.meta.url), "utf8");
const original = await readFile(new URL("../framework/referencias/nichelle27.js", import.meta.url), "utf8");

test("runtime e HTML de configurações compilam sem dependências externas", () => {
  assert.doesNotThrow(() => new Script(js));
  const snippets = [...cfg.matchAll(/<script>([\s\S]*?)<\/script>/g)];
  assert.equal(snippets.length, 1);
  assert.doesNotThrow(() => new Script(snippets[0][1]));
  assert.doesNotMatch(js, /\bfetch\s*\(|\baxios\b|\bjQuery\b|\binnerHTML\s*=/);
});
test("todos os blocos começam desativados (incluindo a configuração geral)", () => {
  const names = [
    "geral","layout","topo","qualificadores","maisVendidos","lancamentos",
    "marcas","promocoes","newsletter","instagram","empresa","rodape"
  ];
  for (const name of names) {
    assert.match(cfg, new RegExp(name + ":[\\s\\S]*?ativo:\\s*false"));
  }
});
test("framework Nichelle não usa nomes Malheiro, não recria checkout nem altera runtime dos Shorts", () => {
  assert.doesNotMatch(js + css + cfg, /window\.Malheiro|MalheiroSettings|malheiro-beneficios|data-malheiro-slot/);
  assert.match(original, /window\.MalheiroSettings/);
  assert.match(core, /function initVideoGallery/);
  assert.match(js, /window\.FWRNichelle/);
  assert.match(js, /fwr-nichelle-video-slot/);
  assert.match(js, /fwr-nichelle-vitrine-slot/);
  assert.match(js, /fwr-nichelle-noticias-slot/);
  const executable = js.replace(/\/\*[\s\S]*?\*\//g, "").replace(/^\s*\/\/.*$/gm, "");
  assert.doesNotMatch(executable, /\/web_api\/cart|checkout|fetch\s*\(/);
});
test("ordem do layout e Settings para fonte de produtos nativa, sem inventar dados", () => {
  const expected = [
    "qualificadores","maisVendidos","banners","lancamentos","marcas",
    "videos","promocoes","noticias","newsletter","instagram","empresa"
  ];
  const orderExpression = js.match(/const ORDER = Object\.freeze\(\[([\s\S]*?)\]\);/);
  assert.ok(orderExpression, "ORDER ausente");
  const keys = [...orderExpression[1].matchAll(/"([^"]+)"/g)].map(m => m[1]);
  assert.deepEqual(keys, expected);
  assert.match(js, /source\.dataset\.n27Adopted/);
  assert.match(js, /source\.classList\.add\("n27-shelf__track"\)/);
  assert.match(js, /viewport\.appendChild\(source\)/);
  assert.match(js, /source\.scrollBy/);
  assert.doesNotMatch(js, /R\$\s*[0-9]/);
});
test("CSS escopado tem versões desktop, tablet, mobile e respeito a movimento reduzido", () => {
  assert.match(css, /\.n27-benefits__list\{display:grid/);
  assert.match(css, /\.n27-shelf__track\{display:flex/);
  assert.match(css, /\.n27-brands__grid\{display:grid/);
  assert.match(css, /\.n27-newsletter/);
  assert.match(css, /\.n27-instagram/);
  assert.match(css, /\.n27-company/);
  assert.match(css, /\@media\(max-width:1199px\)/);
  assert.match(css, /\@media\(max-width:767px\)/);
  assert.match(css, /\@media\(prefers-reduced-motion:reduce\)/);
  const cssExecutable = css.replace(/\/\*[\s\S]*?\*\//g, "");
  assert.doesNotMatch(cssExecutable, /\@import|https:\/\/fonts\./);
});
