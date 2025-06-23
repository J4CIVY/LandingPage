import React from 'react';
import { Link } from 'react-router-dom';
import CartItem from '../components/cart/CartItem';
import CartSummary from '../components/cart/CartSummary';
import Layout from '../components/shared/Layout';
import { useCart } from '../../context/CartContext';

const Cart = () => {
  const { cartItems } = useCart();

  return (
    <Layout>
      <div className="container mx-auto py-8">
        <h1 className="text-3xl font-bold mb-8">Tu Carrito</h1>
        
        {cartItems.length === 0 ? (
          <div className="text-center py-12">
            <h2 className="text-2xl font-medium mb-4">Tu carrito está vacío</h2>
            <p className="mb-6">Explora nuestros productos y encuentra lo que necesitas</p>
            <Link
              to="/products"
              className="inline-block bg-blue-600 hover:bg-blue-700 text-white py-2 px-6 rounded-lg font-medium"
            >
              Ver productos
            </Link>
          </div>
        ) : (
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            <div className="lg:col-span-2">
              <div className="bg-white rounded-lg shadow-md p-6">
                {cartItems.map(item => (
                  <CartItem key={item.id} item={item} />
                ))}
              </div>
            </div>
            
            <div>
              <CartSummary />
            </div>
          </div>
        )}
      </div>
    </Layout>
  );
};

export default Cart;