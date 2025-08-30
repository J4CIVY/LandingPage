import { NextRequest } from 'next/server';
import { 
  withErrorHandling, 
  createSuccessResponse,
  getQueryParams
} from '@/lib/api-utils';
import { db } from '@/lib/database';

/**
 * GET /api/products/featured
 * Obtiene productos destacados para la página principal
 */
async function handleGet(request: NextRequest) {
  const queryParams = getQueryParams(request);
  const limit = parseInt(queryParams.limit || '6', 10);
  
  const featuredProducts = db.getFeaturedProducts(limit);
  
  return createSuccessResponse({
    products: featuredProducts,
    total: featuredProducts.length
  }, 'Productos destacados obtenidos exitosamente');
}

export async function GET(request: NextRequest) {
  return withErrorHandling(handleGet)(request);
}
