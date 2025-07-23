import React, { useState, useEffect } from "react";
import api from "./components/Api"; // Import the configured axios instance
import SEOComponent from "./components/SEOComponent";
import HeroSection from "./components/HeroSection";
import AboutSection from "./components/AboutSection";
import EventsSection from "./components/EventsSection";
import GallerySection from "./components/GallerySection";
import BenefitsSection from "./components/BenefitsSection";
import StoreSection from "./components/StoreSection";
import BlogSection from "./components/BlogSection";
import FAQSection from "./components/FAQSection";

const Home = () => {
  const [events, setEvents] = useState([]);
  const [loadingEvents, setLoadingEvents] = useState(true);
  const [errorEvents, setErrorEvents] = useState(null);

  useEffect(() => {
    const fetchEvents = async () => {
      try {
        // Use the imported api instance for the request
        const response = await api.get('/events');
        
        // Check if the response structure is as expected
        if (response.data.status === 'success' && Array.isArray(response.data.data.events)) {
          setEvents(response.data.data.events);
        } else {
          // Handle unexpected response format
          throw new Error('Formato de respuesta de eventos inesperado.');
        }
      } catch (error) {
        console.error('Error fetching events:', error);
        // Provide a more user-friendly error message
        setErrorEvents(error.response?.data?.message || error.message || 'Error al cargar los eventos');
      } finally {
        setLoadingEvents(false);
      }
    };

    fetchEvents();
  }, []); // Empty dependency array means this effect runs once on mount

  return (
    <>
      {/* SEOComponent for managing meta tags */}
      <SEOComponent />
      <div className="min-h-screen bg-[#ffffff]">
        {/* Hero Section */}
        <HeroSection />
        {/* About Section */}
        <AboutSection />
        {/* Events Section, passing fetched data and loading/error states */}
        <EventsSection 
          events={events} 
          loading={loadingEvents} 
          error={errorEvents} 
        />
        {/* Gallery Section */}
        <GallerySection />
        {/* Benefits Section */}
        <BenefitsSection />
        {/* Store Section */}
        <StoreSection />
        {/* Blog Section */}
        <BlogSection />
        {/* FAQ Section */}
        <FAQSection />
      </div>
    </>
  );
};

export default Home;