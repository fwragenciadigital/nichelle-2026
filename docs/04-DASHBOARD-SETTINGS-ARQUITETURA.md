# FWR Control — dashboard exclusivamente para módulos customizados

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
- Validação de URLs, limites de arquivos, domínio confiável para mídias e sanitização do conteúdo.
- CDN TTL curto conhecido; publicação não é instantânea em todos os navegadores. Medir tempo de propagação.
- Runtime usa último conteúdo válido ou fallback estável se fetch falhar. Evitar CLS com renderização tardia.
- Pipeline separado dev/staging/prod e revisão antes de produção.
- **Preço, estoque, desconto e disponibilidade** continuam sendo dados nativos da Loja Integrada, nunca JSON do painel.

## Escolha recomendada
GitHub privado como fonte versionada e um pequeno backend autenticado no domínio FWR para gravar/publicar JSON. Não criar banco complexo na v1 se não houver necessidade; considerar DB apenas com muitos usuários, agendamentos e auditoria avançada.

**Trade-off:** dashboard com atualização remota implica uma dependência externa de JSON. Se código e configuração forem 100% publicados dentro da Loja Integrada, as edições externas deixam de propagar automaticamente.
