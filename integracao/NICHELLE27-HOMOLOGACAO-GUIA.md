# Nichelle Imports 2026 — homologação do layout na Loja Integrada

**Origem:** fwragenciadigital/nichelle-2026, branch `develop`, Vercel preview.

## Links fixos de desenvolvimento

- JavaScript: https://nichelle-2026-git-develop-fwragenciadigitals-projects.vercel.app/nichelle27.js
- CSS: https://nichelle-2026-git-develop-fwragenciadigitals-projects.vercel.app/nichelle27.css
- Configuração de vídeos: https://nichelle-2026-git-develop-fwragenciadigitals-projects.vercel.app/galeria-publicada.json

## Instalação em modo seguro

1. Manter os códigos atuais da loja; verificar se o `nichelle.js` legado já é carregado no tema para evitar carregamento duplicado do runtime de banners/Shorts/notícias.
2. Inserir **uma vez** `integracao/NICHELLE27-HOMOLOGACAO-CABECALHO.html` em HTML/Cabeçalho, se o tema permitir.
3. Acessar `https://www.nichelleimports.com.br/?nichelle_preview=1` para testar. Sem o parâmetro, a nova identidade não altera o DOM.
4. Para as quatro artes de Mini Banners, enviar os arquivos otimizados da pasta `Recortado` ao gerenciador de arquivos da LI, configurar `assetsBase` com a URL HTTPS real e manter links das categorias reais.
5. Ativar vitrines de forma gradual **somente após identificar seletor nativo exclusivo**. Não criar preços, descontos, parcelamento ou checkout em JavaScript.
6. Validar header e menus nativos, produtos, variantes, mini carrinho, checkout, newsletter, frete, Pix, breakpoints 390/768/1440 e CLS.
7. Somente após aprovação, trocar `modoPreview:true` por `false` e `publicarNaLoja:false` por `true`. Pode manter os links JS/CSS.
8. Quando concluir, baixar JS e CSS de Vercel para hospedar na CDN da LI, atualizando apenas os dois href/src no HTML. A base `assetsBase` também poderá apontar para a LI.

## Integração de galeria existente

O Vercel publica `galeria-videos.js/css` e `galeria-publicada.json` para compatibilidade com o `public.rar`. O build entrega `nichelle27.js` com o runtime FWR anterior incorporado e `nichelle27.css` com os estilos anteriores. Portanto, **não** inserir um terceiro `<script src="nichelle.js">` durante a nova instalação.

### Restrições

O layout raster aprovado é referência visual, não código HTML. O tema LI deve manter as funcionalidades comerciais nativas. Não afirmar paridade pixel-perfect ou teste de compra antes do QA real. Acesso a `?nichelle_preview=1` é apenas gate visual, não autenticação.
