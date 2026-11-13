# Plano de homologação — Nichelle Imports

**Escopo vigente (2026-11-09):** runtime único `public/nichelle.js`, galeria editorial de quatro Shorts e dashboard PHP protegido já existente. A integração LI receberá uma única URL HTTPS da configuração publicada após a hospedagem ser aprovada. A prévia visual em `/preview/` é isolada e não equivale à homologação da loja.

## Fase 1 — fronteiras e prévia

- Inventário nativo/custom/indefinido: `docs/01-INVENTARIO-NATIVO-VS-CUSTOM.md` e `docs/09-MAPEAMENTO-ESTRUTURAS-PREVIA.md`.
- Referência rasterizada, 11 capturas recebidas e limitações desktop/mobile: `docs/02-ANALISE-INDEX1-2026.md`.
- A página de prévia usa os assets reais do runtime e SVGs sintéticos locais claramente identificados; não contém produtos, preços, estoque ou funcionalidades reais.
- `Nichelle27Framework` pode apresentar a composição integral somente em fixture/preview. No host oficial, o modo opt-in só reconhece o slot existente da galeria; não toca header, rodapé, vitrines, banners ou formulários nativos.
- O runtime oficial da galeria carrega `public/nichelle.css` ao lado de `public/nichelle.js` na mesma origem. URLs públicas de homologação no alias `develop`: `https://nichelle-2026-git-develop-fwragenciadigitals-projects.vercel.app/nichelle.js` e `/nichelle.css`; `/preview/` contém a prévia isolada.
- A integração Git-Vercel cria deployment após push em `develop` e atualiza o alias da branch quando concluído. A configuração publicada `/galeria-publicada.json` ainda responde 404 nesse host; vídeos reais e endpoint público sanitizado continuam necessários para homologar a galeria completa.

## Fase 2 — galeria Shorts

- Quatro URLs finais ainda dependem da Nichelle. Enquanto faltarem, a configuração da integração permanece desligada e vazia.
- Runtime aceita URL Shorts, `youtube.com/watch` e `youtu.be`; valida o ID e cria iframe `youtube-nocookie` somente após interação.
- Thumbnail automática/fallback, capa opcional, proporção 9:16, modal, botão/ESC, pausa e retorno de foco são cobertos pela suíte do módulo.
- O breakpoint candidato é quatro colunas a partir de 768px e scroll-snap abaixo disso; a referência rasterizada não comprova experiência móvel.
- A base técnica de Malheiro e o delta de adaptação estão documentados em `docs/04-DASHBOARD-SETTINGS-ARQUITETURA.md`. O script comercial da Malheiro não deve ser carregado na Nichelle.

## Dashboard e publicação

- Validar PHP disponível, HTTPS, hash de senha e segredo de sessão apenas no servidor, armazenamento privado fora do document root, CORS/MIME/cache do JSON público.
- Exercitar login, CSRF, rate-limit, rascunho, prévia, publicar e rollback em ambiente de homologação com credenciais operacionais fornecidas pela FWR.
- Testar a integração remota do runtime com resposta válida, desativada, vazia, inválida, sem CORS e falha de rede.
- O workspace local não tem ambiente PHP nem variáveis/host do servidor; os testes reais do dashboard e propagação no host seguem pendentes. A suíte CI deve validar sintaxe PHP quando o runner tiver PHP.
- O dashboard edita exclusivamente o módulo `videoGallery`; qualquer seção nativa permanece administrada pela Loja Integrada.

## Fase 3 — homologação na Loja Integrada (não iniciada)

1. Obter tema/loja de homologação e backup dos campos HTML/Cabeçalho, HTML/Rodapé e CSS.
2. Confirmar se o tema pode fornecer `#fwr-nichelle-video-slot.fwr-nichelle-video-slot` na posição visual entre marcas e promocionais. Sem slot inicial estável, não instalar.
3. Validar novamente no alias Vercel de `develop` o deployment mais recente, MIME, cache, CSP e URL exata de distribuição. Hospedar e validar também o JSON publicado com CORS e MIME; hoje `/galeria-publicada.json` responde 404. Não usar URL de repositório privado ou placeholder.
4. Usar `integracao/html-galeria-shorts.html` e `integracao/rodape-loader-unico.html` somente após acesso autorizado ao ambiente de homologação. Não transferir HTML ou conteúdo de `/preview/` para produção.
5. Testar quatro URLs reais, thumbnails/fallbacks, reprodução, fechamento por botão/ESC, teclado/foco, falhas de rede e comportamento sem vídeos nos viewports 360, 390, 820 e 1440.
6. Medir CLS/LCP/INP na homologação e verificar topo, menu, busca, banners, vitrines, produtos, preço, estoque, carrinho e checkout sem completar pedidos.
7. Obter aprovação final do cliente antes de qualquer instalação ou publicação na loja.

## Riscos e limites de evidência

- Nenhum seletor/slot do editor real foi confirmado nesta rodada.
- As medidas locais são laboratório e não field data; INP exige interação representativa e não será inferido de ausência de eventos.
- Claims, selos, links, marcas, datas, imagens e condições comerciais das capturas devem ser validados antes de publicação.
- Não haverá deploy de produção, alteração na Loja Integrada nem merge em `main` nesta entrega.
