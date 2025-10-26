"use client";

import { motion } from "motion/react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { X, Package, Handshake, Truck, Shield, MapPin, Calendar, ArrowLeft, AlertTriangle, Lightbulb, Loader2, Warehouse, ClipboardCheck } from "lucide-react";
import { type Listing } from "@/utils/mock-listings-data";
import { MatchedListing } from "@/components/matching/types";
import React, { useState, useRef, useEffect } from "react";
import { createPortal } from "react-dom";
import dynamic from "next/dynamic";
import { APIProvider, useMapsLibrary } from '@vis.gl/react-google-maps';
import { MeetupScheduler } from "@/components/checkout/MeetupScheduler";

const GoogleLocationMap = dynamic(() => import("@/components/create-listing/GoogleLocationMap"), {
  ssr: false,
});

interface CheckoutModalProps {
  listing: Listing | MatchedListing;
  onClose: () => void;
  onBack: () => void;
  onConfirm: (dealDetails: DealDetails) => void;
}

export type DealType = "in-person" | "platform-logistics" | "platform-inspection" | "direct-shipping";

export interface DealDetails {
  dealType: DealType;
  // Escrow + Delivery specific
  deliveryAddress?: string;
  // In-person specific
  meetupLocation?: string;
  meetupDate?: string;
  meetupTime?: string;
  // Payment
  useEscrow: boolean;
}

const dealTypeOptions = [
  {
    id: "in-person" as DealType,
    title: "In-Person Meetup",
    description: "Meet at a public location to exchange",
    icon: Handshake,
    features: ["Inspect before buying", "No shipping costs", "Immediate exchange"],
  },
  {
    id: "direct-shipping" as DealType,
    title: "Direct Shipping",
    description: "Seller ships directly (no platform support)",
    icon: Truck,
    features: ["Direct from seller", "No platform fees", "Seller manages shipping"],
  },
  {
    id: "platform-logistics" as DealType,
    title: "Warehousing",
    description: "We securely store and deliver your item",
    icon: Warehouse,
    features: ["Payment protection", "Secure storage", "Delivery service"],
  },
  {
    id: "platform-inspection" as DealType,
    title: "Warehouse Validated",
    description: "Full authentication and quality verification",
    icon: ClipboardCheck,
    features: ["Professional authentication", "Quality assurance", "Complete protection"],
  },
];

function CheckoutModalContent({ listing, onClose, onBack, onConfirm }: CheckoutModalProps) {
  const [currentStep, setCurrentStep] = useState<1 | 2 | 3>(1);
  const [selectedDealType, setSelectedDealType] = useState<DealType | null>(null);
  const [deliveryAddress, setDeliveryAddress] = useState("");
  const [deliveryCoordinates, setDeliveryCoordinates] = useState<{ lat: number; lng: number } | undefined>();
  const [meetupLocation, setMeetupLocation] = useState("");
  const [meetupCoordinates, setMeetupCoordinates] = useState<{ lat: number; lng: number } | undefined>();
  const [meetupDate, setMeetupDate] = useState("");
  const [meetupTime, setMeetupTime] = useState("");
  const [meetupSearchQuery, setMeetupSearchQuery] = useState("");

  const [placePredictions, setPlacePredictions] = useState<google.maps.places.AutocompletePrediction[]>([]);
  const [isSearchingPlaces, setIsSearchingPlaces] = useState(false);
  const [showLocationDropdown, setShowLocationDropdown] = useState(false);
  const [selectedLocationIndex, setSelectedLocationIndex] = useState(-1);

  const autocompleteService = useRef<google.maps.places.AutocompleteService | null>(null);
  const placesService = useRef<google.maps.places.PlacesService | null>(null);
  const searchTimeoutRef = useRef<NodeJS.Timeout | null>(null);
  const placesLibrary = useMapsLibrary('places');

  // Initialize Google Places services when library loads
  useEffect(() => {
    if (!placesLibrary) return;

    autocompleteService.current = new placesLibrary.AutocompleteService();
    const mapDiv = document.createElement('div');
    placesService.current = new placesLibrary.PlacesService(mapDiv);
  }, [placesLibrary]);

  // Handle location search with Google Places Autocomplete
  const handleLocationSearch = (query: string, isDelivery: boolean = true) => {
    if (searchTimeoutRef.current) {
      clearTimeout(searchTimeoutRef.current);
    }

    if (!query || query.trim().length === 0) {
      setPlacePredictions([]);
      setShowLocationDropdown(false);
      return;
    }

    setIsSearchingPlaces(true);
    setShowLocationDropdown(true);

    searchTimeoutRef.current = setTimeout(() => {
      if (!autocompleteService.current) {
        setIsSearchingPlaces(false);
        setPlacePredictions([]);
        return;
      }

      autocompleteService.current.getPlacePredictions(
        { input: query },
        (predictions, status) => {
          if (status === google.maps.places.PlacesServiceStatus.OK && predictions) {
            setPlacePredictions(predictions);
          } else {
            setPlacePredictions([]);
          }
          setIsSearchingPlaces(false);
        }
      );
    }, 300);
  };

  // Handle selection from search dropdown
  const handlePlaceSelect = async (placeId: string, description: string, isDelivery: boolean = true) => {
    if (!placesService.current) return;

    if (isDelivery) {
      setDeliveryAddress(description);
    } else {
      setMeetupLocation(description);
    }
    setShowLocationDropdown(false);
    setSelectedLocationIndex(-1);

    // Get place details to extract coordinates
    placesService.current.getDetails(
      { placeId },
      (place, status) => {
        if (status === google.maps.places.PlacesServiceStatus.OK && place?.geometry?.location) {
          const lat = place.geometry.location.lat();
          const lng = place.geometry.location.lng();
          if (isDelivery) {
            setDeliveryCoordinates({ lat, lng });
          } else {
            setMeetupCoordinates({ lat, lng });
          }
        }
      }
    );
  };

  const handleNext = () => {
    if (!selectedDealType) return;
    if (currentStep === 1) {
      setCurrentStep(2);
    } else if (currentStep === 2) {
      setCurrentStep(3);
    }
  };

  const handleBackStep = () => {
    if (currentStep === 3) {
      setCurrentStep(2);
    } else if (currentStep === 2) {
      setCurrentStep(1);
    } else {
      onBack();
    }
  };

  const handleConfirm = () => {
    if (!selectedDealType) return;

    const dealDetails: DealDetails = {
      dealType: selectedDealType,
      useEscrow: selectedDealType !== "in-person" && selectedDealType !== "direct-shipping", // Escrow for platform services only
      ...(selectedDealType === "platform-logistics" && { deliveryAddress }),
      ...(selectedDealType === "platform-inspection" && { deliveryAddress }),
      ...(selectedDealType === "direct-shipping" && { deliveryAddress }),
      ...(selectedDealType === "in-person" && {
        meetupLocation,
        meetupDate,
        meetupTime,
      }),
    };

    onConfirm(dealDetails);
  };

  const modalContent = (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="fixed inset-0 z-[10000] bg-black/60 backdrop-blur-sm flex items-center justify-center p-4"
      onClick={onClose}
    >
      <motion.div
        key="checkout-modal"
        initial={{ opacity: 0, scale: 0.95, y: 20 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        exit={{ opacity: 0, scale: 0.95, y: 20 }}
        transition={{ type: "spring", duration: 0.5 }}
        onClick={(e) => e.stopPropagation()}
        className="w-full max-w-3xl"
      >
        <Card className="bg-white overflow-hidden border-neutral-200 shadow-2xl max-h-[90vh] flex flex-col py-0">
          {/* Header */}
          <div className="flex items-center justify-between px-4 py-3 border-b border-neutral-200 shrink-0 bg-primary-50">
            <div className="flex items-center gap-3">
              <Button
                variant="ghost"
                size="sm"
                onClick={handleBackStep}
                className="rounded-full hover:bg-primary-100 transition-colors -ml-2"
              >
                <ArrowLeft className="h-5 w-5 text-accent-600" />
              </Button>
              <Package className="w-5 h-5 text-secondary-600" />
              <div>
                <h2 className="text-xl font-bold text-accent-700">Finalize Deal</h2>
                <p className="text-sm text-accent-500">
                  {currentStep === 1
                    ? "Choose how you'd like to complete this transaction"
                    : currentStep === 2
                    ? "Enter transaction details"
                    : "Review and confirm"}
                </p>
              </div>
            </div>
            <div className="flex items-center gap-2">
              <span className="text-xs text-accent-500 font-medium">Step {currentStep} of 3</span>
              <Button
                variant="ghost"
                size="sm"
                onClick={onClose}
                className="rounded-full hover:bg-primary-100 transition-colors"
              >
                <X className="h-5 w-5 text-accent-600" />
              </Button>
            </div>
          </div>

          {/* Scrollable Content */}
          <div className="flex-1 overflow-y-auto p-4">
            {/* Listing Summary */}
            <div className="mb-4 space-y-3">
              <h4 className="font-semibold text-sm text-accent-700 flex items-center gap-2">
                <Package className="w-3.5 h-3.5" />
                Product
              </h4>
              <div className="p-3 bg-primary-50 rounded-lg border border-primary-200">
                <div className="flex items-start gap-4">
                  <div className="w-20 h-20 bg-primary-200 rounded-lg flex items-center justify-center shrink-0">
                    <span className="text-xs text-accent-400">Image</span>
                  </div>
                  <div className="flex-1 min-w-0">
                    <h3 className="font-semibold text-accent-700 mb-1 truncate">{listing.title}</h3>
                    <p className="text-2xl font-bold text-secondary-600 mb-2">
                      {("price" in listing ? listing.price : listing.budget) || "N/A"}
                    </p>
                    <div className="flex items-center gap-2 text-sm text-accent-500">
                      <MapPin className="w-4 h-4" />
                      {listing.location}
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Step 1: Deal Type Selection */}
            {currentStep === 1 && (
              <div className="mb-4">
                <h3 className="text-xs font-semibold text-accent-700 mb-2 uppercase tracking-wide">
                  Select Transaction Method
                </h3>
                <div className="space-y-2">
                  {dealTypeOptions.map((option) => {
                    const Icon = option.icon;
                    const isSelected = selectedDealType === option.id;

                    return (
                      <button
                        key={option.id}
                        onClick={() => setSelectedDealType(option.id)}
                        className={`w-full text-left px-5 py-3 rounded-lg border-2 transition-all ${
                          isSelected
                            ? "border-secondary-500 bg-secondary-50"
                            : "border-neutral-200 bg-white hover:border-secondary-300"
                        }`}
                      >
                        <div className="flex items-center gap-3">
                          <Icon
                            className={`w-5 h-5 flex-shrink-0 ${
                              isSelected ? "text-secondary-600" : "text-accent-400"
                            }`}
                          />
                          <div className="flex-1">
                            <h4 className="font-semibold text-sm text-accent-700 mb-0.5">{option.title}</h4>
                            <p className="text-xs text-accent-500 mb-1.5">{option.description}</p>
                            <div className="flex flex-wrap gap-2">
                              {option.features.map((feature) => (
                                <span
                                  key={feature}
                                  className={`text-xs px-2 py-1 rounded-full ${
                                    isSelected
                                      ? "bg-secondary-200 text-accent-700"
                                      : "bg-primary-100 text-accent-600"
                                  }`}
                                >
                                  {feature}
                                </span>
                              ))}
                            </div>
                          </div>
                        </div>
                      </button>
                    );
                  })}
                </div>
              </div>
            )}

            {/* Step 2: Dynamic Form Based on Selection */}
            {currentStep === 2 && (
              <div>
                {/* Payment Options */}
                <div className="space-y-3 mb-4">
                  <h4 className="font-semibold text-sm text-accent-700 flex items-center gap-2">
                    <Shield className="w-3.5 h-3.5" />
                    Payment Options
                  </h4>
                  <div className="p-3 bg-primary-50 rounded-lg border border-primary-200">
                    <p className="text-xs text-accent-600 mb-3">
                      {selectedDealType === "in-person"
                        ? "No escrow needed for in-person meetups. Payment happens during exchange."
                        : selectedDealType === "direct-shipping"
                        ? "No escrow protection. Direct payment to seller."
                        : "Your payment is held securely in escrow until delivery is confirmed."}
                    </p>

                    {/* Payment method options */}
                    <div className="space-y-2">
                      <label className="flex items-center gap-2 p-2 rounded-lg border border-primary-200 bg-white cursor-pointer hover:border-secondary-500 transition-colors">
                        <input type="radio" name="payment" value="card" defaultChecked className="accent-secondary-500 focus:ring-secondary-500" />
                        <span className="text-sm text-accent-700">Credit/Debit Card</span>
                      </label>
                      <label className="flex items-center gap-2 p-2 rounded-lg border border-primary-200 bg-white cursor-pointer hover:border-secondary-500 transition-colors">
                        <input type="radio" name="payment" value="bank" className="accent-secondary-500 focus:ring-secondary-500" />
                        <span className="text-sm text-accent-700">Bank Transfer</span>
                      </label>
                      <label className="flex items-center gap-2 p-2 rounded-lg border border-primary-200 bg-white cursor-pointer hover:border-secondary-500 transition-colors">
                        <input type="radio" name="payment" value="wallet" className="accent-secondary-500 focus:ring-secondary-500" />
                        <span className="text-sm text-accent-700">Digital Wallet</span>
                      </label>
                      {selectedDealType === "in-person" && (
                        <label className="flex items-center gap-2 p-2 rounded-lg border border-primary-200 bg-white cursor-pointer hover:border-secondary-500 transition-colors">
                          <input type="radio" name="payment" value="cash" className="accent-secondary-500 focus:ring-secondary-500" />
                          <span className="text-sm text-accent-700">Cash on Meetup</span>
                        </label>
                      )}
                    </div>
                  </div>
                </div>

            {/* Warehousing */}
            {selectedDealType === "platform-logistics" && (
              <div className="space-y-3">
                <h4 className="font-semibold text-sm text-accent-700 flex items-center gap-2">
                  <Warehouse className="w-3.5 h-3.5" />
                  Warehousing - Delivery Information
                </h4>
                <div className="p-3 bg-primary-50 rounded-lg border border-primary-200">
                  <div>
                  <label className="block text-xs font-medium text-accent-700 mb-2">
                    Search or Select Delivery Address
                  </label>

                  {/* Show selected location or search input */}
                  {deliveryAddress && !showLocationDropdown ? (
                    <div
                      className="mb-3 p-3 bg-white rounded-lg border-2 border-primary-300 cursor-pointer hover:border-secondary-500 transition-colors"
                      onClick={() => {
                        setDeliveryAddress("");
                        setDeliveryCoordinates(undefined);
                      }}
                    >
                      <p className="text-xs text-primary-700 mb-1">Selected Location:</p>
                      <p className="text-sm font-medium text-accent-700 flex items-start gap-2">
                        <MapPin className="w-4 h-4 mt-0.5 flex-shrink-0 text-secondary-600" />
                        <span>{deliveryAddress}</span>
                      </p>
                      <p className="text-xs text-secondary-600 mt-2">Click to change location</p>
                    </div>
                  ) : (
                    <div className="relative mb-3">
                      <Input
                        type="text"
                        value={deliveryAddress}
                        onChange={(e) => {
                          const value = e.target.value;
                          setDeliveryAddress(value);
                          handleLocationSearch(value, true);
                          setSelectedLocationIndex(-1);
                        }}
                        onKeyDown={(e) => {
                          if (!showLocationDropdown || placePredictions.length === 0) return;

                          if (e.key === 'ArrowDown') {
                            e.preventDefault();
                            setSelectedLocationIndex(prev => Math.min(prev + 1, placePredictions.length - 1));
                          } else if (e.key === 'ArrowUp') {
                            e.preventDefault();
                            setSelectedLocationIndex(prev => Math.max(prev - 1, -1));
                          } else if (e.key === 'Enter' && selectedLocationIndex >= 0) {
                            e.preventDefault();
                            const prediction = placePredictions[selectedLocationIndex];
                            handlePlaceSelect(prediction.place_id, prediction.description, true);
                          } else if (e.key === 'Escape') {
                            setShowLocationDropdown(false);
                            setSelectedLocationIndex(-1);
                          }
                        }}
                        onBlur={() => {
                          setTimeout(() => {
                            setShowLocationDropdown(false);
                            setSelectedLocationIndex(-1);
                          }, 200);
                        }}
                        placeholder="Search for address..."
                        className="w-full pr-10"
                        autoFocus
                      />
                      {isSearchingPlaces && (
                        <div className="absolute right-3 top-1/2 -translate-y-1/2">
                          <Loader2 className="w-4 h-4 animate-spin text-secondary-600" />
                        </div>
                      )}

                      {/* Dropdown */}
                      {showLocationDropdown && placePredictions.length > 0 && (
                        <div className="absolute z-50 w-full mt-1 max-h-60 overflow-auto bg-white border border-neutral-300 rounded-lg shadow-lg">
                          {placePredictions.map((prediction, index) => (
                            <div
                              key={prediction.place_id}
                              onClick={() => handlePlaceSelect(prediction.place_id, prediction.description, true)}
                              onMouseEnter={() => setSelectedLocationIndex(index)}
                              className={`px-3 py-2 cursor-pointer text-sm transition-colors ${
                                selectedLocationIndex === index
                                  ? 'bg-secondary-500 text-accent-700 font-semibold'
                                  : 'hover:bg-primary-100'
                              }`}
                            >
                              <div className="flex items-start gap-2">
                                <MapPin className="w-4 h-4 mt-0.5 flex-shrink-0 text-secondary-600" />
                                <div className="flex-1 min-w-0">
                                  <p className="font-medium text-accent-700">
                                    {prediction.structured_formatting.main_text}
                                  </p>
                                  <p className="text-xs text-primary-700 truncate">
                                    {prediction.structured_formatting.secondary_text}
                                  </p>
                                </div>
                              </div>
                            </div>
                          ))}
                        </div>
                      )}
                    </div>
                  )}

                  <GoogleLocationMap
                    location={deliveryAddress}
                    onLocationSelect={(location, coordinates) => {
                      setDeliveryAddress(location);
                      setDeliveryCoordinates(coordinates);
                    }}
                    initialCoordinates={deliveryCoordinates}
                    hideLocationDisplay={true}
                  />
                  </div>
                </div>
              </div>
            )}

            {/* Warehouse Validated */}
            {selectedDealType === "platform-inspection" && (
              <div className="space-y-3">
                <h4 className="font-semibold text-sm text-accent-700 flex items-center gap-2">
                  <ClipboardCheck className="w-3.5 h-3.5" />
                  Warehouse Validated - Delivery Information
                </h4>
                <div className="p-3 bg-primary-50 rounded-lg border border-primary-200">
                  <div>
                  <label className="block text-xs font-medium text-accent-700 mb-2">
                    Search or Select Delivery Address
                  </label>

                  {/* Show selected location or search input */}
                  {deliveryAddress && !showLocationDropdown ? (
                    <div
                      className="mb-3 p-3 bg-white rounded-lg border-2 border-primary-300 cursor-pointer hover:border-secondary-500 transition-colors"
                      onClick={() => {
                        setDeliveryAddress("");
                        setDeliveryCoordinates(undefined);
                      }}
                    >
                      <p className="text-xs text-primary-700 mb-1">Selected Location:</p>
                      <p className="text-sm font-medium text-accent-700 flex items-start gap-2">
                        <MapPin className="w-4 h-4 mt-0.5 flex-shrink-0 text-secondary-600" />
                        <span>{deliveryAddress}</span>
                      </p>
                      <p className="text-xs text-secondary-600 mt-2">Click to change location</p>
                    </div>
                  ) : (
                    <div className="relative mb-3">
                      <Input
                        type="text"
                        value={deliveryAddress}
                        onChange={(e) => {
                          const value = e.target.value;
                          setDeliveryAddress(value);
                          handleLocationSearch(value, true);
                          setSelectedLocationIndex(-1);
                        }}
                        onKeyDown={(e) => {
                          if (!showLocationDropdown || placePredictions.length === 0) return;

                          if (e.key === 'ArrowDown') {
                            e.preventDefault();
                            setSelectedLocationIndex(prev => Math.min(prev + 1, placePredictions.length - 1));
                          } else if (e.key === 'ArrowUp') {
                            e.preventDefault();
                            setSelectedLocationIndex(prev => Math.max(prev - 1, -1));
                          } else if (e.key === 'Enter' && selectedLocationIndex >= 0) {
                            e.preventDefault();
                            const prediction = placePredictions[selectedLocationIndex];
                            handlePlaceSelect(prediction.place_id, prediction.description, true);
                          } else if (e.key === 'Escape') {
                            setShowLocationDropdown(false);
                            setSelectedLocationIndex(-1);
                          }
                        }}
                        onBlur={() => {
                          setTimeout(() => {
                            setShowLocationDropdown(false);
                            setSelectedLocationIndex(-1);
                          }, 200);
                        }}
                        placeholder="Search for address..."
                        className="w-full pr-10"
                        autoFocus
                      />
                      {isSearchingPlaces && (
                        <div className="absolute right-3 top-1/2 -translate-y-1/2">
                          <Loader2 className="w-4 h-4 animate-spin text-secondary-600" />
                        </div>
                      )}

                      {/* Dropdown */}
                      {showLocationDropdown && placePredictions.length > 0 && (
                        <div className="absolute z-50 w-full mt-1 max-h-60 overflow-auto bg-white border border-neutral-300 rounded-lg shadow-lg">
                          {placePredictions.map((prediction, index) => (
                            <div
                              key={prediction.place_id}
                              onClick={() => handlePlaceSelect(prediction.place_id, prediction.description, true)}
                              onMouseEnter={() => setSelectedLocationIndex(index)}
                              className={`px-3 py-2 cursor-pointer text-sm transition-colors ${
                                selectedLocationIndex === index
                                  ? 'bg-secondary-500 text-accent-700 font-semibold'
                                  : 'hover:bg-primary-100'
                              }`}
                            >
                              <div className="flex items-start gap-2">
                                <MapPin className="w-4 h-4 mt-0.5 flex-shrink-0 text-secondary-600" />
                                <div className="flex-1 min-w-0">
                                  <p className="font-medium text-accent-700">
                                    {prediction.structured_formatting.main_text}
                                  </p>
                                  <p className="text-xs text-primary-700 truncate">
                                    {prediction.structured_formatting.secondary_text}
                                  </p>
                                </div>
                              </div>
                            </div>
                          ))}
                        </div>
                      )}
                    </div>
                  )}

                  <GoogleLocationMap
                    location={deliveryAddress}
                    onLocationSelect={(location, coordinates) => {
                      setDeliveryAddress(location);
                      setDeliveryCoordinates(coordinates);
                    }}
                    initialCoordinates={deliveryCoordinates}
                    hideLocationDisplay={true}
                  />
                  </div>
                  <div className="p-3 bg-success-50 border border-success-500 rounded-lg">
                    <p className="text-xs text-success-900 flex items-start gap-2">
                      <ClipboardCheck className="w-4 h-4 flex-shrink-0 mt-0.5" />
                      <span><strong>Premium Service:</strong> Item will be authenticated and quality-checked at our warehouse before delivery.</span>
                    </p>
                  </div>
                </div>
              </div>
            )}

            {/* Direct Shipping */}
            {selectedDealType === "direct-shipping" && (
              <div className="space-y-3">
                <h4 className="font-semibold text-sm text-accent-700 flex items-center gap-2">
                  <Truck className="w-3.5 h-3.5" />
                  Shipping Information
                </h4>
                <div className="p-3 bg-primary-50 rounded-lg border border-primary-200">
                  <div>
                  <label className="block text-xs font-medium text-accent-700 mb-2">
                    Search or Select Shipping Address
                  </label>

                  {/* Show selected location or search input */}
                  {deliveryAddress && !showLocationDropdown ? (
                    <div
                      className="mb-3 p-3 bg-white rounded-lg border-2 border-primary-300 cursor-pointer hover:border-secondary-500 transition-colors"
                      onClick={() => {
                        setDeliveryAddress("");
                        setDeliveryCoordinates(undefined);
                      }}
                    >
                      <p className="text-xs text-primary-700 mb-1">Selected Location:</p>
                      <p className="text-sm font-medium text-accent-700 flex items-start gap-2">
                        <MapPin className="w-4 h-4 mt-0.5 flex-shrink-0 text-secondary-600" />
                        <span>{deliveryAddress}</span>
                      </p>
                      <p className="text-xs text-secondary-600 mt-2">Click to change location</p>
                    </div>
                  ) : (
                    <div className="relative mb-3">
                      <Input
                        type="text"
                        value={deliveryAddress}
                        onChange={(e) => {
                          const value = e.target.value;
                          setDeliveryAddress(value);
                          handleLocationSearch(value, true);
                          setSelectedLocationIndex(-1);
                        }}
                        onKeyDown={(e) => {
                          if (!showLocationDropdown || placePredictions.length === 0) return;

                          if (e.key === 'ArrowDown') {
                            e.preventDefault();
                            setSelectedLocationIndex(prev => Math.min(prev + 1, placePredictions.length - 1));
                          } else if (e.key === 'ArrowUp') {
                            e.preventDefault();
                            setSelectedLocationIndex(prev => Math.max(prev - 1, -1));
                          } else if (e.key === 'Enter' && selectedLocationIndex >= 0) {
                            e.preventDefault();
                            const prediction = placePredictions[selectedLocationIndex];
                            handlePlaceSelect(prediction.place_id, prediction.description, true);
                          } else if (e.key === 'Escape') {
                            setShowLocationDropdown(false);
                            setSelectedLocationIndex(-1);
                          }
                        }}
                        onBlur={() => {
                          setTimeout(() => {
                            setShowLocationDropdown(false);
                            setSelectedLocationIndex(-1);
                          }, 200);
                        }}
                        placeholder="Search for address..."
                        className="w-full pr-10"
                        autoFocus
                      />
                      {isSearchingPlaces && (
                        <div className="absolute right-3 top-1/2 -translate-y-1/2">
                          <Loader2 className="w-4 h-4 animate-spin text-secondary-600" />
                        </div>
                      )}

                      {/* Dropdown */}
                      {showLocationDropdown && placePredictions.length > 0 && (
                        <div className="absolute z-50 w-full mt-1 max-h-60 overflow-auto bg-white border border-neutral-300 rounded-lg shadow-lg">
                          {placePredictions.map((prediction, index) => (
                            <div
                              key={prediction.place_id}
                              onClick={() => handlePlaceSelect(prediction.place_id, prediction.description, true)}
                              onMouseEnter={() => setSelectedLocationIndex(index)}
                              className={`px-3 py-2 cursor-pointer text-sm transition-colors ${
                                selectedLocationIndex === index
                                  ? 'bg-secondary-500 text-accent-700 font-semibold'
                                  : 'hover:bg-primary-100'
                              }`}
                            >
                              <div className="flex items-start gap-2">
                                <MapPin className="w-4 h-4 mt-0.5 flex-shrink-0 text-secondary-600" />
                                <div className="flex-1 min-w-0">
                                  <p className="font-medium text-accent-700">
                                    {prediction.structured_formatting.main_text}
                                  </p>
                                  <p className="text-xs text-primary-700 truncate">
                                    {prediction.structured_formatting.secondary_text}
                                  </p>
                                </div>
                              </div>
                            </div>
                          ))}
                        </div>
                      )}
                    </div>
                  )}

                  <GoogleLocationMap
                    location={deliveryAddress}
                    onLocationSelect={(location, coordinates) => {
                      setDeliveryAddress(location);
                      setDeliveryCoordinates(coordinates);
                    }}
                    initialCoordinates={deliveryCoordinates}
                    hideLocationDisplay={true}
                  />
                  </div>
                </div>
                <div className="p-3 bg-warning-50 border border-warning-500 rounded-lg">
                  <p className="text-xs text-warning-900 flex items-start gap-2">
                    <AlertTriangle className="w-4 h-4 flex-shrink-0 mt-0.5" />
                    <span><strong>Note:</strong> Direct shipping does not include payment protection. Proceed with caution.</span>
                  </p>
                </div>
              </div>
            )}

            {selectedDealType === "in-person" && (
              <div>
                {/* Sub-step toggle for in-person: schedule first, then location */}
                {!meetupDate ? (
                  /* Meetup Schedule - First step */
                  <div className="space-y-3">
                    <h4 className="font-semibold text-sm text-accent-700 flex items-center gap-2">
                      <Calendar className="w-3.5 h-3.5" />
                      Schedule Meetup
                    </h4>
                    <div className="p-3 bg-primary-50 rounded-lg border border-primary-200">
                    <MeetupScheduler
                      onScheduleSelect={(availability) => {
                        // Store the full availability object
                        // For backward compatibility, also set single date/time if specific dates exist
                        if (availability.specific.length > 0) {
                          const firstAvail = availability.specific[0];
                          setMeetupDate(firstAvail.date);
                          if (firstAvail.timeSlots.length > 0) {
                            setMeetupTime(`${firstAvail.timeSlots[0].startTime}-${firstAvail.timeSlots[0].endTime}`);
                          }
                        }
                      }}
                    />
                    </div>
                  </div>
                ) : !meetupLocation ? (
                  /* Meetup Location - shown after schedule is set */
                  <div className="space-y-3">
                    {/* Show selected schedule summary */}
                    <div className="p-3 bg-secondary-50 border-2 border-secondary-500 rounded-lg">
                      <div className="flex items-start justify-between">
                        <div className="flex-1">
                          <p className="text-xs text-primary-700 mb-1">Scheduled Time:</p>
                          <p className="text-sm font-medium text-accent-700 flex items-start gap-2">
                            <Calendar className="w-4 h-4 mt-0.5 flex-shrink-0 text-secondary-600" />
                            <span>
                              {new Date(meetupDate).toLocaleDateString('en-US', { weekday: 'short', month: 'short', day: 'numeric' })}
                              {meetupTime && ` • ${meetupTime}`}
                            </span>
                          </p>
                        </div>
                        <button
                          onClick={() => {
                            setMeetupDate("");
                            setMeetupTime("");
                          }}
                          className="text-xs px-2 py-1 text-secondary-600 hover:text-secondary-700 underline"
                        >
                          Change
                        </button>
                      </div>
                    </div>

                    {/* Meetup Location with Map */}
                    <h4 className="font-semibold text-sm text-accent-700 flex items-center gap-2">
                      <MapPin className="w-3.5 h-3.5" />
                      Select Meetup Location
                    </h4>
                    <div className="p-3 bg-primary-50 rounded-lg border border-primary-200">
                      <div>

                      {/* Search Input */}
                      <div className="mb-3">
                        <label className="block text-xs font-medium text-accent-700 mb-2">
                          Search for Location
                        </label>
                        <div className="relative">
                          <Input
                            type="text"
                            value={meetupSearchQuery}
                            onChange={(e) => {
                              const value = e.target.value;
                              setMeetupSearchQuery(value);
                              handleLocationSearch(value, false);
                              setSelectedLocationIndex(-1);
                            }}
                            onKeyDown={(e) => {
                              if (!showLocationDropdown || placePredictions.length === 0) return;

                              if (e.key === 'ArrowDown') {
                                e.preventDefault();
                                setSelectedLocationIndex(prev => Math.min(prev + 1, placePredictions.length - 1));
                              } else if (e.key === 'ArrowUp') {
                                e.preventDefault();
                                setSelectedLocationIndex(prev => Math.max(prev - 1, -1));
                              } else if (e.key === 'Enter' && selectedLocationIndex >= 0) {
                                e.preventDefault();
                                const prediction = placePredictions[selectedLocationIndex];
                                handlePlaceSelect(prediction.place_id, prediction.description, false);
                                setMeetupSearchQuery(prediction.description);
                              } else if (e.key === 'Escape') {
                                setShowLocationDropdown(false);
                                setSelectedLocationIndex(-1);
                              }
                            }}
                            onBlur={() => {
                              setTimeout(() => {
                                setShowLocationDropdown(false);
                                setSelectedLocationIndex(-1);
                              }, 200);
                            }}
                            placeholder="Search for meetup location..."
                            className="w-full pr-10"
                          />
                          {isSearchingPlaces && (
                            <div className="absolute right-3 top-1/2 -translate-y-1/2">
                              <Loader2 className="w-4 h-4 animate-spin text-secondary-600" />
                            </div>
                          )}

                          {/* Dropdown */}
                          {showLocationDropdown && placePredictions.length > 0 && (
                            <div className="absolute z-50 w-full mt-1 max-h-60 overflow-auto bg-white border border-neutral-300 rounded-lg shadow-lg">
                              {placePredictions.map((prediction, index) => (
                                <div
                                  key={prediction.place_id}
                                  onClick={() => {
                                    handlePlaceSelect(prediction.place_id, prediction.description, false);
                                    setMeetupSearchQuery(prediction.description);
                                  }}
                                  onMouseEnter={() => setSelectedLocationIndex(index)}
                                  className={`px-3 py-2 cursor-pointer text-sm transition-colors ${
                                    selectedLocationIndex === index
                                      ? 'bg-secondary-500 text-accent-700 font-semibold'
                                      : 'hover:bg-primary-100'
                                  }`}
                                >
                                  <div className="flex items-start gap-2">
                                    <MapPin className="w-4 h-4 mt-0.5 flex-shrink-0 text-secondary-600" />
                                    <div className="flex-1 min-w-0">
                                      <p className="font-medium text-accent-700">
                                        {prediction.structured_formatting.main_text}
                                      </p>
                                      <p className="text-xs text-primary-700 truncate">
                                        {prediction.structured_formatting.secondary_text}
                                      </p>
                                    </div>
                                  </div>
                                </div>
                              ))}
                            </div>
                          )}
                        </div>
                      </div>

                      <GoogleLocationMap
                        location={meetupLocation}
                        onLocationSelect={(location, coordinates) => {
                          setMeetupLocation(location);
                          setMeetupCoordinates(coordinates);
                        }}
                        initialCoordinates={meetupCoordinates}
                        hideLocationDisplay={false}
                      />

                      <div className="p-3 bg-primary-100 border border-primary-300 rounded-lg mt-3">
                        <p className="text-xs text-accent-700 flex items-start gap-2">
                          <Lightbulb className="w-4 h-4 flex-shrink-0 mt-0.5" />
                          <span><strong>Tip:</strong> Choose a public, well-lit location for safety.</span>
                        </p>
                      </div>
                      </div>
                    </div>
                  </div>
                ) : (
                  /* Summary - shown after both schedule and location are set */
                  <div className="space-y-3">
                    {/* Show selected schedule summary */}
                    <div className="p-3 bg-secondary-50 border-2 border-secondary-500 rounded-lg">
                      <div className="flex items-start justify-between">
                        <div className="flex-1">
                          <p className="text-xs text-primary-700 mb-1">Scheduled Time:</p>
                          <p className="text-sm font-medium text-accent-700 flex items-start gap-2">
                            <Calendar className="w-4 h-4 mt-0.5 flex-shrink-0 text-secondary-600" />
                            <span>
                              {new Date(meetupDate).toLocaleDateString('en-US', { weekday: 'short', month: 'short', day: 'numeric' })}
                              {meetupTime && ` • ${meetupTime}`}
                            </span>
                          </p>
                        </div>
                        <button
                          onClick={() => {
                            setMeetupDate("");
                            setMeetupTime("");
                          }}
                          className="text-xs px-2 py-1 text-secondary-600 hover:text-secondary-700 underline"
                        >
                          Change
                        </button>
                      </div>
                    </div>

                    {/* Show selected location summary */}
                    <div className="p-3 bg-secondary-50 border-2 border-secondary-500 rounded-lg">
                      <div className="flex items-start justify-between">
                        <div className="flex-1">
                          <p className="text-xs text-primary-700 mb-1">Meetup Location:</p>
                          <p className="text-sm font-medium text-accent-700 flex items-start gap-2">
                            <MapPin className="w-4 h-4 mt-0.5 flex-shrink-0 text-secondary-600" />
                            <span>{meetupLocation}</span>
                          </p>
                        </div>
                        <button
                          onClick={() => {
                            setMeetupLocation("");
                            setMeetupCoordinates(undefined);
                          }}
                          className="text-xs px-2 py-1 text-secondary-600 hover:text-secondary-700 underline"
                        >
                          Change
                        </button>
                      </div>
                    </div>
                  </div>
                )}
              </div>
            )}
              </div>
            )}

            {/* Step 3: Deal Summary */}
            {currentStep === 3 && (
              <div className="space-y-4">
                <div className="mb-4">
                  <h3 className="text-lg font-semibold text-accent-700 mb-1">Deal Summary</h3>
                  <p className="text-sm text-primary-700">Review all details before finalizing</p>
                </div>

                {/* Transaction Method Summary */}
                <div className="p-4 bg-secondary-50 border-2 border-secondary-500 rounded-lg">
                  <div className="flex items-center gap-3 mb-3">
                    {selectedDealType === "in-person" && <Handshake className="w-5 h-5 text-secondary-600" />}
                    {selectedDealType === "direct-shipping" && <Truck className="w-5 h-5 text-secondary-600" />}
                    {selectedDealType === "platform-logistics" && <Warehouse className="w-5 h-5 text-secondary-600" />}
                    {selectedDealType === "platform-inspection" && <ClipboardCheck className="w-5 h-5 text-secondary-600" />}
                    <div>
                      <h4 className="font-semibold text-accent-700">
                        {dealTypeOptions.find(opt => opt.id === selectedDealType)?.title}
                      </h4>
                      <p className="text-xs text-primary-700">
                        {dealTypeOptions.find(opt => opt.id === selectedDealType)?.description}
                      </p>
                    </div>
                  </div>
                  <div className="flex flex-wrap gap-2">
                    {dealTypeOptions.find(opt => opt.id === selectedDealType)?.features.map((feature, idx) => (
                      <span key={idx} className="text-xs px-2 py-1 bg-white rounded-full text-accent-700 border border-primary-200">
                        {feature}
                      </span>
                    ))}
                  </div>
                </div>

                {/* Item Details */}
                <div className="p-4 bg-primary-50 rounded-lg border border-primary-200">
                  <h4 className="font-semibold text-sm text-accent-700 mb-3">Item Details</h4>
                  <div className="flex items-start gap-4 mb-3">
                    <div className="w-24 h-24 bg-primary-200 rounded-lg flex items-center justify-center shrink-0">
                      <span className="text-xs text-accent-400">Image</span>
                    </div>
                    <div className="flex-1 min-w-0">
                      <h3 className="font-semibold text-accent-700 mb-1">{listing.title}</h3>
                      <p className="text-sm text-primary-700 mb-2 line-clamp-2">{listing.description}</p>
                      <div className="flex items-center gap-4 text-xs text-primary-700">
                        <span>Quantity: {listing.quantity || 1}</span>
                        <span className="text-lg font-bold text-accent-700">
                          {listing.currency} {listing.minPrice} - {listing.maxPrice}
                        </span>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Transaction Details */}
                <div className="p-4 bg-primary-50 rounded-lg border border-primary-200">
                  <h4 className="font-semibold text-sm text-accent-700 mb-3">Transaction Details</h4>

                  {/* Delivery/Shipping Address */}
                  {(selectedDealType === "platform-logistics" ||
                    selectedDealType === "platform-inspection" ||
                    selectedDealType === "direct-shipping") && deliveryAddress && (
                    <div className="mb-3">
                      <div className="flex items-start gap-2 text-sm">
                        <MapPin className="w-4 h-4 mt-0.5 text-secondary-600 shrink-0" />
                        <div>
                          <p className="font-medium text-accent-700">
                            {selectedDealType === "direct-shipping" ? "Shipping Address" : "Delivery Address"}
                          </p>
                          <p className="text-primary-700">{deliveryAddress}</p>
                        </div>
                      </div>
                    </div>
                  )}

                  {/* Meetup Details */}
                  {selectedDealType === "in-person" && meetupLocation && (
                    <div className="space-y-2">
                      <div className="flex items-start gap-2 text-sm">
                        <MapPin className="w-4 h-4 mt-0.5 text-secondary-600 shrink-0" />
                        <div>
                          <p className="font-medium text-accent-700">Meetup Location</p>
                          <p className="text-primary-700">{meetupLocation}</p>
                        </div>
                      </div>
                      {(meetupDate || meetupTime) && (
                        <div className="flex items-start gap-2 text-sm">
                          <Calendar className="w-4 h-4 mt-0.5 text-secondary-600 shrink-0" />
                          <div>
                            <p className="font-medium text-accent-700">Scheduled Time</p>
                            <p className="text-primary-700">
                              {meetupDate && new Date(meetupDate).toLocaleDateString()}
                              {meetupTime && ` at ${meetupTime}`}
                            </p>
                          </div>
                        </div>
                      )}
                    </div>
                  )}

                  {/* Payment Protection */}
                  <div className="mt-3 pt-3 border-t border-primary-200">
                    <div className="flex items-start gap-2 text-sm">
                      <Shield className="w-4 h-4 mt-0.5 text-secondary-600 shrink-0" />
                      <div>
                        <p className="font-medium text-accent-700">Payment Protection</p>
                        <p className="text-primary-700">
                          {selectedDealType === "in-person"
                            ? "No escrow - payment during exchange"
                            : selectedDealType === "direct-shipping"
                            ? "No escrow - direct payment to seller"
                            : "Escrow protected - payment held until confirmed"}
                        </p>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Warning/Info Banners */}
                {selectedDealType === "direct-shipping" && (
                  <div className="p-3 bg-warning-50 border border-warning-500 rounded-lg">
                    <p className="text-xs text-warning-900 flex items-start gap-2">
                      <AlertTriangle className="w-4 h-4 flex-shrink-0 mt-0.5" />
                      <span><strong>Important:</strong> Direct shipping has no payment protection. Proceed with caution.</span>
                    </p>
                  </div>
                )}

                {selectedDealType === "platform-inspection" && (
                  <div className="p-3 bg-success-50 border border-success-500 rounded-lg">
                    <p className="text-xs text-success-900 flex items-start gap-2">
                      <ClipboardCheck className="w-4 h-4 flex-shrink-0 mt-0.5" />
                      <span><strong>Premium Service:</strong> This item will be authenticated and quality-checked at our warehouse.</span>
                    </p>
                  </div>
                )}

                {selectedDealType === "in-person" && (
                  <div className="p-3 bg-primary-100 border border-primary-300 rounded-lg">
                    <p className="text-xs text-accent-700 flex items-start gap-2">
                      <Lightbulb className="w-4 h-4 flex-shrink-0 mt-0.5" />
                      <span><strong>Safety Tip:</strong> Meet in a public, well-lit location.</span>
                    </p>
                  </div>
                )}
              </div>
            )}
          </div>

          {/* Footer */}
          <div className="px-4 py-3 border-t border-neutral-200 bg-primary-50 shrink-0">
            {currentStep === 1 ? (
              <Button
                onClick={handleNext}
                disabled={!selectedDealType}
                className="w-full bg-secondary-500 hover:bg-secondary-600 text-accent-700 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                Continue to Details
              </Button>
            ) : currentStep === 2 ? (
              <Button
                onClick={handleNext}
                disabled={!selectedDealType}
                className="w-full bg-secondary-500 hover:bg-secondary-600 text-accent-700 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                Review Deal
              </Button>
            ) : (
              <Button
                onClick={handleConfirm}
                disabled={!selectedDealType}
                className="w-full bg-secondary-500 hover:bg-secondary-600 text-accent-700 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                Confirm & Finalize Deal
              </Button>
            )}
          </div>
        </Card>
      </motion.div>
    </motion.div>
  );

  // Render modal in a portal to escape stacking context issues
  if (typeof window !== 'undefined') {
    return createPortal(modalContent, document.body);
  }

  return null;
}

export function CheckoutModal({ listing, onClose, onBack, onConfirm }: CheckoutModalProps) {
  const apiKey = process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY || '';
  return (
    <APIProvider apiKey={apiKey}>
      <CheckoutModalContent
        listing={listing}
        onClose={onClose}
        onBack={onBack}
        onConfirm={onConfirm}
      />
    </APIProvider>
  );
}
