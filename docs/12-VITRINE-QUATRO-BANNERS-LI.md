# Nichelle 2026 — 4 cards verticais pelo Banner Vitrine nativo da Loja Integrada

## Referência visual
Quatro cards verticais com cantos arredondados (proporção 3:5), imagens completas contendo seus próprios textos e produtos, quatro colunas desktop e carrossel horizontal `scroll-snap` no celular. Não cria banners novos por URL manual e não usa API privada.

## Configuração dos banners no painel
Acesse **Personalize a loja > Banners > Banner Vitrine**. Cadastre/edite quatro banners ativos com imagem vertical (sugestão 600 × 1000 px ou 900 × 1500 px), link de destino, e os seguintes nomes:

1. `Mini 1 vitrine-mini`
2. `Mini 2 vitrine-mini`
3. `Mini 3 vitrine-mini`
4. `Mini 4 vitrine-mini`

Os nomes 1–3 aparecem no print fornecido; o quarto precisa ser criado, ou seus nomes editáveis precisam ser alterados para corresponder aos nomes efetivamente presentes no painel. **Não reutilizar automaticamente os banners de lançamento desktop/mobile**, pois são uma campanha separada e poderiam estar em formato incompatível.

**Fonte de conteúdo:** nome/ALT, imagem (incluindo picture/srcset para mobile quando o tema renderizar), link, target, status ativo e períodos de agendamento do painel nativo. O JS só lê banners que estejam efetivamente presentes no HTML da vitrine; não importa banner inativo/agendado que a LI tenha removido.

## HTML da Loja Integrada
Colar o conteúdo completo de `integracao/html-banner-vitrine-4-cards.html` na HOME, na posição onde os cards aparecerão. O JavaScript `public/nichelle.js` deve ser carregado **somente uma vez**, pelo rodapé, como já acontece na galeria de Shorts.

A variável:
```js
window.FWRNichelle.bannerVitrine = {
  ativo: false,
  nomes: [
    "Mini 1 vitrine-mini",
    "Mini 2 vitrine-mini",
    "Mini 3 vitrine-mini",
    "Mini 4 vitrine-mini"
  ]
};
```

**Default false** significa que não cria nada, não oculta os banners da LI e não gera observadores de DOM. Após cadastrar os quatro banners verticais, coloque `ativo: true` no HTML para testar.

## Segurança, CLS e independência
- Banners selecionados pelo nome/ALT exato e apenas se oriundos da estrutura nativa de banner. Não usa `fetch` nem adiciona dependências.
- Se algum banner estiver ausente, a galeria não é montada e os banners originais permanecem visíveis.
- Só oculta os quatro elementos nativos individuais **depois** de os quatro cards terem sido montados, sem tocar em outras vitrines.
- O HTML reserva altura antecipadamente quando ativado, reduzindo CLS. Sem banners encontrados, reserva desfeita após 6 s.
- Caso o tema LI renderize os banners dentro de wrappers com altura própria, pode sobrar espaço na posição original. Esse comportamento precisa de **validação na página real antes da ativação**. Não esconder wrappers genéricos por CSS sem inspecionar o DOM.
- Banner Vitrine em muitos temas é posicionado de forma intercalada pela própria LI; o módulo reúne esses banners nativos em uma seção própria quando existem no DOM.
- Código de Shorts em `initVideoGallery()` preservado. Banner novo em `initBannerVitrine()`; ambos são opt-in independentes.
- Vercel gera `/nichelle.js` apenas depois do deployment; não confundir commit com publicação instantânea.
- Não há automação de upload das imagens pelo GitHub. Imagens permanecem no painel LI.

## Plano de teste manual
1. Manter `ativo: false`: conferir Shorts e vitrines existentes.
2. Confirmar que a LI renderiza os quatro `img[alt]` com os nomes acima e src `/banner/`.
3. Mudar para `true` e verificar quatro cards, links, mobile, proporções e ausência de duplicatas.
4. Verificar o CLS no Lighthouse e se há espaços residuais onde a LI colocava os banners nativos.
5. Alterar uma imagem/link no painel e confirmar que se reflete na seção após publicação/cache da LI.
