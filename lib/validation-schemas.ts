import { z } from 'zod';

// Esquema para emergencias SOS
export const emergencyRequestSchema = z.object({
  name: z.string().min(1, 'Nombre requerido').max(100, 'Nombre demasiado largo'),
  memberId: z.string().min(1, 'ID de miembro requerido'),
  emergencyType: z.enum(['mechanical', 'medical', 'accident', 'breakdown', 'other'], {
    message: 'Tipo de emergencia inválido'
  }),
  description: z.string().min(10, 'Descripción debe tener al menos 10 caracteres').max(500, 'Descripción demasiado larga'),
  location: z.string().min(5, 'Ubicación requerida').max(200, 'Ubicación demasiado larga'),
  contactPhone: z.string().min(10, 'Teléfono debe tener al menos 10 dígitos').max(15, 'Teléfono demasiado largo'),
  coordinates: z.object({
    lat: z.number().min(-90).max(90),
    lng: z.number().min(-180).max(180)
  }).optional(),
  priority: z.enum(['low', 'medium', 'high', 'critical']).default('medium')
});

export type EmergencyRequestInput = z.infer<typeof emergencyRequestSchema>;

// Esquema para actualizar emergencias
export const updateEmergencySchema = z.object({
  status: z.enum(['pending', 'in-progress', 'resolved', 'cancelled']).optional(),
  priority: z.enum(['low', 'medium', 'high', 'critical']).optional(),
  assignedTo: z.string().optional(),
  resolution: z.string().max(500, 'Resolución demasiado larga').optional()
});

export type UpdateEmergencyInput = z.infer<typeof updateEmergencySchema>;

// Esquema para aplicaciones de membresía
export const membershipApplicationSchema = z.object({
  name: z.string().min(1, 'Nombre requerido').max(100, 'Nombre demasiado largo'),
  email: z.string().email('Email inválido'),
  phone: z.string().min(10, 'Teléfono debe tener al menos 10 dígitos').max(15, 'Teléfono demasiado largo'),
  membershipType: z.enum(['friend', 'rider', 'rider-duo', 'pro', 'pro-duo'], {
    message: 'Tipo de membresía inválido'
  }),
  message: z.string().max(500, 'Mensaje demasiado largo').optional()
});

export type MembershipApplicationInput = z.infer<typeof membershipApplicationSchema>;

// Esquema para mensajes de contacto
export const contactMessageSchema = z.object({
  name: z.string().min(1, 'Nombre requerido').max(100, 'Nombre demasiado largo'),
  email: z.string().email('Email inválido'),
  phone: z.string().min(10, 'Teléfono debe tener al menos 10 dígitos').max(15, 'Teléfono demasiado largo').optional(),
  subject: z.string().min(1, 'Asunto requerido').max(200, 'Asunto demasiado largo'),
  message: z.string().min(10, 'Mensaje debe tener al menos 10 caracteres').max(1000, 'Mensaje demasiado largo'),
  type: z.enum(['general', 'membership', 'technical', 'complaint', 'suggestion']).default('general')
});

export type ContactMessageInput = z.infer<typeof contactMessageSchema>;

// Esquema para productos
export const productSchema = z.object({
  name: z.string().min(1, 'Nombre requerido').max(100, 'Nombre demasiado largo'),
  shortDescription: z.string().min(10, 'Descripción corta requerida').max(200, 'Descripción corta demasiado larga'),
  longDescription: z.string().min(50, 'Descripción larga requerida').max(1000, 'Descripción larga demasiado larga'),
  finalPrice: z.number().min(0, 'El precio debe ser positivo'),
  availability: z.enum(['in-stock', 'out-of-stock']).default('in-stock'),
  featuredImage: z.string().url('URL de imagen inválida'),
  gallery: z.array(z.string().url('URL de imagen inválida')).optional(),
  newProduct: z.boolean().default(false),
  category: z.string().min(1, 'Categoría requerida').max(50, 'Categoría demasiado larga'),
  technicalSpecifications: z.record(z.string(), z.string()).optional(),
  features: z.array(z.string().max(100, 'Característica demasiado larga')).optional(),
  slug: z.string().optional()
});

export type ProductInput = z.infer<typeof productSchema>;

// Esquema para actualizar productos
export const updateProductSchema = productSchema.partial();

export type UpdateProductInput = z.infer<typeof updateProductSchema>;

// Esquema para eventos
export const eventSchema = z.object({
  name: z.string().min(1, 'Nombre requerido').max(100, 'Nombre demasiado largo'),
  startDate: z.string().datetime('Fecha inválida'),
  description: z.string().min(10, 'Descripción requerida').max(500, 'Descripción demasiado larga'),
  mainImage: z.string().url('URL de imagen inválida'),
  eventType: z.string().min(1, 'Tipo de evento requerido').max(50, 'Tipo de evento demasiado largo'),
  departureLocation: z.object({
    address: z.string().min(1, 'Dirección requerida').max(200, 'Dirección demasiado larga'),
    city: z.string().min(1, 'Ciudad requerida').max(100, 'Ciudad demasiado larga'),
    country: z.string().min(1, 'País requerido').max(100, 'País demasiado largo')
  }).optional()
});

export type EventInput = z.infer<typeof eventSchema>;

// Esquema para actualizar eventos
export const updateEventSchema = eventSchema.partial();

export type UpdateEventInput = z.infer<typeof updateEventSchema>;

// Esquemas para parámetros de consulta
export const paginationSchema = z.object({
  page: z.string().default('1').transform(val => parseInt(val, 10)).refine(val => val > 0, 'La página debe ser mayor a 0'),
  limit: z.string().default('10').transform(val => parseInt(val, 10)).refine(val => val > 0 && val <= 100, 'El límite debe estar entre 1 y 100')
});

export type PaginationInput = z.infer<typeof paginationSchema>;

export const productFiltersSchema = z.object({
  category: z.string().optional(),
  availability: z.enum(['in-stock', 'out-of-stock', 'all']).default('all'),
  minPrice: z.string().transform(val => parseFloat(val)).refine(val => val >= 0, 'El precio mínimo debe ser positivo').optional(),
  maxPrice: z.string().transform(val => parseFloat(val)).refine(val => val >= 0, 'El precio máximo debe ser positivo').optional(),
  search: z.string().max(100, 'Búsqueda demasiado larga').optional(),
  newOnly: z.string().transform(val => val === 'true').optional()
});

export type ProductFiltersInput = z.infer<typeof productFiltersSchema>;

export const eventFiltersSchema = z.object({
  eventType: z.string().optional(),
  upcoming: z.string().default('true').transform(val => val === 'true'),
  search: z.string().max(100, 'Búsqueda demasiado larga').optional()
});

export type EventFiltersInput = z.infer<typeof eventFiltersSchema>;

export const emergencyFiltersSchema = z.object({
  status: z.enum(['pending', 'in-progress', 'resolved', 'cancelled', 'all']).default('all'),
  priority: z.enum(['low', 'medium', 'high', 'critical', 'all']).default('all'),
  emergencyType: z.enum(['mechanical', 'medical', 'accident', 'breakdown', 'other', 'all']).default('all')
});

export type EmergencyFiltersInput = z.infer<typeof emergencyFiltersSchema>;
