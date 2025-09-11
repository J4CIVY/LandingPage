'use client';

import { useAuth } from '@/hooks/useAuth';
import { useState, useEffect } from 'react';
import { useRouter, useParams } from 'next/navigation';
import AdminLayout from '@/components/admin/AdminLayout';
import ImageUpload from '@/components/shared/ImageUpload';
import ImageGalleryUpload from '@/components/shared/ImageGalleryUpload';
import { 
  FaSpinner, 
  FaSave,
  FaArrowLeft,
  FaCalendarAlt,
  FaClock,
  FaMapMarkerAlt,
  FaUsers,
  FaDollarSign,
  FaImage,
  FaTags,
  FaInfoCircle
} from 'react-icons/fa';

interface EventFormData {
  name: string;
  startDate: string;
  endDate: string;
  description: string;
  longDescription: string;
  mainImage: string;
  eventType: string;
  status: 'draft' | 'published' | 'cancelled' | 'completed';
  departureLocation: {
    address: string;
    city: string;
    country: string;
    coordinates?: {
      lat: number;
      lng: number;
    };
  };
  arrivalLocation: {
    address: string;
    city: string;
    country: string;
  };
  maxParticipants: number | '';
  registrationDeadline: string;
  price: number | '';
  includedServices: string[];
  requirements: string[];
  difficulty: 'beginner' | 'intermediate' | 'advanced' | 'expert' | '';
  distance: number | '';
  duration: number | '';
  organizer: {
    name: string;
    phone: string;
    email: string;
  };
  tags: string[];
}

const initialFormData: EventFormData = {
  name: '',
  startDate: '',
  endDate: '',
  description: '',
  longDescription: '',
  mainImage: '',
  eventType: '',
  status: 'published',
  departureLocation: {
    address: '',
    city: '',
    country: 'México'
  },
  arrivalLocation: {
    address: '',
    city: '',
    country: 'México'
  },
  maxParticipants: '',
  registrationDeadline: '',
  price: '',
  includedServices: [],
  requirements: [],
  difficulty: '',
  distance: '',
  duration: '',
  organizer: {
    name: '',
    phone: '',
    email: ''
  },
  tags: []
};

const eventTypes = [
  { value: 'rodada', label: 'Rodada' },
  { value: 'reunion', label: 'Reunión' },
  { value: 'curso', label: 'Curso/Taller' },
  { value: 'social', label: 'Evento Social' },
  { value: 'mantenimiento', label: 'Día de Mantenimiento' },
  { value: 'competencia', label: 'Competencia' },
  { value: 'viaje', label: 'Viaje Largo' },
  { value: 'patrocinado', label: 'Evento Patrocinado' }
];

const difficultyLevels = [
  { value: 'beginner', label: 'Principiante' },
  { value: 'intermediate', label: 'Intermedio' },
  { value: 'advanced', label: 'Avanzado' },
  { value: 'expert', label: 'Experto' }
];

export default function EditEventPage() {
  const { user, isLoading, isAuthenticated } = useAuth();
  const router = useRouter();
  const params = useParams();
  const eventId = params?.id as string;

  const [formData, setFormData] = useState<EventFormData>(initialFormData);
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [errors, setErrors] = useState<{ [key: string]: string }>({});
  const [newService, setNewService] = useState('');
  const [newRequirement, setNewRequirement] = useState('');
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

  // Cargar datos del evento
  useEffect(() => {
    const loadEvent = async () => {
      try {
        setLoading(true);
        const response = await fetch(`/api/admin/events/${eventId}`);
        if (response.ok) {
          const data = await response.json();
          const event = data.event;
          
          // Formatear fechas para inputs
          const formatDateForInput = (date: string) => {
            return new Date(date).toISOString().slice(0, 16);
          };

          setFormData({
            name: event.name || '',
            startDate: formatDateForInput(event.startDate),
            endDate: event.endDate ? formatDateForInput(event.endDate) : '',
            description: event.description || '',
            longDescription: event.longDescription || '',
            mainImage: event.mainImage || '',
            eventType: event.eventType || '',
            status: event.status || 'published',
            departureLocation: {
              address: event.departureLocation?.address || '',
              city: event.departureLocation?.city || '',
              country: event.departureLocation?.country || 'México',
              coordinates: event.departureLocation?.coordinates
            },
            arrivalLocation: {
              address: event.arrivalLocation?.address || '',
              city: event.arrivalLocation?.city || '',
              country: event.arrivalLocation?.country || 'México'
            },
            maxParticipants: event.maxParticipants || '',
            registrationDeadline: event.registrationDeadline ? formatDateForInput(event.registrationDeadline) : '',
            price: event.price || '',
            includedServices: event.includedServices || [],
            requirements: event.requirements || [],
            difficulty: event.difficulty || '',
            distance: event.distance || '',
            duration: event.duration || '',
            organizer: {
              name: event.organizer?.name || '',
              phone: event.organizer?.phone || '',
              email: event.organizer?.email || ''
            },
            tags: event.tags || []
          });
        } else {
          router.push('/admin/events');
        }
      } catch (error) {
        console.error('Error cargando evento:', error);
        router.push('/admin/events');
      } finally {
        setLoading(false);
      }
    };

    if (user && (user.role === 'admin' || user.role === 'super-admin') && eventId) {
      loadEvent();
    }
  }, [eventId, user, router]);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    
    if (name.includes('.')) {
      const [parent, child] = name.split('.');
      setFormData(prev => ({
        ...prev,
        [parent]: {
          ...prev[parent as keyof EventFormData] as any,
          [child]: value
        }
      }));
    } else {
      setFormData(prev => ({
        ...prev,
        [name]: value
      }));
    }
    
    // Limpiar error si existe
    if (errors[name]) {
      setErrors(prev => ({ ...prev, [name]: '' }));
    }
  };

  const addToArray = (arrayName: 'includedServices' | 'requirements' | 'tags', value: string) => {
    if (!value.trim()) return;
    
    setFormData(prev => ({
      ...prev,
      [arrayName]: [...prev[arrayName], value.trim()]
    }));
    
    // Limpiar input
    if (arrayName === 'includedServices') setNewService('');
    if (arrayName === 'requirements') setNewRequirement('');
    if (arrayName === 'tags') setNewTag('');
  };

  const removeFromArray = (arrayName: 'includedServices' | 'requirements' | 'tags', index: number) => {
    setFormData(prev => ({
      ...prev,
      [arrayName]: prev[arrayName].filter((_, i) => i !== index)
    }));
  };

  const validateForm = (): boolean => {
    const newErrors: { [key: string]: string } = {};

    if (!formData.name.trim()) newErrors.name = 'El nombre es requerido';
    if (!formData.startDate) newErrors.startDate = 'La fecha de inicio es requerida';
    if (!formData.description.trim()) newErrors.description = 'La descripción es requerida';
    if (!formData.mainImage.trim()) newErrors.mainImage = 'La imagen principal es requerida';
    if (!formData.eventType) newErrors.eventType = 'El tipo de evento es requerido';
    if (!formData.departureLocation.address.trim()) newErrors['departureLocation.address'] = 'La dirección de salida es requerida';
    if (!formData.departureLocation.city.trim()) newErrors['departureLocation.city'] = 'La ciudad de salida es requerida';
    if (!formData.organizer.name.trim()) newErrors['organizer.name'] = 'El nombre del organizador es requerido';
    if (!formData.organizer.phone.trim()) newErrors['organizer.phone'] = 'El teléfono del organizador es requerido';
    if (!formData.organizer.email.trim()) newErrors['organizer.email'] = 'El email del organizador es requerido';

    // Validar fechas
    if (formData.startDate) {
      const startDate = new Date(formData.startDate);
      
      if (formData.endDate) {
        const endDate = new Date(formData.endDate);
        if (endDate <= startDate) {
          newErrors.endDate = 'La fecha de fin debe ser posterior a la de inicio';
        }
      }
      
      if (formData.registrationDeadline) {
        const regDeadline = new Date(formData.registrationDeadline);
        if (regDeadline >= startDate) {
          newErrors.registrationDeadline = 'La fecha límite debe ser anterior al evento';
        }
      }
    }

    // Validar email
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (formData.organizer.email && !emailRegex.test(formData.organizer.email)) {
      newErrors['organizer.email'] = 'Email inválido';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!validateForm()) return;

    try {
      setSaving(true);
      
      // Preparar datos para envío
      const eventData = {
        ...formData,
        maxParticipants: formData.maxParticipants === '' ? undefined : Number(formData.maxParticipants),
        price: formData.price === '' ? 0 : Number(formData.price),
        distance: formData.distance === '' ? undefined : Number(formData.distance),
        duration: formData.duration === '' ? undefined : Number(formData.duration),
        difficulty: formData.difficulty === '' ? undefined : formData.difficulty
      };

      const response = await fetch(`/api/admin/events/${eventId}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(eventData)
      });

      if (response.ok) {
        router.push(`/admin/events/view/${eventId}`);
      } else {
        const data = await response.json();
        throw new Error(data.error || 'Error al actualizar evento');
      }
    } catch (error) {
      console.error('Error actualizando evento:', error);
      alert('Error al actualizar el evento. Por favor intenta de nuevo.');
    } finally {
      setSaving(false);
    }
  };

  if (isLoading || loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <FaSpinner className="animate-spin text-4xl text-blue-600 mx-auto mb-4" />
          <p className="text-gray-600">Cargando evento...</p>
        </div>
      </div>
    );
  }

  return (
    <AdminLayout 
      title="Editar Evento" 
      description="Modificar información del evento"
    >
      <div className="max-w-4xl mx-auto">
        {/* Header */}
        <div className="mb-6">
          <button
            onClick={() => router.back()}
            className="inline-flex items-center text-sm text-gray-500 hover:text-gray-700 mb-4"
          >
            <FaArrowLeft className="mr-2" />
            Volver
          </button>
        </div>

        {/* Formulario */}
        <form onSubmit={handleSubmit} className="space-y-8">
          {/* Información Básica */}
          <div className="bg-white rounded-lg shadow p-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
              <FaInfoCircle className="mr-2 text-blue-500" />
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
                  className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent ${
                    errors.name ? 'border-red-500' : 'border-gray-300'
                  }`}
                  placeholder="Ej: Rodada a Valle de Bravo"
                />
                {errors.name && <p className="mt-1 text-sm text-red-600">{errors.name}</p>}
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Tipo de Evento *
                </label>
                <select
                  name="eventType"
                  value={formData.eventType}
                  onChange={handleInputChange}
                  className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent ${
                    errors.eventType ? 'border-red-500' : 'border-gray-300'
                  }`}
                >
                  <option value="">Seleccionar tipo</option>
                  {eventTypes.map(type => (
                    <option key={type.value} value={type.value}>{type.label}</option>
                  ))}
                </select>
                {errors.eventType && <p className="mt-1 text-sm text-red-600">{errors.eventType}</p>}
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Estado
                </label>
                <select
                  name="status"
                  value={formData.status}
                  onChange={handleInputChange}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                >
                  <option value="draft">Borrador</option>
                  <option value="published">Publicado</option>
                  <option value="cancelled">Cancelado</option>
                  <option value="completed">Completado</option>
                </select>
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
                  maxLength={1000}
                  className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent ${
                    errors.description ? 'border-red-500' : 'border-gray-300'
                  }`}
                  placeholder="Descripción breve del evento..."
                />
                <div className="flex justify-between mt-1">
                  {errors.description && <p className="text-sm text-red-600">{errors.description}</p>}
                  <p className="text-sm text-gray-500">{formData.description.length}/1000</p>
                </div>
              </div>

              <div className="md:col-span-2">
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Descripción Detallada
                </label>
                <textarea
                  name="longDescription"
                  value={formData.longDescription}
                  onChange={handleInputChange}
                  rows={6}
                  maxLength={5000}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  placeholder="Descripción detallada del evento, itinerario, qué incluye, etc..."
                />
                <p className="mt-1 text-sm text-gray-500">{formData.longDescription.length}/5000</p>
              </div>

              <div className="md:col-span-2">
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Imagen Principal (URL) *
                </label>
                <input
                  type="url"
                  name="mainImage"
                  value={formData.mainImage}
                  onChange={handleInputChange}
                  className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent ${
                    errors.mainImage ? 'border-red-500' : 'border-gray-300'
                  }`}
                  placeholder="https://ejemplo.com/imagen.jpg"
                />
                {errors.mainImage && <p className="mt-1 text-sm text-red-600">{errors.mainImage}</p>}
              </div>
            </div>
          </div>

          {/* Fechas y Horarios */}
          <div className="bg-white rounded-lg shadow p-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
              <FaCalendarAlt className="mr-2 text-blue-500" />
              Fechas y Horarios
            </h3>
            
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Fecha y Hora de Inicio *
                </label>
                <input
                  type="datetime-local"
                  name="startDate"
                  value={formData.startDate}
                  onChange={handleInputChange}
                  className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent ${
                    errors.startDate ? 'border-red-500' : 'border-gray-300'
                  }`}
                />
                {errors.startDate && <p className="mt-1 text-sm text-red-600">{errors.startDate}</p>}
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Fecha y Hora de Fin
                </label>
                <input
                  type="datetime-local"
                  name="endDate"
                  value={formData.endDate}
                  onChange={handleInputChange}
                  className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent ${
                    errors.endDate ? 'border-red-500' : 'border-gray-300'
                  }`}
                />
                {errors.endDate && <p className="mt-1 text-sm text-red-600">{errors.endDate}</p>}
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Fecha Límite de Registro
                </label>
                <input
                  type="datetime-local"
                  name="registrationDeadline"
                  value={formData.registrationDeadline}
                  onChange={handleInputChange}
                  className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent ${
                    errors.registrationDeadline ? 'border-red-500' : 'border-gray-300'
                  }`}
                />
                {errors.registrationDeadline && <p className="mt-1 text-sm text-red-600">{errors.registrationDeadline}</p>}
              </div>
            </div>
          </div>

          {/* Ubicación */}
          <div className="bg-white rounded-lg shadow p-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
              <FaMapMarkerAlt className="mr-2 text-blue-500" />
              Ubicación
            </h3>
            
            <div className="space-y-6">
              <div>
                <h4 className="font-medium text-gray-900 mb-3">Punto de Salida *</h4>
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
                      className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent ${
                        errors['departureLocation.address'] ? 'border-red-500' : 'border-gray-300'
                      }`}
                      placeholder="Dirección completa"
                    />
                    {errors['departureLocation.address'] && <p className="mt-1 text-sm text-red-600">{errors['departureLocation.address']}</p>}
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Ciudad *
                    </label>
                    <input
                      type="text"
                      name="departureLocation.city"
                      value={formData.departureLocation.city}
                      onChange={handleInputChange}
                      className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent ${
                        errors['departureLocation.city'] ? 'border-red-500' : 'border-gray-300'
                      }`}
                      placeholder="Ciudad"
                    />
                    {errors['departureLocation.city'] && <p className="mt-1 text-sm text-red-600">{errors['departureLocation.city']}</p>}
                  </div>
                </div>
              </div>

              <div>
                <h4 className="font-medium text-gray-900 mb-3">Destino (Opcional)</h4>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div className="md:col-span-2">
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Dirección de Destino
                    </label>
                    <input
                      type="text"
                      name="arrivalLocation.address"
                      value={formData.arrivalLocation.address}
                      onChange={handleInputChange}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      placeholder="Dirección de destino"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Ciudad de Destino
                    </label>
                    <input
                      type="text"
                      name="arrivalLocation.city"
                      value={formData.arrivalLocation.city}
                      onChange={handleInputChange}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      placeholder="Ciudad de destino"
                    />
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Detalles del Evento */}
          <div className="bg-white rounded-lg shadow p-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
              <FaUsers className="mr-2 text-blue-500" />
              Detalles del Evento
            </h3>
            
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Máximo de Participantes
                </label>
                <input
                  type="number"
                  name="maxParticipants"
                  value={formData.maxParticipants}
                  onChange={handleInputChange}
                  min="1"
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  placeholder="Sin límite"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Precio (MXN)
                </label>
                <input
                  type="number"
                  name="price"
                  value={formData.price}
                  onChange={handleInputChange}
                  min="0"
                  step="0.01"
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  placeholder="0"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Distancia (km)
                </label>
                <input
                  type="number"
                  name="distance"
                  value={formData.distance}
                  onChange={handleInputChange}
                  min="0"
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  placeholder="0"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Duración (horas)
                </label>
                <input
                  type="number"
                  name="duration"
                  value={formData.duration}
                  onChange={handleInputChange}
                  min="0"
                  step="0.5"
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  placeholder="0"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Nivel de Dificultad
                </label>
                <select
                  name="difficulty"
                  value={formData.difficulty}
                  onChange={handleInputChange}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                >
                  <option value="">No especificado</option>
                  {difficultyLevels.map(level => (
                    <option key={level.value} value={level.value}>{level.label}</option>
                  ))}
                </select>
              </div>
            </div>
          </div>

          {/* Organizador */}
          <div className="bg-white rounded-lg shadow p-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
              <FaUsers className="mr-2 text-blue-500" />
              Información del Organizador
            </h3>
            
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Nombre *
                </label>
                <input
                  type="text"
                  name="organizer.name"
                  value={formData.organizer.name}
                  onChange={handleInputChange}
                  className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent ${
                    errors['organizer.name'] ? 'border-red-500' : 'border-gray-300'
                  }`}
                  placeholder="Nombre del organizador"
                />
                {errors['organizer.name'] && <p className="mt-1 text-sm text-red-600">{errors['organizer.name']}</p>}
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Teléfono *
                </label>
                <input
                  type="tel"
                  name="organizer.phone"
                  value={formData.organizer.phone}
                  onChange={handleInputChange}
                  className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent ${
                    errors['organizer.phone'] ? 'border-red-500' : 'border-gray-300'
                  }`}
                  placeholder="555-123-4567"
                />
                {errors['organizer.phone'] && <p className="mt-1 text-sm text-red-600">{errors['organizer.phone']}</p>}
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Email *
                </label>
                <input
                  type="email"
                  name="organizer.email"
                  value={formData.organizer.email}
                  onChange={handleInputChange}
                  className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent ${
                    errors['organizer.email'] ? 'border-red-500' : 'border-gray-300'
                  }`}
                  placeholder="organizador@ejemplo.com"
                />
                {errors['organizer.email'] && <p className="mt-1 text-sm text-red-600">{errors['organizer.email']}</p>}
              </div>
            </div>
          </div>

          {/* Servicios Incluidos */}
          <div className="bg-white rounded-lg shadow p-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">
              Servicios Incluidos
            </h3>
            
            <div className="space-y-4">
              <div className="flex gap-2">
                <input
                  type="text"
                  value={newService}
                  onChange={(e) => setNewService(e.target.value)}
                  onKeyPress={(e) => e.key === 'Enter' && (e.preventDefault(), addToArray('includedServices', newService))}
                  className="flex-1 px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  placeholder="Agregar servicio incluido..."
                />
                <button
                  type="button"
                  onClick={() => addToArray('includedServices', newService)}
                  className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
                >
                  Agregar
                </button>
              </div>
              
              <div className="flex flex-wrap gap-2">
                {formData.includedServices.map((service, index) => (
                  <span
                    key={index}
                    className="inline-flex items-center px-3 py-1 bg-blue-100 text-blue-800 rounded-full text-sm"
                  >
                    {service}
                    <button
                      type="button"
                      onClick={() => removeFromArray('includedServices', index)}
                      className="ml-2 text-blue-600 hover:text-blue-800"
                    >
                      ×
                    </button>
                  </span>
                ))}
              </div>
            </div>
          </div>

          {/* Requerimientos */}
          <div className="bg-white rounded-lg shadow p-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">
              Requerimientos
            </h3>
            
            <div className="space-y-4">
              <div className="flex gap-2">
                <input
                  type="text"
                  value={newRequirement}
                  onChange={(e) => setNewRequirement(e.target.value)}
                  onKeyPress={(e) => e.key === 'Enter' && (e.preventDefault(), addToArray('requirements', newRequirement))}
                  className="flex-1 px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  placeholder="Agregar requerimiento..."
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
                {formData.requirements.map((requirement, index) => (
                  <span
                    key={index}
                    className="inline-flex items-center px-3 py-1 bg-red-100 text-red-800 rounded-full text-sm"
                  >
                    {requirement}
                    <button
                      type="button"
                      onClick={() => removeFromArray('requirements', index)}
                      className="ml-2 text-red-600 hover:text-red-800"
                    >
                      ×
                    </button>
                  </span>
                ))}
              </div>
            </div>
          </div>

          {/* Tags */}
          <div className="bg-white rounded-lg shadow p-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
              <FaTags className="mr-2 text-blue-500" />
              Etiquetas
            </h3>
            
            <div className="space-y-4">
              <div className="flex gap-2">
                <input
                  type="text"
                  value={newTag}
                  onChange={(e) => setNewTag(e.target.value)}
                  onKeyPress={(e) => e.key === 'Enter' && (e.preventDefault(), addToArray('tags', newTag))}
                  className="flex-1 px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  placeholder="Agregar etiqueta..."
                />
                <button
                  type="button"
                  onClick={() => addToArray('tags', newTag)}
                  className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
                >
                  Agregar
                </button>
              </div>
              
              <div className="flex flex-wrap gap-2">
                {formData.tags.map((tag, index) => (
                  <span
                    key={index}
                    className="inline-flex items-center px-3 py-1 bg-gray-100 text-gray-800 rounded-full text-sm"
                  >
                    #{tag}
                    <button
                      type="button"
                      onClick={() => removeFromArray('tags', index)}
                      className="ml-2 text-gray-600 hover:text-gray-800"
                    >
                      ×
                    </button>
                  </span>
                ))}
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
                    publicIdPrefix={`event_${formData.name.toLowerCase().replace(/\s+/g, '_') || 'edit'}`}
                    className="w-full"
                  />
                  <p className="text-sm text-gray-600 mt-2 text-center">
                    Sube la imagen principal del evento. Esta será la imagen destacada en las listas.
                  </p>
                </div>
                {errors.mainImage && <p className="mt-1 text-sm text-red-600">{errors.mainImage}</p>}
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
              className="inline-flex items-center px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors disabled:opacity-50"
            >
              {saving ? (
                <>
                  <FaSpinner className="animate-spin mr-2" />
                  Actualizando...
                </>
              ) : (
                <>
                  <FaSave className="mr-2" />
                  Actualizar Evento
                </>
              )}
            </button>
          </div>
        </form>
      </div>
    </AdminLayout>
  );
}
