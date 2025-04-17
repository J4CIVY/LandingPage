import { useState } from "react";
import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import Sos from "./pages/Sos";
import Weather from "./pages/Weather";
import About from "./pages/About";
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

        {showMenu && (
          <div 
            className="fixed inset-0 bg-[#000031] bg-opacity-50 z-40 lg:hidden"
            onClick={() => setShowMenu(false)}
          />
        )}
        
        {/* Contenido principal con el mismo desplazamiento que MobileMenu */}
        <main className={`transition-all duration-300 pb-20 ${
          showMenu ? "lg:ml-36" : "lg:ml-10"
        }`}>
          <Routes>
            <Route path="/" element={<Home showMenu={showMenu} />} />
            <Route path="/events" element={<Events showMenu={showMenu} />} />
            <Route path="/about" element={<About showMenu={showMenu} />} />
            <Route path="/weather" element={<Weather />} />
            <Route path="/sos" element={<Sos />} />
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