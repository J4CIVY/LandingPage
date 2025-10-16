'use client';

import React from "react";
import { FaMotorcycle, FaShieldAlt, FaRocket, FaCheck, FaRoute, FaPhone, FaCalendarAlt } from "react-icons/fa";
import { GiSteeringWheel, GiMechanicGarage } from "react-icons/gi";
import SEOComponent from '@/components/home/SEOComponent';
import { generateBreadcrumb, generateCourseSchema, generateFAQ } from '@/lib/seo-config';
/**
 * @typedef {Object} Course
 * @property {number} id - Unique identifier for the course.
 * @property {string} title - Title of the course.
 * @property {string} description - Short description of the course.
 * @property {string} duration - Duration of the course.
 * @property {string} price - Price of the course.
 * @property {string[]} includes - List of items included in the course.
 * @property {React.ReactElement} icon - React icon component for the course.
 */
interface Course {
  id: number;
  title: string;
  description: string;
  duration: string;
  price: string;
  includes: string[];
  icon: React.ReactElement;
}

/**
 * @typedef {Object} Testimonial
 * @property {string} name - Name of the person giving the testimonial.
 * @property {string} role - Role or description of the person.
 * @property {string} quote - The testimonial quote.
 * @property {React.ReactElement} icon - React icon component for the testimonial.
 */
interface Testimonial {
  name: string;
  role: string;
  quote: string;
  icon: React.ReactElement;
}

/**
 * Courses component displays information about various motorcycle courses offered.
 * It includes course details, testimonials, and calls to action.
 * @returns {React.ReactElement}
 */
const Courses: React.FC = () => {
  const courses: Course[] = [
    {
      id: 1,
      title: "Curso Básico de Pilotaje",
      description: "Aprende los fundamentos para manejar tu fierro con seguridad",
      duration: "8 horas",
      price: "$250.000",
      includes: [
        "Técnicas básicas de frenado",
        "Control de balanceo y estabilidad",
        "Manejo seguro en curvas",
        "Certificado de participación"
      ],
      icon: <GiSteeringWheel className="w-20 h-20 text-green-400" aria-hidden="true" />
    },
    {
      id: 2,
      title: "Pilotaje Defensivo Avanzado",
      description: "Técnicas profesionales para situaciones de riesgo en carretera",
      duration: "12 horas",
      price: "$380.000",
      includes: [
        "Frenado de emergencia",
        "Esquivado de obstáculos",
        "Manejo en vía mojada",
        "Certificación internacional"
      ],
      icon: <FaShieldAlt className="w-20 h-20 text-green-400" aria-hidden="true" />
    },
    {
      id: 3,
      title: "Taller de Mantenimiento del Fierro",
      description: "Aprende a cuidar tu moto como un verdadero motero",
      duration: "6 horas",
      price: "$180.000",
      includes: [
        "Cambio de aceite y filtros",
        "Ajuste y lubricación de cadena",
        "Revisión completa de frenos",
        "Kit de herramientas básico incluido"
      ],
      icon: <GiMechanicGarage className="w-20 h-20 text-green-400" aria-hidden="true" />
    },
    {
      id: 4,
      title: "Rodadas Grupales Seguras",
      description: "Aprende las técnicas para rodar en comunidad",
      duration: "1 día completo",
      price: "$150.000",
      includes: [
        "Comunicación entre miembros en ruta",
        "Formaciones seguras de grupo",
        "Señales manuales estandarizadas",
        "Guía de ruta incluido"
      ],
      icon: <FaRoute className="w-20 h-20 text-green-400" aria-hidden="true" />
    }
  ];

  const testimonials: Testimonial[] = [
    {
      name: "Carlos Rodríguez",
      role: "Piloto desde 2020",
      quote: "El curso avanzado me salvó la vida en una situación real de frenado de emergencia",
      icon: <FaRocket className="text-4xl mb-4 text-green-400" aria-hidden="true" />
    },
    {
      name: "María González",
      role: "Nueva motociclista",
      quote: "Nunca imaginé que podía aprender tanto sobre mi moto en el taller de mantenimiento",
      icon: <FaMotorcycle className="text-4xl mb-4 text-green-400" aria-hidden="true" />
    },
    {
      name: "Andrés Pérez",
      role: "Miembro BSK",
      quote: "Las rutas grupales ahora son más seguras y organizadas gracias a lo aprendido",
      icon: <FaShieldAlt className="text-4xl mb-4 text-green-400" aria-hidden="true" />
    }
  ];

  // Breadcrumb structured data
  const breadcrumbData = generateBreadcrumb([
    { name: 'Inicio', url: 'https://bskmt.com' },
    { name: 'Cursos', url: 'https://bskmt.com/courses' }
  ]);

  // FAQ structured data
  const faqData = generateFAQ([
    {
      question: '¿Cuánto duran los cursos de motociclismo?',
      answer: 'Los cursos varían en duración: el curso básico dura 8 horas, el avanzado 12 horas, el taller de mantenimiento 6 horas, y las rodadas grupales son de 1 día completo.'
    },
    {
      question: '¿Los cursos incluyen certificación?',
      answer: 'Sí, todos nuestros cursos incluyen certificado de participación. Los cursos avanzados incluyen certificación internacional.'
    },
    {
      question: '¿Necesito experiencia previa para tomar los cursos?',
      answer: 'El curso básico no requiere experiencia previa. Para el curso avanzado se recomienda tener experiencia básica en motociclismo.'
    },
    {
      question: '¿Dónde se realizan los cursos?',
      answer: 'Los cursos se realizan en nuestras instalaciones en Bogotá, Colombia, con espacios especialmente diseñados para práctica segura.'
    }
  ]);

  // Course list structured data
  const coursesListData = {
    '@context': 'https://schema.org',
    '@type': 'ItemList',
    itemListElement: courses.map((course, index) => ({
      '@type': 'ListItem',
      position: index + 1,
      item: generateCourseSchema({
        name: course.title,
        description: course.description,
        provider: 'BSK Motorcycle Team',
        price: parseInt(course.price.replace(/[^0-9]/g, '')),
        duration: course.duration
      })
    }))
  };

  return (
    <>
      <SEOComponent
        title="Cursos de Motociclismo | Pilotaje, Mantenimiento y Seguridad Vial"
        description="🏍️ Cursos profesionales de BSK Motorcycle Team: Pilotaje básico, pilotaje defensivo avanzado, mantenimiento de motocicletas, rodadas grupales seguras. Aprende de los expertos y mejora tus habilidades en moto. Certificación incluida."
        canonical="https://bskmt.com/courses"
        url="https://bskmt.com/courses"
        image="https://res.cloudinary.com/dz0peilmu/image/upload/f_auto,q_auto:best,w_1200,h_630/BSK_Courses_Hero.jpg"
        keywords="cursos motociclismo colombia, curso pilotaje moto bogotá, escuela motociclismo, cursos conducción moto, curso mantenimiento motos, pilotaje defensivo, cursos bsk mt, certificación motociclismo, talleres motos bogotá"
        type="website"
        structuredData={[breadcrumbData, faqData, coursesListData]}
      />
      
    <div className="min-h-screen bg-white dark:bg-slate-950">
      {/* Hero Section */}
      <section className="bg-white dark:bg-slate-950 text-slate-950 dark:text-white py-16 px-4 md:px-20">
        <div className="max-w-7xl mx-auto text-center">
          <h1 className="text-4xl md:text-6xl font-bold mb-6">
            Ready To Ride + BSK Motorcycle Team
          </h1>
          <a
            href="#inscripciones"
            className="inline-flex items-center bg-slate-950 dark:bg-white text-white dark:text-slate-950 font-bold py-3 px-8 rounded-xl hover:bg-gray-800 dark:hover:bg-gray-200 text-lg"
            aria-label="Inscríbete ahora en nuestros cursos"
          >
            <FaCalendarAlt className="mr-2" aria-hidden="true" />
            ¡Inscríbete Ahora!
          </a>
        </div>
      </section>

      {/* Featured Courses */}
      <section className="py-16 px-4 md:px-8 max-w-7xl mx-auto bg-gray-white dark:bg-slate-950">
        <div className="text-center mb-16">
          <h2 className="text-3xl font-bold text-slate-950 dark:text-white mb-4">
            Nuestros Cursos
          </h2>
          <p className="text-lg text-gray-600 dark:text-gray-400 max-w-2xl mx-auto">
            Programas diseñados por expertos para todos los niveles
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
          {courses.map((course) => (
            <div key={course.id} className="bg-white dark:bg-slate-800 rounded-xl shadow-lg overflow-hidden hover:shadow-xl transition-shadow border border-gray-100 dark:border-slate-700">
              <div className="h-48 bg-slate-950 dark:bg-slate-900 flex items-center justify-center">
                {course.icon}
              </div>
              <div className="p-6">
                <h3 className="text-xl font-bold text-slate-950 dark:text-white mb-2">{course.title}</h3>
                <p className="text-gray-600 dark:text-gray-400 mb-4">{course.description}</p>
                <div className="flex justify-between items-center mb-4">
                  <span className="text-sm font-medium text-gray-500 dark:text-gray-400">{course.duration}</span>
                  <span className="text-lg font-bold text-slate-950 dark:text-white">{course.price}</span>
                </div>
                <ul className="space-y-2">
                  {course.includes.map((item, index) => (
                    <li key={index} className="flex items-start">
                      <FaCheck className="w-5 h-5 text-green-400 mr-2 mt-0.5" aria-hidden="true" />
                      <span className="text-gray-700 dark:text-gray-300">{item}</span>
                    </li>
                  ))}
                </ul>
                <button 
                  className="mt-6 w-full bg-slate-950 dark:bg-green-500 text-white dark:text-white py-2 px-4 rounded-lg hover:bg-opacity-90 dark:hover:bg-green-600"
                  aria-label={`Más información sobre ${course.title}`}
                >
                  Más Información
                </button>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* Testimonials */}
      <section className="bg-gray-white dark:bg-slate-950 py-16 px-4 md:px-20">
        <div className="max-w-7xl mx-auto">
          <h2 className="text-3xl font-bold text-slate-950 dark:text-white mb-12 text-center">Testimonios de Alumnos</h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {testimonials.map((testimonial, index) => (
              <div key={index} className="bg-white dark:bg-slate-800 p-6 rounded-xl shadow-md border border-gray-100 dark:border-slate-700">
                {testimonial.icon}
                <p className="text-gray-600 dark:text-gray-300 italic mb-6">"{testimonial.quote}"</p>
                <div>
                  <h4 className="font-bold text-slate-950 dark:text-white">{testimonial.name}</h4>
                  <p className="text-sm text-gray-500 dark:text-gray-400">{testimonial.role}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA Enrollment */}
      <section className="bg-slate-950 dark:bg-slate-950 text-white py-16 px-4 text-center">
        <div className="max-w-4xl mx-auto">
          <h2 className="text-3xl md:text-4xl font-bold mb-6">¿Listo para mejorar tus habilidades?</h2>
          <p className="text-xl text-green-400 mb-8 flex items-center justify-center">
            <FaMotorcycle className="mr-2" aria-hidden="true" />
            Únete a la próxima generación de motociclistas responsables
          </p>
          <div className="flex flex-col md:flex-row justify-center gap-4">
            <a
              href="#inscripciones"
              className="flex items-center justify-center bg-green-400 text-slate-950 font-bold py-3 px-8 rounded-xl hover:bg-green-500 text-lg"
              aria-label="Inscríbete hoy en nuestros cursos"
            >
              <FaCalendarAlt className="mr-2" aria-hidden="true" />
              Inscríbete Hoy
            </a>
            <a
              href="#contacto"
              className="flex items-center justify-center bg-transparent border-2 border-white text-white font-bold py-3 px-8 rounded-xl hover:bg-white hover:text-slate-950 text-lg"
              aria-label="Contáctanos para más información"
            >
              <FaPhone className="mr-2" aria-hidden="true" />
              Contáctanos
            </a>
          </div>
        </div>
      </section>
    </div>
    </>
  );
};

export default Courses;
