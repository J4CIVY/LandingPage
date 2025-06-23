import React from 'react';
import { Link } from 'react-router-dom';
import { useCart } from '../../context/CartContext';

const ProductCard = ({ product }) => {
  const { addToCart } = useCart();

  return (
    <div className="bg-white rounded-lg shadow-md overflow-hidden hover:shadow-lg transition-shadow duration-300">
      <Link to={`/products/${product.id}`} className="block">
        <img 
          src={product.image} 
          alt={product.name} 
          className="w-full h-48 object-cover"
        />
      </Link>
      
      <div className="p-4">
        <Link to={`/products/${product.id}`} className="block">
          <h3 className="font-semibold text-lg mb-1 hover:text-blue-600">{product.name}</h3>
        </Link>
        
        <div className="flex justify-between items-center mt-2">
          <span className="font-bold text-gray-800">${product.price.toLocaleString()}</span>
          
          <button
            onClick={() => addToCart(product)}
            className="bg-[#000031] hover:bg-[#00FF99] text-white py-1 px-3 rounded transition-colors"
          >
            Añadir
          </button>
        </div>
      </div>
    </div>
  );
};

export default ProductCard;