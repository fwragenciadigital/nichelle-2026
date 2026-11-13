/* Conteúdo sintético exclusivo da prévia. Nunca incluir no HTML de produção. */
(function () {
  "use strict";
  window.NICHELLE_PREVIEW_DATA = Object.freeze({
    products: [
      [
        { name: "Medicube Vita A Retinal Volume Booster — conteúdo demonstrativo", image: "/preview/assets/prod-1.svg" },
        { name: "Medicube PDRN Pink Exosome Shot — conteúdo demonstrativo", image: "/preview/assets/prod-2.svg" },
        { name: "Tree Hut Golden Vanilla — conteúdo demonstrativo", image: "/preview/assets/prod-3.svg" },
        { name: "Skin1004 Centella Ampoule — conteúdo demonstrativo", image: "/preview/assets/prod-4.svg" },
        { name: "Medicube Zero Foam Cleanser — conteúdo demonstrativo", image: "/preview/assets/prod-5.svg" }
      ],
      [
        { name: "Lançamento demonstrativo 01", image: "/preview/assets/prod-1.svg" },
        { name: "Lançamento demonstrativo 02", image: "/preview/assets/prod-2.svg" },
        { name: "Lançamento demonstrativo 03", image: "/preview/assets/prod-3.svg" },
        { name: "Lançamento demonstrativo 04", image: "/preview/assets/prod-4.svg" },
        { name: "Lançamento demonstrativo 05", image: "/preview/assets/prod-5.svg" }
      ],
      [
        { name: "Promoção demonstrativa 01", image: "/preview/assets/prod-1.svg" },
        { name: "Promoção demonstrativa 02", image: "/preview/assets/prod-2.svg" },
        { name: "Promoção demonstrativa 03", image: "/preview/assets/prod-3.svg" },
        { name: "Promoção demonstrativa 04", image: "/preview/assets/prod-4.svg" },
        { name: "Promoção demonstrativa 05", image: "/preview/assets/prod-5.svg" }
      ]
    ]
  });
  window.Nichelle27Settings = {
    geral: { ativo: true, debug: false, paginas: ["/preview/"] },
    layout: { ativo: true, seletor: "#n27-layout-root" },
    topo: {
      ativo: true, seletor: "#cabecalho", faixaAtiva: true,
      qualificadores: [
        { titulo: "INFORMAÇÕES DA LOJA", texto: "TEXTO PARA CONFIRMAÇÃO" },
        { titulo: "ENTREGA", texto: "CONDIÇÕES A CONFIRMAR" },
        { titulo: "PAGAMENTO", texto: "CONDIÇÕES A CONFIRMAR" },
        { titulo: "TROCAS", texto: "POLÍTICA A CONFIRMAR" }
      ]
    },
    qualificadores: {
      ativo: true, rotulo: "VANTAGENS",
      itens: [
        { icone: "caixa", texto: "COSMÉTICOS IMPORTADOS · TEXTO A CONFIRMAR" },
        { icone: "original", texto: "ORIGINALIDADE · TEXTO A CONFIRMAR" },
        { icone: "atendimento", texto: "ATENDIMENTO · TEXTO A CONFIRMAR" },
        { icone: "selo", texto: "SELO · TEXTO A CONFIRMAR" }
      ]
    },
    maisVendidos: { ativo: true, titulo: "Produtos", destaque: "Mais Vendidos", seletorFonte: "#demo-best", seletorItem: ".listagem-item" },
    lancamentos: { ativo: true, titulo: "Produtos", destaque: "Lançamentos", seletorFonte: "#demo-launches", seletorItem: ".listagem-item" },
    marcas: {
      ativo: true, titulo: "Compre as", destaque: "Melhores Marcas",
      itens: [
        ["medicube", "Medicube"], ["victoria-secret", "Victoria's Secret"],
        ["tree-hut", "Tree Hut"], ["missha", "Missha"],
        ["k-secret", "K-Secret"], ["lilyeve", "Lilyeve"],
        ["skin1004", "Skin1004"], ["cer-100", "CER-100"]
      ].map(function (item) { return { nome: item[1], imagem: "/preview/assets/brand-" + item[0] + ".svg", link: "#marcas" }; })
    },
    promocoes: { ativo: true, titulo: "Produtos", destaque: "Promocionais", seletorFonte: "#demo-promos", seletorItem: ".listagem-item" },
    newsletter: { ativo: true, titulo: "Fique por dentro das novidades", texto: "Texto demonstrativo. Formulário real e consentimento devem ser confirmados.", seletorFormulario: "#demo-newsletter" },
    instagram: {
      ativo: true, perfil: "", usuario: "@nichelle_imports",
      itens: [1, 2, 3, 4].map(function (n) { return { imagem: "/preview/assets/news-" + (n > 3 ? 1 : n) + ".svg", alt: "Arte demonstrativa para mosaico social", link: "#instagram" }; })
    },
    empresa: {
      ativo: true, nome: "Nichelle Imports", logo: "", texto: "Descrição institucional, contatos, imagem, links, selos e informações legais precisam ser aprovados pela Nichelle antes da configuração final.", imagem: "/preview/assets/prod-4.svg"
    },
    rodape: { ativo: true, seletor: "#footer" }
  };
  window.FWRNichelle = {
    bannerVitrine: { ativo: true, origem: "lateral", nomes: ["mini-pages1", "mini-pages2", "mini-pages3", "mini-pages4"], paginas: ["/preview/"] },
    galeriaVideos: { ativo: false, shorts: [] },
    noticias: {
      ativo: true, ocultarLinksRodape: false,
      itens: [
        { foto: "/preview/assets/news-1.svg", titulo: "Conteúdo editorial demonstrativo", breveTexto: "Imagem e texto ilustrativos para conferir proporção, hierarquia e leitura da seção.", data: "DATA A CONFIRMAR", link: "/preview/#conteudos" },
        { foto: "/preview/assets/news-2.svg", titulo: "Matéria demonstrativa 02", breveTexto: "Texto editorial final, imagem, link e data dependem de aprovação.", data: "DATA A CONFIRMAR", link: "/preview/#conteudos" },
        { foto: "/preview/assets/news-3.svg", titulo: "Matéria demonstrativa 03", breveTexto: "Texto editorial final, imagem, link e data dependem de aprovação.", data: "DATA A CONFIRMAR", link: "/preview/#conteudos" }
      ]
    }
  };
})();
