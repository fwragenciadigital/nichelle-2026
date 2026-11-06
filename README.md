# Nichelle Imports · Projeto 2026

**Repositório privado e independente do projeto Malheiro.**

- Loja atual: https://www.nichelleimports.com.br/
- Protótipo 2026 (**URL exata**): https://projetos.fwragenciadigital.com.br/nichelle/2026/index1.html
- Branch de implementação: `develop` (PR Draft para `main`)
- **Prompt do Codex:** [PROMPT_INICIAL_CODEX.md](./PROMPT_INICIAL_CODEX.md)
- Instruções complementares: [CODEX.md](./CODEX.md)

## Fronteira de responsabilidades

**Loja Integrada continua administrando** logo, banner principal, menu, categorias, busca, vitrines nativas, produtos, estoque, preço, carrinho e checkout.

**A FWR administra somente seções exclusivas criadas à parte**, inicialmente a galeria editorial de vídeos verticais de produtos (4 cards 9:16, poster, overlay e play) do briefing. Outras seções só serão adicionadas após mapear fielmente o protótipo.

## Painel FWR

Futuro admin privado de módulos customizados: rascunho, preview, publicar e rollback. Backend com credenciais privadas versiona as configurações e publica JSON público sanitizado em infraestrutura FWR. O JS na Loja Integrada lê apenas configuração, sem acesso administrativo. **A configuração externa é necessária para refletir edições do dashboard na loja.**

## Documentação

- [Classificação de componentes nativos e exclusivos](docs/01-INVENTARIO-NATIVO-VS-CUSTOM.md)
- [Análise do index1 e bloqueio de acesso nesta sessão](docs/02-ANALISE-INDEX1-2026.md)
- [Especificação da galeria de vídeos](docs/03-VIDEO-GALLERY-SPEC.md)
- [Arquitetura do dashboard](docs/04-DASHBOARD-SETTINGS-ARQUITETURA.md)
- [Plano de homologação](docs/05-PLANO-DE-HOMOLOGACAO.md)
- [Mídias a receber](assets/MANIFESTO.md)
- [Schema JSON](config/schema.json) e [defaults desligados](config/defaults.json)

## Verificação

```bash
node --test tests/config.test.mjs
```

**Status:** scaffold e instruções versionados. O protótipo `index1.html` não pôde ser acessado por nossas ferramentas nesta sessão; o Codex deverá tentar via Chromium. Ainda não existe código de produção instalado nem links externos válidos de módulos.
