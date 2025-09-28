'use client';

import React, { useState, useEffect, useRef } from 'react';
import { FaSearch, FaTimes } from 'react-icons/fa';
import Link from 'next/link';
import { useRouter } from 'next/navigation';

interface SearchResult {
  title: string;
  path: string;
  description: string;
  category: string;
}

interface SearchComponentProps {
  placeholder?: string;
  onSearch?: (query: string) => void;
  isCollapsible?: boolean;
}

const SearchComponent: React.FC<SearchComponentProps> = ({ 
  placeholder = "Buscar eventos, cursos, documentos...",
  onSearch,
  isCollapsible = false
}) => {
  const [isOpen, setIsOpen] = useState(false);
  const [isExpanded, setIsExpanded] = useState(!isCollapsible);
  const [query, setQuery] = useState('');
  const [results, setResults] = useState<SearchResult[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const searchRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);
  const collapseTimeoutRef = useRef<NodeJS.Timeout | null>(null);
  const router = useRouter();

  // Datos de búsqueda estáticos (en producción vendría de una API)
  const searchData: SearchResult[] = [
    { title: 'Eventos', path: '/events', description: 'Próximos eventos y rodadas del club', category: 'Navegación' },
    { title: 'Tienda', path: '/store', description: 'Merchandising oficial BSK MT', category: 'Navegación' },
    { title: 'Cursos', path: '/courses', description: 'Cursos de conducción y seguridad', category: 'Navegación' },
    { title: 'Membresías', path: '/memberships', description: 'Únete a BSK Motorcycle Team', category: 'Navegación' },
    { title: 'SOS Emergencias', path: '/sos', description: 'Asistencia de emergencia 24/7', category: 'Servicios' },
    { title: 'Contacto', path: '/contact', description: 'Información de contacto y formularios', category: 'Navegación' },
    { title: 'Sobre Nosotros', path: '/about', description: 'Historia y valores del club', category: 'Información' },
    { title: 'Documentos', path: '/documents', description: 'Reglamentos y documentos oficiales', category: 'Legal' },
    { title: 'Clima', path: '/weather', description: 'Condiciones meteorológicas para rutas', category: 'Utilidades' },
    { title: 'Registro', path: '/register', description: 'Hazte miembro del club', category: 'Acción' },
  ];

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (searchRef.current && !searchRef.current.contains(event.target as Node)) {
        setIsOpen(false);
        if (isCollapsible) {
          startCollapseTimer();
        }
      }
    };

    const handleEscape = (event: KeyboardEvent) => {
      if (event.key === 'Escape') {
        setIsOpen(false);
        setQuery('');
        if (isCollapsible) {
          setIsExpanded(false);
        }
      }
    };

    if (isOpen) {
      document.addEventListener('mousedown', handleClickOutside);
      document.addEventListener('keydown', handleEscape);
    }

    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
      document.removeEventListener('keydown', handleEscape);
    };
  }, [isOpen, isCollapsible]);

  useEffect(() => {
    if (query.length > 0) {
      setIsLoading(true);
      const timer = setTimeout(() => {
        const filtered = searchData.filter(item =>
          item.title.toLowerCase().includes(query.toLowerCase()) ||
          item.description.toLowerCase().includes(query.toLowerCase()) ||
          item.category.toLowerCase().includes(query.toLowerCase())
        );
        setResults(filtered);
        setIsLoading(false);
      }, 300); // Debounce de 300ms

      return () => clearTimeout(timer);
    } else {
      setResults([]);
      setIsLoading(false);
    }
  }, [query]);

  // Función para iniciar el timer de colapso
  const startCollapseTimer = () => {
    if (collapseTimeoutRef.current) {
      clearTimeout(collapseTimeoutRef.current);
    }
    collapseTimeoutRef.current = setTimeout(() => {
      if (isCollapsible && !isOpen && query === '') {
        setIsExpanded(false);
      }
    }, 5000);
  };

  // Función para cancelar el timer de colapso
  const cancelCollapseTimer = () => {
    if (collapseTimeoutRef.current) {
      clearTimeout(collapseTimeoutRef.current);
      collapseTimeoutRef.current = null;
    }
  };

  const handleSearchIconClick = () => {
    if (isCollapsible && !isExpanded) {
      setIsExpanded(true);
      setTimeout(() => {
        inputRef.current?.focus();
      }, 100);
    }
  };

  const handleInputFocus = () => {
    setIsOpen(true);
    cancelCollapseTimer();
  };

  const handleInputBlur = () => {
    if (isCollapsible && query === '') {
      startCollapseTimer();
    }
  };

  const handleClear = () => {
    setQuery('');
    setResults([]);
    inputRef.current?.focus();
  };

  // Limpiar timers al desmontar el componente
  useEffect(() => {
    return () => {
      if (collapseTimeoutRef.current) {
        clearTimeout(collapseTimeoutRef.current);
      }
    };
  }, []);

  const handleResultClick = (path: string) => {
    setIsOpen(false);
    setQuery('');
    router.push(path);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (onSearch) {
      onSearch(query);
    }
    if (results.length > 0) {
      handleResultClick(results[0].path);
    }
  };

  // Renderizar solo el icono de búsqueda si está colapsado
  if (isCollapsible && !isExpanded) {
    return (
      <div className="relative">
        <button
          onClick={handleSearchIconClick}
          className="p-2 text-gray-700 dark:text-gray-200 hover:text-green-400 dark:hover:text-green-400 focus:outline-none focus:ring-2 focus:ring-green-400 rounded-lg"
          aria-label="Abrir búsqueda"
        >
          <FaSearch className="w-5 h-5" />
        </button>
      </div>
    );
  }

  return (
    <div ref={searchRef} className="relative" role="search" aria-label="Buscar en el sitio">
      <form onSubmit={handleSubmit} className="relative">
        <div className="relative">
          <input
            ref={inputRef}
            type="text"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            onFocus={handleInputFocus}
            onBlur={handleInputBlur}
            placeholder={placeholder}
            className="w-full md:w-80 pl-10 pr-10 py-2 border border-gray-300 dark:border-slate-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-400 focus:border-transparent bg-white dark:bg-slate-800 text-slate-950 dark:text-white placeholder-gray-500 dark:placeholder-gray-400"
            aria-label="Buscar en el sitio"
          />
          <button
            type="button"
            onClick={isCollapsible ? handleSearchIconClick : undefined}
            className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400"
            aria-hidden="true"
          >
            <FaSearch className="w-4 h-4" />
          </button>
          {query && (
            <button
              type="button"
              onClick={handleClear}
              className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600 dark:hover:text-gray-300"
              aria-label="Limpiar búsqueda"
            >
              <FaTimes className="w-4 h-4" />
            </button>
          )}
        </div>
      </form>

      {/* Resultados de búsqueda */}
      {isOpen && (query.length > 0 || results.length > 0) && (
  <div className="absolute top-full left-0 right-0 mt-2 bg-white dark:bg-slate-800 border border-gray-200 dark:border-slate-600 rounded-lg shadow-xl z-50 max-h-96 overflow-y-auto">
          {isLoading ? (
            <div className="p-4 text-center">
              <div className="animate-spin rounded-full h-6 w-6 border-t-2 border-b-2 border-green-400 mx-auto"></div>
              <span className="sr-only">Buscando...</span>
            </div>
          ) : results.length > 0 ? (
            <>
              <div className="p-3 border-b border-gray-200 dark:border-slate-600">
                <p className="text-sm text-gray-600 dark:text-gray-400">
                  {results.length} resultado{results.length !== 1 ? 's' : ''} para "{query}"
                </p>
              </div>
              {results.map((result, index) => (
                <button
                  key={index}
                  onClick={() => handleResultClick(result.path)}
                  className="w-full text-left p-4 hover:bg-gray-50 dark:hover:bg-slate-700 border-b border-gray-100 dark:border-slate-700 last:border-b-0 focus:outline-none focus:bg-gray-50 dark:focus:bg-slate-700"
                >
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <h4 className="font-medium text-slate-950 dark:text-white mb-1">
                        {result.title}
                      </h4>
                      <p className="text-sm text-gray-600 dark:text-gray-400 mb-2">
                        {result.description}
                      </p>
                      <span className="inline-block px-2 py-1 text-xs bg-green-100 dark:bg-green-900 text-green-800 dark:text-green-200 rounded">
                        {result.category}
                      </span>
                    </div>
                  </div>
                </button>
              ))}
            </>
          ) : query.length > 0 ? (
            <div className="p-4 text-center text-gray-600 dark:text-gray-400">
              <p>No se encontraron resultados para "{query}"</p>
              <p className="text-sm mt-2">Intenta con otros términos de búsqueda</p>
            </div>
          ) : null}
        </div>
      )}
    </div>
  );
};

export default SearchComponent;
