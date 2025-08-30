import mongoose, { Schema, Document } from 'mongoose';

export interface IProduct extends Document {
  name: string;
  shortDescription: string;
  longDescription: string;
  finalPrice: number;
  originalPrice?: number;
  availability: 'in-stock' | 'out-of-stock';
  featuredImage: string;
  gallery?: string[];
  newProduct: boolean;
  category: string;
  technicalSpecifications?: Map<string, string>;
  features?: string[];
  slug?: string;
  sku?: string;
  stockQuantity?: number;
  minStockAlert?: number;
  weight?: number;
  dimensions?: {
    length: number;
    width: number;
    height: number;
  };
  tags?: string[];
  isActive: boolean;
  createdAt: Date;
  updatedAt: Date;
}

const ProductSchema = new Schema<IProduct>({
  name: { type: String, required: true, trim: true },
  shortDescription: { type: String, required: true, maxlength: 200 },
  longDescription: { type: String, required: true, maxlength: 2000 },
  finalPrice: { type: Number, required: true, min: 0 },
  originalPrice: { type: Number, min: 0 },
  availability: { 
    type: String, 
    enum: ['in-stock', 'out-of-stock'],
    default: 'in-stock'
  },
  featuredImage: { type: String, required: true },
  gallery: [{ type: String }],
  newProduct: { type: Boolean, default: false },
  category: { type: String, required: true, trim: true },
  technicalSpecifications: {
    type: Map,
    of: String
  },
  features: [{ type: String, maxlength: 100 }],
  slug: { type: String, unique: true, sparse: true },
  sku: { type: String, unique: true, sparse: true },
  stockQuantity: { type: Number, default: 0, min: 0 },
  minStockAlert: { type: Number, default: 5, min: 0 },
  weight: { type: Number, min: 0 },
  dimensions: {
    length: { type: Number, min: 0 },
    width: { type: Number, min: 0 },
    height: { type: Number, min: 0 }
  },
  tags: [{ type: String, trim: true }],
  isActive: { type: Boolean, default: true }
}, {
  timestamps: true,
  collection: 'products'
});

// Índices para optimizar consultas
ProductSchema.index({ name: 'text', shortDescription: 'text', category: 'text' });
ProductSchema.index({ category: 1 });
ProductSchema.index({ availability: 1 });
ProductSchema.index({ finalPrice: 1 });
ProductSchema.index({ newProduct: 1 });
ProductSchema.index({ isActive: 1 });
ProductSchema.index({ slug: 1 });

// Middleware para generar slug automáticamente
ProductSchema.pre('save', function(next) {
  if (!this.slug || this.isModified('name')) {
    this.slug = this.name
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, '-')
      .replace(/(^-|-$)/g, '');
  }
  
  // Generar SKU si no existe
  if (!this.sku) {
    const categoryCode = this.category.substring(0, 3).toUpperCase();
    const randomCode = Math.random().toString(36).substring(2, 8).toUpperCase();
    this.sku = `${categoryCode}-${randomCode}`;
  }
  
  // Actualizar disponibilidad basada en stock
  if (this.stockQuantity !== undefined) {
    this.availability = this.stockQuantity > 0 ? 'in-stock' : 'out-of-stock';
  }
  
  next();
});

// Método virtual para calcular descuento
ProductSchema.virtual('discountPercentage').get(function() {
  if (this.originalPrice && this.originalPrice > this.finalPrice) {
    return Math.round(((this.originalPrice - this.finalPrice) / this.originalPrice) * 100);
  }
  return 0;
});

// Método virtual para verificar stock bajo
ProductSchema.virtual('isLowStock').get(function() {
  return this.stockQuantity !== undefined && 
         this.minStockAlert !== undefined && 
         this.stockQuantity <= this.minStockAlert;
});

export default mongoose.models.Product || mongoose.model<IProduct>('Product', ProductSchema);
