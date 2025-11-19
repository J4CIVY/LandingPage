'use client';

import { useState, useEffect } from 'react';
import { useAuth } from '@/hooks/useAuth';
import { 
  FaPlus, 
  FaEdit, 
  FaTrash, 
  FaEye, 
  FaSearch, 
  FaFilter,
  FaStar,
  FaSpinner
} from 'react-icons/fa';

interface MembershipPlan {
  _id: string;
  name: string;
  slug: string;
  description: string;
  shortDescription?: string;
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
  };
  status: 'active' | 'inactive' | 'draft' | 'archived';
  requiresRenewal: boolean;
  renewalType: 'monthly' | 'quarterly' | 'biannual' | 'annual' | 'lifetime';
  isLifetime: boolean;
  level: {
    tier: number;
    name: string;
  };
  benefits: Array<{
    id: string;
    title: string;
    description: string;
    category: string;
    isActive: boolean;
  }>;
  capacity?: {
    maxMembers?: number;
    currentMembers: number;
  };
  display: {
    color: string;
    featured: boolean;
    order: number;
    showInPublic: boolean;
  };
  createdAt: string;
  updatedAt: string;
  createdBy?: {
    name: string;
    email: string;
  };
}

export default function AdminMembershipPlansPage() {
  const { user, isLoading } = useAuth();
  const [plans, setPlans] = useState<MembershipPlan[]>([]);
  const [filteredPlans, setFilteredPlans] = useState<MembershipPlan[]>([]);
  const [isLoadingPlans, setIsLoadingPlans] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [renewalFilter, setRenewalFilter] = useState<string>('all');
  const [featuredFilter, setFeaturedFilter] = useState<string>('all');
  const [showFilters, setShowFilters] = useState(false);

  // Estados para operaciones
  const [isDeleting, setIsDeleting] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);

  // Cargar planes de membresía
  useEffect(() => {
    void fetchMembershipPlans();
  }, []);

  // Aplicar filtros
  useEffect(() => {
    applyFilters();
  }, [plans, searchTerm, statusFilter, renewalFilter, featuredFilter]);

  const fetchMembershipPlans = async () => {
    try {
      setIsLoadingPlans(true);
      const apiClient = (await import('@/lib/api-client')).default;
      const data = await apiClient.get('/admin/membership-plans') as { plans?: typeof plans };
      
      setPlans(data.plans || []);
    } catch (error) {
      console.error('Error fetching membership plans:', error);
      setError('Error al conectar con el servidor');
      setPlans([]);
    } finally {
      setIsLoadingPlans(false);
    }
  };

  const applyFilters = () => {
    let filtered = [...plans];

    // Filtro de búsqueda
    if (searchTerm) {
      filtered = filtered.filter(plan =>
        plan.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        plan.description.toLowerCase().includes(searchTerm.toLowerCase()) ||
        plan.level.name.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }

    // Filtro de estado
    if (statusFilter !== 'all') {
      filtered = filtered.filter(plan => plan.status === statusFilter);
    }

    // Filtro de renovación
    if (renewalFilter !== 'all') {
      if (renewalFilter === 'true') {
        filtered = filtered.filter(plan => plan.requiresRenewal);
      } else if (renewalFilter === 'false') {
        filtered = filtered.filter(plan => !plan.requiresRenewal);
      }
    }

    // Filtro de destacados
    if (featuredFilter !== 'all') {
      filtered = filtered.filter(plan => 
        plan.display.featured === (featuredFilter === 'true')
      );
    }

    setFilteredPlans(filtered);
  };

  const handleDelete = async (planId: string, planName: string) => {
    if (!confirm(`¿Estás seguro de que deseas archivar el plan "${planName}"? Esta acción se puede revertir.`)) {
      return;
    }

    try {
      setIsDeleting(planId);
      const apiClient = (await import('@/lib/api-client')).default;
      await apiClient.delete(`/admin/membership-plans/${planId}`);
      
      setSuccess('Plan archivado exitosamente');
      await fetchMembershipPlans(); // Recargar la lista
    } catch (error) {
      console.error('Error deleting plan:', error);
      setError('Error al conectar con el servidor');
    } finally {
      setIsDeleting(null);
    }
  };

  const getStatusBadge = (status: string) => {
    const statusConfig = {
      active: { color: 'bg-green-100 text-green-800', text: 'Activo' },
      inactive: { color: 'bg-yellow-100 text-yellow-800', text: 'Inactivo' },
      draft: { color: 'bg-gray-100 text-gray-800', text: 'Borrador' },
      archived: { color: 'bg-red-100 text-red-800', text: 'Archivado' }
    };

    const config = statusConfig[status as keyof typeof statusConfig] || statusConfig.draft;

    return (
      <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${config.color}`}>
        {config.text}
      </span>
    );
  };

  const formatPrice = (price: number) => {
    return new Intl.NumberFormat('es-CO', {
      style: 'currency',
      currency: 'COP',
      minimumFractionDigits: 0
    }).format(price);
  };

  const getRenewalText = (plan: MembershipPlan) => {
    if (!plan.requiresRenewal) return 'No requiere';
    if (plan.isLifetime) return 'Vitalicia (renovación anual)';
    
    const renewalTypes = {
      monthly: 'Mensual',
      quarterly: 'Trimestral',
      biannual: 'Semestral',
      annual: 'Anual',
      lifetime: 'Vitalicia'
    };

    return renewalTypes[plan.renewalType] || plan.renewalType;
  };

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

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header */}
        <div className="mb-8">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between">
            <div>
              <h1 className="text-3xl font-bold text-gray-900">Planes de Membresía</h1>
              <p className="mt-2 text-gray-600">
                Gestiona los planes de membresía disponibles para los usuarios
              </p>
            </div>
            <div className="mt-4 sm:mt-0">
              <button
                onClick={() => window.location.href = '/admin/membership-plans/new'}
                className="inline-flex items-center px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
              >
                <FaPlus className="mr-2" />
                Nuevo Plan
              </button>
            </div>
          </div>
        </div>

        {/* Alertas */}
        {error && (
          <div className="mb-6 bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded">
            {error}
            <button onClick={() => setError(null)} className="float-right">×</button>
          </div>
        )}

        {success && (
          <div className="mb-6 bg-green-50 border border-green-200 text-green-700 px-4 py-3 rounded">
            {success}
            <button onClick={() => setSuccess(null)} className="float-right">×</button>
          </div>
        )}

        {/* Filtros */}
        <div className="bg-white rounded-lg shadow mb-6 p-6">
          <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
            {/* Búsqueda */}
            <div className="flex-1 max-w-lg">
              <div className="relative">
                <FaSearch className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
                <input
                  type="text"
                  placeholder="Buscar planes..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500"
                />
              </div>
            </div>

            {/* Toggle de filtros */}
            <button
              onClick={() => setShowFilters(!showFilters)}
              className="inline-flex items-center px-3 py-2 border border-gray-300 rounded-md text-sm font-medium text-gray-700 bg-white hover:bg-gray-50"
            >
              <FaFilter className="mr-2" />
              Filtros
            </button>
          </div>

          {/* Filtros expandidos */}
          {showFilters && (
            <div className="mt-4 pt-4 border-t border-gray-200">
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div>
                  <label htmlFor="statusFilter" className="block text-sm font-medium text-gray-700 mb-1">
                    Estado
                  </label>
                  <select
                    id="statusFilter"
                    value={statusFilter}
                    onChange={(e) => setStatusFilter(e.target.value)}
                    className="w-full border border-gray-300 rounded-md px-3 py-2 focus:ring-blue-500 focus:border-blue-500"
                  >
                    <option value="all">Todos</option>
                    <option value="active">Activo</option>
                    <option value="inactive">Inactivo</option>
                    <option value="draft">Borrador</option>
                    <option value="archived">Archivado</option>
                  </select>
                </div>

                <div>
                  <label htmlFor="renewalFilter" className="block text-sm font-medium text-gray-700 mb-1">
                    Requiere Renovación
                  </label>
                  <select
                    id="renewalFilter"
                    value={renewalFilter}
                    onChange={(e) => setRenewalFilter(e.target.value)}
                    className="w-full border border-gray-300 rounded-md px-3 py-2 focus:ring-blue-500 focus:border-blue-500"
                  >
                    <option value="all">Todos</option>
                    <option value="true">Sí</option>
                    <option value="false">No</option>
                  </select>
                </div>

                <div>
                  <label htmlFor="featuredFilter" className="block text-sm font-medium text-gray-700 mb-1">
                    Destacado
                  </label>
                  <select
                    id="featuredFilter"
                    value={featuredFilter}
                    onChange={(e) => setFeaturedFilter(e.target.value)}
                    className="w-full border border-gray-300 rounded-md px-3 py-2 focus:ring-blue-500 focus:border-blue-500"
                  >
                    <option value="all">Todos</option>
                    <option value="true">Destacados</option>
                    <option value="false">No destacados</option>
                  </select>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Tabla de planes */}
        <div className="bg-white rounded-lg shadow overflow-hidden">
          {isLoadingPlans ? (
            <div className="flex items-center justify-center py-12">
              <FaSpinner className="animate-spin text-4xl text-blue-600" />
            </div>
          ) : filteredPlans.length === 0 ? (
            <div className="text-center py-12">
              <h3 className="text-lg font-medium text-gray-900 mb-2">
                No se encontraron planes
              </h3>
              <p className="text-gray-600">
                {plans.length === 0 
                  ? 'No hay planes de membresía creados aún.'
                  : 'Intenta ajustar los filtros para ver más resultados.'
                }
              </p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Plan
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Precio
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Renovación
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Miembros
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Estado
                    </th>
                    <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Acciones
                    </th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {filteredPlans.map((plan) => (
                    <tr key={plan._id} className="hover:bg-gray-50">
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="flex items-center">
                          <div 
                            className="w-3 h-3 rounded-full mr-3"
                            {...{ style: { backgroundColor: plan.display.color } }}
                          />
                          <div>
                            <div className="flex items-center">
                              <div className="text-sm font-medium text-gray-900">
                                {plan.name}
                              </div>
                              {plan.display.featured && (
                                <FaStar className="ml-2 text-yellow-400" />
                              )}
                            </div>
                            <div className="text-sm text-gray-500">
                              {plan.level.name} (Nivel {plan.level.tier})
                            </div>
                            <div className="text-xs text-gray-400">
                              {plan.benefits.length} beneficios
                            </div>
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm text-gray-900">
                          {formatPrice(plan.pricing.initial)}
                        </div>
                        {plan.pricing.withDiscount && (
                          <div className="text-xs text-green-600">
                            Con descuento: {formatPrice(plan.pricing.withDiscount)}
                          </div>
                        )}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm text-gray-900">
                          {getRenewalText(plan)}
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm text-gray-900">
                          {plan.capacity?.currentMembers || 0}
                          {plan.capacity?.maxMembers && (
                            <span className="text-gray-500">
                              /{plan.capacity.maxMembers}
                            </span>
                          )}
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        {getStatusBadge(plan.status)}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                        <div className="flex items-center justify-end space-x-2">
                          <button
                            onClick={() => window.location.href = `/admin/membership-plans/${plan._id}`}
                            className="text-blue-600 hover:text-blue-900"
                            title="Ver detalles"
                          >
                            <FaEye />
                          </button>
                          <button
                            onClick={() => window.location.href = `/admin/membership-plans/${plan._id}/edit`}
                            className="text-green-600 hover:text-green-900"
                            title="Editar"
                          >
                            <FaEdit />
                          </button>
                          <button
                            onClick={() => handleDelete(plan._id, plan.name)}
                            disabled={isDeleting === plan._id}
                            className="text-red-600 hover:text-red-900 disabled:opacity-50"
                            title="Archivar"
                          >
                            {isDeleting === plan._id ? (
                              <FaSpinner className="animate-spin" />
                            ) : (
                              <FaTrash />
                            )}
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>

        {/* Footer con estadísticas */}
        {filteredPlans.length > 0 && (
          <div className="mt-6 bg-white rounded-lg shadow p-6">
            <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
              <div className="text-center">
                <div className="text-2xl font-bold text-blue-600">
                  {filteredPlans.length}
                </div>
                <div className="text-sm text-gray-600">Planes Mostrados</div>
              </div>
              <div className="text-center">
                <div className="text-2xl font-bold text-green-600">
                  {filteredPlans.filter(p => p.status === 'active').length}
                </div>
                <div className="text-sm text-gray-600">Activos</div>
              </div>
              <div className="text-center">
                <div className="text-2xl font-bold text-yellow-600">
                  {filteredPlans.filter(p => p.display.featured).length}
                </div>
                <div className="text-sm text-gray-600">Destacados</div>
              </div>
              <div className="text-center">
                <div className="text-2xl font-bold text-purple-600">
                  {filteredPlans.reduce((sum, p) => sum + (p.capacity?.currentMembers || 0), 0)}
                </div>
                <div className="text-sm text-gray-600">Total Miembros</div>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}