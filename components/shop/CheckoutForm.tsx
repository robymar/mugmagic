"use client";

import React, { useState } from 'react';
import { useStripe, useElements, PaymentElement } from '@stripe/react-stripe-js';
import { Button } from '@/components/ui/Button';
import toast from 'react-hot-toast';

export const CheckoutForm = ({ amount }: { amount: number }) => {
    const stripe = useStripe();
    const elements = useElements();
    const [errorMessage, setErrorMessage] = useState<string | null>(null);
    const [loading, setLoading] = useState(false);

    const handleSubmit = async (event: React.FormEvent) => {
        event.preventDefault();

        if (!stripe || !elements) {
            toast.error('Payment system not ready. Please refresh the page.');
            return;
        }

        setLoading(true);

        // Show processing toast
        const processingToast = toast.loading('Processing payment...');

        const { error } = await stripe.confirmPayment({
            elements,
            confirmParams: {
                return_url: `${window.location.origin}/checkout/success`,
            },
        });

        toast.dismiss(processingToast);

        if (error) {
            setErrorMessage(error.message ?? 'An unknown error occurred');
            setLoading(false);
            toast.error(error.message ?? 'Payment failed. Please try again.');
        }
        // If success, stripe redirects automatically
    };

    return (
        <form onSubmit={handleSubmit} className="space-y-6">
            <div className="bg-white p-6 rounded-xl border shadow-sm">
                <PaymentElement />
            </div>

            {errorMessage && <div className="text-red-500 text-sm">{errorMessage}</div>}

            <Button
                type="submit"
                disabled={!stripe || loading}
                isLoading={loading}
                className="w-full text-lg py-4"
            >
                Pay ${(amount / 100).toFixed(2)}
            </Button>
        </form>
    );
};
