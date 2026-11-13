# Validação da orientação LI contra a produção Nichelle

**Data da verificação:** 13/11/2026  
**Fonte da plataforma:** [Como desenvolver um tema na Loja Integrada](https://ajudaparceiros.lojaintegrada.com.br/pt-BR/articles/12454154-como-desenvolver-um-tema-na-loja-integrada) (29/09/2025)  
**Inspeção da loja:** somente leitura, HTTPS público, HTML e DOM em Chromium; nenhum acesso ao painel nem edição de produção.

## O que a orientação da LI estabelece

- Desenvolver o tema numa loja de demonstração configurada como uma loja real, com URL contendo “DEMO”, produtos de teste e blocos estruturais configurados antes do código.
- Para temas com acesso avançado, o CSS adicionado em **Personalizar > Editar CSS** é servido em `avancado.css` dentro do `<head>`. HTML/JS entram por **Incluir código HTML** (cabeçalho/rodapé) ou pelos blocos disponíveis no modo avançado. A própria LI informa que o acesso HTML/CSS depende do plano ou da compra do tema.
- Restringir código às páginas necessárias quando o painel oferece **Página publicação**; verificar dependências já presentes e a existência do elemento antes de manipulá-lo.
- Evitar remover classes/objetos do tema nativo, incluindo os relacionados ao carrinho e à compra. Evitar AJAX para páginas da própria loja porque pode consumir pageviews.

São orientações de desenvolvimento de tema/parceiro. Não comprovam permissões, editor ativo ou configuração do tema específico da Nichelle; isso requer o painel da loja/demonstração.

## Evidência observada na produção atual

| Verificação | Resultado observado |
|---|---|
| Home `/` | HTTP 200; HTML inclui assets da LI (`all.min.js`, `slick.min.js`, `all.min.css`) e personalizações atuais `tema.css`, `__theme_custom.css` e `__theme_custom.js`. As classes nativas incluem `#cabecalho`, `.menu-desktop`, `.secao-banners`, `.vitrine-produtos`, `.vitrine-marcas`, `#barraNewsletter` e `#rodape`. |
| Categoria `/cabelos` | HTTP 200; carrega também o runtime antigo `https://nichelle-2026.vercel.app/nichelle.js` (JS 200, 47.898 bytes observado). O diagnóstico Chromium encontrou `runtimeLoaded=true`, configuração de banner com `ativo=false`, imagem `mini-pages1` presente, mas nenhum `#fwr-nichelle-vitrine-slot`; a inspeção dinâmica foi corretamente marcada como não testada visualmente porque o recurso estava desligado. |
| Assets antigos na URL estável | `https://nichelle-2026.vercel.app/nichelle.js` respondeu 200; `/nichelle.css` e `/galeria-publicada.json` responderam 404 na mesma origem. |
| Marcação do novo projeto | O HTML público da home não contém o slot `fwr-nichelle-video-slot` nem uma referência ao novo runtime da branch `develop`. O slot da galeria ainda não está instalado na loja. |

O caminho estável `nichelle-2026.vercel.app/nichelle.js` está em uso legado na página de categoria. Não o substituir por uma versão incompatível sem plano de migração: o runtime atual da branch limita o host oficial à galeria, enquanto o bundle antigo contém módulos de banners/notícias. Embora o banner inspecionado esteja atualmente desativado e sem slot, o comportamento pode ser reativado pelo painel/configuração legado.

## Aplicação ao projeto e decisão

- A base Malheiro continua sendo referência auditada, não um script/stylesheet a carregar em bruto. A loja real já carrega bibliotecas e personalizações do tema; não injetar jQuery, Slick ou estrutura duplicada.
- Seguir o fluxo LI: primeiro homologar a loja-demo/tema e seus blocos; só então usar os campos de CSS/HTML disponíveis. A folha oficial FWR continua escopada à galeria; o restante do layout da demo não foi aplicado ao tema atual.
- Colocar o slot apenas na posição homologada. Se o bloco JS/rodapé for global, o runtime confere o slot antes de requisitar a configuração remota; páginas sem a galeria não fazem esse fetch.
- Manter intactos os nodes, classes, links e handlers nativos de busca, navegação, carrinho, compra, vitrines, produtos, preços, newsletter e checkout. O conselho genérico de ocultar elementos com `display:none` não autoriza esconder controles comerciais nativos.
- Não usar o atual caminho estável como distribuição nova: ele não tem CSS/config correspondentes (404), e o deployment de `develop` consultado está protegido por SSO (302). Preparar uma origem HTTPS pública própria/versionada para JS, CSS e JSON; verificar MIME, CORS e cache antes da homologação.

## Resultado

A orientação oficial da LI é compatível com a arquitetura FWR **se aplicada no fluxo de demo/homologação e com gestão nativa preservada**. A produção comprova que a LI serve assets nativos e extensões de tema e que há um runtime legado em `/cabelos`; não comprova slot da galeria, acesso ao editor, nem valida que o novo bundle oficial possa substituir o legado. Nenhuma alteração foi feita na loja.
