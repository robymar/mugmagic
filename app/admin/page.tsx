'use client';

import {
    Euro, Package, ShoppingCart, AlertTriangle,
    TrendingUp, Users
} from 'lucide-react';
import { KPICard } from '@/components/admin/KPICard';
import { RecentActivity } from '@/components/admin/RecentActivity';
import { SalesChart } from '@/components/admin/SalesChart';

// Dummy data for chart (Phase 2)
const SALES_DATA = [
    { name: 'Mon', revenue: 400 },
    { name: 'Tue', revenue: 300 },
    { name: 'Wed', revenue: 550 },
    { name: 'Thu', revenue: 700 },
    { name: 'Fri', revenue: 450 },
    { name: 'Sat', revenue: 900 },
    { name: 'Sun', revenue: 1200 },
];

export default function AdminDashboard() {
    return (
        <div className="space-y-8">
            <div className="flex items-center justify-between">
                <div>
                    <h1 className="text-3xl font-black text-slate-900 tracking-tight">Dashboard</h1>
                    <p className="text-gray-500 mt-1">Updates and statistics for today</p>
                </div>
                <div className="flex items-center gap-2 text-sm text-gray-500 bg-white px-3 py-1.5 rounded-lg border border-gray-200">
                    <span className="w-2 h-2 rounded-full bg-green-500 animate-pulse"></span>
                    Live Updates
                </div>
            </div>

            {/* KPI Section */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                <KPICard
                    title="Revenue Today"
                    value="€1,234.50"
                    icon={Euro}
                    trend="+12% from yesterday"
                    trendDirection="up"
                />
                <KPICard
                    title="Pending Orders"
                    value="8"
                    icon={Package}
                    alert={true}
                    description="Requires processing"
                />
                <KPICard
                    title="Avg. Order Value"
                    value="€45.60"
                    icon={ShoppingCart}
                    trend="-2% from last week"
                    trendDirection="down"
                />
                <KPICard
                    title="Critical Stock"
                    value="3"
                    icon={AlertTriangle}
                    alert={true}
                    description="Products below threshold"
                />
            </div>

            {/* Content Section */}
            <div className="grid lg:grid-cols-3 gap-8 h-full">
                {/* Main Chart Area */}
                <div className="lg:col-span-2 bg-white rounded-xl border border-gray-200 p-6 shadow-sm min-h-[400px]">
                    <div className="flex items-center justify-between mb-6">
                        <h3 className="font-bold text-gray-900 flex items-center gap-2">
                            <TrendingUp size={20} className="text-blue-600" />
                            Sales Overview
                        </h3>
                        <select className="text-sm border-gray-200 rounded-lg p-2 bg-gray-50">
                            <option>Last 7 days</option>
                            <option>Last 30 days</option>
                            <option>This Month</option>
                        </select>
                    </div>

                    <SalesChart data={SALES_DATA} />
                </div>

                {/* Sidebar / Feed */}
                <div className="lg:col-span-1">
                    <RecentActivity />
                </div>
            </div>
        </div>
    );
}
