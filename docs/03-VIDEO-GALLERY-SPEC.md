# Componente personalizado 01 — galeria editorial de vídeos

## Status e evidência

Esta é a primeira seção `CUSTOM-FWR` prevista no escopo do projeto. O briefing define uma galeria editorial de **quatro vídeos** e a arte final em `index1.html` confirma a aparência e a posição visual; não confirma os controles de reprodução, URLs ou layout móvel real.

- **Posição na arte:** entre a faixa “Compre as Melhores Marcas” e a vitrine “Produtos Promocionais”.
- **Aparência observada:** quatro cards verticais lado a lado, proporção aproximada 9:16, posters de produtos Medicube, cantos arredondados, leve overlay escuro e ícone triangular branco de play central. Não há título aparente sobre os cards.
- **Limitação da fonte:** `index1.html` entrega uma imagem longa, não DOM funcional da galeria. O clique, o vídeo aberto, o modo mobile, as URLs e os estados de erro não foram observados.
- **Mídia:** URLs finais ainda serão fornecidas. O manifesto `assets/MANIFESTO.md` registra os metadados a coletar; não usar URLs fictícias ou mídia de outra loja.

## Contrato de Settings (prévio; não implementado)

Nomes de campo alinhados ao `config/schema.json` atual. O dashboard futuro edita somente este módulo.

| Campo | Tipo | Regra inicial |
|---|---|---|
| `enabled` | boolean | `false` nos defaults; ativar somente após aprovação e homologação |
| `title` | string | Opcional; máximo 90 caracteres |
| `placement` | enum | `pending` no default ou `after-brand-strip` após validação do slot LI. Nenhuma outra posição faz parte da V1; não aceitar seletor CSS livre |
| `mobileMode` | enum | `pending` no default; escolher grid ou scroll-snap somente com arte/comportamento móvel aprovado |
| `openMode` | enum | `pending` no default; modal ou inline ainda não observado |
| `items` | lista ordenável | Schema permite até quatro itens. Quando `enabled=true`, exatamente quatro itens precisam estar ativos; o schema valida a contagem |
| `items[].id` | string | Identificador em slug; validar unicidade também na publicação |
| `items[].enabled` | boolean | Controle de exibição do card |
| `items[].order` | inteiro | Define ordem; ordenar de forma determinística |
| `items[].provider` | enum | `mp4` ou `vimeo`; validar a URL conforme o provedor no backend |
| `items[].posterUrl` | URL | HTTPS; URL fornecida sem reescrita; validar host, tipo e dimensões |
| `items[].videoUrl` | URL | HTTPS; URL fornecida sem reescrita; validar host e compatibilidade com `provider` |
| `items[].alt` | string | Descrição acessível do poster; 5–180 caracteres no schema |
| `items[].label` | string | Opcional, até 120 caracteres |
| `items[].productUrl` | URL | Opcional, HTTPS; direciona para produto existente, não edita preço |
| `items[].autoplay` | boolean | Forçado a `false` no schema V1; não é campo livre no dashboard |

V1 não aceita HTML, CSS, JS, iframes ou seletores fornecidos no formulário. O layout aprovado tem quatro cards ativos; mudar quantidade ou posição exige revisar e aprovar o layout e o schema.

## Comportamento proposto para implementação

Os itens abaixo são requisitos recomendados, não comportamentos comprovados pela imagem:

- Poster primeiro; declarar proporção/dimensões para reservar a caixa antes de carregar. Usar `preload="none"` para mídia MP4; em Vimeo, só montar o iframe após ativação do card.
- Clique/tap explícito inicia reprodução; sem autoplay. Pausar ao fechar/sair do card, respeitar `prefers-reduced-motion` e evitar concorrência de vários vídeos.
- Modal vs. inline continua pendente de aprovação. Se modal: permitir fechar por botão e `Escape`, controlar foco, restaurá-lo ao gatilho e fornecer rótulo acessível. Se inline: manter controles nativos/rotulados e espaço reservado.
- Cards operáveis por teclado, foco visível, texto alternativo que descreve a imagem, nome acessível do botão de play e mensagem de falha recuperável.
- Links opcionais de produto não substituem a página, preço, estoque ou fluxo de compra da Loja Integrada.
- Não criar sobreposição fixa que cubra menu, carrinho, checkout ou conteúdo interativo nativo.

## Responsividade e integração

- **Desktop:** quatro cards em uma linha, conforme a arte final.
- **Mobile/tablet:** a arte rasterizada mantém 1250 px de largura e corta conteúdo nos viewports menores; ela não informa o comportamento responsivo de produção. `mobileMode` permanece `pending` até definição/aprovação.
- **Slot:** posição visual-alvo é conhecida; seletor e mecanismo de inserção em tema LI não foram inspecionados. Nunca localizar por texto/copy frágil nem depender de seletor arbitrário editável pelo cliente.
- **Integração remota:** código e mídia servidos por infraestrutura pública aprovada da FWR; `published.json` em HTTPS, CORS explícito, MIME JSON, versão/cache/ETag documentados. O browser da loja só lê configuração pública sanitizada.
- **Hosts de mídia:** HTTPS não basta. O backend deve aplicar allowlist de domínios e validação específica de MP4/Vimeo. Registrar essa regra antes de implementar; URLs originais permanecem intactas.

## Estados estáveis e risco de CLS

| Estado | Comportamento exigido | Risco a controlar |
|---|---|---|
| Configuração válida e lista com quatro ativos | Usar slot com geometria reservada e montar cards sem deslocar o conteúdo seguinte | Imagens devem respeitar proporção; vídeo não participar do layout antes do clique |
| Configuração válida, módulo desligado ou sem itens ativos | Não montar cards; o slot deve colapsar desde o HTML/CSS inicial ou existir espaço reservado de forma consistente | Inserir/remover um bloco depois do first paint pode mover toda a página |
| JSON lento, inválido ou indisponível | Manter um fallback sem erro e sem reconstruir o layout nativo; ocultar/colapsar apenas conforme slot pré-determinado | Render tardio vazio→preenchido gera CLS; fallback não pode deslocar topo/vitrines |
| Poster lento/quebrado | Preservar a caixa 9:16, mostrar fallback de mídia e permitir retry/não reprodução | Não deixar dimensões intrínsecas mudarem a altura do card |
| Vídeo iniciado | Carregar recurso somente após intenção; manter dimensões do card/modal | Evitar redimensionamento, autoplay e downloads de vários vídeos |

Se não existir espaço reservado ou hook estável antes do first paint, não injetar a seção após fetch assíncrono nesta fase. A escolha entre reserva de slot e inserção em hook do tema depende de acesso/validação no ambiente Loja Integrada.

## Aceite antes de liberar

- Quatro URLs reais de posters e vídeos, direitos/uso aprovados, HTTPS e allowlist validados sem modificar as URLs.
- Slot e comportamento mobile aprovados; preview coerente com a arte de referência.
- Reprodução/accessibilidade testadas em desktop e iOS/Android; poster e configuração falhos cobertos.
- Evidência de laboratório de estabilidade geométrica/CLS para config vazia, normal, lenta e indisponível; comparar com baseline real antes de qualquer publicação.
- Nenhuma regressão em header, navegação, vitrine, produto, preço, carrinho, frete ou checkout.
