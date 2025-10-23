'use client';

import React from 'react';
import FAQGenerator, { FAQ } from '@/app/create-listing/faq-generator';

interface FAQsStepProps {
  listingType: 'buy' | 'sell';
  faqs: FAQ[];
  onFAQsChange: (faqs: FAQ[]) => void;
  mockFAQData: FAQ[];
  hasAnyInput: boolean;
}

export default function FAQsStep({ faqs, onFAQsChange, mockFAQData, hasAnyInput }: FAQsStepProps) {
  return (
    <FAQGenerator
      faqs={faqs}
      onFAQsChange={onFAQsChange}
      hasAnyInput={hasAnyInput}
      mockFAQData={mockFAQData}
    />
  );
}
