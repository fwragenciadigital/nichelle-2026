// Auditoria somente leitura da página pública. Não envia dados nem altera a loja.
const pages = ["https://www.nichelleimports.com.br/cabelos", "https://www.nichelleimports.com.br/"];
for (const page of pages) {
  try {
    const response = await fetch(page, { signal: AbortSignal.timeout(18000),
      headers: { "User-Agent": "Mozilla/5.0 (compatible; Nichelle-Visual-Audit/1.0)" } });
    const html = await response.text();
    const counts = Object.fromEntries(
      ["mini-pages1","mini-pages2","mini-pages3","mini-pages4",
       "fwr-nichelle-vitrine-slot","nichelle.js","banner-lateral","banner lateral"].map(k =>
        [k, html.toLowerCase().split(k.toLowerCase()).length - 1]));
    const examples = [];
    for (const marker of ["mini-pages1","mini-pages2","fwr-nichelle-vitrine-slot","nichelle.js"]) {
      const index = html.toLowerCase().indexOf(marker.toLowerCase());
      if (index < 0) continue;
      examples.push({ marker, excerpt: html.slice(Math.max(0,index-130),Math.min(html.length,index+160))
        .replace(/\s+/g, " ").slice(0,290) });
    }
    console.log(JSON.stringify({ page, status: response.status, length: html.length,
      occurrences: counts, examples },null,2));
  } catch(error) {
    console.log(JSON.stringify({ page, status: "unavailable", error: String(error).slice(0,150) }));
  }
}
