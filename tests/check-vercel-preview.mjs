// Disponibilidade pública do JS de homologação no deployment Preview (sem cookies).
const hosts=[
  "https://nichelle-2026-git-develop-fwragenciadigitals-projects.vercel.app/nichelle27.js",
  "https://nichelle-2026-b1zig8qlj-fwragenciadigitals-projects.vercel.app/nichelle27.js"
];
for(const url of hosts){
 try{
  const response=await fetch(url,{redirect:"manual",signal:AbortSignal.timeout(9000)});
  const type=response.headers.get("content-type")||"";
  const text=response.status===200 ? await response.text() : "";
  console.log(JSON.stringify({url,status:response.status,type,
    scriptIdentificado: text.includes("window.Nichelle27Framework"),
    gatePrivado: text.includes("fwr-local-extension")}));
 }catch(error){console.log(JSON.stringify({url,status:"indisponível",message:String(error).slice(0,120)}));}
}
