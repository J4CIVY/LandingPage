'use client';

import React, { useState } from 'react';
import { useForm } from 'react-hook-form';

// Tipo simplificado para debug
interface SimpleFormData {
  firstName: string;
  lastName: string;
  email: string;
  phone: string;
  password: string;
  dataConsent: boolean;
  liabilityWaiver: boolean;
  termsAcceptance: boolean;
}

const SimpleRegisterTest: React.FC = () => {
  const [currentStep, setCurrentStep] = useState<number>(1);
  const [isSubmitting, setIsSubmitting] = useState<boolean>(false);
  const [submitError, setSubmitError] = useState<string>('');
  const [submitSuccess, setSubmitSuccess] = useState<string>('');
  
  const { register, handleSubmit, formState: { errors } } = useForm<SimpleFormData>({
    mode: 'onTouched',
  });

  const totalSteps = 3;

  const onSubmit = async (data: SimpleFormData) => {
    console.log('🚀 SIMPLE: onSubmit iniciado', { data, isSubmitting, currentStep });
    
    if (isSubmitting) {
      console.log('⏸️ SIMPLE: Ya se está enviando, cancelando...');
      return;
    }
    
    setIsSubmitting(true);
    setSubmitError('');
    setSubmitSuccess('');

    try {
      console.log('📤 SIMPLE: Enviando datos a la API...');
      
      // Preparar datos para envío
      const userData = {
        documentType: 'CC',
        documentNumber: Date.now().toString(), // Usar timestamp para evitar duplicados
        firstName: data.firstName,
        lastName: data.lastName,
        birthDate: '1990-01-01',
        birthPlace: 'Bogotá',
        phone: data.phone,
        email: data.email,
        address: 'Calle 123 #45-67',
        city: 'Bogotá',
        country: 'Colombia',
        binaryGender: 'Masculino',
        emergencyContactName: 'Contacto de Emergencia',
        emergencyContactRelationship: 'Familiar',
        emergencyContactPhone: '3007654321',
        password: data.password,
        membershipType: 'friend',
        acceptedTerms: data.termsAcceptance,
        acceptedPrivacyPolicy: data.dataConsent,
        acceptedDataProcessing: data.liabilityWaiver
      };

      console.log('📊 SIMPLE: Datos preparados', { 
        email: userData.email,
        fieldsCount: Object.keys(userData).length 
      });

      const response = await fetch('/api/users', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(userData),
      });

      const result = await response.json();
      
      console.log('📥 SIMPLE: Respuesta recibida', {
        status: response.status,
        ok: response.ok,
        result
      });

      if (response.ok) {
        console.log('✅ SIMPLE: Registro exitoso');
        
        // Enviar correo de bienvenida
        try {
          console.log('📧 SIMPLE: Enviando correo de bienvenida...');
          const emailResponse = await fetch('/api/email/notifications', {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
            },
            body: JSON.stringify({
              type: 'welcome',
              recipientEmail: userData.email,
              recipientName: `${userData.firstName} ${userData.lastName}`,
              templateData: {
                userData: {
                  firstName: userData.firstName,
                  lastName: userData.lastName,
                  membershipType: userData.membershipType,
                  registrationDate: new Date().toISOString()
                }
              },
              priority: 'high'
            }),
          });

          if (emailResponse.ok) {
            console.log('✅ SIMPLE: Correo de bienvenida enviado exitosamente');
          } else {
            console.warn('⚠️ SIMPLE: Error enviando correo de bienvenida, pero el registro fue exitoso');
          }
        } catch (emailError) {
          console.warn('⚠️ SIMPLE: Error enviando correo de bienvenida:', emailError);
          // No interrumpir el flujo de registro por error de email
        }
        
        setSubmitSuccess(`¡Registro exitoso! Usuario: ${result.data?.user?.email}. Se ha enviado un correo de confirmación.`);
      } else {
        console.log('❌ SIMPLE: Error en registro');
        setSubmitError(`Error: ${result.message || 'Error desconocido'}`);
      }
      
    } catch (error: any) {
      console.error('💥 SIMPLE: Error en catch', error);
      setSubmitError(`Error de conexión: ${error.message}`);
    } finally {
      console.log('🏁 SIMPLE: Finalizando, isSubmitting = false');
      setIsSubmitting(false);
    }
  };

  const handleNextStep = () => {
    setCurrentStep(prev => Math.min(prev + 1, totalSteps));
  };

  const handlePrevStep = () => {
    setCurrentStep(prev => Math.max(prev - 1, 1));
  };

  const handleButtonClick = (e: React.MouseEvent) => {
    console.log('🖱️ SIMPLE: Botón clickeado', {
      step: currentStep,
      totalSteps,
      isSubmitting,
      errorsCount: Object.keys(errors).length,
      errors
    });
  };

  return (
    <div className="min-h-screen bg-gray-100 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-3xl mx-auto">
        <div className="bg-white shadow-md rounded-lg p-8">
          <h1 className="text-3xl font-bold text-center text-gray-900 mb-8">
            🔬 Formulario Simplificado de Prueba
          </h1>
          
          <div className="mb-6">
            <div className="flex items-center justify-between">
              <span className="text-sm font-medium text-gray-700">
                Paso {currentStep} de {totalSteps}
              </span>
              <span className="text-sm text-gray-500">
                Errores: {Object.keys(errors).length} | 
                Enviando: {isSubmitting ? 'Sí' : 'No'}
              </span>
            </div>
            <div className="mt-2 w-full bg-gray-200 rounded-full h-2">
              <div 
                className="bg-red-600 h-2 rounded-full transition-all duration-300"
                style={{ width: `${(currentStep / totalSteps) * 100}%` }}
              ></div>
            </div>
          </div>

          {submitError && (
            <div className="mb-6 p-4 bg-red-100 border border-red-400 text-red-700 rounded">
              ❌ {submitError}
            </div>
          )}

          {submitSuccess && (
            <div className="mb-6 p-4 bg-green-100 border border-green-400 text-green-700 rounded">
              ✅ {submitSuccess}
            </div>
          )}

          <form onSubmit={handleSubmit(onSubmit)}>
            {/* Paso 1: Información básica */}
            {currentStep === 1 && (
              <div className="space-y-6">
                <h2 className="text-xl font-semibold text-gray-800">
                  Información Básica
                </h2>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Nombre *
                  </label>
                  <input
                    type="text"
                    {...register('firstName', { required: 'Nombre requerido' })}
                    className={`block w-full px-3 py-2 border rounded-md ${
                      errors.firstName ? 'border-red-500' : 'border-gray-300'
                    }`}
                    placeholder="Tu nombre"
                  />
                  {errors.firstName && (
                    <p className="mt-1 text-sm text-red-600">{errors.firstName.message}</p>
                  )}
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Apellido *
                  </label>
                  <input
                    type="text"
                    {...register('lastName', { required: 'Apellido requerido' })}
                    className={`block w-full px-3 py-2 border rounded-md ${
                      errors.lastName ? 'border-red-500' : 'border-gray-300'
                    }`}
                    placeholder="Tu apellido"
                  />
                  {errors.lastName && (
                    <p className="mt-1 text-sm text-red-600">{errors.lastName.message}</p>
                  )}
                </div>
              </div>
            )}

            {/* Paso 2: Contacto */}
            {currentStep === 2 && (
              <div className="space-y-6">
                <h2 className="text-xl font-semibold text-gray-800">
                  Información de Contacto
                </h2>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Email *
                  </label>
                  <input
                    type="email"
                    {...register('email', { 
                      required: 'Email requerido',
                      pattern: {
                        value: /^[^\s@]+@[^\s@]+\.[^\s@]+$/,
                        message: 'Email inválido'
                      }
                    })}
                    className={`block w-full px-3 py-2 border rounded-md ${
                      errors.email ? 'border-red-500' : 'border-gray-300'
                    }`}
                    placeholder="tu@email.com"
                  />
                  {errors.email && (
                    <p className="mt-1 text-sm text-red-600">{errors.email.message}</p>
                  )}
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Teléfono *
                  </label>
                  <input
                    type="tel"
                    {...register('phone', { 
                      required: 'Teléfono requerido',
                      minLength: {
                        value: 10,
                        message: 'Teléfono debe tener al menos 10 dígitos'
                      }
                    })}
                    className={`block w-full px-3 py-2 border rounded-md ${
                      errors.phone ? 'border-red-500' : 'border-gray-300'
                    }`}
                    placeholder="3001234567"
                  />
                  {errors.phone && (
                    <p className="mt-1 text-sm text-red-600">{errors.phone.message}</p>
                  )}
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Contraseña *
                  </label>
                  <input
                    type="password"
                    {...register('password', { 
                      required: 'Contraseña requerida',
                      minLength: {
                        value: 8,
                        message: 'Contraseña debe tener al menos 8 caracteres'
                      }
                    })}
                    className={`block w-full px-3 py-2 border rounded-md ${
                      errors.password ? 'border-red-500' : 'border-gray-300'
                    }`}
                    placeholder="Mínimo 8 caracteres"
                  />
                  {errors.password && (
                    <p className="mt-1 text-sm text-red-600">{errors.password.message}</p>
                  )}
                </div>
              </div>
            )}

            {/* Paso 3: Términos y Confirmación */}
            {currentStep === 3 && (
              <div className="space-y-6">
                <h2 className="text-xl font-semibold text-gray-800">
                  Términos y Condiciones
                </h2>
                
                <div className="space-y-4">
                  <div className="flex items-start">
                    <input
                      type="checkbox"
                      {...register('dataConsent', { required: 'Debes aceptar el tratamiento de datos' })}
                      className="h-4 w-4 text-red-600 focus:ring-red-500 border-gray-300 rounded mt-1"
                    />
                    <label className="ml-3 block text-sm text-gray-700">
                      Autorizo el tratamiento de mis datos personales *
                    </label>
                  </div>
                  {errors.dataConsent && (
                    <p className="text-sm text-red-600">{errors.dataConsent.message}</p>
                  )}

                  <div className="flex items-start">
                    <input
                      type="checkbox"
                      {...register('liabilityWaiver', { required: 'Debes aceptar la exoneración de responsabilidad' })}
                      className="h-4 w-4 text-red-600 focus:ring-red-500 border-gray-300 rounded mt-1"
                    />
                    <label className="ml-3 block text-sm text-gray-700">
                      Acepto la exoneración de responsabilidad *
                    </label>
                  </div>
                  {errors.liabilityWaiver && (
                    <p className="text-sm text-red-600">{errors.liabilityWaiver.message}</p>
                  )}

                  <div className="flex items-start">
                    <input
                      type="checkbox"
                      {...register('termsAcceptance', { required: 'Debes aceptar los términos y condiciones' })}
                      className="h-4 w-4 text-red-600 focus:ring-red-500 border-gray-300 rounded mt-1"
                    />
                    <label className="ml-3 block text-sm text-gray-700">
                      Acepto los términos y condiciones *
                    </label>
                  </div>
                  {errors.termsAcceptance && (
                    <p className="text-sm text-red-600">{errors.termsAcceptance.message}</p>
                  )}
                </div>

                <div className="bg-gray-50 p-4 rounded-md">
                  <h3 className="text-sm font-medium text-gray-700 mb-2">
                    Al hacer clic en "FINALIZAR REGISTRO":
                  </h3>
                  <ul className="text-xs text-gray-600 list-disc list-inside space-y-1">
                    <li>Se enviará la información a la API</li>
                    <li>Se creará tu cuenta en la base de datos</li>
                    <li>Recibirás una confirmación</li>
                    <li>Serás redirigido a la página de éxito</li>
                  </ul>
                </div>
              </div>
            )}

            {/* Botones de navegación */}
            <div className="mt-8 flex justify-between">
              {currentStep > 1 && (
                <button 
                  type="button" 
                  onClick={handlePrevStep}
                  className="bg-gray-300 hover:bg-gray-400 text-gray-800 font-bold py-2 px-4 rounded-md transition duration-300"
                >
                  ← Anterior
                </button>
              )}
              
              {currentStep < totalSteps && (
                <button 
                  type="button" 
                  onClick={handleNextStep}
                  className="bg-red-600 hover:bg-red-700 text-white font-bold py-2 px-4 rounded-md transition duration-300 ml-auto"
                >
                  Siguiente →
                </button>
              )}
              
              {currentStep === totalSteps && (
                <button 
                  type="submit" 
                  disabled={isSubmitting}
                  onClick={handleButtonClick}
                  className="bg-green-500 hover:bg-green-600 text-white font-bold py-3 px-6 rounded-md transition duration-300 ml-auto disabled:bg-gray-400"
                >
                  {isSubmitting ? '⏳ Enviando...' : '🚀 FINALIZAR REGISTRO'}
                </button>
              )}
            </div>
          </form>

          <div className="mt-8 text-center">
            <p className="text-sm text-gray-600">
              Esta es una versión simplificada para diagnosticar problemas.
            </p>
            <p className="text-xs text-gray-500 mt-2">
              Abre la consola del navegador (F12) para ver logs detallados.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default SimpleRegisterTest;
