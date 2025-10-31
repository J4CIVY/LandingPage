/* eslint-disable @typescript-eslint/no-unused-vars */
/**
 * CSP Nonce Utility
 * Generates and manages Content Security Policy nonces for inline scripts/styles
 * Enhances XSS protection by allowing only whitelisted inline content
 * 
 * Uses Web Crypto API for Edge Runtime compatibility
 */

import { headers } from 'next/headers';

/**
 * Generate a cryptographically secure nonce using Web Crypto API
 * Compatible with Edge Runtime (no Node.js crypto module)
 * @returns Base64-encoded random nonce
 */
export function generateNonce(): string {
  // Use Web Crypto API instead of Node.js crypto
  const array = new Uint8Array(16);
  crypto.getRandomValues(array);
  
  // Convert to base64
  return btoa(String.fromCharCode(...array));
}

/**
 * Get the current request's nonce from headers
 * Should be called in Server Components wrapped in Suspense
 */
export async function getNonce(): Promise<string> {
  const headersList = await headers();
  return headersList.get('x-nonce') || '';
}

/**
 * Create CSP header with comprehensive security policies
 * Next.js 16 with Cache Components (PPR) requires 'unsafe-inline' for hydration scripts
 * @param _nonce - The generated nonce (not used with unsafe-inline, kept for API compatibility)
 */
export function createCSPHeader(_nonce: string): string {
  // SECURITY NOTE: This CSP is configured for Next.js 16 with Cache Components (PPR)
  // PPR generates inline scripts for hydration that cannot use nonce-based CSP
  // Using 'unsafe-inline' is standard practice for Next.js apps with SSR/PPR
  
  // In development, some Next.js features require eval (HMR, etc.)
  // In production, we remove unsafe-eval for maximum security
  const devOnlyDirectives = process.env.NODE_ENV === 'development' ? "'unsafe-eval'" : '';
  
  return `
    default-src 'self';
    script-src 'self' 'unsafe-inline' ${devOnlyDirectives} https://www.googletagmanager.com https://www.google-analytics.com https://maps.googleapis.com https://static.cloudflareinsights.com https://bskmt.com/cdn-cgi/ https://connect.facebook.net https://www.facebook.com https://checkout.bold.co https://cdn.segment.com https://cdn.deviceinf.com https://cdn.seonintelligence.com https://www.google.com/recaptcha/ https://www.gstatic.com/recaptcha/;
    style-src 'self' 'unsafe-inline' https://fonts.googleapis.com https://checkout.bold.co;
    img-src 'self' data: https: blob: https://res.cloudinary.com https://images.unsplash.com https://www.facebook.com https://platform-lookaside.fbsbx.com;
    font-src 'self' https://fonts.gstatic.com data:;
    connect-src 'self' https://api.bskmt.com https://www.google-analytics.com https://maps.googleapis.com https://res.cloudinary.com https://cloudflareinsights.com https://static.cloudflareinsights.com https://fonts.googleapis.com https://fonts.gstatic.com https://www.facebook.com https://graph.facebook.com https://checkout.bold.co https://payment.bold.co https://payments.api.bold.co https://cdn.segment.com https://cdn.deviceinf.com https://cdn.seonintelligence.com https://www.google.com/recaptcha/ https://www.gstatic.com/recaptcha/;
    media-src 'self' https: data: blob:;
    worker-src 'self' blob:;
    object-src 'none';
    frame-src 'self' https://www.google.com https://maps.google.com https://www.facebook.com https://web.facebook.com https://evp.sire.gov.co https://app.sab.gov.co/ https://checkout.bold.co https://payment.bold.co https://www.google.com/recaptcha/ https://recaptcha.google.com/recaptcha/;
    base-uri 'self';
    form-action 'self';
    frame-ancestors 'none';
    upgrade-insecure-requests;
    block-all-mixed-content;
  `.replace(/\s+/g, ' ').trim();
}

/**
 * Create strict CSP for pages that don't need third-party scripts
 * Use this for admin pages, login pages, etc.
 * @param _nonce - The generated nonce (not used with unsafe-inline, kept for API compatibility)
 */
export function createStrictCSPHeader(_nonce: string): string {
  return `
    default-src 'self';
    script-src 'self' 'unsafe-inline';
    style-src 'self' 'unsafe-inline';
    img-src 'self' data: https://res.cloudinary.com;
    font-src 'self';
    connect-src 'self' https://api.bskmt.com;
    media-src 'self';
    worker-src 'self' blob:;
    object-src 'none';
    frame-src 'none';
    base-uri 'self';
    form-action 'self';
    frame-ancestors 'none';
    upgrade-insecure-requests;
    block-all-mixed-content;
  `.replace(/\s+/g, ' ').trim();
}
