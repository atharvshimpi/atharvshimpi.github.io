import { useEffect, useRef } from 'react'
import { addTrailPoint, ageTrailPoints, drawLaserTrail, type TrailPoint } from '../utils/laserTrail'

const TRAIL_LIFETIME_MS = 900 // how long a point stays visible before fully fading
const MAX_POINTS = 80 // safety cap so the trail never grows unbounded
const LASER_COLOR = '91, 191, 191' // matches --teal RGB, kept as a constant for the glow
const LONG_PRESS_MS = 350 // how long a touch must be held before the laser activates on mobile
const LONG_PRESS_MOVE_TOLERANCE = 10 // px of finger movement allowed before cancelling the long-press

export default function LaserPointer() {
  const canvasRef = useRef<HTMLCanvasElement>(null)
  const pointsRef = useRef<TrailPoint[]>([])
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
      if (!canvas || !ctx) return
      // Render at native resolution so the thin glowing line stays sharp on
      // high-DPI displays instead of being upscaled from a 1x buffer.
      const dpr = window.devicePixelRatio || 1
      canvas.width = window.innerWidth * dpr
      canvas.height = window.innerHeight * dpr
      ctx.scale(dpr, dpr)
    }

    function addPoint(x: number, y: number) {
      addTrailPoint(pointsRef.current, x, y, { minDist: 3, maxPoints: MAX_POINTS })
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

    function handleWindowBlur() {
      // Covers alt-tab / OS gestures that end the press without a mouseup,
      // touchend, or touchcancel ever firing — without this the laser can
      // get stuck "active" and keep drawing on the next mouse move.
      clearLongPressTimer()
      isActiveRef.current = false
      touchStartRef.current = null
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

      ctx.clearRect(0, 0, window.innerWidth, window.innerHeight)

      const points = pointsRef.current
      ageTrailPoints(points, dt, TRAIL_LIFETIME_MS)
      drawLaserTrail(ctx, points, { color: LASER_COLOR, lifetimeMs: TRAIL_LIFETIME_MS })

      animationFrameId = requestAnimationFrame(draw)
    }

    resize()
    window.addEventListener('resize', resize)
    window.addEventListener('contextmenu', handleContextMenu)
    window.addEventListener('mousedown', handleMouseDown)
    window.addEventListener('mousemove', handleMouseMove)
    window.addEventListener('mouseup', handleMouseUp)
    window.addEventListener('mouseleave', handleMouseLeaveWindow)
    window.addEventListener('blur', handleWindowBlur)
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
      window.removeEventListener('blur', handleWindowBlur)
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
