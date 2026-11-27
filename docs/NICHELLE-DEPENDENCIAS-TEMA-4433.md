# Nichelle Imports — migração do tema 4433 (auditoria e teste isolado)

## Arquivos originais recebidos do cliente

Cópias exatas de `__theme_custom.js` (993311 bytes, SHA Git blob `3bbdaad60e495e3014d320df60a864845fddd3d0`) e `__theme_custom.css` (328305 bytes, SHA Git blob `9fb7b2b2fbb89faac03f48396431fee0cdfa4605`).

- `referencias/tema-4433/__theme_custom.js`
- `referencias/tema-4433/__theme_custom.css`

**NÃO remover estes arquivos e NÃO os carregar automaticamente na produção.** O JS original está ofuscado, incorpora código de editor do tema, e há comportamento que pode interferir em funcionalidades da Loja Integrada se duplicado.

## Dependências confirmadas no FWR

- `nichelle-isolation.js`: trabalha com `.vitrine-mas-vendido`, `.vitrine-lancamento`, `.vitrine-marcas`, `.vitrine-video`, `ul[data-produtos-linha]` e faz `unslick()` do Slick legado.
- `nichelle-approved.js`: só monta a home aprovada quando encontra `.vitrine-mas-vendido`.
- `nichelle-best-sellers.js`: extrai dados dos cards nativos existentes; não cria produtos novos e depende dos seletores encontrados.
- `nichelle-pdp.js`: monta em cima de `.produto-detalhes` e nós da LI; não fornece dados de estoque, preço, frete ou variações.
- `nichelle-listing.js`: usa HTML dos produtos fornecido pela Loja Integrada; filtros e paginação permanecem da plataforma.

A referência CSS tem **3345 regras**, das quais centenas afetam a estrutura global, cabeçalho, produto, carrinho, grid e Slick. Não copiar seletivamente às cegas.

## Build de compatibilidade — SEM afetar as URLs oficiais

O `vercel/build.mjs` continua publicando `nichelle27.js` e `nichelle27.css` inalterados, e **adiciona para teste**:

- `/nichelle27-compat4433.js`: JS original 4433 **antes** do JS FWR
- `/nichelle27-compat4433.css`: CSS original 4433 **antes** do CSS FWR

Esta é uma prova de compatibilidade, **não é versão final independente**. O tema pode gerar HTML no template ou usar bibliotecas e dados externos não presentes apenas nos dois arquivos.

## Como testar na loja de manutenção

1. Faça backup do bloco 02 em Visual > Incluir código HTML > Modo avançado.
2. **Somente no domínio `nichelle-imports-manutencao.lojaintegrada.com.br`**, substitua o bloco 02 pelo conteúdo de `integracao/nichelle-core-fixo-teste-tema4433.html`. Não instale dois loaders ao mesmo tempo.
3. O loader detecta o script original `/temasv2/4433/__theme_custom.js`. Se já presente, usa bundles FWR normais para não duplicar o motor antigo. Se ausente, usa os bundles de compatibilidade.
4. Preserve a tela de bloqueio. A senha provisória permanece `ALTERE-ESTE-CODIGO`.
5. Teste a home no desktop e mobile: cabeçalho, busca, menu, banners, vitrines, marcas, shorts, newsletter e rodapé. Faça teste de fluxo com produtos reais, seleção de variações, adição ao carrinho, alteração de quantidades e frete. **Checkout e autenticação permanecem responsabilidade da LI.**
6. DevTools > Console: `window.__N27_COMPAT_4433_LOADED__` deve retornar `true` se o bundle de compatibilidade rodou sem falha. No Network, confirme que há um único motor 4433, além dos bundles corretos, sem JS/CSS duplicados.
7. Se observar conflitos, remova o loader de teste e restaure o bloco anterior. As URLs oficiais do projeto não foram alteradas.

**Não liberar em produção sem verificar** o comportamento transacional e as diferenças de DOM geradas pelo template da LI. A versão final deverá eliminar as dependências identificadas, reconstruindo componentes FWR quando necessário e usando dados nativos da plataforma.
