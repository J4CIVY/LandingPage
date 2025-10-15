/**
 * Server-side Event Data Fetching Service
 * Provides optimized server-side data fetching for events
 * Used by Server Components for better SEO and performance
 */

export interface PublicEvent {
  _id: string;
  name: string;
  startDate: string;
  description: string;
  mainImage: string;
  eventType: string;
  departureLocation?: {
    address: string;
    city: string;
    country: string;
  };
}

/**
 * Fetches public events from the API server-side
 * This runs on the server, so data is available immediately for SEO
 * 
 * @param options - Optional parameters for filtering events
 * @returns Promise<PublicEvent[]> - Array of public events
 */
export async function getPublicEventsServerSide(options?: {
  upcoming?: boolean;
  limit?: number;
}): Promise<PublicEvent[]> {
  try {
    // Use environment variable or fallback to localhost
    const baseUrl = process.env.NEXT_PUBLIC_SITE_URL || 'http://localhost:3000';
    
    // Build API URL
    const params = new URLSearchParams();
    if (options?.upcoming) params.append('upcoming', 'true');
    if (options?.limit) params.append('limit', options.limit.toString());
    
    const url = `${baseUrl}/api/events?${params.toString()}`;
    
    // Fetch events with timeout
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 5000); // 5 second timeout
    
    const response = await fetch(url, {
      next: { revalidate: 300 }, // Revalidate every 5 minutes
      signal: controller.signal,
    });
    
    clearTimeout(timeoutId);
    
    if (!response.ok) {
      console.error(`Failed to fetch events: ${response.status} ${response.statusText}`);
      return [];
    }
    
    const data = await response.json();
    
    if (data.success && data.data?.events) {
      return data.data.events;
    }
    
    return [];
  } catch (error) {
    // Log error but don't crash the page
    console.error('Error fetching public events server-side:', error);
    return [];
  }
}

/**
 * Filters events to show only those in the next 6 months
 * 
 * @param events - Array of events to filter
 * @returns PublicEvent[] - Filtered events within 6 months
 */
export function filterEventsInSixMonths(events: PublicEvent[]): PublicEvent[] {
  const now = new Date();
  const sixMonthsFromNow = new Date();
  sixMonthsFromNow.setMonth(sixMonthsFromNow.getMonth() + 6);
  
  return events.filter(event => {
    const eventDate = new Date(event.startDate);
    return eventDate > now && eventDate < sixMonthsFromNow;
  });
}

/**
 * Gets unique locations from events array
 * 
 * @param events - Array of events
 * @returns string[] - Array of unique city names
 */
export function getUniqueLocations(events: PublicEvent[]): string[] {
  const locations = events
    .map(event => event.departureLocation?.city)
    .filter((city): city is string => Boolean(city));
  
  return Array.from(new Set(locations));
}
