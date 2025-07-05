import React, { useState } from 'react';
import { useForm } from 'react-hook-form';
import { FaUser, FaPhone, FaEnvelope, FaMapMarkerAlt, FaBriefcase, FaHeartbeat, FaMotorcycle, FaShieldAlt, FaLock } from 'react-icons/fa';
import { GiSteelWing } from 'react-icons/gi';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';

const UserRegister = () => {
  const { register, handleSubmit, formState: { errors }, watch, setValue } = useForm();
  const [currentStep, setCurrentStep] = useState(1);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitError, setSubmitError] = useState('');
  const navigate = useNavigate();

  const totalSteps = 8;

  const onSubmit = async (data) => {
    setIsSubmitting(true);
    setSubmitError('');
    
    try {
      // Calculate age from birthDate
      const birthDate = new Date(data.birthDate);
      const age = new Date().getFullYear() - birthDate.getFullYear();
      data.age = age;

      // Prepare data for API
      const userData = {
        ...data,
        role: 'Membresia Friend',
        temporaryPassword: false
      };

      const response = await axios.post('https://api.bskmt.com/users', userData);
      
      if (response.data.status === 'success') {
        navigate('/registration-success');
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
          setSubmitError('Error en el servidor. Por favor intenta más tarde.');
        }
      } else {
        setSubmitError('Error de conexión. Verifica tu conexión a internet.');
      }
    } finally {
      setIsSubmitting(false);
    }
  };

  const nextStep = () => {
    setCurrentStep(prev => Math.min(prev + 1, totalSteps));
  };

  const prevStep = () => {
    setCurrentStep(prev => Math.max(prev - 1, 1));
  };

  const renderStepIndicator = () => {
    return (
      <div className="flex justify-center mb-8">
        {Array.from({ length: totalSteps }).map((_, index) => (
          <React.Fragment key={index}>
            <div 
              className={`w-8 h-8 rounded-full flex items-center justify-center ${currentStep > index + 1 ? 'bg-green-500' : currentStep === index + 1 ? 'bg-red-600' : 'bg-gray-300'} text-white font-medium`}
            >
              {index + 1}
            </div>
            {index < totalSteps - 1 && (
              <div className={`h-1 w-8 self-center ${currentStep > index + 1 ? 'bg-green-500' : 'bg-gray-300'}`}></div>
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
            <GiSteelWing className="text-red-600 text-4xl mr-2" />
            <h1 className="text-2xl font-bold text-gray-900">Registro de Miembro Friend</h1>
          </div>

          {renderStepIndicator()}

          <form onSubmit={handleSubmit(onSubmit)}>
            {/* Step 1: Personal Information */}
            {currentStep === 1 && (
              <div className="space-y-6">
                <h2 className="text-xl font-semibold text-gray-800 flex items-center">
                  <FaUser className="mr-2 text-red-600" /> Información Personal
                </h2>
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <label htmlFor="documentType" className="block text-sm font-medium text-gray-700 mb-1">
                      Tipo de Documento *
                    </label>
                    <select
                      id="documentType"
                      {...register("documentType", { required: "Campo obligatorio" })}
                      className={`block w-full px-3 py-2 border ${errors.documentType ? 'border-red-500' : 'border-gray-300'} rounded-md shadow-sm focus:outline-none focus:ring-red-500 focus:border-red-500`}
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
                      <p className="mt-1 text-sm text-red-600">{errors.documentType.message}</p>
                    )}
                  </div>

                  <div>
                    <label htmlFor="documentNumber" className="block text-sm font-medium text-gray-700 mb-1">
                      Número de Documento *
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
                    />
                    {errors.documentNumber && (
                      <p className="mt-1 text-sm text-red-600">{errors.documentNumber.message}</p>
                    )}
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <label htmlFor="firstName" className="block text-sm font-medium text-gray-700 mb-1">
                      Nombres *
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
                    />
                    {errors.firstName && (
                      <p className="mt-1 text-sm text-red-600">{errors.firstName.message}</p>
                    )}
                  </div>

                  <div>
                    <label htmlFor="lastName" className="block text-sm font-medium text-gray-700 mb-1">
                      Apellidos *
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
                    />
                    {errors.lastName && (
                      <p className="mt-1 text-sm text-red-600">{errors.lastName.message}</p>
                    )}
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <label htmlFor="birthDate" className="block text-sm font-medium text-gray-700 mb-1">
                      Fecha de Nacimiento *
                    </label>
                    <input
                      type="date"
                      id="birthDate"
                      {...register("birthDate", { 
                        required: "Campo obligatorio",
                        validate: value => {
                          const selectedDate = new Date(value);
                          const today = new Date();
                          return selectedDate < today || "La fecha debe ser en el pasado";
                        }
                      })}
                      className={`block w-full px-3 py-2 border ${errors.birthDate ? 'border-red-500' : 'border-gray-300'} rounded-md shadow-sm focus:outline-none focus:ring-red-500 focus:border-red-500`}
                    />
                    {errors.birthDate && (
                      <p className="mt-1 text-sm text-red-600">{errors.birthDate.message}</p>
                    )}
                  </div>

                  <div>
                    <label htmlFor="binaryGender" className="block text-sm font-medium text-gray-700 mb-1">
                      Género
                    </label>
                    <select
                      id="binaryGender"
                      {...register("binaryGender")}
                      className="block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-red-500 focus:border-red-500"
                    >
                      <option value="Prefiero no decir">Prefiero no decir</option>
                      <option value="Masculino">Masculino</option>
                      <option value="Femenino">Femenino</option>
                    </select>
                  </div>
                </div>

                <div>
                  <label htmlFor="genderIdentity" className="block text-sm font-medium text-gray-700 mb-1">
                    Identidad de Género (opcional)
                  </label>
                  <input
                    type="text"
                    id="genderIdentity"
                    {...register("genderIdentity", { 
                      maxLength: {
                        value: 50,
                        message: "Máximo 50 caracteres"
                      }
                    })}
                    className={`block w-full px-3 py-2 border ${errors.genderIdentity ? 'border-red-500' : 'border-gray-300'} rounded-md shadow-sm focus:outline-none focus:ring-red-500 focus:border-red-500`}
                  />
                  {errors.genderIdentity && (
                    <p className="mt-1 text-sm text-red-600">{errors.genderIdentity.message}</p>
                  )}
                </div>
              </div>
            )}

            {/* Step 2: Contact Information */}
            {currentStep === 2 && (
              <div className="space-y-6">
                <h2 className="text-xl font-semibold text-gray-800 flex items-center">
                  <FaPhone className="mr-2 text-red-600" /> Información de Contacto
                </h2>
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-1">
                      Correo Electrónico *
                    </label>
                    <input
                      type="email"
                      id="email"
                      {...register("email", { 
                        required: "Campo obligatorio",
                        pattern: {
                          value: /^[^\s@]+@[^\s@]+\.[^\s@]+$/,
                          message: "Correo electrónico inválido"
                        }
                      })}
                      className={`block w-full px-3 py-2 border ${errors.email ? 'border-red-500' : 'border-gray-300'} rounded-md shadow-sm focus:outline-none focus:ring-red-500 focus:border-red-500`}
                    />
                    {errors.email && (
                      <p className="mt-1 text-sm text-red-600">{errors.email.message}</p>
                    )}
                  </div>

                  <div>
                    <label htmlFor="phone" className="block text-sm font-medium text-gray-700 mb-1">
                      Teléfono Celular *
                    </label>
                    <input
                      type="tel"
                      id="phone"
                      {...register("phone", { 
                        required: "Campo obligatorio",
                        pattern: {
                          value: /^[0-9]{10,15}$/,
                          message: "Número de teléfono inválido"
                        }
                      })}
                      className={`block w-full px-3 py-2 border ${errors.phone ? 'border-red-500' : 'border-gray-300'} rounded-md shadow-sm focus:outline-none focus:ring-red-500 focus:border-red-500`}
                    />
                    {errors.phone && (
                      <p className="mt-1 text-sm text-red-600">{errors.phone.message}</p>
                    )}
                  </div>
                </div>

                <div>
                  <label htmlFor="whatsapp" className="block text-sm font-medium text-gray-700 mb-1">
                    WhatsApp (opcional)
                  </label>
                  <input
                    type="tel"
                    id="whatsapp"
                    {...register("whatsapp", { 
                      pattern: {
                        value: /^[0-9]{10,15}$/,
                        message: "Número de WhatsApp inválido"
                      }
                    })}
                    className={`block w-full px-3 py-2 border ${errors.whatsapp ? 'border-red-500' : 'border-gray-300'} rounded-md shadow-sm focus:outline-none focus:ring-red-500 focus:border-red-500`}
                  />
                  {errors.whatsapp && (
                    <p className="mt-1 text-sm text-red-600">{errors.whatsapp.message}</p>
                  )}
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <label htmlFor="city" className="block text-sm font-medium text-gray-700 mb-1">
                      Ciudad *
                    </label>
                    <input
                      type="text"
                      id="city"
                      {...register("city", { 
                        required: "Campo obligatorio",
                        maxLength: {
                          value: 50,
                          message: "Máximo 50 caracteres"
                        }
                      })}
                      className={`block w-full px-3 py-2 border ${errors.city ? 'border-red-500' : 'border-gray-300'} rounded-md shadow-sm focus:outline-none focus:ring-red-500 focus:border-red-500`}
                    />
                    {errors.city && (
                      <p className="mt-1 text-sm text-red-600">{errors.city.message}</p>
                    )}
                  </div>

                  <div>
                    <label htmlFor="country" className="block text-sm font-medium text-gray-700 mb-1">
                      País
                    </label>
                    <input
                      type="text"
                      id="country"
                      {...register("country")}
                      defaultValue="Colombia"
                      className="block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-red-500 focus:border-red-500"
                    />
                  </div>
                </div>

                <div>
                  <label htmlFor="address" className="block text-sm font-medium text-gray-700 mb-1">
                    Dirección (opcional)
                  </label>
                  <input
                    type="text"
                    id="address"
                    {...register("address", { 
                      maxLength: {
                        value: 100,
                        message: "Máximo 100 caracteres"
                      }
                    })}
                    className={`block w-full px-3 py-2 border ${errors.address ? 'border-red-500' : 'border-gray-300'} rounded-md shadow-sm focus:outline-none focus:ring-red-500 focus:border-red-500`}
                  />
                  {errors.address && (
                    <p className="mt-1 text-sm text-red-600">{errors.address.message}</p>
                  )}
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <label htmlFor="neighborhood" className="block text-sm font-medium text-gray-700 mb-1">
                      Barrio (opcional)
                    </label>
                    <input
                      type="text"
                      id="neighborhood"
                      {...register("neighborhood", { 
                        maxLength: {
                          value: 50,
                          message: "Máximo 50 caracteres"
                        }
                      })}
                      className={`block w-full px-3 py-2 border ${errors.neighborhood ? 'border-red-500' : 'border-gray-300'} rounded-md shadow-sm focus:outline-none focus:ring-red-500 focus:border-red-500`}
                    />
                    {errors.neighborhood && (
                      <p className="mt-1 text-sm text-red-600">{errors.neighborhood.message}</p>
                    )}
                  </div>

                  <div>
                    <label htmlFor="postalCode" className="block text-sm font-medium text-gray-700 mb-1">
                      Código Postal (opcional)
                    </label>
                    <input
                      type="text"
                      id="postalCode"
                      {...register("postalCode")}
                      className="block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-red-500 focus:border-red-500"
                    />
                  </div>
                </div>
              </div>
            )}

            {/* Step 3: Professional Information */}
            {currentStep === 3 && (
              <div className="space-y-6">
                <h2 className="text-xl font-semibold text-gray-800 flex items-center">
                  <FaBriefcase className="mr-2 text-red-600" /> Información Profesional
                </h2>
                
                <div>
                  <label htmlFor="occupation" className="block text-sm font-medium text-gray-700 mb-1">
                    Ocupación (opcional)
                  </label>
                  <input
                    type="text"
                    id="occupation"
                    {...register("occupation", { 
                      maxLength: {
                        value: 100,
                        message: "Máximo 100 caracteres"
                      }
                    })}
                    className={`block w-full px-3 py-2 border ${errors.occupation ? 'border-red-500' : 'border-gray-300'} rounded-md shadow-sm focus:outline-none focus:ring-red-500 focus:border-red-500`}
                  />
                  {errors.occupation && (
                    <p className="mt-1 text-sm text-red-600">{errors.occupation.message}</p>
                  )}
                </div>

                <div>
                  <label htmlFor="discipline" className="block text-sm font-medium text-gray-700 mb-1">
                    Área de Conocimiento/Disciplina (opcional)
                  </label>
                  <input
                    type="text"
                    id="discipline"
                    {...register("discipline", { 
                      maxLength: {
                        value: 100,
                        message: "Máximo 100 caracteres"
                      }
                    })}
                    className={`block w-full px-3 py-2 border ${errors.discipline ? 'border-red-500' : 'border-gray-300'} rounded-md shadow-sm focus:outline-none focus:ring-red-500 focus:border-red-500`}
                  />
                  {errors.discipline && (
                    <p className="mt-1 text-sm text-red-600">{errors.discipline.message}</p>
                  )}
                </div>
              </div>
            )}

            {/* Step 4: Medical Information */}
            {currentStep === 4 && (
              <div className="space-y-6">
                <h2 className="text-xl font-semibold text-gray-800 flex items-center">
                  <FaHeartbeat className="mr-2 text-red-600" /> Información Médica
                </h2>
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <label htmlFor="bloodType" className="block text-sm font-medium text-gray-700 mb-1">
                      Tipo de Sangre (opcional)
                    </label>
                    <select
                      id="bloodType"
                      {...register("bloodType")}
                      className="block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-red-500 focus:border-red-500"
                    >
                      <option value="">Seleccione...</option>
                      <option value="A">A</option>
                      <option value="B">B</option>
                      <option value="AB">AB</option>
                      <option value="O">O</option>
                    </select>
                  </div>

                  <div>
                    <label htmlFor="rhFactor" className="block text-sm font-medium text-gray-700 mb-1">
                      Factor RH (opcional)
                    </label>
                    <select
                      id="rhFactor"
                      {...register("rhFactor")}
                      className="block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-red-500 focus:border-red-500"
                    >
                      <option value="">Seleccione...</option>
                      <option value="+">Positivo (+)</option>
                      <option value="-">Negativo (-)</option>
                    </select>
                  </div>
                </div>

                <div>
                  <label htmlFor="allergies" className="block text-sm font-medium text-gray-700 mb-1">
                    Alergias (opcional)
                  </label>
                  <textarea
                    id="allergies"
                    {...register("allergies", { 
                      maxLength: {
                        value: 500,
                        message: "Máximo 500 caracteres"
                      }
                    })}
                    rows={3}
                    className={`block w-full px-3 py-2 border ${errors.allergies ? 'border-red-500' : 'border-gray-300'} rounded-md shadow-sm focus:outline-none focus:ring-red-500 focus:border-red-500`}
                  />
                  {errors.allergies && (
                    <p className="mt-1 text-sm text-red-600">{errors.allergies.message}</p>
                  )}
                </div>

                <div>
                  <label htmlFor="physicalConditions" className="block text-sm font-medium text-gray-700 mb-1">
                    Condiciones Físicas (opcional)
                  </label>
                  <textarea
                    id="physicalConditions"
                    {...register("physicalConditions", { 
                      maxLength: {
                        value: 500,
                        message: "Máximo 500 caracteres"
                      }
                    })}
                    rows={3}
                    className={`block w-full px-3 py-2 border ${errors.physicalConditions ? 'border-red-500' : 'border-gray-300'} rounded-md shadow-sm focus:outline-none focus:ring-red-500 focus:border-red-500`}
                  />
                  {errors.physicalConditions && (
                    <p className="mt-1 text-sm text-red-600">{errors.physicalConditions.message}</p>
                  )}
                </div>

                <div>
                  <label htmlFor="medicalTreatments" className="block text-sm font-medium text-gray-700 mb-1">
                    Tratamientos Médicos (opcional)
                  </label>
                  <textarea
                    id="medicalTreatments"
                    {...register("medicalTreatments", { 
                      maxLength: {
                        value: 500,
                        message: "Máximo 500 caracteres"
                      }
                    })}
                    rows={3}
                    className={`block w-full px-3 py-2 border ${errors.medicalTreatments ? 'border-red-500' : 'border-gray-300'} rounded-md shadow-sm focus:outline-none focus:ring-red-500 focus:border-red-500`}
                  />
                  {errors.medicalTreatments && (
                    <p className="mt-1 text-sm text-red-600">{errors.medicalTreatments.message}</p>
                  )}
                </div>

                <div>
                  <label htmlFor="requiredMedications" className="block text-sm font-medium text-gray-700 mb-1">
                    Medicamentos Requeridos (opcional)
                  </label>
                  <textarea
                    id="requiredMedications"
                    {...register("requiredMedications", { 
                      maxLength: {
                        value: 500,
                        message: "Máximo 500 caracteres"
                      }
                    })}
                    rows={3}
                    className={`block w-full px-3 py-2 border ${errors.requiredMedications ? 'border-red-500' : 'border-gray-300'} rounded-md shadow-sm focus:outline-none focus:ring-red-500 focus:border-red-500`}
                  />
                  {errors.requiredMedications && (
                    <p className="mt-1 text-sm text-red-600">{errors.requiredMedications.message}</p>
                  )}
                </div>

                <div>
                  <label htmlFor="healthInsurance" className="block text-sm font-medium text-gray-700 mb-1">
                    EPS/Plan de Salud (opcional)
                  </label>
                  <input
                    type="text"
                    id="healthInsurance"
                    {...register("healthInsurance", { 
                      maxLength: {
                        value: 100,
                        message: "Máximo 100 caracteres"
                      }
                    })}
                    className={`block w-full px-3 py-2 border ${errors.healthInsurance ? 'border-red-500' : 'border-gray-300'} rounded-md shadow-sm focus:outline-none focus:ring-red-500 focus:border-red-500`}
                  />
                  {errors.healthInsurance && (
                    <p className="mt-1 text-sm text-red-600">{errors.healthInsurance.message}</p>
                  )}
                </div>
              </div>
            )}

            {/* Step 5: Emergency Contact */}
            {currentStep === 5 && (
              <div className="space-y-6">
                <h2 className="text-xl font-semibold text-gray-800 flex items-center">
                  <FaShieldAlt className="mr-2 text-red-600" /> Contacto de Emergencia
                </h2>
                
                <div>
                  <label htmlFor="emergencyContactName" className="block text-sm font-medium text-gray-700 mb-1">
                    Nombre Completo (opcional)
                  </label>
                  <input
                    type="text"
                    id="emergencyContactName"
                    {...register("emergencyContactName", { 
                      maxLength: {
                        value: 100,
                        message: "Máximo 100 caracteres"
                      }
                    })}
                    className={`block w-full px-3 py-2 border ${errors.emergencyContactName ? 'border-red-500' : 'border-gray-300'} rounded-md shadow-sm focus:outline-none focus:ring-red-500 focus:border-red-500`}
                  />
                  {errors.emergencyContactName && (
                    <p className="mt-1 text-sm text-red-600">{errors.emergencyContactName.message}</p>
                  )}
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <label htmlFor="emergencyContactRelationship" className="block text-sm font-medium text-gray-700 mb-1">
                      Parentesco (opcional)
                    </label>
                    <input
                      type="text"
                      id="emergencyContactRelationship"
                      {...register("emergencyContactRelationship", { 
                        maxLength: {
                          value: 50,
                          message: "Máximo 50 caracteres"
                        }
                      })}
                      className={`block w-full px-3 py-2 border ${errors.emergencyContactRelationship ? 'border-red-500' : 'border-gray-300'} rounded-md shadow-sm focus:outline-none focus:ring-red-500 focus:border-red-500`}
                    />
                    {errors.emergencyContactRelationship && (
                      <p className="mt-1 text-sm text-red-600">{errors.emergencyContactRelationship.message}</p>
                    )}
                  </div>

                  <div>
                    <label htmlFor="emergencyContactPhone" className="block text-sm font-medium text-gray-700 mb-1">
                      Teléfono (opcional)
                    </label>
                    <input
                      type="tel"
                      id="emergencyContactPhone"
                      {...register("emergencyContactPhone", { 
                        pattern: {
                          value: /^[0-9]{10,15}$/,
                          message: "Número de teléfono inválido"
                        }
                      })}
                      className={`block w-full px-3 py-2 border ${errors.emergencyContactPhone ? 'border-red-500' : 'border-gray-300'} rounded-md shadow-sm focus:outline-none focus:ring-red-500 focus:border-red-500`}
                    />
                    {errors.emergencyContactPhone && (
                      <p className="mt-1 text-sm text-red-600">{errors.emergencyContactPhone.message}</p>
                    )}
                  </div>
                </div>

                <div>
                  <label htmlFor="emergencyContactAddress" className="block text-sm font-medium text-gray-700 mb-1">
                    Dirección (opcional)
                  </label>
                  <input
                    type="text"
                    id="emergencyContactAddress"
                    {...register("emergencyContactAddress", { 
                      maxLength: {
                        value: 100,
                        message: "Máximo 100 caracteres"
                      }
                    })}
                    className={`block w-full px-3 py-2 border ${errors.emergencyContactAddress ? 'border-red-500' : 'border-gray-300'} rounded-md shadow-sm focus:outline-none focus:ring-red-500 focus:border-red-500`}
                  />
                  {errors.emergencyContactAddress && (
                    <p className="mt-1 text-sm text-red-600">{errors.emergencyContactAddress.message}</p>
                  )}
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <label htmlFor="emergencyContactNeighborhood" className="block text-sm font-medium text-gray-700 mb-1">
                      Barrio (opcional)
                    </label>
                    <input
                      type="text"
                      id="emergencyContactNeighborhood"
                      {...register("emergencyContactNeighborhood", { 
                        maxLength: {
                          value: 50,
                          message: "Máximo 50 caracteres"
                        }
                      })}
                      className={`block w-full px-3 py-2 border ${errors.emergencyContactNeighborhood ? 'border-red-500' : 'border-gray-300'} rounded-md shadow-sm focus:outline-none focus:ring-red-500 focus:border-red-500`}
                    />
                    {errors.emergencyContactNeighborhood && (
                      <p className="mt-1 text-sm text-red-600">{errors.emergencyContactNeighborhood.message}</p>
                    )}
                  </div>

                  <div>
                    <label htmlFor="emergencyContactCity" className="block text-sm font-medium text-gray-700 mb-1">
                      Ciudad (opcional)
                    </label>
                    <input
                      type="text"
                      id="emergencyContactCity"
                      {...register("emergencyContactCity", { 
                        maxLength: {
                          value: 50,
                          message: "Máximo 50 caracteres"
                        }
                      })}
                      className={`block w-full px-3 py-2 border ${errors.emergencyContactCity ? 'border-red-500' : 'border-gray-300'} rounded-md shadow-sm focus:outline-none focus:ring-red-500 focus:border-red-500`}
                    />
                    {errors.emergencyContactCity && (
                      <p className="mt-1 text-sm text-red-600">{errors.emergencyContactCity.message}</p>
                    )}
                  </div>
                </div>

                <div>
                  <label htmlFor="emergencyContactCountry" className="block text-sm font-medium text-gray-700 mb-1">
                    País (opcional)
                  </label>
                  <input
                    type="text"
                    id="emergencyContactCountry"
                    {...register("emergencyContactCountry")}
                    defaultValue="Colombia"
                    className="block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-red-500 focus:border-red-500"
                  />
                </div>
              </div>
            )}

            {/* Step 6: Motorcycle Information */}
            {currentStep === 6 && (
              <div className="space-y-6">
                <h2 className="text-xl font-semibold text-gray-800 flex items-center">
                  <FaMotorcycle className="mr-2 text-red-600" /> Información de la Motocicleta
                </h2>
                
                <div>
                  <label htmlFor="motorcyclePlate" className="block text-sm font-medium text-gray-700 mb-1">
                    Placa (opcional)
                  </label>
                  <input
                    type="text"
                    id="motorcyclePlate"
                    {...register("motorcyclePlate", { 
                      maxLength: {
                        value: 10,
                        message: "Máximo 10 caracteres"
                      }
                    })}
                    className={`block w-full px-3 py-2 border ${errors.motorcyclePlate ? 'border-red-500' : 'border-gray-300'} rounded-md shadow-sm focus:outline-none focus:ring-red-500 focus:border-red-500`}
                  />
                  {errors.motorcyclePlate && (
                    <p className="mt-1 text-sm text-red-600">{errors.motorcyclePlate.message}</p>
                  )}
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <label htmlFor="motorcycleBrand" className="block text-sm font-medium text-gray-700 mb-1">
                      Marca (opcional)
                    </label>
                    <input
                      type="text"
                      id="motorcycleBrand"
                      {...register("motorcycleBrand", { 
                        maxLength: {
                          value: 50,
                          message: "Máximo 50 caracteres"
                        }
                      })}
                      className={`block w-full px-3 py-2 border ${errors.motorcycleBrand ? 'border-red-500' : 'border-gray-300'} rounded-md shadow-sm focus:outline-none focus:ring-red-500 focus:border-red-500`}
                    />
                    {errors.motorcycleBrand && (
                      <p className="mt-1 text-sm text-red-600">{errors.motorcycleBrand.message}</p>
                    )}
                  </div>

                  <div>
                    <label htmlFor="motorcycleModel" className="block text-sm font-medium text-gray-700 mb-1">
                      Modelo (opcional)
                    </label>
                    <input
                      type="text"
                      id="motorcycleModel"
                      {...register("motorcycleModel", { 
                        maxLength: {
                          value: 50,
                          message: "Máximo 50 caracteres"
                        }
                      })}
                      className={`block w-full px-3 py-2 border ${errors.motorcycleModel ? 'border-red-500' : 'border-gray-300'} rounded-md shadow-sm focus:outline-none focus:ring-red-500 focus:border-red-500`}
                    />
                    {errors.motorcycleModel && (
                      <p className="mt-1 text-sm text-red-600">{errors.motorcycleModel.message}</p>
                    )}
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <label htmlFor="motorcycleYear" className="block text-sm font-medium text-gray-700 mb-1">
                      Año (opcional)
                    </label>
                    <input
                      type="text"
                      id="motorcycleYear"
                      {...register("motorcycleYear", { 
                        maxLength: {
                          value: 10,
                          message: "Máximo 10 caracteres"
                        }
                      })}
                      className={`block w-full px-3 py-2 border ${errors.motorcycleYear ? 'border-red-500' : 'border-gray-300'} rounded-md shadow-sm focus:outline-none focus:ring-red-500 focus:border-red-500`}
                    />
                    {errors.motorcycleYear && (
                      <p className="mt-1 text-sm text-red-600">{errors.motorcycleYear.message}</p>
                    )}
                  </div>

                  <div>
                    <label htmlFor="motorcycleDisplacement" className="block text-sm font-medium text-gray-700 mb-1">
                      Cilindraje (cc) (opcional)
                    </label>
                    <input
                      type="number"
                      id="motorcycleDisplacement"
                      {...register("motorcycleDisplacement", { 
                        min: {
                          value: 50,
                          message: "Mínimo 50cc"
                        },
                        max: {
                          value: 3000,
                          message: "Máximo 3000cc"
                        }
                      })}
                      className={`block w-full px-3 py-2 border ${errors.motorcycleDisplacement ? 'border-red-500' : 'border-gray-300'} rounded-md shadow-sm focus:outline-none focus:ring-red-500 focus:border-red-500`}
                    />
                    {errors.motorcycleDisplacement && (
                      <p className="mt-1 text-sm text-red-600">{errors.motorcycleDisplacement.message}</p>
                    )}
                  </div>
                </div>
              </div>
            )}

            {/* Step 7: Consents */}
            {currentStep === 7 && (
              <div className="space-y-6">
                <h2 className="text-xl font-semibold text-gray-800 flex items-center">
                  <FaShieldAlt className="mr-2 text-red-600" /> Consentimientos y Términos
                </h2>
                
                <div className="bg-gray-50 p-4 rounded-lg">
                  <div className="flex items-start mb-4">
                    <div className="flex items-center h-5">
                      <input
                        id="dataConsent"
                        type="checkbox"
                        {...register("dataConsent", { 
                          required: "Debes aceptar este consentimiento"
                        })}
                        className="focus:ring-red-500 h-4 w-4 text-red-600 border-gray-300 rounded"
                      />
                    </div>
                    <div className="ml-3 text-sm">
                      <label htmlFor="dataConsent" className="font-medium text-gray-700">
                        Consentimiento de Tratamiento de Datos Personales *
                      </label>
                      <p className="text-gray-500">
                        Autorizo a BSK Motorcycle Team para recolectar, almacenar, usar, circular, suprimir y procesar 
                        mis datos personales de acuerdo con lo establecido en la Ley 1581 de 2012 y demás normas 
                        aplicables, para fines relacionados con mi membresía, actividades del club y comunicación de 
                        beneficios.
                      </p>
                    </div>
                  </div>
                  {errors.dataConsent && (
                    <p className="mt-1 text-sm text-red-600">{errors.dataConsent.message}</p>
                  )}
                </div>

                <div className="bg-gray-50 p-4 rounded-lg">
                  <div className="flex items-start mb-4">
                    <div className="flex items-center h-5">
                      <input
                        id="liabilityWaiver"
                        type="checkbox"
                        {...register("liabilityWaiver", { 
                          required: "Debes aceptar este consentimiento"
                        })}
                        className="focus:ring-red-500 h-4 w-4 text-red-600 border-gray-300 rounded"
                      />
                    </div>
                    <div className="ml-3 text-sm">
                      <label htmlFor="liabilityWaiver" className="font-medium text-gray-700">
                        Exoneración de Responsabilidad *
                      </label>
                      <p className="text-gray-500">
                        Eximo de responsabilidad a BSK Motorcycle Team, sus directivos y organizadores por cualquier 
                        accidente, daño o perjuicio que pueda sufrir durante la participación en actividades del club. 
                        Reconozco que la conducción de motocicletas implica riesgos que asumo voluntariamente.
                      </p>
                    </div>
                  </div>
                  {errors.liabilityWaiver && (
                    <p className="mt-1 text-sm text-red-600">{errors.liabilityWaiver.message}</p>
                  )}
                </div>

                <div className="bg-gray-50 p-4 rounded-lg">
                  <div className="flex items-start">
                    <div className="flex items-center h-5">
                      <input
                        id="termsAcceptance"
                        type="checkbox"
                        {...register("termsAcceptance", { 
                          required: "Debes aceptar los términos y condiciones"
                        })}
                        className="focus:ring-red-500 h-4 w-4 text-red-600 border-gray-300 rounded"
                      />
                    </div>
                    <div className="ml-3 text-sm">
                      <label htmlFor="termsAcceptance" className="font-medium text-gray-700">
                        Aceptación de Términos y Condiciones *
                      </label>
                      <p className="text-gray-500">
                        Acepto los términos y condiciones de la membresía Friend de BSK Motorcycle Team, incluyendo 
                        el código de conducta, reglamento interno, política de puntos y condiciones de participación 
                        en eventos. He leído y comprendo completamente los deberes y beneficios de mi membresía.
                      </p>
                    </div>
                  </div>
                  {errors.termsAcceptance && (
                    <p className="mt-1 text-sm text-red-600">{errors.termsAcceptance.message}</p>
                  )}
                </div>

                <div className="bg-yellow-50 border-l-4 border-yellow-400 p-4">
                  <h3 className="text-lg font-semibold text-yellow-800 mb-2">Importante</h3>
                  <p className="text-yellow-700">
                    Al marcar estas casillas estás aceptando legalmente estos términos. Te recomendamos leer 
                    detenidamente cada uno antes de continuar con tu registro.
                  </p>
                </div>
              </div>
            )}

            {/* Step 8: Password */}
            {currentStep === 8 && (
              <div className="space-y-6">
                <h2 className="text-xl font-semibold text-gray-800 flex items-center">
                  <FaLock className="mr-2 text-red-600" /> Crear Contraseña
                </h2>
                
                <div>
                  <label htmlFor="password" className="block text-sm font-medium text-gray-700 mb-1">
                    Contraseña *
                  </label>
                  <input
                    type="password"
                    id="password"
                    {...register("password", { 
                      required: "Campo obligatorio",
                      minLength: {
                        value: 8,
                        message: "Mínimo 8 caracteres"
                      }
                    })}
                    className={`block w-full px-3 py-2 border ${errors.password ? 'border-red-500' : 'border-gray-300'} rounded-md shadow-sm focus:outline-none focus:ring-red-500 focus:border-red-500`}
                  />
                  {errors.password && (
                    <p className="mt-1 text-sm text-red-600">{errors.password.message}</p>
                  )}
                  <p className="mt-1 text-sm text-gray-500">
                    La contraseña debe tener al menos 8 caracteres.
                  </p>
                </div>

                <div>
                  <label htmlFor="confirmPassword" className="block text-sm font-medium text-gray-700 mb-1">
                    Confirmar Contraseña *
                  </label>
                  <input
                    type="password"
                    id="confirmPassword"
                    {...register("confirmPassword", { 
                      required: "Campo obligatorio",
                      validate: value => 
                        value === watch('password') || "Las contraseñas no coinciden"
                    })}
                    className={`block w-full px-3 py-2 border ${errors.confirmPassword ? 'border-red-500' : 'border-gray-300'} rounded-md shadow-sm focus:outline-none focus:ring-red-500 focus:border-red-500`}
                  />
                  {errors.confirmPassword && (
                    <p className="mt-1 text-sm text-red-600">{errors.confirmPassword.message}</p>
                  )}
                </div>

                {submitError && (
                  <div className="bg-red-50 border-l-4 border-red-500 p-4">
                    <p className="text-red-700">{submitError}</p>
                  </div>
                )}
              </div>
            )}

            <div className="mt-8 flex justify-between">
              {currentStep > 1 ? (
                <button
                  type="button"
                  onClick={prevStep}
                  className="px-4 py-2 border border-gray-300 text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500"
                >
                  Anterior
                </button>
              ) : (
                <div></div>
              )}

              {currentStep < totalSteps ? (
                <button
                  type="button"
                  onClick={nextStep}
                  className="px-4 py-2 border border-transparent text-sm font-medium rounded-md text-white bg-red-600 hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500"
                >
                  Siguiente
                </button>
              ) : (
                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="px-4 py-2 border border-transparent text-sm font-medium rounded-md text-white bg-red-600 hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {isSubmitting ? 'Registrando...' : 'Completar Registro'}
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