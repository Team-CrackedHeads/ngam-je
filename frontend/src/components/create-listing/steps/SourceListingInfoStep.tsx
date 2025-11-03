'use client';

import React, { useState } from 'react';
import Image from 'next/image';
import { Label } from '@/components/ui/label';
import { Image as ImageIcon, CheckCircle } from 'lucide-react';

interface SourceListingInfoStepProps {
  sourceTitle: string;
  sourceDescription: string;
  sourceImages: string[];
  sourceOwnershipProof?: string | null;
  sourceTags: string[];
}

export default function SourceListingInfoStep({
  sourceTitle,
  sourceDescription,
  sourceImages,
  sourceOwnershipProof,
  sourceTags
}: SourceListingInfoStepProps) {
  const [selectedImageIndex, setSelectedImageIndex] = useState(0);

  return (
    <div className="space-y-6">
      <div className="text-center mb-6">
        <h2 className="text-3xl font-bold mb-2 text-[var(--color-accent-700)]">Source Listing</h2>
        <p className="text-lg text-[var(--color-primary-900)]">Review the listing you&apos;re making an offer for</p>
      </div>

      <div className="max-w-3xl mx-auto space-y-6">
        {/* Product Images Section (Read-only) */}
        <div>
          <Label className="text-base font-medium text-[var(--color-accent-700)] mb-3 block">
            Product Images
          </Label>
          {sourceImages.length > 0 ? (
            <div className="space-y-3">
              <div className="relative aspect-video rounded-lg overflow-hidden bg-gray-100 border-2 border-[var(--color-primary-200)]">
                <Image
                  src={sourceImages[selectedImageIndex]}
                  alt={`Product ${selectedImageIndex + 1}`}
                  fill
                  className="object-cover"
                />
              </div>

              {sourceImages.length > 1 && (
                <div className="flex gap-2 overflow-x-auto pb-2">
                  {sourceImages.map((img: string, idx: number) => (
                    <button
                      key={idx}
                      onClick={() => setSelectedImageIndex(idx)}
                      className={`relative flex-shrink-0 w-20 h-20 rounded-lg overflow-hidden border-2 transition-all ${
                        selectedImageIndex === idx
                          ? 'border-[var(--color-secondary-500)] shadow-md'
                          : 'border-gray-200'
                      }`}
                    >
                      <Image src={img} alt={`Thumbnail ${idx + 1}`} fill className="object-cover" />
                    </button>
                  ))}
                </div>
              )}
            </div>
          ) : (
            <div className="border-2 border-dashed border-gray-300 rounded-lg p-12 text-center bg-[var(--color-primary-50)]">
              <ImageIcon className="w-16 h-16 mx-auto mb-4 text-[var(--color-primary-500)]" />
              <p className="text-[var(--color-primary-900)] mb-2 font-medium">No images available</p>
            </div>
          )}
        </div>

        {/* Ownership Proof Section (Read-only) */}
        {sourceOwnershipProof && (
          <div className="pt-6 border-t-2 border-[var(--color-primary-300)]">
            <Label className="text-base font-medium mb-3 block text-[var(--color-accent-700)]">
              Proof of Ownership
            </Label>
            <div className="space-y-3">
              <div className="relative aspect-video rounded-lg overflow-hidden bg-gray-100 border-2 border-[var(--color-secondary-500)]">
                <Image
                  src={sourceOwnershipProof}
                  alt="Ownership Proof"
                  fill
                  className="object-cover"
                />
                <div className="absolute bottom-2 left-2 px-3 py-1 rounded bg-[var(--color-secondary-500)] text-[var(--color-accent-700)] text-sm font-medium flex items-center gap-2">
                  <CheckCircle className="w-4 h-4" />
                  Ownership Verified
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Title Section (Read-only) */}
        <div>
          <Label className="text-base font-medium text-[var(--color-accent-700)] mb-3 block">
            Title
          </Label>
          <div className="border-2 border-[var(--color-primary-300)] rounded-lg p-4 bg-[var(--color-primary-50)]">
            <p className="text-base text-[var(--color-accent-700)]">
              {sourceTitle}
            </p>
          </div>
        </div>

        {/* Description Section (Read-only) */}
        <div>
          <Label className="text-base font-medium text-[var(--color-accent-700)] mb-3 block">
            Description
          </Label>
          <div className="border-2 border-[var(--color-primary-300)] rounded-lg p-4 bg-[var(--color-primary-50)] min-h-[250px]">
            <p className="text-base text-[var(--color-primary-900)] whitespace-pre-wrap">
              {sourceDescription}
            </p>
          </div>
        </div>

        {/* Tags Section (Read-only) */}
        {sourceTags.length > 0 && (
          <div>
            <Label className="text-base font-medium text-[var(--color-accent-700)] mb-3 block">
              Tags
            </Label>
            <div className="flex flex-wrap gap-2">
              {sourceTags.map((tag, index) => (
                <div
                  key={index}
                  className="px-3 py-1.5 bg-[var(--color-secondary-100)] text-[var(--color-accent-700)] rounded-full text-sm font-medium border border-[var(--color-secondary-300)]"
                >
                  {tag}
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
