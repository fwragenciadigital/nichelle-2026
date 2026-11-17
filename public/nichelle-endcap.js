/*
 * Nichelle Imports 2026 — approved footer prelude v1.0
 * Layout-only newsletter; preserves LI native #barraNewsletter and AJAX
 * .newsletter-assinar action. Instagram uses the exact user LightWidget
 * iframe, without manufacturing product or Instagram content.
 * Runs only on official homepage ?nichelle_preview=1.
 */
(function(){
  "use strict";
  const PATH=(location.pathname.replace(/\/+$/,"")||"/");
  if(!/^(www\.)?nichelleimports\.com\.br$/i.test(location.hostname) ||
    PATH!=="/" || new URLSearchParams(location.search).get("nichelle_preview")!=="1")return;
  const WIDGET="https://cdn.lightwidget.com/widgets/ae2ac001588f5eba997f9106957c5d8e.html";
  const SCRIPT="https://cdn.lightwidget.com/widgets/lightwidget.js";
  let mountQueued=false,scriptRequested=false,originalTitle=null,originalSubtitle=null,originalButton=null;
  const settings=()=>{
    const n=window.Nichelle27Settings||{};
    const newsletter=n.newsletterFWR||{};
    const instagram=n.instagramWidget||{};
    return{
      newsletter:{
        ativo:newsletter.ativo!==false,
        titulo:safeText(newsletter.titulo??"Fique por dentro das novidades",90),
        subtitulo:safeText(newsletter.subtitulo??"Receba lançamentos, dicas e ofertas exclusivas.",140),
        botao:safeText(newsletter.botao??"QUERO RECEBER",28),
        placeholder:safeText(newsletter.placeholder??"Insira seu e-mail",70)
      },
      instagram:{
        ativo:instagram.ativo!==false,
        usuario:safeText(instagram.usuario??"@nichelle_imports",55),
        legenda:safeText(instagram.legenda??"ÚLTIMAS POSTAGENS",48),
        urlPerfil:safeProfile(instagram.urlPerfil??"https://www.instagram.com/nichelle_imports/"),
        widgetUrl:safeWidget(instagram.widgetUrl??WIDGET),
        capa:safeImage(instagram.capa??"https://cdn.awsli.com.br/2550/2550587/arquivos/coreana1.jpg")
      }
    };
  };
  function safeText(value,max){
    return typeof value==="string"?value.replace(/\s+/g," ").trim().slice(0,max):"";
  }
  function safeProfile(input){
    try{
      const u=new URL(input);return u.protocol==="https:"&&
        ["www.instagram.com","instagram.com"].includes(u.hostname)&&!u.username&&!u.password
        ?u.href:"https://www.instagram.com/nichelle_imports/";
    }catch(_){return"https://www.instagram.com/nichelle_imports/";}
  }
  function safeWidget(input){
    try{
      const u=new URL(input);
      return u.protocol==="https:"&&u.hostname==="cdn.lightwidget.com"&&
        /^\/widgets\/[a-f0-9]{32}\.html$/.test(u.pathname)&&!u.username&&!u.password
        ?u.href:WIDGET;
    }catch(_){return WIDGET;}
  }
  function safeImage(input){
    try{
      const u=new URL(input,location.origin);
      return u.protocol==="https:"&&!u.username&&!u.password?u.href:"";
    }catch(_){return"";}
  }
  function allowed(){
    const g=window.Nichelle27Settings?.geral;
    return g?.ativo===true && g.modoPreview===true && g.publicarNaLoja!==true;
  }
  function node(tag,cls,content){
    const n=document.createElement(tag);if(cls)n.className=cls;
    if(content!==undefined)n.textContent=content;return n;
  }
  function newsletter(config){
    const root=document.getElementById("n27-approved-newsletter");
    const native=document.getElementById("barraNewsletter");
    if(!root||!native||!root.contains(native))return;
    const title=native.querySelector(".newsletter-titulo .titulo"),
      subtitle=native.querySelector(".newsletter-titulo .texto-newsletter"),
      button=native.querySelector("button.newsletter-assinar"),
      input=native.querySelector('input[name="email"]');
    if(!title||!subtitle||!button||!input)return;
    if(originalTitle===null)originalTitle=title.innerHTML;
    if(originalSubtitle===null)originalSubtitle=subtitle.textContent;
    if(originalButton===null)originalButton=button.innerHTML;
    if(!config.ativo){
      root.removeAttribute("data-n27-newsletter");
      document.documentElement.removeAttribute("data-n27-endcap-newsletter");
      if(title.dataset.n27Text==="1"){
        title.innerHTML=originalTitle;delete title.dataset.n27Text;
      }
      if(subtitle.dataset.n27Text==="1"){
        subtitle.textContent=originalSubtitle;delete subtitle.dataset.n27Text;
      }
      if(button.dataset.n27Text==="1"){
        button.innerHTML=originalButton;delete button.dataset.n27Text;
      }
      return;
    }
    title.textContent=config.titulo;
    title.dataset.n27Text="1";
    subtitle.textContent=config.subtitulo;
    subtitle.dataset.n27Text="1";
    button.textContent=config.botao;button.dataset.n27Text="1";
    button.setAttribute("aria-label","Assinar newsletter: "+config.botao.toLowerCase());
    input.placeholder=config.placeholder;
    // No submit handler or action is replaced. LI delegated events
    // still receive clicks from this original DOM node.
    native.dataset.n27NativeAction=button.getAttribute("data-action")||"";
    root.dataset.n27Newsletter="1";
    document.documentElement.dataset.n27EndcapNewsletter="1";
  }
  function social(config){
    const root=document.getElementById("n27-approved-instagram");
    if(!root)return;
    if(!config.ativo){
      root.removeAttribute("data-n27-instagram-widget");
      document.documentElement.removeAttribute("data-n27-endcap-instagram");
      return;
    }
    const container=root.querySelector(".n27-approved-container");
    if(!container)return;
    let grid=container.querySelector(".n27-approved-instagram__grid");
    if(!grid){grid=node("div","n27-approved-instagram__grid");container.append(grid);}
    const previousURL=grid.dataset.n27WidgetUrl;
    if(grid.dataset.n27EndcapReady!=="1"||previousURL!==config.widgetUrl){
      grid.replaceChildren();
      const promo=node("a","n27-approved-instagram__brand");
      promo.href=config.urlPerfil;
      promo.target="_blank";promo.rel="noopener noreferrer";
      promo.setAttribute("aria-label","Acompanhe a Nichelle no Instagram");
      const bg=node("span","n27-approved-instagram__brand-image");
      bg.setAttribute("aria-hidden","true");
      if(config.capa)bg.style.backgroundImage='url("'+config.capa.replace(/["\\]/g,"")+'")';
      const shade=node("span","n27-approved-instagram__brand-shade");
      shade.setAttribute("aria-hidden","true");
      const contents=node("span","n27-approved-instagram__brand-copy");
      const svg=document.createElementNS("http://www.w3.org/2000/svg","svg");
      svg.setAttribute("viewBox","0 0 24 24");
      svg.setAttribute("aria-hidden","true");svg.setAttribute("fill","none");
      svg.setAttribute("stroke","currentColor");svg.setAttribute("stroke-width","1.85");
      svg.setAttribute("stroke-linecap","round");svg.setAttribute("stroke-linejoin","round");
      for(const data of [["rect",{x:"2",y:"2",width:"20",height:"20",rx:"5"}],
                          ["circle",{cx:"12",cy:"12",r:"4"}],
                          ["circle",{cx:"17.5",cy:"6.5",r:".85",fill:"currentColor",stroke:"none"}]]){
        const x=document.createElementNS("http://www.w3.org/2000/svg",data[0]);
        Object.entries(data[1]).forEach(([k,v])=>x.setAttribute(k,v));svg.append(x);
      }
      contents.append(svg,node("strong","n27-approved-instagram__handle",config.usuario),
        node("small","n27-approved-instagram__caption",config.legenda));
      promo.append(bg,shade,contents);
      const embed=node("div","n27-approved-instagram__embed");
      embed.setAttribute("aria-label","Últimas publicações do Instagram Nichelle Imports");
      const frame=node("iframe","lightwidget-widget n27-approved-instagram__iframe");
      frame.title="Últimas publicações da Nichelle Imports no Instagram";
      frame.src=config.widgetUrl;frame.loading="lazy";frame.scrolling="no";
      frame.setAttribute("allowtransparency","true");frame.referrerPolicy="strict-origin-when-cross-origin";
      frame.style.cssText="width:100%;border:0;overflow:hidden;";
      embed.append(frame);
      grid.append(promo,embed);
      grid.dataset.n27EndcapReady="1";
      grid.dataset.n27WidgetUrl=config.widgetUrl;
    }
    const promo=grid.querySelector(".n27-approved-instagram__brand");
    if(promo){
      promo.href=config.urlPerfil;
      const handle=promo.querySelector(".n27-approved-instagram__handle");
      const label=promo.querySelector(".n27-approved-instagram__caption");
      const photo=promo.querySelector(".n27-approved-instagram__brand-image");
      if(handle)handle.textContent=config.usuario;
      if(label)label.textContent=config.legenda;
      if(photo)photo.style.backgroundImage=config.capa
        ?'url("'+config.capa.replace(/["\\]/g,"")+'")':"none";
    }
    root.dataset.n27InstagramWidget="1";
    document.documentElement.dataset.n27EndcapInstagram="1";
    // The vendor's official embed JS resizes the iframe and handles
    // the four-item slideshow. Include it once, after the iframe exists.
    if(!document.querySelector('script[src="'+SCRIPT+'"]')){
      if(!scriptRequested){
        scriptRequested=true;
        const script=node("script");script.src=SCRIPT;script.async=true;
        script.dataset.n27Lightwidget="1";document.head.append(script);
      }
    }
    document.dispatchEvent(new Event("nichelle27:motion:refresh"));
  }
  function mount(){
    if(!allowed())return;
    const config=settings();
    newsletter(config.newsletter);
    social(config.instagram);
  }
  function schedule(){
    if(mountQueued)return;
    mountQueued=true;setTimeout(()=>{mountQueued=false;mount();},90);
  }
  if(document.readyState==="loading")document.addEventListener("DOMContentLoaded",mount,{once:true});
  else mount();
  window.addEventListener("load",mount,{once:true});
  [260,880,2100,3900].forEach(t=>setTimeout(mount,t));
  ["nichelle27:refresh","nichelle27:endcap:update"].forEach(evt=>
    document.addEventListener(evt,schedule));
  window.NichelleEndcap={version:"1.0.0",refresh:schedule};
})();
