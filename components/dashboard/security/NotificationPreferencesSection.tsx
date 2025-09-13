'use client'

import { useState } from 'react'
import { FaBell, FaEnvelope, FaMobile, FaCalendarCheck, FaGlobe, FaClock, FaCheckCircle, FaTimesCircle, FaExclamationTriangle } from 'react-icons/fa'

interface NotificationSettings {
  email: boolean
  push: boolean
  eventReminders: boolean
}

interface ToastType {
  title: string
  description: string
  type: 'success' | 'error' | 'warning'
}

export default function NotificationPreferencesSection() {
  const [notifications, setNotifications] = useState<NotificationSettings>({
    email: true,
    push: false,
    eventReminders: true
  })
  
  const [selectedLanguage, setSelectedLanguage] = useState('es')
  const [selectedTimezone, setSelectedTimezone] = useState('America/Bogota')
  const [isLoading, setIsLoading] = useState(false)
  const [toast, setToast] = useState<ToastType | null>(null)

  const showToast = (toast: ToastType) => {
    setToast(toast)
    setTimeout(() => setToast(null), 4000)
  }

  const languages = [
    { code: 'es', name: 'Español', flag: '🇪🇸' },
    { code: 'en', name: 'English', flag: '🇺🇸' },
    { code: 'pt', name: 'Português', flag: '🇧🇷' },
    { code: 'fr', name: 'Français', flag: '🇫🇷' }
  ]

  const timezones = [
    { value: 'America/Bogota', label: 'Bogotá (GMT-5)', country: 'Colombia' },
    { value: 'America/Caracas', label: 'Caracas (GMT-4)', country: 'Venezuela' },
    { value: 'America/Lima', label: 'Lima (GMT-5)', country: 'Perú' },
    { value: 'America/Quito', label: 'Quito (GMT-5)', country: 'Ecuador' },
    { value: 'America/Mexico_City', label: 'Ciudad de México (GMT-6)', country: 'México' },
    { value: 'America/New_York', label: 'Nueva York (GMT-5)', country: 'Estados Unidos' },
    { value: 'Europe/Madrid', label: 'Madrid (GMT+1)', country: 'España' }
  ]

  const handleNotificationToggle = async (type: keyof NotificationSettings) => {
    const newValue = !notifications[type]
    
    setNotifications(prev => ({
      ...prev,
      [type]: newValue
    }))

    // Simulación de guardado
    try {
      await new Promise(resolve => setTimeout(resolve, 500))
      
      const notificationLabels = {
        email: 'Notificaciones por correo',
        push: 'Notificaciones push',
        eventReminders: 'Recordatorios de eventos'
      }
      
      showToast({
        title: `${notificationLabels[type]} ${newValue ? 'activadas' : 'desactivadas'}`,
        description: `Las ${notificationLabels[type].toLowerCase()} han sido ${newValue ? 'activadas' : 'desactivadas'} correctamente`,
        type: 'success'
      })
    } catch (error) {
      // Revertir cambio en caso de error
      setNotifications(prev => ({
        ...prev,
        [type]: !newValue
      }))
      
      showToast({
        title: 'Error',
        description: 'No se pudo guardar la configuración. Inténtalo de nuevo.',
        type: 'error'
      })
    }
  }

  const handleLanguageChange = async (languageCode: string) => {
    setIsLoading(true)
    const previousLanguage = selectedLanguage
    setSelectedLanguage(languageCode)

    try {
      // Simulación de cambio de idioma
      await new Promise(resolve => setTimeout(resolve, 1000))
      
      const selectedLang = languages.find(lang => lang.code === languageCode)
      showToast({
        title: 'Idioma actualizado',
        description: `El idioma ha sido cambiado a ${selectedLang?.name}`,
        type: 'success'
      })
    } catch (error) {
      setSelectedLanguage(previousLanguage)
      showToast({
        title: 'Error',
        description: 'No se pudo cambiar el idioma. Inténtalo de nuevo.',
        type: 'error'
      })
    } finally {
      setIsLoading(false)
    }
  }

  const handleTimezoneChange = async (timezone: string) => {
    setIsLoading(true)
    const previousTimezone = selectedTimezone
    setSelectedTimezone(timezone)

    try {
      // Simulación de cambio de zona horaria
      await new Promise(resolve => setTimeout(resolve, 1000))
      
      const selectedTz = timezones.find(tz => tz.value === timezone)
      showToast({
        title: 'Zona horaria actualizada',
        description: `La zona horaria ha sido cambiada a ${selectedTz?.label}`,
        type: 'success'
      })
    } catch (error) {
      setSelectedTimezone(previousTimezone)
      showToast({
        title: 'Error',
        description: 'No se pudo cambiar la zona horaria. Inténtalo de nuevo.',
        type: 'error'
      })
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <div className="space-y-6">
      {/* Toast Notification */}
      {toast && (
        <div className={`fixed top-4 right-4 z-50 p-4 rounded-lg border shadow-lg transition-all duration-300 ${
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

      {/* Configuración de Notificaciones */}
      <div className="border border-gray-200 dark:border-gray-700 rounded-lg p-6">
        <div className="flex items-center gap-2 mb-4">
          <FaBell className="h-5 w-5 text-blue-600 dark:text-blue-400" />
          <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
            Notificaciones
          </h3>
        </div>
        
        <div className="space-y-4">
          {/* Notificaciones por correo */}
          <div className="flex items-center justify-between p-4 border border-gray-200 dark:border-gray-700 rounded-lg">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-blue-100 dark:bg-blue-900/30 rounded-lg">
                <FaEnvelope className="h-5 w-5 text-blue-600 dark:text-blue-400" />
              </div>
              <div>
                <h4 className="font-medium text-gray-900 dark:text-white">
                  Notificaciones por correo
                </h4>
                <p className="text-sm text-gray-600 dark:text-gray-400">
                  Recibe actualizaciones importantes por email
                </p>
              </div>
            </div>
            
            <label className="relative inline-flex items-center cursor-pointer">
              <input
                type="checkbox"
                checked={notifications.email}
                onChange={() => handleNotificationToggle('email')}
                className="sr-only peer"
              />
              <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-blue-300 dark:peer-focus:ring-blue-800 rounded-full peer dark:bg-gray-700 peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all dark:border-gray-600 peer-checked:bg-blue-600"></div>
            </label>
          </div>

          {/* Notificaciones push */}
          <div className="flex items-center justify-between p-4 border border-gray-200 dark:border-gray-700 rounded-lg">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-green-100 dark:bg-green-900/30 rounded-lg">
                <FaMobile className="h-5 w-5 text-green-600 dark:text-green-400" />
              </div>
              <div>
                <h4 className="font-medium text-gray-900 dark:text-white">
                  Notificaciones push
                </h4>
                <p className="text-sm text-gray-600 dark:text-gray-400">
                  Recibe notificaciones en tiempo real en tu dispositivo
                </p>
              </div>
            </div>
            
            <label className="relative inline-flex items-center cursor-pointer">
              <input
                type="checkbox"
                checked={notifications.push}
                onChange={() => handleNotificationToggle('push')}
                className="sr-only peer"
              />
              <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-blue-300 dark:peer-focus:ring-blue-800 rounded-full peer dark:bg-gray-700 peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all dark:border-gray-600 peer-checked:bg-blue-600"></div>
            </label>
          </div>

          {/* Recordatorios de eventos */}
          <div className="flex items-center justify-between p-4 border border-gray-200 dark:border-gray-700 rounded-lg">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-orange-100 dark:bg-orange-900/30 rounded-lg">
                <FaCalendarCheck className="h-5 w-5 text-orange-600 dark:text-orange-400" />
              </div>
              <div>
                <h4 className="font-medium text-gray-900 dark:text-white">
                  Recordatorios de eventos
                </h4>
                <p className="text-sm text-gray-600 dark:text-gray-400">
                  Recibe recordatorios antes de eventos y actividades
                </p>
              </div>
            </div>
            
            <label className="relative inline-flex items-center cursor-pointer">
              <input
                type="checkbox"
                checked={notifications.eventReminders}
                onChange={() => handleNotificationToggle('eventReminders')}
                className="sr-only peer"
              />
              <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-blue-300 dark:peer-focus:ring-blue-800 rounded-full peer dark:bg-gray-700 peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all dark:border-gray-600 peer-checked:bg-blue-600"></div>
            </label>
          </div>
        </div>
      </div>

      {/* Configuración de Idioma */}
      <div className="border border-gray-200 dark:border-gray-700 rounded-lg p-6">
        <div className="flex items-center gap-2 mb-4">
          <FaGlobe className="h-5 w-5 text-green-600 dark:text-green-400" />
          <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
            Idioma
          </h3>
        </div>
        
        <div className="space-y-3">
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">
            Selecciona tu idioma preferido
          </label>
          <select
            value={selectedLanguage}
            onChange={(e) => handleLanguageChange(e.target.value)}
            disabled={isLoading}
            className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent dark:bg-gray-800 dark:text-white disabled:opacity-50"
          >
            {languages.map((language) => (
              <option key={language.code} value={language.code}>
                {language.flag} {language.name}
              </option>
            ))}
          </select>
          {isLoading && (
            <p className="text-sm text-blue-600 dark:text-blue-400">
              Actualizando idioma...
            </p>
          )}
        </div>
      </div>

      {/* Configuración de Zona Horaria */}
      <div className="border border-gray-200 dark:border-gray-700 rounded-lg p-6">
        <div className="flex items-center gap-2 mb-4">
          <FaClock className="h-5 w-5 text-purple-600 dark:text-purple-400" />
          <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
            Zona Horaria
          </h3>
        </div>
        
        <div className="space-y-3">
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">
            Selecciona tu zona horaria
          </label>
          <select
            value={selectedTimezone}
            onChange={(e) => handleTimezoneChange(e.target.value)}
            disabled={isLoading}
            className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent dark:bg-gray-800 dark:text-white disabled:opacity-50"
          >
            {timezones.map((timezone) => (
              <option key={timezone.value} value={timezone.value}>
                {timezone.label} - {timezone.country}
              </option>
            ))}
          </select>
          {isLoading && (
            <p className="text-sm text-blue-600 dark:text-blue-400">
              Actualizando zona horaria...
            </p>
          )}
          
          <div className="bg-gray-50 dark:bg-gray-900 p-3 rounded-lg">
            <p className="text-sm text-gray-600 dark:text-gray-400">
              <strong>Hora actual:</strong> {new Date().toLocaleString('es-ES', { 
                timeZone: selectedTimezone,
                dateStyle: 'full',
                timeStyle: 'short'
              })}
            </p>
          </div>
        </div>
      </div>

      {/* Información adicional */}
      <div className="bg-blue-50 dark:bg-blue-900/20 p-4 rounded-lg border border-blue-200 dark:border-blue-800">
        <div className="flex items-start gap-3">
          <FaCheckCircle className="h-5 w-5 text-blue-600 dark:text-blue-400 mt-0.5" />
          <div>
            <h4 className="font-medium text-blue-900 dark:text-blue-200 mb-2">
              Sobre las notificaciones
            </h4>
            <ul className="text-sm text-blue-700 dark:text-blue-300 space-y-1">
              <li>• Las notificaciones por correo incluyen actualizaciones importantes y eventos</li>
              <li>• Las notificaciones push requieren permisos del navegador</li>
              <li>• Los recordatorios de eventos se envían 1 hora antes del evento</li>
              <li>• Puedes cambiar estas configuraciones en cualquier momento</li>
            </ul>
          </div>
        </div>
      </div>
    </div>
  )
}