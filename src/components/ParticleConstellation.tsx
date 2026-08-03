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

export default function ParticleConstellation() {
  const canvasRef = useRef<HTMLCanvasElement>(null)
  const animationRef = useRef<number>(0)
  const particlesRef = useRef<Particle[]>([])
  const mouseRef = useRef({ x: -9999, y: -9999 })
  const reducedMotion = useRef(false)

  const initParticles = useCallback((width: number, height: number) => {
    const count = getParticleCount(width)
    particlesRef.current = Array.from({ length: count }, () =>
      createParticle(width, height),
    )
  }, [])

  useEffect(() => {
    const canvas = canvasRef.current
    if (!canvas) return

    const ctx = canvas.getContext('2d')
    if (!ctx) return

    reducedMotion.current = window.matchMedia(
      '(prefers-reduced-motion: reduce)',
    ).matches

    const parent = canvas.parentElement
    if (!parent) return

    function resize() {
      const rect = parent!.getBoundingClientRect()
      const dpr = window.devicePixelRatio || 1
      canvas!.width = rect.width * dpr
      canvas!.height = rect.height * dpr
      canvas!.style.width = `${rect.width}px`
      canvas!.style.height = `${rect.height}px`
      ctx!.setTransform(dpr, 0, 0, dpr, 0, 0)
      initParticles(rect.width, rect.height)
    }

    resize()

    const ro = new ResizeObserver(resize)
    ro.observe(parent)

    function handleMouseMove(e: MouseEvent) {
      const rect = canvas!.getBoundingClientRect()
      mouseRef.current = { x: e.clientX - rect.left, y: e.clientY - rect.top }
    }

    function handleMouseLeave() {
      mouseRef.current = { x: -9999, y: -9999 }
    }

    canvas.addEventListener('mousemove', handleMouseMove)
    canvas.addEventListener('mouseleave', handleMouseLeave)

    if (reducedMotion.current) {
      // Static render: draw dots once with no animation
      const particles = particlesRef.current
      const rect = parent.getBoundingClientRect()
      ctx.clearRect(0, 0, rect.width, rect.height)
      for (const p of particles) {
        ctx.beginPath()
        ctx.arc(p.x, p.y, p.radius, 0, Math.PI * 2)
        ctx.fillStyle = `rgba(${PARTICLE_COLOR}, ${p.opacity})`
        ctx.fill()
      }
      return () => {
        ro.disconnect()
        canvas.removeEventListener('mousemove', handleMouseMove)
        canvas.removeEventListener('mouseleave', handleMouseLeave)
      }
    }

    function animate() {
      const rect = parent!.getBoundingClientRect()
      const w = rect.width
      const h = rect.height
      const particles = particlesRef.current
      const mouse = mouseRef.current

      ctx!.clearRect(0, 0, w, h)

      // Update positions
      for (const p of particles) {
        // Mouse repulsion
        const dx = p.x - mouse.x
        const dy = p.y - mouse.y
        const dist = Math.sqrt(dx * dx + dy * dy)
        if (dist < MOUSE_RADIUS && dist > 0) {
          const force = (1 - dist / MOUSE_RADIUS) * MOUSE_FORCE
          p.vx += (dx / dist) * force
          p.vy += (dy / dist) * force
        }

        // Dampen velocity back toward base speed
        const speed = Math.sqrt(p.vx * p.vx + p.vy * p.vy)
        if (speed > BASE_SPEED) {
          p.vx *= 0.98
          p.vy *= 0.98
        }

        p.x += p.vx
        p.y += p.vy

        // Wrap around edges
        if (p.x < -10) p.x = w + 10
        if (p.x > w + 10) p.x = -10
        if (p.y < -10) p.y = h + 10
        if (p.y > h + 10) p.y = -10
      }

      // Draw connections
      for (let i = 0; i < particles.length; i++) {
        for (let j = i + 1; j < particles.length; j++) {
          const dx = particles[i].x - particles[j].x
          const dy = particles[i].y - particles[j].y
          const dist = Math.sqrt(dx * dx + dy * dy)
          if (dist < CONNECTION_DISTANCE) {
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
      ro.disconnect()
      canvas.removeEventListener('mousemove', handleMouseMove)
      canvas.removeEventListener('mouseleave', handleMouseLeave)
    }
  }, [initParticles])

  return (
    <canvas
      ref={canvasRef}
      className="absolute inset-0 z-0"
      aria-hidden="true"
    />
  )
}
