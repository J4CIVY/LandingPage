'use client';

import { useState, useEffect, type FormEvent } from 'react';
import { 
  FaTimes, 
  FaCalendarAlt, 
  FaMapMarkerAlt, 
  FaUsers, 
  FaClock,
  FaImage,
  FaPlus,
  FaMinus,
  FaMoneyBillWave,
  FaRoute,
  FaTachometerAlt,
  FaSave,
  FaAward,
  FaCalendarCheck
} from 'react-icons/fa';
import { Event, EventType, EventStatus, EventDifficulty, CreateEventData } from '@/types/events';
import ImageUpload from '@/components/shared/ImageUpload';
import ImageGalleryUpload from '@/components/shared/ImageGalleryUpload';
import PdfUpload from '@/components/shared/PdfUpload';

interface EventoFormProps {
  event?: Event | null;
  isOpen: boolean;
  onClose: () => void;
  onSave: (eventData: CreateEventData) => Promise<void>;
}

const eventTypes: EventType[] = [
  'Rally', 'Taller', 'Charla', 'Rodada', 'Concentración', 
  'Competencia', 'Social', 'Mantenimiento', 'Turismo', 'Beneficencia'
];

const difficulties: EventDifficulty[] = ['beginner', 'intermediate', 'advanced', 'expert'];

const difficultyLabels = {
  beginner: 'Principiante',
  intermediate: 'Intermedio',
  advanced: 'Avanzado',
  expert: 'Experto'
};

export default function EventoForm({ event, isOpen, onClose, onSave }: EventoFormProps) {
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState<CreateEventData>({
    name: '',
    startDate: '',
    endDate: '',
    description: '',
    longDescription: '',
    mainImage: '',
    gallery: [],
    detailsPdf: '',
    eventType: 'Rodada',
    status: 'published',
    departureLocation: {
      address: '',
      city: '',
      country: 'Colombia'
    },
    arrivalLocation: {
      address: '',
      city: '',
      country: 'Colombia'
    },
    maxParticipants: undefined,
    registrationOpenDate: '', // Fecha de apertura de inscripciones
    registrationDeadline: '',
    price: 0,
    nonMemberPrice: 0, // Precio para no miembros
    includedServices: [''],
    requirements: [''],
    difficulty: 'beginner',
    distance: undefined,
    duration: undefined,
    pointsAwarded: 0, // Puntos que otorga este evento
    organizer: {
      name: '',
      phone: '',
      email: ''
    },
    tags: ['']
  });

  // Función para convertir fecha ISO a datetime-local manteniendo hora colombiana
  const formatDateForInput = (isoDate: string): string => {
    if (!isoDate) return '';
    
    try {
      
      // Si la fecha ya está en formato datetime-local, devolverla como está
      if (isoDate.length === 16 && isoDate.includes('T') && !isoDate.includes(':00')) {
        return isoDate;
      }
      
      // Convertir fecha ISO a objeto Date
      const date = new Date(isoDate);
      
      // Verificar si la fecha es válida
      if (isNaN(date.getTime())) {
        console.error('❌ Fecha inválida:', isoDate);
        return '';
      }
      
      // Ajustar a zona horaria colombiana (UTC-5)
      // Colombia está 5 horas atrás de UTC
      const colombianTime = new Date(date.getTime() - (5 * 60 * 60 * 1000));
      
      // Si la fecha original ya tenía zona horaria colombiana, no ajustar
      if (isoDate.includes('-05:00') || isoDate.includes('-0500')) {
        // La fecha ya está en hora colombiana, usar la fecha original
        const year = date.getFullYear();
        const month = String(date.getMonth() + 1).padStart(2, '0');
        const day = String(date.getDate()).padStart(2, '0');
        const hours = String(date.getHours()).padStart(2, '0');
        const minutes = String(date.getMinutes()).padStart(2, '0');
        
        const formattedDate = `${year}-${month}-${day}T${hours}:${minutes}`;
        return formattedDate;
      }
      
      // Formatear como datetime-local (YYYY-MM-DDTHH:mm) en hora colombiana
      const year = colombianTime.getUTCFullYear();
      const month = String(colombianTime.getUTCMonth() + 1).padStart(2, '0');
      const day = String(colombianTime.getUTCDate()).padStart(2, '0');
      const hours = String(colombianTime.getUTCHours()).padStart(2, '0');
      const minutes = String(colombianTime.getUTCMinutes()).padStart(2, '0');
      
      const formattedDate = `${year}-${month}-${day}T${hours}:${minutes}`;
      return formattedDate;
    } catch (error) {
      console.error('❌ Error formatting date:', error);
      return '';
    }
  };

  // Inicializar formulario con datos del evento (para edición)
  useEffect(() => {
    if (event) {
      setFormData({
        name: event.name,
        startDate: formatDateForInput(event.startDate),
        endDate: event.endDate ? formatDateForInput(event.endDate) : '',
        description: event.description,
        longDescription: event.longDescription || '',
        mainImage: event.mainImage,
        gallery: event.gallery || [],
        detailsPdf: event.detailsPdf || '',
        eventType: event.eventType,
        status: event.status,
        departureLocation: event.departureLocation || {
          address: '',
          city: '',
          country: 'Colombia'
        },
        arrivalLocation: event.arrivalLocation || {
          address: '',
          city: '',
          country: 'Colombia'
        },
        maxParticipants: event.maxParticipants,
        registrationOpenDate: event.registrationOpenDate ? formatDateForInput(event.registrationOpenDate) : '',
        registrationDeadline: event.registrationDeadline ? formatDateForInput(event.registrationDeadline) : '',
        price: event.price || 0,
        nonMemberPrice: (event as any).nonMemberPrice || 0, // eslint-disable-line @typescript-eslint/no-explicit-any
        includedServices: event.includedServices?.length ? event.includedServices : [''],
        requirements: event.requirements?.length ? event.requirements : [''],
        difficulty: event.difficulty || 'beginner',
        distance: event.distance,
        duration: event.duration,
        pointsAwarded: event.pointsAwarded || 0,
        organizer: event.organizer,
        tags: event.tags?.length ? event.tags : ['']
      });
    } else {
      // Reset form for new event
      setFormData({
        name: '',
        startDate: '',
        endDate: '',
        description: '',
        longDescription: '',
        mainImage: '',
        gallery: [],
        detailsPdf: '',
        eventType: 'Rodada',
        status: 'published',
        departureLocation: {
          address: '',
          city: '',
          country: 'Colombia'
        },
        arrivalLocation: {
          address: '',
          city: '',
          country: 'Colombia'
        },
        maxParticipants: undefined,
        registrationOpenDate: '',
        registrationDeadline: '',
        price: 0,
        nonMemberPrice: 0, // Precio para no miembros
        includedServices: [''],
        requirements: [''],
        difficulty: 'beginner',
        distance: undefined,
        duration: undefined,
        pointsAwarded: 0,
        organizer: {
          name: '',
          phone: '',
          email: ''
        },
        tags: ['']
      });
    }
  }, [event, isOpen]);

  // Actualizar campo del formulario
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const updateField = (field: keyof CreateEventData, value: any) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  // Actualizar campo anidado
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const updateNestedField = (parentField: keyof CreateEventData, field: string, value: any) => {
    setFormData(prev => ({
      ...prev,
      [parentField]: {
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        ...(prev[parentField] as any),
        [field]: value
      }
    }));
  };

  // Agregar elemento a array
  const addArrayItem = (field: keyof CreateEventData) => {
    setFormData(prev => ({
      ...prev,
      [field]: [...(prev[field] as string[]), '']
    }));
  };

  // Remover elemento de array
  const removeArrayItem = (field: keyof CreateEventData, index: number) => {
    setFormData(prev => ({
      ...prev,
      [field]: (prev[field] as string[]).filter((_, i) => i !== index)
    }));
  };

  // Actualizar elemento de array
  const updateArrayItem = (field: keyof CreateEventData, index: number, value: string) => {
    setFormData(prev => ({
      ...prev,
      [field]: (prev[field] as string[]).map((item, i) => i === index ? value : item)
    }));
  };

  // Manejar envío del formulario
  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      // Validar que la imagen principal esté presente
      if (!formData.mainImage || formData.mainImage.trim() === '') {
        alert('Por favor, sube una imagen principal para el evento.');
        setLoading(false);
        return;
      }

      // Validaciones adicionales
      if (!formData.departureLocation.address || !formData.departureLocation.city) {
        alert('Por favor, completa la información de la ubicación de salida.');
        setLoading(false);
        return;
      }

      if (!formData.organizer.name || !formData.organizer.phone || !formData.organizer.email) {
        alert('Por favor, completa toda la información del organizador.');
        setLoading(false);
        return;
      }

      // Procesar fechas manteniendo la hora local colombiana
      const processDate = (dateString: string) => {
        if (!dateString) return dateString;
        
        try {
          
          // Para datetime-local, el formato es "YYYY-MM-DDTHH:mm"
          // Necesitamos convertir esto a formato ISO con zona horaria colombiana explícita
          
          if (dateString.includes('T')) {
            // Si ya tiene formato datetime-local (YYYY-MM-DDTHH:mm)
            if (dateString.length === 16) {
              const processedDate = dateString + ':00.000-05:00';
              return processedDate;
            }
            
            // Si ya tiene más información pero no zona horaria
            if (!dateString.includes('+') && !dateString.includes('-') && !dateString.endsWith('Z')) {
              const processedDate = dateString + '-05:00';
              return processedDate;
            }
            
            // Si ya tiene zona horaria, verificar que sea la correcta
            if (dateString.includes('-05:00') || dateString.includes('-0500')) {
              return dateString;
            }
          }
          
          return dateString;
        } catch (error) {
          console.error('❌ Error processing date:', error);
          return dateString;
        }
      };

      // Limpiar arrays de elementos vacíos
      const cleanedData = {
        ...formData,
        startDate: processDate(formData.startDate),
        endDate: formData.endDate ? processDate(formData.endDate) : undefined,
        registrationDeadline: formData.registrationDeadline ? processDate(formData.registrationDeadline) : undefined,
        includedServices: formData.includedServices?.filter(item => item.trim() !== '') || [],
        requirements: formData.requirements?.filter(item => item.trim() !== '') || [],
        tags: formData.tags?.filter(item => item.trim() !== '') || [],
        gallery: formData.gallery?.filter(item => item.trim() !== '') || []
      };

      await onSave(cleanedData);
    } catch (error) {
      console.error('Error saving event:', error);
      alert('Error al guardar el evento. Por favor, inténtalo de nuevo.');
    } finally {
      setLoading(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white dark:bg-slate-800 rounded-lg max-w-5xl w-full max-h-screen overflow-y-auto">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-gray-200 dark:border-slate-600 bg-white dark:bg-slate-800 sticky top-0 z-10">
          <h2 className="text-2xl font-bold text-gray-900 dark:text-slate-100">
            {event ? 'Editar Evento' : 'Crear Nuevo Evento'}
          </h2>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600 dark:hover:text-slate-300 p-2 rounded-full hover:bg-gray-100 dark:hover:bg-slate-700"
          >
            <FaTimes className="text-xl" />
          </button>
        </div>

        {/* Formulario */}
        <form onSubmit={handleSubmit} className="p-6 space-y-6">
          {/* Información básica */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-slate-300 mb-2">
                Nombre del evento *
              </label>
              <input
                type="text"
                required
                value={formData.name}
                onChange={(e) => updateField('name', e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 dark:border-slate-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white dark:bg-slate-700 text-gray-900 dark:text-slate-100"
                placeholder="Ej: Rodada a Villa de Leyva"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-slate-300 mb-2">
                Tipo de evento *
              </label>
              <select
                required
                value={formData.eventType}
                onChange={(e) => updateField('eventType', e.target.value as EventType)}
                className="w-full px-3 py-2 border border-gray-300 dark:border-slate-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white dark:bg-slate-700 text-gray-900 dark:text-slate-100"
              >
                {eventTypes.map(type => (
                  <option key={type} value={type}>{type}</option>
                ))}
              </select>
            </div>
          </div>

          {/* Fechas */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-slate-300 mb-2">
                <FaCalendarAlt className="inline mr-1" />
                Fecha y hora de inicio *
              </label>
              <input
                type="datetime-local"
                required
                value={formData.startDate}
                onChange={(e) => updateField('startDate', e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 dark:border-slate-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white dark:bg-slate-700 text-gray-900 dark:text-slate-100"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-slate-300 mb-2">
                <FaCalendarAlt className="inline mr-1" />
                Fecha y hora de fin
              </label>
              <input
                type="datetime-local"
                value={formData.endDate}
                onChange={(e) => updateField('endDate', e.target.value)}
                min={formData.startDate}
                className="w-full px-3 py-2 border border-gray-300 dark:border-slate-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white dark:bg-slate-700 text-gray-900 dark:text-slate-100"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-slate-300 mb-2">
                <FaCalendarAlt className="inline mr-1" />
                Límite de inscripción
              </label>
              <input
                type="datetime-local"
                value={formData.registrationDeadline}
                onChange={(e) => updateField('registrationDeadline', e.target.value)}
                max={formData.startDate}
                className="w-full px-3 py-2 border border-gray-300 dark:border-slate-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white dark:bg-slate-700 text-gray-900 dark:text-slate-100"
              />
            </div>
          </div>

          {/* Descripción */}
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-slate-300 mb-2">
                Descripción corta *
              </label>
              <textarea
                required
                value={formData.description}
                onChange={(e) => updateField('description', e.target.value)}
                rows={3}
                maxLength={1000}
                className="w-full px-3 py-2 border border-gray-300 dark:border-slate-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white dark:bg-slate-700 text-gray-900 dark:text-slate-100"
                placeholder="Descripción que aparecerá en la tarjeta del evento..."
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-slate-300 mb-2">
                Descripción completa
              </label>
              <textarea
                value={formData.longDescription}
                onChange={(e) => updateField('longDescription', e.target.value)}
                rows={5}
                maxLength={5000}
                className="w-full px-3 py-2 border border-gray-300 dark:border-slate-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white dark:bg-slate-700 text-gray-900 dark:text-slate-100"
                placeholder="Descripción detallada que aparecerá en el modal del evento..."
              />
            </div>
          </div>

          {/* Sección de imágenes y documentos */}
          <div className="space-y-6 p-6 bg-gray-50 dark:bg-slate-700 rounded-lg">
            <h3 className="text-xl font-semibold text-gray-900 dark:text-slate-100 border-b border-gray-200 dark:border-slate-600 pb-2">
              Imágenes y Documentos del Evento
            </h3>
            
            {/* Imagen principal */}
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-slate-300 mb-2">
                <FaImage className="inline mr-1" />
                Imagen principal del evento *
              </label>
              <ImageUpload
                onImageUploaded={(imageUrl: string) => updateField('mainImage', imageUrl)}
                currentImageUrl={formData.mainImage}
                folder="events"
                publicIdPrefix={`event_${Date.now()}`}
                preserveOriginalSize={true}
                className="mb-4"
              />
              <p className="text-sm text-gray-500 dark:text-slate-400 mt-2">
                Esta imagen aparecerá como portada del evento en las tarjetas y detalles.
              </p>
            </div>

            {/* Galería de imágenes */}
            <div>
              <h4 className="text-lg font-semibold text-gray-900 dark:text-slate-100 mb-3 flex items-center">
                <FaImage className="mr-2" />
                Galería de Imágenes
              </h4>
              <ImageGalleryUpload
                images={formData.gallery || []}
                onImagesChanged={(images: string[]) => updateField('gallery', images)}
                folder="events/gallery"
                publicIdPrefix={`event_gallery_${Date.now()}`}
                maxImages={10}
                preserveOriginalSize={true}
                className="mb-4"
              />
              <p className="text-sm text-gray-500 dark:text-slate-400">
                Agrega hasta 10 imágenes adicionales para mostrar en la galería del evento (opcional).
              </p>
            </div>

            {/* PDF con detalles */}
            <div>
              <h4 className="text-lg font-semibold text-gray-900 dark:text-slate-100 mb-3 flex items-center">
                <FaImage className="mr-2" />
                Documento PDF con Detalles
              </h4>
              <PdfUpload
                onPdfUploaded={(pdfUrl: string) => updateField('detailsPdf', pdfUrl)}
                currentPdfUrl={formData.detailsPdf}
                folder="events/documents"
                publicIdPrefix={`event_details_${Date.now()}`}
                className="mb-4"
              />
              <p className="text-sm text-gray-500 dark:text-slate-400">
                Sube un PDF con información detallada del evento (itinerario, requisitos, etc.) - Opcional.
              </p>
            </div>
          </div>

          {/* Ubicaciones */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Ubicación de salida */}
            <div>
              <h3 className="text-lg font-semibold text-gray-900 dark:text-slate-100 mb-3 flex items-center">
                <FaMapMarkerAlt className="mr-2 text-green-500" />
                Ubicación de Salida *
              </h3>
              <div className="space-y-3">
                <input
                  type="text"
                  required
                  value={formData.departureLocation.address}
                  onChange={(e) => updateNestedField('departureLocation', 'address', e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 dark:border-slate-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white dark:bg-slate-700 text-gray-900 dark:text-slate-100"
                  placeholder="Dirección completa"
                />
                <div className="grid grid-cols-2 gap-2">
                  <input
                    type="text"
                    required
                    value={formData.departureLocation.city}
                    onChange={(e) => updateNestedField('departureLocation', 'city', e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 dark:border-slate-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white dark:bg-slate-700 text-gray-900 dark:text-slate-100"
                    placeholder="Ciudad"
                  />
                  <input
                    type="text"
                    required
                    value={formData.departureLocation.country}
                    onChange={(e) => updateNestedField('departureLocation', 'country', e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 dark:border-slate-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white dark:bg-slate-700 text-gray-900 dark:text-slate-100"
                    placeholder="País"
                  />
                </div>
              </div>
            </div>

            {/* Ubicación de llegada */}
            <div>
              <h3 className="text-lg font-semibold text-gray-900 dark:text-slate-100 mb-3 flex items-center">
                <FaMapMarkerAlt className="mr-2 text-red-500" />
                Ubicación de Llegada
              </h3>
              <div className="space-y-3">
                <input
                  type="text"
                  value={formData.arrivalLocation?.address || ''}
                  onChange={(e) => updateNestedField('arrivalLocation', 'address', e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 dark:border-slate-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white dark:bg-slate-700 text-gray-900 dark:text-slate-100"
                  placeholder="Dirección completa (opcional)"
                />
                <div className="grid grid-cols-2 gap-2">
                  <input
                    type="text"
                    value={formData.arrivalLocation?.city || ''}
                    onChange={(e) => updateNestedField('arrivalLocation', 'city', e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 dark:border-slate-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white dark:bg-slate-700 text-gray-900 dark:text-slate-100"
                    placeholder="Ciudad"
                  />
                  <input
                    type="text"
                    value={formData.arrivalLocation?.country || 'Colombia'}
                    onChange={(e) => updateNestedField('arrivalLocation', 'country', e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 dark:border-slate-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white dark:bg-slate-700 text-gray-900 dark:text-slate-100"
                    placeholder="País"
                  />
                </div>
              </div>
            </div>
          </div>

          {/* Detalles del evento */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-slate-300 mb-2">
                <FaUsers className="inline mr-1" />
                Máximo participantes
              </label>
              <input
                type="number"
                min="1"
                value={formData.maxParticipants || ''}
                onChange={(e) => updateField('maxParticipants', e.target.value ? parseInt(e.target.value) : undefined)}
                className="w-full px-3 py-2 border border-gray-300 dark:border-slate-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white dark:bg-slate-700 text-gray-900 dark:text-slate-100"
                placeholder="Sin límite"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-slate-300 mb-2">
                <FaMoneyBillWave className="inline mr-1" />
                Precio Miembros ($)
              </label>
              <input
                type="number"
                min="0"
                value={formData.price}
                onChange={(e) => updateField('price', parseFloat(e.target.value) || 0)}
                className="w-full px-3 py-2 border border-gray-300 dark:border-slate-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white dark:bg-slate-700 text-gray-900 dark:text-slate-100"
                placeholder="0"
              />
              <p className="text-xs text-gray-500 dark:text-slate-400 mt-1">
                Precio preferencial para miembros del club
              </p>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-slate-300 mb-2">
                <FaMoneyBillWave className="inline mr-1" />
                Precio No Miembros ($)
              </label>
              <input
                type="number"
                min="0"
                value={(formData as any).nonMemberPrice || 0} // eslint-disable-line @typescript-eslint/no-explicit-any
                onChange={(e) => updateField('nonMemberPrice' as any, parseFloat(e.target.value) || 0)} // eslint-disable-line @typescript-eslint/no-explicit-any
                className="w-full px-3 py-2 border border-gray-300 dark:border-slate-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white dark:bg-slate-700 text-gray-900 dark:text-slate-100"
                placeholder="0"
              />
              <p className="text-xs text-gray-500 dark:text-slate-400 mt-1">
                Precio estándar para personas que no son miembros
              </p>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-slate-300 mb-2">
                <FaAward className="inline mr-1" />
                Puntos que otorga
              </label>
              <input
                type="number"
                min="0"
                value={formData.pointsAwarded}
                onChange={(e) => updateField('pointsAwarded', parseFloat(e.target.value) || 0)}
                className="w-full px-3 py-2 border border-gray-300 dark:border-slate-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white dark:bg-slate-700 text-gray-900 dark:text-slate-100"
                placeholder="10"
              />
            </div>
          </div>

          {/* Fechas de registro */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-slate-300 mb-2">
                <FaCalendarCheck className="inline mr-1" />
                Apertura de inscripciones
              </label>
              <input
                type="datetime-local"
                value={formData.registrationOpenDate}
                onChange={(e) => updateField('registrationOpenDate', e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 dark:border-slate-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white dark:bg-slate-700 text-gray-900 dark:text-slate-100"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-slate-300 mb-2">
                <FaClock className="inline mr-1" />
                Cierre de inscripciones
              </label>
              <input
                type="datetime-local"
                value={formData.registrationDeadline}
                onChange={(e) => updateField('registrationDeadline', e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 dark:border-slate-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white dark:bg-slate-700 text-gray-900 dark:text-slate-100"
              />
            </div>
          </div>

          {/* Duración y distancia */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-slate-300 mb-2">
                <FaClock className="inline mr-1" />
                Duración (horas)
              </label>
              <input
                type="number"
                min="0"
                step="0.5"
                value={formData.duration || ''}
                onChange={(e) => updateField('duration', e.target.value ? parseFloat(e.target.value) : undefined)}
                className="w-full px-3 py-2 border border-gray-300 dark:border-slate-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white dark:bg-slate-700 text-gray-900 dark:text-slate-100"
                placeholder="8"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-slate-300 mb-2">
                <FaRoute className="inline mr-1" />
                Distancia (km)
              </label>
              <input
                type="number"
                min="0"
                value={formData.distance || ''}
                onChange={(e) => updateField('distance', e.target.value ? parseFloat(e.target.value) : undefined)}
                className="w-full px-3 py-2 border border-gray-300 dark:border-slate-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white dark:bg-slate-700 text-gray-900 dark:text-slate-100"
                placeholder="150"
              />
            </div>
          </div>

          {/* Estado y dificultad */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-slate-300 mb-2">
                Estado del evento
              </label>
              <select
                value={formData.status}
                onChange={(e) => updateField('status', e.target.value as EventStatus)}
                className="w-full px-3 py-2 border border-gray-300 dark:border-slate-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white dark:bg-slate-700 text-gray-900 dark:text-slate-100"
              >
                <option value="draft">Borrador</option>
                <option value="published">Publicado</option>
                <option value="cancelled">Cancelado</option>
                <option value="completed">Completado</option>
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-slate-300 mb-2">
                <FaTachometerAlt className="inline mr-1" />
                Dificultad
              </label>
              <select
                value={formData.difficulty}
                onChange={(e) => updateField('difficulty', e.target.value as EventDifficulty)}
                className="w-full px-3 py-2 border border-gray-300 dark:border-slate-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white dark:bg-slate-700 text-gray-900 dark:text-slate-100"
              >
                {difficulties.map(diff => (
                  <option key={diff} value={diff}>
                    {difficultyLabels[diff]}
                  </option>
                ))}
              </select>
            </div>
          </div>

          {/* Organizador */}
          <div className="space-y-4 p-6 bg-blue-50 dark:bg-blue-900/20 rounded-lg">
            <h3 className="text-xl font-semibold text-gray-900 dark:text-slate-100 border-b border-blue-200 dark:border-blue-700 pb-2">
              Información del Organizador *
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <input
                type="text"
                required
                value={formData.organizer.name}
                onChange={(e) => updateNestedField('organizer', 'name', e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 dark:border-slate-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white dark:bg-slate-700 text-gray-900 dark:text-slate-100"
                placeholder="Nombre del organizador"
              />
              <input
                type="tel"
                required
                value={formData.organizer.phone}
                onChange={(e) => updateNestedField('organizer', 'phone', e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 dark:border-slate-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white dark:bg-slate-700 text-gray-900 dark:text-slate-100"
                placeholder="Teléfono"
              />
              <input
                type="email"
                required
                value={formData.organizer.email}
                onChange={(e) => updateNestedField('organizer', 'email', e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 dark:border-slate-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white dark:bg-slate-700 text-gray-900 dark:text-slate-100"
                placeholder="Email"
              />
            </div>
          </div>

          {/* Arrays dinámicos */}
          {/* Requisitos */}
          <div>
            <h3 className="text-lg font-semibold text-gray-900 dark:text-slate-100 mb-3">
              Requisitos para Participar
            </h3>
            <div className="space-y-2">
              {formData.requirements?.map((requirement, index) => (
                <div key={index} className="flex items-center space-x-2">
                  <input
                    type="text"
                    value={requirement}
                    onChange={(e) => updateArrayItem('requirements', index, e.target.value)}
                    className="flex-1 px-3 py-2 border border-gray-300 dark:border-slate-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white dark:bg-slate-700 text-gray-900 dark:text-slate-100"
                    placeholder="Ej: Licencia de conducción vigente"
                  />
                  <button
                    type="button"
                    onClick={() => removeArrayItem('requirements', index)}
                    className="text-red-500 hover:text-red-700 p-2"
                  >
                    <FaMinus />
                  </button>
                </div>
              )) || []}
              <button
                type="button"
                onClick={() => addArrayItem('requirements')}
                className="text-blue-500 hover:text-blue-700 flex items-center space-x-1"
              >
                <FaPlus />
                <span>Agregar requisito</span>
              </button>
            </div>
          </div>

          {/* Servicios incluidos */}
          <div>
            <h3 className="text-lg font-semibold text-gray-900 dark:text-slate-100 mb-3">
              Servicios Incluidos
            </h3>
            <div className="space-y-2">
              {formData.includedServices?.map((service, index) => (
                <div key={index} className="flex items-center space-x-2">
                  <input
                    type="text"
                    value={service}
                    onChange={(e) => updateArrayItem('includedServices', index, e.target.value)}
                    className="flex-1 px-3 py-2 border border-gray-300 dark:border-slate-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white dark:bg-slate-700 text-gray-900 dark:text-slate-100"
                    placeholder="Ej: Desayuno incluido"
                  />
                  <button
                    type="button"
                    onClick={() => removeArrayItem('includedServices', index)}
                    className="text-red-500 hover:text-red-700 p-2"
                  >
                    <FaMinus />
                  </button>
                </div>
              )) || []}
              <button
                type="button"
                onClick={() => addArrayItem('includedServices')}
                className="text-blue-500 hover:text-blue-700 flex items-center space-x-1"
              >
                <FaPlus />
                <span>Agregar servicio</span>
              </button>
            </div>
          </div>

          {/* Tags */}
          <div>
            <h3 className="text-lg font-semibold text-gray-900 dark:text-slate-100 mb-3">
              Etiquetas
            </h3>
            <div className="space-y-2">
              {formData.tags?.map((tag, index) => (
                <div key={index} className="flex items-center space-x-2">
                  <input
                    type="text"
                    value={tag}
                    onChange={(e) => updateArrayItem('tags', index, e.target.value)}
                    className="flex-1 px-3 py-2 border border-gray-300 dark:border-slate-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white dark:bg-slate-700 text-gray-900 dark:text-slate-100"
                    placeholder="Ej: aventura, montaña"
                  />
                  <button
                    type="button"
                    onClick={() => removeArrayItem('tags', index)}
                    className="text-red-500 hover:text-red-700 p-2"
                  >
                    <FaMinus />
                  </button>
                </div>
              )) || []}
              <button
                type="button"
                onClick={() => addArrayItem('tags')}
                className="text-blue-500 hover:text-blue-700 flex items-center space-x-1"
              >
                <FaPlus />
                <span>Agregar etiqueta</span>
              </button>
            </div>
          </div>

          {/* Botones */}
          <div className="flex flex-col sm:flex-row gap-3 pt-6 border-t border-gray-200 dark:border-slate-600">
            <button
              type="button"
              onClick={onClose}
              className="flex-1 bg-gray-500 hover:bg-gray-600 text-white px-6 py-3 rounded-lg font-medium"
            >
              Cancelar
            </button>
            <button
              type="submit"
              disabled={loading}
              className="flex-1 bg-blue-600 hover:bg-blue-700 disabled:bg-blue-400 text-white px-6 py-3 rounded-lg font-medium flex items-center justify-center space-x-2"
            >
              <FaSave />
              <span>{loading ? 'Guardando...' : event ? 'Actualizar Evento' : 'Crear Evento'}</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
