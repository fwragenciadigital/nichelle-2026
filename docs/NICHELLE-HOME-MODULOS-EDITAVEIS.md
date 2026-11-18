# Nichelle Imports 2026 — módulos editáveis e motor fixo

> Fonte oficial: branch `develop` do repositório `fwragenciadigital/nichelle-2026`.
> Loja: `https://www.nichelleimports.com.br/?nichelle_preview=1`.
> O visual experimental exige `?nichelle_preview=1` e `publicarNaLoja:false`.

## Instalação no editor HTML da Loja Integrada

O projeto foi dividido em **dois blocos independentes**, nenhum deles possui CSS inline:

1. **01 — Editável pelo cliente:** [`integracao/nichelle-modulos-admin.html`](../integracao/nichelle-modulos-admin.html)
2. **02 — Fixo FWR:** [`integracao/nichelle-core-fixo.html`](../integracao/nichelle-core-fixo.html)

Na Loja Integrada, usar **Visual → Incluir código HTML → Modo avançado → Código no cabeçalho (HEAD)**, para todas as páginas. Se houver **um único campo**, colar os dois conteúdos **na ordem 01, depois 02** no mesmo campo. Se permitir blocos separados, manter a mesma ordem. Ambos juntos ocupam menos de 15.000 bytes UTF-8; o editor não deve conter nenhuma cópia antiga do HTML unificado, do loader `nichelle27.js` ou de CSS hotfix. Fazer backup antes da substituição.

**Importante:** apenas o arquivo 01 deve ser entregue para manutenção editorial do cliente. O arquivo 02 é de responsabilidade da FWR; não editar sem acompanhamento técnico. Quando alterado na branch `develop`, o HTML do painel não muda automaticamente: é necessário colar novamente.

## O que o cliente pode editar (arquivo 01)

| Módulo | Campo | Fonte de conteúdo |
|---|---|---|
| FULLBANNER | `s.fullBanners`: ativo, autoplay, intervalo, limite | Imagens, links e agenda no **painel nativo > Banners > Full Banner** |
| Benefícios / Vantagens | `s.vantagens`: etiqueta, ícone, título, descrição, link (4 itens) | Editável no HTML do cliente |
| Mini Banner | `s.miniBanners`: ativo, limite e `itens` opcionais | Prioriza a posição Mini Banner nativa; se ausente no DOM do tema, permite informar URL de imagem/link no HTML editável |
| Link Vídeo / Iframe Shorts | `s.galeriaShorts.itens`: `videoUrl`, `iframe`, `capa`, `titulo` | URLs reais Vimeo/YouTube; capas na CDN LI |
| Conteúdo para Você | `s.noticiasHome.itens`: foto, título, texto, data, link | Campos editoriais no HTML do cliente |
| Parcelamento do carrinho | `s.paginaCarrinhoFWR.parcelasMaximasSemJuros` | Máximo de parcelas apresentado no resumo; atualmente 6 conforme vitrine da Nichelle. Valor é simulado pelo total nativo, sujeito ao checkout. |

Não criar links falsos para artigos ou vídeos. Shorts sem URL real permanecem sem conteúdo publicado. A vitrine Mini Banner **não** deve usar `.banners-extras` como fonte genérica, porque essa estrutura também pode conter Banner Vitrine. O tema LI precisa publicar os elementos Mini Banner no DOM; ter um banner ativo no painel não garante, por si só, sua presença no HTML.

### Mini Banner não disponível no HTML do tema

O diagnóstico informado em 17/11/2026 retornou `imagensNativas:0`,
`raizesEncontradas:0`, `candidatosPorNome:0` e `cardsVisiveis:0`,
embora o Mini Banner esteja ativo no painel. **Isso não prova que o
banner esteja desativado**: mostra que o tema publicado não entregou a
imagem nas estruturas públicas identificáveis pelo navegador.

A partir de `public/nichelle-mini-banners.js` 1.3.0, o cliente pode
preencher no bloco 01, em `s.miniBanners.itens`, a URL HTTPS real da
imagem (`imagem`), a imagem mobile opcional (`imagemMobile`), o
destino (`link`), o texto alternativo (`alt`) e `novaAba`.

* Fonte prioritária: Mini Banner **nativo** reconhecido no DOM da LI
* Se nativo não existe: itens reais explicitamente cadastrados no HTML
* Se ambos ausentes: seção oculta
* **Nunca** substituir por Banner Vitrine ou inventar imagem/link

O bloco 02 contém compatibilidade para o bundle 1.2.0 que já estava
publicado na Vercel; desativa-se ao detectar o leitor 1.3.0 ou superior.
Instalar os dois blocos atualizados na mesma ordem (cliente antes de
motor). Juntos estão abaixo de 15 mil bytes UTF-8. Se a prioridade é
administrar exclusivamente no painel de Banners, a alternativa é
habilitar essa posição no tema da LI, de forma que apareça no DOM
público; a API oficial exige autenticação e não deve expor chaves no
código HTML da loja.

### Carrinho e página de produto — revisão do resumo

O resumo visual do carrinho FWR `public/nichelle-cart-page.js` não duplica
mais a linha **Subtotal dos produtos**. Logo abaixo do Total do pedido,
exibe `até Nx de R$ valor sem juros`, calculado a partir do total
nativo atualizado. O máximo `N` é editável no arquivo 01, atualmente
6. Essa linha é uma estimativa comercial, **não é uma promessa de
aprovação de parcelamento**. Condições definitivas continuam no checkout
da Loja Integrada; a FWR não cria novos pagamentos, fretes ou cupons.

A tipografia do título do carrinho, total, Pix e nome dos produtos fica
em `public/nichelle-cart-page.css`. A borda do campo CEP e o valor Pix
na página de produto ficam em `public/nichelle-pdp.css`. Os novos
ajustes de fontes são exclusivos do desktop (`min-width:1025px`).
Não adicionar CSS nos arquivos HTML editável e fixo.

### Revisão da home e carrinho — 18/11/2026

A implementação atual (branch `develop`) inclui:

- Hover discreto em imagens do fullbanner, mini banners e editorial com
  `transform` apenas em desktop (respeita `prefers-reduced-motion`),
  em `public/nichelle-fullbanners.css` e `public/nichelle-approved.css`.
- Barra inferior mobile do `#n27-head-nav` em cinco atalhos:
  **Início, Buscar, Categorias, Ofertas e Conta**. O atalho **Categorias**
  abre o drawer FWR original com todas as categorias e subcategorias.
  A barra nativa `.barra-mobile` é removida exclusivamente no preview.
- Ícones individuais em cada link dos dropdowns **Atendimento** e
  **Meu Painel**, além do indicador de expansão dos respectivos resumos.
- No carrinho, barra de título `#8000a5` e caixa Pix com gradiente
  claro; os textos também ficam escuros para manter contraste.
- Oferta flutuante à esquerda, configurada em
  `s.primeiraCompra={ativo:true,codigo:"PRIMEIRACOMPRA",percentual:10}`.
  Clique no código guarda a seleção nesta aba. Ao abrir um carrinho com
  produtos, o JS envia **uma vez** o código ao formulário nativo LI de
  validação ou ao endpoint nativo `/carrinho/cupom/validar`.
  Não modifica preços, frete ou cupons manualmente, e não substitui
  promoção já aplicada. O desconto está sujeito ao cupom existir, estar
  ativo e respeitar as condições cadastradas em **Marketing > Cupons de
  desconto**; a efetivação precisa ser verificada no carrinho real.
- O novo módulo está separado em
  `public/nichelle-first-order-coupon.js` e
  `public/nichelle-first-order-coupon.css`, ambos incorporados pelo
  `vercel/build.mjs`.

**Deploy temporário sem Vercel:** a branch
`cdn-temporaria-nichelle-20261117` armazena JS/CSS compilados em
`integracao/cdn-temporaria` e o arquivo
`nichelle-core-fixo-jsdelivr.html`, com os assets congelados no commit
da mesma branch que continha ambos os bundles atualizados.
Não é necessário trocar os dois blocos HTML para atualizar o GitHub:
o bloco fixo deve ser **republicado manualmente** no admin LI quando
mudar a URL versionada da CDN, e depois revertido à versão Vercel
somente após confirmar que o deploy `develop` está READY.

### Categorias, busca e ajustes mobile — 18/11/2026

A listagem das categorias, marcas e busca ganhou os módulos
`public/nichelle-listing.js` e `public/nichelle-listing.css`,
integrados ao `vercel/build.mjs`. O novo visual segue a vitrine
`n27-best-card` aprovada: imagens em fundo branco, selo violeta,
nome em duas linhas, preço original/promocional lado a lado, parcelas
e bloco Pix com divisor. Lê apenas dados reais dos produtos nativos LI.

- Desktop: cinco produtos por linha em largura grande, quatro entre
  1150–1500px e três em tablet 768–1149px.
- Mobile: duas colunas, preços/parcelas legíveis e área de toque dos
  produtos preservada.
- Filtros, busca, ordenação, paginação e formulários oficiais
  permanecem no DOM original. A listagem visual própria só substitui
  o bloco nativo quando **todos os produtos encontrados** têm imagem,
  URL e preço válidos; caso contrário, mantém-se o layout nativo.
- Ajustes CSS refinados mobile no header: logo 170x60, imagem a 100%,
  barra fixa 75px (atalhos de 65px), botão central de 66px,
  contorno #bc1bea e texto em caixa alta.
- Cupom flutuante: bottom 5% no desktop; no mobile bottom 60px,
  largura 70px e painel flutuante ajustado para caber na viewport.

O projeto possui versão temporária independente da Vercel na branch
`cdn-temporaria-nichelle-20261117`. O arquivo
`integracao/cdn-temporaria/nichelle-core-fixo-jsdelivr.html`
fixa o snapshot CDN que inclui as atualizações. Não transformar a
prévia em produção sem homologação visual e teste real do carrinho
e do cupom.

## O que fica fixo (arquivo 02)

- Inicialização de `window.Nichelle27Settings`, com `geral.ativo:true`, `modoPreview:true`, `publicarNaLoja:false`, `layout.homologado:true` e configurações legadas compatíveis
- Loader único da Vercel `nichelle27.js` / `nichelle27.css`, somente na prévia
- Preflight `data-n27-preflight` da homepage, com recuperação automática em 8 segundos
- Compatibilidade de Mini Banner para bundles antigos, restrita às imagens explicitamente identificadas como Mini
- Compatibilidade dos ícones oficiais `userrr.svg`, `chattt.svg`, `carttt.svg`

Nenhum dos módulos de configuração cria ou altera preços, estoque, variações, frete, autenticação ou checkout nativo da Loja Integrada.

## CSS: somente arquivos-fonte externos

**Não inserir `<style>`, atributos `style=` ou hotfixes CSS no editor HTML da LI.** Todos os estilos são versionados e concatenados pelo `vercel/build.mjs` em `/nichelle27.css`.

| Arquivo CSS | Responsabilidade |
|---|---|
| `public/nichelle-home-benefits.css` | Títulos e subtítulos de Vantagens; subtítulo em Montserrat 700 / cinza #565656 |
| `public/nichelle-pdp.css` | Produto: mídia, título, Pix, botões, preço, CEP, compartilhamento |
| `public/nichelle-footer.css` | Rodapé institucional e padding `0 30px` da descrição |
| `public/nichelle-cart-drawer.css` | Carrinho lateral: texto, fundo branco, borda inferior #ebebeb, botão fechar #e7e7e7, `.n27-cart__feedback` oculto |
| `public/nichelle-isolation.css` | Isolamento da prévia e anti-FOUC |

As regras visuais de PDP, Vantagens, footer e drawer aprovadas nesta entrega estão sob `@media(min-width:1025px)` e **não alteram o mobile**. O CSS de preflight é independente do breakpoint, porém fica ativo apenas na home com a flag de prévia.

## Atualização da Vercel

O alias do projeto é `nichelle-2026-git-develop-fwragenciadigitals-projects.vercel.app`. O build lê os arquivos CSS em `develop` e concatena tudo em `/nichelle27.css`. **Uma gravação no GitHub não garante imediatamente um deploy READY.** Não dizer que a loja já recebeu os estilos sem conferir o commit do alias. Em caso de cota de deploy esgotada, aguardar liberação da Vercel ou resolver a limitação da conta; não voltar a incorporar CSS no HTML.

## Conferência mínima

Conferir, após publicação do bundle mais recente, a home e um PDP desktop (>=1025px), drawer de carrinho aberto, footer e títulos de Vantagens; em seguida conferir um mobile (<=767px), sem regressões de compra, seleção de variações, cupom, frete e checkout. Validar que a home sem `nichelle_preview=1` permanece inalterada.
