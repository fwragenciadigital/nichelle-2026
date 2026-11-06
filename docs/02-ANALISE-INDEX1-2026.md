# Análise do layout de referência — Nichelle 2026

**Referência visual final indicada pelo cliente:** [index1.html](https://projetos.fwragenciadigital.com.br/nichelle/2026/index1.html). O layout dessa página é o alvo que irá ao ar. Este mapeamento separa a fidelidade visual da responsabilidade funcional: o visual pode ser reproduzido, mas os recursos de comércio continuam sendo renderizados e administrados pela Loja Integrada.

## Evidência coletada

- A URL exata abriu em navegador Chromium e exibiu o layout de página inteira, com a sequência descrita abaixo.
- A estrutura HTML observável da página contém um elemento de imagem centralizado: `<img src="images/banner-regua.png" width="1250" height="8550" alt="">`. A imagem tem dimensões de layout declaradas de **1250 × 8550 CSS px** e não há texto semântico ou elementos DOM separados para os blocos.
- A imagem é uma composição visual longa. Ela permite mapear aparência e ordem visual, mas não revela seletores de seção, links, origem dos componentes, integração de formulários, controles de reprodução ou comportamento de breakpoints.
- O preset 1440 × 900, ao 820 × 1180 e ao 390 × 844 foi aplicado na inspeção. O navegador informou `innerWidth` de 2× esses valores (escala do ambiente); em tablet e mobile, a largura da composição continua em 1250 CSS px e o screenshot mostra conteúdo lateralmente cortado/rolável. Portanto, o arquivo fornecido não demonstra reflow mobile. Isso é limitação da referência raster, não validação do layout móvel da loja.
- A home pública atual também foi aberta em modo de leitura. Nela há logo, login, carrinho, navegação de categorias, carrossel de banners, faixa de benefícios e cards de produto com preços e ações; o DOM e os recursos carregados confirmam que esses fluxos já pertencem à loja. Nenhuma interação de compra foi acionada.
- O acesso ao painel da Loja Integrada, ao tema e ao editor de HTML/CSS não foi realizado. Seletores e permissões de inserção continuam sem validação.

## Composição visual de cima para baixo

| Ordem | Bloco visível no `index1.html` | Classificação funcional | Instrução para a implementação futura |
|---:|---|---|---|
| 1 | Faixa superior de mensagens sobre segurança, entrega, parcelamento e troca | `INDEFINIDO` quanto à origem; manter qualquer aviso nativo da LI | Reproduzir apenas o tratamento visual depois de identificar o setting/slot dono do conteúdo |
| 2 | Cabeçalho com logo, busca, atendimento/conta e carrinho | `NATIVO-LI` | Preservar logo, busca, conta e carrinho da LI; não desenhar cópia estática |
| 3 | Navegação roxa com Mais Vendidos, Skincare, Tipos de Pele, Necessidades da Pele, Cuidados Pessoais, Kits e Marcas | `NATIVO-LI` para menus/categorias; textos e estética conforme loja | Manter destinos e interação nativos; não administrar links no dashboard FWR |
| 4 | Banner hero Medicube com chamada e botão Comprar Agora | `NATIVO-LI` | Banner e destino seguem no tema/painel LI |
| 5 | Faixa de benefícios/logística com ícones | `INDEFINIDO` | Confirmar se o tema/LI já fornece o componente e a gestão do conteúdo |
| 6 | Vitrine “Produtos Mais Vendidos”, com cinco cards de produto e preço/parcelamento/desconto | `NATIVO-LI` | Usar vitrine e dados dinâmicos da LI |
| 7 | Quatro tiles de necessidades da pele/tipos de pele | `INDEFINIDO` | Confirmar se são categorias/banners gerenciados na LI ou conteúdo especial FWR |
| 8 | Vitrine “Produtos Lançamentos”, com cinco cards | `NATIVO-LI` | Usar vitrine e dados dinâmicos da LI |
| 9 | Faixa “Compre as Melhores Marcas” com logos | `INDEFINIDO` | Confirmar origem, links de marca e forma de gestão |
| 10 | Galeria visual de quatro vídeos Medicube (cards verticais, poster, overlay, play) | `CUSTOM-FWR` previsto no briefing | É o único módulo FWR confirmado no escopo desta fase. Visualmente aparece após a faixa de marcas e antes de Produtos Promocionais; confirmar slot equivalente no tema antes de implementar |
| 11 | Vitrine “Produtos Promocionais”, com cinco cards | `NATIVO-LI` | Usar vitrine/preços/descontos/estoque da LI |
| 12 | “Conteúdos para você”, com destaque e duas matérias menores | `INDEFINIDO` | Confirmar se utiliza blog/feed nativo, app ou bloco editorial próprio |
| 13 | Banner de inscrição em novidades/newsletter | `INDEFINIDO` | Confirmar formulário, provedor, destino, consentimento LGPD e quem administra a lista |
| 14 | Grade social/Instagram com cinco imagens | `INDEFINIDO` | Confirmar se é feed, app ou mosaico manual; identificar links e dependências externas |
| 15 | Rodapé institucional com imagem, links, atendimento, segurança e formas de pagamento | `NATIVO-LI` para funções de rodapé/compra; personalizações visuais `INDEFINIDO` | Manter links e dados de suporte/pagamento administráveis; não alterar checkout nem selos |

`INDEFINIDO` significa que a imagem faz parte do layout final, mas ainda não permite afirmar que a seção exige código FWR nem dashboard. Não criar um segundo sistema de gestão para categorias, marcas, blog, newsletter, feed social ou dados de compra sem confirmação.

## Viewports e responsividade

| Preset solicitado | O que a referência permite observar | Decisão |
|---|---|---|
| 1440 × 900 | A arte mostra composição desktop centralizada; topo, hero e início da primeira vitrine aparecem em sequência | Usar como referência visual desktop, sem inferir DOM/slots |
| 820 × 1180 | A composição de 1250 px continua fixa e partes laterais ficam fora da área visível | Reflow, quebra de colunas, menu e comportamento das vitrines precisam de referência responsiva/validação em tema LI |
| 390 × 844 | A composição continua fixa; cabeçalho/nav/hero e cards ficam cortados lateralmente, com barra horizontal | Não tratar o overflow da imagem como experiência mobile aprovada |

## Galeria de vídeo — posição e escopo

- **Posição visual de destino:** depois da faixa de marcas e antes da vitrine “Produtos Promocionais”. A posição é confiável como parte da composição da imagem final, mas o slot DOM equivalente e o mecanismo para inserção ainda não foram vistos.
- **Aparência:** quatro cards verticais lado a lado, aproximadamente 9:16, imagens de produtos Medicube, cantos arredondados, camada escurecida leve e ícone triangular de play branco central; sem título visível sobre os cards.
- **Não observável:** duração e formato do vídeo, destino do play, modal/inline, fechar/teclado, carregamento, links dos cards, versão mobile real e se os posters representam URLs finais.
- **Ponto de decisão:** respeitar visualmente quatro cards no desktop. Para mobile, manter `mobileMode=pending` até haver uma arte móvel ou comportamento aprovado; não promover scroll-snap/grid por suposição.

## Integração e riscos levantados

- A estrutura da referência não contém slots HTML acessíveis. Se a galeria for inserida tardiamente depois da carga do JSON, todo o conteúdo seguinte poderá deslocar; isso cria risco de CLS mesmo abaixo da dobra.
- A implementação deve ter ponto de montagem de altura/razão estável antes da inserção dos cards, ou carregar a marcação/CSS da seção no fluxo inicial. Se não houver slot estável verificável, a galeria não pode entrar nessa fase de instalação.
- A arte fixa não comprova o layout da loja em tablet/mobile, o seletor de tema, o suporte a HTML/Cabeçalho/HTML/Rodapé, CORS, cache ou disponibilidade de endpoint.
- A loja atual carrega recursos do tema via CDN da Loja Integrada. Não adicionar uma segunda inicialização de jQuery, Owl ou plugins; dependências e seletores devem ser inspecionados em ambiente aprovado antes de qualquer código.
- A fundação de runtime prevista é a base JavaScript da Malheiro, por decisão do usuário. O arquivo/revisão exatos ainda não foram fixados neste checkout; a auditoria e adaptação dessa base ficam para a implementação aprovada.

**Conclusão visual:** o alvo visual está mapeado de ponta a ponta. A primeira implementação permanece limitada à galeria FWR; a aprovação do mapa deve decidir o comportamento móvel e confirmar o slot/gestão dos blocos `INDEFINIDO` antes de ampliar escopo.
