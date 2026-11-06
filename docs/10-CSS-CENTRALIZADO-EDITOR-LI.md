# CSS oficial da Nichelle — regra de manutenção

## Decisão (06/11/2026)

O CSS base da galeria de Shorts foi incorporado em `public/nichelle.js`, no método `installStyles()`. O JS cria **uma única** tag `<style id="fwr-nichelle-styles">` por página. A Loja Integrada carrega o JS uma vez (rodapé).

**O editor HTML da LI mantém apenas:** (1) o slot da galeria, (2) `window.FWRNichelle.galeriaVideos` com os links e flag `ativo`, (3) uma pequena reserva inicial de altura calculada durante o parsing, necessária para evitar CLS antes do JS ser carregado.

A base de estilos (grid de quatro cards desktop, scroll mobile, aspect ratio 9:16, thumbnail, ícone play, modal e acessibilidade) está **no JavaScript do GitHub**, não no HTML do editor.

## Como sobrescrever CSS pontualmente dentro da LI

Para personalizar um detalhe sem alterar a versão global, adicionar uma regra `<style>` **depois do bloco da galeria no HTML**, com seletores prefixados. Exemplo:

```html
<style>
#fwr-nichelle-video-slot .fwr-nichelle-videos__card {
  border-radius: 12px;
}
</style>
```

Regras CSS globais (como `body`, `img`, `button`) não devem ser usadas. Também não adicionar novamente o CSS completo da galeria: mudanças permanentes entram no arquivo `public/nichelle.js` pela PR.

## Arquivos para o cliente

- **Já instalou o script único no rodapé?** Colar apenas `integracao/html-galeria-shorts.html` na posição da galeria.
- **Não instalou o loader ainda?** `integracao/INSTALACAO-UNICA-GALERIA-TESTE.html` inclui o link externo junto ao mesmo HTML. Nunca usar as duas modalidades ao mesmo tempo.
- `integracao/rodape-loader-unico.html` contém o loader externo para a fase de homologação.

## Performance e versionamento

A reserva de altura é a única exceção que permanece no HTML. Ela é feita na leitura do HTML, antes do JS externo, para evitar deslocamento visual quando a galeria aparecer. Quando desativada, a altura reservada fica zero. A versão normal do JS já está pública no GitHub e é consumida do jsDelivr na branch `develop` durante testes; a atualização do CDN **não é necessariamente imediata** por causa do cache.

Para publicar oficialmente, preferir commit validado em `main`, testado em mobile/desktop, e garantir carregamento apenas uma vez.
