import React from 'react';

const RidesTab = ({ userData, handleEventAction }) => (
  <div>
    <div className="mb-6">
      <h3 className="text-xl font-semibold text-gray-800 mb-4">Próximos Eventos del Club</h3>
      <div className="space-y-3">
        {userData.upcomingEvents.map(event => (
          <div key={event.id} className="border border-gray-200 rounded-lg overflow-hidden bg-white">
            <div className="p-4">
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                <div className="sm:col-span-2">
                  <h4 className="font-semibold text-gray-800">{event.name}</h4>
                  <div className="text-sm text-gray-600 mt-1">{event.date}</div>
                  <p className="text-sm text-gray-600 mt-2">
                    Descripción breve del evento y lo que incluye...
                  </p>
                </div>
                <div className="flex flex-wrap gap-2 sm:justify-end items-start">
                  <button
                    onClick={() => handleEventAction(event.id, 'details')}
                    className="bg-white hover:bg-gray-100 border border-gray-300 px-3 py-1 rounded-md text-sm transition"
                  >
                    Ver Detalles
                  </button>
                  <button
                    onClick={() => handleEventAction(event.id, 'register')}
                    className="bg-slate-950 hover:bg-green-500 text-white px-3 py-1 rounded-md text-sm transition"
                  >
                    Registrar Asistencia
                  </button>
                  <button
                    onClick={() => handleEventAction(event.id, 'reminder')}
                    className="bg-white hover:bg-gray-100 border border-gray-300 px-3 py-1 rounded-md text-sm transition"
                  >
                    Recordarme
                  </button>
                  <button
                    onClick={() => handleEventAction(event.id, 'share')}
                    className="bg-white hover:bg-gray-100 border border-gray-300 px-3 py-1 rounded-md text-sm transition"
                  >
                    Compartir
                  </button>
                </div>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>

    <div className="bg-gray-50 p-4 rounded-lg">
      <h4 className="font-medium text-gray-800 mb-3">Filtrar por categoría:</h4>
      <div className="flex flex-wrap gap-2">
        <button className="bg-slate-950 text-white px-3 py-1 rounded-full text-sm">Todos</button>
        <button className="bg-white hover:bg-gray-100 border border-gray-300 px-3 py-1 rounded-full text-sm">Rodadas</button>
        <button className="bg-white hover:bg-gray-100 border border-gray-300 px-3 py-1 rounded-full text-sm">Talleres</button>
        <button className="bg-white hover:bg-gray-100 border border-gray-300 px-3 py-1 rounded-full text-sm">Eventos Sociales</button>
        <button className="bg-white hover:bg-gray-100 border border-gray-300 px-3 py-1 rounded-full text-sm">Competencias</button>
        <button className="bg-white hover:bg-gray-100 border border-gray-300 px-3 py-1 rounded-full text-sm">Viajes</button>
      </div>
    </div>
  </div>
);

export default RidesTab;