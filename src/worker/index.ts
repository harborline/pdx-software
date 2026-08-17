import { Hono } from 'hono'
import { cors } from 'hono/cors'
import { LISTED_PRODUCTS } from '../lib/products'
import { isKnownPath } from '../lib/routes'

type Bindings = {
  ASSETS: Fetcher
}

const app = new Hono<{ Bindings: Bindings }>()

app.use('/api/*', cors())

app.get('/api/status', (c) => {
  return c.json({
    ok: true,
    service: 'theharborline.co',
    company: 'The Harborline Company',
    products: LISTED_PRODUCTS.map(product => product.name),
    purpose: 'Company website and product support surface',
  })
})

app.get('/api/company', (c) => {
  return c.json({
    name: 'The Harborline Company',
    domain: 'theharborline.co',
    supportEmail: 'help@pdx.software',
    products: LISTED_PRODUCTS.map(({ name, category, url }) => ({ name, category, url })),
  })
})

app.notFound(async (c) => {
  const { pathname } = new URL(c.req.url)

  if (pathname.startsWith('/api/')) {
    return c.json({ error: 'Not found' }, 404)
  }

  const res = await c.env.ASSETS.fetch(c.req.raw)

  // The asset handler serves index.html for every unmatched path (SPA mode),
  // which would answer 200 for URLs that do not exist. Re-stamp the status so
  // dead inbound links are actually reported as dead. Guarded on text/html so
  // a real static asset is never mislabelled.
  const isHtml = res.headers.get('content-type')?.includes('text/html') ?? false
  if (res.status === 200 && isHtml && !isKnownPath(pathname)) {
    return new Response(res.body, { status: 404, headers: res.headers })
  }

  return res
})

export default app
