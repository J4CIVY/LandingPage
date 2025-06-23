import React from 'react';
import ProductCard from '../components/products/ProductCard';
import Layout from '../components/shared/Layout';

const ProductList = () => {
  // Esto sería reemplazado por datos de tu API
  const products = [
    {
      id: 1,
      name: 'Producto 1',
      price: 50000,
      image: 'https://via.placeholder.com/300',
      description: 'Descripción del producto 1'
    },
    // Más productos...
  ];

  return (
    <Layout>
      <div className="container mx-auto py-8">
        <div className="flex justify-between items-center mb-8">
          <h1 className="text-3xl font-bold">Todos los Productos</h1>
          <div>
            <select className="border rounded px-3 py-2">
              <option>Ordenar por</option>
              <option>Precio: Menor a Mayor</option>
              <option>Precio: Mayor a Menor</option>
            </select>
          </div>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {products.map(product => (
            <ProductCard key={product.id} product={product} />
          ))}
        </div>
      </div>
    </Layout>
  );
};

export default ProductList;