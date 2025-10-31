'use client';

import { useState, useEffect } from 'react';
import { FaCog, FaLock, FaEnvelope, FaBell, FaShieldAlt, FaEye, FaEyeSlash, FaSave, FaTimes, FaExclamationTriangle, FaCheckCircle } from 'react-icons/fa';
import { IUser } from '@/lib/models/User';

interface AccountSettingsProps {
  user: IUser;
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  onSave?: (data: any) => Promise<void>;
  isEditing?: boolean;
  onEditToggle?: () => void;
}

interface PasswordData {
  currentPassword: string;
  newPassword: string;
  confirmPassword: string;
}

interface NotificationSettings {
  emailNotifications: boolean;
  smsNotifications: boolean;
  pushNotifications: boolean;
  eventReminders: boolean;
  membershipAlerts: boolean;
  securityAlerts: boolean;
}

export default function AccountSettings({ user, onSave, isEditing = false, onEditToggle }: AccountSettingsProps) {
  const [passwordData, setPasswordData] = useState<PasswordData>({
    currentPassword: '',
    newPassword: '',
    confirmPassword: ''
  });

  const [newEmail, setNewEmail] = useState(user.email || '');
  const [showPasswords, setShowPasswords] = useState({
    current: false,
    new: false,
    confirm: false
  });

  const [notifications, setNotifications] = useState<NotificationSettings>({
    emailNotifications: true,
    smsNotifications: false,
    pushNotifications: true,
    eventReminders: true,
    membershipAlerts: true,
    securityAlerts: true
  });

  const [isSaving, setIsSaving] = useState(false);
  const [localIsEditing, setLocalIsEditing] = useState(isEditing);
  const [errors, setErrors] = useState<{[key: string]: string}>({});

  useEffect(() => {
    setLocalIsEditing(isEditing);
  }, [isEditing]);

  const validatePassword = () => {
    const newErrors: {[key: string]: string} = {};

    if (passwordData.newPassword) {
      if (passwordData.newPassword.length < 8) {
        newErrors.newPassword = 'La contraseña debe tener al menos 8 caracteres';
      }
      if (!/(?=.*[a-z])/.test(passwordData.newPassword)) {
        newErrors.newPassword = 'Debe contener al menos una letra minúscula';
      }
      if (!/(?=.*[A-Z])/.test(passwordData.newPassword)) {
        newErrors.newPassword = 'Debe contener al menos una letra mayúscula';
      }
      if (!/(?=.*\d)/.test(passwordData.newPassword)) {
        newErrors.newPassword = 'Debe contener al menos un número';
      }
      if (passwordData.newPassword !== passwordData.confirmPassword) {
        newErrors.confirmPassword = 'Las contraseñas no coinciden';
      }
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handlePasswordChange = (field: keyof PasswordData, value: string) => {
    setPasswordData(prev => ({ ...prev, [field]: value }));
    if (errors[field]) {
      setErrors(prev => ({ ...prev, [field]: '' }));
    }
  };

  const handleNotificationChange = (setting: keyof NotificationSettings) => {
    setNotifications(prev => ({ ...prev, [setting]: !prev[setting] }));
  };

  const handleSave = async () => {
    if (!validatePassword()) return;

    setIsSaving(true);
    try {
      if (onSave) {
        await onSave({
          email: newEmail !== user.email ? newEmail : undefined,
          password: passwordData.newPassword || undefined,
          currentPassword: passwordData.currentPassword || undefined,
          notifications
        });
      }
      
      // Reset password fields after successful save
      setPasswordData({
        currentPassword: '',
        newPassword: '',
        confirmPassword: ''
      });
      
      setLocalIsEditing(false);
      if (onEditToggle) onEditToggle();
    } catch (error) {
      console.error('Error saving account settings:', error);
    } finally {
      setIsSaving(false);
    }
  };

  const handleCancel = () => {
    setNewEmail(user.email || '');
    setPasswordData({
      currentPassword: '',
      newPassword: '',
      confirmPassword: ''
    });
    setErrors({});
    setLocalIsEditing(false);
    if (onEditToggle) onEditToggle();
  };

  const handleEditToggle = () => {
    if (localIsEditing) {
      handleCancel();
    } else {
      setLocalIsEditing(true);
      if (onEditToggle) onEditToggle();
    }
  };

  return (
    <div className="bg-white dark:bg-slate-800 rounded-xl shadow-lg p-6">
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 bg-slate-100 dark:bg-slate-700 rounded-lg flex items-center justify-center">
            <FaCog className="w-5 h-5 text-slate-600 dark:text-slate-400" />
          </div>
          <div>
            <h3 className="text-lg font-semibold text-slate-900 dark:text-white">
              Configuración de Cuenta
            </h3>
            <p className="text-sm text-slate-500 dark:text-slate-400">
              Gestiona tu contraseña, email y preferencias
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2">
          {localIsEditing ? (
            <>
              <button
                onClick={handleSave}
                disabled={isSaving}
                className="inline-flex items-center gap-2 px-3 py-2 bg-green-600 hover:bg-green-700 disabled:bg-green-400 text-white rounded-lg text-sm font-medium"
              >
                <FaSave className="w-4 h-4" />
                {isSaving ? 'Guardando...' : 'Guardar'}
              </button>
              <button
                onClick={handleCancel}
                disabled={isSaving}
                className="inline-flex items-center gap-2 px-3 py-2 bg-slate-500 hover:bg-slate-600 disabled:bg-slate-400 text-white rounded-lg text-sm font-medium"
              >
                <FaTimes className="w-4 h-4" />
                Cancelar
              </button>
            </>
          ) : (
            <button
              onClick={handleEditToggle}
              className="inline-flex items-center gap-2 px-3 py-2 bg-slate-100 hover:bg-slate-200 dark:bg-slate-700 dark:hover:bg-slate-600 text-slate-700 dark:text-slate-300 rounded-lg text-sm font-medium"
            >
              <FaCog className="w-4 h-4" />
              Configurar
            </button>
          )}
        </div>
      </div>

      <div className="space-y-6">
        {/* Email Settings */}
        <div className="border border-slate-200 dark:border-slate-600 rounded-lg p-4">
          <h4 className="text-md font-medium text-slate-900 dark:text-white mb-4 flex items-center gap-2">
            <FaEnvelope className="w-4 h-4 text-blue-500" />
            Correo Electrónico
          </h4>
          
          <div className="space-y-3">
            <div>
              <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">
                Email Actual
              </label>
              <div className="flex items-center gap-2">
                {localIsEditing ? (
                  <input
                    type="email"
                    value={newEmail}
                    onChange={(e) => setNewEmail(e.target.value)}
                    className="flex-1 px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent dark:bg-slate-700 dark:border-slate-600 dark:text-white"
                  />
                ) : (
                  <div className="flex-1 px-3 py-2 bg-slate-50 dark:bg-slate-700 rounded-lg text-slate-900 dark:text-white">
                    {user.email}
                  </div>
                )}
                
                <div className={`px-2 py-1 rounded-full text-xs font-medium ${
                  user.isEmailVerified 
                    ? 'bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-300' 
                    : 'bg-yellow-100 dark:bg-yellow-900/30 text-yellow-700 dark:text-yellow-300'
                }`}>
                  {user.isEmailVerified ? 'Verificado' : 'Sin verificar'}
                </div>
              </div>
            </div>
            
            {newEmail !== user.email && localIsEditing && (
              <div className="bg-amber-50 dark:bg-amber-950/20 border border-amber-200 dark:border-amber-800 rounded-lg p-3">
                <p className="text-sm text-amber-700 dark:text-amber-300">
                  ⚠️ Al cambiar tu email deberás verificar la nueva dirección
                </p>
              </div>
            )}
          </div>
        </div>

        {/* Password Settings */}
        <div className="border border-slate-200 dark:border-slate-600 rounded-lg p-4">
          <h4 className="text-md font-medium text-slate-900 dark:text-white mb-4 flex items-center gap-2">
            <FaLock className="w-4 h-4 text-red-500" />
            Cambiar Contraseña
          </h4>
          
          {localIsEditing ? (
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">
                  Contraseña Actual
                </label>
                <div className="relative">
                  <input
                    type={showPasswords.current ? 'text' : 'password'}
                    value={passwordData.currentPassword}
                    onChange={(e) => handlePasswordChange('currentPassword', e.target.value)}
                    className="w-full px-3 py-2 pr-10 border border-slate-300 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-transparent dark:bg-slate-700 dark:border-slate-600 dark:text-white"
                    placeholder="Ingresa tu contraseña actual"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPasswords(prev => ({ ...prev, current: !prev.current }))}
                    className="absolute right-3 top-1/2 transform -translate-y-1/2 text-slate-400 hover:text-slate-600"
                  >
                    {showPasswords.current ? <FaEyeSlash /> : <FaEye />}
                  </button>
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">
                  Nueva Contraseña
                </label>
                <div className="relative">
                  <input
                    type={showPasswords.new ? 'text' : 'password'}
                    value={passwordData.newPassword}
                    onChange={(e) => handlePasswordChange('newPassword', e.target.value)}
                    className={`w-full px-3 py-2 pr-10 border rounded-lg focus:ring-2 focus:ring-red-500 focus:border-transparent dark:bg-slate-700 dark:border-slate-600 dark:text-white ${
                      errors.newPassword ? 'border-red-500' : 'border-slate-300'
                    }`}
                    placeholder="Mínimo 8 caracteres, mayúsculas, minúsculas y números"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPasswords(prev => ({ ...prev, new: !prev.new }))}
                    className="absolute right-3 top-1/2 transform -translate-y-1/2 text-slate-400 hover:text-slate-600"
                  >
                    {showPasswords.new ? <FaEyeSlash /> : <FaEye />}
                  </button>
                </div>
                {errors.newPassword && (
                  <p className="mt-1 text-sm text-red-600 flex items-center gap-1">
                    <FaExclamationTriangle className="w-3 h-3" />
                    {errors.newPassword}
                  </p>
                )}
              </div>

              <div>
                <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">
                  Confirmar Nueva Contraseña
                </label>
                <div className="relative">
                  <input
                    type={showPasswords.confirm ? 'text' : 'password'}
                    value={passwordData.confirmPassword}
                    onChange={(e) => handlePasswordChange('confirmPassword', e.target.value)}
                    className={`w-full px-3 py-2 pr-10 border rounded-lg focus:ring-2 focus:ring-red-500 focus:border-transparent dark:bg-slate-700 dark:border-slate-600 dark:text-white ${
                      errors.confirmPassword ? 'border-red-500' : 'border-slate-300'
                    }`}
                    placeholder="Repite la nueva contraseña"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPasswords(prev => ({ ...prev, confirm: !prev.confirm }))}
                    className="absolute right-3 top-1/2 transform -translate-y-1/2 text-slate-400 hover:text-slate-600"
                  >
                    {showPasswords.confirm ? <FaEyeSlash /> : <FaEye />}
                  </button>
                </div>
                {errors.confirmPassword && (
                  <p className="mt-1 text-sm text-red-600 flex items-center gap-1">
                    <FaExclamationTriangle className="w-3 h-3" />
                    {errors.confirmPassword}
                  </p>
                )}
              </div>
            </div>
          ) : (
            <div className="bg-slate-50 dark:bg-slate-700 rounded-lg p-4">
              <p className="text-sm text-slate-600 dark:text-slate-400">
                Tu contraseña fue actualizada por última vez hace algunos días.
              </p>
              <p className="text-xs text-slate-500 dark:text-slate-500 mt-1">
                Se recomienda cambiar la contraseña cada 3-6 meses por seguridad.
              </p>
            </div>
          )}
        </div>

        {/* Notification Settings */}
        <div className="border border-slate-200 dark:border-slate-600 rounded-lg p-4">
          <h4 className="text-md font-medium text-slate-900 dark:text-white mb-4 flex items-center gap-2">
            <FaBell className="w-4 h-4 text-yellow-500" />
            Preferencias de Notificación
          </h4>
          
          <div className="space-y-3">
            {Object.entries({
              emailNotifications: 'Notificaciones por Email',
              smsNotifications: 'Notificaciones por SMS',
              pushNotifications: 'Notificaciones Push',
              eventReminders: 'Recordatorios de Eventos',
              membershipAlerts: 'Alertas de Membresía',
              securityAlerts: 'Alertas de Seguridad'
            }).map(([key, label]) => (
              <div key={key} className="flex items-center justify-between">
                <div>
                  <label className="text-sm font-medium text-slate-700 dark:text-slate-300">
                    {label}
                  </label>
                  {key === 'securityAlerts' && (
                    <p className="text-xs text-slate-500 dark:text-slate-400">
                      Recomendado: mantener activado para seguridad
                    </p>
                  )}
                </div>
                <button
                  type="button"
                  onClick={() => localIsEditing && handleNotificationChange(key as keyof NotificationSettings)}
                  disabled={!localIsEditing || key === 'securityAlerts'}
                  className={`relative inline-flex h-6 w-11 items-center rounded-full ${
                    notifications[key as keyof NotificationSettings]
                      ? 'bg-green-600'
                      : 'bg-slate-300 dark:bg-slate-600'
                  } ${!localIsEditing || key === 'securityAlerts' ? 'opacity-50 cursor-not-allowed' : 'cursor-pointer'}`}
                >
                  <span
                    className={`inline-block h-4 w-4 transform rounded-full bg-white ${
                      notifications[key as keyof NotificationSettings] ? 'translate-x-6' : 'translate-x-1'
                    }`}
                  />
                </button>
              </div>
            ))}
          </div>
        </div>

        {/* Two-Factor Authentication (Placeholder) */}
        <div className="border border-slate-200 dark:border-slate-600 rounded-lg p-4">
          <h4 className="text-md font-medium text-slate-900 dark:text-white mb-4 flex items-center gap-2">
            <FaShieldAlt className="w-4 h-4 text-green-500" />
            Autenticación de Dos Factores
          </h4>
          
          <div className="bg-blue-50 dark:bg-blue-950/20 border border-blue-200 dark:border-blue-800 rounded-lg p-4">
            <div className="flex items-start gap-3">
              <FaShieldAlt className="w-5 h-5 text-blue-600 dark:text-blue-400 mt-0.5 shrink-0" />
              <div>
                <h5 className="font-medium text-blue-900 dark:text-blue-100 mb-2">
                  Próximamente: Autenticación de Dos Factores
                </h5>
                <p className="text-sm text-blue-700 dark:text-blue-300 mb-3">
                  Pronto podrás activar la autenticación de dos factores (2FA) para mayor seguridad de tu cuenta.
                </p>
                <button
                  disabled
                  className="px-3 py-2 bg-blue-200 dark:bg-blue-800 text-blue-600 dark:text-blue-300 rounded-lg text-sm font-medium cursor-not-allowed opacity-60"
                >
                  Próximamente
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Footer */}
      <div className="mt-6 pt-4 border-t border-slate-200 dark:border-slate-600">
        <div className="bg-slate-50 dark:bg-slate-700 rounded-lg p-3">
          <div className="flex items-start gap-2">
            <FaCheckCircle className="w-4 h-4 text-green-600 dark:text-green-400 mt-0.5 shrink-0" />
            <div className="text-xs text-slate-600 dark:text-slate-400">
              <p className="font-medium mb-1">Consejos de Seguridad:</p>
              <ul className="space-y-1">
                <li>• Usa una contraseña única para tu cuenta de BSKMT</li>
                <li>• Nunca compartas tus credenciales con terceros</li>
                <li>• Mantén tu email verificado para recibir alertas importantes</li>
                <li>• Revisa regularmente la actividad de tu cuenta</li>
              </ul>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}