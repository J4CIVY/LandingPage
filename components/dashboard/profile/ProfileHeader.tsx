'use client';

import { useState, useMemo } from 'react';
import { FaUser, FaEdit, FaCamera, FaCheck, FaTimes } from 'react-icons/fa';
import { IUser } from '@/lib/models/User';
import { sanitizeText, sanitizeUrl } from '@/lib/input-sanitization';

interface ProfileHeaderProps {
  user: any;
  onEdit?: () => void;
  onAvatarUpload?: (file: File) => Promise<void>;
  onAvatarChange?: (file: File) => void;
  isEditing?: boolean;
  isEditMode?: boolean;
  onSave?: (data: any) => Promise<void>;
  onCancel?: () => void;
  onChange?: () => void;
}

const membershipTypeNames: Record<string, string> = {
  'friend': 'Amigo',
  'rider': 'Piloto',
  'rider-duo': 'Piloto Dúo',
  'pro': 'Profesional',
  'pro-duo': 'Profesional Dúo'
};

const statusConfig = {
  active: {
    text: 'Activo',
    color: 'bg-green-100 text-green-800',
    icon: 'text-green-600'
  },
  inactive: {
    text: 'Inactivo',
    color: 'bg-red-100 text-red-800',
    icon: 'text-red-600'
  },
  suspended: {
    text: 'Suspendido',
    color: 'bg-yellow-100 text-yellow-800',
    icon: 'text-yellow-600'
  }
};

export default function ProfileHeader({ user, onEdit, onAvatarChange, isEditing = false }: ProfileHeaderProps) {
  const [isHovering, setIsHovering] = useState(false);
  const [imageLoading, setImageLoading] = useState(false);

  // SECURITY: Sanitize user-generated content to prevent XSS
  const safeFirstName = sanitizeText(user.firstName || '', 50);
  const safeLastName = sanitizeText(user.lastName || '', 50);
  const safeEmail = user.email; // Email already validated by schema
  
  // SECURITY: Sanitize profile image URL to prevent XSS
  const safeProfileImage = useMemo(() => {
    if (!user.profileImage) return null;
    
    const sanitized = sanitizeUrl(user.profileImage);
    if (!sanitized) {
      console.warn('Blocked unsafe profile image URL');
      return null;
    }
    
    // Additional check for image-specific URLs
    try {
      const url = new URL(sanitized, window.location.origin);
      if (url.protocol !== 'http:' && url.protocol !== 'https:' && !sanitized.startsWith('data:image/')) {
        return null;
      }
    } catch {
      return null;
    }
    
    return sanitized;
  }, [user.profileImage]);

  const handleAvatarChange = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file && onAvatarChange) {
      setImageLoading(true);
      try {
        await onAvatarChange(file);
      } finally {
        setImageLoading(false);
      }
    }
  };

  const getStatus = () => {
    if (!user.isActive) return statusConfig.inactive;
    // Puedes agregar más lógica aquí para otros estados como suspendido
    return statusConfig.active;
  };

  const status = getStatus();

  return (
    <div className="bg-white dark:bg-slate-800 rounded-xl shadow-lg p-6 mb-6">
      <div className="flex flex-col lg:flex-row items-center lg:items-start gap-6">
        {/* Avatar Section */}
        <div className="relative">
          <div 
            className="relative group"
            onMouseEnter={() => setIsHovering(true)}
            onMouseLeave={() => setIsHovering(false)}
          >
            <div className="w-32 h-32 rounded-full overflow-hidden border-4 border-slate-200 dark:border-slate-600 bg-slate-100 dark:bg-slate-700 flex items-center justify-center relative">
              {safeProfileImage ? (
                <img
                  src={safeProfileImage}
                  alt={`${safeFirstName} ${safeLastName}`}
                  className="w-full h-full object-cover"
                  onError={(e) => {
                    // Handle broken/malicious images
                    e.currentTarget.style.display = 'none';
                  }}
                />
              ) : (
                <FaUser className="w-12 h-12 text-slate-400 dark:text-slate-500" />
              )}
              
              {/* Loading overlay */}
              {imageLoading && (
                <div className="absolute inset-0 bg-black bg-opacity-50 flex items-center justify-center rounded-full">
                  <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-white"></div>
                </div>
              )}
              
              {/* Hover overlay */}
              {isHovering && !imageLoading && onAvatarChange && (
                <div className="absolute inset-0 bg-black bg-opacity-50 flex items-center justify-center rounded-full cursor-pointer">
                  <FaCamera className="w-6 h-6 text-white" />
                </div>
              )}
            </div>
            
            {/* Avatar upload input */}
            {onAvatarChange && (
              <input
                type="file"
                accept="image/*"
                onChange={handleAvatarChange}
                className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
                disabled={imageLoading}
              />
            )}
          </div>
          
          {/* Status indicator */}
          <div className={`absolute -bottom-2 -right-2 w-8 h-8 rounded-full border-4 border-white dark:border-slate-800 ${status.color} flex items-center justify-center`}>
            {user.isActive ? (
              <FaCheck className={`w-3 h-3 ${status.icon}`} />
            ) : (
              <FaTimes className={`w-3 h-3 ${status.icon}`} />
            )}
          </div>
        </div>

        {/* User Information */}
        <div className="flex-1 text-center lg:text-left">
          <div className="mb-2">
            <h1 className="text-2xl lg:text-3xl font-bold text-slate-900 dark:text-white mb-1">
              {safeFirstName} {safeLastName}
            </h1>
            <p className="text-slate-600 dark:text-slate-400 text-lg">
              {membershipTypeNames[user.membershipType] || user.membershipType}
            </p>
          </div>

          {/* Membership Info */}
          <div className="flex flex-col lg:flex-row items-center lg:items-start gap-4 mb-4">
            <div className="flex items-center gap-3">
              <span className={`inline-flex items-center px-3 py-1 rounded-full text-sm font-medium ${status.color}`}>
                {status.text}
              </span>
              
              {user.membershipNumber && (
                <span className="inline-flex items-center px-3 py-1 rounded-full text-sm font-medium bg-slate-100 dark:bg-slate-700 text-slate-700 dark:text-slate-300">
                  #{user.membershipNumber}
                </span>
              )}
            </div>
          </div>

          {/* Join Date */}
          {user.joinDate && (
            <p className="text-sm text-slate-500 dark:text-slate-400 mb-4">
              Miembro desde {new Date(user.joinDate).toLocaleDateString('es-CO', {
                year: 'numeric',
                month: 'long',
                day: 'numeric'
              })}
            </p>
          )}

          {/* Edit Button */}
          {onEdit && (
            <button
              onClick={onEdit}
              disabled={isEditing}
              className="inline-flex items-center gap-2 px-4 py-2 bg-green-600 hover:bg-green-700 disabled:bg-green-400 text-white rounded-lg font-medium focus:outline-none focus:ring-2 focus:ring-green-500 focus:ring-offset-2"
            >
              <FaEdit className="w-4 h-4" />
              {isEditing ? 'Editando...' : 'Editar Perfil'}
            </button>
          )}
        </div>

        {/* Additional Info Cards - Mobile optimized */}
        <div className="w-full lg:w-auto">
          <div className="grid grid-cols-2 lg:grid-cols-1 gap-3 lg:gap-2">
            {/* Email Verification Status */}
            <div className="bg-slate-50 dark:bg-slate-700 rounded-lg p-3 text-center lg:text-left">
              <div className="text-xs text-slate-500 dark:text-slate-400 mb-1">Email</div>
              <div className={`text-sm font-medium ${user.isEmailVerified ? 'text-green-600' : 'text-red-600'}`}>
                {user.isEmailVerified ? 'Verificado' : 'Sin verificar'}
              </div>
            </div>

            {/* Last Login */}
            {user.lastLogin && (
              <div className="bg-slate-50 dark:bg-slate-700 rounded-lg p-3 text-center lg:text-left">
                <div className="text-xs text-slate-500 dark:text-slate-400 mb-1">Último acceso</div>
                <div className="text-sm font-medium text-slate-700 dark:text-slate-300">
                  {new Date(user.lastLogin).toLocaleDateString('es-CO', {
                    month: 'short',
                    day: 'numeric'
                  })}
                </div>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Responsive separator */}
      <div className="mt-6 pt-4 border-t border-slate-200 dark:border-slate-600">
        <div className="flex flex-col lg:flex-row justify-between items-center gap-4 text-sm text-slate-500 dark:text-slate-400">
          <div>
            Perfil actualizado el {new Date(user.updatedAt).toLocaleDateString('es-CO')}
          </div>
          {user.role !== 'user' && (
            <div className="inline-flex items-center px-2 py-1 rounded bg-slate-900 text-white text-xs font-medium">
              {user.role === 'admin' ? 'Administrador' : 'Super Admin'}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}