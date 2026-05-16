# Harborline Holdings

React SPA plus Hono-backed Cloudflare Worker for `https://harborline.cloud` and `https://pdx.software`.

`harborline.cloud` is the holding-company surface for Harborline Holdings. `pdx.software` serves App Sweep marketing/support/legal pages. `fly.pm` remains the link tracking and click analytics product.

## Local Development

```bash
pnpm install
pnpm build
pnpm preview
```

`pnpm preview` builds the React app, then serves the SPA and `/api/*` routes through Wrangler at `http://localhost:8787`.

## Routes

- `harborline.cloud/` - holding company home
- `pdx.software/marketing` - App Sweep marketing page for App Store metadata
- `pdx.software/support` - product support page
- `pdx.software/privacy` - privacy policy
- `pdx.software/terms` and `pdx.software/tos` - terms
- `/api/status` - Worker health/status endpoint
- `/api/company` - structured company/product metadata

## Deployment

The Worker config is in `wrangler.jsonc` and includes routes for `harborline.cloud/*`, `www.harborline.cloud/*`, `pdx.software/*`, and `www.pdx.software/*`.

```bash
pnpm run deploy
```

Deployment requires a noninteractive Cloudflare auth path. This machine can deploy with:

```bash
doppler run --project quickapp --config dev -- pnpm run deploy
```
