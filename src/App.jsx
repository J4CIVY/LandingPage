import { useState } from "react";
import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import Events from "./pages/Events";
import Home from "./pages/Home";
import Sidebar from "./components/shared/Sidebar";
import Car from "./components/shared/Car";
import MobileMenu from "./components/shared/MobileMenu";

function App() {
  const [showMenu, setShowMenu] = useState(false);
  const [showOrder, setShowOrder] = useState(false);

  const toggleMenu = () => {
    setShowMenu(!showMenu);
    setShowOrder(false);
  };

  const toggleOrders = () => {
    setShowOrder(!showOrder);
    setShowMenu(false);
  };

  return (
    <Router>
      <div className="bg-[#ffffff] w-full min-h-screen">
        <Sidebar showMenu={showMenu} />
        <Car showOrder={showOrder} setShowOrder={setShowOrder} />
        
        {/* Envolvemos las rutas con un div que manejará el desplazamiento */}
        <div className={`transition-all duration-300 ${showMenu ? "lg:ml-28" : "lg:ml-0"}`}>
          <main className="min-h-screen">
            <div className="md:p-4 p-4">
              <Routes>
                <Route path="/" element={<Home showMenu={showMenu} />} />
                <Route path="/events" element={<Events showMenu={showMenu} />} />
              </Routes>
            </div>
          </main>
        </div>
        
        <MobileMenu
          showMenu={showMenu}
          toggleMenu={toggleMenu}
          toggleOrders={toggleOrders}
        />
      </div>
    </Router>
  );
}

export default App;