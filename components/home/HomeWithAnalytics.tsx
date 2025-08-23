'use client';

import React from "react";
import HeroSection from "@/components/home/HeroSection";
import HomeContent from "@/components/home/HomeContent";
import { 
  useCoreWebVitals, 
  usePerformanceMonitoring, 
  useScrollTracking 
} from "@/components/analytics/PerformanceAnalytics";

// Componente cliente para analytics
const HomeWithAnalytics: React.FC = () => {
  // Hooks de analytics y performance
  useCoreWebVitals();
  usePerformanceMonitoring();
  useScrollTracking();

  return (
    <>
      <HeroSection />
      <HomeContent />
    </>
  );
};

export default HomeWithAnalytics;
