import { getProductById } from '@/lib/db/products'; // Note: You might need to add getProductById to lib/db/products.ts or use getProductBySlug if ID routing is preferred
// Actually better to fetch client side inside a wrapper or make this page async server component
// Let's use async server component

import { getProductsFromDB } from '@/lib/db/products';
import ProductForm from '../ProductForm';

export default async function EditProductPage({ params }: { params: Promise<{ id: string }> }) {
    const { id } = await params;
    // We need getProductById, let's assume we can filter from all products for now or add the helper
    // Adding helper is better practice, but for speed let's fetch all and find (optimizable later)
    // Or better, let's query DB direct via our existing helpers if possible?
    // We only have getProductBySlugFromDB. Let's add getProductByIdFromDB quickly or just use a direct query here if needed, 
    // but better to add the helper. 

    // For now, let's add `getProductByIdFromDB` to lib/db/products.ts in next step.
    // I will write this file assuming the helper exists.

    const allProducts = await getProductsFromDB();
    const product = allProducts.find(p => p.id === id);

    if (!product) {
        return <div>Product not found</div>;
    }

    return <ProductForm initialData={product} isEdit={true} />;
}
