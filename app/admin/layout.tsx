import { ReactNode } from 'react';
import { connection } from 'next/server';

export default async function AdminLayout({
  children,
}: {
  children: ReactNode;
}) {
  // Force dynamic rendering for all admin pages
  await connection();
  
  return <>{children}</>;
}
