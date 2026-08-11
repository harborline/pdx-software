/**
 * Emits public/favicon.svg — a frozen vector frame of the mark, in the
 * app-icon treatment from the design handoff (28px ink chip, 8px radius,
 * paper particles). Canvas does not survive favicon/PNG/PDF export, so the
 * static form has to be vector.
 *
 * Run: node scripts/make-favicon.mjs
 */
import { writeFileSync, mkdirSync } from 'node:fs'

const N = 260
const SIZE = 64
const R = SIZE / 2

/** Same target shape as FluidMark: a sine wave, gaussian-thickened. */
function waveTarget(i, n) {
  const u = (i / n) * 2 - 1
  let x = u + (Math.random() - 0.5) * 0.05
  const g = (Math.random() + Math.random() + Math.random() - 1.5) / 1.5
  let y = Math.sin(u * 2.1) * 0.3 + g * (0.06 + 0.13 * (1 - Math.abs(u) * 0.5))
  const d = Math.hypot(x, y)
  if (d > 0.9) {
    const k = 0.9 / d
    x *= k
    y *= k
  }
  return [x, y]
}

const dots = []
for (let i = 0; i < N; i++) {
  const [x, y] = waveTarget(i, N)
  const d = Math.hypot(x, y)
  // Radial falloff, applied as rim² — same as the canvas mark.
  const rim = 1 - Math.max(0, Math.min(1, (d - 0.46) / 0.46))
  const alpha = Math.min(0.92, rim * rim * 0.95)
  if (alpha < 0.03) continue
  const r = (0.5 + Math.random() * 0.8) * (0.7 + 0.5 * rim)
  dots.push(
    `<circle cx="${(R + x * R).toFixed(2)}" cy="${(R + y * R).toFixed(2)}" r="${r.toFixed(2)}" opacity="${alpha.toFixed(2)}"/>`,
  )
}

const svg = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 ${SIZE} ${SIZE}" width="${SIZE}" height="${SIZE}">
<rect width="${SIZE}" height="${SIZE}" rx="14" fill="#1c2a22"/>
<g fill="#f0efe6">
${dots.join('\n')}
</g>
</svg>
`

mkdirSync('public', { recursive: true })
writeFileSync('public/favicon.svg', svg)
console.log(`wrote public/favicon.svg (${dots.length} particles)`)
