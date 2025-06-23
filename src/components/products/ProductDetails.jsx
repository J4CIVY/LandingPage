import React, { useState } from 'react';
import { useCart } from '../../context/CartContext';

const ProductDetails = ({ product }) => {
  const [quantity, setQuantity] = useState(1);
  const [selectedImage, setSelectedImage] = useState(product.images[0]);
  const { addToCart } = useCart();

  const handleAddToCart = () => {
    addToCart(product, quantity);
  };

  return (
    <div className="bg-white rounded-lg shadow-md p-6">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
        {/* Galería de imágenes */}
        <div>
          <div className="mb-4">
            <img 
              src={selectedImage} 
              alt={product.name} 
              className="w-full h-96 object-contain rounded-lg"
            />
          </div>
          <div className="grid grid-cols-4 gap-2">
            {product.images.map((img, index) => (
              <button 
                key={index}
                onClick={() => setSelectedImage(img)}
                className={`border rounded-lg overflow-hidden ${selectedImage === img ? 'ring-2 ring-[#00FF99]' : ''}`}
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
          <h1 className="text-2xl font-bold mb-2">{product.name}</h1>
          <p className="text-gray-600 mb-4">{product.category}</p>
          
          <div className="text-xl font-bold mb-6">${product.price.toLocaleString()}</div>
          
          <div className="mb-6">
            <p className="text-gray-700">{product.description}</p>
          </div>
          
          {product.specs && (
            <div className="mb-6">
              <h3 className="font-semibold mb-2">Especificaciones:</h3>
              <ul className="list-disc pl-5">
                {product.specs.map((spec, i) => (
                  <li key={i}>{spec}</li>
                ))}
              </ul>
            </div>
          )}
          
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
            className="w-full bg-[#000031] hover:bg-[#00FF99] text-white py-3 px-4 rounded-lg font-medium transition-colors"
          >
            Añadir al carrito
          </button>
        </div>
      </div>
    </div>
  );
};

export default ProductDetails;