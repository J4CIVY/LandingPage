// Augmenting the Window interface
declare global {
  interface Window {
    googleAnalyticsLoaded: boolean;
  }
}

export interface BlogPost {
  id: number;
  title: string;
  excerpt: string;
  date: string;
  image: string;
  slug: string;
}

export interface FAQQuestion {
  q: string;
  a: string;
  category: 'membership' | 'events' | 'benefits' | 'general' | 'organization';
}

export {};
