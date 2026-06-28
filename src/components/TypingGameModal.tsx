import { useState, useRef, useEffect, useCallback } from 'react'
import { commitMessages } from '../data/commitMessages'

interface TypingGameModalProps {
  isOpen: boolean
  onClose: () => void
}

function pickRandomMessage(): string {
  return commitMessages[Math.floor(Math.random() * commitMessages.length)]
}

function verdictFor(wpm: number, acc: number): string {
  if (acc < 50) return 'Fast, but none of that actually compiles.'
  if (acc < 75) return "Speed's there, but this PR is getting rejected."
  if (wpm >= 80) return 'Ship it. You type faster than CI builds.'
  if (wpm >= 55) return 'Senior dev speed. Respectable.'
  if (wpm >= 35) return 'Mid-level. Gets the PR merged eventually.'
  if (wpm >= 15) return 'Still compiling...'
  return 'Did you write this on a flip phone?'
}

export default function TypingGameModal({ isOpen, onClose }: TypingGameModalProps) {
  const [target, setTarget] = useState('')
  const [typed, setTyped] = useState('')
  const [finished, setFinished] = useState(false)
  const [wpm, setWpm] = useState(0)
  const [accuracy, setAccuracy] = useState(100)
  const [verdict, setVerdict] = useState('')

  const startTimeRef = useRef<number | null>(null)
  const inputRef = useRef<HTMLInputElement>(null)

  const resetGame = useCallback(() => {
    setTarget(pickRandomMessage())
    setTyped('')
    setFinished(false)
    setWpm(0)
    setAccuracy(100)
    setVerdict('')
    startTimeRef.current = null
  }, [])

  // Reset and focus whenever the modal opens
  useEffect(() => {
    if (isOpen) {
      resetGame()
      const t = setTimeout(() => inputRef.current?.focus(), 350)
      return () => clearTimeout(t)
    }
  }, [isOpen, resetGame])

  // Close on Escape
  useEffect(() => {
    function handleKeyDown(e: KeyboardEvent) {
      if (e.key === 'Escape' && isOpen) onClose()
    }
    document.addEventListener('keydown', handleKeyDown)
    return () => document.removeEventListener('keydown', handleKeyDown)
  }, [isOpen, onClose])

  function finish(finalTyped: string) {
    setFinished(true)
    const elapsedMin = (Date.now() - (startTimeRef.current ?? Date.now())) / 60000
    const words = target.split(' ').length
    const computedWpm = Math.min(
      220,
      Math.max(1, Math.round(words / Math.max(elapsedMin, 0.01)))
    )
    let correct = 0
    for (let i = 0; i < target.length; i++) {
      if (finalTyped[i] === target[i]) correct++
    }
    const computedAcc = Math.round((correct / target.length) * 100)

    setWpm(computedWpm)
    setAccuracy(computedAcc)
    setVerdict(verdictFor(computedWpm, computedAcc))
  }

  function handleInputChange(e: React.ChangeEvent<HTMLInputElement>) {
    if (finished) return
    const value = e.target.value
    if (startTimeRef.current === null) startTimeRef.current = Date.now()
    setTyped(value)
    if (value.length >= target.length) finish(value)
  }

  function renderSnippet() {
    const chars: React.ReactNode[] = []
    for (let i = 0; i < target.length; i++) {
      const char = target[i]
      if (i < typed.length) {
        chars.push(
          <span
            key={i}
            className={typed[i] === char ? 'typed-correct' : 'typed-wrong'}
          >
            {char}
          </span>
        )
      } else if (i === typed.length) {
        chars.push(
          <span key={i} className="typed-cursor">
            {char}
          </span>
        )
      } else {
        chars.push(char)
      }
    }
    return chars
  }

  return (
    <div
      className={`egg-overlay${isOpen ? ' open' : ''}`}
      id="egg-overlay"
      onClick={(e) => {
        if (e.target === e.currentTarget) onClose()
      }}
    >
      <div className="egg-modal">
        <button className="egg-close" onClick={onClose} aria-label="Close">
          ✕
        </button>
        <div className="egg-eyebrow">Found me, huh?</div>
        <h3 className="egg-title">How fast do you actually commit?</h3>
        <div className="egg-snippet" id="egg-snippet">
          {renderSnippet()}
        </div>
        <input
          ref={inputRef}
          className="egg-input"
          id="egg-input"
          type="text"
          placeholder="Start typing to begin..."
          autoComplete="off"
          spellCheck={false}
          maxLength={80}
          value={typed}
          disabled={finished}
          onChange={handleInputChange}
        />
        <div className="egg-stats">
          <div>
            <div className="egg-stat-n" id="egg-wpm">
              {wpm}
            </div>
            <div className="egg-stat-l">WPM</div>
          </div>
          <div>
            <div className="egg-stat-n" id="egg-acc">
              {accuracy}%
            </div>
            <div className="egg-stat-l">Accuracy</div>
          </div>
        </div>
        <div className={`egg-result${finished ? ' show' : ''}`} id="egg-result">
          <p className="egg-verdict" id="egg-verdict">
            {verdict}
          </p>
          <button className="egg-retry" onClick={resetGame}>
            Try Again
          </button>
        </div>
      </div>
    </div>
  )
}
