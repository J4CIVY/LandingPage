import React from "react";
import SEO from "././././components/shared/Seo";

const SEOComponent = () => (
  <SEO
    title="BSK Motorcycle Team - Comunidad Motera en Bogotá | Pasión por el Motociclismo"
    description="Únete al BSK Motorcycle Team, el motoclub líder en Bogotá. Disfruta de rutas, eventos, talleres y una comunidad apasionada por el motociclismo. Hermandad, aventura y respeto sobre dos ruedas."
    keywords="motoclub bogotá, bsk motorcycle team, comunidad motera, rutas en moto bogotá, eventos motociclismo, club de motos colombia, mototurismo, talleres motociclismo"
    image="https://bskmt.com/images/og-home.jpg"
    url="https://bskmt.com"
    type="website"
    canonical="https://bskmt.com"
  >
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
          "https://www.facebook.com/BSKMotorcycleTeam",
          "https://www.instagram.com/BSKMotorcycleTeam",
          "https://www.youtube.com/BSKMotorcycleTeam"
        ]
      })}
    </script>
  </SEO>
);

export default SEOComponent;