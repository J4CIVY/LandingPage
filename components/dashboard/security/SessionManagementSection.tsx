'use client'

import { useState, useEffect } from 'react'
import apiClient from '@/lib/api-client'
import { FaDesktop, FaMobile, FaTabletAlt, FaMapMarkerAlt, FaClock, FaSignOutAlt, FaCheckCircle, FaTimesCircle, FaExclamationTriangle, FaSpinner } from 'react-icons/fa'

interface Session {
  id: string
  device: string
  deviceType: 'desktop' | 'mobile' | 'tablet'
  browser: string
  os: string
  location: string
  ip: string
  lastActive: string
  loginTime: string
  isCurrent: boolean
}

interface ToastType {
  title: string
  description: string
  type: 'success' | 'error' | 'warning'
}

export default function SessionManagementSection() {
  const [sessions, setSessions] = useState<Session[]>([])
  const [isTerminateAllModalOpen, setIsTerminateAllModalOpen] = useState(false)
  const [sessionToTerminate, setSessionToTerminate] = useState<string | null>(null)
  const [isLoading, setIsLoading] = useState(false)
  const [isLoadingData, setIsLoadingData] = useState(true)
  const [toast, setToast] = useState<ToastType | null>(null)

  // Cargar sesiones desde la API
  const loadSessions = async () => {
    try {
      setIsLoadingData(true)
      // NestJS: GET /users/sessions
      const data = await apiClient.get<{ sessions: Session[] }>('/users/sessions')
      setSessions(data.sessions || [])
    } catch (error) {
      console.error('Error cargando sesiones:', error)
      showToast({
        title: "Error",
        description: "No se pudieron cargar las sesiones activas",
        type: "error"
      })
    } finally {
      setIsLoadingData(false)
    }
  }

  // Cargar sesiones al montar el componente
  useEffect(() => {
    void loadSessions()
  }, [])

  const showToast = (toast: ToastType) => {
    setToast(toast)
    setTimeout(() => setToast(null), 4000)
  }

  const getDeviceIcon = (deviceType: string) => {
    switch (deviceType) {
      case 'mobile':
        return <FaMobile className="h-5 w-5" />
      case 'tablet':
        return <FaTabletAlt className="h-5 w-5" />
      default:
        return <FaDesktop className="h-5 w-5" />
    }
  }

  const formatLastActive = (dateString: string) => {
    const date = new Date(dateString)
    const now = new Date()
    const diffMs = now.getTime() - date.getTime()
    const diffHours = Math.floor(diffMs / (1000 * 60 * 60))
    const diffDays = Math.floor(diffHours / 24)

    if (diffHours < 1) {
      return 'Hace unos minutos'
    } else if (diffHours < 24) {
      return `Hace ${diffHours} hora${diffHours > 1 ? 's' : ''}`
    } else {
      return `Hace ${diffDays} día${diffDays > 1 ? 's' : ''}`
    }
  }

  const handleTerminateSession = async (sessionId: string) => {
    setIsLoading(true)
    
    try {
      const response = await apiClient.delete(`/users/sessions/${sessionId}`) as any;

      if (response.success) {
        showToast({
          title: "Éxito",
          description: 'Sesión cerrada exitosamente',
          type: "success"
        });
        // Recargar las sesiones
        await loadSessions();
      } else {
        showToast({
          title: "Error",
          description: response.error || 'Error al cerrar sesión',
          type: "error"
        });
      }
      setSessionToTerminate(null)
      
      showToast({
        title: "✅ Sesión cerrada",
        description: "La sesión ha sido terminada exitosamente",
        type: "success"
      })
    } catch (error) {
      showToast({
        title: "Error",
        description: error instanceof Error ? error.message : "No se pudo cerrar la sesión. Inténtalo de nuevo.",
        type: "error"
      })
    } finally {
      setIsLoading(false)
    }
  }

  const handleTerminateAllSessions = async () => {
    setIsLoading(true)
    
    try {
      // NestJS: POST /users/sessions/terminate-all
      const data = await apiClient.post<{ message: string }>('/users/sessions/terminate-all', {});
      
      // Recargar las sesiones
      await loadSessions()
      setIsTerminateAllModalOpen(false)
      
      showToast({
        title: "✅ Sesiones cerradas",
        description: data.message || "Todas las otras sesiones han sido terminadas",
        type: "success"
      })
    } catch (error) {
      showToast({
        title: "Error",
        description: error instanceof Error ? error.message : "No se pudieron cerrar todas las sesiones. Inténtalo de nuevo.",
        type: "error"
      })
    } finally {
      setIsLoading(false)
    }
  }

  const activeSessions = sessions.filter(s => !s.isCurrent)

  // Mostrar indicador de carga mientras se cargan los datos
  if (isLoadingData) {
    return (
      <div className="space-y-6">
        <div className="flex items-center justify-center py-12">
          <div className="flex flex-col items-center gap-3">
            <FaSpinner className="h-8 w-8 text-blue-600 animate-spin" />
            <p className="text-gray-600 dark:text-gray-400">Cargando sesiones activas...</p>
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

      {/* Resumen de sesiones */}
      <div className="bg-blue-50 dark:bg-blue-900/20 p-4 rounded-lg border border-blue-200 dark:border-blue-800">
        <div className="flex items-center justify-between">
          <div>
            <h3 className="font-medium text-blue-900 dark:text-blue-200">
              Sesiones Activas: {sessions.length}
            </h3>
            <p className="text-sm text-blue-700 dark:text-blue-300">
              {activeSessions.length} sesiones adicionales en otros dispositivos
            </p>
          </div>
          {activeSessions.length > 0 && (
            <button
              onClick={() => setIsTerminateAllModalOpen(true)}
              className="px-4 py-2 bg-red-600 hover:bg-red-700 text-white text-sm rounded-lg"
            >
              Cerrar todas las demás
            </button>
          )}
        </div>
      </div>

      {/* Lista de sesiones */}
      <div className="space-y-4">
        {sessions.map((session) => (
          <div
            key={session.id}
            className={`border rounded-lg p-4 ${
              session.isCurrent 
                ? 'border-green-200 bg-green-50 dark:border-green-800 dark:bg-green-900/20' 
                : 'border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800'
            }`}
          >
            <div className="flex items-start justify-between">
              <div className="flex items-start gap-3">
                <div className={`p-2 rounded-lg ${
                  session.isCurrent 
                    ? 'bg-green-100 dark:bg-green-900/30 text-green-600 dark:text-green-400' 
                    : 'bg-gray-100 dark:bg-gray-700 text-gray-600 dark:text-gray-400'
                }`}>
                  {getDeviceIcon(session.deviceType)}
                </div>
                
                <div className="flex-1">
                  <div className="flex items-center gap-2 mb-1">
                    <h4 className="font-medium text-gray-900 dark:text-white">
                      {session.device}
                    </h4>
                    {session.isCurrent && (
                      <span className="px-2 py-1 bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-300 text-xs rounded-full">
                        Sesión actual
                      </span>
                    )}
                  </div>
                  
                  <div className="space-y-1 text-sm text-gray-600 dark:text-gray-400">
                    <div className="flex items-center gap-1">
                      <FaDesktop className="h-3 w-3" />
                      <span>{session.browser}</span>
                      {session.os && (
                        <>
                          <span className="text-gray-400">•</span>
                          <span>{session.os}</span>
                        </>
                      )}
                    </div>
                    <div className="flex items-center gap-1">
                      <FaMapMarkerAlt className="h-3 w-3" />
                      <span>{session.location}</span>
                      <span className="text-gray-400">•</span>
                      <span className="font-mono text-xs">{session.ip}</span>
                    </div>
                    <div className="flex items-center gap-1">
                      <FaClock className="h-3 w-3" />
                      <span>{formatLastActive(session.lastActive)}</span>
                    </div>
                  </div>
                </div>
              </div>
              
              {!session.isCurrent && (
                <button
                  onClick={() => setSessionToTerminate(session.id)}
                  className="flex items-center gap-1 px-3 py-1 text-red-600 hover:text-red-700 hover:bg-red-50 dark:hover:bg-red-900/20 rounded-md text-sm"
                >
                  <FaSignOutAlt className="h-3 w-3" />
                  Cerrar sesión
                </button>
              )}
            </div>
          </div>
        ))}
      </div>

      {/* Modal de confirmación para cerrar sesión individual */}
      {sessionToTerminate && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white dark:bg-gray-800 rounded-lg max-w-md w-full p-6">
            <div className="flex items-center gap-2 mb-4">
              <FaExclamationTriangle className="h-5 w-5 text-orange-500" />
              <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
                Cerrar sesión
              </h3>
            </div>
            <p className="text-gray-600 dark:text-gray-400 mb-6">
              ¿Estás seguro de que quieres cerrar la sesión en este dispositivo? El usuario tendrá que iniciar sesión nuevamente.
            </p>
            <div className="flex gap-3">
              <button
                onClick={() => setSessionToTerminate(null)}
                className="flex-1 px-4 py-2 text-gray-600 hover:text-gray-800 dark:text-gray-400 dark:hover:text-gray-200"
              >
                Cancelar
              </button>
              <button
                onClick={() => handleTerminateSession(sessionToTerminate)}
                disabled={isLoading}
                className="flex-1 px-4 py-2 bg-red-600 hover:bg-red-700 disabled:bg-red-400 text-white rounded-lg"
              >
                {isLoading ? 'Cerrando...' : 'Cerrar sesión'}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Modal de confirmación para cerrar todas las sesiones */}
      {isTerminateAllModalOpen && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white dark:bg-gray-800 rounded-lg max-w-md w-full p-6">
            <div className="flex items-center gap-2 mb-4">
              <FaExclamationTriangle className="h-5 w-5 text-red-500" />
              <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
                Cerrar todas las sesiones
              </h3>
            </div>
            <p className="text-gray-600 dark:text-gray-400 mb-6">
              ¿Estás seguro de que quieres cerrar todas las demás sesiones? Esto cerrará la sesión en todos los otros dispositivos excepto el actual.
            </p>
            <div className="bg-yellow-50 dark:bg-yellow-900/20 p-3 rounded-lg mb-4">
              <p className="text-sm text-yellow-700 dark:text-yellow-300">
                Se cerrarán {activeSessions.length} sesiones activas en otros dispositivos.
              </p>
            </div>
            <div className="flex gap-3">
              <button
                onClick={() => setIsTerminateAllModalOpen(false)}
                className="flex-1 px-4 py-2 text-gray-600 hover:text-gray-800 dark:text-gray-400 dark:hover:text-gray-200"
              >
                Cancelar
              </button>
              <button
                onClick={handleTerminateAllSessions}
                disabled={isLoading}
                className="flex-1 px-4 py-2 bg-red-600 hover:bg-red-700 disabled:bg-red-400 text-white rounded-lg transition-colors"
              >
                {isLoading ? 'Cerrando...' : 'Cerrar todas'}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Información de seguridad */}
      <div className="bg-gray-50 dark:bg-gray-900 p-4 rounded-lg border border-gray-200 dark:border-gray-700">
        <div className="flex items-start gap-3">
          <FaCheckCircle className="h-5 w-5 text-blue-600 dark:text-blue-400 mt-0.5" />
          <div>
            <h4 className="font-medium text-gray-900 dark:text-white mb-2">
              Consejos de seguridad para sesiones
            </h4>
            <ul className="text-sm text-gray-600 dark:text-gray-400 space-y-1">
              <li>• Revisa regularmente tus sesiones activas</li>
              <li>• Cierra sesiones en dispositivos que ya no uses</li>
              <li>• Si ves actividad sospechosa, cambia tu contraseña inmediatamente</li>
              <li>• Nunca dejes sesiones abiertas en computadoras públicas</li>
            </ul>
          </div>
        </div>
      </div>
    </div>
  )
}
