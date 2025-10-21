// src/app/components/threads-product-ui/ImageGalleryModal.tsx
import Image from "next/image";
import { X, ChevronLeft, ChevronRight } from "lucide-react";

interface ImageGalleryModalProps {
  images: string[];
  currentIndex: number;
  onClose: () => void;
  onNext: () => void;
  onPrev: () => void;
}

export const ImageGalleryModal = ({
  images,
  currentIndex,
  onClose,
  onNext,
  onPrev,
}: ImageGalleryModalProps) => {
  if (images.length === 0) return null;

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black bg-opacity-90 p-4 transition-opacity">
      {/* Close Button */}
      <button
        className="absolute top-4 right-4 p-3 rounded-full bg-white bg-opacity-20 text-gray-800 hover:bg-opacity-40 z-50 transition-colors opacity-50"
        onClick={onClose}
        aria-label="Close image gallery"
      >
        <X className="w-6 h-6" />
      </button>

      {/* Image Container */}
      <div className="relative w-full h-full max-w-6xl max-h-[90vh] flex items-center justify-center">
        {/* Previous Button (Hidden if only one image) */}
        {images.length > 1 && (
          <button
            className="absolute left-0 top-1/2 -translate-y-1/2 ml-4 p-4 rounded-full bg-white bg-opacity-20 text-gray-800 hover:bg-opacity-40 transition-colors z-40 opacity-50"
            onClick={onPrev}
            aria-label="Previous image"
          >
            <ChevronLeft className="w-6 h-6" />
          </button>
        )}

        {/* Current Image */}
        <Image
          src={images[currentIndex]}
          alt={`Gallery image ${currentIndex + 1}`}
          width={1200}
          height={800}
          className="max-w-full max-h-full object-contain rounded-lg shadow-2xl"
        />

        {/* Next Button (Hidden if only one image) */}
        {images.length > 1 && (
          <button
            className="absolute right-0 top-1/2 -translate-y-1/2 mr-4 p-4 rounded-full bg-white bg-opacity-20 text-gray-800 hover:bg-opacity-40 transition-colors z-40 opacity-50"
            onClick={onNext}
            aria-label="Next image"
          >
            <ChevronRight className="w-6 h-6" />
          </button>
        )}
      </div>

      {/* Counter */}
      {images.length > 1 && (
        <div className="absolute bottom-4 left-1/2 transform -translate-x-1/2 px-4 py-2 rounded-full bg-black bg-opacity-50 text-white text-sm font-medium">
          {currentIndex + 1} of {images.length}
        </div>
      )}
    </div>
  );
};
