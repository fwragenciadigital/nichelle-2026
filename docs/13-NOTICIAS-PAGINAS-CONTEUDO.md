# Nichelle — módulo "Conteúdos para você" com notícias institucionais

## Proposta e referência
Reproduzir a lâmina da referência: fundo lavanda claro, título **Conteúdos para você** com uma linha horizontal, **primeira notícia em destaque** (imagem com gradiente e título/descrição/data sobrepostos na base), e **duas notícias à direita** (miniatura + título roxo + texto + data + "Ler mais"). Todo card direciona para uma página de conteúdo do domínio da própria Loja Integrada.

Responsividade:
- **Desktop** (acima de 1100px): duas colunas 50/50; à esquerda a matéria principal e à direita duas matérias empilhadas.
- **Tablet** (701–1100px): destaque em largura total, duas notícias menores lado a lado.
- **Mobile** (até 700px): destaque em largura total e, abaixo, duas notícias menores empilhadas (foto à esquerda e textos à direita); regras adicionais para telas até 360px.

## Cadastro de notícias no painel
1. Acesse **Visual > Páginas de conteúdo**, crie uma página por notícia e edite o corpo com texto e fotos, dentro do editor nativo da Loja Integrada.
2. Após publicar, copie a **URL real** de cada notícia institucional. As páginas permanecem acessíveis normalmente por essas URLs.
3. No painel da Loja Integrada, em **Visual > Incluir código HTML**, mantenha o JavaScript único do projeto carregado uma única vez:
   `<script defer src="https://nichelle-2026.vercel.app/nichelle.js"></script>`
4. Em um bloco **HTML/Rodapé** publicado em **Todas as páginas (exceto checkout)**, copie **`integracao/html-noticias-cadastro-rodape.html`**. Esse bloco contém apenas a variável global e não imprime nenhum conteúdo visual no footer. Preencha, para cada uma das três notícias: `foto`, `titulo`, `breveTexto`, `data`, `link`.
5. Na HOME, na posição onde deseja a seção, cole **`integracao/html-noticias-home.html`** (slot de destino).
6. Após verificar os dados e links, altere **`ativo: false`** para **`ativo: true`** no cadastro do rodapé.

## Variáveis

```js
window.FWRNichelle.noticias = {
  ativo: false,
  ocultarLinksRodape: true,
  itens: [
    { foto: "", titulo: "", breveTexto: "", data: "", link: "" },
    { foto: "", titulo: "", breveTexto: "", data: "", link: "" },
    { foto: "", titulo: "", breveTexto: "", data: "", link: "" }
  ]
};
```

- `foto`: endereço HTTPS de imagem (via upload da LI ou CDN confiável); primeira preferencialmente 1200×810 px, outras 700×500 px.
- `titulo`: nome editorial.
- `breveTexto`: chamada resumida, 1–2 frases.
- `data`: usar `AAAA-MM-DD`; exibe "Publicado em 09 de novembro de 2026".
- `link`: **caminho relativo** de página institucional (ex. `/pagina/minha-noticia`) ou URL HTTPS do **mesmo domínio** da loja. Links externos e `javascript:` são ignorados.
- **`ativo: false`** por padrão. Enquanto false, a seção não é montada, não carrega imagens e não interfere nos Shorts ou nas vitrines.
- `ocultarLinksRodape: true`: oculta no footer somente os links institucionais cujo caminho seja **igual** ao campo `link` de uma das notícias cadastradas. Não remove nem despublica a página, nem esconde outras páginas institucionais legais.

## Observação importante — páginas extras no rodapé
A Loja Integrada adiciona automaticamente páginas de conteúdo ao rodapé. O JavaScript precisa remover os **links dessas páginas** da lista de navegação do footer, mas NÃO a página em si. A remoção é feita exclusivamente pelo caminho/URL exata fornecida no cadastro (e não pelo nome ou uma classe genérica). Se o tema trocar o HTML do footer, revisar seletor na loja real.

O cadastro em HTML/Rodapé também não cria um bloco visual, pois contém apenas `<script>`.

## SEO, CLS e funcionamento
- HTML nativo, DOM construído com `textContent`, imagens lazy e `width/height`, CSS com prefixo exclusivo `#fwr-nichelle-noticias-slot`, sem bibliotecas externas nem `fetch`.
- CSS e funcionamento estão no único `public/nichelle.js`; HTML serve apenas para dados e posicionamento.
- A seção é inserida quando o JS externo encontra o cadastro e o slot. Se o HTML de cadastro for carregado posteriormente, o evento `fwr:nichelle:news-config` permite renderizar novamente.
- **CLS:** como o cadastro fica no rodapé e o slot pode surgir antes dele, a seção pode ser injetada depois de parte da página renderizada. Verificar o CLS na HOME real. Se isso representar um problema, levar o cadastro para uma posição de carregamento anterior à posição do slot (ou reservar altura no slot apenas quando ativo).
- O CSS é carregado apenas quando existem notícias válidas e `ativo:true`. Exatamente 3 notícias reproduzem a referência; com 1 ou 2 notícias, o bloco continua funcional.
- A Loja Integrada pode demorar até **15 minutos** para publicar alterações do HTML customizado; isso é independente do cache de JS Vercel.

## Homologação obrigatória
- Com `ativo:false`: os Shorts e os banners anteriores não podem sofrer alterações; links de notícias não aparecem no footer se `ocultarLinksRodape:true`.
- Com `ativo:true`: testar **desktop 1440px, tablet 768px e celular 375px**; verificar imagens, alinhamentos, leitura dos textos, links, data e recorte mobile.
- Conferir que links de frete, privacidade, trocas e outros conteúdos institucionais permanecem no rodapé.
- Validar a URL real de cada notícia no navegador e no editor do tema da Loja Integrada.
- **Não** substituir script global duplicando-o. Testar após Vercel deployment READY.

## Fontes oficiais de plataforma
- https://ajuda.lojaintegrada.com.br/pt-BR/articles/931209-como-criar-uma-pagina-de-conteudo-na-minha-loja-integrada
- https://ajuda.lojaintegrada.com.br/pt-BR/articles/911875-como-inserir-um-codigo-html-e-javascript
