'use client';

import { useAuth } from '@/hooks/useAuth';
import { useState, useEffect } from 'react';
import { useRouter, useParams } from 'next/navigation';
import AdminLayout from '@/components/admin/AdminLayout';
import { 
  FaSpinner, 
  FaSave,
  FaArrowLeft,
  FaImage,
  FaDollarSign,
  FaWarehouse,
  FaInfoCircle,
  FaTags,
  FaRuler
} from 'react-icons/fa';

interface ProductFormData {
  name: string;
  shortDescription: string;
  longDescription: string;
  finalPrice: number | '';
  originalPrice: number | '';
  availability: 'in-stock' | 'out-of-stock';
  featuredImage: string;
  gallery: string[];
  newProduct: boolean;
  category: string;
  sku: string;
  stockQuantity: number | '';
  minStockAlert: number | '';
  weight: number | '';
  dimensions: {
    length: number | '';
    width: number | '';
    height: number | '';
  };
  technicalSpecifications: { [key: string]: string };
  features: string[];
  tags: string[];
}

const initialFormData: ProductFormData = {
  name: '',
  shortDescription: '',
  longDescription: '',
  finalPrice: '',
  originalPrice: '',
  availability: 'in-stock',
  featuredImage: '',
  gallery: [],
  newProduct: false,
  category: '',
  sku: '',
  stockQuantity: '',
  minStockAlert: 5,
  weight: '',
  dimensions: {
    length: '',
    width: '',
    height: ''
  },
  technicalSpecifications: {},
  features: [],
  tags: []
};

const categories = [
  { value: 'cascos', label: 'Cascos' },
  { value: 'chaquetas', label: 'Chaquetas' },
  { value: 'guantes', label: 'Guantes' },
  { value: 'botas', label: 'Botas' },
  { value: 'pantalones', label: 'Pantalones' },
  { value: 'accesorios', label: 'Accesorios' },
  { value: 'repuestos', label: 'Repuestos' },
  { value: 'herramientas', label: 'Herramientas' },
  { value: 'merchandising', label: 'Merchandising' }
];

export default function ProductFormPage() {
  const { user, isLoading, isAuthenticated } = useAuth();
  const router = useRouter();
  const params = useParams();
  const productId = params?.id as string;
  const isEdit = productId && productId !== 'new';

  const [formData, setFormData] = useState<ProductFormData>(initialFormData);
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [errors, setErrors] = useState<{ [key: string]: string }>({});
  const [newGalleryImage, setNewGalleryImage] = useState('');
  const [newFeature, setNewFeature] = useState('');
  const [newTag, setNewTag] = useState('');
  const [newSpecKey, setNewSpecKey] = useState('');
  const [newSpecValue, setNewSpecValue] = useState('');

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

  // Cargar datos del producto si es edición
  useEffect(() => {
    const loadProduct = async () => {
      if (!isEdit) return;

      try {
        setLoading(true);
        const response = await fetch(`/api/admin/products/${productId}`);
        if (response.ok) {
          const data = await response.json();
          const product = data.product;
          
          setFormData({
            name: product.name || '',
            shortDescription: product.shortDescription || '',
            longDescription: product.longDescription || '',
            finalPrice: product.finalPrice || '',
            originalPrice: product.originalPrice || '',
            availability: product.availability || 'in-stock',
            featuredImage: product.featuredImage || '',
            gallery: product.gallery || [],
            newProduct: product.newProduct || false,
            category: product.category || '',
            sku: product.sku || '',
            stockQuantity: product.stockQuantity || '',
            minStockAlert: product.minStockAlert || 5,
            weight: product.weight || '',
            dimensions: {
              length: product.dimensions?.length || '',
              width: product.dimensions?.width || '',
              height: product.dimensions?.height || ''
            },
            technicalSpecifications: product.technicalSpecifications || {},
            features: product.features || [],
            tags: product.tags || []
          });
        } else {
          router.push('/admin/products');
        }
      } catch (error) {
        console.error('Error cargando producto:', error);
        router.push('/admin/products');
      } finally {
        setLoading(false);
      }
    };

    if (user && (user.role === 'admin' || user.role === 'super-admin') && productId) {
      loadProduct();
    }
  }, [isEdit, productId, user, router]);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value, type } = e.target;
    
    if (name.includes('.')) {
      const [parent, child] = name.split('.');
      setFormData(prev => ({
        ...prev,
        [parent]: {
          ...prev[parent as keyof ProductFormData] as any,
          [child]: type === 'number' ? (value === '' ? '' : Number(value)) : value
        }
      }));
    } else {
      const processedValue = type === 'number' ? (value === '' ? '' : Number(value)) : 
                           type === 'checkbox' ? (e.target as HTMLInputElement).checked : value;
      
      setFormData(prev => ({
        ...prev,
        [name]: processedValue
      }));
    }
    
    // Limpiar error si existe
    if (errors[name]) {
      setErrors(prev => ({ ...prev, [name]: '' }));
    }
  };

  const addToGallery = () => {
    if (!newGalleryImage.trim()) return;
    
    setFormData(prev => ({
      ...prev,
      gallery: [...prev.gallery, newGalleryImage.trim()]
    }));
    setNewGalleryImage('');
  };

  const removeFromGallery = (index: number) => {
    setFormData(prev => ({
      ...prev,
      gallery: prev.gallery.filter((_, i) => i !== index)
    }));
  };

  const addToArray = (arrayName: 'features' | 'tags', value: string) => {
    if (!value.trim()) return;
    
    setFormData(prev => ({
      ...prev,
      [arrayName]: [...prev[arrayName], value.trim()]
    }));
    
    if (arrayName === 'features') setNewFeature('');
    if (arrayName === 'tags') setNewTag('');
  };

  const removeFromArray = (arrayName: 'features' | 'tags', index: number) => {
    setFormData(prev => ({
      ...prev,
      [arrayName]: prev[arrayName].filter((_, i) => i !== index)
    }));
  };

  const addTechnicalSpec = () => {
    if (!newSpecKey.trim() || !newSpecValue.trim()) return;
    
    setFormData(prev => ({
      ...prev,
      technicalSpecifications: {
        ...prev.technicalSpecifications,
        [newSpecKey.trim()]: newSpecValue.trim()
      }
    }));
    
    setNewSpecKey('');
    setNewSpecValue('');
  };

  const removeTechnicalSpec = (key: string) => {
    setFormData(prev => ({
      ...prev,
      technicalSpecifications: Object.fromEntries(
        Object.entries(prev.technicalSpecifications).filter(([k]) => k !== key)
      )
    }));
  };

  const validateForm = (): boolean => {
    const newErrors: { [key: string]: string } = {};

    if (!formData.name.trim()) newErrors.name = 'El nombre es requerido';
    if (!formData.shortDescription.trim()) newErrors.shortDescription = 'La descripción corta es requerida';
    if (!formData.longDescription.trim()) newErrors.longDescription = 'La descripción larga es requerida';
    if (!formData.finalPrice || formData.finalPrice <= 0) newErrors.finalPrice = 'El precio debe ser mayor a 0';
    if (!formData.featuredImage.trim()) newErrors.featuredImage = 'La imagen principal es requerida';
    if (!formData.category) newErrors.category = 'La categoría es requerida';

    // Validar precio original si existe
    if (formData.originalPrice && typeof formData.originalPrice === 'number' && typeof formData.finalPrice === 'number' && formData.originalPrice < formData.finalPrice) {
      newErrors.originalPrice = 'El precio original debe ser mayor al precio final';
    }

    // Validar URL de imagen
    try {
      if (formData.featuredImage) {
        new URL(formData.featuredImage);
      }
    } catch {
      newErrors.featuredImage = 'La URL de la imagen no es válida';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!validateForm()) return;

    try {
      setSaving(true);
      
      // Preparar datos para envío
      const productData = {
        ...formData,
        finalPrice: Number(formData.finalPrice),
        originalPrice: formData.originalPrice === '' ? undefined : Number(formData.originalPrice),
        stockQuantity: formData.stockQuantity === '' ? undefined : Number(formData.stockQuantity),
        minStockAlert: formData.minStockAlert === '' ? 5 : Number(formData.minStockAlert),
        weight: formData.weight === '' ? undefined : Number(formData.weight),
        dimensions: {
          length: formData.dimensions.length === '' ? undefined : Number(formData.dimensions.length),
          width: formData.dimensions.width === '' ? undefined : Number(formData.dimensions.width),
          height: formData.dimensions.height === '' ? undefined : Number(formData.dimensions.height)
        }
      };

      const url = isEdit ? `/api/admin/products/${productId}` : '/api/admin/products';
      const method = isEdit ? 'PUT' : 'POST';

      const response = await fetch(url, {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(productData)
      });

      if (response.ok) {
        router.push('/admin/products');
      } else {
        const data = await response.json();
        throw new Error(data.error || 'Error al guardar producto');
      }
    } catch (error) {
      console.error('Error guardando producto:', error);
      alert('Error al guardar el producto. Por favor intenta de nuevo.');
    } finally {
      setSaving(false);
    }
  };

  if (isLoading || loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <FaSpinner className="animate-spin text-4xl text-blue-600 mx-auto mb-4" />
          <p className="text-gray-600">Cargando...</p>
        </div>
      </div>
    );
  }

  return (
    <AdminLayout 
      title={isEdit ? 'Editar Producto' : 'Crear Producto'} 
      description={isEdit ? 'Modificar información del producto' : 'Crear un nuevo producto'}
    >
      <div className="max-w-4xl mx-auto">
        {/* Header */}
        <div className="mb-6">
          <button
            onClick={() => router.back()}
            className="inline-flex items-center text-sm text-gray-500 hover:text-gray-700 mb-4"
          >
            <FaArrowLeft className="mr-2" />
            Volver
          </button>
        </div>

        {/* Formulario */}
        <form onSubmit={handleSubmit} className="space-y-8">
          {/* Información Básica */}
          <div className="bg-white rounded-lg shadow p-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
              <FaInfoCircle className="mr-2 text-blue-500" />
              Información Básica
            </h3>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="md:col-span-2">
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Nombre del Producto *
                </label>
                <input
                  type="text"
                  name="name"
                  value={formData.name}
                  onChange={handleInputChange}
                  className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent ${
                    errors.name ? 'border-red-500' : 'border-gray-300'
                  }`}
                  placeholder="Ej: Casco Integral Arai RX-7V"
                />
                {errors.name && <p className="mt-1 text-sm text-red-600">{errors.name}</p>}
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Categoría *
                </label>
                <select
                  name="category"
                  value={formData.category}
                  onChange={handleInputChange}
                  className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent ${
                    errors.category ? 'border-red-500' : 'border-gray-300'
                  }`}
                >
                  <option value="">Seleccionar categoría</option>
                  {categories.map(cat => (
                    <option key={cat.value} value={cat.value}>{cat.label}</option>
                  ))}
                </select>
                {errors.category && <p className="mt-1 text-sm text-red-600">{errors.category}</p>}
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  SKU
                </label>
                <input
                  type="text"
                  name="sku"
                  value={formData.sku}
                  onChange={handleInputChange}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  placeholder="Se genera automáticamente si se deja vacío"
                />
              </div>

              <div className="md:col-span-2">
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Descripción Corta *
                </label>
                <textarea
                  name="shortDescription"
                  value={formData.shortDescription}
                  onChange={handleInputChange}
                  rows={2}
                  maxLength={200}
                  className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent ${
                    errors.shortDescription ? 'border-red-500' : 'border-gray-300'
                  }`}
                  placeholder="Descripción breve para listados..."
                />
                <div className="flex justify-between mt-1">
                  {errors.shortDescription && <p className="text-sm text-red-600">{errors.shortDescription}</p>}
                  <p className="text-sm text-gray-500">{formData.shortDescription.length}/200</p>
                </div>
              </div>

              <div className="md:col-span-2">
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Descripción Detallada *
                </label>
                <textarea
                  name="longDescription"
                  value={formData.longDescription}
                  onChange={handleInputChange}
                  rows={6}
                  maxLength={2000}
                  className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent ${
                    errors.longDescription ? 'border-red-500' : 'border-gray-300'
                  }`}
                  placeholder="Descripción completa del producto, características, materiales, etc..."
                />
                <div className="flex justify-between mt-1">
                  {errors.longDescription && <p className="text-sm text-red-600">{errors.longDescription}</p>}
                  <p className="text-sm text-gray-500">{formData.longDescription.length}/2000</p>
                </div>
              </div>
            </div>
          </div>

          {/* Precios */}
          <div className="bg-white rounded-lg shadow p-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
              <FaDollarSign className="mr-2 text-green-500" />
              Precios
            </h3>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Precio Final (MXN) *
                </label>
                <input
                  type="number"
                  name="finalPrice"
                  value={formData.finalPrice}
                  onChange={handleInputChange}
                  min="0"
                  step="0.01"
                  className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent ${
                    errors.finalPrice ? 'border-red-500' : 'border-gray-300'
                  }`}
                  placeholder="0.00"
                />
                {errors.finalPrice && <p className="mt-1 text-sm text-red-600">{errors.finalPrice}</p>}
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Precio Original (MXN)
                </label>
                <input
                  type="number"
                  name="originalPrice"
                  value={formData.originalPrice}
                  onChange={handleInputChange}
                  min="0"
                  step="0.01"
                  className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent ${
                    errors.originalPrice ? 'border-red-500' : 'border-gray-300'
                  }`}
                  placeholder="Precio antes del descuento"
                />
                {errors.originalPrice && <p className="mt-1 text-sm text-red-600">{errors.originalPrice}</p>}
                <p className="mt-1 text-sm text-gray-500">Opcional. Para mostrar descuentos</p>
              </div>

              {formData.originalPrice && Number(formData.originalPrice) > Number(formData.finalPrice) && (
                <div className="md:col-span-2 p-4 bg-green-50 rounded-lg">
                  <p className="text-green-800 font-medium">
                    Descuento: {Math.round(((Number(formData.originalPrice) - Number(formData.finalPrice)) / Number(formData.originalPrice)) * 100)}%
                  </p>
                  <p className="text-green-600 text-sm">
                    Ahorro: ${(Number(formData.originalPrice) - Number(formData.finalPrice)).toLocaleString('es-MX')}
                  </p>
                </div>
              )}
            </div>
          </div>

          {/* Inventario */}
          <div className="bg-white rounded-lg shadow p-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
              <FaWarehouse className="mr-2 text-blue-500" />
              Inventario
            </h3>
            
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Stock Actual
                </label>
                <input
                  type="number"
                  name="stockQuantity"
                  value={formData.stockQuantity}
                  onChange={handleInputChange}
                  min="0"
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  placeholder="0"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Alerta de Stock Mínimo
                </label>
                <input
                  type="number"
                  name="minStockAlert"
                  value={formData.minStockAlert}
                  onChange={handleInputChange}
                  min="0"
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  placeholder="5"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Disponibilidad
                </label>
                <select
                  name="availability"
                  value={formData.availability}
                  onChange={handleInputChange}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                >
                  <option value="in-stock">En Stock</option>
                  <option value="out-of-stock">Sin Stock</option>
                </select>
              </div>
            </div>
          </div>

          {/* Imágenes */}
          <div className="bg-white rounded-lg shadow p-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
              <FaImage className="mr-2 text-purple-500" />
              Imágenes
            </h3>
            
            <div className="space-y-6">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Imagen Principal (URL) *
                </label>
                <input
                  type="url"
                  name="featuredImage"
                  value={formData.featuredImage}
                  onChange={handleInputChange}
                  className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent ${
                    errors.featuredImage ? 'border-red-500' : 'border-gray-300'
                  }`}
                  placeholder="https://ejemplo.com/imagen.jpg"
                />
                {errors.featuredImage && <p className="mt-1 text-sm text-red-600">{errors.featuredImage}</p>}
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Galería de Imágenes
                </label>
                <div className="flex gap-2 mb-3">
                  <input
                    type="url"
                    value={newGalleryImage}
                    onChange={(e) => setNewGalleryImage(e.target.value)}
                    onKeyPress={(e) => e.key === 'Enter' && (e.preventDefault(), addToGallery())}
                    className="flex-1 px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    placeholder="URL de imagen adicional..."
                  />
                  <button
                    type="button"
                    onClick={addToGallery}
                    className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
                  >
                    Agregar
                  </button>
                </div>
                
                <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                  {formData.gallery.map((image, index) => (
                    <div key={index} className="relative group">
                      <img
                        src={image}
                        alt={`Galería ${index + 1}`}
                        className="w-full h-24 object-cover rounded border"
                        onError={(e) => {
                          (e.target as HTMLImageElement).src = '/placeholder-product.jpg';
                        }}
                      />
                      <button
                        type="button"
                        onClick={() => removeFromGallery(index)}
                        className="absolute top-1 right-1 bg-red-500 text-white rounded-full w-6 h-6 flex items-center justify-center text-xs opacity-0 group-hover:opacity-100 transition-opacity"
                      >
                        ×
                      </button>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>

          {/* Especificaciones Físicas */}
          <div className="bg-white rounded-lg shadow p-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
              <FaRuler className="mr-2 text-orange-500" />
              Especificaciones Físicas
            </h3>
            
            <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Peso (kg)
                </label>
                <input
                  type="number"
                  name="weight"
                  value={formData.weight}
                  onChange={handleInputChange}
                  min="0"
                  step="0.01"
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  placeholder="0.00"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Largo (cm)
                </label>
                <input
                  type="number"
                  name="dimensions.length"
                  value={formData.dimensions.length}
                  onChange={handleInputChange}
                  min="0"
                  step="0.1"
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  placeholder="0.0"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Ancho (cm)
                </label>
                <input
                  type="number"
                  name="dimensions.width"
                  value={formData.dimensions.width}
                  onChange={handleInputChange}
                  min="0"
                  step="0.1"
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  placeholder="0.0"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Alto (cm)
                </label>
                <input
                  type="number"
                  name="dimensions.height"
                  value={formData.dimensions.height}
                  onChange={handleInputChange}
                  min="0"
                  step="0.1"
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  placeholder="0.0"
                />
              </div>
            </div>
          </div>

          {/* Especificaciones Técnicas */}
          <div className="bg-white rounded-lg shadow p-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">
              Especificaciones Técnicas
            </h3>
            
            <div className="space-y-4">
              <div className="flex gap-2">
                <input
                  type="text"
                  value={newSpecKey}
                  onChange={(e) => setNewSpecKey(e.target.value)}
                  className="flex-1 px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  placeholder="Característica (ej: Material)"
                />
                <input
                  type="text"
                  value={newSpecValue}
                  onChange={(e) => setNewSpecValue(e.target.value)}
                  onKeyPress={(e) => e.key === 'Enter' && (e.preventDefault(), addTechnicalSpec())}
                  className="flex-1 px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  placeholder="Valor (ej: Fibra de carbono)"
                />
                <button
                  type="button"
                  onClick={addTechnicalSpec}
                  className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
                >
                  Agregar
                </button>
              </div>
              
              <div className="space-y-2">
                {Object.entries(formData.technicalSpecifications).map(([key, value]) => (
                  <div key={key} className="flex items-center justify-between p-3 bg-gray-50 rounded">
                    <div>
                      <span className="font-medium text-gray-900">{key}:</span>
                      <span className="text-gray-700 ml-2">{value}</span>
                    </div>
                    <button
                      type="button"
                      onClick={() => removeTechnicalSpec(key)}
                      className="text-red-600 hover:text-red-800"
                    >
                      ×
                    </button>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Características */}
          <div className="bg-white rounded-lg shadow p-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">
              Características Destacadas
            </h3>
            
            <div className="space-y-4">
              <div className="flex gap-2">
                <input
                  type="text"
                  value={newFeature}
                  onChange={(e) => setNewFeature(e.target.value)}
                  onKeyPress={(e) => e.key === 'Enter' && (e.preventDefault(), addToArray('features', newFeature))}
                  className="flex-1 px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  placeholder="Agregar característica..."
                />
                <button
                  type="button"
                  onClick={() => addToArray('features', newFeature)}
                  className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
                >
                  Agregar
                </button>
              </div>
              
              <div className="flex flex-wrap gap-2">
                {formData.features.map((feature, index) => (
                  <span
                    key={index}
                    className="inline-flex items-center px-3 py-1 bg-blue-100 text-blue-800 rounded-full text-sm"
                  >
                    {feature}
                    <button
                      type="button"
                      onClick={() => removeFromArray('features', index)}
                      className="ml-2 text-blue-600 hover:text-blue-800"
                    >
                      ×
                    </button>
                  </span>
                ))}
              </div>
            </div>
          </div>

          {/* Tags y Estado */}
          <div className="bg-white rounded-lg shadow p-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
              <FaTags className="mr-2 text-indigo-500" />
              Etiquetas y Estado
            </h3>
            
            <div className="space-y-6">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Etiquetas
                </label>
                <div className="flex gap-2 mb-3">
                  <input
                    type="text"
                    value={newTag}
                    onChange={(e) => setNewTag(e.target.value)}
                    onKeyPress={(e) => e.key === 'Enter' && (e.preventDefault(), addToArray('tags', newTag))}
                    className="flex-1 px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    placeholder="Agregar etiqueta..."
                  />
                  <button
                    type="button"
                    onClick={() => addToArray('tags', newTag)}
                    className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
                  >
                    Agregar
                  </button>
                </div>
                
                <div className="flex flex-wrap gap-2">
                  {formData.tags.map((tag, index) => (
                    <span
                      key={index}
                      className="inline-flex items-center px-3 py-1 bg-gray-100 text-gray-800 rounded-full text-sm"
                    >
                      #{tag}
                      <button
                        type="button"
                        onClick={() => removeFromArray('tags', index)}
                        className="ml-2 text-gray-600 hover:text-gray-800"
                      >
                        ×
                      </button>
                    </span>
                  ))}
                </div>
              </div>

              <div className="flex items-center">
                <input
                  type="checkbox"
                  id="newProduct"
                  name="newProduct"
                  checked={formData.newProduct}
                  onChange={handleInputChange}
                  className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                />
                <label htmlFor="newProduct" className="ml-2 block text-sm text-gray-900">
                  Marcar como producto nuevo
                </label>
              </div>
            </div>
          </div>

          {/* Botones de Acción */}
          <div className="flex justify-end space-x-4 pt-6">
            <button
              type="button"
              onClick={() => router.back()}
              className="px-6 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors"
            >
              Cancelar
            </button>
            <button
              type="submit"
              disabled={saving}
              className="inline-flex items-center px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors disabled:opacity-50"
            >
              {saving ? (
                <>
                  <FaSpinner className="animate-spin mr-2" />
                  Guardando...
                </>
              ) : (
                <>
                  <FaSave className="mr-2" />
                  {isEdit ? 'Actualizar Producto' : 'Crear Producto'}
                </>
              )}
            </button>
          </div>
        </form>
      </div>
    </AdminLayout>
  );
}
