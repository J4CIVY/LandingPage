import React from 'react';
import { FaUser } from 'react-icons/fa';

interface UserAvatarProps {
  imageUrl?: string;
  name?: string;
  size?: 'sm' | 'md' | 'lg' | 'xl';
  className?: string;
  showBorder?: boolean;
}

const UserAvatar: React.FC<UserAvatarProps> = ({
  imageUrl,
  name,
  size = 'md',
  className = '',
  showBorder = true,
}) => {
  const sizeClasses = {
    sm: 'w-8 h-8',
    md: 'w-12 h-12',
    lg: 'w-16 h-16',
    xl: 'w-24 h-24',
  };

  const iconSizes = {
    sm: 'text-sm',
    md: 'text-lg',
    lg: 'text-xl',
    xl: 'text-2xl',
  };

  const borderClass = showBorder ? 'border-2 border-gray-300 dark:border-gray-600' : '';

  // Generar iniciales si no hay imagen
  const getInitials = (fullName?: string) => {
    if (!fullName) return '?';
    return fullName
      .split(' ')
      .map(word => word.charAt(0))
      .join('')
      .toUpperCase()
      .slice(0, 2);
  };

  const initials = getInitials(name);

  return (
    <div
      className={`
        ${sizeClasses[size]} 
        rounded-full overflow-hidden flex items-center justify-center
        ${borderClass}
        ${className}
      `}
    >
      {imageUrl ? (
        <img
          src={imageUrl}
          alt={name || 'Avatar de usuario'}
          className="w-full h-full object-cover"
          onError={(e) => {
            // Si la imagen falla al cargar, ocultar el elemento img
            e.currentTarget.style.display = 'none';
          }}
        />
      ) : (
        // Placeholder cuando no hay imagen
        <div className="w-full h-full bg-gray-200 dark:bg-gray-700 flex items-center justify-center">
          {name ? (
            <span className={`font-semibold text-gray-600 dark:text-gray-200 ${iconSizes[size]}`}>
              {initials}
            </span>
          ) : (
            <FaUser className={`text-gray-500 dark:text-gray-300 ${iconSizes[size]}`} />
          )}
        </div>
      )}
    </div>
  );
};

export default UserAvatar;