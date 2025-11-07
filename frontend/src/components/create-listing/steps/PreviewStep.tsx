'use client';

import React, { useEffect } from 'react';
import Image from 'next/image';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import {
  Search,
  DollarSign,
  Truck,
  MapPin,
  MessageCircle,
  Tag,
  Image as ImageIcon,
  Edit3,
} from 'lucide-react';
import type { LucideIcon } from 'lucide-react';
import { PartialFormData, FAQ } from '@/types/listing-form';
import { useMemo } from 'react';

interface PreviewStepProps {
  listingType: 'buy' | 'sell';
  formData: PartialFormData;
  selectedImageIndex: number;
  setSelectedImageIndex: (index: number) => void;
  onEditStep: (step: number) => void;
  ownershipVerified?: boolean | null;
}

const formatCurrency = (value: number) =>
  Number.isFinite(value)
    ? value.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })
    : '0.00';

export default function PreviewStep({
  listingType,
  formData,
  selectedImageIndex,
  setSelectedImageIndex,
  onEditStep,
  ownershipVerified,
}: PreviewStepProps) {
  const isBuyFlow = listingType === 'buy';
  const images: string[] = useMemo(() =>
    isBuyFlow ? formData.generatedImages || [] : formData.uploadedImages || []
  , [isBuyFlow, formData.generatedImages, formData.uploadedImages]);

  useEffect(() => {
    if (images.length === 0) {
      if (selectedImageIndex !== 0) {
        setSelectedImageIndex(0);
      }
      return;
    }

    if (selectedImageIndex > images.length - 1) {
      setSelectedImageIndex(images.length - 1);
    }
  }, [images, selectedImageIndex, setSelectedImageIndex]);

  const activeImage = images.length > 0 ? images[Math.min(selectedImageIndex, images.length - 1)] : null;
  const currency = formData.currency || 'MYR';
  const title = formData.generatedTitle || 'Untitled listing';
  const description = (formData.generatedDescription as string | undefined) || '';
  const tags: string[] = Array.isArray(formData.tags) ? formData.tags : [];
  const shippingOptions: string[] = Array.isArray(formData.shippingOptions) ? formData.shippingOptions : [];
  const faqs: FAQ[] = Array.isArray(formData.faqs) ? formData.faqs : [];

  const minPrice = parseFloat(formData.minPrice || '');
  const maxPrice = parseFloat(formData.maxPrice || '');
  const minPriceValid = Number.isFinite(minPrice);
  const maxPriceValid = Number.isFinite(maxPrice);

  const quantityValue = isBuyFlow
    ? parseInt(formData.quantity || '0', 10)
    : parseInt(formData.inventoryQuantity || '0', 10);
  const hasQuantity = Number.isFinite(quantityValue) && quantityValue > 0;

  const totalBudgetMin = minPriceValid && hasQuantity ? minPrice * quantityValue : null;
  const totalBudgetMax = maxPriceValid && hasQuantity ? maxPrice * quantityValue : null;

  const SectionCard: React.FC<{
    title: string;
    icon: LucideIcon;
    actionStep?: number;
    actionLabel?: string;
    children: React.ReactNode;
    description?: string;
  }> = ({ title, icon: Icon, actionStep, actionLabel = 'Edit', description, children }) => (
    <Card className="border border-[var(--color-primary-200)] bg-white shadow-sm rounded-xl py-0 gap-0">
      <CardHeader className="px-3 pt-3 pb-0 border-b border-[var(--color-primary-200)] gap-0 sm:px-5 sm:pt-5 sm:pb-0">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
          <div className="flex items-center gap-2">
            <span className="inline-flex h-10 w-10 items-center justify-center rounded-lg bg-[var(--color-secondary-500)]/10 text-[var(--color-secondary-600)]">
              <Icon className="w-5 h-5" />
            </span>
            <div>
              <CardTitle className="text-lg font-semibold text-[var(--color-accent-700)]">{title}</CardTitle>
              {description && (
                <CardDescription className="text-sm text-[var(--color-primary-800)]">{description}</CardDescription>
              )}
            </div>
          </div>
          {actionStep && (
            <div className="inline-flex items-center rounded-xl bg-white px-1.5 py-1">
              <Button
                type="button"
                size="sm"
                variant="ghost"
                className="h-8 px-3 text-xs rounded-lg transition-colors text-[var(--color-secondary-700)] hover:bg-[var(--color-secondary-100)] hover:text-[var(--color-secondary-800)]"
                onClick={() => onEditStep(actionStep)}
              >
                <Edit3 className="w-4 h-4 mr-1" />
                <span>{actionLabel}</span>
              </Button>
            </div>
          )}
        </div>
      </CardHeader>
      <CardContent className="px-4 pb-4 pt-3 sm:px-5 sm:pb-5 sm:pt-3 space-y-4">{children}</CardContent>
    </Card>
  );

  const EmptyState: React.FC<{ message: string; step?: number; ctaLabel?: string }> = ({ message, step, ctaLabel }) => (
    <div className="flex flex-wrap items-center justify-between gap-3 rounded-lg border border-dashed border-[var(--color-primary-200)] bg-[var(--color-primary-50)] px-4 py-3">
      <p className="text-sm text-[var(--color-primary-800)]">{message}</p>
      {step && (
        <Button variant="outline" size="sm" onClick={() => onEditStep(step)}>
          {ctaLabel ?? 'Add now'}
        </Button>
      )}
    </div>
  );

  return (
    <div className="space-y-6">
      <div className="text-center mb-8">
        <h2 className="text-3xl font-bold mb-2 text-[var(--color-accent-700)]">Review Your Listing</h2>
        <p className="text-lg text-[var(--color-primary-900)]">Double-check each section before you publish.</p>
      </div>

      <div className="max-w-4xl mx-auto space-y-5">
        <SectionCard
          title="Listing Overview"
          icon={isBuyFlow ? Search : DollarSign}
          actionStep={2}
          actionLabel="Edit overview"
          description={isBuyFlow ? 'Essential details buyers will see first' : 'Key selling points at a glance'}
        >
          <div className="space-y-4">
            <div>
              <p className="text-xs font-semibold uppercase tracking-wide text-[var(--color-primary-700)]">Title</p>
              <p className="text-lg sm:text-xl font-semibold text-[var(--color-accent-700)]">{title}</p>
            </div>
            <div className="flex flex-wrap gap-2">
              <span className="px-3 py-1 rounded-full bg-[var(--color-secondary-500)]/20 text-[var(--color-secondary-700)] text-xs font-semibold uppercase tracking-wide">
                {isBuyFlow ? 'Looking to Buy' : 'For Sale'}
              </span>
              {hasQuantity && (
                <span className="px-3 py-1 rounded-full border border-[var(--color-secondary-400)] text-[var(--color-accent-700)] text-xs font-medium">
                  {quantityValue} {quantityValue === 1 ? 'unit' : 'units'}
                </span>
              )}
            </div>
            {description ? (
              <p className="text-sm text-[var(--color-primary-800)] line-clamp-3">{description}</p>
            ) : (
              <EmptyState message="You haven’t added a description yet." step={2} ctaLabel="Add description" />
            )}
          </div>
        </SectionCard>

        <SectionCard
          title={isBuyFlow ? 'Reference Photos' : 'Product Photos'}
          icon={ImageIcon}
          actionStep={2}
          actionLabel="Manage photos"
          description="Make a strong visual impression"
        >
          {isBuyFlow ? (
            images.length > 0 ? (
              <div className="space-y-4">
                <div className="relative aspect-video rounded-lg overflow-hidden border-2 bg-[var(--color-primary-200)] border-[var(--color-secondary-500)]">
                  <Image src={activeImage ?? images[0]} alt="Listing preview" fill sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 896px" className="object-cover" />
                </div>
                {images.length > 1 && (
                  <div className="flex gap-2 overflow-x-auto">
                    {images.map((img, idx) => (
                      <button
                        key={img + idx}
                        type="button"
                        onClick={() => setSelectedImageIndex(idx)}
                        className={`relative flex-shrink-0 w-16 h-16 rounded-lg overflow-hidden border-2 transition-all ${selectedImageIndex === idx
                          ? 'border-[var(--color-secondary-500)] scale-100'
                          : 'border-transparent opacity-70 hover:opacity-100'
                          }`}
                      >
                        <Image src={img} alt={`Generated option ${idx + 1}`} fill sizes="64px" className="object-cover" />
                      </button>
                    ))}
                  </div>
                )}
              </div>
            ) : (
              <EmptyState message="No AI photos generated yet." step={2} ctaLabel="Generate photos" />
            )
          ) : images.length > 0 ? (
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 sm:gap-3">
              {images.map((image, index) => (
                <div
                  key={image + index}
                  className="relative aspect-square rounded-lg overflow-hidden bg-gray-100 border border-[var(--color-primary-200)]"
                >
                  <Image src={image} alt={`Product ${index + 1}`} fill sizes="(max-width: 640px) 50vw, 200px" className="object-cover" />
                  {index === 0 && (
                    <div className="absolute bottom-1 left-1 text-xs px-2 py-1 rounded bg-[var(--color-secondary-500)] text-[var(--color-accent-700)]">
                      Cover
                    </div>
                  )}
                </div>
              ))}
            </div>
          ) : (
            <EmptyState message="No product photos uploaded yet." step={2} ctaLabel="Add photos" />
          )}
        </SectionCard>

        {!isBuyFlow && (
          <SectionCard
            title="Proof of Ownership"
            icon={ImageIcon}
            actionStep={2}
            actionLabel="Update proof"
            description="Build trust with verified photos"
          >
            {formData.ownershipProofImage ? (
              <div className="space-y-3">
                <div className="relative max-w-md aspect-video rounded-lg overflow-hidden bg-gray-100 border-2 border-[var(--color-secondary-500)]">
                  <Image src={formData.ownershipProofImage} alt="Ownership proof" fill sizes="(max-width: 768px) 100vw, 448px" className="object-cover" />
                  {ownershipVerified !== undefined && ownershipVerified !== null && (
                    <div
                      className={`absolute bottom-2 left-2 text-xs sm:text-sm px-2 sm:px-3 py-1 rounded font-medium ${ownershipVerified
                        ? 'bg-[var(--color-secondary-500)] text-[var(--color-accent-700)]'
                        : 'bg-red-500 text-white'
                        }`}
                    >
                      {ownershipVerified ? 'Ownership verified' : 'Ownership not verified'}
                    </div>
                  )}
                </div>
                <p className="text-xs sm:text-sm text-[var(--color-primary-700)]">
                  {ownershipVerified
                    ? 'This photo verifies your ownership of the item.'
                    : 'AI could not verify ownership, but the photo will still appear in your listing.'}
                </p>
              </div>
            ) : (
              <EmptyState message="Upload a proof of ownership to build trust." step={2} ctaLabel="Upload proof" />
            )}
          </SectionCard>
        )}

        <SectionCard
          title="Description"
          icon={Edit3}
          actionStep={2}
          actionLabel="Edit description"
          description="Tell the full story of your listing"
        >
          {description ? (
            <div className="rounded-lg p-4 border bg-white border-[var(--color-primary-200)] whitespace-pre-wrap leading-relaxed text-[var(--color-primary-900)]">
              {description}
            </div>
          ) : (
            <EmptyState message="Tell buyers more about what you’re offering." step={2} ctaLabel="Add description" />
          )}
        </SectionCard>

        <SectionCard
          title="Category Tags"
          icon={Tag}
          actionStep={2}
          actionLabel="Manage tags"
          description="Help buyers discover your listing"
        >
          {tags.length > 0 ? (
            <div className="flex flex-wrap gap-2">
              {tags.map((tag, index) => (
                <div
                  key={`${tag}-${index}`}
                  className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-[var(--color-secondary-500)] text-[var(--color-accent-700)] border-2 border-[var(--color-secondary-600)] text-sm font-medium"
                >
                  <Tag className="w-3 h-3" />
                  {tag}
                </div>
              ))}
            </div>
          ) : (
            <EmptyState message="Add tags so your listing shows up in relevant searches." step={2} ctaLabel="Add tags" />
          )}
        </SectionCard>

        <SectionCard
          title={isBuyFlow ? 'Budget Range' : 'Price Range'}
          icon={DollarSign}
          actionStep={3}
          actionLabel="Edit pricing"
          description="Review the numbers before publishing"
        >
          {minPriceValid || maxPriceValid ? (
            <div className="space-y-4">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="text-center">
                  <p className="text-xs font-medium uppercase tracking-wide text-[var(--color-primary-900)]">Min per Unit</p>
                  <div className="bg-white rounded-lg p-3 border border-[var(--color-secondary-500)] text-xl font-bold text-[var(--color-accent-700)]">
                    {currency} {formatCurrency(minPrice)}
                  </div>
                </div>
                <div className="text-center">
                  <p className="text-xs font-medium uppercase tracking-wide text-[var(--color-primary-900)]">Max per Unit</p>
                  <div className="bg-white rounded-lg p-3 border border-[var(--color-secondary-500)] text-xl font-bold text-[var(--color-accent-700)]">
                    {currency} {formatCurrency(maxPrice)}
                  </div>
                </div>
              </div>

              {hasQuantity && (
                <div className="border-t pt-3 border-[var(--color-secondary-500)] space-y-2">
                  <p className="text-sm font-medium text-[var(--color-primary-900)]">
                    {isBuyFlow ? 'Quantity requested:' : 'Inventory available:'}{' '}
                    <span className="font-bold text-[var(--color-accent-700)]">
                      {quantityValue} {quantityValue === 1 ? 'unit' : 'units'}
                    </span>
                  </p>

                  {(totalBudgetMin !== null || totalBudgetMax !== null) && (
                    <div className="bg-white rounded-lg p-4 border-2 border-[var(--color-secondary-500)]">
                      <p className="text-xs font-medium uppercase tracking-wide text-[var(--color-primary-900)]">
                        {isBuyFlow ? 'Total Budget' : 'Potential Revenue'}
                      </p>
                      <p className="text-2xl font-bold text-[var(--color-accent-700)]">
                        {currency}{' '}
                        {totalBudgetMin !== null ? formatCurrency(totalBudgetMin) : formatCurrency(totalBudgetMax || 0)}
                        {totalBudgetMax !== null && totalBudgetMax !== totalBudgetMin
                          ? ` - ${currency} ${formatCurrency(totalBudgetMax)}`
                          : ''}
                      </p>
                    </div>
                  )}
                </div>
              )}
            </div>
          ) : (
            <EmptyState message="Set a price range so we can match you with the right deals." step={3} ctaLabel="Add pricing" />
          )}
        </SectionCard>

        <SectionCard
          title="Preferred Location"
          icon={MapPin}
          actionStep={3}
          actionLabel="Edit location"
          description="Show buyers where you’re based"
        >
          {formData.location ? (
            <div className="flex flex-wrap gap-3">
              <div className="px-4 py-2 rounded-lg text-sm font-medium border-2 shadow-sm bg-white border-[var(--color-secondary-500)] text-[var(--color-accent-700)]">
                {formData.location}
              </div>
            </div>
          ) : (
            <EmptyState message="Let buyers know where you’re based or willing to meet." step={3} ctaLabel="Add location" />
          )}
        </SectionCard>

        <SectionCard
          title={isBuyFlow ? 'Accepted Shipping Methods' : 'Available Shipping Methods'}
          icon={Truck}
          actionStep={3}
          actionLabel="Update shipping"
          description="Clarify how the item will be delivered"
        >
          {shippingOptions.length > 0 ? (
            <div className="flex flex-wrap gap-3">
              {shippingOptions.map((option) => (
                <div
                  key={option}
                  className="px-4 py-2 rounded-lg text-sm font-medium border-2 shadow-sm bg-white border-[var(--color-secondary-500)] text-[var(--color-accent-700)]"
                >
                  {option}
                </div>
              ))}
            </div>
          ) : (
            <EmptyState message="Select how you’d like to handle delivery." step={3} ctaLabel="Add shipping" />
          )}
        </SectionCard>

        <SectionCard
          title="Frequently Asked Questions"
          icon={MessageCircle}
          actionStep={4}
          actionLabel="Edit FAQs"
          description="Answer common buyer questions in advance"
        >
          {faqs.length > 0 ? (
            <div className="space-y-3">
              {faqs.map((faq, index) => (
                <Card
                  key={faq.id ?? index}
                  className="border border-[var(--color-primary-300)] rounded-xl flex flex-col gap-0 py-0"
                >
                  <CardContent className="px-4 py-0">
                    <div className="flex gap-3 py-4">
                      <div className="flex-shrink-0 w-6 h-6 rounded-full bg-[var(--color-secondary-500)] text-white flex items-center justify-center font-bold text-xs">
                        {index + 1}
                      </div>
                      <div className="flex-1 space-y-2">
                        <p className="font-semibold text-[var(--color-accent-700)]">{faq.question}</p>
                        <p className="text-sm text-[var(--color-primary-900)] leading-relaxed">{faq.answer}</p>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          ) : (
            <EmptyState message="Answer common questions to reduce back-and-forth." step={4} ctaLabel="Add FAQs" />
          )}
        </SectionCard>
      </div>
    </div>
  );
}
