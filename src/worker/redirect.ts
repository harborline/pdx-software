/**
 * Legacy-domain redirect Worker.
 *
 * pdx.software and harborline.cloud were the product and holding sites; both
 * are now theharborline.co. Path and query are preserved so every inbound deep
 * link (pdx.software/app-sweep, /privacy, /terms, …) lands on its counterpart.
 *
 * The narrower pdx.software/keepout/* and /free-speech/* routes still point at
 * the keepout-store-pages Worker and are unaffected — Cloudflare matches the
 * more specific route first.
 */

const TARGET = 'theharborline.co'

/** Paths whose destination changed when the sites merged. */
const REWRITES: Record<string, string> = {
  '/about': '/',
  '/marketing': '/',
  '/fly': '/fly-mail',
}

export default {
  fetch(request: Request): Response {
    const url = new URL(request.url)
    const path = url.pathname.length > 1 ? url.pathname.replace(/\/+$/, '') : url.pathname
    url.hostname = TARGET
    url.protocol = 'https:'
    url.port = ''
    url.pathname = REWRITES[path] ?? (path || '/')
    return Response.redirect(url.toString(), 301)
  },
}
