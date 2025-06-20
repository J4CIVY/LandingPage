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
  const [activeFaq, setActiveFaq] = useState(null);
  const [faqFilter, setFaqFilter] = useState('all');

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
    { id: 1, name: 'Camiseta BSK', price: 50000, image: '/Camiseta BSK.webp' },
    { id: 2, name: 'Hoodie BSK', price: 95000, image: '/Hoodie BSK.webp' },
    { id: 3, name: 'Gorra BSK', price: 45000, image: '/Gorra BSK.webp' }
  ];

  const blogPosts = [
    { id: 1, title: 'Consejos para viajes largos en moto', excerpt: 'Aprende cómo prepararte para tus aventuras en carretera...', date: '10 Sept 2023' },
    { id: 2, title: 'Nuevas regulaciones de seguridad', excerpt: 'Los cambios en la normativa que todo motociclista debe conocer...', date: '28 Ago 2023' }
  ];

  // Preguntas frecuentes - Reorganizadas y con 10 nuevas preguntas del Manual Operativo
  const faqQuestions = [
    // Membresías
    {
      q: "¿Qué tipos de membresía ofrece el club?",
      a: "Ofrecemos 5 tipos: Friend (gratuita), Rider ($600,000 anual), Rider Duo (para parejas), Pro ($1,200,000 anual) y Pro Duo. Cada una con beneficios diferentes.",
      category: "membership"
    },
    {
      q: "¿Cuáles son los requisitos para unirse al club?",
      a: "Ser mayor de 18 años, tener licencia de motociclista vigente, poseer una moto en buen estado, alinearse con las políticas del club y comprometerse con el código de ética.",
      category: "membership"
    },
    {
      q: "¿Cómo es el proceso de admisión?",
      a: "Debes completar un formulario, pasar por una entrevista personal y participar en una rodada de prueba donde evaluaremos tu conducta y habilidades.",
      category: "membership"
    },
    {
      q: "¿Hay un período de prueba?",
      a: "Sí, todos los nuevos miembros tienen un período de prueba de 3 meses donde evaluamos su integración al club.",
      category: "membership"
    },
    {
      q: "¿Puedo cambiar de tipo de membresía?",
      a: "Sí, puedes actualizar tu membresía en cualquier momento pagando la diferencia proporcional al tiempo restante.",
      category: "membership"
    },
    {
      q: "¿Qué incluye el kit de bienvenida?",
      a: "Depende de tu membresía: desde un hoodie y calca para Friend, hasta kit de herramientas avanzado y gorra para Pro. Consulta el manual para detalles completos.",
      category: "membership"
    },
    {
      q: "¿Cómo renuevo mi membresía?",
      a: "Recibirás un recordatorio 2 meses antes. Puedes renovar en la web del club actualizando tus datos y realizando el pago correspondiente.",
      category: "membership"
    },
    {
      q: "¿Hay reembolsos por cancelación?",
      a: "Solo en los primeros 14 días (reembolso del 95%) o hasta 30 días (50%). Después no hay reembolsos, excepto casos excepcionales evaluados por el comité.",
      category: "membership"
    },

    // Eventos
    {
      q: "¿Qué tipos de eventos organiza el club?",
      a: "Rodadas (tours largos y cortos), encuentros locales, actividades sociales, eventos especiales como ferias y talleres de capacitación.",
      category: "events"
    },
    {
      q: "¿Cómo me inscribo a los eventos?",
      a: "Para eventos oficiales a través de la web del club. Para no oficiales, sigue las instrucciones de los organizadores una vez aprobados por las directivas.",
      category: "events"
    },
    {
      q: "¿Qué son los gastos operacionales en las rodadas?",
      a: "Incluyen alojamiento, entradas a atracciones, asistencias mecánicas, alimentación y actividades. La gasolina no está incluida.",
      category: "events"
    },
    {
      q: "¿Cómo se calcula mi aporte a gastos operacionales?",
      a: "Friend paga 100%, Rider 50%, y Pro 0% de los gastos operacionales en eventos.",
      category: "events"
    },
    {
      q: "¿Puedo organizar un evento no oficial?",
      a: "Sí, pero debes presentar una solicitud detallada a las directivas para su aprobación y cumplir con todas las normativas del club.",
      category: "events"
    },
    {
      q: "¿Qué normas de seguridad aplican en los eventos?",
      a: "Uso obligatorio de equipo de protección, revisión previa de motos, prohibición de alcohol durante rodadas y seguimiento de protocolos de seguridad.",
      category: "events"
    },

    // Beneficios
    {
      q: "¿Qué beneficios tengo con la membresía Rider?",
      a: "Asistencia técnica en emergencias, indumentaria exclusiva, descuentos en productos y servicios, acceso a eventos especiales y seguro de responsabilidad civil.",
      category: "benefits"
    },
    {
      q: "¿Qué ventajas adicionales tiene la membresía Pro?",
      a: "Además de los beneficios Rider, incluye participación en la dirección del club, asistencia de grúa, indumentaria más exclusiva y mayores descuentos.",
      category: "benefits"
    },
    {
      q: "¿Cómo funciona la asistencia en carretera?",
      a: "Friend recibe ayuda remota, Rider asistencia presencial, y Pro además incluye servicio de grúa. Contacta al módulo de emergencias en la web o WhatsApp oficial.",
      category: "benefits"
    },
    {
      q: "¿Qué descuentos ofrecen en merchandising?",
      a: "Friend 25%, Rider 50% y Pro 75% en línea regular; 15%, 30% y 50% en línea premium; 5%, 10% y 15% en ediciones limitadas.",
      category: "benefits"
    },
    {
      q: "¿Qué seguros incluyen las membresías?",
      a: "Rider, Rider Duo, Pro y Pro Duo incluyen seguro de responsabilidad civil. Otros seguros (todo riesgo, accidentes) son opcionales con costos adicionales.",
      category: "benefits"
    },
    {
      q: "¿Ofrecen asistencia legal?",
      a: "Sí, para miembros Rider y Pro en temas de tránsito, seguros y accidentes, disponible 24/7 a través de los canales oficiales del club.",
      category: "benefits"
    },
    {
      q: "¿Hay beneficios para acompañantes?",
      a: "Las membresías Duo (Rider Duo y Pro Duo) extienden los beneficios a un acompañante con un costo ajustado para ambos.",
      category: "benefits"
    },

    // General
    {
      q: "¿Dónde está ubicado el club?",
      a: "Nuestra sede principal está en Bogotá, Carrera 5 A No. 36 A Sur 28, Ayacucho, San Cristóbal. Teléfono: 3182941684.",
      category: "general"
    },
    {
      q: "¿Cómo se financia el club?",
      a: "Con cuotas de membresía, donaciones, patrocinios, venta de productos y eventos. Todos los recursos son auditados por el comité correspondiente.",
      category: "general"
    },
    {
      q: "¿Quién toma las decisiones en el club?",
      a: "El presidente tiene la última decisión, asesorado por la Junta de Comités compuesta por los directores de todos los comités del club.",
      category: "general"
    },
    {
      q: "¿Qué valores promueve el club?",
      a: "Hermandad, solidaridad, conocimiento, respeto, seguridad y no discriminación por ningún motivo.",
      category: "general"
    },
    {
      q: "¿Cómo es la estructura organizacional?",
      a: "Tenemos comités especializados (Administrativo, Fiscal, Legal, Seguridad, Membresía, Ética, etc.) liderados por directivos elegidos.",
      category: "general"
    },
    {
      q: "¿Qué significa el logo del club?",
      a: "La calavera representa valentía, el casco seguridad, las gafas visión clara, las llaves habilidades mecánicas y los pistones la potencia. Los colores simbolizan lealtad (azul), pasión (rojo) y crecimiento (verde).",
      category: "general"
    },
    {
      q: "¿Cómo puedo contactar al club?",
      a: "Por correo (soporte@bskmt.xyz), web (https://bskmt.xyz), WhatsApp (+573182941684) o visitando nuestra sede en Bogotá.",
      category: "general"
    },
    {
      q: "¿Hay reuniones periódicas?",
      a: "Sí, la Junta de Comités se reúne trimestralmente y el Consejo General Administrativo cuando es convocado por el presidente.",
      category: "general"
    },
    {
      q: "¿Qué hago si tengo un conflicto con otro miembro?",
      a: "Puedes reportarlo al Comité de Ética a través del sistema SER-BSK en la web, que manejará el caso con confidencialidad.",
      category: "general"
    },
    {
      q: "¿Cómo se modifican los estatutos?",
      a: "Las propuestas se presentan por escrito al presidente, son evaluadas por la Junta de Comités y la última decisión la toma el presidente.",
      category: "general"
    },
    {
      q: "¿Puedo usar los emblemas del club?",
      a: "Sí, pero bajo las directrices del Comité de Ética y la comisión de identidad visual. Los emblemas están protegidos por derechos de autor.",
      category: "general"
    },
    {
      q: "¿Qué pasa si incumplo las normas?",
      a: "El Comité de Ética puede aplicar advertencias, suspensión de beneficios o expulsión, dependiendo de la gravedad de la falta.",
      category: "general"
    },
    {
      q: "¿Cómo actualizo mis datos de contacto?",
      a: "Debes actualizarlos semestralmente en la web, app móvil, correo o en persona. Los datos de emergencia antes de cada evento.",
      category: "general"
    },
    {
      q: "¿Hay representación de los miembros?",
      a: "Sí, hay un representante elegido por los miembros que lleva sus inquietudes a las reuniones de directiva.",
      category: "general"
    },
    {
      q: "¿Puedo postularme para un cargo directivo?",
      a: "Sí, los miembros Pro pueden postularse para cargos directivos cumpliendo los requisitos específicos de cada posición.",
      category: "general"
    },
    {
      q: "¿Qué es el Manual de Ética de BSK Motorcycle Team?",
      a: "Es el documento que establece los principios, normativas y lineamientos éticos que rigen la conducta de los miembros del club. Define las expectativas de comportamiento y las consecuencias por incumplimiento.",
      category: "general"
    },
    {
      q: "¿Quién debe cumplir con el Manual de Ética?",
      a: "Todos los miembros del club, independientemente de su antigüedad, posición jerárquica o roles específicos. También aplica a interacciones con actores externos durante eventos del club.",
      category: "general"
    },
    {
      q: "¿Cuáles son los valores fundamentales del club según el Manual de Ética?",
      a: "Respeto y diversidad, integridad, responsabilidad, lealtad y conducta ética en interacciones con otros motociclistas y clubes.",
      category: "general"
    },
    {
      q: "¿Qué responsabilidades tienen los líderes del club según el código ético?",
      a: "Los líderes deben actuar como modelos a seguir, encarnando los valores del club y fomentando una cultura ética desde la cúspide hasta la base.",
      category: "general"
    },
    {
      q: "¿Qué función cumple el Oficial de Cumplimiento Normativo?",
      a: "Asegura que los miembros comprendan y cumplan con los principios éticos. Sus responsabilidades incluyen educación, asesoramiento, monitoreo e investigación de violaciones éticas.",
      category: "general"
    },
    {
      q: "¿Cómo se debe interactuar con otros motociclistas según el código ético?",
      a: "Con respeto y cortesía en la carretera, colaboración con otros clubes, representación ética en eventos y resolución constructiva de conflictos.",
      category: "general"
    },
    {
      q: "¿Qué derechos tienen los miembros según el Manual de Ética?",
      a: "Derecho a ser tratado con dignidad, libre expresión de identidad, protección contra acoso, confidencialidad, participación en decisiones y acceso a recursos educativos.",
      category: "general"
    },
    {
      q: "¿Qué conducta se espera en eventos del club?",
      a: "Participación activa, respeto y cortesía, cumplimiento de normas, representación positiva del club, apoyo mutuo y resolución constructiva de conflictos.",
      category: "events"
    },
    {
      q: "¿Qué normas hay sobre vestimenta e insignias del club?",
      a: "Debe ser adecuada y respetuosa, evitar contenido vulgar, mantener uniformidad en eventos oficiales y usar correctamente las insignias y colores del club.",
      category: "general"
    },
    {
      q: "¿Qué tipos de infracciones éticas existen?",
      a: "Se clasifican en leves (advertencias), moderadas (restricciones temporales), sustanciales (medidas disciplinarias severas) y de mayor gravedad (expulsión).",
      category: "general"
    },
    {
      q: "¿Cómo se reporta una violación al código de ética?",
      a: "A través del Sistema de Ética y Responsabilidad (SER-BSK) disponible en el sitio web del club, que garantiza confidencialidad y protección contra represalias.",
      category: "general"
    },
    {
      q: "¿Qué sucede si reporto una violación ética de buena fe?",
      a: "Tu identidad será protegida y el club no tolerará represalias. El Comité de Ética investigará el caso con confidencialidad.",
      category: "general"
    },
    {
      q: "¿Puedo reportar anónimamente una violación ética?",
      a: "Sí, pero se recomienda identificarse para facilitar la investigación. Los reportes anónimos serán evaluados en función de la seriedad y detalles proporcionados.",
      category: "general"
    },
    {
      q: "¿Qué es una denuncia de mala fe según el código ético?",
      a: "Cuando se realizan acusaciones falsas o engañosas con intención de causar daño. Estas pueden resultar en medidas disciplinarias para quien las presenta.",
      category: "general"
    },
    {
      q: "¿Cómo se investigan las violaciones al código de ética?",
      a: "El Comité de Ética forma un Grupo de Investigación que evalúa pruebas, escucha a las partes involucradas y emite un informe con recomendaciones.",
      category: "general"
    },
    {
      q: "¿Qué derechos tiene un miembro investigado por violación ética?",
      a: "Derecho a defensa, presunción de inocencia, revisión imparcial del caso y acceso a la evidencia presentada en su contra.",
      category: "general"
    },
    {
      q: "¿Qué medidas disciplinarias puede aplicar el club?",
      a: "Desde advertencias formales hasta suspensión temporal o expulsión, dependiendo de la gravedad de la infracción. También hay procesos de rehabilitación.",
      category: "general"
    },
    {
      q: "¿Cómo se actualiza el Manual de Ética?",
      a: "Mediante revisiones periódicas que involucran a los miembros, integrando lecciones aprendidas y adaptándose a necesidades cambiantes del club.",
      category: "general"
    },
    {
      q: "¿Qué responsabilidad social tiene el club según su código ético?",
      a: "Participar en iniciativas benéficas, servicio voluntario, sensibilización en causas sociales y colaboración con organizaciones locales.",
      category: "general"
    },
    {
      q: "¿Cómo se maneja la confidencialidad en procesos éticos?",
      a: "Toda información se maneja con estricta confidencialidad. Solo se comparte con quienes necesitan conocerla para la investigación y resolución del caso.",
      category: "general"
    },

    // Nuevas preguntas basadas en el Manual Operativo Organizacional
    {
      q: "¿Cuál es la estructura organizacional de BSK Motorcycle Team?",
      a: "El club sigue una estructura presidencialista con comités especializados: Auditoría, Ética, Administrativo, Fiscal y Financiero, Legal, Planeación Estratégica, Comunicaciones, Membresía, Capacitación y Tienda/Merchandising.",
      category: "organization"
    },
    {
      q: "¿Cuáles son las responsabilidades del Presidente del club?",
      a: "Liderar y representar al club, tomar decisiones estratégicas, coordinar actividades generales, presidir reuniones, manejar relaciones externas y resolver conflictos internos.",
      category: "organization"
    },
    {
      q: "¿Qué funciones tiene el Comité de Auditoría?",
      a: "Supervisar auditorías internas para garantizar transparencia en la gestión de recursos, evaluar controles internos y proveer asesoría sobre gestión de riesgos y cumplimiento normativo.",
      category: "organization"
    },
    {
      q: "¿Cómo se seleccionan los directivos del club?",
      a: "Mediante un proceso de convocatoria abierta, nominación, presentación de candidaturas, campaña, debates públicos y votación secreta supervisada por un Comité Electoral.",
      category: "organization"
    },
    {
      q: "¿Cuáles son los requisitos para ser director de un comité?",
      a: "Ser miembro activo con al menos 5 años de antigüedad, demostrar compromiso, tener experiencia relevante, habilidades de liderazgo y disponibilidad para el cargo.",
      category: "organization"
    },
    {
      q: "¿Cuánto dura el mandato de los directivos?",
      a: "Los directores y subdirectores sirven por períodos de 2 años, con posibilidad de reelección o redesignación, sujetos a evaluación anual de desempeño.",
      category: "organization"
    },
    {
      q: "¿Qué sucede si un directivo no cumple con sus responsabilidades?",
      a: "Puede ser removido por incumplimiento, violación al código de ética, desempeño insatisfactorio o acciones que perjudiquen al club, mediante votación de la directiva y aprobación de los miembros.",
      category: "organization"
    },
    {
      q: "¿Cómo se actualiza el Manual Operativo del club?",
      a: "Se revisa anualmente por un Comité de Revisión que recopila sugerencias de miembros, evalúa cambios y presenta recomendaciones para aprobación por la directiva.",
      category: "organization"
    },
    {
      q: "¿Qué función tiene el Comité de Capacitación?",
      a: "Diseñar e implementar programas de formación en seguridad vial, primeros auxilios y mecánica básica de motos para miembros, fomentando una cultura de aprendizaje continuo.",
      category: "organization"
    },
    {
      q: "¿Cómo se gestiona la comunicación interna en el club?",
      a: "El Comité de Comunicaciones facilita canales efectivos como boletines informativos, plataformas digitales y reuniones periódicas para mantener informados a todos los miembros.",
      category: "organization"
    }
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

  const toggleFaq = (index) => {
    setActiveFaq(activeFaq === index ? null : index);
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

            {/* Preguntas Frecuentes - Versión Mejorada */}
            <div className="bg-white rounded-xl p-8 shadow-lg">
              <h3 className="text-2xl font-bold text-[#000031] mb-6 text-center">PREGUNTAS FRECUENTES</h3>
              
              {/* Filtros por categoría */}
              <div className="flex flex-wrap justify-center gap-2 mb-6">
                <button 
                  className={`px-4 py-2 rounded-full text-sm ${faqFilter === 'all' ? 'bg-[#000031] text-white' : 'bg-gray-200 text-[#000031] hover:bg-gray-300'}`}
                  onClick={() => setFaqFilter('all')}
                >
                  Todas
                </button>
                <button 
                  className={`px-4 py-2 rounded-full text-sm ${faqFilter === 'membership' ? 'bg-[#000031] text-white' : 'bg-gray-200 text-[#000031] hover:bg-gray-300'}`}
                  onClick={() => setFaqFilter('membership')}
                >
                  Membresías
                </button>
                <button 
                  className={`px-4 py-2 rounded-full text-sm ${faqFilter === 'events' ? 'bg-[#000031] text-white' : 'bg-gray-200 text-[#000031] hover:bg-gray-300'}`}
                  onClick={() => setFaqFilter('events')}
                >
                  Eventos
                </button>
                <button 
                  className={`px-4 py-2 rounded-full text-sm ${faqFilter === 'benefits' ? 'bg-[#000031] text-white' : 'bg-gray-200 text-[#000031] hover:bg-gray-300'}`}
                  onClick={() => setFaqFilter('benefits')}
                >
                  Beneficios
                </button>
                <button 
                  className={`px-4 py-2 rounded-full text-sm ${faqFilter === 'general' ? 'bg-[#000031] text-white' : 'bg-gray-200 text-[#000031] hover:bg-gray-300'}`}
                  onClick={() => setFaqFilter('general')}
                >
                  General
                </button>
                <button 
                  className={`px-4 py-2 rounded-full text-sm ${faqFilter === 'organization' ? 'bg-[#000031] text-white' : 'bg-gray-200 text-[#000031] hover:bg-gray-300'}`}
                  onClick={() => setFaqFilter('organization')}
                >
                  Organización
                </button>
              </div>

              {/* Sistema de acordeón */}
              <div className="space-y-3 max-h-[500px] overflow-y-auto pr-2">
                {faqQuestions.filter(q => faqFilter === 'all' || q.category === faqFilter).map((question, index) => (
                  <div key={index} className="border-b border-gray-200 pb-3">
                    <button 
                      className="flex justify-between items-center w-full text-left py-2"
                      onClick={() => toggleFaq(index)}
                    >
                      <span className="font-semibold text-[#000031] text-sm md:text-base">{question.q}</span>
                      <svg 
                        className={`w-5 h-5 text-[#FF0000] transition-transform ${activeFaq === index ? 'rotate-180' : ''}`}
                        fill="none" 
                        stroke="currentColor" 
                        viewBox="0 0 24 24" 
                        xmlns="http://www.w3.org/2000/svg"
                      >
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                      </svg>
                    </button>
                    <div className={`mt-1 text-gray-700 text-sm md:text-base ${activeFaq === index ? 'block' : 'hidden'}`}>
                      <p>{question.a}</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </section>
      </div>
    </>
  );
};

export default Home;