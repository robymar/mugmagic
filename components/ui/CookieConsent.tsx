'use client';

import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Button } from '@/components/ui/Button';

export default function CookieConsent() {
    const [isVisible, setIsVisible] = useState(false);

    useEffect(() => {
        // Check if user has already made a choice
        const consent = localStorage.getItem('cookie-consent');
        if (!consent) {
            setIsVisible(true);
        }
    }, []);

    const handleAccept = () => {
        localStorage.setItem('cookie-consent', 'accepted');
        setIsVisible(false);
        // Initialize GA/Pixels here if we had them
        if (typeof window !== 'undefined' && window.dataLayer) {
            window.dataLayer.push({ event: 'consent_granted' });
        }
    };

    const handleDecline = () => {
        localStorage.setItem('cookie-consent', 'declined');
        setIsVisible(false);
    };

    return (
        <AnimatePresence>
            {isVisible && (
                <motion.div
                    initial={{ y: 100, opacity: 0 }}
                    animate={{ y: 0, opacity: 1 }}
                    exit={{ y: 100, opacity: 0 }}
                    className="fixed bottom-4 left-4 right-4 md:left-auto md:right-4 z-50 md:max-w-md"
                >
                    <div className="bg-white p-6 rounded-2xl shadow-xl border border-gray-100 dark:bg-gray-800 dark:border-gray-700">
                        <h3 className="text-lg font-semibold mb-2 text-gray-900 dark:text-white">
                            🍪 Cookie Settings
                        </h3>
                        <p className="text-sm text-gray-600 dark:text-gray-300 mb-4">
                            We use cookies to improve your experience and analyze site traffic.
                            We do not sell your data.
                        </p>
                        <div className="flex gap-3 justify-end">
                            <button
                                onClick={handleDecline}
                                className="px-4 py-2 text-sm text-gray-500 hover:text-gray-700 font-medium"
                            >
                                Decline
                            </button>
                            <Button
                                onClick={handleAccept}
                                size="sm"
                                variant="primary"
                            >
                                Accept All
                            </Button>
                        </div>
                    </div>
                </motion.div>
            )}
        </AnimatePresence>
    );
}

// Add strict type for window.dataLayer
declare global {
    interface Window {
        dataLayer: any[];
    }
}
