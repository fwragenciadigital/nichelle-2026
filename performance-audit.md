# Auditoria de performance — Nichelle Imports 2026

**Data:** 2026-11-09
**Branch/HEAD inicial:** `develop` / `2b211bbbd63e3c45eff8ec3c6ede7fe5d55c690d`
**Escopo:** framework visual e ambiente isolado de homologação; a Loja Integrada não será alterada.

## Estado observado antes das mudanças desta etapa

| Achado | Arquivo/superfície | Impacto provável | Risco | Prioridade | Próxima ação |
|---|---|---|---|---|---|
| Não existe `preview/index.html`; o deployment Vercel de `develop` responde 404 em `/preview/` | `vercel/build.mjs`, `vercel/dist` | Impede QA visual navegável das seções | Baixo | Alta | Construir fixture isolada e incluir por allowlist explícita no build de preview |
| `mountVitrine()` adota/move a lista nativa para um wrapper FWR e aplica regras ao seu layout | `public/nichelle27.js`, `public/nichelle27.css` | Pode invalidar dependências de ancestral, slider ou listeners do tema; pode causar CLS se ativado tarde | Alto | Alta | Manter produto nativo intocado até contrato de inserção do tema ser verificado; renderizar fixtures locais no preview |
| `mountNewsletter()` move o formulário nativo para um wrapper customizado | `public/nichelle27.js` | Pode afetar listeners/validação por ancestralidade e layout | Alto | Alta | Demonstrar form local somente no preview e deixar integração real desativada até QA do tema |
| Seletores do tema são valores editáveis e não foram observados no DOM real | Settings HTML / tema LI | Selector incorreto pode escolher bloco errado ou duplicar/listar no lugar errado | Alto | Alta | Documentar mapeamento e gates; não ativar no site |
| Galeria, banners, notícias e CSS de módulos chegam via scripts posteriores; o slot pode ficar sem altura inicial | `public/nichelle.js`, snippet de integração | CLS na seção se slot não existir no HTML/CSS crítico | Médio | Média | Reserva geométrica antes de iniciar runtime; medir no preview e declarar limites de campo |
| Build usa allowlist dos 3 assets mas não limpa `vercel/dist` antes de montar | `vercel/build.mjs` | Arquivo residual pode ser incluído no artefato de deployment | Médio | Média | Limpar somente o diretório fixo de output e copiar apenas assets/fixtures aprovados |
| Workflow manual de publicação não restringe o ref a `main` na condição do job | `.github/workflows/publicar-nichelle-*.yml` | Se variáveis externas estiverem ligadas, despacho manual em outro ref pode publicar asset | Médio | Média | Restringir execução operacional ao ref `main`; manter build de `develop` em preview Vercel |

## Trabalho realizado nesta etapa

- Criada prévia visual estática e explicitamente demonstrativa, servida em `/preview/`; assets copiados por allowlist. O runtime estrutural só atua em fixture marcada e host de preview permitido.
- Adicionado carregamento opcional de configuração pública da galeria no JS base FWR. A URL é informada uma vez no HTML da LI; o painel publica JSON que o runtime lê com `credentials: omit`, `cache: no-store`, HTTPS, sem query/credenciais e redirects recusados.
- A reserva do slot permanece enquanto o endpoint carrega ou falha, mostrando aviso neutro em vez de modificar/reordenar elementos nativos. Isso evita salto no slot em fixture; a presença real desse slot estável ainda precisa ser verificada no tema LI.
- A base técnica da Malheiro foi observada e comparada por hash; o script comercial e seletores específicos não são carregados na Nichelle.

## Medição local da prévia — 2026-11-09

Captura CDP em Chrome headless, página inteira, sem throttling e sem interação, nos sete viewports pedidos: 1920, 1440, 1280, 768, 390, 375 e 320 px. CLS foi 0 em todas as sete amostras; LCP de laboratório ficou entre 92 e 452 ms; 0 imagens falhas, 0 erros de console/rede e 0 iframes antes de interação. Transferência observada: 114–119 KB, sujeita ao que Resource Timing expõe. INP não foi medido. Este fixture local sintético não representa LCP/CLS do tema, conteúdo, consentimento ou CDN da loja real.

Capturas full-page e JSON com medidas estão em `qa/artifacts/preview-final/`; a suíte de screenshots ainda não prova equivalência visual pixel-a-pixel com a rasterização de referência. A arte de referência não fornece responsividade móvel funcional.

## Riscos de Core Web Vitals

- **LCP:** imagens de produto e banner principal pertencem à Loja Integrada e precisam continuar sob sua estratégia de carregamento. Fixtures devem usar dimensões explícitas e dados demonstrativos, sem alterar prioridades do site real.
- **CLS:** movimentar vitrines/formulários depois do paint é o risco estrutural dominante. O CSS do preview deve reservar proporções; sem slot inicial no tema, não alegar mitigação na LI.
- **INP:** carrosséis devem usar scroll nativo, handlers locais e idempotentes. O teste sintético não mede interações comerciais reais nem plugins do tema.

## Baseline registrado (Chrome headless, 2026-11-09)

O deployment `develop` `2b211bb` servia a página informativa de assets e JS/CSS; `/preview/` retornava 404. A URL oficial não abriu no leitor web, mas abriu no Chrome local como uma página com uma única imagem rasterizada de 22,402,799 bytes e altura de 8,550 CSS px. A página não forneceu viewport mobile: em emulação 390px, o `innerWidth` ficou em 1,250px. Assim, o HTML não permite inferir breakpoints nem comportamento móvel. As 11 capturas fornecidas pelo cliente passam a ser as referências visuais para as seções.

Ver [performance-baseline.md](./performance-baseline.md) para os valores observados na home e em `/cabelos`. Foi uma execução por viewport, sem throttling e com cache desativado; são sinais de laboratório, não p75 de campo. INP não foi medido (nenhuma interação do usuário na página). Nenhuma meta é declarada atingida a partir dessa amostra.
