import { useState, useEffect, useRef, forwardRef } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';

const Header = forwardRef((props, ref) => {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
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
      <header 
        ref={setRefs} 
        className="fixed w-full z-50 bg-[#000031] shadow-md"
      >
        <div className="container mx-auto px-4">
          {/* Contenedor principal */}
          <div className="flex items-center justify-between h-16">
            {/* Logo alineado a la izquierda */}
            <button
              onClick={() => navigate('/')}
              className="focus:outline-none ml-2 md:ml-0"
              aria-label="Ir a inicio"
            >
              <img
                src="/Logo_Letras_Motoclub_BSK_Motorcycle_Team_White_192X192.webp"
                alt="Logo Motoclub BSK Motorcycle Team"
                className="w-[100px] md:w-[120px] h-auto object-contain"
                width={120}
                height={120}
                loading="lazy"
              />
            </button>

            {/* Menú desktop (alineado a la derecha) */}
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

            {/* Botones de membresía (solo desktop) */}
            <div className="hidden md:flex items-center space-x-4">
              <button
                className="bg-white text-[#000031] font-bold py-2 px-4 rounded hover:bg-[#00FF99] transition-colors"
                onClick={() => navigate('/login')}
              >
                Hazte Miembro
              </button>
              <button
                className="bg-white text-[#000031] font-bold py-2 px-4 rounded hover:bg-[#00FF99] transition-colors"
                onClick={() => navigate('/login')}
              >
                Área de Miembros
              </button>
            </div>

            {/* Botón de menú hamburguesa (solo móvil) */}
            <button
              className="md:hidden text-white focus:outline-none"
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
          <div className="md:hidden fixed inset-0 bg-[#000031] z-40 overflow-y-auto pt-16">
            <div className="container mx-auto px-4 py-8 flex flex-col h-full">
              {/* Items del menú */}
              <ul className="flex-1 flex flex-col space-y-6">
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

              {/* Sección de emergencia */}
              <div className="mt-auto pb-8">
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
                    <p>Teléfono: +XX XXX XXX XXX</p>
                    <p>Email: emergencias@bskmotorcycle.com</p>
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