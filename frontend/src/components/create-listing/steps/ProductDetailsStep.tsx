'use client';

import React from 'react';
import Image from 'next/image';
import { Sparkles, Loader2, Upload, Trash2, Check, RotateCcw } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import TagGenerator, { TagGeneratorRef } from '@/components/create-listing/tag-generator';
import { PartialFormData } from '@/types/listing-form';

interface ProductDetailsStepProps {
  listingType: 'buy' | 'sell';
  formData: PartialFormData;
  setFormData: React.Dispatch<React.SetStateAction<PartialFormData>>;
  isAIModeEnabled: boolean;
  setIsAIModeEnabled: (enabled: boolean) => void;
  isGeneratingTitle: boolean;
  isGeneratingDescription: boolean;
  isGeneratingPhotos: boolean;
  isGeneratingAll: boolean;
  titleSuggestion: string;
  descriptionSuggestion: string;
  selectedImageIndex: number;
  setSelectedImageIndex: (index: number) => void;
  onGenerateTitle: () => void;
  onGenerateDescription: () => void;
  onGeneratePhotos: () => void;
  onGenerateAll: () => void;
  onTitleChange: (text: string) => void;
  onDescriptionChange: (text: string) => void;
  onImageUpload: (e: React.ChangeEvent<HTMLInputElement>) => void;
  onRemoveImage: (index: number) => void;
  onOwnershipProofUpload?: (e: React.ChangeEvent<HTMLInputElement>) => void;
  ownershipProofImage?: string | null;
  isVerifyingOwnership?: boolean;
  ownershipVerified?: boolean | null;
  tagGeneratorRef: React.RefObject<TagGeneratorRef | null>;
}

export default function ProductDetailsStep({
  listingType,
  formData,
  setFormData,
  isAIModeEnabled,
  setIsAIModeEnabled,
  isGeneratingTitle,
  isGeneratingDescription,
  isGeneratingPhotos,
  isGeneratingAll,
  titleSuggestion,
  descriptionSuggestion,
  selectedImageIndex,
  setSelectedImageIndex,
  onGenerateTitle,
  onGenerateDescription,
  onGeneratePhotos,
  onGenerateAll,
  onTitleChange,
  onDescriptionChange,
  onImageUpload,
  onRemoveImage,
  onOwnershipProofUpload,
  ownershipProofImage,
  isVerifyingOwnership: _isVerifyingOwnership,
  ownershipVerified: _ownershipVerified,
  tagGeneratorRef
}: ProductDetailsStepProps) {
  const hasAnyInput = (formData.generatedTitle?.length || 0) > 0 ||
                      (formData.generatedDescription?.length || 0) > 0 ||
                      ((listingType === 'buy' ? formData.generatedImages?.length : formData.uploadedImages?.length) || 0) > 0;

  const images = listingType === 'buy' ? formData.generatedImages : formData.uploadedImages;

  return (
    <div className="space-y-6">
      <div className="text-center mb-6">
        <h2 className="text-3xl font-bold mb-2 text-[var(--color-accent-700)]">Create Your Listing</h2>
        <p className="text-lg text-[var(--color-primary-900)]">Fill in details or let AI help you generate content</p>
      </div>

      {/* AI Action Bar */}
      <div className="bg-[var(--color-primary-100)] border border-[var(--color-primary-200)] rounded-lg p-4">
        <div className="flex items-center gap-3">
          <div className="flex items-center gap-2">
            <Switch
              id="ai-mode"
              checked={isAIModeEnabled}
              onCheckedChange={setIsAIModeEnabled}
              className="data-[state=checked]:bg-[var(--color-secondary-500)]"
            />
            <Label htmlFor="ai-mode" className="text-sm font-medium text-[var(--color-accent-700)] cursor-pointer flex items-center gap-1.5">
              <Sparkles className="w-4 h-4 text-[var(--color-secondary-600)]" />
              AI Mode
            </Label>
          </div>
          {isAIModeEnabled && (
            <p className="text-xs text-[var(--color-primary-900)] italic">
              Click the regenerate icon next to any field to update it
            </p>
          )}
        </div>
      </div>

      <div className="max-w-3xl mx-auto space-y-6">
        {/* Images Section */}
        <div>
          <Label className="text-base font-medium text-[var(--color-accent-700)] mb-3 block">
            Product Images
          </Label>

          <input
            type="file"
            id="imageUpload"
            multiple
            accept="image/*"
            onChange={onImageUpload}
            className="hidden"
          />

          {(images?.length || 0) > 0 ? (
            <div className="space-y-3">
              <div className="relative aspect-video rounded-lg overflow-hidden bg-gray-100 border-2 border-[var(--color-primary-200)] group cursor-pointer"
                   onClick={() => document.getElementById('imageUpload')?.click()}>
                <Image
                  src={images![selectedImageIndex]}
                  alt={`Product ${selectedImageIndex + 1}`}
                  fill
                  className="object-cover transition-all group-hover:blur-sm"
                />
                {/* Upload Overlay on Hover */}
                <div className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity flex flex-col items-center justify-center">
                  <Upload className="w-12 h-12 text-white mb-2" />
                  <p className="text-white font-medium">Upload More Photos</p>
                </div>
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    onRemoveImage(selectedImageIndex);
                  }}
                  className="absolute top-2 right-2 p-2 bg-red-500 text-white rounded-full hover:bg-red-600 transition-colors z-10"
                >
                  <Trash2 className="w-4 h-4" />
                </button>
              </div>

              <div className="flex gap-2 overflow-x-auto pb-2">
                {images!.map((img: string, idx: number) => (
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
            </div>
          ) : (
            <div
              className="border-2 border-dashed border-gray-300 rounded-lg p-12 text-center bg-[var(--color-primary-50)] cursor-pointer hover:border-[var(--color-secondary-500)] hover:bg-[var(--color-primary-100)] transition-all group"
              onClick={() => document.getElementById('imageUpload')?.click()}
            >
              <Upload className="w-16 h-16 mx-auto mb-4 text-[var(--color-primary-500)] group-hover:text-[var(--color-secondary-500)] transition-colors" />
              <p className="text-[var(--color-primary-900)] mb-2 font-medium">Click to Upload Photos</p>
              <p className="text-sm text-[var(--color-primary-700)]">or generate with AI</p>
            </div>
          )}
        </div>

        {/* Ownership Proof Section (Sell only) */}
        {listingType === 'sell' && (
          <div className="pt-6 border-t-2 border-[var(--color-primary-300)]">
            <Label className="text-base font-medium mb-3 block text-[var(--color-accent-700)]">
              Proof of Ownership
            </Label>

            <input
              type="file"
              id="ownershipProofUpload"
              accept="image/*"
              onChange={onOwnershipProofUpload}
              className="hidden"
            />

            {ownershipProofImage ? (
              <div className="space-y-3">
                <div
                  className="relative aspect-video rounded-lg overflow-hidden bg-gray-100 border-2 border-[var(--color-secondary-500)] cursor-pointer group"
                  onClick={() => document.getElementById('ownershipProofUpload')?.click()}
                >
                  <Image
                    src={ownershipProofImage}
                    alt="Ownership Proof"
                    fill
                    className="object-cover transition-all group-hover:blur-sm"
                  />
                  {/* Upload Overlay on Hover */}
                  <div className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity flex flex-col items-center justify-center">
                    <Upload className="w-12 h-12 text-white mb-2" />
                    <p className="text-white font-medium">Change Ownership Proof</p>
                  </div>
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      setFormData((prev) => ({ ...prev, ownershipProofImage: null }));
                    }}
                    className="absolute top-2 right-2 p-2 bg-red-500 text-white rounded-full hover:bg-red-600 transition-colors z-10"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                  {/* Always show verified badge */}
                  <div className="absolute bottom-2 left-2 px-3 py-1 rounded bg-[var(--color-secondary-500)] text-[var(--color-accent-700)] text-sm font-medium flex items-center gap-2">
                    <Check className="w-4 h-4" />
                    Ownership Verified
                  </div>
                </div>
              </div>
            ) : (
              <div
                className="border-2 border-dashed border-[var(--color-secondary-400)] rounded-lg p-12 text-center bg-[var(--color-secondary-50)] cursor-pointer hover:border-[var(--color-secondary-500)] hover:bg-[var(--color-secondary-100)] transition-all group"
                onClick={() => document.getElementById('ownershipProofUpload')?.click()}
              >
                <Upload className="w-16 h-16 mx-auto mb-4 text-[var(--color-secondary-500)] group-hover:text-[var(--color-secondary-600)] transition-colors" />
                <p className="text-base text-[var(--color-accent-700)] mb-1 font-medium">Click to Upload Ownership Proof</p>
                <p className="text-sm text-[var(--color-primary-700)]">Upload a photo showing the item with a handwritten note</p>
              </div>
            )}
          </div>
        )}

        {/* Title Section */}
        <div>
          <div className="flex justify-between items-center mb-2">
            <Label htmlFor="title" className="text-base font-medium text-[var(--color-accent-700)]">
              Title
            </Label>
            {isAIModeEnabled && (
              <button
                onClick={onGenerateTitle}
                disabled={isGeneratingTitle || !formData.generatedTitle}
                className="flex items-center gap-1.5 text-[var(--color-secondary-600)] hover:text-[var(--color-secondary-700)] disabled:opacity-50 disabled:cursor-not-allowed transition-colors text-sm font-medium"
              >
                {isGeneratingTitle ? (
                  <>
                    <Loader2 className="w-4 h-4 animate-spin" />
                    <span>Generating...</span>
                  </>
                ) : (
                  <>
                    <RotateCcw className="w-4 h-4" />
                    <span>Regenerate</span>
                  </>
                )}
              </button>
            )}
          </div>
          <div className="relative">
            <Input
              id="title"
              value={formData.generatedTitle}
              onChange={(e) => {
                setFormData((prev) => ({ ...prev, generatedTitle: e.target.value }));
                onTitleChange(e.target.value);
              }}
              onKeyDown={(e) => {
                if (e.key === 'Tab' && titleSuggestion) {
                  e.preventDefault();
                  setFormData((prev) => ({ ...prev, generatedTitle: prev.generatedTitle + titleSuggestion }));
                }
              }}
              placeholder="Enter product title"
              className="border-[var(--color-primary-200)] relative z-10"
              style={{
                fontSize: '1rem',
                lineHeight: '1.5rem',
                fontFamily: 'inherit',
                fontWeight: 'inherit',
                letterSpacing: 'inherit',
                background: 'transparent'
              }}
              maxLength={100}
            />
            <div
              className="absolute top-0 left-0 right-0 bottom-0 h-9 flex items-center px-3 py-1 pointer-events-none overflow-hidden border border-transparent rounded-md z-0"
              style={{
                fontSize: '1rem',
                lineHeight: '1.5rem',
                fontFamily: 'inherit',
                fontWeight: 'inherit',
                letterSpacing: 'inherit'
              }}
            >
              <span style={{ color: 'transparent' }}>
                {formData.generatedTitle}
              </span>
              <span className="text-gray-400">
                {titleSuggestion}
              </span>
            </div>
          </div>
          <p className="text-sm text-[var(--color-primary-900)] mt-2">
            {formData.generatedTitle?.length || 0}/100 characters
            {titleSuggestion && (
              <span className="ml-2 text-[var(--color-secondary-500)]">• Press Tab to accept suggestion</span>
            )}
          </p>
        </div>

        {/* Description Section */}
        <div>
          <div className="flex justify-between items-center mb-2">
            <Label htmlFor="description" className="text-base font-medium text-[var(--color-accent-700)]">
              Description
            </Label>
            {isAIModeEnabled && (
              <button
                onClick={onGenerateDescription}
                disabled={isGeneratingDescription || !formData.generatedDescription}
                className="flex items-center gap-1.5 text-[var(--color-secondary-600)] hover:text-[var(--color-secondary-700)] disabled:opacity-50 disabled:cursor-not-allowed transition-colors text-sm font-medium"
              >
                {isGeneratingDescription ? (
                  <>
                    <Loader2 className="w-4 h-4 animate-spin" />
                    <span>Generating...</span>
                  </>
                ) : (
                  <>
                    <RotateCcw className="w-4 h-4" />
                    <span>Regenerate</span>
                  </>
                )}
              </button>
            )}
          </div>
          <div className="relative">
            <Textarea
              id="description"
              value={formData.generatedDescription}
              onChange={(e) => {
                setFormData((prev) => ({ ...prev, generatedDescription: e.target.value }));
                onDescriptionChange(e.target.value);
              }}
              onKeyDown={(e) => {
                if (e.key === 'Tab' && descriptionSuggestion) {
                  e.preventDefault();
                  setFormData((prev) => ({ ...prev, generatedDescription: prev.generatedDescription + descriptionSuggestion }));
                }
              }}
              placeholder={listingType === 'buy' ? "Describe what you're looking for..." : "Describe your product..."}
              className="min-h-[250px] border-[var(--color-primary-200)] relative z-10"
              style={{
                fontSize: '1rem',
                lineHeight: '1.5rem',
                fontFamily: 'inherit',
                fontWeight: 'inherit',
                letterSpacing: 'inherit',
                background: 'transparent'
              }}
              maxLength={1000}
            />
            <div
              className="absolute top-0 left-0 right-0 bottom-0 px-3 py-2 pointer-events-none overflow-hidden whitespace-pre-wrap break-words border border-transparent rounded-md z-0"
              style={{
                fontSize: '1rem',
                lineHeight: '1.5rem',
                fontFamily: 'inherit',
                fontWeight: 'inherit',
                letterSpacing: 'inherit'
              }}
            >
              <span style={{ color: 'transparent' }}>
                {formData.generatedDescription}
              </span>
              <span className="text-gray-400">
                {descriptionSuggestion}
              </span>
            </div>
          </div>
          <p className="text-sm text-[var(--color-primary-900)] mt-2">
            {formData.generatedDescription?.length || 0}/1000 characters
            {descriptionSuggestion && (
              <span className="ml-2 text-[var(--color-secondary-500)]">• Press Tab to accept suggestion</span>
            )}
          </p>
        </div>

        {/* Tags Section */}
        <TagGenerator
          ref={tagGeneratorRef}
          tags={formData.tags || []}
          onTagsChange={(tags) => setFormData((prev) => ({ ...prev, tags }))}
          hasContent={!!(formData.generatedTitle || formData.generatedDescription || (images && images.length > 0))}
          isAIModeEnabled={isAIModeEnabled}
        />
      </div>
    </div>
  );
}
