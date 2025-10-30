"use client";

import React, { useState, useEffect, useCallback } from "react";
import { loadStripe } from "@stripe/stripe-js";
import {
  EmbeddedCheckoutProvider,
  EmbeddedCheckout,
} from "@stripe/react-stripe-js";
import { X } from "lucide-react";

// Initialize Stripe
const stripePromise = loadStripe(
  process.env.NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY!
);

interface StripePaymentProps {
  amount: number | string;
  title: string;
  description?: string;
  metadata?: Record<string, string>;
  onSuccess: () => void;
  onCancel: () => void;
}

// Helper function to parse amount from string or number
function parseAmount(amount: number | string): number {
  if (typeof amount === "number") {
    return amount;
  }
  // Extract number from string like "RM 50" or "$50"
  const match = amount.match(/[\d.]+/);
  return match ? parseFloat(match[0]) : 0;
}

export function StripePayment({
  amount,
  title,
  description,
  metadata,
  onSuccess,
  onCancel,
}: StripePaymentProps) {
  const [clientSecret, setClientSecret] = useState<string>("");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string>("");

  const amountNumber = parseAmount(amount);

  useEffect(() => {
    const createCheckoutSession = async () => {
      try {
        const response = await fetch("/api/create-checkout-session", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            amount: amountNumber,
            title,
            description,
            metadata,
          }),
        });

        const data = await response.json();

        if (!response.ok) {
          throw new Error(data.error || "Failed to create checkout session");
        }

        setClientSecret(data.clientSecret);
        setLoading(false);
      } catch (err: any) {
        setError(err.message || "Failed to initialize checkout");
        setLoading(false);
      }
    };

    if (amountNumber > 0) {
      createCheckoutSession();
    }
  }, [amountNumber, title, description, metadata]);

  const fetchClientSecret = useCallback(async () => {
    return clientSecret;
  }, [clientSecret]);

  const options = { fetchClientSecret };

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-xl shadow-2xl max-w-2xl w-full max-h-[90vh] overflow-hidden flex flex-col">
        {/* Header */}
        <div className="bg-accent-700 text-white p-4 flex justify-between items-center shrink-0">
          <div>
            <h2 className="text-xl font-bold">{title}</h2>
            {description && (
              <p className="text-sm text-primary-200 mt-1">{description}</p>
            )}
          </div>
          <button
            onClick={onCancel}
            className="p-1 hover:bg-accent-800 rounded-full transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content */}
        <div className="flex-1 overflow-y-auto p-6">
          {loading && (
            <div className="text-center py-12">
              <div className="inline-block animate-spin rounded-full h-12 w-12 border-b-2 border-accent-700"></div>
              <p className="mt-4 text-neutral-600">Loading checkout...</p>
            </div>
          )}

          {error && (
            <div className="bg-red-50 border border-red-200 text-red-700 p-4 rounded-lg">
              <p className="font-semibold">Error</p>
              <p className="text-sm">{error}</p>
              <button
                onClick={onCancel}
                className="mt-3 text-sm underline hover:no-underline"
              >
                Close
              </button>
            </div>
          )}

          {!loading && !error && clientSecret && (
            <div id="checkout">
              <EmbeddedCheckoutProvider stripe={stripePromise} options={options}>
                <EmbeddedCheckout />
              </EmbeddedCheckoutProvider>
            </div>
          )}
        </div>

        {/* Footer - Test Mode Notice */}
        {!loading && !error && (
          <div className="p-4 bg-blue-50 border-t border-blue-200 shrink-0">
            <p className="text-xs text-blue-700 text-center">
              <strong>Test Mode:</strong> Use card 4242 4242 4242 4242 with any
              future expiry and CVC.
            </p>
          </div>
        )}
      </div>
    </div>
  );
}
