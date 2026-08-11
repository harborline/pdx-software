import { useEffect, useRef } from 'react'

/**
 * Harborline's identity mark — a particle field carried by a flow field,
 * held inside an implied circle. Ported from the design handoff
 * (`fluid-mark.js`); the maths below is verbatim, the plumbing is React.
 *
 * Particles live in unit space (x/y in [-1, 1], origin at centre) and are
 * mapped to pixels only at draw time, which is why one implementation works
 * at 28px and 300px without retuning.
 */

type FieldName = 'curl' | 'shear' | 'vortex'
export type Preset = 'curl' | 'shear' | 'vortex' | 'ribbon'

/** Cheap hash-based value noise, two octaves, slowly advected. Curl field only. */
function potential(x: number, y: number, t: number): number {
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
const FIELDS: Record<FieldName, (x: number, y: number, t: number) => [number, number]> = {
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
function waveTarget(i: number, n: number): [number, number] {
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

interface PresetConfig {
  field: FieldName
  count: number
  wash: number
  pull: number
  damp: number
  glow: number
  weight: number
  wrap?: boolean
}

const PRESETS: Record<Preset, PresetConfig> = {
  curl: { field: 'curl', count: 900, wash: 0.10, pull: 0.0055, damp: 0.945, glow: 40, weight: 1.00 },
  shear: { field: 'shear', count: 760, wash: 0.055, pull: 0.0042, damp: 0.955, glow: 30, weight: 0.85, wrap: true },
  vortex: { field: 'vortex', count: 820, wash: 0.09, pull: 0.0040, damp: 0.952, glow: 34, weight: 0.95 },
  // Same field as curl — the entirely different look is count + wash + weight.
  ribbon: { field: 'curl', count: 150, wash: 0.022, pull: 0.0038, damp: 0.962, glow: 26, weight: 1.50 },
}

interface Particle {
  x: number
  y: number
  px: number
  py: number
  vx: number
  vy: number
  s: number
  ph: number
  sw: number
}

export interface FluidMarkProps {
  preset?: Preset
  /** Particle count override. Density matters more than the number; drop it as the mark gets smaller. */
  count?: number
  color?: string
  className?: string
  /** Accessible name. Omit for decorative instances (rendered aria-hidden). */
  label?: string
}

export function FluidMark({
  preset = 'curl',
  count,
  color = '#1c2a22',
  className,
  label,
}: FluidMarkProps) {
  const ref = useRef<HTMLCanvasElement>(null)

  useEffect(() => {
    const el = ref.current
    if (!el) return
    const ctx = el.getContext('2d')
    if (!ctx) return

    const opts = { ...PRESETS[preset], ...(count ? { count } : {}) }
    const n = opts.count
    const field = FIELDS[opts.field]
    const dpr = Math.min(window.devicePixelRatio || 1, 2)
    const still = window.matchMedia('(prefers-reduced-motion: reduce)').matches

    let w = 0
    let h = 0
    let R = 0
    let targets: Array<[number, number]> = []
    let p: Particle[] | null = null
    let raf = 0

    function build() {
      const r = el!.getBoundingClientRect()
      if (r.width === 0 || r.height === 0) return
      w = r.width
      h = r.height
      R = Math.min(r.width, r.height) / 2
      el!.width = Math.round(r.width * dpr)
      el!.height = Math.round(r.height * dpr)
      ctx!.setTransform(dpr, 0, 0, dpr, 0, 0)

      targets = []
      for (let i = 0; i < n; i++) targets.push(waveTarget(i, n))

      if (!p) {
        p = []
        for (let i = 0; i < n; i++) {
          const a = Math.random() * Math.PI * 2
          const r2 = 0.85 * Math.sqrt(Math.random()) // sqrt = area-uniform
          const x = Math.cos(a) * r2
          const y = Math.sin(a) * r2
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
      }
    }

    /** One simulation step. `paint` false advances physics without drawing. */
    function step(t: number, paint: boolean, wash: boolean) {
      if (!p || R === 0) return
      const cx = w / 2
      const cy = h / 2

      if (paint && wash) {
        // TRAIL WASH — never clearRect. Punching alpha out of the previous
        // frame is what makes this read as fluid rather than as a dot swarm.
        ctx!.globalCompositeOperation = 'destination-out'
        ctx!.globalAlpha = R < 70 ? opts.wash * 0.5 : opts.wash
        ctx!.fillStyle = '#000'
        ctx!.fillRect(0, 0, w, h)
        ctx!.globalCompositeOperation = 'source-over'
      }

      if (paint) {
        ctx!.strokeStyle = color
        ctx!.lineCap = 'round'
      }

      for (let i = 0; i < n; i++) {
        const q = p[i]
        const tg = targets[i]

        // Sampled at 2.4x particle space so noise features span roughly a
        // third of the disc — big enough to move neighbours as a sheet.
        const f = field(q.x * 2.4, q.y * 2.4, t + q.ph * 0.12)

        q.vx += (tg[0] - q.x) * opts.pull + f[0]
        q.vy += (tg[1] - q.y) * opts.pull + f[1]
        q.vx *= opts.damp
        q.vy *= opts.damp

        q.px = q.x
        q.py = q.y
        q.x += q.vx
        q.y += q.vy

        const d = Math.hypot(q.x, q.y)
        if (d > 0.99) {
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

        if (!paint) continue

        // RADIAL FALLOFF — nothing draws the circle; density implies it.
        const rim = 1 - Math.max(0, Math.min(1, (d - 0.46) / 0.46))
        if (rim <= 0.01) continue

        const speed = Math.hypot(q.vx, q.vy)
        // Clamped: lineWidth scales with radius and vanishes below ~0.75px.
        const lw = Math.max(0.75, q.s * (R / 74) * (0.7 + 0.5 * rim) * q.sw * opts.weight)

        // Alpha from SPEED, never a per-particle timer — a timer is what made
        // earlier versions read as bacteria. Fast water is bright.
        ctx!.globalAlpha = Math.min(0.92, rim * rim * (0.26 + Math.min(0.66, speed * opts.glow)))

        const x0 = cx + q.px * R
        const y0 = cy + q.py * R
        const x1 = cx + q.x * R
        const y1 = cy + q.y * R

        if (Math.hypot(x1 - x0, y1 - y0) < 0.4) {
          // Degenerate segments stroke as nothing, even with round caps.
          // Small/slow instances hit this constantly — draw a dot instead.
          ctx!.fillStyle = color
          ctx!.beginPath()
          ctx!.arc(x1, y1, lw / 2, 0, Math.PI * 2)
          ctx!.fill()
        } else {
          ctx!.lineWidth = lw
          ctx!.beginPath()
          ctx!.moveTo(x0, y0)
          ctx!.lineTo(x1, y1)
          ctx!.stroke()
        }
      }
    }

    function drawStill() {
      build()
      if (!p) return
      // Settle into the wave unpainted, then run the real loop — wash included —
      // for long enough to reach the steady state the animation lives at. Keep
      // the wash: without it the streaks accumulate into a solid blot.
      for (let i = 0; i < 420; i++) step(i / 60, false, false)
      for (let i = 0; i < 20; i++) step(7 + i / 60, true, true)
    }

    function draw() {
      raf = requestAnimationFrame(draw)
      // Cheap offscreen gate: keeps the rAF chain alive but skips the work.
      const r = el!.getBoundingClientRect()
      if (r.bottom < -200 || r.top > (window.innerHeight || 800) + 200) return
      step(performance.now() / 1000, true, true)
    }

    if (still) {
      drawStill()
      const ro = new ResizeObserver(() => drawStill())
      ro.observe(el)
      return () => ro.disconnect()
    }

    build()
    draw()
    const ro = new ResizeObserver(build)
    ro.observe(el)
    return () => {
      cancelAnimationFrame(raf)
      ro.disconnect()
    }
  }, [preset, count, color])

  return (
    <canvas
      ref={ref}
      className={className}
      role={label ? 'img' : undefined}
      aria-label={label}
      aria-hidden={label ? undefined : true}
    />
  )
}
