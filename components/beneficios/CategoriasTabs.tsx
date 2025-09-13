'use client';

import { useState } from 'react';
import { FaWrench, FaCog, FaUtensils, FaShieldAlt, FaHeartbeat, FaEllipsisH, FaChevronDown } from 'react-icons/fa';
import { CategoriesTabsProps, CategoriaTypes } from '@/types/beneficios';

const CategoriasTabs: React.FC<CategoriesTabsProps> = ({
  categorias,
  categoriaActiva,
  onCategoriaChange
}) => {
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);

  // Iconos para cada categoría
  const iconosPorCategoria = {
    'talleres-mecanica': FaWrench,
    'accesorios-repuestos': FaCog,
    'restaurantes-hoteles': FaUtensils,
    'seguros-finanzas': FaShieldAlt,
    'salud-bienestar': FaHeartbeat,
    'otros': FaEllipsisH,
  };

  const categoriasTodas = [
    { id: 'todos' as const, nombre: 'Todos', icon: '', color: 'gray' },
    ...categorias
  ];

  const categoriaActivaData = categoriasTodas.find(cat => cat.id === categoriaActiva);

  return (
    <div className="mb-6">
      {/* Vista Desktop - Tabs horizontales */}
      <div className="hidden lg:block">
        <div className="border-b border-gray-200 dark:border-gray-700">
          <nav className="-mb-px flex space-x-8 overflow-x-auto scrollbar-hide">
            {categoriasTodas.map((categoria) => {
              const IconComponent = categoria.id === 'todos' ? FaEllipsisH : iconosPorCategoria[categoria.id as CategoriaTypes];
              const isActive = categoriaActiva === categoria.id;
              
              return (
                <button
                  key={categoria.id}
                  onClick={() => onCategoriaChange(categoria.id as CategoriaTypes | 'todos')}
                  className={`
                    group inline-flex items-center gap-2 py-4 px-1 border-b-2 font-medium text-sm
                    transition-colors duration-200 whitespace-nowrap
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
                  {categoria.nombre}
                  {categoria.id !== 'todos' && (
                    <span className={`
                      inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium
                      ${isActive 
                        ? 'bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-400' 
                        : 'bg-gray-100 text-gray-800 dark:bg-gray-700 dark:text-gray-300'
                      }
                    `}>
                      {categoria.id === 'talleres-mecanica' ? '8' :
                       categoria.id === 'accesorios-repuestos' ? '6' :
                       categoria.id === 'restaurantes-hoteles' ? '5' :
                       categoria.id === 'seguros-finanzas' ? '3' :
                       categoria.id === 'salud-bienestar' ? '2' : '4'}
                    </span>
                  )}
                </button>
              );
            })}
          </nav>
        </div>
      </div>

      {/* Vista Mobile - Dropdown */}
      <div className="lg:hidden">
        <div className="relative">
          <button
            onClick={() => setIsDropdownOpen(!isDropdownOpen)}
            className="w-full flex items-center justify-between px-4 py-3 bg-white dark:bg-gray-800 
                     border border-gray-300 dark:border-gray-600 rounded-lg shadow-sm 
                     text-left focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
          >
            <div className="flex items-center gap-2">
              {categoriaActivaData?.id !== 'todos' && (
                <>
                  {iconosPorCategoria[categoriaActivaData?.id as CategoriaTypes] && 
                    (() => {
                      const IconComponent = iconosPorCategoria[categoriaActivaData?.id as CategoriaTypes];
                      return <IconComponent className="w-4 h-4 text-blue-500" />;
                    })()
                  }
                </>
              )}
              <span className="text-gray-900 dark:text-white font-medium">
                {categoriaActivaData?.nombre || 'Seleccionar categoría'}
              </span>
            </div>
            <FaChevronDown 
              className={`w-4 h-4 text-gray-400 transition-transform duration-200 ${
                isDropdownOpen ? 'transform rotate-180' : ''
              }`} 
            />
          </button>

          {/* Dropdown Menu */}
          {isDropdownOpen && (
            <div className="absolute z-10 mt-1 w-full bg-white dark:bg-gray-800 shadow-lg 
                          rounded-md py-1 border border-gray-200 dark:border-gray-700">
              {categoriasTodas.map((categoria) => {
                const IconComponent = categoria.id === 'todos' ? FaEllipsisH : iconosPorCategoria[categoria.id as CategoriaTypes];
                const isActive = categoriaActiva === categoria.id;
                
                return (
                  <button
                    key={categoria.id}
                    onClick={() => {
                      onCategoriaChange(categoria.id as CategoriaTypes | 'todos');
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
                    <span className="flex-1 text-left">{categoria.nombre}</span>
                    {categoria.id !== 'todos' && (
                      <span className={`
                        inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium
                        ${isActive 
                          ? 'bg-blue-100 text-blue-800 dark:bg-blue-900/50 dark:text-blue-400' 
                          : 'bg-gray-100 text-gray-600 dark:bg-gray-700 dark:text-gray-400'
                        }
                      `}>
                        {categoria.id === 'talleres-mecanica' ? '8' :
                         categoria.id === 'accesorios-repuestos' ? '6' :
                         categoria.id === 'restaurantes-hoteles' ? '5' :
                         categoria.id === 'seguros-finanzas' ? '3' :
                         categoria.id === 'salud-bienestar' ? '2' : '4'}
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

export default CategoriasTabs;