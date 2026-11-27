# Nichelle — publicação Vercel de homologação

Esta pasta compila os assets públicos de homologação, incluindo `nichelle.js` e seu CSS oficial separado `nichelle.css`. O framework visual integral `nichelle27.*` continua destinado à prévia isolada.

A pasta `vercel/dist/` é gerada no build, não deve ser versionada. Não publicar `admin/`, `server/`, arquivos de referência da Malheiro, settings privados ou URLs temporárias.

## Projeto Vercel

- Repositório: `fwragenciadigital/nichelle-2026`.
- Diretório raiz no Vercel: **raiz do repositório**, pois `vercel.json` está lá.
- Framework: Other.
- Build: `node vercel/build.mjs`.
- Output: `vercel/dist`.
- Branch de teste: `develop`.
- Branch principal `main` somente após homologação, aprovação e merge.
- Preview público atualizado pela branch `develop`: `https://nichelle-2026-git-develop-fwragenciadigitals-projects.vercel.app`.
- Prévia visual: `https://nichelle-2026-git-develop-fwragenciadigitals-projects.vercel.app/preview/`.
- JS oficial: `https://nichelle-2026-git-develop-fwragenciadigitals-projects.vercel.app/nichelle.js`.
- CSS oficial: `https://nichelle-2026-git-develop-fwragenciadigitals-projects.vercel.app/nichelle.css` (carregado pelo JS da mesma origem).
- Esses são aliases de homologação da branch `develop`, não o domínio estável legado. Um push concluído em `develop` aciona um novo deployment e atualiza o alias. PRs e branches diferentes recebem previews próprios.
- A configuração publicada da galeria (`/galeria-publicada.json`) ainda não está hospedada nesse build. Até existir um endpoint JSON público sanitizado com CORS/MIME/cache validados e URLs reais aprovadas, o carregamento do JS/CSS não significa que a galeria esteja pronta para exibir vídeos.
- O HTML de integração com a Loja Integrada continua separado: não foi inserido na loja, e o host legado não deve ser substituído sem plano de migração.

## Cache

`vercel.json` solicita revalidação no browser e `no-store` na CDN para `/nichelle.js`. Mesmo com cache mínimo, o código só é atualizado após um **novo deployment concluído**. Não prometer publicação imediata ao salvar no Git.

## Teste

`node vercel/build.mjs`; `node --check vercel/dist/nichelle.js`. Conferir no Network as respostas JS/CSS, origem igual e cabeçalhos reais de HTTPS / Cache-Control.

## Destino final

Após homologação, definir e aprovar o endpoint JSON e o plano de migração do runtime legado antes de instalar os arquivos na Loja Integrada. Não assumir que um campo HTML ou upload de imagem é hospedagem de JS.
