# Plano de homologação — Nichelle Imports

**O que mudará:** somente módulos CUSTOM-FWR. Loja Integrada continuará administrando logo, hero/banner principal, menus, categorias, vitrines nativas, conta, catálogo, preços, estoque, carrinho, pagamento e frete. Runtime e painel estão implementados em `develop`; não foram instalados nem publicados na loja.

## Fase 1 — mapeamento e decisão de fronteira (concluída)

- Registrar a composição de `index1.html`, viewports e limitações da imagem raster em `docs/02-ANALISE-INDEX1-2026.md`.
- Classificar recursos nativos da LI, a galeria exclusiva FWR e blocos sem origem comprovada em `docs/01-INVENTARIO-NATIVO-VS-CUSTOM.md`.
- Manter dashboard restrito à galeria FWR. Nenhuma seção `INDEFINIDO` foi incluída.

## Fase 2 — galeria YouTube Shorts (código implementado; tema/mídia pendentes)

- Base Malheiro identificada e auditada com caminho, SHA-256, dependências e delta em `docs/04-DASHBOARD-SETTINGS-ARQUITETURA.md`.
- Aceita Shorts, `watch` e `youtu.be`, valida host/ID e armazena URL Shorts canônica sem parâmetros de tracking.
- Capa automática tenta thumbnail vertical e fallbacks horizontais; capa personalizada exige HTTPS e host permitido por `NICHELLE_POSTER_HOSTS`.
- Player YouTube privacy-enhanced é criado somente depois do clique. Modal oferece botão, Escape, pausa e retorno do foco.
- O runtime exige `#fwr-nichelle-video-slot`; o tema precisa fornecer esse marcador junto com a classe `.fwr-nichelle-video-slot` no HTML inicial após a faixa de marcas e antes da vitrine promocional.
- Breakpoint implementado: quatro colunas a partir de 768px e scroll-snap horizontal abaixo de 768px. O comportamento móvel precisa de homologação porque a imagem de referência é fixa e não exibe reflow.
- `public/galeria-publicada.json` e `public/galeria-preview.json` iniciam vazios/desligados. Faltam os quatro links reais e a aprovação das respectivas mídias.

## Fase 3 — dashboard (código implementado; infraestrutura pendente)

- Editor da galeria permite adicionar até quatro slots, editar links/capas/descrições, visualizar thumbnail, remover e reordenar cards, ativar/desativar cards e seção.
- Salvar rascunho, prévia autenticada, publicar quatro cards ativos e rollback versionado.
- A senha é verificada no servidor contra `NICHELLE_ADMIN_PASSWORD_HASH`; sessão exige HTTPS, usa `HttpOnly`, `Secure`, `SameSite=Strict`, CSRF e ID regenerado. Rate-limit de tentativas usa lock de arquivo.
- `NICHELLE_DATA_DIR` precisa ser precriado, gravável e fora do document root. Senha, hash, segredo e conteúdo privado não devem ir para o JavaScript público.
- A hospedagem PHP real, variáveis de ambiente, bloqueio web `/server/`, CORS, MIME JSON, cache/ETag e propagação de publicação ainda precisam ser configurados e validados.

## Fase 4 — homologação na Loja Integrada (não iniciada)

1. Obter um tema/loja de homologação e fazer backup de HTML/Cabeçalho, HTML/Rodapé e CSS atuais.
2. Confirmar que o tema permite inserir `#fwr-nichelle-video-slot.fwr-nichelle-video-slot` no slot visual definido. Se não houver inserção inicial estável, não instalar o módulo nessa loja.
3. Configurar URLs públicas HTTPS do host FWR e CORS; substituir `BASE_URL_PUBLICA` nos snippets. Cabeçalho carrega CSS; Rodapé carrega runtime/config.
4. Usar `integracao/cabecalho-teste.html` e `integracao/rodape-teste.html` na homologação. A fixture local usa IDs sintéticos apenas para testar interface; não usar suas URLs como conteúdo.
5. Conferir 360/390/820/1440px; clique/player, fechamento por botão/Escape, foco, thumbnail/fallback e erro/offline; inspecionar console e rede.
6. Comparar CLS/LCP/INP com baseline e conferir header, navegação, vitrines, produtos, preço, estoque, carrinho, checkout e scripts de terceiros sem efetuar compra.
7. Homologação ainda exige acesso ao tema e aos quatro links reais. Não houve publicação na loja nem mudança em `main`.

## Risco de layout e publicação

O CSS reserva proporção 9:16 nos cards e uma altura aproximada no slot, antes de buscar JSON. Isso reduz deslocamento quando o tema fornece o marcador inicial; não prova CLS próximo de zero no tema da Nichelle. Se a reserva permanecer vazia em estado disabled/offline, pode haver espaço em branco; se o marcador não existir, o runtime falha sem injetar no fim da página. Medir ambos os estados em homologação e ajustar a reserva antes de liberação.

Os arquivos HTML/Cabeçalho e HTML/Rodapé estão preparados como snippets de homologação com placeholders. Não há URL pública verificada para CSS, JavaScript ou configuração no momento. Atualizações do dashboard só chegam à loja depois que o JSON público estiver hospedado em infraestrutura FWR com CORS, MIME, versão/cache e rollback acessíveis.
