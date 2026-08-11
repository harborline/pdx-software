import { useEffect, useRef } from 'react'
import {
  type Particle,
  type Preset,
  PRESETS,
  advance,
  particleAlpha,
  rimFalloff,
  seedParticles,
  seedTargets,
} from '../lib/mark'

/**
 * Harborline's identity mark: a particle field carried by a flow, pulled toward
 * a wave-shaped target, held inside an implied circle. The engine lives in
 * `lib/mark.ts`; this file is the canvas surface and the React plumbing.
 */

export interface FluidMarkProps {
  preset?: Preset
  /** Particle count override. Density reads more than the number — drop it as the mark gets smaller. */
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

      targets = seedTargets(n)
      if (!p) p = seedParticles(n)
    }

    /** One frame. `paint` false advances the physics without drawing. */
    function step(t: number, paint: boolean) {
      if (!p || R === 0) return
      const cx = w / 2
      const cy = h / 2

      if (paint) {
        // TRAIL WASH — never clearRect. Punching alpha out of the previous
        // frame is what makes this read as fluid rather than as a dot swarm.
        ctx!.globalCompositeOperation = 'destination-out'
        ctx!.globalAlpha = R < 70 ? opts.wash * 0.5 : opts.wash // small canvases wash gentler
        ctx!.fillStyle = '#000'
        ctx!.fillRect(0, 0, w, h)
        ctx!.globalCompositeOperation = 'source-over'

        ctx!.strokeStyle = color
        ctx!.lineCap = 'round'
      }

      for (let i = 0; i < n; i++) {
        const q = p[i]
        advance(q, targets[i], opts, t)
        if (!paint) continue

        const rim = rimFalloff(q.x, q.y)
        if (rim <= 0.01) continue

        const speed = Math.hypot(q.vx, q.vy)
        // Clamped: lineWidth scales with radius and would vanish at icon sizes.
        const lw = Math.max(0.75, q.s * (R / 74) * (0.7 + 0.5 * rim) * q.sw * opts.weight)
        ctx!.globalAlpha = particleAlpha(rim, speed, opts.glow)

        const x0 = cx + q.px * R
        const y0 = cy + q.py * R
        const x1 = cx + q.x * R
        const y1 = cy + q.y * R

        if (Math.hypot(x1 - x0, y1 - y0) < 0.4) {
          // Degenerate segments stroke as nothing, even with round caps. Small
          // and slow instances hit this constantly — draw a dot instead.
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
      // Settle into the wave unpainted, then run the real loop long enough to
      // reach the steady state the animation lives at. A frozen frame is a
      // legitimate form of the mark — it is also the print lockup.
      for (let i = 0; i < 420; i++) step(i / 60, false)
      for (let i = 0; i < 20; i++) step(7 + i / 60, true)
    }

    function draw() {
      raf = requestAnimationFrame(draw)
      // Cheap offscreen gate: keeps the rAF chain alive but skips the work.
      const r = el!.getBoundingClientRect()
      if (r.bottom < -200 || r.top > (window.innerHeight || 800) + 200) return
      step(performance.now() / 1000, true)
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
