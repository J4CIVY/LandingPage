import { type FC } from 'react';

interface SkeletonProps {
  className?: string;
  count?: number;
}

export const SkeletonLine: FC<SkeletonProps> = ({ className = '', count = 1 }) => (
  <>
    {Array.from({ length: count }).map((_, index) => (
      <div
        key={index}
        className={`animate-pulse bg-gray-300 dark:bg-slate-600 rounded ${className}`}
        aria-hidden="true"
      />
    ))}
  </>
);

export const SkeletonCard: FC<SkeletonProps> = ({ className = '' }) => (
  <div className={`animate-pulse ${className}`} aria-hidden="true">
    <div className="bg-gray-300 dark:bg-slate-600 h-48 rounded-t-lg"></div>
    <div className="p-4 space-y-3">
      <div className="bg-gray-300 dark:bg-slate-600 h-4 rounded w-3/4"></div>
      <div className="bg-gray-300 dark:bg-slate-600 h-4 rounded w-1/2"></div>
      <div className="bg-gray-300 dark:bg-slate-600 h-3 rounded w-full"></div>
      <div className="bg-gray-300 dark:bg-slate-600 h-3 rounded w-5/6"></div>
    </div>
  </div>
);

export const SkeletonEvent: FC = () => (
  <div className="animate-pulse bg-white dark:bg-slate-800 rounded-xl overflow-hidden shadow-lg" aria-hidden="true">
    <div className="bg-gray-300 dark:bg-slate-600 h-40"></div>
    <div className="p-4 space-y-3">
      <div className="flex space-x-2">
        <div className="bg-gray-300 dark:bg-slate-600 h-6 w-16 rounded-full"></div>
        <div className="bg-gray-300 dark:bg-slate-600 h-6 w-20 rounded-full"></div>
      </div>
      <div className="bg-gray-300 dark:bg-slate-600 h-6 rounded w-3/4"></div>
      <div className="space-y-2">
        <div className="bg-gray-300 dark:bg-slate-600 h-4 rounded w-full"></div>
        <div className="bg-gray-300 dark:bg-slate-600 h-4 rounded w-5/6"></div>
      </div>
      <div className="flex justify-between items-center pt-2">
        <div className="bg-gray-300 dark:bg-slate-600 h-4 w-24 rounded"></div>
        <div className="bg-gray-300 dark:bg-slate-600 h-8 w-20 rounded"></div>
      </div>
    </div>
  </div>
);

export const SkeletonProduct: FC = () => (
  <div className="animate-pulse bg-white dark:bg-slate-800 rounded-lg overflow-hidden shadow-md" aria-hidden="true">
    <div className="bg-gray-300 dark:bg-slate-600 h-48"></div>
    <div className="p-4 space-y-3">
      <div className="bg-gray-300 dark:bg-slate-600 h-5 rounded w-3/4"></div>
      <div className="bg-gray-300 dark:bg-slate-600 h-4 rounded w-1/2"></div>
      <div className="flex justify-between items-center">
        <div className="bg-gray-300 dark:bg-slate-600 h-6 w-20 rounded"></div>
        <div className="bg-gray-300 dark:bg-slate-600 h-8 w-24 rounded"></div>
      </div>
    </div>
  </div>
);

export const SkeletonTable: FC<{ rows?: number; cols?: number }> = ({ 
  rows = 5, 
  cols = 4 
}) => (
  <div className="animate-pulse" aria-hidden="true">
    <div className="bg-gray-300 dark:bg-slate-600 h-12 rounded-t-lg mb-2"></div>
    {Array.from({ length: rows }).map((_, rowIndex) => (
      <div key={rowIndex} className="grid gap-4 mb-2" style={{ gridTemplateColumns: `repeat(${cols}, 1fr)` }}>
        {Array.from({ length: cols }).map((_, colIndex) => (
          <div key={colIndex} className="bg-gray-300 dark:bg-slate-600 h-8 rounded"></div>
        ))}
      </div>
    ))}
  </div>
);

export const SkeletonAvatar: FC<{ size?: 'sm' | 'md' | 'lg' }> = ({ size = 'md' }) => {
  const sizeClasses = {
    sm: 'w-8 h-8',
    md: 'w-12 h-12', 
    lg: 'w-16 h-16'
  };

  return (
    <div 
      className={`animate-pulse bg-gray-300 dark:bg-slate-600 rounded-full ${sizeClasses[size]}`}
      aria-hidden="true"
    />
  );
};

export const SkeletonText: FC<{ lines?: number; className?: string }> = ({ 
  lines = 3, 
  className = '' 
}) => (
  <div className={`space-y-2 ${className}`} aria-hidden="true">
    {Array.from({ length: lines }).map((_, index) => (
      <div
        key={index}
        className={`animate-pulse bg-gray-300 dark:bg-slate-600 h-4 rounded ${
          index === lines - 1 ? 'w-3/4' : 'w-full'
        }`}
      />
    ))}
  </div>
);
