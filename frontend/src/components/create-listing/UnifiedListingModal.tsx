'use client';

import React, { useState, useRef, useCallback, useEffect } from 'react';
import { Search, Upload, Sparkles, DollarSign, Eye, Check, ChevronLeft, ChevronRight, X, MessageCircle } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { MOCK_PRICE_HISTORY } from '@/utils/mock-price-chart-data';
import { FAQ } from '@/app/create-listing/faq-generator';
import { MOCK_FAQ_BUY } from '@/utils/mock-faq-buy';
import { MOCK_FAQ_SELL } from '@/utils/mock-faq-sell';
import { MOCK_GENERATED_TITLE_BUY, MOCK_GENERATED_DESCRIPTION_BUY, MOCK_GENERATED_IMAGES_BUY } from '@/utils/mock-buy-listing-data';
import { MOCK_GENERATED_TITLE_SELL, MOCK_GENERATED_DESCRIPTION_SELL, MOCK_GENERATED_IMAGES_SELL, MOCK_OWNERSHIP_PROOF_IMAGE_SELL } from '@/utils/mock-sell-listing-data';
import { TagGeneratorRef } from '@/app/create-listing/tag-generator';
import { MOCK_RECOMMENDED_PRICE_RANGE } from '@/utils/mock-price-rec-data';
import { MOCK_LOCATION } from '@/utils/mock-location-data';
import { verifyOwnershipProofWithAI } from '@/app/create-listing/ai-photo';
import AIGenerateStep from './steps/AIGenerateStep';
import PricingShippingStep from './steps/PricingShippingStep';
import FAQsStep from './steps/FAQsStep';
import PreviewStep from './steps/PreviewStep';

interface BuyFormData {
  generatedTitle: string;
  generatedDescription: string;
  generatedImages: string[];
  minPrice: string;
  maxPrice: string;
  currency: string;
  location: string;
  quantity: string;
  shippingOptions: string[];
  faqs: FAQ[];
  tags: string[];
}

interface SellFormData {
  uploadedImages: string[];
  ownershipProofImage: string | null;
  generatedTitle: string;
  generatedDescription: string;
  minPrice: string;
  maxPrice: string;
  currency: string;
  location: string;
  shippingOptions: string[];
  inventoryQuantity: string;
  tags: string[];
  faqs: FAQ[];
}

interface UnifiedListingModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmitBuy?: (data: BuyFormData) => void;
  onSubmitSell?: (data: SellFormData) => void;
}

type ListingType = null | 'buy' | 'sell';

export default function UnifiedListingModal({ isOpen, onClose, onSubmitBuy, onSubmitSell }: UnifiedListingModalProps) {
  const [currentStep, setCurrentStep] = useState(1);
  const [listingType, setListingType] = useState<ListingType>(null);

  // Common states
  const [isGeneratingTitle, setIsGeneratingTitle] = useState(false);
  const [isGeneratingDescription, setIsGeneratingDescription] = useState(false);
  const [isGeneratingPhotos, setIsGeneratingPhotos] = useState(false);
  const [selectedImageIndex, setSelectedImageIndex] = useState(0);
  const [isAIModeEnabled, setIsAIModeEnabled] = useState(false);
  const [isGeneratingAll, setIsGeneratingAll] = useState(false);
  const [titleSuggestion, setTitleSuggestion] = useState('');
  const [descriptionSuggestion, setDescriptionSuggestion] = useState('');
  const titleTimeoutRef = useRef<NodeJS.Timeout | null>(null);
  const descriptionTimeoutRef = useRef<NodeJS.Timeout | null>(null);
  const tagGeneratorRef = useRef<TagGeneratorRef>(null);
  const [showLocationDropdown, setShowLocationDropdown] = useState(false);
  const [filteredLocations, setFilteredLocations] = useState<string[]>(MOCK_LOCATION);
  const [selectedLocationIndex, setSelectedLocationIndex] = useState(-1);
  const [showCurrencyDropdown, setShowCurrencyDropdown] = useState(false);
  const [filteredCurrencies, setFilteredCurrencies] = useState<string[]>(['MYR', 'USD', 'SGD']);
  const [selectedCurrencyIndex, setSelectedCurrencyIndex] = useState(-1);

  // Sell-specific states
  const [isVerifyingOwnership, setIsVerifyingOwnership] = useState(false);
  const [ownershipVerified, setOwnershipVerified] = useState<boolean | null>(null);

  // Buy form data
  const [buyFormData, setBuyFormData] = useState<BuyFormData>({
    generatedTitle: '',
    generatedDescription: '',
    generatedImages: [],
    minPrice: '',
    maxPrice: '',
    currency: 'MYR',
    location: '',
    quantity: '1',
    shippingOptions: [],
    faqs: [],
    tags: []
  });

  // Sell form data
  const [sellFormData, setSellFormData] = useState<SellFormData>({
    uploadedImages: [],
    ownershipProofImage: MOCK_OWNERSHIP_PROOF_IMAGE_SELL,
    generatedTitle: '',
    generatedDescription: '',
    minPrice: '',
    maxPrice: '',
    currency: 'MYR',
    location: '',
    shippingOptions: [],
    inventoryQuantity: '',
    tags: [],
    faqs: []
  });

  const [recommendedPriceRange, setRecommendedPriceRange] = useState({
    min: 0,
    max: 0,
    average: 0
  });

  // Initialize ownership verification for sell mock data
  useEffect(() => {
    if (sellFormData.ownershipProofImage === MOCK_OWNERSHIP_PROOF_IMAGE_SELL && ownershipVerified === null) {
      setOwnershipVerified(true);
    }
  }, [sellFormData.ownershipProofImage, ownershipVerified]);

  const steps = listingType === null
    ? [{ number: 1, label: 'Choose Type', icon: Search }]
    : [
        { number: 1, label: 'Choose Type', icon: Search },
        { number: 2, label: 'AI Generate', icon: Sparkles },
        { number: 3, label: 'Pricing & Shipping', icon: DollarSign },
        { number: 4, label: 'FAQs', icon: MessageCircle },
        { number: 5, label: 'Preview', icon: Eye }
      ];

  const handleBuySelect = () => {
    setListingType('buy');
    setCurrentStep(2);
  };

  const handleSellSelect = () => {
    setListingType('sell');
    setCurrentStep(2);
  };

  const hasAnyInput = () => {
    if (listingType === 'buy') {
      return buyFormData.generatedTitle.length > 0 ||
             buyFormData.generatedDescription.length > 0 ||
             buyFormData.generatedImages.length > 0;
    } else if (listingType === 'sell') {
      return sellFormData.generatedTitle.length > 0 ||
             sellFormData.generatedDescription.length > 0 ||
             sellFormData.uploadedImages.length > 0;
    }
    return false;
  };

  // AI Generation functions
  const generateTitleWithAI = async () => {
    setIsGeneratingTitle(true);
    await new Promise(resolve => setTimeout(resolve, 1500));

    if (listingType === 'buy') {
      setBuyFormData(prev => ({ ...prev, generatedTitle: MOCK_GENERATED_TITLE_BUY }));
    } else {
      setSellFormData(prev => ({ ...prev, generatedTitle: MOCK_GENERATED_TITLE_SELL }));
    }

    setIsGeneratingTitle(false);
  };

  const generateDescriptionWithAI = async () => {
    setIsGeneratingDescription(true);
    await new Promise(resolve => setTimeout(resolve, 2000));

    if (listingType === 'buy') {
      setBuyFormData(prev => ({ ...prev, generatedDescription: MOCK_GENERATED_DESCRIPTION_BUY }));
    } else {
      setSellFormData(prev => ({ ...prev, generatedDescription: MOCK_GENERATED_DESCRIPTION_SELL }));
    }

    setIsGeneratingDescription(false);
  };

  const generatePhotosWithAI = async () => {
    setIsGeneratingPhotos(true);
    await new Promise(resolve => setTimeout(resolve, 2000));

    if (listingType === 'buy') {
      setBuyFormData(prev => ({ ...prev, generatedImages: [...prev.generatedImages, ...MOCK_GENERATED_IMAGES_BUY] }));
    } else {
      setSellFormData(prev => ({ ...prev, uploadedImages: [...prev.uploadedImages, ...MOCK_GENERATED_IMAGES_SELL] }));
    }

    setIsGeneratingPhotos(false);
  };

  const generateAllWithAI = async () => {
    setIsGeneratingAll(true);
    await generatePhotosWithAI();
    await generateTitleWithAI();
    await generateDescriptionWithAI();
    if (tagGeneratorRef.current) {
      await tagGeneratorRef.current.generateTags();
    }
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
              setBuyFormData(prev => ({
                ...prev,
                generatedImages: [...prev.generatedImages, ...newImages]
              }));
            }
          };
          reader.readAsDataURL(file);
        });
      } else {
        const newImages = Array.from(files).slice(0, 5 - sellFormData.uploadedImages.length).map((file) => {
          return URL.createObjectURL(file);
        });
        setSellFormData(prev => ({
          ...prev,
          uploadedImages: [...prev.uploadedImages, ...newImages]
        }));
      }
    }
  };

  const removeImage = (index: number) => {
    if (listingType === 'buy') {
      setBuyFormData(prev => ({
        ...prev,
        generatedImages: prev.generatedImages.filter((_, i) => i !== index)
      }));
      if (selectedImageIndex >= buyFormData.generatedImages.length - 1) {
        setSelectedImageIndex(Math.max(0, buyFormData.generatedImages.length - 2));
      }
    } else {
      setSellFormData(prev => ({
        ...prev,
        uploadedImages: prev.uploadedImages.filter((_, i) => i !== index)
      }));
      if (selectedImageIndex >= sellFormData.uploadedImages.length - 1) {
        setSelectedImageIndex(Math.max(0, sellFormData.uploadedImages.length - 2));
      }
    }
  };

  // Sell-specific: Ownership proof
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
      setSellFormData(prev => ({ ...prev, ownershipProofImage: imageUrl }));
      handleVerifyOwnershipProof(imageUrl);
    }
  };

  const fetchPriceRecommendation = async () => {
    await new Promise(resolve => setTimeout(resolve, 1000));
    setRecommendedPriceRange(MOCK_RECOMMENDED_PRICE_RANGE);
  };

  const handleNext = () => {
    if (currentStep < 5) {
      if (currentStep === 3) {
        if (!recommendedPriceRange.average) {
          fetchPriceRecommendation();
        }
      }
      setCurrentStep(currentStep + 1);
    }
  };

  const handleBack = () => {
    if (currentStep > 1) {
      setCurrentStep(currentStep - 1);
    }
  };

  const handleSubmit = async () => {
    if (listingType === 'buy' && onSubmitBuy) {
      onSubmitBuy(buyFormData);
    } else if (listingType === 'sell' && onSubmitSell) {
      onSubmitSell(sellFormData);
    }
    console.log(`${listingType} listing submitted:`, listingType === 'buy' ? buyFormData : sellFormData);
    alert(`${listingType === 'buy' ? 'Buy' : 'Sell'} listing created successfully!`);
    handleClose();
  };

  const handleClose = () => {
    setCurrentStep(1);
    setListingType(null);
    setBuyFormData({
      generatedTitle: '',
      generatedDescription: '',
      generatedImages: [],
      minPrice: '',
      maxPrice: '',
      currency: 'MYR',
      location: '',
      quantity: '1',
      shippingOptions: [],
      faqs: [],
      tags: []
    });
    setSellFormData({
      uploadedImages: [],
      ownershipProofImage: MOCK_OWNERSHIP_PROOF_IMAGE_SELL,
      generatedTitle: '',
      generatedDescription: '',
      minPrice: '',
      maxPrice: '',
      currency: 'MYR',
      location: '',
      shippingOptions: [],
      inventoryQuantity: '',
      tags: [],
      faqs: []
    });
    setRecommendedPriceRange({ min: 0, max: 0, average: 0 });
    setSelectedImageIndex(0);
    setIsAIModeEnabled(false);
    setTitleSuggestion('');
    setDescriptionSuggestion('');
    setOwnershipVerified(true);
    setIsVerifyingOwnership(false);
    onClose();
  };

  const isStepValid = () => {
    if (currentStep === 1) return listingType !== null;

    if (listingType === 'buy') {
      switch(currentStep) {
        case 2: return buyFormData.generatedTitle.length >= 3 && buyFormData.generatedDescription.length >= 10 && buyFormData.generatedImages.length > 0;
        case 3: return buyFormData.minPrice && buyFormData.maxPrice && buyFormData.quantity && parseInt(buyFormData.quantity) > 0 && parseFloat(buyFormData.minPrice) < parseFloat(buyFormData.maxPrice) && buyFormData.location.length > 0 && buyFormData.shippingOptions.length > 0;
        case 4: return true;
        case 5: return true;
        default: return false;
      }
    } else {
      switch(currentStep) {
        case 2: return sellFormData.generatedTitle.length >= 3 && sellFormData.generatedDescription.length >= 10 && sellFormData.uploadedImages.length > 0 && sellFormData.ownershipProofImage !== null;
        case 3: return sellFormData.minPrice && sellFormData.maxPrice && parseFloat(sellFormData.minPrice) < parseFloat(sellFormData.maxPrice) && sellFormData.location.length > 0 && sellFormData.shippingOptions.length > 0 && sellFormData.inventoryQuantity && parseInt(sellFormData.inventoryQuantity) > 0;
        case 4: return true;
        case 5: return true;
        default: return false;
      }
    }
  };

  if (!isOpen) return null;

  const formData = listingType === 'buy' ? buyFormData : sellFormData;
  const setFormData = listingType === 'buy' ? setBuyFormData : setSellFormData;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4">
      <div className="relative w-full max-w-5xl max-h-[90vh] bg-white rounded-lg shadow-2xl flex flex-col border border-neutral-200">
        {/* Header */}
        <div className="flex-shrink-0 border-b shadow-sm rounded-t-lg bg-[var(--color-primary-200)]">
          <div className="px-4 py-4 flex items-center justify-between">
            <Button variant="ghost" size="icon" onClick={handleBack} disabled={currentStep === 1}>
              <ChevronLeft className="w-5 h-5 text-[var(--color-accent-700)]" />
            </Button>
            <div className="text-center">
              <h1 className="font-semibold text-lg text-[var(--color-accent-700)]">
                {listingType === null ? 'Create Listing' : listingType === 'buy' ? 'Create Buy Listing' : 'Create Sell Listing'}
              </h1>
              <p className="text-sm text-[var(--color-primary-900)]">Step {currentStep} of {steps.length}</p>
            </div>
            <Button variant="ghost" size="icon" onClick={handleClose}>
              <X className="w-5 h-5 text-[var(--color-accent-700)]" />
            </Button>
          </div>

          {/* Progress Steps */}
          <div className="px-4 pb-4 overflow-x-auto">
            <div className="flex items-center justify-between min-w-max py-2">
              {steps.map((step, index) => {
                const Icon = step.icon;
                return (
                  <React.Fragment key={step.number}>
                    <div className="flex flex-col items-center">
                      <div
                        className={`w-12 h-12 rounded-full flex items-center justify-center font-semibold text-sm transition-all ${
                          currentStep > step.number
                            ? 'bg-[var(--color-secondary-500)] text-white'
                            : currentStep === step.number
                            ? 'bg-[var(--color-secondary-500)] text-white scale-110 shadow-md'
                            : 'bg-gray-200 text-gray-500'
                        }`}
                      >
                        {currentStep > step.number ? <Check className="w-5 h-5" /> : <Icon className="w-5 h-5" />}
                      </div>
                      <span
                        className={`text-xs mt-2 whitespace-nowrap font-medium ${
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
        <div className="flex-1 overflow-y-auto p-8">
          {/* Step 1: Choose Buy or Sell */}
          {currentStep === 1 && (
            <div className="space-y-6">
              <div className="text-center mb-8">
                <div className="inline-flex items-center justify-center w-16 h-16 rounded-full mb-6 shadow-lg bg-primary-gradient">
                  <Search className="w-8 h-8 text-white" />
                </div>
                <h2 className="text-4xl font-bold mb-4 text-accent-700">
                  Create Your Listing
                </h2>
                <p className="text-lg max-w-2xl mx-auto leading-relaxed text-accent-500">
                  Join thousands of users buying and selling with AI-powered matching
                </p>
              </div>

              <div className="max-w-6xl mx-auto">
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                  {/* Buy Option */}
                  <div
                    onClick={handleBuySelect}
                    className="group relative cursor-pointer"
                  >
                    <div className="absolute inset-0 bg-primary-gradient rounded-2xl opacity-0 group-hover:opacity-15 transition-opacity duration-300"></div>
                    <div className="relative bg-neutral-white rounded-2xl p-6 shadow-xl border-2 border-primary-200 group-hover:shadow-2xl hover:border-secondary-400 transition-all duration-300 flex flex-col justify-between">
                      <div className="text-center">
                        <div className="inline-flex items-center justify-center w-16 h-16 rounded-2xl mb-4 bg-secondary-100 group-hover:scale-110 transition-transform duration-300">
                          <Search className="w-8 h-8 text-primary-600" />
                        </div>
                        <h2 className="text-2xl font-bold mb-3 text-accent-700">
                          I&apos;m Looking to Buy
                        </h2>
                        <p className="text-base leading-relaxed mb-4 text-accent-500">
                          Set your budget and let sellers compete to fulfill your needs
                        </p>

                        <div className="space-y-2 text-left mb-6">
                          <div className="flex items-center text-accent-500">
                            <div className="w-2 h-2 rounded-full mr-3 bg-primary-500"></div>
                            <span className="text-sm">Describe what you&apos;re looking for</span>
                          </div>
                          <div className="flex items-center text-accent-500">
                            <div className="w-2 h-2 rounded-full mr-3 bg-primary-500"></div>
                            <span className="text-sm">Set your budget range</span>
                          </div>
                          <div className="flex items-center text-accent-500">
                            <div className="w-2 h-2 rounded-full mr-3 bg-primary-500"></div>
                            <span className="text-sm">Get matched with sellers</span>
                          </div>
                          <div className="flex items-center text-accent-500">
                            <div className="w-2 h-2 rounded-full mr-3 bg-primary-500"></div>
                            <span className="text-sm">Secure escrow protection</span>
                          </div>
                        </div>
                      </div>

                      <div className="text-center">
                        <div className="inline-flex items-center justify-center px-6 py-3 rounded-xl text-accent-700 font-semibold text-base bg-secondary-500 hover:bg-secondary-600 group-hover:scale-105 transition-all duration-300 shadow-lg">
                          Start Buying
                          <Search className="w-5 h-5 ml-2" />
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Sell Option */}
                  <div
                    onClick={handleSellSelect}
                    className="group relative cursor-pointer"
                  >
                    <div className="absolute inset-0 bg-primary-gradient-reverse rounded-2xl opacity-0 group-hover:opacity-15 transition-opacity duration-300"></div>
                    <div className="relative bg-neutral-white rounded-2xl p-6 shadow-xl border-2 border-primary-200 group-hover:shadow-2xl hover:border-secondary-400 transition-all duration-300 flex flex-col justify-between">
                      <div className="text-center">
                        <div className="inline-flex items-center justify-center w-16 h-16 rounded-2xl mb-4 bg-secondary-100 group-hover:scale-110 transition-transform duration-300">
                          <Upload className="w-8 h-8 text-primary-600" />
                        </div>
                        <h2 className="text-2xl font-bold mb-3 text-accent-700">
                          I Want to Sell
                        </h2>
                        <p className="text-base leading-relaxed mb-4 text-accent-500">
                          List your items and connect with interested buyers automatically
                        </p>

                        <div className="space-y-2 text-left mb-6">
                          <div className="flex items-center text-accent-500">
                            <div className="w-2 h-2 rounded-full mr-3 bg-primary-500"></div>
                            <span className="text-sm">Upload photos of your item</span>
                          </div>
                          <div className="flex items-center text-accent-500">
                            <div className="w-2 h-2 rounded-full mr-3 bg-primary-500"></div>
                            <span className="text-sm">AI optimizes your listing</span>
                          </div>
                          <div className="flex items-center text-accent-500">
                            <div className="w-2 h-2 rounded-full mr-3 bg-primary-500"></div>
                            <span className="text-sm">Get intelligent price suggestions</span>
                          </div>
                          <div className="flex items-center text-accent-500">
                            <div className="w-2 h-2 rounded-full mr-3 bg-primary-500"></div>
                            <span className="text-sm">Connect with verified buyers</span>
                          </div>
                        </div>
                      </div>

                      <div className="text-center">
                        <div className="inline-flex items-center justify-center px-6 py-3 rounded-xl text-accent-700 font-semibold text-base bg-primary-500 hover:bg-primary-600 group-hover:scale-105 transition-all duration-300 shadow-lg">
                          Start Selling
                          <Upload className="w-5 h-5 ml-2" />
                        </div>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Bottom Feature Highlight */}
                <div className="text-center mt-8 pb-8">
                  <div className="inline-flex items-center justify-center px-6 py-3 rounded-full border border-accent-600/20 bg-primary-100/80 shadow-lg backdrop-blur-sm">
                    <Sparkles className="w-5 h-5 mr-2 text-accent-600" />
                    <span className="font-medium text-base text-accent-700">
                      AI-powered matching ensures fair deals for everyone
                    </span>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Step 2: AI Generate */}
          {currentStep === 2 && listingType && (
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
              ownershipProofImage={listingType === 'sell' ? sellFormData.ownershipProofImage : undefined}
              isVerifyingOwnership={listingType === 'sell' ? isVerifyingOwnership : undefined}
              ownershipVerified={listingType === 'sell' ? ownershipVerified : undefined}
              tagGeneratorRef={tagGeneratorRef}
            />
          )}

          {/* Step 3: Pricing & Shipping */}
          {currentStep === 3 && listingType && (
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

          {/* Step 4: FAQs */}
          {currentStep === 4 && listingType && (
            <FAQsStep
              listingType={listingType}
              faqs={formData.faqs}
              onFAQsChange={(faqs) => setFormData((prev: any) => ({ ...prev, faqs }))}
              mockFAQData={listingType === 'buy' ? MOCK_FAQ_BUY : MOCK_FAQ_SELL}
              hasAnyInput={hasAnyInput()}
            />
          )}

          {/* Step 5: Preview */}
          {currentStep === 5 && listingType && (
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

            {currentStep < 5 ? (
              <Button
                onClick={handleNext}
                disabled={!isStepValid()}
                className="px-6 text-white hover:opacity-90 bg-[var(--color-secondary-500)]"
              >
                Continue
                <ChevronRight className="w-4 h-4 ml-2" />
              </Button>
            ) : (
              <Button
                onClick={handleSubmit}
                disabled={!isStepValid()}
                className="px-8 bg-green-600 hover:bg-green-700 text-lg font-semibold text-white"
              >
                <Check className="w-5 h-5 mr-2" />
                Publish {listingType === 'buy' ? 'Buy' : 'Sell'} Listing
              </Button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
