import { useRef, useEffect } from 'react'

const SPRING_K = 0.025
const DAMPING = 0.93
const DRIFT_FORCE = 0.015
const MOUSE_RADIUS = 150
const MOUSE_FORCE = 0.35

interface LetterPhysics {
  ox: number
  oy: number
  vx: number
  vy: number
}

export default function FloatingText({
  text,
  className,
}: {
  text: string
  className?: string
}) {
  const containerRef = useRef<HTMLDivElement>(null)
  const letterRefs = useRef<(HTMLSpanElement | null)[]>([])
  const physicsRef = useRef<LetterPhysics[]>([])
  const mouseRef = useRef({ x: -9999, y: -9999 })
  const animationRef = useRef<number>(0)

  useEffect(() => {
    const container = containerRef.current
    if (!container) return

    const reducedMotion = window.matchMedia(
      '(prefers-reduced-motion: reduce)',
    ).matches
    if (reducedMotion) return

    // Initialize physics for every character slot (spaces will be skipped)
    physicsRef.current = text.split('').map(() => ({
      ox: 0,
      oy: 0,
      vx: 0,
      vy: 0,
    }))

    const section = container.closest('section')

    function handleMouseMove(e: MouseEvent) {
      if (!section) return
      const rect = section.getBoundingClientRect()
      mouseRef.current = {
        x: e.clientX - rect.left,
        y: e.clientY - rect.top,
      }
    }

    function handleMouseLeave() {
      mouseRef.current = { x: -9999, y: -9999 }
    }

    if (section) {
      section.addEventListener('mousemove', handleMouseMove)
      section.addEventListener('mouseleave', handleMouseLeave)
    }

    function animate() {
      if (!section) return
      const sectionRect = section.getBoundingClientRect()
      const mouse = mouseRef.current
      const physics = physicsRef.current

      letterRefs.current.forEach((el, i) => {
        if (!el) return
        const p = physics[i]

        // Small random drift
        p.vx += (Math.random() - 0.5) * DRIFT_FORCE
        p.vy += (Math.random() - 0.5) * DRIFT_FORCE

        // Spring back to home position
        p.vx -= SPRING_K * p.ox
        p.vy -= SPRING_K * p.oy

        // Mouse repulsion (letter center in section coords)
        const rect = el.getBoundingClientRect()
        const cx = rect.left - sectionRect.left + rect.width / 2
        const cy = rect.top - sectionRect.top + rect.height / 2

        const dx = cx - mouse.x
        const dy = cy - mouse.y
        const dist = Math.sqrt(dx * dx + dy * dy)

        if (dist < MOUSE_RADIUS && dist > 0) {
          const force = (1 - dist / MOUSE_RADIUS) * MOUSE_FORCE
          p.vx += (dx / dist) * force
          p.vy += (dy / dist) * force
        }

        // Damping
        p.vx *= DAMPING
        p.vy *= DAMPING

        // Update offset
        p.ox += p.vx
        p.oy += p.vy

        el.style.transform = `translate(${p.ox}px, ${p.oy}px)`
      })

      animationRef.current = requestAnimationFrame(animate)
    }

    animationRef.current = requestAnimationFrame(animate)

    return () => {
      cancelAnimationFrame(animationRef.current)
      if (section) {
        section.removeEventListener('mousemove', handleMouseMove)
        section.removeEventListener('mouseleave', handleMouseLeave)
      }
    }
  }, [text])

  const chars = text.split('')

  return (
    <span ref={containerRef} className={className} aria-label={text}>
      {chars.map((char, i) =>
        char === ' ' ? (
          <span key={i} className="inline-block w-[0.3em]" />
        ) : (
          <span
            key={i}
            ref={(el) => {
              letterRefs.current[i] = el
            }}
            className="inline-block will-change-transform"
            aria-hidden="true"
          >
            {char}
          </span>
        ),
      )}
    </span>
  )
}
