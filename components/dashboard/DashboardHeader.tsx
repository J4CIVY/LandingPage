'use client';

import { useState } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { 
  FaHome, 
  FaUser, 
  FaCreditCard, 
  FaCalendarAlt, 
  FaUsers, 
  FaFileAlt, 
  FaGift, 
  FaShoppingCart, 
  FaHistory, 
  FaTrophy, 
  FaCog,
  FaBars,
  FaTimes
} from 'react-icons/fa';

interface NavigationItem {
  href: string;
  label: string;
  icon: React.ComponentType<{ className?: string }>;
}

const navigationItems: NavigationItem[] = [
  { href: '/dashboard', label: 'Inicio', icon: FaHome },
  { href: '/dashboard/profile', label: 'Perfil', icon: FaUser },
  { href: '/membership-status', label: 'Membresía', icon: FaCreditCard },
  { href: '/dashboard/eventos', label: 'Eventos', icon: FaCalendarAlt },
  { href: '/dashboard/comunidad', label: 'Comunidad', icon: FaUsers },
  { href: '/dashboard/pqrsdf', label: 'PQRSDF', icon: FaFileAlt },
  { href: '/dashboard/benefits', label: 'Beneficios', icon: FaGift },
  { href: '/store', label: 'Tienda', icon: FaShoppingCart },
  { href: '/dashboard/history', label: 'Historial', icon: FaHistory },
  { href: '/dashboard/gamification', label: 'Puntos', icon: FaTrophy },
  { href: '/dashboard/settings', label: 'Configuración', icon: FaCog },
];

export default function DashboardHeader() {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const pathname = usePathname();

  const toggleMenu = () => {
    setIsMenuOpen(!isMenuOpen);
  };

  const closeMenu = () => {
    setIsMenuOpen(false);
  };

  const isActiveRoute = (href: string) => {
    if (href === '/dashboard') {
      return pathname === '/dashboard';
    }
    return pathname.startsWith(href);
  };

  return (
    <>
      <header className="bg-slate-950 text-white shadow-lg sticky top-0 z-40">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            {/* Logo */}
            <Link href="/dashboard" className="flex items-center space-x-2">
              <div className="w-10 h-10 bg-green-600 rounded-lg flex items-center justify-center">
                <span className="font-bold text-white">BSK</span>
              </div>
              <span className="hidden sm:block font-bold text-lg">
                BSK Motorcycle Team
              </span>
            </Link>

            {/* Desktop Navigation */}
            <nav className="hidden lg:flex space-x-1">
              {navigationItems.map((item) => {
                const Icon = item.icon;
                const isActive = isActiveRoute(item.href);
                return (
                  <Link
                    key={item.href}
                    href={item.href}
                    className={`px-3 py-2 rounded-md text-sm font-medium transition-colors duration-200 flex items-center space-x-2 ${
                      isActive
                        ? 'bg-green-600 text-white'
                        : 'text-gray-300 hover:bg-slate-800 hover:text-white'
                    }`}
                  >
                    <Icon className="w-4 h-4" />
                    <span>{item.label}</span>
                  </Link>
                );
              })}
            </nav>

            {/* Mobile menu button */}
            <button
              onClick={toggleMenu}
              className="lg:hidden p-2 rounded-md text-gray-300 hover:text-white hover:bg-slate-800 transition-colors duration-200"
              aria-label="Abrir menú"
            >
              <div className={`transform transition-transform duration-200 ${isMenuOpen ? 'rotate-180' : 'rotate-0'}`}>
                {isMenuOpen ? (
                  <FaTimes className="w-6 h-6" />
                ) : (
                  <FaBars className="w-6 h-6" />
                )}
              </div>
            </button>
          </div>
        </div>
      </header>

      {/* Mobile Menu Overlay */}
      {isMenuOpen && (
        <>
          {/* Backdrop */}
          <div
            className={`fixed inset-0 bg-black bg-opacity-50 z-40 lg:hidden transition-opacity duration-200 ${
              isMenuOpen ? 'opacity-100' : 'opacity-0'
            }`}
            onClick={closeMenu}
          />

          {/* Mobile Menu Panel */}
          <div
            className={`fixed top-0 right-0 h-full w-80 bg-white shadow-2xl z-50 lg:hidden transform transition-transform duration-300 ease-in-out ${
              isMenuOpen ? 'translate-x-0' : 'translate-x-full'
            }`}
          >
            <div className="p-6">
              {/* Mobile menu header */}
              <div className="flex items-center justify-between mb-8">
                <div className="flex items-center space-x-3">
                  <div className="w-8 h-8 bg-green-600 rounded-lg flex items-center justify-center">
                    <span className="font-bold text-white text-sm">BSK</span>
                  </div>
                  <span className="font-bold text-slate-900">Menu</span>
                </div>
                <button
                  onClick={closeMenu}
                  className="p-2 rounded-md text-gray-500 hover:text-gray-700 hover:bg-gray-100 transition-colors duration-200"
                  aria-label="Cerrar menú"
                >
                  <FaTimes className="w-5 h-5" />
                </button>
              </div>

              {/* Mobile Navigation */}
              <nav className="space-y-2">
                {navigationItems.map((item) => {
                  const Icon = item.icon;
                  const isActive = isActiveRoute(item.href);
                  return (
                    <Link
                      key={item.href}
                      href={item.href}
                      onClick={closeMenu}
                      className={`w-full flex items-center space-x-3 px-4 py-3 rounded-lg text-sm font-medium transition-colors duration-200 ${
                        isActive
                          ? 'bg-green-600 text-white shadow-md'
                          : 'text-gray-700 hover:bg-gray-100'
                      }`}
                    >
                      <Icon className="w-5 h-5" />
                      <span>{item.label}</span>
                    </Link>
                  );
                })}
              </nav>

              {/* Mobile menu footer */}
              <div className="mt-8 pt-6 border-t border-gray-200">
                <p className="text-xs text-gray-500 text-center">
                  BSK Motorcycle Team Dashboard
                </p>
              </div>
            </div>
          </div>
        </>
      )}
    </>
  );
}