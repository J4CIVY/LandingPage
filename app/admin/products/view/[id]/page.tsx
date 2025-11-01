'use client';

import { useAuth } from '@/hooks/useAuth';
import { useState, useEffect } from 'react';
import { useRouter, useParams } from 'next/navigation';
import AdminLayout from '@/components/admin/AdminLayout';
import Image from 'next/image';
import { 
  FaSpinner, 
  FaEdit,
  FaArrowLeft,
  FaToggleOn,
  FaToggleOff,
  FaDollarSign,
  FaBox,
  FaWeight,
  FaRuler,
  FaTags,
  FaCalendarAlt,
  FaCheckCircle,
  FaTimesCircle,
  FaExclamationTriangle,
  FaCopy,
  FaExternalLinkAlt
} from 'react-icons/fa';

interface Product {
  _id: string;
  name: string;
  shortDescription: string;
  longDescription: string;
  finalPrice: number;
  originalPrice?: number;
  availability: 'in-stock' | 'out-of-stock';
  featuredImage: string;
  gallery: string[];
  newProduct: boolean;
  category: string;
  sku: string;
  stockQuantity?: number;
  minStockAlert?: number;
  weight?: number;
  dimensions?: {
    length?: number;
    width?: number;
    height?: number;
  };
  technicalSpecifications: { [key: string]: string };
  features: string[];
  tags: string[];
  createdAt: string;
  updatedAt: string;
}

const categoryColors: { [key: string]: string } = {
  cascos: 'bg-red-100 text-red-800',
  chaquetas: 'bg-blue-100 text-blue-800',
  guantes: 'bg-green-100 text-green-800',
  botas: 'bg-yellow-100 text-yellow-800',
  pantalones: 'bg-purple-100 text-purple-800',
  accesorios: 'bg-pink-100 text-pink-800',
  repuestos: 'bg-orange-100 text-orange-800',
  herramientas: 'bg-gray-100 text-gray-800',
  merchandising: 'bg-indigo-100 text-indigo-800'
};

const categoryLabels: { [key: string]: string } = {
  cascos: 'Cascos',
  chaquetas: 'Chaquetas',
  guantes: 'Guantes',
  botas: 'Botas',
  pantalones: 'Pantalones',
  accesorios: 'Accesorios',
  repuestos: 'Repuestos',
  herramientas: 'Herramientas',
  merchandising: 'Merchandising'
};

export default function ProductViewPage() {
  const { user, isLoading, isAuthenticated } = useAuth();
  const router = useRouter();
  const params = useParams();
  const productId = params?.id as string;

  const [product, setProduct] = useState<Product | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [toggling, setToggling] = useState(false);
  const [selectedImage, setSelectedImage] = useState<string>('');

  // Verificar autenticación y permisos
  useEffect(() => {
    if (!isLoading && !isAuthenticated) {
      router.push('/login');
      return;
    }

    if (user && user.role !== 'admin' && user.role !== 'super-admin') {
      router.push('/dashboard');
      return;
    }
  }, [user, isAuthenticated, isLoading, router]);

  // Cargar datos del producto
  useEffect(() => {
    const loadProduct = async () => {
      if (!productId) {
        setError('ID de producto no válido');
        setLoading(false);
        return;
      }

      try {
        setLoading(true);
        const response = await fetch(`/api/admin/products/${productId}`);
        
        if (response.ok) {
          const data = await response.json();
          setProduct(data.product);
          setSelectedImage(data.product.featuredImage);
        } else {
          const errorData = await response.json();
          setError(errorData.error || 'Error al cargar producto');
        }
      } catch (error) {
        console.error('Error cargando producto:', error);
        setError(error instanceof Error ? error.message : 'Error desconocido');
      } finally {
        setLoading(false);
      }
    };

    if (user && (user.role === 'admin' || user.role === 'super-admin') && productId) {
      loadProduct();
    }
  }, [productId, user]);

  const handleToggleStatus = async () => {
    if (!product) return;

    try {
      setToggling(true);
      const response = await fetch(`/api/admin/products/${product._id}/toggle-status`, {
        method: 'PATCH'
      });

      if (response.ok) {
        const data = await response.json();
        setProduct(prev => prev ? { ...prev, availability: data.product.availability } : null);
      } else {
        throw new Error('Error al cambiar estado');
      }
    } catch (error) {
      console.error('Error cambiando estado:', error);
      alert('Error al cambiar el estado del producto');
    } finally {
      setToggling(false);
    }
  };

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text);
    // Aquí podrías agregar una notificación
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('es-MX', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const formatPrice = (price: number) => {
    return new Intl.NumberFormat('es-MX', {
      style: 'currency',
      currency: 'MXN'
    }).format(price);
  };

  const getStockStatus = () => {
    if (!product?.stockQuantity) return { color: 'text-gray-500', icon: FaTimesCircle, text: 'Sin seguimiento' };
    
    if (product.stockQuantity === 0) {
      return { color: 'text-red-600', icon: FaTimesCircle, text: 'Sin stock' };
    }
    
    if (product.minStockAlert && product.stockQuantity <= product.minStockAlert) {
      return { color: 'text-yellow-600', icon: FaExclamationTriangle, text: 'Stock bajo' };
    }
    
    return { color: 'text-green-600', icon: FaCheckCircle, text: 'Stock disponible' };
  };

  if (isLoading || loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <FaSpinner className="animate-spin text-4xl text-blue-600 mx-auto mb-4" />
          <p className="text-gray-600">Cargando producto...</p>
        </div>
      </div>
    );
  }

  if (error || !product) {
    return (
      <AdminLayout title="Error" description="No se pudo cargar el producto">
        <div className="text-center py-12">
          <FaTimesCircle className="text-4xl text-red-500 mx-auto mb-4" />
          <h2 className="text-xl font-semibold text-gray-900 mb-2">
            Error al cargar producto
          </h2>
          <p className="text-gray-600 mb-4">{error || 'Producto no encontrado'}</p>
          <button
            onClick={() => router.push('/admin/products')}
            className="inline-flex items-center px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
          >
            <FaArrowLeft className="mr-2" />
            Volver a productos
          </button>
        </div>
      </AdminLayout>
    );
  }

  const stockStatus = getStockStatus();
  const StockIcon = stockStatus.icon;
  const discountPercentage = product.originalPrice && product.originalPrice > product.finalPrice
    ? Math.round(((product.originalPrice - product.finalPrice) / product.originalPrice) * 100)
    : 0;

  return (
    <AdminLayout 
      title={product.name} 
      description="Detalles del producto"
    >
      <div className="max-w-6xl mx-auto">
        {/* Header */}
        <div className="mb-6">
          <button
            onClick={() => router.push('/admin/products')}
            className="inline-flex items-center text-sm text-gray-500 hover:text-gray-700 mb-4"
          >
            <FaArrowLeft className="mr-2" />
            Volver a productos
          </button>

          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between">
            <div className="flex items-center space-x-3 mb-4 sm:mb-0">
              <h1 className="text-2xl font-bold text-gray-900">{product.name}</h1>
              {product.newProduct && (
                <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800">
                  Nuevo
                </span>
              )}
              <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                categoryColors[product.category] || 'bg-gray-100 text-gray-800'
              }`}>
                {categoryLabels[product.category] || product.category}
              </span>
            </div>

            <div className="flex items-center space-x-3">
              <button
                onClick={handleToggleStatus}
                disabled={toggling}
                className={`inline-flex items-center px-3 py-2 rounded-lg text-sm font-medium transition-colors ${
                  product.availability === 'in-stock'
                    ? 'bg-green-100 text-green-800 hover:bg-green-200'
                    : 'bg-red-100 text-red-800 hover:bg-red-200'
                }`}
              >
                {toggling ? (
                  <FaSpinner className="animate-spin mr-2" />
                ) : product.availability === 'in-stock' ? (
                  <FaToggleOn className="mr-2" />
                ) : (
                  <FaToggleOff className="mr-2" />
                )}
                {product.availability === 'in-stock' ? 'Disponible' : 'No disponible'}
              </button>

              <button
                onClick={() => router.push(`/admin/products/edit/${product._id}`)}
                className="inline-flex items-center px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
              >
                <FaEdit className="mr-2" />
                Editar
              </button>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Columna Izquierda - Imágenes */}
          <div className="lg:col-span-1">
            <div className="bg-white rounded-lg shadow overflow-hidden">
              {/* Imagen Principal */}
              <div className="aspect-square bg-gray-100 flex items-center justify-center">
                <Image
                  src={selectedImage}
                  alt={product.name}
                  width={400}
                  height={400}
                  className="w-full h-full object-cover"
                  onError={() => setSelectedImage('/placeholder-product.jpg')}
                />
              </div>

              {/* Galería */}
              {product.gallery.length > 0 && (
                <div className="p-4">
                  <h4 className="text-sm font-medium text-gray-900 mb-3">Galería</h4>
                  <div className="grid grid-cols-4 gap-2">
                    <button
                      onClick={() => setSelectedImage(product.featuredImage)}
                      className={`aspect-square border-2 rounded overflow-hidden ${
                        selectedImage === product.featuredImage ? 'border-blue-500' : 'border-gray-200'
                      }`}
                    >
                      <Image
                        src={product.featuredImage}
                        alt="Principal"
                        width={80}
                        height={80}
                        className="w-full h-full object-cover"
                      />
                    </button>
                    {product.gallery.map((image, index) => (
                      <button
                        key={index}
                        onClick={() => setSelectedImage(image)}
                        className={`aspect-square border-2 rounded overflow-hidden ${
                          selectedImage === image ? 'border-blue-500' : 'border-gray-200'
                        }`}
                      >
                        <Image
                          src={image}
                          alt={`Galería ${index + 1}`}
                          width={80}
                          height={80}
                          className="w-full h-full object-cover"
                        />
                      </button>
                    ))}
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* Columna Derecha - Información */}
          <div className="lg:col-span-2 space-y-6">
            {/* Información Básica */}
            <div className="bg-white rounded-lg shadow p-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">Información Básica</h3>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">SKU</label>
                  <div className="flex items-center space-x-2">
                    <code className="px-2 py-1 bg-gray-100 rounded text-sm font-mono">
                      {product.sku || 'No asignado'}
                    </code>
                    {product.sku && (
                      <button
                        onClick={() => copyToClipboard(product.sku)}
                        className="text-gray-400 hover:text-gray-600"
                        title="Copiar SKU"
                      >
                        <FaCopy />
                      </button>
                    )}
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Estado del Stock</label>
                  <div className={`flex items-center ${stockStatus.color}`}>
                    <StockIcon className="mr-2" />
                    <span className="font-medium">{stockStatus.text}</span>
                  </div>
                </div>

                <div className="md:col-span-2">
                  <label className="block text-sm font-medium text-gray-700 mb-1">Descripción Corta</label>
                  <p className="text-gray-900">{product.shortDescription}</p>
                </div>

                <div className="md:col-span-2">
                  <label className="block text-sm font-medium text-gray-700 mb-1">Descripción Detallada</label>
                  <div className="prose prose-sm max-w-none">
                    <p className="text-gray-700 whitespace-pre-wrap">{product.longDescription}</p>
                  </div>
                </div>
              </div>
            </div>

            {/* Precios e Inventario */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {/* Precios */}
              <div className="bg-white rounded-lg shadow p-6">
                <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
                  <FaDollarSign className="mr-2 text-green-500" />
                  Precios
                </h3>
                
                <div className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Precio Final</label>
                    <p className="text-2xl font-bold text-green-600">{formatPrice(product.finalPrice)}</p>
                  </div>

                  {product.originalPrice && product.originalPrice > product.finalPrice && (
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">Precio Original</label>
                      <div className="flex items-center space-x-3">
                        <p className="text-lg text-gray-500 line-through">{formatPrice(product.originalPrice)}</p>
                        <span className="px-2 py-1 bg-red-100 text-red-800 rounded text-sm font-medium">
                          -{discountPercentage}%
                        </span>
                      </div>
                      <p className="text-sm text-green-600 mt-1">
                        Ahorro: {formatPrice(product.originalPrice - product.finalPrice)}
                      </p>
                    </div>
                  )}
                </div>
              </div>

              {/* Inventario */}
              <div className="bg-white rounded-lg shadow p-6">
                <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
                  <FaBox className="mr-2 text-blue-500" />
                  Inventario
                </h3>
                
                <div className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Stock Actual</label>
                    <p className="text-xl font-semibold text-gray-900">
                      {product.stockQuantity !== undefined ? product.stockQuantity : 'Sin seguimiento'}
                    </p>
                  </div>

                  {product.minStockAlert && (
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">Alerta de Stock Mínimo</label>
                      <p className="text-gray-900">{product.minStockAlert} unidades</p>
                    </div>
                  )}

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Disponibilidad</label>
                    <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                      product.availability === 'in-stock' 
                        ? 'bg-green-100 text-green-800' 
                        : 'bg-red-100 text-red-800'
                    }`}>
                      {product.availability === 'in-stock' ? 'En Stock' : 'Sin Stock'}
                    </span>
                  </div>
                </div>
              </div>
            </div>

            {/* Especificaciones Físicas */}
            {(product.weight || product.dimensions?.length || product.dimensions?.width || product.dimensions?.height) && (
              <div className="bg-white rounded-lg shadow p-6">
                <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
                  <FaRuler className="mr-2 text-orange-500" />
                  Especificaciones Físicas
                </h3>
                
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                  {product.weight && (
                    <div>
                      <label className="flex items-center text-sm font-medium text-gray-700 mb-1">
                        <FaWeight className="mr-1" />
                        Peso
                      </label>
                      <p className="text-gray-900">{product.weight} kg</p>
                    </div>
                  )}

                  {product.dimensions?.length && (
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">Largo</label>
                      <p className="text-gray-900">{product.dimensions.length} cm</p>
                    </div>
                  )}

                  {product.dimensions?.width && (
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">Ancho</label>
                      <p className="text-gray-900">{product.dimensions.width} cm</p>
                    </div>
                  )}

                  {product.dimensions?.height && (
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">Alto</label>
                      <p className="text-gray-900">{product.dimensions.height} cm</p>
                    </div>
                  )}
                </div>
              </div>
            )}

            {/* Especificaciones Técnicas */}
            {Object.keys(product.technicalSpecifications).length > 0 && (
              <div className="bg-white rounded-lg shadow p-6">
                <h3 className="text-lg font-semibold text-gray-900 mb-4">Especificaciones Técnicas</h3>
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {Object.entries(product.technicalSpecifications).map(([key, value]) => (
                    <div key={key} className="border-b border-gray-200 pb-2">
                      <dt className="text-sm font-medium text-gray-700">{key}</dt>
                      <dd className="text-sm text-gray-900 mt-1">{value}</dd>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Características y Tags */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {/* Características */}
              {product.features.length > 0 && (
                <div className="bg-white rounded-lg shadow p-6">
                  <h3 className="text-lg font-semibold text-gray-900 mb-4">Características</h3>
                  
                  <ul className="space-y-2">
                    {product.features.map((feature, index) => (
                      <li key={index} className="flex items-start">
                        <FaCheckCircle className="text-green-500 mt-0.5 mr-2 shrink-0" />
                        <span className="text-gray-700">{feature}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              )}

              {/* Tags */}
              {product.tags.length > 0 && (
                <div className="bg-white rounded-lg shadow p-6">
                  <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
                    <FaTags className="mr-2 text-indigo-500" />
                    Etiquetas
                  </h3>
                  
                  <div className="flex flex-wrap gap-2">
                    {product.tags.map((tag, index) => (
                      <span
                        key={index}
                        className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-gray-100 text-gray-800"
                      >
                        #{tag}
                      </span>
                    ))}
                  </div>
                </div>
              )}
            </div>

            {/* Metadatos */}
            <div className="bg-white rounded-lg shadow p-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
                <FaCalendarAlt className="mr-2 text-gray-500" />
                Información del Sistema
              </h3>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Fecha de Creación</label>
                  <p className="text-gray-900">{formatDate(product.createdAt)}</p>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Última Actualización</label>
                  <p className="text-gray-900">{formatDate(product.updatedAt)}</p>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">ID del Producto</label>
                  <div className="flex items-center space-x-2">
                    <code className="px-2 py-1 bg-gray-100 rounded text-sm font-mono">
                      {product._id}
                    </code>
                    <button
                      onClick={() => copyToClipboard(product._id)}
                      className="text-gray-400 hover:text-gray-600"
                      title="Copiar ID"
                    >
                      <FaCopy />
                    </button>
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Ver en Tienda</label>
                  <button
                    onClick={() => window.open(`/store/products/${product._id}`, '_blank')}
                    className="inline-flex items-center text-blue-600 hover:text-blue-800"
                  >
                    <FaExternalLinkAlt className="mr-1" />
                    Abrir en nueva pestaña
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </AdminLayout>
  );
}
