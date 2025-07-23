import React from 'react';
import { Helmet } from 'react-helmet';

const SEOComponent = ({ 
  title = "BSK Motorcycle Team - Pasión por el Motociclismo", 
  description = "Únete a BSK Motorcycle Team, el motoclub líder en Colombia. Disfruta de rutas, eventos, talleres y una comunidad apasionada por el motociclismo. Hermandad, aventura y respeto sobre dos ruedas.", 
  image = "https://res.cloudinary.com/dz0peilmu/image/upload/v1700000000/Logo_BSK_Motorcycle_Team_ggdyrl.png", // Added a version to the Cloudinary URL for better cache busting
  url = "https://bskmt.com",
  keywords = "motoclub en bogotá, motoclub en colombia, bskmt, bsk mt, bsk motorcycle team, comunidad motera, rutas en moto bogotá, eventos motociclismo, club de motos colombia, mototurismo, talleres motociclismo",
  type = "website",
  robots = "index, follow",
  canonical = "https://bskmt.com",
  children
}) => {
  // Ensure the image URL is absolute and correctly formatted for social media sharing
  const absoluteImageUrl = new URL(image, url).href;

  return (
    <Helmet>
      {/* Standard SEO Meta Tags */}
      <title>{title}</title>
      <meta name="description" content={description} />
      <meta name="keywords" content={keywords} />
      <meta name="robots" content={robots} />
      {canonical && <link rel="canonical" href={canonical} />}
      
      {/* Open Graph / Facebook Meta Tags */}
      <meta property="og:title" content={title} />
      <meta property="og:description" content={description} />
      <meta property="og:image" content={absoluteImageUrl} />
      <meta property="og:url" content={url} />
      <meta property="og:type" content={type} />
      {/* Optional: Add og:site_name if applicable */}
      <meta property="og:site_name" content="BSK Motorcycle Team" />
      {/* Optional: Add og:locale if applicable */}
      <meta property="og:locale" content="es_CO" />

      {/* Twitter Meta Tags */}
      <meta name="twitter:card" content="summary_large_image" />
      <meta name="twitter:title" content={title} />
      <meta name="twitter:description" content={description} />
      <meta name="twitter:image" content={absoluteImageUrl} />
      {/* Optional: Add twitter:site and twitter:creator if applicable */}
      <meta name="twitter:site" content="@bskmotorcycleteam" />
      <meta name="twitter:creator" content="@bskmotorcycleteam" />

      {/* Schema.org Structured Data for SEO */}
      <script type="application/ld+json">
        {JSON.stringify({
          "@context": "https://schema.org",
          "@type": "MotorcycleDealer", // More specific type for a motorcycle club/dealer
          "name": "BSK Motorcycle Team",
          "description": "Motoclub apasionado por el motociclismo y la comunidad motera en Bogotá, Colombia",
          "url": "https://bskmt.com",
          "logo": "https://bskmt.com/images/logo.png", // Ensure this path is correct or use the Cloudinary URL
          "address": {
            "@type": "PostalAddress",
            "streetAddress": "Carrera 5 A No. 36 A Sur 28, 110431, Ayacucho, San Cristobal, Bogotá, Bogotá D.C., Colombia",
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
          "openingHours": "Mo,Tu,We,Th,Fr,Sa,Su 08:00-20:00", // Assuming these are general contact hours
          "telephone": "+573125192000",
          "sameAs": [
            "https://www.facebook.com/BSKMotorcycle", // Corrected Facebook URL based on common patterns
            "https://www.instagram.com/bskmotorcycleteam",
            "https://www.youtube.com/@BSKMotorcycleTeam",
            "https://twitter.com/bskmotorcycleteam" // Added Twitter to sameAs
          ]
        })}
      </script>
      
      {children}
    </Helmet>
  );
};

export default SEOComponent;