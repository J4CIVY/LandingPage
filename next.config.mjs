/** @type {import('next').NextConfig} */
import withPWAInit from "@ducanh2912/next-pwa";
import { withBundleAnalyzer } from '@next/bundle-analyzer';

const withPWA = withPWAInit({
  dest: "public",
  disable: process.env.NODE_ENV === "development",
  register: true,
  skipWaiting: true,
  reloadOnOnline: true,
  // Disable precaching completely to avoid 404 errors
  cacheOnFrontEndNav: true,
  aggressiveFrontEndNavCaching: false,
  fallbacks: {
    document: '/offline',
  },
  workboxOptions: {
    skipWaiting: true,
    clientsClaim: true,
    cleanupOutdatedCaches: true,
    disableDevLogs: true,
    // Only precache the offline fallback page (nothing else)
    additionalManifestEntries: [
      { url: '/offline', revision: null }
    ],
    exclude: [/./],
    runtimeCaching: [
      {
        urlPattern: /^https:\/\/bskmt\.com\/_next\/static\/.*/,
        handler: 'CacheFirst',
        options: {
          cacheName: 'static-assets',
          expiration: {
            maxEntries: 100,
            maxAgeSeconds: 60 * 60 * 24 * 30, // 30 días
          },
          cacheableResponse: {
            statuses: [0, 200],
          },
        },
      },
      {
        urlPattern: /^https:\/\/res\.cloudinary\.com/,
        handler: 'CacheFirst',
        options: {
          cacheName: 'images-cache',
          expiration: {
            maxEntries: 100,
            maxAgeSeconds: 60 * 60 * 24 * 30, // 30 días
          },
        },
      },
      {
        urlPattern: /^https:\/\/fonts\.(googleapis|gstatic)\.com/,
        handler: 'StaleWhileRevalidate',
        options: {
          cacheName: 'google-fonts',
          expiration: {
            maxEntries: 30,
            maxAgeSeconds: 60 * 60 * 24 * 365, // 1 año
          },
        },
      },
      {
        urlPattern: /^https:\/\/bskmt\.com\/api\/.*/,
        handler: 'NetworkFirst',
        options: {
          cacheName: 'api-cache',
          expiration: {
            maxEntries: 50,
            maxAgeSeconds: 60 * 5, // 5 minutos
          },
          networkTimeoutSeconds: 3,
        },
      },
    ],
  },
});

const bundleAnalyzer = withBundleAnalyzer({
  enabled: process.env.ANALYZE === 'true',
});

const nextConfig = {
  reactStrictMode: true,
  poweredByHeader: false, // SECURITY: Remove X-Powered-By header to hide Next.js
  
  // React Compiler (Next.js 16 + React 19.2)
  // Automatically memoizes components to reduce unnecessary re-renders
  reactCompiler: true,
  
  // Next.js 16: Turbopack configuration
  turbopack: {
    // Add any Turbopack-specific configuration here if needed
  },
  
  compiler: {
    removeConsole: process.env.NODE_ENV === "production" ? {
      exclude: ['error', 'warn'], // Keep error and warn logs for monitoring
    } : false,
  },
  
  // Performance: Optimize images
  images: {
    remotePatterns: [
      {
        protocol: 'https',
        hostname: 'res.cloudinary.com',
        port: '',
        pathname: '/**',
      },
      {
        protocol: 'https',
        hostname: 'images.unsplash.com',
        port: '',
        pathname: '/**',
      }
    ],
    formats: ['image/avif', 'image/webp'],
    // Next.js 16 default: 14400 (4 hours)
    // Using 30 days for Cloudinary images (good balance)
    minimumCacheTTL: 2592000, // 30 days - Cloudinary images are relatively stable
    deviceSizes: [640, 750, 828, 1080, 1200, 1920, 2048, 3840],
    imageSizes: [32, 48, 64, 96, 128, 256, 384], // Next.js 16 removed 16px (retina displays fetch 32px anyway)
    // SECURITY: Next.js 16 breaking changes
    dangerouslyAllowLocalIP: false, // Block local IPs (production security)
    maximumRedirects: 0, // Cloudinary URLs are direct (no redirects needed)
    dangerouslyAllowSVG: false, // SECURITY: Prevent SVG XSS attacks
    contentDispositionType: 'attachment', // SECURITY: Force download for untrusted content
    contentSecurityPolicy: "default-src 'self'; script-src 'none'; sandbox;", // SECURITY: Strict CSP for images
    unoptimized: false, // SECURITY & PERFORMANCE: Enable image optimization
  },
  
  // React 19 Cache Components (Next.js 16+)
  cacheComponents: true,
  
  // Performance: Optimize package imports
  experimental: {
    optimizePackageImports: ['react-icons', '@react-google-maps/api'],
  },
  // Rewrites for proper asset handling
  async rewrites() {
    return [
      {
        source: '/_next/static/css/:path*',
        destination: '/_next/static/css/:path*',
        has: [
          {
            type: 'header',
            key: 'accept',
            value: '.*text/css.*',
          },
        ],
      },
    ];
  },
  headers: async () => {
    return [
      {
        source: '/sw.js',
        headers: [
          {
            key: 'Content-Security-Policy',
            value: `
              default-src 'self';
              script-src 'self' 'unsafe-inline' 'unsafe-eval';
              connect-src 'self' *;
              img-src 'self' data: https: blob:;
              font-src 'self' https://fonts.gstatic.com;
              style-src 'self' 'unsafe-inline' https://fonts.googleapis.com;
            `.replace(/\s+/g, ' ').trim(),
          },
        ],
      },
      {
        source: '/(.*)',
        headers: [
          {
            key: 'X-Content-Type-Options',
            value: 'nosniff',
          },
          {
            key: 'X-Frame-Options',
            value: 'DENY',
          },
          {
            key: 'X-XSS-Protection',
            value: '1; mode=block',
          },
          {
            key: 'Strict-Transport-Security',
            value: 'max-age=31536000; includeSubDomains; preload',
          },
          {
            key: 'Referrer-Policy',
            value: 'strict-origin-when-cross-origin',
          },
          {
            key: 'Permissions-Policy',
            value: 'camera=(), microphone=(), geolocation=(), payment=(self "https://checkout.bold.co"), usb=(), magnetometer=(self), gyroscope=(self), accelerometer=(self)',
          },
          {
            key: 'X-DNS-Prefetch-Control',
            value: 'on',
          },
          {
            key: 'X-Download-Options',
            value: 'noopen',
          },
          {
            key: 'X-Permitted-Cross-Domain-Policies',
            value: 'none',
          },
        ],
      },
      {
        source: '/(.*)\\.(css)',
        headers: [
          {
            key: 'Content-Type',
            value: 'text/css; charset=utf-8',
          },
          {
            key: 'Cache-Control',
            value: 'public, max-age=31536000, immutable',
          },
        ],
      },
      {
        source: '/(.*)\\.(js)',
        headers: [
          {
            key: 'Content-Type',
            value: 'application/javascript; charset=utf-8',
          },
          {
            key: 'Cache-Control',
            value: 'public, max-age=31536000, immutable',
          },
        ],
      },
      {
        source: '/(.*)\\.(ico|png|jpg|jpeg|gif|svg|woff|woff2)',
        headers: [
          {
            key: 'Cache-Control',
            value: 'public, max-age=31536000, immutable',
          },
        ],
      },
    ];
  },
  compress: true,
};

export default bundleAnalyzer(withPWA(nextConfig));
