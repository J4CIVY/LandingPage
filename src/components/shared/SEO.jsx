import React from 'react';
import { Helmet } from 'react-helmet';

const SEO = ({ 
  title = "BSK Motorcycle Team - Pasión por el Motociclismo", 
  description = "Únete a BSK Motorcycle Team, el motoclub moderno que vive la pasión por el motociclismo. Descubre eventos, rutas y una comunidad única.", 
  image = "https://www.bskmt.com/Logo_Letras_Motoclub_BSK_Motorcycle_Team_Blue_192X192.png",
  url = "https://www.bskmt.com",
  keywords = "motoclub, motociclismo, rutas en moto, eventos moto, comunidad motera, BSK Motorcycle Team",
  type = "website",
  robots = "index, follow",
  canonical = ""
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
          "@type": "Organization",
          "name": "BSK Motorcycle Team",
          "url": "https://www.bskmt.com",
          "logo": "https://www.bskmt.com/Logo_Letras_Motoclub_BSK_Motorcycle_Team_Blue_192X192.png",
          "description": "Motoclub apasionado por el motociclismo y la comunidad motera",
          "sameAs": [
            "https://www.facebook.com/BSKMotorcycleTeam",
            "https://www.instagram.com/BSKMotorcycleTeam",
            "https://www.youtube.com/BSKMotorcycleTeam"
          ]
        })}
      </script>
    </Helmet>
  );
};

export default SEO;