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
