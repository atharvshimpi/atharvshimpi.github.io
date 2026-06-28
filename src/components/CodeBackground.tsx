import { useEffect, useRef } from 'react'

interface Symbol {
  x: number
  y: number
  text: string
  speed: number
  opacity: number
  size: number
}

const SNIPPETS = [
  'const', 'let', 'var', 'function', 'return', 'if', 'else', 'for', 'while',
  'class', 'import', 'export', 'async', 'await', '=>', '{', '}', '[]', '()', 'null',
  '&&', '||', '===', '!==', 'try', 'catch', 'throw', 'new', 'this', 'super',
  '01', '10', '00', '11', '0x1F', '0xFF', 'true', 'false', 'void',
  'int', 'string', 'bool', 'def', 'yield', 'lambda', 'map', 'filter',
]

const SYMBOL_COUNT = 55

export default function CodeBackground() {
  const canvasRef = useRef<HTMLCanvasElement>(null)

  useEffect(() => {
    const canvas = canvasRef.current
    if (!canvas) return
    const ctx = canvas.getContext('2d')
    if (!ctx) return

    let symbols: Symbol[] = []
    let animationFrameId: number

    function randomSnippet() {
      return SNIPPETS[Math.floor(Math.random() * SNIPPETS.length)]
    }

    function resize() {
      if (!canvas) return
      canvas.width = window.innerWidth
      canvas.height = window.innerHeight
    }

    function init() {
      if (!canvas) return
      symbols = []
      for (let i = 0; i < SYMBOL_COUNT; i++) {
        symbols.push({
          x: Math.random() * canvas.width,
          y: Math.random() * canvas.height,
          text: randomSnippet(),
          speed: 0.18 + Math.random() * 0.32,
          opacity: 0.15 + Math.random() * 0.3,
          size: 9 + Math.floor(Math.random() * 7),
        })
      }
    }

    function draw() {
      if (!canvas || !ctx) return
      ctx.clearRect(0, 0, canvas.width, canvas.height)
      symbols.forEach((s) => {
        ctx.font = `${s.size}px 'DM Mono', 'Courier New', monospace`
        ctx.fillStyle = `rgba(91,191,191,${s.opacity})`
        ctx.fillText(s.text, s.x, s.y)
        s.y += s.speed
        if (s.y > canvas.height + 20) {
          s.y = -20
          s.x = Math.random() * canvas.width
          s.text = randomSnippet()
        }
      })
      animationFrameId = requestAnimationFrame(draw)
    }

    function handleResize() {
      resize()
      init()
    }

    resize()
    init()
    draw()
    window.addEventListener('resize', handleResize)

    return () => {
      window.removeEventListener('resize', handleResize)
      cancelAnimationFrame(animationFrameId)
    }
  }, [])

  return <canvas id="code-bg" ref={canvasRef} />
}
