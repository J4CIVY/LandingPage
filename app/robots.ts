import { MetadataRoute } from 'next'

export default function robots(): MetadataRoute.Robots {
  const baseUrl = 'https://bskmt.com'
  
  return {
    rules: [
      {
        userAgent: '*',
        allow: [
          '/',
          '/store',
          '/events',
          '/courses',
          '/about',
          '/memberships',
          '/membership-info',
          '/weather',
          '/sos',
          '/contact',
          '/documents',
          '/register',
          '/cookie-policy',
          '/*.js$',
          '/*.css$',
          '/favicon.ico',
          '/manifest.json',
          '/sw.js',
        ],
        disallow: [
          '/admin/',
          '/dashboard/',
          '/private/',
          '/api/',
          '/config/',
          '/_next/',
          '/*?*',
          '/*.json$',
          '/*.map$',
          '/registration-success',
          '/test/',
          '/.env*',
          '/node_modules/',
          // Security - Block common attack paths
          '/wp-admin/',
          '/wp-content/',
          '/wp-includes/',
          '/phpMyAdmin/',
          '/phpmyadmin/',
          '/.git/',
          '/.env',
          '/backup/',
          '/backups/',
        ],
      },
      // Specific rules for search engine bots
      {
        userAgent: 'Googlebot',
        allow: [
          '/',
          '/*.js$',
          '/*.css$',
        ],
        disallow: [
          '/admin/',
          '/api/',
          '/private/',
          '/_next/',
          '/test/',
        ],
      },
      {
        userAgent: 'Bingbot',
        allow: [
          '/',
          '/*.js$',
          '/*.css$',
        ],
        disallow: [
          '/admin/',
          '/api/',
          '/private/',
          '/_next/',
          '/test/',
        ],
      },
    ],
    sitemap: `${baseUrl}/sitemap.xml`,
    host: baseUrl,
  }
}
