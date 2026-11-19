# Plano de performance e homologação visual

## Prioridade alta

- Manter topo, produtos/preços, banners nativos, busca, formulários e footer nativos no site; mostrar seus equivalentes de fixture apenas dentro de `/preview/`.
- Separar explicitamente módulos FWR de elementos nativos e demonstrar os 13 grupos da composição em ordem, com dados sintéticos só na fixture.
- Carregar CSS do preview antes do JS; definir `width`, `height` ou `aspect-ratio` em imagens e cards antes do primeiro paint.
- Não mover listas ou formulários do DOM real da Loja Integrada nesta etapa. Qualquer futura habilitação exige seletor confirmado, listener/plugin verificado e homologação no tema.
- Fazer o build Vercel limpar `vercel/dist` e copiar apenas os três assets e a pasta de preview aprovada; nunca incluir `admin/`, `server/`, credenciais ou artefatos locais de teste.
- Restringir workflows de publicação em host FWR/Pages ao branch `main`; a branch `develop` produz apenas deployment preview Vercel.

## Prioridade média

- Validar desktop 1920/1440/1280, tablet 768 e mobile 390/375/320 contra as capturas; ajustar overflow horizontal, proporções, espaçamento e hierarquia.
- Usar scroll horizontal com `scroll-snap` somente nas regiões em que a captura não define mobile; manter página sem overflow horizontal.
- Lazy-load em imagens fora da primeira dobra; imagens do primeiro viewport usam estratégia eager apenas na fixture relevante.
- Adicionar relatórios com ferramenta/browser, viewport, data, LCP, CLS, evento longo/INP aproximado, bytes de rede disponíveis e erros de console/rede.

## Prioridade baixa

- Micro-otimizações depois que a fidelidade visual e os estados de falha estiverem corretos.
- Nenhuma biblioteca de runtime para a loja; ferramenta de captura fica só no QA.

## Sequência

1. Capturar baseline read-only do site e verificar disponibilidade do protótipo.
2. Criar ambiente navegável isolado e seu servidor local.
3. Medir geometria, erros e Core Web Vitals de laboratório no preview.
4. Corrigir diferenças de layout sem ativar Settings na LI.
5. Repetir os mesmos viewports/método, revisar contraste, teclado, reduced-motion e assets.
6. Enviar a mudança somente a `develop`; validar o deployment com target Vercel `preview` e atualizar a PR Draft.

## Fora desta etapa

- Ativar qualquer módulo na loja pública ou trocar suas URLs.
- Aprovar conteúdo comercial, descontos, selo, claims, logotipos ou imagens para produção sem confirmação.
- Reposicionar/estilizar DOM do tema real sem mapeamento no browser e autorização de homologação.

## Dashboard e URL de publicação

- O pedido do usuário de 2026-11-09 retomou o dashboard protegido. O HTML da LI configura uma única URL pública HTTPS; alterações de vídeos passam pelo painel e JSON sanitizado, sem editar a LI a cada atualização.
- A UI PHP precisa ser exercitada em hospedagem que tenha PHP e variáveis `NICHELLE_ADMIN_PASSWORD_HASH`, `NICHELLE_SESSION_SECRET` e `NICHELLE_DATA_DIR`; não há esses dados no workspace.
- Não preencher nem divulgar host público até a FWR confirmar ambiente e acesso de homologação. Não publicar conteúdo na loja.
