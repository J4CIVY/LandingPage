'use client'

import { useState, useEffect } from 'react'
import { getCSRFToken } from '@/lib/csrf-client'
import { FaBell, FaEnvelope, FaMobile, FaCalendarCheck, FaGlobe, FaClock, FaCheckCircle, FaTimesCircle, FaExclamationTriangle, FaSpinner, FaWhatsapp } from 'react-icons/fa'

interface NotificationPreferences {
  email: {
    events: boolean;
    reminders: boolean;
    newsletter: boolean;
    adminNotifications: boolean;
    documentExpiry: boolean;
    emergencyAlerts: boolean;
  };
  whatsapp: {
    events: boolean;
    reminders: boolean;
    emergencyAlerts: boolean;
  };
  push: {
    events: boolean;
    reminders: boolean;
    emergencyAlerts: boolean;
  };
}

interface ToastType {
  title: string
  description: string
  type: 'success' | 'error' | 'warning'
}

export default function NotificationPreferencesSection() {
  const [notificationPreferences, setNotificationPreferences] = useState<NotificationPreferences>({
    email: {
      events: true,
      reminders: true,
      newsletter: false,
      adminNotifications: true,
      documentExpiry: true,
      emergencyAlerts: true
    },
    whatsapp: {
      events: false,
      reminders: false,
      emergencyAlerts: true
    },
    push: {
      events: false,
      reminders: false,
      emergencyAlerts: true
    }
  })
  
  const [selectedLanguage, setSelectedLanguage] = useState('es')
  const [selectedTimezone, setSelectedTimezone] = useState('America/Bogota')
  const [isLoading, setIsLoading] = useState(false)
  const [isLoadingData, setIsLoadingData] = useState(true)
  const [toast, setToast] = useState<ToastType | null>(null)

  // Cargar preferencias desde la API
  const loadPreferences = async () => {
    try {
      setIsLoadingData(true)
      const response = await fetch('/api/user/preferences')
      
      if (!response.ok) {
        console.error('Error al cargar preferencias')
        showToast({
          type: 'error',
          title: 'Error',
          description: 'Error al cargar preferencias'
        })
        return
      }
      
      const data = await response.json()
      const prefs = data.preferences
      
      setNotificationPreferences(prefs.notificationPreferences)
      setSelectedLanguage(prefs.language || 'es')
      setSelectedTimezone(prefs.timezone || 'America/Bogota')
    } catch (error) {
      console.error('Error cargando preferencias:', error)
      showToast({
        title: "Error",
        description: "No se pudieron cargar las preferencias",
        type: "error"
      })
    } finally {
      setIsLoadingData(false)
    }
  }

  // Cargar preferencias al montar el componente
  useEffect(() => {
    void loadPreferences()
  }, [])

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

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const updatePreferences = async (updates: any) => {
    const csrfToken = getCSRFToken()
    const response = await fetch('/api/user/preferences', {
      method: 'PATCH',
      headers: {
        'Content-Type': 'application/json',
        'x-csrf-token': csrfToken || '',
      },
      body: JSON.stringify(updates)
    })

    if (!response.ok) {
      const error = await response.json()
      throw new Error(error.error || 'Error al actualizar preferencias')
    }

    return await response.json()
  }

  const handleNotificationToggle = async (category: 'email' | 'whatsapp' | 'push', field: string) => {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const currentValue = (notificationPreferences[category] as any)[field]
    const newValue = !currentValue
    
    // Actualización optimista
    setNotificationPreferences(prev => ({
      ...prev,
      [category]: {
        ...prev[category],
        [field]: newValue
      }
    }))

    try {
      await updatePreferences({
        notificationPreferences: {
          ...notificationPreferences,
          [category]: {
            ...notificationPreferences[category],
            [field]: newValue
          }
        }
      })
      
      showToast({
        title: `Notificación ${newValue ? 'activada' : 'desactivada'}`,
        description: `La preferencia ha sido actualizada correctamente`,
        type: 'success'
      })
    } catch (error) {
      // Revertir cambio en caso de error
      setNotificationPreferences(prev => ({
        ...prev,
        [category]: {
          ...prev[category],
          [field]: currentValue
        }
      }))
      
      showToast({
        title: 'Error',
        description: error instanceof Error ? error.message : 'No se pudo guardar la configuración. Inténtalo de nuevo.',
        type: 'error'
      })
    }
  }

  const handleLanguageChange = async (languageCode: string) => {
    setIsLoading(true)
    const previousLanguage = selectedLanguage
    setSelectedLanguage(languageCode)

    try {
      await updatePreferences({ language: languageCode })
      
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
        description: error instanceof Error ? error.message : 'No se pudo cambiar el idioma. Inténtalo de nuevo.',
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
      await updatePreferences({ timezone })
      
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
        description: error instanceof Error ? error.message : 'No se pudo cambiar la zona horaria. Inténtalo de nuevo.',
        type: 'error'
      })
    } finally {
      setIsLoading(false)
    }
  }

  // Mostrar indicador de carga mientras se cargan los datos
  if (isLoadingData) {
    return (
      <div className="space-y-6">
        <div className="flex items-center justify-center py-12">
          <div className="flex flex-col items-center gap-3">
            <FaSpinner className="h-8 w-8 text-blue-600 animate-spin" />
            <p className="text-gray-600 dark:text-gray-400">Cargando preferencias...</p>
          </div>
        </div>
      </div>
    )
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
              aria-label="Cerrar notificación"
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
          {/* ========== EMAIL NOTIFICATIONS ========== */}
          
          {/* Email - Eventos */}
          <div className="flex items-center justify-between p-4 border border-gray-200 dark:border-gray-700 rounded-lg">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-blue-100 dark:bg-blue-900/30 rounded-lg">
                <FaEnvelope className="h-5 w-5 text-blue-600 dark:text-blue-400" />
              </div>
              <div>
                <h4 className="font-medium text-gray-900 dark:text-white">
                  Email - Notificaciones de eventos
                </h4>
                <p className="text-sm text-gray-600 dark:text-gray-400">
                  Recibe información sobre nuevos eventos
                </p>
              </div>
            </div>
            
            <label className="relative inline-flex items-center cursor-pointer">
              <input
                type="checkbox"
                checked={notificationPreferences.email.events}
                onChange={() => handleNotificationToggle('email', 'events')}
                className="sr-only peer"
                aria-label="Email - Notificaciones de eventos"
              />
              <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-blue-300 dark:peer-focus:ring-blue-800 rounded-full peer dark:bg-gray-700 peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-0.5 after:left-0.5 after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all dark:border-gray-600 peer-checked:bg-blue-600"></div>
            </label>
          </div>

          {/* Email - Recordatorios */}
          <div className="flex items-center justify-between p-4 border border-gray-200 dark:border-gray-700 rounded-lg">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-blue-100 dark:bg-blue-900/30 rounded-lg">
                <FaCalendarCheck className="h-5 w-5 text-blue-600 dark:text-blue-400" />
              </div>
              <div>
                <h4 className="font-medium text-gray-900 dark:text-white">
                  Email - Recordatorios
                </h4>
                <p className="text-sm text-gray-600 dark:text-gray-400">
                  Recordatorios de eventos próximos
                </p>
              </div>
            </div>
            
            <label className="relative inline-flex items-center cursor-pointer">
              <input
                type="checkbox"
                checked={notificationPreferences.email.reminders}
                onChange={() => handleNotificationToggle('email', 'reminders')}
                className="sr-only peer"
                aria-label="Email - Recordatorios"
              />
              <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-blue-300 dark:peer-focus:ring-blue-800 rounded-full peer dark:bg-gray-700 peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-0.5 after:left-0.5 after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all dark:border-gray-600 peer-checked:bg-blue-600"></div>
            </label>
          </div>

          {/* Email - Newsletter */}
          <div className="flex items-center justify-between p-4 border border-gray-200 dark:border-gray-700 rounded-lg">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-purple-100 dark:bg-purple-900/30 rounded-lg">
                <FaEnvelope className="h-5 w-5 text-purple-600 dark:text-purple-400" />
              </div>
              <div>
                <h4 className="font-medium text-gray-900 dark:text-white">
                  Email - Newsletter
                </h4>
                <p className="text-sm text-gray-600 dark:text-gray-400">
                  Recibe noticias y actualizaciones del club
                </p>
              </div>
            </div>
            
            <label className="relative inline-flex items-center cursor-pointer">
              <input
                type="checkbox"
                checked={notificationPreferences.email.newsletter}
                onChange={() => handleNotificationToggle('email', 'newsletter')}
                className="sr-only peer"
                aria-label="Email - Noticias y actualizaciones"
              />
              <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-blue-300 dark:peer-focus:ring-blue-800 rounded-full peer dark:bg-gray-700 peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-0.5 after:left-0.5 after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all dark:border-gray-600 peer-checked:bg-blue-600"></div>
            </label>
          </div>

          {/* Email - Notificaciones administrativas */}
          <div className="flex items-center justify-between p-4 border border-gray-200 dark:border-gray-700 rounded-lg">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-indigo-100 dark:bg-indigo-900/30 rounded-lg">
                <FaBell className="h-5 w-5 text-indigo-600 dark:text-indigo-400" />
              </div>
              <div>
                <h4 className="font-medium text-gray-900 dark:text-white">
                  Email - Notificaciones administrativas
                </h4>
                <p className="text-sm text-gray-600 dark:text-gray-400">
                  Avisos importantes de la administración
                </p>
              </div>
            </div>
            
            <label className="relative inline-flex items-center cursor-pointer">
              <input
                type="checkbox"
                checked={notificationPreferences.email.adminNotifications}
                onChange={() => handleNotificationToggle('email', 'adminNotifications')}
                className="sr-only peer"
                aria-label="Email - Notificaciones administrativas"
              />
              <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-blue-300 dark:peer-focus:ring-blue-800 rounded-full peer dark:bg-gray-700 peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-0.5 after:left-0.5 after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all dark:border-gray-600 peer-checked:bg-blue-600"></div>
            </label>
          </div>

          {/* Email - Vencimiento de documentos */}
          <div className="flex items-center justify-between p-4 border border-gray-200 dark:border-gray-700 rounded-lg">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-orange-100 dark:bg-orange-900/30 rounded-lg">
                <FaClock className="h-5 w-5 text-orange-600 dark:text-orange-400" />
              </div>
              <div>
                <h4 className="font-medium text-gray-900 dark:text-white">
                  Email - Vencimiento de documentos
                </h4>
                <p className="text-sm text-gray-600 dark:text-gray-400">
                  Alertas sobre documentos por vencer (SOAT, licencia, etc.)
                </p>
              </div>
            </div>
            
            <label className="relative inline-flex items-center cursor-pointer">
              <input
                type="checkbox"
                checked={notificationPreferences.email.documentExpiry}
                onChange={() => handleNotificationToggle('email', 'documentExpiry')}
                className="sr-only peer"
                aria-label="Email - Vencimiento de documentos"
              />
              <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-blue-300 dark:peer-focus:ring-blue-800 rounded-full peer dark:bg-gray-700 peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-0.5 after:left-0.5 after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all dark:border-gray-600 peer-checked:bg-blue-600"></div>
            </label>
          </div>

          {/* Email - Alertas de emergencia */}
          <div className="flex items-center justify-between p-4 border border-gray-200 dark:border-gray-700 rounded-lg bg-red-50 dark:bg-red-900/10">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-red-100 dark:bg-red-900/30 rounded-lg">
                <FaExclamationTriangle className="h-5 w-5 text-red-600 dark:text-red-400" />
              </div>
              <div>
                <h4 className="font-medium text-gray-900 dark:text-white">
                  Email - Alertas de emergencia
                </h4>
                <p className="text-sm text-gray-600 dark:text-gray-400">
                  Notificaciones urgentes de seguridad (Recomendado)
                </p>
              </div>
            </div>
            
            <label className="relative inline-flex items-center cursor-pointer">
              <input
                type="checkbox"
                checked={notificationPreferences.email.emergencyAlerts}
                onChange={() => handleNotificationToggle('email', 'emergencyAlerts')}
                className="sr-only peer"
                aria-label="Email - Alertas de emergencia"
              />
              <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-blue-300 dark:peer-focus:ring-blue-800 rounded-full peer dark:bg-gray-700 peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-0.5 after:left-0.5 after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all dark:border-gray-600 peer-checked:bg-blue-600"></div>
            </label>
          </div>

          {/* Separador */}
          <div className="my-6 border-t border-gray-200 dark:border-gray-700"></div>

          {/* ========== PUSH NOTIFICATIONS ========== */}

          {/* Push - Eventos */}
          <div className="flex items-center justify-between p-4 border border-gray-200 dark:border-gray-700 rounded-lg">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-green-100 dark:bg-green-900/30 rounded-lg">
                <FaMobile className="h-5 w-5 text-green-600 dark:text-green-400" />
              </div>
              <div>
                <h4 className="font-medium text-gray-900 dark:text-white">
                  Push - Notificaciones de eventos
                </h4>
                <p className="text-sm text-gray-600 dark:text-gray-400">
                  Notificaciones push sobre eventos
                </p>
              </div>
            </div>
            
            <label className="relative inline-flex items-center cursor-pointer">
              <input
                type="checkbox"
                checked={notificationPreferences.push.events}
                onChange={() => handleNotificationToggle('push', 'events')}
                className="sr-only peer"
                aria-label="Push - Notificaciones de eventos"
              />
              <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-blue-300 dark:peer-focus:ring-blue-800 rounded-full peer dark:bg-gray-700 peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-0.5 after:left-0.5 after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all dark:border-gray-600 peer-checked:bg-blue-600"></div>
            </label>
          </div>

          {/* Push - Recordatorios */}
          <div className="flex items-center justify-between p-4 border border-gray-200 dark:border-gray-700 rounded-lg">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-teal-100 dark:bg-teal-900/30 rounded-lg">
                <FaBell className="h-5 w-5 text-teal-600 dark:text-teal-400" />
              </div>
              <div>
                <h4 className="font-medium text-gray-900 dark:text-white">
                  Push - Recordatorios
                </h4>
                <p className="text-sm text-gray-600 dark:text-gray-400">
                  Recordatorios push de eventos próximos
                </p>
              </div>
            </div>
            
            <label className="relative inline-flex items-center cursor-pointer">
              <input
                type="checkbox"
                checked={notificationPreferences.push.reminders}
                onChange={() => handleNotificationToggle('push', 'reminders')}
                className="sr-only peer"
                aria-label="Push - Recordatorios"
              />
              <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-blue-300 dark:peer-focus:ring-blue-800 rounded-full peer dark:bg-gray-700 peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-0.5 after:left-0.5 after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all dark:border-gray-600 peer-checked:bg-blue-600"></div>
            </label>
          </div>

          {/* Push - Alertas de emergencia */}
          <div className="flex items-center justify-between p-4 border border-gray-200 dark:border-gray-700 rounded-lg bg-red-50 dark:bg-red-900/10">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-red-100 dark:bg-red-900/30 rounded-lg">
                <FaExclamationTriangle className="h-5 w-5 text-red-600 dark:text-red-400" />
              </div>
              <div>
                <h4 className="font-medium text-gray-900 dark:text-white">
                  Push - Alertas de emergencia
                </h4>
                <p className="text-sm text-gray-600 dark:text-gray-400">
                  Notificaciones push urgentes de seguridad (Recomendado)
                </p>
              </div>
            </div>
            
            <label className="relative inline-flex items-center cursor-pointer">
              <input
                type="checkbox"
                checked={notificationPreferences.push.emergencyAlerts}
                onChange={() => handleNotificationToggle('push', 'emergencyAlerts')}
                className="sr-only peer"
                aria-label="Push - Alertas de emergencia"
              />
              <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-blue-300 dark:peer-focus:ring-blue-800 rounded-full peer dark:bg-gray-700 peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-0.5 after:left-0.5 after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all dark:border-gray-600 peer-checked:bg-blue-600"></div>
            </label>
          </div>

          {/* Separador */}
          <div className="my-6 border-t border-gray-200 dark:border-gray-700"></div>

          {/* ========== WHATSAPP NOTIFICATIONS ========== */}

          {/* WhatsApp - Eventos */}
          <div className="flex items-center justify-between p-4 border border-gray-200 dark:border-gray-700 rounded-lg">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-green-100 dark:bg-green-900/30 rounded-lg">
                <FaWhatsapp className="h-5 w-5 text-green-600 dark:text-green-400" />
              </div>
              <div>
                <h4 className="font-medium text-gray-900 dark:text-white">
                  WhatsApp - Notificaciones de eventos
                </h4>
                <p className="text-sm text-gray-600 dark:text-gray-400">
                  Recibe información de eventos por WhatsApp
                </p>
              </div>
            </div>
            
            <label className="relative inline-flex items-center cursor-pointer">
              <input
                type="checkbox"
                checked={notificationPreferences.whatsapp.events}
                onChange={() => handleNotificationToggle('whatsapp', 'events')}
                className="sr-only peer"
                aria-label="WhatsApp - Notificaciones de eventos"
              />
              <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-blue-300 dark:peer-focus:ring-blue-800 rounded-full peer dark:bg-gray-700 peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-0.5 after:left-0.5 after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all dark:border-gray-600 peer-checked:bg-blue-600"></div>
            </label>
          </div>

          {/* WhatsApp - Recordatorios */}
          <div className="flex items-center justify-between p-4 border border-gray-200 dark:border-gray-700 rounded-lg">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-emerald-100 dark:bg-emerald-900/30 rounded-lg">
                <FaCalendarCheck className="h-5 w-5 text-emerald-600 dark:text-emerald-400" />
              </div>
              <div>
                <h4 className="font-medium text-gray-900 dark:text-white">
                  WhatsApp - Recordatorios
                </h4>
                <p className="text-sm text-gray-600 dark:text-gray-400">
                  Recordatorios de eventos por WhatsApp
                </p>
              </div>
            </div>
            
            <label className="relative inline-flex items-center cursor-pointer">
              <input
                type="checkbox"
                checked={notificationPreferences.whatsapp.reminders}
                onChange={() => handleNotificationToggle('whatsapp', 'reminders')}
                className="sr-only peer"
                aria-label="WhatsApp - Recordatorios"
              />
              <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-blue-300 dark:peer-focus:ring-blue-800 rounded-full peer dark:bg-gray-700 peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-0.5 after:left-0.5 after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all dark:border-gray-600 peer-checked:bg-blue-600"></div>
            </label>
          </div>

          {/* WhatsApp - Alertas de emergencia */}
          <div className="flex items-center justify-between p-4 border border-gray-200 dark:border-gray-700 rounded-lg bg-red-50 dark:bg-red-900/10">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-red-100 dark:bg-red-900/30 rounded-lg">
                <FaExclamationTriangle className="h-5 w-5 text-red-600 dark:text-red-400" />
              </div>
              <div>
                <h4 className="font-medium text-gray-900 dark:text-white">
                  WhatsApp - Alertas de emergencia
                </h4>
                <p className="text-sm text-gray-600 dark:text-gray-400">
                  Notificaciones urgentes por WhatsApp (Recomendado)
                </p>
              </div>
            </div>
            
            <label className="relative inline-flex items-center cursor-pointer">
              <input
                type="checkbox"
                checked={notificationPreferences.whatsapp.emergencyAlerts}
                onChange={() => handleNotificationToggle('whatsapp', 'emergencyAlerts')}
                className="sr-only peer"
                aria-label="WhatsApp - Alertas de emergencia"
              />
              <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-blue-300 dark:peer-focus:ring-blue-800 rounded-full peer dark:bg-gray-700 peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-0.5 after:left-0.5 after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all dark:border-gray-600 peer-checked:bg-blue-600"></div>
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
          <label htmlFor="notif-language" className="block text-sm font-medium text-gray-700 dark:text-gray-300">
            Selecciona tu idioma preferido
          </label>
          <select
            id="notif-language"
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
          <label htmlFor="notif-timezone" className="block text-sm font-medium text-gray-700 dark:text-gray-300">
            Selecciona tu zona horaria
          </label>
          <select
            id="notif-timezone"
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