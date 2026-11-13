# Deploy automático: GitHub → um JavaScript público da Nichelle

## Esclarecimento

O repositório `fwragenciadigital/nichelle-2026` está **privado**. Não servir scripts diretamente de `raw.githubusercontent.com` ou `cdn.jsdelivr.net/gh/...` de repositório privado. Essas URLs não representam um CDN público garantido para a loja.

O objetivo é **uma URL pública estável** para o único arquivo `public/nichelle.js`. Atualizar e aprovar código no Git deve publicar nova versão nesta mesma URL **depois que uma integração de deploy for configurada**. A simples ação de salvar arquivos no GitHub não publica código na Loja Integrada.

## Opção A — preferencial por já existir hospedagem FWR

Hospedar `nichelle.js` em um caminho de arquivos estáticos da FWR (HTTPS), por exemplo `https://HOST-FWR-VALIDADO/nichelle.js`. Esta é uma **forma ilustrativa**, não um URL funcional verificado.

O workflow `.github/workflows/publicar-nichelle-js.yml` está preparado para enviar o arquivo ao servidor via SSH após **push em `main`**, condicionado à configuração dos secrets/vars. Ele não é executado enquanto a configuração não estiver habilitada.

Configurar no GitHub:
- Variável `FWR_NICHELLE_DEPLOY_ENABLED = true` (somente após homologação aprovada).
- Secrets `FWR_SSH_HOST`, `FWR_SSH_USER`, `FWR_SSH_PRIVATE_KEY`, `FWR_SSH_KNOWN_HOSTS` e, se necessário, `FWR_SSH_PORT`.
- Variável `FWR_NICHELLE_REMOTE_PATH` com o caminho absoluto da pasta estática já criada no servidor.
- O responsável pela hospedagem deve garantir MIME de JS, TLS e cabeçalhos de cache. **Não copiar chave privada para código**.
- Se configurar domínio/site para asset estático, confirmar HTTP 200, o JavaScript entregue e a política de cache antes de informar o link ao cliente.

Sempre haverá duas etapas distintas: **alterar arquivo no Git** e **implantar versão aprovada**. Em `develop`, teste; em `main`, o deploy produz alteração para visitantes, após cache expirar.

## Opção B — GitHub Pages

Se o plano GitHub do dono da conta permitir Pages para este repositório privado, pode ser configurada publicação pública de assets, com URL estável. A disponibilidade e a visibilidade são dependentes do plano/configuração: ver https://docs.github.com/en/pages/getting-started-with-github-pages/what-is-github-pages .

Se Pages não estiver habilitado, optar por servidor FWR ou repositório público **somente com build de assets**, nunca expor o código privado de admin/dados. Arquivos JS do navegador são sempre públicos ao cliente, mesmo quando o repositório-fonte é privado.

## Cache e rollback

- Preferir `Cache-Control: public, max-age=60, must-revalidate` na primeira homologação. Comportamento real depende da hospedagem.
- Conteúdo novo da URL fixa pode não chegar instantaneamente devido a browser/CDN/cache; validar via Network e cabeçalhos.
- GitHub commit anterior pode ser restaurado e republicado; manter changelog e teste de sintaxe antes do deploy.
- Não injetar o JS original da Malheiro e o novo runtime juntos.

## Workflow de GitHub Pages já preparado (opção ainda DESATIVADA)

O arquivo `.github/workflows/publicar-nichelle-pages.yml` publica somente `public/nichelle.js` como `nichelle.js`, sem expor `admin/`, `server/` ou configurações.

Para ativá-lo após homologação: confirmar no plano GitHub Pages disponível para repositório privado; configurar `Settings > Pages > Build and deployment = GitHub Actions`; adicionar variável `FWR_NICHELLE_PAGES_ENABLED=true`; executar depois de merge aprovado para `main`. O endereço padrão de projeto terá formato `https://fwragenciadigital.github.io/nichelle-2026/nichelle.js`, **mas não é URL funcional verificada enquanto Pages não for implantado**. Checar se resposta é HTTP 200 e se o MIME permite execução de JS antes de colar na loja. Se Pages não estiver disponível, usar a publicação FWR via SSH descrita acima.

**Use somente um destino de produção:** Pages ou hospedagem FWR. Não ativar os dois pipelines simultaneamente sem motivo.
