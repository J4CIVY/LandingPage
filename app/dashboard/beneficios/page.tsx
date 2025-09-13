'use client';

import { useState, useMemo } from 'react';
import { Beneficio, CategoriaTypes, BeneficioFormData } from '@/types/beneficios';
import { 
  categorias, 
  beneficiosMock, 
  historialUsoMock,
  getBeneficiosPorCategoria,
  getHistorialPorUsuario 
} from '@/data/beneficiosData';

// Componentes
import BeneficiosHeader from '@/components/beneficios/BeneficiosHeader';
import CategoriasTabs from '@/components/beneficios/CategoriasTabs';
import BeneficioCard from '@/components/beneficios/BeneficioCard';
import BeneficioModal from '@/components/beneficios/BeneficioModal';
import BeneficioForm from '@/components/beneficios/BeneficioForm';
import HistorialUso from '@/components/beneficios/HistorialUso';

const BeneficiosPage = () => {
  // Estados para el manejo de la página
  const [categoriaActiva, setCategoriaActiva] = useState<CategoriaTypes | 'todos'>('todos');
  const [beneficioSeleccionado, setBeneficioSeleccionado] = useState<Beneficio | null>(null);
  const [modalDetalleAbierto, setModalDetalleAbierto] = useState(false);
  const [modalFormularioAbierto, setModalFormularioAbierto] = useState(false);
  const [beneficiosData, setBeneficiosData] = useState(beneficiosMock);
  const [vistaActual, setVistaActual] = useState<'beneficios' | 'historial'>('beneficios');
  const [isLoading, setIsLoading] = useState(false);

  // Simulación de usuario y permisos
  const isAdmin = true; // En una app real, esto vendría del contexto de autenticación
  const usuarioId = 'user123'; // En una app real, esto vendría del contexto de autenticación

  // Beneficios filtrados por categoría
  const beneficiosFiltrados = useMemo(() => {
    return getBeneficiosPorCategoria(categoriaActiva);
  }, [categoriaActiva]);

  // Historial del usuario
  const historialUsuario = useMemo(() => {
    return getHistorialPorUsuario(usuarioId);
  }, [usuarioId]);

  // Handlers
  const handleCategoriaChange = (categoria: CategoriaTypes | 'todos') => {
    setCategoriaActiva(categoria);
  };

  const handleVerDetalles = (beneficio: Beneficio) => {
    setBeneficioSeleccionado(beneficio);
    setModalDetalleAbierto(true);
  };

  const handleObtenerBeneficio = (beneficio: Beneficio) => {
    // En una app real, aquí se registraría el uso del beneficio
    console.log('Obtener beneficio:', beneficio.id);
    
    // Simular acción exitosa
    alert(`¡Beneficio obtenido! Código: ${beneficio.codigoPromocional}`);
    
    // Podrías actualizar el historial aquí si fuera necesario
    // setHistorialUsuario(prev => [...prev, nuevoRegistro]);
  };

  const handleCompartirBeneficio = (beneficio: Beneficio) => {
    // En una app real, aquí se implementaría la funcionalidad de compartir
    if (navigator.share) {
      navigator.share({
        title: `Beneficio BSK: ${beneficio.nombre}`,
        text: `¡Mira este beneficio exclusivo para miembros BSK! ${beneficio.descripcionBreve}`,
        url: window.location.href
      });
    } else {
      // Fallback para navegadores que no soportan Web Share API
      const texto = `¡Beneficio BSK! ${beneficio.nombre} - ${beneficio.descuento} en ${beneficio.empresa}. Código: ${beneficio.codigoPromocional}`;
      navigator.clipboard.writeText(texto).then(() => {
        alert('¡Beneficio copiado al portapapeles!');
      });
    }
  };

  const handleAgregarBeneficio = () => {
    setBeneficioSeleccionado(null);
    setModalFormularioAbierto(true);
  };

  const handleEditarBeneficio = (beneficio: Beneficio) => {
    setBeneficioSeleccionado(beneficio);
    setModalFormularioAbierto(true);
  };

  const handleSubmitBeneficio = async (data: BeneficioFormData) => {
    setIsLoading(true);
    
    try {
      // Simular llamada a API
      await new Promise(resolve => setTimeout(resolve, 2000));
      
      if (beneficioSeleccionado) {
        // Editar beneficio existente
        const beneficiosActualizados = beneficiosData.map(b => 
          b.id === beneficioSeleccionado.id 
            ? { 
                ...b, 
                nombre: data.nombre,
                categoria: data.categoria,
                descripcionBreve: data.descripcionBreve,
                descripcionCompleta: data.descripcionCompleta,
                descuento: data.descuento,
                ubicacion: data.ubicacion,
                enlaceWeb: data.enlaceWeb,
                empresa: data.empresa,
                codigoPromocional: data.codigoPromocional,
                requisitos: data.requisitos,
                fechaInicio: new Date(data.fechaInicio),
                fechaFin: new Date(data.fechaFin),
                estado: (new Date(data.fechaFin) > new Date() ? 'activo' : 'expirado') as 'activo' | 'proximamente' | 'expirado',
                updatedAt: new Date(),
                // Solo actualizar imagen si se proporciona una nueva
                ...(data.imagen && { imagen: URL.createObjectURL(data.imagen) })
              } 
            : b
        );
        setBeneficiosData(beneficiosActualizados);
        alert('Beneficio actualizado exitosamente');
      } else {
        // Crear nuevo beneficio
        const nuevoBeneficio: Beneficio = {
          id: String(Date.now()),
          nombre: data.nombre,
          categoria: data.categoria,
          descripcionBreve: data.descripcionBreve,
          descripcionCompleta: data.descripcionCompleta,
          descuento: data.descuento,
          ubicacion: data.ubicacion,
          enlaceWeb: data.enlaceWeb,
          imagen: data.imagen ? URL.createObjectURL(data.imagen) : '/images/beneficios/default.jpg',
          empresa: data.empresa,
          codigoPromocional: data.codigoPromocional,
          fechaInicio: new Date(data.fechaInicio),
          fechaFin: new Date(data.fechaFin),
          estado: (new Date(data.fechaFin) > new Date() ? 'activo' : 'expirado') as 'activo' | 'proximamente' | 'expirado',
          requisitos: data.requisitos,
          createdAt: new Date(),
          updatedAt: new Date()
        };
        
        setBeneficiosData(prev => [nuevoBeneficio, ...prev]);
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
        <BeneficiosHeader 
          isAdmin={isAdmin}
          onAgregarBeneficio={handleAgregarBeneficio}
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
            <CategoriasTabs
              categorias={categorias}
              categoriaActiva={categoriaActiva}
              onCategoriaChange={handleCategoriaChange}
            />

            {/* Grid de beneficios */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
              {beneficiosFiltrados.map((beneficio) => (
                <BeneficioCard
                  key={beneficio.id}
                  beneficio={beneficio}
                  onVerDetalles={handleVerDetalles}
                  onObtenerBeneficio={handleObtenerBeneficio}
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
          <HistorialUso 
            historial={historialUsuario}
            isLoading={false}
          />
        )}

        {/* Modal de detalles */}
        <BeneficioModal
          beneficio={beneficioSeleccionado}
          isOpen={modalDetalleAbierto}
          onClose={() => {
            setModalDetalleAbierto(false);
            setBeneficioSeleccionado(null);
          }}
          onCompartir={handleCompartirBeneficio}
        />

        {/* Modal de formulario (solo admin) */}
        {isAdmin && (
          <BeneficioForm
            isOpen={modalFormularioAbierto}
            onClose={() => {
              setModalFormularioAbierto(false);
              setBeneficioSeleccionado(null);
            }}
            onSubmit={handleSubmitBeneficio}
            beneficio={beneficioSeleccionado}
            isLoading={isLoading}
          />
        )}
      </div>
    </div>
  );
};

export default BeneficiosPage;