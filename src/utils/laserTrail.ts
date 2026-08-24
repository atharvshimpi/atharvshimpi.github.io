// Shared by LaserPointer (ambient cursor effect) and LaserSlicerGame (the
// slice trail) — both render a fading, glowing trail from a list of aged
// points, just tuned with different constants.

export interface TrailPoint {
  x: number
  y: number
  age: number // ms since this point was added
}

interface AddTrailPointOptions {
  minDist?: number // px — points closer than this to the last one are skipped
  maxStep?: number // px — interpolation step size to smooth out fast movement
  maxPoints?: number // safety cap so the trail never grows unbounded
}

export function addTrailPoint(
  points: TrailPoint[],
  x: number,
  y: number,
  { minDist = 4, maxStep = 14, maxPoints = 60 }: AddTrailPointOptions = {}
) {
  const last = points[points.length - 1]
  if (last) {
    const dx = x - last.x
    const dy = y - last.y
    const distSq = dx * dx + dy * dy
    if (distSq < minDist * minDist) return

    // Fast movement = fewer move events = large gaps between points, which
    // is what causes the trail to look like straight angular segments. Fill
    // in intermediate points along the gap so the curve stays smooth.
    const dist = Math.sqrt(distSq)
    if (dist > maxStep) {
      const steps = Math.floor(dist / maxStep)
      for (let i = 1; i <= steps; i++) {
        const t = i / (steps + 1)
        points.push({ x: last.x + dx * t, y: last.y + dy * t, age: 0 })
      }
    }
  }
  points.push({ x, y, age: 0 })
  if (points.length > maxPoints) points.splice(0, points.length - maxPoints)
}

export function ageTrailPoints(points: TrailPoint[], dt: number, lifetimeMs: number) {
  for (let i = points.length - 1; i >= 0; i--) {
    points[i].age += dt
    if (points[i].age > lifetimeMs) points.splice(i, 1)
  }
}

export interface TrailStyle {
  color: string // "r, g, b" triplet
  lifetimeMs: number
  maxGap?: number // px — gaps bigger than this break the path instead of connecting
  segments?: number // overlapping passes used for the glow taper
  strokeAlpha?: number // stroke alpha multiplier (on top of headLife * passFrac)
  strokeShadowAlpha?: number // stroke glow alpha multiplier (on top of headLife)
  lineWidthBase?: number
  lineWidthScale?: number
  shadowBlurScale?: number
  headDotRadius?: number
  headDotBlur?: number
}

// Draws the trail as a smooth path (quadratic curves through midpoints) so
// fast movement doesn't look like straight angular segments. Gaps larger
// than `maxGap` are treated as a break instead of being connected — this is
// what prevents a stray long straight line cutting across the canvas when
// points jump (dropped events, or a stale point right after a reset).
export function drawLaserTrail(
  ctx: CanvasRenderingContext2D,
  points: TrailPoint[],
  style: TrailStyle
) {
  const {
    color, lifetimeMs,
    maxGap = 60, segments = 6,
    strokeAlpha = 0.35, strokeShadowAlpha = 0.6,
    lineWidthBase = 1.5, lineWidthScale = 2.5,
    shadowBlurScale = 8,
    headDotRadius = 4, headDotBlur = 16,
  } = style

  if (points.length < 2) return
  const head = points[points.length - 1]
  const headLife = 1 - head.age / lifetimeMs
  if (headLife <= 0) return

  for (let pass = 0; pass < segments; pass++) {
    const startIdx = Math.floor((pass / segments) * points.length)
    if (startIdx >= points.length - 1) continue
    const passFrac = (pass + 1) / segments

    ctx.strokeStyle = `rgba(${color}, ${headLife * passFrac * strokeAlpha})`
    ctx.lineWidth = lineWidthBase + passFrac * lineWidthScale
    ctx.lineCap = 'round'
    ctx.lineJoin = 'round'
    ctx.shadowColor = `rgba(${color}, ${headLife * strokeShadowAlpha})`
    ctx.shadowBlur = shadowBlurScale * passFrac

    ctx.beginPath()
    ctx.moveTo(points[startIdx].x, points[startIdx].y)
    let started = true
    for (let i = startIdx + 1; i < points.length; i++) {
      const prev = points[i - 1]
      const curr = points[i]
      const dx = curr.x - prev.x, dy = curr.y - prev.y
      if (Math.sqrt(dx * dx + dy * dy) > maxGap) {
        if (started) ctx.stroke()
        ctx.beginPath()
        ctx.moveTo(curr.x, curr.y)
        started = true
        continue
      }
      if (i < points.length - 1) {
        const next = points[i + 1]
        const mx = (curr.x + next.x) / 2
        const my = (curr.y + next.y) / 2
        ctx.quadraticCurveTo(curr.x, curr.y, mx, my)
      } else {
        ctx.lineTo(curr.x, curr.y)
      }
    }
    if (started) ctx.stroke()
  }

  ctx.beginPath()
  ctx.arc(head.x, head.y, headDotRadius, 0, Math.PI * 2)
  ctx.fillStyle = `rgba(${color}, ${headLife})`
  ctx.shadowColor = `rgba(${color}, 1)`
  ctx.shadowBlur = headDotBlur
  ctx.fill()
  ctx.shadowBlur = 0
}
