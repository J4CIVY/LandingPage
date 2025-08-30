import { NextRequest } from 'next/server';
import { 
  withErrorHandling, 
  createSuccessResponse, 
  createErrorResponse,
  validateRequestBody,
  getQueryParams,
  HTTP_STATUS 
} from '@/lib/api-utils';
import { db } from '@/lib/database';
import { productSchema, productFiltersSchema, paginationSchema } from '@/lib/validation-schemas';

/**
 * GET /api/products
 * Obtiene productos con filtros y paginación
 */
async function handleGet(request: NextRequest) {
  const queryParams = getQueryParams(request);
  
  // Validar parámetros de paginación
  const paginationResult = paginationSchema.safeParse(queryParams);
  if (!paginationResult.success) {
    return createErrorResponse(
      'Parámetros de paginación inválidos',
      HTTP_STATUS.BAD_REQUEST
    );
  }
  
  // Validar filtros
  const filtersResult = productFiltersSchema.safeParse(queryParams);
  if (!filtersResult.success) {
    return createErrorResponse(
      'Parámetros de filtro inválidos',
      HTTP_STATUS.BAD_REQUEST
    );
  }
  
  const { page, limit } = paginationResult.data;
  const filters = filtersResult.data;
  
  // Obtener todos los productos
  let products = db.getAllProducts();
  
  // Aplicar filtros
  if (filters.category) {
    products = products.filter(product => 
      product.category.toLowerCase().includes(filters.category!.toLowerCase())
    );
  }
  
  if (filters.availability && filters.availability !== 'all') {
    products = products.filter(product => product.availability === filters.availability);
  }
  
  if (filters.search) {
    const searchTerm = filters.search.toLowerCase();
    products = products.filter(product =>
      product.name.toLowerCase().includes(searchTerm) ||
      product.shortDescription.toLowerCase().includes(searchTerm) ||
      product.category.toLowerCase().includes(searchTerm)
    );
  }
  
  if (filters.minPrice !== undefined) {
    products = products.filter(product => product.finalPrice >= filters.minPrice!);
  }
  
  if (filters.maxPrice !== undefined) {
    products = products.filter(product => product.finalPrice <= filters.maxPrice!);
  }
  
  if (filters.newOnly) {
    products = products.filter(product => product.newProduct === true);
  }
  
  // Aplicar paginación
  const total = products.length;
  const startIndex = (page - 1) * limit;
  const endIndex = startIndex + limit;
  const paginatedProducts = products.slice(startIndex, endIndex);
  
  const totalPages = Math.ceil(total / limit);
  
  return createSuccessResponse({
    products: paginatedProducts,
    pagination: {
      currentPage: page,
      totalPages,
      totalItems: total,
      itemsPerPage: limit,
      hasNextPage: page < totalPages,
      hasPreviousPage: page > 1
    },
    filters: filters
  }, 'Productos obtenidos exitosamente');
}

/**
 * POST /api/products
 * Crea un nuevo producto
 */
async function handlePost(request: NextRequest) {
  const validation = await validateRequestBody(request, productSchema);
  
  if (!validation.success) {
    return validation.response;
  }

  const productData = validation.data;
  
  // Verificar si ya existe un producto con el mismo nombre
  const existingProduct = db.getAllProducts().find(p => 
    p.name.toLowerCase() === productData.name.toLowerCase()
  );
  
  if (existingProduct) {
    return createErrorResponse(
      'Ya existe un producto con este nombre',
      HTTP_STATUS.CONFLICT
    );
  }
  
  // Crear slug si no se proporciona
  if (!productData.slug) {
    productData.slug = productData.name
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, '-')
      .replace(/(^-|-$)/g, '');
  }
  
  const newProduct = db.createProduct(productData);
  
  return createSuccessResponse(
    { product: newProduct },
    'Producto creado exitosamente',
    HTTP_STATUS.CREATED
  );
}

// Handlers principales
export async function GET(request: NextRequest) {
  return withErrorHandling(handleGet)(request);
}

export async function POST(request: NextRequest) {
  return withErrorHandling(handlePost)(request);
}
