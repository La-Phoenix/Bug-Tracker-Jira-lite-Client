import { ThemeToggle } from '../components/ThemeToggle'
import { Outlet } from 'react-router-dom'

export const MainLayout = () => {
  return (
    <div className="min-h-screen bg-white text-black dark:bg-gray-900 dark:text-white transition-colors">
      <header className="p-4 flex justify-between items-center border-b dark:border-gray-700">
        <h1 className="text-xl font-bold">BugTrackr</h1>
        <ThemeToggle />
      </header>
      <main className="p-6">
        <Outlet />
      </main>
    </div>
  )
}
