import { test } from "node:test";
import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";

const html = await readFile(new URL("../preview/index.html", import.meta.url), "utf8");
const data = await readFile(new URL("../preview/preview-data.js", import.meta.url), "utf8");
const script = await readFile(new URL("../preview/preview.js", import.meta.url), "utf8");

test("prévia é marcada como fixture e bloqueada para indexação", () => {
  assert.match(html, /data-nichelle-preview-fixture="true"/);
  assert.match(html, /noindex,nofollow,noarchive/);
  assert.match(html, /PRÉVIA VISUAL/);
  assert.match(html, /conteúdo, produtos, preços, marcas e imagens são demonstrativos/);
});

test("prévia não habilita Shorts fictícios nem aciona integração de comércio", () => {
  assert.match(data, /galeriaVideos:\s*\{\s*ativo:\s*false,\s*shorts:\s*\[\]\s*\}/);
  assert.doesNotMatch(data, /youtube\.com\/shorts|youtu\.be\//);
  assert.match(html, /Dados comerciais nativos · não demonstrados/);
  assert.match(html, /disabled/);
  assert.doesNotMatch(html, /<iframe\b/i);
});

test("script de fixture sai imediatamente se a marca não estiver presente", () => {
  assert.match(script, /if \(document\.body\.dataset\.nichellePreviewFixture !== "true"\) return/);
});
