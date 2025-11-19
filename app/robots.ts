import { MetadataRoute } from 'next'

/**
 * Generates robots.txt file for BSK Motorcycle Team website
 * Optimizes crawl budget and directs search engine bots to important content
 * 
 * Key optimizations:
 * - Allows indexing of public pages
 * - Blocks private/admin areas
 * - Prevents indexing of API endpoints
 * - Specifies sitemap location
 * - Includes specific rules for major search engines
 */
export default function robots(): MetadataRoute.Robots {
  const baseUrl = 'https://bskmt.com'
  
  return {
    rules: [
      // Default rules for all bots
      {
        userAgent: '*',
        allow: [
          '/',
          '/about',
          '/store',
          '/events',
          '/courses',
          '/memberships',
          '/membership-info',
          '/weather',
          '/sos',
          '/contact',
          '/documents',
          '/register',
          '/cookie-policy',
          // Allow CSS and JS for proper rendering
          '/*.css$',
          '/*.js$',
          // Allow essential static assets
          '/favicon.ico',
          '/manifest.json',
          '/robots.txt',
          '/sitemap.xml',
        ],
        disallow: [
          // Private and admin areas
          '/admin/',
          '/dashboard/',
          '/profile/',
          '/private/',
          // API endpoints
          '/api/',
          // Auth pages (no SEO value)
          '/login',
          '/auth/',
          '/oauth/',
          '/reset-password',
          '/verify-email',
          '/registration-success',
          '/welcome',
          // System directories
          '/config/',
          '/_next/data/',
          '/_next/image',
          '/node_modules/',
          // Query parameters (avoid duplicate content)
          '/*?*',
          '/*&*',
          // File types that shouldn't be indexed
          '/*.json$',
          '/*.map$',
          '/*.xml$',
          // Development/test areas
          '/test/',
          '/testing/',
          '/dev/',
          // Environment files
          '/.env*',
          '/.git/',
          // Common attack vectors (security)
          '/wp-admin/',
          '/wp-content/',
          '/wp-includes/',
          '/phpMyAdmin/',
          '/phpmyadmin/',
          '/cgi-bin/',
          '/admin.php',
          '/wp-login.php',
        ],
      },
      
      // Specific rules for Googlebot
      {
        userAgent: 'Googlebot',
        allow: [
          '/',
          '/about',
          '/store',
          '/events',
          '/courses',
          '/memberships',
          '/membership-info',
          '/weather',
          '/sos',
          '/contact',
          '/documents',
          '/register',
          '/*.css$',
          '/*.js$',
          '/*.webp$',
          '/*.jpg$',
          '/*.png$',
          '/*.svg$',
        ],
        disallow: [
          '/admin/',
          '/dashboard/',
          '/api/',
          '/private/',
          '/_next/data/',
          '/*?*',
          '/login',
          '/auth/',
        ],
      },
      
      // Specific rules for Bingbot
      {
        userAgent: 'Bingbot',
        allow: [
          '/',
          '/about',
          '/store',
          '/events',
          '/courses',
          '/memberships',
          '/*.css$',
          '/*.js$',
        ],
        disallow: [
          '/admin/',
          '/api/',
          '/private/',
          '/_next/',
        ],
        crawlDelay: 1, // Be nice to Bing
      },
      
      // Block bad bots (optional - add as needed)
      {
        userAgent: [
          'AhrefsBot',
          'SemrushBot',
          'DotBot',
          'MJ12bot',
          'BLEXBot',
        ],
        disallow: ['/'],
      },
    ],
    
    // Sitemap location(s)
    sitemap: [
      `${baseUrl}/sitemap.xml`,
      // Future: Add more sitemaps as needed
      // `${baseUrl}/sitemap-events.xml`,
      // `${baseUrl}/sitemap-products.xml`,
    ],
    
    // Set host preference (optional - helps with www vs non-www)
    host: baseUrl,
  }
}

/**
 * Additional SEO Notes:
 * 
 * 1. Crawl Budget Optimization:
 *    - Blocks admin areas to save crawl budget
 *    - Prevents duplicate content via query parameters
 *    - Focuses bots on valuable public pages
 * 
 * 2. Security Benefits:
 *    - Blocks common attack paths
 *    - Hides sensitive areas from bots
 *    - Reduces unnecessary traffic
 * 
 * 3. Future Enhancements:
 *    - Add crawl-delay for specific bots if needed
 *    - Create separate sitemaps for different content types
 *    - Monitor crawl stats in Google Search Console
 *    - Adjust rules based on actual bot behavior
 */
