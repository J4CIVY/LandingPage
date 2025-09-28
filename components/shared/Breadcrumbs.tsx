import React from 'react';
import Link from 'next/link';
import { FaHome, FaChevronRight } from 'react-icons/fa';

interface BreadcrumbItem {
  label: string;
  href?: string;
}

interface BreadcrumbsProps {
  items: BreadcrumbItem[];
}

const Breadcrumbs: React.FC<BreadcrumbsProps> = ({ items }) => {
  return (
  <nav aria-label="Breadcrumb" className="py-4 px-4 bg-gray-50 dark:bg-slate-900">
      <div className="max-w-7xl mx-auto">
        <ol className="flex items-center space-x-2 text-sm">
          <li>
            <Link 
              href="/" 
              className="flex items-center text-gray-500 dark:text-gray-400 hover:text-accent"
              aria-label="Ir al inicio"
            >
              <FaHome className="w-4 h-4" />
              <span className="sr-only">Inicio</span>
            </Link>
          </li>
          
          {items.map((item, index) => (
            <li key={index} className="flex items-center">
              <FaChevronRight className="w-3 h-3 text-gray-400 dark:text-gray-500 mx-2" aria-hidden="true" />
              {item.href && index < items.length - 1 ? (
                <Link 
                  href={item.href}
                  className="text-gray-500 dark:text-gray-400 hover:text-accent"
                >
                  {item.label}
                </Link>
              ) : (
                <span 
                  className="text-slate-950 dark:text-white font-medium"
                  aria-current="page"
                >
                  {item.label}
                </span>
              )}
            </li>
          ))}
        </ol>
      </div>
    </nav>
  );
};

export default Breadcrumbs;
