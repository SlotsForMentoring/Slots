import { Outlet } from 'react-router-dom'
import Navbar from '@/components/organisms/Navbar'
import { ConsentBanner } from '@/components/organisms/ConsentBanner'
import { ToastContainer } from '@/components/molecules'

/** RootLayout — the app shell every route renders inside: navbar on top, routed page below, consent banner floating over everything. */
export default function RootLayout() {
  return (
    <div className="min-h-screen flex flex-col bg-background font-sans">
      <Navbar />
      <main className="flex-1">
        <Outlet />
      </main>
      <ConsentBanner />
      <ToastContainer />
    </div>
  )
}
