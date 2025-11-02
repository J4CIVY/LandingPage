'use client';

import React, { useEffect } from 'react';
import Head from 'next/head';

/**
 * JSON-LD structured data type for Schema.org
 */
type StructuredDataObject = {
  '@context': string;
  '@type': string;
  [key: string]: unknown;
};

/**
 * @interface SEOComponentProps
 * @property {string} [title] - The title of the page.
 * @property {string} [description] - The description of the page for SEO.
 * @property {string} [image] - The URL of the image to be used in social media shares.
 * @property {string} [url] - The canonical URL of the page.
 * @property {string} [keywords] - Comma-separated keywords for SEO.
 * @property {string} [type] - The Open Graph type (e.g., 'website', 'article').
 * @property {string} [robots] - The robots meta tag content (e.g., 'index, follow').
 * @property {string} [canonical] - The canonical URL for the page.
 * @property {StructuredDataObject | StructuredDataObject[]} [structuredData] - JSON-LD structured data object or array of objects.
 * @property {React.ReactNode} [children] - React children to be rendered inside Head.
 */
interface SEOComponentProps {
  title?: string;
  description?: string;
  image?: string;
  url?: string;
  keywords?: string;
  type?: string;
  robots?: string;
  canonical?: string;
  structuredData?: StructuredDataObject | StructuredDataObject[];
  children?: React.ReactNode;
}

const SEOComponent: React.FC<SEOComponentProps> = ({ 
  title = "BSK Motorcycle Team - Pasión por el Motociclismo en Colombia", 
  description = "Únete a BSK Motorcycle Team, el motoclub líder en Colombia. Disfruta de rutas épicas, eventos semanales, talleres especializados y una comunidad apasionada por el motociclismo. Comunidad, aventura y respeto sobre dos ruedas.", 
  image = "https://res.cloudinary.com/dz0peilmu/image/upload/f_auto,q_auto:best,w_1200,h_630/Logo_BSK_Motorcycle_Team_ggdyrl.png",
  url = "https://bskmt.com",
  keywords = "motoclub bogotá, motoclub colombia, bskmt, bsk mt, bsk motorcycle team, comunidad motera colombia, rutas en moto bogotá, eventos motociclismo colombia, club de motos colombia, mototurismo, talleres motociclismo, mejor motoclub colombia, viajes en moto",
  type = "website",
  robots = "index, follow, max-image-preview:large, max-snippet:-1, max-video-preview:-1",
  canonical = "https://bskmt.com",
  structuredData,
  children
}) => {
  // Update document title
  useEffect(() => {
    document.title = title;
  }, [title]);

  return (
    <>
      <Head>
        {/* Standard SEO Meta Tags */}
        <title>{title}</title>
        <meta name="description" content={description} />
        <meta name="keywords" content={keywords} />
        <meta name="robots" content={robots} />
        {canonical && <link rel="canonical" href={canonical} />}
        
        {/* Open Graph / Facebook Meta Tags */}
        <meta property="og:title" content={title} />
        <meta property="og:description" content={description} />
        <meta property="og:image" content={image} />
        <meta property="og:url" content={url} />
        <meta property="og:type" content={type} />
        <meta property="og:site_name" content="BSK Motorcycle Team" />
        <meta property="og:locale" content="es_CO" />
        <meta property="og:image:width" content="1200" />
        <meta property="og:image:height" content="630" />
        <meta property="og:image:alt" content={title} />

        {/* Twitter Meta Tags */}
        <meta name="twitter:card" content="summary_large_image" />
        <meta name="twitter:title" content={title} />
        <meta name="twitter:description" content={description} />
        <meta name="twitter:image" content={image} />
        <meta name="twitter:site" content="@bskmotorcycleteam" />
        <meta name="twitter:creator" content="@bskmotorcycleteam" />

        {/* Additional SEO Meta Tags */}
        <meta name="author" content="BSK Motorcycle Team" />
        <meta name="language" content="Spanish" />
        <meta name="revisit-after" content="7 days" />
        <meta name="distribution" content="Global" />
        <meta name="rating" content="General" />
        
        {children}
      </Head>
      
      {/* Structured Data - Rendered in body */}
      {structuredData && (
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(structuredData) }}
        />
      )}
    </>
  );
};

export default SEOComponent;
