import { Outlet } from 'react-router-dom';
import { Header } from '../components/Header';

export const MainLayout = () => {
  return (
    <div className="min-h-screen bg-white text-black dark:bg-gray-900 dark:text-white transition-colors">
      <Header />
      <main className="p-6">
        <Outlet />
      </main>
    </div>
  )
}