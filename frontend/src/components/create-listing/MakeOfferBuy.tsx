'use client';

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { X, ChevronRight, ChevronLeft, Check, DollarSign, Eye, MessageCircle, Info } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { addNewListing, generateListingId, convertFormToListing } from '@/utils/listing-storage';
import SourceListingInfoStep from './steps/SourceListingInfoStep';
import PricingShippingStep from './steps/PricingShippingStep';
import FAQsStep from './steps/FAQsStep';
import PreviewStep from './steps/PreviewStep';
import { MOCK_LOCATION, MOCK_PRICE_HISTORY, MOCK_FAQ_BUY } from '@/utils/mock-all-data-used';

interface MakeOfferBuyProps {
  isOpen: boolean;
  onClose: () => void;
  sourceListingId: string;
  sourceTitle: string;
  sourceDescription: string;
  sourceImages: string[];
  sourceOwnershipProof?: string | null;
  sourceTags: string[];
  sourcePrice: number;
  category: string;
  sourceFAQs?: { id: string; question: string; answer: string }[];
}

export default function MakeOfferBuy({
  isOpen,
  onClose,
  sourceListingId,
  sourceTitle,
  sourceDescription,
  sourceImages,
  sourceOwnershipProof,
  sourceTags,
  sourcePrice,
  category,
  sourceFAQs = []
}: MakeOfferBuyProps) {
  const router = useRouter();
  const [currentStep, setCurrentStep] = useState(1);
  const [showSuccessDialog, setShowSuccessDialog] = useState(false);

  // Pricing states
  const [showLocationDropdown, setShowLocationDropdown] = useState(false);
  const [filteredLocations, setFilteredLocations] = useState<string[]>(MOCK_LOCATION);
  const [selectedLocationIndex, setSelectedLocationIndex] = useState(-1);
  const [showCurrencyDropdown, setShowCurrencyDropdown] = useState(false);
  const [filteredCurrencies, setFilteredCurrencies] = useState<string[]>(['MYR', 'USD', 'SGD']);
  const [selectedCurrencyIndex, setSelectedCurrencyIndex] = useState(-1);
  const [recommendedPriceRange, setRecommendedPriceRange] = useState({
    min: 0,
    max: 0,
    average: 0
  });

  // Form data for buy listing
  const initialFAQs = sourceFAQs.map(faq => ({
    id: faq.id.toString(),
    question: faq.question,
    answer: ''
  }));

  const [formData, setFormData] = useState<BuyFormData>({
    generatedTitle: sourceTitle,
    generatedDescription: `Looking to buy: ${sourceTitle}`,
    generatedImages: [],
    minPrice: sourcePrice.toString(),
    maxPrice: sourcePrice.toString(),
    currency: 'MYR',
    location: '',
    quantity: '1',
    shippingOptions: [],
    faqs: initialFAQs,
    tags: []
  });

  const [selectedImageIndex, setSelectedImageIndex] = useState(0);

  const steps = [
    { number: 1, label: 'Source Info', icon: Info },
    { number: 2, label: 'Pricing & Shipping', icon: DollarSign },
    { number: 3, label: 'Answer Questions', icon: MessageCircle },
    { number: 4, label: 'Preview', icon: Eye }
  ];

  // Update FAQs when modal opens
  useEffect(() => {
    if (isOpen && sourceFAQs.length > 0) {
      const prefilledFAQs = sourceFAQs.map(faq => ({
        id: faq.id,
        question: faq.question,
        answer: ''
      }));
      setFormData((prev) => ({
        ...prev,
        faqs: prefilledFAQs
      }));
    }
  }, [isOpen, sourceFAQs]);

  const fetchPriceRecommendation = async () => {
    await new Promise(resolve => setTimeout(resolve, 1000));
    const derivedRange = {
      min: Math.max(0, sourcePrice * 0.8),
      max: sourcePrice * 1.2,
      average: sourcePrice
    };
    setRecommendedPriceRange(derivedRange);
  };

  const handleNext = () => {
    if (currentStep < 4) {
      const nextStep = currentStep + 1;
      if (nextStep === 2 && !recommendedPriceRange.average) {
        fetchPriceRecommendation();
      }
      setCurrentStep(nextStep);
    }
  };

  const handleBack = () => {
    if (currentStep > 1) {
      setCurrentStep(currentStep - 1);
    }
  };

  const handleSubmit = async () => {
    const listingId = generateListingId();
    const newListing = convertFormToListing(formData, 'buy', listingId, category);
    addNewListing(newListing);

    console.log('🎯 Auto-matching buy offer with source listing:', sourceListingId);

    // Show success dialog
    setShowSuccessDialog(true);
  };

  const handleSuccessClose = () => {
    // Reset form and close
    setFormData({
      generatedTitle: sourceTitle,
      generatedDescription: `Looking to buy: ${sourceTitle}`,
      generatedImages: [],
      minPrice: sourcePrice.toString(),
      maxPrice: sourcePrice.toString(),
      currency: 'MYR',
      location: '',
      quantity: '1',
      shippingOptions: [],
      faqs: initialFAQs,
      tags: []
    });
    setCurrentStep(1);
    setShowSuccessDialog(false);
    onClose();
  };

  const hasAnyInput = () => {
    return formData.generatedTitle.length > 0 ||
           formData.generatedDescription.length > 0;
  };

  const isStepValid = () => {
    switch(currentStep) {
      case 1:
        return true; // Source info is read-only
      case 2:
        return formData.minPrice &&
               formData.maxPrice &&
               parseFloat(formData.minPrice) <= parseFloat(formData.maxPrice) &&
               formData.location.length > 0 &&
               formData.shippingOptions.length > 0 &&
               formData.quantity &&
               parseInt(formData.quantity) > 0;
      case 3:
      case 4:
        return true;
      default:
        return false;
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4">
      <div className="relative w-full max-w-5xl max-h-[90vh] bg-white rounded-lg shadow-2xl flex flex-col border border-neutral-200">
        {/* Header */}
        <div className="flex-shrink-0 border-b shadow-sm rounded-t-lg bg-[var(--color-primary-200)]">
          <div className="px-4 py-4">
            <div className="flex items-center justify-between mb-4">
              <div className="text-center flex-1">
                <h1 className="font-semibold text-lg text-[var(--color-accent-700)]">
                  Make a Buy Offer
                </h1>
                <p className="text-sm text-[var(--color-primary-900)]">
                  Offer to buy: {sourceTitle}
                </p>
              </div>
              <button
                onClick={onClose}
                className="absolute right-5 top-4 text-[var(--color-primary-700)] hover:text-[var(--color-primary-900)] transition-colors p-1"
              >
                <X className="w-6 h-6" />
              </button>
            </div>

            {/* Progress Bar */}
            <div className="px-4 pb-2">
              <div className="flex items-center justify-between">
                {steps.map((step, index) => {
                  const Icon = step.icon;
                  return (
                    <React.Fragment key={step.number}>
                      <div className="flex flex-col items-center">
                        <div
                          className={`w-10 h-10 rounded-full flex items-center justify-center font-semibold transition-all ${
                            currentStep > step.number
                              ? 'bg-[var(--color-secondary-500)] text-white'
                              : currentStep === step.number
                              ? 'bg-[var(--color-secondary-500)] text-white scale-110 shadow-lg'
                              : 'bg-gray-200 text-gray-500'
                          }`}
                        >
                          {currentStep > step.number ? (
                            <Check className="w-5 h-5" />
                          ) : (
                            <Icon className="w-5 h-5" />
                          )}
                        </div>
                        <span
                          className={`text-xs mt-2 font-medium whitespace-nowrap ${
                            currentStep === step.number
                              ? 'text-[var(--color-accent-700)]'
                              : 'text-[var(--color-primary-700)]'
                          }`}
                        >
                          {step.label}
                        </span>
                      </div>
                      {index < steps.length - 1 && (
                        <div
                          className={`flex-1 h-1 mx-3 rounded transition-all ${
                            currentStep > step.number
                              ? 'bg-[var(--color-secondary-500)]'
                              : 'bg-gray-200'
                          }`}
                        />
                      )}
                    </React.Fragment>
                  );
                })}
              </div>
            </div>
          </div>
        </div>

        {/* Content */}
        <div key={currentStep} className="flex-1 overflow-y-auto p-6">
          <div className="max-w-3xl mx-auto">
            {/* Step 1: Source Info */}
            {currentStep === 1 && (
              <SourceListingInfoStep
                sourceTitle={sourceTitle}
                sourceDescription={sourceDescription}
                sourceImages={sourceImages}
                sourceOwnershipProof={sourceOwnershipProof}
                sourceTags={sourceTags}
              />
            )}

            {/* Step 2: Pricing & Shipping */}
            {currentStep === 2 && (
              <PricingShippingStep
                listingType="buy"
                formData={formData}
                setFormData={setFormData}
                recommendedPriceRange={recommendedPriceRange}
                showLocationDropdown={showLocationDropdown}
                setShowLocationDropdown={setShowLocationDropdown}
                filteredLocations={filteredLocations}
                setFilteredLocations={setFilteredLocations}
                selectedLocationIndex={selectedLocationIndex}
                setSelectedLocationIndex={setSelectedLocationIndex}
                showCurrencyDropdown={showCurrencyDropdown}
                setShowCurrencyDropdown={setShowCurrencyDropdown}
                filteredCurrencies={filteredCurrencies}
                setFilteredCurrencies={setFilteredCurrencies}
                selectedCurrencyIndex={selectedCurrencyIndex}
                setSelectedCurrencyIndex={setSelectedCurrencyIndex}
              />
            )}

            {/* Step 3: FAQs */}
            {currentStep === 3 && (
              <FAQsStep
                listingType="buy"
                faqs={formData.faqs}
                onFAQsChange={(faqs) => setFormData((prev) => ({ ...prev, faqs }))}
                mockFAQData={MOCK_FAQ_BUY}
                hasAnyInput={hasAnyInput()}
                answerOnlyMode={true}
                questionOnlyMode={false}
              />
            )}

            {/* Step 4: Preview */}
            {currentStep === 4 && (
              <PreviewStep
                listingType="buy"
                formData={formData}
                selectedImageIndex={selectedImageIndex}
                setSelectedImageIndex={setSelectedImageIndex}
                onEditStep={setCurrentStep}
              />
            )}

            {/* Navigation Buttons */}
            <div className="flex justify-between items-center mt-8 pt-6 border-t">
              <Button
                variant="outline"
                onClick={handleBack}
                disabled={currentStep === 1}
                className="px-6"
              >
                <ChevronLeft className="w-4 h-4 mr-2" />
                Back
              </Button>

              {currentStep < 4 ? (
                <Button
                  onClick={handleNext}
                  disabled={!isStepValid()}
                  className="px-6 text-black bg-[var(--color-secondary-500)] hover:bg-[var(--color-secondary-600)]"
                >
                  Continue
                  <ChevronRight className="w-4 h-4 ml-2" />
                </Button>
              ) : (
                <Button
                  onClick={handleSubmit}
                  disabled={!isStepValid()}
                  className="px-8 bg-green-600 hover:bg-green-700 text-white font-semibold"
                >
                  <Check className="w-5 h-5 mr-2" />
                  Submit Buy Offer
                </Button>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Success Dialog */}
      {showSuccessDialog && (
        <div className="fixed inset-0 z-[60] flex items-center justify-center bg-black/70 backdrop-blur-sm">
          <div className="bg-white rounded-lg shadow-2xl p-8 max-w-md mx-4 text-center">
            <div className="flex justify-center mb-4">
              <div className="w-16 h-16 rounded-full bg-green-100 flex items-center justify-center">
                <Check className="w-10 h-10 text-green-600" />
              </div>
            </div>
            <h2 className="text-2xl font-bold text-gray-900 mb-2">Success!</h2>
            <p className="text-gray-600 mb-6">Your Buy Listing has been created!</p>
            <Button
              onClick={handleSuccessClose}
              className="w-full bg-[var(--color-secondary-500)] hover:bg-[var(--color-secondary-600)] text-white"
            >
              Close
            </Button>
          </div>
        </div>
      )}
    </div>
  );
}
