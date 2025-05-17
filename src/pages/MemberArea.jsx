import React, { useState } from 'react';
import { Tab, Tabs, TabList, TabPanel } from 'react-tabs';
import 'react-tabs/style/react-tabs.css';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { 
  faUserCog, faCalendarAlt, faMotorcycle, 
  faStar, faMedal, faHeadset, faHistory,
  faChartLine, faTicketAlt, faUsers,
  faMapMarkedAlt, faStore, faShieldAlt,
  faBell, faCog, faSignOutAlt, faChevronDown,
  faExclamationTriangle, faCheckCircle, faClock
} from '@fortawesome/free-solid-svg-icons';

const MemberArea = () => {
  const [activeTab, setActiveTab] = useState(0);
  const [userData, setUserData] = useState({
    name: 'Juan Pérez',
    membership: 'Gold',
    membershipExpiry: '2023-12-31',
    points: 1250,
    avatar: 'https://randomuser.me/api/portraits/men/32.jpg',
    nextEvent: 'Rodada Aniversario BSK - 15 Octubre',
    registeredEvents: [
      { id: 1, name: 'Rodada Nocturna', date: '2023-10-05', status: 'confirmed' },
      { id: 2, name: 'Taller Mecánica Básica', date: '2023-10-12', status: 'pending' },
      { id: 3, name: 'Concentración Nacional', date: '2023-11-05', status: 'confirmed' }
    ],
    upcomingEvents: [
      { id: 4, name: 'Rodada de la Luna Llena', date: '2023-11-08' },
      { id: 5, name: 'Festival Motero', date: '2023-11-20' },
      { id: 6, name: 'Campaña Solidaria Navideña', date: '2023-12-10' }
    ],
    pointsBreakdown: {
      rides: 800,
      events: 300,
      partners: 100,
      others: 50,
      history: [
        { date: '2023-09-15', description: 'Rodada Montaña', points: 200 },
        { date: '2023-08-20', description: 'Taller Seguridad', points: 100 },
        { date: '2023-07-10', description: 'Compra en Aliado', points: 50 }
      ]
    },
    membershipBenefits: [
      'Descuento 20% en talleres',
      'Acceso a eventos exclusivos',
      'Asistencia vial gratuita',
      'Seguro básico de accidentes'
    ],
    pqrsd: [
      { id: 1, type: 'Solicitud', subject: 'Cambio de talla en chaqueta', status: 'En proceso', date: '2023-09-01' },
      { id: 2, type: 'Felicitación', subject: 'Excelente organización rodada', status: 'Cerrado', date: '2023-08-15' }
    ]
  });

  const [formData, setFormData] = useState({
    name: userData.name,
    email: 'juan.perez@example.com',
    phone: '+57 310 123 4567',
    emergencyContact: 'María Gómez - +57 315 987 6543',
    bikeModel: 'Harley-Davidson Street Glide',
    bikeYear: '2020',
    bloodType: 'O+',
    allergies: 'Ninguna'
  });

  const [newPqrsd, setNewPqrsd] = useState({
    type: 'Petición',
    subject: '',
    description: ''
  });

  const [dropdownOpen, setDropdownOpen] = useState(null);

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handlePqrsdSubmit = (e) => {
    e.preventDefault();
    const newEntry = {
      id: userData.pqrsd.length + 1,
      type: newPqrsd.type,
      subject: newPqrsd.subject,
      status: 'Nuevo',
      date: new Date().toISOString().split('T')[0]
    };
    setUserData(prev => ({
      ...prev,
      pqrsd: [...prev.pqrsd, newEntry]
    }));
    setNewPqrsd({ type: 'Petición', subject: '', description: '' });
    alert('Tu PQRSDF ha sido registrada con éxito. Nos comunicaremos contigo pronto.');
  };

  const handleEventAction = (eventId, action) => {
    alert(`Acción "${action}" para evento ${eventId} será procesada`);
  };

  const handleMembershipAction = (action) => {
    alert(`Acción "${action}" en membresía será procesada`);
  };

  const toggleDropdown = (id) => {
    setDropdownOpen(dropdownOpen === id ? null : id);
  };

  const statusIcon = (status) => {
    switch(status) {
      case 'confirmed':
        return <FontAwesomeIcon icon={faCheckCircle} className="text-green-500 mr-1" />;
      case 'pending':
        return <FontAwesomeIcon icon={faClock} className="text-yellow-500 mr-1" />;
      case 'En proceso':
        return <FontAwesomeIcon icon={faClock} className="text-blue-500 mr-1" />;
      case 'Cerrado':
        return <FontAwesomeIcon icon={faCheckCircle} className="text-gray-500 mr-1" />;
      default:
        return <FontAwesomeIcon icon={faExclamationTriangle} className="text-red-500 mr-1" />;
    }
  };

  return (
    <div className="bg-gray-50 min-h-screen p-4 md:p-8">
      <div className="max-w-7xl mx-auto bg-white rounded-xl shadow-md overflow-hidden">
        {/* Header */}
        <div className="p-6 flex flex-col md:flex-row justify-between items-start md:items-center border-b border-gray-200">
          <div className="flex items-center mb-4 md:mb-0">
            <img 
              src={userData.avatar} 
              alt="Avatar" 
              className="w-16 h-16 md:w-20 md:h-20 rounded-full border-4 border-orange-500 mr-4" 
            />
            <div>
              <h2 className="text-xl md:text-2xl font-bold text-gray-800">{userData.name}</h2>
              <div className="flex items-center mt-1">
                <span className="bg-gradient-to-r from-orange-500 to-yellow-500 text-white text-xs md:text-sm px-3 py-1 rounded-full flex items-center">
                  <FontAwesomeIcon icon={faMedal} className="mr-1" /> {userData.membership}
                  <span className="ml-2 text-white text-opacity-90">Vence: {userData.membershipExpiry}</span>
                </span>
              </div>
              <div className="flex items-center mt-2">
                <FontAwesomeIcon icon={faStar} className="text-yellow-500 mr-1" />
                <span className="font-semibold text-gray-700">{userData.points} Puntos</span>
              </div>
            </div>
          </div>
          
          <div className="flex flex-wrap gap-2 w-full md:w-auto">
            <button className="flex items-center bg-gray-100 hover:bg-gray-200 text-gray-800 px-3 py-2 rounded-lg text-sm transition">
              <FontAwesomeIcon icon={faBell} className="mr-2" /> Notificaciones
            </button>
            <button className="flex items-center bg-gray-100 hover:bg-gray-200 text-gray-800 px-3 py-2 rounded-lg text-sm transition">
              <FontAwesomeIcon icon={faCog} className="mr-2" /> Configuración
            </button>
            <button className="flex items-center bg-gray-100 hover:bg-gray-200 text-gray-800 px-3 py-2 rounded-lg text-sm transition">
              <FontAwesomeIcon icon={faSignOutAlt} className="mr-2" /> Cerrar sesión
            </button>
          </div>
        </div>

        {/* Main Content */}
        <Tabs selectedIndex={activeTab} onSelect={index => setActiveTab(index)}>
          <TabList className="flex overflow-x-auto border-b border-gray-200">
            <Tab className="px-4 py-3 text-sm font-medium cursor-pointer focus:outline-none border-b-2 border-transparent hover:text-orange-600 hover:border-orange-300 transition flex items-center">
              <FontAwesomeIcon icon={faUserCog} className="mr-2" /> Mi Cuenta
            </Tab>
            <Tab className="px-4 py-3 text-sm font-medium cursor-pointer focus:outline-none border-b-2 border-transparent hover:text-orange-600 hover:border-orange-300 transition flex items-center">
              <FontAwesomeIcon icon={faCalendarAlt} className="mr-2" /> Mis Eventos
            </Tab>
            <Tab className="px-4 py-3 text-sm font-medium cursor-pointer focus:outline-none border-b-2 border-transparent hover:text-orange-600 hover:border-orange-300 transition flex items-center">
              <FontAwesomeIcon icon={faMotorcycle} className="mr-2" /> Próximas Rodadas
            </Tab>
            <Tab className="px-4 py-3 text-sm font-medium cursor-pointer focus:outline-none border-b-2 border-transparent hover:text-orange-600 hover:border-orange-300 transition flex items-center">
              <FontAwesomeIcon icon={faStar} className="mr-2" /> Mis Puntos
            </Tab>
            <Tab className="px-4 py-3 text-sm font-medium cursor-pointer focus:outline-none border-b-2 border-transparent hover:text-orange-600 hover:border-orange-300 transition flex items-center">
              <FontAwesomeIcon icon={faMedal} className="mr-2" /> Mi Membresía
            </Tab>
            <Tab className="px-4 py-3 text-sm font-medium cursor-pointer focus:outline-none border-b-2 border-transparent hover:text-orange-600 hover:border-orange-300 transition flex items-center">
              <FontAwesomeIcon icon={faHeadset} className="mr-2" /> PQRSDF
            </Tab>
            <Tab className="px-4 py-3 text-sm font-medium cursor-pointer focus:outline-none border-b-2 border-transparent hover:text-orange-600 hover:border-orange-300 transition flex items-center">
              <FontAwesomeIcon icon={faUsers} className="mr-2" /> Comunidad
            </Tab>
            <Tab className="px-4 py-3 text-sm font-medium cursor-pointer focus:outline-none border-b-2 border-transparent hover:text-orange-600 hover:border-orange-300 transition flex items-center">
              <FontAwesomeIcon icon={faStore} className="mr-2" /> Aliados
            </Tab>
          </TabList>

          {/* Mi Cuenta */}
          <TabPanel className="p-4 md:p-6">
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
              {/* Información Personal */}
              <div className="lg:col-span-2 bg-gray-50 rounded-lg p-6 shadow-sm">
                <h3 className="text-lg font-semibold text-gray-800 mb-4 flex items-center">
                  <FontAwesomeIcon icon={faUserCog} className="text-orange-500 mr-2" /> Información Personal
                </h3>
                <form className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Nombre Completo</label>
                    <input
                      type="text"
                      name="name"
                      value={formData.name}
                      onChange={handleInputChange}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-orange-500"
                    />
                  </div>
                  
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">Email</label>
                      <input
                        type="email"
                        name="email"
                        value={formData.email}
                        onChange={handleInputChange}
                        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-orange-500"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">Teléfono</label>
                      <input
                        type="tel"
                        name="phone"
                        value={formData.phone}
                        onChange={handleInputChange}
                        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-orange-500"
                      />
                    </div>
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Contacto de Emergencia</label>
                    <input
                      type="text"
                      name="emergencyContact"
                      value={formData.emergencyContact}
                      onChange={handleInputChange}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-orange-500"
                    />
                  </div>
                  
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">Moto</label>
                      <input
                        type="text"
                        name="bikeModel"
                        value={formData.bikeModel}
                        onChange={handleInputChange}
                        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-orange-500"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">Año</label>
                      <input
                        type="text"
                        name="bikeYear"
                        value={formData.bikeYear}
                        onChange={handleInputChange}
                        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-orange-500"
                      />
                    </div>
                  </div>
                  
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">Tipo de Sangre</label>
                      <input
                        type="text"
                        name="bloodType"
                        value={formData.bloodType}
                        onChange={handleInputChange}
                        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-orange-500"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">Alergias</label>
                      <input
                        type="text"
                        name="allergies"
                        value={formData.allergies}
                        onChange={handleInputChange}
                        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-orange-500"
                      />
                    </div>
                  </div>
                  
                  <button 
                    type="button" 
                    className="bg-orange-500 hover:bg-orange-600 text-white px-4 py-2 rounded-md transition"
                  >
                    Guardar Cambios
                  </button>
                </form>
              </div>
              
              {/* Columnas laterales */}
              <div className="space-y-6">
                {/* Seguridad */}
                <div className="bg-gray-50 rounded-lg p-6 shadow-sm">
                  <h3 className="text-lg font-semibold text-gray-800 mb-4 flex items-center">
                    <FontAwesomeIcon icon={faShieldAlt} className="text-orange-500 mr-2" /> Seguridad
                  </h3>
                  <div className="space-y-3">
                    <button className="w-full text-left bg-white hover:bg-gray-100 border border-gray-200 px-4 py-2 rounded-md transition">
                      Cambiar Contraseña
                    </button>
                    <button className="w-full text-left bg-white hover:bg-gray-100 border border-gray-200 px-4 py-2 rounded-md transition">
                      Autenticación en Dos Pasos
                    </button>
                    <button className="w-full text-left bg-white hover:bg-gray-100 border border-gray-200 px-4 py-2 rounded-md transition">
                      Dispositivos Conectados
                    </button>
                  </div>
                </div>
                
                {/* Preferencias de Rodada */}
                <div className="bg-gray-50 rounded-lg p-6 shadow-sm">
                  <h3 className="text-lg font-semibold text-gray-800 mb-4 flex items-center">
                    <FontAwesomeIcon icon={faMotorcycle} className="text-orange-500 mr-2" /> Preferencias de Rodada
                  </h3>
                  <div className="space-y-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">Tipo de Rodada Preferida</label>
                      <select className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-orange-500">
                        <option>Carretera</option>
                        <option>Off-Road</option>
                        <option>Urbana</option>
                        <option>Todas</option>
                      </select>
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">Nivel de Dificultad Preferido</label>
                      <select className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-orange-500">
                        <option>Principiante</option>
                        <option>Intermedio</option>
                        <option>Avanzado</option>
                        <option>Extremo</option>
                      </select>
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">Frecuencia de Notificaciones</label>
                      <select className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-orange-500">
                        <option>Todas las notificaciones</option>
                        <option>Solo eventos importantes</option>
                        <option>Solo mis eventos registrados</option>
                      </select>
                    </div>
                    <button 
                      type="button" 
                      className="bg-orange-500 hover:bg-orange-600 text-white px-4 py-2 rounded-md transition"
                    >
                      Guardar Preferencias
                    </button>
                  </div>
                </div>
              </div>
            </div>
          </TabPanel>

          {/* Mis Eventos */}
          <TabPanel className="p-4 md:p-6">
            <div className="mb-8">
              <h3 className="text-xl font-semibold text-gray-800 mb-4">Mis Eventos Registrados</h3>
              <div className="space-y-4">
                {userData.registeredEvents.map(event => (
                  <div key={event.id} className={`border rounded-lg overflow-hidden ${event.status === 'confirmed' ? 'border-green-200 bg-green-50' : 'border-yellow-200 bg-yellow-50'}`}>
                    <div className="p-4 md:p-6 grid grid-cols-1 md:grid-cols-3 gap-4">
                      <div>
                        <h4 className="font-semibold text-gray-800">{event.name}</h4>
                        <div className="text-sm text-gray-600 mt-1">{event.date}</div>
                        <div className={`inline-flex items-center mt-2 text-sm px-3 py-1 rounded-full ${event.status === 'confirmed' ? 'bg-green-100 text-green-800' : 'bg-yellow-100 text-yellow-800'}`}>
                          {statusIcon(event.status)}
                          {event.status === 'confirmed' ? 'Confirmado' : 'Pendiente'}
                        </div>
                      </div>
                      <div className="md:col-span-2">
                        <div className="flex flex-wrap gap-2 justify-end">
                          <button 
                            onClick={() => handleEventAction(event.id, 'details')}
                            className="bg-white hover:bg-gray-100 border border-gray-300 px-3 py-1 rounded-md text-sm transition"
                          >
                            Detalles
                          </button>
                          <button 
                            onClick={() => handleEventAction(event.id, 'cancel')}
                            className="bg-white hover:bg-red-50 border border-red-200 text-red-600 px-3 py-1 rounded-md text-sm transition"
                          >
                            Cancelar
                          </button>
                          {event.status === 'pending' && (
                            <button 
                              onClick={() => handleEventAction(event.id, 'confirm')}
                              className="bg-green-500 hover:bg-green-600 text-white px-3 py-1 rounded-md text-sm transition"
                            >
                              Confirmar
                            </button>
                          )}
                          <button 
                            onClick={() => handleEventAction(event.id, 'share')}
                            className="bg-white hover:bg-gray-100 border border-gray-300 px-3 py-1 rounded-md text-sm transition"
                          >
                            Compartir
                          </button>
                        </div>
                      </div>
                    </div>
                    {dropdownOpen === event.id && (
                      <div className="bg-white p-4 border-t border-gray-200">
                        <h5 className="font-medium mb-2">Detalles del Evento:</h5>
                        <p className="text-sm text-gray-600">Lugar: Parque Principal - 8:00 AM</p>
                        <p className="text-sm text-gray-600">Requisitos: Casco, chaleco reflectivo, documentos al día</p>
                        <p className="text-sm text-gray-600 mt-2">Puntos por asistencia: 50</p>
                      </div>
                    )}
                    <div 
                      className="bg-gray-100 text-center py-1 cursor-pointer text-sm text-gray-600 hover:bg-gray-200 transition"
                      onClick={() => toggleDropdown(event.id)}
                    >
                      <FontAwesomeIcon icon={faChevronDown} className={`transition-transform ${dropdownOpen === event.id ? 'transform rotate-180' : ''}`} />
                    </div>
                  </div>
                ))}
              </div>
            </div>
            
            <div>
              <h3 className="text-xl font-semibold text-gray-800 mb-4">Calendario de Eventos</h3>
              <div className="bg-white border rounded-lg p-4 min-h-64 flex items-center justify-center">
                <div className="text-center text-gray-500">
                  [Calendario interactivo con eventos destacados]
                </div>
              </div>
            </div>
          </TabPanel>

          {/* Próximas Rodadas */}
          <TabPanel className="p-4 md:p-6">
            <div className="mb-6">
              <h3 className="text-xl font-semibold text-gray-800 mb-4">Próximos Eventos del Club</h3>
              <div className="space-y-4">
                {userData.upcomingEvents.map(event => (
                  <div key={event.id} className="border border-gray-200 rounded-lg overflow-hidden bg-white">
                    <div className="p-4 md:p-6">
                      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                        <div className="md:col-span-2">
                          <h4 className="font-semibold text-gray-800">{event.name}</h4>
                          <div className="text-sm text-gray-600 mt-1">{event.date}</div>
                          <p className="text-sm text-gray-600 mt-2">
                            Descripción breve del evento y lo que incluye...
                          </p>
                        </div>
                        <div className="flex flex-wrap gap-2 md:justify-end items-start">
                          <button 
                            onClick={() => handleEventAction(event.id, 'details')}
                            className="bg-white hover:bg-gray-100 border border-gray-300 px-3 py-1 rounded-md text-sm transition"
                          >
                            Ver Detalles
                          </button>
                          <button 
                            onClick={() => handleEventAction(event.id, 'register')}
                            className="bg-orange-500 hover:bg-orange-600 text-white px-3 py-1 rounded-md text-sm transition"
                          >
                            Registrar Asistencia
                          </button>
                          <button 
                            onClick={() => handleEventAction(event.id, 'reminder')}
                            className="bg-white hover:bg-gray-100 border border-gray-300 px-3 py-1 rounded-md text-sm transition"
                          >
                            Recordarme
                          </button>
                          <button 
                            onClick={() => handleEventAction(event.id, 'share')}
                            className="bg-white hover:bg-gray-100 border border-gray-300 px-3 py-1 rounded-md text-sm transition"
                          >
                            Compartir
                          </button>
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
            
            <div className="bg-gray-50 p-4 rounded-lg">
              <h4 className="font-medium text-gray-800 mb-3">Filtrar por categoría:</h4>
              <div className="flex flex-wrap gap-2">
                <button className="bg-orange-500 text-white px-3 py-1 rounded-full text-sm">Todos</button>
                <button className="bg-white hover:bg-gray-100 border border-gray-300 px-3 py-1 rounded-full text-sm">Rodadas</button>
                <button className="bg-white hover:bg-gray-100 border border-gray-300 px-3 py-1 rounded-full text-sm">Talleres</button>
                <button className="bg-white hover:bg-gray-100 border border-gray-300 px-3 py-1 rounded-full text-sm">Eventos Sociales</button>
                <button className="bg-white hover:bg-gray-100 border border-gray-300 px-3 py-1 rounded-full text-sm">Competencias</button>
                <button className="bg-white hover:bg-gray-100 border border-gray-300 px-3 py-1 rounded-full text-sm">Viajes</button>
              </div>
            </div>
          </TabPanel>

          {/* Mis Puntos */}
          <TabPanel className="p-4 md:p-6">
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
              {/* Resumen de Puntos */}
              <div className="lg:col-span-2 space-y-6">
                <div className="bg-gradient-to-r from-orange-500 to-yellow-500 rounded-lg p-6 text-white shadow">
                  <h3 className="text-xl font-semibold mb-2">Puntos Totales</h3>
                  <div className="text-4xl font-bold">{userData.points}</div>
                  <p className="text-orange-100 mt-2">Solo te faltan 250 puntos para el siguiente nivel</p>
                </div>
                
                <div className="bg-white border rounded-lg p-6 shadow-sm">
                  <h3 className="text-lg font-semibold text-gray-800 mb-4">Desglose de Puntos</h3>
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                    <div className="bg-gray-50 p-4 rounded-lg text-center">
                      <div className="text-gray-600 text-sm">Rodadas</div>
                      <div className="text-2xl font-bold text-orange-500">{userData.pointsBreakdown.rides}</div>
                      <div className="text-xs text-gray-500">pts</div>
                    </div>
                    <div className="bg-gray-50 p-4 rounded-lg text-center">
                      <div className="text-gray-600 text-sm">Eventos</div>
                      <div className="text-2xl font-bold text-orange-500">{userData.pointsBreakdown.events}</div>
                      <div className="text-xs text-gray-500">pts</div>
                    </div>
                    <div className="bg-gray-50 p-4 rounded-lg text-center">
                      <div className="text-gray-600 text-sm">Consumo Aliados</div>
                      <div className="text-2xl font-bold text-orange-500">{userData.pointsBreakdown.partners}</div>
                      <div className="text-xs text-gray-500">pts</div>
                    </div>
                    <div className="bg-gray-50 p-4 rounded-lg text-center">
                      <div className="text-gray-600 text-sm">Otros</div>
                      <div className="text-2xl font-bold text-orange-500">{userData.pointsBreakdown.others}</div>
                      <div className="text-xs text-gray-500">pts</div>
                    </div>
                  </div>
                </div>
                
                {/* Historial de Puntos */}
                <div className="bg-white border rounded-lg p-6 shadow-sm">
                  <h3 className="text-lg font-semibold text-gray-800 mb-4 flex items-center">
                    <FontAwesomeIcon icon={faHistory} className="text-orange-500 mr-2" /> Historial de Puntos
                  </h3>
                  <div className="overflow-x-auto">
                    <table className="min-w-full divide-y divide-gray-200">
                      <thead className="bg-gray-50">
                        <tr>
                          <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase">Fecha</th>
                          <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase">Descripción</th>
                          <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase">Puntos</th>
                        </tr>
                      </thead>
                      <tbody className="bg-white divide-y divide-gray-200">
                        {userData.pointsBreakdown.history.map((item, index) => (
                          <tr key={index}>
                            <td className="px-4 py-2 whitespace-nowrap text-sm text-gray-600">{item.date}</td>
                            <td className="px-4 py-2 text-sm text-gray-600">{item.description}</td>
                            <td className="px-4 py-2 whitespace-nowrap text-sm font-medium text-green-600">+{item.points}</td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </div>
              </div>
              
              {/* Recompensas */}
              <div className="space-y-6">
                <div className="bg-white border rounded-lg p-6 shadow-sm">
                  <h3 className="text-lg font-semibold text-gray-800 mb-4 flex items-center">
                    <FontAwesomeIcon icon={faTicketAlt} className="text-orange-500 mr-2" /> Recompensas Disponibles
                  </h3>
                  <div className="space-y-4">
                    <div className="border border-gray-200 rounded-lg p-4">
                      <div className="text-orange-500 font-bold text-right">500 pts</div>
                      <h4 className="font-medium text-gray-800 mt-2">Descuento 10% en próximo taller</h4>
                      <button className="mt-3 w-full bg-orange-500 hover:bg-orange-600 text-white py-1 rounded-md text-sm transition">
                        Canjear
                      </button>
                    </div>
                    <div className="border border-gray-200 rounded-lg p-4">
                      <div className="text-orange-500 font-bold text-right">1000 pts</div>
                      <h4 className="font-medium text-gray-800 mt-2">Kit BSK Exclusivo</h4>
                      <button className="mt-3 w-full bg-orange-500 hover:bg-orange-600 text-white py-1 rounded-md text-sm transition">
                        Canjear
                      </button>
                    </div>
                    <div className="border border-gray-200 rounded-lg p-4">
                      <div className="text-orange-500 font-bold text-right">1500 pts</div>
                      <h4 className="font-medium text-gray-800 mt-2">Upgrade de Membresía por 3 meses</h4>
                      <button className="mt-3 w-full bg-orange-500 hover:bg-orange-600 text-white py-1 rounded-md text-sm transition">
                        Canjear
                      </button>
                    </div>
                  </div>
                </div>
                
                <div className="bg-blue-50 border border-blue-100 rounded-lg p-4">
                  <h4 className="font-medium text-blue-800 mb-2">¿Cómo ganar más puntos?</h4>
                  <ul className="text-sm text-blue-700 space-y-1 list-disc list-inside">
                    <li>Asistir a rodadas oficiales (+50 a +200 pts)</li>
                    <li>Participar en talleres (+100 pts)</li>
                    <li>Compras en aliados comerciales (5% del valor en pts)</li>
                    <li>Invitar nuevos miembros (+500 pts)</li>
                    <li>Organizar eventos (+300 pts)</li>
                  </ul>
                </div>
              </div>
            </div>
          </TabPanel>

          {/* Mi Membresía */}
          <TabPanel className="p-4 md:p-6">
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
              <div className="lg:col-span-2 space-y-6">
                {/* Estado de Membresía */}
                <div className="bg-white border rounded-lg p-6 shadow-sm">
                  <h3 className="text-lg font-semibold text-gray-800 mb-4">Estado de tu Membresía</h3>
                  <div className="border border-gray-200 rounded-lg p-6 text-center">
                    <div className="text-2xl font-bold text-orange-500 mb-2 flex items-center justify-center">
                      <FontAwesomeIcon icon={faMedal} className="mr-2" /> {userData.membership}
                    </div>
                    <div className="text-gray-600 mb-4">
                      Válida hasta: {userData.membershipExpiry}
                    </div>
                    <div className="mb-4">
                      <div className="w-full bg-gray-200 rounded-full h-2.5">
                        <div 
                          className="bg-gradient-to-r from-orange-500 to-yellow-500 h-2.5 rounded-full" 
                          style={{ width: '75%' }}
                        ></div>
                      </div>
                      <div className="text-sm text-gray-500 mt-1">75% completado hacia el próximo nivel</div>
                    </div>
                    <div className="flex flex-wrap gap-3 justify-center">
                      <button 
                        onClick={() => handleMembershipAction('renew')}
                        className="bg-orange-500 hover:bg-orange-600 text-white px-4 py-2 rounded-md transition"
                      >
                        Renovar Membresía
                      </button>
                      <button 
                        onClick={() => handleMembershipAction('upgrade')}
                        className="bg-white hover:bg-gray-100 border border-gray-300 px-4 py-2 rounded-md transition"
                      >
                        Mejorar Nivel
                      </button>
                      <button 
                        onClick={() => handleMembershipAction('cancel')}
                        className="bg-white hover:bg-red-50 border border-red-200 text-red-600 px-4 py-2 rounded-md transition"
                      >
                        Cancelar Membresía
                      </button>
                    </div>
                  </div>
                </div>
                
                {/* Beneficios */}
                <div className="bg-white border rounded-lg p-6 shadow-sm">
                  <h3 className="text-lg font-semibold text-gray-800 mb-4">
                    Beneficios de tu Membresía {userData.membership}
                  </h3>
                  <ul className="space-y-2">
                    {userData.membershipBenefits.map((benefit, index) => (
                      <li key={index} className="flex items-start">
                        <FontAwesomeIcon icon={faStar} className="text-orange-500 mr-2 mt-1 flex-shrink-0" />
                        <span>{benefit}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              </div>
              
              {/* Comparativa de Niveles */}
              <div>
                <div className="bg-white border rounded-lg p-6 shadow-sm">
                  <h3 className="text-lg font-semibold text-gray-800 mb-4">Comparativa de Niveles de Membresía</h3>
                  <div className="overflow-x-auto">
                    <table className="min-w-full divide-y divide-gray-200">
                      <thead className="bg-gray-50">
                        <tr>
                          <th className="px-3 py-2 text-left text-xs font-medium text-gray-500 uppercase">Beneficio</th>
                          <th className="px-3 py-2 text-left text-xs font-medium text-gray-500 uppercase">Bronce</th>
                          <th className="px-3 py-2 text-left text-xs font-medium text-gray-500 uppercase">Plata</th>
                          <th className="px-3 py-2 text-left text-xs font-medium text-gray-500 uppercase">Oro</th>
                          <th className="px-3 py-2 text-left text-xs font-medium text-gray-500 uppercase">Platino</th>
                        </tr>
                      </thead>
                      <tbody className="bg-white divide-y divide-gray-200">
                        <tr>
                          <td className="px-3 py-2 whitespace-nowrap text-sm text-gray-600">Descuento en talleres</td>
                          <td className="px-3 py-2 whitespace-nowrap text-sm text-gray-600">5%</td>
                          <td className="px-3 py-2 whitespace-nowrap text-sm text-gray-600">10%</td>
                          <td className="px-3 py-2 whitespace-nowrap text-sm text-gray-600">20%</td>
                          <td className="px-3 py-2 whitespace-nowrap text-sm text-gray-600">30%</td>
                        </tr>
                        <tr>
                          <td className="px-3 py-2 whitespace-nowrap text-sm text-gray-600">Eventos exclusivos</td>
                          <td className="px-3 py-2 whitespace-nowrap text-sm text-gray-600">No</td>
                          <td className="px-3 py-2 whitespace-nowrap text-sm text-gray-600">Algunos</td>
                          <td className="px-3 py-2 whitespace-nowrap text-sm text-gray-600">Sí</td>
                          <td className="px-3 py-2 whitespace-nowrap text-sm text-gray-600">Sí + VIP</td>
                        </tr>
                        <tr>
                          <td className="px-3 py-2 whitespace-nowrap text-sm text-gray-600">Asistencia vial</td>
                          <td className="px-3 py-2 whitespace-nowrap text-sm text-gray-600">Básica</td>
                          <td className="px-3 py-2 whitespace-nowrap text-sm text-gray-600">Básica</td>
                          <td className="px-3 py-2 whitespace-nowrap text-sm text-gray-600">Completa</td>
                          <td className="px-3 py-2 whitespace-nowrap text-sm text-gray-600">Premium</td>
                        </tr>
                        <tr>
                          <td className="px-3 py-2 whitespace-nowrap text-sm text-gray-600">Seguro de accidentes</td>
                          <td className="px-3 py-2 whitespace-nowrap text-sm text-gray-600">No</td>
                          <td className="px-3 py-2 whitespace-nowrap text-sm text-gray-600">Básico</td>
                          <td className="px-3 py-2 whitespace-nowrap text-sm text-gray-600">Básico</td>
                          <td className="px-3 py-2 whitespace-nowrap text-sm text-gray-600">Completo</td>
                        </tr>
                      </tbody>
                    </table>
                  </div>
                </div>
              </div>
            </div>
          </TabPanel>

          {/* PQRSDF */}
          <TabPanel className="p-4 md:p-6">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {/* Nueva PQRSDF */}
              <div className="bg-white border rounded-lg p-6 shadow-sm">
                <h3 className="text-lg font-semibold text-gray-800 mb-4">Radicar nueva PQRSDF</h3>
                <form onSubmit={handlePqrsdSubmit} className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Tipo</label>
                    <select 
                      name="type" 
                      value={newPqrsd.type}
                      onChange={(e) => setNewPqrsd({...newPqrsd, type: e.target.value})}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-orange-500"
                    >
                      <option value="Petición">Petición</option>
                      <option value="Queja">Queja</option>
                      <option value="Reclamo">Reclamo</option>
                      <option value="Solicitud">Solicitud</option>
                      <option value="Denuncia">Denuncia</option>
                      <option value="Felicitación">Felicitación</option>
                    </select>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Asunto</label>
                    <input 
                      type="text" 
                      name="subject" 
                      value={newPqrsd.subject}
                      onChange={(e) => setNewPqrsd({...newPqrsd, subject: e.target.value})}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-orange-500"
                      required 
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Descripción</label>
                    <textarea 
                      name="description" 
                      value={newPqrsd.description}
                      onChange={(e) => setNewPqrsd({...newPqrsd, description: e.target.value})}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-orange-500"
                      rows="4"
                      required 
                    ></textarea>
                  </div>
                  <button 
                    type="submit" 
                    className="bg-orange-500 hover:bg-orange-600 text-white px-4 py-2 rounded-md transition"
                  >
                    Enviar PQRSDF
                  </button>
                </form>
              </div>
              
              {/* Historial PQRSDF */}
              <div>
                <div className="bg-white border rounded-lg p-6 shadow-sm">
                  <h3 className="text-lg font-semibold text-gray-800 mb-4">Historial de PQRSDF</h3>
                  <div className="overflow-x-auto">
                    <table className="min-w-full divide-y divide-gray-200">
                      <thead className="bg-gray-50">
                        <tr>
                          <th className="px-3 py-2 text-left text-xs font-medium text-gray-500 uppercase">Fecha</th>
                          <th className="px-3 py-2 text-left text-xs font-medium text-gray-500 uppercase">Tipo</th>
                          <th className="px-3 py-2 text-left text-xs font-medium text-gray-500 uppercase">Asunto</th>
                          <th className="px-3 py-2 text-left text-xs font-medium text-gray-500 uppercase">Estado</th>
                          <th className="px-3 py-2 text-left text-xs font-medium text-gray-500 uppercase">Acciones</th>
                        </tr>
                      </thead>
                      <tbody className="bg-white divide-y divide-gray-200">
                        {userData.pqrsd.map(item => (
                          <tr key={item.id}>
                            <td className="px-3 py-2 whitespace-nowrap text-sm text-gray-600">{item.date}</td>
                            <td className="px-3 py-2 whitespace-nowrap text-sm text-gray-600">{item.type}</td>
                            <td className="px-3 py-2 text-sm text-gray-600">{item.subject}</td>
                            <td className="px-3 py-2 whitespace-nowrap">
                              <span className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${
                                item.status === 'En proceso' ? 'bg-blue-100 text-blue-800' : 
                                item.status === 'Cerrado' ? 'bg-gray-100 text-gray-800' : 
                                'bg-green-100 text-green-800'
                              }`}>
                                {statusIcon(item.status)}
                                {item.status}
                              </span>
                            </td>
                            <td className="px-3 py-2 whitespace-nowrap text-sm font-medium">
                              <button className="text-orange-600 hover:text-orange-900 mr-2">Detalles</button>
                              {item.status === 'En proceso' && (
                                <button className="text-blue-600 hover:text-blue-900">Seguimiento</button>
                              )}
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </div>
                
                <div className="bg-blue-50 border border-blue-100 rounded-lg p-4 mt-4">
                  <h4 className="font-medium text-blue-800 mb-2">Tipos de PQRSDF:</h4>
                  <ul className="text-sm text-blue-700 space-y-1">
                    <li><strong>Petición:</strong> Solicitud de información o servicios</li>
                    <li><strong>Queja:</strong> Manifestación de inconformidad</li>
                    <li><strong>Reclamo:</strong> Cuando un derecho ha sido vulnerado</li>
                    <li><strong>Solicitud:</strong> Petición específica de un servicio</li>
                    <li><strong>Denuncia:</strong> Reporte de conductas inapropiadas</li>
                    <li><strong>Felicitación:</strong> Reconocimiento a servicios o personas</li>
                  </ul>
                </div>
              </div>
            </div>
          </TabPanel>

          {/* Comunidad */}
          <TabPanel className="p-4 md:p-6">
            <h3 className="text-xl font-semibold text-gray-800 mb-6">Comunidad BSK</h3>
            
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
              <div className="bg-white border rounded-lg p-4 text-center shadow-sm">
                <div className="text-3xl font-bold text-orange-500">1,250</div>
                <div className="text-sm text-gray-600">Miembros Activos</div>
              </div>
              <div className="bg-white border rounded-lg p-4 text-center shadow-sm">
                <div className="text-3xl font-bold text-orange-500">48</div>
                <div className="text-sm text-gray-600">Rodadas este año</div>
              </div>
              <div className="bg-white border rounded-lg p-4 text-center shadow-sm">
                <div className="text-3xl font-bold text-orange-500">15</div>
                <div className="text-sm text-gray-600">Ciudades</div>
              </div>
              <div className="bg-white border rounded-lg p-4 text-center shadow-sm">
                <div className="text-3xl font-bold text-orange-500">8</div>
                <div className="text-sm text-gray-600">Años de historia</div>
              </div>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
              <div className="bg-white border rounded-lg p-6 text-center shadow-sm hover:shadow-md transition">
                <div className="text-orange-500 mb-3">
                  <FontAwesomeIcon icon={faUsers} size="2x" />
                </div>
                <h4 className="font-semibold text-gray-800 mb-2">Grupos Locales</h4>
                <p className="text-sm text-gray-600 mb-4">Conecta con miembros en tu ciudad</p>
                <button className="bg-orange-500 hover:bg-orange-600 text-white px-4 py-2 rounded-md text-sm transition">
                  Explorar
                </button>
              </div>
              <div className="bg-white border rounded-lg p-6 text-center shadow-sm hover:shadow-md transition">
                <div className="text-orange-500 mb-3">
                  <FontAwesomeIcon icon={faMapMarkedAlt} size="2x" />
                </div>
                <h4 className="font-semibold text-gray-800 mb-2">Rutas Compartidas</h4>
                <p className="text-sm text-gray-600 mb-4">Descubre rutas favoritas de la comunidad</p>
                <button className="bg-orange-500 hover:bg-orange-600 text-white px-4 py-2 rounded-md text-sm transition">
                  Ver Mapa
                </button>
              </div>
              <div className="bg-white border rounded-lg p-6 text-center shadow-sm hover:shadow-md transition">
                <div className="text-orange-500 mb-3">
                  <FontAwesomeIcon icon={faChartLine} size="2x" />
                </div>
                <h4 className="font-semibold text-gray-800 mb-2">Clasificaciones</h4>
                <p className="text-sm text-gray-600 mb-4">Top miembros por puntos y participación</p>
                <button className="bg-orange-500 hover:bg-orange-600 text-white px-4 py-2 rounded-md text-sm transition">
                  Ver Ranking
                </button>
              </div>
              <div className="bg-white border rounded-lg p-6 text-center shadow-sm hover:shadow-md transition">
                <div className="text-orange-500 mb-3">
                  <FontAwesomeIcon icon={faHistory} size="2x" />
                </div>
                <h4 className="font-semibold text-gray-800 mb-2">Archivo Histórico</h4>
                <p className="text-sm text-gray-600 mb-4">Fotos y memorias de eventos pasados</p>
                <button className="bg-orange-500 hover:bg-orange-600 text-white px-4 py-2 rounded-md text-sm transition">
                  Explorar
                </button>
              </div>
            </div>
            
            <div className="bg-white border rounded-lg p-6 shadow-sm">
              <h4 className="font-semibold text-gray-800 mb-4">Anuncios del Club</h4>
              <div className="space-y-4">
                <div className="border-b border-gray-200 pb-4">
                  <div className="text-sm text-gray-500 mb-1">2023-10-01</div>
                  <div className="font-medium text-gray-800 mb-2">Nueva política de seguridad en rodadas</div>
                  <div className="text-sm text-gray-600 mb-2">
                    A partir del 1 de noviembre se implementarán nuevos protocolos de seguridad para todas las rodadas oficiales del club.
                  </div>
                  <button className="text-orange-600 hover:text-orange-800 text-sm font-medium">
                    Leer más
                  </button>
                </div>
                <div className="border-b border-gray-200 pb-4">
                  <div className="text-sm text-gray-500 mb-1">2023-09-20</div>
                  <div className="font-medium text-gray-800 mb-2">Elecciones consejo directivo 2024</div>
                  <div className="text-sm text-gray-600 mb-2">
                    Conoce los candidatos y fechas importantes para las elecciones del consejo directivo del próximo año.
                  </div>
                  <button className="text-orange-600 hover:text-orange-800 text-sm font-medium">
                    Leer más
                  </button>
                </div>
                <button className="text-orange-600 hover:text-orange-800 text-sm font-medium mt-2">
                  Ver todos los anuncios
                </button>
              </div>
            </div>
          </TabPanel>

          {/* Aliados */}
          <TabPanel className="p-4 md:p-6">
            <h3 className="text-xl font-semibold text-gray-800 mb-6">Aliados Comerciales BSK</h3>
            
            <div className="bg-gray-50 p-4 rounded-lg mb-6">
              <h4 className="font-medium text-gray-800 mb-3">Categorías:</h4>
              <div className="flex flex-wrap gap-2">
                <button className="bg-orange-500 text-white px-3 py-1 rounded-full text-sm">Todos</button>
                <button className="bg-white hover:bg-gray-100 border border-gray-300 px-3 py-1 rounded-full text-sm">Talleres</button>
                <button className="bg-white hover:bg-gray-100 border border-gray-300 px-3 py-1 rounded-full text-sm">Accesorios</button>
                <button className="bg-white hover:bg-gray-100 border border-gray-300 px-3 py-1 rounded-full text-sm">Seguros</button>
                <button className="bg-white hover:bg-gray-100 border border-gray-300 px-3 py-1 rounded-full text-sm">Hoteles</button>
                <button className="bg-white hover:bg-gray-100 border border-gray-300 px-3 py-1 rounded-full text-sm">Restaurantes</button>
              </div>
            </div>
            
            <div className="space-y-4 mb-8">
              <div className="bg-white border rounded-lg overflow-hidden shadow-sm hover:shadow-md transition">
                <div className="p-4 md:p-6 flex flex-col md:flex-row">
                  <div className="flex-shrink-0 mb-4 md:mb-0 md:mr-6">
                    <img 
                      src="https://via.placeholder.com/120" 
                      alt="Partner Logo" 
                      className="w-20 h-20 object-contain" 
                    />
                  </div>
                  <div className="flex-grow">
                    <h4 className="font-semibold text-gray-800 mb-1">Talleres MotoPro</h4>
                    <div className="flex items-center text-sm text-yellow-600 mb-2">
                      <FontAwesomeIcon icon={faStar} className="mr-1" /> 15% descuento para miembros BSK
                    </div>
                    <div className="text-sm text-gray-600 mb-3">
                      Especialistas en motocicletas Harley-Davidson y custom. Servicio premium con garantía.
                    </div>
                    <div className="text-sm text-gray-500">
                      <span className="font-medium">Ubicación:</span> Bogotá, Medellín, Cali
                    </div>
                  </div>
                  <div className="flex-shrink-0 mt-4 md:mt-0 md:ml-4 flex flex-col space-y-2">
                    <button className="bg-white hover:bg-gray-100 border border-gray-300 px-3 py-1 rounded-md text-sm transition">
                      Ver Detalles
                    </button>
                    <button className="bg-orange-500 hover:bg-orange-600 text-white px-3 py-1 rounded-md text-sm transition">
                      Obtener Cupón
                    </button>
                  </div>
                </div>
              </div>
              
              <div className="bg-white border rounded-lg overflow-hidden shadow-sm hover:shadow-md transition">
                <div className="p-4 md:p-6 flex flex-col md:flex-row">
                  <div className="flex-shrink-0 mb-4 md:mb-0 md:mr-6">
                    <img 
                      src="https://via.placeholder.com/120" 
                      alt="Partner Logo" 
                      className="w-20 h-20 object-contain" 
                    />
                  </div>
                  <div className="flex-grow">
                    <h4 className="font-semibold text-gray-800 mb-1">Motopartes Elite</h4>
                    <div className="flex items-center text-sm text-yellow-600 mb-2">
                      <FontAwesomeIcon icon={faStar} className="mr-1" /> 10% descuento + 50 puntos por compra
                    </div>
                    <div className="text-sm text-gray-600 mb-3">
                      Todo en repuestos y accesorios para tu moto. Envíos a todo el país.
                    </div>
                    <div className="text-sm text-gray-500">
                      <span className="font-medium">Ubicación:</span> Envíos a todo el país
                    </div>
                  </div>
                  <div className="flex-shrink-0 mt-4 md:mt-0 md:ml-4 flex flex-col space-y-2">
                    <button className="bg-white hover:bg-gray-100 border border-gray-300 px-3 py-1 rounded-md text-sm transition">
                      Ver Detalles
                    </button>
                    <button className="bg-orange-500 hover:bg-orange-600 text-white px-3 py-1 rounded-md text-sm transition">
                      Obtener Cupón
                    </button>
                  </div>
                </div>
              </div>
              
              <div className="bg-white border rounded-lg overflow-hidden shadow-sm hover:shadow-md transition">
                <div className="p-4 md:p-6 flex flex-col md:flex-row">
                  <div className="flex-shrink-0 mb-4 md:mb-0 md:mr-6">
                    <img 
                      src="https://via.placeholder.com/120" 
                      alt="Partner Logo" 
                      className="w-20 h-20 object-contain" 
                    />
                  </div>
                  <div className="flex-grow">
                    <h4 className="font-semibold text-gray-800 mb-1">Hotel Motero</h4>
                    <div className="flex items-center text-sm text-yellow-600 mb-2">
                      <FontAwesomeIcon icon={faStar} className="mr-1" /> 20% descuento + estacionamiento seguro
                    </div>
                    <div className="text-sm text-gray-600 mb-3">
                      Hotel especializado para motociclistas con taller básico y seguridad para tu moto.
                    </div>
                    <div className="text-sm text-gray-500">
                      <span className="font-medium">Ubicación:</span> Ruta Norte, Santander
                    </div>
                  </div>
                  <div className="flex-shrink-0 mt-4 md:mt-0 md:ml-4 flex flex-col space-y-2">
                    <button className="bg-white hover:bg-gray-100 border border-gray-300 px-3 py-1 rounded-md text-sm transition">
                      Ver Detalles
                    </button>
                    <button className="bg-orange-500 hover:bg-orange-600 text-white px-3 py-1 rounded-md text-sm transition">
                      Reservar
                    </button>
                  </div>
                </div>
              </div>
            </div>
            
            <div className="bg-blue-50 border border-blue-100 rounded-lg p-6">
              <h4 className="font-semibold text-blue-800 mb-3">¿Cómo ganar puntos con aliados?</h4>
              <ol className="text-sm text-blue-700 space-y-2 list-decimal list-inside">
                <li className="pl-2">Visita a un aliado comercial BSK</li>
                <li className="pl-2">Menciona que eres miembro BSK al hacer tu compra</li>
                <li className="pl-2">Pide que registren tu membresía en la compra</li>
                <li className="pl-2">Los puntos se acreditarán automáticamente en 24-48 horas</li>
                <li className="pl-2">Verifica tu saldo de puntos en esta plataforma</li>
              </ol>
              <div className="text-xs text-blue-600 mt-3">
                * Algunos aliados pueden ofrecer puntos adicionales por compras especiales
              </div>
            </div>
          </TabPanel>
        </Tabs>
        
        {/* Footer */}
        <div className="bg-gray-800 text-white p-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <h4 className="font-semibold mb-3">Contactos de Emergencia:</h4>
              <div className="space-y-2">
                <div className="flex items-center">
                  <FontAwesomeIcon icon={faShieldAlt} className="mr-2 text-orange-400" />
                  <span>Asistencia Vial BSK: 018000-123456</span>
                </div>
                <div className="flex items-center">
                  <FontAwesomeIcon icon={faShieldAlt} className="mr-2 text-orange-400" />
                  <span>Emergencias Médicas: 123</span>
                </div>
                <div className="flex items-center">
                  <FontAwesomeIcon icon={faShieldAlt} className="mr-2 text-orange-400" />
                  <span>Policía de Carreteras: #767</span>
                </div>
              </div>
            </div>
            <div>
              <h4 className="font-semibold mb-3">Enlaces Rápidos:</h4>
              <div className="grid grid-cols-2 gap-2">
                <a href="#" className="hover:text-orange-400 transition">Reglamento del Club</a>
                <a href="#" className="hover:text-orange-400 transition">Protocolos de Seguridad</a>
                <a href="#" className="hover:text-orange-400 transition">Preguntas Frecuentes</a>
                <a href="#" className="hover:text-orange-400 transition">Manual del Miembro</a>
              </div>
            </div>
          </div>
          <div className="mt-6 pt-4 border-t border-gray-700 text-center text-sm text-gray-400">
            © {new Date().getFullYear()} BSK Motorcycle Team. Todos los derechos reservados.
          </div>
        </div>
      </div>
    </div>
  );
};

export default MemberArea;