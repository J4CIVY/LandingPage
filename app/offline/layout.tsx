import { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Sin conexión | BSK Motorcycle Team',
  description: 'Parece que no tienes conexión a Internet',
  robots: 'noindex',
};

export default function OfflineLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return children;
}
