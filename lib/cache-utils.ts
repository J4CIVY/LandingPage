/* eslint-disable @typescript-eslint/no-explicit-any */
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
import { apiClient } from './api-client';

/**
 * Cache configuration types
 */
export interface CacheConfig {
  revalidate?: number; // Seconds until revalidation
  tags?: string[]; // Cache tags for invalidation
}

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
  try {
    const response = await apiClient.get<{ data: { events: unknown[]; total: number } }>('/events/public', {
      params: { upcoming: upcoming.toString() }
    });
    
    return response.data || { events: [], total: 0 };
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
  try {
    const response = await apiClient.get<{ data: unknown[] }>('/memberships/public');
    return response.data || [];
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
  try {
    const response = await apiClient.get<{ data: unknown[] }>('/benefits/public');
    return response.data || [];
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
  try {
    const endpoint = featured ? '/products/featured' : '/products';
    const response = await apiClient.get<{ data: unknown[] }>(endpoint);
    return response.data || [];
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
 * Utility to invalidate cache by tags using Next.js 16 revalidateTag
 * 
 * @param tags - Array of cache tags to invalidate
 * @param cacheLife - Cache life profile: 'default', 'max', or 'min' (default: 'default')
 * 
 * @example
 * // Soft revalidation (users see stale data while it revalidates)
 * await invalidateCacheTags(['events'], 'max');
 * 
 * @example
 * // Default revalidation
 * await invalidateCacheTags(['events']);
 */
export async function invalidateCacheTags(
  tags: string[], 
  cacheLife: 'default' | 'max' | 'min' = 'default'
): Promise<void> {
  const { revalidateTag } = await import('next/cache');
  tags.forEach(tag => revalidateTag(tag, cacheLife));
}

/**
 * Utility to immediately update cache using Next.js 16 updateTag
 * Provides read-your-writes semantics - users see changes immediately
 * 
 * @param tags - Array of cache tags to update
 * 
 * @example
 * // User profile updated - show changes immediately
 * await updateCacheTags(['user-123']);
 */
export async function updateCacheTags(tags: string[]): Promise<void> {
  const { updateTag } = await import('next/cache');
  tags.forEach(tag => updateTag(tag));
}

/**
 * Type-safe cache key generator
 * Useful for creating consistent cache keys
 */
export function createCacheKey(...parts: (string | number | boolean)[]): string {
  return parts.filter(Boolean).join(':');
}
