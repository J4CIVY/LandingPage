'use client';

import React, { useState, useMemo } from "react";
import { FAQQuestion } from '@/types'; // Import the FAQQuestion interface
const FAQSection: React.FC = () => {
  const [activeFaq, setActiveFaq] = useState<number | null>(null);
  const [faqFilter, setFaqFilter] = useState<'all' | 'membership' | 'events' | 'benefits' | 'general' | 'organization'>('all');

  const faqQuestions: FAQQuestion[] = useMemo(() => [
    // Membresías
    {
      q: "¿Qué tipos de membresía ofrece el club?",
      a: "Ofrecemos 3 tipos: Amigo (gratuita), Piloto ($600,000 anual), y Profesional ($1,200,000 anual). Cada una con beneficios diferentes según tu nivel de compromiso con la comunidad.",
      category: "membership"
    },
    {
      q: "¿Cuáles son los requisitos para unirse a la comunidad?",
      a: "Ser mayor de 18 años, tener licencia de motociclista vigente, poseer una moto en buen estado, alinearse con nuestros valores de comunidad, espíritu y respeto, y comprometerse con nuestro código de ética.",
      category: "membership"
    },
    {
      q: "¿Cómo es el proceso de admisión?",
      a: "Completas un formulario, pasas por una charla personal con la directiva y participas en una rodada de integración donde conocerás a tus futuros compañeros y evaluaremos la química grupal.",
      category: "membership"
    },
    {
      q: "¿Hay un período de prueba?",
      a: "Sí, todos los nuevos miembros tienen un período de integración de 3 meses donde tanto tú como nosotros evaluamos si hay buena química y afinidad con la comunidad.",
      category: "membership"
    },
    {
      q: "¿Puedo cambiar de tipo de membresía?",
      a: "Por supuesto. Puedes evolucionar en tu membresía en cualquier momento pagando la diferencia proporcional. Muchos miembros comienzan como Amigos y luego se vuelven Profesionales.",
      category: "membership"
    },
    {
      q: "¿Qué incluye el kit de bienvenida?",
      a: "Depende de tu membresía: desde hoodie y calca para Amigo, hasta kit de herramientas avanzado y gorra para Profesional. Todos reciben nuestra bienvenida oficial a la comunidad.",
      category: "membership"
    },
    {
      q: "¿Cómo renuevo mi membresía?",
      a: "Te contactamos 2 meses antes del vencimiento. Puedes renovar fácilmente a través de nuestra web actualizando tus datos y realizando el pago. ¡Queremos que sigas siendo parte de la familia!",
      category: "membership"
    },
    {
      q: "¿Hay reembolsos por cancelación?",
      a: "Entendemos que las circunstancias cambian. Ofrecemos reembolso del 95% en los primeros 14 días, y del 50% hasta 30 días. Después evaluamos cada caso de manera personal.",
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
      a: "Los miembros Amigo cubren el costo completo de alojamiento y actividades, los Piloto pagan solo la mitad, y los Profesionales disfrutan de eventos sin costo adicional.",
      category: "events"
    },
    {
      q: "¿Puedo organizar una rodada con los miembros?",
      a: "¡Por supuesto! Presentas tu idea a la directiva con detalles de ruta, fechas y logística. Nos encanta que los miembros tomen iniciativa para crear nuevas aventuras.",
      category: "events"
    },
    {
      q: "¿Qué normas de seguridad aplican en nuestras rodadas?",
      a: "Equipo de protección obligatorio, revisión previa del fierro, cero alcohol durante rodadas y seguimiento estricto de nuestros protocolos de comunidad segura.",
      category: "events"
    },
    {
      q: "¿Qué se espera de un miembro en eventos?",
      a: "Participación con buena energía, respeto hacia todos, apoyo mutuo en la ruta, y representar con orgullo los valores de BSK dondequiera que vayamos.",
      category: "events"
    },

    // Beneficios
    {
      q: "¿Qué beneficios tengo con la membresía Piloto?",
      a: "Asistencia técnica cuando la necesites, indumentaria exclusiva de miembro, hasta 50% de descuento en productos y servicios, eventos especiales y seguro de responsabilidad civil.",
      category: "benefits"
    },
    {
      q: "¿Qué ventajas adicionales tiene la membresía Profesional?",
      a: "Además de todo lo de Piloto, tienes voz en las decisiones del club, asistencia de grúa incluida, indumentaria premium y hasta 75% de descuento en todo.",
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

    // General & Organization
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
      a: "Comunidad, solidaridad, conocimiento, respeto, seguridad y no discriminación por ningún motivo.",
      category: "general"
    },
    {
      q: "¿Cómo es la estructura organizacional?",
      a: "Tenemos comités especializados (Administrativo, Fiscal, Legal, Seguridad, Membresía, Ética, etc.) liderados por directivos elegidos.",
      category: "organization" // Changed category to 'organization'
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
      category: "organization" // Changed category to 'organization'
    },
    {
      q: "¿Qué hago si tengo un conflicto con otro miembro?",
      a: "Puedes reportarlo al Comité de Ética a través del sistema SER-BSK en la web, que manejará el caso con confidencialidad.",
      category: "general"
    },
    {
      q: "¿Cómo se modifican los estatutos?",
      a: "Las propuestas se presentan por escrito al presidente, son evaluadas por la Junta de Comités y la última decisión la toma el presidente.",
      category: "organization" // Changed category to 'organization'
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
      category: "organization" // Changed category to 'organization'
    },
    {
      q: "¿Puedo postularme para un cargo directivo?",
      a: "Sí, los miembros Pro pueden postularse para cargos directivos cumpliendo los requisitos específicos de cada posición.",
      category: "organization" // Changed category to 'organization'
    },
    {
      q: "¿Qué es el Manual de Ética de BSK Motorcycle Team?",
      a: "Es el documento que establece los principios, normativas y lineamientos éticos que rigen la conducta de los miembros del club. Define las expectativas de comportamiento y las consecuencias por incumplimiento.",
      category: "organization" // Changed category to 'organization'
    },
    {
      q: "¿Quién debe cumplir con el Manual de Ética?",
      a: "Todos los miembros del club, independientemente de su antigüedad, posición jerárquica o roles específicos. También aplica a interacciones con actores externos durante eventos del club.",
      category: "organization" // Changed category to 'organization'
    },
    {
      q: "¿Cuáles son los valores fundamentales del club según el Manual de Ética?",
      a: "Respeto y diversidad, integridad, responsabilidad, lealtad y conducta ética en interacciones con otros motociclistas y clubes.",
      category: "organization" // Changed category to 'organization'
    },
    {
      q: "¿Qué responsabilidades tienen los líderes del club según el código ético?",
      a: "Los líderes deben actuar como modelos a seguir, encarnando los valores del club y fomentando una cultura ética desde la cúspide hasta la base.",
      category: "organization" // Changed category to 'organization'
    },
    {
      q: "¿Qué función cumple el Oficial de Cumplimiento Normativo?",
      a: "Asegura que los miembros comprendan y cumplan con los principios éticos. Sus responsabilidades incluyen educación, asesoramiento, monitoreo e investigación de violaciones éticas.",
      category: "organization" // Changed category to 'organization'
    },
    {
      q: "¿Cómo se debe interactuar con otros motociclistas según el código ético?",
      a: "Con respeto y cortesía en la carretera, colaboración con otros clubes, representación ética en eventos y resolución constructiva de conflictos.",
      category: "general"
    },
    {
      q: "¿Qué derechos tienen los miembros según el Manual de Ética?",
      a: "Derecho a ser tratado con dignidad, libre expresión de identidad, protección contra acoso, confidencialidad, participación en decisiones y acceso a recursos educativos.",
      category: "organization" // Changed category to 'organization'
    },
    {
      q: "¿Qué normas hay sobre vestimenta e insignias del club?",
      a: "Debe ser adecuada y respetuosa, evitar contenido vulgar, mantener uniformidad en eventos oficiales y usar correctamente las insignias y colores del club.",
      category: "general"
    },
    {
      q: "¿Qué tipos de infracciones éticas existen?",
      a: "Se clasifican en leves (advertencias), moderadas (restricciones temporales), sustanciales (medidas disciplinarias severas) y de mayor gravedad (expulsión).",
      category: "organization" // Changed category to 'organization'
    },
    {
      q: "¿Cómo se reporta una violación al código de ética?",
      a: "A través del Sistema de Ética y Responsabilidad (SER-BSK) disponible en el sitio web del club, que garantiza confidencialidad y protección contra represalias.",
      category: "organization" // Changed category to 'organization'
    },
    {
      q: "¿Qué sucede si reporto una violación ética de buena fe?",
      a: "Tu identidad será protegida y el club no tolerará represalias. El Comité de Ética investigará el caso con confidencialidad.",
      category: "organization" // Changed category to 'organization'
    },
    {
      q: "¿Puedo reportar anónimamente una violación ética?",
      a: "Sí, pero se recomienda identificarse para facilitar la investigación. Los reportes anónimos serán evaluados en función de la seriedad y detalles proporcionados.",
      category: "organization" // Changed category to 'organization'
    },
    {
      q: "¿Qué es una denuncia de mala fe según el código ético?",
      a: "Cuando se realizan acusaciones falsas o engañosas con intención de causar daño. Estas pueden resultar en medidas disciplinarias para quien las presenta.",
      category: "organization" // Changed category to 'organization'
    },
    {
      q: "¿Cómo se investigan las violaciones al código de ética?",
      a: "El Comité de Ética forma un Grupo de Investigación que evalúa pruebas, escucha a las partes involucradas y emite un informe con recomendaciones.",
      category: "organization" // Changed category to 'organization'
    },
    {
      q: "¿Qué derechos tiene un miembro investigado por violación ética?",
      a: "Derecho a defensa, presunción de inocencia, revisión imparcial del caso y acceso a la evidencia presentada en su contra.",
      category: "organization" // Changed category to 'organization'
    },
    {
      q: "¿Qué medidas disciplinarias puede aplicar el club?",
      a: "Desde advertencias formales hasta suspensión temporal o expulsión, dependiendo de la gravedad de la infracción. También hay procesos de rehabilitación.",
      category: "organization" // Changed category to 'organization'
    },
    {
      q: "¿Cómo se actualiza el Manual de Ética?",
      a: "Mediante revisiones periódicas que involucran a los miembros, integrando lecciones aprendidas y adaptándose a necesidades cambiantes del club.",
      category: "organization" // Changed category to 'organization'
    },
    {
      q: "¿Qué responsabilidad social tiene el club según su código ético?",
      a: "Participar en iniciativas benéficas, servicio voluntario, sensibilización en causas sociales y colaboración con organizaciones locales.",
      category: "organization" // Changed category to 'organization'
    },
    {
      q: "¿Cómo se maneja la confidencialidad en procesos éticos?",
      a: "Toda información se maneja con estricta confidencialidad. Solo se comparte con quienes necesitan conocerla para la investigación y resolución del caso.",
      category: "organization" // Changed category to 'organization'
    },
  ], []); // Memoize faqQuestions to prevent re-creation on every render

  /**
   * Toggles the active state of an FAQ item.
   * @param {number} index - The index of the FAQ item to toggle.
   */
  const toggleFaq = (index: number): void => {
    setActiveFaq(activeFaq === index ? null : index);
  };

  // Filtered questions based on the active filter
  const filteredQuestions: FAQQuestion[] = useMemo(() => {
    return faqQuestions.filter((q: FAQQuestion) => faqFilter === 'all' || q.category === faqFilter);
  }, [faqQuestions, faqFilter]); // Memoize filteredQuestions

  return (
    <div className="bg-white dark:bg-slate-950 rounded-xl p-8 shadow-lg text-slate-950 dark:text-white">
      <h3 className="text-2xl font-bold text-slate-950 dark:text-white mb-6 text-center">
        PREGUNTAS FRECUENTES
      </h3>
      
      <div className="flex flex-wrap justify-center gap-2 mb-6">
        {/* Filter buttons */}
        {['all', 'membership', 'events', 'benefits', 'general', 'organization'].map((filter, index) => (
          <button
            key={filter}
            onClick={() => setFaqFilter(filter as 'all' | 'membership' | 'events' | 'benefits' | 'general' | 'organization')}
            className={`px-4 py-2 rounded-full text-sm transition-colors ${faqFilter === filter ? 'bg-slate-950 text-white dark:bg-red-600' : 'bg-gray-200 text-slate-950 hover:bg-gray-300 dark:bg-slate-900 dark:text-gray-300 dark:hover:bg-slate-800'}`}
            aria-pressed={faqFilter === filter} // ARIA attribute for toggle buttons
          >
            {filter === 'all' && 'Todas'}
            {filter === 'membership' && 'Membresías'}
            {filter === 'events' && 'Eventos'}
            {filter === 'benefits' && 'Beneficios'}
            {filter === 'general' && 'General'}
            {filter === 'organization' && 'Organización'}
          </button>
        ))}
      </div>

      <div className="space-y-3 max-h-[500px] overflow-y-auto pr-2 custom-scrollbar">
        {filteredQuestions.length > 0 ? (
          filteredQuestions.map((question: FAQQuestion, index: number) => (
            <div key={index} className="border-b border-gray-200 dark:border-gray-700 pb-3">
              <button 
                className="flex justify-between items-center w-full text-left py-2"
                onClick={() => toggleFaq(index)}
                aria-expanded={activeFaq === index} // ARIA attribute for accordion state
                aria-controls={`faq-answer-${index}`} // Links button to its answer
                id={`faq-question-${index}`} // Unique ID for the question button
              >
                <span className="font-semibold text-slate-950 dark:text-white text-sm md:text-base">{question.q}</span>
                <svg 
                  className={`w-5 h-5 text-red-600 transition-transform ${activeFaq === index ? 'rotate-180' : ''}`}
                  fill="none" 
                  stroke="currentColor" 
                  viewBox="0 0 24 24"
                >
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                </svg>
              </button>
              <div 
                id={`faq-answer-${index}`}
                className={`overflow-hidden transition-all duration-300 ease-in-out ${activeFaq === index ? 'max-h-screen' : 'max-h-0'}`}
                role="region" // ARIA role for the answer panel
                aria-labelledby={`faq-question-${index}`} // Links answer to its question
              >
                <p className="pt-2 text-gray-700 dark:text-gray-300 text-sm md:text-base">{question.a}</p>
              </div>
            </div>
          ))
        ) : (
          <p className="text-center text-gray-500 dark:text-gray-400">No se encontraron preguntas en esta categoría.</p>
        )}
      </div>
    </div>
  );
};

export default FAQSection;

