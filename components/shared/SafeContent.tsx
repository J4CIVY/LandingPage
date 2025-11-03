import { type ReactNode, type ComponentType } from 'react';
import { sanitizeHtml } from '@/lib/input-sanitization';

interface SafeHtmlProps {
  html: string;
  className?: string;
  maxLength?: number;
  allowedTags?: string[];
}

/**
 * Component for safely displaying user-generated HTML content
 * Sanitizes HTML to prevent XSS attacks
 * 
 * @param html - HTML string to display
 * @param className - CSS classes to apply
 * @param maxLength - Maximum length of content (default: 10000)
 * @param allowedTags - Specific HTML tags to allow (not implemented yet, uses sanitizeHtml)
 * 
 * @example
 * ```tsx
 * <SafeHtml 
 *   html={userContent} 
 *   className="prose dark:prose-invert"
 *   maxLength={5000}
 * />
 * ```
 */
export function SafeHtml({ 
  html, 
  className = '', 
  maxLength = 10000 
}: SafeHtmlProps) {
  // Truncate if too long
  const truncated = html.length > maxLength ? html.substring(0, maxLength) + '...' : html;
  
  // Sanitize HTML to prevent XSS
  const sanitized = sanitizeHtml(truncated);
  
  return (
    <div 
      className={className}
      dangerouslySetInnerHTML={{ __html: sanitized }}
    />
  );
}

interface SafeTextProps {
  text: string;
  className?: string;
  maxLength?: number;
  asHtml?: boolean;
}

/**
 * Component for safely displaying user-generated text content
 * Sanitizes text and optionally converts newlines to <br> tags
 * 
 * @param text - Text string to display
 * @param className - CSS classes to apply
 * @param maxLength - Maximum length of content (default: 10000)
 * @param asHtml - Whether to convert newlines to <br> tags (default: false)
 * 
 * @example
 * ```tsx
 * <SafeText 
 *   text={userComment} 
 *   className="text-gray-700"
 *   maxLength={500}
 *   asHtml={true}
 * />
 * ```
 */
export function SafeText({ 
  text, 
  className = '', 
  maxLength = 10000,
  asHtml = false 
}: SafeTextProps) {
  // Truncate if too long
  const truncated = text.length > maxLength ? text.substring(0, maxLength) + '...' : text;
  
  // Sanitize text
  const sanitized = sanitizeHtml(truncated);
  
  if (asHtml) {
    // Convert newlines to <br> tags
    const withBreaks = sanitized.replace(/\n/g, '<br>');
    return (
      <div 
        className={className}
        dangerouslySetInnerHTML={{ __html: withBreaks }}
      />
    );
  }
  
  return (
    <div className={className}>
      {sanitized}
    </div>
  );
}

interface SafeLinkProps {
  href: string;
  children: ReactNode;
  className?: string;
  target?: string;
  rel?: string;
}

/**
 * Component for safely rendering links with sanitized URLs
 * Blocks dangerous protocols like javascript:, data:, etc.
 * 
 * @param href - URL to link to
 * @param children - Link text/content
 * @param className - CSS classes
 * @param target - Link target (default: _blank for external links)
 * @param rel - Link relationship (default: noopener noreferrer for external links)
 * 
 * @example
 * ```tsx
 * <SafeLink 
 *   href={userProvidedUrl} 
 *   className="text-blue-600 hover:underline"
 * >
 *   Click here
 * </SafeLink>
 * ```
 */
export function SafeLink({ 
  href, 
  children, 
  className = '',
  target,
  rel 
}: SafeLinkProps) {
  // Import sanitizeUrl dynamically to avoid circular dependencies
  // eslint-disable-next-line @typescript-eslint/no-require-imports
  const { sanitizeUrl } = require('@/lib/input-sanitization');
  const safeHref = sanitizeUrl(href);
  
  // If URL is blocked by sanitization, don't render the link
  if (!safeHref) {
    return <span className={className}>{children}</span>;
  }
  
  // Auto-detect external links
  const isExternal = safeHref.startsWith('http://') || safeHref.startsWith('https://');
  const finalTarget = target || (isExternal ? '_blank' : undefined);
  const finalRel = rel || (isExternal ? 'noopener noreferrer' : undefined);
  
  return (
    <a 
      href={safeHref} 
      className={className}
      target={finalTarget}
      rel={finalRel}
    >
      {children}
    </a>
  );
}

/**
 * HOC for wrapping components with sanitization
 * Useful for automatically sanitizing all text props
 */
export function withSanitization<P extends Record<string, unknown>>(
  Component: ComponentType<P>,
  propsToSanitize: (keyof P)[]
) {
  return function SanitizedComponent(props: P) {
    const sanitizedProps = { ...props };
    
    propsToSanitize.forEach((prop) => {
      if (typeof sanitizedProps[prop] === 'string') {
        sanitizedProps[prop] = sanitizeHtml(sanitizedProps[prop] as string) as P[typeof prop];
      }
    });
    
    return <Component {...sanitizedProps} />;
  };
}

export default SafeHtml;
