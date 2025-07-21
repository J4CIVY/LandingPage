import React, { useState, useEffect } from "react";
import axios from "axios";
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
        const response = await axios.get('https://api.bskmt.com/events');
        setEvents(response.data.data.events);
      } catch (error) {
        console.error('Error fetching events:', error);
        setErrorEvents(error.response?.data?.message || error.message || 'Error al cargar los eventos');
      } finally {
        setLoadingEvents(false);
      }
    };

    fetchEvents();
  }, []);

  return (
    <>
      <SEOComponent />
      <div className="min-h-screen bg-[#ffffff]">
        <HeroSection />
        <AboutSection />
        <EventsSection 
          events={events} 
          loading={loadingEvents} 
          error={errorEvents} 
        />
        <GallerySection />
        <BenefitsSection />
        <StoreSection />
        <BlogSection />
        <FAQSection />
      </div>
    </>
  );
};

export default Home;