'use client';

import { useState, useEffect, useCallback, type FC, type ChangeEvent, type FormEvent, type CSSProperties } from "react";
import { 
  FaWhatsapp, 
  FaPhone, 
  FaAmbulance, 
  FaWrench, 
  FaShieldAlt, 
  FaMapMarkerAlt, 
  FaTools,
  FaExclamationTriangle,
  FaUserAlt, 
  FaPaperPlane,
  FaFirstAid,
  FaUserShield,
  FaMotorcycle
} from "react-icons/fa";
import { GoogleMap, LoadScript, Marker, InfoWindow } from '@react-google-maps/api';
import SEOComponent from '@/components/home/SEOComponent';

/**
 * @typedef {Object} LocationCoords
 * @property {number} lat - Latitude.
 * @property {number} lng - Longitude.
 */
interface LocationCoords {
  lat: number;
  lng: number;
}

/**
 * @typedef {Object} Workshop
 * @property {number} id - Unique identifier for the workshop.
 * @property {string} name - Name of the workshop.
 * @property {string} address - Address of the workshop.
 * @property {string} phone - Phone number of the workshop.
 * @property {string[]} services - List of services offered by the workshop.
 * @property {LocationCoords} location - Geographic coordinates of the workshop.
 */
interface Workshop {
  id: number;
  name: string;
  address: string;
  phone: string;
  services: string[];
  location: LocationCoords;
}

/**
 * @typedef {Object} EmergencyFormData
 * @property {string} name - Full name of the person requesting assistance.
 * @property {string} memberId - BSK member ID.
 * @property {string} emergencyType - Type of emergency (e.g., 'mechanical', 'medical').
 * @property {string} description - Detailed description of the emergency.
 * @property {string} location - Location of the emergency.
 */
interface EmergencyFormData {
  name: string;
  memberId: string;
  emergencyType: string;
  description: string;
  location: string;
}

/**
 * @typedef {Object} EmergencyApiResponse
 * @property {string} message - Response message from the API.
 * @property {boolean} success - Indicates if the request was successful.
 */
// eslint-disable-next-line @typescript-eslint/no-unused-vars
interface EmergencyApiResponse {
  message: string;
  success: boolean;
}

/**
 * Sos component provides emergency assistance features for BSK Motorcycle Team members.
 * It includes emergency contacts, an emergency request form, and a map of associated workshops.
 * @returns {ReactElement}
 */
const Sos: FC = () => {
  const [activeTab, setActiveTab] = useState<"emergency" | "form" | "workshops">("emergency");
  const [userLocation, setUserLocation] = useState<LocationCoords | null>(null);
  const [nearestWorkshops, setNearestWorkshops] = useState<Workshop[]>([]);
  const [selectedWorkshop, setSelectedWorkshop] = useState<Workshop | null>(null);
  const [formData, setFormData] = useState<EmergencyFormData>({
    name: "",
    memberId: "",
    emergencyType: "mechanical",
    description: "",
    location: ""
  });
  const [locationError, setLocationError] = useState<string | null>(null); // State to handle geolocation errors

  // Google Maps API Key - IMPORTANT: This should be loaded from environment variables
  // and restricted to prevent abuse. For this example, it's hardcoded, but in production,
  // it should be process.env.REACT_APP_GOOGLE_MAPS_API_KEY
  const GOOGLE_MAPS_API_KEY: string = process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY || "YOUR_GOOGLE_MAPS_API_KEY"; // Replace with actual key from .env

  // Map configuration
  const mapContainerStyle: CSSProperties = {
    width: '100%',
    height: '400px'
  };

  // Default center for the map (Bogotá, Colombia)
  const defaultCenter: LocationCoords = {
    lat: 4.6243335, // Central point for Bogotá
    lng: -74.063644
  };

  // Associated workshops (in production, this would come from an API)
  const workshops: Workshop[] = [
    {
      id: 1,
      name: "MotoTaller BSK Norte",
      address: "Calle 123 #45-67, Bogotá",
      phone: "+57 312 5192001",
      services: ["Mecánica general", "Grúa"],
      location: { lat: 4.7200, lng: -74.0450 } // Example coordinates for North Bogotá
    },
    {
      id: 2,
      name: "Taller Rápido BSK Sur",
      address: "Carrera 56 #12-34, Bogotá",
      phone: "+57 312 5192002",
      services: ["Cambio de llantas", "Reparación eléctrica"],
      location: { lat: 4.5500, lng: -74.1200 } // Example coordinates for South Bogotá
    },
    {
      id: 3,
      name: "MotoServicio BSK Centro",
      address: "Avenida 7 #23-45, Bogotá",
      phone: "+57 312 5192003",
      services: ["Ajuste de frenos", "Afinamiento"],
      location: { lat: 4.6000, lng: -74.0700 } // Example coordinates for Central Bogotá
    }
  ];

  /**
   * Finds the nearest workshops based on provided latitude and longitude.
   * This function is memoized using useCallback.
   * @param {number} lat - Latitude of the reference point.
   * @param {number} lng - Longitude of the reference point.
   */
  const findNearestWorkshops = useCallback((lat: number, lng: number) => {
    const sorted = [...workshops].sort((a, b) => {
      // Simple Euclidean distance for quick approximation
      const distA = Math.sqrt(Math.pow(a.location.lat - lat, 2) + Math.pow(a.location.lng - lng, 2));
      const distB = Math.sqrt(Math.pow(b.location.lat - lat, 2) + Math.pow(b.location.lng - lng, 2));
      return distA - distB;
    });
    setNearestWorkshops(sorted.slice(0, 3)); // Show top 3 nearest
  }, [workshops]); // Dependency on workshops array

  // Get user's current location
  useEffect(() => {
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (position: GeolocationPosition) => {
          const { latitude, longitude } = position.coords;
          setUserLocation({ lat: latitude, lng: longitude });
          setFormData(prev => ({ ...prev, location: `Lat: ${latitude.toFixed(4)}, Lng: ${longitude.toFixed(4)}` }));
          findNearestWorkshops(latitude, longitude);
          setLocationError(null); // Clear any previous errors
        },
        (error: GeolocationPositionError) => {
          console.error("Error obteniendo ubicación:", error);
          setLocationError("No se pudo obtener tu ubicación. Por favor, ingresa la ubicación manualmente.");
          setUserLocation(defaultCenter); // Fallback to default center
          findNearestWorkshops(defaultCenter.lat, defaultCenter.lng); // Find nearest to default center
        },
        { enableHighAccuracy: true, timeout: 10000, maximumAge: 0 } // Geolocation options
      );
    } else {
      setLocationError("Tu navegador no soporta geolocalización.");
      setUserLocation(defaultCenter);
      findNearestWorkshops(defaultCenter.lat, defaultCenter.lng);
    }
  }, [findNearestWorkshops, defaultCenter]); // Dependencies for useEffect

  /**
   * Handles the submission of the emergency form.
   * This function is memoized using useCallback.
   * @param {FormEvent<HTMLFormElement>} e - The form submission event.
   */
  const handleSubmit = useCallback(async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    // Basic client-side validation
    if (!formData.name || !formData.memberId || !formData.description || !formData.location) {
      alert("Por favor, completa todos los campos obligatorios.");
      return;
    }

    try {
      // Simular envío exitoso (sin API externa)
      alert('Funcionalidad de emergencias temporalmente deshabilitada. Por favor contacta directamente por WhatsApp o teléfono.');
      setFormData({ // Reset form after successful submission
        name: "",
        memberId: "",
        emergencyType: "mechanical",
        description: "",
        location: userLocation ? `Lat: ${userLocation.lat.toFixed(4)}, Lng: ${userLocation.lng.toFixed(4)}` : ""
      });
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    } catch (error: any) { // Use 'any' for error type as Axios errors can be complex
      console.error('Error enviando solicitud:', error.response ? error.response.data : error.message);
      alert('Error al enviar la solicitud. Por favor, intenta nuevamente.');
    }
  }, [formData, userLocation]); // Dependencies for handleSubmit

  /**
   * Handles changes in form inputs.
   * This function is memoized using useCallback.
   * @param {ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>} e - The change event.
   */
  const handleChange = useCallback((e: ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    });
  }, [formData]); // Dependency on formData to ensure latest state is captured

  return (
  <div className="min-h-screen bg-white dark:bg-gray-900">
      <SEOComponent
        title="SOS Asistencia - BSK Motorcycle Team"
        description="Servicio de asistencia en carretera para miembros de BSK Motorcycle Team. Contactos de emergencia, formulario de solicitud y mapa de talleres."
      />
      {/* Hero Section */}
  <section className="bg-slate-950 dark:bg-gray-900 text-white dark:text-white py-16 px-4 md:px-20">
        <div className="max-w-7xl mx-auto text-center">
          <h1 className="text-4xl md:text-5xl font-bold mb-6 flex items-center justify-center">
            <FaMotorcycle className="mr-4" aria-hidden="true" /> SOS BSK
          </h1>
          <p className="text-xl md:text-2xl max-w-3xl mx-auto flex items-center justify-center">
            <FaShieldAlt className="mr-2" aria-hidden="true" /> Asistencia inmediata para miembros del club
          </p>
        </div>
      </section>

      {/* Tabs */}
      <div className="max-w-7xl mx-auto px-4 md:px-8 mt-8">
  <div className="flex border-b border-gray-200 dark:border-gray-700" role="tablist">
          <button
            type="button"
            className={`py-4 px-6 font-medium flex items-center ${activeTab === "emergency" ? "text-green-400 border-b-2 border-green-400" : "text-gray-500 dark:text-gray-400"}`}
            onClick={() => setActiveTab("emergency")}
            role="tab"
            aria-selected={activeTab === "emergency"}
            id="tab-emergency"
            aria-controls="panel-emergency"
          >
            <FaAmbulance className="mr-2" aria-hidden="true" />
            Contacto de Emergencia
          </button>
          <button
            type="button"
            className={`py-4 px-6 font-medium flex items-center ${activeTab === "form" ? "text-green-400 border-b-2 border-green-400" : "text-gray-500 dark:text-gray-400"}`}
            onClick={() => setActiveTab("form")}
            role="tab"
            aria-selected={activeTab === "form"}
            id="tab-form"
            aria-controls="panel-form"
          >
            <FaPaperPlane className="mr-2" aria-hidden="true" />
            Formulario de Emergencia
          </button>
          <button
            type="button"
            className={`py-4 px-6 font-medium flex items-center ${activeTab === "workshops" ? "text-green-400 border-b-2 border-green-400" : "text-gray-500 dark:text-gray-400"}`}
            onClick={() => setActiveTab("workshops")}
            role="tab"
            aria-selected={activeTab === "workshops"}
            id="tab-workshops"
            aria-controls="panel-workshops"
          >
            <FaTools className="mr-2" aria-hidden="true" />
            Talleres Asociados
          </button>
        </div>
      </div>

      {/* Emergency Contacts Tab Panel */}
      <div 
        role="tabpanel" 
        id="panel-emergency" 
        aria-labelledby="tab-emergency" 
        hidden={activeTab !== "emergency"}
      >
        {activeTab === "emergency" && (
          <div className="py-12 px-4 md:px-8 max-w-7xl mx-auto">
            <div className="bg-red-50 dark:bg-red-900/20 border-l-4 border-red-500 dark:border-red-400 text-red-700 dark:text-red-300 p-4 mb-8 flex items-start" role="alert">
              <FaExclamationTriangle className="text-xl mr-2 mt-0.5" aria-hidden="true" />
              <div>
                <p className="font-bold">¡Importante!</p>
                <p>Usa estos contactos solo para emergencias reales.</p>
              </div>
            </div>

            <div className="grid md:grid-cols-3 gap-8">
              {[
                {
                  type: "Mecánica",
                  icon: <FaWrench className="text-3xl text-green-400" aria-hidden="true" />,
                  description: "Asistencia técnica en carretera",
                  contacts: [
                    {
                      method: "WhatsApp",
                      icon: <FaWhatsapp className="text-xl text-green-500" aria-hidden="true" />,
                      number: "+57 312 5192000",
                      link: "https://wa.me/573125192000?text=Necesito%20asistencia%20mecánica"
                    },
                    {
                      method: "Llamada",
                      icon: <FaPhone className="text-xl text-blue-500" aria-hidden="true" />,
                      number: "+57 312 5192000"
                    }
                  ]
                },
                {
                  type: "Médica",
                  icon: <FaFirstAid className="text-3xl text-red-400" aria-hidden="true" />,
                  description: "Emergencias médicas y primeros auxilios",
                  contacts: [
                    {
                      method: "Línea de emergencia",
                      icon: <FaAmbulance className="text-xl text-red-500" aria-hidden="true" />,
                      number: "123"
                    },
                    {
                      method: "Asistencia BSK",
                      icon: <FaPhone className="text-xl text-blue-500" aria-hidden="true" />,
                      number: "+57 312 5192001"
                    }
                  ]
                },
                {
                  type: "Seguridad",
                  icon: <FaUserShield className="text-3xl text-blue-400" aria-hidden="true" />,
                  description: "Emergencias de seguridad y protección",
                  contacts: [
                    {
                      method: "Policía",
                      icon: <FaShieldAlt className="text-xl text-blue-500" aria-hidden="true" />,
                      number: "123"
                    },
                    {
                      method: "Seguridad BSK",
                      icon: <FaPhone className="text-xl text-blue-500" aria-hidden="true" />,
                      number: "+57 312 5192002"
                    }
                  ]
                }
              ].map((service, index) => (
                <div key={index} className="bg-gray-50 dark:bg-gray-800 rounded-xl p-6 shadow-sm">
                  <div className="flex items-center mb-4">
                    {service.icon}
                    <h2 className="text-2xl font-bold text-slate-950 ml-3">{service.type}</h2>
                  </div>
                  <p className="text-gray-700 dark:text-gray-200 mb-6">{service.description}</p>

                  <div className="space-y-4">
                    {service.contacts.map((contact, idx) => (
                      <div key={idx} className="bg-white dark:bg-gray-900 p-4 rounded-lg">
                        <div className="flex items-center mb-2">
                          {contact.icon}
                          <span className="font-semibold ml-2">{contact.method}</span>
                        </div>
                        <p className="text-gray-800 dark:text-gray-200 mb-3">{contact.number}</p>
                        {contact.link ? (
                          <a 
                            href={contact.link} 
                            className="inline-flex items-center bg-green-500 dark:bg-green-600 text-white px-4 py-2 rounded-lg hover:bg-green-600 dark:hover:bg-green-500"
                            target="_blank"
                            rel="noopener noreferrer"
                            aria-label={`Contactar por WhatsApp para ${service.type}`}
                          >
                            <FaWhatsapp className="mr-2" aria-hidden="true" />
                            Contactar por WhatsApp
                          </a>
                        ) : (
                          <a 
                            href={`tel:${contact.number.replace(/\s/g, '')}`} 
                            className="inline-flex items-center bg-blue-500 dark:bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-600 dark:hover:bg-blue-500"
                            aria-label={`Llamar a ${service.type} al número ${contact.number}`}
                          >
                            <FaPhone className="mr-2" aria-hidden="true" />
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
      </div>

      {/* Emergency Form Tab Panel */}
      <div 
        role="tabpanel" 
        id="panel-form" 
        aria-labelledby="tab-form" 
        hidden={activeTab !== "form"}
      >
        {activeTab === "form" && (
          <div className="py-12 px-4 md:px-8 max-w-3xl mx-auto">
            <div className="bg-white dark:bg-gray-800 rounded-xl shadow-md p-6 md:p-8">
              <h2 className="text-2xl font-bold text-slate-950 dark:text-white mb-6 flex items-center">
                <FaPaperPlane className="mr-2 text-green-400" aria-hidden="true" />
                Formulario de Emergencia
              </h2>

              <form onSubmit={handleSubmit} aria-label="Formulario de Solicitud de Emergencia">
                <div className="grid md:grid-cols-2 gap-6 mb-6">
                  <div>
                    <label htmlFor="full-name" className="flex text-gray-700 dark:text-gray-200 mb-2 items-center">
                      <FaUserAlt className="mr-2 text-gray-500" aria-hidden="true" />
                      Nombre Completo
                    </label>
                    <input
                      type="text"
                      id="full-name"
                      name="name"
                      value={formData.name}
                      onChange={handleChange}
                      className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-green-400 focus:border-green-400 bg-white dark:bg-gray-900 text-gray-900 dark:text-gray-100"
                      required
                      aria-required="true"
                    />
                  </div>
                  <div>
                    <label htmlFor="member-id" className="flex text-gray-700 dark:text-gray-200 mb-2 items-center">
                      <FaUserShield className="mr-2 text-gray-500" aria-hidden="true" />
                      Número de Socio BSK
                    </label>
                    <input
                      type="text"
                      id="member-id"
                      name="memberId"
                      value={formData.memberId}
                      onChange={handleChange}
                      className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-green-400 focus:border-green-400 bg-white dark:bg-gray-900 text-gray-900 dark:text-gray-100"
                      required
                      aria-required="true"
                    />
                  </div>
                </div>

                <div className="mb-6">
                  <label htmlFor="emergency-type" className="flex text-gray-700 dark:text-gray-200 mb-2 items-center">
                    <FaShieldAlt className="mr-2 text-gray-500" aria-hidden="true" />
                    Tipo de Emergencia
                  </label>
                  <select
                    id="emergency-type"
                    name="emergencyType"
                    value={formData.emergencyType}
                    onChange={handleChange}
                    className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-green-400 focus:border-green-400 bg-white dark:bg-gray-900 text-gray-900 dark:text-gray-100"
                    required
                    aria-required="true"
                  >
                    <option value="mechanical">Mecánica/Asistencia en carretera</option>
                    <option value="medical">Emergencia Médica</option>
                    <option value="security">Emergencia de Seguridad</option>
                    <option value="other">Otro</option>
                  </select>
                </div>

                <div className="mb-6">
                  <label htmlFor="description" className="block text-gray-700 dark:text-gray-200 mb-2">Descripción</label>
                  <textarea
                    id="description"
                    name="description"
                    value={formData.description}
                    onChange={handleChange}
                    className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-green-400 focus:border-green-400 bg-white dark:bg-gray-900 text-gray-900 dark:text-gray-100"
                    rows={4}
                    required
                    aria-required="true"
                  ></textarea>
                </div>

                <div className="mb-6">
                  <label htmlFor="location" className="flex text-gray-700 dark:text-gray-200 mb-2 items-center">
                    <FaMapMarkerAlt className="mr-2 text-gray-500" aria-hidden="true" />
                    Ubicación
                  </label>
                  {userLocation ? (
                    <div className="flex items-center mb-2">
                      <FaMapMarkerAlt className="text-red-500 mr-2" aria-hidden="true" />
                      <span className="text-sm">Detectada: {userLocation.lat.toFixed(4)}, {userLocation.lng.toFixed(4)}</span>
                    </div>
                  ) : locationError ? (
                    <p className="text-red-500 dark:text-red-400 mb-2" role="alert">{locationError}</p>
                  ) : (
                    <p className="text-gray-500 dark:text-gray-400 mb-2">Cargando ubicación...</p>
                  )}
                  <input
                    type="text"
                    id="location"
                    name="location"
                    value={formData.location}
                    onChange={handleChange}
                    placeholder="Describe tu ubicación (ciudad, dirección, puntos de referencia)"
                    className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-green-400 focus:border-green-400 bg-white dark:bg-gray-900 text-gray-900 dark:text-gray-100"
                    required
                    aria-required="true"
                  />
                </div>

                <button
                  type="submit"
                  className="bg-slate-950 dark:bg-gray-900 text-white font-bold py-3 px-6 rounded-lg hover:bg-gray-800 dark:hover:bg-gray-700 flex items-center justify-center"
                >
                  <FaPaperPlane className="mr-2" aria-hidden="true" />
                  Enviar Solicitud
                </button>
              </form>
            </div>
          </div>
        )}
      </div>

      {/* Workshops Tab Panel */}
      <div 
        role="tabpanel" 
        id="panel-workshops" 
        aria-labelledby="tab-workshops" 
        hidden={activeTab !== "workshops"}
      >
        {activeTab === "workshops" && (
          <div className="py-12 px-4 md:px-8 max-w-7xl mx-auto">
            <h2 className="text-2xl font-bold text-slate-950 mb-6 flex items-center">
              <FaTools className="mr-2 text-green-400" aria-hidden="true" />
              Talleres Asociados
            </h2>

            <div className="mb-8 bg-white dark:bg-gray-800 rounded-xl shadow-md p-6">
              <h3 className="text-xl font-semibold text-slate-950 dark:text-white mb-4 flex items-center">
                <FaMapMarkerAlt className="text-red-500 mr-2" aria-hidden="true" />
                Talleres más cercanos a tu ubicación
              </h3>

              {/* LoadScript only if API key is available */}
              {GOOGLE_MAPS_API_KEY !== "YOUR_GOOGLE_MAPS_API_KEY" ? (
                <LoadScript googleMapsApiKey={GOOGLE_MAPS_API_KEY}>
                  <GoogleMap
                    mapContainerStyle={mapContainerStyle}
                    center={userLocation || defaultCenter}
                    zoom={userLocation ? 14 : 12} // Zoom in more if user location is available
                  >
                    {userLocation && (
                      <Marker
                        position={userLocation}
                        icon={{
                          url: "https://maps.google.com/mapfiles/ms/icons/blue-dot.png",
                          scaledSize: new window.google.maps.Size(32, 32) // Ensure consistent size
                        }}
                        title="Tu ubicación"
                      />
                    )}

                    {nearestWorkshops.map((workshop) => (
                      <Marker
                        key={workshop.id}
                        position={workshop.location}
                        onClick={() => setSelectedWorkshop(workshop)}
                        icon={{
                          url: "https://maps.google.com/mapfiles/ms/icons/green-dot.png",
                          scaledSize: new window.google.maps.Size(32, 32) // Ensure consistent size
                        }}
                        title={workshop.name}
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
                            className="text-blue-500 hover:underline flex items-center"
                            aria-label={`Llamar a ${selectedWorkshop.name}`}
                          >
                            <FaPhone className="mr-1" aria-hidden="true" /> Llamar ahora
                          </a>
                        </div>
                      </InfoWindow>
                    )}
                  </GoogleMap>
                </LoadScript>
              ) : (
                <div className="text-center py-10 bg-gray-100 dark:bg-gray-900 rounded-lg">
                  <p className="text-red-500 dark:text-red-400">La clave de la API de Google Maps no está configurada. El mapa no se mostrará.</p>
                  <p className="text-gray-600 dark:text-gray-300 text-sm mt-2">Por favor, configura `GOOGLE_MAPS_API_KEY` en tu entorno.</p>
                </div>
              )}
            </div>

            <div className="grid md:grid-cols-3 gap-6">
              {nearestWorkshops.map((workshop) => (
                <div key={workshop.id} className="bg-white dark:bg-gray-800 rounded-xl shadow-md overflow-hidden">
                  <div className="p-6">
                    <h3 className="text-xl font-bold text-slate-950 dark:text-white mb-2">{workshop.name}</h3>
                    <p className="text-gray-600 dark:text-gray-300 mb-4 flex items-center">
                      <FaMapMarkerAlt className="mr-2 text-red-500" aria-hidden="true" />
                      {workshop.address}
                    </p>
                    <p className="text-gray-600 dark:text-gray-300 mb-4 flex items-center">
                      <FaPhone className="mr-2 text-blue-500" aria-hidden="true" />
                      {workshop.phone}
                    </p>
                    <div className="mb-4">
                      <h4 className="font-semibold text-gray-700 dark:text-gray-200 mb-2 flex items-center">
                        <FaWrench className="mr-2 text-green-500" aria-hidden="true" />
                        Servicios:
                      </h4>
                      <ul className="list-disc pl-5">
                        {workshop.services.map((service, idx) => (
                          <li key={idx} className="text-gray-600 dark:text-gray-300">{service}</li>
                        ))}
                      </ul>
                    </div>
                    <div className="flex space-x-3">
                      <a
                        href={`tel:${workshop.phone.replace(/\s/g, '')}`}
                        className="bg-blue-500 dark:bg-blue-600 text-white px-4 py-2 rounded-lg flex items-center hover:bg-blue-600 dark:hover:bg-blue-500"
                        aria-label={`Llamar a ${workshop.name}`}
                      >
                        <FaPhone className="mr-2" aria-hidden="true" />
                        Llamar
                      </a>
                      <a
                        href={`https://www.google.com/maps/dir/?api=1&destination=${workshop.location.lat},${workshop.location.lng}`}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="bg-slate-950 dark:bg-gray-900 text-white px-4 py-2 rounded-lg flex items-center hover:bg-gray-800 dark:hover:bg-gray-700"
                        aria-label={`Cómo llegar a ${workshop.name}`}
                      >
                        <FaMapMarkerAlt className="mr-2" aria-hidden="true" />
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
    </div>
  );
};

export default Sos;
