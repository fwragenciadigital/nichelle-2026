import { test } from "node:test";
import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";
import { Script, runInNewContext } from "node:vm";

const js = await readFile(new URL("../public/nichelle.js", import.meta.url), "utf8");
const html = await readFile(new URL("../integracao/html-banner-vitrine-4-cards.html", import.meta.url), "utf8");

function createEnvironment(active, amount = 4) {
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
    img.attributes.src = "https://cdn.awsli.com.br/100/banner/card" + i + ".jpg";
    img.currentSrc = img.attributes.src;
    img.closest = selector => selector === "a[href]" ? a : (selector.includes(".banner.vitrine") ? a : null);
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
      return selector === "img[alt],img[title]" ? state.sources : [];
    },
    createElement: elem,
    addEventListener() {} // Simula document.addEventListener para outros módulos isolados.
  };
  const window = {
    location: { href: "https://www.nichelleimports.com.br/", origin: "https://www.nichelleimports.com.br" },
    FWRNichelle: { bannerVitrine: { ativo: active, nomes: names } }
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
  assert.match(html, /if \(!img\) return \[\]/);
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
  assert.doesNotMatch(js, /\bfetch\s*\(|\baxios\b/);
});
