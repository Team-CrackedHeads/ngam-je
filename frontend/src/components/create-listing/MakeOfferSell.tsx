'use client';

import React, { useState, useRef, useCallback, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { X, ChevronRight, ChevronLeft, Check, DollarSign, Eye, Info, MessageCircle } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { addNewListing, generateListingId, convertFormToListing } from '@/utils/listing-storage';
import ProductDetailsStep from './steps/ProductDetailsStep';
import PricingShippingStep from './steps/PricingShippingStep';
import FAQsStep from './steps/FAQsStep';
import PreviewStep from './steps/PreviewStep';
import { TagGeneratorRef } from '@/components/create-listing/tag-generator';
import {
  MOCK_LOCATION,
  MOCK_PRICE_HISTORY,
  MOCK_GENERATED_TITLE_SELL,
  MOCK_GENERATED_DESCRIPTION_SELL,
  MOCK_GENERATED_IMAGES_SELL,
  MOCK_OWNERSHIP_PROOF_IMAGE_SELL,
  MOCK_FAQ_SELL
} from '@/utils/mock-all-data-used';
import { verifyOwnershipProofWithAI } from '@/components/create-listing/ai-photo';

interface MakeOfferSellProps {
  isOpen: boolean;
  onClose: () => void;
  sourceListingId: string;
  sourceTitle: string;
  sourcePrice: number;
  category: string;
  sourceFAQs?: { id: string; question: string; answer: string }[];
}

export default function MakeOfferSell({
  isOpen,
  onClose,
  sourceListingId,
  sourceTitle,
  sourcePrice,
  category,
  sourceFAQs = []
}: MakeOfferSellProps) {
  const router = useRouter();
  const [currentStep, setCurrentStep] = useState(1);
  const [showSuccessDialog, setShowSuccessDialog] = useState(false);
  const tagGeneratorRef = useRef<TagGeneratorRef | null>(null);

  // AI generation states
  const [isGeneratingTitle, setIsGeneratingTitle] = useState(false);
  const [isGeneratingDescription, setIsGeneratingDescription] = useState(false);
  const [isGeneratingPhotos, setIsGeneratingPhotos] = useState(false);
  const [isGeneratingAll, setIsGeneratingAll] = useState(false);
  const [isAIModeEnabled, setIsAIModeEnabled] = useState(false);
  const [titleSuggestion, setTitleSuggestion] = useState('');
  const [descriptionSuggestion, setDescriptionSuggestion] = useState('');
  const [selectedImageIndex, setSelectedImageIndex] = useState(0);
  const titleTimeoutRef = useRef<NodeJS.Timeout | null>(null);
  const descriptionTimeoutRef = useRef<NodeJS.Timeout | null>(null);

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

  // Sell-specific states
  const [isVerifyingOwnership, setIsVerifyingOwnership] = useState(false);
  const [ownershipVerified, setOwnershipVerified] = useState<boolean | null>(null);

  // Form data for sell listing
  const initialFAQs = sourceFAQs.map(faq => ({
    id: faq.id,
    question: faq.question,
    answer: ''
  }));

  const [formData, setFormData] = useState<any>({
    uploadedImages: [],
    ownershipProofImage: null,
    generatedTitle: sourceTitle,
    generatedDescription: '',
    minPrice: sourcePrice.toString(),
    maxPrice: sourcePrice.toString(),
    currency: 'MYR',
    location: '',
    shippingOptions: [],
    inventoryQuantity: '1',
    tags: [],
    faqs: initialFAQs
  });

  const steps = [
    { number: 1, label: 'Product Details', icon: Info },
    { number: 2, label: 'Pricing & Shipping', icon: DollarSign },
    { number: 3, label: 'Create Questions', icon: MessageCircle },
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
      setFormData((prev: any) => ({
        ...prev,
        faqs: prefilledFAQs
      }));
    }
  }, [isOpen, sourceFAQs]);

  // AI Generation functions
  const generateTitleWithAI = async () => {
    setIsGeneratingTitle(true);
    await new Promise(resolve => setTimeout(resolve, 1500));
    setFormData((prev: any) => ({
      ...prev,
      generatedTitle: MOCK_GENERATED_TITLE_SELL
    }));
    setIsGeneratingTitle(false);
  };

  const generateDescriptionWithAI = async () => {
    setIsGeneratingDescription(true);
    await new Promise(resolve => setTimeout(resolve, 1500));
    setFormData((prev: any) => ({
      ...prev,
      generatedDescription: MOCK_GENERATED_DESCRIPTION_SELL
    }));
    setIsGeneratingDescription(false);
  };

  const generatePhotosWithAI = async () => {
    setIsGeneratingPhotos(true);
    await new Promise(resolve => setTimeout(resolve, 2000));
    setFormData((prev: any) => ({
      ...prev,
      uploadedImages: MOCK_GENERATED_IMAGES_SELL
    }));
    setIsGeneratingPhotos(false);
  };

  const generateAllWithAI = async () => {
    setIsGeneratingAll(true);
    await Promise.all([
      generateTitleWithAI(),
      generateDescriptionWithAI(),
      generatePhotosWithAI()
    ]);

    if (tagGeneratorRef.current) {
      await tagGeneratorRef.current.generateTags();
    }
    setIsGeneratingAll(false);
  };

  const handleTitleChange = useCallback((text: string) => {
    setFormData((prev: any) => ({ ...prev, generatedTitle: text }));

    if (titleTimeoutRef.current) clearTimeout(titleTimeoutRef.current);

    if (text.length >= 3) {
      titleTimeoutRef.current = setTimeout(() => {
        setTitleSuggestion(MOCK_GENERATED_TITLE_SELL);
      }, 1000);
    } else {
      setTitleSuggestion('');
    }
  }, []);

  const handleDescriptionChange = useCallback((text: string) => {
    setFormData((prev: any) => ({ ...prev, generatedDescription: text }));

    if (descriptionTimeoutRef.current) clearTimeout(descriptionTimeoutRef.current);

    if (text.length >= 10) {
      descriptionTimeoutRef.current = setTimeout(() => {
        setDescriptionSuggestion(MOCK_GENERATED_DESCRIPTION_SELL);
      }, 1000);
    } else {
      setDescriptionSuggestion('');
    }
  }, []);

  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files) return;

    const newImageUrls: string[] = [];
    Array.from(files).forEach((file) => {
      const reader = new FileReader();
      reader.onloadend = () => {
        newImageUrls.push(reader.result as string);
        if (newImageUrls.length === files.length) {
          setFormData((prev: any) => ({
            ...prev,
            uploadedImages: [...prev.uploadedImages, ...newImageUrls]
          }));
        }
      };
      reader.readAsDataURL(file);
    });
  };

  const handleRemoveImage = (index: number) => {
    setFormData((prev: any) => ({
      ...prev,
      uploadedImages: prev.uploadedImages.filter((_: any, i: number) => i !== index)
    }));
    if (selectedImageIndex >= formData.uploadedImages.length - 1) {
      setSelectedImageIndex(Math.max(0, formData.uploadedImages.length - 2));
    }
  };

  const handleOwnershipProofUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onloadend = async () => {
      const imageUrl = reader.result as string;
      setFormData((prev: any) => ({
        ...prev,
        ownershipProofImage: imageUrl
      }));

      setIsVerifyingOwnership(true);
      const isVerified = await verifyOwnershipProofWithAI(imageUrl);
      setOwnershipVerified(isVerified);
      setIsVerifyingOwnership(false);
    };
    reader.readAsDataURL(file);
  };

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
    const newListing = convertFormToListing(formData, 'sell', listingId, category);
    addNewListing(newListing);

    console.log('🎯 Auto-matching sell offer with source listing:', sourceListingId);

    // Show success dialog
    setShowSuccessDialog(true);
  };

  const handleSuccessClose = () => {
    // Reset form and close
    setFormData({
      uploadedImages: [],
      ownershipProofImage: null,
      generatedTitle: sourceTitle,
      generatedDescription: '',
      minPrice: sourcePrice.toString(),
      maxPrice: sourcePrice.toString(),
      currency: 'MYR',
      location: '',
      shippingOptions: [],
      inventoryQuantity: '1',
      tags: [],
      faqs: initialFAQs
    });
    setCurrentStep(1);
    setShowSuccessDialog(false);
    onClose();
  };

  const hasAnyInput = () => {
    return formData.generatedTitle.length > 0 ||
           formData.generatedDescription.length > 0 ||
           formData.uploadedImages.length > 0;
  };

  const isStepValid = () => {
    switch(currentStep) {
      case 1:
        return formData.generatedTitle.length >= 3 &&
               formData.generatedDescription.length >= 10 &&
               formData.uploadedImages.length > 0 &&
               formData.ownershipProofImage !== null;
      case 2:
        return formData.minPrice &&
               formData.maxPrice &&
               parseFloat(formData.minPrice) <= parseFloat(formData.maxPrice) &&
               formData.location.length > 0 &&
               formData.shippingOptions.length > 0 &&
               formData.inventoryQuantity &&
               parseInt(formData.inventoryQuantity) > 0;
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
                  Make a Sell Offer
                </h1>
                <p className="text-sm text-[var(--color-primary-900)]">
                  Offer to sell for: {sourceTitle}
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
            <div className="flex items-center px-6 pb-2">
              {steps.map((step, index) => (
                <React.Fragment key={step.number}>
                  <div className="flex flex-col items-center min-w-0">
                    <div
                      className={`w-10 h-10 rounded-full flex items-center justify-center font-semibold transition-all ${
                        currentStep === step.number
                          ? 'bg-[var(--color-secondary-500)] text-white shadow-lg scale-110'
                          : currentStep > step.number
                          ? 'bg-[var(--color-secondary-500)] text-white'
                          : 'bg-gray-200 text-gray-500'
                      }`}
                    >
                      {currentStep > step.number ? (
                        <Check className="w-5 h-5" />
                      ) : (
                        <step.icon className="w-5 h-5" />
                      )}
                    </div>
                    <span
                      className={`text-xs mt-2 font-medium hidden sm:block text-center whitespace-nowrap ${
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
                      className={`h-1 flex-1 mx-3 rounded transition-all ${
                        currentStep > step.number
                          ? 'bg-[var(--color-secondary-500)]'
                          : 'bg-gray-200'
                      }`}
                    />
                  )}
                </React.Fragment>
              ))}
            </div>
          </div>
        </div>

        {/* Content */}
        <div key={currentStep} className="flex-1 overflow-y-auto p-6">
          <div className="max-w-3xl mx-auto">
            {/* Step 1: Product Details */}
            {currentStep === 1 && (
              <ProductDetailsStep
                listingType="sell"
                formData={formData}
                setFormData={setFormData}
                isAIModeEnabled={isAIModeEnabled}
                setIsAIModeEnabled={setIsAIModeEnabled}
                isGeneratingTitle={isGeneratingTitle}
                isGeneratingDescription={isGeneratingDescription}
                isGeneratingPhotos={isGeneratingPhotos}
                isGeneratingAll={isGeneratingAll}
                titleSuggestion={titleSuggestion}
                descriptionSuggestion={descriptionSuggestion}
                selectedImageIndex={selectedImageIndex}
                setSelectedImageIndex={setSelectedImageIndex}
                onGenerateTitle={generateTitleWithAI}
                onGenerateDescription={generateDescriptionWithAI}
                onGeneratePhotos={generatePhotosWithAI}
                onGenerateAll={generateAllWithAI}
                onTitleChange={handleTitleChange}
                onDescriptionChange={handleDescriptionChange}
                onImageUpload={handleImageUpload}
                onRemoveImage={handleRemoveImage}
                onOwnershipProofUpload={handleOwnershipProofUpload}
                ownershipProofImage={formData.ownershipProofImage}
                isVerifyingOwnership={isVerifyingOwnership}
                ownershipVerified={ownershipVerified}
                tagGeneratorRef={tagGeneratorRef}
              />
            )}

            {/* Step 2: Pricing & Shipping */}
            {currentStep === 2 && (
              <PricingShippingStep
                listingType="sell"
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
                listingType="sell"
                faqs={formData.faqs}
                onFAQsChange={(faqs) => setFormData((prev: any) => ({ ...prev, faqs }))}
                mockFAQData={MOCK_FAQ_SELL}
                hasAnyInput={hasAnyInput()}
                answerOnlyMode={false}
                questionOnlyMode={true}
              />
            )}

            {/* Step 4: Preview */}
            {currentStep === 4 && (
              <PreviewStep
                listingType="sell"
                formData={formData}
                selectedImageIndex={selectedImageIndex}
                setSelectedImageIndex={setSelectedImageIndex}
                onEditStep={setCurrentStep}
                ownershipVerified={ownershipVerified}
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
                  Submit Sell Offer
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
            <p className="text-gray-600 mb-6">Your Sell Listing has been created!</p>
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
