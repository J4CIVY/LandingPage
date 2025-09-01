import { z } from 'zod';

// Esquema de validación local - sin conexión a API
export const compatibleUserSchema = z.object({
  // Información personal básica
  documentType: z.string().min(1, 'Tipo de documento requerido'),
  documentNumber: z.string().min(1, 'Número de documento requerido'),
  firstName: z.string().min(1, 'Nombre requerido'),
  lastName: z.string().min(1, 'Apellido requerido'),
  birthDate: z.string().min(1, 'Fecha de nacimiento requerida'),
  birthPlace: z.string().min(1, 'Lugar de nacimiento requerido'),
  
  // Información de contacto
  phone: z.string().min(10, 'Teléfono debe tener al menos 10 dígitos'),
  whatsapp: z.string().optional(),
  email: z.string().email('Email inválido'),
  address: z.string().min(1, 'Dirección requerida'),
  neighborhood: z.string().optional(),
  city: z.string().min(1, 'Ciudad requerida'),
  country: z.string().min(1, 'País requerido'),
  postalCode: z.string().optional(),
  
  // Información de género
  binaryGender: z.string().min(1, 'Género requerido'),
  genderIdentity: z.string().optional(),
  occupation: z.string().optional(),
  discipline: z.string().optional(),
  
  // Información de salud
  bloodType: z.string().optional(),
  rhFactor: z.string().optional(),
  allergies: z.string().optional(),
  healthInsurance: z.string().optional(),
  
  // Contacto de emergencia
  emergencyContactName: z.string().min(1, 'Nombre de contacto de emergencia requerido'),
  emergencyContactRelationship: z.string().min(1, 'Relación requerida'),
  emergencyContactPhone: z.string().min(10, 'Teléfono de emergencia requerido'),
  emergencyContactAddress: z.string().optional(),
  emergencyContactNeighborhood: z.string().optional(),
  emergencyContactCity: z.string().optional(),
  emergencyContactCountry: z.string().optional(),
  emergencyContactPostalCode: z.string().optional(),
  
  // Información de motocicleta
  motorcycleBrand: z.string().optional(),
  motorcycleModel: z.string().optional(),
  motorcycleYear: z.string().optional(),
  motorcyclePlate: z.string().optional(),
  motorcycleEngineSize: z.string().optional(),
  motorcycleColor: z.string().optional(),
  soatExpirationDate: z.string().optional(),
  technicalReviewExpirationDate: z.string().optional(),
  
  // Información de licencia
  licenseNumber: z.string().optional(),
  licenseCategory: z.string().optional(),
  licenseExpirationDate: z.string().optional(),
  
  // Información de BSK
  membershipType: z.enum(['friend', 'rider', 'rider-duo', 'pro', 'pro-duo']).default('friend'),
  
  // Contraseña y confirmación
  password: z.string().min(8, 'La contraseña debe tener al menos 8 caracteres'),
  confirmPassword: z.string().min(1, 'Confirmación de contraseña requerida'),
  
  // Consentimientos del formulario
  dataConsent: z.boolean().refine((val) => val === true, {
    message: 'Debes aceptar el tratamiento de datos personales'
  }),
  liabilityWaiver: z.boolean().refine((val) => val === true, {
    message: 'Debes aceptar la exoneración de responsabilidad'
  }),
  termsAcceptance: z.boolean().refine((val) => val === true, {
    message: 'Debes aceptar los términos y condiciones'
  })
}).refine((data) => data.password === data.confirmPassword, {
  message: "Las contraseñas no coinciden",
  path: ["confirmPassword"],
});

export type CompatibleUserSchema = z.infer<typeof compatibleUserSchema>;
