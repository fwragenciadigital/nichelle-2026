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
- Link público estável: a URL de deployment/branch **ainda depende da criação e validação do projeto na conta Vercel**.
- O script na Loja Integrada **não muda** até que uma URL HTTPS retornando 200 esteja verificada.

## Cache

`vercel.json` solicita revalidação no browser e `no-store` na CDN para `/nichelle.js`. Mesmo com cache mínimo, o código só é atualizado após um **novo deployment concluído**. Não prometer publicação imediata ao salvar no Git.

## Teste

`node vercel/build.mjs`; `node --check vercel/dist/nichelle.js`. Conferir no Network as respostas JS/CSS, origem igual e cabeçalhos reais de HTTPS / Cache-Control.

## Destino final

Depois de tudo pronto, migrar para a hospedagem/gestão de arquivos que a Loja Integrada realmente disponibilizar, **somente se suportar JavaScript próprio acessível por URL pública**. Não assumir que um campo HTML ou upload de imagem é hospedagem de JS. Ajustar o link no HTML/Rodapé apenas após confirmar a URL de produção.
