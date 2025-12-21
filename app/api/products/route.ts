import { NextResponse } from 'next/server';
import { getProductsFromDB, createProductInDB } from '@/lib/db/products';
import { Product } from '@/types/product';
import { v4 as uuidv4 } from 'uuid';

export async function GET() {
    try {
        const products = await getProductsFromDB();
        return NextResponse.json(products);
    } catch (error) {
        return NextResponse.json(
            { error: 'Failed to fetch products' },
            { status: 500 }
        );
    }
}

export async function POST(request: Request) {
    try {
        const body = await request.json();

        // Basic validation
        if (!body.name || !body.basePrice) {
            return NextResponse.json(
                { error: 'Name and Base Price are required' },
                { status: 400 }
            );
        }

        const newProduct: Product = {
            id: body.id || uuidv4(),
            slug: body.slug || body.name.toLowerCase().replace(/ /g, '-').replace(/[^\w-]+/g, ''),
            name: body.name,
            description: body.description || '',
            longDescription: body.longDescription || '',
            category: body.category || 'mug',
            basePrice: Number(body.basePrice),
            compareAtPrice: body.compareAtPrice ? Number(body.compareAtPrice) : undefined,
            images: body.images || { thumbnail: '', gallery: [] },
            specifications: body.specifications || {},
            variants: body.variants || [],
            tags: body.tags || [],
            inStock: body.inStock ?? true,
            featured: body.featured ?? false,
            bestseller: body.bestseller ?? false,
            new: body.new ?? true,
            rating: 0,
            reviewCount: 0
        };

        await createProductInDB(newProduct);

        return NextResponse.json(newProduct, { status: 201 });
    } catch (error) {
        console.error('API Error:', error);
        return NextResponse.json(
            { error: 'Failed to create product' },
            { status: 500 }
        );
    }
}
