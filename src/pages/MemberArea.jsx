import React, { useState, useEffect } from 'react';
import { Tab, Tabs, TabList, TabPanel } from 'react-tabs';
import 'react-tabs/style/react-tabs.css';
import {
  FaUserCog, FaCalendarAlt, FaMotorcycle,
  FaStar, FaMedal, FaHeadset, FaHistory,
  FaChartLine, FaTicketAlt, FaUsers,
  FaMapMarkedAlt, FaStore, FaShieldAlt,
  FaBell, FaCog, FaSignOutAlt, FaChevronDown,
  FaExclamationTriangle, FaCheckCircle, FaClock,
  FaBars, FaTimes
} from 'react-icons/fa';
import axios from 'axios';
import { useAuth } from '../components/auth/AuthContext';

const MemberArea = () => {
  const { user, logout } = useAuth();
  const [activeTab, setActiveTab] = useState(0);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [dropdownOpen, setDropdownOpen] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const [userData, setUserData] = useState({
    name: '',
    membership: '',
    membershipExpiry: '',
    points: 0,
    avatar: '/default-avatar.jpg',
    nextEvent: '',
    registeredEvents: [],
    upcomingEvents: [],
    pointsBreakdown: {
      rides: 0,
      events: 0,
      partners: 0,
      others: 0,
      history: []
    },
    membershipBenefits: [],
    complaints: []
  });

  const [formData, setFormData] = useState({
    name: '',
    email: '',
    phone: '',
    emergencyContact: '',
    bikeModel: '',
    bikeYear: '',
    bloodType: '',
    allergies: ''
  });

  const [newComplaint, setNewComplaint] = useState({
    type: 'Petición',
    subject: '',
    description: ''
  });

  useEffect(() => {
    const fetchUserData = async () => {
      try {
        setLoading(true);
        const response = await axios.get('/users/me', {
          headers: {
            Authorization: `Bearer ${localStorage.getItem('token')}`
          }
        });

        const userDataFromApi = response.data.data.user;

        // Transformar datos del backend al formato esperado por el frontend
        setUserData({
          name: userDataFromApi.fullName,
          membership: userDataFromApi.role,
          membershipExpiry: userDataFromApi.membershipExpiry || 'No definida',
          points: userDataFromApi.points,
          avatar: userDataFromApi.avatar || '/default-avatar.jpg',
          nextEvent: userDataFromApi.upcomingEvents?.[0]?.name || 'No hay eventos próximos',
          registeredEvents: userDataFromApi.registeredEvents || [],
          upcomingEvents: userDataFromApi.upcomingEvents || [],
          pointsBreakdown: {
            rides: userDataFromApi.ridePoints || 0,
            events: userDataFromApi.eventPoints || 0,
            partners: userDataFromApi.partnerPoints || 0,
            others: userDataFromApi.otherPoints || 0,
            history: userDataFromApi.pointsHistory || []
          },
          membershipBenefits: userDataFromApi.membershipBenefits || [
            'Descuento en talleres',
            'Acceso a eventos exclusivos',
            'Asistencia vial básica'
          ],
          complaints: userDataFromApi.complaints || []
        });

        setFormData({
          name: userDataFromApi.fullName,
          email: userDataFromApi.email,
          phone: userDataFromApi.phone,
          emergencyContact: `${userDataFromApi.emergencyContactName || ''} - ${userDataFromApi.emergencyContactPhone || ''}`,
          bikeModel: `${userDataFromApi.motorcycleBrand || ''} ${userDataFromApi.motorcycleModel || ''}`,
          bikeYear: userDataFromApi.motorcycleYear || '',
          bloodType: `${userDataFromApi.bloodType || ''}${userDataFromApi.rhFactor || ''}`,
          allergies: userDataFromApi.allergies || 'Ninguna'
        });

        setLoading(false);
      } catch (err) {
        setError(err.response?.data?.message || 'Error al cargar los datos del usuario');
        setLoading(false);
      }
    };

    if (user) {
      fetchUserData();
    }
  }, [user]);

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleComplaintSubmit = async (e) => {
    e.preventDefault();
    try {
      const response = await axios.post(`/api/users/${user.documentNumber}/complaints`, {
        type: newComplaint.type,
        message: newComplaint.description,
        subject: newComplaint.subject
      }, {
        headers: {
          Authorization: `Bearer ${localStorage.getItem('token')}`
        }
      });

      const newEntry = {
        id: response.data.data.complaint.referenceNumber,
        type: newComplaint.type,
        subject: newComplaint.subject,
        status: 'Pendiente',
        date: new Date().toISOString().split('T')[0]
      };

      setUserData(prev => ({
        ...prev,
        complaints: [...prev.complaints, newEntry]
      }));

      setNewComplaint({ type: 'Petición', subject: '', description: '' });
      alert('Tu PQRSDF ha sido registrada con éxito. Nos comunicaremos contigo pronto.');
    } catch (err) {
      alert(err.response?.data?.message || 'Error al enviar la PQRSDF');
    }
  };

  const handleEventAction = async (eventId, action) => {
    try {
      let response;

      if (action === 'register') {
        response = await axios.post(`/api/events/${eventId}/register`, {}, {
          headers: {
            Authorization: `Bearer ${localStorage.getItem('token')}`
          }
        });
      } else if (action === 'cancel') {
        response = await axios.post(`/api/events/${eventId}/cancel`, {}, {
          headers: {
            Authorization: `Bearer ${localStorage.getItem('token')}`
          }
        });
      }

      if (response) {
        alert(`Acción "${action}" realizada con éxito`);
        // Actualizar la lista de eventos
        const updatedEvents = userData.registeredEvents.map(event => {
          if (event.id === eventId) {
            return { ...event, status: action === 'cancel' ? 'Cancelado' : 'Confirmado' };
          }
          return event;
        });

        setUserData(prev => ({ ...prev, registeredEvents: updatedEvents }));
      }
    } catch (err) {
      alert(err.response?.data?.message || `Error al realizar la acción "${action}"`);
    }
  };

  const handleMembershipAction = async (action) => {
    try {
      let response;

      if (action === 'renew') {
        response = await axios.post(`/api/users/${user.documentNumber}/renew-membership`, {}, {
          headers: {
            Authorization: `Bearer ${localStorage.getItem('token')}`
          }
        });
      } else if (action === 'upgrade') {
        response = await axios.post(`/api/users/${user.documentNumber}/upgrade-membership`, {}, {
          headers: {
            Authorization: `Bearer ${localStorage.getItem('token')}`
          }
        });
      }

      if (response) {
        alert(`Membresía ${action === 'renew' ? 'renovada' : 'actualizada'} con éxito`);
        // Actualizar datos de membresía
        setUserData(prev => ({
          ...prev,
          membership: response.data.data.user.role,
          membershipExpiry: response.data.data.user.membershipExpiry || prev.membershipExpiry,
          membershipBenefits: response.data.data.user.membershipBenefits || prev.membershipBenefits
        }));
      }
    } catch (err) {
      alert(err.response?.data?.message || `Error al ${action === 'renew' ? 'renovar' : 'actualizar'} la membresía`);
    }
  };

  const toggleDropdown = (id) => {
    setDropdownOpen(dropdownOpen === id ? null : id);
  };

  const statusIcon = (status) => {
    switch (status) {
      case 'Confirmado':
      case 'Asistido':
      case 'Resuelto':
        return <FaCheckCircle className="text-green-500 mr-1" />;
      case 'Pendiente':
      case 'En Progreso':
        return <FaClock className="text-yellow-500 mr-1" />;
      case 'Cancelado':
        return <FaExclamationTriangle className="text-red-500 mr-1" />;
      default:
        return <FaExclamationTriangle className="text-gray-500 mr-1" />;
    }
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center min-h-screen">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-orange-500 mx-auto"></div>
          <p className="mt-4 text-gray-600">Cargando tus datos...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex justify-center items-center min-h-screen">
        <div className="text-center max-w-md p-6 bg-red-50 rounded-lg">
          <FaExclamationTriangle className="text-red-500 text-4xl mx-auto mb-4" />
          <h2 className="text-xl font-semibold text-gray-800 mb-2">Error al cargar los datos</h2>
          <p className="text-gray-600 mb-4">{error}</p>
          <button
            onClick={() => window.location.reload()}
            className="bg-orange-500 hover:bg-orange-600 text-white px-4 py-2 rounded-md transition"
          >
            Reintentar
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-gray-50 min-h-screen">
      {/* Header Mobile */}
      <div className="lg:hidden bg-white shadow-sm sticky top-0 z-10">
        <div className="flex justify-between items-center p-4">
          <div className="flex items-center">
            <img
              src={userData.avatar}
              alt="Avatar"
              className="w-10 h-10 rounded-full border-2 border-orange-500 mr-3"
            />
            <div>
              <h2 className="font-bold text-gray-800 text-sm truncate max-w-[120px]">{userData.name}</h2>
              <div className="flex items-center">
                <FaStar className="text-yellow-500 mr-1 text-xs" />
                <span className="font-semibold text-gray-700 text-xs">{userData.points} pts</span>
              </div>
            </div>
          </div>

          <button
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            className="text-gray-600 focus:outline-none"
          >
            {mobileMenuOpen ? <FaTimes size={20} /> : <FaBars size={20} />}
          </button>
        </div>
      </div>

      <div className="max-w-7xl mx-auto">
        <div className="flex flex-col lg:flex-row">
          {/* Sidebar Mobile */}
          {mobileMenuOpen && (
            <div className="lg:hidden fixed inset-0 z-20 bg-gray-800 bg-opacity-75">
              <div className="bg-white h-full w-4/5 max-w-xs p-4 overflow-y-auto">
                <div className="flex justify-between items-center mb-6">
                  <div className="flex items-center">
                    <img
                      src={userData.avatar}
                      alt="Avatar"
                      className="w-12 h-12 rounded-full border-2 border-orange-500 mr-3"
                    />
                    <div>
                      <h2 className="font-bold text-gray-800">{userData.name}</h2>
                      <div className="flex items-center">
                        <FaStar className="text-yellow-500 mr-1" />
                        <span className="font-semibold text-gray-700">{userData.points} Puntos</span>
                      </div>
                    </div>
                  </div>
                  <button
                    onClick={() => setMobileMenuOpen(false)}
                    className="text-gray-600 focus:outline-none"
                  >
                    <FaTimes size={20} />
                  </button>
                </div>

                <div className="space-y-1 mb-6">
                  <button className="w-full flex items-center bg-gray-100 text-orange-600 px-4 py-3 rounded-lg">
                    <FaBell className="mr-3" /> Notificaciones
                  </button>
                  <button className="w-full flex items-center bg-gray-100 text-gray-800 px-4 py-3 rounded-lg">
                    <FaCog className="mr-3" /> Configuración
                  </button>
                  <button
                    onClick={logout}
                    className="w-full flex items-center bg-gray-100 text-gray-800 px-4 py-3 rounded-lg"
                  >
                    <FaSignOutAlt className="mr-3" /> Cerrar sesión
                  </button>
                </div>

                <Tabs
                  selectedIndex={activeTab}
                  onSelect={index => {
                    setActiveTab(index);
                    setMobileMenuOpen(false);
                  }}
                  className="mb-6"
                >
                  <TabList className="flex flex-col space-y-2">
                    <Tab className="px-4 py-3 text-left flex items-center rounded-lg hover:bg-gray-100">
                      <FaUserCog className="mr-3" /> Mi Cuenta
                    </Tab>
                    <Tab className="px-4 py-3 text-left flex items-center rounded-lg hover:bg-gray-100">
                      <FaCalendarAlt className="mr-3" /> Mis Eventos
                    </Tab>
                    <Tab className="px-4 py-3 text-left flex items-center rounded-lg hover:bg-gray-100">
                      <FaMotorcycle className="mr-3" /> Próximas Rodadas
                    </Tab>
                    <Tab className="px-4 py-3 text-left flex items-center rounded-lg hover:bg-gray-100">
                      <FaStar className="mr-3" /> Mis Puntos
                    </Tab>
                    <Tab className="px-4 py-3 text-left flex items-center rounded-lg hover:bg-gray-100">
                      <FaMedal className="mr-3" /> Mi Membresía
                    </Tab>
                    <Tab className="px-4 py-3 text-left flex items-center rounded-lg hover:bg-gray-100">
                      <FaHeadset className="mr-3" /> PQRSDF
                    </Tab>
                    <Tab className="px-4 py-3 text-left flex items-center rounded-lg hover:bg-gray-100">
                      <FaUsers className="mr-3" /> Comunidad
                    </Tab>
                    <Tab className="px-4 py-3 text-left flex items-center rounded-lg hover:bg-gray-100">
                      <FaStore className="mr-3" /> Aliados
                    </Tab>
                  </TabList>
                </Tabs>
              </div>
            </div>
          )}

          {/* Contenido Principal */}
          <div className="flex-1 bg-white rounded-lg shadow-sm overflow-hidden lg:ml-4 mt-4 lg:mt-6">
            {/* Header Desktop */}
            <div className="hidden lg:flex p-6 justify-between items-center border-b border-gray-200">
              <div className="flex items-center">
                <img
                  src={userData.avatar}
                  alt="Avatar"
                  className="w-16 h-16 md:w-20 md:h-20 rounded-full border-4 border-orange-500 mr-4"
                />
                <div>
                  <h2 className="text-xl md:text-2xl font-bold text-gray-800">{userData.name}</h2>
                  <div className="flex items-center mt-1">
                    <span className="bg-gradient-to-r from-orange-500 to-yellow-500 text-white text-xs md:text-sm px-3 py-1 rounded-full flex items-center">
                      <FaMedal className="mr-1" /> {userData.membership}
                      {userData.membershipExpiry && (
                        <span className="ml-2 text-white text-opacity-90">Vence: {userData.membershipExpiry}</span>
                      )}
                    </span>
                  </div>
                  <div className="flex items-center mt-2">
                    <FaStar className="text-yellow-500 mr-1" />
                    <span className="font-semibold text-gray-700">{userData.points} Puntos</span>
                  </div>
                </div>
              </div>

              <div className="flex flex-wrap gap-2">
                <button className="flex items-center bg-gray-100 hover:bg-gray-200 text-gray-800 px-3 py-2 rounded-lg text-sm transition">
                  <FaBell className="mr-2" /> Notificaciones
                </button>
                <button className="flex items-center bg-gray-100 hover:bg-gray-200 text-gray-800 px-3 py-2 rounded-lg text-sm transition">
                  <FaCog className="mr-2" /> Configuración
                </button>
                <button
                  onClick={logout}
                  className="flex items-center bg-gray-100 hover:bg-gray-200 text-gray-800 px-3 py-2 rounded-lg text-sm transition"
                >
                  <FaSignOutAlt className="mr-2" /> Cerrar sesión
                </button>
              </div>
            </div>

            {/* Tabs Desktop */}
            <Tabs
              selectedIndex={activeTab}
              onSelect={index => setActiveTab(index)}
              className="hidden lg:block"
            >
              <TabList className="flex overflow-x-auto border-b border-gray-200">
                <Tab className="px-4 py-3 text-sm font-medium cursor-pointer focus:outline-none border-b-2 border-transparent hover:text-orange-600 hover:border-orange-300 transition flex items-center">
                  <FaUserCog className="mr-2" /> Mi Cuenta
                </Tab>
                <Tab className="px-4 py-3 text-sm font-medium cursor-pointer focus:outline-none border-b-2 border-transparent hover:text-orange-600 hover:border-orange-300 transition flex items-center">
                  <FaCalendarAlt className="mr-2" /> Mis Eventos
                </Tab>
                <Tab className="px-4 py-3 text-sm font-medium cursor-pointer focus:outline-none border-b-2 border-transparent hover:text-orange-600 hover:border-orange-300 transition flex items-center">
                  <FaMotorcycle className="mr-2" /> Próximas Rodadas
                </Tab>
                <Tab className="px-4 py-3 text-sm font-medium cursor-pointer focus:outline-none border-b-2 border-transparent hover:text-orange-600 hover:border-orange-300 transition flex items-center">
                  <FaStar className="mr-2" /> Mis Puntos
                </Tab>
                <Tab className="px-4 py-3 text-sm font-medium cursor-pointer focus:outline-none border-b-2 border-transparent hover:text-orange-600 hover:border-orange-300 transition flex items-center">
                  <FaMedal className="mr-2" /> Mi Membresía
                </Tab>
                <Tab className="px-4 py-3 text-sm font-medium cursor-pointer focus:outline-none border-b-2 border-transparent hover:text-orange-600 hover:border-orange-300 transition flex items-center">
                  <FaHeadset className="mr-2" /> PQRSDF
                </Tab>
                <Tab className="px-4 py-3 text-sm font-medium cursor-pointer focus:outline-none border-b-2 border-transparent hover:text-orange-600 hover:border-orange-300 transition flex items-center">
                  <FaUsers className="mr-2" /> Comunidad
                </Tab>
                <Tab className="px-4 py-3 text-sm font-medium cursor-pointer focus:outline-none border-b-2 border-transparent hover:text-orange-600 hover:border-orange-300 transition flex items-center">
                  <FaStore className="mr-2" /> Aliados
                </Tab>
              </TabList>
            </Tabs>

            {/* Paneles de Contenido */}
            <div className="p-4 md:p-6">
              {/* Mi Cuenta */}
              {activeTab === 0 && (
                <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                  <div className="lg:col-span-2 bg-gray-50 rounded-lg p-6 shadow-sm">
                    <h3 className="text-lg font-semibold text-gray-800 mb-4 flex items-center">
                      <FaUserCog className="text-orange-500 mr-2" /> Información Personal
                    </h3>
                    <form className="space-y-4">
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
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
                      </div>

                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
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

                  <div className="space-y-6">
                    <div className="bg-gray-50 rounded-lg p-6 shadow-sm">
                      <h3 className="text-lg font-semibold text-gray-800 mb-4 flex items-center">
                        <FaShieldAlt className="text-orange-500 mr-2" /> Seguridad
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

                    <div className="bg-gray-50 rounded-lg p-6 shadow-sm">
                      <h3 className="text-lg font-semibold text-gray-800 mb-4 flex items-center">
                        <FaMotorcycle className="text-orange-500 mr-2" /> Preferencias de Rodada
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
              )}

              {/* Mis Eventos */}
              {activeTab === 1 && (
                <div>
                  <div className="mb-6">
                    <h3 className="text-xl font-semibold text-gray-800 mb-4">Mis Eventos Registrados</h3>
                    <div className="space-y-3">
                      {userData.registeredEvents.map(event => (
                        <div key={event.id} className={`border rounded-lg overflow-hidden ${event.status === 'Confirmado' ? 'border-green-200 bg-green-50' : 'border-yellow-200 bg-yellow-50'}`}>
                          <div className="p-4 grid grid-cols-1 sm:grid-cols-3 gap-4">
                            <div>
                              <h4 className="font-semibold text-gray-800">{event.name}</h4>
                              <div className="text-sm text-gray-600 mt-1">{event.date}</div>
                              <div className={`inline-flex items-center mt-2 text-sm px-3 py-1 rounded-full ${event.status === 'Confirmado' ? 'bg-green-100 text-green-800' : 'bg-yellow-100 text-yellow-800'}`}>
                                {statusIcon(event.status)}
                                {event.status}
                              </div>
                            </div>
                            <div className="sm:col-span-2">
                              <div className="flex flex-wrap gap-2 justify-start sm:justify-end">
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
                                {event.status === 'Pendiente' && (
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
                            <FaChevronDown className={`transition-transform ${dropdownOpen === event.id ? 'transform rotate-180' : ''}`} />
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
                </div>
              )}

              {/* Próximas Rodadas */}
              {activeTab === 2 && (
                <div>
                  <div className="mb-6">
                    <h3 className="text-xl font-semibold text-gray-800 mb-4">Próximos Eventos del Club</h3>
                    <div className="space-y-3">
                      {userData.upcomingEvents.map(event => (
                        <div key={event.id} className="border border-gray-200 rounded-lg overflow-hidden bg-white">
                          <div className="p-4">
                            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                              <div className="sm:col-span-2">
                                <h4 className="font-semibold text-gray-800">{event.name}</h4>
                                <div className="text-sm text-gray-600 mt-1">{event.date}</div>
                                <p className="text-sm text-gray-600 mt-2">
                                  Descripción breve del evento y lo que incluye...
                                </p>
                              </div>
                              <div className="flex flex-wrap gap-2 sm:justify-end items-start">
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
                </div>
              )}

              {/* Mis Puntos */}
              {activeTab === 3 && (
                <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                  <div className="lg:col-span-2 space-y-6">
                    <div className="bg-gradient-to-r from-orange-500 to-yellow-500 rounded-lg p-6 text-white shadow">
                      <h3 className="text-xl font-semibold mb-2">Puntos Totales</h3>
                      <div className="text-4xl font-bold">{userData.points}</div>
                      <p className="text-orange-100 mt-2">Solo te faltan 250 puntos para el siguiente nivel</p>
                    </div>

                    <div className="bg-white border rounded-lg p-6 shadow-sm">
                      <h3 className="text-lg font-semibold text-gray-800 mb-4">Desglose de Puntos</h3>
                      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
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

                    <div className="bg-white border rounded-lg p-6 shadow-sm">
                      <h3 className="text-lg font-semibold text-gray-800 mb-4 flex items-center">
                        <FaHistory className="text-orange-500 mr-2" /> Historial de Puntos
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

                  <div className="space-y-6">
                    <div className="bg-white border rounded-lg p-6 shadow-sm">
                      <h3 className="text-lg font-semibold text-gray-800 mb-4 flex items-center">
                        <FaTicketAlt className="text-orange-500 mr-2" /> Recompensas Disponibles
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
              )}

              {/* Mi Membresía */}
              {activeTab === 4 && (
                <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                  <div className="lg:col-span-2 space-y-6">
                    <div className="bg-white border rounded-lg p-6 shadow-sm">
                      <h3 className="text-lg font-semibold text-gray-800 mb-4">Estado de tu Membresía</h3>
                      <div className="border border-gray-200 rounded-lg p-6 text-center">
                        <div className="text-2xl font-bold text-orange-500 mb-2 flex items-center justify-center">
                          <FaMedal className="mr-2" /> {userData.membership}
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

                    <div className="bg-white border rounded-lg p-6 shadow-sm">
                      <h3 className="text-lg font-semibold text-gray-800 mb-4">
                        Beneficios de tu Membresía {userData.membership}
                      </h3>
                      <ul className="space-y-2">
                        {userData.membershipBenefits.map((benefit, index) => (
                          <li key={index} className="flex items-start">
                            <FaStar className="text-orange-500 mr-2 mt-1 flex-shrink-0" />
                            <span>{benefit}</span>
                          </li>
                        ))}
                      </ul>
                    </div>
                  </div>

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
              )}

              {/* PQRSDF */}
              {activeTab === 5 && (
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                  <div className="bg-white border rounded-lg p-6 shadow-sm">
                    <h3 className="text-lg font-semibold text-gray-800 mb-4">Radicar nueva PQRSDF</h3>
                    <form onSubmit={handleComplaintSubmit} className="space-y-4">
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">Tipo</label>
                        <select
                          name="type"
                          value={newComplaint.type}
                          onChange={(e) => setNewComplaint({ ...newComplaint, type: e.target.value })}
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
                          value={newComplaint.subject}
                          onChange={(e) => setNewComplaint({ ...newComplaint, subject: e.target.value })}
                          className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-orange-500"
                          required
                        />
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">Descripción</label>
                        <textarea
                          name="description"
                          value={newComplaint.description}
                          onChange={(e) => setNewComplaint({ ...newComplaint, description: e.target.value })}
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
                            {userData.complaints.map(item => (
                              <tr key={item.id}>
                                <td className="px-3 py-2 whitespace-nowrap text-sm text-gray-600">{item.date}</td>
                                <td className="px-3 py-2 whitespace-nowrap text-sm text-gray-600">{item.type}</td>
                                <td className="px-3 py-2 text-sm text-gray-600">{item.subject}</td>
                                <td className="px-3 py-2 whitespace-nowrap">
                                  <span className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${item.status === 'En proceso' ? 'bg-blue-100 text-blue-800' :
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
              )}

              {/* Comunidad */}
              {activeTab === 6 && (
                <div>
                  <h3 className="text-xl font-semibold text-gray-800 mb-6">Comunidad BSK</h3>

                  <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 mb-8">
                    <div className="bg-white border rounded-lg p-4 text-center shadow-sm">
                      <div className="text-2xl sm:text-3xl font-bold text-orange-500">1,250</div>
                      <div className="text-xs sm:text-sm text-gray-600">Miembros Activos</div>
                    </div>
                    <div className="bg-white border rounded-lg p-4 text-center shadow-sm">
                      <div className="text-2xl sm:text-3xl font-bold text-orange-500">48</div>
                      <div className="text-xs sm:text-sm text-gray-600">Rodadas este año</div>
                    </div>
                    <div className="bg-white border rounded-lg p-4 text-center shadow-sm">
                      <div className="text-2xl sm:text-3xl font-bold text-orange-500">15</div>
                      <div className="text-xs sm:text-sm text-gray-600">Ciudades</div>
                    </div>
                    <div className="bg-white border rounded-lg p-4 text-center shadow-sm">
                      <div className="text-2xl sm:text-3xl font-bold text-orange-500">8</div>
                      <div className="text-xs sm:text-sm text-gray-600">Años de historia</div>
                    </div>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
                    <div className="bg-white border rounded-lg p-6 text-center shadow-sm hover:shadow-md transition">
                      <div className="text-orange-500 mb-3 mx-auto" style={{ width: '32px', height: '32px' }}>
                        <FaUsers size={32} />
                      </div>
                      <h4 className="font-semibold text-gray-800 mb-2">Grupos Locales</h4>
                      <p className="text-sm text-gray-600 mb-4">Conecta con miembros en tu ciudad</p>
                      <button className="bg-orange-500 hover:bg-orange-600 text-white px-4 py-2 rounded-md text-sm transition">
                        Explorar
                      </button>
                    </div>
                    <div className="bg-white border rounded-lg p-6 text-center shadow-sm hover:shadow-md transition">
                      <div className="text-orange-500 mb-3 mx-auto" style={{ width: '32px', height: '32px' }}>
                        <FaMapMarkedAlt size={32} />
                      </div>
                      <h4 className="font-semibold text-gray-800 mb-2">Rutas Compartidas</h4>
                      <p className="text-sm text-gray-600 mb-4">Descubre rutas favoritas de la comunidad</p>
                      <button className="bg-orange-500 hover:bg-orange-600 text-white px-4 py-2 rounded-md text-sm transition">
                        Ver Mapa
                      </button>
                    </div>
                    <div className="bg-white border rounded-lg p-6 text-center shadow-sm hover:shadow-md transition">
                      <div className="text-orange-500 mb-3 mx-auto" style={{ width: '32px', height: '32px' }}>
                        <FaChartLine size={32} />
                      </div>
                      <h4 className="font-semibold text-gray-800 mb-2">Clasificaciones</h4>
                      <p className="text-sm text-gray-600 mb-4">Top miembros por puntos y participación</p>
                      <button className="bg-orange-500 hover:bg-orange-600 text-white px-4 py-2 rounded-md text-sm transition">
                        Ver Ranking
                      </button>
                    </div>
                    <div className="bg-white border rounded-lg p-6 text-center shadow-sm hover:shadow-md transition">
                      <div className="text-orange-500 mb-3 mx-auto" style={{ width: '32px', height: '32px' }}>
                        <FaHistory size={32} />
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
                </div>
              )}

              {/* Aliados */}
              {activeTab === 7 && (
                <div>
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
                            <FaStar className="mr-1" /> 15% descuento para miembros BSK
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
                            <FaStar className="mr-1" /> 10% descuento + 50 puntos por compra
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
                            <FaStar className="mr-1" /> 20% descuento + estacionamiento seguro
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
                </div>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Footer */}
      <div className="bg-gray-800 text-white p-6 mt-6">
        <div className="max-w-7xl mx-auto">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <h4 className="font-semibold mb-3">Contactos de Emergencia:</h4>
              <div className="space-y-2">
                <div className="flex items-center">
                  <FaShieldAlt className="mr-2 text-orange-400" />
                  <span>Asistencia Vial BSK: 018000-123456</span>
                </div>
                <div className="flex items-center">
                  <FaShieldAlt className="mr-2 text-orange-400" />
                  <span>Emergencias Médicas: 123</span>
                </div>
                <div className="flex items-center">
                  <FaShieldAlt className="mr-2 text-orange-400" />
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