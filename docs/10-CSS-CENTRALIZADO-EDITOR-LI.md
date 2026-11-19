# CSS oficial da Nichelle — regra de manutenção

## Decisão atualizada (13/11/2026)

O CSS oficial da galeria de Shorts fica em `public/nichelle.css`. `public/nichelle.js` cria **uma única** tag `<link id="fwr-nichelle-styles">` para carregar `nichelle.css` da mesma origem do runtime; aceita URL explícita em `data-stylesheet-url` somente se mantiver a mesma origem. Ambos os assets são publicados juntos no build público.

**O editor HTML da LI mantém apenas:** (1) o slot da galeria, (2) `window.FWRNichelle.galeriaVideos` com os links e flag `ativo`, (3) uma pequena reserva inicial de altura calculada durante o parsing, necessária para evitar CLS antes do JS ser carregado.

A base de estilos (grid de quatro cards desktop, scroll mobile, aspect ratio 9:16, thumbnail, ícone play, modal e acessibilidade) está **no CSS oficial versionado**, fora do HTML da Loja Integrada. A demo integral continua usando `nichelle27.css`, isolado em `/preview/`.

## Como sobrescrever CSS pontualmente dentro da LI

Para personalizar um detalhe sem alterar a versão global, adicionar uma regra `<style>` **depois do bloco da galeria no HTML**, com seletores prefixados. Exemplo:

```html
<style>
#fwr-nichelle-video-slot .fwr-nichelle-videos__card {
  border-radius: 12px;
}
</style>
```

Regras CSS globais (como `body`, `img`, `button`) não devem ser usadas. Também não adicionar novamente o CSS completo da galeria: mudanças permanentes entram no arquivo `public/nichelle.css` pela PR.

## Arquivos para o cliente

- **Já instalou o script único no rodapé?** Colar apenas `integracao/html-galeria-shorts.html` na posição homologada da galeria.
- **Não instalou o loader ainda?** `integracao/INSTALACAO-UNICA-GALERIA-TESTE.html` mantém configuração e reserva do slot; incluir também o loader de `integracao/rodape-loader-unico.html`. Nunca duplicar a chamada do JS.
- `integracao/rodape-loader-unico.html` contém `BASE_URL_PUBLICA` intencionalmente. Trocar pelo host HTTPS validado; o CSS é solicitado ao lado do JS.

## Performance e versionamento

A reserva de altura é a única exceção que permanece no HTML. Ela é feita na leitura do HTML, antes do JS/CSS externo, para evitar deslocamento visual quando a galeria aparecer. Quando desativada, a altura reservada fica zero. A hospedagem pública da versão atual ainda requer verificação de respostas HTTPS/MIME/cache para JS e CSS.

Para publicar oficialmente, preferir commit validado em `main`, testado em mobile/desktop, e garantir carregamento apenas uma vez.
