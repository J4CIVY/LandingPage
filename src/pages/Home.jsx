import React, { useState } from "react";


const Home = ({ showMenu }) => {

  const [activeTab, setActiveTab] = useState('events');
  const [activeGalleryImage, setActiveGalleryImage] = useState(0);

  // Datos de ejemplo
  const upcomingEvents = [
    {
      id: 1,
      title: 'Ruta Costera 2023',
      date: '15 Octubre 2023',
      description: 'Recorrido por la costa con paradas en los puntos más emblemáticos.',
      location: 'Salida desde clubhouse'
    },
    {
      id: 2,
      title: 'Concentración Nacional',
      date: '5 Noviembre 2023',
      description: 'Encuentro nacional de clubs de motociclismo con exhibiciones y competiciones.',
      location: 'Circuito Central'
    },
    {
      id: 3,
      title: 'Taller de Mantenimiento',
      date: '20 Noviembre 2023',
      description: 'Aprende los fundamentos del mantenimiento de tu moto con nuestros expertos.',
      location: 'Taller BSK'
    }
  ];

  const galleryImages = [
    { id: 1, src: '/comida.png', alt: 'Evento anual 2022' },
    { id: 2, src: '/comida.png', alt: 'Ruta de montaña' },
    { id: 3, src: '/comida.png', alt: 'Concentración regional' },
    { id: 4, src: '/comida.png', alt: 'Miembros del club' }
  ];

  const featuredProducts = [
    { id: 1, name: 'Camiseta BSK', price: 25.99, image: '/comida.png' },
    { id: 2, name: 'Chaqueta Club', price: 89.99, image: '/comida.png' },
    { id: 3, name: 'Pegatina BSK', price: 4.99, image: '/comida.png' }
  ];

  const blogPosts = [
    { id: 1, title: 'Consejos para viajes largos en moto', excerpt: 'Aprende cómo prepararte para tus aventuras en carretera...', date: '10 Sept 2023' },
    { id: 2, title: 'Nuevas regulaciones de seguridad', excerpt: 'Los cambios en la normativa que todo motociclista debe conocer...', date: '28 Ago 2023' }
  ];

  return (
    <div className={`py-0 px-0 transition-all duration-300 ${
      showMenu ? "ml-28" : "ml-0"
    }`}>

      {/* Hero Section */}
      <section className="relative h-screen flex items-center justify-center bg-[#000031] overflow-hidden">
        <div className="absolute inset-0 bg-black opacity-50"></div>
        <video 
          autoPlay 
          loop 
          muted 
          className="absolute z-0 w-auto min-w-full min-h-full max-w-none"
        >
          <source src="/Motorcycle_Hero.mp4" type="video/mp4" />
          Your browser does not support the video tag.
        </video>
        
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
                  <span className="text-[#00FF99] mr-2">✓</span>
                  <span className="text-gray-700">Respeto por los compañeros y la comunidad motera</span>
                </li>
                <li className="flex items-start">
                  <span className="text-[#00FF99] mr-2">✓</span>
                  <span className="text-gray-700">Seguridad como prioridad en todas nuestras rutas</span>
                </li>
                <li className="flex items-start">
                  <span className="text-[#00FF99] mr-2">✓</span>
                  <span className="text-gray-700">Pasión por el motociclismo y el estilo de vida</span>
                </li>
              </ul>
            </div>
            
            <div className="relative h-96 rounded-xl overflow-hidden shadow-2xl">
              <img 
                src="/images/about-us.jpg" 
                alt="Miembros del BSK Motorcycle Team" 
                className="w-full h-full object-cover"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-[#000031] to-transparent opacity-70"></div>
              <div className="absolute bottom-0 left-0 p-6 text-white">
                <p className="text-xl italic">"No es solo un club, es una familia sobre ruedas."</p>
                <p className="mt-2 font-semibold">- Carlos M., Miembro desde 2010</p>
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
            <div className="grid md:grid-cols-3 gap-8">
              {upcomingEvents.map(event => (
                <div key={event.id} className="bg-white text-[#000031] rounded-xl overflow-hidden shadow-lg transition-transform hover:scale-105">
                  <div className="h-48 bg-gray-300 overflow-hidden">
                    <img src={`/images/event-${event.id}.jpg`} alt={event.title} className="w-full h-full object-cover" />
                  </div>
                  <div className="p-6">
                    <h3 className="text-xl font-bold mb-2">{event.title}</h3>
                    <p className="text-[#FF0000] font-semibold mb-3">{event.date}</p>
                    <p className="text-gray-700 mb-4">{event.description}</p>
                    <p className="text-sm text-gray-600 flex items-center">
                      <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                      </svg>
                      {event.location}
                    </p>
                    <button className="mt-4 w-full bg-[#000031] hover:bg-[#00FF99] text-white py-2 rounded-full transition duration-300">
                      Más información
                    </button>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="bg-white rounded-xl p-6 text-[#000031]">
              <div className="h-96 flex items-center justify-center">
                {/* Aquí iría un componente de calendario interactivo */}
                <p className="text-xl">Calendario interactivo de eventos (componente a implementar)</p>
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
          
          <div className="relative h-96 mb-8 rounded-xl overflow-hidden shadow-xl">
            <img 
              src={galleryImages[activeGalleryImage].src} 
              alt={galleryImages[activeGalleryImage].alt} 
              className="w-full h-full object-cover"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-black to-transparent opacity-50"></div>
            <div className="absolute bottom-0 left-0 p-6 text-white">
              <p className="text-xl">{galleryImages[activeGalleryImage].alt}</p>
            </div>
            
            <button 
              onClick={() => setActiveGalleryImage((prev) => (prev === 0 ? galleryImages.length - 1 : prev - 1))}
              className="absolute left-4 top-1/2 transform -translate-y-1/2 bg-black bg-opacity-50 text-white p-2 rounded-full hover:bg-opacity-70"
            >
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
              </svg>
            </button>
            
            <button 
              onClick={() => setActiveGalleryImage((prev) => (prev === galleryImages.length - 1 ? 0 : prev + 1))}
              className="absolute right-4 top-1/2 transform -translate-y-1/2 bg-black bg-opacity-50 text-white p-2 rounded-full hover:bg-opacity-70"
            >
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
              </svg>
            </button>
          </div>
          
          <div className="grid grid-cols-4 gap-4">
            {galleryImages.map((image, index) => (
              <button 
                key={image.id}
                onClick={() => setActiveGalleryImage(index)}
                className={`h-24 rounded-lg overflow-hidden transition-all ${activeGalleryImage === index ? 'ring-4 ring-[#FF0000] transform scale-105' : 'opacity-70 hover:opacity-100'}`}
              >
                <img src={image.src} alt={image.alt} className="w-full h-full object-cover" />
              </button>
            ))}
          </div>
        </div>
      </section>

      {/* Beneficios de Ser Miembro */}
      <section className="py-20 px-4 bg-gray-100">
        <div className="max-w-6xl mx-auto">
          <h2 className="text-4xl font-bold text-center text-[#000031] mb-12">
            BENEFICIOS DE <span className="text-[#00FF99]">SER MIEMBRO</span>
          </h2>
          
          <div className="grid md:grid-cols-2 gap-12">
            <div>
              <h3 className="text-2xl font-semibold text-[#000031] mb-6">Ventajas Exclusivas</h3>
              
              <div className="space-y-6">
                <div className="flex items-start">
                  <div className="bg-[#000031] text-white p-3 rounded-full mr-4">
                    <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                    </svg>
                  </div>
                  <div>
                    <h4 className="text-lg font-semibold text-[#000031]">Descuentos en Talleres</h4>
                    <p className="text-gray-700">15% de descuento en todos los talleres asociados al club.</p>
                  </div>
                </div>
                
                <div className="flex items-start">
                  <div className="bg-[#000031] text-white p-3 rounded-full mr-4">
                    <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                    </svg>
                  </div>
                  <div>
                    <h4 className="text-lg font-semibold text-[#000031]">Eventos Privados</h4>
                    <p className="text-gray-700">Acceso a eventos exclusivos para miembros del club.</p>
                  </div>
                </div>
                
                <div className="flex items-start">
                  <div className="bg-[#000031] text-white p-3 rounded-full mr-4">
                    <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                    </svg>
                  </div>
                  <div>
                    <h4 className="text-lg font-semibold text-[#000031]">Seguro Colectivo</h4>
                    <p className="text-gray-700">Tarifas especiales en seguros para motociclistas.</p>
                  </div>
                </div>
                
                <div className="flex items-start">
                  <div className="bg-[#000031] text-white p-3 rounded-full mr-4">
                    <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                    </svg>
                  </div>
                  <div>
                    <h4 className="text-lg font-semibold text-[#000031]">Asistencia en Ruta</h4>
                    <p className="text-gray-700">Servicio de asistencia en carretera las 24 horas.</p>
                  </div>
                </div>
              </div>
            </div>
            
            <div>
              <h3 className="text-2xl font-semibold text-[#000031] mb-6">Testimonios</h3>
              
              <div className="space-y-6">
                <div className="bg-white p-6 rounded-xl shadow-md">
                  <div className="flex items-center mb-4">
                    <img src="/images/member1.jpg" alt="Miembro" className="w-12 h-12 rounded-full mr-4" />
                    <div>
                      <h4 className="font-semibold text-[#000031]">Ana Rodríguez</h4>
                      <p className="text-sm text-gray-600">Miembro desde 2018</p>
                    </div>
                  </div>
                  <p className="text-gray-700 italic">"Unirme al BSK fue la mejor decisión. No solo he hecho amigos increíbles, sino que he descubierto rutas que nunca hubiera imaginado."</p>
                </div>
                
                <div className="bg-white p-6 rounded-xl shadow-md">
                  <div className="flex items-center mb-4">
                    <img src="/images/member2.jpg" alt="Miembro" className="w-12 h-12 rounded-full mr-4" />
                    <div>
                      <h4 className="font-semibold text-[#000031]">Javier López</h4>
                      <p className="text-sm text-gray-600">Miembro desde 2015</p>
                    </div>
                  </div>
                  <p className="text-gray-700 italic">"La organización de los eventos es impecable. Siempre nos sentimos seguros y bien atendidos en cada salida."</p>
                </div>
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
                <div className="h-64 bg-gray-200 overflow-hidden">
                  <img src={product.image} alt={product.name} className="w-full h-full object-cover" />
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
              <div key={post.id} className="bg-white rounded-xl overflow-hidden shadow-lg">
                <div className="h-48 bg-gray-300 overflow-hidden">
                  <img src={`/images/blog-${post.id}.jpg`} alt={post.title} className="w-full h-full object-cover" />
                </div>
                <div className="p-6">
                  <p className="text-sm text-gray-500 mb-2">{post.date}</p>
                  <h3 className="text-xl font-bold text-[#000031] mb-3">{post.title}</h3>
                  <p className="text-gray-700 mb-4">{post.excerpt}</p>
                  <button className="text-[#FF0000] font-semibold flex items-center hover:underline">
                    Leer más
                    <svg className="w-4 h-4 ml-1" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                    </svg>
                  </button>
                </div>
              </div>
            ))}
          </div>
          
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

      {/* Contacto y Redes Sociales */}
      <section className="py-20 px-4 bg-[#000031] text-white">
        <div className="max-w-6xl mx-auto">
          <h2 className="text-4xl font-bold text-center mb-12">
            CONTACTO & <span className="text-[#00FF99]">REDES</span>
          </h2>
          
          <div className="grid md:grid-cols-2 gap-12">
            <div>
              <h3 className="text-2xl font-semibold mb-6">Envíanos un Mensaje</h3>
              
              <form className="space-y-6">
                <div>
                  <label htmlFor="name" className="block mb-2">Nombre</label>
                  <input 
                    type="text" 
                    id="name" 
                    className="w-full px-4 py-3 rounded-lg bg-[#000031] border border-gray-600 focus:border-[#00FF99] focus:outline-none"
                  />
                </div>
                
                <div>
                  <label htmlFor="email" className="block mb-2">Email</label>
                  <input 
                    type="email" 
                    id="email" 
                    className="w-full px-4 py-3 rounded-lg bg-[#000031] border border-gray-600 focus:border-[#00FF99] focus:outline-none"
                  />
                </div>
                
                <div>
                  <label htmlFor="message" className="block mb-2">Mensaje</label>
                  <textarea 
                    id="message" 
                    rows="5"
                    className="w-full px-4 py-3 rounded-lg bg-[#000031] border border-gray-600 focus:border-[#00FF99] focus:outline-none"
                  ></textarea>
                </div>
                
                <button 
                  type="submit"
                  className="w-full bg-[#FF0000] hover:bg-red-700 text-white font-bold py-3 px-6 rounded-lg transition duration-300"
                >
                  Enviar Mensaje
                </button>
              </form>
            </div>
            
            <div>
              <h3 className="text-2xl font-semibold mb-6">Síguenos</h3>
              
              <div className="space-y-6">
                <p>Mantente al día con nuestras últimas noticias, eventos y aventuras a través de nuestras redes sociales.</p>
                
                <div className="flex space-x-4">
                  <a href="#" className="bg-white text-[#000031] p-3 rounded-full hover:bg-[#00FF99] transition duration-300">
                    <svg className="w-6 h-6" fill="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                      <path d="M22 12c0-5.523-4.477-10-10-10S2 6.477 2 12c0 4.991 3.657 9.128 8.438 9.878v-6.987h-2.54V12h2.54V9.797c0-2.506 1.492-3.89 3.777-3.89 1.094 0 2.238.195 2.238.195v2.46h-1.26c-1.243 0-1.63.771-1.63 1.562V12h2.773l-.443 2.89h-2.33v6.988C18.343 21.128 22 16.991 22 12z" />
                    </svg>
                  </a>
                  
                  <a href="#" className="bg-white text-[#000031] p-3 rounded-full hover:bg-[#00FF99] transition duration-300">
                    <svg className="w-6 h-6" fill="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                      <path d="M12.315 2c2.43 0 2.784.013 3.808.06 1.064.049 1.791.218 2.427.465a4.902 4.902 0 011.772 1.153 4.902 4.902 0 011.153 1.772c.247.636.416 1.363.465 2.427.048 1.067.06 1.407.06 4.123v.08c0 2.643-.012 2.987-.06 4.043-.049 1.064-.218 1.791-.465 2.427a4.902 4.902 0 01-1.153 1.772 4.902 4.902 0 01-1.772 1.153c-.636.247-1.363.416-2.427.465-1.067.048-1.407.06-4.123.06h-.08c-2.643 0-2.987-.012-4.043-.06-1.064-.049-1.791-.218-2.427-.465a4.902 4.902 0 01-1.772-1.153 4.902 4.902 0 01-1.153-1.772c-.247-.636-.416-1.363-.465-2.427-.047-1.024-.06-1.379-.06-3.808v-.63c0-2.43.013-2.784.06-3.808.049-1.064.218-1.791.465-2.427a4.902 4.902 0 011.153-1.772A4.902 4.902 0 015.45 2.525c.636-.247 1.363-.416 2.427-.465C8.901 2.013 9.256 2 11.685 2h.63zm-.081 1.802h-.468c-2.456 0-2.784.011-3.807.058-.975.045-1.504.207-1.857.344-.467.182-.8.398-1.15.748-.35.35-.566.683-.748 1.15-.137.353-.3.882-.344 1.857-.047 1.023-.058 1.351-.058 3.807v.468c0 2.456.011 2.784.058 3.807.045.975.207 1.504.344 1.857.182.466.399.8.748 1.15.35.35.683.566 1.15.748.353.137.882.3 1.857.344 1.054.048 1.37.058 4.041.058h.08c2.597 0 2.917-.01 3.96-.058.976-.045 1.505-.207 1.858-.344.466-.182.8-.398 1.15-.748.35-.35.566-.683.748-1.15.137-.353.3-.882.344-1.857.048-1.055.058-1.37.058-4.041v-.08c0-2.597-.01-2.917-.058-3.96-.045-.976-.207-1.505-.344-1.858a3.097 3.097 0 00-.748-1.15 3.098 3.098 0 00-1.15-.748c-.353-.137-.882-.3-1.857-.344-1.023-.047-1.351-.058-3.807-.058zM12 6.865a5.135 5.135 0 110 10.27 5.135 5.135 0 010-10.27zm0 1.802a3.333 3.333 0 100 6.666 3.333 3.333 0 000-6.666zm5.338-3.205a1.2 1.2 0 110 2.4 1.2 1.2 0 010-2.4z" />
                    </svg>
                  </a>
                  
                  <a href="#" className="bg-white text-[#000031] p-3 rounded-full hover:bg-[#00FF99] transition duration-300">
                    <svg className="w-6 h-6" fill="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                      <path d="M8.29 20.251c7.547 0 11.675-6.253 11.675-11.675 0-.178 0-.355-.012-.53A8.348 8.348 0 0022 5.92a8.19 8.19 0 01-2.357.646 4.118 4.118 0 001.804-2.27 8.224 8.224 0 01-2.605.996 4.107 4.107 0 00-6.993 3.743 11.65 11.65 0 01-8.457-4.287 4.106 4.106 0 001.27 5.477A4.072 4.072 0 012.8 9.713v.052a4.105 4.105 0 003.292 4.022 4.095 4.095 0 01-1.853.07 4.108 4.108 0 003.834 2.85A8.233 8.233 0 012 18.407a11.616 11.616 0 006.29 1.84" />
                    </svg>
                  </a>
                  
                  <a href="#" className="bg-white text-[#000031] p-3 rounded-full hover:bg-[#00FF99] transition duration-300">
                    <svg className="w-6 h-6" fill="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                      <path d="M19.615 3.184c-3.604-.246-11.631-.245-15.23 0-3.897.266-4.356 2.62-4.385 8.816.029 6.185.484 8.549 4.385 8.816 3.6.245 11.626.246 15.23 0 3.897-.266 4.356-2.62 4.385-8.816-.029-6.185-.484-8.549-4.385-8.816zm-10.615 12.816v-8l8 3.993-8 4.007z" />
                    </svg>
                  </a>
                </div>
                
                <div className="space-y-4">
                  <div className="flex items-start">
                    <svg className="w-6 h-6 text-[#00FF99] mr-3" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z" />
                    </svg>
                    <span>+34 123 456 789</span>
                  </div>
                  
                  <div className="flex items-start">
                    <svg className="w-6 h-6 text-[#00FF99] mr-3" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                    </svg>
                    <span>info@bskmotorcycle.com</span>
                  </div>
                  
                  <div className="flex items-start">
                    <svg className="w-6 h-6 text-[#00FF99] mr-3" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                    </svg>
                    <span>Calle Motocicleta, 123, 28045 Madrid, España</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
};

export default Home;