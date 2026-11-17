## Navegação e PDP mobile (17/11/2026)

- O tema LI injeta `<nav class="barra-mobile" aria-label="Menu inferior">`.
  **Somente na prévia e viewport <=767px**, `public/nichelle-header.js`
  remove essa barra (incluindo reinserções via MutationObserver). O
  `public/nichelle-header.css` também a esconde por segurança. Nunca tocar
  nela sem `nichelle_preview=1`.
- `#n27-head-nav` é a **única navegação inferior mobile**, fixa ao fundo
  com safe area, trilho horizontal e elementos de 65px. Ícones são 26px,
  tipografia 12px, gap 3px. A página reserva espaço inferior para evitar
  sobreposição do último conteúdo.
- `#n27-owned-drawer` abre e fecha com classe
  `n27-owned-drawer--visible`, painel deslizante e fundo em fade.
  `details/summary` são preservados, com acordeão animado por JS, foco
  e tecla Esc. Respeitar `prefers-reduced-motion`. Não quebrar links
  e destinos de categorias.
- A PDP mobile usa regras de `public/nichelle-pdp.css` dentro de
  `@media (max-width:767px)`: compartilhar/benefícios ocultos, galeria
  transparente, padding 14px, título 22px/400, preço alinhado à
  esquerda, parcelamento-full/WhatsApp ocultos, comprar em flex e
  `#descricao` com 30px de line-height.
- Nenhum novo CSS foi inserido nos HTMLs editável/fixo da LI. Os
  scripts/estilos continuam compondo o bundle Vercel. Validar mobile
  em home e PDP e o retorno de foco/estado da barra lateral.

## Instalação atual: cliente editável + motor fixo (17/11/2026)

**Os dois arquivos são fontes independentes e o CSS só existe nos respectivos
`public/*.css`. Nunca voltar a inserir CSS inline na Loja Integrada.**

1. `integracao/nichelle-modulos-admin.html` = **CLIENTE**: cinco grupos
   de configurações (`fullBanners`, `vantagens`, `miniBanners`,
   `galeriaShorts`, `noticiasHome`). Não inclui inicialização, CSS,
   integração, loaders ou hotfixes.
2. `integracao/nichelle-core-fixo.html` = **FWR**: settings estruturais
   e compatibilidade do tema, carregamento único `nichelle27.css/js`
   apenas na prévia e ajustes de ícones/Mini Banner. Não inclui CSS inline.

**Instalar no Cabeçalho/HEAD, com o EDITÁVEL primeiro e FIXO depois.**
No mesmo campo HTML da LI, os dois blocos juntos devem ser menores que
15.000 bytes UTF-8. Não manter o antigo HTML unificado instalado junto.
O CSS preflight está em `public/nichelle-isolation.css`; o bloco fixo
só adiciona `data-n27-preflight` na homepage em prévia.

Os ajustes visuais novos de `public/nichelle-home-benefits.css`,
`public/nichelle-pdp.css`, `public/nichelle-footer.css` e
`public/nichelle-cart-drawer.css` estão exclusivamente em
`@media(min-width:1025px)`. Nunca alterá-los no mobile.
Atrasos de deploy da Vercel não autorizam embutir CSS no HTML do cliente.

> **ESCOPO ATUAL (09/11/2026):** o pedido direto mais recente retoma dashboard FWR protegido para administrar somente a galeria customizada e publicar JSON sanitizado. Use `docs/04-DASHBOARD-SETTINGS-ARQUITETURA.md`, `docs/03-VIDEO-GALLERY-SPEC.md` e `docs/05-PLANO-DE-HOMOLOGACAO.md`. `docs/07-ARQUITETURA-SIMPLIFICADA-GIT-HTML.md` registra a decisão anterior sem painel e fica histórica nessa parte. O código Malheiro é referência técnica, NÃO executar na loja Nichelle.

# Codex — Nichelle Imports 2026

**EXECUTE PRIMEIRO:** [PROMPT_INICIAL_CODEX.md](./PROMPT_INICIAL_CODEX.md).

Os dois assets CDN enviados da Malheiro são a fundação escolhida para adaptação seletiva, combinada com a composição visual Nichelle demonstrada em `/preview/`. Não carregue o bundle bruto nem copie seletores, plugins ou efeitos comerciais da Malheiro. O delta, os hashes auditados e os limites do que está aplicado aos assets oficiais constam em `docs/04-DASHBOARD-SETTINGS-ARQUITETURA.md`. Não copiar produtos, mídia, URLs ou configuração comercial da Malheiro.

## Tipografia oficial — Montserrat (aprovada em 17/11/2026)

Toda a experiência Nichelle Imports 2026 usa **Montserrat** como família tipográfica principal,
em desktop e mobile (home, categorias, busca, produto, carrinho lateral, carrinho, topo e rodapé).
A família variável é carregada de Google Fonts com suporte a pesos **100–900**, normal e itálico:
`https://fonts.googleapis.com/css2?family=Montserrat:ital,wght@0,100..900;1,100..900&display=swap`.

Não alterar pesos, tamanhos, alturas de linha, espaçamentos ou hierarquia do layout aprovado
apenas por causa da troca de família. Nos novos estilos use
`font-family:"Montserrat",Arial,Helvetica,sans-serif` e mantenha o peso definido para cada
componente. Fontes de ícones (Font Awesome/Groom/ícones nativos) não devem ser substituídas.
O carregamento preferencial no HTML/Cabeçalho está documentado em
`integracao/montserrat-head.html`, com fallback automático de inicialização no
`public/nichelle27.js`. A camada visual só é ativada nos modos explicitamente
autorizados do projeto, sem modificar visitantes da loja em produção.

## Regra inegociável
Logo, banner principal, categorias, busca, minicart/carrinho, vitrines nativas, produto, estoque, preço e checkout **continuam na Loja Integrada**. O painel externo FWR controla **somente módulos customizados** desenvolvidos por nossa equipe, começando pela galeria editorial de 4 vídeos verticais prevista no briefing e posicionada visualmente após a faixa de marcas no layout final `index1.html`. A imagem confirma aparência/ordem; o slot funcional e a interação de vídeo ainda precisam de validação.

Referências:
- Loja: https://www.nichelleimports.com.br/
- Projeto 2026 (URL exata): https://projetos.fwragenciadigital.com.br/nichelle/2026/index1.html

O `index1.html` é a referência visual final do projeto. Se estiver acessível somente como screenshot/raster, mapear a composição visual, registrar essa limitação e não inferir DOM, funcionamento ou origem de gestão das seções sem confirmação.

## Git
Branch `develop` → PR Draft contra `main`. Nenhuma publicação na LI, nenhum merge sem aprovação. O repositório é privado; não presumir que raw GitHub, Pages ou jsDelivr servem código/JSON público.

## Dashboard
Sem controle de elementos nativos. Backend autenticado versiona configurações validadas e publica JSON público sanitizado em infraestrutura FWR. Frontend da LI consome apenas leitura, sem chaves e com fallback de layout estável.

**Status:** galeria e dashboard implementados em código de homologação na `develop`, com configuração pública desativada/vazia. Faltam host FWR validado, configuração real PHP, marcador no tema de homologação e URLs finais dos vídeos. Nenhuma publicação na loja foi feita.

## Vídeos YouTube Shorts

A galeria FWR aceita Shorts ou links YouTube normais. Imagem de capa automática derivada do próprio vídeo, com substituição opcional. Ver `docs/03-VIDEO-GALLERY-SPEC.md` e testes `tests/youtube-shorts.test.mjs`. Sem alterações em módulos nativos da Loja Integrada.


## FULLBANNER nativo — contrato de administracao

O hero `#n27-approved-hero` usa exclusivamente imagens e links publicados
na posicao **FULLBANNER** do painel da Loja Integrada. A implementacao
`public/nichelle-fullbanners.js` le o DOM nativo do tema, monta slider
com suporte a imagem mobile (`<picture>` e source) e respeita links e
ordem dos banners. O CSS e `public/nichelle-fullbanners.css`.
**Nao reintroduzir imagem fixa `hero-medicube.webp` como fallback.**
Sem Full Banner nativo, preservar a exposicao do proprio tema quando disponivel;
nao publicar banner ficticio.

O modulo unificado para colar no HTML/Rodape da loja esta em
`integracao/nichelle-modulos-admin.html`, com dados existentes das Vantagens
e do editorial e campos de Shorts vazios enquanto nao houver URLs reais.
Os Mini Banners continuam vindo SOMENTE do painel da LI.

## Home administrável — fonte oficial

- **Mini Banner:** a fonte de verdade são exclusivamente os Mini Banners publicados no painel nativo da Loja Integrada e presentes no DOM público. A vitrine FWR deve ler imagem, link, status e ordem dos elementos nativos. NÃO reintroduzir `mini-1.webp` a `mini-4.webp` ou URLs artificiais como fallback. Uma imagem nativa = um card FWR; sem imagem nativa, ocultar a vitrine. A implementação está em `public/nichelle-mini-banners.js`.
- **Benefícios/Vantagens:** `Nichelle27Settings.vantagens` editável no HTML da LI, com até quatro itens; se configurado manualmente, priorizar sobre JSON remoto.
- **Shorts:** `Nichelle27Settings.galeriaShorts` editável no HTML da LI; URLs e código de iframe só podem gerar embeds seguros YouTube/Vimeo. Nunca inserir HTML de iframe recebido como `innerHTML`.
- **Conteúdos para Você:** `Nichelle27Settings.noticiasHome` editável no HTML da LI; configuração atual prevalece sobre dados legados, sem criar links de artigos inexistentes.
- **CSS fino:** ajustes aprovados do header e footer foram incorporados exclusivamente em `@media(min-width:1025px)` em `public/nichelle-header.css` e `public/nichelle-footer.css`. Nunca propagar essas regras para mobile.
- **Blocos separados:** `integracao/nichelle-modulos-admin.html` (editável) e `integracao/nichelle-core-fixo.html` (fixo); instruções em `docs/NICHELLE-HOME-MODULOS-EDITAVEIS.md`.
- Preservar o controle por `?nichelle_preview=1` e os recursos nativos de preços, compra, estoque, frete e checkout.


## Mini Banner versus Banner Vitrine e FOUC (17/11/2026)

- A posição **Mini Banner** deve ser identificada EXPLICITAMENTE no HTML nativo (classes `.mini-banner`, `.banner-mini`, metadados de posição `mini`, ou nome `Mini Banner` na imagem). **NUNCA ler `.banners-extras` isoladamente** — essa área pode conter Banner Vitrine e outras imagens, gerando cards errados.
- Não confundir `Banner Vitrine` com Mini Banner; quando o tema não publicar elementos Mini, ocultar os cards, sem fallback para uma campanha de outra posição.
- O código completo exige **dois blocos colocados no HEAD (Código no cabeçalho)**: editável primeiro, fixo segundo. A montagem exclusiva de prévia tem preflight anti-FOUC em `public/nichelle-isolation.css` com classe/dataset no motor fixo e recuperação automática em 8s.
- A compatibilidade JS do motor fixo deve sobrescrever cards errados de versões antigas do bundle e desconectar ao detectar `window.NichelleMiniBanners.version >= 1.2.0`; o CSS deve permanecer exclusivamente externo.
- Não modificar visitantes sem prévia, preço, checkout, conta, carrinho ou a identidade visual mobile por causa desses ajustes.

