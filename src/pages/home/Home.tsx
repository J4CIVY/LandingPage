import React, { useState, useEffect } from "react";
import api from "../../components/api/Api"; // Assuming this path is correct for your project structure
import SEOComponent from "./components/SEOComponent";
import HeroSection from "./components/HeroSection";
import AboutSection from "./components/AboutSection";
import EventsSection from "./components/EventsSection";
import GallerySection from "./components/GallerySection";
import BenefitsSection from "./components/BenefitsSection";
import StoreSection from "./components/StoreSection";
import BlogSection from "./components/BlogSection";
import FAQSection from "./components/FAQSection";
import { Event } from './types';

const Home: React.FC = () => {
  const [events, setEvents] = useState<Event[]>([]);
  const [loadingEvents, setLoadingEvents] = useState<boolean>(true);
  const [errorEvents, setErrorEvents] = useState<string | null>(null);

  useEffect(() => {
    /**
     * Fetches events from the API.
     * Sets loading, error, and events states based on the API response.
     */
    const fetchEvents = async (): Promise<void> => {
      try {
        // Use the imported api instance for the request
        const response = await api.get<{ status: string; data: { events: Event[] } }>('/events');
        
        // Check if the response structure is as expected
        if (response.data.status === 'success' && Array.isArray(response.data.data.events)) {
          setEvents(response.data.data.events);
        } else {
          // Handle unexpected response format
          throw new Error('Formato de respuesta de eventos inesperado.');
        }
      } catch (error: any) { // Using 'any' for catch error type as it can be various types
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