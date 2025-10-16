'use client';

import Image from 'next/image';
import { FaMapMarkerAlt, FaExternalLinkAlt, FaEye, FaTicketAlt, FaClock, FaCheckCircle } from 'react-icons/fa';
import { BenefitCardProps } from '@/types/benefits';
import { sanitizeText } from '@/lib/input-sanitization';

const BenefitCard: React.FC<BenefitCardProps> = ({
  benefit,
  onViewDetails,
  onClaimBenefit
}) => {
  // SECURITY: Sanitize user-generated content to prevent XSS
  const safeName = sanitizeText(benefit.name, 100);
  const safeCompany = sanitizeText(benefit.company, 100);
  const safeDescription = sanitizeText(benefit.briefDescription, 200);
  
  // Function to get status style
  const getStatusStyle = (status: string) => {
    switch (status) {
      case 'active':
        return 'bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400';
      case 'coming-soon':
        return 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900/30 dark:text-yellow-400';
      case 'expired':
        return 'bg-gray-100 text-gray-800 dark:bg-gray-900/30 dark:text-gray-400';
      default:
        return 'bg-gray-100 text-gray-800 dark:bg-gray-900/30 dark:text-gray-400';
    }
  };

  // Function to get status icon
  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'active':
        return <FaCheckCircle className="w-3 h-3" />;
      case 'coming-soon':
        return <FaClock className="w-3 h-3" />;
      case 'expired':
        return <FaClock className="w-3 h-3" />;
      default:
        return null;
    }
  };

  // Function to capitalize text
  const capitalize = (text: string) => {
    return text.charAt(0).toUpperCase() + text.slice(1).replace('-', ' ');
  };

  const isExpired = benefit.status === 'expired';
  const isComingSoon = benefit.status === 'coming-soon';

  return (
    <div className={`
      bg-white dark:bg-gray-800 rounded-xl shadow-md hover:shadow-lg 
      border border-gray-200 dark:border-gray-700
      ${isExpired ? 'opacity-75' : 'hover:-translate-y-1'}
      overflow-hidden group
    `}>
      {/* Benefit image */}
      <div className="relative h-48 overflow-hidden">
        <Image
          src={benefit.image}
          alt={benefit.name}
          fill
          className="object-cover group-hover:scale-105"
          sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
        />
        
        {/* Status overlay */}
        <div className="absolute top-4 left-4">
          <span className={`
            inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-medium
            backdrop-blur-sm ${getStatusStyle(benefit.status)}
          `}>
            {getStatusIcon(benefit.status)}
            {capitalize(benefit.status)}
          </span>
        </div>

        {/* Featured discount */}
        {benefit.discount && (
          <div className="absolute top-4 right-4 bg-red-500 dark:bg-red-400 text-white dark:text-gray-900 px-3 py-1 rounded-full text-sm font-bold shadow-lg">
            {benefit.discount}
          </div>
        )}

        {/* Company logo */}
        {benefit.logo && (
          <div className="absolute bottom-4 right-4 w-12 h-12 bg-white dark:bg-gray-800 rounded-lg p-2 shadow-md">
            <Image
              src={benefit.logo}
              alt={`${benefit.company} logo`}
              fill
              className="object-contain rounded"
              sizes="48px"
            />
          </div>
        )}
      </div>

      {/* Card content */}
  <div className="p-6">
        {/* Name and company */}
        <div className="mb-3">
          <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-1 line-clamp-2">
            {safeName}
          </h3>
          <p className="text-sm text-blue-600 dark:text-blue-400 font-medium">
            {safeCompany}
          </p>
        </div>

        {/* Description */}
  <p className="text-gray-600 dark:text-gray-300 text-sm mb-4 line-clamp-2">
          {safeDescription}
        </p>

        {/* Location or website */}
        {(benefit.location || benefit.website) && (
          <div className="flex items-center gap-1 text-gray-500 dark:text-gray-400 text-xs mb-4">
            {benefit.location ? (
              <>
                <FaMapMarkerAlt className="w-3 h-3" />
                <span className="truncate">{benefit.location}</span>
              </>
            ) : (
              <>
                <FaExternalLinkAlt className="w-3 h-3" />
                <span className="truncate">Website available</span>
              </>
            )}
          </div>
        )}

        {/* Validity date */}
  <div className="text-xs text-gray-500 dark:text-gray-400 mb-4">
          Valid until: {new Date(benefit.endDate).toLocaleDateString('en-US', {
            day: '2-digit',
            month: '2-digit',
            year: 'numeric'
          })}
        </div>

        {/* Action buttons */}
        <div className="flex gap-2">
          <button
            onClick={() => onViewDetails(benefit)}
            className="flex-1 flex items-center justify-center gap-2 px-4 py-2 
                     border border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-300 
                     rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700 text-sm font-medium"
          >
            <FaEye className="w-4 h-4" />
            View Details
          </button>
          <button
            onClick={() => onClaimBenefit(benefit)}
            disabled={isExpired || isComingSoon}
            className={`
              flex-1 flex items-center justify-center gap-2 px-4 py-2 rounded-lg 
              text-sm font-medium
              ${isExpired || isComingSoon
                ? 'bg-gray-100 text-gray-400 cursor-not-allowed dark:bg-gray-700 dark:text-gray-500'
                : 'bg-blue-600 text-white hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 dark:focus:ring-offset-gray-800'
              }
            `}
          >
            <FaTicketAlt className="w-4 h-4" />
            {isComingSoon ? 'Coming Soon' : isExpired ? 'Expired' : 'Get Benefit'}
          </button>
        </div>
      </div>
    </div>
  );
};

export default BenefitCard;