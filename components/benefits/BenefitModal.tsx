'use client';

import { useEffect, type FC } from 'react';
import Image from 'next/image';
import { FaTimes, FaMapMarkerAlt, FaExternalLinkAlt, FaDownload, FaShare, FaQrcode, FaCopy, FaCheckCircle, FaClock } from 'react-icons/fa';
import { BenefitModalProps } from '@/types/benefits';

const BenefitModal: FC<BenefitModalProps> = ({
  benefit,
  isOpen,
  onClose,
  onShare
}) => {
  // Close modal with ESC
  useEffect(() => {
    const handleEsc = (event: KeyboardEvent) => {
      if (event.key === 'Escape') {
        onClose();
      }
    };

    if (isOpen) {
      document.addEventListener('keydown', handleEsc);
      document.body.style.overflow = 'hidden';
    }

    return () => {
      document.removeEventListener('keydown', handleEsc);
      document.body.style.overflow = 'unset';
    };
  }, [isOpen, onClose]);

  if (!isOpen || !benefit) return null;

  // Function to copy promo code
  const copyCode = async () => {
    try {
      await navigator.clipboard.writeText(benefit.promoCode);
      // Here you could show a success toast
    } catch (err) {
      console.error('Error copying:', err);
    }
  };

  // Function to download QR
  const downloadQR = () => {
    // QR download simulation
    const link = document.createElement('a');
    link.href = benefit.qrCode || '/images/sample-qr.png';
    link.download = `qr-${benefit.name.replace(/\s+/g, '-').toLowerCase()}.png`;
    link.click();
  };

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

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'active':
        return <FaCheckCircle className="w-4 h-4" />;
      case 'coming-soon':
      case 'expired':
        return <FaClock className="w-4 h-4" />;
      default:
        return null;
    }
  };

  const capitalize = (text: string) => {
    return text.charAt(0).toUpperCase() + text.slice(1).replace('-', ' ');
  };

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto">
      {/* Overlay */}
      <div 
        className="fixed inset-0 bg-black bg-opacity-50"
        onClick={onClose}
      ></div>

      {/* Modal */}
      <div className="flex min-h-full items-end justify-center p-4 text-center sm:items-center sm:p-0">
  <div className="relative transform overflow-hidden rounded-lg bg-white dark:bg-gray-800 
           text-left shadow-xl sm:my-8 sm:w-full sm:max-w-2xl">
          
          {/* Header with image */}
          <div className="relative h-64 sm:h-80">
            <Image
              src={benefit.image}
              alt={benefit.name}
              fill
              className="object-cover"
              sizes="(max-width: 768px) 100vw, 672px"
            />
            
            {/* Close button */}
            <button
              onClick={onClose}
              className="absolute top-4 right-4 p-2 bg-black bg-opacity-50 text-white 
                       rounded-full hover:bg-opacity-75 z-10"
            >
              <FaTimes className="w-5 h-5" />
            </button>

            {/* Benefit status */}
            <div className="absolute top-4 left-4">
              <span className={`
                inline-flex items-center gap-2 px-3 py-1.5 rounded-full text-sm font-medium
                backdrop-blur-sm ${getStatusStyle(benefit.status)}
              `}>
                {getStatusIcon(benefit.status)}
                {capitalize(benefit.status)}
              </span>
            </div>

            {/* Discount */}
            {benefit.discount && (
              <div className="absolute bottom-4 right-4 bg-red-500 text-white px-4 py-2 
                            rounded-full text-lg font-bold shadow-lg">
                {benefit.discount}
              </div>
            )}
          </div>

          {/* Modal content */}
          <div className="px-6 py-6">
            {/* Title and company */}
            <div className="mb-4">
              <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-2">
                {benefit.name}
              </h2>
              <p className="text-lg text-blue-600 dark:text-blue-400 font-medium">
                {benefit.company}
              </p>
            </div>

            {/* Full description */}
            <div className="mb-6">
              <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">
                Description
              </h3>
              <p className="text-gray-600 dark:text-gray-300 leading-relaxed">
                {benefit.fullDescription}
              </p>
            </div>

            {/* Location or website */}
            {(benefit.location || benefit.website) && (
              <div className="mb-6">
                <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">
                  Location
                </h3>
                <div className="flex items-center gap-2 text-gray-600 dark:text-gray-300">
                  {benefit.location ? (
                    <>
                      <FaMapMarkerAlt className="w-4 h-4 text-red-500" />
                      <span>{benefit.location}</span>
                    </>
                  ) : (
                    <>
                      <FaExternalLinkAlt className="w-4 h-4 text-blue-500" />
                      <a 
                        href={benefit.website} 
                        target="_blank" 
                        rel="noopener noreferrer"
                        className="text-blue-600 dark:text-blue-400 hover:underline"
                      >
                        Visit website
                      </a>
                    </>
                  )}
                </div>
              </div>
            )}

            {/* Requirements */}
            {benefit.requirements.length > 0 && (
              <div className="mb-6">
                <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">
                  Requirements
                </h3>
                <ul className="list-disc list-inside space-y-1 text-gray-600 dark:text-gray-300">
                  {benefit.requirements.map((requirement, index) => (
                    <li key={index}>{requirement}</li>
                  ))}
                </ul>
              </div>
            )}

            {/* Promo code and QR */}
            <div className="mb-6">
              <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-3">
                Promotional Code
              </h3>
              
              <div className="bg-gray-50 dark:bg-gray-700 rounded-lg p-4 mb-4">
                <div className="flex items-center justify-between mb-3">
                  <span className="text-2xl font-mono font-bold text-gray-900 dark:text-white">
                    {benefit.promoCode}
                  </span>
                  <button
                    onClick={copyCode}
                    className="flex items-center gap-2 px-3 py-1.5 bg-blue-600 text-white 
                             rounded-md hover:bg-blue-700 text-sm"
                  >
                    <FaCopy className="w-4 h-4" />
                    Copy
                  </button>
                </div>
                
                {/* QR Code */}
                <div className="flex items-center justify-center p-4 bg-white dark:bg-gray-800 rounded-lg">
                  <div className="w-32 h-32 bg-gray-200 dark:bg-gray-600 rounded-lg flex items-center justify-center">
                    <FaQrcode className="w-16 h-16 text-gray-400" />
                  </div>
                </div>
                
                <button
                  onClick={downloadQR}
                  className="w-full mt-3 flex items-center justify-center gap-2 px-4 py-2 
                           border border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-300 
                           rounded-md hover:bg-gray-50 dark:hover:bg-gray-700"
                >
                  <FaDownload className="w-4 h-4" />
                  Download QR
                </button>
              </div>
            </div>

            {/* Validity */}
            <div className="mb-6">
              <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">
                Validity
              </h3>
              <p className="text-gray-600 dark:text-gray-300">
                From {new Date(benefit.startDate).toLocaleDateString('en-US', {
                  day: '2-digit',
                  month: 'long',
                  year: 'numeric'
                })} to {new Date(benefit.endDate).toLocaleDateString('en-US', {
                  day: '2-digit',
                  month: 'long',
                  year: 'numeric'
                })}
              </p>
            </div>

            {/* Action buttons */}
            <div className="flex gap-3">
              <button
                onClick={() => onShare(benefit)}
                className="flex-1 flex items-center justify-center gap-2 px-4 py-3 
                         bg-green-600 text-white rounded-lg hover:bg-green-700 font-medium"
              >
                <FaShare className="w-4 h-4" />
                Share with Community
              </button>
              <button
                onClick={onClose}
                className="px-6 py-3 border border-gray-300 dark:border-gray-600 
                         text-gray-700 dark:text-gray-300 rounded-lg hover:bg-gray-50 
                         dark:hover:bg-gray-700 font-medium"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default BenefitModal;