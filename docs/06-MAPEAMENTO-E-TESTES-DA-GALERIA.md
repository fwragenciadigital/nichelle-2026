# Mapeamento final — Galeria FWR Nichelle

## Fronteira de gerenciamento

| Área | Responsável | Controle no dashboard FWR |
|---|---|---|
| Logo/cabeçalho, busca, menus/categorias, hero/banner principal | Loja Integrada | Nenhum |
| Vitrines, produtos, preços/descontos, estoque/variações | Loja Integrada | Nenhum |
| Carrinho/minicart, frete e checkout | Loja Integrada | Nenhum |
| Faixa de marcas, tiles, conteúdo/blog, newsletter e Instagram | Indefinido até validar origem na LI | Nenhum nesta fase |
| Galeria editorial de quatro vídeos após a faixa de marcas | FWR | Único módulo incluído |

O layout raster de `index1.html` é a referência visual final. No desktop, a galeria tem quatro cards 9:16 com capa, overlay e botão play central. O HTML raster não prova a interação ou o layout mobile; a implementação usa scroll-snap móvel como candidato de homologação.

## Componentes e campos do módulo

| Componente/campo | Tipo e edição | Regra/efeito |
|---|---|---|
| Galeria `enabled` | Checkbox | Só é publicada ativa com quatro vídeos ativos |
| Cartões | Lista ordenada, máximo 4 | Ações adicionar/remover/subir/descer; grava `order` determinístico |
| `items[].videoUrl` | URL | HTTPS; hosts YouTube oficiais; Shorts, `watch` e `youtu.be`; grava forma canônica `/shorts/ID` |
| `items[].posterUrl` | URL opcional | Capa personalizada em HTTPS, sem parâmetros sensíveis e em hostname da allowlist do servidor |
| Thumbnail automática | Derivada do ID YouTube | Tenta `oar2.jpg`, `oardefault.jpg`, `hqdefault.jpg`, então fallback visual |
| `items[].alt` | Texto, 5–180 caracteres | Descrição acessível da capa; se vazio, o painel sugere descrição genérica editável |
| `items[].enabled` | Checkbox | Vídeos inativos não aparecem; publicação exige quatro ativos |

Não há campos para mídia MP4/Vimeo, URLs de produto, preço, estoque, HTML/JS arbitrário, CSS, logo, banner, categorias ou vitrines. A imagem de capa enviada ao CDN do YouTube pode não existir para todo vídeo; nesse caso, o cliente pode fornecer uma capa personalizada aprovada.

## Integração e comportamento

- `public/galeria-videos.css`: classes prefixadas `fwr-nichelle-*`; 4 colunas a partir de 768px, scroll-snap abaixo; card sempre 9:16, sem deformar poster.
- `public/galeria-videos.js`: uma inicialização global idempotente; JSON público de leitura; falha segura se schema/config/slot estiver ausente; iframe `youtube-nocookie.com` só nasce após click.
- Modal: botão de fechar, clique no overlay, Escape, foco inicial no botão e retorno ao botão do card; remoção do iframe ao fechar encerra a reprodução.
- `admin/index.php`, `admin/preview.php`, `admin/draft.php`: editor protegido, prévia autenticada e endpoint privado sem cache.
- `server/bootstrap.php`: senha verificada por hash, CSRF, sessão segura, rate-limit com lock, validação estrita e diretório privado externo ao document root.
- Slot necessário no HTML inicial da home: `<div id="fwr-nichelle-video-slot" class="fwr-nichelle-video-slot"></div>`; deve ser inserido após a faixa “Compre as Melhores Marcas” e antes da vitrine “Produtos Promocionais”. O tema real ainda não foi inspecionado para confirmar esse ponto de extensão.
- CSS reserva altura aproximada nesse slot antes da requisição do JSON. Isso reduz CLS se o marcador for renderizado no HTML inicial. A medição de fixture não substitui comparativo de CLS/LCP/INP no tema da LI; módulo desligado/offline pode deixar o espaço reservado vazio.

## HTML/Cabeçalho e HTML/Rodapé

Snippets preparados: `integracao/cabecalho-teste.html`, `integracao/rodape-teste.html`, `integracao/cabecalho-producao.html` e `integracao/rodape-producao.html`. O CSS é referenciado no Cabeçalho; runtime e JSON são referenciados no Rodapé. Eles ainda contêm `BASE_URL_PUBLICA`: não existe host FWR verificado, então não há URLs CSS/JS/config prontas para colar.

Instalação em homologação, depois que a FWR disponibilizar host e tema:

1. Fazer backup dos campos HTML/Cabeçalho, HTML/Rodapé e CSS.
2. Confirmar no HTML inicial da home o slot requerido no ponto visual correto. Se o tema não permitir inserir esse slot sem script tardio ou seletor frágil, parar e rever o mecanismo.
3. Publicar arquivos `public/galeria-videos.css`, `public/galeria-videos.js` e `public/galeria-preview.json` em host HTTPS; habilitar CORS para a origem de homologação, MIME corretos, cache/versionamento conhecidos e acesso público somente leitura.
4. Substituir `BASE_URL_PUBLICA` pelos URLs absolutos do host aprovado. Colar `cabecalho-teste.html` em HTML/Cabeçalho e `rodape-teste.html` em HTML/Rodapé. Esse snippet é um smoke test público, lê apenas `galeria-preview.json` vazio e não autentica rascunhos; nunca colocar conteúdo privado ali. A prévia privada usa `admin/preview.php` e `admin/draft.php` na mesma origem PHP, com sessão autenticada. A fixture de teste e seus IDs sintéticos não são conteúdo para a loja.
5. Validar rede, CORS, console, breakpoints e fluxo de preview sem alterar componentes nativos. Após aprovação, trocar pelos snippets `cabecalho-producao.html` e `rodape-producao.html`, com config publicada. Só depois disso configurar backend/admin real e links de vídeo oficiais.

Não usar URL de repositório privado como CDN e não colocar senha/token administrativo nesses snippets. A mudança no dashboard só chega à loja quando o endpoint público for atualizado e o cache propagado.

## Evidências e limites

- `node --test tests/*.test.mjs`: 13 testes passaram após as correções locais; inclui parser de URL, schema, configuração pública vazia, fallback e player sob clique.
- Chrome headless/Chromium foi executado em fixture local nos viewports 360, 390, 820 e 1440px. Foram observados quatro cards, 9:16, scroll horizontal só abaixo de 768px, iframe somente após clique, foco preso ao modal (Tab/Shift+Tab), botão e Escape fechando, foco restaurado, fundo inerte, fallback em thumbnail ausente, zero iframes iniciais, CLS medido `0` no fixture, configuração vazia sem galeria e rede offline sem galeria.
- A fixture usa IDs sintéticos de 11 caracteres exclusivamente em `tests/fixtures/`; eles não estão nas configurações publicadas/preview e não são vídeos reproduzíveis. **Playback de vídeos reais não foi verificado** porque os quatro links ainda não foram fornecidos.
- PHP CLI não está instalado neste ambiente. Portanto, `php -l`, autenticação, sessões, gravação/rollback e concorrência do endpoint não foram executados localmente; devem passar no CI com PHP e ser confirmados no host FWR.
- Não houve login em Loja Integrada, instalação/publicação, alteração de loja, compra, alteração de `main` ou merge da PR.
