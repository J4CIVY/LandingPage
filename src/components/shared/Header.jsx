import React from "react";
import { RiSearch2Line } from "react-icons/ri";

const Header = ({ showMenu }) => {
  return (
    <header className={showMenu ? "lg:ml-28" : "lg:ml-0"}>
      <div className="flex items-center justify-between gap-4 mb-6">
        <div className={`transition-all duration-300 ${showMenu ? "opacity-0 w-0" : "opacity-100 w-20"}`}>
          <img 
            src="/Logo_Motoclub_BSK_Motorcycle_Team_SVG_500X500_Blue.svg" 
            alt="Logo BSK" 
            className="w-full h-auto"
          />
        </div>

         <div className="ml-auto text-right">  {/* ml-auto empuja este bloque a la derecha */}
          <h1 className="text-2xl text-gray-300">Jeager Resto</h1>
          <p className="text-gray-500">07 octubre 2022</p>
        </div>

      </div>

    </header>
  );
};

export default Header;