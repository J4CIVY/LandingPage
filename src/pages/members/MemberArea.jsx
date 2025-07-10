import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { useAuth } from '../../context/AuthContext';
import { useNavigate, useLocation } from 'react-router-dom';
import { jwtDecode } from "jwt-decode";
import LoadingErrorHandler from './components/LoadingErrorHandler';
import Header from './components/Header';
import MobileMenu from './components/MobileMenu';
import Sidebar from './components/Sidebar';
import TabsNavigation from './components/TabsNavigation';
import AccountTab from './components/AccountTab';
import EventsTab from './components/EventsTab';
import RidesTab from './components/RidesTab';
import PointsTab from './components/PointsTab';
import MembershipTab from './components/MembershipTab';
import ComplaintsTab from './components/ComplaintsTab';
import CommunityTab from './components/CommunityTab';
import PartnersTab from './components/PartnersTab';
import Footer from './components/Footer';

const MemberArea = () => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const [activeTab, setActiveTab] = useState(0);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [dropdownOpen, setDropdownOpen] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const API_URL = import.meta.env.VITE_API_URL || "https://api.bskmt.com";

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

  // Axios interceptor for 401 errors to handle session expiry
  useEffect(() => {
    const interceptor = axios.interceptors.response.use(
      response => response,
      error => {
        if (error.response?.status === 401) {
          handleSessionExpired();
        }
        return Promise.reject(error);
      }
    );

    return () => {
      axios.interceptors.response.eject(interceptor);
    };
  }, []);

  const handleSessionExpired = () => {
    localStorage.removeItem('token');
    logout();
    navigate('/login', { state: { from: location, sessionExpired: true } });
  };

  const isTokenValid = (token) => {
    if (!token) return false;
    try {
      const decoded = jwtDecode(token);
      return decoded.exp > Date.now() / 1000;
    } catch {
      return false;
    }
  };

  useEffect(() => {
    const fetchUserData = async () => {
      try {
        setLoading(true);
        setError(null);

        const token = localStorage.getItem('token');

        if (!token || !isTokenValid(token)) {
          throw new Error('Token inválido o expirado');
        }

        const response = await axios.get(`${API_URL}/users/me`, {
          headers: {
            Authorization: `Bearer ${token}`
          },
          timeout: 10000
        });

        if (!response.data || !response.data.data?.user) {
          throw new Error('Estructura de respuesta inesperada');
        }

        const userDataFromApi = response.data.data.user;

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
          bikeModel: `${userDataFromApi.motorcycleBrand || ''} ${userDataFromApi.motorcycleModel || ''}`.trim(),
          bikeYear: userDataFromApi.motorcycleYear || '',
          bloodType: `${userDataFromApi.bloodType || ''}${userDataFromApi.rhFactor || ''}`,
          allergies: userDataFromApi.allergies || 'Ninguna'
        });

      } catch (err) {
        console.error('Error cargando datos del usuario:', err);
        setError(err.response?.data?.message || err.message || 'Error al cargar los datos del usuario');
        handleSessionExpired();
      } finally {
        setLoading(false);
      }
    };

    const token = localStorage.getItem('token');
    if (!token || !isTokenValid(token)) {
      handleSessionExpired();
    } else {
      fetchUserData();
    }
  }, [user, location]);

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleSavePersonalInfo = () => {
    alert('Funcionalidad de guardar cambios próximamente.');
  };

  const handleComplaintSubmit = async (e) => {
    e.preventDefault();
    try {
      const token = localStorage.getItem('token');
      if (!token) {
        handleSessionExpired();
        return;
      }

      const response = await axios.post(
        `${API_URL}/users/${user.documentNumber}/complaints`,
        {
          type: newComplaint.type,
          message: newComplaint.description,
          subject: newComplaint.subject
        },
        {
          headers: {
            Authorization: `Bearer ${token}`
          }
        }
      );

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
      if (err.response?.status === 401) {
        handleSessionExpired();
      } else {
        alert(err.response?.data?.message || 'Error al enviar la PQRSDF');
      }
    }
  };

  const handleEventAction = async (eventId, action) => {
    try {
      const token = localStorage.getItem('token');
      if (!token) {
        handleSessionExpired();
        return;
      }

      let response;

      const config = {
        headers: {
          Authorization: `Bearer ${token}`
        }
      };

      if (action === 'register') {
        response = await axios.post(`${API_URL}/events/${eventId}/register`, {}, config);
      } else if (action === 'cancel') {
        response = await axios.post(`${API_URL}/events/${eventId}/cancel`, {}, config);
      } else if (action === 'confirm') {
        response = await axios.post(`${API_URL}/events/${eventId}/confirm`, {}, config);
      } else if (action === 'details') {
        toggleDropdown(eventId);
        return;
      } else if (action === 'share') {
        alert('Funcionalidad de compartir próximamente.');
        return;
      } else if (action === 'reminder') {
        alert('Recordatorio programado.');
        return;
      }

      if (response) {
        alert(`Acción "${action}" realizada con éxito`);
        const updatedEvents = userData.registeredEvents.map(event => {
          if (event.id === eventId) {
            if (action === 'cancel') {
              return { ...event, status: 'Cancelado' };
            } else if (action === 'confirm') {
              return { ...event, status: 'Confirmado' };
            }
            return { ...event };
          }
          return event;
        });

        setUserData(prev => ({ ...prev, registeredEvents: updatedEvents }));
      }
    } catch (err) {
      if (err.response?.status === 401) {
        handleSessionExpired();
      } else {
        alert(err.response?.data?.message || `Error al realizar la acción "${action}"`);
      }
    }
  };

  const handleMembershipAction = async (action) => {
    try {
      const token = localStorage.getItem('token');
      if (!token) {
        handleSessionExpired();
        return;
      }

      let response;
      const config = { headers: { Authorization: `Bearer ${token}` } };

      if (action === 'renew') {
        response = await axios.post(`${API_URL}/users/${user.documentNumber}/renew-membership`, {}, config);
      } else if (action === 'upgrade') {
        response = await axios.post(`${API_URL}/users/${user.documentNumber}/upgrade-membership`, {}, config);
      } else if (action === 'cancel') {
        response = await axios.post(`${API_URL}/users/${user.documentNumber}/cancel-membership`, {}, config);
      }

      if (response) {
        alert(`Membresía ${action === 'renew' ? 'renovada' : action === 'upgrade' ? 'actualizada' : 'cancelada'} con éxito`);
        setUserData(prev => ({
          ...prev,
          membership: response.data.data.user.role,
          membershipExpiry: response.data.data.user.membershipExpiry || prev.membershipExpiry,
          membershipBenefits: response.data.data.user.membershipBenefits || prev.membershipBenefits
        }));
      }
    } catch (err) {
      if (err.response?.status === 401) {
        handleSessionExpired();
      } else {
        alert(err.response?.data?.message || `Error al ${action === 'renew' ? 'renovar' : action === 'upgrade' ? 'actualizar' : 'cancelar'} la membresía`);
      }
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
        return <FaCheckCircle className="text-green-500 mr-1" aria-label="Estado confirmado" />;
      case 'Pendiente':
      case 'En Progreso':
        return <FaClock className="text-yellow-500 mr-1" aria-label="Estado pendiente" />;
      case 'Cancelado':
        return <FaExclamationTriangle className="text-red-500 mr-1" aria-label="Estado cancelado" />;
      default:
        return <FaExclamationTriangle className="text-gray-500 mr-1" aria-label="Estado desconocido" />;
    }
  };

  if (loading || error) {
    return <LoadingErrorHandler loading={loading} error={error} logout={logout} navigate={navigate} />;
  }

  return (
    <div className="bg-white min-h-screen text-slate-950">
      <Header 
        userData={userData} 
        mobileMenuOpen={mobileMenuOpen} 
        setMobileMenuOpen={setMobileMenuOpen} 
      />

      {mobileMenuOpen && (
        <MobileMenu 
          userData={userData} 
          activeTab={activeTab} 
          setActiveTab={setActiveTab} 
          setMobileMenuOpen={setMobileMenuOpen} 
          logout={logout} 
        />
      )}

      <div className="max-w-7xl mx-auto px-4">
        <div className="flex flex-col lg:flex-row">
          <Sidebar userData={userData} logout={logout} />

          <main className="flex-1 bg-white rounded-lg shadow-sm overflow-hidden lg:ml-4 mt-4 lg:mt-6 p-4 md:p-6">
            <TabsNavigation 
              activeTab={activeTab} 
              setActiveTab={setActiveTab} 
              userData={userData} 
            />

            <div className="p-4 md:p-6">
              {activeTab === 0 && (
                <AccountTab 
                  formData={formData} 
                  handleInputChange={handleInputChange} 
                  handleSavePersonalInfo={handleSavePersonalInfo} 
                />
              )}
              {activeTab === 1 && (
                <EventsTab 
                  userData={userData} 
                  dropdownOpen={dropdownOpen} 
                  toggleDropdown={toggleDropdown} 
                  handleEventAction={handleEventAction} 
                  statusIcon={statusIcon} 
                />
              )}
              {activeTab === 2 && (
                <RidesTab 
                  userData={userData} 
                  handleEventAction={handleEventAction} 
                />
              )}
              {activeTab === 3 && (
                <PointsTab userData={userData} />
              )}
              {activeTab === 4 && (
                <MembershipTab 
                  userData={userData} 
                  handleMembershipAction={handleMembershipAction} 
                />
              )}
              {activeTab === 5 && (
                <ComplaintsTab 
                  newComplaint={newComplaint} 
                  setNewComplaint={setNewComplaint} 
                  handleComplaintSubmit={handleComplaintSubmit} 
                  userData={userData} 
                  statusIcon={statusIcon} 
                />
              )}
              {activeTab === 6 && (
                <CommunityTab userData={userData} />
              )}
              {activeTab === 7 && (
                <PartnersTab />
              )}
            </div>
          </main>
        </div>
      </div>

      <Footer />
    </div>
  );
};

export default MemberArea;