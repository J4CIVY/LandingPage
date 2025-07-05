import React from 'react';
import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { 
  FaUsers,
  FaBolt,
  FaLock,
  FaCalendarAlt,
  FaShieldAlt,
  FaMoneyBillWave,
  FaGift,
  FaCheck,
  FaEnvelope,
  FaPhone,
  FaMapMarkerAlt,
  FaChevronRight,
  FaMotorcycle,
  FaWrench,
  FaHandsHelping,
} from 'react-icons/fa';
import { 
  GiMechanicGarage,
  GiSteeringWheel,
  GiRoad,
  GiMotorcycleHelmet
} from 'react-icons/gi';
import { 
  TbDiscount2
} from 'react-icons/tb';

const Memberships = () => {
  const navigate = useNavigate();
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    phone: '',
    message: '',
    membershipType: ''
  });

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    console.log('Formulario enviado:', formData);
    alert('Gracias por tu interés. Nos pondremos en contacto contigo pronto.');
    setFormData({
      name: '',
      email: '',
      phone: '',
      message: '',
      membershipType: ''
    });
  };

  const membershipTypes = [
    {
      name: "Friend",
      price: "Gratis",
      period: "",
      features: [
        "Participación en eventos generales",
        "Acceso a contenido exclusivo",
        "Asistencia remota 24/7",
        "Descuento 25% en merchandising regular",
        "Hoodie oficial del club",
        "Calca para moto/casco"
      ],
      buttonText: "Únete Gratis",
      popular: false,
      onClick: () => navigate('/membership-info')
    },
    {
      name: "Rider",
      price: "$50,000",
      period: "mensual o $600,000 anual",
      features: [
        "Todo lo de Friend +",
        "Asistencia técnica presencial",
        "Seguro de responsabilidad civil",
        "Acceso a eventos especiales",
        "Kit de herramientas básico",
        "Descuento 50% en merchandising",
        "Parche bordado exclusivo"
      ],
      buttonText: "Hazte Rider",
      popular: false,
      onClick: () => console.log("Rider membership selected")
    },
    {
      name: "Pro",
      price: "$1,200,000",
      period: "anual",
      features: [
        "Todo lo de Rider +",
        "Asistencia de grúa incluida",
        "Acceso prioritario a eventos",
        "Kit de herramientas avanzado",
        "Contenido exclusivo premium",
        "Gorra oficial del club",
        "Derecho a voz en reuniones",
        "Descuento 75% en merchandising"
      ],
      buttonText: "Hazte Pro",
      popular: true,
      onClick: () => console.log("Pro membership selected")
    }
  ];

  return (
    <div className="min-h-screen bg-gray-100">
      {/* Hero Section */}
      <div className="relative bg-blue-900 text-white py-20">
        <div className="container mx-auto px-4 text-center">
          <h1 className="text-4xl md:text-5xl font-bold mb-6 flex items-center justify-center">
            <FaMotorcycle className="mr-4" /> Únete a BSK Motorcycle Team
          </h1>
          <p className="text-xl mb-8 max-w-3xl mx-auto">
            Forma parte de una comunidad apasionada por el motociclismo, donde la hermandad, el espíritu aventurero y el respeto son nuestros pilares fundamentales.
          </p>
          <a 
            href="#memberships" 
            className="bg-red-600 hover:bg-red-700 text-white font-bold py-3 px-8 rounded-full text-lg transition duration-300 inline-flex items-center"
          >
            Ver Membresías <FaChevronRight className="ml-2" />
          </a>
        </div>
      </div>

      {/* Why Choose BSK */}
      <div className="py-16 bg-white">
        <div className="container mx-auto px-4">
          <h2 className="text-3xl font-bold text-center mb-12 text-gray-800">¿Por qué elegir BSK Motorcycle Team?</h2>
          
          <div className="grid md:grid-cols-3 gap-8">
            <div className="bg-gray-50 p-6 rounded-lg shadow-sm hover:shadow-md transition duration-300">
              <div className="text-blue-600 mb-4">
                <FaUsers className="h-12 w-12" />
              </div>
              <h3 className="text-xl font-semibold mb-3 text-gray-800">Hermandad</h3>
              <p className="text-gray-600">
                En BSK creemos en la camaradería y la unidad como base de todo lo que hacemos. Te sentirás parte de una gran familia motera.
              </p>
            </div>
            
            <div className="bg-gray-50 p-6 rounded-lg shadow-sm hover:shadow-md transition duration-300">
              <div className="text-blue-600 mb-4">
                <FaBolt className="h-12 w-12" />
              </div>
              <h3 className="text-xl font-semibold mb-3 text-gray-800">Espíritu Aventurero</h3>
              <p className="text-gray-600">
                La pasión por la aventura nos une. Exploramos nuevos horizontes, desafiamos nuestros límites y descubrimos lugares emocionantes.
              </p>
            </div>
            
            <div className="bg-gray-50 p-6 rounded-lg shadow-sm hover:shadow-md transition duration-300">
              <div className="text-blue-600 mb-4">
                <FaLock className="h-12 w-12" />
              </div>
              <h3 className="text-xl font-semibold mb-3 text-gray-800">Respeto y Seguridad</h3>
              <p className="text-gray-600">
                Promovemos un profundo respeto hacia todos los miembros y la seguridad como prioridad en todas nuestras actividades.
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Membership Benefits */}
      <div className="py-16 bg-gray-100">
        <div className="container mx-auto px-4">
          <h2 className="text-3xl font-bold text-center mb-12 text-gray-800">Beneficios de ser miembro</h2>
          
          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
            <div className="bg-white p-6 rounded-lg shadow-sm text-center">
              <div className="bg-blue-100 w-16 h-16 mx-auto rounded-full flex items-center justify-center mb-4">
                <FaCalendarAlt className="h-8 w-8 text-blue-600" />
              </div>
              <h3 className="font-semibold mb-2 text-gray-800">Eventos exclusivos</h3>
              <p className="text-gray-600 text-sm">Participa en rodadas, tours y actividades sociales organizadas por el club.</p>
            </div>
            
            <div className="bg-white p-6 rounded-lg shadow-sm text-center">
              <div className="bg-blue-100 w-16 h-16 mx-auto rounded-full flex items-center justify-center mb-4">
                <FaShieldAlt className="h-8 w-8 text-blue-600" />
              </div>
              <h3 className="font-semibold mb-2 text-gray-800">Asistencia en ruta</h3>
              <p className="text-gray-600 text-sm">Servicio de asistencia técnica y emergencias disponible 24/7 según tu membresía.</p>
            </div>
            
            <div className="bg-white p-6 rounded-lg shadow-sm text-center">
              <div className="bg-blue-100 w-16 h-16 mx-auto rounded-full flex items-center justify-center mb-4">
                <TbDiscount2 className="h-8 w-8 text-blue-600" />
              </div>
              <h3 className="font-semibold mb-2 text-gray-800">Descuentos exclusivos</h3>
              <p className="text-gray-600 text-sm">Accede a descuentos en merchandising, talleres y servicios aliados.</p>
            </div>
            
            <div className="bg-white p-6 rounded-lg shadow-sm text-center">
              <div className="bg-blue-100 w-16 h-16 mx-auto rounded-full flex items-center justify-center mb-4">
                <FaGift className="h-8 w-8 text-blue-600" />
              </div>
              <h3 className="font-semibold mb-2 text-gray-800">Kit de bienvenida</h3>
              <p className="text-gray-600 text-sm">Recibe un kit con indumentaria y accesorios según tu tipo de membresía.</p>
            </div>
          </div>
        </div>
      </div>

      {/* Requirements */}
      <div className="py-16 bg-white">
        <div className="container mx-auto px-4">
          <h2 className="text-3xl font-bold text-center mb-12 text-gray-800">Requisitos para ser miembro</h2>
          
          <div className="max-w-3xl mx-auto">
            <div className="space-y-4">
              <div className="flex items-start">
                <div className="flex-shrink-0 mt-1">
                  <FaCheck className="h-6 w-6 text-green-500" />
                </div>
                <div className="ml-3">
                  <p className="text-gray-700">Pasión por el motociclismo y alineación con los valores del club</p>
                </div>
              </div>
              
              <div className="flex items-start">
                <div className="flex-shrink-0 mt-1">
                  <FaCheck className="h-6 w-6 text-green-500" />
                </div>
                <div className="ml-3">
                  <p className="text-gray-700">Ser mayor de 18 años</p>
                </div>
              </div>
              
              <div className="flex items-start">
                <div className="flex-shrink-0 mt-1">
                  <FaCheck className="h-6 w-6 text-green-500" />
                </div>
                <div className="ml-3">
                  <p className="text-gray-700">Licencia de conducir motocicletas tipo A1 o A2 vigente</p>
                </div>
              </div>
              
              <div className="flex items-start">
                <div className="flex-shrink-0 mt-1">
                  <FaCheck className="h-6 w-6 text-green-500" />
                </div>
                <div className="ml-3">
                  <p className="text-gray-700">Motocicleta propia en buen estado y debidamente registrada</p>
                </div>
              </div>
              
              <div className="flex items-start">
                <div className="flex-shrink-0 mt-1">
                  <FaCheck className="h-6 w-6 text-green-500" />
                </div>
                <div className="ml-3">
                  <p className="text-gray-700">Compromiso de cumplir con el código de ética del club</p>
                </div>
              </div>
            </div>
            
            <div className="mt-12 bg-blue-50 p-6 rounded-lg border border-blue-200">
              <h3 className="text-xl font-semibold mb-4 text-blue-800">Proceso de admisión</h3>
              <ol className="list-decimal list-inside space-y-2 text-gray-700">
                <li>Completar formulario de solicitud</li>
                <li>Entrevista personal con el Comité de Membresía</li>
                <li>Participación en rodada de prueba</li>
                <li>Aprobación por parte del Comité</li>
                <li>Ceremonia de bienvenida y entrega de kit</li>
              </ol>
            </div>
          </div>
        </div>
      </div>

      {/* Membership Plans */}
      <div id="memberships" className="py-16 bg-gray-100">
        <div className="container mx-auto px-4">
          <h2 className="text-3xl font-bold text-center mb-12 text-gray-800">Nuestras Membresías</h2>
          
          <div className="grid md:grid-cols-3 gap-8 max-w-5xl mx-auto">
            {membershipTypes.map((plan, index) => (
              <div 
                key={index} 
                className={`relative rounded-lg shadow-md overflow-hidden ${plan.popular ? 'border-2 border-blue-500 transform md:-translate-y-4' : 'border border-gray-200'}`}
              >
                {plan.popular && (
                  <div className="absolute top-0 right-0 bg-blue-500 text-white text-xs font-bold px-3 py-1 transform translate-x-2 -translate-y-2 rotate-12">
                    MÁS POPULAR
                  </div>
                )}
                <div className="p-6 bg-white">
                  <h3 className="text-2xl font-bold text-center mb-2 text-gray-800">{plan.name}</h3>
                  <div className="text-center mb-6">
                    <span className="text-3xl font-bold text-blue-600">{plan.price}</span>
                    {plan.period && <span className="text-gray-600"> / {plan.period}</span>}
                  </div>
                  
                  <ul className="space-y-3 mb-8">
                    {plan.features.map((feature, i) => (
                      <li key={i} className="flex items-start">
                        <FaCheck className="h-5 w-5 text-green-500 mr-2 mt-0.5" />
                        <span className="text-gray-700">{feature}</span>
                      </li>
                    ))}
                  </ul>
                  
                  <button 
                    className={`w-full py-3 px-4 rounded-md font-bold text-white ${plan.popular ? 'bg-blue-600 hover:bg-blue-700' : 'bg-gray-800 hover:bg-gray-700'} transition duration-300 flex items-center justify-center`}
                    onClick={plan.onClick}
                  >
                    {plan.buttonText} <FaChevronRight className="ml-2" />
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Testimonials */}
      <div className="py-16 bg-blue-900 text-white">
        <div className="container mx-auto px-4">
          <h2 className="text-3xl font-bold text-center mb-12">Lo que dicen nuestros miembros</h2>
          
          <div className="grid md:grid-cols-3 gap-8 max-w-5xl mx-auto">
            <div className="bg-blue-800 p-6 rounded-lg">
              <div className="flex items-center mb-4">
                <div className="w-12 h-12 rounded-full bg-blue-600 flex items-center justify-center mr-4">
                  <GiMotorcycleHelmet className="text-xl text-white" />
                </div>
                <div>
                  <h4 className="font-bold">Andrea Martínez</h4>
                  <p className="text-blue-200 text-sm">Miembro Pro desde 2023</p>
                </div>
              </div>
              <p className="italic">"Unirme a BSK fue la mejor decisión. La asistencia en ruta me ha salvado más de una vez, y las rodadas son experiencias inolvidables con una gran familia."</p>
            </div>
            
            <div className="bg-blue-800 p-6 rounded-lg">
              <div className="flex items-center mb-4">
                <div className="w-12 h-12 rounded-full bg-blue-600 flex items-center justify-center mr-4">
                  <GiSteeringWheel className="text-xl text-white" />
                </div>
                <div>
                  <h4 className="font-bold">Carlos Rodríguez</h4>
                  <p className="text-blue-200 text-sm">Miembro Rider desde 2022</p>
                </div>
              </div>
              <p className="italic">"La hermandad que se vive aquí es real. No solo es un club de motos, es una familia que se apoya en las buenas y en las malas."</p>
            </div>
            
            <div className="bg-blue-800 p-6 rounded-lg">
              <div className="flex items-center mb-4">
                <div className="w-12 h-12 rounded-full bg-blue-600 flex items-center justify-center mr-4">
                  <GiRoad className="text-xl text-white" />
                </div>
                <div>
                  <h4 className="font-bold">Luisa Sánchez</h4>
                  <p className="text-blue-200 text-sm">Miembro Friend desde 2024</p>
                </div>
              </div>
              <p className="italic">"Aunque soy miembro Friend, me siento totalmente incluida. Los eventos son increíbles y he aprendido mucho sobre seguridad vial con el club."</p>
            </div>
          </div>
        </div>
      </div>

      {/* Gallery Preview */}
      <div className="py-16 bg-white">
        <div className="container mx-auto px-4">
          <h2 className="text-3xl font-bold text-center mb-12 text-gray-800">Vive la experiencia BSK</h2>
          
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <div className="aspect-w-16 aspect-h-9">
              <img 
                src="https://images.unsplash.com/photo-1568772585407-9361f9bf3a87?ixlib=rb-1.2.1&auto=format&fit=crop&w=500&q=60" 
                alt="Rodada BSK" 
                className="w-full h-full object-cover rounded-lg"
              />
            </div>
            <div className="aspect-w-16 aspect-h-9">
              <img 
                src="https://images.unsplash.com/photo-1580310614655-644a4b893a6e?ixlib=rb-1.2.1&auto=format&fit=crop&w=500&q=60" 
                alt="Evento BSK" 
                className="w-full h-full object-cover rounded-lg"
              />
            </div>
            <div className="aspect-w-16 aspect-h-9">
              <img 
                src="https://images.unsplash.com/photo-1558981806-ec527fa84c39?ixlib=rb-1.2.1&auto=format&fit=crop&w=500&q=60" 
                alt="Comunidad BSK" 
                className="w-full h-full object-cover rounded-lg"
              />
            </div>
            <div className="aspect-w-16 aspect-h-9">
              <img 
                src="https://images.unsplash.com/photo-1591637333184-19aa84b3e01f?ixlib=rb-1.2.1&auto=format&fit=crop&w=500&q=60" 
                alt="Aventura BSK" 
                className="w-full h-full object-cover rounded-lg"
              />
            </div>
          </div>
          
          <div className="text-center mt-8">
            <a 
              href="#" 
              className="inline-flex items-center text-blue-600 font-semibold hover:text-blue-800"
            >
              Ver más fotos de nuestras actividades
              <FaChevronRight className="h-5 w-5 ml-1" />
            </a>
          </div>
        </div>
      </div>

      {/* Contact Form */}
      <div className="py-16 bg-gray-100">
        <div className="container mx-auto px-4 max-w-4xl">
          <div className="bg-white rounded-lg shadow-md overflow-hidden">
            <div className="md:flex">
              <div className="md:w-1/2 bg-blue-900 text-white p-8 md:p-12">
                <h2 className="text-2xl font-bold mb-4">¿Tienes preguntas?</h2>
                <p className="mb-6">Estamos aquí para ayudarte. Completa el formulario y nos pondremos en contacto contigo para resolver todas tus dudas sobre el club y el proceso de membresía.</p>
                
                <div className="space-y-4">
                  <div className="flex items-start">
                    <FaEnvelope className="h-6 w-6 mr-3 text-blue-300" />
                    <span>soporte@bskmt.xyz</span>
                  </div>
                  
                  <div className="flex items-start">
                    <FaPhone className="h-6 w-6 mr-3 text-blue-300" />
                    <span>+57 318 294 1684</span>
                  </div>
                  
                  <div className="flex items-start">
                    <FaMapMarkerAlt className="h-6 w-6 mr-3 text-blue-300" />
                    <span>Carrera 5 A No. 36 A Sur 28, Ayacucho, San Cristóbal, Bogotá</span>
                  </div>
                </div>
              </div>
              
              <div className="md:w-1/2 p-8 md:p-12">
                <h3 className="text-2xl font-bold mb-6 text-gray-800">Contáctanos</h3>
                <form onSubmit={handleSubmit}>
                  <div className="mb-4">
                    <label htmlFor="name" className="block text-gray-700 font-medium mb-2">Nombre completo</label>
                    <input 
                      type="text" 
                      id="name" 
                      name="name" 
                      value={formData.name}
                      onChange={handleChange}
                      className="w-full px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500" 
                      required 
                    />
                  </div>
                  
                  <div className="mb-4">
                    <label htmlFor="email" className="block text-gray-700 font-medium mb-2">Correo electrónico</label>
                    <input 
                      type="email" 
                      id="email" 
                      name="email" 
                      value={formData.email}
                      onChange={handleChange}
                      className="w-full px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500" 
                      required 
                    />
                  </div>
                  
                  <div className="mb-4">
                    <label htmlFor="phone" className="block text-gray-700 font-medium mb-2">Teléfono</label>
                    <input 
                      type="tel" 
                      id="phone" 
                      name="phone" 
                      value={formData.phone}
                      onChange={handleChange}
                      className="w-full px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500" 
                      required 
                    />
                  </div>
                  
                  <div className="mb-4">
                    <label htmlFor="membershipType" className="block text-gray-700 font-medium mb-2">Membresía de interés</label>
                    <select 
                      id="membershipType" 
                      name="membershipType" 
                      value={formData.membershipType}
                      onChange={handleChange}
                      className="w-full px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                    >
                      <option value="">Selecciona una opción</option>
                      <option value="Friend">Membresía Friend</option>
                      <option value="Rider">Membresía Rider</option>
                      <option value="Pro">Membresía Pro</option>
                    </select>
                  </div>
                  
                  <div className="mb-6">
                    <label htmlFor="message" className="block text-gray-700 font-medium mb-2">Mensaje</label>
                    <textarea 
                      id="message" 
                      name="message" 
                      rows="4" 
                      value={formData.message}
                      onChange={handleChange}
                      className="w-full px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                    ></textarea>
                  </div>
                  
                  <button 
                    type="submit" 
                    className="w-full bg-blue-600 hover:bg-blue-700 text-white font-bold py-3 px-4 rounded-md transition duration-300 flex items-center justify-center"
                  >
                    Enviar mensaje <FaPaperPlane className="ml-2" />
                  </button>
                </form>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* CTA Section */}
      <div className="py-16 bg-blue-800 text-white">
        <div className="container mx-auto px-4 text-center">
          <h2 className="text-3xl font-bold mb-6">¿Listo para unirte a nuestra familia motera?</h2>
          <p className="text-xl mb-8 max-w-3xl mx-auto">Elige la membresía que mejor se adapte a ti y comienza a vivir experiencias inolvidables sobre dos ruedas.</p>
          <a 
            href="#memberships" 
            className="bg-white hover:bg-gray-100 text-blue-800 font-bold py-3 px-8 rounded-full text-lg transition duration-300 inline-flex items-center"
          >
            Ver Membresías <FaChevronRight className="ml-2" />
          </a>
        </div>
      </div>
    </div>
  );
};

export default Memberships;