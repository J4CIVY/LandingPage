'use client'

import { useState } from 'react'
import { FaShieldAlt, FaDownload, FaCopy, FaCheckCircle, FaTimesCircle, FaExclamationTriangle } from 'react-icons/fa'

interface ToastType {
  title: string
  description: string
  type: 'success' | 'error' | 'warning'
}

export default function TwoFactorAuthSection() {
  const [is2FAEnabled, setIs2FAEnabled] = useState(false)
  const [verificationCode, setVerificationCode] = useState('')
  const [isSetupModalOpen, setIsSetupModalOpen] = useState(false)
  const [isDisableModalOpen, setIsDisableModalOpen] = useState(false)
  const [setupStep, setSetupStep] = useState(1) // 1: QR Code, 2: Verification, 3: Backup Codes
  const [isLoading, setIsLoading] = useState(false)
  const [toast, setToast] = useState<ToastType | null>(null)
  const [backupCodes] = useState([
    'ABC123', 'DEF456', 'GHI789', 'JKL012', 
    'MNO345', 'PQR678', 'STU901', 'VWX234'
  ])

  const showToast = (toast: ToastType) => {
    setToast(toast)
    setTimeout(() => setToast(null), 4000)
  }

  const simulatedQRCode = "data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMjAwIiBoZWlnaHQ9IjIwMCIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj4KICA8cmVjdCB3aWR0aD0iMjAwIiBoZWlnaHQ9IjIwMCIgZmlsbD0iI2ZmZiIvPgogIDx0ZXh0IHg9IjEwMCIgeT0iMTAwIiB0ZXh0LWFuY2hvcj0ibWlkZGxlIiBkeT0iMC4zZW0iIGZvbnQtZmFtaWx5PSJBcmlhbCIgZm9udC1zaXplPSIxNCIgZmlsbD0iIzMzMyI+CiAgICBRUiBDb2RlIFNpbXVsYWRvCiAgPC90ZXh0Pgo8L3N2Zz4="

  const handleToggle2FA = () => {
    if (is2FAEnabled) {
      setIsDisableModalOpen(true)
    } else {
      setIsSetupModalOpen(true)
      setSetupStep(1)
    }
  }

  const handleVerifyCode = async () => {
    if (verificationCode.length !== 6) {
      showToast({
        title: "Código inválido",
        description: "El código debe tener 6 dígitos",
        type: "error"
      })
      return
    }

    setIsLoading(true)
    
    try {
      // Simulación de verificación
      await new Promise(resolve => setTimeout(resolve, 1500))
      
      if (verificationCode === '123456') { // Código de prueba
        setSetupStep(3) // Mostrar códigos de respaldo
        showToast({
          title: "✅ Código verificado",
          description: "La verificación ha sido exitosa",
          type: "success"
        })
      } else {
        showToast({
          title: "Código incorrecto",
          description: "El código ingresado no es válido. Inténtalo de nuevo.",
          type: "error"
        })
      }
      // eslint-disable-next-line @typescript-eslint/no-unused-vars
    } catch (error) {
      showToast({
        title: "Error de verificación",
        description: "No se pudo verificar el código. Inténtalo de nuevo.",
        type: "error"
      })
    } finally {
      setIsLoading(false)
    }
  }

  const handleComplete2FASetup = () => {
    setIs2FAEnabled(true)
    setIsSetupModalOpen(false)
    setVerificationCode('')
    setSetupStep(1)
    showToast({
      title: "✅ 2FA Activado",
      description: "La autenticación de dos factores ha sido configurada correctamente",
      type: "success"
    })
  }

  const handleDisable2FA = async () => {
    setIsLoading(true)
    
    try {
      // Simulación de desactivación
      await new Promise(resolve => setTimeout(resolve, 1500))
      
      setIs2FAEnabled(false)
      setIsDisableModalOpen(false)
      showToast({
        title: "2FA Desactivado",
        description: "La autenticación de dos factores ha sido desactivada",
        type: "warning"
      })
      // eslint-disable-next-line @typescript-eslint/no-unused-vars
    } catch (error) {
      showToast({
        title: "Error",
        description: "No se pudo desactivar 2FA. Inténtalo de nuevo.",
        type: "error"
      })
    } finally {
      setIsLoading(false)
    }
  }

  const copySecretKey = () => {
    const secretKey = "ABCD EFGH IJKL MNOP QRST UVWX YZ01 2345"
    void navigator.clipboard.writeText(secretKey.replace(/\s/g, ''))
    showToast({
      title: "Clave copiada",
      description: "La clave secreta ha sido copiada al portapapeles",
      type: "success"
    })
  }

  const downloadBackupCodes = () => {
    const content = `Códigos de respaldo de BSK Motorcycle Team
Generados el: ${new Date().toLocaleDateString('es-ES')}

Guarda estos códigos en un lugar seguro. Cada código solo puede usarse una vez.

${backupCodes.map((code, index) => `${index + 1}. ${code}`).join('\n')}

IMPORTANTE: Estos códigos te permitirán acceder a tu cuenta si pierdes acceso a tu dispositivo de autenticación.`

    const blob = new Blob([content], { type: 'text/plain' })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = `bskmt-backup-codes-${new Date().getTime()}.txt`
    a.click()
    URL.revokeObjectURL(url)

    showToast({
      title: "Códigos descargados",
      description: "Los códigos de respaldo han sido descargados",
      type: "success"
    })
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
              aria-label="Cerrar notificación"
            >
              <FaTimesCircle className="h-4 w-4" />
            </button>
          </div>
        </div>
      )}

      {/* Estado actual de 2FA */}
      <div className="flex items-center justify-between p-4 border border-gray-200 dark:border-gray-700 rounded-lg">
        <div className="flex items-center gap-3">
          <div className={`p-2 rounded-lg ${is2FAEnabled ? 'bg-green-100 dark:bg-green-900/30' : 'bg-gray-100 dark:bg-gray-800'}`}>
            <FaShieldAlt className={`h-5 w-5 ${is2FAEnabled ? 'text-green-600 dark:text-green-400' : 'text-gray-600 dark:text-gray-400'}`} />
          </div>
          <div>
            <h3 className="font-medium text-gray-900 dark:text-white">
              Autenticación de Dos Factores
            </h3>
            <p className={`text-sm ${is2FAEnabled ? 'text-green-600 dark:text-green-400' : 'text-gray-500 dark:text-gray-400'}`}>
              {is2FAEnabled ? '✅ Activo - Tu cuenta está protegida' : '❌ Inactivo - Configura 2FA para mayor seguridad'}
            </p>
          </div>
        </div>
        
        <label className="relative inline-flex items-center cursor-pointer">
          <input
            type="checkbox"
            checked={is2FAEnabled}
            onChange={handleToggle2FA}
            className="sr-only peer"
            aria-label="Habilitar autenticación de dos factores"
          />
          <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-blue-300 dark:peer-focus:ring-blue-800 rounded-full peer dark:bg-gray-700 peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-0.5 after:left-0.5 after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all dark:border-gray-600 peer-checked:bg-blue-600"></div>
        </label>
      </div>

      {/* Información de 2FA */}
      <div className="bg-blue-50 dark:bg-blue-900/20 p-4 rounded-lg border border-blue-200 dark:border-blue-800">
        <div className="flex items-start gap-3">
          <FaShieldAlt className="h-5 w-5 text-blue-600 dark:text-blue-400 mt-0.5" />
          <div>
            <h4 className="font-medium text-blue-900 dark:text-blue-200 mb-2">
              ¿Qué es la Autenticación de Dos Factores?
            </h4>
            <p className="text-sm text-blue-700 dark:text-blue-300 mb-3">
              Añade una capa extra de seguridad requiriendo un código de tu dispositivo móvil además de tu contraseña.
            </p>
            <ul className="text-sm text-blue-700 dark:text-blue-300 space-y-1">
              <li>• Protege tu cuenta incluso si alguien conoce tu contraseña</li>
              <li>• Compatible con apps como Google Authenticator, Authy, etc.</li>
              <li>• Códigos de respaldo para emergencias</li>
            </ul>
          </div>
        </div>
      </div>

      {/* Códigos de respaldo si 2FA está activo */}
      {is2FAEnabled && (
        <div className="border border-gray-200 dark:border-gray-700 rounded-lg p-4">
          <div className="flex items-center justify-between mb-4">
            <h3 className="font-medium text-gray-900 dark:text-white">Códigos de Respaldo</h3>
            <button
              onClick={downloadBackupCodes}
              className="flex items-center gap-2 px-3 py-1 text-sm bg-gray-100 dark:bg-gray-800 hover:bg-gray-200 dark:hover:bg-gray-700 rounded-md transition-colors"
            >
              <FaDownload className="h-4 w-4" />
              Descargar
            </button>
          </div>
          <p className="text-sm text-gray-600 dark:text-gray-400 mb-3">
            Guarda estos códigos en un lugar seguro. Cada uno puede usarse una sola vez.
          </p>
          <div className="grid grid-cols-2 gap-2 text-sm font-mono">
            {backupCodes.slice(0, 4).map((code, index) => (
              <div key={index} className="bg-gray-50 dark:bg-gray-800 p-2 rounded border">
                {code}
              </div>
            ))}
          </div>
          <button className="text-sm text-blue-600 dark:text-blue-400 hover:underline mt-2">
            Ver todos los códigos
          </button>
        </div>
      )}

      {/* Modal de configuración de 2FA */}
      {isSetupModalOpen && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white dark:bg-gray-800 rounded-lg max-w-md w-full p-6 max-h-[90vh] overflow-y-auto">
            <div className="mb-6">
              <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">
                Configurar Autenticación de Dos Factores
              </h3>
              <div className="flex items-center gap-2 text-sm text-gray-600 dark:text-gray-400">
                <span className={`w-6 h-6 rounded-full flex items-center justify-center text-xs ${
                  setupStep >= 1 ? 'bg-blue-600 text-white' : 'bg-gray-300 text-gray-600'
                }`}>1</span>
                <span className={setupStep >= 2 ? 'text-blue-600' : ''}>Escanear QR</span>
                <span className="mx-2">→</span>
                <span className={`w-6 h-6 rounded-full flex items-center justify-center text-xs ${
                  setupStep >= 2 ? 'bg-blue-600 text-white' : 'bg-gray-300 text-gray-600'
                }`}>2</span>
                <span className={setupStep >= 2 ? 'text-blue-600' : ''}>Verificar</span>
                <span className="mx-2">→</span>
                <span className={`w-6 h-6 rounded-full flex items-center justify-center text-xs ${
                  setupStep >= 3 ? 'bg-blue-600 text-white' : 'bg-gray-300 text-gray-600'
                }`}>3</span>
                <span className={setupStep >= 3 ? 'text-blue-600' : ''}>Códigos</span>
              </div>
            </div>

            {/* Paso 1: QR Code */}
            {setupStep === 1 && (
              <div className="text-center">
                <div className="mb-4">
                  <img 
                    src={simulatedQRCode} 
                    alt="QR Code para 2FA" 
                    className="mx-auto border border-gray-300 rounded-lg"
                  />
                </div>
                <p className="text-sm text-gray-600 dark:text-gray-400 mb-4">
                  Escanea este código QR con tu app de autenticación (Google Authenticator, Authy, etc.)
                </p>
                
                <div className="bg-gray-50 dark:bg-gray-900 p-3 rounded-lg mb-4">
                  <p className="text-xs text-gray-500 dark:text-gray-400 mb-2">O ingresa manualmente:</p>
                  <div className="flex items-center gap-2">
                    <code className="flex-1 text-sm bg-white dark:bg-gray-800 p-2 rounded border">
                      ABCD EFGH IJKL MNOP QRST UVWX YZ01 2345
                    </code>
                    <button
                      onClick={copySecretKey}
                      className="p-2 text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200"
                      aria-label="Copiar clave secreta"
                    >
                      <FaCopy className="h-4 w-4" />
                    </button>
                  </div>
                </div>

                <div className="flex gap-3">
                  <button
                    onClick={() => setIsSetupModalOpen(false)}
                    className="flex-1 px-4 py-2 text-gray-600 hover:text-gray-800 dark:text-gray-400 dark:hover:text-gray-200"
                  >
                    Cancelar
                  </button>
                  <button
                    onClick={() => setSetupStep(2)}
                    className="flex-1 px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg transition-colors"
                  >
                    Siguiente
                  </button>
                </div>
              </div>
            )}

            {/* Paso 2: Verificación */}
            {setupStep === 2 && (
              <div>
                <div className="mb-4">
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    Código de verificación
                  </label>
                  <input
                    type="text"
                    value={verificationCode}
                    onChange={(e) => setVerificationCode(e.target.value.replace(/\D/g, '').slice(0, 6))}
                    placeholder="123456"
                    className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent dark:bg-gray-700 dark:text-white text-center text-lg font-mono"
                    maxLength={6}
                  />
                  <p className="text-xs text-gray-500 dark:text-gray-400 mt-2">
                    Ingresa el código de 6 dígitos de tu app de autenticación
                  </p>
                </div>

                <div className="bg-yellow-50 dark:bg-yellow-900/20 p-3 rounded-lg mb-4">
                  <p className="text-sm text-yellow-700 dark:text-yellow-300">
                    <strong>Código de prueba:</strong> 123456 (para demostración)
                  </p>
                </div>

                <div className="flex gap-3">
                  <button
                    onClick={() => setSetupStep(1)}
                    className="flex-1 px-4 py-2 text-gray-600 hover:text-gray-800 dark:text-gray-400 dark:hover:text-gray-200"
                  >
                    Atrás
                  </button>
                  <button
                    onClick={handleVerifyCode}
                    disabled={verificationCode.length !== 6 || isLoading}
                    className="flex-1 px-4 py-2 bg-blue-600 hover:bg-blue-700 disabled:bg-blue-400 text-white rounded-lg transition-colors"
                  >
                    {isLoading ? 'Verificando...' : 'Verificar'}
                  </button>
                </div>
              </div>
            )}

            {/* Paso 3: Códigos de respaldo */}
            {setupStep === 3 && (
              <div>
                <div className="mb-4">
                  <h4 className="font-medium text-gray-900 dark:text-white mb-2">
                    Códigos de Respaldo
                  </h4>
                  <p className="text-sm text-gray-600 dark:text-gray-400 mb-4">
                    Guarda estos códigos en un lugar seguro. Podrás usarlos si pierdes acceso a tu dispositivo.
                  </p>
                  
                  <div className="bg-gray-50 dark:bg-gray-900 p-4 rounded-lg mb-4">
                    <div className="grid grid-cols-2 gap-2 text-sm font-mono">
                      {backupCodes.map((code, index) => (
                        <div key={index} className="bg-white dark:bg-gray-800 p-2 rounded border text-center">
                          {code}
                        </div>
                      ))}
                    </div>
                  </div>

                  <button
                    onClick={downloadBackupCodes}
                    className="w-full flex items-center justify-center gap-2 px-4 py-2 bg-gray-600 hover:bg-gray-700 text-white rounded-lg transition-colors mb-4"
                  >
                    <FaDownload className="h-4 w-4" />
                    Descargar códigos como archivo .txt
                  </button>
                </div>

                <div className="flex gap-3">
                  <button
                    onClick={() => setIsSetupModalOpen(false)}
                    className="flex-1 px-4 py-2 text-gray-600 hover:text-gray-800 dark:text-gray-400 dark:hover:text-gray-200"
                  >
                    Cancelar
                  </button>
                  <button
                    onClick={handleComplete2FASetup}
                    className="flex-1 px-4 py-2 bg-green-600 hover:bg-green-700 text-white rounded-lg transition-colors"
                  >
                    Completar configuración
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>
      )}

      {/* Modal de desactivación */}
      {isDisableModalOpen && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white dark:bg-gray-800 rounded-lg max-w-md w-full p-6">
            <div className="flex items-center gap-2 mb-4">
              <FaExclamationTriangle className="h-5 w-5 text-red-500" />
              <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
                Desactivar Autenticación de Dos Factores
              </h3>
            </div>
            <p className="text-gray-600 dark:text-gray-400 mb-6">
              ¿Estás seguro de que quieres desactivar 2FA? Esto reducirá la seguridad de tu cuenta.
            </p>
            <div className="flex gap-3">
              <button
                onClick={() => setIsDisableModalOpen(false)}
                className="flex-1 px-4 py-2 text-gray-600 hover:text-gray-800 dark:text-gray-400 dark:hover:text-gray-200"
              >
                Cancelar
              </button>
              <button
                onClick={handleDisable2FA}
                disabled={isLoading}
                className="flex-1 px-4 py-2 bg-red-600 hover:bg-red-700 disabled:bg-red-400 text-white rounded-lg transition-colors"
              >
                {isLoading ? 'Desactivando...' : 'Desactivar 2FA'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}