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
1. Configurar host FWR HTTPS, backend PHP, hash/segredo de sessão, diretório privado, CORS, MIME, cache e allowlist antes de conectar o dashboard.
2. Confirmar no tema homologado um slot HTML inicial após “Compre as Melhores Marcas” e antes de “Produtos Promocionais”, conforme `index1.html`. Não inserir no final de `#corpo` nem selecionar o local por texto/título.
3. Usar os snippets de teste documentados em `docs/06-MAPEAMENTO-E-TESTES-DA-GALERIA.md`; o smoke test público só lê a configuração vazia. A prévia de rascunho usa `admin/preview.php` autenticado na origem PHP.
4. Receber e validar quatro URLs reais aprovadas, verificar thumbnails/fallback, playback, teclado, rede e breakpoints; testar configuração vazia e indisponibilidade.
5. Medir CLS da seção e comparar LCP/INP com baseline na LI homologada. Aprovar visual desktop/mobile e confirmar que logo, banner, menus, vitrines, produtos, carrinho, preços e checkout continuam nativos.
6. Só após essa homologação e aprovação explícita, preencher os snippets destinados à futura configuração de produção. Esta etapa não autoriza publicar a loja.

## Entrega técnica já criada nesta conversa
O código versionado em `develop` contém `public/galeria-videos.css`, `public/galeria-videos.js`, configurações públicas vazias, dashboard e endpoints PHP, snippets de integração e documentação. Não há posters ou vídeos fictícios nas configurações. Testes locais usam IDs sintéticos exclusivamente em fixtures; reprodução de vídeos reais depende dos links do cliente.

Não alegar que os arquivos já estão hospedados publicamente ou instalados na Loja Integrada. O mapeamento de testes registra o que foi verificado na fixture e as validações pendentes no tema/host real.

## Bloqueios
- Sem acesso autorizado ao painel da Loja Integrada ou à hospedagem pública FWR para instalar.
- Senha do cliente ainda não configurada no servidor; não inventar credenciais.
- URLs definitivas dos posters/vídeos não fornecidas.
- A integração do slot, playback real e CLS/LCP/INP no tema LI precisam de homologação; métricas de fixture não substituem a loja.

**Estado:** código do MVP em `develop`; testes automatizados e fixture Chromium executados; integração/CLS reais na LI pendentes; site público inalterado.

## Atualização — YouTube Shorts e capa automática

- O cliente poderá colar diretamente uma URL de YouTube Shorts, `youtube.com/watch?v=...` ou `youtu.be/...`; **não é preciso carregar arquivo MP4 nem imagem da capa separada**.
- O código valida domínio oficial e extrai o ID de 11 caracteres. No clique, o player é `youtube-nocookie.com/embed/VIDEO_ID`, com iframe criado somente na interação; não carregar player pesado antes do clique. <https://support.google.com/youtube/answer/171780>
- Para a imagem de preview, o runtime tenta o thumbnail vertical `https://i.ytimg.com/vi/ID/oar2.jpg`, depois `oardefault.jpg` e `hqdefault.jpg` como fallback. O CDN pode não disponibilizar a versão vertical para todos os vídeos. **A capa personalizada continua opcional** e será preferida quando informada.
- As imagens de capa permanecem no frame `aspect-ratio:9/16` com `object-fit:cover`; sem mudanças geométricas ao carregar, evitando CLS do componente.
- **Atenção à privacidade:** thumbnail externo `i.ytimg.com` pode ser solicitado antes do clique, respeitando lazy-loading; o player só se conecta ao YouTube quando solicitado. Confirmar adequação do banner de consentimento e política da loja.
- Os links definitivos de Shorts ainda serão fornecidos; não inventar URLs, vídeos ou títulos. Testar se o proprietário permite incorporação e se há restrição de idade/território.
