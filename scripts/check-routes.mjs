/**
 * Self-check for the path table. The Worker answers 404s from it and the
 * legacy-domain Worker rewrites against it, so a mistake here shows up as a
 * dead inbound link rather than a crash. Run: pnpm test
 */
import assert from 'node:assert/strict'
import { isKnownPath, resolvePath } from '../src/lib/routes.ts'
import redirect from '../src/worker/redirect.ts'

// Known paths, including trailing-slash and alias forms.
for (const p of ['/', '/support', '/privacy', '/terms', '/tos', '/app-sweep', '/alex', '/fly-mail', '/about', '/marketing', '/fly', '/support/']) {
  assert.equal(isKnownPath(p), true, `expected ${p} to be a known path`)
}

// Unknown paths must not be absorbed by the SPA fallback.
for (const p of ['/nope', '/app-sweep/extra', '/appsweep', '/privacy-policy']) {
  assert.equal(isKnownPath(p), false, `expected ${p} to 404`)
}

assert.equal(resolvePath('/fly'), '/fly-mail')
assert.equal(resolvePath('/about/'), '/')
assert.equal(resolvePath('/'), '/')

// Legacy domains redirect path-for-path, with the merge-time rewrites applied.
const to = url => redirect.fetch(new Request(url)).headers.get('location')
assert.equal(to('https://pdx.software/'), 'https://theharborline.co/')
assert.equal(to('https://pdx.software/app-sweep'), 'https://theharborline.co/app-sweep')
assert.equal(to('https://www.pdx.software/privacy?x=1'), 'https://theharborline.co/privacy?x=1')
assert.equal(to('https://pdx.software/about'), 'https://theharborline.co/')
assert.equal(to('https://pdx.software/fly'), 'https://theharborline.co/fly-mail')
assert.equal(to('https://harborline.cloud/terms/'), 'https://theharborline.co/terms')
assert.equal(redirect.fetch(new Request('https://pdx.software/')).status, 301)

console.log('routes ok')
