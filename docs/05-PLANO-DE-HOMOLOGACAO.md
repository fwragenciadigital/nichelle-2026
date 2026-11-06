# Plano de homologação — Nichelle Imports

**O que mudará:** apenas os módulos especiais CUSTOM-FWR. A plataforma continuará administrando logo, hero principal, menu, categorias, vitrines nativas, conta, carrinho, catálogo, pagamento e frete.

## Fase 1 — mapeamento para aprovação (concluída nesta PR)
- Registrar a composição completa de `index1.html`, viewports observados e as limitações da referência raster em `docs/02-ANALISE-INDEX1-2026.md`.
- Classificar as áreas nativas da LI, a galeria FWR prevista no briefing e os blocos sem origem comprovada em `docs/01-INVENTARIO-NATIVO-VS-CUSTOM.md`.
- Especificar a galeria, campos, integrações e risco de CLS sem implementar runtime ou dashboard.
- Pendência de aprovação: confirmar a classificação dos blocos `INDEFINIDO`, a solução responsiva da galeria e o slot real no tema. Confirmar ainda tipo de tema e permissões HTML/Cabeçalho/HTML/Rodapé no painel LI.

### Gate para começar a implementação
**GO restrito à implementação da galeria** quando o cliente aprovar este mapa, confirmar que o módulo será administrado pela FWR, aprovar o comportamento mobile e existir um slot estável confirmado no tema de homologação. Até lá, a fase de código fica em espera. Esta aprovação não autoriza instalar ou publicar na loja.

## Fase 2 — módulo de vídeo
- Receber URLs finais dos 4 posters/vídeos hospedados à parte.
- Implementar HTML/CSS/JS próprios, arquivos separados e CSS prefixado.
- Manter `enabled=false` na configuração até testar.
- Cobrir 1440/820/390/360px, reprodução sob demanda, acessibilidade e CLS; autoplay permanece desativado.

## Fase 3 — mini dashboard
- Formulário privado do módulo, prévia e publicação versionada com rollback.
- JSON público hospedado na FWR (fonte GitHub privada), token só no backend.
- Validar cache/CORS/MIME, isolamento staging/produção e fallback se offline.
- Nunca oferecer edição de HTML/JS arbitrário nem elementos nativos da LI.

## Fase 4 — homologação na Loja Integrada
- Fazer backup de HTML/Cabeçalho, HTML/Rodapé e CSS atuais.
- Inserir **somente em loja/ambiente de teste aprovado** um loader JS e CSS FWR; nenhum script duplo.
- Conferir catálogo, menu, carrinho, variações, frete, checkout, Quiz/terceiros se houver, sem compra real.
- Capturar CLS/LCP antes/depois e comparar rede/console/viewport.
- Só depois criar pacote final e solicitar aprovação para publicar.

## Gate de liberação/homologação
Um GO de fase 1 permite apenas iniciar implementação isolada. Um GO de publicação/homologação exige mídia real verificada, slot e comportamento móvel aprovados, testes de reprodução/acessibilidade/fallback, evidência de CLS e nenhuma regressão em recursos nativos. Resultado de performance só será reportado quando realmente medido. Publicar na loja exige autorização separada; merge em `main` continua proibido sem aprovação.
