'use client';

import React, { useState, useRef, useCallback } from 'react';
import { Search, Sparkles, Edit3, DollarSign, Truck, Eye, Check, ChevronLeft, ChevronRight, Loader2, X, Upload, Image as ImageIcon, Trash2, MessageCircle, Tag, MapPin } from 'lucide-react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Switch } from '@/components/ui/switch';
import { HistoricalPriceTrend } from './price-chart';
import { MOCK_PRICE_HISTORY } from '@/utils/mock-price-chart-data';
import { ShippingPreferences } from './shipping-options';
import FAQGenerator, { FAQ } from './faq-generator';
import { MOCK_FAQ_BUY } from '@/utils/mock-faq-buy';
import { MOCK_GENERATED_TITLE_BUY, MOCK_GENERATED_DESCRIPTION_BUY, MOCK_GENERATED_IMAGES_BUY } from '@/utils/mock-buy-listing-data';
import TagGenerator, { TagGeneratorRef } from './tag-generator';
import { MOCK_RECOMMENDED_PRICE_RANGE } from '@/utils/mock-price-rec-data';
import { MOCK_LOCATION } from '@/utils/mock-location-data';

interface FormData {
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

interface CreateBuyListingModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit?: (data: FormData) => void;
}

export default function CreateBuyListingModal({ isOpen, onClose, onSubmit }: CreateBuyListingModalProps) {
  const [currentStep, setCurrentStep] = useState(1);
  const [isGeneratingTitle, setIsGeneratingTitle] = useState(false);
  const [isGeneratingDescription, setIsGeneratingDescription] = useState(false);
  const [isGeneratingPhotos, setIsGeneratingPhotos] = useState(false);
  const [selectedImageIndex, setSelectedImageIndex] = useState(0);
  const [isAIModeEnabled, setIsAIModeEnabled] = useState(false);
  const [isGeneratingAll, setIsGeneratingAll] = useState(false);
  const [titleSuggestion, setTitleSuggestion] = useState('');
  const [descriptionSuggestion, setDescriptionSuggestion] = useState('');
  const [isGeneratingSuggestion, setIsGeneratingSuggestion] = useState(false);
  const titleTimeoutRef = useRef<NodeJS.Timeout | null>(null);
  const descriptionTimeoutRef = useRef<NodeJS.Timeout | null>(null);
  const tagGeneratorRef = useRef<TagGeneratorRef>(null);
  const [showLocationDropdown, setShowLocationDropdown] = useState(false);
  const [filteredLocations, setFilteredLocations] = useState<string[]>(MOCK_LOCATION);
  const [selectedLocationIndex, setSelectedLocationIndex] = useState(-1);
  const [showCurrencyDropdown, setShowCurrencyDropdown] = useState(false);
  const [filteredCurrencies, setFilteredCurrencies] = useState<string[]>(['MYR', 'USD', 'SGD']);
  const [selectedCurrencyIndex, setSelectedCurrencyIndex] = useState(-1);

  const [formData, setFormData] = useState<FormData>({
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

  const hasAnyInput = () => {
    return formData.generatedTitle.length > 0 || 
           formData.generatedDescription.length > 0 || 
           formData.generatedImages.length > 0;
  };

  const generateTitleWithAI = async () => {
    setIsGeneratingTitle(true);
    await new Promise(resolve => setTimeout(resolve, 1500));

    setFormData(prev => ({
      ...prev,
      generatedTitle: MOCK_GENERATED_TITLE_BUY
    }));

    setIsGeneratingTitle(false);
  };

  const generateDescriptionWithAI = async () => {
    setIsGeneratingDescription(true);
    await new Promise(resolve => setTimeout(resolve, 2000));

    setFormData(prev => ({
      ...prev,
      generatedDescription: MOCK_GENERATED_DESCRIPTION_BUY
    }));

    setIsGeneratingDescription(false);
  };

  const generatePhotosWithAI = async () => {
    setIsGeneratingPhotos(true);
    await new Promise(resolve => setTimeout(resolve, 2000));

    setFormData(prev => ({
      ...prev,
      generatedImages: [...prev.generatedImages, ...MOCK_GENERATED_IMAGES_BUY]
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
      const fullSuggestion = MOCK_GENERATED_TITLE_BUY;
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
      const fullSuggestion = MOCK_GENERATED_DESCRIPTION_BUY;
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

  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (files) {
      const newImages: string[] = [];
      Array.from(files).forEach(file => {
        const reader = new FileReader();
        reader.onloadend = () => {
          newImages.push(reader.result as string);
          if (newImages.length === files.length) {
            setFormData(prev => ({
              ...prev,
              generatedImages: [...prev.generatedImages, ...newImages]
            }));
          }
        };
        reader.readAsDataURL(file);
      });
    }
  };

  const removeImage = (index: number) => {
    setFormData(prev => ({
      ...prev,
      generatedImages: prev.generatedImages.filter((_, i) => i !== index)
    }));
    if (selectedImageIndex >= formData.generatedImages.length - 1) {
      setSelectedImageIndex(Math.max(0, formData.generatedImages.length - 2));
    }
  };

  const fetchPriceRecommendation = async () => {
    await new Promise(resolve => setTimeout(resolve, 1000));

    setRecommendedPriceRange(MOCK_RECOMMENDED_PRICE_RANGE);
  };

  const handleFAQsChange = (faqs: FAQ[]) => {
    setFormData(prev => ({
      ...prev,
      faqs
    }));
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
    console.log('Buy listing submitted:', formData);
    alert('Buy listing created successfully!');
    handleClose();
  };

  const handleClose = () => {
    setCurrentStep(1);
    setFormData({
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
    setRecommendedPriceRange({ min: 0, max: 0, average: 0 });
    setSelectedImageIndex(0);
    setIsAIModeEnabled(false);
    setTitleSuggestion('');
    setDescriptionSuggestion('');
    onClose();
  };

  const isStepValid = () => {
    switch(currentStep) {
      case 1: return formData.generatedTitle.length >= 3 && formData.generatedDescription.length >= 10 && formData.generatedImages.length > 0;
      case 2: return formData.minPrice && formData.maxPrice && formData.quantity && parseInt(formData.quantity) > 0 && parseFloat(formData.minPrice) < parseFloat(formData.maxPrice) && formData.location.length > 0 && formData.shippingOptions.length > 0;
      case 3: return true; // FAQs are optional
      case 4: return true;
      default: return false;
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center backdrop-blur-md bg-opacity-50 p-4 overflow-y-auto">
      <div className="relative w-full max-w-5xl max-h-[90vh] overflow-y-auto bg-white rounded-lg shadow-2xl">
        {/* Header */}
        <div className="sticky top-0 z-10 border-b shadow-sm rounded-t-lg bg-[var(--color-primary-200)]">
          <div className="px-4 py-4 flex items-center justify-between">
            <Button variant="ghost" size="icon" onClick={handleBack} disabled={currentStep === 1}>
              <ChevronLeft className="w-5 h-5 text-[var(--color-accent-700)]" />
            </Button>
            <div className="text-center">
              <h1 className="font-semibold text-lg text-[var(--color-accent-700)]">Create Buy Listing</h1>
              <p className="text-sm text-[var(--color-primary-900)]">Step {currentStep} of 4</p>
            </div>
            <Button variant="ghost" size="icon" onClick={handleClose}>
              <X className="w-5 h-5 text-[var(--color-accent-700)]" />
            </Button>
          </div>

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
        <div className="p-8">
          {currentStep === 1 && (
                <div className="space-y-6">
                  <div className="text-center mb-8 relative">
                    <h2 className="text-3xl font-bold mb-2 text-[var(--color-accent-700)]">Create Your Listing</h2>
                    <p className="text-lg text-[var(--color-primary-900)]">Fill in details or let AI help you generate content</p>
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
                          disabled={isGeneratingAll || !hasAnyInput()}
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

                  <div className="max-w-3xl mx-auto space-y-6">
                    {/* Images Section */}
                    <div>
                      <div className="flex justify-between items-center mb-3">
                        <Label className="text-base font-medium text-[var(--color-accent-700)]">
                          Product Images
                        </Label>
                        {isAIModeEnabled && (
                          <Button
                            variant="outline"
                            size="sm"
                            className="text-xs sm:text-sm border-[var(--color-secondary-500)] text-[var(--color-accent-700)]"
                            onClick={generatePhotosWithAI}
                            disabled={isGeneratingPhotos || !hasAnyInput()}
                          >
                            {isGeneratingPhotos ? (
                              <>
                                <Loader2 className="w-3 h-3 mr-1 animate-spin" />
                                Generating...
                              </>
                            ) : (
                              <>
                                <Sparkles className="w-3 h-3 mr-1" />
                                Generate Photos with AI
                              </>
                            )}
                          </Button>
                        )}
                      </div>

                      {formData.generatedImages.length > 0 ? (
                        <div className="space-y-3">
                          <div className="relative aspect-video rounded-lg overflow-hidden bg-gray-100 border-2 border-[var(--color-primary-200)]">
                            <img 
                              src={formData.generatedImages[selectedImageIndex]} 
                              alt={`Product ${selectedImageIndex + 1}`} 
                              className="w-full h-full object-cover"
                            />
                            <button
                              onClick={() => removeImage(selectedImageIndex)}
                              className="absolute top-2 right-2 p-2 bg-red-500 text-white rounded-full hover:bg-red-600 transition-colors"
                            >
                              <Trash2 className="w-4 h-4" />
                            </button>
                          </div>
                          
                          <div className="flex gap-2 overflow-x-auto pb-2">
                            {formData.generatedImages.map((img, idx) => (
                              <button
                                key={idx}
                                onClick={() => setSelectedImageIndex(idx)}
                                className={`relative flex-shrink-0 w-20 h-20 rounded-lg overflow-hidden border-2 transition-all ${
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
                        <div className="border-2 border-dashed border-gray-300 rounded-lg p-12 text-center bg-[var(--color-primary-50)]">
                          <ImageIcon className="w-16 h-16 mx-auto mb-4 text-[var(--color-primary-500)]" />
                          <p className="text-[var(--color-primary-900)] mb-2">No images yet</p>
                          <p className="text-sm text-[var(--color-primary-700)]">Upload photos or generate with AI</p>
                        </div>
                      )}

                      <div className="mt-3">
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
                          className="w-full border-[var(--color-primary-300)] text-[var(--color-accent-700)]"
                          onClick={() => document.getElementById('imageUpload')?.click()}
                        >
                          <Upload className="w-4 h-4 mr-2" />
                          Upload Photos
                        </Button>
                      </div>
                    </div>

                    {/* Title Section */}
                    <div>
                      <div className="flex justify-between items-center mb-2">
                        <Label htmlFor="title" className="text-base font-medium text-[var(--color-accent-700)]">
                          Title
                        </Label>
                        {isAIModeEnabled && (
                          <Button
                            variant="outline"
                            size="sm"
                            className="text-xs sm:text-sm border-[var(--color-secondary-500)] text-[var(--color-accent-700)]"
                            onClick={generateTitleWithAI}
                            disabled={isGeneratingTitle || !hasAnyInput()}
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
                          placeholder="Enter listing title"
                          className="border-[var(--color-primary-200)] relative z-10"
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
                      <p className="text-sm text-[var(--color-primary-900)] mt-2">
                        {formData.generatedTitle.length}/100 characters
                        {titleSuggestion && (
                          <span className="ml-2 text-[var(--color-secondary-500)]">• Press Tab to accept suggestion</span>
                        )}
                      </p>
                    </div>

                    {/* Description Section */}
                    <div>
                      <div className="flex justify-between items-center mb-2">
                        <Label htmlFor="description" className="text-base font-medium text-[var(--color-accent-700)]">
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
                          placeholder="Describe what you're looking for..."
                          className="min-h-[250px] border-[var(--color-primary-200)] relative z-10"
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
                      <p className="text-sm text-[var(--color-primary-900)] mt-2">
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
                      hasContent={!!(formData.generatedTitle || formData.generatedDescription || formData.generatedImages.length > 0)}
                    />
                  </div>
                </div>
              )}

              {currentStep === 2 && (
                <div className="space-y-6">
                  <div className="text-center mb-8">
                    <h2 className="text-3xl font-bold mb-2 text-[var(--color-accent-700)]">Set Your Budget</h2>
                    <p className="text-lg text-[var(--color-primary-900)]">And select shipping options</p>
                  </div>

                  <div className="max-w-2xl mx-auto space-y-8">
                    {/* Historical Price Trend */}
                    <HistoricalPriceTrend priceHistory={MOCK_PRICE_HISTORY} />

                    {/* Pricing Section */}
                    <div className="space-y-4">
                      <Label className="text-base font-medium text-[var(--color-accent-700)]">
                        Your Budget Range
                      </Label>
                      
                      <div className="grid grid-cols-2 gap-4">
                        <div>
                          <Label htmlFor="minPrice" className="text-sm text-[var(--color-primary-900)]">Minimum Price (per unit)</Label>
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
                              className="text-base"
                              step="0.01"
                              min="0"
                            />
                          </div>
                        </div>

                        <div>
                          <Label htmlFor="maxPrice" className="text-sm text-[var(--color-primary-900)]">Maximum Price (per unit)</Label>
                          <div className="flex gap-2 mt-2">
                            <div className="px-3 py-0 border border-gray-300 rounded-lg bg-gray-50 flex items-center text-[var(--color-primary-900)]">
                              {formData.currency}
                            </div>
                            <Input
                              id="maxPrice"
                              type="number"
                              value={formData.maxPrice}
                              onChange={(e) => setFormData({...formData, maxPrice: e.target.value})}
                              placeholder="0.00"
                              className="text-base"
                              step="0.01"
                              min="0"
                            />
                          </div>
                        </div>
                      </div>

                      <div>
                        <Label htmlFor="quantity" className="text-sm text-[var(--color-primary-900)]">Number of Units</Label>
                        <Input
                          id="quantity"
                          type="number"
                          value={formData.quantity}
                          onChange={(e) => setFormData({...formData, quantity: e.target.value})}
                          placeholder="1"
                          className="text-base mt-2"
                          min="1"
                          step="1"
                        />
                        
                      </div>

                      {formData.minPrice && formData.maxPrice && formData.quantity && parseInt(formData.quantity) > 0 && (
                        <div className="rounded-lg p-4 border space-y-3 bg-[var(--color-secondary-400)]">
                          <div>
                            <p className="text-sm mb-1 text-[var(--color-primary-900)]">Price Range per Unit:</p>
                            <p className="text-xl font-bold text-[var(--color-accent-700)]">
                              {formData.currency} {formData.minPrice} - {formData.currency} {formData.maxPrice}
                            </p>
                          </div>
                          <div className="border-t pt-3 border-[var(--color-secondary-500)]">
                            <p className="text-sm mb-1 text-[var(--color-primary-900)]">Total Budget ({formData.quantity} {parseInt(formData.quantity) === 1 ? 'unit' : 'units'}):</p>
                            <p className="text-2xl font-bold text-[var(--color-accent-700)]">
                              {formData.currency} {(parseFloat(formData.minPrice) * parseInt(formData.quantity)).toFixed(2)} - {formData.currency} {(parseFloat(formData.maxPrice) * parseInt(formData.quantity)).toFixed(2)}
                            </p>
                          </div>
                        </div>
                      )}
                    </div>

                    {/* Location Section */}
                    <div className="space-y-3 sm:space-y-4 mb-6 pt-4 border-t-2 border-[var(--color-primary-300)]">
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

              {currentStep === 3 && (
                <FAQGenerator
                  faqs={formData.faqs}
                  onFAQsChange={handleFAQsChange}
                  hasAnyInput={hasAnyInput()}
                  mockFAQData={MOCK_FAQ_BUY}
                />
              )}

              {currentStep === 4 && (
                <div className="space-y-6">
                  <div className="text-center mb-8">
                    <h2 className="text-3xl font-bold mb-2 text-[var(--color-accent-700)]">Review Your Listing</h2>
                    <p className="text-lg text-[var(--color-primary-900)]">Check the details</p>
                  </div>

                  <div className="max-w-4xl mx-auto">
                    <Card className="overflow-hidden border-2">
                      <div className="h-2 bg-primary-gradient"></div>
                      <CardHeader className="bg-[var(--color-primary-100)]">
                        <CardTitle className="text-2xl mb-2 text-[var(--color-accent-700)]">{formData.generatedTitle}</CardTitle>
                        <CardDescription className="text-base">
                          <span className="inline-flex items-center gap-2 font-semibold text-[var(--color-accent-700)]">
                            <Search className="w-4 h-4" />
                            Looking to Buy
                          </span>
                        </CardDescription>
                      </CardHeader>
                      <CardContent className="p-6 space-y-6">
                        <div>
                          <div className="aspect-video rounded-lg overflow-hidden border-2 bg-[var(--color-primary-200)] border-[var(--color-secondary-500)] mb-3">
                            <img src={formData.generatedImages[selectedImageIndex]} alt="Product" className="w-full h-full object-cover" />
                          </div>
                          {formData.generatedImages.length > 1 && (
                            <div className="flex gap-2 overflow-x-auto">
                              {formData.generatedImages.map((img, idx) => (
                                <button
                                  key={idx}
                                  onClick={() => setSelectedImageIndex(idx)}
                                  className={`flex-shrink-0 w-16 h-16 rounded-lg overflow-hidden border-2 transition-all ${
                                    selectedImageIndex === idx 
                                      ? 'border-[var(--color-secondary-500)]' 
                                      : 'border-gray-200'
                                  }`}
                                >
                                  <img src={img} alt={`Thumbnail ${idx + 1}`} className="w-full h-full object-cover" />
                                </button>
                              ))}
                            </div>
                          )}
                        </div>

                        <div>
                          <h3 className="font-semibold text-lg mb-3 flex items-center gap-2 text-[var(--color-accent-700)]">
                            <Edit3 className="w-5 h-5 text-[var(--color-secondary-500)]" />
                            Description
                          </h3>
                          <div className="rounded-lg p-4 border bg-white border-[var(--color-primary-200)]">
                            <p className="whitespace-pre-wrap leading-relaxed text-[var(--color-primary-900)]">{formData.generatedDescription}</p>
                          </div>
                        </div>

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

                        <div className="rounded-lg p-5 border-2 bg-[var(--color-secondary-400)] border-[var(--color-secondary-500)]">
                          <h3 className="font-semibold text-lg mb-4 flex items-center gap-2 text-[var(--color-accent-700)]">
                            <DollarSign className="w-5 h-5 text-[var(--color-secondary-500)]" />
                            Budget Range
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
                            <div className="border-t pt-3 border-[var(--color-secondary-500)]">
                              <div className="flex items-center justify-between mb-2">
                                <p className="text-sm font-medium text-[var(--color-primary-900)]">
                                  Quantity: <span className="font-bold text-[var(--color-accent-700)]">{formData.quantity} {parseInt(formData.quantity) === 1 ? 'unit' : 'units'}</span>
                                </p>
                              </div>
                              <div className="bg-white rounded-lg p-4 border-2 border-[var(--color-secondary-500)]">
                                <p className="text-xs font-medium mb-1 uppercase tracking-wide text-[var(--color-primary-900)]">Total Budget</p>
                                <p className="text-2xl font-bold text-[var(--color-accent-700)]">
                                  {formData.currency} {(parseFloat(formData.minPrice) * parseInt(formData.quantity)).toFixed(2)} - {formData.currency} {(parseFloat(formData.maxPrice) * parseInt(formData.quantity)).toFixed(2)}
                                </p>
                              </div>
                            </div>
                          </div>
                        </div>

                        {/* Location */}
                        {formData.location && (
                          <div className="border rounded-lg p-3 sm:p-4 bg-[var(--color-secondary-50)] border-[var(--color-secondary-500)]">
                            <h3 className="font-semibold text-base sm:text-lg mb-2 sm:mb-3 flex items-center gap-2 text-[var(--color-accent-700)]">
                              <MapPin className="w-4 h-4 sm:w-5 sm:h-5 text-[var(--color-secondary-500)]" />
                              Location
                            </h3>
                            <p className="text-base sm:text-lg font-semibold text-[var(--color-accent-700)]">
                              {formData.location}
                            </p>
                          </div>
                        )}

                        <div>
                          <h3 className="font-semibold text-lg mb-3 flex items-center gap-2 text-[var(--color-accent-700)]">
                            <Truck className="w-5 h-5 text-[var(--color-secondary-500)]" />
                            Accepted Shipping Methods
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

                        {formData.faqs.length > 0 && (
                          <div className="pt-4 border-t-2 border-[var(--color-primary-300)]">
                            <h3 className="font-semibold text-lg mb-4 flex items-center gap-2 text-[var(--color-accent-700)]">
                              <MessageCircle className="w-5 h-5 text-[var(--color-secondary-500)]" />
                              Frequently Asked Questions
                            </h3>
                            <div className="space-y-3">
                              {formData.faqs.map((faq, index) => (
                                <Card key={faq.id} className="border border-[var(--color-primary-300)]">
                                  <CardContent className="p-4">
                                    <div className="flex gap-3">
                                      <div className="flex-shrink-0 w-6 h-6 rounded-full bg-[var(--color-secondary-500)] text-white flex items-center justify-center font-bold text-xs">
                                        {index + 1}
                                      </div>
                                      <div className="flex-1 space-y-2">
                                        <p className="font-semibold text-[var(--color-accent-700)]">
                                          {faq.question}
                                        </p>
                                        <p className="text-sm text-[var(--color-primary-900)] leading-relaxed">
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

                    <div className="mt-6 flex flex-wrap gap-3 justify-center">
                      <Button 
                        variant="outline" 
                        size="sm"
                        onClick={() => setCurrentStep(1)}
                        className="border-2 hover:shadow-md transition-all border-[var(--color-secondary-500)]"
                      >
                        <Edit3 className="w-4 h-4 mr-2" />
                        Edit Details
                      </Button>
                      <Button 
                        variant="outline" 
                        size="sm"
                        onClick={() => setCurrentStep(2)}
                        className="border-2 hover:shadow-md transition-all border-[var(--color-secondary-500)]"
                      >
                        <DollarSign className="w-4 h-4 mr-2" />
                        Edit Pricing & Shipping
                      </Button>
                      <Button 
                        variant="outline" 
                        size="sm"
                        onClick={() => setCurrentStep(3)}
                        className="border-2 hover:shadow-md transition-all border-[var(--color-secondary-500)]"
                      >
                        <MessageCircle className="w-4 h-4 mr-2" />
                        Edit FAQs
                      </Button>
                    </div>

                  </div>
                </div>
              )}

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
                Publish Buy Listing
              </Button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}