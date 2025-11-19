'use client';

import { useAuth } from '@/hooks/useAuth';
import { useState, useEffect, type ChangeEvent, type FormEvent } from 'react';
import { useRouter } from 'next/navigation';
import AdminLayout from '@/components/admin/AdminLayout';
import ImageUpload from '@/components/shared/ImageUpload';
import ImageGalleryUpload from '@/components/shared/ImageGalleryUpload';
import { 
  FaSpinner, 
  FaSave,
  FaArrowLeft,
  FaImage,
  FaMapMarkerAlt,
  FaInfoCircle,
  FaUsers,
  FaClock,
  FaFileUpload,
  FaAward,
  FaCalendarCheck
} from 'react-icons/fa';

interface EventFormData {
  name: string;
  description: string;
  longDescription: string;
  startDate: string;
  endDate: string;
  startTime: string;
  endTime: string;
  mainImage: string;
  gallery: string[];
  eventType: string;
  status: 'draft' | 'published';
  departureLocation: {
    address: string;
    city: string;
    country: string;
    coordinates?: {
      lat: number;
      lng: number;
    };
  };
  arrivalLocation?: {
    address: string;
    city: string;
    country: string;
    coordinates?: {
      lat: number;
      lng: number;
    };
  };
  maxParticipants?: number | '';
  registrationOpenDate: string; // Fecha de apertura de inscripciones
  registrationDeadline: string; // Fecha límite de inscripciones
  pointsAwarded: number | ''; // Puntos que otorga este evento
  detailsPdf: string; // URL del PDF con detalles del evento
  price: number | '';
  nonMemberPrice: number | ''; // Precio para no miembros
  requirements: string[];
  includes: string[];
  tags: string[];
}

const initialFormData: EventFormData = {
  name: '',
  description: '',
  longDescription: '',
  startDate: '',
  endDate: '',
  startTime: '',
  endTime: '',
  mainImage: '',
  gallery: [],
  eventType: 'ride',
  status: 'draft',
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
  maxParticipants: '',
  registrationOpenDate: '', // Fecha de apertura de inscripciones
  registrationDeadline: '', // Fecha límite de inscripciones
  pointsAwarded: '', // Puntos que otorga este evento
  detailsPdf: '', // URL del PDF con detalles del evento
  price: '',
  nonMemberPrice: '', // Precio para no miembros
  requirements: [],
  includes: [],
  tags: []
};

const eventTypes = [
  { value: 'ride', label: 'Rodada' },
  { value: 'meeting', label: 'Reunión' },
  { value: 'workshop', label: 'Taller' },
  { value: 'social', label: 'Social' },
  { value: 'charity', label: 'Benéfico' },
  { value: 'competition', label: 'Competencia' },
  { value: 'training', label: 'Entrenamiento' },
  { value: 'maintenance', label: 'Mantenimiento' }
];

export default function NewEventPage() {
  const { user, isLoading, isAuthenticated } = useAuth();
  const router = useRouter();

  const [formData, setFormData] = useState<EventFormData>(initialFormData);
  const [saving, setSaving] = useState(false);
  const [errors, setErrors] = useState<{ [key: string]: string }>({});
  const [newRequirement, setNewRequirement] = useState('');
  const [newInclude, setNewInclude] = useState('');
  const [newTag, setNewTag] = useState('');

  // Verificar autenticación y permisos
  useEffect(() => {
    if (!isLoading && !isAuthenticated) {
      router.push('/login');
      return;
    }

    if (user && user.role !== 'admin' && user.role !== 'super-admin') {
      router.push('/dashboard');
      return;
    }
  }, [user, isAuthenticated, isLoading, router]);

  const handleInputChange = (e: ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value, type } = e.target;
    
    if (name.includes('.')) {
      const [parent, child] = name.split('.');
      setFormData(prev => ({
        ...prev,
        [parent]: {
          ...(prev[parent as keyof EventFormData] as Record<string, unknown>),
          [child]: type === 'number' ? (value === '' ? '' : Number(value)) : value
        }
      }));
    } else {
      setFormData(prev => ({
        ...prev,
        [name]: type === 'number' ? (value === '' ? '' : Number(value)) : value
      }));
    }

    // Limpiar error si existe
    if (errors[name]) {
      setErrors(prev => ({ ...prev, [name]: '' }));
    }
  };

  const addToArray = (arrayName: 'requirements' | 'includes' | 'tags', value: string) => {
    if (!value.trim()) return;
    
    setFormData(prev => ({
      ...prev,
      [arrayName]: [...prev[arrayName], value.trim()]
    }));
    
    if (arrayName === 'requirements') setNewRequirement('');
    if (arrayName === 'includes') setNewInclude('');
    if (arrayName === 'tags') setNewTag('');
  };

  const removeFromArray = (arrayName: 'requirements' | 'includes' | 'tags', index: number) => {
    setFormData(prev => ({
      ...prev,
      [arrayName]: prev[arrayName].filter((_, i) => i !== index)
    }));
  };

  const validateForm = (): boolean => {
    const newErrors: { [key: string]: string } = {};

    // Validaciones requeridas
    if (!formData.name.trim()) newErrors.name = 'El nombre del evento es requerido';
    if (!formData.description.trim()) newErrors.description = 'La descripción corta es requerida';
    if (!formData.startDate) newErrors.startDate = 'La fecha de inicio es requerida';
    if (!formData.startTime) newErrors.startTime = 'La hora de inicio es requerida';
    if (!formData.mainImage.trim()) newErrors.mainImage = 'La imagen principal es requerida';
    if (!formData.departureLocation.address.trim()) newErrors['departureLocation.address'] = 'La dirección de salida es requerida';

    // Validación de fechas
    if (formData.startDate && formData.endDate) {
      const startDate = new Date(formData.startDate);
      const endDate = new Date(formData.endDate);
      if (endDate < startDate) {
        newErrors.endDate = 'La fecha de fin debe ser posterior a la fecha de inicio';
      }
    }

    // Validación de precio
    if (formData.price !== '' && Number(formData.price) < 0) {
      newErrors.price = 'El precio no puede ser negativo';
    }

    // Validación de precio para no miembros
    if (formData.nonMemberPrice !== '' && Number(formData.nonMemberPrice) < 0) {
      newErrors.nonMemberPrice = 'El precio para no miembros no puede ser negativo';
    }

    // Validación de participantes
    if (formData.maxParticipants !== '' && Number(formData.maxParticipants) <= 0) {
      newErrors.maxParticipants = 'El número máximo de participantes debe ser mayor a 0';
    }

    // Validación de fechas de registro
    if (formData.registrationOpenDate && formData.registrationDeadline) {
      const openDate = new Date(formData.registrationOpenDate);
      const deadlineDate = new Date(formData.registrationDeadline);
      if (deadlineDate < openDate) {
        newErrors.registrationDeadline = 'La fecha límite debe ser posterior a la fecha de apertura';
      }
    }

    if (formData.registrationDeadline && formData.startDate) {
      const deadlineDate = new Date(formData.registrationDeadline);
      const startDate = new Date(formData.startDate);
      if (deadlineDate > startDate) {
        newErrors.registrationDeadline = 'La fecha límite debe ser anterior al inicio del evento';
      }
    }

    // Validación de puntos
    if (formData.pointsAwarded !== '' && Number(formData.pointsAwarded) < 0) {
      newErrors.pointsAwarded = 'Los puntos no pueden ser negativos';
    }

    // Validación de URL del PDF
    if (formData.detailsPdf && formData.detailsPdf.trim()) {
      try {
        new URL(formData.detailsPdf);
      } catch {
        newErrors.detailsPdf = 'La URL del PDF no es válida';
      }
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    
    if (!validateForm()) {
      return;
    }

    setSaving(true);
    
    try {
      // Preparar datos para envío
      const eventData = {
        ...formData,
        // Combinar fecha y hora
        startDate: `${formData.startDate}T${formData.startTime}:00.000Z`,
        endDate: formData.endDate ? `${formData.endDate}T${formData.endTime || '23:59'}:00.000Z` : undefined,
        // Convertir strings vacíos a undefined para campos opcionales
        maxParticipants: formData.maxParticipants === '' ? undefined : Number(formData.maxParticipants),
        registrationOpenDate: formData.registrationOpenDate ? `${formData.registrationOpenDate}:00.000Z` : undefined,
        registrationDeadline: formData.registrationDeadline ? `${formData.registrationDeadline}:00.000Z` : undefined,
        pointsAwarded: formData.pointsAwarded === '' ? 0 : Number(formData.pointsAwarded),
        detailsPdf: formData.detailsPdf.trim() || undefined,
        price: formData.price === '' ? 0 : Number(formData.price),
        nonMemberPrice: formData.nonMemberPrice === '' ? undefined : Number(formData.nonMemberPrice),
        // Limpiar ubicación de llegada si está vacía
        arrivalLocation: formData.arrivalLocation?.address.trim() ? formData.arrivalLocation : undefined
      };


      const apiClient = (await import('@/lib/api-client')).default;
      await apiClient.post('/admin/events', eventData);
      
      // Redirigir a la lista de eventos
      router.push('/admin/events');
      
    } catch (error) {
      console.error('Error al crear evento:', error);
      setErrors({ submit: (error as Error).message || 'Error desconocido al crear el evento' });
    } finally {
      setSaving(false);
    }
  };

  const inputClassName = (fieldName: string) => 
    `w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent ${
      errors[fieldName] ? 'border-red-500' : 'border-gray-300'
    }`;

  if (isLoading) {
    return (
      <AdminLayout>
        <div className="flex justify-center items-center h-64">
          <FaSpinner className="animate-spin text-4xl text-blue-600" />
        </div>
      </AdminLayout>
    );
  }

  if (!isAuthenticated || (user && user.role !== 'admin' && user.role !== 'super-admin')) {
    return null;
  }

  return (
    <AdminLayout>
      <div className="space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-4">
            <button
              onClick={() => router.back()}
              className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
              aria-label="Volver atrás"
            >
              <FaArrowLeft className="text-gray-600" />
            </button>
            <div>
              <h1 className="text-2xl font-bold text-gray-800">Crear Nuevo Evento</h1>
              <p className="text-sm text-gray-600">Añade un nuevo evento al calendario del motoclub</p>
            </div>
          </div>
        </div>

        {/* Formulario */}
        <form onSubmit={handleSubmit} className="space-y-8">
          {/* Error general */}
          {errors.submit && (
            <div className="bg-red-50 border border-red-200 rounded-lg p-4">
              <p className="text-red-600">{errors.submit}</p>
            </div>
          )}

          {/* Información Básica */}
          <div className="bg-white rounded-lg shadow-sm border p-6">
            <h3 className="text-lg font-semibold text-gray-800 mb-4 flex items-center">
              <FaInfoCircle className="mr-2 text-blue-600" />
              Información Básica
            </h3>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="md:col-span-2">
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Nombre del Evento *
                </label>
                <input
                  type="text"
                  name="name"
                  value={formData.name}
                  onChange={handleInputChange}
                  className={inputClassName('name')}
                  placeholder="Rodada al Nevado del Ruiz"
                />
                {errors.name && <p className="mt-1 text-sm text-red-600">{errors.name}</p>}
              </div>

              <div className="md:col-span-2">
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Descripción Corta *
                </label>
                <textarea
                  name="description"
                  value={formData.description}
                  onChange={handleInputChange}
                  rows={3}
                  className={inputClassName('description')}
                  placeholder="Descripción breve que aparecerá en las listas de eventos..."
                />
                {errors.description && <p className="mt-1 text-sm text-red-600">{errors.description}</p>}
              </div>

              <div className="md:col-span-2">
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Descripción Detallada
                </label>
                <textarea
                  name="longDescription"
                  value={formData.longDescription}
                  onChange={handleInputChange}
                  rows={5}
                  className={inputClassName('longDescription')}
                  placeholder="Descripción completa del evento, itinerario, qué incluye, recomendaciones..."
                />
              </div>

              <div>
                <label htmlFor="eventType" className="block text-sm font-medium text-gray-700 mb-2">
                  Tipo de Evento
                </label>
                <select
                  id="eventType"
                  name="eventType"
                  value={formData.eventType}
                  onChange={handleInputChange}
                  className={inputClassName('eventType')}
                >
                  {eventTypes.map((type) => (
                    <option key={type.value} value={type.value}>
                      {type.label}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label htmlFor="eventStatus" className="block text-sm font-medium text-gray-700 mb-2">
                  Estado
                </label>
                <select
                  id="eventStatus"
                  name="status"
                  value={formData.status}
                  onChange={handleInputChange}
                  className={inputClassName('status')}
                >
                  <option value="draft">Borrador</option>
                  <option value="published">Publicado</option>
                </select>
              </div>
            </div>
          </div>

          {/* Fechas y Horarios */}
          <div className="bg-white rounded-lg shadow-sm border p-6">
            <h3 className="text-lg font-semibold text-gray-800 mb-4 flex items-center">
              <FaClock className="mr-2 text-blue-600" />
              Fechas y Horarios
            </h3>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label htmlFor="startDate" className="block text-sm font-medium text-gray-700 mb-2">
                  Fecha de Inicio *
                </label>
                <input
                  id="startDate"
                  type="date"
                  name="startDate"
                  value={formData.startDate}
                  onChange={handleInputChange}
                  className={inputClassName('startDate')}
                />
                {errors.startDate && <p className="mt-1 text-sm text-red-600">{errors.startDate}</p>}
              </div>

              <div>
                <label htmlFor="startTime" className="block text-sm font-medium text-gray-700 mb-2">
                  Hora de Inicio *
                </label>
                <input
                  id="startTime"
                  type="time"
                  name="startTime"
                  value={formData.startTime}
                  onChange={handleInputChange}
                  className={inputClassName('startTime')}
                />
                {errors.startTime && <p className="mt-1 text-sm text-red-600">{errors.startTime}</p>}
              </div>

              <div>
                <label htmlFor="endDate" className="block text-sm font-medium text-gray-700 mb-2">
                  Fecha de Fin
                </label>
                <input
                  id="endDate"
                  type="date"
                  name="endDate"
                  value={formData.endDate}
                  onChange={handleInputChange}
                  className={inputClassName('endDate')}
                />
                {errors.endDate && <p className="mt-1 text-sm text-red-600">{errors.endDate}</p>}
              </div>

              <div>
                <label htmlFor="endTime" className="block text-sm font-medium text-gray-700 mb-2">
                  Hora de Fin
                </label>
                <input
                  id="endTime"
                  type="time"
                  name="endTime"
                  value={formData.endTime}
                  onChange={handleInputChange}
                  className={inputClassName('endTime')}
                />
              </div>
            </div>
          </div>

          {/* Ubicaciones */}
          <div className="bg-white rounded-lg shadow-sm border p-6">
            <h3 className="text-lg font-semibold text-gray-800 mb-4 flex items-center">
              <FaMapMarkerAlt className="mr-2 text-blue-600" />
              Ubicaciones
            </h3>
            
            <div className="space-y-6">
              <div>
                <h4 className="font-medium text-gray-700 mb-3">Punto de Salida *</h4>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div className="md:col-span-2">
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Dirección *
                    </label>
                    <input
                      type="text"
                      name="departureLocation.address"
                      value={formData.departureLocation.address}
                      onChange={handleInputChange}
                      className={inputClassName('departureLocation.address')}
                      placeholder="Calle 72 #10-34, Zona Rosa"
                    />
                    {errors['departureLocation.address'] && <p className="mt-1 text-sm text-red-600">{errors['departureLocation.address']}</p>}
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Ciudad
                    </label>
                    <input
                      type="text"
                      name="departureLocation.city"
                      value={formData.departureLocation.city}
                      onChange={handleInputChange}
                      className={inputClassName('departureLocation.city')}
                      placeholder="Bogotá"
                    />
                  </div>
                </div>
              </div>

              <div>
                <h4 className="font-medium text-gray-700 mb-3">Destino (Opcional)</h4>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div className="md:col-span-2">
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Dirección
                    </label>
                    <input
                      type="text"
                      name="arrivalLocation.address"
                      value={formData.arrivalLocation?.address || ''}
                      onChange={handleInputChange}
                      className={inputClassName('arrivalLocation.address')}
                      placeholder="Nevado del Ruiz, Manizales"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Ciudad
                    </label>
                    <input
                      type="text"
                      name="arrivalLocation.city"
                      value={formData.arrivalLocation?.city || ''}
                      onChange={handleInputChange}
                      className={inputClassName('arrivalLocation.city')}
                      placeholder="Manizales"
                    />
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Imágenes */}
          <div className="bg-white rounded-lg shadow-sm border p-6">
            <h3 className="text-lg font-semibold text-gray-800 mb-4 flex items-center">
              <FaImage className="mr-2 text-blue-600" />
              Imágenes
            </h3>
            
            <div className="space-y-6">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Imagen Principal *
                </label>
                <div className="bg-gray-50 rounded-lg p-4">
                  <ImageUpload
                    onImageUploaded={(imageUrl) => setFormData(prev => ({ ...prev, mainImage: imageUrl }))}
                    currentImageUrl={formData.mainImage}
                    folder="events"
                    publicIdPrefix={`event_${formData.name.toLowerCase().replace(/\s+/g, '_') || 'new'}`}
                    className="w-full"
                  />
                  <p className="text-sm text-gray-600 mt-2 text-center">
                    Sube la imagen principal del evento. Esta será la imagen destacada en las listas.
                  </p>
                </div>
                {errors.mainImage && <p className="mt-1 text-sm text-red-600">{errors.mainImage}</p>}
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Galería de Imágenes
                </label>
                <div className="bg-gray-50 rounded-lg p-4">
                  <ImageGalleryUpload
                    images={formData.gallery}
                    onImagesChanged={(images) => setFormData(prev => ({ ...prev, gallery: images }))}
                    folder="events/gallery"
                    publicIdPrefix={`event_${formData.name.toLowerCase().replace(/\s+/g, '_') || 'new'}`}
                    maxImages={6}
                    className="w-full"
                  />
                  <p className="text-sm text-gray-600 mt-2 text-center">
                    Sube imágenes adicionales del evento, destino o actividades relacionadas.
                  </p>
                </div>
              </div>
            </div>
          </div>

          {/* Configuración */}
          <div className="bg-white rounded-lg shadow-sm border p-6">
            <h3 className="text-lg font-semibold text-gray-800 mb-4 flex items-center">
              <FaUsers className="mr-2 text-blue-600" />
              Configuración
            </h3>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Máximo de Participantes
                </label>
                <input
                  type="number"
                  name="maxParticipants"
                  value={formData.maxParticipants}
                  onChange={handleInputChange}
                  className={inputClassName('maxParticipants')}
                  placeholder="20"
                  min="1"
                />
                {errors.maxParticipants && <p className="mt-1 text-sm text-red-600">{errors.maxParticipants}</p>}
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Precio Miembros (COP)
                </label>
                <input
                  type="number"
                  name="price"
                  value={formData.price}
                  onChange={handleInputChange}
                  className={inputClassName('price')}
                  placeholder="50000"
                  min="0"
                />
                <p className="text-xs text-gray-500 mt-1">Precio preferencial para miembros del club</p>
                {errors.price && <p className="mt-1 text-sm text-red-600">{errors.price}</p>}
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Precio No Miembros (COP)
                </label>
                <input
                  type="number"
                  name="nonMemberPrice"
                  value={formData.nonMemberPrice}
                  onChange={handleInputChange}
                  className={inputClassName('nonMemberPrice')}
                  placeholder="75000"
                  min="0"
                />
                <p className="text-xs text-gray-500 mt-1">Precio estándar para personas que no son miembros</p>
                {errors.nonMemberPrice && <p className="mt-1 text-sm text-red-600">{errors.nonMemberPrice}</p>}
              </div>

              <div>
                <label htmlFor="registrationOpenDate" className="block text-sm font-medium text-gray-700 mb-2">
                  <FaCalendarCheck className="inline mr-2 text-green-500" />
                  Fecha de Apertura de Inscripciones
                </label>
                <input
                  id="registrationOpenDate"
                  type="datetime-local"
                  name="registrationOpenDate"
                  value={formData.registrationOpenDate}
                  onChange={handleInputChange}
                  className={inputClassName('registrationOpenDate')}
                />
                {errors.registrationOpenDate && <p className="mt-1 text-sm text-red-600">{errors.registrationOpenDate}</p>}
              </div>

              <div>
                <label htmlFor="registrationDeadline" className="block text-sm font-medium text-gray-700 mb-2">
                  <FaClock className="inline mr-2 text-orange-500" />
                  Fecha Límite de Inscripciones
                </label>
                <input
                  id="registrationDeadline"
                  type="datetime-local"
                  name="registrationDeadline"
                  value={formData.registrationDeadline}
                  onChange={handleInputChange}
                  className={inputClassName('registrationDeadline')}
                />
                {errors.registrationDeadline && <p className="mt-1 text-sm text-red-600">{errors.registrationDeadline}</p>}
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  <FaAward className="inline mr-2 text-yellow-500" />
                  Puntos que Otorga el Evento
                </label>
                <input
                  type="number"
                  name="pointsAwarded"
                  value={formData.pointsAwarded}
                  onChange={handleInputChange}
                  className={inputClassName('pointsAwarded')}
                  placeholder="10"
                  min="0"
                />
                {errors.pointsAwarded && <p className="mt-1 text-sm text-red-600">{errors.pointsAwarded}</p>}
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  <FaFileUpload className="inline mr-2 text-blue-500" />
                  URL del PDF de Detalles
                </label>
                <input
                  type="url"
                  name="detailsPdf"
                  value={formData.detailsPdf}
                  onChange={handleInputChange}
                  className={inputClassName('detailsPdf')}
                  placeholder="https://..."
                />
                {errors.detailsPdf && <p className="mt-1 text-sm text-red-600">{errors.detailsPdf}</p>}
              </div>
            </div>
          </div>

          {/* Detalles Adicionales */}
          <div className="bg-white rounded-lg shadow-sm border p-6">
            <h3 className="text-lg font-semibold text-gray-800 mb-4">
              Detalles Adicionales
            </h3>
            
            <div className="space-y-6">
              {/* Requisitos */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Requisitos
                </label>
                <div className="flex gap-2 mb-3">
                  <input
                    type="text"
                    value={newRequirement}
                    onChange={(e) => setNewRequirement(e.target.value)}
                    onKeyPress={(e) => {
                      if (e.key === 'Enter') {
                        e.preventDefault();
                        addToArray('requirements', newRequirement);
                      }
                    }}
                    className="flex-1 px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    placeholder="Ej: Moto en buen estado, casco, documentos al día..."
                  />
                  <button
                    type="button"
                    onClick={() => addToArray('requirements', newRequirement)}
                    className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
                  >
                    Agregar
                  </button>
                </div>
                
                <div className="flex flex-wrap gap-2">
                  {formData.requirements.map((req, index) => (
                    <span key={index} className="inline-flex items-center px-3 py-1 rounded-full text-sm bg-blue-100 text-blue-800">
                      {req}
                      <button
                        type="button"
                        onClick={() => removeFromArray('requirements', index)}
                        className="ml-2 text-blue-600 hover:text-blue-800"
                      >
                        ×
                      </button>
                    </span>
                  ))}
                </div>
              </div>

              {/* Incluye */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Qué Incluye
                </label>
                <div className="flex gap-2 mb-3">
                  <input
                    type="text"
                    value={newInclude}
                    onChange={(e) => setNewInclude(e.target.value)}
                    onKeyPress={(e) => {
                      if (e.key === 'Enter') {
                        e.preventDefault();
                        addToArray('includes', newInclude);
                      }
                    }}
                    className="flex-1 px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    placeholder="Ej: Desayuno, almuerzo, seguro..."
                  />
                  <button
                    type="button"
                    onClick={() => addToArray('includes', newInclude)}
                    className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors"
                  >
                    Agregar
                  </button>
                </div>
                
                <div className="flex flex-wrap gap-2">
                  {formData.includes.map((inc, index) => (
                    <span key={index} className="inline-flex items-center px-3 py-1 rounded-full text-sm bg-green-100 text-green-800">
                      {inc}
                      <button
                        type="button"
                        onClick={() => removeFromArray('includes', index)}
                        className="ml-2 text-green-600 hover:text-green-800"
                      >
                        ×
                      </button>
                    </span>
                  ))}
                </div>
              </div>

              {/* Tags */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Etiquetas
                </label>
                <div className="flex gap-2 mb-3">
                  <input
                    type="text"
                    value={newTag}
                    onChange={(e) => setNewTag(e.target.value)}
                    onKeyPress={(e) => {
                      if (e.key === 'Enter') {
                        e.preventDefault();
                        addToArray('tags', newTag);
                      }
                    }}
                    className="flex-1 px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    placeholder="Ej: aventura, montaña, naturaleza..."
                  />
                  <button
                    type="button"
                    onClick={() => addToArray('tags', newTag)}
                    className="px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition-colors"
                  >
                    Agregar
                  </button>
                </div>
                
                <div className="flex flex-wrap gap-2">
                  {formData.tags.map((tag, index) => (
                    <span key={index} className="inline-flex items-center px-3 py-1 rounded-full text-sm bg-purple-100 text-purple-800">
                      {tag}
                      <button
                        type="button"
                        onClick={() => removeFromArray('tags', index)}
                        className="ml-2 text-purple-600 hover:text-purple-800"
                      >
                        ×
                      </button>
                    </span>
                  ))}
                </div>
              </div>
            </div>
          </div>

          {/* Botones de Acción */}
          <div className="flex justify-end space-x-4 pt-6">
            <button
              type="button"
              onClick={() => router.back()}
              className="px-6 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors"
            >
              Cancelar
            </button>
            <button
              type="submit"
              disabled={saving}
              className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors flex items-center disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {saving ? (
                <>
                  <FaSpinner className="animate-spin mr-2" />
                  Guardando...
                </>
              ) : (
                <>
                  <FaSave className="mr-2" />
                  Crear Evento
                </>
              )}
            </button>
          </div>
        </form>
      </div>
    </AdminLayout>
  );
}