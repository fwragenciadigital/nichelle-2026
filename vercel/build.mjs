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
  "\n\n/* Isolamento visual exclusivo da home em preview */\n" + isolationJS;
new Script(combinedJS, { filename: "nichelle27.js" });
await writeFile(join(target, "nichelle27.js"), combinedJS);
const combinedCSS = (await readFile(resolve("public/nichelle27.css"), "utf8")) +
  "\n\n/* Módulos FWR existentes: banners, notícias, vídeos */\n" +
  (await readFile(resolve("public/nichelle.css"), "utf8")) +
  "\n\n/* Neutralização visual do tema ativo (somente preview) */\n" +
  (await readFile(resolve("public/nichelle-isolation.css"), "utf8"));
await writeFile(join(target, "nichelle27.css"), combinedCSS);
for (const file of ["galeria-videos.js", "galeria-videos.css",
  "galeria-preview.json", "galeria-publicada.json"]) {
  await copyFile(resolve("public", file), join(target, file));
}
console.log("Nichelle27: bundle JS/CSS + 4 arquivos de galeria publicados.");
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
