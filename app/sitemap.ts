import { MetadataRoute } from 'next'

/**
 * Generates comprehensive XML sitemap for BSK Motorcycle Team website
 * Includes static routes with appropriate priorities and change frequencies
 * This helps search engines crawl and index the site more efficiently
 */
export default function sitemap(): MetadataRoute.Sitemap {
  const baseUrl = 'https://bskmt.com'
  const currentDate = new Date()
  const lastModified = currentDate.toISOString()
  
  // High-priority routes (Homepage and key conversion pages)
  const highPriorityRoutes = [
    {
      url: baseUrl,
      lastModified: currentDate,
      changeFrequency: 'daily' as const,
      priority: 1.0,
    },
    {
      url: `${baseUrl}/memberships`,
      lastModified: currentDate,
      changeFrequency: 'weekly' as const,
      priority: 0.9,
    },
    {
      url: `${baseUrl}/register`,
      lastModified: currentDate,
      changeFrequency: 'monthly' as const,
      priority: 0.9,
    },
  ]

  // Medium-high priority routes (Services and features)
  const mediumHighPriorityRoutes = [
    {
      url: `${baseUrl}/events`,
      lastModified: currentDate,
      changeFrequency: 'daily' as const,
      priority: 0.9,
    },
    {
      url: `${baseUrl}/store`,
      lastModified: currentDate,
      changeFrequency: 'weekly' as const,
      priority: 0.8,
    },
    {
      url: `${baseUrl}/courses`,
      lastModified: currentDate,
      changeFrequency: 'weekly' as const,
      priority: 0.8,
    },
    {
      url: `${baseUrl}/sos`,
      lastModified: currentDate,
      changeFrequency: 'monthly' as const,
      priority: 0.9,
    },
  ]

  // Medium priority routes (Information pages)
  const mediumPriorityRoutes = [
    {
      url: `${baseUrl}/about`,
      lastModified: currentDate,
      changeFrequency: 'monthly' as const,
      priority: 0.8,
    },
    {
      url: `${baseUrl}/membership-info`,
      lastModified: currentDate,
      changeFrequency: 'monthly' as const,
      priority: 0.7,
    },
    {
      url: `${baseUrl}/weather`,
      lastModified: currentDate,
      changeFrequency: 'daily' as const,
      priority: 0.6,
    },
    {
      url: `${baseUrl}/contact`,
      lastModified: currentDate,
      changeFrequency: 'monthly' as const,
      priority: 0.7,
    },
  ]

  // Lower priority routes (Utility and legal pages)
  const lowerPriorityRoutes = [
    {
      url: `${baseUrl}/documents`,
      lastModified: currentDate,
      changeFrequency: 'monthly' as const,
      priority: 0.5,
    },
    {
      url: `${baseUrl}/cookie-policy`,
      lastModified: currentDate,
      changeFrequency: 'yearly' as const,
      priority: 0.3,
    },
  ]

  // Combine all routes
  return [
    ...highPriorityRoutes,
    ...mediumHighPriorityRoutes,
    ...mediumPriorityRoutes,
    ...lowerPriorityRoutes,
  ]
}

/**
 * Future Enhancement: Dynamic sitemap generation
 * 
 * To include dynamic content (events, products, blog posts), implement:
 * 
 * 1. Fetch dynamic data from database/API
 * 2. Map each item to sitemap entry
 * 3. Include appropriate lastModified dates from database
 * 
 * Example for events:
 * 
 * const events = await fetchEvents()
 * const eventUrls = events.map(event => ({
 *   url: `${baseUrl}/events/${event.slug}`,
 *   lastModified: new Date(event.updatedAt),
 *   changeFrequency: 'weekly' as const,
 *   priority: 0.7,
 * }))
 * 
 * Then include eventUrls in the return array
 */
