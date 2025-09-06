'use client';

import { 
  FaCalendarAlt
} from 'react-icons/fa';

const DashboardEventsTest: React.FC = () => {
  const mockEvents = [
    {
      _id: '1',
      name: 'Evento de Prueba 1',
      description: 'Descripción del evento de prueba 1',
      startDate: '2025-04-15T08:00:00Z',
      mainImage: 'https://via.placeholder.com/400x300',
      eventType: 'Rodada',
      departureLocation: {
        city: 'Bogotá',
        address: 'Parque Central',
        country: 'Colombia'
      },
      currentParticipants: 15,
      maxParticipants: 50
    },
    {
      _id: '2', 
      name: 'Evento de Prueba 2',
      description: 'Descripción del evento de prueba 2',
      startDate: '2025-04-22T14:00:00Z',
      mainImage: 'https://via.placeholder.com/400x300',
      eventType: 'Taller',
      departureLocation: {
        city: 'Medellín',
        address: 'Sede del Club',
        country: 'Colombia'
      },
      currentParticipants: 8,
      maxParticipants: 20
    }
  ];

  return (
    <div className="bg-white dark:bg-slate-800 rounded-xl shadow-sm border border-gray-200 dark:border-slate-700">
      <div className="p-6 border-b border-gray-200 dark:border-slate-700">
        <h3 className="text-lg font-semibold text-gray-900 dark:text-slate-100 flex items-center">
          <FaCalendarAlt className="mr-2 text-blue-600 dark:text-blue-400" />
          Próximos Eventos (Test) - {mockEvents.length} eventos
        </h3>
      </div>
      
      <div className="p-6">
        <div className="space-y-4">
          {mockEvents.map((event) => (
            <div key={event._id} className="border border-gray-200 dark:border-slate-700 rounded-lg p-4">
              <h4 className="text-lg font-semibold text-gray-900 dark:text-slate-100 mb-2">
                {event.name}
              </h4>
              <p className="text-sm text-gray-600 dark:text-slate-400 mb-2">
                {event.description}
              </p>
              <div className="text-sm text-gray-500">
                📅 {new Date(event.startDate).toLocaleDateString('es-ES')} | 
                📍 {event.departureLocation.city} |
                👥 {event.currentParticipants}/{event.maxParticipants} participantes
              </div>
            </div>
          ))}
        </div>
        
        <div className="mt-6 p-4 bg-blue-50 dark:bg-blue-900/20 rounded-lg">
          <p className="text-sm text-blue-700 dark:text-blue-400">
            ✅ Componente de eventos funcionando correctamente.
            <br />
            Si ves esto, el problema está en la conexión a la API/base de datos.
          </p>
        </div>
      </div>
    </div>
  );
};

export default DashboardEventsTest;
