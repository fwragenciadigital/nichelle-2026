# Nichelle Imports 2026 — homologação do layout na Loja Integrada

**Origem:** fwragenciadigital/nichelle-2026, branch `develop`, Vercel preview.

## Links fixos de desenvolvimento

- JavaScript: https://nichelle-2026-git-develop-fwragenciadigitals-projects.vercel.app/nichelle27.js
- CSS: https://nichelle-2026-git-develop-fwragenciadigitals-projects.vercel.app/nichelle27.css
- Configuração de vídeos: https://nichelle-2026-git-develop-fwragenciadigitals-projects.vercel.app/galeria-publicada.json

## Instalação em modo seguro

1. Manter os códigos atuais da loja; verificar se o `nichelle.js` legado já é carregado no tema para evitar carregamento duplicado do runtime de banners/Shorts/notícias.
2. Inserir **uma vez** `integracao/NICHELLE27-HOMOLOGACAO-CABECALHO.html` em HTML/Cabeçalho, se o tema permitir.
3. Acessar `https://www.nichelleimports.com.br/?nichelle_preview=1` para testar as alterações visuais. Sem o parâmetro, a nova identidade não altera o DOM.
4. Para as quatro artes de Mini Banners, enviar os arquivos otimizados da pasta `Recortado` ao gerenciador de arquivos da LI, configurar `assetsBase` com a URL HTTPS real e preencher links de destino reais por card (quando vazios, exibem apenas a arte, sem clique).
5. Ativar vitrines de forma gradual **somente após identificar seletor nativo exclusivo**. Não criar preços, descontos, parcelamento ou checkout em JavaScript.
6. Validar header e menus nativos, produtos, variantes, mini carrinho, checkout, newsletter, frete, Pix, breakpoints 390/768/1440 e CLS.
7. Somente após aprovação, trocar `modoPreview:true` por `false` e `publicarNaLoja:false` por `true`. Pode manter os links JS/CSS.
8. Quando concluir, baixar JS e CSS de Vercel para hospedar na CDN da LI, atualizando apenas os dois href/src no HTML. A base `assetsBase` também poderá apontar para a LI.

## Integração de galeria existente

O Vercel publica `galeria-videos.js/css` e `galeria-publicada.json` para compatibilidade com o `public.rar`. O build entrega `nichelle27.js` com o runtime FWR anterior incorporado e `nichelle27.css` com os estilos anteriores. Portanto, **não** inserir um terceiro `<script src="nichelle.js">` durante a nova instalação.

### Restrições

O layout raster aprovado é referência visual, não código HTML. O tema LI deve manter as funcionalidades comerciais nativas. Não afirmar paridade pixel-perfect ou teste de compra antes do QA real. Acesso a `?nichelle_preview=1` é apenas gate visual, não autenticação.

## Ordem dos blocos existentes

A home continua usando hero, benefícios, vitrines, marcas e newsletter **nativas**. O slot especial das quatro artes é inserido após a primeira `.vitrine-produtos` renderizada; conferir no DevTools que essa é a vitrine “Mais Vendidos”. Alterar `layout.inserirDepois` somente depois de confirmar posição na loja. Não reordenar os elementos comerciais nativos sem testes. A personalização visual do tema é ativada pela flag `visual.ativo` e pelo gate de prévia, e não afeta visitantes comuns nesta fase.


## Revisão visual em 16/11/2026 (Chromium)

- O CSS e JS estavam carregados e a flag `modoPreview` era verdadeira.
- A chamada inicial a `Nichelle27Framework.mount()` ocorria antes da criação da vitrine/âncora: não existia `#n27-layout-root` e nenhuma seção era montada. Chamar `mount()` após carregamento criava o slot e o módulo.
- O seletor genérico `.vitrine-produtos` posicionava o slot na estrutura errada. Passou a priorizar `.vitrine-mas-vendido`.
- Os quatro arquivos `mini1.webp` … `mini4.webp` retornavam 404 na URL `https://cdn.awsli.com.br/2550/2550587/arquivos/`. Enquanto esses arquivos não forem publicados, a seção editorial fica oculta em vez de deixar quatro caixas vazias. Não é possível concluir a fidelidade visual sem imagens publicadas e sem validar novamente a LI.
- O layout aprovado exibe hero rosa Medicube, vitrines de cinco itens, marcas, vídeos, editorial e faixas institucionais. A página vista ainda usa hero verde e estruturas nativas diferentes. Corrigir esses blocos requer trabalhar no cadastro de banners e no tema da Loja Integrada; a atualização deste commit não os substitui.


## Prévia sem a aparência do tema Groom — versão 0.7.0

- URL de homologação: `https://www.nichelleimports.com.br/?nichelle_preview=1`.
- O mesmo HTML/CSS externo já cadastrado na Loja Integrada continua válido; não é preciso editar o painel após este deploy.
- O bundle `nichelle27.js` agora agrega `public/nichelle-isolation.js`; o bundle CSS agrega `public/nichelle-isolation.css`.
- O isolamento é restrito ao domínio oficial, à home, à query `nichelle_preview=1` e ao `geral.modoPreview=true`, com `publicarNaLoja=false`.
- O modo utiliza `data-n27-isolated=1` e cria `#n27-preview-stage` com os blocos nativos em ordem: hero, mais vendidos, módulos FWR, lançamentos, marcas, vídeos e vitrines seguintes.
- Corrige o UL de 20 produtos órfão da vitrine mais vendidos. Os cards são movimentados, não clonados; links e elementos de compra permanecem reais.
- Os sliders Slick de vitrines da home de prévia são substituídos por trilhos CSS responsivos; não altera Slick em categorias, PDP ou loja pública.
- Não interrompe nem remove os scripts originais do tema: a neutralização é visual. O único caminho para desinstalar o tema real é pelo painel.
- Na última revisão prévia, as quatro artes mini1.webp a mini4.webp retornavam 404. A seção dessas artes permanece oculta até disponibilizá-las; o hero principal continua sendo o banner cadastrado no painel da LI.
- Para depurar, execute `Nichelle27Framework.diagnostico()` no console e confira `isolamentoVisual:true` em preview e `false` na loja normal.


## V0.8.0 — Reconstrução visual da home em 16/11/2026

O layout aprovado disponibilizado em https://projetos.fwragenciadigital.com.br/nichelle/2026/index1.html é **uma imagem JPEG de 2549×8550 px aplicada como background**, mais uma pequena régua PNG. Não contém componentes HTML de loja interativos. Foi usada como referência de composição, e NÃO publicada como uma página de imagem única.

- Hero rosa Medicube (corte otimizado da arte aprovada), substituindo visualmente o banner verde apenas na prévia.
- Régua de vantagens reutiliza os textos nativos da loja.
- Vitrine Mais vendidos restaurada com produtos reais.
- Quatro artes verticais otimizadas do layout aprovado, hospedadas na Vercel, sem dependência dos `mini1.webp` a `mini4.webp` da CDN LI que retornavam 404.
- Vitrine Lançamentos; marcas; vídeo nativo; produtos em destaque; editorial skincare usando as imagens `coreana.jpg` e `coreana1.jpg` do CDN LI.
- Newsletter nativa reposicionada, Instagram com produtos reais como amostra visual e rodapé lavanda com imagem Medicube nativa.
- O bloco com quatro vídeos verticais da referência não pode ser reconstruído fielmente sem os vídeos aprovados: o JSON `galeria-publicada.json` indica `enabled:false, items:[]`.
- As peças do Instagram do layout estático não foram fornecidas separadamente; a prévia apresenta fotos reais de produtos como substituto provisório.
- Apenas ativa com `?nichelle_preview=1`; não remove a instalação Groom nem altera checkout.
- Pendências para homologação final: vídeos e posts reais, conteúdo institucional, URLs definitivas dos banners, CSS pixel-perfect em mobile/desktop.


## Cabeçalho aprovado (16/11/2026)

- Modelo: faixa superior fina branca de benefícios (SSL, entrega, parcelamento, troca), logo à esquerda, busca central longa, Atendimento e Meu Painel com ícones roxos, carrinho à direita, e faixa roxa com 7 itens/iconografia.
- `public/nichelle-header.js` e `public/nichelle-header.css` são concatenados em `nichelle27.js` e `nichelle27.css`; links no painel da LI não mudam.
- Todo código é opt-in na home com `?nichelle_preview=1`. Sem parâmetro: sem mudanças visuais.
- **Funcionalidade:** preserva `#form-buscar` (GET /buscar?q=), logo nativo, `.painel-atendimento` com suas opções, `.painel-conta` com rotas existentes, `.painel-carrinho` com atualizações AJAX, e `.menu-mobile-button` acionando menu mobile real.
- O topo do tema Groom (`.info-destaque` e `.menu-desktop`) é ocultado visualmente só no preview. O menu mobile real permanece no DOM e seus eventos JS intactos.
- Categorias do menu aprovadas: Mais Vendidos, Skincare, Tipos de Pele, Necessidades da Pele, Cuidados Pessoais, Kits, Marcas. URLs nativas encontradas: /mais-vendidos, /skincare, /corpo-banho, /kits-de-skincare, /marcas.
- **Pendência de cadastro:** Tipos de Pele e Necessidades da Pele não estavam no menu nativo da LI; até cadastradas, os links utilizam a busca nativa da plataforma.
- Testar: desktop 1440, mobile 390, busca /buscar?q, drawer menu, login, carrinho, hover/dropdown atendimento, links do menu, ausência de horizontal overflow e normal sem parâmetro.


## Cabeçalho independente (v0.9.0 / 16-11-2026)

O topo do preview agora é um HTML próprio com ID `#n27-independent-header`, sem reutilizar o DOM visual do Groom. Os controles comerciais são implementados como links/formulários próprios FWR que utilizam os **endpoints da Loja Integrada**: `/buscar?q=`, `/conta/login`, `/conta/index`, `/conta/pedido/listar`, `/carrinho/index`, rotas de categoria existentes e contatos oficiais da loja. O carrinho lê `window.qtd_prods_carrinho` (dado global da plataforma), com bridge opcional do contador no DOM do tema anterior e evento `nichelle:cart-updated`. Nenhum layout, menu drawer, dropdown ou animação depende do Groom.

`public/nichelle-category-catalog.json` é o **espelho publicado** do catálogo real de categorias da Loja Integrada nesta data; contém Marcas (43 subcategorias), Skincare (8), Corpo & Banho (3), Makes (3) e demais raízes. O build injeta o conteúdo JSON no JS final como `window.N27CategoryCatalog`, antes do componente. A plataforma continua sendo dona do cadastro e das URLs: novas categorias/subcategorias exigem sincronizar esse JSON com a loja; não é uma API automática da LI.

Os 7 itens aprovados ficam na ordem: Mais Vendidos, Skincare, Tipos de Pele, Necessidades da Pele, Cuidados Pessoais (origem Corpo & Banho), Kits (origem Skincare > Kits), Marcas. **Tipos de Pele e Necessidades da Pele não estavam registrados como categorias na navegação da loja** e usam busca nativa, sem inventar subcategorias.

`n27-owned-benefits__track`: marquee CSS infinito com duas cópias *idênticas* de um grupo largo, translateX(-50%), repetição contínua sem salto, pausa no hover e `prefers-reduced-motion`.
`n27-owned-nav`: mega-dropdown desktop, toggles por teclado e menu mobile FWR independente com `details` e links do catálogo. O tema antigo só é ocultado quando `data-n27-independent-header=1` é criado na home `?nichelle_preview=1`.

Testes: marquee em 390/1440/1920; submenus de Skincare, Marcas, Cuidados Pessoais; drawer mobile; busca nativa; checkout/carrinho; ausência de overflow; loja sem preview intocada.


## Vantagens FWR — versão 0.10.0 (16/11/2026)

A seção da home foi reconstruída com a arte aprovada `image(20261116-153958).png` como base. **Não reutiliza a barra antiga Frete grátis/Parcelamento/PIX/Segurança nem elementos `.banners-vantagens` do Groom.** O slot `#n27-approved-benefits` é criado pelo layout FWR e preenchido exclusivamente por `public/nichelle-home-benefits.js` + `public/nichelle-home-benefits.css`.

**Desktop:** recipiente central com largura máxima 1402px; box esquerdo 101×101px, cor #BBBBBB, +VAN/TA/GENS; box direito #EFEFEF, 4 vantagens em colunas, ícones roxos; texto cinza em caixa alta. **Mobile:** box esquerdo lateral e caixa direita com trilho horizontal de quatro vantagens com scroll-snap, sem aumentar a largura da página.

**Como administrar (pelo cliente):**
1. Abra o arquivo `integracao/NICHELLE27-VANTAGENS-ADMIN.html`, copie o bloco `<script>...` e cole em **Loja Integrada > Incluir código HTML > Rodapé**. Isso sobrescreve `window.Nichelle27Settings.vantagens` do Cabeçalho sem alterar scripts externos. Alternativamente, edite `vantagens` diretamente no HTML de Cabeçalho.
2. Campos: `ativo` (true/false), `etiqueta` (sugere-se manter "+VANTAGENS"), `itens[0..3].icone`, `titulo`, `descricao` e `link` (opcional, somente links internos da loja). Ícones permitidos: package, seal, headset, medal, truck, card, shield, pix.
3. **JSON direto no painel**: cole `<script type="application/json" id="n27-vantagens-json"> ... </script>` contendo o objeto de `public/nichelle-vantagens.json`. Este modo tem precedência sobre a configuração Javascript inline.
4. **JSON via arquivo**: informe `configUrl` apontando para um JSON publicado no domínio da loja, na CDN AWSLI ou na Vercel. O servidor do JSON precisa permitir CORS quando for outro domínio; se não permitir, o bloco mantém os valores do painel. Exemplo Vercel versionado: `https://nichelle-2026-git-develop-fwragenciadigitals-projects.vercel.app/nichelle-vantagens.json`.
5. Para atualização durante a mesma página, após salvar configurações em JS no HTML, dispare `document.dispatchEvent(new Event("nichelle27:vantagens:update"))`. Em navegação normal basta atualizar a página.

Importante: a publicação deste commit continua **somente em `?nichelle_preview=1`** e não altera a loja pública sem o parâmetro. Não registrar JSON externo sem CORS nem dados arbitrários contendo SVG/HTML. Os ícones são de uma lista segura, e textos são inseridos via `textContent`.


## Vitrine Mais Vendidos FWR — versão 0.11.0 (16/11/2026)

Referência: imagens fornecidas pelo cliente em 16/11/2026, primeira imagem é **layout aprovado** (cinco produtos grandes, fundo branco, heading Produtos **Mais Vendidos**, badge oval roxo, linha fina separando preços e PIX, setas no canto inferior direito); segunda imagem é **vitrine atual** (miniaturas pequenas, badge laranja, estrelas, caixa PIX cinza e scrollbar). Esta entrega substitui **apenas a apresentação da primeira vitrine**.

O componente está separado em `public/nichelle-best-sellers.js` + `public/nichelle-best-sellers.css` e concatenado no bundle JS/CSS já configurado na Loja Integrada. O preview monta `#n27-approved-best-sellers` antes da vitrine fonte. **A vitrine fonte fica no DOM e recebe `data-n27-shelf-source="1"` para ocultação visual somente quando o novo módulo já possui dados suficientes**. Nada é clonado do HTML do Groom para o novo card; a UI, o carrossel, os controles, os selos e o CSS são próprios da FWR.

**Dados da plataforma:** imagens, nome do produto, URLs, preço promocional e preço anterior, parcelamento e PIX são extraídos em leitura do HTML de produtos publicado pela LI; nunca sobrescrevemos valores. Se não houver dados, o original continua visível. Selos percentuais são calculados sobre os preços atuais (arredondamento inteiro): não aplicamos o “10% OFF” genérico da imagem de referência a produtos com descontos diferentes. Sem PIX ou parcelamento no HTML de origem, essas linhas são omitidas, nunca estimadas.

**Visual:** desktop ≥1200 px apresenta 5 cards, tablet 3 cards e mobile ~1,2 cards com scroll-snap. Sem Slick ou scrollbar visível, com setas próprias acessíveis, fundo branco, produtos grandes, conteúdo alinhado à esquerda e PIX sem caixas coloridas. A home continua ativada **somente em `?nichelle_preview=1`**; a loja pública é preservada.

**Administração:** `integracao/NICHELLE27-VITRINE-ADMIN.html` pode ser colado em Loja Integrada > Incluir código HTML > Rodapé (ou configurar `window.Nichelle27Settings.vitrineMaisVendidos` já incluído no template de cabeçalho). Campos: `ativo`, `prefixo`, `titulo`, `exibirSelo`, `exibirPix`, `exibirParcelamento`, `maxProdutos`. JSON inline em `<script type="application/json" id="n27-vitrine-mais-vendidos-json">` também é aceito. **Os produtos e sua ordem continuam sendo administrados no painel da Loja Integrada**, não por valores hardcoded. Atualizar sem reload: `document.dispatchEvent(new Event("nichelle27:vitrine:update"))`.

Nota de integração: o adaptador de dados ainda lê o HTML de produtos gerado no storefront da LI; não há uma API pública estável de produtos ligada a este preview. A UI está desacoplada do Groom, mas o contrato de dados ainda exige uma vitrine nativa existente. Para independência total de marcação HTML, será necessário um feed/API de produtos da plataforma com autorização e políticas de atualização.


## Vitrine circular e ajuste de fidelidade — v0.12.0 (16/11/2026)

Comparação da captura atual enviada pelo cliente (2048×721) com a arte aprovada (2048×821): as cinco colunas, posição do título e selos já estão no rumo certo, mas a área de imagens e o conteúdo da vitrine atual estavam cerca de 70–90 px mais altos no fluxo da página que a referência. A região de imagem foi ampliada de 285 para 365 px no desktop, para reposicionar os títulos e preços de forma mais próxima à arte aprovada, mantendo imagens e dados reais publicados pela LI. Preço riscado e preço de venda passam a compartilhar a mesma linha (a referência mostra ambos lado a lado).

**Navegação circular infinita, sem Slick/Groom:** a vitrine do preview duplica apenas os seis cards das extremidades (se houver itens suficientes), mantendo o conjunto central de produtos reais. O viewport começa no primeiro card real, e ao avançar do último item para o primeiro card clonado ocorre uma normalização invisível do `scrollLeft` para o primeiro card real, com `scroll-snap` momentaneamente desativado. O mesmo vale no sentido contrário. As setas **não se desabilitam nos limites** quando `loopInfinito:true`; o usuário pode navegar com setas, teclado e swipe no mobile; sem autoplay. Clones recebem `aria-hidden` e links fora do tab-order. Total atual de 20 produtos reais no carrossel, com 6 clones em cada extremidade, sem criar novos produtos na LI.

No HTML de administração `integracao/NICHELLE27-VITRINE-ADMIN.html` foi incluído o campo `loopInfinito:true` (padrão), podendo ser colocado como false para navegação limitada. A nova versão continua disponível apenas na home com `?nichelle_preview=1`.

Os valores, produtos, imagens e percentuais permanecem provenientes da Loja Integrada. O mockup de aprovação é referência visual, não deve forçar fotos/preços/cupom de itens inexistentes no cadastro.


## Vitrine de marcas aprovada — v0.13.0 (16/11/2026)

A versão antiga "Escolha pela marca" com cinco logos soltos, fundo rosa e Slick foi **substituída na prévia** pelo bloco FWR `#n27-approved-brands`, com título central `Compre as ` + `Melhores Marcas` roxo e cards brancos de até 151×88px arredondados com sombra, fundo `#EFE9F0`, responsivo e scroll horizontal mobile. O código reside em `public/nichelle-brands.js` + `public/nichelle-brands.css`; o build agrega às URLs existentes de `nichelle27.js` e `nichelle27.css`.

**Fonte do painel LI:** o JS lê diretamente os links e logos `<a href="/marca/..."><img alt src>` publicados na área nativa `.vitrine-marcas` da Loja Integrada. Adaptação em leitura; a apresentação e interações não dependem do Slick/Groom. Links internos /marca, imagens HTTPS; duplicações Slick ignoradas. Atualizações de nomes, logos e ordem no painel da Loja Integrada aparecem ao recarregar; MutationObserver acompanha re-renderizações dinâmicas.

Na verificação inicial, a vitrine de marcas da plataforma publicava **cinco marcas**: Victoria's Secret, Tree Hut, Bath & Body Works, SKIN1004 e Medicube. O aprovado inclui oito cards, mas não inventamos os três logos ausentes. Para ver oito, cadastrar/publicar mais três marcas com logo na vitrine de marcas do painel.

**Administração visual:** edite `window.Nichelle27Settings.vitrineMarcas` no cabeçalho ou cole `integracao/NICHELLE27-MARCAS-ADMIN.html` no rodapé. Propriedades `ativo`, `prefixo`, `titulo`, `maxMarcas`. JSON inline alternativo com id `n27-vitrine-marcas-json`. Não duplicar marcas comerciais em JSON, pois permanecem no cadastro LI.

**Fail-safe:** se não houver marcas com logo e link, mantenha a seção original. A prévia `?nichelle_preview=1` não altera a loja pública. Independência total da marcação de dados da vitrine nativa depende de API/feed LI autenticado; nesta etapa só o visual é desacoplado.


## Padronização de todas as vitrines + marcas — v0.14.0

As **quatro listagens de produtos da home** agora usam um único componente de cards e navegação circular FWR:
- `.vitrine-mas-vendido` → `#n27-approved-best-sellers` — Produtos Mais Vendidos;
- `.vitrine-lancamento` → `#n27-approved-launches` — Novos Lançamentos;
- `.vitrine-destaque` → `#n27-approved-highlights` — Produtos Em Destaque;
- `.vitrine-18709305` → `#n27-approved-brand-products` — Produtos Por Marca.

As quatro fontes contêm 20 produtos reais na loja em 16/11/2026; imagens, títulos, preços, percentuais, PIX, parcelamento e links são extraídos de leitura da Loja Integrada e não fixados no JavaScript. O CSS `public/nichelle-best-sellers.css` agora atua em toda `.n27-best-shelf`, e as listagens nativas são ocultadas apenas quando renderizadas com sucesso. Componentes não relacionados, como `.vitrine-video`, preservam seu papel próprio. Os carrosseis usam setas, teclado, arraste e loop circular com 6 cópias nas extremidades.

**Administração visual:** configurações `vitrineMaisVendidos`, `vitrineLancamentos`, `vitrineDestaques`, `vitrineMarcasProdutos` em `window.Nichelle27Settings`; arquivo único para o Rodapé: `integracao/NICHELLE27-VITRINES-ADMIN.html`. Cada seção possui `ativo`, `prefixo`, `titulo`, `exibirSelo`, `exibirPix`, `exibirParcelamento`, `maxProdutos`, `loopInfinito`. Os produtos e sua ordenação devem continuar sendo gerenciados no painel da loja.

**Marcas:** consulta ao menu da Loja Integrada encontrou 43 marcas publicadas e à vitrine de logotipos da home encontrou 5. `public/nichelle-brands.js` agora combina ambas as fontes: cinco logos prioritários no início, restantes marcas cadastradas em ordem, com fallback tipográfico para quem não tem imagem publicada. O carrossel horizontal dispõe de setas cíclicas e swipe no mobile; 43 URLs reais, nenhuma marca inventada. O campo `maxMarcas` foi ampliado para 60 por padrão.

**Preview:** `?nichelle_preview=1`. O tema Groom não controla o visual ou o slider das novas vitrines; a fonte de dados ainda é o HTML público renderizado pela plataforma, um adaptador em leitura.
