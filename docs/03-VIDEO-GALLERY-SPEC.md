# Componente personalizado 01 — galeria editorial de vídeos

## Status e evidência

Esta é a primeira seção `CUSTOM-FWR` prevista no escopo do projeto. O briefing define uma galeria editorial de **quatro vídeos** e a arte final em `index1.html` confirma a aparência e a posição visual; não confirma os controles de reprodução, URLs ou layout móvel real.

- **Posição na arte:** entre a faixa “Compre as Melhores Marcas” e a vitrine “Produtos Promocionais”.
- **Aparência observada:** quatro cards verticais lado a lado, proporção aproximada 9:16, posters de produtos Medicube, cantos arredondados, leve overlay escuro e ícone triangular branco de play central. Não há título aparente sobre os cards.
- **Limitação da fonte:** `index1.html` entrega uma imagem longa, não DOM funcional da galeria. O clique, o vídeo aberto, o modo mobile, as URLs e os estados de erro não foram observados.
- **Mídia:** URLs finais ainda serão fornecidas. O manifesto `assets/MANIFESTO.md` registra os metadados a coletar; não usar URLs fictícias ou mídia de outra loja.

## Contrato de Settings implementado

Nomes de campo alinhados ao `config/schema.json`. O dashboard edita somente este módulo.

| Campo | Tipo | Regra inicial |
|---|---|---|
| `enabled` | boolean | `false` nos defaults; ativar somente após aprovação e homologação |
| `placement` | enum | `pending` no default ou `after-brand-strip` após validação do slot LI. Nenhuma outra posição faz parte da V1; não aceitar seletor CSS livre |
| `mobileMode` | enum | `scroll-snap` na implementação candidata abaixo de 768px; validar no tema de homologação |
| `openMode` | enum | `modal` na implementação; não inicia até clique |
| `items` | lista ordenável | Schema permite até quatro itens. Quando `enabled=true`, exatamente quatro itens precisam estar ativos; o schema valida a contagem |
| `items[].id` | string | Identificador em slug; validar unicidade também na publicação |
| `items[].enabled` | boolean | Controle de exibição do card |
| `items[].order` | inteiro | Define ordem; ordenar de forma determinística |
| `items[].provider` | enum | Somente `youtube`; URL deve ser Shorts, watch ou youtu.be com ID válido de 11 caracteres e host oficial |
| `items[].posterUrl` | URL | Opcional; thumbnail YouTube automática se vazio; capa própria aceita apenas HTTPS em host na allowlist do servidor |
| `items[].videoUrl` | URL | HTTPS; aceita link YouTube Shorts, watch e youtu.be; gravada como URL canônica Shorts sem query tracking |
| `items[].alt` | string | Descrição acessível do poster; 5–180 caracteres no schema |
V1 não aceita HTML, CSS, JS, iframes, seletores, provedores adicionais ou links arbitrários no formulário. O layout aprovado tem quatro cards ativos; mudar quantidade ou posição exige revisar e aprovar o layout e o schema.

## Comportamento implementado

- Poster primeiro; dimensões 450 × 800 e proporção 9:16 reservam cada card. A imagem personalizada ou thumbnail não pode redimensionar o card.
- Clique/tap explícito cria o iframe privacy-enhanced; sem autoplay antecipado. Ao fechar, o `src` é removido para encerrar o player.
- Modal tem botões de fechar antes e depois do iframe, Escape, foco inicial e retorno ao gatilho. O conteúdo de fundo fica `inert` enquanto aberto.
- Cards são botões acessíveis por teclado com foco visível, descrição alternativa e rótulo de reprodução. Poster quebrado mostra fallback visual sem ícone de imagem inválida.
- Nenhum link de produto é oferecido no módulo; preço, estoque e fluxo de compra continuam nativos da Loja Integrada.
- Não criar sobreposição fixa que cubra menu, carrinho, checkout ou conteúdo interativo nativo.

## Responsividade e integração

- **Desktop:** quatro cards em uma linha, conforme a arte final.
- **Mobile/tablet:** a arte rasterizada mantém 1250 px de largura e corta conteúdo nos viewports menores; ela não informa o comportamento responsivo de produção. A implementação candidata usa scroll-snap abaixo de 768px, sujeito à aprovação visual na LI.
- **Slot:** runtime usa o alvo fixo `#fwr-nichelle-video-slot`; o tema precisa fornecer esse slot e a classe `.fwr-nichelle-video-slot` no ponto visual certo. O mecanismo de inserção no tema LI ainda não foi inspecionado; nunca localizar por texto/copy frágil nem aceitar seletor editável pelo cliente.
- **Integração remota:** código e mídia servidos por infraestrutura pública aprovada da FWR; `published.json` em HTTPS, CORS explícito, MIME JSON, versão/cache/ETag documentados. O browser da loja só lê configuração pública sanitizada.
- **Hosts de mídia:** HTTPS não basta. O backend aplica allowlist de host para capas personalizadas (`NICHELLE_POSTER_HOSTS`), remove query tracking da URL do vídeo ao canonicalizar e recusa parâmetros com credenciais/assinaturas na capa.

## Estados estáveis e risco de CLS

| Estado | Comportamento exigido | Risco a controlar |
|---|---|---|
| Configuração válida e lista com quatro ativos | Usar slot com geometria reservada e montar cards sem deslocar o conteúdo seguinte | Imagens devem respeitar proporção; vídeo não participar do layout antes do clique |
| Configuração válida, módulo desligado ou sem itens ativos | Não montar cards; permanece a altura reservada no slot inicial | O slot vazio pode deixar espaço em branco; recolher tarde deslocaria a vitrine |
| JSON lento, inválido ou indisponível | Não montar cards; runtime registra aviso e mantém o slot reservado sem tocar na estrutura nativa | O espaço reservado vazio continua sendo um trade-off visual do estado offline |
| Poster lento/quebrado | Preservar a caixa 9:16, mostrar fallback de mídia e permitir retry/não reprodução | Não deixar dimensões intrínsecas mudarem a altura do card |
| Vídeo iniciado | Carregar recurso somente após intenção; manter dimensões do card/modal | Evitar redimensionamento, autoplay e downloads de vários vídeos |

Se o tema não fornecer o slot/reserva no HTML inicial, não instalar esta integração assíncrona. A altura do slot foi medida em fixture local, não no tema real da Loja Integrada.

## Aceite antes de liberar

- Quatro URLs reais de posters e vídeos, direitos/uso aprovados, HTTPS e allowlist validados sem modificar as URLs.
- Slot e comportamento mobile aprovados; preview coerente com a arte de referência.
- Reprodução/accessibilidade testadas em desktop e iOS/Android; poster e configuração falhos cobertos.
- Evidência de laboratório de estabilidade geométrica/CLS para config vazia, normal, lenta e indisponível; comparar com baseline real antes de qualquer publicação.
- Nenhuma regressão em header, navegação, vitrine, produto, preço, carrinho, frete ou checkout.

## Atualização — YouTube Shorts e capa automática

- O cliente poderá colar diretamente uma URL de YouTube Shorts, `youtube.com/watch?v=...` ou `youtu.be/...`; **não é preciso carregar arquivo MP4 nem imagem da capa separada**.
- O código valida domínio oficial e extrai o ID de 11 caracteres. No clique, o player é `youtube-nocookie.com/embed/VIDEO_ID`, com iframe criado somente na interação; não carregar player pesado antes do clique. <https://support.google.com/youtube/answer/171780>
- Para a imagem de preview, o runtime tenta o thumbnail vertical `https://i.ytimg.com/vi/ID/oar2.jpg`, depois `oardefault.jpg` e `hqdefault.jpg` como fallback. O CDN pode não disponibilizar a versão vertical para todos os vídeos. **A capa personalizada continua opcional** e será preferida quando informada.
- O formato URL do CDN (`oar2.jpg` e nomes de fallback) é uma convenção observada, não a URL garantida pelo contrato da API. A [referência oficial de thumbnails do YouTube Data API](https://developers.google.com/youtube/data/reference/rest/v3/thumbnails?hl=en) descreve `shortsAspectRatio` nos dados retornados pela API; obter essa URL exige integração servidor-side e credencial própria, não configurada nesta entrega. Por isso a implementação inclui capa personalizada e fallback e precisa validar as quatro URLs reais em homologação.
- As imagens de capa permanecem no frame `aspect-ratio:9/16` com `object-fit:cover`; sem mudanças geométricas ao carregar, evitando CLS do componente.
- **Atenção à privacidade:** thumbnail externo `i.ytimg.com` pode ser solicitado antes do clique, respeitando lazy-loading; o player só se conecta ao YouTube quando solicitado. Confirmar adequação do banner de consentimento e política da loja.
- Os links definitivos de Shorts ainda serão fornecidos; não inventar URLs, vídeos ou títulos. Testar se o proprietário permite incorporação e se há restrição de idade/território.
