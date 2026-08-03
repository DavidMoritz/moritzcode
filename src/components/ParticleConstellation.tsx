import { useRef, useEffect, useCallback } from 'react'

interface Particle {
  x: number
  y: number
  vx: number
  vy: number
  radius: number
  opacity: number
}

const PARTICLE_COLOR = '96, 165, 250' // blue-400 rgb
const CONNECTION_DISTANCE = 120
const MOUSE_RADIUS = 150
const MOUSE_FORCE = 0.8
const BASE_SPEED = 0.3

function createParticle(width: number, height: number): Particle {
  const angle = Math.random() * Math.PI * 2
  return {
    x: Math.random() * width,
    y: Math.random() * height,
    vx: Math.cos(angle) * BASE_SPEED,
    vy: Math.sin(angle) * BASE_SPEED,
    radius: 1 + Math.random(),
    opacity: 0.3 + Math.random() * 0.5,
  }
}

function getParticleCount(width: number): number {
  if (width < 640) return 35
  if (width < 1024) return 55
  return 75
}

// Union-Find for connected components
function findRoot(parent: number[], i: number): number {
  while (parent[i] !== i) {
    parent[i] = parent[parent[i]]
    i = parent[i]
  }
  return i
}

function union(parent: number[], size: number[], a: number, b: number) {
  const ra = findRoot(parent, a)
  const rb = findRoot(parent, b)
  if (ra === rb) return
  if (size[ra] < size[rb]) {
    parent[ra] = rb
    size[rb] += size[ra]
  } else {
    parent[rb] = ra
    size[ra] += size[rb]
  }
}

export default function ParticleConstellation() {
  const canvasRef = useRef<HTMLCanvasElement>(null)
  const counterRef = useRef<HTMLDivElement>(null)
  const animationRef = useRef<number>(0)
  const particlesRef = useRef<Particle[]>([])
  const mouseRef = useRef({ x: -9999, y: -9999 })
  const reducedMotion = useRef(false)
  const highScoreRef = useRef(0)

  const initParticles = useCallback((width: number, height: number) => {
    const count = getParticleCount(width)
    particlesRef.current = Array.from({ length: count }, () =>
      createParticle(width, height),
    )
    highScoreRef.current = 0
  }, [])

  useEffect(() => {
    const canvas = canvasRef.current
    const counter = counterRef.current
    if (!canvas || !counter) return

    const ctx = canvas.getContext('2d')
    if (!ctx) return

    reducedMotion.current = window.matchMedia(
      '(prefers-reduced-motion: reduce)',
    ).matches

    function resize() {
      const w = window.innerWidth
      const h = window.innerHeight
      const dpr = window.devicePixelRatio || 1
      canvas!.width = w * dpr
      canvas!.height = h * dpr
      canvas!.style.width = `${w}px`
      canvas!.style.height = `${h}px`
      ctx!.setTransform(dpr, 0, 0, dpr, 0, 0)
      initParticles(w, h)
    }

    resize()
    window.addEventListener('resize', resize)

    function handleMouseMove(e: MouseEvent) {
      mouseRef.current = { x: e.clientX, y: e.clientY }
    }

    function handleMouseLeave() {
      mouseRef.current = { x: -9999, y: -9999 }
    }

    window.addEventListener('mousemove', handleMouseMove)
    document.addEventListener('mouseleave', handleMouseLeave)

    if (reducedMotion.current) {
      const particles = particlesRef.current
      ctx.clearRect(0, 0, window.innerWidth, window.innerHeight)
      for (const p of particles) {
        ctx.beginPath()
        ctx.arc(p.x, p.y, p.radius, 0, Math.PI * 2)
        ctx.fillStyle = `rgba(${PARTICLE_COLOR}, ${p.opacity})`
        ctx.fill()
      }
      return () => {
        window.removeEventListener('resize', resize)
        window.removeEventListener('mousemove', handleMouseMove)
        document.removeEventListener('mouseleave', handleMouseLeave)
      }
    }

    function animate() {
      const w = window.innerWidth
      const h = window.innerHeight
      const particles = particlesRef.current
      const n = particles.length
      const mouse = mouseRef.current

      ctx!.clearRect(0, 0, w, h)

      // Update positions
      for (const p of particles) {
        const dx = p.x - mouse.x
        const dy = p.y - mouse.y
        const dist = Math.sqrt(dx * dx + dy * dy)
        if (dist < MOUSE_RADIUS && dist > 0) {
          const force = (1 - dist / MOUSE_RADIUS) * MOUSE_FORCE
          p.vx += (dx / dist) * force
          p.vy += (dy / dist) * force
        }

        const speed = Math.sqrt(p.vx * p.vx + p.vy * p.vy)
        if (speed > BASE_SPEED) {
          p.vx *= 0.98
          p.vy *= 0.98
        }

        p.x += p.vx
        p.y += p.vy

        if (p.x < -10) p.x = w + 10
        if (p.x > w + 10) p.x = -10
        if (p.y < -10) p.y = h + 10
        if (p.y > h + 10) p.y = -10
      }

      // Union-Find for connected components
      const parent = Array.from({ length: n }, (_, i) => i)
      const size = new Array<number>(n).fill(1)

      // Draw connections + build union-find
      for (let i = 0; i < n; i++) {
        for (let j = i + 1; j < n; j++) {
          const dx = particles[i].x - particles[j].x
          const dy = particles[i].y - particles[j].y
          const dist = Math.sqrt(dx * dx + dy * dy)
          if (dist < CONNECTION_DISTANCE) {
            union(parent, size, i, j)
            const alpha = (1 - dist / CONNECTION_DISTANCE) * 0.15
            ctx!.beginPath()
            ctx!.moveTo(particles[i].x, particles[i].y)
            ctx!.lineTo(particles[j].x, particles[j].y)
            ctx!.strokeStyle = `rgba(${PARTICLE_COLOR}, ${alpha})`
            ctx!.lineWidth = 0.5
            ctx!.stroke()
          }
        }
      }

      // Find largest group
      let largest = 0
      for (let i = 0; i < n; i++) {
        if (size[i] > largest) largest = size[i]
      }
      if (largest > highScoreRef.current) {
        highScoreRef.current = largest
      }

      // Update counter DOM directly (no React re-render)
      counter!.textContent = `${largest} / ${highScoreRef.current}`

      // Draw particles
      for (const p of particles) {
        ctx!.beginPath()
        ctx!.arc(p.x, p.y, p.radius, 0, Math.PI * 2)
        ctx!.fillStyle = `rgba(${PARTICLE_COLOR}, ${p.opacity})`
        ctx!.fill()
      }

      animationRef.current = requestAnimationFrame(animate)
    }

    animationRef.current = requestAnimationFrame(animate)

    return () => {
      cancelAnimationFrame(animationRef.current)
      window.removeEventListener('resize', resize)
      window.removeEventListener('mousemove', handleMouseMove)
      document.removeEventListener('mouseleave', handleMouseLeave)
    }
  }, [initParticles])

  return (
    <>
      <canvas
        ref={canvasRef}
        className="fixed inset-0 z-0"
        aria-hidden="true"
      />
      <div className="fixed bottom-4 right-4 z-20 select-none rounded bg-white/5 px-3 py-1.5 font-mono text-sm text-white/70 backdrop-blur">
        <span className="text-white/40">herd </span>
        <span ref={counterRef}>0 / 0</span>
        <span className="text-white/40"> best</span>
      </div>
    </>
  )
}
