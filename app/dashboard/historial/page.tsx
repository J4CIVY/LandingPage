'use client';

import { useState, useEffect } from 'react';
import HistorialHeader from '@/components/historial/HistorialHeader';
import Timeline from '@/components/historial/Timeline';
import EventosHistorial from '@/components/historial/EventosHistorial';
import MembresiaHistorial from '@/components/historial/MembresiaHistorial';
import PqrsdfHistorial from '@/components/historial/PqrsdfHistorial';
import BeneficiosHistorial from '@/components/historial/BeneficiosHistorial';
import LogrosHistorial from '@/components/historial/LogrosHistorial';
import { useAuth } from '@/hooks/useAuth';
import { 
  type HistorialItem, 
  type FiltroHistorial, 
  type EstadisticasHistorial 
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
      
      // Llamar a la API real de actividades del usuario
      const response = await fetch('/api/users/activity?limit=100', {
        method: 'GET',
        credentials: 'include',
        headers: {
          'Content-Type': 'application/json'
        }
      });

      if (response.ok) {
        const data = await response.json();
        const activities = data.data?.activities || [];
        
        // Convertir actividades de la API al formato del historial
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        const historialData: HistorialItem[] = activities.map((activity: any) => {
          // Mapear tipos de actividad
          let tipo = 'Evento';
          if (activity.type.includes('event')) tipo = 'Evento';
          else if (activity.type.includes('payment')) tipo = 'Pago';
          else if (activity.type.includes('pqrsdf')) tipo = 'PQRSDF';
          else if (activity.type.includes('profile')) tipo = 'Perfil';
          else if (activity.type.includes('achievement')) tipo = 'Reconocimiento';
          else if (activity.type.includes('membership')) tipo = 'Membresía';
          else if (activity.type.includes('store')) tipo = 'Beneficio';
          
          // Mapear estados
          let estado = 'completado';
          if (activity.status === 'pending') estado = 'pendiente';
          else if (activity.status === 'cancelled') estado = 'cancelado';
          else if (activity.status === 'failed') estado = 'fallido';
          else if (activity.status === 'completed') estado = 'completado';
          
          return {
            id: activity.id,
            tipo: tipo,
            fecha: activity.date,
            descripcion: activity.title,
            estado: estado,
            referencia: activity.id,
            detalles: activity.metadata || {}
          };
        });

        setHistorialItems(historialData);
        
        // Calcular estadísticas desde los datos reales
        const stats: EstadisticasHistorial = {
          // eslint-disable-next-line @typescript-eslint/no-explicit-any
          totalEventos: activities.filter((a: any) => a.type.includes('event')).length,
          // eslint-disable-next-line @typescript-eslint/no-explicit-any
          eventosAsistidos: activities.filter((a: any) => 
            a.type === 'event_attendance' || a.type === 'event_registration'
          ).length,
          // eslint-disable-next-line @typescript-eslint/no-explicit-any
          beneficiosUsados: activities.filter((a: any) => a.type === 'store_purchase').length,
          // eslint-disable-next-line @typescript-eslint/no-explicit-any
          pqrsdfAbiertas: activities.filter((a: any) => 
            a.type === 'pqrsdf_sent' && a.status === 'pending'
          ).length,
          // eslint-disable-next-line @typescript-eslint/no-explicit-any
          logrosObtenidos: activities.filter((a: any) => a.type === 'achievement_earned').length,
          anosMembresia: 0, // Se puede calcular desde la fecha de registro del usuario
          puntosAcumulados: activities
            // eslint-disable-next-line @typescript-eslint/no-explicit-any
            .filter((a: any) => a.metadata?.points)
            // eslint-disable-next-line @typescript-eslint/no-explicit-any
            .reduce((sum: number, a: any) => sum + (a.metadata.points || 0), 0)
        };

        setEstadisticas(stats);
      } else {
        // Si falla la API, usar datos vacíos
        setHistorialItems([]);
        setEstadisticas({
          totalEventos: 0,
          eventosAsistidos: 0,
          beneficiosUsados: 0,
          pqrsdfAbiertas: 0,
          logrosObtenidos: 0,
          anosMembresia: 0,
          puntosAcumulados: 0
        });
      }
      
    } catch (error) {
      console.error('Error al cargar el historial:', error);
      // En caso de error, datos vacíos
      setHistorialItems([]);
      setEstadisticas({
        totalEventos: 0,
        eventosAsistidos: 0,
        beneficiosUsados: 0,
        pqrsdfAbiertas: 0,
        logrosObtenidos: 0,
        anosMembresia: 0,
        puntosAcumulados: 0
      });
    } finally {
      setIsLoadingData(false);
    }
  };

  useEffect(() => {
    if (user && isAuthenticated) {
      void fetchHistorial();
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
      <main className="container mx-auto px-4 py-6 max-w-7xl">
        {/* Header del historial */}
        <HistorialHeader 
          estadisticas={estadisticas} 
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