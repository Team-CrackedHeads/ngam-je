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
    <div className="min-h-screen bg-app-bg">
      {/* Minimal Header for Intent Selection */}
      {currentStep === 0 ? (
        <div className="relative min-h-screen flex flex-col">
          <div className="absolute inset-0 bg-app-gradient opacity-10"></div>
          <div className="relative max-w-7xl mx-auto px-4 py-16 flex-1 flex flex-col justify-center">
            <div className="text-center mb-20">
              <div className="inline-flex items-center justify-center w-20 h-20 rounded-full mb-8 shadow-lg bg-app-gradient">
                <Search className="w-10 h-10 text-white" />
              </div>
              <h1 className="text-6xl font-bold mb-6 text-app-text-active">
                Create Your Listing
              </h1>
              <p className="text-2xl max-w-3xl mx-auto leading-relaxed text-app-text">
                Join thousands of users buying and selling with AI-powered matching
              </p>
            </div>

            {/* Modern A/B Door Interface */}
            <div className="max-w-6xl mx-auto flex-1">
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-10 h-full">

                {/* Buy Option */}
                <div
                  onClick={() => handleIntentSelection('buy')}
                  className="group relative cursor-pointer h-full"
                >
                  <div className="absolute inset-0 bg-app-gradient rounded-3xl opacity-0 group-hover:opacity-15 transition-opacity duration-300"></div>
                  <div className="relative bg-app-white rounded-3xl p-10 shadow-2xl border-2 border-app-hover group-hover:shadow-3xl hover:border-app-accent transition-all duration-300 h-full flex flex-col justify-between">
                    <div className="text-center">
                      <div className="inline-flex items-center justify-center w-24 h-24 rounded-3xl mb-8 bg-app-active group-hover:scale-110 transition-transform duration-300">
                        <Search className="w-12 h-12 text-app-accent" />
                      </div>
                      <h2 className="text-4xl font-bold mb-6 text-app-text-active">
                        I'm Looking to Buy
                      </h2>
                      <p className="text-xl leading-relaxed mb-8 text-app-text">
                        Set your budget and let sellers compete to fulfill your needs
                      </p>

                      <div className="space-y-4 text-left mb-10">
                        <div className="flex items-center text-app-text">
                          <div className="w-3 h-3 rounded-full mr-4 bg-app-accent"></div>
                          <span className="text-lg">Describe what you're looking for</span>
                        </div>
                        <div className="flex items-center text-app-text">
                          <div className="w-3 h-3 rounded-full mr-4 bg-app-accent"></div>
                          <span className="text-lg">Set your budget range</span>
                        </div>
                        <div className="flex items-center text-app-text">
                          <div className="w-3 h-3 rounded-full mr-4 bg-app-accent"></div>
                          <span className="text-lg">Get matched with sellers</span>
                        </div>
                        <div className="flex items-center text-app-text">
                          <div className="w-3 h-3 rounded-full mr-4 bg-app-accent"></div>
                          <span className="text-lg">Secure escrow protection</span>
                        </div>
                      </div>
                    </div>

                    <div className="text-center">
                      <div className="inline-flex items-center justify-center px-8 py-4 rounded-2xl text-white font-bold text-lg bg-app-gradient group-hover:scale-105 transition-transform duration-300 shadow-lg">
                        Start Buying
                        <ChevronRight className="w-6 h-6 ml-3" />
                      </div>
                    </div>
                  </div>
                </div>

                {/* Sell Option */}
                <div
                  onClick={() => handleIntentSelection('sell')}
                  className="group relative cursor-pointer h-full"
                >
                  <div className="absolute inset-0 bg-app-gradient-reverse rounded-3xl opacity-0 group-hover:opacity-15 transition-opacity duration-300"></div>
                  <div className="relative bg-app-white rounded-3xl p-10 shadow-2xl border-2 border-app-hover group-hover:shadow-3xl hover:border-app-accent transition-all duration-300 h-full flex flex-col justify-between">
                    <div className="text-center">
                      <div className="inline-flex items-center justify-center w-24 h-24 rounded-3xl mb-8 bg-app-active group-hover:scale-110 transition-transform duration-300">
                        <Upload className="w-12 h-12 text-app-accent" />
                      </div>
                      <h2 className="text-4xl font-bold mb-6 text-app-text-active">
                        I Want to Sell
                      </h2>
                      <p className="text-xl leading-relaxed mb-8 text-app-text">
                        List your items and connect with interested buyers automatically
                      </p>

                      <div className="space-y-4 text-left mb-10">
                        <div className="flex items-center text-app-text">
                          <div className="w-3 h-3 rounded-full mr-4 bg-app-accent"></div>
                          <span className="text-lg">Upload photos of your item</span>
                        </div>
                        <div className="flex items-center text-app-text">
                          <div className="w-3 h-3 rounded-full mr-4 bg-app-accent"></div>
                          <span className="text-lg">AI optimizes your listing</span>
                        </div>
                        <div className="flex items-center text-app-text">
                          <div className="w-3 h-3 rounded-full mr-4 bg-app-accent"></div>
                          <span className="text-lg">Get intelligent price suggestions</span>
                        </div>
                        <div className="flex items-center text-app-text">
                          <div className="w-3 h-3 rounded-full mr-4 bg-app-accent"></div>
                          <span className="text-lg">Connect with verified buyers</span>
                        </div>
                      </div>
                    </div>

                    <div className="text-center">
                      <div className="inline-flex items-center justify-center px-8 py-4 rounded-2xl text-white font-bold text-lg bg-app-gradient-reverse group-hover:scale-105 transition-transform duration-300 shadow-lg">
                        Start Selling
                        <ChevronRight className="w-6 h-6 ml-3" />
                      </div>
                    </div>
                  </div>
                </div>

              </div>

              {/* Bottom Feature Highlight */}
              <div className="text-center mt-20 pb-16">
                <div className="inline-flex items-center justify-center px-8 py-4 rounded-full border border-app-accent/20 bg-app-hover/80 shadow-lg backdrop-blur-sm">
                  <Sparkles className="w-6 h-6 mr-3 text-app-accent" />
                  <span className="font-semibold text-lg text-app-text-active">
                    AI-powered matching ensures fair deals for everyone
                  </span>
                </div>
              </div>
            </div>
          </div>
        </div>
      ) : (
        // Progressive Header for Multi-Step Flow
        <div className="bg-app-hover border-b border-app-hover sticky top-0 z-10 shadow-sm">
          <div className="max-w-7xl mx-auto px-4 py-4">
            <div className="flex items-center justify-between">
              <Button
                variant="ghost"
                size="sm"
                onClick={handleBack}
                className="flex items-center text-app-text hover:text-app-text-active hover:bg-app-active"
              >
                <ChevronLeft className="w-4 h-4 mr-1" />
                Back
              </Button>

              <div className="text-center">
                <h1 className="text-xl font-semibold text-app-text-active">{getPageTitle()}</h1>
                <p className="text-sm text-app-text">Step {currentStep} of 5</p>
              </div>

              <Button
                variant="ghost"
                size="sm"
                onClick={resetToIntent}
                className="text-app-text hover:text-app-text-active hover:bg-app-active"
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
                              ? 'bg-app-success text-white'
                              : isActive
                              ? 'bg-app-accent text-white shadow-app-accent/25 scale-115'
                              : 'bg-app-hover text-app-text'
                          }`}
                        >
                          {isComplete ? <Check className="w-6 h-6" /> : <Icon className="w-6 h-6" />}
                        </div>
                        <span
                          className={`text-sm mt-3 font-medium transition-colors ${
                            isActive ? 'text-app-text-active' : 'text-app-text'
                          }`}
                        >
                          {step.label}
                        </span>
                      </div>
                      {index < steps.slice(1).length - 1 && (
                        <div
                          className={`flex-1 h-1 mx-4 rounded transition-colors duration-300 ${
                            isComplete ? 'bg-app-success' : 'bg-app-hover'
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
        <div className="min-h-screen flex flex-col bg-app-bg">
          <div className="max-w-5xl mx-auto px-4 py-12 flex-1 flex items-center justify-center">
            <div className="bg-app-white rounded-3xl shadow-2xl border-2 border-app-hover p-12 w-full max-w-2xl">
              <div className="text-center">
                <div className="inline-flex items-center justify-center w-20 h-20 rounded-full mb-8 bg-app-gradient">
                  <Sparkles className="w-10 h-10 text-white" />
                </div>
                <h3 className="text-3xl font-bold mb-6 text-app-text-active">
                  Step {currentStep} - Coming Soon
                </h3>
                <p className="text-xl mb-10 leading-relaxed text-app-text">
                  This step will be implemented in the next phase of development.
                </p>
                <Button
                  onClick={() => setCurrentStep(0)}
                  className="bg-app-gradient text-white px-8 py-4 rounded-2xl font-bold text-lg shadow-lg hover:shadow-xl transition-all duration-300"
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