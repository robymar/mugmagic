'use client';

import { ArrowDown, ArrowUp, LucideIcon } from 'lucide-react';

interface KPICardProps {
    title: string;
    value: string | number;
    icon: LucideIcon;
    trend?: string;
    trendDirection?: 'up' | 'down' | 'neutral';
    alert?: boolean;
    description?: string;
}

export function KPICard({
    title,
    value,
    icon: Icon,
    trend,
    trendDirection = 'neutral',
    alert = false,
    description
}: KPICardProps) {
    return (
        <div className={`p-6 bg-white rounded-xl border shadow-sm transition-all hover:shadow-md ${alert ? 'border-red-200 bg-red-50' : 'border-gray-200'
            }`}>
            <div className="flex items-center justify-between mb-4">
                <div className={`p-2 rounded-lg ${alert ? 'bg-red-100 text-red-600' : 'bg-blue-50 text-blue-600'
                    }`}>
                    <Icon size={24} />
                </div>
                {trend && (
                    <div className={`flex items-center gap-1 text-sm font-medium ${trendDirection === 'up' ? 'text-green-600' :
                            trendDirection === 'down' ? 'text-red-600' : 'text-gray-500'
                        }`}>
                        {trendDirection === 'up' ? <ArrowUp size={16} /> :
                            trendDirection === 'down' ? <ArrowDown size={16} /> : null}
                        {trend}
                    </div>
                )}
            </div>

            <h3 className="text-gray-500 text-sm font-medium uppercase tracking-wider">{title}</h3>
            <div className="mt-2 flex items-baseline gap-2">
                <span className={`text-3xl font-black ${alert ? 'text-red-900' : 'text-gray-900'}`}>{value}</span>
                {description && <span className="text-sm text-gray-500">{description}</span>}
            </div>
        </div>
    );
}
