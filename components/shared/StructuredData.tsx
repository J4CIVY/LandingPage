import React from 'react';

interface StructuredDataProps {
  type: 'organization' | 'event' | 'product' | 'article' | 'localBusiness' | 'website' | 'motorcycleClub';
  data: any;
}

/**
 * Sanitize data to prevent XSS in JSON-LD
 * JSON.stringify automatically escapes dangerous characters, but we add extra validation
 * Applies replacements repeatedly to prevent nested tag bypass attacks
 */
const sanitizeForJsonLd = (obj: any): any => {
  if (typeof obj === 'string') {
    // Remove any potential script tags or dangerous content
    let sanitized = obj;
    let previous: string;
    let iterations = 0;
    const MAX_ITERATIONS = 10;
    
    // Apply replacements repeatedly until no more changes
    do {
      previous = sanitized;
      sanitized = sanitized
        .replace(/<script[\s\S]*?<\/script[^>]*>/gi, '') // Remove script blocks
        .replace(/<script[^>]*>/gi, '') // Remove opening script tags
        .replace(/<\/script[^>]*>/gi, '') // Remove closing script tags
        .replace(/<iframe[\s\S]*?<\/iframe[^>]*>/gi, '') // Remove iframe blocks
        .replace(/<iframe[^>]*>/gi, '') // Remove opening iframe tags
        .replace(/<\/iframe[^>]*>/gi, '') // Remove closing iframe tags
        .replace(/javascript\s*:/gi, '') // Remove javascript: protocol
        .replace(/on\w+\s*=/gi, ''); // Remove event handlers
      iterations++;
    } while (sanitized !== previous && iterations < MAX_ITERATIONS);
    
    return sanitized.substring(0, 5000); // Limit string length
  }
  if (Array.isArray(obj)) {
    return obj.map(sanitizeForJsonLd);
  }
  if (obj && typeof obj === 'object') {
    const sanitized: any = {};
    for (const [key, value] of Object.entries(obj)) {
      sanitized[key] = sanitizeForJsonLd(value);
    }
    return sanitized;
  }
  return obj;
};

const StructuredData: React.FC<StructuredDataProps> = ({ type, data }) => {
  const generateSchema = () => {
    const baseContext = "https://schema.org";
    
    switch (type) {
      case 'organization':
        return {
          "@context": baseContext,
          "@type": "Organization",
          "@id": "https://bskmt.com/#organization",
          "name": "BSK Motorcycle Team",
          "alternateName": ["BSK MT", "BSKMT"],
          "description": "Motoclub líder en Colombia, apasionado por el motociclismo y la comunidad motera en Bogotá. Unidos por la pasión, el espíritu aventurero y el respeto mutuo.",
          "url": "https://bskmt.com",
          "logo": {
            "@type": "ImageObject",
            "url": "https://res.cloudinary.com/dz0peilmu/image/upload/v1700000000/Logo_BSK_Motorcycle_Team_ggdyrl.png",
            "width": 500,
            "height": 500,
            "caption": "Logo oficial de BSK Motorcycle Team"
          },
          "image": [
            "https://res.cloudinary.com/dz0peilmu/image/upload/v1700000000/Banner_Landing_Page_BSK_Motorcycle_Team_Julio_o2fcql.jpg",
            "https://res.cloudinary.com/dz0peilmu/image/upload/v1700000000/Logo_BSK_Motorcycle_Team_ggdyrl.png"
          ],
          "address": {
            "@type": "PostalAddress",
            "streetAddress": "Carrera 5 A No. 36 A Sur 28",
            "addressLocality": "Bogotá",
            "addressRegion": "Bogotá D.C.",
            "postalCode": "110431",
            "addressCountry": "CO"
          },
          "geo": {
            "@type": "GeoCoordinates",
            "latitude": "4.562477",
            "longitude": "-74.101509"
          },
          "contactPoint": [{
            "@type": "ContactPoint",
            "telephone": "+573125192000",
            "contactType": "customer service",
            "availableLanguage": ["Spanish", "es"],
            "areaServed": "CO"
          }],
          "foundingDate": "2022",
          "keywords": "motoclub, motociclismo, comunidad motera, Bogotá, Colombia, rutas en moto, eventos motociclismo",
          "knowsAbout": ["Motociclismo", "Seguridad Vial", "Turismo en Moto", "Mantenimiento de Motocicletas"],
          "memberOf": {
            "@type": "Organization",
            "name": "Comunidad Motera Colombiana"
          },
          "sameAs": [
            "https://www.facebook.com/BSKMotorcycle",
            "https://www.instagram.com/bskmotorcycleteam",
            "https://www.youtube.com/@BSKMotorcycleTeam",
            "https://twitter.com/bskmotorcycleteam"
          ],
          "hasOfferCatalog": {
            "@type": "OfferCatalog",
            "name": "Servicios BSK Motorcycle Team",
            "itemListElement": [
              {
                "@type": "Offer",
                "itemOffered": {
                  "@type": "Service",
                  "name": "Membresías del Motoclub",
                  "description": "Membresías exclusivas para ser parte de la comunidad BSK MT"
                }
              },
              {
                "@type": "Offer", 
                "itemOffered": {
                  "@type": "Service",
                  "name": "Eventos y Rutas",
                  "description": "Eventos motociclísticos y rutas organizadas por Colombia"
                }
              }
            ]
          },
          ...data
        };

      case 'motorcycleClub':
        return {
          "@context": baseContext,
          "@type": ["Organization", "SportsOrganization"],
          "@id": "https://bskmt.com/#motorcycleclub",
          "name": "BSK Motorcycle Team",
          "alternateName": "BSK MT",
          "description": "Motoclub líder en Colombia dedicado a promover la cultura motociclística, la seguridad vial y la hermandad entre moteros",
          "url": "https://bskmt.com",
          "sport": "Motociclismo",
          "logo": {
            "@type": "ImageObject",
            "url": "https://res.cloudinary.com/dz0peilmu/image/upload/v1700000000/Logo_BSK_Motorcycle_Team_ggdyrl.png"
          },
          "location": {
            "@type": "Place",
            "name": "Bogotá, Colombia",
            "address": {
              "@type": "PostalAddress",
              "addressLocality": "Bogotá",
              "addressCountry": "CO"
            }
          },
          "foundingDate": "2022",
          "memberOf": {
            "@type": "Organization",
            "name": "Federación Motociclística Colombiana"
          }
        };

      case 'website':
        return {
          "@context": baseContext,
          "@type": "WebSite",
          "@id": "https://bskmt.com/#website",
          "name": "BSK Motorcycle Team",
          "alternateName": "BSK MT Website",
          "description": "Sitio web oficial de BSK Motorcycle Team - Motoclub líder en Colombia",
          "url": "https://bskmt.com",
          "inLanguage": "es-CO",
          "isPartOf": {
            "@type": "Organization",
            "@id": "https://bskmt.com/#organization"
          },
          "about": {
            "@type": "Organization",
            "@id": "https://bskmt.com/#organization"
          },
          "publisher": {
            "@type": "Organization",
            "@id": "https://bskmt.com/#organization"
          },
          "potentialAction": [
            {
              "@type": "SearchAction",
              "target": "https://bskmt.com/search?q={search_term_string}",
              "query-input": "required name=search_term_string"
            }
          ]
        };

      case 'event':
        return {
          "@context": baseContext,
          "@type": "Event",
          "name": data.name,
          "description": data.description,
          "startDate": data.startDate,
          "endDate": data.endDate,
          "eventStatus": "https://schema.org/EventScheduled",
          "eventAttendanceMode": "https://schema.org/OfflineEventAttendanceMode",
          "location": {
            "@type": "Place",
            "name": data.location?.name || "Colombia",
            "address": {
              "@type": "PostalAddress",
              "addressLocality": data.location?.city || "Bogotá",
              "addressCountry": "CO"
            }
          },
          "organizer": {
            "@type": "Organization",
            "@id": "https://bskmt.com/#organization"
          },
          "image": data.image || "https://res.cloudinary.com/dz0peilmu/image/upload/v1700000000/BSK_Events_Hero.jpg",
          "offers": {
            "@type": "Offer",
            "price": data.price || "0",
            "priceCurrency": "COP",
            "availability": "https://schema.org/InStock"
          }
        };

      case 'product':
        return {
          "@context": baseContext,
          "@type": "Product",
          "name": data.name,
          "description": data.description,
          "image": data.image,
          "brand": {
            "@type": "Brand",
            "name": "BSK Motorcycle Team"
          },
          "offers": {
            "@type": "Offer",
            "price": data.price,
            "priceCurrency": "COP",
            "availability": "https://schema.org/InStock",
            "seller": {
              "@type": "Organization",
              "@id": "https://bskmt.com/#organization"
            }
          }
        };

      case 'article':
        return {
          "@context": baseContext,
          "@type": "Article",
          "headline": data.title,
          "description": data.description,
          "image": data.image,
          "datePublished": data.datePublished,
          "dateModified": data.dateModified || data.datePublished,
          "author": {
            "@type": "Organization",
            "@id": "https://bskmt.com/#organization"
          },
          "publisher": {
            "@type": "Organization",
            "@id": "https://bskmt.com/#organization"
          }
        };

      case 'localBusiness':
        return {
          "@context": baseContext,
          "@type": "LocalBusiness",
          "@id": "https://bskmt.com/#business",
          "name": "BSK Motorcycle Team",
          "description": "Motoclub y comunidad de motociclistas en Bogotá, Colombia",
          "url": "https://bskmt.com",
          "telephone": "+573125192000",
          "address": {
            "@type": "PostalAddress",
            "streetAddress": "Carrera 5 A No. 36 A Sur 28",
            "addressLocality": "Bogotá",
            "addressRegion": "Bogotá D.C.",
            "postalCode": "110431",
            "addressCountry": "CO"
          },
          "geo": {
            "@type": "GeoCoordinates",
            "latitude": "4.562477",
            "longitude": "-74.101509"
          },
          "openingHours": "Mo,Tu,We,Th,Fr,Sa,Su 08:00-20:00",
          "priceRange": "$$"
        };

      default:
        return {};
    }
  };

  const schema = generateSchema();
  
  // SECURITY FIX: Sanitize schema before rendering
  const sanitizedSchema = sanitizeForJsonLd(schema);

  return (
    <script
      type="application/ld+json"
      dangerouslySetInnerHTML={{ __html: JSON.stringify(sanitizedSchema) }}
    />
  );
};

export default StructuredData;
