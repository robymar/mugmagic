'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Product } from '@/types/product';
import { ChevronLeft, Save, Plus } from 'lucide-react';
import ImageUpload from '@/components/admin/ImageUpload';
import Link from 'next/link';

interface ProductFormProps {
    initialData?: Product;
    isEdit?: boolean;
}

export default function ProductForm({ initialData, isEdit = false }: ProductFormProps) {
    const router = useRouter();
    const [loading, setLoading] = useState(false);
    const [formData, setFormData] = useState<Partial<Product>>(initialData || {
        name: '',
        slug: '',
        description: '',
        longDescription: '',
        category: 'mug',
        basePrice: 0,
        compareAtPrice: 0,
        inStock: true,
        featured: false,
        bestseller: false,
        new: true,
        images: { thumbnail: '', gallery: [] },
        specifications: {
            capacity: '',
            material: '',
            dishwasherSafe: true,
            microwaveSafe: true,
            dimensions: { width: 0, height: 0, diameter: 0 },
            printableArea: { width: 0, height: 0 }
        }
    });

    const [galleryInput, setGalleryInput] = useState('');

    const handleSubmit = async (e: React.FormEvent) => {
        // ... (keep existing handleSubmit)
        e.preventDefault();
        setLoading(true);

        try {
            const url = isEdit ? `/api/products/${initialData?.id}` : '/api/products';
            const method = isEdit ? 'PUT' : 'POST';

            const res = await fetch(url, {
                method,
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(formData),
            });

            if (res.ok) {
                router.push('/admin/products');
                router.refresh();
            } else {
                alert('Failed to save product');
            }
        } catch (error) {
            console.error('Error saving product:', error);
            alert('Error saving product');
        } finally {
            setLoading(false);
        }
    };

    const addGalleryImage = (url: string) => {
        setFormData(prev => ({
            ...prev,
            images: {
                ...prev.images!,
                gallery: [...(prev.images?.gallery || []), url]
            }
        }));
    };

    const removeGalleryImage = (index: number) => {
        setFormData(prev => ({
            ...prev,
            images: {
                ...prev.images!,
                gallery: prev.images?.gallery.filter((_, i) => i !== index) || []
            }
        }));
    };

    return (
        <form onSubmit={handleSubmit} className="space-y-8 max-w-5xl mx-auto">
            {/* ... other parts ... */}
            {/* Header */}
            <div className="flex items-center justify-between">
                <div className="flex items-center gap-4">
                    <Link href="/admin/products" className="p-2 hover:bg-gray-100 rounded-lg transition-colors">
                        <ChevronLeft size={24} className="text-gray-500" />
                    </Link>
                    <div>
                        <h1 className="text-3xl font-black text-gray-900">
                            {isEdit ? 'Edit Product' : 'New Product'}
                        </h1>
                        <p className="text-gray-500 mt-1">
                            {isEdit ? `Editing ${initialData?.name}` : 'Create a new product'}
                        </p>
                    </div>
                </div>
                <div className="flex gap-3">
                    <Link href="/admin/products">
                        <button type="button" className="px-6 py-3 bg-white border border-gray-200 text-gray-700 font-semibold rounded-xl hover:bg-gray-50 transition-colors">
                            Cancel
                        </button>
                    </Link>
                    <button
                        type="submit"
                        disabled={loading}
                        className="px-6 py-3 bg-blue-600 text-white font-bold rounded-xl hover:bg-blue-700 transition-colors flex items-center gap-2 shadow-lg shadow-blue-600/20 disabled:opacity-50"
                    >
                        <Save size={20} />
                        {loading ? 'Saving...' : 'Save Product'}
                    </button>
                </div>
            </div>

            <div className="grid grid-cols-3 gap-8">
                {/* Main Info */}
                <div className="col-span-2 space-y-8">
                    {/* Basic Details */}
                    <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100 space-y-6">
                        <h3 className="text-lg font-bold text-gray-900">Basic Information</h3>

                        <div className="grid grid-cols-2 gap-6">
                            <div className="col-span-2">
                                <label className="block text-sm font-semibold text-gray-700 mb-2">Product Name</label>
                                <input
                                    type="text"
                                    required
                                    className="w-full px-4 py-2 rounded-lg border border-gray-200 focus:outline-none focus:ring-2 focus:ring-blue-500"
                                    value={formData.name}
                                    onChange={e => setFormData({ ...formData, name: e.target.value })}
                                />
                            </div>

                            <div>
                                <label className="block text-sm font-semibold text-gray-700 mb-2">Slug (URL)</label>
                                <input
                                    type="text"
                                    className="w-full px-4 py-2 rounded-lg border border-gray-200 focus:outline-none focus:ring-2 focus:ring-blue-500 bg-gray-50"
                                    placeholder="auto-generated"
                                    value={formData.slug}
                                    onChange={e => setFormData({ ...formData, slug: e.target.value })}
                                />
                            </div>

                            <div>
                                <label className="block text-sm font-semibold text-gray-700 mb-2">Category</label>
                                <select
                                    className="w-full px-4 py-2 rounded-lg border border-gray-200 focus:outline-none focus:ring-2 focus:ring-blue-500"
                                    value={formData.category}
                                    onChange={e => setFormData({ ...formData, category: e.target.value as any })}
                                >
                                    <option value="mug">Mug</option>
                                    <option value="bottle">Bottle</option>
                                    <option value="plate">Plate</option>
                                    <option value="accessories">Accessories</option>
                                </select>
                            </div>

                            <div className="col-span-2">
                                <label className="block text-sm font-semibold text-gray-700 mb-2">Description</label>
                                <textarea
                                    rows={3}
                                    className="w-full px-4 py-2 rounded-lg border border-gray-200 focus:outline-none focus:ring-2 focus:ring-blue-500"
                                    value={formData.description}
                                    onChange={e => setFormData({ ...formData, description: e.target.value })}
                                />
                            </div>
                        </div>
                    </div>

                    {/* Pricing */}
                    <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100 space-y-6">
                        <h3 className="text-lg font-bold text-gray-900">Pricing</h3>
                        <div className="grid grid-cols-2 gap-6">
                            <div>
                                <label className="block text-sm font-semibold text-gray-700 mb-2">Base Price (€)</label>
                                <input
                                    type="number"
                                    step="0.01"
                                    required
                                    className="w-full px-4 py-2 rounded-lg border border-gray-200 focus:outline-none focus:ring-2 focus:ring-blue-500"
                                    value={formData.basePrice}
                                    onChange={e => setFormData({
                                        ...formData,
                                        basePrice: e.target.value ? parseFloat(e.target.value) : 0
                                    })}
                                />
                            </div>
                            <div>
                                <label className="block text-sm font-semibold text-gray-700 mb-2">Compare Price (€)</label>
                                <input
                                    type="number"
                                    step="0.01"
                                    className="w-full px-4 py-2 rounded-lg border border-gray-200 focus:outline-none focus:ring-2 focus:ring-blue-500"
                                    value={formData.compareAtPrice}
                                    onChange={e => setFormData({
                                        ...formData,
                                        compareAtPrice: e.target.value ? parseFloat(e.target.value) : 0
                                    })}
                                />
                            </div>
                        </div>
                    </div>

                    {/* Images */}
                    <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100 space-y-6">
                        <h3 className="text-lg font-bold text-gray-900">Images</h3>

                        <div>
                            <label className="block text-sm font-semibold text-gray-700 mb-2">Thumbnail</label>
                            <ImageUpload
                                value={formData.images?.thumbnail}
                                onUpload={(url) => setFormData({
                                    ...formData,
                                    images: { ...formData.images!, thumbnail: url }
                                })}
                                onRemove={() => setFormData({
                                    ...formData,
                                    images: { ...formData.images!, thumbnail: '' }
                                })}
                            />
                        </div>

                        <div>
                            <label className="block text-sm font-semibold text-gray-700 mb-2">
                                Gallery Images (Max 4)
                            </label>
                            <div className="grid grid-cols-4 gap-4">
                                {formData.images?.gallery.map((url, index) => (
                                    <ImageUpload
                                        key={index}
                                        value={url}
                                        onUpload={() => { }} // Already uploaded
                                        onRemove={() => removeGalleryImage(index)}
                                    />
                                ))}
                                {(formData.images?.gallery.length || 0) < 4 && (
                                    <ImageUpload
                                        onUpload={addGalleryImage}
                                        label="Add"
                                    />
                                )}
                            </div>
                        </div>
                    </div>
                </div>

                {/* Sidebar Info */}
                <div className="space-y-8">
                    {/* Status */}
                    <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100 space-y-6">
                        <h3 className="text-lg font-bold text-gray-900">Status</h3>

                        <div className="space-y-4">
                            <label className="flex items-center gap-3 p-3 rounded-lg border border-gray-100 bg-gray-50 cursor-pointer">
                                <input
                                    type="checkbox"
                                    className="w-5 h-5 rounded text-blue-600 focus:ring-blue-500"
                                    checked={formData.inStock}
                                    onChange={e => setFormData({ ...formData, inStock: e.target.checked })}
                                />
                                <span className="font-medium text-gray-700">In Stock</span>
                            </label>

                            <label className="flex items-center gap-3 p-3 rounded-lg border border-gray-100 bg-gray-50 cursor-pointer">
                                <input
                                    type="checkbox"
                                    className="w-5 h-5 rounded text-blue-600 focus:ring-blue-500"
                                    checked={formData.featured}
                                    onChange={e => setFormData({ ...formData, featured: e.target.checked })}
                                />
                                <span className="font-medium text-gray-700">Featured Product</span>
                            </label>

                            <label className="flex items-center gap-3 p-3 rounded-lg border border-gray-100 bg-gray-50 cursor-pointer">
                                <input
                                    type="checkbox"
                                    className="w-5 h-5 rounded text-blue-600 focus:ring-blue-500"
                                    checked={formData.bestseller}
                                    onChange={e => setFormData({ ...formData, bestseller: e.target.checked })}
                                />
                                <span className="font-medium text-gray-700">Bestseller Tag</span>
                            </label>

                            <label className="flex items-center gap-3 p-3 rounded-lg border border-gray-100 bg-gray-50 cursor-pointer">
                                <input
                                    type="checkbox"
                                    className="w-5 h-5 rounded text-blue-600 focus:ring-blue-500"
                                    checked={formData.new}
                                    onChange={e => setFormData({ ...formData, new: e.target.checked })}
                                />
                                <span className="font-medium text-gray-700">New Arrival Tag</span>
                            </label>
                        </div>
                    </div>
                </div>
            </div>
        </form>
    );
}
