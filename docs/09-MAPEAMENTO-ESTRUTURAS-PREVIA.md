# Mapeamento das estruturas visuais enviadas — 2026-11-09

## Escopo e evidência

As 11 capturas enviadas pelo cliente são referência visual para a prévia isolada. Elas não mostram comportamento de mobile, seletores do tema, gestão no painel da Loja Integrada nem interações. `index1.html` continua sendo o layout final de referência; o HTML servido por essa URL é uma única imagem rasterizada, portanto não comprova DOM funcional.

`preview/index.html` demonstra a composição em navegador com assets SVG locais e conteúdo explicitamente ilustrativo. A prévia não é uma cópia funcional da loja, não contém dados comerciais reais e não deve ser instalada na Loja Integrada.

## Propriedade e gestão por seção

| Ordem visual | Estrutura observada | Classificação | Gestão e decisão |
|---:|---|---|---|
| 1 | Faixa superior de mensagens | `INDEFINIDO` | Validar se tema/LI já oferece ticker; mensagens da prévia são neutras e demonstrativas. |
| 2 | Logo, busca, atendimento, conta e carrinho | `NATIVO-LI` | Continuam no tema e painel LI. A prévia mostra apenas uma representação sem ações. |
| 3 | Menu roxo de categorias | `NATIVO-LI` | Links e navegação devem continuar nativos; a prévia usa âncoras locais visuais. |
| 4 | Banner principal | `NATIVO-LI` | Preservar conteúdo, destino, carrossel e administração nativos. Não reconstruído na fixture se não aparece nas capturas isoladas. |
| 5 | Cartão “Vantagens” com quatro benefícios | `INDEFINIDO` | A arte confirma o bloco, mas não quem o administra. Não assumir dashboard FWR nem publicar os claims sem confirmação. |
| 6 | Vitrine “Mais Vendidos” | `NATIVO-LI` | Produtos, imagens, preço, desconto, parcelas e ações pertencem à LI. A prévia omite preço/estoque e usa cards sintéticos. |
| 7 | Quatro tiles de pele/necessidades | `INDEFINIDO` | Podem ser banners/categorias LI ou seção editorial. A prévia reaproveita apenas conteúdo local ilustrativo para mostrar geometria. |
| 8 | Vitrine “Lançamentos” | `NATIVO-LI` | Lista e dados comerciais seguem nativos da LI. |
| 9 | Cartões de marcas | `INDEFINIDO` | Confirmar se são links/categorias LI, imagens manuais ou app. Marcas na prévia são placeholders tipográficos locais. |
| 10 | Galeria de quatro vídeos verticais | `CUSTOM-FWR` | Única seção personalizada confirmada e administrada pela FWR. Dashboard protegido controla ativação, URLs, capa opcional, descrição e ordem. URLs finais aguardam a Nichelle. |
| 11 | Vitrine “Promocionais” | `NATIVO-LI` | Preço, estoque, descontos, variantes e compra ficam na LI. |
| 12 | Editorial “Conteúdos para você” | `INDEFINIDO` | Confirmar blog/app/gestão, direitos das imagens, links e datas antes de implementar ou migrar. |
| 13 | Newsletter | `INDEFINIDO` | Formulário e lista dependem da LI/provedor e consentimento. Não mover nem criar endpoint FWR sem homologação. |
| 14 | Mosaico Instagram | `INDEFINIDO` | Confirmar feed/manual, perfil, links, privacidade e dependência. Fixture usa assets sintéticos. |
| 15 | Faixa institucional com logo/texto/imagem e rodapé | `INDEFINIDO` para faixa visual; `NATIVO-LI` para links, políticas, suporte, pagamento e recursos de rodapé | Conteúdo e selos precisam de confirmação; manter o rodapé e as funções nativas da LI. |

`AJUSTE-VISUAL`: nenhum ajuste no tema real está aprovado. CSS da prévia é isolado e aplicado só na rota local/preview.

## Campos e integrações editáveis

| Superfície | Campos agora | Integração |
|---|---|---|
| Vídeos FWR | Estado da seção, até quatro URLs YouTube, capa customizada opcional, descrição, ativação individual, ordem, rascunho, prévia, publicação e rollback | Dashboard PHP autenticado; JSON público sanitizado; `public/nichelle.js` consome o endpoint informado uma vez no snippet LI |
| Demais elementos nativos/indefinidos | Nenhum campo no dashboard FWR nesta fase | Gestão nativa LI quando confirmada; demais conteúdos permanecem pendentes de origem/dono |

Não editar código Malheiro comercial. A base auditada serve somente para padrões técnicos documentados em `docs/04-DASHBOARD-SETTINGS-ARQUITETURA.md`; não carregar seus seletores, plugins ou conteúdo na Nichelle.

## Comportamento responsivo e CLS

- Desktop: capturas mostram vitrines horizontais com cinco produtos, quatro cards de categoria/vídeo e oito cartões de marca. O preview segue a composição com caixas dimensionadas antes das imagens.
- Mobile/tablet: as capturas fornecidas não mostram reflow. A prévia propõe navegação horizontal `scroll-snap` em vitrines, navegação e cards verticais; notícia e rodapé empilham. É hipótese de homologação, não comportamento aprovado.
- Galeria: cards 9:16 com dimensões intrínsecas declaradas; iframe não existe no carregamento inicial. No preview, os quatro cartazes SVG são demos sem vídeo e sem interação. A configuração remota reserva a geometria antes do fetch; falha/off mantém aviso neutro na mesma área.
- Vitrines/forms: framework pode reparentar listas e formulário na fixture; isso não comprova compatibilidade LI. A rotina `Nichelle27Framework.mount()` agora exige o marcador de fixture e host local/Vercel Preview, bloqueando essa manipulação no host público.
- Nenhuma medida de CLS no tema real foi executada. A referência raster não valida CLS ou mobile.

## Riscos e gates

1. Não remover, duplicar ou mover logo, hero, busca, menus, categorias, vitrines, formulários, cards, preços, carrinho, conta ou checkout nativos sem contrato de tema validado.
2. Confirmar os quatro URLs aprovados e direitos de exibição; não inventar Shorts/IDs nem usar assets sintéticos na produção.
3. Obter acesso a tema de homologação, editor de HTML/Cabeçalho/Rodapé e slot estável após marcas e antes dos produtos promocionais.
4. Confirmar conteúdo comercial de ticker/benefícios, links das marcas, blog, newsletter, Instagram, empresa e selos com o cliente e identificar quem administra cada bloco.
5. Medir CLS/LCP/INP na fixture e depois em tema de homologação; resultados locais não equivalem a dados de campo.

## Base técnica Malheiro

Fonte externa e snapshot local têm SHA-256 distintos (registrados no documento de arquitetura); não há prova de equivalência byte a byte. O delta adotado se limita a encapsulamento, inicialização idempotente e respeito ao ciclo nativo. O script de 159.899 bytes não é carregado no storefront, copiado pelo build nem incluído nos snippets Nichelle.
