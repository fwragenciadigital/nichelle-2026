# CODEX — DECISÃO ANTERIOR: GitHub central + HTML editável da Loja Integrada

**Data:** 2026-11-06
**Status:** decisão simplificada anterior, datada de 2026-11-06. Em 2026-11-09 o usuário retomou explicitamente dashboard protegido e JSON público para esta entrega; consultar `docs/04-DASHBOARD-SETTINGS-ARQUITETURA.md` e `docs/05-PLANO-DE-HOMOLOGACAO.md` como contrato atual. A prévia visual isolada documentada abaixo permanece aplicável.
**Branch:** `develop` — PR #1 DRAFT. **Não publicar na loja sem aprovação.**

## Decisão técnica

A FWR mantém **um único JavaScript ativo** em `public/nichelle.js`, responsável pelas funcionalidades EXCLUSIVAS desenvolvidas no projeto Nichelle.

O cliente administra conteúdo diretamente no editor HTML da Loja Integrada, não em painel próprio:
- Links de quatro Shorts na própria seção editorial da FWR;
- No futuro, Settings de atendimento, telefone, e-mail e ícones do tema, **somente se a base de tema compatível for validada**;
- Componentes nativos (logo, banner principal, categorias nativas, vitrines nativas, carrinho, preços, estoque, checkout) **continuam no painel da Loja Integrada**.

**Esta decisão de não usar dashboard foi substituída pelo pedido direto posterior.** `admin/` e `server/` participam da homologação da galeria sob `docs/04`; nenhum artefato privado entra no build público. O `public/galeria-publicada.json` contém apenas configuração sanitizada.

## Arquivos novos e fluxo

1. `integracao/html-galeria-shorts.html` — bloco único a colar na seção HTML editável, com CSS escopado, slot visível somente se ativado e `window.FWRNichelle.galeriaVideos.shorts` editável em quatro campos. Usa URLs do YouTube, não thumbnails armazenadas à parte.
2. `public/nichelle.js` — um único runtime JavaScript idempotente; lê as variáveis HTML, valida IDs Shorts/watch/youtu.be, cria thumbnails de YouTube (fallback), monta os quatro cards com aspect ratio 9:16 e só cria iframe youtube-nocookie no clique. **Não usa jQuery, backend nem fetch de JSON.**
3. `integracao/rodape-loader-unico.html` — exatamente uma tag `script defer src="URL_PUBLICA_NICHELLE_JS"` para instalar no HTML/Rodapé, após configurar uma hospedagem HTTPS pública.
4. `src/referencias/base-tema-malheiro-NAO-CARREGAR.js` — cópia fiel da base JS da Malheiro, isolada para futuras adaptações. NÃO incluir 160kB desse script na loja Nichelle sem auditoria de seletores, funções e dependências específicas do tema.
5. `integracao/variaveis-tema-primeshop-REFERENCIA.html` — modelo de nomes de variáveis (`telefone1`, `whatsapp1`, `mail1`, `atendimentoAvancado`, `iconesMenu`, `menuFlutuante`, etc) inspirados na configuração PrimeShop fornecida. **Não instalar ainda**, pois esses globals só têm efeito quando o script de tema correspondente os consome e a ordem de carga está correta.
6. `docs/08-PUBLICACAO-AUTOMATICA-GIT.md` — opções seguras de URL pública e automação GitHub -> FWR/CDN.

### Prévia visual isolada

`/preview/` é uma fixture navegável com conteúdo local sintético para comparar visualmente as estruturas enviadas pelo cliente. Ela carrega os assets versionados para exibir composição, mas não é HTML para copiar para a loja, não habilita os Shorts, não tem dados de compra e não altera a LI. O framework Nichelle27 usado na fixture exige host de desenvolvimento/Preview e o marcador `data-nichelle-preview-fixture`; sem ambos, retorna sem modificar o DOM. O script comercial da Malheiro não faz parte do build e não é carregado.

**Um arquivo JS ativo**, porém também precisamos de CSS crítico inline no HTML do componente, para reservar geometria sem CLS. Evitar puxar CSS atrasado via JS.

## Como a publicação automática funciona de verdade

O repositório `fwragenciadigital/nichelle-2026` é **privado**. Não usar `raw.githubusercontent.com` nem `cdn.jsdelivr.net/gh/...` do repo privado como fonte de produção. GitHub Pages pode estar disponível conforme plano e configuração; não assumir sem validar.

O GitHub é a origem. É preciso uma camada de hospedagem pública (GitHub Pages habilitado ou arquivos estáticos na hospedagem FWR). Recomendação inicial: URL pública fixa `https://<HOST-FWR-CONFIRMADO>/nichelle.js` servida por HTTPS com MIME `application/javascript`, `Cache-Control` definido, e auto-deploy acionado por push/merge na `main` **após aprovação**.

O arquivo do editor HTML não precisa ser alterado a cada nova versão JS. Mudanças em `develop` **não atualizam a loja**, apenas commits publicados em `main` e implantados com sucesso; cache e eventual atraso de propagação permanecem. Não prometer atualização instantânea só por fazer commit.

## Pedido ao Codex

1. Auditar estes arquivos e corrigir fragilidades sem introduzir novo backend ou bibliotecas.
2. Confirmar se existe campo HTML de conteúdo que aceita `<style>` e `<script>`, se necessário separar CSS/config do slot para HTML/Cabeçalho e HTML/Rodapé sem mudar UX.
3. Testar com 1, 2, 3 e 4 links reais de Shorts (quando fornecidos) e módulo desligado; garantir **zero espaço vazio quando desativado**, layout estável quando ativado e operação em desktop/mobile.
4. Validar que URLs de imagens existentes não são reescritas; apenas thumbnails oficiais geradas a partir do ID do Short.
5. Confirmar que o runtime da Malheiro **não foi carregado na Nichelle**. Reutilizar apenas padrões de compatibilidade do tema após DOM e perfis reais.
6. Verificar CMS e formato da loja via inspeção do HTML, sem alterar funções nativas e sem instalar código na loja em produção.
7. Criar teste unitário/Chromium se possível, registrar CLS/LCP e riscos, e entregar HTML pronto para homologação com URL HTTPS real validada (se hospedagem estiver configurada).
8. Se faltar hospedagem, NÃO inventar URL e não publicar. Descrever o requisito mínimo de deploy.
9. Manter PR Draft e retornar GO/NO-GO para teste de homologação.

## Sobre o exemplo de variáveis enviado

A referência PrimeShop contém telefone, WhatsApp, e-mail, ícones e um token de Instagram aparentemente de outro ambiente. Esses valores **não são da Nichelle** e **não devem ser copiados nem publicados**. O modelo salvo contém apenas nomes de campos e valores neutros; credenciais/token ficaram fora do Git.

**Regra final:** nada de sistema de painel administrativo para uma seção de quatro vídeos; primeiro validar HTML editável + JS único + hospedagem pública, mantendo elementos nativos da Loja Integrada intocados.
