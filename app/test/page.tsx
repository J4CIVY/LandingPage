'use client'

import { useTheme } from 'next-themes'
import { useEffect, useState } from 'react'

export default function TestPage() {
  const [mounted, setMounted] = useState(false)
  const { theme, setTheme } = useTheme()

  useEffect(() => {
    setMounted(true)
  }, [])

  if (!mounted) {
    return null
  }

  return (
    <div className="min-h-screen bg-yellow-200 dark:bg-purple-900 text-purple-900 dark:text-yellow-200 p-8">
      <h1 className="text-4xl font-bold mb-6">🌞 Prueba de Tema 🌙</h1>
      
      <div className="space-y-4">
        <p className="text-lg">Tema actual: <strong>{theme}</strong></p>
        
        <div className="space-x-4">
          <button 
            onClick={() => setTheme('light')}
            className="px-6 py-3 bg-blue-500 hover:bg-blue-600 text-white rounded-lg font-bold"
          >
            ☀️ Modo Claro
          </button>
          <button 
            onClick={() => setTheme('dark')}
            className="px-6 py-3 bg-red-500 hover:bg-red-600 text-white rounded-lg font-bold"
          >
            🌙 Modo Oscuro
          </button>
        </div>

        <div className="mt-8 p-6 bg-pink-200 dark:bg-green-800 rounded-lg border-4 border-red-500 dark:border-yellow-400">
          <h2 className="text-2xl font-bold mb-4">🎨 Contenido de Prueba Contrastante</h2>
          <p className="text-lg">Este contenido debería cambiar DRÁSTICAMENTE según el tema:</p>
          <ul className="mt-4 space-y-2 text-lg">
            <li>✅ Fondo: 🟡 Amarillo claro ↔ 🟣 Púrpura oscuro</li>
            <li>✅ Texto: 🟣 Púrpura ↔ 🟡 Amarillo</li>
            <li>✅ Tarjeta: 🌸 Rosa claro ↔ 🟢 Verde oscuro</li>
            <li>✅ Borde: 🔴 Rojo ↔ 🟡 Amarillo</li>
          </ul>
        </div>
      </div>
    </div>
  )
}
