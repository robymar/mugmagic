'use client';

import React, { useState, useEffect } from 'react';
import { CustomerProfile } from '@/components/admin/CustomerProfile';
import { useSearchParams } from 'next/navigation';
import Link from 'next/link';
import { ArrowLeft } from 'lucide-react';

export default function CustomerDetailPage({ params }: { params: { id: string } }) {
    const [data, setData] = useState<{ customer: any; orders: any[] } | null>(null);
    const [loading, setLoading] = useState(true);
    const searchParams = useSearchParams();

    // Resolve ID properly. In Next.js client components, params might be a promise in future versions, 
    // but for now it's an object. 
    // However, we need to handle the async nature if we were server-side.
    // Client side:
    const id = params.id;
    const emailParam = searchParams.get('email');

    useEffect(() => {
        const fetchData = async () => {
            try {
                const query = emailParam ? `?email=${encodeURIComponent(emailParam)}` : '';
                const res = await fetch(`/api/admin/customers/${id}${query}`);
                if (!res.ok) throw new Error('Failed to fetch');
                const json = await res.json();
                setData(json);
            } catch (error) {
                console.error(error);
            } finally {
                setLoading(false);
            }
        };

        if (id) fetchData();
    }, [id, emailParam]);

    if (loading) {
        return (
            <div className="flex items-center justify-center min-h-[400px]">
                <div className="w-8 h-8 border-4 border-blue-600 border-t-transparent rounded-full animate-spin"></div>
            </div>
        );
    }

    if (!data) {
        return (
            <div className="text-center py-20">
                <h2 className="text-2xl font-bold text-gray-900">Customer not found</h2>
                <Link href="/admin/customers" className="text-blue-600 hover:underline mt-2 inline-block">
                    Return to list
                </Link>
            </div>
        );
    }

    return (
        <div className="space-y-6">
            <Link
                href="/admin/customers"
                className="inline-flex items-center gap-2 text-sm text-gray-500 hover:text-gray-900 transition-colors"
            >
                <ArrowLeft size={16} />
                Back to Customers
            </Link>

            <CustomerProfile
                customer={data.customer}
                orders={data.orders}
            />
        </div>
    );
}
