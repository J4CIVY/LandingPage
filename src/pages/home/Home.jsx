import React, { useState, useEffect } from "react";
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

  // Fetch events from API
  useEffect(() => {
    const fetchEvents = async () => {
      try {
        const response = await fetch('https://api.bskmt.com/events');
        if (!response.ok) {
          throw new Error('Error al cargar los eventos');
        }
        const data = await response.json();
        setEvents(data.data.events);
      } catch (error) {
        console.error('Error fetching events:', error);
        setErrorEvents(error.message);
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