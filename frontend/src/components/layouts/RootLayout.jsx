import { Outlet } from 'react-router-dom'
import Navbar from '@/components/organisms/Navbar'
import { ConsentBanner } from '@/components/organisms/ConsentBanner'
import { ToastContainer } from '@/components/molecules'

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
