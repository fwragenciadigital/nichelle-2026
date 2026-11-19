# Nichelle — 3 arquivos individuais publicados pelo Vercel

Projeto: `fwragenciadigital/nichelle-2026` · branch `develop`.

## URLs públicas estáveis

1. **Módulos customizados** — `https://nichelle-2026.vercel.app/nichelle.js`
2. **Framework de organização e vitrines** — `https://nichelle-2026.vercel.app/nichelle27.js`
3. **CSS visual do framework** — `https://nichelle-2026.vercel.app/nichelle27.css`

As três URLs vêm do mesmo `vercel/dist`, mas são arquivos independentes. Cada um tem `Cache-Control: no-store, max-age=0` solicitado para o browser e `no-store` solicitado para a CDN. O conteúdo muda após conclusão de um deployment, não apenas após salvar no GitHub.

## Ordem futura para homologação na Loja Integrada

No HTML/Cabeçalho (HEAD), carregar o CSS **antes** do conteúdo:

```html
<link rel="stylesheet" href="https://nichelle-2026.vercel.app/nichelle27.css">
```

Configurar `window.Nichelle27Settings` no HTML editável e criar o slot do framework conforme `integracao/html-framework-nichelle27.html`. Todas as opções continuam `ativo:false` por padrão.

No HTML/Rodapé, instalar apenas **uma cópia de cada** script (não repetir o loader antigo do `nichelle.js`):

```html
<script defer src="https://nichelle-2026.vercel.app/nichelle27.js"></script>
<script defer src="https://nichelle-2026.vercel.app/nichelle.js"></script>
```

- `nichelle27.js` organiza os blocos, sem substituir o funcionamento da Loja Integrada.
- `nichelle.js` mantém os módulos existentes: Shorts, banners e notícias.
- A biblioteca original `framework/referencias/nichelle27.js` é apenas referência Malheiro, não deve ser carregada.
- Nenhum desses códigos foi inserido automaticamente no painel da Loja Integrada.
- Antes de ativar, verificar seletores das vitrines, formulário newsletter, topo, rodapé e CMS da LI. A publicação dos arquivos **não equivale à ativação** de funcionalidades.
