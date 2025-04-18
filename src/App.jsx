import { useState } from "react";
import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import Documents from "./pages/Documents";
import Contact from "./pages/Contact";
import Sos from "./pages/Sos";
import Weather from "./pages/Weather";
import About from "./pages/About";
import Courses from "./pages/Courses";
import Events from "./pages/Events";
import Home from "./pages/Home";
import Sidebar from "./components/shared/Sidebar";
import MobileMenu from "./components/shared/MobileMenu";


function App() {
  const [showMenu, setShowMenu] = useState(false);

  return (
    <Router>
      <div className="bg-[#ffffff] min-h-screen">
        <Sidebar showMenu={showMenu} />
        
        {/* Contenido principal con el mismo desplazamiento que MobileMenu */}
        <main className={`transition-all duration-300 pb-20 ${
          showMenu ? "lg:ml-28" : "lg:ml-0"
        }`}>
          <Routes>
            <Route path="/" element={<Home showMenu={showMenu} />} />
            <Route path="/events" element={<Events showMenu={showMenu} />} />
            <Route path="/courses" element={<Courses showMenu={showMenu} />} />
            <Route path="/about" element={<About showMenu={showMenu} />} />
            <Route path="/weather" element={<Weather showMenu={showMenu} />} />
            <Route path="/sos" element={<Sos showMenu={showMenu} />} />
            <Route path="/contact" element={<Contact showMenu={showMenu} />} />
            <Route path="/documents" element={<Documents showMenu={showMenu} />} />
            </Routes>
        </main>
        
        <MobileMenu
          showMenu={showMenu}
          toggleMenu={() => setShowMenu(!showMenu)}
        />
      </div>
    </Router>
  );
}

export default App;