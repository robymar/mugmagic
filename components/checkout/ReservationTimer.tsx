'use client';

import { useEffect, useState } from 'react';
import { useCartStore } from '@/stores/cartStore';
import { getReservationTimeRemaining, formatReservationTime } from '@/lib/checkout-utils';
import { Clock, AlertTriangle } from 'lucide-react';

export function ReservationTimer() {
    const { reservationExpiresAt, isReservationActive, clearCheckoutReservation } = useCartStore();
    const [timeRemaining, setTimeRemaining] = useState({ minutes: 15, seconds: 0 });
    const [isExpired, setIsExpired] = useState(false);

    useEffect(() => {
        if (!isReservationActive || !reservationExpiresAt) {
            return;
        }

        const updateTimer = () => {
            const remaining = getReservationTimeRemaining(reservationExpiresAt);

            setTimeRemaining({
                minutes: remaining.minutes,
                seconds: remaining.seconds
            });

            setIsExpired(remaining.isExpired);

            if (remaining.isExpired) {
                clearCheckoutReservation();
            }
        };

        // Update immediately
        updateTimer();

        // Update every second
        const interval = setInterval(updateTimer, 1000);

        return () => clearInterval(interval);
    }, [reservationExpiresAt, isReservationActive, clearCheckoutReservation]);

    if (!isReservationActive || !reservationExpiresAt) {
        return null;
    }

    const isLowTime = timeRemaining.minutes < 5;

    if (isExpired) {
        return (
            <div className="bg-red-50 border border-red-200 rounded-lg p-4 flex items-start gap-3">
                <AlertTriangle className="w-5 h-5 text-red-600 flex-shrink-0 mt-0.5" />
                <div>
                    <h4 className="font-semibold text-red-900">Reservation Expired</h4>
                    <p className="text-sm text-red-700 mt-1">
                        Your cart reservation has expired. Please checkout again to reserve your items.
                    </p>
                </div>
            </div>
        );
    }

    return (
        <div
            className={`rounded-lg p-4 flex items-center gap-3 ${isLowTime
                    ? 'bg-orange-50 border border-orange-200'
                    : 'bg-blue-50 border border-blue-200'
                }`}
        >
            <Clock className={`w-5 h-5 flex-shrink-0 ${isLowTime ? 'text-orange-600' : 'text-blue-600'
                }`} />
            <div className="flex-1">
                <div className="flex items-baseline gap-2">
                    <span className={`text-2xl font-bold font-mono ${isLowTime ? 'text-orange-900' : 'text-blue-900'
                        }`}>
                        {formatReservationTime(timeRemaining.minutes, timeRemaining.seconds)}
                    </span>
                    <span className={`text-sm ${isLowTime ? 'text-orange-700' : 'text-blue-700'
                        }`}>
                        remaining
                    </span>
                </div>
                <p className={`text-xs mt-1 ${isLowTime ? 'text-orange-600' : 'text-blue-600'
                    }`}>
                    {isLowTime
                        ? '⚠️ Hurry! Your items will be released soon.'
                        : 'Your items are reserved. Complete payment to confirm.'}
                </p>
            </div>
        </div>
    );
}
