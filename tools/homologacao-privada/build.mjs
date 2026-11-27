import { mkdir, copyFile, rm, readFile } from "node:fs/promises";
import { resolve, join } from "node:path";
import { Script } from "node:vm";

// Gerar extensão totalmente local a partir dos MESMOS assets versionados.
// Não copiar esta pasta para Vercel. Nunca empacotar admin/, dados ou tokens.
const base = resolve("tools/homologacao-privada");
const target = join(base, "dist");
await rm(target, { recursive: true, force: true });
await mkdir(target, { recursive: true });
for(const name of ["manifest.json","popup.html","popup.js"]) {
  await copyFile(join(base,name),join(target,name));
}
for(const name of ["nichelle27.js","nichelle27.css"]) {
  await copyFile(resolve("public",name),join(target,name));
}
new Script(await readFile(join(target,"popup.js"),"utf8"));
new Script(await readFile(join(target,"nichelle27.js"),"utf8"));
const manifest=JSON.parse(await readFile(join(target,"manifest.json"),"utf8"));
if(manifest.manifest_version!==3 || manifest.background || manifest.content_scripts) {
  throw Error("Pacote não é local opt-in");
}
console.log("Extensão privada montada em "+target+" (5 arquivos, sem dependência da Vercel).");
