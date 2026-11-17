## Correção Mini Banner e carregamento antecipado (17/11/2026)

O componente Mini Banner não deve ler `.banners-extras` como fonte genérica:
essa estrutura pode conter **Banner Vitrine**, e causou a reprodução de
imagens erradas na posição Mini Banner. O leitor em
`public/nichelle-mini-banners.js` v1.2 passa a exigir posição/classe
explicitamente Mini Banner ou imagem com nome "Mini Banner". A compatibilidade
inline do HTML unificado usa o mesmo critério, incluindo quando o bundle
antigo estiver em cache.

**Instalação: substituir o bloco antigo por um único HTML atualizado,
na posição Código no Cabeçalho (HEAD)**. Deixar o script no Rodapé
causa flash do tema antigo antes de aplicar a prévia. O HTML contém
`n27-preview-early-guard` e um CSS crítico que oculta o tema antigo
apenas enquanto a HOME em `?nichelle_preview=1` está em montagem.
A proteção é desarmada quando `data-n27-approved=1` e possui fallback
automático em 8 segundos caso o JS não complete a inicialização.

No painel, um banner "Ativo" não garante que a posição seja exposta
pelo tema ativo no HTML público. Quando não houver nenhuma fonte Mini
válida, manter a seção oculta, sem roubar imagens de Banner Vitrine.

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

## Substituição segura do loader antigo

O HTML unificado `integracao/nichelle-modulos-admin.html` **substitui por
inteiro** o bloco antigo que começava com `<link
rel="stylesheet" .../nichelle27.css>` e terminava com `<script defer
src=".../nichelle27.js"></script>`.

A partir da revisão de 17/11/2026, ele inclui também as definições
compatíveis que estavam somente no loader antigo: `assetsBase`,
`geral`, `layout.ativo`, `layout.homologado:true`, `visual`,
`topo`, `rodape`, os módulos legados desativados,
`integracoes` e `FWRNichelle.galeriaVideos`. Mantém os Mini Banners
como fonte de dados **nativa da LI** e não inclui as quatro imagens fixas.

Procedimento: fazer backup do HTML anterior, apagar o bloco antigo inteiro,
inserir o HTML unificado **uma vez** no mesmo local e salvar.
Não deixar o `nichelle27.js` e o `nichelle27.css` separados se usar
o loader automático do novo bloco: ele os carrega uma única vez quando
`?nichelle_preview=1`. Verificar a home, uma PDP e o carrinho em prévia.
A configuração `publicarNaLoja:false` continua protegendo os visitantes comuns.

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

**Instalação:** incluir como código HTML na posição Cabeçalho (HEAD), preferencialmente em todas as páginas. O snippet preserva a configuração geral existente, insere o CSS/JS apenas se não estiverem carregados e exige `?nichelle_preview=1` para executar o visual da Nichelle. Evitar qualquer duplicação de blocos existentes.

## Comportamento dos Mini Banners

O código não abre nem acessa a sessão privada do painel administrativo. Os dados são lidos da superfície **pública, já publicada pela Loja Integrada**: `.row-fluid.banner.mini-banner`, `.banner.mini-banner` e variantes de classe e posição do tema. Isso significa:

- **1 banner ativo e publicado = 1 card visível**; para obter 4 cards, publicar 4 Mini Banners distintos no painel.
- O componente não produz banners fictícios, não carrega imagens estáticas `mini-1.webp` etc. e não inventa URLs.
- O link e a opção de abrir em nova aba vêm do banner da própria plataforma.
- Se o tema não emitir Mini Banners no HTML público, a seção ficará oculta até a fonte estar disponível. Nesse caso, o tema precisa expor a seção nativa; não há leitura direta de API administrativa autenticada.
- Até 4 banners. Desktop: grade de quatro posições. Mobile: mantém a rolagem horizontal já aprovada.
- Datas, visibilidade e ordem seguem o que a LI efetivamente publica, não uma segunda lista administrada pela FWR.

### Compatibilidade temporária no HTML unificado

Em 17/11/2026, o limite de deploys por API da Vercel impediu publicar
imediatamente o novo bundle `nichelle27.js`. O arquivo
`integracao/nichelle-modulos-admin.html` recebeu uma **compatibilidade
inline autodesativável**, que é executada somente em
`?nichelle_preview=1` e somente quando o módulo carregado da Vercel ainda
não for a versão **1.1.0 ou superior**.

Essa compatibilidade suporta Mini Banners publicados como `<img>` na
estrutura nativa `banners-extras`, classes Mini Banner ou atributo `alt`
(como **Mini Banner - One**). Ela também refaz a montagem quando o módulo
antigo substitui o slot durante os próprios retries. Não altera o
checkout, preços, estoque ou visitantes sem a flag.

Para usar enquanto a Vercel não publicar o novo bundle, o lojista deve
**substituir o bloco HTML unificado anteriormente colado pelo arquivo atual**
na mesma posição de Cabeçalho (HEAD). **Não duplicar os dois HTMLs.**
Quando o `nichelle27.js` novo estiver disponível na Vercel, o recurso
inline detecta a versão `1.1+` e deixa de executar.

## Diagnóstico do Mini Banner (tema nativo)

A partir de `public/nichelle-mini-banners.js` v1.1.0, o leitor captura
`.mini-banner`, `.minibanner`, `.banner-mini`, `.banner.mini`,
`.banners-extras`, imagens cujo texto alternativo inclua
**Mini Banner** (como **Mini Banner - One**, nome usado no cadastro)
e imagens publicadas como `background-image`. Também lê `data-src`,
`srcset` e `<picture>` para a versão mobile.

Na home `?nichelle_preview=1`, usar o console do navegador:

```js
window.NichelleMiniBanners?.diagnostico()
```

- `imagensNativas: 1` e `cardsVisiveis: 1`: imagem obtida do HTML da plataforma e card montado
- `raizesEncontradas: 0` e `candidatosPorNome: 0`: o tema **não publica o banner no HTML acessível ao navegador**, mesmo que apareça ativo no painel. É necessário conferir se o tema/disposição da loja oferece a posição Mini Banner e se a publicação é para a página inicial
- `slotExiste: false`: o layout principal da home não inicializou; conferir instalação única do HTML unificado e `?nichelle_preview=1`

O leitor não possui credenciais da API administrativa e não inventa a URL de banners ausentes. Não reintroduzir `mini1.webp` etc. como fallback; a fonte de verdade permanece o banner publicado no painel.

## Shorts e segurança

Vídeos Vimeo ou YouTube são transformados em iframe de domínios controlados, a partir de link ou iframe HTML fornecido. O HTML recebido **nunca é injetado diretamente**; outros hosts/JS não são aceitos. Para Vimeo, cadastre uma capa pelo Gerenciamento de Arquivos da Loja Integrada; o serviço não oferece imagem pública previsível para todos os vídeos privados.

## Conteúdos

O módulo não cria artigos no painel nem inventa links. Crie e publique as páginas de conteúdo, envie as imagens ao Gerenciamento de Arquivos e depois preencha os respectivos caminhos no HTML editável. A configuração explicitamente cadastrada vence os dados de demonstração e o legado.

## Ajustes de desktop

Os ajustes de cabeçalho e rodapé entregues pelo cliente foram incorporados aos arquivos-fonte `public/nichelle-header.css` e `public/nichelle-footer.css`, **apenas em `@media(min-width:1025px)`**. O CSS mobile existente não foi modificado. A largura principal de 1540px e a família Montserrat são mantidas.

## Homologação

Testar na home com `?nichelle_preview=1`. Verificar publicação de um e depois quatro mini banners, destino dos links, ordem, menu, WhatsApp, vídeo, notícias, scroll, a largura de 1024 e 1025px e mobile em 320, 360, 390 e 428px. As funções de preço, estoque, carrinho e checkout da LI não foram alteradas por estes módulos.
