import { test } from 'node:test';
import assert from 'node:assert/strict';
import { readFile } from 'node:fs/promises';

const schema = JSON.parse(await readFile(new URL('../config/schema.json', import.meta.url), 'utf8'));
const defaults = JSON.parse(await readFile(new URL('../config/defaults.json', import.meta.url), 'utf8'));
const published = JSON.parse(await readFile(new URL('../public/galeria-publicada.json', import.meta.url), 'utf8'));
const preview = JSON.parse(await readFile(new URL('../public/galeria-preview.json', import.meta.url), 'utf8'));

test('schema aceita apenas módulos exclusivos da FWR', () => {
  assert.deepEqual(Object.keys(schema.properties.modules.properties), ['videoGallery']);
  assert.equal(schema.properties.modules.additionalProperties, false);
});
test('recursos nativos da Loja Integrada não existem nos Settings', () => {
  const s = JSON.stringify(schema).toLowerCase();
  for (const term of ['nativebanner', 'nativecategory', 'nativecart', 'nativeproducts', 'checkoutprice']) {
    assert.equal(s.includes(term), false);
  }
});
test('nenhum módulo inicial está ativado, sem URLs inventadas', () => {
  assert.equal(defaults.project, 'nichelle-2026');
  assert.equal(defaults.modules.videoGallery.enabled, false);
  assert.equal(defaults.modules.videoGallery.placement, 'pending');
  assert.deepEqual(defaults.modules.videoGallery.items, []);
});
test('configuração publicada e preview não contêm URLs ou mídia demonstrativa', () => {
  for (const config of [published, preview]) {
    assert.equal(config.modules.videoGallery.enabled, false);
    assert.deepEqual(config.modules.videoGallery.items, []);
    assert.doesNotMatch(JSON.stringify(config), /demo|medicube|youtube\.com|youtu\.be/i);
  }
});
test('configuração de produção só admite YouTube e imagem opcional', () => {
  const item = schema.properties.modules.properties.videoGallery.properties.items.items;
  assert.deepEqual(item.properties.provider.enum, ['youtube']);
  assert.equal(item.required.includes('posterUrl'), false);
  assert.equal(item.properties.videoUrl.pattern, '^https://');
});
