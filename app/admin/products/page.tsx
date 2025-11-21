'use client';


import { useState, useEffect } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { 
  FaSpinner, 
  FaBoxes, 
  FaSearch,
  FaEdit,
  FaTrash,
  FaEye,
  FaArrowLeft,
  FaPlus,
  FaTag,
  FaDollarSign,
  FaWarehouse,
  FaImage,
  FaToggleOn,
  FaToggleOff
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
  gallery?: string[];
  newProduct: boolean;
  category: string;
  sku?: string;
  stockQuantity?: number;
  minStockAlert?: number;
  tags?: string[];
  isActive: boolean;
  createdAt: string;
  discountPercentage?: number;
  isLowStock?: boolean;
}

export default function AdminProductsPage() {
  const { user, isLoading, isAuthenticated } = useAuth();
  const router = useRouter();
  
  const [products, setProducts] = useState<Product[]>([]);
  const [loadingProducts, setLoadingProducts] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterCategory, setFilterCategory] = useState('all');
  const [filterStatus, setFilterStatus] = useState('all');
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);

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

  // Cargar productos
  useEffect(() => {
    const loadProducts = async () => {
      try {
        setLoadingProducts(true);
        const params = new URLSearchParams({
          page: currentPage.toString(),
          search: searchTerm,
          category: filterCategory,
          status: filterStatus
        });

        const apiClient = (await import('@/lib/api-client')).default;
        const data = await apiClient.get(`/admin/products?${params}`) as { 
          products?: typeof products; 
          pagination?: { totalPages: number } 
        };
        
        setProducts(data.products || []);
        setTotalPages(data.pagination?.totalPages || 1);
      } catch (error) {
        console.error('Error cargando productos:', error);
      } finally {
        setLoadingProducts(false);
      }
    };

    if (user && (user.role === 'admin' || user.role === 'super-admin')) {
      void loadProducts();
    }
  }, [user, currentPage, searchTerm, filterCategory, filterStatus]);

  const handleToggleProductStatus = async (productId: string, currentStatus: boolean) => {
    try {
      const apiClient = (await import('@/lib/api-client')).default;
      await apiClient.patch(`/admin/products/${productId}/toggle-status`, { isActive: !currentStatus });

      setProducts(products.map(p => 
        p._id === productId ? { ...p, isActive: !currentStatus } : p
      ));
    } catch (error) {
      console.error('Error cambiando status del producto:', error);
    }
  };

  const handleToggleNewProduct = async (productId: string, currentNewProduct: boolean) => {
    try {
      const apiClient = (await import('@/lib/api-client')).default;
      await apiClient.put(`/admin/products/${productId}`, { newProduct: !currentNewProduct });

      setProducts(products.map(p => 
        p._id === productId ? { ...p, newProduct: !currentNewProduct } : p
      ));
    } catch (error) {
      console.error('Error cambiando estado "nuevo" del producto:', error);
    }
  };

  const handleDeleteProduct = async (productId: string) => {
    if (!confirm('¿Estás seguro de que quieres eliminar este producto?')) {
      return;
    }

    try {
      const apiClient = (await import('@/lib/api-client')).default;
      await apiClient.delete(`/admin/products/${productId}`);
      
      setProducts(products.filter(p => p._id !== productId));
    } catch (error) {
      console.error('Error eliminando producto:', error);
    }
  };

  const getCategoryColor = (category: string) => {
    const colors: { [key: string]: string } = {
      cascos: 'bg-red-100 text-red-800',
      chaquetas: 'bg-blue-100 text-blue-800',
      guantes: 'bg-green-100 text-green-800',
      botas: 'bg-yellow-100 text-yellow-800',
      pantalones: 'bg-purple-100 text-purple-800',
      accesorios: 'bg-indigo-100 text-indigo-800',
      repuestos: 'bg-orange-100 text-orange-800',
      herramientas: 'bg-gray-100 text-gray-800',
      merchandising: 'bg-pink-100 text-pink-800'
    };
    return colors[category] || 'bg-gray-100 text-gray-800';
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <FaSpinner className="animate-spin text-4xl text-blue-600" />
      </div>
    );
  }

  if (!user || (user.role !== 'admin' && user.role !== 'super-admin')) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <h1 className="text-2xl font-bold text-gray-900">Acceso Denegado</h1>
          <Link href="/admin" className="text-blue-600 hover:underline">
            Volver al Panel de Administración
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white shadow-sm border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center py-4">
            <div className="flex items-center">
              <Link href="/admin" className="mr-4">
                <FaArrowLeft className="text-xl text-gray-600 hover:text-gray-900" />
              </Link>
              <FaBoxes className="text-2xl text-blue-600 mr-3" />
              <div>
                <h1 className="text-2xl font-bold text-gray-900">Gestión de Productos</h1>
                <p className="text-sm text-gray-600">Administrar inventario y tienda</p>
              </div>
            </div>
            
            <Link
              href="/admin/products/new"
              className="flex items-center bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors"
            >
              <FaPlus className="mr-2" />
              Nuevo Producto
            </Link>
          </div>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Filtros y Búsqueda */}
        <div className="bg-white rounded-lg shadow mb-6 p-6">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Buscar
              </label>
              <div className="relative">
                <FaSearch className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
                <input
                  type="text"
                  placeholder="Nombre, descripción..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
              </div>
            </div>

            <div>
              <label htmlFor="filterCategory" className="block text-sm font-medium text-gray-700 mb-2">
                Categoría
              </label>
              <select
                id="filterCategory"
                value={filterCategory}
                onChange={(e) => setFilterCategory(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              >
                <option value="all">Todas las categorías</option>
                <option value="cascos">Cascos</option>
                <option value="chaquetas">Chaquetas</option>
                <option value="guantes">Guantes</option>
                <option value="botas">Botas</option>
                <option value="pantalones">Pantalones</option>
                <option value="accesorios">Accesorios</option>
                <option value="repuestos">Repuestos</option>
                <option value="herramientas">Herramientas</option>
                <option value="merchandising">Merchandising</option>
              </select>
            </div>

            <div>
              <label htmlFor="filterStatus" className="block text-sm font-medium text-gray-700 mb-2">
                Estado
              </label>
              <select
                id="filterStatus"
                value={filterStatus}
                onChange={(e) => setFilterStatus(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              >
                <option value="all">Todos</option>
                <option value="active">Activos</option>
                <option value="inactive">Inactivos</option>
                <option value="in-stock">En Stock</option>
                <option value="out-of-stock">Sin Stock</option>
                <option value="new">Nuevos</option>
                <option value="low-stock">Stock Bajo</option>
              </select>
            </div>
          </div>
        </div>

        {/* Productos Grid */}
        <div className="bg-white rounded-lg shadow overflow-hidden">
          {loadingProducts ? (
            <div className="p-12 text-center">
              <FaSpinner className="animate-spin text-2xl text-gray-400 mx-auto mb-4" />
              <p className="text-gray-600">Cargando productos...</p>
            </div>
          ) : products.length === 0 ? (
            <div className="p-12 text-center">
              <FaBoxes className="text-4xl text-gray-400 mx-auto mb-4" />
              <p className="text-gray-600 mb-4">No se encontraron productos</p>
              <Link
                href="/admin/products/new"
                className="inline-flex items-center bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors"
              >
                <FaPlus className="mr-2" />
                Crear Primer Producto
              </Link>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 p-6">
              {products.map((product) => (
                <div key={product._id} className="bg-white border border-gray-200 rounded-lg overflow-hidden hover:shadow-lg transition-shadow">
                  {/* Imagen del Producto */}
                  <div className="h-48 bg-gray-200 relative">
                    {product.featuredImage ? (
                      <img
                        src={product.featuredImage}
                        alt={product.name}
                        className="w-full h-full object-cover"
                        onError={(e) => {
                          (e.target as HTMLImageElement).src = '/placeholder-product.jpg';
                        }}
                      />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center">
                        <FaImage className="text-4xl text-gray-400" />
                      </div>
                    )}
                    
                    {/* Badges */}
                    <div className="absolute top-2 left-2 flex flex-col space-y-1">
                      {!product.isActive && (
                        <span className="bg-red-100 text-red-800 text-xs px-2 py-1 rounded-full">
                          Inactivo
                        </span>
                      )}
                      {product.newProduct && (
                        <span className="bg-green-100 text-green-800 text-xs px-2 py-1 rounded-full">
                          Nuevo
                        </span>
                      )}
                      {product.originalPrice && product.originalPrice > product.finalPrice && (
                        <span className="bg-red-100 text-red-800 text-xs px-2 py-1 rounded-full">
                          Oferta
                        </span>
                      )}
                      {product.isLowStock && (
                        <span className="bg-orange-100 text-orange-800 text-xs px-2 py-1 rounded-full">
                          Stock Bajo
                        </span>
                      )}
                      {product.availability === 'out-of-stock' && (
                        <span className="bg-red-100 text-red-800 text-xs px-2 py-1 rounded-full">
                          Sin Stock
                        </span>
                      )}
                    </div>
                  </div>

                  {/* Información del Producto */}
                  <div className="p-4">
                    <div className="flex items-center justify-between mb-2">
                      <h3 className="text-lg font-semibold text-gray-900 truncate">
                        {product.name}
                      </h3>
                      <span className={`px-2 py-1 text-xs font-medium rounded-full ${getCategoryColor(product.category)}`}>
                        {product.category}
                      </span>
                    </div>
                    
                    <p className="text-gray-600 text-sm mb-3 line-clamp-2">
                      {product.shortDescription}
                    </p>
                    
                    <div className="flex items-center justify-between mb-4">
                      <div className="flex items-center">
                        <FaDollarSign className="text-green-500 mr-1" />
                        <span className="text-lg font-bold text-gray-900">
                          ${product.finalPrice.toLocaleString()}
                        </span>
                        {product.originalPrice && product.originalPrice > product.finalPrice && (
                          <span className="text-sm text-gray-500 line-through ml-2">
                            ${product.originalPrice.toLocaleString()}
                          </span>
                        )}
                      </div>
                      <div className="flex items-center">
                        <FaWarehouse className="text-blue-500 mr-1" />
                        <span className={`text-sm font-medium ${
                          product.availability === 'out-of-stock'
                            ? 'text-red-600'
                            : product.isLowStock
                            ? 'text-orange-600'
                            : 'text-gray-600'
                        }`}>
                          {product.availability === 'out-of-stock' 
                            ? 'Sin stock'
                            : `${product.stockQuantity || 0} unidades`
                          }
                        </span>
                      </div>
                    </div>

                    {/* Acciones */}
                    <div className="flex items-center justify-between">
                      <div className="flex items-center space-x-2">
                        <Link
                          href={`/admin/products/view/${product._id}`}
                          className="p-2 text-blue-600 hover:text-blue-900 hover:bg-blue-50 rounded-lg transition-colors"
                          title="Ver detalles"
                        >
                          <FaEye />
                        </Link>
                        <Link
                          href={`/admin/products/${product._id}`}
                          className="p-2 text-green-600 hover:text-green-900 hover:bg-green-50 rounded-lg transition-colors"
                          title="Editar"
                        >
                          <FaEdit />
                        </Link>
                        <button
                          onClick={() => handleDeleteProduct(product._id)}
                          className="p-2 text-red-600 hover:text-red-900 hover:bg-red-50 rounded-lg transition-colors"
                          title="Eliminar"
                        >
                          <FaTrash />
                        </button>
                      </div>
                      
                      <div className="flex items-center space-x-2">
                        <button
                          onClick={() => handleToggleProductStatus(product._id, product.isActive)}
                          className={`p-2 rounded-lg transition-colors ${
                            product.isActive 
                              ? 'text-green-600 hover:text-green-900 hover:bg-green-50' 
                              : 'text-gray-400 hover:text-green-600 hover:bg-green-50'
                          }`}
                          title={product.isActive ? 'Desactivar' : 'Activar'}
                        >
                          {product.isActive ? <FaToggleOn /> : <FaToggleOff />}
                        </button>
                        <button
                          onClick={() => handleToggleNewProduct(product._id, product.newProduct)}
                          className={`p-2 rounded-lg transition-colors ${
                            product.newProduct 
                              ? 'text-green-600 hover:text-green-900 hover:bg-green-50' 
                              : 'text-gray-400 hover:text-green-600 hover:bg-green-50'
                          }`}
                          title={product.newProduct ? 'Quitar "Nuevo"' : 'Marcar como "Nuevo"'}
                        >
                          <FaTag />
                        </button>
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}

          {/* Paginación */}
          {totalPages > 1 && (
            <div className="bg-gray-50 px-4 py-3 border-t border-gray-200 sm:px-6">
              <div className="flex items-center justify-between">
                <div className="flex-1 flex justify-between sm:hidden">
                  <button
                    onClick={() => setCurrentPage(Math.max(1, currentPage - 1))}
                    disabled={currentPage === 1}
                    className="relative inline-flex items-center px-4 py-2 border border-gray-300 text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 disabled:opacity-50"
                  >
                    Anterior
                  </button>
                  <button
                    onClick={() => setCurrentPage(Math.min(totalPages, currentPage + 1))}
                    disabled={currentPage === totalPages}
                    className="ml-3 relative inline-flex items-center px-4 py-2 border border-gray-300 text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 disabled:opacity-50"
                  >
                    Siguiente
                  </button>
                </div>
                <div className="hidden sm:flex-1 sm:flex sm:items-center sm:justify-between">
                  <div>
                    <p className="text-sm text-gray-700">
                      Página <span className="font-medium">{currentPage}</span> de{' '}
                      <span className="font-medium">{totalPages}</span>
                    </p>
                  </div>
                  <div>
                    <nav className="relative z-0 inline-flex rounded-md shadow-sm -space-x-px">
                      {Array.from({ length: Math.min(5, totalPages) }, (_, i) => {
                        const page = i + Math.max(1, currentPage - 2);
                        return (
                          <button
                            key={page}
                            onClick={() => setCurrentPage(page)}
                            className={`relative inline-flex items-center px-4 py-2 border text-sm font-medium ${
                              page === currentPage
                                ? 'z-10 bg-blue-50 border-blue-500 text-blue-600'
                                : 'bg-white border-gray-300 text-gray-500 hover:bg-gray-50'
                            }`}
                          >
                            {page}
                          </button>
                        );
                      })}
                    </nav>
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>
      </main>
    </div>
  );
}
