import { getProductById } from '@/lib/data';
import ProductForm from '@/components/admin/ProductForm';
import { notFound } from 'next/navigation';

export default async function AdminEditProductPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const product = await getProductById(id);

  if (!product) {
    notFound();
  }

  return (
    <div id="admin-edit-product-page">
      <ProductForm initialProduct={product} isEditing={true} />
    </div>
  );
}
