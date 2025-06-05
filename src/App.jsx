import { useRef, useState, useEffect } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from "react-router-dom";
import { AuthProvider } from './components/auth/AuthContext';
import ProtectedRoute from './components/auth/ProtectedRoute';
import EventosDashboard from './pages/EventosDashboard';
import MemberArea from './pages/MemberArea';
import Login from "./components/auth/Login";
import Documents from "./pages/Documents";
import Contact from "./pages/Contact";
import Sos from "./pages/Sos";
import Weather from "./pages/Weather";
import About from "./pages/About";
import Courses from "./pages/Courses";
import Events from "./pages/Events";
import Home from "./pages/Home";
import Header from "./components/shared/Header";
import Footer from "./components/shared/Footer";
import CookieBanner from "./components/shared/CookieBanner";
import CookiePolicy from "./components/shared/CookiePolicy";
import NoAutorizado from "./pages/NoAutorizado"; // Nuevo componente añadido

function App() {
  const headerRef = useRef();
  const [headerHeight, setHeaderHeight] = useState(0);

  // Actualizar altura del header
  useEffect(() => {
    const updateHeaderHeight = () => {
      if (headerRef.current) {
        setHeaderHeight(headerRef.current.offsetHeight);
      }
    };

    updateHeaderHeight();

    const resizeObserver = new ResizeObserver(updateHeaderHeight);
    if (headerRef.current) {
      resizeObserver.observe(headerRef.current);
    }

    return () => {
      resizeObserver.disconnect();
    };
  }, []);

  return (
    <Router>
      <AuthProvider> {/* AuthProvider ahora está dentro de Router */}
        <div className="bg-[#ffffff] min-h-screen flex flex-col">
          {/* Contenedor fijo para el header */}
          <div style={{
            position: 'fixed',
            top: 0,
            left: 0,
            right: 0,
            zIndex: 50,
            width: '100%'
          }}>
            <Header ref={headerRef} />
          </div>

          {/* Contenido principal con padding dinámico */}
          <main
            style={{
              paddingTop: `${headerHeight}px`,
              minHeight: `calc(100vh - ${headerHeight}px)`,
              position: 'relative',
              flex: 1
            }}
            className="pb-20"
          >
            <Routes>
              {/* Rutas públicas */}
              <Route path="/" element={<Home />} />
              <Route path="/events" element={<Events />} />
              <Route path="/courses" element={<Courses />} />
              <Route path="/about" element={<About />} />
              <Route path="/weather" element={<Weather />} />
              <Route path="/sos" element={<Sos />} />
              <Route path="/contact" element={<Contact />} />
              <Route path="/documents" element={<Documents />} />
              <Route path="/login" element={<Login />} />
              <Route path="/cookie-policy" element={<CookiePolicy />} />
              <Route path="/no-autorizado" element={<NoAutorizado />} />

              {/* Rutas protegidas */}
              <Route path="/area-de-miembros" element={
                <ProtectedRoute>
                  <MemberArea />
                </ProtectedRoute>
              } />

              <Route path="/eventos-dashboard" element={
                <ProtectedRoute>
                  <EventosDashboard />
                </ProtectedRoute>
              } />
              
            </Routes>
          </main>

          <Footer />
          <CookieBanner />
        </div>
      </AuthProvider>
    </Router>
  );
}

export default App;