# Nichelle 2026 — módulos administráveis da home

## FULLBANNER — fonte de verdade

O módulo `public/nichelle-fullbanners.js` não contém a antiga arte fixa Medicube.
Na home de prévia, ele lê os elementos dos **Full Banners publicados** que o
tema da Loja Integrada coloca no DOM, normalmente em
`.secao-banners .banner.cheio`. O slider FWR usa as imagens, links,
ordem e variantes mobile encontradas ali. Com mais de um banner, exibe
navegação, indicadores e autoplay configurável (`fullBanners.intervalo`).
Com nenhum Full Banner válido, não cria publicidade fictícia e deixa
o banner nativo disponível como fallback, quando o tema o oferece.

O comportamento é exclusivo de `?nichelle_preview=1`. Não faz requisição
ao painel autenticado ou a endpoints privados da LI e não substitui
nenhum cadastro nativo.

**HTML completo:** `integracao/nichelle-modulos-admin.html` — bloco
editável que contém configurações dos cinco elementos (incluindo Full Banner)
e carrega o bundle CSS/JS somente se ainda não estiver instalado. Em uma loja
com o bundle existente, não duplicar sua instalação. Instalar em
**Visual > Incluir código HTML > Modo avançado > Rodapé**, de preferência
para todas as páginas, para manter cabeçalho, rodapé e PDP compartilhados.

## Onde editar

| Módulo | Edição | Fonte consumida pela vitrine |
|---|---|---|
| Full Banner | **Painel > Banners > Full Banner** | Somente banners publicados e imagens mobile disponíveis na saída HTML nativa do tema |
| Benefícios / Vantagens | **Visual > Incluir código HTML** da Loja Integrada, na seção `Nichelle27Settings.vantagens` | Até 4 títulos, descrições, ícones permitidos e links configurados no HTML da loja; JSON externo é alternativa |
| Mini Banner | **Painel > Banners > Mini Banner** | Somente mini banners publicados e efetivamente renderizados no HTML nativo da loja; imagem, link, status, datas e ordem são controlados pelo painel |
| Link Vídeo / Iframe Shorts | **Visual > Incluir código HTML**, seção `Nichelle27Settings.galeriaShorts`, ou galeria-publicada.json | Links YouTube/Vimeo ou src de iframe de um desses provedores; capa e título editáveis |
| Conteúdo para Você | **Visual > Incluir código HTML**, seção `Nichelle27Settings.noticiasHome` | Até 3 artigos com título, resumo, foto, data e URL publicada na mesma loja |

### Script de configuração
Use o arquivo [integracao/nichelle-modulos-admin.html](../integracao/nichelle-modulos-admin.html) como ponto de edição único — configura Full Banner, Benefícios/Vantagens, Mini Banner, Shorts e Conteúdos para Você.

**Instalação:** incluir como código HTML na posição Rodapé, preferencialmente em todas as páginas. O snippet preserva a configuração geral existente, insere o CSS/JS apenas se não estiverem carregados e exige `?nichelle_preview=1` para executar o visual da Nichelle. Evitar qualquer duplicação de blocos existentes.

## Comportamento dos Mini Banners

O código não abre nem acessa a sessão privada do painel administrativo. Os dados são lidos da superfície **pública, já publicada pela Loja Integrada**: `.row-fluid.banner.mini-banner`, `.banner.mini-banner` e variantes de classe e posição do tema. Isso significa:

- **1 banner ativo e publicado = 1 card visível**; para obter 4 cards, publicar 4 Mini Banners distintos no painel.
- O componente não produz banners fictícios, não carrega imagens estáticas `mini-1.webp` etc. e não inventa URLs.
- O link e a opção de abrir em nova aba vêm do banner da própria plataforma.
- Se o tema não emitir Mini Banners no HTML público, a seção ficará oculta até a fonte estar disponível. Nesse caso, o tema precisa expor a seção nativa; não há leitura direta de API administrativa autenticada.
- Até 4 banners. Desktop: grade de quatro posições. Mobile: mantém a rolagem horizontal já aprovada.
- Datas, visibilidade e ordem seguem o que a LI efetivamente publica, não uma segunda lista administrada pela FWR.

## Shorts e segurança

Vídeos Vimeo ou YouTube são transformados em iframe de domínios controlados, a partir de link ou iframe HTML fornecido. O HTML recebido **nunca é injetado diretamente**; outros hosts/JS não são aceitos. Para Vimeo, cadastre uma capa pelo Gerenciamento de Arquivos da Loja Integrada; o serviço não oferece imagem pública previsível para todos os vídeos privados.

## Conteúdos

O módulo não cria artigos no painel nem inventa links. Crie e publique as páginas de conteúdo, envie as imagens ao Gerenciamento de Arquivos e depois preencha os respectivos caminhos no HTML editável. A configuração explicitamente cadastrada vence os dados de demonstração e o legado.

## Ajustes de desktop

Os ajustes de cabeçalho e rodapé entregues pelo cliente foram incorporados aos arquivos-fonte `public/nichelle-header.css` e `public/nichelle-footer.css`, **apenas em `@media(min-width:1025px)`**. O CSS mobile existente não foi modificado. A largura principal de 1540px e a família Montserrat são mantidas.

## Homologação

Testar na home com `?nichelle_preview=1`. Verificar publicação de um e depois quatro mini banners, destino dos links, ordem, menu, WhatsApp, vídeo, notícias, scroll, a largura de 1024 e 1025px e mobile em 320, 360, 390 e 428px. As funções de preço, estoque, carrinho e checkout da LI não foram alteradas por estes módulos.
