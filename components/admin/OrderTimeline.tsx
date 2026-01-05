'use client';

import React from 'react';
import {
    Check, CreditCard, Truck, Package, Clock,
    Circle, AlertCircle
} from 'lucide-react';

interface TimelineStepProps {
    status: 'completed' | 'current' | 'upcoming' | 'error';
    icon: React.ElementType;
    title: string;
    description?: string;
    timestamp?: string;
    isLast?: boolean;
}

function TimelineStep({ status, icon: Icon, title, description, timestamp, isLast }: TimelineStepProps) {
    return (
        <div className="relative flex gap-4">
            {/* Connector Line */}
            {!isLast && (
                <div
                    className={`absolute left-5 top-10 bottom-0 w-0.5 ${status === 'completed' ? 'bg-blue-600' : 'bg-gray-200'
                        }`}
                />
            )}

            {/* Icon */}
            <div
                className={`relative z-10 w-10 h-10 rounded-full flex items-center justify-center border-2 flex-shrink-0 transition-colors ${status === 'completed' ? 'bg-blue-600 border-blue-600 text-white' :
                    status === 'current' ? 'bg-white border-blue-600 text-blue-600 animate-pulse' :
                        status === 'error' ? 'bg-red-100 border-red-500 text-red-600' :
                            'bg-white border-gray-200 text-gray-400'
                    }`}
            >
                {status === 'completed' ? <Check size={18} /> :
                    status === 'error' ? <AlertCircle size={18} /> :
                        React.createElement(Icon, { size: 18 })}
            </div>

            {/* Content */}
            <div className="flex-1 pb-8 pt-1">
                <div className="flex justify-between items-start">
                    <div>
                        <h4 className={`font-bold text-sm ${status === 'upcoming' ? 'text-gray-500' : 'text-gray-900'
                            }`}>
                            {title}
                        </h4>
                        {description && (
                            <p className="text-sm text-gray-600 mt-1">{description}</p>
                        )}
                    </div>
                    {timestamp && (
                        <span className="text-xs text-gray-500 font-mono bg-gray-50 px-2 py-1 rounded">
                            {timestamp}
                        </span>
                    )}
                </div>
            </div>
        </div>
    );
}

// Logic to map order status to steps
export const ORDER_STEPS = [
    { id: 'placed', title: 'Order Placed', icon: Clock },
    { id: 'paid', title: 'Payment Confirmed', icon: CreditCard },
    { id: 'processing', title: 'Processing', icon: Package },
    { id: 'shipped', title: 'Shipped', icon: Truck },
    { id: 'delivered', title: 'Delivered', icon: Check },
];

interface OrderTimelineProps {
    status: string; // current status of the order
    createdAt: string;
    updatedAt?: string;
    history?: any[]; // For future real history logs
}

export function OrderTimeline({ status, createdAt }: OrderTimelineProps) {
    // Helper to determine step status
    const getStepStatus = (stepId: string, currentStatus: string) => {
        const statusOrder = ['pending', 'paid', 'processing', 'shipped', 'delivered'];

        // Handle edge cases
        if (currentStatus === 'cancelled') return stepId === 'placed' ? 'completed' : 'upcoming';
        if (currentStatus === 'failed') return stepId === 'placed' ? 'completed' : 'error';

        const currentIndex = statusOrder.indexOf(currentStatus);
        const stepIndex = statusOrder.indexOf(stepId);

        if (stepIndex < currentIndex) return 'completed';
        if (stepIndex === currentIndex) return 'current';
        return 'upcoming';
    };

    return (
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
            <h3 className="text-lg font-bold text-gray-900 mb-6 flex items-center gap-2">
                <Clock size={20} /> Order Timeline
            </h3>

            <div className="ml-2">
                {ORDER_STEPS.map((step, index) => {
                    const stepStatus = getStepStatus(step.id === 'placed' ? 'pending' : step.id, status);

                    // Simple timestamp logic for MVP (only show created for first step or if we had real logs)
                    const showTime = step.id === 'placed' ? new Date(createdAt).toLocaleString() : undefined;

                    return (
                        <TimelineStep
                            key={step.id}
                            status={stepStatus as any}
                            icon={step.icon}
                            title={step.title}
                            description={stepStatus === 'current' ? 'Current Status' : undefined}
                            timestamp={showTime}
                            isLast={index === ORDER_STEPS.length - 1}
                        />
                    );
                })}
            </div>
        </div>
    );
}
