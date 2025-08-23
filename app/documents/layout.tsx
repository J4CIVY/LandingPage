import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: "Documentos Institucionales - Estatutos y Normativas",
  description: "Accede a los documentos oficiales de BSK Motorcycle Team: estatutos constitutivos, reglamentos internos, códigos de ética y normativas del club.",
  keywords: ["estatutos BSK", "documentos institucionales", "reglamento motoclub", "código ética BSK", "normativas BSK Motorcycle Team"],
  openGraph: {
    title: "Documentos Institucionales - BSK Motorcycle Team",
    description: "Accede a los documentos oficiales de BSK Motorcycle Team: estatutos constitutivos, reglamentos internos, códigos de ética y normativas.",
    url: "https://bskmt.com/documents",
    images: [
      {
        url: "https://res.cloudinary.com/dz0peilmu/image/upload/v1700000000/BSK_Documents_Hero.jpg",
        width: 1200,
        height: 630,
        alt: "Documentos institucionales BSK Motorcycle Team",
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: "Documentos Institucionales - BSK Motorcycle Team",
    description: "Accede a los documentos oficiales de BSK Motorcycle Team: estatutos constitutivos, reglamentos internos, códigos de ética.",
  },
  alternates: {
    canonical: "https://bskmt.com/documents",
  },
};

export default function DocumentsLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return children;
}
