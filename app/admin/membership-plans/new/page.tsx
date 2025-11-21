'use client';

import { useState, useEffect, type FormEvent } from 'react';

import { useRouter } from 'next/navigation';
import { 
  FaSave, 
  FaArrowLeft, 
  FaPlus, 
  FaTrash, 
  FaSpinner,
  FaEye,
  FaInfoCircle,
  FaStar
} from 'react-icons/fa';

interface MembershipBenefit {
  id: string;
  title: string;
  description: string;
  icon: string;
  category: 'events' | 'support' | 'commercial' | 'digital' | 'emergency' | 'education' | 'social';
  isActive: boolean;
  priority: number;
}

interface FormData {
  name: string;
  slug: string;
  description: string;
  shortDescription: string;
  pricing: {
    initial: number;
    withDiscount?: number;
    early_bird?: number;
    student?: number;
    family?: number;
    corporate?: number;
  };
  period: {
    startDate: string;
    endDate: string;
    isActive: boolean;
    renewalStartDate?: string;
    renewalDeadline?: string;
  };
  requiresRenewal: boolean;
  renewalType: 'monthly' | 'quarterly' | 'biannual' | 'annual' | 'lifetime';
  isLifetime: boolean;
  status: 'active' | 'inactive' | 'draft' | 'archived';
  benefits: MembershipBenefit[];
  information: {
    targetAudience?: string;
    requirements: string[];
    commitment: string[];
    support: {
      email?: string;
      whatsapp?: string;
      phone?: string;
      emergencyLine?: string;
    };
  };
  level: {
    tier: number;
    name: string;
    upgradeRequirements: string[];
  };
  enrollmentProcess: {
    steps: string[];
    requiredDocuments: string[];
    minimumAge?: number;
    requiresVehicle: boolean;
    autoApproval: boolean;
  };
  autoRenewal: {
    enabled: boolean;
    notificationDays: number[];
    gracePeriodDays: number;
  };
  capacity: {
    maxMembers?: number;
    currentMembers: number;
    waitingList: boolean;
  };
  testimonials: Array<{
    author: string;
    comment: string;
    rating?: number;
    date?: string;
  }>;
  seo: {
    metaTitle?: string;
    metaDescription?: string;
    keywords: string[];
  };
  display: {
    color: string;
    icon?: string;
    featured: boolean;
    order: number;
    showInPublic: boolean;
  };
}

export default function NewMembershipPlanPage() {
  const { user, isLoading } = useAuth();
  const router = useRouter();
  const [formData, setFormData] = useState<FormData>({
    name: '',
    slug: '',
    description: '',
    shortDescription: '',
    pricing: {
      initial: 0,
    },
    period: {
      startDate: new Date().toISOString().split('T')[0],
      endDate: new Date(new Date().getFullYear(), 11, 31).toISOString().split('T')[0], // 31 de diciembre
      isActive: true,
    },
    requiresRenewal: true,
    renewalType: 'annual',
    isLifetime: false,
    status: 'draft',
    benefits: [],
    information: {
      requirements: [],
      commitment: [],
      support: {},
    },
    level: {
      tier: 1,
      name: '',
      upgradeRequirements: [],
    },
    enrollmentProcess: {
      steps: [],
      requiredDocuments: [],
      requiresVehicle: false,
      autoApproval: false,
    },
    autoRenewal: {
      enabled: true,
      notificationDays: [30, 15, 7, 1],
      gracePeriodDays: 7,
    },
    capacity: {
      currentMembers: 0,
      waitingList: false,
    },
    testimonials: [],
    seo: {
      keywords: [],
    },
    display: {
      color: '#3B82F6',
      featured: false,
      order: 0,
      showInPublic: true,
    },
  });

  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState('basic');

  // Generar slug automáticamente del nombre
  useEffect(() => {
    if (formData.name && !formData.slug) {
      const slug = formData.name
        .toLowerCase()
        .replace(/[^a-z0-9\s-]/g, '')
        .replace(/\s+/g, '-')
        .replace(/-+/g, '-')
        .trim();
      
      setFormData(prev => ({ ...prev, slug }));
    }
  }, [formData.name]);

  // Verificar permisos
  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <FaSpinner className="animate-spin text-4xl text-blue-600" />
      </div>
    );
  }

  if (!user || user.role !== 'admin') {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <h1 className="text-2xl font-bold text-gray-900 mb-4">Acceso Denegado</h1>
          <p className="text-gray-600">No tienes permisos para acceder a esta página.</p>
        </div>
      </div>
    );
  }

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    setError(null);

    try {
      const apiClient = (await import('@/lib/api-client')).default;
      await apiClient.post('/admin/membership-plans', formData as unknown as Record<string, unknown>);
      
      router.push('/admin/membership-plans');
    } catch (error) {
      console.error('Error creating plan:', error);
      setError((error as Error).message || 'Error al conectar con el servidor');
    } finally {
      setIsSubmitting(false);
    }
  };

  const addBenefit = () => {
    const newBenefit: MembershipBenefit = {
      id: Date.now().toString(),
      title: '',
      description: '',
      icon: 'FaStar',
      category: 'events',
      isActive: true,
      priority: formData.benefits.length,
    };
    
    setFormData(prev => ({
      ...prev,
      benefits: [...prev.benefits, newBenefit],
    }));
  };

  const removeBenefit = (id: string) => {
    setFormData(prev => ({
      ...prev,
      benefits: prev.benefits.filter(b => b.id !== id),
    }));
  };

  const updateBenefit = (id: string, field: keyof MembershipBenefit, value: string | boolean | number) => {
    setFormData(prev => ({
      ...prev,
      benefits: prev.benefits.map(benefit =>
        benefit.id === id ? { ...benefit, [field]: value } : benefit
      ),
    }));
  };

  const addArrayItem = (field: string, subfield?: string) => {
    setFormData(prev => {
      const newData = { ...prev };
      const path = subfield ? field.split('.') : [field];
      
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      let current: any = newData;
      for (let i = 0; i < path.length - 1; i++) {
        current = current[path[i]];
      }
      
      const finalField = path[path.length - 1];
      if (subfield) {
        current[finalField][subfield] = [...(current[finalField][subfield] || []), ''];
      } else {
        current[finalField] = [...(current[finalField] || []), ''];
      }
      
      return newData;
    });
  };

  const removeArrayItem = (field: string, index: number, subfield?: string) => {
    setFormData(prev => {
      const newData = { ...prev };
      const path = subfield ? field.split('.') : [field];
      
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      let current: any = newData;
      for (let i = 0; i < path.length - 1; i++) {
        current = current[path[i]];
      }
      
      const finalField = path[path.length - 1];
      if (subfield) {
        current[finalField][subfield] = current[finalField][subfield].filter((_: unknown, i: number) => i !== index);
      } else {
        current[finalField] = current[finalField].filter((_: unknown, i: number) => i !== index);
      }
      
      return newData;
    });
  };

  const updateArrayItem = (field: string, index: number, value: string, subfield?: string) => {
    setFormData(prev => {
      const newData = { ...prev };
      const path = subfield ? field.split('.') : [field];
      
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      let current: any = newData;
      for (let i = 0; i < path.length - 1; i++) {
        current = current[path[i]];
      }
      
      const finalField = path[path.length - 1];
      if (subfield) {
        current[finalField][subfield][index] = value;
      } else {
        current[finalField][index] = value;
      }
      
      return newData;
    });
  };

  const tabs = [
    { id: 'basic', label: 'Información Básica', icon: FaInfoCircle },
    { id: 'pricing', label: 'Precios y Vigencia', icon: FaStar },
    { id: 'benefits', label: 'Beneficios', icon: FaStar },
    { id: 'process', label: 'Proceso y Configuración', icon: FaInfoCircle },
    { id: 'display', label: 'Visualización y SEO', icon: FaEye },
  ];

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header */}
        <div className="mb-8">
          <div className="flex items-center">
            <button
              onClick={() => router.back()}
              className="mr-4 p-2 text-gray-400 hover:text-gray-600"
              aria-label="Volver atrás"
            >
              <FaArrowLeft />
            </button>
            <div>
              <h1 className="text-3xl font-bold text-gray-900">Nuevo Plan de Membresía</h1>
              <p className="mt-2 text-gray-600">
                Crea un nuevo plan de membresía con todos sus beneficios y configuraciones
              </p>
            </div>
          </div>
        </div>

        {/* Error Alert */}
        {error && (
          <div className="mb-6 bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded">
            {error}
            <button onClick={() => setError(null)} className="float-right">×</button>
          </div>
        )}

        <form onSubmit={handleSubmit}>
          <div className="flex flex-col lg:flex-row gap-8">
            {/* Sidebar con tabs */}
            <div className="lg:w-64">
              <nav className="space-y-1">
                {tabs.map((tab) => (
                  <button
                    key={tab.id}
                    type="button"
                    onClick={() => setActiveTab(tab.id)}
                    className={`w-full flex items-center px-3 py-2 text-sm font-medium rounded-md ${
                      activeTab === tab.id
                        ? 'bg-blue-100 text-blue-700'
                        : 'text-gray-600 hover:text-gray-900 hover:bg-gray-50'
                    }`}
                  >
                    <tab.icon className="mr-3 h-4 w-4" />
                    {tab.label}
                  </button>
                ))}
              </nav>
            </div>

            {/* Contenido principal */}
            <div className="flex-1">
              <div className="bg-white rounded-lg shadow p-6">
                {/* Tab: Información Básica */}
                {activeTab === 'basic' && (
                  <div className="space-y-6">
                    <h2 className="text-lg font-medium text-gray-900">Información Básica</h2>
                    
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                          Nombre del Plan *
                        </label>
                        <input
                          type="text"
                          required
                          value={formData.name}
                          onChange={(e) => setFormData(prev => ({ ...prev, name: e.target.value }))}
                          className="w-full border border-gray-300 rounded-md px-3 py-2 focus:ring-blue-500 focus:border-blue-500"
                          placeholder="Ej: Membresía BSKMT Rider"
                        />
                      </div>

                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                          Slug (URL) *
                        </label>
                        <input
                          type="text"
                          required
                          value={formData.slug}
                          onChange={(e) => setFormData(prev => ({ ...prev, slug: e.target.value }))}
                          className="w-full border border-gray-300 rounded-md px-3 py-2 focus:ring-blue-500 focus:border-blue-500"
                          placeholder="ej: bskmt-rider"
                        />
                        <p className="text-xs text-gray-500 mt-1">
                          Solo letras minúsculas, números y guiones
                        </p>
                      </div>

                      <div>
                        <label htmlFor="level-tier" className="block text-sm font-medium text-gray-700 mb-2">
                          Nivel (Tier) *
                        </label>
                        <input
                          id="level-tier"
                          type="number"
                          required
                          min="1"
                          max="10"
                          value={formData.level.tier}
                          onChange={(e) => setFormData(prev => ({ 
                            ...prev, 
                            level: { ...prev.level, tier: parseInt(e.target.value) }
                          }))}
                          className="w-full border border-gray-300 rounded-md px-3 py-2 focus:ring-blue-500 focus:border-blue-500"
                        />
                      </div>

                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                          Nombre del Nivel *
                        </label>
                        <input
                          type="text"
                          required
                          value={formData.level.name}
                          onChange={(e) => setFormData(prev => ({ 
                            ...prev, 
                            level: { ...prev.level, name: e.target.value }
                          }))}
                          className="w-full border border-gray-300 rounded-md px-3 py-2 focus:ring-blue-500 focus:border-blue-500"
                          placeholder="Ej: Friend, Rider, Pro, Elite, VIP"
                        />
                      </div>

                      <div>
                        <label htmlFor="status" className="block text-sm font-medium text-gray-700 mb-2">
                          Estado *
                        </label>
                        <select
                          id="status"
                          value={formData.status}
                          onChange={(e) => setFormData(prev => ({ 
                            ...prev, 
                            status: e.target.value as 'draft' | 'active' | 'inactive'
                          }))}
                          className="w-full border border-gray-300 rounded-md px-3 py-2 focus:ring-blue-500 focus:border-blue-500"
                        >
                          <option value="draft">Borrador</option>
                          <option value="active">Activo</option>
                          <option value="inactive">Inactivo</option>
                        </select>
                      </div>
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Descripción Completa *
                      </label>
                      <textarea
                        required
                        rows={4}
                        value={formData.description}
                        onChange={(e) => setFormData(prev => ({ ...prev, description: e.target.value }))}
                        className="w-full border border-gray-300 rounded-md px-3 py-2 focus:ring-blue-500 focus:border-blue-500"
                        placeholder="Descripción detallada del plan de membresía..."
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Descripción Corta
                      </label>
                      <input
                        type="text"
                        value={formData.shortDescription}
                        onChange={(e) => setFormData(prev => ({ ...prev, shortDescription: e.target.value }))}
                        className="w-full border border-gray-300 rounded-md px-3 py-2 focus:ring-blue-500 focus:border-blue-500"
                        placeholder="Descripción breve para tarjetas..."
                        maxLength={200}
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Audiencia Objetivo
                      </label>
                      <textarea
                        rows={2}
                        value={formData.information.targetAudience || ''}
                        onChange={(e) => setFormData(prev => ({ 
                          ...prev, 
                          information: { ...prev.information, targetAudience: e.target.value }
                        }))}
                        className="w-full border border-gray-300 rounded-md px-3 py-2 focus:ring-blue-500 focus:border-blue-500"
                        placeholder="A quién está dirigida esta membresía..."
                      />
                    </div>
                  </div>
                )}

                {/* Tab: Precios y Vigencia */}
                {activeTab === 'pricing' && (
                  <div className="space-y-6">
                    <h2 className="text-lg font-medium text-gray-900">Precios y Vigencia</h2>
                    
                    {/* Precios */}
                    <div>
                      <h3 className="text-md font-medium text-gray-800 mb-4">Estructura de Precios</h3>
                      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                        <div>
                          <label htmlFor="pricingInitial" className="block text-sm font-medium text-gray-700 mb-2">
                            Precio Inicial (COP) *
                          </label>
                          <input
                            id="pricingInitial"
                            type="number"
                            required
                            min="0"
                            value={formData.pricing.initial}
                            onChange={(e) => setFormData(prev => ({ 
                              ...prev, 
                              pricing: { ...prev.pricing, initial: parseInt(e.target.value) }
                            }))}
                            className="w-full border border-gray-300 rounded-md px-3 py-2 focus:ring-blue-500 focus:border-blue-500"
                          />
                        </div>

                        <div>
                          <label htmlFor="pricingWithDiscount" className="block text-sm font-medium text-gray-700 mb-2">
                            Precio con Descuento (COP)
                          </label>
                          <input
                            id="pricingWithDiscount"
                            type="number"
                            min="0"
                            value={formData.pricing.withDiscount || ''}
                            onChange={(e) => setFormData(prev => ({ 
                              ...prev, 
                              pricing: { ...prev.pricing, withDiscount: e.target.value ? parseInt(e.target.value) : undefined }
                            }))}
                            className="w-full border border-gray-300 rounded-md px-3 py-2 focus:ring-blue-500 focus:border-blue-500"
                          />
                        </div>

                        <div>
                          <label htmlFor="pricingEarlyBird" className="block text-sm font-medium text-gray-700 mb-2">
                            Precio Early Bird (COP)
                          </label>
                          <input
                            id="pricingEarlyBird"
                            type="number"
                            min="0"
                            value={formData.pricing.early_bird || ''}
                            onChange={(e) => setFormData(prev => ({ 
                              ...prev, 
                              pricing: { ...prev.pricing, early_bird: e.target.value ? parseInt(e.target.value) : undefined }
                            }))}
                            className="w-full border border-gray-300 rounded-md px-3 py-2 focus:ring-blue-500 focus:border-blue-500"
                          />
                        </div>

                        <div>
                          <label htmlFor="pricingStudent" className="block text-sm font-medium text-gray-700 mb-2">
                            Precio Estudiante (COP)
                          </label>
                          <input
                            id="pricingStudent"
                            type="number"
                            min="0"
                            value={formData.pricing.student || ''}
                            onChange={(e) => setFormData(prev => ({ 
                              ...prev, 
                              pricing: { ...prev.pricing, student: e.target.value ? parseInt(e.target.value) : undefined }
                            }))}
                            className="w-full border border-gray-300 rounded-md px-3 py-2 focus:ring-blue-500 focus:border-blue-500"
                          />
                        </div>

                        <div>
                          <label htmlFor="pricingFamily" className="block text-sm font-medium text-gray-700 mb-2">
                            Precio Familiar (COP)
                          </label>
                          <input
                            id="pricingFamily"
                            type="number"
                            min="0"
                            value={formData.pricing.family || ''}
                            onChange={(e) => setFormData(prev => ({ 
                              ...prev, 
                              pricing: { ...prev.pricing, family: e.target.value ? parseInt(e.target.value) : undefined }
                            }))}
                            className="w-full border border-gray-300 rounded-md px-3 py-2 focus:ring-blue-500 focus:border-blue-500"
                          />
                        </div>

                        <div>
                          <label htmlFor="pricingCorporate" className="block text-sm font-medium text-gray-700 mb-2">
                            Precio Corporativo (COP)
                          </label>
                          <input
                            id="pricingCorporate"
                            type="number"
                            min="0"
                            value={formData.pricing.corporate || ''}
                            onChange={(e) => setFormData(prev => ({ 
                              ...prev, 
                              pricing: { ...prev.pricing, corporate: e.target.value ? parseInt(e.target.value) : undefined }
                            }))}
                            className="w-full border border-gray-300 rounded-md px-3 py-2 focus:ring-blue-500 focus:border-blue-500"
                          />
                        </div>
                      </div>
                    </div>

                    {/* Periodo de Vigencia */}
                    <div>
                      <h3 className="text-md font-medium text-gray-800 mb-4">Periodo de Vigencia</h3>
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div>
                          <label htmlFor="periodStartDate" className="block text-sm font-medium text-gray-700 mb-2">
                            Fecha de Inicio *
                          </label>
                          <input
                            id="periodStartDate"
                            type="date"
                            required
                            value={formData.period.startDate}
                            onChange={(e) => setFormData(prev => ({ 
                              ...prev, 
                              period: { ...prev.period, startDate: e.target.value }
                            }))}
                            className="w-full border border-gray-300 rounded-md px-3 py-2 focus:ring-blue-500 focus:border-blue-500"
                          />
                        </div>

                        <div>
                          <label htmlFor="periodEndDate" className="block text-sm font-medium text-gray-700 mb-2">
                            Fecha de Finalización *
                          </label>
                          <input
                            id="periodEndDate"
                            type="date"
                            required
                            value={formData.period.endDate}
                            onChange={(e) => setFormData(prev => ({ 
                              ...prev, 
                              period: { ...prev.period, endDate: e.target.value }
                            }))}
                            className="w-full border border-gray-300 rounded-md px-3 py-2 focus:ring-blue-500 focus:border-blue-500"
                          />
                        </div>

                        <div>
                          <label htmlFor="periodRenewalStartDate" className="block text-sm font-medium text-gray-700 mb-2">
                            Inicio de Renovación
                          </label>
                          <input
                            id="periodRenewalStartDate"
                            type="date"
                            value={formData.period.renewalStartDate || ''}
                            onChange={(e) => setFormData(prev => ({ 
                              ...prev, 
                              period: { ...prev.period, renewalStartDate: e.target.value }
                            }))}
                            className="w-full border border-gray-300 rounded-md px-3 py-2 focus:ring-blue-500 focus:border-blue-500"
                          />
                        </div>

                        <div>
                          <label htmlFor="periodRenewalDeadline" className="block text-sm font-medium text-gray-700 mb-2">
                            Fecha Límite de Renovación
                          </label>
                          <input
                            id="periodRenewalDeadline"
                            type="date"
                            value={formData.period.renewalDeadline || ''}
                            onChange={(e) => setFormData(prev => ({ 
                              ...prev, 
                              period: { ...prev.period, renewalDeadline: e.target.value }
                            }))}
                            className="w-full border border-gray-300 rounded-md px-3 py-2 focus:ring-blue-500 focus:border-blue-500"
                          />
                        </div>
                      </div>
                    </div>

                    {/* Configuración de Renovación */}
                    <div>
                      <h3 className="text-md font-medium text-gray-800 mb-4">Configuración de Renovación</h3>
                      <div className="space-y-4">
                        <div className="flex items-center">
                          <input
                            type="checkbox"
                            id="requiresRenewal"
                            checked={formData.requiresRenewal}
                            onChange={(e) => setFormData(prev => ({ ...prev, requiresRenewal: e.target.checked }))}
                            className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                          />
                          <label htmlFor="requiresRenewal" className="ml-2 block text-sm text-gray-900">
                            Requiere Renovación
                          </label>
                        </div>

                        {formData.requiresRenewal && (
                          <>
                            <div className="flex items-center">
                              <input
                                type="checkbox"
                                id="isLifetime"
                                checked={formData.isLifetime}
                                onChange={(e) => setFormData(prev => ({ ...prev, isLifetime: e.target.checked }))}
                                className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                              />
                              <label htmlFor="isLifetime" className="ml-2 block text-sm text-gray-900">
                                Es Membresía Vitalicia (con renovación anual)
                              </label>
                            </div>

                            <div>
                              <label htmlFor="renewalType" className="block text-sm font-medium text-gray-700 mb-2">
                                Tipo de Renovación
                              </label>
                              <select
                                id="renewalType"
                                value={formData.renewalType}
                                onChange={(e) => setFormData(prev => ({ 
                                  ...prev, 
                                  renewalType: e.target.value as 'monthly' | 'quarterly' | 'biannual' | 'annual' | 'lifetime'
                                }))}
                                className="w-full border border-gray-300 rounded-md px-3 py-2 focus:ring-blue-500 focus:border-blue-500"
                              >
                                <option value="monthly">Mensual</option>
                                <option value="quarterly">Trimestral</option>
                                <option value="biannual">Semestral</option>
                                <option value="annual">Anual</option>
                                <option value="lifetime">Vitalicia</option>
                              </select>
                            </div>
                          </>
                        )}
                      </div>
                    </div>
                  </div>
                )}

                {/* Tab: Beneficios */}
                {activeTab === 'benefits' && (
                  <div className="space-y-6">
                    <div className="flex items-center justify-between">
                      <h2 className="text-lg font-medium text-gray-900">Beneficios</h2>
                      <button
                        type="button"
                        onClick={addBenefit}
                        className="inline-flex items-center px-3 py-2 border border-transparent text-sm leading-4 font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700"
                      >
                        <FaPlus className="mr-2" />
                        Agregar Beneficio
                      </button>
                    </div>
                    
                    {formData.benefits.length === 0 ? (
                      <div className="text-center py-8 border-2 border-dashed border-gray-300 rounded-lg">
                        <p className="text-gray-500">No hay beneficios agregados aún</p>
                        <button
                          type="button"
                          onClick={addBenefit}
                          className="mt-2 text-blue-600 hover:text-blue-700"
                        >
                          Agregar el primer beneficio
                        </button>
                      </div>
                    ) : (
                      <div className="space-y-4">
                        {formData.benefits.map((benefit, index) => (
                          <div key={benefit.id} className="border border-gray-200 rounded-lg p-4">
                            <div className="flex items-center justify-between mb-4">
                              <h4 className="font-medium">Beneficio #{index + 1}</h4>
                              <button
                                type="button"
                                onClick={() => removeBenefit(benefit.id)}
                                className="text-red-600 hover:text-red-700"
                                aria-label={`Eliminar beneficio ${index + 1}`}
                              >
                                <FaTrash />
                              </button>
                            </div>
                            
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                              <div>
                                <label className="block text-sm font-medium text-gray-700 mb-2">
                                  Título *
                                </label>
                                <input
                                  type="text"
                                  required
                                  value={benefit.title}
                                  onChange={(e) => updateBenefit(benefit.id, 'title', e.target.value)}
                                  className="w-full border border-gray-300 rounded-md px-3 py-2 focus:ring-blue-500 focus:border-blue-500"
                                  placeholder="Ej: Descuentos en Eventos"
                                />
                              </div>
                              
                              <div>
                                <label htmlFor={`benefit-category-${benefit.id}`} className="block text-sm font-medium text-gray-700 mb-2">
                                  Categoría *
                                </label>
                                <select
                                  id={`benefit-category-${benefit.id}`}
                                  value={benefit.category}
                                  onChange={(e) => updateBenefit(benefit.id, 'category', e.target.value)}
                                  className="w-full border border-gray-300 rounded-md px-3 py-2 focus:ring-blue-500 focus:border-blue-500"
                                >
                                  <option value="events">Eventos</option>
                                  <option value="support">Soporte</option>
                                  <option value="commercial">Comercial</option>
                                  <option value="digital">Digital</option>
                                  <option value="emergency">Emergencia</option>
                                  <option value="education">Educación</option>
                                  <option value="social">Social</option>
                                </select>
                              </div>
                              
                              <div className="md:col-span-2">
                                <label className="block text-sm font-medium text-gray-700 mb-2">
                                  Descripción *
                                </label>
                                <textarea
                                  required
                                  rows={2}
                                  value={benefit.description}
                                  onChange={(e) => updateBenefit(benefit.id, 'description', e.target.value)}
                                  className="w-full border border-gray-300 rounded-md px-3 py-2 focus:ring-blue-500 focus:border-blue-500"
                                  placeholder="Descripción detallada del beneficio..."
                                />
                              </div>
                              
                              <div>
                                <label className="block text-sm font-medium text-gray-700 mb-2">
                                  Ícono
                                </label>
                                <input
                                  type="text"
                                  value={benefit.icon}
                                  onChange={(e) => updateBenefit(benefit.id, 'icon', e.target.value)}
                                  className="w-full border border-gray-300 rounded-md px-3 py-2 focus:ring-blue-500 focus:border-blue-500"
                                  placeholder="FaCalendarAlt, FaWrench, etc."
                                />
                              </div>
                              
                              <div>
                                <label htmlFor={`benefit-priority-${benefit.id}`} className="block text-sm font-medium text-gray-700 mb-2">
                                  Prioridad
                                </label>
                                <input
                                  id={`benefit-priority-${benefit.id}`}
                                  type="number"
                                  min="0"
                                  max="100"
                                  value={benefit.priority}
                                  onChange={(e) => updateBenefit(benefit.id, 'priority', parseInt(e.target.value))}
                                  className="w-full border border-gray-300 rounded-md px-3 py-2 focus:ring-blue-500 focus:border-blue-500"
                                />
                              </div>
                              
                              <div className="flex items-center">
                                <input
                                  type="checkbox"
                                  id={`benefit-active-${benefit.id}`}
                                  checked={benefit.isActive}
                                  onChange={(e) => updateBenefit(benefit.id, 'isActive', e.target.checked)}
                                  className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                                />
                                <label htmlFor={`benefit-active-${benefit.id}`} className="ml-2 block text-sm text-gray-900">
                                  Beneficio Activo
                                </label>
                              </div>
                            </div>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                )}

                {/* Tab: Proceso y Configuración */}
                {activeTab === 'process' && (
                  <div className="space-y-6">
                    <h2 className="text-lg font-medium text-gray-900">Proceso y Configuración</h2>
                    
                    {/* Proceso de Inscripción */}
                    <div>
                      <h3 className="text-md font-medium text-gray-800 mb-4">Proceso de Inscripción</h3>
                      
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
                        <div>
                          <label htmlFor="enrollment-minimum-age" className="block text-sm font-medium text-gray-700 mb-2">
                            Edad Mínima
                          </label>
                          <input
                            id="enrollment-minimum-age"
                            type="number"
                            min="0"
                            max="100"
                            value={formData.enrollmentProcess.minimumAge || ''}
                            onChange={(e) => setFormData(prev => ({ 
                              ...prev, 
                              enrollmentProcess: { 
                                ...prev.enrollmentProcess, 
                                minimumAge: e.target.value ? parseInt(e.target.value) : undefined 
                              }
                            }))}
                            className="w-full border border-gray-300 rounded-md px-3 py-2 focus:ring-blue-500 focus:border-blue-500"
                          />
                        </div>
                        
                        <div className="flex items-center space-x-6">
                          <div className="flex items-center">
                            <input
                              type="checkbox"
                              id="requiresVehicle"
                              checked={formData.enrollmentProcess.requiresVehicle}
                              onChange={(e) => setFormData(prev => ({ 
                                ...prev, 
                                enrollmentProcess: { ...prev.enrollmentProcess, requiresVehicle: e.target.checked }
                              }))}
                              className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                            />
                            <label htmlFor="requiresVehicle" className="ml-2 block text-sm text-gray-900">
                              Requiere Vehículo
                            </label>
                          </div>
                          
                          <div className="flex items-center">
                            <input
                              type="checkbox"
                              id="autoApproval"
                              checked={formData.enrollmentProcess.autoApproval}
                              onChange={(e) => setFormData(prev => ({ 
                                ...prev, 
                                enrollmentProcess: { ...prev.enrollmentProcess, autoApproval: e.target.checked }
                              }))}
                              className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                            />
                            <label htmlFor="autoApproval" className="ml-2 block text-sm text-gray-900">
                              Aprobación Automática
                            </label>
                          </div>
                        </div>
                      </div>
                      
                      {/* Pasos del proceso */}
                      <div className="mb-4">
                        <div className="flex items-center justify-between mb-2">
                          <label className="block text-sm font-medium text-gray-700">
                            Pasos del Proceso
                          </label>
                          <button
                            type="button"
                            onClick={() => addArrayItem('enrollmentProcess', 'steps')}
                            className="text-blue-600 hover:text-blue-700 text-sm"
                          >
                            + Agregar Paso
                          </button>
                        </div>
                        {formData.enrollmentProcess.steps.map((step, index) => (
                          <div key={index} className="flex items-center mb-2">
                            <input
                              type="text"
                              value={step}
                              onChange={(e) => updateArrayItem('enrollmentProcess', index, e.target.value, 'steps')}
                              className="flex-1 border border-gray-300 rounded-md px-3 py-2 focus:ring-blue-500 focus:border-blue-500"
                              placeholder={`Paso ${index + 1}`}
                            />
                            <button
                              type="button"
                              onClick={() => removeArrayItem('enrollmentProcess', index, 'steps')}
                              className="ml-2 text-red-600 hover:text-red-700"
                              aria-label={`Eliminar paso ${index + 1}`}
                            >
                              <FaTrash />
                            </button>
                          </div>
                        ))}
                      </div>
                      
                      {/* Documentos requeridos */}
                      <div>
                        <div className="flex items-center justify-between mb-2">
                          <label className="block text-sm font-medium text-gray-700">
                            Documentos Requeridos
                          </label>
                          <button
                            type="button"
                            onClick={() => addArrayItem('enrollmentProcess', 'requiredDocuments')}
                            className="text-blue-600 hover:text-blue-700 text-sm"
                          >
                            + Agregar Documento
                          </button>
                        </div>
                        {formData.enrollmentProcess.requiredDocuments.map((doc, index) => (
                          <div key={index} className="flex items-center mb-2">
                            <input
                              type="text"
                              value={doc}
                              onChange={(e) => updateArrayItem('enrollmentProcess', index, e.target.value, 'requiredDocuments')}
                              className="flex-1 border border-gray-300 rounded-md px-3 py-2 focus:ring-blue-500 focus:border-blue-500"
                              placeholder="Ej: Cédula de Ciudadanía"
                            />
                            <button
                              type="button"
                              onClick={() => removeArrayItem('enrollmentProcess', index, 'requiredDocuments')}
                              className="ml-2 text-red-600 hover:text-red-700"
                              aria-label={`Eliminar documento ${index + 1}`}
                            >
                              <FaTrash />
                            </button>
                          </div>
                        ))}
                      </div>
                    </div>
                    
                    {/* Configuración de Capacidad */}
                    <div>
                      <h3 className="text-md font-medium text-gray-800 mb-4">Configuración de Capacidad</h3>
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-2">
                            Máximo de Miembros
                          </label>
                          <input
                            type="number"
                            min="1"
                            value={formData.capacity.maxMembers || ''}
                            onChange={(e) => setFormData(prev => ({ 
                              ...prev, 
                              capacity: { 
                                ...prev.capacity, 
                                maxMembers: e.target.value ? parseInt(e.target.value) : undefined 
                              }
                            }))}
                            className="w-full border border-gray-300 rounded-md px-3 py-2 focus:ring-blue-500 focus:border-blue-500"
                            placeholder="Dejar vacío para ilimitado"
                          />
                        </div>
                        
                        <div className="flex items-center">
                          <input
                            type="checkbox"
                            id="waitingList"
                            checked={formData.capacity.waitingList}
                            onChange={(e) => setFormData(prev => ({ 
                              ...prev, 
                              capacity: { ...prev.capacity, waitingList: e.target.checked }
                            }))}
                            className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                          />
                          <label htmlFor="waitingList" className="ml-2 block text-sm text-gray-900">
                            Permitir Lista de Espera
                          </label>
                        </div>
                      </div>
                    </div>
                    
                    {/* Configuración de Renovación Automática */}
                    <div>
                      <h3 className="text-md font-medium text-gray-800 mb-4">Renovación Automática</h3>
                      <div className="space-y-4">
                        <div className="flex items-center">
                          <input
                            type="checkbox"
                            id="autoRenewalEnabled"
                            checked={formData.autoRenewal.enabled}
                            onChange={(e) => setFormData(prev => ({ 
                              ...prev, 
                              autoRenewal: { ...prev.autoRenewal, enabled: e.target.checked }
                            }))}
                            className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                          />
                          <label htmlFor="autoRenewalEnabled" className="ml-2 block text-sm text-gray-900">
                            Habilitar Renovación Automática
                          </label>
                        </div>
                        
                        <div>
                          <label htmlFor="auto-renewal-grace-period" className="block text-sm font-medium text-gray-700 mb-2">
                            Días de Gracia
                          </label>
                          <input
                            id="auto-renewal-grace-period"
                            type="number"
                            min="0"
                            max="90"
                            value={formData.autoRenewal.gracePeriodDays}
                            onChange={(e) => setFormData(prev => ({ 
                              ...prev, 
                              autoRenewal: { ...prev.autoRenewal, gracePeriodDays: parseInt(e.target.value) }
                            }))}
                            className="w-full md:w-32 border border-gray-300 rounded-md px-3 py-2 focus:ring-blue-500 focus:border-blue-500"
                          />
                          <p className="text-xs text-gray-500 mt-1">
                            Días después del vencimiento para permitir renovación
                          </p>
                        </div>
                        
                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-2">
                            Días de Notificación
                          </label>
                          <div className="flex flex-wrap gap-2">
                            {[30, 15, 7, 1].map(day => (
                              <label key={day} className="flex items-center">
                                <input
                                  type="checkbox"
                                  checked={formData.autoRenewal.notificationDays.includes(day)}
                                  onChange={(e) => {
                                    if (e.target.checked) {
                                      setFormData(prev => ({ 
                                        ...prev, 
                                        autoRenewal: { 
                                          ...prev.autoRenewal, 
                                          notificationDays: [...prev.autoRenewal.notificationDays, day].sort((a, b) => b - a)
                                        }
                                      }));
                                    } else {
                                      setFormData(prev => ({ 
                                        ...prev, 
                                        autoRenewal: { 
                                          ...prev.autoRenewal, 
                                          notificationDays: prev.autoRenewal.notificationDays.filter(d => d !== day)
                                        }
                                      }));
                                    }
                                  }}
                                  className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                                />
                                <span className="ml-1 text-sm text-gray-700">{day} días</span>
                              </label>
                            ))}
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                )}

                {/* Tab: Visualización y SEO */}
                {activeTab === 'display' && (
                  <div className="space-y-6">
                    <h2 className="text-lg font-medium text-gray-900">Visualización y SEO</h2>
                    
                    {/* Configuración de Visualización */}
                    <div>
                      <h3 className="text-md font-medium text-gray-800 mb-4">Configuración de Visualización</h3>
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div>
                          <label htmlFor="display-color-text" className="block text-sm font-medium text-gray-700 mb-2">
                            Color Principal
                          </label>
                          <div className="flex items-center space-x-2">
                            <input
                              id="display-color-picker"
                              type="color"
                              value={formData.display.color}
                              onChange={(e) => setFormData(prev => ({ 
                                ...prev, 
                                display: { ...prev.display, color: e.target.value }
                              }))}
                              className="h-10 w-20 border border-gray-300 rounded-md"
                              aria-label="Selector de color"
                            />
                            <input
                              id="display-color-text"
                              type="text"
                              value={formData.display.color}
                              onChange={(e) => setFormData(prev => ({ 
                                ...prev, 
                                display: { ...prev.display, color: e.target.value }
                              }))}
                              className="flex-1 border border-gray-300 rounded-md px-3 py-2 focus:ring-blue-500 focus:border-blue-500"
                              placeholder="#3B82F6"
                            />
                          </div>
                        </div>
                        
                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-2">
                            Ícono
                          </label>
                          <input
                            type="text"
                            value={formData.display.icon || ''}
                            onChange={(e) => setFormData(prev => ({ 
                              ...prev, 
                              display: { ...prev.display, icon: e.target.value }
                            }))}
                            className="w-full border border-gray-300 rounded-md px-3 py-2 focus:ring-blue-500 focus:border-blue-500"
                            placeholder="FaCrown, FaGem, etc."
                          />
                        </div>
                        
                        <div>
                          <label htmlFor="display-order" className="block text-sm font-medium text-gray-700 mb-2">
                            Orden de Visualización
                          </label>
                          <input
                            id="display-order"
                            type="number"
                            min="0"
                            value={formData.display.order}
                            onChange={(e) => setFormData(prev => ({ 
                              ...prev, 
                              display: { ...prev.display, order: parseInt(e.target.value) }
                            }))}
                            className="w-full border border-gray-300 rounded-md px-3 py-2 focus:ring-blue-500 focus:border-blue-500"
                          />
                        </div>
                        
                        <div className="space-y-2">
                          <div className="flex items-center">
                            <input
                              type="checkbox"
                              id="featured"
                              checked={formData.display.featured}
                              onChange={(e) => setFormData(prev => ({ 
                                ...prev, 
                                display: { ...prev.display, featured: e.target.checked }
                              }))}
                              className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                            />
                            <label htmlFor="featured" className="ml-2 block text-sm text-gray-900">
                              Plan Destacado
                            </label>
                          </div>
                          
                          <div className="flex items-center">
                            <input
                              type="checkbox"
                              id="showInPublic"
                              checked={formData.display.showInPublic}
                              onChange={(e) => setFormData(prev => ({ 
                                ...prev, 
                                display: { ...prev.display, showInPublic: e.target.checked }
                              }))}
                              className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                            />
                            <label htmlFor="showInPublic" className="ml-2 block text-sm text-gray-900">
                              Mostrar en Páginas Públicas
                            </label>
                          </div>
                        </div>
                      </div>
                    </div>
                    
                    {/* Configuración SEO */}
                    <div>
                      <h3 className="text-md font-medium text-gray-800 mb-4">Configuración SEO</h3>
                      <div className="space-y-4">
                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-2">
                            Meta Título
                          </label>
                          <input
                            type="text"
                            maxLength={60}
                            value={formData.seo.metaTitle || ''}
                            onChange={(e) => setFormData(prev => ({ 
                              ...prev, 
                              seo: { ...prev.seo, metaTitle: e.target.value }
                            }))}
                            className="w-full border border-gray-300 rounded-md px-3 py-2 focus:ring-blue-500 focus:border-blue-500"
                            placeholder="Título para motores de búsqueda"
                          />
                          <p className="text-xs text-gray-500 mt-1">
                            {formData.seo.metaTitle?.length || 0}/60 caracteres
                          </p>
                        </div>
                        
                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-2">
                            Meta Descripción
                          </label>
                          <textarea
                            rows={3}
                            maxLength={160}
                            value={formData.seo.metaDescription || ''}
                            onChange={(e) => setFormData(prev => ({ 
                              ...prev, 
                              seo: { ...prev.seo, metaDescription: e.target.value }
                            }))}
                            className="w-full border border-gray-300 rounded-md px-3 py-2 focus:ring-blue-500 focus:border-blue-500"
                            placeholder="Descripción para motores de búsqueda"
                          />
                          <p className="text-xs text-gray-500 mt-1">
                            {formData.seo.metaDescription?.length || 0}/160 caracteres
                          </p>
                        </div>
                        
                        <div>
                          <div className="flex items-center justify-between mb-2">
                            <label className="block text-sm font-medium text-gray-700">
                              Palabras Clave
                            </label>
                            <button
                              type="button"
                              onClick={() => addArrayItem('seo', 'keywords')}
                              className="text-blue-600 hover:text-blue-700 text-sm"
                            >
                              + Agregar Palabra Clave
                            </button>
                          </div>
                          {formData.seo.keywords.map((keyword, index) => (
                            <div key={index} className="flex items-center mb-2">
                              <input
                                type="text"
                                value={keyword}
                                onChange={(e) => updateArrayItem('seo', index, e.target.value, 'keywords')}
                                className="flex-1 border border-gray-300 rounded-md px-3 py-2 focus:ring-blue-500 focus:border-blue-500"
                                placeholder="Palabra clave"
                              />
                              <button
                                type="button"
                                onClick={() => removeArrayItem('seo', index, 'keywords')}
                                className="ml-2 text-red-600 hover:text-red-700"
                                aria-label={`Eliminar palabra clave ${index + 1}`}
                              >
                                <FaTrash />
                              </button>
                            </div>
                          ))}
                        </div>
                      </div>
                    </div>
                  </div>
                )}

                {/* Botones de acción */}
                <div className="mt-8 flex justify-between">
                  <button
                    type="button"
                    onClick={() => router.back()}
                    className="px-4 py-2 border border-gray-300 rounded-md text-sm font-medium text-gray-700 bg-white hover:bg-gray-50"
                  >
                    Cancelar
                  </button>
                  
                  <button
                    type="submit"
                    disabled={isSubmitting}
                    className="inline-flex items-center px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-50"
                  >
                    {isSubmitting ? (
                      <>
                        <FaSpinner className="animate-spin mr-2" />
                        Guardando...
                      </>
                    ) : (
                      <>
                        <FaSave className="mr-2" />
                        Crear Plan
                      </>
                    )}
                  </button>
                </div>
              </div>
            </div>
          </div>
        </form>
      </div>
    </div>
  );
}
