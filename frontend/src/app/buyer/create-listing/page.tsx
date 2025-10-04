'use client';

import React, { useState } from 'react';
import { Search, Sparkles, Edit3, DollarSign, Truck, Eye, Check, ChevronLeft, ChevronRight, Loader2, RefreshCw } from 'lucide-react';
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
  userDescription: string;
  generatedTitle: string;
  generatedDescription: string;
  generatedImage: string;
  minPrice: string;
  maxPrice: string;
  currency: string;
  quantity: string;
  shippingOptions: string[];
}

export default function CreateBuyListingPage() {
  const [currentStep, setCurrentStep] = useState(1);
  const [isGenerating, setIsGenerating] = useState(false);
  const [formData, setFormData] = useState<FormData>({
    userDescription: '',
    generatedTitle: '',
    generatedDescription: '',
    generatedImage: '',
    minPrice: '',
    maxPrice: '',
    currency: 'MYR',
    quantity: '1',
    shippingOptions: []
  });

  const [recommendedPriceRange, setRecommendedPriceRange] = useState({
    min: 0,
    max: 0,
    average: 0
  });

  const steps = [
    { number: 1, label: 'Describe', icon: Search },
    { number: 2, label: 'AI Generate', icon: Sparkles },
    { number: 3, label: 'Pricing', icon: DollarSign },
    { number: 4, label: 'Shipping', icon: Truck },
    { number: 5, label: 'Preview', icon: Eye }
  ];

  const generateListingWithAI = async () => {
    setIsGenerating(true);
    await new Promise(resolve => setTimeout(resolve, 2500));
    
    const mockData = {
      title: 'Air Jordan Retro Basketball Shoes - Red Edition (2005)',
      description: `Looking for authentic Air Jordan basketball shoes from the iconic 2005 collection in vibrant red colorway. These classic sneakers represent the perfect blend of style and performance, featuring the signature Jordan design elements and premium materials.

Key Features Desired:
• Authentic 2005 Air Jordan model
• Red color scheme (primary or accent)
• Original or well-maintained condition
• Complete with original box and accessories (preferred)
• Size: Open to various sizes
• Gender: Unisex models accepted

Condition: Prefer gently used to new condition. Minor wear acceptable if reflected in price. Must have no major defects, sole separation, or structural damage.`,
      image: 'https://images.unsplash.com/photo-1542291026-7eec264c27ff?w=800&h=800&fit=crop'
    };

    setFormData(prev => ({
      ...prev,
      generatedTitle: mockData.title,
      generatedDescription: mockData.description,
      generatedImage: mockData.image
    }));

    setIsGenerating(false);
    setCurrentStep(2);
  };

  const fetchPriceRecommendation = async () => {
    await new Promise(resolve => setTimeout(resolve, 1000));
    
    setRecommendedPriceRange({
      min: 150,
      max: 450,
      average: 280
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
    console.log('Buy listing submitted:', formData);
    alert('Buy listing created successfully!');
  };

  const isStepValid = () => {
    switch(currentStep) {
      case 1: return formData.userDescription.length >= 10;
      case 2: return formData.generatedTitle.length >= 3 && formData.generatedDescription.length >= 10;
      case 3: return formData.minPrice && formData.maxPrice && formData.quantity && parseInt(formData.quantity) > 0 && parseFloat(formData.minPrice) < parseFloat(formData.maxPrice);
      case 4: return formData.shippingOptions.length > 0;
      case 5: return true;
      default: return false;
    }
  };

  return (
    <div className="min-h-screen" style={{ backgroundColor: COLORS.background }}>
      <div className="border-b sticky top-0 z-10 shadow-sm" style={{ backgroundColor: COLORS.hoverBg }}>
        <div className="max-w-5xl mx-auto px-4 py-4 flex items-center justify-between">
          <Button variant="ghost" size="icon" onClick={handleBack}>
            <ChevronLeft className="w-5 h-5" style={{ color: COLORS.textActive }} />
          </Button>
          <div className="text-center">
            <h1 className="font-semibold text-lg" style={{ color: COLORS.textActive }}>Create Buy Listing</h1>
            <p className="text-sm" style={{ color: COLORS.text }}>Step {currentStep} of 5</p>
          </div>
          <div className="w-10"></div>
        </div>

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

      <div className="max-w-5xl mx-auto px-4 py-8">
        <Card className="shadow-lg">
          <CardContent className="p-8">
            
            {currentStep === 1 && (
              <div className="space-y-6">
                <div className="text-center mb-8">
                  <div 
                    className="w-20 h-20 rounded-3xl flex items-center justify-center mx-auto mb-4 shadow-lg"
                    style={{
                      background: `linear-gradient(135deg, ${COLORS.accentFrom} 0%, ${COLORS.accentTo} 100%)`
                    }}
                  >
                    <Search className="w-10 h-10 text-white" />
                  </div>
                  <h2 className="text-3xl font-bold mb-2" style={{ color: COLORS.textActive }}>What are you looking for?</h2>
                  <p className="text-lg" style={{ color: COLORS.text }}>Describe the item you want to buy in detail</p>
                </div>

                <div className="max-w-2xl mx-auto">
                  <Label htmlFor="description" className="text-base font-medium" style={{ color: COLORS.textActive }}>
                    Item Description <span className="text-red-500">*</span>
                  </Label>
                  <Textarea
                    id="description"
                    value={formData.userDescription}
                    onChange={(e) => setFormData({...formData, userDescription: e.target.value})}
                    placeholder="Example: I'm looking for a pair of red Air Jordan basketball shoes from 2005. Preferably in good condition with minimal wear..."
                    className="mt-2 min-h-[200px] text-base resize-none"
                    maxLength={500}
                  />
                  <div className="flex justify-between items-center mt-2">
                    <span className="text-sm" style={{ color: COLORS.text }}>{formData.userDescription.length}/500 characters</span>
                    <span className="text-sm" style={{ color: COLORS.text }}>Minimum 10 characters</span>
                  </div>

                  <Alert className="mt-6" style={{ backgroundColor: COLORS.hoverBg, borderColor: COLORS.accentTo }}>
                    <Sparkles className="w-4 h-4" style={{ color: COLORS.textActive }} />
                    <AlertDescription style={{ color: COLORS.textActive }}>
                      <strong>Pro Tip:</strong> Be specific about brand, model, color, year, size, and condition preferences for better AI-generated results!
                    </AlertDescription>
                  </Alert>
                </div>
              </div>
            )}

            {currentStep === 2 && (
              <div className="space-y-6">
                {isGenerating ? (
                  <div className="text-center py-16">
                    <div 
                      className="w-20 h-20 rounded-3xl flex items-center justify-center mx-auto mb-6 animate-pulse"
                      style={{
                        background: `linear-gradient(135deg, ${COLORS.accentFrom} 0%, ${COLORS.accentTo} 100%)`
                      }}
                    >
                      <Sparkles className="w-10 h-10 text-white" />
                    </div>
                    <h2 className="text-2xl font-bold mb-3" style={{ color: COLORS.textActive }}>AI is Creating Your Listing...</h2>
                    <p className="mb-6" style={{ color: COLORS.text }}>Analyzing your description and generating content</p>
                    <Loader2 className="w-8 h-8 animate-spin mx-auto" style={{ color: COLORS.accentActive }} />
                  </div>
                ) : (
                  <>
                    <div className="text-center mb-8">
                      <div 
                        className="w-20 h-20 rounded-3xl flex items-center justify-center mx-auto mb-4 shadow-lg"
                        style={{
                          background: `linear-gradient(135deg, ${COLORS.accentFrom} 0%, ${COLORS.accentTo} 100%)`
                        }}
                      >
                        <Sparkles className="w-10 h-10 text-white" />
                      </div>
                      <h2 className="text-3xl font-bold mb-2" style={{ color: COLORS.textActive }}>AI Generated Your Listing!</h2>
                      <p className="text-lg" style={{ color: COLORS.text }}>Review and edit as needed</p>
                    </div>

                    <div className="max-w-3xl mx-auto space-y-6">
                      <div>
                        <Label htmlFor="imageUrl" className="text-base font-medium mb-3 block" style={{ color: COLORS.textActive }}>
                          Product Image
                        </Label>
                        <div className="space-y-3">
                          <div className="relative aspect-video rounded-lg overflow-hidden bg-gray-100 border-2" style={{ borderColor: COLORS.hoverBg }}>
                            <img 
                              src={formData.generatedImage} 
                              alt="Product" 
                              className="w-full h-full object-cover"
                            />
                          </div>
                          <Input
                            id="imageUrl"
                            value={formData.generatedImage}
                            onChange={(e) => setFormData({...formData, generatedImage: e.target.value})}
                            placeholder="Enter image URL to change"
                            className="text-base"
                            style={{ borderColor: COLORS.hoverBg }}
                          />
                          <p className="text-sm" style={{ color: COLORS.text }}>Paste a new image URL to update the preview</p>
                        </div>
                      </div>

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

            {currentStep === 3 && (
              <div className="space-y-6">
                <div className="text-center mb-8">
                  <div 
                    className="w-20 h-20 rounded-3xl flex items-center justify-center mx-auto mb-4 shadow-lg"
                    style={{
                      background: `linear-gradient(135deg, ${COLORS.accentFrom} 0%, ${COLORS.accentTo} 100%)`
                    }}
                  >
                    <DollarSign className="w-10 h-10 text-white" />
                  </div>
                  <h2 className="text-3xl font-bold mb-2" style={{ color: COLORS.textActive }}>Set Your Budget</h2>
                  <p className="text-lg" style={{ color: COLORS.text }}>Define your price range for this item</p>
                </div>

                <div className="max-w-2xl mx-auto space-y-8">
                  {recommendedPriceRange.average > 0 && (
                    <Alert style={{ background: `linear-gradient(to right, ${COLORS.hoverBg}, ${COLORS.background})`, borderColor: COLORS.accentTo }}>
                      <Sparkles className="w-5 h-5" style={{ color: COLORS.textActive }} />
                      <AlertDescription>
                        <div className="space-y-2">
                          <p className="font-semibold" style={{ color: COLORS.textActive }}>AI-Recommended Price Range</p>
                          <div className="grid grid-cols-3 gap-4 mt-3">
                            <div className="bg-white rounded-lg p-3 text-center border" style={{ borderColor: COLORS.accentTo }}>
                              <p className="text-xs mb-1" style={{ color: COLORS.text }}>Minimum</p>
                              <p className="text-lg font-bold" style={{ color: COLORS.textActive }}>${recommendedPriceRange.min}</p>
                            </div>
                            <div className="bg-white rounded-lg p-3 text-center border-2" style={{ borderColor: COLORS.accentActive }}>
                              <p className="text-xs mb-1" style={{ color: COLORS.text }}>Average</p>
                              <p className="text-lg font-bold" style={{ color: COLORS.textActive }}>${recommendedPriceRange.average}</p>
                            </div>
                            <div className="bg-white rounded-lg p-3 text-center border" style={{ borderColor: COLORS.accentTo }}>
                              <p className="text-xs mb-1" style={{ color: COLORS.text }}>Maximum</p>
                              <p className="text-lg font-bold" style={{ color: COLORS.textActive }}>${recommendedPriceRange.max}</p>
                            </div>
                          </div>
                          <p className="text-sm mt-2" style={{ color: COLORS.text }}>Based on recent similar listings</p>
                        </div>
                      </AlertDescription>
                    </Alert>
                  )}

                  <div className="space-y-4">
                    <Label className="text-base font-medium" style={{ color: COLORS.textActive }}>
                      Your Budget Range <span className="text-red-500">*</span>
                    </Label>
                    
                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <Label htmlFor="minPrice" className="text-sm" style={{ color: COLORS.text }}>Minimum Price (per unit)</Label>
                        <div className="flex gap-2 mt-2">
                          <select
                            value={formData.currency}
                            onChange={(e) => setFormData({...formData, currency: e.target.value})}
                            className="px-3 py-2 border border-gray-300 rounded-lg"
                            style={{ color: COLORS.textActive }}
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
                            step="0.01"
                            min="0"
                          />
                        </div>
                      </div>

                      <div>
                        <Label htmlFor="maxPrice" className="text-sm" style={{ color: COLORS.text }}>Maximum Price (per unit)</Label>
                        <div className="flex gap-2 mt-2">
                          <div className="px-3 py-2 border border-gray-300 rounded-lg bg-gray-50 flex items-center" style={{ color: COLORS.text }}>
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
                      <Label htmlFor="quantity" className="text-sm" style={{ color: COLORS.text }}>Number of Units <span className="text-red-500">*</span></Label>
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
                      <p className="text-sm mt-1" style={{ color: COLORS.text }}>How many units do you want to buy?</p>
                    </div>

                    {formData.minPrice && formData.maxPrice && formData.quantity && parseInt(formData.quantity) > 0 && (
                      <div className="rounded-lg p-4 border space-y-3" style={{ backgroundColor: COLORS.activeBg }}>
                        <div>
                          <p className="text-sm mb-1" style={{ color: COLORS.text }}>Price Range per Unit:</p>
                          <p className="text-xl font-bold" style={{ color: COLORS.textActive }}>
                            {formData.currency} {formData.minPrice} - {formData.currency} {formData.maxPrice}
                          </p>
                        </div>
                        <div className="border-t pt-3" style={{ borderColor: COLORS.accentTo }}>
                          <p className="text-sm mb-1" style={{ color: COLORS.text }}>Total Budget ({formData.quantity} {parseInt(formData.quantity) === 1 ? 'unit' : 'units'}):</p>
                          <p className="text-2xl font-bold" style={{ color: COLORS.textActive }}>
                            {formData.currency} {(parseFloat(formData.minPrice) * parseInt(formData.quantity)).toFixed(2)} - {formData.currency} {(parseFloat(formData.maxPrice) * parseInt(formData.quantity)).toFixed(2)}
                          </p>
                        </div>
                      </div>
                    )}
                  </div>

                  <Alert className="bg-amber-50 border-amber-200">
                    <AlertDescription className="text-amber-800">
                      <strong>Tip:</strong> Set a realistic budget range. Sellers within your range will be able to make offers!
                    </AlertDescription>
                  </Alert>
                </div>
              </div>
            )}

            {currentStep === 4 && (
              <div className="space-y-6">
                <div className="text-center mb-8">
                  <div 
                    className="w-20 h-20 rounded-3xl flex items-center justify-center mx-auto mb-4 shadow-lg"
                    style={{
                      background: `linear-gradient(135deg, ${COLORS.accentFrom} 0%, ${COLORS.accentTo} 100%)`
                    }}
                  >
                    <Truck className="w-10 h-10 text-white" />
                  </div>
                  <h2 className="text-3xl font-bold mb-2" style={{ color: COLORS.textActive }}>Shipping Preferences</h2>
                  <p className="text-lg" style={{ color: COLORS.text }}>How would you like to receive the item?</p>
                </div>

                <div className="max-w-2xl mx-auto space-y-4">
                  <Label className="text-base font-medium mb-4 block" style={{ color: COLORS.textActive }}>
                    Select Shipping Options <span className="text-red-500">*</span>
                  </Label>

                  {[
                    { value: 'Meet in person', label: 'Meet in Person', description: 'Arrange a meetup at a public location', icon: '🤝' },
                    { value: 'Local delivery', label: 'Local Delivery', description: 'Seller delivers within local area', icon: '🚗' },
                    { value: 'Nationwide shipping', label: 'Nationwide Shipping', description: 'Courier delivery within the country', icon: '📦' },
                    { value: 'International shipping', label: 'International Shipping', description: 'Accept items from overseas sellers', icon: '✈️' }
                  ].map((option) => (
                    <Card 
                      key={option.value}
                      className="cursor-pointer transition-all hover:shadow-md"
                      style={{
                        borderWidth: '2px',
                        borderColor: formData.shippingOptions.includes(option.value) ? COLORS.accentActive : '#e5e7eb',
                        backgroundColor: formData.shippingOptions.includes(option.value) ? COLORS.activeBg : 'white'
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
                        <Checkbox checked={formData.shippingOptions.includes(option.value)} className="mt-1" />
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

                  <Alert style={{ backgroundColor: COLORS.hoverBg, borderColor: COLORS.accentTo }}>
                    <AlertDescription style={{ color: COLORS.textActive }}>
                      You can select multiple shipping options to increase your chances of finding a seller!
                    </AlertDescription>
                  </Alert>
                </div>
              </div>
            )}

            {currentStep === 5 && (
              <div className="space-y-6">
                <div className="text-center mb-8">
                  <div 
                    className="w-20 h-20 rounded-3xl flex items-center justify-center mx-auto mb-4 shadow-lg"
                    style={{
                      background: `linear-gradient(135deg, ${COLORS.accentFrom} 0%, ${COLORS.accentTo} 100%)`
                    }}
                  >
                    <Eye className="w-10 h-10 text-white" />
                  </div>
                  <h2 className="text-3xl font-bold mb-2" style={{ color: COLORS.textActive }}>Review Your Listing</h2>
                  <p className="text-lg" style={{ color: COLORS.text }}>Make sure everything looks good before publishing</p>
                </div>

                <div className="max-w-4xl mx-auto">
                  <Card className="overflow-hidden border-2">
                    <div className="h-2" style={{ background: `linear-gradient(to right, ${COLORS.accentFrom}, ${COLORS.accentTo})` }}></div>
                    <CardHeader style={{ backgroundColor: COLORS.background }}>
                      <CardTitle className="text-2xl mb-2" style={{ color: COLORS.textActive }}>{formData.generatedTitle}</CardTitle>
                      <CardDescription className="text-base">
                        <span className="inline-flex items-center gap-2 font-semibold" style={{ color: COLORS.textActive }}>
                          <Search className="w-4 h-4" />
                          Looking to Buy
                        </span>
                      </CardDescription>
                    </CardHeader>
                    <CardContent className="p-6 space-y-6">
                      <div className="aspect-video rounded-lg overflow-hidden border-2" style={{ backgroundColor: COLORS.hoverBg, borderColor: COLORS.accentTo }}>
                        <img src={formData.generatedImage} alt="Product" className="w-full h-full object-cover" />
                      </div>

                      <div>
                        <h3 className="font-semibold text-lg mb-3 flex items-center gap-2" style={{ color: COLORS.textActive }}>
                          <Edit3 className="w-5 h-5" style={{ color: COLORS.accentActive }} />
                          Description
                        </h3>
                        <div className="rounded-lg p-4 border" style={{ backgroundColor: 'white', borderColor: COLORS.hoverBg }}>
                          <p className="whitespace-pre-wrap leading-relaxed" style={{ color: COLORS.text }}>{formData.generatedDescription}</p>
                        </div>
                      </div>

                      <div className="rounded-lg p-5 border-2" style={{ backgroundColor: COLORS.activeBg, borderColor: COLORS.accentTo }}>
                        <h3 className="font-semibold text-lg mb-4 flex items-center gap-2" style={{ color: COLORS.textActive }}>
                          <DollarSign className="w-5 h-5" style={{ color: COLORS.accentActive }} />
                          Budget Range
                        </h3>
                        <div className="space-y-4">
                          <div className="flex items-center gap-4">
                            <div className="flex-1 text-center">
                              <p className="text-xs font-medium mb-2 uppercase tracking-wide" style={{ color: COLORS.text }}>Min per Unit</p>
                              <div className="bg-white rounded-lg p-3 border" style={{ borderColor: COLORS.accentTo }}>
                                <p className="text-xl font-bold" style={{ color: COLORS.textActive }}>{formData.currency} {formData.minPrice}</p>
                              </div>
                            </div>
                            <div className="text-2xl font-bold" style={{ color: COLORS.accentActive }}>→</div>
                            <div className="flex-1 text-center">
                              <p className="text-xs font-medium mb-2 uppercase tracking-wide" style={{ color: COLORS.text }}>Max per Unit</p>
                              <div className="bg-white rounded-lg p-3 border" style={{ borderColor: COLORS.accentTo }}>
                                <p className="text-xl font-bold" style={{ color: COLORS.textActive }}>{formData.currency} {formData.maxPrice}</p>
                              </div>
                            </div>
                          </div>
                          <div className="border-t pt-3" style={{ borderColor: COLORS.accentTo }}>
                            <div className="flex items-center justify-between mb-2">
                              <p className="text-sm font-medium" style={{ color: COLORS.text }}>
                                Quantity: <span className="font-bold" style={{ color: COLORS.textActive }}>{formData.quantity} {parseInt(formData.quantity) === 1 ? 'unit' : 'units'}</span>
                              </p>
                            </div>
                            <div className="bg-white rounded-lg p-4 border-2" style={{ borderColor: COLORS.accentActive }}>
                              <p className="text-xs font-medium mb-1 uppercase tracking-wide" style={{ color: COLORS.text }}>Total Budget</p>
                              <p className="text-2xl font-bold" style={{ color: COLORS.textActive }}>
                                {formData.currency} {(parseFloat(formData.minPrice) * parseInt(formData.quantity)).toFixed(2)} - {formData.currency} {(parseFloat(formData.maxPrice) * parseInt(formData.quantity)).toFixed(2)}
                              </p>
                            </div>
                          </div>
                        </div>
                      </div>

                      <div>
                        <h3 className="font-semibold text-lg mb-3 flex items-center gap-2" style={{ color: COLORS.textActive }}>
                          <Truck className="w-5 h-5" style={{ color: COLORS.accentActive }} />
                          Accepted Shipping Methods
                        </h3>
                        <div className="flex flex-wrap gap-3">
                          {formData.shippingOptions.map((option) => (
                            <div
                              key={option}
                              className="px-4 py-2 rounded-lg text-sm font-medium border-2 shadow-sm"
                              style={{ 
                                backgroundColor: 'white',
                                borderColor: COLORS.accentTo,
                                color: COLORS.textActive 
                              }}
                            >
                              {option}
                            </div>
                          ))}
                        </div>
                      </div>

                    </CardContent>
                  </Card>

                  <div className="mt-6 flex flex-wrap gap-3 justify-center">
                    <Button 
                      variant="outline" 
                      size="sm"
                      onClick={() => setCurrentStep(2)}
                      className="border-2 hover:shadow-md transition-all"
                      style={{ borderColor: COLORS.accentTo }}
                    >
                      <Edit3 className="w-4 h-4 mr-2" />
                      Edit Details
                    </Button>
                    <Button 
                      variant="outline" 
                      size="sm"
                      onClick={() => setCurrentStep(3)}
                      className="border-2 hover:shadow-md transition-all"
                      style={{ borderColor: COLORS.accentTo }}
                    >
                      <DollarSign className="w-4 h-4 mr-2" />
                      Edit Pricing
                    </Button>
                    <Button 
                      variant="outline" 
                      size="sm"
                      onClick={() => setCurrentStep(4)}
                      className="border-2 hover:shadow-md transition-all"
                      style={{ borderColor: COLORS.accentTo }}
                    >
                      <Truck className="w-4 h-4 mr-2" />
                      Edit Shipping
                    </Button>
                  </div>

                  <Alert className="mt-6" style={{ backgroundColor: COLORS.hoverBg, borderColor: COLORS.accentTo }}>
                    <Sparkles className="w-5 h-5" style={{ color: COLORS.accentActive }} />
                    <AlertDescription style={{ color: COLORS.textActive }}>
                      <strong>Ready to publish?</strong> Your listing will be visible to sellers who can make offers within your budget range. You'll receive notifications when sellers respond!
                    </AlertDescription>
                  </Alert>
                </div>
              </div>
            )}

            <div className="flex justify-between items-center mt-8 pt-6 border-t">
              <Button
                variant="outline"
                onClick={handleBack}
                disabled={currentStep === 1 || isGenerating}
                className="px-6"
              >
                <ChevronLeft className="w-4 h-4 mr-2" />
                Back
              </Button>

              {currentStep < 5 ? (
                <Button
                  onClick={handleNext}
                  disabled={!isStepValid() || isGenerating}
                  className="px-6 text-white hover:opacity-90"
                  style={{ backgroundColor: COLORS.accentActive }}
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
                  className="px-8 bg-green-600 hover:bg-green-700 text-lg font-semibold text-white"
                >
                  <Check className="w-5 h-5 mr-2" />
                  Publish Buy Listing
                </Button>
              )}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}