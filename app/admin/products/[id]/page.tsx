import { getProductsFromDB } from '@/lib/db/products';
import ProductForm from '../ProductForm';
import { notFound } from 'next/navigation';

export default async function EditProductPage({ params }: { params: Promise<{ id: string }> }) {
    const { id } = await params;

    // getProductsFromDB returns { products: [...], total: number }
    const { products } = await getProductsFromDB();
    const product = products.find(p => p.id === id);

    if (!product) {
        notFound();
    }

    return <ProductForm initialData={product} isEdit={true} />;
}
