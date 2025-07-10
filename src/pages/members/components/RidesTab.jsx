import React from 'react';
import { FaCalendarAlt, FaMapMarkerAlt, FaMotorcycle } from 'react-icons/fa';

const eventTypes = [
  { id: 'all', label: 'Todos', icon: <FaMotorcycle /> },
  { id: 'Ride', label: 'Rodadas', icon: <FaMotorcycle /> },
  { id: 'Training', label: 'Talleres', icon: <FaMotorcycle /> },
  { id: 'Social', label: 'Eventos Sociales', icon: <FaMotorcycle /> },
  { id: 'Competition', label: 'Competencias', icon: <FaMotorcycle /> },
  { id: 'Tour', label: 'Viajes', icon: <FaMotorcycle /> }
];

const RidesTab = ({ events, eventFilter, handleRidesAction, filterEventsByType, sortEvents }) => {
  // Filtrar y ordenar eventos según los parámetros
  const filteredEvents = events
    .filter(event => eventFilter.type === 'all' || event.type === eventFilter.type)
    .sort((a, b) => {
      const dateA = new Date(a.date);
      const dateB = new Date(b.date);
      return eventFilter.sort === 'asc' ? dateA - dateB : dateB - dateA;
    });

  return (
    <div className="space-y-6">
      <div className="bg-white rounded-lg shadow-sm p-6">
        <h3 className="text-xl font-semibold text-gray-900 mb-4">Próximas Rodadas y Eventos</h3>
        
        {/* Filtros */}
        <div className="mb-6 bg-gray-50 p-4 rounded-lg">
          <h4 className="font-medium text-gray-800 mb-3">Filtrar por categoría:</h4>
          <div className="flex flex-wrap gap-2">
            {eventTypes.map((type) => (
              <button
                key={type.id}
                onClick={() => filterEventsByType(type.id)}
                className={`flex items-center px-4 py-2 rounded-full text-sm transition ${
                  eventFilter.type === type.id
                    ? 'bg-slate-950 text-white'
                    : 'bg-white text-gray-800 border border-gray-300 hover:bg-gray-100'
                }`}
              >
                {type.icon}
                <span className="ml-2">{type.label}</span>
              </button>
            ))}
          </div>
          
          <div className="mt-4 flex items-center">
            <label htmlFor="sortOrder" className="mr-3 text-sm font-medium text-gray-700">
              Ordenar por fecha:
            </label>
            <select
              id="sortOrder"
              value={eventFilter.sort}
              onChange={(e) => sortEvents(e.target.value)}
              className="px-3 py-2 border border-gray-300 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-slate-950"
            >
              <option value="asc">Más cercanos primero</option>
              <option value="desc">Más lejanos primero</option>
            </select>
          </div>
        </div>

        {/* Lista de eventos */}
        <div className="space-y-4">
          {filteredEvents.length === 0 ? (
            <div className="text-center py-8 text-gray-500">
              No hay eventos disponibles con los filtros actuales
            </div>
          ) : (
            filteredEvents.map((event) => (
              <div key={event.id} className="border border-gray-200 rounded-lg overflow-hidden bg-white hover:shadow-md transition-shadow">
                <div className="p-5">
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    {/* Información del evento */}
                    <div className="md:col-span-2">
                      <h4 className="font-semibold text-lg text-gray-800">{event.name}</h4>
                      
                      <div className="flex items-center mt-2 text-sm text-gray-600">
                        <FaCalendarAlt className="mr-2" />
                        <span>{event.date}</span>
                      </div>
                      
                      <div className="flex items-center mt-1 text-sm text-gray-600">
                        <FaMapMarkerAlt className="mr-2" />
                        <span>{event.location}</span>
                      </div>
                      
                      <p className="mt-3 text-gray-700 line-clamp-2">
                        {event.description}
                      </p>
                    </div>
                    
                    {/* Acciones */}
                    <div className="flex flex-wrap gap-2 md:justify-end items-start">
                      <button
                        onClick={() => handleRidesAction(event.id, 'details')}
                        className="bg-white hover:bg-gray-100 border border-gray-300 px-3 py-2 rounded-md text-sm transition"
                      >
                        Ver Detalles
                      </button>
                      <button
                        onClick={() => handleRidesAction(event.id, 'register')}
                        className="bg-slate-950 hover:bg-green-500 text-white px-3 py-2 rounded-md text-sm transition"
                      >
                        Registrar Asistencia
                      </button>
                      <button
                        onClick={() => handleRidesAction(event.id, 'reminder')}
                        className="bg-white hover:bg-gray-100 border border-gray-300 px-3 py-2 rounded-md text-sm transition"
                      >
                        Recordarme
                      </button>
                      <button
                        onClick={() => handleRidesAction(event.id, 'share')}
                        className="bg-white hover:bg-gray-100 border border-gray-300 px-3 py-2 rounded-md text-sm transition"
                      >
                        Compartir
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  );
};

export default RidesTab;