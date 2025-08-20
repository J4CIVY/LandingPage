'use client'

import { createContext, useContext, useEffect, useState } from 'react'
import { ThemeProvider as NextThemesProvider, useTheme as useNextTheme } from 'next-themes'
import type { ThemeProviderProps } from 'next-themes/dist/types'

type ThemeContextType = {
  theme: string | undefined
  setTheme: (theme: string) => void
  isAuto: boolean
}

const ThemeContext = createContext<ThemeContextType | undefined>(undefined)

const CustomThemeProvider = ({ children, ...props }: ThemeProviderProps) => {
  const [isAuto, setIsAuto] = useState(true)
  const { theme, setTheme, resolvedTheme } = useNextTheme()

  useEffect(() => {
    const storedPreference = localStorage.getItem('theme-preference')
    if (storedPreference) {
      setIsAuto(false)
      setTheme(storedPreference)
    } else {
      const currentHour = new Date().getHours()
      // Dark mode from 6:16 PM (18:16) to 5:59 AM
      const isNight = currentHour >= 18 || currentHour < 6
      if (isNight && new Date().getMinutes() >= 16 && currentHour >=18) {
        setTheme('dark')
      } else if (isNight && currentHour < 6) {
        setTheme('dark')
      }
      else {
        setTheme('light')
      }
    }
  }, [setTheme])

  const handleSetTheme = (newTheme: string) => {
    if (newTheme === 'auto') {
      localStorage.removeItem('theme-preference')
      setIsAuto(true)
      const currentHour = new Date().getHours()
      const isNight = currentHour >= 18 || currentHour < 6
      if (isNight && new Date().getMinutes() >= 16 && currentHour >=18) {
        setTheme('dark')
      } else if (isNight && currentHour < 6) {
        setTheme('dark')
      }
      else {
        setTheme('light')
      }
    } else {
      localStorage.setItem('theme-preference', newTheme)
      setIsAuto(false)
      setTheme(newTheme)
    }
  }

  return (
    <ThemeContext.Provider value={{ theme: resolvedTheme, setTheme: handleSetTheme, isAuto }}>
      {children}
    </ThemeContext.Provider>
  )
}

export const ThemeProvider = ({ children, ...props }: ThemeProviderProps) => {
  return (
    <NextThemesProvider {...props} attribute="class" defaultTheme="system">
      <CustomThemeProvider>{children}</CustomThemeProvider>
    </NextThemesProvider>
  )
}


export const useTheme = () => {
  const context = useContext(ThemeContext)
  if (context === undefined) {
    throw new Error('useTheme must be used within a ThemeProvider')
  }
  return context
}
