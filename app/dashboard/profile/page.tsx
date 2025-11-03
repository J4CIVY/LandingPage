'use client';

import { useState, useEffect, type ComponentType } from 'react';
import { FaUser, FaHeart, FaMotorcycle, FaFileAlt, FaCog, FaHistory, FaCrown, FaExclamationCircle } from 'react-icons/fa';
import { 
  ProfileHeader, 
  PersonalInfo, 
  EmergencyContact, 
  MedicalData, 
  MotorcycleInfo, 
  Documents, 
  AccountSettings, 
  UserActivity, 
  AdminOptions 
} from '@/components/dashboard/profile';
import { useAuth } from '@/hooks/useAuth';
import { useProfile } from '@/hooks/useProfile';

interface ProfileTab {
  id: string;
  label: string;
  icon: ComponentType<{className?: string}>;
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  component: ComponentType<any>;
  adminOnly?: boolean;
  description: string;
}

export default function ProfilePage() {
  const { user: authUser } = useAuth();
  const { profileData, loading, error, profileCompletion, updateProfile, refresh } = useProfile();
  const [currentUserRole, setCurrentUserRole] = useState<'user' | 'admin' | 'super-admin'>('user');
  const [activeTab, setActiveTab] = useState('personal');
  const [isEditMode, setIsEditMode] = useState(false);
  const [hasUnsavedChanges, setHasUnsavedChanges] = useState(false);
  const [showUnsavedModal, setShowUnsavedModal] = useState(false);
  const [pendingTab, setPendingTab] = useState<string | null>(null);

  // Set user role from auth data
  useEffect(() => {
    if (authUser?.role) {
      setCurrentUserRole(authUser.role);
    }
  }, [authUser]);

  // Use profileData or fallback to authUser
  const user = profileData || authUser;

  // Configuración de pestañas
  const profileTabs: ProfileTab[] = [
    {
      id: 'personal',
      label: 'Información Personal',
      icon: FaUser,
      component: PersonalInfo,
      description: 'Datos personales, contacto y dirección'
    },
    {
      id: 'emergency',
      label: 'Contacto de Emergencia',
      icon: FaHeart,
      component: EmergencyContact,
      description: 'Contacto de emergencia y datos médicos básicos'
    },
    {
      id: 'medical',
      label: 'Datos Médicos',
      icon: FaHeart,
      component: MedicalData,
      description: 'Información médica privada y de salud'
    },
    {
      id: 'motorcycle',
      label: 'Información de Motocicleta',
      icon: FaMotorcycle,
      component: MotorcycleInfo,
      description: 'Motocicletas, licencias y experiencia'
    },
    {
      id: 'documents',
      label: 'Documentos',
      icon: FaFileAlt,
      component: Documents,
      description: 'Gestión de documentos digitales'
    },
    {
      id: 'account',
      label: 'Configuración de Cuenta',
      icon: FaCog,
      component: AccountSettings,
      description: 'Seguridad, notificaciones y privacidad'
    },
    {
      id: 'activity',
      label: 'Actividad del Usuario',
      icon: FaHistory,
      component: UserActivity,
      description: 'Historial de actividad y sesiones'
    },
    {
      id: 'admin',
      label: 'Opciones Administrativas',
      icon: FaCrown,
      component: AdminOptions,
      adminOnly: true,
      description: 'Panel de administración y control'
    }
  ];

  // Filtrar pestañas según el rol del usuario
  const visibleTabs = profileTabs.filter(tab => 
    !tab.adminOnly || (tab.adminOnly && (currentUserRole === 'admin' || currentUserRole === 'super-admin'))
  );

  // Handlers para callbacks de componentes
  const handleAvatarUpload = async (_file: File) => { // eslint-disable-line @typescript-eslint/no-unused-vars
    // Implementar subida de avatar
  };

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const handleUserUpdate = async (updatedData: any) => {
    // Implementar actualización de usuario usando el hook
    try {
      await updateProfile(updatedData);
      setHasUnsavedChanges(false);
    } catch (error) {
      console.error('Error updating profile:', error);
    }
  };

  const handleStatusChange = async () => {
    // TODO: Implement status change functionality
    // Expected parameter: newStatus: 'active' | 'suspended' | 'inactive'
  };

  const handleRoleChange = async () => {
    // TODO: Implement role change functionality
    // Expected parameters: newRole: 'user' | 'admin'
  };

  const handleDocumentApproval = async () => {
    // TODO: Implement document approval functionality
    // Expected parameters: documentId: string, approved: boolean, notes?: string
  };

  const handleProfileApproval = async () => {
    // TODO: Implement profile approval functionality
    // Expected parameters: approved: boolean, notes?: string
  };

  const handleGenerateReport = async () => {
    // Implementar generación de reporte
    if (user) {
      // TODO: Implement report generation
    }
  };

  // Manejar cambio de pestaña con verificación de cambios no guardados
  const handleTabChange = (newTab: string) => {
    if (hasUnsavedChanges) {
      setPendingTab(newTab);
      setShowUnsavedModal(true);
    } else {
      setActiveTab(newTab);
      setIsEditMode(false);
    }
  };

  // Confirmar cambio de pestaña descartando cambios
  const confirmTabChange = () => {
    if (pendingTab) {
      setActiveTab(pendingTab);
      setPendingTab(null);
      setHasUnsavedChanges(false);
      setIsEditMode(false);
    }
    setShowUnsavedModal(false);
  };

  // Cancelar cambio de pestaña
  const cancelTabChange = () => {
    setPendingTab(null);
    setShowUnsavedModal(false);
  };

  // Obtener el componente activo
  const ActiveComponent = visibleTabs.find(tab => tab.id === activeTab)?.component || PersonalInfo;

  // Props comunes para todos los componentes
  const commonProps = {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    user: user as any,
    isEditMode,
    onEdit: () => setIsEditMode(true),
    onSave: handleUserUpdate,
    onCancel: () => {
      setIsEditMode(false);
      setHasUnsavedChanges(false);
    },
    onChange: () => setHasUnsavedChanges(true)
  };

  // Props específicos para AdminOptions
  const adminProps = activeTab === 'admin' ? {
    currentUserRole,
    onStatusChange: handleStatusChange,
    onRoleChange: handleRoleChange,
    onDocumentApproval: handleDocumentApproval,
    onProfileApproval: handleProfileApproval,
    onGenerateReport: handleGenerateReport
  } : {};

  // Show loading state
  if (loading) {
    return (
      <div className="min-h-screen bg-linear-to-br from-slate-50 to-blue-50 dark:from-slate-900 dark:to-slate-800 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-slate-600 dark:text-slate-400">Cargando perfil...</p>
        </div>
      </div>
    );
  }

  // Show error state
  if (error) {
    return (
      <div className="min-h-screen bg-linear-to-br from-slate-50 to-blue-50 dark:from-slate-900 dark:to-slate-800 flex items-center justify-center">
        <div className="text-center">
          <FaExclamationCircle className="w-12 h-12 text-red-500 mx-auto mb-4" />
          <h2 className="text-xl font-semibold text-slate-900 dark:text-white mb-2">Error al cargar el perfil</h2>
          <p className="text-slate-600 dark:text-slate-400 mb-4">{error}</p>
          <button
            onClick={refresh}
            className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg font-medium transition-colors duration-200"
          >
            Reintentar
          </button>
        </div>
      </div>
    );
  }

  // Don't render if no user data
  if (!user) {
    return (
      <div className="min-h-screen bg-linear-to-br from-slate-50 to-blue-50 dark:from-slate-900 dark:to-slate-800 flex items-center justify-center">
        <div className="text-center">
          <FaExclamationCircle className="w-12 h-12 text-amber-500 mx-auto mb-4" />
          <h2 className="text-xl font-semibold text-slate-900 dark:text-white mb-2">No se encontró información del usuario</h2>
          <p className="text-slate-600 dark:text-slate-400">Por favor, inicia sesión nuevamente.</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-linear-to-br from-slate-50 to-blue-50 dark:from-slate-900 dark:to-slate-800">
      <div className="container mx-auto px-4 py-8 max-w-7xl">
        {/* Page Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-slate-900 dark:text-white mb-2">
            Perfil de Usuario
          </h1>
          <p className="text-slate-600 dark:text-slate-400">
            Gestiona tu información personal, documentos y configuración de cuenta
          </p>
        </div>

        {/* Profile Header - Always visible */}
        <div className="mb-8">
          <ProfileHeader 
            onAvatarUpload={handleAvatarUpload}
            {...commonProps}
          />
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
          {/* Sidebar Navigation */}
          <div className="lg:col-span-1">
            <div className="bg-white dark:bg-slate-800 rounded-xl shadow-lg p-4 sticky top-4">
              <h3 className="text-lg font-semibold text-slate-900 dark:text-white mb-4">
                Secciones del Perfil
              </h3>
              
              <nav className="space-y-2">
                {visibleTabs.map((tab) => {
                  const Icon = tab.icon;
                  const isActive = activeTab === tab.id;
                  
                  return (
                    <button
                      key={tab.id}
                      onClick={() => handleTabChange(tab.id)}
                      className={`w-full flex items-center gap-3 px-3 py-3 rounded-lg text-left transition-all duration-200 ${
                        isActive
                          ? 'bg-blue-100 dark:bg-blue-900/30 text-blue-700 dark:text-blue-300 border-l-4 border-blue-500'
                          : 'text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-700 hover:text-slate-900 dark:hover:text-slate-100'
                      }`}
                    >
                      <Icon className={`w-4 h-4 shrink-0 ${
                        isActive ? 'text-blue-600 dark:text-blue-400' : ''
                      }`} />
                      <div className="flex-1 min-w-0">
                        <div className="font-medium text-sm truncate">
                          {tab.label}
                        </div>
                        <div className="text-xs opacity-75 truncate">
                          {tab.description}
                        </div>
                      </div>
                    </button>
                  );
                })}
              </nav>

              {/* Progress Indicator */}
              <div className="mt-6 pt-4 border-t border-slate-200 dark:border-slate-600">
                <div className="flex items-center justify-between text-sm text-slate-600 dark:text-slate-400 mb-2">
                  <span>Completitud del perfil</span>
                  <span className="font-medium">{profileCompletion}%</span>
                </div>
                <div className="w-full bg-slate-200 dark:bg-slate-700 rounded-full h-2">
                  <div 
                    className="bg-linear-to-r from-blue-500 to-green-500 h-2 rounded-full transition-all duration-300"
                    style={{ width: `${profileCompletion}%` }}
                  ></div>
                </div>
                <p className="text-xs text-slate-500 dark:text-slate-500 mt-1">
                  Completa tu información para mejorar tu experiencia
                </p>
              </div>
            </div>
          </div>

          {/* Main Content */}
          <div className="lg:col-span-3">
            <div className="bg-white dark:bg-slate-800 rounded-xl shadow-lg">
              {/* Tab Content Header */}
              <div className="border-b border-slate-200 dark:border-slate-600 p-6">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    {(() => {
                      const currentTab = visibleTabs.find(tab => tab.id === activeTab);
                      const Icon = currentTab?.icon || FaUser;
                      return (
                        <>
                          <div className="p-2 bg-blue-100 dark:bg-blue-900/30 rounded-lg">
                            <Icon className="w-5 h-5 text-blue-600 dark:text-blue-400" />
                          </div>
                          <div>
                            <h2 className="text-xl font-semibold text-slate-900 dark:text-white">
                              {currentTab?.label}
                            </h2>
                            <p className="text-sm text-slate-600 dark:text-slate-400">
                              {currentTab?.description}
                            </p>
                          </div>
                        </>
                      );
                    })()}
                  </div>

                  {/* Edit Mode Indicator */}
                  {isEditMode && activeTab !== 'admin' && activeTab !== 'activity' && (
                    <div className="flex items-center gap-2">
                      <span className="text-sm text-amber-600 dark:text-amber-400 font-medium">
                        Modo de edición activo
                      </span>
                      <div className="w-2 h-2 bg-amber-500 rounded-full animate-pulse"></div>
                    </div>
                  )}
                </div>
              </div>

              {/* Tab Content */}
              <div className="p-6">
                <ActiveComponent 
                  {...commonProps}
                  {...adminProps}
                />
              </div>
            </div>
          </div>
        </div>

        {/* Unsaved Changes Modal */}
        {showUnsavedModal && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
            <div className="bg-white dark:bg-slate-800 rounded-lg p-6 w-full max-w-md mx-4">
              <div className="flex items-start gap-3">
                <div className="shrink-0">
                  <FaExclamationCircle className="w-6 h-6 text-amber-500" />
                </div>
                <div className="flex-1">
                  <h3 className="text-lg font-semibold text-slate-900 dark:text-white mb-2">
                    Cambios sin guardar
                  </h3>
                  <p className="text-sm text-slate-600 dark:text-slate-400 mb-4">
                    Tienes cambios sin guardar en esta sección. Si continúas, se perderán estos cambios.
                  </p>
                  
                  <div className="flex items-center gap-3">
                    <button
                      onClick={cancelTabChange}
                      className="flex-1 px-4 py-2 bg-slate-500 hover:bg-slate-600 text-white rounded-lg font-medium transition-colors duration-200"
                    >
                      Quedarse aquí
                    </button>
                    <button
                      onClick={confirmTabChange}
                      className="flex-1 px-4 py-2 bg-red-600 hover:bg-red-700 text-white rounded-lg font-medium transition-colors duration-200"
                    >
                      Descartar cambios
                    </button>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}