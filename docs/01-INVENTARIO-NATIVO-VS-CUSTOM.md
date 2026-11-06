# Inventário — nativo Loja Integrada x módulos FWR

Este inventário separa **responsabilidade funcional** do que a arte do protótipo apenas desenha. O protótipo não expõe HTML por seção: o HTML servido contém uma única imagem longa. Portanto, a classificação de recursos nativos segue o escopo explícito do projeto; componentes visuais sem origem verificável permanecem `INDEFINIDO`.

## Componentes confirmados pelo escopo

| Componente/função | Classificação | Gestão | Decisão de fase 1 |
|---|---|---|---|
| Logo e cabeçalho/identidade da loja | `NATIVO-LI` | Loja Integrada | Preservar; nunca duplicar no dashboard FWR |
| Banner/carrossel principal | `NATIVO-LI` | Loja Integrada | Preservar o recurso e seus links/controles nativos |
| Menus, busca, categorias e navegação | `NATIVO-LI` | Loja Integrada | Preservar integralmente |
| Vitrines, cards de produto, variantes, preço, desconto, estoque e disponibilidade | `NATIVO-LI` | Loja Integrada | Preservar dados, links e ações de compra nativos |
| Carrinho/minicart, frete e checkout | `NATIVO-LI` | Loja Integrada | Não interceptar nem recriar |
| Galeria editorial de quatro vídeos verticais Medicube | `CUSTOM-FWR` **previsto no briefing** | FWR, somente após aprovação | Primeiro módulo a implementar; estado inicial desligado; não é vídeo nativo de PDP |

O rótulo `CUSTOM-FWR` da galeria representa a decisão de escopo dada no briefing. A imagem confirma sua aparência no protótipo, mas **não prova** como a galeria funciona nem a origem do código existente.

## Seções que aparecem na imagem, com origem ainda indefinida

| Posição visual de cima para baixo | O que a arte mostra | Classificação atual | O que falta confirmar |
|---|---|---|---|
| Topo | Faixa de mensagens de segurança, entrega, parcelamento e troca | `INDEFINIDO` | Se é recurso/setting do tema, conteúdo estático ou módulo personalizado |
| Após o hero | Faixa de benefícios com ícones | `INDEFINIDO` | Fonte dos ícones, edição e comportamento móvel |
| Antes da vitrine de lançamentos | Quatro cards de necessidades/tipos de pele | `INDEFINIDO` | Se são categorias nativas, banners de categoria ou tiles FWR |
| Meio da página | Faixa “Compre as Melhores Marcas” com logos | `INDEFINIDO` | Se aponta para categorias/marcas da LI ou conteúdo customizado |
| Entre faixa de marcas e vitrine promocional | Quatro cards verticais com posters de produtos e ícones play | `CUSTOM-FWR` **previsto no briefing** | Posição semântica e interação no tema real, origem e URLs finais dos vídeos/posters |
| Mais abaixo | “Conteúdos para você”, matéria em destaque e dois cards editoriais | `INDEFINIDO` | Se é blog/feed externo, seção do tema ou conteúdo próprio FWR |
| Mais abaixo | Faixa de cadastro de novidades/newsletter | `INDEFINIDO` | Destino do formulário, consentimento, integração e responsável pela lista |
| Antes do rodapé | Grade de imagens/Instagram | `INDEFINIDO` | Se é feed/plugin, links, consentimento e dependência externa |
| Rodapé | Institucional, atendimento, pagamentos e imagem de produtos | `INDEFINIDO` | Confirmar áreas nativas e personalizações do tema no painel LI |

`INDEFINIDO` não autoriza implementação nem inclusão no dashboard. Manter essas áreas como estão na Loja Integrada até validar HTML/tema, painel e aprovação do cliente.

## `AJUSTE-VISUAL`

Não há ajuste visual aprovado nesta fase. Se a comparação com a loja real mostrar diferenças de estilo em um componente nativo, registrar o seletor do tema, viewport e CSS mínimo proposto. Qualquer CSS futuro deve ser escopado, não alterar dados, links, eventos, ordem de carregamento nem comportamento nativo.

## Slots e verificações pendentes

- A referência é uma imagem e não fornece seletores por seção. Não há slot de inserção verificável nela.
- A loja atual foi aberta em leitura; a estrutura de cabeçalho, carrinho, links de categorias e vitrine de produtos está presente. O navegador mostrou recursos em `cdn.awsli.com.br` e um script de tema Loja Integrada. Isso não comprova o nome/versão do tema nem autoriza edição.
- Acesso ao painel Loja Integrada, HTML/Cabeçalho, HTML/Rodapé, CSS do tema e homologação não foi feito. Nenhum seletor seguro foi confirmado.
- Antes de codificar a galeria, confirmar no tema o ponto de montagem correspondente à posição visual já definida e aprovar a regra móvel.

## Regra de controle

O dashboard FWR edita somente Settings de módulos `CUSTOM-FWR` aprovados. Não expor controles de logo, hero/banner, categorias, navegação, vitrines, catálogo, preço, estoque, variantes, promoções, carrinho, frete ou checkout.
