"use client";

import { motion } from "motion/react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { ShoppingCart, Package, Handshake, X, MapPin, Clock, Eye, Heart, Tag, BadgeCheck, TrendingUp, User } from "lucide-react";
import { type Listing as MockListing } from "@/utils/mock-all-data-used";
import { type Listing as ApiListing } from "@/types/listing";
import { MatchedListing } from "@/components/matching/types";
import React, { useState } from "react";
import { createPortal } from "react-dom";
import { CheckoutModal, DealDetails } from "@/components/checkout/CheckoutModal";

interface ListingDetailsModalProps {
  listing: MockListing | MatchedListing | ApiListing;
  type: "sale" | "wanted" | "matched";
  onClose: () => void;
}

export function ListingDetailsModal({ listing, type, onClose }: ListingDetailsModalProps) {
  const [showCheckout, setShowCheckout] = useState(false);

  // Helper function to check if listing is from API (has snake_case properties)
  const isApiListing = (l: typeof listing): l is ApiListing => {
    return 'creator_location' in l || 'created_at' in l;
  };

  // Helper to get location regardless of format
  const getLocation = () => {
    if (isApiListing(listing)) {
      return listing.creator_location || "Location not specified";
    }
    return 'location' in listing ? listing.location : "Location not specified";
  };

  // Helper to get timestamp/time ago
  const getTimePosted = () => {
    if (isApiListing(listing)) {
      return new Date(listing.created_at).toLocaleDateString();
    }
    if ('timestamp' in listing) return listing.timestamp;
    if ('timeAgo' in listing) return listing.timeAgo;
    return "N/A";
  };

  // Helper to get price (handle budget for wanted listings)
  const getPrice = () => {
    if (type === "sale") {
      return `${listing.currency || 'MYR'} ${listing.price}`;
    }
    if ('budget' in listing) {
      return listing.budget;
    }
    if (isApiListing(listing) && listing.max_price) {
      return `${listing.currency} ${listing.max_price}`;
    }
    return `${listing.currency || 'MYR'} ${listing.price}`;
  };

  // Helper to get image URL
  const getImageUrl = () => {
    if (isApiListing(listing)) {
      return listing.image_url;
    }
    // Handle MatchedListing with images array
    if ('images' in listing && listing.images && listing.images.length > 0) {
      return listing.images[0];
    }
    return 'imageUrl' in listing ? listing.imageUrl : null;
  };

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

  const modalContent = showCheckout ? (
    <CheckoutModal
      listing={listing}
      onClose={onClose}
      onBack={handleCheckoutBack}
      onConfirm={handleCheckoutConfirm}
    />
  ) : (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="fixed inset-0 z-[10000] bg-black/60 backdrop-blur-sm flex items-center justify-center p-4"
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
        <Card className="bg-white overflow-hidden border-neutral-200 shadow-2xl max-h-[90vh] flex flex-col py-0 gap-2">
          {/* Header */}
          <div className="flex items-center justify-between px-6 py-3 border-b border-neutral-200 shrink-0 bg-primary-50">
            <div className="flex items-center gap-3">
              {type === "sale" ? (
                <ShoppingCart className="w-5 h-5 text-secondary-600" />
              ) : type === "wanted" ? (
                <Package className="w-5 h-5 text-secondary-600" />
              ) : (
                <Handshake className="w-5 h-5 text-secondary-600" />
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
          <div className="flex-1 overflow-y-auto p-4">
            {getImageUrl() ? (
              <img
                src={getImageUrl()!}
                alt={listing.title}
                className="w-full h-48 object-cover rounded-lg mb-3"
              />
            ) : (
              <div className="w-full h-48 bg-primary-100 rounded-lg flex items-center justify-center mb-3">
                <span className="text-accent-400 text-sm">No Image</span>
              </div>
            )}

            <div className="mb-3">
              <h1 className="text-xl font-bold text-accent-700 mb-1">
                {listing.title}
              </h1>
              <span className="text-2xl font-bold text-secondary-600">
                {getPrice()}
              </span>
            </div>

            <div className="mb-3 flex flex-wrap items-center gap-2">
              <span className="inline-block px-3 py-1.5 text-sm rounded-full bg-primary-200 text-accent-600 font-medium">
                {listing.category}
              </span>
              {/* Match Score Badge for Matched Listings */}
              {type === "matched" && "matchScore" in listing && listing.matchScore !== undefined && (
                <span className={`inline-flex items-center gap-1 px-3 py-1.5 text-sm rounded-full font-medium ${
                  listing.matchScore >= 90 ? 'bg-success-500 text-white' :
                  listing.matchScore >= 75 ? 'bg-secondary-500 text-accent-700' :
                  'bg-primary-300 text-accent-700'
                }`}>
                  <TrendingUp className="w-3.5 h-3.5" />
                  {listing.matchScore}% Match
                </span>
              )}
              {/* Verified Badge */}
              {(isApiListing(listing) && listing.creator_verified) || ("seller" in listing && listing.seller) ? (
                <span className="inline-flex items-center gap-1 px-3 py-1.5 text-sm rounded-full bg-success-500 text-white font-medium">
                  <BadgeCheck className="w-3.5 h-3.5" />
                  Verified
                </span>
              ) : null}
            </div>

            {/* Tags Section */}
            {"tags" in listing && listing.tags && listing.tags.length > 0 && (
              <div className="mb-3">
                <div className="flex flex-wrap gap-1.5">
                  {listing.tags.map((tag, index) => (
                    <span key={index} className="inline-flex items-center gap-1 px-2 py-0.5 text-xs rounded-full bg-secondary-100 text-secondary-700 border border-secondary-200">
                      <Tag className="w-3 h-3" />
                      {tag}
                    </span>
                  ))}
                </div>
              </div>
            )}

            <div className="mb-3">
              <h3 className="text-xs font-semibold text-accent-700 mb-1 uppercase tracking-wide">
                Description
              </h3>
              <p className="text-sm text-accent-600 leading-relaxed">
                {listing.description}
              </p>
            </div>

            <div className="grid grid-cols-2 gap-2 mb-3">
              <div className="flex items-start gap-2 p-2 bg-primary-50 rounded-lg">
                <MapPin className="w-4 h-4 text-secondary-600 mt-0.5 flex-shrink-0" />
                <div>
                  <div className="text-[10px] font-medium text-accent-500">Location</div>
                  <div className="text-xs font-semibold text-accent-700">{getLocation()}</div>
                </div>
              </div>

              <div className="flex items-start gap-2 p-2 bg-primary-50 rounded-lg">
                <Clock className="w-4 h-4 text-secondary-600 mt-0.5 flex-shrink-0" />
                <div>
                  <div className="text-[10px] font-medium text-accent-500">Posted</div>
                  <div className="text-xs font-semibold text-accent-700">
                    {getTimePosted()}
                  </div>
                </div>
              </div>

              {"views" in listing && (
                <div className="flex items-start gap-2 p-2 bg-primary-50 rounded-lg">
                  <Eye className="w-4 h-4 text-secondary-600 mt-0.5 flex-shrink-0" />
                  <div>
                    <div className="text-[10px] font-medium text-accent-500">Views</div>
                    <div className="text-xs font-semibold text-accent-700">
                      {listing.views}
                    </div>
                  </div>
                </div>
              )}

              {"likes" in listing && (
                <div className="flex items-start gap-2 p-2 bg-primary-50 rounded-lg">
                  <Heart className="w-4 h-4 text-secondary-600 mt-0.5 flex-shrink-0" />
                  <div>
                    <div className="text-[10px] font-medium text-accent-500">Likes</div>
                    <div className="text-xs font-semibold text-accent-700">
                      {listing.likes}
                    </div>
                  </div>
                </div>
              )}

              {/* Seller/Creator Info */}
              {(isApiListing(listing) && listing.creator_name) || ("seller" in listing && listing.seller) ? (
                <div className="flex items-start gap-2 p-2 bg-primary-50 rounded-lg">
                  <User className="w-4 h-4 text-secondary-600 mt-0.5 flex-shrink-0" />
                  <div>
                    <div className="text-[10px] font-medium text-accent-500">{type === "sale" ? "Seller" : "Buyer"}</div>
                    <div className="text-xs font-semibold text-accent-700">
                      {isApiListing(listing) ? listing.creator_name : 'seller' in listing ? listing.seller : 'Unknown'}
                    </div>
                  </div>
                </div>
              ) : null}
            </div>

            {/* Match Reasons for Matched Listings */}
            {type === "matched" && "matchReasons" in listing && listing.matchReasons && listing.matchReasons.length > 0 && (
              <div className="mb-3 p-3 bg-secondary-50 border border-secondary-200 rounded-lg">
                <h3 className="text-xs font-semibold text-accent-700 mb-2 flex items-center gap-2">
                  <TrendingUp className="w-3.5 h-3.5" />
                  Why This Match?
                </h3>
                <ul className="space-y-1">
                  {listing.matchReasons.map((reason, index) => (
                    <li key={index} className="flex items-start gap-1.5 text-xs text-accent-600">
                      <span className="text-secondary-600 mt-0.5">•</span>
                      <span>{reason}</span>
                    </li>
                  ))}
                </ul>
              </div>
            )}

            <div className="border-t border-neutral-200 pt-3">
              <h3 className="text-xs font-semibold text-accent-700 mb-2 uppercase tracking-wide">
                Additional Information
              </h3>
              <div className="space-y-1.5 text-xs">
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
                {/* AI Match Score from background negotiations */}
                {type === "matched" && "matchScore" in listing && typeof listing.matchScore === 'number' && (
                  <div className="flex justify-between">
                    <span className="text-accent-500">AI Match Score</span>
                    <span className={`font-medium ${
                      listing.matchScore >= 80 ? 'text-success-500' :
                      listing.matchScore >= 60 ? 'text-secondary-700' :
                      'text-primary-600'
                    }`}>
                      {listing.matchScore}%
                    </span>
                  </div>
                )}
              </div>
            </div>
          </div>

          <div className="px-4 py-3 border-t border-neutral-200 bg-primary-50 shrink-0">
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

  // Render modal in a portal to escape stacking context issues
  if (typeof window !== 'undefined') {
    return createPortal(modalContent, document.body);
  }

  return null;
}
