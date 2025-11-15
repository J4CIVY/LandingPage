import { MetadataRoute } from 'next'
import connectDB from '@/lib/mongodb'
import Event from '@/lib/models/Event'

/**
 * Generates comprehensive XML sitemap for BSK Motorcycle Team website
 * Includes static routes with appropriate priorities and change frequencies
 * ✅ SEO OPTIMIZATION: Now includes dynamic event pages for better crawl coverage
 * This helps search engines crawl and index the site more efficiently
 * 
 * NOTE: Accesses database directly during build instead of making HTTP calls
 */
export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const baseUrl = 'https://bskmt.com'
  const currentDate = new Date()
  
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

  // ✅ DYNAMIC CONTENT: Fetch upcoming events directly from database
  let dynamicEventRoutes: MetadataRoute.Sitemap = []
  try {
    // Connect to database directly (no HTTP calls during build)
    await connectDB()
    
    // Fetch upcoming events from database
    const now = new Date()
    const events = await Event.find({
      date: { $gte: now },
      status: 'published'
    })
    .select('_id name date')
    .limit(100)
    .sort({ date: 1 })
    .lean()
    
    // Generate sitemap entries for each event
    dynamicEventRoutes = events.map(event => ({
      url: `${baseUrl}/events/${event._id}`,
      lastModified: new Date(event.date),
      changeFrequency: 'weekly' as const,
      priority: 0.7,
    }))
    
    console.log(`✅ Sitemap: Added ${dynamicEventRoutes.length} dynamic event URLs`)
  } catch (error) {
    console.error('Error fetching events for sitemap:', error)
    // Continue without dynamic events if fetch fails
  }

  // Combine all routes (static + dynamic)
  return [
    ...highPriorityRoutes,
    ...mediumHighPriorityRoutes,
    ...mediumPriorityRoutes,
    ...lowerPriorityRoutes,
    ...dynamicEventRoutes,
  ]
}

/**
 * ✅ IMPLEMENTED: Dynamic sitemap generation
 * 
 * Architecture:
 * - Accesses MongoDB DIRECTLY during build (no HTTP fetch to localhost)
 * - Prevents ECONNREFUSED errors during static generation
 * - More efficient: no network overhead during build
 * 
 * The sitemap now includes:
 * - All static routes (homepage, about, contact, etc.)
 * - Dynamic event pages (fetched directly from database)
 * - Proper priorities and change frequencies
 * - Graceful error handling (continues without dynamic content if fetch fails)
 * 
 * Future enhancements:
 * - Add product pages when store is fully implemented
 * - Add blog posts if blog functionality is added
 * - Add course detail pages when courses have individual pages
 */
