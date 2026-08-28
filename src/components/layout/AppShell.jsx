import { useCallback, useState } from 'react'
import { Outlet } from 'react-router-dom'
import MobileHeader from './MobileHeader'
import Sidebar from './Sidebar'

export default function AppShell() {
  const [isNavigationOpen, setIsNavigationOpen] = useState(false)
  const closeNavigation = useCallback(() => setIsNavigationOpen(false), [])

  return (
    <div className="min-h-screen bg-paper text-ink">
      <a href="#main-content" className="skip-link">Skip to content</a>
      <Sidebar />
      <MobileHeader
        isOpen={isNavigationOpen}
        onClose={closeNavigation}
        onOpen={() => setIsNavigationOpen(true)}
      />
      <main id="main-content" className="min-h-screen lg:ml-72">
        <Outlet />
      </main>
    </div>
  )
}
