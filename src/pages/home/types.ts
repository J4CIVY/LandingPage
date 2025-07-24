/**
 * @file This file contains common interfaces and types used across the application.
 */

/**
 * Interface for an event object.
 */
export interface Event {
  _id: string;
  name: string;
  startDate: string; // ISO date string
  endDate?: string; // ISO date string
  meetupTime: string; // Time string, e.g., "HH:mm:ss"
  departureTime: string; // Time string, e.g., "HH:mm:ss"
  durationDays: number;
  departureLocation: {
    address: string;
    city: string;
    coordinates: [number, number]; // [longitude, latitude]
  };
  stayLocation?: {
    address: string;
    city: string;
    coordinates: [number, number];
  };
  maxParticipants: number;
  remainingSpots: number;
  description: string;
  mainImage?: string;
  difficultyLevel: 'low' | 'medium' | 'high';
  eventType: 'Ride' | 'Meetup' | string; // Can be extended
  internalEventType: string;
  basePriceRider?: number;
  basePriceCompanion?: number;
  itinerary?: Array<{
    day: number;
    activities: Array<{
      time: string;
      description: string;
    }>;
  }>;
  activities?: string[];
  includes?: Array<{
    item: string;
    detail?: string;
  }>;
  requirements?: string[];
  recommendations?: string[];
  visits?: string[];
  additionalInformation?: string;
  slug: string;
}

/**
 * Interface for a product object.
 */
export interface Product {
  _id: string;
  name: string;
  description: string;
  price: number;
  discountPrice?: number;
  featuredImage: string;
  slug: string;
  // Add other product properties as needed
}

/**
 * Interface for a blog post object.
 */
export interface BlogPost {
  id: number;
  title: string;
  excerpt: string;
  date: string;
  image: string;
  slug: string;
}

/**
 * Interface for a gallery image object.
 */
export interface GalleryImage {
  id: number;
  src: string;
  alt: string;
}

/**
 * Interface for a FAQ question object.
 */
export interface FAQQuestion {
  q: string;
  a: string;
  category: 'membership' | 'events' | 'benefits' | 'general' | 'organization';
}