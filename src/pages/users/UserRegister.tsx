import React, { useState } from 'react';
import { useForm } from 'react-hook-form';
import { FaUser , FaPhone, FaEnvelope, FaMapMarkerAlt, FaBriefcase, FaHeartbeat, FaMotorcycle, FaShieldAlt, FaLock } from 'react-icons/fa';
import { GiSteelwingEmblem } from 'react-icons/gi';
import api from '../../components/api/Api'; 
import { useNavigate } from 'react-router-dom';

/**
 * UserRegister component handles the registration of new users.
 * It includes a multi-step form for user information.
 * @returns {JSX.Element}
 */
const UserRegister: React.FC = () => {
  const { register, handleSubmit, formState: { errors }, watch } = useForm(); 
  const [currentStep, setCurrentStep] = useState<number>(1);
  const [isSubmitting, setIsSubmitting] = useState<boolean>(false);
  const [submitError, setSubmitError] = useState<string>('');
  const navigate = useNavigate();

  const totalSteps: number = 8;

  /**
   * Handles form submission.
   * @param {Object} data - Form data.
   */
  const onSubmit = async (data: any) => {
    setIsSubmitting(true);
    setSubmitError('');
    
    try {
      const birthDate: Date = new Date(data.birthDate);
      const age: number = new Date().getFullYear() - birthDate.getFullYear();
      
      const userData = {
        ...data,
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
    } catch (error) {
      console.error('Registration error:', error);
      if (error.response) {
        if (error.response.data.message.includes('document number')) {
          setSubmitError('El número de documento ya está registrado.');
        } else if (error.response.data.message.includes('email')) {
          setSubmitError('El correo electrónico ya está registrado.');
        } else {
          setSubmitError(error.response.data.message || 'Error en el servidor. Por favor intenta más tarde.');
        }
      } else {
        setSubmitError('Error de conexión. Verifica tu conexión a internet.');
      }
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleNextStep = async () => {
    let isValid: boolean = true;
    switch (currentStep) {
      case 1:
        isValid = await handleSubmit(() => {})(null);
        break;
      case 2:
        isValid = await handleSubmit(() => {})(null);
        break;
      case 3:
        isValid = true;
        break;
      case 4:
        isValid = true;
        break;
      case 5:
        isValid = true;
        break;
      case 6:
        isValid = true;
        break;
      case 7:
        isValid = await handleSubmit(() => {})(null);
        break;
      default:
        isValid = true;
    }

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
    return (
      <div className="flex justify-center items-center mb-8">
        {Array.from({ length: totalSteps }).map((_, index) => (
          <React.Fragment key={index}>
            <div 
              className={`w-8 h-8 rounded-full flex items-center justify-center text-white font-medium text-sm ${currentStep > index + 1 ? 'bg-green-500' : currentStep === index + 1 ? 'bg-red-600' : 'bg-gray-300'}`}
              aria-current={currentStep === index + 1 ? 'step' : undefined}
              aria-label={`Paso ${index + 1} de ${totalSteps}`}
            >
              {index + 1}
            </div>
            {index < totalSteps - 1 && (
              <div className={`h-1 flex-grow ${currentStep > index + 1 ? 'bg-green-500' : 'bg-gray-300'}`}></div>
            )}
          </React.Fragment>
        ))}
      </div>
    );
  };

  return (
    <div className="min-h-screen bg-gray-50 py-8 px-4 sm:px-6 lg:px-8">
      <div className="max-w-4xl mx-auto bg-white rounded-xl shadow-md overflow-hidden">
        <div className="p-6">
          <div className="flex items-center justify-center mb-6">
            <GiSteelwingEmblem className="text-red-600 text-4xl mr-2" aria-hidden="true" />
            <h1 className="text-2xl font-bold text-gray-900">Registro de Miembro Friend</h1>
          </div>

          {renderStepIndicator()}

          <form onSubmit={handleSubmit(onSubmit)}>
            {/* Step 1: Personal Information */}
            {currentStep === 1 && (
              <div className="space-y-6">
                <h2 className="text-xl font-semibold text-gray-800 flex items-center">
                  <FaUser  className="mr-2 text-red-600" aria-hidden="true" /> Información Personal
                </h2>
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <label htmlFor="documentType" className="block text-sm font-medium text-gray-700 mb-1">
                      Tipo de Documento <span className="text-red-500">*</span>
                    </label>
                    <select
                      id="documentType"
                      {...register("documentType", { required: "Campo obligatorio" })}
                      className={`block w-full px-3 py-2 border ${errors.documentType ? 'border-red-500' : 'border-gray-300'} rounded-md shadow-sm focus:outline-none focus:ring-red-500 focus:border-red-500`}
                      aria-invalid={errors.documentType ? "true" : "false"}
                    >
                      <option value="">Seleccione...</option>
                      <option value="CC">Cédula de Ciudadanía</option>
                      <option value="CE">Cédula de Extranjería</option>
                      <option value="TI">Tarjeta de Identidad</option>
                      <option value="PA">Pasaporte</option>
                      <option value="NIT">NIT</option>
                      <option value="OTRO">Otro</option>
                    </select>
                    {errors.documentType && (
                      <p role="alert" className="mt-1 text-sm text-red-600">{errors.documentType.message}</p>
                    )}
                  </div>

                  <div>
                    <label htmlFor="documentNumber" className="block text-sm font-medium text-gray-700 mb-1">
                      Número de Documento <span className="text-red-500">*</span>
                    </label>
                    <input
                      type="text"
                      id="documentNumber"
                      {...register("documentNumber", { 
                        required: "Campo obligatorio",
                        pattern: {
                          value: /^[0-9]+$/,
                          message: "Solo números permitidos"
                        }
                      })}
                      className={`block w-full px-3 py-2 border ${errors.documentNumber ? 'border-red-500' : 'border-gray-300'} rounded-md shadow-sm focus:outline-none focus:ring-red-500 focus:border-red-500`}
                      aria-invalid={errors.documentNumber ? "true" : "false"}
                    />
                    {errors.documentNumber && (
                      <p role="alert" className="mt-1 text-sm text-red-600">{errors.documentNumber.message}</p>
                    )}
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <label htmlFor="firstName" className="block text-sm font-medium text-gray-700 mb-1">
                      Nombres <span className="text-red-500">*</span>
                    </label>
                    <input
                      type="text"
                      id="firstName"
                      {...register("firstName", { 
                        required: "Campo obligatorio",
                        maxLength: {
                          value: 50,
                          message: "Máximo 50 caracteres"
                        }
                      })}
                      className={`block w-full px-3 py-2 border ${errors.firstName ? 'border-red-500' : 'border-gray-300'} rounded-md shadow-sm focus:outline-none focus:ring-red-500 focus:border-red-500`}
                      aria-invalid={errors.firstName ? "true" : "false"}
                    />
                    {errors.firstName && (
                      <p role="alert" className="mt-1 text-sm text-red-600">{errors.firstName.message}</p>
                    )}
                  </div>

                  <div>
                    <label htmlFor="lastName" className="block text-sm font-medium text-gray-700 mb-1">
                      Apellidos <span className="text-red-500">*</span>
                    </label>
                    <input
                      type="text"
                      id="lastName"
                      {...register("lastName", { 
                        required: "Campo obligatorio",
                        maxLength: {
                          value: 50,
                          message: "Máximo 50 caracteres"
                        }
                      })}
                      className={`block w-full px-3 py-2 border ${errors.lastName ? 'border-red-500' : 'border-gray-300'} rounded-md shadow-sm focus:outline-none focus:ring-red-500 focus:border-red-500`}
                      aria-invalid={errors.lastName ? "true" : "false"}
                    />
                    {errors.lastName && (
                      <p role="alert" className="mt-1 text-sm text-red-600">{errors.lastName.message}</p>
                    )}
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <label htmlFor="birthDate" className="block text-sm font-medium text-gray-700 mb-1">
                      Fecha de Nacimiento <span className="text-red-500">*</span>
                    </label>
                    <input
                      type="date"
                      id="birthDate"
                      {...register("birthDate", { required: "Campo obligatorio" })}
                      className={`block w-full px-3 py-2 border ${errors.birthDate ? 'border-red-500' : 'border-gray-300'} rounded-md shadow-sm focus:outline-none focus:ring-red-500 focus:border-red-500`}
                      aria-invalid={errors.birthDate ? "true" : "false"}
                    />
                    {errors.birthDate && (
                      <p role="alert" className="mt-1 text-sm text-red-600">{errors.birthDate.message}</p>
                    )}
                  </div>

                  <div>
                    <label htmlFor="gender" className="block text-sm font-medium text-gray-700 mb-1">
                      Género <span className="text-red-500">*</span>
                    </label>
                    <select
                      id="gender"
                      {...register("gender", { required: "Campo obligatorio" })}
                      className={`block w-full px-3 py-2 border ${errors.gender ? 'border-red-500' : 'border-gray-300'} rounded-md shadow-sm focus:outline-none focus:ring-red-500 focus:border-red-500`}
                      aria-invalid={errors.gender ? "true" : "false"}
                    >
                      <option value="">Seleccione...</option>
                      <option value="male">Masculino</option>
                      <option value="female">Femenino</option>
                      <option value="other">Otro</option>
                    </select>
                    {errors.gender && (
                      <p role="alert" className="mt-1 text-sm text-red-600">{errors.gender.message}</p>
                    )}
                  </div>
                </div>
              </div>
            )}

            {/* Step 2: Contact Information */}
            {currentStep === 2 && (
              <div className="space-y-6">
                <h2 className="text-xl font-semibold text-gray-800 flex items-center">
                  <FaPhone className="mr-2 text-red-600" aria-hidden="true" /> Información de Contacto
                </h2>
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <label htmlFor="phone" className="block text-sm font-medium text-gray-700 mb-1">
                      Teléfono <span className="text-red-500">*</span>
                    </label>
                    <input
                      type="tel"
                      id="phone"
                      {...register("phone", { required: "Campo obligatorio" })}
                      className={`block w-full px-3 py-2 border ${errors.phone ? 'border-red-500' : 'border-gray-300'} rounded-md shadow-sm focus:outline-none focus:ring-red-500 focus:border-red-500`}
                      aria-invalid={errors.phone ? "true" : "false"}
                    />
                    {errors.phone && (
                      <p role="alert" className="mt-1 text-sm text-red-600">{errors.phone.message}</p>
                    )}
                  </div>

                  <div>
                    <label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-1">
                      Correo Electrónico <span className="text-red-500">*</span>
                    </label>
                    <input
                      type="email"
                      id="email"
                      {...register("email", { required: "Campo obligatorio" })}
                      className={`block w-full px-3 py-2 border ${errors.email ? 'border-red-500' : 'border-gray-300'} rounded-md shadow-sm focus:outline-none focus:ring-red-500 focus:border-red-500`}
                      aria-invalid={errors.email ? "true" : "false"}
                    />
                    {errors.email && (
                      <p role="alert" className="mt-1 text-sm text-red-600">{errors.email.message}</p>
                    )}
                  </div>
                </div>

                <div>
                  <label htmlFor="address" className="block text-sm font-medium text-gray-700 mb-1">
                    Dirección <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="text"
                    id="address"
                    {...register("address", { required: "Campo obligatorio" })}
                    className={`block w-full px-3 py-2 border ${errors.address ? 'border-red-500' : 'border-gray-300'} rounded-md shadow-sm focus:outline-none focus:ring-red-500 focus:border-red-500`}
                    aria-invalid={errors.address ? "true" : "false"}
                  />
                  {errors.address && (
                    <p role="alert" className="mt-1 text-sm text-red-600">{errors.address.message}</p>
                  )}
                </div>
              </div>
            )}

            {/* Step 3: Review and Submit */}
            {currentStep === 3 && (
              <div className="space-y-6">
                <h2 className="text-xl font-semibold text-gray-800 flex items-center">
                  <FaCheck className="mr-2 text-red-600" aria-hidden="true" /> Revisa tu Información
                </h2>
                
                <div className="bg-gray-100 p-4 rounded-md">
                  <h3 className="font-bold">Información Personal</h3>
                  <p><strong>Nombre:</strong> {formData.name}</p>
                  <p><strong>Correo Electrónico:</strong> {formData.email}</p>
                  <p><strong>Teléfono:</strong> {formData.phone}</p>
                  <p><strong>Dirección:</strong> {formData.address}</p>
                </div>
              </div>
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
                  className="bg-red-600 text-white py-2 px-4 rounded-md hover:bg-red-700 transition"
                >
                  Registrarse
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