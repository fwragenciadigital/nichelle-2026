> **HISTÓRICO (substituído):** O módulo de quatro cards agora utiliza a posição **Mini Banner** por decisão posterior. Para instalação atual, siga [docs/15-MINI-BANNER-QUATRO-CARDS.md](15-MINI-BANNER-QUATRO-CARDS.md). O procedimento abaixo descreve a tentativa anterior com Full Banner e não deve ser seguido como instrução vigente.

# Correção — banners não aparecem em /cabelos

## Diagnóstico

A URL `/cabelos` é página de **categoria**. Pela documentação da Loja Integrada, banners de categoria são cadastrados no tipo **Full Banner** com "Página de publicação" apontando para a categoria. Já o **Banner Vitrine** integra a posição de vitrine da página inicial e não é garantido dentro das categorias.

O módulo antigo exigia simultaneamente:
1. `window.FWRNichelle.bannerVitrine.ativo === true`;
2. `#fwr-nichelle-vitrine-slot` presente no HTML;
3. quatro imagens de banner nativo com ALT/nome exatamente igual às quatro entradas de `nomes`;
4. imagens reconhecidas pelo tema como Banner Vitrine.

Portanto o JavaScript global no rodapé **sozinho não cria banners**, e as imagens de Banner Vitrine cadastradas para a home não aparecem necessariamente em `/cabelos`. No print do painel do cliente também constam apenas três banners `Mini 1/2/3 vitrine-mini`, então o quarto card não está garantido.

## Ajuste no JS

`public/nichelle.js` passou a aceitar `origem: "categoria"`. Nesse modo ele busca os quatro Full Banners na página **pelo nome/ALT exato**, mesmo sem classes CSS de banners previsíveis. Usa imagens e links nativos do painel. O modo padrão `origem: "vitrine"` da home foi preservado, assim como a galeria de Shorts e o módulo de notícias.

O novo arquivo `integracao/html-categoria-cabelos.html` contém a configuração desativada (`ativo:false`), um exemplo de nomes, e tenta inserir o slot imediatamente antes da listagem de produtos APENAS em `/cabelos`. Para melhor CLS, preferir colocar o slot diretamente no template HTML da categoria ANTES da lista de produtos, quando esse editor permitir.

**Atenção:** o script só consegue ler banners já renderizados no HTML da categoria. Não acessa banco de dados interno, conta do painel ou URLs privadas; não usa `fetch` e não faz requisição adicional para obter banners.

## Cadastro no painel

1. **Personalize sua loja > Banners > Adicionar Full Banner**.
2. Subir quatro imagens verticais 3:5 (ex.: 600 × 1000 px), uma para cada card.
3. Em **Página de publicação**, selecionar a categoria **Cabelos**.
4. Nomes exatos usados no HTML de exemplo: `Cabelos Card 1`, `Cabelos Card 2`, `Cabelos Card 3`, `Cabelos Card 4`.
5. Definir o destino de cada imagem no campo link e ativar os banners. Verificar se todos aparecem no DOM da categoria.
6. Inserir `integracao/html-categoria-cabelos.html` no HTML/Rodapé uma única vez, com `ativo:false` enquanto testa.
7. Depois, alterar `ativo:true` para exibir os quatro cards.

**Ressalva**: a LI pode exibir os quatro Full Banners também na área nativa em formato de slider. Por padrão `ocultarOriginais:false` evita apagar ou quebrar o slider antes da validação. Só depois de conferir o HTML real da categoria é adequado ocultar todo o slider nativo sem deixar espaços vazios. Não colocar `ocultarOriginais:true` sem verificar.

## Diagnóstico sem instalação de plugins

Na página `/cabelos`, após a publicação do novo JS, abrir DevTools > Console e executar:

```js
window.FWRNichelle?.diagnosticoBanners?.()
```

Resultado mostra `ativo`, `origem`, `slotEncontrado`, `galeriaMontada` e para cada nome `imagemNoDOM`. Se `slotEncontrado:false`, inserir o HTML. Se `ativo:false`, habilitar. Se imagens com `imagemNoDOM:false`, a LI ainda não publicou os banners na categoria ou os nomes diferem; não é falha de CSS.

## Fonte oficial

- https://ajuda.lojaintegrada.com.br/pt-BR/articles/7225838-como-adicionar-um-banner-nas-categorias
- https://ajuda.lojaintegrada.com.br/pt-BR/articles/5184585-como-incluir-banners-em-minha-loja
