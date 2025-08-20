'use client'

import { useTheme } from 'next-themes'
import { FaSun, FaMoon } from 'react-icons/fa'
import { useEffect, useState } from 'react'

export const ThemeChanger = () => {
  const [mounted, setMounted] = useState(false)
  const { theme, setTheme } = useTheme()

  useEffect(() => {
    setMounted(true)
  }, [])

  if (!mounted) {
    return null
  }

  return (
    <button
      onClick={() => setTheme(theme === 'dark' ? 'light' : 'dark')}
      className="p-2 rounded-md text-black dark:text-white"
      aria-label="Toggle Dark Mode"
    >
      {theme === 'dark' ? <FaSun /> : <FaMoon />}
    </button>
  )
}
