'use client'

import { useState, useEffect } from 'react'
import { FaEye, FaUser, FaTrophy, FaImage, FaDownload, FaTrash, FaLock, FaCheckCircle, FaTimesCircle, FaExclamationTriangle, FaShieldAlt } from 'react-icons/fa'

interface PrivacySettings {
  showName: boolean
  showPhoto: boolean
  showPoints: boolean
  showActivity: boolean
}

interface ToastType {
  title: string
  description: string
  type: 'success' | 'error' | 'warning'
}

export default function PrivacyControlSection() {
  const [privacySettings, setPrivacySettings] = useState<PrivacySettings>({
    showName: true,
    showPhoto: true,
    showPoints: false,
    showActivity: true
  })
  
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false)
  const [deleteConfirmText, setDeleteConfirmText] = useState('')
  const [deletePassword, setDeletePassword] = useState('')
  const [isLoading, setIsLoading] = useState(false)
  const [isLoadingSettings, setIsLoadingSettings] = useState(true)
  const [toast, setToast] = useState<ToastType | null>(null)

  // Cargar preferencias de privacidad al montar el componente
  useEffect(() => {
    loadPrivacySettings()
  }, [])

  const loadPrivacySettings = async () => {
    try {
      setIsLoadingSettings(true)
      const response = await fetch('/api/user/privacy')
      
      if (!response.ok) {
        throw new Error('Error al cargar preferencias')
      }

      const data = await response.json()
      
      if (data.success && data.privacySettings) {
        setPrivacySettings(data.privacySettings)
      }
    } catch (error) {
      console.error('Error cargando preferencias:', error)
      showToast({
        title: 'Error',
        description: 'No se pudieron cargar las preferencias de privacidad',
        type: 'error'
      })
    } finally {
      setIsLoadingSettings(false)
    }
  }

  const showToast = (toast: ToastType) => {
    setToast(toast)
    setTimeout(() => setToast(null), 4000)
  }

  const handlePrivacyToggle = async (setting: keyof PrivacySettings) => {
    const newValue = !privacySettings[setting]
    const previousValue = privacySettings[setting]
    
    // Actualizar UI optimísticamente
    setPrivacySettings(prev => ({
      ...prev,
      [setting]: newValue
    }))

    try {
      const response = await fetch('/api/user/privacy', {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          [setting]: newValue
        })
      })

      if (!response.ok) {
        throw new Error('Error al guardar preferencia')
      }

      const data = await response.json()
      
      if (data.success) {
        const settingLabels = {
          showName: 'Mostrar nombre',
          showPhoto: 'Mostrar foto de perfil',
          showPoints: 'Mostrar puntos',
          showActivity: 'Mostrar actividad'
        }
        
        showToast({
          title: 'Configuración actualizada',
          description: `${settingLabels[setting]} ${newValue ? 'activado' : 'desactivado'} en la comunidad`,
          type: 'success'
        })
      }
    } catch (error) {
      // Revertir cambio en caso de error
      setPrivacySettings(prev => ({
        ...prev,
        [setting]: previousValue
      }))
      
      showToast({
        title: 'Error',
        description: 'No se pudo guardar la configuración. Inténtalo de nuevo.',
        type: 'error'
      })
    }
  }

  const handleDownloadData = async () => {
    setIsLoading(true)
    
    try {
      const response = await fetch('/api/user/download-data')
      
      if (!response.ok) {
        throw new Error('Error al descargar datos')
      }

      // Obtener el blob del response
      const blob = await response.blob()
      
      // Crear URL temporal para el blob
      const url = window.URL.createObjectURL(blob)
      
      // Crear elemento <a> para descargar
      const a = document.createElement('a')
      a.href = url
      a.download = `bskmt-datos-personales-${new Date().getTime()}.json`
      document.body.appendChild(a)
      a.click()
      
      // Limpiar
      window.URL.revokeObjectURL(url)
      document.body.removeChild(a)

      showToast({
        title: '✅ Datos descargados',
        description: 'Tus datos personales han sido descargados exitosamente',
        type: 'success'
      })
    } catch (error) {
      console.error('Error descargando datos:', error)
      showToast({
        title: 'Error',
        description: 'No se pudieron descargar los datos. Inténtalo de nuevo.',
        type: 'error'
      })
    } finally {
      setIsLoading(false)
    }
  }

  const handleDeleteAccount = async () => {
    if (deleteConfirmText !== 'eliminar-cuenta') {
      showToast({
        title: 'Confirmación incorrecta',
        description: 'Debes escribir "eliminar-cuenta" para confirmar',
        type: 'error'
      })
      return
    }

    if (!deletePassword) {
      showToast({
        title: 'Contraseña requerida',
        description: 'Debes ingresar tu contraseña para confirmar',
        type: 'error'
      })
      return
    }

    setIsLoading(true)
    
    try {
      const response = await fetch('/api/user/delete-account', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          password: deletePassword,
          confirmText: 'eliminar-cuenta'
        })
      })

      const data = await response.json()

      if (!response.ok) {
        throw new Error(data.error || 'Error al eliminar cuenta')
      }
      
      if (data.success) {
        showToast({
          title: '⚠️ Cuenta programada para eliminación',
          description: data.data.info || 'Tu cuenta será eliminada en 30 días. Recibirás un email de confirmación.',
          type: 'warning'
        })
        
        setIsDeleteModalOpen(false)
        setDeleteConfirmText('')
        setDeletePassword('')
        
        // Redirigir al login después de 3 segundos
        setTimeout(() => {
          window.location.href = '/login?message=account-deletion-scheduled'
        }, 3000)
      }
    } catch (error: any) {
      console.error('Error eliminando cuenta:', error)
      showToast({
        title: 'Error',
        description: error.message || 'No se pudo procesar la eliminación. Inténtalo de nuevo.',
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
  <div className={`fixed top-4 right-4 z-50 p-4 rounded-lg border shadow-lg ${
          toast.type === 'success' ? 'bg-green-50 border-green-200 text-green-800 dark:bg-green-900/30 dark:border-green-800 dark:text-green-200' :
          toast.type === 'error' ? 'bg-red-50 border-red-200 text-red-800 dark:bg-red-900/30 dark:border-red-800 dark:text-red-200' :
          'bg-yellow-50 border-yellow-200 text-yellow-800 dark:bg-yellow-900/30 dark:border-yellow-800 dark:text-yellow-200'
        }`}>
          <div className="flex items-start gap-3">
            {toast.type === 'success' && <FaCheckCircle className="h-5 w-5 text-green-600 dark:text-green-400 mt-0.5" />}
            {toast.type === 'error' && <FaTimesCircle className="h-5 w-5 text-red-600 dark:text-red-400 mt-0.5" />}
            {toast.type === 'warning' && <FaExclamationTriangle className="h-5 w-5 text-yellow-600 dark:text-yellow-400 mt-0.5" />}
            <div>
              <h4 className="font-semibold">{toast.title}</h4>
              <p className="text-sm opacity-90">{toast.description}</p>
            </div>
            <button
              onClick={() => setToast(null)}
              className="ml-4 text-gray-400 hover:text-gray-600 dark:text-gray-500 dark:hover:text-gray-300"
            >
              <FaTimesCircle className="h-4 w-4" />
            </button>
          </div>
        </div>
      )}

      {/* Indicador de carga */}
      {isLoadingSettings && (
        <div className="flex items-center justify-center p-8">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
          <span className="ml-3 text-gray-600 dark:text-gray-400">Cargando preferencias...</span>
        </div>
      )}

      {!isLoadingSettings && (
        <>
      {/* Configuración de Visibilidad en la Comunidad */}
      <div className="border border-gray-200 dark:border-gray-700 rounded-lg p-6">
        <div className="flex items-center gap-2 mb-4">
          <FaEye className="h-5 w-5 text-blue-600 dark:text-blue-400" />
          <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
            Visibilidad en la Comunidad
          </h3>
        </div>
        
        <p className="text-sm text-gray-600 dark:text-gray-400 mb-6">
          Controla qué información tuya pueden ver otros miembros de la comunidad BSK MT
        </p>
        
        <div className="space-y-4">
          {/* Mostrar nombre */}
          <div className="flex items-center justify-between p-4 border border-gray-200 dark:border-gray-700 rounded-lg">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-blue-100 dark:bg-blue-900/30 rounded-lg">
                <FaUser className="h-5 w-5 text-blue-600 dark:text-blue-400" />
              </div>
              <div>
                <h4 className="font-medium text-gray-900 dark:text-white">
                  Mostrar nombre completo
                </h4>
                <p className="text-sm text-gray-600 dark:text-gray-400">
                  Otros miembros podrán ver tu nombre real
                </p>
              </div>
            </div>
            
            <label className="relative inline-flex items-center cursor-pointer">
              <input
                type="checkbox"
                checked={privacySettings.showName}
                onChange={() => handlePrivacyToggle('showName')}
                className="sr-only peer"
              />
              <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-blue-300 dark:peer-focus:ring-blue-800 rounded-full peer dark:bg-gray-700 peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all dark:border-gray-600 peer-checked:bg-blue-600"></div>
            </label>
          </div>

          {/* Mostrar foto */}
          <div className="flex items-center justify-between p-4 border border-gray-200 dark:border-gray-700 rounded-lg">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-green-100 dark:bg-green-900/30 rounded-lg">
                <FaImage className="h-5 w-5 text-green-600 dark:text-green-400" />
              </div>
              <div>
                <h4 className="font-medium text-gray-900 dark:text-white">
                  Mostrar foto de perfil
                </h4>
                <p className="text-sm text-gray-600 dark:text-gray-400">
                  Otros miembros podrán ver tu foto de perfil
                </p>
              </div>
            </div>
            
            <label className="relative inline-flex items-center cursor-pointer">
              <input
                type="checkbox"
                checked={privacySettings.showPhoto}
                onChange={() => handlePrivacyToggle('showPhoto')}
                className="sr-only peer"
              />
              <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-blue-300 dark:peer-focus:ring-blue-800 rounded-full peer dark:bg-gray-700 peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all dark:border-gray-600 peer-checked:bg-blue-600"></div>
            </label>
          </div>

          {/* Mostrar puntos */}
          <div className="flex items-center justify-between p-4 border border-gray-200 dark:border-gray-700 rounded-lg">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-yellow-100 dark:bg-yellow-900/30 rounded-lg">
                <FaTrophy className="h-5 w-5 text-yellow-600 dark:text-yellow-400" />
              </div>
              <div>
                <h4 className="font-medium text-gray-900 dark:text-white">
                  Mostrar puntos acumulados
                </h4>
                <p className="text-sm text-gray-600 dark:text-gray-400">
                  Otros miembros podrán ver tu puntaje total
                </p>
              </div>
            </div>
            
            <label className="relative inline-flex items-center cursor-pointer">
              <input
                type="checkbox"
                checked={privacySettings.showPoints}
                onChange={() => handlePrivacyToggle('showPoints')}
                className="sr-only peer"
              />
              <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-blue-300 dark:peer-focus:ring-blue-800 rounded-full peer dark:bg-gray-700 peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all dark:border-gray-600 peer-checked:bg-blue-600"></div>
            </label>
          </div>

          {/* Mostrar actividad */}
          <div className="flex items-center justify-between p-4 border border-gray-200 dark:border-gray-700 rounded-lg">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-purple-100 dark:bg-purple-900/30 rounded-lg">
                <FaCheckCircle className="h-5 w-5 text-purple-600 dark:text-purple-400" />
              </div>
              <div>
                <h4 className="font-medium text-gray-900 dark:text-white">
                  Mostrar actividad reciente
                </h4>
                <p className="text-sm text-gray-600 dark:text-gray-400">
                  Otros miembros podrán ver tu actividad en eventos
                </p>
              </div>
            </div>
            
            <label className="relative inline-flex items-center cursor-pointer">
              <input
                type="checkbox"
                checked={privacySettings.showActivity}
                onChange={() => handlePrivacyToggle('showActivity')}
                className="sr-only peer"
              />
              <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-blue-300 dark:peer-focus:ring-blue-800 rounded-full peer dark:bg-gray-700 peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all dark:border-gray-600 peer-checked:bg-blue-600"></div>
            </label>
          </div>
        </div>
      </div>

      {/* Control de Datos Personales */}
      <div className="border border-gray-200 dark:border-gray-700 rounded-lg p-6">
        <div className="flex items-center gap-2 mb-4">
          <FaShieldAlt className="h-5 w-5 text-green-600 dark:text-green-400" />
          <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
            Control de Datos Personales
          </h3>
        </div>
        
        <div className="space-y-4">
          {/* Descargar datos */}
          <div className="p-4 border border-gray-200 dark:border-gray-700 rounded-lg">
            <div className="flex items-start justify-between">
              <div className="flex-1">
                <h4 className="font-medium text-gray-900 dark:text-white mb-2">
                  Descargar mis datos
                </h4>
                <p className="text-sm text-gray-600 dark:text-gray-400 mb-4">
                  Descarga una copia de todos tus datos personales almacenados en nuestra plataforma, 
                  incluyendo perfil, actividad, puntos y configuraciones.
                </p>
                <ul className="text-xs text-gray-500 dark:text-gray-400 mb-4 space-y-1">
                  <li>• Información de perfil y contacto</li>
                  <li>• Historial de actividades y eventos</li>
                  <li>• Puntos acumulados y transacciones</li>
                  <li>• Configuraciones y preferencias</li>
                </ul>
              </div>
            </div>
            <button
              onClick={handleDownloadData}
              disabled={isLoading}
              className="w-full sm:w-auto flex items-center gap-2 px-4 py-2 bg-blue-600 hover:bg-blue-700 disabled:bg-blue-400 text-white rounded-lg"
            >
              <FaDownload className="h-4 w-4" />
              {isLoading ? 'Generando archivo...' : 'Descargar datos personales'}
            </button>
          </div>

          {/* Eliminar cuenta */}
          <div className="p-4 border-2 border-red-200 dark:border-red-800 rounded-lg bg-red-50 dark:bg-red-900/20">
            <div className="flex items-start gap-3">
              <FaTrash className="h-5 w-5 text-red-600 dark:text-red-400 mt-0.5" />
              <div className="flex-1">
                <h4 className="font-medium text-red-900 dark:text-red-200 mb-2">
                  Eliminar cuenta permanentemente
                </h4>
                <p className="text-sm text-red-700 dark:text-red-300 mb-4">
                  Esta acción es irreversible. Se eliminarán todos tus datos, incluyendo:
                </p>
                <ul className="text-xs text-red-600 dark:text-red-400 mb-4 space-y-1">
                  <li>• Perfil y información personal</li>
                  <li>• Historial de actividades y puntos</li>
                  <li>• Membresías y beneficios</li>
                  <li>• Configuraciones y preferencias</li>
                </ul>
                <div className="bg-red-100 dark:bg-red-900/30 p-3 rounded-lg mb-4">
                  <p className="text-xs text-red-800 dark:text-red-200">
                    <strong>Importante:</strong> Una vez eliminada, tu cuenta no podrá ser recuperada. 
                    Tendrás 30 días para cancelar esta acción antes de que sea definitiva.
                  </p>
                </div>
                <button
                  onClick={() => setIsDeleteModalOpen(true)}
                  className="px-4 py-2 bg-red-600 hover:bg-red-700 text-white text-sm rounded-lg"
                >
                  Eliminar mi cuenta
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Modal de confirmación para eliminar cuenta */}
      {isDeleteModalOpen && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white dark:bg-gray-800 rounded-lg max-w-md w-full p-6">
            <div className="flex items-center gap-2 mb-4">
              <FaExclamationTriangle className="h-5 w-5 text-red-500" />
              <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
                Confirmar eliminación de cuenta
              </h3>
            </div>
            
            <div className="mb-6">
              <p className="text-gray-600 dark:text-gray-400 mb-4">
                Esta acción eliminará permanentemente tu cuenta y todos los datos asociados, 
                incluyendo tu membresía activa. No podrás deshacer esta acción.
              </p>
              
              <div className="bg-red-50 dark:bg-red-900/20 p-4 rounded-lg mb-4">
                <p className="text-sm text-red-700 dark:text-red-300 mb-2">
                  <strong>Se eliminarán:</strong>
                </p>
                <ul className="text-xs text-red-600 dark:text-red-400 space-y-1 mb-3">
                  <li>• Tu perfil y datos personales</li>
                  <li>• Tu membresía activa (será cancelada)</li>
                  <li>• Tu historial de eventos y actividades</li>
                  <li>• Todos tus puntos acumulados</li>
                </ul>
                <p className="text-sm text-red-700 dark:text-red-300">
                  Para confirmar, escribe exactamente: <code className="bg-red-100 dark:bg-red-900/30 px-2 py-0.5 rounded">eliminar-cuenta</code>
                </p>
              </div>
              
              <div className="space-y-3">
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                    Escribe "eliminar-cuenta"
                  </label>
                  <input
                    type="text"
                    value={deleteConfirmText}
                    onChange={(e) => setDeleteConfirmText(e.target.value)}
                    placeholder="eliminar-cuenta"
                    className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-transparent dark:bg-gray-700 dark:text-white"
                  />
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                    Tu contraseña
                  </label>
                  <input
                    type="password"
                    value={deletePassword}
                    onChange={(e) => setDeletePassword(e.target.value)}
                    placeholder="Ingresa tu contraseña"
                    className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-transparent dark:bg-gray-700 dark:text-white"
                  />
                </div>
              </div>
            </div>
            
            <div className="flex gap-3">
              <button
                onClick={() => {
                  setIsDeleteModalOpen(false)
                  setDeleteConfirmText('')
                  setDeletePassword('')
                }}
                className="flex-1 px-4 py-2 text-gray-600 hover:text-gray-800 dark:text-gray-400 dark:hover:text-gray-200"
              >
                Cancelar
              </button>
              <button
                onClick={handleDeleteAccount}
                disabled={deleteConfirmText !== 'eliminar-cuenta' || !deletePassword || isLoading}
                className="flex-1 px-4 py-2 bg-red-600 hover:bg-red-700 disabled:bg-red-400 disabled:cursor-not-allowed text-white rounded-lg"
              >
                {isLoading ? 'Procesando...' : 'Eliminar cuenta'}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Información legal */}
      <div className="bg-gray-50 dark:bg-gray-900 p-4 rounded-lg border border-gray-200 dark:border-gray-700">
        <div className="flex items-start gap-3">
          <FaLock className="h-5 w-5 text-gray-600 dark:text-gray-400 mt-0.5" />
          <div>
            <h4 className="font-medium text-gray-900 dark:text-white mb-2">
              Protección de datos
            </h4>
            <ul className="text-sm text-gray-600 dark:text-gray-400 space-y-1">
              <li>• Cumplimos con las regulaciones de protección de datos</li>
              <li>• Tus datos están encriptados y protegidos</li>
              <li>• Puedes solicitar información sobre el uso de tus datos</li>
              <li>• Tienes derecho a rectificar o eliminar tu información</li>
            </ul>
            <div className="mt-3">
              <a href="/privacy-policy" className="text-blue-600 dark:text-blue-400 hover:underline text-sm">
                Leer política de privacidad
              </a>
            </div>
          </div>
        </div>
      </div>
      </>
      )}
    </div>
  )
}