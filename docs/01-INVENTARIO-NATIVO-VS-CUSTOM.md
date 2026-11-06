# Inventário: o que pertence à Loja Integrada e o que pertence à FWR

Este documento **é classificação de escopo, não um mapa observado do protótipo**.

| Recurso | Responsável | Dashboard FWR? | Orientação |
|---|---|---:|---|
| Logo | Loja Integrada | Não | Mantido no editor da plataforma |
| Banner principal | Loja Integrada | Não | Usar componente nativo; não recriar |
| Categorias e menu | Loja Integrada | Não | Links, categorias e navegação nativas |
| Busca e login | Loja Integrada | Não | Sem substituição de comportamento |
| Carrinho, frete, checkout | Loja Integrada | Não | Não interceptar/comandar compras |
| Vitrines nativas | Loja Integrada | Não | Gestão de produtos, preços e estoque nativa |
| **Galeria editorial de vídeos 9:16** | **FWR** | **Sim** | Exemplo visual confirmado por screenshot anexado |
| Outras seções customizadas | FWR, se existirem no index1 | Sim | Requer identificação com screenshot/DOM |
| Ajustes cosméticos em módulo nativo | CSS FWR se aprovado | Não | Não alterar dados nem lógica da LI |

Para cada nova seção observada em `index1.html`, Codex deve registrar seletor, posição real, breakpoint, origem da imagem/vídeo, risco CLS e decidir NATIVO-LI, CUSTOM-FWR, AJUSTE-VISUAL ou INDEFINIDO.

**Bloqueio:** esta sessão não conseguiu acessar `index1.html`; não extrapolar elementos além da captura parcial da galeria enviada.
