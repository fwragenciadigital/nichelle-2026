# Nichelle — 4 cards verticais pela posição Mini Banner

## Situação e arquitetura

O único script público continua sendo `public/nichelle.js` — compartilhado pelos módulos **Shorts**, **notícias** e **banners**. Não duplicar o carregamento no rodapé.

A configuração foi ajustada para `origem: "mini"`, preservando suporte aos modos legados `"categoria"` (Full Banner) e `"vitrine"`. O novo cadastro começa com `ativo: false`.

## Atenção — categoria /cabelos

A documentação da Loja Integrada diz que o tipo **Mini Banner normalmente é exibido na página inicial** e que a exibição em outras páginas **depende do tema e das páginas selecionadas no cadastro**. Portanto, **não é possível garantir que os Mini Banners estejam disponíveis no DOM de /cabelos**. O JS não acessa API privada, e não busca outra página com `fetch` apenas para tentar encontrá-los.

Acesse **Personalize sua loja > Banners > Mini Banner**, publique quatro artes com seus links, status ativo e (se disponível) página de publicação em `Cabelos`. Em `/cabelos` verifique a existência dessas imagens no código da página. Se não estiverem, será preciso disponibilizá-las no template da categoria ou escolher outra fonte de imagens. Essa limitação é do tema/posicionamento e **não é resolvida por mudar o nome da variável JS**.

## Arquivos para colar na LI

- **Home**: `integracao/html-banner-vitrine-4-cards.html`.
- **Categoria /cabelos**: `integracao/html-categoria-cabelos.html` (HTML/Rodapé global, com filtro `/cabelos`).
- **JS**: `https://nichelle-2026.vercel.app/nichelle.js` (somente uma vez).

Usar nomes idênticos ao `ALT` entregue pelo painel da Loja Integrada:

```js
window.FWRNichelle.bannerVitrine = {
  ativo: false,
  origem: "mini",
  ocultarOriginais: false,
  nomes: [
    "Mini 1 vitrine-mini",
    "Mini 2 vitrine-mini",
    "Mini 3 vitrine-mini",
    "Mini 4 vitrine-mini"
  ]
};
```

O nome **não precisa conter a palavra Mini**; ele só precisa ser exatamente igual ao campo "Nome do banner" usado no painel. O nome pode ser mantido no cadastro antigo ao criar os novos Mini Banners. Os banners de imagem devem estar efetivamente publicados e visíveis na página para o JS conseguir cloná-los.

## Layout e segurança

- O layout customizado continua em **4 cards proporcionais 3:5** no desktop, rolagem horizontal no mobile. Como o padrão da LI para Mini Banner pode ter proporção horizontal (por exemplo 720×400), fornecer imagens verticais (600×1000) para evitar cortes; verificar o tema antes da publicação.
- Não ocultar a origem nativa: `ocultarOriginais: false`. Isto pode resultar em **imagens repetidas** no componente nativo; somente ocultá-lo após validar os wrappers e slider reais. O objetivo é preservar a Loja Integrada e não quebrar seus elementos.
- `ativo: false` garante que a seção customizada não seja montada e não oculte banners.
- A ordem dos cards vem de `nomes`, não da ordem do carrossel.
- O código não cria imagens inventadas nem URLs de imagens; reproduz as presentes no HTML da LI.
- O módulo de Shorts não foi alterado.

## Diagnóstico

Abra o console da página de categoria e execute:

```js
window.FWRNichelle?.diagnosticoBanners?.()
```

Verifique `ativo`, `origem`, `slotEncontrado`, `galeriaMontada` e `imagemNoDOM` para cada banner. Se faltar uma imagem, não haverá a galeria de quatro cards.

## Fontes oficiais

- https://ajuda.lojaintegrada.com.br/pt-BR/articles/9288886-como-configurar-o-tema-galeria
- https://ajuda.lojaintegrada.com.br/pt-BR/articles/5184585-como-incluir-banners-em-minha-loja
- https://ajuda.lojaintegrada.com.br/pt-BR/articles/15826046-quais-sao-os-tipos-de-banner-do-tema-padrao-e-quais-as-dimensoes-recomendadas
