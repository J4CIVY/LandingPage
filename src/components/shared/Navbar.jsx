import React from 'react';
import { Link } from 'react-router-dom';
import { useCart } from '../../context/CartContext';

const Navbar = () => {
  const { totalItems } = useCart();

  return (
    <nav className="bg-white shadow-md">
      <div className="container mx-auto px-4 py-4 flex justify-between items-center">
        <Link to="/" className="text-2xl font-bold text-blue-600">
          BSK MT
        </Link>
        
        <div className="flex items-center space-x-6">
          <Link to="/products" className="hover:text-blue-600">
            Productos
          </Link>
          <Link to="/cart" className="relative hover:text-blue-600">
            Carrito
            {totalItems > 0 && (
              <span className="absolute -top-2 -right-2 bg-red-500 text-white text-xs rounded-full h-5 w-5 flex items-center justify-center">
                {totalItems}
              </span>
            )}
          </Link>
        </div>
      </div>
    </nav>
  );
};

export default Navbar;