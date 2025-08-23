import { z } from 'zod';
import { validateEmail, validatePhone, validateDocumentNumber, validatePasswordStrength } from '@/utils/security';

// Enhanced validation schema with security improvements
export const userSchema = z.object({
  documentType: z.string()
    .min(1, "Campo obligatorio")
    .max(20, "Máximo 20 caracteres")
    .regex(/^[A-Za-zÀ-ÿ\s]+$/, "Solo letras permitidas"),
    
  documentNumber: z.string()
    .min(1, "Campo obligatorio")
    .max(12, "Máximo 12 caracteres")
    .regex(/^[0-9]+$/, "Solo números permitidos")
    .refine(val => validateDocumentNumber(val), "Número de documento inválido"),
    
  firstName: z.string()
    .min(1, "Campo obligatorio")
    .max(50, "Máximo 50 caracteres")
    .regex(/^[A-Za-zÀ-ÿ\s]+$/, "Solo letras permitidas")
    .transform(val => val.trim()),
    
  lastName: z.string()
    .min(1, "Campo obligatorio")
    .max(50, "Máximo 50 caracteres")
    .regex(/^[A-Za-zÀ-ÿ\s]+$/, "Solo letras permitidas")
    .transform(val => val.trim()),
    
  birthDate: z.string()
    .min(1, "Campo obligatorio")
    .refine(val => {
      const date = new Date(val);
      const today = new Date();
      const age = today.getFullYear() - date.getFullYear();
      return age >= 16 && age <= 100;
    }, "Debe ser mayor de 16 años y menor de 100"),
    
  birthPlace: z.string()
    .min(1, "Campo obligatorio")
    .max(100, "Máximo 100 caracteres")
    .regex(/^[A-Za-zÀ-ÿ\s,.-]+$/, "Caracteres inválidos")
    .transform(val => val.trim()),
    
  phone: z.string()
    .min(1, "Campo obligatorio")
    .max(20, "Máximo 20 caracteres")
    .refine(val => validatePhone(val), "Número de teléfono inválido"),
    
  whatsapp: z.string()
    .max(20, "Máximo 20 caracteres")
    .optional()
    .refine(val => !val || validatePhone(val), "Número de WhatsApp inválido"),
    
  email: z.string()
    .min(1, "Campo obligatorio")
    .max(254, "Máximo 254 caracteres")
    .refine(val => validateEmail(val), "Correo electrónico no válido")
    .transform(val => val.toLowerCase().trim()),
    
  address: z.string()
    .min(1, "Campo obligatorio")
    .max(200, "Máximo 200 caracteres")
    .regex(/^[A-Za-z0-9À-ÿ\s,.#-]+$/, "Caracteres inválidos en dirección")
    .transform(val => val.trim()),
    
  neighborhood: z.string()
    .max(100, "Máximo 100 caracteres")
    .optional()
    .transform(val => val?.trim() || undefined),
    
  city: z.string()
    .min(1, "Campo obligatorio")
    .max(100, "Máximo 100 caracteres")
    .regex(/^[A-Za-zÀ-ÿ\s,.-]+$/, "Solo letras y caracteres básicos")
    .transform(val => val.trim()),
    
  country: z.string()
    .min(1, "Campo obligatorio")
    .max(100, "Máximo 100 caracteres")
    .regex(/^[A-Za-zÀ-ÿ\s]+$/, "Solo letras permitidas")
    .transform(val => val.trim()),
    
  postalCode: z.string()
    .max(20, "Máximo 20 caracteres")
    .optional()
    .refine(val => !val || /^[A-Za-z0-9\s-]+$/.test(val), "Código postal inválido"),
    
  binaryGender: z.string()
    .min(1, "Campo obligatorio")
    .max(20, "Máximo 20 caracteres"),
    
  genderIdentity: z.string()
    .max(50, "Máximo 50 caracteres")
    .optional()
    .transform(val => val?.trim() || undefined),
    
  occupation: z.string()
    .max(100, "Máximo 100 caracteres")
    .optional()
    .transform(val => val?.trim() || undefined),
    
  discipline: z.string()
    .max(100, "Máximo 100 caracteres")
    .optional()
    .transform(val => val?.trim() || undefined),
    
  bloodType: z.string()
    .max(10, "Máximo 10 caracteres")
    .optional()
    .refine(val => !val || /^(A|B|AB|O)[+-]?$/.test(val), "Tipo de sangre inválido"),
    
  rhFactor: z.string()
    .max(10, "Máximo 10 caracteres")
    .optional()
    .refine(val => !val || /^[+-]$/.test(val), "Factor RH inválido"),
    
  allergies: z.string()
    .max(500, "Máximo 500 caracteres")
    .optional()
    .transform(val => val?.trim() || undefined),
    
  healthInsurance: z.string()
    .max(100, "Máximo 100 caracteres")
    .optional()
    .transform(val => val?.trim() || undefined),
    
  emergencyContactName: z.string()
    .min(1, "Campo obligatorio")
    .max(100, "Máximo 100 caracteres")
    .regex(/^[A-Za-zÀ-ÿ\s]+$/, "Solo letras permitidas")
    .transform(val => val.trim()),
    
  emergencyContactRelationship: z.string()
    .min(1, "Campo obligatorio")
    .max(50, "Máximo 50 caracteres")
    .regex(/^[A-Za-zÀ-ÿ\s]+$/, "Solo letras permitidas")
    .transform(val => val.trim()),
    
  emergencyContactPhone: z.string()
    .min(1, "Campo obligatorio")
    .max(20, "Máximo 20 caracteres")
    .refine(val => validatePhone(val), "Número de teléfono inválido"),
  emergencyContactNeighborhood: z.string()
    .max(100, "Máximo 100 caracteres")
    .optional()
    .transform(val => val?.trim() || undefined),
    
  emergencyContactCity: z.string()
    .min(1, "Campo obligatorio")
    .max(100, "Máximo 100 caracteres")
    .regex(/^[A-Za-zÀ-ÿ\s,.#-]+$/, "Solo letras y caracteres básicos")
    .transform(val => val.trim()),
    
  emergencyContactCountry: z.string()
    .min(1, "Campo obligatorio")
    .max(100, "Máximo 100 caracteres")
    .regex(/^[A-Za-zÀ-ÿ\s]+$/, "Solo letras permitidas")
    .transform(val => val.trim()),
    
  motorcyclePlate: z.string()
    .min(1, "Campo obligatorio")
    .max(10, "Máximo 10 caracteres")
    .regex(/^[A-Za-z0-9-]+$/, "Formato de placa inválido")
    .transform(val => val.toUpperCase().trim()),
    
  motorcycleBrand: z.string()
    .min(1, "Campo obligatorio")
    .max(50, "Máximo 50 caracteres")
    .regex(/^[A-Za-z0-9À-ÿ\s-]+$/, "Caracteres inválidos")
    .transform(val => val.trim()),
    
  motorcycleModel: z.string()
    .min(1, "Campo obligatorio")
    .max(50, "Máximo 50 caracteres")
    .regex(/^[A-Za-z0-9À-ÿ\s-]+$/, "Caracteres inválidos")
    .transform(val => val.trim()),
    
  motorcycleYear: z.string()
    .min(1, "Campo obligatorio")
    .regex(/^(19|20)\d{2}$/, "Año inválido")
    .refine(val => {
      const year = parseInt(val);
      const currentYear = new Date().getFullYear();
      return year >= 1900 && year <= currentYear + 1;
    }, "Año fuera del rango válido"),
    
  motorcycleDisplacement: z.string()
    .min(1, "Campo obligatorio")
    .max(10, "Máximo 10 caracteres")
    .regex(/^[0-9]+$/, "Solo números permitidos")
    .refine(val => {
      const displacement = parseInt(val);
      return displacement >= 50 && displacement <= 3000;
    }, "Cilindraje debe estar entre 50 y 3000cc"),
    
  password: z.string()
    .min(8, "La contraseña debe tener al menos 8 caracteres")
    .max(128, "Máximo 128 caracteres")
    .refine(val => {
      const validation = validatePasswordStrength(val);
      return validation.isValid;
    }, "La contraseña no cumple los requisitos de seguridad"),
    
  confirmPassword: z.string()
    .min(1, "Campo obligatorio"),
    
  dataConsent: z.boolean()
    .refine(val => val === true, "Debes aceptar el tratamiento de datos"),
    
  liabilityWaiver: z.boolean()
    .refine(val => val === true, "Debes aceptar la exención de responsabilidad"),
    
  termsAcceptance: z.boolean()
    .refine(val => val === true, "Debes aceptar los términos y condiciones"),
    
}).refine(data => data.password === data.confirmPassword, {
  message: "Las contraseñas no coinciden",
  path: ["confirmPassword"],
});

export type UserSchema = z.infer<typeof userSchema>;
