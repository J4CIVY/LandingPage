import React, { useEffect, useState, useCallback } from "react";
import axios from "axios";
import { format, parseISO, isAfter, isBefore } from "date-fns";
import { es } from "date-fns/locale";

/**
 * @typedef {Object} EventLocation
 * @property {string} address - The full address of the event location.
 * @property {string} city - The city of the event location.
 * @property {string} country - The country of the event location.
 */
interface EventLocation {
  address: string;
  city: string;
  country: string;
}

/**
 * @typedef {Object} Event
 * @property {string} _id - Unique identifier for the event.
 * @property {string} name - Name of the event.
 * @property {string} startDate - Start date of the event in ISO format.
 * @property {string} description - Description of the event.
 * @property {string} mainImage - URL of the main image for the event.
 * @property {string} eventType - Type of the event (e.g., 'Ride', 'Meeting').
 * @property {EventLocation} [departureLocation] - Optional departure location details.
 */
interface Event {
  _id: string;
  name: string;
  startDate: string;
  description: string;
  mainImage: string;
  eventType: string;
  departureLocation?: EventLocation;
}

/**
 * @typedef {Object} EventsApiResponse
 * @property {string} status - Status of the API response (e.g., 'success').
 * @property {Object} data - Data payload.
 * @property {Event[]} data.events - Array of events.
 */
interface EventsApiResponse {
  status: string;
  data: {
    events: Event[];
  };
}

/**
 * Events component displays a list of upcoming and past events.
 * It includes filtering, sorting, and a detailed view for each event.
 * @returns {JSX.Element}
 */
const Events: React.FC = () => {
  const [events, setEvents] = useState<Event[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState<"upcoming" | "past">("upcoming");
  const [searchTerm, setSearchTerm] = useState<string>("");
  const [filterLocation, setFilterLocation] = useState<string>("all");
  const [sortOrder, setSortOrder] = useState<"asc" | "desc">("asc");

  /**
   * Fetches events from the API.
   * This function is memoized using useCallback.
   */
  const fetchEvents = useCallback(async () => {
    setLoading(true);
    setError(null); // Reset error state before new fetch
    try {
      const response = await axios.get<EventsApiResponse>("https://api.bskmt.com/events");
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
  const locations: string[] = ["all", ...new Set(events.map(event => 
    event.departureLocation?.city // Added optional chaining for safety
  ).filter(Boolean) as string[])]; // Filter out any undefined or null cities and assert type

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
      return sortOrder === "asc" ? dateA.getTime() - dateB.getTime() : dateB.getTime() - dateA.getTime();
    });

  /**
   * Renders an individual event card.
   * This function is memoized using useCallback.
   * @param {Event} event - The event object to render.
   * @returns {JSX.Element}
   */
  const renderEventCard = useCallback((event: Event): JSX.Element => {
    const eventDate = parseISO(event.startDate);
    
    return (
      <div key={event._id} className="bg-white rounded-xl overflow-hidden shadow-lg hover:shadow-xl transition-shadow">
        <div className="relative h-48">
          <img
            src={event.mainImage || "/default-event-image.webp"}
            alt={event.name}
            className="w-full h-full object-cover"
            loading="lazy"
            crossorigin="anonymous"
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
              aria-label={`Ver detalles de ${event.name}`}
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
        {/* Header */}
        <div className="text-center mb-12">
          <h1 className="text-4xl font-bold text-[#000031] mb-4">
            Eventos BSK Motorcycle Team
          </h1>
          <p className="text-lg text-gray-600 max-w-2xl mx-auto">
            Descubre nuestras próximas aventuras y revive los mejores momentos
          </p>
        </div>

        {/* Tabs */}
        <div className="flex justify-center mb-8">
          <div className="inline-flex rounded-md shadow-sm" role="tablist">
            <button
              onClick={() => setActiveTab("upcoming")}
              className={`px-6 py-2 rounded-l-full border ${
                activeTab === "upcoming"
                  ? "bg-[#000031] text-white border-[#000031]"
                  : "bg-white text-[#000031] border-gray-300 hover:bg-gray-100"
              } transition`}
              role="tab"
              aria-selected={activeTab === "upcoming"}
              id="tab-upcoming"
              aria-controls="panel-upcoming"
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
              role="tab"
              aria-selected={activeTab === "past"}
              id="tab-past"
              aria-controls="panel-past"
            >
              Eventos Pasados
            </button>
          </div>
        </div>

        {/* Filters */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8">
          <div>
            <label htmlFor="search-event" className="sr-only">Buscar por nombre de evento</label>
            <input
              type="text"
              id="search-event"
              placeholder="Buscar por nombre..."
              value={searchTerm}
              onChange={(e: React.ChangeEvent<HTMLInputElement>) => setSearchTerm(e.target.value)}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#000031] focus:border-transparent"
              aria-label="Buscar por nombre de evento"
            />
          </div>
          
          <div>
            <label htmlFor="filter-location" className="sr-only">Filtrar por ubicación</label>
            <select
              id="filter-location"
              value={filterLocation}
              onChange={(e: React.ChangeEvent<HTMLSelectElement>) => setFilterLocation(e.target.value)}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#000031] focus:border-transparent"
              aria-label="Filtrar por ubicación"
            >
              {locations.map((location) => (
                <option key={location} value={location}>
                  {location === "all" ? "Todas las ubicaciones" : location}
                </option>
              ))}
            </select>
          </div>
          
          <div>
            <label htmlFor="sort-order" className="sr-only">Ordenar eventos</label>
            <select
              id="sort-order"
              value={sortOrder}
              onChange={(e: React.ChangeEvent<HTMLSelectElement>) => setSortOrder(e.target.value as "asc" | "desc")}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#000031] focus:border-transparent"
              aria-label="Ordenar eventos"
            >
              <option value="asc">Más cercanos primero</option>
              <option value="desc">Más lejanos primero</option>
            </select>
          </div>
        </div>

        {/* Event List Panel */}
        <div 
          role="tabpanel"
          id={`panel-${activeTab}`}
          aria-labelledby={`tab-${activeTab}`}
        >
          {loading ? (
            <div className="flex justify-center items-center h-64" aria-live="polite">
              <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-[#FF0000]" role="status">
                <span className="sr-only">Cargando eventos...</span>
              </div>
            </div>
          ) : error ? (
            <div className="text-center py-10" role="alert">
              <p className="text-red-500 mb-4">{error}</p>
              <button
                onClick={fetchEvents}
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