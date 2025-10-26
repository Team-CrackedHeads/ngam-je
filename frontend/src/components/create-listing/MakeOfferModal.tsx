'use client';

import React, { useState, useRef } from 'react';
import { useRouter } from 'next/navigation';
import { X, Upload, ChevronRight, Check, DollarSign, Eye, Sparkles, MessageCircle } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { addNewListing, generateListingId, convertFormToListing } from '@/utils/listing-storage';

interface MakeOfferModalProps {
  isOpen: boolean;
  onClose: () => void;
  sourceListingId: string;
  sourceTitle: string;
  sourcePrice: number;
  sourceListingType: "sale" | "wanted";
  category: string;
}

export default function MakeOfferModal({
  isOpen,
  onClose,
  sourceListingId,
  sourceTitle,
  sourcePrice,
  sourceListingType,
  category
}: MakeOfferModalProps) {
  const router = useRouter();
  const [currentStep, setCurrentStep] = useState(1);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Determine the offer type (opposite of source)
  const offerType = sourceListingType === "wanted" ? "sell" : "buy";

  // Form data
  const [uploadedImages, setUploadedImages] = useState<string[]>([]);
  const [title, setTitle] = useState(sourceTitle);
  const [description, setDescription] = useState('');
  const [minPrice, setMinPrice] = useState(sourcePrice.toString());
  const [maxPrice, setMaxPrice] = useState(sourcePrice.toString());
  const [location, setLocation] = useState('');
  const [shippingOptions, setShippingOptions] = useState<string[]>([]);
  const [quantity, setQuantity] = useState('1');
  const [tags, setTags] = useState<string[]>([]);

  const steps = [
    { number: 1, label: 'Details', icon: Sparkles },
    { number: 2, label: 'Pricing', icon: DollarSign },
    { number: 3, label: 'Preview', icon: Eye }
  ];

  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (files) {
      const newImages = Array.from(files).slice(0, 5 - uploadedImages.length).map((file) => {
        return URL.createObjectURL(file);
      });
      setUploadedImages([...uploadedImages, ...newImages]);
    }
  };

  const removeImage = (index: number) => {
    setUploadedImages(uploadedImages.filter((_, i) => i !== index));
  };

  const handleShippingToggle = (option: string) => {
    setShippingOptions(prev =>
      prev.includes(option)
        ? prev.filter(o => o !== option)
        : [...prev, option]
    );
  };

  const handleNext = () => {
    if (currentStep < 3) {
      setCurrentStep(currentStep + 1);
    }
  };

  const handleBack = () => {
    if (currentStep > 1) {
      setCurrentStep(currentStep - 1);
    }
  };

  const handleSubmit = async () => {
    // Create the listing data
    const listingData = {
      generatedTitle: title,
      generatedDescription: description,
      uploadedImages: offerType === 'sell' ? uploadedImages : [],
      generatedImages: offerType === 'buy' ? uploadedImages : [],
      minPrice,
      maxPrice,
      currency: 'MYR',
      location,
      shippingOptions,
      inventoryQuantity: offerType === 'sell' ? quantity : undefined,
      quantity: offerType === 'buy' ? quantity : '1',
      tags,
      faqs: [],
      ownershipProofImage: null
    };

    // Convert to listing format
    const listing = convertFormToListing(listingData, offerType, category);
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
    setUploadedImages([]);
    setTitle(sourceTitle);
    setDescription('');
    setMinPrice(sourcePrice.toString());
    setMaxPrice(sourcePrice.toString());
    setLocation('');
    setShippingOptions([]);
    setQuantity('1');
    setTags([]);
    onClose();
  };

  const isStepValid = () => {
    switch(currentStep) {
      case 1: return title.length >= 3 && description.length >= 10 && uploadedImages.length > 0;
      case 2: return minPrice && maxPrice && parseFloat(minPrice) <= parseFloat(maxPrice) && location.length > 0 && shippingOptions.length > 0;
      case 3: return true;
      default: return false;
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4">
      <div className="relative w-full max-w-4xl max-h-[90vh] bg-white rounded-lg shadow-2xl flex flex-col border border-neutral-200">
        {/* Header */}
        <div className="flex-shrink-0 border-b shadow-sm rounded-t-lg bg-primary-200">
          <div className="px-4 py-4">
            <div className="flex items-center justify-between mb-4">
              <div className="text-center flex-1">
                <h1 className="font-semibold text-lg text-accent-700">
                  Make an Offer
                </h1>
                <p className="text-sm text-primary-900">
                  {offerType === 'sell' ? 'Creating a sell listing' : 'Creating a buy listing'}
                </p>
              </div>
              <Button variant="ghost" size="icon" onClick={handleClose}>
                <X className="w-5 h-5 text-accent-700" />
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
                            ? 'bg-secondary-500 text-white'
                            : currentStep === step.number
                            ? 'bg-secondary-500 text-white scale-110 shadow-md'
                            : 'bg-gray-200 text-gray-500'
                        }`}
                      >
                        {currentStep > step.number ? <Check className="w-5 h-5" /> : <Icon className="w-4 h-4" />}
                      </div>
                      <span
                        className={`text-xs mt-2 font-medium ${
                          currentStep === step.number
                            ? 'text-accent-700'
                            : 'text-primary-900'
                        }`}
                      >
                        {step.label}
                      </span>
                    </div>
                    {index < steps.length - 1 && (
                      <div
                        className={`flex-1 h-1 mx-3 rounded transition-all ${
                          currentStep > step.number
                            ? 'bg-secondary-500'
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
        <div className="flex-1 overflow-y-auto p-6">
          <div className="max-w-2xl mx-auto">
            {/* Step 1: Details */}
            {currentStep === 1 && (
              <div className="space-y-6">
                <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                  <p className="text-sm text-blue-900">
                    You're responding to a <strong>{sourceListingType === 'wanted' ? 'WTB (Want to Buy)' : 'WTS (Want to Sell)'}</strong> listing.
                    Fill in the details to create your {offerType === 'sell' ? 'sell' : 'buy'} offer.
                  </p>
                </div>

                {/* Images */}
                <div>
                  <Label className="text-sm font-medium text-gray-700 mb-2 block">
                    {offerType === 'sell' ? 'Product Images' : 'Reference Images'}
                  </Label>
                  <div className="grid grid-cols-2 gap-3 mb-3">
                    {uploadedImages.map((img, idx) => (
                      <div key={idx} className="relative aspect-square rounded-lg overflow-hidden border-2 border-gray-200">
                        <img src={img} alt={`Upload ${idx + 1}`} className="w-full h-full object-cover" />
                        <button
                          onClick={() => removeImage(idx)}
                          className="absolute top-2 right-2 bg-red-500 text-white rounded-full p-1 hover:bg-red-600"
                        >
                          <X className="w-4 h-4" />
                        </button>
                      </div>
                    ))}
                    {uploadedImages.length < 5 && (
                      <button
                        onClick={() => fileInputRef.current?.click()}
                        className="aspect-square border-2 border-dashed border-gray-300 rounded-lg hover:border-gray-400 transition-colors flex flex-col items-center justify-center bg-gray-50"
                      >
                        <Upload className="w-8 h-8 text-gray-400 mb-2" />
                        <span className="text-sm text-gray-500">Upload</span>
                      </button>
                    )}
                  </div>
                  <input
                    ref={fileInputRef}
                    type="file"
                    accept="image/*"
                    multiple
                    onChange={handleImageUpload}
                    className="hidden"
                  />
                </div>

                {/* Title */}
                <div>
                  <Label htmlFor="title" className="text-sm font-medium text-gray-700 mb-2 block">
                    Title
                  </Label>
                  <Input
                    id="title"
                    value={title}
                    onChange={(e) => setTitle(e.target.value)}
                    placeholder="What are you offering?"
                    className="w-full"
                    maxLength={100}
                  />
                </div>

                {/* Description */}
                <div>
                  <Label htmlFor="description" className="text-sm font-medium text-gray-700 mb-2 block">
                    Description
                  </Label>
                  <Textarea
                    id="description"
                    value={description}
                    onChange={(e) => setDescription(e.target.value)}
                    placeholder="Describe your offer in detail..."
                    className="w-full min-h-24"
                    maxLength={500}
                  />
                </div>
              </div>
            )}

            {/* Step 2: Pricing */}
            {currentStep === 2 && (
              <div className="space-y-6">
                {/* Price Range */}
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="minPrice" className="text-sm font-medium text-gray-700 mb-2 block">
                      {offerType === 'sell' ? 'Min Price (RM)' : 'Min Budget (RM)'}
                    </Label>
                    <Input
                      id="minPrice"
                      type="number"
                      value={minPrice}
                      onChange={(e) => setMinPrice(e.target.value)}
                      min="0"
                      step="0.01"
                    />
                  </div>
                  <div>
                    <Label htmlFor="maxPrice" className="text-sm font-medium text-gray-700 mb-2 block">
                      {offerType === 'sell' ? 'Max Price (RM)' : 'Max Budget (RM)'}
                    </Label>
                    <Input
                      id="maxPrice"
                      type="number"
                      value={maxPrice}
                      onChange={(e) => setMaxPrice(e.target.value)}
                      min="0"
                      step="0.01"
                    />
                  </div>
                </div>

                {/* Location */}
                <div>
                  <Label htmlFor="location" className="text-sm font-medium text-gray-700 mb-2 block">
                    Location
                  </Label>
                  <Input
                    id="location"
                    value={location}
                    onChange={(e) => setLocation(e.target.value)}
                    placeholder="e.g., Kuala Lumpur"
                  />
                </div>

                {/* Shipping Options */}
                <div>
                  <Label className="text-sm font-medium text-gray-700 mb-2 block">
                    Shipping Options
                  </Label>
                  <div className="flex flex-wrap gap-2">
                    {['Meetup', 'Delivery', 'Shipping'].map((option) => (
                      <Badge
                        key={option}
                        onClick={() => handleShippingToggle(option)}
                        className={`cursor-pointer ${
                          shippingOptions.includes(option)
                            ? 'bg-secondary-500 text-accent-700'
                            : 'bg-gray-200 text-gray-700'
                        }`}
                      >
                        {option}
                      </Badge>
                    ))}
                  </div>
                </div>

                {/* Quantity */}
                <div>
                  <Label htmlFor="quantity" className="text-sm font-medium text-gray-700 mb-2 block">
                    Quantity
                  </Label>
                  <Input
                    id="quantity"
                    type="number"
                    value={quantity}
                    onChange={(e) => setQuantity(e.target.value)}
                    min="1"
                  />
                </div>
              </div>
            )}

            {/* Step 3: Preview */}
            {currentStep === 3 && (
              <div className="space-y-6">
                <div className="bg-green-50 border border-green-200 rounded-lg p-4">
                  <p className="text-sm text-green-900">
                    ✅ Your offer will be automatically matched with the original listing!
                  </p>
                </div>

                <div className="border rounded-lg p-4 space-y-4">
                  {uploadedImages.length > 0 && (
                    <img src={uploadedImages[0]} alt="Preview" className="w-full h-48 object-cover rounded-lg" />
                  )}
                  <div>
                    <h3 className="text-lg font-bold text-accent-700">{title}</h3>
                    <p className="text-sm text-gray-600 mt-1">{description}</p>
                  </div>
                  <div className="flex items-center justify-between pt-3 border-t">
                    <span className="text-xl font-bold text-accent-600">
                      RM {minPrice} - RM {maxPrice}
                    </span>
                    <Badge className="bg-blue-100 text-blue-800">
                      {offerType === 'sell' ? 'For Sale' : 'Want to Buy'}
                    </Badge>
                  </div>
                  <div className="text-sm text-gray-600">
                    <p>📍 {location}</p>
                    <p>🚚 {shippingOptions.join(', ')}</p>
                  </div>
                </div>
              </div>
            )}

            {/* Navigation Buttons */}
            <div className="flex justify-between items-center mt-8 pt-6 border-t">
              <Button
                variant="outline"
                onClick={handleBack}
                disabled={currentStep === 1}
                className="px-6"
              >
                Back
              </Button>

              {currentStep < 3 ? (
                <Button
                  onClick={handleNext}
                  disabled={!isStepValid()}
                  className="px-6 text-white bg-secondary-500 hover:bg-secondary-600"
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
                  Submit Offer
                </Button>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
