# Plano de homologação — Nichelle Imports

**O que mudará:** apenas os módulos especiais CUSTOM-FWR. A plataforma continuará administrando logo, hero principal, menu, categorias, vitrines nativas, conta, carrinho, catálogo, pagamento e frete.

## Fase 1 — auditoria
- Conferir em Chromium o `index1.html` e a loja real.
- Classificar cada seção e confirmar com o cliente as seções exclusivas.
- Confirmar tipo de tema da Loja Integrada e permissão para HTML/Cabeçalho e HTML/Rodapé.

## Fase 2 — módulo de vídeo
- Receber URLs finais dos 4 posters/vídeos hospedados à parte.
- Implementar HTML/CSS/JS próprios, arquivos separados e CSS prefixado.
- Manter `enabled=false` na configuração até testar.
- Cobrir 1440/820/390/360px, autoplay, acessibilidade e CLS.

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

## Critério GO/NO-GO
GO apenas com mídia verificada, resultados reais de laboratório, funcionamento completo e nenhuma regressão de nativos. Caso contrário, NO-GO documentado.
