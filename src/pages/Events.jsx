import React, { useEffect, useState, useCallback } from "react"; // Added useCallback for memoization
import axios from "axios";
import { format, parseISO, isAfter, isBefore } from "date-fns";
import { es } from "date-fns/locale";

const Events = () => {
  const [events, setEvents] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [activeTab, setActiveTab] = useState("upcoming");
  const [searchTerm, setSearchTerm] = useState("");
  const [filterLocation, setFilterLocation] = useState("all");
  const [sortOrder, setSortOrder] = useState("asc");

  // Memoized fetchEvents to prevent unnecessary re-creations
  const fetchEvents = useCallback(async () => {
    setLoading(true);
    setError(null); // Reset error state before new fetch
    try {
      const response = await axios.get("https://api.bskmt.com/events");
      // Ensure data structure is as expected, handle potential empty arrays
      setEvents(response.data.data.events || []); 
    } catch (err) {
      setError("Error al cargar los eventos. Intenta nuevamente.");
      console.error("Error fetching events:", err);
    } finally {
      setLoading(false);
    }
  }, []); // Empty dependency array means this function is created once

  useEffect(() => {
    fetchEvents();
  }, [fetchEvents]); // Depend on fetchEvents to re-run when it changes (which it won't due to useCallback)

  // Classify events into past/future - these should be derived states, not re-calculated on every render
  const now = new Date();
  const upcomingEvents = events.filter(event => 
    isAfter(parseISO(event.startDate), now)
  );
  const pastEvents = events.filter(event => 
    isBefore(parseISO(event.startDate), now)
  );

  // Get unique locations for the filter - also a derived state
  // Using a Set to ensure uniqueness and then spreading into an array
  const locations = ["all", ...new Set(events.map(event => 
    event.departureLocation?.city // Added optional chaining for safety
  ).filter(Boolean))]; // Filter out any undefined or null cities

  // Filter and sort events - this logic is fine, but consider memoizing if `events` array is very large
  const filteredEvents = (activeTab === "upcoming" ? upcomingEvents : pastEvents)
    .filter(event => {
      const matchesSearch = event.name.toLowerCase().includes(searchTerm.toLowerCase());
      // Added optional chaining for safety
      const matchesLocation = filterLocation === "all" || 
        event.departureLocation?.city === filterLocation; 
      return matchesSearch && matchesLocation;
    })
    .sort((a, b) => {
      const dateA = parseISO(a.startDate);
      const dateB = parseISO(b.startDate);
      return sortOrder === "asc" ? dateA - dateB : dateB - dateA;
    });

  // Memoized renderEventCard to prevent unnecessary re-renders of individual cards
  const renderEventCard = useCallback((event) => {
    const eventDate = parseISO(event.startDate);
    
    return (
      <div key={event._id} className="bg-white rounded-xl overflow-hidden shadow-lg hover:shadow-xl transition-shadow">
        <div className="relative h-48">
          <img
            src={event.mainImage || "/default-event-image.webp"}
            alt={event.name} // Alt text for accessibility
            className="w-full h-full object-cover"
            loading="lazy" // Lazy loading for images
          />
          <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black to-transparent opacity-60"></div>
          <div className="absolute bottom-0 left-0 p-4 text-white">
            <p className="text-sm font-medium">
              {format(eventDate, "PPPP", { locale: es })}
            </p>
          </div>
        </div>
        
        <div className="p-6">
          <h3 className="text-xl font-bold text-[#000031] mb-2">{event.name}</h3>
          <div className="flex items-center text-sm text-gray-600 mb-3">
            <svg className="w-4 h-4 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg" aria-hidden="true">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
            </svg>
            {event.departureLocation?.address} {/* Added optional chaining */}
          </div>
          
          <p className="text-gray-700 mb-4 line-clamp-3">{event.description}</p>
          
          <div className="flex justify-between items-center">
            <span className="text-sm font-medium text-[#00FF99]">
              {event.eventType === 'Ride' ? 'Rodada' : 'Evento'}
            </span>
            <button 
              className="bg-[#000031] hover:bg-[#00FF99] text-white py-2 px-4 rounded-lg transition"
              aria-label={`Ver detalles de ${event.name}`} // Added aria-label for accessibility
            >
              Ver detalles
            </button>
          </div>
        </div>
      </div>
    );
  }, []); // Empty dependency array means this function is created once

  return (
    <div className="min-h-screen bg-gray-50">
      <section className="py-16 px-4 max-w-7xl mx-auto">
        {/* Encabezado */}
        <div className="text-center mb-12">
          <h1 className="text-4xl font-bold text-[#000031] mb-4">
            Eventos BSK Motorcycle Team
          </h1>
          <p className="text-lg text-gray-600 max-w-2xl mx-auto">
            Descubre nuestras próximas aventuras y revive los mejores momentos
          </p>
        </div>

        {/* Pestañas */}
        <div className="flex justify-center mb-8">
          <div className="inline-flex rounded-md shadow-sm" role="tablist"> {/* Added role for accessibility */}
            <button
              onClick={() => setActiveTab("upcoming")}
              className={`px-6 py-2 rounded-l-full border ${
                activeTab === "upcoming"
                  ? "bg-[#000031] text-white border-[#000031]"
                  : "bg-white text-[#000031] border-gray-300 hover:bg-gray-100"
              } transition`}
              role="tab" // Added role for accessibility
              aria-selected={activeTab === "upcoming"} // Added aria-selected for accessibility
              id="tab-upcoming" // Added id for accessibility
              aria-controls="panel-upcoming" // Added aria-controls for accessibility
            >
              Próximos Eventos
            </button>
            <button
              onClick={() => setActiveTab("past")}
              className={`px-6 py-2 rounded-r-full border ${
                activeTab === "past"
                  ? "bg-[#000031] text-white border-[#000031]"
                  : "bg-white text-[#000031] border-gray-300 hover:bg-gray-100"
              } transition`}
              role="tab" // Added role for accessibility
              aria-selected={activeTab === "past"} // Added aria-selected for accessibility
              id="tab-past" // Added id for accessibility
              aria-controls="panel-past" // Added aria-controls for accessibility
            >
              Eventos Pasados
            </button>
          </div>
        </div>

        {/* Filtros */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8">
          <div>
            <label htmlFor="search-event" className="sr-only">Buscar por nombre de evento</label> {/* Added sr-only label for accessibility */}
            <input
              type="text"
              id="search-event"
              placeholder="Buscar por nombre..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#000031] focus:border-transparent"
              aria-label="Buscar por nombre de evento" // Added aria-label for accessibility
            />
          </div>
          
          <div>
            <label htmlFor="filter-location" className="sr-only">Filtrar por ubicación</label> {/* Added sr-only label for accessibility */}
            <select
              id="filter-location"
              value={filterLocation}
              onChange={(e) => setFilterLocation(e.target.value)}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#000031] focus:border-transparent"
              aria-label="Filtrar por ubicación" // Added aria-label for accessibility
            >
              {locations.map((location) => (
                <option key={location} value={location}>
                  {location === "all" ? "Todas las ubicaciones" : location}
                </option>
              ))}
            </select>
          </div>
          
          <div>
            <label htmlFor="sort-order" className="sr-only">Ordenar eventos</label> {/* Added sr-only label for accessibility */}
            <select
              id="sort-order"
              value={sortOrder}
              onChange={(e) => setSortOrder(e.target.value)}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#000031] focus:border-transparent"
              aria-label="Ordenar eventos" // Added aria-label for accessibility
            >
              <option value="asc">Más cercanos primero</option>
              <option value="desc">Más lejanos primero</option>
            </select>
          </div>
        </div>

        {/* Event List Panel */}
        <div 
          role="tabpanel" // Added role for accessibility
          id={`panel-${activeTab}`} // Added id for accessibility
          aria-labelledby={`tab-${activeTab}`} // Added aria-labelledby for accessibility
        >
          {loading ? (
            <div className="flex justify-center items-center h-64" aria-live="polite"> {/* Added aria-live for screen readers */}
              <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-[#FF0000]" role="status"> {/* Added role for screen readers */}
                <span className="sr-only">Cargando eventos...</span> {/* Added sr-only text for screen readers */}
              </div>
            </div>
          ) : error ? (
            <div className="text-center py-10" role="alert"> {/* Added role for screen readers */}
              <p className="text-red-500 mb-4">{error}</p>
              <button
                onClick={fetchEvents} // Call the memoized fetchEvents
                className="bg-[#FF0000] hover:bg-red-700 text-white font-bold py-2 px-6 rounded-lg"
              >
                Reintentar
              </button>
            </div>
          ) : filteredEvents.length === 0 ? (
            <div className="text-center py-10">
              <p className="text-gray-500 text-lg">
                No se encontraron eventos con los filtros aplicados
              </p>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
              {filteredEvents.map(renderEventCard)}
            </div>
          )}
        </div>
      </section>
    </div>
  );
};

export default Events;