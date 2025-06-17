import React, { useState, useEffect } from "react";
import SEO from "../components/shared/SEO";
import {
  FaUsers,
  FaTools,
  FaMoneyBillWave,
  FaGlassCheers,
  FaGraduationCap,
  FaShieldAlt,
  FaCalendarAlt,
  FaArrowLeft,
  FaArrowRight
} from 'react-icons/fa';
import { format, parseISO, isSameMonth, isSameDay, addMonths, subMonths } from 'date-fns';
import { es } from 'date-fns/locale';

const Home = () => {
  const [activeTab, setActiveTab] = useState('events');
  const [activeGalleryImage, setActiveGalleryImage] = useState(0);
  const [events, setEvents] = useState([]);
  const [loadingEvents, setLoadingEvents] = useState(true);
  const [errorEvents, setErrorEvents] = useState(null);
  const [currentMonth, setCurrentMonth] = useState(new Date());

  // Datos de ejemplo para la galería y otros elementos
  const galleryImages = [
    { id: 1, src: '/Banner_Algunos_Miembros_Motoclub_BSK_Motocycle_Team.webp', alt: 'Algunos Miembros De BSK Motorcycle Team' },
    { id: 2, src: '/Banner_Capacitacion_Seguridad_Vial_2025_BSK_Motocycle_Team.webp', alt: 'Capacitacion Seguridad Vial 2025 BSK Motorcycle Team' },
    { id: 3, src: '/Banner_Direct_To_Chochi_2025_Motoclub_BSK_Motocycle_Team.webp', alt: 'Direct To Choachi 2025 BSK Motorcycle Team' },
    { id: 4, src: '/Banner_Primer_Tinto_o_Aromatica_Junio_2024_Motoclub_BSK_Motorcycle_Team.webp', alt: 'Primer Tinto O Aromatica Junio 2024 BSK Motorcycle Team' },
    { id: 5, src: '/Banner_Road_To_Villeta_2023_Motoclub_BSK_Motorcycle_Team.webp', alt: 'Road To Villeta 2023 BSK Motorcycle Team' },
    { id: 6, src: '/Banner_Tour_Andino_2023_Motoclub_BSK_Motocycle_Team.webp', alt: 'Tour Andino 2023 BSK Motorcycle Team' }
  ];

  const featuredProducts = [
    { id: 1, name: 'Camiseta BSK', price: 25.99, image: '/Camiseta BSK.webp' },
    { id: 2, name: 'Hoodie BSK', price: 89.99, image: '/Hoodie BSK.webp' },
    { id: 3, name: 'Gorra BSK', price: 4.99, image: '/Gorra BSK.webp' }
  ];

  const blogPosts = [
    { id: 1, title: 'Consejos para viajes largos en moto', excerpt: 'Aprende cómo prepararte para tus aventuras en carretera...', date: '10 Sept 2023' },
    { id: 2, title: 'Nuevas regulaciones de seguridad', excerpt: 'Los cambios en la normativa que todo motociclista debe conocer...', date: '28 Ago 2023' }
  ];

  // Fetch events from API
  useEffect(() => {
    const fetchEvents = async () => {
      try {
        const response = await fetch('https://api.bskmt.com/events');
        if (!response.ok) {
          throw new Error('Error al cargar los eventos');
        }
        const data = await response.json();
        setEvents(data.data.events);
      } catch (error) {
        console.error('Error fetching events:', error);
        setErrorEvents(error.message);
      } finally {
        setLoadingEvents(false);
      }
    };

    fetchEvents();
  }, []);

  // Efecto para el carrusel automático
  useEffect(() => {
    const interval = setInterval(() => {
      setActiveGalleryImage((prev) =>
        prev === galleryImages.length - 1 ? 0 : prev + 1
      );
    }, 5000);

    return () => clearInterval(interval);
  }, []);

  // Funciones para el calendario
  const nextMonth = () => {
    setCurrentMonth(addMonths(currentMonth, 1));
  };

  const prevMonth = () => {
    setCurrentMonth(subMonths(currentMonth, 1));
  };

  const renderHeader = () => {
    return (
      <div className="flex items-center justify-between mb-4">
        <button 
          onClick={prevMonth}
          className="p-2 rounded-full hover:bg-gray-200 transition"
        >
          <FaArrowLeft className="text-[#000031]" />
        </button>
        <h3 className="text-xl font-bold text-[#000031]">
          {format(currentMonth, 'MMMM yyyy', { locale: es })}
        </h3>
        <button 
          onClick={nextMonth}
          className="p-2 rounded-full hover:bg-gray-200 transition"
        >
          <FaArrowRight className="text-[#000031]" />
        </button>
      </div>
    );
  };

  const renderDays = () => {
    const days = [];
    const dateFormat = 'EEEE';
    const startDate = new Date(currentMonth.getFullYear(), currentMonth.getMonth(), 1);

    for (let i = 0; i < 7; i++) {
      days.push(
        <div className="text-center font-semibold text-sm py-2" key={i}>
          {format(new Date(startDate.setDate(i + 1)), dateFormat, { locale: es }).charAt(0).toUpperCase()}
        </div>
      );
    }

    return <div className="grid grid-cols-7 mb-2">{days}</div>;
  };

  const renderCells = () => {
    const monthStart = new Date(currentMonth.getFullYear(), currentMonth.getMonth(), 1);
    const monthEnd = new Date(currentMonth.getFullYear(), currentMonth.getMonth() + 1, 0);
    const startDate = new Date(monthStart);
    startDate.setDate(startDate.getDate() - startDate.getDay());
    const endDate = new Date(monthEnd);
    endDate.setDate(endDate.getDate() + (6 - endDate.getDay()));

    const rows = [];
    let days = [];
    let day = startDate;
    let formattedDate = '';

    while (day <= endDate) {
      for (let i = 0; i < 7; i++) {
        formattedDate = format(day, 'd');
        const cloneDay = new Date(day);
        const dayEvents = events.filter(event => 
          isSameDay(parseISO(event.startDate), day)
        );

        days.push(
          <div
            className={`min-h-12 p-1 border border-gray-200 ${
              !isSameMonth(day, monthStart) ? 'text-gray-400' : 'text-[#000031]'
            } ${isSameDay(day, new Date()) ? 'bg-[#00FF99] bg-opacity-20' : ''}`}
            key={day}
          >
            <div className="flex flex-col h-full">
              <span className="text-sm font-medium self-end">{formattedDate}</span>
              <div className="flex-1 overflow-y-auto">
                {dayEvents.map(event => (
                  <div 
                    key={event._id}
                    className="text-xs p-1 my-1 rounded bg-[#FF0000] text-white truncate"
                    title={event.name}
                  >
                    {event.name}
                  </div>
                ))}
              </div>
            </div>
          </div>
        );
        day = new Date(day.setDate(day.getDate() + 1));
      }
      rows.push(
        <div className="grid grid-cols-7" key={day}>
          {days}
        </div>
      );
      days = [];
    }
    return <div className="mb-4">{rows}</div>;
  };

  return (
    <>
      <SEO
        title="BSK Motorcycle Team - Comunidad Motera en Bogotá | Pasión por el Motociclismo"
        description="Únete al BSK Motorcycle Team, el motoclub líder en Bogotá. Disfruta de rutas, eventos, talleres y una comunidad apasionada por el motociclismo. Hermandad, aventura y respeto sobre dos ruedas."
        keywords="motoclub bogotá, bsk motorcycle team, comunidad motera, rutas en moto bogotá, eventos motociclismo, club de motos colombia, mototurismo, talleres motociclismo"
        image="https://bskmt.com/images/og-home.jpg"
        url="https://bskmt.com"
        type="website"
        canonical="https://bskmt.com"
      >
        {/* Schema Markup adicional para Motoclub */}
        <script type="application/ld+json">
          {JSON.stringify({
            "@context": "https://schema.org",
            "@type": "MotorcycleDealer",
            "name": "BSK Motorcycle Team",
            "description": "Motoclub apasionado por el motociclismo y la comunidad motera en Bogotá, Colombia",
            "url": "https://bskmt.com",
            "logo": "https://bskmt.com/images/logo.png",
            "address": {
              "@type": "PostalAddress",
              "streetAddress": "Carrera 5 A No. 36 A Sur 28, 110431, Ayacucho, San Cristobal, Bogotá, Bogotá D.C., Colombia",
              "addressLocality": "Bogotá",
              "addressRegion": "Bogotá D.C.",
              "postalCode": "110431",
              "addressCountry": "CO"
            },
            "geo": {
              "@type": "GeoCoordinates",
              "latitude": "4.562477",
              "longitude": "-74.101509"
            },
            "openingHours": "Mo,Tu,We,Th,Fr,Sa,Su 08:00-20:00",
            "telephone": "+573125192000",
            "sameAs": [
              "https://www.facebook.com/BSKMotorcycleTeam",
              "https://www.instagram.com/BSKMotorcycleTeam",
              "https://www.youtube.com/BSKMotorcycleTeam"
            ]
          })}
        </script>
      </SEO>

      <div className="min-h-screen bg-[#ffffff]">

        {/* Hero Section */}
        <section className="relative h-screen flex items-center justify-center bg-[#000031] overflow-hidden">
          <div className="absolute inset-0 w-full h-full">
            <img
              src="/Banner_Home_Motoclub_BSK_Motorcycle_Team.webp"
              alt="BSK Motorcycle Team"
              className="w-full h-full object-cover"
              style={{
                aspectRatio: '16/9',
                objectPosition: 'center center'
              }}
            />
            <div className="absolute inset-0 bg-black opacity-50"></div>
          </div>

          <div className="relative z-10 text-center px-4">
            <h1 className="text-5xl md:text-7xl font-bold text-white mb-6 animate-fade-in">
              <span className="text-[#00FF99]">BSK</span> MOTORCYCLE TEAM
            </h1>
            <p className="text-xl md:text-2xl text-white mb-8 max-w-2xl mx-auto">
              Libertad sobre dos ruedas - Pasión, Camaradería y Aventura
            </p>
            <button className="bg-[#FF0000] hover:bg-red-700 text-white font-bold py-3 px-8 rounded-full text-lg transition duration-300 transform hover:scale-105">
              ÚNETE AL CLUB
            </button>
          </div>
        </section>

        {/* Sobre Nosotros */}
        <section className="py-20 px-4 bg-white">
          <div className="max-w-6xl mx-auto">
            <h2 className="text-4xl font-bold text-center text-[#000031] mb-12">
              SOBRE <span className="text-[#FF0000]">NOSOTROS</span>
            </h2>

            <div className="grid md:grid-cols-2 gap-12 items-center">
              <div>
                <h3 className="text-2xl font-semibold text-[#000031] mb-4">Nuestra Historia</h3>
                <p className="text-gray-700 mb-6">
                  BSK Motorcycle Team nació en 2022 en Bogotá, Colombia, como el sueño de un grupo de motociclistas apasionados por la aventura, la hermandad y el respeto. Desde su fundación, el club se ha caracterizado por organizar rodadas, tours y eventos de formación para fortalecer las habilidades de conducción de sus miembros.
                </p>
                <p className="text-gray-700 mb-6">
                  En su primer año, el club consolidó rutas como el Tour Andino, el Tour de la Tatacoa y el Tour de Navidad, estableciendo así una tradición de recorrer los caminos de Colombia con un espíritu de camaradería. Posteriormente, se creó una estructura organizacional sólida, respaldada por la empresa Organización Motear SAS (OMSAS), y se estableció una filosofía basada en hermandad, espíritu aventurero y respeto mutuo.
                </p>
                <p className="text-gray-700 mb-6">
                  A lo largo de su historia, BSK ha crecido en membresías, actividades y beneficios, manteniéndose fiel a su misión de crear un espacio seguro y divertido para amantes de la motocicleta, con visión de ser un referente en el motociclismo turístico y formativo en Colombia.
                </p>

                <h3 className="text-2xl font-semibold text-[#000031] mb-4 mt-8">Nuestros Valores</h3>
                <ul className="space-y-3">
                  <li className="flex items-start">
                    <span className="text-[#00ff99] mr-2">✔</span>
                    <span className="text-gray-700">Hermandad: Somos una familia de motociclistas, unidos por la confianza, la lealtad y el apoyo mutuo dentro y fuera de la carretera.</span>
                  </li>
                  <li className="flex items-start">
                    <span className="text-[#00ff99] mr-2">✔</span>
                    <span className="text-gray-700">Espíritu: Mantenemos vivo el espíritu aventurero, disfrutando cada ruta con pasión, alegría y la energía que nos impulsa a descubrir nuevos caminos.</span>
                  </li>
                  <li className="flex items-start">
                    <span className="text-[#00ff99] mr-2">✔</span>
                    <span className="text-gray-700">Respeto: Valoramos y cuidamos a cada miembro y a cada comunidad que visitamos, promoviendo la tolerancia, la responsabilidad y la seguridad en todo momento.</span>
                  </li>
                </ul>
              </div>

              <div className="relative h-96 rounded-xl overflow-hidden shadow-2xl">
                <img
                  src="/Banner_Tour_Andino_Motoclub_BSK_Motocycle_Team_2023_Carlos.webp"
                  alt="Miembros De BSK Motorcycle Team"
                  className="w-full h-full object-cover"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-[#000031] to-transparent opacity-70"></div>
                <div className="absolute bottom-0 left-0 p-6 text-white">
                  <p className="text-xl italic">"No es solo un club, es una familia sobre ruedas."</p>
                  <p className="mt-2 font-semibold">- Carlos M., Miembro desde 2022</p>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* Próximos Eventos */}
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
                {loadingEvents ? (
                  <div className="flex justify-center items-center h-64">
                    <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-[#FF0000]"></div>
                  </div>
                ) : errorEvents ? (
                  <div className="text-center py-10">
                    <p className="text-red-400 mb-4">Error al cargar los eventos: {errorEvents}</p>
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
                <div className="calendar-container">
                  {renderHeader()}
                  {renderDays()}
                  {renderCells()}
                </div>
                <div className="mt-4">
                  <h4 className="font-semibold mb-2">Eventos este mes:</h4>
                  {events.filter(event => 
                    isSameMonth(parseISO(event.startDate), currentMonth)
                  ).length > 0 ? (
                    <ul className="space-y-2">
                      {events
                        .filter(event => isSameMonth(parseISO(event.startDate), currentMonth))
                        .sort((a, b) => new Date(a.startDate) - new Date(b.startDate))
                        .map(event => (
                          <li key={event._id} className="flex items-start">
                            <span className="text-[#FF0000] mr-2">•</span>
                            <div>
                              <p className="font-medium">{event.name}</p>
                              <p className="text-sm text-gray-600">
                                {format(parseISO(event.startDate), "EEEE d 'de' MMMM yyyy", { locale: es })}
                              </p>
                            </div>
                          </li>
                        ))}
                    </ul>
                  ) : (
                    <p>No hay eventos programados para este mes</p>
                  )}
                </div>
              </div>
            )}
          </div>
        </section>

        {/* Galería Multimedia */}
        <section className="py-20 px-4 bg-white">
          <div className="max-w-6xl mx-auto">
            <h2 className="text-4xl font-bold text-center text-[#000031] mb-12">
              GALERÍA <span className="text-[#FF0000]">MULTIMEDIA</span>
            </h2>

            <div className="relative mb-8 rounded-xl overflow-hidden shadow-xl group" style={{ aspectRatio: '16/9' }}>
              {/* Imagen principal con transición suave */}
              <div className="relative w-full h-full">
                {galleryImages.map((image, index) => (
                  <img
                    key={image.id}
                    src={image.src}
                    alt={image.alt}
                    className={`absolute inset-0 w-full h-full object-cover transition-opacity duration-1000 ${index === activeGalleryImage ? 'opacity-100' : 'opacity-0'}`}
                    loading="lazy"
                  />
                ))}
              </div>

              {/* Overlay y texto */}
              <div className="absolute inset-0 bg-gradient-to-t from-black to-transparent opacity-50"></div>
              <div className="absolute bottom-0 left-0 p-6 text-white">
                <p className="text-xl">{galleryImages[activeGalleryImage].alt}</p>
              </div>

              {/* Indicadores de posición (puntos) */}
              <div className="absolute bottom-4 left-1/2 transform -translate-x-1/2 flex space-x-2">
                {galleryImages.map((_, index) => (
                  <button
                    key={index}
                    onClick={() => setActiveGalleryImage(index)}
                    className={`w-3 h-3 rounded-full transition-all ${index === activeGalleryImage ? 'bg-[#FF0000] w-6' : 'bg-white bg-opacity-50'}`}
                    aria-label={`Ir a imagen ${index + 1}`}
                  />
                ))}
              </div>
            </div>
          </div>
        </section>

        {/* Beneficios de Ser Miembro */}
        <section className="py-20 px-4 bg-gray-100">
          <div className="max-w-6xl mx-auto">
            <h2 className="text-4xl font-bold text-center text-[#000031] mb-12">
              BENEFICIOS DE <span className="text-[#00FF99]">SER MIEMBRO</span>
            </h2>

            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
              {/* Beneficios Sociales */}
              <div className="bg-white p-6 rounded-xl shadow-lg hover:shadow-xl transition-shadow">
                <div className="flex items-center mb-4">
                  <div className="bg-[#000031] text-white p-3 rounded-full mr-4">
                    <FaUsers className="w-6 h-6" />
                  </div>
                  <h3 className="text-xl font-bold text-[#000031]">Comunidad</h3>
                </div>
                <ul className="space-y-3">
                  <li className="flex items-start">
                    <span className="text-[#00FF99] mr-2">✔</span>
                    <span>Pertenencia a comunidad con intereses comunes</span>
                  </li>
                  <li className="flex items-start">
                    <span className="text-[#00FF99] mr-2">✔</span>
                    <span>Red de apoyo entre motociclistas</span>
                  </li>
                  <li className="flex items-start">
                    <span className="text-[#00FF99] mr-2">✔</span>
                    <span>Amistades duraderas</span>
                  </li>
                  <li className="flex items-start">
                    <span className="text-[#00FF99] mr-2">✔</span>
                    <span>Reuniones y encuentros regulares</span>
                  </li>
                </ul>
              </div>

              {/* Beneficios Técnicos */}
              <div className="bg-white p-6 rounded-xl shadow-lg hover:shadow-xl transition-shadow">
                <div className="flex items-center mb-4">
                  <div className="bg-[#000031] text-white p-3 rounded-full mr-4">
                    <FaTools className="w-6 h-6" />
                  </div>
                  <h3 className="text-xl font-bold text-[#000031]">Asistencia Técnica</h3>
                </div>
                <ul className="space-y-3">
                  <li className="flex items-start">
                    <span className="text-[#00FF99] mr-2">✔</span>
                    <span>Asistencia mecánica básica entre miembros</span>
                  </li>
                  <li className="flex items-start">
                    <span className="text-[#00FF99] mr-2">✔</span>
                    <span>Descuentos en servicios mecánicos</span>
                  </li>
                  <li className="flex items-start">
                    <span className="text-[#00FF99] mr-2">✔</span>
                    <span>Acceso a conocimientos técnicos compartidos</span>
                  </li>
                  <li className="flex items-start">
                    <span className="text-[#00FF99] mr-2">✔</span>
                    <span>Talleres de mantenimiento y seguridad</span>
                  </li>
                </ul>
              </div>

              {/* Beneficios Económicos */}
              <div className="bg-white p-6 rounded-xl shadow-lg hover:shadow-xl transition-shadow">
                <div className="flex items-center mb-4">
                  <div className="bg-[#000031] text-white p-3 rounded-full mr-4">
                    <FaMoneyBillWave className="w-6 h-6" />
                  </div>
                  <h3 className="text-xl font-bold text-[#000031]">Ventajas Económicas</h3>
                </div>
                <ul className="space-y-3">
                  <li className="flex items-start">
                    <span className="text-[#00FF99] mr-2">✔</span>
                    <span>Descuentos en ropa y accesorios</span>
                  </li>
                  <li className="flex items-start">
                    <span className="text-[#00FF99] mr-2">✔</span>
                    <span>Convenios con aseguradoras</span>
                  </li>
                  <li className="flex items-start">
                    <span className="text-[#00FF99] mr-2">✔</span>
                    <span>Beneficios en combustible</span>
                  </li>
                  <li className="flex items-start">
                    <span className="text-[#00FF99] mr-2">✔</span>
                    <span>Compra colectiva con precios reducidos</span>
                  </li>
                </ul>
              </div>

              {/* Beneficios Recreativos */}
              <div className="bg-white p-6 rounded-xl shadow-lg hover:shadow-xl transition-shadow">
                <div className="flex items-center mb-4">
                  <div className="bg-[#000031] text-white p-3 rounded-full mr-4">
                    <FaGlassCheers className="w-6 h-6" />
                  </div>
                  <h3 className="text-xl font-bold text-[#000031]">Actividades Recreativas</h3>
                </div>
                <ul className="space-y-3">
                  <li className="flex items-start">
                    <span className="text-[#00FF99] mr-2">✔</span>
                    <span>Rutas y viajes grupales</span>
                  </li>
                  <li className="flex items-start">
                    <span className="text-[#00FF99] mr-2">✔</span>
                    <span>Acceso preferencial a eventos</span>
                  </li>
                  <li className="flex items-start">
                    <span className="text-[#00FF99] mr-2">✔</span>
                    <span>Celebraciones exclusivas</span>
                  </li>
                  <li className="flex items-start">
                    <span className="text-[#00FF99] mr-2">✔</span>
                    <span>Sorteos y rifas internas</span>
                  </li>
                </ul>
              </div>

              {/* Beneficios Formativos */}
              <div className="bg-white p-6 rounded-xl shadow-lg hover:shadow-xl transition-shadow">
                <div className="flex items-center mb-4">
                  <div className="bg-[#000031] text-white p-3 rounded-full mr-4">
                    <FaGraduationCap className="w-6 h-6" />
                  </div>
                  <h3 className="text-xl font-bold text-[#000031]">Formación</h3>
                </div>
                <ul className="space-y-3">
                  <li className="flex items-start">
                    <span className="text-[#00FF99] mr-2">✔</span>
                    <span>Charlas sobre seguridad vial</span>
                  </li>
                  <li className="flex items-start">
                    <span className="text-[#00FF99] mr-2">✔</span>
                    <span>Conducción defensiva</span>
                  </li>
                  <li className="flex items-start">
                    <span className="text-[#00FF99] mr-2">✔</span>
                    <span>Capacitación para diferentes terrenos</span>
                  </li>
                  <li className="flex items-start">
                    <span className="text-[#00FF99] mr-2">✔</span>
                    <span>Charlas de liderazgo y crecimiento</span>
                  </li>
                </ul>
              </div>

              {/* Beneficios de Seguridad */}
              <div className="bg-white p-6 rounded-xl shadow-lg hover:shadow-xl transition-shadow">
                <div className="flex items-center mb-4">
                  <div className="bg-[#000031] text-white p-3 rounded-full mr-4">
                    <FaShieldAlt className="w-6 h-6" />
                  </div>
                  <h3 className="text-xl font-bold text-[#000031]">Seguridad</h3>
                </div>
                <ul className="space-y-3">
                  <li className="flex items-start">
                    <span className="text-[#00FF99] mr-2">✔</span>
                    <span>Apoyo en carretera en emergencias</span>
                  </li>
                  <li className="flex items-start">
                    <span className="text-[#00FF99] mr-2">✔</span>
                    <span>Sistemas de localización en salidas</span>
                  </li>
                  <li className="flex items-start">
                    <span className="text-[#00FF99] mr-2">✔</span>
                    <span>Protocolos de seguridad para salidas</span>
                  </li>
                  <li className="flex items-start">
                    <span className="text-[#00FF99] mr-2">✔</span>
                    <span>Red de apoyo en viajes largos</span>
                  </li>
                </ul>
              </div>
            </div>

            {/* Testimonios */}
            <div className="mt-16">
              <h3 className="text-2xl font-semibold text-[#000031] mb-8 text-center">TESTIMONIOS DE MIEMBROS</h3>
              <div className="grid md:grid-cols-2 gap-8">
                <div className="bg-white p-8 rounded-xl shadow-lg">
                  <div className="flex items-center mb-6">
                    <img src="/member1.webp" alt="Miembro" className="w-16 h-16 rounded-full mr-6" />
                    <div>
                      <h4 className="text-xl font-bold text-[#000031]">Carlos Méndez</h4>
                      <p className="text-[#00FF99]">Miembro desde 2024</p>
                    </div>
                  </div>
                  <p className="text-gray-700 italic">"La asistencia en carretera que ofrece el club me dio tranquilidad en mi último viaje largo. Saber que tenía apoyo en caso de emergencia hizo toda la diferencia."</p>
                </div>
                <div className="bg-white p-8 rounded-xl shadow-lg">
                  <div className="flex items-center mb-6">
                    <img src="/member2.webp" alt="Miembro" className="w-16 h-16 rounded-full mr-6" />
                    <div>
                      <h4 className="text-xl font-bold text-[#000031]">Laura Torres</h4>
                      <p className="text-[#00FF99]">Miembro desde 2022</p>
                    </div>
                  </div>
                  <p className="text-gray-700 italic">"Los descuentos en repuestos y talleres ya han cubierto el costo de mi membresía varias veces. Además, la comunidad es increíble, he hecho amigos para toda la vida."</p>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* Tienda en Línea */}
        <section className="py-20 px-4 bg-white">
          <div className="max-w-6xl mx-auto">
            <h2 className="text-4xl font-bold text-center text-[#000031] mb-12">
              TIENDA <span className="text-[#FF0000]">EN LÍNEA</span>
            </h2>

            <div className="grid md:grid-cols-3 gap-8">
              {featuredProducts.map(product => (
                <div key={product.id} className="bg-gray-50 rounded-xl overflow-hidden shadow-lg transition-transform hover:scale-105">
                  <div className="relative" style={{ aspectRatio: '1/1' }}>
                    <img
                      src={product.image}
                      alt={product.name}
                      className="w-full h-full object-contain p-4 bg-white"
                    />
                  </div>
                  <div className="p-6">
                    <h3 className="text-xl font-bold text-[#000031] mb-2">{product.name}</h3>
                    <p className="text-2xl font-bold text-[#FF0000] mb-4">${product.price.toFixed(2)}</p>
                    <div className="flex space-x-3">
                      <button className="flex-1 bg-[#000031] hover:bg-[#00FF99] text-white py-2 rounded-full transition duration-300">
                        Comprar
                      </button>
                      <button className="flex-1 bg-white border border-[#000031] text-[#000031] py-2 rounded-full hover:bg-gray-100 transition duration-300">
                        Detalles
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>

            <div className="text-center mt-12">
              <button className="bg-[#FF0000] hover:bg-red-700 text-white font-bold py-3 px-8 rounded-full text-lg transition duration-300 inline-flex items-center">
                Ver todos los productos
                <svg className="w-5 h-5 ml-2" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M14 5l7 7m0 0l-7 7m7-7H3" />
                </svg>
              </button>
            </div>
          </div>
        </section>

        {/* Blog o Noticias */}
        <section className="py-20 px-4 bg-gray-100">
          <div className="max-w-6xl mx-auto">
            <h2 className="text-4xl font-bold text-center text-[#000031] mb-12">
              BLOG & <span className="text-[#00FF99]">NOTICIAS</span>
            </h2>

            <div className="grid md:grid-cols-2 gap-8 mb-12">
              {blogPosts.map(post => (
                <div key={post.id} className="bg-white rounded-xl overflow-hidden shadow-lg hover:shadow-xl transition-shadow">
                  <div className="relative w-full" style={{ aspectRatio: '16/9' }}>
                    <img
                      src={`/${post.title}.webp`}
                      alt={post.title}
                      className="w-full h-full object-cover"
                      loading="lazy"
                    />
                  </div>
                  <div className="p-6">
                    <p className="text-sm text-gray-500 mb-2">{post.date}</p>
                    <h3 className="text-xl font-bold text-[#000031] mb-3">{post.title}</h3>
                    <p className="text-gray-700 mb-4">{post.excerpt}</p>
                    <button className="text-[#FF0000] font-semibold flex items-center hover:underline">
                      Leer más
                      <svg className="w-4 h-4 ml-1" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7m0 0l-7 7m7-7H3" />
                      </svg>
                    </button>
                  </div>
                </div>
              ))}
            </div>

            {/* Preguntas Frecuentes */}
            <div className="bg-white rounded-xl p-8 shadow-lg">
              <h3 className="text-2xl font-bold text-[#000031] mb-6 text-center">PREGUNTAS FRECUENTES</h3>
              <div className="space-y-4">
                <div className="border-b border-gray-200 pb-4">
                  <button className="flex justify-between items-center w-full text-left">
                    <span className="font-semibold text-[#000031]">¿Cómo puedo unirme al club?</span>
                    <svg className="w-5 h-5 text-[#FF0000]" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                    </svg>
                  </button>
                  <div className="mt-2 text-gray-700 hidden">
                    <p>Puedes unirte al club completando el formulario de membresía en nuestra página web y asistiendo a uno de nuestros eventos de bienvenida.</p>
                  </div>
                </div>

                <div className="border-b border-gray-200 pb-4">
                  <button className="flex justify-between items-center w-full text-left">
                    <span className="font-semibold text-[#000031]">¿Qué requisitos hay para ser miembro?</span>
                    <svg className="w-5 h-5 text-[#FF0000]" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                    </svg>
                  </button>
                  <div className="mt-2 text-gray-700 hidden">
                    <p>Los principales requisitos son tener licencia de motociclista vigente, poseer una motocicleta de 250cc o más, y compartir nuestros valores de respeto y seguridad.</p>
                  </div>
                </div>

                <div className="border-b border-gray-200 pb-4">
                  <button className="flex justify-between items-center w-full text-left">
                    <span className="font-semibold text-[#000031]">¿Con qué frecuencia organizan eventos?</span>
                    <svg className="w-5 h-5 text-[#FF0000]" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                    </svg>
                  </button>
                  <div className="mt-2 text-gray-700 hidden">
                    <p>Organizamos al menos un evento mensual, además de salidas espontáneas y encuentros semanales en nuestro clubhouse.</p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>
      </div>
    </>
  );
};

export default Home;