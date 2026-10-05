# Estante

Catálogo de jogos da Steam (estilo MyAnimeList). Hospedagem gratuita: GitHub + Cloudflare.

## Passo a passo
1. **GitHub:** crie um repositório e envie estas pastas (public, functions) e os arquivos schema.sql e README.md.
2. **Chave Steam:** em steamcommunity.com/dev/apikey (domínio: o endereço do seu site, ou qualquer um por ora).
3. **IGDB (tempo para zerar):** em dev.twitch.tv/console crie um aplicativo e copie Client ID e Client Secret.
4. **Cloudflare:** Workers e Pages > Criar > Pages > Conectar ao Git > escolha o repositório. Build command: vazio. Output directory: `public`.
5. **Banco:** Armazenamento e bancos de dados > D1 > criar banco `estante`. No Console, cole o conteúdo de schema.sql e execute.
6. **Vincular:** projeto Pages > Configurações > Bindings > D1 > variável `DB` apontando para o banco `estante`.
7. **Variáveis (Secrets):** `STEAM_API_KEY`, `TWITCH_CLIENT_ID`, `TWITCH_CLIENT_SECRET`.
8. Faça um novo deploy. Abra o site, entre com a Steam e a biblioteca é importada sozinha.
9. **iPhone:** abra no Safari > Compartilhar > Adicionar à Tela de Início.

No Steam, deixe Privacidade > Detalhes dos jogos como **Público**.
