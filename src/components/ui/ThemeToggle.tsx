'use client'

import { Moon, Sun } from 'lucide-react'
import { useTheme } from '@/hooks/useTheme'

export function ThemeToggle() {
  const { theme, toggleTheme, mounted } = useTheme()

  if (!mounted) {
    return (
      <div className="w-9 h-9 rounded-lg bg-gray-200 dark:bg-gray-700 animate-pulse" />
    )
  }

  return (
    <button
      onClick={toggleTheme}
      className="group relative w-9 h-9 rounded-lg bg-gray-100 hover:bg-gray-200 dark:bg-gray-800 dark:hover:bg-gray-700 transition-all duration-300 flex items-center justify-center"
      aria-label={`Switch to ${theme === 'light' ? 'dark' : 'light'} mode`}
    >
      <div className="relative w-5 h-5">
        {/* Sun icon */}
        <Sun 
          className={`absolute inset-0 w-5 h-5 text-amber-500 transform transition-all duration-300 ${
            theme === 'dark' 
              ? 'rotate-90 scale-0 opacity-0' 
              : 'rotate-0 scale-100 opacity-100'
          }`}
        />
        
        {/* Moon icon */}
        <Moon 
          className={`absolute inset-0 w-5 h-5 text-blue-400 transform transition-all duration-300 ${
            theme === 'light' 
              ? '-rotate-90 scale-0 opacity-0' 
              : 'rotate-0 scale-100 opacity-100'
          }`}
        />
      </div>
      
      {/* Hover effect */}
      <div className="absolute inset-0 rounded-lg bg-gradient-to-r from-amber-500/0 to-blue-500/0 group-hover:from-amber-500/10 group-hover:to-blue-500/10 transition-all duration-300" />
    </button>
  )
}
