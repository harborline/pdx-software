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
    products: [
      'App Sweep',
      'Prompt Producer',
      'Fly',
      'Book Cook',
      'Spooool',
      'Brave Dev Extension',
      'Make The App',
      'alex',
    ],
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
        category: 'AI productivity workspace and knowledge base',
        url: 'https://fly.pm',
      },
      {
        name: 'Book Cook',
        category: 'AI authoring studio',
        url: 'https://book-cook.com',
      },
      {
        name: 'Spooool',
        category: 'Video platform',
        url: 'https://spooool.com',
      },
      {
        name: 'Brave Dev Extension',
        category: 'Browser developer extension',
        url: 'https://github.com/harborline/brave-dev-ext',
      },
      {
        name: 'Make The App',
        category: 'Prompt-to-app builder',
        url: 'https://makethe.app',
      },
      {
        name: 'alex',
        category: 'Apple-platform conversational companion',
        url: 'https://alex.chat',
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
