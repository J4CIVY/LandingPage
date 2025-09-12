import { FaUser, FaCrown, FaCalendarAlt } from 'react-icons/fa';

interface User {
  firstName: string;
  lastName: string;
  membershipType: string;
  membershipNumber?: string;
  profileImage?: string;
}

interface MembershipData {
  type: string;
  startDate: string;
  expirationDate: string;
  status: 'active' | 'expiring' | 'expired';
  daysRemaining: number;
  autoRenewal: boolean;
}

interface MembershipHeaderProps {
  user: User;
  membershipData: MembershipData | null;
}

const membershipTypeNames: Record<string, string> = {
  friend: 'Amigo',
  rider: 'Rider',
  'rider-duo': 'Rider Dúo',
  pro: 'Profesional',
  'pro-duo': 'Profesional Dúo'
};

const membershipTypeColors: Record<string, string> = {
  friend: 'bg-blue-100 text-blue-800',
  rider: 'bg-green-100 text-green-800',
  'rider-duo': 'bg-green-100 text-green-800',
  pro: 'bg-purple-100 text-purple-800',
  'pro-duo': 'bg-purple-100 text-purple-800'
};

export default function MembershipHeader({ user, membershipData }: MembershipHeaderProps) {
  const membershipTypeName = membershipTypeNames[user.membershipType] || user.membershipType;
  const membershipTypeColor = membershipTypeColors[user.membershipType] || 'bg-gray-100 text-gray-800';

  return (
    <div className="bg-white rounded-xl shadow-lg p-6 mb-8">
      <div className="flex flex-col md:flex-row items-start md:items-center gap-6">
        {/* Avatar y información básica */}
        <div className="flex items-center gap-4">
          <div className="relative">
            {user.profileImage ? (
              <img
                src={user.profileImage}
                alt={`${user.firstName} ${user.lastName}`}
                className="w-20 h-20 rounded-full object-cover border-4 border-green-100"
              />
            ) : (
              <div className="w-20 h-20 rounded-full bg-green-600 flex items-center justify-center text-white text-2xl font-bold">
                {user.firstName.charAt(0)}{user.lastName.charAt(0)}
              </div>
            )}
            <div className="absolute -bottom-1 -right-1 w-6 h-6 bg-green-500 rounded-full flex items-center justify-center">
              <FaCrown className="w-3 h-3 text-white" />
            </div>
          </div>

          <div>
            <h1 className="text-2xl font-bold text-gray-900">
              {user.firstName} {user.lastName}
            </h1>
            <p className="text-gray-600 flex items-center gap-2 mt-1">
              <FaUser className="w-4 h-4" />
              Miembro BSK Motorcycle Team
            </p>
            {user.membershipNumber && (
              <p className="text-sm text-gray-500 mt-1">
                # {user.membershipNumber}
              </p>
            )}
          </div>
        </div>

        {/* Información de membresía */}
        <div className="flex-1 md:ml-8">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {/* Tipo de membresía */}
            <div className="text-center md:text-left">
              <p className="text-sm text-gray-500 mb-1">Tipo de Membresía</p>
              <span className={`inline-flex items-center px-3 py-1 rounded-full text-sm font-medium ${membershipTypeColor}`}>
                {membershipTypeName}
              </span>
            </div>

            {/* Estado */}
            <div className="text-center md:text-left">
              <p className="text-sm text-gray-500 mb-1">Estado</p>
              {membershipData && (
                <span className={`inline-flex items-center px-3 py-1 rounded-full text-sm font-medium ${
                  membershipData.status === 'active' 
                    ? 'bg-green-100 text-green-800'
                    : membershipData.status === 'expiring'
                    ? 'bg-yellow-100 text-yellow-800'
                    : 'bg-red-100 text-red-800'
                }`}>
                  {membershipData.status === 'active' && 'Activa'}
                  {membershipData.status === 'expiring' && 'Por Vencer'}
                  {membershipData.status === 'expired' && 'Vencida'}
                </span>
              )}
            </div>

            {/* Vigencia */}
            <div className="text-center md:text-left">
              <p className="text-sm text-gray-500 mb-1">Vigencia</p>
              {membershipData && (
                <div className="flex items-center gap-2 text-sm text-gray-700">
                  <FaCalendarAlt className="w-4 h-4" />
                  <span>
                    {membershipData.daysRemaining > 0 
                      ? `${membershipData.daysRemaining} días`
                      : 'Vencida'
                    }
                  </span>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}