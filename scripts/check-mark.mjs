/**
 * Guards the source and generated forms of the Tideline identity mark. These
 * checks keep the five-layer full mark, three-layer compact mark, one-wave tiny
 * mark, rounded frame, and reduced-motion behavior from drifting apart.
 *
 * Run: pnpm test
 */
import assert from 'node:assert/strict'
import { readFileSync } from 'node:fs'

const component = readFileSync('src/components/TidelineMark.tsx', 'utf8')
const styles = readFileSync('src/styles.css', 'utf8')
const favicon = readFileSync('public/favicon.svg', 'utf8')
const html = readFileSync('index.html', 'utf8')

for (const opacity of ['0.2', '0.22', '0.26', '0.3', '0.42']) {
  assert.ok(
    component.includes(`opacity="${opacity}"`) || component.includes(`'${opacity}'`),
    `full mark is missing opacity ${opacity}`,
  )
}

assert.match(component, /detail === 'compact'/)
assert.match(component, /detail === 'tiny'/)
assert.match(component, /<rect[\s\S]*rx="10"[\s\S]*stroke="currentColor"/)
assert.match(styles, /@media \(prefers-reduced-motion: reduce\)[\s\S]*\.tideline-drift[\s\S]*animation: none/)

assert.match(favicon, /fill="#1c2a22"/)
assert.match(favicon, /fill="#f0efe6"/)
assert.equal((favicon.match(/<path /g) ?? []).length, 1, 'tiny favicon must contain one wave')
assert.doesNotMatch(favicon, /<circle /, 'particle artwork must not survive in the favicon')
assert.match(
  html,
  /<link rel="icon" href="\/favicon\.svg\?v=tideline-20260817" type="image\/svg\+xml" \/>/,
  'the site must use the cache-busted Tideline favicon URL',
)

console.log('tideline mark ok')
