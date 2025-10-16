/** @type {import('next').NextConfig} */
import withPWAInit from "@ducanh2912/next-pwa";
import withBundleAnalyzer from '@next/bundle-analyzer';

const withPWA = withPWAInit({
  dest: "public",
  disable: process.env.NODE_ENV === "development",
  workboxOptions: {
    skipWaiting: true,
    clientsClaim: true,
    cleanupOutdatedCaches: true,
    disableDevLogs: true,
    // Deshabilitamos el precaching automático para evitar errores 404
    include: [],
    exclude: [/.*/], // Excluir todo del precaching automático
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
  eslint: {
    // Warning: This allows production builds to successfully complete even if
    // your project has ESLint errors.
    ignoreDuringBuilds: true,
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
    minimumCacheTTL: 31536000, // 1 year for better caching
    deviceSizes: [640, 750, 828, 1080, 1200, 1920, 2048, 3840],
    imageSizes: [16, 32, 48, 64, 96, 128, 256, 384],
    dangerouslyAllowSVG: false, // SECURITY: Prevent SVG XSS attacks
    contentDispositionType: 'attachment', // SECURITY: Force download for untrusted content
    contentSecurityPolicy: "default-src 'self'; script-src 'none'; sandbox;", // SECURITY: Strict CSP for images
    unoptimized: false, // SECURITY & PERFORMANCE: Enable image optimization
  },
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
            value: 'camera=(), microphone=(), geolocation=(), payment=(self "https://checkout.bold.co"), usb=(), magnetometer=(self), gyroscope=(self), accelerometer=(self), interest-cohort=()',
          },
          {
            key: 'Content-Security-Policy',
            value: `
              default-src 'self';
              script-src 'self' 'unsafe-inline' 'unsafe-eval' https://www.googletagmanager.com https://www.google-analytics.com https://maps.googleapis.com https://static.cloudflareinsights.com https://connect.facebook.net https://www.facebook.com https://checkout.bold.co https://cdn.segment.com https://cdn.deviceinf.com https://cdn.seonintelligence.com https://www.google.com/recaptcha/ https://www.gstatic.com/recaptcha/;
              style-src 'self' 'unsafe-inline' https://fonts.googleapis.com https://checkout.bold.co;
              img-src 'self' data: https: blob: https://res.cloudinary.com https://images.unsplash.com https://www.facebook.com https://platform-lookaside.fbsbx.com;
              font-src 'self' https://fonts.gstatic.com;
              connect-src 'self' https://api.bskmt.com https://www.google-analytics.com https://maps.googleapis.com https://res.cloudinary.com https://cloudflareinsights.com https://static.cloudflareinsights.com https://fonts.googleapis.com https://fonts.gstatic.com https://www.facebook.com https://graph.facebook.com https://checkout.bold.co https://payment.bold.co https://payments.api.bold.co https://cdn.segment.com https://cdn.deviceinf.com https://cdn.seonintelligence.com https://www.google.com/recaptcha/ https://www.gstatic.com/recaptcha/;
              media-src 'self' https: data: blob:;
              object-src 'none';
              frame-src 'self' https://www.google.com https://maps.google.com https://www.facebook.com https://web.facebook.com https://evp.sire.gov.co https://app.sab.gov.co/ https://checkout.bold.co https://payment.bold.co https://www.google.com/recaptcha/ https://recaptcha.google.com/recaptcha/;
              base-uri 'self';
              form-action 'self';
              frame-ancestors 'none';
              upgrade-insecure-requests;
              block-all-mixed-content;
            `.replace(/\s+/g, ' ').trim(),
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
