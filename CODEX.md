# Codex — Nichelle Imports 2026

**EXECUTE PRIMEIRO:** [PROMPT_INICIAL_CODEX.md](./PROMPT_INICIAL_CODEX.md).

O projeto mantém catálogo, conteúdo e operação comercial próprios, mas **usará a base JavaScript da Malheiro** como fundação técnica, conforme decisão do usuário. Antes de implementar, localizar e registrar o arquivo/revisão exatos e auditar dependências e seletores. Adaptar a base para Nichelle sem copiar produtos, mídia, URLs ou configuração comercial da Malheiro.

## Regra inegociável
Logo, banner principal, categorias, busca, minicart/carrinho, vitrines nativas, produto, estoque, preço e checkout **continuam na Loja Integrada**. O painel externo FWR controla **somente módulos customizados** desenvolvidos por nossa equipe, começando pela galeria editorial de 4 vídeos verticais prevista no briefing e posicionada visualmente após a faixa de marcas no layout final `index1.html`. A imagem confirma aparência/ordem; o slot funcional e a interação de vídeo ainda precisam de validação.

Referências:
- Loja: https://www.nichelleimports.com.br/
- Projeto 2026 (URL exata): https://projetos.fwragenciadigital.com.br/nichelle/2026/index1.html

O `index1.html` é a referência visual final do projeto. Se estiver acessível somente como screenshot/raster, mapear a composição visual, registrar essa limitação e não inferir DOM, funcionamento ou origem de gestão das seções sem confirmação.

## Git
Branch `develop` → PR Draft contra `main`. Nenhuma publicação na LI, nenhum merge sem aprovação. O repositório é privado; não presumir que raw GitHub, Pages ou jsDelivr servem código/JSON público.

## Dashboard
Sem controle de elementos nativos. Backend autenticado versiona configurações validadas e publica JSON público sanitizado em infraestrutura FWR. Frontend da LI consome apenas leitura, sem chaves e com fallback de layout estável.

**Status:** documentação e schema inicial para auditoria. Nenhum módulo ativo por padrão; imagens e vídeos serão fornecidos separadamente.

## Vídeos YouTube Shorts

A galeria FWR aceita Shorts ou links YouTube normais. Imagem de capa automática derivada do próprio vídeo, com substituição opcional. Ver `docs/03-VIDEO-GALLERY-SPEC.md` e testes `tests/youtube-shorts.test.mjs`. Sem alterações em módulos nativos da Loja Integrada.
