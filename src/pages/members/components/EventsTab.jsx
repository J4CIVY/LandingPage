import React from 'react';
import { FaChevronDown } from 'react-icons/fa';

const EventsTab = ({ userData, dropdownOpen, toggleDropdown, handleEventAction, statusIcon }) => (
  <div>
    <div className="mb-6">
      <h3 className="text-xl font-semibold text-gray-800 mb-4">Mis Eventos Registrados</h3>
      <div className="space-y-3">
        {userData.registeredEvents.map(event => (
          <div key={event.id} className={`border rounded-lg overflow-hidden ${event.status === 'Confirmado' ? 'border-green-200 bg-green-50' : 'border-yellow-200 bg-yellow-50'}`}>
            <div className="p-4 grid grid-cols-1 sm:grid-cols-3 gap-4">
              <div>
                <h4 className="font-semibold text-gray-800">{event.name}</h4>
                <div className="text-sm text-gray-600 mt-1">{event.date}</div>
                <div className={`inline-flex items-center mt-2 text-sm px-3 py-1 rounded-full ${event.status === 'Confirmado' ? 'bg-green-100 text-green-800' : 'bg-yellow-100 text-yellow-800'}`}>
                  {statusIcon(event.status)}
                  {event.status}
                </div>
              </div>
              <div className="sm:col-span-2">
                <div className="flex flex-wrap gap-2 justify-start sm:justify-end">
                  <button
                    onClick={() => handleEventAction(event.id, 'details')}
                    className="bg-white hover:bg-gray-100 border border-gray-300 px-3 py-1 rounded-md text-sm transition"
                  >
                    Detalles
                  </button>
                  <button
                    onClick={() => handleEventAction(event.id, 'cancel')}
                    className="bg-white hover:bg-red-50 border border-red-200 text-red-600 px-3 py-1 rounded-md text-sm transition"
                  >
                    Cancelar
                  </button>
                  {event.status === 'Pendiente' && (
                    <button
                      onClick={() => handleEventAction(event.id, 'confirm')}
                      className="bg-green-500 hover:bg-green-600 text-white px-3 py-1 rounded-md text-sm transition"
                    >
                      Confirmar
                    </button>
                  )}
                  <button
                    onClick={() => handleEventAction(event.id, 'share')}
                    className="bg-white hover:bg-gray-100 border border-gray-300 px-3 py-1 rounded-md text-sm transition"
                  >
                    Compartir
                  </button>
                </div>
              </div>
            </div>
            {dropdownOpen === event.id && (
              <div className="bg-white p-4 border-t border-gray-200">
                <h5 className="font-medium mb-2">Detalles del Evento:</h5>
                <p className="text-sm text-gray-600">Lugar: Parque Principal - 8:00 AM</p>
                <p className="text-sm text-gray-600">Requisitos: Casco, chaleco reflectivo, documentos al día</p>
                <p className="text-sm text-gray-600 mt-2">Puntos por asistencia: 50</p>
              </div>
            )}
            <div
              className="bg-gray-100 text-center py-1 cursor-pointer text-sm text-gray-600 hover:bg-gray-200 transition"
              onClick={() => toggleDropdown(event.id)}
            >
              <FaChevronDown className={`transition-transform ${dropdownOpen === event.id ? 'transform rotate-180' : ''}`} />
            </div>
          </div>
        ))}
      </div>
    </div>

    <div>
      <h3 className="text-xl font-semibold text-gray-800 mb-4">Calendario de Eventos</h3>
      <div className="bg-white border rounded-lg p-4 min-h-64 flex items-center justify-center">
        <div className="text-center text-gray-500">
          [Calendario interactivo con eventos destacados]
        </div>
      </div>
    </div>
  </div>
);

export default EventsTab;