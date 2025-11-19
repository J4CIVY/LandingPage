'use client';

import { type FC } from "react";
import HeroSection from "@/lib/components/home/HeroSection";
import HomeContent from "@/lib/components/home/HomeContent";
import { 
  useCoreWebVitals, 
  usePerformanceMonitoring, 
  useScrollTracking 
} from "@/lib/components/analytics/PerformanceAnalytics";

// Componente cliente para analytics
const HomeWithAnalytics: FC = () => {
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
