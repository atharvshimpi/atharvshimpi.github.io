import { useState } from 'react'
import Nav from './components/Nav'
import MobileDrawer from './components/MobileDrawer'
import CodeBackground from './components/CodeBackground'
import TypingGameModal from './components/TypingGameModal'
import LaserPointer from './components/LaserPointer'
import Home from './pages/Home'
import About from './pages/About'
import Experience from './pages/Experience'
import Projects from './pages/Projects/Projects'
import Skills from './pages/Skills'
import Contact from './pages/Contact'
import { usePageRouter } from './hooks/usePageRouter'
import type { PageId } from './types'

export default function App() {
  const { currentPage, goTo } = usePageRouter('home')
  const [drawerOpen, setDrawerOpen] = useState(false)
  const [typingGameOpen, setTypingGameOpen] = useState(false)

  function navigate(page: PageId) {
    goTo(page)
  }

  function navigateFromDrawer(page: PageId) {
    goTo(page)
    setDrawerOpen(false)
  }

  return (
    <>
      <CodeBackground />
      <LaserPointer />

      <Nav
        currentPage={currentPage}
        onNavigate={navigate}
        drawerOpen={drawerOpen}
        onToggleDrawer={() => setDrawerOpen((open) => !open)}
        onOpenTypingGame={() => setTypingGameOpen(true)}
      />

      <MobileDrawer isOpen={drawerOpen} onNavigate={navigateFromDrawer} />

      <TypingGameModal
        isOpen={typingGameOpen}
        onClose={() => setTypingGameOpen(false)}
      />

      {/* All pages stay mounted so each retains its own internal tab state
          (Projects, Skills) between visits. Each page receives `isActive`
          and applies the "active" class to its own root .page div, matching
          the original CSS-driven fade/slide transition exactly. */}
      <Home onNavigate={navigate} isActive={currentPage === 'home'} />
      <About isActive={currentPage === 'about'} />
      <Experience isActive={currentPage === 'experience'} />
      <Projects isActive={currentPage === 'projects'} />
      <Skills isActive={currentPage === 'skills'} />
      <Contact isActive={currentPage === 'contact'} />
    </>
  )
}