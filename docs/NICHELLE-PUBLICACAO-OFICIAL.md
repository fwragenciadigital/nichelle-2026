# Nichelle 2026 — Publicacao oficial sem parametro de previa

## Estado da integracao

- Repositorio: `fwragenciadigital/nichelle-2026`, branch `develop`.
- Ate a aprovacao final, JS e CSS permanecem hospedados na Vercel.
- Loader pronto para ativacao publica: [`integracao/nichelle-core-fixo-producao.html`](../integracao/nichelle-core-fixo-producao.html).
- Loader de retorno a homologacao: [`integracao/nichelle-core-fixo.html`](../integracao/nichelle-core-fixo.html).
- Bloco 01 editavel mantido: [`integracao/nichelle-modulos-admin.html`](../integracao/nichelle-modulos-admin.html).
- Assets externos: `https://nichelle-2026-git-develop-fwragenciadigitals-projects.vercel.app/nichelle27.js` e `/nichelle27.css`.
- O `public/nichelle-geral.css` e adicionado no final do CSS unico pelo build.

## Como ativar no painel Loja Integrada

1. Guarde uma copia do HTML atual do cabecalho para rollback.
2. Em Visual > Incluir codigo HTML > Modo avancado > Codigo no cabecalho, preserve **bloco 01** de configuracoes editaveis.
3. **Substitua integralmente o bloco 02 temporario jsDelivr/preview** pelo conteudo do arquivo `integracao/nichelle-core-fixo-producao.html`. Nunca deixe os dois loaders instalados. Remova links manuais antigos que apontem para jsDelivr `nichelle27.js` ou `nichelle27.css`.
4. Salve. Acesse `https://www.nichelleimports.com.br/` **sem** `?nichelle_preview=1`.
5. Pelo DevTools > Network, confirme que a pagina esta requisitando `nichelle27.js` e `nichelle27.css` a partir do alias da Vercel da branch develop. Evite CSS e JS duplicados.

O loader de producao declara explicitamente `geral.ativo:true`, `modoPreview:false` e `publicarNaLoja:true`, e so roda no dominio da Nichelle. O novo `public/nichelle-activation.js` controla os modulos. O framework e os componentes aceitam tanto a homologacao quanto a publicacao, sem exigir parametro na URL oficial.

Checkout, autenticacao e endpoints de atualizacao/validacao transacionais permanecem fora da personalizacao. As operacoes nativas de produto, preco, estoque, variacao, frete, cupom e checkout devem continuar na Loja Integrada.

## Checklist antes de considerar aprovado

- Home desktop e mobile: banners, mini banners, menu inferior, header, vitrines, newsletter, footer e cupom.
- Categoria e busca: dados nativos, filtros, ordenacao, paginacao e grid mobile.
- PDP: variacoes obrigatorias, preco e Pix, galeria, frete, botoes e adicionar ao carrinho.
- Carrinho: aumentar/remover produto, frete, aplicar/remover cupom, total atualizado, botao para checkout oficial.
- Checkout: nenhuma injeção FWR nas telas de pagamento e confirmacao.
- Verificar ausencia de erros de JavaScript, layout shift e que nao exista carregamento do jsDelivr antigo.
- **Conferir o codigo PRIMEIRACOMPRA e a porcentagem anunciada diretamente nas regras de cupom da Loja Integrada**, antes de liberar promocao aos consumidores.

## Reversao imediata

Restaure o bloco 02 anterior ou substitua o loader de producao pelo `integracao/nichelle-core-fixo.html`. O loader de homologacao exige `?nichelle_preview=1`; o storefront sem parametro retorna ao layout nativo. **Nao mantenha dois loaders concorrentes.** Nao apague o bloco 01, nem altere estoque, checkout ou pedidos.

## Entrega final apos aprovacao

Exportar o conteudo **completo** gerado por `vercel/build.mjs`: `nichelle27.js` e `nichelle27.css`. Auditar e, se necessario, migrar referencias residuais a assets da Vercel (por exemplo JSON da galeria) antes da hospedagem independente na Loja Integrada. A entrega final dos dois bundles esta **pendente de aprovacao**; ate la Git/Vercel continuam sendo a fonte.
