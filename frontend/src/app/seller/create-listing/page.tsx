'use client';

import React, { useState } from 'react';
import { Upload, Sparkles, Edit3, DollarSign, Truck, Eye, Check, ChevronLeft, ChevronRight, Loader2, RefreshCw, X, Camera } from 'lucide-react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { Checkbox } from '@/components/ui/checkbox';
import { Alert, AlertDescription } from '@/components/ui/alert';

const COLORS = {
  background: "#E8EDDF",
  text: "#333533",
  textActive: "#242423",
  hoverBg: "#CFDBD5",
  activeBg: "#F1D688",
  accentFrom: "#F3D172",
  accentTo: "#F5CB5C",
  accentActive: "#F5CB5C",
};

interface FormData {
  uploadedImages: string[];
  generatedTitle: string;
  generatedDescription: string;
  minPrice: string;
  maxPrice: string;
  currency: string;
  shippingOptions: string[];
  availableFromDate: string;
  inventoryQuantity: string;
}

export default function CreateSellListingPage() {
  const [currentStep, setCurrentStep] = useState(1);
  const [isGenerating, setIsGenerating] = useState(false);
  const [hoveredButton, setHoveredButton] = useState<string | null>(null);
  const [formData, setFormData] = useState<FormData>({
    uploadedImages: [],
    generatedTitle: '',
    generatedDescription: '',
    minPrice: '',
    maxPrice: '',
    currency: 'MYR',
    shippingOptions: [],
    availableFromDate: '',
    inventoryQuantity: ''
  });

  const [recommendedPriceRange, setRecommendedPriceRange] = useState({
    min: 0,
    max: 0,
    average: 0
  });

  const steps = [
    { number: 1, label: 'Upload Photos', icon: Upload },
    { number: 2, label: 'AI Generate', icon: Sparkles },
    { number: 3, label: 'Pricing', icon: DollarSign },
    { number: 4, label: 'Shipping', icon: Truck },
    { number: 5, label: 'Preview', icon: Eye }
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

  const addSampleImages = () => {
    const sampleImages = [
      'https://images.unsplash.com/photo-1542291026-7eec264c27ff?w=800&h=800&fit=crop',
      'https://images.unsplash.com/photo-1549298916-b41d501d3772?w=800&h=800&fit=crop',
      'https://images.unsplash.com/photo-1460353581641-37baddab0fa2?w=800&h=800&fit=crop'
    ];
    setFormData(prev => ({
      ...prev,
      uploadedImages: sampleImages
    }));
  };

  const removeImage = (index: number) => {
    setFormData(prev => ({
      ...prev,
      uploadedImages: prev.uploadedImages.filter((_, i) => i !== index)
    }));
  };

  const generateListingWithAI = async () => {
    setIsGenerating(true);
    
    await new Promise(resolve => setTimeout(resolve, 3000));
    
    const mockData = {
      title: 'Nike Air Jordan 1 Retro High OG - University Red/Black',
      description: `Authentic Nike Air Jordan 1 Retro High OG in the classic University Red and Black colorway. These iconic sneakers are in excellent condition with minimal signs of wear.

Product Details:
• Brand: Nike / Air Jordan
• Model: Air Jordan 1 Retro High OG
• Colorway: University Red/Black/White
• Size: US 10 / EU 44
• Condition: 8.5/10 - Gently used, well maintained
• Original box included
• No major creasing or sole separation
• Slight wear on outsole from normal use

This classic silhouette features premium leather construction, the iconic Wings logo, and Nike Air cushioning. Perfect for collectors or anyone looking to add a timeless sneaker to their rotation.

All pictures show the actual item you will receive. Item will be shipped with care in original packaging.`,
    };

    setFormData(prev => ({
      ...prev,
      generatedTitle: mockData.title,
      generatedDescription: mockData.description
    }));

    setIsGenerating(false);
    setCurrentStep(2);
  };

  const fetchPriceRecommendation = async () => {
    await new Promise(resolve => setTimeout(resolve, 1000));
    
    setRecommendedPriceRange({
      min: 280,
      max: 420,
      average: 350
    });
  };

  const handleNext = () => {
    if (currentStep === 1) {
      generateListingWithAI();
    } else if (currentStep === 3) {
      if (!recommendedPriceRange.average) {
        fetchPriceRecommendation();
      }
      setCurrentStep(currentStep + 1);
    } else if (currentStep < 5) {
      setCurrentStep(currentStep + 1);
    }
  };

  const handleBack = () => {
    if (currentStep > 1) setCurrentStep(currentStep - 1);
  };

  const handleRegenerate = () => {
    generateListingWithAI();
  };

  const handleSubmit = async () => {
    console.log('Sell listing submitted:', formData);
    alert('Sell listing created successfully!');
  };

  const isStepValid = () => {
    switch(currentStep) {
      case 1: return formData.uploadedImages.length > 0;
      case 2: return formData.generatedTitle.length >= 3 && formData.generatedDescription.length >= 10 && formData.uploadedImages.length > 0;
      case 3: return formData.minPrice && formData.maxPrice && parseFloat(formData.minPrice) < parseFloat(formData.maxPrice);
      case 4: return formData.shippingOptions.length > 0 && formData.availableFromDate && formData.inventoryQuantity && parseInt(formData.inventoryQuantity) > 0;
      case 5: return true;
      default: return false;
    }
  };

  return (
    <div className="min-h-screen" style={{ backgroundColor: COLORS.background }}>
      {/* Header */}
      <div className="border-b sticky top-0 z-10 shadow-sm" style={{ backgroundColor: COLORS.hoverBg }}>
        <div className="max-w-5xl mx-auto px-4 py-4 flex items-center justify-between">
          <Button variant="ghost" size="icon" onClick={handleBack}>
            <ChevronLeft className="w-5 h-5" style={{ color: COLORS.textActive }} />
          </Button>
          <div className="text-center">
            <h1 className="font-semibold text-lg" style={{ color: COLORS.textActive }}>Create Sell Listing</h1>
            <p className="text-sm" style={{ color: COLORS.text }}>Step {currentStep} of 5</p>
          </div>
          <div className="w-10"></div>
        </div>

        {/* Progress Steps */}
        <div className="max-w-5xl mx-auto px-4 pb-4 overflow-x-auto">
          <div className="flex items-center justify-between min-w-max py-2">
            {steps.map((step, index) => {
              const Icon = step.icon;
              return (
                <React.Fragment key={step.number}>
                  <div className="flex flex-col items-center">
                    <div 
                      className="w-12 h-12 rounded-full flex items-center justify-center font-semibold text-sm transition-all"
                      style={{
                        backgroundColor: currentStep > step.number ? "#F5CB5C" : 
                          currentStep === step.number ? COLORS.accentActive : '#e5e7eb',
                        color: currentStep >= step.number ? 'white' : '#6b7280',
                        transform: currentStep === step.number ? 'scale(1.1)' : 'scale(1)',
                        boxShadow: currentStep === step.number ? '0 4px 6px -1px rgba(0, 0, 0, 0.1)' : 'none'
                      }}
                    >
                      {currentStep > step.number ? <Check className="w-5 h-5" /> : <Icon className="w-5 h-5" />}
                    </div>
                    <span 
                      className="text-xs mt-2 whitespace-nowrap font-medium"
                      style={{ 
                        color: currentStep === step.number ? COLORS.textActive : COLORS.text 
                      }}
                    >
                      {step.label}
                    </span>
                  </div>
                  {index < steps.length - 1 && (
                    <div 
                      className="flex-1 h-1 mx-3 rounded transition-all"
                      style={{
                        backgroundColor: currentStep > step.number ? '#F5CB5C' : '#e5e7eb'
                      }}
                    />
                  )}
                </React.Fragment>
              );
            })}
          </div>
        </div>
      </div>

      {/* Content */}
      <div className="max-w-5xl mx-auto px-4 py-8">
        <Card className="shadow-lg" style={{ backgroundColor: 'white' }}>
          <CardContent className="p-8">
            
            {/* Step 1: Upload Photos */}
            {currentStep === 1 && (
              <div className="space-y-6">
                <div className="text-center mb-8">
                  <div 
                    className="w-20 h-20 rounded-3xl flex items-center justify-center mx-auto mb-4 shadow-lg"
                    style={{ background: `linear-gradient(to bottom right, ${COLORS.accentFrom}, ${COLORS.accentTo})` }}
                  >
                    <Camera className="w-10 h-10" style={{ color: COLORS.textActive }} />
                  </div>
                  <h2 className="text-3xl font-bold mb-2" style={{ color: COLORS.textActive }}>Upload Product Photos</h2>
                  <p className="text-lg" style={{ color: COLORS.text }}>Add clear photos of your item from different angles</p>
                </div>

                <div className="max-w-3xl mx-auto">
                  {/* Image Grid */}
                  <div className="grid grid-cols-2 md:grid-cols-3 gap-4 mb-6">
                    {formData.uploadedImages.map((image, index) => (
                      <div key={index} className="relative aspect-square rounded-lg overflow-hidden bg-gray-100 border-2 group" style={{ borderColor: COLORS.hoverBg }}>
                        <img 
                          src={image} 
                          alt={`Product ${index + 1}`} 
                          className="w-full h-full object-cover"
                        />
                        <button
                          onClick={() => removeImage(index)}
                          className="absolute top-2 right-2 w-8 h-8 bg-red-500 text-white rounded-full flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity"
                        >
                          <X className="w-4 h-4" />
                        </button>
                        {index === 0 && (
                          <div className="absolute bottom-2 left-2 text-xs px-2 py-1 rounded" style={{ backgroundColor: COLORS.accentActive, color: COLORS.textActive }}>
                            Cover Photo
                          </div>
                        )}
                      </div>
                    ))}
                    
                    {/* Upload Button */}
                    {formData.uploadedImages.length < 5 && (
                      <label 
                        className="aspect-square rounded-lg border-2 border-dashed flex flex-col items-center justify-center cursor-pointer transition-colors"
                        style={{ 
                          borderColor: COLORS.hoverBg,
                          backgroundColor: COLORS.background 
                        }}
                        onMouseEnter={(e) => e.currentTarget.style.borderColor = COLORS.accentActive}
                        onMouseLeave={(e) => e.currentTarget.style.borderColor = COLORS.hoverBg}
                      >
                        <Upload className="w-8 h-8 mb-2" style={{ color: COLORS.text }} />
                        <span className="text-sm" style={{ color: COLORS.text }}>Add Photo</span>
                        <span className="text-xs mt-1" style={{ color: COLORS.text }}>{formData.uploadedImages.length}/5</span>
                        <input
                          type="file"
                          accept="image/*"
                          multiple
                          onChange={handleImageUpload}
                          className="hidden"
                        />
                      </label>
                    )}
                  </div>

                  <Alert style={{ backgroundColor: COLORS.hoverBg, borderColor: COLORS.accentActive }}>
                    <Camera className="w-4 h-4" style={{ color: COLORS.textActive }} />
                    <AlertDescription style={{ color: COLORS.textActive }}>
                      <strong>Photo Tips:</strong> Use good lighting, show multiple angles, include close-ups of any defects or special features. First photo will be your cover image.
                    </AlertDescription>
                  </Alert>

                  {/* Demo Button */}
                  {formData.uploadedImages.length === 0 && (
                    <Button
                      variant="outline"
                      className="w-full mt-4"
                      onClick={addSampleImages}
                      style={{ borderColor: COLORS.accentActive, color: COLORS.textActive }}
                    >
                      <Sparkles className="w-4 h-4 mr-2" />
                      Use Sample Images (Demo)
                    </Button>
                  )}
                </div>
              </div>
            )}

            {/* Step 2: AI Generation (Now Editable) */}
            {currentStep === 2 && (
              <div className="space-y-6">
                {isGenerating ? (
                  <div className="text-center py-16">
                    <div 
                      className="w-20 h-20 rounded-3xl flex items-center justify-center mx-auto mb-6 animate-pulse"
                      style={{ background: `linear-gradient(to bottom right, ${COLORS.accentFrom}, ${COLORS.accentTo})` }}
                    >
                      <Sparkles className="w-10 h-10" style={{ color: COLORS.textActive }} />
                    </div>
                    <h2 className="text-2xl font-bold mb-3" style={{ color: COLORS.textActive }}>AI is Analyzing Your Photos...</h2>
                    <p className="mb-6" style={{ color: COLORS.text }}>Identifying product details and generating description</p>
                    <Loader2 className="w-8 h-8 animate-spin mx-auto" style={{ color: COLORS.accentActive }} />
                  </div>
                ) : (
                  <>
                    <div className="text-center mb-8">
                      <div 
                        className="w-20 h-20 rounded-3xl flex items-center justify-center mx-auto mb-4 shadow-lg"
                        style={{ background: `linear-gradient(to bottom right, ${COLORS.accentFrom}, ${COLORS.accentTo})` }}
                      >
                        <Sparkles className="w-10 h-10" style={{ color: COLORS.textActive }} />
                      </div>
                      <h2 className="text-3xl font-bold mb-2" style={{ color: COLORS.textActive }}>AI Generated Your Listing!</h2>
                      <p className="text-lg" style={{ color: COLORS.text }}>Review and edit as needed</p>
                    </div>

                    <div className="max-w-3xl mx-auto space-y-6">
                      {/* Edit Images */}
                      <div>
                        <Label className="text-base font-medium mb-3 block" style={{ color: COLORS.textActive }}>
                          Product Photos
                        </Label>
                        <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                          {formData.uploadedImages.map((image, index) => (
                            <div key={index} className="relative aspect-square rounded-lg overflow-hidden bg-gray-100 border-2 group" style={{ borderColor: COLORS.hoverBg }}>
                              <img 
                                src={image} 
                                alt={`Product ${index + 1}`} 
                                className="w-full h-full object-cover"
                              />
                              <button
                                onClick={() => removeImage(index)}
                                className="absolute top-2 right-2 w-8 h-8 bg-red-500 text-white rounded-full flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity"
                              >
                                <X className="w-4 h-4" />
                              </button>
                              {index === 0 && (
                                <div className="absolute bottom-2 left-2 text-xs px-2 py-1 rounded" style={{ backgroundColor: COLORS.accentActive, color: COLORS.textActive }}>
                                  Cover Photo
                                </div>
                              )}
                            </div>
                          ))}
                          
                          {formData.uploadedImages.length < 5 && (
                            <label 
                              className="aspect-square rounded-lg border-2 border-dashed flex flex-col items-center justify-center cursor-pointer transition-colors"
                              style={{ 
                                borderColor: COLORS.hoverBg,
                                backgroundColor: COLORS.background 
                              }}
                              onMouseEnter={(e) => e.currentTarget.style.borderColor = COLORS.accentActive}
                              onMouseLeave={(e) => e.currentTarget.style.borderColor = COLORS.hoverBg}
                            >
                              <Upload className="w-6 h-6 mb-1" style={{ color: COLORS.text }} />
                              <span className="text-xs" style={{ color: COLORS.text }}>Add More</span>
                              <input
                                type="file"
                                accept="image/*"
                                multiple
                                onChange={handleImageUpload}
                                className="hidden"
                              />
                            </label>
                          )}
                        </div>
                      </div>

                      {/* Edit Title */}
                      <div>
                        <Label htmlFor="title" className="text-base font-medium" style={{ color: COLORS.textActive }}>
                          Title <span className="text-red-500">*</span>
                        </Label>
                        <Input
                          id="title"
                          value={formData.generatedTitle}
                          onChange={(e) => setFormData({...formData, generatedTitle: e.target.value})}
                          placeholder="Enter listing title"
                          className="mt-2 text-base"
                          maxLength={100}
                          style={{ borderColor: COLORS.hoverBg }}
                        />
                        <p className="text-sm mt-1" style={{ color: COLORS.text }}>{formData.generatedTitle.length}/100 characters</p>
                      </div>

                      {/* Edit Description */}
                      <div>
                        <Label htmlFor="description" className="text-base font-medium" style={{ color: COLORS.textActive }}>
                          Description <span className="text-red-500">*</span>
                        </Label>
                        <Textarea
                          id="description"
                          value={formData.generatedDescription}
                          onChange={(e) => setFormData({...formData, generatedDescription: e.target.value})}
                          className="mt-2 min-h-[250px] text-base"
                          maxLength={1000}
                          style={{ borderColor: COLORS.hoverBg }}
                        />
                        <p className="text-sm mt-1" style={{ color: COLORS.text }}>{formData.generatedDescription.length}/1000 characters</p>
                      </div>

                      <Button 
                        variant="outline" 
                        className="w-full"
                        onClick={handleRegenerate}
                        style={{ borderColor: COLORS.accentActive, color: COLORS.textActive }}
                      >
                        <RefreshCw className="w-4 h-4 mr-2" />
                        Regenerate with AI
                      </Button>
                    </div>
                  </>
                )}
              </div>
            )}

            {/* Step 3: Pricing */}
            {currentStep === 3 && (
              <div className="space-y-6">
                <div className="text-center mb-8">
                  <div 
                    className="w-20 h-20 rounded-3xl flex items-center justify-center mx-auto mb-4 shadow-lg"
                    style={{ background: `linear-gradient(to bottom right, ${COLORS.accentFrom}, ${COLORS.accentTo})` }}
                  >
                    <DollarSign className="w-10 h-10" style={{ color: COLORS.textActive }} />
                  </div>
                  <h2 className="text-3xl font-bold mb-2" style={{ color: COLORS.textActive }}>Set Your Price</h2>
                  <p className="text-lg" style={{ color: COLORS.text }}>Define your selling price range</p>
                </div>

                <div className="max-w-2xl mx-auto space-y-8">
                  {/* Recommended Price Range */}
                  {recommendedPriceRange.average > 0 && (
                    <Alert style={{ backgroundColor: COLORS.hoverBg, borderColor: COLORS.accentActive }}>
                      <Sparkles className="w-5 h-5" style={{ color: COLORS.textActive }} />
                      <AlertDescription>
                        <div className="space-y-2">
                          <p className="font-semibold" style={{ color: COLORS.textActive }}>AI-Recommended Price Range</p>
                          <div className="grid grid-cols-3 gap-4 mt-3">
                            <div className="bg-white rounded-lg p-3 text-center border" style={{ borderColor: COLORS.accentActive }}>
                              <p className="text-xs mb-1" style={{ color: COLORS.text }}>Low</p>
                              <p className="text-lg font-bold" style={{ color: COLORS.textActive }}>${recommendedPriceRange.min}</p>
                            </div>
                            <div className="bg-white rounded-lg p-3 text-center border-2" style={{ borderColor: COLORS.accentActive }}>
                              <p className="text-xs mb-1" style={{ color: COLORS.text }}>Market Average</p>
                              <p className="text-lg font-bold" style={{ color: COLORS.textActive }}>${recommendedPriceRange.average}</p>
                            </div>
                            <div className="bg-white rounded-lg p-3 text-center border" style={{ borderColor: COLORS.accentActive }}>
                              <p className="text-xs mb-1" style={{ color: COLORS.text }}>High</p>
                              <p className="text-lg font-bold" style={{ color: COLORS.textActive }}>${recommendedPriceRange.max}</p>
                            </div>
                          </div>
                          <p className="text-sm mt-2" style={{ color: COLORS.text }}>Based on recent similar items sold</p>
                        </div>
                      </AlertDescription>
                    </Alert>
                  )}

                  {/* Price Range Input */}
                  <div className="space-y-4">
                    <Label className="text-base font-medium" style={{ color: COLORS.textActive }}>
                      Your Selling Price Range <span className="text-red-500">*</span>
                    </Label>
                    
                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <Label htmlFor="minPrice" className="text-sm" style={{ color: COLORS.text }}>Minimum Price</Label>
                        <div className="flex gap-2 mt-2">
                          <select
                            value={formData.currency}
                            onChange={(e) => setFormData({...formData, currency: e.target.value})}
                            className="px-3 py-2 border rounded-lg"
                            style={{ borderColor: COLORS.hoverBg }}
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
                            className="text-base"
                            style={{ borderColor: COLORS.hoverBg }}
                            step="0.01"
                            min="0"
                          />
                        </div>
                      </div>

                      <div>
                        <Label htmlFor="maxPrice" className="text-sm" style={{ color: COLORS.text }}>Maximum Price</Label>
                        <div className="flex gap-2 mt-2">
                          <div className="px-3 py-2 border rounded-lg flex items-center" style={{ backgroundColor: COLORS.background, borderColor: COLORS.hoverBg, color: COLORS.text }}>
                            {formData.currency}
                          </div>
                          <Input
                            id="maxPrice"
                            type="number"
                            value={formData.maxPrice}
                            onChange={(e) => setFormData({...formData, maxPrice: e.target.value})}
                            placeholder="0.00"
                            className="text-base"
                            style={{ borderColor: COLORS.hoverBg }}
                            step="0.01"
                            min="0"
                          />
                        </div>
                      </div>
                    </div>

                    {formData.minPrice && formData.maxPrice && (
                      <div className="rounded-lg p-4 border" style={{ backgroundColor: COLORS.background, borderColor: COLORS.hoverBg }}>
                        <p className="text-sm mb-2" style={{ color: COLORS.text }}>Your Selling Price Range:</p>
                        <p className="text-2xl font-bold" style={{ color: COLORS.textActive }}>
                          {formData.currency} {formData.minPrice} - {formData.currency} {formData.maxPrice}
                        </p>
                      </div>
                    )}
                  </div>

                  <Alert style={{ backgroundColor: COLORS.hoverBg, borderColor: COLORS.accentActive }}>
                    <AlertDescription style={{ color: COLORS.textActive }}>
                      <strong>Tip:</strong> Set a price range to allow negotiation flexibility. Buyers can make offers within your range!
                    </AlertDescription>
                  </Alert>
                </div>
              </div>
            )}

            {/* Step 4: Shipping */}
            {currentStep === 4 && (
              <div className="space-y-6">
                <div className="text-center mb-8">
                  <div 
                    className="w-20 h-20 rounded-3xl flex items-center justify-center mx-auto mb-4 shadow-lg"
                    style={{ background: `linear-gradient(to bottom right, ${COLORS.accentFrom}, ${COLORS.accentTo})` }}
                  >
                    <Truck className="w-10 h-10" style={{ color: COLORS.textActive }} />
                  </div>
                  <h2 className="text-3xl font-bold mb-2" style={{ color: COLORS.textActive }}>Shipping Options</h2>
                  <p className="text-lg" style={{ color: COLORS.text }}>How will you deliver the item to buyers?</p>
                </div>

                <div className="max-w-2xl mx-auto space-y-4">
                  <Label className="text-base font-medium mb-4 block" style={{ color: COLORS.textActive }}>
                    Select Shipping Options <span className="text-red-500">*</span>
                  </Label>

                  {[
                    { 
                      value: 'Meet in person', 
                      label: 'Meet in Person', 
                      description: 'Arrange a meetup at a public location',
                      icon: '🤝'
                    },
                    { 
                      value: 'Local delivery', 
                      label: 'Local Delivery', 
                      description: 'Deliver within local area',
                      icon: '🚗'
                    },
                    { 
                      value: 'Nationwide shipping', 
                      label: 'Nationwide Shipping', 
                      description: 'Ship via courier within the country',
                      icon: '📦'
                    },
                    { 
                      value: 'International shipping', 
                      label: 'International Shipping', 
                      description: 'Ship to international buyers',
                      icon: '✈️'
                    }
                  ].map((option) => (
                    <Card 
                      key={option.value}
                      className={`cursor-pointer transition-all hover:shadow-md border-2`}
                      style={{
                        borderColor: formData.shippingOptions.includes(option.value) ? COLORS.accentActive : COLORS.hoverBg,
                        backgroundColor: formData.shippingOptions.includes(option.value) ? COLORS.background : 'white'
                      }}
                      onClick={() => {
                        if (formData.shippingOptions.includes(option.value)) {
                          setFormData({
                            ...formData,
                            shippingOptions: formData.shippingOptions.filter(o => o !== option.value)
                          });
                        } else {
                          setFormData({
                            ...formData,
                            shippingOptions: [...formData.shippingOptions, option.value]
                          });
                        }
                      }}
                    >
                      <CardContent className="flex items-start gap-4 p-4">
                        <Checkbox
                          checked={formData.shippingOptions.includes(option.value)}
                          className="mt-1"
                        />
                        <div className="flex items-start gap-3 flex-1">
                          <span className="text-3xl">{option.icon}</span>
                          <div className="flex-1">
                            <h3 className="font-semibold text-base mb-1" style={{ color: COLORS.textActive }}>{option.label}</h3>
                            <p className="text-sm" style={{ color: COLORS.text }}>{option.description}</p>
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  ))}

                  <Alert className="mt-6" style={{ backgroundColor: COLORS.hoverBg, borderColor: COLORS.accentActive }}>
                    <AlertDescription style={{ color: COLORS.textActive }}>
                      Offering multiple shipping options increases your chances of finding buyers!
                    </AlertDescription>
                  </Alert>

                  {/* Shipping Availability Date & Inventory */}
                  <div className="mt-8 space-y-4">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                      {/* Available From Date */}
                      <div>
                        <Label htmlFor="fromDate" className="text-base font-medium mb-2 block" style={{ color: COLORS.textActive }}>
                          Available From <span className="text-red-500">*</span>
                        </Label>
                        <p className="text-sm mb-3" style={{ color: COLORS.text }}>
                          When will this item be available for shipping?
                        </p>
                        <Input
                          id="fromDate"
                          type="date"
                          value={formData.availableFromDate}
                          onChange={(e) => setFormData({...formData, availableFromDate: e.target.value})}
                          className="text-base"
                          style={{ borderColor: COLORS.hoverBg }}
                          min={new Date().toISOString().split('T')[0]}
                        />
                      </div>

                      {/* Inventory Quantity */}
                      <div>
                        <Label htmlFor="inventoryQuantity" className="text-base font-medium mb-2 block" style={{ color: COLORS.textActive }}>
                          Units Available <span className="text-red-500">*</span>
                        </Label>
                        <p className="text-sm mb-3" style={{ color: COLORS.text }}>
                          How many units do you have in stock?
                        </p>
                        <Input
                          id="inventoryQuantity"
                          type="number"
                          value={formData.inventoryQuantity}
                          onChange={(e) => setFormData({...formData, inventoryQuantity: e.target.value})}
                          placeholder="Enter quantity"
                          className="text-base"
                          style={{ borderColor: COLORS.hoverBg }}
                          min="1"
                          step="1"
                        />
                      </div>
                    </div>

                    {/* Preview */}
                    {formData.availableFromDate && formData.inventoryQuantity && (
                      <div className="rounded-lg p-4 border mt-4" style={{ backgroundColor: COLORS.background, borderColor: COLORS.accentActive }}>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                          <div>
                            <p className="text-sm mb-1" style={{ color: COLORS.text }}>Available from:</p>
                            <p className="font-semibold text-base" style={{ color: COLORS.textActive }}>
                              {new Date(formData.availableFromDate).toLocaleDateString('en-US', { 
                                year: 'numeric', 
                                month: 'long', 
                                day: 'numeric' 
                              })}
                            </p>
                          </div>
                          <div>
                            <p className="text-sm mb-1" style={{ color: COLORS.text }}>Inventory:</p>
                            <p className="font-semibold text-base" style={{ color: COLORS.textActive }}>
                              {formData.inventoryQuantity} {parseInt(formData.inventoryQuantity) === 1 ? 'unit' : 'units'} in stock
                            </p>
                          </div>
                        </div>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            )}

            {/* Step 5: Preview */}
            {currentStep === 5 && (
              <div className="space-y-6">
                <div className="text-center mb-8">
                  <div 
                    className="w-20 h-20 rounded-3xl flex items-center justify-center mx-auto mb-4 shadow-lg"
                    style={{ background: `linear-gradient(to bottom right, ${COLORS.accentFrom}, ${COLORS.accentTo})` }}
                  >
                    <Eye className="w-10 h-10" style={{ color: COLORS.textActive }} />
                  </div>
                  <h2 className="text-3xl font-bold mb-2" style={{ color: COLORS.textActive }}>Review Your Listing</h2>
                  <p className="text-lg" style={{ color: COLORS.text }}>Make sure everything looks good before publishing</p>
                </div>

                <div className="max-w-4xl mx-auto">
                  <Card className="overflow-hidden border-2" style={{ backgroundColor: 'white', borderColor: COLORS.hoverBg }}>
                    <div className="h-2" style={{ background: `linear-gradient(to right, ${COLORS.accentFrom}, ${COLORS.accentTo})` }}></div>
                    <CardHeader style={{ backgroundColor: COLORS.background }}>
                      <div className="flex items-start justify-between">
                        <div className="flex-1">
                          <CardTitle className="text-2xl mb-2" style={{ color: COLORS.textActive }}>{formData.generatedTitle}</CardTitle>
                          <CardDescription className="text-base">
                            <span className="inline-flex items-center gap-2 font-semibold" style={{ color: COLORS.textActive }}>
                              <DollarSign className="w-4 h-4" />
                              For Sale
                            </span>
                          </CardDescription>
                        </div>
                      </div>
                    </CardHeader>
                    <CardContent className="p-6 space-y-6">
                      {/* Image Gallery Preview */}
                      <div>
                        <h3 className="font-semibold text-lg mb-3" style={{ color: COLORS.textActive }}>Product Photos</h3>
                        <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                          {formData.uploadedImages.map((image, index) => (
                            <div key={index} className="relative aspect-square rounded-lg overflow-hidden bg-gray-100 border" style={{ borderColor: COLORS.hoverBg }}>
                              <img 
                                src={image} 
                                alt={`Product ${index + 1}`} 
                                className="w-full h-full object-cover"
                              />
                              {index === 0 && (
                                <div className="absolute bottom-2 left-2 text-xs px-2 py-1 rounded" style={{ backgroundColor: COLORS.accentActive, color: COLORS.textActive }}>
                                  Cover
                                </div>
                              )}
                            </div>
                          ))}
                        </div>
                      </div>

                      {/* Description */}
                      <div>
                        <h3 className="font-semibold text-lg mb-3" style={{ color: COLORS.textActive }}>Description</h3>
                        <p className="whitespace-pre-wrap leading-relaxed" style={{ color: COLORS.text }}>
                          {formData.generatedDescription}
                        </p>
                      </div>

                      {/* Price Range */}
                      <div className="border rounded-lg p-4" style={{ backgroundColor: COLORS.background, borderColor: COLORS.accentActive }}>
                        <h3 className="font-semibold text-lg mb-3" style={{ color: COLORS.textActive }}>Price Range</h3>
                        <div className="flex items-center gap-4">
                          <div className="flex-1">
                            <p className="text-sm mb-1" style={{ color: COLORS.text }}>Minimum</p>
                            <p className="text-2xl font-bold" style={{ color: COLORS.textActive }}>
                              {formData.currency} {formData.minPrice}
                            </p>
                          </div>
                          <div className="text-2xl" style={{ color: COLORS.accentActive }}>→</div>
                          <div className="flex-1">
                            <p className="text-sm mb-1" style={{ color: COLORS.text }}>Maximum</p>
                            <p className="text-2xl font-bold" style={{ color: COLORS.textActive }}>
                              {formData.currency} {formData.maxPrice}
                            </p>
                          </div>
                        </div>
                      </div>

                      {/* Shipping Options */}
                      <div>
                        <h3 className="font-semibold text-lg mb-3" style={{ color: COLORS.textActive }}>Available Shipping Methods</h3>
                        <div className="flex flex-wrap gap-2">
                          {formData.shippingOptions.map((option) => (
                            <span 
                              key={option}
                              className="px-4 py-2 rounded-full text-sm font-medium"
                              style={{ backgroundColor: COLORS.activeBg, color: COLORS.textActive }}
                            >
                              {option}
                            </span>
                          ))}
                        </div>
                      </div>

                      {/* Shipping Availability */}
                      {formData.availableFromDate && formData.inventoryQuantity && (
                        <div className="border rounded-lg p-4" style={{ backgroundColor: COLORS.background, borderColor: COLORS.hoverBg }}>
                          <h3 className="font-semibold text-lg mb-3" style={{ color: COLORS.textActive }}>Availability & Inventory</h3>
                          <div className="space-y-2">
                            <p className="text-base" style={{ color: COLORS.text }}>
                              Available from{' '}
                              <span className="font-semibold" style={{ color: COLORS.textActive }}>
                                {new Date(formData.availableFromDate).toLocaleDateString('en-US', { 
                                  year: 'numeric', 
                                  month: 'long', 
                                  day: 'numeric' 
                                })}
                              </span>
                            </p>
                            <p className="text-base" style={{ color: COLORS.text }}>
                              <span className="font-semibold" style={{ color: COLORS.textActive }}>
                                {formData.inventoryQuantity} {parseInt(formData.inventoryQuantity) === 1 ? 'unit' : 'units'}
                              </span>
                              {' '}in stock
                            </p>
                          </div>
                        </div>
                      )}
                    </CardContent>
                  </Card>

                  {/* Edit Quick Links */}
                  <div className="mt-6 flex flex-wrap gap-3 justify-center">
                    <Button 
                      variant="outline" 
                      size="sm"
                      onClick={() => setCurrentStep(2)}
                      style={{ borderColor: COLORS.accentActive, color: COLORS.textActive }}
                    >
                      <Edit3 className="w-4 h-4 mr-2" />
                      Edit Details
                    </Button>
                    <Button 
                      variant="outline" 
                      size="sm"
                      onClick={() => setCurrentStep(3)}
                      style={{ borderColor: COLORS.accentActive, color: COLORS.textActive }}
                    >
                      <DollarSign className="w-4 h-4 mr-2" />
                      Edit Pricing
                    </Button>
                    <Button 
                      variant="outline" 
                      size="sm"
                      onClick={() => setCurrentStep(4)}
                      style={{ borderColor: COLORS.accentActive, color: COLORS.textActive }}
                    >
                      <Truck className="w-4 h-4 mr-2" />
                      Edit Shipping
                    </Button>
                  </div>
                </div>
              </div>
            )}

            {/* Action Buttons */}
            <div className="flex justify-between items-center mt-8 pt-6 border-t" style={{ borderColor: COLORS.hoverBg }}>
              <Button
                variant="outline"
                onClick={handleBack}
                disabled={currentStep === 1 || isGenerating}
                className="px-6"
                style={{ 
                  borderColor: COLORS.hoverBg, 
                  color: COLORS.textActive,
                  opacity: (currentStep === 1 || isGenerating) ? 0.5 : 1 
                }}
              >
                <ChevronLeft className="w-4 h-4 mr-2" />
                Back
              </Button>

              {currentStep < 5 ? (
                <Button
                  onClick={handleNext}
                  disabled={!isStepValid() || isGenerating}
                  className="px-6"
                  style={{ 
                    backgroundColor: (!isStepValid() || isGenerating) ? COLORS.hoverBg : (hoveredButton === 'next' ? COLORS.accentFrom : COLORS.accentActive),
                    color: COLORS.textActive,
                    opacity: (!isStepValid() || isGenerating) ? 0.5 : 1,
                    border: 'none'
                  }}
                  onMouseEnter={() => setHoveredButton('next')}
                  onMouseLeave={() => setHoveredButton(null)}
                >
                  {currentStep === 1 ? (
                    <>
                      <Sparkles className="w-4 h-4 mr-2" />
                      Generate with AI
                    </>
                  ) : (
                    <>
                      Continue
                      <ChevronRight className="w-4 h-4 ml-2" />
                    </>
                  )}
                </Button>
              ) : (
                <Button
                  onClick={handleSubmit}
                  disabled={!isStepValid()}
                  className="px-8 text-lg font-semibold"
                  style={{ 
                    backgroundColor: !isStepValid() ? COLORS.hoverBg : (hoveredButton === 'submit' ? COLORS.accentFrom : COLORS.accentActive),
                    color: COLORS.textActive,
                    opacity: !isStepValid() ? 0.5 : 1,
                    border: 'none'
                  }}
                  onMouseEnter={() => setHoveredButton('submit')}
                  onMouseLeave={() => setHoveredButton(null)}
                >
                  <Check className="w-5 h-5 mr-2" />
                  Publish Sell Listing
                </Button>
              )}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}