'use client'

import { useState, type ChangeEvent } from 'react'
import { FaEye, FaEyeSlash, FaLock, FaCheckCircle, FaTimesCircle, FaExclamationTriangle } from 'react-icons/fa'

interface PasswordStrength {
  score: number
  label: string
  color: string
  requirements: {
    length: boolean
    uppercase: boolean
    lowercase: boolean
    number: boolean
    special: boolean
  }
}

interface ToastType {
  title: string
  description: string
  type: 'success' | 'error' | 'warning'
}

export default function PasswordChangeSection() {
  const [formData, setFormData] = useState({
    currentPassword: '',
    newPassword: '',
    confirmPassword: ''
  })
  const [showPasswords, setShowPasswords] = useState({
    current: false,
    new: false,
    confirm: false
  })
  const [isLoading, setIsLoading] = useState(false)
  const [isModalOpen, setIsModalOpen] = useState(false)
  const [toast, setToast] = useState<ToastType | null>(null)

  const showToast = (toast: ToastType) => {
    setToast(toast)
    setTimeout(() => setToast(null), 4000)
  }

  const getPasswordStrength = (password: string): PasswordStrength => {
    const requirements = {
      length: password.length >= 8,
      uppercase: /[A-Z]/.test(password),
      lowercase: /[a-z]/.test(password),
      number: /\d/.test(password),
      special: /[!@#$%^&*(),.?":{}|<>]/.test(password)
    }

    const score = Object.values(requirements).filter(Boolean).length
    
    if (score < 2) {
      return { score: 20, label: 'Muy débil', color: 'bg-red-500', requirements }
    } else if (score < 3) {
      return { score: 40, label: 'Débil', color: 'bg-orange-500', requirements }
    } else if (score < 4) {
      return { score: 60, label: 'Regular', color: 'bg-yellow-500', requirements }
    } else if (score < 5) {
      return { score: 80, label: 'Buena', color: 'bg-blue-500', requirements }
    } else {
      return { score: 100, label: 'Muy fuerte', color: 'bg-green-500', requirements }
    }
  }

  const passwordStrength = getPasswordStrength(formData.newPassword)

  const handleInputChange = (field: string) => (e: ChangeEvent<HTMLInputElement>) => {
    setFormData(prev => ({
      ...prev,
      [field]: e.target.value
    }))
  }

  const togglePasswordVisibility = (field: keyof typeof showPasswords) => {
    setShowPasswords(prev => ({
      ...prev,
      [field]: !prev[field]
    }))
  }

  const validateForm = () => {
    if (!formData.currentPassword) {
      showToast({
        title: "Error",
        description: "Por favor, ingresa tu contraseña actual",
        type: "error"
      })
      return false
    }

    if (!formData.newPassword) {
      showToast({
        title: "Error",
        description: "Por favor, ingresa una nueva contraseña",
        type: "error"
      })
      return false
    }

    if (formData.newPassword !== formData.confirmPassword) {
      showToast({
        title: "Error",
        description: "Las contraseñas no coinciden",
        type: "error"
      })
      return false
    }

    if (passwordStrength.score < 60) {
      showToast({
        title: "Contraseña débil",
        description: "Tu nueva contraseña debe ser más segura",
        type: "error"
      })
      return false
    }

    return true
  }

  const handleSubmit = async () => {
    if (!validateForm()) return

    setIsLoading(true)
    setIsModalOpen(false)

    try {
      const response = await fetch('/api/auth/change-password', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        credentials: 'include',
        body: JSON.stringify({
          currentPassword: formData.currentPassword,
          newPassword: formData.newPassword,
        }),
      })

      const data = await response.json()

      if (data.success) {
        showToast({
          title: "✅ Contraseña actualizada",
          description: "Tu contraseña ha sido cambiada con éxito",
          type: "success"
        })

        // Limpiar formulario
        setFormData({
          currentPassword: '',
          newPassword: '',
          confirmPassword: ''
        })
      } else {
        showToast({
          title: "Error",
          description: data.error || "No se pudo actualizar la contraseña. Inténtalo de nuevo.",
          type: "error"
        })
      }
    } catch (error) {
      console.error('Error al cambiar contraseña:', error)
      showToast({
        title: "Error",
        description: "Error de conexión. Verifica tu conexión a internet e inténtalo de nuevo.",
        type: "error"
      })
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <div className="space-y-6">
      {/* Toast Notification */}
      {toast && (
  <div className={`fixed top-4 right-4 z-50 p-4 rounded-lg border shadow-lg ${
          toast.type === 'success' ? 'bg-green-50 border-green-200 text-green-800' :
          toast.type === 'error' ? 'bg-red-50 border-red-200 text-red-800' :
          'bg-yellow-50 border-yellow-200 text-yellow-800'
        }`}>
          <div className="flex items-start gap-3">
            {toast.type === 'success' && <FaCheckCircle className="h-5 w-5 text-green-600 mt-0.5" />}
            {toast.type === 'error' && <FaTimesCircle className="h-5 w-5 text-red-600 mt-0.5" />}
            {toast.type === 'warning' && <FaExclamationTriangle className="h-5 w-5 text-yellow-600 mt-0.5" />}
            <div>
              <h4 className="font-semibold">{toast.title}</h4>
              <p className="text-sm opacity-90">{toast.description}</p>
            </div>
            <button
              onClick={() => setToast(null)}
              className="ml-4 text-gray-400 hover:text-gray-600"
            >
              <FaTimesCircle className="h-4 w-4" />
            </button>
          </div>
        </div>
      )}

      {/* Contraseña Actual */}
      <div className="space-y-2">
        <label htmlFor="currentPassword" className="block text-sm font-medium text-gray-700 dark:text-gray-300">
          Contraseña actual
        </label>
        <div className="relative">
          <input
            id="currentPassword"
            type={showPasswords.current ? 'text' : 'password'}
            value={formData.currentPassword}
            onChange={handleInputChange('currentPassword')}
            placeholder="Ingresa tu contraseña actual"
            className="w-full px-3 py-2 pr-10 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent dark:bg-gray-800 dark:text-white"
          />
          <button
            type="button"
            className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600"
            onClick={() => togglePasswordVisibility('current')}
          >
            {showPasswords.current ? <FaEyeSlash className="h-4 w-4" /> : <FaEye className="h-4 w-4" />}
          </button>
        </div>
      </div>

      {/* Nueva Contraseña */}
      <div className="space-y-2">
        <label htmlFor="newPassword" className="block text-sm font-medium text-gray-700 dark:text-gray-300">
          Nueva contraseña
        </label>
        <div className="relative">
          <input
            id="newPassword"
            type={showPasswords.new ? 'text' : 'password'}
            value={formData.newPassword}
            onChange={handleInputChange('newPassword')}
            placeholder="Ingresa tu nueva contraseña"
            className="w-full px-3 py-2 pr-10 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent dark:bg-gray-800 dark:text-white"
          />
          <button
            type="button"
            className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600"
            onClick={() => togglePasswordVisibility('new')}
          >
            {showPasswords.new ? <FaEyeSlash className="h-4 w-4" /> : <FaEye className="h-4 w-4" />}
          </button>
        </div>

        {/* Barra de Fortaleza */}
        {formData.newPassword && (
          <div className="space-y-3">
            <div className="space-y-2">
              <div className="flex justify-between text-sm">
                <span className="text-gray-600 dark:text-gray-400">Fortaleza de contraseña:</span>
                <span className={`font-medium ${
                  passwordStrength.score >= 80 ? 'text-green-600' :
                  passwordStrength.score >= 60 ? 'text-yellow-600' :
                  'text-red-600'
                }`}>
                  {passwordStrength.label}
                </span>
              </div>
              <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-2">
                <div 
                  className={`h-2 rounded-full ${passwordStrength.color}`}
                  style={{ width: `${passwordStrength.score}%` }}
                />
              </div>
            </div>

            {/* Requisitos de contraseña */}
            <div className="space-y-1">
              <p className="text-xs text-gray-600 dark:text-gray-400">Requisitos:</p>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-1 text-xs">
                {[
                  { key: 'length', label: 'Al menos 8 caracteres' },
                  { key: 'uppercase', label: 'Una mayúscula' },
                  { key: 'lowercase', label: 'Una minúscula' },
                  { key: 'number', label: 'Un número' },
                  { key: 'special', label: 'Un símbolo especial' }
                ].map(req => (
                  <div key={req.key} className="flex items-center gap-1">
                    {passwordStrength.requirements[req.key as keyof typeof passwordStrength.requirements] ? (
                      <FaCheckCircle className="h-3 w-3 text-green-500" />
                    ) : (
                      <FaTimesCircle className="h-3 w-3 text-gray-400" />
                    )}
                    <span className={passwordStrength.requirements[req.key as keyof typeof passwordStrength.requirements] ? 'text-green-600' : 'text-gray-500'}>
                      {req.label}
                    </span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Confirmar Contraseña */}
      <div className="space-y-2">
        <label htmlFor="confirmPassword" className="block text-sm font-medium text-gray-700 dark:text-gray-300">
          Confirmar nueva contraseña
        </label>
        <div className="relative">
          <input
            id="confirmPassword"
            type={showPasswords.confirm ? 'text' : 'password'}
            value={formData.confirmPassword}
            onChange={handleInputChange('confirmPassword')}
            placeholder="Confirma tu nueva contraseña"
            className="w-full px-3 py-2 pr-10 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent dark:bg-gray-800 dark:text-white"
          />
          <button
            type="button"
            className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600"
            onClick={() => togglePasswordVisibility('confirm')}
          >
            {showPasswords.confirm ? <FaEyeSlash className="h-4 w-4" /> : <FaEye className="h-4 w-4" />}
          </button>
        </div>
        {formData.confirmPassword && formData.newPassword !== formData.confirmPassword && (
          <p className="text-sm text-red-600 flex items-center gap-1">
            <FaTimesCircle className="h-4 w-4" />
            Las contraseñas no coinciden
          </p>
        )}
      </div>

      {/* Botón de Guardar */}
      <button
        onClick={() => setIsModalOpen(true)}
        disabled={!formData.currentPassword || !formData.newPassword || !formData.confirmPassword || formData.newPassword !== formData.confirmPassword}
  className="w-full sm:w-auto px-6 py-2 bg-blue-600 hover:bg-blue-700 disabled:bg-gray-400 disabled:cursor-not-allowed text-white font-medium rounded-lg flex items-center gap-2"
      >
        <FaLock className="h-4 w-4" />
        Actualizar contraseña
      </button>

      {/* Modal de Confirmación */}
      {isModalOpen && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white dark:bg-gray-800 rounded-lg max-w-md w-full p-6">
            <div className="flex items-center gap-2 mb-4">
              <FaExclamationTriangle className="h-5 w-5 text-orange-500" />
              <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
                Confirmar cambio de contraseña
              </h3>
            </div>
            <p className="text-gray-600 dark:text-gray-400 mb-6">
              ¿Estás seguro de que quieres cambiar tu contraseña? Esta acción cerrará todas tus sesiones activas en otros dispositivos.
            </p>
            <div className="flex gap-3 justify-end">
              <button
                onClick={() => setIsModalOpen(false)}
                className="px-4 py-2 text-gray-600 hover:text-gray-800 dark:text-gray-400 dark:hover:text-gray-200"
              >
                Cancelar
              </button>
              <button
                onClick={handleSubmit}
                disabled={isLoading}
                className="px-6 py-2 bg-blue-600 hover:bg-blue-700 disabled:bg-blue-400 text-white rounded-lg"
              >
                {isLoading ? 'Actualizando...' : 'Confirmar cambio'}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Información adicional */}
      <div className="bg-blue-50 dark:bg-blue-900/20 p-4 rounded-lg border border-blue-200 dark:border-blue-800">
        <div className="flex items-start gap-3">
          <FaLock className="h-5 w-5 text-blue-600 dark:text-blue-400 mt-0.5" />
          <div>
            <h4 className="font-medium text-blue-900 dark:text-blue-200 mb-2">
              Consejos de seguridad
            </h4>
            <ul className="text-sm text-blue-700 dark:text-blue-300 space-y-1">
              <li>• Usa una contraseña única que no hayas usado antes</li>
              <li>• Combina letras, números y símbolos especiales</li>
              <li>• Evita información personal como fechas o nombres</li>
              <li>• Considera usar un gestor de contraseñas</li>
            </ul>
          </div>
        </div>
      </div>
    </div>
  )
}