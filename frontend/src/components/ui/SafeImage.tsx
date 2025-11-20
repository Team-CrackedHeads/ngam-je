"use client";

import { useState } from "react";
import Image from "next/image";
import { ImageOff } from "lucide-react";

interface SafeImageProps {
  src: string;
  alt: string;
  width?: number;
  height?: number;
  fill?: boolean;
  className?: string;
  priority?: boolean;
  sizes?: string;
  quality?: number;
  objectFit?: "contain" | "cover" | "fill" | "none" | "scale-down";
  maxRetries?: number;
}

export default function SafeImage({
  src,
  alt,
  width,
  height,
  fill,
  className = "",
  priority,
  sizes,
  quality,
  objectFit = "cover",
  maxRetries = 3,
}: SafeImageProps) {
  const [error, setError] = useState(false);
  const [retryCount, setRetryCount] = useState(0);
  const [currentSrc, setCurrentSrc] = useState(src);

  // Handle empty or null src
  if (!src || src.trim() === "") {
    return (
      <div
        className={`flex flex-col items-center justify-center bg-neutral-100 w-full h-full ${className}`}
      >
        <ImageOff className="w-8 h-8 text-neutral-400 mb-2" />
        <span className="text-xs text-neutral-500">No Image</span>
      </div>
    );
  }

  const handleError = () => {
    if (retryCount < maxRetries) {
      // Retry loading the image
      setRetryCount(retryCount + 1);
      // Add a cache buster to force retry
      setCurrentSrc(`${src}${src.includes("?") ? "&" : "?"}retry=${retryCount + 1}`);
    } else {
      // Max retries reached, show error
      setError(true);
    }
  };

  const handleLoad = () => {
    // Image loaded successfully, reset retry count
    setRetryCount(0);
  };

  if (error) {
    // Show "Image Not Found" placeholder
    return (
      <div
        className={`flex flex-col items-center justify-center bg-neutral-100 w-full h-full ${className}`}
      >
        <ImageOff className="w-8 h-8 text-neutral-400 mb-2" />
        <span className="text-xs text-neutral-500">Image Not Found</span>
      </div>
    );
  }

  const imageProps: Record<string, unknown> = {
    src: currentSrc,
    alt,
    className,
    onError: handleError,
    onLoad: handleLoad,
  };

  // Only add optional props if they're defined
  if (priority !== undefined) imageProps.priority = priority;
  if (sizes !== undefined) imageProps.sizes = sizes;
  if (quality !== undefined) imageProps.quality = quality;

  if (fill) {
    imageProps.fill = true;
    imageProps.style = { objectFit };
  } else if (width && height) {
    imageProps.width = width;
    imageProps.height = height;
    imageProps.style = { objectFit };
  } else {
    // Fallback: if no dimensions provided, use fill mode
    imageProps.fill = true;
    imageProps.style = { objectFit };
  }

  return <Image {...(imageProps as unknown as React.ComponentProps<typeof Image>)} />;
}
