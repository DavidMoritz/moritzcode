import { useRef, useEffect, useCallback, useState } from 'react'

interface Particle {
  x: number
  y: number
  vx: number
  vy: number
  radius: number
  opacity: number
}

interface SnakeState {
  path: { x: number; y: number }[]
  dir: number
  score: number
  alive: boolean
  respawnTimer: number
  targetLength: number
}

const PARTICLE_COLOR = '96, 165, 250' // blue-400 rgb
const CONNECTION_DISTANCE = 120
const MOUSE_RADIUS = 150
const MOUSE_FORCE = 0.8
const BASE_SPEED = 0.3
const MOBILE_BREAKPOINT = 640

// Snake
const SNAKE_START_SPEED = 0.5
const SNAKE_MAX_SPEED = 3
const SNAKE_SPEED_RAMP = 30 // score at which max speed is reached
const SNAKE_BASE_LENGTH = 30
const SNAKE_GROWTH = 8
const SNAKE_ABSORB_RADIUS = 15
const SNAKE_COLLISION_RADIUS = 5
const SNAKE_COLLISION_SKIP = 25
const SNAKE_RESPAWN_DELAY = 180
const SNAKE_HEAD_OPACITY = 0.85
const SNAKE_LINE_WIDTH = 2
const DIR_X = [1, 0, -1, 0] // right, down, left, up
const DIR_Y = [0, 1, 0, -1]

// CSS fallback
const FALLBACK_DOT_COUNT = 20

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

function snakeSpeed(score: number): number {
  const t = Math.min(score / SNAKE_SPEED_RAMP, 1)
  return SNAKE_START_SPEED + t * (SNAKE_MAX_SPEED - SNAKE_START_SPEED)
}

function createSnake(w: number, h: number): SnakeState {
  const x = w * 0.25 + Math.random() * w * 0.5
  const y = h * 0.25 + Math.random() * h * 0.5
  const dir = Math.floor(Math.random() * 4)
  const path: { x: number; y: number }[] = []
  for (let i = 0; i < SNAKE_BASE_LENGTH; i++) {
    path.push({
      x: ((x - DIR_X[dir] * i * SNAKE_START_SPEED) % w + w) % w,
      y: ((y - DIR_Y[dir] * i * SNAKE_START_SPEED) % h + h) % h,
    })
  }
  return { path, dir, score: 0, alive: true, respawnTimer: 0, targetLength: SNAKE_BASE_LENGTH }
}

function FallbackDots() {
  const [dots] = useState(() =>
    Array.from({ length: FALLBACK_DOT_COUNT }, (_, i) => ({
      left: `${Math.random() * 100}%`,
      top: `${Math.random() * 100}%`,
      size: 1 + Math.random() * 2,
      opacity: 0.15 + Math.random() * 0.35,
      duration: 8 + Math.random() * 12,
      delay: -(Math.random() * 20),
      driftX: -20 + Math.random() * 40,
      driftY: -20 + Math.random() * 40,
      key: i,
    })),
  )

  return (
    <div className="fixed inset-0 z-0 overflow-hidden" aria-hidden="true">
      {dots.map((d) => (
        <div
          key={d.key}
          className="absolute rounded-full"
          style={{
            left: d.left,
            top: d.top,
            width: d.size,
            height: d.size,
            backgroundColor: `rgba(${PARTICLE_COLOR}, ${d.opacity})`,
            animation: `fallback-drift ${d.duration}s ease-in-out ${d.delay}s infinite`,
            '--drift-x': `${d.driftX}px`,
            '--drift-y': `${d.driftY}px`,
          } as React.CSSProperties}
        />
      ))}
      <style>{`
        @keyframes fallback-drift {
          0%, 100% { transform: translate(0, 0); }
          50% { transform: translate(var(--drift-x), var(--drift-y)); }
        }
      `}</style>
    </div>
  )
}

export default function ParticleConstellation() {
  const canvasRef = useRef<HTMLCanvasElement>(null)
  const herdCounterRef = useRef<HTMLSpanElement>(null)
  const snakeCounterRef = useRef<HTMLSpanElement>(null)
  const snakeBestLabelRef = useRef<HTMLSpanElement>(null)
  const animationRef = useRef<number>(0)
  const particlesRef = useRef<Particle[]>([])
  const mouseRef = useRef({ x: -9999, y: -9999 })
  const reducedMotion = useRef(false)
  const highScoreRef = useRef(0)
  const snakeBestRef = useRef(0)
  const snakeHasDiedRef = useRef(false)
  const snakeActiveRef = useRef(false)
  const snakeContainerRef = useRef<HTMLDivElement>(null)
  const isMobileRef = useRef(false)
  const lastWidthRef = useRef(0)
  const snakeRef = useRef<SnakeState>(
    { path: [], dir: 0, score: 0, alive: false, respawnTimer: 0, targetLength: SNAKE_BASE_LENGTH },
  )
  const [canvasOk, setCanvasOk] = useState(true)

  const initParticles = useCallback((width: number, height: number) => {
    const count = getParticleCount(width)
    particlesRef.current = Array.from({ length: count }, () =>
      createParticle(width, height),
    )
    highScoreRef.current = 0
    snakeBestRef.current = 0
    snakeHasDiedRef.current = false
    snakeActiveRef.current = false
    isMobileRef.current = width < MOBILE_BREAKPOINT
    if (isMobileRef.current) {
      snakeRef.current = createSnake(width, height)
    }
  }, [])

  useEffect(() => {
    const canvas = canvasRef.current
    if (!canvas) return

    const ctx = canvas.getContext('2d')
    if (!ctx) {
      setCanvasOk(false)
      return
    }

    const herdCounter = herdCounterRef.current
    const snakeCounter = snakeCounterRef.current
    if (!herdCounter || !snakeCounter) return

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
      // Only reinitialize when width changes (skip mobile address bar show/hide)
      if (w !== lastWidthRef.current) {
        lastWidthRef.current = w
        initParticles(w, h)
      }
    }

    resize()
    window.addEventListener('resize', resize)

    function handleMouseMove(e: MouseEvent) {
      mouseRef.current = { x: e.clientX, y: e.clientY }
    }

    function handleMouseLeave() {
      mouseRef.current = { x: -9999, y: -9999 }
    }

    function handleTap(e: MouseEvent) {
      if (!isMobileRef.current) return
      const target = e.target as HTMLElement
      if (target.closest('input, textarea, select')) return
      const snake = snakeRef.current
      if (snake.alive) {
        snake.dir = (snake.dir + 1) % 4
        snakeActiveRef.current = true
      }
    }

    window.addEventListener('mousemove', handleMouseMove)
    document.addEventListener('mouseleave', handleMouseLeave)
    window.addEventListener('click', handleTap)

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
        window.removeEventListener('click', handleTap)
      }
    }

    function animate() {
      const w = window.innerWidth
      const h = window.innerHeight
      const particles = particlesRef.current
      const mouse = mouseRef.current
      const isMobile = isMobileRef.current

      ctx!.clearRect(0, 0, w, h)

      // --- Update particles ---
      for (const p of particles) {
        if (!isMobile) {
          const dx = p.x - mouse.x
          const dy = p.y - mouse.y
          const dist = Math.sqrt(dx * dx + dy * dy)
          if (dist < MOUSE_RADIUS && dist > 0) {
            const force = (1 - dist / MOUSE_RADIUS) * MOUSE_FORCE
            p.vx += (dx / dist) * force
            p.vy += (dy / dist) * force
          }
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

      // --- Update snake (mobile only) ---
      if (isMobile) {
        const snake = snakeRef.current
        if (snake.alive) {
          const head = snake.path[0]
          const speed = snakeSpeed(snake.score)
          const newHead = {
            x: ((head.x + DIR_X[snake.dir] * speed) % w + w) % w,
            y: ((head.y + DIR_Y[snake.dir] * speed) % h + h) % h,
          }
          snake.path.unshift(newHead)
          while (snake.path.length > snake.targetLength) {
            snake.path.pop()
          }

          // Absorb nearby particles
          for (let i = particles.length - 1; i >= 0; i--) {
            const dx = particles[i].x - newHead.x
            const dy = particles[i].y - newHead.y
            const dist = Math.sqrt(dx * dx + dy * dy)
            if (dist < SNAKE_ABSORB_RADIUS) {
              particles.splice(i, 1)
              snake.score++
              snake.targetLength += SNAKE_GROWTH
              // After 30 consumed, replenish so there are always ~5 to chase
              if (snake.score >= 30) {
                particles.push(createParticle(w, h))
              }
              break
            }
          }

          // Self-collision
          for (let i = SNAKE_COLLISION_SKIP; i < snake.path.length; i++) {
            const dx = snake.path[i].x - newHead.x
            const dy = snake.path[i].y - newHead.y
            const dist = Math.sqrt(dx * dx + dy * dy)
            if (dist < SNAKE_COLLISION_RADIUS) {
              // Burst body into particles
              const burstCount = snake.score
              if (burstCount > 0) {
                const step = Math.max(1, Math.floor(snake.path.length / burstCount))
                for (let b = 0; b < burstCount; b++) {
                  const idx = Math.min(b * step, snake.path.length - 1)
                  const pos = snake.path[idx]
                  const angle = Math.random() * Math.PI * 2
                  const burstSpeed = 1 + Math.random() * 2
                  particles.push({
                    x: pos.x,
                    y: pos.y,
                    vx: Math.cos(angle) * burstSpeed,
                    vy: Math.sin(angle) * burstSpeed,
                    radius: 0.5 + Math.random() * 0.5,
                    opacity: 0.5 + Math.random() * 0.3,
                  })
                }
              }
              snake.alive = false
              snake.respawnTimer = SNAKE_RESPAWN_DELAY
              if (snake.score > snakeBestRef.current) {
                snakeBestRef.current = snake.score
              }
              snakeHasDiedRef.current = true
              break
            }
          }
        } else {
          snake.respawnTimer--
          if (snake.respawnTimer <= 0) {
            snakeRef.current = createSnake(w, h)
          }
        }
      }

      // --- Draw connections ---
      const n = particles.length
      const parent = Array.from({ length: n }, (_, i) => i)
      const size = new Array<number>(n).fill(1)

      for (let i = 0; i < n; i++) {
        for (let j = i + 1; j < n; j++) {
          const dx = particles[i].x - particles[j].x
          const dy = particles[i].y - particles[j].y
          const dist = Math.sqrt(dx * dx + dy * dy)
          if (dist < CONNECTION_DISTANCE) {
            if (!isMobile) union(parent, size, i, j)
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

      // Herd scoring (desktop only)
      if (!isMobile) {
        let largest = 0
        for (let i = 0; i < n; i++) {
          if (size[i] > largest) largest = size[i]
        }
        if (largest > highScoreRef.current) {
          highScoreRef.current = largest
        }
        herdCounter!.textContent = `${largest} | ${highScoreRef.current}`
      }

      // --- Draw particles ---
      for (const p of particles) {
        ctx!.beginPath()
        ctx!.arc(p.x, p.y, p.radius, 0, Math.PI * 2)
        ctx!.fillStyle = `rgba(${PARTICLE_COLOR}, ${p.opacity})`
        ctx!.fill()
      }

      // --- Draw snake (mobile only) ---
      if (isMobile) {
        const curSnake = snakeRef.current
        if (curSnake.alive && curSnake.path.length > 1) {
          const path = curSnake.path
          const segments = 8
          const chunkSize = Math.ceil(path.length / segments)

          for (let s = 0; s < segments; s++) {
            const start = s * chunkSize
            const end = Math.min((s + 1) * chunkSize + 1, path.length)
            if (start >= path.length) break

            const t = 1 - (s + 0.5) / segments
            const alpha = 0.15 + t * (SNAKE_HEAD_OPACITY - 0.15)

            ctx!.beginPath()
            ctx!.moveTo(path[start].x, path[start].y)
            for (let i = start + 1; i < end; i++) {
              const jumpX = Math.abs(path[i].x - path[i - 1].x)
              const jumpY = Math.abs(path[i].y - path[i - 1].y)
              if (jumpX > w / 2 || jumpY > h / 2) {
                ctx!.moveTo(path[i].x, path[i].y)
              } else {
                ctx!.lineTo(path[i].x, path[i].y)
              }
            }
            ctx!.strokeStyle = `rgba(${PARTICLE_COLOR}, ${alpha})`
            ctx!.lineWidth = SNAKE_LINE_WIDTH
            ctx!.stroke()
          }

          // Head dot
          ctx!.beginPath()
          ctx!.arc(path[0].x, path[0].y, 3, 0, Math.PI * 2)
          ctx!.fillStyle = `rgba(${PARTICLE_COLOR}, ${SNAKE_HEAD_OPACITY})`
          ctx!.fill()
        }

        if (snakeRef.current.score >= 2) snakeActiveRef.current = true
        const isActive = snakeActiveRef.current
        const container = snakeContainerRef.current
        if (container) {
          container.style.display = isActive ? '' : 'none'
        }
        if (isActive) {
          const hasDied = snakeHasDiedRef.current
          snakeCounter!.textContent = hasDied
            ? `${snakeRef.current.score} | ${snakeBestRef.current}`
            : `${snakeRef.current.score}`
          const bestLabel = snakeBestLabelRef.current
          if (bestLabel) {
            bestLabel.className = hasDied
              ? 'text-white/40'
              : 'hidden text-white/40'
          }
        }
      }

      animationRef.current = requestAnimationFrame(animate)
    }

    animationRef.current = requestAnimationFrame(animate)

    return () => {
      cancelAnimationFrame(animationRef.current)
      window.removeEventListener('resize', resize)
      window.removeEventListener('mousemove', handleMouseMove)
      document.removeEventListener('mouseleave', handleMouseLeave)
      window.removeEventListener('click', handleTap)
    }
  }, [initParticles])

  if (!canvasOk) return <FallbackDots />

  return (
    <>
      <canvas
        ref={canvasRef}
        className="fixed inset-0 z-0"
        aria-hidden="true"
      />
      {/* Snake counter — mobile only */}
      <div ref={snakeContainerRef} style={{ display: 'none' }} className="fixed bottom-4 right-4 z-20 select-none rounded bg-white/5 px-3 py-1.5 font-mono text-xs text-white/70 backdrop-blur sm:hidden">
        <span className="text-white/40">snake </span>
        <span ref={snakeCounterRef}>0</span>
        <span ref={snakeBestLabelRef} className="hidden text-white/40"> best</span>
      </div>
      {/* Herd counter — desktop only */}
      <div className="fixed bottom-4 right-4 z-20 hidden select-none rounded bg-white/5 px-3 py-1.5 font-mono text-sm text-white/70 backdrop-blur sm:block">
        <span className="text-white/40">largest herd </span>
        <span ref={herdCounterRef}>0 | 0</span>
        <span className="text-white/40"> best</span>
      </div>
    </>
  )
}
