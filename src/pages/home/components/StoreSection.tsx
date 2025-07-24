import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import api from '../../../components/api/Api';
import { Product } from '../types';

const StoreSection: React.FC = () => {
  const [featuredProducts, setFeaturedProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const navigate = useNavigate();

  useEffect(() => {
    /**
     * Fetches featured products from the API.
     * Sets loading, error, and featuredProducts states based on the API response.
     */
    const fetchFeaturedProducts = async (): Promise<void> => {
      try {
        // Use the imported api instance for the request
        const response = await api.get<{ status: string; data: { products: Product[] } }>('/products');
        
        if (response.data.status === 'success' && Array.isArray(response.data.data.products)) {
          // Take only the first 3 products as featured
          setFeaturedProducts(response.data.data.products.slice(0, 3));
        } else {
          throw new Error('Formato de respuesta de productos inesperado.');
        }
      } catch (err: any) { // Using 'any' for catch error type as it can be various types
        console.error('Error fetching featured products:', err);
        // Provide a more user-friendly error message
        setError(err.response?.data?.message || err.message || 'Error al cargar los productos destacados.');
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
          <div className="flex justify-center items-center h-64">
            <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-red-600" role="status" aria-label="Cargando productos"></div>
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
            <button 
              onClick={() => window.location.reload()}
              className="mt-4 bg-red-600 hover:bg-red-700 text-white font-bold py-2 px-4 rounded"
            >
              Reintentar
            </button>
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
              {featuredProducts.map((product: Product) => (
                <div key={product._id} className="bg-gray-50 rounded-xl overflow-hidden shadow-lg transition-transform hover:scale-105">
                  <div className="relative" style={{ aspectRatio: '1/1' }}>
                    <img
                      src={product.featuredImage}
                      alt={product.name}
                      className="w-full h-full object-contain p-4 bg-white"
                      loading="lazy" // Add lazy loading for images
                    />
                  </div>
                  <div className="p-6">
                    <h3 className="text-xl font-bold text-slate-950 mb-2">{product.name}</h3>
                    <p className="text-2xl font-bold text-red-600 mb-4">
                      {/* Use toLocaleString for currency formatting */}
                      ${product.discountPrice ? product.discountPrice.toLocaleString('es-CO') : product.price.toLocaleString('es-CO')}
                    </p>
                    <div className="flex space-x-3">
                      <button 
                        className="flex-1 bg-slate-950 hover:bg-green-400 text-white py-2 rounded-full transition duration-300"
                        // In a real app, this would add to cart or link to a purchase page
                        onClick={() => alert(`Comprar ${product.name}`)}
                      >
                        Comprar
                      </button>
                      <button 
                        onClick={() => navigate(`/products/${product.slug}`)} // Assuming a product detail route like /products/:slug
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
                onClick={() => navigate('/products')} // Assuming /products is the main store page
                className="bg-red-600 hover:bg-red-700 text-white font-bold py-3 px-8 rounded-full text-lg transition duration-300 inline-flex items-center"
              >
                Ver todos los productos
                <svg className="w-5 h-5 ml-2" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg" aria-hidden="true">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M14 5l7 7m0 0l-7 7m7-7H3" />
                </svg>
              </button>
            </div>
          </>
        ) : (
          <div className="text-center py-12">
            <p>No hay productos destacados disponibles en este momento.</p>
          </div>
        )}
      </div>
    </section>
  );
};

export default StoreSection;