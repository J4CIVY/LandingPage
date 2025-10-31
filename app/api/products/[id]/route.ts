import { NextRequest } from 'next/server';
import { 
  withErrorHandling, 
  createSuccessResponse, 
  createErrorResponse,
  HTTP_STATUS 
} from '@/lib/api-utils';
import connectDB from '@/lib/mongodb';
import Product from '@/lib/models/Product';
import mongoose from 'mongoose';
import { requireCSRFToken } from '@/lib/csrf-protection';

/**
 * GET /api/products/[id]
 * Obtiene un producto específico por ID
 */
async function handleGet(request: NextRequest, context: RouteContext<'/api/products/[id]'>) {
  await connectDB();
  
  const { id } = await context.params;
  
  // Verificar que el ID es válido
  if (!mongoose.Types.ObjectId.isValid(id)) {
    return createErrorResponse(
      'ID de producto inválido',
      HTTP_STATUS.BAD_REQUEST
    );
  }
  
  const product = await Product.findById(id).exec();
  
  if (!product || !product.isActive) {
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
async function handlePut(request: NextRequest, context: RouteContext<'/api/products/[id]'>) {
  // 0. CSRF Protection
  const csrfError = requireCSRFToken(request);
  if (csrfError) return csrfError;

  await connectDB();
  
  const { id } = await context.params;
  
  // Verificar que el ID es válido
  if (!mongoose.Types.ObjectId.isValid(id)) {
    return createErrorResponse(
      'ID de producto inválido',
      HTTP_STATUS.BAD_REQUEST
    );
  }
  
  try {
    const updates = await request.json();
    
    // No permitir actualizar ciertos campos
    const forbiddenFields = ['_id', 'createdAt'];
    const hasForbidenField = Object.keys(updates).some(key => forbiddenFields.includes(key));
    
    if (hasForbidenField) {
      return createErrorResponse(
        'No se pueden actualizar campos protegidos',
        HTTP_STATUS.BAD_REQUEST
      );
    }

    // Si se está actualizando el nombre, verificar que no exista
    if (updates.name) {
      const existingProduct = await Product.findOne({ 
        name: updates.name, 
        _id: { $ne: id },
        isActive: true
      });
      
      if (existingProduct) {
        return createErrorResponse(
          'Ya existe otro producto con ese nombre',
          HTTP_STATUS.CONFLICT
        );
      }
    }

    // Actualizar producto
    const updatedProduct = await Product.findByIdAndUpdate(
      id,
      { ...updates, updatedAt: new Date() },
      { new: true, runValidators: true }
    );

    if (!updatedProduct || !updatedProduct.isActive) {
      return createErrorResponse(
        'Producto no encontrado',
        HTTP_STATUS.NOT_FOUND
      );
    }

    return createSuccessResponse(
      { product: updatedProduct },
      'Producto actualizado exitosamente'
    );

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
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

/**
 * DELETE /api/products/[id]
 * Elimina (desactiva) un producto específico
 */
async function handleDelete(request: NextRequest, context: RouteContext<'/api/products/[id]'>) {
  // 0. CSRF Protection
  const csrfError = requireCSRFToken(request);
  if (csrfError) return csrfError;

  await connectDB();
  
  const { id } = await context.params;
  
  // Verificar que el ID es válido
  if (!mongoose.Types.ObjectId.isValid(id)) {
    return createErrorResponse(
      'ID de producto inválido',
      HTTP_STATUS.BAD_REQUEST
    );
  }
  
  // En lugar de eliminar, desactivar el producto
  const updatedProduct = await Product.findByIdAndUpdate(
    id,
    { isActive: false, updatedAt: new Date() },
    { new: true }
  );

  if (!updatedProduct) {
    return createErrorResponse(
      'Producto no encontrado',
      HTTP_STATUS.NOT_FOUND
    );
  }

  return createSuccessResponse(
    { product: updatedProduct },
    'Producto eliminado exitosamente'
  );
}

// Handlers principales
export async function GET(request: NextRequest, context: RouteContext<'/api/products/[id]'>) {
  return withErrorHandling((req) => handleGet(req, context))(request);
}

export async function PUT(request: NextRequest, context: RouteContext<'/api/products/[id]'>) {
  return withErrorHandling((req) => handlePut(req, context))(request);
}

export async function DELETE(request: NextRequest, context: RouteContext<'/api/products/[id]'>) {
  return withErrorHandling((req) => handleDelete(req, context))(request);
}
