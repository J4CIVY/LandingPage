import React from "react";

const Courses = () => {
  const courses = [
    {
      id: 1,
      title: "Curso Básico de Manejo",
      description: "Aprende los fundamentos del manejo seguro en motocicleta",
      duration: "8 horas",
      price: "$250.000",
      includes: [
        "Técnicas básicas de frenado",
        "Control de balanceo",
        "Manejo en curvas",
        "Certificado de participación"
      ]
    },
    {
      id: 2,
      title: "Manejo Defensivo Avanzado",
      description: "Técnicas profesionales para situaciones de riesgo",
      duration: "12 horas",
      price: "$380.000",
      includes: [
        "Frenado de emergencia",
        "Esquivado de obstáculos",
        "Manejo en mojado",
        "Certificación internacional"
      ]
    },
    {
      id: 3,
      title: "Taller de Mantenimiento Básico",
      description: "Aprende a hacer mantenimiento preventivo a tu moto",
      duration: "6 horas",
      price: "$180.000",
      includes: [
        "Cambio de aceite y filtros",
        "Ajuste de cadena",
        "Revisión de frenos",
        "Kit de herramientas básico"
      ]
    },
    {
      id: 4,
      title: "Rutas Grupales Seguras",
      description: "Aprende las técnicas para viajar en grupo",
      duration: "1 día completo",
      price: "$150.000",
      includes: [
        "Comunicación entre motociclistas",
        "Formaciones seguras",
        "Señales manuales",
        "Guía de ruta incluido"
      ]
    }
  ];

  return (
    <div className="min-h-screen bg-[#ffffff]">
      
      {/* Hero Section */}
      <section className="bg-[#000031] text-white py-16 px-4 md:px-20">
        <div className="max-w-7xl mx-auto text-center">
          <h1 className="text-4xl md:text-6xl font-bold mb-6">Escuela de Motociclismo BSK</h1>
          <p className="text-xl md:text-2xl text-[#00ff99] mb-8">
            "Transformamos pasión en conocimiento y seguridad"
          </p>
          <a
            href="#inscripciones"
            className="inline-block bg-white text-[#000031] font-bold py-3 px-8 rounded-xl hover:bg-gray-200 transition text-lg"
          >
            ¡Inscríbete Ahora!
          </a>
        </div>
      </section>

      {/* Cursos Destacados */}
      <section className="py-16 px-4 md:px-8 max-w-7xl mx-auto">
        <div className="text-center mb-16">
          <h2 className="text-3xl font-bold text-[#000031] mb-4">Nuestros Cursos</h2>
          <p className="text-lg text-gray-600 max-w-2xl mx-auto">
            Programas diseñados por expertos para todos los niveles
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
          {courses.map((course) => (
            <div key={course.id} className="bg-white rounded-xl shadow-lg overflow-hidden hover:shadow-xl transition-shadow border border-gray-100">
              <div className="h-48 bg-[#000031] flex items-center justify-center">
                <svg className="w-20 h-20 text-[#00ff99]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
              </div>
              <div className="p-6">
                <h3 className="text-xl font-bold text-[#000031] mb-2">{course.title}</h3>
                <p className="text-gray-600 mb-4">{course.description}</p>
                <div className="flex justify-between items-center mb-4">
                  <span className="text-sm font-medium text-gray-500">{course.duration}</span>
                  <span className="text-lg font-bold text-[#000031]">{course.price}</span>
                </div>
                <ul className="space-y-2">
                  {course.includes.map((item, index) => (
                    <li key={index} className="flex items-start">
                      <svg className="w-5 h-5 text-[#00ff99] mr-2 mt-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7" />
                      </svg>
                      <span className="text-gray-700">{item}</span>
                    </li>
                  ))}
                </ul>
                <button className="mt-6 w-full bg-[#000031] text-white py-2 px-4 rounded-lg hover:bg-opacity-90 transition">
                  Más Información
                </button>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* Testimonios */}
      <section className="bg-gray-50 py-16 px-4 md:px-20">
        <div className="max-w-7xl mx-auto">
          <h2 className="text-3xl font-bold text-[#000031] mb-12 text-center">Testimonios de Alumnos</h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {[
              {
                name: "Carlos Rodríguez",
                role: "Piloto desde 2020",
                quote: "El curso avanzado me salvó la vida en una situación real de frenado de emergencia",
                avatar: "🚀"
              },
              {
                name: "María González",
                role: "Nueva motociclista",
                quote: "Nunca imaginé que podía aprender tanto sobre mi moto en el taller de mantenimiento",
                avatar: "🏍️"
              },
              {
                name: "Andrés Pérez",
                role: "Miembro BSK",
                quote: "Las rutas grupales ahora son más seguras y organizadas gracias a lo aprendido",
                avatar: "🛡️"
              }
            ].map((testimonial, index) => (
              <div key={index} className="bg-white p-6 rounded-xl shadow-md">
                <div className="text-4xl mb-4">{testimonial.avatar}</div>
                <p className="text-gray-600 italic mb-6">"{testimonial.quote}"</p>
                <div>
                  <h4 className="font-bold text-[#000031]">{testimonial.name}</h4>
                  <p className="text-sm text-gray-500">{testimonial.role}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA Inscripción */}
      <section className="bg-[#000031] text-white py-16 px-4 text-center">
        <div className="max-w-4xl mx-auto">
          <h2 className="text-3xl md:text-4xl font-bold mb-6">¿Listo para mejorar tus habilidades?</h2>
          <p className="text-xl text-[#00ff99] mb-8">Únete a la próxima generación de motociclistas responsables</p>
          <div className="flex flex-col md:flex-row justify-center gap-4">
            <a
              href="#inscripciones"
              className="bg-[#00ff99] text-[#000031] font-bold py-3 px-8 rounded-xl hover:bg-opacity-90 transition text-lg"
            >
              Inscríbete Hoy
            </a>
            <a
              href="#contacto"
              className="bg-transparent border-2 border-white text-white font-bold py-3 px-8 rounded-xl hover:bg-white hover:text-[#000031] transition text-lg"
            >
              Contáctanos
            </a>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-gray-900 text-gray-400 py-8 px-4">
        <div className="max-w-7xl mx-auto text-center">
          <p>© {new Date().getFullYear()} BSK Motorcycle Team - Escuela de Motociclismo</p>
          <p className="mt-2 text-sm">Todos los derechos reservados | Certificados por la Federación Colombiana de Motociclismo</p>
        </div>
      </footer>
    </div>
  );
};

export default Courses;