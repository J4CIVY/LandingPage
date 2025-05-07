import { useState, useEffect, useRef } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import clsx from 'clsx';

const Header = () => {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const navigate = useNavigate();
  const location = useLocation();

  // Evitar scroll cuando el menú móvil está abierto
  useEffect(() => {
    document.body.style.overflow = isMenuOpen ? 'hidden' : '';
    return () => (document.body.style.overflow = '');
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
      <header className="fixed top-0 left-0 w-full z-50 bg-transparent">
        <div className="flex items-center justify-between px-4 py-3 md:px-8 bg-transparent">
          {/* Logo */}
          <button onClick={() => navigate('/')} className="z-50">
            <img
              src="/Logo_Letras_Motoclub_BSK_Motorcycle_Team_White_192X192.webp"
              alt="Logo BSK Motorcycle Team"
              className="w-[90px] md:w-[120px] object-contain"
            />
          </button>

          {/* Botón hamburguesa */}
          <div className="md:hidden z-50">
            <button
              onClick={() => setIsMenuOpen(!isMenuOpen)}
              className="flex flex-col justify-between h-5 w-7 focus:outline-none"
              aria-label="Abrir menú"
            >
              <span
                className={clsx(
                  'h-0.5 w-full bg-white transition-transform duration-300',
                  isMenuOpen && 'rotate-45 translate-y-2'
                )}
              />
              <span
                className={clsx(
                  'h-0.5 w-full bg-white transition-opacity duration-300',
                  isMenuOpen && 'opacity-0'
                )}
              />
              <span
                className={clsx(
                  'h-0.5 w-full bg-white transition-transform duration-300',
                  isMenuOpen && '-rotate-45 -translate-y-2'
                )}
              />
            </button>
          </div>

          {/* Menú escritorio */}
          <nav className="hidden md:flex space-x-8">
            {navItems.map((item) => (
              <button
                key={item.name}
                onClick={() => navigate(item.path)}
                className={clsx(
                  'text-white hover:text-[#00FF99] font-medium transition-colors',
                  location.pathname === item.path && 'text-[#00FF99]'
                )}
              >
                {item.name}
              </button>
            ))}
          </nav>
        </div>
      </header>

      {/* Menú móvil desplegable */}
      <div
        className={clsx(
          'fixed top-0 left-0 w-full h-full bg-white z-40 transition-transform duration-500 ease-in-out md:hidden',
          isMenuOpen ? 'translate-x-0' : '-translate-x-full'
        )}
      >
        <div className="px-6 py-6 flex flex-col justify-between h-full">
          {/* Navegación */}
          <div>
            <ul className="flex flex-col space-y-6 text-left mt-10">
              {navItems.map((item) => (
                <li key={item.name}>
                  <button
                    onClick={() => {
                      navigate(item.path);
                      setIsMenuOpen(false);
                    }}
                    className={clsx(
                      'text-[#000031] text-xl font-semibold transition-colors',
                      location.pathname === item.path && 'text-[#00FF99]'
                    )}
                  >
                    {item.name}
                  </button>
                </li>
              ))}
            </ul>
          </div>

          {/* Sección de emergencia */}
          <div className="mt-10 border-t pt-6 border-gray-300">
            <p className="text-[#000031] font-semibold mb-3">
              Solicitar Asistencia Técnica o de Emergencias
            </p>
            <button
              onClick={() => {
                navigate('/sos');
                setIsMenuOpen(false);
              }}
              className="bg-[#000031] text-white font-bold py-2 px-4 rounded hover:bg-[#00FF99] hover:text-[#000031] transition-colors w-full"
            >
              Iniciar SOS
            </button>
            <div className="mt-4 text-sm text-gray-700">
              <p>📞 Emergencias: +58 412-1234567</p>
              <p>📩 Correo: emergencias@bskmt.com</p>
            </div>
          </div>
        </div>
      </div>
    </>
  );
};

export default Header;
