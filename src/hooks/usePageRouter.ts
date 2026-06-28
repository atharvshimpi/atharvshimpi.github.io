import { useState, useCallback } from 'react'
import type { PageId } from '../types'

interface UsePageRouter {
  currentPage: PageId
  goTo: (page: PageId) => void
}

export function usePageRouter(initial: PageId = 'home'): UsePageRouter {
  const [currentPage, setCurrentPage] = useState<PageId>(initial)

  const goTo = useCallback((page: PageId) => {
    setCurrentPage(page)
    // Scroll the newly active page to top, mirroring original behaviour
    requestAnimationFrame(() => {
      const el = document.getElementById(`page-${page}`)
      if (el) el.scrollTop = 0
    })
  }, [])

  return { currentPage, goTo }
}
