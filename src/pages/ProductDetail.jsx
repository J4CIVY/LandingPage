import React, { useState } from 'react';
import { useParams } from 'react-router-dom';
import { useCart } from '../context/CartContext';
import Layout from '../components/shared/Layout';

const ProductDetail = () => {
  const { id } = useParams();
  const { addToCart } = useCart();
  const [quantity, setQuantity] = useState(1);
  
  // Esto sería reemplazado por datos de tu API
  const product = {
    id: 1,
    name: 'Producto Ejemplo',
    price: 50000,
    images: [
      'https://via.placeholder.com/600',
      'https://via.placeholder.com/600/2',
      'https://via.placeholder.com/600/3'
    ],
    description: 'Descripción detallada del producto. Incluye características, beneficios y especificaciones técnicas.',
    category: 'Categoría',
    stock: 10
  };

  const [selectedImage, setSelectedImage] = useState(product.images[0]);

  const handleAddToCart = () => {
    addToCart(product, quantity);
  };

  return (
    <Layout>
      <div className="container mx-auto py-8">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          {/* Galería de imágenes */}
          <div>
            <div className="mb-4">
              <img 
                src={selectedImage} 
                alt={product.name} 
                className="w-full h-96 object-cover rounded-lg"
              />
            </div>
            <div className="grid grid-cols-4 gap-2">
              {product.images.map((img, index) => (
                <button 
                  key={index}
                  onClick={() => setSelectedImage(img)}
                  className={`border rounded-lg overflow-hidden ${selectedImage === img ? 'ring-2 ring-blue-500' : ''}`}
                >
                  <img 
                    src={img} 
                    alt={`Vista ${index + 1}`} 
                    className="w-full h-20 object-cover"
                  />
                </button>
              ))}
            </div>
          </div>
          
          {/* Información del producto */}
          <div>
            <h1 className="text-3xl font-bold mb-2">{product.name}</h1>
            <p className="text-gray-600 mb-4">{product.category}</p>
            
            <div className="text-2xl font-bold mb-6">${product.price.toLocaleString()}</div>
            
            <div className="mb-6">
              <p>{product.description}</p>
            </div>
            
            <div className="flex items-center mb-6">
              <span className="mr-4">Cantidad:</span>
              <div className="flex items-center">
                <button 
                  onClick={() => setQuantity(prev => Math.max(1, prev - 1))}
                  className="px-3 py-1 bg-gray-200 rounded-l"
                >
                  -
                </button>
                <span className="px-4 py-1 bg-gray-100">{quantity}</span>
                <button 
                  onClick={() => setQuantity(prev => Math.min(product.stock, prev + 1))}
                  className="px-3 py-1 bg-gray-200 rounded-r"
                >
                  +
                </button>
              </div>
              <span className="ml-4 text-gray-600">{product.stock} disponibles</span>
            </div>
            
            <button 
              onClick={handleAddToCart}
              className="w-full bg-blue-600 hover:bg-blue-700 text-white py-3 px-4 rounded-lg font-medium"
            >
              Añadir al carrito
            </button>
          </div>
        </div>
      </div>
    </Layout>
  );
};

export default ProductDetail;