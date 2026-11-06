# Componente personalizado 01 — Galeria de vídeos / UGC

## Referência visual entregue

Captura de tela com **quatro cards verticais** lado a lado em fundo branco; posters exibem produtos da marca Medicube, com camadas de contraste escurecido, cantos arredondados e triângulo branco de play central em cada card. Proporção aproximada 9:16, espaçamento igual. O recorte **não informa** posição no layout completo, interações reais ou URL dos vídeos; confirmar em `index1.html`.

## Não confundir com vídeo nativo do produto
A galeria é **editorial e exclusiva**, não substitui vitrine nativa ou vídeo padrão de PDP.

### Campos do painel para esta seção
| Campo | Tipo | Regras |
|---|---|---|
| enabled | boolean | desativado por padrão |
| title | string | opcional, comprimento limitado |
| placement | enum | posição validada pelo layout/tema, nunca seletor CSS arbitrário do cliente |
| cards | array ordenável | 0–12 cards; testar rendimento |
| card.id | string identificadora | única |
| card.enabled | boolean | controla exibição |
| card.posterUrl | URL HTTPS | imagem hospedada à parte, sem reescrever |
| card.videoUrl | URL HTTPS | MP4 ou Vimeo aprovado |
| card.provider | enum | `mp4` ou `vimeo` |
| card.alt | string | descrição acessível do poster |
| card.productUrl | URL HTTPS opcional | link de produto existente, não define preço |
| card.label | string opcional | legenda acessível/editorial |
| card.order | inteiro | ordem visível |
| mobileMode | enum | scroll-snap ou grid, validar no protótipo |
| openMode | enum | modal ou inline, confirmar com protótipo |
| autoplay | boolean | false por padrão |

### Regras de implementação
- Desktop quatro colunas; mobile conforme protótipo observado, se indisponível propor scroll-snap sem ativar.
- Aspect-ratio 9/16, espaço previsto antes do download e renderização, tamanhos de imagem explícitos.
- Poster first, vídeo `preload=none`, iniciar com clique/tap; fechar com ESC, pausa, foco e teclado acessíveis.
- `prefers-reduced-motion`, touch, modal com foco restaurado e mensagens de erro de vídeo.
- Nunca montar sobreposição que cubra carrinho/checkout. CSS prefixado `fwr-nichelle-video-`.
- Não inserir URL fictícia: configurar array vazio até mídia real ser fornecida.
- Se JSON remoto chegar tarde, nunca criar mudança significativa de geometria acima da dobra. Aplicar slot reservado ou tratar seção abaixo da dobra.
- Testar 1440, 820, 390 e 360px; sem CLS dominante, sem sobreposição de botões e com posters/imagens preservados.

**Condição de aceite:** vídeo real e poster hospedado validados por URL/HTTP, interação desktop/mobile, fallback quando offline e evidência CLS em navegador.
