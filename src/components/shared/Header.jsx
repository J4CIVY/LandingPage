import { useState, useEffect, useRef, forwardRef } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';

const Header = forwardRef((props, ref) => {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [isScrolled, setIsScrolled] = useState(false);
  const [isDarkBackground, setIsDarkBackground] = useState(false);
  const navigate = useNavigate();
  const location = useLocation();
  const headerRef = useRef(null);

  const setRefs = (node) => {
    headerRef.current = node;
    if (typeof ref === 'function') {
      ref(node);
    } else if (ref) {
      ref.current = node;
    }
  };

  useEffect(() => {
    const detectBackgroundBrightness = () => {
      if (!headerRef.current) return;
      const section = document.elementFromPoint(window.innerWidth / 2, headerRef.current.clientHeight + 1);
      if (!section) return;

      const bgColor = window.getComputedStyle(section).backgroundColor;
      const rgb = bgColor.match(/\d+/g)?.map(Number);
      if (!rgb || rgb.length < 3) return;
      const brightness = (rgb[0] * 299 + rgb[1] * 587 + rgb[2] * 114) / 1000;
      setIsDarkBackground(brightness < 128);
    };

    detectBackgroundBrightness();
    window.addEventListener('scroll', detectBackgroundBrightness);
    return () => window.removeEventListener('scroll', detectBackgroundBrightness);
  }, []);

  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 0);
    };
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  useEffect(() => {
    document.body.style.overflow = isMenuOpen ? 'hidden' : '';
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

  const headerBgClass = isScrolled ? 'bg-white bg-opacity-80 shadow-md' : 'bg-transparent';
  const textColor = isScrolled ? 'text-[#000031]' : isDarkBackground ? 'text-white' : 'text-[#000031]';
  const iconColor = isScrolled ? '#000031' : isDarkBackground ? '#ffffff' : '#000031';

  return (
    <>
      <header ref={setRefs} className={`fixed w-full z-50 transition-colors duration-300 ${headerBgClass}`}>
        <div className={`transition-all duration-300 ${isScrolled ? 'h-0 opacity-0' : 'h-10 opacity-100'} bg-red-600 flex items-center justify-center`}>
          <button
            onClick={() => navigate('/sos')}
            className="text-white text-sm md:text-base font-medium hover:underline"
          >
            ¿Necesitas asistencia técnica o de emergencias?
          </button>
        </div>

        <div className="flex items-center justify-between py-4 px-4">
          <button
            onClick={() => navigate('/')}
            className="focus:outline-none"
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

          <div className="md:hidden">
            <button
              onClick={() => setIsMenuOpen(!isMenuOpen)}
              className="focus:outline-none"
              aria-expanded={isMenuOpen}
            >
              {isMenuOpen ? (
                <svg className="w-6 h-6" fill="none" stroke={iconColor} viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              ) : (
                <svg className="w-6 h-6" fill="none" stroke={iconColor} viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
                </svg>
              )}
            </button>
          </div>

          <nav className="hidden md:block">
            <ul className="flex space-x-6">
              {navItems.map((item) => (
                <li key={item.name}>
                  <button
                    onClick={() => navigate(item.path)}
                    className={`${textColor} hover:text-[#00FF99] transition-colors ${location.pathname === item.path ? 'text-[#00FF99]' : ''}`}
                  >
                    {item.name}
                  </button>
                </li>
              ))}
            </ul>
          </nav>
        </div>
      </header>

      {/* Menú móvil desplegable */}
      {isMenuOpen && (
        <div className="md:hidden fixed top-[100px] inset-x-0 bg-white z-40 overflow-y-auto border-t border-[#000031]">
          <div className="px-4 py-6">
            <ul className="flex flex-col space-y-6 text-left">
              {navItems.map((item) => (
                <li key={item.name}>
                  <button
                    onClick={() => {
                      navigate(item.path);
                      setIsMenuOpen(false);
                    }}
                    className="text-[#000031] text-xl font-medium hover:text-[#00FF99] transition-colors"
                  >
                    {item.name}
                  </button>
                </li>
              ))}
            </ul>

            {/* Sección de contacto de emergencia */}
            <div className="mt-10 border-t border-gray-300 pt-6">
              <h2 className="text-[#000031] font-semibold mb-2">Solicitar Asistencia Técnica o de Emergencias</h2>
              <button
                onClick={() => {
                  navigate('/sos');
                  setIsMenuOpen(false);
                }}
                className="bg-[#000031] text-white px-4 py-2 rounded hover:bg-[#00FF99] hover:text-[#000031] transition-colors"
              >
                Iniciar Proceso SOS
              </button>
              <p className="text-sm text-[#000031] mt-4">
                Teléfono: +58 123-456-7890<br />
                Correo: asistencia@bskmt.com
              </p>
            </div>
          </div>
        </div>
      )}
    </>
  );
});

export default Header;