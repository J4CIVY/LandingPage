import { useState, useEffect, useRef, forwardRef, Ref } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';

/**
 * @typedef {Object} HeaderProps
 * @property {string} [className] - Additional CSS classes for the header.
 */
interface HeaderProps extends React.HTMLAttributes<HTMLElement> {
  className?: string;
}

/**
 * Header component for the application, including navigation and mobile menu.
 * @param {HeaderProps} props - Component props.
 * @param {Ref<HTMLElement>} ref - Ref to the header element.
 * @returns {JSX.Element}
 */
const Header = forwardRef<HTMLElement, HeaderProps>(({ className = '', ...props }, ref) => {
  const [isMenuOpen, setIsMenuOpen] = useState<boolean>(false);
  const navigate = useNavigate();
  const location = useLocation();
  const headerRef = useRef<HTMLElement>(null);
  
  // Cloudinary configuration
  const cloudName: string = "dz0peilmu";
  const logoUrl = {
    avif: `https://res.cloudinary.com/${cloudName}/image/upload/f_avif,q_auto,w_192/BSK_MT_Logo_Letras_White_192_x_192_px_nptwwj`,
    webp: `https://res.cloudinary.com/${cloudName}/image/upload/f_webp,q_auto,w_192/BSK_MT_Logo_Letras_White_192_x_192_px_nptwwj`,
    png: `https://res.cloudinary.com/${cloudName}/image/upload/f_png,q_auto,w_192/BSK_MT_Logo_Letras_White_192_x_192_px_nptwwj`
  };

  // Combine both refs
  const setRefs = (node: HTMLElement | null) => {
    headerRef.current = node;
    if (typeof ref === 'function') {
      ref(node);
    } else if (ref) {
      (ref as React.MutableRefObject<HTMLElement | null>).current = node;
    }
  };

  // Block scroll when the menu is open
  useEffect(() => {
    if (isMenuOpen) {
      document.body.classList.add('overflow-hidden');
    } else {
      document.body.classList.remove('overflow-hidden');
    }
    // Cleanup function to ensure scroll is re-enabled if component unmounts
    return () => document.body.classList.remove('overflow-hidden');
  }, [isMenuOpen]);

  /**
   * @typedef {Object} NavItem
   * @property {string} name - Display name of the navigation item.
   * @property {string} path - Path for the navigation item.
   */
  interface NavItem {
    name: string;
    path: string;
  }

  // Menu items
  const navItems: NavItem[] = [
    { name: 'Inicio', path: '/' },
    { name: 'Tienda', path: '/store' },
    { name: 'Eventos', path: '/events' },
    { name: 'Cursos', path: '/courses' },
    { name: 'Sobre Nosotros', path: '/about' },
    { name: 'Clima', path: '/weather' },
    { name: 'Contacto', path: '/contact' },
    { name: 'Documentos', path: '/documents' },
  ];

  return (
    <header 
      ref={setRefs}
      className={`w-full bg-slate-950 shadow-md py-1 ${className}`}
      {...props}
    >
      <div className="container mx-auto px-4">
        {/* Main container */}
        <div className="flex items-center justify-between h-full">
          {/* Logo aligned to the left */}
          <button
            onClick={() => navigate('/')}
            className="focus:outline-none ml-3 md:ml-4"
            aria-label="Ir a inicio"
          >
            <picture>
              <source srcSet={logoUrl.avif} type="image/avif" />
              <source srcSet={logoUrl.webp} type="image/webp" />
              <img
                src={logoUrl.png}
                alt="Logo Motoclub BSK Motorcycle Team"
                className="w-[80px] md:w-[100px] h-auto object-contain"
                width={90}
                height={90}
                loading="eager"
                fetchpriority="high"
              />
            </picture>
          </button>

          {/* Desktop menu (aligned to the right) */}
          <nav className="hidden md:flex items-center">
            <ul className="flex space-x-6 items-center">
              {navItems.map((item) => (
                <li key={item.name}>
                  <button
                    onClick={() => navigate(item.path)}
                    className={`text-white hover:text-green-400 transition-colors ${
                      location.pathname === item.path ? 'text-green-400 font-bold' : ''
                    }`}
                    aria-current={location.pathname === item.path ? 'page' : undefined}
                  >
                    {item.name}
                  </button>
                </li>
              ))}
            </ul>
          </nav>

          {/* Hamburger menu button (mobile only) */}
          <button
            className="md:hidden text-white focus:outline-none mr-3"
            onClick={() => setIsMenuOpen(!isMenuOpen)}
            aria-expanded={isMenuOpen}
            aria-label="Menú"
          >
            <div className="w-6 flex flex-col items-end">
              <span className={`block h-0.5 w-6 bg-white rounded-full transition-all duration-300 ${isMenuOpen ? 'rotate-45 translate-y-1.5' : 'mb-1.5'}`}></span>
              <span className={`block h-0.5 bg-white rounded-full transition-all duration-300 ${isMenuOpen ? 'w-6 -rotate-45' : 'w-4'}`}></span>
            </div>
          </button>
        </div>
      </div>

      {/* Mobile dropdown menu */}
      {isMenuOpen && (
        <div 
          className="md:hidden fixed inset-0 bg-slate-950 z-40 overflow-y-auto"
          style={{ top: '76px' }} // Adjust top based on header height
          role="navigation"
          aria-label="Menú principal móvil"
        >
          <div className="container mx-auto px-5 py-8 flex flex-col h-full">
            {/* Menu items */}
            <ul className="flex-1 flex flex-col space-y-6 pl-2">
              {navItems.map((item) => (
                <li key={item.name}>
                  <button
                    onClick={() => {
                      navigate(item.path);
                      setIsMenuOpen(false);
                    }}
                    className={`text-white text-xl font-medium hover:text-green-400 transition-colors ${
                      location.pathname === item.path ? 'text-green-400 font-bold' : ''
                    }`}
                    aria-current={location.pathname === item.path ? 'page' : undefined}
                  >
                    {item.name}
                  </button>
                </li>
              ))}
            </ul>

            {/* Emergency section */}
            <div className="mt-auto pb-8 pl-2">
              <div className="border-t border-gray-700 pt-6">
                <h3 className="text-white font-bold mb-4">Asistencia de Emergencia</h3>
                <p className="text-white text-sm mb-4">
                  Solicitar Asistencia Técnica O De Emergencias
                </p>
                <button
                  onClick={() => {
                    navigate('/sos');
                    setIsMenuOpen(false);
                  }}
                  className="w-full bg-red-600 text-white font-bold py-3 px-4 rounded hover:bg-red-700 transition-colors mb-4"
                >
                  Botón SOS
                </button>
                <div className="text-white text-sm">
                  <p>Contacto de emergencia:</p>
                  <p>Teléfono: +57 312 519 2000</p>
                  <p>Email: emergencias@bskmt.com</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </header>
  );
});

export default Header;