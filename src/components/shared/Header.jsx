import React from "react";

const Header = ({ showMenu }) => {
  
  return (
    <header className={`transition-all duration-300 ${
      showMenu ? "ml-28" : "ml-0"
    }`}>
      <div className="flex items-center justify-between gap-4 mb-6">
        <div className={`transition-all duration-300 ${
          showMenu ? "opacity-0 w-0" : "opacity-100 w-20"
        }`}>
          <img 
            src="/src/assets/Logo_Letras_Motoclub_BSK_Motorcycle_Team_Blue_192X192.webp" 
            alt="Logo BSK Motorcycle Team" 
            className="w-full h-auto"
          />
        </div>
        
        <div className="ml-auto text-right">
          <h1 className="text-2xl text-gray-300">Jeager Resto</h1>
          <p className="text-gray-500">07 octubre 2022</p>
        </div>
      </div>
    </header>
  );
};

export default Header;