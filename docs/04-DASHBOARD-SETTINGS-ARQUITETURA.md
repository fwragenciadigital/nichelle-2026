# FWR Control — dashboard exclusivamente para módulos customizados

**Status:** proposta de arquitetura para aprovação. Nenhum dashboard ou endpoint foi implementado nesta fase.

## Base técnica do runtime

Por decisão do usuário, o runtime de Nichelle usará a base JavaScript da Malheiro. Antes de iniciar a implementação, identificar e fixar o caminho/revisão exatos da fonte, revisar dependências, seletores e inicializações, e documentar o delta de adaptação para a Loja Integrada de Nichelle. Reutilizar a fundação técnica não transfere catálogo, imagens, vídeos, URLs, configuração comercial nem comportamento de compra específico da Malheiro. Preservar a inicialização nativa da LI e evitar duplicar plugins.

## Fronteira do sistema

O painel **NÃO** edita logo, banners nativos, categorias nativas, vitrines nativas, produtos/preço/estoque, checkout, carrinho ou frete. Esses recursos continuam no painel da Loja Integrada.

O painel gerencia apenas conteúdo/flags dos componentes implementados pela FWR, começando por vídeo editorial.

## Fluxo proposto

```text
Admin FWR autenticado (rascunho + preview)
  ↓
Backend de publicação (auth + validação JSON Schema + sanitização)
  ↓
Histórico privado no GitHub (versões + rollback)
  ↓
publicação pública e sem credenciais de published.json em infraestrutura FWR
  ↓
JS FWR inserido na Loja Integrada lê JSON público somente em modo leitura
  ↓
seção FWR é montada em slot estável e predeterminado
```

**Repositório privado:** código de origem e histórico GitHub não são o host público dos arquivos consumidos na loja. **Não usar** `raw.githubusercontent.com` ou jsDelivr de repo privado como endpoint público. Publicação na infraestrutura da FWR deve usar CORS correto, HTTPS, MIME `application/json`, cache controlado/ETag e versão rastreável.

## MVP mínimo
- Autenticação (idealmente FWR SSO ou sessão segura), perfis editor/admin.
- Editor somente dos campos declarados no schema; não permitir HTML/JS arbitrário.
- Rascunho, prévia segura, publicar, reverter, log de autor/data/diff.
- `published.json` público de apenas leitura, sem segredo/token.
- Validação de URLs, limites de arquivos, allowlist de hosts de mídia e sanitização do conteúdo. HTTPS isoladamente não é allowlist: MP4 e Vimeo exigem validação de host/URL conforme `provider`.
- CDN TTL curto conhecido; publicação não é instantânea em todos os navegadores. Medir tempo de propagação.
- Runtime aceita somente schema/versão válidos. Com módulo desligado ou sem itens ativos, não cria seção; com resposta lenta, inválida ou indisponível, mantém o slot no estado inicial estável e não injeta bloco depois do first paint. O último conteúdo publicado só pode ser usado se já estiver disponível sem deslocamento; o fallback não reordena vitrines nativas.
- Pipeline separado dev/staging/prod e revisão antes de produção.
- **Preço, estoque, desconto e disponibilidade** continuam sendo dados nativos da Loja Integrada, nunca JSON do painel.

## Escolha recomendada
GitHub privado como fonte versionada e um pequeno backend autenticado no domínio FWR para gravar/publicar JSON. Não criar banco complexo na v1 se não houver necessidade; considerar DB apenas com muitos usuários, agendamentos e auditoria avançada.

**Trade-off:** dashboard com atualização remota implica uma dependência externa de JSON. Se código e configuração forem 100% publicados dentro da Loja Integrada, as edições externas deixam de propagar automaticamente.

## Contrato mínimo da integração pública

- Um endpoint HTTPS de leitura fornece somente `published.json` sanitizado; o endpoint de rascunho/preview permanece autenticado.
- Resposta pública não inclui token, IDs administrativos, dados privados do tenant ou payload cru de fornecedor. A loja não recebe credencial de escrita.
- Configuração do CDN registra `Access-Control-Allow-Origin` para a origem da loja (ou política pública explicitamente aprovada), `Content-Type: application/json`, `ETag`/versão e TTL/cache.
- Publicação e rollback criam uma versão identificável; rollback troca o ponteiro/artefato publicado sem reescrever configuração nativa da Loja Integrada.
- Ausência de endpoint, rejeição de CORS, erro HTTP ou JSON inválido deixa os componentes nativos intactos e mantém a geometria inicial do slot.
- A operação dependerá de infraestrutura hospedada pela FWR; sem endpoint público, edição no dashboard não chega à loja automaticamente.
