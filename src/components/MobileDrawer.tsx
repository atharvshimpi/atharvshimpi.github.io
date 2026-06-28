import type { PageId } from '../types'

interface MobileDrawerProps {
  isOpen: boolean
  onNavigate: (page: PageId) => void
}

const DRAWER_ITEMS: { id: PageId; label: string }[] = [
  { id: 'home', label: 'Home' },
  { id: 'about', label: 'About' },
  { id: 'experience', label: 'Experience' },
  { id: 'projects', label: 'Projects' },
  { id: 'skills', label: 'Skills' },
  { id: 'contact', label: 'Contact' },
]

export default function MobileDrawer({ isOpen, onNavigate }: MobileDrawerProps) {
  return (
    <div className={`mobile-drawer${isOpen ? ' open' : ''}`} id="mobile-drawer">
      {DRAWER_ITEMS.map((item) => (
        <button key={item.id} onClick={() => onNavigate(item.id)}>
          {item.label}
        </button>
      ))}
    </div>
  )
}
