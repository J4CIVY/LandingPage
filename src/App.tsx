import { useRef, Suspense, lazy } from 'react';
import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import Header from "./components/shared/Header";
import Footer from "./components/shared/Footer";
import CookieBanner from "./components/shared/CookieBanner";
import ErrorBoundary from './components/shared/ErrorBoundary';
import './index.css';

const Home = lazy(() => import('./pages/home/Home'));
const Store = lazy(() => import('./pages/Store'));
const Events = lazy(() => import('./pages/Events'));
const Courses = lazy(() => import('./pages/Courses'));
const About = lazy(() => import('./pages/About'));
const Weather = lazy(() => import('./pages/Weather'));
const Sos = lazy(() => import('./pages/Sos'));
const Contact = lazy(() => import('./pages/Contact'));
const Documents = lazy(() => import('./pages/Documents'));
const Memberships = lazy(() => import('./pages/Memberships'));
const CookiePolicy = lazy(() => import('./pages/CookiePolicy'));
const MembershipInfoPage = lazy(() => import('./pages/users/MembershipInfoPage'));
const UserRegister = lazy(() => import('./pages/users/UserRegister'));
const RegistrationSuccessWrapper = lazy(() => import('./pages/users/RegistrationSuccessWrapper'));
const NotFound = lazy(() => import('./pages/NotFound'));

function App(): JSX.Element {
  const headerRef = useRef<HTMLElement>(null);

  return (
    <Router>
      <Header 
        ref={headerRef} 
        className="fixed top-0 left-0 right-0 z-50"
      />
      <main className="pt-[76px] min-h-[calc(100vh-76px)] relative pb-20">
        <ErrorBoundary>
          <Suspense fallback={<div className="flex justify-center items-center h-screen">Cargando...</div>}>
            <Routes>
              {/* Public Routes */}
              <Route path="/" element={<Home />} />
              <Route path="/store" element={<Store />} />
              <Route path="/events" element={<Events />} />
              <Route path="/courses" element={<Courses />} />
              <Route path="/about" element={<About />} />
              <Route path="/weather" element={<Weather />} />
              <Route path="/sos" element={<Sos />} />
              <Route path="/contact" element={<Contact />} />
              <Route path="/documents" element={<Documents />} />
              <Route path="/memberships" element={<Memberships />} />
              <Route path="/cookie-policy" element={<CookiePolicy />} />
              <Route path="/membership-info" element={<MembershipInfoPage />} />
              <Route path="/register" element={<UserRegister />} />
<Route path="/registration-success" element={<RegistrationSuccessWrapper />} />
              {/* 404 Not Found Route */}
              <Route path="*" element={<NotFound />} />
            </Routes>
          </Suspense>
        </ErrorBoundary>
      </main>
      <Footer />
      <CookieBanner />
    </Router>
  );
}

export default App;
