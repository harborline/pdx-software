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

      const fragmentShader = `
        #define TWO_PI 6.2831853072
        #define PI 3.14159265359

        precision highp float;
        uniform vec2 resolution;
        uniform float time;

        float random(in float x) {
          return fract(sin(x) * 1e4);
        }
        float random(vec2 st) {
          return fract(sin(dot(st.xy, vec2(12.9898, 78.233))) * 43758.5453123);
        }

        varying vec2 vUv;

        void main(void) {
          vec2 uv = (gl_FragCoord.xy * 2.0 - resolution.xy) / min(resolution.x, resolution.y);

          vec2 fMosaicScal = vec2(4.0, 2.0);
          vec2 vScreenSize = vec2(256.0, 256.0);
          uv.x = floor(uv.x * vScreenSize.x / fMosaicScal.x) / (vScreenSize.x / fMosaicScal.x);
          uv.y = floor(uv.y * vScreenSize.y / fMosaicScal.y) / (vScreenSize.y / fMosaicScal.y);

          float t = time * 0.06 + random(uv.x) * 0.4;
          float lineWidth = 0.0008;

          vec3 color = vec3(0.0);
          for (int j = 0; j < 3; j++) {
            for (int i = 0; i < 5; i++) {
              color[j] += lineWidth * float(i * i) /
                abs(fract(t - 0.01 * float(j) + float(i) * 0.01) * 1.0 - length(uv));
            }
          }

          gl_FragColor = vec4(color[2], color[1], color[0], 1.0);
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
