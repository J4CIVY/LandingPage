'use client';

import React, { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';

// Schema simplificado para prueba
const testSchema = z.object({
  firstName: z.string().min(1, 'Nombre requerido'),
  lastName: z.string().min(1, 'Apellido requerido'),
  email: z.string().email('Email inválido'),
  phone: z.string().min(10, 'Teléfono requerido'),
  password: z.string().min(8, 'Contraseña mínimo 8 caracteres'),
  confirmPassword: z.string().min(1, 'Confirmar contraseña'),
  terms: z.boolean().refine(val => val === true, 'Debes aceptar los términos'),
}).refine((data) => data.password === data.confirmPassword, {
  message: "Las contraseñas no coinciden",
  path: ["confirmPassword"],
});

type TestSchema = z.infer<typeof testSchema>;

export default function TestRegisterPage() {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitResult, setSubmitResult] = useState<string>('');
  
  const { register, handleSubmit, formState: { errors } } = useForm<TestSchema>({
    resolver: zodResolver(testSchema),
    mode: 'onTouched',
  });

  const onSubmit = async (data: TestSchema) => {
    console.log('🚀 TEST: onSubmit llamado', data);
    setIsSubmitting(true);
    setSubmitResult('');

    try {
      // Simular envío a API
      console.log('📤 TEST: Enviando datos...');
      
      const response = await fetch('/api/users', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          documentType: 'CC',
          documentNumber: '123456789',
          firstName: data.firstName,
          lastName: data.lastName,
          birthDate: '1990-01-01',
          birthPlace: 'Bogotá',
          phone: data.phone,
          email: data.email,
          address: 'Calle 123',
          city: 'Bogotá',
          country: 'Colombia',
          binaryGender: 'Masculino',
          emergencyContactName: 'Emergency Contact',
          emergencyContactRelationship: 'Familia',
          emergencyContactPhone: '3001234567',
          password: data.password,
          dataConsent: true,
          liabilityWaiver: true,
          termsAcceptance: true,
          acceptedTerms: true,
          acceptedPrivacyPolicy: true,
          acceptedDataProcessing: true,
          membershipType: 'friend'
        }),
      });

      const result = await response.json();
      console.log('📥 TEST: Respuesta recibida', result);

      if (response.ok) {
        setSubmitResult(`✅ ÉXITO: Usuario registrado - ${result.data?.user?.email}`);
      } else {
        setSubmitResult(`❌ ERROR: ${result.message}`);
      }
    } catch (error: any) {
      console.error('💥 TEST: Error', error);
      setSubmitResult(`❌ ERROR: ${error.message}`);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleButtonClick = (e: React.MouseEvent) => {
    console.log('🖱️ TEST: Botón clickeado', {
      type: e.type,
      target: e.target,
      isSubmitting,
      errorsCount: Object.keys(errors).length,
      errors: errors
    });
  };

  return (
    <div className="min-h-screen bg-gray-100 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-2xl mx-auto">
        <div className="bg-white shadow-md rounded-lg p-8">
          <h1 className="text-3xl font-bold text-center text-gray-900 mb-8">
            🧪 Prueba de Registro - Botón de Envío
          </h1>
          
          {submitResult && (
            <div className={`mb-6 p-4 rounded-md ${
              submitResult.includes('✅') ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'
            }`}>
              {submitResult}
            </div>
          )}

          <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
            {/* Nombre */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Nombre *
              </label>
              <input
                type="text"
                {...register('firstName')}
                className={`block w-full px-3 py-2 border rounded-md ${
                  errors.firstName ? 'border-red-500' : 'border-gray-300'
                }`}
                placeholder="Tu nombre"
              />
              {errors.firstName && (
                <p className="mt-1 text-sm text-red-600">{errors.firstName.message}</p>
              )}
            </div>

            {/* Apellido */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Apellido *
              </label>
              <input
                type="text"
                {...register('lastName')}
                className={`block w-full px-3 py-2 border rounded-md ${
                  errors.lastName ? 'border-red-500' : 'border-gray-300'
                }`}
                placeholder="Tu apellido"
              />
              {errors.lastName && (
                <p className="mt-1 text-sm text-red-600">{errors.lastName.message}</p>
              )}
            </div>

            {/* Email */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Email *
              </label>
              <input
                type="email"
                {...register('email')}
                className={`block w-full px-3 py-2 border rounded-md ${
                  errors.email ? 'border-red-500' : 'border-gray-300'
                }`}
                placeholder="tu@email.com"
              />
              {errors.email && (
                <p className="mt-1 text-sm text-red-600">{errors.email.message}</p>
              )}
            </div>

            {/* Teléfono */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Teléfono *
              </label>
              <input
                type="tel"
                {...register('phone')}
                className={`block w-full px-3 py-2 border rounded-md ${
                  errors.phone ? 'border-red-500' : 'border-gray-300'
                }`}
                placeholder="3001234567"
              />
              {errors.phone && (
                <p className="mt-1 text-sm text-red-600">{errors.phone.message}</p>
              )}
            </div>

            {/* Contraseña */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Contraseña *
              </label>
              <input
                type="password"
                {...register('password')}
                className={`block w-full px-3 py-2 border rounded-md ${
                  errors.password ? 'border-red-500' : 'border-gray-300'
                }`}
                placeholder="Mínimo 8 caracteres"
              />
              {errors.password && (
                <p className="mt-1 text-sm text-red-600">{errors.password.message}</p>
              )}
            </div>

            {/* Confirmar Contraseña */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Confirmar Contraseña *
              </label>
              <input
                type="password"
                {...register('confirmPassword')}
                className={`block w-full px-3 py-2 border rounded-md ${
                  errors.confirmPassword ? 'border-red-500' : 'border-gray-300'
                }`}
                placeholder="Repite la contraseña"
              />
              {errors.confirmPassword && (
                <p className="mt-1 text-sm text-red-600">{errors.confirmPassword.message}</p>
              )}
            </div>

            {/* Términos */}
            <div className="flex items-start">
              <input
                type="checkbox"
                {...register('terms')}
                className="h-4 w-4 text-red-600 focus:ring-red-500 border-gray-300 rounded mt-1"
              />
              <label className="ml-3 block text-sm text-gray-700">
                Acepto los términos y condiciones *
              </label>
            </div>
            {errors.terms && (
              <p className="text-sm text-red-600">{errors.terms.message}</p>
            )}

            {/* Estado de errores */}
            <div className="bg-gray-50 p-4 rounded-md">
              <h3 className="text-sm font-medium text-gray-700 mb-2">Estado del formulario:</h3>
              <p className="text-xs text-gray-600">
                Errores: {Object.keys(errors).length} | 
                Enviando: {isSubmitting ? 'Sí' : 'No'}
              </p>
              {Object.keys(errors).length > 0 && (
                <div className="mt-2">
                  <p className="text-xs text-red-600">Errores encontrados:</p>
                  <ul className="text-xs text-red-600 list-disc list-inside">
                    {Object.entries(errors).map(([field, error]) => (
                      <li key={field}>{field}: {error?.message}</li>
                    ))}
                  </ul>
                </div>
              )}
            </div>

            {/* Botón de envío */}
            <div className="pt-6">
              <button
                type="submit"
                disabled={isSubmitting}
                onClick={handleButtonClick}
                className="w-full bg-green-500 hover:bg-green-600 disabled:bg-gray-400 text-white font-bold py-3 px-4 rounded-md transition duration-300"
              >
                {isSubmitting ? '⏳ Enviando...' : '🚀 PROBAR ENVÍO'}
              </button>
            </div>
          </form>

          <div className="mt-8 text-center">
            <p className="text-sm text-gray-600">
              Esta es una página de prueba para diagnosticar el problema del botón.
            </p>
            <p className="text-xs text-gray-500 mt-2">
              Abre la consola del navegador (F12) para ver los logs detallados.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
