'use client'

import { useState } from 'react'
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
  const [deleteConfirmPassword, setDeleteConfirmPassword] = useState('')
  const [isLoading, setIsLoading] = useState(false)
  const [toast, setToast] = useState<ToastType | null>(null)

  const showToast = (toast: ToastType) => {
    setToast(toast)
    setTimeout(() => setToast(null), 4000)
  }

  const handlePrivacyToggle = async (setting: keyof PrivacySettings) => {
    const newValue = !privacySettings[setting]
    
    setPrivacySettings(prev => ({
      ...prev,
      [setting]: newValue
    }))

    // Simulación de guardado
    try {
      await new Promise(resolve => setTimeout(resolve, 500))
      
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
    } catch (error) {
      // Revertir cambio en caso de error
      setPrivacySettings(prev => ({
        ...prev,
        [setting]: !newValue
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
      // Simulación de generación y descarga de datos
      await new Promise(resolve => setTimeout(resolve, 2000))
      
      const userData = {
        usuario: {
          nombre: 'Juan Pérez',
          email: 'juan@example.com',
          fechaRegistro: '2024-01-15',
          ultimoAcceso: '2025-01-15'
        },
        actividad: {
          eventosAsistidos: 15,
          puntosAcumulados: 2450,
          comentarios: 23,
          publicaciones: 8
        },
        configuracion: {
          notificaciones: 'Activadas',
          privacidad: 'Configurada',
          idioma: 'Español'
        }
      }

      const content = `Datos personales de BSK Motorcycle Team
Exportados el: ${new Date().toLocaleDateString('es-ES')}

${JSON.stringify(userData, null, 2)}`

      const blob = new Blob([content], { type: 'application/json' })
      const url = URL.createObjectURL(blob)
      const a = document.createElement('a')
      a.href = url
      a.download = `bskmt-datos-personales-${new Date().getTime()}.json`
      a.click()
      URL.revokeObjectURL(url)

      showToast({
        title: '✅ Datos descargados',
        description: 'Tus datos personales han sido descargados exitosamente',
        type: 'success'
      })
    } catch (error) {
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
    if (deleteConfirmPassword !== 'eliminar-cuenta') {
      showToast({
        title: 'Confirmación incorrecta',
        description: 'Debes escribir "eliminar-cuenta" para confirmar',
        type: 'error'
      })
      return
    }

    setIsLoading(true)
    
    try {
      // Simulación de eliminación de cuenta
      await new Promise(resolve => setTimeout(resolve, 3000))
      
      showToast({
        title: '⚠️ Cuenta programada para eliminación',
        description: 'Tu cuenta será eliminada en 30 días. Recibirás un email de confirmación.',
        type: 'warning'
      })
      
      setIsDeleteModalOpen(false)
      setDeleteConfirmPassword('')
    } catch (error) {
      showToast({
        title: 'Error',
        description: 'No se pudo procesar la eliminación. Inténtalo de nuevo.',
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
                Esta acción eliminará permanentemente tu cuenta y todos los datos asociados. 
                No podrás deshacer esta acción.
              </p>
              
              <div className="bg-red-50 dark:bg-red-900/20 p-4 rounded-lg mb-4">
                <p className="text-sm text-red-700 dark:text-red-300 mb-2">
                  Para confirmar, escribe exactamente:
                </p>
                <code className="text-sm bg-red-100 dark:bg-red-900/30 px-2 py-1 rounded">
                  eliminar-cuenta
                </code>
              </div>
              
              <input
                type="text"
                value={deleteConfirmPassword}
                onChange={(e) => setDeleteConfirmPassword(e.target.value)}
                placeholder="Escribe 'eliminar-cuenta' para confirmar"
                className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-transparent dark:bg-gray-700 dark:text-white"
              />
            </div>
            
            <div className="flex gap-3">
              <button
                onClick={() => {
                  setIsDeleteModalOpen(false)
                  setDeleteConfirmPassword('')
                }}
                className="flex-1 px-4 py-2 text-gray-600 hover:text-gray-800 dark:text-gray-400 dark:hover:text-gray-200"
              >
                Cancelar
              </button>
              <button
                onClick={handleDeleteAccount}
                disabled={deleteConfirmPassword !== 'eliminar-cuenta' || isLoading}
                className="flex-1 px-4 py-2 bg-red-600 hover:bg-red-700 disabled:bg-red-400 text-white rounded-lg"
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
    </div>
  )
}