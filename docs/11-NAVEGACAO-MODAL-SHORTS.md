# Nichelle — Modal de Shorts com navegação

## Implementação na branch develop

O modal utiliza o mesmo array de links `window.FWRNichelle.galeriaVideos.shorts` configurado no HTML da Loja Integrada. **Nenhum campo novo é necessário.**

- Setas de navegação anterior/próximo, com ciclo do último para o primeiro e vice-versa.
- Indicador acessível `1 / N` e atualização do título do modal.
- Atalhos de teclado: `←`, `→`, `Esc`.
- Gestos horizontais na faixa de navegação inferior ou no fundo do modal; por limitação do player cross-origin, gestos iniciados dentro do próprio iframe do YouTube não são capturados pela página.
- Só existe **um iframe de player**, carregado após abrir o modal. A troca atualiza `src` e interrompe a reprodução anterior.
- Ao fechar, o iframe é removido e o foco retorna ao card original.
- Layout, CSS, foco e eventos estão encapsulados no único `public/nichelle.js`.
- Sem alterações nos componentes nativos da Loja Integrada, nos links/Settings ou nas categorias.

## Homologação

Testes de código rodam em `tests/simplificado.test.mjs` pelo GitHub Actions. **Teste funcional em navegador real e toque em dispositivo móvel ainda são necessários** para confirmar os gestos e o carregamento dos Shorts. Os links reais e as permissões de incorporação dos vídeos dependem das configurações do YouTube.

**Atenção ao cache:** a URL de homologação contém `@develop` e o jsDelivr pode servir uma cópia antiga por algum tempo. Para confirmar uma versão exata, usar temporariamente o SHA do commit no lugar de `develop`, depois voltar para a URL de branch se o objetivo for atualização por novos commits.
