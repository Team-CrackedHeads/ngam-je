"use client";

import { motion } from "motion/react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { X, Package, Handshake, Truck, Shield, MapPin, Calendar, ArrowLeft } from "lucide-react";
import { type Listing } from "@/utils/mock-listings-data";
import { MatchedListing } from "@/components/matching/types";
import React, { useState } from "react";

interface CheckoutModalProps {
  listing: Listing | MatchedListing;
  onClose: () => void;
  onBack: () => void;
  onConfirm: (dealDetails: DealDetails) => void;
}

export type DealType = "escrow-delivery" | "in-person" | "direct-shipping";

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
    id: "escrow-delivery" as DealType,
    title: "Escrow + Delivery",
    description: "Secure payment held until delivery confirmed",
    icon: Shield,
    features: ["Payment protection", "Door-to-door delivery", "Tracking included"],
  },
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
    description: "Seller ships directly without escrow",
    icon: Truck,
    features: ["Faster processing", "Lower fees", "Track shipment"],
  },
];

export function CheckoutModal({ listing, onClose, onBack, onConfirm }: CheckoutModalProps) {
  const [selectedDealType, setSelectedDealType] = useState<DealType | null>(null);
  const [deliveryAddress, setDeliveryAddress] = useState("");
  const [meetupLocation, setMeetupLocation] = useState("");
  const [meetupDate, setMeetupDate] = useState("");
  const [meetupTime, setMeetupTime] = useState("");

  const handleConfirm = () => {
    if (!selectedDealType) return;

    const dealDetails: DealDetails = {
      dealType: selectedDealType,
      useEscrow: selectedDealType === "escrow-delivery",
      ...(selectedDealType === "escrow-delivery" && { deliveryAddress }),
      ...(selectedDealType === "direct-shipping" && { deliveryAddress }),
      ...(selectedDealType === "in-person" && {
        meetupLocation,
        meetupDate,
        meetupTime,
      }),
    };

    onConfirm(dealDetails);
  };

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="fixed inset-0 z-[9999] bg-black/60 backdrop-blur-sm flex items-center justify-center p-4"
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
        <Card className="bg-white overflow-hidden border-neutral-200 shadow-2xl max-h-[90vh] flex flex-col">
          {/* Header */}
          <div className="flex items-center justify-between px-6 py-3 border-b border-neutral-200 shrink-0 bg-primary-50">
            <div className="flex items-center gap-3">
              <Button
                variant="ghost"
                size="sm"
                onClick={onBack}
                className="rounded-full hover:bg-primary-100 transition-colors -ml-2"
              >
                <ArrowLeft className="h-5 w-5 text-accent-600" />
              </Button>
              <Package className="w-5 h-5 text-secondary-600" />
              <div>
                <h2 className="text-xl font-bold text-accent-700">Finalize Deal</h2>
                <p className="text-sm text-accent-500">Choose how you'd like to complete this transaction</p>
              </div>
            </div>
            <Button
              variant="ghost"
              size="sm"
              onClick={onClose}
              className="rounded-full hover:bg-primary-100 transition-colors"
            >
              <X className="h-5 w-5 text-accent-600" />
            </Button>
          </div>

          {/* Scrollable Content */}
          <div className="flex-1 overflow-y-auto p-6">
            {/* Listing Summary */}
            <div className="mb-6 p-4 bg-primary-50 rounded-lg border border-primary-200">
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

            {/* Deal Type Selection */}
            <div className="mb-6">
              <h3 className="text-sm font-semibold text-accent-700 mb-3 uppercase tracking-wide">
                Select Transaction Method
              </h3>
              <div className="space-y-3">
                {dealTypeOptions.map((option) => {
                  const Icon = option.icon;
                  const isSelected = selectedDealType === option.id;

                  return (
                    <button
                      key={option.id}
                      onClick={() => setSelectedDealType(option.id)}
                      className={`w-full text-left p-4 rounded-lg border-2 transition-all ${
                        isSelected
                          ? "border-secondary-500 bg-secondary-50"
                          : "border-neutral-200 bg-white hover:border-secondary-300"
                      }`}
                    >
                      <div className="flex items-start gap-3">
                        <Icon
                          className={`w-6 h-6 mt-0.5 ${
                            isSelected ? "text-secondary-600" : "text-accent-400"
                          }`}
                        />
                        <div className="flex-1">
                          <h4 className="font-semibold text-accent-700 mb-1">{option.title}</h4>
                          <p className="text-sm text-accent-500 mb-2">{option.description}</p>
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

            {/* Dynamic Form Based on Selection */}
            {selectedDealType === "escrow-delivery" && (
              <div className="space-y-4 p-4 bg-primary-50 rounded-lg border border-primary-200">
                <h4 className="font-semibold text-accent-700 flex items-center gap-2">
                  <MapPin className="w-4 h-4" />
                  Delivery Information
                </h4>
                <div>
                  <label className="block text-sm font-medium text-accent-700 mb-2">
                    Delivery Address
                  </label>
                  <textarea
                    value={deliveryAddress}
                    onChange={(e) => setDeliveryAddress(e.target.value)}
                    placeholder="Enter your full delivery address"
                    className="w-full px-3 py-2 border border-neutral-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-secondary-500 resize-none"
                    rows={3}
                  />
                </div>
              </div>
            )}

            {selectedDealType === "direct-shipping" && (
              <div className="space-y-4 p-4 bg-primary-50 rounded-lg border border-primary-200">
                <h4 className="font-semibold text-accent-700 flex items-center gap-2">
                  <Truck className="w-4 h-4" />
                  Shipping Information
                </h4>
                <div>
                  <label className="block text-sm font-medium text-accent-700 mb-2">
                    Shipping Address
                  </label>
                  <textarea
                    value={deliveryAddress}
                    onChange={(e) => setDeliveryAddress(e.target.value)}
                    placeholder="Enter your full shipping address"
                    className="w-full px-3 py-2 border border-neutral-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-secondary-500 resize-none"
                    rows={3}
                  />
                </div>
                <div className="p-3 bg-yellow-50 border border-yellow-200 rounded-lg">
                  <p className="text-sm text-yellow-800">
                    ⚠️ <strong>Note:</strong> Direct shipping does not include payment protection. Proceed with caution.
                  </p>
                </div>
              </div>
            )}

            {selectedDealType === "in-person" && (
              <div className="space-y-4 p-4 bg-primary-50 rounded-lg border border-primary-200">
                <h4 className="font-semibold text-accent-700 flex items-center gap-2">
                  <Handshake className="w-4 h-4" />
                  Meetup Details
                </h4>
                <div>
                  <label className="block text-sm font-medium text-accent-700 mb-2">
                    Meetup Location
                  </label>
                  <input
                    type="text"
                    value={meetupLocation}
                    onChange={(e) => setMeetupLocation(e.target.value)}
                    placeholder="e.g., Starbucks, KLCC"
                    className="w-full px-3 py-2 border border-neutral-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-secondary-500"
                  />
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-accent-700 mb-2">
                      Date
                    </label>
                    <input
                      type="date"
                      value={meetupDate}
                      onChange={(e) => setMeetupDate(e.target.value)}
                      className="w-full px-3 py-2 border border-neutral-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-secondary-500"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-accent-700 mb-2">
                      Time
                    </label>
                    <input
                      type="time"
                      value={meetupTime}
                      onChange={(e) => setMeetupTime(e.target.value)}
                      className="w-full px-3 py-2 border border-neutral-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-secondary-500"
                    />
                  </div>
                </div>
                <div className="p-3 bg-blue-50 border border-blue-200 rounded-lg">
                  <p className="text-sm text-blue-800">
                    💡 <strong>Tip:</strong> Choose a public, well-lit location for safety.
                  </p>
                </div>
              </div>
            )}
          </div>

          {/* Footer */}
          <div className="px-6 py-4 border-t border-neutral-200 bg-primary-50 shrink-0">
            <Button
              onClick={handleConfirm}
              disabled={!selectedDealType}
              className="w-full bg-secondary-500 hover:bg-secondary-600 text-accent-700 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              Confirm & Proceed
            </Button>
          </div>
        </Card>
      </motion.div>
    </motion.div>
  );
}
