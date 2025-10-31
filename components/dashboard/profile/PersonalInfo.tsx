'use client';

import { useState, useEffect } from 'react';
import { FaUser, FaIdCard, FaMapMarkerAlt, FaPhone, FaEdit, FaSave, FaTimes, FaExclamationTriangle } from 'react-icons/fa';
import { IUser } from '@/lib/models/User';

interface PersonalInfoProps {
  user: IUser;
  onSave?: (data: Partial<IUser>) => Promise<void>;
  isEditing?: boolean;
  onEditToggle?: () => void;
}

interface FormData {
  documentType: string;
  documentNumber: string;
  firstName: string;
  lastName: string;
  birthDate: string;
  birthPlace: string;
  phone: string;
  whatsapp: string;
  email: string;
  address: string;
  neighborhood: string;
  city: string;
  country: string;
  postalCode: string;
  binaryGender: string;
  genderIdentity: string;
  occupation: string;
  discipline: string;
}

interface ValidationErrors {
  [key: string]: string;
}

const documentTypes = [
  { value: 'CC', label: 'Cédula de Ciudadanía' },
  { value: 'CE', label: 'Cédula de Extranjería' },
  { value: 'TI', label: 'Tarjeta de Identidad' },
  { value: 'PP', label: 'Pasaporte' }
];

const genderOptions = [
  { value: 'M', label: 'Masculino' },
  { value: 'F', label: 'Femenino' },
  { value: 'O', label: 'Otro' }
];

export default function PersonalInfo({ user, onSave, isEditing = false, onEditToggle }: PersonalInfoProps) {
  const [formData, setFormData] = useState<FormData>({
    documentType: user.documentType || '',
    documentNumber: user.documentNumber || '',
    firstName: user.firstName || '',
    lastName: user.lastName || '',
    birthDate: user.birthDate || '',
    birthPlace: user.birthPlace || '',
    phone: user.phone || '',
    whatsapp: user.whatsapp || '',
    email: user.email || '',
    address: user.address || '',
    neighborhood: user.neighborhood || '',
    city: user.city || '',
    country: user.country || '',
    postalCode: user.postalCode || '',
    binaryGender: user.binaryGender || '',
    genderIdentity: user.genderIdentity || '',
    occupation: user.occupation || '',
    discipline: user.discipline || ''
  });

  const [errors, setErrors] = useState<ValidationErrors>({});
  const [isSaving, setIsSaving] = useState(false);
  const [localIsEditing, setLocalIsEditing] = useState(isEditing);

  useEffect(() => {
    setLocalIsEditing(isEditing);
  }, [isEditing]);

  const validateForm = (): boolean => {
    const newErrors: ValidationErrors = {};

    // Campos requeridos
    if (!formData.documentType) newErrors.documentType = 'Tipo de documento es requerido';
    if (!formData.documentNumber) newErrors.documentNumber = 'Número de documento es requerido';
    if (!formData.firstName) newErrors.firstName = 'Nombre es requerido';
    if (!formData.lastName) newErrors.lastName = 'Apellido es requerido';
    if (!formData.birthDate) newErrors.birthDate = 'Fecha de nacimiento es requerida';
    if (!formData.phone) newErrors.phone = 'Teléfono es requerido';
    if (!formData.email) newErrors.email = 'Email es requerido';
    if (!formData.address) newErrors.address = 'Dirección es requerida';
    if (!formData.city) newErrors.city = 'Ciudad es requerida';
    if (!formData.country) newErrors.country = 'País es requerido';
    if (!formData.binaryGender) newErrors.binaryGender = 'Género es requerido';

    // Validación de email
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (formData.email && !emailRegex.test(formData.email)) {
      newErrors.email = 'Email no válido';
    }

    // Validación de teléfono
    const phoneRegex = /^[0-9+\-\s()]+$/;
    if (formData.phone && !phoneRegex.test(formData.phone)) {
      newErrors.phone = 'Formato de teléfono no válido';
    }

    // Validación de fecha de nacimiento
    if (formData.birthDate) {
      const birthYear = new Date(formData.birthDate).getFullYear();
      const currentYear = new Date().getFullYear();
      if (currentYear - birthYear < 16 || currentYear - birthYear > 100) {
        newErrors.birthDate = 'Edad debe estar entre 16 y 100 años';
      }
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
    
    // Limpiar error específico al cambiar el campo
    if (errors[name]) {
      setErrors(prev => ({ ...prev, [name]: '' }));
    }
  };

  const handleSave = async () => {
    if (!validateForm()) return;

    setIsSaving(true);
    try {
      if (onSave) {
        await onSave(formData);
      }
      setLocalIsEditing(false);
      if (onEditToggle) onEditToggle();
    } catch (error) {
      console.error('Error saving personal info:', error);
    } finally {
      setIsSaving(false);
    }
  };

  const handleCancel = () => {
    // Resetear formulario a valores originales
    setFormData({
      documentType: user.documentType || '',
      documentNumber: user.documentNumber || '',
      firstName: user.firstName || '',
      lastName: user.lastName || '',
      birthDate: user.birthDate || '',
      birthPlace: user.birthPlace || '',
      phone: user.phone || '',
      whatsapp: user.whatsapp || '',
      email: user.email || '',
      address: user.address || '',
      neighborhood: user.neighborhood || '',
      city: user.city || '',
      country: user.country || '',
      postalCode: user.postalCode || '',
      binaryGender: user.binaryGender || '',
      genderIdentity: user.genderIdentity || '',
      occupation: user.occupation || '',
      discipline: user.discipline || ''
    });
    setErrors({});
    setLocalIsEditing(false);
    if (onEditToggle) onEditToggle();
  };

  const handleEditToggle = () => {
    if (localIsEditing) {
      handleCancel();
    } else {
      setLocalIsEditing(true);
      if (onEditToggle) onEditToggle();
    }
  };

  return (
    <div className="bg-white dark:bg-slate-800 rounded-xl shadow-lg p-6">
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 bg-green-100 dark:bg-green-900/30 rounded-lg flex items-center justify-center">
            <FaUser className="w-5 h-5 text-green-600 dark:text-green-400" />
          </div>
          <div>
            <h3 className="text-lg font-semibold text-slate-900 dark:text-white">
              Información Personal
            </h3>
            <p className="text-sm text-slate-500 dark:text-slate-400">
              Datos básicos de identificación y contacto
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2">
          {localIsEditing ? (
            <>
              <button
                onClick={handleSave}
                disabled={isSaving}
                className="inline-flex items-center gap-2 px-3 py-2 bg-green-600 hover:bg-green-700 disabled:bg-green-400 text-white rounded-lg text-sm font-medium"
              >
                <FaSave className="w-4 h-4" />
                {isSaving ? 'Guardando...' : 'Guardar'}
              </button>
              <button
                onClick={handleCancel}
                disabled={isSaving}
                className="inline-flex items-center gap-2 px-3 py-2 bg-slate-500 hover:bg-slate-600 disabled:bg-slate-400 text-white rounded-lg text-sm font-medium"
              >
                <FaTimes className="w-4 h-4" />
                Cancelar
              </button>
            </>
          ) : (
            <button
              onClick={handleEditToggle}
              className="inline-flex items-center gap-2 px-3 py-2 bg-slate-100 hover:bg-slate-200 dark:bg-slate-700 dark:hover:bg-slate-600 text-slate-700 dark:text-slate-300 rounded-lg text-sm font-medium"
            >
              <FaEdit className="w-4 h-4" />
              Editar
            </button>
          )}
        </div>
      </div>

      <form className="space-y-6">
        {/* Identificación */}
        <div>
          <h4 className="text-md font-medium text-slate-900 dark:text-white mb-4 flex items-center gap-2">
            <FaIdCard className="w-4 h-4 text-slate-500" />
            Identificación
          </h4>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">
                Tipo de Documento *
              </label>
              {localIsEditing ? (
                <select
                  name="documentType"
                  value={formData.documentType}
                  onChange={handleInputChange}
                  className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent dark:bg-slate-700 dark:border-slate-600 dark:text-white ${
                    errors.documentType ? 'border-red-500' : 'border-slate-300'
                  }`}
                >
                  <option value="">Seleccionar...</option>
                  {documentTypes.map(type => (
                    <option key={type.value} value={type.value}>{type.label}</option>
                  ))}
                </select>
              ) : (
                <div className="px-3 py-2 bg-slate-50 dark:bg-slate-700 rounded-lg text-slate-900 dark:text-white">
                  {documentTypes.find(type => type.value === formData.documentType)?.label || formData.documentType || 'No especificado'}
                </div>
              )}
              {errors.documentType && (
                <p className="mt-1 text-sm text-red-600 flex items-center gap-1">
                  <FaExclamationTriangle className="w-3 h-3" />
                  {errors.documentType}
                </p>
              )}
            </div>

            <div>
              <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">
                Número de Documento *
              </label>
              {localIsEditing ? (
                <input
                  type="text"
                  name="documentNumber"
                  value={formData.documentNumber}
                  onChange={handleInputChange}
                  className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent dark:bg-slate-700 dark:border-slate-600 dark:text-white ${
                    errors.documentNumber ? 'border-red-500' : 'border-slate-300'
                  }`}
                  placeholder="Ej: 12345678"
                />
              ) : (
                <div className="px-3 py-2 bg-slate-50 dark:bg-slate-700 rounded-lg text-slate-900 dark:text-white">
                  {formData.documentNumber || 'No especificado'}
                </div>
              )}
              {errors.documentNumber && (
                <p className="mt-1 text-sm text-red-600 flex items-center gap-1">
                  <FaExclamationTriangle className="w-3 h-3" />
                  {errors.documentNumber}
                </p>
              )}
            </div>
          </div>
        </div>

        {/* Información Personal */}
        <div>
          <h4 className="text-md font-medium text-slate-900 dark:text-white mb-4 flex items-center gap-2">
            <FaUser className="w-4 h-4 text-slate-500" />
            Datos Personales
          </h4>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">
                Nombres *
              </label>
              {localIsEditing ? (
                <input
                  type="text"
                  name="firstName"
                  value={formData.firstName}
                  onChange={handleInputChange}
                  className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent dark:bg-slate-700 dark:border-slate-600 dark:text-white ${
                    errors.firstName ? 'border-red-500' : 'border-slate-300'
                  }`}
                  placeholder="Nombres"
                />
              ) : (
                <div className="px-3 py-2 bg-slate-50 dark:bg-slate-700 rounded-lg text-slate-900 dark:text-white">
                  {formData.firstName || 'No especificado'}
                </div>
              )}
              {errors.firstName && (
                <p className="mt-1 text-sm text-red-600 flex items-center gap-1">
                  <FaExclamationTriangle className="w-3 h-3" />
                  {errors.firstName}
                </p>
              )}
            </div>

            <div>
              <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">
                Apellidos *
              </label>
              {localIsEditing ? (
                <input
                  type="text"
                  name="lastName"
                  value={formData.lastName}
                  onChange={handleInputChange}
                  className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent dark:bg-slate-700 dark:border-slate-600 dark:text-white ${
                    errors.lastName ? 'border-red-500' : 'border-slate-300'
                  }`}
                  placeholder="Apellidos"
                />
              ) : (
                <div className="px-3 py-2 bg-slate-50 dark:bg-slate-700 rounded-lg text-slate-900 dark:text-white">
                  {formData.lastName || 'No especificado'}
                </div>
              )}
              {errors.lastName && (
                <p className="mt-1 text-sm text-red-600 flex items-center gap-1">
                  <FaExclamationTriangle className="w-3 h-3" />
                  {errors.lastName}
                </p>
              )}
            </div>

            <div>
              <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">
                Fecha de Nacimiento *
              </label>
              {localIsEditing ? (
                <input
                  type="date"
                  name="birthDate"
                  value={formData.birthDate}
                  onChange={handleInputChange}
                  className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent dark:bg-slate-700 dark:border-slate-600 dark:text-white ${
                    errors.birthDate ? 'border-red-500' : 'border-slate-300'
                  }`}
                />
              ) : (
                <div className="px-3 py-2 bg-slate-50 dark:bg-slate-700 rounded-lg text-slate-900 dark:text-white">
                  {formData.birthDate ? new Date(formData.birthDate).toLocaleDateString('es-CO') : 'No especificado'}
                </div>
              )}
              {errors.birthDate && (
                <p className="mt-1 text-sm text-red-600 flex items-center gap-1">
                  <FaExclamationTriangle className="w-3 h-3" />
                  {errors.birthDate}
                </p>
              )}
            </div>

            <div>
              <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">
                Lugar de Nacimiento
              </label>
              {localIsEditing ? (
                <input
                  type="text"
                  name="birthPlace"
                  value={formData.birthPlace}
                  onChange={handleInputChange}
                  className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent dark:bg-slate-700 dark:border-slate-600 dark:text-white"
                  placeholder="Ciudad, País"
                />
              ) : (
                <div className="px-3 py-2 bg-slate-50 dark:bg-slate-700 rounded-lg text-slate-900 dark:text-white">
                  {formData.birthPlace || 'No especificado'}
                </div>
              )}
            </div>

            <div>
              <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">
                Género *
              </label>
              {localIsEditing ? (
                <select
                  name="binaryGender"
                  value={formData.binaryGender}
                  onChange={handleInputChange}
                  className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent dark:bg-slate-700 dark:border-slate-600 dark:text-white ${
                    errors.binaryGender ? 'border-red-500' : 'border-slate-300'
                  }`}
                >
                  <option value="">Seleccionar...</option>
                  {genderOptions.map(option => (
                    <option key={option.value} value={option.value}>{option.label}</option>
                  ))}
                </select>
              ) : (
                <div className="px-3 py-2 bg-slate-50 dark:bg-slate-700 rounded-lg text-slate-900 dark:text-white">
                  {genderOptions.find(option => option.value === formData.binaryGender)?.label || formData.binaryGender || 'No especificado'}
                </div>
              )}
              {errors.binaryGender && (
                <p className="mt-1 text-sm text-red-600 flex items-center gap-1">
                  <FaExclamationTriangle className="w-3 h-3" />
                  {errors.binaryGender}
                </p>
              )}
            </div>

            <div>
              <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">
                Identidad de Género
              </label>
              {localIsEditing ? (
                <input
                  type="text"
                  name="genderIdentity"
                  value={formData.genderIdentity}
                  onChange={handleInputChange}
                  className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent dark:bg-slate-700 dark:border-slate-600 dark:text-white"
                  placeholder="Opcional"
                />
              ) : (
                <div className="px-3 py-2 bg-slate-50 dark:bg-slate-700 rounded-lg text-slate-900 dark:text-white">
                  {formData.genderIdentity || 'No especificado'}
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Contacto */}
        <div>
          <h4 className="text-md font-medium text-slate-900 dark:text-white mb-4 flex items-center gap-2">
            <FaPhone className="w-4 h-4 text-slate-500" />
            Información de Contacto
          </h4>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">
                Teléfono Principal *
              </label>
              {localIsEditing ? (
                <input
                  type="tel"
                  name="phone"
                  value={formData.phone}
                  onChange={handleInputChange}
                  className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent dark:bg-slate-700 dark:border-slate-600 dark:text-white ${
                    errors.phone ? 'border-red-500' : 'border-slate-300'
                  }`}
                  placeholder="Ej: +57 300 123 4567"
                />
              ) : (
                <div className="px-3 py-2 bg-slate-50 dark:bg-slate-700 rounded-lg text-slate-900 dark:text-white">
                  {formData.phone || 'No especificado'}
                </div>
              )}
              {errors.phone && (
                <p className="mt-1 text-sm text-red-600 flex items-center gap-1">
                  <FaExclamationTriangle className="w-3 h-3" />
                  {errors.phone}
                </p>
              )}
            </div>

            <div>
              <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">
                WhatsApp
              </label>
              {localIsEditing ? (
                <input
                  type="tel"
                  name="whatsapp"
                  value={formData.whatsapp}
                  onChange={handleInputChange}
                  className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent dark:bg-slate-700 dark:border-slate-600 dark:text-white"
                  placeholder="Ej: +57 300 123 4567"
                />
              ) : (
                <div className="px-3 py-2 bg-slate-50 dark:bg-slate-700 rounded-lg text-slate-900 dark:text-white">
                  {formData.whatsapp || 'No especificado'}
                </div>
              )}
            </div>

            <div className="md:col-span-2">
              <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">
                Email *
              </label>
              {localIsEditing ? (
                <input
                  type="email"
                  name="email"
                  value={formData.email}
                  onChange={handleInputChange}
                  className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent dark:bg-slate-700 dark:border-slate-600 dark:text-white ${
                    errors.email ? 'border-red-500' : 'border-slate-300'
                  }`}
                  placeholder="usuario@ejemplo.com"
                />
              ) : (
                <div className="px-3 py-2 bg-slate-50 dark:bg-slate-700 rounded-lg text-slate-900 dark:text-white">
                  {formData.email || 'No especificado'}
                </div>
              )}
              {errors.email && (
                <p className="mt-1 text-sm text-red-600 flex items-center gap-1">
                  <FaExclamationTriangle className="w-3 h-3" />
                  {errors.email}
                </p>
              )}
            </div>
          </div>
        </div>

        {/* Ubicación */}
        <div>
          <h4 className="text-md font-medium text-slate-900 dark:text-white mb-4 flex items-center gap-2">
            <FaMapMarkerAlt className="w-4 h-4 text-slate-500" />
            Ubicación
          </h4>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="md:col-span-2">
              <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">
                Dirección *
              </label>
              {localIsEditing ? (
                <input
                  type="text"
                  name="address"
                  value={formData.address}
                  onChange={handleInputChange}
                  className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent dark:bg-slate-700 dark:border-slate-600 dark:text-white ${
                    errors.address ? 'border-red-500' : 'border-slate-300'
                  }`}
                  placeholder="Calle 123 #45-67"
                />
              ) : (
                <div className="px-3 py-2 bg-slate-50 dark:bg-slate-700 rounded-lg text-slate-900 dark:text-white">
                  {formData.address || 'No especificado'}
                </div>
              )}
              {errors.address && (
                <p className="mt-1 text-sm text-red-600 flex items-center gap-1">
                  <FaExclamationTriangle className="w-3 h-3" />
                  {errors.address}
                </p>
              )}
            </div>

            <div>
              <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">
                Barrio
              </label>
              {localIsEditing ? (
                <input
                  type="text"
                  name="neighborhood"
                  value={formData.neighborhood}
                  onChange={handleInputChange}
                  className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent dark:bg-slate-700 dark:border-slate-600 dark:text-white"
                  placeholder="Nombre del barrio"
                />
              ) : (
                <div className="px-3 py-2 bg-slate-50 dark:bg-slate-700 rounded-lg text-slate-900 dark:text-white">
                  {formData.neighborhood || 'No especificado'}
                </div>
              )}
            </div>

            <div>
              <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">
                Código Postal
              </label>
              {localIsEditing ? (
                <input
                  type="text"
                  name="postalCode"
                  value={formData.postalCode}
                  onChange={handleInputChange}
                  className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent dark:bg-slate-700 dark:border-slate-600 dark:text-white"
                  placeholder="110111"
                />
              ) : (
                <div className="px-3 py-2 bg-slate-50 dark:bg-slate-700 rounded-lg text-slate-900 dark:text-white">
                  {formData.postalCode || 'No especificado'}
                </div>
              )}
            </div>

            <div>
              <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">
                Ciudad *
              </label>
              {localIsEditing ? (
                <input
                  type="text"
                  name="city"
                  value={formData.city}
                  onChange={handleInputChange}
                  className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent dark:bg-slate-700 dark:border-slate-600 dark:text-white ${
                    errors.city ? 'border-red-500' : 'border-slate-300'
                  }`}
                  placeholder="Bogotá"
                />
              ) : (
                <div className="px-3 py-2 bg-slate-50 dark:bg-slate-700 rounded-lg text-slate-900 dark:text-white">
                  {formData.city || 'No especificado'}
                </div>
              )}
              {errors.city && (
                <p className="mt-1 text-sm text-red-600 flex items-center gap-1">
                  <FaExclamationTriangle className="w-3 h-3" />
                  {errors.city}
                </p>
              )}
            </div>

            <div>
              <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">
                País *
              </label>
              {localIsEditing ? (
                <input
                  type="text"
                  name="country"
                  value={formData.country}
                  onChange={handleInputChange}
                  className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent dark:bg-slate-700 dark:border-slate-600 dark:text-white ${
                    errors.country ? 'border-red-500' : 'border-slate-300'
                  }`}
                  placeholder="Colombia"
                />
              ) : (
                <div className="px-3 py-2 bg-slate-50 dark:bg-slate-700 rounded-lg text-slate-900 dark:text-white">
                  {formData.country || 'No especificado'}
                </div>
              )}
              {errors.country && (
                <p className="mt-1 text-sm text-red-600 flex items-center gap-1">
                  <FaExclamationTriangle className="w-3 h-3" />
                  {errors.country}
                </p>
              )}
            </div>
          </div>
        </div>

        {/* Información Profesional */}
        <div>
          <h4 className="text-md font-medium text-slate-900 dark:text-white mb-4">
            Información Profesional (Opcional)
          </h4>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">
                Ocupación
              </label>
              {localIsEditing ? (
                <input
                  type="text"
                  name="occupation"
                  value={formData.occupation}
                  onChange={handleInputChange}
                  className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent dark:bg-slate-700 dark:border-slate-600 dark:text-white"
                  placeholder="Ingeniero, Médico, etc."
                />
              ) : (
                <div className="px-3 py-2 bg-slate-50 dark:bg-slate-700 rounded-lg text-slate-900 dark:text-white">
                  {formData.occupation || 'No especificado'}
                </div>
              )}
            </div>

            <div>
              <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">
                Disciplina/Especialidad
              </label>
              {localIsEditing ? (
                <input
                  type="text"
                  name="discipline"
                  value={formData.discipline}
                  onChange={handleInputChange}
                  className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent dark:bg-slate-700 dark:border-slate-600 dark:text-white"
                  placeholder="Área de especialización"
                />
              ) : (
                <div className="px-3 py-2 bg-slate-50 dark:bg-slate-700 rounded-lg text-slate-900 dark:text-white">
                  {formData.discipline || 'No especificado'}
                </div>
              )}
            </div>
          </div>
        </div>
      </form>

      {/* Footer with required fields note */}
      <div className="mt-6 pt-4 border-t border-slate-200 dark:border-slate-600">
        <p className="text-xs text-slate-500 dark:text-slate-400 flex items-center gap-1">
          <FaExclamationTriangle className="w-3 h-3" />
          Los campos marcados con * son obligatorios
        </p>
      </div>
    </div>
  );
}