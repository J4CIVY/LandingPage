import React, { useState, useEffect } from 'react';
import axios from 'axios';

const Store = () => {
  // State for products, loading, and error handling
  const [products, setProducts] = useState([]);
  const [filteredProducts, setFilteredProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  
  // State for search and filters
  const [searchTerm, setSearchTerm] = useState('');
  const [categoryFilter, setCategoryFilter] = useState('all');
  const [availabilityFilter, setAvailabilityFilter] = useState('all');
  const [priceRange, setPriceRange] = useState([0, 200000]);
  
  // State for modal
  const [selectedProduct, setSelectedProduct] = useState(null);
  const [isModalOpen, setIsModalOpen] = useState(false);

  // Fetch products from API
  useEffect(() => {
    const fetchProducts = async () => {
      try {
        const response = await axios.get('https://api.bskmt.com/products');
        if (response.data.status === 'success') {
          setProducts(response.data.data.products);
          setFilteredProducts(response.data.data.products);
        } else {
          throw new Error('Failed to fetch products');
        }
      } catch (err) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };

    fetchProducts();
  }, []);

  // Apply filters whenever search or filters change
  useEffect(() => {
    let result = [...products];
    
    // Apply search filter
    if (searchTerm) {
      result = result.filter(product => 
        product.name.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }
    
    // Apply category filter
    if (categoryFilter !== 'all') {
      result = result.filter(product => 
        product.category === categoryFilter
      );
    }
    
    // Apply availability filter
    if (availabilityFilter !== 'all') {
      result = result.filter(product => 
        availabilityFilter === 'in-stock' ? 
        product.availability === 'in-stock' : 
        product.availability !== 'in-stock'
      );
    }
    
    // Apply price range filter
    result = result.filter(product => 
      product.finalPrice >= priceRange[0] && 
      product.finalPrice <= priceRange[1]
    );
    
    setFilteredProducts(result);
  }, [searchTerm, categoryFilter, availabilityFilter, priceRange, products]);

  // Generate slug from product name
  const generateSlug = (name) => {
    return name
      .toLowerCase()
      .replace(/[^\w\s]/gi, '')
      .replace(/\s+/g, '-')
      .replace(/--+/g, '-');
  };

  // Format price in COP
  const formatPrice = (price) => {
    return new Intl.NumberFormat('es-CO', {
      style: 'currency',
      currency: 'COP',
      minimumFractionDigits: 0
    }).format(price);
  };

  // Handle modal open
  const openProductModal = (product) => {
    setSelectedProduct(product);
    setIsModalOpen(true);
    document.body.style.overflow = 'hidden'; // Prevent scrolling when modal is open
  };

  // Handle modal close
  const closeProductModal = () => {
    setIsModalOpen(false);
    document.body.style.overflow = 'auto'; // Re-enable scrolling
  };

  // Get unique categories from products
  const categories = ['all', ...new Set(products.map(product => product.category).filter(Boolean))];

  if (loading) {
    return (
      <div className="flex justify-center items-center min-h-screen">
        <div className="animate-spin rounded-full h-16 w-16 border-t-4 border-b-4 border-red-500"></div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="text-center py-10">
        <h2 className="text-2xl font-bold text-red-500 mb-4">Error loading products</h2>
        <p className="text-gray-600">{error}</p>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8">
      {/* Header */}
      <div className="text-center mb-12">
        <h1 className="text-4xl font-bold text-gray-900 mb-2">BSK MT Store</h1>
        <p className="text-lg text-gray-600">Official merchandise for motorcycle enthusiasts</p>
      </div>
      
      {/* Search and Filters */}
      <div className="bg-white p-6 rounded-lg shadow-md mb-8">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          {/* Search */}
          <div className="md:col-span-2">
            <label htmlFor="search" className="block text-sm font-medium text-gray-700 mb-1">
              Search Products
            </label>
            <input
              type="text"
              id="search"
              placeholder="Search by product name..."
              className="w-full px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-red-500"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>
          
          {/* Category Filter */}
          <div>
            <label htmlFor="category" className="block text-sm font-medium text-gray-700 mb-1">
              Category
            </label>
            <select
              id="category"
              className="w-full px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-red-500"
              value={categoryFilter}
              onChange={(e) => setCategoryFilter(e.target.value)}
            >
              {categories.map(category => (
                <option key={category} value={category}>
                  {category === 'all' ? 'All Categories' : category}
                </option>
              ))}
            </select>
          </div>
          
          {/* Availability Filter */}
          <div>
            <label htmlFor="availability" className="block text-sm font-medium text-gray-700 mb-1">
              Availability
            </label>
            <select
              id="availability"
              className="w-full px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-red-500"
              value={availabilityFilter}
              onChange={(e) => setAvailabilityFilter(e.target.value)}
            >
              <option value="all">All Products</option>
              <option value="in-stock">In Stock</option>
              <option value="out-of-stock">Out of Stock</option>
            </select>
          </div>
        </div>
        
        {/* Price Range Filter */}
        <div className="mt-4">
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Price Range: {formatPrice(priceRange[0])} - {formatPrice(priceRange[1])}
          </label>
          <div className="flex items-center space-x-4">
            <input
              type="range"
              min="0"
              max="200000"
              step="10000"
              value={priceRange[0]}
              onChange={(e) => setPriceRange([parseInt(e.target.value), priceRange[1]])}
              className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer"
            />
            <input
              type="range"
              min="0"
              max="200000"
              step="10000"
              value={priceRange[1]}
              onChange={(e) => setPriceRange([priceRange[0], parseInt(e.target.value)])}
              className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer"
            />
          </div>
        </div>
      </div>
      
      {/* Products Grid */}
      {filteredProducts.length === 0 ? (
        <div className="text-center py-12">
          <h3 className="text-xl font-semibold text-gray-700">No products found matching your criteria</h3>
          <button 
            onClick={() => {
              setSearchTerm('');
              setCategoryFilter('all');
              setAvailabilityFilter('all');
              setPriceRange([0, 200000]);
            }}
            className="mt-4 px-6 py-2 bg-red-500 text-white rounded-md hover:bg-red-600 transition-colors"
          >
            Reset Filters
          </button>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
          {filteredProducts.map((product) => (
            <div 
              key={product.id}
              className="bg-white rounded-lg shadow-md overflow-hidden hover:shadow-xl transition-shadow duration-300"
            >
              {/* Product Image */}
              <div 
                className="h-64 bg-gray-100 relative overflow-hidden cursor-pointer"
                onClick={() => openProductModal(product)}
              >
                <img
                  src={product.featuredImage}
                  alt={product.name}
                  className="w-full h-full object-cover hover:scale-105 transition-transform duration-300"
                  onError={(e) => {
                    e.target.src = 'https://via.placeholder.com/300x300?text=Product+Image';
                  }}
                />
                {product.newProduct && (
                  <div className="absolute top-2 left-2 bg-red-500 text-white px-2 py-1 text-xs font-bold rounded">
                    NEW
                  </div>
                )}
              </div>
              
              {/* Product Info */}
              <div className="p-4">
                <h3 
                  className="font-bold text-lg mb-1 cursor-pointer hover:text-red-500"
                  onClick={() => openProductModal(product)}
                >
                  {product.name}
                </h3>
                <p className="text-gray-600 text-sm mb-2 line-clamp-2">
                  {product.shortDescription}
                </p>
                <div className="flex justify-between items-center mt-3">
                  <span className="font-bold text-red-500">
                    {formatPrice(product.finalPrice)}
                  </span>
                  <span className={`text-xs px-2 py-1 rounded ${
                    product.availability === 'in-stock' ? 
                    'bg-green-100 text-green-800' : 
                    'bg-red-100 text-red-800'
                  }`}>
                    {product.availability === 'in-stock' ? 'In Stock' : 'Out of Stock'}
                  </span>
                </div>
                
                {/* Action Buttons */}
                <div className="mt-4 flex space-x-2">
                  <button
                    onClick={() => openProductModal(product)}
                    className="flex-1 py-2 bg-gray-100 text-gray-800 rounded hover:bg-gray-200 transition-colors"
                  >
                    Details
                  </button>
                  <a
                    href={`https://tienda.bskmt.com/producto/${product.slug || generateSlug(product.name)}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className={`flex-1 py-2 text-center rounded transition-colors ${
                      product.availability === 'in-stock' ?
                      'bg-red-500 text-white hover:bg-red-600' :
                      'bg-gray-300 text-gray-500 cursor-not-allowed'
                    }`}
                  >
                    Buy Now
                  </a>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
      
      {/* Product Modal */}
      {isModalOpen && selectedProduct && (
        <div className="fixed inset-0 z-50 overflow-y-auto">
          <div className="flex items-center justify-center min-h-screen pt-4 px-4 pb-20 text-center sm:block sm:p-0">
            {/* Background overlay */}
            <div 
              className="fixed inset-0 transition-opacity" 
              aria-hidden="true"
              onClick={closeProductModal}
            >
              <div className="absolute inset-0 bg-gray-500 opacity-75"></div>
            </div>
            
            {/* Modal content */}
            <div className="inline-block align-bottom bg-white rounded-lg text-left overflow-hidden shadow-xl transform transition-all sm:my-8 sm:align-middle sm:max-w-4xl sm:w-full">
              <div className="bg-white px-4 pt-5 pb-4 sm:p-6 sm:pb-4">
                <div className="sm:flex sm:items-start">
                  {/* Product Images */}
                  <div className="w-full sm:w-1/2 mb-4 sm:mb-0 sm:pr-4">
                    <div className="h-64 sm:h-96 bg-gray-100 rounded-lg overflow-hidden mb-2">
                      <img
                        src={selectedProduct.featuredImage}
                        alt={selectedProduct.name}
                        className="w-full h-full object-cover"
                        onError={(e) => {
                          e.target.src = 'https://via.placeholder.com/600x600?text=Product+Image';
                        }}
                      />
                    </div>
                    <div className="grid grid-cols-3 gap-2">
                      {selectedProduct.gallery && selectedProduct.gallery.slice(0, 3).map((image, index) => (
                        <div key={index} className="h-24 bg-gray-100 rounded overflow-hidden">
                          <img
                            src={image}
                            alt={`${selectedProduct.name} ${index + 1}`}
                            className="w-full h-full object-cover"
                          />
                        </div>
                      ))}
                    </div>
                  </div>
                  
                  {/* Product Details */}
                  <div className="w-full sm:w-1/2">
                    <h3 className="text-2xl font-bold text-gray-900 mb-2">
                      {selectedProduct.name}
                    </h3>
                    <div className="flex items-center mb-4">
                      <span className="text-xl font-bold text-red-500 mr-4">
                        {formatPrice(selectedProduct.finalPrice)}
                      </span>
                      <span className={`text-sm px-2 py-1 rounded ${
                        selectedProduct.availability === 'in-stock' ? 
                        'bg-green-100 text-green-800' : 
                        'bg-red-100 text-red-800'
                      }`}>
                        {selectedProduct.availability === 'in-stock' ? 'In Stock' : 'Out of Stock'}
                      </span>
                    </div>
                    
                    <div className="mb-4">
                      <h4 className="font-semibold text-gray-800 mb-1">Description</h4>
                      <p className="text-gray-600">{selectedProduct.longDescription}</p>
                    </div>
                    
                    {selectedProduct.technicalSpecifications && (
                      <div className="mb-4">
                        <h4 className="font-semibold text-gray-800 mb-1">Technical Specifications</h4>
                        <ul className="text-gray-600">
                          {Object.entries(selectedProduct.technicalSpecifications).map(([key, value]) => (
                            <li key={key} className="flex">
                              <span className="font-medium w-32 capitalize">{key}:</span>
                              <span>{value}</span>
                            </li>
                          ))}
                        </ul>
                      </div>
                    )}
                    
                    {selectedProduct.features && (
                      <div className="mb-4">
                        <h4 className="font-semibold text-gray-800 mb-1">Features</h4>
                        <ul className="list-disc list-inside text-gray-600">
                          {selectedProduct.features.map((feature, index) => (
                            <li key={index}>{feature}</li>
                          ))}
                        </ul>
                      </div>
                    )}
                    
                    <div className="mt-6 flex space-x-3">
                      <a
                        href={`https://tienda.bskmt.com/producto/${selectedProduct.slug || generateSlug(selectedProduct.name)}`}
                        target="_blank"
                        rel="noopener noreferrer"
                        className={`flex-1 py-3 text-center rounded transition-colors ${
                          selectedProduct.availability === 'in-stock' ?
                          'bg-red-500 text-white hover:bg-red-600' :
                          'bg-gray-300 text-gray-500 cursor-not-allowed'
                        }`}
                      >
                        Buy Now
                      </a>
                      <button
                        onClick={closeProductModal}
                        className="flex-1 py-3 bg-gray-200 text-gray-800 rounded hover:bg-gray-300 transition-colors"
                      >
                        Close
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Store;