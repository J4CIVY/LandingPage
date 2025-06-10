import { useState, useEffect, useRef, forwardRef } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';

const Header = forwardRef((props, ref) => {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [headerHeight, setHeaderHeight] = useState(0);
  const navigate = useNavigate();
  const location = useLocation();
  const headerRef = useRef(null);

  // Combinamos ambas refs y actualizamos la altura
  const setRefs = (node) => {
    headerRef.current = node;
    if (node) {
      setHeaderHeight(node.offsetHeight);
    }
    if (typeof ref === 'function') {
      ref(node);
    } else if (ref) {
      ref.current = node;
    }
  };

  // Actualizar altura cuando cambia el tamaño
  useEffect(() => {
    const updateHeight = () => {
      if (headerRef.current) {
        setHeaderHeight(headerRef.current.offsetHeight);
      }
    };

    window.addEventListener('resize', updateHeight);
    return () => window.removeEventListener('resize', updateHeight);
  }, []);

  // Bloquear scroll cuando el menú está abierto
  useEffect(() => {
    if (isMenuOpen) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = '';
    }
    return () => { document.body.style.overflow = ''; };
  }, [isMenuOpen]);

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
      <header 
        ref={setRefs} 
        className="w-full bg-[#000031] shadow-md py-1"
        {...props}
      >
        <div className="container mx-auto px-4">
          <div className="flex items-center justify-between h-full">
            <button
              onClick={() => navigate('/')}
              className="focus:outline-none ml-3 md:ml-4"
              aria-label="Ir a inicio"
            >
              <img
                src="/Logo_Letras_BSK_MT_100.webp"
                alt="Logo Motoclub BSK Motorcycle Team"
                className="w-[80px] md:w-[100px] h-auto object-contain"
                width={90}
                height={90}
                loading="lazy"
              />
            </button>

            <nav className="hidden md:block">
              <ul className="flex space-x-6">
                {navItems.map((item) => (
                  <li key={item.name}>
                    <button
                      onClick={() => navigate(item.path)}
                      className={`text-white hover:text-[#00FF99] transition-colors ${
                        location.pathname === item.path ? 'text-[#00FF99] font-bold' : ''
                      }`}
                    >
                      {item.name}
                    </button>
                  </li>
                ))}
              </ul>
            </nav>

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

        {/* Menú móvil desplegable - Ahora usa headerHeight para posicionarse */}
        {isMenuOpen && (
          <div 
            className="md:hidden fixed inset-0 bg-[#000031] z-40 overflow-y-auto"
            style={{ 
              top: `${headerHeight}px`,
              height: `calc(100vh - ${headerHeight}px)`
            }}
          >
            <div className="container mx-auto px-5 py-8 flex flex-col h-full">
              <ul className="flex-1 flex flex-col space-y-6 pl-2">
                {navItems.map((item) => (
                  <li key={item.name}>
                    <button
                      onClick={() => {
                        navigate(item.path);
                        setIsMenuOpen(false);
                      }}
                      className={`text-white text-xl font-medium hover:text-[#00FF99] transition-colors ${
                        location.pathname === item.path ? 'text-[#00FF99] font-bold' : ''
                      }`}
                    >
                      {item.name}
                    </button>
                  </li>
                ))}
              </ul>

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
    </>
  );
});

export default Header;