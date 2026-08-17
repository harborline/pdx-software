/**
 * Path table shared by the React app and the Worker. Plain data on purpose —
 * the Worker imports this to answer a real 404 status for unknown paths, and
 * must not pull the icon/React graph in `content.ts` along with it.
 */

export const PRODUCT_SLUGS = [
  'keepout',
  'free-speech-tts',
  'app-sweep',
  'prompt-producer',
  'fly-mail',
  'book-cook',
  'spooool',
  'ai-dev-sidebar',
  'makethe-app',
  'alex',
] as const

export const STATIC_ROUTES = ['/', '/privacy', '/terms', '/tos', '/support'] as const

/** Legacy paths that were linked from pdx.software; kept alive as aliases. */
export const ALIASES: Record<string, string> = {
  '/about': '/',
  '/marketing': '/',
  '/fly': '/fly-mail',
}

/** Normalise a request path: strip trailing slashes, then apply aliases. */
export function resolvePath(pathname: string): string {
  const trimmed = pathname.length > 1 ? pathname.replace(/\/+$/, '') : pathname
  return ALIASES[trimmed] ?? (trimmed || '/')
}

export function isKnownPath(pathname: string): boolean {
  const path = resolvePath(pathname)
  if ((STATIC_ROUTES as readonly string[]).includes(path)) return true
  return (PRODUCT_SLUGS as readonly string[]).includes(path.slice(1))
}
