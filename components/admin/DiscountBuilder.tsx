'use client';

import React, { useState, useEffect } from 'react';
import { Tag, Save, Trash2, Calendar, Sparkles, AlertCircle } from 'lucide-react';

interface Coupon {
    id: string;
    code: string;
    type: 'percentage' | 'fixed_amount';
    value: number;
    min_order_amount?: number;
    max_uses?: number;
    uses_count: number;
    is_active: boolean;
    start_date?: string;
    end_date?: string;
}

export function DiscountBuilder() {
    const [coupons, setCoupons] = useState<Coupon[]>([]);
    const [loading, setLoading] = useState(true);

    // Form state
    const [code, setCode] = useState('');
    const [type, setType] = useState<'percentage' | 'fixed_amount'>('percentage');
    const [value, setValue] = useState(10);
    const [minOrder, setMinOrder] = useState<string>('');
    const [maxUses, setMaxUses] = useState<string>('');
    const [isSaving, setIsSaving] = useState(false);
    const [error, setError] = useState('');

    useEffect(() => {
        fetchCoupons();
    }, []);

    const fetchCoupons = async () => {
        try {
            const res = await fetch('/api/admin/marketing/coupons');
            const data = await res.json();
            setCoupons(data);
        } catch (error) {
            console.error(error);
        } finally {
            setLoading(false);
        }
    };

    const handleCreate = async () => {
        if (!code) {
            setError('Coupon code is required');
            return;
        }
        setIsSaving(true);
        setError('');

        try {
            const payload = {
                code: code.toUpperCase(),
                type,
                value,
                min_order_amount: minOrder ? parseFloat(minOrder) : null,
                max_uses: maxUses ? parseInt(maxUses) : null,
            };

            const res = await fetch('/api/admin/marketing/coupons', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(payload)
            });

            if (!res.ok) {
                const json = await res.json();
                throw new Error(json.error || 'Failed to create');
            }

            // Reset form
            setCode('');
            setValue(10);
            setMinOrder('');
            setMaxUses('');
            fetchCoupons();

        } catch (e: any) {
            setError(e.message);
        } finally {
            setIsSaving(false);
        }
    };

    const handleDelete = async (id: string) => {
        if (!confirm('Delete this coupon?')) return;
        setCoupons(coupons.filter(c => c.id !== id));
        await fetch(`/api/admin/marketing/coupons/${id}`, { method: 'DELETE' });
    };

    const handleToggle = async (id: string, current: boolean) => {
        setCoupons(coupons.map(c => c.id === id ? { ...c, is_active: !current } : c));
        await fetch(`/api/admin/marketing/coupons/${id}`, {
            method: 'PATCH',
            body: JSON.stringify({ is_active: !current })
        });
    };

    return (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            {/* Creator Panel */}
            <div className="lg:col-span-1 space-y-6">
                <div className="bg-white p-6 rounded-xl border border-gray-200 shadow-sm">
                    <h3 className="font-bold text-gray-900 flex items-center gap-2 mb-4">
                        <Sparkles className="text-purple-500" size={18} />
                        Create New Discount
                    </h3>

                    <div className="space-y-4">
                        <div>
                            <label className="block text-xs font-bold text-gray-500 uppercase mb-1">Coupon Code</label>
                            <div className="relative">
                                <Tag className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={16} />
                                <input
                                    className="w-full pl-9 pr-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-purple-500 uppercase font-mono font-bold tracking-wider"
                                    placeholder="SUMMER20"
                                    value={code}
                                    onChange={e => setCode(e.target.value.toUpperCase())}
                                />
                            </div>
                        </div>

                        <div className="grid grid-cols-2 gap-4">
                            <div>
                                <label className="block text-xs font-bold text-gray-500 uppercase mb-1">Type</label>
                                <select
                                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500"
                                    value={type}
                                    onChange={(e: any) => setType(e.target.value)}
                                >
                                    <option value="percentage">Percentage (%)</option>
                                    <option value="fixed_amount">Fixed Amount (€)</option>
                                </select>
                            </div>
                            <div>
                                <label className="block text-xs font-bold text-gray-500 uppercase mb-1">Value</label>
                                <input
                                    type="number"
                                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500"
                                    value={value}
                                    onChange={e => setValue(parseFloat(e.target.value))}
                                />
                            </div>
                        </div>

                        <div>
                            <label className="block text-xs font-bold text-gray-500 uppercase mb-1">Min. Order Amount (Optional)</label>
                            <div className="relative">
                                <span className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400">€</span>
                                <input
                                    type="number"
                                    className="w-full pl-8 pr-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500"
                                    placeholder="0.00"
                                    value={minOrder}
                                    onChange={e => setMinOrder(e.target.value)}
                                />
                            </div>
                        </div>

                        <div>
                            <label className="block text-xs font-bold text-gray-500 uppercase mb-1">Max Uses (Optional)</label>
                            <input
                                type="number"
                                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500"
                                placeholder="Unlimited"
                                value={maxUses}
                                onChange={e => setMaxUses(e.target.value)}
                            />
                        </div>

                        {error && (
                            <div className="text-red-500 text-sm flex items-center gap-1">
                                <AlertCircle size={14} /> {error}
                            </div>
                        )}

                        <button
                            onClick={handleCreate}
                            disabled={isSaving}
                            className="w-full bg-purple-600 text-white font-bold py-2.5 rounded-lg hover:bg-purple-700 transition-colors shadow-sm disabled:opacity-50"
                        >
                            {isSaving ? 'Creating...' : 'Create Coupon'}
                        </button>
                    </div>

                    {/* Preview */}
                    <div className="mt-6 p-4 bg-gray-50 rounded-lg border border-dashed border-gray-200">
                        <div className="text-xs text-gray-500 uppercase text-center mb-2">Preview</div>
                        <div className="bg-white border border-gray-200 rounded p-3 flex items-center justify-between shadow-sm">
                            <div className="flex items-center gap-2">
                                <Tag className="text-purple-600" size={16} />
                                <span className="font-bold text-gray-900">{code || 'CODE'}</span>
                            </div>
                            <div className="text-green-600 font-bold">
                                -{type === 'percentage' ? `${value}%` : `€${value}`}
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            {/* List Panel */}
            <div className="lg:col-span-2">
                <div className="bg-white rounded-xl border border-gray-200 shadow-sm overflow-hidden">
                    <div className="px-6 py-4 border-b border-gray-200 bg-gray-50">
                        <h3 className="font-bold text-gray-900">Active Coupons</h3>
                    </div>
                    <div className="divide-y divide-gray-100">
                        {loading ? (
                            <div className="p-8 text-center text-gray-500">Loading...</div>
                        ) : coupons.length === 0 ? (
                            <div className="p-8 text-center text-gray-500">No coupons created yet.</div>
                        ) : (
                            coupons.map(coupon => (
                                <div key={coupon.id} className="p-4 flex items-center justify-between hover:bg-gray-50 group">
                                    <div className="flex items-start gap-4">
                                        <div className={`w-12 h-12 rounded-lg flex items-center justify-center font-bold text-lg ${coupon.is_active ? 'bg-purple-100 text-purple-600' : 'bg-gray-100 text-gray-400'
                                            }`}>
                                            %
                                        </div>
                                        <div>
                                            <div className="flex items-center gap-2">
                                                <span className="font-mono font-bold text-gray-900 text-lg">{coupon.code}</span>
                                                <span className="px-2 py-0.5 bg-green-100 text-green-700 rounded text-xs font-bold">
                                                    {coupon.type === 'percentage' ? `${coupon.value}% OFF` : `€${coupon.value} OFF`}
                                                </span>
                                                {!coupon.is_active && <span className="text-xs bg-gray-200 text-gray-600 px-2 py-0.5 rounded">INACTIVE</span>}
                                            </div>
                                            <div className="text-sm text-gray-500 mt-1 flex flex-wrap gap-x-4 gap-y-1">
                                                {coupon.min_order_amount && (
                                                    <span>Min Order: €{coupon.min_order_amount}</span>
                                                )}
                                                <span>Used: <strong>{coupon.uses_count}</strong> {coupon.max_uses ? `/ ${coupon.max_uses}` : 'times'}</span>
                                            </div>
                                        </div>
                                    </div>

                                    <div className="flex items-center gap-2">
                                        <button
                                            onClick={() => handleToggle(coupon.id, coupon.is_active)}
                                            className={`px-3 py-1.5 rounded-lg text-xs font-bold border transition-colors ${coupon.is_active
                                                    ? 'bg-green-50 text-green-700 border-green-200 hover:bg-green-100'
                                                    : 'bg-gray-50 text-gray-600 border-gray-200 hover:bg-gray-100'
                                                }`}
                                        >
                                            {coupon.is_active ? 'Active' : 'Paused'}
                                        </button>
                                        <button
                                            onClick={() => handleDelete(coupon.id)}
                                            className="p-2 text-gray-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                                        >
                                            <Trash2 size={18} />
                                        </button>
                                    </div>
                                </div>
                            ))
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
}
