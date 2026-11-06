import { mkdir, copyFile, readFile, writeFile } from "node:fs/promises";
import { join, resolve } from "node:path";
import { Script } from "node:vm";

const source = resolve("public/nichelle.js");
const target = resolve("vercel/dist");
const js = await readFile(source, "utf8");
new Script(js, { filename: "nichelle.js" });
if (!js.includes("window.__FWR_NICHELLE_RUNTIME__")) {
  throw new Error("Runtime Nichelle esperado não encontrado");
}
await mkdir(target, { recursive: true });
await copyFile(source, join(target, "nichelle.js"));
await writeFile(join(target, "index.html"), "<!doctype html><html lang=\"pt-BR\"><meta charset=\"utf-8\"><title>Nichelle Assets</title><body><p>Nichelle FWR · apenas assets JS.</p></body></html>\n");
console.log("Bundle estático gerado em vercel/dist/nichelle.js");
