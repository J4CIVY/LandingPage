import React, { useState, useEffect, useCallback } from 'react';
import axios from 'axios';

/**
 * @typedef {Object} Product
 * @property {string} id - Unique identifier for the product.
 * @property {string} name - Name of the product.
 * @property {string} shortDescription - Short description of the product.
 * @property {string} longDescription - Long description of the product.
 * @property {number} finalPrice - Final price of the product.
 * @property {string} availability - Availability status ('in-stock', 'out-of-stock').
 * @property {string} featuredImage - URL of the featured image.
 * @property {string[]} gallery - Array of gallery image URLs.
 * @property {boolean} newProduct - Indicates if it's a new product.
 * @property {string} category - Category of the product.
 * @property {Object.<string, string>} technicalSpecifications - Technical specifications as key-value pairs.
 * @property {string[]} features - List of features.
 * @property {string} [slug] - URL-friendly slug for the product.
 */
interface Product {
  id: string;
  name: string;
  shortDescription: string;
  longDescription: string;
  finalPrice: number;
  availability: 'in-stock' | 'out-of-stock';
  featuredImage: string;
  gallery?: string[];
  newProduct: boolean;
  category: string;
  technicalSpecifications?: { [key: string]: string };
  features?: string[];
  slug?: string;
}

/**
 * @typedef {Object} ProductsApiResponse
 * @property {string} status - Status of the API response (e.g., 'success').
 * @property {Object} data - Data payload.
 * @property {Product[]} data.products - Array of products.
 */
interface ProductsApiResponse {
  status: string;
  data: {
    products: Product[];
  };
}

/**
 * Store component displays a list of products with filtering, searching, and a product modal.
 * @returns {JSX.Element}
 */
const Store: React.FC = () => {
  // State for products, loading, and error handling
  const [products, setProducts] = useState<Product[]>([]);
  const [filteredProducts, setFilteredProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  // State for search and filters
  const [searchTerm, setSearchTerm] = useState<string>('');
  const [categoryFilter, setCategoryFilter] = useState<string>('all');
  const [availabilityFilter, setAvailabilityFilter] = useState<string>('all');
  const [priceRange, setPriceRange] = useState<[number, number]>([0, 200000]);

  // State for modal
  const [selectedProduct, setSelectedProduct] = useState<Product | null>(null);
  const [isModalOpen, setIsModalOpen] = useState<boolean>(false);

  // Fetch products from API
  useEffect(() => {
    const fetchProducts = async () => {
      try {
        const response = await axios.get<ProductsApiResponse>('https://api.bskmt.com/products');
        // Validate response structure and data before setting state
        if (response.data && response.data.status === 'success' && Array.isArray(response.data.data.products)) {
          setProducts(response.data.data.products);
          setFilteredProducts(response.data.data.products); // Initialize filtered products with all products
        } else {
          // More specific error message for API response issues
          throw new Error('Invalid API response structure or data.');
        }
      } catch (err: any) { // Use 'any' for error type as Axios errors can be complex
        // Log the full error for debugging, but show a user-friendly message
        console.error("Failed to fetch products:", err);
        setError('Failed to load products. Please try again later.');
      } finally {
        setLoading(false);
      }
    };

    fetchProducts();
  }, []); // Empty dependency array means this runs once on mount

  /**
   * Generates a URL-friendly slug from a product name.
   * This function is memoized using useCallback.
   * @param {string} name - The product name.
   * @returns {string} The generated slug.
   */
  const generateSlug = useCallback((name: string): string => {
    return name
      .toLowerCase()
      .replace(/[^\w\s-]/gi, '') // Allow hyphens, remove other non-word chars
      .replace(/\s+/g, '-')
      .replace(/--+/g, '-'); // Replace multiple hyphens with a single one
  }, []);

  /**
   * Formats a number as a currency string in COP.
   * This function is memoized using useCallback.
   * @param {number} price - The price to format.
   * @returns {string} The formatted price string.
   */
  const formatPrice = useCallback((price: number): string => {
    // Ensure price is a number before formatting
    if (typeof price !== 'number') {
      console.warn('Invalid price type for formatting:', price);
      return 'N/A'; // Or handle as appropriate
    }
    return new Intl.NumberFormat('es-CO', {
      style: 'currency',
      currency: 'COP',
      minimumFractionDigits: 0
    }).format(price);
  }, []);

  /**
   * Applies filters to the product list based on current filter states.
   * This function is memoized using useCallback.
   */
  const applyFilters = useCallback(() => {
    let result: Product[] = [...products]; // Start with the original products array

    // Apply search filter
    if (searchTerm) {
      result = result.filter(product =>
        product.name.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }

    // Apply category filter
    if (categoryFilter !== 'all') {
      result = result.filter(product =>
        // Ensure product.category exists before comparing
        product.category && product.category.toLowerCase() === categoryFilter.toLowerCase()
      );
    }

    // Apply availability filter
    if (availabilityFilter !== 'all') {
      result = result.filter(product =>
        // Ensure product.availability exists before comparing
        availabilityFilter === 'in-stock' ?
          product.availability === 'in-stock' :
          product.availability !== 'in-stock'
      );
    }

    // Apply price range filter
    result = result.filter(product =>
      // Ensure product.finalPrice is a number
      typeof product.finalPrice === 'number' &&
      product.finalPrice >= priceRange[0] &&
      product.finalPrice <= priceRange[1]
    );

    setFilteredProducts(result);
  }, [searchTerm, categoryFilter, availabilityFilter, priceRange, products]); // Dependencies for applyFilters

  useEffect(() => {
    applyFilters(); // Call the memoized filter function
  }, [applyFilters]); // Dependency array for useEffect

  /**
   * Opens the product modal with the selected product.
   * This function is memoized using useCallback.
   * @param {Product} product - The product to display in the modal.
   */
  const openProductModal = useCallback((product: Product): void => {
    setSelectedProduct(product);
    setIsModalOpen(true);
    document.body.style.overflow = 'hidden'; // Prevent scrolling when modal is open
  }, []); // No dependencies, as it only sets state based on passed product

  /**
   * Closes the product modal.
   * This function is memoized using useCallback.
   */
  const closeProductModal = useCallback((): void => {
    setIsModalOpen(false);
    setSelectedProduct(null); // Clear selected product when closing modal
    document.body.style.overflow = 'auto'; // Re-enable scrolling
  }, []); // No dependencies

  // Get unique categories from products
  // Memoize categories to prevent re-calculation on every render if products don't change
  const categories: string[] = React.useMemo(() => {
    const uniqueCategories = new Set(products.map(product => product.category).filter(Boolean));
    return ['all', ...Array.from(uniqueCategories)];
  }, [products]);

  if (loading) {
    return (
      <div className="flex justify-center items-center min-h-screen">
        <div className="animate-spin rounded-full h-16 w-16 border-t-4 border-b-4 border-red-500"></div>
        <p className="ml-4 text-lg text-gray-700">Loading products...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="text-center py-10">
        <h2 className="text-2xl font-bold text-red-500 mb-4">Error loading products</h2>
        <p className="text-gray-600">{error}</p>
        <button
          onClick={() => window.location.reload()} // Simple reload to retry fetching
          className="mt-4 px-6 py-2 bg-blue-500 text-white rounded-md hover:bg-blue-600 transition-colors"
        >
          Retry
        </button>
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
              onChange={(e: React.ChangeEvent<HTMLInputElement>) => setSearchTerm(e.target.value)}
              aria-label="Search products by name"
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
              onChange={(e: React.ChangeEvent<HTMLSelectElement>) => setCategoryFilter(e.target.value)}
              aria-label="Filter products by category"
            >
              {categories.map(category => (
                <option key={category} value={category}>
                  {category === 'all' ? 'All Categories' : category.charAt(0).toUpperCase() + category.slice(1)}
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
              onChange={(e: React.ChangeEvent<HTMLSelectElement>) => setAvailabilityFilter(e.target.value)}
              aria-label="Filter products by availability"
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
              onChange={(e: React.ChangeEvent<HTMLInputElement>) => setPriceRange([parseInt(e.target.value, 10), priceRange[1]])}
              className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer"
              aria-label="Minimum price"
            />
            <input
              type="range"
              min="0"
              max="200000"
              step="10000"
              value={priceRange[1]}
              onChange={(e: React.ChangeEvent<HTMLInputElement>) => setPriceRange([priceRange[0], parseInt(e.target.value, 10)])}
              className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer"
              aria-label="Maximum price"
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
            aria-label="Reset all filters"
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
              role="listitem"
            >
              {/* Product Image */}
              <div
                className="h-64 bg-gray-100 relative overflow-hidden cursor-pointer"
                onClick={() => openProductModal(product)}
                onKeyPress={(e: React.KeyboardEvent<HTMLDivElement>) => {
                  if (e.key === 'Enter' || e.key === ' ') {
                    openProductModal(product);
                  }
                }}
                tabIndex={0}
                role="button"
                aria-label={`View details for ${product.name}`}
              >
                <img
                  src={product.featuredImage}
                  alt={product.name}
                  className="w-full h-full object-cover hover:scale-105 transition-transform duration-300"
                  onError={(e: React.SyntheticEvent<HTMLImageElement, Event>) => {
                    // Fallback image for broken links
                    e.currentTarget.src = 'https://via.placeholder.com/300x300?text=Image+Not+Available';
                    e.currentTarget.alt = 'Image not available'; // Update alt text for fallback
                  }}
                  loading="lazy"
                  crossorigin="anonymous"
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
                  onKeyPress={(e: React.KeyboardEvent<HTMLHeadingElement>) => {
                    if (e.key === 'Enter' || e.key === ' ') {
                      openProductModal(product);
                    }
                  }}
                  tabIndex={0}
                  role="button"
                  aria-label={`View details for ${product.name}`}
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
                  <span className={`text-xs px-2 py-1 rounded ${product.availability === 'in-stock' ?
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
                    aria-label={`Open details for ${product.name}`}
                  >
                    Details
                  </button>
                  <a
                    href={`https://tienda.bskmt.com/producto/${product.slug || generateSlug(product.name)}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className={`flex-1 py-2 text-center rounded transition-colors ${product.availability === 'in-stock' ?
                      'bg-red-500 text-white hover:bg-red-600' :
                      'bg-gray-300 text-gray-500 cursor-not-allowed'
                      }`}
                    aria-disabled={product.availability !== 'in-stock'}
                    tabIndex={product.availability !== 'in-stock' ? -1 : 0}
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
        <>
          {/* Background overlay */}
          <div
            className="fixed inset-0 bg-gray-500 bg-opacity-75 transition-opacity z-40"
            onClick={closeProductModal}
          ></div>

          {/* Modal content */}
          <div
            className="fixed inset-0 z-50 overflow-y-auto"
            role="dialog"
            aria-modal="true"
            aria-labelledby="product-modal-title"
          >
            <div className="flex items-center justify-center min-h-screen pt-4 px-4 pb-20 text-center sm:block sm:p-0">
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
                          onError={(e: React.SyntheticEvent<HTMLImageElement, Event>) => {
                            e.currentTarget.src = 'https://via.placeholder.com/600x600?text=Image+Not+Available';
                            e.currentTarget.alt = 'Image not available';
                          }}
                          crossorigin="anonymous"
                        />
                      </div>
                      <div className="grid grid-cols-3 gap-2">
                        {selectedProduct.gallery && Array.isArray(selectedProduct.gallery) && selectedProduct.gallery.slice(0, 3).map((image, index) => (
                          <div key={index} className="h-24 bg-gray-100 rounded overflow-hidden">
                            <img
                              src={image}
                              alt={`${selectedProduct.name} thumbnail ${index + 1}`}
                              className="w-full h-full object-cover"
                              onError={(e: React.SyntheticEvent<HTMLImageElement, Event>) => {
                                e.currentTarget.src = 'https://via.placeholder.com/100x100?text=Thumb';
                                e.currentTarget.alt = 'Thumbnail not available';
                              }}
                              crossorigin="anonymous"
                            />
                          </div>
                        ))}
                      </div>
                    </div>

                    {/* Product Details */}
                    <div className="w-full sm:w-1/2">
                      <h3 id="product-modal-title" className="text-2xl font-bold text-gray-900 mb-2">
                        {selectedProduct.name}
                      </h3>
                      <div className="flex items-center mb-4">
                        <span className="text-xl font-bold text-red-500 mr-4">
                          {formatPrice(selectedProduct.finalPrice)}
                        </span>
                        <span className={`text-sm px-2 py-1 rounded ${selectedProduct.availability === 'in-stock' ?
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

                      {selectedProduct.technicalSpecifications && Object.keys(selectedProduct.technicalSpecifications).length > 0 && (
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

                      {selectedProduct.features && Array.isArray(selectedProduct.features) && selectedProduct.features.length > 0 && (
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
                          className={`flex-1 py-3 text-center rounded transition-colors ${selectedProduct.availability === 'in-stock' ?
                              'bg-red-500 text-white hover:bg-red-600' :
                              'bg-gray-300 text-gray-500 cursor-not-allowed'
                            }`}
                          aria-disabled={selectedProduct.availability !== 'in-stock'}
                          tabIndex={selectedProduct.availability !== 'in-stock' ? -1 : 0}
                        >
                          Buy Now
                        </a>
                        <button
                          onClick={closeProductModal}
                          className="flex-1 py-3 bg-gray-200 text-gray-800 rounded hover:bg-gray-300 transition-colors"
                          aria-label="Close product details modal"
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
        </>
      )}
    </div>
  );
};

export default Store;