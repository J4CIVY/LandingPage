import React from 'react';
import { useCart } from '../../context/CartContext';
import { Link } from 'react-router-dom';

const CartSummary = () => {
  const { subtotal, totalItems, cartItems } = useCart();
  const shipping = subtotal > 100000 ? 0 : 10000; // Envío gratis sobre $100,000
  const total = subtotal + shipping;

  return (
    <div className="bg-white p-6 rounded-lg shadow-md">
      <h2 className="text-xl font-bold mb-4">Resumen del pedido</h2>
      
      <div className="space-y-2 mb-4">
        <div className="flex justify-between">
          <span>Productos ({totalItems})</span>
          <span>${subtotal.toLocaleString()}</span>
        </div>
        <div className="flex justify-between">
          <span>Envío</span>
          <span>{shipping === 0 ? 'Gratis' : `$${shipping.toLocaleString()}`}</span>
        </div>
      </div>
      
      <div className="border-t pt-4 mb-6">
        <div className="flex justify-between font-bold text-lg">
          <span>Total</span>
          <span>${total.toLocaleString()}</span>
        </div>
      </div>
      
      <Link
        to="/checkout"
        className={`block w-full text-center py-3 px-4 rounded-lg font-medium ${cartItems.length === 0 ? 'bg-gray-300 cursor-not-allowed' : 'bg-blue-600 hover:bg-blue-700 text-white'}`}
        disabled={cartItems.length === 0}
      >
        Proceder al pago
      </Link>
    </div>
  );
};

export default CartSummary;