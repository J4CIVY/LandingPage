import { NextRequest } from 'next/server';
import { 
  withErrorHandling, 
  createSuccessResponse, 
  createErrorResponse,
  validateRequestBody,
  HTTP_STATUS 
} from '@/lib/api-utils';
import { db } from '@/lib/database';
import { updateProductSchema } from '@/lib/validation-schemas';

interface RouteParams {
  params: Promise<{
    id: string;
  }>;
}

/**
 * GET /api/products/[id]
 * Obtiene un producto específico por ID
 */
async function handleGet(request: NextRequest, { params }: RouteParams) {
  const { id } = await params;
  
  const product = db.getProductById(id);
  
  if (!product) {
    return createErrorResponse(
      'Producto no encontrado',
      HTTP_STATUS.NOT_FOUND
    );
  }

  return createSuccessResponse(
    { product },
    'Producto obtenido exitosamente'
  );
}

/**
 * PUT /api/products/[id]
 * Actualiza un producto específico
 */
async function handlePut(request: NextRequest, { params }: RouteParams) {
  const { id } = await params;
  
  const validation = await validateRequestBody(request, updateProductSchema);
  
  if (!validation.success) {
    return validation.response;
  }

  const updates = validation.data;
  
  // Verificar que el producto existe
  const existingProduct = db.getProductById(id);
  if (!existingProduct) {
    return createErrorResponse(
      'Producto no encontrado',
      HTTP_STATUS.NOT_FOUND
    );
  }

  // Si se actualiza el nombre, verificar que no exista otro producto con el mismo nombre
  if (updates.name) {
    const productWithSameName = db.getAllProducts().find(p => 
      p.id !== id && p.name.toLowerCase() === updates.name!.toLowerCase()
    );
    
    if (productWithSameName) {
      return createErrorResponse(
        'Ya existe un producto con este nombre',
        HTTP_STATUS.CONFLICT
      );
    }
  }

  // Actualizar slug si se cambia el nombre
  if (updates.name && !updates.slug) {
    updates.slug = updates.name
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, '-')
      .replace(/(^-|-$)/g, '');
  }

  const updatedProduct = db.updateProduct(id, updates);
  
  if (!updatedProduct) {
    return createErrorResponse(
      'Error al actualizar producto',
      HTTP_STATUS.INTERNAL_SERVER_ERROR
    );
  }

  return createSuccessResponse(
    { product: updatedProduct },
    'Producto actualizado exitosamente'
  );
}

/**
 * DELETE /api/products/[id]
 * Elimina un producto específico
 */
async function handleDelete(request: NextRequest, { params }: RouteParams) {
  const { id } = await params;
  
  const product = db.getProductById(id);
  if (!product) {
    return createErrorResponse(
      'Producto no encontrado',
      HTTP_STATUS.NOT_FOUND
    );
  }

  const deleted = db.deleteProduct(id);
  
  if (!deleted) {
    return createErrorResponse(
      'Error al eliminar producto',
      HTTP_STATUS.INTERNAL_SERVER_ERROR
    );
  }

  return createSuccessResponse(
    { message: 'Producto eliminado exitosamente' },
    'Producto eliminado exitosamente'
  );
}

// Handlers principales
export async function GET(request: NextRequest, context: RouteParams) {
  return withErrorHandling(handleGet)(request, context);
}

export async function PUT(request: NextRequest, context: RouteParams) {
  return withErrorHandling(handlePut)(request, context);
}

export async function DELETE(request: NextRequest, context: RouteParams) {
  return withErrorHandling(handleDelete)(request, context);
}
