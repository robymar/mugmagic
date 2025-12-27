'use client';

import { useState, useEffect } from 'react';
import { Plus, Edit, Trash2, Save, X, Image as ImageIcon, User } from 'lucide-react';
import Image from 'next/image';

type ContentType = 'stickers' | 'avatars';

interface Sticker {
    id: string;
    name: string;
    image_url: string;
    category: string;
    tags: string[];
    is_premium: boolean;
    display_order: number;
    active: boolean;
}

interface Avatar {
    id: string;
    name: string;
    image_url: string;
    type: string;
    category: string;
    tags: string[];
    is_premium: boolean;
    display_order: number;
    active: boolean;
}

export default function ContentPage() {
    const [activeTab, setActiveTab] = useState<ContentType>('stickers');
    const [items, setItems] = useState<(Sticker | Avatar)[]>([]);
    const [loading, setLoading] = useState(true);
    const [editingId, setEditingId] = useState<string | null>(null);
    const [showForm, setShowForm] = useState(false);
    const [formData, setFormData] = useState<Partial<Sticker | Avatar>>({
        name: '',
        image_url: '',
        category: 'general',
        tags: [],
        is_premium: false,
        display_order: 0,
        active: true
    });

    useEffect(() => {
        fetchItems();
    }, [activeTab]);

    const fetchItems = async () => {
        setLoading(true);
        try {
            const endpoint = activeTab === 'stickers' ? '/api/stickers' : '/api/avatars';
            const res = await fetch(endpoint);
            const data = await res.json();

            // Ensure data is an array before setting state
            if (Array.isArray(data)) {
                setItems(data);
            } else {
                console.error('API returned non-array data:', data);
                setItems([]);
            }
        } catch (error) {
            console.error('Error fetching items:', error);
            setItems([]);
        } finally {
            setLoading(false);
        }
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);

        try {
            const endpoint = activeTab === 'stickers' ? '/api/stickers' : '/api/avatars';
            const url = editingId ? `${endpoint}/${editingId}` : endpoint;
            const method = editingId ? 'PUT' : 'POST';

            const res = await fetch(url, {
                method,
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(formData)
            });

            if (res.ok) {
                await fetchItems();
                handleCancel();
            } else {
                alert(`Failed to save ${activeTab.slice(0, -1)}`);
            }
        } catch (error) {
            console.error('Error saving item:', error);
            alert('Error saving item');
        } finally {
            setLoading(false);
        }
    };

    const handleEdit = (item: Sticker | Avatar) => {
        setFormData(item);
        setEditingId(item.id);
        setShowForm(true);
    };

    const handleDelete = async (id: string) => {
        if (!confirm(`Are you sure you want to delete this ${activeTab.slice(0, -1)}?`)) return;

        try {
            const endpoint = activeTab === 'stickers' ? '/api/stickers' : '/api/avatars';
            const res = await fetch(`${endpoint}/${id}`, {
                method: 'DELETE'
            });

            if (res.ok) {
                await fetchItems();
            } else {
                alert('Failed to delete item');
            }
        } catch (error) {
            console.error('Error deleting item:', error);
            alert('Error deleting item');
        }
    };

    const handleCancel = () => {
        setShowForm(false);
        setEditingId(null);
        setFormData({
            name: '',
            image_url: '',
            category: 'general',
            tags: [],
            is_premium: false,
            display_order: 0,
            active: true
        });
    };

    return (
        <div className="space-y-8">
            <div className="flex items-center justify-between">
                <div>
                    <h1 className="text-3xl font-black text-gray-900">Content Library</h1>
                    <p className="text-gray-500 mt-1">Manage stickers and avatars for your editor</p>
                </div>
            </div>

            {/* Tabs */}
            <div className="flex gap-2 border-b border-gray-200">
                <button
                    onClick={() => setActiveTab('stickers')}
                    className={`px-6 py-3 font-bold border-b-2 transition-colors ${activeTab === 'stickers'
                        ? 'border-blue-600 text-blue-600'
                        : 'border-transparent text-gray-500 hover:text-gray-700'
                        }`}
                >
                    🎨 Stickers
                </button>
                <button
                    onClick={() => setActiveTab('avatars')}
                    className={`px-6 py-3 font-bold border-b-2 transition-colors ${activeTab === 'avatars'
                        ? 'border-purple-600 text-purple-600'
                        : 'border-transparent text-gray-500 hover:text-gray-700'
                        }`}
                >
                    👤 Avatars
                </button>
            </div>

            {/* Add Button */}
            <div className="flex justify-end">
                <button
                    onClick={() => setShowForm(true)}
                    className="flex items-center gap-2 px-6 py-3 bg-blue-600 text-white font-bold rounded-xl hover:bg-blue-700 transition-colors shadow-lg shadow-blue-600/20"
                >
                    <Plus size={20} />
                    Add {activeTab === 'stickers' ? 'Sticker' : 'Avatar'}
                </button>
            </div>

            {/* Form */}
            {showForm && (
                <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100">
                    <h3 className="text-lg font-bold text-gray-900 mb-4">
                        {editingId ? 'Edit' : 'New'} {activeTab === 'stickers' ? 'Sticker' : 'Avatar'}
                    </h3>
                    <form onSubmit={handleSubmit} className="space-y-4">
                        <div className="grid grid-cols-2 gap-4">
                            <div>
                                <label className="block text-sm font-semibold text-gray-700 mb-2">Name</label>
                                <input
                                    type="text"
                                    required
                                    className="w-full px-4 py-2 rounded-lg border border-gray-200 focus:outline-none focus:ring-2 focus:ring-blue-500"
                                    value={formData.name}
                                    onChange={e => setFormData({ ...formData, name: e.target.value })}
                                />
                            </div>
                            <div>
                                <label className="block text-sm font-semibold text-gray-700 mb-2">Category</label>
                                <input
                                    type="text"
                                    className="w-full px-4 py-2 rounded-lg border border-gray-200 focus:outline-none focus:ring-2 focus:ring-blue-500"
                                    value={formData.category}
                                    onChange={e => setFormData({ ...formData, category: e.target.value })}
                                />
                            </div>
                        </div>
                        <div>
                            <label className="block text-sm font-semibold text-gray-700 mb-2">Image URL</label>
                            <input
                                type="url"
                                required
                                className="w-full px-4 py-2 rounded-lg border border-gray-200 focus:outline-none focus:ring-2 focus:ring-blue-500"
                                value={formData.image_url}
                                onChange={e => setFormData({ ...formData, image_url: e.target.value })}
                                placeholder="https://example.com/image.svg"
                            />
                            {formData.image_url && (
                                <div className="mt-3 p-4 bg-gray-50 rounded-lg">
                                    <p className="text-sm text-gray-600 mb-2">Preview:</p>
                                    <img
                                        src={formData.image_url}
                                        alt="Preview"
                                        className="w-24 h-24 object-contain rounded-lg bg-white p-2 border border-gray-200"
                                        onError={(e) => {
                                            (e.target as HTMLImageElement).src = 'data:image/svg+xml,<svg xmlns="http://www.w3.org/2000/svg"/>';
                                        }}
                                    />
                                </div>
                            )}
                        </div>
                        <div className="grid grid-cols-2 gap-4">
                            <div>
                                <label className="block text-sm font-semibold text-gray-700 mb-2">Display Order</label>
                                <input
                                    type="number"
                                    className="w-full px-4 py-2 rounded-lg border border-gray-200 focus:outline-none focus:ring-2 focus:ring-blue-500"
                                    value={formData.display_order}
                                    onChange={e => setFormData({ ...formData, display_order: parseInt(e.target.value) })}
                                />
                            </div>
                            <div className="flex items-end gap-4">
                                <label className="flex items-center gap-3">
                                    <input
                                        type="checkbox"
                                        className="w-5 h-5 rounded text-blue-600"
                                        checked={formData.is_premium}
                                        onChange={e => setFormData({ ...formData, is_premium: e.target.checked })}
                                    />
                                    <span className="font-medium text-gray-700">Premium</span>
                                </label>
                                <label className="flex items-center gap-3">
                                    <input
                                        type="checkbox"
                                        className="w-5 h-5 rounded text-blue-600"
                                        checked={formData.active}
                                        onChange={e => setFormData({ ...formData, active: e.target.checked })}
                                    />
                                    <span className="font-medium text-gray-700">Active</span>
                                </label>
                            </div>
                        </div>
                        <div className="flex gap-3 pt-4">
                            <button
                                type="submit"
                                disabled={loading}
                                className="flex items-center gap-2 px-6 py-2 bg-blue-600 text-white font-bold rounded-lg hover:bg-blue-700 transition-colors disabled:opacity-50"
                            >
                                <Save size={18} />
                                {loading ? 'Saving...' : 'Save'}
                            </button>
                            <button
                                type="button"
                                onClick={handleCancel}
                                className="flex items-center gap-2 px-6 py-2 bg-gray-200 text-gray-700 font-bold rounded-lg hover:bg-gray-300 transition-colors"
                            >
                                <X size={18} />
                                Cancel
                            </button>
                        </div>
                    </form>
                </div>
            )}

            {/* Items Grid */}
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-6 gap-4">
                {loading && items.length === 0 ? (
                    <div className="col-span-full text-center py-12 text-gray-500">Loading...</div>
                ) : items.length === 0 ? (
                    <div className="col-span-full text-center py-12 text-gray-500">
                        No {activeTab} yet. Create your first one!
                    </div>
                ) : (
                    items.map(item => (
                        <div
                            key={item.id}
                            className="bg-white p-4 rounded-2xl shadow-sm border border-gray-100 hover:shadow-md transition-shadow"
                        >
                            <div className="aspect-square rounded-lg bg-gray-50 mb-3 overflow-hidden relative p-2">
                                <img
                                    src={item.image_url}
                                    alt={item.name}
                                    className="w-full h-full object-contain"
                                    onError={(e) => {
                                        (e.target as HTMLImageElement).src = 'data:image/svg+xml,<svg xmlns="http://www.w3.org/2000/svg"/>';
                                    }}
                                />
                                {item.is_premium && (
                                    <span className="absolute top-2 right-2 bg-yellow-400 text-yellow-900 text-xs px-2 py-1 rounded-full font-bold">
                                        PRO
                                    </span>
                                )}
                            </div>
                            <div className="space-y-2">
                                <p className="font-semibold text-gray-900 text-sm truncate">{item.name}</p>
                                <p className="text-xs text-gray-500 capitalize">{item.category}</p>
                                <div className="flex gap-2 pt-2">
                                    <button
                                        onClick={() => handleEdit(item)}
                                        className="flex-1 p-2 text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
                                    >
                                        <Edit size={16} className="mx-auto" />
                                    </button>
                                    <button
                                        onClick={() => handleDelete(item.id)}
                                        className="flex-1 p-2 text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                                    >
                                        <Trash2 size={16} className="mx-auto" />
                                    </button>
                                </div>
                            </div>
                        </div>
                    ))
                )}
            </div>
        </div>
    );
}
