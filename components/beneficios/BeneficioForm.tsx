'use client';

import { useState, useEffect } from 'react';
import { FaTimes, FaUpload, FaCalendarAlt, FaPlus, FaTrash } from 'react-icons/fa';
import { BeneficioFormProps, CategoriaTypes, BeneficioFormData } from '@/types/beneficios';

const BeneficioForm: React.FC<BeneficioFormProps> = ({
  isOpen,
  onClose,
  onSubmit,
  beneficio,
  isLoading = false
}) => {
  const [formData, setFormData] = useState({
    nombre: '',
    categoria: 'talleres-mecanica' as CategoriaTypes,
    descripcionBreve: '',
    descripcionCompleta: '',
    descuento: '',
    ubicacion: '',
    enlaceWeb: '',
    empresa: '',
    codigoPromocional: '',
    fechaInicio: '',
    fechaFin: '',
    requisitos: [''],
  });

  const [imageFile, setImageFile] = useState<File | null>(null);
  const [imagePreview, setImagePreview] = useState<string>('');

  // Categorías disponibles
  const categorias = [
    { id: 'talleres-mecanica', nombre: 'Talleres y Mecánica' },
    { id: 'accesorios-repuestos', nombre: 'Accesorios y Repuestos' },
    { id: 'restaurantes-hoteles', nombre: 'Restaurantes y Hoteles' },
    { id: 'seguros-finanzas', nombre: 'Seguros y Finanzas' },
    { id: 'salud-bienestar', nombre: 'Salud y Bienestar' },
    { id: 'otros', nombre: 'Otros' },
  ];

  // Cargar datos del beneficio para edición
  useEffect(() => {
    if (beneficio) {
      setFormData({
        nombre: beneficio.nombre,
        categoria: beneficio.categoria,
        descripcionBreve: beneficio.descripcionBreve,
        descripcionCompleta: beneficio.descripcionCompleta,
        descuento: beneficio.descuento,
        ubicacion: beneficio.ubicacion || '',
        enlaceWeb: beneficio.enlaceWeb || '',
        empresa: beneficio.empresa,
        codigoPromocional: beneficio.codigoPromocional,
        fechaInicio: new Date(beneficio.fechaInicio).toISOString().split('T')[0],
        fechaFin: new Date(beneficio.fechaFin).toISOString().split('T')[0],
        requisitos: beneficio.requisitos.length > 0 ? beneficio.requisitos : [''],
      });
      setImagePreview(beneficio.imagen);
    } else {
      // Resetear formulario para nuevo beneficio
      setFormData({
        nombre: '',
        categoria: 'talleres-mecanica',
        descripcionBreve: '',
        descripcionCompleta: '',
        descuento: '',
        ubicacion: '',
        enlaceWeb: '',
        empresa: '',
        codigoPromocional: '',
        fechaInicio: '',
        fechaFin: '',
        requisitos: [''],
      });
      setImageFile(null);
      setImagePreview('');
    }
  }, [beneficio]);

  // Cerrar modal con ESC
  useEffect(() => {
    const handleEsc = (event: KeyboardEvent) => {
      if (event.key === 'Escape') {
        onClose();
      }
    };

    if (isOpen) {
      document.addEventListener('keydown', handleEsc);
      document.body.style.overflow = 'hidden';
    }

    return () => {
      document.removeEventListener('keydown', handleEsc);
      document.body.style.overflow = 'unset';
    };
  }, [isOpen, onClose]);

  // Manejar cambios en inputs
  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  // Manejar cambios en requisitos
  const handleRequisitoChange = (index: number, value: string) => {
    const newRequisitos = [...formData.requisitos];
    newRequisitos[index] = value;
    setFormData(prev => ({
      ...prev,
      requisitos: newRequisitos
    }));
  };

  // Agregar nuevo requisito
  const addRequisito = () => {
    setFormData(prev => ({
      ...prev,
      requisitos: [...prev.requisitos, '']
    }));
  };

  // Eliminar requisito
  const removeRequisito = (index: number) => {
    if (formData.requisitos.length > 1) {
      const newRequisitos = formData.requisitos.filter((_, i) => i !== index);
      setFormData(prev => ({
        ...prev,
        requisitos: newRequisitos
      }));
    }
  };

  // Manejar carga de imagen
  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setImageFile(file);
      const reader = new FileReader();
      reader.onload = (e) => {
        setImagePreview(e.target?.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  // Enviar formulario
  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    const dataToSubmit: BeneficioFormData = {
      ...formData,
      requisitos: formData.requisitos.filter(req => req.trim() !== ''),
      imagen: imageFile
    };

    onSubmit(dataToSubmit);
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto">
      {/* Overlay */}
      <div 
        className="fixed inset-0 bg-black bg-opacity-50 transition-opacity"
        onClick={onClose}
      ></div>

      {/* Modal */}
      <div className="flex min-h-full items-center justify-center p-4">
        <div className="relative w-full max-w-4xl max-h-[90vh] overflow-y-auto bg-white dark:bg-gray-800 
                       rounded-lg shadow-xl">
          
          {/* Header */}
          <div className="sticky top-0 bg-white dark:bg-gray-800 px-6 py-4 border-b border-gray-200 dark:border-gray-700">
            <div className="flex items-center justify-between">
              <h2 className="text-2xl font-bold text-gray-900 dark:text-white">
                {beneficio ? 'Editar Beneficio' : 'Agregar Nuevo Beneficio'}
              </h2>
              <button
                onClick={onClose}
                className="p-2 text-gray-400 hover:text-gray-600 dark:hover:text-gray-300 
                         transition-colors duration-200"
              >
                <FaTimes className="w-6 h-6" />
              </button>
            </div>
          </div>

          {/* Formulario */}
          <form onSubmit={handleSubmit} className="p-6 space-y-6">
            
            {/* Información básica */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Nombre del Beneficio *
                </label>
                <input
                  type="text"
                  name="nombre"
                  value={formData.nombre}
                  onChange={handleInputChange}
                  required
                  className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 
                           rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 
                           bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                  placeholder="Ej: Descuento en repuestos"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Empresa *
                </label>
                <input
                  type="text"
                  name="empresa"
                  value={formData.empresa}
                  onChange={handleInputChange}
                  required
                  className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 
                           rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 
                           bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                  placeholder="Ej: AutoParts Pro"
                />
              </div>
            </div>

            {/* Categoría y descuento */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Categoría *
                </label>
                <select
                  name="categoria"
                  value={formData.categoria}
                  onChange={handleInputChange}
                  className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 
                           rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 
                           bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                >
                  {categorias.map(cat => (
                    <option key={cat.id} value={cat.id}>
                      {cat.nombre}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Descuento *
                </label>
                <input
                  type="text"
                  name="descuento"
                  value={formData.descuento}
                  onChange={handleInputChange}
                  required
                  className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 
                           rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 
                           bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                  placeholder="Ej: 15% OFF, $500 desc."
                />
              </div>
            </div>

            {/* Descripciones */}
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Descripción Breve *
              </label>
              <textarea
                name="descripcionBreve"
                value={formData.descripcionBreve}
                onChange={handleInputChange}
                required
                rows={2}
                className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 
                         rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 
                         bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                placeholder="Descripción corta para mostrar en la tarjeta"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Descripción Completa *
              </label>
              <textarea
                name="descripcionCompleta"
                value={formData.descripcionCompleta}
                onChange={handleInputChange}
                required
                rows={4}
                className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 
                         rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 
                         bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                placeholder="Descripción detallada del beneficio, términos y condiciones..."
              />
            </div>

            {/* Ubicación y enlace web */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Ubicación
                </label>
                <input
                  type="text"
                  name="ubicacion"
                  value={formData.ubicacion}
                  onChange={handleInputChange}
                  className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 
                           rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 
                           bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                  placeholder="Dirección física del establecimiento"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Enlace Web
                </label>
                <input
                  type="url"
                  name="enlaceWeb"
                  value={formData.enlaceWeb}
                  onChange={handleInputChange}
                  className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 
                           rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 
                           bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                  placeholder="https://ejemplo.com"
                />
              </div>
            </div>

            {/* Código promocional */}
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Código Promocional *
              </label>
              <input
                type="text"
                name="codigoPromocional"
                value={formData.codigoPromocional}
                onChange={handleInputChange}
                required
                className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 
                         rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 
                         bg-white dark:bg-gray-700 text-gray-900 dark:text-white font-mono"
                placeholder="BSK2024MT15"
              />
            </div>

            {/* Fechas */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Fecha de Inicio *
                </label>
                <div className="relative">
                  <input
                    type="date"
                    name="fechaInicio"
                    value={formData.fechaInicio}
                    onChange={handleInputChange}
                    required
                    className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 
                             rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 
                             bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                  />
                  <FaCalendarAlt className="absolute right-3 top-3 text-gray-400 pointer-events-none" />
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Fecha de Fin *
                </label>
                <div className="relative">
                  <input
                    type="date"
                    name="fechaFin"
                    value={formData.fechaFin}
                    onChange={handleInputChange}
                    required
                    className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 
                             rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 
                             bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                  />
                  <FaCalendarAlt className="absolute right-3 top-3 text-gray-400 pointer-events-none" />
                </div>
              </div>
            </div>

            {/* Imagen */}
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Imagen del Beneficio
              </label>
              <div className="space-y-4">
                <input
                  type="file"
                  accept="image/*"
                  onChange={handleImageChange}
                  className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 
                           rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 
                           bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                />
                {imagePreview && (
                  <div className="w-32 h-32 relative rounded-lg overflow-hidden">
                    <img
                      src={imagePreview}
                      alt="Preview"
                      className="w-full h-full object-cover"
                    />
                  </div>
                )}
              </div>
            </div>

            {/* Requisitos */}
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Requisitos
              </label>
              <div className="space-y-2">
                {formData.requisitos.map((requisito, index) => (
                  <div key={index} className="flex gap-2">
                    <input
                      type="text"
                      value={requisito}
                      onChange={(e) => handleRequisitoChange(index, e.target.value)}
                      className="flex-1 px-3 py-2 border border-gray-300 dark:border-gray-600 
                               rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 
                               bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                      placeholder="Ej: Mostrar carné de miembro"
                    />
                    {formData.requisitos.length > 1 && (
                      <button
                        type="button"
                        onClick={() => removeRequisito(index)}
                        className="p-2 text-red-600 hover:bg-red-50 dark:hover:bg-red-900/20 
                                 rounded-lg transition-colors duration-200"
                      >
                        <FaTrash className="w-4 h-4" />
                      </button>
                    )}
                  </div>
                ))}
                <button
                  type="button"
                  onClick={addRequisito}
                  className="flex items-center gap-2 px-3 py-2 text-blue-600 dark:text-blue-400 
                           hover:bg-blue-50 dark:hover:bg-blue-900/20 rounded-lg transition-colors duration-200"
                >
                  <FaPlus className="w-4 h-4" />
                  Agregar requisito
                </button>
              </div>
            </div>

            {/* Botones */}
            <div className="flex gap-4 pt-4 border-t border-gray-200 dark:border-gray-700">
              <button
                type="button"
                onClick={onClose}
                className="flex-1 px-4 py-3 border border-gray-300 dark:border-gray-600 
                         text-gray-700 dark:text-gray-300 rounded-lg hover:bg-gray-50 
                         dark:hover:bg-gray-700 transition-colors duration-200 font-medium"
              >
                Cancelar
              </button>
              <button
                type="submit"
                disabled={isLoading}
                className="flex-1 px-4 py-3 bg-blue-600 text-white rounded-lg 
                         hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed 
                         transition-colors duration-200 font-medium"
              >
                {isLoading 
                  ? 'Guardando...' 
                  : beneficio 
                    ? 'Actualizar Beneficio' 
                    : 'Crear Beneficio'
                }
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};

export default BeneficioForm;