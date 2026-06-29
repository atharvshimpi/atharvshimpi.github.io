import { useEffect, useRef } from 'react'

interface Point {
  x: number
  y: number
  age: number // ms since this point was added
}

const TRAIL_LIFETIME_MS = 800 // how long a point stays visible before fully fading
const MAX_POINTS = 80 // safety cap so the trail never grows unbounded
const LASER_COLOR = '91, 191, 191' // matches --teal RGB, kept as a constant for the glow
const LONG_PRESS_MS = 350 // how long a touch must be held before the laser activates on mobile
const LONG_PRESS_MOVE_TOLERANCE = 10 // px of finger movement allowed before cancelling the long-press

export default function LaserPointer() {
  const canvasRef = useRef<HTMLCanvasElement>(null)
  const pointsRef = useRef<Point[]>([])
  const isActiveRef = useRef(false)
  const lastTimeRef = useRef<number>(performance.now())
  const longPressTimerRef = useRef<number | null>(null)
  const touchStartRef = useRef<{ x: number; y: number } | null>(null)

  useEffect(() => {
    const canvas = canvasRef.current
    if (!canvas) return
    const ctx = canvas.getContext('2d')
    if (!ctx) return

    let animationFrameId: number

    function resize() {
      if (!canvas) return
      canvas.width = window.innerWidth
      canvas.height = window.innerHeight
    }

    function addPoint(x: number, y: number) {
      const points = pointsRef.current
      const last = points[points.length - 1]
      if (last) {
        const dx = x - last.x
        const dy = y - last.y
        const distSq = dx * dx + dy * dy
        if (distSq < 9) return // ~3px minimum movement, skip near-duplicate points

        // Fast movement = fewer mousemove events = large gaps between points,
        // which is what causes the trail to look like straight angular
        // segments. Fill in intermediate points along the gap so the curve
        // has enough resolution to stay smooth even at high speed.
        const dist = Math.sqrt(distSq)
        const maxStep = 14 // px between interpolated points
        if (dist > maxStep) {
          const steps = Math.floor(dist / maxStep)
          for (let i = 1; i <= steps; i++) {
            const t = i / (steps + 1)
            points.push({ x: last.x + dx * t, y: last.y + dy * t, age: 0 })
          }
        }
      }
      points.push({ x, y, age: 0 })
      if (points.length > MAX_POINTS) points.splice(0, points.length - MAX_POINTS)
    }

    function handleContextMenu(e: MouseEvent) {
      // Suppress the native right-click menu so the laser can take over
      e.preventDefault()
    }

    function handleMouseDown(e: MouseEvent) {
      if (e.button !== 2) return // right mouse button only
      isActiveRef.current = true
      pointsRef.current = []
      addPoint(e.clientX, e.clientY)
    }

    function handleMouseMove(e: MouseEvent) {
      if (!isActiveRef.current) return
      addPoint(e.clientX, e.clientY)
    }

    function handleMouseUp(e: MouseEvent) {
      if (e.button !== 2) return
      isActiveRef.current = false
      // Points already on screen are left to fade out naturally via draw()
    }

    function handleMouseLeaveWindow() {
      isActiveRef.current = false
    }

    // ── MOBILE: long-press to activate, drag finger to draw ───────────
    function clearLongPressTimer() {
      if (longPressTimerRef.current !== null) {
        window.clearTimeout(longPressTimerRef.current)
        longPressTimerRef.current = null
      }
    }

    function handleTouchStart(e: TouchEvent) {
      if (e.touches.length !== 1) return // ignore multi-touch (pinch/zoom etc.)
      const touch = e.touches[0]
      touchStartRef.current = { x: touch.clientX, y: touch.clientY }

      clearLongPressTimer()
      longPressTimerRef.current = window.setTimeout(() => {
        isActiveRef.current = true
        pointsRef.current = []
        addPoint(touch.clientX, touch.clientY)
      }, LONG_PRESS_MS)
    }

    function handleTouchMove(e: TouchEvent) {
      if (e.touches.length !== 1) return
      const touch = e.touches[0]

      // If the laser hasn't activated yet, cancel the long-press if the
      // finger moves too much beforehand (treat it as a scroll/swipe instead).
      if (!isActiveRef.current && touchStartRef.current) {
        const dx = touch.clientX - touchStartRef.current.x
        const dy = touch.clientY - touchStartRef.current.y
        if (Math.sqrt(dx * dx + dy * dy) > LONG_PRESS_MOVE_TOLERANCE) {
          clearLongPressTimer()
        }
        return
      }

      if (isActiveRef.current) {
        // Prevent the page from scrolling while actively drawing the laser
        e.preventDefault()
        addPoint(touch.clientX, touch.clientY)
      }
    }

    function handleTouchEnd() {
      clearLongPressTimer()
      isActiveRef.current = false
      touchStartRef.current = null
    }

    function draw(now: number) {
      if (!canvas || !ctx) return
      const dt = now - lastTimeRef.current
      lastTimeRef.current = now

      ctx.clearRect(0, 0, canvas.width, canvas.height)

      const points = pointsRef.current
      // Age all points and drop ones that have fully faded
      for (let i = points.length - 1; i >= 0; i--) {
        points[i].age += dt
        if (points[i].age > TRAIL_LIFETIME_MS) points.splice(i, 1)
      }

      if (points.length > 1) {
        // Draw the trail as a SMOOTH path (quadratic curves through
        // midpoints) so fast mouse movement doesn't look like straight
        // angular segments — this is what Excalidraw does too.
        //
        // Important: if two consecutive points are abnormally far apart
        // (e.g. the cursor jumped due to a dropped event, or the trail
        // array briefly contained a stale point from before a reset), we
        // break the path instead of connecting them — this is what
        // prevents the stray long straight line cutting across the canvas.
        const MAX_GAP = 60 // px — anything beyond this is treated as a break
        const segments = 6 // number of overlapping passes for the taper effect

        for (let pass = 0; pass < segments; pass++) {
          const startIdx = Math.floor((pass / segments) * points.length)
          if (startIdx >= points.length - 1) continue

          const passFrac = (pass + 1) / segments // 0..1, higher = closer to head
          const head = points[points.length - 1]
          const headLife = 1 - head.age / TRAIL_LIFETIME_MS
          if (headLife <= 0) continue

          const slice = points.slice(startIdx)
          if (slice.length < 2) continue

          ctx.strokeStyle = `rgba(${LASER_COLOR}, ${headLife * passFrac * 0.35})`
          ctx.lineWidth = 1.5 + passFrac * 2.5
          ctx.lineCap = 'round'
          ctx.lineJoin = 'round'
          ctx.shadowColor = `rgba(${LASER_COLOR}, ${headLife * 0.6})`
          ctx.shadowBlur = 8 * passFrac

          ctx.beginPath()
          ctx.moveTo(slice[0].x, slice[0].y)
          let penDown = true

          for (let i = 1; i < slice.length; i++) {
            const prev = slice[i - 1]
            const curr = slice[i]
            const dx = curr.x - prev.x
            const dy = curr.y - prev.y
            const gap = Math.sqrt(dx * dx + dy * dy)

            if (gap > MAX_GAP) {
              // Break the path here: stop drawing this stretch, start a
              // fresh subpath from the current point.
              if (penDown) ctx.stroke()
              ctx.beginPath()
              ctx.moveTo(curr.x, curr.y)
              penDown = true
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
          if (penDown) ctx.stroke()
        }

        // Bright dot at the current head of the trail (the live cursor tip)
        const head = points[points.length - 1]
        const headLife = 1 - head.age / TRAIL_LIFETIME_MS
        if (headLife > 0) {
          ctx.beginPath()
          ctx.arc(head.x, head.y, 4, 0, Math.PI * 2)
          ctx.fillStyle = `rgba(${LASER_COLOR}, ${headLife})`
          ctx.shadowColor = `rgba(${LASER_COLOR}, 1)`
          ctx.shadowBlur = 16
          ctx.fill()
        }
      }

      ctx.shadowBlur = 0
      animationFrameId = requestAnimationFrame(draw)
    }

    resize()
    window.addEventListener('resize', resize)
    window.addEventListener('contextmenu', handleContextMenu)
    window.addEventListener('mousedown', handleMouseDown)
    window.addEventListener('mousemove', handleMouseMove)
    window.addEventListener('mouseup', handleMouseUp)
    window.addEventListener('mouseleave', handleMouseLeaveWindow)
    window.addEventListener('touchstart', handleTouchStart, { passive: true })
    window.addEventListener('touchmove', handleTouchMove, { passive: false })
    window.addEventListener('touchend', handleTouchEnd)
    window.addEventListener('touchcancel', handleTouchEnd)
    animationFrameId = requestAnimationFrame(draw)

    return () => {
      window.removeEventListener('resize', resize)
      window.removeEventListener('contextmenu', handleContextMenu)
      window.removeEventListener('mousedown', handleMouseDown)
      window.removeEventListener('mousemove', handleMouseMove)
      window.removeEventListener('mouseup', handleMouseUp)
      window.removeEventListener('mouseleave', handleMouseLeaveWindow)
      window.removeEventListener('touchstart', handleTouchStart)
      window.removeEventListener('touchmove', handleTouchMove)
      window.removeEventListener('touchend', handleTouchEnd)
      window.removeEventListener('touchcancel', handleTouchEnd)
      clearLongPressTimer()
      cancelAnimationFrame(animationFrameId)
    }
  }, [])

  return (
    <canvas
      id="laser-pointer"
      ref={canvasRef}
      style={{
        position: 'fixed',
        inset: 0,
        zIndex: 9999,
        pointerEvents: 'none',
      }}
    />
  )
}