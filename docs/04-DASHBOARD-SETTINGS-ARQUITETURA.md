# FWR Control — dashboard exclusivamente para módulos customizados

**Status:** código do runtime, dashboard PHP e fluxo local de rascunho/publicação/rollback implementado em `develop`. Hospedagem pública FWR, ambiente PHP configurado, CORS/cache e integração real com o tema LI ainda não foram configurados nem verificados.

## Base técnica do runtime

Por decisão do usuário, o runtime de Nichelle usa como referência técnica a base JavaScript da Malheiro, com fonte, revisão, dependências e delta registrados abaixo. Reutilizar a fundação técnica não transfere catálogo, imagens, vídeos, URLs, configuração comercial nem comportamento de compra específico da Malheiro. Preservar a inicialização nativa da LI e evitar duplicar plugins.

### Fonte auditada para a galeria Nichelle

- Arquivo de referência: `C:\Users\willp\OneDrive\Documentos\Malheiro\entrega-loja-integrada\malheiroshoww-estabilizado.js`.
- SHA-256 observado: `433535DBEC3FA31FF9FF5FF016A972EDB26AE6A1C2985329B7BB33EFB1967220`.
- A nota de reteste v2 no mesmo diretório identifica `malheiroshoww-estabilizado.js` como script ativo na Malheiro. A fonte é um script de customização amplo da loja de origem: depende de jQuery, manipula header/menu/carrinho, aplica configurações visuais e integra componentes exclusivos da Malheiro.
- Delta autorizado/adotado aqui: manter a fronteira da Loja Integrada, usar inicialização encapsulada e idempotente, esperar DOM pronto e não duplicar o ciclo de plugins da loja. O runtime de galeria permanece isolado em `public/galeria-videos.js`; não copiamos o script comercial amplo nem seus seletores, produtos, mídia, URLs ou settings. O CSS e o dashboard pertencem apenas ao módulo Nichelle.
- A fonte fica fora do repositório; o SHA registra a variante auditada, mas não a distribui nem substitui a validação final de conflitos no tema LI de homologação.

## Fronteira do sistema

O painel **NÃO** edita logo, banners nativos, categorias nativas, vitrines nativas, produtos/preço/estoque, checkout, carrinho ou frete. Esses recursos continuam no painel da Loja Integrada.

O painel gerencia apenas conteúdo/flags dos componentes implementados pela FWR, começando por vídeo editorial.

## Fluxo proposto

```text
Admin FWR autenticado (rascunho + preview)
  ↓
Backend de publicação (auth + validação de contrato/schema + sanitização)
  ↓
Rascunho/histórico em diretório configurado fora do document root
  ↓
publicação pública, somente leitura, de `public/galeria-publicada.json` na infraestrutura FWR
  ↓
JS FWR inserido na Loja Integrada lê JSON público somente em modo leitura
  ↓
seção FWR é montada em slot estável e predeterminado
```

**Repositório privado:** o repositório guarda código de origem; o backend de homologação implementado armazena rascunho e histórico em `NICHELLE_DATA_DIR` externo ao document root (não em GitHub). **Não usar** `raw.githubusercontent.com` ou jsDelivr de repo privado como endpoint público. A publicação na infraestrutura da FWR ainda exige CORS, HTTPS, MIME `application/json`, cache/ETag conhecidos e versão rastreável; nenhum host público foi configurado ou verificado nesta entrega.

## MVP implementado e pendências de hospedagem
- O painel usa senha verificada por `password_verify()` com hash em variável de ambiente, sessão HTTPS segura, CSRF, ID regenerado no login e rate-limit com lock. Credenciais não entram no JavaScript.
- O editor oferece somente os campos YouTube definidos no schema; HTML/JS arbitrário, MP4/Vimeo e configurações nativas não fazem parte da V1.
- Rascunho, prévia autenticada, publicar e rollback ficam em PHP; versões privadas usam `NICHELLE_DATA_DIR` fora do document root.
- O artefato público read-only é `public/galeria-publicada.json`, sem senha/token. A loja lê somente essa configuração.
- O servidor valida Shorts/`watch`/`youtu.be`, URL canônica e allowlist de host para capas personalizadas. HTTPS isoladamente não libera host externo.
- Hospedagem/CDN ainda precisa de CORS, MIME `application/json`, HTTPS, cache/ETag/versão e medição de propagação antes de instalar em homologação.
- O runtime aceita somente o schema/versão válidos e só monta no slot fixo. Se o JSON falhar ou a galeria estiver desligada, não injeta conteúdo nem reordena vitrines; o slot inicial pode permanecer vazio/reservado.
- **Preço, estoque, desconto e disponibilidade** continuam sendo dados nativos da Loja Integrada, nunca JSON do painel.

## Escolha recomendada
GitHub privado como fonte versionada e um pequeno backend autenticado no domínio FWR para gravar/publicar JSON. Não criar banco complexo na v1 se não houver necessidade; considerar DB apenas com muitos usuários, agendamentos e auditoria avançada.

**Trade-off:** dashboard com atualização remota implica uma dependência externa de JSON. Se código e configuração forem 100% publicados dentro da Loja Integrada, as edições externas deixam de propagar automaticamente.

## Contrato da integração pública

- Um endpoint HTTPS de leitura fornece somente `public/galeria-publicada.json` sanitizado; `admin/draft.php` e `admin/preview.php` permanecem autenticados.
- Resposta pública não inclui token, IDs administrativos, dados privados do tenant ou payload cru de fornecedor. A loja não recebe credencial de escrita.
- Configuração do CDN registra `Access-Control-Allow-Origin` para a origem da loja (ou política pública explicitamente aprovada), `Content-Type: application/json`, `ETag`/versão e TTL/cache.
- Publicação e rollback criam uma versão identificável; rollback troca o ponteiro/artefato publicado sem reescrever configuração nativa da Loja Integrada.
- Ausência de endpoint, rejeição de CORS, erro HTTP ou JSON inválido deixa os componentes nativos intactos e mantém a geometria inicial do slot.
- A operação dependerá de infraestrutura hospedada pela FWR; sem endpoint público, edição no dashboard não chega à loja automaticamente.
