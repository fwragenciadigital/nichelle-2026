# Nichelle 27 — framework visual a partir do layout 2026

## Referência

Layout recebido: https://projetos.fwragenciadigital.com.br/nichelle/2026/index1.html e screenshots fornecidos na conversa.

**Nota:** o HTML remoto do protótipo não pôde ser carregado neste ambiente; a implantação visual abaixo foi desenhada com base nos screenshots. A validação do DOM real do tema da Loja Integrada ainda é necessária para ajustar seletores e detalhes pixel-perfect.

O JS/CSS antigo anexado pelo cliente é um **demo Malheiro** e não contém o código real do layout Nichelle 2026. A base original permanece arquivada em \`framework/referencias/nichelle27.js\` e \`framework/referencias/nichelle27.css\`. A implementação adaptada vive em \`public/nichelle27.js\` e \`public/nichelle27.css\`.

## Ordem oficial — 13 grupos

| Ordem | Bloco | Origem e implementação |
|---|---|---|
| 1 | Topo | Cabeçalho, busca, menus e links **nativos da LI**; o framework só aplica visual mediante seletor validado |
| 2 | Barra de qualificadores | 4 vantagens: entrega, originalidade, atendimento, selo; HTML + CSS do framework |
| 3 | Vitrine Mais Vendidos | **Listagem nativa** da LI, movida sem clonagem por seletor explícito |
| 4 | Banners | **Já criado** em \`public/nichelle.js\`; framework só posiciona o slot \`#fwr-nichelle-vitrine-slot\` |
| 5 | Vitrine Lançamentos | Listagem nativa da LI sem recriar produtos ou preços |
| 6 | Marcas | Cards de imagem/link administrados nas Settings, até 16 itens, 8 no desktop |
| 7 | Vídeos | **Já criado** em \`public/nichelle.js\`; posiciona \`#fwr-nichelle-video-slot\` |
| 8 | Vitrine Promocionais | Listagem nativa da LI sem criar novos preços ou carrinho |
| 9 | Notícias | **Já criado** em \`public/nichelle.js\`; posiciona \`#fwr-nichelle-noticias-slot\` |
| 10 | Newsletter | Move **formulário nativo** da LI, mantendo o action e a validação originais |
| 11 | Instagram | Perfil + até 8 posts com imagem/link cadastrados nas Settings, sem API de terceiros |
| 12 | Texto Empresa | Texto/logo/foto institucionais (configuráveis no HTML) |
| 13 | Footer | **Rodapé nativo** da LI, apenas recebe visual com seletor válido |

Topo e footer ficam fora do slot principal, preservando semântica e funções da plataforma.

## Arquivos

- \`public/nichelle27.js\`: JS 1 — framework estrutural, Settings e orquestração dos grids
- \`public/nichelle27.css\`: estilos gerais da Nichelle, escopados, com breakpoints 1199 / 767 / 350px
- \`public/nichelle.js\`: JS 2 — banners, Shorts e notícias, **já existe e está publicado na Vercel**
- \`integracao/html-framework-nichelle27.html\`: HTML editável da LI com Settings + slot \`#n27-layout-root\`, TODOS os módulos começam \`ativo:false\`
- \`tests/framework27.test.mjs\`, \`tests/framework27.browser.mjs\`: testes de sintaxe, comportamento, renderização e responsividade.

## Status de ativação e publicação

**Não alterar a produção.** O build atual da Vercel só gera \`public/nichelle.js\`. Os novos arquivos \`nichelle27.js\`/\`nichelle27.css\` estão somente no GitHub; não há link público Vercel desses arquivos nem upload realizado na Loja Integrada.

Para homologação posterior:
1. Identificar com DevTools os seletores reais dos três blocos de produtos, cabeçalho, rodapé e formulário nativo de newsletter. Não assumir que o tema usa os seletores padrão.
2. Disponibilizar um slot \`<div id="n27-layout-root"></div>\` na home ou página de teste escolhida.
3. Na versão de teste, carregar \`nichelle27.css\` no **head**, antes do primeiro paint, para evitar CLS.
4. Carregar \`nichelle27.js\` antes de \`nichelle.js\` com \`defer\` e **somente uma vez cada**.
5. Colocar Settings antes de \`DOMContentLoaded\`, inicialmente \`geral.ativo:false\`, \`layout.ativo:false\` e **cada módulo \`ativo:false\`**.
6. Ativar gradualmente com seletores nativos verificados e conteúdos reais; ligar \`geral\` e \`layout\` apenas no ambiente de teste.
7. Validar responsividade, CLS e funcionamento de variantes, PIX, carrinho, cupom, frete e banners existentes. O framework **move nós de listagens**, não replica os produtos.
8. Somente depois de aprovação, publicar dois JS + CSS em URL pública validada e trocar links na LI. Manter rollback do script atual.

## Configuração por componente

\`\`\`js
window.Nichelle27Settings = {
  geral: { ativo: false, paginas: ["/"], debug: false },
  layout: { ativo: false, seletor: "#n27-layout-root" },
  maisVendidos: {
    ativo: false, titulo: "Produtos", destaque: "Mais Vendidos",
    seletorFonte: "", seletorItem: ".listagem-item"
  },
  // ... ver o arquivo HTML de Settings completo
};
\`\`\`

As vitrines não adivinham seletores, para evitar mover um grid incorreto ou prejudicar o checkout. Cada \`seletorFonte\` deverá ser exclusivo e encontrar a **lista de cards**, e não um container que inclui várias listas.

**Contratos de fontes reais**:
- Produtos/preços/frete/parcelas: somente da LI; nunca JS hardcoded.
- Mini Banner/Banner Lateral, notícias, vídeos: \`window.FWRNichelle\`; framework só organiza slots existentes/ativos.
- Newsletter: obrigatório informar \`seletorFormulario\` de um form real com input de e-mail; não cria endpoints.
- Marcas: URLs HTTPS de logos e links reais editáveis.
- Instagram: imagens e links reais editáveis; sem captura de dados externos.
- Empresa: texto e logo/foto aprovados pela marca.

## Proporções e comportamento

- Largura máxima de conteúdo: **1440px** com margens responsivas.
- Paleta: roxo Nichelle \`#8300aa\`, lilás de destaque \`#a63fbb\`, fundo lavanda \`#f0eaf3\`.
- Barra de qualificadores: quatro itens no desktop, duas colunas no mobile, uma até 350px.
- Vitrines: cinco cards lado a lado no desktop; scroll horizontal com snap no mobile.
- Marcas: oito logos no desktop, quatro colunas no tablet e scroll horizontal no mobile.
- Newsletter: card gradiente roxo, título à esquerda e **formulário nativo real** à direita no desktop; uma coluna no mobile.
- Instagram: cartão de perfil + quatro imagens no desktop, scroll no mobile.
- Nenhum Google Font, iframe novo ou biblioteca externa.

## Teste e diagnósticos

No console, quando o JS 1 estiver instalado em homologação:
\`\`\`js
window.Nichelle27Framework?.diagnostico()
\`\`\`

O objeto retorna \`versao\`, \`configuracaoAtiva\`, \`layout\`, \`ordem\`, \`montados\` e \`modules\`. A montagem manual pode ser repetida por \`document.dispatchEvent(new Event("nichelle27:refresh"))\` — sem duplicar blocos já montados.

**Risco conhecido antes de produção:** mover nós de listagens controlados por slider de terceiros pode exigir reinicialização específica do tema. Sem examinar o DOM real não há garantia de compatibilidade com todo comportamento do slider. Por isso a montagem é opt-in, e a homologação de carrinho/produtos é obrigatória.

## Fase 2 — pendências para homologação pixel-perfect

- Mapear HTML e CSS reais de topo/nav, catálogos, preços e footer.
- Confirmar imagens definitivas/logos, cor e tipografia oficialmente adotados.
- Confirmar se o template permite incluir \`nichelle27.css\` no head e um slot fixo antes do conteúdo.
- Validar o CLS em Lighthouse, acessibilidade, lazy images e carregamento real da LI.
- Após definição, preparar deploy Vercel de homologação dos **três assets** (dois JS e CSS) antes do upload definitivo.
