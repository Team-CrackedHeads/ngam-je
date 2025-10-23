'use client';

import React from 'react';

interface PreviewStepProps {
  listingType: 'buy' | 'sell';
  formData: any;
  selectedImageIndex: number;
  setSelectedImageIndex: (index: number) => void;
  onEditStep: (step: number) => void;
  ownershipVerified?: boolean | null;
}

export default function PreviewStep(props: PreviewStepProps) {
  return (
    <div className="space-y-6">
      <div className="text-center mb-8">
        <h2 className="text-3xl font-bold mb-2 text-[var(--color-accent-700)]">Review Your Listing</h2>
        <p className="text-lg text-[var(--color-primary-900)]">Check the details</p>
      </div>

      <div className="max-w-4xl mx-auto">
        <p className="text-center text-gray-500">Preview content will be rendered here</p>
        <p className="text-sm text-gray-400 text-center mt-2">(Full implementation from Buy/Sell modals)</p>
      </div>
    </div>
  );
}
