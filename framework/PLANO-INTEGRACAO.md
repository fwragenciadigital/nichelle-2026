# Nichelle 2026 — Plano de integração do framework e dos módulos

## Decisão adotada
Construir cada grid/componente em `public/nichelle.js` durante o desenvolvimento, sem interromper o funcionamento dos módulos já publicados (Shorts, Banner Vitrine/Mini Banner, notícias). **Somente depois da homologação** adaptar a estrutura visual e o posicionamento das vitrines ao framework-base, formando dois arquivos JS e um CSS final.

## Arquivos recebidos (originais, não carregados)
- `framework/referencias/nichelle27.js`: runtime legado Malheiro, versão interna 0.2.0. Usa `window.MalheiroSettings`, `window.Malheiro`, template HTML embutido e **apenas o componente demonstrativo `beneficios`**.
- `framework/referencias/nichelle27.css`: estilos isolados da demonstração `beneficios`, reserva de altura 92px desktop e 186px mobile, media query 640px, preferências de movimento reduzido.
- Estes arquivos foram copiados como REFERÊNCIA. **Não incluem o framework completo de vitrines e não devem ser incluídos na Loja Integrada como estão.** A sua presença no GitHub não implica publicação no Vercel nem na loja.

## Estrutura-alvo
```text
framework/
  referencias/nichelle27.js       # original enviado, imutável
  referencias/nichelle27.css      # original enviado, imutável
  src/                             # futura implementação adaptada e testada
public/
  nichelle.js                     # módulos/grids customizados, já publicado na Vercel
  nichelle-framework.js           # build final do framework-base (futuro)
  nichelle-framework.css          # build final do CSS do tema (futuro)
integracao/
  html-*.html                     # settings e slots que o cliente edita no painel LI
```

## Contrato entre os dois JavaScripts
1. **Framework**: inicializa a estrutura geral da Nichelle e orquestra posicionamento/montagem das vitrines. Não reimplementa carrinho, checkout, produtos, frete ou funções nativas da LI.
2. **Módulos customizados**: implementam exclusivamente cada funcionalidade visual (Shorts, quatro Mini Banners, notícias, futuros grids). Podem ser chamados pelo framework após a integração.
3. Usar namespaces exclusivos `window.NichelleFramework` / `window.FWRNichelle`; renomear código Malheiro (`MalheiroSettings`, `malheiro-*`, `data-malheiro-*`) na adaptação. Nunca carregar os dois runtimes com o mesmo guard global.
4. Cada módulo começa **`ativo: false`** e só monta conteúdo se houver configuração válida e slot definido. Não ocultar componentes nativos antes de verificar o resultado.
5. As variáveis editáveis permanecem no HTML da LI; o conteúdo visual é construído por JS versionado no GitHub.
6. CSS **estrutural e anti-CLS no head** (ou no template do tema) antes da exibição dos slots; evitar inserir CSS crítico somente após `defer` em módulos na dobra. Estilos dos componentes podem permanecer isolados durante desenvolvimento, com revisão/extração posterior.
7. Módulos separados no desenvolvimento; build otimizado, sem dependências externas desnecessárias, para publicação final.

## Etapas
- [x] Receber e arquivar arquivos originais.
- [ ] Mapear seletores, opções e pontos de inserção reais do tema Nichelle (home, categoria, produto, footer).
- [ ] Criar primeira adaptação `NichelleFramework` preservando o comportamento `false` por padrão.
- [ ] Implementar/homologar cada bloco em `nichelle.js`, mantendo Shorts em funcionamento.
- [ ] Organizar ordem das vitrines e slots pelo framework definitivo, incluindo mobile/desktop e CLS.
- [ ] Testar duplicações, foco, renderização, acessibilidade, velocidade e scripts da LI em páginas reais.
- [ ] Gerar dois arquivos JS finais + CSS estrutural, validar a hospedagem pública de cada asset.
- [ ] Trocar URLs na LI **somente após homologação**, sem duplicar loaders; ter rollback para a URL Vercel conhecida.

## Distribuição
Durante desenvolvimento, `https://nichelle-2026.vercel.app/nichelle.js` é a URL atual dos módulos. O deploy Vercel hoje **gera apenas o arquivo `public/nichelle.js`**. Não há ainda `nichelle-framework.js` pronto ou publicado.

Ao concluir, confirmar quais uploads de JS/CSS a Loja Integrada aceita e quais URLs públicas resultam desses uploads; não presumir que o editor HTML ou biblioteca de imagens seja hospedagem válida de arquivos JS. Se o painel não servir arquivos JS diretamente, manter GitHub → Vercel ou hospedagem estática FWR, com os links estáveis na LI.

## Restrições
- Sem migrar automaticamente o arquivo original Malheiro para a loja.
- Sem renomear/remover `public/nichelle.js` agora.
- Sem alterar configurações da loja ou ativar módulos antes da aprovação.
- Sem expor Settings sensíveis, tokens ou dados de terceiros nos repositórios públicos.
