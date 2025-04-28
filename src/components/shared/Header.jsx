import { useState, useEffect, useRef, forwardRef } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';

const Header = forwardRef((props, ref) => {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [isScrolled, setIsScrolled] = useState(false);
  const navigate = useNavigate();
  const location = useLocation();
  const headerRef = useRef(null);

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
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = '';
    }
    return () => { document.body.style.overflow = ''; };
  }, [isMenuOpen]);

  // Ocultar secciones al hacer scroll
  useEffect(() => {
    const handleScroll = () => setIsScrolled(window.scrollY > 50);
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  // Items del menú
  const navItems = [
    { name: 'Inicio', path: '/' },
    { name: 'Eventos', path: '/events' },
    { name: 'Cursos', path: '/courses' },
    { name: 'Sobre Nosotros', path: '/about' },
    { name: 'Clima', path: '/weather' },
    { name: 'SOS', path: '/sos' },
    { name: 'Contacto', path: '/contact' },
    { name: 'Documentos', path: '/documents' },
  ];

  return (
    <>
      <header ref={setRefs} className="fixed w-full z-50">
        {/* Sección 1: Banner de emergencia */}
        <div className={`transition-all duration-300 ${isScrolled ? 'h-0 opacity-0' : 'h-10 opacity-100'} bg-red-600 flex items-center justify-center`}>
          <button 
            onClick={() => navigate('/sos')} 
            className="text-white text-sm md:text-base font-medium hover:underline"
          >
            ¿Necesitas asistencia técnica o de emergencias?
          </button>
        </div>

        {/* Sección 2: Logo */}
        <div className="bg-[#000031] flex items-center justify-center py-4">
          <button onClick={() => navigate('/')} className="text-white text-2xl font-bold">
            <span>BSK</span>
            <span className="text-[#00FF99]">MOTORCYCLE</span>
            <span>TEAM</span>
          </button>
        </div>

        {/* Sección 3: Botones principales */}
        <div className={`transition-all duration-300 ${isScrolled ? 'h-0 opacity-0' : 'h-16 opacity-100'} bg-[#000031] flex items-center justify-center space-x-4 px-4`}>
          <button 
            className="bg-white text-[#000031] font-bold py-2 px-4 md:px-6 rounded hover:bg-[#00FF99] transition-colors"
            onClick={() => navigate('/login')}
          >
            Hazte Miembro
          </button>
          <button 
            className="bg-white text-[#000031] font-bold py-2 px-4 md:px-6 rounded hover:bg-[#00FF99] transition-colors"
            onClick={() => navigate('/login')}
          >
            Área de Miembros
          </button>
        </div>

        {/* Sección 4: Menú de navegación */}
        <div className="bg-[#000031] h-16 relative">
          <div className="container mx-auto px-4 h-full flex items-center justify-between md:justify-center">
            {/* Menú desktop (centrado) */}
            <nav className="hidden md:block">
              <ul className="flex space-x-6">
                {navItems.map((item) => (
                  <li key={item.name}>
                    <button
                      onClick={() => navigate(item.path)}
                      className={`text-white hover:text-[#00FF99] transition-colors ${location.pathname === item.path ? 'text-[#00FF99]' : ''}`}
                    >
                      {item.name}
                    </button>
                  </li>
                ))}
              </ul>
            </nav>

            {/* Menú móvil (icono centrado) */}
            <div className="md:hidden absolute left-1/2 transform -translate-x-1/2">
              <button 
                onClick={() => setIsMenuOpen(!isMenuOpen)}
                className="text-white focus:outline-none"
                aria-expanded={isMenuOpen}
              >
                {isMenuOpen ? (
                  <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                  </svg>
                ) : (
                  <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
                  </svg>
                )}
              </button>
            </div>
          </div>
        </div>
      </header>

      {/* Menú móvil desplegable */}
      {isMenuOpen && (
        <div 
          className="md:hidden fixed inset-0 bg-white z-40 overflow-y-auto"
          style={{ top: headerRef.current?.offsetHeight || '144px' }}
        >
          <div className="container mx-auto px-4 py-8">
            <ul className="flex flex-col space-y-6 text-center">
              {navItems.map((item) => (
                <li key={item.name}>
                  <button
                    onClick={() => {
                      navigate(item.path);
                      setIsMenuOpen(false);
                    }}
                    className={`text-[#000031] text-xl font-medium hover:text-[#00FF99] transition-colors ${location.pathname === item.path ? 'text-[#00FF99]' : ''}`}
                  >
                    {item.name}
                  </button>
                </li>
              ))}
            </ul>
          </div>
        </div>
      )}
    </>
  );
});

export default Header;