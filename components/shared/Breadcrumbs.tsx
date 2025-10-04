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
  // Generate JSON-LD structured data for breadcrumbs (SEO Enhancement)
  const allItems = [{ label: 'Inicio', href: '/' }, ...items];
  const structuredData = {
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    "itemListElement": allItems.map((item, index) => ({
      "@type": "ListItem",
      "position": index + 1,
      "name": item.label,
      "item": item.href ? `https://bskmt.com${item.href}` : undefined
    }))
  };

  return (
    <>
      {/* SEO: Structured Data for Breadcrumbs */}
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(structuredData) }}
      />
      
      <nav 
        aria-label="Breadcrumb" 
        className="py-4 px-4 bg-gray-50/80 dark:bg-slate-900/50 backdrop-blur-sm"
        role="navigation"
      >
        <div className="max-w-7xl mx-auto">
          <ol className="flex items-center flex-wrap space-x-2 text-sm" itemScope itemType="https://schema.org/BreadcrumbList">
            <li itemProp="itemListElement" itemScope itemType="https://schema.org/ListItem">
              <Link 
                href="/" 
                className="flex items-center text-gray-600 dark:text-gray-400 hover:text-green-600 dark:hover:text-green-400 focus-enhanced transition-colors"
                aria-label="Ir al inicio"
                itemProp="item"
              >
                <FaHome className="w-4 h-4" aria-hidden="true" />
                <span className="sr-only" itemProp="name">Inicio</span>
              </Link>
              <meta itemProp="position" content="1" />
            </li>
            
            {items.map((item, index) => (
              <li key={index} className="flex items-center" itemProp="itemListElement" itemScope itemType="https://schema.org/ListItem">
                <FaChevronRight className="w-3 h-3 text-gray-400 dark:text-gray-600 mx-2" aria-hidden="true" />
                {item.href && index < items.length - 1 ? (
                  <Link 
                    href={item.href}
                    className="text-gray-600 dark:text-gray-400 hover:text-green-600 dark:hover:text-green-400 hover:underline focus-enhanced transition-colors"
                    itemProp="item"
                  >
                    <span itemProp="name">{item.label}</span>
                  </Link>
                ) : (
                  <span 
                    className="text-slate-950 dark:text-white font-semibold"
                    aria-current="page"
                    itemProp="name"
                  >
                    {item.label}
                  </span>
                )}
                <meta itemProp="position" content={String(index + 2)} />
              </li>
            ))}
          </ol>
        </div>
      </nav>
    </>
  );
};

export default Breadcrumbs;
