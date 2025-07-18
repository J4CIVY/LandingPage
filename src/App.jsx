import { useRef } from 'react';
import './index.css';
import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import { CartProvider } from './context/CartContext';
import Memberships from "./pages/Memberships";
import Documents from "./pages/Documents";
import Contact from "./pages/Contact";
import Sos from "./pages/Sos";
import Weather from "./pages/Weather";
import About from "./pages/About";
import Courses from "./pages/Courses";
import Events from "./pages/Events";
import Home from "./pages/home/Home";
import Header from "./components/shared/Header";
import Footer from "./components/shared/Footer";
import CookieBanner from "./components/shared/CookieBanner";
import CookiePolicy from "./components/shared/CookiePolicy";
import ProductListPage from './pages/ProductList';
import ProductDetailPage from './pages/ProductDetail';
import CartPage from './pages/Cart';
import CheckoutPage from './pages/Checkout';
import PaymentConfirmation from './pages/PaymentConfirmation';
import MembershipInfoPage from './pages/users/MembershipInfoPage';
import UserRegister from './pages/users/UserRegister';
import RegistrationSuccess from './pages/users/RegistrationSuccess';

function App() {
  const headerRef = useRef();

  return (
    <Router>
        <CartProvider>
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
                <Route path="/memberships" element={<Memberships />} />
                <Route path="/cookie-policy" element={<CookiePolicy />} />
                <Route path="/products" element={<ProductListPage />} />
                <Route path="/products/:id" element={<ProductDetailPage />} />
                <Route path="/cart" element={<CartPage />} />
                <Route path="/checkout" element={<CheckoutPage />} />
                <Route path="/payment-confirmation" element={<PaymentConfirmation />} />
                <Route path="/membership-info" element={<MembershipInfoPage />} />
                <Route path="/register" element={<UserRegister />} />
                <Route path="/registration-success" element={<RegistrationSuccess />} />
              </Routes>
            </main>

            <Footer />
            <CookieBanner />
          </div>
        </CartProvider>
    </Router>
  );
}

export default App;