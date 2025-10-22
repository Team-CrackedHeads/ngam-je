"use client";

import { motion } from "motion/react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { ShoppingCart, Package, Cable, X, MapPin, Clock, Eye, Heart } from "lucide-react";
import { type Listing } from "@/utils/mock-listings-data";
import { MatchedListing } from "@/components/matching/types";
import React, { useState } from "react";
import { CheckoutModal, DealDetails } from "@/components/checkout/CheckoutModal";

interface ListingDetailsModalProps {
  listing: Listing | MatchedListing;
  type: "sale" | "wanted" | "matched";
  onClose: () => void;
}

export function ListingDetailsModal({ listing, type, onClose }: ListingDetailsModalProps) {
  const [showCheckout, setShowCheckout] = useState(false);

  const handleCheckout = () => {
    setShowCheckout(true);
  };

  const handleCheckoutConfirm = (dealDetails: DealDetails) => {
    console.log("Deal confirmed:", dealDetails);
    // TODO: Handle the deal confirmation (API call, navigation, etc.)
    onClose();
  };

  const handleCheckoutBack = () => {
    setShowCheckout(false);
  };

  if (showCheckout) {
    return (
      <CheckoutModal
        listing={listing}
        onClose={onClose}
        onBack={handleCheckoutBack}
        onConfirm={handleCheckoutConfirm}
      />
    );
  }

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="fixed inset-0 z-[9999] bg-black/60 backdrop-blur-sm flex items-center justify-center p-4"
      onClick={onClose}
    >
      <motion.div
        key="listing-details"
        initial={{ opacity: 0, scale: 0.95, y: 20 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        exit={{ opacity: 0, scale: 0.95, y: 20 }}
        transition={{ type: "spring", duration: 0.5 }}
        onClick={(e) => e.stopPropagation()}
        className="w-full max-w-2xl"
      >
        <Card className="bg-white overflow-hidden border-neutral-200 shadow-2xl max-h-[85vh] flex flex-col py-0">
          {/* Header */}
          <div className="flex items-center justify-between px-6 py-3 border-b border-neutral-200 shrink-0 bg-primary-50">
            <div className="flex items-center gap-3">
              {type === "sale" ? (
                <ShoppingCart className="w-5 h-5 text-secondary-600" />
              ) : type === "wanted" ? (
                <Package className="w-5 h-5 text-secondary-600" />
              ) : (
                <Cable className="w-5 h-5 text-secondary-600" />
              )}
              <h2 className="text-xl font-bold text-accent-700">
                Listing Details
              </h2>
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
            <div className="w-full h-64 bg-primary-100 rounded-xl flex items-center justify-center mb-6">
              <span className="text-accent-400 text-sm">Image</span>
            </div>

            <div className="mb-4">
              <h1 className="text-2xl font-bold text-accent-700 mb-2">
                {listing.title}
              </h1>
              <span className="text-3xl font-bold text-secondary-600">
                {type === "sale" ? listing.price : "budget" in listing ? listing.budget : listing.price}
              </span>
            </div>

            <div className="mb-4">
              <span className="inline-block px-3 py-1.5 text-sm rounded-full bg-primary-200 text-accent-600 font-medium">
                {listing.category}
              </span>
            </div>

            <div className="mb-6">
              <h3 className="text-sm font-semibold text-accent-700 mb-2 uppercase tracking-wide">
                Description
              </h3>
              <p className="text-accent-600 leading-relaxed">
                {listing.description}
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
              <div className="flex items-start gap-3 p-3 bg-primary-50 rounded-lg">
                <MapPin className="w-5 h-5 text-secondary-600 mt-0.5 flex-shrink-0" />
                <div>
                  <div className="text-xs font-medium text-accent-500 mb-1">Location</div>
                  <div className="text-sm font-semibold text-accent-700">{listing.location}</div>
                </div>
              </div>

              <div className="flex items-start gap-3 p-3 bg-primary-50 rounded-lg">
                <Clock className="w-5 h-5 text-secondary-600 mt-0.5 flex-shrink-0" />
                <div>
                  <div className="text-xs font-medium text-accent-500 mb-1">Posted</div>
                  <div className="text-sm font-semibold text-accent-700">
                    {"timestamp" in listing
                      ? listing.timestamp
                      : "timeAgo" in listing
                      ? listing.timeAgo
                      : "N/A"}
                  </div>
                </div>
              </div>

              {"views" in listing && (
                <div className="flex items-start gap-3 p-3 bg-primary-50 rounded-lg">
                  <Eye className="w-5 h-5 text-secondary-600 mt-0.5 flex-shrink-0" />
                  <div>
                    <div className="text-xs font-medium text-accent-500 mb-1">Views</div>
                    <div className="text-sm font-semibold text-accent-700">
                      {listing.views} views
                    </div>
                  </div>
                </div>
              )}

              {"likes" in listing && (
                <div className="flex items-start gap-3 p-3 bg-primary-50 rounded-lg">
                  <Heart className="w-5 h-5 text-secondary-600 mt-0.5 flex-shrink-0" />
                  <div>
                    <div className="text-xs font-medium text-accent-500 mb-1">Likes</div>
                    <div className="text-sm font-semibold text-accent-700">
                      {listing.likes} likes
                    </div>
                  </div>
                </div>
              )}
            </div>

            <div className="border-t border-neutral-200 pt-4">
              <h3 className="text-sm font-semibold text-accent-700 mb-3 uppercase tracking-wide">
                Additional Information
              </h3>
              <div className="space-y-2 text-sm">
                <div className="flex justify-between">
                  <span className="text-accent-500">Listing ID</span>
                  <span className="font-medium text-accent-700">#{listing.id}</span>
                </div>
                {"subscriptionTier" in listing && (
                  <div className="flex justify-between">
                    <span className="text-accent-500">Subscription Tier</span>
                    <span className="font-medium text-accent-700 capitalize">
                      {listing.subscriptionTier}
                    </span>
                  </div>
                )}
                {"expiresAt" in listing && (
                  <div className="flex justify-between">
                    <span className="text-accent-500">Expires At</span>
                    <span className="font-medium text-accent-700">
                      {new Date(listing.expiresAt).toLocaleDateString()}
                    </span>
                  </div>
                )}
              </div>
            </div>
          </div>

          <div className="px-6 py-4 border-t border-neutral-200 bg-primary-50 shrink-0">
            {type !== "matched" ? (
              <div className="flex gap-3">
                <Button className="flex-1 bg-secondary-500 hover:bg-secondary-600 text-accent-700">
                  Contact
                </Button>
              </div>
            ) : (
              <div className="flex gap-2">
                <Button onClick={handleCheckout} className="flex-1 bg-secondary-500 hover:bg-secondary-600 text-accent-700">
                  Checkout
                </Button>
                <Button className="flex-1 bg-primary-200 hover:bg-primary-300 text-accent-700">
                  Contact
                </Button>
                <Button className="flex-1 bg-error-500 hover:bg-error-900 text-white">
                  Unmatch
                </Button>
              </div>
            )}
          </div>
        </Card>
      </motion.div>
    </motion.div>
  );
}
