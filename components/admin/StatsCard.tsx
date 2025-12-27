import { LucideIcon } from 'lucide-react';

interface StatsCardProps {
    title: string;
    value: string | number;
    icon: LucideIcon;
    iconColor?: string;
    iconBgColor?: string;
    subtitle?: string;
    trend?: {
        value: number;
        isPositive: boolean;
    };
}

export default function StatsCard({
    title,
    value,
    icon: Icon,
    iconColor = 'text-blue-600',
    iconBgColor = 'bg-blue-100',
    subtitle,
    trend
}: StatsCardProps) {
    return (
        <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100 hover:shadow-md transition-shadow">
            <div className="flex items-center justify-between mb-4">
                <div className={`p-3 ${iconBgColor} rounded-xl`}>
                    <Icon size={24} className={iconColor} />
                </div>
                {trend && (
                    <div className={`flex items-center gap-1 text-sm font-semibold ${trend.isPositive ? 'text-green-600' : 'text-red-600'
                        }`}>
                        <span>{trend.isPositive ? '↑' : '↓'}</span>
                        <span>{Math.abs(trend.value)}%</span>
                    </div>
                )}
            </div>
            <div className="space-y-1">
                <div className="text-3xl font-black text-gray-900">{value}</div>
                <div className="text-sm font-medium text-gray-600">{title}</div>
                {subtitle && (
                    <div className="text-xs text-gray-500 pt-2 border-t border-gray-100 mt-3">
                        {subtitle}
                    </div>
                )}
            </div>
        </div>
    );
}
