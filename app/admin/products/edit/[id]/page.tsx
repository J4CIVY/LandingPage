'use client';

import { useParams } from 'next/navigation';
import ProductFormPage from '../../[id]/page';

export default function EditProductPage() {
  const params = useParams();
  const productId = params?.id as string;

  // Reutilizamos el componente ProductFormPage que ya maneja tanto creación como edición
  return <ProductFormPage />;
}
