import { useRef } from 'react';
import './index.css';
import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import Memberships from "./pages/Memberships";
import Documents from "./pages/Documents";
import Contact from "./pages/Contact";
import Sos from "./pages/Sos";
import Weather from "./pages/Weather";
import About from "./pages/About";
import Courses from "./pages/Courses";
import Events from "./pages/Events";
import Store from "./pages/Store";
import Home from "./pages/home/Home";
import Header from "./components/shared/Header";
import Footer from "./components/shared/Footer";
import CookieBanner from "./components/shared/CookieBanner";
import CookiePolicy from "./components/shared/CookiePolicy";
import MembershipInfoPage from './pages/users/MembershipInfoPage';
import UserRegister from './pages/users/UserRegister';
import RegistrationSuccess from './pages/users/RegistrationSuccess';

function App(): JSX.Element {
  const headerRef = useRef<HTMLElement>(null);

  return (
    <Router>
        <Header 
          ref={headerRef} 
          className="fixed top-0 left-0 right-0 z-50"
        />
        <main className="pt-[76px] min-h-[calc(100vh-76px)] relative pb-20">
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
            <Route path="/registration-success" element={<RegistrationSuccess />} />
          </Routes>
        </main>

        <Footer />
        <CookieBanner />
    </Router>
  );
}

export default App;