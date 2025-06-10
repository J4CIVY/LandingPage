import { useRef } from 'react';
import './index.css'
import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
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
import NoAutorizado from "./pages/NoAutorizado";

function App() {
  const headerRef = useRef();

  return (
    <Router>
      <AuthProvider>
        <div className="bg-[#ffffff] min-h-screen flex flex-col">
          {/* Header con posicionamiento fijo */}
          <Header 
            ref={headerRef} 
            className="fixed top-0 left-0 right-0 z-50"
          />

          {/* Contenido principal con padding-top fijo basado en la altura del header */}
          <main className="pt-[76px] min-h-[calc(100vh-76px)] relative pb-20">
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
              <Route path="/miembros" element={
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