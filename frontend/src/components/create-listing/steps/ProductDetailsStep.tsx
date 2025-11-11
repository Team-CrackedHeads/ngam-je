'use client';

import React, { useState } from 'react';
import Image from 'next/image';
import { Sparkles, Loader2, Upload, Trash2, Check, RotateCcw, Maximize2, Minimize2, ChevronDown, ChevronUp, Search, Wand2, X } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import TagGenerator, { TagGeneratorRef } from '@/components/create-listing/tag-generator';
import ParlantChat from '@/components/create-listing/ParlantChat';
import Masonry, { ResponsiveMasonry } from 'react-responsive-masonry';
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

  const [isChatExpanded, setIsChatExpanded] = useState(false);
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [showImageSearch, setShowImageSearch] = useState(false);
  const [imageSearchMode, setImageSearchMode] = useState<'search' | 'generate'>('search');
  const [searchQuery, setSearchQuery] = useState('');
  const [searchResults, setSearchResults] = useState<string[]>([]);
  const [selectedSearchImages, setSelectedSearchImages] = useState<string[]>([]);
  const [isSearching, setIsSearching] = useState(false);

  const handleImageSearch = async () => {
    if (!searchQuery.trim()) return;

    setIsSearching(true);
    try {
      const response = await fetch(`http://localhost:8000/api/v1/unsplash/search?query=${encodeURIComponent(searchQuery)}&per_page=9`);
      const data = await response.json();
      const newImages = data.images?.map((img: any) => img.url) || [];
      setSearchResults(prev => [...newImages, ...prev]);
    } catch (error) {
      console.error('Image search failed:', error);
    } finally {
      setIsSearching(false);
    }
  };

  const handleImageGenerate = async () => {
    if (!searchQuery.trim()) return;

    setIsSearching(true);
    try {
      const response = await fetch('http://localhost:8000/api/v1/generation/images', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ description: searchQuery, num_images: 6 })
      });
      const data = await response.json();
      const newImages = data.images || [];
      setSearchResults(prev => [...newImages, ...prev]);
    } catch (error) {
      console.error('Image generation failed:', error);
    } finally {
      setIsSearching(false);
    }
  };

  const toggleImageSelection = (url: string) => {
    setSelectedSearchImages(prev =>
      prev.includes(url)
        ? prev.filter(img => img !== url)
        : prev.length < 3 ? [...prev, url] : prev
    );
  };

  const handleAddSelectedImages = () => {
    if (listingType === 'buy') {
      setFormData(prev => ({
        ...prev,
        generatedImages: [...(prev.generatedImages || []), ...selectedSearchImages]
      }));
    } else {
      setFormData(prev => ({
        ...prev,
        uploadedImages: [...(prev.uploadedImages || []), ...selectedSearchImages]
      }));
    }
    setSelectedSearchImages([]);
    setSearchResults([]);
    setShowImageSearch(false);
    setSearchQuery('');
  };

  return (
    <div className="space-y-6">
      <div className="text-center mb-6">
        <h2 className="text-3xl font-bold mb-2 text-[var(--color-accent-700)]">Create Your Listing</h2>
        <p className="text-lg text-[var(--color-primary-900)]">Fill in details or let AI help you generate content</p>
      </div>

      {/* AI Action Bar */}
      <div className="flex items-center gap-4">
        <div className="inline-flex items-center gap-3 bg-white border border-gray-200 rounded-lg px-4 py-2.5">
          <Switch
            id="ai-mode"
            checked={isAIModeEnabled}
            onCheckedChange={(checked) => {
              setIsAIModeEnabled(checked);
              if (checked) {
                setIsChatExpanded(true);
              }
            }}
            className="data-[state=checked]:bg-[var(--color-secondary-500)]"
          />
          <Label htmlFor="ai-mode" className="text-sm font-medium text-[var(--color-accent-700)] cursor-pointer flex items-center gap-2">
            <Sparkles className="w-4 h-4 text-[var(--color-secondary-600)]" />
            AI Mode
          </Label>
        </div>
        {isAIModeEnabled && (
          <p className="text-xs text-gray-600 italic">
            Chat with AI assistant to create your listing
          </p>
        )}
      </div>

      {/* Collapsible AI Chat Interface */}
      {isAIModeEnabled && (
        <div className={`${isFullscreen ? 'fixed inset-0 z-50 bg-white' : 'relative'}`}>
          <div className={`bg-white border border-gray-200 rounded-lg shadow-lg overflow-hidden ${isFullscreen ? 'h-full' : ''}`}>
            {/* Chat Header */}
            <div className="flex items-center justify-between px-4 py-3 bg-gradient-to-r from-[var(--color-secondary-500)] to-[var(--color-secondary-600)] border-b">
              <div className="flex items-center gap-2">
                <Sparkles className="w-4 h-4 text-black" />
                <h3 className="text-sm font-semibold text-black">AI Listing Assistant</h3>
              </div>
              <div className="flex items-center gap-2">
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => setIsFullscreen(!isFullscreen)}
                  className="h-7 w-7 p-0 hover:bg-black/10"
                >
                  {isFullscreen ? (
                    <Minimize2 className="w-4 h-4 text-black" />
                  ) : (
                    <Maximize2 className="w-4 h-4 text-black" />
                  )}
                </Button>
                {!isFullscreen && (
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => setIsChatExpanded(!isChatExpanded)}
                    className="h-7 w-7 p-0 hover:bg-black/10"
                  >
                    {isChatExpanded ? (
                      <ChevronUp className="w-4 h-4 text-black" />
                    ) : (
                      <ChevronDown className="w-4 h-4 text-black" />
                    )}
                  </Button>
                )}
              </div>
            </div>

            {/* Chat Content */}
            {(isChatExpanded || isFullscreen) && (
              <div className={isFullscreen ? 'h-[calc(100vh-57px)]' : 'h-[400px]'}>
                <ParlantChat
                  listingType={listingType}
                  onFieldUpdate={(field, value) => {
                    console.log(`📝 Updating field "${field}" with value:`, value);

                    // Map field names to form data structure
                    switch (field) {
                      case 'title':
                        setFormData((prev) => ({ ...prev, generatedTitle: value }));
                        break;
                      case 'description':
                        setFormData((prev) => ({ ...prev, generatedDescription: value }));
                        break;
                      case 'images':
                        if (listingType === 'buy') {
                          setFormData((prev) => ({ ...prev, generatedImages: value }));
                        } else {
                          setFormData((prev) => ({ ...prev, uploadedImages: value }));
                        }
                        break;
                      case 'tags':
                        setFormData((prev) => ({ ...prev, tags: value }));
                        break;
                      default:
                        console.warn(`Unknown field: ${field}`);
                    }
                  }}
                  onComplete={(data) => {
                    console.log('Listing data gathered:', data);
                  }}
                />
              </div>
            )}
          </div>
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
      <div className="max-w-3xl mx-auto space-y-6">
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

        {/* Images Section */}
        <div>
          <div className="flex items-center justify-between mb-3">
            <Label className="text-base font-medium text-[var(--color-accent-700)]">
              Product Images
            </Label>
            {isAIModeEnabled && (
              <div className="flex gap-4">
                <button
                  onClick={() => {
                    setImageSearchMode('search');
                    setShowImageSearch(true);
                  }}
                  className="flex items-center gap-1.5 text-[var(--color-secondary-600)] hover:text-[var(--color-secondary-700)] transition-colors text-sm font-medium"
                >
                  <Search className="w-4 h-4" />
                  <span>Search</span>
                </button>
                {listingType === 'buy' && (
                  <button
                    onClick={() => {
                      setImageSearchMode('generate');
                      setShowImageSearch(true);
                    }}
                    className="flex items-center gap-1.5 text-[var(--color-secondary-600)] hover:text-[var(--color-secondary-700)] transition-colors text-sm font-medium"
                  >
                    <Wand2 className="w-4 h-4" />
                    Generate
                  </button>
                )}
              </div>
            )}
          </div>

          {/* Image Search/Generate Dropdown Modal */}
          {showImageSearch && (
            <div className="mb-4 bg-white border border-[var(--color-secondary-300)] rounded-lg shadow-lg p-4 space-y-4">
              <div className="flex items-center justify-between">
                <h3 className="text-sm font-semibold text-[var(--color-accent-700)] flex items-center gap-2">
                  {imageSearchMode === 'search' ? (
                    <>
                      <Search className="w-4 h-4 text-[var(--color-secondary-600)]" />
                      Search Images
                    </>
                  ) : (
                    <>
                      <Wand2 className="w-4 h-4 text-[var(--color-secondary-600)]" />
                      Generate Images with AI
                    </>
                  )}
                </h3>
                <button
                  onClick={() => {
                    setShowImageSearch(false);
                    setSearchResults([]);
                    setSelectedSearchImages([]);
                    setSearchQuery('');
                  }}
                  className="text-gray-400 hover:text-gray-600"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>

              <div className="flex gap-2">
                <Input
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  onKeyPress={(e) => e.key === 'Enter' && (imageSearchMode === 'search' ? handleImageSearch() : handleImageGenerate())}
                  placeholder={imageSearchMode === 'search' ? 'Search for images...' : 'Describe what to generate...'}
                  className="flex-1"
                />
                <Button
                  onClick={imageSearchMode === 'search' ? handleImageSearch : handleImageGenerate}
                  disabled={isSearching || !searchQuery.trim()}
                  className="bg-[var(--color-secondary-500)] hover:bg-[var(--color-secondary-600)] text-black"
                >
                  {isSearching ? (
                    <Loader2 className="w-4 h-4 animate-spin" />
                  ) : imageSearchMode === 'search' ? (
                    <Search className="w-4 h-4" />
                  ) : (
                    <Wand2 className="w-4 h-4" />
                  )}
                </Button>
              </div>

              {/* Masonry Grid for Results */}
              {searchResults.length > 0 && (
                <div className="space-y-3">
                  <p className="text-xs text-gray-600">
                    Select up to 3 images ({selectedSearchImages.length}/3 selected)
                  </p>
                  <div className="overflow-y-auto" style={{ maxHeight: '60vh' }}>
                    <ResponsiveMasonry columnsCountBreakPoints={{ 350: 2, 768: 3 }}>
                      <Masonry gutter="16px">
                        {searchResults.map((url, idx) => (
                          <div
                            key={idx}
                            onClick={() => toggleImageSelection(url)}
                            className={`relative rounded-lg overflow-hidden cursor-pointer border-2 transition-all ${selectedSearchImages.includes(url)
                                ? 'border-[var(--color-secondary-500)] ring-2 ring-[var(--color-secondary-500)] ring-offset-2'
                                : 'border-gray-200 hover:border-[var(--color-secondary-500)]'
                              }`}
                          >
                            <img
                              src={url}
                              alt={`Result ${idx + 1}`}
                              className="w-full h-auto object-cover"
                            />
                            {selectedSearchImages.includes(url) && (
                              <div className="absolute inset-0 bg-black/40 flex items-center justify-center">
                                <div className="w-8 h-8 rounded-full bg-[var(--color-secondary-500)] flex items-center justify-center">
                                  <Check className="w-5 h-5 text-black" />
                                </div>
                              </div>
                            )}
                          </div>
                        ))}
                      </Masonry>
                    </ResponsiveMasonry>
                  </div>
                  <Button
                    onClick={handleAddSelectedImages}
                    disabled={selectedSearchImages.length === 0}
                    className="w-full bg-[var(--color-secondary-500)] hover:bg-[var(--color-secondary-600)] text-black"
                  >
                    Add {selectedSearchImages.length} Selected Image{selectedSearchImages.length !== 1 ? 's' : ''}
                  </Button>
                </div>
              )}
            </div>
          )}

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
                    className={`relative flex-shrink-0 w-20 h-20 rounded-lg overflow-hidden border-2 transition-all ${selectedImageIndex === idx
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
              <p className="text-sm text-[var(--color-primary-700)]">{isAIModeEnabled ? 'or generate with AI' : 'or drop images here'}</p>
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
