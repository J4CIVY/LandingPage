'use client'

import { useState, useEffect } from 'react'
import securityService, { SecurityEvent, SecurityEventType, SecuritySeverity } from '@/lib/services/security.service'
import { FaShieldAlt, FaExclamationTriangle, FaMapMarkerAlt, FaClock, FaFilter, FaSpinner, FaCheckCircle, FaTimesCircle } from 'react-icons/fa'
import type { ReactElement } from 'react'

const EVENT_TYPE_LABELS: Record<SecurityEventType, string> = {
  suspicious_login: 'Inicio sospechoso',
  new_location: 'Nueva ubicación',
  new_ip: 'Nueva IP',
  new_device: 'Nuevo dispositivo',
  failed_2fa: 'Fallo 2FA',
  account_locked: 'Cuenta bloqueada',
  password_changed: 'Contraseña cambiada'
}

const SEVERITY_CONFIG: Record<SecuritySeverity, { label: string; color: string; bg: string; icon: ReactElement }> = {
  low: {
    label: 'Baja',
    color: 'text-green-700 dark:text-green-300',
    bg: 'bg-green-100 dark:bg-green-900/30',
    icon: <FaCheckCircle className="h-4 w-4" />
  },
  medium: {
    label: 'Media',
    color: 'text-yellow-700 dark:text-yellow-300',
    bg: 'bg-yellow-100 dark:bg-yellow-900/30',
    icon: <FaExclamationTriangle className="h-4 w-4" />
  },
  high: {
    label: 'Alta',
    color: 'text-orange-700 dark:text-orange-300',
    bg: 'bg-orange-100 dark:bg-orange-900/30',
    icon: <FaExclamationTriangle className="h-4 w-4" />
  },
  critical: {
    label: 'Crítica',
    color: 'text-red-700 dark:text-red-300',
    bg: 'bg-red-100 dark:bg-red-900/30',
    icon: <FaTimesCircle className="h-4 w-4" />
  }
}

export default function SecurityAlertsSection() {
  const [events, setEvents] = useState<SecurityEvent[]>([])
  const [filteredEvents, setFilteredEvents] = useState<SecurityEvent[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [filterSeverity, setFilterSeverity] = useState<SecuritySeverity | 'all'>('all')
  const [filterType, setFilterType] = useState<SecurityEventType | 'all'>('all')

  useEffect(() => {
    loadEvents()
  }, [])

  useEffect(() => {
    applyFilters()
  }, [events, filterSeverity, filterType])

  const loadEvents = async () => {
    try {
      setIsLoading(true)
      const data = await securityService.getEvents()
      setEvents(data)
    } catch (error) {
      console.error('Error loading security events:', error)
    } finally {
      setIsLoading(false)
    }
  }

  const applyFilters = () => {
    let filtered = [...events]

    if (filterSeverity !== 'all') {
      filtered = filtered.filter(e => e.severity === filterSeverity)
    }

    if (filterType !== 'all') {
      filtered = filtered.filter(e => e.eventType === filterType)
    }

    // Sort by date descending
    filtered.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime())

    setFilteredEvents(filtered)
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

  const getRiskScoreColor = (score: number) => {
    if (score < 40) return 'text-green-600 dark:text-green-400'
    if (score < 60) return 'text-yellow-600 dark:text-yellow-400'
    if (score < 80) return 'text-orange-600 dark:text-orange-400'
    return 'text-red-600 dark:text-red-400'
  }

  const getRiskScoreBg = (score: number) => {
    if (score < 40) return 'bg-green-100 dark:bg-green-900/30'
    if (score < 60) return 'bg-yellow-100 dark:bg-yellow-900/30'
    if (score < 80) return 'bg-orange-100 dark:bg-orange-900/30'
    return 'bg-red-100 dark:bg-red-900/30'
  }

  const severityCounts = events.reduce((acc, event) => {
    acc[event.severity] = (acc[event.severity] || 0) + 1
    return acc
  }, {} as Record<SecuritySeverity, number>)

  if (isLoading) {
    return (
      <div className="space-y-6">
        <div className="flex items-center justify-center py-12">
          <div className="flex flex-col items-center gap-3">
            <FaSpinner className="h-8 w-8 text-blue-600 animate-spin" />
            <p className="text-gray-600 dark:text-gray-400">Cargando eventos de seguridad...</p>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {/* Header y estadísticas */}
      <div className="bg-gradient-to-r from-purple-50 to-pink-50 dark:from-purple-900/20 dark:to-pink-900/20 p-6 rounded-lg border border-purple-200 dark:border-purple-800">
        <div className="flex items-center gap-3 mb-4">
          <FaShieldAlt className="h-6 w-6 text-purple-600 dark:text-purple-400" />
          <div>
            <h3 className="text-lg font-semibold text-purple-900 dark:text-purple-200">
              Eventos de Seguridad
            </h3>
            <p className="text-sm text-purple-700 dark:text-purple-300">
              Monitoreo de actividad sospechosa y alertas (últimos 30 días)
            </p>
          </div>
        </div>

        {/* Contadores por severidad */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
          {(['low', 'medium', 'high', 'critical'] as SecuritySeverity[]).map(severity => (
            <div key={severity} className={`${SEVERITY_CONFIG[severity].bg} p-3 rounded-lg`}>
              <div className={`flex items-center gap-2 ${SEVERITY_CONFIG[severity].color}`}>
                {SEVERITY_CONFIG[severity].icon}
                <span className="text-xs font-medium uppercase">{SEVERITY_CONFIG[severity].label}</span>
              </div>
              <p className="text-2xl font-bold text-gray-900 dark:text-white mt-1">
                {severityCounts[severity] || 0}
              </p>
            </div>
          ))}
        </div>
      </div>

      {/* Filtros */}
      <div className="bg-white dark:bg-gray-800 p-4 rounded-lg border border-gray-200 dark:border-gray-700">
        <div className="flex items-center gap-2 mb-3">
          <FaFilter className="h-4 w-4 text-gray-600 dark:text-gray-400" />
          <h4 className="font-medium text-gray-900 dark:text-white">Filtros</h4>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              Severidad
            </label>
            <select
              value={filterSeverity}
              onChange={(e) => setFilterSeverity(e.target.value as SecuritySeverity | 'all')}
              className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent dark:bg-gray-700 dark:text-white"
            >
              <option value="all">Todas las severidades</option>
              <option value="low">Baja</option>
              <option value="medium">Media</option>
              <option value="high">Alta</option>
              <option value="critical">Crítica</option>
            </select>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              Tipo de evento
            </label>
            <select
              value={filterType}
              onChange={(e) => setFilterType(e.target.value as SecurityEventType | 'all')}
              className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent dark:bg-gray-700 dark:text-white"
            >
              <option value="all">Todos los tipos</option>
              <option value="suspicious_login">Inicio sospechoso</option>
              <option value="new_location">Nueva ubicación</option>
              <option value="new_ip">Nueva IP</option>
              <option value="new_device">Nuevo dispositivo</option>
              <option value="failed_2fa">Fallo 2FA</option>
              <option value="account_locked">Cuenta bloqueada</option>
              <option value="password_changed">Contraseña cambiada</option>
            </select>
          </div>
        </div>
      </div>

      {/* Lista de eventos */}
      {filteredEvents.length === 0 ? (
        <div className="text-center py-12 border border-dashed border-gray-300 dark:border-gray-700 rounded-lg">
          <FaShieldAlt className="h-12 w-12 text-gray-400 mx-auto mb-3" />
          <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-2">
            No hay eventos de seguridad
          </h3>
          <p className="text-gray-600 dark:text-gray-400">
            {events.length === 0 
              ? 'No se han registrado eventos de seguridad en los últimos 30 días'
              : 'No hay eventos que coincidan con los filtros seleccionados'}
          </p>
        </div>
      ) : (
        <div className="space-y-3">
          {filteredEvents.map((event) => {
            const severityConfig = SEVERITY_CONFIG[event.severity]
            
            return (
              <div
                key={event._id}
                className="border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 rounded-lg p-4 hover:shadow-md transition-shadow"
              >
                <div className="flex items-start justify-between gap-4">
                  <div className="flex items-start gap-3 flex-1">
                    <div className={`p-2 rounded-lg ${severityConfig.bg} ${severityConfig.color}`}>
                      {severityConfig.icon}
                    </div>

                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 mb-2 flex-wrap">
                        <h4 className="font-medium text-gray-900 dark:text-white">
                          {EVENT_TYPE_LABELS[event.eventType]}
                        </h4>
                        <span className={`px-2 py-1 ${severityConfig.bg} ${severityConfig.color} text-xs rounded-full uppercase font-medium`}>
                          {severityConfig.label}
                        </span>
                      </div>

                      <div className="space-y-1 text-sm text-gray-600 dark:text-gray-400">
                        {event.location && (
                          <div className="flex items-center gap-1">
                            <FaMapMarkerAlt className="h-3 w-3" />
                            <span>
                              {event.location.city}, {event.location.country}
                            </span>
                            <span className="text-gray-400">•</span>
                            <span className="font-mono text-xs">{event.ipAddress}</span>
                          </div>
                        )}

                        <div className="flex items-center gap-1">
                          <FaClock className="h-3 w-3" />
                          <span>{formatDate(event.createdAt)}</span>
                        </div>

                        {event.actionTaken && (
                          <div className="mt-2 p-2 bg-gray-50 dark:bg-gray-900 rounded text-xs">
                            <span className="font-medium">Acción tomada:</span> {event.actionTaken}
                          </div>
                        )}
                      </div>
                    </div>
                  </div>

                  {/* Risk Score Badge */}
                  <div className="flex flex-col items-center gap-1">
                    <div className={`px-3 py-2 rounded-lg ${getRiskScoreBg(event.riskScore)}`}>
                      <div className={`text-xl font-bold ${getRiskScoreColor(event.riskScore)}`}>
                        {event.riskScore}
                      </div>
                    </div>
                    <span className="text-xs text-gray-500 dark:text-gray-400">Riesgo</span>
                  </div>
                </div>
              </div>
            )
          })}
        </div>
      )}

      {/* Info section */}
      <div className="bg-blue-50 dark:bg-blue-900/20 p-4 rounded-lg border border-blue-200 dark:border-blue-800">
        <div className="flex items-start gap-3">
          <FaShieldAlt className="h-5 w-5 text-blue-600 dark:text-blue-400 mt-0.5" />
          <div>
            <h4 className="font-medium text-blue-900 dark:text-blue-200 mb-2">
              Sobre el Sistema de Seguridad
            </h4>
            <ul className="text-sm text-blue-700 dark:text-blue-300 space-y-1">
              <li>• <strong>Riesgo 0-39:</strong> Actividad normal</li>
              <li>• <strong>Riesgo 40-59:</strong> Actividad moderadamente sospechosa</li>
              <li>• <strong>Riesgo 60-79:</strong> Requiere verificación adicional (2FA obligatorio)</li>
              <li>• <strong>Riesgo 80-100:</strong> Actividad altamente sospechosa (cuenta bloqueada temporalmente)</li>
              <li>• Los eventos se eliminan automáticamente después de 90 días</li>
            </ul>
          </div>
        </div>
      </div>
    </div>
  )
}
