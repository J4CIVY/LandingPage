import React from 'react';

interface StructuredDataProps {
  type: 'organization' | 'event' | 'product' | 'article' | 'localBusiness';
  data: any;
}

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
          "alternateName": "BSK MT",
          "description": "Motoclub apasionado por el motociclismo y la comunidad motera en Bogotá, Colombia",
          "url": "https://bskmt.com",
          "logo": {
            "@type": "ImageObject",
            "url": "https://res.cloudinary.com/dz0peilmu/image/upload/v1700000000/Logo_BSK_Motorcycle_Team_ggdyrl.png",
            "width": 500,
            "height": 500
          },
          "image": "https://res.cloudinary.com/dz0peilmu/image/upload/v1700000000/Banner_Landing_Page_BSK_Motorcycle_Team_Julio_o2fcql.jpg",
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
          "contactPoint": {
            "@type": "ContactPoint",
            "telephone": "+573125192000",
            "contactType": "customer service",
            "availableLanguage": "Spanish"
          },
          "foundingDate": "2022",
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
          ...data
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

  return (
    <script
      type="application/ld+json"
      dangerouslySetInnerHTML={{ __html: JSON.stringify(schema) }}
    />
  );
};

export default StructuredData;
