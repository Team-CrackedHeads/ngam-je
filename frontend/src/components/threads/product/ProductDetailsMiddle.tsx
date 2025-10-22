import React from 'react';

interface ProductDetailsMiddleProps {
  galleryImages: string[];
  description: string;
  openModal: (index: number) => void; // Function to open a modal, typically from the parent component
}

const ProductDetailsMiddle: React.FC<ProductDetailsMiddleProps> = ({
  galleryImages,
  description,
  openModal,
}) => {
  // Determine if there are gallery images to display
  const hasGalleryImages = galleryImages && galleryImages.length > 0;

  return (
    <>
      {/* Gallery - Only show if has images */}
      {hasGalleryImages && (
        <div className="mb-6">
          <h3 className="text-lg font-bold text-accent-500">Gallery</h3>
          <div className="flex flex-wrap gap-3 mt-2">
            {galleryImages.map((image, index) => (
              <div
                key={index} // Using index as key. Consider a unique ID if available for better performance/stability with dynamic lists.
                className="w-24 h-24 rounded-lg overflow-hidden border cursor-pointer hover:shadow-lg transition-shadow"
                onClick={() => openModal(index)}
              >
                <img
                  src={image.replace("w=1200", "w=200")} // Adjusting image size for thumbnail
                  alt={`Gallery thumbnail ${index + 1}`}
                  className="w-full h-full object-cover"
                />
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Description */}
      <div className="mb-6">
        <h2 className="text-lg font-bold text-accent-500">Description</h2>
        <p className="mt-2 text-accent-700">{description}</p>
      </div>
    </>
  );
};

export default ProductDetailsMiddle;