'use client';

import { useState, useEffect, type FC } from "react";
import { useRouter } from "next/navigation";
import { Product } from '@/types/products';
import Image from "next/image";
import { SkeletonProduct } from '../shared/SkeletonLoaders';
const StoreSection: FC = () => {
  const [featuredProducts, setFeaturedProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const router = useRouter();

  useEffect(() => {
    /**
     * Simulates fetching featured products (external API removed).
     * Sets loading, error, and featuredProducts states.
     */
    const fetchFeaturedProducts = async (): Promise<void> => {
      try {
        // Simulate loading time
        await new Promise(resolve => setTimeout(resolve, 1000));
        // Set empty products array since external API is removed
        setFeaturedProducts([]);
      } catch (err: any) { // eslint-disable-line @typescript-eslint/no-explicit-any
        console.error('Error fetching featured products:', err);
        // Provide a more user-friendly error message
        setError(err.response?.data?.message || err.message || 'Error al cargar los productos destacados.');
      } finally {
        setLoading(false);
      }
    };

    void fetchFeaturedProducts();
  }, []);

  if (loading) {
    return (
      <section className="py-20 px-4 bg-white dark:bg-slate-950">
        <div className="max-w-6xl mx-auto">
          <h2 className="text-4xl font-bold text-center text-slate-950 dark:text-white mb-12">
            TIENDA <span className="text-red-600 dark:text-red-400">EN LÍNEA</span>
          </h2>
          <div className="grid md:grid-cols-3 gap-8">
            {Array.from({ length: 3 }).map((_, index) => (
              <SkeletonProduct key={index} />
            ))}
          </div>
        </div>
      </section>
    );
  }

  if (error) {
    return (
      <section className="py-20 px-4 bg-white dark:bg-slate-950">
        <div className="max-w-6xl mx-auto">
          <h2 className="text-4xl font-bold text-center text-slate-950 dark:text-white mb-12">
            TIENDA <span className="text-red-600 dark:text-red-400">EN LÍNEA</span>
          </h2>
          <div className="text-center py-12 text-red-500 dark:text-red-400">
            <p>Error al cargar los productos: {error}</p>
            <button 
              onClick={() => window.location.reload()}
              className="mt-4 py-2 px-4 bg-white dark:bg-slate-800 text-slate-950 dark:text-white border border-slate-300 dark:border-slate-700 rounded-lg"
            >
              Reintentar
            </button>
          </div>
        </div>
      </section>
    );
  }

  return (
    <section className="py-20 px-4 bg-white dark:bg-slate-950">
      <div className="max-w-6xl mx-auto">
        <h2 className="text-4xl font-bold text-center text-slate-950 dark:text-white mb-12">
          TIENDA <span className="text-red-600 dark:text-red-400">EN LÍNEA</span>
        </h2>

        {featuredProducts.length > 0 ? (
          <>
            <div className="grid md:grid-cols-3 gap-8">
              {featuredProducts.map((product: any) => ( // eslint-disable-line @typescript-eslint/no-explicit-any
                <div className="bg-white dark:bg-slate-800 rounded-xl overflow-hidden shadow-lg hover:scale-105" key={product.id || product.name}>
                  <div className="relative" style={{ aspectRatio: '1/1' }}>
                    <Image
                      src={product.featuredImage}
                      alt={`${product.name}${product.description ? ` - ${product.description}` : ''} - Producto oficial BSK Motorcycle Team`}
                      className="w-full h-full object-contain p-4 bg-white dark:bg-slate-900"
                      loading="lazy"
                      layout="fill"
                    />
                    {/* ✅ SEO OPTIMIZATION: Enhanced alt text for products
                        - Includes product name, description, and brand association
                        - Better for image SEO and Google Shopping
                        - Keywords naturally integrated (BSK Motorcycle Team)
                    */}
                  </div>
                  <div className="p-6">
                    <h3 className="text-xl font-bold text-slate-950 dark:text-white mb-2">{product.name}</h3>
                    <p className="text-2xl font-bold text-red-600 dark:text-red-400 mb-4">
                      {/* Use toLocaleString for currency formatting */}
                      ${product.discountPrice ? product.discountPrice.toLocaleString('es-CO') : product.price.toLocaleString('es-CO')}
                    </p>
                    <div className="flex space-x-3">
                      <button 
                        onClick={() => alert(`Comprar ${product.name}`)}
                        className="flex-1 py-2 rounded-full bg-green-500 dark:bg-green-600 text-white hover:bg-green-600 dark:hover:bg-green-700"
                      >
                        Comprar
                      </button>
                      <button 
                        onClick={() => router.push(`/products/${product.slug}`)}
                        className="flex-1 bg-white border border-slate-950 text-slate-950 dark:bg-slate-700 dark:text-white dark:border-slate-600 py-2 rounded-full hover:bg-gray-100 dark:hover:bg-slate-600"
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
                onClick={() => router.push('/products')}
                className="py-3 px-8 rounded-full text-lg inline-flex items-center bg-blue-500 dark:bg-blue-600 text-white hover:bg-blue-600 dark:hover:bg-blue-700"
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
            <p className="dark:text-gray-300">Tienda temporalmente deshabilitada. La API externa ha sido removida.</p>
          </div>
        )}
      </div>
    </section>
  );
};

export default StoreSection;



