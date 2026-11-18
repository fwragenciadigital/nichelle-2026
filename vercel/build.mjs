import { mkdir, copyFile, readFile, readdir, rm, writeFile } from "node:fs/promises";
import { join, resolve } from "node:path";
import { Script } from "node:vm";

// Publica somente estes assets. O restante do repositório não sai no deploy.
// JS atual continua isolado dos estilos/estrutura da Nichelle27.
const assets = [
  { path: "public/nichelle.js", name: "nichelle.js", kind: "js",
    require: "window.__FWR_NICHELLE_RUNTIME__" },
  { path: "public/nichelle.css", name: "nichelle.css", kind: "css",
    require: "#fwr-nichelle-video-slot" },
  { path: "public/nichelle27.js", name: "nichelle27.js", kind: "js",
    require: "window.Nichelle27Framework" },
  { path: "public/nichelle27.css", name: "nichelle27.css", kind: "css",
    require: ".n27-" }
];

const workspace = resolve(".");
const target = resolve("vercel/dist");
if (target !== resolve(workspace, "vercel", "dist")) {
  throw new Error("Output Vercel fora do diretório esperado");
}
// A saída é sempre recriada para impedir que arquivos residuais do admin/QA
// ou de builds anteriores entrem no artefato público.
await rm(target, { recursive: true, force: true });
await mkdir(target, { recursive: true });
for (const asset of assets) {
  const source = resolve(asset.path);
  const contents = await readFile(source, "utf8");
  if (!contents.trim() || !contents.includes(asset.require)) {
    throw new Error("Asset ausente ou inválido: " + asset.path);
  }
  if (asset.kind === "js") {
    new Script(contents, { filename: asset.name });
  }
  await copyFile(source, join(target, asset.name));
  console.log("Asset publicado: /" + asset.name + " (" + Buffer.byteLength(contents) + " bytes)");
}
// Entrega primária: somente duas URLs externas para JS + CSS.
 // Inclui os recursos legados já validados sem duplicar <script> na Loja Integrada.
const legacyRuntime = (await readFile(resolve("public/nichelle.js"), "utf8"))
  .replace(/\binstallStyles\(\);/, "/* CSS incorporado ao nichelle27.css */");
if (legacyRuntime.includes("  installStyles();")) {
  throw new Error("O bundle tentou carregar CSS duplicado");
}
const isolationJS = await readFile(resolve("public/nichelle-isolation.js"), "utf8");
new Script(isolationJS, { filename: "nichelle-isolation.js" });
const combinedJS = (await readFile(resolve("public/nichelle27.js"), "utf8")) +
  "\n\n/* Runtime FWR legado integrado ao bundle Nichelle27 */\n" + legacyRuntime +
  "\n\n/* Isolamento visual exclusivo da home em preview */\n" + isolationJS +
  "\n\n/* Reconstrução da home a partir da arte aprovada */\n" +
  (await readFile(resolve("public/nichelle-approved.js"), "utf8")) +
  "\n\n/* FULLBANNER vinculado aos banners nativos publicados na Loja Integrada */\n" +
  (await readFile(resolve("public/nichelle-fullbanners.js"), "utf8")) +
  "\n\n/* Catálogo de categorias publicado na LI */\n" +
  "window.N27CategoryCatalog = " + JSON.stringify(JSON.parse(await readFile(resolve("public/nichelle-category-catalog.json"), "utf8"))) + ";\n" +
  "\n\n/* Topo 100% FWR, sem dependências de apresentação do Groom */\n" +
  (await readFile(resolve("public/nichelle-header.js"), "utf8")) +
  "\n\n/* Vantagens FWR, independente do tema ativo */\n" +
  (await readFile(resolve("public/nichelle-home-benefits.js"), "utf8")) +
  "\n\n/* Mini banners vindos da posicao Mini Banner no painel da Loja Integrada */\n" +
  (await readFile(resolve("public/nichelle-mini-banners.js"), "utf8")) +
  "\n\n/* Mais Vendidos FWR: cards próprios, dados reais da Loja Integrada */\n" +
  (await readFile(resolve("public/nichelle-best-sellers.js"), "utf8")) +
  "\n\n/* Marcas: logos, links e ordenação nativos da Loja Integrada */\n" +
  (await readFile(resolve("public/nichelle-brands.js"), "utf8")) +
  "\n\n/* Galeria Shorts FWR — 4 cards verticais, dados do JSON publicado */\n" +
  (await readFile(resolve("public/nichelle-shorts.js"), "utf8")) +
  "\n\n/* Conteúdos para você: editorial no padrão aprovado */\n" +
  (await readFile(resolve("public/nichelle-news.js"), "utf8")) +
  "\n\n/* Fade-in suave em todas as seções da home FWR */\n" +
  (await readFile(resolve("public/nichelle-scroll-motion.js"), "utf8")) +
  "\n\n/* Newsletter compacta + Instagram LightWidget real */\n" +
  (await readFile(resolve("public/nichelle-endcap.js"), "utf8")) +
  "\n\n/* Rodapé FWR com dados/links/selos nativos da Loja Integrada */\n" +
  (await readFile(resolve("public/nichelle-footer.js"), "utf8")) +
  "\n\n/* Drawer carrinho FWR com dados oficiais Loja Integrada */\n" +
  (await readFile(resolve("public/nichelle-cart-drawer.js"), "utf8")) +
  "\n\n/* PDP FWR: variações e ações nativas da Loja Integrada */\n" +
  (await readFile(resolve("public/nichelle-pdp.js"), "utf8")) +
  "\n\n/* Cart page FWR: resumo com checkout oficial */\n" +
  (await readFile(resolve("public/nichelle-cart-page.js"), "utf8")) +
  "\n\n/* Cupom flutuante de primeira compra, validado no carrinho LI */\n" +
  (await readFile(resolve("public/nichelle-first-order-coupon.js"), "utf8"));
new Script(combinedJS, { filename: "nichelle27.js" });
await writeFile(join(target, "nichelle27.js"), combinedJS);
const combinedCSS = (await readFile(resolve("public/nichelle27.css"), "utf8")) +
  "\n\n/* Módulos FWR existentes: banners, notícias, vídeos */\n" +
  (await readFile(resolve("public/nichelle.css"), "utf8")) +
  "\n\n/* Neutralização visual do tema ativo (somente preview) */\n" +
  (await readFile(resolve("public/nichelle-isolation.css"), "utf8")) +
  "\n\n/* Reconstrução visual da home aprovada */\n" +
  (await readFile(resolve("public/nichelle-approved.css"), "utf8")) +
  "\n\n/* FULLBANNER adaptativo com imagens/links do painel nativo */\n" +
  (await readFile(resolve("public/nichelle-fullbanners.css"), "utf8")) +
  "\n\n/* Cabeçalho FWR independente do Groom */\n" +
  (await readFile(resolve("public/nichelle-header.css"), "utf8")) +
  "\n\n/* Vantagens aprovadas da Nichelle - componente FWR */\n" +
  (await readFile(resolve("public/nichelle-home-benefits.css"), "utf8")) +
  "\n\n/* Mais Vendidos: vitrine visual fiel à arte aprovada */\n" +
  (await readFile(resolve("public/nichelle-best-sellers.css"), "utf8")) +
  "\n\n/* Marcas FWR: cartões brancos sobre fundo lilás aprovado */\n" +
  (await readFile(resolve("public/nichelle-brands.css"), "utf8")) +
  "\n\n/* Cards Shorts FWR independentes do Groom */\n" +
  (await readFile(resolve("public/nichelle-shorts.css"), "utf8")) +
  "\n\n/* Notícias em três cards conforme aprovação */\n" +
  (await readFile(resolve("public/nichelle-news.css"), "utf8")) +
  "\n\n/* Animação progressiva sem alterações de layout */\n" +
  (await readFile(resolve("public/nichelle-scroll-motion.css"), "utf8")) +
  "\n\n/* Newsletter aprovada e Instagram com posts LightWidget */\n" +
  (await readFile(resolve("public/nichelle-endcap.css"), "utf8")) +
  "\n\n/* Rodapé institucional aprovado, sem dependência visual Groom */\n" +
  (await readFile(resolve("public/nichelle-footer.css"), "utf8")) +
  "\n\n/* Drawer carrinho FWR */\n" +
  (await readFile(resolve("public/nichelle-cart-drawer.css"), "utf8")) +
  "\n\n/* PDP FWR responsive */\n" +
  (await readFile(resolve("public/nichelle-pdp.css"), "utf8")) +
  "\n\n/* Carrinho FWR com checkout nativo */\n" +
  (await readFile(resolve("public/nichelle-cart-page.css"), "utf8")) +
  "\n\n/* Cupom flutuante de primeira compra no layout preview */\n" +
  (await readFile(resolve("public/nichelle-first-order-coupon.css"), "utf8")) +
  "\n\n/* Tipografia Montserrat em todas as paginas e componentes aprovados */\n" +
  (await readFile(resolve("public/nichelle-fonts.css"), "utf8")) +
  "\n\n/* Container 1540px em todo projeto, com padding responsivo sem alterar componentes internos */\n" +
  (await readFile(resolve("public/nichelle-containers.css"), "utf8"));
await writeFile(join(target, "nichelle27.css"), combinedCSS);
for (const file of ["galeria-videos.js", "galeria-videos.css",
  "galeria-preview.json", "galeria-publicada.json", "nichelle-vantagens.json"]) {
  await copyFile(resolve("public", file), join(target, file));
}
// Artes editoriais produzidas a partir do mockup aprovado do cliente.
const assetNames = ["hero-medicube.webp","mini-1.webp","mini-2.webp","mini-3.webp","mini-4.webp"];
await mkdir(join(target, "assets"), { recursive: true });
for (const name of assetNames) {
  await copyFile(resolve("public", "assets", name), join(target, "assets", name));
}
console.log("Nichelle27: JS/CSS integrados + " + assetNames.length + " artes de preview + arquivos de galeria.");
await writeFile(join(target, "index.html"),
  '<!doctype html><html lang="pt-BR"><meta charset="utf-8"><title>Nichelle 2026 — Assets</title>' +
  '<body><p>Nichelle 2026 · scripts e estilos versionados individualmente.</p></body></html>\n');

const previewTarget = join(target, "preview");
await mkdir(previewTarget, { recursive: true });
for (const name of ["index.html", "preview.css", "preview-data.js", "preview.js"]) {
  await copyFile(resolve("preview", name), join(previewTarget, name));
}
const allowedPreviewAssets = new Set((await readdir(resolve("preview/assets")))
  .filter(name => /^[a-z0-9-]+\.svg$/.test(name)));
await mkdir(join(previewTarget, "assets"), { recursive: true });
for (const name of allowedPreviewAssets) {
  await copyFile(resolve("preview/assets", name), join(previewTarget, "assets", name));
}
console.log("Prévia isolada copiada: /preview/ (" + allowedPreviewAssets.size + " SVGs demonstrativos)");
