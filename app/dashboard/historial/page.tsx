'use client';

import { useState, useEffect } from 'react';
import DashboardHeader from '@/components/dashboard/DashboardHeader';
import HistorialHeader from '@/components/historial/HistorialHeader';
import Timeline from '@/components/historial/Timeline';
import EventosHistorial from '@/components/historial/EventosHistorial';
import MembresiaHistorial from '@/components/historial/MembresiaHistorial';
import PqrsdfHistorial from '@/components/historial/PqrsdfHistorial';
import BeneficiosHistorial from '@/components/historial/BeneficiosHistorial';
import LogrosHistorial from '@/components/historial/LogrosHistorial';
import { useAuth } from '@/hooks/useAuth';
import { 
  HistorialItem, 
  FiltroHistorial, 
  EstadisticasHistorial 
} from '@/types/historial';
import { FaSpinner } from 'react-icons/fa';
import { generateHistorialPDF } from '@/lib/pdf-service';

export default function HistorialPage() {
  const { user, isLoading, isAuthenticated } = useAuth();
  const [filtroActivo, setFiltroActivo] = useState<FiltroHistorial>({ categoria: 'Todos' });
  const [vistaActiva, setVistaActiva] = useState<'timeline' | 'secciones'>('timeline');
  const [historialItems, setHistorialItems] = useState<HistorialItem[]>([]);
  const [estadisticas, setEstadisticas] = useState<EstadisticasHistorial | null>(null);
  const [isLoadingData, setIsLoadingData] = useState(true);

  // Función para obtener el historial del usuario
  const fetchHistorial = async () => {
    try {
      setIsLoadingData(true);
      
      // Simulación de datos - en producción sería una llamada a la API
      const historialData: HistorialItem[] = [
        {
          id: '1',
          tipo: 'Evento',
          fecha: '2024-09-01T10:00:00Z',
          descripcion: 'Participación en Ruta del Café',
          estado: 'completado',
          referencia: 'evento_001',
          detalles: {
            rol: 'participante',
            puntos: 50,
            ubicacion: 'Zona Cafetera'
          }
        },
        {
          id: '2',
          tipo: 'Membresía',
          fecha: '2024-08-15T00:00:00Z',
          descripcion: 'Renovación de membresía Premium',
          estado: 'activo',
          referencia: 'membresia_002',
          detalles: {
            tipo: 'premium',
            vigencia: '2025-08-15'
          }
        },
        {
          id: '3',
          tipo: 'Beneficio',
          fecha: '2024-08-20T14:30:00Z',
          descripcion: 'Descuento en mantenimiento - Taller MotoTech',
          estado: 'completado',
          referencia: 'beneficio_003',
          detalles: {
            valorDescuento: 50000,
            establecimiento: 'Taller MotoTech'
          }
        },
        {
          id: '4',
          tipo: 'PQRSDF',
          fecha: '2024-07-10T09:15:00Z',
          descripcion: 'Sugerencia para nueva ruta turística',
          estado: 'cerrado',
          referencia: 'pqrs_004',
          detalles: {
            categoria: 'sugerencia',
            respuesta: 'Implementada en calendario de eventos'
          }
        },
        {
          id: '5',
          tipo: 'Reconocimiento',
          fecha: '2024-06-25T16:00:00Z',
          descripcion: 'Insignia "Espíritu Aventurero" por completar 10 rutas',
          estado: 'activo',
          referencia: 'logro_005',
          detalles: {
            categoria: 'participacion',
            nivel: 'oro',
            puntos: 100
          }
        }
      ];

      const stats: EstadisticasHistorial = {
        totalEventos: 15,
        eventosAsistidos: 12,
        beneficiosUsados: 8,
        pqrsdfAbiertas: 0,
        logrosObtenidos: 5,
        añosMembresia: 2,
        puntosAcumulados: 850
      };

      setHistorialItems(historialData);
      setEstadisticas(stats);
      
    } catch (error) {
      console.error('Error al cargar el historial:', error);
    } finally {
      setIsLoadingData(false);
    }
  };

  useEffect(() => {
    if (user && isAuthenticated) {
      fetchHistorial();
    }
  }, [user, isAuthenticated]);

  // Filtrar items según el filtro activo
  const itemsFiltrados = historialItems.filter(item => {
    if (filtroActivo.categoria === 'Todos') return true;
    return item.tipo === filtroActivo.categoria;
  });

  if (isLoading || isLoadingData) {
    return (
      <div className="min-h-screen bg-gray-50">
        <DashboardHeader />
        <div className="flex items-center justify-center min-h-[60vh]">
          <div className="text-center">
            <FaSpinner className="animate-spin text-blue-600 text-4xl mx-auto mb-4" />
            <p className="text-gray-600">Cargando historial...</p>
          </div>
        </div>
      </div>
    );
  }

  if (!isAuthenticated) {
    return (
      <div className="min-h-screen bg-gray-50">
        <DashboardHeader />
        <div className="flex items-center justify-center min-h-[60vh]">
          <div className="text-center">
            <p className="text-gray-600">Debes iniciar sesión para ver tu historial.</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <DashboardHeader />
      
      <main className="container mx-auto px-4 py-6 max-w-7xl">
        {/* Header del historial */}
        <HistorialHeader 
          estadisticas={estadisticas} 
          historialItems={historialItems}
          userName={user?.firstName ? `${user.firstName} ${user.lastName || ''}`.trim() : 'Miembro BSK'}
          onExportPDF={async () => {
            try {
              await generateHistorialPDF(
                estadisticas,
                historialItems,
                user?.firstName ? `${user.firstName} ${user.lastName || ''}`.trim() : 'Miembro BSK'
              );
            } catch (error) {
              console.error('Error al exportar PDF:', error);
              alert('Error al generar el PDF. Por favor, intenta nuevamente.');
            }
          }}
        />

        {/* Tabs para cambiar entre vistas */}
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 mb-6">
          <div className="flex border-b border-gray-200">
            <button
              onClick={() => setVistaActiva('timeline')}
              className={`px-6 py-3 font-medium text-sm transition-colors ${
                vistaActiva === 'timeline'
                  ? 'border-b-2 border-blue-500 text-blue-600'
                  : 'text-gray-500 hover:text-gray-700'
              }`}
            >
              Línea de Tiempo
            </button>
            <button
              onClick={() => setVistaActiva('secciones')}
              className={`px-6 py-3 font-medium text-sm transition-colors ${
                vistaActiva === 'secciones'
                  ? 'border-b-2 border-blue-500 text-blue-600'
                  : 'text-gray-500 hover:text-gray-700'
              }`}
            >
              Por Secciones
            </button>
          </div>
        </div>

        {/* Contenido según la vista activa */}
        {vistaActiva === 'timeline' ? (
          <Timeline 
            items={itemsFiltrados}
            filtro={filtroActivo}
            onFiltroChange={setFiltroActivo}
          />
        ) : (
          <div className="space-y-6">
            <EventosHistorial />
            <MembresiaHistorial />
            <BeneficiosHistorial />
            <PqrsdfHistorial />
            <LogrosHistorial />
          </div>
        )}
      </main>
    </div>
  );
}