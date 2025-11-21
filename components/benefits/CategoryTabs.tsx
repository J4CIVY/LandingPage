'use client';

import { useState, type FC } from 'react';
import { FaWrench, FaCog, FaUtensils, FaShieldAlt, FaHeartbeat, FaEllipsisH, FaChevronDown } from 'react-icons/fa';
import { CategoryTabsProps, CategoryType } from '@/types/benefits';

const CategoryTabs: FC<CategoryTabsProps> = ({
  categories,
  activeCategory,
  onCategoryChange
}) => {
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);

  // Icons for each category
  const iconsByCategory = {
    'workshops-mechanics': FaWrench,
    'accessories-parts': FaCog,
    'restaurants-hotels': FaUtensils,
    'insurance-finance': FaShieldAlt,
    'health-wellness': FaHeartbeat,
    'others': FaEllipsisH,
  };

  const allCategories = [
    { id: 'all' as const, name: 'All', icon: '', color: 'gray' },
    ...categories
  ];

  const activeCategoryData = allCategories.find(cat => cat.id === activeCategory);

  return (
    <div className="mb-6">
      {/* Desktop View - Horizontal tabs */}
      <div className="hidden lg:block">
        <div className="border-b border-gray-200 dark:border-gray-700">
          <nav className="-mb-px flex space-x-8 overflow-x-auto scrollbar-hide">
            {allCategories.map((category) => {
              const IconComponent = category.id === 'all' ? FaEllipsisH : iconsByCategory[category.id as CategoryType];
              const isActive = activeCategory === category.id;
              
              return (
                <button
                  key={category.id}
                  onClick={() => onCategoryChange(category.id as CategoryType | 'all')}
                  className={`
                    group inline-flex items-center gap-2 py-4 px-1 border-b-2 font-medium text-sm
                    whitespace-nowrap
                    ${isActive
                      ? 'border-blue-500 text-blue-600 dark:text-blue-400'
                      : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300 dark:text-gray-400 dark:hover:text-gray-300'
                    }
                  `}
                >
                  {IconComponent && (
                    <IconComponent 
                      className={`w-4 h-4 ${isActive ? 'text-blue-500' : 'text-gray-400 group-hover:text-gray-500'}`} 
                    />
                  )}
                  {category.name}
                  {category.id !== 'all' && (
                    <span className={`
                      inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium
                      ${isActive 
                        ? 'bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-400' 
                        : 'bg-gray-100 text-gray-800 dark:bg-gray-700 dark:text-gray-300'
                      }
                    `}>
                      {category.id === 'workshops-mechanics' ? '8' :
                       category.id === 'accessories-parts' ? '6' :
                       category.id === 'restaurants-hotels' ? '5' :
                       category.id === 'insurance-finance' ? '3' :
                       category.id === 'health-wellness' ? '2' : '4'}
                    </span>
                  )}
                </button>
              );
            })}
          </nav>
        </div>
      </div>

      {/* Mobile View - Dropdown */}
      <div className="lg:hidden">
        <div className="relative">
          <button
            onClick={() => setIsDropdownOpen(!isDropdownOpen)}
            className="w-full flex items-center justify-between px-4 py-3 bg-white dark:bg-gray-800 
                     border border-gray-300 dark:border-gray-600 rounded-lg shadow-sm 
                     text-left focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
          >
            <div className="flex items-center gap-2">
              {activeCategoryData?.id !== 'all' && (
                <>
                  {iconsByCategory[activeCategoryData?.id as CategoryType] && 
                    (() => {
                      const IconComponent = iconsByCategory[activeCategoryData?.id as CategoryType];
                      return <IconComponent className="w-4 h-4 text-blue-500" />;
                    })()
                  }
                </>
              )}
              <span className="text-gray-900 dark:text-white font-medium">
                {activeCategoryData?.name || 'Select category'}
              </span>
            </div>
            <FaChevronDown 
              className={`w-4 h-4 text-gray-400 ${isDropdownOpen ? 'transform rotate-180' : ''}`} 
            />
          </button>

          {/* Dropdown Menu */}
          {isDropdownOpen && (
            <div className="absolute z-10 mt-1 w-full bg-white dark:bg-gray-800 shadow-lg 
                          rounded-md py-1 border border-gray-200 dark:border-gray-700">
              {allCategories.map((category) => {
                const IconComponent = category.id === 'all' ? FaEllipsisH : iconsByCategory[category.id as CategoryType];
                const isActive = activeCategory === category.id;
                
                return (
                  <button
                    key={category.id}
                    onClick={() => {
                      onCategoryChange(category.id as CategoryType | 'all');
                      setIsDropdownOpen(false);
                    }}
                    className={`
                      w-full flex items-center gap-3 px-4 py-2 text-sm transition-colors duration-200
                      ${isActive
                        ? 'bg-blue-50 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400'
                        : 'text-gray-700 hover:bg-gray-50 dark:text-gray-300 dark:hover:bg-gray-700'
                      }
                    `}
                  >
                    {IconComponent && (
                      <IconComponent 
                        className={`w-4 h-4 ${isActive ? 'text-blue-500' : 'text-gray-400'}`} 
                      />
                    )}
                    <span className="flex-1 text-left">{category.name}</span>
                    {category.id !== 'all' && (
                      <span className={`
                        inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium
                        ${isActive 
                          ? 'bg-blue-100 text-blue-800 dark:bg-blue-900/50 dark:text-blue-400' 
                          : 'bg-gray-100 text-gray-600 dark:bg-gray-700 dark:text-gray-400'
                        }
                      `}>
                        {category.id === 'workshops-mechanics' ? '8' :
                         category.id === 'accessories-parts' ? '6' :
                         category.id === 'restaurants-hotels' ? '5' :
                         category.id === 'insurance-finance' ? '3' :
                         category.id === 'health-wellness' ? '2' : '4'}
                      </span>
                    )}
                  </button>
                );
              })}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default CategoryTabs;
