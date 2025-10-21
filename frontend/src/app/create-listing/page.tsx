'use client';

import React, { useState } from 'react';
import { Search, Upload, Sparkles, Edit3, DollarSign, Truck, Eye, Check, ChevronLeft, ChevronRight, Loader2, RefreshCw, X, Camera } from 'lucide-react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { Checkbox } from '@/components/ui/checkbox';
import { Alert, AlertDescription } from '@/components/ui/alert';

// Unified types for both buyer and seller listings
interface FormData {
  // Common fields
  listingType: 'buy' | 'sell' | null;
  generatedTitle: string;
  generatedDescription: string;
  minPrice: string;
  maxPrice: string;
  currency: string;
  shippingOptions: string[];

  // Buyer-specific fields
  userDescription: string;
  quantity: string;

  // Seller-specific fields
  uploadedImages: string[];
  availableFromDate: string;
  inventoryQuantity: string;
}

export default function CreateListingPage() {
  const [currentStep, setCurrentStep] = useState(0); // Start at 0 for intent selection
  const [isGenerating, setIsGenerating] = useState(false);
  const [formData, setFormData] = useState<FormData>({
    listingType: null,
    generatedTitle: '',
    generatedDescription: '',
    minPrice: '',
    maxPrice: '',
    currency: 'MYR',
    shippingOptions: [],
    userDescription: '',
    quantity: '1',
    uploadedImages: [],
    availableFromDate: '',
    inventoryQuantity: ''
  });

  const [recommendedPriceRange, setRecommendedPriceRange] = useState({
    min: 0,
    max: 0,
    average: 0
  });

  // Dynamic steps based on listing type
  const getSteps = () => {
    const baseSteps = [
      { number: 0, label: 'Intent', icon: Search }
    ];

    if (formData.listingType === 'buy') {
      return [
        ...baseSteps,
        { number: 1, label: 'Describe', icon: Search },
        { number: 2, label: 'AI Generate', icon: Sparkles },
        { number: 3, label: 'Pricing', icon: DollarSign },
        { number: 4, label: 'Shipping', icon: Truck },
        { number: 5, label: 'Preview', icon: Eye }
      ];
    } else if (formData.listingType === 'sell') {
      return [
        ...baseSteps,
        { number: 1, label: 'Upload Photos', icon: Upload },
        { number: 2, label: 'AI Generate', icon: Sparkles },
        { number: 3, label: 'Pricing', icon: DollarSign },
        { number: 4, label: 'Shipping', icon: Truck },
        { number: 5, label: 'Preview', icon: Eye }
      ];
    }

    return baseSteps;
  };

  const steps = getSteps();

  // Intent selection handler
  const handleIntentSelection = (type: 'buy' | 'sell') => {
    setFormData(prev => ({ ...prev, listingType: type }));
    setCurrentStep(1);
  };

  // Reset to intent selection
  const resetToIntent = () => {
    setFormData(prev => ({
      ...prev,
      listingType: null,
      // Reset type-specific fields
      userDescription: '',
      uploadedImages: [],
      availableFromDate: '',
      inventoryQuantity: ''
    }));
    setCurrentStep(0);
  };

  const generateListingWithAI = async () => {
    setIsGenerating(true);
    await new Promise(resolve => setTimeout(resolve, 2500));

    // Different mock data based on listing type
    const mockData = formData.listingType === 'buy' ? {
      title: 'Air Jordan 1 Retro High OG "Chicago"',
      description: `Looking for authentic Air Jordan 1 Retro High OG "Chicago" in excellent condition with minimal signs of wear.

Key Features Desired:
• Authentic Air Jordan 1 Retro High OG "Chicago"
• Red color scheme (primary or accent)
• Original or well-maintained condition
• Complete with original box and accessories (preferred)
• Size: Open to various sizes
• Gender: Unisex models accepted

Condition: Prefer gently used to new condition. Minor wear acceptable if reflected in price. Must have no major defects, sole separation, or structural damage.`
    } : {
      title: 'Off-White x Air Jordan 1 Retro High OG "Chicago"',
      description: `Authentic Off-White x Air Jordan 1 Retro High OG "Chicago". These iconic sneakers are in excellent condition with minimal signs of wear.

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

All pictures show the actual item you will receive. Item will be shipped with care in original packaging.`
    };

    setFormData(prev => ({
      ...prev,
      generatedTitle: mockData.title,
      generatedDescription: mockData.description,
      ...(formData.listingType === 'buy' && {
        generatedImage: 'https://images.unsplash.com/photo-1695697104675-429f5fcdede6?q=80&w=687&auto=format&fit=crop&ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D'
      })
    }));

    setIsGenerating(false);
    setCurrentStep(2);
  };

  const fetchPriceRecommendation = async () => {
    await new Promise(resolve => setTimeout(resolve, 1000));

    const priceData = formData.listingType === 'buy' ? {
      min: 150,
      max: 450,
      average: 280
    } : {
      min: 280,
      max: 420,
      average: 350
    };

    setRecommendedPriceRange(priceData);
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
    if (currentStep > 0) setCurrentStep(currentStep - 1);
  };

  const handleRegenerate = () => {
    generateListingWithAI();
  };

  const handleSubmit = async () => {
    const listingTypeText = formData.listingType === 'buy' ? 'Buy' : 'Sell';
    console.log(`${listingTypeText} listing submitted:`, formData);
    alert(`${listingTypeText} listing created successfully!`);
  };

  // Validation logic based on listing type
  const isStepValid = () => {
    switch(currentStep) {
      case 0: return formData.listingType !== null;
      case 1:
        if (formData.listingType === 'buy') {
          return formData.userDescription.length >= 10;
        } else {
          return formData.uploadedImages.length > 0;
        }
      case 2: return formData.generatedTitle.length >= 3 && formData.generatedDescription.length >= 10;
      case 3:
        if (formData.listingType === 'buy') {
          return formData.minPrice && formData.maxPrice && formData.quantity &&
                 parseInt(formData.quantity) > 0 && parseFloat(formData.minPrice) < parseFloat(formData.maxPrice);
        } else {
          return formData.minPrice && formData.maxPrice && parseFloat(formData.minPrice) < parseFloat(formData.maxPrice);
        }
      case 4:
        if (formData.listingType === 'buy') {
          return formData.shippingOptions.length > 0;
        } else {
          return formData.shippingOptions.length > 0 && formData.availableFromDate &&
                 formData.inventoryQuantity && parseInt(formData.inventoryQuantity) > 0;
        }
      case 5: return true;
      default: return false;
    }
  };

  const getPageTitle = () => {
    if (currentStep === 0) return 'Create Listing';
    return `Create ${formData.listingType === 'buy' ? 'Buy' : 'Sell'} Listing`;
  };

  return (
    <div className="min-h-screen bg-primary-100">
      {/* Minimal Header for Intent Selection */}
      {currentStep === 0 ? (
        <div className="relative min-h-screen">
          <div className="absolute inset-0 bg-primary-gradient opacity-10"></div>
          <div className="relative max-w-7xl mx-auto px-4 py-12 flex flex-col justify-center min-h-screen">
            <div className="text-center mb-10">
              <div className="inline-flex items-center justify-center w-16 h-16 rounded-full mb-6 shadow-lg bg-primary-gradient">
                <Search className="w-8 h-8 text-white" />
              </div>
              <h1 className="text-4xl font-bold mb-4 text-accent-700">
                Create Your Listing
              </h1>
              <p className="text-lg max-w-2xl mx-auto leading-relaxed text-accent-500">
                Join thousands of users buying and selling with AI-powered matching
              </p>
            </div>

            {/* Modern A/B Door Interface */}
            <div className="max-w-6xl mx-auto">
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">

                {/* Buy Option */}
                <div
                  onClick={() => handleIntentSelection('buy')}
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
                        <ChevronRight className="w-5 h-5 ml-2" />
                      </div>
                    </div>
                  </div>
                </div>

                {/* Sell Option */}
                <div
                  onClick={() => handleIntentSelection('sell')}
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
                        <ChevronRight className="w-5 h-5 ml-2" />
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
        </div>
      ) : (
        // Progressive Header for Multi-Step Flow
        <div className="bg-primary-100 border-b border-primary-200 sticky top-0 z-10 shadow-sm">
          <div className="max-w-7xl mx-auto px-4 py-4">
            <div className="flex items-center justify-between">
              <Button
                variant="ghost"
                size="sm"
                onClick={handleBack}
                className="flex items-center text-accent-500 hover:text-accent-700 hover:bg-primary-200"
              >
                <ChevronLeft className="w-4 h-4 mr-1" />
                Back
              </Button>

              <div className="text-center">
                <h1 className="text-xl font-semibold text-accent-700">{getPageTitle()}</h1>
                <p className="text-sm text-accent-500">Step {currentStep} of 5</p>
              </div>

              <Button
                variant="ghost"
                size="sm"
                onClick={resetToIntent}
                className="text-accent-500 hover:text-accent-700 hover:bg-primary-200"
              >
                Change Intent
              </Button>
            </div>

            {/* Modern Progress Bar */}
            <div className="mt-6 max-w-4xl mx-auto">
              <div className="flex items-center justify-between">
                {steps.slice(1).map((step, index) => {
                  const Icon = step.icon;
                  const isActive = currentStep === step.number;
                  const isComplete = currentStep > step.number;

                  return (
                    <React.Fragment key={step.number}>
                      <div className="flex flex-col items-center">
                        <div
                          className={`w-12 h-12 rounded-full flex items-center justify-center transition-all duration-300 shadow-lg ${
                            isComplete
                              ? 'bg-success-500 text-white'
                              : isActive
                              ? 'bg-accent-600 text-white shadow-accent-600/25 scale-115'
                              : 'bg-primary-200 text-accent-500'
                          }`}
                        >
                          {isComplete ? <Check className="w-6 h-6" /> : <Icon className="w-6 h-6" />}
                        </div>
                        <span
                          className={`text-sm mt-3 font-medium transition-colors ${
                            isActive ? 'text-accent-700' : 'text-accent-500'
                          }`}
                        >
                          {step.label}
                        </span>
                      </div>
                      {index < steps.slice(1).length - 1 && (
                        <div
                          className={`flex-1 h-1 mx-4 rounded transition-colors duration-300 ${
                            isComplete ? 'bg-success-500' : 'bg-primary-200'
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
      )}

      {/* Content Area for Multi-Step Flow */}
      {currentStep > 0 && (
        <div className="min-h-screen flex flex-col bg-primary-100">
          <div className="max-w-4xl mx-auto px-4 py-12 flex-1 flex items-center justify-center">
            <div className="bg-neutral-white rounded-2xl shadow-xl border-2 border-primary-200 p-8 w-full max-w-xl">
              <div className="text-center">
                <div className="inline-flex items-center justify-center w-16 h-16 rounded-full mb-6 bg-primary-gradient">
                  <Sparkles className="w-8 h-8 text-white" />
                </div>
                <h3 className="text-2xl font-bold mb-4 text-accent-700">
                  Step {currentStep} - Coming Soon
                </h3>
                <p className="text-base mb-6 leading-relaxed text-accent-500">
                  This step will be implemented in the next phase of development.
                </p>
                <Button
                  onClick={() => setCurrentStep(0)}
                  className="bg-secondary-500 hover:bg-secondary-600 text-accent-700 px-6 py-3 rounded-xl font-semibold text-base shadow-lg hover:shadow-xl transition-all duration-300"
                >
                  Back to Intent Selection
                </Button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}