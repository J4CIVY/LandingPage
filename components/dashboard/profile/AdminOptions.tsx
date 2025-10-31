'use client';

import { useState } from 'react';
import { FaUserShield, FaCheck, FaTimes, FaEye, FaEdit, FaExclamationTriangle, FaClipboardCheck, FaCrown, FaHistory, FaDownload } from 'react-icons/fa';
import { IUser } from '@/lib/models/User';

interface AdminOptionsProps {
  user: IUser;
  currentUserRole: 'admin' | 'super-admin';
  onStatusChange?: (newStatus: 'active' | 'suspended' | 'inactive') => Promise<void>;
  onRoleChange?: (newRole: 'user' | 'admin') => Promise<void>;
  onDocumentApproval?: (documentId: string, approved: boolean, notes?: string) => Promise<void>;
  onProfileApproval?: (approved: boolean, notes?: string) => Promise<void>;
  onGenerateReport?: () => Promise<void>;
}

interface PendingDocument {
  id: string;
  name: string;
  type: string;
  uploadDate: Date;
  status: 'pending' | 'approved' | 'rejected';
  adminNotes?: string;
}

interface ProfileChange {
  id: string;
  field: string;
  oldValue: string;
  newValue: string;
  changeDate: Date;
  status: 'pending' | 'approved' | 'rejected';
  adminNotes?: string;
}

export default function AdminOptions({ 
  user, 
  currentUserRole, 
  onStatusChange, 
  onRoleChange, 
  onDocumentApproval, 
  onProfileApproval,
  onGenerateReport 
}: AdminOptionsProps) {
  // Mock data para documentos pendientes
  const [pendingDocuments] = useState<PendingDocument[]>([
    {
      id: '1',
      name: 'licencia_conduccion.jpg',
      type: 'Licencia de Conducción',
      uploadDate: new Date('2024-09-10'),
      status: 'pending'
    },
    {
      id: '2',
      name: 'soat_actualizado.pdf',
      type: 'SOAT',
      uploadDate: new Date('2024-09-12'),
      status: 'pending'
    }
  ]);

  // Mock data para cambios pendientes
  const [pendingChanges] = useState<ProfileChange[]>([
    {
      id: '1',
      field: 'Teléfono',
      oldValue: '+57 300 123 4567',
      newValue: '+57 300 987 6543',
      changeDate: new Date('2024-09-11'),
      status: 'pending'
    }
  ]);

  const [isChangingStatus, setIsChangingStatus] = useState(false);
  const [isChangingRole, setIsChangingRole] = useState(false);
  const [adminNotes, setAdminNotes] = useState('');
  const [showNotesModal, setShowNotesModal] = useState<{type: string, id: string} | null>(null);

  const membershipStatusOptions = [
    { value: 'active', label: 'Activo', color: 'text-green-600 bg-green-100' },
    { value: 'suspended', label: 'Suspendido', color: 'text-yellow-600 bg-yellow-100' },
    { value: 'inactive', label: 'Inactivo', color: 'text-red-600 bg-red-100' }
  ];

  const roleOptions = [
    { value: 'user', label: 'Usuario Regular', color: 'text-blue-600 bg-blue-100' },
    { value: 'admin', label: 'Administrador', color: 'text-purple-600 bg-purple-100' }
  ];

  const getCurrentStatus = () => {
    if (!user.isActive) return 'inactive';
    // Aquí puedes agregar lógica adicional para determinar si está suspendido
    return 'active';
  };

  const handleStatusChange = async (newStatus: 'active' | 'suspended' | 'inactive') => {
    if (onStatusChange) {
      setIsChangingStatus(true);
      try {
        await onStatusChange(newStatus);
      } finally {
        setIsChangingStatus(false);
      }
    }
  };

  const handleRoleChange = async (newRole: 'user' | 'admin') => {
    if (onRoleChange) {
      setIsChangingRole(true);
      try {
        await onRoleChange(newRole);
      } finally {
        setIsChangingRole(false);
      }
    }
  };

  const handleDocumentAction = async (documentId: string, approved: boolean) => {
    if (onDocumentApproval) {
      await onDocumentApproval(documentId, approved, adminNotes);
      setAdminNotes('');
      setShowNotesModal(null);
    }
  };

  const handleProfileAction = async (approved: boolean) => {
    if (onProfileApproval) {
      await onProfileApproval(approved, adminNotes);
      setAdminNotes('');
      setShowNotesModal(null);
    }
  };

  // Solo mostrar si el usuario actual es admin o super-admin
  if (currentUserRole !== 'admin' && currentUserRole !== 'super-admin') {
    return null;
  }

  return (
    <div className="bg-linear-to-br from-purple-50 to-indigo-50 dark:from-purple-950/20 dark:to-indigo-950/20 border-2 border-purple-200 dark:border-purple-800 rounded-xl shadow-lg p-6">
      {/* Admin Header */}
      <div className="bg-purple-100 dark:bg-purple-900/30 border border-purple-200 dark:border-purple-800 rounded-lg p-4 mb-6">
        <div className="flex items-start gap-3">
          <div className="shrink-0">
            <FaCrown className="w-6 h-6 text-purple-600 dark:text-purple-400" />
          </div>
          <div className="flex-1">
            <h3 className="text-lg font-semibold text-purple-900 dark:text-purple-100 mb-2">
              Panel de Administración
            </h3>
            <p className="text-sm text-purple-700 dark:text-purple-300 mb-2">
              <strong>ACCESO RESTRINGIDO:</strong> Las siguientes acciones están disponibles solo para administradores y afectan directamente la cuenta del usuario.
            </p>
            <p className="text-xs text-purple-600 dark:text-purple-400">
              ⚠️ Usuario objetivo: <strong>{user.firstName} {user.lastName}</strong> (#{user.membershipNumber})
            </p>
          </div>
        </div>
      </div>

      {/* User Status Management */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-6">
        {/* Membership Status */}
        <div className="bg-white dark:bg-slate-800 rounded-lg p-4 border border-purple-200 dark:border-purple-800">
          <h4 className="text-md font-medium text-slate-900 dark:text-white mb-4 flex items-center gap-2">
            <FaUserShield className="w-4 h-4 text-purple-500" />
            Estado de Membresía
          </h4>
          
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <span className="text-sm text-slate-600 dark:text-slate-400">Estado actual:</span>
              <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                membershipStatusOptions.find(opt => opt.value === getCurrentStatus())?.color
              }`}>
                {membershipStatusOptions.find(opt => opt.value === getCurrentStatus())?.label}
              </span>
            </div>
            
            <div>
              <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">
                Cambiar estado:
              </label>
              <div className="flex gap-2">
                {membershipStatusOptions.map(option => (
                  <button
                    key={option.value}
                    // eslint-disable-next-line @typescript-eslint/no-explicit-any
                    onClick={() => handleStatusChange(option.value as any)}
                    disabled={isChangingStatus || getCurrentStatus() === option.value}
                    className={`px-3 py-2 rounded-lg text-xs font-medium ${
                      getCurrentStatus() === option.value
                        ? option.color + ' opacity-50 cursor-not-allowed'
                        : 'bg-slate-100 dark:bg-slate-700 text-slate-700 dark:text-slate-300 hover:bg-slate-200 dark:hover:bg-slate-600'
                    }`}
                  >
                    {option.label}
                  </button>
                ))}
              </div>
            </div>
          </div>
        </div>

        {/* Role Management */}
        {currentUserRole === 'super-admin' && (
          <div className="bg-white dark:bg-slate-800 rounded-lg p-4 border border-purple-200 dark:border-purple-800">
            <h4 className="text-md font-medium text-slate-900 dark:text-white mb-4 flex items-center gap-2">
              <FaCrown className="w-4 h-4 text-orange-500" />
              Rol de Usuario
            </h4>
            
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-sm text-slate-600 dark:text-slate-400">Rol actual:</span>
                <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                  roleOptions.find(opt => opt.value === user.role)?.color
                }`}>
                  {roleOptions.find(opt => opt.value === user.role)?.label}
                </span>
              </div>
              
              <div>
                <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">
                  Cambiar rol:
                </label>
                <div className="flex gap-2">
                  {roleOptions.map(option => (
                    <button
                      key={option.value}
                      // eslint-disable-next-line @typescript-eslint/no-explicit-any
                      onClick={() => handleRoleChange(option.value as any)}
                      disabled={isChangingRole || user.role === option.value}
                      className={`px-3 py-2 rounded-lg text-xs font-medium ${
                        user.role === option.value
                          ? option.color + ' opacity-50 cursor-not-allowed'
                          : 'bg-slate-100 dark:bg-slate-700 text-slate-700 dark:text-slate-300 hover:bg-slate-200 dark:hover:bg-slate-600'
                      }`}
                    >
                      {option.label}
                    </button>
                  ))}
                </div>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Document Approval */}
      {pendingDocuments.length > 0 && (
        <div className="bg-white dark:bg-slate-800 rounded-lg p-4 border border-orange-200 dark:border-orange-800 mb-6">
          <h4 className="text-md font-medium text-slate-900 dark:text-white mb-4 flex items-center gap-2">
            <FaClipboardCheck className="w-4 h-4 text-orange-500" />
            Documentos Pendientes de Aprobación
          </h4>
          
          <div className="space-y-3">
            {pendingDocuments.map(doc => (
              <div key={doc.id} className="flex items-center justify-between p-3 bg-orange-50 dark:bg-orange-950/20 rounded-lg">
                <div className="flex-1">
                  <div className="font-medium text-slate-900 dark:text-white">{doc.type}</div>
                  <div className="text-sm text-slate-600 dark:text-slate-400">{doc.name}</div>
                  <div className="text-xs text-slate-500 dark:text-slate-500">
                    Subido: {doc.uploadDate.toLocaleDateString('es-CO')}
                  </div>
                </div>
                
                <div className="flex items-center gap-2">
                  <button
                    onClick={() => setShowNotesModal({type: 'document', id: doc.id})}
                    className="px-3 py-1 bg-blue-100 dark:bg-blue-900/30 hover:bg-blue-200 dark:hover:bg-blue-800/50 text-blue-600 dark:text-blue-400 rounded-lg text-sm font-medium"
                  >
                    <FaEye className="w-3 h-3" />
                  </button>
                  
                  <button
                    onClick={() => handleDocumentAction(doc.id, true)}
                    className="px-3 py-1 bg-green-100 dark:bg-green-900/30 hover:bg-green-200 dark:hover:bg-green-800/50 text-green-600 dark:text-green-400 rounded-lg text-sm font-medium"
                  >
                    <FaCheck className="w-3 h-3" />
                  </button>
                  
                  <button
                    onClick={() => setShowNotesModal({type: 'document-reject', id: doc.id})}
                    className="px-3 py-1 bg-red-100 dark:bg-red-900/30 hover:bg-red-200 dark:hover:bg-red-800/50 text-red-600 dark:text-red-400 rounded-lg text-sm font-medium"
                  >
                    <FaTimes className="w-3 h-3" />
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Profile Changes Approval */}
      {pendingChanges.length > 0 && (
        <div className="bg-white dark:bg-slate-800 rounded-lg p-4 border border-blue-200 dark:border-blue-800 mb-6">
          <h4 className="text-md font-medium text-slate-900 dark:text-white mb-4 flex items-center gap-2">
            <FaEdit className="w-4 h-4 text-blue-500" />
            Cambios de Perfil Pendientes
          </h4>
          
          <div className="space-y-3">
            {pendingChanges.map(change => (
              <div key={change.id} className="p-3 bg-blue-50 dark:bg-blue-950/20 rounded-lg">
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <div className="font-medium text-slate-900 dark:text-white mb-2">
                      Cambio en: {change.field}
                    </div>
                    <div className="text-sm space-y-1">
                      <div className="text-slate-600 dark:text-slate-400">
                        <span className="font-medium">Valor anterior:</span> {change.oldValue}
                      </div>
                      <div className="text-slate-600 dark:text-slate-400">
                        <span className="font-medium">Valor nuevo:</span> {change.newValue}
                      </div>
                    </div>
                    <div className="text-xs text-slate-500 dark:text-slate-500 mt-2">
                      Solicitado: {change.changeDate.toLocaleDateString('es-CO')}
                    </div>
                  </div>
                  
                  <div className="flex items-center gap-2 ml-4">
                    <button
                      onClick={() => handleProfileAction(true)}
                      className="px-3 py-1 bg-green-100 dark:bg-green-900/30 hover:bg-green-200 dark:hover:bg-green-800/50 text-green-600 dark:text-green-400 rounded-lg text-sm font-medium"
                    >
                      <FaCheck className="w-3 h-3" />
                    </button>
                    
                    <button
                      onClick={() => setShowNotesModal({type: 'profile-reject', id: change.id})}
                      className="px-3 py-1 bg-red-100 dark:bg-red-900/30 hover:bg-red-200 dark:hover:bg-red-800/50 text-red-600 dark:text-red-400 rounded-lg text-sm font-medium"
                    >
                      <FaTimes className="w-3 h-3" />
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Admin Actions */}
      <div className="bg-white dark:bg-slate-800 rounded-lg p-4 border border-slate-200 dark:border-slate-600">
        <h4 className="text-md font-medium text-slate-900 dark:text-white mb-4 flex items-center gap-2">
          <FaHistory className="w-4 h-4 text-slate-500" />
          Acciones Administrativas
        </h4>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
          <button
            onClick={onGenerateReport}
            className="inline-flex items-center justify-center gap-2 px-4 py-3 bg-indigo-100 dark:bg-indigo-900/30 hover:bg-indigo-200 dark:hover:bg-indigo-800/50 text-indigo-700 dark:text-indigo-300 rounded-lg font-medium"
          >
            <FaDownload className="w-4 h-4" />
            Generar Reporte de Usuario
          </button>
          
          <button
            className="inline-flex items-center justify-center gap-2 px-4 py-3 bg-slate-100 dark:bg-slate-700 hover:bg-slate-200 dark:hover:bg-slate-600 text-slate-700 dark:text-slate-300 rounded-lg font-medium"
          >
            <FaHistory className="w-4 h-4" />
            Ver Historial Completo
          </button>
        </div>
      </div>

      {/* Notes Modal */}
      {showNotesModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white dark:bg-slate-800 rounded-lg p-6 w-full max-w-md mx-4">
            <h4 className="text-lg font-semibold text-slate-900 dark:text-white mb-4">
              {showNotesModal.type.includes('reject') ? 'Motivo del Rechazo' : 'Notas Administrativas'}
            </h4>
            
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">
                  {showNotesModal.type.includes('reject') ? 'Motivo del rechazo *' : 'Notas (opcional)'}
                </label>
                <textarea
                  value={adminNotes}
                  onChange={(e) => setAdminNotes(e.target.value)}
                  rows={4}
                  className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent dark:bg-slate-700 dark:border-slate-600 dark:text-white"
                  placeholder={showNotesModal.type.includes('reject') 
                    ? "Explica por qué se rechaza esta solicitud..." 
                    : "Agrega notas adicionales (opcional)..."
                  }
                />
              </div>
            </div>

            <div className="flex items-center gap-2 mt-6">
              <button
                onClick={() => setShowNotesModal(null)}
                className="flex-1 px-4 py-2 bg-slate-500 hover:bg-slate-600 text-white rounded-lg font-medium"
              >
                Cancelar
              </button>
              
              <button
                onClick={() => {
                  if (showNotesModal.type.includes('document')) {
                    handleDocumentAction(showNotesModal.id, !showNotesModal.type.includes('reject'));
                  } else {
                    handleProfileAction(!showNotesModal.type.includes('reject'));
                  }
                }}
                disabled={showNotesModal.type.includes('reject') && !adminNotes.trim()}
                className={`flex-1 px-4 py-2 rounded-lg font-medium ${
                  showNotesModal.type.includes('reject')
                    ? 'bg-red-600 hover:bg-red-700 disabled:bg-red-400 text-white'
                    : 'bg-green-600 hover:bg-green-700 text-white'
                }`}
              >
                {showNotesModal.type.includes('reject') ? 'Rechazar' : 'Aprobar'}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Admin Footer */}
      <div className="mt-6 pt-4 border-t border-purple-200 dark:border-purple-800">
        <div className="bg-amber-50 dark:bg-amber-950/20 border border-amber-200 dark:border-amber-800 rounded-lg p-3">
          <div className="flex items-start gap-2">
            <FaExclamationTriangle className="w-4 h-4 text-amber-600 dark:text-amber-400 mt-0.5 shrink-0" />
            <div className="text-xs text-amber-700 dark:text-amber-300">
              <p className="font-medium mb-1">Responsabilidad Administrativa:</p>
              <p>Todas las acciones realizadas desde este panel quedan registradas en el log de auditoría. Asegúrate de documentar adecuadamente las decisiones tomadas. Los cambios de estado y rol requieren justificación válida según las políticas del motoclub.</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}