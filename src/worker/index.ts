import { Hono } from 'hono'
import { cors } from 'hono/cors'

type Bindings = {
  ASSETS: Fetcher
}

const app = new Hono<{ Bindings: Bindings }>()

app.use('/api/*', cors())

app.get('/api/status', (c) => {
  return c.json({
    ok: true,
    service: 'harborline.cloud',
    company: 'Harborline Holdings',
    productDomain: 'pdx.software',
    products: ['App Sweep', 'Prompt Producer', 'Fly'],
    purpose: 'Holding company website and product support surface',
  })
})

app.get('/api/company', (c) => {
  return c.json({
    name: 'Harborline Holdings',
    domain: 'harborline.cloud',
    productDomain: 'pdx.software',
    supportEmail: 'help@pdx.software',
    products: [
      {
        name: 'App Sweep',
        category: 'Mac utility',
        url: 'https://pdx.software/about',
      },
      {
        name: 'Prompt Producer',
        category: 'App Store prompt utility',
        url: 'https://apps.apple.com/app/id6772548801',
      },
      {
        name: 'Fly',
        category: 'Link tracking and click analytics',
        url: 'https://fly.pm',
      },
    ],
  })
})

app.notFound((c) => {
  if (new URL(c.req.url).pathname.startsWith('/api/')) {
    return c.json({ error: 'Not found' }, 404)
  }

  return c.env.ASSETS.fetch(c.req.raw)
})

export default app
