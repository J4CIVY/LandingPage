import { NextRequest, NextResponse } from 'next/server';
import { requireAdmin, AdminRequest } from '@/lib/auth-admin';
import { requireCSRFToken } from '@/lib/csrf-protection';
import connectDB from '@/lib/mongodb';
import Product from '@/lib/models/Product';

export async function GET(req: NextRequest) {
  const adminRequest = req as AdminRequest;
  
  // Verifica permisos de administrador
  const authCheck = await requireAdmin(adminRequest);
  if (authCheck) return authCheck;

  try {
    await connectDB();

    const { searchParams } = new URL(req.url);
    const page = parseInt(searchParams.get('page') || '1');
    const limit = parseInt(searchParams.get('limit') || '10');
    const search = searchParams.get('search') || '';
    const category = searchParams.get('category') || 'all';
    const status = searchParams.get('status') || 'all';

  // Construye filtros
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const filters: any = {};

    if (search) {
      filters.$or = [
        { name: { $regex: search, $options: 'i' } },
        { shortDescription: { $regex: search, $options: 'i' } },
        { category: { $regex: search, $options: 'i' } },
        { sku: { $regex: search, $options: 'i' } }
      ];
    }

    if (category !== 'all') {
      filters.category = category;
    }

    if (status !== 'all') {
      switch (status) {
        case 'active':
          filters.isActive = true;
          break;
        case 'inactive':
          filters.isActive = false;
          break;
        case 'in-stock':
          filters.availability = 'in-stock';
          break;
        case 'out-of-stock':
          filters.availability = 'out-of-stock';
          break;
        case 'new':
          filters.newProduct = true;
          break;
        case 'low-stock':
          filters.$expr = { $lte: ['$stockQuantity', '$minStockAlert'] };
          break;
      }
    }

  // Cuenta total de productos
    const totalProducts = await Product.countDocuments(filters);
    const totalPages = Math.ceil(totalProducts / limit);

  // Obtiene productos con paginación
    const products = await Product.find(filters)
      .sort({ createdAt: -1 })
      .skip((page - 1) * limit)
      .limit(limit);

    return NextResponse.json({
      success: true,
      products,
      pagination: {
        currentPage: page,
        totalPages,
        totalProducts,
        limit
      }
    });

  } catch (error) {
    console.error('Error obteniendo productos:', error);
    return NextResponse.json(
      { success: false, error: 'Error interno del servidor' },
      { status: 500 }
    );
  }
}

export async function POST(req: NextRequest) {
  const adminRequest = req as AdminRequest;
  
  // SECURITY: CSRF Protection
  const csrfError = requireCSRFToken(adminRequest);
  if (csrfError) return csrfError;
  
  // Verifica permisos de administrador
  const authCheck = await requireAdmin(adminRequest);
  if (authCheck) return authCheck;

  try {
    await connectDB();
    const productData = await req.json();

  // Valida datos requeridos
    const requiredFields = ['name', 'shortDescription', 'longDescription', 'finalPrice', 'featuredImage', 'category'];

    for (const field of requiredFields) {
      if (!productData[field]) {
        return NextResponse.json(
          { success: false, error: `El campo ${field} es requerido` },
          { status: 400 }
        );
      }
    }

  // Valida precio
    if (productData.finalPrice <= 0) {
      return NextResponse.json(
        { success: false, error: 'El precio debe ser mayor a 0' },
        { status: 400 }
      );
    }

  // Valida precio original si existe
    if (productData.originalPrice && productData.originalPrice < productData.finalPrice) {
      return NextResponse.json(
        { success: false, error: 'El precio original debe ser mayor al precio final' },
        { status: 400 }
      );
    }

  // Crea nuevo producto
    const newProduct = new Product({
      ...productData,
      isActive: true
    });

    await newProduct.save();

    return NextResponse.json({
      success: true,
      message: 'Producto creado exitosamente',
      product: newProduct
    }, { status: 201 });

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  } catch (error: any) {
    console.error('Error creando producto:', error);
    
  // Maneja errores de validación de mongoose
    if (error.name === 'ValidationError') {
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const validationErrors = Object.values(error.errors).map((err: any) => err.message);
      return NextResponse.json(
        { success: false, error: 'Error de validación', details: validationErrors },
        { status: 400 }
      );
    }
    
  // Maneja duplicados
    if (error.code === 11000) {
      const field = Object.keys(error.keyPattern)[0];
      return NextResponse.json(
        { success: false, error: `Ya existe un producto con ese ${field}` },
        { status: 400 }
      );
    }

    return NextResponse.json(
      { success: false, error: 'Error interno del servidor' },
      { status: 500 }
    );
  }
}
