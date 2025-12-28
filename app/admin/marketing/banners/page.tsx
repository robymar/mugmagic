'use client';

import React from 'react';
import { BannerManager } from '@/components/admin/BannerManager';

export default function BannersPage() {
    return (
        <div className="space-y-6">
            <div>
                <h1 className="text-3xl font-black text-gray-900">Banner Management</h1>
                <p className="text-gray-500 mt-1">Manage the visual promotions on your homepage.</p>
            </div>

            <BannerManager />
        </div>
    );
}
