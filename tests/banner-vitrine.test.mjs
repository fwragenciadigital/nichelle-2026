import { test } from "node:test";
import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";
import { Script, runInNewContext } from "node:vm";

const js = await readFile(new URL("../public/nichelle.js", import.meta.url), "utf8");
const html = await readFile(new URL("../integracao/html-banner-vitrine-4-cards.html", import.meta.url), "utf8");
const categoryHtml = await readFile(new URL("../integracao/html-categoria-cabelos.html", import.meta.url), "utf8");
const lateralHtml = await readFile(new URL("../integracao/html-banners-laterais-global.html", import.meta.url), "utf8");

function createEnvironment(active, amount = 4, origin = "vitrine", page = "/", pages = null) {
  const state = { edits: [], slot: null, sources: [] };
  function elem(tag = "div") {
    const x = {
      tagName: tag.toUpperCase(), children: [], attributes: {}, dataset: {},
      style: {}, className: "", textContent: "", classList: { add(v) { state.edits.push(v); } },
      appendChild(child) { this.children.push(child); return child; },
      replaceChildren(...items) { this.children = items; },
      getAttribute(key) { return this.attributes[key] ?? null; },
      setAttribute(key, value) { this.attributes[key] = String(value); },
      removeAttribute(key) { delete this.attributes[key]; },
      querySelector(q) { return q === "img" ? this.children.find(c => c.tagName === "IMG") : null; },
      querySelectorAll(q) { return q === "img" ? this.children.filter(c => c.tagName === "IMG") : []; },
      cloneNode() {
        const result = elem(tag);
        result.attributes = { ...this.attributes };
        result.currentSrc = this.currentSrc;
        return result;
      }
    };
    return x;
  }
  const names = ["Mini 1 vitrine-mini", "Mini 2 vitrine-mini", "Mini 3 vitrine-mini", "Mini 4 vitrine-mini"];
  for (let i = 0; i < amount; i++) {
    const a = elem("a");
    a.attributes.href = "/colecao-" + (i + 1);
    const img = elem("img");
    img.attributes.alt = names[i];
    img.attributes.src = "https://cdn.awsli.com.br/100/" + (["categoria","mini","lateral"].includes(origin) ? "uploads" : "banner") + "/card" + i + ".jpg";
    img.currentSrc = img.attributes.src;
    img.closest = selector => selector === "a[href]" ? a : (origin === "vitrine" && selector.includes(".banner.vitrine") ? a : null);
    img.parentElement = null;
    a.children.push(img);
    state.sources.push(img);
  }
  const slot = elem("div");
  state.slot = slot;
  const document = {
    readyState: "complete", head: elem("head"), documentElement: elem("html"),
    getElementById(id) {
      if (id === "fwr-nichelle-styles") return elem("style");
      if (id === "fwr-nichelle-vitrine-styles") return null;
      if (id === "fwr-nichelle-vitrine-slot") return slot;
      return null;
    },
    querySelector() { return null; },
    querySelectorAll(selector) {
      return ["img", "img[alt],img[title]"].includes(selector) ? state.sources : [];
    },
    createElement: elem,
    addEventListener() {} // Simula document.addEventListener para outros módulos isolados.
  };
  const window = {
    location: { href: "https://www.nichelleimports.com.br" + page, pathname: page, origin: "https://www.nichelleimports.com.br" },
    FWRNichelle: { bannerVitrine: { ativo: active, nomes: names, origem: origin, paginas: pages } }
  };
  runInNewContext(js, { window, document, URL, MutationObserver: class {}, Set, console });
  return state;
}

test("HTML opcional inicia SEMPRE desativado e sem CSS extra", () => {
  assert.match(html, /bannerVitrine\s*=\s*\{/);
  assert.match(html, /ativo:\s*false/);
  assert.equal((html.match(/"Mini [1-4] vitrine-mini"/g) || []).length, 4);
  assert.doesNotMatch(html, /<style/i);
  assert.doesNotThrow(() => new Script([...html.matchAll(/<script>([\s\S]*?)<\/script>/g)][0][1]));
});
test("quando false, não cria banners nem altera conteúdo nativo", () => {
  const env = createEnvironment(false);
  assert.equal(env.slot.children.length, 0);
  assert.equal(env.sources.length, 4);
  assert.equal(env.edits.length, 0);
});
test("quando true, exibe 4 cards ordenados por nome, preserva links e oculta fontes individuais", () => {
  const env = createEnvironment(true);
  assert.equal(env.slot.dataset.fwrInitialized, "1");
  assert.equal(env.slot.children.length, 1);
  const section = env.slot.children[0];
  assert.equal(section.children.length, 1);
  const grid = section.children[0];
  assert.equal(grid.children.length, 4);
  for (let i = 0; i < 4; i++) {
    const card = grid.children[i];
    assert.equal(card.tagName, "A");
    assert.equal(card.href, "https://www.nichelleimports.com.br/colecao-" + (i + 1));
    assert.equal(card.children[0].src, "https://cdn.awsli.com.br/100/banner/card" + i + ".jpg");
  }
  assert.equal(env.edits.filter(x => x === "fwr-nichelle-vitrine-native-hidden").length, 4);
});
test("não oculta banner algum se faltar um dos quatro", () => {
  // Não observar DOM nesta fixture, apenas confirmar o fail-closed pela origem.
  const html = js.slice(js.indexOf("  function initBannerVitrine()"), js.indexOf("  function start()"));
  assert.match(html, /if \(!entry\) return \[\]/);
  assert.match(html, /if \(found.length !== 4\) return false/);
  assert.match(html, /observer\.disconnect\(\)/);
  assert.match(html, /6000/);
});
test("CSS separado do módulo de Shorts, sem bibliotecas ou requisições de API", () => {
  assert.match(js, /function initVideoGallery\(\)/);
  assert.match(js, /function initBannerVitrine\(\)/);
  assert.match(js, /initVideoGallery\(\);\s*initBannerVitrine\(\)/);
  assert.match(js, /aspect-ratio:3\/5/);
  assert.match(js, /scroll-snap-type:x mandatory/);
  assert.doesNotMatch(js, /\baxios\b/);
  assert.match(js, /url\.origin === window\.location\.origin/);
});

test("Categoria Cabelos: configuração só atua nesta categoria e inicia false", () => {
 assert.match(categoryHtml, /\/cabelos/);
 assert.match(categoryHtml, /origem: "mini"/);
 assert.match(categoryHtml, /ativo: false/);
 assert.match(categoryHtml, /ocultarOriginais: false/);
 const scripts=[...categoryHtml.matchAll(/<script>([\s\S]*?)<\/script>/g)];
 assert.equal(scripts.length,1);
 assert.doesNotThrow(()=>new Script(scripts[0][1]));
});
test("Mini Banner de categoria usa nome ALT mesmo sem classes e preserva slider nativo",()=>{
 const env=createEnvironment(true,4,"mini");
 assert.equal(env.slot.dataset.fwrInitialized,"1");
 assert.equal(env.slot.children[0].children[0].children.length,4);
 assert.equal(env.edits.filter(x=>x==="fwr-nichelle-vitrine-native-hidden").length,0);
 assert.equal(env.slot.children[0].children[0].children[0].children[0].src,
  "https://cdn.awsli.com.br/100/uploads/card0.jpg");
});
test("Disponibiliza diagnóstico sem varrer DOM no carregamento quando módulo desligado",()=>{
 assert.match(js,/diagnosticoBanners = function/);
 assert.match(js,/slotEncontrado/);
 assert.match(js,/imagemNoDOM/);
 assert.match(js,/document\.addEventListener\("fwr:nichelle:banner-config", initBannerVitrine\)/);
});

test("HTML padrão de quatro cards aponta para Mini Banner e começa desativado", () => {
 assert.match(html, /origem: "mini"/);
 assert.match(html, /ocultarOriginais: false/);
 assert.match(html, /ativo: false/);
});
test("Modo Mini Banner não precisa de classes específicas nem oculta os banners de origem", () => {
 const env = createEnvironment(true, 4, "mini");
 assert.equal(env.slot.dataset.fwrInitialized, "1");
 assert.equal(env.slot.children[0].children[0].children.length, 4);
 assert.equal(env.edits.length, 0);
});
test("Compatibilidade com modo categoria antigo permanece disponível", () => {
 const env = createEnvironment(true, 4, "categoria");
 assert.equal(env.slot.dataset.fwrInitialized, "1");
 assert.equal(env.edits.length, 0);
});

test("Banner Lateral pode ser origem de cards sem depender da categoria ou classe CSS", () => {
 const home=createEnvironment(true,4,"lateral","/");
 const category=createEnvironment(true,4,"lateral","/cabelos");
 assert.equal(home.slot.dataset.fwrInitialized,"1");
 assert.equal(category.slot.dataset.fwrInitialized,"1");
 assert.equal(home.edits.length,0,"Não esconder componente nativo por padrão");
 assert.equal(home.slot.children[0].children[0].children.length,4);
});
test("Escopo configurável: homologação em /cabelos, sem impor categoria no runtime", () => {
 const category=createEnvironment(true,4,"lateral","/cabelos",["/cabelos"]);
 const home=createEnvironment(true,4,"lateral","/",["/cabelos"]);
 assert.equal(category.slot.dataset.fwrInitialized,"1");
 assert.equal(home.slot.dataset.fwrInitialized,undefined);
 const everywhere=createEnvironment(true,4,"lateral","/pagina/institucional",[]);
 assert.equal(everywhere.slot.dataset.fwrInitialized,"1");
});
test("Cadastro global para Banner Lateral não instala segundo JS nem ativa por padrão", () => {
 assert.match(lateralHtml,/origem: "lateral"/);
 assert.match(lateralHtml,/ativo: true/);
 assert.match(lateralHtml,/paginas: \["\/cabelos"\]/);
 assert.match(lateralHtml,/"mini-pages1"/);
 assert.match(lateralHtml,/document\.dispatchEvent\(new Event\("fwr:nichelle:banner-config"\)\)/);
 assert.doesNotMatch(lateralHtml,/script[^\n]*src=/);
 const scripts=[...lateralHtml.matchAll(/<script>([\s\S]*?)<\/script>/g)];
 assert.equal(scripts.length,1);
 assert.doesNotThrow(()=>new Script(scripts[0][1]));
});

test("Novo modo Banner Lateral identifica imagem pelo arquivo mesmo com ALT genérico", () => {
 const env=createEnvironment(true,4,"lateral","/cabelos");
 assert.equal(env.slot.dataset.fwrInitialized,"1");
 assert.match(js,/function bannerNameMatches\(img, name\)/);
 assert.match(js,/leaf\.startsWith\(name \+ "-"/);
 assert.match(js,/data-banner-name/);
});
test("HTML de homologação não ativa banners na HOME", () => {
 assert.match(lateralHtml,/paginas: \["\/cabelos"\]/);
 assert.match(lateralHtml,/fonteAlternativa: "\/"/);
 assert.match(lateralHtml,/imagens: \[\]/);
 assert.match(lateralHtml,/ativo: true/);
});
test("Fonte alternativa só faz requisição dentro da mesma loja", () => {
 assert.match(js,/url\.origin === window\.location\.origin/);
 assert.match(js,/credentials: "same-origin"/);
 assert.match(js,/new window\.DOMParser\(\)\.parseFromString/);
});
test("URL manual opcional permite reaproveitar banners cadastrados na LI", () => {
 assert.match(js,/Array\.isArray\(cfg\.imagens\)/);
 assert.match(js,/safeURL\(item\.imagem\)/);
 assert.match(js,/destination: safeURL\(item\.link\)/);
});
test("URL '#' de banner lateral não vira navegação; preserva imagem",()=>{
 assert.match(js,/value\.trim\(\) === "#"/);
});
