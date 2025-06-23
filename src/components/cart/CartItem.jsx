import React from 'react';
import { useCart } from '../../context/CartContext';

const CartItem = ({ item }) => {
  const { updateQuantity, removeFromCart } = useCart();

  return (
    <div className="flex items-center justify-between py-4 border-b">
      <div className="flex items-center">
        <img 
          src={item.image} 
          alt={item.name} 
          className="w-20 h-20 object-cover rounded"
        />
        <div className="ml-4">
          <h3 className="font-medium">{item.name}</h3>
          <p className="text-gray-600">${item.price.toLocaleString()}</p>
        </div>
      </div>
      <div className="flex items-center">
        <button 
          onClick={() => updateQuantity(item.id, item.quantity - 1)}
          className="px-2 py-1 bg-gray-200 rounded-l"
        >
          -
        </button>
        <span className="px-4 py-1 bg-gray-100">{item.quantity}</span>
        <button 
          onClick={() => updateQuantity(item.id, item.quantity + 1)}
          className="px-2 py-1 bg-gray-200 rounded-r"
        >
          +
        </button>
        <button 
          onClick={() => removeFromCart(item.id)}
          className="ml-4 text-red-500"
        >
          Eliminar
        </button>
      </div>
    </div>
  );
};

export default CartItem;