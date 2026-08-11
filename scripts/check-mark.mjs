/**
 * Guards the mark's retiming. SPEED in src/lib/mark.ts is meant to change only
 * the PACE — the settled shape and the brightness are supposed to be the same
 * mark at any tempo. Two things make that fragile: alpha is derived from
 * particle speed, and the trail wash is per-frame, so both are compensated
 * against SPEED rather than wall-clock. Break either and the mark silently goes
 * dim or grows a stubby tail, which no type checker will notice.
 *
 * Measured against SPEED = 1, which reproduces the original engine exactly.
 * The bands below hold down to roughly SPEED = 0.5; past that the rescale stops
 * being neutral (at 0.45 mean alpha falls to 0.19) and this check fires — that
 * is the intended signal, not a flaky test.
 *
 * Run: pnpm test
 */
import { PRESETS, SPEED, advance, particleAlpha, rimFalloff, seedParticles, seedTargets } from '../src/lib/mark.ts'

const COUNT = 760
const SETTLE = Math.round(420 / SPEED)

// Seeded, or the check drifts by a few percent per run and gets muted.
let s = 12345
Math.random = () => {
  s = (s * 1664525 + 1013904223) >>> 0
  return s / 4294967296
}

const opts = { ...PRESETS.curl, count: COUNT }
const particles = seedParticles(COUNT)
const targets = seedTargets(COUNT)
for (let f = 0; f < SETTLE; f++) {
  for (let i = 0; i < COUNT; i++) advance(particles[i], targets[i], opts, f / 60)
}

const mean = (a) => a.reduce((x, y) => x + y, 0) / a.length
const speeds = particles.map((q) => Math.hypot(q.vx, q.vy))
const meanAlpha = mean(particles.map((q, i) => particleAlpha(rimFalloff(q.x, q.y), speeds[i], opts.glow)))
const maxRadius = Math.max(...particles.map((q) => Math.hypot(q.x, q.y)))
const pace = mean(speeds) / SPEED

const checks = [
  ['brightness survives the retiming', meanAlpha > 0.21 && meanAlpha < 0.28, meanAlpha.toFixed(3)],
  // advance() clamps to exactly 0.99, so this is float slack, not headroom.
  ['field stays inside the disc', maxRadius <= 0.9901, maxRadius.toFixed(4)],
  ['pace scales with SPEED', pace > 0.028 && pace < 0.045, pace.toFixed(4)],
]

let failed = 0
for (const [name, ok, value] of checks) {
  console.log(`${ok ? 'ok  ' : 'FAIL'} ${name} (${value})`)
  if (!ok) failed++
}
console.log(`mark: ${checks.length - failed}/${checks.length} at SPEED ${SPEED}`)
process.exit(failed ? 1 : 0)
