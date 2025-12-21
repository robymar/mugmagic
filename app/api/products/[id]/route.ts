import { NextResponse } from 'next/server';
import { updateProductInDB, deleteProductInDB } from '@/lib/db/products';

export async function PUT(
    request: Request,
    { params }: { params: Promise<{ id: string }> }
) {
    try {
        const { id } = await params;
        const body = await request.json();

        await updateProductInDB(id, body);

        return NextResponse.json({ message: 'Product updated successfully' });
    } catch (error) {
        console.error('API Error:', error);
        return NextResponse.json(
            { error: 'Failed to update product' },
            { status: 500 }
        );
    }
}

export async function DELETE(
    request: Request,
    { params }: { params: Promise<{ id: string }> }
) {
    try {
        const { id } = await params;
        await deleteProductInDB(id);

        return NextResponse.json({ message: 'Product deleted successfully' });
    } catch (error) {
        console.error('API Error:', error);
        return NextResponse.json(
            { error: 'Failed to delete product' },
            { status: 500 }
        );
    }
}
