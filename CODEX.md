# Codex — Nichelle Imports 2026

**EXECUTE PRIMEIRO:** [PROMPT_INICIAL_CODEX.md](./PROMPT_INICIAL_CODEX.md).

O projeto é **independente** de `fwrtema/Malheiro`. Use lições de performance, não reutilize os scripts e dados dessa loja.

## Regra inegociável
Logo, banner principal, categorias, busca, minicart/carrinho, vitrines nativas, produto, estoque, preço e checkout **continuam na Loja Integrada**. O painel externo FWR controla **somente módulos customizados** desenvolvidos por nossa equipe, começando pela galeria editorial de 4 vídeos verticais demonstrada na imagem do briefing.

Referências:
- Loja: https://www.nichelleimports.com.br/
- Projeto 2026 (URL exata): https://projetos.fwragenciadigital.com.br/nichelle/2026/index1.html

Se o protótipo estiver inacessível ao navegador, não inventar o mapeamento do layout. Obter screenshot/export antes de atribuir posição às seções.

## Git
Branch `develop` → PR Draft contra `main`. Nenhuma publicação na LI, nenhum merge sem aprovação. O repositório é privado; não presumir que raw GitHub, Pages ou jsDelivr servem código/JSON público.

## Dashboard
Sem controle de elementos nativos. Backend autenticado versiona configurações validadas e publica JSON público sanitizado em infraestrutura FWR. Frontend da LI consome apenas leitura, sem chaves e com fallback de layout estável.

**Status:** documentação e schema inicial para auditoria. Nenhum módulo ativo por padrão; imagens e vídeos serão fornecidos separadamente.
