'use client';

import React, { useState, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import SEOComponent from '@/components/home/SEOComponent';
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
  FaPaperPlane
} from 'react-icons/fa';
import { 
  GiMechanicGarage,
  GiSteeringWheel,
  GiRoad,
  GiFullMotorcycleHelmet
} from 'react-icons/gi';
import { 
  TbDiscount
} from 'react-icons/tb';

interface FormDataState {
  name: string;
  email: string;
  phone: string;
  message: string;
  membershipType: string;
}

interface MembershipPlan {
  name: string;
  price: string;
  period: string;
  features: string[];
  buttonText: string;
  popular: boolean;
  onClick: () => void;
}

const Memberships: React.FC = () => {
  const router = useRouter();
  const [formData, setFormData] = useState<FormDataState>({
    name: '',
    email: '',
    phone: '',
    message: '',
    membershipType: ''
  });

  const handleChange = useCallback((e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  }, []);

  const handleSubmit = useCallback((e: React.FormEvent<HTMLFormElement>) => {
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
  }, [formData]);

  const membershipTypes: MembershipPlan[] = [
    {
      name: "Amigo",
      price: "Gratis",
      period: "",
      features: [
        "Participación en eventos generales",
        "Acceso a contenido exclusivo",
        "Asistencia remota 24/7",
        "Descuento 25% en merchandising oficial",
        "Hoodie oficial del club",
        "Calca para moto/casco"
      ],
      buttonText: "Comienza Tu Aventura",
      popular: false,
      onClick: () => router.push('/membership-info')
    },
    {
      name: "Piloto",
      price: "$50,000",
      period: "mensual o $600,000 anual",
      features: [
        "Todo lo de Amigo +",
        "Asistencia técnica presencial",
        "Seguro de responsabilidad civil",
        "Acceso a eventos especiales",
        "Kit de herramientas básico",
        "Descuento 50% en merchandising",
        "Parche bordado exclusivo"
      ],
      buttonText: "Únete como Piloto",
      popular: false,
      onClick: () => console.log("Piloto membership selected")
    },
    {
      name: "Profesional",
      price: "$1,200,000",
      period: "anual",
      features: [
        "Todo lo de Piloto +",
        "Asistencia de grúa incluida",
        "Acceso prioritario a eventos",
        "Kit de herramientas avanzado",
        "Contenido exclusivo premium",
        "Gorra oficial del club",
        "Derecho a voz en reuniones",
        "Descuento 75% en merchandising"
      ],
      buttonText: "Únete a la Comunidad",
      popular: true,
      onClick: () => console.log("Profesional membership selected")
    }
  ];

  return (
    <div className="min-h-screen bg-gray-100">
      <SEOComponent
        title="Membresías - BSK Motorcycle Team"
        description="Únete a BSK Motorcycle Team. Conoce nuestros planes de membresía, beneficios, y cómo puedes formar parte de nuestra comunidad de motociclistas."
      />
      <div className="relative bg-slate-950 text-white py-20">
        <div className="container mx-auto px-4 text-center">
          <h1 className="text-4xl md:text-5xl font-bold mb-6 flex items-center justify-center">
            Únete a BSK Motorcycle Team
          </h1>
          <p className="text-xl mb-8 max-w-3xl mx-auto">
            Donde la comunidad se vive sobre dos ruedas. Forma parte de una familia que comparte la pasión por el motociclismo, el espíritu aventurero y el respeto mutuo en cada ruta por Colombia.
          </p>
          <a 
            href="#memberships" 
            className="bg-red-600 hover:bg-red-600 text-white font-bold py-3 px-8 rounded-full text-lg transition duration-300 inline-flex items-center"
            aria-label="Ver nuestras opciones de membresía"
          >
            Ver Membresías <FaChevronRight className="ml-2" aria-hidden="true" />
          </a>
        </div>
      </div>

      <div className="py-16 bg-white">
        <div className="container mx-auto px-4">
          <h2 className="text-3xl font-bold text-center mb-12 text-gray-800">¿Por qué elegir BSK Motorcycle Team?</h2>
          
          <div className="grid md:grid-cols-3 gap-8">
            <div className="bg-gray-50 p-6 rounded-lg shadow-sm hover:shadow-md transition duration-300">
              <div className="text-green-400 mb-4">
                <FaUsers className="h-12 w-12" aria-hidden="true" />
              </div>
              <h3 className="text-xl font-semibold mb-3 text-gray-800">Comunidad</h3>
              <p className="text-gray-600">
                En BSK creemos en la camaradería y la unidad como base de todo lo que hacemos. Te sentirás parte de una gran familia motera.
              </p>
            </div>
            
            <div className="bg-gray-50 p-6 rounded-lg shadow-sm hover:shadow-md transition duration-300">
              <div className="text-green-400 mb-4">
                <FaBolt className="h-12 w-12" aria-hidden="true" />
              </div>
              <h3 className="text-xl font-semibold mb-3 text-gray-800">Espíritu Aventurero</h3>
              <p className="text-gray-600">
                La pasión por la aventura nos une. Exploramos nuevos horizontes, desafiamos nuestros límites y descubrimos lugares emocionantes.
              </p>
            </div>
            
            <div className="bg-gray-50 p-6 rounded-lg shadow-sm hover:shadow-md transition duration-300">
              <div className="text-green-400 mb-4">
                <FaLock className="h-12 w-12" aria-hidden="true" />
              </div>
              <h3 className="text-xl font-semibold mb-3 text-gray-800">Respeto y Seguridad</h3>
              <p className="text-gray-600">
                Promovemos un profundo respeto hacia todos los miembros y la seguridad como prioridad en todas nuestras actividades.
              </p>
            </div>
          </div>
        </div>
      </div>

      <div className="py-16 bg-slate-950">
        <div className="container mx-auto px-4">
          <h2 className="text-3xl font-bold text-center mb-12 text-white">Beneficios de ser miembro</h2>
          
          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
            <div className="bg-white p-6 rounded-lg shadow-sm text-center">
              <div className="bg-slate-950 w-16 h-16 mx-auto rounded-full flex items-center justify-center mb-4">
                <FaCalendarAlt className="h-8 w-8 text-green-400" aria-hidden="true" />
              </div>
              <h3 className="font-semibold mb-2 text-gray-800">Eventos exclusivos</h3>
              <p className="text-gray-600 text-sm">Participa en rodadas, tours y actividades sociales organizadas por el club.</p>
            </div>
            
            <div className="bg-white p-6 rounded-lg shadow-sm text-center">
              <div className="bg-slate-950 w-16 h-16 mx-auto rounded-full flex items-center justify-center mb-4">
                <FaShieldAlt className="h-8 w-8 text-green-400" aria-hidden="true" />
              </div>
              <h3 className="font-semibold mb-2 text-gray-800">Asistencia en ruta</h3>
              <p className="text-gray-600 text-sm">Servicio de asistencia técnica y emergencias disponible 24/7 según tu membresía.</p>
            </div>
            
            <div className="bg-white p-6 rounded-lg shadow-sm text-center">
              <div className="bg-slate-950 w-16 h-16 mx-auto rounded-full flex items-center justify-center mb-4">
                <TbDiscount className="h-8 w-8 text-green-400" aria-hidden="true" />
              </div>
              <h3 className="font-semibold mb-2 text-gray-800">Descuentos exclusivos</h3>
              <p className="text-gray-600 text-sm">Accede a descuentos en merchandising, talleres y servicios aliados.</p>
            </div>
            
            <div className="bg-white p-6 rounded-lg shadow-sm text-center">
              <div className="bg-slate-950 w-16 h-16 mx-auto rounded-full flex items-center justify-center mb-4">
                <FaGift className="h-8 w-8 text-green-400" aria-hidden="true" />
              </div>
              <h3 className="font-semibold mb-2 text-gray-800">Kit de bienvenida</h3>
              <p className="text-gray-600 text-sm">Recibe un kit con indumentaria y accesorios según tu tipo de membresía.</p>
            </div>
          </div>
        </div>
      </div>

      <div className="py-16 bg-white">
        <div className="container mx-auto px-4">
          <h2 className="text-3xl font-bold text-center mb-12 text-gray-800">Requisitos para ser miembro</h2>
          
          <div className="max-w-3xl mx-auto">
            <div className="space-y-4">
              <div className="flex items-start">
                <div className="flex-shrink-0 mt-1">
                  <FaCheck className="h-6 w-6 text-green-400" aria-hidden="true" />
                </div>
                <div className="ml-3">
                  <p className="text-gray-700">Pasión por el motociclismo y alineación con los valores del club</p>
                </div>
              </div>
              
              <div className="flex items-start">
                <div className="flex-shrink-0 mt-1">
                  <FaCheck className="h-6 w-6 text-green-400" aria-hidden="true" />
                </div>
                <div className="ml-3">
                  <p className="text-gray-700">Ser mayor de 18 años</p>
                </div>
              </div>
              
              <div className="flex items-start">
                <div className="flex-shrink-0 mt-1">
                  <FaCheck className="h-6 w-6 text-green-400" aria-hidden="true" />
                </div>
                <div className="ml-3">
                  <p className="text-gray-700">Licencia de conducir motocicletas tipo A1 o A2 vigente</p>
                </div>
              </div>
              
              <div className="flex items-start">
                <div className="flex-shrink-0 mt-1">
                  <FaCheck className="h-6 w-6 text-green-400" aria-hidden="true" />
                </div>
                <div className="ml-3">
                  <p className="text-gray-700">Motocicleta propia en buen estado y debidamente registrada</p>
                </div>
              </div>
              
              <div className="flex items-start">
                <div className="flex-shrink-0 mt-1">
                  <FaCheck className="h-6 w-6 text-green-400" aria-hidden="true" />
                </div>
                <div className="ml-3">
                  <p className="text-gray-700">Compromiso de cumplir con el código de ética del club</p>
                </div>
              </div>
            </div>
            
            <div className="mt-12 bg-slate-950 p-6 rounded-lg border border-blue-200">
              <h3 className="text-xl font-semibold mb-4 text-white">Proceso de admisión</h3>
              <ol className="list-decimal list-inside space-y-2 text-gray-400">
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

      <div id="memberships" className="py-16 bg-slate-950">
        <div className="container mx-auto px-4">
          <h2 className="text-3xl font-bold text-center mb-12 text-white">Nuestras Membresías</h2>
          
          <div className="grid md:grid-cols-3 gap-8 max-w-5xl mx-auto">
            {membershipTypes.map((plan, index) => (
              <div 
                key={index} 
                className={`relative rounded-lg shadow-md overflow-hidden ${plan.popular ? 'border-2 border-slate-950 transform md:-translate-y-4' : 'border border-slate-950'}`}
              >
                {plan.popular && (
                  <div className="absolute top-0 right-0 bg-blue-500 text-white text-xs font-bold px-3 py-1 transform translate-x-2 -translate-y-2 rotate-12">
                    MÁS POPULAR
                  </div>
                )}
                <div className="p-6 bg-white">
                  <h3 className="text-2xl font-bold text-center mb-2 text-slate-950">{plan.name}</h3>
                  <div className="text-center mb-6">
                    <span className="text-3xl font-bold text-green-400">{plan.price}</span>
                    {plan.period && <span className="text-gray-600"> / {plan.period}</span>}
                  </div>
                  
                  <ul className="space-y-3 mb-8">
                    {plan.features.map((feature, i) => (
                      <li key={i} className="flex items-start">
                        <FaCheck className="h-5 w-5 text-green-400 mr-2 mt-0.5" aria-hidden="true" />
                        <span className="text-slate-950">{feature}</span>
                      </li>
                    ))}
                  </ul>
                  
                  <button 
                    className={`w-full py-3 px-4 rounded-md font-bold text-white ${plan.popular ? 'bg-green-400 hover:bg-green-500' : 'bg-slate-950 hover:bg-slate-900'} transition duration-300 flex items-center justify-center`}
                    onClick={plan.onClick}
                    aria-label={`Seleccionar membresía ${plan.name}`}
                  >
                    {plan.buttonText} <FaChevronRight className="ml-2" aria-hidden="true" />
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      <div className="py-16 bg-blue-900 text-white">
        <div className="container mx-auto px-4">
          <h2 className="text-3xl font-bold text-center mb-12">Lo que dicen nuestros miembros</h2>
          
          <div className="grid md:grid-cols-3 gap-8 max-w-5xl mx-auto">
            <div className="bg-blue-800 p-6 rounded-lg">
              <div className="flex items-center mb-4">
                <div className="w-12 h-12 rounded-full bg-blue-600 flex items-center justify-center mr-4">
                  <GiFullMotorcycleHelmet className="text-xl text-white" aria-hidden="true" />
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
                  <GiSteeringWheel className="text-xl text-white" aria-hidden="true" />
                </div>
                <div>
                  <h4 className="font-bold">Carlos Rodríguez</h4>
                  <p className="text-blue-200 text-sm">Miembro Rider desde 2022</p>
                </div>
              </div>
              <p className="italic">"La comunidad que se vive aquí es real. No solo es un club de motos, es una familia que se apoya en las buenas y en las malas."</p>
            </div>
            
            <div className="bg-blue-800 p-6 rounded-lg">
              <div className="flex items-center mb-4">
                <div className="w-12 h-12 rounded-full bg-blue-600 flex items-center justify-center mr-4">
                  <GiRoad className="text-xl text-white" aria-hidden="true" />
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

      <div className="py-16 bg-white">
        <div className="container mx-auto px-4">
          <h2 className="text-3xl font-bold text-center mb-12 text-gray-800">Vive la experiencia BSK</h2>
          
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <div className="aspect-w-16 aspect-h-9">
              <img 
                src="https://images.unsplash.com/photo-1568772585407-9361f9bf3a87?ixlib=rb-1.2.1&auto=format&fit=crop&w=500&q=60" 
                alt="Rodada BSK en carretera"
                className="w-full h-full object-cover rounded-lg"
                loading="lazy"
              />
            </div>
            <div className="aspect-w-16 aspect-h-9">
              <img 
                src="https://images.unsplash.com/photo-1580310614655-644a4b893a6e?ixlib=rb-1.2.1&auto=format&fit=crop&w=500&q=60" 
                alt="Evento de motociclistas BSK"
                className="w-full h-full object-cover rounded-lg"
                loading="lazy"
              />
            </div>
            <div className="aspect-w-16 aspect-h-9">
              <img 
                src="https://images.unsplash.com/photo-1558981806-ec527fa84c39?ixlib=rb-1.2.1&auto=format&fit=crop&w=500&q=60" 
                alt="Comunidad BSK reunida"
                className="w-full h-full object-cover rounded-lg"
                loading="lazy"
              />
            </div>
            <div className="aspect-w-16 aspect-h-9">
              <img 
                src="https://images.unsplash.com/photo-1591637333184-19aa84b3e01f?ixlib=rb-1.2.1&auto=format&fit=crop&w=500&q=60" 
                alt="Aventura en moto con BSK"
                className="w-full h-full object-cover rounded-lg"
                loading="lazy"
              />
            </div>
          </div>
          
          <div className="text-center mt-8">
            <a 
              href="#" 
              className="inline-flex items-center text-blue-600 font-semibold hover:text-blue-800"
              aria-label="Ver más fotos de nuestras actividades"
            >
              Ver más fotos de nuestras actividades
              <FaChevronRight className="h-5 w-5 ml-1" aria-hidden="true" />
            </a>
          </div>
        </div>
      </div>

      <div className="py-16 bg-gray-100">
        <div className="container mx-auto px-4 max-w-4xl">
          <div className="bg-white rounded-lg shadow-md overflow-hidden">
            <div className="md:flex">
              <div className="md:w-1/2 bg-blue-900 text-white p-8 md:p-12">
                <h2 className="text-2xl font-bold mb-4">¿Tienes preguntas?</h2>
                <p className="mb-6">Estamos aquí para ayudarte. Completa el formulario y nos pondremos en contacto contigo para resolver todas tus dudas sobre el club y el proceso de membresía.</p>
                
                <div className="space-y-4">
                  <div className="flex items-start">
                    <FaEnvelope className="h-6 w-6 mr-3 text-blue-300" aria-hidden="true" />
                    <span><a href="mailto:soporte@bskmt.xyz" className="text-blue-300 hover:underline">soporte@bskmt.xyz</a></span>
                  </div>
                  
                  <div className="flex items-start">
                    <FaPhone className="h-6 w-6 mr-3 text-blue-300" aria-hidden="true" />
                    <span><a href="tel:+573182941684" className="text-blue-300 hover:underline">+57 318 294 1684</a></span>
                  </div>
                  
                  <div className="flex items-start">
                    <FaMapMarkerAlt className="h-6 w-6 mr-3 text-blue-300" aria-hidden="true" />
                    <span>Carrera 5 A No. 36 A Sur 28, Ayacucho, San Cristóbal, Bogotá</span>
                  </div>
                </div>
              </div>
              
              <div className="md:w-1/2 p-8 md:p-12">
                <h3 className="text-2xl font-bold mb-6 text-gray-800">Contáctanos</h3>
                <form onSubmit={handleSubmit} aria-label="Formulario de contacto para membresías">
                  <div className="mb-4">
                    <label htmlFor="contact-name-membership" className="block text-gray-700 font-medium mb-2">Nombre completo</label>
                    <input 
                      type="text" 
                      id="contact-name-membership" 
                      name="name" 
                      value={formData.name}
                      onChange={handleChange}
                      className="w-full px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500" 
                      required 
                      aria-required="true"
                    />
                  </div>
                  
                  <div className="mb-4">
                    <label htmlFor="contact-email-membership" className="block text-gray-700 font-medium mb-2">Correo electrónico</label>
                    <input 
                      type="email" 
                      id="contact-email-membership" 
                      name="email" 
                      value={formData.email}
                      onChange={handleChange}
                      className="w-full px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500" 
                      required 
                      aria-required="true"
                    />
                  </div>
                  
                  <div className="mb-4">
                    <label htmlFor="contact-phone-membership" className="block text-gray-700 font-medium mb-2">Teléfono</label>
                    <input 
                      type="tel" 
                      id="contact-phone-membership" 
                      name="phone" 
                      value={formData.phone}
                      onChange={handleChange}
                      className="w-full px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500" 
                      required 
                      aria-required="true"
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
                    <label htmlFor="contact-message-membership" className="block text-gray-700 font-medium mb-2">Mensaje</label>
                    <textarea 
                      id="contact-message-membership" 
                      name="message" 
                      rows={4} 
                      value={formData.message}
                      onChange={handleChange}
                      className="w-full px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                    ></textarea>
                  </div>
                  
                  <button 
                    type="submit" 
                    className="w-full bg-blue-600 hover:bg-blue-700 text-white font-bold py-3 px-4 rounded-md transition duration-300 flex items-center justify-center"
                  >
                    Enviar mensaje <FaPaperPlane className="ml-2" aria-hidden="true" />
                  </button>
                </form>
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="py-16 bg-blue-800 text-white">
        <div className="container mx-auto px-4 text-center">
          <h2 className="text-3xl font-bold mb-6">¿Listo para unirte a nuestra familia motera?</h2>
          <p className="text-xl mb-8 max-w-3xl mx-auto">Elige la membresía que mejor se adapte a ti y comienza a vivir experiencias inolvidables sobre dos ruedas.</p>
          <a 
            href="#memberships" 
            className="bg-white hover:bg-gray-100 text-blue-800 font-bold py-3 px-8 rounded-full text-lg transition duration-300 inline-flex items-center"
            aria-label="Ver nuestras opciones de membresía"
          >
            Ver Membresías <FaChevronRight className="ml-2" aria-hidden="true" />
          </a>
        </div>
      </div>
    </div>
  );
};

export default Memberships;
