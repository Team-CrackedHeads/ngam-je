"""
Cloudinary service for image upload and management.
"""

import cloudinary
import cloudinary.uploader
import cloudinary.api
from typing import Dict, Any, Optional
from fastapi import UploadFile, HTTPException

from src.app.core.config import get_settings


class CloudinaryService:
    """Service for handling image uploads to Cloudinary."""

    def __init__(self):
        """Initialize Cloudinary configuration."""
        settings = get_settings()

        cloudinary.config(
            cloud_name=settings.CLOUDINARY_CLOUD_NAME,
            api_key=settings.CLOUDINARY_API_KEY,
            api_secret=settings.CLOUDINARY_API_SECRET,
            secure=True,  # Use HTTPS URLs
        )

    async def upload_image(
        self, file: UploadFile, folder: str = "listings", public_id: Optional[str] = None
    ) -> Dict[str, Any]:
        """
        Upload an image to Cloudinary.

        Args:
            file: The uploaded file from FastAPI
            folder: Cloudinary folder to organize images (default: "listings")
            public_id: Optional custom public ID for the image

        Returns:
            Dictionary containing:
                - url: Secure URL to access the image
                - public_id: Cloudinary public ID for the image
                - width: Image width in pixels
                - height: Image height in pixels
                - format: Image format (jpg, png, etc.)
                - bytes: File size in bytes

        Raises:
            HTTPException: If upload fails or file type is invalid
        """
        # Validate file type
        allowed_types = ["image/jpeg", "image/png", "image/webp", "image/gif"]
        if file.content_type not in allowed_types:
            raise HTTPException(
                status_code=400,
                detail=f"Invalid file type. Allowed types: {', '.join(allowed_types)}",
            )

        # Validate file size (max 10MB)
        max_size = 10 * 1024 * 1024  # 10MB in bytes
        file_content = await file.read()
        if len(file_content) > max_size:
            raise HTTPException(status_code=400, detail="File too large. Maximum size is 10MB")

        # Reset file pointer
        await file.seek(0)

        try:
            # Upload to Cloudinary
            upload_result = cloudinary.uploader.upload(
                file.file,
                folder=folder,
                public_id=public_id,
                resource_type="image",
                # Transformations
                quality="auto:good",  # Auto quality optimization
                fetch_format="auto",  # Auto format (WebP for supported browsers)
            )

            return {
                "url": upload_result["secure_url"],
                "public_id": upload_result["public_id"],
                "width": upload_result.get("width"),
                "height": upload_result.get("height"),
                "format": upload_result.get("format"),
                "bytes": upload_result.get("bytes"),
            }

        except Exception as e:
            raise HTTPException(status_code=500, detail=f"Failed to upload image: {str(e)}")

    async def delete_image(self, public_id: str) -> bool:
        """
        Delete an image from Cloudinary.

        Args:
            public_id: The Cloudinary public ID of the image to delete

        Returns:
            True if deletion was successful

        Raises:
            HTTPException: If deletion fails
        """
        try:
            result = cloudinary.uploader.destroy(public_id)
            return result.get("result") == "ok"
        except Exception as e:
            raise HTTPException(status_code=500, detail=f"Failed to delete image: {str(e)}")

    async def upload_multiple_images(
        self, files: list[UploadFile], folder: str = "listings"
    ) -> list[Dict[str, Any]]:
        """
        Upload multiple images to Cloudinary.

        Args:
            files: List of uploaded files
            folder: Cloudinary folder to organize images

        Returns:
            List of upload results, each containing url, public_id, etc.
        """
        results = []
        for file in files:
            result = await self.upload_image(file, folder)
            results.append(result)
        return results

    def get_optimized_url(
        self,
        public_id: str,
        width: Optional[int] = None,
        height: Optional[int] = None,
        crop: str = "fill",
    ) -> str:
        """
        Generate an optimized URL for an existing Cloudinary image.

        Args:
            public_id: The Cloudinary public ID
            width: Optional width for resizing
            height: Optional height for resizing
            crop: Crop mode (fill, fit, scale, etc.)

        Returns:
            Optimized image URL
        """
        transformation = {}
        if width:
            transformation["width"] = width
        if height:
            transformation["height"] = height
        if width or height:
            transformation["crop"] = crop

        return cloudinary.CloudinaryImage(public_id).build_url(**transformation)


# Singleton instance
_cloudinary_service: Optional[CloudinaryService] = None


def get_cloudinary_service() -> CloudinaryService:
    """
    Get or create CloudinaryService singleton instance.

    Returns:
        CloudinaryService instance
    """
    global _cloudinary_service
    if _cloudinary_service is None:
        _cloudinary_service = CloudinaryService()
    return _cloudinary_service
