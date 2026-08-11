/**
 * Emits public/favicon.svg — a frozen vector frame of the mark, in the app-icon
 * treatment from the design handoff (ink chip, rounded corners, paper
 * particles). Canvas does not survive favicon, PNG, or PDF export, so the
 * static form has to be vector.
 *
 * It runs the real engine from src/lib/mark.ts rather than drawing the target
 * shape, because the target on its own is a bare diagonal — the mark is what
 * the field looks like once the flow has spread it across the disc.
 *
 * Run: pnpm favicon
 */
import { writeFileSync, mkdirSync } from 'node:fs'
import {
  PRESETS,
  advance,
  particleAlpha,
  rimFalloff,
  seedParticles,
  seedTargets,
} from '../src/lib/mark.ts'

const SIZE = 64
const R = SIZE / 2
const COUNT = 760 // enough surviving particles to read as a disc at 16px
const SETTLE = 420 // frames to let the field spread and reach its steady state

const opts = { ...PRESETS.curl, count: COUNT }
const particles = seedParticles(COUNT)
const targets = seedTargets(COUNT)

for (let f = 0; f < SETTLE; f++) {
  for (let i = 0; i < COUNT; i++) advance(particles[i], targets[i], opts, f / 60)
}

const dots = []
for (const q of particles) {
  const rim = rimFalloff(q.x, q.y)
  if (rim <= 0.01) continue
  const alpha = particleAlpha(rim, Math.hypot(q.vx, q.vy), opts.glow)
  if (alpha < 0.05) continue
  // Dots rather than streaks: at 16px a hairline segment disappears, and the
  // canvas mark falls back to the same dot for sub-pixel segments.
  const r = Math.max(0.4, q.s * (R / 74) * (0.7 + 0.5 * rim) * q.sw * opts.weight) * 1.6
  dots.push(
    `<circle cx="${(R + q.x * R).toFixed(1)}" cy="${(R + q.y * R).toFixed(1)}" r="${r.toFixed(2)}" opacity="${alpha.toFixed(2)}"/>`,
  )
}

const svg = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 ${SIZE} ${SIZE}" width="${SIZE}" height="${SIZE}">
<rect width="${SIZE}" height="${SIZE}" rx="14" fill="#1c2a22"/>
<g fill="#f0efe6">
${dots.join('')}
</g>
</svg>
`

mkdirSync('public', { recursive: true })
writeFileSync('public/favicon.svg', svg)
console.log(`wrote public/favicon.svg (${dots.length} particles, ${(svg.length / 1024).toFixed(1)} kB)`)
