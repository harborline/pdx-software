/**
 * Emits the small-format Tideline app-icon treatment from the current brand
 * handoff. At favicon sizes the mark intentionally reduces to one opaque wave.
 *
 * Run: pnpm favicon
 */
import { mkdirSync, writeFileSync } from 'node:fs'

const frontWave =
  'M-84 27 C-73.5 22 -73.5 22 -63 27 C-52.5 32 -52.5 32 -42 27 C-31.5 22 -31.5 22 -21 27 C-10.5 32 -10.5 32 0 27 C10.5 22 10.5 22 21 27 C31.5 32 31.5 32 42 27 C52.5 22 52.5 22 63 27 C73.5 32 73.5 32 84 27 C94.5 22 94.5 22 105 27 C115.5 32 115.5 32 126 27 V52 H-84 Z'

const svg = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 64 64" width="64" height="64">
  <rect width="64" height="64" rx="14" fill="#1c2a22"/>
  <g transform="translate(8 8)" fill="#f0efe6" stroke="#f0efe6">
    <clipPath id="tideline-favicon-clip"><rect x="3" y="3" width="42" height="42" rx="10"/></clipPath>
    <g clip-path="url(#tideline-favicon-clip)" stroke="none">
      <path d="${frontWave}"/>
    </g>
    <rect x="3" y="3" width="42" height="42" rx="10" fill="none" stroke-width="5"/>
  </g>
</svg>
`

mkdirSync('public', { recursive: true })
writeFileSync('public/favicon.svg', svg)
console.log('wrote public/favicon.svg (Tideline tiny mark)')
