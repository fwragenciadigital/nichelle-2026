/*
 * NICHELLE IMPORTS 2026 — FWR institutional footer v1.0
 * Preview-only. New visual structure, native LI data and interactions intact.
 * No JS business logic is rewritten: login, order URLs, contact modals, stamps,
 * payments and shipping sources remain in the platform's original DOM.
 */
(function () {
  "use strict";
  const id="n27-fwr-footer";
  const preview=window.Nichelle27Activation?.active()===true;
  const host=/^(www\.)?nichelleimports\.com\.br$/i.test(location.hostname);
  const path=location.pathname.replace(/\/+$/,"")||"/";
  const restricted=/^\/(?:checkout|finalizar-pedido)(?:\/|$)/i.test(path);
  if(!host||!preview||restricted)return;

  const defaultPhoto="https://cdn.awsli.com.br/2550/2550587/arquivos/rodape.png";
  // A marca do topo e a fonte oficial primaria para o espaco marcado.
  const storefrontLogo="https://cdn.awsli.com.br/400x300/2550/2550587/logo/logo-nichelle-loja-integrada-600-13zuqalvp1.png";
  const defaultLogo=storefrontLogo;
  const legacyFooterLogo="https://cdn.awsli.com.br/2550/2550587/arquivos/logo-footer.png";
  let lastKey="",retries=0,observer=null,pending=false;

  function text(value,max=1000){
    return typeof value==="string"?value.replace(/\s+/g," ").trim().slice(0,max):"";
  }
  function node(tag,cls,content){
    const n=document.createElement(tag);
    if(cls)n.className=cls;
    if(content!==undefined)n.textContent=content;
    return n;
  }
  function setting(){
    const s=window.Nichelle27Settings?.rodapeFWR||{};
    let inline=null;
    const tag=document.getElementById("n27-rodape-json");
    if(tag)try{inline=JSON.parse(tag.textContent);}catch(e){console.warn("[Nichelle Rodapé] JSON inválido",e);}
    const x=inline&&typeof inline==="object"&&!Array.isArray(inline)?inline:s;
    return {
      ativo:x.ativo!==false,
      logo:secureImage(x.logo||defaultLogo),
      imagem:secureImage(x.imagem||defaultPhoto),
      textoComplementar:text(x.textoComplementar??"Beleza, cuidados pessoais e as últimas tendências em produtos importados.",220),
      tituloInstitucional:text(x.tituloInstitucional??"Institucional",50),
      tituloConta:text(x.tituloConta??"Área do Cliente",50),
      tituloAtendimento:text(x.tituloAtendimento??"Atendimento",50),
      tituloSeguranca:text(x.tituloSeguranca??"Compra Segura",50),
      tituloPagamento:text(x.tituloPagamento??"Formas de Pagamento",50),
      tituloEnvios:text(x.tituloEnvios??"Formas de envio",50),
      mostrarEnvios:x.mostrarEnvios!==false,
      mostrarFWR:x.mostrarFWR!==false
    };
  }
  function enabled(){
  return window.Nichelle27Activation?.active()===true;
 }
  function secureImage(raw){
    try{
      const u=new URL(raw,location.href);
      return u.protocol==="https:"&&!u.username&&!u.password?u.href:"";
    }catch(_){return"";}
  }
  function secureHref(raw) {
    try{
      const u=new URL(raw,location.origin);
      if(u.protocol==="tel:"||u.protocol==="mailto:")return u.href;
      if(u.protocol!=="https:"&&u.protocol!=="http:")return"";
      if(u.protocol==="http:"&&u.hostname!=="www.google.com")return"";
      if(u.username||u.password)return"";
      return u.href;
    }catch(_){return"";}
  }
  function sourceLink(source){
    if(!source)return null;
    const href=source.getAttribute("href")||"";
    if(href==="#modalContato"||href==="#enderecoModal")
      return {href:"#",source};
    const url=secureHref(href);
    return url?{href:url,source}:null;
  }
  function copyLink(item,cls,override){
    if(!item)return null;
    const anchor=node("a",cls||"");
    anchor.textContent=text(override||item.source?.textContent||"",90);
    anchor.href=item.href;
    if(item.href==="#"){
      anchor.setAttribute("role","button");
      anchor.addEventListener("click",e=>{
        e.preventDefault();
        if(item.source?.isConnected)item.source.click();
      });
    }else if(!item.href.startsWith(location.origin)&&!item.href.startsWith("tel:")&&!item.href.startsWith("mailto:")){
      anchor.target="_blank";
      anchor.rel="noopener noreferrer";
    }
    return anchor;
  }
  function pickLink(root,regexp){
    return [...(root?.querySelectorAll("a[href]")||[])].find(a=>
      regexp.test(text(a.textContent+" "+(a.getAttribute("title")||"")+
        " "+(a.getAttribute("aria-label")||""),180)));
  }
  function addLink(list,source,label){
    const l=copyLink(sourceLink(source),"",label);
    if(!l||!l.textContent)return;
    const li=node("li");li.append(l);list.append(li);
  }
  function icon(kind){
    // FWR outline icons (no dependence on Groom iconfont).
    const p={
      phone:["M22 16.9v3a2 2 0 0 1-2.2 2A19.6 19.6 0 0 1 2.1 4.2 2 2 0 0 1 4.1 2h3a2 2 0 0 1 2 1.7l.6 3a2 2 0 0 1-.6 1.8L7.5 12a16 16 0 0 0 4.5 4.5l1.5-1.7a2 2 0 0 1 1.8-.6l3 .6A2 2 0 0 1 20 16.9h2"],
      whatsapp:["M21 11.5a8.7 8.7 0 0 1-12.8 7.7L3 21l1.8-5.2A8.7 8.7 0 1 1 21 11.5Z","M8.8 8.2c-.3 3.8 3.4 7.5 7.2 7.1"],
      mail:["M3 5h18v14H3z","m3 6 9 7 9-7"],
      clock:["M12 22a10 10 0 1 0 0-20 10 10 0 0 0 0 20Z","M12 6v6l4 2"],
      address:["M20 10c0 5-8 12-8 12S4 15 4 10a8 8 0 1 1 16 0Z","M12 12a2.4 2.4 0 1 0 0-4.8 2.4 2.4 0 0 0 0 4.8Z"]
    }[kind]||[];
    const svg=document.createElementNS("http://www.w3.org/2000/svg","svg");
    svg.setAttribute("viewBox","0 0 24 24");
    svg.setAttribute("aria-hidden","true");
    svg.setAttribute("fill","none");svg.setAttribute("stroke","currentColor");
    svg.setAttribute("stroke-width","1.7");svg.setAttribute("stroke-linecap","round");svg.setAttribute("stroke-linejoin","round");
    p.forEach(d=>{
      const path=document.createElementNS("http://www.w3.org/2000/svg","path");
      path.setAttribute("d",d);svg.append(path);
    });
    return svg;
  }
  function labeledColumn(heading,cls){
    const section=node("section","n27-foot__column "+(cls||""));
    section.append(node("h3","n27-foot__title",heading));
    return section;
  }
  function nativeData(root){
    const base=root.querySelector(".institucional");
    const institution=base?.querySelector("#rodape-institucional");
    const about=base?.querySelector("#rodape-sobre");
    const atendimento=base?.querySelector("#rodape-atendimento");
    const payment=root.querySelector("#rodape-pagamento");
    const security=root.querySelector("#rodape-selos");
    const shipping=root.querySelector("#rodape-envios");
    const copy=root.querySelector(".rodape-inferior .rodape-dados p");
    const logo=about?.querySelector(".logo img");
    const aboutText=about?.querySelector(":scope > span p")||about?.querySelector("p");
    const address=about?.querySelector(".rodape-endereco button");
    const cards=[...root.querySelectorAll("#rodape-pagamento .bandeiras-pagamento li")];
    const gateways=[...root.querySelectorAll("#rodape-pagamento .gateways-rodape li")];
    const shields=[...root.querySelectorAll("#rodape-selos img")];
    const sLinks=[...root.querySelectorAll("#rodape-selos a[href]")];
    return {base,institution,about,atendimento,payment,security,shipping,
      copy,logo,aboutText,address,cards,gateways,shields,sLinks};
  }
  function institutional(data,cfg){
    const n=labeledColumn(cfg.tituloInstitucional,"n27-foot__institutional");
    const list=node("ul","n27-foot__links");
    const root=data.institution;
    [
      [/quem somos|sobre n[oó]s/i,"Sobre Nós"],
      [/pagamento e envio|frete|entrega/i,"Frete & Entrega"],
      [/trocas|devolu[cç][oõ]es/i,"Trocas & Devoluções"],
      [/pol[ií]tica de privacidade/i,"Política de Privacidade"],
      [/termos de uso/i,"Termos de Uso"],
      [/blog/i,"Blog"]
    ].forEach(([pattern,label])=>addLink(list,pickLink(root,pattern),label));
    n.append(list);
    const socials=socialLinks();if(socials)n.append(socials);
    return n;
  }
  function account(cfg,data){
    const n=labeledColumn(cfg.tituloConta,"n27-foot__account");
    const list=node("ul","n27-foot__links");
    const header=document.querySelector("#cabecalho");
    [
      [/minha conta/i,"Minha Conta"],
      [/meus pedidos/i,"Meus Pedidos"],
      [/cadastrar|cadastre-se/i,"Cadastre-se"]
    ].forEach(([pattern,label])=>addLink(list,pickLink(header,pattern),label));
    const contact=pickLink(data.institution,/fale conosco/i);
    addLink(list,contact,"Fale Conosco");
    n.append(list);return n;
  }
  function contact(cfg,data){
    const n=labeledColumn(cfg.tituloAtendimento,"n27-foot__contact");
    const info=node("ul","n27-foot__contact-list");
    const add=(type,link,label,description)=>{
      if(!link)return;
      const href=sourceLink(link),a=copyLink(href,"n27-foot__contact-link",label||text(link.textContent,100));
      if(!a)return;
      const li=node("li","n27-foot__contact-item");
      li.append(icon(type));
      const wrapper=node("span","n27-foot__contact-copy");wrapper.append(a);
      if(description)wrapper.append(node("small","",description));
      li.append(wrapper);info.append(li);
    };
    add("whatsapp",data.atendimento?.querySelector('a[href^="https://wa.me/"]'));
    add("mail",data.atendimento?.querySelector('a[href^="mailto:"]'));
    const hour=[...(data.atendimento?.querySelectorAll(".a-block")||[])]
      .find(x=>/hor[aá]rio/i.test(x.textContent));
    if(hour){
      const li=node("li","n27-foot__contact-item n27-foot__contact-hours");
      li.append(icon("clock"));
      const span=node("span","n27-foot__contact-copy");
      span.append(node("span","",text(hour.textContent,125).replace(/^Hor[aá]rio de atendimento\\s*/i,"")));
      li.append(span);info.append(li);
    }
    // Keep available voice/telephone number if not already in WhatsApp.
    if(!info.querySelector('a[href^="https://wa.me/"]'))
      add("phone",data.atendimento?.querySelector('a[href^="tel:"]'));
    if(data.address){
      const li=node("li","n27-foot__contact-item n27-foot__contact-address");
      li.append(icon("address"));
      const wrapper=node("span","n27-foot__contact-copy");
      const button=node("button","n27-foot__address-button","Onde estamos");
      button.type="button";
      button.addEventListener("click",()=>{if(data.address.isConnected)data.address.click();});
      wrapper.append(button);
      const addressText=text(data.address.querySelector(".onde-estamos .b")?.textContent||"",130);
      if(addressText)wrapper.append(node("small","",addressText));
      li.append(wrapper);info.append(li);
    }
    n.append(info);
    return n;
  }

  // Redes sociais ficam na coluna Institucional, com SVG FWR acessivel.
  function socialIcon(kind){
    const paths={
      instagram:["M7 2h10a5 5 0 0 1 5 5v10a5 5 0 0 1-5 5H7a5 5 0 0 1-5-5V7a5 5 0 0 1 5-5Z","M16 12a4 4 0 1 1-8 0 4 4 0 0 1 8 0Z","M17.5 6.5h.01"],
      facebook:["M15 21v-8h3l.5-4H15V7c0-1.1.5-1.5 1.7-1.5H19V2.3A20 20 0 0 0 16 2c-3.2 0-5 1.9-5 5.2V9H8v4h3v8"],
      youtube:["M22 8a3 3 0 0 0-3-3H5a3 3 0 0 0-3 3v8a3 3 0 0 0 3 3h14a3 3 0 0 0 3-3Z","m10 9 6 3-6 3Z"],
      tiktok:["M14 3v12a5 5 0 1 1-5-5","M14 3c.8 2.8 3 4.7 6 5v4c-2.5-.1-4.4-1-6-2.4"],
      social:["M12 2a10 10 0 1 0 0 20 10 10 0 0 0 0-20Z","M2 12h20","M12 2c3 3 4 6 4 10s-1 7-4 10","M12 2c-3 3-4 6-4 10s1 7 4 10"]
    }[kind]||[];
    const svg=document.createElementNS("http://www.w3.org/2000/svg","svg");
    svg.setAttribute("viewBox","0 0 24 24");
    svg.setAttribute("aria-hidden","true");
    svg.setAttribute("focusable","false");
    svg.setAttribute("fill","none");
    svg.setAttribute("stroke","currentColor");
    svg.setAttribute("stroke-width","1.8");
    svg.setAttribute("stroke-linecap","round");
    svg.setAttribute("stroke-linejoin","round");
    for(const d of paths){
      const p=document.createElementNS("http://www.w3.org/2000/svg","path");
      p.setAttribute("d",d);svg.appendChild(p);
    }
    return svg;
  }
  function socialLinks(){
    const originals=[...document.querySelectorAll("#rodape-social .lista-redes a[href]")];
    const social=node("div","n27-foot__social");
    social.append(node("span","n27-foot__social-title","Redes sociais"));
    const seen=new Set();
    for(const original of originals){
      const source=sourceLink(original);if(!source||seen.has(source.href))continue;
      seen.add(source.href);
      const v=(original.href+" "+original.textContent).toLowerCase();
      const kind=/instagram/.test(v)?"instagram":/facebook/.test(v)?"facebook":
        /youtube/.test(v)?"youtube":/tiktok/.test(v)?"tiktok":"social";
      const label=kind==="social"?text(original.getAttribute("title")||original.textContent,50)||"Rede social":
        kind.charAt(0).toUpperCase()+kind.slice(1);
      const link=copyLink(source,"n27-foot__social-link",label);
      if(!link)continue;
      link.textContent="";
      link.setAttribute("aria-label",label);
      link.title=label;
      link.append(socialIcon(kind));
      social.append(link);
    }
    return social.children.length>1?social:null;
  }

  // Accordion apenas mobile. Conteudo de autenticação/checkout permanece nativo.
  const mobileFooter=window.matchMedia("(max-width:767px)");
  function syncFooterAccordionMode(){
    document.querySelectorAll("#n27-fwr-footer .n27-foot__toggle").forEach(toggle=>{
      const section=toggle.closest(".n27-foot__column");
      if(!section)return;
      if(mobileFooter.matches)section.classList.remove("n27-foot__column--open");
      toggle.tabIndex=mobileFooter.matches?0:-1;
      toggle.setAttribute("aria-expanded",String(!mobileFooter.matches));
    });
  }
  if(mobileFooter.addEventListener)mobileFooter.addEventListener("change",syncFooterAccordionMode);
  function prepareFooterAccordions(columns){
    [...columns.querySelectorAll(":scope > .n27-foot__column")].forEach((column,index)=>{
      const heading=column.querySelector(":scope > .n27-foot__title");
      if(!heading)return;
      const contents=node("div","n27-foot__column-body");
      contents.id="n27-foot-accordion-"+index;
      [...column.children].filter(child=>child!==heading).forEach(child=>contents.append(child));
      const toggle=node("button","n27-foot__toggle");
      toggle.type="button";
      toggle.setAttribute("aria-controls",contents.id);
      toggle.setAttribute("aria-expanded",String(!mobileFooter.matches));
      toggle.tabIndex=mobileFooter.matches?0:-1;
      toggle.append(node("span","",heading.textContent||""));
      const arrow=document.createElementNS("http://www.w3.org/2000/svg","svg");
      arrow.setAttribute("viewBox","0 0 24 24");
      arrow.setAttribute("aria-hidden","true");
      const p=document.createElementNS("http://www.w3.org/2000/svg","path");
      p.setAttribute("d","m6 9 6 6 6-6");arrow.append(p);toggle.append(arrow);
      heading.replaceChildren(toggle);
      column.append(contents);
      toggle.addEventListener("click",()=>{
        if(!mobileFooter.matches)return;
        const open=column.classList.toggle("n27-foot__column--open");
        toggle.setAttribute("aria-expanded",String(open));
      });
    });
  }

  function security(cfg,data){
    const n=labeledColumn(cfg.tituloSeguranca,"n27-foot__security");
    const list=node("div","n27-foot__seals");
    const seen=new Set();
    const candidate=[...data.shields].filter(i=>/(site seguro|google|reclame)/i.test(i.alt||i.src));
    for(const img of candidate){
      const src=secureImage(img.currentSrc||img.src);
      if(!src||seen.has(src))continue;
      seen.add(src);
      const wrapper=node("span","n27-foot__seal");
      const clone=node("img");clone.src=src;clone.alt=text(img.alt,70)||"Selo de segurança";
      clone.loading="lazy";clone.decoding="async";wrapper.append(clone);
      list.append(wrapper);
    }
    // Keep the existing, platform-verified RA destination without inventing
    // an approval status if its third-party badge doesn't load.
    const ra=data.sLinks.find(a=>/reclame aqui/i.test((a.title||"")+" "+(a.href||"")));
    if(ra){
      const href=sourceLink(ra);
      if(href){
        const badge=copyLink(href,"n27-foot__ra","Reclame AQUI");
        badge.title=ra.title||"Consultar Reclame AQUI";
        list.append(badge);
      }
    }
    n.append(list);return n;
  }
  function payments(cfg,data){
    const n=labeledColumn(cfg.tituloPagamento,"n27-foot__payments");
    const list=node("ul","n27-foot__payment-list");
    // Copy only logos/icons. Native payment and checkout scripts remain
    // untouched and are NEVER replaced by FWR elements.
    for(const li of data.cards){
      const child=li.querySelector(".icone-pagamento");
      if(!child)continue;
      const copy=node("li","n27-foot__payment");
      const iconNode=child.cloneNode(false);
      iconNode.removeAttribute("id");
      copy.append(iconNode);list.append(copy);
    }
    for(const li of data.gateways){
      const img=li.querySelector("img");
      const src=secureImage(img?.getAttribute("src")||"");
      if(!src)continue;
      const wrapper=node("li","n27-foot__payment n27-foot__payment--pix");
      const image=node("img");image.src=src;image.alt=text(img.alt,80)||"Forma de pagamento";
      image.loading="lazy";wrapper.append(image);list.append(wrapper);
    }
    n.append(list);return n;
  }
  function shipping(cfg,data){
    if(!cfg.mostrarEnvios)return null;
    const native=data.shipping;
    const imgs=[...(native?.querySelectorAll("img")||[])];
    if(!imgs.length)return null;
    const n=labeledColumn(cfg.tituloEnvios,"n27-foot__shipping");
    const wrap=node("div","n27-foot__shipping-logos");
    imgs.forEach(original=>{
      const url=secureImage(original.getAttribute("src"));
      if(!url)return;
      const im=node("img");im.src=url;im.alt=text(original.alt,65)||"Transportadora";
      im.loading="lazy";wrap.append(im);
    });
    if(!wrap.children.length)return null;
    n.append(wrap);return n;
  }
  // Substitui somente o credito do DESENVOLVEDOR Groom pelo da FWR.
  // Preserva completamente a marca e o link "Plataforma: Loja Integrada".
  // A busca e limitada ao rodape nativo; nunca altera links em vitrine/checkout.
  // A assinatura Groom pode estar dentro OU fora de #rodape, e pode ser
  // um link, uma imagem sem link ou apenas um texto curto. Modificar somente
  // a marca do desenvolvedor, preservando o crédito Loja Integrada.
  function syncAgencyCredit(){
    if(!document.getElementById("rodape"))return;
    const src="https://cdn.awsli.com.br/2550/2550587/arquivos/fwr-agencia-digital.svg";
    const agency="https://fwragenciadigital.com.br/";
    const mark=/groom(?:b)?/i;
    const creditContext=
      "footer,#rodape,.rodape-inferior,[class*='rodape'],[class*='footer'],"+
      "[class*='assinatura'],[class*='credito'],[class*='credit']";
    const nodes=[
      ...document.querySelectorAll("a[href],img[src],span,strong,small,b")
    ];
    const targets=new Set();
    for(const element of nodes){
      if(element.closest("#"+id))continue;
      const relevantRegion=element.closest(creditContext);
      const nearby=(element.parentElement?.parentElement?.textContent||"").slice(0,260);
      if(!relevantRegion&&!/desenvolvimento\s*:/i.test(nearby))continue;
      // Evitar qualquer troca na coluna Plataforma / Loja Integrada.
      if(/plataforma/i.test(element.closest("a")?.getAttribute("aria-label")||""))continue;
      let match=false;
      if(element.matches("a[href]")){
        const href=element.getAttribute("href")||"";
        const image=element.querySelector("img");
        match=mark.test(href)||mark.test(image?.getAttribute("src")||"")||
          mark.test(image?.getAttribute("alt")||"")||
          /^groom(?:b)?$/i.test((element.textContent||"").trim());
      }else if(element.matches("img[src]")){
        match=mark.test(element.getAttribute("src")||"")||
          mark.test(element.getAttribute("alt")||"");
      }else{
        match=/^groom(?:b)?$/i.test((element.textContent||"").trim());
      }
      if(!match)continue;
      const anchor=element.matches("a[href]")?element:element.closest("a[href]");
      targets.add(anchor&&anchor!==document.querySelector("#"+id+" .n27-foot__agency")?
        anchor:element);
    }
    for(const target of targets){
      if(!target.isConnected)continue;
      const alreadyAnchor=target.matches("a[href]");
      const link=alreadyAnchor?target:node("a");
      const logo=node("img");
      logo.src=src;
      logo.alt="FWR Agência Digital";
      logo.width=95;logo.height=32;
      logo.loading="lazy";logo.decoding="async";
      link.replaceChildren(logo);
      link.href=agency;
      link.target="_blank";
      link.rel="noopener noreferrer";
      link.classList.add("n27-foot__agency--native-credit");
      link.setAttribute("aria-label","Desenvolvimento: FWR Agência Digital");
      link.title="FWR Agência Digital";
      if(!alreadyAnchor)target.replaceWith(link);
    }
    const visible=[...document.querySelectorAll("a.n27-foot__agency--native-credit")]
      .some(link=>typeof link.getClientRects==="function"?
        link.getClientRects().length>0:true);
    if(visible)document.documentElement.dataset.n27AgencyCredit="native";
    else delete document.documentElement.dataset.n27AgencyCredit;
  }
  function render(data,cfg){
    const root=document.getElementById("rodape");
    const current=document.getElementById(id);
    if(!cfg.ativo || !data.base || !data.about || !data.institution || !data.payment){
      current?.remove();
      root?.removeAttribute("data-n27-fwr-ready");
      delete document.documentElement.dataset.n27FwrFooter;
      root?.querySelector(".rodape-inferior")?.style.removeProperty("display");
      lastKey="";return;
    }
    const originalLogo=secureImage(data.logo?.getAttribute("src")||"");
    const logo=cfg.logo||originalLogo||defaultLogo;
    const desc=text(data.aboutText?.textContent||"",800);
    const legal=text(data.copy?.textContent||data.copy?.parentElement?.textContent||"",260);
    const sig=JSON.stringify([cfg,logo,desc,legal,
      [...data.institution.querySelectorAll("a[href]")].map(a=>[a.textContent,a.href]),
      data.cards.length,data.gateways.length,data.shields.length,
      [...document.querySelectorAll("#rodape-social a[href]")].map(a=>a.href)]);
    if(current?.parentElement===root&&sig===lastKey){
      syncAgencyCredit();
      return;
    }

    const section=node("div","n27-foot");
    section.id=id;section.dataset.n27Version="1.3.0";
    section.setAttribute("role","contentinfo");
    // The original #rodape stays mounted and its source DOM is not deleted.
    const top=node("div","n27-foot__top");
    const topInner=node("div","n27-foot__top-inner");
    const logoLink=node("a","n27-foot__logo");
    logoLink.href=sourceLink(data.about.querySelector(".logo a"))?.href||"/";
    const logoImg=node("img");
    logoImg.alt="Nichelle Imports";
    logoImg.width=280;logoImg.height=66;
    logoImg.decoding="async";
    logoImg.loading="eager";
    // A arte principal do rodape e mantida; caso nao exista mais no CDN,
    // recupera o logotipo original da Loja Integrada ou o usado no topo FWR.
    const logoSources=[logo,originalLogo,
      document.querySelector("#n27-independent-header .n27-owned-logo img")?.src,
      document.querySelector("#cabecalho .logo img")?.src,
      storefrontLogo,legacyFooterLogo].map(secureImage).filter((url,index,items)=>url&&items.indexOf(url)===index);
    let logoSourceIndex=0;
    logoImg.addEventListener("error",()=>{
      logoSourceIndex++;
      if(logoSourceIndex<logoSources.length){
        logoImg.src=logoSources[logoSourceIndex];
      } else {
        logoImg.remove();
        const fallback=node("span","n27-foot__logo-label","NICHELLE IMPORTS");
        logoLink.append(fallback);
      }
    });
    logoImg.src=logoSources[0]||storefrontLogo;
    logoLink.append(logoImg);
    const about=node("div","n27-foot__about");
    about.append(node("p","n27-foot__about-main",desc));
    if(cfg.textoComplementar)about.append(node("p","n27-foot__about-small",cfg.textoComplementar));
    topInner.append(logoLink,about);top.append(topInner);
    const panel=node("div","n27-foot__panel");
    const image=node("div","n27-foot__art");
    image.setAttribute("aria-hidden","true");
    if(cfg.imagem)image.style.backgroundImage='url("'+cfg.imagem.replace(/["\\]/g,"")+'")';
    const content=node("div","n27-foot__content");
    const columns=node("div","n27-foot__columns");
    // Pagamentos e transportadoras pertencem à mesma coluna da
    // segurança, sem alterar a origem nativa dos selos e das imagens.
    const securityColumn=security(cfg,data);
    const paymentWrap=node("div","n27-foot__details");
    paymentWrap.append(payments(cfg,data));
    const ship=shipping(cfg,data);if(ship)paymentWrap.append(ship);
    securityColumn.append(paymentWrap);
    columns.append(institutional(data,cfg),account(cfg,data),
      contact(cfg,data),securityColumn);
    prepareFooterAccordions(columns);
    const bottom=node("div","n27-foot__bottom");
    bottom.append(node("small","n27-foot__legal",legal));
    if(cfg.mostrarFWR){
      const link=node("a","n27-foot__agency");
      link.href="https://fwragenciadigital.com.br/";
      link.target="_blank";link.rel="noopener noreferrer";
      link.setAttribute("aria-label","Desenvolvimento: FWR Agência Digital");
      link.title="FWR Agência Digital";
      const img=node("img");
      img.src="https://cdn.awsli.com.br/2550/2550587/arquivos/fwr-agencia-digital.svg";
      img.alt="FWR Agência Digital";
      img.width=92;img.height=44;img.loading="lazy";img.decoding="async";
      link.append(img);bottom.append(link);
    }
    content.append(columns,bottom);
    panel.append(image,content);
    section.append(top,panel);
    root.insertBefore(section,root.firstChild);
    current?.remove();
    root.dataset.n27FwrReady="1";
    document.documentElement.dataset.n27FwrFooter="1";
    // Hide only the legacy copyright surface. Preserve its DOM and text;
    // Groom can force display:block so a scoped inline override is needed.
    root.querySelector(".rodape-inferior")?.style.setProperty("display","none","important");
    syncAgencyCredit();
    lastKey=sig;
    document.dispatchEvent(new Event("nichelle27:motion:refresh"));
  }
  function mount(){
    if(!enabled())return;
    const root=document.getElementById("rodape");
    if(!root)return;
    const cfg=setting();
    const data=nativeData(root);
    render(data,cfg);
    if(!observer){
      observer=new MutationObserver(schedule);
      // Watch only the original footer sources; FWR panel is isolated.
      ["#rodape-sobre","#rodape-atendimento","#rodape-institucional",
       "#rodape-pagamento","#rodape-selos","#rodape-envios",
       ".rodape-inferior","#rodape-social"].forEach(selector=>{
        const target=root.querySelector(selector);
        if(target)observer.observe(target,{childList:true,subtree:true,characterData:true});
      });
    }
  }
  function schedule(){
    if(pending)return;
    pending=true;setTimeout(()=>{pending=false;mount();},130);
  }
  if(document.readyState==="loading")document.addEventListener("DOMContentLoaded",schedule,{once:true});
  else schedule();
  window.addEventListener("load",schedule,{once:true});
  [200,650,1400,2600,4500].forEach(delay=>setTimeout(schedule,delay));
  ["nichelle27:refresh","nichelle27:rodape:update"].forEach(evt=>document.addEventListener(evt,()=>{
    lastKey="";schedule();
  }));
  window.NichelleFooter={version:"1.3.0",refresh:schedule,source:"loja-integrada-native"};
})();
