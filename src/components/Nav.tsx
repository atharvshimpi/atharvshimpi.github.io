import type { PageId } from '../types'

interface NavProps {
  currentPage: PageId
  onNavigate: (page: PageId) => void
  drawerOpen: boolean
  onToggleDrawer: () => void
  onOpenTypingGame: () => void
}

const NAV_ITEMS: { id: PageId; label: string }[] = [
  { id: 'home', label: 'Home' },
  { id: 'about', label: 'About' },
  { id: 'experience', label: 'Experience' },
  { id: 'projects', label: 'Projects' },
  { id: 'skills', label: 'Skills' },
  { id: 'contact', label: 'Contact' },
]

export default function Nav({
  currentPage,
  onNavigate,
  drawerOpen,
  onToggleDrawer,
  onOpenTypingGame,
}: NavProps) {
  return (
    <nav>
      <div className="nav-logo">
        <span className="nav-logo-text" onClick={() => onNavigate('home')}>
          Atharv Shimpi
          <span className="dot-accent">.</span>
        </span>
        <button
          className="egg-trigger"
          onClick={(e) => {
            e.stopPropagation()
            onOpenTypingGame()
          }}
          title="Type fast?"
          aria-label="Easter egg"
        >
          {'</>'}
        </button>
      </div>

      <ul className="nav-links">
        {NAV_ITEMS.map((item) => (
          <li key={item.id}>
            <button
              id={`nb-${item.id}`}
              className={currentPage === item.id ? 'active' : ''}
              onClick={() => onNavigate(item.id)}
            >
              {item.label}
            </button>
          </li>
        ))}
      </ul>

      <button
        className={`hamburger${drawerOpen ? ' open' : ''}`}
        id="hamburger"
        onClick={onToggleDrawer}
        aria-label="Menu"
      >
        <span></span>
        <span></span>
        <span></span>
      </button>
    </nav>
  )
}
