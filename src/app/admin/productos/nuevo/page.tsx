import ProductForm from '@/components/admin/ProductForm';

export default function AdminNewProductPage() {
  return (
    <div id="admin-new-product-page">
      <ProductForm isEditing={false} />
    </div>
  );
}
