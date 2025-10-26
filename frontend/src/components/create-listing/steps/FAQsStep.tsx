'use client';

import React from 'react';
import FAQGenerator, { FAQ } from '@/components/create-listing/faq-generator';

interface FAQsStepProps {
  listingType: 'buy' | 'sell';
  faqs: FAQ[];
  onFAQsChange: (faqs: FAQ[]) => void;
  mockFAQData: FAQ[];
  hasAnyInput: boolean;
  answerOnlyMode?: boolean;
  questionOnlyMode?: boolean;
}

export default function FAQsStep({ faqs, onFAQsChange, mockFAQData, hasAnyInput, answerOnlyMode = false, questionOnlyMode = false }: FAQsStepProps) {
  console.log('FAQsStep received:', { answerOnlyMode, questionOnlyMode });

  return (
    <FAQGenerator
      faqs={faqs}
      onFAQsChange={onFAQsChange}
      hasAnyInput={hasAnyInput}
      mockFAQData={mockFAQData}
      answerOnlyMode={answerOnlyMode}
      questionOnlyMode={questionOnlyMode}
    />
  );
}
