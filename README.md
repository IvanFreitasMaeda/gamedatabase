# Estante (Cloudflare Workers)

1. Apague a pasta `functions` do repositório (se existir) e envie estes arquivos: `wrangler.jsonc`, `src/index.js`, `public/*`, `schema.sql`.
2. Cloudflare > Storage & databases > D1 > criar banco `estante`. Copie o **Database ID**, abra o schema.sql no Console do banco e execute.
3. No GitHub, edite o `wrangler.jsonc` e troque `COLE_AQUI_O_ID_DO_BANCO_D1` pelo ID copiado.
4. Deploy (Build command vazio, Deploy command `npx wrangler deploy`).
5. No Worker > Settings > Variables and secrets (runtime): crie os Secrets `STEAM_API_KEY`, `TWITCH_CLIENT_ID`, `TWITCH_CLIENT_SECRET`.
