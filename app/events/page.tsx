/**
 * ✅ SEO OPTIMIZATION: Converted to Server Component
 * Events page now fetches data server-side for better SEO and performance
 * 
 * BENEFITS:
 * - Events data rendered on server (search engines see content immediately)
 * - Faster initial page load (no client-side API call)
 * - Better Core Web Vitals scores
 * - Structured data generated server-side
 * - Filtering/sorting still works client-side
 * 
 * CHANGES FROM PREVIOUS VERSION:
 * - Removed 'use client' directive
 * - Data fetching moved to server-side
 * - Client interactions moved to EventsList component
 * - SEO metadata and structured data rendered server-side
 */

import React from 'react';
import EventsList from '@/components/eventos/EventsList';
import SEOComponent from '@/components/home/SEOComponent';
import { generateBreadcrumb } from '@/lib/seo-config';
import { getPublicEventsServerSide, filterEventsInSixMonths, getUniqueLocations } from '@/lib/events-server';
import { connection } from 'next/server';

/**
 * Events Page - Server Component
 * Displays upcoming events with server-side rendering for optimal SEO
 */
export default async function EventsPage() {
  // Force dynamic rendering due to new Date() usage in filterEventsInSixMonths
  await connection();
  
  // ✅ Fetch events server-side (this runs on the server)
  const allEvents = await getPublicEventsServerSide({ upcoming: true, limit: 50 });
  
  // ✅ Filter to next 6 months server-side
  const upcomingEvents = filterEventsInSixMonths(allEvents);
  
  // ✅ Get unique locations for filter
  const locations = getUniqueLocations(upcomingEvents);

  // ✅ Generate structured data server-side
  const breadcrumbData = generateBreadcrumb([
    { name: 'Inicio', url: 'https://bskmt.com' },
    { name: 'Eventos', url: 'https://bskmt.com/events' }
  ]);

  // ✅ ItemList structured data for events
  const eventsListData = {
    '@context': 'https://schema.org',
    '@type': 'ItemList',
    itemListElement: upcomingEvents.slice(0, 10).map((event, index) => ({
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
          {/* Header - Server-rendered SEO content */}
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

          {/* ✅ Client Component for interactions (filtering, sorting) */}
          <EventsList initialEvents={upcomingEvents} locations={locations} />
        </section>
      </div>
    </>
  );
}
