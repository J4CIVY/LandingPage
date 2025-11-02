'use client';

import { useState } from 'react';
import { FaHistory, FaMapMarkerAlt, FaMobile, FaDesktop, FaTablet, FaGlobe, FaShieldAlt, FaSignInAlt, FaEdit, FaClock } from 'react-icons/fa';
import { IUser } from '@/lib/models/User';

interface UserActivityProps {
  user: IUser;
}

interface ActivityLog {
  id: string;
  type: 'login' | 'profile_update' | 'password_change' | 'email_change' | 'document_upload' | 'document_delete';
  description: string;
  timestamp: Date;
  ipAddress: string;
  location?: string;
  device: string;
  browser: string;
  success: boolean;
}

interface LoginSession {
  id: string;
  device: string;
  browser: string;
  os: string;
  location: string;
  lastActive: Date;
  current: boolean;
  ipAddress: string;
}

export default function UserActivity({ user }: UserActivityProps) {
  const [activities] = useState<ActivityLog[]>([
    // Mock data - En producción vendría de la API
    {
      id: '1',
      type: 'login',
      description: 'Inicio de sesión exitoso',
      timestamp: new Date('2024-09-13T10:30:00'),
      ipAddress: '192.168.1.100',
      location: 'Bogotá, Colombia',
      device: 'Desktop',
      browser: 'Chrome 118',
      success: true
    },
    {
      id: '2',
      type: 'profile_update',
      description: 'Información personal actualizada',
      timestamp: new Date('2024-09-12T15:45:00'),
      ipAddress: '192.168.1.100',
      location: 'Bogotá, Colombia',
      device: 'Desktop',
      browser: 'Chrome 118',
      success: true
    },
    {
      id: '3',
      type: 'document_upload',
      description: 'Documento SOAT subido',
      timestamp: new Date('2024-09-11T09:20:00'),
      ipAddress: '10.0.0.50',
      location: 'Medellín, Colombia',
      device: 'Mobile',
      browser: 'Safari Mobile',
      success: true
    },
    {
      id: '4',
      type: 'login',
      description: 'Intento de inicio de sesión fallido',
      timestamp: new Date('2024-09-10T22:15:00'),
      ipAddress: '45.123.45.67',
      location: 'Desconocida',
      device: 'Mobile',
      browser: 'Firefox Mobile',
      success: false
    },
    {
      id: '5',
      type: 'password_change',
      description: 'Contraseña actualizada',
      timestamp: new Date('2024-09-08T14:30:00'),
      ipAddress: '192.168.1.100',
      location: 'Bogotá, Colombia',
      device: 'Desktop',
      browser: 'Chrome 118',
      success: true
    }
  ]);

  const [sessions, setSessions] = useState<LoginSession[]>([
    // Mock data
    {
      id: '1',
      device: 'Chrome en Windows',
      browser: 'Chrome 118.0',
      os: 'Windows 11',
      location: 'Bogotá, Colombia',
      lastActive: new Date('2024-09-13T10:30:00'),
      current: true,
      ipAddress: '192.168.1.100'
    },
    {
      id: '2',
      device: 'Safari en iPhone',
      browser: 'Safari Mobile 17.0',
      os: 'iOS 17.0',
      location: 'Medellín, Colombia',
      lastActive: new Date('2024-09-11T09:20:00'),
      current: false,
      ipAddress: '10.0.0.50'
    }
  ]);

  const [selectedTab, setSelectedTab] = useState<'activity' | 'sessions'>('activity');

  const getActivityIcon = (type: string) => {
    switch (type) {
      case 'login':
        return FaSignInAlt;
      case 'profile_update':
        return FaEdit;
      case 'password_change':
        return FaShieldAlt;
      case 'email_change':
        return FaEdit;
      case 'document_upload':
      case 'document_delete':
        return FaEdit;
      default:
        return FaHistory;
    }
  };

  const getActivityColor = (type: string, success: boolean) => {
    if (!success) {
      return 'text-red-600 bg-red-100 dark:bg-red-900/30';
    }
    
    switch (type) {
      case 'login':
        return 'text-green-600 bg-green-100 dark:bg-green-900/30';
      case 'profile_update':
      case 'email_change':
        return 'text-blue-600 bg-blue-100 dark:bg-blue-900/30';
      case 'password_change':
        return 'text-purple-600 bg-purple-100 dark:bg-purple-900/30';
      case 'document_upload':
      case 'document_delete':
        return 'text-orange-600 bg-orange-100 dark:bg-orange-900/30';
      default:
        return 'text-slate-600 bg-slate-100 dark:bg-slate-700';
    }
  };

  const getDeviceIcon = (device: string) => {
    if (device.toLowerCase().includes('mobile') || device.toLowerCase().includes('iphone') || device.toLowerCase().includes('android')) {
      return FaMobile;
    } else if (device.toLowerCase().includes('tablet') || device.toLowerCase().includes('ipad')) {
      return FaTablet;
    } else {
      return FaDesktop;
    }
  };

  const formatTimeAgo = (date: Date) => {
    const now = new Date();
    const diffInHours = Math.floor((now.getTime() - date.getTime()) / (1000 * 60 * 60));
    
    if (diffInHours < 1) {
      return 'Hace unos minutos';
    } else if (diffInHours < 24) {
      return `Hace ${diffInHours} hora${diffInHours !== 1 ? 's' : ''}`;
    } else {
      const diffInDays = Math.floor(diffInHours / 24);
      return `Hace ${diffInDays} día${diffInDays !== 1 ? 's' : ''}`;
    }
  };

  return (
    <div className="bg-white dark:bg-slate-800 rounded-xl shadow-lg p-6">
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 bg-indigo-100 dark:bg-indigo-900/30 rounded-lg flex items-center justify-center">
            <FaHistory className="w-5 h-5 text-indigo-600 dark:text-indigo-400" />
          </div>
          <div>
            <h3 className="text-lg font-semibold text-slate-900 dark:text-white">
              Actividad del Usuario
            </h3>
            <p className="text-sm text-slate-500 dark:text-slate-400">
              Historial de accesos y cambios en tu cuenta
            </p>
          </div>
        </div>
      </div>

      {/* Tabs */}
      <div className="flex border-b border-slate-200 dark:border-slate-600 mb-6">
        <button
          onClick={() => setSelectedTab('activity')}
          className={`px-4 py-2 text-sm font-medium border-b-2 ${
            selectedTab === 'activity'
              ? 'border-indigo-600 text-indigo-600 dark:text-indigo-400'
              : 'border-transparent text-slate-500 dark:text-slate-400 hover:text-slate-700 dark:hover:text-slate-300'
          }`}
        >
          Actividad Reciente
        </button>
        <button
          onClick={() => setSelectedTab('sessions')}
          className={`px-4 py-2 text-sm font-medium border-b-2 ${
            selectedTab === 'sessions'
              ? 'border-indigo-600 text-indigo-600 dark:text-indigo-400'
              : 'border-transparent text-slate-500 dark:text-slate-400 hover:text-slate-700 dark:hover:text-slate-300'
          }`}
        >
          Sesiones Activas
        </button>
      </div>

      {/* Activity Tab */}
      {selectedTab === 'activity' && (
        <div className="space-y-4">
          {activities.map((activity) => {
            const ActivityIcon = getActivityIcon(activity.type);
            const DeviceIcon = getDeviceIcon(activity.device);
            
            return (
              <div
                key={activity.id}
                className={`p-4 rounded-lg border-l-4 ${
                  activity.success
                    ? 'border-green-500 bg-green-50 dark:bg-green-950/20'
                    : 'border-red-500 bg-red-50 dark:bg-red-950/20'
                }`}
              >
                <div className="flex items-start justify-between">
                  <div className="flex items-start gap-3 flex-1">
                    <div className={`p-2 rounded-lg ${getActivityColor(activity.type, activity.success)}`}>
                      <ActivityIcon className="w-4 h-4" />
                    </div>
                    
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-2">
                        <h4 className="font-medium text-slate-900 dark:text-white">
                          {activity.description}
                        </h4>
                        {!activity.success && (
                          <span className="px-2 py-1 bg-red-100 dark:bg-red-900/30 text-red-600 dark:text-red-400 rounded-full text-xs font-medium">
                            Fallido
                          </span>
                        )}
                      </div>
                      
                      <div className="grid grid-cols-2 md:grid-cols-4 gap-2 text-sm text-slate-600 dark:text-slate-400">
                        <div className="flex items-center gap-1">
                          <FaClock className="w-3 h-3" />
                          <span>{formatTimeAgo(activity.timestamp)}</span>
                        </div>
                        
                        <div className="flex items-center gap-1">
                          <DeviceIcon className="w-3 h-3" />
                          <span>{activity.device}</span>
                        </div>
                        
                        <div className="flex items-center gap-1">
                          <FaGlobe className="w-3 h-3" />
                          <span>{activity.browser}</span>
                        </div>
                        
                        <div className="flex items-center gap-1">
                          <FaMapMarkerAlt className="w-3 h-3" />
                          <span>{activity.location || 'Desconocida'}</span>
                        </div>
                      </div>
                      
                      <div className="mt-2 text-xs text-slate-500 dark:text-slate-500">
                        IP: {activity.ipAddress} • {activity.timestamp.toLocaleDateString('es-CO', {
                          year: 'numeric',
                          month: 'short',
                          day: 'numeric',
                          hour: '2-digit',
                          minute: '2-digit'
                        })}
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            );
          })}
          
          {activities.length === 0 && (
            <div className="text-center py-8">
              <FaHistory className="w-12 h-12 text-slate-300 dark:text-slate-600 mx-auto mb-4" />
              <p className="text-slate-500 dark:text-slate-400">
                No hay actividad reciente registrada
              </p>
            </div>
          )}
        </div>
      )}

      {/* Sessions Tab */}
      {selectedTab === 'sessions' && (
        <div className="space-y-4">
          {sessions.map((session) => {
            const DeviceIcon = getDeviceIcon(session.device);
            
            return (
              <div
                key={session.id}
                className={`p-4 rounded-lg border-2 ${
                  session.current
                    ? 'border-green-200 dark:border-green-800 bg-green-50 dark:bg-green-950/20'
                    : 'border-slate-200 dark:border-slate-600 bg-slate-50 dark:bg-slate-700'
                }`}
              >
                <div className="flex items-start justify-between">
                  <div className="flex items-start gap-3 flex-1">
                    <div className={`p-2 rounded-lg ${
                      session.current
                        ? 'bg-green-100 dark:bg-green-900/30 text-green-600 dark:text-green-400'
                        : 'bg-slate-100 dark:bg-slate-600 text-slate-600 dark:text-slate-400'
                    }`}>
                      <DeviceIcon className="w-5 h-5" />
                    </div>
                    
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-2">
                        <h4 className="font-medium text-slate-900 dark:text-white">
                          {session.device}
                        </h4>
                        {session.current && (
                          <span className="px-2 py-1 bg-green-100 dark:bg-green-900/30 text-green-600 dark:text-green-400 rounded-full text-xs font-medium">
                            Sesión Actual
                          </span>
                        )}
                      </div>
                      
                      <div className="grid grid-cols-1 md:grid-cols-3 gap-2 text-sm text-slate-600 dark:text-slate-400 mb-2">
                        <div>
                          <span className="font-medium">Navegador:</span> {session.browser}
                        </div>
                        <div>
                          <span className="font-medium">SO:</span> {session.os}
                        </div>
                        <div>
                          <span className="font-medium">Ubicación:</span> {session.location}
                        </div>
                      </div>
                      
                      <div className="text-xs text-slate-500 dark:text-slate-500">
                        IP: {session.ipAddress} • Última actividad: {formatTimeAgo(session.lastActive)}
                      </div>
                    </div>
                  </div>
                  
                  {!session.current && (
                    <button
                      onClick={() => {
                        // Aquí iría la lógica para cerrar sesión
                        setSessions(prev => prev.filter(s => s.id !== session.id));
                      }}
                      className="px-3 py-1 bg-red-100 dark:bg-red-900/30 hover:bg-red-200 dark:hover:bg-red-800/50 text-red-600 dark:text-red-400 rounded-lg text-sm font-medium"
                    >
                      Cerrar Sesión
                    </button>
                  )}
                </div>
              </div>
            );
          })}
          
          {sessions.length === 0 && (
            <div className="text-center py-8">
              <FaDesktop className="w-12 h-12 text-slate-300 dark:text-slate-600 mx-auto mb-4" />
              <p className="text-slate-500 dark:text-slate-400">
                No hay sesiones activas
              </p>
            </div>
          )}
        </div>
      )}

      {/* Security Summary */}
      <div className="mt-6 pt-4 border-t border-slate-200 dark:border-slate-600">
        <div className="bg-slate-50 dark:bg-slate-700 rounded-lg p-4">
          <div className="flex items-start gap-3">
            <FaShieldAlt className="w-5 h-5 text-blue-600 dark:text-blue-400 mt-0.5 shrink-0" />
            <div className="flex-1">
              <h4 className="font-medium text-slate-900 dark:text-white mb-2">
                Resumen de Seguridad
              </h4>
              
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm">
                <div className="bg-white dark:bg-slate-800 rounded-lg p-3">
                  <div className="text-slate-600 dark:text-slate-400 mb-1">Último acceso</div>
                  <div className="font-medium text-slate-900 dark:text-white">
                    {user.lastLogin ? formatTimeAgo(new Date(user.lastLogin)) : 'No registrado'}
                  </div>
                </div>
                
                <div className="bg-white dark:bg-slate-800 rounded-lg p-3">
                  <div className="text-slate-600 dark:text-slate-400 mb-1">Sesiones activas</div>
                  <div className="font-medium text-slate-900 dark:text-white">
                    {sessions.length} dispositivo{sessions.length !== 1 ? 's' : ''}
                  </div>
                </div>
                
                <div className="bg-white dark:bg-slate-800 rounded-lg p-3">
                  <div className="text-slate-600 dark:text-slate-400 mb-1">Intentos fallidos</div>
                  <div className="font-medium text-slate-900 dark:text-white">
                    {activities.filter(a => !a.success).length} en 30 días
                  </div>
                </div>
              </div>
              
              <div className="mt-3 text-xs text-slate-600 dark:text-slate-400">
                💡 <strong>Consejo de seguridad:</strong> Si detectas actividad sospechosa, 
                cambia tu contraseña inmediatamente y contacta al administrador.
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}