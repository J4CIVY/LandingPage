import { useState, useEffect, useRef, forwardRef } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { useCart } from '../../context/CartContext';

const Header = forwardRef(({ className = '', ...props }, ref) => {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const navigate = useNavigate();
  const location = useLocation();
  const headerRef = useRef(null);
  const { totalItems } = useCart();

  // Configuración de Cloudinary
  const cloudName = "dz0peilmu";
  const logoUrl = {
    avif: `https://res.cloudinary.com/${cloudName}/image/upload/f_avif,q_auto,w_192/BSK_MT_Logo_Letras_White_192_x_192_px_nptwwj`,
    webp: `https://res.cloudinary.com/${cloudName}/image/upload/f_webp,q_auto,w_192/BSK_MT_Logo_Letras_White_192_x_192_px_nptwwj`,
    png: `https://res.cloudinary.com/${cloudName}/image/upload/f_png,q_auto,w_192/BSK_MT_Logo_Letras_White_192_x_192_px_nptwwj`
  };

  // Combinamos ambas refs
  const setRefs = (node) => {
    headerRef.current = node;
    if (typeof ref === 'function') {
      ref(node);
    } else if (ref) {
      ref.current = node;
    }
  };

  // Bloquear scroll cuando el menú está abierto
  useEffect(() => {
    if (isMenuOpen) {
      document.body.classList.add('overflow-hidden');
    } else {
      document.body.classList.remove('overflow-hidden');
    }
    return () => document.body.classList.remove('overflow-hidden');
  }, [isMenuOpen]);

  // Items del menú
  const navItems = [
    { name: 'Inicio', path: '/' },
    { name: 'Tienda', path: '/products' },
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
        {/* Contenedor principal */}
        <div className="flex items-center justify-between h-full">
          {/* Logo alineado a la izquierda */}
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

          {/* Menú desktop (alineado a la derecha) */}
          <nav className="hidden md:flex items-center">
            <ul className="flex space-x-6 items-center">
              {navItems.map((item) => (
                <li key={item.name}>
                  <button
                    onClick={() => navigate(item.path)}
                    className={`text-white hover:text-green-400 transition-colors ${
                      location.pathname === item.path ? 'text-green-400 font-bold' : ''
                    }`}
                  >
                    {item.name}
                  </button>
                </li>
              ))}
              
              {/* Icono del carrito para desktop */}
              <li className="relative">
                <button
                  onClick={() => navigate('/cart')}
                  className="text-white hover:text-green-400 transition-colors"
                  aria-label="Carrito de compras"
                >
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 3h2l.4 2M7 13h10l4-8H5.4M7 13L5.4 5M7 13l-2.293 2.293c-.63.63-.184 1.707.707 1.707H17m0 0a2 2 0 100 4 2 2 0 000-4zm-8 2a2 2 0 11-4 0 2 2 0 014 0z" />
                  </svg>
                  {totalItems > 0 && (
                    <span className="absolute -top-2 -right-2 bg-red-500 text-white text-xs rounded-full h-5 w-5 flex items-center justify-center">
                      {totalItems}
                    </span>
                  )}
                </button>
              </li>
              
              {/* Manejo de sesión para desktop */}
              <li>
                {user ? (
                  <div className="flex items-center space-x-4">
                    <button
                      onClick={() => navigate('/miembros')}
                      className="text-white hover:text-green-400 transition-colors"
                    >
                      Mi cuenta
                    </button>
                  </div>
                ) : (
                  <button
                    onClick={() => navigate('/login')}
                    className="text-white hover:text-green-400 transition-colors"
                  >
                    Iniciar sesión
                  </button>
                )}
              </li>
            </ul>
          </nav>

          {/* Botón de menú hamburguesa (solo móvil) */}
          <button
            className="md:hidden text-white focus:outline-none mr-3"
            onClick={() => setIsMenuOpen(!isMenuOpen)}
            aria-label="Menú"
          >
            <div className="w-6 flex flex-col items-end">
              <span className={`block h-0.5 w-6 bg-white rounded-full transition-all duration-300 ${isMenuOpen ? 'rotate-45 translate-y-1.5' : 'mb-1.5'}`}></span>
              <span className={`block h-0.5 bg-white rounded-full transition-all duration-300 ${isMenuOpen ? 'w-6 -rotate-45' : 'w-4'}`}></span>
            </div>
          </button>
        </div>
      </div>

      {/* Menú móvil desplegable */}
      {isMenuOpen && (
        <div 
          className="md:hidden fixed inset-0 bg-slate-950 z-40 overflow-y-auto"
          style={{ top: '76px' }}
        >
          <div className="container mx-auto px-5 py-8 flex flex-col h-full">
            {/* Items del menú */}
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
                  >
                    {item.name}
                  </button>
                </li>
              ))}
              
              {/* Carrito para móvil */}
              <li className="flex items-center">
                <button
                  onClick={() => {
                    navigate('/cart');
                    setIsMenuOpen(false);
                  }}
                  className="text-white text-xl font-medium hover:text-green-400 transition-colors flex items-center"
                >
                  Carrito
                  {totalItems > 0 && (
                    <span className="ml-2 bg-red-500 text-white text-xs rounded-full h-5 w-5 flex items-center justify-center">
                      {totalItems}
                    </span>
                  )}
                </button>
              </li>
              
              {/* Manejo de sesión para móvil */}
              <li>
                {user ? (
                  <div className="flex flex-col space-y-4">
                    <button
                      onClick={() => {
                        navigate('/miembros');
                        setIsMenuOpen(false);
                      }}
                      className="text-white text-xl font-medium hover:text-green-400 transition-colors text-left"
                    >
                      Mi cuenta
                    </button>
                    <button 
                      onClick={() => {
                        logout();
                        navigate('/');
                        setIsMenuOpen(false);
                      }}
                      className="text-white text-xl font-medium hover:text-green-400 transition-colors text-left"
                    >
                      Cerrar sesión
                    </button>
                  </div>
                ) : (
                  <button
                    onClick={() => {
                      navigate('/login');
                      setIsMenuOpen(false);
                    }}
                    className="text-white text-xl font-medium hover:text-green-400 transition-colors text-left"
                    >
                    Iniciar sesión
                  </button>
                )}
              </li>
            </ul>

            {/* Sección de emergencia */}
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