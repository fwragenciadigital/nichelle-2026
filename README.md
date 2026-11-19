> **ARQUITETURA ATUAL (06/11/2026):** código único `public/nichelle.js` + Shorts editáveis no HTML da Loja Integrada. **Não usamos dashboard PHP/JSON na fase 1**. Consulte [docs/07-ARQUITETURA-SIMPLIFICADA-GIT-HTML.md](docs/07-ARQUITETURA-SIMPLIFICADA-GIT-HTML.md) e [docs/08-PUBLICACAO-AUTOMATICA-GIT.md](docs/08-PUBLICACAO-AUTOMATICA-GIT.md). Documentação de painel abaixo é histórica e não deve ser implantada.

# Nichelle Imports · Projeto 2026

**Repositório privado com catálogo e conteúdo próprios; a galeria isolada usa como referência técnica a base JavaScript da Malheiro auditada e registrada em [docs/04](docs/04-DASHBOARD-SETTINGS-ARQUITETURA.md).**

- Loja atual: https://www.nichelleimports.com.br/
- Protótipo 2026 (**URL exata**): https://projetos.fwragenciadigital.com.br/nichelle/2026/index1.html
- Branch de implementação: `develop` (PR Draft para `main`)
- **Prompt do Codex:** [PROMPT_INICIAL_CODEX.md](./PROMPT_INICIAL_CODEX.md)
- Instruções complementares: [CODEX.md](./CODEX.md)

## Fronteira de responsabilidades

**Loja Integrada continua administrando** logo, banner principal, menu, categorias, busca, vitrines nativas, produtos, estoque, preço, carrinho e checkout.

**A FWR administra somente seções exclusivas criadas à parte**, inicialmente a galeria editorial de vídeos verticais de produtos (4 cards 9:16, poster, overlay e play) do briefing. Outras seções só serão adicionadas após mapear fielmente o protótipo.

## Painel FWR

O admin em `admin/index.php` gerencia somente a galeria FWR: rascunho, prévia autenticada, publicar e rollback com histórico privado. Hash de senha, segredo de sessão e diretório privado vêm do ambiente do servidor. O JS público lê somente `public/galeria-publicada.json`, sem credencial administrativa. **Para refletir edições automaticamente, CSS, JS e JSON precisam de hospedagem pública HTTPS/CORS da FWR.**

## Documentação

- [Classificação de componentes nativos e exclusivos](docs/01-INVENTARIO-NATIVO-VS-CUSTOM.md)
- [Mapeamento visual do index1, viewports e slots pendentes](docs/02-ANALISE-INDEX1-2026.md)
- [Especificação da galeria de vídeos](docs/03-VIDEO-GALLERY-SPEC.md)
- [Arquitetura do dashboard](docs/04-DASHBOARD-SETTINGS-ARQUITETURA.md)
- [Plano de homologação](docs/05-PLANO-DE-HOMOLOGACAO.md)
- [Mapeamento final, instalação e evidências](docs/06-MAPEAMENTO-E-TESTES-DA-GALERIA.md)
- [Mídias a receber](assets/MANIFESTO.md)
- [Schema JSON](config/schema.json) e [defaults desligados](config/defaults.json)

## Verificação

```bash
node --test tests/*.test.mjs
node tests/fixtures/server.mjs
# em outro terminal
node tests/fixtures/browser-smoke.mjs
```

O smoke test inicia Chrome headless e visita a fixture local (os IDs dentro de `tests/fixtures/gallery.json` são sintéticos e não fazem parte do conteúdo público). PHP precisa estar instalado para lint e para subir o painel.

**Status:** runtime de galeria, editor autenticado, validação de configuração, publicação/rollback, teste automatizado e snippets de integração preparados em `develop`. A referência `index1.html` é o layout visual final pretendido; logo, banner, menu/categorias, vitrines, produtos, preços/estoque, carrinho e checkout continuam nativos da Loja Integrada. O slot real ainda precisa existir/ser confirmado no tema de homologação, e os quatro links finais não foram fornecidos. Não há host público FWR de assets confirmado. Nenhuma publicação na Loja Integrada foi feita.

## MVP galeria — suporte a YouTube Shorts

O runtime `public/galeria-videos.js` aceita URL Shorts, `watch` e `youtu.be`, canonicaliza pelo ID e cria o player apenas no clique. A capa automática usa o CDN de thumbnails do YouTube, com fallbacks e imagem personalizada em host HTTPS previamente permitido. O painel `admin/index.php` valida senha no servidor; a publicação só aceita quatro vídeos ativos. Configuração publicada e preview iniciam desligados/vazios, sem mídia inventada. Tudo permanece em `develop`; nenhuma publicação na Loja Integrada foi realizada.

### Configuração obrigatória do servidor

- `NICHELLE_ADMIN_PASSWORD_HASH`: hash gerado com `password_hash()`; senha em texto puro não vai para arquivos públicos nem para o repositório.
- `NICHELLE_SESSION_SECRET`: segredo aleatório com no mínimo 32 caracteres.
- `NICHELLE_DATA_DIR`: diretório absoluto, já criado, gravável e **fora do document root**; contém rascunho, rate limit e histórico de rollback.
- `NICHELLE_POSTER_HOSTS`: lista opcional separada por vírgula de hosts HTTPS aprovados para capas personalizadas. `i.ytimg.com` já é permitido para thumbnails automáticas.

O painel fica bloqueado até que os três primeiros requisitos estejam válidos. O host ainda precisa validar HTTPS, PHP compatível, CORS/JSON e bloqueio de acesso a `/server/`.
