import React, { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { userSchema, UserSchema } from '@/schemas/userSchema';
import { FaUser, FaPhone, FaEnvelope, FaMapMarkerAlt, FaBriefcase, FaHeartbeat, FaMotorcycle, FaShieldAlt, FaLock, FaEye, FaEyeSlash, FaVenusMars, FaUserMd, FaExclamationTriangle, FaCheckCircle } from 'react-icons/fa';
import { GiSteelwingEmblem } from 'react-icons/gi';
import api from '@/components/api/Api';
import { useNavigate } from 'react-router-dom';
import FormError from '@/components/shared/FormError';
import {
  colombianMunicipalities,
  genderIdentities,
  occupations,
  disciplines,
  colombianEPS,
  motorcycleBrands,
  generateYears,
} from '@/data/formOptions';

const years = generateYears();

const UserRegister: React.FC = () => {
  const { register, handleSubmit, formState: { errors }, watch, trigger } = useForm<UserSchema>({
    resolver: zodResolver(userSchema),
    mode: 'onTouched',
    defaultValues: {
      country: 'Colombia',
      emergencyContactCountry: 'Colombia',
    }
  });
  
  const [currentStep, setCurrentStep] = useState<number>(1);
  const [isSubmitting, setIsSubmitting] = useState<boolean>(false);
  const [submitError, setSubmitError] = useState<string>('');
  const [showPassword, setShowPassword] = useState<boolean>(false);
  const navigate = useNavigate();

  const totalSteps: number = 8;

  const stepFields: (keyof UserSchema)[][] = [
    ['documentType', 'documentNumber', 'firstName', 'lastName', 'birthDate', 'birthPlace'],
    ['phone', 'whatsapp', 'email', 'address', 'neighborhood', 'city', 'country', 'postalCode'],
    ['binaryGender', 'genderIdentity', 'occupation', 'discipline'],
    ['bloodType', 'rhFactor', 'allergies', 'healthInsurance'],
    ['emergencyContactName', 'emergencyContactRelationship', 'emergencyContactPhone'],
    ['motorcyclePlate', 'motorcycleBrand', 'motorcycleModel', 'motorcycleYear', 'motorcycleDisplacement'],
    ['password', 'confirmPassword', 'dataConsent', 'liabilityWaiver', 'termsAcceptance'],
  ];

  const onSubmit = async (data: UserSchema) => {
    if (isSubmitting) return;
    setIsSubmitting(true);
    setSubmitError('');
    
    try {
      const birthDate: Date = new Date(data.birthDate);
      const age: number = new Date().getFullYear() - birthDate.getFullYear();
      
      const { confirmPassword, ...submissionData } = data;

      const userData = {
        ...submissionData,
        age: age,
        role: 'Membresia Friend',
        temporaryPassword: false
      };

      const response = await api.post('/users', userData);
      
      if (response.data.status === 'success') {
        navigate('/registration-success', { state: { userEmail: data.email } });
      } else {
        setSubmitError('Error en el registro. Por favor verifica tus datos.');
      }
    } catch (error: any) {
      console.error('Registration error:', error);
      if (error.response) {
        setSubmitError(error.response.data.message || 'Error en el servidor. Por favor intenta más tarde.');
      } else {
        setSubmitError('Error de conexión. Verifica tu conexión a internet.');
      }
      // Go to the step with the error if possible
      const errorMessage = error.response?.data?.message || '';
      if (errorMessage.includes('document number')) setCurrentStep(1);
      else if (errorMessage.includes('email')) setCurrentStep(2);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleNextStep = async () => {
    const fieldsToValidate = stepFields[currentStep - 1];
    const isValid = await trigger(fieldsToValidate);
    
    if (isValid) {
      setCurrentStep(prev => Math.min(prev + 1, totalSteps));
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
          <React.Fragment key={index}>
            <div 
              className={`w-10 h-10 rounded-full flex items-center justify-center text-white font-medium text-lg ${currentStep > index + 1 ? 'bg-green-500' : currentStep === index + 1 ? 'bg-red-600' : 'bg-gray-300'}`}
              aria-current={currentStep === index + 1 ? 'step' : undefined}
              aria-label={`Paso ${index + 1} de ${totalSteps}`}
            >
              <Icon />
            </div>
            {index < totalSteps - 1 && (
              <div className={`h-1 flex-grow ${currentStep > index + 1 ? 'bg-green-500' : 'bg-gray-300'}`}></div>
            )}
          </React.Fragment>
        ))}
      </div>
    );
  };

  const allFormData = watch();

  return (
    <div className="min-h-screen bg-gray-50 py-8 px-4 sm:px-6 lg:px-8">
      <div className="max-w-4xl mx-auto bg-white rounded-xl shadow-md overflow-hidden">
        <div className="p-8">
          <div className="flex items-center justify-center mb-6">
            <GiSteelwingEmblem className="text-red-600 text-5xl mr-3" aria-hidden="true" />
            <h1 className="text-3xl font-bold text-gray-900">Registro de Miembro</h1>
          </div>

          {renderStepIndicator()}
          
          {submitError && (
            <div className="bg-red-100 border-l-4 border-red-500 text-red-700 p-4 mb-6" role="alert">
              <p className="font-bold">Error de Registro</p>
              <p>{submitError}</p>
            </div>
          )}

          <form onSubmit={handleSubmit(onSubmit)}>
            {/* Step 1: Personal Information */}
            {currentStep === 1 && (
              <section className="space-y-6 animate-fadeIn">
                <h2 className="text-xl font-semibold text-gray-800 flex items-center"><FaUser  className="mr-2 text-red-600" />Información Personal</h2>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  {/* Document Type */}
                  <div>
                    <label htmlFor="documentType" className="block text-sm font-medium text-gray-700 mb-1">Tipo de Documento <span className="text-red-500">*</span></label>
                    <select id="documentType" {...register("documentType", { required: "Campo obligatorio" })} className={`block w-full px-3 py-2 border ${errors.documentType ? 'border-red-500' : 'border-gray-300'} rounded-md shadow-sm focus:outline-none focus:ring-red-500 focus:border-red-500`}>
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
                    <label htmlFor="documentNumber" className="block text-sm font-medium text-gray-700 mb-1">Número de Documento <span className="text-red-500">*</span></label>
                    <input type="text" id="documentNumber" {...register("documentNumber", { required: "Campo obligatorio", pattern: { value: /^[0-9]+$/, message: "Solo números permitidos" } })} className={`block w-full px-3 py-2 border ${errors.documentNumber ? 'border-red-500' : 'border-gray-300'} rounded-md shadow-sm focus:outline-none focus:ring-red-500 focus:border-red-500`} />
                    <FormError error={errors.documentNumber} />
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  {/* First Name */}
                  <div>
                    <label htmlFor="firstName" className="block text-sm font-medium text-gray-700 mb-1">Nombres <span className="text-red-500">*</span></label>
                    <input type="text" id="firstName" {...register("firstName", { required: "Campo obligatorio", maxLength: { value: 50, message: "Máximo 50 caracteres" } })} className={`block w-full px-3 py-2 border ${errors.firstName ? 'border-red-500' : 'border-gray-300'} rounded-md shadow-sm focus:outline-none focus:ring-red-500 focus:border-red-500`} />
                    <FormError error={errors.firstName} />
                  </div>

                  {/* Last Name */}
                  <div>
                    <label htmlFor="lastName" className="block text-sm font-medium text-gray-700 mb-1">Apellidos <span className="text-red-500">*</span></label>
                    <input type="text" id="lastName" {...register("lastName", { required: "Campo obligatorio", maxLength: { value: 50, message: "Máximo 50 caracteres" } })} className={`block w-full px-3 py-2 border ${errors.lastName ? 'border-red-500' : 'border-gray-300'} rounded-md shadow-sm focus:outline-none focus:ring-red-500 focus:border-red-500`} />
                    <FormError error={errors.lastName} />
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  {/* Birth Date */}
                  <div>
                    <label htmlFor="birthDate" className="block text-sm font-medium text-gray-700 mb-1">Fecha de Nacimiento <span className="text-red-500">*</span></label>
                    <input type="date" id="birthDate" {...register("birthDate", { required: "Campo obligatorio" })} className={`block w-full px-3 py-2 border ${errors.birthDate ? 'border-red-500' : 'border-gray-300'} rounded-md shadow-sm focus:outline-none focus:ring-red-500 focus:border-red-500`} />
                    <FormError error={errors.birthDate} />
                  </div>

                  {/* Birth Place */}
                  <div>
                    <label htmlFor="birthPlace" className="block text-sm font-medium text-gray-700 mb-1">Lugar de Nacimiento <span className="text-red-500">*</span></label>
                    <select id="birthPlace" {...register("birthPlace", { required: "Campo obligatorio" })} className={`block w-full px-3 py-2 border ${errors.birthPlace ? 'border-red-500' : 'border-gray-300'} rounded-md shadow-sm focus:outline-none focus:ring-red-500 focus:border-red-500`}>
                      <option value="">Seleccione...</option>
                      {colombianMunicipalities.map((municipality) => (
                        <option key={municipality} value={municipality}>{municipality}</option>
                      ))}
                    </select>
                    <FormError error={errors.birthPlace} />
                  </div>
                </div>
              </section>
            )}

            {/* Step 2: Contact Information */}
            {currentStep === 2 && (
              <section className="space-y-6 animate-fadeIn">
                <h2 className="text-xl font-semibold text-gray-800 flex items-center"><FaPhone className="mr-2 text-red-600" />Información de Contacto</h2>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  {/* Phone */}
                  <div>
                    <label htmlFor="phone" className="block text-sm font-medium text-gray-700 mb-1">Teléfono <span className="text-red-500">*</span></label>
                    <input type="tel" id="phone" {...register("phone", { required: "Campo obligatorio" })} className={`block w-full px-3 py-2 border ${errors.phone ? 'border-red-500' : 'border-gray-300'} rounded-md shadow-sm focus:outline-none focus:ring-red-500 focus:border-red-500`} />
                    <FormError error={errors.phone} />
                  </div>

                  {/* WhatsApp */}
                  <div>
                    <label htmlFor="whatsapp" className="block text-sm font-medium text-gray-700 mb-1">WhatsApp</label>
                    <input type="tel" id="whatsapp" {...register("whatsapp")} className={`block w-full px-3 py-2 border ${errors.whatsapp ? 'border-red-500' : 'border-gray-300'} rounded-md shadow-sm focus:outline-none focus:ring-red-500 focus:border-red-500`} />
                    <FormError error={errors.whatsapp} />
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  {/* Email */}
                  <div>
                    <label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-1">Correo Electrónico <span className="text-red-500">*</span></label>
                    <input type="email" id="email" {...register("email", { required: "Campo obligatorio" })} className={`block w-full px-3 py-2 border ${errors.email ? 'border-red-500' : 'border-gray-300'} rounded-md shadow-sm focus:outline-none focus:ring-red-500 focus:border-red-500`} />
                    <FormError error={errors.email} />
                  </div>

                  {/* Address */}
                  <div>
                    <label htmlFor="address" className="block text-sm font-medium text-gray-700 mb-1">Dirección <span className="text-red-500">*</span></label>
                    <input type="text" id="address" {...register("address", { required: "Campo obligatorio" })} className={`block w-full px-3 py-2 border ${errors.address ? 'border-red-500' : 'border-gray-300'} rounded-md shadow-sm focus:outline-none focus:ring-red-500 focus:border-red-500`} />
                    <FormError error={errors.address} />
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  {/* Neighborhood */}
                  <div>
                    <label htmlFor="neighborhood" className="block text-sm font-medium text-gray-700 mb-1">Barrio</label>
                    <input type="text" id="neighborhood" {...register("neighborhood")} className={`block w-full px-3 py-2 border ${errors.neighborhood ? 'border-red-500' : 'border-gray-300'} rounded-md shadow-sm focus:outline-none focus:ring-red-500 focus:border-red-500`} />
                    <FormError error={errors.neighborhood} />
                  </div>

                  {/* City */}
                  <div>
                    <label htmlFor="city" className="block text-sm font-medium text-gray-700 mb-1">Ciudad <span className="text-red-500">*</span></label>
                    <select id="city" {...register("city", { required: "Campo obligatorio" })} className={`block w-full px-3 py-2 border ${errors.city ? 'border-red-500' : 'border-gray-300'} rounded-md shadow-sm focus:outline-none focus:ring-red-500 focus:border-red-500`}>
                      <option value="">Seleccione...</option>
                      {colombianMunicipalities.map((municipality) => (
                        <option key={municipality} value={municipality}>{municipality}</option>
                      ))}
                    </select>
                    <FormError error={errors.city} />
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  {/* Country */}
                  <div>
                    <label htmlFor="country" className="block text-sm font-medium text-gray-700 mb-1">País <span className="text-red-500">*</span></label>
                    <input type="text" id="country" {...register("country", { required: "Campo obligatorio" })} className={`block w-full px-3 py-2 border ${errors.country ? 'border-red-500' : 'border-gray-300'} rounded-md shadow-sm focus:outline-none focus:ring-red-500 focus:border-red-500`} />
                    <FormError error={errors.country} />
                  </div>

                  {/* Postal Code */}
                  <div>
                    <label htmlFor="postalCode" className="block text-sm font-medium text-gray-700 mb-1">Código Postal</label>
                    <input type="text" id="postalCode" {...register("postalCode")} className={`block w-full px-3 py-2 border ${errors.postalCode ? 'border-red-500' : 'border-gray-300'} rounded-md shadow-sm focus:outline-none focus:ring-red-500 focus:border-red-500`} />
                    <FormError error={errors.postalCode} />
                  </div>
                </div>
              </section>
            )}

            {/* Step 3: Professional & Gender Details */}
            {currentStep === 3 && (
              <section className="space-y-6 animate-fadeIn">
                <h2 className="text-xl font-semibold text-gray-800 flex items-center"><FaVenusMars className="mr-2 text-red-600" />Detalles Profesionales y de Género</h2>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  {/* Binary Gender */}
                  <div>
                    <label htmlFor="binaryGender" className="block text-sm font-medium text-gray-700 mb-1">Género Binario <span className="text-red-500">*</span></label>
                    <select id="binaryGender" {...register("binaryGender", { required: "Campo obligatorio" })} className={`block w-full px-3 py-2 border ${errors.binaryGender ? 'border-red-500' : 'border-gray-300'} rounded-md shadow-sm focus:outline-none focus:ring-red-500 focus:border-red-500`}>
                      <option value="">Seleccione...</option>
                      <option value="Masculino">Masculino</option>
                      <option value="Femenino">Femenino</option>
                      <option value="Prefiero no decir">Prefiero no decir</option>
                    </select>
                    <FormError error={errors.binaryGender} />
                  </div>

                  {/* Gender Identity */}
                  <div>
                    <label htmlFor="genderIdentity" className="block text-sm font-medium text-gray-700 mb-1">Identidad de Género</label>
                    <select id="genderIdentity" {...register("genderIdentity")} className={`block w-full px-3 py-2 border ${errors.genderIdentity ? 'border-red-500' : 'border-gray-300'} rounded-md shadow-sm focus:outline-none focus:ring-red-500 focus:border-red-500`}>
                      <option value="">Seleccione...</option>
                      {genderIdentities.map((identity) => (
                        <option key={identity} value={identity}>{identity}</option>
                      ))}
                    </select>
                    <FormError error={errors.genderIdentity} />
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  {/* Occupation */}
                  <div>
                    <label htmlFor="occupation" className="block text-sm font-medium text-gray-700 mb-1">Ocupación</label>
                    <select id="occupation" {...register("occupation")} className={`block w-full px-3 py-2 border ${errors.occupation ? 'border-red-500' : 'border-gray-300'} rounded-md shadow-sm focus:outline-none focus:ring-red-500 focus:border-red-500`}>
                      <option value="">Seleccione...</option>
                      {occupations.map((occupation) => (
                        <option key={occupation} value={occupation}>{occupation}</option>
                      ))}
                    </select>
                    <FormError error={errors.occupation} />
                  </div>

                  {/* Discipline */}
                  <div>
                    <label htmlFor="discipline" className="block text-sm font-medium text-gray-700 mb-1">Disciplina</label>
                    <select id="discipline" {...register("discipline")} className={`block w-full px-3 py-2 border ${errors.discipline ? 'border-red-500' : 'border-gray-300'} rounded-md shadow-sm focus:outline-none focus:ring-red-500 focus:border-red-500`}>
                      <option value="">Seleccione...</option>
                      {disciplines.map((discipline) => (
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
              <section className="space-y-6 animate-fadeIn">
                <h2 className="text-xl font-semibold text-gray-800 flex items-center"><FaHeartbeat className="mr-2 text-red-600" />Información Médica</h2>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  {/* Blood Type */}
                  <div>
                    <label htmlFor="bloodType" className="block text-sm font-medium text-gray-700 mb-1">Tipo de Sangre</label>
                    <select id="bloodType" {...register("bloodType")} className={`block w-full px-3 py-2 border ${errors.bloodType ? 'border-red-500' : 'border-gray-300'} rounded-md shadow-sm focus:outline-none focus:ring-red-500 focus:border-red-500`}>
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
                    <label htmlFor="rhFactor" className="block text-sm font-medium text-gray-700 mb-1">Factor Rh</label>
                    <select id="rhFactor" {...register("rhFactor")} className={`block w-full px-3 py-2 border ${errors.rhFactor ? 'border-red-500' : 'border-gray-300'} rounded-md shadow-sm focus:outline-none focus:ring-red-500 focus:border-red-500`}>
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
                    <label htmlFor="allergies" className="block text-sm font-medium text-gray-700 mb-1">Alergias</label>
                    <textarea id="allergies" {...register("allergies")} className={`block w-full px-3 py-2 border ${errors.allergies ? 'border-red-500' : 'border-gray-300'} rounded-md shadow-sm focus:outline-none focus:ring-red-500 focus:border-red-500`} />
                    <FormError error={errors.allergies} />
                  </div>

                  {/* Health Insurance */}
                  <div>
                    <label htmlFor="healthInsurance" className="block text-sm font-medium text-gray-700 mb-1">Seguro de Salud</label>
                    <select id="healthInsurance" {...register("healthInsurance")} className={`block w-full px-3 py-2 border ${errors.healthInsurance ? 'border-red-500' : 'border-gray-300'} rounded-md shadow-sm focus:outline-none focus:ring-red-500 focus:border-red-500`}>
                      <option value="">Seleccione...</option>
                      {colombianEPS.map((eps) => (
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
              <section className="space-y-6 animate-fadeIn">
                <h2 className="text-xl font-semibold text-gray-800 flex items-center"><FaExclamationTriangle className="mr-2 text-red-600" />Contacto de Emergencia</h2>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  {/* Emergency Contact Name */}
                  <div>
                    <label htmlFor="emergencyContactName" className="block text-sm font-medium text-gray-700 mb-1">Nombre del Contacto <span className="text-red-500">*</span></label>
                    <input type="text" id="emergencyContactName" {...register("emergencyContactName", { required: "Campo obligatorio" })} className={`block w-full px-3 py-2 border ${errors.emergencyContactName ? 'border-red-500' : 'border-gray-300'} rounded-md shadow-sm focus:outline-none focus:ring-red-500 focus:border-red-500`} />
                    <FormError error={errors.emergencyContactName} />
                  </div>

                  {/* Emergency Contact Relationship */}
                  <div>
                    <label htmlFor="emergencyContactRelationship" className="block text-sm font-medium text-gray-700 mb-1">Relación con el Contacto <span className="text-red-500">*</span></label>
                    <input type="text" id="emergencyContactRelationship" {...register("emergencyContactRelationship", { required: "Campo obligatorio" })} className={`block w-full px-3 py-2 border ${errors.emergencyContactRelationship ? 'border-red-500' : 'border-gray-300'} rounded-md shadow-sm focus:outline-none focus:ring-red-500 focus:border-red-500`} />
                    <FormError error={errors.emergencyContactRelationship} />
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  {/* Emergency Contact Phone */}
                  <div>
                    <label htmlFor="emergencyContactPhone" className="block text-sm font-medium text-gray-700 mb-1">Teléfono del Contacto <span className="text-red-500">*</span></label>
                    <input type="tel" id="emergencyContactPhone" {...register("emergencyContactPhone", { required: "Campo obligatorio" })} className={`block w-full px-3 py-2 border ${errors.emergencyContactPhone ? 'border-red-500' : 'border-gray-300'} rounded-md shadow-sm focus:outline-none focus:ring-red-500 focus:border-red-500`} />
                    <FormError error={errors.emergencyContactPhone} />
                  </div>

                  {/* Emergency Contact Neighborhood */}
                  <div>
                    <label htmlFor="emergencyContactNeighborhood" className="block text-sm font-medium text-gray-700 mb-1">Barrio del Contacto</label>
                    <input type="text" id="emergencyContactNeighborhood" {...register("emergencyContactNeighborhood")} className={`block w-full px-3 py-2 border ${errors.emergencyContactNeighborhood ? 'border-red-500' : 'border-gray-300'} rounded-md shadow-sm focus:outline-none focus:ring-red-500 focus:border-red-500`} />
                    <FormError error={errors.emergencyContactNeighborhood} />
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  {/* Emergency Contact City */}
                  <div>
                    <label htmlFor="emergencyContactCity" className="block text-sm font-medium text-gray-700 mb-1">Ciudad del Contacto <span className="text-red-500">*</span></label>
                    <select id="emergencyContactCity" {...register("emergencyContactCity", { required: "Campo obligatorio" })} className={`block w-full px-3 py-2 border ${errors.emergencyContactCity ? 'border-red-500' : 'border-gray-300'} rounded-md shadow-sm focus:outline-none focus:ring-red-500 focus:border-red-500`}>
                      <option value="">Seleccione...</option>
                      {colombianMunicipalities.map((municipality) => (
                        <option key={municipality} value={municipality}>{municipality}</option>
                      ))}
                    </select>
                    <FormError error={errors.emergencyContactCity} />
                  </div>

                  {/* Emergency Contact Country */}
                  <div>
                    <label htmlFor="emergencyContactCountry" className="block text-sm font-medium text-gray-700 mb-1">País del Contacto <span className="text-red-500">*</span></label>
                    <input type="text" id="emergencyContactCountry" {...register("emergencyContactCountry", { required: "Campo obligatorio" })} className={`block w-full px-3 py-2 border ${errors.emergencyContactCountry ? 'border-red-500' : 'border-gray-300'} rounded-md shadow-sm focus:outline-none focus:ring-red-500 focus:border-red-500`} />
                    <FormError error={errors.emergencyContactCountry} />
                  </div>
                </div>
              </section>
            )}

            {/* Step 6: Motorcycle Details */}
            {currentStep === 6 && (
              <section className="space-y-6 animate-fadeIn">
                <h2 className="text-xl font-semibold text-gray-800 flex items-center"><FaMotorcycle className="mr-2 text-red-600" />Detalles de la Motocicleta</h2>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  {/* Motorcycle Plate */}
                  <div>
                    <label htmlFor="motorcyclePlate" className="block text-sm font-medium text-gray-700 mb-1">Placa de la Motocicleta <span className="text-red-500">*</span></label>
                    <input type="text" id="motorcyclePlate" {...register("motorcyclePlate", { required: "Campo obligatorio" })} className={`block w-full px-3 py-2 border ${errors.motorcyclePlate ? 'border-red-500' : 'border-gray-300'} rounded-md shadow-sm focus:outline-none focus:ring-red-500 focus:border-red-500`} />
                    <FormError error={errors.motorcyclePlate} />
                  </div>

                  {/* Motorcycle Brand */}
                  <div>
                    <label htmlFor="motorcycleBrand" className="block text-sm font-medium text-gray-700 mb-1">Marca de la Motocicleta <span className="text-red-500">*</span></label>
                    <select id="motorcycleBrand" {...register("motorcycleBrand", { required: "Campo obligatorio" })} className={`block w-full px-3 py-2 border ${errors.motorcycleBrand ? 'border-red-500' : 'border-gray-300'} rounded-md shadow-sm focus:outline-none focus:ring-red-500 focus:border-red-500`}>
                      <option value="">Seleccione...</option>
                      {motorcycleBrands.map((brand) => (
                        <option key={brand} value={brand}>{brand}</option>
                      ))}
                    </select>
                    <FormError error={errors.motorcycleBrand} />
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  {/* Motorcycle Model */}
                  <div>
                    <label htmlFor="motorcycleModel" className="block text-sm font-medium text-gray-700 mb-1">Modelo de la Motocicleta <span className="text-red-500">*</span></label>
                    <input type="text" id="motorcycleModel" {...register("motorcycleModel", { required: "Campo obligatorio" })} className={`block w-full px-3 py-2 border ${errors.motorcycleModel ? 'border-red-500' : 'border-gray-300'} rounded-md shadow-sm focus:outline-none focus:ring-red-500 focus:border-red-500`} />
                    <FormError error={errors.motorcycleModel} />
                  </div>

                  {/* Motorcycle Year */}
                  <div>
                    <label htmlFor="motorcycleYear" className="block text-sm font-medium text-gray-700 mb-1">Año de la Motocicleta <span className="text-red-500">*</span></label>
                    <select id="motorcycleYear" {...register("motorcycleYear", { required: "Campo obligatorio" })} className={`block w-full px-3 py-2 border ${errors.motorcycleYear ? 'border-red-500' : 'border-gray-300'} rounded-md shadow-sm focus:outline-none focus:ring-red-500 focus:border-red-500`}>
                      <option value="">Seleccione...</option>
                      {years.map((year) => (
                        <option key={year} value={year}>{year}</option>
                      ))}
                    </select>
                    <FormError error={errors.motorcycleYear} />
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  {/* Motorcycle Displacement */}
                  <div>
                    <label htmlFor="motorcycleDisplacement" className="block text-sm font-medium text-gray-700 mb-1">Cilindraje de la Motocicleta <span className="text-red-500">*</span></label>
                    <input type="number" id="motorcycleDisplacement" {...register("motorcycleDisplacement", { required: "Campo obligatorio", min: { value: 50, message: "El cilindraje debe ser al menos 50cc." }, max: { value: 3000, message: "El cilindraje no puede exceder los 3000cc." } })} className={`block w-full px-3 py-2 border ${errors.motorcycleDisplacement ? 'border-red-500' : 'border-gray-300'} rounded-md shadow-sm focus:outline-none focus:ring-red-500 focus:border-red-500`} />
                    <FormError error={errors.motorcycleDisplacement} />
                  </div>
                </div>
              </section>
            )}

            {/* Step 7: Security & Consents */}
            {currentStep === 7 && (
              <section className="space-y-6 animate-fadeIn">
                <h2 className="text-xl font-semibold text-gray-800 flex items-center"><FaLock className="mr-2 text-red-600" />Seguridad y Consentimientos</h2>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  {/* Password */}
                  <div className="relative">
                    <label htmlFor="password" className="block text-sm font-medium text-gray-700 mb-1">Contraseña <span className="text-red-500">*</span></label>
                    <input type={showPassword ? 'text' : 'password'} id="password" {...register("password")} className={`block w-full px-3 py-2 border ${errors.password ? 'border-red-500' : 'border-gray-300'} rounded-md shadow-sm focus:outline-none focus:ring-red-500 focus:border-red-500`} />
                    <button type="button" onClick={() => setShowPassword(!showPassword)} className="absolute inset-y-0 right-0 px-3 flex items-center text-gray-500">
                      {showPassword ? <FaEyeSlash /> : <FaEye />}
                    </button>
                    <FormError error={errors.password} />
                  </div>

                  {/* Confirm Password */}
                  <div className="relative">
                    <label htmlFor="confirmPassword" className="block text-sm font-medium text-gray-700 mb-1">Confirmar Contraseña <span className="text-red-500">*</span></label>
                    <input type={showPassword ? 'text' : 'password'} id="confirmPassword" {...register("confirmPassword")} className={`block w-full px-3 py-2 border ${errors.confirmPassword ? 'border-red-500' : 'border-gray-300'} rounded-md shadow-sm focus:outline-none focus:ring-red-500 focus:border-red-500`} />
                    <button type="button" onClick={() => setShowPassword(!showPassword)} className="absolute inset-y-0 right-0 px-3 flex items-center text-gray-500">
                      {showPassword ? <FaEyeSlash /> : <FaEye />}
                    </button>
                    <FormError error={errors.confirmPassword} />
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  {/* Data Consent */}
                  <div className="flex items-center">
                    <input type="checkbox" id="dataConsent" {...register("dataConsent", { required: "Debes aceptar el consentimiento de datos." })} className={`mr-2 ${errors.dataConsent ? 'border-red-500' : 'border-gray-300'}`} />
                    <label htmlFor="dataConsent" className="text-sm font-medium text-gray-700">Acepto el consentimiento de datos <span className="text-red-500">*</span></label>
                    <FormError error={errors.dataConsent} />
                  </div>

                  {/* Liability Waiver */}
                  <div className="flex items-center">
                    <input type="checkbox" id="liabilityWaiver" {...register("liabilityWaiver", { required: "Debes aceptar la exención de responsabilidad." })} className={`mr-2 ${errors.liabilityWaiver ? 'border-red-500' : 'border-gray-300'}`} />
                    <label htmlFor="liabilityWaiver" className="text-sm font-medium text-gray-700">Acepto la exención de responsabilidad <span className="text-red-500">*</span></label>
                    <FormError error={errors.liabilityWaiver} />
                  </div>
                </div>

                <div className="flex items-center">
                  <input type="checkbox" id="termsAcceptance" {...register("termsAcceptance", { required: "Debes aceptar los términos y condiciones." })} className={`mr-2 ${errors.termsAcceptance ? 'border-red-500' : 'border-gray-300'}`} />
                  <label htmlFor="termsAcceptance" className="text-sm font-medium text-gray-700">Acepto los términos y condiciones <span className="text-red-500">*</span></label>
                  <FormError error={errors.termsAcceptance} />
                </div>
              </section>
            )}

            {/* Step 8: Review & Submit */}
            {currentStep === 8 && (
              <section className="space-y-6 animate-fadeIn">
                <h2 className="text-xl font-semibold text-gray-800 flex items-center"><FaCheckCircle className="mr-2 text-red-600" />Revisa tu Información</h2>
                <div className="bg-gray-100 p-4 rounded-md">
                  <h3 className="font-bold">Información Personal</h3>
                  <p><strong>Nombre:</strong> {allFormData.firstName} {allFormData.lastName}</p>
                  <p><strong>Documento:</strong> {allFormData.documentType} {allFormData.documentNumber}</p>
                  <p><strong>Fecha de Nacimiento:</strong> {allFormData.birthDate}</p>
                  <p><strong>Lugar de Nacimiento:</strong> {allFormData.birthPlace}</p>
                </div>
                <div className="bg-gray-100 p-4 rounded-md">
                  <h3 className="font-bold">Información de Contacto</h3>
                  <p><strong>Teléfono:</strong> {allFormData.phone}</p>
                  <p><strong>WhatsApp:</strong> {allFormData.whatsapp}</p>
                  <p><strong>Correo Electrónico:</strong> {allFormData.email}</p>
                  <p><strong>Dirección:</strong> {allFormData.address}</p>
                  <p><strong>Barrio:</strong> {allFormData.neighborhood}</p>
                  <p><strong>Ciudad:</strong> {allFormData.city}</p>
                  <p><strong>País:</strong> {allFormData.country}</p>
                  <p><strong>Código Postal:</strong> {allFormData.postalCode}</p>
                </div>
                <div className="bg-gray-100 p-4 rounded-md">
                  <h3 className="font-bold">Detalles Profesionales y de Género</h3>
                  <p><strong>Género Binario:</strong> {allFormData.binaryGender}</p>
                  <p><strong>Identidad de Género:</strong> {allFormData.genderIdentity}</p>
                  <p><strong>Ocupación:</strong> {allFormData.occupation}</p>
                  <p><strong>Disciplina:</strong> {allFormData.discipline}</p>
                </div>
                <div className="bg-gray-100 p-4 rounded-md">
                  <h3 className="font-bold">Información Médica</h3>
                  <p><strong>Tipo de Sangre:</strong> {allFormData.bloodType}</p>
                  <p><strong>Factor Rh:</strong> {allFormData.rhFactor}</p>
                  <p><strong>Alergias:</strong> {allFormData.allergies}</p>
                  <p><strong>Seguro de Salud:</strong> {allFormData.healthInsurance}</p>
                </div>
                <div className="bg-gray-100 p-4 rounded-md">
                  <h3 className="font-bold">Contacto de Emergencia</h3>
                  <p><strong>Nombre:</strong> {allFormData.emergencyContactName}</p>
                  <p><strong>Relación:</strong> {allFormData.emergencyContactRelationship}</p>
                  <p><strong>Teléfono:</strong> {allFormData.emergencyContactPhone}</p>
                  <p><strong>Barrio:</strong> {allFormData.emergencyContactNeighborhood}</p>
                  <p><strong>Ciudad:</strong> {allFormData.emergencyContactCity}</p>
                  <p><strong>País:</strong> {allFormData.emergencyContactCountry}</p>
                </div>
                <div className="bg-gray-100 p-4 rounded-md">
                  <h3 className="font-bold">Detalles de la Motocicleta</h3>
                  <p><strong>Placa:</strong> {allFormData.motorcyclePlate}</p>
                  <p><strong>Marca:</strong> {allFormData.motorcycleBrand}</p>
                  <p><strong>Modelo:</strong> {allFormData.motorcycleModel}</p>
                  <p><strong>Año:</strong> {allFormData.motorcycleYear}</p>
                  <p><strong>Cilindraje:</strong> {allFormData.motorcycleDisplacement} cc</p>
                </div>
              </section>
            )}

            <div className="flex justify-between mt-6">
              {currentStep > 1 && (
                <button 
                  type="button" 
                  onClick={prevStep} 
                  className="bg-gray-300 text-gray-700 py-2 px-4 rounded-md hover:bg-gray-400 transition"
                >
                  Regresar
                </button>
              )}
              {currentStep < totalSteps ? (
                <button 
                  type="button" 
                  onClick={handleNextStep} 
                  className="bg-red-600 text-white py-2 px-4 rounded-md hover:bg-red-700 transition"
                >
                  Siguiente
                </button>
              ) : (
                <button 
                  type="submit" 
                  disabled={isSubmitting} 
                  className="bg-red-600 text-white py-2 px-4 rounded-md hover:bg-red-700 transition"
                >
                  {isSubmitting ? 'Registrando...' : 'Registrarse'}
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