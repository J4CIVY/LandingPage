/**
 * ✅ SEO OPTIMIZATION: Converted to Server Component
 * Contact page now renders static content server-side for better SEO
 * 
 * BENEFITS:
 * - Contact information rendered server-side (search engines see immediately)
 * - Faster initial page load
 * - Better Core Web Vitals scores
 * - Structured data (breadcrumbs, FAQ) generated server-side
 * - Interactive forms still work client-side via ContactTabs component
 */

import React from "react";
import SEOComponent from '@/components/home/SEOComponent';
import { generateBreadcrumb, generateFAQ } from '@/lib/seo-config';
import ContactTabs from '@/components/shared/ContactTabs';

// Static contact information (server-side data)
const contactInfo = {
  address: 'Carrera 5 A No. 36 A Sur 28, \n110431, Ayacucho, San Cristóbal, Bogotá, Colombia',
  phone: '300 490 2449',
  email: 'contacto@bskmt.com',
  hours: {
    administrative: 'Lunes a Viernes: 8:00 AM - 5:00 PM\nSábados: 8:00 AM - 1:00 PM',
    operative: '24/7 todos los días'
  }
};

const Contact: React.FC = () => {
  // ✅ Server Component: Structured data generated on server
  const breadcrumbData = generateBreadcrumb([
    { name: 'Inicio', url: 'https://bskmt.com' },
    { name: 'Contacto', url: 'https://bskmt.com/contact' }
  ]);

  const faqData = generateFAQ([
    {
      question: '¿Cuál es el horario de atención de BSK Motorcycle Team?',
      answer: 'Nuestro horario de atención es de lunes a domingo de 8:00 AM a 8:00 PM.'
    },
    {
      question: '¿Cómo puedo presentar una denuncia de forma anónima?',
      answer: 'Puedes utilizar nuestro formulario de denuncias y activar la opción de denuncia anónima para proteger tu identidad.'
    },
    {
      question: '¿Qué es PQRSDF?',
      answer: 'PQRSDF significa Peticiones, Quejas, Reclamos, Sugerencias, Denuncias y Felicitaciones. Es un canal oficial para comunicarte con nosotros.'
    },
    {
      question: '¿Cuánto tiempo tarda la respuesta a mi solicitud?',
      answer: 'Nos comprometemos a responder todas las solicitudes en un plazo máximo de 15 días hábiles.'
    }
  ]);

  return (
    <>
      <SEOComponent 
        title="Contacto BSK Motorcycle Team | Motoclub en Bogotá, Colombia"
        description="📞 Contacto del mejor motoclub de Colombia: Tel. +57 300 490 2449 | 📧 contacto@bskmt.com | 📍 Carrera 5 A No. 36 A Sur 28, Bogotá. Horario de atención: Lun-Vie 8:00-17:00, Sáb 8:00-13:00. Formulario de contacto, sistema PQRSDF y denuncias anónimas disponibles. ¡Comunícate con el club de motos líder en Colombia!"
        canonical="https://bskmt.com/contact"
        url="https://bskmt.com/contact"
        image="https://res.cloudinary.com/dz0peilmu/image/upload/f_auto,q_auto:best,w_1200,h_630/BSK_Contact_Hero.jpg"
        keywords="contacto bsk motorcycle team, teléfono motoclub bogotá, contacto club de motos colombia, dirección bsk mt, email motoclub bogotá, pqrsdf bsk, denuncias motoclub, formulario contacto motoclub, ubicación club motos bogotá, horario atención bsk, contacto comunidad motera colombia"
        type="website"
        structuredData={[breadcrumbData, faqData]}
      />
      
      <main className="min-h-screen bg-gray-50 dark:bg-slate-900 py-16">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <h1 className="text-4xl font-bold text-slate-950 dark:text-white mb-4">
              Contáctanos - BSK Motorcycle Team
            </h1>
            <p className="text-lg text-gray-600 dark:text-gray-400">
              Estamos aquí para ayudarte. Comunícate con el motoclub líder en Colombia. Elige la opción que mejor se adapte a tu consulta o necesidad.
            </p>
          </div>

          {/* ✅ Client Component handles all interactivity */}
          <ContactTabs contactInfo={contactInfo} />
        </div>
      </main>
    </>
  );
};

export default Contact;
