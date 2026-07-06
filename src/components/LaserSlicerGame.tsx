import { useEffect, useRef, useState, useCallback } from 'react'

// ── CONSTANTS ─────────────────────────────────────────────────
const LIVES = 3
const LASER_COLOR = '91, 191, 191'
const TRAIL_LIFETIME_MS = 650
const MAX_TRAIL = 60
const MIN_DIST = 4
const MAX_GAP = 80

type ShapeKind = 'circle' | 'square' | 'triangle'

interface Shape {
  id: number
  kind: ShapeKind
  x: number
  y: number
  vx: number
  vy: number
  radius: number
  color: string
  rotation: number
  rotSpeed: number
  sliced: boolean
}

interface SliceParticle {
  id: number
  x: number
  y: number
  vx: number
  vy: number
  radius: number
  color: string
  kind: ShapeKind
  alpha: number
  rotation: number
  rotSpeed: number
  half: 'top' | 'bottom'
}

interface TrailPoint {
  x: number
  y: number
  age: number
}

const SHAPE_COLORS = [
  '#5BBFBF', '#8ED8D8', '#E08080',
  '#80C8A0', '#C8A080', '#A080C8',
]

const SHAPE_KINDS: ShapeKind[] = ['circle', 'square', 'triangle']

let nextId = 1

// ── GEOMETRY HELPERS ──────────────────────────────────────────
function segmentIntersectsCircle(
  ax: number, ay: number, bx: number, by: number,
  cx: number, cy: number, r: number
): boolean {
  const dx = bx - ax, dy = by - ay
  const fx = ax - cx, fy = ay - cy
  const a = dx * dx + dy * dy
  const b = 2 * (fx * dx + fy * dy)
  const c = fx * fx + fy * fy - r * r
  let discriminant = b * b - 4 * a * c
  if (discriminant < 0) return false
  discriminant = Math.sqrt(discriminant)
  const t1 = (-b - discriminant) / (2 * a)
  const t2 = (-b + discriminant) / (2 * a)
  return (t1 >= 0 && t1 <= 1) || (t2 >= 0 && t2 <= 1)
}

// Approximate square & triangle as circles for hit detection (good enough)
function shapeHitRadius(shape: Shape): number {
  return shape.kind === 'circle' ? shape.radius : shape.radius * 0.9
}

// ── DRAW HELPERS ──────────────────────────────────────────────
function drawShape(
  ctx: CanvasRenderingContext2D,
  shape: Shape,
  alpha = 1
) {
  ctx.save()
  ctx.globalAlpha = alpha
  ctx.translate(shape.x, shape.y)
  ctx.rotate(shape.rotation)
  ctx.fillStyle = shape.color
  ctx.strokeStyle = 'rgba(255,255,255,0.25)'
  ctx.lineWidth = 1.5
  ctx.shadowColor = shape.color
  ctx.shadowBlur = 12

  if (shape.kind === 'circle') {
    ctx.beginPath()
    ctx.arc(0, 0, shape.radius, 0, Math.PI * 2)
    ctx.fill()
    ctx.stroke()
  } else if (shape.kind === 'square') {
    const s = shape.radius
    ctx.beginPath()
    ctx.roundRect(-s, -s, s * 2, s * 2, 6)
    ctx.fill()
    ctx.stroke()
  } else {
    const s = shape.radius
    ctx.beginPath()
    ctx.moveTo(0, -s)
    ctx.lineTo(s * 0.87, s * 0.5)
    ctx.lineTo(-s * 0.87, s * 0.5)
    ctx.closePath()
    ctx.fill()
    ctx.stroke()
  }
  ctx.restore()
}

function drawHalf(
  ctx: CanvasRenderingContext2D,
  p: SliceParticle,
) {
  ctx.save()
  ctx.globalAlpha = p.alpha
  ctx.translate(p.x, p.y)
  ctx.rotate(p.rotation)
  ctx.fillStyle = p.color
  ctx.shadowColor = p.color
  ctx.shadowBlur = 8

  const s = p.radius
  ctx.beginPath()
  if (p.half === 'top') {
    ctx.rect(-s, -s, s * 2, s)
  } else {
    ctx.rect(-s, 0, s * 2, s)
  }
  ctx.clip()

  if (p.kind === 'circle') {
    ctx.beginPath()
    ctx.arc(0, 0, s, 0, Math.PI * 2)
    ctx.fill()
  } else if (p.kind === 'square') {
    ctx.beginPath()
    ctx.roundRect(-s, -s, s * 2, s * 2, 6)
    ctx.fill()
  } else {
    ctx.beginPath()
    ctx.moveTo(0, -s)
    ctx.lineTo(s * 0.87, s * 0.5)
    ctx.lineTo(-s * 0.87, s * 0.5)
    ctx.closePath()
    ctx.fill()
  }
  ctx.restore()
}

function drawTrail(ctx: CanvasRenderingContext2D, points: TrailPoint[]) {
  if (points.length < 2) return
  const segments = 6
  for (let pass = 0; pass < segments; pass++) {
    const startIdx = Math.floor((pass / segments) * points.length)
    if (startIdx >= points.length - 1) continue
    const passFrac = (pass + 1) / segments
    const head = points[points.length - 1]
    const headLife = 1 - head.age / TRAIL_LIFETIME_MS
    if (headLife <= 0) continue
    const slice = points.slice(startIdx)
    if (slice.length < 2) continue

    ctx.strokeStyle = `rgba(${LASER_COLOR}, ${headLife * passFrac * 0.4})`
    ctx.lineWidth = 1.5 + passFrac * 3
    ctx.lineCap = 'round'
    ctx.lineJoin = 'round'
    ctx.shadowColor = `rgba(${LASER_COLOR}, ${headLife * 0.7})`
    ctx.shadowBlur = 10 * passFrac

    ctx.beginPath()
    ctx.moveTo(slice[0].x, slice[0].y)
    let started = true
    for (let i = 1; i < slice.length; i++) {
      const prev = slice[i - 1]
      const curr = slice[i]
      const dx = curr.x - prev.x, dy = curr.y - prev.y
      if (Math.sqrt(dx * dx + dy * dy) > MAX_GAP) {
        if (started) ctx.stroke()
        ctx.beginPath()
        ctx.moveTo(curr.x, curr.y)
        started = true
        continue
      }
      if (i < slice.length - 1) {
        const next = slice[i + 1]
        const mx = (curr.x + next.x) / 2
        const my = (curr.y + next.y) / 2
        ctx.quadraticCurveTo(curr.x, curr.y, mx, my)
      } else {
        ctx.lineTo(curr.x, curr.y)
      }
    }
    if (started) ctx.stroke()
  }

  const head = points[points.length - 1]
  const headLife = 1 - head.age / TRAIL_LIFETIME_MS
  if (headLife > 0) {
    ctx.beginPath()
    ctx.arc(head.x, head.y, 4, 0, Math.PI * 2)
    ctx.fillStyle = `rgba(${LASER_COLOR}, ${headLife})`
    ctx.shadowColor = `rgba(${LASER_COLOR}, 1)`
    ctx.shadowBlur = 18
    ctx.fill()
  }
  ctx.shadowBlur = 0
}

// ── COMPONENT ─────────────────────────────────────────────────
interface LaserSlicerGameProps {
  isOpen: boolean
  onClose: () => void
}

type GameState = 'countdown' | 'playing' | 'gameover'

export default function LaserSlicerGame({ isOpen, onClose }: LaserSlicerGameProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null)
  const stateRef = useRef<{
    shapes: Shape[]
    particles: SliceParticle[]
    trail: TrailPoint[]
    score: number
    lives: number
    gameState: GameState
    countdown: number
    spawnTimer: number
    spawnInterval: number
    speedMult: number
    diffTimer: number
    isDrawing: boolean
    lastTime: number
    longPressTimer: number | null
    touchStart: { x: number; y: number } | null
    animId: number
  }>({
    shapes: [], particles: [], trail: [],
    score: 0, lives: LIVES,
    gameState: 'countdown', countdown: 3,
    spawnTimer: 0, spawnInterval: 1800,
    speedMult: 1, diffTimer: 0,
    isDrawing: false, lastTime: 0,
    longPressTimer: null, touchStart: null,
    animId: 0,
  })

  const [displayScore, setDisplayScore] = useState(0)
  const [displayLives, setDisplayLives] = useState(LIVES)
  const [displayState, setDisplayState] = useState<GameState>('countdown')
  const [displayCountdown, setDisplayCountdown] = useState(3)

  const spawnShape = useCallback((canvas: HTMLCanvasElement) => {
    const s = stateRef.current
    const kind = SHAPE_KINDS[Math.floor(Math.random() * SHAPE_KINDS.length)]
    const color = SHAPE_COLORS[Math.floor(Math.random() * SHAPE_COLORS.length)]
    const radius = 28 + Math.random() * 20
    const edge = Math.floor(Math.random() * 4)
    let x = 0, y = 0, vx = 0, vy = 0
    const speed = (2.5 + Math.random() * 1.5) * s.speedMult
    if (edge === 0) { x = Math.random() * canvas.width; y = -radius; vx = (Math.random() - 0.5) * speed; vy = speed }
    else if (edge === 1) { x = canvas.width + radius; y = Math.random() * canvas.height; vx = -speed; vy = (Math.random() - 0.5) * speed }
    else if (edge === 2) { x = Math.random() * canvas.width; y = canvas.height + radius; vx = (Math.random() - 0.5) * speed; vy = -speed }
    else { x = -radius; y = Math.random() * canvas.height; vx = speed; vy = (Math.random() - 0.5) * speed }

    s.shapes.push({
      id: nextId++, kind, x, y, vx, vy, radius, color,
      rotation: Math.random() * Math.PI * 2,
      rotSpeed: (Math.random() - 0.5) * 0.04,
      sliced: false,
    })
  }, [])

  const addTrailPoint = useCallback((x: number, y: number) => {
    const trail = stateRef.current.trail
    const last = trail[trail.length - 1]
    if (last) {
      const dx = x - last.x, dy = y - last.y
      const distSq = dx * dx + dy * dy
      if (distSq < MIN_DIST * MIN_DIST) return
      const dist = Math.sqrt(distSq)
      const maxStep = 14
      if (dist > maxStep) {
        const steps = Math.floor(dist / maxStep)
        for (let i = 1; i <= steps; i++) {
          const t = i / (steps + 1)
          trail.push({ x: last.x + dx * t, y: last.y + dy * t, age: 0 })
        }
      }
    }
    trail.push({ x, y, age: 0 })
    if (trail.length > MAX_TRAIL) trail.splice(0, trail.length - MAX_TRAIL)
  }, [])

  const checkSlice = useCallback(() => {
    const s = stateRef.current
    const trail = s.trail
    if (trail.length < 2) return
    // Check last few trail segments for freshness
    const recentStart = Math.max(0, trail.length - 8)
    const recent = trail.slice(recentStart)

    for (let si = s.shapes.length - 1; si >= 0; si--) {
      const shape = s.shapes[si]
      if (shape.sliced) continue
      const r = shapeHitRadius(shape)
      let hit = false
      for (let ti = 1; ti < recent.length; ti++) {
        if (segmentIntersectsCircle(
          recent[ti - 1].x, recent[ti - 1].y,
          recent[ti].x, recent[ti].y,
          shape.x, shape.y, r
        )) { hit = true; break }
      }
      if (!hit) continue
      shape.sliced = true
      s.score += 10
      setDisplayScore(s.score)

      // Spawn two half-particles flying apart
      const spread = 2 + Math.random() * 2;
      (['top', 'bottom'] as const).forEach(half => {
        const dy = half === 'top' ? -spread : spread
        s.particles.push({
          id: nextId++,
          x: shape.x, y: shape.y,
          vx: shape.vx + (Math.random() - 0.5) * 2,
          vy: shape.vy + dy,
          radius: shape.radius,
          color: shape.color,
          kind: shape.kind,
          alpha: 1,
          rotation: shape.rotation,
          rotSpeed: shape.rotSpeed * 2,
          half,
        })
      })
      s.shapes.splice(si, 1)
    }
  }, [])

  useEffect(() => {
    if (!isOpen) return
    const canvas = canvasRef.current
    if (!canvas) return
    const ctx = canvas.getContext('2d')
    if (!ctx) return

    const s = stateRef.current
    // Reset state
    s.shapes = []; s.particles = []; s.trail = []
    s.score = 0; s.lives = LIVES
    s.gameState = 'countdown'; s.countdown = 3
    s.spawnTimer = 0; s.spawnInterval = 1800
    s.speedMult = 1; s.diffTimer = 0
    s.isDrawing = false; s.lastTime = performance.now()
    setDisplayScore(0); setDisplayLives(LIVES)
    setDisplayState('countdown'); setDisplayCountdown(3)

    function resize() {
      if (!canvas) return
      canvas.width = window.innerWidth
      canvas.height = window.innerHeight
    }
    resize()
    window.addEventListener('resize', resize)

    // ── COUNTDOWN ──────────────────────────────────────────────
    let countdownInterval: number
    countdownInterval = window.setInterval(() => {
      s.countdown -= 1
      if (s.countdown <= 0) {
        clearInterval(countdownInterval)
        s.gameState = 'playing'
        setDisplayState('playing')
      } else {
        setDisplayCountdown(s.countdown)
      }
    }, 1000)

    // ── GAME LOOP ──────────────────────────────────────────────
    function loop(now: number) {
      if (!canvas || !ctx) return
      const dt = Math.min(now - s.lastTime, 50)
      s.lastTime = now

      ctx.clearRect(0, 0, canvas.width, canvas.height)

      if (s.gameState === 'playing') {
        // Difficulty ramp: every 15s speed up and spawn faster
        s.diffTimer += dt
        if (s.diffTimer > 15000) {
          s.diffTimer = 0
          s.speedMult = Math.min(s.speedMult + 0.25, 3)
          s.spawnInterval = Math.max(s.spawnInterval - 150, 700)
        }

        // Spawn shapes
        s.spawnTimer += dt
        if (s.spawnTimer >= s.spawnInterval) {
          s.spawnTimer = 0
          spawnShape(canvas)
        }

        // Update shapes
        for (let i = s.shapes.length - 1; i >= 0; i--) {
          const sh = s.shapes[i]
          sh.x += sh.vx
          sh.y += sh.vy
          sh.rotation += sh.rotSpeed

          // Off screen — lose a life
          const margin = sh.radius + 10
          if (
            sh.x < -margin || sh.x > canvas.width + margin ||
            sh.y < -margin || sh.y > canvas.height + margin
          ) {
            s.shapes.splice(i, 1)
            s.lives -= 1
            setDisplayLives(s.lives)
            if (s.lives <= 0) {
              s.gameState = 'gameover'
              setDisplayState('gameover')
            }
          }
        }

        // Update particles
        for (let i = s.particles.length - 1; i >= 0; i--) {
          const p = s.particles[i]
          p.x += p.vx; p.y += p.vy
          p.vy += 0.12 // gravity
          p.alpha -= dt / 600
          p.rotation += p.rotSpeed
          if (p.alpha <= 0) s.particles.splice(i, 1)
        }

        // Age trail
        for (let i = s.trail.length - 1; i >= 0; i--) {
          s.trail[i].age += dt
          if (s.trail[i].age > TRAIL_LIFETIME_MS) s.trail.splice(i, 1)
        }

        // Draw shapes
        s.shapes.forEach(sh => drawShape(ctx, sh))

        // Draw particles
        s.particles.forEach(p => drawHalf(ctx, p))

        // Draw trail
        drawTrail(ctx, s.trail)

        // Check slices
        if (s.isDrawing) checkSlice()
      }

      s.animId = requestAnimationFrame(loop)
    }
    s.animId = requestAnimationFrame(loop)

    // ── INPUT: MOUSE ──────────────────────────────────────────
    function onContextMenu(e: MouseEvent) { e.preventDefault() }

    function onMouseDown(e: MouseEvent) {
      if (e.button !== 2 || s.gameState !== 'playing') return
      s.isDrawing = true
      s.trail = []
      addTrailPoint(e.clientX, e.clientY)
    }
    function onMouseMove(e: MouseEvent) {
      if (!s.isDrawing || s.gameState !== 'playing') return
      addTrailPoint(e.clientX, e.clientY)
    }
    function onMouseUp(e: MouseEvent) {
      if (e.button !== 2) return
      s.isDrawing = false
    }

    // ── INPUT: TOUCH ──────────────────────────────────────────
    function onTouchStart(e: TouchEvent) {
      if (e.touches.length !== 1 || s.gameState !== 'playing') return
      const t = e.touches[0]
      s.touchStart = { x: t.clientX, y: t.clientY }
      s.longPressTimer = window.setTimeout(() => {
        s.isDrawing = true
        s.trail = []
        if (s.touchStart) addTrailPoint(s.touchStart.x, s.touchStart.y)
      }, 300)
    }
    function onTouchMove(e: TouchEvent) {
      if (e.touches.length !== 1) return
      const t = e.touches[0]
      if (!s.isDrawing && s.touchStart) {
        const dx = t.clientX - s.touchStart.x
        const dy = t.clientY - s.touchStart.y
        if (Math.sqrt(dx * dx + dy * dy) > 10) {
          if (s.longPressTimer) { clearTimeout(s.longPressTimer); s.longPressTimer = null }
        }
        return
      }
      if (s.isDrawing) {
        e.preventDefault()
        addTrailPoint(t.clientX, t.clientY)
      }
    }
    function onTouchEnd() {
      if (s.longPressTimer) { clearTimeout(s.longPressTimer); s.longPressTimer = null }
      s.isDrawing = false
      s.touchStart = null
    }

    window.addEventListener('contextmenu', onContextMenu)
    window.addEventListener('mousedown', onMouseDown)
    window.addEventListener('mousemove', onMouseMove)
    window.addEventListener('mouseup', onMouseUp)
    window.addEventListener('touchstart', onTouchStart, { passive: true })
    window.addEventListener('touchmove', onTouchMove, { passive: false })
    window.addEventListener('touchend', onTouchEnd)
    window.addEventListener('touchcancel', onTouchEnd)

    return () => {
      clearInterval(countdownInterval)
      cancelAnimationFrame(s.animId)
      window.removeEventListener('resize', resize)
      window.removeEventListener('contextmenu', onContextMenu)
      window.removeEventListener('mousedown', onMouseDown)
      window.removeEventListener('mousemove', onMouseMove)
      window.removeEventListener('mouseup', onMouseUp)
      window.removeEventListener('touchstart', onTouchStart)
      window.removeEventListener('touchmove', onTouchMove)
      window.removeEventListener('touchend', onTouchEnd)
      window.removeEventListener('touchcancel', onTouchEnd)
    }
  }, [isOpen, addTrailPoint, checkSlice, spawnShape])

  if (!isOpen) return null

  const s = stateRef.current

  return (
    <div style={{
      position: 'fixed', inset: 0, zIndex: 8000,
      background: 'rgba(7,21,32,0.97)',
      userSelect: 'none',
    }}>
      <canvas ref={canvasRef} style={{ position: 'absolute', inset: 0 }} />

      {/* HUD */}
      <div style={{
        position: 'absolute', top: 0, left: 0, right: 0,
        display: 'flex', justifyContent: 'space-between', alignItems: 'center',
        padding: '1.2rem 2rem',
        background: 'rgba(7,21,32,0.6)',
        backdropFilter: 'blur(8px)',
        borderBottom: '1px solid rgba(91,191,191,0.15)',
        zIndex: 1,
      }}>
        <div style={{ fontFamily: 'Cormorant Garamond, serif', fontSize: '1.4rem', color: '#5BBFBF' }}>
          {displayScore} <span style={{ fontSize: '.7rem', letterSpacing: '.15em', color: '#7AABB8', textTransform: 'uppercase' }}>pts</span>
        </div>
        <div style={{ display: 'flex', gap: '.5rem', alignItems: 'center' }}>
          {Array.from({ length: LIVES }).map((_, i) => (
            <span key={i} style={{ fontSize: '1.2rem', opacity: i < displayLives ? 1 : 0.2 }}>
              ❤️
            </span>
          ))}
        </div>
        <button onClick={onClose} style={{
          background: 'none', border: '1px solid rgba(91,191,191,0.3)',
          color: '#7AABB8', cursor: 'pointer',
          fontFamily: 'DM Sans, sans-serif', fontSize: '.65rem',
          letterSpacing: '.12em', textTransform: 'uppercase',
          padding: '.4rem .9rem', transition: 'all .2s',
        }}>
          Exit
        </button>
      </div>

      {/* COUNTDOWN */}
      {displayState === 'countdown' && (
        <div style={{
          position: 'absolute', inset: 0, display: 'flex',
          flexDirection: 'column', alignItems: 'center', justifyContent: 'center',
          zIndex: 2, pointerEvents: 'none',
        }}>
          <div style={{
            fontFamily: 'Cormorant Garamond, serif',
            fontSize: '8rem', fontWeight: 300,
            color: '#5BBFBF', lineHeight: 1,
            textShadow: '0 0 40px rgba(91,191,191,0.6)',
          }}>
            {displayCountdown}
          </div>
          <div style={{
            fontFamily: 'DM Sans, sans-serif',
            fontSize: '.75rem', letterSpacing: '.2em',
            textTransform: 'uppercase', color: '#7AABB8',
            marginTop: '1rem',
          }}>
            {window.innerWidth <= 768
              ? 'Long press + drag to slice'
              : 'Right click + drag to slice'}
          </div>
        </div>
      )}

      {/* GAME OVER */}
      {displayState === 'gameover' && (
        <div style={{
          position: 'absolute', inset: 0, display: 'flex',
          flexDirection: 'column', alignItems: 'center', justifyContent: 'center',
          zIndex: 2,
          background: 'rgba(7,21,32,0.85)',
        }}>
          <div style={{
            fontFamily: 'Cormorant Garamond, serif',
            fontSize: '3.5rem', fontWeight: 300,
            color: '#E8F4F8', marginBottom: '.5rem',
          }}>
            Game Over
          </div>
          <div style={{
            fontFamily: 'Cormorant Garamond, serif',
            fontSize: '2rem', color: '#5BBFBF', marginBottom: '.5rem',
          }}>
            {s.score} pts
          </div>
          <div style={{
            fontFamily: 'DM Sans, sans-serif',
            fontSize: '.8rem', color: '#7AABB8',
            letterSpacing: '.08em', marginBottom: '2rem',
          }}>
            {s.score >= 100 ? 'Not bad, engineer. 🔥'
              : s.score >= 50 ? 'Getting warmer... ⚡'
              : "Back to debugging, I guess. 🐛"}
          </div>
          <div style={{ display: 'flex', gap: '1rem' }}>
            <button
              onClick={() => {
                const s = stateRef.current
                s.shapes = []; s.particles = []; s.trail = []
                s.score = 0; s.lives = LIVES
                s.gameState = 'countdown'; s.countdown = 3
                s.spawnTimer = 0; s.spawnInterval = 1800
                s.speedMult = 1; s.diffTimer = 0
                s.isDrawing = false
                setDisplayScore(0); setDisplayLives(LIVES)
                setDisplayState('countdown'); setDisplayCountdown(3)
              }}
              style={{
                background: '#5BBFBF', color: '#071520',
                border: 'none', cursor: 'pointer',
                fontFamily: 'DM Sans, sans-serif', fontWeight: 500,
                fontSize: '.7rem', letterSpacing: '.12em', textTransform: 'uppercase',
                padding: '.8rem 2rem', transition: 'all .2s',
              }}
            >
              Play Again
            </button>
            <button onClick={onClose} style={{
              background: 'none', border: '1px solid rgba(91,191,191,0.4)',
              color: '#5BBFBF', cursor: 'pointer',
              fontFamily: 'DM Sans, sans-serif',
              fontSize: '.7rem', letterSpacing: '.12em', textTransform: 'uppercase',
              padding: '.8rem 2rem', transition: 'all .2s',
            }}>
              Exit
            </button>
          </div>
        </div>
      )}
    </div>
  )
}