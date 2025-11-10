"use client";
import React, { useState, useRef } from "react";
import Image from "next/image";
import { X, Upload, Plus } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { useRouter } from "next/navigation";
import { useClerkApiClient } from "@/lib/clerk-api-client";
/* TierBadge Component */
function TierBadge({ tierLevel }: { tierLevel: number }) {
  const tierLabels = ["Tier 0", "Tier 1", "Tier 2", "Tier 3"];
  const tierStyles = [
    { bg: "bg-neutral-300", text: "text-neutral-700" },
    { bg: "bg-primary-400", text: "text-primary-900" },
    { bg: "bg-secondary-400", text: "text-accent-700" },
    { bg: "bg-accent-600", text: "text-neutral-white" },
  ];

  const style = tierStyles[tierLevel];
  return (
    <Badge
      className={`${style.bg} ${style.text} text-xs font-medium px-3 py-1`}
    >
      {tierLabels[tierLevel]}
    </Badge>
  );
}

type CreateThreadModalProps = {
  isOpen: boolean;
  onClose: () => void;
  onThreadCreated?: () => void; // Callback to refresh threads
};

function CreateThreadsSection({ isOpen, onClose, onThreadCreated }: CreateThreadModalProps) {
  const router = useRouter();
  const getApiClient = useClerkApiClient();
  const [imagePreview, setImagePreview] = useState<string | null>(null);
  const [tierLevel] = useState(0);
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [category, setCategory] = useState("");
  const [tags, setTags] = useState<string[]>([]);
  const [tagInput, setTagInput] = useState("");
  const [isPreviewMode, setIsPreviewMode] = useState(false);
  const [_isSubmitting, setIsSubmitting] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  if (!isOpen) return null;

  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => setImagePreview(reader.result as string);
      reader.readAsDataURL(file);
    }
  };

  const handleRemoveImage = () => {
    setImagePreview(null);
    if (fileInputRef.current) fileInputRef.current.value = "";
  };

  const handleAddTag = () => {
    if (tagInput.trim() && !tags.includes(tagInput.trim())) {
      setTags([...tags, tagInput.trim()]);
      setTagInput("");
    }
  };

  const handleRemoveTag = (tagToRemove: string) => {
    setTags(tags.filter((tag) => tag !== tagToRemove));
  };

  const handleTagInputKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Enter" || e.key === ",") {
      e.preventDefault();
      handleAddTag();
    }
  };

  const handleSubmit = async () => {
    if (!title || !description || !category) {
      alert("Please fill in title, description, and category");
      return;
    }

    try {
      setIsSubmitting(true);
      const apiClient = await getApiClient();

      await apiClient.post("/api/v1/threads/", {
        title,
        description,
        image_url: imagePreview,
        category,
        tags,
      });

      // Reset form
      setImagePreview(null);
      setTitle("");
      setDescription("");
      setCategory("");
      setTags([]);
      setTagInput("");
      setIsPreviewMode(false);

      // Refresh threads list
      if (onThreadCreated) {
        onThreadCreated();
      }

      onClose();
    } catch (error) {
      console.error("Failed to create thread:", error);
      alert("Failed to create thread. Please try again.");
    } finally {
      setIsSubmitting(false);
    }
  };

  /* --- Preview Mode before creating the thread --- */
  if (isPreviewMode) {
    return (
      <div className="fixed inset-0 z-50 bg-black/50 flex items-center justify-center p-4">
        <div className="w-full max-w-2xl bg-white rounded-xl shadow-2xl overflow-y-auto">
          <div className="flex items-center justify-between p-6 border-b border-gray-200">
            <h2 className="text-xl font-bold text-gray-800">Preview Thread</h2>
            <button
              onClick={onClose}
              className="text-gray-400 hover:text-gray-600 transition"
            >
              <X className="w-6 h-6" />
            </button>
          </div>

          <div className="p-6 space-y-4">
            {imagePreview && (
              <div className="relative w-full h-48 rounded-lg overflow-hidden">
                <Image
                  src={imagePreview}
                  alt="Preview"
                  fill
                  className="object-cover"
                />
              </div>
            )}

            <div className="flex items-center justify-between">
              <TierBadge tierLevel={tierLevel} />
            </div>

            <div>
              <h3 className="text-lg font-semibold text-gray-800">
                {title || "Untitled Thread"}
              </h3>
            </div>

            <p className="text-gray-600 text-sm whitespace-pre-wrap">
              {description || "No description provided."}
            </p>

            {tags.length > 0 && (
              <div className="flex gap-2 flex-wrap">
                {tags.map((tag, i) => (
                  <Badge
                    key={i}
                    className="bg-[var(--color-secondary-500)] text-black text-xs sm:text-sm flex items-center gap-1"
                  >
                    {tag}
                  </Badge>
                ))}
              </div>
            )}
          </div>

          <div className="flex justify-end gap-3 p-6 border-t border-gray-200">
            <Button variant="outline" onClick={() => setIsPreviewMode(false)}>
              Back to Edit
            </Button>
            <Button
              onClick={handleSubmit}
              className="bg-[var(--color-secondary-500)] hover:bg-[var(--color-secondary-600)] text-neutral-900"
            >
              Confirm & Create Thread
            </Button>
          </div>
        </div>
      </div>
    );
  }

  /* --- Normal Form Mode --- */
  return (
    <div className="fixed inset-0 z-50 bg-black/50 flex items-center justify-center p-4">
      <div className="w-full max-w-2xl bg-white rounded-xl shadow-2xl max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-gray-200">
          <h2 className="text-xl font-bold text-gray-800">Create New Thread</h2>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600 transition"
          >
            <X className="w-6 h-6" />
          </button>
        </div>

        {/* Form */}
        <div className="p-6">
          {/* Image Upload */}
          <div className="mb-6">
            <Label className="text-sm font-medium text-gray-700 mb-2 block">
              Thread Image
            </Label>
            {!imagePreview ? (
              <div
                onClick={() => fileInputRef.current?.click()}
                className="relative w-full h-48 border-2 border-dashed border-gray-300 rounded-lg hover:border-gray-400 transition-colors cursor-pointer bg-gray-50 flex flex-col items-center justify-center"
              >
                <Upload className="w-12 h-12 text-gray-400 mb-2" />
                <p className="text-sm text-gray-500">
                  Click or drag to upload image
                </p>
                <p className="text-xs text-gray-400 mt-1">
                  Recommended: 800x400px
                </p>
                <input
                  ref={fileInputRef}
                  type="file"
                  accept="image/*"
                  onChange={handleImageUpload}
                  className="hidden"
                />
              </div>
            ) : (
              <div className="relative w-full h-48 rounded-lg overflow-hidden">
                <Image
                  src={imagePreview}
                  alt="Preview"
                  fill
                  className="object-cover"
                />
                <Button
                  size="icon"
                  variant="ghost"
                  className="absolute top-3 right-3 bg-black/40 backdrop-blur-sm text-white hover:bg-black/60 rounded-full"
                  onClick={handleRemoveImage}
                  type="button"
                >
                  <X className="w-5 h-5" />
                </Button>
              </div>
            )}
          </div>

          {/* Tier Display */}
          <div className="mb-6">
            <div className="flex items-center mb-3">
              <Label className="flex items-center text-sm font-medium text-gray-700">
                Current Tier Level:
                <span className="ml-2">
                  <TierBadge tierLevel={tierLevel} />
                </span>
              </Label>
            </div>
            <p className="text-xs text-gray-500 mt-3">
              Your thread starts at <strong>Tier 0</strong>. Unlock higher tiers
              and exclusive benefits by exploring the{" "}
              <button
                onClick={() => {
                  console.log("Navigating to Pricing page");
                  onClose();
                  setTimeout(() => router.push("/threads/pricing"), 200);
                }}
                className="text-[var(--color-secondary-500)] font-medium hover:underline bg-transparent border-none p-0 m-0 inline cursor-pointer"
              >
                Pricing
              </button>{" "}
              page.
            </p>
          </div>

          {/* Title */}
          <div className="mb-6">
            <Label
              htmlFor="title"
              className="text-sm font-medium text-gray-700 mb-2 block"
            >
              Thread Title
            </Label>
            <Input
              id="title"
              type="text"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="e.g., High-End PC Building & Overclocking"
              className="w-full text-base"
              maxLength={50}
            />
            <p className="text-xs text-gray-400 mt-1 text-right">
              {title.length}/50 characters
            </p>
          </div>

          {/* Description */}
          <div className="mb-6">
            <Label
              htmlFor="description"
              className="text-sm font-medium text-gray-700 mb-2 block"
            >
              Description
            </Label>
            <Textarea
              id="description"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="Describe what this thread is about..."
              className="w-full text-sm min-h-24"
              maxLength={100}
            />
            <p className="text-xs text-gray-400 mt-1 text-right">
              {description.length}/100 characters
            </p>
          </div>

          {/* Category */}
          <div className="mb-6">
            <Label
              htmlFor="category"
              className="text-sm font-medium text-gray-700 mb-2 block"
            >
              Category
            </Label>
            <Input
              id="category"
              type="text"
              value={category}
              onChange={(e) => setCategory(e.target.value)}
              placeholder="e.g., gaming, fashion, books"
              className="w-full text-base"
            />
            <p className="text-xs text-gray-400 mt-1">
              Choose a category that best describes your thread
            </p>
          </div>

          {/* Tags */}
          <div className="mb-6">
            <Label
              htmlFor="tags"
              className="text-sm font-medium text-gray-700 mb-2 block"
            >
              Tags
            </Label>
            <div className="flex gap-2 mb-3">
              <Input
                id="tags"
                type="text"
                value={tagInput}
                onChange={(e) => setTagInput(e.target.value)}
                onKeyDown={handleTagInputKeyDown}
                placeholder="press Enter to add tags"
                className="flex-1 text-sm"
              />
              <Button
                type="button"
                onClick={handleAddTag}
                variant="outline"
                size="icon"
              >
                <Plus className="w-4 h-4" />
              </Button>
            </div>
            {tags.length > 0 && (
              <div className="flex gap-2 flex-wrap">
                {tags.map((tag, i) => (
                  <Badge
                    key={i}
                    className="bg-[var(--color-secondary-500)] text-black hover:brightness-95 text-xs sm:text-sm whitespace-nowrap flex items-center gap-1"
                  >
                    {tag}
                    <button
                      type="button"
                      onClick={() => handleRemoveTag(tag)}
                      className="ml-1 hover:text-yellow-900"
                    >
                      <X className="w-3 h-3" />
                    </button>
                  </Badge>
                ))}
              </div>
            )}
          </div>

          {/* Action Buttons */}
          <div className="flex gap-3 justify-end pt-4 border-t border-gray-200">
            <Button type="button" variant="outline" onClick={onClose}>
              Cancel
            </Button>
            <Button
              type="button"
              variant="outline"
              onClick={() => setIsPreviewMode(true)}
              className="text-neutral-700 border-[var(--color-secondary-500)] hover:bg-[var(--color-secondary-100)]"
            >
              Preview
            </Button>
            <Button
              type="button"
              onClick={handleSubmit}
              className="bg-[var(--color-secondary-500)] hover:bg-[var(--color-secondary-600)] text-neutral-900"
            >
              Create Thread
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}

export default CreateThreadsSection;