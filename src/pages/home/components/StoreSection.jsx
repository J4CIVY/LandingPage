import React from "react";

const StoreSection = () => {
  const featuredProducts = [
    { id: 1, name: 'Camiseta BSK', price: 50000, image: '/Camiseta BSK.webp' },
    { id: 2, name: 'Hoodie BSK', price: 95000, image: '/Hoodie BSK.webp' },
    { id: 3, name: 'Gorra BSK', price: 45000, image: '/Gorra BSK.webp' }
  ];

  return (
    <section className="py-20 px-4 bg-white">
      <div className="max-w-6xl mx-auto">
        <h2 className="text-4xl font-bold text-center text-[#000031] mb-12">
          TIENDA <span className="text-[#FF0000]">EN LÍNEA</span>
        </h2>

        <div className="grid md:grid-cols-3 gap-8">
          {featuredProducts.map(product => (
            <div key={product.id} className="bg-gray-50 rounded-xl overflow-hidden shadow-lg transition-transform hover:scale-105">
              <div className="relative" style={{ aspectRatio: '1/1' }}>
                <img
                  src={product.image}
                  alt={product.name}
                  className="w-full h-full object-contain p-4 bg-white"
                />
              </div>
              <div className="p-6">
                <h3 className="text-xl font-bold text-[#000031] mb-2">{product.name}</h3>
                <p className="text-2xl font-bold text-[#FF0000] mb-4">${product.price.toFixed(2)}</p>
                <div className="flex space-x-3">
                  <button className="flex-1 bg-[#000031] hover:bg-[#00FF99] text-white py-2 rounded-full transition duration-300">
                    Comprar
                  </button>
                  <button className="flex-1 bg-white border border-[#000031] text-[#000031] py-2 rounded-full hover:bg-gray-100 transition duration-300">
                    Detalles
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>

        <div className="text-center mt-12">
          <button className="bg-[#FF0000] hover:bg-red-700 text-white font-bold py-3 px-8 rounded-full text-lg transition duration-300 inline-flex items-center">
            Ver todos los productos
            <svg className="w-5 h-5 ml-2" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M14 5l7 7m0 0l-7 7m7-7H3" />
            </svg>
          </button>
        </div>
      </div>
    </section>
  );
};

export default StoreSection;