import { Outlet } from 'react-router-dom'
import Navbar from '@/components/organisms/Navbar'

export default function RootLayout() {
  return (
    <div className="min-h-screen flex flex-col bg-white font-sans">
      <Navbar />
      <main className="flex-1">
        <Outlet />
      </main>
    </div>
  )
}
