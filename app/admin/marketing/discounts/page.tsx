'use client';

import React from 'react';
import { DiscountBuilder } from '@/components/admin/DiscountBuilder';

export default function DiscountsPage() {
    return (
        <div className="space-y-6">
            <div>
                <h1 className="text-3xl font-black text-gray-900">Discount Manager</h1>
                <p className="text-gray-500 mt-1">Create and manage coupon codes for your customers.</p>
            </div>

            <DiscountBuilder />
        </div>
    );
}
