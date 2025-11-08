"use client";

import React, { useState, useRef, useCallback } from "react";
import Image from "next/image";
import { useRouter } from "next/navigation";
import {
  Info,
  DollarSign,
  Eye,
  Check,
  ChevronLeft,
  ChevronRight,
  X,
  MessageCircle,
  ShoppingCart,
  Package,
  ListPlus,
  Sparkles,
  Upload,
  Trash2,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  MOCK_FAQ_BUY,
  MOCK_FAQ_SELL,
  MOCK_GENERATED_TITLE_BUY,
  MOCK_GENERATED_DESCRIPTION_BUY,
  // MOCK_GENERATED_IMAGES_BUY,
  MOCK_GENERATED_TITLE_SELL,
  MOCK_GENERATED_DESCRIPTION_SELL,
  // MOCK_GENERATED_IMAGES_SELL,
  // MOCK_PRICE_HISTORY,
  MOCK_LOCATION,
} from "@/utils/mock-all-data-used";
import { TagGeneratorRef } from "@/components/create-listing/tag-generator";
import { verifyOwnershipProofWithAI } from "@/components/create-listing/ai-photo";
import {
  addNewListing,
  generateListingId,
  convertFormToListing,
} from "@/utils/listing-storage";
import type { PartialFormData } from "@/types/listing-form";
import type { BuyFormData, SellFormData } from "@/types/listing-form";
import ProductDetailsStep from "./steps/ProductDetailsStep";
import PricingShippingStep from "./steps/PricingShippingStep";
import FAQsStep from "./steps/FAQsStep";
import PreviewStep from "./steps/PreviewStep";
import axios, { AxiosError } from "axios";

interface CreateListingModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmitBuy?: (data: BuyFormData) => void;
  onSubmitSell?: (data: SellFormData) => void;
  category?: string; // Thread category where listing is being created
}

type ListingType = null | "buy" | "sell";

export default function CreateListingModal({
  isOpen,
  onClose,
  onSubmitBuy,
  onSubmitSell,
  category,
}: CreateListingModalProps) {
  const router = useRouter();
  const [currentStep, setCurrentStep] = useState(1);
  const [listingType, setListingType] = useState<ListingType>(null);

  // Common states
  const [isGeneratingTitle, setIsGeneratingTitle] = useState(false);
  const [isGeneratingDescription, setIsGeneratingDescription] = useState(false);
  const [isGeneratingPhotos, setIsGeneratingPhotos] = useState(false);
  const [selectedImageIndex, setSelectedImageIndex] = useState(0);
  const [isAIModeEnabled, setIsAIModeEnabled] = useState(false);
  const [isGeneratingAll, setIsGeneratingAll] = useState(false);

  // AI Context Gathering states
  const [aiContextGathered, setAiContextGathered] = useState(false);
  const [userInput, setUserInput] = useState("");
  const [contextImages, setContextImages] = useState<string[]>([]);
  const [titleSuggestion, setTitleSuggestion] = useState("");
  const [descriptionSuggestion, setDescriptionSuggestion] = useState("");
  const titleTimeoutRef = useRef<NodeJS.Timeout | null>(null);
  const descriptionTimeoutRef = useRef<NodeJS.Timeout | null>(null);
  const tagGeneratorRef = useRef<TagGeneratorRef | null>(null);
  const [showLocationDropdown, setShowLocationDropdown] = useState(false);
  const [filteredLocations, setFilteredLocations] =
    useState<string[]>(MOCK_LOCATION);
  const [selectedLocationIndex, setSelectedLocationIndex] = useState(-1);
  const [showCurrencyDropdown, setShowCurrencyDropdown] = useState(false);
  const [filteredCurrencies, setFilteredCurrencies] = useState<string[]>([
    "MYR",
    "USD",
    "SGD",
  ]);
  const [selectedCurrencyIndex, setSelectedCurrencyIndex] = useState(-1);

  // Sell-specific states
  const [isVerifyingOwnership, setIsVerifyingOwnership] = useState(false);
  const [ownershipVerified, setOwnershipVerified] = useState<boolean | null>(
    null
  );

  // Buy form data
  const [buyFormData, setBuyFormData] = useState<BuyFormData>({
    generatedTitle: "",
    generatedDescription: "",
    generatedImages: [],
    minPrice: "",
    maxPrice: "",
    currency: "MYR",
    location: "",
    quantity: "1",
    shippingOptions: [],
    faqs: [],
    tags: [],
  });

  // Sell form data
  const [sellFormData, setSellFormData] = useState<SellFormData>({
    uploadedImages: [],
    ownershipProofImage: null,
    generatedTitle: "",
    generatedDescription: "",
    minPrice: "",
    maxPrice: "",
    currency: "MYR",
    location: "",
    shippingOptions: [],
    inventoryQuantity: "",
    tags: [],
    faqs: [],
  });

  const [recommendedPriceRange, setRecommendedPriceRange] = useState({
    min: 0,
    max: 0,
    average: 0,
  });

  // Wrapper function to handle setState properly for both types
  const setFormData = useCallback(
    (update: React.SetStateAction<PartialFormData>) => {
      if (listingType === "buy") {
        setBuyFormData(update as React.SetStateAction<BuyFormData>);
      } else {
        setSellFormData(update as React.SetStateAction<SellFormData>);
      }
    },
    [listingType]
  );

  const steps =
    listingType === null
      ? [{ number: 1, label: "Choose Type", icon: ListPlus }]
      : [
          { number: 1, label: "Choose Type", icon: ListPlus },
          { number: 2, label: "Product Details", icon: Info },
          { number: 3, label: "Pricing & Shipping", icon: DollarSign },
          { number: 4, label: "FAQs", icon: MessageCircle },
          { number: 5, label: "Preview", icon: Eye },
        ];

  const handleBuySelect = () => {
    setListingType("buy");
    setCurrentStep(2);
  };

  const handleSellSelect = () => {
    setListingType("sell");
    setCurrentStep(2);
  };

  const hasAnyInput = () => {
    if (listingType === "buy") {
      return (
        buyFormData.generatedTitle.length > 0 ||
        buyFormData.generatedDescription.length > 0 ||
        buyFormData.generatedImages.length > 0
      );
    } else if (listingType === "sell") {
      return (
        sellFormData.generatedTitle.length > 0 ||
        sellFormData.generatedDescription.length > 0 ||
        sellFormData.uploadedImages.length > 0
      );
    }
    return false;
  };

  // AI Generation functions
  const getProductDataFromAI = async () => {
    if (!listingType) return;
    setIsGeneratingAll(true);

    try {
      const productName =
        listingType === "buy"
          ? buyFormData.generatedTitle || "Untitled Product"
          : sellFormData.generatedTitle || "Untitled Product";

      const response = await axios.post(
        `${process.env.NEXT_PUBLIC_API_URL}/api/v1/ai/product_details`,
        {
          product_name: productName,
        }
      );

      return response.data;
    } catch (error) {
      console.error("Error generating product details: ", error);
      alert("Failed to generate product details.");
      return null;
    } finally {
      setIsGeneratingAll(false);
    }
  };

  const generateTitleWithAI = async () => {
    setIsGeneratingTitle(true);
    // await new Promise((resolve) => setTimeout(resolve, 1500));
    const productData = await getProductDataFromAI();

    if (productData && listingType === "buy") {
      setBuyFormData((prev) => ({
        ...prev,
        generatedTitle: productData.title,
      }));
    } else if (productData) {
      setSellFormData((prev) => ({
        ...prev,
        generatedTitle: productData.title,
      }));
    }

    setIsGeneratingTitle(false);
  };

  const generateDescriptionWithAI = async () => {
    setIsGeneratingDescription(true);
    // await new Promise((resolve) => setTimeout(resolve, 2000));
    const productData = await getProductDataFromAI();

    if (productData && listingType === "buy") {
      setBuyFormData((prev) => ({
        ...prev,
        generatedDescription: productData.description,
      }));
    } else if (productData) {
      setSellFormData((prev) => ({
        ...prev,
        generatedDescription: productData.description,
      }));
    }

    setIsGeneratingDescription(false);
  };

  const generatePhotosWithAI = async () => {
    setIsGeneratingPhotos(true);
    // await new Promise((resolve) => setTimeout(resolve, 2000));
    const productData = await getProductDataFromAI();

    if (productData && listingType === "buy") {
      setBuyFormData((prev) => ({
        ...prev,
        generatedImages: [
          ...prev.generatedImages,
          ...productData.images, // Spread the array, don't wrap it
        ],
      }));
    } else if (productData) {
      setSellFormData((prev) => ({
        ...prev,
        uploadedImages: [...prev.uploadedImages, ...productData.images],
      }));
    }

    setIsGeneratingPhotos(false);
  };

  const generateAllWithAI = async () => {
    if (!listingType) return;
    setIsGeneratingAll(true);

    try {
      // const productName =
      //   listingType === "buy"
      //     ? buyFormData.generatedTitle || "Untitled Product"
      //     : sellFormData.generatedTitle || "Untitled Product";

      const productData = await getProductDataFromAI();
      console.log("AI product details:", productData);

      // Backend returns: { title, description, images: [], tags: [] }

      if (!productData) {
        return; // Error already handled in getProductDataFromAI
      }

      if (listingType === "buy") {
        setBuyFormData((prev) => ({
          ...prev,
          generatedTitle: productData.title || prev.generatedTitle,
          generatedDescription: productData.description || prev.generatedDescription,
          generatedImages: productData.images || [],
          tags: productData.tags || [],
        }));
      } else {
        setSellFormData((prev) => ({
          ...prev,
          generatedTitle: productData.title || prev.generatedTitle,
          generatedDescription: productData.description || prev.generatedDescription,
          uploadedImages: productData.images || [],
          tags: productData.tags || [],
        }));
      }

      // await tagGeneratorRef.current?.generateTags();
    } catch (error) {
      console.error("Error generating product details:", error);
      alert("Failed to generate product details.");
    } finally {
      setIsGeneratingAll(false);
    }
  };

  const generateTitleSuggestion = useCallback(
    (currentText: string) => {
      if (titleTimeoutRef.current) {
        clearTimeout(titleTimeoutRef.current);
      }

      if (!isAIModeEnabled || currentText.length < 3) {
        setTitleSuggestion("");
        return;
      }

      titleTimeoutRef.current = setTimeout(() => {
        const fullSuggestion =
          listingType === "buy"
            ? MOCK_GENERATED_TITLE_BUY
            : MOCK_GENERATED_TITLE_SELL;
        const lowerCurrent = currentText.toLowerCase();
        const lowerSuggestion = fullSuggestion.toLowerCase();

        if (lowerSuggestion.startsWith(lowerCurrent)) {
          setTitleSuggestion(fullSuggestion.slice(currentText.length));
        } else {
          setTitleSuggestion("");
        }
      }, 300);
    },
    [isAIModeEnabled, listingType]
  );

  const generateDescriptionSuggestion = useCallback(
    (currentText: string) => {
      if (descriptionTimeoutRef.current) {
        clearTimeout(descriptionTimeoutRef.current);
      }

      if (!isAIModeEnabled || currentText.length < 3) {
        setDescriptionSuggestion("");
        return;
      }

      descriptionTimeoutRef.current = setTimeout(() => {
        const fullSuggestion =
          listingType === "buy"
            ? MOCK_GENERATED_DESCRIPTION_BUY
            : MOCK_GENERATED_DESCRIPTION_SELL;
        const lowerCurrent = currentText.toLowerCase();
        const lowerSuggestion = fullSuggestion.toLowerCase();

        if (lowerSuggestion.startsWith(lowerCurrent)) {
          setDescriptionSuggestion(fullSuggestion.slice(currentText.length));
        } else {
          setDescriptionSuggestion("");
        }
      }, 300);
    },
    [isAIModeEnabled, listingType]
  );

  // Image handling
  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (files) {
      if (listingType === "buy") {
        const newImages: string[] = [];
        Array.from(files).forEach((file) => {
          const reader = new FileReader();
          reader.onloadend = () => {
            newImages.push(reader.result as string);
            if (newImages.length === files.length) {
              setBuyFormData((prev) => ({
                ...prev,
                generatedImages: [...prev.generatedImages, ...newImages],
              }));
            }
          };
          reader.readAsDataURL(file);
        });
      } else {
        const newImages = Array.from(files)
          .slice(0, 5 - sellFormData.uploadedImages.length)
          .map((file) => {
            return URL.createObjectURL(file);
          });
        setSellFormData((prev) => ({
          ...prev,
          uploadedImages: [...prev.uploadedImages, ...newImages],
        }));
      }
    }
  };

  const removeImage = (index: number) => {
    if (listingType === "buy") {
      setBuyFormData((prev) => ({
        ...prev,
        generatedImages: prev.generatedImages.filter((_, i) => i !== index),
      }));
      if (selectedImageIndex >= buyFormData.generatedImages.length - 1) {
        setSelectedImageIndex(
          Math.max(0, buyFormData.generatedImages.length - 2)
        );
      }
    } else {
      setSellFormData((prev) => ({
        ...prev,
        uploadedImages: prev.uploadedImages.filter((_, i) => i !== index),
      }));
      if (selectedImageIndex >= sellFormData.uploadedImages.length - 1) {
        setSelectedImageIndex(
          Math.max(0, sellFormData.uploadedImages.length - 2)
        );
      }
    }
  };

  // AI Context Gathering handlers
  const handleContextImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (files) {
      const newImages: string[] = [];
      Array.from(files).forEach((file) => {
        const reader = new FileReader();
        reader.onloadend = () => {
          newImages.push(reader.result as string);
          if (newImages.length === files.length) {
            setContextImages((prev) => [...prev, ...newImages]);
          }
        };
        reader.readAsDataURL(file);
      });
    }
  };

  const handleSendMessage = async () => {
    if (!userInput.trim() && contextImages.length === 0) return;

    setIsGeneratingAll(true);

    try {
      // TODO: Call backend API with context (images + text)
      // For now, simulate AI generation
      await new Promise((resolve) => setTimeout(resolve, 2000));

      // Mock data - will be replaced with real API response
      const mockGeneratedData = {
        title: "Sample Product Title",
        description: "This is a generated description based on your input and images.",
        tags: ["electronics", "gadgets"],
        images: contextImages, // Use uploaded images
      };

      // Pre-fill form data
      if (listingType === "buy") {
        setBuyFormData((prev) => ({
          ...prev,
          generatedTitle: mockGeneratedData.title,
          generatedDescription: mockGeneratedData.description,
          generatedImages: mockGeneratedData.images,
          tags: mockGeneratedData.tags,
        }));
      } else {
        setSellFormData((prev) => ({
          ...prev,
          generatedTitle: mockGeneratedData.title,
          generatedDescription: mockGeneratedData.description,
          uploadedImages: mockGeneratedData.images,
          tags: mockGeneratedData.tags,
        }));
      }

      // Mark context as gathered and show the form
      setAiContextGathered(true);
    } catch (error) {
      console.error("Error generating listing:", error);
      alert("Failed to generate listing. Please try again.");
    } finally {
      setIsGeneratingAll(false);
    }
  };

  // Sell-specific: Ownership proof
  const handleVerifyOwnershipProof = async (imageUrl: string) => {
    setIsVerifyingOwnership(true);
    setOwnershipVerified(null);
    const isVerified = await verifyOwnershipProofWithAI(imageUrl);
    setOwnershipVerified(isVerified);
    setIsVerifyingOwnership(false);
  };

  const handleOwnershipProofUpload = (
    e: React.ChangeEvent<HTMLInputElement>
  ) => {
    const file = e.target.files?.[0];
    if (file) {
      const imageUrl = URL.createObjectURL(file);
      setSellFormData((prev) => ({ ...prev, ownershipProofImage: imageUrl }));
      handleVerifyOwnershipProof(imageUrl);
    }
  };

  const fetchPriceRecommendation = async () => {
    if (!listingType) return;
    setRecommendedPriceRange({ min: 0, max: 0, average: 0 });

    try {
      const productName =
        listingType === "buy"
          ? buyFormData.generatedTitle
          : sellFormData.generatedTitle;

      if (!productName) return;

      const response = await axios.post(
        `${process.env.NEXT_PUBLIC_API_URL}/api/v1/ai/product_prices`,
        {
          product_name: productName,
        }
      );

      const prices = response.data;
      // Backend returns: { min_price, max_price, avg_price, price_history }

      setRecommendedPriceRange({
        min: prices.min_price || 0,
        max: prices.max_price || 0,
        average: prices.avg_price || 0,
      });
    } catch (error) {
      console.error("Error fetching product prices:", error);
      alert("Failed to fetch price recommendation.");
    }
  };

  const handleNext = () => {
    if (currentStep < 5) {
      const nextStep = currentStep + 1;
      if (nextStep === 3 && !recommendedPriceRange.average) {
        fetchPriceRecommendation();
      }
      setCurrentStep(nextStep);
    }
  };

  const handleBack = () => {
    if (currentStep > 1) {
      setCurrentStep(currentStep - 1);
    }
  };

  const handleSubmit = async () => {
    if (!listingType) return;

    const formData = listingType === "buy" ? buyFormData : sellFormData;

    // Convert form data to listing format, passing the thread category
    const listingData = convertFormToListing(formData, listingType, category);

    // Generate ID and add to storage
    const listingId = generateListingId(listingData.category);
    const completeListing = { ...listingData, id: listingId };
    addNewListing(completeListing);

    // Call original callbacks if provided
    if (listingType === "buy" && onSubmitBuy) {
      onSubmitBuy(buyFormData);
    } else if (listingType === "sell" && onSubmitSell) {
      onSubmitSell(sellFormData);
    }

    console.log(`${listingType} listing created:`, completeListing);

    // Close modal
    handleClose();

    // Navigate to the new listing
    router.push(`/threads/${listingData.category}/${listingId}`);
  };

  const handleClose = () => {
    // Clear draft FAQs from sessionStorage
    if (typeof window !== "undefined") {
      const storageKey = `faq-generator-question-only-drafts-v1:${window.location.pathname}`;
      sessionStorage.removeItem(storageKey);
    }

    setCurrentStep(1);
    setListingType(null);
    setBuyFormData({
      generatedTitle: "",
      generatedDescription: "",
      generatedImages: [],
      minPrice: "",
      maxPrice: "",
      currency: "MYR",
      location: "",
      quantity: "1",
      shippingOptions: [],
      faqs: [],
      tags: [],
    });
    setSellFormData({
      uploadedImages: [],
      ownershipProofImage: null,
      generatedTitle: "",
      generatedDescription: "",
      minPrice: "",
      maxPrice: "",
      currency: "MYR",
      location: "",
      shippingOptions: [],
      inventoryQuantity: "",
      tags: [],
      faqs: [],
    });
    setRecommendedPriceRange({ min: 0, max: 0, average: 0 });
    setSelectedImageIndex(0);
    setIsAIModeEnabled(false);
    setTitleSuggestion("");
    setDescriptionSuggestion("");
    setOwnershipVerified(true);
    setIsVerifyingOwnership(false);

    // Clear AI context states
    setAiContextGathered(false);
    setUserInput("");
    setContextImages([]);

    onClose();
  };

  const isStepValid = () => {
    if (currentStep === 1) return listingType !== null;

    if (listingType === "buy") {
      switch (currentStep) {
        case 2:
          return (
            buyFormData.generatedTitle.length >= 3 &&
            buyFormData.generatedDescription.length >= 10 &&
            buyFormData.generatedImages.length > 0
          );
        case 3:
          return (
            buyFormData.minPrice &&
            buyFormData.maxPrice &&
            buyFormData.quantity &&
            parseInt(buyFormData.quantity) > 0 &&
            parseFloat(buyFormData.minPrice) <
              parseFloat(buyFormData.maxPrice) &&
            buyFormData.location.length > 0 &&
            buyFormData.shippingOptions.length > 0
          );
        case 4:
          return true;
        case 5:
          return true;
        default:
          return false;
      }
    } else {
      switch (currentStep) {
        case 2:
          return (
            sellFormData.generatedTitle.length >= 3 &&
            sellFormData.generatedDescription.length >= 10 &&
            sellFormData.uploadedImages.length > 0 &&
            sellFormData.ownershipProofImage !== null
          );
        case 3:
          return (
            sellFormData.minPrice &&
            sellFormData.maxPrice &&
            parseFloat(sellFormData.minPrice) <
              parseFloat(sellFormData.maxPrice) &&
            sellFormData.location.length > 0 &&
            sellFormData.shippingOptions.length > 0 &&
            sellFormData.inventoryQuantity &&
            parseInt(sellFormData.inventoryQuantity) > 0
          );
        case 4:
          return true;
        case 5:
          return true;
        default:
          return false;
      }
    }
  };

  if (!isOpen) return null;

  const formData = listingType === "buy" ? buyFormData : sellFormData;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4">
      <div className="relative w-full max-w-5xl max-h-[90vh] bg-white rounded-lg shadow-2xl flex flex-col border border-neutral-200">
        {/* Header */}
        <div className="flex-shrink-0 border-b shadow-sm rounded-t-lg bg-[var(--color-primary-200)]">
          <div className="px-4 py-4 flex items-center justify-between">
            <div className="text-center flex-1">
              <h1 className="font-semibold text-lg text-[var(--color-accent-700)]">
                {listingType === null
                  ? "Create Listing"
                  : listingType === "buy"
                  ? "Create Buy Listing"
                  : "Create Sell Listing"}
              </h1>
              <p className="text-sm text-[var(--color-primary-900)]">
                Step {currentStep} of {steps.length}
              </p>
            </div>
            <Button
              variant="ghost"
              size="icon"
              onClick={handleClose}
              className="absolute right-5 top-5 "
            >
              <X className="w-5 h-5 text-[var(--color-accent-700)]" />
            </Button>
          </div>

          {/* Progress Steps - Only show after listing type is selected */}
          {listingType !== null && (
            <div className="hidden sm:block px-4 pb-4 overflow-x-auto">
              <div className="flex items-center justify-between min-w-max py-2">
                {steps.map((step, index) => {
                  const Icon = step.icon;
                  return (
                    <React.Fragment key={step.number}>
                      <div className="flex flex-col items-center">
                        <div
                          className={`w-12 h-12 rounded-full flex items-center justify-center font-semibold text-sm transition-all ${
                            currentStep > step.number
                              ? "bg-[var(--color-secondary-500)] text-white"
                              : currentStep === step.number
                              ? "bg-[var(--color-secondary-500)] text-white scale-110 shadow-md"
                              : "bg-gray-200 text-gray-500"
                          }`}
                        >
                          {currentStep > step.number ? (
                            <Check className="w-5 h-5" />
                          ) : (
                            <Icon className="w-5 h-5" />
                          )}
                        </div>
                        <span
                          className={`text-xs mt-2 whitespace-nowrap font-medium ${
                            currentStep === step.number
                              ? "text-[var(--color-accent-700)]"
                              : "text-[var(--color-primary-900)]"
                          }`}
                        >
                          {step.label}
                        </span>
                      </div>
                      {index < steps.length - 1 && (
                        <div
                          className={`flex-1 h-1 mx-3 rounded transition-all ${
                            currentStep > step.number
                              ? "bg-[var(--color-secondary-500)]"
                              : "bg-gray-200"
                          }`}
                        />
                      )}
                    </React.Fragment>
                  );
                })}
              </div>
            </div>
          )}
        </div>

        {/* Content */}
        <div key={currentStep} className="flex-1 overflow-y-auto p-8">
          <div className="max-w-3xl mx-auto">
            {/* Step 1: Choose Buy or Sell */}
            {currentStep === 1 && (
              <div className="space-y-4">
                <div className="text-center mb-6">
                  <div className="inline-flex items-center justify-center mb-4">
                    <Image
                      src="/create-listing-illustration.svg"
                      alt="Create Listing"
                      width={128}
                      height={128}
                    />
                  </div>
                  <h2 className="text-3xl font-bold mb-2 text-accent-700">
                    Create Your Listing
                  </h2>
                  <p className="text-base max-w-2xl mx-auto text-accent-500">
                    Choose whether you want to buy or sell
                  </p>
                </div>

                <div className="max-w-4xl mx-auto">
                  <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                    {/* Buy Option */}
                    <div
                      onClick={handleBuySelect}
                      className="group relative cursor-pointer"
                    >
                      <div className="absolute inset-0 bg-primary-gradient rounded-lg opacity-0 group-hover:opacity-15 transition-opacity duration-300"></div>
                      <div className="relative bg-neutral-white rounded-lg p-5 shadow-xl border-2 border-primary-200 group-hover:shadow-2xl hover:border-secondary-400 transition-all duration-300 flex flex-col justify-between h-full">
                        <div className="text-center">
                          <div className="inline-flex items-center justify-center w-12 h-12 rounded-lg mb-3 bg-secondary-100 group-hover:scale-110 transition-transform duration-300">
                            <Package className="w-6 h-6 text-primary-600" />
                          </div>
                          <h2 className="text-xl font-bold mb-2 text-accent-700">
                            I&apos;m Looking to Buy
                          </h2>
                          <p className="text-sm leading-relaxed mb-3 text-accent-500">
                            Set your budget and let sellers compete
                          </p>

                          <div className="space-y-1.5 text-left mb-4 px-4">
                            <div className="flex items-center text-accent-500">
                              <div className="w-1.5 h-1.5 rounded-full mr-2.5 bg-primary-500 flex-shrink-0"></div>
                              <span className="text-sm">
                                Describe what you&apos;re looking for
                              </span>
                            </div>
                            <div className="flex items-center text-accent-500">
                              <div className="w-1.5 h-1.5 rounded-full mr-2.5 bg-primary-500 flex-shrink-0"></div>
                              <span className="text-sm">
                                Set your budget range
                              </span>
                            </div>
                            <div className="flex items-center text-accent-500">
                              <div className="w-1.5 h-1.5 rounded-full mr-2.5 bg-primary-500 flex-shrink-0"></div>
                              <span className="text-sm">
                                Get matched with sellers
                              </span>
                            </div>
                          </div>
                        </div>

                        <div className="text-center">
                          <div className="inline-flex items-center justify-center px-5 py-2.5 rounded-lg text-accent-700 font-semibold text-sm bg-secondary-500 hover:bg-secondary-600 group-hover:scale-105 transition-all duration-300 shadow-lg">
                            Start Buying
                            <Package className="w-4 h-4 ml-2" />
                          </div>
                        </div>
                      </div>
                    </div>

                    {/* Sell Option */}
                    <div
                      onClick={handleSellSelect}
                      className="group relative cursor-pointer"
                    >
                      <div className="absolute inset-0 bg-primary-gradient-reverse rounded-lg opacity-0 group-hover:opacity-15 transition-opacity duration-300"></div>
                      <div className="relative bg-neutral-white rounded-lg p-5 shadow-xl border-2 border-primary-200 group-hover:shadow-2xl hover:border-secondary-400 transition-all duration-300 flex flex-col justify-between h-full">
                        <div className="text-center">
                          <div className="inline-flex items-center justify-center w-12 h-12 rounded-lg mb-3 bg-secondary-100 group-hover:scale-110 transition-transform duration-300">
                            <ShoppingCart className="w-6 h-6 text-primary-600" />
                          </div>
                          <h2 className="text-xl font-bold mb-2 text-accent-700">
                            I Want to Sell
                          </h2>
                          <p className="text-sm leading-relaxed mb-3 text-accent-500">
                            List items and connect with buyers
                          </p>

                          <div className="space-y-1.5 text-left mb-4 px-4">
                            <div className="flex items-center text-accent-500">
                              <div className="w-1.5 h-1.5 rounded-full mr-2.5 bg-primary-500 flex-shrink-0"></div>
                              <span className="text-sm">
                                Upload photos of your item
                              </span>
                            </div>
                            <div className="flex items-center text-accent-500">
                              <div className="w-1.5 h-1.5 rounded-full mr-2.5 bg-primary-500 flex-shrink-0"></div>
                              <span className="text-sm">
                                AI optimizes your listing
                              </span>
                            </div>
                            <div className="flex items-center text-accent-500">
                              <div className="w-1.5 h-1.5 rounded-full mr-2.5 bg-primary-500 flex-shrink-0"></div>
                              <span className="text-sm">
                                Get intelligent price suggestions
                              </span>
                            </div>
                          </div>
                        </div>

                        <div className="text-center">
                          <div className="inline-flex items-center justify-center px-5 py-2.5 rounded-lg text-accent-700 font-semibold text-sm bg-primary-500 hover:bg-primary-600 group-hover:scale-105 transition-all duration-300 shadow-lg">
                            Start Selling
                            <ShoppingCart className="w-4 h-4 ml-2" />
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Bottom Feature Highlight */}
                  <div className="text-center mt-6">
                    <div className="inline-flex items-center justify-center px-5 py-2.5 rounded-full border border-accent-600/20 bg-primary-100/80 shadow-lg backdrop-blur-sm">
                      <Sparkles className="w-4 h-4 mr-2 text-accent-600" />
                      <span className="font-medium text-sm text-accent-700">
                        AI-powered matching ensures fair deals for everyone
                      </span>
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* Step 2: Product Details OR AI Context Gathering */}
            {currentStep === 2 && listingType && (
              <>
                {/* Show AI Context Gathering if AI Mode ON and context not gathered */}
                {isAIModeEnabled && !aiContextGathered ? (
                  <div className="space-y-6">
                    <div className="text-center mb-6">
                      <h2 className="text-2xl font-bold mb-2 text-accent-700">
                        AI-Powered Listing
                      </h2>
                      <p className="text-sm text-accent-500">
                        Provide some details to help generate your {listingType} listing
                      </p>
                    </div>

                    {/* Image Upload Area */}
                    <div>
                      <label className="block text-sm font-medium mb-2 text-accent-700">
                        Product Images
                      </label>
                      <input
                        type="file"
                        accept="image/*"
                        multiple
                        className="hidden"
                        id="context-image-upload"
                        onChange={handleContextImageUpload}
                      />

                      {contextImages.length > 0 ? (
                        <div className="space-y-3">
                          <div className="relative aspect-video rounded-lg overflow-hidden bg-gray-100 border-2 border-[var(--color-primary-200)] group cursor-pointer"
                               onClick={() => document.getElementById('context-image-upload')?.click()}>
                            <Image
                              src={contextImages[selectedImageIndex]}
                              alt={`Context ${selectedImageIndex + 1}`}
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
                                const newImages = contextImages.filter((_, i) => i !== selectedImageIndex);
                                setContextImages(newImages);
                                if (selectedImageIndex >= newImages.length) {
                                  setSelectedImageIndex(Math.max(0, newImages.length - 1));
                                }
                              }}
                              className="absolute top-2 right-2 p-2 bg-red-500 text-white rounded-full hover:bg-red-600 transition-colors z-10"
                            >
                              <Trash2 className="w-4 h-4" />
                            </button>
                          </div>

                          <div className="flex gap-2 overflow-x-auto pb-2">
                            {contextImages.map((img, idx) => (
                              <button
                                key={idx}
                                type="button"
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
                          onClick={() => document.getElementById('context-image-upload')?.click()}
                        >
                          <Upload className="w-16 h-16 mx-auto mb-4 text-[var(--color-primary-500)] group-hover:text-[var(--color-secondary-500)] transition-colors" />
                          <p className="text-[var(--color-primary-900)] mb-2 font-medium">Click to Upload Photos</p>
                          <p className="text-sm text-[var(--color-primary-700)]">Provide images to help generate your listing</p>
                        </div>
                      )}
                    </div>

                    {/* Product Description */}
                    <div>
                      <label className="block text-sm font-medium mb-2 text-accent-700">
                        Tell us about the product
                      </label>
                      <textarea
                        value={userInput}
                        onChange={(e) => setUserInput(e.target.value)}
                        placeholder={`Describe the product you want to ${listingType}...`}
                        rows={4}
                        className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[var(--color-secondary-500)] resize-none"
                      />
                      <p className="text-xs text-gray-500 mt-1">
                        Include details like brand, model, condition, etc.
                      </p>
                    </div>

                    {/* Action Buttons */}
                    <div className="flex gap-3 pt-4">
                      <Button
                        onClick={() => {
                          setIsAIModeEnabled(false);
                          setContextImages([]);
                          setUserInput("");
                        }}
                        variant="outline"
                        className="flex-1"
                      >
                        Exit AI Mode
                      </Button>
                      <Button
                        onClick={handleSendMessage}
                        disabled={!userInput.trim() && contextImages.length === 0}
                        className="flex-1 bg-[var(--color-secondary-500)] hover:bg-[var(--color-secondary-600)] text-black"
                      >
                        <Sparkles className="w-4 h-4 mr-2" />
                        Generate Listing
                      </Button>
                    </div>
                  </div>
                ) : (
                  /* Show normal Product Details form */
                  <ProductDetailsStep
                    listingType={listingType}
                    formData={formData}
                    setFormData={setFormData}
                    isAIModeEnabled={isAIModeEnabled}
                    setIsAIModeEnabled={setIsAIModeEnabled}
                    isGeneratingTitle={isGeneratingTitle}
                    isGeneratingDescription={isGeneratingDescription}
                    isGeneratingPhotos={isGeneratingPhotos}
                    isGeneratingAll={isGeneratingAll}
                    titleSuggestion={titleSuggestion}
                    descriptionSuggestion={descriptionSuggestion}
                    selectedImageIndex={selectedImageIndex}
                    setSelectedImageIndex={setSelectedImageIndex}
                    onGenerateTitle={generateTitleWithAI}
                    onGenerateDescription={generateDescriptionWithAI}
                    onGeneratePhotos={generatePhotosWithAI}
                    onGenerateAll={generateAllWithAI}
                    onTitleChange={generateTitleSuggestion}
                    onDescriptionChange={generateDescriptionSuggestion}
                    onImageUpload={handleImageUpload}
                    onRemoveImage={removeImage}
                    onOwnershipProofUpload={
                      listingType === "sell"
                        ? handleOwnershipProofUpload
                        : undefined
                    }
                    ownershipProofImage={
                      listingType === "sell"
                        ? sellFormData.ownershipProofImage
                        : undefined
                    }
                    isVerifyingOwnership={
                      listingType === "sell" ? isVerifyingOwnership : undefined
                    }
                    ownershipVerified={
                      listingType === "sell" ? ownershipVerified : undefined
                    }
                    tagGeneratorRef={tagGeneratorRef}
                  />
                )}
              </>
            )}

            {/* Step 3: Pricing & Shipping */}
            {currentStep === 3 && listingType && (
              <PricingShippingStep
                listingType={listingType}
                formData={formData}
                setFormData={setFormData}
                recommendedPriceRange={recommendedPriceRange}
                showLocationDropdown={showLocationDropdown}
                setShowLocationDropdown={setShowLocationDropdown}
                filteredLocations={filteredLocations}
                setFilteredLocations={setFilteredLocations}
                selectedLocationIndex={selectedLocationIndex}
                setSelectedLocationIndex={setSelectedLocationIndex}
                showCurrencyDropdown={showCurrencyDropdown}
                setShowCurrencyDropdown={setShowCurrencyDropdown}
                filteredCurrencies={filteredCurrencies}
                setFilteredCurrencies={setFilteredCurrencies}
                selectedCurrencyIndex={selectedCurrencyIndex}
                setSelectedCurrencyIndex={setSelectedCurrencyIndex}
              />
            )}

            {/* Step 4: FAQs */}
            {currentStep === 4 && listingType && (
              <FAQsStep
                listingType={listingType}
                faqs={formData.faqs}
                onFAQsChange={(faqs) =>
                  setFormData((prev) => ({ ...prev, faqs }))
                }
                mockFAQData={
                  listingType === "buy" ? MOCK_FAQ_BUY : MOCK_FAQ_SELL
                }
                hasAnyInput={hasAnyInput()}
              />
            )}

            {/* Step 5: Preview */}
            {currentStep === 5 && listingType && (
              <PreviewStep
                listingType={listingType}
                formData={formData}
                selectedImageIndex={selectedImageIndex}
                setSelectedImageIndex={setSelectedImageIndex}
                onEditStep={setCurrentStep}
                ownershipVerified={
                  listingType === "sell" ? ownershipVerified : undefined
                }
              />
            )}

            {/* Navigation Buttons - Hide on Step 1 (selection page) */}
            {currentStep !== 1 && (
              <div className="flex justify-between items-center mt-8 pt-6 border-t">
                <Button
                  variant="outline"
                  onClick={handleBack}
                  disabled={currentStep === 1}
                  className="px-6"
                >
                  <ChevronLeft className="w-4 h-4 mr-2" />
                  Back
                </Button>

                {currentStep < 5 ? (
                  <Button
                    onClick={handleNext}
                    disabled={!isStepValid()}
                    className="px-6 text-black  hover:bg-[var(--color-secondary-600)] bg-[var(--color-secondary-500)]"
                  >
                    Continue
                    <ChevronRight className="w-4 h-4 ml-2" />
                  </Button>
                ) : (
                  <Button
                    onClick={handleSubmit}
                    disabled={!isStepValid()}
                    className="px-8 bg-green-600 hover:bg-green-700 text-lg font-semibold text-white"
                  >
                    <Check className="w-5 h-5 mr-2" />
                    Publish {listingType === "buy" ? "Buy" : "Sell"} Listing
                  </Button>
                )}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
