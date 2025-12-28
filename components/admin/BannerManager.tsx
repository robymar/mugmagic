'use client';

import React, { useState, useEffect } from 'react';
import {
    DndContext,
    closestCenter,
    KeyboardSensor,
    PointerSensor,
    useSensor,
    useSensors,
    DragEndEvent
} from '@dnd-kit/core';
import {
    arrayMove,
    SortableContext,
    sortableKeyboardCoordinates,
    verticalListSortingStrategy,
    useSortable
} from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';
import { Trash2, GripVertical, Image as ImageIcon, ExternalLink, Plus, Save } from 'lucide-react';
import { QuickEditInput } from './QuickEditInput';

interface Banner {
    id: string;
    title: string;
    image_url: string;
    link_url?: string;
    description?: string;
    priority: number;
    is_active: boolean;
}

function SortableBannerItem({
    banner,
    onDelete,
    onToggle,
    onEdit
}: {
    banner: Banner;
    onDelete: (id: string) => void;
    onToggle: (id: string, current: boolean) => void;
    onEdit: (id: string, field: string, value: any) => Promise<void>;
}) {
    const {
        attributes,
        listeners,
        setNodeRef,
        transform,
        transition,
    } = useSortable({ id: banner.id });

    const style = {
        transform: CSS.Transform.toString(transform),
        transition,
    };

    return (
        <div
            ref={setNodeRef}
            style={style}
            className="flex items-center gap-4 bg-white p-4 rounded-xl border border-gray-200 shadow-sm group"
        >
            {/* Drag Handle */}
            <div {...attributes} {...listeners} className="text-gray-400 cursor-grab active:cursor-grabbing p-1 hover:text-gray-600">
                <GripVertical size={20} />
            </div>

            {/* Preview */}
            <div className="w-32 h-20 bg-gray-100 rounded-lg overflow-hidden flex-shrink-0 relative">
                <img
                    src={banner.image_url}
                    alt={banner.title}
                    className={`w-full h-full object-cover transition-opacity ${!banner.is_active ? 'opacity-50 grayscale' : ''}`}
                />
                {!banner.is_active && (
                    <div className="absolute inset-0 flex items-center justify-center bg-black/10">
                        <span className="text-xs font-bold text-white bg-black/50 px-2 py-1 rounded">INACTIVE</span>
                    </div>
                )}
            </div>

            {/* Content */}
            <div className="flex-1 min-w-0 grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                    <QuickEditInput
                        value={banner.title}
                        onSave={(val) => onEdit(banner.id, 'title', val)}
                        className="font-bold text-gray-900 block"
                    />
                    <QuickEditInput
                        value={banner.description || 'No description'}
                        onSave={(val) => onEdit(banner.id, 'description', val)}
                        className="text-sm text-gray-500 mt-1 block"
                    />
                </div>
                <div className="flex items-center gap-2 text-sm text-blue-600">
                    <ExternalLink size={14} />
                    <QuickEditInput
                        value={banner.link_url || '#'}
                        onSave={(val) => onEdit(banner.id, 'link_url', val)}
                        label="Link: "
                        className="font-mono text-xs"
                    />
                </div>
            </div>

            {/* Actions */}
            <div className="flex items-center gap-2 pl-4 border-l border-gray-100">
                <button
                    onClick={() => onToggle(banner.id, banner.is_active)}
                    className={`px-3 py-1.5 rounded-md text-xs font-bold border transition-colors ${banner.is_active
                        ? 'bg-green-50 text-green-700 border-green-200 hover:bg-green-100'
                        : 'bg-gray-50 text-gray-600 border-gray-200 hover:bg-gray-100'
                        }`}
                >
                    {banner.is_active ? 'Active' : 'Draft'}
                </button>
                <button
                    onClick={() => onDelete(banner.id)}
                    className="p-2 text-gray-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                >
                    <Trash2 size={18} />
                </button>
            </div>
        </div>
    );
}

export function BannerManager() {
    const [banners, setBanners] = useState<Banner[]>([]);
    const [loading, setLoading] = useState(true);
    const [isSaving, setIsSaving] = useState(false);

    // New Banner Form State
    const [showAddForm, setShowAddForm] = useState(false);
    const [newBanner, setNewBanner] = useState({ title: '', image_url: '', link_url: '' });

    const sensors = useSensors(
        useSensor(PointerSensor),
        useSensor(KeyboardSensor, {
            coordinateGetter: sortableKeyboardCoordinates,
        })
    );

    useEffect(() => {
        fetchBanners();
    }, []);

    const fetchBanners = async () => {
        try {
            const res = await fetch('/api/admin/marketing/banners');
            const data = await res.json();
            setBanners(data);
        } catch (error) {
            console.error(error);
        } finally {
            setLoading(false);
        }
    };

    const handleDragEnd = async (event: DragEndEvent) => {
        const { active, over } = event;

        if (over && active.id !== over.id) {
            setBanners((items) => {
                const oldIndex = items.findIndex((i) => i.id === active.id);
                const newIndex = items.findIndex((i) => i.id === over.id);

                const newItems = arrayMove(items, oldIndex, newIndex);

                // Trigger API update
                // We send array of { id, priority }
                // Priority should be reverse array index for "top of page" logic?
                // Or just index. We used descending sort on GET.
                // So index 0 is highest priority.
                const updatePayload = newItems.map((item, index) => ({
                    id: item.id,
                    priority: newItems.length - index // DESC logic
                }));

                // Async update
                fetch('/api/admin/marketing/banners', {
                    method: 'PUT',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({ items: updatePayload })
                });

                return newItems;
            });
        }
    };

    const handleAdd = async () => {
        if (!newBanner.title || !newBanner.image_url) return;
        setIsSaving(true);
        try {
            const res = await fetch('/api/admin/marketing/banners', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(newBanner)
            });
            if (res.ok) {
                setNewBanner({ title: '', image_url: '', link_url: '' });
                setShowAddForm(false);
                fetchBanners();
            }
        } catch (e) {
            console.error(e);
        } finally {
            setIsSaving(false);
        }
    };

    const handleDelete = async (id: string) => {
        if (!confirm('Are you sure?')) return;
        setBanners(banners.filter(b => b.id !== id));
        await fetch(`/api/admin/marketing/banners/${id}`, { method: 'DELETE' });
    };

    const handleToggle = async (id: string, current: boolean) => {
        setBanners(banners.map(b => b.id === id ? { ...b, is_active: !current } : b));
        await fetch(`/api/admin/marketing/banners/${id}`, {
            method: 'PATCH',
            body: JSON.stringify({ is_active: !current })
        });
    };

    const handleEdit = async (id: string, field: string, value: any) => {
        setBanners(banners.map(b => b.id === id ? { ...b, [field]: value } : b));
        await fetch(`/api/admin/marketing/banners/${id}`, {
            method: 'PATCH',
            body: JSON.stringify({ [field]: value })
        });
    };

    if (loading) return <div>Loading banners...</div>;

    return (
        <div className="space-y-6">
            {/* Toolbar */}
            <div className="flex items-center justify-between">
                <div>
                    <h2 className="text-lg font-bold text-gray-900">Homepage Banners</h2>
                    <p className="text-sm text-gray-500">Drag to reorder. Top banner appears first.</p>
                </div>
                <button
                    onClick={() => setShowAddForm(!showAddForm)}
                    className="flex items-center gap-2 bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors shadow-sm"
                >
                    {showAddForm ? 'Cancel' : (
                        <>
                            <Plus size={18} />
                            Add Banner
                        </>
                    )}
                </button>
            </div>

            {/* Add Form */}
            {showAddForm && (
                <div className="bg-blue-50/50 border border-blue-100 p-6 rounded-xl animate-in fade-in slide-in-from-top-4 space-y-4">
                    <h3 className="font-bold text-blue-900">New Banner</h3>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <input
                            placeholder="Banner Title"
                            className="bg-white px-3 py-2 rounded-lg border border-blue-100 focus:outline-none focus:ring-2 focus:ring-blue-200"
                            value={newBanner.title}
                            onChange={(e) => setNewBanner({ ...newBanner, title: e.target.value })}
                        />
                        <input
                            placeholder="Image URL (start with https://)"
                            className="bg-white px-3 py-2 rounded-lg border border-blue-100 focus:outline-none focus:ring-2 focus:ring-blue-200"
                            value={newBanner.image_url}
                            onChange={(e) => setNewBanner({ ...newBanner, image_url: e.target.value })}
                        />
                        <div className="md:col-span-2">
                            <input
                                placeholder="Link URL (Optional)"
                                className="w-full bg-white px-3 py-2 rounded-lg border border-blue-100 focus:outline-none focus:ring-2 focus:ring-blue-200"
                                value={newBanner.link_url}
                                onChange={(e) => setNewBanner({ ...newBanner, link_url: e.target.value })}
                            />
                        </div>
                    </div>
                    <div className="flex justify-end pt-2">
                        <button
                            onClick={handleAdd}
                            disabled={isSaving}
                            className="flex items-center gap-2 bg-blue-600 text-white px-6 py-2 rounded-lg font-medium hover:bg-blue-700 disabled:opacity-50"
                        >
                            <Save size={18} />
                            {isSaving ? 'Saving...' : 'Save Banner'}
                        </button>
                    </div>
                </div>
            )}

            {/* List */}
            <DndContext
                sensors={sensors}
                collisionDetection={closestCenter}
                onDragEnd={handleDragEnd}
            >
                <SortableContext
                    items={banners.map(b => b.id)}
                    strategy={verticalListSortingStrategy}
                >
                    <div className="space-y-3">
                        {banners.map((banner) => (
                            <SortableBannerItem
                                key={banner.id}
                                banner={banner}
                                onDelete={handleDelete}
                                onToggle={handleToggle}
                                onEdit={handleEdit}
                            />
                        ))}
                    </div>
                </SortableContext>
            </DndContext>

            {banners.length === 0 && !loading && (
                <div className="text-center py-12 bg-gray-50 rounded-xl border-2 border-dashed border-gray-200">
                    <ImageIcon className="mx-auto text-gray-300 mb-2" size={48} />
                    <p className="text-gray-500">No banners yet.</p>
                </div>
            )}
        </div>
    );
}
