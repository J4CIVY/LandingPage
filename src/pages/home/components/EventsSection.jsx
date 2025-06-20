import React, { useState } from "react";
import { format, parseISO, isSameMonth, isSameDay } from 'date-fns';
import { es } from 'date-fns/locale';
import { FaCalendarAlt } from 'react-icons/fa';
import Calendar from "./Calendar";

const EventsSection = ({ events, loading, error }) => {
  const [activeTab, setActiveTab] = useState('events');
  const [currentMonth, setCurrentMonth] = useState(new Date());

  return (
    <section className="py-20 px-4 bg-[#000031] text-white">
      <div className="max-w-6xl mx-auto">
        <h2 className="text-4xl font-bold text-center mb-12">
          PRÓXIMOS <span className="text-[#00FF99]">EVENTOS</span>
        </h2>

        <div className="mb-8 flex justify-center space-x-4">
          <button
            onClick={() => setActiveTab('events')}
            className={`px-6 py-2 rounded-full ${activeTab === 'events' ? 'bg-[#FF0000] text-white' : 'bg-white text-[#000031]'}`}
          >
            Lista de Eventos
          </button>
          <button
            onClick={() => setActiveTab('calendar')}
            className={`px-6 py-2 rounded-full ${activeTab === 'calendar' ? 'bg-[#FF0000] text-white' : 'bg-white text-[#000031]'}`}
          >
            Calendario
          </button>
        </div>

        {activeTab === 'events' ? (
          <>
            {loading ? (
              <div className="flex justify-center items-center h-64">
                <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-[#FF0000]"></div>
              </div>
            ) : error ? (
              <div className="text-center py-10">
                <p className="text-red-400 mb-4">Error al cargar los eventos: {error}</p>
                <button 
                  onClick={() => window.location.reload()}
                  className="bg-[#FF0000] hover:bg-red-700 text-white font-bold py-2 px-4 rounded"
                >
                  Reintentar
                </button>
              </div>
            ) : (
              <div className="grid md:grid-cols-3 gap-8">
                {events.length > 0 ? (
                  events.map(event => (
                    <div key={event._id} className="bg-white text-[#000031] rounded-xl overflow-hidden shadow-lg transition-transform hover:scale-105">
                      <div className="relative" style={{ aspectRatio: '16/9' }}>
                        <img
                          src={event.mainImage || "/default-event-image.webp"}
                          alt={event.name}
                          className="w-full h-full object-cover"
                        />
                      </div>
                      <div className="p-6">
                        <h3 className="text-xl font-bold mb-2">{event.name}</h3>
                        <p className="text-[#FF0000] font-semibold mb-3">
                          {format(parseISO(event.startDate), "EEEE d 'de' MMMM yyyy", { locale: es })}
                        </p>
                        <p className="text-gray-700 mb-4">{event.description}</p>
                        <p className="text-sm text-gray-600 flex items-center">
                          <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                          </svg>
                          {event.departureLocation.address}
                        </p>
                        <button className="mt-4 w-full bg-[#000031] hover:bg-[#00FF99] text-white py-2 rounded-full transition duration-300">
                          Más información
                        </button>
                      </div>
                    </div>
                  ))
                ) : (
                  <div className="col-span-3 text-center py-10">
                    <p className="text-xl">No hay eventos programados en este momento</p>
                  </div>
                )}
              </div>
            )}
          </>
        ) : (
          <div className="bg-white rounded-xl p-6 text-[#000031]">
            <div className="flex items-center justify-center mb-4">
              <FaCalendarAlt className="text-[#FF0000] mr-2" />
              <h3 className="text-xl font-bold">Calendario de Eventos</h3>
            </div>
            <Calendar 
              events={events} 
              currentMonth={currentMonth} 
              setCurrentMonth={setCurrentMonth} 
            />
          </div>
        )}
      </div>
    </section>
  );
};

export default EventsSection;