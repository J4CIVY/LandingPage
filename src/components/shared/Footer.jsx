const Footer = () => {
    return (
      <footer className={`transition-all duration-300 ${
        showMenu ? "ml-28" : "ml-0"
      }`}>
        <div className="max-w-6xl mx-auto">
          {/* Sección de apoyos */}
          <div className="flex flex-col items-center space-y-8 mb-8">
            {/* Apoyo de INNPULSA */}
            <div className="text-center">
              <p className="text-sm text-gray-400 mb-4">CON EL APOYO DE</p>
              <div className="flex justify-center">
                <img 
                  src="/logos/innpulsa-colombia.png" 
                  alt="INNPULSA Colombia" 
                  className="h-16 object-contain opacity-90 hover:opacity-100 transition-opacity"
                />
              </div>
            </div>
            
            {/* Vigilado por */}
            <div className="text-center">
              <p className="text-sm text-gray-400 mb-4">VIGILADO POR</p>
              <div className="flex flex-wrap justify-center items-center gap-8">
                <img 
                  src="/logos/super-sociedades.png" 
                  alt="Superintendencia de Sociedades" 
                  className="h-12 object-contain opacity-80 hover:opacity-100 transition-opacity"
                />
                <img 
                  src="/logos/super-industria.png" 
                  alt="Superintendencia de Industria y Comercio" 
                  className="h-12 object-contain opacity-80 hover:opacity-100 transition-opacity"
                />
              </div>
            </div>
          </div>
          
          {/* Información legal */}
          <div className="border-t border-gray-700 pt-6 text-center">
            <p className="text-xs text-gray-500">
              © {new Date().getFullYear()} BSK Motorcycle Team. Todos los derechos reservados.
            </p>
            <p className="text-xs text-gray-500 mt-2">
              NIT: 901.444.877-6 | Dirección: Carrera 5 A No. 36 A Sur 28, 110431, Ayacucho, San Cristobal, Bogota, Bogota D.C., Colombia
            </p>
          </div>
        </div>
      </footer>
    );
  };
  
  export default Footer;