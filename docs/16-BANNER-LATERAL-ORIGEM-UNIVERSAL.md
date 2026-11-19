# Nichelle — Banner Lateral como origem dos quatro cards

## Decisão

A configuração do painel mostra **Posição: Banner lateral**, **Banner ativo: Sim**, **Páginas de publicação: Todas as categorias e Página inicial**. A partir disso, o módulo passa a permitir `origem: "lateral"`, sem vinculação fixa a `/cabelos`.

O banner `mini-pages1` do print é apenas um dos quatro necessários. A galeria tem regra *fail closed*: com menos de quatro imagens reconhecidas no HTML da página, não exibe cards nem altera os banners nativos. Cadastre `mini-pages1`, `mini-pages2`, `mini-pages3`, `mini-pages4`.

**Atenção**: marcar páginas de publicação não força a exibição se o tema estiver sem coluna lateral ou não renderizar a posição Banner Lateral na página. A posição é definida no painel, mas o tema efetivamente determina se as imagens serão incorporadas no HTML. Em páginas de produto ou institucionais, a opção **Todas as categorias + Página inicial** não inclui necessariamente essas páginas; o JS pode iniciar globalmente, mas não inventa imagens ausentes.

## HTML de configuração

Arquivo: `integracao/html-banners-laterais-global.html`.

É um script para colocar no HTML/Rodapé global, **em substituição aos arquivos antigos de categorias** (não acumular configurações diferentes). O JS principal é carregado uma única vez:
`https://nichelle-2026.vercel.app/nichelle.js`.

```js
window.FWRNichelle.bannerVitrine = {
  ativo: false,
  origem: "lateral",
  ocultarOriginais: false,
  paginas: ["/cabelos"],
  nomes: ["mini-pages1", "mini-pages2", "mini-pages3", "mini-pages4"]
};
```

- **Homologação na categoria**: `paginas: ["/cabelos"]`.
- **Após aprovação, publicar só na home**: `paginas: ["/"]`.
- **Permitir em quaisquer páginas que entreguem os banners**: `paginas: []`.
- **Ativar depois do cadastro**: `ativo: true`.
- **Preservar banner nativo até confirmar**: `ocultarOriginais: false`.
- O HTML inclui `seletorAntes`, que posiciona a galeria antes da primeira listagem de produtos por um seletor CSS editável. Em temas diferentes, revisar esse seletor.
- A reserva inicial de espaço na página é aproximada. Para menor CLS, criar o slot antecipadamente no template, na posição correta.

## Campos do painel
- Banner ativo: **Sim**.
- Nome: `mini-pages1` até `mini-pages4` (precisam corresponder ao ALT efetivamente renderizado).
- Posição: **Banner lateral**.
- Página de publicação: **Todas as categorias** e **Página inicial**.
- Link: usar URL da categoria/produto de destino. `#` não é um destino de conversão e o runtime ignora esse placeholder.
- Formato de arte: aproximadamente **3:5** (ex.: 600×1000). A dimensão indicada para Banner Lateral na documentação padrão da LI é largura de 260 px; conferir recomendação do tema.

## Verificação e limitações
- `window.FWRNichelle?.diagnosticoBanners?.()` informa `ativo`, `origem`, `slotEncontrado`, `galeriaMontada` e `imagemNoDOM` de cada nome. Se uma imagem não foi publicada pelo tema, não haverá galeria.
- CSS e renderização fazem parte do `nichelle.js` já implantado na Vercel.
- Não esconder automaticamente componentes da sidebar; inspecionar o DOM real antes de ocultar originais.
- Shorts e notícias ficam em módulos separados dentro do mesmo JS, sem mudança funcional.
- Testes automatizados validam a origem lateral, a compatibilidade do código de banners anterior, a ativação padrão false e a configuração de páginas. Ainda exige homologação no navegador com o HTML real da loja.

Fonte: https://ajuda.lojaintegrada.com.br/pt-BR/articles/5184585-como-incluir-banners-em-minha-loja
