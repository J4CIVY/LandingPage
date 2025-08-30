import { NextRequest } from 'next/server';
import { 
  withErrorHandling, 
  createSuccessResponse, 
  createErrorResponse,
  validateRequestBody,
  getQueryParams,
  HTTP_STATUS 
} from '@/lib/api-utils';
import connectDB from '@/lib/mongodb';
import Product from '@/lib/models/Product';
import { productSchema, productFiltersSchema, paginationSchema } from '@/lib/validation-schemas';

/**
 * GET /api/products
 * Obtiene productos con filtros y paginación
 */
async function handleGet(request: NextRequest) {
  await connectDB();
  
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
  
  // Construir filtros de MongoDB
  const mongoFilters: any = { isActive: true };
  
  if (filters.category) {
    mongoFilters.category = { $regex: filters.category, $options: 'i' };
  }
  
  if (filters.minPrice || filters.maxPrice) {
    mongoFilters.price = {};
    if (filters.minPrice) mongoFilters.price.$gte = filters.minPrice;
    if (filters.maxPrice) mongoFilters.price.$lte = filters.maxPrice;
  }
  
  if (filters.availability && filters.availability !== 'all') {
    mongoFilters.inStock = filters.availability === 'in-stock';
  }
  
  if (filters.search) {
    mongoFilters.$or = [
      { name: { $regex: filters.search, $options: 'i' } },
      { description: { $regex: filters.search, $options: 'i' } }
    ];
  }
  
  if (filters.newOnly) {
    // Productos creados en los últimos 30 días
    const thirtyDaysAgo = new Date();
    thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);
    mongoFilters.createdAt = { $gte: thirtyDaysAgo };
  }
  
  // Calcular skip para paginación
  const skip = (page - 1) * limit;
  
  // Obtener productos con paginación
  const products = await Product.find(mongoFilters)
    .sort({ createdAt: -1 })
    .skip(skip)
    .limit(limit)
    .exec();
  
  const totalProducts = await Product.countDocuments(mongoFilters);
  
  return createSuccessResponse({
    products,
    pagination: {
      page,
      limit,
      total: totalProducts,
      pages: Math.ceil(totalProducts / limit)
    }
  }, 'Productos obtenidos exitosamente');
}

/**
 * POST /api/products
 * Crea un nuevo producto
 */
async function handlePost(request: NextRequest) {
  await connectDB();
  
  const body = await request.json();
  
  // Validar datos del producto
  const validation = productSchema.safeParse(body);
  if (!validation.success) {
    return createErrorResponse(
      `Datos inválidos: ${validation.error.issues.map(e => e.message).join(', ')}`,
      HTTP_STATUS.BAD_REQUEST
    );
  }
  
  const productData = validation.data;
  
  try {
    // Verificar si ya existe un producto con el mismo nombre
    const existingProduct = await Product.findOne({ 
      name: productData.name,
      isActive: true 
    });
    
    if (existingProduct) {
      return createErrorResponse(
        'Ya existe un producto con ese nombre',
        HTTP_STATUS.CONFLICT
      );
    }
    
    // Crear nuevo producto
    const newProduct = new Product(productData);
    await newProduct.save();
    
    return createSuccessResponse(
      newProduct,
      'Producto creado exitosamente',
      HTTP_STATUS.CREATED
    );
    
  } catch (error: any) {
    if (error.name === 'ValidationError') {
      return createErrorResponse(
        `Error de validación: ${error.message}`,
        HTTP_STATUS.BAD_REQUEST
      );
    }
    
    throw error;
  }
}

// Handlers principales
export async function GET(request: NextRequest) {
  return withErrorHandling(handleGet)(request);
}

export async function POST(request: NextRequest) {
  return withErrorHandling(handlePost)(request);
}
