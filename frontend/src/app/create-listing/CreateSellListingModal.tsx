'use client';

import React, { useState, useRef, useCallback, useEffect } from 'react';
import { Upload, Sparkles, Edit3, DollarSign, Truck, Eye, Check, ChevronLeft, ChevronRight, Loader2, X, Image as ImageIcon, Trash2, Tag, MessageCircle, MapPin } from 'lucide-react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Switch } from '@/components/ui/switch';
import { MOCK_GENERATED_TITLE_SELL, MOCK_GENERATED_DESCRIPTION_SELL, MOCK_GENERATED_IMAGES_SELL, MOCK_OWNERSHIP_PROOF_IMAGE_SELL } from '@/utils/mock-sell-listing-data';
import { HistoricalPriceTrend } from './price-chart';
import { MOCK_PRICE_HISTORY } from '@/utils/mock-price-chart-data';
import { ShippingPreferences } from './shipping-options';
import FAQGenerator, { FAQ } from './faq-generator';
import { MOCK_FAQ_SELL } from '@/utils/mock-faq-sell';
import TagGenerator, { TagGeneratorRef } from './tag-generator';
import { MOCK_RECOMMENDED_PRICE_RANGE } from '@/utils/mock-price-rec-data';
import { verifyOwnershipProofWithAI } from './ai-photo';
import { MOCK_LOCATION } from '@/utils/mock-location-data';

interface FormData {
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

interface CreateSellListingModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit?: (data: FormData) => void;
}

export default function CreateSellListingModal({ isOpen, onClose, onSubmit }: CreateSellListingModalProps) {
  const [currentStep, setCurrentStep] = useState(1);
  const [isGeneratingTitle, setIsGeneratingTitle] = useState(false);
  const [isGeneratingDescription, setIsGeneratingDescription] = useState(false);
  const [isGeneratingPhotos, setIsGeneratingPhotos] = useState(false);
  const [selectedImageIndex, setSelectedImageIndex] = useState(0);
  const [hoveredButton, setHoveredButton] = useState<string | null>(null);
  const [isAIModeEnabled, setIsAIModeEnabled] = useState(false);
  const [isGeneratingAll, setIsGeneratingAll] = useState(false);
  const [titleSuggestion, setTitleSuggestion] = useState('');
  const [descriptionSuggestion, setDescriptionSuggestion] = useState('');
  const [isGeneratingSuggestion, setIsGeneratingSuggestion] = useState(false);
  const titleTimeoutRef = useRef<NodeJS.Timeout | null>(null);
  const descriptionTimeoutRef = useRef<NodeJS.Timeout | null>(null);
  const tagGeneratorRef = useRef<TagGeneratorRef>(null);
  const [isVerifyingOwnership, setIsVerifyingOwnership] = useState(false);
  const [ownershipVerified, setOwnershipVerified] = useState<boolean | null>(null);
  const [showLocationDropdown, setShowLocationDropdown] = useState(false);
  const [filteredLocations, setFilteredLocations] = useState<string[]>(MOCK_LOCATION);
  const [selectedLocationIndex, setSelectedLocationIndex] = useState(-1);
  const [showCurrencyDropdown, setShowCurrencyDropdown] = useState(false);
  const [filteredCurrencies, setFilteredCurrencies] = useState<string[]>(['MYR', 'USD', 'SGD']);
  const [selectedCurrencyIndex, setSelectedCurrencyIndex] = useState(-1);
  const [formData, setFormData] = useState<FormData>({
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

  const steps = [
    { number: 1, label: 'AI Generate', icon: Sparkles },
    { number: 2, label: 'Pricing & Shipping', icon: DollarSign },
    { number: 3, label: 'FAQs', icon: MessageCircle },
    { number: 4, label: 'Preview', icon: Eye }
  ];

  // Initialize ownership verification for mock data
  useEffect(() => {
    if (formData.ownershipProofImage === MOCK_OWNERSHIP_PROOF_IMAGE_SELL && ownershipVerified === null) {
      setOwnershipVerified(true); // Mock data is pre-verified
    }
  }, [formData.ownershipProofImage, ownershipVerified]);

  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (files) {
      const newImages = Array.from(files).slice(0, 5 - formData.uploadedImages.length).map((file) => {
        return URL.createObjectURL(file);
      });
      setFormData(prev => ({
        ...prev,
        uploadedImages: [...prev.uploadedImages, ...newImages]
      }));
    }
  };

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
      setFormData(prev => ({
        ...prev,
        ownershipProofImage: imageUrl
      }));
      // Trigger AI verification
      handleVerifyOwnershipProof(imageUrl);
    }
  };

  const hasAnyInput = () => {
    return formData.generatedTitle.length > 0 ||
           formData.generatedDescription.length > 0 ||
           formData.uploadedImages.length > 0;
  };

  const generateTitleWithAI = async () => {
    setIsGeneratingTitle(true);
    await new Promise(resolve => setTimeout(resolve, 1500));

    setFormData(prev => ({
      ...prev,
      generatedTitle: MOCK_GENERATED_TITLE_SELL
    }));

    setIsGeneratingTitle(false);
  };

  const generateDescriptionWithAI = async () => {
    setIsGeneratingDescription(true);
    await new Promise(resolve => setTimeout(resolve, 2000));

    setFormData(prev => ({
      ...prev,
      generatedDescription: MOCK_GENERATED_DESCRIPTION_SELL
    }));

    setIsGeneratingDescription(false);
  };

  const generatePhotosWithAI = async () => {
    setIsGeneratingPhotos(true);
    await new Promise(resolve => setTimeout(resolve, 2000));

    setFormData(prev => ({
      ...prev,
      uploadedImages: [...prev.uploadedImages, ...MOCK_GENERATED_IMAGES_SELL]
    }));

    setIsGeneratingPhotos(false);
  };

  const generateAllWithAI = async () => {
    setIsGeneratingAll(true);

    // Generate photos first
    await generatePhotosWithAI();

    // Generate title
    await generateTitleWithAI();

    // Generate description
    await generateDescriptionWithAI();

    // Generate tags
    if (tagGeneratorRef.current) {
      await tagGeneratorRef.current.generateTags();
    }

    setIsGeneratingAll(false);
  };

  const generateTitleSuggestion = useCallback((currentText: string) => {
    // Clear existing timeout
    if (titleTimeoutRef.current) {
      clearTimeout(titleTimeoutRef.current);
    }

    if (!isAIModeEnabled || currentText.length < 3) {
      setTitleSuggestion('');
      return;
    }

    // Debounce: wait 300ms before generating suggestion
    titleTimeoutRef.current = setTimeout(() => {
      const fullSuggestion = MOCK_GENERATED_TITLE_SELL;
      const lowerCurrent = currentText.toLowerCase();
      const lowerSuggestion = fullSuggestion.toLowerCase();

      // Check if suggestion starts with current text (case-insensitive)
      if (lowerSuggestion.startsWith(lowerCurrent)) {
        // Return only the remaining part
        setTitleSuggestion(fullSuggestion.slice(currentText.length));
      } else {
        setTitleSuggestion('');
      }
    }, 300);
  }, [isAIModeEnabled]);

  const generateDescriptionSuggestion = useCallback((currentText: string) => {
    // Clear existing timeout
    if (descriptionTimeoutRef.current) {
      clearTimeout(descriptionTimeoutRef.current);
    }

    if (!isAIModeEnabled || currentText.length < 3) {
      setDescriptionSuggestion('');
      return;
    }

    // Debounce: wait 300ms before generating suggestion
    descriptionTimeoutRef.current = setTimeout(() => {
      const fullSuggestion = MOCK_GENERATED_DESCRIPTION_SELL;
      const lowerCurrent = currentText.toLowerCase();
      const lowerSuggestion = fullSuggestion.toLowerCase();

      // Check if suggestion starts with current text (case-insensitive)
      if (lowerSuggestion.startsWith(lowerCurrent)) {
        // Return only the remaining part
        setDescriptionSuggestion(fullSuggestion.slice(currentText.length));
      } else {
        setDescriptionSuggestion('');
      }
    }, 300);
  }, [isAIModeEnabled]);

  const removeImage = (index: number) => {
    setFormData(prev => ({
      ...prev,
      uploadedImages: prev.uploadedImages.filter((_, i) => i !== index)
    }));
    if (selectedImageIndex >= formData.uploadedImages.length - 1) {
      setSelectedImageIndex(Math.max(0, formData.uploadedImages.length - 2));
    }
  };


  const fetchPriceRecommendation = async () => {
    await new Promise(resolve => setTimeout(resolve, 1000));

    setRecommendedPriceRange(MOCK_RECOMMENDED_PRICE_RANGE);
  };


  const handleNext = () => {
    if (currentStep < 4) {
      if (currentStep === 2) {
        if (!recommendedPriceRange.average) {
          fetchPriceRecommendation();
        }
      }
      setCurrentStep(currentStep + 1);
    }
  };

  const handleBack = () => {
    if (currentStep > 1) setCurrentStep(currentStep - 1);
  };


  const handleSubmit = async () => {
    if (onSubmit) {
      onSubmit(formData);
    }
    console.log('Sell listing submitted:', formData);
    alert('Sell listing created successfully!');
    handleClose();
  };

  const handleClose = () => {
    setCurrentStep(1);
    setFormData({
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
    setOwnershipVerified(true); // Reset to verified for mock data
    setIsVerifyingOwnership(false);
    onClose();
  };

  const isStepValid = () => {
    switch(currentStep) {
      case 1: return formData.generatedTitle.length >= 3 && formData.generatedDescription.length >= 10 && formData.uploadedImages.length > 0 && formData.ownershipProofImage !== null;
      case 2: return formData.minPrice && formData.maxPrice && parseFloat(formData.minPrice) < parseFloat(formData.maxPrice) && formData.location.length > 0 && formData.shippingOptions.length > 0 && formData.inventoryQuantity && parseInt(formData.inventoryQuantity) > 0;
      case 3: return true; // FAQs are optional
      case 4: return true;
      default: return false;
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center backdrop-blur-md bg-opacity-50 p-2 sm:p-4">
      <div className="relative w-full max-w-5xl h-[95vh] sm:h-[90vh] bg-white rounded-lg shadow-2xl flex flex-col">
        {/* Header */}
        <div className="flex-shrink-0 border-b shadow-sm rounded-t-lg bg-[var(--color-primary-200)]">
          <div className="px-3 sm:px-4 py-3 sm:py-4 flex items-center justify-between gap-2">
            <Button variant="ghost" size="icon" onClick={handleBack} disabled={currentStep === 1} className="h-9 w-9 sm:h-10 sm:w-10">
              <ChevronLeft className="w-4 h-4 sm:w-5 sm:h-5 text-[var(--color-accent-700)]" />
            </Button>
            <div className="text-center flex-1 min-w-0">
              <h1 className="font-semibold text-base sm:text-lg text-[var(--color-accent-700)]">Create Sell Listing</h1>
              <p className="text-xs sm:text-sm text-[var(--color-primary-900)]">Step {currentStep} of 4</p>
            </div>
            <Button variant="ghost" size="icon" onClick={handleClose} className="h-9 w-9 sm:h-10 sm:w-10">
              <X className="w-4 h-4 sm:w-5 sm:h-5 text-[var(--color-accent-700)]" />
            </Button>
          </div>

          {/* Progress Steps */}
          <div className="px-2 sm:px-4 pb-3 sm:pb-4 overflow-x-auto">
            <div className="flex items-center justify-between min-w-max py-2 gap-1 sm:gap-2">
              {steps.map((step, index) => {
                const Icon = step.icon;
                return (
                  <React.Fragment key={step.number}>
                    <div className="flex flex-col items-center">
                      <div 
                        className={`w-8 h-8 sm:w-12 sm:h-12 rounded-full flex items-center justify-center font-semibold text-xs sm:text-sm transition-all flex-shrink-0 ${
                          currentStep > step.number 
                            ? 'bg-[var(--color-secondary-500)] text-white' 
                            : currentStep === step.number 
                            ? 'bg-[var(--color-secondary-500)] text-white scale-110 shadow-md' 
                            : 'bg-gray-200 text-gray-500'
                        }`}
                      >
                        {currentStep > step.number ? <Check className="w-3 h-3 sm:w-5 sm:h-5" /> : <Icon className="w-3 h-3 sm:w-5 sm:h-5" />}
                      </div>
                      <span 
                        className={`text-xs mt-1 sm:mt-2 whitespace-nowrap font-medium text-center max-w-[40px] sm:max-w-none leading-tight ${
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
                        className={`flex-1 h-0.5 sm:h-1 mx-1 sm:mx-3 rounded transition-all min-w-[4px] sm:min-w-[12px] ${
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
        <div className="flex-1 overflow-y-auto p-3 sm:p-4 md:p-8">
          <div className="p-4 sm:p-6 md:p-8">

              {/* Step 1: AI Generate */}
              {currentStep === 1 && (
                <div className="space-y-6">
                  <div className="text-center mb-8 relative">
                    <h2 className="text-3xl font-bold mb-2 text-[var(--color-accent-700)]">Create Your Listing</h2>
                    <p className="text-lg text-[var(--color-primary-900)]">Fill in details or let AI help you generate content</p>
                    {isAIModeEnabled && (
                      <p className="text-sm text-[var(--color-secondary-600)] mt-2 italic">
                        Upload photo or type in title and/or description to start using AI generate
                      </p>
                    )}
                    <div className="absolute top-0 right-0 flex flex-col items-end gap-2">
                      <div className="flex items-center gap-2">
                        <Label htmlFor="ai-mode" className="text-sm font-medium text-[var(--color-accent-700)] cursor-pointer flex items-center gap-2">
                          <Sparkles className="w-4 h-4" />
                          AI Mode
                        </Label>
                        <Switch
                          id="ai-mode"
                          checked={isAIModeEnabled}
                          onCheckedChange={setIsAIModeEnabled}
                          className="data-[state=checked]:bg-[var(--color-secondary-500)]"
                        />
                      </div>
                      {isAIModeEnabled && (
                        <Button
                          variant="outline"
                          size="sm"
                          className="text-xs sm:text-sm border-[var(--color-secondary-500)] text-[var(--color-accent-700)]"
                          onClick={generateAllWithAI}
                          disabled={isGeneratingAll || !(formData.uploadedImages.length > 0 || formData.generatedTitle || formData.generatedDescription)}
                        >
                          {isGeneratingAll ? (
                            <>
                              <Loader2 className="w-3 h-3 mr-1 animate-spin" />
                              Generating...
                            </>
                          ) : (
                            <>
                              <Sparkles className="w-3 h-3 mr-1" />
                              Generate all with AI
                            </>
                          )}
                        </Button>
                      )}
                    </div>
                  </div>

                  <div className="max-w-3xl mx-auto space-y-4 sm:space-y-6">
                    {/* Images Section */}
                    <div>
                      <div className="flex justify-between items-center mb-2 sm:mb-3">
                        <Label className="text-sm sm:text-base font-medium text-[var(--color-accent-700)]">
                          Product Images
                        </Label>
                        {isAIModeEnabled && (
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={generatePhotosWithAI}
                            disabled={isGeneratingPhotos || !hasAnyInput()}
                            className="text-xs sm:text-sm border-[var(--color-secondary-500)] text-[var(--color-accent-700)]"
                          >
                            {isGeneratingPhotos ? (
                              <>
                                <Loader2 className="w-3 h-3 mr-1 animate-spin" />
                                Generating...
                              </>
                            ) : (
                              <>
                                <Sparkles className="w-3 h-3 mr-1" />
                                Enhance Photos with AI
                              </>
                            )}
                          </Button>
                        )}
                      </div>

                      {formData.uploadedImages.length > 0 ? (
                        <div className="space-y-2 sm:space-y-3">
                          <div className="relative aspect-video rounded-lg overflow-hidden bg-gray-100 border-2 border-[var(--color-primary-200)]">
                            <img
                              src={formData.uploadedImages[selectedImageIndex]}
                              alt={`Product ${selectedImageIndex + 1}`}
                              className="w-full h-full object-cover"
                            />
                            <button
                              onClick={() => removeImage(selectedImageIndex)}
                              className="absolute top-1 right-1 sm:top-2 sm:right-2 p-1 sm:p-2 bg-red-500 text-white rounded-full hover:bg-red-600 transition-colors"
                            >
                              <Trash2 className="w-3 h-3 sm:w-4 sm:h-4" />
                            </button>
                          </div>

                          <div className="flex gap-2 overflow-x-auto pb-2">
                            {formData.uploadedImages.map((img, idx) => (
                              <button
                                key={idx}
                                onClick={() => setSelectedImageIndex(idx)}
                                className={`relative flex-shrink-0 w-16 h-16 sm:w-20 sm:h-20 rounded-lg overflow-hidden border-2 transition-all ${
                                  selectedImageIndex === idx
                                    ? 'border-[var(--color-secondary-500)] shadow-md'
                                    : 'border-gray-200'
                                }`}
                              >
                                <img src={img} alt={`Thumbnail ${idx + 1}`} className="w-full h-full object-cover" />
                              </button>
                            ))}
                          </div>
                        </div>
                      ) : (
                        <div className="border-2 border-dashed border-gray-300 rounded-lg p-8 sm:p-12 text-center bg-[var(--color-primary-50)]">
                          <ImageIcon className="w-12 h-12 sm:w-16 sm:h-16 mx-auto mb-3 sm:mb-4 text-[var(--color-primary-500)]" />
                          <p className="text-sm sm:text-base text-[var(--color-primary-900)] mb-1 sm:mb-2">No images yet</p>
                          <p className="text-xs sm:text-sm text-[var(--color-primary-700)]">Upload photos or generate with AI</p>
                        </div>
                      )}

                      <div className="mt-2 sm:mt-3">
                        <input
                          type="file"
                          id="imageUpload"
                          multiple
                          accept="image/*"
                          onChange={handleImageUpload}
                          className="hidden"
                        />
                        <Button
                          variant="outline"
                          className="w-full text-xs sm:text-sm border-[var(--color-primary-300)] text-[var(--color-accent-700)]"
                          onClick={() => document.getElementById('imageUpload')?.click()}
                        >
                          <Upload className="w-3 h-3 sm:w-4 sm:h-4 mr-2" />
                          Upload Photos
                        </Button>
                      </div>
                    </div>

                    {/* Ownership Proof Section */}
                    <div className="pt-4 sm:pt-6 border-t-2 border-[var(--color-primary-300)]">
                      <Label className="text-sm sm:text-base font-medium mb-2 sm:mb-3 block text-[var(--color-accent-700)]">
                        Proof of Ownership
                      </Label>

                      {formData.ownershipProofImage ? (
                        <div className="space-y-2 sm:space-y-3">
                          <div className="relative aspect-video rounded-lg overflow-hidden bg-gray-100 border-2 border-[var(--color-secondary-500)]">
                            <img
                              src={formData.ownershipProofImage}
                              alt="Ownership Proof"
                              className="w-full h-full object-cover"
                            />
                            <button
                              onClick={() => {
                                setFormData(prev => ({ ...prev, ownershipProofImage: null }));
                                setOwnershipVerified(null);
                              }}
                              className="absolute top-1 right-1 sm:top-2 sm:right-2 p-1 sm:p-2 bg-red-500 text-white rounded-full hover:bg-red-600 transition-colors"
                            >
                              <Trash2 className="w-3 h-3 sm:w-4 sm:h-4" />
                            </button>
                            {isVerifyingOwnership ? (
                              <div className="absolute bottom-2 left-2 px-2 sm:px-3 py-1 rounded bg-gray-500 text-white text-xs sm:text-sm font-medium flex items-center gap-1 sm:gap-2">
                                <Loader2 className="w-3 h-3 animate-spin" />
                                Verifying...
                              </div>
                            ) : ownershipVerified !== null ? (
                              <div className={`absolute bottom-2 left-2 px-2 sm:px-3 py-1 rounded text-xs sm:text-sm font-medium ${
                                ownershipVerified
                                  ? 'bg-[var(--color-secondary-500)] text-[var(--color-accent-700)]'
                                  : 'bg-red-500 text-white'
                              }`}>
                                {ownershipVerified ? 'Ownership Verified' : 'Ownership Not Verified by AI'}
                              </div>
                            ) : null}
                          </div>
                        </div>
                      ) : (
                        <div className="border-2 border-dashed border-[var(--color-secondary-400)] rounded-lg p-6 sm:p-8 text-center bg-[var(--color-secondary-50)]">
                          <ImageIcon className="w-10 h-10 sm:w-12 sm:h-12 mx-auto mb-2 sm:mb-3 text-[var(--color-secondary-500)]" />
                          <p className="text-sm sm:text-base text-[var(--color-accent-700)] mb-1 font-medium">No ownership proof uploaded</p>
                          <p className="text-xs sm:text-sm text-[var(--color-primary-700)] mb-1">Please upload a photo showing the item with a handwritten note containing your name and date of writing.</p>
                          <p className="text-xs text-[var(--color-primary-600)]">This verifies you own the item.</p>
                        </div>
                      )}

                      <div className="mt-2 sm:mt-3">
                        <input
                          type="file"
                          id="ownershipProofUpload"
                          accept="image/*"
                          onChange={handleOwnershipProofUpload}
                          className="hidden"
                        />
                        <Button
                          variant="outline"
                          className="w-full text-xs sm:text-sm border-[var(--color-secondary-500)] text-[var(--color-accent-700)]"
                          onClick={() => document.getElementById('ownershipProofUpload')?.click()}
                        >
                          <Upload className="w-3 h-3 sm:w-4 sm:h-4 mr-2" />
                          {formData.ownershipProofImage ? 'Change Ownership Proof' : 'Upload Ownership Proof'}
                        </Button>
                      </div>
                    </div>

                    {/* Title Section */}
                    <div>
                      <div className="flex justify-between items-center mb-2">
                        <Label htmlFor="title" className="text-sm sm:text-base font-medium text-[var(--color-accent-700)]">
                          Title
                        </Label>
                        {isAIModeEnabled && (
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={generateTitleWithAI}
                            disabled={isGeneratingTitle || !hasAnyInput()}
                            className="text-xs sm:text-sm border-[var(--color-secondary-500)] text-[var(--color-accent-700)]"
                          >
                            {isGeneratingTitle ? (
                              <>
                                <Loader2 className="w-3 h-3 mr-1 animate-spin" />
                                Generating...
                              </>
                            ) : (
                              <>
                                <Sparkles className="w-3 h-3 mr-1" />
                                Generate Title with AI
                              </>
                            )}
                          </Button>
                        )}
                      </div>
                      <div className="relative">
                        <Input
                          id="title"
                          value={formData.generatedTitle}
                          onChange={(e) => {
                            setFormData({...formData, generatedTitle: e.target.value});
                            generateTitleSuggestion(e.target.value);
                          }}
                          onKeyDown={(e) => {
                            if (e.key === 'Tab' && titleSuggestion) {
                              e.preventDefault();
                              setFormData({...formData, generatedTitle: formData.generatedTitle + titleSuggestion});
                              setTitleSuggestion('');
                            }
                          }}
                          placeholder="Enter product title"
                          className="text-sm sm:text-base border-[var(--color-primary-200)] relative z-10"
                          style={{
                            fontSize: '1rem',
                            lineHeight: '1.5rem',
                            fontFamily: 'inherit',
                            fontWeight: 'inherit',
                            letterSpacing: 'inherit',
                            background: 'transparent'
                          }}
                          maxLength={100}
                        />
                        <div
                          className="absolute top-0 left-0 right-0 bottom-0 h-9 flex items-center px-3 py-1 pointer-events-none overflow-hidden border border-transparent rounded-md z-0"
                          style={{
                            fontSize: '1rem',
                            lineHeight: '1.5rem',
                            fontFamily: 'inherit',
                            fontWeight: 'inherit',
                            letterSpacing: 'inherit'
                          }}
                        >
                          <span style={{ color: 'transparent' }}>
                            {formData.generatedTitle}
                          </span>
                          <span className="text-gray-400">
                            {titleSuggestion}
                          </span>
                        </div>
                      </div>
                      <p className="text-xs sm:text-sm text-[var(--color-primary-900)] mt-2">
                        {formData.generatedTitle.length}/100 characters
                        {titleSuggestion && (
                          <span className="ml-2 text-[var(--color-secondary-500)]">• Press Tab to accept suggestion</span>
                        )}
                      </p>
                    </div>

                    {/* Description Section */}
                    <div>
                      <div className="flex justify-between items-center mb-2">
                        <Label htmlFor="description" className="text-sm sm:text-base font-medium text-[var(--color-accent-700)]">
                          Description
                        </Label>
                        {isAIModeEnabled && (
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={generateDescriptionWithAI}
                            disabled={isGeneratingDescription || !hasAnyInput()}
                            className="text-xs sm:text-sm border-[var(--color-secondary-500)] text-[var(--color-accent-700)]"
                          >
                            {isGeneratingDescription ? (
                              <>
                                <Loader2 className="w-3 h-3 mr-1 animate-spin" />
                                Generating...
                              </>
                            ) : (
                              <>
                                <Sparkles className="w-3 h-3 mr-1" />
                                Generate Description with AI
                              </>
                            )}
                          </Button>
                        )}
                      </div>
                      <div className="relative">
                        <Textarea
                          id="description"
                          value={formData.generatedDescription}
                          onChange={(e) => {
                            setFormData({...formData, generatedDescription: e.target.value});
                            generateDescriptionSuggestion(e.target.value);
                          }}
                          onKeyDown={(e) => {
                            if (e.key === 'Tab' && descriptionSuggestion) {
                              e.preventDefault();
                              setFormData({...formData, generatedDescription: formData.generatedDescription + descriptionSuggestion});
                              setDescriptionSuggestion('');
                            }
                          }}
                          placeholder="Describe your product..."
                          className="min-h-[150px] sm:min-h-[250px] text-sm sm:text-base border-[var(--color-primary-200)] relative z-10"
                          style={{
                            fontSize: '1rem',
                            lineHeight: '1.5rem',
                            fontFamily: 'inherit',
                            fontWeight: 'inherit',
                            letterSpacing: 'inherit',
                            background: 'transparent'
                          }}
                          maxLength={1000}
                        />
                        <div
                          className="absolute top-0 left-0 right-0 bottom-0 px-3 py-2 pointer-events-none overflow-hidden whitespace-pre-wrap break-words border border-transparent rounded-md z-0"
                          style={{
                            fontSize: '1rem',
                            lineHeight: '1.5rem',
                            fontFamily: 'inherit',
                            fontWeight: 'inherit',
                            letterSpacing: 'inherit'
                          }}
                        >
                          <span style={{ color: 'transparent' }}>
                            {formData.generatedDescription}
                          </span>
                          <span className="text-gray-400">
                            {descriptionSuggestion}
                          </span>
                        </div>
                      </div>
                      <p className="text-xs sm:text-sm text-[var(--color-primary-900)] mt-2">
                        {formData.generatedDescription.length}/1000 characters
                        {descriptionSuggestion && (
                          <span className="ml-2 text-[var(--color-secondary-500)]">• Press Tab to accept suggestion</span>
                        )}
                      </p>
                    </div>

                    {/* Tags Section - Shows after content is filled */}
                    <TagGenerator
                      ref={tagGeneratorRef}
                      tags={formData.tags}
                      onTagsChange={(tags) => setFormData(prev => ({ ...prev, tags }))}
                      hasContent={!!(formData.generatedTitle || formData.generatedDescription || formData.uploadedImages.length > 0)}
                    />
                  </div>
                </div>
              )}


              {/* Step 2: Pricing & Shipping */}
              {currentStep === 2 && (
                <div className="space-y-6">
                  <div className="text-center mb-8">
                    <h2 className="text-3xl font-bold mb-2 text-[var(--color-accent-700)]">Set Your Selling Price</h2>
                    <p className="text-lg text-[var(--color-primary-900)]">And select shipping options</p>
                  </div>

                  <div className="max-w-2xl mx-auto space-y-8">
                    {/* Historical Price Trend */}
                    <HistoricalPriceTrend priceHistory={MOCK_PRICE_HISTORY} />

                    {/* Recommended Price Range */}
                    {recommendedPriceRange.average > 0 && (
                      <Alert className="bg-[var(--color-primary-200)] border-[var(--color-secondary-500)]">
                        <Sparkles className="w-4 h-4 sm:w-5 sm:h-5 text-[var(--color-accent-700)]" />
                        <AlertDescription className="text-xs sm:text-sm">
                          <div className="space-y-2">
                            <p className="font-semibold text-[var(--color-accent-700)]">AI-Recommended Price Range</p>
                            <div className="grid grid-cols-3 gap-2 sm:gap-4 mt-2 sm:mt-3">
                              <div className="bg-white rounded-lg p-2 sm:p-3 text-center border border-[var(--color-secondary-500)]">
                                <p className="text-xs mb-1 text-[var(--color-primary-900)]">Low</p>
                                <p className="text-base sm:text-lg font-bold text-[var(--color-accent-700)]">${recommendedPriceRange.min}</p>
                              </div>
                              <div className="bg-white rounded-lg p-2 sm:p-3 text-center border-2 border-[var(--color-secondary-500)]">
                                <p className="text-xs mb-1 text-[var(--color-primary-900)]">Average</p>
                                <p className="text-base sm:text-lg font-bold text-[var(--color-accent-700)]">${recommendedPriceRange.average}</p>
                              </div>
                              <div className="bg-white rounded-lg p-2 sm:p-3 text-center border border-[var(--color-secondary-500)]">
                                <p className="text-xs mb-1 text-[var(--color-primary-900)]">High</p>
                                <p className="text-base sm:text-lg font-bold text-[var(--color-accent-700)]">${recommendedPriceRange.max}</p>
                              </div>
                            </div>
                            <p className="text-xs mt-2 text-[var(--color-primary-900)]">Based on similar items</p>
                          </div>
                        </AlertDescription>
                      </Alert>
                    )}

                    {/* Price Range Input */}
                    <div className="space-y-3 sm:space-y-4">
                      <Label className="text-sm sm:text-base font-medium text-[var(--color-accent-700)]">
                        Your Selling Price Range
                      </Label>

                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 sm:gap-4">
                        <div>
                          <Label htmlFor="minPrice" className="text-xs sm:text-sm text-[var(--color-primary-900)]">Minimum Price (per unit)</Label>
                          <div className="flex gap-2 mt-2">
                            <div className="relative">
                              <Input
                                type="text"
                                value={formData.currency}
                                onChange={(e) => {
                                  const value = e.target.value;
                                  setFormData({...formData, currency: value});
                                  // Filter currencies based on input
                                  const filtered = ['MYR', 'USD', 'SGD'].filter(curr =>
                                    curr.toLowerCase().includes(value.toLowerCase())
                                  );
                                  setFilteredCurrencies(filtered);
                                  setShowCurrencyDropdown(true);
                                  setSelectedCurrencyIndex(-1);
                                }}
                                onKeyDown={(e) => {
                                  if (!showCurrencyDropdown || filteredCurrencies.length === 0) return;

                                  if (e.key === 'ArrowDown') {
                                    e.preventDefault();
                                    setSelectedCurrencyIndex(prev =>
                                      prev < filteredCurrencies.length - 1 ? prev + 1 : prev
                                    );
                                  } else if (e.key === 'ArrowUp') {
                                    e.preventDefault();
                                    setSelectedCurrencyIndex(prev => prev > 0 ? prev - 1 : -1);
                                  } else if (e.key === 'Enter') {
                                    e.preventDefault();
                                    if (selectedCurrencyIndex >= 0 && selectedCurrencyIndex < filteredCurrencies.length) {
                                      setFormData({...formData, currency: filteredCurrencies[selectedCurrencyIndex]});
                                      setShowCurrencyDropdown(false);
                                      setSelectedCurrencyIndex(-1);
                                    }
                                  } else if (e.key === 'Escape') {
                                    setShowCurrencyDropdown(false);
                                    setSelectedCurrencyIndex(-1);
                                  }
                                }}
                                onFocus={() => {
                                  setShowCurrencyDropdown(true);
                                  setFilteredCurrencies(['MYR', 'USD', 'SGD']);
                                  setSelectedCurrencyIndex(-1);
                                }}
                                onBlur={() => {
                                  // Delay to allow click on dropdown item
                                  setTimeout(() => {
                                    setShowCurrencyDropdown(false);
                                    setSelectedCurrencyIndex(-1);
                                  }, 200);
                                }}
                                placeholder="Select currency"
                                className="w-20 sm:w-24 text-sm border-[var(--color-primary-200)] bg-white text-[var(--color-accent-700)]"
                              />

                              {/* Custom Dropdown */}
                              {showCurrencyDropdown && filteredCurrencies.length > 0 && (
                                <div className="absolute z-50 w-full mt-1 max-h-60 overflow-auto bg-white border border-[var(--color-primary-200)] rounded-lg shadow-lg">
                                  {filteredCurrencies.map((currency, index) => (
                                    <div
                                      key={currency}
                                      onClick={() => {
                                        setFormData({...formData, currency});
                                        setShowCurrencyDropdown(false);
                                        setSelectedCurrencyIndex(-1);
                                      }}
                                      onMouseEnter={() => setSelectedCurrencyIndex(index)}
                                      className={`px-3 py-2 cursor-pointer text-sm text-[var(--color-accent-700)] transition-colors ${
                                        selectedCurrencyIndex === index
                                          ? 'bg-[var(--color-secondary-500)] text-[var(--color-accent-700)] font-semibold'
                                          : 'hover:bg-[var(--color-primary-100)]'
                                      }`}
                                    >
                                      {currency}
                                    </div>
                                  ))}
                                </div>
                              )}
                            </div>
                            <Input
                              id="minPrice"
                              type="number"
                              value={formData.minPrice}
                              onChange={(e) => setFormData({...formData, minPrice: e.target.value})}
                              placeholder="0.00"
                              className="text-sm sm:text-base border-[var(--color-primary-200)]"
                              step="0.01"
                              min="0"
                            />
                          </div>
                        </div>

                        <div>
                          <Label htmlFor="maxPrice" className="text-xs sm:text-sm text-[var(--color-primary-900)]">Maximum Price (per unit)</Label>
                          <div className="flex gap-2 mt-2">
                            <div className="px-2 sm:px-3 py-2 border rounded-lg flex items-center text-sm bg-[var(--color-primary-100)] border-[var(--color-primary-200)] text-[var(--color-primary-900)]">
                              {formData.currency}
                            </div>
                            <Input
                              id="maxPrice"
                              type="number"
                              value={formData.maxPrice}
                              onChange={(e) => setFormData({...formData, maxPrice: e.target.value})}
                              placeholder="0.00"
                              className="text-sm sm:text-base border-[var(--color-primary-200)]"
                              step="0.01"
                              min="0"
                            />
                          </div>
                        </div>
                      </div>

                      {formData.minPrice && formData.maxPrice && (
                        <div className="rounded-lg p-3 sm:p-4 border bg-[var(--color-primary-100)] border-[var(--color-primary-200)]">
                          <p className="text-xs sm:text-sm mb-2 text-[var(--color-primary-900)]">Your Selling Price Range:</p>
                          <p className="text-xl sm:text-2xl font-bold text-[var(--color-accent-700)]">
                            {formData.currency} {formData.minPrice} - {formData.currency} {formData.maxPrice}
                          </p>
                        </div>
                      )}
                    </div>



                    {/* Inventory Quantity */}
                    <div className="space-y-3 sm:space-y-4 mb-6">
                      <div>
                        <Label htmlFor="inventoryQuantity" className="text-sm font-medium mb-1 sm:mb-2 block text-[var(--color-accent-700)]">
                          Units Available
                        </Label>

                        <Input
                          id="inventoryQuantity"
                          type="number"
                          value={formData.inventoryQuantity}
                          onChange={(e) => setFormData({...formData, inventoryQuantity: e.target.value})}
                          placeholder="Enter quantity of a minimum 1 unit"
                          className="text-sm sm:text-base border-[var(--color-primary-200)]"
                          min="1"
                          step="1"
                        />
                      </div>
                    </div>

                    {/* Location Section */}
                    <div className="space-y-3 sm:space-y-4 mb-6">
                      <div className="flex items-center gap-2 mb-3">
                        <MapPin className="w-5 h-5 sm:w-6 sm:h-6 text-[var(--color-secondary-500)]" />
                        <Label className="text-sm sm:text-base font-medium text-[var(--color-accent-700)]">
                          Location
                        </Label>
                      </div>

                      <div className="relative">
                        <Label htmlFor="locationInput" className="text-xs sm:text-sm text-[var(--color-primary-900)] mb-2 block">
                          Select your location
                        </Label>
                        <Input
                          id="locationInput"
                          type="text"
                          value={formData.location}
                          onChange={(e) => {
                            const value = e.target.value;
                            setFormData({...formData, location: value});
                            // Filter locations based on input
                            const filtered = MOCK_LOCATION.filter(loc =>
                              loc.toLowerCase().includes(value.toLowerCase())
                            );
                            setFilteredLocations(filtered);
                            setShowLocationDropdown(true);
                            setSelectedLocationIndex(-1);
                          }}
                          onKeyDown={(e) => {
                            if (!showLocationDropdown || filteredLocations.length === 0) return;

                            if (e.key === 'ArrowDown') {
                              e.preventDefault();
                              setSelectedLocationIndex(prev =>
                                prev < filteredLocations.length - 1 ? prev + 1 : prev
                              );
                            } else if (e.key === 'ArrowUp') {
                              e.preventDefault();
                              setSelectedLocationIndex(prev => prev > 0 ? prev - 1 : -1);
                            } else if (e.key === 'Enter') {
                              e.preventDefault();
                              if (selectedLocationIndex >= 0 && selectedLocationIndex < filteredLocations.length) {
                                setFormData({...formData, location: filteredLocations[selectedLocationIndex]});
                                setShowLocationDropdown(false);
                                setSelectedLocationIndex(-1);
                              }
                            } else if (e.key === 'Escape') {
                              setShowLocationDropdown(false);
                              setSelectedLocationIndex(-1);
                            }
                          }}
                          onFocus={() => {
                            setShowLocationDropdown(true);
                            setFilteredLocations(MOCK_LOCATION);
                            setSelectedLocationIndex(-1);
                          }}
                          onBlur={() => {
                            // Delay to allow click on dropdown item
                            setTimeout(() => {
                              setShowLocationDropdown(false);
                              setSelectedLocationIndex(-1);
                            }, 200);
                          }}
                          placeholder="Select a location"
                          className="w-full text-sm sm:text-base border-[var(--color-primary-200)] bg-white text-[var(--color-accent-700)]"
                        />

                        {/* Custom Dropdown */}
                        {showLocationDropdown && filteredLocations.length > 0 && (
                          <div className="absolute z-50 w-full mt-1 max-h-60 overflow-auto bg-white border border-[var(--color-primary-200)] rounded-lg shadow-lg">
                            {filteredLocations.map((location, index) => (
                              <div
                                key={location}
                                onClick={() => {
                                  setFormData({...formData, location});
                                  setShowLocationDropdown(false);
                                  setSelectedLocationIndex(-1);
                                }}
                                onMouseEnter={() => setSelectedLocationIndex(index)}
                                className={`px-3 py-2 cursor-pointer text-sm sm:text-base text-[var(--color-accent-700)] transition-colors ${
                                  selectedLocationIndex === index
                                    ? 'bg-[var(--color-secondary-500)] text-[var(--color-accent-700)] font-semibold'
                                    : 'hover:bg-[var(--color-primary-100)]'
                                }`}
                              >
                                {location}
                              </div>
                            ))}
                          </div>
                        )}
                      </div>
                    </div>

                    {/* Shipping Section */}
                    <ShippingPreferences
                      shippingOptions={formData.shippingOptions}
                      onShippingOptionsChange={(options) => setFormData({ ...formData, shippingOptions: options })}
                    />
                  </div>
                </div>
              )}

              {/* Step 3: FAQs */}
              {currentStep === 3 && (
                <FAQGenerator
                  faqs={formData.faqs}
                  onFAQsChange={(faqs: FAQ[]) => setFormData({ ...formData, faqs })}
                  mockFAQData={MOCK_FAQ_SELL}
                />
              )}

              {/* Step 4: Preview */}
              {currentStep === 4 && (
                <div className="space-y-6">
                  <div className="text-center mb-8">
                    <h2 className="text-3xl font-bold mb-2 text-[var(--color-accent-700)]">Review Your Listing</h2>
                    <p className="text-lg text-[var(--color-primary-900)]">Check the details</p>
                  </div>

                  <div className="max-w-4xl mx-auto">
                    <Card className="overflow-hidden border-2 bg-white border-[var(--color-primary-200)]">
                      <div className="h-1 sm:h-2 bg-primary-gradient"></div>
                      <CardHeader className="p-3 sm:p-6 bg-[var(--color-primary-100)]">
                        <div className="flex items-start justify-between gap-2">
                          <div className="flex-1 min-w-0">
                            <CardTitle className="text-lg sm:text-2xl mb-2 break-words text-[var(--color-accent-700)]">{formData.generatedTitle}</CardTitle>
                            <CardDescription className="text-sm sm:text-base">
                              <span className="inline-flex items-center gap-2 font-semibold text-[var(--color-accent-700)]">
                                <DollarSign className="w-4 h-4 flex-shrink-0" />
                                For Sale
                              </span>
                            </CardDescription>
                          </div>
                        </div>
                      </CardHeader>
                      <CardContent className="p-3 sm:p-6 space-y-4 sm:space-y-6">
                        {/* Image Gallery Preview */}
                        <div>
                          <h3 className="font-semibold text-base sm:text-lg mb-2 sm:mb-3 text-[var(--color-accent-700)]">Product Photos</h3>
                          <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 sm:gap-3">
                            {formData.uploadedImages.map((image, index) => (
                              <div key={index} className="relative aspect-square rounded-lg overflow-hidden bg-gray-100 border border-[var(--color-primary-200)]">
                                <img
                                  src={image}
                                  alt={`Product ${index + 1}`}
                                  className="w-full h-full object-cover"
                                />
                                {index === 0 && (
                                  <div className="absolute bottom-1 left-1 text-xs px-2 py-1 rounded bg-[var(--color-secondary-500)] text-[var(--color-accent-700)]">
                                    Cover
                                  </div>
                                )}
                              </div>
                            ))}
                          </div>
                        </div>

                        {/* Ownership Proof Preview */}
                        {formData.ownershipProofImage && (
                          <div className="border-t-2 pt-4 border-[var(--color-primary-300)]">
                            <h3 className="font-semibold text-base sm:text-lg mb-2 sm:mb-3 flex items-center gap-2 text-[var(--color-accent-700)]">
                              <ImageIcon className="w-4 h-4 sm:w-5 sm:h-5 text-[var(--color-secondary-500)]" />
                              Proof of Ownership
                            </h3>
                            <div className="relative max-w-md rounded-lg overflow-hidden bg-gray-100 border-2 border-[var(--color-secondary-500)]">
                              <img
                                src={formData.ownershipProofImage}
                                alt="Ownership Proof"
                                className="w-full object-cover"
                              />
                              {ownershipVerified !== null && (
                                <div className={`absolute bottom-2 left-2 text-xs sm:text-sm px-2 sm:px-3 py-1 rounded font-medium ${
                                  ownershipVerified
                                    ? 'bg-[var(--color-secondary-500)] text-[var(--color-accent-700)]'
                                    : 'bg-red-500 text-white'
                                }`}>
                                  {ownershipVerified ? 'Ownership Verified' : 'Ownership Not Verified by AI'}
                                </div>
                              )}
                            </div>
                            <p className="text-xs sm:text-sm text-[var(--color-primary-700)] mt-2">
                              {ownershipVerified
                                ? 'This photo verifies the seller\'s ownership of the item.'
                                : 'AI could not verify ownership from this photo, but you can still proceed with the listing.'}
                            </p>
                          </div>
                        )}

                        {/* Description */}
                        <div>
                          <h3 className="font-semibold text-lg mb-3 flex items-center gap-2 text-[var(--color-accent-700)]">
                            <Edit3 className="w-5 h-5 text-[var(--color-secondary-500)]" />
                            Description
                          </h3>
                          <div className="rounded-lg p-4 border bg-white border-[var(--color-primary-200)]">
                            <p className="whitespace-pre-wrap leading-relaxed text-[var(--color-primary-900)]">{formData.generatedDescription}</p>
                          </div>
                        </div>

                        {/* Tags */}
                        {formData.tags.length > 0 && (
                          <div>
                            <h3 className="font-semibold text-lg mb-3 flex items-center gap-2 text-[var(--color-accent-700)]">
                              <Tag className="w-5 h-5 text-[var(--color-secondary-500)]" />
                              Category Tags
                            </h3>
                            <div className="flex flex-wrap gap-2">
                              {formData.tags.map((tag, index) => (
                                <div
                                  key={index}
                                  className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-[var(--color-secondary-500)] text-[var(--color-accent-700)] border-2 border-[var(--color-secondary-600)]"
                                >
                                  <Tag className="w-3 h-3" />
                                  <span className="text-sm font-medium">{tag}</span>
                                </div>
                              ))}
                            </div>
                          </div>
                        )}

                        {/* Price Range */}
                        <div className="rounded-lg p-5 border-2 bg-[var(--color-secondary-400)] border-[var(--color-secondary-500)]">
                          <h3 className="font-semibold text-lg mb-4 flex items-center gap-2 text-[var(--color-accent-700)]">
                            <DollarSign className="w-5 h-5 text-[var(--color-secondary-500)]" />
                            Price Range
                          </h3>
                          <div className="space-y-4">
                            <div className="flex items-center gap-4">
                              <div className="flex-1 text-center">
                                <p className="text-xs font-medium mb-2 uppercase tracking-wide text-[var(--color-primary-900)]">Min per Unit</p>
                                <div className="bg-white rounded-lg p-3 border border-[var(--color-secondary-500)]">
                                  <p className="text-xl font-bold text-[var(--color-accent-700)]">{formData.currency} {formData.minPrice}</p>
                                </div>
                              </div>
                              <div className="text-2xl font-bold text-[var(--color-secondary-500)]">→</div>
                              <div className="flex-1 text-center">
                                <p className="text-xs font-medium mb-2 uppercase tracking-wide text-[var(--color-primary-900)]">Max per Unit</p>
                                <div className="bg-white rounded-lg p-3 border border-[var(--color-secondary-500)]">
                                  <p className="text-xl font-bold text-[var(--color-accent-700)]">{formData.currency} {formData.maxPrice}</p>
                                </div>
                              </div>
                            </div>
                          </div>
                        </div>

                        {/* Location */}
                        {formData.location && (
                          <div>
                            <h3 className="font-semibold text-lg mb-3 flex items-center gap-2 text-[var(--color-accent-700)]">
                              <MapPin className="w-5 h-5 text-[var(--color-secondary-500)]" />
                              Location
                            </h3>
                            <div className="flex flex-wrap gap-3">
                              <div
                                className="px-4 py-2 rounded-lg text-sm font-medium border-2 shadow-sm bg-white border-[var(--color-secondary-500)] text-[var(--color-accent-700)]"
                              >
                                {formData.location}
                              </div>
                            </div>
                          </div>
                        )}

                        {/* Shipping Options */}
                        <div>
                          <h3 className="font-semibold text-lg mb-3 flex items-center gap-2 text-[var(--color-accent-700)]">
                            <Truck className="w-5 h-5 text-[var(--color-secondary-500)]" />
                            Available Shipping Methods
                          </h3>
                          <div className="flex flex-wrap gap-3">
                            {formData.shippingOptions.map((option) => (
                              <div
                                key={option}
                                className="px-4 py-2 rounded-lg text-sm font-medium border-2 shadow-sm bg-white border-[var(--color-secondary-500)] text-[var(--color-accent-700)]"
                              >
                                {option}
                              </div>
                            ))}
                          </div>
                        </div>

                        {/* Inventory */}
                        {formData.inventoryQuantity && (
                          <div className="border rounded-lg p-3 sm:p-4 bg-[var(--color-primary-100)] border-[var(--color-primary-200)]">
                            <h3 className="font-semibold text-base sm:text-lg mb-2 sm:mb-3 text-[var(--color-accent-700)]">Inventory</h3>
                            <div className="space-y-2">
                              <p className="text-sm sm:text-base text-[var(--color-primary-900)]">
                                <span className="font-semibold text-[var(--color-accent-700)]">
                                  {formData.inventoryQuantity} {parseInt(formData.inventoryQuantity) === 1 ? 'unit' : 'units'}
                                </span>
                                {' '}in stock
                              </p>
                            </div>
                          </div>
                        )}

                        {/* FAQs */}
                        {formData.faqs.length > 0 && (
                          <div>
                            <h3 className="font-semibold text-lg mb-4 flex items-center gap-2 text-[var(--color-accent-700)]">
                              <MessageCircle className="w-5 h-5 text-[var(--color-secondary-500)]" />
                              Frequently Asked Questions
                            </h3>
                            <div className="space-y-3">
                              {formData.faqs.map((faq, index) => (
                                <Card key={faq.id} className="border border-[var(--color-primary-300)]">
                                  <CardContent className="p-3 sm:p-4">
                                    <div className="flex gap-3">
                                      <div className="flex-shrink-0 w-5 h-5 sm:w-6 sm:h-6 rounded-full bg-[var(--color-secondary-500)] text-white flex items-center justify-center font-bold text-xs">
                                        {index + 1}
                                      </div>
                                      <div className="flex-1 space-y-2">
                                        <p className="font-semibold text-sm sm:text-base text-[var(--color-accent-700)]">
                                          {faq.question}
                                        </p>
                                        <p className="text-xs sm:text-sm text-[var(--color-primary-900)] leading-relaxed">
                                          {faq.answer}
                                        </p>
                                      </div>
                                    </div>
                                  </CardContent>
                                </Card>
                              ))}
                            </div>
                          </div>
                        )}
                      </CardContent>
                    </Card>

                    {/* Edit Quick Links */}
                    <div className="mt-4 sm:mt-6 flex flex-col sm:flex-row gap-2 sm:gap-3 justify-center">
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => setCurrentStep(1)}
                        className="text-xs sm:text-sm border-[var(--color-secondary-500)] text-[var(--color-accent-700)]"
                      >
                        <Edit3 className="w-3 h-3 sm:w-4 sm:h-4 mr-1 sm:mr-2" />
                        Edit Details
                      </Button>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => setCurrentStep(2)}
                        className="text-xs sm:text-sm border-[var(--color-secondary-500)] text-[var(--color-accent-700)]"
                      >
                        <DollarSign className="w-3 h-3 sm:w-4 sm:h-4 mr-1 sm:mr-2" />
                        Edit Pricing & Shipping
                      </Button>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => setCurrentStep(3)}
                        className="text-xs sm:text-sm border-[var(--color-secondary-500)] text-[var(--color-accent-700)]"
                      >
                        <MessageCircle className="w-3 h-3 sm:w-4 sm:h-4 mr-1 sm:mr-2" />
                        Edit FAQs
                      </Button>
                    </div>
                  </div>
                </div>
              )}

              {/* Action Buttons */}
              <div className="flex justify-between items-center gap-2 sm:gap-4 mt-6 sm:mt-8 pt-4 sm:pt-6 border-t border-[var(--color-primary-200)]">
                <Button
                  variant="outline"
                  onClick={handleBack}
                  disabled={currentStep === 1}
                  className="text-xs sm:text-sm px-3 sm:px-6 border-[var(--color-primary-200)] text-[var(--color-accent-700)] disabled:opacity-50"
                >
                  <ChevronLeft className="w-3 h-3 sm:w-4 sm:h-4 mr-1 sm:mr-2" />
                  <span className="hidden sm:inline">Back</span>
                </Button>

                {currentStep < 4 ? (
                  <Button
                    onClick={handleNext}
                    disabled={!isStepValid()}
                    className="text-xs sm:text-sm px-3 sm:px-6 bg-[var(--color-secondary-500)] hover:bg-[var(--color-secondary-300)] text-[var(--color-accent-700)] disabled:opacity-50 disabled:bg-[var(--color-primary-200)] border-0"
                  >
                    <span className="hidden sm:inline">Continue</span>
                    <span className="sm:hidden">Next</span>
                    <ChevronRight className="w-3 h-3 sm:w-4 sm:h-4 ml-1 sm:ml-2" />
                  </Button>
                ) : (
                  <Button
                    onClick={handleSubmit}
                    disabled={!isStepValid()}
                    className="text-xs sm:text-sm px-3 sm:px-8 font-semibold bg-[var(--color-secondary-500)] hover:bg-[var(--color-secondary-300)] text-[var(--color-accent-700)] disabled:opacity-50 disabled:bg-[var(--color-primary-200)] border-0"
                  >
                    <Check className="w-3 h-3 sm:w-4 sm:h-4 mr-1 sm:mr-2" />
                    <span className="hidden sm:inline">Publish Sell Listing</span>
                    <span className="sm:hidden">Publish</span>
                  </Button>
                )}
              </div>
            </div>
        </div>
      </div>
    </div>
  );
}