'use client';

import React, { useState, useRef, useCallback, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { X, ChevronRight, ChevronLeft, Check, DollarSign, Eye, Sparkles, MessageCircle } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { addNewListing, generateListingId, convertFormToListing } from '@/utils/listing-storage';
import AIGenerateStep from './steps/AIGenerateStep';
import PricingShippingStep from './steps/PricingShippingStep';
import FAQsStep from './steps/FAQsStep';
import PreviewStep from './steps/PreviewStep';
import { TagGeneratorRef } from '@/components/create-listing/tag-generator';
import { MOCK_LOCATION } from '@/utils/mock-location-data';
import { MOCK_PRICE_HISTORY } from '@/utils/mock-price-chart-data';
import { MOCK_GENERATED_TITLE_BUY, MOCK_GENERATED_DESCRIPTION_BUY, MOCK_GENERATED_IMAGES_BUY } from '@/utils/mock-buy-listing-data';
import { MOCK_GENERATED_TITLE_SELL, MOCK_GENERATED_DESCRIPTION_SELL, MOCK_GENERATED_IMAGES_SELL, MOCK_OWNERSHIP_PROOF_IMAGE_SELL } from '@/utils/mock-sell-listing-data';
import { verifyOwnershipProofWithAI } from '@/components/create-listing/ai-photo';
import { MOCK_FAQ_BUY } from '@/utils/mock-faq-buy';
import { MOCK_FAQ_SELL } from '@/utils/mock-faq-sell';

interface MakeOfferModalProps {
  isOpen: boolean;
  onClose: () => void;
  sourceListingId: string;
  sourceTitle: string;
  sourcePrice: number;
  sourceListingType: "sale" | "wanted";
  category: string;
  sourceFAQs?: { id: string; question: string; answer: string }[];
}

export default function MakeOfferModal({
  isOpen,
  onClose,
  sourceListingId,
  sourceTitle,
  sourcePrice,
  sourceListingType,
  category,
  sourceFAQs = []
}: MakeOfferModalProps) {
  const router = useRouter();
  const [currentStep, setCurrentStep] = useState(1);
  const tagGeneratorRef = useRef<TagGeneratorRef | null>(null);

  // Determine the offer type (opposite of source)
  const listingType = sourceListingType === "wanted" ? "sell" : "buy";

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

  // Form data - using the same structure as CreateListingModal
  // Pre-fill FAQs if source listing has questions (regardless of WTB or WTS)
  // The offer maker needs to answer the original poster's questions
  const initialFAQs = sourceFAQs.map(faq => ({
    id: faq.id,
    question: faq.question,
    answer: '' // Empty answer for the offer maker to fill
  }));

  const [formData, setFormData] = useState<any>(
    listingType === 'buy'
      ? {
          generatedTitle: sourceTitle,
          generatedDescription: '',
          generatedImages: [],
          minPrice: sourcePrice.toString(),
          maxPrice: sourcePrice.toString(),
          currency: 'MYR',
          location: '',
          quantity: '1',
          shippingOptions: [],
          faqs: initialFAQs,
          tags: []
        }
      : {
          uploadedImages: [],
          ownershipProofImage: MOCK_OWNERSHIP_PROOF_IMAGE_SELL,
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
        }
  );

  const steps = [
    { number: 1, label: 'Details', icon: Sparkles },
    { number: 2, label: 'Pricing & Shipping', icon: DollarSign },
    { number: 3, label: 'FAQs', icon: MessageCircle },
    { number: 4, label: 'Preview', icon: Eye }
  ];

  // Update FAQs when modal opens or source FAQs change
  useEffect(() => {
    if (isOpen && sourceFAQs.length > 0) {
      const prefilledFAQs = sourceFAQs.map(faq => ({
        id: faq.id,
        question: faq.question,
        answer: '' // Empty answer for the offer maker to fill
      }));
      setFormData((prev: any) => ({
        ...prev,
        faqs: prefilledFAQs
      }));
    }
  }, [isOpen, sourceFAQs]);

  // AI Generation functions (same as CreateListingModal)
  const generateTitleWithAI = async () => {
    setIsGeneratingTitle(true);
    await new Promise(resolve => setTimeout(resolve, 1500));
    setFormData((prev: any) => ({
      ...prev,
      generatedTitle: listingType === 'buy' ? MOCK_GENERATED_TITLE_BUY : MOCK_GENERATED_TITLE_SELL
    }));
    setIsGeneratingTitle(false);
  };

  const generateDescriptionWithAI = async () => {
    setIsGeneratingDescription(true);
    await new Promise(resolve => setTimeout(resolve, 2000));
    setFormData((prev: any) => ({
      ...prev,
      generatedDescription: listingType === 'buy' ? MOCK_GENERATED_DESCRIPTION_BUY : MOCK_GENERATED_DESCRIPTION_SELL
    }));
    setIsGeneratingDescription(false);
  };

  const generatePhotosWithAI = async () => {
    setIsGeneratingPhotos(true);
    await new Promise(resolve => setTimeout(resolve, 2000));
    const images = listingType === 'buy' ? MOCK_GENERATED_IMAGES_BUY : MOCK_GENERATED_IMAGES_SELL;
    setFormData((prev: any) => ({
      ...prev,
      [listingType === 'buy' ? 'generatedImages' : 'uploadedImages']: [
        ...(prev[listingType === 'buy' ? 'generatedImages' : 'uploadedImages'] || []),
        ...images
      ]
    }));
    setIsGeneratingPhotos(false);
  };

  const generateAllWithAI = async () => {
    setIsGeneratingAll(true);
    await generatePhotosWithAI();
    await generateTitleWithAI();
    await generateDescriptionWithAI();
    await tagGeneratorRef.current?.generateTags();
    setIsGeneratingAll(false);
  };

  const generateTitleSuggestion = useCallback((currentText: string) => {
    if (titleTimeoutRef.current) {
      clearTimeout(titleTimeoutRef.current);
    }
    if (!isAIModeEnabled || currentText.length < 3) {
      setTitleSuggestion('');
      return;
    }
    titleTimeoutRef.current = setTimeout(() => {
      const fullSuggestion = listingType === 'buy' ? MOCK_GENERATED_TITLE_BUY : MOCK_GENERATED_TITLE_SELL;
      const lowerCurrent = currentText.toLowerCase();
      const lowerSuggestion = fullSuggestion.toLowerCase();
      if (lowerSuggestion.startsWith(lowerCurrent)) {
        setTitleSuggestion(fullSuggestion.slice(currentText.length));
      } else {
        setTitleSuggestion('');
      }
    }, 300);
  }, [isAIModeEnabled, listingType]);

  const generateDescriptionSuggestion = useCallback((currentText: string) => {
    if (descriptionTimeoutRef.current) {
      clearTimeout(descriptionTimeoutRef.current);
    }
    if (!isAIModeEnabled || currentText.length < 3) {
      setDescriptionSuggestion('');
      return;
    }
    descriptionTimeoutRef.current = setTimeout(() => {
      const fullSuggestion = listingType === 'buy' ? MOCK_GENERATED_DESCRIPTION_BUY : MOCK_GENERATED_DESCRIPTION_SELL;
      const lowerCurrent = currentText.toLowerCase();
      const lowerSuggestion = fullSuggestion.toLowerCase();
      if (lowerSuggestion.startsWith(lowerCurrent)) {
        setDescriptionSuggestion(fullSuggestion.slice(currentText.length));
      } else {
        setDescriptionSuggestion('');
      }
    }, 300);
  }, [isAIModeEnabled, listingType]);

  // Image handling
  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (files) {
      if (listingType === 'buy') {
        const newImages: string[] = [];
        Array.from(files).forEach(file => {
          const reader = new FileReader();
          reader.onloadend = () => {
            newImages.push(reader.result as string);
            if (newImages.length === files.length) {
              setFormData((prev: any) => ({
                ...prev,
                generatedImages: [...prev.generatedImages, ...newImages]
              }));
            }
          };
          reader.readAsDataURL(file);
        });
      } else {
        const newImages = Array.from(files).slice(0, 5 - formData.uploadedImages.length).map((file) => {
          return URL.createObjectURL(file);
        });
        setFormData((prev: any) => ({
          ...prev,
          uploadedImages: [...prev.uploadedImages, ...newImages]
        }));
      }
    }
  };

  const removeImage = (index: number) => {
    const imageKey = listingType === 'buy' ? 'generatedImages' : 'uploadedImages';
    setFormData((prev: any) => ({
      ...prev,
      [imageKey]: prev[imageKey].filter((_: any, i: number) => i !== index)
    }));
    if (selectedImageIndex >= formData[imageKey].length - 1) {
      setSelectedImageIndex(Math.max(0, formData[imageKey].length - 2));
    }
  };

  // Ownership proof handling (sell only)
  const handleVerifyOwnershipProof = async (imageUrl: string) => {
    setIsVerifyingOwnership(true);
    setOwnershipVerified(null);
    const isVerified = await verifyOwnershipProofWithAI(imageUrl);
    setOwnershipVerified(isVerified);
    setIsVerifyingOwnership(false);
  };

  const handleOwnershipProofUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const imageUrl = URL.createObjectURL(file);
      setFormData((prev: any) => ({ ...prev, ownershipProofImage: imageUrl }));
      handleVerifyOwnershipProof(imageUrl);
    }
  };

  const fetchPriceRecommendation = async () => {
    await new Promise(resolve => setTimeout(resolve, 400));
    const prices = MOCK_PRICE_HISTORY.map((point) => point.price);
    if (!prices.length) {
      setRecommendedPriceRange({ min: 0, max: 0, average: 0 });
      return;
    }
    const averagePrice = prices.reduce((sum, price) => sum + price, 0) / prices.length;
    const lowestPrice = Math.min(...prices);
    const highestPrice = Math.max(...prices);
    const padding = Math.max(averagePrice * 0.1, 5);
    setRecommendedPriceRange({
      min: Number(Math.max(0, Math.min(lowestPrice, averagePrice - padding)).toFixed(2)),
      average: Number(averagePrice.toFixed(2)),
      max: Number(Math.max(highestPrice, averagePrice + padding).toFixed(2)),
    });
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
    // Convert form data to listing format
    const listing = convertFormToListing(formData, listingType, category);
    const listingId = generateListingId(listing.category);
    const completeListing = { ...listing, id: listingId };

    // Add to storage
    addNewListing(completeListing);

    // TODO: API Integration - Auto-match with source listing
    console.log('🎯 Auto-matching offer with source listing:', sourceListingId);
    // await createAutoMatch({
    //   sourceListingId,
    //   newListingId: listingId,
    //   matchScore: 100,
    //   matchQuality: "excellent",
    //   status: "new"
    // });

    // TODO: Notify original poster
    // await sendMatchNotification(sourceListingId);

    handleClose();
    router.push(`/threads/${category}/${listingId}`);
  };

  const handleClose = () => {
    setCurrentStep(1);
    setIsAIModeEnabled(false);
    setTitleSuggestion('');
    setDescriptionSuggestion('');
    setSelectedImageIndex(0);
    setRecommendedPriceRange({ min: 0, max: 0, average: 0 });
    onClose();
  };

  const hasAnyInput = () => {
    if (listingType === 'buy') {
      return formData.generatedTitle.length > 0 ||
             formData.generatedDescription.length > 0 ||
             formData.generatedImages.length > 0;
    } else {
      return formData.generatedTitle.length > 0 ||
             formData.generatedDescription.length > 0 ||
             formData.uploadedImages.length > 0;
    }
  };

  const isStepValid = () => {
    const images = listingType === 'buy' ? formData.generatedImages : formData.uploadedImages;
    switch(currentStep) {
      case 1:
        return formData.generatedTitle.length >= 3 &&
               formData.generatedDescription.length >= 10 &&
               images.length > 0 &&
               (listingType === 'buy' || formData.ownershipProofImage !== null);
      case 2:
        return formData.minPrice &&
               formData.maxPrice &&
               parseFloat(formData.minPrice) <= parseFloat(formData.maxPrice) &&
               formData.location.length > 0 &&
               formData.shippingOptions.length > 0 &&
               (listingType === 'buy' ? formData.quantity : formData.inventoryQuantity) &&
               parseInt(listingType === 'buy' ? formData.quantity : formData.inventoryQuantity) > 0;
      case 3:
        return true;
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
                  Make an Offer
                </h1>
                <p className="text-sm text-[var(--color-primary-900)]">
                  {listingType === 'sell' ? 'Creating a sell listing' : 'Creating a buy listing'}
                </p>
              </div>
              <Button variant="ghost" size="icon" onClick={handleClose}>
                <X className="w-5 h-5 text-[var(--color-accent-700)]" />
              </Button>
            </div>

            {/* Progress Steps */}
            <div className="hidden sm:flex items-center justify-between">
              {steps.map((step, index) => {
                const Icon = step.icon;
                return (
                  <React.Fragment key={step.number}>
                    <div className="flex flex-col items-center">
                      <div
                        className={`w-10 h-10 rounded-full flex items-center justify-center font-semibold text-sm transition-all ${
                          currentStep > step.number
                            ? 'bg-[var(--color-secondary-500)] text-white'
                            : currentStep === step.number
                            ? 'bg-[var(--color-secondary-500)] text-white scale-110 shadow-md'
                            : 'bg-gray-200 text-gray-500'
                        }`}
                      >
                        {currentStep > step.number ? <Check className="w-5 h-5" /> : <Icon className="w-4 h-4" />}
                      </div>
                      <span
                        className={`text-xs mt-2 font-medium ${
                          currentStep === step.number
                            ? 'text-[var(--color-accent-700)]'
                            : 'text-[var(--color-primary-900)]'
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

        {/* Content */}
        <div key={currentStep} className="flex-1 overflow-y-auto p-6">
          <div className="max-w-3xl mx-auto">
            {/* Step 1: AI Generate (Details) */}
            {currentStep === 1 && (
                <AIGenerateStep
                  listingType={listingType}
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
                  onTitleChange={generateTitleSuggestion}
                  onDescriptionChange={generateDescriptionSuggestion}
                  onImageUpload={handleImageUpload}
                  onRemoveImage={removeImage}
                  onOwnershipProofUpload={listingType === 'sell' ? handleOwnershipProofUpload : undefined}
                  ownershipProofImage={listingType === 'sell' ? formData.ownershipProofImage : undefined}
                  isVerifyingOwnership={listingType === 'sell' ? isVerifyingOwnership : undefined}
                  ownershipVerified={listingType === 'sell' ? ownershipVerified : undefined}
                  tagGeneratorRef={tagGeneratorRef}
                />
            )}

            {/* Step 2: Pricing & Shipping */}
            {currentStep === 2 && (
              <PricingShippingStep
                listingType={listingType}
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
                listingType={listingType}
                faqs={formData.faqs}
                onFAQsChange={(faqs) => setFormData((prev: any) => ({ ...prev, faqs }))}
                mockFAQData={listingType === 'buy' ? MOCK_FAQ_BUY : MOCK_FAQ_SELL}
                hasAnyInput={hasAnyInput()}
                answerOnlyMode={sourceFAQs.length > 0}
              />
            )}

            {/* Step 4: Preview */}
            {currentStep === 4 && (
                <PreviewStep
                  listingType={listingType}
                  formData={formData}
                  selectedImageIndex={selectedImageIndex}
                  setSelectedImageIndex={setSelectedImageIndex}
                  onEditStep={setCurrentStep}
                  ownershipVerified={listingType === 'sell' ? ownershipVerified : undefined}
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
                  className="px-6 text-white bg-[var(--color-secondary-500)] hover:bg-[var(--color-secondary-600)]"
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
                  Publish {listingType === 'buy' ? 'Buy' : 'Sell'} Listing
                </Button>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
