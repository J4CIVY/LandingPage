/**
 * Cache Utilities for Next.js 16+ with React 19
 * 
 * Provides utilities for caching data fetching functions, API calls,
 * and expensive computations using React's cache() API.
 * 
 * @see https://react.dev/reference/react/cache
 * @see https://nextjs.org/docs/app/building-your-application/caching
 */

import { cache } from 'react';
import connectDB from './mongodb';

/**
 * Cache configuration types
 */
export interface CacheConfig {
  revalidate?: number; // Seconds until revalidation
  tags?: string[]; // Cache tags for invalidation
}

/**
 * Cached database connection
 * Ensures only one connection is established per request
 */
export const getCachedDB = cache(async () => {
  return await connectDB();
});

/**
 * Creates a cached fetch function with custom configuration
 * Use this for API calls that should be cached per-request
 * 
 * @example
 * const fetchEvents = createCachedFetch('/api/events', { revalidate: 60 });
 * const events = await fetchEvents();
 */
export function createCachedFetch<T = any>(
  url: string,
  options: RequestInit & CacheConfig = {}
) {
  const { revalidate, tags, ...fetchOptions } = options;
  
  return cache(async (): Promise<T> => {
    const response = await fetch(url, {
      ...fetchOptions,
      next: {
        revalidate: revalidate,
        tags: tags,
      },
    });
    
    if (!response.ok) {
      throw new Error(`Failed to fetch ${url}: ${response.statusText}`);
    }
    
    return response.json();
  });
}

/**
 * Cached event data fetcher
 * Revalidates every 5 minutes
 */
export const getCachedEvents = cache(async (upcoming: boolean = true) => {
  const baseUrl = process.env.NEXT_PUBLIC_BASE_URL || 'http://localhost:3000';
  const url = `${baseUrl}/api/events?upcoming=${upcoming}`;
  
  try {
    const response = await fetch(url, {
      next: { 
        revalidate: 300, // 5 minutes
        tags: ['events'] 
      },
    });
    
    if (!response.ok) {
      console.error(`Failed to fetch events: ${response.statusText}`);
      return { events: [], total: 0 };
    }
    
    const data = await response.json();
    return data.data || { events: [], total: 0 };
  } catch (error) {
    console.error('Error fetching cached events:', error);
    return { events: [], total: 0 };
  }
});

/**
 * Cached membership data fetcher
 * Revalidates every 10 minutes
 */
export const getCachedMemberships = cache(async () => {
  const baseUrl = process.env.NEXT_PUBLIC_BASE_URL || 'http://localhost:3000';
  
  try {
    const response = await fetch(`${baseUrl}/api/memberships/public`, {
      next: { 
        revalidate: 600, // 10 minutes
        tags: ['memberships'] 
      },
    });
    
    if (!response.ok) {
      console.error(`Failed to fetch memberships: ${response.statusText}`);
      return [];
    }
    
    const data = await response.json();
    return data.data || [];
  } catch (error) {
    console.error('Error fetching cached memberships:', error);
    return [];
  }
});

/**
 * Cached benefits data fetcher
 * Revalidates every 30 minutes (benefits change rarely)
 */
export const getCachedBenefits = cache(async () => {
  const baseUrl = process.env.NEXT_PUBLIC_BASE_URL || 'http://localhost:3000';
  
  try {
    const response = await fetch(`${baseUrl}/api/benefits`, {
      next: { 
        revalidate: 1800, // 30 minutes
        tags: ['benefits'] 
      },
    });
    
    if (!response.ok) {
      console.error(`Failed to fetch benefits: ${response.statusText}`);
      return [];
    }
    
    const data = await response.json();
    return data.data || [];
  } catch (error) {
    console.error('Error fetching cached benefits:', error);
    return [];
  }
});

/**
 * Cached products data fetcher
 * Revalidates every 15 minutes
 */
export const getCachedProducts = cache(async (featured: boolean = false) => {
  const baseUrl = process.env.NEXT_PUBLIC_BASE_URL || 'http://localhost:3000';
  const url = featured 
    ? `${baseUrl}/api/products/featured` 
    : `${baseUrl}/api/products`;
  
  try {
    const response = await fetch(url, {
      next: { 
        revalidate: 900, // 15 minutes
        tags: ['products'] 
      },
    });
    
    if (!response.ok) {
      console.error(`Failed to fetch products: ${response.statusText}`);
      return [];
    }
    
    const data = await response.json();
    return data.data || [];
  } catch (error) {
    console.error('Error fetching cached products:', error);
    return [];
  }
});

/**
 * Cache wrapper for expensive computations
 * Use for any synchronous computation that should be memoized per-request
 * 
 * @example
 * const expensiveCalc = createCachedComputation((n: number) => {
 *   return complexCalculation(n);
 * });
 */
export function createCachedComputation<TArgs extends any[], TResult>(
  fn: (...args: TArgs) => TResult
) {
  return cache(fn);
}

/**
 * Preload function for cached data
 * Call this during SSR or in parent components to start loading data early
 * 
 * @example
 * preloadCachedData(getCachedEvents, true);
 */
export function preloadCachedData<T extends any[], R>(
  cachedFn: (...args: T) => Promise<R>,
  ...args: T
): void {
  void cachedFn(...args);
}

/**
 * Utility to invalidate cache by tags
 * Note: This is a placeholder for the Next.js revalidateTag API
 * 
 * @example
 * await invalidateCacheTags(['events']);
 */
export async function invalidateCacheTags(tags: string[]): Promise<void> {
  // This will be implemented with Next.js revalidateTag
  // For now, we just log the intent
  console.log(`Cache invalidation requested for tags: ${tags.join(', ')}`);
  
  // In production, you would use:
  // const { revalidateTag } = await import('next/cache');
  // tags.forEach(tag => revalidateTag(tag));
}

/**
 * Type-safe cache key generator
 * Useful for creating consistent cache keys
 */
export function createCacheKey(...parts: (string | number | boolean)[]): string {
  return parts.filter(Boolean).join(':');
}
