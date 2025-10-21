'use client';

import React, { useState } from 'react';
import { Upload, Sparkles, Edit3, DollarSign, Eye, Check, ChevronLeft, ChevronRight, Loader2, X, Image as ImageIcon, Trash2, Tag, MessageCircle } from 'lucide-react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { MOCK_GENERATED_TITLE_SELL, MOCK_GENERATED_DESCRIPTION_SELL, MOCK_GENERATED_IMAGES_SELL, MOCK_OWNERSHIP_PROOF_IMAGE_SELL } from '@/utils/mock-sell-listing-data';
import { HistoricalPriceTrend } from './price-chart';
import { MOCK_PRICE_HISTORY } from '@/utils/mock-price-chart-data';
import { ShippingPreferences } from './shipping-options';
import FAQGenerator, { FAQ } from './faq-generator';
import { MOCK_FAQ_SELL } from '@/utils/mock-faq-sell';
import TagGenerator from './tag-generator';
import { MOCK_RECOMMENDED_PRICE_RANGE } from '@/utils/mock-price-rec-data';

interface FormData {
  uploadedImages: string[];
  ownershipProofImage: string | null;
  generatedTitle: string;
  generatedDescription: string;
  minPrice: string;
  maxPrice: string;
  currency: string;
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
  const [formData, setFormData] = useState<FormData>({
    uploadedImages: [],
    ownershipProofImage: MOCK_OWNERSHIP_PROOF_IMAGE_SELL,
    generatedTitle: '',
    generatedDescription: '',
    minPrice: '',
    maxPrice: '',
    currency: 'MYR',
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

  const handleOwnershipProofUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const imageUrl = URL.createObjectURL(file);
      setFormData(prev => ({
        ...prev,
        ownershipProofImage: imageUrl
      }));
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
      shippingOptions: [],
      inventoryQuantity: '',
      tags: [],
      faqs: []
    });
    setRecommendedPriceRange({ min: 0, max: 0, average: 0 });
    setSelectedImageIndex(0);
    onClose();
  };

  const isStepValid = () => {
    switch(currentStep) {
      case 1: return formData.generatedTitle.length >= 3 && formData.generatedDescription.length >= 10 && formData.uploadedImages.length > 0 && formData.ownershipProofImage !== null;
      case 2: return formData.minPrice && formData.maxPrice && parseFloat(formData.minPrice) < parseFloat(formData.maxPrice) && formData.shippingOptions.length > 0 && formData.inventoryQuantity && parseInt(formData.inventoryQuantity) > 0;
      case 3: return true; // FAQs are optional
      case 4: return true;
      default: return false;
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center backdrop-blur-md bg-opacity-50 p-2 sm:p-4 overflow-hidden">
      <div className="relative w-full max-w-5xl h-[95vh] sm:h-[90vh] overflow-y-auto bg-white rounded-lg shadow-2xl">
        {/* Header */}
        <div className="sticky top-0 z-10 border-b shadow-sm rounded-t-lg bg-[var(--color-primary-200)]">
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
        <div className="p-3 sm:p-4 md:p-8">
          <div className="p-4 sm:p-6 md:p-8">

              {/* Step 1: AI Generate */}
              {currentStep === 1 && (
                <div className="space-y-6">
                  <div className="text-center mb-8">
                    <h2 className="text-3xl font-bold mb-2 text-[var(--color-accent-700)]">Create Your Listing</h2>
                    <p className="text-lg text-[var(--color-primary-900)]">Fill in details or let AI help you generate content</p>
                  </div>

                  <div className="max-w-3xl mx-auto space-y-4 sm:space-y-6">
                    {/* Images Section */}
                    <div>
                      <div className="flex justify-between items-center mb-2 sm:mb-3">
                        <Label className="text-sm sm:text-base font-medium text-[var(--color-accent-700)]">
                          Product Images
                        </Label>
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
                              Generate Photos with AI
                            </>
                          )}
                        </Button>
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
                              onClick={() => setFormData(prev => ({ ...prev, ownershipProofImage: null }))}
                              className="absolute top-1 right-1 sm:top-2 sm:right-2 p-1 sm:p-2 bg-red-500 text-white rounded-full hover:bg-red-600 transition-colors"
                            >
                              <Trash2 className="w-3 h-3 sm:w-4 sm:h-4" />
                            </button>
                            <div className="absolute bottom-2 left-2 px-2 sm:px-3 py-1 rounded bg-[var(--color-secondary-500)] text-[var(--color-accent-700)] text-xs sm:text-sm font-medium">
                              Ownership Verified
                            </div>
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
                      </div>
                      <Input
                        id="title"
                        value={formData.generatedTitle}
                        onChange={(e) => setFormData({...formData, generatedTitle: e.target.value})}
                        placeholder="Enter listing title"
                        className="text-sm sm:text-base border-[var(--color-primary-200)]"
                        maxLength={100}
                      />
                      <div className="mt-2">
                        <p className="text-xs sm:text-sm text-[var(--color-primary-900)]">{formData.generatedTitle.length}/100 characters</p>
                      </div>
                    </div>

                    {/* Description Section */}
                    <div>
                      <div className="flex justify-between items-center mb-2">
                        <Label htmlFor="description" className="text-sm sm:text-base font-medium text-[var(--color-accent-700)]">
                          Description
                        </Label>
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
                      </div>
                      <Textarea
                        id="description"
                        value={formData.generatedDescription}
                        onChange={(e) => setFormData({...formData, generatedDescription: e.target.value})}
                        placeholder="Describe your product..."
                        className="min-h-[150px] sm:min-h-[250px] text-sm sm:text-base border-[var(--color-primary-200)]"
                        maxLength={1000}
                      />
                      <div className="mt-2">
                        <p className="text-xs sm:text-sm text-[var(--color-primary-900)]">{formData.generatedDescription.length}/1000 characters</p>
                      </div>
                    </div>

                    {/* Tags Section - Shows after content is filled */}
                    <TagGenerator
                      tags={formData.tags}
                      onTagsChange={(tags) => setFormData({ ...formData, tags })}
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
                            <select
                              value={formData.currency}
                              onChange={(e) => setFormData({...formData, currency: e.target.value})}
                              className="px-2 sm:px-3 py-2 border rounded-lg text-sm border-[var(--color-primary-200)]"
                            >
                              <option value="MYR">MYR</option>
                              <option value="USD">USD</option>
                              <option value="SGD">SGD</option>
                            </select>
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
                    <div className="space-y-3 sm:space-y-4 mb-6 pt-4 border-t-2 border-[var(--color-primary-300)]">
                      <div>
                        <Label htmlFor="inventoryQuantity" className="text-sm font-medium mb-1 sm:mb-2 block text-[var(--color-accent-700)]">
                          Units Available
                        </Label>

                        <Input
                          id="inventoryQuantity"
                          type="number"
                          value={formData.inventoryQuantity}
                          onChange={(e) => setFormData({...formData, inventoryQuantity: e.target.value})}
                          placeholder="Enter quantity"
                          className="text-sm sm:text-base border-[var(--color-primary-200)]"
                          min="1"
                          step="1"
                        />
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
                              <div className="absolute bottom-2 left-2 text-xs sm:text-sm px-2 sm:px-3 py-1 rounded bg-[var(--color-secondary-500)] text-[var(--color-accent-700)] font-medium">
                                Ownership Verified
                              </div>
                            </div>
                            <p className="text-xs sm:text-sm text-[var(--color-primary-700)] mt-2">
                              This photo verifies the seller's ownership of the item.
                            </p>
                          </div>
                        )}

                        {/* Description */}
                        <div>
                          <h3 className="font-semibold text-base sm:text-lg mb-2 sm:mb-3 text-[var(--color-accent-700)]">Description</h3>
                          <p className="whitespace-pre-wrap leading-relaxed text-sm sm:text-base text-[var(--color-primary-900)]">
                            {formData.generatedDescription}
                          </p>
                        </div>

                        {/* Tags */}
                        {formData.tags.length > 0 && (
                          <div>
                            <h3 className="font-semibold text-base sm:text-lg mb-2 sm:mb-3 flex items-center gap-2 text-[var(--color-accent-700)]">
                              <Tag className="w-4 h-4 sm:w-5 sm:h-5 text-[var(--color-secondary-500)]" />
                              Category Tags
                            </h3>
                            <div className="flex flex-wrap gap-2">
                              {formData.tags.map((tag, index) => (
                                <div
                                  key={index}
                                  className="inline-flex items-center gap-2 px-3 sm:px-4 py-1.5 sm:py-2 rounded-full bg-[var(--color-secondary-500)] text-[var(--color-accent-700)] border-2 border-[var(--color-secondary-600)]"
                                >
                                  <Tag className="w-3 h-3" />
                                  <span className="text-xs sm:text-sm font-medium">{tag}</span>
                                </div>
                              ))}
                            </div>
                          </div>
                        )}

                        {/* Price Range */}
                        <div className="border rounded-lg p-3 sm:p-4 bg-[var(--color-primary-100)] border-[var(--color-secondary-500)]">
                          <h3 className="font-semibold text-base sm:text-lg mb-2 sm:mb-3 text-[var(--color-accent-700)]">Price Range</h3>
                          <div className="flex items-center gap-2 sm:gap-4">
                            <div className="flex-1">
                              <p className="text-xs sm:text-sm mb-1 text-[var(--color-primary-900)]">Minimum</p>
                              <p className="text-lg sm:text-2xl font-bold text-[var(--color-accent-700)]">
                                {formData.currency} {formData.minPrice}
                              </p>
                            </div>
                            <div className="text-lg sm:text-2xl flex-shrink-0 text-[var(--color-secondary-500)]">→</div>
                            <div className="flex-1">
                              <p className="text-xs sm:text-sm mb-1 text-[var(--color-primary-900)]">Maximum</p>
                              <p className="text-lg sm:text-2xl font-bold text-[var(--color-accent-700)]">
                                {formData.currency} {formData.maxPrice}
                              </p>
                            </div>
                          </div>
                        </div>

                        {/* Shipping Options */}
                        <div>
                          <h3 className="font-semibold text-base sm:text-lg mb-2 sm:mb-3 text-[var(--color-accent-700)]">Available Shipping Methods</h3>
                          <div className="flex flex-wrap gap-2">
                            {formData.shippingOptions.map((option) => (
                              <span 
                                key={option}
                                className="px-3 sm:px-4 py-1 sm:py-2 rounded-full text-xs sm:text-sm font-medium bg-[var(--color-secondary-400)] text-[var(--color-accent-700)]"
                              >
                                {option}
                              </span>
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
                          <div className="pt-4 border-t-2 border-[var(--color-primary-300)]">
                            <h3 className="font-semibold text-base sm:text-lg mb-4 flex items-center gap-2 text-[var(--color-accent-700)]">
                              <MessageCircle className="w-4 h-4 sm:w-5 sm:h-5 text-[var(--color-secondary-500)]" />
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