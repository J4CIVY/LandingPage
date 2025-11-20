'use client';

import { useState, useEffect, type FC, Fragment } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { compatibleUserSchema as userSchema, type CompatibleUserSchema as FormUserSchema } from '@/schemas/compatibleUserSchema';
import { FaUser, FaPhone, FaHeartbeat, FaMotorcycle, FaLock, FaEye, FaEyeSlash, FaVenusMars, FaExclamationTriangle, FaCheckCircle } from 'react-icons/fa';
import { GiSteelwingEmblem } from 'react-icons/gi';
import { useRouter } from 'next/navigation';
import FormError from '../../components/shared/FormError';
import ImageUpload from '../../components/shared/ImageUpload';
import {
  colombianMunicipalities,
  genderIdentities,
  occupations,
  disciplines,
  colombianEPS,
  motorcycleBrands,
  generateYears,
} from '@/data/formOptions';
import { useBeforeUnload } from '@/hooks/useConfirmation';
import { useSuccessToast, useErrorToast, useInfoToast } from '@/components/shared/ToastProvider';
import { useRecaptcha, RecaptchaActions } from '@/lib/recaptcha-client';
import { safeJsonParse } from '@/lib/json-utils';
import { useEmailValidation } from '@/hooks/useEmailValidation';
import { usePhoneValidation } from '@/hooks/usePhoneValidation';

const years = generateYears();

const UserRegister: FC = () => {
  const { register, handleSubmit, formState: { errors }, watch, trigger, setValue } = useForm<FormUserSchema>({
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    resolver: zodResolver(userSchema) as any,
    mode: 'onTouched',
    defaultValues: {
      country: 'Colombia',
      emergencyContactCountry: 'Colombia',
      membershipType: 'friend' as const,
    }
  });
  
  // Clase común para todos los campos de entrada que soporta tema claro/oscuro
  const getInputClassName = (hasError: boolean) => 
    `block w-full px-3 py-2 border ${hasError ? 'border-red-500' : 'border-gray-300 dark:border-gray-600'} rounded-md shadow-sm focus:outline-none focus:ring-red-500 focus:border-red-500 bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100 placeholder-gray-500 dark:placeholder-gray-400`;
  
  const [currentStep, setCurrentStep] = useState<number>(1);
  const [isSubmitting, setIsSubmitting] = useState<boolean>(false);
  const [submitError, setSubmitError] = useState<string>('');
  const [showPassword, setShowPassword] = useState<boolean>(false);
  const [isClient, setIsClient] = useState(false);
  const router = useRouter();
  
  // Initialize client-side only
  useEffect(() => {
    setIsClient(true);
  }, []);
  
  const successToast = isClient ? useSuccessToast() : (() => {}) as any;
  const errorToast = isClient ? useErrorToast() : (() => {}) as any;
  const infoToast = isClient ? useInfoToast() : (() => {}) as any;
  
  // reCAPTCHA hook for bot protection
  const { verify } = useRecaptcha();

  // Custom validation hooks
  const emailValidation = useEmailValidation();
  const phoneValidation = usePhoneValidation();
  const whatsappValidation = usePhoneValidation();
  const emergencyPhoneValidation = usePhoneValidation();

  const totalSteps: number = 8;

  const stepFields: (keyof FormUserSchema)[][] = [
    ['documentType', 'documentNumber', 'firstName', 'lastName', 'birthDate', 'birthPlace'],
    ['phone', 'whatsapp', 'email', 'address', 'neighborhood', 'city', 'country', 'postalCode'],
    ['binaryGender', 'genderIdentity', 'occupation', 'discipline'],
    ['bloodType', 'rhFactor', 'allergies', 'healthInsurance'],
    ['emergencyContactName', 'emergencyContactRelationship', 'emergencyContactPhone'],
    ['motorcyclePlate', 'motorcycleBrand', 'motorcycleModel', 'motorcycleYear'],
    ['password', 'confirmPassword', 'dataConsent', 'liabilityWaiver', 'termsAcceptance'],
    [], // Paso 8: Confirmación (sin validación adicional)
  ];

  const allFormData = watch();
  
  // Detectar si el formulario tiene cambios
  const hasFormChanges = Object.values(allFormData).some(value => 
    value !== undefined && value !== '' && value !== false
  );

  // Confirmar antes de salir si hay cambios no guardados
  useBeforeUnload({ 
    enabled: hasFormChanges && !isSubmitting,
    message: '¿Estás seguro de que quieres salir? Se perderán los cambios no guardados.'
  });

  // Auto-save form data to localStorage (SECURITY FIX: Exclude sensitive data)
  useEffect(() => {
    const timeoutId = setTimeout(() => {
      if (Object.keys(allFormData).length > 0 && (allFormData.firstName || allFormData.email || allFormData.documentNumber)) {
        // SECURITY: Never save passwords or sensitive data to localStorage
        // eslint-disable-next-line @typescript-eslint/no-unused-vars
        const { password, confirmPassword, ...safeData } = allFormData;
        
        localStorage.setItem('bskmt-registration-draft', JSON.stringify({
          data: safeData,
          step: currentStep,
          timestamp: Date.now()
        }));
      }
    }, 2000); // Debounce de 2 segundos

    return () => clearTimeout(timeoutId);
  }, [allFormData, currentStep]);

  // Load saved data on component mount
  useEffect(() => {
    const savedData = localStorage.getItem('bskmt-registration-draft');
    if (savedData) {
      try {
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        const parsed = safeJsonParse<{ data: Record<string, any>; step: number; timestamp: number }>(
          savedData, 
          { data: {}, step: 1, timestamp: 0 }
        );
        const { data, step, timestamp } = parsed;
        
        // Solo cargar si es menos de 24 horas
        if (Date.now() - timestamp < 24 * 60 * 60 * 1000) {
          const shouldRestore = confirm(
            '¿Deseas continuar con un registro guardado anteriormente?'
          );
          if (shouldRestore) {
            Object.keys(data).forEach(key => {
              // SECURITY: Skip password fields even if somehow present
              if (key !== 'password' && key !== 'confirmPassword' && data[key] && data[key] !== '') {
                // eslint-disable-next-line @typescript-eslint/no-explicit-any
                setValue(key as any, data[key]);
              }
            });
            setCurrentStep(step);
          } else {
            localStorage.removeItem('bskmt-registration-draft');
          }
        } else {
          localStorage.removeItem('bskmt-registration-draft');
        }
      } catch (error) {
        console.error('Error loading saved registration data:', error);
        localStorage.removeItem('bskmt-registration-draft');
      }
    }
  }, [setValue]);

  const onSubmit = async (data: FormUserSchema) => {
    
    if (isSubmitting) {
      return;
    }
    
    setIsSubmitting(true);
    setSubmitError('');
    
    try {
      // 1. Execute reCAPTCHA verification BEFORE submitting
      const recaptchaToken = await verify(RecaptchaActions.REGISTER);
      
      if (!recaptchaToken) {
        errorToast('Error en la verificación de seguridad. Por favor, recarga la página e intenta nuevamente.');
        return;
      }
      
      // Calcular edad más precisa
      const birthDate = new Date(data.birthDate);
      const today = new Date();
      let age = today.getFullYear() - birthDate.getFullYear();
      const monthDiff = today.getMonth() - birthDate.getMonth();
      
      if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < birthDate.getDate())) {
        // eslint-disable-next-line @typescript-eslint/no-unused-vars
        age--; // age is calculated but not used - kept for potential future use
      }
      
      // Remover confirmPassword y preparar datos para la API
      // eslint-disable-next-line @typescript-eslint/no-unused-vars
      const { confirmPassword, ...submissionData } = data;

      // Mapear los datos del formulario al formato esperado por la API
      const userData = {
        // Información personal básica
        documentType: submissionData.documentType,
        documentNumber: submissionData.documentNumber,
        firstName: submissionData.firstName,
        lastName: submissionData.lastName,
        birthDate: submissionData.birthDate,
        birthPlace: submissionData.birthPlace,
        
        // Información de contacto
        phone: submissionData.phone,
        whatsapp: submissionData.whatsapp || '',
        email: submissionData.email,
        address: submissionData.address,
        neighborhood: submissionData.neighborhood || '',
        city: submissionData.city,
        country: submissionData.country,
        postalCode: submissionData.postalCode || '',
        
        // Información de género
        binaryGender: submissionData.binaryGender,
        genderIdentity: submissionData.genderIdentity || '',
        occupation: submissionData.occupation || '',
        discipline: submissionData.discipline || '',
        
        // Información de salud
        bloodType: submissionData.bloodType || '',
        rhFactor: submissionData.rhFactor || '',
        allergies: submissionData.allergies || '',
        healthInsurance: submissionData.healthInsurance || '',
        
        // Contacto de emergencia
        emergencyContactName: submissionData.emergencyContactName,
        emergencyContactRelationship: submissionData.emergencyContactRelationship,
        emergencyContactPhone: submissionData.emergencyContactPhone,
        emergencyContactAddress: submissionData.emergencyContactAddress || '',
        emergencyContactNeighborhood: submissionData.emergencyContactNeighborhood || '',
        emergencyContactCity: submissionData.emergencyContactCity || '',
        emergencyContactCountry: submissionData.emergencyContactCountry || '',
        emergencyContactPostalCode: submissionData.emergencyContactPostalCode || '',
        
        // Información de motocicleta
        motorcycleBrand: submissionData.motorcycleBrand || '',
        motorcycleModel: submissionData.motorcycleModel || '',
        motorcycleYear: submissionData.motorcycleYear || '',
        motorcyclePlate: submissionData.motorcyclePlate || '',
        motorcycleEngineSize: submissionData.motorcycleEngineSize || '',
        motorcycleColor: '',
        soatExpirationDate: '',
        technicalReviewExpirationDate: '',
        
        // Información de licencia
        licenseNumber: '',
        licenseCategory: '',
        licenseExpirationDate: '',
        
        // Información de BSK
        membershipType: 'friend' as const,
        password: submissionData.password,
        
        // Imagen de perfil
        profileImage: submissionData.profileImage || '',
        
        // Términos y condiciones (mapeo correcto a campos del backend)
        dataConsent: submissionData.dataConsent,
        liabilityWaiver: submissionData.liabilityWaiver,
        termsAcceptance: submissionData.termsAcceptance
      };

      // Enviar datos a la API NestJS
      const apiClient = (await import('@/lib/api-client')).default;
      
      try {
        const result = await apiClient.post('/auth/register', {
          ...userData,
          recaptchaToken // Include reCAPTCHA token
        });
        
        console.log('✅ Usuario registrado exitosamente:', result);
      } catch (error: unknown) {
        // Manejar errores de la API
        const err = error as { response?: { data?: { message?: string; errors?: string[] | string } } };
        
        if (err.response?.data?.errors) {
          const validationErrors = Array.isArray(err.response.data.errors) 
            ? err.response.data.errors.join(', ')
            : typeof err.response.data.errors === 'string' 
              ? err.response.data.errors 
              : 'Errores de validación en los datos enviados';
          const errorMsg = `Errores de validación: ${validationErrors}`;
          console.error('❌ Error en registro:', errorMsg);
          errorToast('Error de validación', errorMsg);
          return;
        } else if (err.response?.data?.message) {
          console.error('❌ Error en registro:', err.response.data.message);
          errorToast('Error de registro', err.response.data.message);
          return;
        } else {
          const errorMsg = error instanceof Error ? error.message : 'Error al registrar usuario';
          console.error('❌ Error en registro:', errorMsg);
          errorToast('Error de registro', errorMsg);
          return;
        }
      }

      
      // Enviar correo de bienvenida (opcional - el backend puede manejarlo)
      try {
        const apiClient = (await import('@/lib/api-client')).default;
        await apiClient.post('/contact/send', {
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
        });
      } catch (emailError) {
        console.warn('⚠️ Error enviando correo de bienvenida:', emailError);
        // No interrumpir el flujo de registro por error de email
      }
      
      // Limpiar draft guardado al completar registro exitosamente
      localStorage.removeItem('bskmt-registration-draft');
      
      successToast(
        '¡Registro exitoso!', 
        `Bienvenido ${userData.firstName}! Tu cuenta ha sido creada exitosamente. Se ha enviado un correo de confirmación.`
      );
      
      // Redireccionar a página de éxito
      setTimeout(() => {
        router.push('/registration-success');
      }, 2000);
      
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    } catch (error: any) {
      console.error('❌ Error en registro:', error);
      
      let errorMessage = 'Error inesperado. Por favor intenta nuevamente.';
      
      // Manejar errores específicos de la API
      if (error.message) {
        if (error.message.includes('ya existe') || error.message.includes('already exists')) {
          errorMessage = 'Este email o número de documento ya está registrado. Intenta con datos diferentes.';
          setCurrentStep(1); // Ir al primer paso
        } else if (error.message.includes('validation') || error.message.includes('validación')) {
          errorMessage = `Error de validación: ${error.message}`;
        } else if (error.message.includes('network') || error.message.includes('fetch')) {
          errorMessage = 'Error de conexión. Verifica tu internet e intenta nuevamente.';
        } else {
          errorMessage = error.message;
        }
      }
      
      setSubmitError(errorMessage);
      errorToast('Error en el registro', errorMessage);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleNextStep = async () => {
    const fieldsToValidate = stepFields[currentStep - 1];
    const isValid = await trigger(fieldsToValidate);
    
    if (isValid) {
      setCurrentStep(prev => Math.min(prev + 1, totalSteps));
      infoToast('¡Progreso guardado!', 'Tus datos han sido guardados automáticamente. Puedes continuar cuando gustes.');
    } else {
      const firstError = document.querySelector('.border-red-500');
      if (firstError) {
        firstError.scrollIntoView({ behavior: 'smooth', block: 'center' });
      }
    }
  };

  const prevStep = () => {
    setCurrentStep(prev => Math.max(prev - 1, 1));
  };

  const renderStepIndicator = () => {
    const stepIcons = [FaUser, FaPhone, FaVenusMars, FaHeartbeat, FaExclamationTriangle, FaMotorcycle, FaLock, FaCheckCircle];
    return (
      <div className="flex justify-center items-center mb-8">
        {stepIcons.map((Icon, index) => (
          <Fragment key={index}>
            <div 
              className={`w-10 h-10 rounded-full flex items-center justify-center text-white font-medium text-lg ${currentStep > index + 1 ? 'bg-green-500' : currentStep === index + 1 ? 'bg-red-600' : 'bg-gray-300'}`}
              aria-current={currentStep === index + 1 ? 'step' : undefined}
              aria-label={`Paso ${index + 1} de ${totalSteps}`}
            >
              <Icon />
            </div>
            {index < totalSteps - 1 && (
              <div className={`h-1 grow ${currentStep > index + 1 ? 'bg-green-500' : 'bg-gray-300'}`}></div>
            )}
          </Fragment>
        ))}
      </div>
    );
  };

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 py-8 px-4 sm:px-6 lg:px-8">
      <div className="max-w-4xl mx-auto bg-white dark:bg-gray-800 rounded-xl shadow-md overflow-hidden">
        <div className="p-8">
          <div className="flex items-center justify-center mb-6">
            <GiSteelwingEmblem className="text-red-600 dark:text-red-400 text-5xl mr-3" aria-hidden="true" />
            <h1 className="text-3xl font-bold text-gray-900 dark:text-gray-100">
              Registro de Miembro
            </h1>
          </div>

          {renderStepIndicator()}
          
          {submitError && (
            <div className="bg-red-100 dark:bg-red-900/20 border-l-4 border-red-500 dark:border-red-400 text-red-700 dark:text-red-300 p-4 mb-6" role="alert">
              <p className="font-bold">Error de Registro</p>
              <p>{submitError}</p>
            </div>
          )}

          <form onSubmit={handleSubmit(onSubmit)}>
            {/* Step 1: Personal Information */}
            {currentStep === 1 && (
              <section className="space-y-6 ">
                <h2 className="text-xl font-semibold text-gray-800 dark:text-gray-200 flex items-center"><FaUser  className="mr-2 text-red-600" />Información Personal</h2>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  {/* Document Type */}
                  <div>
                    <label htmlFor="documentType" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Tipo de Documento <span className="text-red-500">*</span></label>
                    <select id="documentType" {...register("documentType", { required: "Campo obligatorio" })} className={getInputClassName(!!errors.documentType)}>
                      <option value="">Seleccione...</option>
                      <option value="CC">Cédula de Ciudadanía</option>
                      <option value="CE">Cédula de Extranjería</option>
                      <option value="TI">Tarjeta de Identidad</option>
                      <option value="PA">Pasaporte</option>
                      <option value="NIT">NIT</option>
                      <option value="OTRO">Otro</option>
                    </select>
                    <FormError error={errors.documentType} />
                  </div>

                  {/* Document Number */}
                  <div>
                    <label htmlFor="documentNumber" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Número de Documento <span className="text-red-500">*</span></label>
                    <input type="text" id="documentNumber" {...register("documentNumber", { required: "Campo obligatorio", pattern: { value: /^[0-9]+$/, message: "Solo números permitidos" } })} className={getInputClassName(!!errors.documentNumber)} />
                    <FormError error={errors.documentNumber} />
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  {/* First Name */}
                  <div>
                    <label htmlFor="firstName" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Nombres <span className="text-red-500">*</span></label>
                    <input type="text" id="firstName" {...register("firstName", { required: "Campo obligatorio", maxLength: { value: 50, message: "Máximo 50 caracteres" } })} className={getInputClassName(!!errors.firstName)} />
                    <FormError error={errors.firstName} />
                  </div>

                  {/* Last Name */}
                  <div>
                    <label htmlFor="lastName" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Apellidos <span className="text-red-500">*</span></label>
                    <input type="text" id="lastName" {...register("lastName", { required: "Campo obligatorio", maxLength: { value: 50, message: "Máximo 50 caracteres" } })} className={getInputClassName(!!errors.lastName)} />
                    <FormError error={errors.lastName} />
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  {/* Birth Date */}
                  <div>
                    <label htmlFor="birthDate" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Fecha de Nacimiento <span className="text-red-500">*</span></label>
                    <input type="date" id="birthDate" {...register("birthDate", { required: "Campo obligatorio" })} className={getInputClassName(!!errors.birthDate)} />
                    <FormError error={errors.birthDate} />
                  </div>

                  {/* Birth Place */}
                  <div>
                    <label htmlFor="birthPlace" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Lugar de Nacimiento <span className="text-red-500">*</span></label>
                    <select id="birthPlace" {...register("birthPlace", { required: "Campo obligatorio" })} className={getInputClassName(!!errors.birthPlace)}>
                      <option value="">Seleccione...</option>
                      {colombianMunicipalities.map((municipality: string) => (
                        <option key={municipality} value={municipality}>{municipality}</option>
                      ))}
                    </select>
                    <FormError error={errors.birthPlace} />
                  </div>
                </div>

                {/* Profile Image Upload */}
                <div className="mt-8">
                  <h3 className="text-lg font-medium text-gray-800 dark:text-gray-200 mb-4 flex items-center">
                    <FaUser className="mr-2 text-red-600" />
                    Foto de Perfil (Opcional)
                  </h3>
                  <div className="bg-gray-50 dark:bg-gray-800 rounded-lg p-6">
                    <ImageUpload
                      onImageUploaded={(imageUrl) => setValue('profileImage', imageUrl)}
                      currentImageUrl={watch('profileImage')}
                      folder="user-profiles"
                      publicIdPrefix={`user_${watch('documentNumber')}`}
                      className="w-full"
                      isPublic={true}
                    />
                    <p className="text-sm text-gray-600 dark:text-gray-400 mt-3 text-center">
                      Sube una foto de perfil para personalizar tu cuenta. Esta imagen será visible para otros miembros del club.
                    </p>
                  </div>
                </div>
              </section>
            )}

            {/* Step 2: Contact Information */}
            {currentStep === 2 && (
              <section className="space-y-6 ">
                <h2 className="text-xl font-semibold text-gray-800 dark:text-gray-200 flex items-center"><FaPhone className="mr-2 text-red-600" />Información de Contacto</h2>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  {/* Phone */}
                  <div>
                    <label htmlFor="phone" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Teléfono <span className="text-red-500">*</span></label>
                    <input 
                      type="tel" 
                      id="phone" 
                      {...register("phone", { 
                        required: "Campo obligatorio",
                        onChange: (e) => {
                          phoneValidation.handleChange(e.target.value);
                          setValue('phone', e.target.value);
                        }
                      })} 
                      className={getInputClassName(!!errors.phone || !phoneValidation.isValid)} 
                    />
                    {phoneValidation.error && <p className="mt-1 text-sm text-red-600">{phoneValidation.error}</p>}
                    <FormError error={errors.phone} />
                  </div>

                  {/* WhatsApp */}
                  <div>
                    <label htmlFor="whatsapp" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">WhatsApp</label>
                    <input 
                      type="tel" 
                      id="whatsapp" 
                      {...register("whatsapp", {
                        onChange: (e) => {
                          whatsappValidation.handleChange(e.target.value);
                          setValue('whatsapp', e.target.value);
                        }
                      })} 
                      className={getInputClassName(!!errors.whatsapp || !whatsappValidation.isValid)} 
                    />
                    {whatsappValidation.error && <p className="mt-1 text-sm text-red-600">{whatsappValidation.error}</p>}
                    <FormError error={errors.whatsapp} />
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  {/* Email */}
                  <div>
                    <label htmlFor="email" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Correo Electrónico <span className="text-red-500">*</span></label>
                    <input 
                      type="email" 
                      id="email" 
                      {...register("email", { 
                        required: "Campo obligatorio",
                        onChange: (e) => {
                          emailValidation.handleChange(e.target.value);
                          setValue('email', e.target.value);
                        }
                      })} 
                      className={getInputClassName(!!errors.email || !emailValidation.isValid)} 
                    />
                    {emailValidation.error && <p className="mt-1 text-sm text-red-600">{emailValidation.error}</p>}
                    <FormError error={errors.email} />
                  </div>

                  {/* Address */}
                  <div>
                    <label htmlFor="address" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Dirección <span className="text-red-500">*</span></label>
                    <input type="text" id="address" {...register("address", { required: "Campo obligatorio" })} className={getInputClassName(!!errors.address)} />
                    <FormError error={errors.address} />
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  {/* Neighborhood */}
                  <div>
                    <label htmlFor="neighborhood" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Barrio</label>
                    <input type="text" id="neighborhood" {...register("neighborhood")} className={getInputClassName(!!errors.neighborhood)} />
                    <FormError error={errors.neighborhood} />
                  </div>

                  {/* City */}
                  <div>
                    <label htmlFor="city" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Ciudad <span className="text-red-500">*</span></label>
                    <select id="city" {...register("city", { required: "Campo obligatorio" })} className={getInputClassName(!!errors.city)}>
                      <option value="">Seleccione...</option>
                      {colombianMunicipalities.map((municipality: string) => (
                        <option key={municipality} value={municipality}>{municipality}</option>
                      ))}
                    </select>
                    <FormError error={errors.city} />
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  {/* Country */}
                  <div>
                    <label htmlFor="country" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">País <span className="text-red-500">*</span></label>
                    <input type="text" id="country" {...register("country", { required: "Campo obligatorio" })} className={getInputClassName(!!errors.country)} />
                    <FormError error={errors.country} />
                  </div>

                  {/* Postal Code */}
                  <div>
                    <label htmlFor="postalCode" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Código Postal</label>
                    <input type="text" id="postalCode" {...register("postalCode")} className={getInputClassName(!!errors.postalCode)} />
                    <FormError error={errors.postalCode} />
                  </div>
                </div>
              </section>
            )}

            {/* Step 3: Professional & Gender Details */}
            {currentStep === 3 && (
              <section className="space-y-6 ">
                <h2 className="text-xl font-semibold text-gray-800 dark:text-gray-200 flex items-center"><FaVenusMars className="mr-2 text-red-600" />Detalles Profesionales y de Género</h2>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  {/* Binary Gender */}
                  <div>
                    <label htmlFor="binaryGender" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Género Binario <span className="text-red-500">*</span></label>
                    <select id="binaryGender" {...register("binaryGender", { required: "Campo obligatorio" })} className={getInputClassName(!!errors.binaryGender)}>
                      <option value="">Seleccione...</option>
                      <option value="Masculino">Masculino</option>
                      <option value="Femenino">Femenino</option>
                      <option value="Prefiero no decir">Prefiero no decir</option>
                    </select>
                    <FormError error={errors.binaryGender} />
                  </div>

                  {/* Gender Identity */}
                  <div>
                    <label htmlFor="genderIdentity" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Identidad de Género</label>
                    <select id="genderIdentity" {...register("genderIdentity")} className={getInputClassName(!!errors.genderIdentity)}>
                      <option value="">Seleccione...</option>
                      {genderIdentities.map((identity: string) => (
                        <option key={identity} value={identity}>{identity}</option>
                      ))}
                    </select>
                    <FormError error={errors.genderIdentity} />
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  {/* Occupation */}
                  <div>
                    <label htmlFor="occupation" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Ocupación</label>
                    <select id="occupation" {...register("occupation")} className={getInputClassName(!!errors.occupation)}>
                      <option value="">Seleccione...</option>
                      {occupations.map((occupation: string) => (
                        <option key={occupation} value={occupation}>{occupation}</option>
                      ))}
                    </select>
                    <FormError error={errors.occupation} />
                  </div>

                  {/* Discipline */}
                  <div>
                    <label htmlFor="discipline" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Disciplina</label>
                    <select id="discipline" {...register("discipline")} className={getInputClassName(!!errors.discipline)}>
                      <option value="">Seleccione...</option>
                      {disciplines.map((discipline: string) => (
                        <option key={discipline} value={discipline}>{discipline}</option>
                      ))}
                    </select>
                    <FormError error={errors.discipline} />
                  </div>
                </div>
              </section>
            )}

            {/* Step 4: Medical Information */}
            {currentStep === 4 && (
              <section className="space-y-6 ">
                <h2 className="text-xl font-semibold text-gray-800 dark:text-gray-200 flex items-center"><FaHeartbeat className="mr-2 text-red-600" />Información Médica</h2>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  {/* Blood Type */}
                  <div>
                    <label htmlFor="bloodType" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Tipo de Sangre</label>
                    <select id="bloodType" {...register("bloodType")} className={getInputClassName(!!errors.bloodType)}>
                      <option value="">Seleccione...</option>
                      <option value="A">A</option>
                      <option value="B">B</option>
                      <option value="AB">AB</option>
                      <option value="O">O</option>
                    </select>
                    <FormError error={errors.bloodType} />
                  </div>

                  {/* Rh Factor */}
                  <div>
                    <label htmlFor="rhFactor" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Factor Rh</label>
                    <select id="rhFactor" {...register("rhFactor")} className={getInputClassName(!!errors.rhFactor)}>
                      <option value="">Seleccione...</option>
                      <option value="+">+</option>
                      <option value="-">-</option>
                    </select>
                    <FormError error={errors.rhFactor} />
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  {/* Allergies */}
                  <div>
                    <label htmlFor="allergies" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Alergias</label>
                    <textarea id="allergies" {...register("allergies")} className={getInputClassName(!!errors.allergies)} />
                    <FormError error={errors.allergies} />
                  </div>

                  {/* Health Insurance */}
                  <div>
                    <label htmlFor="healthInsurance" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Seguro de Salud</label>
                    <select id="healthInsurance" {...register("healthInsurance")} className={getInputClassName(!!errors.healthInsurance)}>
                      <option value="">Seleccione...</option>
                      {colombianEPS.map((eps: string) => (
                        <option key={eps} value={eps}>{eps}</option>
                      ))}
                    </select>
                    <FormError error={errors.healthInsurance} />
                  </div>
                </div>
              </section>
            )}

            {/* Step 5: Emergency Contact */}
            {currentStep === 5 && (
              <section className="space-y-6 ">
                <h2 className="text-xl font-semibold text-gray-800 dark:text-gray-200 flex items-center"><FaExclamationTriangle className="mr-2 text-red-600" />Contacto de Emergencia</h2>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  {/* Emergency Contact Name */}
                  <div>
                    <label htmlFor="emergencyContactName" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Nombre del Contacto <span className="text-red-500">*</span></label>
                    <input type="text" id="emergencyContactName" {...register("emergencyContactName", { required: "Campo obligatorio" })} className={getInputClassName(!!errors.emergencyContactName)} />
                    <FormError error={errors.emergencyContactName} />
                  </div>

                  {/* Emergency Contact Relationship */}
                  <div>
                    <label htmlFor="emergencyContactRelationship" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Relación con el Contacto <span className="text-red-500">*</span></label>
                    <input type="text" id="emergencyContactRelationship" {...register("emergencyContactRelationship", { required: "Campo obligatorio" })} className={getInputClassName(!!errors.emergencyContactRelationship)} />
                    <FormError error={errors.emergencyContactRelationship} />
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  {/* Emergency Contact Phone */}
                  <div>
                    <label htmlFor="emergencyContactPhone" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Teléfono del Contacto <span className="text-red-500">*</span></label>
                    <input 
                      type="tel" 
                      id="emergencyContactPhone" 
                      {...register("emergencyContactPhone", { 
                        required: "Campo obligatorio",
                        onChange: (e) => {
                          emergencyPhoneValidation.handleChange(e.target.value);
                          setValue('emergencyContactPhone', e.target.value);
                        }
                      })} 
                      className={getInputClassName(!!errors.emergencyContactPhone || !emergencyPhoneValidation.isValid)} 
                    />
                    {emergencyPhoneValidation.error && <p className="mt-1 text-sm text-red-600">{emergencyPhoneValidation.error}</p>}
                    <FormError error={errors.emergencyContactPhone} />
                  </div>

                  {/* Emergency Contact Neighborhood */}
                  <div>
                    <label htmlFor="emergencyContactNeighborhood" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Barrio del Contacto</label>
                    <input type="text" id="emergencyContactNeighborhood" {...register("emergencyContactNeighborhood")} className={getInputClassName(!!errors.emergencyContactNeighborhood)} />
                    <FormError error={errors.emergencyContactNeighborhood} />
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  {/* Emergency Contact City */}
                  <div>
                    <label htmlFor="emergencyContactCity" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Ciudad del Contacto <span className="text-red-500">*</span></label>
                    <select id="emergencyContactCity" {...register("emergencyContactCity", { required: "Campo obligatorio" })} className={getInputClassName(!!errors.emergencyContactCity)}>
                      <option value="">Seleccione...</option>
                      {colombianMunicipalities.map((municipality: string) => (
                        <option key={municipality} value={municipality}>{municipality}</option>
                      ))}
                    </select>
                    <FormError error={errors.emergencyContactCity} />
                  </div>

                  {/* Emergency Contact Country */}
                  <div>
                    <label htmlFor="emergencyContactCountry" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">País del Contacto <span className="text-red-500">*</span></label>
                    <input type="text" id="emergencyContactCountry" {...register("emergencyContactCountry", { required: "Campo obligatorio" })} className={getInputClassName(!!errors.emergencyContactCountry)} />
                    <FormError error={errors.emergencyContactCountry} />
                  </div>
                </div>
              </section>
            )}

            {/* Step 6: Motorcycle Details */}
            {currentStep === 6 && (
              <section className="space-y-6 ">
                <h2 className="text-xl font-semibold text-gray-800 dark:text-gray-200 flex items-center"><FaMotorcycle className="mr-2 text-red-600" />Detalles de la Motocicleta</h2>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  {/* Motorcycle Plate */}
                  <div>
                    <label htmlFor="motorcyclePlate" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Placa de la Motocicleta <span className="text-red-500">*</span></label>
                    <input type="text" id="motorcyclePlate" {...register("motorcyclePlate", { required: "Campo obligatorio" })} className={getInputClassName(!!errors.motorcyclePlate)} />
                    <FormError error={errors.motorcyclePlate} />
                  </div>

                  {/* Motorcycle Brand */}
                  <div>
                    <label htmlFor="motorcycleBrand" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Marca de la Motocicleta <span className="text-red-500">*</span></label>
                    <select id="motorcycleBrand" {...register("motorcycleBrand", { required: "Campo obligatorio" })} className={getInputClassName(!!errors.motorcycleBrand)}>
                      <option value="">Seleccione...</option>
                      {motorcycleBrands.map((brand: string) => (
                        <option key={brand} value={brand}>{brand}</option>
                      ))}
                    </select>
                    <FormError error={errors.motorcycleBrand} />
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  {/* Motorcycle Model */}
                  <div>
                    <label htmlFor="motorcycleModel" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Modelo <span className="text-red-500">*</span></label>
                    <input type="text" id="motorcycleModel" {...register("motorcycleModel", { required: "Campo obligatorio" })} className={getInputClassName(!!errors.motorcycleModel)} />
                    <FormError error={errors.motorcycleModel} />
                  </div>

                  {/* Motorcycle Year */}
                  <div>
                    <label htmlFor="motorcycleYear" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Año <span className="text-red-500">*</span></label>
                    <select id="motorcycleYear" {...register("motorcycleYear", { required: "Campo obligatorio" })} className={getInputClassName(!!errors.motorcycleYear)}>
                      <option value="">Seleccione...</option>
                      {years.map((year: string) => (
                        <option key={year} value={year}>{year}</option>
                      ))}
                    </select>
                    <FormError error={errors.motorcycleYear} />
                  </div>
                </div>
              </section>
            )}

            {/* Step 7: Security and Consents */}
            {currentStep === 7 && (
              <section className="space-y-6 ">
                <h2 className="text-xl font-semibold text-gray-800 dark:text-gray-200 flex items-center"><FaLock className="mr-2 text-red-600" />Seguridad y Consentimientos</h2>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  {/* Password */}
                  <div className="relative">
                    <label htmlFor="password"
                           className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Contraseña <span
                      className="text-red-500">*</span></label>
                    <input type={showPassword ? "text" : "password"} id="password" {...register("password")}
                           className={getInputClassName(!!errors.password)}/>
                    <button type="button" onClick={() => setShowPassword(!showPassword)}
                            className="absolute inset-y-0 right-0 top-6 pr-3 flex items-center text-sm leading-5 transition-colors text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-200">
                      {showPassword ? <FaEyeSlash/> : <FaEye/>}
                    </button>
                    <FormError error={errors.password}/>
                  </div>

                  {/* Confirm Password */}
                  <div>
                    <label htmlFor="confirmPassword"
                           className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Confirmar
                      Contraseña <span className="text-red-500">*</span></label>
                    <input type="password" id="confirmPassword" {...register("confirmPassword")}
                           className={getInputClassName(!!errors.confirmPassword)}/>
                    <FormError error={errors.confirmPassword}/>
                  </div>
                </div>
                <div className="space-y-4">
                  {/* Data Consent */}
                  <div className="flex items-start">
                    <input id="dataConsent" type="checkbox" {...register("dataConsent")}
                           className="h-4 w-4 text-red-600 focus:ring-red-500 border-gray-300 dark:border-gray-600 rounded mt-1 bg-white dark:bg-gray-800"/>
                    <label htmlFor="dataConsent" className="ml-3 block text-sm text-gray-700 dark:text-gray-300">
                      Autorizo el tratamiento de mis datos personales conforme a la política de privacidad. <span
                      className="text-red-500">*</span>
                    </label>
                  </div>
                  <FormError error={errors.dataConsent}/>

                  {/* Liability Waiver */}
                  <div className="flex items-start">
                    <input id="liabilityWaiver" type="checkbox" {...register("liabilityWaiver")}
                           className="h-4 w-4 text-red-600 focus:ring-red-500 border-gray-300 dark:border-gray-600 rounded mt-1 bg-white dark:bg-gray-800"/>
                    <label htmlFor="liabilityWaiver" className="ml-3 block text-sm text-gray-700 dark:text-gray-300">
                      Acepto el aviso de exención de responsabilidad y asumo los riesgos asociados a las actividades.
                      <span className="text-red-500">*</span>
                    </label>
                  </div>
                  <FormError error={errors.liabilityWaiver}/>

                  {/* Terms Acceptance */}
                  <div className="flex items-start">
                    <input id="termsAcceptance" type="checkbox" {...register("termsAcceptance")}
                           className="h-4 w-4 text-red-600 focus:ring-red-500 border-gray-300 dark:border-gray-600 rounded mt-1 bg-white dark:bg-gray-800"/>
                    <label htmlFor="termsAcceptance" className="ml-3 block text-sm text-gray-700 dark:text-gray-300">
                      He leído y acepto los términos y condiciones del club. <span
                      className="text-red-500">*</span>
                    </label>
                  </div>
                  <FormError error={errors.termsAcceptance}/>
                </div>
              </section>
            )}

            {/* Step 8: Confirmation */}
            {currentStep === 8 && (
              <section className="space-y-6 ">
                <h2 className="text-xl font-semibold text-gray-800 dark:text-gray-200 flex items-center"><FaCheckCircle
                  className="mr-2 text-red-600"/>Confirmación</h2>
                <div className="bg-gray-100 dark:bg-gray-800 p-6 rounded-lg">
                  <h3 className="text-lg font-bold mb-4 text-gray-900 dark:text-gray-100">Por favor, revisa tu información antes de
                    enviar.</h3>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-x-8 gap-y-4">
                    {Object.entries(allFormData)
                      .filter(([, value]) => value)
                      .filter(([key]) => key !== 'password' && key !== 'confirmPassword')
                      .map(([key, value]) => {
                        return (
                          <div key={key} className="text-gray-700 dark:text-gray-300">
                            <strong
                              className="capitalize text-gray-900 dark:text-gray-100">{key.replace(/([A-Z])/g, ' $1')}:</strong> {String(value)}
                          </div>
                        );
                      })}
                  </div>
                </div>
                <p className="text-sm text-gray-600 dark:text-gray-400">Al hacer clic en "Finalizar Registro", confirmas que
                  toda la información es correcta y aceptas unirte a BSK Motorcycle Team.</p>
              </section>
            )}

            {/* Navigation Buttons */}
            <div className="mt-8 flex justify-between">
              {currentStep > 1 && (
                <button type="button" onClick={prevStep}
                        className="bg-gray-300 dark:bg-gray-600 hover:bg-gray-400 dark:hover:bg-gray-500 text-gray-800 dark:text-gray-200 font-bold py-2 px-4 rounded-md">
                  Anterior
                </button>
              )}
              {currentStep < totalSteps && (
                <button type="button" onClick={handleNextStep}
                        className="bg-red-600 dark:bg-red-500 hover:bg-red-700 dark:hover:bg-red-400 text-white font-bold py-2 px-4 rounded-md ml-auto">
                  Siguiente
                </button>
              )}
              {currentStep === totalSteps && (
                <button 
                  type="submit" 
                  disabled={isSubmitting}
                  className="bg-green-500 dark:bg-green-600 hover:bg-green-600 dark:hover:bg-green-500 text-white font-bold py-2 px-4 rounded-md ml-auto disabled:bg-gray-400 dark:disabled:bg-gray-600">
                  {isSubmitting ? 'Enviando...' : 'Finalizar Registro'}
                </button>
              )}
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};

export default UserRegister;
