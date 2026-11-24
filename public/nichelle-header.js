/*
 * Nichelle FWR | Cabeçalho independente v1.0
 * Own HTML/CSS/events. Loja Integrada remains owner of /buscar, /conta,
 * /carrinho and registered category URLs; no Groom UI is reused.
 */
(function () {
  "use strict";
  const path = location.pathname.replace(/\/+$/, "") || "/";
  if (!window.Nichelle27Activation?.onStore() ||
      /^\/(?:checkout|finalizar-pedido)(?:\/|$)/i.test(path) ||
      !window.Nichelle27Activation?.active()) return;

  function allowed() {
    return window.Nichelle27Activation?.active() === true;
  }
  function el(tag, cls, text) {
    const n = document.createElement(tag);
    if (cls) n.className = cls;
    if (text !== undefined) n.textContent = text;
    return n;
  }
  // Iconografia oficial publicada na CDN da Loja Integrada.
  // Ordem conforme a navegacao aprovada: Mais Vendidos, Skincare,
  // Tipos de Pele, Necessidades da Pele, Cuidados Pessoais, Kits e Marcas.
  const ICON_CDN = "https://cdn.awsli.com.br/2550/2550587/arquivos/";
  const ICON_ASSETS = Object.freeze({
    star: ICON_CDN + "icon_03.png",
    skincare: ICON_CDN + "icon_05.png",
    type: ICON_CDN + "icon_07.png",
    needs: ICON_CDN + "icon_09.png",
    heart: ICON_CDN + "icon_11.png",
    kits: ICON_CDN + "icon_13.png",
    brands: ICON_CDN + "icon_15.png",
    account: ICON_CDN + "userrr.svg",
    support: ICON_CDN + "chattt.svg",
    cart: ICON_CDN + "carttt.svg"
  });
  // Mantem as mesmas chamadas SVG existentes sem alterar links, eventos
  // dos dropdowns, acessibilidade, drawer mobile ou contador de carrinho.
  // Fallback para o SVG antigo se algum arquivo CDN nao carregar.
  function svg(name, cls) {
    const url = ICON_ASSETS[name];
    if (url) {
      const image = document.createElement("img");
      image.className = (cls ? cls + " " : "") +
        "n27-owned-icon n27-owned-icon--" + name;
      image.src = url;
      image.alt = "";
      image.setAttribute("aria-hidden", "true");
      image.width = 24;
      image.height = 24;
      image.loading = "eager";
      image.decoding = "async";
      image.addEventListener("error", function () {
        image.replaceWith(inlineSvg(name, cls));
      }, { once: true });
      return image;
    }
    return inlineSvg(name, cls);
  }
  function inlineSvg(name, cls) {
    const paths = {
      safe:'<path d="M7 10V7a5 5 0 0 1 10 0v3"/><rect x="5" y="10" width="14" height="11" rx="2"/><path d="M12 14v3"/>',
      truck:'<path d="M3 6h11v11H3zM14 10h4l3 4v3h-7M5 17a2 2 0 1 0 4 0M16 17a2 2 0 1 0 4 0"/>',
      card:'<rect x="2" y="5" width="20" height="14" rx="2"/><path d="M2 10h20M6 15h5"/>',
      exchange:'<path d="M4 7h15l-4-4M19 7l-4 4M20 17H5l4 4M5 17l4-4"/>',
      star:'<path d="m12 2 3.1 6.3 7 .9-5 4.9 1.2 7L12 17.8l-6.3 3.3 1.2-7-5-4.9 7-.9Z" fill="currentColor" stroke="none"/>',
      skincare:'<path d="M12 2c5.2 0 8.5 4 8.5 9.5 0 5.6-4 10.5-8.5 10.5S3.5 17.1 3.5 11.5C3.5 6 6.8 2 12 2Z" fill="currentColor" stroke="none"/><circle cx="9" cy="11" r="1.2" fill="#8000a5"/><circle cx="15" cy="11" r="1.2" fill="#8000a5"/><path d="M9 16c1.6 1.4 4.4 1.4 6 0" stroke="#8000a5"/>',
      type:'<path d="M3 14 14 3a2.3 2.3 0 0 1 3.3 0l3.7 3.7a2.3 2.3 0 0 1 0 3.3L10 21a3 3 0 0 1-4.2 0L3 18.2A3 3 0 0 1 3 14Z"/><path d="m12 5 7 7M6 17l4 4"/>',
      needs:'<path d="m5 19 13-13 2 2L7 21H5Z"/><path d="M18 2v3M22 6h-3M17 11l-2-2M4 6V3M2 5h4"/>',
      heart:'<path d="M20.8 5.4a5.3 5.3 0 0 0-7.5 0L12 6.7l-1.3-1.3a5.3 5.3 0 0 0-7.5 7.5L12 21l8.8-8.1a5.3 5.3 0 0 0 0-7.5Z" fill="currentColor" stroke="none"/>',
      kits:'<rect x="3" y="9" width="7" height="12" rx="1"/><path d="M5 9V6h3v3M6.5 3v3"/><rect x="13" y="6" width="8" height="15" rx="1"/><path d="M15 6V3h4v3M15 13h4M5 15h3"/>',
      brands:'<rect x="3" y="3" width="8" height="8" rx="1" fill="currentColor" stroke="none"/><rect x="13" y="3" width="8" height="8" rx="1" fill="currentColor" stroke="none"/><rect x="3" y="13" width="8" height="8" rx="1" fill="currentColor" stroke="none"/><rect x="13" y="13" width="8" height="8" rx="1" fill="currentColor" stroke="none"/>',
      search:'<circle cx="10.8" cy="10.8" r="7"/><path d="m16 16 5 5"/>',
      account:'<circle cx="12" cy="8" r="4"/><path d="M4 21c0-4 3.5-7 8-7s8 3 8 7"/>',
      support:'<path d="M4 4h13a3 3 0 0 1 3 3v8a3 3 0 0 1-3 3H9l-5 3v-3a3 3 0 0 1-2-3V7a3 3 0 0 1 2-3z"/><path d="M7 9h10M7 13h7"/>',
      cart:'<path d="M3 7h18l-1.6 14H4.6L3 7Z"/><path d="M8 8V6a4 4 0 0 1 8 0v2"/>',
      menu:'<path d="M4 6h16M4 12h16M4 18h16"/>',
      close:'<path d="M5 5l14 14M19 5 5 19"/>',
      chevron:'<path d="m6 9 6 6 6-6"/>',
      phone:'<path d="M8 3H5a2 2 0 0 0-2 2c0 9 7 16 16 16a2 2 0 0 0 2-2v-3l-5-2-2 3a13 13 0 0 1-7-7l3-2-2-5Z"/>',
      mail:'<rect x="2" y="5" width="20" height="14" rx="3"/><path d="m3 7 9 7 9-7"/>',
      contact:'<rect x="4" y="3" width="16" height="18" rx="2"/><path d="M8 8h8M8 12h8M8 16h5"/>',
      login:'<path d="M10 4H5v16h5M13 7l5 5-5 5M7 12h11"/>',
      orders:'<path d="M7 3h10v18H7V3Zm3 5h4m-4 4h4m-4 4h3"/>',
      favorites:'<path d="M20.8 5.4a5.3 5.3 0 0 0-7.5 0L12 6.7l-1.3-1.3a5.3 5.3 0 0 0-7.5 7.5L12 21l8.8-8.1a5.3 5.3 0 0 0 0-7.5Z"/>',
      grid:'<rect x="3" y="3" width="7" height="7" rx="2"/><rect x="14" y="3" width="7" height="7" rx="2"/><rect x="3" y="14" width="7" height="7" rx="2"/><rect x="14" y="14" width="7" height="7" rx="2"/>',
      home:'<path d="m3 11 9-8 9 8v10h-7v-7h-4v7H3V11Z"/>',
      sparkle:'<path d="m12 2 2.2 7.8L22 12l-7.8 2.2L12 22l-2.2-7.8L2 12l7.8-2.2L12 2Z"/>',
      whatsapp:'<path d="M20 11.5a8.5 8.5 0 0 1-12.3 7.6L3 21l1.9-4.7A8.5 8.5 0 1 1 20 11.5Z"/><path d="M9 8c.4 2.6 2.4 4.7 5 5.3l1.1-1.2 2 1.1c-.2 1.8-1.1 2.5-2.5 2.3-4-.6-7.1-3.8-7.7-7.6-.2-1.2.6-2.3 1.6-2.3h.5l1.1 2-1.1 1.4"/>'

    };
    const s = document.createElementNS("http://www.w3.org/2000/svg", "svg");
    s.setAttribute("viewBox", "0 0 24 24");
    s.setAttribute("aria-hidden", "true");
    s.setAttribute("fill", "none");
    s.setAttribute("stroke", "currentColor");
    s.setAttribute("stroke-width", "1.8");
    s.setAttribute("stroke-linecap", "round");
    s.setAttribute("stroke-linejoin", "round");
    if (cls) s.setAttribute("class", cls);
    s.innerHTML = paths[name] || paths.star;
    return s;
  }
  function safeInternal(raw) {
    if (!raw || typeof raw !== "string") return "";
    try {
      const u = new URL(raw, location.origin);
      return u.origin === location.origin && /^https?:$/.test(u.protocol) ?
        u.pathname + u.search + u.hash : "";
    } catch (_) { return ""; }
  }
  function searchURL(text) { return "/buscar?" + new URLSearchParams({q:text}); }
  const normalize = s => String(s || "").toLowerCase().normalize("NFD").replace(/[\u0300-\u036f]/g,"").trim();
  // Os rótulos, links e subcategorias vêm do MENU NATIVO que a Loja Integrada
  // publicou nesta página, seguindo exatamente a ordem configurada pelo cliente.
  // A snapshot JSON só é um fallback quando o menu não veio no HTML nativo.
  function iconForCategory(name) {
    const n=normalize(name);
    if(/mais vendidos|ofertas|promocoes/.test(n))return "star";
    if(/skincare|pele|facial/.test(n))return "skincare";
    if(/makes|maquiagem|makeup/.test(n))return "type";
    if(/cabelo|hair/.test(n))return "needs";
    if(/corpo|banho|cuidados/.test(n))return "heart";
    if(/kit|presente/.test(n))return "kits";
    return "brands";
  }
  function nativeCategories() {
    const menu=document.querySelector(
      "#cabecalho .menu.superior > ul.nivel-um, " +
      "#cabecalho .menu.superior ul.nivel-um, " +
      "#cabecalho .menu-desktop ul.nivel-um"
    );
    if(!menu)return [];
    const top=[...menu.children].filter(n=>n.matches("li"));
    const seen=new Set();
    return top.map((li,index)=>{
      if(li.hidden||li.getAttribute("aria-hidden")==="true"||
         li.classList.contains("hide")||li.classList.contains("hidden")||
         window.getComputedStyle(li).display==="none")return null;
      const a=li.querySelector(":scope > a[href]");
      const url=safeInternal(a?.getAttribute("href"));
      // Entradas técnicas como categoria-marcas podem usar javascript:;.
      if(!url)return null;
      const label=(a.querySelector("strong.titulo")?.textContent||
        a.getAttribute("title")||a.textContent||"").replace(/\s+/g," ").trim().slice(0,85);
      // Categoria técnica de ocultação (do próprio painel da Nichelle):
      // jamais promovê-la ao menu público por acidente.
      if(!label||seen.has(url)||normalize(label)==="ocultar")return null;
      seen.add(url);
      const sublist=li.querySelector(":scope > ul.nivel-dois, :scope > ul.nivel-dois > li");
      const children=sublist?[...sublist.querySelectorAll(":scope > li")].map(sub=>{
        const link=sub.querySelector(":scope > a[href]");
        const href=safeInternal(link?.getAttribute("href"));
        const name=(link?.getAttribute("title")||link?.textContent||"").replace(/\s+/g," ").trim().slice(0,85);
        return href&&name?{name,url:href}:null;
      }).filter(Boolean):[];
      const categoryId=(li.className.match(/categoria-id-(\d+)/)||[])[1];
      return {key:categoryId||"li-"+index,label,icon:iconForCategory(label),
        url,children};
    }).filter(Boolean);
  }
  function catalogFallback() {
    const published=Array.isArray(window.N27CategoryCatalog?.categories)?
      window.N27CategoryCatalog.categories:[];
    return published.map((c,index)=>{
      const url=safeInternal(c.url);
      if(!url||normalize(c.name)==="ocultar")return null;
      return {
        key:String(c.id||index),label:String(c.name||"").slice(0,85),
        icon:iconForCategory(c.name),url,
        children:(Array.isArray(c.children)?c.children:[]).map(sub=>({
          name:String(sub.name||"").slice(0,85),url:safeInternal(sub.url)
        })).filter(sub=>sub.name&&sub.url)
      };
    }).filter(Boolean);
  }
  function menuData() {
    const native=nativeCategories();
    return native.length?native:catalogFallback();
  }
  // Icones de categorias alteraveis diretamente no HTML da Loja Integrada.
  // Chaves aceitas: nome cadastrado na LI, ID da categoria, ou URL da categoria.
  // URL de imagem HTTPS ou caminho relativo da loja; arquivo inválido usa ícone FWR.
  function menuIconURL(item) {
    const settings=window.Nichelle27Settings?.iconesMenu;
    if(!settings || typeof settings!=="object" || Array.isArray(settings))return "";
    // ID da LI tem prioridade: continua válido quando o título é alterado.
    const itemKeys=[item.key,
      /^\d+$/.test(String(item.key||""))?"categoria-id-"+item.key:"",
      item.url,item.label].filter(Boolean).map(normalize);
    const configured=Object.entries(settings);
    let match=null;
    for(const key of itemKeys){
      match=configured.find(([configuredKey])=>normalize(configuredKey)===key);
      if(match)break;
    }
    if(!match)return "";
    const raw=typeof match[1]==="string"?match[1]:
      (match[1] && typeof match[1].url==="string"?match[1].url:"");
    if(!raw.trim())return "";
    try {
      const imageURL=new URL(raw.trim(),location.origin);
      if(imageURL.protocol!=="https:")return "";
      return imageURL.href;
    }catch(_){return "";}
  }
  function categoryIcon(item,cls) {
    const url=menuIconURL(item);
    if(!url)return svg(item.icon,cls);
    const img=el("img",((cls||"")+" n27-owned-icon n27-owned-icon--custom").trim());
    img.src=url;
    img.alt="";
    img.setAttribute("aria-hidden","true");
    img.width=33;
    img.height=33;
    img.loading="eager";
    img.decoding="async";
    img.addEventListener("error",function(){
      if(img.isConnected)img.replaceWith(svg(item.icon,cls));
    },{once:true});
    return img;
  }
  // Esta faixa é diferente de s.vantagens (blocos da home).
  // Editável em Bloco 01 do HTML: window.Nichelle27Settings.topoBeneficios.
  function headerBenefitsData(){
    const cfg=window.Nichelle27Settings?.topoBeneficios||{};
    const defaults=[
      {icone:"safe",titulo:"LOJA 100% SEGURA",descricao:"COM PROTEÇÃO DE CERTIFICADO SSL"},
      {icone:"truck",titulo:"ENTREGA GARANTIDA",descricao:"PARA TODO O BRASIL"},
      {icone:"card",titulo:"PARCELE SUAS COMPRAS",descricao:"EM ATÉ 10X NO CARTÃO"},
      {icone:"exchange",titulo:"TROCA FÁCIL",descricao:"EM ATÉ 7 DIAS APÓS O RECEBIMENTO"}
    ];
    if(cfg.ativo===false)return [];
    const allowed=new Set(["safe","truck","card","exchange"]);
    const list=Array.isArray(cfg.itens)?cfg.itens:defaults;
    const text=(value,max)=>typeof value==="string"?value.trim().slice(0,max):"";
    return list.slice(0,8).map((entry,index)=>{
      const original=defaults[index%defaults.length];
      return {
        icon:allowed.has(entry?.icone)?entry.icone:original.icone,
        title:text(entry?.titulo,90),
        subtitle:text(entry?.descricao,120)
      };
    }).filter(entry=>entry.title||entry.subtitle);
  }
  function buildMarquee() {
    const data=headerBenefitsData();
    if(!data.length)return null;
    const bar=el("div","n27-owned-benefits");
    bar.id="n27-head-benefits";
    bar.setAttribute("aria-label","Benefícios da loja");
    const track=el("div","n27-owned-benefits__track n27-head-benefits__track");
    for(let g=0;g<2;g++){
      const group=el("div","n27-owned-benefits__group");
      if(g)group.setAttribute("aria-hidden","true");
      // Duas voltas por grupo evitam vazios e mantêm o loop existente.
      for(let repeat=0;repeat<4;repeat++){
        for(const info of data){
          const item=el("span","n27-owned-benefits__item");
          item.appendChild(svg(info.icon));
          const copy=el("span","n27-owned-benefits__copy");
          copy.append(el("strong","",info.title),el("span",""," "+info.subtitle));
          item.appendChild(copy);group.appendChild(item);
        }
      }
      track.appendChild(group);
    }
    bar.appendChild(track);
    return bar;
  }
  function button(text,classes,onClick,iconName){
    const btn=el("button",classes,text);
    btn.type="button";
    if(iconName){btn.textContent="";btn.appendChild(svg(iconName));}
    if(onClick)btn.addEventListener("click",onClick);
    return btn;
  }
  function buildDetails(cls,iconName,title,subtitle,menuItems){
    const root=el("details","n27-owned-actions__detail "+cls);
    const summary=el("summary","n27-owned-actions__summary");
    const labels=el("span","n27-owned-actions__labels");
    labels.append(el("strong","",title),el("small","",subtitle));
    summary.append(svg(iconName),labels,inlineSvg("chevron","n27-owned-actions__chevron"));
    root.appendChild(summary);
    const panel=el("div","n27-owned-actions__dropdown");
    menuItems.forEach(item=>{
      if(!item.url)return;
      const a=el("a","n27-owned-actions__dropdown-link");
      a.append(inlineSvg(item.icon||"contact","n27-owned-actions__link-icon"),
        el("span","",item.label));
      a.href=item.url;
      if(item.external){a.target="_blank";a.rel="noopener noreferrer";}
      panel.appendChild(a);
    });
    root.appendChild(panel);
    root.addEventListener("mouseenter",()=>{if(window.matchMedia("(min-width: 768px)").matches)root.open=true;});
    root.addEventListener("mouseleave",()=>{if(window.matchMedia("(min-width: 768px)").matches)root.open=false;});
    return root;
  }
  function buildMain() {
    const box=el("div","n27-owned-main");
    const wrap=el("div","n27-owned-container n27-owned-main__inner");
    const mobileBtn=button("","n27-owned-mobile-toggle",null,"menu");
    mobileBtn.setAttribute("aria-label","Abrir menu");
    mobileBtn.setAttribute("aria-expanded","false");
    mobileBtn.setAttribute("aria-controls","n27-owned-drawer");
    const logo=el("a","n27-owned-logo");
    logo.href="/";logo.title="Nichelle Imports — início";
    const image=el("img");
    image.src="https://cdn.awsli.com.br/400x300/2550/2550587/logo/logo-nichelle-loja-integrada-600-13zuqalvp1.png";
    image.alt="Nichelle Imports";image.width=200;image.height=60;
    logo.appendChild(image);
    const form=el("form","n27-owned-search");
    form.action="/buscar";form.method="get";form.role="search";
    const label=el("label","n27-owned-sr-only","Buscar produtos");
    const input=el("input","n27-owned-search__field");
    input.type="search";input.name="q";input.placeholder="Buscar na loja";
    input.maxLength=255;input.autocomplete="off";input.id="n27-owned-search-input";
    label.htmlFor=input.id;form.append(label,input);
    const searchBtn=button("","n27-owned-search__button",null,"search");
    searchBtn.type="submit";searchBtn.setAttribute("aria-label","Buscar");
    form.appendChild(searchBtn);
    const actions=el("div","n27-owned-actions");
    const support=buildDetails("n27-owned-actions__support","support","Atendimento","Fale com nossa equipe",[
      {label:"Conversar pelo WhatsApp",icon:"whatsapp",url:"https://wa.me/5551994641695",external:true},
      {label:"Ligar: (51) 99464-1695",icon:"phone",url:"tel:51994641695"},
      {label:"Enviar e-mail",icon:"mail",url:"mailto:contato@nichelleimports.com.br"},
      {label:"Formulário de contato",icon:"contact",url:"/contato"}
    ]);
    const account=buildDetails("n27-owned-actions__account","account","Meu Painel","Entrar ou Cadastrar-se",[
      {label:"Entrar ou cadastrar",icon:"login",url:"/conta/login"},
      {label:"Minha Conta",icon:"account",url:"/conta/index"},
      {label:"Meus Pedidos",icon:"orders",url:"/conta/pedido/listar"},
      {label:"Lista de Desejos",icon:"favorites",url:"/conta/favorito/listar"}
    ]);
    const cart=el("a","n27-owned-cart");
    cart.href="/carrinho/index";cart.title="Ver resumo do carrinho";
    cart.setAttribute("aria-label","Abrir resumo do carrinho");
    cart.setAttribute("aria-haspopup","dialog");
    cart.setAttribute("aria-controls","n27-cart-drawer");
    cart.appendChild(svg("cart"));
    const count=el("span","n27-owned-cart__badge","0");
    count.id="n27-owned-cart-count";cart.appendChild(count);
    actions.append(support,account,cart);
    wrap.append(mobileBtn,logo,form,actions);
    box.appendChild(wrap);
    return{box,mobileBtn,cartCount:count};
  }
  function buildNav(items,openMobile) {
    const nav=el("nav","n27-owned-nav");
    nav.id="n27-head-nav";
    nav.setAttribute("aria-label","Categorias principais");
    const track=el("ul","n27-owned-nav__track n27-owned-container");
    items.forEach(item=>{
      const li=el("li","n27-owned-nav__item");
      li.dataset.key=item.key;
      const main=el("a","n27-owned-nav__main");
      main.href=item.url;
      main.append(categoryIcon(item),el("span","",item.label));
      li.appendChild(main);
      if(item.children.length){
        li.classList.add("n27-owned-nav__item--children");
        const t=button("","n27-owned-nav__toggle",null,"chevron");
        t.setAttribute("aria-label","Abrir subcategorias de "+item.label);
        t.setAttribute("aria-expanded","false");
        t.addEventListener("click",function(event){
          event.stopPropagation();
          if(window.matchMedia("(max-width: 767px)").matches){
            openMobile(item.key);return;
          }
          const was=li.dataset.open==="true";
          track.querySelectorAll('.n27-owned-nav__item[data-open="true"]').forEach(n=>{
            n.dataset.open="false";
            const x=n.querySelector('.n27-owned-nav__toggle');if(x)x.setAttribute("aria-expanded","false");
          });
          li.dataset.open=String(!was);
          t.setAttribute("aria-expanded",String(!was));
        });
        li.appendChild(t);
        const menu=el("div","n27-owned-submenu");
        menu.setAttribute("role","group");
        menu.setAttribute("aria-label","Subcategorias de "+item.label);
        const intro=el("a","n27-owned-submenu__viewall","Ver todos em "+item.label);
        intro.href=item.url;menu.appendChild(intro);
        const links=el("div","n27-owned-submenu__grid");
        if(item.children.length>20)links.classList.add("n27-owned-submenu__grid--large");
        item.children.forEach(sub=>{
          const a=el("a","n27-owned-submenu__link",sub.name);
          a.href=sub.url;links.appendChild(a);
        });
        menu.appendChild(links);
        li.appendChild(menu);
      }
      track.appendChild(li);
    });
    nav.appendChild(track);
    // Cinco atalhos fixos mobile; todas as categorias continuam no drawer.
    // A grade desktop original não é alterada.
    const quick=el("ul","n27-owned-nav__quick");
    const shortcut=(label,icon,url,action,featured=false)=>{
      const li=el("li","n27-owned-nav__quick-item"+(featured?" n27-owned-nav__quick-item--featured":""));
      const control=action?button("","n27-owned-nav__quick-link",action):
        el("a","n27-owned-nav__quick-link");
      if(!action)control.href=url;
      control.setAttribute("aria-label",label);
      control.append(categoryIcon({label,icon},"n27-owned-nav__quick-icon"),
        el("span","",label));
      li.appendChild(control);quick.appendChild(li);
    };
    shortcut("Início","home",window.Nichelle27Activation.href("/"));
    shortcut("Buscar","search","",()=>{
      const input=document.getElementById("n27-owned-search-input");
      document.getElementById("n27-independent-header")?.scrollIntoView({behavior:
        window.matchMedia("(prefers-reduced-motion: reduce)").matches?"instant":"smooth",block:"start"});
      input?.focus({preventScroll:true});
    });
    shortcut("Categorias","grid","",()=>openMobile(),true);
    shortcut("Ofertas","sparkle",items[0]?.url||"/mais-vendidos");
    shortcut("Conta","account","/conta/index");
    nav.appendChild(quick);
    document.addEventListener("click",ev=>{
      if(nav.contains(ev.target))return;
      track.querySelectorAll('.n27-owned-nav__item[data-open="true"]').forEach(n=>{
        n.dataset.open="false";
        n.querySelector(".n27-owned-nav__toggle")?.setAttribute("aria-expanded","false");
      });
    });
    document.addEventListener("keydown",ev=>{
      if(ev.key==="Escape")track.querySelectorAll('.n27-owned-nav__item[data-open="true"]').forEach(n=>{
        n.dataset.open="false";n.querySelector(".n27-owned-nav__toggle")?.setAttribute("aria-expanded","false");
      });
    });
    return nav;
  }
  // Menu lateral: accordion de uma categoria por vez, com transicao
  // fluida. Links e semantica HTML <details>/<summary> permanecem nativos.
  function animateMobileCategory(details,expanded){
    const summary=details.querySelector("summary");
    const content=details.querySelector(".n27-owned-drawer__links");
    const prev=details._n27Animation;
    if(prev){prev.onfinish=null;prev.cancel();}
    details.dataset.n27Expanded=expanded?"1":"0";
    summary?.setAttribute("aria-expanded",String(expanded));
    if(!content){details.open=expanded;return;}
    const wasOpen=details.open;
    const start=wasOpen?content.getBoundingClientRect().height:0;
    if(expanded)details.open=true;
    const finish=()=>{
      details.open=expanded;
      content.style.removeProperty("overflow");
      content.style.removeProperty("height");
      content.style.removeProperty("opacity");
      details._n27Animation=null;
    };
    if(window.matchMedia("(prefers-reduced-motion: reduce)").matches||
       typeof content.animate!=="function"){
      finish();return;
    }
    const end=expanded?content.scrollHeight:0;
    content.style.overflow="hidden";
    const anim=content.animate([
      {height:start+"px",opacity:expanded?0:1},
      {height:end+"px",opacity:expanded?1:0}
    ],{duration:expanded?260:190,easing:"cubic-bezier(.22,1,.36,1)"});
    details._n27Animation=anim;
    anim.onfinish=finish;
  }
  function buildDrawer(items) {
    const overlay=el("div","n27-owned-drawer");
    overlay.id="n27-owned-drawer";overlay.hidden=true;
    const scrim=button("","n27-owned-drawer__scrim");
    scrim.setAttribute("aria-label","Fechar menu");
    const aside=el("div","n27-owned-drawer__panel");
    aside.setAttribute("role","dialog");aside.setAttribute("aria-modal","true");
    aside.setAttribute("aria-label","Menu Nichelle Imports");
    const head=el("div","n27-owned-drawer__top");
    head.append(el("strong","","Categorias"));
    const close=button("","n27-owned-drawer__close",null,"close");
    close.setAttribute("aria-label","Fechar menu");
    head.appendChild(close);aside.appendChild(head);
    const list=el("div","n27-owned-drawer__list");
    for(const item of items){
      const details=el("details","n27-owned-drawer__item");
      details.dataset.key=item.key;
      const summary=el("summary","n27-owned-drawer__summary");
      summary.append(categoryIcon(item),el("span","",item.label));
      if(item.children.length){summary.appendChild(svg("chevron","n27-owned-drawer__chevron"));}
      details.appendChild(summary);
      const inside=el("div","n27-owned-drawer__links");
      const all=el("a","n27-owned-drawer__all","Ver todos em "+item.label);
      all.href=item.url;inside.appendChild(all);
      item.children.forEach(sub=>{
        const a=el("a","",sub.name);a.href=sub.url;inside.appendChild(a);
      });
      details.appendChild(inside);
      summary.setAttribute("aria-expanded","false");
      if(item.children.length){
        summary.addEventListener("click",event=>{
          event.preventDefault();
          const expand=details.dataset.n27Expanded!=="1";
          if(expand){
            list.querySelectorAll("details[data-n27-expanded='1']").forEach(other=>{
              if(other!==details)animateMobileCategory(other,false);
            });
          }
          animateMobileCategory(details,expand);
        });
      } else summary.addEventListener("click",ev=>{
        ev.preventDefault();window.location.href=item.url;
      });
      list.appendChild(details);
    }
    aside.appendChild(list);
    const foot=el("div","n27-owned-drawer__foot");
    const links=[
      ["Minha Conta","/conta/login"],
      ["Meus Pedidos","/conta/pedido/listar"],
      ["Atendimento","https://wa.me/5551994641695"]
    ];
    links.forEach(it=>{
      const a=el("a","",it[0]);a.href=it[1];
      if(/^https:/.test(it[1])){a.target="_blank";a.rel="noopener noreferrer";}
      foot.appendChild(a);
    });
    aside.appendChild(foot);
    overlay.append(scrim,aside);
    return {overlay,close,scrim,list};
  }
  function readCartCount() {
    // Dados LI; nunca utiliza estilos ou eventos do Groom.
    if(typeof window.qtd_prods_carrinho==="number")return Math.max(0,window.qtd_prods_carrinho);
    if(Array.isArray(window.CARRINHO_PRODS))return window.CARRINHO_PRODS.length;
    return 0;
  }
  function mount() {
    if(!allowed()||document.getElementById("n27-independent-header"))return;
    const host=document.querySelector(".conteiner-principal")||document.body;
    if(!host)return;
    const main=buildMain();
    const items=menuData();
    const drawer=buildDrawer(items);
    let drawerCloseTimer=0,drawerTransitionToken=0;
    function setDrawer(open,key) {
      const token=++drawerTransitionToken;
      clearTimeout(drawerCloseTimer);
      main.mobileBtn.setAttribute("aria-expanded",String(open));
      document.documentElement.classList.toggle("n27-owned-menu-open",open);
      drawer.overlay.setAttribute("aria-hidden",String(!open));
      if(open){
        drawer.overlay.hidden=false;
        window.requestAnimationFrame(()=>{
          if(token===drawerTransitionToken&&!drawer.overlay.hidden){
            drawer.overlay.classList.add("n27-owned-drawer--visible");
            drawer.close.focus({preventScroll:true});
          }
        });
        if(key!==undefined){
          const selected=[...drawer.list.querySelectorAll("details")].find(n=>n.dataset.key===key);
          if(selected){
            drawer.list.querySelectorAll("details[data-n27-expanded='1']")
              .forEach(other=>{
                if(other!==selected)animateMobileCategory(other,false);
              });
            animateMobileCategory(selected,true);
            window.requestAnimationFrame(()=>selected.scrollIntoView({block:"nearest"}));
          }
        }
      }else{
        drawer.overlay.classList.remove("n27-owned-drawer--visible");
        const reduced=window.matchMedia("(prefers-reduced-motion: reduce)").matches;
        drawerCloseTimer=window.setTimeout(()=>{
          if(token===drawerTransitionToken&&
             !drawer.overlay.classList.contains("n27-owned-drawer--visible"))
            drawer.overlay.hidden=true;
        },reduced?0:290);
        main.mobileBtn.focus({preventScroll:true});
      }
    }
    main.mobileBtn.addEventListener("click",()=>setDrawer(true));
    drawer.close.addEventListener("click",()=>setDrawer(false));
    drawer.scrim.addEventListener("click",()=>setDrawer(false));
    document.addEventListener("keydown",e=>{
      if(drawer.overlay.hidden)return;
      if(e.key==="Escape"){e.preventDefault();setDrawer(false);return;}
      if(e.key!=="Tab"||!drawer.overlay.classList.contains("n27-owned-drawer--visible"))return;
      const focusable=[...drawer.overlay.querySelectorAll(
        'button:not([disabled]),a[href],summary,[tabindex]:not([tabindex="-1"])'
      )].filter(n=>n.getClientRects().length>0);
      if(!focusable.length)return;
      const first=focusable[0],last=focusable[focusable.length-1];
      if(e.shiftKey&&document.activeElement===first){e.preventDefault();last.focus();}
      else if(!e.shiftKey&&document.activeElement===last){e.preventDefault();first.focus();}
    });
    const root=el("div","n27-owned-header");
    root.setAttribute("role","banner");
    root.id="n27-independent-header";
    // A spacer reserves exactly the mobile main-bar height whenever that
    // bar becomes fixed. Without it, scrolling would shift page content.
    const mobileStickySpacer=el("div","n27-owned-sticky-placeholder");
    mobileStickySpacer.setAttribute("aria-hidden","true");
    const benefits=buildMarquee();
    if(benefits)root.appendChild(benefits);
    root.append(mobileStickySpacer,main.box,buildNav(items,key=>setDrawer(true,key)));
    // Overlay is portaled outside the navigation scroll container.
    root.appendChild(drawer.overlay);
    host.insertBefore(root,host.firstChild);
    // Barra inferior do tema Groom nao pode coexistir com #n27-head-nav.
    // Remocao restrita a mobile e a prévia, sem alterar a loja publicada.
    function removeNativeMobileBar(){
      if(!window.matchMedia("(max-width: 767px)").matches)return;
      document.querySelectorAll("nav.barra-mobile").forEach(native=>{
        native.remove();
      });
    }
    removeNativeMobileBar();
    if(window.MutationObserver){
      const barObserver=new MutationObserver(records=>{
        if(!window.matchMedia("(max-width: 767px)").matches)return;
        if(records.some(record=>[...record.addedNodes].some(n=>
          n.nodeType===1&&(n.matches?.("nav.barra-mobile")||
            n.querySelector?.("nav.barra-mobile")))))removeNativeMobileBar();
      });
      barObserver.observe(document.body,{childList:true,subtree:true});
    }
    window.addEventListener("resize",removeNativeMobileBar,{passive:true});
    function updateCart(override) {
      const qty=typeof override==="number"&&Number.isFinite(override)?override:readCartCount();
      const n=Math.max(0,Math.floor(qty));
      main.cartCount.textContent=String(n);
      main.cartCount.setAttribute("aria-label",n+" itens no carrinho");
    }
    updateCart();
    window.NichelleHeader={version:"1.6.0",categories:items,refreshCart:updateCart,icons:ICON_ASSETS,source:nativeCategories().length?"loja-integrada":"catalogo-fallback",refreshBenefits:function(){const old=root.querySelector("#n27-head-benefits");const newer=buildMarquee();if(old)old.remove();if(newer)root.prepend(newer);}};
    window.addEventListener("nichelle:cart-updated",e=>updateCart(e.detail?.quantity));
    window.addEventListener("cart:updated",e=>updateCart(e.detail?.quantity));
    // Optional bridge for LI themes that expose a rendered cart quantity.
    // Nothing visual or interactive depends on this node's existence.
    const nativeBadge=document.querySelector('#cabecalho .qtd-carrinho');
    if(nativeBadge && window.MutationObserver){
      new MutationObserver(()=>{
        const qty=Number(nativeBadge.textContent.trim());
        if(Number.isFinite(qty))updateCart(qty);
      }).observe(nativeBadge,{childList:true,characterData:true,subtree:true});
    }
    document.documentElement.dataset.n27IndependentHeader="1";
    // Desktop: native CSS sticky keeps the complete approved header visible.
    // Mobile: only logo/search/cart are pinned; marquee and category rail
    // continue scrolling away. The placeholder prevents any layout jump.
    const headerTop=window.scrollY+root.getBoundingClientRect().top;
    let rafPending=false;
    function updateSticky() {
      rafPending=false;
      if(!root.isConnected)return;
      const compact=window.matchMedia("(max-width: 767px)").matches &&
        window.scrollY>headerTop+145;
      root.dataset.n27MobileSticky=compact?"1":"0";
    }
    function requestSticky() {
      if(rafPending)return;
      rafPending=true;
      window.requestAnimationFrame(updateSticky);
    }
    window.addEventListener("scroll",requestSticky,{passive:true});
    window.addEventListener("resize",requestSticky,{passive:true});
    requestSticky();
  }
  if(document.readyState==="loading")document.addEventListener("DOMContentLoaded",mount,{once:true});
  else mount();
  window.addEventListener("load",mount,{once:true});
  [180,600,1500,3000].forEach(t=>setTimeout(mount,t));
})();
