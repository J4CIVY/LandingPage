'use client';

import React, { useState } from "react";
import { parseISO } from "date-fns";
import PublicEventCard from "@/components/eventos/PublicEventCard";
import { usePublicEvents } from "@/hooks/usePublicEvents";
import SEOComponent from "@/components/home/SEOComponent";
import { generateBreadcrumb } from "@/lib/seo-config";

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
  departureLocation?: {
    address: string;
    city: string;
    country: string;
  };
}

/**
 * Events component displays a list of upcoming events within the next 6 months for public view.
 * It includes filtering and sorting for public visitors.
 * @returns {JSX.Element}
 */
const Events: React.FC = () => {
  const { upcomingEventsInSixMonths, loading, error, fetchEvents } = usePublicEvents();
  const [searchTerm, setSearchTerm] = useState<string>("");
  const [filterLocation, setFilterLocation] = useState<string>("all");
  const [sortOrder, setSortOrder] = useState<"asc" | "desc">("asc");

  // Get unique locations for the filter
  const locations: string[] = ["all", ...new Set(upcomingEventsInSixMonths.map((event: Event) => 
    event.departureLocation?.city
  ).filter(Boolean) as string[])];

  // Filter and sort events - only upcoming events for public view
  const filteredEvents = upcomingEventsInSixMonths
    .filter((event: Event) => {
      const matchesSearch = event.name.toLowerCase().includes(searchTerm.toLowerCase());
      const matchesLocation = filterLocation === "all" || 
        event.departureLocation?.city === filterLocation; 
      return matchesSearch && matchesLocation;
    })
    .sort((a: Event, b: Event) => {
      const dateA = parseISO(a.startDate);
      const dateB = parseISO(b.startDate);
      return sortOrder === "asc" ? dateA.getTime() - dateB.getTime() : dateB.getTime() - dateA.getTime();
    });

  // Breadcrumb structured data
  const breadcrumbData = generateBreadcrumb([
    { name: 'Inicio', url: 'https://bskmt.com' },
    { name: 'Eventos', url: 'https://bskmt.com/events' }
  ]);

  // ItemList structured data for events
  const eventsListData = {
    '@context': 'https://schema.org',
    '@type': 'ItemList',
    itemListElement: filteredEvents.slice(0, 10).map((event, index) => ({
      '@type': 'ListItem',
      position: index + 1,
      item: {
        '@type': 'Event',
        name: event.name,
        description: event.description,
        startDate: event.startDate,
        image: event.mainImage,
        location: {
          '@type': 'Place',
          name: event.departureLocation?.city || 'Bogotá',
          address: {
            '@type': 'PostalAddress',
            addressLocality: event.departureLocation?.city || 'Bogotá',
            addressCountry: event.departureLocation?.country || 'CO'
          }
        },
        organizer: {
          '@type': 'Organization',
          name: 'BSK Motorcycle Team',
          url: 'https://bskmt.com'
        }
      }
    }))
  };

  return (
    <>
      <SEOComponent
        title="Eventos y Rutas en Moto 2025 | BSK Motorcycle Team Colombia"
        description="🏍️ Descubre las próximas rutas épicas y eventos de motociclismo en Colombia con BSK Motorcycle Team. Rodadas semanales por Bogotá, tours andinos, viajes por los Llanos, eventos benéficos, competencias y encuentros moteros. Calendario completo 2025. Únete al mejor club de motos de Colombia."
        canonical="https://bskmt.com/events"
        url="https://bskmt.com/events"
        image="https://res.cloudinary.com/dz0peilmu/image/upload/f_auto,q_auto:best,w_1200,h_630/BSK_Events_Hero.jpg"
        keywords="eventos motociclismo colombia 2025, rutas en moto bogotá, viajes en moto colombia, rodadas bsk mt, calendario eventos motos, tours en moto colombia, próximos eventos motoclub, viajes motociclistas 2025, eventos bikers colombia, rutas motociclistas cundinamarca"
        type="website"
        structuredData={[breadcrumbData, eventsListData]}
      />
      
    <div className="min-h-screen bg-white dark:bg-slate-950">
      <section className="py-16 px-4 max-w-7xl mx-auto">
        {/* Header */}
        <div className="text-center mb-12">
          <h1 className="text-4xl font-bold text-slate-950 dark:text-white mb-4">
            Eventos y Rutas en Moto 2025 - BSK Motorcycle Team
          </h1>
          
          <p className="text-lg text-gray-600 dark:text-gray-400 max-w-3xl mx-auto mb-4">
            Explora las próximas aventuras del club de motos más grande de Colombia. Rodadas semanales, viajes épicos, tours especializados y eventos únicos te esperan en los próximos 6 meses.
          </p>
          
          <p className="text-base text-gray-500 dark:text-gray-400 max-w-2xl mx-auto">
            Únete como miembro para acceder a todos los detalles, reservar tu cupo y disfrutar de tarifas preferenciales en todos nuestros eventos de motociclismo.
          </p>
        </div>

        {/* Filters */}
        <div className="mb-8">
          <h2 className="text-2xl font-bold text-slate-950 dark:text-white mb-4">
            Filtrar Eventos de Motociclismo
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div>
            <label htmlFor="search-event" className="sr-only">Buscar por nombre de evento</label>
            <input
              type="text"
              id="search-event"
              placeholder="Buscar por nombre..."
              value={searchTerm}
              onChange={(e: React.ChangeEvent<HTMLInputElement>) => setSearchTerm(e.target.value)}
              className="w-full px-4 py-2 border border-gray-300 dark:border-slate-600 rounded-lg focus:ring-2 focus:ring-slate-950 dark:focus:ring-green-500 focus:border-transparent bg-white dark:bg-slate-800 text-slate-950 dark:text-white placeholder-gray-500 dark:placeholder-gray-400"
              aria-label="Buscar por nombre de evento"
            />
          </div>
          
          <div>
            <label htmlFor="filter-location" className="sr-only">Filtrar por ubicación</label>
            <select
              id="filter-location"
              value={filterLocation}
              onChange={(e: React.ChangeEvent<HTMLSelectElement>) => setFilterLocation(e.target.value)}
              className="w-full px-4 py-2 border border-gray-300 dark:border-slate-600 rounded-lg focus:ring-2 focus:ring-slate-950 dark:focus:ring-green-500 focus:border-transparent bg-white dark:bg-slate-800 text-slate-950 dark:text-white"
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
              className="w-full px-4 py-2 border border-gray-300 dark:border-slate-600 rounded-lg focus:ring-2 focus:ring-slate-950 dark:focus:ring-green-500 focus:border-transparent bg-white dark:bg-slate-800 text-slate-950 dark:text-white"
              aria-label="Ordenar eventos"
            >
              <option value="asc">Más cercanos primero</option>
              <option value="desc">Más lejanos primero</option>
            </select>
          </div>
          </div>
        </div>

        {/* Event List Panel */}
        <div 
          role="main"
          aria-label="Lista de próximos eventos"
        >
          <h2 className="text-2xl font-bold text-slate-950 dark:text-white mb-6">
            Calendario de Eventos Próximos
          </h2>
          {loading ? (
            <div className="flex justify-center items-center h-64" aria-live="polite">
              <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-slate-950 dark:border-green-500" role="status">
                <span className="sr-only">Cargando eventos...</span>
              </div>
            </div>
          ) : error ? (
            <div className="text-center py-10" role="alert">
              <p className="text-red-500 dark:text-red-400 mb-4">{error}</p>
              <button
                onClick={fetchEvents}
                className="bg-red-600 hover:bg-red-700 dark:bg-red-700 dark:hover:bg-red-600 text-white font-bold py-2 px-6 rounded-lg"
              >
                Reintentar
              </button>
            </div>
          ) : filteredEvents.length === 0 ? (
            <>
              <div className="text-center py-16">
                <svg className="mx-auto h-24 w-24 text-gray-400 dark:text-gray-600 mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                </svg>
                <h3 className="text-xl font-medium text-gray-900 dark:text-gray-100 mb-2">
                  No hay eventos próximos que coincidan con tu búsqueda
                </h3>
                <p className="text-gray-500 dark:text-gray-400 mb-6">
                  No hay eventos programados para los próximos 6 meses que coincidan con tus filtros. Ajusta los filtros o únete al club para no perderte nuestras próximas aventuras.
                </p>
                <div className="bg-gradient-to-r from-green-50 to-blue-50 dark:from-slate-800 dark:to-slate-700 p-6 rounded-xl max-w-md mx-auto">
                  <p className="text-sm text-gray-700 dark:text-gray-300 mb-4">
                    ¡Únete al BSK Motorcycle Team para estar al tanto de futuros eventos y recibir notificaciones exclusivas!
                  </p>
                  <a 
                    href="/register"
                    className="inline-block bg-slate-950 hover:bg-green-500 dark:bg-green-500 dark:hover:bg-green-600 text-white py-2 px-6 rounded-lg font-medium"
                  >
                    Ser Miembro
                  </a>
                </div>
              </div>
              
              {/* Permanent SEO Content - What to Expect */}
              <div className="mt-16 bg-white dark:bg-slate-800 rounded-xl p-8 shadow-lg">
                <h2 className="text-3xl font-bold text-slate-950 dark:text-white mb-6 text-center">
                  Qué Esperar de los Eventos BSK Motorcycle Team
                </h2>
                
                <div className="grid md:grid-cols-2 gap-8 mb-8">
                  <div>
                    <h3 className="text-xl font-semibold text-slate-950 dark:text-white mb-3">
                      🏍️ Rodadas Semanales por Bogotá
                    </h3>
                    <p className="text-gray-600 dark:text-gray-400">
                      Cada fin de semana organizamos rodadas por las rutas más espectaculares de Bogotá y Cundinamarca. Desde La Calera hasta destinos cercanos como Girardot, nuestras rutas están diseñadas para motociclistas de todos los niveles.
                    </p>
                  </div>
                  
                  <div>
                    <h3 className="text-xl font-semibold text-slate-950 dark:text-white mb-3">
                      🗺️ Tours Épicos por Colombia
                    </h3>
                    <p className="text-gray-600 dark:text-gray-400">
                      Viaja con nosotros a destinos increíbles: Tour Andino, Tour de los Llanos, Desierto de la Tatacoa, Eje Cafetero y más. Experiencias inolvidables en el mejor club de motos de Colombia.
                    </p>
                  </div>
                  
                  <div>
                    <h3 className="text-xl font-semibold text-slate-950 dark:text-white mb-3">
                      🎓 Talleres y Capacitaciones
                    </h3>
                    <p className="text-gray-600 dark:text-gray-400">
                      Ofrecemos cursos de conducción defensiva, mantenimiento de motocicletas, primeros auxilios en ruta y técnicas avanzadas de manejo. Aprende de expertos y mejora tus habilidades motociclistas.
                    </p>
                  </div>
                  
                  <div>
                    <h3 className="text-xl font-semibold text-slate-950 dark:text-white mb-3">
                      ❤️ Eventos Benéficos y Sociales
                    </h3>
                    <p className="text-gray-600 dark:text-gray-400">
                      Participamos activamente en causas sociales. Rodadas benéficas, donaciones a comunidades, eventos de integración familiar y actividades que demuestran el lado solidario del motociclismo colombiano.
                    </p>
                  </div>
                </div>
                
                <div className="bg-green-50 dark:bg-slate-700 rounded-lg p-6 text-center">
                  <p className="text-lg font-semibold text-slate-950 dark:text-white mb-2">
                    ¿Listo para tu próxima aventura en moto?
                  </p>
                  <p className="text-gray-600 dark:text-gray-300 mb-4">
                    Únete al BSK Motorcycle Team y forma parte de la comunidad motera más activa de Colombia. Acceso exclusivo a todos los eventos, tarifas preferenciales y una familia de moteros esperándote.
                  </p>
                  <a 
                    href="/register"
                    className="inline-block bg-red-600 hover:bg-red-700 text-white py-3 px-8 rounded-lg font-bold"
                  >
                    Únete Ahora
                  </a>
                </div>
              </div>
            </>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
              {filteredEvents.map((event: Event) => (
                <PublicEventCard key={event._id} event={event} />
              ))}
            </div>
          )}
        </div>
      </section>
    </div>
    </>
  );
};

export default Events;