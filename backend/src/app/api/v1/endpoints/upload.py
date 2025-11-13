"""
Image upload endpoints using Cloudinary.
"""
from fastapi import APIRouter, Depends, UploadFile, File, HTTPException
from typing import List

from src.app.services.cloudinary_service import get_cloudinary_service, CloudinaryService
from src.app.api.deps import get_current_user
from src.models.user import User

router = APIRouter()


@router.post("/image", summary="Upload a single image")
async def upload_image(
    file: UploadFile = File(..., description="Image file to upload"),
    folder: str = "listings",
    cloudinary_service: CloudinaryService = Depends(get_cloudinary_service),
    current_user: User = Depends(get_current_user),
):
    """
    Upload a single image to Cloudinary.

    - **file**: Image file (JPEG, PNG, WebP, GIF)
    - **folder**: Cloudinary folder (default: "listings")

    Returns the Cloudinary URL and metadata.

    **Authentication required.**
    """
    result = await cloudinary_service.upload_image(file, folder)
    return {
        "success": True,
        "data": result,
        "message": "Image uploaded successfully"
    }


@router.post("/images", summary="Upload multiple images")
async def upload_multiple_images(
    files: List[UploadFile] = File(..., description="Image files to upload"),
    folder: str = "listings",
    cloudinary_service: CloudinaryService = Depends(get_cloudinary_service),
    current_user: User = Depends(get_current_user),
):
    """
    Upload multiple images to Cloudinary.

    - **files**: List of image files (JPEG, PNG, WebP, GIF)
    - **folder**: Cloudinary folder (default: "listings")

    Returns array of Cloudinary URLs and metadata.

    **Authentication required.**
    """
    # Limit to 10 images per request
    if len(files) > 10:
        raise HTTPException(
            status_code=400,
            detail="Cannot upload more than 10 images at once"
        )

    results = await cloudinary_service.upload_multiple_images(files, folder)
    return {
        "success": True,
        "data": results,
        "count": len(results),
        "message": f"Successfully uploaded {len(results)} images"
    }


@router.delete("/image/{public_id:path}", summary="Delete an image")
async def delete_image(
    public_id: str,
    cloudinary_service: CloudinaryService = Depends(get_cloudinary_service),
    current_user: User = Depends(get_current_user),
):
    """
    Delete an image from Cloudinary.

    - **public_id**: Cloudinary public ID (e.g., "listings/abc123")

    **Authentication required.**
    """
    success = await cloudinary_service.delete_image(public_id)

    if success:
        return {
            "success": True,
            "message": "Image deleted successfully"
        }
    else:
        raise HTTPException(
            status_code=500,
            detail="Failed to delete image"
        )
