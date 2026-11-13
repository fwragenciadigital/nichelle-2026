# Arquitetura do dashboard FWR — galeria de vídeos

> **Escopo vigente (2026-11-09):** o pedido direto mais recente retomou o dashboard protegido por senha e publicação remota. A seção especial administrada é somente a galeria FWR. O documento `docs/07` registra a decisão simplificada anterior, agora substituída nessa parte; sua prévia visual continua válida. Recursos nativos da Loja Integrada permanecem fora do painel FWR.

## Base técnica do runtime

Por decisão do usuário, o runtime de Nichelle usa como referência técnica a base JavaScript da Malheiro, com fonte, revisão, dependências e delta registrados abaixo. Reutilizar a fundação técnica não transfere catálogo, imagens, vídeos, URLs, configuração comercial nem comportamento de compra específico da Malheiro. Preservar a inicialização nativa da LI e evitar duplicar plugins.

### Fonte auditada para a galeria Nichelle

- Arquivo de referência: `C:\Users\willp\OneDrive\Documentos\Malheiro\entrega-loja-integrada\malheiroshoww-estabilizado.js`.
- SHA-256 previamente observado na fonte externa: `433535DBEC3FA31FF9FF5FF016A972EDB26AE6A1C2985329B7BB33EFB1967220`.
- Snapshot presente no repositório (`src/referencias/base-tema-malheiro-NAO-CARREGAR.js`, 159.899 bytes) foi calculado nesta rodada como `F8C3C9460333D50E1722AE3FA14CEE05CC3A01C38CD16A74737372242953BBDA`; os hashes são diferentes. Não afirmar que o snapshot é byte a byte a fonte externa sem reconciliação.
- A nota de reteste v2 no mesmo diretório identifica `malheiroshoww-estabilizado.js` como script ativo na Malheiro. A fonte é um script de customização amplo da loja de origem: depende de jQuery, manipula header/menu/carrinho, aplica configurações visuais e integra componentes exclusivos da Malheiro.
- Delta técnico adotado para Nichelle: manter a fronteira da Loja Integrada, encapsular/inicializar de modo idempotente, esperar o DOM e não duplicar o ciclo de plugins da loja. A discrepância de hash do snapshot precisa ser reconciliada antes de alegar rastreabilidade byte a byte. Não carregar o script Malheiro comercial, nem copiar seu catálogo, mídia, URLs, settings ou seletores específicos.
- A fonte fica fora do repositório; o SHA registra a variante auditada, mas não a distribui nem substitui a validação final de conflitos no tema LI de homologação.

### Assets CDN enviados para auditoria em 2026-11-13

Os links fornecidos pelo cliente foram consultados como referência da base Malheiro; eles não são um export do HTML/CSS do tema Nichelle.

| Arquivo | URL | HTTP/MIME | Bytes | SHA-256 observado |
|---|---|---|---:|---|
| JavaScript | [`malheiroshoww-estabilizado.js`](https://cdn.awsli.com.br/1351/1351790/arquivos/malheiroshoww-estabilizado.js) | 200 · `application/x-javascript` | 159.549 | `D504599D2629873C8CF889C121C8918ED692A7F720F4F599D7762DDBBA5C2E2A` |
| CSS | [`csscompactadoo.css`](https://cdn.awsli.com.br/1351/1351790/arquivos/csscompactadoo.css) | 200 · `text/css` | 252.760 | `EFE3F3A7E383C1AFA12F2440603DCC12D03BC3673896FCEBABAA69680735D5C9` |

O JavaScript remoto depende de jQuery e executa alterações amplas em elementos da loja de origem, incluindo header, menu, botões e carrinho. O CSS também contém seletores e componentes próprios da Malheiro. Os hashes do JavaScript remoto diferem dos dois registros anteriores acima; não substituir nem igualar esses registros sem reconciliação da versão. Não carregar nenhum dos dois assets diretamente na Nichelle. Reaproveitar somente padrões técnicos após revisão e adaptação aos seletores reais da Nichelle, com estilos isolados e preservação dos handlers/comportamentos nativos da Loja Integrada.

Para adaptar e validar o visual do layout final nos arquivos oficiais, permanece necessário o export HTML/CSS do tema Nichelle ou acesso a um tema de homologação. Os links Malheiro não fornecem o DOM nem os seletores da loja destino.

## Fronteira do sistema

O painel **NÃO** edita logo, banners nativos, categorias nativas, vitrines nativas, produtos/preço/estoque, checkout, carrinho ou frete. Esses recursos continuam no painel da Loja Integrada.

O painel gerencia apenas conteúdo/flags dos componentes implementados pela FWR, começando por vídeo editorial.

## Fluxo implementado e pendências de hospedagem

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

## Segurança e contrato implementados
- O painel usa senha verificada por `password_verify()` com hash em variável de ambiente, sessão HTTPS segura, CSRF, ID regenerado no login e rate-limit com lock. Credenciais não entram no JavaScript.
- O editor oferece somente os campos YouTube definidos no schema; HTML/JS arbitrário, MP4/Vimeo e configurações nativas não fazem parte da V1.
- Rascunho, prévia autenticada, publicar e rollback ficam em PHP; versões privadas usam `NICHELLE_DATA_DIR` fora do document root.
- O artefato público read-only é `public/galeria-publicada.json`, sem senha/token. A loja lê somente essa configuração.
- O servidor valida Shorts/`watch`/`youtu.be`, URL canônica e allowlist de host para capas personalizadas. URL de capa exige HTTPS sem query ou fragmento; HTTPS isoladamente não libera host externo.
- Hospedagem/CDN ainda precisa de CORS, MIME `application/json`, HTTPS, cache/ETag/versão e medição de propagação antes de instalar em homologação.
- O runtime aceita somente o schema/versão válidos e só monta no slot fixo. A integração LI informa `configUrl` uma vez; a publicação do dashboard altera o JSON lido pelo runtime, sem nova edição manual para cada vídeo. Falha de rede/configuração conserva o espaço e apresenta aviso neutro.
- **Preço, estoque, desconto e disponibilidade** continuam sendo dados nativos da Loja Integrada, nunca JSON do painel.

## Armazenamento escolhido e alternativas futuras
Na implementação atual, o backend PHP grava rascunhos, histórico e estado de publicação em arquivos dentro de `NICHELLE_DATA_DIR`, configurado fora do document root. GitHub privado guarda somente o código-fonte versionado; não participa do fluxo operacional de edição/publicação. Banco de dados ou armazenamento versionado remoto permanecem alternativas futuras se houver necessidade de múltiplos editores, agendamentos ou auditoria avançada.

**Trade-off:** dashboard com atualização remota depende de endpoint JSON público hospedado pela FWR e de cache/propagação configurados. Se código e configuração forem publicados somente dentro da Loja Integrada, as edições externas deixam de propagar automaticamente.

## Contrato da integração pública

- Um endpoint HTTPS de leitura fornece somente `public/galeria-publicada.json` sanitizado; `admin/draft.php` e `admin/preview.php` permanecem autenticados.
- Resposta pública não inclui token, IDs administrativos, dados privados do tenant ou payload cru de fornecedor. A loja não recebe credencial de escrita.
- Configuração do CDN registra `Access-Control-Allow-Origin` para a origem da loja (ou política pública explicitamente aprovada), `Content-Type: application/json`, `ETag`/versão e TTL/cache. O runtime omite credenciais, desativa cache local e recusa redirecionamentos e query string.
- Publicação e rollback criam uma versão identificável; rollback troca o ponteiro/artefato publicado sem reescrever configuração nativa da Loja Integrada.
- Ausência de endpoint, rejeição de CORS, erro HTTP ou JSON inválido deixa os componentes nativos intactos e mantém a geometria inicial do slot.
- A operação dependerá de infraestrutura hospedada pela FWR; sem endpoint público, edição no dashboard não chega à loja automaticamente.
