# Nichelle 2026 — Modo privado FWR

Extensão local para Google Chrome (Manifest V3). Ativa o framework visual SOMENTE na aba em que o desenvolvedor clicar, sem salvar alterações na Loja Integrada e sem ficar ativa após recarregar/navegar.

## Instalação no Chrome (Windows)

1. Extraia o ZIP fornecido pela FWR numa pasta do computador.
2. Abra chrome://extensions.
3. Ative **Modo do desenvolvedor**.
4. Clique em **Carregar sem compactação** e selecione a pasta que contém manifest.json.
5. Acesse https://www.nichelleimports.com.br/cabelos ou a home oficial.
6. Clique no ícone da extensão e use **Diagnosticar** primeiro.
7. Use **Ativar prévia visual segura**. Este modo só monta qualificadores demonstrativos e não move vitrines.
8. **Ativar vitrines reais (experimental)** também movimenta as listagens encontradas no DOM do navegador para testar o layout. Isso pode afetar sliders e eventos na aba local. **Não finalizar pedidos, alterar carrinho ou testar pagamentos nesse modo.**
9. Para desligar, clique em **Desativar e recarregar** ou atualize a página.

Os scripts e CSS são buscados pelo navegador em https://nichelle-2026.vercel.app/nichelle27.js e .css. Se o tema aplicar CSP que bloqueie esses domínios, a extensão avisa. Nesse caso não forçar uma instalação pública e revisar a opção de empacotar os recursos localmente.

## Contrato de segurança

- É um recurso **local de visualização**, não um sistema de autenticação. Qualquer desenvolvedor pode alterar o próprio DOM via DevTools, mas isso não muda a loja para visitantes.
- Não coloca um parâmetro público secreto na URL, não requer alterar o HTML/Rodapé da LI e não pede senha.
- Só aceita HTTPS em nichelleimports.com.br e www.nichelleimports.com.br e uma ação explícita.
- Não tem armazenamento, background process ou content script que executa automaticamente.
- O gate em public/nichelle27.js requer **ambos** o marcador DOM fwr-local-extension e a flag local __FWR_NICHELLE_PRIVATE_MODE__.
- O framework continua bloqueado por padrão na loja pública; o script já existente nichelle.js não é reinjetado.
- Recarregar a página descarta alterações locais e restaura a apresentação normal.
- O modo seguro não representa os treze blocos completos, pois exigiria conteúdos aprovados e seletores reais; o avançado só adota até três vitrines elegíveis.
- O build Vercel não copia esta pasta: a extensão é instalada localmente.
- Enquanto a página tiver o modo ativado, os dados reais do site continuam sendo carregados normalmente da Loja Integrada; não há ambiente comercial sandbox.
- Use um perfil Chrome de trabalho com extensões confiáveis.

## Diagnóstico no navegador

Com a extensão ativada, execute no DevTools:

    window.Nichelle27Framework?.diagnostico()

Deve mostrar previewPermitido:true somente após ativação pela extensão FWR. Numa aba comum, o mesmo framework não deve modificar a loja.

**Nunca usar o snippet histórico integracao/html-framework-nichelle27.html para ativar a home pública nesta fase.**
