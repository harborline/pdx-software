/**
 * The mark's engine, with no rendering in it — particles, flow fields, target
 * shape, and one simulation step. `FluidMark.tsx` draws it to canvas each
 * frame; `scripts/make-favicon.mjs` runs it headless and emits SVG, so the
 * frozen vector frame is the same mark rather than a redrawing of it.
 *
 * Ported from the design handoff (`fluid-mark.js`). Particles live in unit
 * space (x/y in [-1, 1], origin at the centre) and are mapped to pixels only at
 * draw time — that is why one implementation works at 28px and 300px.
 */

export type FieldName = 'curl' | 'shear' | 'vortex'
export type Preset = 'curl' | 'shear' | 'vortex' | 'ribbon'

/** Cheap hash-based value noise, two octaves, slowly advected. Curl field only. */
export function potential(x: number, y: number, t: number): number {
  const hash = (i: number, j: number) => {
    const n = Math.sin(i * 127.1 + j * 311.7 + 74.7) * 43758.5453
    return n - Math.floor(n)
  }
  const smooth = (a: number, b: number, u: number) => a + (b - a) * u * u * (3 - 2 * u)
  const value = (px: number, py: number) => {
    const i = Math.floor(px)
    const j = Math.floor(py)
    const fx = px - i
    const fy = py - j
    return smooth(
      smooth(hash(i, j), hash(i + 1, j), fx),
      smooth(hash(i, j + 1), hash(i + 1, j + 1), fx),
      fy,
    ) - 0.5
  }
  return value(x + t * 0.09, y - t * 0.05)
    + 0.5 * value(x * 2.1 - t * 0.06, y * 2.1 + t * 0.04)
}

/**
 * Flow fields. Each returns an ACCELERATION in unit space. Magnitudes are
 * ~0.01 on purpose — damping (0.945–0.962), not force, produces the laminar
 * feel. Raising these makes it twitchy.
 */
export const FIELDS: Record<FieldName, (x: number, y: number, t: number) => [number, number]> = {
  /** Curl of the noise potential: divergence-free, so nothing piles up. */
  curl(x, y, t) {
    const e = 0.035
    const dPdy = (potential(x, y + e, t) - potential(x, y - e, t)) / (2 * e)
    const dPdx = (potential(x + e, y, t) - potential(x - e, y, t)) / (2 * e)
    return [dPdy * 0.010, -dPdx * 0.010]
  },
  /** Horizontal laminae at speeds banded by depth. Pair with wrap. */
  shear(x, y, t) {
    const band = Math.sin(y * 3.1) * 0.5 + Math.sin(y * 1.3 + 1.1) * 0.5
    const u = 0.0125 * (0.35 + band) + Math.sin(y * 6.2 + t * 0.5) * 0.0016
    return [u, Math.sin(x * 2.4 + t * 0.31) * 0.0016]
  },
  /** Two counter-rotating centres whose separation oscillates (~26s). */
  vortex(x, y, t) {
    const sep = 0.34 + Math.sin(t * 0.24) * 0.26
    let vx = 0
    let vy = 0
    for (const s of [-1, 1]) {
      const dx = x - s * sep
      const dy = y
      const d2 = dx * dx + dy * dy + 0.05
      const k = (s * 0.0075) / d2
      vx += -dy * k
      vy += dx * k
    }
    return [vx, vy]
  },
}

/** The mark's silhouette: a sine wave across the disc, gaussian-thickened. */
export function waveTarget(i: number, n: number): [number, number] {
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

export interface PresetConfig {
  field: FieldName
  count: number
  wash: number
  pull: number
  damp: number
  glow: number
  weight: number
  wrap?: boolean
}

export const PRESETS: Record<Preset, PresetConfig> = {
  curl: { field: 'curl', count: 900, wash: 0.10, pull: 0.0055, damp: 0.945, glow: 40, weight: 1.00 },
  shear: { field: 'shear', count: 760, wash: 0.055, pull: 0.0042, damp: 0.955, glow: 30, weight: 0.85, wrap: true },
  vortex: { field: 'vortex', count: 820, wash: 0.09, pull: 0.0040, damp: 0.952, glow: 34, weight: 0.95 },
  // Same field as curl — the entirely different look is count + wash + weight.
  ribbon: { field: 'curl', count: 150, wash: 0.022, pull: 0.0038, damp: 0.962, glow: 26, weight: 1.50 },
}

export interface Particle {
  x: number
  y: number
  /** Previous position — the streak's tail, and why segments read as motion. */
  px: number
  py: number
  vx: number
  vy: number
  /** Base radius multiplier. */
  s: number
  /** Per-particle time offset. */
  ph: number
  /** Stroke-weight jitter. */
  sw: number
}

/** Seed particles uniformly over the disc. */
export function seedParticles(n: number): Particle[] {
  const p: Particle[] = []
  for (let i = 0; i < n; i++) {
    const a = Math.random() * Math.PI * 2
    const r = 0.85 * Math.sqrt(Math.random()) // sqrt = area-uniform
    const x = Math.cos(a) * r
    const y = Math.sin(a) * r
    p.push({
      x,
      y,
      px: x,
      py: y,
      vx: (Math.random() - 0.5) * 0.004,
      vy: (Math.random() - 0.5) * 0.004,
      s: 0.30 + Math.random() * 0.55,
      ph: Math.random() * Math.PI * 2,
      sw: 0.75 + Math.random() * 0.50,
    })
  }
  return p
}

export function seedTargets(n: number): Array<[number, number]> {
  const targets: Array<[number, number]> = []
  for (let i = 0; i < n; i++) targets.push(waveTarget(i, n))
  return targets
}

/** Advance one particle by one frame. Rendering is the caller's business. */
export function advance(
  q: Particle,
  target: [number, number],
  opts: PresetConfig,
  t: number,
): void {
  // Sampled at 2.4x particle space so noise features span roughly a third of
  // the disc — big enough to move neighbours as a sheet rather than a swarm.
  const [fx, fy] = FIELDS[opts.field](q.x * 2.4, q.y * 2.4, t + q.ph * 0.12)

  q.vx += (target[0] - q.x) * opts.pull + fx
  q.vy += (target[1] - q.y) * opts.pull + fy
  q.vx *= opts.damp // damping >> pull is what keeps it laminar
  q.vy *= opts.damp

  q.px = q.x
  q.py = q.y
  q.x += q.vx
  q.y += q.vy

  const d = Math.hypot(q.x, q.y)
  if (d <= 0.99) return

  if (opts.wrap) {
    q.x = -q.x * 0.92
    q.y = -q.y * 0.92
    q.px = q.x // suppress the teleport streak
    q.py = q.y
  } else {
    const k = 0.99 / d
    q.x *= k
    q.y *= k
    q.vx *= 0.5
    q.vy *= 0.5
  }
}

/**
 * Radial falloff. Nothing draws the circle — full through the middle, gone
 * before the rim, and the density implies one.
 */
export function rimFalloff(x: number, y: number): number {
  return 1 - Math.max(0, Math.min(1, (Math.hypot(x, y) - 0.46) / 0.46))
}

/**
 * Alpha comes from SPEED, never from a per-particle timer — a timer is what
 * made earlier versions read as bacteria. Fast water is bright, settled fades.
 */
export function particleAlpha(rim: number, speed: number, glow: number): number {
  return Math.min(0.92, rim * rim * (0.26 + Math.min(0.66, speed * glow)))
}
