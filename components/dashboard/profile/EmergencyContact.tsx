'use client';

import { useState, useEffect } from 'react';
import { FaPhone, FaUser, FaExclamationTriangle, FaEdit, FaSave, FaTimes, FaShieldAlt, FaHeart } from 'react-icons/fa';
import { IUser } from '@/lib/models/User';

interface EmergencyContactProps {
  user: IUser;
  onSave?: (data: Partial<IUser>) => Promise<void>;
  isEditing?: boolean;
  onEditToggle?: () => void;
}

interface EmergencyContactData {
  emergencyContactName: string;
  emergencyContactRelationship: string;
  emergencyContactPhone: string;
  emergencyContactAddress: string;
  emergencyContactNeighborhood: string;
  emergencyContactCity: string;
  emergencyContactCountry: string;
  emergencyContactPostalCode: string;
}

interface ValidationErrors {
  [key: string]: string;
}

const relationshipOptions = [
  { value: 'padre', label: 'Padre' },
  { value: 'madre', label: 'Madre' },
  { value: 'hermano', label: 'Hermano' },
  { value: 'hermana', label: 'Hermana' },
  { value: 'esposo', label: 'Esposo' },
  { value: 'esposa', label: 'Esposa' },
  { value: 'pareja', label: 'Pareja' },
  { value: 'hijo', label: 'Hijo' },
  { value: 'hija', label: 'Hija' },
  { value: 'amigo', label: 'Amigo' },
  { value: 'amiga', label: 'Amiga' },
  { value: 'otro', label: 'Otro familiar' }
];

export default function EmergencyContact({ user, onSave, isEditing = false, onEditToggle }: EmergencyContactProps) {
  const [formData, setFormData] = useState<EmergencyContactData>({
    emergencyContactName: user.emergencyContactName || '',
    emergencyContactRelationship: user.emergencyContactRelationship || '',
    emergencyContactPhone: user.emergencyContactPhone || '',
    emergencyContactAddress: user.emergencyContactAddress || '',
    emergencyContactNeighborhood: user.emergencyContactNeighborhood || '',
    emergencyContactCity: user.emergencyContactCity || '',
    emergencyContactCountry: user.emergencyContactCountry || '',
    emergencyContactPostalCode: user.emergencyContactPostalCode || ''
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
    if (!formData.emergencyContactName) {
      newErrors.emergencyContactName = 'Nombre del contacto es requerido';
    }
    if (!formData.emergencyContactRelationship) {
      newErrors.emergencyContactRelationship = 'Relación es requerida';
    }
    if (!formData.emergencyContactPhone) {
      newErrors.emergencyContactPhone = 'Teléfono es requerido';
    }

    // Validación de teléfono
    const phoneRegex = /^[0-9+\-\s()]+$/;
    if (formData.emergencyContactPhone && !phoneRegex.test(formData.emergencyContactPhone)) {
      newErrors.emergencyContactPhone = 'Formato de teléfono no válido';
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
      console.error('Error saving emergency contact:', error);
    } finally {
      setIsSaving(false);
    }
  };

  const handleCancel = () => {
    // Resetear formulario a valores originales
    setFormData({
      emergencyContactName: user.emergencyContactName || '',
      emergencyContactRelationship: user.emergencyContactRelationship || '',
      emergencyContactPhone: user.emergencyContactPhone || '',
      emergencyContactAddress: user.emergencyContactAddress || '',
      emergencyContactNeighborhood: user.emergencyContactNeighborhood || '',
      emergencyContactCity: user.emergencyContactCity || '',
      emergencyContactCountry: user.emergencyContactCountry || '',
      emergencyContactPostalCode: user.emergencyContactPostalCode || ''
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

  const isFormComplete = formData.emergencyContactName && formData.emergencyContactRelationship && formData.emergencyContactPhone;

  return (
    <div className="bg-linear-to-br from-red-50 to-orange-50 dark:from-red-950/20 dark:to-orange-950/20 border-2 border-red-200 dark:border-red-800 rounded-xl shadow-lg p-6">
      {/* Alert Header */}
      <div className="bg-red-100 dark:bg-red-900/30 border border-red-200 dark:border-red-800 rounded-lg p-4 mb-6">
        <div className="flex items-start gap-3">
          <div className="shrink-0">
            <FaExclamationTriangle className="w-6 h-6 text-red-600 dark:text-red-400" />
          </div>
          <div className="flex-1">
            <h3 className="text-lg font-semibold text-red-900 dark:text-red-100 mb-2">
              Información de Emergencia Crítica
            </h3>
            <p className="text-sm text-red-700 dark:text-red-300 mb-2">
              <strong>¡IMPORTANTE!</strong> Esta información será utilizada únicamente en caso de emergencia durante eventos o actividades del motoclub.
            </p>
            <p className="text-xs text-red-600 dark:text-red-400">
              Asegúrate de mantener estos datos actualizados y que tu contacto de emergencia esté siempre disponible.
            </p>
          </div>
        </div>
      </div>

      {/* Header with status */}
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 bg-red-100 dark:bg-red-900/30 rounded-lg flex items-center justify-center">
            <FaShieldAlt className="w-5 h-5 text-red-600 dark:text-red-400" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h3 className="text-lg font-semibold text-slate-900 dark:text-white">
                Contacto de Emergencia
              </h3>
              {isFormComplete ? (
                <div className="inline-flex items-center gap-1 px-2 py-1 bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-300 rounded-full text-xs font-medium">
                  <FaHeart className="w-3 h-3" />
                  Configurado
                </div>
              ) : (
                <div className="inline-flex items-center gap-1 px-2 py-1 bg-red-100 dark:bg-red-900/30 text-red-700 dark:text-red-300 rounded-full text-xs font-medium">
                  <FaExclamationTriangle className="w-3 h-3" />
                  Incompleto
                </div>
              )}
            </div>
            <p className="text-sm text-slate-500 dark:text-slate-400">
              Persona a contactar en caso de emergencia
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2">
          {localIsEditing ? (
            <>
              <button
                onClick={handleSave}
                disabled={isSaving}
                className="inline-flex items-center gap-2 px-3 py-2 bg-red-600 hover:bg-red-700 disabled:bg-red-400 text-white rounded-lg text-sm font-medium"
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
              className="inline-flex items-center gap-2 px-3 py-2 bg-red-100 hover:bg-red-200 dark:bg-red-900/30 dark:hover:bg-red-800/50 text-red-700 dark:text-red-300 rounded-lg text-sm font-medium"
            >
              <FaEdit className="w-4 h-4" />
              Editar
            </button>
          )}
        </div>
      </div>

      <form className="space-y-6">
        {/* Información Principal del Contacto */}
        <div className="bg-white dark:bg-slate-800 rounded-lg p-4 border border-red-200 dark:border-red-800">
          <h4 className="text-md font-medium text-slate-900 dark:text-white mb-4 flex items-center gap-2">
            <FaUser className="w-4 h-4 text-red-500" />
            Información Principal
          </h4>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">
                Nombre Completo *
              </label>
              {localIsEditing ? (
                <input
                  type="text"
                  name="emergencyContactName"
                  value={formData.emergencyContactName}
                  onChange={handleInputChange}
                  className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-red-500 focus:border-transparent dark:bg-slate-700 dark:border-slate-600 dark:text-white ${
                    errors.emergencyContactName ? 'border-red-500' : 'border-slate-300'
                  }`}
                  placeholder="Nombre completo del contacto"
                />
              ) : (
                <div className="px-3 py-2 bg-slate-50 dark:bg-slate-700 rounded-lg text-slate-900 dark:text-white">
                  {formData.emergencyContactName || (
                    <span className="text-red-500 italic">No especificado - ¡Crítico!</span>
                  )}
                </div>
              )}
              {errors.emergencyContactName && (
                <p className="mt-1 text-sm text-red-600 flex items-center gap-1">
                  <FaExclamationTriangle className="w-3 h-3" />
                  {errors.emergencyContactName}
                </p>
              )}
            </div>

            <div>
              <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">
                Relación *
              </label>
              {localIsEditing ? (
                <select
                  name="emergencyContactRelationship"
                  value={formData.emergencyContactRelationship}
                  onChange={handleInputChange}
                  className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-red-500 focus:border-transparent dark:bg-slate-700 dark:border-slate-600 dark:text-white ${
                    errors.emergencyContactRelationship ? 'border-red-500' : 'border-slate-300'
                  }`}
                >
                  <option value="">Seleccionar relación...</option>
                  {relationshipOptions.map(option => (
                    <option key={option.value} value={option.value}>{option.label}</option>
                  ))}
                </select>
              ) : (
                <div className="px-3 py-2 bg-slate-50 dark:bg-slate-700 rounded-lg text-slate-900 dark:text-white">
                  {relationshipOptions.find(option => option.value === formData.emergencyContactRelationship)?.label || 
                   formData.emergencyContactRelationship || (
                    <span className="text-red-500 italic">No especificado - ¡Crítico!</span>
                  )}
                </div>
              )}
              {errors.emergencyContactRelationship && (
                <p className="mt-1 text-sm text-red-600 flex items-center gap-1">
                  <FaExclamationTriangle className="w-3 h-3" />
                  {errors.emergencyContactRelationship}
                </p>
              )}
            </div>

            <div className="md:col-span-2">
              <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">
                Teléfono Principal *
              </label>
              {localIsEditing ? (
                <input
                  type="tel"
                  name="emergencyContactPhone"
                  value={formData.emergencyContactPhone}
                  onChange={handleInputChange}
                  className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-red-500 focus:border-transparent dark:bg-slate-700 dark:border-slate-600 dark:text-white ${
                    errors.emergencyContactPhone ? 'border-red-500' : 'border-slate-300'
                  }`}
                  placeholder="Ej: +57 300 123 4567"
                />
              ) : (
                <div className="px-3 py-2 bg-slate-50 dark:bg-slate-700 rounded-lg text-slate-900 dark:text-white">
                  {formData.emergencyContactPhone ? (
                    <div className="flex items-center gap-2">
                      <FaPhone className="w-4 h-4 text-green-600" />
                      <span className="font-medium">{formData.emergencyContactPhone}</span>
                    </div>
                  ) : (
                    <span className="text-red-500 italic">No especificado - ¡Crítico!</span>
                  )}
                </div>
              )}
              {errors.emergencyContactPhone && (
                <p className="mt-1 text-sm text-red-600 flex items-center gap-1">
                  <FaExclamationTriangle className="w-3 h-3" />
                  {errors.emergencyContactPhone}
                </p>
              )}
              {formData.emergencyContactPhone && !localIsEditing && (
                <p className="mt-1 text-xs text-green-600 dark:text-green-400">
                  ✓ Teléfono configurado y listo para emergencias
                </p>
              )}
            </div>
          </div>
        </div>

        {/* Información de Ubicación (Opcional) */}
        <div className="bg-white dark:bg-slate-800 rounded-lg p-4 border border-orange-200 dark:border-orange-800">
          <h4 className="text-md font-medium text-slate-900 dark:text-white mb-4 flex items-center gap-2">
            <FaUser className="w-4 h-4 text-orange-500" />
            Información de Ubicación (Opcional)
          </h4>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="md:col-span-2">
              <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">
                Dirección
              </label>
              {localIsEditing ? (
                <input
                  type="text"
                  name="emergencyContactAddress"
                  value={formData.emergencyContactAddress}
                  onChange={handleInputChange}
                  className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent dark:bg-slate-700 dark:border-slate-600 dark:text-white"
                  placeholder="Dirección del contacto de emergencia"
                />
              ) : (
                <div className="px-3 py-2 bg-slate-50 dark:bg-slate-700 rounded-lg text-slate-900 dark:text-white">
                  {formData.emergencyContactAddress || 'No especificado'}
                </div>
              )}
            </div>

            <div>
              <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">
                Barrio
              </label>
              {localIsEditing ? (
                <input
                  type="text"
                  name="emergencyContactNeighborhood"
                  value={formData.emergencyContactNeighborhood}
                  onChange={handleInputChange}
                  className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent dark:bg-slate-700 dark:border-slate-600 dark:text-white"
                  placeholder="Barrio"
                />
              ) : (
                <div className="px-3 py-2 bg-slate-50 dark:bg-slate-700 rounded-lg text-slate-900 dark:text-white">
                  {formData.emergencyContactNeighborhood || 'No especificado'}
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
                  name="emergencyContactPostalCode"
                  value={formData.emergencyContactPostalCode}
                  onChange={handleInputChange}
                  className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent dark:bg-slate-700 dark:border-slate-600 dark:text-white"
                  placeholder="110111"
                />
              ) : (
                <div className="px-3 py-2 bg-slate-50 dark:bg-slate-700 rounded-lg text-slate-900 dark:text-white">
                  {formData.emergencyContactPostalCode || 'No especificado'}
                </div>
              )}
            </div>

            <div>
              <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">
                Ciudad
              </label>
              {localIsEditing ? (
                <input
                  type="text"
                  name="emergencyContactCity"
                  value={formData.emergencyContactCity}
                  onChange={handleInputChange}
                  className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent dark:bg-slate-700 dark:border-slate-600 dark:text-white"
                  placeholder="Ciudad"
                />
              ) : (
                <div className="px-3 py-2 bg-slate-50 dark:bg-slate-700 rounded-lg text-slate-900 dark:text-white">
                  {formData.emergencyContactCity || 'No especificado'}
                </div>
              )}
            </div>

            <div>
              <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">
                País
              </label>
              {localIsEditing ? (
                <input
                  type="text"
                  name="emergencyContactCountry"
                  value={formData.emergencyContactCountry}
                  onChange={handleInputChange}
                  className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent dark:bg-slate-700 dark:border-slate-600 dark:text-white"
                  placeholder="País"
                />
              ) : (
                <div className="px-3 py-2 bg-slate-50 dark:bg-slate-700 rounded-lg text-slate-900 dark:text-white">
                  {formData.emergencyContactCountry || 'No especificado'}
                </div>
              )}
            </div>
          </div>
        </div>
      </form>

      {/* Footer with emergency notice */}
      <div className="mt-6 pt-4 border-t border-red-200 dark:border-red-800">
        <div className="bg-amber-50 dark:bg-amber-950/20 border border-amber-200 dark:border-amber-800 rounded-lg p-3">
          <div className="flex items-start gap-2">
            <FaExclamationTriangle className="w-4 h-4 text-amber-600 dark:text-amber-400 mt-0.5 shrink-0" />
            <div className="text-xs text-amber-700 dark:text-amber-300">
              <p className="font-medium mb-1">Aviso de Privacidad para Emergencias:</p>
              <p>Esta información será utilizada exclusivamente por el equipo administrativo de BSK Motorcycle Team en casos de emergencia durante eventos oficiales. Los datos están protegidos según nuestra política de privacidad y no serán compartidos con terceros excepto en situaciones de emergencia médica o de seguridad.</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}