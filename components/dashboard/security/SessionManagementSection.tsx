'use client'

import { useState, useEffect } from 'react'
import deviceService, { TrustedDevice } from '@/lib/services/device.service'
import { FaDesktop, FaMobile, FaTabletAlt, FaMapMarkerAlt, FaClock, FaSignOutAlt, FaCheckCircle, FaTimesCircle, FaExclamationTriangle, FaSpinner, FaShieldAlt } from 'react-icons/fa'

interface ToastType {
  title: string
  description: string
  type: 'success' | 'error' | 'warning'
}

export default function SessionManagementSection() {
  const [devices, setDevices] = useState<TrustedDevice[]>([])
  const [isTerminateAllModalOpen, setIsTerminateAllModalOpen] = useState(false)
  const [deviceToRevoke, setDeviceToRevoke] = useState<string | null>(null)
  const [isLoading, setIsLoading] = useState(false)
  const [isLoadingData, setIsLoadingData] = useState(true)
  const [toast, setToast] = useState<ToastType | null>(null)

  const showToast = (toast: ToastType) => {
    setToast(toast)
    setTimeout(() => setToast(null), 4000)
  }

  const loadDevices = async () => {
    try {
      setIsLoadingData(true)
      const data = await deviceService.list()
      setDevices(data)
    } catch (error) {
      console.error('Error cargando dispositivos:', error)
      showToast({
        title: "Error",
        description: error instanceof Error ? error.message : "No se pudieron cargar los dispositivos confiables",
        type: "error"
      })
    } finally {
      setIsLoadingData(false)
    }
  }

  const trustCurrentDevice = async () => {
    try {
      setIsLoading(true)
      const result = await deviceService.trust()
      showToast({
        title: "✅ Dispositivo confiable",
        description: result.message,
        type: "success"
      })
      await loadDevices()
    } catch (error) {
      showToast({
        title: "Error",
        description: error instanceof Error ? error.message : "No se pudo confiar en este dispositivo",
        type: "error"
      })
    } finally {
      setIsLoading(false)
    }
  }

  useEffect(() => {
    void loadDevices()
  }, [])

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

  const formatDate = (dateString: Date) => {
    const date = new Date(dateString)
    return date.toLocaleDateString('es-ES', { 
      year: 'numeric', 
      month: 'short', 
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    })
  }

  const handleRevokeDevice = async (deviceId: string) => {
    setIsLoading(true)
    try {
      await deviceService.revoke(deviceId)
      setDeviceToRevoke(null)
      await loadDevices()
      showToast({
        title: "✅ Dispositivo revocado",
        description: "El dispositivo ya no es confiable",
        type: "success"
      })
    } catch (error) {
      showToast({
        title: "Error",
        description: error instanceof Error ? error.message : "No se pudo revocar el dispositivo",
        type: "error"
      })
    } finally {
      setIsLoading(false)
    }
  }

  const handleRevokeAllDevices = async () => {
    setIsLoading(true)
    try {
      const result = await deviceService.revokeAll()
      await loadDevices()
      setIsTerminateAllModalOpen(false)
      showToast({
        title: "✅ Dispositivos revocados",
        description: `${result.revokedCount} dispositivo(s) revocados`,
        type: "success"
      })
    } catch (error) {
      showToast({
        title: "Error",
        description: error instanceof Error ? error.message : "No se pudieron revocar los dispositivos",
        type: "error"
      })
    } finally {
      setIsLoading(false)
    }
  }

  if (isLoadingData) {
    return (
      <div className="space-y-6">
        <div className="flex items-center justify-center py-12">
          <div className="flex flex-col items-center gap-3">
            <FaSpinner className="h-8 w-8 text-blue-600 animate-spin" />
            <p className="text-gray-600 dark:text-gray-400">Cargando dispositivos confiables...</p>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="space-y-6">
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
            <button onClick={() => setToast(null)} className="ml-4 text-gray-400 hover:text-gray-600" aria-label="Cerrar notificación">
              <FaTimesCircle className="h-4 w-4" />
            </button>
          </div>
        </div>
      )}

      <div className="bg-gradient-to-r from-blue-50 to-indigo-50 dark:from-blue-900/20 dark:to-indigo-900/20 p-6 rounded-lg border border-blue-200 dark:border-blue-800">
        <div className="flex items-center justify-between flex-wrap gap-4">
          <div>
            <h3 className="text-lg font-semibold text-blue-900 dark:text-blue-200 mb-2">Dispositivos Confiables</h3>
            <p className="text-sm text-blue-700 dark:text-blue-300">Los dispositivos confiables pueden omitir la verificación 2FA por 30 días</p>
          </div>
          <button onClick={trustCurrentDevice} disabled={isLoading} className="flex items-center gap-2 px-4 py-2 bg-blue-600 hover:bg-blue-700 disabled:bg-blue-400 text-white rounded-lg transition-colors">
            <FaShieldAlt className="h-4 w-4" />
            {isLoading ? 'Confiando...' : 'Confiar en este dispositivo'}
          </button>
        </div>
      </div>

      <div className="bg-gray-50 dark:bg-gray-900 p-4 rounded-lg border border-gray-200 dark:border-gray-700">
        <div className="flex items-center justify-between">
          <div>
            <h3 className="font-medium text-gray-900 dark:text-gray-200">Total de dispositivos: {devices.length}</h3>
            <p className="text-sm text-gray-600 dark:text-gray-400">
              {devices.length === 0 ? 'Ningún dispositivo confiable' : `${devices.length} dispositivo(s) pueden omitir 2FA`}
            </p>
          </div>
          {devices.length > 0 && (
            <button onClick={() => setIsTerminateAllModalOpen(true)} className="px-4 py-2 bg-red-600 hover:bg-red-700 text-white text-sm rounded-lg">
              Revocar todos
            </button>
          )}
        </div>
      </div>

      {devices.length === 0 ? (
        <div className="text-center py-12 border border-dashed border-gray-300 dark:border-gray-700 rounded-lg">
          <FaShieldAlt className="h-12 w-12 text-gray-400 mx-auto mb-3" />
          <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-2">No hay dispositivos confiables</h3>
          <p className="text-gray-600 dark:text-gray-400 mb-4">Confía en este dispositivo para omitir 2FA durante 30 días</p>
          <button onClick={trustCurrentDevice} disabled={isLoading} className="inline-flex items-center gap-2 px-4 py-2 bg-blue-600 hover:bg-blue-700 disabled:bg-blue-400 text-white rounded-lg transition-colors">
            <FaShieldAlt className="h-4 w-4" />
            {isLoading ? 'Confiando...' : 'Confiar en este dispositivo'}
          </button>
        </div>
      ) : (
        <div className="space-y-4">
          {devices.map((device) => (
            <div key={device._id} className="border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 rounded-lg p-4">
              <div className="flex items-start justify-between">
                <div className="flex items-start gap-3 flex-1">
                  <div className="p-2 rounded-lg bg-green-100 dark:bg-green-900/30 text-green-600 dark:text-green-400">
                    {getDeviceIcon(device.deviceType)}
                  </div>
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-1">
                      <h4 className="font-medium text-gray-900 dark:text-white">{device.browser} en {device.os}</h4>
                      <span className="px-2 py-1 bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-300 text-xs rounded-full">Confiable</span>
                    </div>
                    <div className="space-y-1 text-sm text-gray-600 dark:text-gray-400">
                      <div className="flex items-center gap-1">
                        <FaMapMarkerAlt className="h-3 w-3" />
                        <span>{device.city || 'Ubicación desconocida'}, {device.country || 'País desconocido'}</span>
                        <span className="text-gray-400">•</span>
                        <span className="font-mono text-xs">{device.ipAddress}</span>
                      </div>
                      <div className="flex items-center gap-1">
                        <FaClock className="h-3 w-3" />
                        <span>Última actividad: {formatDate(device.lastUsed)}</span>
                      </div>
                      <div className="flex items-center gap-1 text-orange-600 dark:text-orange-400">
                        <FaExclamationTriangle className="h-3 w-3" />
                        <span>Expira: {formatDate(device.expiresAt)}</span>
                      </div>
                    </div>
                  </div>
                </div>
                <button onClick={() => setDeviceToRevoke(device._id)} className="flex items-center gap-1 px-3 py-1 text-red-600 hover:text-red-700 hover:bg-red-50 dark:hover:bg-red-900/20 rounded-md text-sm">
                  <FaSignOutAlt className="h-3 w-3" />
                  Revocar
                </button>
              </div>
            </div>
          ))}
        </div>
      )}

      {deviceToRevoke && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white dark:bg-gray-800 rounded-lg max-w-md w-full p-6">
            <div className="flex items-center gap-2 mb-4">
              <FaExclamationTriangle className="h-5 w-5 text-orange-500" />
              <h3 className="text-lg font-semibold text-gray-900 dark:text-white">Revocar Dispositivo Confiable</h3>
            </div>
            <p className="text-gray-600 dark:text-gray-400 mb-6">
              ¿Estás seguro de que quieres revocar la confianza en este dispositivo? Tendrás que usar 2FA la próxima vez que inicies sesión desde él.
            </p>
            <div className="flex gap-3">
              <button onClick={() => setDeviceToRevoke(null)} className="flex-1 px-4 py-2 text-gray-600 hover:text-gray-800 dark:text-gray-400 dark:hover:text-gray-200">Cancelar</button>
              <button onClick={() => handleRevokeDevice(deviceToRevoke)} disabled={isLoading} className="flex-1 px-4 py-2 bg-red-600 hover:bg-red-700 disabled:bg-red-400 text-white rounded-lg">
                {isLoading ? 'Revocando...' : 'Revocar dispositivo'}
              </button>
            </div>
          </div>
        </div>
      )}

      {isTerminateAllModalOpen && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white dark:bg-gray-800 rounded-lg max-w-md w-full p-6">
            <div className="flex items-center gap-2 mb-4">
              <FaExclamationTriangle className="h-5 w-5 text-red-500" />
              <h3 className="text-lg font-semibold text-gray-900 dark:text-white">Revocar Todos los Dispositivos</h3>
            </div>
            <p className="text-gray-600 dark:text-gray-400 mb-6">
              ¿Estás seguro de que quieres revocar TODOS los dispositivos confiables? Tendrás que usar 2FA en todos los dispositivos.
            </p>
            <div className="bg-yellow-50 dark:bg-yellow-900/20 p-3 rounded-lg mb-4">
              <p className="text-sm text-yellow-700 dark:text-yellow-300">Se revocarán {devices.length} dispositivo(s) confiable(s).</p>
            </div>
            <div className="flex gap-3">
              <button onClick={() => setIsTerminateAllModalOpen(false)} className="flex-1 px-4 py-2 text-gray-600 hover:text-gray-800 dark:text-gray-400 dark:hover:text-gray-200">Cancelar</button>
              <button onClick={handleRevokeAllDevices} disabled={isLoading} className="flex-1 px-4 py-2 bg-red-600 hover:bg-red-700 disabled:bg-red-400 text-white rounded-lg transition-colors">
                {isLoading ? 'Revocando...' : 'Revocar todos'}
              </button>
            </div>
          </div>
        </div>
      )}

      <div className="bg-blue-50 dark:bg-blue-900/20 p-4 rounded-lg border border-blue-200 dark:border-blue-800">
        <div className="flex items-start gap-3">
          <FaShieldAlt className="h-5 w-5 text-blue-600 dark:text-blue-400 mt-0.5" />
          <div>
            <h4 className="font-medium text-blue-900 dark:text-blue-200 mb-2">Sobre los Dispositivos Confiables</h4>
            <ul className="text-sm text-blue-700 dark:text-blue-300 space-y-1">
              <li>• Los dispositivos confiables pueden omitir 2FA por 30 días</li>
              <li>• Revoca dispositivos que ya no uses o hayas vendido</li>
              <li>• Nunca confíes en dispositivos compartidos o públicos</li>
              <li>• Si cambias tu contraseña, todos los dispositivos serán revocados automáticamente</li>
            </ul>
          </div>
        </div>
      </div>
    </div>
  )
}
