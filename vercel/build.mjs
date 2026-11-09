import { mkdir, copyFile, readFile, writeFile } from "node:fs/promises";
import { join, resolve } from "node:path";
import { Script } from "node:vm";

// Publica somente estes assets. O restante do repositório não sai no deploy.
// JS atual continua isolado dos estilos/estrutura da Nichelle27.
const assets = [
  { path: "public/nichelle.js", name: "nichelle.js", kind: "js",
    require: "window.__FWR_NICHELLE_RUNTIME__" },
  { path: "public/nichelle27.js", name: "nichelle27.js", kind: "js",
    require: "window.Nichelle27Framework" },
  { path: "public/nichelle27.css", name: "nichelle27.css", kind: "css",
    require: ".n27-" }
];

const target = resolve("vercel/dist");
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
await writeFile(join(target, "index.html"),
  '<!doctype html><html lang="pt-BR"><meta charset="utf-8"><title>Nichelle 2026 — Assets</title>' +
  '<body><p>Nichelle 2026 · scripts e estilos versionados individualmente.</p></body></html>\n');
