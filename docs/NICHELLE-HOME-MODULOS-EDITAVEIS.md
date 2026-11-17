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
