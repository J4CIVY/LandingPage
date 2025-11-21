'use client'

import { useState, createElement } from 'react'
import { FaShieldAlt, FaKey, FaMobile, FaUsers, FaEye, FaCog, FaBell } from 'react-icons/fa'

// Componentes
import PasswordChangeSection from '@/components/dashboard/security/PasswordChangeSection'
import TwoFactorAuthSection from '@/components/dashboard/security/TwoFactorAuthSection'
import SessionManagementSection from '@/components/dashboard/security/SessionManagementSection'
import SecurityAlertsSection from '@/components/dashboard/security/SecurityAlertsSection'
import NotificationPreferencesSection from '@/components/dashboard/security/NotificationPreferencesSection'
import PrivacyControlSection from '@/components/dashboard/security/PrivacyControlSection'
import AdvancedSettingsSection from '@/components/dashboard/security/AdvancedSettingsSection'

export default function SecurityPage() {
  const [activeTab, setActiveTab] = useState('password')

  const tabs = [
    { id: 'password', label: 'Contraseña', icon: FaKey },
    { id: '2fa', label: '2FA', icon: FaMobile },
    { id: 'sessions', label: 'Dispositivos', icon: FaUsers },
    { id: 'alerts', label: 'Alertas', icon: FaShieldAlt },
    { id: 'notifications', label: 'Notificaciones', icon: FaBell },
    { id: 'privacy', label: 'Privacidad', icon: FaEye },
    { id: 'advanced', label: 'Avanzado', icon: FaCog }
  ]

  const renderTabContent = () => {
    switch (activeTab) {
      case 'password':
        return <PasswordChangeSection />
      case '2fa':
        return <TwoFactorAuthSection />
      case 'sessions':
        return <SessionManagementSection />
      case 'alerts':
        return <SecurityAlertsSection />
      case 'notifications':
        return <NotificationPreferencesSection />
      case 'privacy':
        return <PrivacyControlSection />
      case 'advanced':
        return <AdvancedSettingsSection />
      default:
        return <PasswordChangeSection />
    }
  }

  const getTabTitle = () => {
    const tabTitles = {
      password: 'Cambio de Contraseña',
      '2fa': 'Autenticación de Dos Factores (2FA)',
      sessions: 'Dispositivos Confiables',
      alerts: 'Alertas de Seguridad',
      notifications: 'Notificaciones y Preferencias',
      privacy: 'Privacidad y Control de Datos',
      advanced: 'Configuraciones Avanzadas'
    }
    return tabTitles[activeTab as keyof typeof tabTitles] || 'Configuración'
  }

  const getTabDescription = () => {
    const tabDescriptions = {
      password: 'Actualiza tu contraseña para mantener tu cuenta segura',
      '2fa': 'Añade una capa extra de seguridad con códigos TOTP',
      sessions: 'Gestiona dispositivos confiables y evita ingresar 2FA por 30 días',
      alerts: 'Revisa eventos de seguridad y actividad sospechosa detectada',
      notifications: 'Configura cómo y cuándo quieres recibir notificaciones',
      privacy: 'Gestiona tu privacidad y datos personales',
      advanced: 'Configuraciones adicionales e integraciones'
    }
    return tabDescriptions[activeTab as keyof typeof tabDescriptions] || 'Gestiona tu configuración'
  }

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 p-4 md:p-6">
      <div className="max-w-4xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <div className="flex items-center gap-3 mb-4">
            <div className="p-3 bg-blue-600 rounded-lg">
              <FaShieldAlt className="h-6 w-6 text-white" />
            </div>
            <div>
              <h1 className="text-3xl font-bold text-gray-900 dark:text-white">
                Seguridad y Configuración
              </h1>
              <p className="text-gray-600 dark:text-gray-400">
                Gestiona tu seguridad y preferencias de cuenta
              </p>
            </div>
          </div>
        </div>

        {/* Tabs Navigation */}
        <div className="bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 mb-6">
          <div className="grid grid-cols-4 lg:grid-cols-7 gap-1 p-1">
            {tabs.map((tab) => {
              const Icon = tab.icon
              return (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id)}
                  className={`flex flex-col items-center gap-2 p-3 text-xs rounded-lg transition-all duration-200 ${
                    activeTab === tab.id
                      ? 'bg-blue-600 text-white shadow-md'
                      : 'text-gray-600 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-700'
                  }`}
                >
                  <Icon className="h-4 w-4" />
                  <span className="hidden sm:inline font-medium">{tab.label}</span>
                </button>
              )
            })}
          </div>
        </div>

        {/* Tab Content */}
        <div className="bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700">
          <div className="p-6 border-b border-gray-200 dark:border-gray-700">
            <div className="flex items-center gap-2 mb-2">
              {createElement(tabs.find(tab => tab.id === activeTab)?.icon || FaShieldAlt, {
                className: "h-5 w-5 text-blue-600 dark:text-blue-400"
              })}
              <h2 className="text-xl font-semibold text-gray-900 dark:text-white">
                {getTabTitle()}
              </h2>
            </div>
            <p className="text-gray-600 dark:text-gray-400">
              {getTabDescription()}
            </p>
          </div>
          <div className="p-6">
            {renderTabContent()}
          </div>
        </div>
      </div>
    </div>
  )
}
