"use client";

import React, { useState, useRef, useCallback, useEffect } from "react";
import Image from "next/image";
import { useRouter } from "next/navigation";
import Masonry, { ResponsiveMasonry } from "react-responsive-masonry";
import {
  Info,
  DollarSign,
  Eye,
  Check,
  ChevronLeft,
  ChevronRight,
  ChevronUp,
  ChevronDown,
  X,
  MessageCircle,
  ShoppingCart,
  Package,
  ListPlus,
  Sparkles,
  Upload,
  Trash2,
  Search,
  Wand2,
  Loader2,
  AlertCircle,
  Clock,
  Shield,
  Wrench,
  CreditCard,
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
import DescriptionEvaluator from "./DescriptionEvaluator";
import { useDescriptionEvaluator } from "@/hooks/use-description-evaluator";
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
  const [uploadedImages, setUploadedImages] = useState<string[]>([]);

  // Description evaluator for AI mode textarea
  const { evaluation, isEvaluating, error: evaluationError, evaluate, reset: resetEvaluation } = useDescriptionEvaluator({
    listingType: listingType || 'buy',
  });
  const [externalImages, setExternalImages] = useState<string[]>([]); // Results from both search AND generate
  const [selectedExternalImages, setSelectedExternalImages] = useState<string[]>([]); // Selected from search/generate (max 3)
  const [isSearchingImages, setIsSearchingImages] = useState(false);
  const [isGeneratingImages, setIsGeneratingImages] = useState(false);
  const [generatedCount, setGeneratedCount] = useState(0); // Track how many times generated (max 3)
  const [imageMode, setImageMode] = useState<'upload' | 'search' | 'generate' | 'upload-proof' | 'search-backgrounds' | 'enhance'>('upload');
  const [imageQuery, setImageQuery] = useState("");

  // Sell-specific image states
  const [backgroundImages, setBackgroundImages] = useState<string[]>([]); // Search results for backgrounds
  const [selectedBackgrounds, setSelectedBackgrounds] = useState<string[]>([]); // Selected backgrounds (max 3)
  const [enhancedImages, setEnhancedImages] = useState<string[]>([]); // Enhanced product images
  const [isEnhancing, setIsEnhancing] = useState(false);
  const [ownershipProofDetails, setOwnershipProofDetails] = useState<{
    detected_name: string | null;
    detected_date: string | null;
    confidence: string;
    issues: string[];
    suggestions: string[];
  } | null>(null);
  const [errorModal, setErrorModal] = useState<{
    isOpen: boolean;
    title: string;
    message: string;
    icon: 'alert' | 'clock' | 'shield' | 'wrench' | 'credit';
  }>({
    isOpen: false,
    title: "",
    message: "",
    icon: 'alert',
  });
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
  const [showDescriptionHints, setShowDescriptionHints] = useState(true);
  const [showEvaluationFeedback, setShowEvaluationFeedback] = useState(true);

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
  const [priceHistory, setPriceHistory] = useState<Array<{ month: string; year: number; price: number }>>([]);
  const [isFetchingPrice, setIsFetchingPrice] = useState(false);
  const [priceRegenerateCount, setPriceRegenerateCount] = useState(0);
  const MAX_PRICE_REGENERATIONS = 3;

  // Reset evaluation state when modal closes or listing type changes
  useEffect(() => {
    if (!isOpen || listingType === null) {
      console.log('🧹 Cleaning up evaluation state (modal closed or no listing type)');
      resetEvaluation();
    }
  }, [isOpen, listingType, resetEvaluation]);

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
    setImageMode('upload');
    setCurrentStep(2);
  };

  const handleSellSelect = () => {
    setListingType("sell");
    setImageMode('upload');
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

  // TODO: Rebuild with simple LLM calls (no agents)
  // AI Generation functions
  const getProductDataFromAI = async () => {
    console.log("AI generation temporarily disabled - will rebuild with simple LLM calls");
    return null;
  };

  const generateTitleWithAI = async () => {
    setIsGeneratingTitle(true);

    try {
      const currentData = listingType === "buy" ? buyFormData : sellFormData;
      const response = await axios.post(
        `${process.env.NEXT_PUBLIC_API_URL}/api/v1/generation/title`,
        {
          context: {
            title: currentData.generatedTitle || "",
            description: currentData.generatedDescription || "",
            tags: currentData.tags || [],
          },
        }
      );

      if (listingType === "buy") {
        setBuyFormData((prev) => ({
          ...prev,
          generatedTitle: response.data.title,
        }));
      } else {
        setSellFormData((prev) => ({
          ...prev,
          generatedTitle: response.data.title,
        }));
      }
    } catch (error) {
      console.error("Error regenerating title:", error);
      alert("Failed to regenerate title. Please try again.");
    } finally {
      setIsGeneratingTitle(false);
    }
  };

  const generateDescriptionWithAI = async () => {
    setIsGeneratingDescription(true);

    try {
      const currentData = listingType === "buy" ? buyFormData : sellFormData;
      const response = await axios.post(
        `${process.env.NEXT_PUBLIC_API_URL}/api/v1/generation/description`,
        {
          context: {
            title: currentData.generatedTitle || "",
            description: currentData.generatedDescription || "",
            tags: currentData.tags || [],
          },
        }
      );

      if (listingType === "buy") {
        setBuyFormData((prev) => ({
          ...prev,
          generatedDescription: response.data.description,
        }));
      } else {
        setSellFormData((prev) => ({
          ...prev,
          generatedDescription: response.data.description,
        }));
      }
    } catch (error) {
      console.error("Error regenerating description:", error);
      alert("Failed to regenerate description. Please try again.");
    } finally {
      setIsGeneratingDescription(false);
    }
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
      const combinedLength = uploadedImages.length + selectedExternalImages.length;
      const remainingSlots = 5 - combinedLength;

      // Only process up to the remaining slots
      const filesToProcess = Array.from(files).slice(0, remainingSlots);

      filesToProcess.forEach((file) => {
        const reader = new FileReader();
        reader.onloadend = () => {
          newImages.push(reader.result as string);
          if (newImages.length === filesToProcess.length) {
            setUploadedImages((prev) => [...prev, ...newImages]);
          }
        };
        reader.readAsDataURL(file);
      });
    }
  };

  const handleSearchImages = async () => {
    if (!imageQuery.trim()) return;

    setIsSearchingImages(true);
    try {
      const response = await axios.get(
        `${process.env.NEXT_PUBLIC_API_URL}/api/v1/unsplash/search`,
        {
          params: {
            query: imageQuery,
            per_page: 30,
          },
          timeout: 30000, // 30 second timeout
        }
      );

      // Extract image URLs from Unsplash response
      const imageUrls = response.data.images.map((img: any) => img.url);
      setExternalImages(imageUrls);
    } catch (error) {
      console.error("Error searching images:", error);

      let errorTitle = "Image Search Failed";
      let errorMessage = "Failed to search images. Please try again.";
      let errorIcon: 'alert' | 'clock' | 'shield' | 'wrench' | 'credit' = 'alert';

      if (axios.isAxiosError(error)) {
        if (error.code === 'ECONNABORTED') {
          errorIcon = 'clock';
          errorTitle = "Request Timeout";
          errorMessage = "The image search is taking too long. Please try again.";
        } else if (error.response?.status === 429) {
          errorIcon = 'clock';
          errorTitle = "Rate Limit Exceeded";
          errorMessage = "Too many search requests. Please wait a moment and try again.";
        } else if (error.response?.status === 503 || error.response?.status === 504) {
          errorIcon = 'wrench';
          errorTitle = "Service Unavailable";
          errorMessage = "The image search service is temporarily unavailable. Please try again in a few moments.";
        } else if (error.response?.data?.detail) {
          errorMessage = error.response.data.detail;
        }
      }

      setErrorModal({
        isOpen: true,
        title: errorTitle,
        message: errorMessage,
        icon: errorIcon,
      });
    } finally {
      setIsSearchingImages(false);
    }
  };

  const handleGenerateImages = async () => {
    if (!imageQuery.trim()) return;
    if (generatedCount >= 3) {
      setErrorModal({
        isOpen: true,
        title: "Generation Limit Reached",
        message: "You can only generate up to 3 images per session. Please use the Search tab to find more images.",
        icon: 'alert',
      });
      return;
    }

    setIsGeneratingImages(true);
    try {
      // Call backend /api/v1/generation/images (text-to-image with Gemini nano banana)
      const response = await axios.post(
        `${process.env.NEXT_PUBLIC_API_URL}/api/v1/generation/images`,
        {
          description: imageQuery,
          num_images: 1, // Generate 1 image at a time
        },
        {
          timeout: 60000, // 60 second timeout
        }
      );

      const generatedImages = response.data.images || []; // Array of base64 data URLs

      if (generatedImages.length === 0) {
        throw new Error("No images were generated");
      }

      // Add to externalImages array at the START (prepend)
      setExternalImages(prev => [...generatedImages, ...prev]);
      setGeneratedCount(prev => prev + generatedImages.length);
    } catch (error) {
      console.error("Error generating images:", error);

      let errorTitle = "Image Generation Failed";
      let errorMessage = "We apologize, but image generation failed. Please try again.";
      let errorIcon: 'alert' | 'clock' | 'shield' | 'wrench' | 'credit' = 'alert';

      if (axios.isAxiosError(error)) {
        if (error.code === 'ECONNABORTED') {
          // Timeout error
          errorIcon = 'clock';
          errorTitle = "Request Timeout";
          errorMessage = "Image generation is taking longer than expected. The AI service might be busy. Please try again in a moment.";
        } else if (error.response?.status === 429) {
          // Rate limit error
          errorIcon = 'clock';
          errorTitle = "High Demand";
          errorMessage = "Our AI service is currently experiencing high demand. Please wait a moment and try again.";
        } else if (error.response?.status === 503 || error.response?.status === 504) {
          // Service unavailable or gateway timeout
          errorIcon = 'wrench';
          errorTitle = "Service Unavailable";
          errorMessage = "The AI image generation service is temporarily unavailable. Please try again in a few moments.";
        } else if (error.response?.data?.detail) {
          // Extract specific error from backend
          const detail = error.response.data.detail;
          if (detail.includes("quota") || detail.includes("RESOURCE_EXHAUSTED")) {
            errorIcon = 'credit';
            errorTitle = "Quota Exceeded";
            errorMessage = "We've reached our daily image generation quota. Please try again later or use the Search tab instead.";
          } else if (detail.includes("safety") || detail.includes("blocked")) {
            errorIcon = 'shield';
            errorTitle = "Content Filtered";
            errorMessage = "This image request was blocked by safety filters. Please try a different description.";
          } else {
            errorMessage = detail;
          }
        }
      } else if (error instanceof Error) {
        errorMessage = error.message;
      }

      setErrorModal({
        isOpen: true,
        title: errorTitle,
        message: errorMessage,
        icon: errorIcon,
      });
    } finally {
      setIsGeneratingImages(false);
    }
  };

  const handleSelectExternalImage = (imageUrl: string) => {
    if (selectedExternalImages.includes(imageUrl)) {
      // Deselect
      setSelectedExternalImages(prev => prev.filter(img => img !== imageUrl));
    } else {
      // Select (max 3 images from search/generate combined)
      if (selectedExternalImages.length < 3) {
        setSelectedExternalImages(prev => [...prev, imageUrl]);
      }
    }
  };

  const handleSendMessage = async () => {
    const allImages = [...selectedExternalImages, ...uploadedImages];

    // Check if at least one image is provided
    if (allImages.length === 0) {
      setErrorModal({
        isOpen: true,
        title: "Image Required",
        message: "Please provide at least one image to generate your listing. You can upload an image or use the Search/Generate tabs to find one.",
        icon: 'alert',
      });
      return;
    }

    // Inform user if generating without text description
    if (!userInput.trim()) {
      setErrorModal({
        isOpen: true,
        title: "Generating from Images Only",
        message: "We'll analyze your images and create a listing for you! Since no description was provided, we'll make our best guess. You can always edit or regenerate the content afterward.",
        icon: 'alert',
      });
      // Continue with generation after showing the message
      await new Promise(resolve => setTimeout(resolve, 100)); // Small delay to show modal
    }

    setIsGeneratingAll(true);

    try {
      // Call backend API to generate listing content
      const response = await axios.post(
        `${process.env.NEXT_PUBLIC_API_URL}/api/v1/generation/listing`,
        {
          images: allImages,
          description: userInput,
          listing_type: listingType,
        }
      );

      const generatedData = response.data;

      // Pre-fill form data
      if (listingType === "buy") {
        setBuyFormData((prev) => ({
          ...prev,
          generatedTitle: generatedData.title,
          generatedDescription: generatedData.description,
          generatedImages: allImages, // Use combined images (searched/generated + uploaded)
          tags: generatedData.tags,
        }));
      } else {
        setSellFormData((prev) => ({
          ...prev,
          generatedTitle: generatedData.title,
          generatedDescription: generatedData.description,
          uploadedImages: allImages,
          tags: generatedData.tags,
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
    setOwnershipProofDetails(null);

    try {
      // Convert to base64 if needed
      let imageDataUrl = imageUrl;
      if (!imageUrl.startsWith('data:')) {
        const response = await fetch(imageUrl);
        const blob = await response.blob();
        const reader = new FileReader();
        imageDataUrl = await new Promise((resolve) => {
          reader.onloadend = () => resolve(reader.result as string);
          reader.readAsDataURL(blob);
        });
      }

      const response = await axios.post(
        `${process.env.NEXT_PUBLIC_API_URL}/api/v1/generation/verify-ownership`,
        {
          image_data_url: imageDataUrl,
          expected_username: null, // TODO: get from user context
        }
      );

      const result = response.data;
      setOwnershipVerified(result.is_verified);
      setOwnershipProofDetails(result);
    } catch (error) {
      console.error("Error verifying ownership:", error);
      setOwnershipVerified(false);
      setOwnershipProofDetails({
        detected_name: null,
        detected_date: null,
        confidence: "low",
        issues: ["Failed to verify ownership proof"],
        suggestions: ["Please try again with a clearer image"],
      });
    } finally {
      setIsVerifyingOwnership(false);
    }
  };

  const handleOwnershipProofUpload = (
    e: React.ChangeEvent<HTMLInputElement>
  ) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        const imageUrl = reader.result as string;
        setSellFormData((prev) => ({ ...prev, ownershipProofImage: imageUrl }));
        handleVerifyOwnershipProof(imageUrl);
      };
      reader.readAsDataURL(file);
    }
  };

  // Search for background images
  const handleSearchBackgrounds = async () => {
    if (!imageQuery.trim()) return;

    setIsSearchingImages(true);
    try {
      const response = await axios.get(
        `${process.env.NEXT_PUBLIC_API_URL}/api/v1/unsplash/search`,
        {
          params: {
            query: imageQuery,
            per_page: 30,
          },
          timeout: 30000,
        }
      );

      const imageUrls = response.data.images.map((img: any) => img.url);
      setBackgroundImages(imageUrls);
    } catch (error) {
      console.error("Error searching backgrounds:", error);
      setErrorModal({
        isOpen: true,
        title: "Background Search Failed",
        message: "Failed to search for background images. Please try again.",
        icon: 'alert',
      });
    } finally {
      setIsSearchingImages(false);
    }
  };

  // Select/deselect background image
  const handleSelectBackground = (imageUrl: string) => {
    if (selectedBackgrounds.includes(imageUrl)) {
      setSelectedBackgrounds(prev => prev.filter(img => img !== imageUrl));
    } else {
      if (selectedBackgrounds.length < 3) {
        setSelectedBackgrounds(prev => [...prev, imageUrl]);
      }
    }
  };

  // Enhance product images with backgrounds
  const handleEnhanceImages = async () => {
    if (sellFormData.uploadedImages.length === 0) {
      setErrorModal({
        isOpen: true,
        title: "No Product Images",
        message: "Please upload at least one product image in the Upload Product Images tab before enhancing.",
        icon: 'alert',
      });
      return;
    }

    if (selectedBackgrounds.length === 0) {
      setErrorModal({
        isOpen: true,
        title: "No Background Selected",
        message: "Please select at least one background from the Search Backgrounds tab.",
        icon: 'alert',
      });
      return;
    }

    setIsEnhancing(true);
    try {
      const response = await axios.post(
        `${process.env.NEXT_PUBLIC_API_URL}/api/v1/generation/batch-enhance-images`,
        {
          product_image_urls: sellFormData.uploadedImages.slice(0, 2), // Max 2 products
          background_image_urls: selectedBackgrounds.slice(0, 3), // Max 3 backgrounds
        },
        {
          timeout: 120000, // 2 minute timeout
        }
      );

      const enhanced = response.data.enhanced_images || [];
      setEnhancedImages(enhanced);

      if (enhanced.length > 0) {
        setErrorModal({
          isOpen: true,
          title: "Enhancement Complete!",
          message: `Successfully created ${enhanced.length} enhanced product images. You can now use these in your listing!`,
          icon: 'alert',
        });
      }
    } catch (error) {
      console.error("Error enhancing images:", error);

      let errorMessage = "Failed to enhance images. Please try again.";
      if (axios.isAxiosError(error)) {
        if (error.code === 'ECONNABORTED') {
          errorMessage = "Enhancement is taking too long. Please try with fewer images.";
        } else if (error.response?.data?.detail) {
          errorMessage = error.response.data.detail;
        }
      }

      setErrorModal({
        isOpen: true,
        title: "Enhancement Failed",
        message: errorMessage,
        icon: 'alert',
      });
    } finally {
      setIsEnhancing(false);
    }
  };

  const fetchPriceRecommendation = async (useCache: boolean = true) => {
    setIsFetchingPrice(true);
    try {
      const currentData = listingType === "buy" ? buyFormData : sellFormData;
      const productTitle = currentData.generatedTitle || "Unknown Product";
      const productDescription = currentData.generatedDescription || "";

      console.log(`💰 Fetching price intelligence for: ${productTitle}${!useCache ? ' (fresh data)' : ''}`);

      const response = await axios.post(
        `${process.env.NEXT_PUBLIC_API_URL}/api/v1/generation/price-intelligence`,
        {
          product_title: productTitle,
          product_description: productDescription,
          listing_type: listingType,
          location: "Malaysia",
          use_cache: useCache,
        }
      );

      const priceData = response.data;
      setRecommendedPriceRange({
        min: priceData.recommended_min || priceData.min,
        max: priceData.recommended_max || priceData.max,
        average: priceData.average,
      });

      // Set price history for the chart
      if (priceData.price_history && priceData.price_history.length > 0) {
        setPriceHistory(priceData.price_history);
      }

      console.log(`✅ Price range: MYR ${priceData.recommended_min}-${priceData.recommended_max}`);
    } catch (error) {
      console.error("Error fetching price recommendation:", error);
      // Set default range on error
      setRecommendedPriceRange({ min: 0, max: 0, average: 0 });
    } finally {
      setIsFetchingPrice(false);
    }
  };

  const handleRegeneratePrices = async () => {
    if (priceRegenerateCount >= MAX_PRICE_REGENERATIONS) {
      alert(`You've reached the maximum of ${MAX_PRICE_REGENERATIONS} price regenerations. Please continue with your listing.`);
      return;
    }

    setPriceRegenerateCount(prev => prev + 1);
    await fetchPriceRecommendation(false); // Don't use cache
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
    setUploadedImages([]);
    setExternalImages([]);
    setSelectedExternalImages([]);

    // Clear sell-specific states
    setBackgroundImages([]);
    setSelectedBackgrounds([]);
    setEnhancedImages([]);
    setOwnershipProofDetails(null);
    setImageMode('upload');

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

  const getErrorIcon = () => {
    switch (errorModal.icon) {
      case 'clock':
        return <Clock className="w-12 h-12 text-orange-500" />;
      case 'shield':
        return <Shield className="w-12 h-12 text-blue-500" />;
      case 'wrench':
        return <Wrench className="w-12 h-12 text-gray-500" />;
      case 'credit':
        return <CreditCard className="w-12 h-12 text-purple-500" />;
      default:
        return <AlertCircle className="w-12 h-12 text-red-500" />;
    }
  };

  return (
    <>
      {/* Error Modal */}
      {errorModal.isOpen && (
        <div className="fixed inset-0 z-[60] flex items-center justify-center bg-black/70 backdrop-blur-sm p-4">
          <div className="bg-white rounded-lg shadow-2xl max-w-md w-full p-6 animate-in fade-in zoom-in duration-200">
            <div className="flex flex-col items-center text-center">
              <div className="mb-4">
                {getErrorIcon()}
              </div>
              <h3 className="text-xl font-bold text-gray-900 mb-2">
                {errorModal.title}
              </h3>
              <p className="text-gray-600 mb-6">
                {errorModal.message}
              </p>
              <Button
                onClick={() => setErrorModal({ ...errorModal, isOpen: false })}
                className="w-full bg-[var(--color-secondary-500)] hover:bg-[var(--color-secondary-600)] text-black"
              >
                Okay
              </Button>
            </div>
          </div>
        </div>
      )}

      {/* Main Modal */}
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

                    {/* Image Section with Tabs */}
                    <div className="space-y-4">
                      <label className="block text-sm font-medium mb-2 text-accent-700">
                        Product Images
                      </label>

                      {/* Tab Buttons */}
                      <div className="flex gap-2 border-b border-gray-200">
                        <button
                          onClick={() => setImageMode('upload')}
                          className={`flex-1 py-2 px-4 text-sm font-medium border-b-2 transition-colors ${
                            imageMode === 'upload'
                              ? 'border-[var(--color-secondary-500)] text-[var(--color-secondary-700)] bg-[var(--color-secondary-50)]'
                              : 'border-transparent text-gray-600 hover:text-gray-900 hover:border-gray-300'
                          }`}
                        >
                          <Upload className="w-4 h-4 inline-block mr-2" />
                          Upload
                        </button>
                        <button
                          onClick={() => setImageMode('search')}
                          className={`flex-1 py-2 px-4 text-sm font-medium border-b-2 transition-colors ${
                            imageMode === 'search'
                              ? 'border-[var(--color-secondary-500)] text-[var(--color-secondary-700)] bg-[var(--color-secondary-50)]'
                              : 'border-transparent text-gray-600 hover:text-gray-900 hover:border-gray-300'
                          }`}
                        >
                          <Search className="w-4 h-4 inline-block mr-2" />
                          {listingType === 'sell' ? 'Search Backgrounds' : 'Search'}
                        </button>
                        <button
                          onClick={() => setImageMode('generate')}
                          className={`flex-1 py-2 px-4 text-sm font-medium border-b-2 transition-colors ${
                            imageMode === 'generate'
                              ? 'border-[var(--color-secondary-500)] text-[var(--color-secondary-700)] bg-[var(--color-secondary-50)]'
                              : 'border-transparent text-gray-600 hover:text-gray-900 hover:border-gray-300'
                          }`}
                        >
                          <Wand2 className="w-4 h-4 inline-block mr-2" />
                          Generate
                        </button>
                      </div>

                      {/* Upload Tab Content */}
                      {imageMode === 'upload' && (
                        <div className={listingType === 'sell' ? 'space-y-4' : ''}>
                          {/* Ownership Proof for Sell Listings */}
                          {listingType === 'sell' && (
                            <div>
                              <label className="block text-sm font-medium mb-2 text-accent-700">
                                Proof of Ownership <span className="text-[var(--color-error-500)]">*</span>
                              </label>
                              <p className="text-xs text-gray-600 mb-2">
                                Upload a photo showing your name and today's date (e.g., written on paper next to the product)
                              </p>

                              <input
                                type="file"
                                accept="image/*"
                                className="hidden"
                                id="ai-ownership-proof-upload"
                                onChange={handleOwnershipProofUpload}
                              />

                              {sellFormData.ownershipProofImage ? (
                                <div className="space-y-3">
                                  <div className="relative aspect-video rounded-lg overflow-hidden border-2 border-[var(--color-primary-200)]">
                                    <Image
                                      src={sellFormData.ownershipProofImage}
                                      alt="Ownership Proof"
                                      fill
                                      className="object-cover"
                                    />
                                    <button
                                      onClick={() => {
                                        setSellFormData(prev => ({ ...prev, ownershipProofImage: null }));
                                        setOwnershipVerified(null);
                                        setOwnershipProofDetails(null);
                                      }}
                                      className="absolute top-2 right-2 p-2 bg-[var(--color-error-500)] text-white rounded-full hover:bg-[var(--color-error-900)] transition-colors"
                                    >
                                      <Trash2 className="w-4 h-4" />
                                    </button>
                                  </div>

                                  {/* Verification Status */}
                                  {isVerifyingOwnership && (
                                    <div className="flex items-center gap-2 text-[var(--color-accent-700)] bg-[var(--color-secondary-50)] border border-[var(--color-secondary-200)] rounded-lg px-4 py-3">
                                      <Loader2 className="w-4 h-4 animate-spin" />
                                      <span className="text-sm font-medium">Verifying ownership proof...</span>
                                    </div>
                                  )}

                                  {!isVerifyingOwnership && ownershipProofDetails && (
                                    <div className={`border rounded-lg px-4 py-3 ${
                                      ownershipVerified
                                        ? 'bg-[var(--color-success-50)] border-[var(--color-success-500)]'
                                        : 'bg-[var(--color-error-50)] border-[var(--color-error-500)]'
                                    }`}>
                                      <div className="flex items-start gap-2 mb-2">
                                        {ownershipVerified ? (
                                          <Check className="w-5 h-5 text-[var(--color-success-500)] flex-shrink-0 mt-0.5" />
                                        ) : (
                                          <AlertCircle className="w-5 h-5 text-[var(--color-error-500)] flex-shrink-0 mt-0.5" />
                                        )}
                                        <div className="flex-1">
                                          <h4 className={`text-sm font-medium mb-1 ${
                                            ownershipVerified ? 'text-[var(--color-success-900)]' : 'text-[var(--color-error-900)]'
                                          }`}>
                                            {ownershipVerified ? 'Ownership Verified!' : 'Verification Failed'}
                                          </h4>
                                          {ownershipProofDetails.detected_name && (
                                            <p className="text-xs text-gray-700 mb-1">
                                              <span className="font-medium">Detected name:</span> {ownershipProofDetails.detected_name}
                                            </p>
                                          )}
                                          {ownershipProofDetails.detected_date && (
                                            <p className="text-xs text-gray-700 mb-1">
                                              <span className="font-medium">Detected date:</span> {ownershipProofDetails.detected_date}
                                            </p>
                                          )}
                                          <p className="text-xs text-gray-700 mb-2">
                                            <span className="font-medium">Confidence:</span> {ownershipProofDetails.confidence}
                                          </p>

                                          {ownershipProofDetails.issues.length > 0 && (
                                            <div className="mb-2">
                                              <p className="text-xs font-medium text-gray-700 mb-1">Issues:</p>
                                              <ul className="text-xs text-gray-600 space-y-0.5">
                                                {ownershipProofDetails.issues.map((issue, idx) => (
                                                  <li key={idx}>• {issue}</li>
                                                ))}
                                              </ul>
                                            </div>
                                          )}

                                          {ownershipProofDetails.suggestions.length > 0 && (
                                            <div>
                                              <p className="text-xs font-medium text-gray-700 mb-1">Suggestions:</p>
                                              <ul className="text-xs text-gray-600 space-y-0.5">
                                                {ownershipProofDetails.suggestions.map((suggestion, idx) => (
                                                  <li key={idx}>• {suggestion}</li>
                                                ))}
                                              </ul>
                                            </div>
                                          )}
                                        </div>
                                      </div>
                                    </div>
                                  )}
                                </div>
                              ) : (
                                <div
                                  className="border-2 border-dashed border-gray-300 rounded-lg p-8 text-center bg-[var(--color-primary-50)] cursor-pointer hover:border-[var(--color-secondary-500)] hover:bg-[var(--color-primary-100)] transition-all group"
                                  onClick={() => document.getElementById('ai-ownership-proof-upload')?.click()}
                                >
                                  <Upload className="w-12 h-12 mx-auto mb-3 text-[var(--color-primary-500)] group-hover:text-[var(--color-secondary-500)] transition-colors" />
                                  <p className="text-[var(--color-primary-900)] mb-1 font-medium">Upload Proof of Ownership</p>
                                  <p className="text-xs text-[var(--color-primary-700)]">Photo with your name and today's date</p>
                                </div>
                              )}
                            </div>
                          )}

                          {/* Product Images */}
                          <div>
                            {listingType === 'sell' && (
                              <label className="block text-sm font-medium mb-2 text-accent-700">
                                Product Photos
                              </label>
                            )}
                            <input
                              type="file"
                              accept="image/*"
                              multiple
                              className="hidden"
                              id="context-image-upload"
                              onChange={handleContextImageUpload}
                            />

                          {(() => {
                            const allImages = [...selectedExternalImages, ...uploadedImages];
                            const remainingSlots = 5 - allImages.length;

                            return allImages.length > 0 ? (
                              <div className="space-y-3">
                                <div className="flex items-center justify-between mb-2">
                                  <span className="text-sm font-medium text-accent-700">
                                    {allImages.length} / 5 images
                                  </span>
                                  {remainingSlots > 0 && (
                                    <span className="text-xs text-gray-600">
                                      {remainingSlots} slot{remainingSlots > 1 ? 's' : ''} remaining
                                    </span>
                                  )}
                                </div>

                                <div className="relative aspect-video rounded-lg overflow-hidden bg-gray-100 border-2 border-[var(--color-primary-200)] group cursor-pointer"
                                     onClick={() => remainingSlots > 0 && document.getElementById('context-image-upload')?.click()}>
                                  <Image
                                    src={allImages[selectedImageIndex]}
                                    alt={`Image ${selectedImageIndex + 1}`}
                                    fill
                                    className="object-cover transition-all group-hover:blur-sm"
                                  />
                                  {remainingSlots > 0 && (
                                    <div className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity flex flex-col items-center justify-center">
                                      <Upload className="w-12 h-12 text-white mb-2" />
                                      <p className="text-white font-medium">Upload More Photos</p>
                                    </div>
                                  )}
                                  <button
                                    onClick={(e) => {
                                      e.stopPropagation();
                                      // Determine if this is an external or uploaded image
                                      if (selectedImageIndex < selectedExternalImages.length) {
                                        // Remove from selectedExternalImages
                                        const newExternalImages = selectedExternalImages.filter((_, i) => i !== selectedImageIndex);
                                        setSelectedExternalImages(newExternalImages);
                                      } else {
                                        // Remove from uploadedImages
                                        const uploadedIndex = selectedImageIndex - selectedExternalImages.length;
                                        const newUploadedImages = uploadedImages.filter((_, i) => i !== uploadedIndex);
                                        setUploadedImages(newUploadedImages);
                                      }
                                      const newLength = allImages.length - 1;
                                      if (selectedImageIndex >= newLength) {
                                        setSelectedImageIndex(Math.max(0, newLength - 1));
                                      }
                                    }}
                                    className="absolute top-2 right-2 p-2 bg-[var(--color-error-500)] text-white rounded-full hover:bg-[var(--color-error-900)] transition-colors z-10"
                                  >
                                    <Trash2 className="w-4 h-4" />
                                  </button>
                                </div>

                                <div className="flex gap-2 overflow-x-auto pb-2">
                                  {allImages.map((img, idx) => (
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
                                <p className="text-sm text-[var(--color-primary-700)]">Or use Search/Generate tabs to find images</p>
                              </div>
                            );
                          })()}
                          </div>
                        </div>
                      )}

                      {/* Search Tab Content */}
                      {imageMode === 'search' && listingType === 'buy' && (
                        <div>
                          <div className="border border-[var(--color-primary-200)] rounded-lg p-4 bg-[var(--color-primary-50)]">
                            <label className="block text-sm font-medium mb-2 text-accent-700">
                              Search for images
                            </label>
                            <div className="flex gap-2">
                              <input
                                type="text"
                                value={imageQuery}
                                onChange={(e) => setImageQuery(e.target.value)}
                                placeholder="e.g., iPhone 15 Pro, Nike Air Max..."
                                className="flex-1 px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[var(--color-secondary-500)]"
                                onKeyPress={(e) => {
                                  if (e.key === 'Enter' && imageQuery.trim()) {
                                    handleSearchImages();
                                  }
                                }}
                              />
                              <Button
                                onClick={handleSearchImages}
                                disabled={!imageQuery.trim() || isSearchingImages}
                                className="bg-[var(--color-secondary-500)] hover:bg-[var(--color-secondary-600)] text-black"
                              >
                                {isSearchingImages ? (
                                  <Loader2 className="w-4 h-4 animate-spin" />
                                ) : (
                                  <Search className="w-4 h-4" />
                                )}
                              </Button>
                            </div>
                          </div>
                        </div>
                      )}

                      {/* Generate Tab Content */}
                      {imageMode === 'generate' && listingType === 'buy' && (
                        <div>
                          <div className="border border-[var(--color-primary-200)] rounded-lg p-4 bg-[var(--color-primary-50)]">
                            <div className="flex items-center justify-between mb-2">
                              <label className="block text-sm font-medium text-accent-700">
                                Describe the image to generate
                              </label>
                              <span className="text-xs text-gray-600">
                                {generatedCount} / 3 generated
                              </span>
                            </div>
                            <div className="flex gap-2">
                              <input
                                type="text"
                                value={imageQuery}
                                onChange={(e) => setImageQuery(e.target.value)}
                                placeholder="e.g., sleek black smartphone with triple camera..."
                                className="flex-1 px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[var(--color-secondary-500)]"
                                onKeyPress={(e) => {
                                  if (e.key === 'Enter' && imageQuery.trim()) {
                                    handleGenerateImages();
                                  }
                                }}
                              />
                              <Button
                                onClick={handleGenerateImages}
                                disabled={!imageQuery.trim() || isGeneratingImages || generatedCount >= 3}
                                className="bg-[var(--color-secondary-500)] hover:bg-[var(--color-secondary-600)] text-black"
                              >
                                {isGeneratingImages ? (
                                  <Loader2 className="w-4 h-4 animate-spin" />
                                ) : (
                                  <Wand2 className="w-4 h-4" />
                                )}
                              </Button>
                            </div>
                          </div>

                          {/* External Images Grid (same array as Search) */}
                          {externalImages.length > 0 && (
                            <div className="border border-[var(--color-primary-200)] rounded-lg bg-white mt-4">
                              <div className="flex items-center justify-between p-4 border-b border-gray-200">
                                <h3 className="text-sm font-medium text-accent-700">
                                  Select up to 3 images ({externalImages.length} found)
                                </h3>
                                <span className="text-xs text-gray-600">
                                  {selectedExternalImages.length} / 3 selected
                                </span>
                              </div>
                              <div className="p-4 max-h-[500px] overflow-y-auto">
                                <ResponsiveMasonry columnsCountBreakPoints={{350: 2, 750: 3, 900: 4}}>
                                  <Masonry gutter="12px">
                                    {externalImages.map((imageUrl, index) => {
                                      const isSelected = selectedExternalImages.includes(imageUrl);
                                      const canSelect = selectedExternalImages.length < 3;
                                      return (
                                        <div
                                          key={index}
                                          onClick={() => handleSelectExternalImage(imageUrl)}
                                          className={`relative rounded-lg overflow-hidden border-2 transition-all ${
                                            isSelected
                                              ? 'border-[var(--color-secondary-500)] ring-2 ring-[var(--color-secondary-500)] cursor-pointer'
                                              : canSelect
                                              ? 'border-gray-200 hover:border-[var(--color-secondary-300)] cursor-pointer'
                                              : 'border-gray-200 opacity-50 cursor-not-allowed'
                                          }`}
                                        >
                                          <img
                                            src={imageUrl}
                                            alt={`Generated ${index + 1}`}
                                            className="w-full h-auto object-cover"
                                          />
                                          {isSelected && (
                                            <div className="absolute inset-0 bg-[var(--color-secondary-500)]/20 flex items-center justify-center">
                                              <div className="bg-[var(--color-secondary-500)] rounded-full p-1">
                                                <Check className="w-4 h-4 text-black" />
                                              </div>
                                            </div>
                                          )}
                                        </div>
                                      );
                                    })}
                                  </Masonry>
                                </ResponsiveMasonry>
                              </div>
                              <div className="p-4 border-t border-gray-200 flex justify-end">
                                <Button
                                  onClick={() => setImageMode('upload')}
                                  disabled={selectedExternalImages.length === 0}
                                  className="bg-[var(--color-secondary-500)] hover:bg-[var(--color-secondary-600)] text-black"
                                >
                                  Done
                                </Button>
                              </div>
                            </div>
                          )}
                        </div>
                      )}

                      {/* Shared: Search Results Grid (only for Search tab) */}
                      {imageMode === 'search' && externalImages.length > 0 && (
                        <div className="border border-[var(--color-primary-200)] rounded-lg bg-white mt-4">
                          <div className="flex items-center justify-between p-4 border-b border-gray-200">
                            <h3 className="text-sm font-medium text-accent-700">
                              Select up to 3 images ({externalImages.length} found)
                            </h3>
                            <span className="text-xs text-gray-600">
                              {selectedExternalImages.length} / 3 selected
                            </span>
                          </div>
                          <div className="p-4 max-h-[500px] overflow-y-auto">
                            <ResponsiveMasonry columnsCountBreakPoints={{350: 2, 750: 3, 900: 4}}>
                              <Masonry gutter="12px">
                                {externalImages.map((imageUrl, index) => {
                                  const isSelected = selectedExternalImages.includes(imageUrl);
                                  const canSelect = selectedExternalImages.length < 3;
                                  return (
                                    <div
                                      key={index}
                                      onClick={() => handleSelectExternalImage(imageUrl)}
                                      className={`relative rounded-lg overflow-hidden border-2 transition-all ${
                                        isSelected
                                          ? 'border-[var(--color-secondary-500)] ring-2 ring-[var(--color-secondary-500)] cursor-pointer'
                                          : canSelect
                                          ? 'border-gray-200 hover:border-[var(--color-secondary-300)] cursor-pointer'
                                          : 'border-gray-200 opacity-50 cursor-not-allowed'
                                      }`}
                                    >
                                      <img
                                        src={imageUrl}
                                        alt={`Search result ${index + 1}`}
                                        className="w-full h-auto object-cover"
                                      />
                                      {isSelected && (
                                        <div className="absolute inset-0 bg-[var(--color-secondary-500)]/20 flex items-center justify-center">
                                          <div className="bg-[var(--color-secondary-500)] rounded-full p-1">
                                            <Check className="w-4 h-4 text-black" />
                                          </div>
                                        </div>
                                      )}
                                    </div>
                                  );
                                })}
                              </Masonry>
                            </ResponsiveMasonry>
                          </div>
                          <div className="p-4 border-t border-gray-200 flex justify-end">
                            <Button
                              onClick={() => setImageMode('upload')}
                              disabled={selectedExternalImages.length === 0}
                              className="bg-[var(--color-secondary-500)] hover:bg-[var(--color-secondary-600)] text-black"
                            >
                              Done
                            </Button>
                          </div>
                        </div>
                      )}

                      {/* SELL LISTING TABS */}

                      {/* Upload Proof Tab Content (Sell) */}
                      {imageMode === 'upload-proof' && listingType === 'sell' && (
                        <div className="space-y-4">
                          {/* Product Images Upload */}
                          <div>
                            <label className="block text-sm font-medium mb-2 text-accent-700">
                              Product Photos <span className="text-[var(--color-error-500)]">*</span>
                            </label>
                            <input
                              type="file"
                              accept="image/*"
                              multiple
                              className="hidden"
                              id="product-images-upload"
                              onChange={handleImageUpload}
                            />

                            {sellFormData.uploadedImages.length > 0 ? (
                              <div className="space-y-3">
                                <div className="flex items-center justify-between mb-2">
                                  <span className="text-sm font-medium text-accent-700">
                                    {sellFormData.uploadedImages.length} / 5 images
                                  </span>
                                  {sellFormData.uploadedImages.length < 5 && (
                                    <span className="text-xs text-gray-600">
                                      {5 - sellFormData.uploadedImages.length} slot{5 - sellFormData.uploadedImages.length > 1 ? 's' : ''} remaining
                                    </span>
                                  )}
                                </div>

                                <div className="relative aspect-video rounded-lg overflow-hidden bg-gray-100 border-2 border-[var(--color-primary-200)] group cursor-pointer"
                                     onClick={() => sellFormData.uploadedImages.length < 5 && document.getElementById('product-images-upload')?.click()}>
                                  <Image
                                    src={sellFormData.uploadedImages[selectedImageIndex]}
                                    alt={`Product ${selectedImageIndex + 1}`}
                                    fill
                                    className="object-cover transition-all group-hover:blur-sm"
                                  />
                                  {sellFormData.uploadedImages.length < 5 && (
                                    <div className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity flex flex-col items-center justify-center">
                                      <Upload className="w-12 h-12 text-white mb-2" />
                                      <p className="text-white font-medium">Upload More Photos</p>
                                    </div>
                                  )}
                                  <button
                                    onClick={(e) => {
                                      e.stopPropagation();
                                      removeImage(selectedImageIndex);
                                    }}
                                    className="absolute top-2 right-2 p-2 bg-[var(--color-error-500)] text-white rounded-full hover:bg-[var(--color-error-900)] transition-colors z-10"
                                  >
                                    <Trash2 className="w-4 h-4" />
                                  </button>
                                </div>

                                <div className="flex gap-2 overflow-x-auto pb-2">
                                  {sellFormData.uploadedImages.map((img, idx) => (
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
                                onClick={() => document.getElementById('product-images-upload')?.click()}
                              >
                                <Upload className="w-16 h-16 mx-auto mb-4 text-[var(--color-primary-500)] group-hover:text-[var(--color-secondary-500)] transition-colors" />
                                <p className="text-[var(--color-primary-900)] mb-2 font-medium">Upload Product Photos</p>
                                <p className="text-sm text-[var(--color-primary-700)]">Up to 5 photos of your product</p>
                              </div>
                            )}
                          </div>

                          {/* Ownership Proof Upload */}
                          <div>
                            <label className="block text-sm font-medium mb-2 text-accent-700">
                              Proof of Ownership <span className="text-[var(--color-error-500)]">*</span>
                            </label>
                            <p className="text-xs text-gray-600 mb-2">
                              Upload a photo showing your name and today's date (e.g., written on paper next to the product)
                            </p>

                            <input
                              type="file"
                              accept="image/*"
                              className="hidden"
                              id="ownership-proof-upload"
                              onChange={handleOwnershipProofUpload}
                            />

                            {sellFormData.ownershipProofImage ? (
                              <div className="space-y-3">
                                <div className="relative aspect-video rounded-lg overflow-hidden border-2 border-[var(--color-primary-200)]">
                                  <Image
                                    src={sellFormData.ownershipProofImage}
                                    alt="Ownership Proof"
                                    fill
                                    className="object-cover"
                                  />
                                  <button
                                    onClick={() => {
                                      setSellFormData(prev => ({ ...prev, ownershipProofImage: null }));
                                      setOwnershipVerified(null);
                                      setOwnershipProofDetails(null);
                                    }}
                                    className="absolute top-2 right-2 p-2 bg-[var(--color-error-500)] text-white rounded-full hover:bg-[var(--color-error-900)] transition-colors"
                                  >
                                    <Trash2 className="w-4 h-4" />
                                  </button>
                                </div>

                                {/* Verification Status */}
                                {isVerifyingOwnership && (
                                  <div className="flex items-center gap-2 text-[var(--color-accent-700)] bg-[var(--color-secondary-50)] border border-[var(--color-secondary-200)] rounded-lg px-4 py-3">
                                    <Loader2 className="w-4 h-4 animate-spin" />
                                    <span className="text-sm font-medium">Verifying ownership proof...</span>
                                  </div>
                                )}

                                {!isVerifyingOwnership && ownershipProofDetails && (
                                  <div className={`border rounded-lg px-4 py-3 ${
                                    ownershipVerified
                                      ? 'bg-[var(--color-success-50)] border-[var(--color-success-500)]'
                                      : 'bg-[var(--color-error-50)] border-[var(--color-error-500)]'
                                  }`}>
                                    <div className="flex items-start gap-2 mb-2">
                                      {ownershipVerified ? (
                                        <Check className="w-5 h-5 text-[var(--color-success-500)] flex-shrink-0 mt-0.5" />
                                      ) : (
                                        <AlertCircle className="w-5 h-5 text-[var(--color-error-500)] flex-shrink-0 mt-0.5" />
                                      )}
                                      <div className="flex-1">
                                        <h4 className={`text-sm font-medium mb-1 ${
                                          ownershipVerified ? 'text-[var(--color-success-900)]' : 'text-[var(--color-error-900)]'
                                        }`}>
                                          {ownershipVerified ? 'Ownership Verified!' : 'Verification Failed'}
                                        </h4>
                                        {ownershipProofDetails.detected_name && (
                                          <p className="text-xs text-gray-700 mb-1">
                                            <span className="font-medium">Detected name:</span> {ownershipProofDetails.detected_name}
                                          </p>
                                        )}
                                        {ownershipProofDetails.detected_date && (
                                          <p className="text-xs text-gray-700 mb-1">
                                            <span className="font-medium">Detected date:</span> {ownershipProofDetails.detected_date}
                                          </p>
                                        )}
                                        <p className="text-xs text-gray-700 mb-2">
                                          <span className="font-medium">Confidence:</span> {ownershipProofDetails.confidence}
                                        </p>

                                        {ownershipProofDetails.issues.length > 0 && (
                                          <div className="mb-2">
                                            <p className="text-xs font-medium text-gray-700 mb-1">Issues:</p>
                                            <ul className="text-xs text-gray-600 space-y-0.5">
                                              {ownershipProofDetails.issues.map((issue, idx) => (
                                                <li key={idx}>• {issue}</li>
                                              ))}
                                            </ul>
                                          </div>
                                        )}

                                        {ownershipProofDetails.suggestions.length > 0 && (
                                          <div>
                                            <p className="text-xs font-medium text-gray-700 mb-1">Suggestions:</p>
                                            <ul className="text-xs text-gray-600 space-y-0.5">
                                              {ownershipProofDetails.suggestions.map((suggestion, idx) => (
                                                <li key={idx}>• {suggestion}</li>
                                              ))}
                                            </ul>
                                          </div>
                                        )}
                                      </div>
                                    </div>
                                  </div>
                                )}
                              </div>
                            ) : (
                              <div
                                className="border-2 border-dashed border-gray-300 rounded-lg p-12 text-center bg-[var(--color-primary-50)] cursor-pointer hover:border-[var(--color-secondary-500)] hover:bg-[var(--color-primary-100)] transition-all group"
                                onClick={() => document.getElementById('ownership-proof-upload')?.click()}
                              >
                                <Upload className="w-16 h-16 mx-auto mb-4 text-[var(--color-primary-500)] group-hover:text-[var(--color-secondary-500)] transition-colors" />
                                <p className="text-[var(--color-primary-900)] mb-2 font-medium">Upload Proof of Ownership</p>
                                <p className="text-sm text-[var(--color-primary-700)]">Photo with your name and today's date</p>
                              </div>
                            )}
                          </div>
                        </div>
                      )}

                      {/* Search Backgrounds Tab Content (Sell) */}
                      {imageMode === 'search-backgrounds' && listingType === 'sell' && (
                        <div>
                          <div className="border border-[var(--color-primary-200)] rounded-lg p-4 bg-[var(--color-primary-50)]">
                            <label className="block text-sm font-medium mb-2 text-accent-700">
                              Search for professional backgrounds
                            </label>
                            <p className="text-xs text-gray-600 mb-3">
                              Find high-quality backgrounds to enhance your product photos
                            </p>
                            <div className="flex gap-2">
                              <input
                                type="text"
                                value={imageQuery}
                                onChange={(e) => setImageQuery(e.target.value)}
                                placeholder="e.g., minimalist white, wooden table, studio lighting..."
                                className="flex-1 px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[var(--color-secondary-500)]"
                                onKeyPress={(e) => {
                                  if (e.key === 'Enter' && imageQuery.trim()) {
                                    handleSearchBackgrounds();
                                  }
                                }}
                              />
                              <Button
                                onClick={handleSearchBackgrounds}
                                disabled={!imageQuery.trim() || isSearchingImages}
                                className="bg-[var(--color-secondary-500)] hover:bg-[var(--color-secondary-600)] text-black"
                              >
                                {isSearchingImages ? (
                                  <Loader2 className="w-4 h-4 animate-spin" />
                                ) : (
                                  <Search className="w-4 h-4" />
                                )}
                              </Button>
                            </div>
                          </div>

                          {backgroundImages.length > 0 && (
                            <div className="border border-[var(--color-primary-200)] rounded-lg bg-white mt-4">
                              <div className="flex items-center justify-between p-4 border-b border-gray-200">
                                <h3 className="text-sm font-medium text-accent-700">
                                  Select up to 3 backgrounds ({backgroundImages.length} found)
                                </h3>
                                <span className="text-xs text-gray-600">
                                  {selectedBackgrounds.length} / 3 selected
                                </span>
                              </div>
                              <div className="p-4 max-h-[500px] overflow-y-auto">
                                <ResponsiveMasonry columnsCountBreakPoints={{350: 2, 750: 3, 900: 4}}>
                                  <Masonry gutter="12px">
                                    {backgroundImages.map((imageUrl, index) => {
                                      const isSelected = selectedBackgrounds.includes(imageUrl);
                                      const canSelect = selectedBackgrounds.length < 3;
                                      return (
                                        <div
                                          key={index}
                                          onClick={() => handleSelectBackground(imageUrl)}
                                          className={`relative rounded-lg overflow-hidden border-2 transition-all ${
                                            isSelected
                                              ? 'border-[var(--color-secondary-500)] ring-2 ring-[var(--color-secondary-500)] cursor-pointer'
                                              : canSelect
                                              ? 'border-gray-200 hover:border-[var(--color-secondary-300)] cursor-pointer'
                                              : 'border-gray-200 opacity-50 cursor-not-allowed'
                                          }`}
                                        >
                                          <img
                                            src={imageUrl}
                                            alt={`Background ${index + 1}`}
                                            className="w-full h-auto object-cover"
                                          />
                                          {isSelected && (
                                            <div className="absolute inset-0 bg-[var(--color-secondary-500)]/20 flex items-center justify-center">
                                              <div className="bg-[var(--color-secondary-500)] rounded-full p-1">
                                                <Check className="w-4 h-4 text-black" />
                                              </div>
                                            </div>
                                          )}
                                        </div>
                                      );
                                    })}
                                  </Masonry>
                                </ResponsiveMasonry>
                              </div>
                            </div>
                          )}
                        </div>
                      )}

                      {/* Enhance Tab Content (Sell) */}
                      {imageMode === 'enhance' && listingType === 'sell' && (
                        <div className="space-y-4">
                          <div className="border border-[var(--color-primary-200)] rounded-lg p-4 bg-[var(--color-primary-50)]">
                            <h3 className="text-sm font-medium mb-2 text-accent-700">
                              Enhance Your Product Photos
                            </h3>
                            <p className="text-xs text-gray-600 mb-3">
                              Combine your product images with professional backgrounds using AI to create stunning product photos.
                            </p>

                            <div className="grid grid-cols-2 gap-4 mb-4 text-sm">
                              <div>
                                <p className="font-medium text-gray-700 mb-1">Product Images:</p>
                                <p className="text-gray-600">{sellFormData.uploadedImages.length} uploaded</p>
                              </div>
                              <div>
                                <p className="font-medium text-gray-700 mb-1">Backgrounds Selected:</p>
                                <p className="text-gray-600">{selectedBackgrounds.length} selected</p>
                              </div>
                            </div>

                            <Button
                              onClick={handleEnhanceImages}
                              disabled={sellFormData.uploadedImages.length === 0 || selectedBackgrounds.length === 0 || isEnhancing}
                              className="w-full bg-[var(--color-secondary-500)] hover:bg-[var(--color-secondary-600)] text-black"
                            >
                              {isEnhancing ? (
                                <>
                                  <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                                  Enhancing Images...
                                </>
                              ) : (
                                <>
                                  <Wand2 className="w-4 h-4 mr-2" />
                                  Enhance Images
                                </>
                              )}
                            </Button>

                            {sellFormData.uploadedImages.length === 0 && (
                              <p className="text-xs text-[var(--color-warning-900)] mt-2">
                                Please upload product images in the "Upload Product Images" tab first.
                              </p>
                            )}
                            {selectedBackgrounds.length === 0 && sellFormData.uploadedImages.length > 0 && (
                              <p className="text-xs text-[var(--color-warning-900)] mt-2">
                                Please select backgrounds in the "Search Backgrounds" tab.
                              </p>
                            )}
                          </div>

                          {/* Enhanced Images Preview */}
                          {enhancedImages.length > 0 && (
                            <div className="border border-[var(--color-primary-200)] rounded-lg bg-white">
                              <div className="p-4 border-b border-gray-200">
                                <h3 className="text-sm font-medium text-accent-700">
                                  Enhanced Images ({enhancedImages.length})
                                </h3>
                                <p className="text-xs text-gray-600 mt-1">
                                  Click on an image to use it in your listing
                                </p>
                              </div>
                              <div className="p-4 max-h-[500px] overflow-y-auto">
                                <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                                  {enhancedImages.map((imageUrl, index) => (
                                    <div
                                      key={index}
                                      onClick={() => {
                                        // Add to uploaded images
                                        if (sellFormData.uploadedImages.length < 5 && !sellFormData.uploadedImages.includes(imageUrl)) {
                                          setSellFormData(prev => ({
                                            ...prev,
                                            uploadedImages: [...prev.uploadedImages, imageUrl]
                                          }));
                                        }
                                      }}
                                      className="relative aspect-square rounded-lg overflow-hidden border-2 border-gray-200 hover:border-[var(--color-secondary-500)] transition-all cursor-pointer group"
                                    >
                                      <img
                                        src={imageUrl}
                                        alt={`Enhanced ${index + 1}`}
                                        className="w-full h-full object-cover"
                                      />
                                      <div className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                                        <p className="text-white text-sm font-medium">Add to Listing</p>
                                      </div>
                                    </div>
                                  ))}
                                </div>
                              </div>
                            </div>
                          )}
                        </div>
                      )}
                    </div>

                    {/* Product Description */}
                    <div>
                      <label className="block text-sm font-medium mb-2 text-accent-700">
                        Tell us about the product
                      </label>
                      <div className="relative">
                        <textarea
                          value={userInput}
                          onChange={(e) => {
                            setUserInput(e.target.value);
                            evaluate(e.target.value);
                          }}
                          placeholder={`Describe the product you want to ${listingType}...`}
                          rows={6}
                          className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[var(--color-secondary-500)] resize-none transition-colors"
                        />
                      </div>

                      {/* Writing Tips & Guidelines and Evaluation Feedback */}
                      <div className="mt-2 space-y-2">
                        {/* Writing Tips & Guidelines */}
                        <div>
                          <button
                            onClick={() => setShowDescriptionHints(!showDescriptionHints)}
                            className="w-full flex items-center justify-between text-xs text-gray-600 font-medium py-2 px-3 rounded-lg hover:bg-gray-50 transition-colors"
                          >
                            <span className="flex items-center gap-1.5">
                              <Info className="w-3.5 h-3.5" />
                              Writing Tips & Guidelines
                            </span>
                            {showDescriptionHints ? (
                              <ChevronUp className="w-4 h-4" />
                            ) : (
                              <ChevronDown className="w-4 h-4" />
                            )}
                          </button>
                          {showDescriptionHints && (
                            <div className="mt-2 px-3 py-2 bg-gray-50 rounded-lg border border-gray-200">
                              <p className="text-xs text-gray-600 font-medium mb-2">
                                For best results, include:
                              </p>
                              <ul className="text-xs text-gray-500 space-y-1">
                                <li className="flex items-start gap-2">
                                  <span className="text-[var(--color-secondary-600)] mt-0.5">•</span>
                                  <span>Brand, model, or specific product name</span>
                                </li>
                                <li className="flex items-start gap-2">
                                  <span className="text-[var(--color-secondary-600)] mt-0.5">•</span>
                                  <span>Condition (new, used, like-new, etc.)</span>
                                </li>
                                <li className="flex items-start gap-2">
                                  <span className="text-[var(--color-secondary-600)] mt-0.5">•</span>
                                  <span>Key features, specifications, or requirements</span>
                                </li>
                                <li className="flex items-start gap-2">
                                  <span className="text-[var(--color-secondary-600)] mt-0.5">•</span>
                                  <span>Any preferences or deal-breakers</span>
                                </li>
                              </ul>
                            </div>
                          )}
                        </div>

                        {/* AI Feedback - Collapsible */}
                        {(evaluation || isEvaluating || evaluationError) && (
                          <div>
                            <button
                              onClick={() => setShowEvaluationFeedback(!showEvaluationFeedback)}
                              className="w-full flex items-center justify-between text-xs text-gray-600 font-medium py-2 px-3 rounded-lg hover:bg-gray-50 transition-colors"
                            >
                              <span className="flex items-center gap-1.5">
                                <Sparkles className="w-3.5 h-3.5" />
                                AI Feedback
                              </span>
                              {showEvaluationFeedback ? (
                                <ChevronUp className="w-4 h-4" />
                              ) : (
                                <ChevronDown className="w-4 h-4" />
                              )}
                            </button>
                            {showEvaluationFeedback && (
                              <div className="mt-2">
                                <DescriptionEvaluator
                                  evaluation={evaluation}
                                  isEvaluating={isEvaluating}
                                  error={evaluationError}
                                />
                              </div>
                            )}
                          </div>
                        )}
                      </div>
                    </div>

                    {/* Action Buttons */}
                    <div className="space-y-2">
                      {selectedExternalImages.length === 0 && uploadedImages.length === 0 && (
                        <div className="flex items-center gap-2 text-xs text-[var(--color-warning-900)] bg-[var(--color-warning-50)] border border-[var(--color-warning-500)] rounded-lg px-3 py-2">
                          <AlertCircle className="w-4 h-4" />
                          <span>Please provide at least one image to generate your listing</span>
                        </div>
                      )}
                      <div className="flex gap-3">
                        <Button
                          onClick={() => {
                            setIsAIModeEnabled(false);
                            setUploadedImages([]);
                            setExternalImages([]);
                            setSelectedExternalImages([]);
                            setGeneratedCount(0);
                            setUserInput("");
                            resetEvaluation();
                          }}
                          variant="outline"
                          className="flex-1"
                        >
                          Exit AI Mode
                        </Button>
                        <Button
                          onClick={handleSendMessage}
                          disabled={selectedExternalImages.length === 0 && uploadedImages.length === 0}
                          className="flex-1 bg-[var(--color-secondary-500)] hover:bg-[var(--color-secondary-600)] text-black disabled:opacity-50"
                        >
                          <Sparkles className="w-4 h-4 mr-2" />
                          Generate Listing
                        </Button>
                      </div>
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
                priceHistory={priceHistory}
                isFetchingPrice={isFetchingPrice}
                onRegeneratePrice={handleRegeneratePrices}
                priceRegenerateCount={priceRegenerateCount}
                maxPriceRegenerations={MAX_PRICE_REGENERATIONS}
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
                    className="px-8 bg-[var(--color-success-500)] hover:bg-[var(--color-success-900)] text-lg font-semibold text-white"
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
    </>
  );
}
