'use client';

import React, { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import api from '@/components/api/Api';
import { Product } from '@/types/products';
import Image from "next/image";
import { SkeletonProduct } from '../shared/SkeletonLoaders';
import { AnimatedHeading, AnimatedText } from "@/components/animations/AnimatedText";
import { AnimatedButton } from "@/components/animations/AnimatedButton";

const StoreSection: React.FC = () => {
  const [featuredProducts, setFeaturedProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const router = useRouter();

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
      <section className="py-20 px-4 bg-white dark:bg-slate-950">
        <div className="max-w-6xl mx-auto">
          <AnimatedHeading 
            level={2}
            animationType="slideUp"
            delay={100}
            className="text-4xl font-bold text-center text-slate-950 dark:text-white mb-12"
          >
            TIENDA <span className="text-red-600">EN LÍNEA</span>
          </AnimatedHeading>
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
          <AnimatedHeading 
            level={2}
            animationType="slideUp"
            delay={100}
            className="text-4xl font-bold text-center text-slate-950 dark:text-white mb-12"
          >
            TIENDA <span className="text-red-600">EN LÍNEA</span>
          </AnimatedHeading>
          <AnimatedText
            animationType="slideUp"
            delay={200}
            className="text-center py-12 text-red-500"
          >
            <p>Error al cargar los productos: {error}</p>
            <AnimatedButton 
              onClick={() => window.location.reload()}
              animationType="scaleIn"
              delay={100}
              variant="secondary"
              className="mt-4 py-2 px-4"
            >
              Reintentar
            </AnimatedButton>
          </AnimatedText>
        </div>
      </section>
    );
  }

  return (
    <section className="py-20 px-4 bg-white dark:bg-slate-950">
      <div className="max-w-6xl mx-auto">
        <AnimatedHeading 
          level={2}
          animationType="slideUp"
          delay={100}
          className="text-4xl font-bold text-center text-slate-950 dark:text-white mb-12"
        >
          TIENDA <span className="text-red-600">EN LÍNEA</span>
        </AnimatedHeading>

        {featuredProducts.length > 0 ? (
          <>
            <div className="grid md:grid-cols-3 gap-8">
              {featuredProducts.map((product: any, index: number) => (
                <AnimatedText
                  key={product._id}
                  animationType="slideUp"
                  delay={200 + (index * 150)}
                  className="bg-white dark:bg-slate-800 rounded-xl overflow-hidden shadow-lg transition-transform hover:scale-105"
                >
                  <div className="relative" style={{ aspectRatio: '1/1' }}>
                    <Image
                      src={product.featuredImage}
                      alt={product.name}
                      className="w-full h-full object-contain p-4 bg-white dark:bg-gray-200"
                      loading="lazy"
                      layout="fill"
                    />
                  </div>
                  <div className="p-6">
                    <h3 className="text-xl font-bold text-slate-950 dark:text-white mb-2">{product.name}</h3>
                    <p className="text-2xl font-bold text-red-600 mb-4">
                      {/* Use toLocaleString for currency formatting */}
                      ${product.discountPrice ? product.discountPrice.toLocaleString('es-CO') : product.price.toLocaleString('es-CO')}
                    </p>
                    <div className="flex space-x-3">
                      <AnimatedButton 
                        onClick={() => alert(`Comprar ${product.name}`)}
                        animationType="scaleIn"
                        delay={400 + (index * 150)}
                        variant="primary"
                        className="flex-1 py-2 rounded-full"
                      >
                        Comprar
                      </AnimatedButton>
                      <AnimatedButton 
                        onClick={() => router.push(`/products/${product.slug}`)}
                        animationType="scaleIn"
                        delay={450 + (index * 150)}
                        variant="outline"
                        className="flex-1 bg-white border border-slate-950 text-slate-950 dark:bg-slate-700 dark:text-white dark:border-slate-600 dark:hover:bg-slate-600 py-2 rounded-full hover:bg-gray-100"
                      >
                        Detalles
                      </AnimatedButton>
                    </div>
                  </div>
                </AnimatedText>
              ))}
            </div>

            <AnimatedText
              animationType="fadeIn"
              delay={650}
              className="text-center mt-12"
            >
              <AnimatedButton 
                onClick={() => router.push('/products')}
                animationType="scaleIn"
                delay={700}
                variant="secondary"
                className="py-3 px-8 rounded-full text-lg inline-flex items-center"
              >
                Ver todos los productos
                <svg className="w-5 h-5 ml-2" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg" aria-hidden="true">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M14 5l7 7m0 0l-7 7m7-7H3" />
                </svg>
              </AnimatedButton>
            </AnimatedText>
          </>
        ) : (
          <AnimatedText
            animationType="fadeIn"
            delay={200}
            className="text-center py-12"
          >
            <p className="dark:text-gray-300">No hay productos destacados disponibles en este momento.</p>
          </AnimatedText>
        )}
      </div>
    </section>
  );
};

export default StoreSection;



