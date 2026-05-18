import { useEffect, useRef } from 'react'

// Three.js loads at runtime from the Cloudflare CDN. Typed as `any`
// because the global it adds doesn't ship its own type declarations
// and pulling the npm package + tree-shaking just for a single
// shader pass isn't worth the build cost.
declare global {
  interface Window {
    THREE?: any
  }
}

const THREE_SRC = 'https://cdnjs.cloudflare.com/ajax/libs/three.js/89/three.min.js'

interface InteractiveShaderProps {
  /** Per-frame increment applied to the shader's `time` uniform. */
  timeStep?: number
}

// Animated WebGL rings shader, rendered via Three.js. A fullscreen
// `PlaneBufferGeometry` is shaded with a fragment program that draws
// expanding mosaic-quantised rings tinted with three slightly offset
// colour channels. The library is fetched once from a CDN per
// page-load so the bundle stays small. The component is resilient to
// fast mount/unmount cycles (e.g. during HMR / route changes) — the
// cleanup function is a no-op if the script never finished loading.
export function InteractiveShader({ timeStep = 0.05 }: InteractiveShaderProps) {
  const containerRef = useRef<HTMLDivElement | null>(null)
  const stateRef = useRef<{
    renderer: any | null
    animationId: number | null
    onResize: (() => void) | null
    mounted: boolean
  }>({
    renderer: null,
    animationId: null,
    onResize: null,
    mounted: true,
  })

  useEffect(() => {
    stateRef.current.mounted = true

    function init() {
      const container = containerRef.current
      const THREE = window.THREE
      if (!container || !THREE || !stateRef.current.mounted) return

      // Clear any prior content (HMR / re-init safety).
      container.innerHTML = ''

      const camera = new THREE.Camera()
      camera.position.z = 1

      const scene = new THREE.Scene()
      const geometry = new THREE.PlaneBufferGeometry(2, 2)

      const uniforms = {
        time: { type: 'f', value: 1.0 },
        resolution: { type: 'v2', value: new THREE.Vector2() },
      }

      const vertexShader = `
        void main() {
          gl_Position = vec4(position, 1.0);
        }
      `

      // Soft pastel-drift shader. Three slow rolling sin/cos waves each
      // mix a different muted tint into the page background colour
      // (#f8fafc, matched in the base) so the hero reads as the same
      // surface as the rest of the site — just gently moving. The
      // motion is intentionally low-frequency (multipliers under 2.0
      // on uv, time scaled to ~0.03/sec) so the result feels like a
      // breathing colour wash rather than an attention-grabbing
      // animation. Paired with the 28px CSS blur it lands as ambient.
      const fragmentShader = `
        precision highp float;
        uniform vec2 resolution;
        uniform float time;

        void main(void) {
          // Aspect-correct uv so motion doesn't squish horizontally
          // on wide viewports.
          vec2 uv = gl_FragCoord.xy / resolution.xy;
          vec2 p = uv * vec2(resolution.x / resolution.y, 1.0);
          float t = time * 0.03;

          float a = sin(p.x * 1.7 + t * 0.9) * cos(p.y * 1.4 - t * 0.6);
          float b = sin((p.x + p.y) * 1.2 + t * 0.7) * sin(p.y * 1.8 - t * 0.4);
          float c = cos(p.x * 1.1 - t * 0.5) * sin(p.y * 0.9 + t * 0.8);

          vec3 baseColor = vec3(0.972, 0.980, 0.988); // matches body bg #f8fafc
          vec3 blueTint    = vec3(0.09, 0.41, 0.88);  // accent #1769e0
          vec3 lavenderTint = vec3(0.70, 0.62, 0.92);
          vec3 peachTint    = vec3(0.97, 0.84, 0.74);

          vec3 color = baseColor;
          color = mix(color, blueTint,     smoothstep(-0.2, 1.0, a) * 0.12);
          color = mix(color, lavenderTint, smoothstep(-0.2, 1.0, b) * 0.09);
          color = mix(color, peachTint,    smoothstep(-0.2, 1.0, c) * 0.07);

          gl_FragColor = vec4(color, 1.0);
        }
      `

      const material = new THREE.ShaderMaterial({
        uniforms,
        vertexShader,
        fragmentShader,
      })

      const mesh = new THREE.Mesh(geometry, material)
      scene.add(mesh)

      const renderer = new THREE.WebGLRenderer({ antialias: true })
      renderer.setPixelRatio(Math.min(window.devicePixelRatio || 1, 2))
      container.appendChild(renderer.domElement)
      stateRef.current.renderer = renderer

      function onResize() {
        if (!container) return
        const rect = container.getBoundingClientRect()
        renderer.setSize(rect.width, rect.height)
        uniforms.resolution.value.x = renderer.domElement.width
        uniforms.resolution.value.y = renderer.domElement.height
      }
      onResize()
      window.addEventListener('resize', onResize, false)
      stateRef.current.onResize = onResize

      function animate() {
        if (!stateRef.current.mounted) return
        stateRef.current.animationId = requestAnimationFrame(animate)
        uniforms.time.value += timeStep
        renderer.render(scene, camera)
      }
      animate()
    }

    // Reuse THREE if a prior mount already fetched it.
    if (window.THREE) {
      init()
    }
    else {
      const existing = document.querySelector<HTMLScriptElement>(`script[src="${THREE_SRC}"]`)
      if (existing) {
        // Another instance is loading the same script; wait for it.
        existing.addEventListener('load', init)
      }
      else {
        const script = document.createElement('script')
        script.src = THREE_SRC
        script.async = true
        script.onload = init
        document.head.appendChild(script)
      }
    }

    return () => {
      stateRef.current.mounted = false
      if (stateRef.current.animationId !== null) {
        cancelAnimationFrame(stateRef.current.animationId)
      }
      if (stateRef.current.onResize) {
        window.removeEventListener('resize', stateRef.current.onResize)
      }
      if (stateRef.current.renderer) {
        try { stateRef.current.renderer.dispose() }
        catch { /* renderer may already be torn down */ }
      }
      // Intentionally keep the script in <head> — re-mounts (HMR,
      // route changes) get a fast cache hit and skip the download.
    }
  }, [timeStep])

  return (
    <div
      ref={containerRef}
      className="shader-canvas"
      aria-hidden
    />
  )
}
