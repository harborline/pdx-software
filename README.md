# Harborline

React SPA plus a Hono-backed Cloudflare Worker for `https://theharborline.co` — the site for
The Harborline Company and every product it publishes.

`pdx.software` and `harborline.cloud` were the old product and holding surfaces. Both now 301 to
`theharborline.co`, path for path, from a second Worker in this repo.

## Local Development

```bash
pnpm install
pnpm build
pnpm preview     # SPA + /api/* through Wrangler at http://localhost:8787
pnpm test        # path-table self-check (404s, aliases, legacy redirects)
```

## The mark

`src/components/FluidMark.tsx` is the animated identity mark: a particle field carried by a curl
noise flow field, pulled toward a wave-shaped target, inside an implied circle. The maths is a
straight port of the design handoff (`design_handoff_harborline_fluid_mark/fluid-mark.js`) and the
tuning constants in `PRESETS` are final — `damp` and `wash` in particular are what make it read as
water rather than as a swarm. Under `prefers-reduced-motion: reduce` it renders one settled frame
and stops.

`pnpm favicon` regenerates `public/favicon.svg`, a frozen vector frame of the mark in the app-icon
treatment (canvas does not survive favicon or PDF export, so the static form has to be vector).

## Routes

- `/` — products, principles, contact
- `/<slug>` — a product page for each entry in `src/lib/content.ts`
  (`app-sweep`, `prompt-producer`, `fly-mail`, `book-cook`, `spooool`, `ai-dev-sidebar`,
  `makethe-app`, `alex`)
- `/support`, `/privacy`, `/terms` (and `/tos`)
- `/about`, `/marketing`, `/fly` — aliases kept alive for links that predate the merge
- `/api/status`, `/api/company` — Worker JSON endpoints

Anything else returns a real 404 status, not the SPA fallback with a 200. The path table lives in
`src/lib/routes.ts` and is shared by the app and the Worker; adding a product without updating
`PRODUCT_SLUGS` fails `tsc`.

## Deployment

Two Workers:

| Config | Worker | Serves |
| --- | --- | --- |
| `wrangler.jsonc` | `harborline` | `theharborline.co`, `www.theharborline.co` |
| `wrangler.redirect.jsonc` | `pdx-software` | 301s from `pdx.software` and `harborline.cloud` |

```bash
pnpm run deploy            # site
pnpm run deploy:redirect   # legacy domains
```

Pushing to `main` runs both via `.github/workflows/deploy.yml`.

The narrower `pdx.software/keepout/*` and `/free-speech/*` routes still belong to the
`keepout-store-pages` Worker and are unaffected — Cloudflare matches the more specific route first.
