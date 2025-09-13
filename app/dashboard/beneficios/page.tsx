'use client';

import { useState, useMemo } from 'react';
import { Benefit, CategoryType, BenefitFormData, BenefitStatus } from '@/types/benefits';
import { 
  categories, 
  benefitsMock, 
  usageHistoryMock,
  getBenefitsByCategory,
  getHistoryByUser 
} from '@/data/benefitsData';

// Componentes
import BenefitsHeader from '@/components/benefits/BenefitsHeader';
import CategoryTabs from '@/components/benefits/CategoryTabs';
import BenefitCard from '@/components/benefits/BenefitCard';
import BenefitModal from '@/components/benefits/BenefitModal';
import BenefitForm from '@/components/benefits/BenefitForm';
import UsageHistory from '@/components/benefits/UsageHistory';

const BeneficiosPage = () => {
  // Estados para el manejo de la página
  const [categoriaActiva, setCategoriaActiva] = useState<CategoryType | 'todos'>('todos');
  const [beneficioSeleccionado, setBeneficioSeleccionado] = useState<Benefit | null>(null);
  const [modalDetalleAbierto, setModalDetalleAbierto] = useState(false);
  const [modalFormularioAbierto, setModalFormularioAbierto] = useState(false);
  const [beneficiosData, setBeneficiosData] = useState(benefitsMock);
  const [vistaActual, setVistaActual] = useState<'beneficios' | 'historial'>('beneficios');
  const [isLoading, setIsLoading] = useState(false);

  // Simulación de usuario y permisos
  const isAdmin = true; // En una app real, esto vendría del contexto de autenticación
  const usuarioId = 'user123'; // En una app real, esto vendría del contexto de autenticación

  // Beneficios filtrados por categoría
  const beneficiosFiltrados = useMemo(() => {
    return getBenefitsByCategory(categoriaActiva === 'todos' ? 'all' : categoriaActiva);
  }, [categoriaActiva]);

  // Historial del usuario
  const historialUsuario = useMemo(() => {
    return getHistoryByUser(usuarioId);
  }, [usuarioId]);

  // Handlers
  const handleCategoriaChange = (categoria: CategoryType | 'todos') => {
    setCategoriaActiva(categoria);
  };

  const handleVerDetalles = (beneficio: Benefit) => {
    setBeneficioSeleccionado(beneficio);
    setModalDetalleAbierto(true);
  };

  const handleObtenerBeneficio = (beneficio: Benefit) => {
    // En una app real, aquí se registraría el uso del beneficio
    console.log('Obtener beneficio:', beneficio.id);
    
    // Simular acción exitosa
    alert(`¡Beneficio obtenido! Código: ${beneficio.promoCode}`);
    
    // Podrías actualizar el historial aquí si fuera necesario
    // setHistorialUsuario(prev => [...prev, nuevoRegistro]);
  };

  const handleCompartirBeneficio = (beneficio: Benefit) => {
    // En una app real, aquí se implementaría la funcionalidad de compartir
    if (navigator.share) {
      navigator.share({
        title: `Beneficio BSK: ${beneficio.name}`,
        text: `¡Mira este beneficio exclusivo para miembros BSK! ${beneficio.briefDescription}`,
        url: window.location.href
      });
    } else {
      // Fallback para navegadores que no soportan Web Share API
      const texto = `¡Beneficio BSK! ${beneficio.name} - ${beneficio.discount} en ${beneficio.company}. Código: ${beneficio.promoCode}`;
      navigator.clipboard.writeText(texto).then(() => {
        alert('¡Beneficio copiado al portapapeles!');
      });
    }
  };

  const handleAgregarBeneficio = () => {
    setBeneficioSeleccionado(null);
    setModalFormularioAbierto(true);
  };

  const handleEditarBeneficio = (beneficio: Benefit) => {
    setBeneficioSeleccionado(beneficio);
    setModalFormularioAbierto(true);
  };

  const handleSubmitBeneficio = async (data: BenefitFormData) => {
    setIsLoading(true);
    
    try {
      // Simular llamada a API
      await new Promise(resolve => setTimeout(resolve, 2000));
      
      if (beneficioSeleccionado) {
        // Editar beneficio existente
        const beneficiosActualizados = beneficiosData.map((b: Benefit) => 
          b.id === beneficioSeleccionado.id 
            ? { 
                ...b, 
                name: data.name,
                category: data.category,
                briefDescription: data.briefDescription,
                fullDescription: data.fullDescription,
                discount: data.discount,
                location: data.location,
                website: data.website,
                company: data.company,
                promoCode: data.promoCode,
                requirements: data.requirements,
                startDate: new Date(data.startDate),
                endDate: new Date(data.endDate),
                status: (new Date(data.endDate) > new Date() ? 'active' : 'expired') as BenefitStatus,
                updatedAt: new Date(),
                // Solo actualizar imagen si se proporciona una nueva
                ...(data.image && { image: URL.createObjectURL(data.image) })
              } 
            : b
        );
        setBeneficiosData(beneficiosActualizados);
        alert('Beneficio actualizado exitosamente');
      } else {
        // Crear nuevo beneficio
        const nuevoBeneficio: Benefit = {
          id: String(Date.now()),
          name: data.name,
          category: data.category,
          briefDescription: data.briefDescription,
          fullDescription: data.fullDescription,
          discount: data.discount,
          location: data.location,
          website: data.website,
          image: data.image ? URL.createObjectURL(data.image) : '/images/beneficios/default.jpg',
          company: data.company,
          promoCode: data.promoCode,
          startDate: new Date(data.startDate),
          endDate: new Date(data.endDate),
          status: (new Date(data.endDate) > new Date() ? 'active' : 'expired') as BenefitStatus,
          requirements: data.requirements,
          createdAt: new Date(),
          updatedAt: new Date()
        };
        
        setBeneficiosData((prev: Benefit[]) => [nuevoBeneficio, ...prev]);
        alert('Beneficio creado exitosamente');
      }
      
      setModalFormularioAbierto(false);
      setBeneficioSeleccionado(null);
    } catch (error) {
      console.error('Error al guardar beneficio:', error);
      alert('Error al guardar el beneficio. Intenta de nuevo.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        
        {/* Header principal */}
        <BenefitsHeader 
          isAdmin={isAdmin}
          onAddBenefit={handleAgregarBeneficio}
        />

        {/* Navegación entre vistas */}
        <div className="flex gap-4 mb-6">
          <button
            onClick={() => setVistaActual('beneficios')}
            className={`px-4 py-2 rounded-lg font-medium transition-colors duration-200 ${
              vistaActual === 'beneficios'
                ? 'bg-blue-600 text-white'
                : 'bg-white dark:bg-gray-800 text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700'
            }`}
          >
            Beneficios Disponibles
          </button>
          <button
            onClick={() => setVistaActual('historial')}
            className={`px-4 py-2 rounded-lg font-medium transition-colors duration-200 ${
              vistaActual === 'historial'
                ? 'bg-blue-600 text-white'
                : 'bg-white dark:bg-gray-800 text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700'
            }`}
          >
            Mi Historial
          </button>
        </div>

        {/* Contenido principal */}
        {vistaActual === 'beneficios' ? (
          <>
            {/* Filtros por categoría */}
            <CategoryTabs
              categories={categories}
              activeCategory={categoriaActiva === 'todos' ? 'all' : categoriaActiva}
              onCategoryChange={(category) => handleCategoriaChange(category === 'all' ? 'todos' : category)}
            />

            {/* Grid de beneficios */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
              {beneficiosFiltrados.map((beneficio: Benefit) => (
                <BenefitCard
                  key={beneficio.id}
                  benefit={beneficio}
                  onViewDetails={handleVerDetalles}
                  onClaimBenefit={handleObtenerBeneficio}
                />
              ))}
            </div>

            {/* Estado vacío */}
            {beneficiosFiltrados.length === 0 && (
              <div className="text-center py-12">
                <div className="w-24 h-24 mx-auto mb-4 bg-gray-200 dark:bg-gray-700 rounded-full flex items-center justify-center">
                  <span className="text-4xl">🎁</span>
                </div>
                <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-2">
                  No hay beneficios en esta categoría
                </h3>
                <p className="text-gray-600 dark:text-gray-400">
                  Explora otras categorías o vuelve más tarde para ver nuevos beneficios.
                </p>
              </div>
            )}
          </>
        ) : (
          /* Vista de historial */
          <UsageHistory 
            history={historialUsuario}
            isLoading={false}
          />
        )}

        {/* Modal de detalles */}
        <BenefitModal
          benefit={beneficioSeleccionado}
          isOpen={modalDetalleAbierto}
          onClose={() => {
            setModalDetalleAbierto(false);
            setBeneficioSeleccionado(null);
          }}
          onShare={handleCompartirBeneficio}
        />

        {/* Modal de formulario (solo admin) */}
        {isAdmin && (
          <BenefitForm
            isOpen={modalFormularioAbierto}
            onClose={() => {
              setModalFormularioAbierto(false);
              setBeneficioSeleccionado(null);
            }}
            onSubmit={handleSubmitBeneficio}
            benefit={beneficioSeleccionado}
            isLoading={isLoading}
          />
        )}
      </div>
    </div>
  );
};

export default BeneficiosPage;