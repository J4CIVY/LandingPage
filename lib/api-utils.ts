import { NextRequest, NextResponse } from 'next/server';
import { ZodSchema, ZodError } from 'zod';

/**
 * Tipos para las respuestas de la API
 */
export interface ApiResponse<T = any> {
  success: boolean;
  data?: T;
  error?: string;
  message?: string;
  timestamp?: string;
}

/**
 * Tipos para errores de la API
 */
export interface ApiError {
  status: number;
  message: string;
  details?: any;
}

/**
 * Códigos de estado HTTP comunes
 */
export const HTTP_STATUS = {
  OK: 200,
  CREATED: 201,
  BAD_REQUEST: 400,
  UNAUTHORIZED: 401,
  FORBIDDEN: 403,
  NOT_FOUND: 404,
  METHOD_NOT_ALLOWED: 405,
  CONFLICT: 409,
  VALIDATION_ERROR: 422,
  INTERNAL_SERVER_ERROR: 500,
} as const;

/**
 * Crea una respuesta de éxito estándar
 */
export function createSuccessResponse<T>(
  data: T,
  message?: string,
  status: number = HTTP_STATUS.OK
): NextResponse {
  const response: ApiResponse<T> = {
    success: true,
    data,
    message,
    timestamp: new Date().toISOString(),
  };
  
  return NextResponse.json(response, { status });
}

/**
 * Crea una respuesta de error estándar
 */
export function createErrorResponse(
  message: string,
  status: number = HTTP_STATUS.INTERNAL_SERVER_ERROR,
  details?: any
): NextResponse {
  const response: ApiResponse = {
    success: false,
    error: message,
    timestamp: new Date().toISOString(),
    ...(details && { details }),
  };
  
  return NextResponse.json(response, { status });
}

/**
 * Maneja errores de validación de Zod
 */
export function handleValidationError(error: ZodError): NextResponse {
  const details = error.issues.map((err: any) => ({
    field: err.path.join('.'),
    message: err.message,
  }));
  
  return createErrorResponse(
    'Error de validación',
    HTTP_STATUS.VALIDATION_ERROR,
    details
  );
}

/**
 * Valida el cuerpo de la petición contra un schema de Zod
 */
export async function validateRequestBody<T>(
  request: NextRequest,
  schema: ZodSchema<T>
): Promise<{ success: true; data: T } | { success: false; response: NextResponse }> {
  try {
    const body = await request.json();
    const validatedData = schema.parse(body);
    return { success: true, data: validatedData };
  } catch (error) {
    if (error instanceof ZodError) {
      return { success: false, response: handleValidationError(error) };
    }
    return {
      success: false,
      response: createErrorResponse('Error al procesar la petición', HTTP_STATUS.BAD_REQUEST)
    };
  }
}

/**
 * Wrapper para manejar errores en los handlers de API
 */
export function withErrorHandling(
  handler: (request: NextRequest, ...args: any[]) => Promise<NextResponse>
) {
  return async (request: NextRequest, ...args: any[]): Promise<NextResponse> => {
    try {
      return await handler(request, ...args);
    } catch (error) {
      console.error('API Error:', error);
      
      if (error instanceof ApiError) {
        return createErrorResponse(error.message, error.status, error.details);
      }
      
      return createErrorResponse(
        'Error interno del servidor',
        HTTP_STATUS.INTERNAL_SERVER_ERROR
      );
    }
  };
}

/**
 * Verifica si el método HTTP es permitido
 */
export function checkMethod(request: NextRequest, allowedMethods: string[]): boolean {
  return allowedMethods.includes(request.method);
}

/**
 * Respuesta para métodos no permitidos
 */
export function methodNotAllowed(allowedMethods: string[]): NextResponse {
  return NextResponse.json(
    {
      success: false,
      error: `Método no permitido. Métodos permitidos: ${allowedMethods.join(', ')}`,
      timestamp: new Date().toISOString(),
    },
    {
      status: HTTP_STATUS.METHOD_NOT_ALLOWED,
      headers: {
        Allow: allowedMethods.join(', '),
      },
    }
  );
}

/**
 * Extrae parámetros de consulta de la URL
 */
export function getQueryParams(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const params: Record<string, string> = {};
  
  searchParams.forEach((value, key) => {
    params[key] = value;
  });
  
  return params;
}

/**
 * Genera un ID único simple
 */
export function generateId(): string {
  return Date.now().toString(36) + Math.random().toString(36).substr(2);
}

/**
 * Simula una operación async (para testing y desarrollo)
 */
export function delay(ms: number): Promise<void> {
  return new Promise(resolve => setTimeout(resolve, ms));
}

/**
 * Validador de email
 */
export function isValidEmail(email: string): boolean {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emailRegex.test(email);
}

/**
 * Validador de teléfono colombiano
 */
export function isValidColombianPhone(phone: string): boolean {
  const phoneRegex = /^(\+57)?[13]\d{9}$/;
  return phoneRegex.test(phone.replace(/\s/g, ''));
}

/**
 * Sanitiza strings para prevenir inyecciones
 * Aplica reemplazos repetidamente para prevenir ataques de bypass con tags anidados
 */
export function sanitizeString(input: string): string {
  let sanitized = input;
  let previous: string;
  let iterations = 0;
  const MAX_ITERATIONS = 10; // Prevenir loops infinitos
  
  // Aplicar reemplazos repetidamente hasta que no haya más cambios
  do {
    previous = sanitized;
    sanitized = sanitized
      .replace(/<script[\s\S]*?<\/script[^>]*>/gi, '') // Remover bloques script (maneja </script foo="bar">)
      .replace(/<script[^>]*>/gi, '') // Remover tags script de apertura
      .replace(/<\/script[^>]*>/gi, '') // Remover tags script de cierre con atributos
      .replace(/<iframe[\s\S]*?<\/iframe[^>]*>/gi, '') // Remover bloques iframe
      .replace(/<iframe[^>]*>/gi, '') // Remover tags iframe de apertura
      .replace(/<\/iframe[^>]*>/gi, '') // Remover tags iframe de cierre
      .replace(/javascript\s*:/gi, '') // Remover protocolo javascript:
      .replace(/on\w+\s*=/gi, '') // Remover event handlers
      .replace(/[<>]/g, ''); // Remover caracteres < y > restantes
    iterations++;
  } while (sanitized !== previous && iterations < MAX_ITERATIONS);
  
  return sanitized.trim();
}

/**
 * Clase de error personalizada para la API
 */
export class ApiError extends Error {
  status: number;
  details?: any;
  
  constructor(message: string, status: number = HTTP_STATUS.INTERNAL_SERVER_ERROR, details?: any) {
    super(message);
    this.name = 'ApiError';
    this.status = status;
    this.details = details;
  }
}
