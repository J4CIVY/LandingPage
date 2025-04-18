import React, { useState, useEffect } from "react";
import Header from "../components/shared/Header";
import { FaWhatsapp, FaPhone, FaAmbulance, FaWrench, FaShieldAlt, FaMapMarkerAlt, FaTools, FaUserAlt, FaPaperPlane } from "react-icons/fa";
import { GoogleMap, LoadScript, Marker, InfoWindow } from '@react-google-maps/api';
import axios from 'axios';

const Sos = ({ showMenu }) => {
  const [activeTab, setActiveTab] = useState("emergency");
  const [userLocation, setUserLocation] = useState(null);
  const [nearestWorkshops, setNearestWorkshops] = useState([]);
  const [selectedWorkshop, setSelectedWorkshop] = useState(null);
  const [formData, setFormData] = useState({
    name: "",
    memberId: "",
    emergencyType: "mechanical",
    description: "",
    location: ""
  });

  // Configuración del mapa
  const mapContainerStyle = {
    width: '100%',
    height: '400px'
  };
  
  const center = {
    lat: 4.5709,
    lng: -74.2973
  };

  // Talleres asociados (en producción vendría de una API)
  const workshops = [
    {
      id: 1,
      name: "MotoTaller BSK Norte",
      address: "Calle 123 #45-67, Bogotá",
      phone: "+57 312 5192001",
      services: ["Mecánica general", "Grúa"],
      location: { lat: 4.6719, lng: -74.1089 }
    },
    // ... más talleres
  ];

  // Obtener ubicación del usuario
  useEffect(() => {
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (position) => {
          setUserLocation({
            lat: position.coords.latitude,
            lng: position.coords.longitude
          });
          findNearestWorkshops(position.coords.latitude, position.coords.longitude);
        },
        (error) => {
          console.error("Error obteniendo ubicación:", error);
          setUserLocation(center); // Ubicación por defecto
        }
      );
    }
  }, []);

  const findNearestWorkshops = (lat, lng) => {
    // En producción, esto sería una llamada API
    const sorted = [...workshops].sort((a, b) => {
      const distA = Math.sqrt(Math.pow(a.location.lat - lat, 2) + Math.pow(a.location.lng - lng, 2));
      const distB = Math.sqrt(Math.pow(b.location.lat - lat, 2) + Math.pow(b.location.lng - lng, 2));
      return distA - distB;
    });
    setNearestWorkshops(sorted.slice(0, 3));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      await axios.post('https://api.bskmotorcycleteam.com/emergencies', formData);
      alert('Solicitud enviada. Nos contactaremos contigo pronto.');
      setFormData({
        name: "",
        memberId: "",
        emergencyType: "mechanical",
        description: "",
        location: ""
      });
    } catch (error) {
      console.error('Error enviando solicitud:', error);
      alert('Error al enviar. Por favor intenta nuevamente.');
    }
  };

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    });
  };

  return (
    <div className={`py-2 px-2 transition-all duration-300 ${showMenu ? "ml-28" : "ml-0"}`}>
      <Header showMenu={showMenu} />
      
      {/* Hero Section */}
      <section className="bg-[#000031] text-white py-16 px-4 md:px-20">
        <div className="max-w-7xl mx-auto text-center">
          <h1 className="text-4xl md:text-5xl font-bold mb-6">SOS BSK</h1>
          <p className="text-xl md:text-2xl max-w-3xl mx-auto">
            Asistencia inmediata para miembros del club
          </p>
        </div>
      </section>

      {/* Tabs */}
      <div className="max-w-7xl mx-auto px-4 md:px-8 mt-8">
        <div className="flex border-b border-gray-200">
          <button
            className={`py-4 px-6 font-medium ${activeTab === "emergency" ? "text-[#00ff99] border-b-2 border-[#00ff99]" : "text-gray-500"}`}
            onClick={() => setActiveTab("emergency")}
          >
            <FaAmbulance className="inline mr-2" />
            Contacto de Emergencia
          </button>
          <button
            className={`py-4 px-6 font-medium ${activeTab === "form" ? "text-[#00ff99] border-b-2 border-[#00ff99]" : "text-gray-500"}`}
            onClick={() => setActiveTab("form")}
          >
            <FaPaperPlane className="inline mr-2" />
            Formulario de Emergencia
          </button>
          <button
            className={`py-4 px-6 font-medium ${activeTab === "workshops" ? "text-[#00ff99] border-b-2 border-[#00ff99]" : "text-gray-500"}`}
            onClick={() => setActiveTab("workshops")}
          >
            <FaTools className="inline mr-2" />
            Talleres Asociados
          </button>
        </div>
      </div>

      {/* Emergency Contacts Tab */}
      {activeTab === "emergency" && (
        <div className="py-12 px-4 md:px-8 max-w-7xl mx-auto">
          <div className="bg-red-50 border-l-4 border-red-500 text-red-700 p-4 mb-8">
            <p className="font-bold">¡Importante!</p>
            <p>Usa estos contactos solo para emergencias reales.</p>
          </div>

          <div className="grid md:grid-cols-3 gap-8">
            {[
              {
                type: "Mecánica",
                icon: <FaWrench className="text-3xl text-[#00ff99]" />,
                description: "Asistencia técnica en carretera",
                contacts: [
                  {
                    method: "WhatsApp",
                    icon: <FaWhatsapp className="text-xl text-green-500" />,
                    number: "+57 312 5192000",
                    link: "https://wa.me/573125192000?text=Necesito%20asistencia%20mecánica"
                  },
                  {
                    method: "Llamada",
                    icon: <FaPhone className="text-xl text-blue-500" />,
                    number: "+57 312 5192000"
                  }
                ]
              },
              // ... otros tipos de emergencia
            ].map((service, index) => (
              <div key={index} className="bg-gray-50 rounded-xl p-6 shadow-sm hover:shadow-md transition-shadow">
                <div className="flex items-center mb-4">
                  {service.icon}
                  <h2 className="text-2xl font-bold text-[#000031] ml-3">{service.type}</h2>
                </div>
                <p className="text-gray-700 mb-6">{service.description}</p>
                
                <div className="space-y-4">
                  {service.contacts.map((contact, idx) => (
                    <div key={idx} className="bg-white p-4 rounded-lg">
                      <div className="flex items-center mb-2">
                        {contact.icon}
                        <span className="font-semibold ml-2">{contact.method}</span>
                      </div>
                      <p className="text-gray-800 mb-3">{contact.number}</p>
                      {contact.link ? (
                        <a href={contact.link} className="btn-whatsapp">
                          <FaWhatsapp className="mr-2" />
                          Contactar por WhatsApp
                        </a>
                      ) : (
                        <a href={`tel:${contact.number.replace(/\s/g, '')}`} className="btn-call">
                          <FaPhone className="mr-2" />
                          Llamar ahora
                        </a>
                      )}
                    </div>
                  ))}
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Emergency Form Tab */}
      {activeTab === "form" && (
        <div className="py-12 px-4 md:px-8 max-w-3xl mx-auto">
          <div className="bg-white rounded-xl shadow-md p-6 md:p-8">
            <h2 className="text-2xl font-bold text-[#000031] mb-6">Formulario de Emergencia</h2>
            
            <form onSubmit={handleSubmit}>
              <div className="grid md:grid-cols-2 gap-6 mb-6">
                <div>
                  <label className="block text-gray-700 mb-2">Nombre Completo</label>
                  <input
                    type="text"
                    name="name"
                    value={formData.name}
                    onChange={handleChange}
                    className="w-full px-4 py-2 border rounded-lg"
                    required
                  />
                </div>
                <div>
                  <label className="block text-gray-700 mb-2">Número de Socio BSK</label>
                  <input
                    type="text"
                    name="memberId"
                    value={formData.memberId}
                    onChange={handleChange}
                    className="w-full px-4 py-2 border rounded-lg"
                    required
                  />
                </div>
              </div>

              <div className="mb-6">
                <label className="block text-gray-700 mb-2">Tipo de Emergencia</label>
                <select
                  name="emergencyType"
                  value={formData.emergencyType}
                  onChange={handleChange}
                  className="w-full px-4 py-2 border rounded-lg"
                  required
                >
                  <option value="mechanical">Mecánica/Asistencia en carretera</option>
                  <option value="medical">Emergencia Médica</option>
                  <option value="security">Emergencia de Seguridad</option>
                  <option value="other">Otro</option>
                </select>
              </div>

              <div className="mb-6">
                <label className="block text-gray-700 mb-2">Descripción</label>
                <textarea
                  name="description"
                  value={formData.description}
                  onChange={handleChange}
                  className="w-full px-4 py-2 border rounded-lg"
                  rows="4"
                  required
                ></textarea>
              </div>

              <div className="mb-6">
                <label className="block text-gray-700 mb-2">Ubicación</label>
                {userLocation ? (
                  <div className="flex items-center">
                    <FaMapMarkerAlt className="text-red-500 mr-2" />
                    <span>Detectada: {userLocation.lat.toFixed(4)}, {userLocation.lng.toFixed(4)}</span>
                  </div>
                ) : (
                  <p className="text-gray-500">Cargando ubicación...</p>
                )}
                <input
                  type="text"
                  name="location"
                  value={formData.location}
                  onChange={handleChange}
                  placeholder="Describe tu ubicación (ciudad, dirección, puntos de referencia)"
                  className="w-full px-4 py-2 border rounded-lg mt-2"
                  required
                />
              </div>

              <button
                type="submit"
                className="bg-[#000031] text-white font-bold py-3 px-6 rounded-lg hover:bg-opacity-90 transition flex items-center"
              >
                <FaPaperPlane className="mr-2" />
                Enviar Solicitud
              </button>
            </form>
          </div>
        </div>
      )}

      {/* Workshops Tab */}
      {activeTab === "workshops" && (
        <div className="py-12 px-4 md:px-8 max-w-7xl mx-auto">
          <h2 className="text-2xl font-bold text-[#000031] mb-6">Talleres Asociados</h2>
          
          <div className="mb-8 bg-white rounded-xl shadow-md p-6">
            <h3 className="text-xl font-semibold text-[#000031] mb-4 flex items-center">
              <FaMapMarkerAlt className="text-red-500 mr-2" />
              Talleres más cercanos a tu ubicación
            </h3>
            
            <LoadScript googleMapsApiKey="AIzaSyA0gRLAP3rzEgHQsR-a5UH0EyyCpEVE6zA">
              <GoogleMap
                mapContainerStyle={mapContainerStyle}
                center={userLocation || center}
                zoom={12}
              >
                {userLocation && (
                  <Marker
                    position={userLocation}
                    icon={{
                      url: "https://maps.google.com/mapfiles/ms/icons/blue-dot.png"
                    }}
                  />
                )}
                
                {nearestWorkshops.map((workshop) => (
                  <Marker
                    key={workshop.id}
                    position={workshop.location}
                    onClick={() => setSelectedWorkshop(workshop)}
                    icon={{
                      url: "https://maps.google.com/mapfiles/ms/icons/green-dot.png"
                    }}
                  />
                ))}
                
                {selectedWorkshop && (
                  <InfoWindow
                    position={selectedWorkshop.location}
                    onCloseClick={() => setSelectedWorkshop(null)}
                  >
                    <div className="p-2">
                      <h4 className="font-bold">{selectedWorkshop.name}</h4>
                      <p>{selectedWorkshop.address}</p>
                      <p>Tel: {selectedWorkshop.phone}</p>
                      <a 
                        href={`tel:${selectedWorkshop.phone.replace(/\s/g, '')}`}
                        className="text-blue-500 hover:underline"
                      >
                        Llamar ahora
                      </a>
                    </div>
                  </InfoWindow>
                )}
              </GoogleMap>
            </LoadScript>
          </div>

          <div className="grid md:grid-cols-3 gap-6">
            {nearestWorkshops.map((workshop) => (
              <div key={workshop.id} className="bg-white rounded-xl shadow-md overflow-hidden hover:shadow-lg transition">
                <div className="p-6">
                  <h3 className="text-xl font-bold text-[#000031] mb-2">{workshop.name}</h3>
                  <p className="text-gray-600 mb-4 flex items-center">
                    <FaMapMarkerAlt className="mr-2 text-red-500" />
                    {workshop.address}
                  </p>
                  <p className="text-gray-600 mb-4 flex items-center">
                    <FaPhone className="mr-2 text-blue-500" />
                    {workshop.phone}
                  </p>
                  <div className="mb-4">
                    <h4 className="font-semibold text-gray-700 mb-2">Servicios:</h4>
                    <ul className="list-disc pl-5">
                      {workshop.services.map((service, idx) => (
                        <li key={idx} className="text-gray-600">{service}</li>
                      ))}
                    </ul>
                  </div>
                  <div className="flex space-x-3">
                    <a 
                      href={`tel:${workshop.phone.replace(/\s/g, '')}`}
                      className="bg-blue-500 text-white px-4 py-2 rounded-lg flex items-center"
                    >
                      <FaPhone className="mr-2" />
                      Llamar
                    </a>
                    <a
                      href={`https://www.google.com/maps/dir/?api=1&destination=${workshop.location.lat},${workshop.location.lng}`}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="bg-[#000031] text-white px-4 py-2 rounded-lg flex items-center"
                    >
                      <FaMapMarkerAlt className="mr-2" />
                      Cómo llegar
                    </a>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};

export default Sos;