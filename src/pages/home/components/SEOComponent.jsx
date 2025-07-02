import React from 'react';
import { Helmet } from 'react-helmet';

const SEOComponent = ({ 
  title = "BSK Motorcycle Team - Pasión por el Motociclismo", 
  description = "Únete a BSK Motorcycle Team, el motoclub líder en Colombia. Disfruta de rutas, eventos, talleres y una comunidad apasionada por el motociclismo. Hermandad, aventura y respeto sobre dos ruedas.", 
  image = "https://bskmt.com/images/og-home.jpg",
  url = "https://bskmt.com",
  keywords = "motoclub en bogotá, motoclub en colombia, bskmt, bsk mt, bsk motorcycle team, comunidad motera, rutas en moto bogotá, eventos motociclismo, club de motos colombia, mototurismo, talleres motociclismo",
  type = "website",
  robots = "index, follow",
  canonical = "https://bskmt.com",
  children
}) => {
  return (
    <Helmet>
      <title>{title}</title>
      <meta name="description" content={description} />
      <meta name="keywords" content={keywords} />
      <meta name="robots" content={robots} />
      <meta property="og:title" content={title} />
      <meta property="og:description" content={description} />
      <meta property="og:image" content={image} />
      <meta property="og:url" content={url} />
      <meta property="og:type" content={type} />
      <meta name="twitter:card" content="summary_large_image" />
      <meta name="twitter:title" content={title} />
      <meta name="twitter:description" content={description} />
      <meta name="twitter:image" content={image} />
      {canonical && <link rel="canonical" href={canonical} />}
      
      {/* Schema.org para motoclub */}
      <script type="application/ld+json">
        {JSON.stringify({
          "@context": "https://schema.org",
          "@type": "MotorcycleDealer",
          "name": "BSK Motorcycle Team",
          "description": "Motoclub apasionado por el motociclismo y la comunidad motera en Bogotá, Colombia",
          "url": "https://bskmt.com",
          "logo": "https://bskmt.com/images/logo.png",
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
          "openingHours": "Mo,Tu,We,Th,Fr,Sa,Su 08:00-20:00",
          "telephone": "+573125192000",
          "sameAs": [
            "https://www.facebook.com/BSKMotorcycle",
            "https://www.instagram.com/bskmotorcycleteam",
            "https://www.youtube.com/@BSKMotorcycleTeam"
          ]
        })}
      </script>
      
      {children}
    </Helmet>
  );
};

export default SEOComponent;