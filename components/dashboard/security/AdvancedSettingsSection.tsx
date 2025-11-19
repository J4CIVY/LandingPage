'use client'

import { useState, useEffect } from 'react'
import apiClient from '@/lib/api-client'
import { FaGoogle, FaFacebook, FaApple, FaLink, FaUnlink, FaShieldAlt, FaMoon, FaSun, FaDesktop, FaCheckCircle, FaTimesCircle, FaExclamationTriangle } from 'react-icons/fa'

interface SocialAccount {
  provider: 'google' | 'facebook' | 'apple'
  isConnected: boolean
  email?: string
  connectedAt?: string
}

interface ToastType {
  title: string
  description: string
  type: 'success' | 'error' | 'warning'
}

export default function AdvancedSettingsSection() {
  const [socialAccounts, setSocialAccounts] = useState<SocialAccount[]>([
    {
      provider: 'google',
      isConnected: true,
      email: 'usuario@gmail.com',
      connectedAt: '2024-06-15'
    },
    {
      provider: 'facebook',
      isConnected: false
    },
    {
      provider: 'apple',
      isConnected: false
    }
  ])
  
  const [securityAlerts, setSecurityAlerts] = useState(true)
  const [themeMode, setThemeMode] = useState<'light' | 'dark' | 'system'>('system')
  const [isLoading, setIsLoading] = useState(false)
  const [isLoadingAlerts, setIsLoadingAlerts] = useState(true)
  const [toast, setToast] = useState<ToastType | null>(null)

  // Cargar configuración de alertas de seguridad al montar
  useEffect(() => {
    void loadSecurityAlerts()
  }, [])

  const loadSecurityAlerts = async () => {
    try {
      setIsLoadingAlerts(true)
      // NestJS: GET /users/security-alerts
      const data = await apiClient.get<{ securityAlerts: boolean }>('/users/security-alerts')
      setSecurityAlerts(data.securityAlerts)
    } catch (error) {
      console.error('Error al cargar alertas de seguridad:', error)
    } finally {
      setIsLoadingAlerts(false)
    }
  }

  const showToast = (toast: ToastType) => {
    setToast(toast)
    setTimeout(() => setToast(null), 4000)
  }

  const getSocialIcon = (provider: string) => {
    switch (provider) {
      case 'google':
        return <FaGoogle className="h-5 w-5 text-red-500" />
      case 'facebook':
        return <FaFacebook className="h-5 w-5 text-blue-600" />
      case 'apple':
        return <FaApple className="h-5 w-5 text-gray-900 dark:text-white" />
      default:
        return null
    }
  }

  const getSocialLabel = (provider: string) => {
    switch (provider) {
      case 'google':
        return 'Google'
      case 'facebook':
        return 'Facebook'
      case 'apple':
        return 'Apple ID'
      default:
        return provider
    }
  }

  const handleSocialToggle = async (provider: 'google' | 'facebook' | 'apple') => {
    setIsLoading(true)
    
    const account = socialAccounts.find(acc => acc.provider === provider)
    const isCurrentlyConnected = account?.isConnected || false
    
    try {
      // Simulación de conexión/desconexión
      await new Promise(resolve => setTimeout(resolve, 1500))
      
      setSocialAccounts(prev => prev.map(acc => 
        acc.provider === provider 
          ? {
              ...acc,
              isConnected: !isCurrentlyConnected,
              email: !isCurrentlyConnected ? `usuario@${provider}.com` : undefined,
              connectedAt: !isCurrentlyConnected ? new Date().toISOString().split('T')[0] : undefined
            }
          : acc
      ))
      
      showToast({
        title: `${getSocialLabel(provider)} ${!isCurrentlyConnected ? 'conectado' : 'desconectado'}`,
        description: !isCurrentlyConnected 
          ? `Tu cuenta de ${getSocialLabel(provider)} ha sido vinculada exitosamente`
          : `Tu cuenta de ${getSocialLabel(provider)} ha sido desvinculada`,
        type: 'success'
      })
      // eslint-disable-next-line @typescript-eslint/no-unused-vars
    } catch (error) {
      showToast({
        title: 'Error',
        description: `No se pudo ${isCurrentlyConnected ? 'desconectar' : 'conectar'} la cuenta de ${getSocialLabel(provider)}`,
        type: 'error'
      })
    } finally {
      setIsLoading(false)
    }
  }

  const handleSecurityAlertsToggle = async () => {
    const newValue = !securityAlerts
    const previousValue = securityAlerts
    
    // Actualización optimista
    setSecurityAlerts(newValue)

    try {
      // NestJS: PATCH /users/security-alerts
      const data = await apiClient.patch<{ message: string }>('/users/security-alerts', {
        securityAlerts: newValue
      });
      
      showToast({
        title: data.message || `Alertas de seguridad ${newValue ? 'activadas' : 'desactivadas'}`,
        description: newValue 
          ? 'Recibirás notificaciones sobre actividad sospechosa en tu cuenta'
          : 'Ya no recibirás alertas de seguridad automáticas',
        type: 'success'
      })
    } catch (error) {
      // Revertir cambio en caso de error
      setSecurityAlerts(previousValue)
      showToast({
        title: 'Error',
        description: error instanceof Error ? error.message : 'No se pudo actualizar la configuración de alertas',
        type: 'error'
      })
    }
  }

  const handleThemeChange = async (newTheme: 'light' | 'dark' | 'system') => {
    const previousTheme = themeMode
    setThemeMode(newTheme)

    try {
      // Simulación de cambio de tema
      await new Promise(resolve => setTimeout(resolve, 500))
      
      const themeLabels = {
        light: 'Modo claro',
        dark: 'Modo oscuro',
        system: 'Seguir sistema'
      }
      
      showToast({
        title: 'Tema actualizado',
        description: `El tema ha sido cambiado a: ${themeLabels[newTheme]}`,
        type: 'success'
      })
      // eslint-disable-next-line @typescript-eslint/no-unused-vars
    } catch (error) {
      setThemeMode(previousTheme)
      showToast({
        title: 'Error',
        description: 'No se pudo cambiar el tema. Inténtalo de nuevo.',
        type: 'error'
      })
    }
  }

  const getThemeIcon = (theme: string) => {
    switch (theme) {
      case 'light':
        return <FaSun className="h-4 w-4" />
      case 'dark':
        return <FaMoon className="h-4 w-4" />
      default:
        return <FaDesktop className="h-4 w-4" />
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
                aria-label="Cerrar notificación"
            >
              <FaTimesCircle className="h-4 w-4" />
            </button>
          </div>
        </div>
      )}

      {/* Vinculación de Redes Sociales */}
      <div className="border border-gray-200 dark:border-gray-700 rounded-lg p-6">
        <div className="flex items-center gap-2 mb-4">
          <FaLink className="h-5 w-5 text-blue-600 dark:text-blue-400" />
          <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
            Cuentas Vinculadas
          </h3>
        </div>
        
        <p className="text-sm text-gray-600 dark:text-gray-400 mb-6">
          Vincula tus cuentas de redes sociales para facilitar el inicio de sesión y compartir contenido
        </p>
        
        <div className="space-y-4">
          {socialAccounts.map((account) => (
            <div
              key={account.provider}
              className="flex items-center justify-between p-4 border border-gray-200 dark:border-gray-700 rounded-lg"
            >
              <div className="flex items-center gap-3">
                <div className={`p-2 rounded-lg ${
                  account.isConnected 
                    ? 'bg-green-100 dark:bg-green-900/30' 
                    : 'bg-gray-100 dark:bg-gray-800'
                }`}>
                  {getSocialIcon(account.provider)}
                </div>
                <div>
                  <h4 className="font-medium text-gray-900 dark:text-white">
                    {getSocialLabel(account.provider)}
                  </h4>
                  {account.isConnected && account.email ? (
                    <p className="text-sm text-gray-600 dark:text-gray-400">
                      Conectado como {account.email}
                    </p>
                  ) : (
                    <p className="text-sm text-gray-600 dark:text-gray-400">
                      No conectado
                    </p>
                  )}
                </div>
              </div>
              
              <button
                onClick={() => handleSocialToggle(account.provider)}
                disabled={isLoading}
                className={`flex items-center gap-2 px-4 py-2 rounded-lg text-sm ${
                  account.isConnected
                    ? 'bg-red-600 hover:bg-red-700 text-white'
                    : 'bg-blue-600 hover:bg-blue-700 text-white'
                } disabled:opacity-50`}
              >
                {account.isConnected ? (
                  <>
                    <FaUnlink className="h-4 w-4" />
                    {isLoading ? 'Desconectando...' : 'Desconectar'}
                  </>
                ) : (
                  <>
                    <FaLink className="h-4 w-4" />
                    {isLoading ? 'Conectando...' : 'Conectar'}
                  </>
                )}
              </button>
            </div>
          ))}
        </div>
        
        <div className="mt-4 bg-blue-50 dark:bg-blue-900/20 p-3 rounded-lg">
          <p className="text-sm text-blue-700 dark:text-blue-300">
            💡 <strong>Consejo:</strong> Vincula al menos una cuenta adicional para tener opciones de respaldo en caso de problemas con tu cuenta principal.
          </p>
        </div>
      </div>

      {/* Alertas de Seguridad */}
      <div className="border border-gray-200 dark:border-gray-700 rounded-lg p-6">
        <div className="flex items-center gap-2 mb-4">
          <FaShieldAlt className="h-5 w-5 text-green-600 dark:text-green-400" />
          <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
            Alertas de Seguridad
          </h3>
        </div>
        
        <div className="flex items-center justify-between p-4 border border-gray-200 dark:border-gray-700 rounded-lg">
          <div className="flex items-center gap-3">
            <div className={`p-2 rounded-lg ${
              securityAlerts 
                ? 'bg-green-100 dark:bg-green-900/30' 
                : 'bg-gray-100 dark:bg-gray-800'
            }`}>
              <FaShieldAlt className={`h-5 w-5 ${
                securityAlerts 
                  ? 'text-green-600 dark:text-green-400' 
                  : 'text-gray-600 dark:text-gray-400'
              }`} />
            </div>
            <div>
              <h4 className="font-medium text-gray-900 dark:text-white">
                Alertas de login desde nuevos dispositivos
              </h4>
              <p className="text-sm text-gray-600 dark:text-gray-400">
                Recibe notificaciones cuando alguien acceda desde un dispositivo desconocido
              </p>
            </div>
          </div>
          
          <label className="relative inline-flex items-center cursor-pointer">
            <input
              type="checkbox"
              checked={securityAlerts}
              onChange={handleSecurityAlertsToggle}
              disabled={isLoadingAlerts}
              className="sr-only peer"
              aria-label="Alertas de seguridad en tiempo real"
            />
            <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-blue-300 dark:peer-focus:ring-blue-800 rounded-full peer dark:bg-gray-700 peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-0.5 after:left-0.5 after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all dark:border-gray-600 peer-checked:bg-blue-600 peer-disabled:opacity-50 peer-disabled:cursor-not-allowed"></div>
          </label>
        </div>
        
        {securityAlerts && (
          <div className="mt-4 bg-green-50 dark:bg-green-900/20 p-3 rounded-lg">
            <p className="text-sm text-green-700 dark:text-green-300">
              ✅ <strong>Activo:</strong> Te notificaremos por email y push cuando detectemos un login desde un nuevo dispositivo o ubicación.
            </p>
          </div>
        )}
      </div>

      {/* Configuración de Tema */}
      <div className="border border-gray-200 dark:border-gray-700 rounded-lg p-6">
        <div className="flex items-center gap-2 mb-4">
          <FaMoon className="h-5 w-5 text-purple-600 dark:text-purple-400" />
          <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
            Apariencia
          </h3>
        </div>
        
        <p className="text-sm text-gray-600 dark:text-gray-400 mb-6">
          Personaliza la apariencia de la interfaz según tu preferencia
        </p>
        
        <div className="space-y-3">
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">
            Modo de tema
          </label>
          <div className="grid grid-cols-3 gap-3">
            {[
              { value: 'light', label: 'Claro', icon: 'light' },
              { value: 'dark', label: 'Oscuro', icon: 'dark' },
              { value: 'system', label: 'Sistema', icon: 'system' }
            ].map((theme) => (
              <button
                key={theme.value}
                onClick={() => handleThemeChange(theme.value as 'light' | 'dark' | 'system')}
                className={`flex flex-col items-center gap-2 p-4 border rounded-lg ${
                  themeMode === theme.value
                    ? 'border-blue-500 bg-blue-50 dark:bg-blue-900/20'
                    : 'border-gray-200 dark:border-gray-700 hover:border-gray-300 dark:hover:border-gray-600'
                }`}
              >
                <div className={`p-2 rounded-lg ${
                  themeMode === theme.value
                    ? 'bg-blue-100 dark:bg-blue-900/30 text-blue-600 dark:text-blue-400'
                    : 'bg-gray-100 dark:bg-gray-800 text-gray-600 dark:text-gray-400'
                }`}>
                  {getThemeIcon(theme.icon)}
                </div>
                <span className={`text-sm font-medium ${
                  themeMode === theme.value
                    ? 'text-blue-600 dark:text-blue-400'
                    : 'text-gray-700 dark:text-gray-300'
                }`}>
                  {theme.label}
                </span>
                {themeMode === theme.value && (
                  <FaCheckCircle className="h-4 w-4 text-blue-600 dark:text-blue-400" />
                )}
              </button>
            ))}
          </div>
          
          <div className="bg-gray-50 dark:bg-gray-900 p-3 rounded-lg">
            <p className="text-sm text-gray-600 dark:text-gray-400">
              <strong>Tema actual:</strong> {
                themeMode === 'light' ? 'Modo claro' :
                themeMode === 'dark' ? 'Modo oscuro' :
                'Siguiendo configuración del sistema'
              }
            </p>
          </div>
        </div>
      </div>

      {/* Información adicional */}
      <div className="bg-gray-50 dark:bg-gray-900 p-4 rounded-lg border border-gray-200 dark:border-gray-700">
        <div className="flex items-start gap-3">
          <FaCheckCircle className="h-5 w-5 text-blue-600 dark:text-blue-400 mt-0.5" />
          <div>
            <h4 className="font-medium text-gray-900 dark:text-white mb-2">
              Configuraciones avanzadas
            </h4>
            <ul className="text-sm text-gray-600 dark:text-gray-400 space-y-1">
              <li>• Las cuentas vinculadas se pueden usar para iniciar sesión rápidamente</li>
              <li>• Las alertas de seguridad te ayudan a detectar accesos no autorizados</li>
              <li>• El tema del sistema cambia automáticamente según tu configuración de dispositivo</li>
              <li>• Todas estas configuraciones se sincronizan entre tus dispositivos</li>
            </ul>
          </div>
        </div>
      </div>
    </div>
  )
}