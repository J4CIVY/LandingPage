import React, { useState } from 'react';
import { FaChevronDown, FaChevronLeft, FaChevronRight, FaCalendarAlt } from 'react-icons/fa';
import { format, parseISO, isSameMonth, isSameDay, addMonths, subMonths } from 'date-fns';
import { es } from 'date-fns/locale';

const EventsTab = ({ userData, dropdownOpen, toggleDropdown, handleEventAction, statusIcon }) => {
  const [currentMonth, setCurrentMonth] = useState(new Date());
  const [selectedEvent, setSelectedEvent] = useState(null);

  // Manejar navegación del calendario
  const nextMonth = () => setCurrentMonth(addMonths(currentMonth, 1));
  const prevMonth = () => setCurrentMonth(subMonths(currentMonth, 1));

  // Renderizar encabezado del calendario
  const renderCalendarHeader = () => (
    <div className="flex items-center justify-between mb-4">
      <button onClick={prevMonth} className="p-2 hover:bg-gray-100 rounded-full">
        <FaChevronLeft className="text-[#000031]" />
      </button>
      <h3 className="text-lg font-semibold text-[#000031]">
        {format(currentMonth, 'MMMM yyyy', { locale: es })}
      </h3>
      <button onClick={nextMonth} className="p-2 hover:bg-gray-100 rounded-full">
        <FaChevronRight className="text-[#000031]" />
      </button>
    </div>
  );

  // Renderizar días de la semana
  const renderWeekdays = () => {
    const weekdays = ['L', 'M', 'X', 'J', 'V', 'S', 'D'];
    return (
      <div className="grid grid-cols-7 gap-1 mb-2">
        {weekdays.map(day => (
          <div key={day} className="text-center text-sm font-medium text-gray-500">
            {day}
          </div>
        ))}
      </div>
    );
  };

  // Renderizar celdas del calendario
  const renderCalendarCells = () => {
    const monthStart = new Date(currentMonth.getFullYear(), currentMonth.getMonth(), 1);
    const monthEnd = new Date(currentMonth.getFullYear(), currentMonth.getMonth() + 1, 0);
    const startDate = new Date(monthStart);
    startDate.setDate(startDate.getDate() - startDate.getDay());
    const endDate = new Date(monthEnd);
    endDate.setDate(endDate.getDate() + (6 - endDate.getDay()));

    const rows = [];
    let days = [];
    let day = startDate;

    while (day <= endDate) {
      for (let i = 0; i < 7; i++) {
        const cloneDay = new Date(day);
        const dayEvents = userData.calendarEvents.filter(event => 
          isSameDay(parseISO(event.date), cloneDay)
        );

        days.push(
          <div
            key={day}
            onClick={() => dayEvents.length > 0 && setSelectedEvent(dayEvents[0])}
            className={`min-h-12 p-1 border border-gray-200 text-sm ${
              !isSameMonth(day, monthStart) ? 'text-gray-400 bg-gray-50' : 'text-gray-800'
            } ${dayEvents.length > 0 ? 'cursor-pointer hover:bg-blue-50' : ''} ${
              isSameDay(day, new Date()) ? 'bg-[#00FF99] bg-opacity-20' : ''
            }`}
          >
            <div className="flex flex-col h-full">
              <span className="self-end">{format(day, 'd')}</span>
              {dayEvents.length > 0 && (
                <div className="mt-1 space-y-1 overflow-hidden">
                  {dayEvents.slice(0, 2).map(event => (
                    <div 
                      key={event.id}
                      className="text-xs p-1 bg-[#000031] text-white rounded truncate"
                    >
                      {event.title}
                    </div>
                  ))}
                  {dayEvents.length > 2 && (
                    <div className="text-xs text-center text-gray-500">
                      +{dayEvents.length - 2} más
                    </div>
                  )}
                </div>
              )}
            </div>
          </div>
        );
        day = new Date(day.setDate(day.getDate() + 1));
      }
      rows.push(
        <div key={day} className="grid grid-cols-7 gap-1">
          {days}
        </div>
      );
      days = [];
    }
    return <div className="mb-4">{rows}</div>;
  };

  // Renderizar detalles del evento seleccionado
  const renderEventDetails = () => {
    if (!selectedEvent) return null;
    
    const event = userData.allEvents.find(e => e._id === selectedEvent.id);
    if (!event) return null;

    return (
      <div className="bg-white border rounded-lg p-4 mt-4">
        <h4 className="text-lg font-semibold text-[#000031] mb-2">{event.name}</h4>
        <p className="text-sm text-gray-600 mb-1">
          <span className="font-medium">Fecha:</span> {format(parseISO(event.startDate), 'PPPP', { locale: es })}
        </p>
        <p className="text-sm text-gray-600 mb-1">
          <span className="font-medium">Lugar:</span> {event.departureLocation.address}
        </p>
        <p className="text-sm text-gray-600 mb-3">
          <span className="font-medium">Tipo:</span> {event.eventType}
        </p>
        <div className="flex space-x-2">
          <button
            onClick={() => handleEventAction(event._id, 'details')}
            className="bg-[#000031] hover:bg-[#00FF99] text-white py-1 px-3 rounded text-sm transition"
          >
            Más info
          </button>
          {userData.registeredEvents.some(e => e.eventId === event._id) ? (
            <button
              onClick={() => handleEventAction(event._id, 'cancel')}
              className="bg-red-500 hover:bg-red-600 text-white py-1 px-3 rounded text-sm transition"
            >
              Cancelar
            </button>
          ) : (
            <button
              onClick={() => handleEventAction(event._id, 'register')}
              className="bg-green-500 hover:bg-green-600 text-white py-1 px-3 rounded text-sm transition"
            >
              Registrarme
            </button>
          )}
        </div>
      </div>
    );
  };

  return (
    <div className="space-y-8">
      {/* Sección de eventos registrados */}
      <div>
        <h3 className="text-xl font-semibold text-[#000031] mb-4">Mis Eventos Registrados</h3>
        {userData.registeredEvents.length === 0 ? (
          <p className="text-gray-500 text-center py-4">No tienes eventos registrados</p>
        ) : (
          <div className="space-y-3">
            {userData.registeredEvents.map(event => (
              <div key={event.id} className={`border rounded-lg overflow-hidden ${
                event.status === 'confirmed' ? 'border-green-200 bg-green-50' : 
                event.status === 'canceled' ? 'border-red-200 bg-red-50' : 'border-yellow-200 bg-yellow-50'
              }`}>
                <div className="p-4 grid grid-cols-1 sm:grid-cols-3 gap-4">
                  <div>
                    <h4 className="font-semibold text-gray-800">{event.name}</h4>
                    <p className="text-sm text-gray-600 mt-1">{event.date}</p>
                    <div className={`inline-flex items-center mt-2 text-sm px-3 py-1 rounded-full ${
                      event.status === 'confirmed' ? 'bg-green-100 text-green-800' : 
                      event.status === 'canceled' ? 'bg-red-100 text-red-800' : 'bg-yellow-100 text-yellow-800'
                    }`}>
                      {statusIcon(event.status)}
                      {event.status === 'confirmed' ? 'Confirmado' : 
                       event.status === 'canceled' ? 'Cancelado' : 'Pendiente'}
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
                      {event.status !== 'canceled' && (
                        <button
                          onClick={() => handleEventAction(event.id, 'cancel')}
                          className="bg-white hover:bg-red-50 border border-red-200 text-red-600 px-3 py-1 rounded-md text-sm transition"
                        >
                          Cancelar
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
                    <p className="text-sm text-gray-600 mb-1">
                      <span className="font-medium">Lugar:</span> {event.location}
                    </p>
                    <p className="text-sm text-gray-600">
                      <span className="font-medium">Requisitos:</span> Casco, chaleco reflectivo, documentos al día
                    </p>
                  </div>
                )}
                <div
                  className="bg-gray-100 text-center py-1 cursor-pointer text-sm text-gray-600 hover:bg-gray-200 transition"
                  onClick={() => toggleDropdown(event.id)}
                >
                  <FaChevronDown className={`inline-block transition-transform ${
                    dropdownOpen === event.id ? 'transform rotate-180' : ''
                  }`} />
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Sección de calendario */}
      <div>
        <h3 className="text-xl font-semibold text-[#000031] mb-4 flex items-center">
          <FaCalendarAlt className="mr-2 text-[#00FF99]" />
          Calendario de Eventos
        </h3>
        <div className="bg-white border rounded-lg p-4">
          {renderCalendarHeader()}
          {renderWeekdays()}
          {renderCalendarCells()}
          {renderEventDetails()}
        </div>
      </div>
    </div>
  );
};

export default EventsTab;