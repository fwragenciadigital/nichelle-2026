# Lâmina 01 — Quadro de vídeos + painel protegido

**Pedido do cliente (06/11/2026)**
1. Dashboard de edição deve exigir **senha do cliente**.
2. Implementar PRIMEIRO a seção editorial de 4 vídeos (screenshot Medicube); instalar em modo de TESTE para avaliar no site atual, sem modificar funcionalidades nativas.

## Escopo da seção — CUSTOM-FWR
Quatro vídeos verticais 9:16, cards com cantos arredondados, thumbnail automática do YouTube (ou capa personalizada opcional) e botão de play. Desktop: 4 colunas; mobile: trilho horizontal com scroll-snap e cartão parcial, pendente de aprovação no tema LI. Com URLs reais de YouTube Shorts, `watch` ou `youtu.be`, clique abre o player incorporado em modal acessível (ESC, botão fechar, pausa e foco restaurado). Nenhuma biblioteca externa; CSS escopado `fwr-nichelle-*`; o módulo não move componentes nativos da LI.

**Imagens:** os 4 recortes da captura do cliente são apenas demonstrativos de layout, NÃO a versão final das mídias. URLs de vídeos e posters oficiais continuam pendentes e não devem ser inventadas. No teste visual, cards de prévia não simulam playback.

## Segurança do dashboard
- Login protegido com senha HASHED (password_hash/password_verify), sessão HttpOnly/Secure/SameSite, CSRF e limitação de tentativas.
- **Nenhuma senha, chave de GitHub ou token no HTML/JS ou no repositório.** Configurar hash e segredo de sessão no servidor por variáveis de ambiente.
- Interface com rascunho, prévia autenticada, publicar JSON público sanitizado e rollback.
- Admin edita SOMENTE esta seção: ativar/desativar galeria e cartões, cadastrar URL do YouTube, capa personalizada opcional, texto alternativo e ordem. A galeria não tem campo de título editável no layout aprovado.
- Não alterar preços, estoque, catálogo, vitrines nativas, categorias, logo, banner principal, carrinho e checkout.
- Hosting previsto: domínio FWR com PHP 8+ e HTTPS, dados de administração em diretório privado; confirmar suporte no host antes de ativar.
- Repositório `nichelle-2026` é PRIVADO: não tratar GitHub Pages/raw/jsDelivr como CDN público.
- Publicação remota requer serviço externo de config JSON ativo; opção 100% autônoma no editor LI não permite alterações automáticas do dashboard.

## Ciclo de homologação
1. Servir CSS, JS, JSON e posters em HTTPS num endereço FWR **real e verificado**.
2. Inserir CSS de teste no HTML/Cabeçalho e script de teste no HTML/Rodapé da LI, com `data-preview-only=true`.
3. Conferir na loja: `https://www.nichelleimports.com.br/?fwr_nichelle_preview=1`. Outros visitantes não devem ver a seção durante a homologação.
4. Iniciar com inserção ao FINAL de `#corpo` na home, abaixo das vitrines nativas, evitando reorganizar topo durante carregamento. Posição visual definitiva será aprovada após conferir DOM/protótipo.
5. Registrar CLS, LCP, mobile 390px, desktop 1440px, erros de console e interação. Só depois mudar para config publicada e arquivos reais.
6. Não ativar produção sem autorização explícita.

## Entrega técnica já criada nesta conversa
Foi gerado um pacote `nichelle-video-gallery-mvp.zip` contendo: `public/galeria-videos.css`, `public/galeria-videos.js`, `public/galeria-preview.json`, `public/galeria-publicada.json`, posters de PREVIEW, `admin/` e `server/` PHP, `integracao/`, `demo/` e instruções de instalação. A galeria passou no Chromium controlado (4 cards, posters carregados, zero erros de JS, desktop/mobile). Teste NÃO mede CLS da loja real.

**Importante para Codex:** sincronizar o conteúdo desse pacote com os arquivos versionados antes de iniciar a implantação. Não alegar que ele já está hospedado publicamente ou instalado na Loja Integrada.

## Bloqueios
- Sem acesso autorizado ao painel da Loja Integrada ou à hospedagem pública FWR para instalar.
- Senha do cliente ainda não configurada no servidor; não inventar credenciais.
- URLs definitivas dos posters/vídeos não fornecidas.
- O protótipo `index1.html` ainda não foi inspecionado integralmente por navegador do projeto.

**Estado:** MVP local/testado; site público inalterado.

## Atualização — YouTube Shorts e capa automática

- O cliente poderá colar diretamente uma URL de YouTube Shorts, `youtube.com/watch?v=...` ou `youtu.be/...`; **não é preciso carregar arquivo MP4 nem imagem da capa separada**.
- O código valida domínio oficial e extrai o ID de 11 caracteres. No clique, o player é `youtube-nocookie.com/embed/VIDEO_ID`, com iframe criado somente na interação; não carregar player pesado antes do clique. <https://support.google.com/youtube/answer/171780>
- Para a imagem de preview, o runtime tenta o thumbnail vertical `https://i.ytimg.com/vi/ID/oar2.jpg`, depois `oardefault.jpg` e `hqdefault.jpg` como fallback. O CDN pode não disponibilizar a versão vertical para todos os vídeos. **A capa personalizada continua opcional** e será preferida quando informada.
- As imagens de capa permanecem no frame `aspect-ratio:9/16` com `object-fit:cover`; sem mudanças geométricas ao carregar, evitando CLS do componente.
- **Atenção à privacidade:** thumbnail externo `i.ytimg.com` pode ser solicitado antes do clique, respeitando lazy-loading; o player só se conecta ao YouTube quando solicitado. Confirmar adequação do banner de consentimento e política da loja.
- Os links definitivos de Shorts ainda serão fornecidos; não inventar URLs, vídeos ou títulos. Testar se o proprietário permite incorporação e se há restrição de idade/território.
