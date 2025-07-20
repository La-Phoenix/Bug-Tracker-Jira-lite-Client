
import { useTheme } from '../contexts/ThemeContext'
// import { Moo, Sun } from 'lucide-react'

export const ThemeToggle = () => {
  const {  toggleTheme } = useTheme()

  return (
    <button
      onClick={toggleTheme}
      className="p-2 rounded-lg bg-gray-200 dark:bg-gray-700 hover:scale-105 transition"
      title="Toggle Theme"
    >
      {/* {theme === 'dark' ? <Sun className="w-5 h-5" /> : <Moo className="w-5 h-5" />} */}
    </button> 
  )
}
