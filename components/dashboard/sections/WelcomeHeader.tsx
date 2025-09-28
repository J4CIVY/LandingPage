'use client';

import { IUser } from '@/lib/models/User';
import NotificationDropdown from '@/components/shared/NotificationDropdown';
import UserAvatar from '@/components/shared/UserAvatar';

interface WelcomeHeaderProps {
  user: IUser;
}

const membershipTypeNames: Record<string, string> = {
  'friend': 'Membresía Friend',
  'rider': 'Membresía Rider',
  'rider-duo': 'Membresía Rider Dúo',
  'pro': 'Membresía Pro',
  'pro-duo': 'Membresía Pro Dúo',
  'pro-family': 'Membresía Pro Familiar',
  'elite': 'Membresía Elite',
  'elite-duo': 'Membresía Elite Dúo',
  'elite-family': 'Membresía Elite Familiar',
  'vip': 'Membresía VIP',
  'vip-duo': 'Membresía VIP Dúo',
  'vip-family': 'Membresía VIP Familiar',
  'lifetime': 'Membresía Vitalicia',
  'sponsor': 'Patrocinador',
  'admin': 'Administrador',
  'super-admin': 'Super Administrador',
  'moderator': 'Moderador',
  'guest': 'Invitado',
  'none': 'Sin membresía',
  '': 'Sin membresía',
  null: 'Sin membresía',
  undefined: 'Sin membresía',
};

export default function WelcomeHeader({ user }: WelcomeHeaderProps) {
  const membershipTypeName = user?.membershipType ? 
    (membershipTypeNames[user.membershipType] || user.membershipType) : 
    'Sin membresía';

  if (!user) {
    return null;
  }

  return (
  <div className="bg-gray-50 dark:bg-slate-900 rounded-xl shadow-sm border border-gray-200 dark:border-slate-800 p-6">
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between space-y-4 sm:space-y-0">
        {/* Usuario Info */}
        <div className="flex items-center space-x-4">
          <UserAvatar 
            imageUrl={user.profileImage}
            name={`${user.firstName} ${user.lastName}`}
            size="lg"
            className="w-16 h-16 sm:w-20 sm:h-20"
          />
          <div>
            <h1 className="text-xl sm:text-2xl font-bold text-gray-900 dark:text-slate-100">
              ¡Bienvenido(a), {user.firstName}!
            </h1>
            <p className="text-sm sm:text-base text-gray-600 dark:text-slate-400 mt-1">
              Membresía: <span className="font-medium text-emerald-600 dark:text-emerald-400">{membershipTypeName}</span>
            </p>
            {user.membershipNumber && (
              <p className="text-xs sm:text-sm text-gray-500 dark:text-slate-500">
                No. {user.membershipNumber}
              </p>
            )}
          </div>
        </div>

        {/* Notificaciones */}
        <div className="flex items-center space-x-2">
          <NotificationDropdown className="sm:scale-110" />
        </div>
      </div>
    </div>
  );
}