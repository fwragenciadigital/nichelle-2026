import { test } from "node:test";
import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";
import { Script, runInNewContext } from "node:vm";

const js = await readFile(new URL("../public/nichelle.js", import.meta.url), "utf8");
const configHtml = await readFile(new URL("../integracao/html-noticias-cadastro-rodape.html", import.meta.url), "utf8");
const homeHtml = await readFile(new URL("../integracao/html-noticias-home.html", import.meta.url), "utf8");
const sample = [
  { foto: "https://cdn.awsli.com.br/1000/noticias/um.jpg", titulo: "Uma notícia", breveTexto: "Um breve texto.", data: "2026-10-01", link: "/pagina/noticia-um" },
  { foto: "https://cdn.awsli.com.br/1000/noticias/dois.jpg", titulo: "Duas notícias", breveTexto: "Outro breve texto.", data: "2026-09-25", link: "/pagina/noticia-dois" },
  { foto: "https://cdn.awsli.com.br/1000/noticias/tres.jpg", titulo: "Três notícias", breveTexto: "Mais um breve texto.", data: "2026-08-11", link: "/pagina/noticia-tres" }
];

function simulate({ active = true, items = sample, footer = true, slot = true } = {}) {
  const events = {}, nodes = [], styled = [];
  function el(tag) {
    const node = {
      tagName: tag.toUpperCase(), children: [], attributes: {}, dataset: {}, style: {
        setProperty(name, value, priority) { styled.push({ name, value, priority }); }
      },
      setAttribute(name, value) { this.attributes[name] = value; },
      getAttribute(name) { return this.attributes[name] || null; },
      append(...children) { this.children.push(...children); },
      appendChild(child) { this.children.push(child); return child; },
      replaceChildren(...children) { this.children = children; },
      querySelectorAll(name) { return name === "a[href]" ? this.children.filter(x => x.tagName === "A") : []; },
      closest(name) { return name === "li" ? this.__li || null : null; }
    };
    nodes.push(node);
    return node;
  }
  const homeSlot = el("div");
  const li = el("li");
  const anchor = el("a");
  anchor.attributes.href = "/pagina/noticia-um/";
  li.append(anchor);
  anchor.__li = li;
  const unrelated = el("a");
  unrelated.attributes.href = "/pagina/politica-de-privacidade";
  const styleBase = el("style");
  styleBase.id = "fwr-nichelle-styles";
  const head = el("head");
  const doc = {
    readyState: "complete", head, documentElement: el("html"),
    body: el("body"),
    getElementById(id) {
      if (id === "fwr-nichelle-styles") return styleBase;
      if (id === "fwr-nichelle-noticias-slot") return slot ? homeSlot : null;
      return head.children.find(child => child.id === id) || null;
    },
    querySelector() { return null; },
    querySelectorAll(selector) {
      if (selector.startsWith("footer a[href]")) return footer ? [anchor, unrelated] : [];
      return [];
    },
    createElement: el,
    createTextNode(value) { return { tagName: "#TEXT", textContent: value }; },
    addEventListener(name, cb) { events[name] = cb; },
    dispatchEvent(event) { if (events[event.type]) events[event.type](); }
  };
  const win = {
    location: { href: "https://www.nichelleimports.com.br/", origin: "https://www.nichelleimports.com.br" },
    FWRNichelle: {
      noticias: { ativo: active, ocultarLinksRodape: true, itens: items }
    }
  };
  runInNewContext(js, { window: win, document: doc, URL, Date, Intl, Set });
  return { win, doc, nodes, head, homeSlot, anchor, unrelated, li, styled, events };
}

test("Cadastro em HTML/Rodapé é invisível e inicia com ativo:false", () => {
  assert.match(configHtml, /window\.FWRNichelle\.noticias\s*=/);
  assert.match(configHtml, /ativo:\s*false/);
  assert.match(configHtml, /ocultarLinksRodape:\s*true/);
  for (const field of ["foto", "titulo", "breveTexto", "data", "link"]) {
    assert.equal((configHtml.match(new RegExp("\\b" + field + "\\s*:", "g")) || []).length, 3);
  }
  assert.doesNotMatch(configHtml, /<(?:div|section|style)\b/i);
  const code = [...configHtml.matchAll(/<script>([\s\S]*?)<\/script>/g)];
  assert.equal(code.length, 1);
  assert.doesNotThrow(() => new Script(code[0][1]));
  assert.match(homeHtml, /id="fwr-nichelle-noticias-slot"/);
});
test("Com ativo false não cria o módulo, mas oculta apenas o link institucional cadastrado", () => {
  const ctx = simulate({ active: false });
  assert.equal(ctx.homeSlot.children.length, 0);
  assert.equal(ctx.li.attributes["data-fwr-noticia-footer-oculta"], "1");
  assert.equal(ctx.unrelated.attributes["data-fwr-noticia-footer-oculta"], undefined);
  assert.equal(ctx.styled.length, 1);
  assert.deepEqual(ctx.styled[0], {name: "display", value: "none", priority: "important"});
});
test("Com ativo true cria hero e duas notícias laterais, mantendo textos e links", () => {
  const ctx = simulate();
  assert.equal(ctx.homeSlot.dataset.fwrInitialized, "1");
  assert.equal(ctx.homeSlot.children.length, 1);
  const section = ctx.homeSlot.children[0];
  assert.equal(section.tagName, "SECTION");
  assert.equal(section.children[0].children[1].dataset.count, "3");
  const layout = section.children[0].children[1];
  assert.equal(layout.children.length, 2);
  const hero = layout.children[0];
  assert.equal(hero.tagName, "A");
  assert.equal(hero.href, "https://www.nichelleimports.com.br/pagina/noticia-um");
  assert.equal(hero.children[0].src, sample[0].foto);
  assert.equal(hero.children[0].alt, sample[0].titulo);
  assert.equal(hero.children[1].children[0].textContent, sample[0].titulo);
  assert.equal(hero.children[1].children[1].textContent, sample[0].breveTexto);
  const t = hero.children[1].children[2].children[0];
  assert.equal(t.dateTime, "2026-10-01");
  assert.match(t.textContent, /Publicado em 01 de outubro de 2026/);
  const sidebar = layout.children[1];
  assert.equal(sidebar.children.length, 2);
  assert.equal(sidebar.children[0].href, "https://www.nichelleimports.com.br/pagina/noticia-dois");
  assert.equal(sidebar.children[1].href, "https://www.nichelleimports.com.br/pagina/noticia-tres");
});
test("URLs inválidas ou de outras lojas não viram links de notícia", () => {
  const bad = [
    { ...sample[0], link: "javascript:alert(1)" },
    { ...sample[1], link: "https://evil.example/noticia" },
    { ...sample[2], foto: "http://invalid.example/photo.jpg" }
  ];
  const ctx = simulate({ items: bad });
  assert.equal(ctx.homeSlot.children.length, 0);
  assert.equal(ctx.homeSlot.dataset.fwrInitialized, undefined);
});
test("Renderização não interfere nos Shorts, na vitrine nativa ou em outras páginas", () => {
  const ctx = simulate({ slot: false });
  assert.equal(ctx.head.children.length, 0);
  assert.equal(ctx.li.attributes["data-fwr-noticia-footer-oculta"], "1");
  assert.match(js, /function initVideoGallery\(\)/);
  assert.match(js, /function initBannerVitrine\(\)/);
  assert.match(js, /initVideoGallery\(\);\s*initBannerVitrine\(\);\s*initNoticias\(\)/);
  assert.match(js, /document\.addEventListener\("fwr:nichelle:news-config", initNoticias\)/);
});
test("CSS tem layout 2 colunas no desktop e adaptação tablet/mobile", () => {
  assert.match(js, /grid-template-columns:minmax\(0,1fr\) minmax\(0,1fr\)/);
  assert.match(js, /@media\(max-width:1100px\)/);
  assert.match(js, /@media\(max-width:700px\)/);
  assert.match(js, /@media\(max-width:360px\)/);
  assert.match(js, /fwr-nichelle-news__featured/);
  assert.match(js, /fwr-nichelle-news__sidebar/);
  // O módulo de banners pode buscar opcionalmente o HTML da HOME na própria loja.
  // O módulo Notícias continua sem requisições adicionais.
  const noticias = js.slice(js.indexOf("function initNoticias()"), js.indexOf("function start()"));
  assert.doesNotMatch(noticias, /\bfetch\s*\(|\baxios\b/);
});
