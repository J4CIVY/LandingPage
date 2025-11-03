'use client';

import { useState, useEffect, type ChangeEvent } from 'react';
import { FaHeartbeat, FaEdit, FaSave, FaTimes, FaExclamationTriangle, FaLock, FaEye, FaEyeSlash, FaShieldAlt, FaUserMd, FaPills } from 'react-icons/fa';
import { IUser } from '@/lib/models/User';

interface MedicalDataProps {
  user: IUser;
  onSave?: (data: Partial<IUser>) => Promise<void>;
  isEditing?: boolean;
  onEditToggle?: () => void;
}

interface MedicalData {
  bloodType: string;
  rhFactor: string;
  allergies: string;
  healthInsurance: string;
  medications?: string;
  medicalConditions?: string;
  emergencyMedicalNotes?: string;
}

interface ValidationErrors {
  [key: string]: string;
}

const bloodTypes = [
  { value: '', label: 'Seleccionar...' },
  { value: 'A', label: 'A' },
  { value: 'B', label: 'B' },
  { value: 'AB', label: 'AB' },
  { value: 'O', label: 'O' }
];

const rhFactors = [
  { value: '', label: 'Seleccionar...' },
  { value: '+', label: 'Positivo (+)' },
  { value: '-', label: 'Negativo (-)' }
];

export default function MedicalData({ user, onSave, isEditing = false, onEditToggle }: MedicalDataProps) {
  const [formData, setFormData] = useState<MedicalData>({
    bloodType: user.bloodType || '',
    rhFactor: user.rhFactor || '',
    allergies: user.allergies || '',
    healthInsurance: user.healthInsurance || '',
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    medications: (user as any).medications || '',
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    medicalConditions: (user as any).medicalConditions || '',
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    emergencyMedicalNotes: (user as any).emergencyMedicalNotes || ''
  });

  const [errors, setErrors] = useState<ValidationErrors>({});
  const [isSaving, setIsSaving] = useState(false);
  const [localIsEditing, setLocalIsEditing] = useState(isEditing);
  const [isDataVisible, setIsDataVisible] = useState(false);
  const [hasAcceptedPrivacy, setHasAcceptedPrivacy] = useState(false);

  useEffect(() => {
    setLocalIsEditing(isEditing);
  }, [isEditing]);

  const validateForm = (): boolean => {
    const newErrors: ValidationErrors = {};

    // Solo validar que si se especifica tipo de sangre, también se especifique RH
    if (formData.bloodType && !formData.rhFactor) {
      newErrors.rhFactor = 'Factor RH es requerido cuando se especifica tipo de sangre';
    }
    if (formData.rhFactor && !formData.bloodType) {
      newErrors.bloodType = 'Tipo de sangre es requerido cuando se especifica factor RH';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleInputChange = (e: ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
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
      console.error('Error saving medical data:', error);
    } finally {
      setIsSaving(false);
    }
  };

  const handleCancel = () => {
    // Resetear formulario a valores originales
    setFormData({
      bloodType: user.bloodType || '',
      rhFactor: user.rhFactor || '',
      allergies: user.allergies || '',
      healthInsurance: user.healthInsurance || '',
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      medications: (user as any).medications || '',
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      medicalConditions: (user as any).medicalConditions || '',
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      emergencyMedicalNotes: (user as any).emergencyMedicalNotes || ''
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

  const toggleDataVisibility = () => {
    if (!isDataVisible && !hasAcceptedPrivacy) {
      setHasAcceptedPrivacy(true);
    }
    setIsDataVisible(!isDataVisible);
  };

  const hasBasicMedicalInfo = formData.bloodType || formData.rhFactor || formData.allergies || formData.healthInsurance;

  return (
    <div className="bg-linear-to-br from-blue-50 to-indigo-50 dark:from-blue-950/20 dark:to-indigo-950/20 border-2 border-blue-200 dark:border-blue-800 rounded-xl shadow-lg p-6">
      {/* Privacy Alert Header */}
      <div className="bg-blue-100 dark:bg-blue-900/30 border border-blue-200 dark:border-blue-800 rounded-lg p-4 mb-6">
        <div className="flex items-start gap-3">
          <div className="shrink-0">
            <FaLock className="w-6 h-6 text-blue-600 dark:text-blue-400" />
          </div>
          <div className="flex-1">
            <h3 className="text-lg font-semibold text-blue-900 dark:text-blue-100 mb-2">
              Información Médica Confidencial
            </h3>
            <p className="text-sm text-blue-700 dark:text-blue-300 mb-2">
              <strong>PROTECCIÓN DE DATOS MÉDICOS:</strong> Esta información está protegida por las leyes de privacidad médica y solo será accesible para personal autorizado en casos de emergencia.
            </p>
            <p className="text-xs text-blue-600 dark:text-blue-400">
              ✓ Datos encriptados | ✓ Acceso restringido | ✓ Solo para emergencias médicas
            </p>
          </div>
        </div>
      </div>

      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 bg-blue-100 dark:bg-blue-900/30 rounded-lg flex items-center justify-center">
            <FaHeartbeat className="w-5 h-5 text-blue-600 dark:text-blue-400" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h3 className="text-lg font-semibold text-slate-900 dark:text-white">
                Información Médica
              </h3>
              {hasBasicMedicalInfo ? (
                <div className="inline-flex items-center gap-1 px-2 py-1 bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-300 rounded-full text-xs font-medium">
                  <FaShieldAlt className="w-3 h-3" />
                  Configurado
                </div>
              ) : (
                <div className="inline-flex items-center gap-1 px-2 py-1 bg-yellow-100 dark:bg-yellow-900/30 text-yellow-700 dark:text-yellow-300 rounded-full text-xs font-medium">
                  <FaExclamationTriangle className="w-3 h-3" />
                  Opcional
                </div>
              )}
            </div>
            <p className="text-sm text-slate-500 dark:text-slate-400">
              Datos para emergencias médicas
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2">
          {!localIsEditing && (
            <button
              onClick={toggleDataVisibility}
              className="inline-flex items-center gap-2 px-3 py-2 bg-blue-100 hover:bg-blue-200 dark:bg-blue-900/30 dark:hover:bg-blue-800/50 text-blue-700 dark:text-blue-300 rounded-lg text-sm font-medium"
            >
              {isDataVisible ? (
                <>
                  <FaEyeSlash className="w-4 h-4" />
                  Ocultar
                </>
              ) : (
                <>
                  <FaEye className="w-4 h-4" />
                  Ver Datos
                </>
              )}
            </button>
          )}
          
          {localIsEditing ? (
            <>
              <button
                onClick={handleSave}
                disabled={isSaving}
                className="inline-flex items-center gap-2 px-3 py-2 bg-blue-600 hover:bg-blue-700 disabled:bg-blue-400 text-white rounded-lg text-sm font-medium"
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
              className="inline-flex items-center gap-2 px-3 py-2 bg-blue-100 hover:bg-blue-200 dark:bg-blue-900/30 dark:hover:bg-blue-800/50 text-blue-700 dark:text-blue-300 rounded-lg text-sm font-medium"
            >
              <FaEdit className="w-4 h-4" />
              Editar
            </button>
          )}
        </div>
      </div>

      {/* Privacy Acceptance for first time viewing */}
      {!hasAcceptedPrivacy && !isDataVisible && !localIsEditing && (
        <div className="bg-amber-50 dark:bg-amber-950/20 border border-amber-200 dark:border-amber-800 rounded-lg p-4 mb-6">
          <div className="flex items-start gap-3">
            <FaShieldAlt className="w-5 h-5 text-amber-600 dark:text-amber-400 mt-0.5 shrink-0" />
            <div className="flex-1">
              <h4 className="font-medium text-amber-900 dark:text-amber-100 mb-2">
                Aviso de Privacidad Médica
              </h4>
              <p className="text-sm text-amber-700 dark:text-amber-300 mb-3">
                Al ver esta información, confirmas que estás autorizado para acceder a datos médicos sensibles. Esta información será utilizada únicamente para proporcionar atención médica de emergencia durante eventos del motoclub.
              </p>
              <button
                onClick={() => setHasAcceptedPrivacy(true)}
                className="inline-flex items-center gap-2 px-3 py-2 bg-amber-600 hover:bg-amber-700 text-white rounded-lg text-sm font-medium"
              >
                <FaLock className="w-4 h-4" />
                Entiendo y Acepto
              </button>
            </div>
          </div>
        </div>
      )}

      {(isDataVisible || localIsEditing) && (
        <form className="space-y-6">
          {/* Información Básica */}
          <div className="bg-white dark:bg-slate-800 rounded-lg p-4 border border-blue-200 dark:border-blue-800">
            <h4 className="text-md font-medium text-slate-900 dark:text-white mb-4 flex items-center gap-2">
              <FaUserMd className="w-4 h-4 text-blue-500" />
              Información Básica
            </h4>
            
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div>
                <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">
                  Tipo de Sangre
                </label>
                {localIsEditing ? (
                  <select
                    name="bloodType"
                    value={formData.bloodType}
                    onChange={handleInputChange}
                    className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent dark:bg-slate-700 dark:border-slate-600 dark:text-white ${
                      errors.bloodType ? 'border-red-500' : 'border-slate-300'
                    }`}
                  >
                    {bloodTypes.map(type => (
                      <option key={type.value} value={type.value}>{type.label}</option>
                    ))}
                  </select>
                ) : (
                  <div className="px-3 py-2 bg-slate-50 dark:bg-slate-700 rounded-lg text-slate-900 dark:text-white">
                    {formData.bloodType || 'No especificado'}
                  </div>
                )}
                {errors.bloodType && (
                  <p className="mt-1 text-sm text-red-600 flex items-center gap-1">
                    <FaExclamationTriangle className="w-3 h-3" />
                    {errors.bloodType}
                  </p>
                )}
              </div>

              <div>
                <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">
                  Factor RH
                </label>
                {localIsEditing ? (
                  <select
                    name="rhFactor"
                    value={formData.rhFactor}
                    onChange={handleInputChange}
                    className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent dark:bg-slate-700 dark:border-slate-600 dark:text-white ${
                      errors.rhFactor ? 'border-red-500' : 'border-slate-300'
                    }`}
                  >
                    {rhFactors.map(factor => (
                      <option key={factor.value} value={factor.value}>{factor.label}</option>
                    ))}
                  </select>
                ) : (
                  <div className="px-3 py-2 bg-slate-50 dark:bg-slate-700 rounded-lg text-slate-900 dark:text-white">
                    {formData.rhFactor === '+' ? 'Positivo (+)' : 
                     formData.rhFactor === '-' ? 'Negativo (-)' : 
                     'No especificado'}
                  </div>
                )}
                {errors.rhFactor && (
                  <p className="mt-1 text-sm text-red-600 flex items-center gap-1">
                    <FaExclamationTriangle className="w-3 h-3" />
                    {errors.rhFactor}
                  </p>
                )}
              </div>

              <div>
                <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">
                  Grupo Sanguíneo Completo
                </label>
                <div className="px-3 py-2 bg-blue-50 dark:bg-blue-900/30 rounded-lg text-center">
                  <span className="text-lg font-bold text-blue-600 dark:text-blue-400">
                    {formData.bloodType && formData.rhFactor ? 
                      `${formData.bloodType}${formData.rhFactor}` : 
                      'Sin especificar'
                    }
                  </span>
                </div>
              </div>
            </div>

            <div className="mt-4">
              <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">
                EPS / Aseguradora
              </label>
              {localIsEditing ? (
                <input
                  type="text"
                  name="healthInsurance"
                  value={formData.healthInsurance}
                  onChange={handleInputChange}
                  className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent dark:bg-slate-700 dark:border-slate-600 dark:text-white"
                  placeholder="Nombre de la EPS o aseguradora"
                />
              ) : (
                <div className="px-3 py-2 bg-slate-50 dark:bg-slate-700 rounded-lg text-slate-900 dark:text-white">
                  {formData.healthInsurance || 'No especificado'}
                </div>
              )}
            </div>
          </div>

          {/* Alergias */}
          <div className="bg-white dark:bg-slate-800 rounded-lg p-4 border border-red-200 dark:border-red-800">
            <h4 className="text-md font-medium text-slate-900 dark:text-white mb-4 flex items-center gap-2">
              <FaExclamationTriangle className="w-4 h-4 text-red-500" />
              Alergias e Intolerancias
            </h4>
            
            <div>
              <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">
                Alergias Conocidas
              </label>
              {localIsEditing ? (
                <textarea
                  name="allergies"
                  value={formData.allergies}
                  onChange={handleInputChange}
                  rows={3}
                  className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent dark:bg-slate-700 dark:border-slate-600 dark:text-white"
                  placeholder="Describe cualquier alergia a medicamentos, alimentos, materiales, etc. Si no tienes alergias conocidas, escribe 'Ninguna conocida'"
                />
              ) : (
                <div className="px-3 py-2 bg-slate-50 dark:bg-slate-700 rounded-lg text-slate-900 dark:text-white min-h-20">
                  {formData.allergies ? (
                    <span className={formData.allergies.toLowerCase().includes('ninguna') ? 'text-green-600' : 'text-red-600'}>
                      {formData.allergies}
                    </span>
                  ) : (
                    'No especificado'
                  )}
                </div>
              )}
              {formData.allergies && !formData.allergies.toLowerCase().includes('ninguna') && !localIsEditing && (
                <div className="mt-2 p-2 bg-red-50 dark:bg-red-950/20 border border-red-200 dark:border-red-800 rounded-lg">
                  <p className="text-xs text-red-700 dark:text-red-300 flex items-center gap-1">
                    <FaExclamationTriangle className="w-3 h-3" />
                    ¡ATENCIÓN! Este miembro tiene alergias conocidas.
                  </p>
                </div>
              )}
            </div>
          </div>

          {/* Información Médica Extendida */}
          <div className="bg-white dark:bg-slate-800 rounded-lg p-4 border border-purple-200 dark:border-purple-800">
            <h4 className="text-md font-medium text-slate-900 dark:text-white mb-4 flex items-center gap-2">
              <FaPills className="w-4 h-4 text-purple-500" />
              Información Médica Adicional
            </h4>
            
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">
                  Medicamentos Permanentes
                </label>
                {localIsEditing ? (
                  <textarea
                    name="medications"
                    value={formData.medications}
                    onChange={handleInputChange}
                    rows={2}
                    className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent dark:bg-slate-700 dark:border-slate-600 dark:text-white"
                    placeholder="Medicamentos que tomas regularmente (nombre, dosis, frecuencia)"
                  />
                ) : (
                  <div className="px-3 py-2 bg-slate-50 dark:bg-slate-700 rounded-lg text-slate-900 dark:text-white min-h-[60px]">
                    {formData.medications || 'No especificado'}
                  </div>
                )}
              </div>

              <div>
                <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">
                  Condiciones Médicas
                </label>
                {localIsEditing ? (
                  <textarea
                    name="medicalConditions"
                    value={formData.medicalConditions}
                    onChange={handleInputChange}
                    rows={2}
                    className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent dark:bg-slate-700 dark:border-slate-600 dark:text-white"
                    placeholder="Condiciones médicas relevantes (diabetes, hipertensión, etc.)"
                  />
                ) : (
                  <div className="px-3 py-2 bg-slate-50 dark:bg-slate-700 rounded-lg text-slate-900 dark:text-white min-h-[60px]">
                    {formData.medicalConditions || 'No especificado'}
                  </div>
                )}
              </div>

              <div>
                <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">
                  Notas Médicas de Emergencia
                </label>
                {localIsEditing ? (
                  <textarea
                    name="emergencyMedicalNotes"
                    value={formData.emergencyMedicalNotes}
                    onChange={handleInputChange}
                    rows={3}
                    className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent dark:bg-slate-700 dark:border-slate-600 dark:text-white"
                    placeholder="Información adicional importante para personal médico de emergencia"
                  />
                ) : (
                  <div className="px-3 py-2 bg-slate-50 dark:bg-slate-700 rounded-lg text-slate-900 dark:text-white min-h-20">
                    {formData.emergencyMedicalNotes || 'No especificado'}
                  </div>
                )}
              </div>
            </div>
          </div>
        </form>
      )}

      {/* Privacy Footer */}
      <div className="mt-6 pt-4 border-t border-blue-200 dark:border-blue-800">
        <div className="bg-slate-50 dark:bg-slate-800 rounded-lg p-3">
          <div className="flex items-start gap-2">
            <FaLock className="w-4 h-4 text-slate-500 mt-0.5 shrink-0" />
            <div className="text-xs text-slate-600 dark:text-slate-400">
              <p className="font-medium mb-1">Protección de Datos Médicos:</p>
              <p>Esta información está encriptada y protegida según las normativas de protección de datos personales. Solo personal médico autorizado y administradores del motoclub pueden acceder a estos datos en situaciones de emergencia. Puedes solicitar la eliminación de esta información en cualquier momento contactando al administrador.</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}