# Baseline de performance — 2026-11-09

## Método

- Ferramenta: Chrome headless local por Chrome DevTools Protocol (`qa/capture-page.mjs`), captura read-only; nenhum botão comercial foi acionado.
- Browser: Chrome `151.0.7922.139`.
- Páginas: `https://www.nichelleimports.com.br/` e `https://www.nichelleimports.com.br/cabelos`.
- Viewports: desktop 1440×900 e mobile emulado 390×844, DPR 1.
- Cache: desativado; rede/CPU: throttling desligado; uma execução por página e viewport; 1,8 s de estabilização antes da coleta.
- Medidas: LCP por `PerformanceObserver`, CLS sem `hadRecentInput`, recursos/bytes expostos pelo Resource Timing e erros de console/rede.
- INP: não disponível; a página foi observada sem interação. O máximo de evento de 16 ms (sem eventos) não é INP.

## Resultado observado

| Página | Viewport | LCP | CLS observado | Recursos | Bytes transferidos por Resource Timing | Imagens com erro | Largura do documento |
|---|---:|---:|---:|---:|---:|---:|---:|
| Home | 1440×900 | 2736 ms | 0,00147 | 109 | 371.188 | 3 | 1425 CSS px (scrollbar do Chrome) |
| Home | 390×844 | 1944 ms | 0 | 94 | 370.846 | 3 | 390 CSS px |
| `/cabelos` | 1440×900 | 1316 ms | 0,00147 | 87 | 315.215 | 3 | 1425 CSS px (scrollbar do Chrome) |
| `/cabelos` | 390×844 | 1740 ms | 0 | 68 | 314.873 | 3 | 390 CSS px |

## Sinais e limitações

- A home desktop teve LCP observado de 2,736 s nesta única amostra, acima da meta de referência de 2,5 s. Condições sem throttling e sem repetição não permitem concluir sobre LCP de campo.
- O CLS observado foi baixo nesta visita e perfil; isso não prova estabilidade em navegação fria/repetida nem é p75 de usuários reais.
- As duas páginas registraram três imagens sem dimensões naturais carregadas na janela de observação. Resource Timing não inclui necessariamente todos os bytes de recursos cross-origin/lazy; os totais não são o peso integral da página.
- O console registrou uma requisição CORS do selo Reclame Aqui e duas respostas HTTP 400 na página pública. Falhas e abortos de recursos lazy ao trocar viewport foram observados; não atribuir todos a erros do site.
- Nenhuma alteração do framework FWR foi aplicada durante esse baseline.

## Capturas

- `qa/artifacts/live-before-home/capture-1440x900.png`
- `qa/artifacts/live-before-home/capture-390x844.png`
- `qa/artifacts/live-before-cabelos/capture-1440x900.png`
- `qa/artifacts/live-before-cabelos/capture-390x844.png`
- JSON bruto por página/viewport: os arquivos `metrics.json` nas mesmas pastas.

As capturas são screenshots do viewport inicial; a prévia FWR terá capturas de página e seções completas após a implementação. Não houve interação com busca, banner, produto, carrinho, checkout ou formulário.
