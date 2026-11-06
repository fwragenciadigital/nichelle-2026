> **AVISO DE ATUALIZAÇÃO:** este briefing foi substituído na arquitetura por [docs/07-ARQUITETURA-SIMPLIFICADA-GIT-HTML.md](docs/07-ARQUITETURA-SIMPLIFICADA-GIT-HTML.md). **Não implementar dashboard ou backend PHP/JSON** nesta fase. Usar JS único + HTML editável, sem interferir na LI nativa. Este arquivo fica para histórico.

# CODEX — Nichelle Imports 2026 · Fase 1: auditoria do layout e módulos exclusivos

## Início
Repositório: `fwragenciadigital/nichelle-2026` (privado).
Branch: `develop`; PR Draft contra `main`.
Loja atual: https://www.nichelleimports.com.br/
**Protótipo correto do projeto:** https://projetos.fwragenciadigital.com.br/nichelle/2026/index1.html
Não confundir com a rota sem `index1.html` e não inferir o design quando a URL estiver bloqueada.

**Objetivo desta rodada:** inspecionar o protótipo e a loja, identificar módulos EXCLUSIVOS que precisam ser desenvolvidos com HTML/CSS/JS e controlados num mini dashboard externo da FWR. Elaborar mapa, contrato de Settings e plano de implantação. Não iniciar substituição do tema, nem publicar, nem alterar as áreas nativas.

## REGRA DE ESCOPO — principal

**NUNCA duplicar nem tomar controle da funcionalidade nativa da Loja Integrada.** Permanecem nativos e administrados no painel da própria plataforma:
- Banner principal do tema, categorias e menus.
- Logo, busca, login, carrinho/minicart, checkout, frete.
- Vitrines nativas de produtos; listagens, cards nativos, preço, parcelas, descontos, estoque e variantes.
- Gestão de produtos, categorias, marcas, estoque, cupons e pedidos.

É permitido aplicar CSS pontual, se necessário para fidelidade ao projeto, depois de testar e documentar que não interfere nas funcionalidades. **Não transformar esses elementos nativos em módulos do mini dashboard.**

**O mini dashboard FWR controlará SOMENTE seções customizadas que nossa equipe criar**, como:
- Galeria editorial de vídeos verticais (exemplo do briefing: quatro cards lado a lado no desktop, com cantos arredondados, poster de produtos Medicube, leve overlay escuro e botão triangular de play central).
- Outras sessões editoriais, vídeos, conteúdo interativo, mosaicos, seções especiais de marcas ou campanhas, **somente quando forem identificadas no layout `index1.html` e explicitamente marcadas como NÃO nativas**.
- Imagens/videos serão hospedados separadamente e URLs adicionadas depois; não copiar para o repo imagens de terceiros ou usar imagens da Farmácia Malheiro.

**A galeria de vídeo é um exemplo confirmado pela imagem entregue, não uma confirmação de onde ela aparece na página de protótipo.** Confirme sua posição, títulos, fundos e comportamento no `index1.html` ou registre pendência.

## 1. Investigar primeiro (EXECUTAR AGORA)

1. Abrir a loja atual e o protótipo em navegador real com viewport 1440×900, 820×1180 e 390×844. Capturar screenshots e inspecionar DOM e Network. Se a URL do protótipo estiver inacessível, anotar HTTP, DNS, bloqueios e limitações; NÃO inventar a estrutura. Opcionalmente solicitar export do HTML/CSS/JS ou screenshots completos.
2. Mapear a página do protótipo de cima para baixo e classificar cada bloco:
   - `NATIVO-LI`: deve ser mantido no gerenciamento normal do cliente; o Codex não implementa um equivalente.
   - `CUSTOM-FWR`: seção independente a implementar, e administrar por Settings/dashboard.
   - `AJUSTE-VISUAL`: CSS pontual no elemento nativo, sem substituir sua lógica ou gestão.
   - `INDEFINIDO`: exigir validação visual antes de assumir.
3. Para cada `CUSTOM-FWR`, levantar layout desktop/mobile, position DOM, recursos, IDs/classes, imagens/formatos, interações, acessibilidade, responsável por editar, necessidade de Settings, dependências, risco de CLS e ordem de implementação.
4. Comparar com a loja atual para confirmar slots de inserção seguros por seletor, sem mover estruturas nativas do topo depois do first paint; avaliar compatibilidade do tema ativo com HTML/Cabeçalho e HTML/Rodapé, marcando como não verificado quando não tiver acesso ao painel.
5. Usar a base JavaScript da Malheiro como fundação técnica, conforme decisão do usuário. Antes de implementar, localizar e registrar o arquivo/revisão exatos e auditar dependências, seletores e inicializações existentes. Adaptar para Nichelle sem duplicar jQuery/Owl/plugins, sem CSS global de compensação e sem copiar catálogo, conteúdo, imagens, vídeos, URLs ou configurações comerciais da Malheiro. Preservar integralmente as funções nativas da Loja Integrada.

## 2. Módulo exclusivo #1 — Video Gallery / UGC (anexo visual)

Referência visual informada: **4 cards de vídeo 9:16** com posters de produtos Medicube, bordas arredondadas, espaçamento uniforme, sobreposição sutil escura e ícone play branco central; sem texto obrigatório sobre a imagem.

Especificar (não inventar URLs reais):
- Desktop: quatro cards na mesma linha, mantendo aspect-ratio `9/16` e espaçamento; no mobile definir/carimbar comportamento com evidência do protótipo, propondo swipe por `scroll-snap` com cartões parciais somente se não houver referência explícita.
- Interações: clicar no card abre/reproduz vídeo acessível (modal ou inline conforme layout validado), fechar via ESC e botão, foco adequado, retorno de foco e pausa quando fechado. Controles com rótulo; autoplay opcional DESATIVADO por padrão, respeitar reduced-motion.
- Imagens `poster` com dimensões explícitas e carregamento adequado à posição LCP; vídeos não devem baixar pesado antes da interação (`preload="none"` por padrão). Testar no iOS/Android. Se usar iframe Vimeo, carregar só no clique.
- URLs de `poster` e `video` fornecidas depois e mantidas EXATAMENTE como publicadas; HTTPS, validação de hosts sem código HTML arbitrário.
- Settings editáveis (futuros): ativar seção, posição definida, título opcional, lista de cards, poster, vídeo, texto alternativo, URL de produto, ordem, ativo e comportamento mobile.
- A página não poderá sofrer CLS quando thumbnails, fontes ou JavaScript chegarem: layout/reserva da seção vem de CSS crítico/markup ou espaço estável verificável antes do paint.

## 3. Mini dashboard (PROJETAR AGORA; NÃO IMPLEMENTAR AINDA)

Criar desenho de um dashboard FWR separado da Loja Integrada, que **edita somente módulos CUSTOM-FWR**; sem campos para logo, banner principal, categorias nativas, vitrine nativa, carrinho ou preço.

Fluxo proposto:
1. Login protegido, identidade do projeto `nichelle-2026` e papéis (administrador/editor).
2. Ler Settings em rascunho; formularios por módulo (Video Gallery primeiro), ordenação, validação de URLs e prévia autenticada.
3. **Salvar rascunho → Pré-visualizar → Publicar → Reverter**, com auditoria de versão.
4. Backend autenticado publica artefato público **sanitizado** `published.json`, servido em HTTPS por hospedagem externa da FWR; cliente Loja Integrada recebe apenas URL pública, nunca token GitHub, cookies administrativos ou chave de gravação.
5. Repositório GitHub é **privado**, portanto NÃO referenciar `raw.githubusercontent.com`, GitHub Pages ou jsDelivr do repositório privado como se servissem assets públicos. Publicar JSON e JS/CSS por infraestrutura externa da FWR ou armazenamento/CDN público apropriado; verificar CORS, MIME, cache, versionamento e rollback.
6. Se JSON remoto estiver indisponível, frontend deve manter estado estável e fallback seguro sem deslocar componentes acima da dobra. Ao usar endpoint remoto, manter dependência externa de configuração: uma entrega 100% autônoma no painel LI não permite atualizações remotas pelo dashboard sem essa dependência.
7. Dashboard NÃO cria produtos, muda preços, publica cupons, edita carrinho nem permite injetar HTML/JS arbitrário (risco de XSS).
8. Comparar MVP leve (formulário serverless → validação JSON Schema → commit GitHub privado + publicação FWR), versus backend DB apenas se a necessidade real justificar. Não exigir MCP nem API da Loja Integrada.

## 4. Organização do repositório

Trabalhar apenas em `develop`, com estrutura:
```text
CODEX.md
PROMPT_INICIAL_CODEX.md
README.md
docs/
  01-INVENTARIO-NATIVO-VS-CUSTOM.md
  02-ANALISE-INDEX1-2026.md
  03-VIDEO-GALLERY-SPEC.md
  04-DASHBOARD-SETTINGS-ARQUITETURA.md
  05-PLANO-DE-HOMOLOGACAO.md
config/
  schema.json
  defaults.json
src/
  components/video-gallery/
  runtime/
  styles/
integracao/
  cabecalho.html
  rodape.html
assets/
  MANIFESTO.md
tests/
```
Gerar um schema preliminar coerente e defaults com galeria desativada e nenhum URL inventado. Não criar implementações "finais" com imagens fictícias.

## 5. Qualidade e homologação

- HTML/CSS/JS separados em desenvolvimento, CSS escopado (`fwr-nichelle-*`), runtime idempotente, first paint estável, modularidade e build reproduzível.
- CLS de campo (p75) alvo <= 0,10; laboratório de preferência <= 0,05, LCP <= 2,5s, INP <= 200ms, mas reportar somente resultados efetivamente medidos.
- Analisar home, catálogo, PDP, menu, busca, minicart e checkout com **testes não destrutivos**; não fazer pedidos, alterar estoque ou dados da loja.
- Os componentes devem ser inseridos em slots seguros, sem reconstruir/reordenar estruturas nativas da Loja Integrada tardiamente.
- Nenhuma imagem, vídeo, URL ou conteúdo comercial de Malheiro deve ser copiado. A base JavaScript da Malheiro é a exceção autorizada; mídias e URLs da galeria só entram quando fornecidas/confirmadas.
- Não modificar loja pública, não alterar `main`, não fazer merge sem autorização.

## Entregáveis da PRIMEIRA execução (mapeamento)

1. `docs/01-INVENTARIO-NATIVO-VS-CUSTOM.md` classifica cada seção do projeto como NATIVO-LI, CUSTOM-FWR, AJUSTE-VISUAL ou INDEFINIDO.
2. `docs/02-ANALISE-INDEX1-2026.md` descreve layout observado por viewport com provas/screenshots; se bloqueado, reporta impossibilidade sem adivinhar.
3. `docs/03-VIDEO-GALLERY-SPEC.md` define marcação e comportamento acessível, campos, restrições e teste CLS da seção de 4 vídeos.
4. `docs/04-DASHBOARD-SETTINGS-ARQUITETURA.md` apresenta a solução mínima privada + publicação JSON externa e rollback, com risco/cache/CORS.
5. `docs/05-PLANO-DE-HOMOLOGACAO.md` define implementação faseada, QA e pendências de acesso ao tema.
6. `config/schema.json` e `config/defaults.json` como modelos preliminares, sem URLs inventadas.
7. Faça commits em `develop`, atualize PR Draft e entregue parecer GO/NO-GO para começar a implementar o módulo de vídeo.

**Não implementar dashboard completo nem substituir componentes nativos nesta primeira rodada. Não publicar nada na Loja Integrada.**
