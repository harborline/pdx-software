import { Hono } from 'hono'
import { cors } from 'hono/cors'
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
    products: [
      'App Sweep',
      'Prompt Producer',
      'Fly',
      'Book Cook',
      'Spooool',
      'AI Dev Sidebar',
      'Make The App',
      'alex',
    ],
    purpose: 'Company website and product support surface',
  })
})

app.get('/api/company', (c) => {
  return c.json({
    name: 'The Harborline Company',
    domain: 'theharborline.co',
    supportEmail: 'help@pdx.software',
    products: [
      {
        name: 'App Sweep',
        category: 'Mac utility',
        url: 'https://theharborline.co/app-sweep',
      },
      {
        name: 'Prompt Producer',
        category: 'Prompt utility',
        url: 'https://theharborline.co/prompt-producer',
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
        name: 'AI Dev Sidebar',
        category: 'Browser developer extension',
        url: 'https://github.com/harborline/extension',
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
