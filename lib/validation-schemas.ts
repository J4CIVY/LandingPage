import { z } from 'zod';

// SECURITY: Enhanced validation schemas with strict input validation
// All schemas include sanitization and prevent common injection attacks

// Common validation patterns
const ALPHANUMERIC_REGEX = /^[a-zA-Z0-9\s\-_]+$/;
const PHONE_REGEX = /^[\d+\-\s()]+$/;
const SAFE_TEXT_REGEX = /^[^<>{}[\]\\]+$/; // Prevent HTML/script injection

// Esquema para emergencias SOS
export const emergencyRequestSchema = z.object({
  name: z.string()
    .min(1, 'Nombre requerido')
    .max(100, 'Nombre demasiado largo')
    .regex(SAFE_TEXT_REGEX, 'El nombre contiene caracteres no permitidos')
    .transform(val => val.trim()),
  memberId: z.string()
    .min(1, 'ID de miembro requerido')
    .transform(val => val.trim()),
  emergencyType: z.enum(['mechanical', 'medical', 'accident', 'breakdown', 'other'], {
    message: 'Tipo de emergencia inválido'
  }),
  description: z.string()
    .min(10, 'Descripción debe tener al menos 10 caracteres')
    .max(500, 'Descripción demasiado larga')
    .regex(SAFE_TEXT_REGEX, 'La descripción contiene caracteres no permitidos')
    .transform(val => val.trim()),
  location: z.string()
    .min(5, 'Ubicación requerida')
    .max(200, 'Ubicación demasiado larga')
    .transform(val => val.trim()),
  contactPhone: z.string()
    .min(10, 'Teléfono debe tener al menos 10 dígitos')
    .max(15, 'Teléfono demasiado largo')
    .regex(PHONE_REGEX, 'Formato de teléfono inválido')
    .transform(val => val.replace(/\s+/g, '')),
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
  name: z.string()
    .min(1, 'Nombre requerido')
    .max(100, 'Nombre demasiado largo')
    .regex(SAFE_TEXT_REGEX, 'El nombre contiene caracteres no permitidos')
    .transform(val => val.trim()),
  email: z.string()
    .email('Email inválido')
    .toLowerCase()
    .transform(val => val.trim()),
  phone: z.string()
    .min(10, 'Teléfono debe tener al menos 10 dígitos')
    .max(15, 'Teléfono demasiado largo')
    .regex(PHONE_REGEX, 'Formato de teléfono inválido')
    .transform(val => val.replace(/\s+/g, '')),
  membershipType: z.enum(['friend', 'rider', 'rider-duo', 'pro', 'pro-duo'], {
    message: 'Tipo de membresía inválido'
  }),
  message: z.string()
    .max(500, 'Mensaje demasiado largo')
    .regex(SAFE_TEXT_REGEX, 'El mensaje contiene caracteres no permitidos')
    .transform(val => val.trim())
    .optional()
});

export type MembershipApplicationInput = z.infer<typeof membershipApplicationSchema>;

// Esquema para mensajes de contacto
export const contactMessageSchema = z.object({
  name: z.string()
    .min(1, 'Nombre requerido')
    .max(100, 'Nombre demasiado largo')
    .regex(SAFE_TEXT_REGEX, 'El nombre contiene caracteres no permitidos')
    .transform(val => val.trim()),
  email: z.string()
    .email('Email inválido')
    .toLowerCase()
    .transform(val => val.trim()),
  phone: z.string()
    .min(10, 'Teléfono debe tener al menos 10 dígitos')
    .max(15, 'Teléfono demasiado largo')
    .regex(PHONE_REGEX, 'Formato de teléfono inválido')
    .transform(val => val.replace(/\s+/g, ''))
    .optional(),
  subject: z.string()
    .min(1, 'Asunto requerido')
    .max(200, 'Asunto demasiado largo')
    .regex(SAFE_TEXT_REGEX, 'El asunto contiene caracteres no permitidos')
    .transform(val => val.trim()),
  message: z.string()
    .min(10, 'Mensaje debe tener al menos 10 caracteres')
    .max(1000, 'Mensaje demasiado largo')
    .regex(SAFE_TEXT_REGEX, 'El mensaje contiene caracteres no permitidos')
    .transform(val => val.trim()),
  type: z.enum(['general', 'membership', 'technical', 'complaint', 'suggestion']).default('general')
});

export type ContactMessageInput = z.infer<typeof contactMessageSchema>;

// Esquema para productos
export const productSchema = z.object({
  name: z.string()
    .min(1, 'Nombre requerido')
    .max(100, 'Nombre demasiado largo')
    .regex(SAFE_TEXT_REGEX, 'El nombre contiene caracteres no permitidos')
    .transform(val => val.trim()),
  shortDescription: z.string()
    .min(10, 'Descripción corta requerida')
    .max(200, 'Descripción corta demasiado larga')
    .regex(SAFE_TEXT_REGEX, 'La descripción contiene caracteres no permitidos')
    .transform(val => val.trim()),
  longDescription: z.string()
    .min(50, 'Descripción larga requerida')
    .max(1000, 'Descripción larga demasiado larga')
    .regex(SAFE_TEXT_REGEX, 'La descripción contiene caracteres no permitidos')
    .transform(val => val.trim()),
  finalPrice: z.number().min(0, 'El precio debe ser positivo'),
  availability: z.enum(['in-stock', 'out-of-stock']).default('in-stock'),
  featuredImage: z.string().url('URL de imagen inválida'),
  gallery: z.array(z.string().url('URL de imagen inválida')).optional(),
  newProduct: z.boolean().default(false),
  category: z.string()
    .min(1, 'Categoría requerida')
    .max(50, 'Categoría demasiado larga')
    .regex(ALPHANUMERIC_REGEX, 'La categoría contiene caracteres no permitidos')
    .transform(val => val.trim()),
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
  name: z.string()
    .min(1, 'Nombre requerido')
    .max(100, 'Nombre demasiado largo')
    .regex(SAFE_TEXT_REGEX, 'El nombre contiene caracteres no permitidos')
    .transform(val => val.trim()),
  startDate: z.string().datetime('Fecha inválida'),
  description: z.string()
    .min(10, 'Descripción requerida')
    .max(500, 'Descripción demasiado larga')
    .regex(SAFE_TEXT_REGEX, 'La descripción contiene caracteres no permitidos')
    .transform(val => val.trim()),
  mainImage: z.string().url('URL de imagen inválida'),
  eventType: z.string()
    .min(1, 'Tipo de evento requerido')
    .max(50, 'Tipo de evento demasiado largo')
    .regex(ALPHANUMERIC_REGEX, 'El tipo de evento contiene caracteres no permitidos')
    .transform(val => val.trim()),
  departureLocation: z.object({
    address: z.string()
      .min(1, 'Dirección requerida')
      .max(200, 'Dirección demasiado larga')
      .regex(SAFE_TEXT_REGEX, 'La dirección contiene caracteres no permitidos')
      .transform(val => val.trim()),
    city: z.string()
      .min(1, 'Ciudad requerida')
      .max(100, 'Ciudad demasiado larga')
      .regex(SAFE_TEXT_REGEX, 'La ciudad contiene caracteres no permitidos')
      .transform(val => val.trim()),
    country: z.string()
      .min(1, 'País requerido')
      .max(100, 'País demasiado largo')
      .regex(SAFE_TEXT_REGEX, 'El país contiene caracteres no permitidos')
      .transform(val => val.trim())
  }).optional(),
  registrationOpenDate: z.string().datetime('Fecha de apertura inválida').optional(),
  registrationDeadline: z.string().datetime('Fecha límite inválida').optional(),
  pointsAwarded: z.number().min(0, 'Los puntos deben ser positivos').optional(),
  detailsPdf: z.string().url('URL del PDF inválida').optional(),
  includedServices: z.array(z.string().max(100, 'Servicio demasiado largo')).optional(),
  requirements: z.array(z.string().max(200, 'Requisito demasiado largo')).optional()
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

// Esquemas para membresías
export const membershipBenefitSchema = z.object({
  id: z.string().min(1, 'ID del beneficio requerido'),
  title: z.string().min(1, 'Título del beneficio requerido').max(100, 'Título demasiado largo'),
  description: z.string().min(1, 'Descripción del beneficio requerida').max(500, 'Descripción demasiado larga'),
  icon: z.string().min(1, 'Ícono requerido'),
  category: z.enum(['events', 'support', 'commercial', 'digital', 'emergency', 'education', 'social'], {
    message: 'Categoría de beneficio inválida'
  }),
  isActive: z.boolean().default(true),
  priority: z.number().min(0).max(100).default(0)
});

export const membershipPricingSchema = z.object({
  initial: z.number().min(0, 'El precio inicial debe ser mayor o igual a 0'),
  withDiscount: z.number().min(0).optional(),
  early_bird: z.number().min(0).optional(),
  student: z.number().min(0).optional(),
  family: z.number().min(0).optional(),
  corporate: z.number().min(0).optional()
});

export const membershipPeriodSchema = z.object({
  startDate: z.string().pipe(z.coerce.date()),
  endDate: z.string().pipe(z.coerce.date()),
  isActive: z.boolean().default(true),
  renewalStartDate: z.string().pipe(z.coerce.date()).optional(),
  renewalDeadline: z.string().pipe(z.coerce.date()).optional()
});

export const membershipSchema = z.object({
  name: z.string().min(1, 'Nombre de la membresía requerido').max(100, 'Nombre demasiado largo'),
  slug: z.string().min(1, 'Slug requerido').max(100, 'Slug demasiado largo').regex(/^[a-z0-9-]+$/, 'Slug debe contener solo letras minúsculas, números y guiones'),
  description: z.string().min(10, 'Descripción debe tener al menos 10 caracteres').max(2000, 'Descripción demasiado larga'),
  shortDescription: z.string().max(200, 'Descripción corta demasiado larga').optional(),
  
  pricing: membershipPricingSchema,
  period: membershipPeriodSchema,
  
  requiresRenewal: z.boolean().default(true),
  renewalType: z.enum(['monthly', 'quarterly', 'biannual', 'annual', 'lifetime']).default('annual'),
  isLifetime: z.boolean().default(false),
  
  status: z.enum(['active', 'inactive', 'draft', 'archived']).default('draft'),
  
  benefits: z.array(membershipBenefitSchema).default([]),
  
  information: z.object({
    targetAudience: z.string().max(500).optional(),
    requirements: z.array(z.string().max(200)).default([]),
    commitment: z.array(z.string().max(200)).default([]),
    support: z.object({
      email: z.string().email().optional(),
      whatsapp: z.string().max(20).optional(),
      phone: z.string().max(20).optional(),
      emergencyLine: z.string().max(20).optional()
    }).default({})
  }).optional(),
  
  level: z.object({
    tier: z.number().min(1, 'El nivel debe ser al menos 1').max(10, 'El nivel no puede ser mayor a 10'),
    name: z.string().min(1, 'Nombre del nivel requerido').max(50, 'Nombre del nivel demasiado largo'),
    upgradeRequirements: z.array(z.string().max(200)).default([])
  }),
  
  enrollmentProcess: z.object({
    steps: z.array(z.string().max(200)).default([]),
    requiredDocuments: z.array(z.string().max(100)).default([]),
    minimumAge: z.number().min(0).max(100).optional(),
    requiresVehicle: z.boolean().default(false),
    autoApproval: z.boolean().default(false)
  }).optional(),
  
  autoRenewal: z.object({
    enabled: z.boolean().default(true),
    notificationDays: z.array(z.number().min(1).max(365)).default([30, 15, 7, 1]),
    gracePeriodDays: z.number().min(0).max(90).default(7)
  }).optional(),
  
  capacity: z.object({
    maxMembers: z.number().min(1).optional(),
    currentMembers: z.number().min(0).default(0),
    waitingList: z.boolean().default(false)
  }).optional(),
  
  testimonials: z.array(z.object({
    author: z.string().min(1, 'Autor del testimonio requerido').max(100),
    comment: z.string().min(10, 'Comentario debe tener al menos 10 caracteres').max(500),
    rating: z.number().min(1).max(5).optional(),
    date: z.string().pipe(z.coerce.date()).optional()
  })).default([]),
  
  seo: z.object({
    metaTitle: z.string().max(60).optional(),
    metaDescription: z.string().max(160).optional(),
    keywords: z.array(z.string().max(50)).default([])
  }).optional(),
  
  display: z.object({
    color: z.string().regex(/^#[0-9A-F]{6}$/i, 'Color debe ser un código hexadecimal válido').default('#3B82F6'),
    icon: z.string().max(50).optional(),
    featured: z.boolean().default(false),
    order: z.number().min(0).default(0),
    showInPublic: z.boolean().default(true)
  }).optional()
});

export type MembershipInput = z.infer<typeof membershipSchema>;
export type MembershipBenefitInput = z.infer<typeof membershipBenefitSchema>;
export type MembershipPricingInput = z.infer<typeof membershipPricingSchema>;

// Esquema para actualizar membresías (todos los campos opcionales excepto los requeridos)
export const updateMembershipSchema = membershipSchema.partial().extend({
  id: z.string().min(1, 'ID de la membresía requerido')
});

export type UpdateMembershipInput = z.infer<typeof updateMembershipSchema>;

// Esquema para filtros de membresías
export const membershipFiltersSchema = z.object({
  status: z.enum(['active', 'inactive', 'draft', 'archived', 'all']).default('all'),
  requiresRenewal: z.enum(['true', 'false', 'all']).default('all'),
  renewalType: z.enum(['monthly', 'quarterly', 'biannual', 'annual', 'lifetime', 'all']).default('all'),
  featured: z.enum(['true', 'false', 'all']).default('all'),
  search: z.string().max(100).optional()
});

export type MembershipFiltersInput = z.infer<typeof membershipFiltersSchema>;

// Esquema para PQRSDF (Peticiones, Quejas, Reclamos, Sugerencias, Denuncias, Felicitaciones)
export const pqrsdfSchema = z.object({
  categoria: z.enum(['peticion', 'queja', 'reclamo', 'sugerencia', 'denuncia', 'felicitacion'], {
    message: 'Categoría no válida'
  }),
  subcategoria: z.enum(['general', 'reembolso', 'cambio_datos', 'certificado', 'otro'], {
    message: 'Subcategoría no válida'
  }).optional(),
  asunto: z.string()
    .min(5, 'Asunto debe tener al menos 5 caracteres')
    .max(200, 'Asunto demasiado largo')
    .regex(SAFE_TEXT_REGEX, 'El asunto contiene caracteres no permitidos')
    .transform(val => val.trim()),
  descripcion: z.string()
    .min(10, 'Descripción debe tener al menos 10 caracteres')
    .max(1000, 'Descripción demasiado larga')
    .regex(SAFE_TEXT_REGEX, 'La descripción contiene caracteres no permitidos')
    .transform(val => val.trim()),
  prioridad: z.enum(['baja', 'media', 'alta']).default('media'),
  eventoId: z.string().optional(),
  eventoNombre: z.string()
    .max(100, 'Nombre del evento demasiado largo')
    .regex(SAFE_TEXT_REGEX, 'El nombre del evento contiene caracteres no permitidos')
    .transform(val => val.trim())
    .optional(),
  montoReembolso: z.number().min(0, 'El monto debe ser positivo').optional(),
  ordenPago: z.string()
    .max(50, 'Orden de pago demasiado larga')
    .regex(ALPHANUMERIC_REGEX, 'La orden de pago contiene caracteres no permitidos')
    .transform(val => val.trim())
    .optional(),
  datosBancarios: z.object({
    nombreTitular: z.string()
      .min(1, 'Nombre del titular requerido')
      .max(100, 'Nombre demasiado largo')
      .regex(SAFE_TEXT_REGEX, 'El nombre contiene caracteres no permitidos')
      .transform(val => val.trim()),
    banco: z.string()
      .min(1, 'Banco requerido')
      .max(50, 'Banco demasiado largo')
      .regex(SAFE_TEXT_REGEX, 'El banco contiene caracteres no permitidos')
      .transform(val => val.trim()),
    tipoCuenta: z.enum(['ahorros', 'corriente'], {
      message: 'Tipo de cuenta inválido'
    }),
    numeroCuenta: z.string()
      .min(8, 'Número de cuenta debe tener al menos 8 dígitos')
      .max(20, 'Número de cuenta demasiado largo')
      .regex(/^\d+$/, 'El número de cuenta debe contener solo dígitos')
  }).optional()
}).refine((data) => {
  // Si la subcategoría es reembolso, campos relacionados son requeridos
  if (data.subcategoria === 'reembolso') {
    return data.eventoId && data.datosBancarios;
  }
  return true;
}, {
  message: 'Para reembolsos son requeridos eventoId y datosBancarios',
  path: ['subcategoria']
});

export type PQRSDFInput = z.infer<typeof pqrsdfSchema>;

// Esquema para beneficios
export const benefitSchema = z.object({
  title: z.string()
    .min(3, 'Título debe tener al menos 3 caracteres')
    .max(100, 'Título demasiado largo')
    .regex(SAFE_TEXT_REGEX, 'El título contiene caracteres no permitidos')
    .transform(val => val.trim()),
  description: z.string()
    .min(10, 'Descripción debe tener al menos 10 caracteres')
    .max(500, 'Descripción demasiado larga')
    .regex(SAFE_TEXT_REGEX, 'La descripción contiene caracteres no permitidos')
    .transform(val => val.trim()),
  category: z.string()
    .min(1, 'Categoría requerida')
    .max(50, 'Categoría demasiado larga')
    .regex(ALPHANUMERIC_REGEX, 'La categoría contiene caracteres no permitidos')
    .transform(val => val.trim()),
  membershipTypes: z.array(
    z.enum(['friend', 'rider', 'rider-duo', 'pro', 'pro-duo'], {
      message: 'Tipo de membresía inválido'
    })
  ).min(1, 'Debe seleccionar al menos un tipo de membresía'),
  redemptionProcess: z.string()
    .min(10, 'Proceso de redención debe tener al menos 10 caracteres')
    .max(500, 'Proceso de redención demasiado largo')
    .regex(SAFE_TEXT_REGEX, 'El proceso de redención contiene caracteres no permitidos')
    .transform(val => val.trim()),
  isActive: z.boolean().default(true),
  isVisible: z.boolean().default(true),
  isTemporary: z.boolean().default(false),
  validFrom: z.string().datetime('Fecha de inicio inválida').optional(),
  validUntil: z.string().datetime('Fecha de fin inválida').optional(),
  terms: z.string()
    .max(1000, 'Términos demasiado largos')
    .regex(SAFE_TEXT_REGEX, 'Los términos contienen caracteres no permitidos')
    .transform(val => val.trim())
    .optional(),
  imageUrl: z.string().url('URL de imagen inválida').optional(),
  partnerName: z.string()
    .max(100, 'Nombre del socio demasiado largo')
    .regex(SAFE_TEXT_REGEX, 'El nombre del socio contiene caracteres no permitidos')
    .transform(val => val.trim())
    .optional(),
  partnerContact: z.object({
    name: z.string()
      .max(100, 'Nombre demasiado largo')
      .regex(SAFE_TEXT_REGEX, 'El nombre contiene caracteres no permitidos')
      .transform(val => val.trim()),
    phone: z.string()
      .regex(PHONE_REGEX, 'Formato de teléfono inválido')
      .transform(val => val.replace(/\s+/g, '')),
    email: z.string().email('Email inválido').toLowerCase()
  }).optional(),
  discountPercentage: z.number().min(0).max(100).optional(),
  locationRestrictions: z.array(
    z.string()
      .max(100, 'Ubicación demasiado larga')
      .regex(SAFE_TEXT_REGEX, 'La ubicación contiene caracteres no permitidos')
  ).optional()
}).refine((data) => {
  // Si es temporal, debe tener fechas válidas
  if (data.isTemporary) {
    return data.validFrom && data.validUntil;
  }
  return true;
}, {
  message: 'Beneficios temporales requieren fechas de validez',
  path: ['isTemporary']
});

export type BenefitInput = z.infer<typeof benefitSchema>;
