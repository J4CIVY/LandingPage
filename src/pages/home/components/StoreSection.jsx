import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";

const StoreSection = () => {
  const [featuredProducts, setFeaturedProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const navigate = useNavigate();

  useEffect(() => {
    const fetchFeaturedProducts = async () => {
      try {
        const response = await fetch('https://api.bskmt.com/products');
        if (!response.ok) {
          throw new Error('Error al cargar los productos destacados');
        }
        const data = await response.json();
        setFeaturedProducts(data.data.products);
      } catch (error) {
        console.error('Error fetching featured products:', error);
        setError(error.message);
      } finally {
        setLoading(false);
      }
    };

    fetchFeaturedProducts();
  }, []);

  if (loading) {
    return (
      <section className="py-20 px-4 bg-white">
        <div className="max-w-6xl mx-auto">
          <h2 className="text-4xl font-bold text-center text-slate-950 mb-12">
            TIENDA <span className="text-red-600">EN LÍNEA</span>
          </h2>
          <div className="text-center py-12">
            <p>Cargando productos...</p>
          </div>
        </div>
      </section>
    );
  }

  if (error) {
    return (
      <section className="py-20 px-4 bg-white">
        <div className="max-w-6xl mx-auto">
          <h2 className="text-4xl font-bold text-center text-slate-950 mb-12">
            TIENDA <span className="text-red-600">EN LÍNEA</span>
          </h2>
          <div className="text-center py-12 text-red-500">
            <p>Error al cargar los productos: {error}</p>
          </div>
        </div>
      </section>
    );
  }

  return (
    <section className="py-20 px-4 bg-white">
      <div className="max-w-6xl mx-auto">
        <h2 className="text-4xl font-bold text-center text-slate-950 mb-12">
          TIENDA <span className="text-red-600">EN LÍNEA</span>
        </h2>

        {featuredProducts.length > 0 ? (
          <>
            <div className="grid md:grid-cols-3 gap-8">
              {featuredProducts.map(product => (
                <div key={product._id} className="bg-gray-50 rounded-xl overflow-hidden shadow-lg transition-transform hover:scale-105">
                  <div className="relative" style={{ aspectRatio: '1/1' }}>
                    <img
                      src={product.featuredImage}
                      alt={product.name}
                      className="w-full h-full object-contain p-4 bg-white"
                    />
                  </div>
                  <div className="p-6">
                    <h3 className="text-xl font-bold text-slate-950 mb-2">{product.name}</h3>
                    <p className="text-2xl font-bold text-red-600 mb-4">
                      ${product.discountPrice ? Math.round(product.discountPrice) : Math.round(product.price)}
                    </p>
                    <div className="flex space-x-3">
                      <button className="flex-1 bg-slate-950 hover:bg-green-400 text-white py-2 rounded-full transition duration-300">
                        Comprar
                      </button>
                      <button 
                        onClick={() => navigate(`/${product.slug}`)}
                        className="flex-1 bg-white border border-slate-950 text-slate-950 py-2 rounded-full hover:bg-gray-100 transition duration-300"
                      >
                        Detalles
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>

            <div className="text-center mt-12">
              <button 
                onClick={() => navigate('/tienda')}
                className="bg-red-600 hover:bg-red-700 text-white font-bold py-3 px-8 rounded-full text-lg transition duration-300 inline-flex items-center"
              >
                Ver todos los productos
                <svg className="w-5 h-5 ml-2" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M14 5l7 7m0 0l-7 7m7-7H3" />
                </svg>
              </button>
            </div>
          </>
        ) : (
          <div className="text-center py-12">
            <p>No hay productos destacados disponibles</p>
          </div>
        )}
      </div>
    </section>
  );
};

export default StoreSection;